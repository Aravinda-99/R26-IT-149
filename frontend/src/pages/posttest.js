/**
 * Post-Test Page — Component 4: Understanding Check (MCQ)
 * ========================================================
 * Concept-specific MCQ check shown after the student completes a gamified lesson.
 * Uses student-friendly language throughout — no research terminology visible.
 *
 * MCQ answer interpretation (internal):
 *   Correct answer       → 1.0 (good understanding)
 *   Nearly correct       → 0.5 (partial understanding)
 *   Wrong answer         → 0.0 (weak understanding)
 *   Clearly wrong        → 0.0 (serious confusion)
 *
 * The backend handles scoring. This file handles:
 *   - Clean question-by-question MCQ flow
 *   - Smooth answer selection UX
 *   - Student-friendly result screen
 */

import { MasteryAPI } from "../api/api.js";

// ── State ───────────────────────────────────────────────────────────
let currentStudentId = "";
let currentConcept = "";
let currentPreTestSchemaState = "Unknown";
let currentOnBack = null;
let questions = [];
let currentQuestionIndex = 0;
let selectedAnswers = {};
let testResult = null;

// ── Concept display names ───────────────────────────────────────────
const conceptNames = {
    variables: "Variables",
    operators: "Operators",
    loops: "Loops",
    arrays: "Arrays",
    methods: "Methods",
};

/**
 * Entry point: render the understanding check page.
 */
export async function renderPostTest(container, opts = {}) {
    currentStudentId = opts.studentId || "STU001";
    currentConcept = opts.concept || "variables";
    currentPreTestSchemaState = opts.schemaState || "Unknown";
    currentOnBack = opts.onBack || null;
    selectedAnswers = {};
    testResult = null;
    currentQuestionIndex = 0;

    const conceptName = conceptNames[currentConcept] || currentConcept;

    container.innerHTML = `
        <div class="posttest-page c4-check-page">
            <div class="c4-check-header">
                <button class="btn c4-back-btn" id="posttest-back-btn">
                    ← Back
                </button>
                <div class="c4-check-title-section">
                    <h1>Understanding Check</h1>
                    <p class="c4-check-subtitle">Let's check what you learned about <strong>${conceptName}</strong></p>
                </div>
            </div>

            <div class="c4-check-info">
                <span class="c4-check-info-icon"><i class="fa-solid fa-list-check"></i></span>
                <div>
                    <strong>How it works</strong>
                    <p>Answer ${questions.length || 10} questions about ${conceptName}. Take your time and pick the best answer for each question.</p>
                </div>
            </div>

            <div id="posttest-questions-container">
                <div class="posttest-loading">
                    <div class="spinner"></div>
                    <p>Loading questions...</p>
                </div>
            </div>

            <div id="posttest-result" class="hidden"></div>
        </div>
    `;

    // Back button
    document.getElementById("posttest-back-btn")?.addEventListener("click", () => {
        if (currentOnBack) currentOnBack();
    });

    await loadQuestions(container);
}

// ── Load questions and render the first one ─────────────────────────
async function loadQuestions(container) {
    const questionsContainer = document.getElementById("posttest-questions-container");

    try {
        const data = await MasteryAPI.getQuestions(currentConcept);
        questions = data.questions || [];

        if (questions.length === 0) {
            questionsContainer.innerHTML = `
                <div class="posttest-empty">
                    <p>No questions available for this topic yet.</p>
                </div>
            `;
            return;
        }

        // Update info text with actual question count
        const infoP = document.querySelector(".c4-check-info p");
        if (infoP) {
            infoP.textContent = `Answer ${questions.length} questions about ${conceptNames[currentConcept] || currentConcept}. Take your time and pick the best answer for each question.`;
        }

        renderQuestion(0);

    } catch (err) {
        questionsContainer.innerHTML = `
            <div class="posttest-empty">
                <p style="color: var(--accent-orange)">Failed to load questions: ${err.message}</p>
            </div>
        `;
    }
}

// ── Render a single question (one at a time flow) ───────────────────
function renderQuestion(index) {
    currentQuestionIndex = index;
    const questionsContainer = document.getElementById("posttest-questions-container");
    const q = questions[index];
    if (!q) return;

    const total = questions.length;
    const progressPct = ((index) / total) * 100;
    const optionKeys = Object.keys(q.options);
    const isLast = index === total - 1;

    questionsContainer.innerHTML = `
        <div class="c4-question-wrapper" style="animation: fadeSlideIn 0.3s ease-out;">
            <!-- Progress bar -->
            <div class="c4-question-progress">
                <div class="c4-question-progress-label">
                    <span>Question ${index + 1} of ${total}</span>
                    <span>${conceptNames[currentConcept] || currentConcept}</span>
                </div>
                <div class="c4-question-progress-bar">
                    <div class="c4-question-progress-fill" style="width: ${progressPct}%;"></div>
                </div>
            </div>

            <!-- Question card -->
            <div class="c4-question-card">
                <p class="c4-question-text">${q.question}</p>
                ${q.code ? `
                    <div class="posttest-code-block">
                        <div class="posttest-code-header"><span>JAVA</span></div>
                        <pre><code>${escapeHtml(q.code)}</code></pre>
                    </div>
                ` : ""}

                <div class="c4-options" id="c4-options-${index}">
                    ${optionKeys.map(key => `
                        <button class="c4-option ${selectedAnswers[q.id] === key ? 'selected' : ''}"
                                data-question="${index}"
                                data-qid="${q.id}"
                                data-option="${key}">
                            <span class="c4-option-key">${key}</span>
                            <span class="c4-option-text">${q.options[key]}</span>
                        </button>
                    `).join("")}
                </div>
            </div>

            <!-- Navigation -->
            <div class="c4-question-nav">
                ${index > 0 ? `<button class="btn c4-nav-btn" id="c4-prev-btn">← Previous</button>` : `<div></div>`}
                ${isLast
                    ? `<button class="btn btn-primary c4-nav-btn c4-submit-btn" id="c4-submit-btn" ${Object.keys(selectedAnswers).length < total ? 'disabled' : ''}>Submit Answers</button>`
                    : `<button class="btn btn-primary c4-nav-btn" id="c4-next-btn" ${!selectedAnswers[q.id] ? 'disabled' : ''}>Next →</button>`
                }
            </div>

            <!-- Question dots -->
            <div class="c4-question-dots">
                ${questions.map((_, i) => {
                    const qId = questions[i].id;
                    let dotClass = "c4-dot";
                    if (i === index) dotClass += " active";
                    if (selectedAnswers[qId]) dotClass += " answered";
                    return `<span class="${dotClass}" data-dot-index="${i}"></span>`;
                }).join("")}
            </div>
        </div>
    `;

    // ── Option click handlers ────────────────────────────────────
    document.querySelectorAll(`#c4-options-${index} .c4-option`).forEach(btn => {
        btn.addEventListener("click", () => {
            if (testResult) return;

            const qId = btn.dataset.qid;
            const option = btn.dataset.option;

            // Deselect all for this question
            document.querySelectorAll(`#c4-options-${index} .c4-option`).forEach(o => o.classList.remove("selected"));
            btn.classList.add("selected");

            selectedAnswers[qId] = option;

            // Enable next/submit button
            const nextBtn = document.getElementById("c4-next-btn");
            const submitBtn = document.getElementById("c4-submit-btn");
            if (nextBtn) nextBtn.disabled = false;
            if (submitBtn) submitBtn.disabled = Object.keys(selectedAnswers).length < questions.length;

            // Update dots
            document.querySelectorAll(".c4-dot").forEach((dot, i) => {
                if (selectedAnswers[questions[i].id]) {
                    dot.classList.add("answered");
                }
            });
        });
    });

    // ── Navigation handlers ──────────────────────────────────────
    document.getElementById("c4-prev-btn")?.addEventListener("click", () => renderQuestion(index - 1));
    document.getElementById("c4-next-btn")?.addEventListener("click", () => renderQuestion(index + 1));
    document.getElementById("c4-submit-btn")?.addEventListener("click", submitTest);

    // ── Dot click handlers (jump to question) ────────────────────
    document.querySelectorAll(".c4-dot").forEach(dot => {
        dot.addEventListener("click", () => {
            const i = parseInt(dot.dataset.dotIndex);
            if (!isNaN(i)) renderQuestion(i);
        });
    });
}

// ── Submit the test ─────────────────────────────────────────────────
async function submitTest() {
    const submitBtn = document.getElementById("c4-submit-btn");
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Checking...";
    }

    const answersPayload = Object.entries(selectedAnswers).map(([qId, option]) => ({
        question_id: qId,
        selected_option: option,
    }));

    try {
        const raw = await MasteryAPI.submitDiagnostic({
            user_id: currentStudentId,
            concept: currentConcept,
            schema_state_before: currentPreTestSchemaState,
            answers: answersPayload,
        });

        testResult = normalizeDiagnosticResult(raw);
        showResults(testResult);

    } catch (err) {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Submit Answers";
        }
        alert("Something went wrong. Please try again.");
    }
}

// ── Normalize backend response ──────────────────────────────────────
function normalizeDiagnosticResult(raw) {
    const accRaw = raw.mcq_accuracy ?? raw.post_test_accuracy ?? 0;
    const accNum = typeof accRaw === "number" && !Number.isNaN(accRaw) ? accRaw : parseFloat(accRaw) || 0;

    return {
        ...raw,
        pre_test_state: raw.pre_test_state ?? currentPreTestSchemaState ?? "Unknown",
        final_state: raw.final_state ?? raw.schema_state ?? "Unknown",
        final_color: raw.final_color ?? raw.color ?? "#8899aa",
        mcq_accuracy: accNum,
        wrong: raw.wrong ?? Math.max(0, (raw.total ?? 0) - (raw.correct ?? 0)),
        score_percentage: raw.score_percentage ?? (raw.total ? ((raw.correct ?? 0) / raw.total) * 100 : 0),
        current_level: raw.current_level ?? "Unknown",
        feedback_message: raw.feedback_message ?? "",
        post_test_status: raw.post_test_status ?? "",
        next_action: raw.next_action ?? "",
    };
}

// ── Student-friendly level from score_percentage ────────────────────
function getFriendlyLevel(scorePct) {
    const s = scorePct / 100;
    if (s >= 0.80) return { label: "Strong Understanding", color: "#10b981", icon: '<i class="fa-solid fa-trophy"></i>', title: "Great Work!" };
    if (s >= 0.60) return { label: "Good Progress", color: "#3b82f6", icon: '<i class="fa-solid fa-arrow-trend-up"></i>', title: "Good Progress!" };
    if (s >= 0.40) return { label: "Needs More Practice", color: "#f97316", icon: '<i class="fa-solid fa-book-open"></i>', title: "Keep Practicing" };
    return { label: "Learn Again", color: "#ef4444", icon: '<i class="fa-solid fa-rotate-left"></i>', title: "Let's Learn Again" };
}

function getFriendlyMessage(scorePct) {
    const s = scorePct / 100;
    if (s >= 0.80) return "You understood this topic well and can continue to the next step.";
    if (s >= 0.60) return "You understood most parts of this topic. A little more practice will help you improve.";
    if (s >= 0.40) return "You are close, but this topic still needs more practice. Try the game lesson again.";
    return "This topic is still difficult. Go through the game lesson again and try once more.";
}

// ── Show results screen ─────────────────────────────────────────────
function showResults(result) {
    result = normalizeDiagnosticResult(result);

    // Hide question area
    const questionsContainer = document.getElementById("posttest-questions-container");
    if (questionsContainer) questionsContainer.innerHTML = "";

    const scorePct = Number(result.score_percentage) || 0;
    const level = getFriendlyLevel(scorePct);
    const message = getFriendlyMessage(scorePct);
    const passed = scorePct >= 60;
    const conceptName = conceptNames[currentConcept] || currentConcept;

    const resultContainer = document.getElementById("posttest-result");
    if (!resultContainer) return;

    // ── Mock calculation data for prototype demo ────────────────────
    const mockActivity = {
        activityScore: 0.80,
        attemptEfficiency: 0.80,
        completionScore: 1.00,
        timeEfficiency: 0.83,
    };
    const mockMCQ = {
        correct: 6,
        nearlyCorrect: 2,
        wrong: 2,
        total: 10,
    };
    const learningActivityScore = (mockActivity.activityScore + mockActivity.attemptEfficiency + mockActivity.completionScore + mockActivity.timeEfficiency) / 4;
    const mcqUnderstandingScore = ((mockMCQ.correct * 1.0) + (mockMCQ.nearlyCorrect * 0.5)) / mockMCQ.total;
    const finalUnderstandingScore = (0.40 * learningActivityScore) + (0.60 * mcqUnderstandingScore);

    function getCalcLevel(score) {
        if (score >= 0.80) return { label: "Strong Understanding", color: "#10b981" };
        if (score >= 0.60) return { label: "Good Progress", color: "#3b82f6" };
        if (score >= 0.40) return { label: "Needs More Practice", color: "#f97316" };
        return { label: "Learn Again", color: "#ef4444" };
    }
    const calcLevel = getCalcLevel(finalUnderstandingScore);

    resultContainer.innerHTML = `
        <div class="c4-result-card" style="animation: fadeSlideIn 0.4s ease-out;">
            <!-- Header -->
            <div class="c4-result-header" style="border-bottom-color: ${level.color}30;">
                <span class="c4-result-icon">${level.icon}</span>
                <h2 class="c4-result-title">${level.title}</h2>
                <p class="c4-result-concept">${conceptName}</p>
            </div>

            <!-- Score circle -->
            <div class="c4-result-score-section">
                <div class="c4-result-circle" style="border-color: ${level.color};">
                    <span class="c4-result-pct">${Math.round(scorePct)}%</span>
                </div>
                <span class="c4-result-badge" style="background: ${level.color}15; color: ${level.color}; border: 1px solid ${level.color}30;">
                    ${level.label}
                </span>
            </div>

            <!-- Summary stats -->
            <div class="c4-result-stats">
                <div class="c4-result-stat">
                    <span class="c4-result-stat-value" style="color: #10b981;">${result.correct || 0}</span>
                    <span class="c4-result-stat-label">Correct</span>
                </div>
                <div class="c4-result-stat-divider"></div>
                <div class="c4-result-stat">
                    <span class="c4-result-stat-value" style="color: var(--text-secondary);">${result.total || 0}</span>
                    <span class="c4-result-stat-label">Total</span>
                </div>
                <div class="c4-result-stat-divider"></div>
                <div class="c4-result-stat">
                    <span class="c4-result-stat-value" style="color: ${result.wrong > 0 ? '#ef4444' : 'var(--text-secondary)'};">${result.wrong || 0}</span>
                    <span class="c4-result-stat-label">Incorrect</span>
                </div>
            </div>

            <!-- Message -->
            <div class="c4-result-message" style="border-left-color: ${level.color};">
                <p>${message}</p>
            </div>

            <!-- Actions -->
            <div class="c4-result-actions">
                ${passed
                    ? `<button class="btn c4-action-btn c4-btn-done" id="posttest-done-btn"><i class="fa-solid fa-check"></i> Done</button>`
                    : `<button class="btn btn-primary c4-action-btn" id="posttest-learn-again-btn"><i class="fa-solid fa-rotate-left"></i> Learn Again</button>`
                }
            </div>

            <!-- Calculation Breakdown Toggle -->
            <button class="btn c4-calc-toggle" id="c4-calc-toggle">
                <i class="fa-solid fa-calculator"></i> How your level was calculated
            </button>
            <div class="c4-calc-breakdown hidden" id="c4-calc-breakdown">

                <!-- Step 1: Learning Activity Data -->
                <div class="c4-calc-card">
                    <div class="c4-calc-card-header">
                        <span class="c4-calc-step">1</span>
                        <h4>Learning Activity Data</h4>
                    </div>
                    <div class="c4-calc-grid">
                        <div class="c4-calc-metric">
                            <span class="c4-calc-metric-label">Activity Score</span>
                            <span class="c4-calc-metric-value">${(mockActivity.activityScore * 100).toFixed(0)}%</span>
                        </div>
                        <div class="c4-calc-metric">
                            <span class="c4-calc-metric-label">Attempt Efficiency</span>
                            <span class="c4-calc-metric-value">${(mockActivity.attemptEfficiency * 100).toFixed(0)}%</span>
                        </div>
                        <div class="c4-calc-metric">
                            <span class="c4-calc-metric-label">Completion Score</span>
                            <span class="c4-calc-metric-value">${(mockActivity.completionScore * 100).toFixed(0)}%</span>
                        </div>
                        <div class="c4-calc-metric">
                            <span class="c4-calc-metric-label">Time Efficiency</span>
                            <span class="c4-calc-metric-value">${(mockActivity.timeEfficiency * 100).toFixed(0)}%</span>
                        </div>
                    </div>
                    <div class="c4-calc-formula">
                        <span class="c4-calc-formula-label">Formula</span>
                        <code>(${(mockActivity.activityScore * 100).toFixed(0)} + ${(mockActivity.attemptEfficiency * 100).toFixed(0)} + ${(mockActivity.completionScore * 100).toFixed(0)} + ${(mockActivity.timeEfficiency * 100).toFixed(0)}) ÷ 4</code>
                    </div>
                    <div class="c4-calc-result-row">
                        <span>Learning Activity Score</span>
                        <span class="c4-calc-result-value" style="color: var(--accent-blue);">${(learningActivityScore * 100).toFixed(2)}%</span>
                    </div>
                </div>

                <!-- Step 2: MCQ Understanding Data -->
                <div class="c4-calc-card">
                    <div class="c4-calc-card-header">
                        <span class="c4-calc-step">2</span>
                        <h4>MCQ Understanding Data</h4>
                    </div>
                    <div class="c4-calc-grid">
                        <div class="c4-calc-metric">
                            <span class="c4-calc-metric-label">Correct Answers</span>
                            <span class="c4-calc-metric-value" style="color: #10b981;">${mockMCQ.correct}</span>
                        </div>
                        <div class="c4-calc-metric">
                            <span class="c4-calc-metric-label">Nearly Correct</span>
                            <span class="c4-calc-metric-value" style="color: #f59e0b;">${mockMCQ.nearlyCorrect}</span>
                        </div>
                        <div class="c4-calc-metric">
                            <span class="c4-calc-metric-label">Wrong Answers</span>
                            <span class="c4-calc-metric-value" style="color: #ef4444;">${mockMCQ.wrong}</span>
                        </div>
                        <div class="c4-calc-metric">
                            <span class="c4-calc-metric-label">Total Questions</span>
                            <span class="c4-calc-metric-value">${mockMCQ.total}</span>
                        </div>
                    </div>
                    <div class="c4-calc-marking">
                        <span class="c4-calc-mark"><i class="fa-solid fa-check" style="color: #10b981;"></i> Correct = 1.0</span>
                        <span class="c4-calc-mark"><i class="fa-solid fa-minus" style="color: #f59e0b;"></i> Nearly Correct = 0.5</span>
                        <span class="c4-calc-mark"><i class="fa-solid fa-xmark" style="color: #ef4444;"></i> Wrong = 0</span>
                    </div>
                    <div class="c4-calc-formula">
                        <span class="c4-calc-formula-label">Formula</span>
                        <code>((${mockMCQ.correct} × 1.0) + (${mockMCQ.nearlyCorrect} × 0.5)) ÷ ${mockMCQ.total}</code>
                    </div>
                    <div class="c4-calc-result-row">
                        <span>MCQ Understanding Score</span>
                        <span class="c4-calc-result-value" style="color: var(--accent-purple);">${(mcqUnderstandingScore * 100).toFixed(0)}%</span>
                    </div>
                </div>

                <!-- Step 3: Final Understanding Score -->
                <div class="c4-calc-card">
                    <div class="c4-calc-card-header">
                        <span class="c4-calc-step">3</span>
                        <h4>Final Understanding Score</h4>
                    </div>
                    <div class="c4-calc-weight-row">
                        <div class="c4-calc-weight-item">
                            <span class="c4-calc-weight-pct">40%</span>
                            <span class="c4-calc-weight-label">Learning Activity</span>
                            <span class="c4-calc-weight-val" style="color: var(--accent-blue);">${(learningActivityScore * 100).toFixed(2)}%</span>
                        </div>
                        <span class="c4-calc-weight-plus">+</span>
                        <div class="c4-calc-weight-item">
                            <span class="c4-calc-weight-pct">60%</span>
                            <span class="c4-calc-weight-label">MCQ Understanding</span>
                            <span class="c4-calc-weight-val" style="color: var(--accent-purple);">${(mcqUnderstandingScore * 100).toFixed(0)}%</span>
                        </div>
                    </div>
                    <div class="c4-calc-formula">
                        <span class="c4-calc-formula-label">Formula</span>
                        <code>(0.40 × ${(learningActivityScore * 100).toFixed(2)}) + (0.60 × ${(mcqUnderstandingScore * 100).toFixed(0)})</code>
                    </div>
                    <div class="c4-calc-result-row c4-calc-result-final">
                        <span>Final Understanding Score</span>
                        <span class="c4-calc-result-value">${(finalUnderstandingScore * 100).toFixed(1)}%</span>
                    </div>
                </div>

                <!-- Step 4: Final Level -->
                <div class="c4-calc-card c4-calc-final-card" style="border-color: ${calcLevel.color}40;">
                    <div class="c4-calc-card-header">
                        <span class="c4-calc-step" style="background: ${calcLevel.color};">4</span>
                        <h4>Final Level</h4>
                    </div>
                    <div class="c4-calc-level-scale">
                        <div class="c4-calc-level-row ${finalUnderstandingScore >= 0.80 ? 'active' : ''}">
                            <span class="c4-calc-level-range">80% – 100%</span>
                            <span class="c4-calc-level-name" style="color: #10b981;">Strong Understanding</span>
                        </div>
                        <div class="c4-calc-level-row ${finalUnderstandingScore >= 0.60 && finalUnderstandingScore < 0.80 ? 'active' : ''}">
                            <span class="c4-calc-level-range">60% – 79%</span>
                            <span class="c4-calc-level-name" style="color: #3b82f6;">Good Progress</span>
                        </div>
                        <div class="c4-calc-level-row ${finalUnderstandingScore >= 0.40 && finalUnderstandingScore < 0.60 ? 'active' : ''}">
                            <span class="c4-calc-level-range">40% – 59%</span>
                            <span class="c4-calc-level-name" style="color: #f97316;">Needs More Practice</span>
                        </div>
                        <div class="c4-calc-level-row ${finalUnderstandingScore < 0.40 ? 'active' : ''}">
                            <span class="c4-calc-level-range">0% – 39%</span>
                            <span class="c4-calc-level-name" style="color: #ef4444;">Learn Again</span>
                        </div>
                    </div>
                    <div class="c4-calc-final-result" style="background: ${calcLevel.color}10; border-color: ${calcLevel.color}30;">
                        <div class="c4-calc-final-score" style="color: ${calcLevel.color};">${(finalUnderstandingScore * 100).toFixed(1)}%</div>
                        <div class="c4-calc-final-label" style="color: ${calcLevel.color};">${calcLevel.label}</div>
                    </div>
                </div>

                <!-- Prototype Note -->
                <div class="c4-calc-note">
                    <i class="fa-solid fa-flask"></i>
                    <p>These values are shown for prototype demonstration. In real testing, they will be calculated from actual student activity data.</p>
                </div>
            </div>

            <!-- Answer review toggle -->
            <button class="btn c4-review-toggle" id="c4-review-toggle">
                Show Answers
            </button>
            <div class="c4-review-section hidden" id="c4-review-section">
                ${renderAnswerReview(result)}
            </div>
        </div>
    `;

    resultContainer.classList.remove("hidden");
    resultContainer.scrollIntoView({ behavior: "smooth", block: "start" });

    // Done handler
    document.getElementById("posttest-done-btn")?.addEventListener("click", () => {
        if (currentOnBack) currentOnBack();
    });

    // Learn Again handler
    document.getElementById("posttest-learn-again-btn")?.addEventListener("click", () => {
        redirectToGamifiedLesson(currentConcept);
    });

    // Calculation breakdown toggle
    document.getElementById("c4-calc-toggle")?.addEventListener("click", () => {
        const section = document.getElementById("c4-calc-breakdown");
        const toggle = document.getElementById("c4-calc-toggle");
        if (section && toggle) {
            section.classList.toggle("hidden");
            toggle.innerHTML = section.classList.contains("hidden")
                ? '<i class="fa-solid fa-calculator"></i> How your level was calculated'
                : '<i class="fa-solid fa-chevron-up"></i> Hide calculation breakdown';
        }
    });

    // Review toggle
    document.getElementById("c4-review-toggle")?.addEventListener("click", () => {
        const section = document.getElementById("c4-review-section");
        const toggle = document.getElementById("c4-review-toggle");
        if (section && toggle) {
            section.classList.toggle("hidden");
            toggle.textContent = section.classList.contains("hidden") ? "Show Answers" : "Hide Answers";
        }
    });
}

// ── Render answer review (collapsible) ──────────────────────────────
function renderAnswerReview(result) {
    if (!result.results || result.results.length === 0) return "";

    return result.results.map((r, i) => {
        const q = questions[i];
        if (!q) return "";

        return `
            <div class="c4-review-item ${r.is_correct ? 'correct' : 'incorrect'}">
                <div class="c4-review-item-header">
                    <span class="c4-review-q-num">Q${i + 1}</span>
                    <span class="c4-review-status ${r.is_correct ? 'correct' : 'incorrect'}">
                        ${r.is_correct ? '<i class="fa-solid fa-check"></i> Correct' : '<i class="fa-solid fa-xmark"></i> Incorrect'}
                    </span>
                </div>
                <p class="c4-review-question">${q.question}</p>
                ${!r.is_correct ? `
                    <div class="c4-review-answers">
                        <div class="c4-review-your-answer">Your answer: <strong>${r.selected}</strong> – ${q.options[r.selected] || ""}</div>
                        <div class="c4-review-correct-answer">Correct: <strong>${r.correct}</strong> – ${q.options[r.correct] || ""}</div>
                    </div>
                ` : ""}
                ${r.explanation ? `<p class="c4-review-explanation">${r.explanation}</p>` : ""}
            </div>
        `;
    }).join("");
}

// ── Navigate to gamified lesson ─────────────────────────────────────
function redirectToGamifiedLesson(concept) {
    const conceptToSection = {
        variables: "integer",
        operators: "integer",
        loops: "integer",
        arrays: "integer",
        methods: "string",
    };
    const section = conceptToSection[concept] || "integer";
    sessionStorage.setItem("codequest_menu_focus", section);

    const gamesLink = document.querySelector('.nav-link[data-page="games"]');
    gamesLink?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));

    const launchIdBySection = {
        integer: "launch-int-module-btn",
        float: "launch-float-module-btn",
        char: "launch-char-module-btn",
        string: "launch-string-module-btn",
    };
    const launchId = launchIdBySection[section] || launchIdBySection.integer;

    const startedAt = Date.now();
    const tryClick = () => {
        const btn = document.getElementById(launchId);
        if (btn) { btn.click(); return; }
        if (Date.now() - startedAt > 4000) return;
        setTimeout(tryClick, 100);
    };
    setTimeout(tryClick, 0);
}

// ── Utility ─────────────────────────────────────────────────────────
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}
