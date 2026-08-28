/**
 * Modules Component — CodeQuest Java Curriculum Syllabus
 * ========================================================
 * Structured course syllabus covering the 5 fundamental Java modules:
 * 1. Variables & Data Types
 * 2. Operators & Expressions
 * 3. Loops & Iteration
 * 4. Arrays & Collections
 * 5. Methods & Functions
 */

import { animatePageEntrance, animateStaggerCards } from "../../utils/animations.js";

const CURRICULUM_DATA = [
    {
        id: "variables",
        name: "Variables & Data Types",
        category: "Foundations",
        icon: "fa-cube",
        color: "#2563EB",
        bg: "#EFF6FF",
        status: "in_progress",
        duration: "45 mins",
        summary: "Understand primitive data types, memory allocation, variable declaration, and assignment operators in Java.",
        objectives: [
            "Declare and initialize int, double, boolean, and char variables",
            "Understand value assignments, variable naming conventions, and scope",
            "Avoid common type mismatch errors and uninitialized variable pitfalls"
        ],
        gameSection: "integer"
    },
    {
        id: "operators",
        name: "Operators & Expressions",
        category: "Foundations",
        icon: "fa-calculator",
        color: "#0F766E",
        bg: "#F0FDFA",
        status: "up_next",
        duration: "50 mins",
        summary: "Master arithmetic, relational, and logical operators to construct expressive code statements and conditions.",
        objectives: [
            "Apply arithmetic (+, -, *, /, %) and compound operators (+=, -=)",
            "Evaluate relational conditions (==, !=, >, <, >=, <=)",
            "Combine logical expressions with AND (&&), OR (||), and NOT (!)"
        ],
        gameSection: "operators"
    },
    {
        id: "loops",
        name: "Loops & Iteration",
        category: "Control Flow",
        icon: "fa-rotate-right",
        color: "#D97706",
        bg: "#FFFBEB",
        status: "locked",
        duration: "60 mins",
        summary: "Learn to repeat actions deterministically with for loops, while loops, and do-while loops while managing boundary conditions.",
        objectives: [
            "Write standard for loops with start, condition, and increment expressions",
            "Implement while loops with proper loop counter increments",
            "Avoid off-by-one errors and infinite loop conditions"
        ],
        gameSection: "integer"
    },
    {
        id: "arrays",
        name: "Arrays & Collections",
        category: "Data Structures",
        icon: "fa-table-cells",
        color: "#7C3AED",
        bg: "#FAF5FF",
        status: "locked",
        duration: "60 mins",
        summary: "Organize ordered collections of data in arrays, access elements by index, and safely iterate through lists.",
        objectives: [
            "Declare, instantiate, and populate fixed-size arrays",
            "Access array elements safely by zero-based index",
            "Iterate across array elements and prevent ArrayIndexOutOfBoundsException"
        ],
        gameSection: "integer"
    },
    {
        id: "methods",
        name: "Methods & Functions",
        category: "Modularity",
        icon: "fa-code-branch",
        color: "#0284C7",
        bg: "#F0F9FF",
        status: "locked",
        duration: "75 mins",
        summary: "Break code into reusable, modular procedures with defined parameters, return types, and scope boundaries.",
        objectives: [
            "Define method signatures with parameter lists and return types",
            "Pass arguments by value and return computed values to callers",
            "Understand method overloading and modular code structure"
        ],
        gameSection: "integer"
    }
];

export function renderModules(container, onNavigate) {
    container.innerHTML = `
        <div class="modules-page-wrap" style="display: flex; flex-direction: column; gap: 2rem;">
            
            <!-- Page Header -->
            <div class="modules-header" style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
                <div>
                    <h1 style="font-size: 1.65rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.25rem;">
                        Java Curriculum Syllabus
                    </h1>
                    <p style="color: var(--text-muted); font-size: 0.9375rem;">
                        5 foundational modules covering programming essentials, control flow, and data structures.
                    </p>
                </div>
                <button class="btn btn-primary" id="modules-start-btn">
                    <i class="fa-solid fa-play"></i> Continue Active Track
                </button>
            </div>

            <!-- Modules List -->
            <div style="display: flex; flex-direction: column; gap: 1.25rem;">
                ${CURRICULUM_DATA.map((mod, idx) => {
                    const isInProgress = mod.status === "in_progress";
                    const isUpNext = mod.status === "up_next";
                    const isLocked = mod.status === "locked";

                    const badgeClass = isInProgress ? "badge-primary" : isUpNext ? "badge-warning" : "badge-neutral";
                    const badgeText = isInProgress ? "In Progress" : isUpNext ? "Up Next" : "Locked";

                    return `
                        <div class="card module-syllabus-card" style="padding: 1.75rem; border: 1px solid ${isInProgress ? 'var(--border-focus)' : 'var(--border-main)'}; background: ${isInProgress ? '#FAFCFF' : 'var(--bg-surface)'}; border-radius: var(--radius-md);">
                            
                            <!-- Header Row -->
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.75rem;">
                                <div style="display: flex; align-items: center; gap: 1rem;">
                                    <div style="width: 48px; height: 48px; border-radius: var(--radius-sm); background: ${mod.bg}; color: ${mod.color}; display: flex; align-items: center; justify-content: center; font-size: 1.35rem; flex-shrink: 0;">
                                        <i class="fa-solid ${mod.icon}"></i>
                                    </div>
                                    <div>
                                        <div style="display: flex; align-items: center; gap: 0.6rem;">
                                            <span style="font-size: 0.8125rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">
                                                Module 0${idx + 1}
                                            </span>
                                            <span class="badge ${badgeClass}">${badgeText}</span>
                                            <span style="font-size: 0.8125rem; color: var(--text-muted);">• ${mod.duration}</span>
                                        </div>
                                        <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--text-main); margin-top: 0.2rem;">
                                            ${mod.name}
                                        </h2>
                                    </div>
                                </div>

                                <div style="display: flex; gap: 0.5rem;">
                                    ${!isLocked ? `
                                        <button class="btn btn-primary btn-sm mod-action-btn" data-section="${mod.gameSection}">
                                            Practice Challenges <i class="fa-solid fa-arrow-right" style="margin-left: 0.3rem;"></i>
                                        </button>
                                    ` : `
                                        <span style="font-size: 0.8125rem; color: var(--text-muted); display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.75rem;">
                                            <i class="fa-solid fa-lock"></i> Prerequisite Required
                                        </span>
                                    `}
                                </div>
                            </div>

                            <!-- Description -->
                            <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1.25rem; line-height: 1.55;">
                                ${mod.summary}
                            </p>

                            <!-- Learning Objectives -->
                            <div style="background: var(--bg-surface-subtle); padding: 1rem 1.25rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
                                <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.5rem;">
                                    Key Learning Objectives
                                </div>
                                <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.35rem;">
                                    ${mod.objectives.map(obj => `
                                        <li style="display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.875rem; color: var(--text-main); line-height: 1.45;">
                                            <i class="fa-solid fa-circle-check" style="color: var(--status-success); margin-top: 0.2rem; font-size: 0.8125rem;"></i>
                                            <span>${obj}</span>
                                        </li>
                                    `).join("")}
                                </ul>
                            </div>

                        </div>
                    `;
                }).join("")}
            </div>

        </div>
    `;

    animatePageEntrance(container.querySelector(".modules-header"));
    animateStaggerCards(".module-syllabus-card", container);

    document.getElementById("modules-start-btn")?.addEventListener("click", () => {
        if (onNavigate) onNavigate("/student/games");
    });

    container.querySelectorAll(".mod-action-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            if (onNavigate) onNavigate("/student/games");
        });
    });
}
