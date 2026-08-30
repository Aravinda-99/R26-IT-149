/**
 * Teacher Dashboard
 * =================
 * Overview dashboard for Educators, Curriculum Managers, and Instructors.
 */

import { SchemaMasteryAPI } from "../../api/api.js";
import { getCurrentUser } from "../../utils/auth.js";

export async function renderTeacherDashboard(container) {
    const user = getCurrentUser();
    const teacherName = user?.name || user?.displayName || "Educator";

    container.innerHTML = `
        <div class="teacher-dashboard" style="max-width: 1320px; margin: 0 auto;">
            <!-- Header -->
            <div class="ea-header" style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 0.75rem; padding: 1.25rem 1.5rem; margin-bottom: 1.5rem; box-shadow: var(--shadow-sm); display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
                <div>
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                        <span class="badge badge-primary" style="background: #EEF2FF; color: #4F46E5; font-weight: 700; font-size: 0.75rem; padding: 0.2rem 0.6rem; border-radius: 9999px;">
                            <i class="fa-solid fa-chalkboard-user"></i> Faculty Workspace
                        </span>
                        <span style="font-size: 0.75rem; color: var(--text-muted);">LMS Educator Portal</span>
                    </div>
                    <h1 class="ea-title" style="font-size: 1.5rem; font-weight: 700; color: #0F172A; margin: 0;">Welcome, ${teacherName}</h1>
                    <p class="ea-subtitle" style="color: var(--text-secondary); margin: 0.25rem 0 0 0; font-size: 0.88rem;">Manage curriculum question items, validate AI generation quality, and inspect student mastery telemetry.</p>
                </div>
                <div class="ea-header-actions" style="display: flex; gap: 0.5rem;">
                    <a href="#/teacher/questions/generate" class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.85rem; font-weight: 600; border-radius: 0.4rem; display: flex; align-items: center; gap: 0.4rem;">
                        <i class="fa-solid fa-plus-circle"></i> Generate Question Bank
                    </a>
                </div>
            </div>

            <!-- Stats Bar -->
            <div class="ea-metrics-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                <div class="ea-metric-card" style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 0.65rem; padding: 1.1rem; box-shadow: var(--shadow-sm); display: flex; align-items: center; gap: 0.9rem;">
                    <div class="ea-metric-icon blue" style="width: 44px; height: 44px; border-radius: 0.5rem; background: #EEF2FF; color: #4F46E5; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;"><i class="fa-solid fa-layer-group"></i></div>
                    <div class="ea-metric-info">
                        <span class="ea-metric-label" style="font-size: 0.78rem; font-weight: 600; color: #64748B; display: block;">Approved Questions</span>
                        <h3 class="ea-metric-val" id="tea-stat-approved" style="font-size: 1.4rem; font-weight: 700; color: #0F172A; margin: 0.1rem 0;">...</h3>
                        <span class="ea-metric-sub" style="font-size: 0.72rem; color: #16A34A; font-weight: 600;">Active in post-test bank</span>
                    </div>
                </div>

                <div class="ea-metric-card" style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 0.65rem; padding: 1.1rem; box-shadow: var(--shadow-sm); display: flex; align-items: center; gap: 0.9rem;">
                    <div class="ea-metric-icon amber" style="width: 44px; height: 44px; border-radius: 0.5rem; background: #FEF3C7; color: #D97706; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;"><i class="fa-solid fa-inbox"></i></div>
                    <div class="ea-metric-info">
                        <span class="ea-metric-label" style="font-size: 0.78rem; font-weight: 600; color: #64748B; display: block;">Pending Review</span>
                        <h3 class="ea-metric-val" id="tea-stat-pending" style="font-size: 1.4rem; font-weight: 700; color: #0F172A; margin: 0.1rem 0;">...</h3>
                        <span class="ea-metric-sub" style="font-size: 0.72rem; color: #D97706; font-weight: 600;">Awaiting educator approval</span>
                    </div>
                </div>

                <div class="ea-metric-card" style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 0.65rem; padding: 1.1rem; box-shadow: var(--shadow-sm); display: flex; align-items: center; gap: 0.9rem;">
                    <div class="ea-metric-icon green" style="width: 44px; height: 44px; border-radius: 0.5rem; background: #ECFDF5; color: #059669; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;"><i class="fa-solid fa-shield-check"></i></div>
                    <div class="ea-metric-info">
                        <span class="ea-metric-label" style="font-size: 0.78rem; font-weight: 600; color: #64748B; display: block;">Option Balancing</span>
                        <h3 class="ea-metric-val" style="font-size: 1.4rem; font-weight: 700; color: #059669; margin: 0.1rem 0;">Active</h3>
                        <span class="ea-metric-sub" style="font-size: 0.72rem; color: #64748B;">Equal A/B/C/D Distribution</span>
                    </div>
                </div>
            </div>

            <!-- Quick Action Cards Grid -->
            <div class="teacher-actions-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; margin-top: 1rem;">
                <div class="card teacher-card" style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 0.75rem; padding: 1.25rem; box-shadow: var(--shadow-sm);">
                    <div class="teacher-card-icon blue" style="font-size: 1.4rem; color: #4F46E5; margin-bottom: 0.6rem;"><i class="fa-solid fa-wand-magic-sparkles"></i></div>
                    <h3 style="font-size: 1.05rem; font-weight: 700; color: #0F172A; margin: 0 0 0.35rem 0;">AI Question Generator</h3>
                    <p style="font-size: 0.84rem; color: var(--text-secondary); margin: 0 0 1.2rem 0; line-height: 1.5;">Generate blueprint-compliant Java questions across specific misconception patterns and cognitive tiers with balanced options.</p>
                    <a href="#/teacher/questions/generate" class="btn btn-primary btn-block" style="padding: 0.45rem 1rem; font-size: 0.84rem; font-weight: 600; border-radius: 0.4rem; text-align: center; display: block;">Open Generator</a>
                </div>

                <div class="card teacher-card" style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 0.75rem; padding: 1.25rem; box-shadow: var(--shadow-sm);">
                    <div class="teacher-card-icon amber" style="font-size: 1.4rem; color: #D97706; margin-bottom: 0.6rem;"><i class="fa-solid fa-clipboard-check"></i></div>
                    <h3 style="font-size: 1.05rem; font-weight: 700; color: #0F172A; margin: 0 0 0.35rem 0;">Review Queue</h3>
                    <p style="font-size: 0.84rem; color: var(--text-secondary); margin: 0 0 1.2rem 0; line-height: 1.5;">Review newly generated questions, edit distractor options, and approve or reject submissions before student access.</p>
                    <a href="#/teacher/questions/pending" class="btn btn-outline btn-block" style="padding: 0.45rem 1rem; font-size: 0.84rem; font-weight: 600; border-radius: 0.4rem; text-align: center; display: block; border: 1px solid var(--border-color); background: #FFFFFF; color: #0F172A;">Inspect Queue</a>
                </div>

                <div class="card teacher-card" style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 0.75rem; padding: 1.25rem; box-shadow: var(--shadow-sm);">
                    <div class="teacher-card-icon green" style="font-size: 1.4rem; color: #059669; margin-bottom: 0.6rem;"><i class="fa-solid fa-database"></i></div>
                    <h3 style="font-size: 1.05rem; font-weight: 700; color: #0F172A; margin: 0 0 0.35rem 0;">Curriculum Question Bank</h3>
                    <p style="font-size: 0.84rem; color: var(--text-secondary); margin: 0 0 1.2rem 0; line-height: 1.5;">Search, filter, edit, activate/deactivate, and maintain the live question catalog used across student assessment checks.</p>
                    <a href="#/teacher/questions/approved" class="btn btn-outline btn-block" style="padding: 0.45rem 1rem; font-size: 0.84rem; font-weight: 600; border-radius: 0.4rem; text-align: center; display: block; border: 1px solid var(--border-color); background: #FFFFFF; color: #0F172A;">View Bank</a>
                </div>

                <div class="card teacher-card" style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 0.75rem; padding: 1.25rem; box-shadow: var(--shadow-sm);">
                    <div class="teacher-card-icon purple" style="font-size: 1.4rem; color: #7C3AED; margin-bottom: 0.6rem;"><i class="fa-solid fa-chart-pie"></i></div>
                    <h3 style="font-size: 1.05rem; font-weight: 700; color: #0F172A; margin: 0 0 0.35rem 0;">Mastery Analytics</h3>
                    <p style="font-size: 0.84rem; color: var(--text-secondary); margin: 0 0 1.2rem 0; line-height: 1.5;">Inspect student cohort performance distributions, error frequencies, and ML schema mastery levels.</p>
                    <a href="#/teacher/analytics" class="btn btn-outline btn-block" style="padding: 0.45rem 1rem; font-size: 0.84rem; font-weight: 600; border-radius: 0.4rem; text-align: center; display: block; border: 1px solid var(--border-color); background: #FFFFFF; color: #0F172A;">View Analytics</a>
                </div>
            </div>
        </div>
    `;

    // Fetch live counts
    try {
        const [pendingData, approvedData] = await Promise.all([
            SchemaMasteryAPI.getPendingQuestions(),
            SchemaMasteryAPI.getQuestionBank("", true), // active approved
        ]);
        const penCount = (pendingData.questions || []).length;
        const appCount = (approvedData.questions || []).length;
        
        const pendingEl = document.getElementById("tea-stat-pending");
        const approvedEl = document.getElementById("tea-stat-approved");
        if (pendingEl) pendingEl.textContent = penCount;
        if (approvedEl) approvedEl.textContent = appCount;
    } catch (e) {
        console.warn("Failed to fetch teacher stats:", e);
    }
}
