/**
 * ApprovedQuestionBank Component — Teacher & Admin Approved Question Bank
 * =======================================================================
 * Inspects and manages the approved post-test question repository.
 * Allows filtering, searching, toggling active status, and inspecting details.
 */

import { SchemaMasteryAPI } from "../../api/api.js";

const CONCEPTS = ["All Concepts", "Variables", "Operators", "Loops", "Arrays", "Methods"];

export async function renderApprovedQuestionBank(container, onNavigate) {
    let activeFilter = "All Concepts";
    let searchQuery = "";
    let activeOnly = false;
    let bankList = [];
    let selectedQuestion = null;

    container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            
            <!-- Page Header -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
                <div>
                    <h1 style="font-size: 1.75rem; font-weight: 800; color: #111827; letter-spacing: -0.02em;">
                        Approved Question Bank
                    </h1>
                    <p style="color: #6B7280; font-size: 0.9375rem; margin-top: 0.25rem;">
                        Active approved questions used for student post-test blueprint assembly.
                    </p>
                </div>

                <button class="btn btn-primary btn-sm" id="bank-generate-btn">
                    <i class="fa-solid fa-plus-circle"></i> Generate New Drafts
                </button>
            </div>

            <!-- Filters & Search Bar Card -->
            <div class="card" style="padding: 1.25rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.75rem; flex: 1; min-width: 260px;">
                        <div style="position: relative; flex: 1;">
                            <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: #9CA3AF;"></i>
                            <input type="text" id="bank-search-input" class="input-field" placeholder="Search question text, code, or ID..." style="padding-left: 2.25rem;">
                        </div>
                    </div>

                    <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
                        <select class="select-field" id="bank-concept-select" style="width: auto; min-width: 160px;">
                            ${CONCEPTS.map(c => `<option value="${c}">${c}</option>`).join("")}
                        </select>

                        <label style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.8125rem; font-weight: 600; color: #4B5563; cursor: pointer; user-select: none;">
                            <input type="checkbox" id="bank-active-only" ${activeOnly ? 'checked' : ''} style="width: 16px; height: 16px;">
                            Active Only
                        </label>
                    </div>
                </div>
            </div>

            <!-- Questions Table Container -->
            <div id="bank-table-container">
                <div style="text-align: center; padding: 3rem 0;"><div class="spinner"></div></div>
            </div>

            <!-- Detail Modal Container -->
            <div id="bank-modal-wrapper"></div>

        </div>
    `;

    document.getElementById("bank-generate-btn")?.addEventListener("click", () => {
        if (onNavigate) onNavigate("/teacher/questions/generate");
    });

    const searchInput = document.getElementById("bank-search-input");
    searchInput?.addEventListener("input", (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        renderTable();
    });

    const conceptSelect = document.getElementById("bank-concept-select");
    conceptSelect?.addEventListener("change", async (e) => {
        activeFilter = e.target.value;
        await loadBankData();
    });

    const activeOnlyChk = document.getElementById("bank-active-only");
    activeOnlyChk?.addEventListener("change", async (e) => {
        activeOnly = e.target.checked;
        await loadBankData();
    });

    await loadBankData();

    async function loadBankData() {
        const containerEl = document.getElementById("bank-table-container");
        if (!containerEl) return;
        containerEl.innerHTML = `<div style="text-align: center; padding: 3rem 0;"><div class="spinner"></div></div>`;

        try {
            const conceptParam = activeFilter === "All Concepts" ? "" : activeFilter;
            const res = await SchemaMasteryAPI.getQuestionBank(conceptParam, activeOnly);
            bankList = res.questions || [];
            renderTable();
        } catch (err) {
            containerEl.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fa-solid fa-triangle-exclamation"></i> Error loading question bank: ${err.message}
                </div>
            `;
        }
    }

    function renderTable() {
        const containerEl = document.getElementById("bank-table-container");
        if (!containerEl) return;

        let filtered = bankList;
        if (searchQuery) {
            filtered = filtered.filter(q => {
                const text = (q.question_text || q.text || "").toLowerCase();
                const code = (q.code_snippet || "").toLowerCase();
                const qid = (q.question_id || q.id || "").toLowerCase();
                return text.includes(searchQuery) || code.includes(searchQuery) || qid.includes(searchQuery);
            });
        }

        if (filtered.length === 0) {
            containerEl.innerHTML = `
                <div class="card" style="text-align: center; padding: 3rem 1rem;">
                    <div style="font-size: 2rem; color: #9CA3AF; margin-bottom: 0.75rem;">
                        <i class="fa-solid fa-database"></i>
                    </div>
                    <h3 style="font-size: 1.15rem; font-weight: 700; color: #111827;">No Questions Found</h3>
                    <p style="color: #6B7280; font-size: 0.875rem; margin-top: 0.25rem;">
                        No approved questions matched your filter criteria.
                    </p>
                </div>
            `;
            return;
        }

        containerEl.innerHTML = `
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th style="width: 130px;">Question ID</th>
                            <th style="width: 120px;">Concept</th>
                            <th>Question Preview</th>
                            <th style="width: 140px;">Cognitive Type</th>
                            <th style="width: 90px; text-align: center;">Exposure</th>
                            <th style="width: 100px; text-align: center;">Status</th>
                            <th style="width: 100px; text-align: right;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filtered.map(q => {
                            const isActive = q.active !== false;
                            return `
                                <tr>
                                    <td>
                                        <span style="font-family: var(--font-mono); font-size: 0.8125rem; font-weight: 700; color: #1E40AF;">
                                            ${q.question_id || q.id}
                                        </span>
                                    </td>
                                    <td>
                                        <span class="badge badge-primary">${q.concept_name}</span>
                                    </td>
                                    <td>
                                        <div style="font-weight: 600; color: #111827; max-width: 420px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                            ${escapeHtml(q.question_text || q.text)}
                                        </div>
                                        ${q.target_error_type && q.target_error_type !== 'UNKNOWN_ERROR' ? `
                                            <div style="font-size: 0.7rem; color: #DC2626; margin-top: 0.2rem;">Target: ${q.target_error_type}</div>
                                        ` : ''}
                                    </td>
                                    <td>
                                        <span class="badge badge-info" style="font-size: 0.7rem;">${q.question_type}</span>
                                    </td>
                                    <td style="text-align: center; font-weight: 700; color: #4B5563;">
                                        ${q.exposure_count || 0}
                                    </td>
                                    <td style="text-align: center;">
                                        <button class="btn btn-sm toggle-active-btn ${isActive ? 'btn-success' : 'btn-secondary'}" data-id="${q.id || q.question_id}" data-active="${isActive}" style="font-size: 0.7rem; padding: 0.2rem 0.5rem;">
                                            ${isActive ? '<i class="fa-solid fa-toggle-on"></i> Active' : '<i class="fa-solid fa-toggle-off"></i> Inactive'}
                                        </button>
                                    </td>
                                    <td style="text-align: right;">
                                        <button class="btn btn-secondary btn-sm view-detail-btn" data-id="${q.id || q.question_id}" style="padding: 0.35rem 0.65rem;">
                                            <i class="fa-solid fa-eye"></i> View
                                        </button>
                                    </td>
                                </tr>
                            `;
                        }).join("")}
                    </tbody>
                </table>
            </div>
        `;

        attachTableActionListeners(filtered);
    }

    function attachTableActionListeners(filteredList) {
        container.querySelectorAll(".toggle-active-btn").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = btn.dataset.id;
                const currentActive = btn.dataset.active === "true";
                btn.disabled = true;
                try {
                    await SchemaMasteryAPI.toggleQuestionActive(id, { active: !currentActive });
                    await loadBankData();
                } catch (e) {
                    alert(`Toggle failed: ${e.message}`);
                    btn.disabled = false;
                }
            });
        });

        container.querySelectorAll(".view-detail-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.dataset.id;
                const targetQ = filteredList.find(q => q.id === id || q.question_id === id);
                if (targetQ) openDetailModal(targetQ);
            });
        });
    }

    function openDetailModal(q) {
        const modalWrap = document.getElementById("bank-modal-wrapper");
        if (!modalWrap) return;

        modalWrap.innerHTML = `
            <div class="modal-backdrop" id="bank-modal-backdrop">
                <div class="modal-content">
                    <div class="modal-header">
                        <div>
                            <span class="badge badge-primary" style="margin-right: 0.4rem;">${q.concept_name}</span>
                            <span class="badge badge-info">${q.question_type}</span>
                            <span style="font-family: var(--font-mono); font-weight: 700; color: #1E40AF; margin-left: 0.5rem;">${q.question_id || q.id}</span>
                        </div>
                        <button class="btn btn-secondary btn-sm" id="close-bank-modal"><i class="fa-solid fa-xmark"></i></button>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 1.25rem;">
                        <div>
                            <label class="form-label">Question Text</label>
                            <div style="font-size: 1.05rem; font-weight: 700; color: #111827;">${escapeHtml(q.question_text || q.text)}</div>
                        </div>

                        ${q.code_snippet ? `
                            <div>
                                <label class="form-label">Java Code Snippet</label>
                                <div class="code-box">
                                    <pre><code>${escapeHtml(q.code_snippet)}</code></pre>
                                </div>
                            </div>
                        ` : ''}

                        <div>
                            <label class="form-label">Canonical Options & Quality Ratings</label>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.65rem;">
                                <div style="padding: 0.6rem; border-radius: 6px; border: 1px solid ${q.correct_option === 'A' ? '#A7F3D0' : '#E5E7EB'}; background: ${q.correct_option === 'A' ? '#ECFDF5' : '#F9FAFB'};">
                                    <strong style="color: ${q.correct_option === 'A' ? '#065F46' : '#111827'};">A:</strong> ${escapeHtml(q.option_a)}
                                    <span class="badge ${q.option_a_quality === 'Correct' ? 'badge-success' : 'badge-muted'}" style="font-size: 0.65rem; margin-left: 0.35rem;">${q.option_a_quality}</span>
                                </div>
                                <div style="padding: 0.6rem; border-radius: 6px; border: 1px solid ${q.correct_option === 'B' ? '#A7F3D0' : '#E5E7EB'}; background: ${q.correct_option === 'B' ? '#ECFDF5' : '#F9FAFB'};">
                                    <strong style="color: ${q.correct_option === 'B' ? '#065F46' : '#111827'};">B:</strong> ${escapeHtml(q.option_b)}
                                    <span class="badge ${q.option_b_quality === 'Correct' ? 'badge-success' : 'badge-muted'}" style="font-size: 0.65rem; margin-left: 0.35rem;">${q.option_b_quality}</span>
                                </div>
                                <div style="padding: 0.6rem; border-radius: 6px; border: 1px solid ${q.correct_option === 'C' ? '#A7F3D0' : '#E5E7EB'}; background: ${q.correct_option === 'C' ? '#ECFDF5' : '#F9FAFB'};">
                                    <strong style="color: ${q.correct_option === 'C' ? '#065F46' : '#111827'};">C:</strong> ${escapeHtml(q.option_c)}
                                    <span class="badge ${q.option_c_quality === 'Correct' ? 'badge-success' : 'badge-muted'}" style="font-size: 0.65rem; margin-left: 0.35rem;">${q.option_c_quality}</span>
                                </div>
                                <div style="padding: 0.6rem; border-radius: 6px; border: 1px solid ${q.correct_option === 'D' ? '#A7F3D0' : '#E5E7EB'}; background: ${q.correct_option === 'D' ? '#ECFDF5' : '#F9FAFB'};">
                                    <strong style="color: ${q.correct_option === 'D' ? '#065F46' : '#111827'};">D:</strong> ${escapeHtml(q.option_d)}
                                    <span class="badge ${q.option_d_quality === 'Correct' ? 'badge-success' : 'badge-muted'}" style="font-size: 0.65rem; margin-left: 0.35rem;">${q.option_d_quality}</span>
                                </div>
                            </div>
                        </div>

                        ${q.explanation ? `
                            <div style="background: #F8FAFC; border-left: 3px solid #1E40AF; padding: 0.75rem; border-radius: 4px; font-size: 0.8125rem;">
                                <strong>Explanation:</strong> ${escapeHtml(q.explanation)}
                            </div>
                        ` : ''}

                        <div style="display: flex; justify-content: flex-end; margin-top: 0.5rem;">
                            <button class="btn btn-secondary" id="close-modal-btn-2">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById("close-bank-modal")?.addEventListener("click", () => modalWrap.innerHTML = "");
        document.getElementById("close-modal-btn-2")?.addEventListener("click", () => modalWrap.innerHTML = "");
    }
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
