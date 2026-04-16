/**
 * Games Page
 * ===========
 * Shows game cards and launches Phaser games.
 * Two game modes:
 *   1. "Space Cargo Loader" — original Level_Int scene
 *   2. "Integer Mastery Module" — new 3-level module (MenuScene)
 */

import { GamificationAPI } from "../api/api.js";
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

        <!-- Integer Mastery Module (NEW — 3-level module) -->
        <div class="card" style="display:flex; align-items:center; justify-content:space-between; gap: 1rem; border-color: var(--accent-purple); margin-bottom: 1rem;">
            <div>
                <h3 style="color: var(--accent-purple); font-size: 1.15rem; margin-bottom: 0.35rem;">🧠 Integer Mastery Module</h3>
                <p style="color: var(--text-secondary); font-size: 0.85rem;">
                    3-Level Schema Theory Course: <b>Sorting Puzzle</b> → <b>Math Combat</b> → <b>Code Escape Room</b>
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

        <!-- Space Cargo Loader (Original) -->
        <div class="card" style="display:flex; align-items:center; justify-content:space-between; gap: 1rem;">
            <div>
                <h3 style="color: var(--text-primary); font-size: 1.05rem; margin-bottom: 0.35rem;">Space Cargo Loader</h3>
                <p style="color: var(--text-secondary); font-size: 0.85rem;">
                    Concept: <b>Integer (int)</b> — crates must be whole numbers.
                </p>
            </div>
            <div style="display:flex; gap: 0.5rem; flex-wrap: wrap; justify-content: flex-end;">
                <button class="btn btn-primary" id="launch-int-game-btn">Launch</button>
                <button class="btn" id="close-game-btn" style="background: var(--border-color); color: var(--text-primary);">Close Game</button>
            </div>
        </div>

        <div class="grid-3" id="games-grid"><p style="color: var(--text-secondary)">Loading...</p></div>
    `;

    // ── Integer Mastery Module controls ──
    document.getElementById("launch-module-btn")?.addEventListener("click", () => {
        launchIntegerGame();
    });
    document.getElementById("close-module-btn")?.addEventListener("click", () => {
        destroyGame();
        hideGameContainer();
    });

    // ── Legacy Space Cargo Loader controls ──
    document.getElementById("launch-int-game-btn")?.addEventListener("click", () => {
        launchIntegerGame();
    });
    document.getElementById("close-game-btn")?.addEventListener("click", () => {
        destroyGame();
        hideGameContainer();
    });

    try {
        const data = await GamificationAPI.getGames();
        const grid = document.getElementById("games-grid");

        grid.innerHTML = data.games
            .map(
                (game) => `
            <div class="card game-card" style="cursor: pointer;" data-game-concept="${game.concept}">
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

        grid.querySelectorAll(".game-card").forEach((card) => {
            card.addEventListener("click", () => {
                launchIntegerGame();
            });
        });
    } catch (e) {
        document.getElementById("games-grid").innerHTML = `<p style="color: var(--accent-orange)">Could not load games</p>`;
    }
}
