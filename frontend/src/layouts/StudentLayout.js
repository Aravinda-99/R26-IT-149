/**
 * StudentLayout Component — CodeQuest Real LMS Application Shell
 * ===============================================================
 * Production-grade desktop shell:
 * Left Sidebar (250px) + Top Header (64px) + Main Workspace
 * Supports responsive mobile drawer, dynamic breadcrumbs, and real-time XP.
 */

import { getCurrentUser, logout } from "../utils/auth.js";
import { GameManager } from "../game/GameManager.js";

export function renderStudentLayout(targetElement, activeRoute, onNavigate) {
    const user = getCurrentUser();
    const displayName = user?.displayName || "Student";
    const email = user?.email || "student@codequest.lk";
    const initial = displayName.charAt(0).toUpperCase();

    // Retrieve real practice XP
    const state = GameManager?.getState?.() || {};
    const totalXp = state.xp || 0;

    const navItems = [
        { path: "/student/dashboard", label: "Dashboard", icon: "fa-chart-pie", exact: true },
        { path: "/student/modules", label: "Curriculum & Modules", icon: "fa-book-open", exact: false },
        { path: "/student/games", label: "Practice Challenges", icon: "fa-gamepad", exact: false },
        { path: "/student/pre-test", label: "Diagnostic Quiz", icon: "fa-clipboard-list", exact: false },
        { path: "/student/post-test/start", label: "Understanding Check", icon: "fa-clipboard-check", exact: false },
        { path: "/student/profile", label: "Profile & Settings", icon: "fa-user-gear", exact: false },
    ];

    // Compute active breadcrumb title
    let pageTitle = "Dashboard";
    if (activeRoute.includes("modules")) pageTitle = "Curriculum & Modules";
    else if (activeRoute.includes("games")) pageTitle = "Practice Challenges";
    else if (activeRoute.includes("pre-test") || activeRoute.includes("quiz")) pageTitle = "Diagnostic Quiz";
    else if (activeRoute.includes("post-test")) pageTitle = "Understanding Check";
    else if (activeRoute.includes("profile")) pageTitle = "Profile & Settings";

    targetElement.innerHTML = `
        <div class="student-layout">
            
            <!-- Mobile Backdrop Overlay -->
            <div id="student-mobile-backdrop" class="drawer-backdrop" style="display: none; z-index: 45;"></div>

            <!-- Left Navigation Sidebar -->
            <aside class="student-sidebar" id="student-sidebar">
                
                <!-- Brand Header -->
                <div style="padding: 1.25rem 1.25rem 1rem 1.25rem; border-bottom: 1px solid var(--border-main); display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 0.75rem; cursor: pointer;" id="student-brand-click">
                        <div style="width: 36px; height: 36px; background: var(--primary); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; color: white; font-size: 1.1rem; box-shadow: 0 2px 4px rgba(37,99,235,0.25);">
                            <i class="fa-solid fa-code"></i>
                        </div>
                        <div>
                            <div style="font-weight: 800; font-size: 1.1rem; color: var(--text-main); letter-spacing: -0.02em; line-height: 1.1;">CodeQuest</div>
                            <div style="font-size: 0.6875rem; font-weight: 700; color: var(--primary); text-transform: uppercase; letter-spacing: 0.05em;">Student Learning Hub</div>
                        </div>
                    </div>

                    <!-- Mobile Close Button -->
                    <button class="btn btn-subtle btn-sm" id="student-sidebar-close-btn" style="display: none;">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <!-- Navigation Links -->
                <nav style="flex: 1; padding: 1.25rem 0.75rem; display: flex; flex-direction: column; gap: 0.35rem; overflow-y: auto;" id="student-nav-links">
                    <div style="font-size: 0.6875rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; padding: 0.25rem 0.75rem 0.5rem 0.75rem;">
                        Learning Tracks
                    </div>

                    ${navItems.map((item) => {
                        const isActive = item.exact 
                            ? activeRoute === item.path 
                            : activeRoute.startsWith(item.path);

                        return `
                            <a href="${item.path}" class="student-nav-item ${isActive ? 'active' : ''}" data-route="${item.path}" style="display: flex; align-items: center; gap: 0.75rem; padding: 0.625rem 0.875rem; font-size: 0.875rem; font-weight: 600; border-radius: var(--radius-sm); color: ${isActive ? 'var(--primary)' : 'var(--text-muted)'}; background: ${isActive ? 'var(--primary-soft)' : 'transparent'}; border-left: 3px solid ${isActive ? 'var(--primary)' : 'transparent'}; text-decoration: none; transition: all var(--transition-fast);">
                                <i class="fa-solid ${item.icon}" style="width: 18px; text-align: center; color: ${isActive ? 'var(--primary)' : 'var(--text-muted)'};"></i>
                                <span>${item.label}</span>
                            </a>
                        `;
                    }).join("")}
                </nav>

                <!-- Sidebar Footer User Card -->
                <div style="padding: 1rem; border-top: 1px solid var(--border-main); background: var(--bg-surface-subtle);">
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;">
                        <div style="display: flex; align-items: center; gap: 0.65rem; min-width: 0; flex: 1;">
                            <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.8125rem; font-weight: 700; flex-shrink: 0;">
                                ${initial}
                            </div>
                            <div style="min-width: 0; flex: 1;">
                                <div style="font-size: 0.8125rem; font-weight: 700; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                    ${displayName}
                                </div>
                                <div style="font-size: 0.6875rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                    ${email}
                                </div>
                            </div>
                        </div>

                        <button class="btn btn-subtle btn-sm" id="student-logout-btn" title="Sign Out" style="padding: 0.35rem 0.55rem; color: var(--text-muted);">
                            <i class="fa-solid fa-arrow-right-from-bracket"></i>
                        </button>
                    </div>
                </div>

            </aside>

            <!-- Main Application Content Wrapper -->
            <div class="student-main-wrapper">
                
                <!-- Topbar Header -->
                <header class="student-topbar">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <button class="btn btn-secondary btn-sm" id="student-mobile-toggle-btn" style="display: none; padding: 0.4rem 0.65rem;">
                            <i class="fa-solid fa-bars"></i>
                        </button>
                        <div style="font-size: 0.875rem; color: var(--text-muted);">
                            Student / <strong style="color: var(--text-main); font-weight: 700;">${pageTitle}</strong>
                        </div>
                    </div>

                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <div style="display: inline-flex; align-items: center; gap: 0.45rem; background: var(--bg-surface-subtle); border: 1px solid var(--border-main); padding: 0.35rem 0.85rem; border-radius: var(--radius-full); font-size: 0.8125rem; font-weight: 700; color: var(--primary);">
                            <i class="fa-solid fa-bolt" style="color: var(--accent);"></i>
                            <span>${totalXp} XP</span>
                        </div>
                    </div>
                </header>

                <!-- Page View Container -->
                <main class="student-content" id="student-content-area"></main>

                <!-- System Footer -->
                <footer style="padding: 1.25rem 1.75rem; font-size: 0.8125rem; color: var(--text-muted); border-top: 1px solid var(--border-main); background: var(--bg-surface); text-align: center; margin-top: auto;">
                    CodeQuest Programming Learning Framework • Research ID: R26-IT-149
                </footer>

            </div>

        </div>
    `;

    // Navigation & Interaction Event Listeners
    const sidebar = document.getElementById("student-sidebar");
    const mobileBackdrop = document.getElementById("student-mobile-backdrop");
    const mobileToggleBtn = document.getElementById("student-mobile-toggle-btn");
    const sidebarCloseBtn = document.getElementById("student-sidebar-close-btn");

    function openMobileSidebar() {
        sidebar?.classList.add("open");
        if (mobileBackdrop) mobileBackdrop.style.display = "block";
    }

    function closeMobileSidebar() {
        sidebar?.classList.remove("open");
        if (mobileBackdrop) mobileBackdrop.style.display = "none";
    }

    // Responsive toggle logic
    if (window.innerWidth <= 1024) {
        if (mobileToggleBtn) mobileToggleBtn.style.display = "inline-flex";
        if (sidebarCloseBtn) sidebarCloseBtn.style.display = "inline-flex";
    }

    mobileToggleBtn?.addEventListener("click", openMobileSidebar);
    sidebarCloseBtn?.addEventListener("click", closeMobileSidebar);
    mobileBackdrop?.addEventListener("click", closeMobileSidebar);

    document.getElementById("student-brand-click")?.addEventListener("click", () => {
        closeMobileSidebar();
        if (onNavigate) onNavigate("/student/dashboard");
    });

    targetElement.querySelectorAll(".student-nav-item").forEach((link) => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            closeMobileSidebar();
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
