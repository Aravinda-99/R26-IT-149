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
