/**
 * PendingReview Component — Teacher Draft Review & Approval Dashboard
 * ===================================================================
 * Review, edit, approve, or reject draft questions before they enter the active pool.
 */

import { SchemaMasteryAPI } from "../../api/api.js";

const CONCEPTS = ["All Concepts", "Variables", "Operators", "Loops", "Arrays", "Methods"];

export async function renderPendingReview(container, onNavigate) {
    let activeFilter = "All Concepts";
    let pendingList = [];
    let selectedIds = new Set();
    let editQuestion = null;

    container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            
            <!-- Page Header -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
                <div>
                    <h1 style="font-size: 1.75rem; font-weight: 800; color: #111827; letter-spacing: -0.02em;">
                        Pending Draft Review
                    </h1>
                    <p style="color: #6B7280; font-size: 0.9375rem; margin-top: 0.25rem;">
                        Inspect 4-tier answer qualities and pedagogical explanations before approving into the active post-test pool.
                    </p>
                </div>

                <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                    <button class="btn btn-success btn-sm" id="bulk-approve-btn" disabled>
                        <i class="fa-solid fa-check-double"></i> Approve Selected (<span id="bulk-app-count">0</span>)
                    </button>
                    <button class="btn btn-danger btn-sm" id="bulk-reject-btn" disabled>
                        <i class="fa-solid fa-ban"></i> Reject Selected
                    </button>
                    <button class="btn btn-primary btn-sm" id="p-gen-more-btn">
                        <i class="fa-solid fa-plus"></i> Generate More
                    </button>
                </div>
            </div>

            <!-- Concept Filter Bar -->
            <div class="card" style="padding: 1rem 1.25rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;" id="pending-concept-filters">
                    ${CONCEPTS.map(c => `
                        <button class="btn ${c === activeFilter ? 'btn-primary' : 'btn-secondary'} btn-sm concept-pill" data-concept="${c}">
                            ${c}
                        </button>
                    `).join("")}
                </div>
            </div>

            <!-- Questions Area -->
            <div id="pending-cards-container">
                <div style="text-align: center; padding: 3rem 0;"><div class="spinner"></div></div>
            </div>

            <!-- Modal Container for Editing Draft -->
            <div id="edit-modal-wrapper"></div>

        </div>
    `;

    document.getElementById("p-gen-more-btn")?.addEventListener("click", () => {
        if (onNavigate) onNavigate("/teacher/questions/generate");
    });

    attachFilterListeners();
    await loadPendingData();

    function attachFilterListeners() {
        container.querySelectorAll(".concept-pill").forEach(pill => {
            pill.addEventListener("click", async () => {
                activeFilter = pill.dataset.concept;
                container.querySelectorAll(".concept-pill").forEach(p => {
                    p.className = p.dataset.concept === activeFilter ? "btn btn-primary btn-sm concept-pill" : "btn btn-secondary btn-sm concept-pill";
                });
                await loadPendingData();
            });
        });
    }

    async function loadPendingData() {
        const cardsContainer = document.getElementById("pending-cards-container");
        if (!cardsContainer) return;
        cardsContainer.innerHTML = `<div style="text-align: center; padding: 3rem 0;"><div class="spinner"></div></div>`;
        selectedIds.clear();
        updateBulkButtons();

        try {
            const conceptParam = activeFilter === "All Concepts" ? "" : activeFilter;
            const res = await SchemaMasteryAPI.getPendingQuestions(conceptParam);
            pendingList = res.questions || [];
            renderPendingCards();
        } catch (err) {
            cardsContainer.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fa-solid fa-triangle-exclamation"></i> Error loading pending questions: ${err.message}
                </div>
            `;
        }
    }

    function renderPendingCards() {
        const cardsContainer = document.getElementById("pending-cards-container");
        if (!cardsContainer) return;

        if (pendingList.length === 0) {
            cardsContainer.innerHTML = `
                <div class="card" style="text-align: center; padding: 3.5rem 1rem;">
                    <div style="width: 56px; height: 56px; border-radius: 50%; background: #ECFDF5; color: #059669; display: inline-flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 1rem;">
                        <i class="fa-solid fa-check"></i>
                    </div>
                    <h3 style="font-size: 1.15rem; font-weight: 700; color: #111827; margin-bottom: 0.35rem;">All Caught Up!</h3>
                    <p style="color: #6B7280; font-size: 0.875rem; margin-bottom: 1.5rem;">
                        There are no draft questions awaiting review for <strong>${activeFilter}</strong>.
                    </p>
                    <button class="btn btn-primary btn-sm" id="empty-gen-btn">
                        <i class="fa-solid fa-plus-circle"></i> Generate New Questions
                    </button>
                </div>
            `;
            document.getElementById("empty-gen-btn")?.addEventListener("click", () => {
                if (onNavigate) onNavigate("/teacher/questions/generate");
            });
            return;
        }

        cardsContainer.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 1.25rem;">
                ${pendingList.map((q, idx) => `
                    <div class="card" style="padding: 1.5rem;" data-id="${q.id}">
                        <!-- Top Row: Checkbox, ID, Concept, Badges, Actions -->
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1rem; border-bottom: 1px solid #E5E7EB; padding-bottom: 0.75rem;">
                            <div style="display: flex; align-items: center; gap: 0.75rem;">
                                <input type="checkbox" class="q-select-chk" data-id="${q.id}" ${selectedIds.has(q.id) ? 'checked' : ''} style="width: 17px; height: 17px; cursor: pointer;">
                                <div>
                                    <span style="font-size: 0.75rem; font-family: var(--font-mono); font-weight: 700; color: #1E40AF; background: #EFF6FF; padding: 0.2rem 0.5rem; border-radius: 4px; border: 1px solid #BFDBFE;">
                                        ${q.question_id || q.id}
                                    </span>
                                    <span class="badge badge-primary" style="margin-left: 0.4rem;">${q.concept_name}</span>
                                    <span class="badge badge-info">${q.question_type}</span>
                                    <span class="badge badge-muted">${q.difficulty || 'Medium'}</span>
                                    ${q.target_error_type && q.target_error_type !== 'UNKNOWN_ERROR' ? `<span class="badge badge-danger" style="font-size: 0.65rem;">${q.target_error_type}</span>` : ''}
                                </div>
                            </div>

                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <button class="btn btn-secondary btn-sm edit-q-btn" data-id="${q.id}" title="Edit question content">
                                    <i class="fa-solid fa-pen-to-square"></i> Edit
                                </button>
                                <button class="btn btn-success btn-sm approve-q-btn" data-id="${q.id}" title="Approve question into active bank">
                                    <i class="fa-solid fa-check"></i> Approve
                                </button>
                                <button class="btn btn-danger btn-sm reject-q-btn" data-id="${q.id}" title="Reject question into archive">
                                    <i class="fa-solid fa-xmark"></i> Reject
                                </button>
                            </div>
                        </div>

                        <!-- Question Text -->
                        <div style="font-size: 1.05rem; font-weight: 700; color: #111827; margin-bottom: 0.75rem; line-height: 1.5;">
                            ${escapeHtml(q.question_text || q.text)}
                        </div>

                        <!-- Code Snippet if any -->
                        ${q.code_snippet ? `
                            <div class="code-box" style="margin-bottom: 1rem;">
                                <pre><code>${escapeHtml(q.code_snippet)}</code></pre>
                            </div>
                        ` : ''}

                        <!-- 4 Options with Quality Badges & Correct Key Indicator -->
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 0.65rem; margin-bottom: 1rem;">
                            <div style="padding: 0.6rem 0.85rem; border-radius: 8px; border: 1px solid ${q.correct_option === 'A' ? '#A7F3D0' : '#E5E7EB'}; background: ${q.correct_option === 'A' ? '#ECFDF5' : '#F9FAFB'};">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.2rem;">
                                    <strong style="font-size: 0.8125rem; color: ${q.correct_option === 'A' ? '#065F46' : '#111827'};">Option A</strong>
                                    <span class="badge ${getQualityBadgeClass(q.option_a_quality)}">${q.option_a_quality || 'N/A'}</span>
                                </div>
                                <span style="font-size: 0.875rem; color: #374151;">${escapeHtml(q.option_a)}</span>
                            </div>

                            <div style="padding: 0.6rem 0.85rem; border-radius: 8px; border: 1px solid ${q.correct_option === 'B' ? '#A7F3D0' : '#E5E7EB'}; background: ${q.correct_option === 'B' ? '#ECFDF5' : '#F9FAFB'};">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.2rem;">
                                    <strong style="font-size: 0.8125rem; color: ${q.correct_option === 'B' ? '#065F46' : '#111827'};">Option B</strong>
                                    <span class="badge ${getQualityBadgeClass(q.option_b_quality)}">${q.option_b_quality || 'N/A'}</span>
                                </div>
                                <span style="font-size: 0.875rem; color: #374151;">${escapeHtml(q.option_b)}</span>
                            </div>

                            <div style="padding: 0.6rem 0.85rem; border-radius: 8px; border: 1px solid ${q.correct_option === 'C' ? '#A7F3D0' : '#E5E7EB'}; background: ${q.correct_option === 'C' ? '#ECFDF5' : '#F9FAFB'};">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.2rem;">
                                    <strong style="font-size: 0.8125rem; color: ${q.correct_option === 'C' ? '#065F46' : '#111827'};">Option C</strong>
                                    <span class="badge ${getQualityBadgeClass(q.option_c_quality)}">${q.option_c_quality || 'N/A'}</span>
                                </div>
                                <span style="font-size: 0.875rem; color: #374151;">${escapeHtml(q.option_c)}</span>
                            </div>

                            <div style="padding: 0.6rem 0.85rem; border-radius: 8px; border: 1px solid ${q.correct_option === 'D' ? '#A7F3D0' : '#E5E7EB'}; background: ${q.correct_option === 'D' ? '#ECFDF5' : '#F9FAFB'};">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.2rem;">
                                    <strong style="font-size: 0.8125rem; color: ${q.correct_option === 'D' ? '#065F46' : '#111827'};">Option D</strong>
                                    <span class="badge ${getQualityBadgeClass(q.option_d_quality)}">${q.option_d_quality || 'N/A'}</span>
                                </div>
                                <span style="font-size: 0.875rem; color: #374151;">${escapeHtml(q.option_d)}</span>
                            </div>
                        </div>

                        <!-- Pedagogical Explanation -->
                        ${q.explanation ? `
                            <div style="font-size: 0.8125rem; color: #374151; background: #F8FAFC; border-left: 3px solid #1E40AF; padding: 0.5rem 0.75rem; border-radius: 4px;">
                                <strong>Pedagogical Explanation:</strong> ${escapeHtml(q.explanation)}
                            </div>
                        ` : ''}
                    </div>
                `).join("")}
            </div>
        `;

        attachCardActionListeners();
    }

    function attachCardActionListeners() {
        container.querySelectorAll(".q-select-chk").forEach(chk => {
            chk.addEventListener("change", () => {
                const id = chk.dataset.id;
                if (chk.checked) selectedIds.add(id);
                else selectedIds.delete(id);
                updateBulkButtons();
            });
        });

        container.querySelectorAll(".approve-q-btn").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = btn.dataset.id;
                btn.disabled = true;
                btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i>`;
                try {
                    await SchemaMasteryAPI.approveQuestion(id, { approved_by: "Educator Review" });
                    await loadPendingData();
                } catch (e) {
                    alert(`Approve failed: ${e.message}`);
                    btn.disabled = false;
                    btn.innerHTML = `<i class="fa-solid fa-check"></i> Approve`;
                }
            });
        });

        container.querySelectorAll(".reject-q-btn").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = btn.dataset.id;
                const reason = prompt("Optional: Provide reason for rejection", "Did not meet pedagogical quality threshold");
                if (reason === null) return; // User cancelled
                btn.disabled = true;
                btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i>`;
                try {
                    await SchemaMasteryAPI.rejectQuestion(id, { reason: reason || "Rejected by educator" });
                    await loadPendingData();
                } catch (e) {
                    alert(`Reject failed: ${e.message}`);
                    btn.disabled = false;
                    btn.innerHTML = `<i class="fa-solid fa-xmark"></i> Reject`;
                }
            });
        });

        container.querySelectorAll(".edit-q-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.dataset.id;
                const targetQ = pendingList.find(q => q.id === id);
                if (targetQ) openEditModal(targetQ);
            });
        });

        document.getElementById("bulk-approve-btn")?.addEventListener("click", async () => {
            if (selectedIds.size === 0) return;
            if (!confirm(`Approve all ${selectedIds.size} selected questions into the active question bank?`)) return;
            for (const id of selectedIds) {
                try {
                    await SchemaMasteryAPI.approveQuestion(id, { approved_by: "Educator Bulk Review" });
                } catch {}
            }
            await loadPendingData();
        });

        document.getElementById("bulk-reject-btn")?.addEventListener("click", async () => {
            if (selectedIds.size === 0) return;
            if (!confirm(`Reject all ${selectedIds.size} selected questions?`)) return;
            for (const id of selectedIds) {
                try {
                    await SchemaMasteryAPI.rejectQuestion(id, { reason: "Bulk rejected by educator" });
                } catch {}
            }
            await loadPendingData();
        });
    }

    function updateBulkButtons() {
        const appBtn = document.getElementById("bulk-approve-btn");
        const rejBtn = document.getElementById("bulk-reject-btn");
        const countSpan = document.getElementById("bulk-app-count");

        const count = selectedIds.size;
        if (countSpan) countSpan.textContent = count;
        if (appBtn) appBtn.disabled = count === 0;
        if (rejBtn) rejBtn.disabled = count === 0;
    }

    function openEditModal(q) {
        const modalWrap = document.getElementById("edit-modal-wrapper");
        if (!modalWrap) return;

        modalWrap.innerHTML = `
            <div class="modal-backdrop" id="edit-modal-backdrop">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 style="font-size: 1.25rem; font-weight: 700; color: #111827;">Edit Question (${q.question_id || q.id})</h2>
                        <button class="btn btn-secondary btn-sm" id="close-modal-btn"><i class="fa-solid fa-xmark"></i></button>
                    </div>

                    <form id="edit-q-form" style="display: flex; flex-direction: column; gap: 1rem;">
                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label">Question Prompt</label>
                            <textarea id="edit-text" class="textarea-field" rows="3" required>${q.question_text || q.text || ''}</textarea>
                        </div>

                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label">Java Code Snippet (Optional)</label>
                            <textarea id="edit-code" class="textarea-field" rows="3" style="font-family: var(--font-mono); font-size: 0.8125rem;">${q.code_snippet || ''}</textarea>
                        </div>

                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem;">
                            <div class="form-group" style="margin-bottom: 0;">
                                <label class="form-label">Option A</label>
                                <input type="text" id="edit-opt-a" class="input-field" value="${q.option_a || ''}" required>
                            </div>
                            <div class="form-group" style="margin-bottom: 0;">
                                <label class="form-label">Option A Quality</label>
                                <select id="edit-qual-a" class="select-field">
                                    <option value="Correct" ${q.option_a_quality === 'Correct' ? 'selected' : ''}>Correct (1.0)</option>
                                    <option value="Nearly Correct" ${q.option_a_quality === 'Nearly Correct' ? 'selected' : ''}>Nearly Correct (0.5)</option>
                                    <option value="Wrong" ${q.option_a_quality === 'Wrong' ? 'selected' : ''}>Wrong (0.0)</option>
                                    <option value="Clearly Wrong" ${q.option_a_quality === 'Clearly Wrong' ? 'selected' : ''}>Clearly Wrong (0.0)</option>
                                </select>
                            </div>

                            <div class="form-group" style="margin-bottom: 0;">
                                <label class="form-label">Option B</label>
                                <input type="text" id="edit-opt-b" class="input-field" value="${q.option_b || ''}" required>
                            </div>
                            <div class="form-group" style="margin-bottom: 0;">
                                <label class="form-label">Option B Quality</label>
                                <select id="edit-qual-b" class="select-field">
                                    <option value="Correct" ${q.option_b_quality === 'Correct' ? 'selected' : ''}>Correct (1.0)</option>
                                    <option value="Nearly Correct" ${q.option_b_quality === 'Nearly Correct' ? 'selected' : ''}>Nearly Correct (0.5)</option>
                                    <option value="Wrong" ${q.option_b_quality === 'Wrong' ? 'selected' : ''}>Wrong (0.0)</option>
                                    <option value="Clearly Wrong" ${q.option_b_quality === 'Clearly Wrong' ? 'selected' : ''}>Clearly Wrong (0.0)</option>
                                </select>
                            </div>

                            <div class="form-group" style="margin-bottom: 0;">
                                <label class="form-label">Option C</label>
                                <input type="text" id="edit-opt-c" class="input-field" value="${q.option_c || ''}" required>
                            </div>
                            <div class="form-group" style="margin-bottom: 0;">
                                <label class="form-label">Option C Quality</label>
                                <select id="edit-qual-c" class="select-field">
                                    <option value="Correct" ${q.option_c_quality === 'Correct' ? 'selected' : ''}>Correct (1.0)</option>
                                    <option value="Nearly Correct" ${q.option_c_quality === 'Nearly Correct' ? 'selected' : ''}>Nearly Correct (0.5)</option>
                                    <option value="Wrong" ${q.option_c_quality === 'Wrong' ? 'selected' : ''}>Wrong (0.0)</option>
                                    <option value="Clearly Wrong" ${q.option_c_quality === 'Clearly Wrong' ? 'selected' : ''}>Clearly Wrong (0.0)</option>
                                </select>
                            </div>

                            <div class="form-group" style="margin-bottom: 0;">
                                <label class="form-label">Option D</label>
                                <input type="text" id="edit-opt-d" class="input-field" value="${q.option_d || ''}" required>
                            </div>
                            <div class="form-group" style="margin-bottom: 0;">
                                <label class="form-label">Option D Quality</label>
                                <select id="edit-qual-d" class="select-field">
                                    <option value="Correct" ${q.option_d_quality === 'Correct' ? 'selected' : ''}>Correct (1.0)</option>
                                    <option value="Nearly Correct" ${q.option_d_quality === 'Nearly Correct' ? 'selected' : ''}>Nearly Correct (0.5)</option>
                                    <option value="Wrong" ${q.option_d_quality === 'Wrong' ? 'selected' : ''}>Wrong (0.0)</option>
                                    <option value="Clearly Wrong" ${q.option_d_quality === 'Clearly Wrong' ? 'selected' : ''}>Clearly Wrong (0.0)</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label">Correct Answer Key</label>
                            <select id="edit-correct" class="select-field">
                                <option value="A" ${q.correct_option === 'A' ? 'selected' : ''}>A</option>
                                <option value="B" ${q.correct_option === 'B' ? 'selected' : ''}>B</option>
                                <option value="C" ${q.correct_option === 'C' ? 'selected' : ''}>C</option>
                                <option value="D" ${q.correct_option === 'D' ? 'selected' : ''}>D</option>
                            </select>
                        </div>

                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label">Pedagogical Explanation</label>
                            <textarea id="edit-explanation" class="textarea-field" rows="2">${q.explanation || ''}</textarea>
                        </div>

                        <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1rem;">
                            <button type="button" class="btn btn-secondary" id="cancel-edit-btn">Cancel</button>
                            <button type="submit" class="btn btn-primary" id="save-edit-btn">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.getElementById("close-modal-btn")?.addEventListener("click", () => modalWrap.innerHTML = "");
        document.getElementById("cancel-edit-btn")?.addEventListener("click", () => modalWrap.innerHTML = "");

        document.getElementById("edit-q-form")?.addEventListener("submit", async (e) => {
            e.preventDefault();
            const updates = {
                question_text: document.getElementById("edit-text").value.trim(),
                code_snippet: document.getElementById("edit-code").value.trim(),
                option_a: document.getElementById("edit-opt-a").value.trim(),
                option_a_quality: document.getElementById("edit-qual-a").value,
                option_b: document.getElementById("edit-opt-b").value.trim(),
                option_b_quality: document.getElementById("edit-qual-b").value,
                option_c: document.getElementById("edit-opt-c").value.trim(),
                option_c_quality: document.getElementById("edit-qual-c").value,
                option_d: document.getElementById("edit-opt-d").value.trim(),
                option_d_quality: document.getElementById("edit-qual-d").value,
                correct_option: document.getElementById("edit-correct").value,
                explanation: document.getElementById("edit-explanation").value.trim(),
            };

            const saveBtn = document.getElementById("save-edit-btn");
            if (saveBtn) {
                saveBtn.disabled = true;
                saveBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Saving...`;
            }

            try {
                await SchemaMasteryAPI.updateQuestion(q.id, updates);
                modalWrap.innerHTML = "";
                await loadPendingData();
            } catch (err) {
                alert(`Update failed: ${err.message}`);
                if (saveBtn) {
                    saveBtn.disabled = false;
                    saveBtn.textContent = "Save Changes";
                }
            }
        });
    }

    function getQualityBadgeClass(qual) {
        if (qual === "Correct") return "badge-success";
        if (qual === "Nearly Correct") return "badge-warning";
        if (qual === "Clearly Wrong") return "badge-muted";
        return "badge-danger";
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
