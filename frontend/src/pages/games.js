/**
 * Games Page
 * ===========
 * Shows the Integer Mastery Module game card and launches Phaser.
 * Single game mode: 3-level Integer Mastery Module
 *   Level 1 — Number Line Adventure (Accretion)
 *   Level 2 — Math Combat (Tuning)
 *   Level 3 — Code Escape Room (Restructuring)
 */

import { mountGame, destroyGame } from "../game/main.js";

function showGameContainer() {
    const el = document.getElementById("phaser-container");
    if (!el) return null;
    el.classList.remove("hidden");
    el.innerHTML = "";
    return el;
}

function hideGameContainer() {
    const el = document.getElementById("phaser-container");
    if (!el) return;
    el.classList.add("hidden");
    el.innerHTML = "";
}

function launchIntegerGame() {
    showGameContainer();
    mountGame({ parent: "phaser-container" });

    // Keep focus on the canvas area when launching.
    document.getElementById("phaser-container")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export async function renderGames(container) {
    container.innerHTML = `
        <h1>Learning Games</h1>
        <p style="color: var(--text-secondary); margin-bottom: 2rem;">Master concepts through interactive challenges</p>

        <!-- Integer Mastery Module — 3-level Schema Theory course -->
        <div class="card" style="display:flex; align-items:center; justify-content:space-between; gap: 1rem; border-color: var(--accent-purple); margin-bottom: 1rem;">
            <div>
                <h3 style="color: var(--accent-purple); font-size: 1.15rem; margin-bottom: 0.35rem;">🧠 Integer Mastery Module</h3>
                <p style="color: var(--text-secondary); font-size: 0.85rem;">
                    3-Level Schema Theory Course: <b>Number Line Adventure</b> → <b>Cyber Variable Arena</b> → <b>Code Escape Room</b>
                </p>
                <p style="color: var(--text-secondary); font-size: 0.75rem; margin-top: 0.3rem;">
                    Badges: 🏆 Integer Explorer &nbsp; ⚔️ Math Warrior &nbsp; 🧠 Logic Master
                </p>
            </div>
            <div style="display:flex; gap: 0.5rem; flex-wrap: wrap; justify-content: flex-end;">
                <button class="btn btn-primary" id="launch-module-btn" style="background: var(--accent-purple);">Launch Module</button>
                <button class="btn" id="close-module-btn" style="background: var(--border-color); color: var(--text-primary);">Close</button>
            </div>
        </div>

        <div class="grid-3" id="games-grid"></div>
    `;

    // ── Integer Mastery Module controls ──
    document.getElementById("launch-module-btn")?.addEventListener("click", () => {
        launchIntegerGame();
    });
    document.getElementById("close-module-btn")?.addEventListener("click", () => {
        destroyGame();
        hideGameContainer();
    });
}
