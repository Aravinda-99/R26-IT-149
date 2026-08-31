/**
 * Component 2: Intelligent Error Pattern Detector — Diagnostic Dashboard
 * ======================================================================
 * Premium 3-column layout for research-grade error analysis.
 * Enhanced with: XAI Explanations (F2), Analytics (F1), Learning Report (F3).
 */

import { ErrorAPI, SchemaMasteryAPI } from "../api/api.js";
import { getCurrentUser } from "../utils/auth.js";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);


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

    // Persist to backend Learning Session for Component 4 Understanding Check
    const user = getCurrentUser();
    const studentId = user?.uid || user?.id;
    if (studentId) {
        const errType = res.reason_group || res.predicted_label || res.prediction || "UNKNOWN_ERROR";
        const confRaw = res.confidence_score !== undefined ? res.confidence_score : (res.confidence !== undefined ? res.confidence : 80);
        const confVal = (Number(confRaw) || 80) / 100.0;
        const reasonText = res.explanation?.misconception || res.explanation?.reason || "";
        SchemaMasteryAPI.saveComponent2({
            student_id: studentId,
            error_type: errType,
            error_pattern_score: confVal,
            error_reason: reasonText
        }).catch(err => console.warn("Failed to persist Component 2 learning session:", err));
    }
}

export async function renderErrorAnalysis(container) {
    const user = getCurrentUser();
    if (!user) {
        window.location.hash = "#/login";
        return;
    }
    const studentId = user.uid || user.id;

    _lineChart = null;
    _barChart = null;

    container.innerHTML = `
        <div class="dashboard-wrapper" style="display: flex; flex-direction: column; gap: 1.5rem; min-height: 100%; padding-bottom: 3rem;">
            <!-- Top Stats Bar -->
            <div class="stats-bar card" style="display: flex; justify-content: space-around; padding: 1.2rem; border-radius: var(--radius); background: var(--bg-card); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);">
                <div class="stat-item" style="text-align: center;">
                    <div style="font-size: 0.7rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px;">Total Errors</div>
                    <div id="stat-total" style="font-size: 1.2rem; font-weight: 700; color: var(--accent-blue);">0</div>
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
            <div class="workspace-grid" style="flex: 1; min-height: 500px;">
                
                <!-- Column 1: Live Telemetry Engine (Results) -->
                <div class="insight-col" id="insight-container" style="min-width: 0;">
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

                            <!-- Fix Hint -->
                            <div class="card" style="background: var(--success-soft); border-left: 4px solid var(--success); padding: 1.5rem;">
                                <div style="display: flex; align-items: flex-start; gap: 1rem;">
                                    <div>
                                        <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; color: var(--success); font-weight: 700;">Fix Hint</h4>
                                        <p id="diag-fix" style="font-size: 0.95rem; line-height: 1.6; color: var(--text-primary); margin: 0;"></p>
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
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 0.5rem;">
                            <!-- Reason Diagnosis -->
                            <div class="card" style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 1.5rem;">
                                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                                    <h4 style="margin: 0; font-size: 0.95rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">Reason Diagnosis</h4>
                                </div>
                                <div style="margin-bottom: 1rem; font-size: 0.85rem; color: var(--text-secondary);">
                                    <strong>Original Broad Prediction:</strong> <span id="diag-broad-error">---</span><br>
                                    <strong>Final Diagnosis:</strong> <span id="diag-final-label">---</span><br>
                                    <strong>Final Reason Group:</strong> <span id="diag-reason-group">---</span>
                                </div>
                                <div id="diag-badges" style="display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap;"></div>
                                <p id="diag-reason" style="font-size: 0.95rem; line-height: 1.6; color: var(--text-primary);"></p>
                                <div style="margin-top: 1rem; font-size: 0.9rem; font-style: italic; color: var(--text-muted); padding-left: 1rem; border-left: 3px solid var(--border-color);">
                                    "Misconception: <span id="diag-miscon"></span>"
                                </div>
                            </div>
                            
                            <!-- XAI Explanation Card -->
                            <div id="xai-card" class="card" style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 1.5rem;">
                                <div id="xai-label" style="font-size: 1rem; font-weight: 700; color: var(--primary); margin-bottom: 0.5rem;">—</div>
                                <p id="xai-narrative" style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 1rem;"></p>
                                <div id="xai-bullets" style="display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 0.8rem;"></div>
                                <div id="xai-signals" style="display: flex; flex-wrap: wrap; gap: 0.4rem;"></div>
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
                            <button id="tab-history-btn" onclick="" style="flex: 1; padding: 1rem; background: var(--primary-soft); border: none; border-bottom: 2px solid var(--primary); color: var(--primary); font-family: var(--font); font-size: 0.85rem; font-weight: 700; cursor: pointer; text-transform: uppercase; letter-spacing: 0.5px;"><i class="fa-solid fa-triangle-exclamation" style="margin-right: 0.4rem;"></i>Errors</button>
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

            <!-- Analytics Dashboard -->
            <div id="analytics-section" style="margin-top: 2rem;">
                <!-- Section Header -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding-bottom: 0.8rem; border-bottom: 2px solid var(--border-color);">
                    <div style="display: flex; align-items: center; gap: 0.8rem;">
                        <h3 style="margin: 0; font-size: 1.2rem; font-weight: 700; color: var(--text-primary);">Error Progression Analytics</h3>
                    </div>
                    <span style="font-size: 0.85rem; color: var(--text-secondary); font-style: italic;">Performance trends and breakdown</span>
                </div>
                <!-- 4 Stat Cards -->
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 1.5rem;">
                    <div class="card" style="padding: 1.5rem; border-top: 4px solid var(--primary); text-align: center; background: var(--bg-card); border-right: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); border-left: 1px solid var(--border-color);">
                        <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.8rem; font-weight: 600;">Total Submissions</div>
                        <div id="anl-total" style="font-size: 2.2rem; font-weight: 800; color: var(--text-primary);">—</div>
                    </div>
                    <div class="card" style="padding: 1.5rem; border-top: 4px solid var(--success); text-align: center; background: var(--bg-card); border-right: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); border-left: 1px solid var(--border-color);">
                        <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.8rem; font-weight: 600;">Accuracy Rate</div>
                        <div style="display: flex; align-items: baseline; justify-content: center; gap: 0.4rem;">
                            <div id="anl-improvement" style="font-size: 2.2rem; font-weight: 800; color: var(--text-primary);">—</div>
                            <span id="anl-improvement-arrow" style="font-size: 1.4rem;"></span>
                        </div>
                    </div>
                    <div class="card" style="padding: 1.5rem; border-top: 4px solid var(--warning); text-align: center; background: var(--bg-card); border-right: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); border-left: 1px solid var(--border-color);">
                        <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.8rem; font-weight: 600;">Most Problematic</div>
                        <div id="anl-worst" style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary);">—</div>
                    </div>
                    <div class="card" style="padding: 1.5rem; border-top: 4px solid var(--secondary); text-align: center; background: var(--bg-card); border-right: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); border-left: 1px solid var(--border-color);">
                        <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.8rem; font-weight: 600;">Strongest Skill</div>
                        <div id="anl-best" style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary);">—</div>
                    </div>
                </div>
                <!-- Charts Row -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                    <div class="card" style="padding: 1.5rem; background: var(--bg-card); border: 1px solid var(--border-color);">
                        <h4 style="margin: 0 0 1.2rem 0; font-size: 0.9rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">Performance Breakdown</h4>
                        <div style="position: relative; height: 260px; width: 100%;">
                            <canvas id="anl-line-chart"></canvas>
                        </div>
                    </div>
                    <div class="card" style="padding: 1.5rem; background: var(--bg-card); border: 1px solid var(--border-color);">
                        <h4 style="margin: 0 0 1.2rem 0; font-size: 0.9rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">Errors by Category</h4>
                        <div style="position: relative; height: 260px; width: 100%;">
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
    if (diagLabel) {
        diagLabel.textContent = pred?.label || "Analysis";
        diagLabel.style.color = color;
    }

    const diagConcept = document.getElementById("diag-concept");
    if (diagConcept) diagConcept.textContent = `Concept: ${pred?.concept || "General"}`;

    const diagBroad = document.getElementById("diag-broad-error");
    if (diagBroad) diagBroad.textContent = data.original_ml_label || data.broad_label || "N/A";
    const diagFinal = document.getElementById("diag-final-label");
    if (diagFinal) diagFinal.textContent = data.final_label || data.prediction?.label || "N/A";
    const diagReasonGroup = document.getElementById("diag-reason-group");
    if (diagReasonGroup) diagReasonGroup.textContent = data.reason_group_final || data.reason_group || "N/A";

    const diagBadges = document.getElementById("diag-badges");
    if (diagBadges) {
        let badgesHtml = "";
        if (data.hybrid_correction_badge === "Validated as Correct") {
            badgesHtml += `<span style="font-size: 0.65rem; background: rgba(34, 197, 94, 0.1); color: #22c55e; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(34, 197, 94, 0.3);">Validated as Correct</span>`;
        } else if (data.override_applied) {
            badgesHtml += `<span style="font-size: 0.65rem; background: rgba(245, 158, 11, 0.1); color: #f59e0b; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(245, 158, 11, 0.3);">Corrected by Safety Validation</span>`;
        }
        if (data.reason_group_adjusted) {
            badgesHtml += `<span style="font-size: 0.65rem; background: rgba(245, 158, 11, 0.1); color: #f59e0b; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(245, 158, 11, 0.3);">Reason Group Adjusted</span>`;
        }
        diagBadges.innerHTML = badgesHtml;
    }

    const confBadge = document.getElementById("diag-confidence");
    if (confBadge) {
        confBadge.textContent = `${pred?.confidence_level || "Medium"} Confidence`;
        confBadge.style.background = pred?.confidence_level === "High" ? "rgba(34, 197, 94, 0.1)" : "rgba(245, 158, 11, 0.1)";
        confBadge.style.color = pred?.confidence_level === "High" ? "#34d399" : "#f59e0b";
    }

    const diagReason = document.getElementById("diag-reason");
    if (diagReason) diagReason.textContent = expl?.reason || "";

    const diagMiscon = document.getElementById("diag-miscon");
    if (diagMiscon) diagMiscon.textContent = expl?.misconception || "";

    const diagFix = document.getElementById("diag-fix");
    if (diagFix) diagFix.textContent = expl?.suggested_fix || "";

    const diagNextStep = document.getElementById("diag-next-step");
    if (diagNextStep) diagNextStep.textContent = adaptive?.next_learning_step || "";

    const diagInsight = document.getElementById("diag-insight");
    if (diagInsight) diagInsight.textContent = expl?.beginner_explanation || "";

    const ERROR_TO_GAME = {
        "ARRAY_ERROR": { category: "arrays", module: "arrays", title: "Array Index Rescue Game (Array Mastery Module)" },
        "LOOP_ERROR": { category: "loops", module: "loops", title: "Loop Train Express (For Loop Mastery Module)" },
        "VARIABLE_ERROR": { category: "variables", module: "integer", title: "Variable Tracker Arena (Integer Mastery Module)" },
        "METHOD_ERROR": { category: "methods", module: "stringmethods", title: "Method Mastery Wing (String Methods)" },
        "OPERATOR_ERROR": { category: "operators", module: "operators", title: "Operator Mastery Academy" },
        "CORRECT": { category: "variables", module: "integer", title: "Java Foundation Arena" }
    };

    const gameTarget = ERROR_TO_GAME[pred?.label] || { category: "arrays", module: "arrays", title: gamify?.recommended_activity || "Array Index Rescue Game" };

    const diagGameName = document.getElementById("diag-game-name");
    if (diagGameName) diagGameName.textContent = gameTarget.title || gamify?.recommended_activity || "Recommended Challenge";

    const diagGameMeta = document.getElementById("diag-game-meta");
    if (diagGameMeta) diagGameMeta.textContent = `${gamify?.game_type || "Interactive Challenge"} • ${gamify?.difficulty || "Adaptive"} intensity • Target: ${pred?.concept || "Core Java"}`;

    const diagBadge = document.getElementById("diag-badge");
    if (diagBadge) diagBadge.textContent = `Reward: ${gamify?.reward_badge || "Mastery Badge"}`;

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

    const diagAlign = document.getElementById("diag-alignment");
    if (diagAlign) diagAlign.textContent = data.pretest_alignment?.message || "";

    // ── Feature 2: Populate XAI Explanation Card ──────────────────────────
    const xai = data.xai_explanation;
    if (xai) {
        const xaiLabel = document.getElementById("xai-label");
        if (xaiLabel) xaiLabel.textContent = xai.xai_label;
        const xaiNarrative = document.getElementById("xai-narrative");
        if (xaiNarrative) xaiNarrative.textContent = xai.xai_narrative;

        // Bullet points
        document.getElementById("xai-bullets").innerHTML = (xai.xai_bullet_points || []).map(b =>
            `<div style="display:flex;align-items:flex-start;gap:0.4rem;font-size:0.78rem;color:var(--text-primary);line-height:1.45;">
                <span style="flex-shrink:0;">${b.icon}</span>
                <span>${b.text}</span>
            </div>`
        ).join("");

        // Code signal chips
        document.getElementById("xai-signals").innerHTML = (xai.xai_code_signals || []).map(s =>
            `<span style="font-size:0.65rem;padding:2px 7px;border-radius:99px;background:rgba(139,92,246,0.12);color:#a78bfa;border:1px solid rgba(139,92,246,0.25);">${s}</span>`
        ).join("");
    }
}

// Chart.js instance references — destroyed and recreated on each refresh
let _lineChart = null;
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

        // ── Check Storage for Pre-Test Results ──────────────────────
        let quizResults = null;
        try {
            const raw = sessionStorage.getItem("quiz-results") || localStorage.getItem("latest_quiz_results");
            if (raw) quizResults = JSON.parse(raw);
        } catch (e) { }

        const labelMap = {
            "Variables": "VARIABLE_ERROR",
            "Loops": "LOOP_ERROR",
            "Arrays": "ARRAY_ERROR",
            "Methods": "METHOD_ERROR"
        };
        const labelShort = {
            LOOP_ERROR: "Loops",
            VARIABLE_ERROR: "Variables",
            ARRAY_ERROR: "Arrays",
            METHOD_ERROR: "Methods"
        };
        const catColors = {
            LOOP_ERROR: "#a78bfa",
            VARIABLE_ERROR: "#f59e0b",
            ARRAY_ERROR: "#34d399",
            METHOD_ERROR: "#f472b6"
        };
        const defaultSnippets = {
            "Arrays": "int[] arr = new int[5];\nint x = arr[arr.length]; // Out of bounds error",
            "Loops": "for (int i = 0; i <= 5; i++) {\n    // Off-by-one loop condition error\n}",
            "Variables": "int count;\nSystem.out.println(count); // Uninitialized variable error",
            "Methods": "static int calculate(int a) {\n    // Missing return statement error\n}"
        };

        // ── Compute Stats: Total Errors & Top Misconception ───────────
        let sessionTotalErrors = summaryData.total_analyses || 0;
        let sessionTopError = summaryData.most_frequent_error || "None";
        let sessionCategoryErrors = {
            "Variables": 0,
            "Loops": 0,
            "Arrays": 0,
            "Methods": 0
        };

        if (quizResults && quizResults.topicBreakdown) {
            let maxErrors = -1;
            let worstTopic = null;
            let calculatedTotal = 0;

            Object.entries(quizResults.topicBreakdown).forEach(([topic, data]) => {
                const errs = Math.max(0, (data.total || 0) - (data.correct || 0));
                sessionCategoryErrors[topic] = errs;
                calculatedTotal += errs;
                if (errs > maxErrors && errs > 0) {
                    maxErrors = errs;
                    worstTopic = topic;
                }
            });

            sessionTotalErrors = calculatedTotal;
            if (worstTopic) {
                sessionTopError = labelMap[worstTopic] || `${worstTopic.toUpperCase()}_ERROR`;
            }
        }

        const statTotal = document.getElementById("stat-total");
        if (statTotal) statTotal.textContent = sessionTotalErrors;
        const statTopError = document.getElementById("stat-top-error");
        if (statTopError) statTopError.textContent = sessionTopError;

        // Persist top misconception directly to Firestore
        if (sessionTopError !== "None" && studentId) {
            ErrorAPI.saveTopMisconception({
                student_id: studentId,
                top_misconception: sessionTopError,
                concept: labelShort[sessionTopError] || sessionTopError,
                total_errors: sessionTotalErrors,
                topic_breakdown: quizResults?.topicBreakdown || sessionCategoryErrors,
                accuracy_pct: quizResults ? quizResults.percent : 0,
                source: "error_pattern_detector"
            }).catch(err => console.warn("Failed to persist top misconception:", err));
        }

        // ── Errors List ──────────────────────────────────────────────
        const histCont = document.getElementById("history-container");
        const errorHistory = historyData.history ? historyData.history.filter(item => item.label !== "CORRECT") : [];

        // Build list of items: Prefer session wrongCodeQuestions, then topicBreakdown, then errorHistory
        let itemsToRender = [];
        if (quizResults && Array.isArray(quizResults.wrongCodeQuestions) && quizResults.wrongCodeQuestions.length > 0) {
            itemsToRender = quizResults.wrongCodeQuestions.map((wq, idx) => ({
                label: wq.label || labelMap[wq.topic] || "JAVA_ERROR",
                concept: wq.topic || "Core Java",
                code: wq.code || defaultSnippets[wq.topic] || "int[] arr = {1, 2, 3};",
                timestamp: wq.timestamp || new Date(Date.now() - idx * 60000).toISOString(),
                questionText: wq.questionText || ""
            }));
        } else if (quizResults && quizResults.topicBreakdown) {
            // Synthesize items for topics with errors
            Object.entries(quizResults.topicBreakdown).forEach(([topic, data], topicIdx) => {
                const errCount = (data.total || 0) - (data.correct || 0);
                for (let i = 0; i < errCount; i++) {
                    itemsToRender.push({
                        label: labelMap[topic] || `${topic.toUpperCase()}_ERROR`,
                        concept: topic,
                        code: defaultSnippets[topic] || "int x = 0;",
                        timestamp: new Date(Date.now() - (topicIdx * 5 + i) * 60000).toISOString(),
                        questionText: `${topic} question ${i + 1}`
                    });
                }
            });
        }
        
        if (itemsToRender.length === 0 && errorHistory.length > 0) {
            itemsToRender = [...errorHistory];
        }

        if (itemsToRender.length === 0) {
            histCont.innerHTML = `<div style="text-align:center; padding: 2rem; color: var(--text-secondary); font-size: 0.8rem;">No error entries found.</div>`;
        } else {
            histCont.innerHTML = "";
            // Sort: Prioritize sessionTopError, then newest first
            const sortedItems = [...itemsToRender].sort((a, b) => {
                if (a.label === sessionTopError && b.label !== sessionTopError) return -1;
                if (b.label === sessionTopError && a.label !== sessionTopError) return 1;
                return new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
            });

            sortedItems.forEach((item, index) => {
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
                    el.style.background = "rgba(74, 144, 226, 0.15)";
                    el.style.borderColor = "var(--accent-blue)";

                    if (item.full_response && item.full_response.prediction) {
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
                                console.warn("Failed to analyze selected error code:", e);
                            }
                        }
                    }
                });

                histCont.appendChild(el);
            });

            // Automatically populate telemetry with the suggested/top item if telemetry is currently empty
            if (!latestAnalysisResponse && sortedItems.length > 0) {
                const topItem = sortedItems[0];
                if (topItem.full_response && topItem.full_response.prediction) {
                    showTelemetryResult(topItem.full_response);
                } else if (topItem.code) {
                    ErrorAPI.analyze({
                        student_id: studentId,
                        code: topItem.code,
                        pretest_results: { variables: 3, loops: 3, arrays: 3, methods: 3 }
                    }).then(res => {
                        if (res && res.prediction && !latestAnalysisResponse) {
                            showTelemetryResult(res);
                        }
                    }).catch(() => { });
                }
            }
        }

        // ── Feature 1: Analytics & Charts Dashboard (Always Enabled) ──
        const analyticsSection = document.getElementById("analytics-section");
        if (analyticsSection) {
            analyticsSection.classList.remove("hidden");

            let totalSub = analyticsData.has_data ? analyticsData.total_submissions : (sessionTotalErrors > 0 ? 1 : 0);
            let impPct = analyticsData.has_data ? analyticsData.overall_improvement_pct : (quizResults ? quizResults.percent : 0);
            let worstConcept = analyticsData.has_data ? (labelShort[analyticsData.most_problematic] || analyticsData.most_problematic) : (sessionTopError !== "None" ? (labelShort[sessionTopError] || sessionTopError) : "None");
            
            let bestConcept = "None";
            if (quizResults && quizResults.topicBreakdown) {
                let maxCorrect = -1;
                Object.entries(quizResults.topicBreakdown).forEach(([t, d]) => {
                    if (d.correct > maxCorrect) {
                        maxCorrect = d.correct;
                        bestConcept = t;
                    }
                });
            } else if (analyticsData.has_data && analyticsData.most_improved) {
                bestConcept = labelShort[analyticsData.most_improved] || analyticsData.most_improved;
            }

            // Stat cards
            const anlTotalEl = document.getElementById("anl-total");
            if (anlTotalEl) anlTotalEl.textContent = totalSub > 0 ? totalSub : 1;

            const anlImpEl = document.getElementById("anl-improvement");
            if (anlImpEl) {
                anlImpEl.textContent = `${Math.abs(impPct)}%`;
                anlImpEl.style.color = impPct >= 50 ? "var(--accent-green)" : (impPct >= 30 ? "var(--accent-orange)" : "#ef4444");
            }
            const anlImpArrow = document.getElementById("anl-improvement-arrow");
            if (anlImpArrow) {
                anlImpArrow.textContent = impPct >= 50 ? "↑" : (impPct >= 30 ? "→" : "↓");
                anlImpArrow.style.color = impPct >= 50 ? "var(--accent-green)" : (impPct >= 30 ? "var(--accent-orange)" : "#ef4444");
            }

            const anlWorstEl = document.getElementById("anl-worst");
            if (anlWorstEl) anlWorstEl.textContent = worstConcept || "None";

            const anlBestEl = document.getElementById("anl-best");
            if (anlBestEl) anlBestEl.textContent = bestConcept !== "None" ? `${bestConcept} ↑` : "None yet";

            // ── Improvement / Breakdown Cards ────────────────────────
            const cardsContainer = document.getElementById("anl-improvement-cards");
            if (cardsContainer) {
                if (analyticsData.has_data && analyticsData.improvement_scores) {
                    cardsContainer.innerHTML = Object.entries(analyticsData.improvement_scores).map(([cat, data]) => {
                        const col = catColors[cat] || "#4a90e2";
                        const arrow = data.direction === "improved" ? "↑" : (data.direction === "worse" ? "↓" : "→");
                        const arrowColor = data.direction === "improved" ? "#34d399" : (data.direction === "worse" ? "#ef4444" : "#8899aa");
                        return `
                            <div class="card" style="padding:0.8rem; border-left: 3px solid ${col}; background: var(--bg-card); border-right: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); border-top: 1px solid var(--border-color);">
                                <div style="font-size:0.65rem;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:0.3rem;">${labelShort[cat] || cat}</div>
                                <div style="display:flex;align-items:baseline;gap:0.3rem;">
                                    <span style="font-size:1.4rem;font-weight:800;color:${col};">${Math.abs(data.pct)}%</span>
                                    <span style="font-size:1rem;color:${arrowColor};font-weight:700;">${arrow}</span>
                                </div>
                                <div style="font-size:0.65rem;color:var(--text-secondary);margin-top:0.2rem;">${data.first} → ${data.second} errors</div>
                            </div>`;
                    }).join("");
                } else {
                    const categories = ["Variables", "Loops", "Arrays", "Methods"];
                    cardsContainer.innerHTML = categories.map(cat => {
                        const errCount = sessionCategoryErrors[cat] || 0;
                        const catKey = labelMap[cat];
                        const col = catColors[catKey] || "#4a90e2";
                        const accuracy = quizResults?.topicBreakdown?.[cat] ? Math.round((quizResults.topicBreakdown[cat].correct / (quizResults.topicBreakdown[cat].total || 1)) * 100) : 0;
                        return `
                            <div class="card" style="padding:0.8rem; border-left: 3px solid ${col}; background: var(--bg-card); border-right: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); border-top: 1px solid var(--border-color);">
                                <div style="font-size:0.65rem;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:0.3rem;">${cat}</div>
                                <div style="display:flex;align-items:baseline;gap:0.3rem;">
                                    <span style="font-size:1.4rem;font-weight:800;color:${col};">${accuracy}%</span>
                                    <span style="font-size:0.75rem;color:var(--text-secondary);">accuracy</span>
                                </div>
                                <div style="font-size:0.65rem;color:var(--text-secondary);margin-top:0.2rem;">${errCount} error${errCount !== 1 ? 's' : ''} detected</div>
                            </div>`;
                    }).join("");
                }
            }

            // ── Line Chart: Errors & Performance Over Time ────────────
            const lineCtx = document.getElementById("anl-line-chart");
            if (lineCtx) {
                let weekLabels = ["Diagnostic Pre-Test"];
                let errorCounts = [sessionTotalErrors];
                let correctCounts = [quizResults ? quizResults.score : Math.max(0, 25 - sessionTotalErrors)];

                if (analyticsData.has_data && analyticsData.weekly_totals && analyticsData.weekly_totals.length > 0) {
                    weekLabels = analyticsData.weekly_totals.map(w => w.week);
                    errorCounts = analyticsData.weekly_totals.map(w => w.total_errors);
                    correctCounts = analyticsData.weekly_totals.map(w => w.correct);
                } else if (quizResults && quizResults.topicBreakdown) {
                    weekLabels = Object.keys(quizResults.topicBreakdown);
                    errorCounts = weekLabels.map(t => (quizResults.topicBreakdown[t].total || 0) - (quizResults.topicBreakdown[t].correct || 0));
                    correctCounts = weekLabels.map(t => quizResults.topicBreakdown[t].correct || 0);
                }

                // Always ensure previous chart instance on this canvas is destroyed before new render
                const existingLine = Chart.getChart(lineCtx) || _lineChart;
                if (existingLine) {
                    try { existingLine.destroy(); } catch (e) { }
                    _lineChart = null;
                }

                const ctx = lineCtx.getContext('2d');
                const errorGradient = ctx.createLinearGradient(0, 0, 0, 200);
                errorGradient.addColorStop(0, "rgba(239, 68, 68, 0.4)");
                errorGradient.addColorStop(1, "rgba(239, 68, 68, 0.0)");

                const correctGradient = ctx.createLinearGradient(0, 0, 0, 200);
                correctGradient.addColorStop(0, "rgba(52, 211, 153, 0.4)");
                correctGradient.addColorStop(1, "rgba(52, 211, 153, 0.0)");

                _lineChart = new Chart(lineCtx, {
                    type: "line",
                    data: {
                        labels: weekLabels,
                        datasets: [
                            {
                                label: "Errors",
                                data: errorCounts,
                                borderColor: "#ef4444",
                                backgroundColor: errorGradient,
                                tension: 0.4,
                                fill: true,
                                pointBackgroundColor: "#ef4444",
                                pointRadius: 4,
                            },
                            {
                                label: "Correct",
                                data: correctCounts,
                                borderColor: "#34d399",
                                backgroundColor: correctGradient,
                                tension: 0.4,
                                fill: true,
                                pointBackgroundColor: "#34d399",
                                pointRadius: 4,
                            },
                        ],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        animation: { duration: 400 },
                        interaction: { mode: 'index', intersect: false },
                        plugins: {
                            legend: { labels: { color: "#8899aa", font: { size: 11, family: 'Inter' } } },
                            tooltip: { backgroundColor: 'rgba(15, 23, 36, 0.9)', titleColor: '#fff', bodyColor: '#ccc', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, padding: 10 }
                        },
                        scales: {
                            x: { ticks: { color: "#8899aa", font: { size: 10 } }, grid: { display: false } },
                            y: { ticks: { color: "#8899aa", font: { size: 10 }, stepSize: 1 }, grid: { color: "rgba(255,255,255,0.06)" }, beginAtZero: true },
                        },
                    },
                });
            }

            // ── Bar Chart: Errors by Category ─────────────────────────
            const barCtx = document.getElementById("anl-bar-chart");
            if (barCtx) {
                let catLabels = ["Variables", "Loops", "Arrays", "Methods"];
                let catValues = [
                    sessionCategoryErrors["Variables"] || 0,
                    sessionCategoryErrors["Loops"] || 0,
                    sessionCategoryErrors["Arrays"] || 0,
                    sessionCategoryErrors["Methods"] || 0
                ];
                let barColors = ["#f59e0b", "#a78bfa", "#34d399", "#f472b6"];

                if (analyticsData.has_data && analyticsData.total_counts && Object.keys(analyticsData.total_counts).length > 0) {
                    catLabels = Object.keys(analyticsData.total_counts).map(k => labelShort[k] || k);
                    catValues = Object.values(analyticsData.total_counts);
                    barColors = Object.keys(analyticsData.total_counts).map(k => catColors[k] || "#4a90e2");
                }

                // Always ensure previous chart instance on this canvas is destroyed before new render
                const existingBar = Chart.getChart(barCtx) || _barChart;
                if (existingBar) {
                    try { existingBar.destroy(); } catch (e) { }
                    _barChart = null;
                }

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
                        responsive: true,
                        maintainAspectRatio: false,
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

        // ── Feature 3: Learning Report ────────────────────────────────
        const reportCont = document.getElementById("report-container");
        if (reportCont) {
            if (reportData && reportData.has_data) {
                const r = reportData;
                const section = (title, items) => {
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

                const focusSection = (r.recommended_focus && r.recommended_focus.length > 0) ? `
                    <div style="margin-bottom:0.6rem;">
                        <div style="font-size:0.65rem;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.8px;margin-bottom:0.4rem;font-weight:700;">🎯 Focus Next On</div>
                        ${r.recommended_focus.map(f => `
                            <div style="padding:0.5rem 0.6rem;border-radius:6px;background:rgba(74,144,226,0.05);border:1px solid rgba(74,144,226,0.15);margin-bottom:0.4rem;">
                                <div style="font-size:0.75rem;font-weight:700;color:var(--accent-blue);margin-bottom:0.3rem;">${f.concept}</div>
                                ${(f.topics || []).map(t => `<div style="font-size:0.7rem;color:var(--text-secondary);">• ${t}</div>`).join("")}
                            </div>
                        `).join("")}
                    </div>` : "";

                const avoidSection = (r.avoid_patterns && r.avoid_patterns.length > 0) ? `
                    <div>
                        <div style="font-size:0.65rem;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.8px;margin-bottom:0.4rem;font-weight:700;">🚫 Avoid</div>
                        ${r.avoid_patterns.slice(0, 4).map(p => `
                            <div style="font-size:0.7rem;color:#ef4444;padding:0.25rem 0.5rem;background:rgba(239,68,68,0.05);border-radius:4px;margin-bottom:0.25rem;border:1px solid rgba(239,68,68,0.12);">✗ ${p.text}</div>
                        `).join("")}
                    </div>` : "";

                reportCont.innerHTML = `
                    <div style="padding:0.8rem;border-radius:8px;background:linear-gradient(135deg,rgba(74,144,226,0.08),rgba(139,92,246,0.05));border:1px solid rgba(74,144,226,0.2);margin-bottom:0.8rem;">
                        <div style="font-size:0.65rem;color:var(--accent-blue);text-transform:uppercase;letter-spacing:0.8px;margin-bottom:0.3rem;font-weight:700;">📝 Summary</div>
                        <p style="font-size:0.78rem;color:var(--text-primary);line-height:1.5;margin:0;">${r.summary || "Learning progression report."}</p>
                    </div>
                    ${section("💪 Strengths", r.strengths)}
                    ${section("⚠️ Recurring Mistakes", r.recurring_mistakes)}
                    ${section("📈 Recently Improved", r.recently_improved)}
                    ${section("🆕 New Mistakes", r.new_mistakes)}
                    ${focusSection}
                    ${avoidSection}
                `;
            } else {
                // Session-based dynamic learning report
                const strengthsList = [];
                const mistakeList = [];
                if (quizResults && quizResults.topicBreakdown) {
                    Object.entries(quizResults.topicBreakdown).forEach(([topic, d]) => {
                        if (d.correct >= d.total && d.total > 0) {
                            strengthsList.push({ icon: "⭐", message: `Mastered ${topic} concepts with 100% accuracy.` });
                        } else if (d.correct > 0) {
                            strengthsList.push({ icon: "✅", message: `Solid foundation in ${topic} (${d.correct}/${d.total} correct).` });
                        }
                        if (d.total - d.correct > 0) {
                            mistakeList.push({ icon: "⚠️", message: `Encountered ${d.total - d.correct} error(s) in ${topic}.` });
                        }
                    });
                }

                reportCont.innerHTML = `
                    <div style="padding:0.8rem;border-radius:8px;background:linear-gradient(135deg,rgba(74,144,226,0.08),rgba(139,92,246,0.05));border:1px solid rgba(74,144,226,0.2);margin-bottom:0.8rem;">
                        <div style="font-size:0.65rem;color:var(--accent-blue);text-transform:uppercase;letter-spacing:0.8px;margin-bottom:0.3rem;font-weight:700;">📝 Session Report</div>
                        <p style="font-size:0.78rem;color:var(--text-primary);line-height:1.5;margin:0;">
                            ${sessionTopError !== "None" ? `Pre-Test completed. Primary focus area identified as <strong>${labelShort[sessionTopError] || sessionTopError}</strong>.` : "Diagnostic pre-test completed successfully."}
                        </p>
                    </div>
                    <div style="margin-bottom:0.6rem;">
                        <div style="font-size:0.65rem;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.8px;margin-bottom:0.4rem;font-weight:700;">💪 Demonstrated Strengths</div>
                        ${strengthsList.map(s => `
                            <div style="display:flex;align-items:flex-start;gap:0.4rem;padding:0.4rem 0.6rem;border-radius:6px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);margin-bottom:0.3rem;">
                                <span style="flex-shrink:0;font-size:0.9rem;">${s.icon}</span>
                                <span style="font-size:0.75rem;color:var(--text-primary);line-height:1.4;">${s.message}</span>
                            </div>
                        `).join("") || '<div style="font-size:0.75rem;color:var(--text-secondary);padding:0.4rem;">Continue practicing to build your streak.</div>'}
                    </div>
                    <div style="margin-bottom:0.6rem;">
                        <div style="font-size:0.65rem;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.8px;margin-bottom:0.4rem;font-weight:700;">🎯 Focus Area</div>
                        <div style="padding:0.5rem 0.6rem;border-radius:6px;background:rgba(74,144,226,0.05);border:1px solid rgba(74,144,226,0.15);">
                            <div style="font-size:0.75rem;font-weight:700;color:var(--accent-blue);margin-bottom:0.3rem;">${labelShort[sessionTopError] || sessionTopError}</div>
                            <div style="font-size:0.7rem;color:var(--text-secondary);">• Recommended Game: ${document.getElementById("diag-game-name")?.textContent || "Target Lesson"}</div>
                        </div>
                    </div>
                `;
            }
        }

    } catch (err) {
        console.warn("Global state sync failed", err);
        const histCont = document.getElementById("history-container");
        if (histCont && histCont.querySelector(".spinner")) {
            histCont.innerHTML = `<div style="text-align:center; padding: 2rem; color: var(--text-secondary); font-size: 0.8rem;">No error entries found.</div>`;
        }
    }
}
