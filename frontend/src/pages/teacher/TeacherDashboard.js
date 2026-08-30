/**
 * TeacherDashboard Component — Teacher & Admin Portal Overview
 * =============================================================
 * Real-world SaaS administrative overview with metrics, quick actions,
 * system health, and recent post-test evaluation history.
 */

import { SchemaMasteryAPI } from "../../api/api.js";

export async function renderTeacherDashboard(container, onNavigate) {
    container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 2rem;">
            
            <!-- Page Title & Actions Header -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
                <div>
                    <h1 style="font-size: 1.75rem; font-weight: 800; color: #111827; letter-spacing: -0.02em;">
                        Curriculum & Schema Mastery Overview
                    </h1>
                    <p style="color: #6B7280; font-size: 0.9375rem; margin-top: 0.25rem;">
                        Monitor question drafting, 4-tier pedagogical reviews, approved banks, and ML evaluation metrics.
                    </p>
                </div>

                <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                    <button class="btn btn-primary" id="t-dash-generate-btn">
                        <i class="fa-solid fa-plus-circle"></i> Generate Questions
                    </button>
                    <button class="btn btn-secondary" id="t-dash-review-btn">
                        <i class="fa-solid fa-clipboard-check"></i> Review Pending
                    </button>
                </div>
            </div>

            <!-- Stats Grid -->
            <div class="stat-card-grid" id="teacher-stats-grid">
                <div class="stat-card">
                    <div class="stat-card-label">Pending Review</div>
                    <div class="stat-card-val" id="stat-pending" style="color: #D97706;">...</div>
                    <div class="stat-card-desc">
                        <i class="fa-solid fa-clock" style="color: #D97706;"></i> Awaiting teacher approval
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-card-label">Approved Question Bank</div>
                    <div class="stat-card-val" id="stat-approved" style="color: #059669;">...</div>
                    <div class="stat-card-desc">
                        <i class="fa-solid fa-circle-check" style="color: #059669;"></i> Active for post-tests
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-card-label">Rejected Archive</div>
                    <div class="stat-card-val" id="stat-rejected" style="color: #DC2626;">...</div>
                    <div class="stat-card-desc">
                        <i class="fa-solid fa-box-archive" style="color: #DC2626;"></i> Filtered draft items
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-card-label">Post-Test Sessions</div>
                    <div class="stat-card-val" id="stat-sessions" style="color: #1E40AF;">...</div>
                    <div class="stat-card-desc">
                        <i class="fa-solid fa-microchip" style="color: #1E40AF;"></i> Evaluated by ML Pipeline
                    </div>
                </div>
            </div>

            <!-- Main Content 2-Column Split -->
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem;" id="teacher-dash-split">
                
                <!-- Left: Quick Workflow Cards -->
                <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                    <div class="card">
                        <div class="card-header">
                            <div class="card-title">
                                <i class="fa-solid fa-list-check" style="color: #1E40AF;"></i> Recommended Educator Actions
                            </div>
                        </div>

                        <div style="display: flex; flex-direction: column; gap: 1rem;">
                            <div style="display: flex; align-items: center; justify-content: space-between; padding: 1.15rem; border: 1px solid #E5E7EB; border-radius: 10px; background: #F9FAFB; transition: background var(--transition-fast);">
                                <div style="display: flex; align-items: center; gap: 0.85rem;">
                                    <div style="width: 40px; height: 40px; border-radius: 10px; background: #FEF3C7; color: #D97706; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0;">
                                        <i class="fa-solid fa-clipboard-check"></i>
                                    </div>
                                    <div>
                                        <strong style="font-size: 0.9375rem; color: #111827;">Review Draft Questions</strong>
                                        <p style="font-size: 0.8125rem; color: #6B7280; margin: 0.15rem 0 0 0; line-height: 1.4;">Validate 4-tier answer qualities and pedagogical explanations before approving into post-test pool.</p>
                                    </div>
                                </div>
                                <button class="btn btn-secondary btn-sm" id="action-review-btn" style="margin-left: 1rem; flex-shrink: 0;">Review</button>
                            </div>

                            <div style="display: flex; align-items: center; justify-content: space-between; padding: 1.15rem; border: 1px solid #E5E7EB; border-radius: 10px; background: #F9FAFB; transition: background var(--transition-fast);">
                                <div style="display: flex; align-items: center; gap: 0.85rem;">
                                    <div style="width: 40px; height: 40px; border-radius: 10px; background: #EFF6FF; color: #1E40AF; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0;">
                                        <i class="fa-solid fa-plus-circle"></i>
                                    </div>
                                    <div>
                                        <strong style="font-size: 0.9375rem; color: #111827;">Draft New Concept MCQs</strong>
                                        <p style="font-size: 0.8125rem; color: #6B7280; margin: 0.15rem 0 0 0; line-height: 1.4;">Generate targeted questions for Loops, Arrays, and Methods with balanced answer positions.</p>
                                    </div>
                                </div>
                                <button class="btn btn-secondary btn-sm" id="action-generate-btn" style="margin-left: 1rem; flex-shrink: 0;">Draft</button>
                            </div>

                            <div style="display: flex; align-items: center; justify-content: space-between; padding: 1.15rem; border: 1px solid #E5E7EB; border-radius: 10px; background: #F9FAFB; transition: background var(--transition-fast);">
                                <div style="display: flex; align-items: center; gap: 0.85rem;">
                                    <div style="width: 40px; height: 40px; border-radius: 10px; background: #D1FAE5; color: #059669; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0;">
                                        <i class="fa-solid fa-chart-column"></i>
                                    </div>
                                    <div>
                                        <strong style="font-size: 0.9375rem; color: #111827;">Analyze Post-Test Outcomes</strong>
                                        <p style="font-size: 0.8125rem; color: #6B7280; margin: 0.15rem 0 0 0; line-height: 1.4;">Inspect concept mastery rates and question exposure distributions from ML evaluations.</p>
                                    </div>
                                </div>
                                <button class="btn btn-secondary btn-sm" id="action-analytics-btn" style="margin-left: 1rem; flex-shrink: 0;">Analytics</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right: System & ML Pipeline Health -->
                <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                    <div class="card">
                        <div class="card-header">
                            <div class="card-title">
                                <i class="fa-solid fa-server" style="color: #059669;"></i> System Status
                            </div>
                        </div>

                        <div style="display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.8125rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid #E5E7EB;">
                                <span style="color: #6B7280;">Component 4 ML Model</span>
                                <span class="badge badge-success" style="font-size: 0.7rem;">Active (schema_mastery_pipeline)</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid #E5E7EB;">
                                <span style="color: #6B7280;">Option Shuffling Engine</span>
                                <span class="badge badge-success" style="font-size: 0.7rem;">Active (Server-Side)</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid #E5E7EB;">
                                <span style="color: #6B7280;">Question Bank Storage</span>
                                <span class="badge badge-primary" style="font-size: 0.7rem;">Persistent JSON / Firestore</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0;">
                                <span style="color: #6B7280;">Security / Safe Delivery</span>
                                <span class="badge badge-success" style="font-size: 0.7rem;">Enforced</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    `;

    document.getElementById("t-dash-generate-btn")?.addEventListener("click", () => {
        if (onNavigate) onNavigate("/teacher/questions/generate");
    });
    document.getElementById("t-dash-review-btn")?.addEventListener("click", () => {
        if (onNavigate) onNavigate("/teacher/questions/pending");
    });
    document.getElementById("action-review-btn")?.addEventListener("click", () => {
        if (onNavigate) onNavigate("/teacher/questions/pending");
    });
    document.getElementById("action-generate-btn")?.addEventListener("click", () => {
        if (onNavigate) onNavigate("/teacher/questions/generate");
    });
    document.getElementById("action-analytics-btn")?.addEventListener("click", () => {
        if (onNavigate) onNavigate("/teacher/analytics");
    });

    // Load actual overview counts from backend
    try {
        const data = await SchemaMasteryAPI.getTeacherOverview();
        if (data.success && data.stats) {
            const s = data.stats;
            document.getElementById("stat-pending").textContent = s.pending_count ?? 0;
            document.getElementById("stat-approved").textContent = `${s.approved_active_count ?? 0} (${s.approved_total_count ?? 0} total)`;
            document.getElementById("stat-rejected").textContent = s.rejected_count ?? 0;
            document.getElementById("stat-sessions").textContent = s.sessions_count ?? 0;
        }
    } catch (e) {
        console.warn("[WARN] Could not fetch teacher overview stats:", e);
    }
}
