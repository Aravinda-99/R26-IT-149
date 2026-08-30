import { QUIZ_BANK } from "./data.js";
import { ErrorAPI } from "../api/api.js";

// ── ML API endpoint ────────────────────────────────────────────────────
const ML_API_URL = "/api/adaptive/predict";

// ── Default difficulty (can be passed in from quiz lab page) ───────────
let currentDifficulty = "beginner";

export function setQuizDifficulty(level) {
    currentDifficulty = level || "beginner";
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
    // Fire-and-forget — never blocks quiz interaction on the network call.
    ErrorAPI.analyze({
        student_id: "demo_student",
        code: codeString,
        pretest_results: { variables: 3, loops: 3, arrays: 3, methods: 3 } // Mock pre-test context
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
    const completed    = questionRecords.filter(q => q.completed);
    const total        = questionRecords.length;

    if (completed.length === 0) return 0;

    const completionRate    = completed.length / total;
    const avgTime           = completed.reduce((s, q) => s + q.timeTaken, 0) / completed.length;
    const avgAttempts       = completed.reduce((s, q) => s + q.attempts, 0) / completed.length;

    // Time efficiency: 30s is ideal, 600s is max
    const timeEfficiency    = Math.max(0, 1 - (avgTime - 30) / 570);

    // Attempt efficiency: 1 attempt is perfect, 10 is worst
    const attemptEfficiency = Math.max(0, 1 - (avgAttempts - 1) / 9);

    // Weighted composite score
    const engagement = (
        completionRate    * 0.5 +
        timeEfficiency    * 0.3 +
        attemptEfficiency * 0.2
    );

    return Math.min(parseFloat(engagement.toFixed(4)), 1.0);
}

// ── Calculate all session metrics for ML model ─────────────────────────
// CHANGED: Added 'accuracy' field calculated from topicBreakdown
function calculateSessionMetrics(questionRecords, topicBreakdown) {
    const completed  = questionRecords.filter(q => q.completed);

    if (completed.length === 0) {
        return null;
    }

    // avg_attempts — average tries per question
    const avgAttempts = completed.reduce((s, q) => s + q.attempts, 0) / completed.length;

    // avg_time_sec — average seconds per question (cap at 600)
    const avgTimeSec  = Math.min(
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

    // ── NEW: Calculate overall accuracy from topic breakdown ────────
    // This is the student's actual quiz score (e.g., 23/25 = 0.92)
    // Sent to the ML model as the 5th feature so it can see how
    // the student actually performed, not just behavioral signals.
    let totalCorrect = 0;
    let totalQuestions = 0;
    Object.values(topicBreakdown).forEach(data => {
        totalCorrect   += data.correct;
        totalQuestions += data.total;
    });
    const accuracy = totalQuestions > 0
        ? parseFloat((totalCorrect / totalQuestions).toFixed(4))
        : 0;

    return {
        avg_attempts:       parseFloat(avgAttempts.toFixed(2)),
        avg_time_sec:       parseFloat(avgTimeSec.toFixed(2)),
        engagement_score:   engagementScore,
        difficulty:         difficultyEnc,
        current_difficulty: currentDifficulty,
        topic_scores:       topicScores,
        accuracy:           accuracy    // NEW — overall quiz score for ML model
    };
}

// ── Send data to ML model and get recommendation ───────────────────────
async function getMLRecommendation(sessionMetrics) {
    try {
        const response = await fetch(ML_API_URL, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify(sessionMetrics)
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
// CHANGED: Updated fallback to also use accuracy for better rule-based decisions
function getFallbackRecommendation(metrics) {
    const difficultyLevels = ["beginner", "intermediate", "advanced"];
    const currIdx = difficultyLevels.indexOf(metrics.current_difficulty);

    // Use accuracy directly if available, otherwise calculate from topic_scores
    const acc = metrics.accuracy !== undefined
        ? metrics.accuracy
        : Object.values(metrics.topic_scores).reduce((a, b) => a + b, 0)
          / Object.values(metrics.topic_scores).length;

    let action, nextDifficulty;

    if (acc >= 0.80 && metrics.avg_attempts <= 1.5 && metrics.engagement_score >= 0.97) {
        action         = "promote";
        nextDifficulty = difficultyLevels[Math.min(currIdx + 1, 2)];
    } else if (acc < 0.40 || metrics.avg_attempts >= 3.0 || metrics.engagement_score < 0.85) {
        action         = "demote";
        nextDifficulty = difficultyLevels[Math.max(currIdx - 1, 0)];
    } else {
        action         = "maintain";
        nextDifficulty = metrics.current_difficulty;
    }

    const weakest = Object.entries(metrics.topic_scores)
        .sort((a, b) => a[1] - b[1])[0][0];

    return {
        action,
        next_difficulty: nextDifficulty,
        next_topic:      weakest,
        confidence:      75.0,
        current:         metrics.current_difficulty
    };
}

// ── Build ML recommendation card HTML ──────────────────────────────────
// CHANGED: Added accuracy display in the session analytics grid
function buildMLRecommendationCard(mlResult, sessionMetrics) {
    const actionColors = {
        promote:  { bg: "#F0FDF4", border: "#16A34A", text: "#16A34A", label: "▲ PROMOTE" },
        maintain: { bg: "#FFFBEB", border: "#F59E0B", text: "#B45309", label: "■ MAINTAIN" },
        demote:   { bg: "#FEF2F2", border: "#DC2626", text: "#DC2626", label: "▼ DEMOTE" }
    };

    const action = mlResult.action || "maintain";
    const colors = actionColors[action] || actionColors.maintain;

    const topicScores = sessionMetrics.topic_scores;
    const weakestTopic = Object.entries(topicScores)
        .sort((a, b) => a[1] - b[1])[0];

    // Check if next_topic is "all_mastered"
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

            <!-- Session analytics — CHANGED: 5 metrics now including accuracy -->
            <div style="
                display:grid;
                grid-template-columns:1fr 1fr 1fr 1fr 1fr;
                gap:8px;
                margin-top:1rem;
            ">
                ${[
                    ["Accuracy",     Math.round(sessionMetrics.accuracy * 100) + "%"],
                    ["Avg Attempts", sessionMetrics.avg_attempts],
                    ["Avg Time",     sessionMetrics.avg_time_sec + "s"],
                    ["Engagement",   Math.round(sessionMetrics.engagement_score * 100) + "%"],
                    ["Difficulty",   currentDifficulty]
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
    const state = {
        current:         0,
        selectedAnswers: Array(QUIZ_BANK.length).fill(null),
        submitted:       false,

        // per-question tracking
        questionStartTime: Date.now(),
        currentAttempts:   1,
        questionRecords:   [],
    };

    const quizBox    = (root === document) ? document.getElementById("quiz-box")          : root.querySelector(".quiz-box");
    const counter    = (root === document) ? document.getElementById("quiz-counter")       : root.querySelector(".quiz-counter");
    const miniScore  = (root === document) ? document.getElementById("quiz-score-mini")    : root.querySelector(".quiz-score-mini");
    const progressBar= (root === document) ? document.getElementById("quiz-progress-bar")  : root.querySelector(".quiz-progress-bar");
    const prevBtn    = (root === document) ? document.getElementById("prev-quiz-btn")      : root.querySelector(".prev-quiz-btn");
    const nextBtn    = (root === document) ? document.getElementById("next-quiz-btn")      : root.querySelector(".next-quiz-btn");

    if (!quizBox || !counter || !miniScore || !progressBar || !prevBtn || !nextBtn) return;

    function getScore() {
        return state.selectedAnswers.reduce((acc, ans, i) => {
            return acc + (ans === QUIZ_BANK[i].correctIndex ? 1 : 0);
        }, 0);
    }

    function getTopicBreakdown() {
        const breakdown = {};
        QUIZ_BANK.forEach((q, idx) => {
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
        const q          = QUIZ_BANK[questionIndex];
        const timeTaken  = (Date.now() - state.questionStartTime) / 1000;
        const answered   = state.selectedAnswers[questionIndex] !== null;
        const correct    = state.selectedAnswers[questionIndex] === q.correctIndex;

        const alreadyRecorded = state.questionRecords.find(r => r.questionIndex === questionIndex);
        if (!alreadyRecorded) {
            state.questionRecords.push({
                questionIndex,
                topic:     q.topic,
                correct,
                attempts:  state.currentAttempts,
                timeTaken: Math.min(parseFloat(timeTaken.toFixed(2)), 600),
                completed: answered
            });
        }
    }

    function renderQuestion() {
        const q         = QUIZ_BANK[state.current];
        const selected  = state.selectedAnswers[state.current];
        const hasTemplate = Boolean(q.codeTemplate);

        // Fill-in-the-blank questions render their codeTemplate directly as
        // the code block (with the blank highlighted); other questions fall
        // back to the older intro/code auto-split for plain-text MCQs.
        const { intro, code } = hasTemplate
            ? { intro: q.question, code: null }
            : parseQuestion(q.question);
        const codeLines = code ? splitCodeIntoLines(code) : [];
        const templateDisplay = hasTemplate
            ? q.codeTemplate.replace("{BLANK}", '<span class="lp-blank">____</span>')
            : null;

        // Reset timer and attempts for new question
        state.questionStartTime = Date.now();
        state.currentAttempts   = 1;

        counter.textContent       = `Question ${state.current + 1} of ${QUIZ_BANK.length}`;
        progressBar.style.width   = `${((state.current + 1) / QUIZ_BANK.length) * 100}%`;
        miniScore.textContent     = `Score: ${getScore()}`;

        quizBox.innerHTML = `
            <article class="lp-question-card">
                <div class="lp-question-meta">
                    <span class="lp-topic-tag">${q.topic}</span>
                    <span class="lp-id-tag">Q${q.id}</span>
                </div>
                <h4 class="lp-question">${intro}</h4>
                ${code ? `<pre class="lp-code-block"><code>${codeLines.join('\n')}</code></pre>` : ''}
                ${templateDisplay ? `<pre class="lp-code-block"><code>${templateDisplay}</code></pre>` : ''}
                <div class="lp-options">
                    ${q.options.map((opt, idx) => {
                        const isSelected = selected === idx;
                        const isCorrect  = q.correctIndex === idx;
                        const isCode     = hasTemplate || looksLikeCode(opt);
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
                // student's choice and send it in the background. Never awaited,
                // never blocks the quiz UI.
                if (q.codeTemplate) {
                    const fullCodeString = buildFullCodeFromTemplate(q, optionIndex);
                    sendTelemetry(fullCodeString);
                }
            });
        });

        prevBtn.disabled = state.current === 0;

        if (state.current === QUIZ_BANK.length - 1) {
            nextBtn.textContent = state.submitted ? "Review Again" : "Submit Quiz";
        } else {
            nextBtn.textContent = "Next";
        }
    }

    nextBtn.addEventListener("click", async () => {

        // Record current question before moving
        recordQuestionData(state.current);

        if (state.current < QUIZ_BANK.length - 1) {
            state.current += 1;
            renderQuestion();
            return;
        }

        if (!state.submitted) {
            state.submitted  = true;
            const score      = getScore();
            const percent    = Math.round((score / QUIZ_BANK.length) * 100);
            const topicBreakdown = getTopicBreakdown();

            // Calculate session metrics (now includes accuracy)
            const sessionMetrics = calculateSessionMetrics(
                state.questionRecords,
                topicBreakdown
            );

            console.log("Session metrics:", sessionMetrics);

            // Show result card with loading spinner for ML
            quizBox.innerHTML = `
                <article class="lp-result-card">
                    <h4>Your Quiz Result</h4>
                    <p class="lp-result-score">${score} / ${QUIZ_BANK.length} (${percent}%)</p>
                    <p class="lp-muted-sm">
                        ${percent >= 80 ? "Excellent work! You are mastering the concepts." :
                          percent >= 60 ? "Good progress. Review a few topics and try again." :
                          "Keep going. Repetition builds confidence."}
                    </p>

                    <!-- ML loading spinner -->
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

                    <div style="display:flex; gap:1rem; margin-top:1.5rem; justify-content:center;">
                        <button id="retry-quiz-btn" class="btn btn-primary" style="margin-top:0; background:#2563EB;">
                            Retry 25 Questions
                        </button>
                        <button id="view-details-btn" class="btn btn-secondary" style="margin-top:0; background:#0D9488; color:#FFFFFF;">
                            View Details
                        </button>
                        <button id="finish-quiz-btn" class="btn btn-primary" style="margin-top:0; background:#2563EB;">
                            Finish
                        </button>
                    </div>
                </article>
            `;

            miniScore.textContent     = `Score: ${score}`;
            progressBar.style.width   = "100%";
            counter.textContent       = `Completed: ${QUIZ_BANK.length} questions`;
            prevBtn.disabled          = true;
            nextBtn.textContent       = "Review Again";

            // Call ML API
            let mlResult = null;
            if (sessionMetrics) {
                mlResult = await getMLRecommendation(sessionMetrics);

                // Replace loading spinner with ML recommendation card
                const mlLoading = quizBox.querySelector("#ml-loading");
                if (mlLoading && mlResult) {
                    mlLoading.outerHTML = buildMLRecommendationCard(
                        mlResult,
                        sessionMetrics
                    );

                    // Start next session button
                    const nextSessionBtn = quizBox.querySelector("#start-next-session-btn");
                    if (nextSessionBtn) {
                        nextSessionBtn.addEventListener("click", () => {
                            sessionStorage.setItem("ml-recommendation", JSON.stringify(mlResult));
                            if (window.__onNavigate) {
                                window.__onNavigate("/student/dashboard");
                            } else if (typeof window.navigateTo === "function") {
                                window.navigateTo("/student/dashboard");
                            }
                        });
                    }
                }
            }

            // Save full results including ML output
            const weakConcept = mlResult?.next_topic || (topicScores ? Object.entries(topicScores).sort((a, b) => a[1] - b[1])[0]?.[0] : "Loops") || "Loops";
            const conceptCapitalized = weakConcept.charAt(0).toUpperCase() + weakConcept.slice(1);

            const pretestPayload = {
                score,
                percent,
                weak_concept: conceptCapitalized,
                focus_concept: conceptCapitalized,
                topicBreakdown,
                answeredCount: state.selectedAnswers.filter(a => a !== null).length,
                sessionMetrics,
                mlResult
            };

            sessionStorage.setItem("quiz-results", JSON.stringify(pretestPayload));
            sessionStorage.setItem("codequest_pretest_result", JSON.stringify(pretestPayload));
            localStorage.setItem("codequest_pretest_result", JSON.stringify(pretestPayload));
            sessionStorage.setItem("cq_focus_concept", conceptCapitalized);
            localStorage.setItem("cq_focus_concept", conceptCapitalized);

            // Retry button
            const retryBtn = quizBox.querySelector("#retry-quiz-btn");
            if (retryBtn) {
                retryBtn.addEventListener("click", () => {
                    state.current          = 0;
                    state.selectedAnswers  = Array(QUIZ_BANK.length).fill(null);
                    state.submitted        = false;
                    state.questionRecords  = [];
                    renderQuestion();
                });
            }

            // View details button
            const viewDetailsBtn = quizBox.querySelector("#view-details-btn");
            if (viewDetailsBtn) {
                viewDetailsBtn.addEventListener("click", () => {
                    if (window.__onNavigate) {
                        window.__onNavigate("/student/progress");
                    } else if (typeof window.navigateTo === "function") {
                        window.navigateTo("quiz-results");
                    }
                });
            }

            // Finish button
            const finishBtn = quizBox.querySelector("#finish-quiz-btn");
            if (finishBtn) {
                finishBtn.addEventListener("click", () => {
                    if (window.__onNavigate) {
                        window.__onNavigate("/student/dashboard");
                    } else if (typeof window.navigateTo === "function") {
                        window.navigateTo("/student/dashboard");
                    }
                });
            }

            return;
        }

        state.current   = 0;
        state.submitted = false;
        renderQuestion();
    });

    prevBtn.addEventListener("click", () => {
        if (state.current > 0) {
            state.current -= 1;
            renderQuestion();
        }
    });

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
    const mlResult     = savedResults.mlResult || null;
    const metrics      = savedResults.sessionMetrics || null;

    const topicDetailsHTML = Object.entries(topicBreakdown).map(([topic, data]) => {
        const accuracy    = Math.round((data.correct / data.total) * 100);
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
                        <span class="quiz-score-mini">Score: 0</span>
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