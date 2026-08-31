/**
 * Teacher Dashboard
 * =================
 * Overview dashboard for Educators, Curriculum Managers, and Instructors.
 * Displays live database telemetry:
 *   - Real registered students roster from Firestore database
 *   - Approved question bank count
 *   - Pending question review queue count
 *   - Quick action shortcuts to Curriculum, Queue, Generator, and Analytics
 *   - Strictly NO mock students or fake demo data
 */

import { SchemaMasteryAPI, MasteryAPI } from "../../api/api.js";
import { getCurrentUser } from "../../utils/auth.js";

export async function renderTeacherDashboard(container) {
    const user = getCurrentUser();
    const teacherName = user?.name || user?.displayName || "Educator";

    container.innerHTML = `
        <div class="teacher-dashboard" style="max-width: 1320px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem;">
            <!-- Header -->
            <div class="ea-header" style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 1rem; padding: 1.5rem 1.75rem; box-shadow: var(--shadow-sm); display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
                <div>
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.35rem;">
                        <span class="badge badge-primary" style="background: #EEF2FF; color: #4F46E5; font-weight: 700; font-size: 0.75rem; padding: 0.25rem 0.65rem; border-radius: 9999px;">
                            <i class="fa-solid fa-chalkboard-user"></i> Faculty Workspace
                        </span>
                        <span style="font-size: 0.78rem; color: #64748B;">LMS Educator Portal</span>
                    </div>
                    <h1 class="ea-title" style="font-size: 1.6rem; font-weight: 800; color: #0F172A; margin: 0; letter-spacing: -0.3px;">Welcome, ${teacherName}</h1>
                    <p class="ea-subtitle" style="color: #64748B; margin: 0.3rem 0 0 0; font-size: 0.9rem;">Manage curriculum question items, review AI questions, and monitor real registered student telemetry.</p>
                </div>
                <div class="ea-header-actions" style="display: flex; gap: 0.6rem;">
                    <a href="#/teacher/questions/generate" class="btn btn-primary" style="padding: 0.6rem 1.2rem; font-size: 0.88rem; font-weight: 700; border-radius: 8px; display: inline-flex; align-items: center; gap: 0.45rem; background: #2563EB; color: #FFFFFF; text-decoration: none; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);">
                        <i class="fa-solid fa-plus-circle"></i> Generate Question Bank
                    </a>
                </div>
            </div>

            <!-- Stats Bar (Live DB Metrics) -->
            <div class="ea-metrics-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem;">
                <!-- Registered Students Metric -->
                <div class="ea-metric-card" style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 14px; padding: 1.25rem; box-shadow: var(--shadow-sm); display: flex; align-items: center; gap: 1rem;">
                    <div class="ea-metric-icon purple" style="width: 48px; height: 48px; border-radius: 12px; background: #EDE9FE; color: #7C3AED; display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">
                        <i class="fa-solid fa-user-graduate"></i>
                    </div>
                    <div class="ea-metric-info">
                        <span class="ea-metric-label" style="font-size: 0.8rem; font-weight: 600; color: #64748B; display: block;">Registered Students</span>
                        <h3 class="ea-metric-val" id="tea-stat-students" style="font-size: 1.5rem; font-weight: 800; color: #0F172A; margin: 0.1rem 0;">...</h3>
                        <span class="ea-metric-sub" style="font-size: 0.74rem; color: #7C3AED; font-weight: 600;">Real database users</span>
                    </div>
                </div>

                <!-- Approved Questions Metric -->
                <div class="ea-metric-card" style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 14px; padding: 1.25rem; box-shadow: var(--shadow-sm); display: flex; align-items: center; gap: 1rem;">
                    <div class="ea-metric-icon blue" style="width: 48px; height: 48px; border-radius: 12px; background: #EEF2FF; color: #2563EB; display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">
                        <i class="fa-solid fa-layer-group"></i>
                    </div>
                    <div class="ea-metric-info">
                        <span class="ea-metric-label" style="font-size: 0.8rem; font-weight: 600; color: #64748B; display: block;">Approved Questions</span>
                        <h3 class="ea-metric-val" id="tea-stat-approved" style="font-size: 1.5rem; font-weight: 800; color: #0F172A; margin: 0.1rem 0;">...</h3>
                        <span class="ea-metric-sub" style="font-size: 0.74rem; color: #16A34A; font-weight: 600;">Active in post-test bank</span>
                    </div>
                </div>

                <!-- Pending Review Metric -->
                <div class="ea-metric-card" style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 14px; padding: 1.25rem; box-shadow: var(--shadow-sm); display: flex; align-items: center; gap: 1rem;">
                    <div class="ea-metric-icon amber" style="width: 48px; height: 48px; border-radius: 12px; background: #FEF3C7; color: #D97706; display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">
                        <i class="fa-solid fa-inbox"></i>
                    </div>
                    <div class="ea-metric-info">
                        <span class="ea-metric-label" style="font-size: 0.8rem; font-weight: 600; color: #64748B; display: block;">Pending Review</span>
                        <h3 class="ea-metric-val" id="tea-stat-pending" style="font-size: 1.5rem; font-weight: 800; color: #0F172A; margin: 0.1rem 0;">...</h3>
                        <span class="ea-metric-sub" style="font-size: 0.74rem; color: #D97706; font-weight: 600;">Awaiting educator review</span>
                    </div>
                </div>
            </div>

            <!-- Real Registered Students Cohort Section -->
            <div class="card teacher-students-section" style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 16px; padding: 1.75rem; box-shadow: var(--shadow-sm);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.75rem;">
                    <div>
                        <h2 style="font-size: 1.2rem; font-weight: 800; color: #0F172A; margin: 0 0 0.2rem 0;">Registered Students Roster</h2>
                        <p style="font-size: 0.84rem; color: #64748B; margin: 0;">Live database records of students registered on CodeQuest.</p>
                    </div>
                    <a href="#/teacher/analytics" class="btn btn-outline btn-sm" style="padding: 0.4rem 0.85rem; font-size: 0.82rem; font-weight: 600; border-radius: 6px; border: 1px solid #CBD5E1; color: #0F172A; text-decoration: none; display: inline-flex; align-items: center; gap: 0.35rem;">
                        <i class="fa-solid fa-chart-line"></i> Deep Analytics
                    </a>
                </div>

                <div id="tea-students-container">
                    <div style="text-align: center; padding: 2rem; color: #64748B;">
                        <div class="spinner" style="width: 24px; height: 24px; border-width: 2px; display: inline-block; margin-bottom: 0.5rem;"></div>
                        <p style="font-size: 0.88rem; margin: 0;">Fetching registered students from database...</p>
                    </div>
                </div>
            </div>

            <!-- Component 4 Post-Test Results -->
            <div class="card teacher-posttest-section" style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 16px; padding: 1.75rem; box-shadow: var(--shadow-sm);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.75rem;">
                    <div>
                        <h2 style="font-size: 1.2rem; font-weight: 800; color: #0F172A; margin: 0 0 0.2rem 0;">Post-Test Analytics</h2>
                        <p style="font-size: 0.84rem; color: #64748B; margin: 0;">Completed Component 4 understanding checks saved locally even when Firestore is unavailable.</p>
                    </div>
                </div>

                <div id="tea-posttest-results-container">
                    <div style="text-align: center; padding: 2rem; color: #64748B;">
                        <div class="spinner" style="width: 24px; height: 24px; border-width: 2px; display: inline-block; margin-bottom: 0.5rem;"></div>
                        <p style="font-size: 0.88rem; margin: 0;">Loading post-test submissions...</p>
                    </div>
                </div>
            </div>

            <!-- Quick Action Cards Grid -->
            <div class="teacher-actions-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem;">
                <div class="card teacher-card" style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 14px; padding: 1.4rem; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <div class="teacher-card-icon blue" style="font-size: 1.4rem; color: #2563EB; margin-bottom: 0.6rem;"><i class="fa-solid fa-wand-magic-sparkles"></i></div>
                        <h3 style="font-size: 1.05rem; font-weight: 700; color: #0F172A; margin: 0 0 0.35rem 0;">AI Question Generator</h3>
                        <p style="font-size: 0.84rem; color: #64748B; margin: 0 0 1.2rem 0; line-height: 1.5;">Generate blueprint-compliant Java questions across specific misconception patterns and cognitive tiers with balanced options.</p>
                    </div>
                    <a href="#/teacher/questions/generate" class="btn btn-primary btn-block" style="padding: 0.55rem 1rem; font-size: 0.84rem; font-weight: 700; border-radius: 8px; text-align: center; display: block; background: #2563EB; color: #FFFFFF; text-decoration: none;">Open Generator</a>
                </div>

                <div class="card teacher-card" style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 14px; padding: 1.4rem; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <div class="teacher-card-icon amber" style="font-size: 1.4rem; color: #D97706; margin-bottom: 0.6rem;"><i class="fa-solid fa-clipboard-check"></i></div>
                        <h3 style="font-size: 1.05rem; font-weight: 700; color: #0F172A; margin: 0 0 0.35rem 0;">Review Queue</h3>
                        <p style="font-size: 0.84rem; color: #64748B; margin: 0 0 1.2rem 0; line-height: 1.5;">Review newly generated questions, edit distractor options, and approve or reject submissions before student access.</p>
                    </div>
                    <a href="#/teacher/questions/pending" class="btn btn-outline btn-block" style="padding: 0.55rem 1rem; font-size: 0.84rem; font-weight: 600; border-radius: 8px; text-align: center; display: block; border: 1px solid #CBD5E1; background: #FFFFFF; color: #0F172A; text-decoration: none;">Inspect Queue</a>
                </div>

                <div class="card teacher-card" style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 14px; padding: 1.4rem; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <div class="teacher-card-icon green" style="font-size: 1.4rem; color: #059669; margin-bottom: 0.6rem;"><i class="fa-solid fa-database"></i></div>
                        <h3 style="font-size: 1.05rem; font-weight: 700; color: #0F172A; margin: 0 0 0.35rem 0;">Curriculum Question Bank</h3>
                        <p style="font-size: 0.84rem; color: #64748B; margin: 0 0 1.2rem 0; line-height: 1.5;">Search, filter, edit, activate/deactivate, and maintain the live question catalog used across student assessment checks.</p>
                    </div>
                    <a href="#/teacher/questions/approved" class="btn btn-outline btn-block" style="padding: 0.55rem 1rem; font-size: 0.84rem; font-weight: 600; border-radius: 8px; text-align: center; display: block; border: 1px solid #CBD5E1; background: #FFFFFF; color: #0F172A; text-decoration: none;">View Bank</a>
                </div>

                <div class="card teacher-card" style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 14px; padding: 1.4rem; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <div class="teacher-card-icon purple" style="font-size: 1.4rem; color: #7C3AED; margin-bottom: 0.6rem;"><i class="fa-solid fa-chart-pie"></i></div>
                        <h3 style="font-size: 1.05rem; font-weight: 700; color: #0F172A; margin: 0 0 0.35rem 0;">Mastery Analytics</h3>
                        <p style="font-size: 0.84rem; color: #64748B; margin: 0 0 1.2rem 0; line-height: 1.5;">Inspect student cohort performance distributions, error frequencies, and ML schema mastery levels.</p>
                    </div>
                    <a href="#/teacher/analytics" class="btn btn-outline btn-block" style="padding: 0.55rem 1rem; font-size: 0.84rem; font-weight: 600; border-radius: 8px; text-align: center; display: block; border: 1px solid #CBD5E1; background: #FFFFFF; color: #0F172A; text-decoration: none;">View Analytics</a>
                </div>
            </div>
        </div>
    `;

    // Fetch live counts & real registered students from DB
    try {
        const [pendingRes, approvedRes, masteryRes, authUsersRes, postTestRes] = await Promise.allSettled([
            SchemaMasteryAPI.getPendingQuestions(),
            SchemaMasteryAPI.getQuestionBank("", true),
            MasteryAPI.getStudents(),
            fetch("/api/auth/users").then(r => r.json()).catch(() => ({ students: [] })),
            SchemaMasteryAPI.getPostTestResults(),
        ]);

        const penCount = (pendingRes.status === "fulfilled" && pendingRes.value?.questions) ? pendingRes.value.questions.length : 0;
        const appCount = (approvedRes.status === "fulfilled" && approvedRes.value?.questions) ? approvedRes.value.questions.length : 0;
        
        const masteryStudents = (masteryRes.status === "fulfilled" && masteryRes.value) ? (Array.isArray(masteryRes.value) ? masteryRes.value : (masteryRes.value.students || [])) : [];
        const authStudents = (authUsersRes.status === "fulfilled" && authUsersRes.value?.students) ? authUsersRes.value.students : [];
        const postTestResults = (postTestRes.status === "fulfilled" && postTestRes.value?.results) ? postTestRes.value.results : [];

        // Local storage registered students
        let localStudents = [];
        try {
            localStudents = JSON.parse(localStorage.getItem("codequest_registered_students") || "[]");
        } catch (e) {}

        // Active user if student
        const activeUser = getCurrentUser();
        if (activeUser && activeUser.role !== "teacher" && activeUser.role !== "admin") {
            localStudents.push(activeUser);
        }

        // Merge all real students by id / email (Zero data loss)
        const studentMap = new Map();

        // 1. Add auth students
        authStudents.forEach(s => {
            const key = s.email || s.uid || s.id || s.studentId;
            if (key) studentMap.set(key, { ...s, studentId: s.uid || s.id || key, studentName: s.display_name || s.name || key });
        });

        // 2. Add mastery students (merges telemetry)
        masteryStudents.forEach(s => {
            const key = s.email || s.studentId || s.uid || s.id;
            if (key) {
                const existing = studentMap.get(key) || {};
                studentMap.set(key, { ...existing, ...s });
            }
        });

        // 3. Add local students
        localStudents.forEach(s => {
            const key = s.email || s.uid || s.id;
            if (key) {
                const existing = studentMap.get(key) || {};
                studentMap.set(key, {
                    ...existing,
                    studentId: s.uid || s.id || key,
                    studentName: s.name || s.displayName || s.display_name || existing.studentName || "Student",
                    email: s.email || existing.email,
                    created_at: s.joinedAt || s.created_at || existing.created_at,
                    ...s
                });
            }
        });

        postTestResults.forEach(r => {
            const key = r.student_email || r.student_id;
            if (key) {
                const existing = studentMap.get(key) || {};
                studentMap.set(key, {
                    ...existing,
                    studentId: r.student_id || existing.studentId || key,
                    studentName: r.student_name || existing.studentName || r.student_id || "Student",
                    email: r.student_email || existing.email,
                    overall_mastery: r.post_test_score ?? existing.overall_mastery ?? 0,
                    overall_state: r.learning_status || existing.overall_state || "Post-Test Submitted",
                    conceptName: r.concept_name,
                    postTestCompleted: true,
                    masteryLevel: r.mastery_level,
                    nextAction: r.next_action,
                    created_at: r.created_at || existing.created_at,
                });
            }
        });

        const students = Array.from(studentMap.values()).filter(s => s && (s.studentId || s.id || s.email));
        
        const pendingEl = document.getElementById("tea-stat-pending");
        const approvedEl = document.getElementById("tea-stat-approved");
        const studentsCountEl = document.getElementById("tea-stat-students");
        
        if (pendingEl) pendingEl.textContent = penCount;
        if (approvedEl) approvedEl.textContent = appCount;
        if (studentsCountEl) studentsCountEl.textContent = students.length;

        renderStudentsTable(students);
        renderPostTestResultsTable(postTestResults);

    } catch (e) {
        console.warn("Failed to fetch teacher dashboard data:", e);
        const studentsContainer = document.getElementById("tea-students-container");
        if (studentsContainer) {
            studentsContainer.innerHTML = `
                <div style="text-align: center; padding: 2.5rem 1rem; color: #64748B;">
                    <div style="font-size: 2rem; color: #94A3B8; margin-bottom: 0.5rem;"><i class="fa-solid fa-users-slash"></i></div>
                    <p style="margin: 0; font-weight: 600; color: #0F172A;">No registered student records found in database.</p>
                    <span style="font-size: 0.82rem; color: #64748B;">When new learners register on CodeQuest, their real database records will display here.</span>
                </div>
            `;
        }
        renderPostTestResultsTable([]);
    }
}

function renderPostTestResultsTable(results) {
    const container = document.getElementById("tea-posttest-results-container");
    if (!container) return;

    if (!results || results.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2.5rem 1rem; color: #64748B; background: #F8FAFC; border: 1px dashed #CBD5E1; border-radius: 12px;">
                <div style="font-size: 2rem; color: #94A3B8; margin-bottom: 0.5rem;"><i class="fa-solid fa-clipboard-question"></i></div>
                <h4 style="font-size: 0.98rem; font-weight: 700; color: #0F172A; margin: 0 0 0.25rem 0;">No post-test submissions yet.</h4>
            </div>
        `;
        return;
    }

    const rows = results.map((r) => {
        const studentLabel = r.student_name || r.student_email || r.student_id || "Student";
        const submittedAt = r.created_at ? new Date(r.created_at).toLocaleString() : "Saved locally";
        const score = Math.round((Number(r.post_test_score || 0) > 1 ? Number(r.post_test_score || 0) : Number(r.post_test_score || 0) * 100));
        const nextAction = r.next_action === "DONE" ? "DONE" : "LEARN_AGAIN";
        return `
            <tr style="border-bottom: 1px solid #F1F5F9;">
                <td style="padding: 0.85rem 1rem;">
                    <strong style="font-size: 0.86rem; color: #0F172A; display: block;">${escapeHtml(studentLabel)}</strong>
                    <span style="font-size: 0.74rem; color: #64748B;">${escapeHtml(r.student_email || r.student_id || "")}</span>
                </td>
                <td style="padding: 0.85rem 1rem; font-size: 0.84rem; color: #0F172A;">${escapeHtml(r.concept_name || "")}</td>
                <td style="padding: 0.85rem 1rem; font-size: 0.78rem; color: #64748B;">${escapeHtml(r.error_type || "")}</td>
                <td style="padding: 0.85rem 1rem; font-weight: 800; color: #2563EB;">${score}%</td>
                <td style="padding: 0.85rem 1rem; font-size: 0.84rem; color: #0F172A;">${escapeHtml(r.mastery_level || "")}</td>
                <td style="padding: 0.85rem 1rem; font-size: 0.84rem; color: #0F172A;">${escapeHtml(r.learning_status || "")}</td>
                <td style="padding: 0.85rem 1rem;">
                    <span class="badge" style="background: ${nextAction === "DONE" ? "#DCFCE7" : "#FEF3C7"}; color: ${nextAction === "DONE" ? "#16A34A" : "#D97706"}; font-weight: 700; font-size: 0.72rem; padding: 0.2rem 0.55rem; border-radius: 9999px;">${nextAction}</span>
                </td>
                <td style="padding: 0.85rem 1rem; font-size: 0.78rem; color: #64748B;">${escapeHtml(submittedAt)}</td>
                <td style="padding: 0.85rem 1rem; text-align: right;">
                    <button class="btn btn-outline btn-sm flow-context-btn" data-student="${escapeHtml(r.student_id || "")}" data-session="${escapeHtml(r.session_id || "")}" style="padding: 0.35rem 0.7rem; font-size: 0.76rem; border-radius: 6px; border: 1px solid #CBD5E1; background: #FFFFFF; color: #0F172A;">
                        View Flow Context
                    </button>
                </td>
            </tr>
        `;
    }).join("");

    container.innerHTML = `
        <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead>
                    <tr style="border-bottom: 1px solid #E2E8F0; background: #F8FAFC;">
                        <th style="padding: 0.75rem 1rem; font-size: 0.72rem; font-weight: 700; color: #64748B; text-transform: uppercase;">Student</th>
                        <th style="padding: 0.75rem 1rem; font-size: 0.72rem; font-weight: 700; color: #64748B; text-transform: uppercase;">Concept</th>
                        <th style="padding: 0.75rem 1rem; font-size: 0.72rem; font-weight: 700; color: #64748B; text-transform: uppercase;">Error Type</th>
                        <th style="padding: 0.75rem 1rem; font-size: 0.72rem; font-weight: 700; color: #64748B; text-transform: uppercase;">Score</th>
                        <th style="padding: 0.75rem 1rem; font-size: 0.72rem; font-weight: 700; color: #64748B; text-transform: uppercase;">Mastery</th>
                        <th style="padding: 0.75rem 1rem; font-size: 0.72rem; font-weight: 700; color: #64748B; text-transform: uppercase;">Status</th>
                        <th style="padding: 0.75rem 1rem; font-size: 0.72rem; font-weight: 700; color: #64748B; text-transform: uppercase;">Next</th>
                        <th style="padding: 0.75rem 1rem; font-size: 0.72rem; font-weight: 700; color: #64748B; text-transform: uppercase;">Submitted</th>
                        <th style="padding: 0.75rem 1rem; font-size: 0.72rem; font-weight: 700; color: #64748B; text-transform: uppercase; text-align: right;">Action</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
        <div id="flow-context-panel" style="margin-top: 1rem;"></div>
    `;

    container.querySelectorAll(".flow-context-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const panel = document.getElementById("flow-context-panel");
            if (!panel) return;
            panel.innerHTML = `<div style="padding: 1rem; color: #64748B;">Loading flow context...</div>`;
            try {
                const ctx = await SchemaMasteryAPI.getFlowContext(btn.dataset.student, btn.dataset.session);
                panel.innerHTML = renderFlowContextPanel(ctx);
            } catch (e) {
                panel.innerHTML = `<div style="padding: 1rem; color: #B91C1C; background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px;">Could not load flow context.</div>`;
            }
        });
    });
}

function renderFlowContextPanel(ctx) {
    const checks = [
        ["Pre-test score", ctx?.component_1?.pre_test_score != null],
        ["Error type", Boolean(ctx?.component_2?.error_type)],
        ["Error pattern score", ctx?.component_2?.error_pattern_score != null],
        ["Game completion", Boolean(ctx?.component_3?.learning_completed)],
        ["Post-test result", Boolean(ctx?.component_4?.post_test_found)],
    ];
    return `
        <div style="background: #F8FAFC; border: 1px solid #CBD5E1; border-radius: 10px; padding: 1rem;">
            <h4 style="margin: 0 0 0.75rem 0; color: #0F172A; font-size: 0.95rem;">Component Flow Context</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.6rem;">
                ${checks.map(([label, ok]) => `
                    <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; padding: 0.7rem;">
                        <span style="font-size: 0.78rem; color: #64748B;">${label}</span>
                        <strong style="display: block; margin-top: 0.2rem; color: ${ok ? "#16A34A" : "#D97706"};">${ok ? "Found" : "Missing"}</strong>
                    </div>
                `).join("")}
            </div>
        </div>
    `;
}

function renderStudentsTable(students) {
    const container = document.getElementById("tea-students-container");
    if (!container) return;

    if (!students || students.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2.5rem 1rem; color: #64748B; background: #F8FAFC; border: 1px dashed #CBD5E1; border-radius: 12px;">
                <div style="font-size: 2rem; color: #94A3B8; margin-bottom: 0.5rem;"><i class="fa-solid fa-user-slash"></i></div>
                <h4 style="font-size: 0.98rem; font-weight: 700; color: #0F172A; margin: 0 0 0.25rem 0;">No Registered Students Found</h4>
                <p style="font-size: 0.84rem; color: #64748B; margin: 0; max-width: 420px; margin: 0 auto;">When students register an account and take pre-tests or post-tests, their live progression profiles will populate this roster.</p>
            </div>
        `;
        return;
    }

    const rows = students.map((s, idx) => {
        const name = s.studentName || s.name || s.display_name || "Learner";
        const email = s.email || "Registered Student";
        const id = s.studentId || s.user_id || s.id || `STU-${idx + 1}`;
        const initial = name.charAt(0).toUpperCase();
        const masteryPct = s.overall_mastery !== undefined ? Math.round((Number(s.overall_mastery) > 1 ? Number(s.overall_mastery) : Number(s.overall_mastery) * 100)) : 0;
        const state = s.overall_state || (masteryPct > 0 ? "Developing" : "Enrolled");
        
        let stateBadge = `<span class="badge" style="background: #EFF6FF; color: #2563EB; font-weight: 600; font-size: 0.75rem; padding: 0.2rem 0.6rem; border-radius: 9999px;">${state}</span>`;
        if (state.toLowerCase().includes("master") || masteryPct >= 80) {
            stateBadge = `<span class="badge" style="background: #DCFCE7; color: #16A34A; font-weight: 600; font-size: 0.75rem; padding: 0.2rem 0.6rem; border-radius: 9999px;">Mastered</span>`;
        } else if (state.toLowerCase().includes("fragile") || (masteryPct > 0 && masteryPct < 40)) {
            stateBadge = `<span class="badge" style="background: #FEF3C7; color: #D97706; font-weight: 600; font-size: 0.75rem; padding: 0.2rem 0.6rem; border-radius: 9999px;">Needs Practice</span>`;
        }

        const dateStr = s.created_at ? new Date(s.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "Active";

        return `
            <tr style="border-bottom: 1px solid #F1F5F9; transition: background 0.15s;">
                <td style="padding: 0.9rem 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <div style="width: 34px; height: 34px; border-radius: 50%; background: #EFF6FF; color: #2563EB; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.88rem;">
                            ${initial}
                        </div>
                        <div>
                            <strong style="font-size: 0.88rem; color: #0F172A; display: block;">${name}</strong>
                            <span style="font-size: 0.75rem; color: #64748B;">ID: ${id.length > 16 ? id.substring(0, 16) + '...' : id}</span>
                        </div>
                    </div>
                </td>
                <td style="padding: 0.9rem 1rem; font-size: 0.84rem; color: #64748B;">
                    ${email}
                </td>
                <td style="padding: 0.9rem 1rem; font-size: 0.84rem; color: #64748B;">
                    Java Foundations
                </td>
                <td style="padding: 0.9rem 1rem;">
                    ${stateBadge}
                </td>
                <td style="padding: 0.9rem 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <div style="width: 80px; height: 6px; background: #E2E8F0; border-radius: 9999px; overflow: hidden;">
                            <div style="width: ${masteryPct}%; height: 100%; background: #2563EB; border-radius: 9999px;"></div>
                        </div>
                        <span style="font-size: 0.78rem; font-weight: 700; color: #0F172A;">${masteryPct}%</span>
                    </div>
                </td>
                <td style="padding: 0.9rem 1rem; text-align: right;">
                    <a href="#/teacher/analytics" class="btn btn-outline btn-sm" style="padding: 0.35rem 0.75rem; font-size: 0.78rem; font-weight: 600; border-radius: 6px; border: 1px solid #CBD5E1; color: #0F172A; text-decoration: none;">
                        Inspect Telemetry
                    </a>
                </td>
            </tr>
        `;
    }).join("");

    container.innerHTML = `
        <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead>
                    <tr style="border-bottom: 1px solid #E2E8F0; background: #F8FAFC;">
                        <th style="padding: 0.75rem 1rem; font-size: 0.76rem; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">Student</th>
                        <th style="padding: 0.75rem 1rem; font-size: 0.76rem; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">Email</th>
                        <th style="padding: 0.75rem 1rem; font-size: 0.76rem; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">Track</th>
                        <th style="padding: 0.75rem 1rem; font-size: 0.76rem; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">Status</th>
                        <th style="padding: 0.75rem 1rem; font-size: 0.76rem; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">Mastery Gain</th>
                        <th style="padding: 0.75rem 1rem; font-size: 0.76rem; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; text-align: right;">Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        </div>
    `;
}

function escapeHtml(text) {
    if (text === null || text === undefined) return "";
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, (m) => map[m]);
}
