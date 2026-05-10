import { QUIZ_BANK } from "../learningPathGen/data.js";

export function renderQuizResults(container) {
    const raw = sessionStorage.getItem("quiz-results");
    if (!raw) {
        container.innerHTML = `
            <div class="card" style="text-align:center; padding:3rem;">
                <h2>No results found</h2>
                <p style="color:var(--text-secondary); margin:1rem 0;">Complete a quiz first to see your results.</p>
                <button class="btn btn-primary" onclick="window.navigateTo('quiz-lab')">Go to Quiz Lab</button>
            </div>
        `;
        return;
    }

    const { score, percent, topicBreakdown } = JSON.parse(raw);
    const total = QUIZ_BANK.length;

    const message = percent >= 80
        ? "Excellent work! You are mastering the concepts."
        : percent >= 60
        ? "Good progress. Review a few topics and try again."
        : "Keep going. Repetition builds confidence.";

    const topicRows = Object.entries(topicBreakdown)
        .map(([topic, data]) => {
            const accuracy = Math.round((data.correct / data.total) * 100);
            const color = accuracy >= 80 ? "var(--accent-green)" : accuracy >= 60 ? "#f59e0b" : "var(--accent-orange)";
            return `
                <div style="padding:1rem; background:var(--bg-secondary); border-radius:0.6rem; margin-bottom:0.75rem;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                        <span style="font-weight:600; color:var(--text-primary);">${topic}</span>
                        <span style="font-weight:700; color:${color}; font-size:1.1rem;">${accuracy}%</span>
                    </div>
                    <div style="font-size:0.82rem; color:var(--text-secondary); margin-bottom:0.5rem;">${data.correct} of ${data.total} correct</div>
                    <div style="height:6px; background:var(--border-color); border-radius:3px;">
                        <div style="height:100%; width:${accuracy}%; background:${color}; border-radius:3px;"></div>
                    </div>
                </div>
            `;
        })
        .join("");

    container.innerHTML = `
        <div style="display:flex; align-items:center; gap:1rem; margin-bottom:1.5rem;">
            <button class="btn" id="back-to-quiz-btn" style="background:var(--border-color); color:var(--text-primary);">
                &larr; Back to Quiz
            </button>
            <h1 style="margin:0;">Quiz Results</h1>
        </div>

        <div class="grid-2" style="gap:1.5rem; margin-bottom:1.5rem;">
            <div class="card" style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%); text-align:center; padding:2rem; border:none;">
                <div style="font-size:0.85rem; color:rgba(255,255,255,0.8); margin-bottom:0.5rem;">Overall Score</div>
                <div style="font-size:3.5rem; font-weight:800; color:white; line-height:1;">${score}</div>
                <div style="font-size:1rem; color:rgba(255,255,255,0.7); margin:0.3rem 0;">out of ${total}</div>
                <div style="font-size:2rem; font-weight:700; color:white;">${percent}%</div>
                <div style="font-size:0.9rem; color:rgba(255,255,255,0.85); margin-top:1rem;">${message}</div>
            </div>

            <div class="card">
                <h3 style="margin-top:0;">Summary</h3>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
                    <div style="padding:1.2rem; background:var(--bg-secondary); border-radius:0.6rem; text-align:center;">
                        <div style="font-size:0.82rem; color:var(--text-secondary); margin-bottom:0.4rem;">Correct</div>
                        <div style="font-size:2rem; font-weight:700; color:var(--accent-green);">${score}</div>
                    </div>
                    <div style="padding:1.2rem; background:var(--bg-secondary); border-radius:0.6rem; text-align:center;">
                        <div style="font-size:0.82rem; color:var(--text-secondary); margin-bottom:0.4rem;">Incorrect</div>
                        <div style="font-size:2rem; font-weight:700; color:var(--accent-orange);">${total - score}</div>
                    </div>
                    <div style="padding:1.2rem; background:var(--bg-secondary); border-radius:0.6rem; text-align:center;">
                        <div style="font-size:0.82rem; color:var(--text-secondary); margin-bottom:0.4rem;">Total Questions</div>
                        <div style="font-size:2rem; font-weight:700; color:var(--text-primary);">${total}</div>
                    </div>
                    <div style="padding:1.2rem; background:var(--bg-secondary); border-radius:0.6rem; text-align:center;">
                        <div style="font-size:0.82rem; color:var(--text-secondary); margin-bottom:0.4rem;">Topics</div>
                        <div style="font-size:2rem; font-weight:700; color:var(--text-primary);">${Object.keys(topicBreakdown).length}</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="card">
            <h3 style="margin-top:0;">Performance by Topic</h3>
            ${topicRows}
        </div>

        <div style="display:flex; gap:1rem; margin-top:1.5rem; justify-content:center;">
            <button class="btn" id="retry-from-results-btn" style="background:var(--border-color); color:var(--text-primary);">Retry Quiz</button>
            <button class="btn btn-primary" id="finish-btn">Finish &rarr;</button>
        </div>
    `;

    container.querySelector("#back-to-quiz-btn").addEventListener("click", () => window.navigateTo("quiz-lab"));
    container.querySelector("#retry-from-results-btn").addEventListener("click", () => window.navigateTo("quiz-lab"));
    container.querySelector("#finish-btn").addEventListener("click", () => window.navigateTo("quiz-summary"));
}
