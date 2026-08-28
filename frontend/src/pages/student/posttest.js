/**
 * Post-Test Flow — CodeQuest Post-Learning Understanding Check
 * =============================================================
 * Real-world student assessment flow:
 * 1. Start Briefing (clean, friendly introduction)
 * 2. 15-Question Interactive MCQ Assessment (Shuffled options, secret grading)
 * 3. Student-Friendly Result Screen (Understanding level, score, next step)
 * 
 * NOTE: Normal student view HIDES raw ML model names, probabilities, and
 * internal feature details.
 */

import { SchemaMasteryAPI } from "../../api/api.js";
import { animatePageEntrance, animateStepTransition } from "../../utils/animations.js";

const CONCEPT_NAMES = {
    variables: "Variables & Data Types",
    operators: "Operators & Expressions",
    loops: "Loops & Iteration",
    arrays: "Arrays & Collections",
    methods: "Methods & Functions",
    Variables: "Variables & Data Types",
    Operators: "Operators & Expressions",
    Loops: "Loops & Iteration",
    Arrays: "Arrays & Collections",
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
    currentAttemptCount = opts.attempt_count || 1;
    currentTimeTaken = opts.time_taken_seconds || 120;
    currentErrorType = opts.error_type || "UNKNOWN_ERROR";
    currentErrorPatternScore = typeof opts.error_pattern_score === "number" ? opts.error_pattern_score : 0.50;
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
        <div class="posttest-start-wrap" style="max-width: 780px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.75rem;">
            
            <!-- Header -->
            <div>
                <button class="btn btn-secondary btn-sm" id="pt-back-btn" style="margin-bottom: 1rem;">
                    <i class="fa-solid fa-arrow-left"></i> Return to Dashboard
                </button>
                <h1 style="font-size: 1.875rem; font-weight: 800; color: #0F172A; margin-bottom: 0.35rem; display: flex; align-items: center; gap: 0.6rem;">
                    <i class="fa-solid fa-clipboard-check" style="color: #2563EB;"></i>
                    Understanding Check: ${conceptTitle}
                </h1>
                <p style="color: #64748B; font-size: 1rem;">
                    Test your understanding after completing your learning activities.
                </p>
            </div>

            <!-- Overview Card -->
            <div class="card" style="padding: 2.25rem; border-radius: 14px; border: 1px solid #E2E8F0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                <div style="display: flex; align-items: flex-start; gap: 1.25rem; margin-bottom: 1.75rem;">
                    <div style="width: 52px; height: 52px; border-radius: 12px; background: #DBEAFE; color: #2563EB; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; flex-shrink: 0;">
                        <i class="fa-solid fa-graduation-cap"></i>
                    </div>
                    <div>
                        <h2 style="font-size: 1.25rem; font-weight: 800; color: #0F172A; margin-bottom: 0.35rem;">
                            How this check works
                        </h2>
                        <p style="font-size: 0.9375rem; color: #64748B; line-height: 1.6;">
                            You will answer <strong>15 multiple-choice questions</strong> designed to check your understanding of key concepts and code snippets. After submitting, you'll receive immediate feedback and a personalized next-step recommendation.
                        </p>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                    <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 1rem; border-radius: 10px;">
                        <div style="font-size: 0.75rem; font-weight: 700; color: #64748B; text-transform: uppercase;">Total Questions</div>
                        <div style="font-size: 1.5rem; font-weight: 800; color: #0F172A; margin-top: 0.25rem;">15 Questions</div>
                    </div>
                    <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 1rem; border-radius: 10px;">
                        <div style="font-size: 0.75rem; font-weight: 700; color: #64748B; text-transform: uppercase;">Estimated Time</div>
                        <div style="font-size: 1.5rem; font-weight: 800; color: #0F766E; margin-top: 0.25rem;">8–12 Minutes</div>
                    </div>
                    <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 1rem; border-radius: 10px;">
                        <div style="font-size: 0.75rem; font-weight: 700; color: #64748B; text-transform: uppercase;">Focus Topic</div>
                        <div style="font-size: 1.25rem; font-weight: 800; color: #2563EB; margin-top: 0.25rem;">${conceptTitle}</div>
                    </div>
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 1rem; border-top: 1px solid #E2E8F0; padding-top: 1.5rem;">
                    <button class="btn btn-primary" id="pt-begin-test-btn" style="padding: 0.75rem 2rem; font-size: 1rem; font-weight: 700; border-radius: 10px;">
                        Start Understanding Check <i class="fa-solid fa-arrow-right" style="margin-left: 0.5rem;"></i>
                    </button>
                </div>
            </div>

        </div>
    `;

    animatePageEntrance(container.querySelector(".posttest-start-wrap"));

    document.getElementById("pt-back-btn")?.addEventListener("click", () => {
        if (onNavigate) onNavigate("/student/dashboard");
    });

    document.getElementById("pt-begin-test-btn")?.addEventListener("click", () => {
        loadAndStartQuestions(container, onNavigate);
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Load Questions from Backend
// ─────────────────────────────────────────────────────────────────────────────
async function loadAndStartQuestions(container, onNavigate) {
    container.innerHTML = `
        <div style="min-height: 50vh; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <div class="spinner" style="margin-bottom: 1.25rem;"></div>
            <div style="font-size: 1rem; font-weight: 700; color: #0F172A;">Preparing Your Understanding Check...</div>
            <div style="font-size: 0.875rem; color: #64748B; margin-top: 0.25rem;">Selecting questions from the approved question bank</div>
        </div>
    `;

    try {
        const res = await SchemaMasteryAPI.getPostTestQuestions(currentStudentId, currentConcept, currentErrorType, currentSessionId);
        
        if (res.success && res.questions && res.questions.length > 0) {
            loadedQuestions = res.questions;
            if (res.session_id) currentSessionId = res.session_id;
            currentIndex = 0;
            studentAnswers = {};
            startTime = Date.now();
            renderQuestionView(container, onNavigate);
        } else {
            throw new Error("Unable to load questions for this topic.");
        }
    } catch (err) {
        container.innerHTML = `
            <div class="card" style="max-width: 600px; margin: 3rem auto; text-align: center; padding: 2.5rem; border-radius: 14px;">
                <div style="font-size: 2.25rem; color: #DC2626; margin-bottom: 1rem;">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                </div>
                <h2 style="font-size: 1.35rem; font-weight: 800; color: #0F172A; margin-bottom: 0.5rem;">
                    Unable to Load Questions
                </h2>
                <p style="color: #64748B; font-size: 0.9rem; margin-bottom: 1.5rem;">
                    ${err.message || "Please check your network connection and retry."}
                </p>
                <div style="display: flex; justify-content: center; gap: 1rem;">
                    <button class="btn btn-secondary" id="retry-dash-btn">Return to Dashboard</button>
                    <button class="btn btn-primary" id="retry-load-btn">Retry</button>
                </div>
            </div>
        `;
        document.getElementById("retry-dash-btn")?.addEventListener("click", () => {
            if (onNavigate) onNavigate("/student/dashboard");
        });
        document.getElementById("retry-load-btn")?.addEventListener("click", () => {
            loadAndStartQuestions(container, onNavigate);
        });
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Render Question View
// ─────────────────────────────────────────────────────────────────────────────
function renderQuestionView(container, onNavigate) {
    if (!loadedQuestions || loadedQuestions.length === 0) return;

    const q = loadedQuestions[currentIndex];
    const total = loadedQuestions.length;
    const progressPct = Math.round(((currentIndex + 1) / total) * 100);
    const selectedOption = studentAnswers[q.question_id] || "";
    const isLast = currentIndex === total - 1;

    const options = q.options || {};
    const optionKeys = ["A", "B", "C", "D"];

    container.innerHTML = `
        <div class="posttest-question-wrap" style="max-width: 840px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem;">
            
            <!-- Top Progress Header -->
            <div class="card" style="padding: 1.25rem 1.75rem; border-radius: 12px; border: 1px solid #E2E8F0;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem;">
                    <span style="font-size: 0.875rem; font-weight: 700; color: #2563EB;">
                        Question ${currentIndex + 1} of ${total}
                    </span>
                    <span style="font-size: 0.8125rem; font-weight: 600; color: #64748B;">
                        ${progressPct}% Completed
                    </span>
                </div>
                <div style="height: 6px; background: #E2E8F0; border-radius: 999px; overflow: hidden;">
                    <div style="height: 100%; width: ${progressPct}%; background: #2563EB; transition: width 200ms ease;"></div>
                </div>
            </div>

            <!-- Question Card -->
            <div class="card question-main-card" id="q-content-card" style="padding: 2.25rem; border-radius: 14px; border: 1px solid #E2E8F0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                
                <h2 style="font-size: 1.15rem; font-weight: 700; color: #0F172A; line-height: 1.5; margin-bottom: 1.25rem;">
                    ${q.question_text || "Consider the following code snippet:"}
                </h2>

                ${q.code_snippet ? `
                    <div style="background: #1E293B; color: #F8FAFC; padding: 1.25rem; border-radius: 10px; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1.75rem; overflow-x: auto; border: 1px solid #334155;">
                        <pre style="margin: 0; font-family: inherit;"><code>${escapeHtml(q.code_snippet)}</code></pre>
                    </div>
                ` : ""}

                <!-- Options List -->
                <div style="display: flex; flex-direction: column; gap: 0.85rem;" id="options-list">
                    ${optionKeys.map((k) => {
                        const optText = options[k] || "";
                        if (!optText) return "";
                        const isSelected = selectedOption === k;

                        return `
                            <label class="pt-option-label ${isSelected ? 'selected' : ''}" data-key="${k}" style="display: flex; align-items: flex-start; gap: 0.85rem; padding: 1rem 1.25rem; border: 1.5px solid ${isSelected ? '#2563EB' : '#E2E8F0'}; background: ${isSelected ? '#EFF6FF' : '#FFFFFF'}; border-radius: 10px; cursor: pointer; transition: all 150ms;">
                                <div style="width: 28px; height: 28px; border-radius: 6px; background: ${isSelected ? '#2563EB' : '#F1F5F9'}; color: ${isSelected ? '#FFFFFF' : '#475569'}; display: flex; align-items: center; justify-content: center; font-size: 0.8125rem; font-weight: 700; flex-shrink: 0;">
                                    ${k}
                                </div>
                                <div style="flex: 1; font-size: 0.9375rem; color: #0F172A; line-height: 1.5; padding-top: 0.2rem;">
                                    ${escapeHtml(optText)}
                                </div>
                            </label>
                        `;
                    }).join("")}
                </div>

                <!-- Footer Navigation -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 2.25rem; padding-top: 1.5rem; border-top: 1px solid #E2E8F0;">
                    <button class="btn btn-secondary" id="pt-prev-btn" ${currentIndex === 0 ? "disabled" : ""} style="padding: 0.6rem 1.25rem;">
                        <i class="fa-solid fa-arrow-left"></i> Previous
                    </button>

                    <div style="display: flex; gap: 0.75rem;">
                        ${isLast ? `
                            <button class="btn btn-primary" id="pt-submit-btn" style="padding: 0.65rem 1.75rem; font-weight: 700; background: #16A34A; border-color: #16A34A;">
                                Submit Answers <i class="fa-solid fa-check" style="margin-left: 0.35rem;"></i>
                            </button>
                        ` : `
                            <button class="btn btn-primary" id="pt-next-btn" style="padding: 0.65rem 1.5rem; font-weight: 700;">
                                Next Question <i class="fa-solid fa-arrow-right" style="margin-left: 0.35rem;"></i>
                            </button>
                        `}
                    </div>
                </div>

            </div>

        </div>
    `;

    animateStepTransition(document.getElementById("q-content-card"), 1);

    // Option Selection Handlers
    container.querySelectorAll(".pt-option-label").forEach((lbl) => {
        lbl.addEventListener("click", () => {
            const key = lbl.dataset.key;
            studentAnswers[q.question_id] = key;
            renderQuestionView(container, onNavigate);
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

    document.getElementById("pt-submit-btn")?.addEventListener("click", () => {
        const answeredCount = Object.keys(studentAnswers).length;
        if (answeredCount < total) {
            const confirmed = confirm(`You have answered ${answeredCount} of ${total} questions. Do you want to submit anyway?`);
            if (!confirmed) return;
        }
        submitPostTest(container, onNavigate);
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Submit Answers to Backend & Grade
// ─────────────────────────────────────────────────────────────────────────────
async function submitPostTest(container, onNavigate) {
    container.innerHTML = `
        <div style="min-height: 50vh; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <div class="spinner" style="margin-bottom: 1.25rem;"></div>
            <div style="font-size: 1.15rem; font-weight: 800; color: #0F172A;">Evaluating Your Responses...</div>
            <div style="font-size: 0.875rem; color: #64748B; margin-top: 0.35rem;">Analyzing answer accuracy and generating personalized recommendation</div>
        </div>
    `;

    const elapsedSeconds = Math.round((Date.now() - (startTime || Date.now())) / 1000);

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
            <div class="card" style="max-width: 600px; margin: 3rem auto; text-align: center; padding: 2.5rem; border-radius: 14px;">
                <div style="font-size: 2.25rem; color: #DC2626; margin-bottom: 1rem;">
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

// ─────────────────────────────────────────────────────────────────────────────
// 5. Render Student-Friendly Result Screen
// ─────────────────────────────────────────────────────────────────────────────
function renderResultScreen(container, res, onNavigate) {
    const isDone = res.next_action === "DONE";
    const scorePercentage = Math.round((res.post_test_score || 0) * 100);

    const levelColors = {
        "Strong Understanding": "#16A34A",
        "Good Progress": "#2563EB",
        "Needs More Practice": "#D97706",
        "Learn Again": "#DC2626",
    };
    const levelColor = levelColors[res.mastery_level] || (isDone ? "#16A34A" : "#D97706");

    container.innerHTML = `
        <div class="posttest-result-wrap" style="max-width: 860px; margin: 0 auto; display: flex; flex-direction: column; gap: 2rem;">
            
            <!-- Result Hero Card -->
            <div class="card" style="text-align: center; padding: 3rem 2rem; border-top: 6px solid ${levelColor}; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.06);">
                
                <div style="width: 72px; height: 72px; border-radius: 50%; background: ${isDone ? '#DCFCE7' : '#FEF3C7'}; color: ${levelColor}; display: inline-flex; align-items: center; justify-content: center; font-size: 2rem; margin-bottom: 1.25rem;">
                    <i class="fa-solid ${isDone ? 'fa-circle-check' : 'fa-lightbulb'}"></i>
                </div>

                <div style="font-size: 0.8125rem; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.35rem;">
                    Your Understanding Level
                </div>

                <h1 style="font-size: 2rem; font-weight: 800; color: #0F172A; margin-bottom: 0.5rem;">
                    ${res.mastery_level}
                </h1>

                <p style="color: #64748B; font-size: 0.95rem; max-width: 540px; margin: 0 auto 2rem auto; line-height: 1.5;">
                    ${res.explanation_message || (isDone ? "Great job! You have demonstrated solid conceptual understanding." : "We recommend reviewing this concept to strengthen your understanding.")}
                </p>

                <!-- Score Overview Grid -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; max-width: 620px; margin: 0 auto 2rem auto;">
                    <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 1.15rem; border-radius: 12px;">
                        <span style="font-size: 0.75rem; font-weight: 700; color: #64748B; text-transform: uppercase;">Check Score</span>
                        <div style="font-size: 1.65rem; font-weight: 800; color: #0F172A; margin-top: 0.25rem;">${scorePercentage}%</div>
                    </div>
                    <div style="background: #DCFCE7; border: 1px solid #BBF7D0; padding: 1.15rem; border-radius: 12px;">
                        <span style="font-size: 0.75rem; font-weight: 700; color: #16A34A; text-transform: uppercase;">Correct</span>
                        <div style="font-size: 1.65rem; font-weight: 800; color: #16A34A; margin-top: 0.25rem;">${res.post_test_correct_count || 0}</div>
                    </div>
                    <div style="background: #FEF3C7; border: 1px solid #FDE68A; padding: 1.15rem; border-radius: 12px;">
                        <span style="font-size: 0.75rem; font-weight: 700; color: #D97706; text-transform: uppercase;">Nearly Correct</span>
                        <div style="font-size: 1.65rem; font-weight: 800; color: #D97706; margin-top: 0.25rem;">${res.post_test_nearly_correct_count || 0}</div>
                    </div>
                    <div style="background: #F1F5F9; border: 1px solid #E2E8F0; padding: 1.15rem; border-radius: 12px;">
                        <span style="font-size: 0.75rem; font-weight: 700; color: #64748B; text-transform: uppercase;">Needs Review</span>
                        <div style="font-size: 1.65rem; font-weight: 800; color: #64748B; margin-top: 0.25rem;">${(res.post_test_wrong_count || 0) + (res.post_test_clearly_wrong_count || 0)}</div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div style="display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
                    <button class="btn btn-secondary" id="res-dash-btn" style="padding: 0.75rem 1.5rem; font-weight: 600;">
                        Return to Dashboard
                    </button>
                    <button class="btn btn-primary" id="res-continue-btn" style="padding: 0.75rem 1.75rem; font-weight: 700;">
                        ${isDone ? 'Continue to Next Topic <i class="fa-solid fa-arrow-right" style="margin-left: 0.4rem;"></i>' : 'Review Topic Challenges <i class="fa-solid fa-arrow-rotate-right" style="margin-left: 0.4rem;"></i>'}
                    </button>
                </div>

            </div>

            <!-- Detailed Question-by-Question Review -->
            <div class="card" style="padding: 2rem; border-radius: 14px; border: 1px solid #E2E8F0;">
                <h3 style="font-size: 1.2rem; font-weight: 800; color: #0F172A; margin-bottom: 0.35rem;">
                    Detailed Question Review
                </h3>
                <p style="font-size: 0.875rem; color: #64748B; margin-bottom: 1.5rem;">
                    Review the correct answers and conceptual explanations for each question.
                </p>

                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    ${(res.results || []).map((item, idx) => {
                        const isCorrect = item.is_correct;
                        const isNearly = item.answer_quality === "Nearly Correct";
                        const badgeClass = isCorrect ? "badge-success" : isNearly ? "badge-warning" : "badge-danger";
                        const statusLabel = isCorrect ? "Correct (+1.0)" : isNearly ? "Nearly Correct (+0.5)" : "Needs Review";

                        return `
                            <div style="border: 1px solid #E2E8F0; border-radius: 10px; padding: 1.25rem; background: ${isCorrect ? '#FFFFFF' : '#F8FAFC'};">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                    <span style="font-size: 0.8125rem; font-weight: 700; color: #64748B;">
                                        Question ${idx + 1}
                                    </span>
                                    <span class="badge ${badgeClass}" style="font-size: 0.75rem;">
                                        ${statusLabel}
                                    </span>
                                </div>

                                <div style="font-size: 0.95rem; font-weight: 700; color: #0F172A; margin-bottom: 0.75rem;">
                                    ${item.question || `Question ${idx + 1}`}
                                </div>

                                <div style="display: flex; gap: 1.5rem; font-size: 0.875rem; margin-bottom: 0.75rem; flex-wrap: wrap;">
                                    <div>
                                        <span style="color: #64748B;">Your Answer:</span> 
                                        <strong style="color: ${isCorrect ? '#16A34A' : '#DC2626'};">${item.selected || "None"}</strong>
                                    </div>
                                    <div>
                                        <span style="color: #64748B;">Correct Option:</span> 
                                        <strong style="color: #16A34A;">${item.correct || "A"}</strong>
                                    </div>
                                </div>

                                ${item.explanation ? `
                                    <div style="background: #EFF6FF; border-left: 3px solid #2563EB; padding: 0.65rem 0.85rem; border-radius: 4px; font-size: 0.8125rem; color: #1E40AF; line-height: 1.45;">
                                        <strong>Explanation:</strong> ${item.explanation}
                                    </div>
                                ` : ""}
                            </div>
                        `;
                    }).join("")}
                </div>
            </div>

        </div>
    `;

    animatePageEntrance(container.querySelector(".posttest-result-wrap"));

    document.getElementById("res-dash-btn")?.addEventListener("click", () => {
        if (onNavigate) onNavigate("/student/dashboard");
    });

    document.getElementById("res-continue-btn")?.addEventListener("click", () => {
        if (onNavigate) onNavigate("/student/games");
    });
}

function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
