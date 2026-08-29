/**
 * Progress & Mastery History Page — CodeQuest Adaptive Learning Platform
 * ======================================================================
 * Displays concept mastery progression, assessment evidence, and learning history.
 */

export function renderProgress(container, onNavigate) {
    const postTest = sessionStorage.getItem("last_post_test_result");
    let postTestParsed = null;
    try { if (postTest) postTestParsed = JSON.parse(postTest); } catch {}

    const progressMatrix = [
        { concept: "Variables & Data Types", diagnostic: "Strong", postTest: "Mastered", status: "Mastered", statusClass: "badge-mastered" },
        { concept: "Operators & Expressions", diagnostic: "Strong", postTest: "Mastered", status: "Mastered", statusClass: "badge-mastered" },
        { concept: "Loops & Iteration", diagnostic: "Developing", postTest: postTestParsed?.mastery_level || "Developing", status: postTestParsed ? "Mastered" : "In Progress", statusClass: postTestParsed ? "badge-mastered" : "badge-developing" },
        { concept: "Conditionals & Branching", diagnostic: "Not Assessed", postTest: "—", status: "Upcoming", statusClass: "badge-neutral" },
        { concept: "Methods & Functions", diagnostic: "Not Assessed", postTest: "—", status: "Upcoming", statusClass: "badge-neutral" },
    ];

    container.innerHTML = `
        <div style="max-width: 960px; margin: 0 auto;">
            
            <!-- Page Header -->
            <div style="margin-bottom: 2rem;">
                <div style="font-size: 0.8125rem; font-weight: 600; color: var(--primary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.35rem;">
                    Learning Analytics
                </div>
                <h1 style="font-size: 1.875rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem;">
                    Your Concept Mastery Progress
                </h1>
                <p style="font-size: 0.9375rem; color: var(--text-muted);">
                    Tracks how your understanding has changed between diagnostic pre-tests and post-learning understanding checks.
                </p>
            </div>

            <!-- Concept Mastery Matrix Table -->
            <div style="background: #FFFFFF; border: 1px solid var(--border-main); border-radius: var(--radius-lg); overflow: hidden; margin-bottom: 2.5rem;">
                <div style="padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-main); display: flex; justify-content: space-between; align-items: center;">
                    <h2 style="font-size: 1.125rem; font-weight: 700; color: var(--text-main); margin: 0;">
                        Concept Understanding Matrix
                    </h2>
                    <span style="font-size: 0.75rem; color: var(--text-subtle); font-family: var(--font-mono);">ML Evaluated</span>
                </div>

                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.875rem;">
                        <thead>
                            <tr style="background: var(--bg-surface-subtle); border-bottom: 1px solid var(--border-main); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-subtle);">
                                <th style="padding: 0.75rem 1.5rem;">Programming Concept</th>
                                <th style="padding: 0.75rem 1rem;">Diagnostic Baseline</th>
                                <th style="padding: 0.75rem 1rem;">Post-Test Validation</th>
                                <th style="padding: 0.75rem 1.5rem; text-align: right;">Current Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${progressMatrix.map((row) => `
                                <tr style="border-bottom: 1px solid var(--border-subtle);">
                                    <td style="padding: 1rem 1.5rem; font-weight: 600; color: var(--text-main);">${row.concept}</td>
                                    <td style="padding: 1rem 1rem; color: var(--text-muted);">${row.diagnostic}</td>
                                    <td style="padding: 1rem 1rem; color: var(--text-muted);">${row.postTest}</td>
                                    <td style="padding: 1rem 1.5rem; text-align: right;">
                                        <span class="badge ${row.statusClass}">${row.status}</span>
                                    </td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Evidence Summary Note -->
            <div style="background: var(--bg-surface-subtle); border-radius: var(--radius-md); padding: 1.25rem 1.5rem; border: 1px solid var(--border-main); font-size: 0.8125rem; color: var(--text-muted); line-height: 1.5;">
                <strong style="color: var(--text-main);">Evidence-Based Progression:</strong> 
                CodeQuest uses Component 2 (Error Pattern Detection) and Component 4 (Dual ML Schema Mastery Pipeline) to ensure that learning gaps are resolved before advancing into advanced programming structures.
            </div>

        </div>
    `;
}
