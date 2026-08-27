export function renderQuizSummary(container) {
    const raw = sessionStorage.getItem("quiz-results");
    if (!raw) {
        container.innerHTML = `
            <div class="card" style="text-align:center; padding:3rem;">
                <h2>No results found</h2>
                <p style="color:var(--text-secondary); margin:1rem 0;">Complete a quiz first to see your summary.</p>
                <button class="btn btn-primary" onclick="window.navigateTo('quiz-lab')">Go to Quiz Lab</button>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div style="display:flex; align-items:center; gap:1rem; margin-bottom:1.5rem;">
            <button class="btn" id="back-to-results-btn" style="background:var(--border-color); color:var(--text-primary);">
                &larr; Back to Results
            </button>
            <h1 style="margin:0;">Learning Summary</h1>
        </div>

        <div style="display:flex; gap:1rem; justify-content:center;">
            <button class="btn" id="retry-from-summary-btn" style="background:var(--border-color); color:var(--text-primary);">Retry Quiz</button>
            <button class="btn btn-primary" id="done-btn">Done</button>
        </div>
    `;

    container.querySelector("#back-to-results-btn").addEventListener("click", () => window.navigateTo("quiz-results"));
    container.querySelector("#retry-from-summary-btn").addEventListener("click", () => window.navigateTo("quiz-lab"));
    container.querySelector("#done-btn").addEventListener("click", () => window.navigateTo("error-analysis"));
}
