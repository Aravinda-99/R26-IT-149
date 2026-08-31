/**
 * Teacher/Admin Question Bank Management Dashboard
 * =================================================
 * Component 4: LLM-Assisted Question Generation & Teacher Approval Workflow
 *
 * Provides:
 *   1. Clean white-theme LMS educator UI
 *   2. Balanced A/B/C/D option generation and inspection
 *   3. 4-tier answer quality validation (Correct, Nearly Correct, Wrong, Clearly Wrong)
 *   4. Full question lifecycle: Draft -> Pending Review -> Approved Bank -> Inactive / Rejected / Soft-Deleted
 *   5. Real-time filtering, search, inline editing modal, and confirmation dialogs
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

let activeTab = "approved"; // Default to Approved Bank for quick educator lookup
let pendingQuestions = [];
let approvedQuestions = [];
let rejectedQuestions = [];
let editingQuestionId = null;
let searchQuery = "";
let selectedConceptFilter = "";
let selectedTypeFilter = "";
let selectedDifficultyFilter = "";
let selectedStatusFilter = "all";

export async function renderQuestionBank(container, opts = {}) {
    if (opts.initialTab) {
        activeTab = opts.initialTab;
    }

    container.innerHTML = `
        <div class="qbank-page" style="padding: 1.5rem 2rem; max-width: 1320px; margin: 0 auto; color: var(--text-primary); font-family: inherit;">
            <!-- Header Banner -->
            <div class="qbank-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 0.75rem; padding: 1.25rem 1.5rem; box-shadow: var(--shadow-sm);">
                <div>
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.3rem;">
                        <span style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; background: #EEF2FF; color: #4F46E5; padding: 0.2rem 0.6rem; border-radius: 9999px;">
                            Component 4 • Schema Mastery
                        </span>
                        <span style="font-size: 0.75rem; color: var(--text-muted);">Question Bank & Assessment Hub</span>
                    </div>
                    <h1 style="font-size: 1.5rem; font-weight: 700; color: #0F172A; margin: 0;">
                        Question Bank & LLM Generation Hub
                    </h1>
                    <p style="color: var(--text-secondary); margin: 0.25rem 0 0 0; font-size: 0.88rem;">
                        Review, edit, and approve 4-tier diagnostic questions. Only teacher-approved active questions are served in student post-tests.
                    </p>
                </div>
                <div style="display: flex; gap: 0.6rem; align-items: center;">
                    <div id="storage-source-badge" style="background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 0.5rem; padding: 0.4rem 0.8rem; font-size: 0.82rem; color: #1E40AF; font-weight: 600; display: flex; align-items: center; gap: 0.4rem;">
                        <i class="fa-solid fa-database" style="color: #3B82F6;"></i> Firestore Primary
                    </div>
                    <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 0.5rem; padding: 0.4rem 0.8rem; font-size: 0.82rem; color: #166534; font-weight: 600; display: flex; align-items: center; gap: 0.4rem;">
                        <i class="fa-solid fa-shield-check" style="color: #16A34A;"></i> Teacher Review Active
                    </div>
                </div>
            </div>

            <!-- Tab Navigation Toolbar -->
            <div class="qbank-tabs-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.75rem;">
                <div class="qbank-tabs" style="display: flex; gap: 0.5rem; background: #F1F5F9; padding: 0.3rem; border-radius: 0.6rem; border: 1px solid var(--border-color);">
                    <button class="btn qbank-tab-btn ${activeTab === 'approved' ? 'active' : ''}" data-tab="approved" style="padding: 0.5rem 1rem; font-size: 0.85rem; font-weight: 600; border-radius: 0.4rem; border: none; cursor: pointer; transition: all 0.15s; background: ${activeTab === 'approved' ? '#FFFFFF' : 'transparent'}; color: ${activeTab === 'approved' ? '#0F172A' : '#64748B'}; box-shadow: ${activeTab === 'approved' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'};">
                        <i class="fa-solid fa-book-bookmark" style="margin-right: 0.35rem; color: #4F46E5;"></i> Approved Bank
                        <span id="approved-badge" style="background: #10B981; color: white; border-radius: 999px; padding: 0.1rem 0.45rem; font-size: 0.72rem; margin-left: 0.35rem;">0</span>
                    </button>
                    <button class="btn qbank-tab-btn ${activeTab === 'pending' ? 'active' : ''}" data-tab="pending" style="padding: 0.5rem 1rem; font-size: 0.85rem; font-weight: 600; border-radius: 0.4rem; border: none; cursor: pointer; transition: all 0.15s; background: ${activeTab === 'pending' ? '#FFFFFF' : 'transparent'}; color: ${activeTab === 'pending' ? '#0F172A' : '#64748B'}; box-shadow: ${activeTab === 'pending' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'};">
                        <i class="fa-solid fa-clipboard-check" style="margin-right: 0.35rem; color: #F59E0B;"></i> Pending Review
                        <span id="pending-badge" style="background: #F59E0B; color: white; border-radius: 999px; padding: 0.1rem 0.45rem; font-size: 0.72rem; margin-left: 0.35rem;">0</span>
                    </button>
                    <button class="btn qbank-tab-btn ${activeTab === 'generate' ? 'active' : ''}" data-tab="generate" style="padding: 0.5rem 1rem; font-size: 0.85rem; font-weight: 600; border-radius: 0.4rem; border: none; cursor: pointer; transition: all 0.15s; background: ${activeTab === 'generate' ? '#FFFFFF' : 'transparent'}; color: ${activeTab === 'generate' ? '#0F172A' : '#64748B'}; box-shadow: ${activeTab === 'generate' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'};">
                        <i class="fa-solid fa-wand-magic-sparkles" style="margin-right: 0.35rem; color: #2563EB;"></i> Generate (LLM)
                    </button>
                    <button class="btn qbank-tab-btn ${activeTab === 'rejected' ? 'active' : ''}" data-tab="rejected" style="padding: 0.5rem 1rem; font-size: 0.85rem; font-weight: 600; border-radius: 0.4rem; border: none; cursor: pointer; transition: all 0.15s; background: ${activeTab === 'rejected' ? '#FFFFFF' : 'transparent'}; color: ${activeTab === 'rejected' ? '#0F172A' : '#64748B'}; box-shadow: ${activeTab === 'rejected' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'};">
                        <i class="fa-solid fa-ban" style="margin-right: 0.35rem; color: #EF4444;"></i> Rejected Archive
                        <span id="rejected-badge" style="background: #94A3B8; color: white; border-radius: 999px; padding: 0.1rem 0.45rem; font-size: 0.72rem; margin-left: 0.35rem;">0</span>
                    </button>
                </div>

                <div style="display: flex; gap: 0.5rem;">
                    <button id="refresh-qbank-btn" class="btn btn-outline" style="padding: 0.45rem 0.8rem; font-size: 0.82rem; font-weight: 600; border-radius: 0.4rem; background: #FFFFFF; border: 1px solid var(--border-color); color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; gap: 0.4rem;">
                        <i class="fa-solid fa-arrows-rotate"></i> Refresh
                    </button>
                </div>
            </div>

            <!-- Tab Content Area -->
            <div id="qbank-content">
                <div style="text-align: center; padding: 3rem 0;">
                    <div class="spinner" style="margin: 0 auto 1rem;"></div>
                    <p style="color: var(--text-secondary); font-size: 0.88rem;">Loading question records...</p>
                </div>
            </div>
        </div>
    `;

    // Tab buttons
    container.querySelectorAll(".qbank-tab-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            container.querySelectorAll(".qbank-tab-btn").forEach((b) => {
                b.style.background = "transparent";
                b.style.color = "#64748B";
                b.style.boxShadow = "none";
            });
            btn.style.background = "#FFFFFF";
            btn.style.color = "#0F172A";
            btn.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
            activeTab = btn.dataset.tab;
            renderTabContent();
        });
    });

    document.getElementById("refresh-qbank-btn")?.addEventListener("click", async () => {
        const btn = document.getElementById("refresh-qbank-btn");
        if (btn) btn.innerHTML = `<i class="fa-solid fa-arrows-rotate fa-spin"></i> Refreshing...`;
        await refreshCounts();
        renderTabContent();
        if (btn) btn.innerHTML = `<i class="fa-solid fa-arrows-rotate"></i> Refresh`;
    });

    await refreshCounts();
    renderTabContent();
}

async function refreshCounts() {
    try {
        const [penRes, appRes, rejRes] = await Promise.allSettled([
            SchemaMasteryAPI.getPendingQuestions(),
            SchemaMasteryAPI.getQuestionBank("", false), // get all active + inactive
            SchemaMasteryAPI.getRejectedQuestions(),
        ]);
        pendingQuestions = (penRes.status === "fulfilled" && penRes.value && penRes.value.questions) ? penRes.value.questions : [];
        approvedQuestions = (appRes.status === "fulfilled" && appRes.value && appRes.value.questions) ? appRes.value.questions : [];
        rejectedQuestions = (rejRes.status === "fulfilled" && rejRes.value && rejRes.value.questions) ? rejRes.value.questions : [];

        const storageSource = (appRes.status === "fulfilled" && appRes.value && appRes.value.storage_source) ? appRes.value.storage_source : "firestore";
        const storageBadge = document.getElementById("storage-source-badge");
        if (storageBadge) {
            if (storageSource === "firestore") {
                storageBadge.innerHTML = `<i class="fa-solid fa-database" style="color: #3B82F6;"></i> Firestore Primary`;
                storageBadge.style.background = "#EFF6FF";
                storageBadge.style.color = "#1E40AF";
                storageBadge.style.borderColor = "#BFDBFE";
            } else {
                storageBadge.innerHTML = `<i class="fa-solid fa-hard-drive" style="color: #F59E0B;"></i> Local Fallback`;
                storageBadge.style.background = "#FFFBEB";
                storageBadge.style.color = "#92400E";
                storageBadge.style.borderColor = "#FDE68A";
            }
        }

        const penBadge = document.getElementById("pending-badge");
        const appBadge = document.getElementById("approved-badge");
        const rejBadge = document.getElementById("rejected-badge");
        if (penBadge) penBadge.textContent = pendingQuestions.length;
        if (appBadge) appBadge.textContent = approvedQuestions.length;
        if (rejBadge) rejBadge.textContent = rejectedQuestions.length;
    } catch (e) {
        console.warn("Failed to refresh question bank counts:", e);
    }
}

function renderTabContent() {
    const content = document.getElementById("qbank-content");
    if (!content) return;

    if (activeTab === "approved") {
        renderApprovedTab(content);
    } else if (activeTab === "pending") {
        renderPendingTab(content);
    } else if (activeTab === "generate") {
        renderGenerateTab(content);
    } else if (activeTab === "rejected") {
        renderRejectedTab(content);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. APPROVED QUESTION BANK TAB
// ─────────────────────────────────────────────────────────────────────────────
function renderApprovedTab(content) {
    const filtered = approvedQuestions.filter(q => {
        if (selectedConceptFilter && q.concept_name?.toLowerCase() !== selectedConceptFilter.toLowerCase()) return false;
        if (selectedTypeFilter && q.question_type !== selectedTypeFilter) return false;
        if (selectedDifficultyFilter && q.difficulty !== selectedDifficultyFilter) return false;
        if (selectedStatusFilter === "active" && q.active === false) return false;
        if (selectedStatusFilter === "inactive" && q.active !== false) return false;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const text = (q.question_text || "").toLowerCase();
            const id = (q.question_id || q.id || "").toLowerCase();
            const concept = (q.concept_name || "").toLowerCase();
            if (!text.includes(query) && !id.includes(query) && !concept.includes(query)) return false;
        }
        return true;
    });

    content.innerHTML = `
        <!-- Filter and Search Toolbar -->
        <div class="card" style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 0.6rem; padding: 0.9rem 1.2rem; margin-bottom: 1rem; box-shadow: var(--shadow-sm);">
            <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 220px; position: relative;">
                    <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 0.85rem;"></i>
                    <input type="text" id="approved-search-input" value="${escapeHtml(searchQuery)}" placeholder="Search by keyword, question ID, or concept..." style="width: 100%; padding: 0.45rem 0.75rem 0.45rem 2.2rem; font-size: 0.85rem; border: 1px solid var(--border-color); border-radius: 0.4rem; outline: none;" />
                </div>

                <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
                    <select id="approved-filter-concept" style="padding: 0.45rem 0.6rem; font-size: 0.82rem; border: 1px solid var(--border-color); border-radius: 0.4rem; background: #FFFFFF; color: var(--text-primary);">
                        <option value="">All Concepts</option>
                        ${CONCEPTS.map(c => `<option value="${c}" ${selectedConceptFilter === c ? 'selected' : ''}>${c}</option>`).join("")}
                    </select>

                    <select id="approved-filter-type" style="padding: 0.45rem 0.6rem; font-size: 0.82rem; border: 1px solid var(--border-color); border-radius: 0.4rem; background: #FFFFFF; color: var(--text-primary);">
                        <option value="">All Types</option>
                        ${QUESTION_TYPES.map(t => `<option value="${t}" ${selectedTypeFilter === t ? 'selected' : ''}>${t}</option>`).join("")}
                    </select>

                    <select id="approved-filter-difficulty" style="padding: 0.45rem 0.6rem; font-size: 0.82rem; border: 1px solid var(--border-color); border-radius: 0.4rem; background: #FFFFFF; color: var(--text-primary);">
                        <option value="">All Difficulties</option>
                        <option value="Easy" ${selectedDifficultyFilter === 'Easy' ? 'selected' : ''}>Easy</option>
                        <option value="Medium" ${selectedDifficultyFilter === 'Medium' ? 'selected' : ''}>Medium</option>
                        <option value="Hard" ${selectedDifficultyFilter === 'Hard' ? 'selected' : ''}>Hard</option>
                    </select>

                    <select id="approved-filter-status" style="padding: 0.45rem 0.6rem; font-size: 0.82rem; border: 1px solid var(--border-color); border-radius: 0.4rem; background: #FFFFFF; color: var(--text-primary);">
                        <option value="all" ${selectedStatusFilter === 'all' ? 'selected' : ''}>All Statuses</option>
                        <option value="active" ${selectedStatusFilter === 'active' ? 'selected' : ''}>Active Only</option>
                        <option value="inactive" ${selectedStatusFilter === 'inactive' ? 'selected' : ''}>Inactive Only</option>
                    </select>

                    ${(selectedConceptFilter || selectedTypeFilter || selectedDifficultyFilter || selectedStatusFilter !== 'all' || searchQuery) ? `
                        <button id="clear-approved-filters" class="btn btn-outline" style="padding: 0.4rem 0.7rem; font-size: 0.8rem; border-radius: 0.4rem; color: #EF4444; border-color: #FECACA;">
                            <i class="fa-solid fa-xmark"></i> Clear
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>

        <!-- Summary Bar -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem; font-size: 0.85rem; color: var(--text-secondary);">
            <span>Showing <strong>${filtered.length}</strong> of <strong>${approvedQuestions.length}</strong> approved questions</span>
            <span style="font-size: 0.78rem; color: var(--text-muted);"><i class="fa-solid fa-circle-info" style="color: #6366F1;"></i> Only active questions with status APPROVED are sampled in student post-tests.</span>
        </div>

        <!-- Question List -->
        <div style="display: flex; flex-direction: column; gap: 0.85rem;" id="approved-list">
            ${filtered.length > 0 ? filtered.map(q => renderQuestionCard(q, { showActions: true, isApprovedTab: true })).join("") : `
                <div style="text-align: center; padding: 3.5rem 1rem; background: #FFFFFF; border: 1px dashed var(--border-color); border-radius: 0.6rem; color: var(--text-secondary);">
                    <i class="fa-solid fa-folder-open" style="font-size: 2.2rem; color: #94A3B8; margin-bottom: 0.75rem;"></i>
                    <h3 style="font-size: 1rem; font-weight: 600; color: #0F172A; margin: 0 0 0.3rem 0;">No approved questions match your criteria</h3>
                    <p style="font-size: 0.84rem; margin: 0;">Try adjusting filters or generate and approve questions from the Pending Review queue.</p>
                </div>
            `}
        </div>
    `;

    // Filter event listeners
    document.getElementById("approved-search-input")?.addEventListener("input", (e) => {
        searchQuery = e.target.value;
        renderApprovedTab(content);
    });
    document.getElementById("approved-filter-concept")?.addEventListener("change", (e) => {
        selectedConceptFilter = e.target.value;
        renderApprovedTab(content);
    });
    document.getElementById("approved-filter-type")?.addEventListener("change", (e) => {
        selectedTypeFilter = e.target.value;
        renderApprovedTab(content);
    });
    document.getElementById("approved-filter-difficulty")?.addEventListener("change", (e) => {
        selectedDifficultyFilter = e.target.value;
        renderApprovedTab(content);
    });
    document.getElementById("approved-filter-status")?.addEventListener("change", (e) => {
        selectedStatusFilter = e.target.value;
        renderApprovedTab(content);
    });
    document.getElementById("clear-approved-filters")?.addEventListener("click", () => {
        searchQuery = "";
        selectedConceptFilter = "";
        selectedTypeFilter = "";
        selectedDifficultyFilter = "";
        selectedStatusFilter = "all";
        renderApprovedTab(content);
    });

    attachQuestionCardHandlers();
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. PENDING REVIEW TAB
// ─────────────────────────────────────────────────────────────────────────────
function renderPendingTab(content) {
    if (pendingQuestions.length === 0) {
        content.innerHTML = `
            <div style="text-align: center; padding: 4rem 1rem; background: #FFFFFF; border: 1px dashed var(--border-color); border-radius: 0.75rem; color: var(--text-secondary); box-shadow: var(--shadow-sm);">
                <div style="width: 52px; height: 52px; border-radius: 999px; background: #ECFDF5; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 0.8rem;">
                    <i class="fa-solid fa-check" style="font-size: 1.5rem; color: #10B981;"></i>
                </div>
                <h3 style="font-size: 1.1rem; font-weight: 700; color: #0F172A; margin: 0 0 0.3rem 0;">All Clear! No Pending Drafts</h3>
                <p style="font-size: 0.88rem; color: var(--text-secondary); max-width: 420px; margin: 0 auto 1.2rem auto;">
                    All generated questions have been reviewed and approved or rejected. Use the Generate tab to create more drafts with balanced option placements.
                </p>
                <button id="go-generate-btn" class="btn btn-primary" style="padding: 0.5rem 1.1rem; font-size: 0.85rem; font-weight: 600; border-radius: 0.4rem;">
                    <i class="fa-solid fa-wand-magic-sparkles" style="margin-right: 0.4rem;"></i> Generate Draft Questions
                </button>
            </div>
        `;
        document.getElementById("go-generate-btn")?.addEventListener("click", () => {
            activeTab = "generate";
            document.querySelectorAll(".qbank-tab-btn").forEach(b => {
                b.style.background = b.dataset.tab === "generate" ? "#FFFFFF" : "transparent";
                b.style.color = b.dataset.tab === "generate" ? "#0F172A" : "#64748B";
            });
            renderTabContent();
        });
        return;
    }

    content.innerHTML = `
        <div style="margin-bottom: 1.25rem; background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 0.6rem; padding: 1rem 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: gap; gap: 0.75rem; box-shadow: var(--shadow-sm);">
            <div>
                <span style="font-size: 1.05rem; font-weight: 700; color: #0F172A;">${pendingQuestions.length} Questions Awaiting Approval</span>
                <p style="font-size: 0.84rem; color: var(--text-secondary); margin: 0.15rem 0 0 0;">
                    Verify that option quality tiers (Correct, Nearly Correct, Wrong, Clearly Wrong) and explanations are accurate before adding to the active student bank.
                </p>
            </div>
            <div style="display: flex; gap: 0.5rem;">
                <button class="btn btn-sm" id="approve-all-btn" style="background: #10B981; color: white; font-weight: 600; padding: 0.45rem 0.9rem; border-radius: 0.4rem; border: none; cursor: pointer; display: flex; align-items: center; gap: 0.4rem;">
                    <i class="fa-solid fa-check-double"></i> Approve All (${pendingQuestions.length})
                </button>
            </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.85rem;" id="pending-list">
            ${pendingQuestions.map(q => renderQuestionCard(q, { showActions: true, isDraft: true })).join("")}
        </div>
    `;

    document.getElementById("approve-all-btn")?.addEventListener("click", async () => {
        if (!confirm(`Approve all ${pendingQuestions.length} pending questions into the active question bank?`)) return;
        const btn = document.getElementById("approve-all-btn");
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Approving...`;
        }
        for (const q of pendingQuestions) {
            try {
                await SchemaMasteryAPI.approveQuestion(q.id, { approved_by: "Teacher Batch" });
            } catch (e) {
                console.warn("Failed approving item:", q.id, e);
            }
        }
        await refreshCounts();
        renderTabContent();
    });

    attachQuestionCardHandlers();
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. AI GENERATE TAB
// ─────────────────────────────────────────────────────────────────────────────
function renderGenerateTab(content) {
    content.innerHTML = `
        <div style="display: grid; grid-template-columns: 340px 1fr; gap: 1.5rem; align-items: start;">
            <!-- Generation Control Card -->
            <div class="card" style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 0.75rem; padding: 1.25rem; box-shadow: var(--shadow-sm);">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border-color);">
                    <div style="width: 32px; height: 32px; border-radius: 0.4rem; background: #EEF2FF; display: flex; align-items: center; justify-content: center; color: #4F46E5;">
                        <i class="fa-solid fa-sliders"></i>
                    </div>
                    <div>
                        <h3 style="font-size: 0.98rem; font-weight: 700; color: #0F172A; margin: 0;">Generation Parameters</h3>
                        <span style="font-size: 0.75rem; color: var(--text-muted);">AI diagnostic drafting engine</span>
                    </div>
                </div>

                <form id="gen-form" style="display: flex; flex-direction: column; gap: 0.85rem;">
                    <div>
                        <label style="font-size: 0.82rem; font-weight: 600; color: #334155; display: block; margin-bottom: 0.25rem;">Target Java Concept</label>
                        <select id="gen-concept" class="input input-field" style="width: 100%; padding: 0.5rem; font-size: 0.85rem; border: 1px solid var(--border-color); border-radius: 0.4rem;">
                            ${CONCEPTS.map(c => `<option value="${c}" ${c === 'Loops' ? 'selected' : ''}>${c}</option>`).join("")}
                        </select>
                    </div>

                    <div>
                        <label style="font-size: 0.82rem; font-weight: 600; color: #334155; display: block; margin-bottom: 0.25rem;">Question Type (Cognitive Level)</label>
                        <select id="gen-type" class="input input-field" style="width: 100%; padding: 0.5rem; font-size: 0.85rem; border: 1px solid var(--border-color); border-radius: 0.4rem;">
                            <option value="">All Types (Balanced Blueprint)</option>
                            ${QUESTION_TYPES.map(t => `<option value="${t}">${t}</option>`).join("")}
                        </select>
                    </div>

                    <div>
                        <label style="font-size: 0.82rem; font-weight: 600; color: #334155; display: block; margin-bottom: 0.25rem;">Difficulty</label>
                        <select id="gen-difficulty" class="input input-field" style="width: 100%; padding: 0.5rem; font-size: 0.85rem; border: 1px solid var(--border-color); border-radius: 0.4rem;">
                            <option value="Easy">Easy</option>
                            <option value="Medium" selected>Medium</option>
                            <option value="Hard">Hard</option>
                        </select>
                    </div>

                    <div>
                        <label style="font-size: 0.82rem; font-weight: 600; color: #334155; display: block; margin-bottom: 0.25rem;">Target Error Focus (Component 2)</label>
                        <select id="gen-error-type" class="input input-field" style="width: 100%; padding: 0.5rem; font-size: 0.85rem; border: 1px solid var(--border-color); border-radius: 0.4rem;">
                            ${ERROR_TYPES.map(e => `<option value="${e}" ${e === 'LOOP_CONDITION_ERROR' ? 'selected' : ''}>${e}</option>`).join("")}
                        </select>
                    </div>

                    <div>
                        <label style="font-size: 0.82rem; font-weight: 600; color: #334155; display: block; margin-bottom: 0.25rem;">Batch Size</label>
                        <select id="gen-count" class="input input-field" style="width: 100%; padding: 0.5rem; font-size: 0.85rem; border: 1px solid var(--border-color); border-radius: 0.4rem;">
                            <option value="4">4 Questions (1 A, 1 B, 1 C, 1 D)</option>
                            <option value="8" selected>8 Questions (2 A, 2 B, 2 C, 2 D)</option>
                            <option value="12">12 Questions (3 A, 3 B, 3 C, 3 D)</option>
                        </select>
                        <span style="font-size: 0.72rem; color: #16A34A; display: block; margin-top: 0.2rem;"><i class="fa-solid fa-check"></i> Automatically balances correct option positions A/B/C/D</span>
                    </div>

                    <button type="submit" class="btn btn-primary" id="gen-submit-btn" style="margin-top: 0.3rem; padding: 0.65rem; font-size: 0.88rem; font-weight: 600; border-radius: 0.4rem; display: flex; align-items: center; justify-content: center; gap: 0.4rem;">
                        <i class="fa-solid fa-wand-magic-sparkles"></i> Generate Draft Questions
                    </button>
                </form>
            </div>

            <!-- Preview & Workflow Output -->
            <div id="gen-results-container">
                <div class="card" style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 0.75rem; padding: 1.25rem; margin-bottom: 1.25rem; box-shadow: var(--shadow-sm);">
                    <h3 style="font-size: 0.95rem; font-weight: 700; margin: 0 0 0.5rem 0; color: #0F172A; display: flex; align-items: center; gap: 0.4rem;">
                        <i class="fa-solid fa-circle-info" style="color: #4F46E5;"></i> Teacher Approval & Balanced Distribution Rules
                    </h3>
                    <div style="font-size: 0.84rem; color: var(--text-secondary); line-height: 1.55; display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                        <div style="background: #F8FAFC; padding: 0.6rem 0.8rem; border-radius: 0.4rem; border: 1px solid #E2E8F0;">
                            <strong style="color: #0F172A; display: block; margin-bottom: 0.2rem;">1. Balanced Option Rotation</strong>
                            Correct answers are programmatically rotated across A, B, C, and D. Post-tests also shuffle options per session.
                        </div>
                        <div style="background: #F8FAFC; padding: 0.6rem 0.8rem; border-radius: 0.4rem; border: 1px solid #E2E8F0;">
                            <strong style="color: #0F172A; display: block; margin-bottom: 0.2rem;">2. 4-Tier Schema Rigor</strong>
                            Each question must have exactly one <em>Correct</em> (1.0), one <em>Nearly Correct</em> (0.5), one <em>Wrong</em> (0.0), and one <em>Clearly Wrong</em> (0.0).
                        </div>
                    </div>
                </div>

                <div id="gen-output-list">
                    <div style="text-align: center; padding: 3.5rem 1rem; background: #FFFFFF; border: 1px dashed var(--border-color); border-radius: 0.75rem; color: var(--text-secondary);">
                        <i class="fa-solid fa-sliders" style="font-size: 2.2rem; color: #6366F1; opacity: 0.6; margin-bottom: 0.8rem;"></i>
                        <h4 style="font-size: 0.95rem; font-weight: 600; color: #0F172A; margin: 0 0 0.25rem 0;">Ready to Generate</h4>
                        <p style="font-size: 0.84rem; margin: 0;">Configure your target concept and parameters on the left, then click Generate Draft Questions.</p>
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
        const count = parseInt(document.getElementById("gen-count").value) || 8;

        submitBtn.disabled = true;
        submitBtn.innerHTML = `<div class="spinner" style="width: 14px; height: 14px; border-width: 2px;"></div> Generating Drafts...`;
        outputList.innerHTML = `<div style="text-align: center; padding: 3rem; background: #FFFFFF; border-radius: 0.75rem; border: 1px solid var(--border-color);"><div class="spinner" style="margin: 0 auto 0.75rem;"></div><p style="color: var(--text-secondary); font-size: 0.85rem;">Generating structured draft questions with 4-tier qualities...</p></div>`;

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
                // Calculate correct answer distribution
                const dist = { A: 0, B: 0, C: 0, D: 0 };
                res.questions.forEach(q => { if (dist[q.correct_option] !== undefined) dist[q.correct_option]++; });

                outputList.innerHTML = `
                    <div style="background: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 0.6rem; padding: 0.8rem 1rem; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                        <div>
                            <span style="font-weight: 700; color: #065F46; font-size: 0.88rem;">✓ Generated ${res.questions.length} Draft Questions (Status: PENDING)</span>
                            <span style="font-size: 0.78rem; color: #047857; margin-left: 0.5rem;">
                                Balanced Positions: <strong>A: ${dist.A}</strong> • <strong>B: ${dist.B}</strong> • <strong>C: ${dist.C}</strong> • <strong>D: ${dist.D}</strong>
                            </span>
                        </div>
                        <button class="btn btn-sm" id="view-pending-tab-btn" style="background: #10B981; color: white; font-weight: 600; padding: 0.35rem 0.8rem; font-size: 0.8rem; border-radius: 0.35rem; border: none; cursor: pointer;">
                            Go to Review Queue →
                        </button>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 0.85rem;">
                        ${res.questions.map(q => renderQuestionCard(q, { showActions: true, isDraft: true })).join("")}
                    </div>
                `;

                document.getElementById("view-pending-tab-btn")?.addEventListener("click", () => {
                    activeTab = "pending";
                    document.querySelectorAll(".qbank-tab-btn").forEach(b => {
                        b.style.background = b.dataset.tab === "pending" ? "#FFFFFF" : "transparent";
                        b.style.color = b.dataset.tab === "pending" ? "#0F172A" : "#64748B";
                    });
                    renderTabContent();
                });

                attachQuestionCardHandlers();
            } else {
                outputList.innerHTML = `<div style="color: #EF4444; background: #FEF2F2; padding: 1rem; border-radius: 0.5rem;">Failed to generate questions. Please verify parameters.</div>`;
            }
        } catch (err) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> Generate Draft Questions`;
            const errMsg = err?.message || String(err);
            const isApiKeyMissing = errMsg.includes("GEMINI_API_KEY") || errMsg.includes("OPENAI_API_KEY") || errMsg.includes("LLM_NOT_CONFIGURED") || errMsg.includes("not configured");

            if (isApiKeyMissing) {
                outputList.innerHTML = `
                    <div style="background: #FFFBEB; border: 1px solid #FCD34D; border-radius: 0.6rem; padding: 1rem 1.25rem; color: #92400E;">
                        <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
                            <i class="fa-solid fa-triangle-exclamation" style="font-size: 1.25rem; color: #D97706; margin-top: 0.15rem;"></i>
                            <div>
                                <h4 style="font-weight: 700; font-size: 0.95rem; margin: 0 0 0.25rem 0; color: #B45309;">LLM Question Generation Not Configured</h4>
                                <p style="font-size: 0.85rem; margin: 0 0 0.5rem 0; color: #78350F; line-height: 1.4;">
                                    Question generation failed. Please check Gemini API configuration (<code>GEMINI_API_KEY</code> in <code>backend/.env</code>).
                                </p>
                                <p style="font-size: 0.78rem; margin: 0; color: #92400E;">
                                    CodeQuest strictly enforces real LLM generation. Mock questions are disabled in active teacher workflows.
                                </p>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                outputList.innerHTML = `
                    <div style="background: #FEF2F2; border: 1px solid #FECACA; border-radius: 0.6rem; padding: 1rem 1.25rem; color: #991B1B;">
                        <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
                            <i class="fa-solid fa-circle-exclamation" style="font-size: 1.25rem; color: #DC2626; margin-top: 0.15rem;"></i>
                            <div>
                                <h4 style="font-weight: 700; font-size: 0.95rem; margin: 0 0 0.25rem 0; color: #991B1B;">Question Generation Failed</h4>
                                <p style="font-size: 0.85rem; margin: 0; color: #B91C1C; line-height: 1.4;">${errMsg}</p>
                            </div>
                        </div>
                    </div>
                `;
            }
        }
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. REJECTED ARCHIVE TAB
// ─────────────────────────────────────────────────────────────────────────────
function renderRejectedTab(content) {
    if (rejectedQuestions.length === 0) {
        content.innerHTML = `
            <div style="text-align: center; padding: 4rem 1rem; background: #FFFFFF; border: 1px dashed var(--border-color); border-radius: 0.75rem; color: var(--text-secondary); box-shadow: var(--shadow-sm);">
                <i class="fa-solid fa-folder-closed" style="font-size: 2.2rem; color: #94A3B8; margin-bottom: 0.75rem;"></i>
                <h3 style="font-size: 1rem; font-weight: 700; color: #0F172A; margin: 0 0 0.25rem 0;">Rejected Archive is Empty</h3>
                <p style="font-size: 0.85rem; margin: 0;">Any draft questions rejected during teacher review are archived here for auditing or restoration.</p>
            </div>
        `;
        return;
    }

    content.innerHTML = `
        <div style="margin-bottom: 1.25rem; background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 0.6rem; padding: 0.9rem 1.25rem; display: flex; justify-content: space-between; align-items: center; box-shadow: var(--shadow-sm);">
            <div>
                <span style="font-size: 1rem; font-weight: 700; color: #0F172A;">Rejected Questions Archive (${rejectedQuestions.length})</span>
                <p style="font-size: 0.82rem; color: var(--text-secondary); margin: 0.15rem 0 0 0;">
                    These questions were flagged during teacher review. You can edit & restore them or remove them permanently.
                </p>
            </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.85rem;" id="rejected-list">
            ${rejectedQuestions.map(q => renderQuestionCard(q, { showActions: true, isRejectedTab: true })).join("")}
        </div>
    `;

    attachQuestionCardHandlers();
}

// ─────────────────────────────────────────────────────────────────────────────
// CARD RENDERER (CLEAN WHITE LMS THEME)
// ─────────────────────────────────────────────────────────────────────────────
function renderQuestionCard(q, { showActions = true, isDraft = false, isApprovedTab = false, isRejectedTab = false } = {}) {
    if (editingQuestionId === q.id) {
        return renderEditQuestionCard(q);
    }

    const qualityBadges = {
        "Correct": "background: #ECFDF5; color: #065F46; border: 1px solid #A7F3D0;",
        "Nearly Correct": "background: #FEF3C7; color: #92400E; border: 1px solid #FDE68A;",
        "Wrong": "background: #F1F5F9; color: #475569; border: 1px solid #CBD5E1;",
        "Clearly Wrong": "background: #FEE2E2; color: #991B1B; border: 1px solid #FECACA;",
    };

    const optA = q.option_a || (q.options && q.options[0]?.text) || (q.options && q.options[0]) || "";
    const optB = q.option_b || (q.options && q.options[1]?.text) || (q.options && q.options[1]) || "";
    const optC = q.option_c || (q.options && q.options[2]?.text) || (q.options && q.options[2]) || "";
    const optD = q.option_d || (q.options && q.options[3]?.text) || (q.options && q.options[3]) || "";

    const qA = q.option_a_quality || (q.options && q.options[0]?.quality) || (q.option_qualities && q.option_qualities.A) || "Wrong";
    const qB = q.option_b_quality || (q.options && q.options[1]?.quality) || (q.option_qualities && q.option_qualities.B) || "Wrong";
    const qC = q.option_c_quality || (q.options && q.options[2]?.quality) || (q.option_qualities && q.option_qualities.C) || "Wrong";
    const qD = q.option_d_quality || (q.options && q.options[3]?.quality) || (q.option_qualities && q.option_qualities.D) || "Wrong";

    const options = [
        { key: "A", text: optA, quality: qA },
        { key: "B", text: optB, quality: qB },
        { key: "C", text: optC, quality: qC },
        { key: "D", text: optD, quality: qD },
    ];

    const isActive = q.active !== false;

    return `
        <div class="card q-card" data-qid="${q.id}" style="background: #FFFFFF; border: 1px solid ${isActive ? 'var(--border-color)' : '#E2E8F0'}; border-radius: 0.65rem; padding: 1.15rem 1.35rem; box-shadow: var(--shadow-sm); transition: border-color 0.15s; ${!isActive ? 'opacity: 0.75;' : ''}">
            <!-- Header Row -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.4rem;">
                <div style="display: flex; gap: 0.45rem; align-items: center; flex-wrap: wrap;">
                    <span style="font-family: monospace; background: #EEF2FF; color: #4338CA; font-weight: 700; font-size: 0.75rem; padding: 0.18rem 0.5rem; border-radius: 0.3rem;">
                        ${q.question_id || q.id}
                    </span>
                    <span style="background: #F1F5F9; color: #334155; font-weight: 600; font-size: 0.75rem; padding: 0.18rem 0.5rem; border-radius: 0.3rem;">
                        ${q.concept_name}
                    </span>
                    <span style="background: #F8FAFC; color: #64748B; font-size: 0.75rem; padding: 0.18rem 0.5rem; border-radius: 0.3rem; border: 1px solid #E2E8F0;">
                        ${q.question_type || "Basic"}
                    </span>
                    <span style="font-size: 0.75rem; color: #64748B;">
                        Difficulty: <strong style="color: #334155;">${q.difficulty || "Medium"}</strong>
                    </span>
                    ${q.target_error_type ? `<span style="background: #FEF2F2; color: #B91C1C; font-size: 0.72rem; padding: 0.18rem 0.5rem; border-radius: 0.3rem; border: 1px solid #FECACA;">Focus: ${q.target_error_type}</span>` : ""}
                </div>

                <div style="display: flex; gap: 0.4rem; align-items: center;">
                    ${isDraft ? `
                        <span style="background: #FEF3C7; color: #92400E; font-size: 0.72rem; font-weight: 700; padding: 0.2rem 0.55rem; border-radius: 9999px; border: 1px solid #FDE68A;">
                            <i class="fa-solid fa-hourglass-half"></i> PENDING REVIEW
                        </span>
                    ` : isRejectedTab ? `
                        <span style="background: #FEE2E2; color: #991B1B; font-size: 0.72rem; font-weight: 700; padding: 0.2rem 0.55rem; border-radius: 9999px; border: 1px solid #FECACA;">
                            <i class="fa-solid fa-ban"></i> REJECTED
                        </span>
                    ` : `
                        <span style="background: ${isActive ? '#ECFDF5' : '#F1F5F9'}; color: ${isActive ? '#065F46' : '#64748B'}; font-size: 0.72rem; font-weight: 700; padding: 0.2rem 0.55rem; border-radius: 9999px; border: 1px solid ${isActive ? '#A7F3D0' : '#CBD5E1'};">
                            <i class="fa-solid ${isActive ? 'fa-circle-check' : 'fa-circle-pause'}"></i> ${isActive ? 'ACTIVE' : 'INACTIVE'} (Exposures: ${q.exposure_count || 0})
                        </span>
                    `}
                </div>
            </div>

            <!-- Question Text -->
            <p style="font-size: 0.96rem; font-weight: 600; color: #0F172A; margin: 0 0 0.6rem 0; line-height: 1.45;">
                ${escapeHtml(q.question_text || "")}
            </p>

            <!-- Code Snippet -->
            ${q.code_snippet ? `
                <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 0.4rem; padding: 0.6rem 0.9rem; margin-bottom: 0.75rem; font-family: Consolas, Monaco, monospace; font-size: 0.85rem; overflow-x: auto; color: #0F172A;">
                    <pre style="margin: 0;"><code>${escapeHtml(q.code_snippet)}</code></pre>
                </div>
            ` : ""}

            <!-- 4 Options Grid -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 0.75rem;">
                ${options.map(opt => `
                    <div style="padding: 0.5rem 0.75rem; border-radius: 0.35rem; background: ${q.correct_option === opt.key ? '#F0FDF4' : '#FFFFFF'}; border: 1px solid ${q.correct_option === opt.key ? '#86EFAC' : '#E2E8F0'}; display: flex; justify-content: space-between; align-items: center; gap: 0.4rem;">
                        <div style="display: flex; align-items: baseline; gap: 0.35rem; font-size: 0.86rem; color: #0F172A;">
                            <strong style="color: ${q.correct_option === opt.key ? '#16A34A' : '#64748B'}; font-size: 0.82rem;">${opt.key}.</strong>
                            <span>${escapeHtml(opt.text || "")}</span>
                        </div>
                        <span style="font-size: 0.68rem; font-weight: 700; padding: 0.12rem 0.4rem; border-radius: 0.25rem; white-space: nowrap; ${qualityBadges[opt.quality] || qualityBadges['Wrong']}">
                            ${opt.quality}
                        </span>
                    </div>
                `).join("")}
            </div>

            <!-- Footer Details & Action Buttons -->
            <div style="border-top: 1px solid #F1F5F9; padding-top: 0.65rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                <div style="font-size: 0.8rem; color: #64748B; max-width: 65%;">
                    ${q.rejection_reason ? `<strong style="color: #EF4444;">Rejection Reason:</strong> ${escapeHtml(q.rejection_reason)}` : q.explanation ? `<strong>Explanation:</strong> ${escapeHtml(q.explanation)}` : `<em>Outcome: ${escapeHtml(q.learning_outcome || "")}</em>`}
                </div>

                ${showActions ? `
                    <div style="display: flex; gap: 0.4rem; align-items: center;">
                        <button class="btn btn-sm edit-q-btn" data-id="${q.id}" style="background: #F1F5F9; color: #334155; border: 1px solid #CBD5E1; font-size: 0.78rem; padding: 0.3rem 0.6rem; border-radius: 0.35rem; cursor: pointer;">
                            <i class="fa-solid fa-pen-to-square"></i> Edit
                        </button>

                        ${isDraft ? `
                            <button class="btn btn-sm reject-q-btn" data-id="${q.id}" style="background: #FEF2F2; color: #B91C1C; border: 1px solid #FECACA; font-size: 0.78rem; padding: 0.3rem 0.6rem; border-radius: 0.35rem; cursor: pointer;">
                                <i class="fa-solid fa-xmark"></i> Reject
                            </button>
                            <button class="btn btn-sm approve-q-btn" data-id="${q.id}" style="background: #10B981; color: white; border: none; font-size: 0.78rem; font-weight: 600; padding: 0.3rem 0.7rem; border-radius: 0.35rem; cursor: pointer;">
                                <i class="fa-solid fa-check"></i> Approve
                            </button>
                        ` : isRejectedTab ? `
                            <button class="btn btn-sm reactivate-q-btn" data-id="${q.id}" style="background: #EEF2FF; color: #4338CA; border: 1px solid #C7D2FE; font-size: 0.78rem; font-weight: 600; padding: 0.3rem 0.6rem; border-radius: 0.35rem; cursor: pointer;">
                                <i class="fa-solid fa-rotate-left"></i> Restore to Review
                            </button>
                            <button class="btn btn-sm delete-q-btn" data-id="${q.id}" style="background: #FEF2F2; color: #B91C1C; border: 1px solid #FECACA; font-size: 0.78rem; padding: 0.3rem 0.6rem; border-radius: 0.35rem; cursor: pointer;">
                                <i class="fa-solid fa-trash"></i> Delete
                            </button>
                        ` : `
                            <button class="btn btn-sm toggle-active-btn" data-id="${q.id}" data-active="${isActive}" style="background: ${isActive ? '#FFFBEB' : '#ECFDF5'}; color: ${isActive ? '#B45309' : '#047857'}; border: 1px solid ${isActive ? '#FDE68A' : '#A7F3D0'}; font-size: 0.78rem; font-weight: 600; padding: 0.3rem 0.6rem; border-radius: 0.35rem; cursor: pointer;">
                                <i class="fa-solid ${isActive ? 'fa-pause' : 'fa-play'}"></i> ${isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button class="btn btn-sm delete-q-btn" data-id="${q.id}" style="background: #FEF2F2; color: #B91C1C; border: 1px solid #FECACA; font-size: 0.78rem; padding: 0.3rem 0.6rem; border-radius: 0.35rem; cursor: pointer;">
                                <i class="fa-solid fa-trash"></i> Delete
                            </button>
                        `}
                    </div>
                ` : ""}
            </div>
        </div>
    `;
}

// ─────────────────────────────────────────────────────────────────────────────
// EDIT CARD VIEW (CLEAN WHITE LMS THEME)
// ─────────────────────────────────────────────────────────────────────────────
function renderEditQuestionCard(q) {
    return `
        <div class="card" style="background: #FFFFFF; border: 2px solid #4F46E5; border-radius: 0.75rem; padding: 1.25rem; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.1);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border-color);">
                <h4 style="font-size: 0.98rem; font-weight: 700; margin: 0; color: #4338CA; display: flex; align-items: center; gap: 0.4rem;">
                    <i class="fa-solid fa-pen-to-square"></i> Editing Question: ${q.question_id || q.id}
                </h4>
                <span style="font-size: 0.75rem; color: #64748B;">4-Tier Quality Validation Active</span>
            </div>

            <form class="edit-q-form" data-id="${q.id}" style="display: flex; flex-direction: column; gap: 0.75rem;">
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.6rem;">
                    <div>
                        <label style="font-size: 0.78rem; font-weight: 600; color: #334155; display: block; margin-bottom: 0.2rem;">Concept</label>
                        <select class="input input-field edit-concept" style="width: 100%; padding: 0.4rem 0.5rem; font-size: 0.82rem; border: 1px solid var(--border-color); border-radius: 0.35rem; background: #FFFFFF;">
                            ${CONCEPTS.map(c => `<option value="${c}" ${q.concept_name === c ? 'selected' : ''}>${c}</option>`).join("")}
                        </select>
                    </div>
                    <div>
                        <label style="font-size: 0.78rem; font-weight: 600; color: #334155; display: block; margin-bottom: 0.2rem;">Question Type</label>
                        <select class="input input-field edit-type" style="width: 100%; padding: 0.4rem 0.5rem; font-size: 0.82rem; border: 1px solid var(--border-color); border-radius: 0.35rem; background: #FFFFFF;">
                            ${QUESTION_TYPES.map(t => `<option value="${t}" ${q.question_type === t ? 'selected' : ''}>${t}</option>`).join("")}
                        </select>
                    </div>
                    <div>
                        <label style="font-size: 0.78rem; font-weight: 600; color: #334155; display: block; margin-bottom: 0.2rem;">Difficulty</label>
                        <select class="input input-field edit-diff" style="width: 100%; padding: 0.4rem 0.5rem; font-size: 0.82rem; border: 1px solid var(--border-color); border-radius: 0.35rem; background: #FFFFFF;">
                            <option value="Easy" ${q.difficulty === 'Easy' ? 'selected' : ''}>Easy</option>
                            <option value="Medium" ${q.difficulty === 'Medium' ? 'selected' : ''}>Medium</option>
                            <option value="Hard" ${q.difficulty === 'Hard' ? 'selected' : ''}>Hard</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label style="font-size: 0.78rem; font-weight: 600; color: #334155; display: block; margin-bottom: 0.2rem;">Question Text</label>
                    <textarea class="input input-field edit-text" rows="2" style="width: 100%; padding: 0.5rem; font-size: 0.86rem; border: 1px solid var(--border-color); border-radius: 0.35rem; background: #FFFFFF; font-family: inherit;">${escapeHtml(q.question_text || "")}</textarea>
                </div>

                <div>
                    <label style="font-size: 0.78rem; font-weight: 600; color: #334155; display: block; margin-bottom: 0.2rem;">Code Snippet (Optional Java)</label>
                    <textarea class="input input-field edit-code" rows="2" style="width: 100%; padding: 0.5rem; font-family: Consolas, Monaco, monospace; font-size: 0.82rem; border: 1px solid var(--border-color); border-radius: 0.35rem; background: #F8FAFC;">${escapeHtml(q.code_snippet || "")}</textarea>
                </div>

                <!-- 4 Options & Qualities -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.65rem; background: #F8FAFC; padding: 0.75rem; border-radius: 0.4rem; border: 1px solid #E2E8F0;">
                    <div>
                        <label style="font-size: 0.75rem; font-weight: 700; color: #0F172A;">Option A</label>
                        <input type="text" class="input input-field edit-opt-a" value="${escapeHtml(q.option_a || "")}" style="width: 100%; padding: 0.35rem 0.5rem; font-size: 0.82rem; border: 1px solid var(--border-color); border-radius: 0.3rem; margin-top: 0.15rem; background: #FFFFFF;" />
                        <select class="input input-field edit-qa" style="width: 100%; margin-top: 0.25rem; padding: 0.25rem 0.4rem; font-size: 0.78rem; border: 1px solid var(--border-color); border-radius: 0.3rem; background: #FFFFFF;">
                            <option value="Correct" ${q.option_a_quality === 'Correct' ? 'selected' : ''}>Correct (1.0)</option>
                            <option value="Nearly Correct" ${q.option_a_quality === 'Nearly Correct' ? 'selected' : ''}>Nearly Correct (0.5)</option>
                            <option value="Wrong" ${q.option_a_quality === 'Wrong' ? 'selected' : ''}>Wrong (0.0)</option>
                            <option value="Clearly Wrong" ${q.option_a_quality === 'Clearly Wrong' ? 'selected' : ''}>Clearly Wrong (0.0)</option>
                        </select>
                    </div>

                    <div>
                        <label style="font-size: 0.75rem; font-weight: 700; color: #0F172A;">Option B</label>
                        <input type="text" class="input input-field edit-opt-b" value="${escapeHtml(q.option_b || "")}" style="width: 100%; padding: 0.35rem 0.5rem; font-size: 0.82rem; border: 1px solid var(--border-color); border-radius: 0.3rem; margin-top: 0.15rem; background: #FFFFFF;" />
                        <select class="input input-field edit-qb" style="width: 100%; margin-top: 0.25rem; padding: 0.25rem 0.4rem; font-size: 0.78rem; border: 1px solid var(--border-color); border-radius: 0.3rem; background: #FFFFFF;">
                            <option value="Correct" ${q.option_b_quality === 'Correct' ? 'selected' : ''}>Correct (1.0)</option>
                            <option value="Nearly Correct" ${q.option_b_quality === 'Nearly Correct' ? 'selected' : ''}>Nearly Correct (0.5)</option>
                            <option value="Wrong" ${q.option_b_quality === 'Wrong' ? 'selected' : ''}>Wrong (0.0)</option>
                            <option value="Clearly Wrong" ${q.option_b_quality === 'Clearly Wrong' ? 'selected' : ''}>Clearly Wrong (0.0)</option>
                        </select>
                    </div>

                    <div>
                        <label style="font-size: 0.75rem; font-weight: 700; color: #0F172A;">Option C</label>
                        <input type="text" class="input input-field edit-opt-c" value="${escapeHtml(q.option_c || "")}" style="width: 100%; padding: 0.35rem 0.5rem; font-size: 0.82rem; border: 1px solid var(--border-color); border-radius: 0.3rem; margin-top: 0.15rem; background: #FFFFFF;" />
                        <select class="input input-field edit-qc" style="width: 100%; margin-top: 0.25rem; padding: 0.25rem 0.4rem; font-size: 0.78rem; border: 1px solid var(--border-color); border-radius: 0.3rem; background: #FFFFFF;">
                            <option value="Correct" ${q.option_c_quality === 'Correct' ? 'selected' : ''}>Correct (1.0)</option>
                            <option value="Nearly Correct" ${q.option_c_quality === 'Nearly Correct' ? 'selected' : ''}>Nearly Correct (0.5)</option>
                            <option value="Wrong" ${q.option_c_quality === 'Wrong' ? 'selected' : ''}>Wrong (0.0)</option>
                            <option value="Clearly Wrong" ${q.option_c_quality === 'Clearly Wrong' ? 'selected' : ''}>Clearly Wrong (0.0)</option>
                        </select>
                    </div>

                    <div>
                        <label style="font-size: 0.75rem; font-weight: 700; color: #0F172A;">Option D</label>
                        <input type="text" class="input input-field edit-opt-d" value="${escapeHtml(q.option_d || "")}" style="width: 100%; padding: 0.35rem 0.5rem; font-size: 0.82rem; border: 1px solid var(--border-color); border-radius: 0.3rem; margin-top: 0.15rem; background: #FFFFFF;" />
                        <select class="input input-field edit-qd" style="width: 100%; margin-top: 0.25rem; padding: 0.25rem 0.4rem; font-size: 0.78rem; border: 1px solid var(--border-color); border-radius: 0.3rem; background: #FFFFFF;">
                            <option value="Correct" ${q.option_d_quality === 'Correct' ? 'selected' : ''}>Correct (1.0)</option>
                            <option value="Nearly Correct" ${q.option_d_quality === 'Nearly Correct' ? 'selected' : ''}>Nearly Correct (0.5)</option>
                            <option value="Wrong" ${q.option_d_quality === 'Wrong' ? 'selected' : ''}>Wrong (0.0)</option>
                            <option value="Clearly Wrong" ${q.option_d_quality === 'Clearly Wrong' ? 'selected' : ''}>Clearly Wrong (0.0)</option>
                        </select>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 140px 1fr; gap: 0.75rem;">
                    <div>
                        <label style="font-size: 0.78rem; font-weight: 600; color: #334155; display: block; margin-bottom: 0.2rem;">Correct Answer Key</label>
                        <select class="input input-field edit-correct-opt" style="width: 100%; padding: 0.4rem 0.5rem; font-size: 0.82rem; border: 1px solid var(--border-color); border-radius: 0.35rem; background: #FFFFFF; font-weight: 700; color: #16A34A;">
                            <option value="A" ${q.correct_option === 'A' ? 'selected' : ''}>A (Option A)</option>
                            <option value="B" ${q.correct_option === 'B' ? 'selected' : ''}>B (Option B)</option>
                            <option value="C" ${q.correct_option === 'C' ? 'selected' : ''}>C (Option C)</option>
                            <option value="D" ${q.correct_option === 'D' ? 'selected' : ''}>D (Option D)</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size: 0.78rem; font-weight: 600; color: #334155; display: block; margin-bottom: 0.2rem;">Pedagogical Explanation</label>
                        <input type="text" class="input input-field edit-exp" value="${escapeHtml(q.explanation || "")}" style="width: 100%; padding: 0.4rem 0.5rem; font-size: 0.82rem; border: 1px solid var(--border-color); border-radius: 0.35rem; background: #FFFFFF;" />
                    </div>
                </div>

                <div class="edit-error-msg" style="color: #EF4444; font-size: 0.8rem; display: none;"></div>

                <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.3rem;">
                    <button type="button" class="btn btn-outline btn-sm cancel-edit-btn" style="padding: 0.4rem 0.8rem; font-size: 0.82rem; border-radius: 0.35rem; cursor: pointer;">Cancel</button>
                    <button type="submit" class="btn btn-sm btn-primary" style="font-weight: 600; padding: 0.4rem 0.9rem; font-size: 0.82rem; border-radius: 0.35rem; cursor: pointer;">
                        <i class="fa-solid fa-floppy-disk"></i> Save Question
                    </button>
                </div>
            </form>
        </div>
    `;
}

// ─────────────────────────────────────────────────────────────────────────────
// CARD EVENT HANDLERS
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
                btn.innerHTML = `<i class="fa-solid fa-check"></i> Approve`;
            }
        });
    });

    // Reject button
    document.querySelectorAll(".reject-q-btn").forEach((btn) => {
        btn.addEventListener("click", async () => {
            const qid = btn.dataset.id;
            const reason = prompt("Enter reason for rejection:", "Does not meet conceptual diagnostic standard");
            if (!reason) return;
            try {
                await SchemaMasteryAPI.rejectQuestion(qid, { reason, rejected_by: "Teacher Reviewer" });
                await refreshCounts();
                renderTabContent();
            } catch (e) {
                alert("Rejection failed: " + e.message);
            }
        });
    });

    // Toggle Active / Deactivate / Reactivate
    document.querySelectorAll(".toggle-active-btn").forEach((btn) => {
        btn.addEventListener("click", async () => {
            const qid = btn.dataset.id;
            const isActive = btn.dataset.active === "true";
            btn.disabled = true;
            try {
                if (isActive) {
                    await SchemaMasteryAPI.deactivateQuestion(qid);
                } else {
                    await SchemaMasteryAPI.reactivateQuestion(qid);
                }
                await refreshCounts();
                renderTabContent();
            } catch (e) {
                alert("Status toggle failed: " + e.message);
                btn.disabled = false;
            }
        });
    });

    // Reactivate / Restore from Rejected
    document.querySelectorAll(".reactivate-q-btn").forEach((btn) => {
        btn.addEventListener("click", async () => {
            const qid = btn.dataset.id;
            btn.disabled = true;
            try {
                await SchemaMasteryAPI.updateQuestion(qid, { status: "PENDING" });
                await refreshCounts();
                renderTabContent();
            } catch (e) {
                alert("Restore failed: " + e.message);
                btn.disabled = false;
            }
        });
    });

    // Delete button (soft delete)
    document.querySelectorAll(".delete-q-btn").forEach((btn) => {
        btn.addEventListener("click", async () => {
            const qid = btn.dataset.id;
            if (!confirm("Are you sure you want to remove this question from the question bank?")) return;
            try {
                await SchemaMasteryAPI.deleteQuestion(qid);
                await refreshCounts();
                renderTabContent();
            } catch (e) {
                alert("Delete failed: " + e.message);
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

    // Auto-sync correct option letter when quality changes in edit form
    document.querySelectorAll(".edit-q-form").forEach((form) => {
        const updateCorrectLetter = () => {
            const qa = form.querySelector(".edit-qa").value;
            const qb = form.querySelector(".edit-qb").value;
            const qc = form.querySelector(".edit-qc").value;
            const qd = form.querySelector(".edit-qd").value;
            const corrSel = form.querySelector(".edit-correct-opt");
            if (qa === "Correct") corrSel.value = "A";
            else if (qb === "Correct") corrSel.value = "B";
            else if (qc === "Correct") corrSel.value = "C";
            else if (qd === "Correct") corrSel.value = "D";
        };
        form.querySelector(".edit-qa")?.addEventListener("change", updateCorrectLetter);
        form.querySelector(".edit-qb")?.addEventListener("change", updateCorrectLetter);
        form.querySelector(".edit-qc")?.addEventListener("change", updateCorrectLetter);
        form.querySelector(".edit-qd")?.addEventListener("change", updateCorrectLetter);

        // Save edit form
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const qid = form.dataset.id;
            const errorMsg = form.querySelector(".edit-error-msg");

            const updates = {
                concept_name: form.querySelector(".edit-concept").value,
                question_type: form.querySelector(".edit-type").value,
                difficulty: form.querySelector(".edit-diff").value,
                question_text: form.querySelector(".edit-text").value.trim(),
                code_snippet: form.querySelector(".edit-code").value.trim(),
                option_a: form.querySelector(".edit-opt-a").value.trim(),
                option_b: form.querySelector(".edit-opt-b").value.trim(),
                option_c: form.querySelector(".edit-opt-c").value.trim(),
                option_d: form.querySelector(".edit-opt-d").value.trim(),
                option_a_quality: form.querySelector(".edit-qa").value,
                option_b_quality: form.querySelector(".edit-qb").value,
                option_c_quality: form.querySelector(".edit-qc").value,
                option_d_quality: form.querySelector(".edit-qd").value,
                correct_option: form.querySelector(".edit-correct-opt").value,
                explanation: form.querySelector(".edit-exp").value.trim(),
            };

            // Client-side 4-tier validation
            const qualities = [updates.option_a_quality, updates.option_b_quality, updates.option_c_quality, updates.option_d_quality];
            const correctCount = qualities.filter(q => q === "Correct").length;
            const nearlyCount = qualities.filter(q => q === "Nearly Correct").length;

            if (!updates.question_text) {
                if (errorMsg) { errorMsg.textContent = "Question text cannot be empty."; errorMsg.style.display = "block"; }
                return;
            }
            if (!updates.option_a || !updates.option_b || !updates.option_c || !updates.option_d) {
                if (errorMsg) { errorMsg.textContent = "All 4 options must be filled in."; errorMsg.style.display = "block"; }
                return;
            }
            if (correctCount !== 1) {
                if (errorMsg) { errorMsg.textContent = "Exactly one option must have the 'Correct' quality."; errorMsg.style.display = "block"; }
                return;
            }
            if (nearlyCount !== 1) {
                if (errorMsg) { errorMsg.textContent = "Exactly one option must have the 'Nearly Correct' quality."; errorMsg.style.display = "block"; }
                return;
            }

            try {
                await SchemaMasteryAPI.updateQuestion(qid, updates);
                editingQuestionId = null;
                await refreshCounts();
                renderTabContent();
            } catch (err) {
                if (errorMsg) {
                    errorMsg.textContent = "Save failed: " + err.message;
                    errorMsg.style.display = "block";
                }
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
