/**
 * StudentDashboard Component — CodeQuest Real LMS Dashboard
 * =========================================================
 * Clean, modern LMS dashboard for beginner programming students:
 * 1. Welcome & Greeting Banner ("Hi, [Student Name] - Ready to continue learning Java?")
 * 2. Learning Progress Overview (Dynamic metrics & clean empty states)
 * 3. Java Learning Path (Variables, Operators, Loops, Arrays, Methods)
 * 4. Interactive Practice & Game Lessons
 * 5. Diagnostic Quiz & Practice Challenges
 * 6. Understanding Check (Component 4)
 * 7. Clearly Labelled Dev-Only Test Card (PP2 Evaluator)
 */

import { getCurrentUser } from "../../utils/auth.js";
import { GameManager } from "../../game/GameManager.js";
import { animatePageEntrance, animateStaggerCards } from "../../utils/animations.js";

const JAVA_MODULES = [
    { 
        id: "variables", 
        name: "Variables & Data Types", 
        icon: "fa-cube", 
        color: "#2563EB", 
        bg: "#EFF6FF",
        desc: "Primitive data types, declaring variables, assigning values, and memory layout.",
        status: "in_progress",
        gameSection: "integer"
    },
    { 
        id: "operators", 
        name: "Operators & Expressions", 
        icon: "fa-calculator", 
        color: "#0F766E", 
        bg: "#F0FDFA",
        desc: "Arithmetic operators, comparison, logical AND/OR, and compound assignments.",
        status: "up_next",
        gameSection: "operators"
    },
    { 
        id: "loops", 
        name: "Loops & Iteration", 
        icon: "fa-rotate-right", 
        color: "#D97706", 
        bg: "#FFFBEB",
        desc: "For loops, while loops, termination conditions, and loop counters.",
        status: "locked",
        gameSection: "integer"
    },
    { 
        id: "arrays", 
        name: "Arrays & Collections", 
        icon: "fa-table-cells", 
        color: "#7C3AED", 
        bg: "#FAF5FF",
        desc: "Array indexing, boundaries, element access, and traversing lists.",
        status: "locked",
        gameSection: "integer"
    },
    { 
        id: "methods", 
        name: "Methods & Functions", 
        icon: "fa-code-branch", 
        color: "#0284C7", 
        bg: "#F0F9FF",
        desc: "Defining methods, parameters, return values, and modular code design.",
        status: "locked",
        gameSection: "integer"
    },
];

export function renderStudentDashboard(container, onNavigate) {
    const user = getCurrentUser();
    const studentName = user?.displayName ? user.displayName.split(" ")[0] : "Student";
    
    // Retrieve dynamic progress state
    const state = GameManager?.getState?.() || {};
    const totalXp = state.xp || 0;
    const completedLevels = state.levelsCompleted ? state.levelsCompleted.filter(Boolean).length : 0;

    container.innerHTML = `
        <div class="student-dashboard-wrap" style="display: flex; flex-direction: column; gap: 2rem;">
            
            <!-- 1. Welcome Greeting Banner -->
            <div class="dash-welcome-card" style="background: linear-gradient(135deg, #1E40AF 0%, #2563EB 100%); border-radius: var(--radius-lg); padding: 2.25rem; color: #FFFFFF; display: flex; justify-content: space-between; align-items: center; box-shadow: var(--shadow-md); flex-wrap: wrap; gap: 1.5rem;">
                <div>
                    <div style="display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(255, 255, 255, 0.18); padding: 0.25rem 0.75rem; border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem;">
                        <i class="fa-solid fa-graduation-cap"></i> Student Learning Track
                    </div>
                    <h1 style="font-size: 1.875rem; font-weight: 800; color: #FFFFFF; margin-bottom: 0.4rem; letter-spacing: -0.02em;">
                        Welcome back, ${studentName}!
                    </h1>
                    <p style="color: #DBEAFE; font-size: 1rem; max-width: 560px; line-height: 1.5;">
                        Continue your Java programming curriculum. Practice interactive coding challenges and validate your conceptual understanding.
                    </p>
                </div>

                <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                    <button class="btn" id="dash-resume-btn" style="background: #FFFFFF; color: #1E40AF !important; font-weight: 700; padding: 0.75rem 1.5rem; border-radius: var(--radius-sm); box-shadow: var(--shadow-sm);">
                        <i class="fa-solid fa-play"></i> Resume Practice
                    </button>
                    <button class="btn btn-outline" id="dash-modules-btn" style="border-color: rgba(255,255,255,0.4); color: #FFFFFF !important; font-weight: 600; padding: 0.75rem 1.25rem; border-radius: var(--radius-sm);">
                        View Syllabus
                    </button>
                </div>
            </div>

            <!-- 2. Learning Summary Overview -->
            <div class="dash-stat-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem;">
                
                <div class="dash-stat-card card" style="padding: 1.25rem; border-radius: var(--radius-md);">
                    <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em;">Total Practice XP</div>
                    <div style="font-size: 1.75rem; font-weight: 800; color: var(--primary); margin: 0.25rem 0;">${totalXp} XP</div>
                    <div style="font-size: 0.8125rem; color: var(--status-success); font-weight: 600;">
                        <i class="fa-solid fa-arrow-trend-up"></i> ${completedLevels > 0 ? `${completedLevels} activities completed` : "Ready for first lesson"}
                    </div>
                </div>

                <div class="dash-stat-card card" style="padding: 1.25rem; border-radius: var(--radius-md);">
                    <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em;">Current Module</div>
                    <div style="font-size: 1.4rem; font-weight: 800; color: var(--text-main); margin: 0.25rem 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Variables & Types</div>
                    <div style="font-size: 0.8125rem; color: var(--text-muted);">
                        Foundational Topic
                    </div>
                </div>

                <div class="dash-stat-card card" style="padding: 1.25rem; border-radius: var(--radius-md);">
                    <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em;">Practice Status</div>
                    <div style="font-size: 1.2rem; font-weight: 800; color: var(--secondary); margin: 0.25rem 0;">Interactive Puzzles</div>
                    <div style="font-size: 0.8125rem; color: var(--text-muted);">
                        Hands-on coding exercises
                    </div>
                </div>

                <div class="dash-stat-card card" style="padding: 1.25rem; border-radius: var(--radius-md);">
                    <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em;">Understanding Check</div>
                    <div style="font-size: 1.2rem; font-weight: 800; color: var(--accent); margin: 0.25rem 0;">Available After Practice</div>
                    <div style="font-size: 0.8125rem; color: var(--text-muted);">
                        15-question post-test
                    </div>
                </div>

            </div>

            <!-- 3. Java Learning Path (Course Modules) -->
            <div class="card" style="padding: 1.75rem; border-radius: var(--radius-md);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.5rem;">
                    <div>
                        <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.2rem;">
                            <i class="fa-solid fa-map-location-dot" style="color: var(--primary); margin-right: 0.4rem;"></i> Java Programming Curriculum
                        </h2>
                        <p style="font-size: 0.875rem; color: var(--text-muted);">Step-by-step programming track for beginner students.</p>
                    </div>
                    <button class="btn btn-secondary btn-sm" id="dash-view-all-modules-btn">
                        View All Modules <i class="fa-solid fa-arrow-right" style="margin-left: 0.3rem;"></i>
                    </button>
                </div>

                <div style="display: flex; flex-direction: column; gap: 0.85rem;">
                    ${JAVA_MODULES.map((m, idx) => `
                        <div class="dash-module-card" style="display: flex; align-items: center; justify-content: space-between; padding: 1.15rem 1.25rem; background: ${m.status === 'in_progress' ? 'var(--primary-soft)' : 'var(--bg-surface)'}; border: 1px solid ${m.status === 'in_progress' ? 'var(--border-focus)' : 'var(--border-main)'}; border-radius: var(--radius-sm); flex-wrap: wrap; gap: 1rem; transition: all var(--transition-fast);">
                            
                            <div style="display: flex; align-items: center; gap: 1rem;">
                                <div style="width: 44px; height: 44px; border-radius: var(--radius-sm); background: ${m.bg}; color: ${m.color}; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0;">
                                    <i class="fa-solid ${m.icon}"></i>
                                </div>
                                <div>
                                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                                        <strong style="font-size: 0.95rem; color: var(--text-main);">${idx + 1}. ${m.name}</strong>
                                        ${m.status === 'in_progress' ? '<span class="badge badge-primary">In Progress</span>' : m.status === 'up_next' ? '<span class="badge badge-warning">Up Next</span>' : '<span class="badge badge-neutral">Locked</span>'}
                                    </div>
                                    <p style="font-size: 0.8125rem; color: var(--text-muted); margin-top: 0.2rem;">${m.desc}</p>
                                </div>
                            </div>

                            <div>
                                ${m.status === 'in_progress' ? `
                                    <button class="btn btn-primary btn-sm dash-module-action-btn" data-section="${m.gameSection}">
                                        Start Practice <i class="fa-solid fa-arrow-right" style="margin-left: 0.3rem;"></i>
                                    </button>
                                ` : m.status === 'up_next' ? `
                                    <button class="btn btn-secondary btn-sm dash-module-action-btn" data-section="${m.gameSection}">
                                        Preview <i class="fa-solid fa-arrow-right" style="margin-left: 0.3rem;"></i>
                                    </button>
                                ` : `
                                    <span style="font-size: 0.8125rem; color: var(--text-muted); display: inline-flex; align-items: center; gap: 0.35rem;">
                                        <i class="fa-solid fa-lock"></i> Prerequisite needed
                                    </span>
                                `}
                            </div>

                        </div>
                    `).join("")}
                </div>
            </div>

            <!-- 4. Quick Action Cards: Practice Challenges & Diagnostic Quiz -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem;">
                
                <!-- Practice Challenges Card -->
                <div class="card" style="padding: 1.75rem; border-radius: var(--radius-md); display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <div style="width: 44px; height: 44px; border-radius: var(--radius-sm); background: var(--status-success-bg); color: var(--status-success); display: flex; align-items: center; justify-content: center; font-size: 1.25rem; margin-bottom: 1rem;">
                            <i class="fa-solid fa-gamepad"></i>
                        </div>
                        <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.35rem;">Interactive Practice Challenges</h3>
                        <p style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 1.5rem; line-height: 1.5;">
                            Solve engaging coding puzzles and challenges that reinforce concepts like variable assignments, conditions, and operations.
                        </p>
                    </div>
                    <button class="btn btn-secondary" id="dash-games-btn" style="width: 100%; font-weight: 600;">
                        Open Practice Challenges <i class="fa-solid fa-arrow-right" style="margin-left: 0.35rem;"></i>
                    </button>
                </div>

                <!-- Diagnostic Quiz Card -->
                <div class="card" style="padding: 1.75rem; border-radius: var(--radius-md); display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <div style="width: 44px; height: 44px; border-radius: var(--radius-sm); background: var(--primary-soft); color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 1.25rem; margin-bottom: 1rem;">
                            <i class="fa-solid fa-clipboard-list"></i>
                        </div>
                        <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.35rem;">Diagnostic Pre-Quiz</h3>
                        <p style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 1.5rem; line-height: 1.5;">
                            Take a focused diagnostic quiz to evaluate your baseline conceptual understanding before advancing.
                        </p>
                    </div>
                    <button class="btn btn-secondary" id="dash-pretest-btn" style="width: 100%; font-weight: 600;">
                        Open Diagnostic Quiz <i class="fa-solid fa-arrow-right" style="margin-left: 0.35rem;"></i>
                    </button>
                </div>

            </div>

            <!-- 5. Dev-Only Demonstration Card (Component 4 Quick Evaluator) -->
            <div class="card" style="border: 2px dashed #93C5FD; background: #F0F9FF; padding: 1.5rem; border-radius: var(--radius-md);">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                    <div>
                        <div style="display: inline-flex; align-items: center; gap: 0.4rem; background: var(--primary-soft); color: var(--primary); padding: 0.2rem 0.6rem; border-radius: var(--radius-xs); font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.35rem;">
                            <i class="fa-solid fa-flask"></i> Evaluation Shortcut (Dev Mode)
                        </div>
                        <h3 style="font-size: 1.1rem; font-weight: 800; color: #0C4A6E; margin-bottom: 0.25rem;">
                            Test Understanding Check Flow (Loops)
                        </h3>
                        <p style="font-size: 0.8125rem; color: #0369A1; max-width: 650px;">
                            Launch the 15-question post-test check directly to evaluate student understanding and generate personalized next steps.
                        </p>
                    </div>

                    <button class="btn btn-primary btn-sm" id="start-dev-posttest-btn" style="padding: 0.6rem 1.25rem; font-weight: 700; background: #0284C7; border-color: #0284C7;">
                        <i class="fa-solid fa-play"></i> Test Understanding Check
                    </button>
                </div>
            </div>

        </div>
    `;

    // Apply GSAP animations
    animatePageEntrance(container.querySelector(".dash-welcome-card"));
    animateStaggerCards(".dash-stat-card", container);
    animateStaggerCards(".dash-module-card", container);

    // Event handlers
    document.getElementById("dash-resume-btn")?.addEventListener("click", () => {
        if (onNavigate) onNavigate("/student/games");
    });

    document.getElementById("dash-modules-btn")?.addEventListener("click", () => {
        if (onNavigate) onNavigate("/student/modules");
    });

    document.getElementById("dash-view-all-modules-btn")?.addEventListener("click", () => {
        if (onNavigate) onNavigate("/student/modules");
    });

    document.getElementById("dash-games-btn")?.addEventListener("click", () => {
        if (onNavigate) onNavigate("/student/games");
    });

    document.getElementById("dash-pretest-btn")?.addEventListener("click", () => {
        if (onNavigate) onNavigate("/student/pre-test");
    });

    container.querySelectorAll(".dash-module-action-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            if (onNavigate) onNavigate("/student/games");
        });
    });

    document.getElementById("start-dev-posttest-btn")?.addEventListener("click", () => {
        if (onNavigate) {
            onNavigate("/student/post-test/start", {
                studentId: user?.uid || "S001",
                concept: "Loops",
                pre_test_score: 0.45,
                attempt_count: 3,
                time_taken_seconds: 360,
                error_type: "LOOP_CONDITION_ERROR",
                error_pattern_score: 0.40,
            });
        }
    });
}
