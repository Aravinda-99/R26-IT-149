/**
 * Component 2: Intelligent Error Pattern Detector — Diagnostic Dashboard
 * ======================================================================
 * Premium 3-column layout for research-grade error analysis.
 * Enhanced with: XAI Explanations (F2), Analytics (F1), Learning Report (F3).
 */

import { ErrorAPI } from "../api/api.js";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);


let latestAnalysisResponse = null;

function showTelemetryResult(res) {
    if (!res || !res.prediction) return;
    latestAnalysisResponse = res;
    const welcomeView = document.getElementById("welcome-view");
    if (welcomeView) welcomeView.classList.add("hidden");
    const invalidView = document.getElementById("invalid-view");
    if (invalidView) invalidView.classList.add("hidden");
    const resultView = document.getElementById("result-view");
    if (resultView) resultView.classList.remove("hidden");
    updateInsightEngine(res);
}

export async function renderErrorAnalysis(container) {
    const studentId = "demo_student";

    container.innerHTML = `
        <div class="dashboard-wrapper" style="display: flex; flex-direction: column; gap: 1.5rem; height: 100%;">
            <!-- Top Stats Bar -->
            <div class="stats-bar card glass-card" style="display: flex; justify-content: space-around; padding: 1rem; border-radius: 12px; background: rgba(30, 42, 58, 0.5);">
                <div class="stat-item" style="text-align: center;">
                    <div style="font-size: 0.7rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px;">Analyses Performed</div>
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

                    <div id="result-view" class="hidden" style="display: flex; flex-direction: column; gap: 1.2rem;">
                        <!-- Top Header -->
                        <div style="display: flex; justify-content: space-between; align-items: flex-end; padding-bottom: 0.5rem; border-bottom: 2px solid var(--border-color);">
                            <div>
                                <div id="diag-label" style="font-size: 1.8rem; font-weight: 800; line-height: 1;">---</div>
                                <div id="diag-concept" style="color: var(--text-secondary); margin-top: 0.3rem;">Concept: ---</div>
                            </div>
                            <div style="text-align: right;">
                                <div id="diag-confidence" class="badge" style="font-size: 0.75rem;">---</div>
                                <div style="font-size: 0.65rem; color: var(--text-secondary); margin-top: 2px;">ML CONFIDENCE</div>
                            </div>
                        </div>

                        <!-- Main Feedback Cards -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem;">
                            <div class="card" style="background: rgba(167, 139, 250, 0.05); border-top: 3px solid var(--accent-purple);">
                                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.8rem;">
                                    <span style="font-size: 1.2rem;">🧠</span>
                                    <h4 style="margin: 0; font-size: 0.85rem; color: var(--accent-purple);">REASON DIAGNOSIS</h4>
                                </div>
                                <div style="margin-bottom: 0.5rem; font-size: 0.75rem; color: var(--text-secondary);">
                                    <strong>Original Broad Prediction:</strong> <span id="diag-broad-error">---</span><br>
                                    <strong>Final Diagnosis:</strong> <span id="diag-final-label">---</span><br>
                                    <strong>Final Reason Group:</strong> <span id="diag-reason-group">---</span>
                                </div>
                                <div id="diag-badges" style="display: flex; gap: 0.5rem; margin-bottom: 0.8rem; flex-wrap: wrap;"></div>
                                <p id="diag-reason" style="font-size: 0.9rem; line-height: 1.5; color: var(--text-primary);"></p>
                                <div style="margin-top: 1rem; font-size: 0.85rem; font-style: italic; color: var(--text-secondary);">
                                    "Misconception: <span id="diag-miscon"></span>"
                                </div>
                            </div>

                            <div class="card" style="background: rgba(52, 211, 153, 0.05); border-top: 3px solid var(--accent-green);">
                                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.8rem;">
                                    <span style="font-size: 1.2rem;">🔧</span>
                                    <h4 style="margin: 0; font-size: 0.85rem; color: var(--accent-green);">REPAIR STRATEGY</h4>
                                </div>
                                <p id="diag-fix" style="font-size: 0.9rem; line-height: 1.5; color: var(--text-primary);"></p>
                                <div style="margin-top: 1rem; padding: 0.5rem; background: rgba(52, 211, 153, 0.1); border-radius: 4px; font-size: 0.8rem;">
                                    <strong>Step:</strong> <span id="diag-next-step"></span>
                                </div>
                            </div>
                        </div>

                        <!-- Transparency Buttons -->
                        <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 0.5rem;">
                            <button id="btn-pipeline" class="btn" style="background: rgba(74, 144, 226, 0.1); color: #4a90e2; border: 1px solid #4a90e2; padding: 0.4rem 0.8rem; font-size: 0.75rem; border-radius: 4px; cursor: pointer;">View Analysis Pipeline</button>
                            <button id="btn-payload" class="btn" style="background: rgba(167, 139, 250, 0.1); color: #a78bfa; border: 1px solid #a78bfa; padding: 0.4rem 0.8rem; font-size: 0.75rem; border-radius: 4px; cursor: pointer;">View API Payload</button>
                        </div>

                        <!-- ML Trace & Evidence Cards -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem;">
                            <div class="card" style="background: rgba(30, 42, 58, 0.5); border-left: 3px solid #4a90e2;">
                                <h4 style="margin: 0 0 0.8rem 0; font-size: 0.85rem; color: #4a90e2;">ML DETECTION TRACE</h4>
                                <div style="font-size: 0.75rem; color: var(--text-secondary); line-height: 1.6;">
                                    <div><strong>Broad Model:</strong> <span id="trace-broad-model"></span></div>
                                    <div><strong>Original Broad Prediction:</strong> <span id="trace-broad-pred"></span></div>
                                    <div><strong>Final Broad Prediction:</strong> <span id="trace-broad-pred-final"></span></div>
                                    <div style="margin-top:0.4rem;"><strong>Reason Model:</strong> <span id="trace-reason-model"></span></div>
                                    <div><strong>Original Reason Prediction:</strong> <span id="trace-reason-pred"></span></div>
                                    <div><strong>Final Reason Group:</strong> <span id="trace-reason-final"></span></div>
                                    <div><strong>Reason Group Adjusted:</strong> <span id="trace-reason-adjusted"></span></div>
                                    <div style="margin-top:0.4rem;"><strong>Feedback Source:</strong> <span id="trace-feedback-src"></span></div>
                                    <div><strong>Rule Override Applied:</strong> <span id="trace-rule-override"></span></div>
                                    <div><strong>Correctness Validated:</strong> <span id="trace-correctness-validated"></span></div>
                                </div>
                            </div>

                            <div class="card" style="background: rgba(30, 42, 58, 0.5); border-left: 3px solid #f5a623;">
                                <h4 style="margin: 0 0 0.8rem 0; font-size: 0.85rem; color: #f5a623;">SUPPORTING CODE EVIDENCE</h4>
                                <div style="font-size: 0.8rem; color: var(--text-primary);">
                                    <div id="evidence-note" style="margin-bottom: 0.5rem; font-style: italic; color: var(--text-secondary);"></div>
                                    <div id="evidence-snippet-container" style="background: #0d1117; padding: 0.8rem; border-radius: 6px; font-family: monospace; font-size: 0.75rem; border: 1px solid var(--border-color); white-space: pre-wrap; word-break: break-all;"></div>
                                </div>
                            </div>
                        </div>

                        <!-- Pedagogical Insight -->
                        <div class="card glass-card" style="background: linear-gradient(135deg, #1a2332, #0f1724); border-left: 4px solid var(--accent-blue);">
                            <div style="display: flex; align-items: flex-start; gap: 1rem;">
                                <div style="font-size: 2rem;">💡</div>
                                <div>
                                    <h4 style="margin: 0 0 0.5rem 0; font-size: 0.9rem; color: var(--accent-blue);">Beginner-Friendly Insight</h4>
                                    <p id="diag-insight" style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6; margin: 0;"></p>
                                </div>
                            </div>
                        </div>

                        <!-- Gamification Recommendation -->
                        <div class="card" style="background: linear-gradient(90deg, #1e2a3a, #2a3a4e); border: 1px solid var(--accent-blue); padding: 1.2rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div style="display: flex; gap: 1rem; align-items: center;">
                                    <div style="font-size: 2.5rem;" id="diag-game-icon">🎮</div>
                                    <div>
                                        <div style="font-size: 0.65rem; color: var(--accent-blue); text-transform: uppercase; font-weight: 700;">Recommended Game Activity</div>
                                        <div id="diag-game-name" style="font-size: 1.2rem; font-weight: 700; color: white;">---</div>
                                        <div id="diag-game-meta" style="font-size: 0.75rem; color: var(--text-secondary);">---</div>
                                    </div>
                                </div>
                                <div style="text-align: center; background: rgba(0,0,0,0.2); padding: 0.5rem 1rem; border-radius: 12px; min-width: 80px;">
                                    <div style="font-size: 1.5rem;">🏆</div>
                                    <div id="diag-badge" style="font-size: 0.6rem; font-weight: 800; color: var(--accent-orange); text-transform: uppercase;">---</div>
                                </div>
                            </div>
                        </div>

                        <!-- Feature 2: XAI Explanation Card -->
                        <div id="xai-card" class="card" style="background: linear-gradient(135deg, rgba(139,92,246,0.07), rgba(59,130,246,0.04)); border: 1px solid rgba(139,92,246,0.25); border-top: 3px solid #8b5cf6; padding: 1.2rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem;">
                                <div style="display: flex; align-items: center; gap: 0.5rem;">
                                    <span style="font-size: 1.1rem;">🤖</span>
                                    <h4 style="margin: 0; font-size: 0.85rem; color: #8b5cf6; letter-spacing: 0.5px;">EXPLAINABLE AI (XAI)</h4>
                                </div>
                                <div style="display: flex; align-items: center; gap: 0.4rem;">
                                    <span style="font-size: 0.65rem; color: var(--text-secondary); text-transform: uppercase;">Confidence</span>
                                    <span id="xai-confidence-badge" style="font-size: 0.85rem; font-weight: 800; color: #8b5cf6;">—</span>
                                </div>
                            </div>
                            <!-- Confidence progress bar -->
                            <div style="margin-bottom: 0.9rem;">
                                <div style="height: 6px; background: rgba(255,255,255,0.07); border-radius: 99px; overflow: hidden;">
                                    <div id="xai-confidence-bar" style="height: 100%; border-radius: 99px; background: linear-gradient(90deg,#8b5cf6,#6366f1); transition: width 0.6s ease; width: 0%;"></div>
                                </div>
                            </div>
                            <!-- XAI label + narrative -->
                            <div id="xai-label" style="font-size: 0.8rem; font-weight: 700; color: #a78bfa; margin-bottom: 0.4rem;">—</div>
                            <p id="xai-narrative" style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.55; margin-bottom: 0.8rem;"></p>
                            <!-- Evidence bullets -->
                            <div id="xai-bullets" style="display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 0.6rem;"></div>
                            <!-- Code signals (chips) -->
                            <div id="xai-signals" style="display: flex; flex-wrap: wrap; gap: 0.3rem;"></div>
                        </div>

                        <!-- Alignment Notification -->
                        <div id="diag-alignment" style="padding: 0.8rem; border-radius: 8px; font-size: 0.8rem; background: rgba(74, 144, 226, 0.05); border: 1px dashed rgba(74, 144, 226, 0.3); color: var(--text-secondary); text-align: center;">
                        </div>
                    </div>
                </div>

                <!-- Column 3: The Record (History + Learning Report) -->
                <div class="record-col" style="display: flex; flex-direction: column; gap: 1.2rem;">
                    <div class="card glass-card" style="flex: 1; display: flex; flex-direction: column; overflow: hidden;">
                        <!-- Tab Bar -->
                        <div style="display: flex; gap: 0; margin-bottom: 1rem; border-bottom: 1px solid var(--border-color);">
                            <button id="tab-history-btn" onclick="" style="flex: 1; padding: 0.5rem; background: rgba(74,144,226,0.1); border: none; border-bottom: 2px solid var(--accent-blue); color: var(--accent-blue); font-family: var(--font); font-size: 0.75rem; font-weight: 700; cursor: pointer; text-transform: uppercase; letter-spacing: 0.5px;">📋 History</button>
                            <button id="tab-report-btn" onclick="" style="flex: 1; padding: 0.5rem; background: none; border: none; border-bottom: 2px solid transparent; color: var(--text-secondary); font-family: var(--font); font-size: 0.75rem; font-weight: 600; cursor: pointer; text-transform: uppercase; letter-spacing: 0.5px;">📊 Learning Report</button>
                        </div>
                        <!-- History Panel -->
                        <div id="history-panel" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 0.8rem; padding-right: 5px;">
                            <div id="history-container" style="display: flex; flex-direction: column; gap: 0.8rem;">
                                <div class="spinner" style="margin: 2rem auto;"></div>
                            </div>
                        </div>
                        <!-- Learning Report Panel (Feature 3) -->
                        <div id="report-panel" class="hidden" style="flex: 1; overflow-y: auto; padding-right: 5px;">
                            <div id="report-container" style="display: flex; flex-direction: column; gap: 0.8rem;">
                                <div style="text-align: center; padding: 2rem; color: var(--text-secondary); font-size: 0.8rem;">
                                    Submit code to generate your Learning Report.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            </div>

            <!-- Feature 1: Analytics Dashboard (shown after ≥2 submissions) -->
            <div id="analytics-section" class="hidden" style="margin-top: 1.5rem;">
                <!-- Section Header -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid var(--border-color);">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="font-size: 1.3rem;">📈</span>
                        <h3 style="margin: 0; font-size: 1.05rem; font-weight: 700;">Error Progression Analytics</h3>
                        <span style="font-size: 0.65rem; padding: 2px 8px; border-radius: 99px; background: rgba(74,144,226,0.15); color: var(--accent-blue); font-weight: 600;">Feature 1</span>
                    </div>
                    <span style="font-size: 0.7rem; color: var(--text-secondary); font-style: italic;">Updates after each submission</span>
                </div>
                <!-- 4 Stat Cards -->
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.2rem;">
                    <div class="card" style="padding: 1rem; border-top: 3px solid var(--accent-blue); text-align: center;">
                        <div style="font-size: 0.65rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.4rem;">Total Submissions</div>
                        <div id="anl-total" style="font-size: 1.8rem; font-weight: 800; color: var(--accent-blue);">—</div>
                    </div>
                    <div class="card" style="padding: 1rem; border-top: 3px solid var(--accent-green); text-align: center;">
                        <div style="font-size: 0.65rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.4rem;">Improvement Score</div>
                        <div style="display: flex; align-items: baseline; justify-content: center; gap: 0.2rem;">
                            <div id="anl-improvement" style="font-size: 1.8rem; font-weight: 800; color: var(--accent-green);">—</div>
                            <span id="anl-improvement-arrow" style="font-size: 1.2rem;"></span>
                        </div>
                    </div>
                    <div class="card" style="padding: 1rem; border-top: 3px solid var(--accent-orange); text-align: center;">
                        <div style="font-size: 0.65rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.4rem;">Most Problematic</div>
                        <div id="anl-worst" style="font-size: 0.95rem; font-weight: 700; color: var(--accent-orange);">—</div>
                    </div>
                    <div class="card" style="padding: 1rem; border-top: 3px solid #a78bfa; text-align: center;">
                        <div style="font-size: 0.65rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.4rem;">Most Improved</div>
                        <div id="anl-best" style="font-size: 0.95rem; font-weight: 700; color: #a78bfa;">—</div>
                    </div>
                </div>
                <!-- Charts Row -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem;">
                    <div class="card" style="padding: 1.2rem;">
                        <h4 style="margin: 0 0 1rem 0; font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">📉 Total Errors Over Time</h4>
                        <div style="position: relative; height: 200px;">
                            <canvas id="anl-line-chart"></canvas>
                        </div>
                    </div>
                    <div class="card" style="padding: 1.2rem;">
                        <h4 style="margin: 0 0 1rem 0; font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">📊 Errors by Category</h4>
                        <div style="position: relative; height: 200px;">
                            <canvas id="anl-bar-chart"></canvas>
                        </div>
                    </div>
                </div>
                <!-- Improvement Score Cards -->
                <div id="anl-improvement-cards" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.8rem; margin-top: 1rem;"></div>
            </div>

            <!-- Modals -->
            <div id="pipeline-modal" class="hidden" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 1000; display: flex; justify-content: center; align-items: center;">
                <div class="card glass-card" style="width: 600px; max-height: 80vh; background: #0d1117; padding: 2rem; border-radius: 12px; border: 1px solid var(--border-color); position: relative; display: flex; flex-direction: column;">
                    <button id="close-pipeline" style="position: absolute; top: 15px; right: 20px; background: none; border: none; color: var(--text-secondary); font-size: 1.5rem; cursor: pointer;">&times;</button>
                    <h2 style="margin-top: 0; color: #4a90e2;">Backend Analysis Pipeline</h2>
                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.5rem;">Model 1 predicts WHAT type of error occurred. Model 2 predicts WHY category or reason group. Feedback templates translate the predicted reason group into beginner-friendly learning feedback.</p>
                    <div id="pipeline-timeline" style="display: flex; flex-direction: column; gap: 1rem; overflow-y: auto; padding-right: 10px;"></div>
                </div>
            </div>

            <div id="payload-modal" class="hidden" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 1000; display: flex; justify-content: center; align-items: center;">
                <div class="card glass-card" style="width: 700px; max-height: 80vh; background: #0d1117; padding: 2rem; border-radius: 12px; border: 1px solid var(--border-color); position: relative; display: flex; flex-direction: column;">
                    <button id="close-payload" style="position: absolute; top: 15px; right: 20px; background: none; border: none; color: var(--text-secondary); font-size: 1.5rem; cursor: pointer;">&times;</button>
                    <h2 style="margin-top: 0; color: #a78bfa;">Backend API Response</h2>
                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem;">This payload shows the structured response returned by the backend after ML analysis.</p>
                    <pre id="payload-content" style="flex: 1; overflow-y: auto; background: #000; padding: 1rem; border-radius: 8px; font-family: monospace; font-size: 0.8rem; color: #a5d6ff; margin: 0; border: 1px solid #30363d;"></pre>
                </div>
            </div>
        </div>
    `;

    const welcomeView = document.getElementById("welcome-view");
    const resultView = document.getElementById("result-view");

    // Load initial stats
    refreshGlobalState(studentId);

    // --- Live Telemetry Poller ---
    let lastPolledTimestamp = null;
    async function pollLatestTelemetry() {
        try {
            const res = await ErrorAPI.getLatest(studentId);
            if (res && res.prediction) {
                // Check if this is a new analysis
                if (res.timestamp !== lastPolledTimestamp) {
                    lastPolledTimestamp = res.timestamp;
                    showTelemetryResult(res);
                    refreshGlobalState(studentId);
                }
            }
        } catch (err) {
            // Silently ignore 404 or network errors during polling
        }
    }

    pollLatestTelemetry();
    setInterval(pollLatestTelemetry, 2000);

    document.getElementById("btn-pipeline").addEventListener("click", () => {
        if (!latestAnalysisResponse) return;
        const d = latestAnalysisResponse;
        
        const isAdjusted = d.reason_group_adjusted;
        const isOverridden = d.override_applied;

        const steps = [
            { step: "1. Java Input Received", status: "Completed", statusColor: "#34d399", details: "Submitted Java code was received from the Code Lab." },
            { step: "2. Input Validation", status: "Passed", statusColor: "#34d399", details: "Input was accepted for Java code analysis." },
            { step: "3. Preprocessing", status: "Completed", statusColor: "#34d399", details: "Comments, imports, package statements, and extra whitespace are removed before ML prediction." },
            { step: "4. TF-IDF Feature Extraction", status: "Completed", statusColor: "#34d399", details: "The cleaned Java code is converted into numerical TF-IDF features inside the saved ML pipeline." },
            { step: "5. Broad Error Prediction", status: "Completed", statusColor: "#34d399", details: `Model 1 predicts the broad error category.<br/><strong>Predicted:</strong> ${d.model_trace?.original_broad_prediction || d.model_trace?.broad_prediction || d.broad_label || 'N/A'}` },
            { step: "6. Reason Group Prediction", status: "Completed", statusColor: "#34d399", details: `Model 2 predicts the reason group.<br/><strong>Predicted:</strong> ${d.model_trace?.original_reason_prediction || d.model_trace?.reason_prediction || d.reason_group_original || d.reason_group || 'N/A'}` },
            { step: "7. Reason Consistency Validation", status: isAdjusted ? "Adjusted" : "Passed", statusColor: isAdjusted ? "#f59e0b" : "#34d399", details: isAdjusted ? "Original reason group was adjusted to match the final broad label." : "Reason group is consistent with the broad label." },
            { step: "8. Safety Validation", status: isOverridden ? "Applied" : "Skipped", statusColor: isOverridden ? "#f59e0b" : "#4a90e2", details: isOverridden ? (d.override_reason || "Rule-based correction applied") : "No rule-based correction was required." },
            { step: "9. Feedback Generation", status: "Completed", statusColor: "#34d399", details: "Predicted reason group is converted into beginner-friendly explanation, misconception, and repair strategy." },
            { step: "10. Gamification Recommendation", status: "Completed", statusColor: "#34d399", details: `Recommended activity: ${d.gamification_payload?.recommended_activity || 'N/A'}` },
            { step: "11. Schema Mastery Update", status: "Completed", statusColor: "#34d399", details: `Schema status: ${d.schema_mastery_payload?.schema_status || 'N/A'}` }
        ];

        document.getElementById("pipeline-timeline").innerHTML = steps.map(s => `
            <div style="border-left: 2px solid #30363d; padding-left: 1rem; position: relative; padding-bottom: 1rem;">
                <div style="position: absolute; left: -6px; top: 0; width: 10px; height: 10px; border-radius: 50%; background: ${s.statusColor}; box-shadow: 0 0 5px ${s.statusColor};"></div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem;">
                    <strong style="color: var(--text-primary); font-size: 0.9rem;">${s.step}</strong>
                    <span style="font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; background: rgba(255,255,255,0.1); color: ${s.statusColor};">${s.status}</span>
                </div>
                <div style="font-size: 0.8rem; color: var(--text-secondary);">${s.details}</div>
            </div>
        `).join("");

        document.getElementById("pipeline-modal").classList.remove("hidden");
    });

    document.getElementById("btn-payload").addEventListener("click", () => {
        if (!latestAnalysisResponse) return;
        document.getElementById("payload-content").textContent = JSON.stringify(latestAnalysisResponse, null, 2);
        document.getElementById("payload-modal").classList.remove("hidden");
    });

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

    document.getElementById("close-pipeline").addEventListener("click", () => {
        document.getElementById("pipeline-modal").classList.add("hidden");
    });
    
    document.getElementById("close-payload").addEventListener("click", () => {
        document.getElementById("payload-modal").classList.add("hidden");
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
        "LOOP_ERROR": "#a78bfa",
        "VARIABLE_ERROR": "#f59e0b",
        "ARRAY_ERROR": "#34d399",
        "METHOD_ERROR": "#f472b6",
        "CORRECT": "#22c55e"
    };
    const color = colors[pred.label] || "var(--accent-blue)";

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
    
    const trace = data.model_trace;
    if (trace) {
        document.getElementById("trace-broad-model").textContent = trace.broad_model;
        document.getElementById("trace-broad-pred").textContent = trace.original_broad_prediction || trace.broad_prediction || "N/A";
        document.getElementById("trace-broad-pred-final").textContent = trace.final_broad_prediction || "N/A";
        document.getElementById("trace-reason-model").textContent = trace.reason_model;
        document.getElementById("trace-reason-pred").textContent = trace.original_reason_prediction || trace.reason_prediction || "N/A";
        document.getElementById("trace-reason-final").textContent = trace.final_reason_group || trace.reason_group_final || "N/A";
        document.getElementById("trace-reason-adjusted").textContent = trace.reason_group_adjusted || "No";
        document.getElementById("trace-feedback-src").textContent = trace.feedback_source;
        document.getElementById("trace-rule-override").textContent = trace.rule_override_applied ? `Yes (${trace.rule_override_reason})` : "No";
        document.getElementById("trace-correctness-validated").textContent = trace.correctness_validation_applied ? `Yes (${trace.correctness_validation_reason})` : "No";
    }

    const ev = data.evidence;
    if (ev) {
        document.getElementById("evidence-note").textContent = ev.evidence_note;
        const snipCont = document.getElementById("evidence-snippet-container");
        if (ev.evidence_found && ev.matched_snippet) {
            snipCont.textContent = ev.matched_snippet;
            snipCont.style.display = "block";
        } else {
            snipCont.style.display = "none";
        }
    }
    
    const confBadge = document.getElementById("diag-confidence");
    confBadge.textContent = `${pred.confidence_level} Confidence`;
    confBadge.style.background = pred.confidence_level === "High" ? "rgba(34, 197, 94, 0.1)" : "rgba(245, 158, 11, 0.1)";
    confBadge.style.color = pred.confidence_level === "High" ? "#34d399" : "#f59e0b";

    document.getElementById("diag-reason").textContent = expl.reason;
    document.getElementById("diag-miscon").textContent = expl.misconception;
    document.getElementById("diag-fix").textContent = expl.suggested_fix;
    document.getElementById("diag-next-step").textContent = adaptive.next_learning_step;
    document.getElementById("diag-insight").textContent = expl.beginner_explanation;

    document.getElementById("diag-game-name").textContent = gamify.recommended_activity;
    document.getElementById("diag-game-meta").textContent = `${gamify.game_type} • ${gamify.difficulty} intensity`;
    document.getElementById("diag-badge").textContent = gamify.reward_badge;
    
    const gameIcons = { "LOOP_ERROR": "🌀", "ARRAY_ERROR": "📦", "VARIABLE_ERROR": "💾", "METHOD_ERROR": "⚙️", "CORRECT": "🎉" };
    document.getElementById("diag-game-icon").textContent = gameIcons[pred.label] || "🎮";

    document.getElementById("diag-alignment").textContent = data.pretest_alignment.message;

    // ── Feature 2: Populate XAI Explanation Card ──────────────────────────
    const xai = data.xai_explanation;
    if (xai) {
        document.getElementById("xai-confidence-badge").textContent = `${xai.xai_confidence_pct}%`;
        document.getElementById("xai-confidence-bar").style.width = `${xai.xai_confidence_pct}%`;
        const barEl = document.getElementById("xai-confidence-bar");
        // Color the bar: green if high, amber if medium, red if low
        if (xai.xai_confidence_pct >= 75) barEl.style.background = "linear-gradient(90deg,#34d399,#22c55e)";
        else if (xai.xai_confidence_pct >= 55) barEl.style.background = "linear-gradient(90deg,#f59e0b,#fbbf24)";
        else barEl.style.background = "linear-gradient(90deg,#ef4444,#f87171)";

        document.getElementById("xai-label").textContent = xai.xai_label;
        document.getElementById("xai-narrative").textContent = xai.xai_narrative;

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
    }}

// Chart.js instance references — destroyed and recreated on each refresh
let _lineChart = null;
let _barChart  = null;

async function refreshGlobalState(studentId) {
    try {
        const [historyRes, summaryRes, analyticsRes, reportRes] = await Promise.allSettled([
            ErrorAPI.getHistory(studentId),
            ErrorAPI.getSummary(studentId),
            ErrorAPI.getAnalytics(studentId),
            ErrorAPI.getLearningReport(studentId),
        ]);

        const historyData   = historyRes.status === "fulfilled"   ? historyRes.value   : { total: 0, history: [] };
        const summaryData   = summaryRes.status === "fulfilled"   ? summaryRes.value   : { total_analyses: 0, most_frequent_error: "None" };
        const analyticsData = analyticsRes.status === "fulfilled" ? analyticsRes.value : { has_data: false };
        const reportData    = reportRes.status === "fulfilled"    ? reportRes.value    : { has_data: false };

        // ── Stats Bar ─────────────────────────────────────────────────
        const statTotal = document.getElementById("stat-total");
        if (statTotal) statTotal.textContent = summaryData.total_analyses || 0;
        const statTopError = document.getElementById("stat-top-error");
        if (statTopError) statTopError.textContent = summaryData.most_frequent_error || "None";

        // ── History List ──────────────────────────────────────────────
        const histCont = document.getElementById("history-container");
        if (historyData.total === 0) {
            histCont.innerHTML = `<div style="text-align:center; padding: 2rem; color: var(--text-secondary); font-size: 0.8rem;">No entries found in registry.</div>`;
        } else {
            histCont.innerHTML = "";
            // Newest first
            const reversed = [...historyData.history].reverse();
            reversed.forEach((item, idx) => {
                const el = document.createElement("div");
                el.className = "history-item";
                el.dataset.code = encodeURIComponent(item.code || "");
                el.style.cssText = "padding: 0.6rem 0.8rem; background: rgba(255,255,255,0.03); border-radius: 6px; border: 1px solid rgba(255,255,255,0.05); cursor: pointer; transition: background 0.2s, border-color 0.2s;";
                el.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                        <span style="font-weight: 700; font-size: 0.65rem; color: #4a90e2;">${item.label}</span>
                        <span style="font-size: 0.6rem; color: var(--text-secondary);">${new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <div style="font-size: 0.75rem; color: var(--text-primary);">${item.concept}</div>
                `;
                el.addEventListener("mouseover", () => {
                    if (!el.dataset.selected) el.style.background = "rgba(255,255,255,0.06)";
                });
                el.addEventListener("mouseout", () => {
                    if (!el.dataset.selected) el.style.background = "rgba(255,255,255,0.03)";
                });
                el.addEventListener("click", async () => {
                    // Deselect all items
                    histCont.querySelectorAll("[data-selected]").forEach(prev => {
                        delete prev.dataset.selected;
                        prev.style.background = "rgba(255,255,255,0.03)";
                        prev.style.borderColor = "rgba(255,255,255,0.05)";
                    });
                    // Highlight selected
                    el.dataset.selected = "1";
                    el.style.background = "rgba(74, 144, 226, 0.12)";
                    el.style.borderColor = "rgba(74, 144, 226, 0.4)";

                    const rawCode = decodeURIComponent(el.dataset.code || "");
                    if (rawCode) {
                        try {
                            const res = await ErrorAPI.analyze({
                                student_id: studentId,
                                code: rawCode,
                                pretest_results: { variables: 3, loops: 3, arrays: 3, methods: 3 }
                            });
                            if (res && res.prediction) {
                                showTelemetryResult(res);
                            }
                        } catch (e) {
                            console.warn("Failed to load history item telemetry", e);
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
                    }).catch(() => {});
                }
            }
        }


        // ── Feature 1: Analytics Dashboard ────────────────────────────
        if (analyticsData.has_data && analyticsData.total_submissions >= 2) {
            document.getElementById("analytics-section").classList.remove("hidden");
            const anl = analyticsData;

            // Stat cards
            document.getElementById("anl-total").textContent = anl.total_submissions;
            const impPct = anl.overall_improvement_pct;
            document.getElementById("anl-improvement").textContent = `${Math.abs(impPct)}%`;
            document.getElementById("anl-improvement").style.color = impPct >= 0 ? "var(--accent-green)" : "#ef4444";
            document.getElementById("anl-improvement-arrow").textContent = impPct > 0 ? "↑" : (impPct < 0 ? "↓" : "→");
            document.getElementById("anl-improvement-arrow").style.color = impPct >= 0 ? "var(--accent-green)" : "#ef4444";

            const labelShort = { LOOP_ERROR:"Loops", VARIABLE_ERROR:"Variables", ARRAY_ERROR:"Arrays", METHOD_ERROR:"Methods" };
            document.getElementById("anl-worst").textContent = anl.most_problematic ? labelShort[anl.most_problematic] || anl.most_problematic : "None";
            document.getElementById("anl-best").textContent  = anl.most_improved  ? (labelShort[anl.most_improved]  || anl.most_improved)  + " ↑" : "None yet";

            // Improvement per-category cards
            const catColors = { LOOP_ERROR:"#a78bfa", VARIABLE_ERROR:"#f59e0b", ARRAY_ERROR:"#34d399", METHOD_ERROR:"#f472b6" };
            document.getElementById("anl-improvement-cards").innerHTML = Object.entries(anl.improvement_scores).map(([cat, data]) => {
                const col = catColors[cat] || "#4a90e2";
                const arrow = data.direction === "improved" ? "↑" : (data.direction === "worse" ? "↓" : "→");
                const arrowColor = data.direction === "improved" ? "#34d399" : (data.direction === "worse" ? "#ef4444" : "#8899aa");
                return `
                    <div class="card" style="padding:0.8rem; border-left: 3px solid ${col};">
                        <div style="font-size:0.65rem;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:0.3rem;">${labelShort[cat]}</div>
                        <div style="display:flex;align-items:baseline;gap:0.3rem;">
                            <span style="font-size:1.4rem;font-weight:800;color:${col};">${Math.abs(data.pct)}%</span>
                            <span style="font-size:1rem;color:${arrowColor};font-weight:700;">${arrow}</span>
                        </div>
                        <div style="font-size:0.65rem;color:var(--text-secondary);margin-top:0.2rem;">${data.first} → ${data.second} errors</div>
                    </div>`;
            }).join("");

            // ── Line chart: total errors per week ──────────────────────
            const weekLabels  = anl.weekly_totals.map(w => w.week);
            const errorCounts = anl.weekly_totals.map(w => w.total_errors);
            const correctCounts = anl.weekly_totals.map(w => w.correct);

            if (_lineChart) { _lineChart.destroy(); _lineChart = null; }
            const lineCtx = document.getElementById("anl-line-chart");
            if (lineCtx) {
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
                        responsive: true, maintainAspectRatio: false,
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

            // ── Bar chart: errors by category ──────────────────────────
            const catLabels = Object.keys(anl.total_counts || {}).map(k => labelShort[k] || k);
            const catValues = Object.values(anl.total_counts || {});
            const barColors = Object.keys(anl.total_counts || {}).map(k => catColors[k] || "#4a90e2");

            if (_barChart) { _barChart.destroy(); _barChart = null; }
            const barCtx = document.getElementById("anl-bar-chart");
            if (barCtx) {
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
                    ${r.avoid_patterns.slice(0,4).map(p => `
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
