import { QUIZ_BANK } from "./data.js";

/**
 * Initialize the quiz UI within a given root element.
 */
export function setupQuizUI(root = document) {
    const state = {
        current: 0,
        selectedAnswers: Array(QUIZ_BANK.length).fill(null),
        submitted: false,
    };

    const quizBox = (root === document) ? document.getElementById("quiz-box") : root.querySelector(".quiz-box");
    const counter = (root === document) ? document.getElementById("quiz-counter") : root.querySelector(".quiz-counter");
    const miniScore = (root === document) ? document.getElementById("quiz-score-mini") : root.querySelector(".quiz-score-mini");
    const progressBar = (root === document) ? document.getElementById("quiz-progress-bar") : root.querySelector(".quiz-progress-bar");
    const prevBtn = (root === document) ? document.getElementById("prev-quiz-btn") : root.querySelector(".prev-quiz-btn");
    const nextBtn = (root === document) ? document.getElementById("next-quiz-btn") : root.querySelector(".next-quiz-btn");

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

    function renderQuestion() {
        const q = QUIZ_BANK[state.current];
        const selected = state.selectedAnswers[state.current];

        counter.textContent = `Question ${state.current + 1} of ${QUIZ_BANK.length}`;
        progressBar.style.width = `${((state.current + 1) / QUIZ_BANK.length) * 100}%`;
        miniScore.textContent = `Score: ${getScore()}`;

        quizBox.innerHTML = `
            <article class="lp-question-card">
                <div class="lp-question-meta">
                    <span class="lp-topic-tag">${q.topic}</span>
                    <span class="lp-id-tag">Q${q.id}</span>
                </div>
                <h4 class="lp-question">${q.question}</h4>
                <div class="lp-options">
                    ${q.options
                        .map((opt, idx) => {
                            const isSelected = selected === idx;
                            const isCorrect = q.correctIndex === idx;
                            let cls = "lp-option";
                            if (state.submitted) {
                                if (isCorrect) cls += " correct";
                                else if (isSelected && !isCorrect) cls += " wrong";
                            } else if (isSelected) {
                                cls += " selected";
                            }

                            return `
                                <button class="${cls}" data-opt-index="${idx}">
                                    <span class="lp-opt-label">${String.fromCharCode(65 + idx)}</span>
                                    <span>${opt}</span>
                                </button>
                            `;
                        })
                        .join("")}
                </div>
                <div id="quiz-feedback" class="lp-feedback"></div>
            </article>
        `;

        const optionButtons = quizBox.querySelectorAll(".lp-option");
        optionButtons.forEach((btn) => {
            btn.addEventListener("click", () => {
                if (state.submitted) return;
                state.selectedAnswers[state.current] = Number(btn.dataset.optIndex);
                renderQuestion();
            });
        });

        prevBtn.disabled = state.current === 0;

        if (state.current === QUIZ_BANK.length - 1) {
            nextBtn.textContent = state.submitted ? "Review Again" : "Submit Quiz";
        } else {
            nextBtn.textContent = "Next";
        }
    }

    nextBtn.addEventListener("click", () => {
        if (state.current < QUIZ_BANK.length - 1) {
            state.current += 1;
            renderQuestion();
            return;
        }

        if (!state.submitted) {
            state.submitted = true;
            const score = getScore();
            const percent = Math.round((score / QUIZ_BANK.length) * 100);

            quizBox.innerHTML = `
                <article class="lp-result-card">
                    <h4>Your Quiz Result</h4>
                    <p class="lp-result-score">${score} / ${QUIZ_BANK.length} (${percent}%)</p>
                    <p class="lp-muted-sm">
                        ${percent >= 80 ? "Excellent work! You are mastering the concepts." :
                          percent >= 60 ? "Good progress. Review a few topics and try again." :
                          "Keep going. Repetition builds confidence."}
                    </p>
                    <div style="display: flex; gap: 1rem; margin-top: 1.5rem; justify-content: center;">
                        <button id="retry-quiz-btn" class="btn btn-primary" style="margin-top: 0;">Retry 25 Questions</button>
                        <button id="view-details-btn" class="btn btn-secondary" style="margin-top: 0;">View Details</button>
                        <button id="finish-quiz-btn" class="btn btn-primary" style="margin-top: 0;">Finish</button>
                    </div>
                </article>
            `;

            miniScore.textContent = `Score: ${score}`;
            progressBar.style.width = "100%";
            counter.textContent = `Completed: ${QUIZ_BANK.length} questions`;
            prevBtn.disabled = true;
            nextBtn.textContent = "Review Again";

            const retryBtn = (root === document) ? document.getElementById("retry-quiz-btn") : root.querySelector("#retry-quiz-btn");
            const viewDetailsBtn = (root === document) ? document.getElementById("view-details-btn") : root.querySelector("#view-details-btn");
            const finishBtn = (root === document) ? document.getElementById("finish-quiz-btn") : root.querySelector("#finish-quiz-btn");

            if (retryBtn) {
                retryBtn.addEventListener("click", () => {
                    state.current = 0;
                    state.selectedAnswers = Array(QUIZ_BANK.length).fill(null);
                    state.submitted = false;
                    renderQuestion();
                });
            }

            if (viewDetailsBtn) {
                viewDetailsBtn.addEventListener("click", () => {
                    sessionStorage.setItem("quiz-results", JSON.stringify({
                        score,
                        percent,
                        topicBreakdown: getTopicBreakdown(),
                        answeredCount: state.selectedAnswers.filter(a => a !== null).length,
                    }));
                    window.navigateTo("quiz-results");
                });
            }

            if (finishBtn) {
                finishBtn.addEventListener("click", () => {
                    sessionStorage.setItem("quiz-results", JSON.stringify({
                        score,
                        percent,
                        topicBreakdown: getTopicBreakdown(),
                        answeredCount: state.selectedAnswers.filter(a => a !== null).length,
                    }));
                    window.navigateTo("quiz-summary");
                });
            }
            return;
        }

        state.current = 0;
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
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.background = "rgba(0, 0, 0, 0.7)";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.zIndex = "1300";

    const topicDetailsHTML = Object.entries(topicBreakdown)
        .map(([topic, data]) => {
            const accuracy = Math.round((data.correct / data.total) * 100);
            const statusColor = accuracy >= 80 ? "#22c55e" : accuracy >= 60 ? "#f59e0b" : "#ef4444";
            return `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; align-items: center; padding: 1rem; background: rgba(255,255,255,0.03); border-radius: 0.6rem; margin-bottom: 1rem;">
                    <div>
                        <div style="font-weight: 600; color: white; margin-bottom: 0.3rem;">${topic}</div>
                        <div style="font-size: 0.85rem; color: rgba(224,230,237,0.6);">${data.correct} of ${data.total} correct</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 1.5rem; font-weight: 700; color: ${statusColor};">${accuracy}%</div>
                    </div>
                </div>
            `;
        })
        .join("");

    overlay.innerHTML = `
        <div style="background: #1a1f2e; border: 1px solid rgba(255,255,255,0.1); border-radius: 1rem; padding: 2rem; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto;">
            <!-- Header -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h2 style="margin: 0; color: white; font-size: 1.5rem;">Quiz Details Overview</h2>
                <button id="close-details-btn" style="background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer;">&times;</button>
            </div>

            <!-- Overall Score -->
            <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 0.8rem; padding: 2rem; text-align: center; margin-bottom: 2rem;">
                <div style="font-size: 0.85rem; color: rgba(255,255,255,0.8); margin-bottom: 0.5rem;">Overall Score</div>
                <div style="font-size: 3rem; font-weight: 800; color: white; margin-bottom: 0.5rem;">${score} / ${QUIZ_BANK.length}</div>
                <div style="font-size: 1.5rem; font-weight: 700; color: white;">${percent}%</div>
                <div style="font-size: 0.9rem; color: rgba(255,255,255,0.8); margin-top: 1rem;">
                    ${percent >= 80 ? "🌟 Excellent Performance!" :
                      percent >= 60 ? "👍 Good Job!" :
                      "📚 Keep Practicing!"}
                </div>
            </div>

            <!-- Topic Breakdown -->
            <div>
                <h3 style="margin: 0 0 1.5rem 0; color: white; font-size: 1.1rem;">Performance by Topic</h3>
                ${topicDetailsHTML}
            </div>

            <!-- Stats Summary -->
            <div style="background: rgba(255,255,255,0.03); border-radius: 0.8rem; padding: 1.5rem; margin-top: 2rem;">
                <h4 style="margin: 0 0 1rem 0; color: white;">Summary</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div>
                        <div style="font-size: 0.85rem; color: rgba(224,230,237,0.6); margin-bottom: 0.3rem;">Correct Answers</div>
                        <div style="font-size: 1.3rem; font-weight: 700; color: #22c55e;">${score}</div>
                    </div>
                    <div>
                        <div style="font-size: 0.85rem; color: rgba(224,230,237,0.6); margin-bottom: 0.3rem;">Incorrect Answers</div>
                        <div style="font-size: 1.3rem; font-weight: 700; color: #ef4444;">${QUIZ_BANK.length - score}</div>
                    </div>
                </div>
            </div>

            <!-- Close Button -->
            <button id="close-details-footer-btn" style="width: 100%; padding: 0.8rem; margin-top: 2rem; background: rgba(99,102,241,0.2); color: #6366f1; border: 1px solid #6366f1; border-radius: 0.6rem; font-weight: 600; cursor: pointer; transition: all 0.3s;">
                Close
            </button>
        </div>
    `;

    document.body.appendChild(overlay);

    const closeBtn = overlay.querySelector("#close-details-btn");
    const closeFooterBtn = overlay.querySelector("#close-details-footer-btn");

    closeBtn.addEventListener("click", () => overlay.remove());
    closeFooterBtn.addEventListener("click", () => overlay.remove());
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) overlay.remove();
    });
}

/**
 * Open a fullscreen overlay that shows an isolated quiz view.
 */
export function openQuizOverlay() {
    const overlay = document.createElement("div");
    overlay.className = "lp-quiz-overlay";
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.background = "rgba(6, 10, 15, 0.85)";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.zIndex = "1200";
    overlay.innerHTML = `
        <div class="lp-quiz-overlay-inner card" style="width: min(920px, 96%); max-height: 92%; overflow:auto; position:relative;">
            <button class="lp-quiz-overlay-close btn" style="position:absolute; top:12px; right:12px; z-index:2;">Close</button>
            <div style="padding: 1rem 1.2rem;">
                <div class="lp-quiz-progress-wrap">
                    <div class="lp-quiz-progress-head" style="display:flex; justify-content:space-between; margin-bottom:8px;">
                        <span class="quiz-counter">Question 1 of 25</span>
                        <span class="quiz-score-mini">Score: 0</span>
                    </div>
                    <div class="lp-progress-track">
                        <div class="quiz-progress-bar lp-progress-bar" style="width:5%;"></div>
                    </div>
                </div>

                <div class="quiz-box" style="margin-top:12px;"></div>

                <div class="lp-quiz-actions" style="display:flex; justify-content:space-between; gap:0.8rem; margin-top:12px;">
                    <button class="btn prev-quiz-btn" style="background: var(--border-color); color: var(--text-primary);">Previous</button>
                    <button class="btn btn-primary next-quiz-btn">Next</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const inner = overlay.querySelector(".lp-quiz-overlay-inner");
    const close = overlay.querySelector(".lp-quiz-overlay-close");
    close.addEventListener("click", () => overlay.remove());

    setupQuizUI(inner);
}