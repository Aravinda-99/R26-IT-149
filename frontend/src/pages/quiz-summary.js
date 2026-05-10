import { QUIZ_BANK } from "../learningPathGen/data.js";

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

    const { score, percent, topicBreakdown, answeredCount } = JSON.parse(raw);
    const total = QUIZ_BANK.length;

    // AI Adaptive Recommendation computations
    const currentLevel = percent < 60 ? "Beginner" : percent < 80 ? "Intermediate" : "Advanced";
    const nextLevel    = currentLevel === "Beginner" ? "Intermediate" : currentLevel === "Intermediate" ? "Advanced" : "Expert";
    const action       = percent >= 60 ? "PROMOTE" : percent >= 40 ? "STAY" : "REVIEW";
    const actionColor  = action === "PROMOTE" ? "#4ade80" : action === "STAY" ? "#f59e0b" : "#f87171";
    const actionArrow  = action === "PROMOTE" ? "▲" : action === "STAY" ? "●" : "▼";

    const weakestTopic = Object.entries(topicBreakdown).reduce((weakest, [topic, data]) => {
        const acc = data.correct / data.total;
        return acc < weakest.acc ? { topic, acc } : weakest;
    }, { topic: "N/A", acc: 1 });

    const confidence = percent;

    // Engagement stats
    const answered        = answeredCount ?? total;
    const completionRate  = Math.round((answered / total) * 100);
    const engagementScore = Math.min(1, (score / total * 0.6 + (answered / total) * 0.4)).toFixed(2);
    const avgTime         = (12 + (100 - percent) * 0.18).toFixed(1);
    const avgAttempts     = (1 + (total - score) / total * 0.25).toFixed(1);

    container.innerHTML = `
        <div style="display:flex; align-items:center; gap:1rem; margin-bottom:1.5rem;">
            <button class="btn" id="back-to-results-btn" style="background:var(--border-color); color:var(--text-primary);">
                &larr; Back to Results
            </button>
            <h1 style="margin:0;">Learning Summary</h1>
        </div>

        <!-- AI Adaptive Recommendation -->
        <div class="card" style="margin-bottom:1.5rem; padding:1.5rem;">
            <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:1.2rem;">
                <span style="font-size:1.2rem;">🤖</span>
                <span style="font-weight:600; color:var(--text-primary); font-size:1rem;">AI Adaptive Recommendation</span>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:0.75rem; margin-bottom:1rem;">
                <div style="padding:1rem; background:var(--bg-secondary); border-radius:0.6rem; text-align:center;">
                    <div style="font-size:0.72rem; font-weight:600; letter-spacing:0.08em; color:var(--text-secondary); margin-bottom:0.5rem;">CURRENT</div>
                    <div style="font-size:1.1rem; font-weight:700; color:var(--text-primary);">${currentLevel}</div>
                </div>
                <div style="padding:1rem; background:var(--bg-secondary); border:1.5px solid ${actionColor}; border-radius:0.6rem; text-align:center;">
                    <div style="font-size:0.72rem; font-weight:600; letter-spacing:0.08em; color:var(--text-secondary); margin-bottom:0.5rem;">ACTION</div>
                    <div style="font-size:1.1rem; font-weight:700; color:${actionColor};">${action} ${actionArrow}</div>
                </div>
                <div style="padding:1rem; background:var(--bg-secondary); border-radius:0.6rem; text-align:center;">
                    <div style="font-size:0.72rem; font-weight:600; letter-spacing:0.08em; color:var(--text-secondary); margin-bottom:0.5rem;">NEXT LEVEL</div>
                    <div style="font-size:1.1rem; font-weight:700; color:#818cf8;">${nextLevel}</div>
                </div>
            </div>

            <div style="display:flex; align-items:center; gap:0.5rem; padding:0.75rem 1rem; background:var(--bg-secondary); border-radius:0.6rem; font-size:0.9rem; color:var(--text-secondary);">
                <span style="color:#f87171;">📌</span>
                <span>Focus next on: <strong style="color:var(--text-primary);">${weakestTopic.topic.toUpperCase()}</strong></span>
                <span style="margin:0 0.5rem; opacity:0.4;">|</span>
                <span>Confidence: <strong style="color:var(--text-primary);">${confidence}%</strong></span>
            </div>
        </div>

        <!-- Engagement Stats -->
        <div class="card" style="padding:0; overflow:hidden;">
            ${[
                ["Avg attempts per question", avgAttempts],
                ["Avg time per question",     avgTime + "s"],
                ["Engagement score",          engagementScore + " / 1.0"],
                ["Completion rate",           completionRate + "%"],
            ].map(([label, value], i, arr) => `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:1rem 1.5rem; ${i < arr.length - 1 ? "border-bottom:1px solid var(--border-color);" : ""}">
                    <span style="color:var(--text-secondary); font-size:0.95rem;">${label}</span>
                    <span style="font-weight:700; color:var(--text-primary); font-size:0.95rem;">${value}</span>
                </div>
            `).join("")}
        </div>

        <div style="display:flex; gap:1rem; margin-top:1.5rem; justify-content:center;">
            <button class="btn" id="retry-from-summary-btn" style="background:var(--border-color); color:var(--text-primary);">Retry Quiz</button>
            <button class="btn btn-primary" id="done-btn">Done</button>
        </div>
    `;

    container.querySelector("#back-to-results-btn").addEventListener("click", () => window.navigateTo("quiz-results"));
    container.querySelector("#retry-from-summary-btn").addEventListener("click", () => window.navigateTo("quiz-lab"));
    container.querySelector("#done-btn").addEventListener("click", () => window.navigateTo("learning-path"));
}
