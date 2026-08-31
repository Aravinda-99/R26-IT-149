/**
 * Dedicated Game Player Page
 * ==========================
 * Standalone, single-purpose game player view.
 * Renders ONLY the active game controls, module title, and the Phaser canvas.
 * (Does NOT render any category cards, dashboard widgets, or catalog lists).
 */

import { mountGame, destroyGame } from "../../game/main.js";
import { GameManager } from "../../game/GameManager.js";

const MODULE_TITLES = {
    integer: { name: "Variable Tracker Arena", category: "Variables & Types", level: "Integer Mastery" },
    float: { name: "Precision Lab", category: "Variables & Types", level: "Float Mastery" },
    char: { name: "Character Workshop", category: "Variables & Types", level: "Char Mastery" },
    string: { name: "String Weaver Studio", category: "Variables & Types", level: "String Mastery" },
    operators: { name: "Operator Mastery Academy", category: "Operators & Logic", level: "3 Interactive Levels" },
    loops: { name: "Loop Train Express", category: "Loops & Iteration", level: "For Loop Mastery" },
    whileloops: { name: "Condition Guard", category: "Loops & Iteration", level: "While Loop Mastery" },
    arrays: { name: "Array Index Rescue Game", category: "Arrays & Indices", level: "Array Boundary Mastery" },
    stringmethods: { name: "String Methods Wing", category: "Methods", level: "Built-in Methods" },
    scannermethods: { name: "Scanner Methods Wing", category: "Methods", level: "Input Handling" },
    outputmethods: { name: "Output Methods Wing", category: "Methods", level: "Standard Output" },
    arraylistmethods: { name: "ArrayList Methods Wing", category: "Methods", level: "Dynamic Lists" },
    mathclassmethods: { name: "Math Class Methods Wing", category: "Methods", level: "Math Utilities" },
    arraysclassmethods: { name: "Arrays Utility Methods Wing", category: "Methods", level: "Array Utilities" },
    typeconversionmethods: { name: "Type Conversion Wing", category: "Methods", level: "Casting & Parsing" },
    charactermethods: { name: "Character Methods Wing", category: "Methods", level: "Char Checks & Case" }
};

export async function renderGamePlayer(container) {
    // Parse module key from URL hash query or fallback
    const hash = window.location.hash || "";
    let moduleKey = "arrays";

    const queryIdx = hash.indexOf("?");
    if (queryIdx !== -1) {
        const params = new URLSearchParams(hash.substring(queryIdx));
        if (params.get("module")) {
            moduleKey = params.get("module");
        }
    } else {
        const stored = sessionStorage.getItem("codequest_active_game_module");
        if (stored) moduleKey = stored;
    }

    const info = MODULE_TITLES[moduleKey] || { name: "Java Game Lesson", category: "Java Practice", level: "Mastery Level" };

    // Clean up any stale instances before mounting
    destroyGame();

    container.innerHTML = `
        <div class="game-player-page" style="max-width: 1280px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.25rem;">
            
            <!-- Top Game Player Bar -->
            <div class="game-player-topbar" style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 1rem 1.5rem; display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); align-items: center; gap: 1rem; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);">
                <div style="display: flex; align-items: center; justify-content: flex-start; min-width: 0;">
                    <a href="#/student/games" id="btn-exit-game" class="btn btn-outline" style="padding: 0.5rem 1rem; font-size: 0.85rem; font-weight: 600; border-radius: 8px; border: 1px solid #E2E8F0; background: #FFFFFF; color: #0F172A; text-decoration: none; display: inline-flex; align-items: center; gap: 0.45rem; white-space: nowrap;">
                        <i class="fa-solid fa-arrow-left"></i> Exit to Game Lessons
                    </a>
                </div>

                <div style="text-align: center; min-width: 0;">
                    <div style="display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 0.5rem;">
                        <h2 style="font-size: 1.15rem; font-weight: 800; color: #0F172A; margin: 0;">🎮 ${info.name}</h2>
                        <span class="badge" style="background: #EFF6FF; color: #2563EB; font-weight: 700; font-size: 0.72rem; padding: 0.15rem 0.55rem; border-radius: 9999px;">${info.category}</span>
                    </div>
                    <p style="font-size: 0.8rem; color: #64748B; margin: 0.15rem 0 0 0; text-align: center;">${info.level} • Follow the on-screen interactive instructions.</p>
                </div>

                <div style="display: flex; align-items: center; justify-content: flex-end; gap: 0.6rem; min-width: 0;">
                    <button id="btn-restart-game" class="btn btn-outline btn-sm" style="padding: 0.45rem 0.85rem; font-size: 0.8rem; font-weight: 600; border-radius: 6px; border: 1px solid #CBD5E1; background: #FFFFFF; color: #0F172A; cursor: pointer; display: inline-flex; align-items: center; gap: 0.35rem; white-space: nowrap;">
                        <i class="fa-solid fa-rotate-right"></i> Restart Level
                    </button>
                </div>
            </div>

            <!-- Standalone Dedicated Phaser Container -->
            <div id="phaser-game-wrapper" style="width: 100%; display: flex; justify-content: center;">
                <div id="phaser-container" style="width: 100%; max-width: 1280px; aspect-ratio: 1280 / 720; background: #0f0f1b; border-radius: 16px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08); position: relative;">
                    <!-- Canvas injected by Phaser -->
                </div>
            </div>

        </div>
    `;

    // Exit Game button cleanup
    document.getElementById("btn-exit-game")?.addEventListener("click", () => {
        destroyGame();
    });

    // Restart level handler
    document.getElementById("btn-restart-game")?.addEventListener("click", () => {
        destroyGame();
        setTimeout(() => {
            GameManager.set("activeModule", moduleKey);
            mountGame({ parent: "phaser-container" });
        }, 100);
    });

    // Set module and mount game
    GameManager.set("activeModule", moduleKey);
    setTimeout(() => {
        const phaserEl = document.getElementById("phaser-container");
        if (phaserEl) {
            phaserEl.classList.remove("hidden");
            mountGame({ parent: "phaser-container" });
        }
    }, 50);
}
