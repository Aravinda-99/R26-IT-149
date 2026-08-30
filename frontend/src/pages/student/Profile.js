/**
 * Student Profile Page
 * ====================
 * Clean student account details and dynamic learning milestones.
 */

import { getCurrentUser, logout } from "../../utils/auth.js";

export function renderProfile(container) {
    const user = getCurrentUser();
    if (!user) {
        container.innerHTML = `
            <div class="card" style="text-align: center; padding: 4rem 2rem; max-width: 600px; margin: 2rem auto;">
                <div style="font-size: 3rem; color: var(--primary); margin-bottom: 1rem;"><i class="fa-solid fa-user-lock"></i></div>
                <h2 style="font-size: 1.5rem; margin-bottom: 0.5rem;">Profile Unavailable</h2>
                <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">Please sign in to view your profile details and learning progress.</p>
                <a href="#/login" class="btn btn-primary btn-lg"><i class="fa-solid fa-arrow-right-to-bracket"></i> Sign In</a>
            </div>
        `;
        return;
    }

    const studentName = user.displayName || user.name || user.email?.split("@")[0] || "Learner";
    const studentEmail = user.email || "—";
    const role = user.role || "student";
    const initial = studentName.charAt(0).toUpperCase();
    const joinedDate = user.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : "Active Member";

    // Load real milestone progress
    const progress = getLocalProgress(user.uid || user.id);

    container.innerHTML = `
        <div class="profile-page">
            <div class="page-top-nav-bar">
                <a href="#/student/dashboard" class="btn-back-link">
                    <i class="fa-solid fa-arrow-left"></i> Back to Dashboard
                </a>
            </div>

            <div class="ea-header">
                <div>
                    <h1 class="ea-title">My Learner Profile</h1>
                    <p class="ea-subtitle">Manage your student account details and track your real learning milestones.</p>
                </div>
            </div>

            <div class="profile-grid">
                <!-- User Card -->
                <div class="card profile-user-card" style="background:#FFFFFF; border:1px solid var(--border-color); text-align:center;">
                    <div class="profile-avatar-large" style="background:var(--primary); color:#FFFFFF; margin: 0 auto 1rem auto;">${initial}</div>
                    <h2 class="profile-name" style="font-size:1.3rem; margin-bottom:0.25rem;">${studentName}</h2>
                    <span class="badge badge-primary"><i class="fa-solid fa-user-graduate"></i> ${role.toUpperCase()}</span>
                    <p class="profile-email" style="color:var(--text-secondary); font-size:0.85rem; margin-top:0.75rem;"><i class="fa-regular fa-envelope"></i> ${studentEmail}</p>

                    <div class="profile-actions" style="margin-top: 1.5rem;">
                        <button class="btn btn-outline btn-block" id="profile-logout-btn">
                            <i class="fa-solid fa-arrow-right-from-bracket"></i> Sign Out
                        </button>
                    </div>
                </div>

                <!-- Learning Milestones & Progress -->
                <div class="profile-details-column">
                    <div class="card">
                        <h3><i class="fa-solid fa-graduation-cap" style="color:var(--primary);"></i> Enrolled Curriculum</h3>
                        <div class="profile-info-row">
                            <span class="label">Program:</span>
                            <span class="value">CodeQuest Java Fundamentals</span>
                        </div>
                        <div class="profile-info-row">
                            <span class="label">Enrolled Since:</span>
                            <span class="value">${joinedDate}</span>
                        </div>
                        <div class="profile-info-row">
                            <span class="label">Active Modules:</span>
                            <span class="value">Variables, Operators, Loops, Arrays, Methods</span>
                        </div>
                    </div>

                    <div class="card" style="margin-top: 1.5rem;">
                        <h3><i class="fa-solid fa-chart-line" style="color:var(--secondary);"></i> Learning Milestones</h3>
                        <div class="milestones-list">
                            <div class="milestone-item">
                                <div class="milestone-icon green"><i class="fa-solid fa-check"></i></div>
                                <div class="milestone-text">
                                    <strong>Account Registered & Active</strong>
                                    <p class="text-muted">Enrolled in CodeQuest Adaptive Learning track.</p>
                                </div>
                            </div>
                            
                            <div class="milestone-item">
                                <div class="milestone-icon ${progress.preTestCompleted ? 'green' : 'amber'}">
                                    <i class="fa-solid ${progress.preTestCompleted ? 'fa-check' : 'fa-clock'}"></i>
                                </div>
                                <div class="milestone-text">
                                    <strong>Diagnostic Pre-Test</strong>
                                    <p class="text-muted">${progress.preTestCompleted ? "Diagnostic check completed." : "Pending diagnostic completion."}</p>
                                </div>
                            </div>

                            <div class="milestone-item">
                                <div class="milestone-icon ${progress.currentStep >= 3 ? 'green' : 'amber'}">
                                    <i class="fa-solid ${progress.currentStep >= 3 ? 'fa-check' : 'fa-clock'}"></i>
                                </div>
                                <div class="milestone-text">
                                    <strong>Interactive Practice & Lessons</strong>
                                    <p class="text-muted">${progress.currentStep >= 3 ? "Practiced targeted conceptual challenges." : "Unlocked after diagnostic check."}</p>
                                </div>
                            </div>

                            <div class="milestone-item">
                                <div class="milestone-icon ${progress.currentStep >= 5 ? 'green' : 'blue'}">
                                    <i class="fa-solid ${progress.currentStep >= 5 ? 'fa-trophy' : 'fa-lock'}"></i>
                                </div>
                                <div class="milestone-text">
                                    <strong>Schema Mastery Validation</strong>
                                    <p class="text-muted">${progress.currentStep >= 5 ? "Mastery check successfully completed." : "Available after completing practice drills."}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById("profile-logout-btn")?.addEventListener("click", async () => {
        await logout();
        window.location.hash = "#/login";
    });
}

function getLocalProgress(studentId) {
    try {
        const raw = localStorage.getItem(`cq_progress_${studentId}`);
        if (raw) return JSON.parse(raw);
    } catch (e) { }

    return {
        currentStep: 1,
        preTestCompleted: false
    };
}
