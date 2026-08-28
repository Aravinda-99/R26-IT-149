/**
 * QuizLab Component — CodeQuest Diagnostic Assessment Interface
 * ===============================================================
 * Clean, focused LMS quiz assessment with progress tracking,
 * code snippet syntax presentation, and immediate feedback.
 */

import { setupQuizUI } from "../learningPathGen/quizLab.js";

export async function renderQuizLab(container) {
    container.innerHTML = `
        <div class="quiz-lab-wrap" style="max-width: 860px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.75rem;">
            
            <!-- Page Header -->
            <div>
                <h1 style="font-size: 1.65rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.25rem;">
                    Diagnostic Quiz Assessment
                </h1>
                <p style="color: var(--text-muted); font-size: 0.9375rem;">
                    Evaluate your baseline conceptual understanding of Java programming topics.
                </p>
            </div>

            <!-- Quiz Container Card -->
            <div class="card" style="padding: 2rem; border-radius: var(--radius-md); background: var(--bg-surface); border: 1px solid var(--border-main);">
                
                <!-- Progress Header -->
                <div class="lp-quiz-progress-wrap" style="margin-bottom: 1.5rem;">
                    <div class="lp-quiz-progress-head" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <span id="quiz-counter" style="font-size: 0.875rem; font-weight: 700; color: var(--primary);">
                            Question 1 of 20
                        </span>
                        <span id="quiz-score-mini" class="badge badge-primary" style="font-size: 0.8125rem;">
                            Score: 0
                        </span>
                    </div>
                    <div class="lp-progress-track" style="height: 6px; background: var(--bg-surface-subtle); border-radius: var(--radius-full); overflow: hidden;">
                        <div id="quiz-progress-bar" class="lp-progress-bar" style="height: 100%; width: 5%; background: var(--primary); transition: width var(--transition-fast);"></div>
                    </div>
                </div>

                <!-- Active Question Box -->
                <div id="quiz-box" style="margin-top: 1rem; min-height: 240px;"></div>

                <!-- Navigation Controls -->
                <div class="lp-quiz-actions" style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--border-main); display: flex; justify-content: space-between; gap: 0.8rem;">
                    <button id="prev-quiz-btn" class="btn btn-secondary" disabled>
                        <i class="fa-solid fa-arrow-left"></i> Previous
                    </button>
                    <button id="next-quiz-btn" class="btn btn-primary">
                        Next <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </div>

            </div>

        </div>
    `;

    // Initialize quiz logic
    setupQuizUI();
}
