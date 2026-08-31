/**
 * Post-Test Page — Component 4: Schema Mastery Validation (MCQ)
 * =============================================================
 * Concept-specific 15-question post-test check taken after gamified lessons.
 * Gated by prerequisites (Component 1 Pre-Test, Component 2 Error Feedback, Component 3 Game Practice).
 * Consumes real multi-component telemetry for Random Forest ML mastery inference.
 */

import { SchemaMasteryAPI } from "../api/api.js";
import { getCurrentUser } from "../utils/auth.js";

// ── State ───────────────────────────────────────────────────────────
let currentStudentId = null;
let currentSessionId = null;
let currentConcept = null;
let currentWeakConcept = null;
let currentAssessmentConcept = null;
let currentErrorType = null;
let currentPreTestScore = 0.50;
let currentAttemptCount = 1;
let currentTimeTakenSeconds = 120;
let currentErrorPatternScore = 0.50;
let currentErrorReason = "";

let questions = [];
let currentQuestionIndex = 0;
let selectedAnswers = {};
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
 * Entry point: renders the Post-Test understanding check page with strict prerequisite gating.
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

    // Loading indicator while validating prerequisites
    container.innerHTML = `
        <div style="text-align: center; padding: 5rem 1rem; color: var(--text-secondary);">
            <div class="spinner" style="margin-bottom: 1.5rem;"></div>
            <h3 style="color: var(--text-primary); font-weight: 600;">Verifying Learning Progression...</h3>
            <p style="margin-top: 0.5rem;">Checking your Pre-Test diagnostic and error feedback records...</p>
        </div>
    `;

    try {
        const contextRes = await SchemaMasteryAPI.getCurrentContext(currentStudentId);

        const c1 = contextRes?.component_1 || {};
        const c2 = contextRes?.component_2 || {};

        const hasPreTestData =
            Boolean(c1.completed &&
            (c1.concept_name || c1.weak_concept) &&
            c1.pre_test_score !== undefined &&
            c1.attempt_count !== undefined &&
            c1.time_taken_seconds !== undefined);

        const hasErrorData =
            Boolean(c2.completed &&
            c2.error_type &&
            c2.error_pattern_score !== undefined &&
            c2.error_pattern_score !== null);

        // ── 1. Check Prerequisite 1: Diagnostic Pre-Test ───────────────────────
        if (!hasPreTestData) {
            renderLockedScreen(container, {
                title: "Diagnostic Pre-Test Required",
                message: "Complete the Pre-Test first to identify your weak Java concept.",
                actionLabel: "Start Diagnostic Pre-Test",
                actionHref: "#/student/pre-test",
                icon: "fa-solid fa-clipboard-list"
            });
            return;
        }

        // ── 2. Check Prerequisite 2: Error Feedback Review ─────────────────────
        if (!hasErrorData) {
            renderLockedScreen(container, {
                title: "Error Feedback Review Required",
                message: "Review your diagnostic error feedback before starting the understanding check.",
                actionLabel: "Go to Error Feedback",
                actionHref: "#/student/error-analysis",
                icon: "fa-solid fa-magnifying-glass-chart"
            });
            return;
        }

        // ── Prerequisites Satisfied: Load Real Context ─────────────────────────
        currentSessionId = contextRes.session_id;
        currentConcept = c1.concept_name || c1.weak_concept;
        currentWeakConcept = c1.weak_concept || currentConcept;
        currentAssessmentConcept = currentWeakConcept || currentConcept;
        currentPreTestScore = typeof c1.pre_test_score === "number" ? c1.pre_test_score : 0.50;
        currentAttemptCount = c1.attempt_count || 1;
        currentTimeTakenSeconds = c1.time_taken_seconds || 120;
        currentErrorType = c2.error_type || "UNKNOWN_ERROR";
        currentErrorPatternScore = typeof c2.error_pattern_score === "number" ? c2.error_pattern_score : 0.50;
        currentErrorReason = c2.error_reason || "";

        selectedAnswers = {};
        currentQuestionIndex = 0;
        startTime = Date.now();

        renderStartScreen(container);

    } catch (err) {
        console.error("Failed to load learning session context:", err);
        container.innerHTML = `
            <div class="card" style="text-align: center; padding: 4rem 2rem; max-width: 600px; margin: 2rem auto;">
                <div style="font-size: 3rem; color: var(--danger); margin-bottom: 1rem;"><i class="fa-solid fa-circle-exclamation"></i></div>
                <h2 style="font-size: 1.5rem; margin-bottom: 0.5rem;">Unable to Load Learning Context</h2>
                <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">${err.message || "Failed to contact backend learning session service."}</p>
                <a href="#/student/dashboard" class="btn btn-primary"><i class="fa-solid fa-house"></i> Return to Learning Hub</a>
            </div>
        `;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Gated Locked Screen
// ─────────────────────────────────────────────────────────────────────────────
function renderLockedScreen(container, { title, message, actionLabel, actionHref, icon }) {
    container.innerHTML = `
        <div class="posttest-page c4-check-page" style="padding: 2rem 1.5rem; max-width: 720px; margin: 0 auto;">
            <div class="card" style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 16px; padding: 3rem 2rem; text-align: center; box-shadow: var(--shadow-sm);">
                
                <div style="width: 72px; height: 72px; border-radius: 50%; background: #EFF6FF; color: var(--primary); display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem auto; font-size: 2rem; border: 2px solid #DBEAFE;">
                    <i class="${icon}"></i>
                </div>

                <h1 style="font-size: 1.6rem; font-weight: 800; color: var(--text-primary); margin: 0 0 0.5rem 0;">
                    ${title}
                </h1>

                <p style="font-size: 0.95rem; color: var(--text-secondary); max-width: 480px; margin: 0 auto 2rem auto; line-height: 1.6;">
                    ${message}
                </p>

                <div style="display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
                    <a href="${actionHref}" class="btn btn-primary" style="padding: 0.8rem 2rem; font-size: 0.95rem; font-weight: 700; border-radius: 8px;">
                        <i class="${icon}"></i> ${actionLabel}
                    </a>
                    <a href="#/student/dashboard" class="btn btn-outline" style="padding: 0.8rem 1.5rem; font-size: 0.95rem; font-weight: 600; border-radius: 8px;">
                        <i class="fa-solid fa-house"></i> View Hub
                    </a>
                </div>
            </div>
        </div>
    `;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Post-Test Start Screen (Consuming Real Learning Context)
// ─────────────────────────────────────────────────────────────────────────────
function renderStartScreen(container) {
    const conceptTitle = conceptDisplayNames[currentConcept] || currentConcept;
    const weakConceptTitle = conceptDisplayNames[currentWeakConcept] || currentWeakConcept;

    container.innerHTML = `
        <div class="posttest-page c4-check-page" style="padding: 1.5rem 2rem; max-width: 860px; margin: 0 auto; color: var(--text-primary);">
            
            <div class="c4-check-header" style="display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem;">
                <a href="#/student/dashboard" class="btn btn-outline" style="padding: 0.5rem 1rem; border-radius: 8px;">
                    <i class="fa-solid fa-arrow-left"></i> Back to Hub
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
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.5rem;">
                    <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--primary); display: flex; align-items: center; gap: 0.5rem; margin: 0;">
                        <i class="fa-solid fa-chart-line"></i> Learning Validation Overview
                    </h3>
                    <span class="badge" style="background: #DCFCE7; color: #16A34A; font-weight: 700; font-size: 0.75rem; padding: 0.25rem 0.65rem; border-radius: 9999px;">
                        Prerequisites Satisfied
                    </span>
                </div>

                <!-- Real Context Summary -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                    
                    <div style="background: var(--bg-subtle); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color);">
                        <span style="font-size: 0.72rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Target Concept</span>
                        <div style="font-size: 1.15rem; font-weight: 800; color: var(--text-primary); margin-top: 0.25rem;">
                            ${conceptTitle}
                        </div>
                    </div>

                    <div style="background: var(--bg-subtle); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color);">
                        <span style="font-size: 0.72rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Identified Weak Area</span>
                        <div style="font-size: 1.15rem; font-weight: 800; color: #D97706; margin-top: 0.25rem;">
                            ${weakConceptTitle}
                        </div>
                    </div>

                    <div style="background: var(--bg-subtle); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color);">
                        <span style="font-size: 0.72rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Assessment Size</span>
                        <div style="font-size: 1.25rem; font-weight: 800; color: var(--primary); margin-top: 0.25rem;">
                            15 Questions
                        </div>
                    </div>
                </div>

                <div style="background: var(--primary-soft); border-left: 4px solid var(--primary); padding: 1rem 1.2rem; border-radius: 6px; font-size: 0.9rem; color: var(--text-primary); line-height: 1.55;">
                    <strong>Instruction:</strong> This post-learning check validates whether you have improved in the concept identified during your pre-test and error analysis. Answer each question carefully.
                </div>
            </div>

            <!-- Start Action Card -->
            <div class="card" style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: var(--radius); padding: 2rem; text-align: center; box-shadow: var(--shadow-sm);">
                <button class="btn btn-primary btn-lg" id="start-posttest-btn" style="padding: 0.85rem 2.5rem; font-size: 1.05rem; font-weight: 700; border-radius: 8px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);">
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
            <p style="margin-top: 0.5rem;">Fetching questions for ${conceptDisplayNames[currentAssessmentConcept] || currentAssessmentConcept}</p>
        </div>
    `;

    try {
        const res = await SchemaMasteryAPI.getPostTestQuestions({
            concept: currentAssessmentConcept,
            student_id: currentStudentId,
            error_type: currentErrorType,
        });

        if (!res.success || !res.questions || res.questions.length === 0) {
            container.innerHTML = `
                <div class="card" style="text-align: center; padding: 4rem 1.5rem; max-width: 600px; margin: 2rem auto;">
                    <div style="font-size: 3rem; color: var(--danger); margin-bottom: 1rem;"><i class="fa-solid fa-circle-exclamation"></i></div>
                    <h2 style="font-size: 1.4rem; margin-bottom: 0.5rem;">No Questions Available</h2>
                    <p style="color: var(--text-secondary); margin-bottom: 1.5rem; line-height: 1.5;">${res.error || `No questions found for concept '${currentAssessmentConcept}'.`}</p>
                    <a href="#/student/dashboard" class="btn btn-outline"><i class="fa-solid fa-house"></i> Return to Hub</a>
                </div>
            `;
            return;
        }

        questions = res.questions;
        selectedAnswers = {};
        currentQuestionIndex = 0;
        currentSessionId = res.session_id || currentSessionId;
        startTime = Date.now();

        renderQuestionScreen(container, 0);

    } catch (err) {
        container.innerHTML = `
            <div class="card" style="text-align: center; padding: 4rem 1.5rem; max-width: 600px; margin: 2rem auto;">
                <p style="color: var(--danger); font-weight: 600; margin-bottom: 1rem;">Failed to load questions: ${err.message}</p>
                <button class="btn btn-primary" id="retry-fetch-btn"><i class="fa-solid fa-rotate"></i> Retry</button>
            </div>
        `;
        document.getElementById("retry-fetch-btn")?.addEventListener("click", () => loadQuestionsAndStart(container));
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Render Question Screen
// ─────────────────────────────────────────────────────────────────────────────
function renderQuestionScreen(container, index) {
    if (index < 0 || index >= questions.length) return;
    currentQuestionIndex = index;
    const q = questions[index];
    const total = questions.length;
    const isLast = index === total - 1;
    const currentSelected = selectedAnswers[q.question_id] || null;

    container.innerHTML = `
        <div class="posttest-page c4-check-page" style="padding: 1.5rem 2rem; max-width: 860px; margin: 0 auto; color: var(--text-primary);">
            
            <!-- Question Top Header -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <div>
                    <span style="font-size: 0.8rem; font-weight: 700; color: var(--primary); text-transform: uppercase; letter-spacing: 0.5px;">
                        Question ${index + 1} of ${total}
                    </span>
                    <span class="badge" style="margin-left: 0.5rem; font-size: 0.72rem; background: var(--bg-subtle); color: var(--text-secondary);">
                        ${q.question_type || "Conceptual"}
                    </span>
                </div>
                <div style="font-size: 0.85rem; color: var(--text-secondary); font-weight: 600;">
                    ${conceptDisplayNames[currentAssessmentConcept] || currentAssessmentConcept}
                </div>
            </div>

            <!-- Progress Bar -->
            <div style="height: 6px; background: var(--border-color); border-radius: 99px; margin-bottom: 1.5rem; overflow: hidden;">
                <div style="height: 100%; width: ${((index + 1) / total) * 100}%; background: var(--primary); transition: width 0.3s ease;"></div>
            </div>

            <!-- Question Card -->
            <div class="card" style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: var(--radius); padding: 2rem; margin-bottom: 1.5rem; box-shadow: var(--shadow-sm);">
                <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 1.2rem; color: var(--text-primary); line-height: 1.5;">
                    ${escapeHtml(q.question_text)}
                </h3>

                ${q.code_snippet ? `
                    <div style="background: #0f172a; color: #f8fafc; padding: 1.2rem; border-radius: 8px; font-family: monospace; font-size: 0.9rem; margin-bottom: 1.5rem; overflow-x: auto; line-height: 1.5;">
                        <pre style="margin: 0; font-family: inherit;"><code>${escapeHtml(q.code_snippet)}</code></pre>
                    </div>
                ` : ""}

                <!-- 4 Options (A, B, C, D) -->
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    ${Object.entries(q.options || {}).map(([key, text]) => {
        const isSelected = currentSelected === key;
        return `
                            <button class="opt-choice-btn" data-key="${key}" style="text-align: left; padding: 1rem 1.2rem; border: 2px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}; background: ${isSelected ? 'var(--primary-soft)' : '#FFFFFF'}; border-radius: 8px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 1rem;">
                                <span style="display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 6px; background: ${isSelected ? 'var(--primary)' : 'var(--bg-subtle)'}; color: ${isSelected ? '#FFFFFF' : 'var(--text-secondary)'}; font-weight: 700; font-size: 0.85rem; flex-shrink: 0;">
                                    ${key}
                                </span>
                                <span style="font-size: 0.95rem; color: var(--text-primary); line-height: 1.4;">
                                    ${escapeHtml(text)}
                                </span>
                            </button>
                        `;
    }).join("")}
                </div>
            </div>

            <!-- Footer Action Controls -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
                <button class="btn btn-outline" id="prev-btn" ${index === 0 ? 'disabled style="opacity: 0.5;"' : ''}>
                    <i class="fa-solid fa-arrow-left"></i> Previous
                </button>

                <div style="display: flex; gap: 0.5rem;">
                    ${isLast
            ? `<button class="btn btn-primary" id="submit-btn" ${!currentSelected ? 'disabled style="opacity: 0.6;"' : ''} style="padding: 0.65rem 1.8rem; font-weight: 700;">Submit Understanding Check <i class="fa-solid fa-check"></i></button>`
            : `<button class="btn btn-primary" id="next-btn" ${!currentSelected ? 'disabled style="opacity: 0.6;"' : ''} style="padding: 0.65rem 1.8rem;">Next <i class="fa-solid fa-arrow-right"></i></button>`
        }
                </div>
            </div>

            <!-- Question Jump Palette -->
            <div style="display: flex; justify-content: center; gap: 0.45rem; flex-wrap: wrap; margin-top: 1.5rem; padding-top: 1.2rem; border-top: 1px solid var(--border-color);">
                ${questions.map((ques, i) => {
            const answered = Boolean(selectedAnswers[ques.question_id]);
            const isCurrent = i === index;
            const bg = isCurrent ? "var(--primary)" : (answered ? "var(--success)" : "var(--border-color)");
            return `
                        <span class="q-dot" data-idx="${i}" style="cursor: pointer; width: 12px; height: 12px; border-radius: 50%; background: ${bg}; transform: ${isCurrent ? 'scale(1.3)' : 'scale(1)'}; transition: all 0.2s;" title="Question ${i + 1}"></span>
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
            if (submitBtn) submitBtn.disabled = false;

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
            <p style="margin-top: 0.5rem;">Analyzing answer qualities and computing Random Forest Schema Mastery...</p>
        </div>
    `;

    try {
        const payload = {
            student_id: currentStudentId,
            session_id: currentSessionId,
            concept_name: currentAssessmentConcept,
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
    const understandingLevel = res.mastery_level || "Needs More Practice";
    const isDone = res.next_action === "DONE";

    const levelColors = {
        "Strong Understanding": "var(--success)",
        "Good Progress": "var(--primary)",
        "Needs More Practice": "var(--warning)",
        "Learn Again": "var(--danger)",
    };
    const levelColor = levelColors[understandingLevel] || (isDone ? "var(--success)" : "var(--danger)");

    // Display mappings
    const statusMap = {
        "Strong Understanding": "Stable",
        "Good Progress": "Progressing Well",
        "Needs More Practice": "Developing",
        "Learn Again": "Needs Support",
    };
    const learningStatus = res.learning_status || statusMap[understandingLevel] || (isDone ? "Progressing Well" : "Needs Support");

    const stepMap = {
        "DONE": "Continue",
        "LEARN_AGAIN": "Reinforce with Game Lessons",
    };
    const recommendedStep = res.student_next_action_label || stepMap[res.next_action] || (isDone ? "Continue" : "Reinforce with Game Lessons");

    const scorePct = Math.round((res.post_test_score !== undefined && res.post_test_score !== null ? res.post_test_score : 0) * 100);

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

                <div style="font-size: 0.8rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.35rem;">
                    Understanding Level
                </div>
                <h1 style="font-size: 2rem; font-weight: 800; color: ${levelColor}; margin-bottom: 0.3rem;">
                    ${escapeHtml(understandingLevel)}
                </h1>
                <p style="font-size: 1rem; color: var(--text-secondary); margin-bottom: 1.75rem;">
                    ${conceptDisplayNames[currentAssessmentConcept] || currentAssessmentConcept}
                </p>

                <!-- Student Outcome Box -->
                <div style="background: var(--bg-subtle); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.5rem; max-width: 460px; margin: 0 auto 1.8rem auto; text-align: left;">
                    <div style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 1rem; text-align: center; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
                        EVALUATION OUTCOME
                    </div>
                    
                    <div style="display: flex; flex-direction: column; gap: 0.85rem;">
                        <div>
                            <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Understanding Level:</div>
                            <div style="font-size: 1.25rem; font-weight: 800; color: ${levelColor}; margin-top: 0.15rem;">
                                ${escapeHtml(understandingLevel)}
                            </div>
                        </div>

                        <div>
                            <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Learning Status:</div>
                            <div style="font-size: 1rem; font-weight: 700; color: var(--text-primary); margin-top: 0.15rem;">
                                ${escapeHtml(learningStatus)}
                            </div>
                        </div>

                        <div>
                            <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Recommended Step:</div>
                            <div style="font-size: 1rem; font-weight: 700; color: var(--primary); margin-top: 0.15rem;">
                                ${escapeHtml(recommendedStep)}
                            </div>
                        </div>

                        <div>
                            <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Score Achieved:</div>
                            <div style="font-size: 1.15rem; font-weight: 800; color: var(--text-primary); margin-top: 0.15rem;">
                                ${scorePct}%
                            </div>
                        </div>
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

                <!-- Feedback Message -->
                <div style="background: var(--bg-subtle); border-left: 4px solid ${levelColor}; padding: 1.2rem; border-radius: 6px; text-align: left; margin-bottom: 2rem; font-size: 0.95rem; line-height: 1.5; color: var(--text-primary);">
                    <p style="margin: 0; font-weight: 500;">${message}</p>
                </div>

                <!-- Action Buttons -->
                <div style="display: flex; justify-content: center; gap: 0.75rem; flex-wrap: wrap;">
                    ${isDone
                        ? `<a href="#/student/dashboard" class="btn btn-primary btn-lg" style="padding: 0.85rem 2rem; font-weight: 700;"><i class="fa-solid fa-check"></i> Continue Learning</a>`
                        : `<a href="#/student/games" class="btn btn-primary btn-lg" style="padding: 0.85rem 2rem; font-weight: 700;"><i class="fa-solid fa-rotate-left"></i> Reinforce with Game Lessons</a>`
                    }
                    <a href="#/student/profile" class="btn btn-outline btn-lg" style="padding: 0.85rem 2rem; font-weight: 700;">
                        <i class="fa-solid fa-user"></i> View Profile
                    </a>
                </div>
            </div>

            <!-- Expandable Review -->
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
