/**
 * Dashboard Page
 * ===============
 * Shows a comprehensive overview of the learner's schema mastery status.
 * Displays stats, mastery chart, concept cards, and concepts needing review.
 */

import { MasteryAPI, AdaptiveAPI } from "../api/api.js";
import { renderPostTest } from "./posttest.js";

const MOCK_DASHBOARD_STUDENTS = [
    { studentId: "STU001", studentName: "Student 01 (Demo)", name: "Student 01" },
    { studentId: "STU002", studentName: "Student 02 (Demo)", name: "Student 02" },
    { studentId: "STU003", studentName: "Student 03 (Demo)", name: "Student 03" },
];

function getMockDashboardData(studentId) {
    return {
        found: true,
        offline: true,
        studentId: studentId || "STU001",
        studentName: studentId === "STU002" ? "Student 02" : (studentId === "STU003" ? "Student 03" : "Student 01"),
        overall_mastery: 0.68,
        overall_state: "Developing",
        overall_color: "#fbbf24",
        concepts: {
            variables: {
                conceptName: "Variables & Data Types",
                schema_state: "Stable",
                mastery_score: 0.85,
                needs_posttest: false,
                color: "#34d399",
                breakdown: { correctness_score: 0.88, attempt_score: 0.82, quiz_score: 0.85 },
            },
            operators: {
                conceptName: "Operators & Expressions",
                schema_state: "Developing",
                mastery_score: 0.72,
                needs_posttest: false,
                color: "#fbbf24",
                breakdown: { correctness_score: 0.75, attempt_score: 0.68, quiz_score: 0.73 },
            },
            loops: {
                conceptName: "Loops & Iteration",
                schema_state: "Fragile",
                mastery_score: 0.45,
                needs_posttest: true,
                color: "#f97316",
                breakdown: { correctness_score: 0.42, attempt_score: 0.48, quiz_score: 0.45 },
            },
            arrays: {
                conceptName: "Arrays & Lists",
                schema_state: "Developing",
                mastery_score: 0.64,
                needs_posttest: false,
                color: "#fbbf24",
                breakdown: { correctness_score: 0.65, attempt_score: 0.60, quiz_score: 0.67 },
            },
            methods: {
                conceptName: "Methods & Functions",
                schema_state: "Developing",
                mastery_score: 0.66,
                needs_posttest: false,
                color: "#fbbf24",
                breakdown: { correctness_score: 0.68, attempt_score: 0.62, quiz_score: 0.68 },
            },
        },
    };
}

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

export async function renderDashboard(container) {
    container.innerHTML = `
        <div class="dashboard-page">
            <div class="dashboard-header">
                <div>
                    <h1>CodeQuest - Learning Progress Dashboard</h1>
                    <p class="dashboard-subtitle">Track your Java programming journey across all concepts</p>
                </div>
            </div>

            <div class="dashboard-student-bar">
                <label class="dashboard-student-label">Viewing as:</label>
                <select class="input-field" id="dashboard-student-select" style="width: auto; min-width: 220px; display: inline-block;">
                    <option value="">Loading...</option>
                </select>
            </div>

            <div id="dashboard-content">
                <div style="text-align: center; padding: 3rem 0;"><div class="spinner"></div></div>
            </div>
        </div>
    `;

    await loadDashboardStudents();
}

async function loadDashboardStudents() {
    const select = document.getElementById("dashboard-student-select");
    let students = [];
    try {
        const data = await MasteryAPI.getStudents();
        students = (data.students || []).map(normalizeStudent).filter(s => s.studentId);
    } catch (err) {
        console.warn("[WARN] Could not load live student data, using mock dataset:", err.message);
        students = MOCK_DASHBOARD_STUDENTS;
    }

    if (students.length === 0) {
        students = MOCK_DASHBOARD_STUDENTS;
    }

    select.innerHTML = students.map(s =>
        `<option value="${s.studentId}">${s.studentName}</option>`
    ).join("");

    select.addEventListener("change", () => {
        if (select.value) loadDashboardData(select.value);
    });

    // Auto-load first student
    if (students.length > 0) {
        loadDashboardData(students[0].studentId);
    }
}

async function loadDashboardData(studentId) {
    const content = document.getElementById("dashboard-content");
    content.innerHTML = `<div style="text-align: center; padding: 2rem;"><div class="spinner"></div></div>`;

    let data = null;
    let isMock = false;
    try {
        data = await MasteryAPI.getStatus(studentId);
        if (!data || !data.found) {
            data = getMockDashboardData(studentId);
            isMock = true;
        }
    } catch (err) {
        console.warn("[WARN] Could not load live status, using mock data:", err.message);
        data = getMockDashboardData(studentId);
        isMock = true;
    }

        const concepts = data.concepts || {};
        const conceptEntries = Object.entries(concepts);

        // Calculate stats
        const stableCount = conceptEntries.filter(([, c]) => c.schema_state === "Stable").length;
        const needsReview = conceptEntries.filter(([, c]) => c.needs_posttest);
        const avgMastery = data.overall_mastery;

        const conceptNames = {
            variables: "Variables & Data Types",
            operators: "Operators & Expressions",
            loops: "Loops & Iteration",
            arrays: "Arrays & Lists",
            methods: "Methods & Functions",
        };

        // Build dynamic recommendations sorted by priority
        const statePriority = { Misconception: 0, Fragile: 1, Developing: 2, Stable: 3 };
        const sortedConcepts = [...conceptEntries].sort(([, a], [, b]) =>
            (statePriority[a.schema_state] ?? 4) - (statePriority[b.schema_state] ?? 4)
        );

        const recommendations = sortedConcepts.map(([key, c]) => {
            const name = conceptNames[key] || key;
            switch (c.schema_state) {
                case "Misconception":
                    return `<div class="dashboard-recommendation-item" data-priority="critical">
                        <span>⚠️ Critical: You have major misconceptions in <strong>${name}</strong>. Please redo the ${name} games immediately.</span>
                    </div>`;
                case "Fragile":
                    return `<div class="dashboard-recommendation-item" data-priority="warning">
                        <span>🔶 Warning: Your understanding of <strong>${name}</strong> is fragile. Practice more ${name} exercises.</span>
                    </div>`;
                case "Developing":
                    return `<div class="dashboard-recommendation-item" data-priority="developing">
                        <span>📈 Almost there! Keep practicing <strong>${name}</strong> to reach Stable level.</span>
                    </div>`;
                case "Stable":
                    return `<div class="dashboard-recommendation-item" data-priority="stable">
                        <span>✅ Great work! You have mastered <strong>${name}</strong>. Move on to the next topic.</span>
                    </div>`;
                default:
                    return `<div class="dashboard-recommendation-item" data-priority="unknown">
                        <span>ℹ️ No data yet for <strong>${name}</strong>.</span>
                    </div>`;
            }
        }).join("");

        // Determine Overall Mastery card color based on state
        const overallStateColor = {
            Stable: "#34d399",
            Developing: "#fbbf24",
            Fragile: "#f97316",
            Misconception: "#ef4444"
        }[data.overall_state] || data.overall_color;

        // Need Review card color
        const needReviewColor = needsReview.length > 0 ? "#f97316" : "#34d399";

        content.innerHTML = `
            <!-- Learning Journey Progress Pipeline -->
            <div class="dashboard-card" style="background: linear-gradient(135deg, rgba(99,102,241,0.12), rgba(56,189,248,0.06)); border: 1px solid rgba(99,102,241,0.3); border-radius: 0.8rem; padding: 1.5rem; margin-bottom: 1.8rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem; flex-wrap: wrap; gap: 0.5rem;">
                    <div>
                        <h3 style="font-size: 1.2rem; font-weight: 700; color: #a5b4fc; display: flex; align-items: center; gap: 0.5rem; margin: 0;">
                            <i class="fa-solid fa-route"></i> Student Adaptive Learning Journey
                        </h3>
                        <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 0.2rem;">
                            Four-component research framework: Diagnostic Pre-Test → Error Analysis → Gamified Lesson → Post-Test Validation
                        </p>
                    </div>
                    <span style="background: rgba(16,185,129,0.15); border: 1px solid #10b981; color: #34d399; font-size: 0.75rem; padding: 0.25rem 0.7rem; border-radius: 999px; font-weight: 700;">
                        <i class="fa-solid fa-circle-check" style="margin-right: 0.3rem;"></i> Post-Test Available
                    </span>
                </div>

                <!-- 4 Step Pipeline Grid -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                    <!-- Step 1 -->
                    <div style="background: var(--bg-dark, #0f121d); padding: 1rem; border-radius: 0.5rem; border: 1px solid rgba(16,185,129,0.4);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem;">
                            <span style="font-size: 0.75rem; color: #34d399; font-weight: 700;">COMPONENT 1</span>
                            <i class="fa-solid fa-circle-check" style="color: #34d399;"></i>
                        </div>
                        <div style="font-weight: 700; font-size: 0.95rem;">Diagnostic Pre-Test</div>
                        <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.2rem;">Weak Concept: <strong>Loops</strong> (45%)</div>
                    </div>

                    <!-- Step 2 -->
                    <div style="background: var(--bg-dark, #0f121d); padding: 1rem; border-radius: 0.5rem; border: 1px solid rgba(16,185,129,0.4);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem;">
                            <span style="font-size: 0.75rem; color: #34d399; font-weight: 700;">COMPONENT 2</span>
                            <i class="fa-solid fa-circle-check" style="color: #34d399;"></i>
                        </div>
                        <div style="font-weight: 700; font-size: 0.95rem;">Error Analysis</div>
                        <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.2rem;">Focus: <strong>LOOP_CONDITION_ERROR</strong></div>
                    </div>

                    <!-- Step 3 -->
                    <div style="background: var(--bg-dark, #0f121d); padding: 1rem; border-radius: 0.5rem; border: 1px solid rgba(16,185,129,0.4);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem;">
                            <span style="font-size: 0.75rem; color: #34d399; font-weight: 700;">COMPONENT 3</span>
                            <i class="fa-solid fa-circle-check" style="color: #34d399;"></i>
                        </div>
                        <div style="font-weight: 700; font-size: 0.95rem;">Gamified Lesson</div>
                        <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.2rem;">Loops & Iteration Lesson Completed</div>
                    </div>

                    <!-- Step 4 -->
                    <div style="background: var(--bg-dark, #0f121d); padding: 1rem; border-radius: 0.5rem; border: 2px solid #6366f1; box-shadow: 0 0 15px rgba(99,102,241,0.25);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem;">
                            <span style="font-size: 0.75rem; color: #818cf8; font-weight: 700;">COMPONENT 4</span>
                            <span style="font-size: 0.7rem; background: #6366f1; color: white; padding: 0.1rem 0.4rem; border-radius: 0.2rem; font-weight: 700;">ACTIVE</span>
                        </div>
                        <div style="font-weight: 700; font-size: 0.95rem; color: white;">Schema Post-Test</div>
                        <div style="font-size: 0.8rem; color: #a5b4fc; margin-top: 0.2rem;">15-Q ML Understanding Validation</div>
                    </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                    <span style="font-size: 0.85rem; color: var(--text-secondary);">
                        <i class="fa-solid fa-info-circle" style="color: #38bdf8; margin-right: 0.3rem;"></i>
                        Validate your understanding of <strong>Loops</strong> with 15 randomized questions.
                    </span>
                    <button class="btn btn-primary" id="dash-start-posttest-btn" style="background: linear-gradient(135deg, #6366f1, #4f46e5); padding: 0.7rem 1.6rem; font-weight: 700; border-radius: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fa-solid fa-graduation-cap"></i> Start Post-Test
                    </button>
                </div>
            </div>

            <!-- Component 4 Test Mode (Dev / Local Demo Card) -->
            <div class="dashboard-card" style="background: var(--card-bg, #181c28); border: 1px dashed rgba(168,85,247,0.6); border-radius: 0.8rem; padding: 1.4rem; margin-bottom: 1.8rem;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.8rem; flex-wrap: wrap; gap: 0.5rem;">
                    <div>
                        <h3 style="font-size: 1.1rem; font-weight: 700; color: #c084fc; display: flex; align-items: center; gap: 0.5rem; margin: 0;">
                            <i class="fa-solid fa-flask-vial"></i> Component 4 Test Mode
                        </h3>
                        <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 0.2rem;">
                            Use mock Component 1 and Component 2 evidence to test the post-learning validation flow.
                        </p>
                    </div>
                    <span style="background: rgba(168,85,247,0.15); border: 1px solid rgba(168,85,247,0.4); color: #d8b4fe; font-size: 0.75rem; padding: 0.2rem 0.6rem; border-radius: 0.3rem; font-weight: 600;">
                        Local Demo Mode
                    </span>
                </div>

                <div style="display: flex; flex-wrap: wrap; gap: 0.8rem; font-size: 0.8rem; color: #e2e8f0; background: var(--bg-dark, #0f121d); padding: 0.8rem 1rem; border-radius: 0.4rem; margin-bottom: 1rem;">
                    <span><strong>Student ID:</strong> S001</span> •
                    <span><strong>Concept:</strong> Loops</span> •
                    <span><strong>Pre-Test Score:</strong> 45%</span> •
                    <span><strong>Attempt Count:</strong> 3</span> •
                    <span><strong>Time:</strong> 360s</span> •
                    <span><strong>Error Type:</strong> LOOP_CONDITION_ERROR</span> •
                    <span><strong>Error Pattern Score:</strong> 0.40</span>
                </div>

                <div style="display: flex; justify-content: flex-end;">
                    <button class="btn" id="dash-mock-posttest-btn" style="background: linear-gradient(135deg, #9333ea, #7e22ce); color: white; padding: 0.6rem 1.4rem; font-weight: 600; border-radius: 0.4rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fa-solid fa-play"></i> Start Test Post-Test
                    </button>
                </div>
            </div>

            <!-- Dynamic Recommendations -->
            <div class="dashboard-card dashboard-recommendations-section">
                <h3 class="dashboard-card-title">Recommendations</h3>
                <div class="dashboard-recommendations-list">
                    ${recommendations}
                </div>
            </div>

            <!-- Stats Row -->
            <div class="dashboard-stats">
                <div class="dashboard-stat-card" style="--stat-accent: ${overallStateColor}">
                    <div class="dashboard-stat-value" style="color: ${overallStateColor}">${(avgMastery * 100).toFixed(1)}%</div>
                    <div class="dashboard-stat-label">Overall Mastery</div>
                    <div class="dashboard-stat-badge" data-state="${data.overall_state}">${data.overall_state}</div>
                </div>
                <div class="dashboard-stat-card">
                    <div class="dashboard-stat-value">${conceptEntries.length}</div>
                    <div class="dashboard-stat-label">Concepts Tracked</div>
                </div>
                <div class="dashboard-stat-card" style="--stat-accent: #34d399">
                    <div class="dashboard-stat-value">${stableCount}/${conceptEntries.length}</div>
                    <div class="dashboard-stat-label">Concepts Mastered</div>
                </div>
                <div class="dashboard-stat-card ${needsReview.length > 0 ? 'dashboard-stat-card--alert' : ''}" style="--stat-accent: ${needReviewColor}">
                    <div class="dashboard-stat-value" style="color: ${needReviewColor}">${needsReview.length}</div>
                    <div class="dashboard-stat-label">Need Review</div>
                </div>
            </div>

            <!-- Two Column Layout -->
            <div class="dashboard-columns">
                <!-- Left: Mastery Chart -->
                <div class="dashboard-card">
                    <h3 class="dashboard-card-title">Mastery by Concept</h3>
                    <div class="dashboard-bar-chart" id="dashboard-bar-chart">
                        ${conceptEntries.map(([key, c]) => {
                            const pct = (c.mastery_score * 100).toFixed(1);
                            const name = conceptNames[key] || key;
                            return `
                                <div class="dashboard-bar-row">
                                    <div class="dashboard-bar-label">${name}</div>
                                    <div class="dashboard-bar-track">
                                        <div class="dashboard-bar-fill" style="width: ${pct}%; background: ${c.color};" data-value="${pct}%"></div>
                                    </div>
                                    <div class="dashboard-bar-value" style="color: ${c.color}">${pct}%</div>
                                </div>
                            `;
                        }).join("")}
                    </div>
                </div>

                <!-- Right: Schema State Summary -->
                <div class="dashboard-card">
                    <h3 class="dashboard-card-title">Schema State Overview</h3>
                    <div class="dashboard-state-grid">
                        ${conceptEntries.map(([key, c]) => {
                            const name = conceptNames[key] || key;
                            const pctVal = (c.mastery_score * 100).toFixed(0);
                            // Determine trend icon based on history if available
                            let trendIcon = "";
                            if (c.history && c.history.length >= 2) {
                                const prev = c.history[c.history.length - 2];
                                const curr = c.mastery_score;
                                if (curr > prev) trendIcon = `<span class="dashboard-trend trend-up" title="Improving">↑</span>`;
                                else if (curr < prev) trendIcon = `<span class="dashboard-trend trend-down" title="Declining">↓</span>`;
                                else trendIcon = `<span class="dashboard-trend trend-stable" title="Stable">→</span>`;
                            }
                            return `
                                <div class="dashboard-state-row">
                                    <span class="dashboard-state-name">${name}</span>
                                    <div class="dashboard-state-right">
                                        <span class="posttest-state-badge" data-state="${c.schema_state}">${c.schema_state}</span>
                                        <span class="dashboard-state-pct" style="color: ${c.color}">${pctVal}%</span>
                                        ${trendIcon}
                                    </div>
                                </div>
                            `;
                        }).join("")}
                    </div>

                    <!-- State Legend -->
                    <div class="dashboard-legend">
                        <div class="dashboard-legend-item"><span class="dashboard-legend-dot" style="background: #34d399"></span> Stable</div>
                        <div class="dashboard-legend-item"><span class="dashboard-legend-dot" style="background: #fbbf24"></span> Developing</div>
                        <div class="dashboard-legend-item"><span class="dashboard-legend-dot" style="background: #f97316"></span> Fragile</div>
                        <div class="dashboard-legend-item"><span class="dashboard-legend-dot" style="background: #ef4444"></span> Misconception</div>
                    </div>
                </div>
            </div>

            <!-- Concepts Needing Review -->
            ${needsReview.length > 0 ? `
                <div class="dashboard-card dashboard-review-section">
                    <h3 class="dashboard-card-title">Concepts Needing Review</h3>
                    <p class="dashboard-review-desc">These concepts require further practice or a diagnostic post-test to validate understanding.</p>
                    <div class="dashboard-review-list">
                        ${needsReview.map(([key, c]) => {
                            const name = conceptNames[key] || key;
                            const pct = (c.mastery_score * 100).toFixed(1);
                            return `
                                <div class="dashboard-review-item" style="--review-color: ${c.color}">
                                    <div class="dashboard-review-info">
                                        <strong>${name}</strong>
                                        <div class="dashboard-review-meta">
                                            <span class="posttest-state-badge" data-state="${c.schema_state}">${c.schema_state}</span>
                                            <span class="dashboard-review-score">${pct}% mastery</span>
                                        </div>
                                    </div>
                                    <div class="dashboard-review-bars">
                                        <div class="dashboard-mini-bar">
                                            <span>Correctness</span>
                                            <div class="dashboard-mini-track"><div class="dashboard-mini-fill" style="width: ${(c.breakdown.correctness_score * 100)}%; background: ${c.color}"></div></div>
                                        </div>
                                        <div class="dashboard-mini-bar">
                                            <span>Quiz</span>
                                            <div class="dashboard-mini-track"><div class="dashboard-mini-fill" style="width: ${(c.breakdown.quiz_score * 100)}%; background: ${c.color}"></div></div>
                                        </div>
                                        <div class="dashboard-mini-bar">
                                            <span>Efficiency</span>
                                            <div class="dashboard-mini-track"><div class="dashboard-mini-fill" style="width: ${(c.breakdown.attempt_score * 100)}%; background: ${c.color}"></div></div>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join("")}
                    </div>
                </div>
            ` : `
                <div class="dashboard-card" style="text-align: center; padding: 2rem;">
                    <span style="font-size: 2rem;">&#10004;</span>
                    <p style="color: #34d399; font-weight: 600; margin-top: 0.5rem;">All concepts mastered!</p>
                    <p style="color: var(--text-secondary); font-size: 0.85rem;">No concepts need review at this time.</p>
                </div>
            `}

            <!-- Score Breakdown Table -->
            <div class="dashboard-card">
                <h3 class="dashboard-card-title">Detailed Score Breakdown</h3>
                <div class="dashboard-table-wrapper">
                    <table class="dashboard-table">
                        <thead>
                            <tr>
                                <th>Concept</th>
                                <th>Mastery</th>
                                <th>Correctness</th>
                                <th>Efficiency</th>
                                <th>Quiz</th>
                                <th>Errors</th>
                                <th>State</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${conceptEntries.map(([key, c]) => {
                                const name = conceptNames[key] || key;
                                const b = c.breakdown;
                                return `
                                    <tr>
                                        <td><strong>${name}</strong></td>
                                        <td style="color: ${c.color}; font-weight: 700;">${(c.mastery_score * 100).toFixed(1)}%</td>
                                        <td>${(b.correctness_score * 100).toFixed(0)}%</td>
                                        <td>${(b.attempt_score * 100).toFixed(0)}%</td>
                                        <td>${(b.quiz_score * 100).toFixed(0)}%</td>
                                        <td>${(b.error_pattern_score * 100).toFixed(0)}%</td>
                                        <td><span class="posttest-state-badge" data-state="${c.schema_state}">${c.schema_state}</span></td>
                                    </tr>
                                `;
                            }).join("")}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // Animate bars on load
        requestAnimationFrame(() => {
            document.querySelectorAll(".dashboard-bar-fill").forEach(bar => {
                const width = bar.style.width;
                bar.style.width = "0%";
                requestAnimationFrame(() => {
                    bar.style.transition = "width 0.8s ease-out";
                    bar.style.width = width;
                });
            });
        });

        // Wire Post-Test Launch Buttons
        const mainContainer = document.getElementById("page-container") || document.getElementById("app");

        document.getElementById("dash-start-posttest-btn")?.addEventListener("click", () => {
            renderPostTest(mainContainer, {
                studentId: studentId || "STU001",
                concept: "Loops",
                error_type: "LOOP_CONDITION_ERROR",
                pre_test_score: 0.45,
                attempt_count: 1,
                error_pattern_score: 0.40,
                onBack: () => renderDashboard(mainContainer),
            });
        });

        document.getElementById("dash-mock-posttest-btn")?.addEventListener("click", () => {
            renderPostTest(mainContainer, {
                studentId: "S001",
                concept: "Loops",
                error_type: "LOOP_CONDITION_ERROR",
                pre_test_score: 0.45,
                attempt_count: 3,
                time_taken_seconds: 360,
                error_pattern_score: 0.40,
                onBack: () => renderDashboard(mainContainer),
            });
        });
}

