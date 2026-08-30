/**
 * Student Layout
 * ==============
 * Dedicated student workspace layout with 240px white sidebar,
 * learner-focused navigation, topbar, and profile widget.
 * Strictly separates student view from teacher / question bank features.
 */

import { getCurrentUser, logout } from "../utils/auth.js";

export function renderStudentLayout(container, activeRoute = "") {
    const user = getCurrentUser();
    const studentName = user?.name || user?.displayName || "Student";
    const initial = studentName.charAt(0).toUpperCase();

    const navItems = [
        { path: "/student/dashboard", label: "Dashboard", icon: "fa-gauge-high" },
        { path: "/student/pre-test", label: "Pre-Test Check", icon: "fa-clipboard-list" },
        { path: "/student/error-analysis", label: "Error Feedback", icon: "fa-magnifying-glass-chart" },
        { path: "/student/games", label: "Game Lessons", icon: "fa-gamepad" },
        { path: "/student/post-test/start", label: "Understanding Check", icon: "fa-clipboard-check" },
        { path: "/student/profile", label: "My Profile", icon: "fa-user-graduate" },
    ];

    container.innerHTML = `
        <div class="app-layout student-app-layout">
            <!-- Sidebar -->
            <aside class="app-sidebar">
                <div class="sidebar-brand">
                    <div class="brand-icon"><i class="fa-solid fa-code"></i></div>
                    <div class="brand-meta">
                        <span class="brand-name">CodeQuest</span>
                        <span class="brand-tag">Student Portal</span>
                    </div>
                </div>

                <nav class="sidebar-nav">
                    <div class="sidebar-nav-group">
                        <span class="sidebar-nav-title">LEARNING</span>
                        ${navItems.slice(0, 3).map(item => `
                            <a href="#${item.path}" class="sidebar-nav-link ${activeRoute.startsWith(item.path) ? 'active' : ''}">
                                <i class="fa-solid ${item.icon}"></i>
                                <span>${item.label}</span>
                            </a>
                        `).join('')}
                    </div>

                    <div class="sidebar-nav-group">
                        <span class="sidebar-nav-title">PRACTICE & VALIDATION</span>
                        ${navItems.slice(3).map(item => `
                            <a href="#${item.path}" class="sidebar-nav-link ${activeRoute.startsWith(item.path) ? 'active' : ''}">
                                <i class="fa-solid ${item.icon}"></i>
                                <span>${item.label}</span>
                            </a>
                        `).join('')}
                    </div>
                </nav>

                <!-- Sidebar User Footer -->
                <div class="sidebar-footer">
                    <a href="#/student/profile" class="sidebar-user-card">
                        <div class="user-avatar">${initial}</div>
                        <div class="user-info">
                            <span class="user-name">${studentName}</span>
                            <span class="user-role">Student</span>
                        </div>
                    </a>
                    <button class="btn-icon-subtle" id="student-logout-btn" title="Sign Out">
                        <i class="fa-solid fa-arrow-right-from-bracket"></i>
                    </button>
                </div>
            </aside>

            <!-- Main Content Area -->
            <div class="app-main">
                <!-- Topbar -->
                <header class="app-topbar">
                    <div class="topbar-left">
                        <div class="topbar-search">
                            <i class="fa-solid fa-magnifying-glass"></i>
                            <input type="text" placeholder="Search Java topics, errors, or practice modules..." readonly />
                        </div>
                    </div>

                    <div class="topbar-right">
                        <span class="learning-track-badge">
                            <i class="fa-solid fa-book-open"></i> Java Fundamentals Track
                        </span>
                        <a href="#/student/profile" class="topbar-avatar" title="${studentName}">
                            ${initial}
                        </a>
                    </div>
                </header>

                <!-- Dynamic Page Container -->
                <main class="app-content" id="student-content">
                    <div style="padding: 2rem; text-align: center;"><div class="spinner"></div></div>
                </main>
            </div>
        </div>
    `;

    document.getElementById("student-logout-btn")?.addEventListener("click", async () => {
        await logout();
        window.location.hash = "#/login";
    });
}
