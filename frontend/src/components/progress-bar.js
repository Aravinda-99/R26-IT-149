/**
 * Progress Bar Component
 * ======================
 * Reusable progress bar with label and percentage.
 */

export function createProgressBar(label, percentage, color = "var(--accent-blue)") {
    const clamped = Math.max(0, Math.min(100, percentage));
    return `
        <div style="margin-bottom: 0.8rem;">
            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.3rem;">
                <span style="color: var(--text-secondary)">${label}</span>
                <span style="color: var(--text-primary)">${clamped}%</span>
            </div>
            <div style="height: 6px; background: var(--border-color); border-radius: 3px; overflow: hidden;">
                <div style="width: ${clamped}%; height: 100%; background: ${color}; border-radius: 3px; transition: width 0.3s ease;"></div>
            </div>
        </div>
    `;
}
