/**
 * Learning Path / Curriculum Page — CodeQuest Adaptive Learning Platform
 * =====================================================================
 * Displays structured concept progression map with real mastery states.
 */

export function renderLearningPath(container, onNavigate) {
    const modules = [
        {
            index: "01",
            name: "Variables & Data Types",
            desc: "Primitive data types (int, double, boolean, char) and variable assignment.",
            status: "Mastered",
            statusClass: "badge-mastered",
            lessons: "3 / 3 completed",
            unlocked: true,
        },
        {
            index: "02",
            name: "Operators & Expressions",
            desc: "Arithmetic operators, relational comparisons, and logical booleans.",
            status: "Mastered",
            statusClass: "badge-mastered",
            lessons: "3 / 3 completed",
            unlocked: true,
        },
        {
            index: "03",
            name: "Loops & Iteration",
            desc: "for-loops, while-loops, loop bounds, and nested traversal.",
            status: "In Progress",
            statusClass: "badge-developing",
            lessons: "1 / 3 completed",
            unlocked: true,
            isCurrent: true,
        },
        {
            index: "04",
            name: "Conditionals & Branching",
            desc: "if-else control flow, multi-branching, and switch blocks.",
            status: "Locked",
            statusClass: "badge-neutral",
            lessons: "0 / 3 completed",
            unlocked: false,
        },
        {
            index: "05",
            name: "Methods & Functions",
            desc: "Method declaration, return types, parameters, and variable scope.",
            status: "Locked",
            statusClass: "badge-neutral",
            lessons: "0 / 3 completed",
            unlocked: false,
        }
    ];

    container.innerHTML = `
        <div style="max-width: 960px; margin: 0 auto;">
            
            <!-- Page Header -->
            <div style="margin-bottom: 2rem;">
                <div style="font-size: 0.8125rem; font-weight: 600; color: var(--primary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.35rem;">
                    Curriculum Progression
                </div>
                <h1 style="font-size: 1.875rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem;">
                    Java Programming Learning Path
                </h1>
                <p style="font-size: 0.9375rem; color: var(--text-muted);">
                    Your learning pathway is automatically sequenced based on your diagnostic assessment and post-test mastery.
                </p>
            </div>

            <!-- Concept Rows Progression List -->
            <div class="concept-matrix" style="border-radius: var(--radius-lg);">
                ${modules.map((m) => `
                    <div class="concept-row" style="padding: 1.25rem 1.5rem; ${m.isCurrent ? 'background-color: var(--primary-soft); border-left: 3px solid var(--primary);' : ''}">
                        <div class="concept-info" style="gap: 1.25rem;">
                            <span class="concept-index" style="font-size: 0.9375rem; ${m.isCurrent ? 'color: var(--primary); font-weight: 700;' : ''}">${m.index}</span>
                            <div>
                                <div style="display: flex; align-items: center; gap: 0.5rem;">
                                    <span class="concept-name" style="font-size: 1.0625rem;">${m.name}</span>
                                    ${m.isCurrent ? '<span class="badge badge-primary">Current Focus</span>' : ''}
                                </div>
                                <div class="concept-meta" style="margin-top: 0.2rem;">${m.desc}</div>
                            </div>
                        </div>

                        <div style="display: flex; align-items: center; gap: 1.5rem;">
                            <div style="text-align: right;">
                                <span class="badge ${m.statusClass}">${m.status}</span>
                                <div style="font-size: 0.75rem; color: var(--text-subtle); margin-top: 0.2rem;">${m.lessons}</div>
                            </div>

                            ${m.unlocked ? `
                                <button type="button" class="btn ${m.isCurrent ? 'btn-primary' : 'btn-secondary'} btn-sm path-action-btn" data-module="${m.name}">
                                    ${m.isCurrent ? 'Continue' : 'Review'}
                                </button>
                            ` : `
                                <button type="button" class="btn btn-subtle btn-sm" disabled style="opacity: 0.4;">
                                    <i class="fa-solid fa-lock"></i>
                                </button>
                            `}
                        </div>
                    </div>
                `).join("")}
            </div>

        </div>
    `;

    container.querySelectorAll(".path-action-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            if (onNavigate) onNavigate("/student/practice");
        });
    });
}
