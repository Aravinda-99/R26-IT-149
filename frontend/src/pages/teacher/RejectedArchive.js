/**
 * RejectedArchive Component — Audit trail of rejected draft questions
 * ====================================================================
 */

import { SchemaMasteryAPI } from "../../api/api.js";

const CONCEPTS = ["All Concepts", "Variables", "Operators", "Loops", "Arrays", "Methods"];

export async function renderRejectedArchive(container, onNavigate) {
    let activeFilter = "All Concepts";
    let rejectedList = [];

    container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            
            <!-- Header -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
                <div>
                    <h1 style="font-size: 1.75rem; font-weight: 800; color: #111827; letter-spacing: -0.02em;">
                        Rejected Questions Archive
                    </h1>
                    <p style="color: #6B7280; font-size: 0.9375rem; margin-top: 0.25rem;">
                        Audit repository of draft items that were rejected during pedagogical review.
                    </p>
                </div>
            </div>

            <!-- Concept Filter Bar -->
            <div class="card" style="padding: 1rem 1.25rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;" id="rej-concept-filters">
                    ${CONCEPTS.map(c => `
                        <button class="btn ${c === activeFilter ? 'btn-primary' : 'btn-secondary'} btn-sm rej-concept-pill" data-concept="${c}">
                            ${c}
                        </button>
                    `).join("")}
                </div>
            </div>

            <!-- Questions Area -->
            <div id="rejected-cards-container">
                <div style="text-align: center; padding: 3rem 0;"><div class="spinner"></div></div>
            </div>

        </div>
    `;

    attachFilterListeners();
    await loadRejectedData();

    function attachFilterListeners() {
        container.querySelectorAll(".rej-concept-pill").forEach(pill => {
            pill.addEventListener("click", async () => {
                activeFilter = pill.dataset.concept;
                container.querySelectorAll(".rej-concept-pill").forEach(p => {
                    p.className = p.dataset.concept === activeFilter ? "btn btn-primary btn-sm rej-concept-pill" : "btn btn-secondary btn-sm rej-concept-pill";
                });
                await loadRejectedData();
            });
        });
    }

    async function loadRejectedData() {
        const cardsContainer = document.getElementById("rejected-cards-container");
        if (!cardsContainer) return;
        cardsContainer.innerHTML = `<div style="text-align: center; padding: 3rem 0;"><div class="spinner"></div></div>`;

        try {
            const conceptParam = activeFilter === "All Concepts" ? "" : activeFilter;
            const res = await SchemaMasteryAPI.getRejectedQuestions(conceptParam);
            rejectedList = res.questions || [];
            renderRejectedCards();
        } catch (err) {
            cardsContainer.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fa-solid fa-triangle-exclamation"></i> Error loading rejected archive: ${err.message}
                </div>
            `;
        }
    }

    function renderRejectedCards() {
        const cardsContainer = document.getElementById("rejected-cards-container");
        if (!cardsContainer) return;

        if (rejectedList.length === 0) {
            cardsContainer.innerHTML = `
                <div class="card" style="text-align: center; padding: 3.5rem 1rem;">
                    <div style="width: 56px; height: 56px; border-radius: 50%; background: #F1F5F9; color: #64748B; display: inline-flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 1rem;">
                        <i class="fa-solid fa-box-open"></i>
                    </div>
                    <h3 style="font-size: 1.15rem; font-weight: 700; color: #111827;">Archive Empty</h3>
                    <p style="color: #6B7280; font-size: 0.875rem; margin-top: 0.25rem;">
                        No rejected draft questions found for <strong>${activeFilter}</strong>.
                    </p>
                </div>
            `;
            return;
        }

        cardsContainer.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 1.25rem;">
                ${rejectedList.map(q => `
                    <div class="card" style="padding: 1.5rem; opacity: 0.9;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
                            <div>
                                <span style="font-family: var(--font-mono); font-size: 0.8125rem; font-weight: 700; color: #DC2626; background: #FEE2E2; padding: 0.2rem 0.5rem; border-radius: 4px;">
                                    ${q.question_id || q.id}
                                </span>
                                <span class="badge badge-primary" style="margin-left: 0.4rem;">${q.concept_name}</span>
                                <span class="badge badge-info">${q.question_type}</span>
                            </div>
                            <span class="badge badge-danger">REJECTED</span>
                        </div>

                        <div style="font-size: 1rem; font-weight: 700; color: #111827; margin-bottom: 0.75rem;">
                            ${escapeHtml(q.question_text || q.text)}
                        </div>

                        ${q.rejection_reason ? `
                            <div style="background: #FFF1F2; border-left: 3px solid #E11D48; padding: 0.5rem 0.75rem; border-radius: 4px; font-size: 0.8125rem; color: #9F1239; margin-bottom: 0.75rem;">
                                <strong>Rejection Reason:</strong> ${escapeHtml(q.rejection_reason)}
                            </div>
                        ` : ''}

                        <div style="font-size: 0.75rem; color: #9CA3AF;">
                            Archived on ${q.updated_at ? new Date(q.updated_at).toLocaleDateString() : 'N/A'}
                        </div>
                    </div>
                `).join("")}
            </div>
        `;
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
