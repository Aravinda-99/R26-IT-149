/**
 * Component 2: Error Feedback
 * ===========================
 * Everything on this page comes from the student's latest pre-test attempt (the same
 * object the Pre-Test Review lists), so the stats, the review list, the error-pattern
 * chart and the game plan always agree:
 *   stats bar → Pre-Test Review → [error pattern chart | game plan (Component 3)]
 *
 * Score, errors and the chart come from the answer key and are shown at once. Mistake
 * types (Top Misconception, game plan) are the AI Error Detector card labels of the wrong
 * answers, which arrive from /api/errors/explain; until they do, those two cards show a
 * loading state.
 */

import { ErrorAPI, SchemaMasteryAPI } from "../api/api.js";
import { getCurrentUser } from "../utils/auth.js";
import {
    renderPretestReview, loadPretestAttempt, isWrongAnswer, friendlyReason, reasonMeaning,
    createExplanationStore, cardLabelOf,
} from "./pretest-review.js";
import { openSandbox } from "./sandbox.js";
import { conceptTheme, conceptOfReason, conceptChip, mistakeConcept, gameForConcept, launchGame } from "./concept-theme.js";

const CONCEPTS = ["Variables", "Loops", "Arrays", "Methods"];
const BROAD_LABEL_OF_CONCEPT = {
    Variables: "VARIABLE_ERROR", Operators: "OPERATOR_ERROR", Loops: "LOOP_ERROR", Arrays: "ARRAY_ERROR", Methods: "METHOD_ERROR",
};
const LABEL_FETCH_CONCURRENCY = 4;

function escapeHtml(s) {
    return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// Score, errors and chart bars for one attempt (answer key only). Errors are counted with
// the same isWrongAnswer() the review list uses for ❌, and every wrong answer lands in
// exactly one topic bar, so errors == ❌ count == sum of bars.
function summarizeAttempt({ quizResults, items, partial }) {
    const wrong = items.filter(isWrongAnswer);

    const byConcept = Object.fromEntries(CONCEPTS.map(c => [c, 0]));
    wrong.forEach(it => {
        const concept = it.topic || "Other";
        byConcept[concept] = (byConcept[concept] || 0) + 1;
    });

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
    };
}

// Top Misconception and game plan from the wrong answers' card labels (Map question_id ->
// label). Top Misconception = the most frequent mistake type (ties: first in the order the student answered).
// Game plan = mistake-type concepts by number of mistakes, the Top Misconception's concept first.
function summarizeMistakes(wrong, labels) {
    const reasonCounts = {};
    const conceptCounts = {};
    wrong.forEach(it => {
        const label = labels.get(it.question_id);
        if (label && label !== "CORRECT_NO_ERROR") reasonCounts[label] = (reasonCounts[label] || 0) + 1;
        const concept = mistakeConcept(label, it.topic) || "Other";
        conceptCounts[concept] = (conceptCounts[concept] || 0) + 1;
    });
    const topReason = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    const topConcept = conceptOfReason(topReason);
    const plan = Object.entries(conceptCounts)
        .sort((a, b) => (b[0] === topConcept) - (a[0] === topConcept) || b[1] - a[1])
        .map(([concept, count]) => ({ concept, count, game: gameForConcept(concept) }));
    return { topReason, topConcept, plan };
}

// Card label of every wrong answer, a few requests at a time. A failed request falls back to
// quizLab.js's Model 3 label (or none), so the result always arrives.
async function resolveCardLabels(wrong, store, c2ByQuestion, onProgress) {
    const labels = new Map();
    let next = 0;
    const worker = async () => {
        while (next < wrong.length) {
            const item = wrong[next++];
            const c2 = c2ByQuestion[item.question_id];
            const res = await store.get(item).catch(() => null);
            labels.set(item.question_id, cardLabelOf(c2, res));
            onProgress(labels.size, wrong.length);
        }
    };
    await Promise.all(Array.from({ length: Math.min(LABEL_FETCH_CONCURRENCY, wrong.length) }, worker));
    return labels;
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

const loadingLine = (text) => `<div class="ef-loading"><div class="spinner" aria-hidden="true"></div><span>${escapeHtml(text)}</span></div>`;
const progressText = (done, total) => `Analysing your answers… ${done} / ${total}`;

// Top Misconception stat card. mistakes === null while the card labels are loading.
function topStatHtml(errors, mistakes, progress) {
    const concept = mistakes?.topConcept;
    let body;
    if (errors === 0) {
        body = `<div class="ef-stat-value ef-stat-value--text">—</div><div class="ef-stat-note">No wrong answers this attempt</div>`;
    } else if (!mistakes) {
        body = `<div class="ef-stat-value ef-stat-value--text">${loadingLine(progress)}</div>`;
    } else if (!mistakes.topReason) {
        body = `<div class="ef-stat-value ef-stat-value--text">No mistake type detected</div>
            <div class="ef-stat-note">Your wrong answers are text questions the AI Error Detector does not analyse.</div>`;
    } else {
        body = `<div class="ef-stat-value ef-stat-value--text">${escapeHtml(friendlyReason(mistakes.topReason))}</div>
            <div class="ef-stat-note">${escapeHtml(reasonMeaning(mistakes.topReason))}</div>
            <div style="margin-top: 0.4rem;">${conceptChip(concept)}</div>`;
    }
    return `<div class="ef-stat" id="ef-top-stat" aria-live="polite" style="--c: ${concept ? conceptTheme(concept).color : "var(--text-muted)"};">
            <div class="ef-stat-icon" aria-hidden="true"><i class="fa-solid fa-bug"></i></div>
            <div style="min-width: 0;">
                <div class="ef-stat-label">Top Misconception</div>
                ${body}
            </div>
        </div>`;
}

const mistakesText = (n) => `${n} mistake${n !== 1 ? "s" : ""}`;

// "Your game plan": one row per mistake-type concept; the first (Top Misconception's
// concept) gets the big Start Game Lesson button, the rest smaller Play buttons.
function gamePlanHtml(errors, mistakes, progress) {
    const head = (title) => `
        <div class="ef-game-head">
            <img class="ef-game-sprite" src="/assets/images/robot.png" alt="" width="64" height="64">
            <div style="min-width: 0;">
                <div class="ef-game-kicker"><i class="fa-solid fa-gamepad" aria-hidden="true"></i> Your game plan</div>
                <div class="ef-game-title">${title}</div>
            </div>
        </div>`;
    const card = (color, inner) => `<div class="ef-card ef-game" id="ef-game-plan" aria-live="polite" style="--c: ${color};">${inner}</div>`;
    const sandboxBtn = (cls) => `<button type="button" class="btn btn-secondary ${cls}" data-plan-sandbox><i class="fa-solid fa-flask" aria-hidden="true"></i> Java Sandbox</button>`;

    if (errors === 0) {
        return card("var(--success)", head("No errors this attempt 🎉") + `
            <div class="ef-game-body">
                <div class="ef-game-line">Pick any game to keep practising.</div>
                <button type="button" class="btn btn-primary ef-game-start" data-plan-browse><i class="fa-solid fa-gamepad" aria-hidden="true"></i> Browse Games</button>
            </div>`);
    }
    if (!mistakes) {
        return card("var(--primary)", head("Working out your plan…") + `<div class="ef-game-body">${loadingLine(progress)}</div>`);
    }

    const [first, ...rest] = mistakes.plan;
    const firstBody = first.game ? `
            <div class="ef-game-line">Practice <strong>${escapeHtml(first.concept)}</strong> in a game</div>
            <div class="ef-game-chips">
                ${conceptChip(first.concept)}
                <span class="ef-tag"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>${mistakesText(first.count)}</span>
                <span class="ef-tag"><i class="fa-solid fa-signal" aria-hidden="true"></i>${escapeHtml(first.game.difficulty)}</span>
                <span class="ef-tag"><i class="fa-solid fa-layer-group" aria-hidden="true"></i>${escapeHtml(first.game.level)}</span>
            </div>
            <button type="button" class="btn btn-primary ef-game-start" data-plan-game="${escapeHtml(first.game.module)}">
                <i class="fa-solid fa-play" aria-hidden="true"></i> Start Game Lesson
            </button>` : `
            <div class="ef-game-chips">${conceptChip(first.concept)}<span class="ef-tag"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>${mistakesText(first.count)}</span></div>
            <div class="ef-game-line">No game for this topic yet — try the Java Sandbox.</div>
            ${sandboxBtn("ef-game-start")}`;

    const restRows = rest.map(row => `
            <li class="ef-plan-row" style="--c: ${conceptTheme(row.concept).color};">
                <div class="ef-plan-info">
                    <div class="ef-plan-top">${conceptChip(row.concept)}<span class="ef-plan-count">${mistakesText(row.count)}</span></div>
                    <div class="ef-plan-game">${row.game ? escapeHtml(row.game.title) : "No game for this topic yet — try the Java Sandbox"}</div>
                </div>
                ${row.game
                    ? `<button type="button" class="btn btn-secondary ef-plan-btn" data-plan-game="${escapeHtml(row.game.module)}"><i class="fa-solid fa-play" aria-hidden="true"></i> Play</button>`
                    : sandboxBtn("ef-plan-btn")}
            </li>`).join("");

    return card(conceptTheme(first.concept).color, head(first.game ? escapeHtml(first.game.title) : escapeHtml(first.concept)) + `
        <div class="ef-game-body">
            <span class="ef-start-here"><i class="fa-solid fa-star" aria-hidden="true"></i> Start here — strongly recommended</span>
            ${firstBody}
            ${rest.length ? `<div class="ef-plan-next">Then practise</div><ul class="ef-plan-list">${restRows}</ul>` : ""}
        </div>`);
}

// Hands this attempt's result to the learning session (Component 4) and the
// top-misconception record, using the same values the page shows.
function persistAttemptSummary(studentId, attempt, summary, mistakes, labels, store) {
    if (!studentId || summary.wrong.length === 0) return;
    const { quizResults, c2ByQuestion } = attempt;

    if (mistakes.topReason) {
        const item = summary.wrong.find(it => labels.get(it.question_id) === mistakes.topReason);
        const c2 = c2ByQuestion[item.question_id] || {};
        const res = store.peek(item);
        const payload = {
            student_id: studentId,
            concept_name: mistakes.topConcept || mistakes.plan[0]?.concept,
            context_scope: "top_misconception",
            error_type: mistakes.topReason,
            error_reason: c2.explanation?.misconception || c2.explanation?.reason || res?.explanation?.summary_en || "",
        };
        if (typeof c2.error_pattern_score === "number") {
            payload.error_pattern_score = c2.error_pattern_score;
            payload.error_pattern_score_source = c2.error_pattern_score_source;
        }
        SchemaMasteryAPI.saveComponent2(payload)
            .catch(err => console.warn("Failed to persist Component 2 learning session:", err));
    }

    const concept = mistakes.plan[0]?.concept;
    if (concept && BROAD_LABEL_OF_CONCEPT[concept]) {
        ErrorAPI.saveTopMisconception({
            student_id: studentId,
            top_misconception: BROAD_LABEL_OF_CONCEPT[concept],
            concept,
            total_errors: summary.wrong.length,
            topic_breakdown: quizResults.topicBreakdown || summary.byConcept,
            accuracy_pct: quizResults.percent ?? 0,
            source: "error_pattern_detector",
        }).catch(err => console.warn("Failed to persist top misconception:", err));
    }
}

// Console check: Top Misconception concept == first game-plan row, and each question's
// practice game (built by the review panel from the shared store) is its mistake type's game.
function logConsistencyCheck(summary, mistakes, labels, store, c2ByQuestion) {
    const rows = summary.wrong.map(it => {
        const label = labels.get(it.question_id);
        const concept = mistakeConcept(label, it.topic);
        const panelLabel = cardLabelOf(c2ByQuestion[it.question_id], store.peek(it));
        return {
            question: it.question_id, topic: it.topic, mistake_type: label, mistake_concept: concept,
            game: gameForConcept(concept)?.title || "— (Java Sandbox)", panel_card_matches: panelLabel === label,
        };
    });
    const topOk = !mistakes.topConcept || mistakes.plan[0]?.concept === mistakes.topConcept;
    const panelOk = rows.every(r => r.panel_card_matches);
    console.info(`[C2 check] Top Misconception ${mistakes.topReason} → ${mistakes.topConcept}; game plan starts with `
        + `${mistakes.plan[0]?.concept}: ${topOk ? "OK" : "MISMATCH"} · per-question games: ${panelOk ? "OK" : "MISMATCH"}`);
    console.table(rows);
    console.assert(topOk, "[C2 check] Top Misconception concept differs from the first game-plan row");
    console.assert(panelOk, "[C2 check] a question's card label differs from the label used by the game plan");
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
    const scorePct = summary.total > 0 ? Math.round((summary.score / summary.total) * 100) : 0;
    const store = createExplanationStore(studentId, attempt.c2ByQuestion);
    const firstProgress = progressText(0, errors);

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
                ${topStatHtml(errors, null, firstProgress)}
            </div>

            <!-- Pre-Test Review: every question with a per-question explanation (pretest-review.js) -->
            <div id="pretest-review-section"></div>

            <div class="ef-row">
                <div class="ef-card">
                    <h2 class="ef-card-title"><i class="fa-solid fa-chart-bar" aria-hidden="true"></i> Where you made mistakes (this attempt)</h2>
                    ${patternBarsHtml(summary.byConcept, errors)}
                </div>

                <!-- Game plan — link to Component 3 -->
                ${gamePlanHtml(errors, null, firstProgress)}
            </div>
        </div>
    `;

    document.getElementById("open-free-sandbox")?.addEventListener("click", () => openSandbox({ mode: "free" }));
    // The game plan is repainted when the labels arrive, so its buttons are delegated.
    container.querySelector(".ef-row")?.addEventListener("click", (e) => {
        const game = e.target.closest("[data-plan-game]");
        if (game) launchGame(game.dataset.planGame);
        else if (e.target.closest("[data-plan-sandbox]")) openSandbox({ mode: "free" });
        else if (e.target.closest("[data-plan-browse]")) window.location.hash = "#/student/games";
    });

    // Pre-Test Review is independent of the rest of the page; a failure here must not affect it.
    try {
        renderPretestReview(document.getElementById("pretest-review-section"), studentId, attempt, store);
    } catch (err) {
        console.warn("Pre-Test Review failed to render:", err);
    }

    if (errors === 0) return;
    const repaint = (id, html) => {
        const el = document.getElementById(id);
        if (el) el.outerHTML = html;
    };
    const labels = await resolveCardLabels(summary.wrong, store, attempt.c2ByQuestion, (done, total) => {
        const progress = progressText(done, total);
        repaint("ef-top-stat", topStatHtml(errors, null, progress));
        repaint("ef-game-plan", gamePlanHtml(errors, null, progress));
    });
    const mistakes = summarizeMistakes(summary.wrong, labels);
    repaint("ef-top-stat", topStatHtml(errors, mistakes));
    repaint("ef-game-plan", gamePlanHtml(errors, mistakes));
    logConsistencyCheck(summary, mistakes, labels, store, attempt.c2ByQuestion);
    persistAttemptSummary(studentId, attempt, summary, mistakes, labels, store);
}
