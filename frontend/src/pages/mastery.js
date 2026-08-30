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
let loadedStudents = [];

const fallbackStudents = [
    { studentId: "STU001", studentName: "Student 01", name: "Student 01", conceptName: "Loops", offline: true },
    { studentId: "STU002", studentName: "Student 02", name: "Student 02", conceptName: "Arrays", offline: true },
    { studentId: "STU003", studentName: "Student 03", name: "Student 03", conceptName: "Methods", offline: true },
];

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

function normalizeStudentsResponse(data) {
    const rawStudents = Array.isArray(data) ? data : (data?.students || []);
    return rawStudents.map(normalizeStudent).filter(s => s.studentId);
}

function clamp01(value, fallback = 0) {
    const num = Number(value);
    if (!Number.isFinite(num)) return fallback;
    const normalized = num > 1 ? num / 100 : num;
    return Math.max(0, Math.min(1, normalized));
}

function pctText(value) {
    return `${Math.round(clamp01(value) * 100)}%`;
}

function getSelectedStudent(studentId) {
    return loadedStudents.find(s => s.studentId === studentId) || normalizeStudent({ studentId });
}

function getFallbackStatus(studentId) {
    const student = getSelectedStudent(studentId);
    const conceptFocus = String(student.conceptName || "Loops").toLowerCase();
    const concepts = {
        loops: {
            conceptName: "Loops",
            mastery_score: 0.45,
            evidenceScore: 0.45,
            mcqPostTestScore: 0.70,
            postTestCompleted: true,
            preTestScore: 0.45,
            postTestScore: 0.70,
            predictedMasteryLevel: "Good Progress",
            nextAction: "DONE",
            levelConfidence: 0.86,
            actionConfidence: 0.91,
            schema_state: "Developing",
            breakdown: { correctness_score: 0.60, attempt_score: 0.55, quiz_score: 0.70 },
        },
        arrays: {
            conceptName: "Arrays",
            mastery_score: 0.40,
            evidenceScore: 0.40,
            mcqPostTestScore: 0.56,
            postTestCompleted: true,
            preTestScore: 0.40,
            postTestScore: 0.56,
            predictedMasteryLevel: "Needs More Practice",
            nextAction: "LEARN_AGAIN",
            levelConfidence: 0.78,
            actionConfidence: 0.86,
            schema_state: "Fragile",
            breakdown: { correctness_score: 0.50, attempt_score: 0.48, quiz_score: 0.56 },
        },
        methods: {
            conceptName: "Methods",
            mastery_score: 0.35,
            evidenceScore: 0.35,
            mcqPostTestScore: 0.62,
            postTestCompleted: true,
            preTestScore: 0.35,
            postTestScore: 0.62,
            predictedMasteryLevel: "Good Progress",
            nextAction: "DONE",
            levelConfidence: 0.80,
            actionConfidence: 0.87,
            schema_state: "Developing",
            breakdown: { correctness_score: 0.58, attempt_score: 0.45, quiz_score: 0.62 },
        },
    };
    const selectedConcepts = concepts[conceptFocus] ? { [conceptFocus]: concepts[conceptFocus] } : concepts;

    return {
        found: true,
        offline: true,
        studentName: student.studentName || student.name || studentId,
        studentId,
        overall_mastery: clamp01(Object.values(selectedConcepts)[0]?.mcqPostTestScore, 0.67),
        overall_state: Object.values(selectedConcepts)[0]?.schema_state || "Developing",
        concepts: selectedConcepts,
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
        let students = normalizeStudentsResponse(data);

        if (students.length === 0) {
            students = fallbackStudents.map(normalizeStudent);
        }
        loadedStudents = students;

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
        loadedStudents = fallbackStudents.map(normalizeStudent);
        select.innerHTML = `<option value="">Choose a student</option>` +
            loadedStudents.map(s => `
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

        select.value = loadedStudents[0].studentId;
        loadMasteryStatus(loadedStudents[0].studentId);
    }
}

async function loadMasteryStatus(studentId) {
    const grid = document.getElementById("mastery-grid");
    const overview = document.getElementById("mastery-overview");

    grid.innerHTML = `<div style="text-align: center; padding: 2rem;"><div class="spinner"></div></div>`;

    try {
        let data = await MasteryAPI.getStatus(studentId);

        if (!data.found) {
            data = getFallbackStatus(studentId);
        }
        const selectedStudent = getSelectedStudent(studentId);
        const studentName = data.studentName || selectedStudent.studentName || selectedStudent.name || studentId;

        // Overview card — student-friendly
        overview.classList.remove("hidden");
        overview.innerHTML = `
            <div class="mastery-overview-card">
                <div class="mastery-overview-left">
                    <h2><i class="fa-solid fa-user-graduate" style="color: var(--accent-blue); margin-right: 0.5rem;"></i>${studentName}</h2>
                    <span style="color: var(--text-secondary); font-size: 0.85rem;">Selected student: ${studentId}</span>
                </div>
                <div class="mastery-overview-right">
                    <div class="mastery-overall-score" style="--ring-color: var(--accent-blue)">
                        <span class="mastery-overall-value">${pctText(data.overall_mastery)}</span>
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

        let concepts = data.concepts || {};
        if (Object.keys(concepts).length === 0) {
            data = getFallbackStatus(studentId);
            concepts = data.concepts || {};
        }
        grid.innerHTML = Object.entries(concepts).map(([key, c]) => {
            const name = c.conceptName || conceptNames[key] || key;

            // Map backend data to card state inputs
            // activityScore = evidence from prior components (mastery_score / evidenceScore)
            // mcqScore = mcqPostTestScore from backend
            // checkCompleted = whether post-test was done
            const activityScore = clamp01(c.evidenceScore ?? c.mastery_score ?? c.preTestScore ?? c.pre_test_score ?? 0);
            const mcqScore = clamp01(c.mcqPostTestScore ?? c.postTestScore ?? c.post_test_score ?? 0);
            const checkCompleted = c.postTestCompleted || false;

            const card = calculateCardState({ activityScore, mcqScore, checkCompleted });
            const pct = (card.displayScore * 100).toFixed(0);
            const icon = getLevelIcon(card.level);
            const b = c.breakdown || {};
            const preTestScore = clamp01(c.preTestScore ?? c.pre_test_score ?? activityScore);
            const postTestScore = clamp01(c.postTestScore ?? c.post_test_score ?? mcqScore);
            const predictedLevel = c.predictedMasteryLevel || c.mastery_level || c.ml_prediction?.mastery_level || card.badgeText;
            const nextAction = c.nextAction || c.next_action || c.ml_prediction?.next_action || card.buttonAction;
            const levelConfidence = c.levelConfidence ?? c.level_confidence ?? c.ml_prediction?.level_confidence;
            const actionConfidence = c.actionConfidence ?? c.action_confidence ?? c.ml_prediction?.action_confidence;

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

            const predictionHTML = `
                <div class="c4-breakdown" style="margin-top: 0.75rem;">
                    <div class="c4-breakdown-row">
                        <span>Concept</span>
                        <span class="c4-breakdown-val">${name}</span>
                    </div>
                    <div class="c4-breakdown-row">
                        <span>Pre-test Score</span>
                        <span class="c4-breakdown-val">${pctText(preTestScore)}</span>
                    </div>
                    <div class="c4-breakdown-row">
                        <span>Post-test Score</span>
                        <span class="c4-breakdown-val">${pctText(postTestScore)}</span>
                    </div>
                    <div class="c4-breakdown-row">
                        <span>Predicted Level</span>
                        <span class="c4-breakdown-val">${predictedLevel}</span>
                    </div>
                    <div class="c4-breakdown-row">
                        <span>Next Action</span>
                        <span class="c4-breakdown-val">${nextAction}</span>
                    </div>
                    ${levelConfidence != null ? `
                        <div class="c4-breakdown-row">
                            <span>Level Confidence</span>
                            <span class="c4-breakdown-val">${pctText(levelConfidence)}</span>
                        </div>
                    ` : ""}
                    ${actionConfidence != null ? `
                        <div class="c4-breakdown-row">
                            <span>Action Confidence</span>
                            <span class="c4-breakdown-val">${pctText(actionConfidence)}</span>
                        </div>
                    ` : ""}
                </div>
            `;

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
                    ${predictionHTML}

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
        const data = getFallbackStatus(studentId);
        overview.classList.remove("hidden");
        overview.innerHTML = `
            <div class="mastery-overview-card">
                <div class="mastery-overview-left">
                    <h2><i class="fa-solid fa-user-graduate" style="color: var(--accent-blue); margin-right: 0.5rem;"></i>${data.studentName}</h2>
                    <span style="color: var(--text-secondary); font-size: 0.85rem;">Selected student: ${studentId}</span>
                </div>
                <div class="mastery-overview-right">
                    <div class="mastery-overall-score" style="--ring-color: var(--accent-blue)">
                        <span class="mastery-overall-value">${pctText(data.overall_mastery)}</span>
                        <span class="mastery-overall-label">Overall</span>
                    </div>
                </div>
            </div>
        `;
        grid.innerHTML = Object.entries(data.concepts || {}).map(([key, c]) => `
            <div class="c4-concept-card" data-level="good">
                <div class="c4-card-top">
                    <div class="c4-card-info">
                        <h3 class="c4-card-title">${c.conceptName || key}</h3>
                        <span class="c4-level-badge" style="background-color: #3b82f615; color: #3b82f6; border: 1px solid #3b82f630;">
                            <i class="fa-solid fa-arrow-trend-up"></i> ${c.predictedMasteryLevel}
                        </span>
                    </div>
                    <div class="c4-card-score" style="color: #3b82f6">
                        ${Math.round(clamp01(c.postTestScore) * 100)}<span class="c4-card-score-pct">%</span>
                    </div>
                </div>
                <div class="c4-progress-bar">
                    <div class="c4-progress-fill" style="width: ${pctText(c.postTestScore)}; background: #3b82f6;"></div>
                </div>
                <div class="c4-breakdown">
                    <div class="c4-breakdown-row"><span>Concept</span><span class="c4-breakdown-val">${c.conceptName || key}</span></div>
                    <div class="c4-breakdown-row"><span>Pre-test Score</span><span class="c4-breakdown-val">${pctText(c.preTestScore)}</span></div>
                    <div class="c4-breakdown-row"><span>Post-test Score</span><span class="c4-breakdown-val">${pctText(c.postTestScore)}</span></div>
                    <div class="c4-breakdown-row"><span>Predicted Level</span><span class="c4-breakdown-val">${c.predictedMasteryLevel}</span></div>
                    <div class="c4-breakdown-row"><span>Next Action</span><span class="c4-breakdown-val">${c.nextAction}</span></div>
                    <div class="c4-breakdown-row"><span>Level Confidence</span><span class="c4-breakdown-val">${pctText(c.levelConfidence)}</span></div>
                    <div class="c4-breakdown-row"><span>Action Confidence</span><span class="c4-breakdown-val">${pctText(c.actionConfidence)}</span></div>
                </div>
            </div>
        `).join("");
    }
}

// ── Navigate to the gamified lesson for a concept ───────────────────
function redirectToGamifiedLesson(concept) {
    // Map each mastery concept → Games page category → launch button ID
    const conceptToCategory = {
        variables: "variables",
        operators: "operators",
        loops:     "loops",
        arrays:    "arrays",
        methods:   "methods",
    };
    const categoryToLaunchBtn = {
        variables: "launch-int-module-btn",
        operators: "launch-operators-module-btn",
        loops:     "launch-loops-module-btn",
        arrays:    "launch-arrays-module-btn",
        methods:   "launch-stringmethods-module-btn",
    };
    const categoryToCategoryCardId = {
        variables: "category-variables",
        operators: "category-operators",
        loops:     "category-loops",
        arrays:    "category-arrays",
        methods:   "category-methods",
    };

    const category  = conceptToCategory[concept]  || "loops";
    const launchId  = categoryToLaunchBtn[category];
    const cardId    = categoryToCategoryCardId[category];

    // Step 1: Navigate to the Games page via the nav link
    const gamesLink = document.querySelector('.nav-link[data-page="games"]');
    gamesLink?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));

    // Step 2: After the Games page renders (category picker), click the right
    // category card so the module list (with the launch button) appears.
    // Step 3: Then click the actual launch button.
    const startedAt = Date.now();
    const tryLaunch = () => {
        // Phase A — wait for the category card and click it
        const categoryCard = document.getElementById(cardId);
        if (categoryCard) {
            categoryCard.click();
            // Phase B — now wait for the launch button and click it
            const tryClickLaunch = () => {
                const btn = document.getElementById(launchId);
                if (btn) { btn.click(); return; }
                if (Date.now() - startedAt > 5000) return;
                setTimeout(tryClickLaunch, 80);
            };
            setTimeout(tryClickLaunch, 0);
            return;
        }
        if (Date.now() - startedAt > 4000) return;
        setTimeout(tryLaunch, 80);
    };
    setTimeout(tryLaunch, 0);
}

