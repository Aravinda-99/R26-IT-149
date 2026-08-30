/**
 * TeacherLayout Component — CodeQuest Teacher & Admin Portal
 * ==========================================================
 * Professional light SaaS layout with dedicated left sidebar navigation,
 * top breadcrumb bar, and clean management containers.
 * Shows ONLY curriculum management and question approval workflows.
 */

import { getCurrentUser, logout } from "../utils/auth.js";

export function renderTeacherLayout(targetElement, activeRoute, renderPageContent, onNavigate) {
    const user = getCurrentUser();
    const role = (user?.role || "Teacher").toUpperCase();
    const email = user?.email || "teacher@codequest.lk";
    const displayName = user?.displayName || "Educator";

    const navItems = [
        { path: "/teacher/dashboard", label: "Dashboard", icon: "fa-chart-pie" },
        { path: "/teacher/questions/generate", label: "Generate Questions", icon: "fa-plus-circle" },
        { path: "/teacher/questions/pending", label: "Pending Review", icon: "fa-clipboard-check" },
        { path: "/teacher/questions/approved", label: "Approved Bank", icon: "fa-database" },
        { path: "/teacher/questions/rejected", label: "Rejected Archive", icon: "fa-box-archive" },
        { path: "/teacher/analytics", label: "Post-Test Analytics", icon: "fa-chart-column" },
        { path: "/teacher/settings", label: "Settings & System", icon: "fa-sliders" },
    ];

    targetElement.innerHTML = `
        <div class="teacher-layout">
            <!-- Left Sidebar -->
            <aside class="teacher-sidebar">
                <!-- Sidebar Header -->
                <div style="padding: 1.5rem 1.25rem 1rem 1.25rem; border-bottom: 1px solid #E5E7EB; display: flex; align-items: center; gap: 0.75rem; cursor: pointer;" id="teacher-brand-click">
                    <div style="width: 36px; height: 36px; background: #1E40AF; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.1rem; box-shadow: 0 2px 4px rgba(30,64,175,0.25);">
                        <i class="fa-solid fa-graduation-cap"></i>
                    </div>
                    <div>
                        <div style="font-weight: 800; font-size: 1.1rem; color: #111827; letter-spacing: -0.02em;">CodeQuest</div>
                        <div style="font-size: 0.6875rem; font-weight: 700; color: #1E40AF; text-transform: uppercase; letter-spacing: 0.05em;">Educator Portal</div>
                    </div>
                </div>

                <!-- Sidebar Nav Menu -->
                <nav style="flex: 1; padding: 1.25rem 0.75rem; display: flex; flex-direction: column; gap: 0.35rem; overflow-y: auto;" id="teacher-nav-links">
                    <div style="font-size: 0.6875rem; font-weight: 700; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.06em; padding: 0.25rem 0.75rem 0.5rem 0.75rem;">
                        Management
                    </div>
                    ${navItems.map((item) => {
                        const isActive = activeRoute === item.path || (item.path !== "/teacher/dashboard" && activeRoute.startsWith(item.path));
                        return `
                            <a href="${item.path}" class="teacher-nav-link ${isActive ? 'active' : ''}" data-route="${item.path}" style="display: flex; align-items: center; gap: 0.75rem; padding: 0.625rem 0.875rem; font-size: 0.875rem; font-weight: 600; border-radius: 8px; color: ${isActive ? '#1E40AF' : '#4B5563'}; background: ${isActive ? '#EFF6FF' : 'transparent'}; border-left: 3px solid ${isActive ? '#1E40AF' : 'transparent'}; transition: all 150ms;">
                                <i class="fa-solid ${item.icon}" style="width: 18px; text-align: center; color: ${isActive ? '#1E40AF' : '#6B7280'};"></i>
                                <span>${item.label}</span>
                            </a>
                        `;
                    }).join("")}
                </nav>

                <!-- Sidebar Footer User Card -->
                <div style="padding: 1rem; border-top: 1px solid #E5E7EB; background: #F9FAFB;">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <div style="min-width: 0; flex: 1;">
                            <div style="font-size: 0.8125rem; font-weight: 700; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${displayName}</div>
                            <div style="font-size: 0.7rem; color: #6B7280; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${email}</div>
                        </div>
                        <span class="badge badge-primary" style="font-size: 0.65rem; padding: 0.2rem 0.45rem;">${role}</span>
                    </div>
                </div>
            </aside>

            <!-- Main Right Wrapper -->
            <div class="teacher-main-wrapper">
                <!-- Topbar -->
                <header class="teacher-topbar">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <div style="font-size: 0.875rem; font-weight: 600; color: #6B7280;">
                            Portal / <span style="color: #111827; font-weight: 700;">Curriculum & Schema Mastery Administration</span>
                        </div>
                    </div>

                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <div style="display: flex; align-items: center; gap: 0.4rem; background: #ECFDF5; border: 1px solid #A7F3D0; padding: 0.35rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; color: #065F46;">
                            <span style="width: 7px; height: 7px; border-radius: 50%; background: #10B981; display: inline-block;"></span>
                            ML Pipeline Active
                        </div>
                        <button class="btn btn-secondary btn-sm" id="teacher-logout-btn" style="gap: 0.4rem;">
                            <i class="fa-solid fa-arrow-right-from-bracket"></i> Logout
                        </button>
                    </div>
                </header>

                <!-- Page Content Area -->
                <main class="teacher-content" id="teacher-content-area"></main>
            </div>
        </div>
    `;

    document.getElementById("teacher-brand-click")?.addEventListener("click", () => {
        if (onNavigate) onNavigate("/teacher/dashboard");
    });

    targetElement.querySelectorAll(".teacher-nav-link").forEach((link) => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const route = link.dataset.route;
            if (onNavigate && route) onNavigate(route);
        });
    });

    document.getElementById("teacher-logout-btn")?.addEventListener("click", async () => {
        await logout();
        if (onNavigate) onNavigate("/login");
    });

    const contentArea = document.getElementById("teacher-content-area");
    if (typeof renderPageContent === "function" && contentArea) {
        renderPageContent(contentArea);
    }

    return contentArea;
}
