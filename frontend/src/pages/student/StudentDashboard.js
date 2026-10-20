/**
 * Student Learning Hub
 * ====================
 * Dedicated student learning workspace and progression dashboard.
 * Features:
 *   1. Page Header: "My Learning Hub" + Welcome message
 *   2. 5-Step Learning Progression Stepper
 *   3. Contextual Next Action Card (State-Driven)
 *   4. Core Java Modules Grid (Compact Cards) with "Launch in New Tab"
 *   5. Recommended Game Lesson Card
 *   6. Right Column: Learning Tasks & Schedule Widgets
 * (Does NOT contain the large marketing/hero banner).
 */

import { getCurrentUser } from "../../utils/auth.js";
import { ErrorAPI, SchemaMasteryAPI } from "../../api/api.js";

const MODULES = [
    { id: "variables", name: "Variables & Types", icon: "fa-box", desc: "Declarations, primitive types, and state scope", lessons: 4, level: "Beginner", color: "#3B82F6", moduleKey: "integer" },
    { id: "operators", name: "Operators & Logic", icon: "fa-calculator", desc: "Arithmetic, relational, and boolean precedence", lessons: 3, level: "Beginner", color: "#10B981", moduleKey: "operators" },
    { id: "loops", name: "Loops & Iteration", icon: "fa-rotate", desc: "For, while, loop boundaries, and step bounds", lessons: 5, level: "Intermediate", color: "#F59E0B", moduleKey: "loops" },
    { id: "arrays", name: "Arrays & Indices", icon: "fa-table-cells", desc: "0-indexed arrays, memory bounds, and traversal", lessons: 4, level: "Intermediate", color: "#8B5CF6", moduleKey: "arrays" },
    { id: "methods", name: "Methods & Calls", icon: "fa-code", desc: "Signatures, return contracts, and parameter passing", lessons: 4, level: "Intermediate", color: "#EC4899", moduleKey: "stringmethods" },
];

export async function renderStudentDashboard(container) {
    const user = getCurrentUser();
    const studentName = user?.displayName || user?.name || user?.email?.split("@")[0] || "Learner";
    const studentId = user?.uid || user?.id;

    // Load real local student progress or initialize empty state
    const studentProgress = getLocalProgress(studentId);

    // Sync with persistent backend Learning Session
    if (studentId) {
        try {
            const ctxRes = await SchemaMasteryAPI.getCurrentContext(studentId);
            if (ctxRes && ctxRes.component_1?.completed) {
                studentProgress.preTestCompleted = true;
                studentProgress.targetConcept = ctxRes.component_1.concept_name || ctxRes.component_1.weak_concept;
                if (ctxRes.component_4?.post_test_completed) {
                    studentProgress.currentStep = 5;
                } else if (ctxRes.component_3?.completed) {
                    studentProgress.currentStep = 4;
                } else if (ctxRes.component_2?.completed) {
                    studentProgress.currentStep = 3;
                } else {
                    studentProgress.currentStep = 2;
                }
            }
        } catch (e) { }
    }

    container.innerHTML = `
        <div class="learning-hub-page" style="display: flex; flex-direction: column; gap: 1.75rem; width: 100%; max-width: 1200px; margin: 0 auto;">
            
            <!-- Page Header -->
            <div class="hub-header-row" style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 1.5rem 1.75rem; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                <div>
                    <div style="display: inline-flex; align-items: center; gap: 0.4rem; background: #EFF6FF; color: #2563EB; font-weight: 700; font-size: 0.72rem; padding: 0.2rem 0.6rem; border-radius: 9999px; margin-bottom: 0.4rem;">
                        <i class="fa-solid fa-graduation-cap"></i> Student Learning Workspace
                    </div>
                    <h1 style="font-size: 1.6rem; font-weight: 800; color: #0F172A; margin: 0 0 0.25rem 0; letter-spacing: -0.3px;">My Learning Hub</h1>
                    <p style="font-size: 0.9rem; color: #64748B; margin: 0;">Welcome back, <strong>${studentName}</strong>. Continue your personalized Java learning journey.</p>
                </div>
                <div style="display: flex; gap: 0.6rem;">
                    <a href="#/student/pre-test" class="btn btn-primary" style="padding: 0.55rem 1.25rem; font-size: 0.85rem; font-weight: 700; border-radius: 8px; background: #2563EB; color: #FFFFFF; text-decoration: none; display: inline-flex; align-items: center; gap: 0.4rem;">
                        <i class="fa-solid fa-play"></i> Start Pre-Test
                    </a>
                </div>
            </div>

            <!-- Workspace Grid: 2 Columns -->
            <div class="hub-workspace-grid">
                
                <!-- Left Primary Column -->
                <div class="hub-primary-col" style="display: flex; flex-direction: column; gap: 1.5rem; min-width: 0;">
                    
                    <!-- 5-Step Learning Progression Stepper -->
                    <div class="card" style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04); margin-bottom: 0;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <i class="fa-solid fa-route" style="color: #2563EB; font-size: 1.1rem;"></i>
                                <h3 style="font-size: 1.05rem; font-weight: 700; color: #0F172A; margin: 0;">Your Learning Progression</h3>
                            </div>
                            <span class="badge" style="background: #EFF6FF; color: #2563EB; font-weight: 700; font-size: 0.75rem; padding: 0.25rem 0.65rem; border-radius: 9999px;">Step ${studentProgress.currentStep || 1} of 5</span>
                        </div>
                        <div class="journey-stepper-wrap">
                            ${renderStepperHTML(studentProgress.currentStep || 1)}
                        </div>
                    </div>

                    <!-- Contextual Next Action Card (State-Driven) -->
                    <div class="card" id="dash-next-action" style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04); margin-bottom: 0;">
                        ${renderNextActionHTML(studentProgress)}
                    </div>

                    <!-- Core Learning Modules Section -->
                    <div class="dash-modules-section">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <i class="fa-solid fa-book-bookmark" style="color: #2563EB; font-size: 1.1rem;"></i>
                                <h3 style="font-size: 1.05rem; font-weight: 700; color: #0F172A; margin: 0;">Core Learning Modules</h3>
                            </div>
                            <span style="font-size: 0.8rem; color: #64748B;">5 Foundational Java Domains</span>
                        </div>

                        <div class="lms-modules-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                            ${MODULES.map(m => {
                                const isFocus = studentProgress.targetConcept && m.name.toLowerCase().includes(studentProgress.targetConcept.toLowerCase());
                                return `
                                    <div class="lms-module-card" style="background: #FFFFFF; border: 1px solid ${isFocus ? '#2563EB' : '#E2E8F0'}; border-radius: 12px; padding: 1.15rem; box-shadow: 0 1px 3px rgba(0,0,0,0.04); display: flex; flex-direction: column; justify-content: space-between;">
                                        <div>
                                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                                                <div style="width: 36px; height: 36px; border-radius: 8px; background: ${m.color}15; color: ${m.color}; display: flex; align-items: center; justify-content: center; font-size: 1rem;">
                                                    <i class="fa-solid ${m.icon}"></i>
                                                </div>
                                                <span class="badge" style="font-size: 0.7rem; font-weight: 600; padding: 0.15rem 0.5rem; border-radius: 9999px; background: #F1F5F9; color: #475569;">${m.level}</span>
                                            </div>
                                            <h4 style="font-size: 0.95rem; font-weight: 700; color: #0F172A; margin: 0 0 0.35rem 0;">${m.name}</h4>
                                            <p style="font-size: 0.78rem; color: #64748B; margin: 0 0 1rem 0; line-height: 1.4;">${m.desc}</p>
                                        </div>
                                        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 0.75rem; border-top: 1px solid #F1F5F9;">
                                            <span style="font-size: 0.75rem; color: #64748B;"><i class="fa-regular fa-file-code"></i> ${m.lessons} Lessons</span>
                                            <button class="btn btn-outline btn-sm launch-module-tab-btn" data-module="${m.moduleKey}" style="padding: 0.25rem 0.65rem; font-size: 0.75rem; font-weight: 600; border-radius: 6px; border: 1px solid #CBD5E1; color: #0F172A; background: #FFFFFF; cursor: pointer;">
                                                Launch ↗
                                            </button>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <!-- Recommended Game Lesson Card -->
                    <div class="card" style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04); margin-bottom: 0;">
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                            <i class="fa-solid fa-gamepad" style="color: #059669; font-size: 1.1rem;"></i>
                            <h3 style="font-size: 1.05rem; font-weight: 700; color: #0F172A; margin: 0;">Recommended Game Lesson</h3>
                        </div>
                        <div class="rec-practice-body">
                            ${studentProgress.targetConcept ? `
                                <div style="background: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 8px; padding: 0.85rem 1rem; margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between;">
                                    <div>
                                        <strong style="color: #065F46; font-size: 0.88rem;">Focus Concept:</strong> 
                                        <span style="color: #047857; font-weight: 700; font-size: 0.92rem; margin-left: 0.35rem;">${studentProgress.targetConcept}</span>
                                    </div>
                                    <span style="font-size: 0.72rem; font-weight: 700; background: #059669; color: #FFFFFF; padding: 0.2rem 0.55rem; border-radius: 9999px;">Diagnostic Pick</span>
                                </div>
                                <p style="font-size: 0.85rem; color: #64748B; line-height: 1.5; margin: 0 0 1.25rem 0;">
                                    ${studentProgress.recommendationText || "Targeted practice identified from your error feedback to reinforce your understanding and fix boundary bugs."}
                                </p>
                                <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                                    <a href="#/student/error-analysis" class="btn btn-outline" style="padding: 0.5rem 1rem; font-size: 0.84rem; font-weight: 600; border-radius: 8px; border: 1px solid #E2E8F0; background: #FFFFFF; color: #0F172A; text-decoration: none;">
                                        <i class="fa-solid fa-magnifying-glass-chart"></i> View Error Feedback
                                    </a>
                                    <button id="btn-launch-rec-tab" class="btn btn-primary" style="padding: 0.5rem 1.15rem; font-size: 0.84rem; font-weight: 700; border-radius: 8px; background: #059669; color: #FFFFFF; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 0.4rem;">
                                        <i class="fa-solid fa-gamepad"></i> Open Game in New Tab ↗
                                    </button>
                                </div>
                            ` : `
                                <div style="text-align: center; padding: 1.5rem; background: #F8FAFC; border: 1px dashed #CBD5E1; border-radius: 10px;">
                                    <p style="font-size: 0.85rem; color: #64748B; margin: 0 0 1rem 0;">Take the diagnostic Pre-Test to evaluate your conceptual understanding and unlock your custom game lesson.</p>
                                    <a href="#/student/pre-test" class="btn btn-primary btn-sm" style="padding: 0.45rem 1rem; font-size: 0.82rem; font-weight: 600; border-radius: 6px; background: #2563EB; color: #FFFFFF; text-decoration: none;">
                                        <i class="fa-solid fa-pen-to-square"></i> Take Diagnostic Pre-Test
                                    </a>
                                </div>
                            `}
                        </div>
                    </div>
                </div>

                <!-- Right Sidebar Column -->
                <div class="hub-secondary-col" style="display: flex; flex-direction: column; gap: 1.25rem;">
                    
                    <!-- Learning Schedule Widget -->
                    <div class="card" style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 1.25rem; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04); margin-bottom: 0;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem;">
                            <h4 style="font-size: 0.95rem; font-weight: 700; color: #0F172A; margin: 0;">Learning Schedule</h4>
                            <span style="font-size: 0.75rem; color: #64748B;">${new Date().toLocaleString('default', { month: 'short', year: 'numeric' })}</span>
                        </div>
                        <div class="mini-calendar-view">
                            ${renderMiniCalendarHTML()}
                        </div>
                    </div>

                    <!-- Upcoming Learning Tasks Widget -->
                    <div class="card" style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 1.25rem; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04); margin-bottom: 0;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem;">
                            <h4 style="font-size: 0.95rem; font-weight: 700; color: #0F172A; margin: 0;">Learning Tasks</h4>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 0.6rem;">
                            <a href="#/student/pre-test" style="display: flex; align-items: center; justify-content: space-between; padding: 0.6rem 0.75rem; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; text-decoration: none; color: inherit;">
                                <div style="display: flex; align-items: center; gap: 0.65rem;">
                                    <div style="width: 30px; height: 30px; border-radius: 6px; background: #EFF6FF; color: #2563EB; display: flex; align-items: center; justify-content: center; font-size: 0.85rem;">
                                        <i class="fa-solid fa-clipboard-list"></i>
                                    </div>
                                    <div>
                                        <strong style="font-size: 0.82rem; color: #0F172A; display: block;">Pre-Test Diagnostic</strong>
                                        <span style="font-size: 0.72rem; color: #64748B;">Java Core Concepts</span>
                                    </div>
                                </div>
                                <i class="fa-solid fa-chevron-right" style="font-size: 0.75rem; color: #94A3B8;"></i>
                            </a>

                            <a href="#/student/error-analysis" style="display: flex; align-items: center; justify-content: space-between; padding: 0.6rem 0.75rem; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; text-decoration: none; color: inherit;">
                                <div style="display: flex; align-items: center; gap: 0.65rem;">
                                    <div style="width: 30px; height: 30px; border-radius: 6px; background: #FEF3C7; color: #D97706; display: flex; align-items: center; justify-content: center; font-size: 0.85rem;">
                                        <i class="fa-solid fa-magnifying-glass-chart"></i>
                                    </div>
                                    <div>
                                        <strong style="font-size: 0.82rem; color: #0F172A; display: block;">Mistake Analysis</strong>
                                        <span style="font-size: 0.72rem; color: #64748B;">Diagnostic Feedback</span>
                                    </div>
                                </div>
                                <i class="fa-solid fa-chevron-right" style="font-size: 0.75rem; color: #94A3B8;"></i>
                            </a>

                            <a href="#/student/games" style="display: flex; align-items: center; justify-content: space-between; padding: 0.6rem 0.75rem; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; text-decoration: none; color: inherit;">
                                <div style="display: flex; align-items: center; gap: 0.65rem;">
                                    <div style="width: 30px; height: 30px; border-radius: 6px; background: #ECFDF5; color: #059669; display: flex; align-items: center; justify-content: center; font-size: 0.85rem;">
                                        <i class="fa-solid fa-gamepad"></i>
                                    </div>
                                    <div>
                                        <strong style="font-size: 0.82rem; color: #0F172A; display: block;">Gamified Lessons</strong>
                                        <span style="font-size: 0.72rem; color: #64748B;">Logic Tracing Drills</span>
                                    </div>
                                </div>
                                <i class="fa-solid fa-chevron-right" style="font-size: 0.75rem; color: #94A3B8;"></i>
                            </a>

                            <a href="#/student/post-test/start" style="display: flex; align-items: center; justify-content: space-between; padding: 0.6rem 0.75rem; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; text-decoration: none; color: inherit;">
                                <div style="display: flex; align-items: center; gap: 0.65rem;">
                                    <div style="width: 30px; height: 30px; border-radius: 6px; background: #EDE9FE; color: #7C3AED; display: flex; align-items: center; justify-content: center; font-size: 0.85rem;">
                                        <i class="fa-solid fa-clipboard-check"></i>
                                    </div>
                                    <div>
                                        <strong style="font-size: 0.82rem; color: #0F172A; display: block;">Understanding Check</strong>
                                        <span style="font-size: 0.72rem; color: #64748B;">15 Post-Test Questions</span>
                                    </div>
                                </div>
                                <i class="fa-solid fa-chevron-right" style="font-size: 0.75rem; color: #94A3B8;"></i>
                            </a>
                        </div>
                    </div>

                    <!-- Learning Milestones / Status -->
                    <div class="card" style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 1.25rem; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04); margin-bottom: 0;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem;">
                            <h4 style="font-size: 0.95rem; font-weight: 700; color: #0F172A; margin: 0;">Current Track</h4>
                        </div>
                        <div style="background: #EFF6FF; border: 1px solid #DBEAFE; border-radius: 10px; padding: 1rem; text-align: center;">
                            <div style="width: 44px; height: 44px; border-radius: 50%; background: #2563EB; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; margin: 0 auto 0.6rem auto;">
                                <i class="fa-solid fa-award"></i>
                            </div>
                            <strong style="font-size: 0.92rem; color: #0F172A; display: block;">Java Foundations</strong>
                            <p style="font-size: 0.78rem; color: #64748B; margin: 0.25rem 0 0.75rem 0;">${studentProgress.preTestCompleted ? "Diagnostic Completed" : "Enrolled & Active"}</p>
                            <a href="#/student/profile" class="btn btn-outline btn-sm" style="display: block; width: 100%; padding: 0.35rem; font-size: 0.78rem; font-weight: 600; border-radius: 6px; border: 1px solid #CBD5E1; background: #FFFFFF; color: #0F172A; text-decoration: none;">
                                View Profile
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Launch module in new tab handlers
    container.querySelectorAll(".launch-module-tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const moduleKey = btn.getAttribute("data-module") || "integer";
            openGameInNewTab(moduleKey);
        });
    });

    document.getElementById("btn-launch-rec-tab")?.addEventListener("click", () => {
        const targetModule = studentProgress.targetModule || "arrays";
        openGameInNewTab(targetModule);
    });

    // Fetch real summary if user is authenticated
    if (studentId) {
        try {
            const summary = await ErrorAPI.getSummary(studentId);
            if (summary && summary.recommended_focus && summary.recommended_focus !== "General" && summary.recommended_focus !== "None") {
                const topicEl = document.getElementById("dash-target-topic");
                if (topicEl) topicEl.textContent = summary.recommended_focus;
            }
        } catch (e) { }
    }
}

function openGameInNewTab(section) {
    const url = new URL(window.location.href);
    url.hash = `#/student/game-player?module=${encodeURIComponent(section)}`;
    url.search = "";
    window.open(url.toString(), "_blank", "noopener,noreferrer");
}

function getLocalProgress(studentId) {
    try {
        const raw = localStorage.getItem(`cq_progress_${studentId}`);
        if (raw) return JSON.parse(raw);
    } catch (e) { }

    return {
        currentStep: 1,
        targetConcept: null,
        targetModule: "arrays",
        preTestCompleted: false,
        recommendationText: null
    };
}

function renderStepperHTML(currentStep) {
    const steps = [
        { num: 1, title: "Pre-Test", icon: "fa-clipboard-list", path: "/student/pre-test" },
        { num: 2, title: "Error Feedback", icon: "fa-magnifying-glass-chart", path: "/student/error-analysis" },
        { num: 3, title: "Game Lesson", icon: "fa-gamepad", path: "/student/games" },
        { num: 4, title: "Understanding Check", icon: "fa-clipboard-check", path: "/student/post-test/start" },
        { num: 5, title: "Mastery Result", icon: "fa-trophy", path: "/student/post-test/start" },
    ];

    return `
        <div class="dash-stepper-compact" style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; flex-wrap: wrap;">
            ${steps.map((s, idx) => {
                const isDone = s.num < currentStep;
                const isActive = s.num === currentStep;
                let bg = "#F1F5F9";
                let fg = "#64748B";
                let border = "#E2E8F0";

                if (isDone) {
                    bg = "#DCFCE7";
                    fg = "#16A34A";
                    border = "#86EFAC";
                } else if (isActive) {
                    bg = "#2563EB";
                    fg = "#FFFFFF";
                    border = "#2563EB";
                }

                return `
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 0.35rem; flex: 1; min-width: 90px; text-align: center;">
                        <a href="#${s.path}" style="width: 36px; height: 36px; border-radius: 50%; background: ${bg}; color: ${fg}; border: 1.5px solid ${border}; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; text-decoration: none; font-weight: 700; transition: transform 0.15s;" title="${s.title}">
                            ${isDone ? '<i class="fa-solid fa-check"></i>' : `<i class="fa-solid ${s.icon}"></i>`}
                        </a>
                        <span style="font-size: 0.75rem; font-weight: ${isActive ? '700' : '500'}; color: ${isActive ? '#2563EB' : '#64748B'};">${s.title}</span>
                    </div>
                    ${idx < steps.length - 1 ? `<div style="flex: 1; height: 2px; background: ${isDone ? '#16A34A' : '#E2E8F0'}; margin-bottom: 1.25rem;"></div>` : ''}
                `;
            }).join('')}
        </div>
    `;
}

function renderNextActionHTML(progress) {
    const step = progress.currentStep || 1;

    if (step === 1) {
        return `
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="width: 44px; height: 44px; border-radius: 10px; background: #EFF6FF; color: #2563EB; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
                        <i class="fa-solid fa-play"></i>
                    </div>
                    <div>
                        <span style="font-size: 0.72rem; font-weight: 700; color: #2563EB; text-transform: uppercase; letter-spacing: 0.5px;">Recommended Next Action</span>
                        <h4 style="font-size: 1.05rem; font-weight: 700; color: #0F172A; margin: 0.1rem 0 0.25rem 0;">Take the Diagnostic Pre-Test</h4>
                        <p style="font-size: 0.82rem; color: #64748B; margin: 0;">Evaluate your conceptual foundation across Variables, Operators, Loops, Arrays, and Methods.</p>
                    </div>
                </div>
                <a href="#/student/pre-test" class="btn btn-primary" style="padding: 0.6rem 1.4rem; font-size: 0.88rem; font-weight: 700; border-radius: 8px; background: #2563EB; color: #FFFFFF; text-decoration: none; display: inline-flex; align-items: center; gap: 0.45rem;">
                    <i class="fa-solid fa-pen-to-square"></i> Start Pre-Test
                </a>
            </div>
        `;
    }

    if (step === 2) {
        return `
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="width: 44px; height: 44px; border-radius: 10px; background: #FEF3C7; color: #D97706; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
                        <i class="fa-solid fa-magnifying-glass-chart"></i>
                    </div>
                    <div>
                        <span style="font-size: 0.72rem; font-weight: 700; color: #D97706; text-transform: uppercase; letter-spacing: 0.5px;">Recommended Next Action</span>
                        <h4 style="font-size: 1.05rem; font-weight: 700; color: #0F172A; margin: 0.1rem 0 0.25rem 0;">Review Diagnostic Error Feedback</h4>
                        <p style="font-size: 0.82rem; color: #64748B; margin: 0;">Understand why specific mistakes happened and start your targeted game lesson.</p>
                    </div>
                </div>
                <a href="#/student/error-analysis" class="btn btn-primary" style="padding: 0.6rem 1.4rem; font-size: 0.88rem; font-weight: 700; border-radius: 8px; background: #2563EB; color: #FFFFFF; text-decoration: none; display: inline-flex; align-items: center; gap: 0.45rem;">
                    <i class="fa-solid fa-eye"></i> View Feedback
                </a>
            </div>
        `;
    }

    if (step === 3) {
        return `
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="width: 44px; height: 44px; border-radius: 10px; background: #ECFDF5; color: #059669; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
                        <i class="fa-solid fa-gamepad"></i>
                    </div>
                    <div>
                        <span style="font-size: 0.72rem; font-weight: 700; color: #059669; text-transform: uppercase; letter-spacing: 0.5px;">Recommended Next Action</span>
                        <h4 style="font-size: 1.05rem; font-weight: 700; color: #0F172A; margin: 0.1rem 0 0.25rem 0;">Play ${progress.targetConcept || "Topic"} Game Lesson</h4>
                        <p style="font-size: 0.82rem; color: #64748B; margin: 0;">Reinforce your mental model through interactive gamified logic and boundary challenges.</p>
                    </div>
                </div>
                <a href="#/student/games" class="btn btn-primary" style="padding: 0.6rem 1.4rem; font-size: 0.88rem; font-weight: 700; border-radius: 8px; background: #059669; color: #FFFFFF; text-decoration: none; display: inline-flex; align-items: center; gap: 0.45rem;">
                    <i class="fa-solid fa-play"></i> Launch Lesson
                </a>
            </div>
        `;
    }

    return `
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="width: 44px; height: 44px; border-radius: 10px; background: #EDE9FE; color: #7C3AED; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
                    <i class="fa-solid fa-clipboard-check"></i>
                </div>
                <div>
                    <span style="font-size: 0.72rem; font-weight: 700; color: #7C3AED; text-transform: uppercase; letter-spacing: 0.5px;">Recommended Next Action</span>
                    <h4 style="font-size: 1.05rem; font-weight: 700; color: #0F172A; margin: 0.1rem 0 0.25rem 0;">Take the Understanding Check</h4>
                    <p style="font-size: 0.82rem; color: #64748B; margin: 0;">Validate your conceptual schema mastery through a 15-question post-test evaluation.</p>
                </div>
            </div>
            <a href="#/student/post-test/start" class="btn btn-primary" style="padding: 0.6rem 1.4rem; font-size: 0.88rem; font-weight: 700; border-radius: 8px; background: #2563EB; color: #FFFFFF; text-decoration: none; display: inline-flex; align-items: center; gap: 0.45rem;">
                <i class="fa-solid fa-clipboard-check"></i> Start Check
            </a>
        </div>
    `;
}

function renderMiniCalendarHTML() {
    const days = ["M", "T", "W", "T", "F", "S", "S"];
    const todayDate = new Date().getDate();

    let gridHtml = `<div style="display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; font-size: 0.7rem; font-weight: 700; color: #94A3B8; margin-bottom: 0.4rem;">${days.map(d => `<span>${d}</span>`).join('')}</div>`;
    gridHtml += `<div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; text-align: center;">`;
    
    for (let i = 1; i <= 28; i++) {
        const isToday = i === todayDate || (todayDate > 28 && i === 28);
        gridHtml += `<span style="font-size: 0.75rem; padding: 0.3rem 0; border-radius: 6px; ${isToday ? 'background: #2563EB; color: #FFFFFF; font-weight: 700;' : 'color: #475569;'}">${i}</span>`;
    }
    gridHtml += `</div>`;
    return gridHtml;
}
