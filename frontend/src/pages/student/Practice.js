/**
 * Practice & Gamified Lessons Page — CodeQuest Adaptive Learning Platform
 * =======================================================================
 * Connects weak concepts identified by diagnosis to interactive game challenges.
 */

export function renderPractice(container, onNavigate) {
    const mlRecStr = sessionStorage.getItem("ml-recommendation");
    let targetTopic = "Loops";
    try {
        if (mlRecStr) {
            const parsed = JSON.parse(mlRecStr);
            if (parsed.next_topic && parsed.next_topic !== "all_mastered") {
                targetTopic = parsed.next_topic;
            }
        }
    } catch {}

    const topicCapitalized = targetTopic.charAt(0).toUpperCase() + targetTopic.slice(1);

    const challenges = [
        {
            level: 1,
            title: `${topicCapitalized} Level 1: Repeat the Pattern`,
            desc: "Learn loop variable initializers and termination conditions through visual stepping.",
            xp: "+50 XP",
            status: "Ready",
            statusClass: "badge-primary",
        },
        {
            level: 2,
            title: `${topicCapitalized} Level 2: Fix the Loop Condition`,
            desc: "Spot off-by-one errors and infinite loop conditions in real-time.",
            xp: "+75 XP",
            status: "Ready",
            statusClass: "badge-primary",
        },
        {
            level: 3,
            title: `${topicCapitalized} Level 3: Array Traversal Challenge`,
            desc: "Iterate through arrays using for-loops and accumulate sums accurately.",
            xp: "+100 XP",
            status: "Ready",
            statusClass: "badge-primary",
        }
    ];

    container.innerHTML = `
        <div style="max-width: 960px; margin: 0 auto;">
            
            <!-- Page Header -->
            <div style="margin-bottom: 2rem;">
                <div style="font-size: 0.8125rem; font-weight: 600; color: var(--primary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.35rem;">
                    Gamified Learning
                </div>
                <h1 style="font-size: 1.875rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem;">
                    Interactive Coding Practice
                </h1>
                <p style="font-size: 0.9375rem; color: var(--text-muted);">
                    Complete targeted gamified challenges to build intuition before taking the Understanding Check.
                </p>
            </div>

            <!-- Recommended Focus Banner -->
            <div class="focus-surface" style="padding: 1.5rem; margin-bottom: 2rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap;">
                    <div>
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                            <span class="badge badge-developing">Recommended Focus</span>
                            <span style="font-size: 0.8125rem; font-weight: 600; color: var(--text-main);">${topicCapitalized}</span>
                        </div>
                        <p style="font-size: 0.875rem; color: var(--text-muted); margin: 0;">
                            3 challenges queued to solidify your understanding of ${topicCapitalized}.
                        </p>
                    </div>

                    <button type="button" class="btn btn-primary" id="launch-interactive-game-btn">
                        <i class="fa-solid fa-gamepad"></i> Launch Game Arena
                    </button>
                </div>
            </div>

            <!-- Challenge Cards List -->
            <div style="display: flex; flex-direction: column; gap: 1rem;">
                ${challenges.map((c) => `
                    <div style="background: #FFFFFF; border: 1px solid var(--border-main); border-radius: var(--radius-md); padding: 1.25rem 1.5rem; display: flex; justify-content: space-between; align-items: center; gap: 1.5rem;">
                        <div>
                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.35rem;">
                                <span class="badge ${c.statusClass}">Level ${c.level}</span>
                                <span style="font-size: 0.9375rem; font-weight: 700; color: var(--text-main);">${c.title}</span>
                            </div>
                            <div style="font-size: 0.8125rem; color: var(--text-muted);">${c.desc}</div>
                        </div>

                        <div style="display: flex; align-items: center; gap: 1rem; flex-shrink: 0;">
                            <span class="badge badge-neutral" style="font-family: var(--font-mono);">${c.xp}</span>
                            <button type="button" class="btn btn-secondary btn-sm play-challenge-btn" data-level="${c.level}">
                                Play Level ${c.level}
                            </button>
                        </div>
                    </div>
                `).join("")}
            </div>

        </div>
    `;

    container.querySelector("#launch-interactive-game-btn")?.addEventListener("click", () => {
        sessionStorage.setItem("cq_lessons_completed_for_concept", "true");
        if (onNavigate) onNavigate("/student/games");
    });

    container.querySelectorAll(".play-challenge-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            sessionStorage.setItem("cq_lessons_completed_for_concept", "true");
            if (onNavigate) onNavigate("/student/games");
        });
    });
}
