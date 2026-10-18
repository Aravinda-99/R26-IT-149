/**
 * Component 2: Pre-Test Review — per-question explanations
 * =========================================================
 * Lists every pre-test question (correct and wrong) from the stored quiz results
 * and, on click, shows a RAG-grounded LLM explanation from POST /api/errors/explain
 * in English, Sinhala or Singlish. Mounted by error-analysis.js.
 */

import { ErrorAPI } from "../api/api.js";
import { parseQuestion } from "../learningPathGen/quizLab.js";

const LANG_KEY = "c2_explanation_lang";
const LANGS = [
    { id: "en", label: "EN" },
    { id: "si", label: "සිංහල" },
    { id: "singlish", label: "Singlish" },
];
const SINHALA_FONT = "'Noto Sans Sinhala', var(--font), sans-serif";

const UI = {
    en: {
        summary: "Summary", where: "Where", why: "Why", fix: "How to fix", correct_code: "Correct code", tip: "Tip",
        your_code: "Your code", expression: "Expression", your_answer: "Your answer", correct_answer: "Correct answer",
        correct: "Correct", wrong: "Wrong", unanswered: "Not answered",
        pick: "Select a question to see why your answer is right or wrong.",
        loading: "Preparing the explanation…", failed: "Could not reach the server. Check your connection and try again.",
        not_answered: "You did not answer this question.", no_code: "This question has no code.",
    },
    si: {
        summary: "සාරාංශය", where: "වැරැද්ද ඇති තැන", why: "ඇයි", fix: "නිවැරදි කරන ආකාරය", correct_code: "නිවැරදි code එක", tip: "ඉඟිය",
        your_code: "ඔබේ code එක", expression: "ප්‍රකාශනය", your_answer: "ඔබේ පිළිතුර", correct_answer: "නිවැරදි පිළිතුර",
        correct: "නිවැරදියි", wrong: "වැරදියි", unanswered: "පිළිතුරු දී නැත",
        pick: "ඔබේ පිළිතුර නිවැරදි හෝ වැරදි ඇයිදැයි බැලීමට ප්‍රශ්නයක් තෝරන්න.",
        loading: "පැහැදිලි කිරීම සූදානම් වෙමින්…", failed: "server එකට සම්බන්ධ විය නොහැක. සම්බන්ධතාවය පරීක්ෂා කර නැවත උත්සාහ කරන්න.",
        not_answered: "ඔබ මෙම ප්‍රශ්නයට පිළිතුරු දී නැත.", no_code: "මෙම ප්‍රශ්නයේ code නැත.",
    },
    singlish: {
        summary: "Summary", where: "Waradda thiyena thana", why: "Ai", fix: "Hadana widiha", correct_code: "Hari code eka", tip: "Tip eka",
        your_code: "Oyage code eka", expression: "Expression eka", your_answer: "Oyage uththaraya", correct_answer: "Hari uththaraya",
        correct: "Hari", wrong: "Waradi", unanswered: "Uththara dela na",
        pick: "Oyage answer eka hari da waradi da kiyala balanna prashnayak select karanna.",
        loading: "Explanation eka hadanawa…", failed: "Server ekata connect wenna bae. Connection eka check karala aye try karanna.",
        not_answered: "Oya me prashnayata uththara dunne na.", no_code: "Me prashnaye code na.",
    },
};

const SOURCE_LABEL = { cache: "AI explanation (cached)", llm: "AI explanation (live)", template: "Standard explanation" };

function readLang() {
    try {
        const v = localStorage.getItem(LANG_KEY);
        return LANGS.some(l => l.id === v) ? v : "en";
    } catch {
        return "en";
    }
}

function saveLang(v) {
    try { localStorage.setItem(LANG_KEY, v); } catch { /* storage blocked: keep in memory only */ }
}

function ensureSinhalaFont() {
    if (document.getElementById("noto-sans-sinhala-font")) return;
    const link = document.createElement("link");
    link.id = "noto-sans-sinhala-font";
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Noto+Sans+Sinhala:wght@400;600;700&display=swap";
    document.head.appendChild(link);
}

function escapeHtml(s) {
    return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// Code with the first occurrence of `where` wrapped in <mark>.
function highlightCode(code, where) {
    const idx = where ? code.indexOf(where) : -1;
    if (idx < 0) return escapeHtml(code);
    return escapeHtml(code.slice(0, idx))
        + `<mark style="background:var(--danger-soft);color:var(--danger);border-radius:3px;padding:0 2px;font-weight:700;">${escapeHtml(where)}</mark>`
        + escapeHtml(code.slice(idx + where.length));
}

function readQuizResults() {
    try {
        const raw = sessionStorage.getItem("quiz-results") || localStorage.getItem("latest_quiz_results");
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function copyText(text) {
    if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
    return new Promise((resolve, reject) => {
        try {
            const ta = document.createElement("textarea");
            ta.value = text;
            ta.style.cssText = "position:fixed;opacity:0;";
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            ta.remove();
            resolve();
        } catch (e) { reject(e); }
    });
}

const codeBlockStyle = "margin:0;padding:0.8rem 1rem;background:var(--bg-subtle);border:1px solid var(--border-color);border-radius:var(--radius-sm);font-family:'JetBrains Mono',Consolas,monospace;font-size:0.82rem;line-height:1.5;white-space:pre-wrap;word-break:break-word;color:var(--text-primary);";
const labelStyle = "font-size:0.68rem;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.6px;margin:0 0 0.3rem 0;";

export function renderPretestReview(root, studentId) {
    if (!root) return;
    const quizResults = readQuizResults();
    if (!quizResults) {
        root.innerHTML = "";
        return;
    }

    // Results saved before questionResults existed only list wrong answers.
    let items = Array.isArray(quizResults.questionResults) ? quizResults.questionResults : null;
    const partial = !items;
    if (!items) {
        items = (quizResults.wrongCodeQuestions || []).filter(w => w.question_id && w.chosenOption != null).map(w => ({
            question_id: w.question_id, topic: w.topic, questionText: w.questionText, chosenOption: w.chosenOption,
            correctOption: null, isCorrect: false, answered: true, code: w.code || "",
        }));
    }
    if (items.length === 0) {
        root.innerHTML = "";
        return;
    }
    // List in data.js order and label rows with the data.js id (the quiz shows a shuffled
    // order), so "Q22" here is question_id 22 in the request and the cache key "22::<option>".
    items = items
        .map(it => ({
            ...it,
            expression: it.code ? null : (it.expression ?? (it.questionText ? parseQuestion(it.questionText).code : null)),
        }))
        .sort((a, b) => (a.question_id ?? 0) - (b.question_id ?? 0));

    // C2 results already computed for wrong answers in quizLab.js (avoid re-running ML).
    const c2ByQuestion = {};
    (quizResults.wrongCodeQuestions || []).forEach(w => {
        if (w.question_id && w.full_response) c2ByQuestion[w.question_id] = w.full_response;
    });

    let lang = readLang();
    let selectedIdx = null;
    let selectionToken = 0;
    const explanations = new Map(); // `${question_id}::${option}` -> response | Promise

    ensureSinhalaFont();
    const nCorrect = items.filter(i => i.isCorrect).length;

    root.innerHTML = `
        <div class="card" style="padding:1.5rem;background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius);">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap;margin-bottom:1rem;padding-bottom:0.8rem;border-bottom:2px solid var(--border-color);">
                <div>
                    <h3 style="margin:0;font-size:1.2rem;font-weight:700;color:var(--text-primary);">Pre-Test Review</h3>
                    <div style="font-size:0.85rem;color:var(--text-secondary);margin-top:0.2rem;">
                        ${partial ? "Showing your wrong answers. Retake the pre-test to review every question." : `${nCorrect} / ${items.length} correct · click a question for a step-by-step explanation`}
                    </div>
                </div>
                <div role="group" aria-label="Explanation language" id="pr-lang" style="display:inline-flex;border:1px solid var(--border-color);border-radius:999px;overflow:hidden;">
                    ${LANGS.map(l => `<button type="button" data-lang="${l.id}" style="border:none;padding:0.45rem 0.9rem;font-size:0.82rem;font-weight:600;cursor:pointer;font-family:${l.id === "si" ? SINHALA_FONT : "var(--font)"};">${l.label}</button>`).join("")}
                </div>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:1.2rem;align-items:flex-start;">
                <div id="pr-list" style="flex:1 1 260px;min-width:0;display:flex;flex-direction:column;gap:0.4rem;max-height:640px;overflow-y:auto;padding-right:0.2rem;"></div>
                <div id="pr-panel" style="flex:2 1 420px;min-width:0;"></div>
            </div>
        </div>
    `;

    const listEl = root.querySelector("#pr-list");
    const panelEl = root.querySelector("#pr-panel");
    const langEl = root.querySelector("#pr-lang");

    const paintLangButtons = () => {
        langEl.querySelectorAll("button").forEach(b => {
            const active = b.dataset.lang === lang;
            b.style.background = active ? "var(--primary)" : "transparent";
            b.style.color = active ? "#fff" : "var(--text-secondary)";
            b.setAttribute("aria-pressed", active ? "true" : "false");
        });
    };

    const keyOf = (item) => `${item.question_id}::${item.chosenOption}`;

    const paintList = () => {
        listEl.innerHTML = items.map((it, idx) => {
            const mark = !it.answered ? "➖" : (it.isCorrect ? "✅" : "❌");
            const sel = idx === selectedIdx;
            return `<button type="button" data-idx="${idx}" style="display:flex;gap:0.6rem;align-items:flex-start;text-align:left;width:100%;padding:0.6rem 0.75rem;border-radius:var(--radius-sm);cursor:pointer;font-family:var(--font);background:${sel ? "var(--primary-soft)" : "var(--bg-card)"};border:1px solid ${sel ? "var(--primary)" : "var(--border-color)"};">
                <span style="flex-shrink:0;font-size:1rem;line-height:1.3;" aria-hidden="true">${mark}</span>
                <span style="min-width:0;">
                    <span style="display:block;font-size:0.68rem;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.4px;">Q${escapeHtml(it.question_id ?? idx + 1)} · ${escapeHtml(it.topic || "")}</span>
                    <span style="display:block;font-size:0.8rem;color:var(--text-primary);line-height:1.35;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">${escapeHtml(it.questionText || "")}</span>
                </span>
            </button>`;
        }).join("");
    };

    const fetchExplanation = (item) => {
        const key = keyOf(item);
        if (explanations.has(key)) return Promise.resolve(explanations.get(key));
        const c2 = c2ByQuestion[item.question_id];
        const payload = {
            student_id: studentId,
            question_id: item.question_id,
            chosen_option: item.chosenOption,
            code: item.code || "",
            is_correct: !!item.isCorrect,
        };
        if (c2 && !item.isCorrect) {
            payload.reason_group = c2.reason_group;
            payload.prediction_confidence = c2.prediction_confidence;
            payload.error_pattern_score = c2.error_pattern_score;
        }
        const p = ErrorAPI.explain(payload).then(res => {
            // The backend returns a template explanation whenever the LLM fails, so any
            // response carrying an explanation is shown.
            if (res && res.explanation) explanations.set(key, res);
            else explanations.delete(key);
            return res;
        }).catch(err => {
            explanations.delete(key);
            throw err;
        });
        explanations.set(key, p);
        return p;
    };

    const textFor = (expl, part) => {
        if (lang !== "en") {
            const v = expl[`${part}_${lang}`];
            if (v) return { text: v, fallback: false };
        }
        return { text: expl[`${part}_en`] || "", fallback: lang !== "en" };
    };

    const renderPanel = (item, res, state) => {
        const t = UI[lang];
        const fontFor = (isLocalised) => (lang === "si" && isLocalised ? SINHALA_FONT : "var(--font)");
        const verdict = !item.answered ? t.unanswered : (item.isCorrect ? t.correct : t.wrong);
        const verdictColor = !item.answered ? "var(--text-secondary)" : (item.isCorrect ? "var(--success)" : "var(--danger)");
        const verdictBg = !item.answered ? "var(--bg-subtle)" : (item.isCorrect ? "var(--success-soft)" : "var(--danger-soft)");
        const correctOption = res?.question?.correct_option || item.correctOption;
        const where = res?.explanation?.where || null;
        const code = item.code || "";
        // Text-only questions: show the expression from the question, else the chosen answer.
        const displayCode = code || item.expression || (item.answered ? String(item.chosenOption ?? "") : "");
        const displayLabel = code ? t.your_code : (item.expression ? t.expression : t.your_answer);

        let body = "";
        if (!item.answered) {
            body = `<p style="margin:0;color:var(--text-secondary);font-family:${fontFor(true)};">${escapeHtml(t.not_answered)}</p>`;
        } else if (state === "loading") {
            body = `<div style="display:flex;align-items:center;gap:0.6rem;color:var(--text-secondary);font-size:0.9rem;"><div class="spinner" style="width:18px;height:18px;margin:0;"></div><span style="font-family:${fontFor(true)};">${escapeHtml(t.loading)}</span></div>`;
        } else if (state === "error" || !res) {
            body = `<p style="margin:0;color:var(--danger);font-family:${fontFor(true)};">${escapeHtml(t.failed)}</p>`;
        } else {
            const e = res.explanation || {};
            let usedFallback = false;
            const section = (part, title) => {
                const { text, fallback } = textFor(e, part);
                if (!text) return "";
                usedFallback = usedFallback || fallback;
                return `<div style="margin-bottom:0.9rem;">
                    <div style="${labelStyle}font-family:${fontFor(true)};">${escapeHtml(title)}</div>
                    <p style="margin:0;font-size:0.93rem;line-height:1.65;color:var(--text-primary);font-family:${fontFor(!fallback)};">${escapeHtml(text)}</p>
                </div>`;
            };
            const summaryHtml = section("summary", t.summary);
            const whyHtml = section("why", t.why);
            const fixHtml = item.isCorrect ? "" : section("fix", t.fix);
            const tipHtml = section("tip", t.tip);
            const whereHtml = where && !item.isCorrect ? `<div style="margin-bottom:0.9rem;">
                    <div style="${labelStyle}font-family:${fontFor(true)};">${escapeHtml(t.where)}</div>
                    <code style="font-family:'JetBrains Mono',Consolas,monospace;background:var(--danger-soft);color:var(--danger);padding:0.15rem 0.45rem;border-radius:4px;font-size:0.85rem;">${escapeHtml(where)}</code>
                </div>` : "";
            const correctCodeHtml = !item.isCorrect && e.correct_code ? `<div style="margin-bottom:0.9rem;">
                    <div style="${labelStyle}font-family:${fontFor(true)};">${escapeHtml(t.correct_code)}</div>
                    <pre style="${codeBlockStyle}border-left:3px solid var(--success);">${escapeHtml(e.correct_code)}</pre>
                </div>` : "";
            const fallbackNote = usedFallback
                ? `<div style="font-size:0.78rem;color:var(--text-secondary);background:var(--bg-subtle);padding:0.5rem 0.7rem;border-radius:var(--radius-sm);margin-bottom:0.9rem;">${lang === "si" ? "Sinhala" : "Singlish"} text is not available for this answer, so it is shown in English.</div>`
                : "";
            const labelInfo = res.final_reason_group && !item.isCorrect
                ? ` · ${escapeHtml(res.final_reason_group.replace(/_/g, " ").toLowerCase())}${res.label_source === "llm_verified" ? " (AI-verified label)" : ""}`
                : "";
            body = `${fallbackNote}${summaryHtml}${whereHtml}${whyHtml}${fixHtml}${correctCodeHtml}${tipHtml}
                <div style="font-size:0.72rem;color:var(--text-muted);margin-top:0.4rem;">${escapeHtml(SOURCE_LABEL[res.source] || res.source || "")}${labelInfo}</div>`;
        }

        panelEl.innerHTML = `
            <div style="border:1px solid var(--border-color);border-radius:var(--radius);padding:1.2rem 1.3rem;background:var(--bg-card);">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.8rem;flex-wrap:wrap;margin-bottom:0.9rem;">
                    <div style="min-width:0;flex:1;">
                        <div style="font-size:0.7rem;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px;">Q${escapeHtml(item.question_id ?? selectedIdx + 1)} · ${escapeHtml(item.topic || "")}</div>
                        <div style="font-size:1rem;font-weight:600;color:var(--text-primary);line-height:1.45;margin-top:0.2rem;">${escapeHtml(item.questionText || "")}</div>
                    </div>
                    <span style="flex-shrink:0;padding:0.3rem 0.75rem;border-radius:999px;font-size:0.8rem;font-weight:700;background:${verdictBg};color:${verdictColor};font-family:${fontFor(true)};">${item.isCorrect ? "✅" : (item.answered ? "❌" : "➖")} ${escapeHtml(verdict)}</span>
                </div>
                <div style="display:flex;gap:1.2rem;flex-wrap:wrap;font-size:0.85rem;color:var(--text-secondary);margin-bottom:0.9rem;">
                    <span style="font-family:${fontFor(true)};">${escapeHtml(t.your_answer)}: <strong style="color:var(--text-primary);font-family:'JetBrains Mono',Consolas,monospace;">${escapeHtml(item.chosenOption ?? "—")}</strong></span>
                    ${correctOption && !item.isCorrect ? `<span style="font-family:${fontFor(true)};">${escapeHtml(t.correct_answer)}: <strong style="color:var(--success);font-family:'JetBrains Mono',Consolas,monospace;">${escapeHtml(correctOption)}</strong></span>` : ""}
                </div>
                ${displayCode ? `<div style="margin-bottom:1rem;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.3rem;">
                        <div style="${labelStyle}margin:0;font-family:${fontFor(true)};">${escapeHtml(displayLabel)}</div>
                        <button type="button" id="pr-copy" class="btn btn-secondary" style="margin:0;padding:0.25rem 0.7rem;font-size:0.75rem;"><i class="fa-regular fa-copy"></i> Copy</button>
                    </div>
                    <pre style="${codeBlockStyle}">${highlightCode(displayCode, item.isCorrect || !code ? null : where)}</pre>
                </div>` : ""}
                ${body}
                <div style="display:flex;justify-content:flex-end;margin-top:1rem;padding-top:0.8rem;border-top:1px solid var(--border-color);">
                    <button type="button" class="btn btn-secondary" disabled title="The code sandbox is coming soon" style="margin:0;opacity:0.55;cursor:not-allowed;font-size:0.82rem;">
                        <i class="fa-solid fa-flask"></i> Open in Sandbox
                    </button>
                </div>
            </div>
        `;

        const copyBtn = panelEl.querySelector("#pr-copy");
        if (copyBtn) {
            copyBtn.addEventListener("click", () => {
                copyText(displayCode).then(() => {
                    copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied';
                    setTimeout(() => { copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy'; }, 1500);
                }).catch(() => { copyBtn.textContent = "Copy failed"; });
            });
        }
    };

    const showItem = (idx) => {
        selectedIdx = idx;
        paintList();
        const item = items[idx];
        const token = ++selectionToken;
        if (!item.answered) {
            renderPanel(item, null, "done");
            return;
        }
        const cached = explanations.get(keyOf(item));
        if (cached && !(cached instanceof Promise)) {
            renderPanel(item, cached, "done");
            return;
        }
        renderPanel(item, null, "loading");
        fetchExplanation(item)
            .then(res => { if (token === selectionToken) renderPanel(item, res, res?.explanation ? "done" : "error"); })
            .catch(() => { if (token === selectionToken) renderPanel(item, null, "error"); });
    };

    listEl.addEventListener("click", (ev) => {
        const btn = ev.target.closest("button[data-idx]");
        if (btn) showItem(Number(btn.dataset.idx));
    });

    langEl.addEventListener("click", (ev) => {
        const btn = ev.target.closest("button[data-lang]");
        if (!btn || btn.dataset.lang === lang) return;
        lang = btn.dataset.lang;
        saveLang(lang);
        paintLangButtons();
        if (selectedIdx !== null) showItem(selectedIdx);
        else panelEl.innerHTML = placeholder();
    });

    const placeholder = () => `<div style="border:1px dashed var(--border-color);border-radius:var(--radius);padding:2.5rem 1.5rem;text-align:center;color:var(--text-secondary);font-size:0.9rem;font-family:${lang === "si" ? SINHALA_FONT : "var(--font)"};">${escapeHtml(UI[lang].pick)}</div>`;

    paintLangButtons();
    paintList();
    panelEl.innerHTML = placeholder();
}
