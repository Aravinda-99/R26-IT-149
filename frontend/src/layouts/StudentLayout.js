/**
 * Student App Shell Layout — CodeQuest Adaptive Learning Platform
 * ================================================================
 * Refined 230px left sidebar, streamlined navigation, restrained active states,
 * top utility bar with contextual breadcrumbs, and responsive mobile drawer.
 */

import { getCurrentUser, logout } from "../utils/auth.js";

export function renderStudentLayout(container, activeRoute, renderPageContent, onNavigate) {
    const user = getCurrentUser() || { displayName: "Student", email: "student@codequest.lk" };
    const displayName = user.displayName || user.name || "Student";
    const userEmail = user.email || "";

    // Normalize active route for menu highlighting
    const r = (activeRoute || "/student/dashboard").toLowerCase();

    // Map route to breadcrumb label
    let breadcrumbTitle = "Dashboard";
    if (r.includes("learning-path") || r.includes("modules")) breadcrumbTitle = "Learning Path";
    else if (r.includes("practice") || r.includes("games")) breadcrumbTitle = "Practice";
    else if (r.includes("assessments") || r.includes("pre-test") || r.includes("diagnostic") || r.includes("post-test") || r.includes("quiz")) breadcrumbTitle = "Assessments";
    else if (r.includes("progress") || r.includes("results") || r.includes("analysis")) breadcrumbTitle = "Progress";
    else if (r.includes("profile")) breadcrumbTitle = "Profile";

    container.innerHTML = `
        <div class="student-shell">
            
            <!-- Mobile Backdrop Overlay -->
            <div id="mobile-drawer-backdrop" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); z-index: 95;"></div>

            <!-- Compact Left Sidebar (230px) -->
            <aside class="student-sidebar" id="student-sidebar">
                
                <!-- Brand Header -->
                <div class="student-sidebar-brand">
                    <div style="width: 32px; height: 32px; background: var(--primary); color: #FFFFFF; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; font-size: 1rem; font-weight: 800;">
                        <i class="fa-solid fa-code"></i>
                    </div>
                    <div class="brand-logo-text">
                        <span>CodeQuest</span>
                        <span class="brand-sub-label">Adaptive Learning</span>
                    </div>
                </div>

                <!-- Navigation List -->
                <ul class="student-nav-list">
                    <li>
                        <a href="/student/dashboard" class="student-nav-item ${r === "/student/dashboard" || r === "/dashboard" ? "active" : ""}" data-route="/student/dashboard">
                            <i class="fa-solid fa-house"></i>
                            <span>Dashboard</span>
                        </a>
                    </li>
                    <li>
                        <a href="/student/learning-path" class="student-nav-item ${r.includes("learning-path") || r.includes("modules") ? "active" : ""}" data-route="/student/learning-path">
                            <i class="fa-solid fa-route"></i>
                            <span>Learn</span>
                        </a>
                    </li>
                    <li>
                        <a href="/student/practice" class="student-nav-item ${r.includes("practice") || r.includes("games") ? "active" : ""}" data-route="/student/practice">
                            <i class="fa-solid fa-gamepad"></i>
                            <span>Practice</span>
                        </a>
                    </li>
                    <li>
                        <a href="/student/progress" class="student-nav-item ${r.includes("progress") || r.includes("results") || r.includes("analysis") ? "active" : ""}" data-route="/student/progress">
                            <i class="fa-solid fa-chart-line"></i>
                            <span>Progress</span>
                        </a>
                    </li>
                    <li>
                        <a href="/student/profile" class="student-nav-item ${r.includes("profile") ? "active" : ""}" data-route="/student/profile">
                            <i class="fa-solid fa-user"></i>
                            <span>Profile</span>
                        </a>
                    </li>
                </ul>

                <!-- Sidebar Footer User Profile & Logout -->
                <div class="student-sidebar-footer">
                    <div style="display: flex; align-items: center; gap: 0.65rem; min-width: 0;">
                        <div style="width: 32px; height: 32px; border-radius: var(--radius-full); background: var(--primary-soft); color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 0.8125rem; font-weight: 700; flex-shrink: 0;">
                            ${displayName.charAt(0).toUpperCase()}
                        </div>
                        <div style="min-width: 0; flex: 1;">
                            <div style="font-size: 0.8125rem; font-weight: 600; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                ${displayName}
                            </div>
                            <div style="font-size: 0.6875rem; color: var(--text-subtle); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                ${userEmail || "Student"}
                            </div>
                        </div>
                    </div>
                    <button type="button" id="sidebar-logout-btn" class="btn btn-subtle btn-sm" style="padding: 0.35rem; color: var(--text-subtle);" title="Sign Out">
                        <i class="fa-solid fa-arrow-right-from-bracket"></i>
                    </button>
                </div>

            </aside>

            <!-- Main Learning Workspace -->
            <div class="student-workspace">
                
                <!-- Top Utility Bar -->
                <header class="student-header">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <button type="button" id="mobile-toggle-btn" class="btn btn-subtle btn-sm" style="display: none; padding: 0.4rem;" aria-label="Toggle navigation">
                            <i class="fa-solid fa-bars"></i>
                        </button>
                        <nav class="header-breadcrumbs" aria-label="Breadcrumb">
                            <span>CodeQuest</span>
                            <span style="font-size: 0.65rem; color: var(--text-subtle);"><i class="fa-solid fa-chevron-right"></i></span>
                            <span class="current">${breadcrumbTitle}</span>
                        </nav>
                    </div>

                    <div class="header-actions">
                        <span class="badge badge-neutral" style="font-size: 0.75rem; font-family: var(--font-mono);">Java Track</span>
                    </div>
                </header>

                <!-- Page View Content Area -->
                <main class="student-content-area" id="student-main-content">
                    <!-- Dynamic Page Injected Here -->
                </main>

            </div>

        </div>
    `;

    // Render inner page content
    const pageContainer = container.querySelector("#student-main-content");
    if (pageContainer && typeof renderPageContent === "function") {
        renderPageContent(pageContainer);
    }

    // Attach Sidebar Navigation Listeners
    container.querySelectorAll(".student-nav-item").forEach((link) => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const targetRoute = link.getAttribute("data-route");
            if (onNavigate && targetRoute) {
                closeMobileSidebar();
                onNavigate(targetRoute);
            }
        });
    });

    // Attach Logout Listener
    container.querySelector("#sidebar-logout-btn")?.addEventListener("click", async () => {
        await logout();
        if (onNavigate) onNavigate("/login");
    });

    // Mobile Drawer Logic
    const mobileBtn = container.querySelector("#mobile-toggle-btn");
    const sidebar = container.querySelector("#student-sidebar");
    const backdrop = container.querySelector("#mobile-drawer-backdrop");

    if (window.innerWidth <= 768 && mobileBtn) {
        mobileBtn.style.display = "inline-flex";
    }

    function openMobileSidebar() {
        if (sidebar) sidebar.classList.add("mobile-open");
        if (backdrop) backdrop.style.display = "block";
    }

    function closeMobileSidebar() {
        if (sidebar) sidebar.classList.remove("mobile-open");
        if (backdrop) backdrop.style.display = "none";
    }

    mobileBtn?.addEventListener("click", openMobileSidebar);
    backdrop?.addEventListener("click", closeMobileSidebar);

    window.addEventListener("resize", () => {
        if (mobileBtn) {
            mobileBtn.style.display = window.innerWidth <= 768 ? "inline-flex" : "none";
        }
        if (window.innerWidth > 768) {
            closeMobileSidebar();
        }
    });
}
