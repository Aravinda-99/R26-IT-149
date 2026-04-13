/**
 * Error Analysis Page
 * ====================
 * Submit code for error pattern detection and view history.
 */

import { ErrorAPI } from "../api/api.js";

export async function renderErrorAnalysis(container) {
    container.innerHTML = `
        <h1>Error Pattern Analyzer</h1>
        <p style="color: var(--text-secondary); margin-bottom: 2rem;">Submit your code to detect common error patterns</p>

        <div class="grid-2">
            <div class="card">
                <h3>Submit Code</h3>
                <textarea id="code-input" class="input-field" rows="10" placeholder="Paste your Python code here..." style="font-family: monospace; resize: vertical;"></textarea>
                <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                    <button class="btn btn-primary" id="analyze-btn">Analyze Code</button>
                    <button class="btn" id="clear-btn" style="background: var(--border-color); color: var(--text-primary);">Clear</button>
                </div>
                <div id="analysis-result" style="margin-top: 1rem;"></div>
            </div>

            <div class="card">
                <h3>Error History</h3>
                <div id="error-history" style="color: var(--text-secondary);">
                    <p>Submit code to see your error analysis history</p>
                </div>
            </div>
        </div>

        <div class="card" style="margin-top: 1rem;">
            <h3>Error Summary</h3>
            <div id="error-summary" style="color: var(--text-secondary);">
                <p>No error data yet</p>
            </div>
        </div>
    `;

    document.getElementById("analyze-btn").addEventListener("click", async () => {
        const code = document.getElementById("code-input").value.trim();
        const resultEl = document.getElementById("analysis-result");

        if (!code) {
            resultEl.innerHTML = `<p style="color: var(--accent-orange); font-size: 0.85rem;">Please enter some code first</p>`;
            return;
        }

        resultEl.innerHTML = `<p style="color: var(--text-secondary);">Analyzing...</p>`;

        try {
            const result = await ErrorAPI.analyze({
                user_id: "demo_user",
                code_snippet: code,
            });

            if (result.error_count === 0) {
                resultEl.innerHTML = `<p style="color: var(--accent-green);">No errors detected!</p>`;
            } else {
                resultEl.innerHTML = `
                    <p style="color: var(--accent-orange); margin-bottom: 0.5rem;">${result.error_count} error(s) found</p>
                    ${result.detected_errors.map((err) => `<div style="padding: 0.5rem; background: var(--bg-secondary); border-radius: 6px; margin-bottom: 0.5rem; font-size: 0.85rem;">${err}</div>`).join("")}
                    <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 0.5rem;">${result.suggestion}</p>
                `;
            }
        } catch (e) {
            resultEl.innerHTML = `<p style="color: var(--accent-orange);">Analysis failed: ${e.message}</p>`;
        }
    });

    document.getElementById("clear-btn").addEventListener("click", () => {
        document.getElementById("code-input").value = "";
        document.getElementById("analysis-result").innerHTML = "";
    });

    try {
        const history = await ErrorAPI.getHistory("demo_user");
        const historyEl = document.getElementById("error-history");
        if (history.total === 0) {
            historyEl.innerHTML = `<p>No previous analyses</p>`;
        } else {
            historyEl.innerHTML = history.history
                .map((h) => `<div style="padding: 0.5rem; border-bottom: 1px solid var(--border-color); font-size: 0.85rem;">${h}</div>`)
                .join("");
        }
    } catch (e) {
        console.warn("Could not load error history:", e);
    }

    try {
        const summary = await ErrorAPI.getSummary("demo_user");
        const summaryEl = document.getElementById("error-summary");
        if (summary.total_errors === 0) {
            summaryEl.innerHTML = `<p>No errors recorded yet. Start by analyzing some code above.</p>`;
        }
    } catch (e) {
        console.warn("Could not load error summary:", e);
    }
}
