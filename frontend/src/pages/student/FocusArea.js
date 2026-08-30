/**
 * Practice Plan Page
 * ==================
 * Purpose: Show recommended learning & game practice plan based on diagnostic Error Feedback.
 * Clean, white-theme LMS page separated from the diagnostic Error Feedback page.
 */

import { getCurrentUser } from "../../utils/auth.js";
import { ErrorAPI } from "../../api/api.js";

const CONCEPT_GAME_MAPPINGS = {
    Arrays: {
        focusLabel: "Arrays & Index Traversal",
        mistakeType: "ARRAY_ERROR",
        targetConcept: "Arrays",
        gameTitle: "Array Index Rescue Game",
        moduleName: "Array Mastery Module",
        categoryKey: "arrays",
        moduleKey: "arrays",
        intensity: "Adaptive • Focus on Boundary Safety",
        whyRecommended: "Reinforces 0-based indexing and prevents ArrayIndexOutOfBoundsException during forward and backward traversal.",
        skillToImprove: "Array boundary safety, memory indexing, and element manipulation.",
        courseTrilogy: "Memory Vault → Index Interceptor → Array Forge",
        badges: ["🗃️ Array Schema", "🎯 Index Expert", "⚒️ Array Smith"]
    },
    Loops: {
        focusLabel: "Loops & Iteration Controls",
        mistakeType: "LOOP_ERROR",
        targetConcept: "Loops",
        gameTitle: "Loop Train Express",
        moduleName: "For Loop Mastery Module",
        categoryKey: "loops",
        moduleKey: "loops",
        intensity: "Adaptive • Iteration Logic",
        whyRecommended: "Helps you master loop boundary conditions (< vs <=) and prevents infinite iteration cycles.",
        skillToImprove: "Loop termination logic, step updates, and nested loop counters.",
        courseTrilogy: "Loop Train Express → Iteration Arena",
        badges: ["🔄 Loop Engineer", "🔁 Loop Detective"]
    },
    Variables: {
        focusLabel: "Variables & State Management",
        mistakeType: "VARIABLE_ERROR",
        targetConcept: "Variables",
        gameTitle: "Variable Tracker Arena",
        moduleName: "Integer Mastery Module",
        categoryKey: "variables",
        moduleKey: "integer",
        intensity: "Adaptive • Core Data Types",
        whyRecommended: "Strengthens variable declaration, initialization, assignment vs comparison (= vs ==), and scope rules.",
        skillToImprove: "State tracking, type assignment, and variable lifecycle.",
        courseTrilogy: "Number Line Adventure → Cyber Variable Arena → Integer Escape Facility",
        badges: ["🏆 Integer Explorer", "⚔️ Math Warrior", "🧠 Logic Master"]
    },
    Methods: {
        focusLabel: "Methods & Parameter Matching",
        mistakeType: "METHOD_ERROR",
        targetConcept: "Methods",
        gameTitle: "Method Mastery Wing",
        moduleName: "String Methods Wing",
        categoryKey: "methods",
        moduleKey: "stringmethods",
        intensity: "Adaptive • Signature Contracts",
        whyRecommended: "Clarifies parameter counts (arity), return types, and method invocation syntax.",
        skillToImprove: "Method signatures, argument passing, and return value handling.",
        courseTrilogy: "String.length() → String.charAt() → toUpperCase() / toLowerCase()",
        badges: ["🔍 length() Mastery", "🔧 charAt() Mastery", "⚒️ Case Mastery"]
    },
    Operators: {
        focusLabel: "Operators & Expression Evaluation",
        mistakeType: "OPERATOR_ERROR",
        targetConcept: "Operators",
        gameTitle: "Operator Mastery Academy",
        moduleName: "Operator Mastery Module",
        categoryKey: "operators",
        moduleKey: "operators",
        intensity: "Adaptive • Logic Evaluation",
        whyRecommended: "Enhances understanding of arithmetic precedence, relational operators, and logical short-circuiting.",
        skillToImprove: "Expression evaluation, operator precedence, and compound assignments.",
        courseTrilogy: "Math Magic Academy → Calculation Arena → Code Builder Pro",
        badges: ["🧙 Math Wizard", "⚔️ Combat Calculator", "👑 Code Master"]
    }
};

function getLocalProgress(studentId) {
    try {
        const raw = localStorage.getItem(`cq_progress_${studentId}`);
        return raw ? JSON.parse(raw) : {};
    } catch (e) {
        return {};
    }
}

function launchTargetGame(categoryKey, moduleKey) {
    sessionStorage.setItem("codequest_target_category", categoryKey);
    sessionStorage.setItem("codequest_target_module", moduleKey);
    window.location.hash = "#/student/games";
}

export async function renderFocusArea(container) {
    const user = getCurrentUser();
    if (!user) {
        container.innerHTML = `
            <div class="card" style="text-align: center; padding: 4rem 2rem; max-width: 600px; margin: 2rem auto; background:#FFFFFF; border:1px solid var(--border-color);">
                <div style="font-size: 3rem; color: var(--primary); margin-bottom: 1rem;"><i class="fa-solid fa-lock"></i></div>
                <h2 style="font-size: 1.5rem; margin-bottom: 0.5rem; color:var(--text-primary);">Sign In Required</h2>
                <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">Sign in to view your personalized practice plan.</p>
                <a href="#/login" class="btn btn-primary btn-lg"><i class="fa-solid fa-arrow-right-to-bracket"></i> Sign In</a>
            </div>
        `;
        return;
    }

    const studentId = user.uid || user.id;
    const progress = getLocalProgress(studentId);

    // Determine target concept and mistake type from latest session or progress
    let targetConcept = progress.targetConcept || null;
    let mistakeType = null;

    // Check latest error analysis cached in session
    try {
        const latestRaw = sessionStorage.getItem("latest_error_analysis");
        if (latestRaw) {
            const latest = JSON.parse(latestRaw);
            if (latest.concept) targetConcept = latest.concept;
            if (latest.prediction || latest.label) {
                mistakeType = latest.prediction || latest.label;
            }
        }
    } catch (e) {}

    // Fallback: fetch summary if available
    if (!targetConcept && studentId) {
        try {
            const summary = await ErrorAPI.getSummary(studentId);
            if (summary && summary.recommended_focus && summary.recommended_focus !== "General" && summary.recommended_focus !== "None") {
                targetConcept = summary.recommended_focus;
                if (summary.most_frequent_error) mistakeType = summary.most_frequent_error;
            }
        } catch (e) {}
    }

    // Default to Arrays if pretest was taken or fallback exists
    if (!targetConcept && progress.preTestCompleted) {
        targetConcept = "Arrays";
    }

    // If still no recommendation / no pretest completed, display empty state
    if (!targetConcept) {
        container.innerHTML = `
            <div class="focus-area-page">
                <div class="page-top-nav-bar">
                    <a href="#/student/dashboard" class="btn-back-link">
                        <i class="fa-solid fa-arrow-left"></i> Back to Dashboard
                    </a>
                </div>

                <div class="ea-header">
                    <div>
                        <div class="ea-breadcrumb">
                            <span>Learning Journey</span>
                            <i class="fa-solid fa-chevron-right"></i>
                            <span class="active">Practice Plan</span>
                        </div>
                        <h1 class="ea-title">Your Practice Plan</h1>
                        <p class="ea-subtitle">Targeted learning plan designed to reinforce your conceptual schema.</p>
                    </div>
                </div>

                <div class="card" style="text-align: center; padding: 4rem 2rem; max-width: 680px; margin: 1.5rem auto; background:#FFFFFF; border:1px solid var(--border-color);">
                    <div style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;">
                        <i class="fa-solid fa-bullseye"></i>
                    </div>
                    <h3 style="font-size: 1.3rem; margin-bottom: 0.5rem; color: var(--text-primary);">No Practice Plan Found</h3>
                    <p style="color: var(--text-secondary); font-size: 0.95rem; max-width: 440px; margin: 0 auto 1.5rem auto; line-height: 1.5;">
                        Please complete the diagnostic Pre-Test and review your Error Feedback first to generate your custom practice plan.
                    </p>
                    <a href="#/student/pre-test" class="btn btn-primary btn-lg">
                        <i class="fa-solid fa-pen-to-square"></i> Start Pre-Test
                    </a>
                </div>
            </div>
        `;
        return;
    }

    const mapping = CONCEPT_GAME_MAPPINGS[targetConcept] || CONCEPT_GAME_MAPPINGS["Arrays"];
    const displayMistakeType = mistakeType || mapping.mistakeType;

    container.innerHTML = `
        <div class="focus-area-page">
            <div class="page-top-nav-bar">
                <a href="#/student/dashboard" class="btn-back-link">
                    <i class="fa-solid fa-arrow-left"></i> Back to Dashboard
                </a>
            </div>

            <div class="ea-header" style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.5rem;">
                <div>
                    <div class="ea-breadcrumb" style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:0.3rem;">
                        <span>Learning Journey</span>
                        <i class="fa-solid fa-chevron-right" style="font-size:0.7rem; margin:0 0.3rem;"></i>
                        <span class="active" style="color:var(--primary); font-weight:600;">Practice Plan</span>
                    </div>
                    <h1 class="ea-title" style="font-size:1.75rem; font-weight:800; color:var(--text-primary); margin:0;">Your Practice Plan</h1>
                    <p class="ea-subtitle" style="color:var(--text-secondary); margin-top:0.3rem; font-size:0.9rem;">
                        Targeted learning plan designed to reinforce your conceptual understanding based on recent diagnostics.
                    </p>
                </div>
                <div>
                    <a href="#/student/error-analysis" class="btn btn-secondary">
                        <i class="fa-solid fa-magnifying-glass-chart"></i> Review Error Feedback
                    </a>
                </div>
            </div>

            <!-- Small Focus Summary Banner -->
            <div class="card" style="background:var(--primary-soft); border:1px solid rgba(37,99,235,0.25); padding:1rem 1.25rem; border-radius:var(--radius-sm); margin-bottom:1.5rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
                <div style="display:flex; gap:1.5rem; align-items:center; flex-wrap:wrap;">
                    <div>
                        <div style="font-size:0.7rem; font-weight:700; text-transform:uppercase; color:var(--text-secondary); letter-spacing:0.5px;">Focus Area</div>
                        <div style="font-size:1.1rem; font-weight:700; color:var(--primary);">${mapping.focusLabel}</div>
                    </div>
                    <div style="width:1px; height:32px; background:var(--border-color);"></div>
                    <div>
                        <div style="font-size:0.7rem; font-weight:700; text-transform:uppercase; color:var(--text-secondary); letter-spacing:0.5px;">Diagnosed Mistake Type</div>
                        <div style="font-size:1rem; font-weight:700; color:var(--accent-orange, #D97706);">${displayMistakeType}</div>
                    </div>
                </div>
                <div>
                    <span class="badge" style="background:#FFFFFF; color:var(--primary); border:1px solid rgba(37,99,235,0.2); font-weight:600; padding:0.35rem 0.75rem;">
                        <i class="fa-solid fa-shield-halved"></i> Active Learning Track
                    </span>
                </div>
            </div>

            <!-- Recommended Activity Card -->
            <div class="card focus-hero-card" style="background:#FFFFFF; border:1px solid var(--border-color); padding:1.75rem; border-radius:var(--radius-sm); margin-bottom:1.5rem;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem; flex-wrap:wrap; gap:0.5rem;">
                    <div>
                        <span class="badge badge-warning" style="margin-bottom:0.5rem; display:inline-block;">
                            <i class="fa-solid fa-gamepad"></i> Recommended Activity
                        </span>
                        <h2 style="font-size:1.4rem; font-weight:800; color:var(--text-primary); margin:0.2rem 0;">
                            ${mapping.gameTitle}
                        </h2>
                        <span style="font-size:0.85rem; color:var(--text-secondary); font-weight:500;">
                            Part of the <strong>${mapping.moduleName}</strong> • ${mapping.intensity}
                        </span>
                    </div>
                    <button class="btn btn-primary btn-lg" id="btn-start-game-hero" style="padding:0.75rem 1.5rem; font-weight:700;">
                        <i class="fa-solid fa-play"></i> Start Game Lesson
                    </button>
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.2rem; margin:1.2rem 0; padding:1.2rem; background:var(--bg-subtle); border-radius:var(--radius-sm); border:1px solid var(--border-color);">
                    <div>
                        <div style="font-size:0.75rem; font-weight:700; text-transform:uppercase; color:var(--text-secondary); margin-bottom:0.4rem;">
                            <i class="fa-solid fa-circle-info" style="color:var(--primary);"></i> Why Recommended
                        </div>
                        <p style="font-size:0.88rem; color:var(--text-primary); line-height:1.5; margin:0;">
                            ${mapping.whyRecommended}
                        </p>
                    </div>
                    <div>
                        <div style="font-size:0.75rem; font-weight:700; text-transform:uppercase; color:var(--text-secondary); margin-bottom:0.4rem;">
                            <i class="fa-solid fa-bullseye" style="color:var(--success);"></i> Skill to Improve
                        </div>
                        <p style="font-size:0.88rem; color:var(--text-primary); line-height:1.5; margin:0;">
                            ${mapping.skillToImprove}
                        </p>
                    </div>
                </div>

                <div style="margin-top:1rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; border-top:1px solid var(--border-color); padding-top:1rem;">
                    <div>
                        <span style="font-size:0.78rem; font-weight:700; color:var(--text-secondary); text-transform:uppercase;">Course Trilogy: </span>
                        <span style="font-size:0.85rem; color:var(--text-primary); font-weight:600;">${mapping.courseTrilogy}</span>
                    </div>
                    <div style="display:flex; gap:0.5rem;">
                        ${mapping.badges.map(b => `<span style="font-size:0.75rem; padding:0.25rem 0.55rem; background:var(--warning-soft); color:#92400E; border-radius:4px; font-weight:600;">${b}</span>`).join('')}
                    </div>
                </div>
            </div>

            <!-- 3-Step Plan Track -->
            <div class="card" style="background:#FFFFFF; border:1px solid var(--border-color); padding:1.5rem; border-radius:var(--radius-sm);">
                <h3 style="font-size:1.1rem; font-weight:700; color:var(--text-primary); margin-top:0; margin-bottom:1.2rem;">
                    <i class="fa-solid fa-list-check" style="color:var(--primary); margin-right:0.4rem;"></i> Step-by-Step Learning Plan
                </h3>

                <div class="study-steps-list" style="display:flex; flex-direction:column; gap:0.85rem;">
                    <!-- Step 1 -->
                    <div class="study-step-row" style="display:flex; align-items:center; justify-content:space-between; padding:0.85rem 1rem; border:1px solid var(--border-color); border-radius:var(--radius-sm); background:var(--bg-subtle);">
                        <div style="display:flex; align-items:center; gap:1rem;">
                            <div style="width:32px; height:32px; border-radius:50%; background:var(--primary); color:#FFFFFF; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.9rem;">1</div>
                            <div>
                                <strong style="font-size:0.9rem; color:var(--text-primary); display:block;">Review Error Feedback</strong>
                                <p style="font-size:0.8rem; color:var(--text-secondary); margin:0;">Examine compiler misconceptions and repair strategy from your pre-test.</p>
                            </div>
                        </div>
                        <a href="#/student/error-analysis" class="btn btn-secondary btn-sm">
                            Review Feedback
                        </a>
                    </div>

                    <!-- Step 2 -->
                    <div class="study-step-row" style="display:flex; align-items:center; justify-content:space-between; padding:0.85rem 1rem; border:1px solid var(--primary); border-radius:var(--radius-sm); background:var(--primary-soft);">
                        <div style="display:flex; align-items:center; gap:1rem;">
                            <div style="width:32px; height:32px; border-radius:50%; background:var(--primary); color:#FFFFFF; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.9rem;">2</div>
                            <div>
                                <strong style="font-size:0.9rem; color:var(--primary); display:block;">Complete Recommended Game (${mapping.gameTitle})</strong>
                                <p style="font-size:0.8rem; color:var(--text-secondary); margin:0;">Play through the 3 interactive schema levels to solidify mental models.</p>
                            </div>
                        </div>
                        <button class="btn btn-primary btn-sm" id="btn-start-game-step">
                            <i class="fa-solid fa-play"></i> Play Now
                        </button>
                    </div>

                    <!-- Step 3 -->
                    <div class="study-step-row" style="display:flex; align-items:center; justify-content:space-between; padding:0.85rem 1rem; border:1px solid var(--border-color); border-radius:var(--radius-sm); background:var(--bg-subtle);">
                        <div style="display:flex; align-items:center; gap:1rem;">
                            <div style="width:32px; height:32px; border-radius:50%; background:var(--text-muted); color:#FFFFFF; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.9rem;">3</div>
                            <div>
                                <strong style="font-size:0.9rem; color:var(--text-primary); display:block;">Unlock Understanding Check (Post-Test)</strong>
                                <p style="font-size:0.8rem; color:var(--text-secondary); margin:0;">Validate your mastery progress with adaptive post-test schema questions.</p>
                            </div>
                        </div>
                        <a href="#/student/post-test/start" class="btn btn-secondary btn-sm">
                            Post-Test
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Wire game start buttons
    document.getElementById("btn-start-game-hero")?.addEventListener("click", () => {
        launchTargetGame(mapping.categoryKey, mapping.moduleKey);
    });

    document.getElementById("btn-start-game-step")?.addEventListener("click", () => {
        launchTargetGame(mapping.categoryKey, mapping.moduleKey);
    });
}
