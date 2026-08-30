/**
 * Focus Area & Recommended Practice Page — CodeQuest Student LMS
 * =============================================================
 * Displays the student's identified weak concept/topic in beginner-friendly terms,
 * recommends targeted game-based practice modules, and guides them towards
 * completing the practice before attempting the Understanding Check.
 */

import { animatePageEntrance, animateStaggerCards } from "../../utils/animations.js";

export function renderFocusArea(container, onNavigate) {
    // 1. Retrieve pre-test analysis / focus area data from storage
    let focusConcept = "Loops";
    let preTestScore = null;
    let preTestDetails = null;

    try {
        const storedPretest = sessionStorage.getItem("codequest_pretest_result") || localStorage.getItem("codequest_pretest_result");
        if (storedPretest) {
            const parsed = JSON.parse(storedPretest);
            if (parsed.weak_concept || parsed.focus_concept || parsed.concept) {
                focusConcept = parsed.weak_concept || parsed.focus_concept || parsed.concept;
            }
            if (parsed.score !== undefined) {
                preTestScore = parsed.score;
            }
            preTestDetails = parsed;
        } else {
            const storedFocus = sessionStorage.getItem("cq_focus_concept") || localStorage.getItem("cq_focus_concept");
            if (storedFocus) focusConcept = storedFocus;
        }
    } catch (e) {
        console.warn("[FocusArea] Storage read:", e);
    }

    // Mapping concepts to student-friendly learning modules & game activities
    const conceptProfiles = {
        "Variables": {
            title: "Variables & Data Types",
            icon: "📦",
            color: "var(--primary)",
            summary: "Master data types, variable declarations, memory assignment, and value casting in Java.",
            activities: [
                { id: "integer", title: "Number Line Adventure", desc: "Understand integer bounds, declaration, and arithmetic.", badge: "🏆 Integer Explorer", module: "integer" },
                { id: "float", title: "Decimal Precision Dive", desc: "Work with double precision and floating-point logic.", badge: "🌊 Float Explorer", module: "float" },
                { id: "char", title: "Character Workshop", desc: "Learn ASCII encoding and single-character manipulation.", badge: "🌌 Char Explorer", module: "char" },
            ]
        },
        "Operators": {
            title: "Operators & Expressions",
            icon: "⚡",
            color: "#ff6b6b",
            summary: "Understand operator precedence, arithmetic calculations, relational checks, and logical conditions.",
            activities: [
                { id: "operators", title: "Math Magic Academy", desc: "Arithmetic expressions, compound assignments, and logical combinations.", badge: "🧙 Math Wizard", module: "operators" },
            ]
        },
        "Loops": {
            title: "Loops & Iteration",
            icon: "🔄",
            color: "#14b8a6",
            summary: "Build clear mental models for loop counters, iteration bounds, terminating conditions, and off-by-one prevention.",
            activities: [
                { id: "loops", title: "Loop Train Express", desc: "Configure for-loops and navigate iteration boundaries.", badge: "🔄 Loop Engineer", module: "loops" },
                { id: "whileloops", title: "Power Core Charger", desc: "Master condition-driven while-loops and avoid infinite execution.", badge: "⚙️ While Schema", module: "whileloops" },
            ]
        },
        "Arrays": {
            title: "Arrays & Indexing",
            icon: "📊",
            color: "#06b6d4",
            summary: "Learn zero-based indexing, array boundaries, traversal patterns, and element modification.",
            activities: [
                { id: "arrays", title: "Memory Vault & Index Interceptor", desc: "Navigate array memory, bounds safety, and traversal.", badge: "🗃️ Array Schema", module: "arrays" },
            ]
        },
        "Methods": {
            title: "Built-in Methods & Functions",
            icon: "🔧",
            color: "#f59e0b",
            summary: "Understand method calling syntax, parameter passing, return values, and standard library methods.",
            activities: [
                { id: "stringmethods", title: "String Methods Wing", desc: "Practice length(), charAt(), and case transformations.", badge: "🔍 String Mastery", module: "stringmethods" },
                { id: "scannermethods", title: "Scanner Input Wing", desc: "Master standard input parsing and data stream tokens.", badge: "🏅 Scanner Mastery", module: "scannermethods" },
            ]
        }
    };

    const profile = conceptProfiles[focusConcept] || conceptProfiles["Loops"];

    container.innerHTML = `
        <div style="max-width: 960px; margin: 0 auto; display: flex; flex-direction: column; gap: 2rem;">
            
            <!-- Breadcrumbs -->
            <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; color: var(--text-muted);">
                <a href="/student/dashboard" class="breadcrumb-link" style="color: var(--text-muted); text-decoration: none;">Dashboard</a>
                <i class="fa-solid fa-chevron-right" style="font-size: 0.65rem;"></i>
                <span style="color: var(--text-main); font-weight: 600;">Focus Area & Recommended Practice</span>
            </div>

            <!-- Focus Area Banner Card -->
            <div class="card focus-hero-card" style="background: #FFFFFF; border: 1px solid var(--border-main); border-radius: var(--radius-lg); padding: 2rem; box-shadow: var(--shadow-sm);">
                <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 1.5rem; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 280px;">
                        <div style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.3rem 0.75rem; background: var(--primary-soft); color: var(--primary); border-radius: 999px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem;">
                            <span>🎯</span> Recommended Learning Focus
                        </div>
                        <h1 style="font-size: 1.75rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.5rem; line-height: 1.25;">
                            Focus Area: ${profile.title}
                        </h1>
                        <p style="font-size: 0.9375rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 1.25rem;">
                            ${profile.summary}
                        </p>

                        <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
                            <button class="btn btn-primary" id="start-practice-btn" style="padding: 0.65rem 1.5rem; font-weight: 700;">
                                <i class="fa-solid fa-gamepad" style="margin-right: 0.4rem;"></i> Start Practice Lesson
                            </button>
                            <button class="btn btn-secondary" id="go-posttest-btn" style="padding: 0.65rem 1.25rem;">
                                <i class="fa-solid fa-circle-check" style="margin-right: 0.4rem;"></i> Skip to Understanding Check
                            </button>
                        </div>
                    </div>

                    <div style="background: var(--bg-surface-subtle); border-radius: var(--radius-md); padding: 1.25rem 1.5rem; border: 1px solid var(--border-main); min-width: 220px; text-align: center;">
                        <div style="font-size: 2.5rem; margin-bottom: 0.25rem;">${profile.icon}</div>
                        <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Current Priority</div>
                        <div style="font-size: 1.1rem; font-weight: 800; color: var(--text-main); margin-top: 0.2rem;">${focusConcept}</div>
                        <div style="font-size: 0.75rem; color: var(--text-subtle); margin-top: 0.35rem;">Identified from Diagnostic Check</div>
                    </div>
                </div>
            </div>

            <!-- Recommended Practice Modules -->
            <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <div>
                        <h2 style="font-size: 1.25rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.25rem;">
                            Interactive Practice Modules
                        </h2>
                        <p style="font-size: 0.875rem; color: var(--text-muted);">
                            Complete these interactive challenges to build intuition and eliminate misconceptions.
                        </p>
                    </div>
                </div>

                <div class="practice-cards-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem;">
                    ${profile.activities.map((act) => `
                        <div class="card practice-activity-card" style="background: #FFFFFF; border: 1px solid var(--border-main); border-radius: var(--radius-md); padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between; gap: 1.25rem; box-shadow: var(--shadow-sm);">
                            <div>
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                                    <span class="badge badge-primary" style="font-size: 0.75rem;">Interactive Challenge</span>
                                    <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">${act.badge}</span>
                                </div>
                                <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.4rem;">
                                    ${act.title}
                                </h3>
                                <p style="font-size: 0.875rem; color: var(--text-muted); line-height: 1.5;">
                                    ${act.desc}
                                </p>
                            </div>

                            <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 1rem; border-top: 1px solid var(--border-subtle);">
                                <span style="font-size: 0.75rem; color: var(--text-subtle);"><i class="fa-solid fa-clock"></i> ~5 mins</span>
                                <button class="btn btn-primary btn-sm launch-act-btn" data-module="${act.module}">
                                    Launch <i class="fa-solid fa-play" style="margin-left: 0.3rem; font-size: 0.7rem;"></i>
                                </button>
                            </div>
                        </div>
                    `).join("")}
                </div>
            </div>

            <!-- Next Step Guidance Note -->
            <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: var(--radius-md); padding: 1.25rem 1.5rem; display: flex; align-items: center; gap: 1rem;">
                <div style="font-size: 1.5rem; color: #16A34A;">💡</div>
                <div style="flex: 1;">
                    <div style="font-size: 0.875rem; font-weight: 700; color: #166534; margin-bottom: 0.2rem;">
                        How the Learning Cycle Works
                    </div>
                    <div style="font-size: 0.8125rem; color: #15803D; line-height: 1.5;">
                        After completing the recommended game activity, you can proceed to the <strong>Understanding Check</strong> to validate your schema mastery and unlock your completion certificate.
                    </div>
                </div>
                <button class="btn btn-secondary btn-sm" id="footer-posttest-btn" style="white-space: nowrap; background: #FFFFFF;">
                    Start Understanding Check →
                </button>
            </div>

        </div>
    `;

    // Animations
    animatePageEntrance(container.querySelector(".focus-hero-card"));
    animateStaggerCards(".practice-activity-card", container);

    // Event Listeners
    document.querySelectorAll(".breadcrumb-link").forEach(l => {
        l.addEventListener("click", (e) => {
            e.preventDefault();
            if (onNavigate) onNavigate("/student/dashboard");
        });
    });

    document.getElementById("start-practice-btn")?.addEventListener("click", () => {
        if (onNavigate) onNavigate("/student/games");
    });

    document.getElementById("go-posttest-btn")?.addEventListener("click", () => {
        if (onNavigate) onNavigate("/student/post-test/start");
    });

    document.getElementById("footer-posttest-btn")?.addEventListener("click", () => {
        if (onNavigate) onNavigate("/student/post-test/start");
    });

    container.querySelectorAll(".launch-act-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const mod = btn.dataset.module;
            sessionStorage.setItem("codequest_menu_focus", mod);
            if (onNavigate) onNavigate("/student/games");
        });
    });
}
