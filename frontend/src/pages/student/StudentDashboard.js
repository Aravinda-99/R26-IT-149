/**
 * StudentDashboard Component — CodeQuest Student LMS Portal
 * ==========================================================
 * Real educational learning dashboard:
 * 1. Welcome & Streak Banner
 * 2. Learning Progress Metrics (XP, Completed Modules, Diagnostic Score)
 * 3. Topic Learning Roadmap (Variables, Operators, Loops, Arrays, Methods)
 * 4. Continue Learning Card
 * 5. Diagnostic Pre-Test & Error Analysis Status
 * 6. Post-Test Eligibility Card (Active only when eligible)
 * 7. Dev-Only Card: "Component 4 ML Test Mode" for rapid PP2 evaluation
 */

import { getCurrentUser } from "../../utils/auth.js";
import { GameManager } from "../../game/GameManager.js";

const CONCEPTS_ROADMAP = [
    { id: "variables", name: "Variables & Data Types", icon: "fa-cube", status: "completed", score: 88, desc: "Primitive types, memory layout, variable scopes" },
    { id: "operators", name: "Operators & Expressions", icon: "fa-calculator", status: "completed", score: 82, desc: "Arithmetic, compound assignments, logical XOR, bit shifts" },
    { id: "loops", name: "Loops & Iteration", icon: "fa-rotate-right", status: "in_progress", score: 45, desc: "For loops, while loops, termination conditions, nested loops" },
    { id: "arrays", name: "Arrays & Collections", icon: "fa-table-cells", status: "locked", score: 0, desc: "Array boundaries, indexing, aliasing, references" },
    { id: "methods", name: "Methods & Signatures", icon: "fa-code-branch", status: "locked", score: 0, desc: "Method overloading, parameters, return types, recursion" },
];

export function renderStudentDashboard(container, onNavigate) {
    const user = getCurrentUser();
    const studentName = user?.displayName || "Student";
    const totalXp = GameManager.getXP?.() || 340;
    const streakDays = 4;

    container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 2rem;">
            
            <!-- 1. Welcome & Motivation Banner -->
            <div style="background: linear-gradient(135deg, #1E40AF 0%, #2563EB 100%); border-radius: var(--radius-xl); padding: 2.25rem; color: #FFFFFF; display: flex; justify-content: space-between; align-items: center; box-shadow: var(--shadow-md); flex-wrap: wrap; gap: 1.5rem;">
                <div>
                    <div style="display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(255, 255, 255, 0.15); padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem;">
                        <i class="fa-solid fa-fire" style="color: #FBBF24;"></i> ${streakDays}-Day Learning Streak
                    </div>
                    <h1 style="font-size: 1.875rem; font-weight: 800; color: #FFFFFF; margin-bottom: 0.5rem; letter-spacing: -0.02em;">
                        Welcome back, ${studentName}!
                    </h1>
                    <p style="color: #DBEAFE; font-size: 0.95rem; max-width: 600px; line-height: 1.6;">
                        You're currently working on <strong>Loops & Iteration</strong>. Complete the diagnostic review and remedial game lesson to unlock the Schema Mastery validation test.
                    </p>
                </div>

                <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                    <button class="btn" id="dash-continue-btn" style="background: #FFFFFF; color: #1E40AF !important; font-weight: 700; padding: 0.75rem 1.5rem; border-radius: var(--radius-md); box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <i class="fa-solid fa-play"></i> Continue Learning
                    </button>
                </div>
            </div>

            <!-- 2. Learning Summary Metrics Grid -->
            <div class="stat-card-grid">
                <div class="stat-card">
                    <div class="stat-card-label">Total Experience</div>
                    <div class="stat-card-val" style="color: #2563EB;">${totalXp} XP</div>
                    <div class="stat-card-desc">
                        <i class="fa-solid fa-arrow-trend-up" style="color: #16A34A;"></i> Level 3 Developer
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-card-label">Modules Mastered</div>
                    <div class="stat-card-val" style="color: #16A34A;">2 / 5</div>
                    <div class="stat-card-desc">
                        <i class="fa-solid fa-check" style="color: #16A34A;"></i> Variables & Operators done
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-card-label">Active Focus Concept</div>
                    <div class="stat-card-val" style="color: #F59E0B; font-size: 1.5rem;">Loops</div>
                    <div class="stat-card-desc">
                        <i class="fa-solid fa-triangle-exclamation" style="color: #DC2626;"></i> Loop condition error pattern
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-card-label">Overall Schema Health</div>
                    <div class="stat-card-val" style="color: #0284C7; font-size: 1.5rem;">Developing</div>
                    <div class="stat-card-desc">
                        <i class="fa-solid fa-chart-line" style="color: #0284C7;"></i> Ready for post-test validation
                    </div>
                </div>
            </div>

            <!-- 3. Learning Path Roadmap -->
            <div class="card">
                <div class="card-header">
                    <div class="card-title">
                        <i class="fa-solid fa-map-location-dot" style="color: #2563EB;"></i> Java Schema Mastery Roadmap
                    </div>
                    <span style="font-size: 0.8125rem; font-weight: 600; color: #64748B;">
                        Progress: 40% Completed
                    </span>
                </div>

                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    ${CONCEPTS_ROADMAP.map((c, i) => `
                        <div style="display: flex; align-items: center; justify-content: space-between; padding: 1.1rem 1.25rem; background: ${c.status === 'in_progress' ? '#EFF6FF' : '#F8FAFC'}; border: 1px solid ${c.status === 'in_progress' ? '#BFDBFE' : '#E2E8F0'}; border-radius: var(--radius-md); flex-wrap: wrap; gap: 1rem;">
                            <div style="display: flex; align-items: center; gap: 1rem;">
                                <div style="width: 44px; height: 44px; border-radius: 10px; background: ${c.status === 'completed' ? '#DCFCE7' : c.status === 'in_progress' ? '#DBEAFE' : '#F1F5F9'}; color: ${c.status === 'completed' ? '#16A34A' : c.status === 'in_progress' ? '#2563EB' : '#94A3B8'}; display: flex; align-items: center; justify-content: center; font-size: 1.15rem;">
                                    <i class="fa-solid ${c.icon}"></i>
                                </div>
                                <div>
                                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                                        <strong style="font-size: 0.95rem; color: #0F172A;">${i + 1}. ${c.name}</strong>
                                        ${c.status === 'completed' ? '<span class="badge badge-success">Mastered</span>' : c.status === 'in_progress' ? '<span class="badge badge-primary">Active Learning</span>' : '<span class="badge badge-muted">Locked</span>'}
                                    </div>
                                    <p style="font-size: 0.8125rem; color: #64748B; margin-top: 0.2rem;">${c.desc}</p>
                                </div>
                            </div>

                            <div style="display: flex; align-items: center; gap: 1rem;">
                                ${c.status === 'completed' ? `
                                    <span style="font-size: 0.875rem; font-weight: 700; color: #16A34A;"><i class="fa-solid fa-circle-check"></i> ${c.score}% Score</span>
                                    <button class="btn btn-secondary btn-sm" onclick="window.navigateTo('/student/games')">Review</button>
                                ` : c.status === 'in_progress' ? `
                                    <button class="btn btn-primary btn-sm" onclick="window.navigateTo('/student/games')">Resume Module</button>
                                ` : `
                                    <span style="font-size: 0.8125rem; color: #94A3B8;"><i class="fa-solid fa-lock"></i> Prerequisite needed</span>
                                `}
                            </div>
                        </div>
                    `).join("")}
                </div>
            </div>

            <!-- 4. Quick Action Cards (Pre-Test, Games, Errors) -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem;">
                <!-- Diagnostic Quiz Card -->
                <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <div style="width: 40px; height: 40px; border-radius: 8px; background: #DBEAFE; color: #2563EB; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; margin-bottom: 1rem;">
                            <i class="fa-solid fa-clipboard-list"></i>
                        </div>
                        <h3 style="font-size: 1.15rem; margin-bottom: 0.35rem;">Diagnostic Pre-Test</h3>
                        <p style="font-size: 0.875rem; color: #64748B; margin-bottom: 1.25rem;">
                            Diagnose baseline conceptual understanding and identify specific Java error patterns.
                        </p>
                    </div>
                    <button class="btn btn-secondary" id="dash-pretest-btn" style="width: 100%;">
                        Open Diagnostic Quiz <i class="fa-solid fa-arrow-right" style="margin-left: 0.35rem;"></i>
                    </button>
                </div>

                <!-- Game Lessons Card -->
                <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <div style="width: 40px; height: 40px; border-radius: 8px; background: #DCFCE7; color: #16A34A; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; margin-bottom: 1rem;">
                            <i class="fa-solid fa-gamepad"></i>
                        </div>
                        <h3 style="font-size: 1.15rem; margin-bottom: 0.35rem;">Gamified Remedial Lessons</h3>
                        <p style="font-size: 0.875rem; color: #64748B; margin-bottom: 1.25rem;">
                            Interactive Phaser challenges designed to correct misconceptions in loop conditions and variable scoping.
                        </p>
                    </div>
                    <button class="btn btn-secondary" id="dash-games-btn" style="width: 100%;">
                        Launch Game Lessons <i class="fa-solid fa-arrow-right" style="margin-left: 0.35rem;"></i>
                    </button>
                </div>

                <!-- Error Analysis Card -->
                <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <div style="width: 40px; height: 40px; border-radius: 8px; background: #FEF3C7; color: #D97706; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; margin-bottom: 1rem;">
                            <i class="fa-solid fa-magnifying-glass-chart"></i>
                        </div>
                        <h3 style="font-size: 1.15rem; margin-bottom: 0.35rem;">Error Pattern Diagnostics</h3>
                        <p style="font-size: 0.875rem; color: #64748B; margin-bottom: 1.25rem;">
                            Deep semantic analysis of your coding errors (LOOP_CONDITION_ERROR, TYPE_MISMATCH).
                        </p>
                    </div>
                    <button class="btn btn-secondary" id="dash-errors-btn" style="width: 100%;">
                        View Error Breakdown <i class="fa-solid fa-arrow-right" style="margin-left: 0.35rem;"></i>
                    </button>
                </div>
            </div>

            <!-- 5. Component 4 Dev-Only Test Card (Explicit Requirement for PP2 Demonstration) -->
            <div class="card" style="border: 2px dashed #93C5FD; background: #F0F9FF; padding: 1.75rem;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
                    <div>
                        <div style="display: inline-flex; align-items: center; gap: 0.4rem; background: #DBEAFE; color: #1E40AF; padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.5rem;">
                            <i class="fa-solid fa-flask"></i> Component 4 ML Test Mode (Evaluation Shortcut)
                        </div>
                        <h3 style="font-size: 1.2rem; font-weight: 800; color: #0C4A6E; margin-bottom: 0.35rem;">
                            Validate Schema Mastery for "Loops" (15 Approved Questions)
                        </h3>
                        <p style="font-size: 0.875rem; color: #0369A1; max-width: 700px; line-height: 1.5;">
                            Directly launch Component 4 post-test with simulated upstream context (Pre-Test: 45%, Error: LOOP_CONDITION_ERROR).
                            The 15 questions are pulled from the <strong>Approved Question Bank</strong> with shuffled options, and the final decision is evaluated by the trained <code>schema_mastery_pipeline.pkl</code> ML model.
                        </p>
                        
                        <div style="display: flex; gap: 1.5rem; margin-top: 1rem; font-size: 0.8125rem; color: #0284C7; font-weight: 600; flex-wrap: wrap;">
                            <span>• Student: S001</span>
                            <span>• Concept: Loops</span>
                            <span>• Pre-test: 45%</span>
                            <span>• Error Type: LOOP_CONDITION_ERROR</span>
                            <span>• Attempt: #3</span>
                        </div>
                    </div>

                    <button class="btn btn-primary" id="start-mock-posttest-btn" style="padding: 0.75rem 1.5rem; font-weight: 700; background: #0284C7; border-color: #0284C7;">
                        <i class="fa-solid fa-play"></i> Start Mock Post-Test
                    </button>
                </div>
            </div>

        </div>
    `;

    document.getElementById("dash-continue-btn")?.addEventListener("click", () => {
        if (onNavigate) onNavigate("/student/games");
    });
    document.getElementById("dash-pretest-btn")?.addEventListener("click", () => {
        if (onNavigate) onNavigate("/student/pre-test");
    });
    document.getElementById("dash-games-btn")?.addEventListener("click", () => {
        if (onNavigate) onNavigate("/student/games");
    });
    document.getElementById("dash-errors-btn")?.addEventListener("click", () => {
        if (onNavigate) onNavigate("/student/errors");
    });

    document.getElementById("start-mock-posttest-btn")?.addEventListener("click", () => {
        if (onNavigate) {
            onNavigate("/student/post-test/start", {
                studentId: "S001",
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
