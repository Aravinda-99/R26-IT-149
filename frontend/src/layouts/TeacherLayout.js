/**
 * Teacher Layout
 * ==============
 * Dedicated Educator & Instructor workspace layout.
 * Hosts Question Bank management, AI generation, review queues, and ML analytics.
 */

import { getCurrentUser, logout } from "../utils/auth.js";

export function renderTeacherLayout(container, activeRoute = "") {
    const user = getCurrentUser();
    const teacherName = user?.name || user?.displayName || "Educator";
    const initial = teacherName.charAt(0).toUpperCase();

    const navItems = [
        { path: "/teacher/dashboard", label: "Dashboard", icon: "fa-gauge" },
        { path: "/teacher/questions/generate", label: "Generate Questions", icon: "fa-plus-circle" },
        { path: "/teacher/questions/pending", label: "Pending Review", icon: "fa-inbox" },
        { path: "/teacher/questions/approved", label: "Approved Bank", icon: "fa-layer-group" },
        { path: "/teacher/questions/rejected", label: "Rejected Archive", icon: "fa-box-archive" },
        { path: "/teacher/analytics", label: "Post-Test Analytics", icon: "fa-chart-pie" },
        { path: "/teacher/settings", label: "Settings", icon: "fa-sliders" },
    ];

    container.innerHTML = `
        <div class="app-layout teacher-app-layout">
            <!-- Sidebar -->
            <aside class="app-sidebar teacher-sidebar">
                <div class="sidebar-brand">
                    <div class="brand-icon teacher-brand-icon"><i class="fa-solid fa-chalkboard-user"></i></div>
                    <div class="brand-meta">
                        <span class="brand-name">CodeQuest</span>
                        <span class="brand-tag teacher-brand-tag">Educator Portal</span>
                    </div>
                </div>

                <nav class="sidebar-nav">
                    <div class="sidebar-nav-group">
                        <span class="sidebar-nav-title">CURRICULUM & QUESTIONS</span>
                        ${navItems.slice(0, 5).map(item => `
                            <a href="#${item.path}" class="sidebar-nav-link ${activeRoute.startsWith(item.path) ? 'active' : ''}">
                                <i class="fa-solid ${item.icon}"></i>
                                <span>${item.label}</span>
                            </a>
                        `).join('')}
                    </div>

                    <div class="sidebar-nav-group">
                        <span class="sidebar-nav-title">ANALYTICS & SYSTEM</span>
                        ${navItems.slice(5).map(item => `
                            <a href="#${item.path}" class="sidebar-nav-link ${activeRoute.startsWith(item.path) ? 'active' : ''}">
                                <i class="fa-solid ${item.icon}"></i>
                                <span>${item.label}</span>
                            </a>
                        `).join('')}
                    </div>
                </nav>

                <!-- Sidebar Footer -->
                <div class="sidebar-footer">
                    <div class="sidebar-user-card">
                        <div class="user-avatar teacher-avatar">${initial}</div>
                        <div class="user-info">
                            <span class="user-name">${teacherName}</span>
                            <span class="user-role">Teacher / Admin</span>
                        </div>
                    </div>
                    <button class="btn-icon-subtle" id="teacher-logout-btn" title="Sign Out">
                        <i class="fa-solid fa-arrow-right-from-bracket"></i>
                    </button>
                </div>
            </aside>

            <!-- Main Workspace -->
            <div class="app-main">
                <header class="app-topbar">
                    <div class="topbar-left">
                        <div class="topbar-breadcrumb">
                            <span class="educator-badge"><i class="fa-solid fa-shield-halved"></i> Faculty Portal</span>
                        </div>
                    </div>

                    <div class="topbar-right">
                        <span class="ml-status-badge">
                            <span class="pulse-dot"></span> ML Pipeline Active
                        </span>
                        <div class="topbar-avatar teacher-avatar">
                            ${initial}
                        </div>
                    </div>
                </header>

                <main class="app-content" id="teacher-content">
                    <div style="padding: 2rem; text-align: center;"><div class="spinner"></div></div>
                </main>
            </div>
        </div>
    `;

    document.getElementById("teacher-logout-btn")?.addEventListener("click", async () => {
        await logout();
        window.location.hash = "#/login";
    });
}
