/**
 * Post-Test Page — Component 4: Schema Mastery Validation (MCQ)
 * =============================================================
 * Concept-specific 15-question post-test check taken after gamified lessons.
 * Clean, modern white-theme educational UI hiding raw ML internals.
 */

import { SchemaMasteryAPI } from "../api/api.js";
import { getCurrentUser } from "../utils/auth.js";

// ── State ───────────────────────────────────────────────────────────
let currentStudentId = null;
let currentSessionId = null;
let currentConcept = "Loops";
let currentErrorType = "LOOP_CONDITION_ERROR";
let currentPreTestScore = 0.50;
let currentAttemptCount = 1;
let currentErrorPatternScore = 0.40;
let currentOnBack = null;

let questions = [];
let currentQuestionIndex = 0;
let selectedAnswers = {};
let testResult = null;
let startTime = null;

const conceptDisplayNames = {
    variables: "Variables & Data Types",
    operators: "Operators & Expressions",
    loops: "Loops & Iteration",
    arrays: "Arrays & Data Structures",
    methods: "Methods & Functions",
    Variables: "Variables & Data Types",
    Operators: "Operators & Expressions",
    Loops: "Loops & Iteration",
    Arrays: "Arrays & Data Structures",
    Methods: "Methods & Functions",
};

/**
 * Entry point: renders the Post-Test understanding check page.
 */
export async function renderPostTest(container, opts = {}) {
    const user = getCurrentUser();
    if (!user) {
        container.innerHTML = `
            <div class="card" style="text-align: center; padding: 4rem 2rem; max-width: 600px; margin: 2rem auto;">
                <div style="font-size: 3rem; color: var(--primary); margin-bottom: 1rem;"><i class="fa-solid fa-lock"></i></div>
                <h2 style="font-size: 1.5rem; margin-bottom: 0.5rem;">Sign In Required</h2>
                <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">Please sign in to take your understanding check.</p>
                <a href="#/login" class="btn btn-primary btn-lg"><i class="fa-solid fa-arrow-right-to-bracket"></i> Sign In</a>
            </div>
        `;
        return;
    }

    currentStudentId = user.uid || user.id;
    currentConcept = opts.concept || opts.concept_name || "Loops";
    currentErrorType = opts.error_type || opts.errorType || "LOOP_CONDITION_ERROR";
    currentPreTestScore = typeof opts.pre_test_score === "number" ? opts.pre_test_score : 0.50;
    currentAttemptCount = opts.attempt_count || 1;
    currentErrorPatternScore = typeof opts.error_pattern_score === "number" ? opts.error_pattern_score : 0.40;
    currentOnBack = opts.onBack || null;

    selectedAnswers = {};
    testResult = null;
    currentQuestionIndex = 0;
    startTime = Date.now();

    renderStartScreen(container);
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Post-Test Start Screen
// ─────────────────────────────────────────────────────────────────────────────
function renderStartScreen(container) {
    const conceptTitle = conceptDisplayNames[currentConcept] || currentConcept;

    container.innerHTML = `
        <div class="posttest-page c4-check-page" style="padding: 1.5rem 2rem; max-width: 860px; margin: 0 auto; color: var(--text-primary);">
            <div class="c4-check-header" style="display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem;">
                <a href="#/student/dashboard" class="btn btn-outline" style="padding: 0.5rem 1rem;">
                    ← Back to Dashboard
                </a>
                <div>
                    <h1 style="font-size: 1.7rem; font-weight: 800; color: var(--text-primary); margin: 0;">
                        Post-Learning Understanding Check
                    </h1>
                    <p style="color: var(--text-secondary); margin-top: 0.2rem; font-size: 0.95rem;">
                        Validation check for <strong>${conceptTitle}</strong>
                    </p>
                </div>
            </div>

            <!-- Learning Journey Context Card -->
            <div class="card" style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: var(--radius); padding: 1.8rem; margin-bottom: 1.5rem; box-shadow: var(--shadow-sm);">
                <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 1.2rem; color: var(--primary); display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fa-solid fa-chart-line"></i> Learning Validation Overview
                </h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                    <div style="background: var(--bg-subtle); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color);">
                        <span style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 600;">Target Focus</span>
                        <div style="font-size: 1.2rem; font-weight: 700; color: var(--text-primary); margin-top: 0.2rem;">
                            ${conceptTitle}
                        </div>
                    </div>
                    <div style="background: var(--bg-subtle); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color);">
                        <span style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 600;">Questions</span>
                        <div style="font-size: 1.2rem; font-weight: 700; color: var(--primary); margin-top: 0.2rem;">
                            15 Concept Questions
                        </div>
                    </div>
                </div>

                <div style="background: var(--primary-soft); border-left: 4px solid var(--primary); padding: 1rem; border-radius: 6px; font-size: 0.9rem; color: var(--text-primary); line-height: 1.5;">
                    <strong>Instructions:</strong> Answer each question carefully. Your answers will validate whether you have overcome common Java misconceptions and are ready to advance to new topics.
                </div>
            </div>

            <!-- Start Action Area -->
            <div class="card" style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: var(--radius); padding: 1.8rem; text-align: center; box-shadow: var(--shadow-sm);">
                <button class="btn btn-primary btn-lg" id="start-posttest-btn" style="padding: 0.85rem 2.5rem; font-size: 1.05rem; font-weight: 700;">
                    <i class="fa-solid fa-play"></i> Start Understanding Check
                </button>
            </div>
        </div>
    `;

    document.getElementById("start-posttest-btn")?.addEventListener("click", () => {
        loadQuestionsAndStart(container);
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Load Questions from Bank
// ─────────────────────────────────────────────────────────────────────────────
async function loadQuestionsAndStart(container) {
    container.innerHTML = `
        <div style="text-align: center; padding: 5rem 1rem; color: var(--text-secondary);">
            <div class="spinner" style="margin-bottom: 1.5rem;"></div>
            <h3 style="color: var(--text-primary); font-weight: 600;">Loading Understanding Check Questions...</h3>
            <p style="margin-top: 0.5rem;">Fetching verified concept questions for ${conceptDisplayNames[currentConcept] || currentConcept}</p>
        </div>
    `;

    try {
        const res = await SchemaMasteryAPI.getPostTestQuestions({
            concept: currentConcept,
            student_id: currentStudentId,
            error_type: currentErrorType,
        });
        if (res && res.questions && res.questions.length > 0) {
            questions = res.questions;
            currentSessionId = res.session_id || null;
        } else {
            throw new Error("No approved questions found for this topic.");
        }
        currentQuestionIndex = 0;
        selectedAnswers = {};
        startTime = Date.now();
        renderQuestionScreen(container, 0);
    } catch (err) {
        container.innerHTML = `
            <div class="card" style="text-align: center; padding: 4rem 1rem; max-width: 600px; margin: 2rem auto;">
                <p style="color: var(--danger); font-weight: 600; margin-bottom: 1rem;">Failed to load questions: ${err.message}</p>
                <button class="btn btn-primary" id="retry-load-btn"><i class="fa-solid fa-rotate"></i> Retry</button>
            </div>
        `;
        document.getElementById("retry-load-btn")?.addEventListener("click", () => loadQuestionsAndStart(container));
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Question Screen (White LMS Theme)
// ─────────────────────────────────────────────────────────────────────────────
function renderQuestionScreen(container, index) {
    currentQuestionIndex = index;
    const q = questions[index];
    const total = questions.length;
    const isLast = index === total - 1;
    const isFirst = index === 0;

    const optKeys = ["A", "B", "C", "D"];

    container.innerHTML = `
        <div class="posttest-page c4-check-page" style="padding: 1.5rem 2rem; max-width: 860px; margin: 0 auto; color: var(--text-primary);">
            <!-- Progress Bar -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem;">
                <span style="font-size: 0.9rem; font-weight: 700; color: var(--primary);">
                    Question ${index + 1} of ${total}
                </span>
                <span style="font-size: 0.85rem; color: var(--text-secondary);">
                    ${Math.round(((index + 1) / total) * 100)}% Completed
                </span>
            </div>
            <div style="width: 100%; height: 6px; background: var(--border-color); border-radius: 99px; margin-bottom: 1.5rem; overflow: hidden;">
                <div style="width: ${((index + 1) / total) * 100}%; height: 100%; background: var(--primary); transition: width 0.3s;"></div>
            </div>

            <!-- Question Card -->
            <div class="card" style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: var(--radius); padding: 2rem; margin-bottom: 1.5rem; box-shadow: var(--shadow-sm);">
                <div style="font-size: 1.15rem; font-weight: 600; line-height: 1.5; color: var(--text-primary); margin-bottom: 1.5rem;">
                    ${escapeHtml(q.question_text || q.question || "")}
                </div>

                ${q.code_snippet ? `
                    <div class="ea-code-box" style="background: var(--bg-subtle); color: var(--text-primary); border: 1px solid var(--border-color); padding: 1rem; border-radius: 8px; font-family: monospace; font-size: 0.9rem; margin-bottom: 1.5rem; white-space: pre-wrap;">
                        ${escapeHtml(q.code_snippet)}
                    </div>
                ` : ""}

                <!-- MCQ Options -->
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    ${optKeys.map((key) => {
                        const optText = (q.options && q.options[key]) || "";
                        if (!optText) return "";
                        const isSelected = selectedAnswers[q.question_id] === key;
                        return `
                            <button class="opt-choice-btn" data-key="${key}" style="display: flex; align-items: center; gap: 1rem; padding: 1rem 1.2rem; background: ${isSelected ? 'var(--primary-soft)' : '#FFFFFF'}; border: 2px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}; border-radius: 8px; cursor: pointer; text-align: left; transition: all 0.2s; color: var(--text-primary);">
                                <span style="display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; background: ${isSelected ? 'var(--primary)' : 'var(--bg-subtle)'}; color: ${isSelected ? '#FFFFFF' : 'var(--text-secondary)'}; font-weight: 700; font-size: 0.85rem; flex-shrink: 0;">
                                    ${key}
                                </span>
                                <span style="font-size: 0.95rem; font-weight: ${isSelected ? '600' : '400'};">${escapeHtml(optText)}</span>
                            </button>
                        `;
                    }).join("")}
                </div>
            </div>

            <!-- Navigation Controls -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <button class="btn btn-outline" id="prev-btn" ${isFirst ? 'disabled' : ''} style="padding: 0.6rem 1.4rem;">
                    ← Previous
                </button>

                ${isLast
                    ? `<button class="btn btn-primary" id="submit-btn" ${Object.keys(selectedAnswers).length < total ? 'disabled' : ''} style="padding: 0.7rem 2rem; font-weight: 700;">Submit Check <i class="fa-solid fa-check"></i></button>`
                    : `<button class="btn btn-primary" id="next-btn" ${!selectedAnswers[q.question_id] ? 'disabled' : ''} style="padding: 0.6rem 1.8rem; font-weight: 600;">Next →</button>`
                }
            </div>

            <!-- Question Dot Palette -->
            <div style="display: flex; justify-content: center; gap: 0.5rem; flex-wrap: wrap;">
                ${questions.map((item, i) => {
                    const isAnswered = Boolean(selectedAnswers[item.question_id]);
                    const isCurrent = i === index;
                    let bg = "var(--border-color)";
                    if (isAnswered) bg = "var(--success)";
                    if (isCurrent) bg = "var(--primary)";
                    return `
                        <span class="q-dot" data-idx="${i}" style="cursor: pointer; width: 12px; height: 12px; border-radius: 50%; background: ${bg}; transform: ${isCurrent ? 'scale(1.3)' : 'scale(1)'}; transition: all 0.2s;"></span>
                    `;
                }).join("")}
            </div>
        </div>
    `;

    // Option selection click handlers
    container.querySelectorAll(".opt-choice-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const key = btn.dataset.key;
            selectedAnswers[q.question_id] = key;

            container.querySelectorAll(".opt-choice-btn").forEach((b) => {
                b.style.borderColor = "var(--border-color)";
                b.style.background = "#FFFFFF";
                b.querySelector("span").style.background = "var(--bg-subtle)";
                b.querySelector("span").style.color = "var(--text-secondary)";
            });

            btn.style.borderColor = "var(--primary)";
            btn.style.background = "var(--primary-soft)";
            btn.querySelector("span").style.background = "var(--primary)";
            btn.querySelector("span").style.color = "#FFFFFF";

            const nextBtn = document.getElementById("next-btn");
            const submitBtn = document.getElementById("submit-btn");
            if (nextBtn) nextBtn.disabled = false;
            if (submitBtn) submitBtn.disabled = Object.keys(selectedAnswers).length < questions.length;

            const dot = container.querySelector(`.q-dot[data-idx="${index}"]`);
            if (dot) dot.style.background = "var(--primary)";
        });
    });

    // Navigation buttons
    document.getElementById("prev-btn")?.addEventListener("click", () => renderQuestionScreen(container, index - 1));
    document.getElementById("next-btn")?.addEventListener("click", () => renderQuestionScreen(container, index + 1));
    document.getElementById("submit-btn")?.addEventListener("click", () => submitPostTest(container));

    // Dot jumping
    container.querySelectorAll(".q-dot").forEach((dot) => {
        dot.addEventListener("click", () => {
            const targetIdx = parseInt(dot.dataset.idx);
            if (!isNaN(targetIdx)) renderQuestionScreen(container, targetIdx);
        });
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Submit Post-Test & Render Results
// ─────────────────────────────────────────────────────────────────────────────
async function submitPostTest(container) {
    const elapsedSeconds = Math.max(15, Math.round((Date.now() - startTime) / 1000));
    const answersPayload = Object.entries(selectedAnswers).map(([qid, opt]) => ({
        question_id: qid,
        selected_option: opt,
    }));

    container.innerHTML = `
        <div style="text-align: center; padding: 5rem 1rem; color: var(--text-secondary);">
            <div class="spinner" style="margin-bottom: 1.5rem;"></div>
            <h3 style="color: var(--text-primary); font-weight: 600;">Evaluating Understanding Check...</h3>
            <p style="margin-top: 0.5rem;">Analyzing answer qualities and validating schema mastery...</p>
        </div>
    `;

    try {
        const payload = {
            student_id: currentStudentId,
            session_id: currentSessionId,
            concept_name: currentConcept,
            pre_test_score: currentPreTestScore,
            attempt_count: currentAttemptCount,
            time_taken_seconds: elapsedSeconds,
            error_type: currentErrorType,
            error_pattern_score: currentErrorPatternScore,
            answers: answersPayload,
        };

        const result = await SchemaMasteryAPI.submitPostTest(payload);
        renderResultScreen(container, result);
    } catch (err) {
        container.innerHTML = `
            <div class="card" style="text-align: center; padding: 4rem 1rem; max-width: 600px; margin: 2rem auto;">
                <p style="color: var(--danger); font-weight: 600; margin-bottom: 1rem;">Submission failed: ${err.message}</p>
                <button class="btn btn-primary" id="resubmit-btn"><i class="fa-solid fa-rotate"></i> Retry Submission</button>
            </div>
        `;
        document.getElementById("resubmit-btn")?.addEventListener("click", () => renderQuestionScreen(container, currentQuestionIndex));
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Post-Test Result Screen (Student-Safe White Theme)
// ─────────────────────────────────────────────────────────────────────────────
function renderResultScreen(container, res) {
    const isDone = res.next_action === "DONE";
    const levelColors = {
        "Strong Understanding": "var(--success)",
        "Good Progress": "var(--primary)",
        "Needs More Practice": "var(--warning)",
        "Learn Again": "var(--danger)",
    };
    const levelColor = levelColors[res.mastery_level] || (isDone ? "var(--success)" : "var(--danger)");

    const friendlyAction = isDone ? "Continue" : "Review Again";
    const scorePct = Math.round((res.post_test_score || 0) * 100);

    const message = isDone
        ? "Great job! You have demonstrated strong conceptual understanding and overcome targeted misconceptions."
        : "You are making progress, but additional practice is recommended to solidify your understanding of this concept.";

    container.innerHTML = `
        <div class="posttest-page c4-check-page" style="padding: 1.5rem 2rem; max-width: 860px; margin: 0 auto; color: var(--text-primary);">
            <!-- Result Main Card -->
            <div class="card" style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: var(--radius); padding: 2.5rem; text-align: center; margin-bottom: 2rem; box-shadow: var(--shadow-sm);">
                
                <!-- Status Icon -->
                <div style="width: 76px; height: 76px; border-radius: 50%; background: var(--bg-subtle); border: 3px solid ${levelColor}; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.2rem auto; font-size: 2rem; color: ${levelColor};">
                    ${isDone ? '<i class="fa-solid fa-trophy"></i>' : '<i class="fa-solid fa-rotate-left"></i>'}
                </div>

                <h1 style="font-size: 1.8rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.3rem;">
                    ${res.mastery_level}
                </h1>
                <p style="font-size: 1rem; color: var(--text-secondary); margin-bottom: 1.5rem;">
                    ${conceptDisplayNames[currentConcept] || currentConcept}
                </p>

                <!-- Student Outcome Pill Box -->
                <div style="background: var(--bg-subtle); border: 1px solid var(--border-color); border-radius: 8px; padding: 1rem; max-width: 440px; margin: 0 auto 1.8rem auto;">
                    <div style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                        Evaluation Outcome
                    </div>
                    <div style="font-size: 1.2rem; font-weight: 700; color: var(--text-primary); margin-top: 0.3rem;">
                        Recommended Step: <span style="color: ${levelColor}">${friendlyAction}</span>
                    </div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.2rem;">
                        Score Achieved: <strong>${scorePct}%</strong>
                    </div>
                </div>

                <!-- 4-Tier Performance Metrics Grid -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                    <div style="background: #FFFFFF; padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color); border-top: 3px solid var(--success);">
                        <span style="font-size: 0.75rem; color: var(--success); font-weight: 700; text-transform: uppercase;">Correct</span>
                        <div style="font-size: 1.5rem; font-weight: 800; color: var(--success); margin-top: 0.2rem;">
                            ${res.post_test_correct_count || 0}
                        </div>
                    </div>
                    <div style="background: #FFFFFF; padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color); border-top: 3px solid var(--warning);">
                        <span style="font-size: 0.75rem; color: var(--warning); font-weight: 700; text-transform: uppercase;">Nearly Correct</span>
                        <div style="font-size: 1.5rem; font-weight: 800; color: var(--warning); margin-top: 0.2rem;">
                            ${res.post_test_nearly_correct_count || 0}
                        </div>
                    </div>
                    <div style="background: #FFFFFF; padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color); border-top: 3px solid var(--danger);">
                        <span style="font-size: 0.75rem; color: var(--danger); font-weight: 700; text-transform: uppercase;">Needs Review</span>
                        <div style="font-size: 1.5rem; font-weight: 800; color: var(--danger); margin-top: 0.2rem;">
                            ${(res.post_test_wrong_count || 0) + (res.post_test_clearly_wrong_count || 0)}
                        </div>
                    </div>
                </div>

                <!-- Friendly Feedback Message -->
                <div style="background: var(--bg-subtle); border-left: 4px solid ${levelColor}; padding: 1.2rem; border-radius: 6px; text-align: left; margin-bottom: 2rem; font-size: 0.95rem; line-height: 1.5; color: var(--text-primary);">
                    <p style="margin: 0; font-weight: 500;">${message}</p>
                </div>

                <!-- Primary Action Button -->
                <div>
                    ${isDone
                        ? `<a href="#/student/dashboard" class="btn btn-primary btn-lg" style="padding: 0.85rem 3rem; font-weight: 700;"><i class="fa-solid fa-check"></i> Continue to Dashboard</a>`
                        : `<a href="#/student/games" class="btn btn-primary btn-lg" style="padding: 0.85rem 3rem; font-weight: 700;"><i class="fa-solid fa-rotate-left"></i> Review with Game Lesson</a>`
                    }
                </div>
            </div>

            <!-- Expandable Answer Review Toggle -->
            <div>
                <button class="btn btn-outline" id="toggle-review-btn" style="width: 100%; text-align: left; padding: 1rem; background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary); display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 600;"><i class="fa-solid fa-list-check" style="margin-right: 0.5rem; color: var(--primary);"></i> Review Answers & Explanations</span>
                    <i class="fa-solid fa-chevron-down" id="review-chevron"></i>
                </button>

                <div id="review-details" class="hidden" style="background: #FFFFFF; border: 1px solid var(--border-color); border-top: none; border-radius: 0 0 8px 8px; padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
                    ${(res.results || []).map((item, i) => `
                        <div style="background: var(--bg-subtle); padding: 1rem; border-radius: 6px; border-left: 4px solid ${item.is_correct ? 'var(--success)' : (item.answer_quality === 'Nearly Correct' ? 'var(--warning)' : 'var(--danger)')};">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
                                <strong style="font-size: 0.9rem; color: var(--text-primary);">Q${i + 1}: ${escapeHtml(item.question)}</strong>
                                <span style="font-size: 0.75rem; font-weight: 700; color: ${item.is_correct ? 'var(--success)' : (item.answer_quality === 'Nearly Correct' ? 'var(--warning)' : 'var(--danger)')}">
                                    ${item.answer_quality}
                                </span>
                            </div>
                            <div style="font-size: 0.85rem; color: var(--text-secondary);">
                                Your Choice: <strong style="color: var(--text-primary);">${item.selected}</strong> (${escapeHtml(item.options[item.selected] || "")})
                                ${!item.is_correct ? ` | Correct Choice: <strong style="color: var(--success);">${item.correct}</strong> (${escapeHtml(item.options[item.correct] || "")})` : ""}
                            </div>
                            ${item.explanation ? `<p style="margin: 0.5rem 0 0 0; font-size: 0.8rem; color: var(--text-secondary);"><em>${escapeHtml(item.explanation)}</em></p>` : ""}
                        </div>
                    `).join("")}
                </div>
            </div>
        </div>
    `;

    // Toggle Review Details
    document.getElementById("toggle-review-btn")?.addEventListener("click", () => {
        const det = document.getElementById("review-details");
        const chev = document.getElementById("review-chevron");
        if (det) {
            det.classList.toggle("hidden");
            if (chev) chev.className = det.classList.contains("hidden") ? "fa-solid fa-chevron-down" : "fa-solid fa-chevron-up";
        }
    });
}

function escapeHtml(text) {
    if (!text) return "";
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}
