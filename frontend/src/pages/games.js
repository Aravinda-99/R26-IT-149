/**
 * Games Page
 * ===========
 * Three Schema Theory modules (Integer, Float, Char), each a 3-level course.
 * Launch opens Phaser; optional menu section scroll is set via sessionStorage.
 */

import { mountGame, destroyGame } from "../game/main.js";

const MENU_FOCUS_KEY = "codequest_menu_focus";

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

/**
 * @param {"integer"|"float"|"char"} section — which block of the in-game menu to scroll to
 */
function launchGame(section) {
    if (section === "integer") {
        sessionStorage.removeItem(MENU_FOCUS_KEY);
    } else {
        sessionStorage.setItem(MENU_FOCUS_KEY, section);
    }
    showGameContainer();
    mountGame({ parent: "phaser-container" });
    document.getElementById("phaser-container")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function wireModuleButtons(launchId, closeId, section) {
    document.getElementById(launchId)?.addEventListener("click", () => launchGame(section));
    document.getElementById(closeId)?.addEventListener("click", () => {
        destroyGame();
        hideGameContainer();
    });
}

export async function renderGames(container) {
    container.innerHTML = `
        <h1>Learning Games</h1>
        <p style="color: var(--text-secondary); margin-bottom: 2rem;">Master concepts through interactive challenges</p>

        <!-- Integer Mastery Module -->
        <div class="card" style="display:flex; align-items:center; justify-content:space-between; gap: 1rem; border-color: var(--accent-purple); margin-bottom: 1rem;">
            <div>
                <h3 style="color: var(--accent-purple); font-size: 1.15rem; margin-bottom: 0.35rem;">🧠 Integer Mastery Module</h3>
                <p style="color: var(--text-secondary); font-size: 0.85rem;">
                    3-Level Schema Theory Course: <b>Number Line Adventure</b> → <b>Cyber Variable Arena</b> → <b>Integer Escape Facility</b>
                </p>
                <p style="color: var(--text-secondary); font-size: 0.75rem; margin-top: 0.3rem;">
                    Badges: 🏆 Integer Explorer &nbsp; ⚔️ Math Warrior &nbsp; 🧠 Logic Master
                </p>
            </div>
            <div style="display:flex; gap: 0.5rem; flex-wrap: wrap; justify-content: flex-end;">
                <button class="btn btn-primary" id="launch-int-module-btn" style="background: var(--accent-purple);">Launch Module</button>
                <button class="btn" id="close-int-module-btn" style="background: var(--border-color); color: var(--text-primary);">Close</button>
            </div>
        </div>

        <!-- Float Mastery Module -->
        <div class="card" style="display:flex; align-items:center; justify-content:space-between; gap: 1rem; border-color: var(--accent-green); margin-bottom: 1rem;">
            <div>
                <h3 style="color: var(--accent-green); font-size: 1.15rem; margin-bottom: 0.35rem;">🌊 Float Mastery Module</h3>
                <p style="color: var(--text-secondary); font-size: 0.85rem;">
                    3-Level Schema Theory Course: <b>Decimal Ocean Dive</b> → <b>Rocket Launch Sequence</b> → <b>Mission Control Calculator</b>
                </p>
                <p style="color: var(--text-secondary); font-size: 0.75rem; margin-top: 0.3rem;">
                    Badges: 🌊 Float Explorer &nbsp; 🔬 Precision Master &nbsp; 🧮 Calculation Wizard
                </p>
            </div>
            <div style="display:flex; gap: 0.5rem; flex-wrap: wrap; justify-content: flex-end;">
                <button class="btn btn-primary" id="launch-float-module-btn" style="background: var(--accent-green);">Launch Module</button>
                <button class="btn" id="close-float-module-btn" style="background: var(--border-color); color: var(--text-primary);">Close</button>
            </div>
        </div>

        <!-- Char Mastery Module -->
        <div class="card" style="display:flex; align-items:center; justify-content:space-between; gap: 1rem; border-color: #c084fc; margin-bottom: 1rem;">
            <div>
                <h3 style="color: #c084fc; font-size: 1.15rem; margin-bottom: 0.35rem;">🌌 Char Mastery Module</h3>
                <p style="color: var(--text-secondary); font-size: 0.85rem;">
                    3-Level Schema Theory Course: <b>Alphabet Nebula Explorer</b> → <b>Character Workshop</b> → <b>Char Quest — Typing Adventure</b>
                </p>
                <p style="color: var(--text-secondary); font-size: 0.75rem; margin-top: 0.3rem;">
                    Badges: 🌌 Char Explorer &nbsp; 🔤 ASCII Master &nbsp; ⚔️ Char Champion
                </p>
            </div>
            <div style="display:flex; gap: 0.5rem; flex-wrap: wrap; justify-content: flex-end;">
                <button class="btn btn-primary" id="launch-char-module-btn" style="background: #c084fc;">Launch Module</button>
                <button class="btn" id="close-char-module-btn" style="background: var(--border-color); color: var(--text-primary);">Close</button>
            </div>
        </div>

        <div class="grid-3" id="games-grid"></div>
    `;

    wireModuleButtons("launch-int-module-btn", "close-int-module-btn", "integer");
    wireModuleButtons("launch-float-module-btn", "close-float-module-btn", "float");
    wireModuleButtons("launch-char-module-btn", "close-char-module-btn", "char");
}
