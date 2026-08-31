/**
 * Component 2: Intelligent Error Pattern Detector — Diagnostic Dashboard
 * ======================================================================
 * Premium 3-column layout for research-grade error analysis.
 * Enhanced with: XAI Explanations (F2), Analytics (F1), Learning Report (F3).
 */

import { ErrorAPI } from "../api/api.js";
import { getCurrentUser } from "../utils/auth.js";
import Chart from "chart.js/auto";


let latestAnalysisResponse = null;
let liveAnalysisResponse = null;

function showTelemetryResult(res, isHistory = false) {
    if (!res || !res.prediction) return;
    latestAnalysisResponse = res;
    if (!isHistory) {
        liveAnalysisResponse = res;
    }

    const welcomeView = document.getElementById("welcome-view");
    if (welcomeView) welcomeView.classList.add("hidden");
    const invalidView = document.getElementById("invalid-view");
    if (invalidView) invalidView.classList.add("hidden");
    const resultView = document.getElementById("result-view");
    if (resultView) resultView.classList.remove("hidden");

    const historyBanner = document.getElementById("history-banner");
    if (historyBanner) {
        if (isHistory) historyBanner.classList.remove("hidden");
        else historyBanner.classList.add("hidden");
    }

    updateInsightEngine(res);
}

export async function renderErrorAnalysis(container) {
    const user = getCurrentUser();
    if (!user) {
        window.location.hash = "#/login";
        return;
    }
    const studentId = user.uid || user.id;

    if (_radarChart) {
        _radarChart.destroy();
        _radarChart = null;
    }
    if (_barChart) { _barChart.destroy(); _barChart = null; }

    container.innerHTML = `
        <div class="dashboard-wrapper" style="display: flex; flex-direction: column; gap: 1.5rem; height: 100%;">
            <!-- Top Stats Bar -->
            <div class="stats-bar card" style="display: flex; justify-content: space-around; padding: 1.2rem; border-radius: var(--radius); background: var(--bg-card); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);">
                <div class="stat-item" style="text-align: center;">
                    <div style="font-size: 0.7rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px;">Total Errors</div>
                    <div id="stat-total" style="font-size: 1.2rem; font-weight: 700; color: var(--accent-red);">0</div>
                </div>
                <div style="width: 1px; background: var(--border-color);"></div>
                <div class="stat-item" style="text-align: center;">
                    <div style="font-size: 0.7rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px;">Top Misconception</div>
                    <div id="stat-top-error" style="font-size: 1.2rem; font-weight: 700; color: var(--accent-orange);">None</div>
                </div>
                <div style="width: 1px; background: var(--border-color);"></div>
                <div class="stat-item" style="text-align: center;">
                    <div style="font-size: 0.7rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px;">System Status</div>
                    <div style="font-size: 1.2rem; font-weight: 700; color: var(--accent-green);">● Operational</div>
                </div>
            </div>

            <!-- Main Workspace: 2 Columns -->
            <div class="workspace-grid" style="display: grid; grid-template-columns: 1fr 350px; gap: 1.5rem; flex: 1; min-height: 600px;">
                
                <!-- Column 1: Live Telemetry Engine (Results) -->
                <div class="insight-col" id="insight-container">
                    <div id="welcome-view" style="height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; opacity: 0.5; text-align: center;">
                        <div style="font-size: 4rem; margin-bottom: 1rem;">📡</div>
                        <h2 style="color: var(--text-primary);">Awaiting Telemetry</h2>
                        <p style="color: var(--text-secondary); max-width: 300px;">Submit code from the Lab to generate real-time diagnostic insights.</p>
                    </div>

                    <div id="invalid-view" class="hidden" style="height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: left;">
                        <div class="card" style="background: rgba(239, 68, 68, 0.05); border: 2px solid #ef4444; padding: 2rem; max-width: 500px; border-radius: 12px;">
                            <div style="font-size: 3rem; margin-bottom: 1rem; text-align: center;">⚠️</div>
                            <h3 style="color: #ef4444; margin-top: 0; text-align: center;">Invalid Java Input</h3>
                            <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.5; margin-bottom: 1rem; text-align: center;">The detector is trained for Java beginner code submissions. Please enter a valid Java code snippet.</p>
                            
                            <div style="font-size: 0.8rem; color: var(--text-primary);">
                                <strong style="color: var(--accent-green);">Examples of accepted inputs:</strong>
                                <ul style="margin-top: 0.3rem; margin-bottom: 1rem; padding-left: 1.2rem; color: var(--text-secondary);">
                                    <li><code>public class Main { ... }</code></li>
                                    <li><code>int x = 5;</code></li>
                                    <li><code>int[] arr = {1,2,3};</code></li>
                                    <li><code>for(int i=0; i&lt;5; i++) { }</code></li>
                                    <li><code>while(i &lt; 5) { }</code></li>
                                    <li><code>static int add(int a, int b) { return a + b; }</code></li>
                                </ul>
                                
                                <strong style="color: var(--accent-orange);">Examples rejected:</strong>
                                <ul style="margin-top: 0.3rem; margin-bottom: 0; padding-left: 1.2rem; color: var(--text-secondary);">
                                    <li>hiii</li>
                                    <li>hello</li>
                                    <li>random words</li>
                                    <li>12345</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div id="result-view" class="hidden" style="display: flex; flex-direction: column; gap: 1.5rem;">
                        <!-- Top Header -->
                        <div style="display: flex; justify-content: space-between; align-items: flex-end; padding-bottom: 0.8rem; border-bottom: 2px solid var(--border-color);">
                            <div>
                                <div id="diag-label" style="font-size: 2rem; font-weight: 800; color: var(--text-primary); line-height: 1.2;">---</div>
                                <div id="diag-concept" style="color: var(--text-secondary); margin-top: 0.2rem; font-weight: 500;">Concept: ---</div>
                            </div>
                        </div>

                        <!-- Beginner-Friendly Insight & Repair Strategy (Top Priority) -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                            <!-- Pedagogical Insight -->
                            <div class="card" style="background: var(--primary-soft); border-left: 4px solid var(--primary); padding: 1.5rem;">
                                <div style="display: flex; align-items: flex-start; gap: 1rem;">
                                    <div>
                                        <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; color: var(--primary); font-weight: 700;">Beginner-Friendly Insight</h4>
                                        <p id="diag-insight" style="font-size: 0.95rem; color: var(--text-primary); line-height: 1.6; margin: 0;"></p>
                                    </div>
                                </div>
                            </div>

                            <!-- Repair Strategy -->
                            <div class="card" style="background: var(--success-soft); border-left: 4px solid var(--success); padding: 1.5rem;">
                                <div style="display: flex; align-items: flex-start; gap: 1rem;">
                                    <div>
                                        <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; color: var(--success); font-weight: 700;">Repair Strategy</h4>
                                        <p id="diag-fix" style="font-size: 0.95rem; line-height: 1.6; color: var(--text-primary); margin-bottom: 1rem;"></p>
                                        <div style="display: none;">
                                            <span id="diag-next-step"></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Recommended Game Activity Card -->
                        <div id="diag-game-card" class="card" style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 1.5rem; border-radius: var(--radius); cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease;" onmouseover="this.style.boxShadow='var(--shadow-md)'; this.style.transform='translateY(-2px)';" onmouseout="this.style.boxShadow='var(--shadow-sm)'; this.style.transform='none';">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
                                <div>
                                    <span class="badge" style="background: var(--warning-soft); color: var(--warning); margin-bottom: 0.5rem; display: inline-block;">
                                        <i class="fa-solid fa-gamepad"></i> Recommended Game Activity
                                    </span>
                                    <div id="diag-game-name" style="font-size: 1.4rem; font-weight: 800; color: var(--text-primary); margin: 0.2rem 0;">---</div>
                                    <div id="diag-game-meta" style="font-size: 0.9rem; color: var(--text-secondary);">---</div>
                                </div>
                                <button class="btn btn-primary" id="btn-start-game-inner" style="font-size: 1rem; padding: 0.8rem 1.5rem;">
                                    <i class="fa-solid fa-play"></i> Start Game Lesson
                                </button>
                            </div>
                            <!-- Hidden elements for JS compatibility -->
                            <span id="diag-badge" class="hidden"></span>
                        </div>

                        <!-- Secondary Info: Reason Diagnosis & XAI -->
                        <div style="display: grid; grid-template-columns: 1fr; gap: 1.5rem; margin-top: 0.5rem;">
                            <!-- Error Diagnosis -->
                            <div class="card" style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 1.5rem;">
                                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                                    <h4 style="margin: 0; font-size: 0.95rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">What Went Wrong?</h4>
                                </div>
                                <div style="display: none;">
                                    <span id="diag-broad-error"></span>
                                    <span id="diag-final-label"></span>
                                    <span id="diag-reason-group"></span>
                                    <div id="diag-badges"></div>
                                    <span id="diag-confidence"></span>
                                </div>
                                <p id="diag-reason" style="font-size: 0.95rem; line-height: 1.6; color: var(--text-primary);"></p>
                                <div style="margin-top: 1rem; font-size: 0.9rem; font-style: italic; color: var(--text-muted); padding-left: 1rem; border-left: 3px solid var(--border-color);">
                                    "Misconception: <span id="diag-miscon"></span>"
                                </div>
                            </div>
                        </div>

                        <!-- Alignment Notification -->
                        <div id="diag-alignment" style="padding: 1rem; border-radius: var(--radius-sm); font-size: 0.9rem; background: var(--bg-subtle); color: var(--text-secondary); text-align: center; display: none;"></div>


                    </div>
                </div>

                <!-- Column 3: The Record (History + Learning Report) -->
                <div class="record-col" style="display: flex; flex-direction: column; gap: 1.5rem;">
                    <div class="card" style="flex: 1; display: flex; flex-direction: column; overflow: hidden; background: var(--bg-card); border: 1px solid var(--border-color);">
                        <!-- Tab Bar -->
                        <div style="display: flex; gap: 0; border-bottom: 1px solid var(--border-color);">
                            <button id="tab-history-btn" onclick="" style="flex: 1; padding: 1rem; background: var(--primary-soft); border: none; border-bottom: 2px solid var(--primary); color: var(--primary); font-family: var(--font); font-size: 0.85rem; font-weight: 700; cursor: pointer; text-transform: uppercase; letter-spacing: 0.5px;"><i class="fa-solid fa-clock-rotate-left" style="margin-right: 0.4rem;"></i>History</button>
                            <button id="tab-report-btn" onclick="" style="flex: 1; padding: 1rem; background: none; border: none; border-bottom: 2px solid transparent; color: var(--text-secondary); font-family: var(--font); font-size: 0.85rem; font-weight: 600; cursor: pointer; text-transform: uppercase; letter-spacing: 0.5px;"><i class="fa-solid fa-chart-pie" style="margin-right: 0.4rem;"></i>Learning Report</button>
                        </div>
                        <!-- History Panel -->
                        <div id="history-panel" style="flex: 1; overflow-y: auto; padding: 1rem;">
                            <div id="history-container" style="display: flex; flex-direction: column; gap: 0.8rem;">
                                <div class="spinner" style="margin: 2rem auto;"></div>
                            </div>
                        </div>
                        <!-- Learning Report Panel (Feature 3) -->
                        <div id="report-panel" class="hidden" style="flex: 1; overflow-y: auto; padding: 1rem;">
                            <div id="report-container" style="display: flex; flex-direction: column; gap: 0.8rem;">
                                <div style="text-align: center; padding: 2rem; color: var(--text-secondary); font-size: 0.9rem;">
                                    Submit code to generate your Learning Report.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            </div>

            <!-- Feature 1: Analytics Dashboard (shown after ≥2 submissions) -->
            <div id="analytics-section" class="hidden" style="margin-top: 2rem;">
                <!-- Section Header -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding-bottom: 0.8rem; border-bottom: 2px solid var(--border-color);">
                    <div style="display: flex; align-items: center; gap: 0.8rem;">
                        <h3 style="margin: 0; font-size: 1.2rem; font-weight: 700; color: var(--text-primary);">Diagnostic Pre-Test Results</h3>
                        <span class="badge" style="background: var(--primary-soft); color: var(--primary);">Skill Profile</span>
                    </div>
                    <span style="font-size: 0.85rem; color: var(--text-secondary); font-style: italic;">Live single-session analysis</span>
                </div>
                <!-- 4 Stat Cards -->
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 1.5rem;">
                    <div class="card" style="padding: 1.5rem; border-top: 4px solid var(--accent-red); text-align: center; background: var(--bg-card); border-right: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); border-left: 1px solid var(--border-color);">
                        <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.8rem; font-weight: 600;">Total Errors</div>
                        <div id="anl-total" style="font-size: 1.8rem; font-weight: 800; color: var(--text-primary);">—</div>
                    </div>
                    <div class="card" style="padding: 1.5rem; border-top: 4px solid var(--success); text-align: center; background: var(--bg-card); border-right: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); border-left: 1px solid var(--border-color);">
                        <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.8rem; font-weight: 600;">Overall Mastery</div>
                        <div style="display: flex; align-items: baseline; justify-content: center; gap: 0.4rem;">
                            <div id="anl-mastery" style="font-size: 1.8rem; font-weight: 800; color: var(--text-primary);">—</div>
                        </div>
                    </div>
                    <div class="card" style="padding: 1.5rem; border-top: 4px solid var(--warning); text-align: center; background: var(--bg-card); border-right: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); border-left: 1px solid var(--border-color);">
                        <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.8rem; font-weight: 600;">Weakest Skill</div>
                        <div id="anl-worst" style="font-size: 1.8rem; font-weight: 800; color: var(--text-primary);">—</div>
                    </div>
                    <div class="card" style="padding: 1.5rem; border-top: 4px solid var(--success); text-align: center; background: var(--bg-card); border-right: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); border-left: 1px solid var(--border-color);">
                        <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.8rem; font-weight: 600;">Strongest Skill</div>
                        <div id="anl-best" style="font-size: 1.8rem; font-weight: 800; color: var(--text-primary);">—</div>
                    </div>
                </div>
                <!-- Charts Row -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                    <div class="card" style="padding: 1.5rem; background: var(--bg-card); border: 1px solid var(--border-color);">
                        <h4 style="margin: 0 0 1.2rem 0; font-size: 0.9rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">Skill Mastery Profile</h4>
                        <div style="position: relative; height: 250px;">
                            <canvas id="anl-radar-chart"></canvas>
                        </div>
                    </div>
                    <div class="card" style="padding: 1.5rem; background: var(--bg-card); border: 1px solid var(--border-color);">
                        <h4 style="margin: 0 0 1.2rem 0; font-size: 0.9rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">Errors by Category</h4>
                        <div style="position: relative; height: 250px;">
                            <canvas id="anl-bar-chart"></canvas>
                        </div>
                    </div>
                </div>
                <!-- Improvement Score Cards -->
                <div id="anl-improvement-cards" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-top: 1.5rem;"></div>
            </div>


        </div>
    `;

    const welcomeView = document.getElementById("welcome-view");
    const resultView = document.getElementById("result-view");

    // Check if latest analysis exists in sessionStorage from pre-test
    try {
        const cachedAnalysis = sessionStorage.getItem("latest_error_analysis");
        if (cachedAnalysis) {
            const parsed = JSON.parse(cachedAnalysis);
            if (parsed && parsed.prediction) {
                showTelemetryResult(parsed);
            }
        }
    } catch (e) { }

    // Load initial stats and history
    refreshGlobalState(studentId);

    // --- Live Telemetry Fetch ---
    let lastPolledTimestamp = null;
    async function pollLatestTelemetry() {
        try {
            const res = await ErrorAPI.getLatest(studentId);
            if (res && res.prediction) {
                if (res.timestamp !== lastPolledTimestamp) {
                    lastPolledTimestamp = res.timestamp;
                    showTelemetryResult(res);
                }
            }
        } catch (err) {
            // Silently ignore during initial mount
        }
    }

    // Load telemetry once on mount without continuous background polling
    pollLatestTelemetry();


    // ---- Tab switching (History / Learning Report) ----
    document.getElementById("tab-history-btn").addEventListener("click", () => {
        document.getElementById("history-panel").classList.remove("hidden");
        document.getElementById("report-panel").classList.add("hidden");
        document.getElementById("tab-history-btn").style.cssText += "background:rgba(74,144,226,0.1);border-bottom-color:var(--accent-blue);color:var(--accent-blue);";
        document.getElementById("tab-report-btn").style.cssText += "background:none;border-bottom-color:transparent;color:var(--text-secondary);";
    });
    document.getElementById("tab-report-btn").addEventListener("click", () => {
        document.getElementById("history-panel").classList.add("hidden");
        document.getElementById("report-panel").classList.remove("hidden");
        document.getElementById("tab-report-btn").style.cssText += "background:rgba(139,92,246,0.1);border-bottom-color:#8b5cf6;color:#a78bfa;";
        document.getElementById("tab-history-btn").style.cssText += "background:none;border-bottom-color:transparent;color:var(--text-secondary);";
    });

}


function updateInsightEngine(data) {
    const pred = data.prediction;
    const expl = data.explanation;
    const gamify = data.gamification_payload;
    const schema = data.schema_mastery_payload;
    const adaptive = data.adaptive_payload;

    // Colors
    const colors = {
        "LOOP_ERROR": "var(--primary)",
        "VARIABLE_ERROR": "var(--warning)",
        "ARRAY_ERROR": "var(--secondary)",
        "METHOD_ERROR": "var(--danger)",
        "CORRECT": "var(--success)"
    };
    const color = colors[pred.label] || "var(--primary)";

    // Update UI
    const diagLabel = document.getElementById("diag-label");
    diagLabel.textContent = pred.label;
    diagLabel.style.color = color;

    document.getElementById("diag-concept").textContent = `Concept: ${pred.concept}`;

    document.getElementById("diag-broad-error").textContent = data.original_ml_label || data.broad_label || "N/A";
    document.getElementById("diag-final-label").textContent = data.final_label || data.prediction?.label || "N/A";
    document.getElementById("diag-reason-group").textContent = data.reason_group_final || data.reason_group || "N/A";

    let badgesHtml = "";
    if (data.hybrid_correction_badge === "Validated as Correct") {
        badgesHtml += `<span style="font-size: 0.65rem; background: rgba(34, 197, 94, 0.1); color: #22c55e; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(34, 197, 94, 0.3);">Validated as Correct</span>`;
    } else if (data.override_applied) {
        badgesHtml += `<span style="font-size: 0.65rem; background: rgba(245, 158, 11, 0.1); color: #f59e0b; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(245, 158, 11, 0.3);">Corrected by Safety Validation</span>`;
    }
    if (data.reason_group_adjusted) {
        badgesHtml += `<span style="font-size: 0.65rem; background: rgba(245, 158, 11, 0.1); color: #f59e0b; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(245, 158, 11, 0.3);">Reason Group Adjusted</span>`;
    }
    document.getElementById("diag-badges").innerHTML = badgesHtml;



    const confBadge = document.getElementById("diag-confidence");
    confBadge.textContent = `${pred.confidence_level} Confidence`;
    confBadge.style.background = pred.confidence_level === "High" ? "rgba(34, 197, 94, 0.1)" : "rgba(245, 158, 11, 0.1)";
    confBadge.style.color = pred.confidence_level === "High" ? "#34d399" : "#f59e0b";

    document.getElementById("diag-reason").textContent = expl.reason;
    document.getElementById("diag-miscon").textContent = expl.misconception;
    document.getElementById("diag-fix").textContent = expl.suggested_fix;
    document.getElementById("diag-next-step").textContent = adaptive.next_learning_step;
    document.getElementById("diag-insight").textContent = expl.beginner_explanation;

    const ERROR_TO_GAME = {
        "ARRAY_ERROR": { category: "arrays", module: "arrays", title: "Array Index Rescue Game (Array Mastery Module)" },
        "LOOP_ERROR": { category: "loops", module: "loops", title: "Loop Train Express (For Loop Mastery Module)" },
        "VARIABLE_ERROR": { category: "variables", module: "integer", title: "Variable Tracker Arena (Integer Mastery Module)" },
        "METHOD_ERROR": { category: "methods", module: "stringmethods", title: "Method Mastery Wing (String Methods)" },
        "OPERATOR_ERROR": { category: "operators", module: "operators", title: "Operator Mastery Academy" },
        "CORRECT": { category: "variables", module: "integer", title: "Java Foundation Arena" }
    };

    const gameTarget = ERROR_TO_GAME[pred.label] || { category: "arrays", module: "arrays", title: gamify.recommended_activity || "Array Index Rescue Game" };

    document.getElementById("diag-game-name").textContent = gameTarget.title || gamify.recommended_activity;
    document.getElementById("diag-game-meta").textContent = `${gamify.game_type || "Interactive Challenge"} • ${gamify.difficulty || "Adaptive"} intensity • Target: ${pred.concept || "Core Java"}`;
    document.getElementById("diag-badge").textContent = `Reward: ${gamify.reward_badge || "Mastery Badge"}`;

    const launchTargetGame = () => {
        const section = gameTarget.module || "arrays";
        const url = new URL(window.location.href);
        url.hash = `#/student/game-player?module=${encodeURIComponent(section)}`;
        url.search = "";
        window.open(url.toString(), "_blank", "noopener,noreferrer");
    };

    // Wire game card inner button and card click
    document.getElementById("btn-start-game-inner")?.addEventListener("click", (e) => {
        e.stopPropagation();
        launchTargetGame();
    });

    const gameCard = document.getElementById("diag-game-card");
    if (gameCard) {
        const fresh = gameCard.cloneNode(true);
        gameCard.parentNode.replaceChild(fresh, gameCard);
        fresh.addEventListener("click", launchTargetGame);
    }

    document.getElementById("diag-alignment").textContent = data.pretest_alignment.message;

    // ── Feature 2: Populate XAI Explanation Card ──────────────────────────
    // XAI Explanation Card removed per design update.
}

// Chart.js instance references — destroyed and recreated on each refresh
let _radarChart = null;
let _barChart = null;

async function refreshGlobalState(studentId) {
    try {
        const [historyRes, summaryRes, analyticsRes, reportRes] = await Promise.allSettled([
            ErrorAPI.getHistory(studentId),
            ErrorAPI.getSummary(studentId),
            ErrorAPI.getAnalytics(studentId),
            ErrorAPI.getLearningReport(studentId),
        ]);

        const historyData = historyRes.status === "fulfilled" ? historyRes.value : { total: 0, history: [] };
        const summaryData = summaryRes.status === "fulfilled" ? summaryRes.value : { total_analyses: 0, most_frequent_error: "None" };
        const analyticsData = analyticsRes.status === "fulfilled" ? analyticsRes.value : { has_data: false };
        const reportData = reportRes.status === "fulfilled" ? reportRes.value : { has_data: false };

        const errorHistory = historyData.history ? historyData.history.filter(item => item.label !== "CORRECT") : [];
        const trueTotalErrors = Object.values(summaryData.counts || {}).reduce((a, b) => a + b, 0);

        // ── Stats Bar ─────────────────────────────────────────────────
        const statTotal = document.getElementById("stat-total");
        if (statTotal) statTotal.textContent = trueTotalErrors;
        const statTopError = document.getElementById("stat-top-error");
        if (statTopError) statTopError.textContent = summaryData.most_frequent_error || "None";

        // ── History List ──────────────────────────────────────────────
        const histCont = document.getElementById("history-container");
        
        if (errorHistory.length === 0) {
            histCont.innerHTML = `<div style="text-align:center; padding: 2rem; color: var(--text-secondary); font-size: 0.8rem;">No error entries found.</div>`;
        } else {
            histCont.innerHTML = "";
            // Count frequencies
            const counts = {};
            errorHistory.forEach(item => {
                counts[item.label] = (counts[item.label] || 0) + 1;
            });
            
            // Sort by frequency descending, then timestamp descending (newest first)
            const sortedHistory = [...errorHistory].sort((a, b) => {
                if (counts[a.label] !== counts[b.label]) {
                    return counts[b.label] - counts[a.label];
                }
                return b.timestamp - a.timestamp;
            });

            sortedHistory.forEach((item, index) => {
                const el = document.createElement("div");
                const isSuggested = index === 0;
                if (isSuggested) el.dataset.suggested = "true";
                el.dataset.code = encodeURIComponent(item.code || "");
                
                const baseBg = isSuggested ? "rgba(245, 158, 11, 0.1)" : "rgba(255,255,255,0.03)";
                const baseBorder = isSuggested ? "rgba(245, 158, 11, 0.3)" : "rgba(255,255,255,0.05)";
                const hoverBg = isSuggested ? "rgba(245, 158, 11, 0.15)" : "rgba(255,255,255,0.06)";

                el.style.cssText = `padding: 0.6rem 0.8rem; background: ${baseBg}; border-radius: 6px; border: 1px solid ${baseBorder}; cursor: pointer; transition: background 0.2s, border-color 0.2s;`;
                const suggestedBadge = isSuggested ? `<span style="background: var(--accent-orange); color: white; padding: 2px 6px; border-radius: 4px; margin-right: 8px; font-size: 0.55rem; text-transform: uppercase; letter-spacing: 0.5px;">Suggested</span>` : '';

                el.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                        <span style="font-weight: 700; font-size: 0.65rem; color: ${isSuggested ? 'var(--accent-orange)' : '#4a90e2'}; display: flex; align-items: center;">
                            ${suggestedBadge}
                            ${item.label}
                        </span>
                        <span style="font-size: 0.6rem; color: var(--text-secondary);">${new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div style="font-size: 0.75rem; color: var(--text-primary);">${item.concept}</div>
                `;
                el.addEventListener("mouseover", () => {
                    if (!el.dataset.selected) el.style.background = hoverBg;
                });
                el.addEventListener("mouseout", () => {
                    if (!el.dataset.selected) el.style.background = baseBg;
                });
                el.addEventListener("click", async () => {
                    // Deselect all items
                    histCont.querySelectorAll("[data-selected]").forEach(prev => {
                        delete prev.dataset.selected;
                        const wasSuggested = prev.dataset.suggested === "true";
                        prev.style.background = wasSuggested ? "rgba(245, 158, 11, 0.1)" : "rgba(255,255,255,0.03)";
                        prev.style.borderColor = wasSuggested ? "rgba(245, 158, 11, 0.3)" : "rgba(255,255,255,0.05)";
                    });
                    // Highlight selected
                    el.dataset.selected = "1";
                    el.style.background = "rgba(74, 144, 226, 0.12)";
                    el.style.borderColor = "rgba(74, 144, 226, 0.4)";

                    // Use cached full_response if available, otherwise re-analyze
                    if (item.full_response) {
                        // Re-use the main flow to ensure all modals + states are updated properly
                        showTelemetryResult(item.full_response, true);
                    } else {
                        const rawCode = decodeURIComponent(el.dataset.code || "");
                        if (rawCode) {
                            try {
                                const res = await ErrorAPI.analyze({
                                    student_id: studentId,
                                    code: rawCode,
                                    pretest_results: { variables: 3, loops: 3, arrays: 3, methods: 3 }
                                });
                                if (res && res.prediction) {
                                    showTelemetryResult(res, true);
                                }
                            } catch (e) {
                                console.warn("Failed to load history item telemetry", e);
                            }
                        }
                    }
                });
                histCont.appendChild(el);
            });

            // Automatically populate telemetry with the latest item if telemetry is currently empty
            if (!latestAnalysisResponse && historyData.history.length > 0) {
                const latestEntry = historyData.history[historyData.history.length - 1];
                if (latestEntry && latestEntry.code) {
                    ErrorAPI.analyze({
                        student_id: studentId,
                        code: latestEntry.code,
                        pretest_results: { variables: 3, loops: 3, arrays: 3, methods: 3 }
                    }).then(res => {
                        if (res && res.prediction && !latestAnalysisResponse) {
                            showTelemetryResult(res);
                        }
                    }).catch(() => { });
                }
            }
        }


        // ── Feature 1: Analytics Dashboard ────────────────────────────
        if (analyticsData.has_data && analyticsData.total_submissions >= 2) {
            document.getElementById("analytics-section").classList.remove("hidden");
            const anl = analyticsData;

            // Stat cards
            document.getElementById("anl-total").textContent = trueTotalErrors;
            const labelShort = { LOOP_ERROR: "Loops", VARIABLE_ERROR: "Variables", ARRAY_ERROR: "Arrays", METHOD_ERROR: "Methods" };
            const allCatsArr = ["ARRAY_ERROR", "LOOP_ERROR", "METHOD_ERROR", "VARIABLE_ERROR"];
            const catMasteries = allCatsArr.map(cat => Math.max(0, 100 - (summaryData.counts[cat] || 0) * 15));
            const overallMastery = Math.round(catMasteries.reduce((a, b) => a + b, 0) / 4);
            
            const anlMasteryEl = document.getElementById("anl-mastery");
            if (anlMasteryEl) {
                anlMasteryEl.textContent = `${overallMastery}%`;
                anlMasteryEl.style.color = overallMastery >= 75 ? "var(--success)" : (overallMastery >= 50 ? "var(--warning)" : "var(--accent-red)");
            }

            let bestCat = allCatsArr[0];
            let bestScore = -1;
            for (let i = 0; i < allCatsArr.length; i++) {
                if (catMasteries[i] > bestScore) {
                    bestScore = catMasteries[i];
                    bestCat = allCatsArr[i];
                }
            }
            document.getElementById("anl-best").innerHTML = bestScore === 100 ? `${labelShort[bestCat]} <i class="fa-solid fa-award" style="color: var(--warning); font-size: 1.2rem; margin-left: 0.4rem;"></i>` : labelShort[bestCat];
            document.getElementById("anl-worst").textContent = anl.most_problematic ? labelShort[anl.most_problematic] || anl.most_problematic : "None";

            // Skill Mastery Cards (Bottom Row)
            const catColors = { LOOP_ERROR: "#a78bfa", VARIABLE_ERROR: "#f59e0b", ARRAY_ERROR: "#34d399", METHOD_ERROR: "#f472b6" };
            const allCats = ["ARRAY_ERROR", "LOOP_ERROR", "METHOD_ERROR", "VARIABLE_ERROR"];
            document.getElementById("anl-improvement-cards").innerHTML = allCats.map(cat => {
                const col = catColors[cat] || "#4a90e2";
                const errorCount = summaryData.counts[cat] || 0;
                const mastery = Math.max(0, 100 - errorCount * 15);
                return `
                    <div class="card" style="padding:0.8rem; border-left: 3px solid ${col}; background: var(--bg-card); border-right: 1px solid var(--border-color); border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color);">
                        <div style="font-size:0.65rem;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:0.3rem;font-weight:700;">${labelShort[cat]}</div>
                        <div style="display:flex;align-items:baseline;gap:0.4rem;margin-bottom:0.2rem;">
                            <span style="font-size:1.5rem;font-weight:800;color:${col};">${mastery}%</span>
                            <span style="font-size:0.75rem;color:var(--text-secondary);font-weight:600;text-transform:uppercase;">Mastery</span>
                        </div>
                        <div style="font-size:0.75rem;color:var(--text-primary);font-weight:600; background:var(--bg-body); display:inline-block; padding:0.2rem 0.5rem; border-radius:4px; border:1px solid var(--border-color);">${errorCount} Error${errorCount === 1 ? '' : 's'}</div>
                    </div>`;
            }).join("");

            // ── Radar chart: Skill Mastery Profile ──────────────────────
            const radarCtx = document.getElementById("anl-radar-chart");
            if (radarCtx) {
                const masteryScores = [
                    Math.max(0, 100 - (summaryData.counts["ARRAY_ERROR"] || 0) * 15),
                    Math.max(0, 100 - (summaryData.counts["LOOP_ERROR"] || 0) * 15),
                    Math.max(0, 100 - (summaryData.counts["METHOD_ERROR"] || 0) * 15),
                    Math.max(0, 100 - (summaryData.counts["VARIABLE_ERROR"] || 0) * 15),
                ];

                if (_radarChart) {
                    _radarChart.data.datasets[0].data = masteryScores;
                    _radarChart.update('none');
                } else {
                    _radarChart = new Chart(radarCtx, {
                        type: "radar",
                        data: {
                            labels: ["Arrays", "Loops", "Methods", "Variables"],
                            datasets: [{
                                label: "Mastery %",
                                data: masteryScores,
                                backgroundColor: "rgba(52, 211, 153, 0.4)",
                                borderColor: "#34d399",
                                pointBackgroundColor: "#34d399",
                                pointBorderColor: "#fff",
                                pointHoverBackgroundColor: "#fff",
                                pointHoverBorderColor: "#34d399",
                                borderWidth: 2
                            }]
                        },
                        options: {
                            responsive: true, maintainAspectRatio: false,
                            scales: {
                                r: {
                                    angleLines: { color: "var(--border-color)" },
                                    grid: { color: "var(--border-color)" },
                                    pointLabels: { font: { family: 'Inter', size: 12, weight: 600 }, color: "var(--text-secondary)" },
                                    ticks: { display: false, min: 0, max: 100, stepSize: 25 }
                                }
                            },
                            plugins: {
                                legend: { display: false },
                                tooltip: {
                                    callbacks: {
                                        label: function(context) { return context.raw + "% Mastery"; }
                                    }
                                }
                            }
                        }
                    });
                }
            }

            // ── Bar chart: errors by category ──────────────────────────
            const catLabels = Object.keys(anl.total_counts || {}).map(k => labelShort[k] || k);
            const catValues = Object.values(anl.total_counts || {});
            const barColors = Object.keys(anl.total_counts || {}).map(k => catColors[k] || "#4a90e2");

            const barCtx = document.getElementById("anl-bar-chart");
            if (barCtx) {
                if (_barChart) {
                    // Update in-place for smooth re-render (no destroy = no shake)
                    _barChart.data.labels = catLabels;
                    _barChart.data.datasets[0].data = catValues;
                    _barChart.data.datasets[0].backgroundColor = barColors.map(c => c + "55");
                    _barChart.data.datasets[0].borderColor = barColors;
                    _barChart.update('none');
                } else {
                    _barChart = new Chart(barCtx, {
                        type: "bar",
                        data: {
                            labels: catLabels,
                            datasets: [{
                                label: "Total Errors",
                                data: catValues,
                                backgroundColor: barColors.map(c => c + "55"),
                                borderColor: barColors,
                                borderWidth: 2,
                                borderRadius: 6,
                            }],
                        },
                        options: {
                            responsive: true, maintainAspectRatio: false,
                            animation: { duration: 400 },
                            plugins: { legend: { display: false } },
                            scales: {
                                x: { ticks: { color: "#8899aa", font: { size: 10 } }, grid: { display: false } },
                                y: { ticks: { color: "#8899aa", font: { size: 9 }, stepSize: 1 }, grid: { color: "rgba(255,255,255,0.04)" }, beginAtZero: true },
                            },
                        },
                    });
                }
            }
        }

        // ── Feature 3: Learning Report ────────────────────────────────
        const reportCont = document.getElementById("report-container");
        if (reportData && reportData.has_data) {
            const r = reportData;
            const section = (title, items, emptyMsg) => {
                if (!items || items.length === 0) return "";
                return `
                    <div style="margin-bottom:0.6rem;">
                        <div style="font-size:0.65rem;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.8px;margin-bottom:0.4rem;font-weight:700;">${title}</div>
                        ${items.map(item => `
                            <div style="display:flex;align-items:flex-start;gap:0.4rem;padding:0.4rem 0.6rem;border-radius:6px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);margin-bottom:0.3rem;">
                                <span style="flex-shrink:0;font-size:0.9rem;">${item.icon}</span>
                                <span style="font-size:0.75rem;color:var(--text-primary);line-height:1.4;">${item.message}</span>
                            </div>
                        `).join("")}
                    </div>`;
            };

            const focusSection = r.recommended_focus.length > 0 ? `
                <div style="margin-bottom:0.6rem;">
                    <div style="font-size:0.65rem;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.8px;margin-bottom:0.4rem;font-weight:700;">🎯 Focus Next On</div>
                    ${r.recommended_focus.map(f => `
                        <div style="padding:0.5rem 0.6rem;border-radius:6px;background:rgba(74,144,226,0.05);border:1px solid rgba(74,144,226,0.15);margin-bottom:0.4rem;">
                            <div style="font-size:0.75rem;font-weight:700;color:var(--accent-blue);margin-bottom:0.3rem;">${f.concept}</div>
                            ${f.topics.map(t => `<div style="font-size:0.7rem;color:var(--text-secondary);">• ${t}</div>`).join("")}
                        </div>
                    `).join("")}
                </div>` : "";

            const avoidSection = r.avoid_patterns.length > 0 ? `
                <div>
                    <div style="font-size:0.65rem;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.8px;margin-bottom:0.4rem;font-weight:700;">🚫 Avoid</div>
                    ${r.avoid_patterns.slice(0, 4).map(p => `
                        <div style="font-size:0.7rem;color:#ef4444;padding:0.25rem 0.5rem;background:rgba(239,68,68,0.05);border-radius:4px;margin-bottom:0.25rem;border:1px solid rgba(239,68,68,0.12);">✗ ${p.text}</div>
                    `).join("")}
                </div>` : "";

            reportCont.innerHTML = `
                <!-- Summary -->
                <div style="padding:0.8rem;border-radius:8px;background:linear-gradient(135deg,rgba(74,144,226,0.08),rgba(139,92,246,0.05));border:1px solid rgba(74,144,226,0.2);margin-bottom:0.8rem;">
                    <div style="font-size:0.65rem;color:var(--accent-blue);text-transform:uppercase;letter-spacing:0.8px;margin-bottom:0.3rem;font-weight:700;">📝 Summary</div>
                    <p style="font-size:0.78rem;color:var(--text-primary);line-height:1.5;margin:0;">${r.summary}</p>
                </div>
                ${section("💪 Strengths", r.strengths)}
                ${section("⚠️ Recurring Mistakes", r.recurring_mistakes)}
                ${section("📈 Recently Improved", r.recently_improved)}
                ${section("🆕 New Mistakes", r.new_mistakes)}
                ${focusSection}
                ${avoidSection}
            `;
        } else {
            reportCont.innerHTML = `<div style="text-align:center;padding:2rem;color:var(--text-secondary);font-size:0.8rem;">Submit more code to generate your Learning Report.</div>`;
        }

    } catch (err) {
        console.warn("Global state sync failed", err);
        const histCont = document.getElementById("history-container");
        if (histCont && histCont.querySelector(".spinner")) {
            histCont.innerHTML = `<div style="text-align:center; padding: 2rem; color: var(--text-secondary); font-size: 0.8rem;">No entries found in registry.</div>`;
        }
    }
}
