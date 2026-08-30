/**
 * Student Dashboard
 * =================
 * Modern, clean white-theme LMS dashboard inspired by reference design.
 * Features:
 *   1. Vibrant Blue Welcome Banner with dynamic date & student greeting
 *   2. Compact 6-Step Learning Journey Stepper
 *   3. Contextual Next Action Card (State-Driven)
 *   4. Core Java Modules Grid (Compact Cards)
 *   5. Recommended Practice Card
 *   6. Right-Side LMS Column: Mini Learning Schedule, Upcoming Tasks, and Milestone Badges
 */

import { getCurrentUser } from "../../utils/auth.js";
import { ErrorAPI } from "../../api/api.js";

const MODULES = [
    { id: "variables", name: "Variables & Types", icon: "fa-box", desc: "Declarations, primitive types, and state scope", lessons: 4, level: "Beginner", color: "#3B82F6" },
    { id: "operators", name: "Operators & Logic", icon: "fa-calculator", desc: "Arithmetic, relational, and boolean precedence", lessons: 3, level: "Beginner", color: "#10B981" },
    { id: "loops", name: "Loops & Iteration", icon: "fa-rotate", desc: "For, while, loop boundaries, and step bounds", lessons: 5, level: "Intermediate", color: "#F59E0B" },
    { id: "arrays", name: "Arrays & Indices", icon: "fa-table-cells", desc: "0-indexed arrays, memory bounds, and traversal", lessons: 4, level: "Intermediate", color: "#8B5CF6" },
    { id: "methods", name: "Methods & Calls", icon: "fa-code", desc: "Signatures, return contracts, and parameter passing", lessons: 4, level: "Intermediate", color: "#EC4899" },
];

export async function renderStudentDashboard(container) {
    const user = getCurrentUser();
    if (!user) {
        container.innerHTML = `
            <div class="card" style="text-align: center; padding: 4rem 2rem; max-width: 540px; margin: 3rem auto; border-radius: 16px;">
                <div style="font-size: 2.5rem; color: var(--primary); margin-bottom: 1rem;"><i class="fa-solid fa-lock"></i></div>
                <h2 style="font-size: 1.4rem; color: var(--text-primary); margin-bottom: 0.5rem;">Sign In Required</h2>
                <p style="color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 0.95rem;">Please sign in to access your student dashboard and learning progress.</p>
                <a href="#/login" class="btn btn-primary btn-lg"><i class="fa-solid fa-arrow-right-to-bracket"></i> Sign In</a>
            </div>
        `;
        return;
    }

    const studentName = user.displayName || user.name || user.email?.split("@")[0] || "Learner";
    const studentId = user.uid || user.id;

    // Load real local student progress or initialize empty state
    const studentProgress = getLocalProgress(studentId);

    // Dynamic date string
    const todayStr = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", weekday: "long" });

    container.innerHTML = `
        <div class="student-dashboard-layout">
            <!-- Left Main Content Column -->
            <div class="dash-primary-content">
                <!-- Welcome Banner (Vibrant Blue Card inspired by reference) -->
                <div class="dash-banner-card">
                    <div class="banner-text-side">
                        <span class="banner-date-tag">${todayStr}</span>
                        <h1 class="banner-title">Welcome back, ${studentName}!</h1>
                        <p class="banner-subtitle">
                            ${studentProgress.targetConcept ? `Currently practicing <strong>${studentProgress.targetConcept}</strong> to reinforce key mental models.` : 'Ready to diagnose your Java foundation and start your practice track?'}
                        </p>
                    </div>
                    <div class="banner-icon-side">
                        <div class="banner-graphic-badge">
                            <i class="fa-solid fa-graduation-cap"></i>
                        </div>
                    </div>
                </div>

                <!-- 5-Step Learning Progression Stepper -->
                <div class="card dash-panel-card">
                    <div class="panel-card-header">
                        <div class="header-title-group">
                            <i class="fa-solid fa-route icon-primary"></i>
                            <h3>Your 5-Step Learning Progression</h3>
                        </div>
                        <span class="badge badge-primary">Step ${studentProgress.currentStep || 1} of 5</span>
                    </div>
                    <div class="journey-stepper-wrap">
                        ${renderStepperHTML(studentProgress.currentStep || 1)}
                    </div>
                </div>

                <!-- Contextual Next Action Card (State-Driven) -->
                <div class="card dash-panel-card dash-next-step-card" id="dash-next-action">
                    ${renderNextActionHTML(studentProgress)}
                </div>

                <!-- Core Learning Modules Section -->
                <div class="dash-modules-section">
                    <div class="section-title-row">
                        <div class="title-with-icon">
                            <i class="fa-solid fa-book-bookmark icon-primary"></i>
                            <h3>Core Learning Modules</h3>
                        </div>
                        <span class="section-subtext">5 Foundational Java Domains</span>
                    </div>

                    <div class="lms-modules-grid">
                        ${MODULES.map(m => {
                            const isFocus = studentProgress.targetConcept && m.name.toLowerCase().includes(studentProgress.targetConcept.toLowerCase());
                            return `
                                <div class="lms-module-card ${isFocus ? 'is-focus' : ''}">
                                    <div class="lms-module-top" style="border-top-color: ${m.color};">
                                        <div class="lms-module-icon" style="background: ${m.color}15; color: ${m.color};">
                                            <i class="fa-solid ${m.icon}"></i>
                                        </div>
                                        <span class="badge ${m.level === 'Beginner' ? 'badge-beginner' : 'badge-intermediate'}">${m.level}</span>
                                    </div>
                                    <h4 class="lms-module-title">${m.name}</h4>
                                    <p class="lms-module-desc">${m.desc}</p>
                                    <div class="lms-module-bottom">
                                        <span class="lesson-count"><i class="fa-regular fa-file-code"></i> ${m.lessons} Lessons</span>
                                        <a href="#/student/games" class="btn btn-outline btn-sm">Practice</a>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <!-- Recommended Practice Game Card -->
                <div class="card dash-panel-card" style="margin-top: 1.5rem;">
                    <div class="panel-card-header">
                        <div class="header-title-group">
                            <i class="fa-solid fa-bullseye icon-warning"></i>
                            <h3>Recommended Game Lesson</h3>
                        </div>
                    </div>
                    <div class="rec-practice-body">
                        ${studentProgress.targetConcept ? `
                            <div class="rec-topic-pill">
                                <strong>Focus Topic:</strong> <span>${studentProgress.targetConcept}</span>
                            </div>
                            <p class="rec-topic-desc">
                                ${studentProgress.recommendationText || "Targeted practice identified from your error feedback to reinforce your understanding."}
                            </p>
                            <div class="rec-action-buttons">
                                <a href="#/student/error-analysis" class="btn btn-secondary">
                                    <i class="fa-solid fa-magnifying-glass-chart"></i> View Error Feedback
                                </a>
                                <a href="#/student/games" class="btn btn-primary">
                                    <i class="fa-solid fa-gamepad"></i> Launch Game Lesson
                                </a>
                            </div>
                        ` : `
                            <div class="empty-state-compact">
                                <p>Take the diagnostic Pre-Test to evaluate your conceptual understanding and unlock your custom game lesson.</p>
                                <a href="#/student/pre-test" class="btn btn-primary btn-sm">
                                    <i class="fa-solid fa-pen-to-square"></i> Take Diagnostic Pre-Test
                                </a>
                            </div>
                        `}
                    </div>
                </div>
            </div>

            <!-- Right Sidebar Widgets Column (inspired by reference) -->
            <div class="dash-secondary-content">
                <!-- Mini Learning Calendar / Schedule Widget -->
                <div class="card dash-widget-card">
                    <div class="widget-card-header">
                        <h4>Learning Schedule</h4>
                        <span class="text-muted" style="font-size:0.75rem;">${new Date().toLocaleString('default', { month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div class="mini-calendar-view">
                        ${renderMiniCalendarHTML()}
                    </div>
                </div>

                <!-- Upcoming Learning Tasks Widget -->
                <div class="card dash-widget-card" style="margin-top: 1.25rem;">
                    <div class="widget-card-header">
                        <h4>Learning Tasks</h4>
                        <a href="#/student/dashboard" class="widget-link-sm">View All</a>
                    </div>
                    <div class="task-items-list">
                        <a href="#/student/pre-test" class="task-item-row">
                            <div class="task-icon-box blue">
                                <i class="fa-solid fa-clipboard-list"></i>
                            </div>
                            <div class="task-info">
                                <strong>Pre-Test Diagnostic</strong>
                                <span>Java Core Concepts</span>
                            </div>
                            <i class="fa-solid fa-chevron-right task-chevron"></i>
                        </a>

                        <a href="#/student/error-analysis" class="task-item-row">
                            <div class="task-icon-box amber">
                                <i class="fa-solid fa-magnifying-glass-chart"></i>
                            </div>
                            <div class="task-info">
                                <strong>Mistake Analysis</strong>
                                <span>Compiler Feedback</span>
                            </div>
                            <i class="fa-solid fa-chevron-right task-chevron"></i>
                        </a>

                        <a href="#/student/games" class="task-item-row">
                            <div class="task-icon-box green">
                                <i class="fa-solid fa-gamepad"></i>
                            </div>
                            <div class="task-info">
                                <strong>Gamified Lessons</strong>
                                <span>Logic Tracing Drills</span>
                            </div>
                            <i class="fa-solid fa-chevron-right task-chevron"></i>
                        </a>

                        <a href="#/student/post-test/start" class="task-item-row">
                            <div class="task-icon-box purple">
                                <i class="fa-solid fa-clipboard-check"></i>
                            </div>
                            <div class="task-info">
                                <strong>Understanding Check</strong>
                                <span>Post-Learning Check</span>
                            </div>
                            <i class="fa-solid fa-chevron-right task-chevron"></i>
                        </a>
                    </div>
                </div>

                <!-- Learning Milestones / Achievement Card (inspired by reference) -->
                <div class="card dash-widget-card" style="margin-top: 1.25rem;">
                    <div class="widget-card-header">
                        <h4>Milestones & Badges</h4>
                    </div>
                    <div class="milestone-badge-box">
                        <div class="badge-icon-gold">
                            <i class="fa-solid fa-award"></i>
                        </div>
                        <div class="badge-meta">
                            <strong>Java Foundations</strong>
                            <p>${studentProgress.preTestCompleted ? "Diagnostic Completed" : "Enrolled & Active"}</p>
                        </div>
                    </div>
                    <a href="#/student/profile" class="btn btn-outline btn-block btn-sm" style="margin-top: 0.75rem;">
                        View My Profile
                    </a>
                </div>
            </div>
        </div>
    `;

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

function getLocalProgress(studentId) {
    try {
        const raw = localStorage.getItem(`cq_progress_${studentId}`);
        if (raw) return JSON.parse(raw);
    } catch (e) { }

    return {
        currentStep: 1,
        targetConcept: null,
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
        { num: 5, title: "Mastery Result", icon: "fa-trophy", path: "/student/post-test/result" },
    ];

    return `
        <div class="dash-stepper-compact">
            ${steps.map((s, idx) => {
                const isDone = s.num < currentStep;
                const isActive = s.num === currentStep;
                const cls = isDone ? "step-done" : isActive ? "step-active" : "step-pending";

                return `
                    <div class="stepper-item ${cls}">
                        <a href="#${s.path}" class="stepper-circle" title="${s.title}">
                            ${isDone ? '<i class="fa-solid fa-check"></i>' : `<i class="fa-solid ${s.icon}"></i>`}
                        </a>
                        <span class="stepper-label">${s.title}</span>
                    </div>
                    ${idx < steps.length - 1 ? `<div class="stepper-line ${isDone ? 'done' : ''}"></div>` : ''}
                `;
            }).join('')}
        </div>
    `;
}

function renderNextActionHTML(progress) {
    const step = progress.currentStep || 1;

    if (step === 1) {
        return `
            <div class="next-step-layout">
                <div class="next-step-icon blue"><i class="fa-solid fa-play"></i></div>
                <div class="next-step-content">
                    <span class="next-step-tag">Recommended Next Action</span>
                    <h4>Take the Diagnostic Pre-Test</h4>
                    <p>Evaluate your conceptual foundation across Variables, Operators, Loops, Arrays, and Methods.</p>
                </div>
                <a href="#/student/pre-test" class="btn btn-primary">
                    <i class="fa-solid fa-pen-to-square"></i> Start Pre-Test
                </a>
            </div>
        `;
    }

    if (step === 2) {
        return `
            <div class="next-step-layout">
                <div class="next-step-icon amber"><i class="fa-solid fa-magnifying-glass-chart"></i></div>
                <div class="next-step-content">
                    <span class="next-step-tag">Recommended Next Action</span>
                    <h4>Review Diagnostic Error Feedback</h4>
                    <p>Understand why specific mistakes happened and start your targeted game lesson.</p>
                </div>
                <a href="#/student/error-analysis" class="btn btn-primary">
                    <i class="fa-solid fa-eye"></i> View Feedback
                </a>
            </div>
        `;
    }

    if (step === 3) {
        return `
            <div class="next-step-layout">
                <div class="next-step-icon green"><i class="fa-solid fa-gamepad"></i></div>
                <div class="next-step-content">
                    <span class="next-step-tag">Recommended Next Action</span>
                    <h4>Play ${progress.targetConcept || "Topic"} Game Lesson</h4>
                    <p>Reinforce your mental model through interactive gamified logic and boundary challenges.</p>
                </div>
                <a href="#/student/games" class="btn btn-primary">
                    <i class="fa-solid fa-play"></i> Launch Lesson
                </a>
            </div>
        `;
    }

    return `
        <div class="next-step-layout">
            <div class="next-step-icon purple"><i class="fa-solid fa-clipboard-check"></i></div>
            <div class="next-step-content">
                <span class="next-step-tag">Recommended Next Action</span>
                <h4>Take the Understanding Check</h4>
                <p>Validate your conceptual schema mastery through a 15-question post-test evaluation.</p>
            </div>
            <a href="#/student/post-test/start" class="btn btn-primary">
                <i class="fa-solid fa-clipboard-check"></i> Start Check
            </a>
        </div>
    `;
}

function renderMiniCalendarHTML() {
    const days = ["M", "T", "W", "T", "F", "S", "S"];
    const todayDate = new Date().getDate();

    let gridHtml = `<div class="cal-days-header">${days.map(d => `<span>${d}</span>`).join('')}</div>`;
    gridHtml += `<div class="cal-days-grid">`;
    
    // Simple 4-week sample view with highlighted current day
    for (let i = 1; i <= 28; i++) {
        const isToday = i === todayDate || (todayDate > 28 && i === 28);
        gridHtml += `<span class="cal-day-cell ${isToday ? 'is-today' : ''}">${i}</span>`;
    }
    gridHtml += `</div>`;
    return gridHtml;
}
