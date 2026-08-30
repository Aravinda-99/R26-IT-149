/**
 * Teacher/Admin Question Bank Management Dashboard
 * =================================================
 * Component 4: LLM-Assisted Question Generation & Teacher Approval Workflow
 *
 * Provides:
 *   1. Concept-specific LLM draft question generation
 *   2. Teacher review with option quality labeling (Correct, Nearly Correct, Wrong, Clearly Wrong)
 *   3. Inline question editing, approval, and rejection
 *   4. Approved question bank inspection with exposure statistics
 */

import { SchemaMasteryAPI } from "../api/api.js";

const CONCEPTS = ["Variables", "Operators", "Loops", "Arrays", "Methods"];
const QUESTION_TYPES = [
    "Basic Understanding",
    "Code Output Prediction",
    "Error Recognition",
    "Application",
    "Transfer",
];
const ERROR_TYPES = [
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
    "NULL_POINTER_EXCEPTION",
];

let activeTab = "generate";
let pendingQuestions = [];
let approvedQuestions = [];
let editingQuestionId = null;

export async function renderQuestionBank(container, opts = {}) {
    if (opts.initialTab) {
        activeTab = opts.initialTab;
    }
    container.innerHTML = `
        <div class="qbank-page" style="padding: 1.5rem 2rem; max-width: 1280px; margin: 0 auto; color: var(--text-primary);">
            <!-- Header -->
            <div class="qbank-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1.2rem;">
                <div>
                    <h1 style="font-size: 1.8rem; font-weight: 700; display: flex; align-items: center; gap: 0.6rem;">
                        <i class="fa-solid fa-layer-group" style="color: #6366f1;"></i>
                        Component 4: Question Bank & LLM Workflow
                    </h1>
                    <p style="color: var(--text-secondary); margin-top: 0.4rem; font-size: 0.95rem;">
                        LLM-assisted question drafting with mandatory teacher review & 4-tier answer quality validation.
                    </p>
                </div>
                <div style="background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 0.5rem; padding: 0.5rem 1rem; font-size: 0.85rem; color: #a5b4fc;">
                    <i class="fa-solid fa-shield-halved" style="margin-right: 0.4rem;"></i>
                    Teacher Review Mode Active
                </div>
            </div>

            <!-- Tab Navigation -->
            <div class="qbank-tabs" style="display: flex; gap: 0.8rem; margin-bottom: 1.8rem;">
                <button class="btn qbank-tab-btn ${activeTab === 'generate' ? 'active' : ''}" data-tab="generate" style="padding: 0.6rem 1.2rem; font-weight: 600; border-radius: 0.5rem; transition: all 0.2s;">
                    <i class="fa-solid fa-wand-magic-sparkles" style="margin-right: 0.4rem;"></i> 1. Generate Questions (LLM)
                </button>
                <button class="btn qbank-tab-btn ${activeTab === 'pending' ? 'active' : ''}" data-tab="pending" style="padding: 0.6rem 1.2rem; font-weight: 600; border-radius: 0.5rem; transition: all 0.2s; position: relative;">
                    <i class="fa-solid fa-clipboard-check" style="margin-right: 0.4rem;"></i> 2. Pending Review
                    <span id="pending-badge" style="background: #ef4444; color: white; border-radius: 999px; padding: 0.1rem 0.5rem; font-size: 0.75rem; margin-left: 0.4rem;">0</span>
                </button>
                <button class="btn qbank-tab-btn ${activeTab === 'approved' ? 'active' : ''}" data-tab="approved" style="padding: 0.6rem 1.2rem; font-weight: 600; border-radius: 0.5rem; transition: all 0.2s;">
                    <i class="fa-solid fa-book-bookmark" style="margin-right: 0.4rem;"></i> 3. Approved Bank
                    <span id="approved-badge" style="background: #10b981; color: white; border-radius: 999px; padding: 0.1rem 0.5rem; font-size: 0.75rem; margin-left: 0.4rem;">0</span>
                </button>
            </div>

            <!-- Tab Content Area -->
            <div id="qbank-content">
                <div class="spinner" style="margin: 3rem auto;"></div>
            </div>
        </div>
    `;

    // Tab button handlers
    container.querySelectorAll(".qbank-tab-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            container.querySelectorAll(".qbank-tab-btn").forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            activeTab = btn.dataset.tab;
            renderTabContent();
        });
    });

    await refreshCounts();
    renderTabContent();
}

async function refreshCounts() {
    try {
        const [penRes, appRes] = await Promise.all([
            SchemaMasteryAPI.getPendingQuestions(),
            SchemaMasteryAPI.getQuestionBank(),
        ]);
        pendingQuestions = penRes.questions || [];
        approvedQuestions = appRes.questions || [];

        const penBadge = document.getElementById("pending-badge");
        const appBadge = document.getElementById("approved-badge");
        if (penBadge) penBadge.textContent = pendingQuestions.length;
        if (appBadge) appBadge.textContent = approvedQuestions.length;
    } catch (e) {
        console.warn("Failed to refresh question bank counts:", e);
    }
}

function renderTabContent() {
    const content = document.getElementById("qbank-content");
    if (!content) return;

    if (activeTab === "generate") {
        renderGenerateTab(content);
    } else if (activeTab === "pending") {
        renderPendingTab(content);
    } else if (activeTab === "approved") {
        renderApprovedTab(content);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. GENERATE TAB
// ─────────────────────────────────────────────────────────────────────────────
function renderGenerateTab(content) {
    content.innerHTML = `
        <div style="display: grid; grid-template-columns: 360px 1fr; gap: 2rem; align-items: start;">
            <!-- Generation Form -->
            <div class="card" style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 0.8rem; padding: 1.5rem; box-shadow: var(--shadow-sm);">
                <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 1.2rem; display: flex; align-items: center; gap: 0.5rem; color: var(--primary);">
                    <i class="fa-solid fa-sliders"></i> LLM Generation Parameters
                </h3>

                <form id="gen-form" style="display: flex; flex-direction: column; gap: 1rem;">
                    <div>
                        <label style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 0.3rem;">Target Concept</label>
                        <select id="gen-concept" class="input input-field" style="width: 100%; padding: 0.6rem; background: #FFFFFF; color: var(--text-primary); border: 1px solid var(--border-color); border-radius: 0.4rem;">
                            ${CONCEPTS.map(c => `<option value="${c}" ${c === 'Loops' ? 'selected' : ''}>${c}</option>`).join("")}
                        </select>
                    </div>

                    <div>
                        <label style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 0.3rem;">Question Type</label>
                        <select id="gen-type" class="input input-field" style="width: 100%; padding: 0.6rem; background: #FFFFFF; color: var(--text-primary); border: 1px solid var(--border-color); border-radius: 0.4rem;">
                            <option value="">All Types (Balanced Blueprint)</option>
                            ${QUESTION_TYPES.map(t => `<option value="${t}">${t}</option>`).join("")}
                        </select>
                    </div>

                    <div>
                        <label style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 0.3rem;">Difficulty</label>
                        <select id="gen-difficulty" class="input input-field" style="width: 100%; padding: 0.6rem; background: #FFFFFF; color: var(--text-primary); border: 1px solid var(--border-color); border-radius: 0.4rem;">
                            <option value="Easy">Easy</option>
                            <option value="Medium" selected>Medium</option>
                            <option value="Hard">Hard</option>
                        </select>
                    </div>

                    <div>
                        <label style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 0.3rem;">Target Error Focus (Component 2)</label>
                        <select id="gen-error-type" class="input input-field" style="width: 100%; padding: 0.6rem; background: #FFFFFF; color: var(--text-primary); border: 1px solid var(--border-color); border-radius: 0.4rem;">
                            ${ERROR_TYPES.map(e => `<option value="${e}" ${e === 'LOOP_CONDITION_ERROR' ? 'selected' : ''}>${e}</option>`).join("")}
                        </select>
                    </div>

                    <div>
                        <label style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 0.3rem;">Draft Count</label>
                        <input type="number" id="gen-count" min="1" max="15" value="5" class="input input-field" style="width: 100%; padding: 0.6rem; background: #FFFFFF; color: var(--text-primary); border: 1px solid var(--border-color); border-radius: 0.4rem;" />
                    </div>

                    <button type="submit" class="btn btn-primary" id="gen-submit-btn" style="margin-top: 0.5rem; padding: 0.75rem; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                        <i class="fa-solid fa-wand-magic-sparkles"></i> Generate Draft Questions
                    </button>
                </form>
            </div>

            <!-- Draft Output & Workflow Info -->
            <div id="gen-results-container">
                <div class="card" style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 0.8rem; padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: var(--shadow-sm);">
                    <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.8rem; color: var(--primary);">
                        <i class="fa-solid fa-circle-info"></i> How the LLM-Assisted Pipeline Works
                    </h3>
                    <ul style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6; padding-left: 1.2rem;">
                        <li><strong>Step 1:</strong> LLM drafts concept-specific MCQ questions with 4 distinct answer quality grades (<em>Correct, Nearly Correct, Wrong, Clearly Wrong</em>).</li>
                        <li><strong>Step 2:</strong> Drafts are automatically stored in the <span style="color: var(--warning); font-weight: 600;">PENDING</span> state.</li>
                        <li><strong>Step 3:</strong> Unapproved questions are <u>never</u> exposed to students. Teachers review, edit, and approve them.</li>
                        <li><strong>Step 4:</strong> Approved questions enter the active bank used for 15-question post-tests and ML mastery validation.</li>
                    </ul>
                </div>

                <div id="gen-output-list">
                    <div style="text-align: center; padding: 3rem 1rem; color: var(--text-secondary); border: 2px dashed var(--border-color); border-radius: 0.8rem;">
                        <i class="fa-solid fa-brain" style="font-size: 2.5rem; color: #6366f1; opacity: 0.6; margin-bottom: 1rem;"></i>
                        <p style="font-size: 1rem; font-weight: 500;">Select parameters and click "Generate Draft Questions" to start.</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById("gen-form")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById("gen-submit-btn");
        const outputList = document.getElementById("gen-output-list");

        const concept = document.getElementById("gen-concept").value;
        const qType = document.getElementById("gen-type").value || null;
        const difficulty = document.getElementById("gen-difficulty").value;
        const errorType = document.getElementById("gen-error-type").value;
        const count = parseInt(document.getElementById("gen-count").value) || 5;

        submitBtn.disabled = true;
        submitBtn.innerHTML = `<div class="spinner" style="width: 16px; height: 16px; border-width: 2px;"></div> Generating Drafts...`;
        outputList.innerHTML = `<div style="text-align: center; padding: 3rem;"><div class="spinner"></div><p style="color: var(--text-secondary); margin-top: 1rem;">Generating structured draft questions via LLM...</p></div>`;

        try {
            const res = await SchemaMasteryAPI.generateQuestions({
                concept_name: concept,
                question_type: qType,
                difficulty: difficulty,
                target_error_type: errorType,
                count: count,
            });

            submitBtn.disabled = false;
            submitBtn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> Generate Draft Questions`;

            await refreshCounts();

            if (res.success && res.questions?.length) {
                outputList.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <span style="font-weight: 600; color: #10b981;">✓ Successfully generated ${res.questions.length} draft questions (Status: PENDING)</span>
                        <button class="btn btn-sm" id="view-pending-tab-btn" style="background: rgba(99, 102, 241, 0.2); color: #a5b4fc; font-weight: 600;">Go to Review →</button>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 1rem;">
                        ${res.questions.map(q => renderQuestionCard(q, { showActions: true, isDraft: true })).join("")}
                    </div>
                `;

                document.getElementById("view-pending-tab-btn")?.addEventListener("click", () => {
                    activeTab = "pending";
                    document.querySelectorAll(".qbank-tab-btn").forEach(b => b.classList.toggle("active", b.dataset.tab === "pending"));
                    renderTabContent();
                });

                attachQuestionCardHandlers();
            } else {
                outputList.innerHTML = `<div style="color: #ef4444;">Failed to generate draft questions.</div>`;
            }
        } catch (err) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> Generate Draft Questions`;
            outputList.innerHTML = `<div style="color: #ef4444; padding: 1rem;">Error: ${err.message}</div>`;
        }
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. PENDING REVIEW TAB
// ─────────────────────────────────────────────────────────────────────────────
function renderPendingTab(content) {
    if (pendingQuestions.length === 0) {
        content.innerHTML = `
            <div style="text-align: center; padding: 4rem 1rem; color: var(--text-secondary); border: 2px dashed var(--border-color); border-radius: 0.8rem;">
                <i class="fa-solid fa-check-circle" style="font-size: 3rem; color: #10b981; margin-bottom: 1rem;"></i>
                <h3>No Pending Questions to Review</h3>
                <p style="margin-top: 0.5rem;">All generated questions have been approved or rejected. Generate more in Tab 1.</p>
            </div>
        `;
        return;
    }

    content.innerHTML = `
        <div style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <span style="font-size: 1.1rem; font-weight: 700;">${pendingQuestions.length} Questions Awaiting Teacher Approval</span>
                <p style="font-size: 0.85rem; color: var(--text-secondary);">Verify answer keys, option quality tiers, and conceptual clarity before approving.</p>
            </div>
            <div>
                <button class="btn btn-sm" id="approve-all-btn" style="background: #10b981; color: white; font-weight: 600;">
                    <i class="fa-solid fa-check-double"></i> Approve All
                </button>
            </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1.2rem;" id="pending-list">
            ${pendingQuestions.map(q => renderQuestionCard(q, { showActions: true, isDraft: true })).join("")}
        </div>
    `;

    document.getElementById("approve-all-btn")?.addEventListener("click", async () => {
        if (!confirm(`Approve all ${pendingQuestions.length} pending questions into the active bank?`)) return;
        for (const q of pendingQuestions) {
            await SchemaMasteryAPI.approveQuestion(q.id, { approved_by: "Teacher Batch" });
        }
        await refreshCounts();
        renderTabContent();
    });

    attachQuestionCardHandlers();
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. APPROVED QUESTION BANK TAB
// ─────────────────────────────────────────────────────────────────────────────
function renderApprovedTab(content) {
    content.innerHTML = `
        <div style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
                <span style="font-size: 1.1rem; font-weight: 700;">Approved Question Bank (${approvedQuestions.length} Total)</span>
                <p style="font-size: 0.85rem; color: var(--text-secondary);">These validated questions are actively sampled for student post-tests.</p>
            </div>

            <div style="display: flex; gap: 0.5rem; align-items: center;">
                <label style="font-size: 0.85rem; color: var(--text-secondary);">Filter Concept:</label>
                <select id="approved-filter-concept" class="input" style="padding: 0.4rem 0.8rem; background: var(--bg-dark, #0f121d); color: var(--text-primary); border: 1px solid var(--border-color); border-radius: 0.4rem;">
                    <option value="">All Concepts</option>
                    ${CONCEPTS.map(c => `<option value="${c}">${c}</option>`).join("")}
                </select>
            </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1.2rem;" id="approved-list">
            ${approvedQuestions.map(q => renderQuestionCard(q, { showActions: false, isDraft: false })).join("")}
        </div>
    `;

    document.getElementById("approved-filter-concept")?.addEventListener("change", (e) => {
        const selected = e.target.value;
        const filtered = selected
            ? approvedQuestions.filter(q => q.concept_name?.toLowerCase() === selected.toLowerCase())
            : approvedQuestions;
        const listEl = document.getElementById("approved-list");
        if (listEl) {
            listEl.innerHTML = filtered.map(q => renderQuestionCard(q, { showActions: false, isDraft: false })).join("");
        }
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// CARD RENDERER
// ─────────────────────────────────────────────────────────────────────────────
function renderQuestionCard(q, { showActions = true, isDraft = true } = {}) {
    const isEditing = editingQuestionId === q.id;
    if (isEditing) {
        return renderEditQuestionCard(q);
    }

    const qualityStyles = {
        "Correct": "background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.4);",
        "Nearly Correct": "background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.4);",
        "Wrong": "background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.4);",
        "Clearly Wrong": "background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.4);",
    };

    const options = [
        { key: "A", text: q.option_a, quality: q.option_a_quality || "Wrong" },
        { key: "B", text: q.option_b, quality: q.option_b_quality || "Wrong" },
        { key: "C", text: q.option_c, quality: q.option_c_quality || "Wrong" },
        { key: "D", text: q.option_d, quality: q.option_d_quality || "Wrong" },
    ];

    return `
        <div class="card q-card" data-qid="${q.id}" style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 0.8rem; padding: 1.3rem; box-shadow: var(--shadow-sm); transition: transform 0.15s ease;">
            <!-- Header Metadata -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.8rem; flex-wrap: wrap; gap: 0.5rem;">
                <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
                    <span style="background: var(--primary-soft); color: var(--primary); font-weight: 700; font-size: 0.75rem; padding: 0.2rem 0.5rem; border-radius: 0.3rem;">
                        ${q.question_id || q.id}
                    </span>
                    <span style="background: var(--bg-subtle); color: var(--text-primary); font-weight: 600; font-size: 0.75rem; padding: 0.2rem 0.5rem; border-radius: 0.3rem;">
                        ${q.concept_name}
                    </span>
                    <span style="background: var(--bg-subtle); color: var(--text-secondary); font-size: 0.75rem; padding: 0.2rem 0.5rem; border-radius: 0.3rem;">
                        ${q.question_type || "Basic"}
                    </span>
                    <span style="font-size: 0.75rem; color: var(--text-secondary); padding: 0.2rem 0.5rem;">
                        Difficulty: <strong>${q.difficulty || "Medium"}</strong>
                    </span>
                    ${q.target_error_type ? `<span style="background: var(--danger-soft); color: var(--danger); font-size: 0.75rem; padding: 0.2rem 0.5rem; border-radius: 0.3rem;">Focus: ${q.target_error_type}</span>` : ""}
                </div>

                <div>
                    ${isDraft ? `
                        <span style="background: var(--warning-soft); color: var(--warning); font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 999px;">
                            <i class="fa-solid fa-hourglass-half"></i> PENDING REVIEW
                        </span>
                    ` : `
                        <span style="background: var(--success-soft); color: var(--success); font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 999px;">
                            <i class="fa-solid fa-circle-check"></i> APPROVED (Exposures: ${q.exposure_count || 0})
                        </span>
                    `}
                </div>
            </div>

            <!-- Question Text -->
            <p style="font-size: 1.05rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.8rem; line-height: 1.4;">${escapeHtml(q.question_text || "")}</p>

            <!-- Code Snippet (if any) -->
            ${q.code_snippet ? `
                <div style="background: var(--bg-subtle); border: 1px solid var(--border-color); border-radius: 0.5rem; padding: 0.8rem 1rem; margin-bottom: 1rem; font-family: monospace; font-size: 0.9rem; overflow-x: auto; color: var(--text-primary);">
                    <pre style="margin: 0;"><code>${escapeHtml(q.code_snippet)}</code></pre>
                </div>
            ` : ""}

            <!-- 4-Tier Options -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; margin-bottom: 1rem;">
                ${options.map(opt => `
                    <div style="padding: 0.6rem 0.8rem; border-radius: 0.4rem; background: ${q.correct_option === opt.key ? 'var(--success-soft)' : '#FFFFFF'}; border: 1px solid ${q.correct_option === opt.key ? 'var(--success)' : 'var(--border-color)'}; display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; color: var(--text-primary);">
                        <div>
                            <strong style="color: ${q.correct_option === opt.key ? 'var(--success)' : 'var(--text-secondary)'}; margin-right: 0.4rem;">${opt.key}.</strong>
                            <span>${escapeHtml(opt.text || "")}</span>
                        </div>
                        <span style="font-size: 0.7rem; font-weight: 700; padding: 0.15rem 0.45rem; border-radius: 0.3rem; ${qualityStyles[opt.quality] || qualityStyles['Wrong']}">
                            ${opt.quality}
                        </span>
                    </div>
                `).join("")}
            </div>

            <!-- Explanation / Outcome Footer -->
            <div style="border-top: 1px solid var(--border-color); padding-top: 0.8rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                <div style="font-size: 0.8rem; color: var(--text-secondary); max-width: 70%;">
                    ${q.explanation ? `<strong>Explanation:</strong> ${escapeHtml(q.explanation)}` : `<em>Outcome: ${escapeHtml(q.learning_outcome || "")}</em>`}
                </div>

                ${showActions ? `
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn btn-sm edit-q-btn" data-id="${q.id}" style="background: rgba(255,255,255,0.1); color: var(--text-primary);">
                            <i class="fa-solid fa-pen-to-square"></i> Edit
                        </button>
                        <button class="btn btn-sm reject-q-btn" data-id="${q.id}" style="background: rgba(239, 68, 68, 0.2); color: #f87171;">
                            <i class="fa-solid fa-xmark"></i> Reject
                        </button>
                        <button class="btn btn-sm approve-q-btn" data-id="${q.id}" style="background: #10b981; color: white; font-weight: 600;">
                            <i class="fa-solid fa-check"></i> Approve
                        </button>
                    </div>
                ` : ""}
            </div>
        </div>
    `;
}

// ─────────────────────────────────────────────────────────────────────────────
// EDIT CARD VIEW
// ─────────────────────────────────────────────────────────────────────────────
function renderEditQuestionCard(q) {
    return `
        <div class="card" style="background: #1e2235; border: 2px solid #6366f1; border-radius: 0.8rem; padding: 1.5rem;">
            <h4 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 1rem; color: #818cf8;">
                <i class="fa-solid fa-pen-to-square"></i> Editing Question: ${q.question_id || q.id}
            </h4>

            <form class="edit-q-form" data-id="${q.id}" style="display: flex; flex-direction: column; gap: 0.8rem;">
                <div>
                    <label style="font-size: 0.8rem; color: var(--text-secondary);">Question Text</label>
                    <textarea class="input input-field edit-text" rows="2" style="width: 100%; padding: 0.5rem; background: #FFFFFF; color: var(--text-primary); border: 1px solid var(--border-color); border-radius: 0.4rem;">${escapeHtml(q.question_text || "")}</textarea>
                </div>

                <div>
                    <label style="font-size: 0.8rem; color: var(--text-secondary);">Code Snippet (Optional Java)</label>
                    <textarea class="input input-field edit-code" rows="3" style="width: 100%; padding: 0.5rem; background: var(--bg-subtle); color: var(--text-primary); font-family: monospace; border: 1px solid var(--border-color); border-radius: 0.4rem;">${escapeHtml(q.code_snippet || "")}</textarea>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem;">
                    <div>
                        <label style="font-size: 0.75rem; color: var(--text-secondary);">Option A</label>
                        <input type="text" class="input input-field edit-opt-a" value="${escapeHtml(q.option_a || "")}" style="width: 100%; padding: 0.4rem; background: #FFFFFF; color: var(--text-primary); border: 1px solid var(--border-color);" />
                        <select class="input input-field edit-qa" style="width: 100%; margin-top: 0.2rem; padding: 0.3rem; background: #FFFFFF; color: var(--text-primary);">
                            <option value="Correct" ${q.option_a_quality === 'Correct' ? 'selected' : ''}>Correct (1.0)</option>
                            <option value="Nearly Correct" ${q.option_a_quality === 'Nearly Correct' ? 'selected' : ''}>Nearly Correct (0.5)</option>
                            <option value="Wrong" ${q.option_a_quality === 'Wrong' ? 'selected' : ''}>Wrong (0.0)</option>
                            <option value="Clearly Wrong" ${q.option_a_quality === 'Clearly Wrong' ? 'selected' : ''}>Clearly Wrong (0.0)</option>
                        </select>
                    </div>

                    <div>
                        <label style="font-size: 0.75rem; color: var(--text-secondary);">Option B</label>
                        <input type="text" class="input input-field edit-opt-b" value="${escapeHtml(q.option_b || "")}" style="width: 100%; padding: 0.4rem; background: #FFFFFF; color: var(--text-primary); border: 1px solid var(--border-color);" />
                        <select class="input input-field edit-qb" style="width: 100%; margin-top: 0.2rem; padding: 0.3rem; background: #FFFFFF; color: var(--text-primary);">
                            <option value="Correct" ${q.option_b_quality === 'Correct' ? 'selected' : ''}>Correct (1.0)</option>
                            <option value="Nearly Correct" ${q.option_b_quality === 'Nearly Correct' ? 'selected' : ''}>Nearly Correct (0.5)</option>
                            <option value="Wrong" ${q.option_b_quality === 'Wrong' ? 'selected' : ''}>Wrong (0.0)</option>
                            <option value="Clearly Wrong" ${q.option_b_quality === 'Clearly Wrong' ? 'selected' : ''}>Clearly Wrong (0.0)</option>
                        </select>
                    </div>

                    <div>
                        <label style="font-size: 0.75rem; color: var(--text-secondary);">Option C</label>
                        <input type="text" class="input input-field edit-opt-c" value="${escapeHtml(q.option_c || "")}" style="width: 100%; padding: 0.4rem; background: #FFFFFF; color: var(--text-primary); border: 1px solid var(--border-color);" />
                        <select class="input input-field edit-qc" style="width: 100%; margin-top: 0.2rem; padding: 0.3rem; background: #FFFFFF; color: var(--text-primary);">
                            <option value="Correct" ${q.option_c_quality === 'Correct' ? 'selected' : ''}>Correct (1.0)</option>
                            <option value="Nearly Correct" ${q.option_c_quality === 'Nearly Correct' ? 'selected' : ''}>Nearly Correct (0.5)</option>
                            <option value="Wrong" ${q.option_c_quality === 'Wrong' ? 'selected' : ''}>Wrong (0.0)</option>
                            <option value="Clearly Wrong" ${q.option_c_quality === 'Clearly Wrong' ? 'selected' : ''}>Clearly Wrong (0.0)</option>
                        </select>
                    </div>

                    <div>
                        <label style="font-size: 0.75rem; color: var(--text-secondary);">Option D</label>
                        <input type="text" class="input input-field edit-opt-d" value="${escapeHtml(q.option_d || "")}" style="width: 100%; padding: 0.4rem; background: #FFFFFF; color: var(--text-primary); border: 1px solid var(--border-color);" />
                        <select class="input input-field edit-qd" style="width: 100%; margin-top: 0.2rem; padding: 0.3rem; background: #FFFFFF; color: var(--text-primary);">
                            <option value="Correct" ${q.option_d_quality === 'Correct' ? 'selected' : ''}>Correct (1.0)</option>
                            <option value="Nearly Correct" ${q.option_d_quality === 'Nearly Correct' ? 'selected' : ''}>Nearly Correct (0.5)</option>
                            <option value="Wrong" ${q.option_d_quality === 'Wrong' ? 'selected' : ''}>Wrong (0.0)</option>
                            <option value="Clearly Wrong" ${q.option_d_quality === 'Clearly Wrong' ? 'selected' : ''}>Clearly Wrong (0.0)</option>
                        </select>
                    </div>
                </div>

                <div style="display: flex; gap: 1rem;">
                    <div style="flex: 1;">
                        <label style="font-size: 0.75rem; color: var(--text-secondary);">Correct Option Key</label>
                        <select class="input input-field edit-correct-opt" style="width: 100%; padding: 0.4rem; background: #FFFFFF; color: var(--text-primary);">
                            <option value="A" ${q.correct_option === 'A' ? 'selected' : ''}>A</option>
                            <option value="B" ${q.correct_option === 'B' ? 'selected' : ''}>B</option>
                            <option value="C" ${q.correct_option === 'C' ? 'selected' : ''}>C</option>
                            <option value="D" ${q.correct_option === 'D' ? 'selected' : ''}>D</option>
                        </select>
                    </div>
                    <div style="flex: 2;">
                        <label style="font-size: 0.75rem; color: var(--text-secondary);">Explanation</label>
                        <input type="text" class="input input-field edit-exp" value="${escapeHtml(q.explanation || "")}" style="width: 100%; padding: 0.4rem; background: #FFFFFF; color: var(--text-primary); border: 1px solid var(--border-color);" />
                    </div>
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 0.6rem; margin-top: 0.5rem;">
                    <button type="button" class="btn btn-outline btn-sm cancel-edit-btn" style="color: var(--text-primary);">Cancel</button>
                    <button type="submit" class="btn btn-sm btn-primary" style="font-weight: 600;">
                        <i class="fa-solid fa-floppy-disk"></i> Save Changes
                    </button>
                </div>
            </form>
        </div>
    `;
}

// ─────────────────────────────────────────────────────────────────────────────
// CARD ACTIONS ATTACHMENT
// ─────────────────────────────────────────────────────────────────────────────
function attachQuestionCardHandlers() {
    // Approve button
    document.querySelectorAll(".approve-q-btn").forEach((btn) => {
        btn.addEventListener("click", async () => {
            const qid = btn.dataset.id;
            btn.disabled = true;
            btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i>`;
            try {
                await SchemaMasteryAPI.approveQuestion(qid, { approved_by: "Teacher Reviewer" });
                await refreshCounts();
                renderTabContent();
            } catch (e) {
                alert("Approval failed: " + e.message);
                btn.disabled = false;
            }
        });
    });

    // Reject button
    document.querySelectorAll(".reject-q-btn").forEach((btn) => {
        btn.addEventListener("click", async () => {
            const qid = btn.dataset.id;
            const reason = prompt("Enter reason for rejection:", "Did not meet pedagogical clarity standard");
            if (!reason) return;
            try {
                await SchemaMasteryAPI.rejectQuestion(qid, { reason });
                await refreshCounts();
                renderTabContent();
            } catch (e) {
                alert("Rejection failed: " + e.message);
            }
        });
    });

    // Edit button
    document.querySelectorAll(".edit-q-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            editingQuestionId = btn.dataset.id;
            renderTabContent();
        });
    });

    // Cancel edit
    document.querySelectorAll(".cancel-edit-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            editingQuestionId = null;
            renderTabContent();
        });
    });

    // Save edit form
    document.querySelectorAll(".edit-q-form").forEach((form) => {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const qid = form.dataset.id;
            const updates = {
                question_text: form.querySelector(".edit-text").value,
                code_snippet: form.querySelector(".edit-code").value,
                option_a: form.querySelector(".edit-opt-a").value,
                option_b: form.querySelector(".edit-opt-b").value,
                option_c: form.querySelector(".edit-opt-c").value,
                option_d: form.querySelector(".edit-opt-d").value,
                option_a_quality: form.querySelector(".edit-qa").value,
                option_b_quality: form.querySelector(".edit-qb").value,
                option_c_quality: form.querySelector(".edit-qc").value,
                option_d_quality: form.querySelector(".edit-qd").value,
                correct_option: form.querySelector(".edit-correct-opt").value,
                explanation: form.querySelector(".edit-exp").value,
            };

            try {
                await SchemaMasteryAPI.updateQuestion(qid, updates);
                editingQuestionId = null;
                await refreshCounts();
                renderTabContent();
            } catch (err) {
                alert("Update failed: " + err.message);
            }
        });
    });
}

function escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}
