/**
 * Component 2: Error Feedback
 * ===========================
 * Everything on this page comes from the student's latest pre-test attempt (the same
 * object the Pre-Test Review lists), so the stats, the review list, the error-pattern
 * chart and the recommended game always agree:
 *   stats bar → Pre-Test Review → [error pattern chart | recommended game (Component 3)]
 */

import { ErrorAPI, SchemaMasteryAPI } from "../api/api.js";
import { getCurrentUser } from "../utils/auth.js";
import { renderPretestReview, loadPretestAttempt, isWrongAnswer, friendlyReason, reasonMeaning } from "./pretest-review.js";
import { openSandbox } from "./sandbox.js";
import { conceptTheme, conceptOfReason, conceptChip } from "./concept-theme.js";

const CONCEPTS = ["Variables", "Loops", "Arrays", "Methods"];
const BROAD_LABEL_OF_CONCEPT = { Variables: "VARIABLE_ERROR", Loops: "LOOP_ERROR", Arrays: "ARRAY_ERROR", Methods: "METHOD_ERROR" };

// Component 3 modules (keys of MODULE_TITLES in student/GamePlayer.js and MenuScene.js).
// `level` is the GamePlayer level line, `difficulty` the Home module card level.
const GAME_BY_CONCEPT = {
    Variables: { module: "integer", title: "Variable Tracker Arena", level: "Integer Mastery", difficulty: "Beginner" },
    Loops: { module: "loops", title: "Loop Train Express", level: "For Loop Mastery", difficulty: "Intermediate" },
    Arrays: { module: "arrays", title: "Array Index Rescue Game", level: "Array Boundary Mastery", difficulty: "Intermediate" },
    Methods: { module: "stringmethods", title: "String Methods Wing", level: "Built-in Methods", difficulty: "Intermediate" },
};

function escapeHtml(s) {
    return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// Stats, chart bars and game target for one attempt. Errors are counted with the same
// isWrongAnswer() the review list uses for ❌, and every wrong answer lands in exactly
// one concept bar, so errors == ❌ count == sum of bars.
function summarizeAttempt({ quizResults, items, partial, c2ByQuestion }) {
    const wrong = items.filter(isWrongAnswer);

    const byConcept = Object.fromEntries(CONCEPTS.map(c => [c, 0]));
    wrong.forEach(it => {
        const concept = it.topic || "Other";
        byConcept[concept] = (byConcept[concept] || 0) + 1;
    });

    // Most frequent final reason group among this attempt's wrong answers; ties go to
    // the group seen first in question order (stable sort).
    const reasonCounts = {};
    wrong.forEach(it => {
        const rg = c2ByQuestion[it.question_id]?.reason_group;
        if (rg && rg !== "CORRECT_NO_ERROR") reasonCounts[rg] = (reasonCounts[rg] || 0) + 1;
    });
    const topReason = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    const topTopic = Object.entries(byConcept).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    const reasonConcept = conceptOfReason(topReason);

    // Results saved before questionResults existed only hold the wrong answers.
    const tb = quizResults.topicBreakdown || {};
    const total = partial ? Object.values(tb).reduce((s, d) => s + (d.total || 0), 0) : items.length;
    const score = partial ? (quizResults.score ?? 0) : items.filter(it => it.answered && it.isCorrect).length;

    return {
        score,
        total,
        unanswered: partial ? 0 : items.filter(it => !it.answered).length,
        wrong,
        byConcept,
        topReason,
        gameConcept: reasonConcept || topTopic,
        gameBasis: reasonConcept ? "top misconception" : "most wrong answers",
    };
}

function renderEmptyState(container) {
    container.innerHTML = `
        <div class="ef-card ef-empty">
            <div class="ef-empty-icon" aria-hidden="true"><i class="fa-solid fa-clipboard-list"></i></div>
            <h2 style="margin: 0 0 0.5rem 0; font-size: 1.3rem; color: var(--text-primary);">No pre-test attempt yet</h2>
            <p style="margin: 0 auto 1.5rem; max-width: 380px; color: var(--text-secondary); line-height: 1.55;">
                Take the pre-test and this page will explain every answer and show which mistakes to work on first.
            </p>
            <button type="button" id="ea-take-pretest" class="btn btn-primary" style="margin: 0;">
                <i class="fa-solid fa-play"></i> Take the Pre-Test
            </button>
        </div>
    `;
    document.getElementById("ea-take-pretest")?.addEventListener("click", () => {
        window.location.hash = "#/student/pre-test";
    });
}

// Horizontal bars, most mistakes first: concept icon + name on the axis, the count as a
// direct label, one colour per concept. Plain HTML so the labels are real text.
function patternBarsHtml(byConcept, errors) {
    if (errors === 0) {
        return `<div class="ef-perfect">
                <div class="ef-perfect-icon" aria-hidden="true"><i class="fa-solid fa-trophy"></i></div>
                <div style="font-size: 1.15rem; font-weight: 800; color: var(--text-primary);">Perfect score!</div>
                <div style="font-size: 0.88rem; color: var(--text-secondary); margin-top: 0.25rem;">No mistakes in any topic this attempt.</div>
            </div>`;
    }
    const rows = Object.entries(byConcept).sort((a, b) => b[1] - a[1]); // stable: ties keep concept order
    const max = rows[0][1];
    return `<ul class="ef-bars" aria-label="Wrong answers by concept">
            ${rows.map(([concept, n]) => {
                const { color, icon } = conceptTheme(concept);
                return `<li class="ef-bar-row${n === 0 ? " ef-bar-row--zero" : ""}" style="--c:${color};" title="${escapeHtml(concept)}: ${n} wrong answer${n !== 1 ? "s" : ""}">
                    <span class="ef-bar-label"><i class="fa-solid ${icon}" aria-hidden="true"></i>${escapeHtml(concept)}</span>
                    <span class="ef-bar-track" aria-hidden="true">${n > 0 ? `<span class="ef-bar-fill" style="display:block;width:${(n / max) * 100}%;"></span>` : ""}</span>
                    <span class="ef-bar-value">${n}</span>
                </li>`;
            }).join("")}
        </ul>
        <p class="ef-helper"><i class="fa-solid fa-circle-info" aria-hidden="true"></i>Higher bar = more mistakes in that topic. Start with the highest.</p>`;
}

function launchGame(module) {
    const url = new URL(window.location.href);
    url.hash = `#/student/game-player?module=${encodeURIComponent(module)}`;
    url.search = "";
    window.open(url.toString(), "_blank", "noopener,noreferrer");
}

// Hands this attempt's result to the learning session (Component 4) and the
// top-misconception record, using the same values the page shows.
function persistAttemptSummary(studentId, attempt, summary) {
    if (!studentId || summary.wrong.length === 0) return;
    const { quizResults, c2ByQuestion } = attempt;

    if (summary.topReason) {
        const representative = summary.wrong
            .map(it => c2ByQuestion[it.question_id])
            .find(c2 => c2?.reason_group === summary.topReason) || {};
        const payload = {
            student_id: studentId,
            error_type: summary.topReason,
            error_reason: representative.explanation?.misconception || representative.explanation?.reason || "",
        };
        if (typeof representative.error_pattern_score === "number") {
            payload.error_pattern_score = representative.error_pattern_score;
            payload.error_pattern_score_source = representative.error_pattern_score_source;
        }
        SchemaMasteryAPI.saveComponent2(payload)
            .catch(err => console.warn("Failed to persist Component 2 learning session:", err));
    }

    if (summary.gameConcept && BROAD_LABEL_OF_CONCEPT[summary.gameConcept]) {
        ErrorAPI.saveTopMisconception({
            student_id: studentId,
            top_misconception: BROAD_LABEL_OF_CONCEPT[summary.gameConcept],
            concept: summary.gameConcept,
            total_errors: summary.wrong.length,
            topic_breakdown: quizResults.topicBreakdown || summary.byConcept,
            accuracy_pct: quizResults.percent ?? 0,
            source: "error_pattern_detector",
        }).catch(err => console.warn("Failed to persist top misconception:", err));
    }
}

export async function renderErrorAnalysis(container) {
    const user = getCurrentUser();
    if (!user) {
        window.location.hash = "#/login";
        return;
    }
    const studentId = user.uid || user.id;

    const attempt = loadPretestAttempt();
    if (!attempt) {
        renderEmptyState(container);
        return;
    }
    const summary = summarizeAttempt(attempt);
    const errors = summary.wrong.length;
    const game = GAME_BY_CONCEPT[summary.gameConcept] || null;

    const scorePct = summary.total > 0 ? Math.round((summary.score / summary.total) * 100) : 0;
    const topConcept = conceptOfReason(summary.topReason);

    // Game card: concept-coloured header with the game's robot sprite, then a big start button.
    const browseBtn = `<button type="button" id="ea-browse-games" class="btn btn-primary ef-game-start"><i class="fa-solid fa-gamepad" aria-hidden="true"></i> Browse Games</button>`;
    let gameColor = "var(--primary)";
    let gameTitle;
    let gameBody;
    if (errors === 0) {
        gameColor = "var(--success)";
        gameTitle = "No errors this attempt 🎉";
        gameBody = `<div class="ef-game-line">Pick any game to keep practising.</div>${browseBtn}`;
    } else if (game) {
        gameColor = conceptTheme(summary.gameConcept).color;
        gameTitle = escapeHtml(game.title);
        gameBody = `
            <div class="ef-game-line">
                Practice <strong>${escapeHtml(summary.gameConcept)}</strong> in a game
                <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.2rem;">Chosen from your ${summary.gameBasis}.</div>
            </div>
            <div class="ef-game-chips">
                ${conceptChip(summary.gameConcept)}
                <span class="ef-tag"><i class="fa-solid fa-signal" aria-hidden="true"></i>${escapeHtml(game.difficulty)}</span>
                <span class="ef-tag"><i class="fa-solid fa-layer-group" aria-hidden="true"></i>${escapeHtml(game.level)}</span>
                <span class="ef-tag"><i class="fa-solid fa-wand-magic-sparkles" aria-hidden="true"></i>Adaptive</span>
            </div>
            <button type="button" id="ea-start-game" class="btn btn-primary ef-game-start">
                <i class="fa-solid fa-play" aria-hidden="true"></i> Start Game Lesson
            </button>`;
    } else {
        gameTitle = "Practice in a game";
        gameBody = `<div class="ef-game-line">No matching game for this attempt's errors yet.</div>${browseBtn}`;
    }

    container.innerHTML = `
        <div class="ef-page">
            <div class="ef-header">
                <div>
                    <h1 class="ef-title"><i class="fa-solid fa-magnifying-glass-chart" aria-hidden="true"></i> Your Error Feedback</h1>
                    <div class="ef-subtitle">Based on your latest pre-test attempt</div>
                </div>
                <button type="button" id="open-free-sandbox" class="btn btn-primary ef-sandbox-btn">
                    <i class="fa-solid fa-flask" aria-hidden="true"></i> Java Sandbox
                </button>
            </div>

            <!-- Stats: latest pre-test attempt only -->
            <div class="ef-stats">
                <div class="ef-stat" style="--c: var(--success);">
                    <div class="ef-ring" role="img" aria-label="${scorePct}% correct">
                        <svg viewBox="0 0 56 56" width="56" height="56" aria-hidden="true">
                            <circle class="ef-ring-track" cx="28" cy="28" r="24" fill="none" stroke-width="6"></circle>
                            <circle class="ef-ring-fill" cx="28" cy="28" r="24" fill="none" stroke-width="6" pathLength="100" stroke-dasharray="${scorePct} 100"></circle>
                        </svg>
                        <i class="fa-solid fa-trophy" aria-hidden="true"></i>
                    </div>
                    <div style="min-width: 0;">
                        <div class="ef-stat-label">Score</div>
                        <div class="ef-stat-value">${summary.score} / ${summary.total}</div>
                        <div class="ef-stat-note">${scorePct}% correct</div>
                    </div>
                </div>
                <div class="ef-stat" style="--c: var(--danger);">
                    <div class="ef-stat-icon" aria-hidden="true"><i class="fa-solid fa-triangle-exclamation"></i></div>
                    <div style="min-width: 0;">
                        <div class="ef-stat-label">Errors</div>
                        <div class="ef-stat-value">${errors}</div>
                        <div class="ef-stat-note">${summary.unanswered ? `+ ${summary.unanswered} not answered` : "wrong answers"}</div>
                    </div>
                </div>
                <div class="ef-stat" style="--c: ${topConcept ? conceptTheme(topConcept).color : "var(--text-muted)"};">
                    <div class="ef-stat-icon" aria-hidden="true"><i class="fa-solid fa-bug"></i></div>
                    <div style="min-width: 0;">
                        <div class="ef-stat-label">Top Misconception</div>
                        <div class="ef-stat-value ef-stat-value--text">${escapeHtml(friendlyReason(summary.topReason) || "—")}</div>
                        <div class="ef-stat-note">${summary.topReason ? escapeHtml(reasonMeaning(summary.topReason)) : "No misconception detected"}</div>
                        ${topConcept ? `<div style="margin-top: 0.4rem;">${conceptChip(topConcept)}</div>` : ""}
                    </div>
                </div>
            </div>

            <!-- Pre-Test Review: every question with a per-question explanation (pretest-review.js) -->
            <div id="pretest-review-section"></div>

            <div class="ef-row">
                <div class="ef-card">
                    <h2 class="ef-card-title"><i class="fa-solid fa-chart-bar" aria-hidden="true"></i> Where you made mistakes (this attempt)</h2>
                    ${patternBarsHtml(summary.byConcept, errors)}
                </div>

                <!-- Recommended Game Activity — link to Component 3 -->
                <div class="ef-card ef-game" style="--c: ${gameColor};">
                    <div class="ef-game-head">
                        <img class="ef-game-sprite" src="/assets/images/robot.png" alt="" width="64" height="64">
                        <div style="min-width: 0;">
                            <div class="ef-game-kicker"><i class="fa-solid fa-gamepad" aria-hidden="true"></i> Recommended Game Activity</div>
                            <div class="ef-game-title">${gameTitle}</div>
                        </div>
                    </div>
                    <div class="ef-game-body">${gameBody}</div>
                </div>
            </div>
        </div>
    `;

    document.getElementById("open-free-sandbox")?.addEventListener("click", () => openSandbox({ mode: "free" }));
    document.getElementById("ea-start-game")?.addEventListener("click", () => launchGame(game.module));
    document.getElementById("ea-browse-games")?.addEventListener("click", () => { window.location.hash = "#/student/games"; });

    // Pre-Test Review is independent of the rest of the page; a failure here must not affect it.
    try {
        renderPretestReview(document.getElementById("pretest-review-section"), studentId, attempt);
    } catch (err) {
        console.warn("Pre-Test Review failed to render:", err);
    }

    persistAttemptSummary(studentId, attempt, summary);
}
