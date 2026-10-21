/**
 * Shared concept colours + icons for the Error Feedback page (error-analysis.js and
 * pretest-review.js). Colours and Font Awesome icons match the Home module cards
 * (student/StudentDashboard.js) so a concept looks the same everywhere.
 * Colours mark identity only (dots, icons, bars, accents); text stays in text tokens.
 */

export const CONCEPT_THEME = {
    Variables: { color: "#3B82F6", icon: "fa-box" },
    Operators: { color: "#10B981", icon: "fa-calculator" },
    Loops: { color: "#F59E0B", icon: "fa-rotate" },
    Arrays: { color: "#8B5CF6", icon: "fa-table-cells" },
    Methods: { color: "#EC4899", icon: "fa-code" },
};
const FALLBACK = { color: "#64748B", icon: "fa-circle-question" };

export const conceptTheme = (concept) => CONCEPT_THEME[concept] || FALLBACK;

const CONCEPT_OF_REASON_PREFIX = { VARIABLE: "Variables", LOOP: "Loops", ARRAY: "Arrays", METHOD: "Methods" };

/** Concept a C2 reason group belongs to, e.g. LOOP_BOUNDARY_ISSUE -> "Loops". */
export const conceptOfReason = (rg) => (rg ? CONCEPT_OF_REASON_PREFIX[rg.split("_")[0]] || null : null);

/**
 * Concept of a wrong answer's mistake: the mistake type's concept (an Arrays question with a
 * variable mistake is "Variables"). Only when there is no mistake type — text questions such as
 * Operators, or "no error found" — does the question topic stand in.
 */
export const mistakeConcept = (label, topic) => conceptOfReason(label) || topic || null;

// Component 3 games per concept (module keys of MODULE_TITLES in student/GamePlayer.js and
// MenuScene.js). `level` is the GamePlayer level line, `difficulty` the Home module card level.
// Methods has no fitting game: the only methods games (String / Scanner / Math … Methods Wings)
// practise calling built-in methods, while the pre-test's method mistakes are about return
// types, void, parameters and recursion.
const GAME_BY_CONCEPT = {
    Variables: { module: "integer", title: "Variable Tracker Arena", level: "Integer Mastery", difficulty: "Beginner" },
    Operators: { module: "operators", title: "Operator Mastery Academy", level: "3 Interactive Levels", difficulty: "Beginner" },
    Loops: { module: "loops", title: "Loop Train Express", level: "For Loop Mastery", difficulty: "Intermediate" },
    Arrays: { module: "arrays", title: "Array Index Rescue Game", level: "Array Boundary Mastery", difficulty: "Intermediate" },
    Methods: { module: "stringmethods", title: "Method Mastery Wing", level: "Built-in Methods", difficulty: "Intermediate" },
};

/** The game for a concept, or null when no game fits it yet. */
export const gameForConcept = (concept) => GAME_BY_CONCEPT[concept] || null;

/** Opens a Component 3 game in a new tab (same route as the Games page). */
export function launchGame(module) {
    const url = new URL(window.location.href);
    url.hash = `#/student/game-player?module=${encodeURIComponent(module)}`;
    url.search = "";
    window.open(url.toString(), "_blank", "noopener,noreferrer");
}

function escapeHtml(s) {
    return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/**
 * Colored concept chip: icon + text (default: the concept name) on a soft tint of the
 * concept colour, with an optional key such as "Question topic".
 */
export function conceptChip(concept, key = "", text = concept) {
    const { color, icon } = conceptTheme(concept);
    return `<span class="ef-chip" style="--c:${color};"><i class="fa-solid ${icon}" aria-hidden="true"></i>`
        + `${key ? `<span class="ef-chip-key">${escapeHtml(key)}:</span>` : ""}${escapeHtml(text || "Other")}</span>`;
}
