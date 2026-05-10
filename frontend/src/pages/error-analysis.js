/**
 * Component 2: Intelligent Error Pattern Detector — Diagnostic Dashboard
 * ======================================================================
 * Premium 3-column layout for research-grade error analysis.
 */

import { ErrorAPI } from "../api/api.js";

export async function renderErrorAnalysis(container) {
    const studentId = "demo_student";
    let latestAnalysisResponse = null;

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

            <!-- Main Workspace: 3 Columns -->
            <div class="workspace-grid" style="display: grid; grid-template-columns: 320px 1fr 300px; gap: 1.5rem; flex: 1; min-height: 600px;">
                
                <!-- Column 1: The Lab (Input) -->
                <div class="lab-col" style="display: flex; flex-direction: column; gap: 1rem;">
                    <div class="card glass-card" style="height: 100%; display: flex; flex-direction: column;">
                        <div style="margin-bottom: 1rem;">
                            <h3 style="font-size: 1.1rem; margin: 0; display: flex; align-items: center; gap: 0.5rem;">
                                <span style="font-size: 1.2rem;">🔬</span> Code Lab
                            </h3>
                        </div>
                        
                        <div style="position: relative; flex: 1;">
                            <textarea id="code-input" class="input-field" 
                                placeholder="// Paste Java code here..." 
                                style="height: 100%; width: 100%; font-family: 'Fira Code', monospace; font-size: 0.85rem; padding: 1rem; background: #0d1117; border-radius: 8px; resize: none;"></textarea>
                            <div style="position: absolute; top: 10px; right: 10px; font-size: 0.6rem; color: #4a5568;">JAVA 17</div>
                        </div>

                        <div style="margin-top: 1rem;">
                            <button id="analyze-btn" class="btn btn-primary" style="width: 100%; padding: 0.8rem; display: flex; justify-content: center; align-items: center; gap: 0.5rem;">
                                <span id="btn-icon">⚡</span> <span id="btn-text">Run Diagnostic</span>
                            </button>
                            <button id="clear-btn" style="width: 100%; background: none; border: none; color: var(--text-secondary); font-size: 0.8rem; cursor: pointer; margin-top: 0.5rem;">Clear Editor</button>
                        </div>

                        <!-- Pre-test Context -->
                        <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
                            <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.8rem; font-weight: 600;">STUDENT CONTEXT (PRE-TEST)</div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                                <div class="mini-input">
                                    <label style="font-size: 0.6rem; color: #718096;">Loops</label>
                                    <input type="number" id="pre-loop" value="3" min="0" max="5" style="width: 100%; background: #1a2332; border: 1px solid #2d3748; color: white; padding: 2px 5px; border-radius: 4px;">
                                </div>
                                <div class="mini-input">
                                    <label style="font-size: 0.6rem; color: #718096;">Arrays</label>
                                    <input type="number" id="pre-arr" value="3" min="0" max="5" style="width: 100%; background: #1a2332; border: 1px solid #2d3748; color: white; padding: 2px 5px; border-radius: 4px;">
                                </div>
                                <div class="mini-input">
                                    <label style="font-size: 0.6rem; color: #718096;">Variables</label>
                                    <input type="number" id="pre-var" value="3" min="0" max="5" style="width: 100%; background: #1a2332; border: 1px solid #2d3748; color: white; padding: 2px 5px; border-radius: 4px;">
                                </div>
                                <div class="mini-input">
                                    <label style="font-size: 0.6rem; color: #718096;">Methods</label>
                                    <input type="number" id="pre-meth" value="3" min="0" max="5" style="width: 100%; background: #1a2332; border: 1px solid #2d3748; color: white; padding: 2px 5px; border-radius: 4px;">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Column 2: Insight Engine (Results) -->
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
                                    <div><strong>Broad Prediction:</strong> <span id="trace-broad-pred"></span></div>
                                    <div style="margin-top:0.4rem;"><strong>Reason Model:</strong> <span id="trace-reason-model"></span></div>
                                    <div><strong>Original Reason Prediction:</strong> <span id="trace-reason-pred"></span></div>
                                    <div><strong>Final Reason Group:</strong> <span id="trace-reason-final"></span></div>
                                    <div><strong>Reason Group Adjusted:</strong> <span id="trace-reason-adjusted"></span></div>
                                    <div style="margin-top:0.4rem;"><strong>Feedback Source:</strong> <span id="trace-feedback-src"></span></div>
                                    <div><strong>Rule Override Applied:</strong> <span id="trace-rule-override"></span></div>
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

                        <!-- Alignment Notification -->
                        <div id="diag-alignment" style="padding: 0.8rem; border-radius: 8px; font-size: 0.8rem; background: rgba(74, 144, 226, 0.05); border: 1px dashed rgba(74, 144, 226, 0.3); color: var(--text-secondary); text-align: center;">
                        </div>
                    </div>
                </div>

                <!-- Column 3: The Record (History) -->
                <div class="record-col" style="display: flex; flex-direction: column; gap: 1.2rem;">
                    <div class="card glass-card" style="flex: 1; display: flex; flex-direction: column; overflow: hidden;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <h3 style="font-size: 0.95rem; margin: 0;">Diagnostic History</h3>
                            <span style="font-size: 0.7rem; color: var(--text-secondary);">RECENTS</span>
                        </div>
                        <div id="history-container" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 0.8rem; padding-right: 5px;">
                            <div class="spinner" style="margin: 2rem auto;"></div>
                        </div>
                    </div>

                </div>
                </div>
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

    const analyzeBtn = document.getElementById("analyze-btn");
    const codeInput = document.getElementById("code-input");
    const welcomeView = document.getElementById("welcome-view");
    const resultView = document.getElementById("result-view");

    // Load initial stats
    refreshGlobalState(studentId);

    analyzeBtn.addEventListener("click", async () => {
        const code = codeInput.value.trim();
        if (!code) return alert("System requires source code for telemetry analysis.");

        const pretest = {
            variables: parseInt(document.getElementById("pre-var").value) || 3,
            loops: parseInt(document.getElementById("pre-loop").value) || 3,
            arrays: parseInt(document.getElementById("pre-arr").value) || 3,
            methods: parseInt(document.getElementById("pre-meth").value) || 3,
        };

        analyzeBtn.disabled = true;
        document.getElementById("btn-text").textContent = "Processing...";
        document.getElementById("btn-icon").textContent = "⚙️";
        
        try {
            const res = await ErrorAPI.analyze({
                student_id: studentId,
                code: code,
                pretest_results: pretest
            });

            if (res.success) {
                latestAnalysisResponse = res;
                welcomeView.classList.add("hidden");
                const invalidView = document.getElementById("invalid-view");
                if (invalidView) invalidView.classList.add("hidden");
                resultView.classList.remove("hidden");
                updateInsightEngine(res);
                refreshGlobalState(studentId);
            } else if (res.error_type === "INVALID_JAVA_INPUT") {
                welcomeView.classList.add("hidden");
                resultView.classList.add("hidden");
                const invalidView = document.getElementById("invalid-view");
                if (invalidView) invalidView.classList.remove("hidden");
            } else {
                alert("Diagnostic Error: " + res.error);
            }
        } catch (err) {
            console.error(err);
            alert("Connection lost. Backend service unresponsive.");
        } finally {
            analyzeBtn.disabled = false;
            document.getElementById("btn-text").textContent = "Run Diagnostic";
            document.getElementById("btn-icon").textContent = "⚡";
        }
    });

    document.getElementById("clear-btn").addEventListener("click", () => {
        codeInput.value = "";
        resultView.classList.add("hidden");
        const invalidView = document.getElementById("invalid-view");
        if (invalidView) invalidView.classList.add("hidden");
        welcomeView.classList.remove("hidden");
    });

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
            { step: "5. Broad Error Prediction", status: "Completed", statusColor: "#34d399", details: `Model 1 predicts the broad error category.<br/><strong>Predicted:</strong> ${d.model_trace?.broad_prediction || d.broad_label || 'N/A'}` },
            { step: "6. Reason Group Prediction", status: "Completed", statusColor: "#34d399", details: `Model 2 predicts the reason group.<br/><strong>Predicted:</strong> ${d.model_trace?.reason_prediction || d.reason_group_original || d.reason_group || 'N/A'}` },
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
    if (data.override_applied) {
        badgesHtml += `<span style="font-size: 0.65rem; background: rgba(245, 158, 11, 0.1); color: #f59e0b; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(245, 158, 11, 0.3);">Corrected by Safety Validation</span>`;
    }
    if (data.reason_group_adjusted) {
        badgesHtml += `<span style="font-size: 0.65rem; background: rgba(245, 158, 11, 0.1); color: #f59e0b; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(245, 158, 11, 0.3);">Reason Group Adjusted</span>`;
    }
    document.getElementById("diag-badges").innerHTML = badgesHtml;
    
    const trace = data.model_trace;
    if (trace) {
        document.getElementById("trace-broad-model").textContent = trace.broad_model;
        document.getElementById("trace-broad-pred").textContent = trace.broad_prediction;
        document.getElementById("trace-reason-model").textContent = trace.reason_model;
        document.getElementById("trace-reason-pred").textContent = trace.reason_prediction;
        document.getElementById("trace-reason-final").textContent = trace.reason_group_final || "N/A";
        document.getElementById("trace-reason-adjusted").textContent = trace.reason_group_adjusted || "No";
        document.getElementById("trace-feedback-src").textContent = trace.feedback_source;
        document.getElementById("trace-rule-override").textContent = trace.rule_override_applied ? `Yes (${trace.rule_override_reason})` : "No";
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

}

async function refreshGlobalState(studentId) {
    try {
        const historyData = await ErrorAPI.getHistory(studentId);
        const summaryData = await ErrorAPI.getSummary(studentId);

        // Update Stats Bar
        document.getElementById("stat-total").textContent = summaryData.total_analyses || 0;
        document.getElementById("stat-top-error").textContent = summaryData.most_frequent_error || "None";

        // Update History List
        const histCont = document.getElementById("history-container");
        if (historyData.total === 0) {
            histCont.innerHTML = `<div style="text-align:center; padding: 2rem; color: var(--text-secondary); font-size: 0.8rem;">No entries found in registry.</div>`;
        } else {
            histCont.innerHTML = historyData.history.reverse().map(item => `
                <div style="padding: 0.6rem 0.8rem; background: rgba(255,255,255,0.03); border-radius: 6px; border: 1px solid rgba(255,255,255,0.05); cursor:pointer; transition: 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='rgba(255,255,255,0.03)'">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                        <span style="font-weight: 700; font-size: 0.65rem; color: #4a90e2;">${item.label}</span>
                        <span style="font-size: 0.6rem; color: var(--text-secondary);">${new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <div style="font-size: 0.75rem; color: var(--text-primary);">${item.concept}</div>
                </div>
            `).join("");
        }
    } catch (err) {
        console.warn("Global state sync failed", err);
    }
}
