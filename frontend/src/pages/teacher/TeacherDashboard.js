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
        <div class="teacher-dashboard">
            <!-- Header -->
            <div class="ea-header">
                <div>
                    <span class="badge badge-primary"><i class="fa-solid fa-chalkboard-user"></i> Faculty Workspace</span>
                    <h1 class="ea-title">Welcome, ${teacherName}</h1>
                    <p class="ea-subtitle">Manage curriculum question items, validate AI generation quality, and inspect student mastery telemetry.</p>
                </div>
                <div class="ea-header-actions">
                    <a href="#/teacher/questions/generate" class="btn btn-primary">
                        <i class="fa-solid fa-plus-circle"></i> Generate Question Bank
                    </a>
                </div>
            </div>

            <!-- Stats Bar -->
            <div class="ea-metrics-grid">
                <div class="ea-metric-card">
                    <div class="ea-metric-icon blue"><i class="fa-solid fa-layer-group"></i></div>
                    <div class="ea-metric-info">
                        <span class="ea-metric-label">Approved Questions</span>
                        <h3 class="ea-metric-val" id="tea-stat-approved">120</h3>
                        <span class="ea-metric-sub">Active in post-test bank</span>
                    </div>
                </div>

                <div class="ea-metric-card">
                    <div class="ea-metric-icon amber"><i class="fa-solid fa-inbox"></i></div>
                    <div class="ea-metric-info">
                        <span class="ea-metric-label">Pending Review</span>
                        <h3 class="ea-metric-val" id="tea-stat-pending">0</h3>
                        <span class="ea-metric-sub">Awaiting educator approval</span>
                    </div>
                </div>

                <div class="ea-metric-card">
                    <div class="ea-metric-icon green"><i class="fa-solid fa-robot"></i></div>
                    <div class="ea-metric-info">
                        <span class="ea-metric-label">Validation Engine</span>
                        <h3 class="ea-metric-val">Active</h3>
                        <span class="ea-metric-sub">RF Schema Model Pipeline</span>
                    </div>
                </div>
            </div>

            <!-- Quick Action Cards Grid -->
            <div class="teacher-actions-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; margin-top: 1.5rem;">
                <div class="card teacher-card">
                    <div class="teacher-card-icon blue" style="font-size: 1.5rem; color: var(--primary); margin-bottom: 0.5rem;"><i class="fa-solid fa-wand-magic-sparkles"></i></div>
                    <h3 style="font-size: 1.1rem; margin-bottom: 0.4rem;">AI Question Generator</h3>
                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.25rem;">Generate blueprint-compliant Java questions across specific misconception patterns and cognitive tiers.</p>
                    <a href="#/teacher/questions/generate" class="btn btn-primary btn-block">Open Generator</a>
                </div>

                <div class="card teacher-card">
                    <div class="teacher-card-icon amber" style="font-size: 1.5rem; color: var(--warning); margin-bottom: 0.5rem;"><i class="fa-solid fa-clipboard-check"></i></div>
                    <h3 style="font-size: 1.1rem; margin-bottom: 0.4rem;">Review Queue</h3>
                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.25rem;">Review newly generated questions, edit distractor options, and approve or reject submissions.</p>
                    <a href="#/teacher/questions/pending" class="btn btn-outline btn-block">Inspect Queue</a>
                </div>

                <div class="card teacher-card">
                    <div class="teacher-card-icon green" style="font-size: 1.5rem; color: var(--success); margin-bottom: 0.5rem;"><i class="fa-solid fa-database"></i></div>
                    <h3 style="font-size: 1.1rem; margin-bottom: 0.4rem;">Curriculum Question Bank</h3>
                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.25rem;">Search, filter, and maintain the live question catalog used across student assessment checks.</p>
                    <a href="#/teacher/questions/approved" class="btn btn-outline btn-block">View Bank</a>
                </div>

                <div class="card teacher-card">
                    <div class="teacher-card-icon purple" style="font-size: 1.5rem; color: var(--accent-purple); margin-bottom: 0.5rem;"><i class="fa-solid fa-chart-pie"></i></div>
                    <h3 style="font-size: 1.1rem; margin-bottom: 0.4rem;">Mastery Analytics</h3>
                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.25rem;">Inspect student cohort performance distributions, error frequencies, and schema mastery levels.</p>
                    <a href="#/teacher/analytics" class="btn btn-outline btn-block">View Analytics</a>
                </div>
            </div>
        </div>
    `;

    // Fetch pending count
    try {
        const pendingData = await SchemaMasteryAPI.getPendingQuestions();
        const count = (pendingData.questions || []).length;
        const pendingEl = document.getElementById("tea-stat-pending");
        if (pendingEl) pendingEl.textContent = count;
    } catch (e) { }
}
