/**
 * Demo Flow — PP1 Presentation
 * ==============================
 * Self-contained frontend demo showing the full learning journey:
 * Welcome → Pre-Test → Analysis → Recommendation → Game → Post-Test → Result → Dashboard
 * Uses mock data only — does NOT touch backend.
 */

import "../demo-flow.css";

// ── Mock Data ───────────────────────────────────────────────────────
const CONCEPTS = ["Variables", "Operators", "Loops", "Arrays", "Methods"];
const WEAK_CONCEPT = "Loops";

const MOCK_QUESTIONS = [
    { q: "What does a for loop do in Java?", code: null, options: ["Repeats a block of code a set number of times", "Defines a new variable", "Creates a new method", "Prints output to console"], correct: 0 },
    { q: "What is the output of this code?", code: "for (int i = 0; i < 3; i++) {\n    System.out.print(i + \" \");\n}", options: ["0 1 2", "1 2 3", "0 1 2 3", "1 2"], correct: 0 },
    { q: "Which loop is best when the number of iterations is unknown?", code: null, options: ["while loop", "for loop", "do-while loop", "switch statement"], correct: 0 },
    { q: "What happens if a loop condition is always true?", code: null, options: ["Infinite loop", "Compilation error", "Loop runs once", "Program exits"], correct: 0 },
    { q: "What is the correct syntax for a while loop?", code: null, options: ["while (condition) { }", "while { condition }", "loop (condition) { }", "for (condition) { }"], correct: 0 },
    { q: "What does 'break' do inside a loop?", code: null, options: ["Exits the loop immediately", "Skips to next iteration", "Restarts the loop", "Pauses the loop"], correct: 0 },
    { q: "What does 'continue' do inside a loop?", code: null, options: ["Skips to next iteration", "Exits the loop", "Restarts the loop", "Does nothing"], correct: 0 },
    { q: "How many times will this loop run?", code: "int i = 5;\nwhile (i > 0) {\n    i--;\n}", options: ["5 times", "4 times", "6 times", "Infinite"], correct: 0 },
    { q: "Which keyword is used to repeat code in Java?", code: null, options: ["for", "def", "repeat", "func"], correct: 0 },
    { q: "What is a nested loop?", code: null, options: ["A loop inside another loop", "Two loops running in parallel", "A loop that never ends", "A loop with no body"], correct: 0 },
];

// ── Steps ───────────────────────────────────────────────────────────
const STEPS = [
    { id: "welcome",   label: "Start",       icon: "fa-house" },
    { id: "prestart",  label: "Pre-Test",     icon: "fa-clipboard-list" },
    { id: "quiz",      label: "Quiz",         icon: "fa-pen-to-square" },
    { id: "analysis",  label: "Analysis",     icon: "fa-magnifying-glass-chart" },
    { id: "recommend", label: "Recommend",    icon: "fa-bullseye" },
    { id: "game",      label: "Game Lesson",  icon: "fa-gamepad" },
    { id: "poststart", label: "Post-Test",    icon: "fa-clipboard-check" },
    { id: "postquiz",  label: "Check",        icon: "fa-list-check" },
    { id: "result",    label: "Result",       icon: "fa-trophy" },
    { id: "dashboard", label: "Dashboard",    icon: "fa-chart-simple" },
];

let currentStep = 0;
let quizAnswers = [];
let postAnswers = [];
let currentQ = 0;
let isPostQuiz = false;

// ── Entry Point ─────────────────────────────────────────────────────
export function renderDemoFlow(container) {
    currentStep = 0; quizAnswers = []; postAnswers = []; currentQ = 0; isPostQuiz = false;
    renderStep(container);
}

function renderStep(container) {
    const step = STEPS[currentStep];
    const handlers = {
        welcome: renderWelcome,
        prestart: renderPreTestStart,
        quiz: renderQuiz,
        analysis: renderAnalysis,
        recommend: renderRecommendation,
        game: renderGameDemo,
        poststart: renderPostTestStart,
        postquiz: renderPostQuiz,
        result: renderResult,
        dashboard: renderDashSummary,
    };
    (handlers[step.id] || renderWelcome)(container);
}

function goTo(container, stepId) {
    currentStep = STEPS.findIndex(s => s.id === stepId);
    if (currentStep < 0) currentStep = 0;
    renderStep(container);
}

// ── Stepper HTML ────────────────────────────────────────────────────
function stepperHTML() {
    return `<div class="df-stepper">${STEPS.map((s, i) => {
        const cls = i < currentStep ? "done" : i === currentStep ? "active" : "";
        const icon = i < currentStep ? '<i class="fa-solid fa-check"></i>' : `<i class="fa-solid ${s.icon}"></i>`;
        const line = i < STEPS.length - 1 ? `<div class="df-step-line ${i < currentStep ? 'done' : ''}"></div>` : '';
        return `<div class="df-step ${cls}"><div class="df-step-circle">${icon}</div><span class="df-step-label">${s.label}</span></div>${line}`;
    }).join('')}</div>`;
}

// ── SCREEN 1: Welcome ──────────────────────────────────────────────
function renderWelcome(container) {
    container.innerHTML = `
        <div class="df-page--wide" style="padding:0;">
            <div class="df-welcome-hero">
                <img src="assets/codequest_hero.png" class="df-welcome-bg" alt="Background">
                <div class="df-welcome-content">
                    <div class="df-welcome-brand"><i class="fa-solid fa-code"></i> CodeQuest Learn</div>
                    <p class="df-welcome-sub">Master programming through interactive pre-tests, smart analysis, and gamified challenges grounded in research.</p>
                    
                    <div class="df-features">
                        <div class="df-feature-card">
                            <i class="fa-solid fa-clipboard-list"></i>
                            <div class="df-feature-card-text">
                                <h4>Quick Pre-Test</h4>
                                <p>Identify your knowledge gaps in minutes.</p>
                            </div>
                        </div>
                        <div class="df-feature-card">
                            <i class="fa-solid fa-magnifying-glass-chart"></i>
                            <div class="df-feature-card-text">
                                <h4>Smart Analysis</h4>
                                <p>Deep dive into your error patterns.</p>
                            </div>
                        </div>
                        <div class="df-feature-card">
                            <i class="fa-solid fa-gamepad"></i>
                            <div class="df-feature-card-text">
                                <h4>Game Lessons</h4>
                                <p>Fix misconceptions through play.</p>
                            </div>
                        </div>
                        <div class="df-feature-card">
                            <i class="fa-solid fa-circle-check"></i>
                            <div class="df-feature-card-text">
                                <h4>Understanding Check</h4>
                                <p>Validate your new conceptual schema.</p>
                            </div>
                        </div>
                    </div>
                    
                    <button class="df-btn df-btn-primary df-btn-lg" id="df-get-started" style="min-width:300px;">
                        <i class="fa-solid fa-rocket"></i> Start Learning Journey
                    </button>
                </div>
            </div>
        </div>`;
    document.getElementById("df-get-started").addEventListener("click", () => goTo(container, "prestart"));
}

// ── SCREEN 2: Pre-Test Start ───────────────────────────────────────
function renderPreTestStart(container) {
    container.innerHTML = `
        <div class="df-page df-center">
            ${stepperHTML()}
            <div class="df-card">
                <div class="df-card-icon"><i class="fa-solid fa-clipboard-list"></i></div>
                <h2>Start Your Programming Check</h2>
                <p>We'll ask a few questions to understand which programming topics you may need to practice.</p>
                <div class="df-chips">${CONCEPTS.map(c => `<span class="df-chip">${c}</span>`).join('')}</div>
                <button class="df-btn df-btn-primary df-btn-lg" id="df-start-pretest" style="margin-top:1rem;"><i class="fa-solid fa-play"></i> Start Pre-Test</button>
            </div>
        </div>`;
    document.getElementById("df-start-pretest").addEventListener("click", () => { currentQ = 0; quizAnswers = new Array(MOCK_QUESTIONS.length).fill(-1); isPostQuiz = false; goTo(container, "quiz"); });
}

// ── SCREEN 3: Quiz (Pre-Test) ──────────────────────────────────────
function renderQuiz(container) {
    const answers = isPostQuiz ? postAnswers : quizAnswers;
    const q = MOCK_QUESTIONS[currentQ];
    const total = MOCK_QUESTIONS.length;
    const pct = ((currentQ + 1) / total * 100).toFixed(0);
    const letters = ["A", "B", "C", "D"];
    const label = isPostQuiz ? `${WEAK_CONCEPT} Check` : "Pre-Test";

    container.innerHTML = `
        <div class="df-page">
            ${stepperHTML()}
            <div class="df-card" style="text-align:left; max-width:680px; margin:0 auto;">
                <div class="df-quiz-header">
                    <span class="df-quiz-concept"><i class="fa-solid fa-tag"></i> ${label}</span>
                    <span class="df-quiz-counter">Question ${currentQ + 1} of ${total}</span>
                </div>
                <div class="df-quiz-progress"><div class="df-quiz-progress-fill" style="width:${pct}%"></div></div>
                <div class="df-quiz-question">${q.q}</div>
                ${q.code ? `<div class="df-quiz-code">${q.code}</div>` : ''}
                <div class="df-quiz-options">
                    ${q.options.map((opt, i) => `
                        <div class="df-quiz-option ${answers[currentQ] === i ? 'selected' : ''}" data-idx="${i}">
                            <span class="df-quiz-option-letter">${letters[i]}</span>
                            <span>${opt}</span>
                        </div>`).join('')}
                </div>
                <div class="df-quiz-nav">
                    ${currentQ > 0 ? '<button class="df-btn df-btn-outline" id="df-q-prev"><i class="fa-solid fa-arrow-left"></i> Previous</button>' : ''}
                    ${currentQ < total - 1
                        ? '<button class="df-btn df-btn-primary" id="df-q-next">Next <i class="fa-solid fa-arrow-right"></i></button>'
                        : '<button class="df-btn df-btn-success" id="df-q-submit"><i class="fa-solid fa-paper-plane"></i> Submit</button>'}
                </div>
            </div>
        </div>`;

    // Wire options
    container.querySelectorAll(".df-quiz-option").forEach(opt => {
        opt.addEventListener("click", () => {
            answers[currentQ] = parseInt(opt.dataset.idx);
            container.querySelectorAll(".df-quiz-option").forEach(o => o.classList.remove("selected"));
            opt.classList.add("selected");
        });
    });

    // Wire nav
    document.getElementById("df-q-prev")?.addEventListener("click", () => { currentQ--; renderQuiz(container); });
    document.getElementById("df-q-next")?.addEventListener("click", () => { currentQ++; renderQuiz(container); });
    document.getElementById("df-q-submit")?.addEventListener("click", () => {
        if (isPostQuiz) { goTo(container, "result"); }
        else { goTo(container, "analysis"); }
    });
}

// ── SCREEN 4: Analysis Loading ─────────────────────────────────────
function renderAnalysis(container) {
    const steps = [
        { icon: "fa-check-double", text: "Checking your answers..." },
        { icon: "fa-magnifying-glass", text: "Finding topics to improve..." },
        { icon: "fa-lightbulb", text: "Understanding why mistakes happened..." },
        { icon: "fa-gamepad", text: "Preparing your game lesson..." },
    ];
    container.innerHTML = `
        <div class="df-page df-center">
            ${stepperHTML()}
            <div class="df-analysis">
                <div class="df-analysis-spinner"></div>
                <h2>Analyzing Your Learning Needs</h2>
                <p style="color:var(--text-secondary);max-width:440px;">We're checking your answers to understand which topic needs more practice and why.</p>
                <div class="df-analysis-steps">
                    ${steps.map((s, i) => `<div class="df-analysis-step" style="animation-delay:${i * 0.8}s"><i class="fa-solid ${s.icon}"></i> ${s.text}</div>`).join('')}
                </div>
            </div>
        </div>`;

    const stepEls = container.querySelectorAll(".df-analysis-step");
    stepEls.forEach((el, i) => {
        setTimeout(() => el.classList.add("done"), (i + 1) * 900);
    });
    setTimeout(() => goTo(container, "recommend"), steps.length * 900 + 800);
}

// ── SCREEN 5: Learning Analysis Result (Component 2 frontend) ──────
function renderRecommendation(container) {
    // Mock wrong answers data (easy to replace with real backend data later)
    const wrongAnswers = [
        {
            questionNo: 3, concept: "Loops",
            question: "How many times will this loop run?",
            code: "for (int i = 0; i <= 5; i++) {\n    System.out.println(i);\n}",
            studentAnswer: "5 times", correctAnswer: "6 times",
            reason: "The loop starts at 0 and also includes 5 because of the <= condition. This creates 6 iterations (0, 1, 2, 3, 4, 5).",
            mistakeType: "Loop boundary confusion"
        },
        {
            questionNo: 5, concept: "Loops",
            question: "What is missing in this while loop?",
            code: "int i = 1;\nwhile (i <= 5) {\n    System.out.println(i);\n}",
            studentAnswer: "Condition", correctAnswer: "Update statement (i++)",
            reason: "The value of i is never changed inside the loop, so the condition i <= 5 is always true and the loop never stops.",
            mistakeType: "Missing update step"
        },
        {
            questionNo: 7, concept: "Loops",
            question: "What does i++ do in a for loop?",
            code: "for (int i = 1; i <= 3; i++) {\n    System.out.println(i);\n}",
            studentAnswer: "Stops the loop", correctAnswer: "Increases i by 1 after each loop cycle",
            reason: "i++ is the update expression. It increases i by 1 after each iteration, helping the loop move toward its stopping condition.",
            mistakeType: "Loop update confusion"
        }
    ];

    const reviewCardsHTML = wrongAnswers.map((wa, idx) => `
        <div class="df-review-card ${idx < 2 ? 'open' : ''}" style="animation-delay:${idx * 0.1}s">
            <div class="df-review-card-header" data-idx="${idx}">
                <div class="df-review-card-left">
                    <span class="df-review-qnum">Question ${wa.questionNo}</span>
                    <span class="df-review-concept-badge">${wa.concept}</span>
                    <span class="df-review-mistake-tag">${wa.mistakeType}</span>
                </div>
                <i class="fa-solid fa-chevron-down df-review-chevron"></i>
            </div>
            <div class="df-review-card-body">
                <p class="df-review-q-text">${wa.question}</p>
                ${wa.code ? `<div class="df-review-code">${wa.code}</div>` : ''}
                <div class="df-review-answers">
                    <div class="df-review-ans-box wrong">
                        <div class="df-review-ans-label wrong"><i class="fa-solid fa-circle-xmark"></i> Your Answer</div>
                        <div class="df-review-ans-value">${wa.studentAnswer}</div>
                    </div>
                    <div class="df-review-ans-box correct">
                        <div class="df-review-ans-label correct"><i class="fa-solid fa-circle-check"></i> Correct Answer</div>
                        <div class="df-review-ans-value">${wa.correctAnswer}</div>
                    </div>
                </div>
                <div class="df-review-reason">
                    <div class="df-review-reason-title"><i class="fa-solid fa-circle-info"></i> Why this happened</div>
                    <div class="df-review-reason-text">${wa.reason}</div>
                </div>
            </div>
        </div>
    `).join('');

    container.innerHTML = `
        <div class="df-page">
            ${stepperHTML()}
            <div style="text-align:center;margin-bottom:1.5rem;">
                <h2 style="margin-bottom:0.25rem;"><i class="fa-solid fa-magnifying-glass-chart" style="color:#6366f1;margin-right:0.5rem;"></i> Learning Analysis</h2>
                <p style="color:var(--text-secondary);">Here's what we noticed from your pre-test answers.</p>
            </div>

            <!-- Summary pills -->
            <div class="df-summary-row">
                <div class="df-summary-pill"><i class="fa-solid fa-bullseye" style="color:#f59e0b;"></i> <span>Topic: <strong>${WEAK_CONCEPT}</strong></span></div>
                <div class="df-summary-pill"><i class="fa-solid fa-triangle-exclamation" style="color:#f87171;"></i> <span>${wrongAnswers.length} questions to review</span></div>
                <div class="df-summary-pill"><i class="fa-solid fa-gamepad" style="color:#22c55e;"></i> <span>Game: <strong>Loop Challenge</strong></span></div>
            </div>

            <!-- Wrong answer review -->
            <div class="df-review-section">
                <h3><i class="fa-solid fa-clipboard-list" style="color:#f59e0b;"></i> Questions to Review</h3>
                ${reviewCardsHTML}
            </div>

            <!-- Recommended game -->
            <div class="df-game-rec">
                <h3><i class="fa-solid fa-gamepad" style="color:#22c55e;"></i> Recommended Game Lesson</h3>
                <div class="df-game-rec-inner">
                    <div class="df-game-rec-icon"><i class="fa-solid fa-puzzle-piece"></i></div>
                    <div class="df-game-rec-info">
                        <h4>Loop Challenge Game</h4>
                        <p>This game will help you practice loop conditions, repeated steps, and stopping rules.</p>
                        <ul class="df-game-rec-focus">
                            <li><i class="fa-solid fa-check"></i> Understanding loop start value</li>
                            <li><i class="fa-solid fa-check"></i> Understanding loop stop condition</li>
                            <li><i class="fa-solid fa-check"></i> Avoiding off-by-one mistakes</li>
                        </ul>
                        <button class="df-btn df-btn-primary df-btn-lg" id="df-start-game"><i class="fa-solid fa-play"></i> Start Game Lesson</button>
                    </div>
                </div>
            </div>
        </div>`;

    // Wire accordion toggle
    container.querySelectorAll(".df-review-card-header").forEach(header => {
        header.addEventListener("click", () => {
            header.closest(".df-review-card").classList.toggle("open");
        });
    });

    document.getElementById("df-start-game").addEventListener("click", () => goTo(container, "game"));
}

// ── SCREEN 6: Game Demo ────────────────────────────────────────────
function renderGameDemo(container) {
    container.innerHTML = `
        <div class="df-page df-center">
            ${stepperHTML()}
            <div class="df-game">
                <h2 style="margin-bottom:0.25rem;">Loop Challenge Game</h2>
                <p style="color:var(--text-secondary);margin-bottom:1.2rem;">Practice loop logic through a short game activity.</p>
                <div class="df-game-stats">
                    <div class="df-game-stat"><i class="fa-solid fa-bullseye"></i> Objective: Complete the loop pattern</div>
                    <div class="df-game-stat"><i class="fa-solid fa-star"></i> Score: 850</div>
                    <div class="df-game-stat"><i class="fa-solid fa-rotate"></i> Attempts: 3</div>
                </div>
                <div class="df-game-area">
                    <i class="fa-solid fa-gamepad"></i>
                    <p style="color:var(--text-secondary);">Game activity area</p>
                    <div style="width:80%;height:8px;background:var(--bg-secondary);border-radius:4px;margin-top:1rem;">
                        <div style="width:72%;height:100%;background:#6366f1;border-radius:4px;transition:width 1s;"></div>
                    </div>
                    <p style="font-size:0.8rem;color:var(--text-secondary);margin-top:0.5rem;">Progress: 72%</p>
                </div>
                <button class="df-btn df-btn-success df-btn-lg" id="df-complete-game" style="margin-top:0.5rem;"><i class="fa-solid fa-check"></i> Complete Lesson</button>
            </div>
        </div>`;
    document.getElementById("df-complete-game").addEventListener("click", () => goTo(container, "poststart"));
}

// ── SCREEN 7: Post-Test Start ──────────────────────────────────────
function renderPostTestStart(container) {
    container.innerHTML = `
        <div class="df-page df-center">
            ${stepperHTML()}
            <div class="df-card">
                <div class="df-card-icon"><i class="fa-solid fa-clipboard-check"></i></div>
                <h2>Ready to Check Your Understanding?</h2>
                <p>You completed the ${WEAK_CONCEPT} game lesson. Now answer a few questions to see how well you understood this topic.</p>
                <div class="df-chips"><span class="df-chip" style="font-size:0.9rem;padding:0.5rem 1.4rem;"><i class="fa-solid fa-tag"></i> ${WEAK_CONCEPT}</span></div>
                <button class="df-btn df-btn-primary df-btn-lg" id="df-start-posttest" style="margin-top:1rem;"><i class="fa-solid fa-play"></i> Start Check</button>
            </div>
        </div>`;
    document.getElementById("df-start-posttest").addEventListener("click", () => { currentQ = 0; postAnswers = new Array(MOCK_QUESTIONS.length).fill(-1); isPostQuiz = true; goTo(container, "postquiz"); });
}

// ── SCREEN 8: Post-Test Quiz ───────────────────────────────────────
function renderPostQuiz(container) {
    renderQuiz(container); // Reuses the same quiz renderer with isPostQuiz flag
}

// ── SCREEN 9: Result ───────────────────────────────────────────────
function renderResult(container) {
    const score = 82;
    const correct = 8, nearly = 1, wrong = 1;
    const passed = score >= 60;
    const level = score >= 80 ? { label: "Strong Understanding", color: "#22c55e", bg: "rgba(34,197,94,0.12)", title: "Great Work!" }
                : score >= 60 ? { label: "Good Progress", color: "#3b82f6", bg: "rgba(59,130,246,0.12)", title: "Good Progress!" }
                : score >= 40 ? { label: "Needs More Practice", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", title: "Keep Practicing" }
                : { label: "Learn Again", color: "#ef4444", bg: "rgba(239,68,68,0.12)", title: "Let's Learn Again" };

    container.innerHTML = `
        <div class="df-page df-center">
            ${stepperHTML()}
            <div class="df-result">
                <div class="df-card">
                    <h2 style="font-size:1.6rem;margin-bottom:0.75rem;">${level.title}</h2>
                    <div class="df-result-score" style="border-color:${level.color};color:${level.color};">${score}%</div>
                    <div class="df-result-badge" style="background:${level.bg};color:${level.color};"><i class="fa-solid fa-trophy"></i> ${level.label}</div>
                    <p style="margin-bottom:0.5rem;font-size:0.95rem;color:var(--text-primary);">${WEAK_CONCEPT}</p>
                    <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:1rem;">
                        ${passed ? `You understood ${WEAK_CONCEPT} well and can continue to the next step.` : `You are close, but ${WEAK_CONCEPT} still needs more practice.`}
                    </p>
                    <div class="df-result-stats">
                        <div class="df-result-stat"><span class="val" style="color:#22c55e;">${correct}</span><span class="lbl">Correct</span></div>
                        <div class="df-result-stat"><span class="val" style="color:#f59e0b;">${nearly}</span><span class="lbl">Almost</span></div>
                        <div class="df-result-stat"><span class="val" style="color:#ef4444;">${wrong}</span><span class="lbl">Review</span></div>
                    </div>
                    <button class="df-btn ${passed ? 'df-btn-success' : 'df-btn-warning'} df-btn-lg" id="df-result-action" style="margin-top:0.5rem;">
                        ${passed ? '<i class="fa-solid fa-check"></i> Done' : '<i class="fa-solid fa-rotate-left"></i> Learn Again'}
                    </button>
                </div>
            </div>
        </div>`;
    document.getElementById("df-result-action").addEventListener("click", () => {
        if (passed) goTo(container, "dashboard");
        else goTo(container, "game");
    });
}

// ── SCREEN 10: Dashboard Summary ───────────────────────────────────
function renderDashSummary(container) {
    const concepts = [
        { name: "Variables", icon: "fa-box", status: "Not Started", color: "#64748b", bg: "rgba(100,116,139,0.15)" },
        { name: "Operators", icon: "fa-calculator", status: "Not Started", color: "#64748b", bg: "rgba(100,116,139,0.15)" },
        { name: "Loops", icon: "fa-rotate", status: "Strong Understanding", color: "#22c55e", bg: "rgba(34,197,94,0.15)" },
        { name: "Arrays", icon: "fa-table-cells", status: "Not Started", color: "#64748b", bg: "rgba(100,116,139,0.15)" },
        { name: "Methods", icon: "fa-code", status: "Not Started", color: "#64748b", bg: "rgba(100,116,139,0.15)" },
    ];
    container.innerHTML = `
        <div class="df-page">
            ${stepperHTML()}
            <h2 style="margin-bottom:0.25rem;"><i class="fa-solid fa-chart-simple" style="color:#6366f1;margin-right:0.5rem;"></i> Your Learning Progress</h2>
            <p style="color:var(--text-secondary);margin-bottom:0.5rem;">Welcome back! Here's your overall progress across all concepts.</p>
            <div class="df-dash-grid">
                ${concepts.map(c => `
                    <div class="df-dash-card">
                        <div class="df-dash-card-icon" style="background:${c.bg};color:${c.color};"><i class="fa-solid ${c.icon}"></i></div>
                        <div class="df-dash-card-info">
                            <h4>${c.name}</h4>
                            <span class="df-dash-status" style="color:${c.color};">${c.status}</span>
                        </div>
                    </div>`).join('')}
            </div>
            <div style="text-align:center;margin-top:2rem;">
                <button class="df-btn df-btn-outline" id="df-restart"><i class="fa-solid fa-rotate-left"></i> Restart Demo</button>
            </div>
        </div>`;
    document.getElementById("df-restart").addEventListener("click", () => { currentStep = 0; renderStep(container); });
}
