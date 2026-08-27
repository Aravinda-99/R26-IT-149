/**
 * Post-Test Flow — Component 4: Schema Mastery Validation (MCQ)
 * =============================================================
 * Student post-learning understanding check:
 * 1. Post-Test Start Briefing
 * 2. 15-Question MCQ Assessment (Approved questions only, shuffled options)
 * 3. ML Prediction Result Screen (Random Forest Pipeline Evaluation)
 */

import { SchemaMasteryAPI } from "../../api/api.js";

const CONCEPT_NAMES = {
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

let currentStudentId = "S001";
let currentConcept = "Loops";
let currentPreTestScore = 0.45;
let currentAttemptCount = 3;
let currentTimeTaken = 360;
let currentErrorType = "LOOP_CONDITION_ERROR";
let currentErrorPatternScore = 0.40;
let currentSessionId = null;

let loadedQuestions = [];
let currentIndex = 0;
let studentAnswers = {};
let startTime = null;

export async function renderPostTest(container, opts = {}, onNavigate = null) {
    currentStudentId = opts.studentId || opts.student_id || "S001";
    currentConcept = opts.concept || opts.concept_name || "Loops";
    currentPreTestScore = typeof opts.pre_test_score === "number" ? opts.pre_test_score : 0.45;
    currentAttemptCount = opts.attempt_count || 3;
    currentTimeTaken = opts.time_taken_seconds || 360;
    currentErrorType = opts.error_type || "LOOP_CONDITION_ERROR";
    currentErrorPatternScore = typeof opts.error_pattern_score === "number" ? opts.error_pattern_score : 0.40;
    currentSessionId = opts.sessionId || opts.session_id || `SES_${Date.now()}`;

    loadedQuestions = [];
    currentIndex = 0;
    studentAnswers = {};
    startTime = Date.now();

    renderStartScreen(container, onNavigate);
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Post-Test Start Screen
// ─────────────────────────────────────────────────────────────────────────────
function renderStartScreen(container, onNavigate) {
    const conceptTitle = CONCEPT_NAMES[currentConcept] || currentConcept;

    container.innerHTML = `
        <div style="max-width: 860px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem;">
            <!-- Header -->
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
                <div>
                    <button class="btn btn-secondary btn-sm" id="pt-back-btn" style="margin-bottom: 0.75rem;">
                        <i class="fa-solid fa-arrow-left"></i> Back to Dashboard
                    </button>
                    <h1 style="font-size: 1.75rem; font-weight: 800; color: #0F172A; display: flex; align-items: center; gap: 0.6rem;">
                        <i class="fa-solid fa-clipboard-check" style="color: #2563EB;"></i>
                        Post-Learning Understanding Check
                    </h1>
                    <p style="color: #64748B; font-size: 0.9375rem; margin-top: 0.25rem;">
                        Schema Mastery Assessment for <strong>${conceptTitle}</strong>
                    </p>
                </div>
                <span class="badge badge-primary" style="padding: 0.4rem 0.8rem; font-size: 0.8125rem;">
                    Component 4 Validation
                </span>
            </div>

            <!-- Upstream Evidence Context -->
            <div class="card">
                <div class="card-header">
                    <div class="card-title">
                        <i class="fa-solid fa-layer-group" style="color: #2563EB;"></i> Upstream Diagnostic Evidence
                    </div>
                    <span style="font-size: 0.8125rem; font-weight: 600; color: #64748B;">Student: ${currentStudentId}</span>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                    <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 1rem; border-radius: 8px;">
                        <span style="font-size: 0.75rem; font-weight: 700; color: #64748B; text-transform: uppercase;">Prior Pre-Test Score</span>
                        <div style="font-size: 1.5rem; font-weight: 800; color: #0284C7; margin-top: 0.25rem;">
                            ${Math.round(currentPreTestScore * 100)}%
                        </div>
                    </div>
                    <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 1rem; border-radius: 8px;">
                        <span style="font-size: 0.75rem; font-weight: 700; color: #64748B; text-transform: uppercase;">Target Error Focus</span>
                        <div style="font-size: 1.1rem; font-weight: 800; color: #DC2626; margin-top: 0.25rem; word-break: break-word;">
                            ${currentErrorType}
                        </div>
                    </div>
                    <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 1rem; border-radius: 8px;">
                        <span style="font-size: 0.75rem; font-weight: 700; color: #64748B; text-transform: uppercase;">Learning Attempt</span>
                        <div style="font-size: 1.5rem; font-weight: 800; color: #7C3AED; margin-top: 0.25rem;">
                            Attempt #${currentAttemptCount}
                        </div>
                    </div>
                </div>

                <div class="alert alert-info" style="margin-bottom: 1.75rem;">
                    <i class="fa-solid fa-circle-info" style="margin-top: 0.15rem;"></i>
                    <div>
                        <strong>Instructions:</strong> You will complete a <strong>15-question multiple choice assessment</strong>.
                        Questions are sourced directly from the verified <strong>Approved Question Bank</strong>. Take your time to trace each code snippet carefully.
                    </div>
                </div>

                <div style="display: flex; justify-content: flex-end;">
                    <button class="btn btn-primary btn-lg" id="pt-begin-btn">
                        Begin Post-Test <i class="fa-solid fa-arrow-right" style="margin-left: 0.4rem;"></i>
                    </button>
                </div>
            </div>
        </div>
    `;

    document.getElementById("pt-back-btn")?.addEventListener("click", () => {
        if (onNavigate) onNavigate("/student/dashboard");
    });

    document.getElementById("pt-begin-btn")?.addEventListener("click", async () => {
        await loadAndStartAssessment(container, onNavigate);
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Fetch Questions & Render Question Assessment
// ─────────────────────────────────────────────────────────────────────────────
async function loadAndStartAssessment(container, onNavigate) {
    container.innerHTML = `
        <div style="text-align: center; padding: 5rem 1rem;">
            <div class="spinner" style="margin-bottom: 1.5rem;"></div>
            <h3 style="font-size: 1.25rem; font-weight: 700; color: #0F172A;">Loading Approved Post-Test Questions...</h3>
            <p style="color: #64748B; font-size: 0.875rem; margin-top: 0.4rem;">
                Fetching 15 approved questions for ${currentConcept} with randomized options
            </p>
        </div>
    `;

    try {
        const res = await SchemaMasteryAPI.getPostTestQuestions({
            student_id: currentStudentId,
            concept: currentConcept,
            error_type: currentErrorType,
            session_id: currentSessionId,
        });

        if (res.success && res.questions && res.questions.length > 0) {
            loadedQuestions = res.questions;
            currentSessionId = res.session_id || currentSessionId;
            currentIndex = 0;
            startTime = Date.now();
            renderQuestionView(container, onNavigate);
        } else {
            throw new Error("No approved questions found in the Question Bank for this concept. Please notify the teacher.");
        }
    } catch (err) {
        container.innerHTML = `
            <div class="card" style="max-width: 600px; margin: 3rem auto; text-align: center; padding: 2.5rem;">
                <div style="width: 56px; height: 56px; border-radius: 50%; background: #FEE2E2; color: #DC2626; display: inline-flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 1rem;">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                </div>
                <h2 style="font-size: 1.35rem; font-weight: 800; color: #0F172A; margin-bottom: 0.5rem;">Unable to Start Post-Test</h2>
                <p style="color: #64748B; font-size: 0.875rem; margin-bottom: 1.5rem;">${err.message}</p>
                <button class="btn btn-primary" id="pt-err-back-btn">Return to Dashboard</button>
            </div>
        `;
        document.getElementById("pt-err-back-btn")?.addEventListener("click", () => {
            if (onNavigate) onNavigate("/student/dashboard");
        });
    }
}

function renderQuestionView(container, onNavigate) {
    const q = loadedQuestions[currentIndex];
    const total = loadedQuestions.length;
    const answeredCount = Object.keys(studentAnswers).length;
    const isAnswered = !!studentAnswers[q.question_id];

    container.innerHTML = `
        <div style="max-width: 860px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem;">
            
            <!-- Progress & Stepper Bar -->
            <div class="card" style="padding: 1.25rem 1.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <strong style="font-size: 1rem; color: #0F172A;">Question ${currentIndex + 1} of ${total}</strong>
                        <span class="badge badge-info" style="font-size: 0.7rem;">${q.question_type || 'MCQ'}</span>
                    </div>
                    <span style="font-size: 0.8125rem; font-weight: 600; color: #64748B;">
                        ${answeredCount} / ${total} Answered
                    </span>
                </div>

                <!-- Numbered Question Dots -->
                <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
                    ${loadedQuestions.map((item, idx) => {
                        const isCurrent = idx === currentIndex;
                        const hasAns = !!studentAnswers[item.question_id];
                        let bg = "#F1F5F9";
                        let border = "#E2E8F0";
                        let text = "#64748B";

                        if (isCurrent) {
                            border = "#2563EB";
                            bg = "#DBEAFE";
                            text = "#2563EB";
                        } else if (hasAns) {
                            bg = "#2563EB";
                            border = "#2563EB";
                            text = "#FFFFFF";
                        }

                        return `
                            <button class="q-nav-dot" data-idx="${idx}" style="width: 32px; height: 32px; border-radius: 6px; border: 2px solid ${border}; background: ${bg}; color: ${text}; font-size: 0.75rem; font-weight: 700; cursor: pointer; transition: all 150ms;">
                                ${idx + 1}
                            </button>
                        `;
                    }).join("")}
                </div>
            </div>

            <!-- Question Card -->
            <div class="card" style="padding: 2rem;">
                <div style="font-size: 1.15rem; font-weight: 700; color: #0F172A; margin-bottom: 1.25rem; line-height: 1.5;">
                    ${q.question_text || q.text || 'Question Prompt'}
                </div>

                ${q.code_snippet ? `
                    <div class="code-box" style="margin-bottom: 1.5rem;">
                        <pre><code>${escapeHtml(q.code_snippet)}</code></pre>
                    </div>
                ` : ''}

                <!-- Options -->
                <div style="display: flex; flex-direction: column; gap: 0.75rem;" id="options-list">
                    ${Object.entries(q.options || {}).map(([key, val]) => {
                        const isSelected = studentAnswers[q.question_id] === key;
                        return `
                            <label class="opt-label" data-key="${key}" style="display: flex; align-items: center; gap: 0.85rem; padding: 1rem 1.25rem; border: 2px solid ${isSelected ? '#2563EB' : '#E2E8F0'}; background: ${isSelected ? '#EFF6FF' : '#FFFFFF'}; border-radius: 10px; cursor: pointer; transition: all 150ms;">
                                <input type="radio" name="opt" value="${key}" ${isSelected ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: #2563EB;">
                                <div style="display: flex; align-items: center; gap: 0.6rem; width: 100%;">
                                    <span style="display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 6px; background: ${isSelected ? '#2563EB' : '#F1F5F9'}; color: ${isSelected ? '#FFFFFF' : '#475569'}; font-size: 0.8125rem; font-weight: 800;">
                                        ${key}
                                    </span>
                                    <span style="font-size: 0.9375rem; color: #1E293B; font-weight: ${isSelected ? '600' : '400'};">
                                        ${escapeHtml(val)}
                                    </span>
                                </div>
                            </label>
                        `;
                    }).join("")}
                </div>

                <!-- Navigation Controls -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 2rem; padding-top: 1.25rem; border-top: 1px solid #E2E8F0;">
                    <button class="btn btn-secondary" id="pt-prev-btn" ${currentIndex === 0 ? 'disabled' : ''}>
                        <i class="fa-solid fa-arrow-left"></i> Previous
                    </button>

                    ${currentIndex < total - 1 ? `
                        <button class="btn btn-primary" id="pt-next-btn">
                            Next Question <i class="fa-solid fa-arrow-right" style="margin-left: 0.35rem;"></i>
                        </button>
                    ` : `
                        <button class="btn btn-success" id="pt-submit-btn" style="padding: 0.75rem 2rem; font-size: 1rem; font-weight: 700;">
                            Submit for ML Evaluation <i class="fa-solid fa-check" style="margin-left: 0.4rem;"></i>
                        </button>
                    `}
                </div>
            </div>
        </div>
    `;

    // Attach listeners
    container.querySelectorAll(".opt-label").forEach(label => {
        label.addEventListener("click", () => {
            const key = label.dataset.key;
            studentAnswers[q.question_id] = key;
            renderQuestionView(container, onNavigate);
        });
    });

    container.querySelectorAll(".q-nav-dot").forEach(dot => {
        dot.addEventListener("click", () => {
            const targetIdx = parseInt(dot.dataset.idx);
            if (!isNaN(targetIdx)) {
                currentIndex = targetIdx;
                renderQuestionView(container, onNavigate);
            }
        });
    });

    document.getElementById("pt-prev-btn")?.addEventListener("click", () => {
        if (currentIndex > 0) {
            currentIndex--;
            renderQuestionView(container, onNavigate);
        }
    });

    document.getElementById("pt-next-btn")?.addEventListener("click", () => {
        if (currentIndex < loadedQuestions.length - 1) {
            currentIndex++;
            renderQuestionView(container, onNavigate);
        }
    });

    document.getElementById("pt-submit-btn")?.addEventListener("click", async () => {
        const answeredCount = Object.keys(studentAnswers).length;
        const total = loadedQuestions.length;

        if (answeredCount < total) {
            const confirmSubmit = confirm(`You have answered ${answeredCount} out of ${total} questions. Unanswered questions will be scored as 0. Do you want to proceed?`);
            if (!confirmSubmit) return;
        }

        await submitPostTest(container, onNavigate);
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Submit Post-Test & Render Machine Learning Results
// ─────────────────────────────────────────────────────────────────────────────
async function submitPostTest(container, onNavigate) {
    const elapsedSeconds = Math.max(15, Math.round((Date.now() - startTime) / 1000));
    
    container.innerHTML = `
        <div style="text-align: center; padding: 5rem 1rem;">
            <div class="spinner" style="margin-bottom: 1.5rem;"></div>
            <h3 style="font-size: 1.35rem; font-weight: 800; color: #0F172A;">Evaluating Post-Test Evidence...</h3>
            <p style="color: #64748B; font-size: 0.9rem; margin-top: 0.4rem;">
                Submitting multi-source behavioral vector to trained <code>schema_mastery_pipeline.pkl</code>
            </p>
        </div>
    `;

    const answersPayload = loadedQuestions.map((q) => ({
        question_id: q.question_id,
        selected_option: studentAnswers[q.question_id] || "",
    }));

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

    try {
        const result = await SchemaMasteryAPI.submitPostTest(payload);
        renderResultScreen(container, result, onNavigate);
    } catch (err) {
        container.innerHTML = `
            <div class="card" style="max-width: 600px; margin: 3rem auto; text-align: center; padding: 2.5rem;">
                <div style="font-size: 2rem; color: #DC2626; margin-bottom: 1rem;">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                </div>
                <h2 style="font-size: 1.35rem; font-weight: 800; color: #0F172A; margin-bottom: 0.5rem;">Submission Failed</h2>
                <p style="color: #64748B; font-size: 0.875rem; margin-bottom: 1.5rem;">${err.message}</p>
                <button class="btn btn-primary" id="retry-submit-btn">Retry Submission</button>
            </div>
        `;
        document.getElementById("retry-submit-btn")?.addEventListener("click", () => submitPostTest(container, onNavigate));
    }
}

function renderResultScreen(container, res, onNavigate) {
    const isDone = res.next_action === "DONE";
    const masteryProbPct = Math.round((res.mastery_probability || 0) * 100);

    const levelColors = {
        "Strong Understanding": "#16A34A",
        "Good Progress": "#2563EB",
        "Needs More Practice": "#D97706",
        "Learn Again": "#DC2626",
    };
    const levelColor = levelColors[res.mastery_level] || (isDone ? "#16A34A" : "#DC2626");

    container.innerHTML = `
        <div style="max-width: 860px; margin: 0 auto; display: flex; flex-direction: column; gap: 2rem;">
            
            <!-- Result Hero Card -->
            <div class="card" style="text-align: center; padding: 3rem 2rem; border-top: 6px solid ${levelColor}; box-shadow: var(--shadow-lg);">
                <!-- Outcome Icon -->
                <div style="width: 80px; height: 80px; border-radius: 50%; background: ${isDone ? '#DCFCE7' : '#FEE2E2'}; color: ${levelColor}; display: inline-flex; align-items: center; justify-content: center; font-size: 2.25rem; margin-bottom: 1.25rem;">
                    <i class="fa-solid ${isDone ? 'fa-circle-check' : 'fa-rotate-left'}"></i>
                </div>

                <h1 style="font-size: 2rem; font-weight: 800; color: #0F172A; margin-bottom: 0.35rem;">
                    ${res.mastery_level}
                </h1>
                <p style="color: #64748B; font-size: 1rem; margin-bottom: 1.75rem;">
                    Concept: <strong>${CONCEPT_NAMES[currentConcept] || currentConcept}</strong>
                </p>

                <!-- ML Pipeline Badge Box -->
                <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 1.25rem; max-width: 520px; margin: 0 auto 2rem auto;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <span style="font-size: 0.75rem; font-weight: 700; color: #64748B; text-transform: uppercase;">
                            ML Decision Output
                        </span>
                        <span class="badge ${isDone ? 'badge-success' : 'badge-danger'}">
                            ${res.next_action}
                        </span>
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 0.875rem; color: #334155; font-weight: 600;">Mastery Probability:</span>
                        <strong style="font-size: 1.25rem; color: ${levelColor};">${masteryProbPct}%</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.35rem; font-size: 0.75rem; color: #94A3B8;">
                        <span>Trained Model Engine:</span>
                        <code>${res.model_used}</code>
                    </div>
                </div>

                <!-- 4-Tier Answer Quality Metrics -->
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem;">
                    <div style="background: #DCFCE7; border: 1px solid #BBF7D0; padding: 1rem 0.75rem; border-radius: 10px;">
                        <span style="font-size: 0.75rem; font-weight: 700; color: #16A34A; text-transform: uppercase;">Correct (+1.0)</span>
                        <div style="font-size: 1.75rem; font-weight: 800; color: #16A34A; margin-top: 0.2rem;">
                            ${res.post_test_correct_count || 0}
                        </div>
                    </div>
                    <div style="background: #FEF3C7; border: 1px solid #FDE68A; padding: 1rem 0.75rem; border-radius: 10px;">
                        <span style="font-size: 0.75rem; font-weight: 700; color: #D97706; text-transform: uppercase;">Nearly Correct (+0.5)</span>
                        <div style="font-size: 1.75rem; font-weight: 800; color: #D97706; margin-top: 0.2rem;">
                            ${res.post_test_nearly_correct_count || 0}
                        </div>
                    </div>
                    <div style="background: #FEE2E2; border: 1px solid #FECACA; padding: 1rem 0.75rem; border-radius: 10px;">
                        <span style="font-size: 0.75rem; font-weight: 700; color: #DC2626; text-transform: uppercase;">Wrong (0.0)</span>
                        <div style="font-size: 1.75rem; font-weight: 800; color: #DC2626; margin-top: 0.2rem;">
                            ${res.post_test_wrong_count || 0}
                        </div>
                    </div>
                    <div style="background: #F1F5F9; border: 1px solid #E2E8F0; padding: 1rem 0.75rem; border-radius: 10px;">
                        <span style="font-size: 0.75rem; font-weight: 700; color: #475569; text-transform: uppercase;">Clearly Wrong (0.0)</span>
                        <div style="font-size: 1.75rem; font-weight: 800; color: #475569; margin-top: 0.2rem;">
                            ${res.post_test_clearly_wrong_count || 0}
                        </div>
                    </div>
                </div>

                <!-- Pedagogical Guidance -->
                <div class="alert ${isDone ? 'alert-success' : 'alert-warning'}" style="text-align: left; margin-bottom: 2rem;">
                    <i class="fa-solid ${isDone ? 'fa-circle-check' : 'fa-lightbulb'}" style="margin-top: 0.15rem;"></i>
                    <div>
                        ${isDone 
                            ? `<strong>Mastery Verified!</strong> You have demonstrated solid schema understanding and are ready to advance to the next programming concept in your learning path.`
                            : `<strong>Remediation Recommended:</strong> Your schema mastery evaluation indicates additional reinforcement is needed for ${CONCEPT_NAMES[currentConcept] || currentConcept}. Please repeat the gamified challenges to correct underlying misconceptions.`
                        }
                    </div>
                </div>

                <!-- Action Button -->
                <div>
                    ${isDone ? `
                        <button class="btn btn-primary btn-lg" id="res-action-btn" style="padding: 0.85rem 3rem;">
                            Advance to Next Module <i class="fa-solid fa-arrow-right" style="margin-left: 0.4rem;"></i>
                        </button>
                    ` : `
                        <button class="btn btn-primary btn-lg" id="res-action-btn" style="padding: 0.85rem 3rem; background: #2563EB;">
                            Repeat Game Lesson <i class="fa-solid fa-gamepad" style="margin-left: 0.4rem;"></i>
                        </button>
                    `}
                </div>
            </div>

            <!-- Question-by-Question Review Accordion -->
            ${res.results && res.results.length > 0 ? `
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">
                            <i class="fa-solid fa-list-check" style="color: #2563EB;"></i> Answer Review & Pedagogical Explanations
                        </div>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 1rem;">
                        ${res.results.map((item, idx) => `
                            <div style="padding: 1.25rem; border: 1px solid ${item.is_correct ? '#BBF7D0' : '#FECACA'}; background: ${item.is_correct ? '#F0FDF4' : '#FEF2F2'}; border-radius: 8px;">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                                    <strong style="font-size: 0.9375rem; color: #0F172A;">
                                        ${idx + 1}. ${escapeHtml(item.question)}
                                    </strong>
                                    <span class="badge ${item.answer_quality === 'Correct' ? 'badge-success' : item.answer_quality === 'Nearly Correct' ? 'badge-warning' : 'badge-danger'}">
                                        ${item.answer_quality}
                                    </span>
                                </div>

                                <div style="font-size: 0.8125rem; color: #475569; margin-bottom: 0.5rem;">
                                    <span>Selected: <strong>Option ${item.selected}</strong></span> • 
                                    <span>Correct: <strong>Option ${item.correct}</strong></span>
                                </div>

                                ${item.explanation ? `
                                    <div style="font-size: 0.8125rem; color: #334155; background: rgba(255,255,255,0.7); padding: 0.6rem 0.8rem; border-radius: 6px; border-left: 3px solid #2563EB;">
                                        <strong>Explanation:</strong> ${escapeHtml(item.explanation)}
                                    </div>
                                ` : ''}
                            </div>
                        `).join("")}
                    </div>
                </div>
            ` : ''}
        </div>
    `;

    document.getElementById("res-action-btn")?.addEventListener("click", () => {
        if (onNavigate) {
            if (isDone) {
                onNavigate("/student/dashboard");
            } else {
                onNavigate("/student/games");
            }
        }
    });
}

function escapeHtml(text) {
    if (!text) return "";
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
