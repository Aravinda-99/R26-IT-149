/**
 * Games Page
 * ===========
 * TODO: Show game cards and launch Phaser games.
 */

import { GamificationAPI } from "../api/api.js";

export async function renderGames(container) {
    container.innerHTML = `
        <h1>Learning Games</h1>
        <p style="color: var(--text-secondary); margin-bottom: 2rem;">Master concepts through interactive challenges</p>
        <div class="grid-3" id="games-grid"><p style="color: var(--text-secondary)">Loading...</p></div>
    `;

    try {
        const data = await GamificationAPI.getGames();
        const grid = document.getElementById("games-grid");

        grid.innerHTML = data.games
            .map(
                (game) => `
            <div class="card" style="cursor: pointer;" onclick="alert('TODO: Launch ${game.title} with PhaserJS')">
                <h3 style="color: var(--text-primary); font-size: 1.1rem;">${game.title}</h3>
                <p style="color: var(--text-secondary); font-size: 0.85rem; margin: 0.5rem 0;">Concept: ${game.concept}</p>
                <div style="display: flex; justify-content: space-between; color: var(--text-secondary); font-size: 0.8rem;">
                    <span>${game.levels} Levels</span>
                    <span style="color: var(--accent-green)">${game.xp_reward} XP</span>
                </div>
            </div>
        `
            )
            .join("");
    } catch (e) {
        document.getElementById("games-grid").innerHTML = `<p style="color: var(--accent-orange)">Could not load games</p>`;
    }
}
