/**
 * StudentLayout Component — CodeQuest Student LMS Portal
 * =======================================================
 * Clean, distraction-free LMS top navigation bar and container.
 * Shows ONLY student-relevant links. No teacher tools or admin buttons.
 */

import { getCurrentUser, logout } from "../utils/auth.js";

export function renderStudentLayout(targetElement, activeRoute, onNavigate) {
    const user = getCurrentUser();
    const displayName = user?.displayName || "Student";
    const email = user?.email || "student@codequest.lk";

    targetElement.innerHTML = `
        <div class="student-layout">
            <!-- Student Top Navigation Bar -->
            <header style="background: #FFFFFF; border-bottom: 1px solid #E2E8F0; position: sticky; top: 0; z-index: 50; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);">
                <div style="max-width: 1280px; margin: 0 auto; padding: 0 1.5rem; height: 64px; display: flex; align-items: center; justify-content: space-between;">
                    
                    <!-- Brand -->
                    <div style="display: flex; align-items: center; gap: 0.75rem; cursor: pointer;" id="student-brand-click">
                        <div style="width: 38px; height: 38px; background: #2563EB; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.1rem; box-shadow: 0 2px 4px rgba(37,99,235,0.2);">
                            <i class="fa-solid fa-code"></i>
                        </div>
                        <div>
                            <div style="font-weight: 800; font-size: 1.15rem; color: #0F172A; letter-spacing: -0.02em; line-height: 1.1;">CodeQuest</div>
                            <div style="font-size: 0.7rem; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em;">Student Learning Hub</div>
                        </div>
                    </div>

                    <!-- Navigation Links -->
                    <nav style="display: flex; align-items: center; gap: 0.4rem;" id="student-nav-links">
                        <a href="/student/dashboard" class="student-nav-link ${activeRoute.includes('dashboard') ? 'active' : ''}" data-route="/student/dashboard" style="display: flex; align-items: center; gap: 0.45rem; padding: 0.5rem 0.85rem; font-size: 0.875rem; font-weight: 600; border-radius: 6px; color: ${activeRoute.includes('dashboard') ? '#2563EB' : '#475569'}; background: ${activeRoute.includes('dashboard') ? '#EFF6FF' : 'transparent'}; transition: all 150ms;">
                            <i class="fa-solid fa-gauge-high"></i> Dashboard
                        </a>
                        <a href="/student/pre-test" class="student-nav-link ${activeRoute.includes('pre-test') || activeRoute.includes('quiz') ? 'active' : ''}" data-route="/student/pre-test" style="display: flex; align-items: center; gap: 0.45rem; padding: 0.5rem 0.85rem; font-size: 0.875rem; font-weight: 600; border-radius: 6px; color: ${(activeRoute.includes('pre-test') || activeRoute.includes('quiz')) ? '#2563EB' : '#475569'}; background: ${(activeRoute.includes('pre-test') || activeRoute.includes('quiz')) ? '#EFF6FF' : 'transparent'}; transition: all 150ms;">
                            <i class="fa-solid fa-clipboard-list"></i> Diagnostic Quiz
                        </a>
                        <a href="/student/games" class="student-nav-link ${activeRoute.includes('games') ? 'active' : ''}" data-route="/student/games" style="display: flex; align-items: center; gap: 0.45rem; padding: 0.5rem 0.85rem; font-size: 0.875rem; font-weight: 600; border-radius: 6px; color: ${activeRoute.includes('games') ? '#2563EB' : '#475569'}; background: ${activeRoute.includes('games') ? '#EFF6FF' : 'transparent'}; transition: all 150ms;">
                            <i class="fa-solid fa-gamepad"></i> Game Lessons
                        </a>
                        <a href="/student/errors" class="student-nav-link ${activeRoute.includes('errors') ? 'active' : ''}" data-route="/student/errors" style="display: flex; align-items: center; gap: 0.45rem; padding: 0.5rem 0.85rem; font-size: 0.875rem; font-weight: 600; border-radius: 6px; color: ${activeRoute.includes('errors') ? '#2563EB' : '#475569'}; background: ${activeRoute.includes('errors') ? '#EFF6FF' : 'transparent'}; transition: all 150ms;">
                            <i class="fa-solid fa-magnifying-glass-chart"></i> Error Analysis
                        </a>
                    </nav>

                    <!-- User Actions -->
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <div style="display: flex; align-items: center; gap: 0.5rem; background: #F1F5F9; padding: 0.35rem 0.75rem; border-radius: 999px; border: 1px solid #E2E8F0;">
                            <div style="width: 24px; height: 24px; border-radius: 50%; background: #2563EB; color: white; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700;">
                                ${displayName.charAt(0).toUpperCase()}
                            </div>
                            <span style="font-size: 0.8125rem; font-weight: 600; color: #1E293B;">${displayName}</span>
                        </div>
                        <button class="btn btn-secondary btn-sm" id="student-logout-btn" title="Sign out" style="padding: 0.35rem 0.65rem;">
                            <i class="fa-solid fa-arrow-right-from-bracket"></i>
                        </button>
                    </div>
                </div>
            </header>

            <!-- Main Page Container -->
            <main class="student-main-content" id="student-content-area"></main>
        </div>
    `;

    document.getElementById("student-brand-click")?.addEventListener("click", () => {
        if (onNavigate) onNavigate("/student/dashboard");
    });

    targetElement.querySelectorAll(".student-nav-link").forEach((link) => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const route = link.dataset.route;
            if (onNavigate && route) onNavigate(route);
        });
    });

    document.getElementById("student-logout-btn")?.addEventListener("click", async () => {
        await logout();
        if (onNavigate) onNavigate("/login");
    });

    return document.getElementById("student-content-area");
}
