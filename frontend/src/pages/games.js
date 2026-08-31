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
 * Clean up any mounted Phaser UI when leaving the Games page.
 *
 * Bug fix (post-test "Learn Again" flow):
 * The Phaser container lives outside the page router (`#phaser-container` is not inside `#page-container`),
 * so it can remain visible across navigation unless we explicitly hide/destroy it.
 */
export function disposeGames() {
    destroyGame();
    hideGameContainer();
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
    // Ensure we never stack/duplicate old game canvases when relaunching.
    // This is UI cleanup only; it doesn't change scoring/logic.
    destroyGame();
    GameManager.set("activeModule", section);
    showGameContainer();
    mountGame({ parent: "phaser-container" });
    document.getElementById("phaser-container")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/**
 * Open a module's game in a brand-new browser tab with dedicated game-player page.
 */
export function openModuleInNewTab(section) {
    const url = new URL(window.location.href);
    url.hash = `#/student/game-player?module=${encodeURIComponent(section)}`;
    url.search = "";
    window.open(url.toString(), "_blank", "noopener,noreferrer");
}

/**
 * Called by main.js on page load when the URL carries ?launchModule=section
 */
export function launchModuleFromQuery(section) {
    openModuleInNewTab(section);
}

function wireModuleButtons(launchId, closeId, section) {
    document.getElementById(launchId)?.addEventListener("click", () => openModuleInNewTab(section));
    const closeBtn = document.getElementById(closeId);
    if (closeBtn) closeBtn.style.display = "none";
}

/**
 * Method wings that split into multiple sub-method groups (String.length()
 * vs String.charAt() vs case methods, etc.) — each needs its own selection
 * screen before picking a specific 3-level trilogy to launch.
 * Scanner Methods Wing has only one group, so it skips this tier entirely.
 */
const METHOD_GROUPS = {
    stringmethods: {
        title: "📝 String Methods Wing", color: "#f59e0b",
        groups: [
            { key: "stringmethods_length", title: "String.length()", desc: "The Scan Chamber → The Inspection Line → The Control Room", badge: "🔍 length() Mastery" },
            { key: "stringmethods_charat", title: "String.charAt()", desc: "The Retrieval Claw → The Claw Trials → The Workshop", badge: "🔧 charAt() Mastery" },
            { key: "stringmethods_case", title: "toUpperCase() / toLowerCase()", desc: "The Case Press → The Press Gauntlet → The Foundry", badge: "⚒️ Case Mastery" },
        ],
    },
    outputmethods: {
        title: "📢 Output Methods Wing", color: "#fb7185",
        groups: [
            { key: "outputmethods_println", title: "println()", desc: "The Broadcast Tower → The Signal Room → The Studio", badge: "🎬 println() Mastery" },
            { key: "outputmethods_print", title: "print()", desc: "The Whisper Booth → The Live Feed → The Newsroom", badge: "📰 print() Mastery" },
            { key: "outputmethods_printf", title: "printf()", desc: "The Composing Room → The Presses → The Print Floor", badge: "🖨️ printf() Mastery" },
        ],
    },
    arraylistmethods: {
        title: "📚 ArrayList Methods Wing", color: "#a78bfa",
        groups: [
            { key: "arraylistmethods_add", title: "add()", desc: "The Archive → The Card Catalog → The Reading Room", badge: "🔑 add() Mastery" },
            { key: "arraylistmethods_get", title: "get()", desc: "The Consultation Desk → The Stacks → The Restoration Room", badge: "🔎 get() Mastery" },
            { key: "arraylistmethods_remove", title: "remove()", desc: "The Deaccession Office → The Clearing Sale → The Grand Reshelving", badge: "🗝️ remove() Mastery" },
        ],
    },
    mathclassmethods: {
        title: "🔭 Math Class Methods Wing", color: "#60a5fa",
        groups: [
            { key: "mathclassmethods_maxmin", title: "max() / min()", desc: "The Observatory → The Meridian Trials → The Calculation Chamber", badge: "🏆 max()/min() Mastery" },
            // Temporarily hidden — see task to hide the abs() method card from the UI.
            // { key: "mathclassmethods_abs", title: "abs()", desc: "The Distance Hall → The Standards Office", badge: "🏛️ abs() Mastery" },
            { key: "mathclassmethods_pow", title: "pow()", desc: "The Power Tower → The Exponent Trials → The Formula Works", badge: "🏗️ pow() Mastery" },
        ],
    },
    arraymethods: {
        title: "🗃️ Array Methods Wing", color: "#c8a05a",
        groups: [
            { key: "arraymethods_tostring", title: "toString()", desc: "The Specimen Hall", badge: "🏺 toString() Schema" },
            { key: "arraymethods_sort", title: "sort()", desc: "The Sorting Room → The Classification Trials → The Arrangement Workshop", badge: "🗂️ sort() Mastery" },
            { key: "arraymethods_copyof", title: "copyOf()", desc: "The Copy Bench → The Replication Trials → The Curator's Bureau", badge: "🗝️ copyOf() Mastery" },
        ],
    },
    typeconversionmethods: {
        title: "🔥 Type Conversion Methods Wing", color: "#b87333",
        groups: [
            { key: "typeconversionmethods_parseint", title: "parseInt()", desc: "The Integer Furnace → The Smelting Trials → The Conversion Works", badge: "⚒️ parseInt() Mastery" },
            { key: "typeconversionmethods_parsedouble", title: "parseDouble()", desc: "The Decimal Crucible → The Precision Trials → The Decimal Works", badge: "⚖️ parseDouble() Mastery" },
            { key: "typeconversionmethods_valueof", title: "valueOf()", desc: "The Inscription Press → The Inscription Trials → The Assay Bureau", badge: "⛓️ valueOf() Mastery" },
        ],
    },
    charactermethods: {
        title: "🔎 Character Methods Wing", color: "#4fc3f7",
        groups: [
            { key: "charactermethods_isdigit", title: "isDigit()", desc: "The Numeral Loupe → The Numeral Trials → The Classification Works", badge: "🔎 isDigit() Mastery" },
            { key: "charactermethods_isletter", title: "isLetter()", desc: "The Alphabet Lens → The Letter Trials → The Alphabet Works", badge: "🔷 isLetter() Mastery" },
            { key: "charactermethods_isuppercase", title: "isUpperCase()", desc: "The Case Prism → The Case Trials → The Grand Classification", badge: "👑 isUpperCase() Mastery" },
        ],
    },
};

function renderMethodGroupSelection(container, wingKey) {
    const wing = METHOD_GROUPS[wingKey];
    if (!wing) return;

    let html = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;">
            <div>
                <h1>${wing.title}</h1>
                <p style="color: var(--text-secondary);">Pick a method to open its 3-level Schema Theory trilogy</p>
            </div>
            <button id="back-to-wings-btn" class="btn" style="background: var(--border-color); color: var(--text-primary); padding: 0.5rem 1rem;">← Back to Methods Wings</button>
        </div>
    `;

    wing.groups.forEach((group, i) => {
        html += `
            <div class="card" style="display:flex; align-items:center; justify-content:space-between; gap: 1rem; border-color: ${wing.color}; margin-bottom: 1rem;">
                <div>
                    <h3 style="color: ${wing.color}; font-size: 1.15rem; margin-bottom: 0.35rem;">${group.title}</h3>
                    <p style="color: var(--text-secondary); font-size: 0.85rem;">${group.desc}</p>
                    <p style="color: var(--text-secondary); font-size: 0.75rem; margin-top: 0.3rem;">Badge: ${group.badge}</p>
                </div>
                <div style="display:flex; gap: 0.5rem; flex-wrap: wrap; justify-content: flex-end;">
                    <button class="btn btn-primary" id="launch-group-${i}-btn" style="background: ${wing.color};">Launch Module</button>
                    <button class="btn" id="close-group-${i}-btn" style="background: var(--border-color); color: var(--text-primary);">Close</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;

    wing.groups.forEach((group, i) => {
        wireModuleButtons(`launch-group-${i}-btn`, `close-group-${i}-btn`, group.key);
    });

    document.getElementById("back-to-wings-btn")?.addEventListener("click", () => {
        showCategoryModules(container, "methods");
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
            <div class="card" id="category-loops" style="cursor: pointer; border-color: #14b8a6; transition: all 0.2s; padding: 1.5rem; display: flex; flex-direction: column; align-items: center; text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 0.5rem;">🔄</div>
                <h3 style="color: #14b8a6; font-size: 1.25rem; margin-bottom: 0.5rem;">For Loops</h3>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">Master counted iteration with for loops</p>
                <p style="color: var(--text-secondary); font-size: 0.75rem; margin-top: 0.5rem;">1 Mastery Module • 3 Levels</p>
            </div>

            <!-- While Loops Category -->
            <div class="card" id="category-whileloops" style="cursor: pointer; border-color: #0891b2; transition: all 0.2s; padding: 1.5rem; display: flex; flex-direction: column; align-items: center; text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 0.5rem;">∞</div>
                <h3 style="color: #0891b2; font-size: 1.25rem; margin-bottom: 0.5rem;">While Loops</h3>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">Master condition-driven iteration with while loops</p>
                <p style="color: var(--text-secondary); font-size: 0.75rem; margin-top: 0.5rem;">1 Mastery Module • 3 Levels</p>
            </div>

            <!-- Arrays Category -->
            <div class="card" id="category-arrays" style="cursor: pointer; border-color: #06b6d4; padding: 1.5rem; display: flex; flex-direction: column; align-items: center; text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 0.5rem;">📊</div>
                <h3 style="color: #06b6d4; font-size: 1.25rem; margin-bottom: 0.5rem;">Arrays</h3>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">Master collection & indexing</p>
                <p style="color: var(--text-secondary); font-size: 0.75rem; margin-top: 0.5rem;">1 Mastery Module • 3 Levels</p>
            </div>

            <!-- Methods Category -->
            <div class="card" id="category-methods" style="cursor: pointer; border-color: #f59e0b; padding: 1.5rem; display: flex; flex-direction: column; align-items: center; text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 0.5rem;">🔧</div>
                <h3 style="color: #f59e0b; font-size: 1.25rem; margin-bottom: 0.5rem;">Methods</h3>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">Master built-in Java methods: String, Scanner, Output, ArrayList, Math, Arrays, Type Conversion & Character</p>
                <p style="color: var(--text-secondary); font-size: 0.75rem; margin-top: 0.5rem;">8 Mastery Wings • 64 Levels</p>
            </div>
        </div>
    `;

    // Add hover effects and click listeners
    document.getElementById("category-variables")?.addEventListener("click", () => showCategoryModules(container, "variables"));
    document.getElementById("category-operators")?.addEventListener("click", () => showCategoryModules(container, "operators"));
    document.getElementById("category-loops")?.addEventListener("click", () => showCategoryModules(container, "loops"));
    document.getElementById("category-whileloops")?.addEventListener("click", () => showCategoryModules(container, "whileloops"));
    document.getElementById("category-arrays")?.addEventListener("click", () => showCategoryModules(container, "arrays"));
    document.getElementById("category-methods")?.addEventListener("click", () => showCategoryModules(container, "methods"));

    // Add visual feedback on hover for available categories
    ["category-variables", "category-operators", "category-loops", "category-whileloops", "category-arrays", "category-methods"].forEach(id => {
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
                </div>
                <div style="display:flex; gap: 0.5rem; flex-wrap: wrap; justify-content: flex-end;">
                    <button class="btn btn-primary" id="launch-operators-module-btn" style="background: #ff6b6b;">Launch Module</button>
                    <button class="btn" id="close-operators-module-btn" style="background: var(--border-color); color: var(--text-primary);">Close</button>
                </div>
            </div>
        `;
    } else if (category === "loops") {
        html += `
            <!-- For Loop Mastery Module -->
            <div class="card" style="display:flex; align-items:center; justify-content:space-between; gap: 1rem; border-color: #14b8a6; margin-bottom: 1rem;">
                <div>
                    <h3 style="color: #14b8a6; font-size: 1.15rem; margin-bottom: 0.35rem;">🔄 For Loop Mastery Module</h3>
                    <p style="color: var(--text-secondary); font-size: 0.85rem;">
                        2-Level Schema Theory Course — Accretion → Tuning:<br>
                        <b>Loop Train Express</b> (configure loops) &amp; <b>Iteration Arena</b> (rapid-fire combat challenges)
                    </p>
                </div>
                <div style="display:flex; gap: 0.5rem; flex-wrap: wrap; justify-content: flex-end;">
                    <button class="btn btn-primary" id="launch-loops-module-btn" style="background: #14b8a6;">Launch Module</button>
                    <button class="btn" id="close-loops-module-btn" style="background: var(--border-color); color: var(--text-primary);">Close</button>
                </div>
            </div>
        `;
    } else if (category === "whileloops") {
        html += `
            <!-- While Loop Mastery Module -->
            <div class="card" style="display:flex; align-items:center; justify-content:space-between; gap: 1rem; border-color: #0891b2; margin-bottom: 1rem;">
                <div>
                    <h3 style="color: #0891b2; font-size: 1.15rem; margin-bottom: 0.35rem;">∞ While Loop Mastery Module</h3>
                    <p style="color: var(--text-secondary); font-size: 0.85rem;">
                        3-Level Schema Theory Course: <b>Power Core Charger</b> → <b>Debug Dimension</b> → <b>Data Stream Processor</b>
                    </p>
                </div>
                <div style="display:flex; gap: 0.5rem; flex-wrap: wrap; justify-content: flex-end;">
                    <button class="btn btn-primary" id="launch-whileloops-module-btn" style="background: #0891b2;">Launch Module</button>
                    <button class="btn" id="close-whileloops-module-btn" style="background: var(--border-color); color: var(--text-primary);">Close</button>
                </div>
            </div>
        `;
    } else if (category === "arrays") {
        html += `
            <!-- Array Mastery Module -->
            <div class="card" style="display:flex; align-items:center; justify-content:space-between; gap: 1rem; border-color: #06b6d4; margin-bottom: 1rem;">
                <div>
                    <h3 style="color: #06b6d4; font-size: 1.15rem; margin-bottom: 0.35rem;">📊 Array Mastery Module</h3>
                    <p style="color: var(--text-secondary); font-size: 0.85rem;">
                        3-Level Schema Theory Course: <b>Memory Vault</b> → <b>Index Interceptor</b> → <b>Array Forge</b>
                    </p>
                </div>
                <div style="display:flex; gap: 0.5rem; flex-wrap: wrap; justify-content: flex-end;">
                    <button class="btn btn-primary" id="launch-arrays-module-btn" style="background: #06b6d4;">Launch Module</button>
                    <button class="btn" id="close-arrays-module-btn" style="background: var(--border-color); color: var(--text-primary);">Close</button>
                </div>
            </div>
        `;
    } else if (category === "methods") {
        html += `
            <!-- String Methods Wing -->
            <div class="card" style="display:flex; align-items:center; justify-content:space-between; gap: 1rem; border-color: #f59e0b; margin-bottom: 1rem;">
                <div>
                    <h3 style="color: #f59e0b; font-size: 1.15rem; margin-bottom: 0.35rem;">📝 String Methods Wing</h3>
                    <p style="color: var(--text-secondary); font-size: 0.85rem;">
                        3×3-Level Schema Theory Course: <b>length()</b> → <b>charAt()</b> → <b>toUpperCase()/toLowerCase()</b>
                    </p>
                </div>
                <div style="display:flex; gap: 0.5rem; flex-wrap: wrap; justify-content: flex-end;">
                    <button class="btn btn-primary" id="launch-stringmethods-module-btn" style="background: #f59e0b;">Launch Module</button>
                    <button class="btn" id="close-stringmethods-module-btn" style="background: var(--border-color); color: var(--text-primary);">Close</button>
                </div>
            </div>

            <!-- Scanner Methods Wing -->
            <div class="card" style="display:flex; align-items:center; justify-content:space-between; gap: 1rem; border-color: #38bdf8; margin-bottom: 1rem;">
                <div>
                    <h3 style="color: #38bdf8; font-size: 1.15rem; margin-bottom: 0.35rem;">📥 Scanner Methods Wing</h3>
                    <p style="color: var(--text-secondary); font-size: 0.85rem;">
                        3-Level Schema Theory Course: <b>The Intake Dock</b> → <b>The Night Shift</b> → <b>The Front Desk</b>
                    </p>
                </div>
                <div style="display:flex; gap: 0.5rem; flex-wrap: wrap; justify-content: flex-end;">
                    <button class="btn btn-primary" id="launch-scannermethods-module-btn" style="background: #38bdf8;">Launch Module</button>
                    <button class="btn" id="close-scannermethods-module-btn" style="background: var(--border-color); color: var(--text-primary);">Close</button>
                </div>
            </div>

            <!-- Output Methods Wing -->
            <div class="card" style="display:flex; align-items:center; justify-content:space-between; gap: 1rem; border-color: #fb7185; margin-bottom: 1rem;">
                <div>
                    <h3 style="color: #fb7185; font-size: 1.15rem; margin-bottom: 0.35rem;">📢 Output Methods Wing</h3>
                    <p style="color: var(--text-secondary); font-size: 0.85rem;">
                        3×3-Level Schema Theory Course: <b>println()</b> → <b>print()</b> → <b>printf()</b>
                    </p>
                </div>
                <div style="display:flex; gap: 0.5rem; flex-wrap: wrap; justify-content: flex-end;">
                    <button class="btn btn-primary" id="launch-outputmethods-module-btn" style="background: #fb7185;">Launch Module</button>
                    <button class="btn" id="close-outputmethods-module-btn" style="background: var(--border-color); color: var(--text-primary);">Close</button>
                </div>
            </div>

            <!-- ArrayList Methods Wing -->
            <div class="card" style="display:flex; align-items:center; justify-content:space-between; gap: 1rem; border-color: #a78bfa; margin-bottom: 1rem;">
                <div>
                    <h3 style="color: #a78bfa; font-size: 1.15rem; margin-bottom: 0.35rem;">📚 ArrayList Methods Wing</h3>
                    <p style="color: var(--text-secondary); font-size: 0.85rem;">
                        3×3-Level Schema Theory Course: <b>add()</b> → <b>get()</b> → <b>remove()</b>
                    </p>
                </div>
                <div style="display:flex; gap: 0.5rem; flex-wrap: wrap; justify-content: flex-end;">
                    <button class="btn btn-primary" id="launch-arraylistmethods-module-btn" style="background: #a78bfa;">Launch Module</button>
                    <button class="btn" id="close-arraylistmethods-module-btn" style="background: var(--border-color); color: var(--text-primary);">Close</button>
                </div>
            </div>

            <!-- Math Class Methods Wing -->
            <div class="card" style="display:flex; align-items:center; justify-content:space-between; gap: 1rem; border-color: #60a5fa; margin-bottom: 1rem;">
                <div>
                    <h3 style="color: #60a5fa; font-size: 1.15rem; margin-bottom: 0.35rem;">🔭 Math Class Methods Wing</h3>
                    <p style="color: var(--text-secondary); font-size: 0.85rem;">
                        Schema Theory Course: <b>max()/min()</b> → <b>abs()</b> → <b>pow()</b>
                    </p>
                </div>
                <div style="display:flex; gap: 0.5rem; flex-wrap: wrap; justify-content: flex-end;">
                    <button class="btn btn-primary" id="launch-mathclassmethods-module-btn" style="background: #60a5fa;">Launch Module</button>
                    <button class="btn" id="close-mathclassmethods-module-btn" style="background: var(--border-color); color: var(--text-primary);">Close</button>
                </div>
            </div>

            <!--
            Array Methods Wing, Type Conversion Methods Wing, and Character
            Methods Wing are temporarily hidden from the Methods Wings list.
            Uncomment this block (and the matching wingKey entries in the
            wireModuleButtons forEach below, if re-enabling the click wiring
            is desired) to restore them.

            Array Methods Wing:
            <div class="card" style="display:flex; align-items:center; justify-content:space-between; gap: 1rem; border-color: #c8a05a; margin-bottom: 1rem;">
                <div>
                    <h3 style="color: #c8a05a; font-size: 1.15rem; margin-bottom: 0.35rem;">🗃️ Array Methods Wing</h3>
                    <p style="color: var(--text-secondary); font-size: 0.85rem;">
                        Schema Theory Course: <b>toString()</b> → <b>sort()</b> → <b>copyOf()</b>
                    </p>
                </div>
                <div style="display:flex; gap: 0.5rem; flex-wrap: wrap; justify-content: flex-end;">
                    <button class="btn btn-primary" id="launch-arraymethods-module-btn" style="background: #c8a05a;">Launch Module</button>
                    <button class="btn" id="close-arraymethods-module-btn" style="background: var(--border-color); color: var(--text-primary);">Close</button>
                </div>
            </div>

            Type Conversion Methods Wing:
            <div class="card" style="display:flex; align-items:center; justify-content:space-between; gap: 1rem; border-color: #b87333; margin-bottom: 1rem;">
                <div>
                    <h3 style="color: #b87333; font-size: 1.15rem; margin-bottom: 0.35rem;">🔥 Type Conversion Methods Wing</h3>
                    <p style="color: var(--text-secondary); font-size: 0.85rem;">
                        3×3-Level Schema Theory Course: <b>parseInt()</b> → <b>parseDouble()</b> → <b>valueOf()</b>
                    </p>
                </div>
                <div style="display:flex; gap: 0.5rem; flex-wrap: wrap; justify-content: flex-end;">
                    <button class="btn btn-primary" id="launch-typeconversionmethods-module-btn" style="background: #b87333;">Launch Module</button>
                    <button class="btn" id="close-typeconversionmethods-module-btn" style="background: var(--border-color); color: var(--text-primary);">Close</button>
                </div>
            </div>

            Character Methods Wing:
            <div class="card" style="display:flex; align-items:center; justify-content:space-between; gap: 1rem; border-color: #4fc3f7; margin-bottom: 1rem;">
                <div>
                    <h3 style="color: #4fc3f7; font-size: 1.15rem; margin-bottom: 0.35rem;">🔎 Character Methods Wing</h3>
                    <p style="color: var(--text-secondary); font-size: 0.85rem;">
                        3×3-Level Schema Theory Course: <b>isDigit()</b> → <b>isLetter()</b> → <b>isUpperCase()</b>
                    </p>
                </div>
                <div style="display:flex; gap: 0.5rem; flex-wrap: wrap; justify-content: flex-end;">
                    <button class="btn btn-primary" id="launch-charactermethods-module-btn" style="background: #4fc3f7;">Launch Module</button>
                    <button class="btn" id="close-charactermethods-module-btn" style="background: var(--border-color); color: var(--text-primary);">Close</button>
                </div>
            </div>
            -->
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
    wireModuleButtons("launch-loops-module-btn", "close-loops-module-btn", "loops");
    wireModuleButtons("launch-whileloops-module-btn", "close-whileloops-module-btn", "whileloops");
    wireModuleButtons("launch-arrays-module-btn", "close-arrays-module-btn", "arrays");
    // Multi-group wings open a method-selection screen instead of launching directly.
    ["stringmethods", "outputmethods", "arraylistmethods", "mathclassmethods", "arraymethods", "typeconversionmethods", "charactermethods"].forEach((wingKey) => {
        document.getElementById(`launch-${wingKey}-module-btn`)?.addEventListener("click", () => {
            renderMethodGroupSelection(container, wingKey);
        });
        document.getElementById(`close-${wingKey}-module-btn`)?.addEventListener("click", () => {
            destroyGame();
            hideGameContainer();
        });
    });
    // Scanner Methods Wing has only one group — launch it directly.
    wireModuleButtons("launch-scannermethods-module-btn", "close-scannermethods-module-btn", "scannermethods");

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
        whileloops: "∞ While Loops Category",
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
        whileloops: "Master condition-driven iteration with while loops",
        arrays: "Learn collections and indexing",
        methods: "Master built-in Java methods across 8 wings: String, Scanner, Output, ArrayList, Math, Arrays, Type Conversion & Character"
    };
    return descriptions[category] || "";
}

function showCategoryModules(container, category) {
    selectedCategory = category;
    renderModuleView(container, category);
}

export async function renderGames(container) {
    destroyGame();
    hideGameContainer();

    const targetCategory = sessionStorage.getItem("codequest_target_category");
    if (targetCategory) {
        sessionStorage.removeItem("codequest_target_category");
        sessionStorage.removeItem("codequest_target_module");
        showCategoryModules(container, targetCategory);
        return;
    }

    renderCategoryView(container);
}

