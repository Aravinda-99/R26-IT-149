import { QUIZ_BANK } from "./data.js";

/**
 * Initialize the quiz UI within a given root element.
 * Pass a DOM element `root` that contains the following elements (relative selectors):
 * - .quiz-box, .quiz-counter, .quiz-score-mini, .quiz-progress-bar, .prev-quiz-btn, .next-quiz-btn
 * If `root` is omitted, document will be used (legacy IDs still work).
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
                    <button id="retry-quiz-btn" class="btn btn-primary" style="margin-top: 1rem;">Retry 25 Questions</button>
                </article>
            `;

            miniScore.textContent = `Score: ${score}`;
            progressBar.style.width = "100%";
            counter.textContent = `Completed: ${QUIZ_BANK.length} questions`;
            prevBtn.disabled = true;
            nextBtn.textContent = "Review Again";

            const retryBtn = (root === document) ? document.getElementById("retry-quiz-btn") : root.querySelector("#retry-quiz-btn");
            if (retryBtn) {
                retryBtn.addEventListener("click", () => {
                    state.current = 0;
                    state.selectedAnswers = Array(QUIZ_BANK.length).fill(null);
                    state.submitted = false;
                    renderQuestion();
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