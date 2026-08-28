/**
 * GenerateQuestions Component — Teacher Question Drafting Tool
 * =============================================================
 * Allows educators to generate high-quality 4-tier diagnostic draft MCQs.
 * Enforces balanced distribution of correct options and 4 distinct quality tiers.
 */

import { SchemaMasteryAPI } from "../../api/api.js";

const CONCEPTS = ["Variables", "Operators", "Loops", "Arrays", "Methods"];
const QUESTION_TYPES = [
    "All Types (Balanced)",
    "Basic Understanding",
    "Code Output Prediction",
    "Error Recognition",
    "Application",
    "Transfer",
];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const ERROR_TYPES = [
    "UNKNOWN_ERROR",
    "LOOP_CONDITION_ERROR",
    "TYPE_MISMATCH",
    "INDEX_ERROR",
    "VARIABLE_SCOPE_ERROR",
    "SYNTAX_ERROR",
    "LOGIC_ERROR",
    "OFF_BY_ONE",
    "INFINITE_LOOP",
    "METHOD_SIGNATURE_ERROR",
    "RECURSION_ERROR",
];

export function renderGenerateQuestions(container, onNavigate) {
    container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 2rem; max-width: 960px; margin: 0 auto;">
            
            <!-- Header -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
                <div>
                    <h1 style="font-size: 1.75rem; font-weight: 800; color: #111827; letter-spacing: -0.02em;">
                        Generate Draft Post-Test Questions
                    </h1>
                    <p style="color: #6B7280; font-size: 0.9375rem; margin-top: 0.25rem;">
                        Generate concept-specific diagnostic questions with 4-tier answer quality labels for teacher review.
                    </p>
                </div>
            </div>

            <!-- Generator Form Card -->
            <div class="card" style="padding: 2rem;">
                <form id="gen-question-form">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem; margin-bottom: 1.5rem;">
                        
                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label" for="gen-concept">Programming Concept</label>
                            <select class="select-field" id="gen-concept" required>
                                ${CONCEPTS.map(c => `<option value="${c}" ${c === 'Loops' ? 'selected' : ''}>${c}</option>`).join("")}
                            </select>
                            <span class="form-help">Primary Java topic</span>
                        </div>

                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label" for="gen-type">Cognitive Level / Question Type</label>
                            <select class="select-field" id="gen-type">
                                ${QUESTION_TYPES.map(t => `<option value="${t}">${t}</option>`).join("")}
                            </select>
                            <span class="form-help">Bloom's taxonomy cognitive target</span>
                        </div>

                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label" for="gen-diff">Difficulty Level</label>
                            <select class="select-field" id="gen-diff">
                                ${DIFFICULTIES.map(d => `<option value="${d}" ${d === 'Medium' ? 'selected' : ''}>${d}</option>`).join("")}
                            </select>
                            <span class="form-help">Expected cognitive complexity</span>
                        </div>

                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label" for="gen-error">Target Error Misconception</label>
                            <select class="select-field" id="gen-error">
                                ${ERROR_TYPES.map(e => `<option value="${e}" ${e === 'LOOP_CONDITION_ERROR' ? 'selected' : ''}>${e}</option>`).join("")}
                            </select>
                            <span class="form-help">Specific bug pattern to assess</span>
                        </div>

                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label" for="gen-count">Batch Size (Question Count)</label>
                            <input type="number" id="gen-count" class="input-field" value="4" min="1" max="10" required />
                            <span class="form-help">Number of draft questions to generate (1-10)</span>
                        </div>
                    </div>

                    <div class="alert alert-info" style="margin-bottom: 1.5rem;">
                        <i class="fa-solid fa-circle-info" style="margin-top: 0.15rem;"></i>
                        <div>
                            <strong>Quality Assurance:</strong> Generated questions are automatically validated to ensure 4 distinct option qualities (<code>Correct</code>, <code>Nearly Correct</code>, <code>Wrong</code>, <code>Clearly Wrong</code>) with balanced answer position distribution across A, B, C, and D.
                        </div>
                    </div>

                    <div id="gen-msg-box" class="alert alert-success" style="display: none; margin-bottom: 1.5rem;"></div>

                    <div style="display: flex; justify-content: flex-end; gap: 1rem;">
                        <button type="submit" class="btn btn-primary btn-lg" id="gen-submit-btn">
                            <i class="fa-solid fa-plus-circle"></i> Generate Draft Batch
                        </button>
                    </div>
                </form>
            </div>

            <!-- Output Container for Generated Drafts -->
            <div id="gen-results-area" style="display: none; flex-direction: column; gap: 1.25rem;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h2 style="font-size: 1.25rem; font-weight: 700; color: #111827;">
                        Newly Generated Draft Questions
                    </h2>
                    <button class="btn btn-secondary btn-sm" id="go-to-pending-btn">
                        Go to Pending Review →
                    </button>
                </div>
                <div id="gen-cards-list" style="display: flex; flex-direction: column; gap: 1rem;"></div>
            </div>

        </div>
    `;

    const form = document.getElementById("gen-question-form");
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const concept = document.getElementById("gen-concept").value;
            const qTypeVal = document.getElementById("gen-type").value;
            const question_type = qTypeVal.startsWith("All") ? null : qTypeVal;
            const difficulty = document.getElementById("gen-diff").value;
            const target_error_type = document.getElementById("gen-error").value;
            const count = parseInt(document.getElementById("gen-count").value) || 4;

            const submitBtn = document.getElementById("gen-submit-btn");
            const msgBox = document.getElementById("gen-msg-box");
            const resultsArea = document.getElementById("gen-results-area");
            const cardsList = document.getElementById("gen-cards-list");

            if (msgBox) msgBox.style.display = "none";
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Generating & Validating Options...`;
            }

            try {
                const res = await SchemaMasteryAPI.generateQuestions({
                    concept_name: concept,
                    question_type: question_type,
                    difficulty: difficulty,
                    target_error_type: target_error_type,
                    count: count,
                });

                if (res.success && res.questions) {
                    if (msgBox) {
                        msgBox.className = "alert alert-success";
                        msgBox.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${res.message || `Successfully generated ${res.count} draft questions in PENDING status.`}`;
                        msgBox.style.display = "flex";
                    }

                    // Render generated cards preview
                    if (resultsArea && cardsList) {
                        resultsArea.style.display = "flex";
                        cardsList.innerHTML = res.questions.map((q, idx) => `
                            <div class="card" style="padding: 1.25rem;">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                                    <div>
                                        <span class="badge badge-primary" style="margin-right: 0.4rem;">${q.concept_name}</span>
                                        <span class="badge badge-info">${q.question_type}</span>
                                        <span style="font-size: 0.75rem; font-family: var(--font-mono); color: #6B7280; margin-left: 0.5rem;">${q.question_id}</span>
                                    </div>
                                    <span class="badge badge-warning">PENDING REVIEW</span>
                                </div>
                                <div style="font-weight: 600; color: #111827; margin-bottom: 0.5rem;">${escapeHtml(q.question_text)}</div>
                                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; font-size: 0.8125rem;">
                                    <div style="background: ${q.correct_option === 'A' ? '#ECFDF5' : '#F9FAFB'}; padding: 0.4rem 0.6rem; border-radius: 6px; border: 1px solid ${q.correct_option === 'A' ? '#A7F3D0' : '#E5E7EB'};">
                                        <strong>A:</strong> ${escapeHtml(q.option_a)} <span class="badge ${q.option_a_quality === 'Correct' ? 'badge-success' : 'badge-muted'}" style="font-size: 0.65rem;">${q.option_a_quality}</span>
                                    </div>
                                    <div style="background: ${q.correct_option === 'B' ? '#ECFDF5' : '#F9FAFB'}; padding: 0.4rem 0.6rem; border-radius: 6px; border: 1px solid ${q.correct_option === 'B' ? '#A7F3D0' : '#E5E7EB'};">
                                        <strong>B:</strong> ${escapeHtml(q.option_b)} <span class="badge ${q.option_b_quality === 'Correct' ? 'badge-success' : 'badge-muted'}" style="font-size: 0.65rem;">${q.option_b_quality}</span>
                                    </div>
                                    <div style="background: ${q.correct_option === 'C' ? '#ECFDF5' : '#F9FAFB'}; padding: 0.4rem 0.6rem; border-radius: 6px; border: 1px solid ${q.correct_option === 'C' ? '#A7F3D0' : '#E5E7EB'};">
                                        <strong>C:</strong> ${escapeHtml(q.option_c)} <span class="badge ${q.option_c_quality === 'Correct' ? 'badge-success' : 'badge-muted'}" style="font-size: 0.65rem;">${q.option_c_quality}</span>
                                    </div>
                                    <div style="background: ${q.correct_option === 'D' ? '#ECFDF5' : '#F9FAFB'}; padding: 0.4rem 0.6rem; border-radius: 6px; border: 1px solid ${q.correct_option === 'D' ? '#A7F3D0' : '#E5E7EB'};">
                                        <strong>D:</strong> ${escapeHtml(q.option_d)} <span class="badge ${q.option_d_quality === 'Correct' ? 'badge-success' : 'badge-muted'}" style="font-size: 0.65rem;">${q.option_d_quality}</span>
                                    </div>
                                </div>
                            </div>
                        `).join("");
                    }
                }
            } catch (err) {
                if (msgBox) {
                    msgBox.className = "alert alert-danger";
                    msgBox.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Generation failed: ${err.message}`;
                    msgBox.style.display = "flex";
                }
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = `<i class="fa-solid fa-plus-circle"></i> Generate Draft Batch`;
                }
            }
        });
    }

    document.getElementById("go-to-pending-btn")?.addEventListener("click", () => {
        if (onNavigate) onNavigate("/teacher/questions/pending");
    });
}

function escapeHtml(text) {
    if (!text) return "";
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
