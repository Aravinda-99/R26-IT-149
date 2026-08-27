/**
 * Post-Test Page — Component 4: Schema Mastery Validation (MCQ)
 * =============================================================
 * Concept-specific 15-question post-test check taken after gamified lessons.
 *
 * Workflow:
 *   1. PostTestStart: Introduction screen showing target concept and error focus
 *   2. PostTestQuestionScreen: 15-question student-safe MCQ flow (no answer leaks)
 *   3. PostTestResultScreen:
 *      - Calculates 4-tier answer counts (Correct, Nearly Correct, Wrong, Clearly Wrong)
 *      - Submits multi-source evidence to Random Forest ML pipeline
 *      - Renders predicted mastery_level, next_action (DONE vs LEARN_AGAIN),
 *        friendly outcome guidance, and expandable ML calculation & answer review.
 */

import { SchemaMasteryAPI } from "../api/api.js";

// ── State ───────────────────────────────────────────────────────────
let currentStudentId = "STU001";
let currentSessionId = null;
let currentConcept = "Loops";
let currentErrorType = "LOOP_CONDITION_ERROR";
let currentPreTestScore = 0.45;
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
    currentStudentId = opts.studentId || opts.student_id || "STU001";
    currentSessionId = opts.sessionId || opts.session_id || null;
    currentConcept = opts.concept || opts.concept_name || "Loops";
    currentErrorType = opts.error_type || opts.errorType || "LOOP_CONDITION_ERROR";
    currentPreTestScore = typeof opts.pre_test_score === "number" ? opts.pre_test_score : 0.45;
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
        <div class="posttest-page c4-check-page" style="padding: 1.5rem 2rem; max-width: 900px; margin: 0 auto; color: var(--text-primary);">
            <div class="c4-check-header" style="display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem;">
                <button class="btn c4-back-btn" id="posttest-back-btn" style="background: rgba(255,255,255,0.08); padding: 0.5rem 1rem; border-radius: 0.4rem; color: var(--text-secondary);">
                    ← Back
                </button>
                <div>
                    <h1 style="font-size: 1.8rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fa-solid fa-graduation-cap" style="color: #6366f1;"></i>
                        Post-Learning Understanding Check
                    </h1>
                    <p style="color: var(--text-secondary); margin-top: 0.2rem;">
                        Validation check for <strong>${conceptTitle}</strong>
                    </p>
                </div>
            </div>

            <!-- Pre-test Evidence Context Card -->
            <div class="card" style="background: var(--card-bg, #181c28); border: 1px solid var(--border-color); border-radius: 0.8rem; padding: 1.8rem; margin-bottom: 2rem;">
                <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 1rem; color: #a5b4fc; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fa-solid fa-chart-line"></i> Learning Journey Context
                </h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                    <div style="background: var(--bg-dark, #0f121d); padding: 1rem; border-radius: 0.5rem; border: 1px solid var(--border-color);">
                        <span style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase;">Prior Diagnostic Score</span>
                        <div style="font-size: 1.4rem; font-weight: 700; color: #38bdf8; margin-top: 0.2rem;">
                            ${Math.round(currentPreTestScore * 100)}%
                        </div>
                    </div>
                    <div style="background: var(--bg-dark, #0f121d); padding: 1rem; border-radius: 0.5rem; border: 1px solid var(--border-color);">
                        <span style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase;">Target Error Focus</span>
                        <div style="font-size: 1.1rem; font-weight: 700; color: #f43f5e; margin-top: 0.2rem;">
                            ${currentErrorType}
                        </div>
                    </div>
                    <div style="background: var(--bg-dark, #0f121d); padding: 1rem; border-radius: 0.5rem; border: 1px solid var(--border-color);">
                        <span style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase;">Attempt Number</span>
                        <div style="font-size: 1.4rem; font-weight: 700; color: #a855f7; margin-top: 0.2rem;">
                            #${currentAttemptCount}
                        </div>
                    </div>
                </div>

                <div style="background: rgba(99, 102, 241, 0.08); border-left: 4px solid #6366f1; padding: 1rem; border-radius: 0.4rem; font-size: 0.9rem; line-height: 1.6; color: #e2e8f0;">
                    <strong>Instructions:</strong> You will answer <strong>15 multiple-choice questions</strong> designed to test your conceptual understanding, output prediction, and error recognition. Take your time and select the best answer for each question.
                </div>

                <div style="margin-top: 2rem; display: flex; justify-content: flex-end;">
                    <button class="btn btn-primary" id="start-test-btn" style="padding: 0.8rem 2rem; font-size: 1.05rem; font-weight: 700; background: linear-gradient(135deg, #6366f1, #4f46e5); border-radius: 0.5rem; display: flex; align-items: center; gap: 0.6rem;">
                        Start Post-Test <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        </div>
    `;

    document.getElementById("posttest-back-btn")?.addEventListener("click", () => {
        if (currentOnBack) currentOnBack();
    });

    document.getElementById("start-test-btn")?.addEventListener("click", async () => {
        await loadAndStartPostTest(container);
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Load Questions & Render First Question
// ─────────────────────────────────────────────────────────────────────────────
async function loadAndStartPostTest(container) {
    container.innerHTML = `
        <div style="text-align: center; padding: 5rem 1rem; color: var(--text-secondary);">
            <div class="spinner" style="margin-bottom: 1.5rem;"></div>
            <h3 style="color: white; font-weight: 600;">Preparing your personalized post-test...</h3>
            <p style="margin-top: 0.5rem;">Sampling validated questions according to blueprint for ${currentConcept}</p>
        </div>
    `;

    try {
        const data = await SchemaMasteryAPI.getPostTestQuestions({
            student_id: currentStudentId,
            concept: currentConcept,
            error_type: currentErrorType,
            session_id: currentSessionId,
        });

        if (data.session_id) {
            currentSessionId = data.session_id;
        }

        questions = data.questions || [];
        if (questions.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 4rem 1rem;">
                    <p style="color: #ef4444; font-size: 1.1rem;">No approved questions available for this concept yet.</p>
                    <button class="btn" id="retry-back-btn" style="margin-top: 1rem;">Go Back</button>
                </div>
            `;
            document.getElementById("retry-back-btn")?.addEventListener("click", () => {
                if (currentOnBack) currentOnBack();
            });
            return;
        }

        renderQuestionScreen(container, 0);
    } catch (err) {
        container.innerHTML = `
            <div style="text-align: center; padding: 4rem 1rem; color: #ef4444;">
                <p>Failed to load post-test questions: ${err.message}</p>
                <button class="btn" id="retry-back-btn" style="margin-top: 1rem;">Go Back</button>
            </div>
        `;
        document.getElementById("retry-back-btn")?.addEventListener("click", () => {
            if (currentOnBack) currentOnBack();
        });
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Question Screen (One-at-a-time with Progress Bar)
// ─────────────────────────────────────────────────────────────────────────────
function renderQuestionScreen(container, index) {
    currentQuestionIndex = index;
    const q = questions[index];
    if (!q) return;

    const total = questions.length;
    const progressPct = ((index + 1) / total) * 100;
    const isLast = index === total - 1;
    const conceptTitle = conceptDisplayNames[currentConcept] || currentConcept;

    const optionKeys = ["A", "B", "C", "D"];
    const optionsDict = q.options || {};

    container.innerHTML = `
        <div class="posttest-page c4-check-page" style="padding: 1.5rem 2rem; max-width: 900px; margin: 0 auto; color: var(--text-primary);">
            <!-- Top Progress Header -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <span style="font-size: 0.9rem; font-weight: 700; color: #a5b4fc;">
                    Question ${index + 1} of ${total}
                </span>
                <span style="font-size: 0.85rem; background: rgba(99, 102, 241, 0.15); color: #818cf8; padding: 0.2rem 0.6rem; border-radius: 0.3rem;">
                    ${q.question_type || "Question"}
                </span>
            </div>

            <!-- Progress Bar -->
            <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.08); border-radius: 999px; margin-bottom: 2rem; overflow: hidden;">
                <div style="height: 100%; width: ${progressPct}%; background: linear-gradient(90deg, #6366f1, #38bdf8); border-radius: 999px; transition: width 0.3s ease;"></div>
            </div>

            <!-- Question Card -->
            <div class="card" style="background: var(--card-bg, #181c28); border: 1px solid var(--border-color); border-radius: 0.8rem; padding: 2rem; margin-bottom: 1.5rem;">
                <p style="font-size: 1.15rem; font-weight: 600; line-height: 1.5; margin-bottom: 1.2rem;">
                    ${escapeHtml(q.question_text || "")}
                </p>

                ${q.code_snippet ? `
                    <div style="background: #0b0e17; border: 1px solid var(--border-color); border-radius: 0.5rem; padding: 1rem 1.2rem; margin-bottom: 1.5rem; font-family: monospace; font-size: 0.95rem; color: #38bdf8; overflow-x: auto;">
                        <pre style="margin: 0;"><code>${escapeHtml(q.code_snippet)}</code></pre>
                    </div>
                ` : ""}

                <!-- 4 Options -->
                <div id="options-group" style="display: flex; flex-direction: column; gap: 0.8rem;">
                    ${optionKeys.map(key => `
                        <button class="btn opt-choice-btn ${selectedAnswers[q.question_id] === key ? 'selected' : ''}"
                                data-key="${key}"
                                style="text-align: left; padding: 1rem 1.2rem; border-radius: 0.5rem; background: ${selectedAnswers[q.question_id] === key ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-dark, #0f121d)'}; border: 2px solid ${selectedAnswers[q.question_id] === key ? '#6366f1' : 'var(--border-color)'}; color: white; display: flex; align-items: center; gap: 0.8rem; transition: all 0.15s ease;">
                            <span style="display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; background: ${selectedAnswers[q.question_id] === key ? '#6366f1' : 'rgba(255,255,255,0.1)'}; font-weight: 700; font-size: 0.85rem;">
                                ${key}
                            </span>
                            <span style="font-size: 1rem; flex: 1;">${escapeHtml(optionsDict[key] || "")}</span>
                        </button>
                    `).join("")}
                </div>
            </div>

            <!-- Navigation Controls -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                ${index > 0
                    ? `<button class="btn" id="prev-btn" style="background: rgba(255,255,255,0.08); padding: 0.6rem 1.4rem;">← Previous</button>`
                    : `<div></div>`
                }

                ${isLast
                    ? `<button class="btn btn-primary" id="submit-btn" ${Object.keys(selectedAnswers).length < total ? 'disabled' : ''} style="background: linear-gradient(135deg, #10b981, #059669); font-weight: 700; padding: 0.7rem 2rem;">Submit Post-Test <i class="fa-solid fa-check"></i></button>`
                    : `<button class="btn btn-primary" id="next-btn" ${!selectedAnswers[q.question_id] ? 'disabled' : ''} style="background: #6366f1; font-weight: 600; padding: 0.6rem 1.8rem;">Next →</button>`
                }
            </div>

            <!-- Question Dot Palette -->
            <div style="display: flex; justify-content: center; gap: 0.5rem; flex-wrap: wrap;">
                ${questions.map((item, i) => {
                    const isAnswered = Boolean(selectedAnswers[item.question_id]);
                    const isCurrent = i === index;
                    let bg = "rgba(255,255,255,0.1)";
                    if (isAnswered) bg = "#10b981";
                    if (isCurrent) bg = "#6366f1";
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
                b.style.background = "var(--bg-dark, #0f121d)";
                b.querySelector("span").style.background = "rgba(255,255,255,0.1)";
            });

            btn.style.borderColor = "#6366f1";
            btn.style.background = "rgba(99, 102, 241, 0.2)";
            btn.querySelector("span").style.background = "#6366f1";

            const nextBtn = document.getElementById("next-btn");
            const submitBtn = document.getElementById("submit-btn");
            if (nextBtn) nextBtn.disabled = false;
            if (submitBtn) submitBtn.disabled = Object.keys(selectedAnswers).length < questions.length;

            const dot = container.querySelector(`.q-dot[data-idx="${index}"]`);
            if (dot) dot.style.background = "#6366f1";
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
            <h3 style="color: white; font-weight: 600;">Evaluating Post-Test & Running ML Prediction...</h3>
            <p style="margin-top: 0.5rem;">Analyzing answer qualities against Random Forest Schema Mastery Pipeline</p>
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
            <div style="text-align: center; padding: 4rem 1rem; color: #ef4444;">
                <p>Post-test submission failed: ${err.message}</p>
                <button class="btn" id="resubmit-btn" style="margin-top: 1rem;">Retry</button>
            </div>
        `;
        document.getElementById("resubmit-btn")?.addEventListener("click", () => renderQuestionScreen(container, currentQuestionIndex));
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Post-Test Result Screen
// ─────────────────────────────────────────────────────────────────────────────
function renderResultScreen(container, res) {
    const isDone = res.next_action === "DONE";
    const levelColors = {
        "Strong Understanding": "#10b981",
        "Good Progress": "#3b82f6",
        "Needs More Practice": "#f59e0b",
        "Learn Again": "#ef4444",
    };
    const levelColor = levelColors[res.mastery_level] || (isDone ? "#10b981" : "#ef4444");

    const message = isDone
        ? "You have shown enough understanding to continue."
        : "You need more practice. Please repeat the learning activity for this concept.";

    container.innerHTML = `
        <div class="posttest-page c4-check-page" style="padding: 1.5rem 2rem; max-width: 900px; margin: 0 auto; color: var(--text-primary);">
            <!-- Result Main Card -->
            <div class="card" style="background: var(--card-bg, #181c28); border: 1px solid var(--border-color); border-radius: 1rem; padding: 2.5rem; text-align: center; margin-bottom: 2rem;">
                
                <!-- Status Icon -->
                <div style="width: 80px; height: 80px; border-radius: 50%; background: ${levelColor}20; border: 3px solid ${levelColor}; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.2rem auto; font-size: 2.2rem; color: ${levelColor};">
                    ${isDone ? '<i class="fa-solid fa-trophy"></i>' : '<i class="fa-solid fa-rotate-left"></i>'}
                </div>

                <h1 style="font-size: 2rem; font-weight: 800; margin-bottom: 0.3rem;">
                    ${res.mastery_level}
                </h1>
                <p style="font-size: 1.05rem; color: var(--text-secondary); margin-bottom: 1.5rem;">
                    ${conceptDisplayNames[currentConcept] || currentConcept}
                </p>

                <!-- ML Prediction Badge Box -->
                <div style="background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 0.6rem; padding: 1rem; max-width: 480px; margin: 0 auto 2rem auto;">
                    <div style="font-size: 0.75rem; color: #a78bfa; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                        ⚡ ML Schema Mastery Validation
                    </div>
                    <div style="font-size: 1.2rem; font-weight: 700; color: white; margin-top: 0.3rem;">
                        Recommended Action: <span style="color: ${levelColor}">${res.next_action}</span>
                    </div>
                    <div style="font-size: 0.85rem; color: #cbd5e1; margin-top: 0.2rem;">
                        Model: <code>${res.model_used}</code>
                    </div>
                </div>

                <!-- 4-Tier Performance Metrics Grid -->
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem;">
                    <div style="background: var(--bg-dark, #0f121d); padding: 1rem; border-radius: 0.5rem; border: 1px solid rgba(16, 185, 129, 0.3);">
                        <span style="font-size: 0.75rem; color: #10b981; font-weight: 600;">Correct (+1.0)</span>
                        <div style="font-size: 1.5rem; font-weight: 800; color: #10b981; margin-top: 0.2rem;">
                            ${res.post_test_correct_count || 0}
                        </div>
                    </div>
                    <div style="background: var(--bg-dark, #0f121d); padding: 1rem; border-radius: 0.5rem; border: 1px solid rgba(245, 158, 11, 0.3);">
                        <span style="font-size: 0.75rem; color: #f59e0b; font-weight: 600;">Nearly Correct (+0.5)</span>
                        <div style="font-size: 1.5rem; font-weight: 800; color: #f59e0b; margin-top: 0.2rem;">
                            ${res.post_test_nearly_correct_count || 0}
                        </div>
                    </div>
                    <div style="background: var(--bg-dark, #0f121d); padding: 1rem; border-radius: 0.5rem; border: 1px solid rgba(239, 68, 68, 0.3);">
                        <span style="font-size: 0.75rem; color: #ef4444; font-weight: 600;">Wrong (0.0)</span>
                        <div style="font-size: 1.5rem; font-weight: 800; color: #ef4444; margin-top: 0.2rem;">
                            ${res.post_test_wrong_count || 0}
                        </div>
                    </div>
                    <div style="background: var(--bg-dark, #0f121d); padding: 1rem; border-radius: 0.5rem; border: 1px solid rgba(168, 85, 247, 0.3);">
                        <span style="font-size: 0.75rem; color: #c084fc; font-weight: 600;">Clearly Wrong (0.0)</span>
                        <div style="font-size: 1.5rem; font-weight: 800; color: #c084fc; margin-top: 0.2rem;">
                            ${res.post_test_clearly_wrong_count || 0}
                        </div>
                    </div>
                </div>

                <!-- Friendly Feedback Message -->
                <div style="background: rgba(255,255,255,0.04); border-left: 4px solid ${levelColor}; padding: 1.2rem; border-radius: 0.4rem; text-align: left; margin-bottom: 2.5rem; font-size: 1.05rem; line-height: 1.5;">
                    <p style="margin: 0; font-weight: 500;">${message}</p>
                </div>

                <!-- Primary Action Button -->
                <div>
                    ${isDone
                        ? `<button class="btn btn-primary" id="res-done-btn" style="padding: 0.85rem 3rem; font-size: 1.1rem; font-weight: 700; background: #10b981; border-radius: 0.5rem;"><i class="fa-solid fa-check"></i> Continue to Next Activity</button>`
                        : `<button class="btn btn-primary" id="res-learn-again-btn" style="padding: 0.85rem 3rem; font-size: 1.1rem; font-weight: 700; background: #6366f1; border-radius: 0.5rem;"><i class="fa-solid fa-rotate-left"></i> Repeat Gamified Lesson</button>`
                    }
                </div>
            </div>

            <!-- Expandable ML Explanation Toggle -->
            <div style="margin-bottom: 1rem;">
                <button class="btn" id="toggle-calc-btn" style="width: 100%; text-align: left; padding: 1rem; background: var(--card-bg, #181c28); border: 1px solid var(--border-color); border-radius: 0.6rem; color: var(--text-secondary); display: flex; justify-content: space-between; align-items: center;">
                    <span><i class="fa-solid fa-calculator" style="margin-right: 0.5rem; color: #6366f1;"></i> How was this Schema Mastery evaluated?</span>
                    <i class="fa-solid fa-chevron-down" id="calc-chevron"></i>
                </button>

                <div id="calc-details" class="hidden" style="background: var(--bg-dark, #0f121d); border: 1px solid var(--border-color); border-top: none; border-radius: 0 0 0.6rem 0.6rem; padding: 1.5rem; font-size: 0.9rem; line-height: 1.6;">
                    <p>Unlike simple percentage cutoffs, Component 4 utilizes a <strong>scikit-learn Random Forest Pipeline</strong> trained across 24,032 student sessions. The model validates learning transfer by combining:</p>
                    <ul style="padding-left: 1.5rem; margin: 0.8rem 0;">
                        <li><strong>Component 1 Diagnostic Evidence:</strong> Pre-test score (${Math.round(currentPreTestScore * 100)}%), session attempts, and completion time</li>
                        <li><strong>Component 2 Error Diagnostics:</strong> Target error classification (${currentErrorType}) and severity (${currentErrorPatternScore})</li>
                        <li><strong>Component 4 Post-Test Nuance:</strong> 4-tier answer quality counts weighted by misconception severity (Nearly Correct = 0.5, Wrong = 0.0)</li>
                    </ul>
                    <p style="margin: 0; color: #a5b4fc;"><strong>Post-Test Score:</strong> ${(res.post_test_score * 100).toFixed(1)}% | <strong>Mastery Probability:</strong> ${(res.mastery_probability * 100).toFixed(1)}%</p>
                </div>
            </div>

            <!-- Expandable Answer Review Toggle -->
            <div>
                <button class="btn" id="toggle-review-btn" style="width: 100%; text-align: left; padding: 1rem; background: var(--card-bg, #181c28); border: 1px solid var(--border-color); border-radius: 0.6rem; color: var(--text-secondary); display: flex; justify-content: space-between; align-items: center;">
                    <span><i class="fa-solid fa-list-check" style="margin-right: 0.5rem; color: #38bdf8;"></i> Review Question Answers & Explanations</span>
                    <i class="fa-solid fa-chevron-down" id="review-chevron"></i>
                </button>

                <div id="review-details" class="hidden" style="background: var(--bg-dark, #0f121d); border: 1px solid var(--border-color); border-top: none; border-radius: 0 0 0.6rem 0.6rem; padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
                    ${(res.results || []).map((item, i) => `
                        <div style="background: var(--card-bg, #181c28); padding: 1rem; border-radius: 0.5rem; border-left: 4px solid ${item.is_correct ? '#10b981' : (item.answer_quality === 'Nearly Correct' ? '#f59e0b' : '#ef4444')};">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
                                <strong style="font-size: 0.9rem;">Q${i + 1}: ${escapeHtml(item.question)}</strong>
                                <span style="font-size: 0.75rem; font-weight: 700; color: ${item.is_correct ? '#10b981' : (item.answer_quality === 'Nearly Correct' ? '#f59e0b' : '#ef4444')}">
                                    ${item.answer_quality}
                                </span>
                            </div>
                            <div style="font-size: 0.85rem; color: var(--text-secondary);">
                                Your Choice: <strong style="color: white;">${item.selected}</strong> (${escapeHtml(item.options[item.selected] || "")})
                                ${!item.is_correct ? ` | Correct Choice: <strong style="color: #10b981;">${item.correct}</strong> (${escapeHtml(item.options[item.correct] || "")})` : ""}
                            </div>
                            ${item.explanation ? `<p style="margin: 0.5rem 0 0 0; font-size: 0.8rem; color: #94a3b8;"><em>${escapeHtml(item.explanation)}</em></p>` : ""}
                        </div>
                    `).join("")}
                </div>
            </div>
        </div>
    `;

    // Action button handlers
    document.getElementById("res-done-btn")?.addEventListener("click", () => {
        if (currentOnBack) currentOnBack();
    });

    document.getElementById("res-learn-again-btn")?.addEventListener("click", () => {
        const gamesLink = document.querySelector('.nav-link[data-page="games"]');
        gamesLink?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    });

    // Toggle ML Calculation Details
    document.getElementById("toggle-calc-btn")?.addEventListener("click", () => {
        const det = document.getElementById("calc-details");
        const chev = document.getElementById("calc-chevron");
        if (det) {
            det.classList.toggle("hidden");
            if (chev) chev.className = det.classList.contains("hidden") ? "fa-solid fa-chevron-down" : "fa-solid fa-chevron-up";
        }
    });

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
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}
