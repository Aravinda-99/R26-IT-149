/**
 * GenerateQuestions Component — Teacher Question Drafting & Assessment Builder
 * ==============================================================================
 * Enterprise curriculum assessment drafting interface with 3 generation workflows:
 *   1. Curriculum Pack Generator (Full multi-concept balanced pack generation)
 *   2. Single Batch Generator (Granular targeting by concept, type, difficulty, error)
 *   3. Bank Coverage & Gaps (Assessment bank health analytics & targeted deficit filling)
 */

import { SchemaMasteryAPI } from "../../api/api.js";

const CONCEPTS = ["Variables", "Operators", "Loops", "Arrays", "Methods"];

const CONCEPT_ERROR_MAP = {
    "Variables": [
        "VARIABLE_SCOPE_ERROR",
        "TYPE_MISMATCH",
        "UNINITIALIZED_VARIABLE",
        "SYNTAX_ERROR",
        "LOGIC_ERROR",
    ],
    "Operators": [
        "TYPE_MISMATCH",
        "OPERATOR_PRECEDENCE_ERROR",
        "LOGIC_ERROR",
        "SYNTAX_ERROR",
    ],
    "Loops": [
        "LOOP_CONDITION_ERROR",
        "OFF_BY_ONE",
        "INFINITE_LOOP",
        "LOGIC_ERROR",
        "SYNTAX_ERROR",
    ],
    "Arrays": [
        "INDEX_ERROR",
        "OFF_BY_ONE",
        "ARRAY_BOUNDS_ERROR",
        "TYPE_MISMATCH",
        "LOGIC_ERROR",
    ],
    "Methods": [
        "METHOD_SIGNATURE_ERROR",
        "PARAMETER_MISMATCH",
        "RETURN_TYPE_ERROR",
        "VARIABLE_SCOPE_ERROR",
        "RECURSION_ERROR",
        "LOGIC_ERROR",
        "SYNTAX_ERROR",
    ],
};

const CONCEPT_ICONS = {
    "Variables": "fa-code",
    "Operators": "fa-calculator",
    "Loops": "fa-repeat",
    "Arrays": "fa-layer-group",
    "Methods": "fa-diagram-project",
};

const QUESTION_TYPES = [
    "All Types (Balanced)",
    "Basic Understanding",
    "Code Output Prediction",
    "Error Recognition",
    "Application",
    "Transfer",
];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];

export function renderGenerateQuestions(container, onNavigate) {
    let activeTab = "balanced"; // "balanced" | "manual" | "gaps"

    // Balanced Pack State
    let selectedConcepts = new Set(CONCEPTS);
    let questionsPerConcept = 15;

    // Manual Form State
    let manualConcept = "Loops";

    // Gaps State
    let coverageData = null;
    let loadingCoverage = false;

    function renderView() {
        container.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 1.75rem; max-width: 1040px; margin: 0 auto;">
                
                <!-- Page Header -->
                <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
                    <div>
                        <h1 style="font-size: 1.5rem; font-weight: 700; color: #0F172A; letter-spacing: -0.02em;">
                            Question Bank Generator
                        </h1>
                        <p style="color: #64748B; font-size: 0.875rem; margin-top: 0.25rem;">
                            Draft diagnostic assessment items for Java schema mastery post-tests. Items are staged in the review queue before approval.
                        </p>
                    </div>

                    <button class="btn btn-secondary btn-sm" id="header-pending-btn" style="font-weight: 600; gap: 0.4rem;">
                        <i class="fa-solid fa-inbox" style="color: #475569;"></i>
                        <span>Pending Review Queue</span>
                    </button>
                </div>

                <!-- Navigation Tabs -->
                <div style="display: flex; border-bottom: 1px solid #E2E8F0; gap: 1.5rem; margin-bottom: -0.5rem;">
                    <button class="btn-clean-tab ${activeTab === 'balanced' ? 'active' : ''}" data-tab="balanced">
                        <i class="fa-solid fa-boxes-stacked" style="margin-right: 0.4rem;"></i> Curriculum Pack Generator
                    </button>

                    <button class="btn-clean-tab ${activeTab === 'manual' ? 'active' : ''}" data-tab="manual">
                        <i class="fa-solid fa-sliders" style="margin-right: 0.4rem;"></i> Single Batch Generator
                    </button>

                    <button class="btn-clean-tab ${activeTab === 'gaps' ? 'active' : ''}" data-tab="gaps">
                        <i class="fa-solid fa-table-cells" style="margin-right: 0.4rem;"></i> Bank Coverage & Gaps
                    </button>
                </div>

                <!-- Tab Content Area -->
                <div id="gen-tab-content">
                    ${activeTab === 'balanced' ? renderBalancedTab() : (activeTab === 'manual' ? renderManualTab() : renderGapsTab())}
                </div>

                <!-- Dynamic Output Container -->
                <div id="gen-results-area" style="display: none; flex-direction: column; gap: 1.25rem;"></div>

            </div>
        `;

        // Inject clean tab styling if not already present
        if (!document.getElementById("clean-tab-styles")) {
            const style = document.createElement("style");
            style.id = "clean-tab-styles";
            style.textContent = `
                .btn-clean-tab {
                    background: none;
                    border: none;
                    border-bottom: 2px solid transparent;
                    padding: 0.65rem 0.25rem;
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #64748B;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    transition: all 150ms ease;
                }
                .btn-clean-tab:hover {
                    color: #0F172A;
                }
                .btn-clean-tab.active {
                    color: #1E40AF;
                    border-bottom-color: #1E40AF;
                }
                .concept-toggle-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0.75rem 1rem;
                    border: 1px solid #E2E8F0;
                    border-radius: 8px;
                    background: #FFFFFF;
                    cursor: pointer;
                    transition: border-color 150ms ease, background 150ms ease;
                }
                .concept-toggle-row:hover {
                    border-color: #CBD5E1;
                }
                .concept-toggle-row.selected {
                    border-color: #1E40AF;
                    background: #F8FAFC;
                }
            `;
            document.head.appendChild(style);
        }

        attachCommonListeners();
        if (activeTab === "balanced") attachBalancedListeners();
        else if (activeTab === "manual") attachManualListeners();
        else if (activeTab === "gaps") attachGapsListeners();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TAB 1: Curriculum Pack Generator
    // ─────────────────────────────────────────────────────────────────────────
    function renderBalancedTab() {
        const totalDraftCount = selectedConcepts.size * questionsPerConcept;

        return `
            <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                
                <div class="card" style="padding: 1.75rem;">
                    
                    <!-- Section 1: Concept Selection -->
                    <div style="margin-bottom: 1.5rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                            <label class="form-label" style="font-size: 0.875rem; font-weight: 700; color: #0F172A; margin-bottom: 0;">
                                1. Target Curriculum Concepts
                            </label>
                            <div style="display: flex; gap: 0.5rem;">
                                <button type="button" class="btn btn-subtle btn-sm" id="select-all-concepts-btn" style="font-size: 0.75rem; font-weight: 600; color: #1E40AF;">
                                    Select All
                                </button>
                                <button type="button" class="btn btn-subtle btn-sm" id="clear-all-concepts-btn" style="font-size: 0.75rem; font-weight: 600; color: #64748B;">
                                    Clear All
                                </button>
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem;" id="concept-multiselect-grid">
                            ${CONCEPTS.map(c => {
                                const isSel = selectedConcepts.has(c);
                                return `
                                    <div class="concept-toggle-row ${isSel ? 'selected' : ''}" data-concept="${c}">
                                        <div style="display: flex; align-items: center; gap: 0.65rem;">
                                            <i class="fa-solid ${CONCEPT_ICONS[c]}" style="color: ${isSel ? '#1E40AF' : '#64748B'}; font-size: 0.875rem;"></i>
                                            <div>
                                                <div style="font-size: 0.875rem; font-weight: 600; color: ${isSel ? '#0F172A' : '#475569'};">${c}</div>
                                                <div style="font-size: 0.7rem; color: #94A3B8;">${CONCEPT_ERROR_MAP[c].length} error patterns</div>
                                            </div>
                                        </div>
                                        <input type="checkbox" ${isSel ? 'checked' : ''} style="cursor: pointer; accent-color: #1E40AF;" />
                                    </div>
                                `;
                            }).join("")}
                        </div>
                    </div>

                    <!-- Section 2: Count Per Concept -->
                    <div style="margin-bottom: 1.5rem;">
                        <label class="form-label" style="font-size: 0.875rem; font-weight: 700; color: #0F172A; margin-bottom: 0.5rem;">
                            2. Volume Per Concept
                        </label>
                        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;" id="q-per-concept-selector">
                            ${[10, 15, 20, 30].map(cnt => `
                                <button type="button" class="btn ${questionsPerConcept === cnt ? 'btn-primary' : 'btn-secondary'} q-count-pill" data-count="${cnt}" style="font-size: 0.8125rem; font-weight: 600; padding: 0.5rem 1rem;">
                                    ${cnt} Questions ${cnt === 15 ? '<span style="font-size: 0.7rem; opacity: 0.8; margin-left: 0.25rem;">(Standard)</span>' : ''}
                                </button>
                            `).join("")}
                        </div>
                        <span class="form-help">Standard assessment set consists of 15 questions per concept.</span>
                    </div>

                    <!-- Section 3: Assessment Specification Preview -->
                    <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 1.25rem; margin-bottom: 1.5rem;">
                        <div style="font-size: 0.75rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem;">
                            Assessment Specification Blueprint
                        </div>

                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.25rem; font-size: 0.8125rem;">
                            <div>
                                <div style="font-weight: 600; color: #0F172A; margin-bottom: 0.35rem;">Cognitive Mix:</div>
                                <ul style="list-style: none; padding: 0; margin: 0; color: #475569; line-height: 1.6;">
                                    <li>• <strong>${Math.round(4/15 * questionsPerConcept)}</strong> Basic Understanding</li>
                                    <li>• <strong>${Math.round(4/15 * questionsPerConcept)}</strong> Code Output Prediction</li>
                                    <li>• <strong>${Math.round(3/15 * questionsPerConcept)}</strong> Error Recognition</li>
                                    <li>• <strong>${Math.round(2/15 * questionsPerConcept)}</strong> Application</li>
                                    <li>• <strong>${Math.round(2/15 * questionsPerConcept)}</strong> Transfer</li>
                                </ul>
                            </div>

                            <div>
                                <div style="font-weight: 600; color: #0F172A; margin-bottom: 0.35rem;">Difficulty Distribution:</div>
                                <ul style="list-style: none; padding: 0; margin: 0; color: #475569; line-height: 1.6;">
                                    <li>• Easy (30%): ~${Math.round(0.3 * questionsPerConcept)} items</li>
                                    <li>• Medium (50%): ~${Math.round(0.5 * questionsPerConcept)} items</li>
                                    <li>• Hard (20%): ~${Math.round(0.2 * questionsPerConcept)} items</li>
                                </ul>
                            </div>

                            <div>
                                <div style="font-weight: 600; color: #0F172A; margin-bottom: 0.35rem;">Option Validation Rules:</div>
                                <p style="margin: 0; color: #64748B; line-height: 1.5;">
                                    4-Tier quality scoring (Correct: 1.0, Nearly Correct: 0.5, Wrong: 0.0, Clearly Wrong: 0.0). Correct option keys are distributed across positions A, B, C, and D.
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Action Bar -->
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; border-top: 1px solid #E2E8F0; padding-top: 1.25rem;">
                        <div style="font-size: 0.875rem; color: #475569;">
                            Target Volume: <strong style="color: #0F172A; font-size: 1rem;">${totalDraftCount} Questions</strong> 
                            <span>(${selectedConcepts.size} concepts × ${questionsPerConcept} questions)</span>
                        </div>

                        <button type="button" class="btn btn-primary" id="gen-balanced-btn" ${selectedConcepts.size === 0 ? 'disabled' : ''} style="font-weight: 600; padding: 0.65rem 1.5rem;">
                            <i class="fa-solid fa-play" style="font-size: 0.75rem; margin-right: 0.4rem;"></i> Generate Question Pack
                        </button>
                    </div>

                </div>

            </div>
        `;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TAB 2: Single Batch Generator
    // ─────────────────────────────────────────────────────────────────────────
    function renderManualTab() {
        const errorOptions = CONCEPT_ERROR_MAP[manualConcept] || CONCEPT_ERROR_MAP["Loops"];

        return `
            <div class="card" style="padding: 1.75rem;">
                <form id="manual-gen-form">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem; margin-bottom: 1.5rem;">
                        
                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label" for="manual-concept">Concept Topic</label>
                            <select class="select-field" id="manual-concept" required>
                                ${CONCEPTS.map(c => `<option value="${c}" ${c === manualConcept ? 'selected' : ''}>${c}</option>`).join("")}
                            </select>
                        </div>

                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label" for="manual-type">Cognitive Level / Question Type</label>
                            <select class="select-field" id="manual-type">
                                ${QUESTION_TYPES.map(t => `<option value="${t}">${t}</option>`).join("")}
                            </select>
                        </div>

                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label" for="manual-diff">Difficulty</label>
                            <select class="select-field" id="manual-diff">
                                ${DIFFICULTIES.map(d => `<option value="${d}" ${d === 'Medium' ? 'selected' : ''}>${d}</option>`).join("")}
                            </select>
                        </div>

                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label" for="manual-error">Target Misconception Pattern</label>
                            <select class="select-field" id="manual-error">
                                <option value="UNKNOWN_ERROR">General Misconception (Default)</option>
                                ${errorOptions.map(e => `<option value="${e}">${e}</option>`).join("")}
                            </select>
                            <span class="form-help">Scoped for ${manualConcept}</span>
                        </div>

                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label" for="manual-count">Batch Size</label>
                            <input type="number" id="manual-count" class="input-field" value="4" min="1" max="10" required />
                            <span class="form-help">Quantity (1 to 10)</span>
                        </div>
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #E2E8F0; padding-top: 1.25rem;">
                        <span style="font-size: 0.8125rem; color: #64748B;">
                            Generated items will be staged as <code>PENDING</code> for verification.
                        </span>
                        <button type="submit" class="btn btn-primary" id="manual-submit-btn" style="font-weight: 600;">
                            <i class="fa-solid fa-plus" style="margin-right: 0.35rem;"></i> Generate Batch
                        </button>
                    </div>
                </form>
            </div>
        `;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TAB 3: Bank Coverage & Gaps
    // ─────────────────────────────────────────────────────────────────────────
    function renderGapsTab() {
        if (loadingCoverage) {
            return `
                <div class="card" style="text-align: center; padding: 3rem 1rem;">
                    <div class="spinner" style="margin-bottom: 1rem;"></div>
                    <div style="font-size: 0.875rem; color: #64748B;">Evaluating question bank coverage matrix...</div>
                </div>
            `;
        }

        if (!coverageData) {
            return `
                <div class="card" style="text-align: center; padding: 2.5rem 1rem;">
                    <button class="btn btn-primary" id="retry-coverage-btn">
                        <i class="fa-solid fa-rotate-right"></i> Load Coverage Matrix
                    </button>
                </div>
            `;
        }

        const summary = coverageData.summary || {};
        const gaps = coverageData.gaps_list || [];
        const conceptsCov = coverageData.concepts_coverage || {};

        return `
            <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                
                <!-- Stat Cards -->
                <div class="stat-card-grid">
                    <div class="stat-card">
                        <div class="stat-card-label">Active Approved Bank</div>
                        <div class="stat-card-val" style="color: #0F172A;">${summary.total_approved || 0}</div>
                        <div class="stat-card-desc">Active post-test questions</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-card-label">Pending Review Queue</div>
                        <div class="stat-card-val" style="color: #D97706;">${summary.total_pending || 0}</div>
                        <div class="stat-card-desc">Awaiting teacher verification</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-card-label">Sufficient Coverage Areas</div>
                        <div class="stat-card-val" style="color: #059669;">${summary.healthy_areas || 0}</div>
                        <div class="stat-card-desc">Meets recommended targets</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-card-label">Identified Deficit Slots</div>
                        <div class="stat-card-val" style="color: ${gaps.length > 0 ? '#DC2626' : '#059669'};">${gaps.length}</div>
                        <div class="stat-card-desc">${gaps.length > 0 ? 'Action needed' : 'All targets met'}</div>
                    </div>
                </div>

                <!-- Action Card -->
                <div class="card" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; background: #FFFFFF; border-left: 4px solid ${gaps.length > 0 ? '#D97706' : '#059669'};">
                    <div>
                        <div style="font-size: 0.9375rem; font-weight: 700; color: #0F172A;">
                            ${gaps.length > 0 ? `${gaps.length} Deficit Slots Detected in Approved Bank` : 'Question Bank Meets Recommended Coverage Targets'}
                        </div>
                        <p style="font-size: 0.8125rem; color: #64748B; margin-top: 0.2rem;">
                            ${gaps.length > 0 ? 'Generate targeted questions specifically addressing missing cognitive types or bug patterns.' : 'All concepts maintain a balanced distribution across cognitive levels and error types.'}
                        </p>
                    </div>

                    <div style="display: flex; gap: 0.5rem;">
                        <button type="button" class="btn btn-secondary btn-sm" id="refresh-coverage-btn">
                            <i class="fa-solid fa-rotate-right"></i> Refresh
                        </button>
                        ${gaps.length > 0 ? `
                            <button type="button" class="btn btn-primary btn-sm" id="fill-all-gaps-btn">
                                <i class="fa-solid fa-plus"></i> Generate Deficit Drafts (${gaps.length})
                            </button>
                        ` : ''}
                    </div>
                </div>

                <!-- Matrix Table -->
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th style="width: 140px;">Concept</th>
                                <th style="width: 90px; text-align: center;">Approved</th>
                                <th style="width: 90px; text-align: center;">Pending</th>
                                <th>Cognitive Distribution (Approved / Target)</th>
                                <th>Error Patterns Coverage</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${CONCEPTS.map(c => {
                                const data = conceptsCov[c] || {};
                                const types = data.question_types || [];
                                const errors = data.error_types || [];
                                return `
                                    <tr>
                                        <td>
                                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                                <i class="fa-solid ${CONCEPT_ICONS[c]}" style="color: #475569; font-size: 0.8rem;"></i>
                                                <strong style="color: #0F172A;">${c}</strong>
                                            </div>
                                        </td>
                                        <td style="text-align: center; font-weight: 600; color: #0F172A;">${data.total_approved || 0}</td>
                                        <td style="text-align: center; font-weight: 600; color: #D97706;">${data.total_pending || 0}</td>
                                        <td>
                                            <div style="display: flex; flex-wrap: wrap; gap: 0.35rem;">
                                                ${types.map(t => `
                                                    <span class="badge ${t.status === 'OK' ? 'badge-success' : (t.status === 'LOW' ? 'badge-warning' : 'badge-danger')}" title="${t.name}: ${t.approved_count}/${t.recommended_min_count} approved" style="font-size: 0.65rem;">
                                                        ${t.name.split(" ")[0]}: ${t.approved_count}/${t.recommended_min_count}
                                                    </span>
                                                `).join("")}
                                            </div>
                                        </td>
                                        <td>
                                            <div style="display: flex; flex-wrap: wrap; gap: 0.35rem;">
                                                ${errors.map(e => `
                                                    <span class="badge ${e.status === 'OK' ? 'badge-neutral' : (e.status === 'LOW' ? 'badge-warning' : 'badge-danger')}" title="${e.name}: ${e.approved_count}/${e.recommended_min_count} approved" style="font-size: 0.65rem;">
                                                        ${e.name.replace("_ERROR", "").replace(/_/g, " ")}: ${e.approved_count}/${e.recommended_min_count}
                                                    </span>
                                                `).join("")}
                                            </div>
                                        </td>
                                    </tr>
                                `;
                            }).join("")}
                        </tbody>
                    </table>
                </div>

            </div>
        `;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Event Listeners
    // ─────────────────────────────────────────────────────────────────────────
    function attachCommonListeners() {
        document.getElementById("header-pending-btn")?.addEventListener("click", () => {
            if (onNavigate) onNavigate("/teacher/questions/pending");
        });

        container.querySelectorAll(".btn-clean-tab").forEach(tabBtn => {
            tabBtn.addEventListener("click", () => {
                activeTab = tabBtn.dataset.tab;
                if (activeTab === "gaps" && !coverageData) {
                    loadCoverageData();
                } else {
                    renderView();
                }
            });
        });
    }

    function attachBalancedListeners() {
        container.querySelectorAll(".concept-toggle-row").forEach(card => {
            card.addEventListener("click", () => {
                const c = card.dataset.concept;
                if (selectedConcepts.has(c)) {
                    selectedConcepts.delete(c);
                } else {
                    selectedConcepts.add(c);
                }
                renderView();
            });
        });

        document.getElementById("select-all-concepts-btn")?.addEventListener("click", () => {
            selectedConcepts = new Set(CONCEPTS);
            renderView();
        });

        document.getElementById("clear-all-concepts-btn")?.addEventListener("click", () => {
            selectedConcepts.clear();
            renderView();
        });

        container.querySelectorAll(".q-count-pill").forEach(pill => {
            pill.addEventListener("click", () => {
                questionsPerConcept = parseInt(pill.dataset.count) || 15;
                renderView();
            });
        });

        const genBtn = document.getElementById("gen-balanced-btn");
        genBtn?.addEventListener("click", async () => {
            if (selectedConcepts.size === 0) return;

            genBtn.disabled = true;
            genBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Processing ${selectedConcepts.size * questionsPerConcept} items...`;

            try {
                const res = await SchemaMasteryAPI.generateBalancedPack({
                    concepts: Array.from(selectedConcepts),
                    questions_per_concept: questionsPerConcept,
                });

                if (res.success) {
                    showResultsView(res, "Curriculum Pack");
                } else {
                    alert(`Generation error: ${res.error || 'Request failed'}`);
                }
            } catch (err) {
                alert(`System error: ${err.message}`);
            } finally {
                genBtn.disabled = false;
                genBtn.innerHTML = `<i class="fa-solid fa-play" style="font-size: 0.75rem; margin-right: 0.4rem;"></i> Generate Question Pack`;
            }
        });
    }

    function attachManualListeners() {
        const conceptSelect = document.getElementById("manual-concept");
        conceptSelect?.addEventListener("change", (e) => {
            manualConcept = e.target.value;
            const errorSelect = document.getElementById("manual-error");
            if (errorSelect) {
                const errors = CONCEPT_ERROR_MAP[manualConcept] || CONCEPT_ERROR_MAP["Loops"];
                errorSelect.innerHTML = `
                    <option value="UNKNOWN_ERROR">General Misconception (Default)</option>
                    ${errors.map(err => `<option value="${err}">${err}</option>`).join("")}
                `;
            }
        });

        const manualForm = document.getElementById("manual-gen-form");
        manualForm?.addEventListener("submit", async (e) => {
            e.preventDefault();
            const concept = document.getElementById("manual-concept").value;
            const qTypeVal = document.getElementById("manual-type").value;
            const question_type = qTypeVal.startsWith("All") ? null : qTypeVal;
            const difficulty = document.getElementById("manual-diff").value;
            const target_error_type = document.getElementById("manual-error").value;
            const count = parseInt(document.getElementById("manual-count").value) || 4;

            const submitBtn = document.getElementById("manual-submit-btn");
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Generating...`;

            try {
                const res = await SchemaMasteryAPI.generateQuestions({
                    concept_name: concept,
                    question_type: question_type,
                    difficulty: difficulty,
                    target_error_type: target_error_type,
                    count: count,
                });

                if (res.success && res.questions) {
                    showResultsView({
                        total_generated: res.questions.length,
                        questions: res.questions,
                        by_concept: { [concept]: res.questions.length },
                    }, "Single Batch");
                } else {
                    alert(`Generation error: ${res.error || 'Request failed'}`);
                }
            } catch (err) {
                alert(`System error: ${err.message}`);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = `<i class="fa-solid fa-plus" style="margin-right: 0.35rem;"></i> Generate Batch`;
            }
        });
    }

    function attachGapsListeners() {
        document.getElementById("refresh-coverage-btn")?.addEventListener("click", loadCoverageData);
        document.getElementById("retry-coverage-btn")?.addEventListener("click", loadCoverageData);

        const fillGapsBtn = document.getElementById("fill-all-gaps-btn");
        fillGapsBtn?.addEventListener("click", async () => {
            fillGapsBtn.disabled = true;
            fillGapsBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Drafting items...`;

            try {
                const res = await SchemaMasteryAPI.fillQuestionBankGaps({
                    gaps: coverageData?.gaps_list || [],
                    max_per_gap: 2,
                });

                if (res.success) {
                    await loadCoverageData(false);
                    showResultsView(res, "Gap Fill Batch");
                } else {
                    alert(`Error: ${res.error || 'Request failed'}`);
                }
            } catch (err) {
                alert(`System error: ${err.message}`);
            } finally {
                if (fillGapsBtn) {
                    fillGapsBtn.disabled = false;
                    fillGapsBtn.innerHTML = `<i class="fa-solid fa-plus"></i> Generate Deficit Drafts`;
                }
            }
        });
    }

    async function loadCoverageData(renderAfter = true) {
        loadingCoverage = true;
        if (renderAfter) renderView();

        try {
            const res = await SchemaMasteryAPI.getQuestionBankCoverage();
            if (res.success) {
                coverageData = res.coverage;
            }
        } catch (err) {
            console.error("Failed to load coverage:", err);
        } finally {
            loadingCoverage = false;
            renderView();
        }
    }

    function showResultsView(result, modeLabel) {
        const resultsArea = document.getElementById("gen-results-area");
        if (!resultsArea) return;

        const count = result.total_generated || (result.questions || []).length;

        resultsArea.style.display = "flex";
        resultsArea.innerHTML = `
            <div class="card" style="border-left: 4px solid #059669; padding: 1.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem;">
                    <div>
                        <div style="font-size: 1rem; font-weight: 700; color: #0F172A;">
                            Generated ${count} Draft Questions (${modeLabel})
                        </div>
                        <p style="font-size: 0.8125rem; color: #64748B; margin-top: 0.2rem;">
                            Items have been saved with status <code>PENDING</code> in the educator review queue.
                        </p>
                    </div>

                    <button class="btn btn-primary btn-sm" id="view-pending-now-btn" style="font-weight: 600;">
                        Open Pending Review Queue (${count}) →
                    </button>
                </div>

                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; border-top: 1px solid #E2E8F0; padding-top: 0.75rem;">
                    ${Object.entries(result.by_concept || {}).map(([k, v]) => `
                        <span class="badge badge-neutral" style="font-size: 0.75rem; padding: 0.3rem 0.6rem;">
                            ${k}: <strong>${v}</strong>
                        </span>
                    `).join("")}
                </div>
            </div>
        `;

        document.getElementById("view-pending-now-btn")?.addEventListener("click", () => {
            if (onNavigate) onNavigate("/teacher/questions/pending");
        });

        resultsArea.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    renderView();
}
