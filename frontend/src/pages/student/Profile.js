/**
 * Student Profile Page
 * ====================
 * Clean student account details plus real gameplay statistics
 * (XP, Score, Levels Completed) and an unlocked-badges trophy case,
 * sourced directly from GameManager / BadgeSystem.
 */

import { getCurrentUser, logout } from "../../utils/auth.js";
import { GameManager } from "../../game/GameManager.js";
import { BadgeSystem } from "../../game/BadgeSystem.js";

// Tracks the currently-attached GameManager listener so repeated
// renderProfile() calls (re-navigating to Profile, or GameManager.syncWithFirebase()
// finishing after an initial render) never stack duplicate listeners — each
// render tears down the previous one before attaching its own, the same
// off-before-on pattern UIScene.js uses for its own GameManager subscriptions.
let stateChangeListener = null;

export function renderProfile(container) {
    if (stateChangeListener) {
        GameManager.off("stateChange", stateChangeListener);
        stateChangeListener = null;
    }

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

    // ── Real gameplay stats, straight from GameManager (defaults are always
    // present via DEFAULT_STATE, but we still guard defensively). ──
    const state = GameManager.getState() || {};
    const levelsCompletedArr = Array.isArray(state.levelsCompleted) ? state.levelsCompleted : [];
    const totalLevels = levelsCompletedArr.length || 88;
    const levelsCompletedCount = levelsCompletedArr.filter(Boolean).length;
    const totalXP = Number.isFinite(state.xp) ? state.xp : 0;
    const totalScore = Number.isFinite(state.score) ? state.score : 0;
    const unlockedBadgeIds = Array.isArray(state.badges) ? state.badges : [];

    // ── Completed Modules — a module is 3 consecutive levels; "complete"
    // means all 3 of its levelsCompleted entries are true. Using generic
    // "Module N" labels rather than guessing at curriculum category names:
    // the in-game UI (games.js) and the badge catalog (BadgeSystem.js) don't
    // agree on module sizing past the first few (e.g. games.js describes the
    // For Loop wing as 2 levels, while BadgeSystem.js's per-level badges
    // imply 3), so a generic numbering avoids asserting a mapping that isn't
    // actually verified for the full 88-level range.
    const MODULE_SIZE = 3;
    const totalModules = Math.floor(levelsCompletedArr.length / MODULE_SIZE);
    const completedModules = [];
    for (let m = 0; m < totalModules; m++) {
        const start = m * MODULE_SIZE;
        const isComplete = levelsCompletedArr[start] === true
            && levelsCompletedArr[start + 1] === true
            && levelsCompletedArr[start + 2] === true;
        if (isComplete) {
            completedModules.push({ name: `Module ${m + 1}`, levels: `Levels ${start + 1}–${start + 3}` });
        }
    }

    const completedModulesHTML = completedModules.length > 0
        ? completedModules.map(m => `
            <div style="display:flex; align-items:center; gap:0.4rem; padding: 0.45rem 0.8rem; border-radius: 10px; border: 1px solid var(--primary); background: var(--primary-soft, rgba(37,99,235,0.08));" title="${m.levels}">
                <i class="fa-solid fa-circle-check" style="color: var(--primary); font-size: 0.85rem;"></i>
                <span style="font-size:0.82rem; font-weight:700; color: var(--primary);">${m.name}</span>
            </div>
        `).join("")
        : `<p class="text-muted" style="padding: 0.5rem 0; color: var(--text-secondary);">Complete 3 levels in a category to unlock your first module!</p>`;

    const badgesHTML = unlockedBadgeIds.length > 0
        ? unlockedBadgeIds.map(badgeId => {
            const badge = BadgeSystem.getBadge(badgeId);
            if (!badge) return "";
            const colorHex = "#" + (typeof badge.color === "number" ? badge.color.toString(16).padStart(6, "0") : "ffd700");
            const safeDesc = (badge.description || "").replace(/"/g, "&quot;");
            return `
                <div title="${safeDesc}" style="display:flex; align-items:center; gap:0.5rem; padding: 0.5rem 0.85rem; border-radius: 10px; border: 1px solid ${colorHex}40; background: ${colorHex}14;">
                    <span style="font-size:1.3rem; line-height:1;">${badge.emoji || "🏅"}</span>
                    <span style="font-size:0.82rem; font-weight:700; color:${colorHex};">${badge.name}</span>
                </div>
            `;
        }).join("")
        : `<p class="text-muted" style="padding: 0.5rem 0; color: var(--text-secondary);">Play learning modules to unlock your first badge!</p>`;

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
                    <p class="ea-subtitle">Manage your student account details and track your real learning progress.</p>
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

                <!-- Curriculum, Real Game Stats & Trophy Case -->
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
                        <h3><i class="fa-solid fa-chart-line" style="color:var(--secondary);"></i> Game Statistics</h3>
                        <div class="profile-stats-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 1rem; margin-top: 0.75rem;">
                            <div style="text-align:center; padding: 1rem 0.5rem; background: var(--bg-secondary, #F8FAFC); border-radius: 10px;">
                                <div style="font-size:1.5rem; font-weight:800; color: var(--primary);">${totalXP.toLocaleString()}</div>
                                <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:0.25rem;">Total XP</div>
                            </div>
                            <div style="text-align:center; padding: 1rem 0.5rem; background: var(--bg-secondary, #F8FAFC); border-radius: 10px;">
                                <div style="font-size:1.5rem; font-weight:800; color: var(--secondary);">${totalScore.toLocaleString()}</div>
                                <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:0.25rem;">Total Score</div>
                            </div>
                            <div style="text-align:center; padding: 1rem 0.5rem; background: var(--bg-secondary, #F8FAFC); border-radius: 10px;">
                                <div style="font-size:1.5rem; font-weight:800; color: #10b981;">${levelsCompletedCount} / ${totalLevels}</div>
                                <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:0.25rem;">Levels Completed</div>
                            </div>
                        </div>
                    </div>

                    <div class="card" style="margin-top: 1.5rem;">
                        <h3><i class="fa-solid fa-layer-group" style="color:var(--primary);"></i> Completed Modules</h3>
                        <div class="completed-modules-list" style="display:flex; flex-wrap:wrap; gap: 0.5rem; margin-top: 0.75rem;">
                            ${completedModulesHTML}
                        </div>
                        <a href="#/student/post-test/start" class="btn btn-primary btn-block" style="margin-top: 1.25rem; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                            <i class="fa-solid fa-clipboard-check"></i> Go to Understanding Check
                        </a>
                    </div>

                    <div class="card" style="margin-top: 1.5rem;">
                        <h3><i class="fa-solid fa-trophy" style="color:#f59e0b;"></i> Trophy Case — Unlocked Badges</h3>
                        <div class="trophy-case-grid" style="display:flex; flex-wrap:wrap; gap: 0.6rem; margin-top: 0.75rem;">
                            ${badgesHTML}
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

    // Stay reactive: if GameManager's state changes after this render (e.g.
    // syncWithFirebase() finishes loading real backend data slightly after
    // this page already painted, or the player earns XP/a badge while this
    // tab is open), re-render with the fresh data instead of going stale.
    stateChangeListener = () => renderProfile(container);
    GameManager.on("stateChange", stateChangeListener);
}
