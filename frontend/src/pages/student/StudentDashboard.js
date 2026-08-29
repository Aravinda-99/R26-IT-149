/**
 * State-Driven Student Dashboard — CodeQuest Adaptive Learning Platform
 * =====================================================================
 * Answers ONE core question: "What should I do next?"
 * Dynamically adjusts UI based on the student's actual learning cycle:
 * NEW_STUDENT -> ANALYSIS_READY -> LEARNING_IN_PROGRESS -> POST_TEST_READY -> RESULT_READY
 */

import { getCurrentUser } from "../../utils/auth.js";
import { GameManager } from "../../game/GameManager.js";

export function renderStudentDashboard(container, onNavigate) {
    const user = getCurrentUser() || { displayName: "Student", email: "student@codequest.lk" };
    const displayName = user.displayName || user.name || "Student";
    const firstName = displayName.split(" ")[0] || "Student";

    // ── 1. Inspect Student State from Storage & GameManager ─────────
    const quizResultsStr = sessionStorage.getItem("quiz-results");
    const mlRecStr = sessionStorage.getItem("ml-recommendation");
    const postTestResultStr = sessionStorage.getItem("last_post_test_result");
    const gameState = GameManager.getState ? GameManager.getState() : {};

    let quizResults = null;
    let mlRec = null;
    let postTestResult = null;

    try { if (quizResultsStr) quizResults = JSON.parse(quizResultsStr); } catch {}
    try { if (mlRecStr) mlRec = JSON.parse(mlRecStr); } catch {}
    try { if (postTestResultStr) postTestResult = JSON.parse(postTestResultStr); } catch {}

    // Determine current learning state
    let currentState = "NEW_STUDENT"; // "NEW_STUDENT" | "ANALYSIS_READY" | "LEARNING_IN_PROGRESS" | "POST_TEST_READY" | "RESULT_READY"

    if (postTestResult) {
        currentState = "RESULT_READY";
    } else if (sessionStorage.getItem("cq_lessons_completed_for_concept")) {
        currentState = "POST_TEST_READY";
    } else if (sessionStorage.getItem("cq_in_learning_lesson")) {
        currentState = "LEARNING_IN_PROGRESS";
    } else if (quizResults || mlRec) {
        currentState = "ANALYSIS_READY";
    }

    // Weak concept detection
    const weakConcept = mlRec?.next_topic || quizResults?.sessionMetrics?.weakest_topic || "Loops";
    const conceptCapitalized = weakConcept.charAt(0).toUpperCase() + weakConcept.slice(1);

    // ── 2. Render Template According to State ────────────────────────
    if (currentState === "NEW_STUDENT") {
        container.innerHTML = `
            <div style="max-width: 1000px; margin: 0 auto;">
                
                <!-- Welcome Introduction -->
                <div style="margin-bottom: 2.25rem;">
                    <div style="font-size: 0.8125rem; font-weight: 600; color: var(--primary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.35rem;">
                        Adaptive Programming Learning
                    </div>
                    <h1 style="font-size: 1.875rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem; letter-spacing: -0.02em;">
                        Welcome, ${firstName}
                    </h1>
                    <p style="font-size: 1rem; color: var(--text-muted); max-width: 680px; line-height: 1.6;">
                        Programming becomes easier when you learn the right concept at the right time. 
                        Let's find the best place to start by understanding which concepts you already know and where you need support.
                    </p>
                </div>

                <!-- Primary Action Surface: Start Diagnostic -->
                <div class="focus-surface" style="background: #FFFFFF; border-left: 4px solid var(--primary); padding: 2rem;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1.5rem; flex-wrap: wrap;">
                        <div style="flex: 1; min-width: 280px;">
                            <div style="display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.75rem; font-weight: 600; color: var(--primary); margin-bottom: 0.5rem;">
                                <i class="fa-solid fa-compass"></i> Step 1 of Your Journey
                            </div>
                            <h2 style="font-size: 1.35rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.4rem;">
                                Take Your Diagnostic Assessment
                            </h2>
                            <p style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 1.25rem; line-height: 1.5;">
                                A 15-question baseline assessment covering Java variables, conditionals, loops, and arrays. 
                                There are no grades — this pinpoints your strengths and customizes your game lessons.
                            </p>
                            
                            <div style="display: flex; align-items: center; gap: 1.5rem; font-size: 0.8125rem; color: var(--text-subtle); margin-bottom: 1.5rem;">
                                <span><i class="fa-regular fa-circle-question" style="color: var(--primary); margin-right: 0.35rem;"></i> 15 questions</span>
                                <span><i class="fa-regular fa-clock" style="color: var(--primary); margin-right: 0.35rem;"></i> ~10 minutes</span>
                                <span><i class="fa-solid fa-shield-halved" style="color: var(--status-mastered); margin-right: 0.35rem;"></i> No penalty</span>
                            </div>

                            <button type="button" class="btn btn-primary btn-lg" id="start-diagnostic-cta" style="font-weight: 700;">
                                Start Diagnostic Assessment <i class="fa-solid fa-arrow-right" style="margin-left: 0.4rem;"></i>
                            </button>
                        </div>

                        <!-- Abstract Programming Snippet Surface -->
                        <div style="background: #111827; color: #F9FAFB; border-radius: var(--radius-md); padding: 1.25rem; font-family: var(--font-mono); font-size: 0.8125rem; line-height: 1.5; width: 280px; flex-shrink: 0; border: 1px solid #1F2937;">
                            <div style="color: #6B7280; margin-bottom: 0.5rem; font-size: 0.75rem;">// CodeQuest Diagnostic Model</div>
                            <div style="color: #93C5FD;">int</div> score = <span style="color: #FBBF24;">evaluate</span>(knowledge);<br/>
                            <div style="color: #93C5FD;">if</div> (score &lt; threshold) {<br/>
                            &nbsp;&nbsp;generateCustomPath();<br/>
                            } <div style="color: #93C5FD;">else</div> {<br/>
                            &nbsp;&nbsp;advanceToNextTopic();<br/>
                            }
                        </div>
                    </div>
                </div>

                <!-- 4-Step Pathway Visual -->
                <div style="margin-top: 3rem;">
                    <div style="font-size: 0.8125rem; font-weight: 700; color: var(--text-subtle); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1rem;">
                        How CodeQuest Personalizes Your Learning
                    </div>

                    <div class="pathway-grid">
                        <div class="pathway-step" style="border-top: 3px solid var(--primary);">
                            <div class="pathway-step-num">01 / DIAGNOSTIC</div>
                            <div class="pathway-step-title">Initial Assessment</div>
                            <div class="pathway-step-desc">Test your existing Java knowledge with 15 quick questions.</div>
                        </div>

                        <div class="pathway-step">
                            <div class="pathway-step-num">02 / ANALYSIS</div>
                            <div class="pathway-step-title">Error Pattern Detection</div>
                            <div class="pathway-step-desc">We analyze incorrect options to detect misconceptions.</div>
                        </div>

                        <div class="pathway-step">
                            <div class="pathway-step-num">03 / GAME LESSONS</div>
                            <div class="pathway-step-title">Interactive Challenges</div>
                            <div class="pathway-step-desc">Learn weak concepts through focused coding exercises.</div>
                        </div>

                        <div class="pathway-step">
                            <div class="pathway-step-num">04 / UNDERSTANDING</div>
                            <div class="pathway-step-title">Post-Test Validation</div>
                            <div class="pathway-step-desc">Confirm mastery with dual ML validation before progressing.</div>
                        </div>
                    </div>
                </div>

            </div>
        `;

        container.querySelector("#start-diagnostic-cta")?.addEventListener("click", () => {
            if (onNavigate) onNavigate("/student/assessments");
        });
        return;
    }

    // ── State 2: ANALYSIS_READY / LEARNING_RECOMMENDED ───────────────
    if (currentState === "ANALYSIS_READY") {
        container.innerHTML = `
            <div style="max-width: 1000px; margin: 0 auto;">
                
                <!-- State Header -->
                <div style="margin-bottom: 2rem;">
                    <div style="font-size: 0.8125rem; font-weight: 600; color: var(--primary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.35rem;">
                        Diagnostic Complete
                    </div>
                    <h1 style="font-size: 1.875rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem; letter-spacing: -0.02em;">
                        We found where to focus.
                    </h1>
                    <p style="font-size: 1rem; color: var(--text-muted); max-width: 680px; line-height: 1.6;">
                        Based on your diagnostic answers, we've identified key concept patterns to strengthen before advancing.
                    </p>
                </div>

                <!-- Primary Focus Surface: Recommended Learning -->
                <div class="focus-surface" style="padding: 2rem;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1.5rem; flex-wrap: wrap;">
                        <div style="flex: 1; min-width: 300px;">
                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
                                <span class="badge badge-developing">Needs Attention</span>
                                <span style="font-size: 0.8125rem; font-weight: 600; color: var(--text-muted);">Recommended Next Concept</span>
                            </div>

                            <h2 style="font-size: 1.45rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem;">
                                ${conceptCapitalized} Fundamentals
                            </h2>
                            
                            <p style="font-size: 0.9375rem; color: var(--text-muted); margin-bottom: 1.5rem; line-height: 1.5;">
                                You understood basic repetition, but had difficulty deciding when loop conditions terminate. 
                                Completing these 3 interactive challenges will build your intuition.
                            </p>

                            <button type="button" class="btn btn-primary btn-lg" id="start-recommended-lesson-btn" style="font-weight: 700;">
                                Start Lesson 01: ${conceptCapitalized} Basics <i class="fa-solid fa-arrow-right" style="margin-left: 0.4rem;"></i>
                            </button>
                        </div>

                        <!-- Learning Sequence Mini-Path -->
                        <div style="background: var(--bg-surface-subtle); border-radius: var(--radius-md); padding: 1.25rem; width: 300px; border: 1px solid var(--border-main);">
                            <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-subtle); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem;">
                                Recommended Sequence
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 0.6rem; font-size: 0.8125rem;">
                                <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--primary); font-weight: 600;">
                                    <span style="font-family: var(--font-mono); font-size: 0.75rem;">01</span> ${conceptCapitalized} Basics (Ready)
                                </div>
                                <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--text-muted);">
                                    <span style="font-family: var(--font-mono); font-size: 0.75rem;">02</span> Conditions inside Loops
                                </div>
                                <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--text-muted);">
                                    <span style="font-family: var(--font-mono); font-size: 0.75rem;">03</span> ${conceptCapitalized} Challenge
                                </div>
                                <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--text-muted); padding-top: 0.35rem; border-top: 1px solid var(--border-main);">
                                    <span style="font-family: var(--font-mono); font-size: 0.75rem;">04</span> Understanding Check
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Concept Mastery Matrix -->
                <div style="margin-top: 2.5rem;">
                    <h3 style="font-size: 1.125rem; font-weight: 700; color: var(--text-main); margin-bottom: 1rem;">
                        Concept Understanding Overview
                    </h3>

                    <div class="concept-matrix">
                        <div class="concept-row">
                            <div class="concept-info">
                                <span class="concept-index">01</span>
                                <div>
                                    <div class="concept-name">Variables & Data Types</div>
                                    <div class="concept-meta">int, double, boolean, String</div>
                                </div>
                            </div>
                            <span class="badge badge-mastered">Strong</span>
                        </div>

                        <div class="concept-row">
                            <div class="concept-info">
                                <span class="concept-index">02</span>
                                <div>
                                    <div class="concept-name">Operators & Expressions</div>
                                    <div class="concept-meta">Arithmetic, relational, logic</div>
                                </div>
                            </div>
                            <span class="badge badge-mastered">Strong</span>
                        </div>

                        <div class="concept-row" style="background-color: var(--status-developing-bg);">
                            <div class="concept-info">
                                <span class="concept-index" style="color: var(--status-developing);">03</span>
                                <div>
                                    <div class="concept-name" style="color: var(--status-developing); font-weight: 700;">Loops & Iteration</div>
                                    <div class="concept-meta">for, while, nested loops</div>
                                </div>
                            </div>
                            <span class="badge badge-developing">Needs Attention</span>
                        </div>

                        <div class="concept-row">
                            <div class="concept-info">
                                <span class="concept-index">04</span>
                                <div>
                                    <div class="concept-name">Conditionals & Branching</div>
                                    <div class="concept-meta">if, else if, switch statements</div>
                                </div>
                            </div>
                            <span class="badge badge-neutral">Not Assessed</span>
                        </div>
                    </div>
                </div>

            </div>
        `;

        container.querySelector("#start-recommended-lesson-btn")?.addEventListener("click", () => {
            sessionStorage.setItem("cq_in_learning_lesson", "true");
            if (onNavigate) onNavigate("/student/practice");
        });
        return;
    }

    // ── State 3: POST_TEST_READY ─────────────────────────────────────
    if (currentState === "POST_TEST_READY") {
        container.innerHTML = `
            <div style="max-width: 1000px; margin: 0 auto;">
                
                <!-- State Header -->
                <div style="margin-bottom: 2rem;">
                    <div style="font-size: 0.8125rem; font-weight: 600; color: var(--status-mastered); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.35rem;">
                        Lessons Completed
                    </div>
                    <h1 style="font-size: 1.875rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem; letter-spacing: -0.02em;">
                        Ready to check your understanding?
                    </h1>
                    <p style="font-size: 1rem; color: var(--text-muted); max-width: 680px; line-height: 1.6;">
                        You've finished all recommended interactive lessons for <strong>${conceptCapitalized}</strong>. 
                        Take a post-learning understanding check to validate your schema mastery.
                    </p>
                </div>

                <!-- Primary Focus Surface: Start Post-Test -->
                <div class="focus-surface" style="border-left: 4px solid var(--primary); padding: 2rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; gap: 1.5rem; flex-wrap: wrap;">
                        <div style="flex: 1; min-width: 300px;">
                            <span class="badge badge-primary" style="margin-bottom: 0.75rem;">Post-Learning Assessment</span>
                            <h2 style="font-size: 1.35rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.4rem;">
                                ${conceptCapitalized} Understanding Check
                            </h2>
                            <p style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 1.25rem;">
                                15 curated questions evaluated by the Component 4 Machine Learning Pipeline to determine if you have fully mastered this topic.
                            </p>

                            <button type="button" class="btn btn-primary btn-lg" id="start-post-test-cta" style="font-weight: 700;">
                                Start Understanding Check <i class="fa-solid fa-arrow-right" style="margin-left: 0.4rem;"></i>
                            </button>
                        </div>

                        <div style="text-align: center; padding: 1.25rem 2rem; background: var(--bg-surface-subtle); border-radius: var(--radius-md); border: 1px solid var(--border-main);">
                            <div style="font-size: 0.75rem; color: var(--text-subtle); text-transform: uppercase; margin-bottom: 0.25rem;">Completed</div>
                            <div style="font-size: 1.5rem; font-weight: 800; color: var(--text-main);">3 of 3</div>
                            <div style="font-size: 0.75rem; color: var(--status-mastered); font-weight: 600;">Game Lessons Done</div>
                        </div>
                    </div>
                </div>

            </div>
        `;

        container.querySelector("#start-post-test-cta")?.addEventListener("click", () => {
            if (onNavigate) onNavigate("/student/assessments");
        });
        return;
    }

    // ── State 4: RESULT_READY ─────────────────────────────────────────
    if (currentState === "RESULT_READY") {
        const masteryLevel = postTestResult.mastery_level || "Mastered";
        const isMastered = masteryLevel.toLowerCase().includes("master");
        const nextAction = postTestResult.next_action || (isMastered ? "DONE" : "PRACTICE");

        container.innerHTML = `
            <div style="max-width: 1000px; margin: 0 auto;">
                
                <!-- State Header -->
                <div style="margin-bottom: 2rem;">
                    <div style="font-size: 0.8125rem; font-weight: 600; color: ${isMastered ? 'var(--status-mastered)' : 'var(--status-developing)'}; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.35rem;">
                        Post-Test Validated
                    </div>
                    <h1 style="font-size: 1.875rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem; letter-spacing: -0.02em;">
                        ${isMastered ? `You've mastered ${conceptCapitalized}!` : `You're developing mastery in ${conceptCapitalized}`}
                    </h1>
                    <p style="font-size: 1rem; color: var(--text-muted); max-width: 680px; line-height: 1.6;">
                        ${isMastered 
                            ? `Your post-learning understanding check confirmed full schema retention. You are ready to advance to Conditionals.`
                            : `You made significant progress. A brief review of loop exit conditions will solidify your understanding.`}
                    </p>
                </div>

                <!-- Primary Focus Surface -->
                <div class="focus-surface" style="border-left: 4px solid ${isMastered ? 'var(--status-mastered)' : 'var(--status-developing)'}; padding: 2rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; gap: 1.5rem; flex-wrap: wrap;">
                        <div>
                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                                <span class="badge ${isMastered ? 'badge-mastered' : 'badge-developing'}">${masteryLevel}</span>
                                <span style="font-size: 0.8125rem; color: var(--text-subtle);">Verified by Schema ML Model</span>
                            </div>
                            <h2 style="font-size: 1.25rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem;">
                                ${isMastered ? "Next Recommended Concept: Conditionals & Branching" : "Recommended: 5-Minute Targeted Practice"}
                            </h2>
                            <p style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 1.25rem;">
                                Diagnostic: <strong style="color: var(--status-developing);">Developing</strong> &rarr; Post-Test: <strong style="color: var(--status-mastered);">Mastered</strong>
                            </p>

                            <button type="button" class="btn btn-primary btn-lg" id="result-continue-cta" style="font-weight: 700;">
                                ${isMastered ? "Continue to Next Concept" : "Continue Practice"} <i class="fa-solid fa-arrow-right" style="margin-left: 0.4rem;"></i>
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        `;

        container.querySelector("#result-continue-cta")?.addEventListener("click", () => {
            if (onNavigate) onNavigate("/student/learning-path");
        });
        return;
    }
}
