/**
 * Learning Path Page
 * ===================
 * TODO: Show the ordered learning path with mastery progress.
 */

import { AdaptiveAPI } from "../api/api.js";

export async function renderLearningPath(container) {
    container.innerHTML = `
        <h1>Learning Path Generator</h1>
        <p style="color: var(--text-secondary); margin-bottom: 2rem;">Your personalized programming journey</p>
        <div id="path-list"><p style="color: var(--text-secondary)">Loading...</p></div>
    `;

    try {
        const data = await AdaptiveAPI.getLearningPath("demo_user");
        const pathEl = document.getElementById("path-list");

        pathEl.innerHTML = data.learning_path
            .map(
                (topic, i) => `
            <div class="card" style="display: flex; align-items: center; gap: 1rem;">
                <div style="width: 40px; height: 40px; border-radius: 50%; background: ${topic.status === 'started' ? 'var(--accent-orange)' : 'var(--border-color)'}; display: flex; align-items: center; justify-content: center; font-weight: 700;">${i + 1}</div>
                <div style="flex: 1">
                    <strong>${topic.name}</strong>
                    <p style="color: var(--text-secondary); font-size: 0.85rem;">Mastery: ${topic.mastery}% — ${topic.status}</p>
                </div>
                <span style="color: var(--text-secondary)">${topic.mastery}%</span>
            </div>
        `
            )
            .join("");
    } catch (e) {
        document.getElementById("path-list").innerHTML = `<p style="color: var(--accent-orange)">Could not load learning path</p>`;
    }
}
