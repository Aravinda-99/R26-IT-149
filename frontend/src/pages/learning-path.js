/**
 * Learning Path + Quiz Lab Page
 * =============================
 * Modern student-friendly interface with:
 * - Adaptive learning path cards
 * - 20 quizzes
 * - Each quiz has 4 MCQ answers
 * - Instant feedback + score summary
 */

import { AdaptiveAPI } from "../api/api.js";

const DEFAULT_PATH = [
    { name: "Variables & Data Types", mastery: 20, status: "started" },
    { name: "Conditionals", mastery: 15, status: "not_started" },
    { name: "Loops", mastery: 10, status: "not_started" },
    { name: "Functions", mastery: 5, status: "not_started" },
    { name: "Arrays", mastery: 0, status: "not_started" },
    { name: "Objects", mastery: 0, status: "not_started" },
];

const QUIZ_BANK = [
    {
        id: 1,
        topic: "Variables",
        question: "Which keyword is best for a variable that should not be reassigned in JavaScript?",
        options: ["var", "const", "let", "static"],
        correctIndex: 1,
        explanation: "const prevents reassignment of the variable binding."
    },
    {
        id: 2,
        topic: "Data Types",
        question: "What is the result type of 10 / 3 in JavaScript?",
        options: ["Integer", "String", "Number", "Boolean"],
        correctIndex: 2,
        explanation: "JavaScript uses Number for both integer and floating-point values."
    },
    {
        id: 3,
        topic: "Conditionals",
        question: "Which operator checks both value and type equality?",
        options: ["==", "!=", "===", "="],
        correctIndex: 2,
        explanation: "=== checks value and type, unlike ==."
    },
    {
        id: 4,
        topic: "Loops",
        question: "Which loop is best when you know how many times to repeat?",
        options: ["while", "for", "do...while", "switch"],
        correctIndex: 1,
        explanation: "for loop is ideal for count-controlled iteration."
    },
    {
        id: 5,
        topic: "Functions",
        question: "How do you call a function named greet?",
        options: ["call greet;", "greet[]", "greet()", "run greet()"],
        correctIndex: 2,
        explanation: "Parentheses invoke the function."
    },
    {
        id: 6,
        topic: "Arrays",
        question: "Which method adds an element to the end of an array?",
        options: ["shift()", "push()", "unshift()", "pop()"],
        correctIndex: 1,
        explanation: "push() appends to the end."
    },
    {
        id: 7,
        topic: "Objects",
        question: "How do you access property name from user object?",
        options: ["user->name", "user.name", "user[name]", "name.user"],
        correctIndex: 1,
        explanation: "Dot notation is user.name."
    },
    {
        id: 8,
        topic: "Strings",
        question: "Which method converts text to uppercase?",
        options: ["toUpperCase()", "upper()", "capitalize()", "toCaps()"],
        correctIndex: 0,
        explanation: "toUpperCase() returns an uppercase string."
    },
    {
        id: 9,
        topic: "Booleans",
        question: "Which value is falsy in JavaScript?",
        options: ["'0'", "[]", "0", "{}"],
        correctIndex: 2,
        explanation: "0 is falsy; the others listed are truthy."
    },
    {
        id: 10,
        topic: "Scope",
        question: "Variables declared with let are scoped to:",
        options: ["function only", "global only", "block", "object"],
        correctIndex: 2,
        explanation: "let has block scope."
    },
    {
        id: 11,
        topic: "DOM",
        question: "Which method finds an element by its id?",
        options: ["querySelectorAll()", "getElementById()", "findById()", "selectId()"],
        correctIndex: 1,
        explanation: "document.getElementById() fetches by id."
    },
    {
        id: 12,
        topic: "Events",
        question: "Which event fires when a button is pressed?",
        options: ["hover", "submit", "click", "change"],
        correctIndex: 2,
        explanation: "click is the standard button press event."
    },
    {
        id: 13,
        topic: "Async",
        question: "Which keyword pauses inside an async function?",
        options: ["wait", "pause", "await", "yield"],
        correctIndex: 2,
        explanation: "await pauses until a promise resolves."
    },
    {
        id: 14,
        topic: "JSON",
        question: "Which function converts an object to JSON text?",
        options: ["JSON.parse()", "JSON.stringify()", "toJSONText()", "JSON.objectify()"],
        correctIndex: 1,
        explanation: "JSON.stringify() serializes object to string."
    },
    {
        id: 15,
        topic: "Debugging",
        question: "What is the main use of console.log?",
        options: ["Create UI", "Store permanent data", "Print debug info", "Compile code"],
        correctIndex: 2,
        explanation: "console.log helps inspect runtime values."
    },
    {
        id: 16,
        topic: "Operators",
        question: "What does ++ do?",
        options: ["Decrements by 1", "Increments by 1", "Multiplies by 2", "Converts to string"],
        correctIndex: 1,
        explanation: "++ increases numeric value by one."
    },
    {
        id: 17,
        topic: "Arrays",
        question: "Which method removes the last item in an array?",
        options: ["pop()", "slice()", "splice()", "shift()"],
        correctIndex: 0,
        explanation: "pop() removes and returns the last element."
    },
    {
        id: 18,
        topic: "Functions",
        question: "What does a function return if there is no return statement?",
        options: ["null", "0", "undefined", "false"],
        correctIndex: 2,
        explanation: "Functions return undefined by default."
    },
    {
        id: 19,
        topic: "Conditionals",
        question: "Which statement is used for multiple branch choices?",
        options: ["if only", "switch", "loop", "try"],
        correctIndex: 1,
        explanation: "switch handles multiple discrete branches."
    },
    {
        id: 20,
        topic: "Best Practice",
        question: "Why is meaningful variable naming important?",
        options: ["It makes code slower", "It improves readability", "It removes bugs automatically", "It changes syntax"],
        correctIndex: 1,
        explanation: "Good names make code easier to understand and maintain."
    },
];

export async function renderLearningPath(container) {
    container.innerHTML = `
        <section class="lp-hero card">
            <div>
                <h1 class="lp-title">Adaptive Learning Path</h1>
                <p class="lp-subtitle">20 quick quizzes to boost your programming confidence, one step at a time.</p>
            </div>
            <div class="lp-pill">Student Mode</div>
        </section>

        <section class="grid-2 lp-main-grid">
            <div class="card">
                <h3 style="margin-bottom: 0.5rem;">Your Topic Roadmap</h3>
                <p class="lp-muted">Ordered by recommended learning sequence</p>
                <div id="path-list" class="lp-path-list">
                    <p class="lp-muted">Loading your path...</p>
                </div>
            </div>

            <div class="card">
                <h3 style="margin-bottom: 0.5rem;">Quiz Lab</h3>
                <p class="lp-muted">20 quizzes • 4 choices each • instant feedback</p>

                <div class="lp-quiz-progress-wrap">
                    <div class="lp-quiz-progress-head">
                        <span id="quiz-counter">Question 1 of 20</span>
                        <span id="quiz-score-mini">Score: 0</span>
                    </div>
                    <div class="lp-progress-track">
                        <div id="quiz-progress-bar" class="lp-progress-bar" style="width: 5%;"></div>
                    </div>
                </div>

                <div id="quiz-box"></div>

                <div class="lp-quiz-actions">
                    <button class="btn" id="prev-quiz-btn" style="background: var(--border-color); color: var(--text-primary);" disabled>Previous</button>
                    <button class="btn btn-primary" id="next-quiz-btn">Next</button>
                </div>
            </div>
        </section>
    `;

    await loadLearningPath();
    setupQuizUI();
}

async function loadLearningPath() {
    const pathEl = document.getElementById("path-list");
    if (!pathEl) return;

    try {
        const data = await AdaptiveAPI.getLearningPath("demo_user");
        const path = Array.isArray(data?.learning_path) ? data.learning_path : DEFAULT_PATH;
        pathEl.innerHTML = renderPathCards(path);
    } catch {
        pathEl.innerHTML = renderPathCards(DEFAULT_PATH);
    }
}

function renderPathCards(path) {
    return path
        .map((topic, i) => {
            const started = topic.status === "started";
            return `
                <div class="lp-path-item">
                    <div class="lp-step-dot ${started ? "started" : ""}">${i + 1}</div>
                    <div class="lp-step-body">
                        <strong>${topic.name}</strong>
                        <p class="lp-muted-sm">Mastery: ${topic.mastery}% • ${String(topic.status).replace("_", " ")}</p>
                    </div>
                    <span class="lp-mastery">${topic.mastery}%</span>
                </div>
            `;
        })
        .join("");
}

function setupQuizUI() {
    const state = {
        current: 0,
        selectedAnswers: Array(QUIZ_BANK.length).fill(null),
        submitted: false,
    };

    const quizBox = document.getElementById("quiz-box");
    const counter = document.getElementById("quiz-counter");
    const miniScore = document.getElementById("quiz-score-mini");
    const progressBar = document.getElementById("quiz-progress-bar");
    const prevBtn = document.getElementById("prev-quiz-btn");
    const nextBtn = document.getElementById("next-quiz-btn");

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
                    <button id="retry-quiz-btn" class="btn btn-primary" style="margin-top: 1rem;">Retry 20 Questions</button>
                </article>
            `;

            miniScore.textContent = `Score: ${score}`;
            progressBar.style.width = "100%";
            counter.textContent = `Completed: ${QUIZ_BANK.length} questions`;
            prevBtn.disabled = true;
            nextBtn.textContent = "Review Again";

            const retryBtn = document.getElementById("retry-quiz-btn");
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