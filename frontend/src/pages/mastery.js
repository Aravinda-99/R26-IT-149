/**
 * Mastery Page — Stage 1 & Stage 3
 * =================================
 * Shows schema mastery cards per concept with score breakdowns.
 * Includes a student selector and "Take Post-Test" buttons for concepts
 * that need diagnostic validation (Stage 2).
 */

import { MasteryAPI } from "../api/api.js";
import { renderPostTest } from "./posttest.js";

let currentContainer = null;

export async function renderMastery(container) {
    currentContainer = container;

    container.innerHTML = `
        <div class="mastery-page">
            <h1>Schema Mastery Tracker</h1>
            <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
                Conceptual mastery analysis based on learning behaviour
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
                    Select a student to view their mastery analysis
                </p>
            </div>
        </div>
    `;

    // Load student list
    await loadStudents();
}

async function loadStudents() {
    const select = document.getElementById("student-select");
    try {
        const data = await MasteryAPI.getStudents();
        const students = data.students || [];

        if (students.length === 0) {
            select.innerHTML = `<option value="">No students found</option>`;
            return;
        }

        select.innerHTML = `<option value="">Choose a student</option>` +
            students.map(s => `
                <option value="${s.studentId}"
                        data-name="${s.studentName}"
                        data-mastery="${s.overall_mastery}"
                        data-state="${s.overall_state}"
                        data-color="${s.overall_color}">
                    ${s.studentName} (${s.studentId}) | ${(s.overall_mastery * 100).toFixed(1)}% ${s.overall_state}
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

        // Overview section
        overview.classList.remove("hidden");
        overview.innerHTML = `
            <div class="mastery-overview-card">
                <div class="mastery-overview-left">
                    <h2>${data.studentName}</h2>
                    <span class="posttest-state-badge" data-state="${data.overall_state}">${data.overall_state}</span>
                </div>
                <div class="mastery-overview-right">
                    <div class="mastery-overall-score" style="--ring-color: ${data.overall_color}">
                        <span class="mastery-overall-value">${(data.overall_mastery * 100).toFixed(1)}%</span>
                        <span class="mastery-overall-label">Overall Mastery</span>
                    </div>
                </div>
            </div>
        `;

        // Concept cards
        const conceptNames = {
            variables: "Variables & Data Types",
            operators: "Operators & Expressions",
            loops: "Loops & Iteration",
            arrays: "Arrays & Lists",
            methods: "Methods & Functions",
        };

        const concepts = data.concepts || {};
        grid.innerHTML = Object.entries(concepts).map(([key, c]) => {
            const name = conceptNames[key] || key;
            const pct = (c.mastery_score * 100).toFixed(1);
            const b = c.breakdown;

            return `
                <div class="mastery-concept-card" style="--concept-color: ${c.color}">
                    <div class="mastery-card-header">
                        <div>
                            <h3 class="mastery-card-title">${name}</h3>
                            <span class="posttest-state-badge" data-state="${c.schema_state}">${c.schema_state}</span>
                        </div>
                        <div class="mastery-card-score" style="color: ${c.color}">${pct}%</div>
                    </div>

                    <div class="mastery-progress-bar">
                        <div class="mastery-progress-fill" style="width: ${pct}%; background: ${c.color}"></div>
                    </div>

                    <div class="mastery-breakdown">
                        <div class="mastery-breakdown-row">
                            <span>Correctness</span>
                            <span>${(b.correctness_score * 100).toFixed(0)}%</span>
                        </div>
                        <div class="mastery-breakdown-row">
                            <span>Attempt Efficiency</span>
                            <span>${(b.attempt_score * 100).toFixed(0)}%</span>
                        </div>
                        <div class="mastery-breakdown-row">
                            <span>Quiz Score</span>
                            <span>${(b.quiz_score * 100).toFixed(0)}%</span>
                        </div>
                        <div class="mastery-breakdown-row">
                            <span>Error Severity</span>
                            <span>${(b.error_pattern_score * 100).toFixed(0)}%</span>
                        </div>
                    </div>

                    ${c.needs_posttest ? `
                        <button class="btn btn-primary mastery-posttest-btn"
                                data-concept="${key}"
                                data-student="${studentId}"
                                data-mastery="${c.mastery_score}"
                                data-state="${c.schema_state}">
                            Take Diagnostic Post-Test
                        </button>
                    ` : `
                        <div class="mastery-validated">
                            <span>&#10004;</span> Schema validated, no post-test needed
                        </div>
                    `}
                </div>
            `;
        }).join("");

        // Attach post-test button handlers
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

    } catch (err) {
        grid.innerHTML = `<p style="color: var(--accent-orange); text-align: center;">Error: ${err.message}</p>`;
    }
}
