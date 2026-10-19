/**
 * Component 2: Java Sandbox (modal)
 * =================================
 * Edit and run Java on the backend code runner (POST /api/errors/run) and, for a
 * pre-test question, run its execution-validated test cases (POST /api/errors/run-tests).
 * Free mode adds "Analyze with AI": live Model 3 (POST /api/errors/analyze, persist=false,
 * no answer key) and a live LLM explanation (POST /api/errors/explain, mode "free").
 *
 *   openSandbox({ mode: "question", questionId, questionText, topic, code, codeTemplate,
 *                 answered, isCorrect, chosenOption, lang })
 *   openSandbox({ mode: "free" })   // any Java code: Run + Analyze with AI
 */

import { ErrorAPI } from "../api/api.js";
import { aiDetectorCardHtml, whyHeadingHtml, explanationBodyHtml } from "./pretest-review.js";

const LANG_KEY = "c2_explanation_lang";
const SINHALA_FONT = "'Noto Sans Sinhala', var(--font), sans-serif";
const MONO = "'JetBrains Mono', Consolas, 'Courier New', monospace";

const T = {
    en: {
        tests: "Test cases", expected: "Expected", actual: "Actual", input: "Input", passed: "passed",
        all_passed: "All tests passed!", not_run: "Not run yet", no_tests: "No test cases for this question yet.",
        loading_tests: "Loading test cases…",
    },
    si: {
        tests: "පරීක්ෂණ", expected: "බලාපොරොත්තු වූ output", actual: "ලැබුණු output", input: "Input", passed: "සාර්ථකයි",
        all_passed: "සියලු පරීක්ෂණ සාර්ථකයි!", not_run: "තවම ධාවනය කර නැත", no_tests: "මෙම ප්‍රශ්නයට තවම පරීක්ෂණ නැත.",
        loading_tests: "පරීක්ෂණ පූරණය වෙමින්…",
    },
    singlish: {
        tests: "Test cases", expected: "Expected output eka", actual: "Labuna output eka", input: "Input", passed: "pass",
        all_passed: "Okkoma tests pass!", not_run: "Thama run karala na", no_tests: "Me prashnayata thama tests na.",
        loading_tests: "Tests load wenawa…",
    },
};

function readLang() {
    try {
        const v = localStorage.getItem(LANG_KEY);
        return T[v] ? v : "en";
    } catch {
        return "en";
    }
}

function escapeHtml(s) {
    return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/**
 * Pre-test answers are one-line snippets. Break them into lines at `{`, `}` and `;`
 * (outside strings and parentheses) and indent, so line numbers are meaningful.
 * Multi-line code is returned unchanged.
 */
export function formatJava(code) {
    if (!code || code.includes("\n")) return code || "";
    const lines = [];
    let cur = "", depth = 0, paren = 0, quote = null;
    const push = () => {
        const t = cur.trim();
        if (t) lines.push("    ".repeat(Math.max(depth, 0)) + t);
        cur = "";
    };
    for (let i = 0; i < code.length; i++) {
        const ch = code[i];
        if (quote) {
            cur += ch;
            if (ch === "\\" && i + 1 < code.length) { cur += code[++i]; continue; }
            if (ch === quote) quote = null;
            continue;
        }
        if (ch === '"' || ch === "'") { quote = ch; cur += ch; continue; }
        if (ch === "(") paren++;
        if (ch === ")") paren = Math.max(0, paren - 1);
        if (paren === 0 && ch === "{") { cur += "{"; push(); depth++; continue; }
        if (paren === 0 && ch === "}") { push(); depth--; cur = "}";
            // keep "} while (...);" / "} else {" on the closing-brace line
            const rest = code.slice(i + 1).trimStart();
            if (!/^(while|else|catch|finally)\b/.test(rest)) push();
            continue;
        }
        if (paren === 0 && ch === ";") { cur += ";"; push(); continue; }
        cur += ch;
    }
    push();
    return lines.join("\n");
}

function ensureStyles() {
    if (document.getElementById("c2-sandbox-style")) return;
    const style = document.createElement("style");
    style.id = "c2-sandbox-style";
    style.textContent = `
        .c2sb-btn { display:inline-flex; align-items:center; gap:0.4rem; border-radius:var(--radius-sm); padding:0.5rem 0.95rem;
            font-family:var(--font); font-size:0.85rem; font-weight:600; cursor:pointer; border:1px solid var(--border-color);
            background:var(--bg-card); color:var(--text-primary); }
        .c2sb-btn:hover:not(:disabled) { background:var(--bg-subtle); }
        .c2sb-btn:disabled { opacity:0.55; cursor:not-allowed; }
        .c2sb-btn.primary { background:var(--primary); border-color:var(--primary); color:#fff; }
        .c2sb-btn.primary:hover:not(:disabled) { background:var(--primary-hover, var(--primary)); }
        .c2sb-btn.success { background:var(--success); border-color:var(--success); color:#fff; }
        .c2sb-btn.ai { background:var(--accent-purple); border-color:var(--accent-purple); color:#fff; }
        .c2sb-answer { display:inline-flex; align-items:center; gap:0.4rem; margin-top:0.45rem; padding:0.2rem 0.65rem;
            border-radius:999px; font-size:0.78rem; font-weight:700; color:var(--text-primary);
            background:color-mix(in srgb, var(--c) 10%, var(--bg-card)); border:1px solid color-mix(in srgb, var(--c) 40%, var(--bg-card)); }
        .c2sb-answer i { color:var(--c); }
        .c2sb-btn:focus-visible, .c2sb-editor:focus-visible { outline:2px solid var(--primary); outline-offset:2px; }
        .c2sb-confetti { position:absolute; top:-12px; width:8px; height:12px; border-radius:2px; pointer-events:none;
            animation: c2sb-fall 2.2s ease-in forwards; }
        @keyframes c2sb-fall { to { transform: translateY(520px) rotate(540deg); opacity:0; } }
        .c2sb-badge { animation: c2sb-pop 0.45s ease-out; }
        @keyframes c2sb-pop { 0% { transform:scale(0.6); opacity:0; } 70% { transform:scale(1.08); } 100% { transform:scale(1); opacity:1; } }
        @media (prefers-reduced-motion: reduce) { .c2sb-confetti { display:none; } .c2sb-badge { animation:none; } }
    `;
    document.head.appendChild(style);
}

export function openSandbox(opts = {}) {
    ensureStyles();
    const mode = opts.mode === "question" ? "question" : "free";
    const lang = opts.lang && T[opts.lang] ? opts.lang : readLang();
    const t = T[lang];
    const localFont = lang === "si" ? SINHALA_FONT : "var(--font)";
    const opener = document.activeElement;

    // opts.code is the question's template filled with the student's chosen option (quizLab.js
    // buildFullCodeFromTemplate), so the editor opens on exactly the answer they gave.
    let resetCode = formatJava(opts.code || (opts.codeTemplate ? opts.codeTemplate.replace("{BLANK}", "/* your answer */") : ""));
    let spec = null;
    let busy = false;

    let answerChip = "";
    if (mode === "question" && opts.answered === false) {
        answerChip = `<div class="c2sb-answer" style="--c:var(--text-muted);"><i class="fa-solid fa-minus" aria-hidden="true"></i>You did not answer this question</div>`;
    } else if (mode === "question" && opts.chosenOption != null) {
        const ok = !!opts.isCorrect;
        answerChip = `<div class="c2sb-answer" style="--c:${ok ? "var(--success)" : "var(--danger)"};">
            <i class="fa-solid ${ok ? "fa-circle-check" : "fa-circle-xmark"}" aria-hidden="true"></i>Your answer (${ok ? "correct" : "wrong"}):
            <code style="font-family:${MONO};">${escapeHtml(opts.chosenOption)}</code>${opts.code ? " · prefilled in the editor" : ""}</div>`;
    }

    const overlay = document.createElement("div");
    overlay.style.cssText = "position:fixed;inset:0;z-index:1400;background:rgba(15,23,42,0.55);display:flex;align-items:flex-start;justify-content:center;padding:2rem 1rem;overflow-y:auto;";
    overlay.innerHTML = `
        <div role="dialog" aria-modal="true" aria-labelledby="c2sb-title" id="c2sb-dialog"
             style="position:relative;overflow:hidden;width:100%;max-width:1150px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius);box-shadow:var(--shadow-lg);">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;padding:1rem 1.3rem;border-bottom:1px solid var(--border-color);">
                <div style="min-width:0;">
                    <h3 id="c2sb-title" style="margin:0;font-size:1.1rem;font-weight:700;color:var(--text-primary);"><i class="fa-solid fa-flask"></i> Java Sandbox</h3>
                    <div style="font-size:0.82rem;color:var(--text-secondary);margin-top:0.2rem;">
                        ${mode === "question" ? `Q${escapeHtml(opts.questionId)} · ${escapeHtml(opts.topic || "")} · ${escapeHtml(opts.questionText || "")}` : "Write any Java code: statements, methods or a full class with main()."}
                    </div>
                    ${answerChip}
                    <div id="c2sb-prefill-note" style="font-size:0.78rem;color:var(--text-secondary);margin-top:0.3rem;"></div>
                </div>
                <button type="button" class="c2sb-btn" id="c2sb-close" aria-label="Close sandbox"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:1.2rem;padding:1.2rem 1.3rem;">
                <div style="flex:3 1 520px;min-width:0;display:flex;flex-direction:column;gap:0.8rem;">
                    <div style="display:flex;border:1px solid var(--border-color);border-radius:var(--radius-sm);background:var(--bg-subtle);height:300px;overflow:hidden;">
                        <pre id="c2sb-gutter" aria-hidden="true" style="margin:0;padding:0.75rem 0.5rem;min-width:2.6rem;text-align:right;color:var(--text-muted);font-family:${MONO};font-size:0.85rem;line-height:1.5;overflow:hidden;user-select:none;border-right:1px solid var(--border-color);background:var(--bg-card);"></pre>
                        <textarea id="c2sb-code" class="c2sb-editor" aria-label="Java code editor" spellcheck="false" autocapitalize="off" autocomplete="off" wrap="off"
                            style="flex:1;min-width:0;margin:0;border:none;resize:none;padding:0.75rem;font-family:${MONO};font-size:0.85rem;line-height:1.5;background:transparent;color:var(--text-primary);white-space:pre;overflow:auto;tab-size:4;"></textarea>
                    </div>
                    <details id="c2sb-stdin-box">
                        <summary style="cursor:pointer;font-size:0.82rem;color:var(--text-secondary);font-weight:600;">Input (stdin) for Run</summary>
                        <textarea id="c2sb-stdin" aria-label="Program input" rows="3" spellcheck="false"
                            style="width:100%;box-sizing:border-box;margin-top:0.4rem;border:1px solid var(--border-color);border-radius:var(--radius-sm);padding:0.5rem;font-family:${MONO};font-size:0.82rem;background:var(--bg-card);color:var(--text-primary);"></textarea>
                    </details>
                    <div style="display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center;">
                        <button type="button" class="c2sb-btn primary" id="c2sb-run" title="Ctrl+Enter"><i class="fa-solid fa-play"></i> Run</button>
                        ${mode === "question" ? `<button type="button" class="c2sb-btn success" id="c2sb-tests" disabled><i class="fa-solid fa-list-check"></i> Run Tests</button>`
                            : `<button type="button" class="c2sb-btn ai" id="c2sb-analyze"><span aria-hidden="true">🔍</span> Analyze with AI</button>`}
                        <button type="button" class="c2sb-btn" id="c2sb-reset"><i class="fa-solid fa-rotate-left"></i> ${mode === "question" ? "Reset to my answer" : "Clear"}</button>
                        <button type="button" class="c2sb-btn" id="c2sb-copy"><i class="fa-regular fa-copy"></i> Copy</button>
                        <span style="font-size:0.75rem;color:var(--text-muted);">Ctrl+Enter to run · Tab inserts spaces · Esc closes</span>
                    </div>
                    <div id="c2sb-output" aria-live="polite" style="border:1px solid var(--border-color);border-radius:var(--radius-sm);padding:0.8rem 1rem;min-height:90px;background:var(--bg-card);">
                        <div style="font-size:0.85rem;color:var(--text-secondary);">Press <strong>Run</strong> to compile and run your code.</div>
                    </div>
                </div>
                ${mode === "question" ? `
                <div style="flex:2 1 300px;min-width:0;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.6rem;">
                        <h4 style="margin:0;font-size:0.95rem;color:var(--text-primary);font-family:${localFont};">${escapeHtml(t.tests)}</h4>
                        <span id="c2sb-score" style="font-size:0.8rem;color:var(--text-secondary);"></span>
                    </div>
                    <div id="c2sb-badge"></div>
                    <div id="c2sb-tests-list" style="display:flex;flex-direction:column;gap:0.5rem;max-height:520px;overflow-y:auto;">
                        <div style="font-size:0.85rem;color:var(--text-secondary);font-family:${localFont};">${escapeHtml(t.loading_tests)}</div>
                    </div>
                </div>` : `
                <div style="flex:2 1 300px;min-width:0;">
                    <h4 style="margin:0 0 0.6rem;font-size:0.95rem;color:var(--text-primary);"><i class="fa-solid fa-robot" style="color:var(--primary);"></i> AI Error Detector</h4>
                    <div id="c2sb-ai" aria-live="polite" style="max-height:560px;overflow-y:auto;">
                        <div style="font-size:0.85rem;color:var(--text-secondary);line-height:1.5;">
                            Press <strong>🔍 Analyze with AI</strong>: Model 3 checks this code live (no answer key), then the AI tutor (LLM) explains what it found. Nothing is saved to your history.
                        </div>
                    </div>
                </div>`}
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    const $ = (sel) => overlay.querySelector(sel);
    const editor = $("#c2sb-code");
    const gutter = $("#c2sb-gutter");
    const output = $("#c2sb-output");
    const runBtn = $("#c2sb-run");
    const testsBtn = $("#c2sb-tests");
    const analyzeBtn = $("#c2sb-analyze");

    const refreshGutter = () => {
        const n = Math.max(1, editor.value.split("\n").length);
        gutter.textContent = Array.from({ length: n }, (_, i) => i + 1).join("\n");
        gutter.scrollTop = editor.scrollTop;
    };
    const setCode = (code) => { editor.value = code; refreshGutter(); };
    setCode(resetCode);

    const close = () => {
        document.removeEventListener("keydown", onKey, true);
        overlay.remove();
        if (opener && typeof opener.focus === "function") opener.focus();
    };
    const onKey = (e) => {
        if (e.key === "Escape") { e.preventDefault(); close(); }
    };
    document.addEventListener("keydown", onKey, true);
    $("#c2sb-close").addEventListener("click", close);
    overlay.addEventListener("mousedown", (e) => { if (e.target === overlay) close(); });

    editor.addEventListener("input", refreshGutter);
    editor.addEventListener("scroll", () => { gutter.scrollTop = editor.scrollTop; });
    editor.addEventListener("keydown", (e) => {
        if (e.key === "Tab" && !e.shiftKey && !e.ctrlKey && !e.altKey) {
            e.preventDefault();
            const s = editor.selectionStart, end = editor.selectionEnd;
            editor.setRangeText("    ", s, end, "end");
            refreshGutter();
        } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            doRun();
        }
    });

    const goToLine = (line) => {
        const lines = editor.value.split("\n");
        if (!line || line > lines.length) return;
        const start = lines.slice(0, line - 1).reduce((a, l) => a + l.length + 1, 0);
        editor.focus();
        editor.setSelectionRange(start, start + lines[line - 1].length);
        const lh = parseFloat(getComputedStyle(editor).lineHeight) || 20;
        editor.scrollTop = Math.max(0, (line - 3) * lh);
    };

    const spinnerHtml = (label) => `<div style="display:flex;align-items:center;gap:0.6rem;color:var(--text-secondary);font-size:0.88rem;"><div class="spinner" style="width:18px;height:18px;margin:0;"></div>${escapeHtml(label)}</div>`;
    const setBusy = (v, label, target = output) => {
        busy = v;
        runBtn.disabled = v;
        if (testsBtn) testsBtn.disabled = v || !spec?.available;
        if (analyzeBtn) analyzeBtn.disabled = v;
        if (v) target.innerHTML = spinnerHtml(label);
    };

    const compileErrorsHtml = (errors) => `
        <div style="font-weight:700;color:var(--danger);font-size:0.9rem;margin-bottom:0.5rem;">❌ Compile error${errors.length > 1 ? "s" : ""} (${errors.length})</div>
        ${errors.map(e => `
            <div style="border-left:3px solid var(--danger);background:var(--danger-soft);border-radius:4px;padding:0.5rem 0.7rem;margin-bottom:0.45rem;">
                <div style="font-size:0.86rem;color:var(--text-primary);">
                    ${e.line ? `<button type="button" class="c2sb-goto" data-line="${e.line}" style="border:none;background:none;padding:0;color:var(--danger);font-weight:700;cursor:pointer;text-decoration:underline;font-family:var(--font);">Line ${e.line}${e.column ? `:${e.column}` : ""}</button> · ` : ""}${escapeHtml(e.message)}
                </div>
                ${e.code_line ? `<pre style="margin:0.3rem 0 0;font-family:${MONO};font-size:0.8rem;white-space:pre-wrap;color:var(--text-primary);">${escapeHtml(e.code_line.trim())}</pre>` : ""}
                <div style="font-size:0.78rem;color:var(--text-secondary);margin-top:0.25rem;">💡 ${escapeHtml(e.hint || "")}</div>
            </div>`).join("")}`;

    const runtimeErrorHtml = (err) => !err ? "" : `
        <div style="border-left:3px solid var(--warning);background:var(--warning-soft);border-radius:4px;padding:0.5rem 0.7rem;margin-bottom:0.6rem;">
            <div style="font-weight:700;font-size:0.88rem;color:var(--text-primary);">⚠️ ${escapeHtml(err.type)}${err.line ? ` · <button type="button" class="c2sb-goto" data-line="${err.line}" style="border:none;background:none;padding:0;color:var(--warning);font-weight:700;cursor:pointer;text-decoration:underline;font-family:var(--font);">line ${err.line}</button>` : ""}</div>
            ${err.message ? `<div style="font-size:0.84rem;color:var(--text-primary);margin-top:0.2rem;">${escapeHtml(err.message)}</div>` : ""}
            <div style="font-size:0.78rem;color:var(--text-secondary);margin-top:0.25rem;">💡 ${escapeHtml(err.hint || "")}</div>
        </div>`;

    const wireGoto = () => output.querySelectorAll(".c2sb-goto").forEach(b => b.addEventListener("click", () => goToLine(Number(b.dataset.line))));

    const renderRun = (res) => {
        if (!res.compiled) {
            output.innerHTML = compileErrorsHtml(res.compile_errors || []);
        } else {
            const ok = !res.runtime_error;
            output.innerHTML = `
                <div style="font-weight:700;font-size:0.9rem;margin-bottom:0.5rem;color:${ok ? "var(--success)" : "var(--warning)"};">${ok ? "✅ Ran successfully" : "Program stopped with an error"}</div>
                ${runtimeErrorHtml(res.runtime_error)}
                <div style="font-size:0.7rem;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:0.25rem;">Output</div>
                <pre style="margin:0;padding:0.6rem 0.8rem;background:var(--bg-subtle);border-radius:4px;font-family:${MONO};font-size:0.82rem;white-space:pre-wrap;word-break:break-word;max-height:240px;overflow:auto;color:var(--text-primary);">${res.stdout ? escapeHtml(res.stdout) : '<span style="color:var(--text-muted);">(no output)</span>'}</pre>
                <div style="font-size:0.72rem;color:var(--text-muted);margin-top:0.35rem;">${res.output_truncated ? "Output was cut at 10 KB. " : ""}Compiled in ${res.compile_time_ms ?? "?"} ms · ran in ${res.run_time_ms ?? "?"} ms</div>
                ${ok && spec?.available ? `<div style="margin-top:0.6rem;padding:0.5rem 0.7rem;border-radius:var(--radius-sm);background:var(--primary-soft);font-size:0.85rem;color:var(--text-primary);">Program ran ✓ — but is the result right? Click <strong>Run Tests</strong> to check.</div>` : ""}`;
        }
        wireGoto();
    };

    const renderError = (err) => {
        output.innerHTML = `<div style="color:var(--danger);font-size:0.88rem;">${escapeHtml(err?.message || "Could not reach the server.")}</div>`;
    };

    async function doRun() {
        if (busy) return;
        setBusy(true, "Compiling and running…");
        try {
            const res = await ErrorAPI.runCode({ code: editor.value, stdin: $("#c2sb-stdin").value });
            renderRun(res);
        } catch (err) {
            renderError(err);
        } finally {
            setBusy(false);
        }
    }

    const testDesc = (tc) => tc[`description_${lang}`] || tc.description_en || "";
    const renderTests = (results) => {
        const list = $("#c2sb-tests-list");
        if (!list) return;
        if (!spec?.available) {
            list.innerHTML = `<div style="font-size:0.85rem;color:var(--text-secondary);font-family:${localFont};">${escapeHtml(t.no_tests)}</div>`;
            return;
        }
        const byName = Object.fromEntries((results || []).map(r => [r.name, r]));
        list.innerHTML = spec.tests.map(tc => {
            const r = byName[tc.name];
            const notRun = r?.status === "not_run";
            const icon = !r || notRun ? "⚪" : (r.passed ? "✅" : "❌");
            const borderColor = !r || notRun ? "var(--border-color)" : (r.passed ? "var(--success)" : "var(--danger)");
            const descLocal = !!tc[`description_${lang}`];
            return `<div style="border:1px solid ${borderColor};border-radius:var(--radius-sm);padding:0.55rem 0.7rem;background:var(--bg-card);opacity:${notRun ? "0.65" : "1"};">
                <div style="display:flex;gap:0.5rem;align-items:flex-start;">
                    <span aria-hidden="true">${icon}</span>
                    <div style="min-width:0;flex:1;">
                        <div style="font-size:0.85rem;font-weight:700;color:var(--text-primary);">${escapeHtml(tc.name)}${notRun ? ` <span style="font-size:0.75rem;font-weight:600;color:var(--text-muted);font-family:${localFont};">(${escapeHtml(t.not_run)})</span>` : ""}<span class="sr-only" style="position:absolute;left:-9999px;">${r ? (notRun ? " not run" : r.passed ? " passed" : " failed") : " not run"}</span></div>
                        <div style="font-size:0.8rem;color:var(--text-secondary);line-height:1.45;margin-top:0.15rem;font-family:${descLocal ? localFont : "var(--font)"};">${escapeHtml(testDesc(tc))}</div>
                        ${r && !r.passed && !notRun ? `
                            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.4rem;margin-top:0.45rem;">
                                <div><div style="font-size:0.68rem;font-weight:700;color:var(--text-secondary);font-family:${localFont};">${escapeHtml(t.expected)}</div>
                                    <pre style="margin:0;padding:0.35rem 0.5rem;background:var(--success-soft);border-radius:4px;font-family:${MONO};font-size:0.75rem;white-space:pre-wrap;word-break:break-word;color:var(--text-primary);">${escapeHtml(r.expected)}</pre></div>
                                <div><div style="font-size:0.68rem;font-weight:700;color:var(--text-secondary);font-family:${localFont};">${escapeHtml(t.actual)}</div>
                                    <pre style="margin:0;padding:0.35rem 0.5rem;background:var(--danger-soft);border-radius:4px;font-family:${MONO};font-size:0.75rem;white-space:pre-wrap;word-break:break-word;color:var(--text-primary);">${r.actual == null ? "—" : escapeHtml(r.actual) || "(no output)"}</pre></div>
                            </div>
                            ${r.error ? `<div style="font-size:0.75rem;color:var(--danger);margin-top:0.3rem;">${escapeHtml(r.error.type || "")}${r.error.message ? ": " + escapeHtml(r.error.message) : ""}</div>` : ""}` : ""}
                    </div>
                </div>
            </div>`;
        }).join("");
        const score = $("#c2sb-score");
        if (score) {
            const allNotRun = results && results.length > 0 && results.every(r => r.status === "not_run");
            score.textContent = results ? (allNotRun ? t.not_run : `${results.filter(r => r.passed).length} / ${results.length} ${t.passed}`) : "";
        }
    };

    const celebrate = () => {
        const badge = $("#c2sb-badge");
        if (badge) {
            badge.innerHTML = `<div class="c2sb-badge" style="display:flex;align-items:center;gap:0.5rem;background:var(--success-soft);color:var(--success);border:1px solid var(--success);border-radius:999px;padding:0.4rem 0.9rem;font-weight:700;font-size:0.88rem;margin-bottom:0.6rem;font-family:${localFont};">🏆 ${escapeHtml(t.all_passed)}</div>`;
        }
        const dialog = $("#c2sb-dialog");
        const colors = ["#f59e0b", "#10b981", "#3b82f6", "#ec4899", "#8b5cf6", "#ef4444"];
        for (let i = 0; i < 36; i++) {
            const p = document.createElement("span");
            p.className = "c2sb-confetti";
            p.style.left = `${Math.random() * 100}%`;
            p.style.background = colors[i % colors.length];
            p.style.animationDelay = `${Math.random() * 0.4}s`;
            dialog.appendChild(p);
            setTimeout(() => p.remove(), 2800);
        }
    };

    async function doTests() {
        if (busy || !spec?.available) return;
        setBusy(true, "Running the test cases…");
        $("#c2sb-badge").innerHTML = "";
        try {
            const res = await ErrorAPI.runTests({ question_id: opts.questionId, code: editor.value });
            renderTests(res.tests);
            if (!res.compiled) {
                const errs = res.compile_errors || [];
                const primaryMsg = errs[0]?.message || "Your code did not compile.";
                const lineInfo = errs[0]?.line ? ` (line ${errs[0].line})` : "";
                output.innerHTML = `<div style="padding:0.7rem 0.9rem;background:var(--danger-soft);border:1px solid var(--danger);border-radius:var(--radius-sm);margin-bottom:0.5rem;">
                    <div style="font-weight:700;font-size:0.9rem;color:var(--danger);">Fix the compile error first — tests were not run yet</div>
                    <div style="font-size:0.82rem;color:var(--text-primary);margin-top:0.3rem;font-family:${MONO};">${escapeHtml(primaryMsg)}${escapeHtml(lineInfo)}</div>
                </div>` + compileErrorsHtml(errs);
                wireGoto();
            } else {
                output.innerHTML = `<div style="font-weight:700;font-size:0.9rem;color:${res.all_passed ? "var(--success)" : "var(--danger)"};">${res.all_passed ? "✅" : "❌"} ${res.passed_count} / ${res.total} tests passed</div>
                    <div style="font-size:0.78rem;color:var(--text-secondary);margin-top:0.3rem;">See the test list for expected vs actual output.</div>`;
            }
            if (res.all_passed) celebrate();
        } catch (err) {
            renderError(err);
        } finally {
            setBusy(false);
        }
    }

    // Free code: live Model 3 (no answer key, nothing saved) -> live LLM explanation of that label.
    async function doAnalyze() {
        const panel = $("#c2sb-ai");
        if (busy || !panel) return;
        const code = editor.value;
        if (!code.trim()) {
            panel.innerHTML = `<div style="font-size:0.85rem;color:var(--text-secondary);">Write some Java code first.</div>`;
            return;
        }
        setBusy(true, "Model 3 is checking your code…", panel);
        try {
            const a = await ErrorAPI.analyze({ code, persist: false });
            if (!a?.success) {
                panel.innerHTML = aiDetectorCardHtml({ emptyMessage: a?.message || "Model 3 could not analyse this code." });
                return;
            }
            panel.innerHTML = spinnerHtml("The AI tutor (LLM) is explaining what Model 3 found…");
            const e = await ErrorAPI.explain({
                mode: "free", code,
                reason_group: a.reason_group,
                prediction_confidence: a.prediction_confidence,
                error_pattern_score: a.error_pattern_score,
            });
            const card = aiDetectorCardHtml({
                model3: a.reason_group, conf: a.prediction_confidence, version: a.model_version,
                llmFinal: e?.label_source === "llm_verified" ? e.final_reason_group : null,
            });
            const explanation = e?.explanation
                ? whyHeadingHtml(e, lang) + explanationBodyHtml(e.explanation, lang, !!e.is_correct)
                : `<div style="font-size:0.85rem;color:var(--danger);">Could not get an explanation. Try again.</div>`;
            panel.innerHTML = `${card}${explanation}
                <div style="font-size:0.72rem;color:var(--text-muted);margin-top:0.6rem;">Live analysis of this exact code · nothing is saved to your history.</div>`;
        } catch (err) {
            panel.innerHTML = `<div style="color:var(--danger);font-size:0.88rem;">${escapeHtml(err?.message || "Could not reach the server.")}</div>`;
        } finally {
            setBusy(false);
        }
    }

    runBtn.addEventListener("click", doRun);
    if (testsBtn) testsBtn.addEventListener("click", doTests);
    if (analyzeBtn) analyzeBtn.addEventListener("click", doAnalyze);
    $("#c2sb-reset").addEventListener("click", () => {
        setCode(resetCode);
        editor.focus();
    });
    $("#c2sb-copy").addEventListener("click", () => {
        const btn = $("#c2sb-copy");
        const done = (ok) => {
            btn.innerHTML = ok ? '<i class="fa-solid fa-check"></i> Copied' : "Copy failed";
            setTimeout(() => { btn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy'; }, 1500);
        };
        if (navigator.clipboard?.writeText) navigator.clipboard.writeText(editor.value).then(() => done(true), () => done(false));
        else {
            editor.select();
            try { done(document.execCommand("copy")); } catch { done(false); }
        }
    });

    if (mode === "question") {
        ErrorAPI.getSandboxTests(opts.questionId).then(res => {
            spec = res;
            // Text-only questions have no student code: start from the starter program.
            if (res.available && res.mode === "concept" && res.starter_code && !opts.code) {
                resetCode = res.starter_code;
                setCode(resetCode);
                const resetBtn = $("#c2sb-reset");
                if (resetBtn) resetBtn.innerHTML = '<i class="fa-solid fa-rotate-left"></i> Reset to starter code';
                $("#c2sb-prefill-note").textContent = "Your answer was a text option, so the editor starts from a practice program for this concept.";
            }
            renderTests(null);
            if (testsBtn) testsBtn.disabled = busy || !res.available;
            // The editor holds the student's own answer: show straight away whether it passes.
            if (res.available && opts.code) doTests();
        }).catch(() => {
            spec = { available: false };
            renderTests(null);
        });
    }

    refreshGutter();
    editor.focus();
    return { close };
}
