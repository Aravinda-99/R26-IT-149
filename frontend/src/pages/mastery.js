/**
 * Mastery Page
 * =============
 * TODO: Show schema mastery cards with sub-skill breakdowns.
 */

import { MasteryAPI } from "../api/api.js";

export async function renderMastery(container) {
    container.innerHTML = `
        <h1>Schema Mastery</h1>
        <p style="color: var(--text-secondary); margin-bottom: 2rem;">Track your conceptual understanding</p>
        <div class="grid-3" id="mastery-grid"><p style="color: var(--text-secondary)">Loading...</p></div>
    `;

    try {
        const data = await MasteryAPI.getStatus("demo_user");
        const grid = document.getElementById("mastery-grid");

        grid.innerHTML = Object.entries(data.schemas)
            .map(
                ([key, schema]) => `
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <strong>${schema.name}</strong>
                    <span style="font-size: 1.2rem; font-weight: 700;">${schema.mastery_level}%</span>
                </div>
                <span style="color: var(--accent-purple); font-size: 0.75rem; text-transform: uppercase;">${schema.classification}</span>
                <div style="margin-top: 1rem;">
                    ${Object.entries(schema.sub_skills)
                        .map(([skill, val]) => `<div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-secondary); margin: 0.3rem 0;"><span>${skill.replace(/_/g, " ")}</span><span>${val}%</span></div>`)
                        .join("")}
                </div>
            </div>
        `
            )
            .join("");
    } catch (e) {
        document.getElementById("mastery-grid").innerHTML = `<p style="color: var(--accent-orange)">Could not load mastery data</p>`;
    }
}
