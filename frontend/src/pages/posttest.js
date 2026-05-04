/**
 * Post-Test Page — Stage 2 Diagnostic MCQ
 * =========================================
 * Triggered when a student's schema state is Developing, Fragile, or Misconception.
 * Shows 3 MCQ questions per concept (output prediction, code tracing, conceptual reasoning).
 * Submits answers to the backend and displays the final schema state.
 */

import { MasteryAPI } from "../api/api.js";

// State
let currentStudentId = "";
let currentConcept = "";
let questions = [];
let selectedAnswers = {};
let testResult = null;

/**
 * Render the post-test page.
 * @param {HTMLElement} container - The page container
 * @param {object} opts - Options: { studentId, concept, masteryScore, schemaState, onBack }
 */
export async function renderPostTest(container, opts = {}) {
    currentStudentId = opts.studentId || "STU001";
    currentConcept = opts.concept || "variables";
    const masteryScore = opts.masteryScore || 0;
    const schemaState = opts.schemaState || "Unknown";
    const onBack = opts.onBack || null;
    selectedAnswers = {};
    testResult = null;

    // Concept display names
    const conceptNames = {
        variables: "Variables & Data Types",
        operators: "Operators & Expressions",
        loops: "Loops & Iteration",
        arrays: "Arrays & Lists",
        methods: "Methods & Functions",
    };
    const conceptName = conceptNames[currentConcept] || currentConcept;

    container.innerHTML = `
        <div class="posttest-page">
            <div class="posttest-header">
                <button class="btn posttest-back-btn" id="posttest-back-btn">
                    <span>&#8592;</span> Back to Mastery
                </button>
                <div class="posttest-title-section">
                    <h1>Diagnostic Post-Test</h1>
                    <p class="posttest-subtitle">Validating your understanding of <strong>${conceptName}</strong></p>
                </div>
                <div class="posttest-meta">
                    <div class="posttest-meta-item">
                        <span class="posttest-meta-label">Current State</span>
                        <span class="posttest-state-badge" data-state="${schemaState}">${schemaState}</span>
                    </div>
                    <div class="posttest-meta-item">
                        <span class="posttest-meta-label">Mastery Score</span>
                        <span class="posttest-score">${(masteryScore * 100).toFixed(1)}%</span>
                    </div>
                </div>
            </div>

            <div class="posttest-info-banner">
                <div class="posttest-info-icon">&#9432;</div>
                <div>
                    <strong>Why this test?</strong>
                    Your schema state for ${conceptName} is <strong>${schemaState}</strong>.
                    This diagnostic test checks whether you truly understand the concept.
                    Answer 3 questions: output prediction, code tracing, and conceptual reasoning.
                </div>
            </div>

            <div id="posttest-questions-container">
                <div class="posttest-loading">
                    <div class="spinner"></div>
                    <p>Loading questions...</p>
                </div>
            </div>

            <div id="posttest-actions" class="posttest-actions hidden">
                <div class="posttest-progress-text" id="posttest-progress-text">0 / 3 answered</div>
                <button class="btn btn-primary posttest-submit-btn" id="posttest-submit-btn" disabled>
                    Submit Answers
                </button>
            </div>

            <div id="posttest-result" class="hidden"></div>
        </div>
    `;

    // Back button
    const backBtn = document.getElementById("posttest-back-btn");
    if (backBtn) {
        backBtn.addEventListener("click", () => {
            if (onBack) onBack();
        });
    }

    // Load questions
    await loadQuestions();
}

async function loadQuestions() {
    const questionsContainer = document.getElementById("posttest-questions-container");
    const actionsContainer = document.getElementById("posttest-actions");

    try {
        const data = await MasteryAPI.getQuestions(currentConcept);
        questions = data.questions || [];

        if (questions.length === 0) {
            questionsContainer.innerHTML = `
                <div class="posttest-empty">
                    <p>No diagnostic questions available for this concept.</p>
                </div>
            `;
            return;
        }

        // Question type labels and icons
        const typeLabels = {
            output_prediction: { label: "Output Prediction", icon: "&#128424;", desc: "What does this code print?" },
            code_tracing: { label: "Code Tracing", icon: "&#128270;", desc: "Step through the code carefully" },
            conceptual_reasoning: { label: "Conceptual Reasoning", icon: "&#128161;", desc: "Explain the underlying concept" },
        };

        questionsContainer.innerHTML = questions.map((q, index) => {
            const typeInfo = typeLabels[q.type] || { label: q.type, icon: "", desc: "" };
            const optionKeys = Object.keys(q.options);

            return `
                <div class="posttest-question-card" id="question-card-${index}">
                    <div class="posttest-question-header">
                        <span class="posttest-question-number">Question ${index + 1}</span>
                        <span class="posttest-question-type" data-type="${q.type}">
                            <span class="posttest-type-icon">${typeInfo.icon}</span>
                            ${typeInfo.label}
                        </span>
                    </div>

                    <div class="posttest-question-body">
                        <p class="posttest-question-text">${q.question}</p>
                        ${q.code ? `
                            <div class="posttest-code-block">
                                <div class="posttest-code-header">
                                    <span>JAVA</span>
                                </div>
                                <pre><code>${escapeHtml(q.code)}</code></pre>
                            </div>
                        ` : ""}
                    </div>

                    <div class="posttest-options" id="options-${index}">
                        ${optionKeys.map(key => `
                            <button class="posttest-option" data-question="${index}" data-qid="${q.id}" data-option="${key}" id="opt-${index}-${key}">
                                <span class="posttest-option-key">${key}</span>
                                <span class="posttest-option-text">${q.options[key]}</span>
                            </button>
                        `).join("")}
                    </div>
                </div>
            `;
        }).join("");

        // Show actions bar
        actionsContainer.classList.remove("hidden");

        // Attach option click handlers
        document.querySelectorAll(".posttest-option").forEach(btn => {
            btn.addEventListener("click", () => handleOptionClick(btn));
        });

        // Submit button
        document.getElementById("posttest-submit-btn").addEventListener("click", submitTest);

    } catch (err) {
        questionsContainer.innerHTML = `
            <div class="posttest-empty">
                <p style="color: var(--accent-orange)">Failed to load questions: ${err.message}</p>
            </div>
        `;
    }
}

function handleOptionClick(btn) {
    if (testResult) return; // Don't allow changes after submission

    const questionIndex = btn.dataset.question;
    const questionId = btn.dataset.qid;
    const selectedOption = btn.dataset.option;

    // Deselect other options for this question
    document.querySelectorAll(`.posttest-option[data-question="${questionIndex}"]`).forEach(opt => {
        opt.classList.remove("selected");
    });

    // Select this option
    btn.classList.add("selected");
    selectedAnswers[questionId] = selectedOption;

    // Update progress
    const answered = Object.keys(selectedAnswers).length;
    const total = questions.length;
    const progressText = document.getElementById("posttest-progress-text");
    if (progressText) progressText.textContent = `${answered} / ${total} answered`;

    // Enable submit if all answered
    const submitBtn = document.getElementById("posttest-submit-btn");
    if (submitBtn) submitBtn.disabled = answered < total;
}

async function submitTest() {
    const submitBtn = document.getElementById("posttest-submit-btn");
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting...";
    }

    // Build answers array
    const answersPayload = Object.entries(selectedAnswers).map(([qId, option]) => ({
        question_id: qId,
        selected_option: option,
    }));

    try {
        const result = await MasteryAPI.submitDiagnostic({
            user_id: currentStudentId,
            concept: currentConcept,
            answers: answersPayload,
        });

        testResult = result;
        showResults(result);

    } catch (err) {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Submit Answers";
        }
        alert("Failed to submit: " + err.message);
    }
}

function showResults(result) {
    // Hide submit actions
    const actionsContainer = document.getElementById("posttest-actions");
    if (actionsContainer) actionsContainer.classList.add("hidden");

    // Mark correct/incorrect on each question
    if (result.results) {
        result.results.forEach((r, index) => {
            const card = document.getElementById(`question-card-${index}`);
            if (!card) return;

            // Mark options
            const options = card.querySelectorAll(".posttest-option");
            options.forEach(opt => {
                const optKey = opt.dataset.option;
                opt.classList.add("revealed");

                if (optKey === r.correct) {
                    opt.classList.add("correct");
                }
                if (optKey === r.selected && !r.is_correct) {
                    opt.classList.add("incorrect");
                }
            });

            // Add explanation
            const explanationHtml = `
                <div class="posttest-explanation ${r.is_correct ? 'correct' : 'incorrect'}">
                    <span class="posttest-explanation-icon">${r.is_correct ? '&#10004;' : '&#10008;'}</span>
                    <div>
                        <strong>${r.is_correct ? 'Correct!' : 'Incorrect'}</strong>
                        <p>${r.explanation}</p>
                    </div>
                </div>
            `;
            card.insertAdjacentHTML("beforeend", explanationHtml);
        });
    }

    // Show result summary
    const resultContainer = document.getElementById("posttest-result");
    if (resultContainer) {
        const stateChanged = result.pre_test_state !== result.final_state;
        const improved = getStateRank(result.final_state) > getStateRank(result.pre_test_state);

        resultContainer.innerHTML = `
            <div class="posttest-result-card">
                <h2>Diagnostic Results</h2>

                <div class="posttest-result-score">
                    <div class="posttest-result-circle" style="--score-color: ${result.final_color}">
                        <span class="posttest-result-fraction">${result.correct}/${result.total}</span>
                        <span class="posttest-result-label">Correct</span>
                    </div>
                </div>

                <div class="posttest-result-states">
                    <div class="posttest-state-block">
                        <span class="posttest-state-label">Before</span>
                        <span class="posttest-state-badge" data-state="${result.pre_test_state}">${result.pre_test_state}</span>
                    </div>
                    <div class="posttest-state-arrow">${stateChanged ? '&#10132;' : '&#8212;'}</div>
                    <div class="posttest-state-block">
                        <span class="posttest-state-label">After</span>
                        <span class="posttest-state-badge large" data-state="${result.final_state}">${result.final_state}</span>
                    </div>
                </div>

                ${stateChanged ? `
                    <div class="posttest-state-change ${improved ? 'improved' : 'declined'}">
                        ${improved
                            ? 'Your understanding has been validated! Schema state improved.'
                            : 'The diagnostic suggests your understanding may need reinforcement.'}
                    </div>
                ` : `
                    <div class="posttest-state-change neutral">
                        Your schema state remains ${result.final_state}. ${
                            result.final_state === 'Stable'
                                ? 'Great job!'
                                : 'Keep practicing to improve your mastery.'
                        }
                    </div>
                `}

                <div class="posttest-result-details">
                    <div class="posttest-detail-row">
                        <span>Mastery Score (Stage 1)</span>
                        <span>${(result.mastery_score * 100).toFixed(1)}%</span>
                    </div>
                    <div class="posttest-detail-row">
                        <span>MCQ Accuracy (Stage 2)</span>
                        <span>${(result.mcq_accuracy * 100).toFixed(1)}%</span>
                    </div>
                </div>
            </div>
        `;
        resultContainer.classList.remove("hidden");
        resultContainer.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

function getStateRank(state) {
    const ranks = { Misconception: 1, Fragile: 2, Developing: 3, Stable: 4 };
    return ranks[state] || 0;
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}
