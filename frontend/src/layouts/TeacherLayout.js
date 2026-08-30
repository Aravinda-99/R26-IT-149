/**
 * TeacherLayout Component — CodeQuest Teacher & Admin Portal
 * ==========================================================
 * Professional light SaaS layout with dedicated left sidebar navigation,
 * top breadcrumb bar, mobile drawer support, and clean management containers.
 * Shows ONLY curriculum management and question approval workflows.
 */

import { getCurrentUser, logout } from "../utils/auth.js";

function getBreadcrumbTitle(route) {
    const r = (route || "").toLowerCase();
    if (r.includes("questions/generate") || r.includes("question-generation")) return "Draft Question Generation";
    if (r.includes("questions/pending") || r.includes("pending-review")) return "Pending Draft Review";
    if (r.includes("questions/approved") || r.includes("question-bank")) return "Approved Question Bank";
    if (r.includes("questions/rejected")) return "Rejected Question Archive";
    if (r.includes("analytics") || r.includes("post-test-analytics")) return "Post-Test ML Analytics";
    if (r.includes("settings")) return "System Settings & Configuration";
    return "Curriculum & Schema Mastery Overview";
}

export function renderTeacherLayout(targetElement, activeRoute, renderPageContent, onNavigate) {
    const user = getCurrentUser();
    const role = (user?.role || "Teacher").toUpperCase();
    const email = user?.email || "teacher@codequest.lk";
    const displayName = user?.displayName || "Prof. Sarah Johnson";

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
            <!-- Mobile Drawer Backdrop Overlay -->
            <div id="teacher-mobile-backdrop" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); z-index: 95;"></div>

            <!-- Left Sidebar -->
            <aside class="teacher-sidebar" id="teacher-sidebar">
                <!-- Sidebar Header -->
                <div class="teacher-sidebar-brand" id="teacher-brand-click">
                    <div class="teacher-brand-icon">
                        <i class="fa-solid fa-graduation-cap"></i>
                    </div>
                    <div>
                        <div class="teacher-brand-title">CodeQuest</div>
                        <div class="teacher-brand-subtitle">Educator Portal</div>
                    </div>
                </div>

                <!-- Sidebar Nav Menu -->
                <nav class="teacher-nav-menu" id="teacher-nav-links">
                    <div class="teacher-nav-section-title">
                        Management
                    </div>
                    ${navItems.map((item) => {
                        const isActive = activeRoute === item.path || (item.path !== "/teacher/dashboard" && activeRoute.startsWith(item.path));
                        return `
                            <a href="${item.path}" class="teacher-nav-link ${isActive ? 'active' : ''}" data-route="${item.path}">
                                <i class="fa-solid ${item.icon}"></i>
                                <span>${item.label}</span>
                            </a>
                        `;
                    }).join("")}
                </nav>

                <!-- Sidebar Footer User Card -->
                <div class="teacher-sidebar-footer">
                    <div class="teacher-user-info">
                        <div class="teacher-user-avatar">
                            ${displayName.charAt(0).toUpperCase()}
                        </div>
                        <div class="teacher-user-details">
                            <div class="teacher-user-name">${displayName}</div>
                            <div class="teacher-user-email">${email}</div>
                        </div>
                    </div>
                    <span class="badge badge-primary" style="font-size: 0.65rem; padding: 0.2rem 0.45rem;">${role}</span>
                </div>
            </aside>

            <!-- Main Right Wrapper -->
            <div class="teacher-main-wrapper">
                <!-- Topbar -->
                <header class="teacher-topbar">
                    <div class="teacher-topbar-left">
                        <button id="teacher-mobile-menu-btn" class="btn btn-subtle btn-sm" style="display: none; padding: 0.4rem; font-size: 1.1rem; color: #475569;" aria-label="Toggle Sidebar Menu">
                            <i class="fa-solid fa-bars"></i>
                        </button>
                        <div class="teacher-breadcrumbs">
                            <span class="breadcrumb-root">Portal</span>
                            <i class="fa-solid fa-chevron-right breadcrumb-separator"></i>
                            <span class="breadcrumb-current">${getBreadcrumbTitle(activeRoute)}</span>
                        </div>
                    </div>

                    <div class="teacher-topbar-right">
                        <div class="teacher-status-pill">
                            <span class="status-pulse-dot"></span>
                            <span>ML Pipeline Active</span>
                        </div>
                        <button class="btn btn-secondary btn-sm" id="teacher-logout-btn" style="gap: 0.4rem;">
                            <i class="fa-solid fa-arrow-right-from-bracket"></i>
                            <span>Logout</span>
                        </button>
                    </div>
                </header>

                <!-- Page Content Area -->
                <main class="teacher-content" id="teacher-content-area"></main>
            </div>
        </div>
    `;

    // Mobile menu toggle logic
    const sidebar = document.getElementById("teacher-sidebar");
    const backdrop = document.getElementById("teacher-mobile-backdrop");
    const mobileBtn = document.getElementById("teacher-mobile-menu-btn");

    function openMobileMenu() {
        if (sidebar && backdrop) {
            sidebar.classList.add("mobile-open");
            backdrop.style.display = "block";
        }
    }

    function closeMobileMenu() {
        if (sidebar && backdrop) {
            sidebar.classList.remove("mobile-open");
            backdrop.style.display = "none";
        }
    }

    mobileBtn?.addEventListener("click", openMobileMenu);
    backdrop?.addEventListener("click", closeMobileMenu);

    document.getElementById("teacher-brand-click")?.addEventListener("click", () => {
        closeMobileMenu();
        if (onNavigate) onNavigate("/teacher/dashboard");
    });

    targetElement.querySelectorAll(".teacher-nav-link").forEach((link) => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            closeMobileMenu();
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
