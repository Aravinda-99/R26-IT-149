/**
 * Dashboard Page
 * ===============
 * Shows a comprehensive overview of the learner's schema mastery status.
 * Displays stats, mastery chart, concept cards, and concepts needing review.
 */

import { MasteryAPI, AdaptiveAPI } from "../api/api.js";

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
    try {
        const data = await MasteryAPI.getStudents();
        const students = data.students || [];

        if (students.length === 0) {
            select.innerHTML = `<option value="">No students found</option>`;
            return;
        }

        select.innerHTML = students.map(s =>
            `<option value="${s.studentId}">${s.studentName} (${s.studentId})</option>`
        ).join("");

        select.addEventListener("change", () => {
            if (select.value) loadDashboardData(select.value);
        });

        // Auto-load first student
        loadDashboardData(students[0].studentId);

    } catch (err) {
        select.innerHTML = `<option value="">Failed to load</option>`;
        document.getElementById("dashboard-content").innerHTML =
            `<p style="color: var(--accent-orange); text-align: center;">Could not load student data</p>`;
    }
}

async function loadDashboardData(studentId) {
    const content = document.getElementById("dashboard-content");
    content.innerHTML = `<div style="text-align: center; padding: 2rem;"><div class="spinner"></div></div>`;

    try {
        const data = await MasteryAPI.getStatus(studentId);
        if (!data.found) {
            content.innerHTML = `<p style="color: var(--accent-orange); text-align: center;">No data found</p>`;
            return;
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

    } catch (err) {
        content.innerHTML = `<p style="color: var(--accent-orange); text-align: center;">Error loading dashboard: ${err.message}</p>`;
    }
}
