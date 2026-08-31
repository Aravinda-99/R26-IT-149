import { QUIZ_BANK } from "./data.js";
import { ErrorAPI, SchemaMasteryAPI } from "../api/api.js";
import { getCurrentUser } from "../utils/auth.js";

// ── ML API endpoint ────────────────────────────────────────────────────
// Use the Vite proxy path (/api/...) so this always hits the correct
// backend port regardless of what port Flask is running on.
const ML_API_URL = "/api/adaptive/predict";

// ── Default difficulty (can be passed in from quiz lab page) ───────────
let currentDifficulty = "beginner";

export function setQuizDifficulty(level) {
    currentDifficulty = level || "beginner";
}

// ─────────────────────────────────────────────────────────────────────────
// SHUFFLE UTILITIES — Anti-cheating measure
// ─────────────────────────────────────────────────────────────────────────
// Two students sitting in the same room, taking the quiz at the same time,
// would otherwise see identical question order AND identical option order.
// This lets them copy answers by position ("pick option C") without even
// reading the question.
//
// Fix: on every quiz start, build a FRESH shuffled copy of QUIZ_BANK:
//   1. Question ORDER is shuffled (Fisher-Yates)
//   2. Each question's OPTION order is independently shuffled
//   3. correctIndex is remapped to match the new option order
//
// This is done once per setupQuizUI() call and stored in `state`, so
// Previous/Next navigation within one session stays consistent — but
// every new session (including Retry) gets a brand new shuffle.
//
// The original QUIZ_BANK import is NEVER mutated — we build a deep copy
// each time, so this is safe even if multiple quiz instances run at once
// (e.g. two browser tabs on the same machine).
// ─────────────────────────────────────────────────────────────────────────

/**
 * Fisher-Yates shuffle — returns a NEW shuffled array, does not mutate input.
 */
function fisherYatesShuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

/**
 * Builds a fresh shuffled copy of QUIZ_BANK for one quiz session.
 *   - Question order shuffled
 *   - Each question's options shuffled independently
 *   - correctIndex remapped so grading still works correctly
 *   - codeTemplate questions are handled the same way — shuffling the
 *     option list is safe because buildFullCodeFromTemplate() looks up
 *     the option by whatever index the student clicked, not a fixed
 *     position, so the correct answer is still substituted correctly.
 */
function buildShuffledQuizBank() {
    // Step 1: shuffle question order
    const shuffledQuestions = fisherYatesShuffle(QUIZ_BANK);

    // Step 2: shuffle each question's options independently
    return shuffledQuestions.map((q) => {
        // Pair each option with its original index so we can track
        // where the correct answer ends up after shuffling
        const indexedOptions = q.options.map((opt, idx) => ({
            text: opt,
            wasCorrect: idx === q.correctIndex
        }));

        const shuffledOptions = fisherYatesShuffle(indexedOptions);

        // Find the new index of the option that was originally correct
        const newCorrectIndex = shuffledOptions.findIndex(o => o.wasCorrect);

        return {
            ...q,
            options: shuffledOptions.map(o => o.text),
            correctIndex: newCorrectIndex
        };
    });
}

// ── Component 2 telemetry ────────────────────────────────────────────────
// Fill-in-the-blank questions carry a `codeTemplate` with a single
// {BLANK} placeholder. Substituting the student's chosen option in gives
// one complete, real Java snippet — this is what gets sent to Component 2
// (Error Pattern Detector) as live telemetry on every answer.
function buildFullCodeFromTemplate(question, optionIndex) {
    const answer = question.options[optionIndex];
    return question.codeTemplate.replace("{BLANK}", answer);
}

function sendTelemetry(codeString) {
    const user = getCurrentUser();
    const studentId = user?.uid || user?.id;
    if (!studentId || !codeString) return;
    // Fire-and-forget — never blocks quiz interaction on the network call.
    ErrorAPI.analyze({
        student_id: studentId,
        code: codeString,
        pretest_results: { variables: 3, loops: 3, arrays: 3, methods: 3 }
    }).then(res => {
        if (res && res.prediction) {
            sessionStorage.setItem("latest_error_analysis", JSON.stringify(res));
        }
    }).catch(err => console.error("Telemetry error:", err));
}

// Splits a question into { intro, code }
function parseQuestion(text) {
    const m1 = text.match(/^(.+?:\s*)([a-z].+[;{}].*)$/);
    if (m1) return { intro: m1[1].trimEnd(), code: m1[2] };
    const m2 = text.match(/^(.+\?)\s+([a-z].+[;{}].*)$/);
    if (m2) return { intro: m2[1], code: m2[2] };
    const m3 = text.match(/^(.*?)\s+([A-Za-z][\w.]*\(.*\);)\??$/);
    if (m3 && /[().]/.test(m3[2])) return { intro: m3[1] + ':', code: m3[2] };
    return { intro: text, code: null };
}

function splitCodeIntoLines(code) {
    const lines = [];
    let current = '';
    let depth = 0;
    for (let i = 0; i < code.length; i++) {
        const ch = code[i];
        if (ch === '(') depth++;
        else if (ch === ')') depth--;
        current += ch;
        if (ch === ';' && depth === 0 && i + 1 < code.length && code[i + 1] === ' ') {
            lines.push(current.trim());
            current = '';
            i++;
        }
    }
    if (current.trim()) lines.push(current.trim());
    return lines;
}

function looksLikeCode(str) {
    if (/[;{}\[\]]/.test(str)) return true;
    if (/^(int|double|float|long|short|byte|char|boolean|String|static|void|new|array)\b/.test(str)) return true;
    return false;
}

// ── Calculate engagement score from session data ───────────────────────
function calculateEngagementScore(questionRecords) {
    const completed = questionRecords.filter(q => q.completed);
    const total = questionRecords.length;

    if (completed.length === 0) return 0;

    const completionRate = completed.length / total;
    const avgTime = completed.reduce((s, q) => s + q.timeTaken, 0) / completed.length;
    const avgAttempts = completed.reduce((s, q) => s + q.attempts, 0) / completed.length;

    // Time efficiency: 30s is ideal, 600s is max
    const timeEfficiency = Math.max(0, 1 - (avgTime - 30) / 570);

    // Attempt efficiency: 1 attempt is perfect, 10 is worst
    const attemptEfficiency = Math.max(0, 1 - (avgAttempts - 1) / 9);

    // Weighted composite score
    const engagement = (
        completionRate * 0.5 +
        timeEfficiency * 0.3 +
        attemptEfficiency * 0.2
    );

    return Math.min(parseFloat(engagement.toFixed(4)), 1.0);
}

// ── Calculate all session metrics for ML model ─────────────────────────
function calculateSessionMetrics(questionRecords, topicBreakdown) {
    const completed = questionRecords.filter(q => q.completed);

    if (completed.length === 0) {
        return null;
    }

    // avg_attempts — average tries per question
    const avgAttempts = completed.reduce((s, q) => s + q.attempts, 0) / completed.length;

    // avg_time_sec — average seconds per question (cap at 600)
    const avgTimeSec = Math.min(
        completed.reduce((s, q) => s + q.timeTaken, 0) / completed.length,
        600
    );

    // engagement_score — composite 0-1
    const engagementScore = calculateEngagementScore(questionRecords);

    // difficulty encoding
    const difficultyMap = { beginner: 0, intermediate: 1, advanced: 2 };
    const difficultyEnc = difficultyMap[currentDifficulty] || 0;

    // topic_scores — accuracy per topic from existing topicBreakdown
    const topicScores = {};
    Object.entries(topicBreakdown).forEach(([topic, data]) => {
        topicScores[topic.toLowerCase()] = data.total > 0
            ? parseFloat((data.correct / data.total).toFixed(4))
            : 0;
    });

    // Overall accuracy from topic breakdown
    let totalCorrect = 0;
    let totalQuestions = 0;
    Object.values(topicBreakdown).forEach(data => {
        totalCorrect += data.correct;
        totalQuestions += data.total;
    });
    const accuracy = totalQuestions > 0
        ? parseFloat((totalCorrect / totalQuestions).toFixed(4))
        : 0;

    return {
        avg_attempts: parseFloat(avgAttempts.toFixed(2)),
        avg_time_sec: parseFloat(avgTimeSec.toFixed(2)),
        engagement_score: engagementScore,
        difficulty: difficultyEnc,
        current_difficulty: currentDifficulty,
        topic_scores: topicScores,
        accuracy: accuracy
    };
}

// ── Send data to ML model and get recommendation ───────────────────────
async function getMLRecommendation(sessionMetrics) {
    try {
        const response = await fetch(ML_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(sessionMetrics)
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();
        console.log("ML Recommendation:", result);
        return result;

    } catch (error) {
        console.error("ML API call failed:", error);
        return getFallbackRecommendation(sessionMetrics);
    }
}

// ── Fallback if ML API is unreachable ──────────────────────────────────
function getFallbackRecommendation(metrics) {
    const difficultyLevels = ["beginner", "intermediate", "advanced"];
    const currIdx = difficultyLevels.indexOf(metrics.current_difficulty);

    const acc = metrics.accuracy !== undefined
        ? metrics.accuracy
        : Object.values(metrics.topic_scores).reduce((a, b) => a + b, 0)
        / Object.values(metrics.topic_scores).length;

    let action, nextDifficulty;

    if (acc >= 0.80 && metrics.avg_attempts <= 1.5 && metrics.engagement_score >= 0.97) {
        action = "promote";
        nextDifficulty = difficultyLevels[Math.min(currIdx + 1, 2)];
    } else if (acc < 0.40 || metrics.avg_attempts >= 3.0 || metrics.engagement_score < 0.85) {
        action = "demote";
        nextDifficulty = difficultyLevels[Math.max(currIdx - 1, 0)];
    } else {
        action = "maintain";
        nextDifficulty = metrics.current_difficulty;
    }

    const weakest = Object.entries(metrics.topic_scores)
        .sort((a, b) => a[1] - b[1])[0][0];

    return {
        action,
        next_difficulty: nextDifficulty,
        next_topic: weakest,
        confidence: 75.0,
        current: metrics.current_difficulty
    };
}

// ── Build ML recommendation card HTML ──────────────────────────────────
function buildMLRecommendationCard(mlResult, sessionMetrics) {
    const actionColors = {
        promote: { bg: "#F0FDF4", border: "#16A34A", text: "#16A34A", label: "▲ PROMOTE" },
        maintain: { bg: "#FFFBEB", border: "#F59E0B", text: "#B45309", label: "■ MAINTAIN" },
        demote: { bg: "#FEF2F2", border: "#DC2626", text: "#DC2626", label: "▼ DEMOTE" }
    };

    const action = mlResult.action || "maintain";
    const colors = actionColors[action] || actionColors.maintain;

    const topicScores = sessionMetrics.topic_scores;
    const weakestTopic = Object.entries(topicScores)
        .sort((a, b) => a[1] - b[1])[0];

    const nextTopicDisplay = mlResult.next_topic === 'all_mastered'
        ? 'All topics mastered!'
        : `${mlResult.next_topic || weakestTopic[0]}`;
    const nextTopicAccuracy = mlResult.next_topic === 'all_mastered'
        ? ''
        : `(${Math.round((weakestTopic[1] || 0) * 100)}% accuracy)`;

    return `
        <div style="
            background: #FFFFFF;
            border: 1px solid #E2E8F0;
            border-radius: 1rem;
            padding: 1.5rem;
            margin-top: 1.5rem;
        ">
            <!-- Header -->
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:1.2rem;">
                <div style="
                    width:36px; height:36px;
                    background: #DBEAFE;
                    border-radius:10px;
                    display:flex; align-items:center; justify-content:center;
                    font-size:18px;
                ">🤖</div>
                <div>
                    <div style="color:#0F172A; font-weight:600; font-size:1rem;">
                        AI Adaptive Recommendation
                    </div>
                    <div style="color:#475569; font-size:0.75rem;">
                        Powered by Gradient Boosting Classifier
                    </div>
                </div>
                <div style="
                    margin-left:auto;
                    background: #DBEAFE;
                    color: #2563EB;
                    font-size:0.7rem;
                    padding:3px 10px;
                    border-radius:100px;
                    border: 1px solid #BFDBFE;
                ">
                    ${mlResult.confidence || 75}% confident
                </div>
            </div>

            <!-- 3 output tiles -->
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-bottom:1rem;">
                <div style="
                    background:#F8FAFC;
                    border-radius:10px;
                    padding:14px;
                    text-align:center;
                ">
                    <div style="font-size:0.7rem; color:#475569; text-transform:uppercase; letter-spacing:1px; margin-bottom:6px;">
                        Current Level
                    </div>
                    <div style="font-size:1rem; font-weight:600; color:#0F172A; text-transform:capitalize;">
                        ${mlResult.current || currentDifficulty}
                    </div>
                </div>

                <div style="
                    background: ${colors.bg};
                    border: 1px solid ${colors.border};
                    border-radius:10px;
                    padding:14px;
                    text-align:center;
                ">
                    <div style="font-size:0.7rem; color:#475569; text-transform:uppercase; letter-spacing:1px; margin-bottom:6px;">
                        Recommendation
                    </div>
                    <div style="font-size:1rem; font-weight:700; color:${colors.text};">
                        ${colors.label}
                    </div>
                </div>

                <div style="
                    background:#F8FAFC;
                    border-radius:10px;
                    padding:14px;
                    text-align:center;
                ">
                    <div style="font-size:0.7rem; color:#475569; text-transform:uppercase; letter-spacing:1px; margin-bottom:6px;">
                        Next Level
                    </div>
                    <div style="font-size:1rem; font-weight:600; color:#0D9488; text-transform:capitalize;">
                        ${mlResult.next_difficulty || currentDifficulty}
                    </div>
                </div>
            </div>

            <!-- Next topic + reasoning -->
            <div style="
                background: #F8FAFC;
                border-radius:8px;
                padding:12px 14px;
                border-left: 3px solid #2563EB;
                font-size:0.85rem;
                color:#475569;
                line-height:1.6;
            ">
                <strong style="color:#2563EB;">📍 Next focus topic:</strong>
                <strong style="color:#0F172A; text-transform:capitalize;">
                    ${nextTopicDisplay}
                </strong>
                &nbsp;${nextTopicAccuracy}
                <br>
                Based on your ${Math.round(sessionMetrics.accuracy * 100)}% quiz score,
                ${sessionMetrics.avg_attempts} avg attempts,
                ${sessionMetrics.avg_time_sec}s avg response time,
                and ${Math.round(sessionMetrics.engagement_score * 100)}% engagement score.
            </div>

            <!-- Session analytics -->
            <div style="
                display:grid;
                grid-template-columns:1fr 1fr 1fr 1fr 1fr;
                gap:8px;
                margin-top:1rem;
            ">
                ${[
            ["Accuracy", Math.round(sessionMetrics.accuracy * 100) + "%"],
            ["Avg Attempts", sessionMetrics.avg_attempts],
            ["Avg Time", sessionMetrics.avg_time_sec + "s"],
            ["Engagement", Math.round(sessionMetrics.engagement_score * 100) + "%"],
            ["Difficulty", currentDifficulty]
        ].map(([label, val]) => `
                    <div style="
                        background:#F8FAFC;
                        border-radius:8px;
                        padding:10px;
                        text-align:center;
                    ">
                        <div style="font-size:0.65rem; color:#475569; margin-bottom:4px; text-transform:uppercase; letter-spacing:0.5px;">
                            ${label}
                        </div>
                        <div style="font-size:0.95rem; font-weight:600; color:#0F172A;">
                            ${val}
                        </div>
                    </div>
                `).join("")}
            </div>

            <!-- Start next session button -->
            <button id="start-next-session-btn" style="
                width:100%;
                padding:0.85rem;
                margin-top:1.2rem;
                background: linear-gradient(135deg, #2563EB, #0D9488);
                color:#FFFFFF;
                border:none;
                border-radius:0.6rem;
                font-weight:600;
                font-size:0.95rem;
                cursor:pointer;
            ">
                Start ${mlResult.next_difficulty || currentDifficulty} ${mlResult.next_topic === 'all_mastered' ? '' : (mlResult.next_topic || '')} session →
            </button>
        </div>
    `;
}

/**
 * Initialize the quiz UI within a given root element.
 */
export function setupQuizUI(root = document) {
    // ── Build a FRESH shuffled quiz for this session ────────────────────
    // Every call to setupQuizUI() (page load, Retry, new overlay) gets a
    // brand new random shuffle — both question order and option order.
    // This is stored in `state.quizBank` and used everywhere below
    // INSTEAD of the raw QUIZ_BANK import, so two students starting the
    // quiz at the same moment see different question sequences and
    // different option letters for the same underlying question.
    const state = {
        quizBank: buildShuffledQuizBank(),
        current: 0,
        selectedAnswers: [],
        submitted: false,

        // per-question tracking
        questionStartTime: Date.now(),
        currentAttempts: 1,
        questionRecords: [],

        // questions the student has left at least once (used to flag
        // skipped questions in the number tracker)
        visited: {},
    };
    state.selectedAnswers = Array(state.quizBank.length).fill(null);

    const quizBox = (root === document) ? document.getElementById("quiz-box") : root.querySelector(".quiz-box");
    const counter = (root === document) ? document.getElementById("quiz-counter") : root.querySelector(".quiz-counter");
    const progressBar = (root === document) ? document.getElementById("quiz-progress-bar") : root.querySelector(".quiz-progress-bar");
    const prevBtn = (root === document) ? document.getElementById("prev-quiz-btn") : root.querySelector(".prev-quiz-btn");
    const nextBtn = (root === document) ? document.getElementById("next-quiz-btn") : root.querySelector(".next-quiz-btn");
    const navList = (root === document) ? document.getElementById("quiz-nav-list") : root.querySelector(".quiz-nav-list");

    if (!quizBox || !counter || !progressBar || !prevBtn || !nextBtn) return;

    // ── Quiz number tracker (left sidebar) ─────────────────────────────
    // One numbered box per question. The current question's box is
    // highlighted; boxes for answered questions get a subtle marker.
    function buildQuizNav() {
        if (!navList) return;
        navList.innerHTML = "";
        for (let i = 0; i < state.quizBank.length; i++) {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "quiz-nav-item";
            btn.textContent = String(i + 1);
            btn.dataset.index = String(i);
            btn.setAttribute("aria-label", `Go to question ${i + 1}`);
            btn.addEventListener("click", () => {
                if (state.submitted || i === state.current) return;
                recordQuestionData(state.current);
                state.visited[state.current] = true;
                state.current = i;
                renderQuestion();
            });
            navList.appendChild(btn);
        }
    }

    function updateQuizNav() {
        if (!navList) return;
        navList.querySelectorAll(".quiz-nav-item").forEach((btn) => {
            const idx = Number(btn.dataset.index);
            const answered = state.selectedAnswers[idx] !== null;
            // Skipped: student has left this question at least once (or the
            // quiz is submitted) without picking an answer.
            const skipped = !answered && idx !== state.current
                && (state.visited[idx] || state.submitted);
            btn.classList.toggle("is-current", idx === state.current);
            btn.classList.toggle("is-answered", answered);
            btn.classList.toggle("is-skipped", skipped);
        });
    }

    function getScore() {
        return state.selectedAnswers.reduce((acc, ans, i) => {
            return acc + (ans === state.quizBank[i].correctIndex ? 1 : 0);
        }, 0);
    }

    function getTopicBreakdown() {
        const breakdown = {};
        state.quizBank.forEach((q, idx) => {
            if (!breakdown[q.topic]) {
                breakdown[q.topic] = { correct: 0, total: 0 };
            }
            breakdown[q.topic].total++;
            if (state.selectedAnswers[idx] === q.correctIndex) {
                breakdown[q.topic].correct++;
            }
        });
        return breakdown;
    }

    // Record question data when student moves to next question
    function recordQuestionData(questionIndex) {
        const q = state.quizBank[questionIndex];
        const timeTaken = (Date.now() - state.questionStartTime) / 1000;
        const answered = state.selectedAnswers[questionIndex] !== null;
        const correct = state.selectedAnswers[questionIndex] === q.correctIndex;

        const alreadyRecorded = state.questionRecords.find(r => r.questionIndex === questionIndex);
        if (!alreadyRecorded) {
            state.questionRecords.push({
                questionIndex,
                topic: q.topic,
                correct,
                attempts: state.currentAttempts,
                timeTaken: Math.min(parseFloat(timeTaken.toFixed(2)), 600),
                completed: answered
            });
        }
    }

    function renderQuestion() {
        const q = state.quizBank[state.current];
        const selected = state.selectedAnswers[state.current];
        const hasTemplate = Boolean(q.codeTemplate);

        const { intro, code } = hasTemplate
            ? { intro: q.question, code: null }
            : parseQuestion(q.question);
        const codeLines = code ? splitCodeIntoLines(code) : [];
        const templateDisplay = hasTemplate
            ? q.codeTemplate.replace("{BLANK}", '<span class="lp-blank">____</span>')
            : null;

        // Reset timer and attempts for new question
        state.questionStartTime = Date.now();
        state.currentAttempts = 1;

        counter.textContent = `Question ${state.current + 1} of ${state.quizBank.length}`;
        progressBar.style.width = `${((state.current + 1) / state.quizBank.length) * 100}%`;

        quizBox.innerHTML = `
            <article class="lp-question-card">
                <div class="lp-question-meta">
                    <span class="lp-id-tag">Q${state.current + 1}</span>
                </div>
                <h4 class="lp-question">${intro}</h4>
                ${code ? `<pre class="lp-code-block"><code>${codeLines.join('\n')}</code></pre>` : ''}
                ${templateDisplay ? `<pre class="lp-code-block"><code>${templateDisplay}</code></pre>` : ''}
                <div class="lp-options">
                    ${q.options.map((opt, idx) => {
            const isSelected = selected === idx;
            const isCorrect = q.correctIndex === idx;
            const isCode = hasTemplate || looksLikeCode(opt);
            let cls = "lp-option";
            if (isCode) cls += " is-code";
            if (state.submitted) {
                if (isCorrect) cls += " correct";
                else if (isSelected && !isCorrect) cls += " wrong";
            } else if (isSelected) {
                cls += " selected";
            }
            return `
                            <button class="${cls}" data-opt-index="${idx}">
                                <span class="lp-opt-label">${String.fromCharCode(65 + idx)}</span>
                                <span ${isCode ? 'class="lp-opt-code"' : ''}>${opt}</span>
                            </button>
                        `;
        }).join("")}
                </div>
                <div id="quiz-feedback" class="lp-feedback"></div>
            </article>
        `;

        const optionButtons = quizBox.querySelectorAll(".lp-option");
        optionButtons.forEach((btn) => {
            btn.addEventListener("click", () => {
                if (state.submitted) return;

                // Count attempts
                if (state.selectedAnswers[state.current] !== null) {
                    state.currentAttempts++;
                }

                const optionIndex = Number(btn.dataset.optIndex);
                state.selectedAnswers[state.current] = optionIndex;
                renderQuestion();

                // Component 2 telemetry — build the full Java snippet from the
                // student's choice and send it in the background.
                if (q.codeTemplate) {
                    const fullCodeString = buildFullCodeFromTemplate(q, optionIndex);
                    sendTelemetry(fullCodeString);
                }
            });
        });

        prevBtn.disabled = state.current === 0;

        if (state.current === state.quizBank.length - 1) {
            nextBtn.textContent = state.submitted ? "Review Again" : "Submit Quiz";
        } else {
            nextBtn.textContent = "Next";
        }

        updateQuizNav();
    }

    nextBtn.addEventListener("click", async () => {

        // Record current question before moving
        recordQuestionData(state.current);
        state.visited[state.current] = true;

        if (state.current < state.quizBank.length - 1) {
            state.current += 1;
            renderQuestion();
            return;
        }

        if (!state.submitted) {
            state.submitted = true;
            const score = getScore();
            const percent = Math.round((score / state.quizBank.length) * 100);
            const topicBreakdown = getTopicBreakdown();

            const sessionMetrics = calculateSessionMetrics(
                state.questionRecords,
                topicBreakdown
            );

            // 1. Immediately extract all wrong questions and their code snippets
            const wrongCodeQuestions = [];
            state.quizBank.forEach((q, idx) => {
                const ans = state.selectedAnswers[idx];
                if (ans !== null && ans !== q.correctIndex) {
                    let codeSnippet = "";
                    if (q.codeTemplate) {
                        codeSnippet = buildFullCodeFromTemplate(q, ans);
                    } else if (q.options && typeof ans === "number") {
                        codeSnippet = `// ${q.topic} Error\n` + q.options[ans];
                    }
                    const topicLabelMap = {
                        "Variables": "VARIABLE_ERROR",
                        "Loops": "LOOP_ERROR",
                        "Arrays": "ARRAY_ERROR",
                        "Methods": "METHOD_ERROR"
                    };
                    wrongCodeQuestions.push({
                        questionText: q.question,
                        topic: q.topic,
                        label: topicLabelMap[q.topic] || `${(q.topic || "Core").toUpperCase()}_ERROR`,
                        code: codeSnippet,
                        timestamp: new Date().toISOString()
                    });
                }
            });

            // 2. Synchronously write results to both sessionStorage and localStorage
            const resultsPayload = {
                score,
                percent,
                topicBreakdown,
                answeredCount: state.selectedAnswers.filter(a => a !== null).length,
                sessionMetrics,
                wrongCodeQuestions,
                completedAt: new Date().toISOString()
            };
            sessionStorage.setItem("quiz-results", JSON.stringify(resultsPayload));
            localStorage.setItem("latest_quiz_results", JSON.stringify(resultsPayload));

            // 3. Render Quiz Result card
            quizBox.innerHTML = `
                <article class="lp-result-card">
                    <h4>Your Quiz Result</h4>
                    <p class="lp-result-score">${score} / ${state.quizBank.length} (${percent}%)</p>
                    <p class="lp-muted-sm">
                        ${percent >= 80 ? "Excellent work! You are mastering the concepts." :
                    percent >= 60 ? "Good progress. Review a few topics and try again." :
                        "Keep going. Repetition builds confidence."}
                    </p>

                    <div id="ml-loading" style="
                        margin-top:1.5rem;
                        padding:1rem;
                        background:#DBEAFE;
                        border-radius:0.8rem;
                        text-align:center;
                        color:#475569;
                        font-size:0.85rem;
                    ">
                        🤖 Analyzing your performance...
                    </div>

                    <div style="display:flex; gap:1rem; margin-top:1.5rem; justify-content:center; flex-wrap:wrap;">
                        <button id="retry-quiz-btn" class="btn btn-secondary" style="margin-top:0;">
                            <i class="fa-solid fa-rotate-right"></i> Retry Pre-Test
                        </button>
                        <button id="view-details-btn" class="btn btn-primary" style="margin-top:0;">
                            <i class="fa-solid fa-arrow-right"></i> Continue to Error Feedback
                        </button>
                    </div>
                </article>
            `;

            progressBar.style.width = "100%";
            counter.textContent = `Completed: ${state.quizBank.length} questions`;
            prevBtn.disabled = true;
            nextBtn.textContent = "Review Again";
            updateQuizNav();

            // 4. Wire buttons immediately
            const retryBtn = quizBox.querySelector("#retry-quiz-btn");
            if (retryBtn) {
                retryBtn.addEventListener("click", () => {
                    state.quizBank = buildShuffledQuizBank();
                    state.current = 0;
                    state.selectedAnswers = Array(state.quizBank.length).fill(null);
                    state.submitted = false;
                    state.questionRecords = [];
                    state.visited = {};
                    buildQuizNav();
                    renderQuestion();
                });
            }

            const viewDetailsBtn = quizBox.querySelector("#view-details-btn");
            if (viewDetailsBtn) {
                viewDetailsBtn.addEventListener("click", () => {
                    window.navigateTo("error-analysis");
                });
            }

            // 5. Save student progress
            const user = getCurrentUser();
            const studentId = user?.uid || user?.id;
            if (studentId) {
                let weakConcept = "Arrays";
                let minScore = 999;
                Object.entries(topicBreakdown).forEach(([topic, data]) => {
                    const acc = data.total > 0 ? (data.correct / data.total) : 0;
                    if (acc < minScore) {
                        minScore = acc;
                        weakConcept = topic;
                    }
                });

                const existingProgress = JSON.parse(localStorage.getItem(`cq_progress_${studentId}`) || "{}");
                const progress = {
                    ...existingProgress,
                    preTestCompleted: true,
                    currentStep: Math.max(existingProgress.currentStep || 1, 2),
                    quizScore: score,
                    totalQuestions: state.quizBank.length,
                    percent: percent,
                    targetConcept: weakConcept,
                    completedAt: new Date().toISOString()
                };
                localStorage.setItem(`cq_progress_${studentId}`, JSON.stringify(progress));

                SchemaMasteryAPI.saveComponent1({
                    student_id: studentId,
                    student_name: user?.displayName || user?.name || "Learner",
                    student_email: user?.email || "",
                    concept_name: weakConcept,
                    weak_concept: weakConcept,
                    pre_test_score: percent / 100.0,
                    attempt_count: 1,
                    time_taken_seconds: Math.round((sessionMetrics?.avg_time_sec || 5.0) * state.quizBank.length)
                }).catch(err => console.warn("Failed to persist Component 1 learning session:", err));

                const topicLabelMap = {
                    "Variables": "VARIABLE_ERROR",
                    "Loops": "LOOP_ERROR",
                    "Arrays": "ARRAY_ERROR",
                    "Methods": "METHOD_ERROR"
                };
                const topErrorKey = topicLabelMap[weakConcept] || (weakConcept ? `${weakConcept.toUpperCase()}_ERROR` : "VARIABLE_ERROR");
                ErrorAPI.saveTopMisconception({
                    student_id: studentId,
                    top_misconception: topErrorKey,
                    concept: weakConcept || "General",
                    total_errors: state.quizBank.length - score,
                    topic_breakdown: topicBreakdown,
                    accuracy_pct: percent,
                    source: "pre_test_submission"
                }).catch(err => console.warn("Failed to persist Top Misconception to Error Detector database:", err));
            }

            // 6. Async ML Recommendation in background
            const mlLoading = quizBox.querySelector("#ml-loading");
            if (sessionMetrics) {
                getMLRecommendation(sessionMetrics).then(mlResult => {
                    if (mlResult) {
                        resultsPayload.mlResult = mlResult;
                        sessionStorage.setItem("quiz-results", JSON.stringify(resultsPayload));
                        localStorage.setItem("latest_quiz_results", JSON.stringify(resultsPayload));
                        if (mlLoading) {
                            mlLoading.outerHTML = buildMLRecommendationCard(mlResult, sessionMetrics);
                            const nextSessionBtn = quizBox.querySelector("#start-next-session-btn");
                            if (nextSessionBtn) {
                                nextSessionBtn.addEventListener("click", () => {
                                    sessionStorage.setItem("ml-recommendation", JSON.stringify(mlResult));
                                    window.navigateTo("error-analysis");
                                });
                            }
                        }
                    } else if (mlLoading) {
                        mlLoading.style.display = "none";
                    }
                }).catch(() => {
                    if (mlLoading) mlLoading.style.display = "none";
                });
            } else if (mlLoading) {
                mlLoading.style.display = "none";
            }

            return;
        }

        state.current = 0;
        state.submitted = false;
        renderQuestion();
    });

    prevBtn.addEventListener("click", () => {
        if (state.current > 0) {
            state.visited[state.current] = true;
            state.current -= 1;
            renderQuestion();
        }
    });

    buildQuizNav();
    renderQuestion();
}

/**
 * Open quiz details overlay with comprehensive statistics
 */
export function openQuizDetailsOverlay(score, percent, topicBreakdown) {
    const overlay = document.createElement("div");
    overlay.className = "quiz-details-overlay";
    overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:1300;";

    const savedResults = JSON.parse(sessionStorage.getItem("quiz-results") || "{}");
    const mlResult = savedResults.mlResult || null;
    const metrics = savedResults.sessionMetrics || null;

    const topicDetailsHTML = Object.entries(topicBreakdown).map(([topic, data]) => {
        const accuracy = Math.round((data.correct / data.total) * 100);
        const statusColor = accuracy >= 80 ? "#16A34A" : accuracy >= 60 ? "#F59E0B" : "#DC2626";
        return `
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;align-items:center;padding:1rem;background:#F8FAFC;border-radius:0.6rem;margin-bottom:1rem;">
                <div>
                    <div style="font-weight:600;color:#0F172A;margin-bottom:0.3rem;">${topic}</div>
                    <div style="font-size:0.85rem;color:#475569;">${data.correct} of ${data.total} correct</div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:1.5rem;font-weight:700;color:${statusColor};">${accuracy}%</div>
                </div>
            </div>
        `;
    }).join("");

    const mlHTML = mlResult && metrics ? `
        <div style="margin-top:2rem;">
            <h3 style="margin:0 0 1rem 0;color:#0F172A;font-size:1.1rem;">🤖 AI Recommendation</h3>
            ${buildMLRecommendationCard(mlResult, metrics)}
        </div>
    ` : "";

    overlay.innerHTML = `
        <div style="background:#FFFFFF;border:1px solid #E2E8F0;border-radius:1rem;padding:2rem;max-width:600px;width:90%;max-height:80vh;overflow-y:auto;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem;">
                <h2 style="margin:0;color:#0F172A;font-size:1.5rem;">Quiz Results</h2>
                <button id="close-details-btn" style="background:none;border:none;color:#475569;font-size:1.5rem;cursor:pointer;">&times;</button>
            </div>

            <div style="background:linear-gradient(135deg,#2563EB 0%,#0D9488 100%);border-radius:0.8rem;padding:2rem;text-align:center;margin-bottom:2rem;">
                <div style="font-size:0.85rem;color:rgba(255,255,255,0.8);margin-bottom:0.5rem;">Overall Score</div>
                <div style="font-size:3rem;font-weight:800;color:#FFFFFF;margin-bottom:0.5rem;">${score} / ${QUIZ_BANK.length}</div>
                <div style="font-size:1.5rem;font-weight:700;color:#FFFFFF;">${percent}%</div>
            </div>

            <h3 style="margin:0 0 1.5rem 0;color:#0F172A;font-size:1.1rem;">Performance by Topic</h3>
            ${topicDetailsHTML}

            <div style="background:#F8FAFC;border-radius:0.8rem;padding:1.5rem;margin-top:2rem;">
                <h4 style="margin:0 0 1rem 0;color:#0F172A;">Summary</h4>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
                    <div>
                        <div style="font-size:0.85rem;color:#475569;margin-bottom:0.3rem;">Correct</div>
                        <div style="font-size:1.3rem;font-weight:700;color:#16A34A;">${score}</div>
                    </div>
                    <div>
                        <div style="font-size:0.85rem;color:#475569;margin-bottom:0.3rem;">Incorrect</div>
                        <div style="font-size:1.3rem;font-weight:700;color:#DC2626;">${QUIZ_BANK.length - score}</div>
                    </div>
                </div>
            </div>

            ${mlHTML}

            <button id="close-details-footer-btn" style="width:100%;padding:0.8rem;margin-top:2rem;background:#DBEAFE;color:#2563EB;border:1px solid #2563EB;border-radius:0.6rem;font-weight:600;cursor:pointer;">
                Close
            </button>
        </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector("#close-details-btn").addEventListener("click",
        () => overlay.remove());
    overlay.querySelector("#close-details-footer-btn").addEventListener("click",
        () => overlay.remove());
    overlay.addEventListener("click", e => {
        if (e.target === overlay) overlay.remove();
    });
}

/**
 * Open a fullscreen overlay that shows an isolated quiz view.
 */
export function openQuizOverlay() {
    const overlay = document.createElement("div");
    overlay.className = "lp-quiz-overlay";
    overlay.style.cssText = "position:fixed;inset:0;background:rgba(248,250,252,0.97);display:flex;align-items:center;justify-content:center;z-index:1200;";
    overlay.innerHTML = `
        <div class="lp-quiz-overlay-inner card" style="width:min(920px,96%);max-height:92%;overflow:auto;position:relative;background:#FFFFFF;border-color:#E2E8F0;">
            <button class="lp-quiz-overlay-close btn" style="position:absolute;top:12px;right:12px;z-index:2;background:#E2E8F0;color:#0F172A;">Close</button>
            <div style="padding:1rem 1.2rem;">
                <div class="lp-quiz-progress-wrap">
                    <div class="lp-quiz-progress-head" style="display:flex;justify-content:space-between;margin-bottom:8px;">
                        <span class="quiz-counter">Question 1 of 25</span>
                    </div>
                    <div class="lp-progress-track">
                        <div class="quiz-progress-bar lp-progress-bar" style="width:5%;"></div>
                    </div>
                </div>
                <div class="quiz-box" style="margin-top:12px;"></div>
                <div class="lp-quiz-actions" style="display:flex;justify-content:space-between;gap:0.8rem;margin-top:12px;">
                    <button class="btn prev-quiz-btn" style="background:#E2E8F0;color:#0F172A;">Previous</button>
                    <button class="btn btn-primary next-quiz-btn" style="background:#2563EB;">Next</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const inner = overlay.querySelector(".lp-quiz-overlay-inner");
    overlay.querySelector(".lp-quiz-overlay-close").addEventListener(
        "click", () => overlay.remove()
    );

    setupQuizUI(inner);
}