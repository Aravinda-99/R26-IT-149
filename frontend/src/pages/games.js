/**
 * Games Page
 * ===========
 * Two-tier navigation: Category selection → Module selection
 * Categories: Variables, Operators, Loops, Arrays, Methods
 * Launch opens Phaser; optional menu section scroll is set via sessionStorage.
 */

import { mountGame, destroyGame } from "../game/main.js";
import { GameManager } from "../game/GameManager.js";

const MENU_FOCUS_KEY = "codequest_menu_focus";
let selectedCategory = null; // Track current category view

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
 * @param {"integer"|"float"|"char"|"string"|"operators"} section — module to launch
 */
function launchGame(section) {
    if (section === "integer") {
        sessionStorage.removeItem(MENU_FOCUS_KEY);
    } else {
        sessionStorage.setItem(MENU_FOCUS_KEY, section);
    }
    GameManager.set("activeModule", section);
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

function renderCategoryView(container) {
    container.innerHTML = `
        <h1>Learning Games</h1>
        <p style="color: var(--text-secondary); margin-bottom: 2rem;">Choose a category to start learning</p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
            <!-- Variables Category -->
            <div class="card" id="category-variables" style="cursor: pointer; border-color: var(--accent-purple); transition: all 0.2s; padding: 1.5rem; display: flex; flex-direction: column; align-items: center; text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 0.5rem;">📦</div>
                <h3 style="color: var(--accent-purple); font-size: 1.25rem; margin-bottom: 0.5rem;">Variables</h3>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">Master data types: Integers, Floats, Characters & Strings</p>
                <p style="color: var(--text-secondary); font-size: 0.75rem; margin-top: 0.5rem;">4 Mastery Modules • 12 Levels</p>
            </div>

            <!-- Operators Category -->
            <div class="card" id="category-operators" style="cursor: pointer; border-color: #ff6b6b; transition: all 0.2s; padding: 1.5rem; display: flex; flex-direction: column; align-items: center; text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 0.5rem;">⚡</div>
                <h3 style="color: #ff6b6b; font-size: 1.25rem; margin-bottom: 0.5rem;">Operators</h3>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">Learn arithmetic, comparison & logical operations</p>
                <p style="color: var(--text-secondary); font-size: 0.75rem; margin-top: 0.5rem;">1 Mastery Module • 3 Levels</p>
            </div>

            <!-- Loops Category -->
            <div class="card" id="category-loops" style="cursor: pointer; border-color: #14b8a6; opacity: 0.6; padding: 1.5rem; display: flex; flex-direction: column; align-items: center; text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 0.5rem; filter: grayscale(50%);">🔄</div>
                <h3 style="color: #14b8a6; font-size: 1.25rem; margin-bottom: 0.5rem;">Loops</h3>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">Master iteration patterns</p>
                <p style="color: var(--text-secondary); font-size: 0.75rem; margin-top: 0.5rem;">Coming Soon</p>
            </div>

            <!-- Arrays Category -->
            <div class="card" id="category-arrays" style="cursor: pointer; border-color: #06b6d4; opacity: 0.6; padding: 1.5rem; display: flex; flex-direction: column; align-items: center; text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 0.5rem; filter: grayscale(50%);">📊</div>
                <h3 style="color: #06b6d4; font-size: 1.25rem; margin-bottom: 0.5rem;">Arrays</h3>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">Master collection & indexing</p>
                <p style="color: var(--text-secondary); font-size: 0.75rem; margin-top: 0.5rem;">Coming Soon</p>
            </div>

            <!-- Methods Category -->
            <div class="card" id="category-methods" style="cursor: pointer; border-color: #f59e0b; opacity: 0.6; padding: 1.5rem; display: flex; flex-direction: column; align-items: center; text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 0.5rem; filter: grayscale(50%);">🔧</div>
                <h3 style="color: #f59e0b; font-size: 1.25rem; margin-bottom: 0.5rem;">Methods</h3>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">Master function design & reuse</p>
                <p style="color: var(--text-secondary); font-size: 0.75rem; margin-top: 0.5rem;">Coming Soon</p>
            </div>
        </div>
    `;

    // Add hover effects and click listeners
    document.getElementById("category-variables")?.addEventListener("click", () => showCategoryModules(container, "variables"));
    document.getElementById("category-operators")?.addEventListener("click", () => showCategoryModules(container, "operators"));

    // Add visual feedback on hover for available categories
    ["category-variables", "category-operators"].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("mouseover", () => el.style.transform = "translateY(-4px)");
            el.addEventListener("mouseout", () => el.style.transform = "translateY(0)");
        }
    });
}

function renderModuleView(container, category) {
    let html = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;">
            <div>
                <h1>${getCategoryTitle(category)}</h1>
                <p style="color: var(--text-secondary);">${getCategoryDescription(category)}</p>
            </div>
            <button id="back-to-categories-btn" class="btn" style="background: var(--border-color); color: var(--text-primary); padding: 0.5rem 1rem;">← Back to Categories</button>
        </div>
    `;

    if (category === "variables") {
        html += `
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

            <!-- String Mastery Module -->
            <div class="card" style="display:flex; align-items:center; justify-content:space-between; gap: 1rem; border-color: var(--accent-orange); margin-bottom: 1rem;">
                <div>
                    <h3 style="color: var(--accent-orange); font-size: 1.15rem; margin-bottom: 0.35rem;">🧵 String Mastery Module</h3>
                    <p style="color: var(--text-secondary); font-size: 0.85rem;">
                        3-Level Schema Theory Course: <b>Message Garden Collector</b> → <b>String Lab Master</b> → <b>Advanced String Master</b>
                    </p>
                    <p style="color: var(--text-secondary); font-size: 0.75rem; margin-top: 0.3rem;">
                        Badges: 🌸 Garden Keeper &nbsp; 🧪 String Master &nbsp; 🎓 String Genius
                    </p>
                </div>
                <div style="display:flex; gap: 0.5rem; flex-wrap: wrap; justify-content: flex-end;">
                    <button class="btn btn-primary" id="launch-string-module-btn" style="background: var(--accent-orange);">Launch Module</button>
                    <button class="btn" id="close-string-module-btn" style="background: var(--border-color); color: var(--text-primary);">Close</button>
                </div>
            </div>
        `;
    } else if (category === "operators") {
        html += `
            <!-- Operator Mastery Module -->
            <div class="card" style="display:flex; align-items:center; justify-content:space-between; gap: 1rem; border-color: #ff6b6b; margin-bottom: 1rem;">
                <div>
                    <h3 style="color: #ff6b6b; font-size: 1.15rem; margin-bottom: 0.35rem;">⚡ Operator Mastery Module</h3>
                    <p style="color: var(--text-secondary); font-size: 0.85rem;">
                        3-Level Schema Theory Course: <b>Math Magic Academy</b> → <b>Calculation Arena</b> → <b>Code Builder Pro</b>
                    </p>
                    <p style="color: var(--text-secondary); font-size: 0.75rem; margin-top: 0.3rem;">
                        Badges: 🧙 Math Wizard &nbsp; ⚔️ Combat Calculator &nbsp; 👨‍💼 Code Master
                    </p>
                </div>
                <div style="display:flex; gap: 0.5rem; flex-wrap: wrap; justify-content: flex-end;">
                    <button class="btn btn-primary" id="launch-operators-module-btn" style="background: #ff6b6b;">Launch Module</button>
                    <button class="btn" id="close-operators-module-btn" style="background: var(--border-color); color: var(--text-primary);">Close</button>
                </div>
            </div>
        `;
    } else {
        html += `
            <div class="card" style="padding: 3rem; text-align: center; border-color: var(--border-color);">
                <div style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.5;">🚀</div>
                <h2 style="color: var(--text-secondary); margin-bottom: 0.5rem;">Coming Soon!</h2>
                <p style="color: var(--text-secondary);">This category is under development. Check back soon for new challenges!</p>
            </div>
        `;
    }

    // Set HTML first
    container.innerHTML = html;

    // Then wire up all buttons AFTER DOM elements exist
    wireModuleButtons("launch-int-module-btn", "close-int-module-btn", "integer");
    wireModuleButtons("launch-float-module-btn", "close-float-module-btn", "float");
    wireModuleButtons("launch-char-module-btn", "close-char-module-btn", "char");
    wireModuleButtons("launch-string-module-btn", "close-string-module-btn", "string");
    wireModuleButtons("launch-operators-module-btn", "close-operators-module-btn", "operators");

    // Wire back button
    document.getElementById("back-to-categories-btn")?.addEventListener("click", () => {
        selectedCategory = null;
        renderCategoryView(container);
    });
}

function getCategoryTitle(category) {
    const titles = {
        variables: "📦 Variables Category",
        operators: "⚡ Operators Category",
        loops: "🔄 Loops Category",
        arrays: "📊 Arrays Category",
        methods: "🔧 Methods Category"
    };
    return titles[category] || "Learning Games";
}

function getCategoryDescription(category) {
    const descriptions = {
        variables: "Master the fundamental data types: integers, floats, characters, and strings",
        operators: "Learn arithmetic, comparison, and logical operations",
        loops: "Master iteration and repetition patterns",
        arrays: "Learn collections and indexing",
        methods: "Master function design and reuse"
    };
    return descriptions[category] || "";
}

function showCategoryModules(container, category) {
    selectedCategory = category;
    renderModuleView(container, category);
}

export async function renderGames(container) {
    renderCategoryView(container);
}
