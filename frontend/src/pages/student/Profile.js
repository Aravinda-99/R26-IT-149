/**
 * Profile Component — CodeQuest Student Account & Preferences
 * ==============================================================
 * Comprehensive account settings, learning preferences, and progress summary.
 */

import { getCurrentUser, logout } from "../../utils/auth.js";
import { GameManager } from "../../game/GameManager.js";
import { animatePageEntrance } from "../../utils/animations.js";

export function renderProfile(container, onNavigate) {
    const user = getCurrentUser();
    const displayName = user?.displayName || "Student";
    const email = user?.email || "student@codequest.lk";
    const initial = displayName.charAt(0).toUpperCase();

    // Retrieve state
    const state = GameManager?.getState?.() || {};
    const totalXp = state.xp || 0;
    const completedLevels = state.levelsCompleted ? state.levelsCompleted.filter(Boolean).length : 0;

    // Retrieve onboarding preferences from storage if available
    let onboardingData = {};
    try {
        const stored = localStorage.getItem("cq_onboarding");
        if (stored) onboardingData = JSON.parse(stored);
    } catch {}

    const experience = onboardingData.experience || "Beginner (Learning Java)";
    const goal = onboardingData.goal || "Build mental models and solve code challenges";
    const pace = onboardingData.pace || "Steady (3-5 hours/week)";

    container.innerHTML = `
        <div class="profile-page-wrap" style="max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; gap: 2rem;">
            
            <!-- Page Header -->
            <div>
                <h1 style="font-size: 1.65rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.25rem;">
                    Student Profile & Settings
                </h1>
                <p style="color: var(--text-muted); font-size: 0.9375rem;">
                    Manage your account details, learning preferences, and view your progress stats.
                </p>
            </div>

            <!-- Profile Overview Card -->
            <div class="card" style="padding: 2rem; border-radius: var(--radius-md);">
                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1.5rem; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--border-main);">
                    <div style="display: flex; align-items: center; gap: 1.25rem;">
                        <div style="width: 64px; height: 64px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.75rem; font-weight: 800; box-shadow: 0 4px 6px -1px rgba(37,99,235,0.25);">
                            ${initial}
                        </div>
                        <div>
                            <h2 style="font-size: 1.35rem; font-weight: 800; color: var(--text-main);">
                                ${displayName}
                            </h2>
                            <div style="font-size: 0.875rem; color: var(--text-muted); margin-top: 0.15rem;">
                                ${email}
                            </div>
                            <div style="display: inline-flex; align-items: center; gap: 0.4rem; background: var(--primary-soft); color: var(--primary); padding: 0.15rem 0.55rem; border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 700; margin-top: 0.5rem;">
                                <i class="fa-solid fa-graduation-cap"></i> Student Account
                            </div>
                        </div>
                    </div>

                    <button class="btn btn-secondary btn-sm" id="profile-logout-btn" style="color: var(--status-error); border-color: var(--status-error-bg);">
                        <i class="fa-solid fa-arrow-right-from-bracket"></i> Sign Out
                    </button>
                </div>

                <!-- Learning Metrics Grid -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                    <div style="background: var(--bg-surface-subtle); padding: 1rem 1.25rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
                        <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Total Practice XP</div>
                        <div style="font-size: 1.5rem; font-weight: 800; color: var(--primary); margin-top: 0.25rem;">${totalXp} XP</div>
                    </div>
                    <div style="background: var(--bg-surface-subtle); padding: 1rem 1.25rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
                        <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Completed Activities</div>
                        <div style="font-size: 1.5rem; font-weight: 800; color: var(--status-success); margin-top: 0.25rem;">${completedLevels}</div>
                    </div>
                    <div style="background: var(--bg-surface-subtle); padding: 1rem 1.25rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
                        <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Learning Track</div>
                        <div style="font-size: 1.15rem; font-weight: 800; color: var(--text-main); margin-top: 0.25rem;">Java Core</div>
                    </div>
                </div>

                <!-- Preferences Form -->
                <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--text-main); margin-bottom: 1rem;">
                    Learning Preferences
                </h3>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.25rem;">
                    <div class="form-group">
                        <label class="form-label">Programming Experience</label>
                        <input type="text" class="form-input" value="${experience}" readonly style="background: var(--bg-surface-subtle);">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Weekly Study Pace</label>
                        <input type="text" class="form-input" value="${pace}" readonly style="background: var(--bg-surface-subtle);">
                    </div>
                    <div class="form-group" style="grid-column: 1 / -1;">
                        <label class="form-label">Primary Goal</label>
                        <input type="text" class="form-input" value="${goal}" readonly style="background: var(--bg-surface-subtle);">
                    </div>
                </div>

            </div>

        </div>
    `;

    animatePageEntrance(container.querySelector(".profile-page-wrap"));

    document.getElementById("profile-logout-btn")?.addEventListener("click", async () => {
        await logout();
        if (onNavigate) onNavigate("/login");
    });
}
