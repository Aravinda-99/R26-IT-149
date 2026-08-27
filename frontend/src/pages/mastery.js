/**
 * Mastery Page — Component 4: Understanding Check Dashboard
 * ===========================================================
 * Shows concept-specific learning progress cards after gamified lessons.
 * Uses student-friendly language — no research terminology visible to students.
 *
 * Internal logic uses: evidenceScore, mcqUnderstandingScore, finalUnderstandingScore
 * Student sees:        progress %, friendly level badges, encouraging messages
 */

import { MasteryAPI } from "../api/api.js";
import { renderPostTest } from "./posttest.js";

let currentContainer = null;

function normalizeStudent(s = {}) {
    const studentId = s.studentId ?? s.student_id ?? s.user_id ?? s.id ?? "";
    const studentName =
        s.studentName ?? s.student_name ?? s.name ?? (studentId ? String(studentId) : "");
    return {
        ...s,
        studentId,
        studentName,
    };
}

// ── Internal: calculate card state from scores ──────────────────────
// Maps internal scoring data to student-friendly card content.
// Uses FinalUnderstandingScore = (0.40 × activityScore) + (0.60 × mcqScore)
function calculateCardState({ activityScore, mcqScore, checkCompleted }) {
    // STATE 1: Student completed game lesson but has not taken the check yet
    if (!checkCompleted) {
        return {
            displayScore: activityScore,
            scoreLabel: "Activity Progress",
            level: "ready",
            badgeText: "Ready to Check",
            badgeColor: "#f59e0b",
            title: "Ready to Check",
            message: "You completed the game lesson. Answer a few questions to check your understanding.",
            secondaryMessage: "",
            buttonText: "Start Check",
            buttonAction: "START_CHECK",
            progressValue: activityScore,
        };
    }

    // Calculate combined score
    const finalScore = (0.40 * activityScore) + (0.60 * mcqScore);

    // STATE 2: Strong Understanding (0.80 – 1.00)
    if (finalScore >= 0.80) {
        return {
            displayScore: finalScore,
            scoreLabel: "Your Progress",
            level: "strong",
            badgeText: "Strong Understanding",
            badgeColor: "#10b981",
            title: "Great Work!",
            message: "You understood this topic well and can continue to the next step.",
            secondaryMessage: "",
            buttonText: "Done",
            buttonAction: "DONE",
            progressValue: finalScore,
        };
    }

    // STATE 3: Good Progress (0.60 – 0.79)
    if (finalScore >= 0.60) {
        return {
            displayScore: finalScore,
            scoreLabel: "Your Progress",
            level: "good",
            badgeText: "Good Progress",
            badgeColor: "#3b82f6",
            title: "Good Progress!",
            message: "You understood most parts of this topic. A little more practice will help you improve.",
            secondaryMessage: "",
            buttonText: "Done",
            buttonAction: "DONE",
            progressValue: finalScore,
        };
    }

    // STATE 4: Needs More Practice (0.40 – 0.59)
    if (finalScore >= 0.40) {
        return {
            displayScore: finalScore,
            scoreLabel: "Your Progress",
            level: "practice",
            badgeText: "Needs More Practice",
            badgeColor: "#f97316",
            title: "Keep Practicing",
            message: "You are close, but this topic still needs more practice. Try the game lesson again.",
            secondaryMessage: "",
            buttonText: "Learn Again",
            buttonAction: "LEARN_AGAIN",
            progressValue: finalScore,
        };
    }

    // STATE 5: Learn Again (0.00 – 0.39)
    return {
        displayScore: finalScore,
        scoreLabel: "Your Progress",
        level: "again",
        badgeText: "Learn Again",
        badgeColor: "#ef4444",
        title: "Let's Learn Again",
        message: "This topic is still difficult. Go through the game lesson again and try once more.",
        secondaryMessage: "",
        buttonText: "Learn Again",
        buttonAction: "LEARN_AGAIN",
        progressValue: finalScore,
    };
}

// ── Friendly level icon ─────────────────────────────────────────────
function getLevelIcon(level) {
    const icons = {
        ready: '<i class="fa-solid fa-clipboard-check"></i>',
        strong: '<i class="fa-solid fa-circle-check"></i>',
        good: '<i class="fa-solid fa-arrow-trend-up"></i>',
        practice: '<i class="fa-solid fa-book-open"></i>',
        again: '<i class="fa-solid fa-rotate-left"></i>',
    };
    return icons[level] || '<i class="fa-solid fa-chart-simple"></i>';
}

// ── Render the main mastery/understanding check page ────────────────
export async function renderMastery(container) {
    currentContainer = container;

    container.innerHTML = `
        <div class="mastery-page">
            <h1>My Learning Progress</h1>
            <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
                Track your understanding after each game lesson
            </p>

            <div class="mastery-student-selector" id="mastery-student-selector">
                <label style="color: var(--text-secondary); font-size: 0.85rem; margin-right: 0.5rem;">Select Student:</label>
                <select class="input-field" id="student-select" style="width: auto; min-width: 200px; display: inline-block;">
                    <option value="">Loading students...</option>
                </select>
            </div>

            <div id="mastery-overview" class="mastery-overview hidden"></div>
            <div id="mastery-grid" class="mastery-grid">
                <p style="color: var(--text-secondary); text-align: center; padding: 3rem 0;">
                    Select a student to view their learning progress
                </p>
            </div>
        </div>
    `;

    await loadStudents();
}

async function loadStudents() {
    const select = document.getElementById("student-select");
    try {
        const data = await MasteryAPI.getStudents();
        const students = (data.students || []).map(normalizeStudent).filter(s => s.studentId);

        if (students.length === 0) {
            select.innerHTML = `<option value="">No students found</option>`;
            return;
        }

        // Student-friendly dropdown — no research scores in the label
        select.innerHTML = `<option value="">Choose a student</option>` +
            students.map(s => `
                <option value="${s.studentId}"
                        data-name="${s.studentName}">
                    ${s.studentName} (${s.studentId})
                </option>
            `).join("");

        select.addEventListener("change", () => {
            const studentId = select.value;
            if (studentId) {
                loadMasteryStatus(studentId);
            }
        });

        // Auto-select the first student
        if (students.length > 0) {
            select.value = students[0].studentId;
            loadMasteryStatus(students[0].studentId);
        }

    } catch (err) {
        select.innerHTML = `<option value="">Failed to load students</option>`;
    }
}

async function loadMasteryStatus(studentId) {
    const grid = document.getElementById("mastery-grid");
    const overview = document.getElementById("mastery-overview");

    grid.innerHTML = `<div style="text-align: center; padding: 2rem;"><div class="spinner"></div></div>`;

    try {
        const data = await MasteryAPI.getStatus(studentId);

        if (!data.found) {
            grid.innerHTML = `<p style="color: var(--accent-orange); text-align: center;">No data found for ${studentId}</p>`;
            return;
        }

        // Overview card — student-friendly
        overview.classList.remove("hidden");
        overview.innerHTML = `
            <div class="mastery-overview-card">
                <div class="mastery-overview-left">
                    <h2><i class="fa-solid fa-user-graduate" style="color: var(--accent-blue); margin-right: 0.5rem;"></i>${data.studentName}</h2>
                    <span style="color: var(--text-secondary); font-size: 0.85rem;">Learning Progress Overview</span>
                </div>
                <div class="mastery-overview-right">
                    <div class="mastery-overall-score" style="--ring-color: var(--accent-blue)">
                        <span class="mastery-overall-value">${(data.overall_mastery * 100).toFixed(0)}%</span>
                        <span class="mastery-overall-label">Overall</span>
                    </div>
                </div>
            </div>
        `;

        // Concept display names
        const conceptNames = {
            variables: "Variables",
            operators: "Operators",
            loops: "Loops",
            arrays: "Arrays",
            methods: "Methods",
        };

        const concepts = data.concepts || {};
        grid.innerHTML = Object.entries(concepts).map(([key, c]) => {
            const name = conceptNames[key] || key;

            // Map backend data to card state inputs
            // activityScore = evidence from prior components (mastery_score / evidenceScore)
            // mcqScore = mcqPostTestScore from backend
            // checkCompleted = whether post-test was done
            const activityScore = c.evidenceScore || c.mastery_score || 0;
            const mcqScore = c.mcqPostTestScore || 0;
            const checkCompleted = c.postTestCompleted || false;

            const card = calculateCardState({ activityScore, mcqScore, checkCompleted });
            const pct = (card.displayScore * 100).toFixed(0);
            const icon = getLevelIcon(card.level);
            const b = c.breakdown || {};

            // Build the breakdown section — student-friendly labels
            let breakdownHTML = "";
            if (!checkCompleted) {
                // Before check: show activity performance summary
                breakdownHTML = `
                    <div class="c4-breakdown">
                        <div class="c4-breakdown-row">
                            <span>Correctness</span>
                            <div class="c4-mini-bar">
                                <div class="c4-mini-fill" style="width: ${(b.correctness_score || 0) * 100}%; background: var(--accent-blue);"></div>
                            </div>
                            <span class="c4-breakdown-val">${((b.correctness_score || 0) * 100).toFixed(0)}%</span>
                        </div>
                        <div class="c4-breakdown-row">
                            <span>Efficiency</span>
                            <div class="c4-mini-bar">
                                <div class="c4-mini-fill" style="width: ${(b.attempt_score || 0) * 100}%; background: var(--accent-blue);"></div>
                            </div>
                            <span class="c4-breakdown-val">${((b.attempt_score || 0) * 100).toFixed(0)}%</span>
                        </div>
                        <div class="c4-breakdown-row">
                            <span>Quiz Score</span>
                            <div class="c4-mini-bar">
                                <div class="c4-mini-fill" style="width: ${(b.quiz_score || 0) * 100}%; background: var(--accent-blue);"></div>
                            </div>
                            <span class="c4-breakdown-val">${((b.quiz_score || 0) * 100).toFixed(0)}%</span>
                        </div>
                    </div>
                `;
            } else {
                // After check: show combined summary
                breakdownHTML = `
                    <div class="c4-breakdown">
                        <div class="c4-breakdown-row">
                            <span>Game Lesson</span>
                            <div class="c4-mini-bar">
                                <div class="c4-mini-fill" style="width: ${activityScore * 100}%; background: var(--accent-blue);"></div>
                            </div>
                            <span class="c4-breakdown-val">${(activityScore * 100).toFixed(0)}%</span>
                        </div>
                        <div class="c4-breakdown-row">
                            <span>Understanding Check</span>
                            <div class="c4-mini-bar">
                                <div class="c4-mini-fill" style="width: ${mcqScore * 100}%; background: ${card.badgeColor};"></div>
                            </div>
                            <span class="c4-breakdown-val">${(mcqScore * 100).toFixed(0)}%</span>
                        </div>
                    </div>
                `;
            }

            // Action button
            let actionButton = "";
            if (card.buttonAction === "START_CHECK") {
                actionButton = `
                    <button class="btn btn-primary c4-action-btn mastery-posttest-btn"
                            data-concept="${key}"
                            data-student="${studentId}"
                            data-mastery="${activityScore}"
                            data-state="${c.schema_state}">
                        ${card.buttonText}
                    </button>
                `;
            } else if (card.buttonAction === "DONE") {
                actionButton = `
                    <button class="btn c4-action-btn c4-btn-done mastery-done-btn">
                        <i class="fa-solid fa-check"></i> ${card.buttonText}
                    </button>
                `;
            } else if (card.buttonAction === "LEARN_AGAIN") {
                actionButton = `
                    <button class="btn btn-primary c4-action-btn mastery-learn-btn"
                            data-concept="${key}">
                        ${card.buttonText}
                    </button>
                `;
            }

            return `
                <div class="c4-concept-card" data-level="${card.level}">
                    <div class="c4-card-top">
                        <div class="c4-card-info">
                            <h3 class="c4-card-title">${name}</h3>
                            <span class="c4-level-badge" style="background-color: ${card.badgeColor}15; color: ${card.badgeColor}; border: 1px solid ${card.badgeColor}30;">
                                ${icon} ${card.badgeText}
                            </span>
                        </div>
                        <div class="c4-card-score" style="color: ${card.badgeColor}">
                            ${pct}<span class="c4-card-score-pct">%</span>
                        </div>
                    </div>

                    <div class="c4-progress-bar">
                        <div class="c4-progress-fill" style="width: ${pct}%; background: ${card.badgeColor};"></div>
                    </div>

                    ${breakdownHTML}

                    <div class="c4-message-box" style="border-left-color: ${card.badgeColor};">
                        <p>${card.message}</p>
                    </div>

                    ${actionButton}
                </div>
            `;
        }).join("");

        // ── Attach event handlers ────────────────────────────────────
        // Start Check → open MCQ
        document.querySelectorAll(".mastery-posttest-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const concept = btn.dataset.concept;
                const student = btn.dataset.student;
                const mastery = parseFloat(btn.dataset.mastery);
                const state = btn.dataset.state;

                renderPostTest(currentContainer, {
                    studentId: student,
                    concept: concept,
                    masteryScore: mastery,
                    schemaState: state,
                    onBack: () => renderMastery(currentContainer),
                });
            });
        });

        // Done → refresh dashboard
        document.querySelectorAll(".mastery-done-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                renderMastery(currentContainer);
            });
        });

        // Learn Again → navigate to gamified lesson
        document.querySelectorAll(".mastery-learn-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                redirectToGamifiedLesson(btn.dataset.concept);
            });
        });

    } catch (err) {
        grid.innerHTML = `<p style="color: var(--accent-orange); text-align: center;">Error: ${err.message}</p>`;
    }
}

// ── Navigate to the gamified lesson for a concept ───────────────────
function redirectToGamifiedLesson(concept) {
    const conceptToSection = {
        variables: "integer",
        operators: "integer",
        loops: "integer",
        arrays: "integer",
        methods: "string",
    };
    const section = conceptToSection[concept] || "integer";
    sessionStorage.setItem("codequest_menu_focus", section);

    const gamesLink = document.querySelector('.nav-link[data-page="games"]');
    gamesLink?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));

    const launchIdBySection = {
        integer: "launch-int-module-btn",
        float: "launch-float-module-btn",
        char: "launch-char-module-btn",
        string: "launch-string-module-btn",
    };
    const launchId = launchIdBySection[section] || launchIdBySection.integer;

    const startedAt = Date.now();
    const tryClick = () => {
        const btn = document.getElementById(launchId);
        if (btn) { btn.click(); return; }
        if (Date.now() - startedAt > 4000) return;
        setTimeout(tryClick, 100);
    };
    setTimeout(tryClick, 0);
}
