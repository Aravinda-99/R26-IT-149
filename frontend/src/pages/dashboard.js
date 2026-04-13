/**
 * Dashboard Page
 * ===============
 * TODO: Show stats, mastery chart, and recommended activity.
 */

import { AdaptiveAPI, MasteryAPI, checkHealth } from "../api/api.js";

export async function renderDashboard(container) {
    container.innerHTML = `
        <h1>Welcome back, Learner</h1>
        <p style="color: var(--text-secondary); margin-bottom: 2rem;">Your learning progress overview</p>

        <div class="stats-grid">
            <div class="stat-card">
                <span class="stat-value" id="stat-mastery">0%</span>
                <span class="stat-label">Overall Mastery</span>
            </div>
            <div class="stat-card">
                <span class="stat-value" id="stat-games">0</span>
                <span class="stat-label">Games Played</span>
            </div>
            <div class="stat-card">
                <span class="stat-value" id="stat-xp">0</span>
                <span class="stat-label">Total XP</span>
            </div>
            <div class="stat-card">
                <span class="stat-value" id="stat-streak">0</span>
                <span class="stat-label">Day Streak</span>
            </div>
        </div>

        <div class="grid-2">
            <div class="card">
                <h3>Schema Mastery Overview</h3>
                <canvas id="mastery-chart" width="400" height="250"></canvas>
            </div>
            <div class="card">
                <h3>Recommended Activity</h3>
                <div id="recommendation">
                    <p style="color: var(--text-secondary)">Loading recommendation...</p>
                </div>
            </div>
        </div>
    `;

    // TODO: Load real data from API
    try {
        const rec = await AdaptiveAPI.getNextActivity("demo_user");
        document.getElementById("recommendation").innerHTML = `
            <p><strong>${rec.recommended_topic}</strong></p>
            <p style="color: var(--text-secondary)">${rec.reason}</p>
            <span style="color: var(--accent-green); text-transform: uppercase; font-size: 0.8rem">${rec.difficulty}</span>
        `;
    } catch (e) {
        console.warn("Could not load recommendation:", e);
    }
}
