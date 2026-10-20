/**
 * Mastery Page — Component 4: Understanding Check Dashboard
 * ===========================================================
 * Shows concept-specific learning progress cards after gamified lessons.
 * Uses student-friendly language — no research terminology visible to students.
 *
 * Internal logic uses: evidenceScore, mcqUnderstandingScore, finalUnderstandingScore
 * Student sees:        progress %, friendly level badges, encouraging messages
 */

import { MasteryAPI, SchemaMasteryAPI } from "../api/api.js";
import { renderPostTest } from "./posttest.js";
import { getCurrentUser } from "../utils/auth.js";

// Short-lived client cache (60 seconds) to prevent redundant queries
const CACHE_TTL_MS = 60 * 1000;
const masteryCache = {
    students: { data: null, timestamp: 0 },
    status: {},
};

async function getCachedStudents() {
    const now = Date.now();
    if (masteryCache.students.data && (now - masteryCache.students.timestamp < CACHE_TTL_MS)) {
        return masteryCache.students.data;
    }
    const data = await MasteryAPI.getStudents();
    masteryCache.students = { data, timestamp: now };
    return data;
}

async function getCachedStatus(studentId) {
    const now = Date.now();
    if (masteryCache.status[studentId] && (now - masteryCache.status[studentId].timestamp < CACHE_TTL_MS)) {
        return masteryCache.status[studentId].data;
    }
    const data = await MasteryAPI.getStatus(studentId);
    masteryCache.status[studentId] = { data, timestamp: now };
    return data;
}

let currentContainer = null;
let loadedStudents = [];

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
    const grid = document.getElementById("mastery-grid");
    try {
        const [masteryRes, authRes, postTestRes] = await Promise.allSettled([
            MasteryAPI.getStudents(),
            fetch("/api/auth/users").then(r => r.json()).catch(() => ({ students: [] })),
            SchemaMasteryAPI.getPostTestResults(),
        ]);

        const masteryStudents = (masteryRes.status === "fulfilled" && masteryRes.value)
            ? (Array.isArray(masteryRes.value) ? masteryRes.value : (masteryRes.value.students || []))
            : [];
        const authStudents = (authRes.status === "fulfilled" && authRes.value?.students)
            ? authRes.value.students
            : [];
        const postTestResults = (postTestRes.status === "fulfilled" && postTestRes.value?.results)
            ? postTestRes.value.results
            : [];

        // Local storage registered students
        let localStudents = [];
        try {
            localStudents = JSON.parse(localStorage.getItem("codequest_registered_students") || "[]");
        } catch (e) {}

        const activeUser = getCurrentUser();
        if (activeUser && activeUser.role !== "teacher" && activeUser.role !== "admin") {
            localStudents.push(activeUser);
        }

        // Merge all real registered students
        const studentMap = new Map();

        authStudents.forEach(s => {
            const key = s.email || s.uid || s.id || s.studentId;
            if (key) studentMap.set(key, { ...s, studentId: s.uid || s.id || key, studentName: s.display_name || s.name || key });
        });

        masteryStudents.forEach(s => {
            const key = s.email || s.studentId || s.uid || s.id;
            if (key) {
                const existing = studentMap.get(key) || {};
                studentMap.set(key, { ...existing, ...s });
            }
        });

        localStudents.forEach(s => {
            const key = s.email || s.uid || s.id;
            if (key) {
                const existing = studentMap.get(key) || {};
                studentMap.set(key, {
                    ...existing,
                    studentId: s.uid || s.id || key,
                    studentName: s.name || s.displayName || s.display_name || existing.studentName || "Student",
                    email: s.email || existing.email,
                    created_at: s.joinedAt || s.created_at || existing.created_at,
                    ...s
                });
            }
        });

        postTestResults.forEach(r => {
            const key = r.student_email || r.student_id;
            if (key) {
                const existing = studentMap.get(key) || {};
                studentMap.set(key, {
                    ...existing,
                    studentId: r.student_id || existing.studentId || key,
                    studentName: r.student_name || existing.studentName || r.student_id || "Student",
                    email: r.student_email || existing.email,
                    overall_mastery: r.post_test_score ?? existing.overall_mastery ?? 0,
                    overall_state: r.learning_status || existing.overall_state || "Post-Test Submitted",
                    conceptName: r.concept_name,
                    postTestCompleted: true,
                    masteryLevel: r.mastery_level,
                    nextAction: r.next_action,
                    created_at: r.created_at || existing.created_at,
                });
            }
        });

        let students = Array.from(studentMap.values()).map(normalizeStudent).filter(s => s && (s.studentId || s.email));
        loadedStudents = students;

        if (students.length === 0) {
            if (select) select.innerHTML = `<option value="">No registered students found</option>`;
            if (grid) grid.innerHTML = `
                <div class="card" style="text-align: center; padding: 3rem 1rem; color: var(--text-secondary); background: #FFFFFF; border: 1px solid var(--border-color); grid-column: 1 / -1;">
                    <div style="font-size: 2.5rem; color: var(--text-muted); margin-bottom: 0.5rem;"><i class="fa-solid fa-user-slash"></i></div>
                    <h3 style="font-size: 1.1rem; color: var(--text-primary); margin-bottom: 0.3rem;">No Registered Students Found</h3>
                    <p style="font-size: 0.9rem; max-width: 400px; margin: 0 auto;">When students register or login, their profile will appear in this selector.</p>
                </div>
            `;
            return;
        }

        if (select) {
            // Student-friendly dropdown — no research scores in the label
            select.innerHTML = `<option value="">Choose a student</option>` +
                students.map(s => `
                    <option value="${s.studentId}"
                            data-name="${s.studentName}">
                        ${s.studentName} (${s.email ? s.email : s.studentId})
                    </option>
                `).join("");

            select.onchange = () => {
                const studentId = select.value;
                if (studentId) {
                    loadMasteryStatus(studentId);
                }
            };

            // Auto-select the first student
            if (students.length > 0) {
                select.value = students[0].studentId;
                loadMasteryStatus(students[0].studentId);
            }
        }

    } catch (err) {
        loadedStudents = [];
        if (select) select.innerHTML = `<option value="">No student records found</option>`;
        if (grid) grid.innerHTML = `
            <div class="card" style="text-align: center; padding: 3rem 1rem; color: var(--text-secondary); background: #FFFFFF; border: 1px solid var(--border-color); grid-column: 1 / -1;">
                <div style="font-size: 2.5rem; color: var(--text-muted); margin-bottom: 0.5rem;"><i class="fa-solid fa-user-clock"></i></div>
                <h3 style="font-size: 1.1rem; color: var(--text-primary); margin-bottom: 0.3rem;">No Student Submissions Yet</h3>
                <p style="font-size: 0.9rem; max-width: 400px; margin: 0 auto;">Student understanding check scores and mastery validations will appear here once registered students complete their post-tests.</p>
            </div>
        `;
    }
}

async function loadMasteryStatus(studentId) {
    const grid = document.getElementById("mastery-grid");
    const overview = document.getElementById("mastery-overview");

    grid.innerHTML = `<div style="text-align: center; padding: 2rem;"><div class="spinner"></div></div>`;

    try {
        let data = await getCachedStatus(studentId);

        if (!data || !data.found) {
            data = getFallbackStatus(studentId);
        }
        const selectedStudent = getSelectedStudent(studentId);
        const studentName = data.studentName || selectedStudent.studentName || selectedStudent.name || studentId;

        if (!data.found || !data.concepts || Object.keys(data.concepts).length === 0) {
            overview.classList.remove("hidden");
            overview.innerHTML = `
                <div class="mastery-overview-card">
                    <div class="mastery-overview-left">
                        <h2><i class="fa-solid fa-user-graduate" style="color: var(--accent-blue); margin-right: 0.5rem;"></i>${studentName}</h2>
                        <span style="color: var(--text-secondary); font-size: 0.85rem;">Registered Student ID: ${studentId}</span>
                    </div>
                    <div class="mastery-overview-right">
                        <div class="mastery-overall-score" style="--ring-color: #94A3B8">
                            <span class="mastery-overall-value">0%</span>
                            <span class="mastery-overall-label">Mastery</span>
                        </div>
                    </div>
                </div>
            `;
            grid.innerHTML = `
                <div class="card" style="text-align: center; padding: 3rem 1rem; color: var(--text-secondary); background: #FFFFFF; border: 1px solid var(--border-color); grid-column: 1 / -1;">
                    <div style="font-size: 2.2rem; color: var(--text-muted); margin-bottom: 0.5rem;"><i class="fa-solid fa-clipboard-question"></i></div>
                    <h3 style="font-size: 1.05rem; color: var(--text-primary); margin-bottom: 0.3rem;">No Concept Check Submissions Yet</h3>
                    <p style="font-size: 0.88rem; max-width: 440px; margin: 0 auto;">This student is registered in the database, but has not completed any game lessons or post-test understanding checks yet.</p>
                </div>
            `;
            return;
        }

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
        overview.classList.remove("hidden");
        overview.innerHTML = `
            <div class="mastery-overview-card">
                <div class="mastery-overview-left">
                    <h2><i class="fa-solid fa-user-graduate" style="color: var(--accent-blue); margin-right: 0.5rem;"></i>${studentId}</h2>
                    <span style="color: var(--text-secondary); font-size: 0.85rem;">Registered Student ID: ${studentId}</span>
                </div>
                <div class="mastery-overview-right">
                    <div class="mastery-overall-score" style="--ring-color: #94A3B8">
                        <span class="mastery-overall-value">0%</span>
                        <span class="mastery-overall-label">Mastery</span>
                    </div>
                </div>
            </div>
        `;
        grid.innerHTML = `
            <div class="card" style="text-align: center; padding: 3rem 1rem; color: var(--text-secondary); background: #FFFFFF; border: 1px solid var(--border-color); grid-column: 1 / -1;">
                <div style="font-size: 2.2rem; color: var(--text-muted); margin-bottom: 0.5rem;"><i class="fa-solid fa-clipboard-question"></i></div>
                <h3 style="font-size: 1.05rem; color: var(--text-primary); margin-bottom: 0.3rem;">No Active Submissions Recorded</h3>
                <p style="font-size: 0.88rem; max-width: 440px; margin: 0 auto;">No post-test or schema mastery data found in database for this student.</p>
            </div>
        `;
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
