/**
 * Stat Card Component
 * ====================
 * Reusable stat card for dashboard and profile views.
 */

export function createStatCard(value, label, color = "var(--accent-blue)") {
    return `
        <div class="stat-card">
            <span class="stat-value" style="color: ${color}">${value}</span>
            <span class="stat-label">${label}</span>
        </div>
    `;
}
