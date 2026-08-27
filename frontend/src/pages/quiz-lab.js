import { setupQuizUI } from "../learningPathGen/quizLab.js";

export async function renderQuizLab(container) {
    container.innerHTML = `
        <h1>Quiz Lab</h1>
        <p style="color: var(--text-secondary); margin-bottom: 1rem;">Take focused quizzes in a distraction-free view.</p>

        <div class="card" style="background: #F8FAFC; border-color: #E2E8F0;">
            <div class="lp-quiz-progress-wrap">
                <div class="lp-quiz-progress-head">
                    <span id="quiz-counter">Question 1 of 20</span>
                    <span id="quiz-score-mini">Score: 0</span>
                </div>
                <div class="lp-progress-track">
                    <div id="quiz-progress-bar" class="lp-progress-bar" style="width: 5%;"></div>
                </div>
            </div>

            <div id="quiz-box" style="margin-top: 1rem;"></div>

            <div class="lp-quiz-actions" style="margin-top: 1rem; display:flex; justify-content:space-between; gap:0.8rem;">
                <button id="prev-quiz-btn" class="btn" style="background: #E2E8F0; color: #0F172A;" disabled>Previous</button>
                <button id="next-quiz-btn" class="btn btn-primary" style="background: #2563EB;">Next</button>
            </div>
        </div>
    `;

    // Initialize quiz UI inside this container
    setupQuizUI();
}
