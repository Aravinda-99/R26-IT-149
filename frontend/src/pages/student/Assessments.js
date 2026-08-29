/**
 * Assessments Hub — CodeQuest Adaptive Learning Platform
 * =======================================================
 * Combines Pre-Test (Diagnostic Assessment) and Post-Test (Understanding Checks)
 * into a single cohesive learning assessments experience.
 */

export function renderAssessments(container, onNavigate) {
    const postTestCompleted = sessionStorage.getItem("last_post_test_result");
    const preTestCompleted = sessionStorage.getItem("quiz-results");

    container.innerHTML = `
        <div style="max-width: 960px; margin: 0 auto;">
            
            <!-- Page Header -->
            <div style="margin-bottom: 2rem;">
                <div style="font-size: 0.8125rem; font-weight: 600; color: var(--primary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.35rem;">
                    Assessment Center
                </div>
                <h1 style="font-size: 1.875rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem;">
                    Learning Assessments
                </h1>
                <p style="font-size: 0.9375rem; color: var(--text-muted);">
                    Diagnostic tests identify where to focus, while understanding checks validate your mastery after game lessons.
                </p>
            </div>

            <!-- 2-Column Assessment Cards -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2.5rem;">
                
                <!-- Card 1: Diagnostic Pre-Test -->
                <div style="background: #FFFFFF; border: 1px solid var(--border-main); border-radius: var(--radius-lg); padding: 1.75rem; display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                            <span class="badge ${preTestCompleted ? 'badge-mastered' : 'badge-primary'}">
                                ${preTestCompleted ? 'Completed' : 'Step 1: Baseline'}
                            </span>
                            <span style="font-size: 0.8125rem; color: var(--text-subtle);"><i class="fa-regular fa-clock"></i> ~10 min</span>
                        </div>
                        <h2 style="font-size: 1.25rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.4rem;">
                            Diagnostic Pre-Test
                        </h2>
                        <p style="font-size: 0.875rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 1.25rem;">
                            15 diagnostic programming questions covering Java syntax, variables, operators, and loops to detect misconception patterns.
                        </p>
                    </div>

                    <div>
                        <button type="button" class="btn ${preTestCompleted ? 'btn-secondary' : 'btn-primary'}" id="launch-diagnostic-btn" style="width: 100%; font-weight: 600;">
                            ${preTestCompleted ? 'Retake Diagnostic' : 'Start Diagnostic'} <i class="fa-solid fa-arrow-right" style="margin-left: 0.35rem;"></i>
                        </button>
                    </div>
                </div>

                <!-- Card 2: Post-Learning Understanding Check -->
                <div style="background: #FFFFFF; border: 1px solid var(--border-main); border-radius: var(--radius-lg); padding: 1.75rem; display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                            <span class="badge ${postTestCompleted ? 'badge-mastered' : 'badge-neutral'}">
                                ${postTestCompleted ? 'Validated' : 'Step 4: Post-Learning'}
                            </span>
                            <span style="font-size: 0.8125rem; color: var(--text-subtle);"><i class="fa-solid fa-robot"></i> Dual ML Pipeline</span>
                        </div>
                        <h2 style="font-size: 1.25rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.4rem;">
                            Schema Understanding Check
                        </h2>
                        <p style="font-size: 0.875rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 1.25rem;">
                            15 curated questions evaluated by the Component 4 Schema Mastery ML model to assess whether concepts have been mastered.
                        </p>
                    </div>

                    <div>
                        <button type="button" class="btn btn-primary" id="launch-posttest-btn" style="width: 100%; font-weight: 600;">
                            ${postTestCompleted ? 'Take Another Check' : 'Start Understanding Check'} <i class="fa-solid fa-arrow-right" style="margin-left: 0.35rem;"></i>
                        </button>
                    </div>
                </div>

            </div>

        </div>
    `;

    container.querySelector("#launch-diagnostic-btn")?.addEventListener("click", () => {
        if (onNavigate) onNavigate("/student/pre-test");
    });

    container.querySelector("#launch-posttest-btn")?.addEventListener("click", () => {
        if (onNavigate) onNavigate("/student/post-test");
    });
}
