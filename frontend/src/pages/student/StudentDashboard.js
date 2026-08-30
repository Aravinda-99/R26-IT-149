/**
 * State-Driven Student Dashboard — CodeQuest Adaptive Learning Platform
 * =====================================================================
 * Dynamically adjusts UI based on the student's learning state machine:
 * NOT_STARTED -> FOCUS_AREA_READY -> LEARNING_IN_PROGRESS -> POST_TEST_AVAILABLE -> RESULT_READY
 */

import { getCurrentUser } from "../../utils/auth.js";
import { animatePageEntrance } from "../../utils/animations.js";

export function renderStudentDashboard(container, onNavigate) {
    const user = getCurrentUser() || { displayName: "Student", email: "student@codequest.lk" };
    const displayName = user.displayName || user.name || "Student";
    const firstName = displayName.split(" ")[0] || "Student";

    // ── 1. Inspect Student State from Storage ─────────────────────────
    const pretestResultStr = sessionStorage.getItem("codequest_pretest_result") || localStorage.getItem("codequest_pretest_result");
    const postTestResultStr = sessionStorage.getItem("last_post_test_result") || localStorage.getItem("last_post_test_result");
    const lessonsCompleted = sessionStorage.getItem("cq_lessons_completed_for_concept") || localStorage.getItem("cq_lessons_completed_for_concept");
    const inLearning = sessionStorage.getItem("cq_in_learning_lesson");

    let pretestResult = null;
    let postTestResult = null;

    try { if (pretestResultStr) pretestResult = JSON.parse(pretestResultStr); } catch {}
    try { if (postTestResultStr) postTestResult = JSON.parse(postTestResultStr); } catch {}

    // Determine current state
    let currentState = "NOT_STARTED";

    if (postTestResult) {
        currentState = "RESULT_READY";
    } else if (lessonsCompleted) {
        currentState = "POST_TEST_AVAILABLE";
    } else if (inLearning) {
        currentState = "LEARNING_IN_PROGRESS";
    } else if (pretestResult) {
        currentState = "FOCUS_AREA_READY";
    }

    const weakConcept = pretestResult?.weak_concept || pretestResult?.concept || sessionStorage.getItem("cq_focus_concept") || "Loops";
    const conceptCapitalized = weakConcept.charAt(0).toUpperCase() + weakConcept.slice(1);

    // ── 2. Render State Views ──────────────────────────────────────────
    if (currentState === "NOT_STARTED") {
        container.innerHTML = `
            <div style="max-width: 1000px; margin: 0 auto; display: flex; flex-direction: column; gap: 2rem;">
                
                <!-- Welcome Introduction -->
                <div class="dash-hero" style="background: #FFFFFF; border: 1px solid var(--border-main); border-radius: var(--radius-lg); padding: 2.25rem 2rem; box-shadow: var(--shadow-sm);">
                    <div style="display: inline-block; background: var(--primary-soft); color: var(--primary); padding: 0.3rem 0.85rem; border-radius: 999px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1rem;">
                        Step 1: Diagnostic Assessment
                    </div>

                    <h1 style="font-size: 2rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.75rem; letter-spacing: -0.02em;">
                        Welcome back, ${firstName}!
                    </h1>

                    <p style="font-size: 1rem; color: var(--text-muted); max-width: 680px; line-height: 1.6; margin-bottom: 1.75rem;">
                        Let's pinpoint your programming strengths and customize your practice lessons. Start with the short diagnostic pre-test.
                    </p>

                    <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
                        <button type="button" class="btn btn-primary btn-lg" id="start-pretest-cta" style="font-weight: 700; padding: 0.75rem 1.75rem;">
                            Start Pre-Test <i class="fa-solid fa-arrow-right" style="margin-left: 0.4rem;"></i>
                        </button>
                        <span style="font-size: 0.8125rem; color: var(--text-subtle);">
                            <i class="fa-regular fa-clock" style="margin-right: 0.3rem;"></i> ~10 mins • 15 questions
                        </span>
                    </div>
                </div>

                <!-- 4-Step Pathway Visual -->
                <div>
                    <div style="font-size: 0.8125rem; font-weight: 700; color: var(--text-subtle); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1rem;">
                        Your Personalized Learning Roadmap
                    </div>

                    <div class="pathway-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;">
                        <div class="pathway-step" style="background: #FFFFFF; border: 1px solid var(--border-main); border-top: 3px solid var(--primary); border-radius: var(--radius-md); padding: 1.25rem;">
                            <div style="font-size: 0.7rem; font-weight: 700; color: var(--primary); margin-bottom: 0.25rem;">01 / PRE-TEST</div>
                            <div style="font-size: 1rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.25rem;">Diagnostic Check</div>
                            <div style="font-size: 0.8125rem; color: var(--text-muted);">Identify existing knowledge across Java fundamentals.</div>
                        </div>

                        <div class="pathway-step" style="background: #FFFFFF; border: 1px solid var(--border-main); border-radius: var(--radius-md); padding: 1.25rem; opacity: 0.7;">
                            <div style="font-size: 0.7rem; font-weight: 700; color: var(--text-subtle); margin-bottom: 0.25rem;">02 / FOCUS AREA</div>
                            <div style="font-size: 1rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.25rem;">Targeted Topic</div>
                            <div style="font-size: 0.8125rem; color: var(--text-muted);">Pinpoint specific misconceptions and key focus areas.</div>
                        </div>

                        <div class="pathway-step" style="background: #FFFFFF; border: 1px solid var(--border-main); border-radius: var(--radius-md); padding: 1.25rem; opacity: 0.7;">
                            <div style="font-size: 0.7rem; font-weight: 700; color: var(--text-subtle); margin-bottom: 0.25rem;">03 / PRACTICE</div>
                            <div style="font-size: 1rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.25rem;">Game Lessons</div>
                            <div style="font-size: 0.8125rem; color: var(--text-muted);">Build intuition with interactive learning challenges.</div>
                        </div>

                        <div class="pathway-step" style="background: #FFFFFF; border: 1px solid var(--border-main); border-radius: var(--radius-md); padding: 1.25rem; opacity: 0.7;">
                            <div style="font-size: 0.7rem; font-weight: 700; color: var(--text-subtle); margin-bottom: 0.25rem;">04 / VALIDATION</div>
                            <div style="font-size: 1rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.25rem;">Understanding Check</div>
                            <div style="font-size: 0.8125rem; color: var(--text-muted);">Validate mastery and unlock next level achievements.</div>
                        </div>
                    </div>
                </div>

            </div>
        `;

        animatePageEntrance(container.querySelector(".dash-hero"));
        container.querySelector("#start-pretest-cta")?.addEventListener("click", () => {
            if (onNavigate) onNavigate("/student/pre-test");
        });
        return;
    }

    if (currentState === "FOCUS_AREA_READY" || currentState === "LEARNING_IN_PROGRESS") {
        container.innerHTML = `
            <div style="max-width: 1000px; margin: 0 auto; display: flex; flex-direction: column; gap: 2rem;">
                
                <!-- State Header -->
                <div>
                    <div style="font-size: 0.8125rem; font-weight: 600; color: var(--primary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.35rem;">
                        Pre-Test Completed
                    </div>
                    <h1 style="font-size: 1.875rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.5rem; letter-spacing: -0.02em;">
                        We found your focus area: ${conceptCapitalized}
                    </h1>
                    <p style="font-size: 1rem; color: var(--text-muted); max-width: 680px; line-height: 1.6;">
                        Based on your diagnostic answers, we've structured recommended interactive game lessons to strengthen your understanding before your validation check.
                    </p>
                </div>

                <!-- Primary Action Card: Focus Area & Practice -->
                <div class="dash-card" style="background: #FFFFFF; border: 1px solid var(--border-main); border-left: 4px solid var(--primary); border-radius: var(--radius-lg); padding: 2rem; box-shadow: var(--shadow-sm);">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1.5rem; flex-wrap: wrap;">
                        <div style="flex: 1; min-width: 280px;">
                            <div style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.25rem 0.65rem; background: #FEF3C7; color: #D97706; border-radius: 999px; font-size: 0.75rem; font-weight: 700; margin-bottom: 0.75rem;">
                                🎯 Recommended Action
                            </div>

                            <h2 style="font-size: 1.35rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem;">
                                Practice ${conceptCapitalized} Interactive Lessons
                            </h2>
                            
                            <p style="font-size: 0.9375rem; color: var(--text-muted); margin-bottom: 1.5rem; line-height: 1.5;">
                                Complete these 3 engaging game challenges to reinforce mental models on iteration bounds and condition logic.
                            </p>

                            <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
                                <button type="button" class="btn btn-primary" id="start-practice-btn" style="font-weight: 700; padding: 0.75rem 1.5rem;">
                                    Start Recommended Practice <i class="fa-solid fa-gamepad" style="margin-left: 0.4rem;"></i>
                                </button>
                                <button type="button" class="btn btn-secondary" id="view-focus-area-btn" style="padding: 0.75rem 1.25rem;">
                                    View Focus Area Details
                                </button>
                            </div>
                        </div>

                        <div style="background: var(--bg-surface-subtle); border-radius: var(--radius-md); padding: 1.25rem 1.5rem; border: 1px solid var(--border-main); min-width: 220px; text-align: center;">
                            <div style="font-size: 2.25rem; margin-bottom: 0.25rem;">🔄</div>
                            <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Active Topic</div>
                            <div style="font-size: 1.1rem; font-weight: 800; color: var(--text-main); margin-top: 0.2rem;">${conceptCapitalized}</div>
                            <div style="font-size: 0.75rem; color: #16A34A; font-weight: 600; margin-top: 0.35rem;">● Practice Available</div>
                        </div>
                    </div>
                </div>

                <!-- Concept Overview Table -->
                <div style="background: #FFFFFF; border: 1px solid var(--border-main); border-radius: var(--radius-md); padding: 1.5rem;">
                    <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--text-main); margin-bottom: 1rem;">
                        Diagnostic Concept Summary
                    </h3>
                    <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; background: var(--bg-surface-subtle); border-radius: var(--radius-sm);">
                            <span style="font-weight: 600; font-size: 0.875rem;">Variables & Data Types</span>
                            <span class="badge badge-mastered">Strong</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; background: var(--bg-surface-subtle); border-radius: var(--radius-sm);">
                            <span style="font-weight: 600; font-size: 0.875rem;">Operators & Expressions</span>
                            <span class="badge badge-mastered">Strong</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; background: #FFFBEB; border: 1px solid #FDE68A; border-radius: var(--radius-sm);">
                            <span style="font-weight: 700; font-size: 0.875rem; color: #92400E;">${conceptCapitalized} (Focus Area)</span>
                            <span class="badge badge-developing">Needs Attention</span>
                        </div>
                    </div>
                </div>

            </div>
        `;

        animatePageEntrance(container.querySelector(".dash-card"));
        container.querySelector("#start-practice-btn")?.addEventListener("click", () => {
            sessionStorage.setItem("cq_in_learning_lesson", "true");
            if (onNavigate) onNavigate("/student/games");
        });
        container.querySelector("#view-focus-area-btn")?.addEventListener("click", () => {
            if (onNavigate) onNavigate("/student/focus-area");
        });
        return;
    }

    if (currentState === "POST_TEST_AVAILABLE") {
        container.innerHTML = `
            <div style="max-width: 1000px; margin: 0 auto; display: flex; flex-direction: column; gap: 2rem;">
                
                <!-- State Header -->
                <div>
                    <div style="font-size: 0.8125rem; font-weight: 600; color: #16A34A; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.35rem;">
                        Practice Lessons Completed
                    </div>
                    <h1 style="font-size: 1.875rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.5rem; letter-spacing: -0.02em;">
                        Ready for your Understanding Check?
                    </h1>
                    <p style="font-size: 1rem; color: var(--text-muted); max-width: 680px; line-height: 1.6;">
                        You've completed the interactive practice for <strong>${conceptCapitalized}</strong>. 
                        Take the 15-question post-test to validate your understanding and unlock the next topic.
                    </p>
                </div>

                <!-- Primary Action Card: Post-Test -->
                <div class="dash-card" style="background: #FFFFFF; border: 1px solid var(--border-main); border-left: 4px solid #16A34A; border-radius: var(--radius-lg); padding: 2rem; box-shadow: var(--shadow-sm);">
                    <div style="display: flex; justify-content: space-between; align-items: center; gap: 1.5rem; flex-wrap: wrap;">
                        <div style="flex: 1; min-width: 280px;">
                            <span class="badge badge-primary" style="margin-bottom: 0.75rem;">Understanding Check</span>
                            <h2 style="font-size: 1.35rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.4rem;">
                                ${conceptCapitalized} Mastery Validation
                            </h2>
                            <p style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 1.25rem;">
                                15 curated multiple-choice questions to confirm you have fully grasped ${conceptCapitalized}.
                            </p>

                            <button type="button" class="btn btn-primary btn-lg" id="start-posttest-cta" style="font-weight: 700;">
                                Start Understanding Check <i class="fa-solid fa-arrow-right" style="margin-left: 0.4rem;"></i>
                            </button>
                        </div>

                        <div style="text-align: center; padding: 1.25rem 2rem; background: var(--bg-surface-subtle); border-radius: var(--radius-md); border: 1px solid var(--border-main);">
                            <div style="font-size: 0.75rem; color: var(--text-subtle); text-transform: uppercase;">Practice Status</div>
                            <div style="font-size: 1.5rem; font-weight: 800; color: #16A34A;">Completed</div>
                            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.2rem;">Ready for Post-Test</div>
                        </div>
                    </div>
                </div>

            </div>
        `;

        animatePageEntrance(container.querySelector(".dash-card"));
        container.querySelector("#start-posttest-cta")?.addEventListener("click", () => {
            if (onNavigate) onNavigate("/student/post-test/start");
        });
        return;
    }

    if (currentState === "RESULT_READY") {
        const masteryLevel = postTestResult.mastery_level || "Mastered";
        const isMastered = masteryLevel.toLowerCase().includes("strong") || masteryLevel.toLowerCase().includes("master") || masteryLevel.toLowerCase().includes("good");
        const probPct = postTestResult.mastery_probability ? Math.round(postTestResult.mastery_probability * 100) : 85;

        container.innerHTML = `
            <div style="max-width: 1000px; margin: 0 auto; display: flex; flex-direction: column; gap: 2rem;">
                
                <!-- State Header -->
                <div>
                    <div style="font-size: 0.8125rem; font-weight: 600; color: ${isMastered ? 'var(--status-mastered)' : 'var(--status-developing)'}; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.35rem;">
                        Validation Completed
                    </div>
                    <h1 style="font-size: 1.875rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.5rem; letter-spacing: -0.02em;">
                        ${isMastered ? `Great job! You've mastered ${conceptCapitalized}` : `Progress update for ${conceptCapitalized}`}
                    </h1>
                    <p style="font-size: 1rem; color: var(--text-muted); max-width: 680px; line-height: 1.6;">
                        ${isMastered 
                            ? `Your understanding check confirmed solid schema retention. You are ready to advance to Conditionals & Arrays.`
                            : `You made good progress on ${conceptCapitalized}. Reviewing key exit conditions will solidify your understanding.`}
                    </p>
                </div>

                <!-- Result Surface -->
                <div class="dash-card" style="background: #FFFFFF; border: 1px solid var(--border-main); border-left: 4px solid ${isMastered ? '#16A34A' : '#D97706'}; border-radius: var(--radius-lg); padding: 2rem; box-shadow: var(--shadow-sm);">
                    <div style="display: flex; justify-content: space-between; align-items: center; gap: 1.5rem; flex-wrap: wrap;">
                        <div>
                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                                <span class="badge ${isMastered ? 'badge-mastered' : 'badge-developing'}">${masteryLevel}</span>
                                <span style="font-size: 0.8125rem; color: var(--text-muted);">Validated Result (${probPct}% Mastery)</span>
                            </div>
                            <h2 style="font-size: 1.25rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem;">
                                ${isMastered ? "Next Recommended Topic: Arrays & Indexing" : "Recommended: 5-Minute Practice Review"}
                            </h2>
                            <p style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 1.25rem;">
                                Diagnostic: <strong style="color: #D97706;">Developing</strong> &rarr; Post-Test: <strong style="color: #16A34A;">${masteryLevel}</strong>
                            </p>

                            <div style="display: flex; align-items: center; gap: 1rem;">
                                <button type="button" class="btn btn-primary" id="view-full-result-btn" style="font-weight: 700;">
                                    View Full Report <i class="fa-solid fa-arrow-right" style="margin-left: 0.35rem;"></i>
                                </button>
                                <button type="button" class="btn btn-secondary" id="next-curriculum-btn">
                                    Curriculum Roadmap
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        `;

        animatePageEntrance(container.querySelector(".dash-card"));
        container.querySelector("#view-full-result-btn")?.addEventListener("click", () => {
            if (onNavigate) onNavigate("/student/post-test/result");
        });
        container.querySelector("#next-curriculum-btn")?.addEventListener("click", () => {
            if (onNavigate) onNavigate("/student/learning-path");
        });
        return;
    }
}
