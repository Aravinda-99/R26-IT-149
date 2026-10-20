/**
 * Student Layout
 * ==============
 * Clean, modern, text-based Top-Navbar LMS layout for learners.
 * Features:
 *   1. Full-width sticky top navbar (White background #FFFFFF, border #E2E8F0, height 72px)
 *   2. CodeQuest logo with subtle Java LMS badge
 *   3. Text-only navigation links with modern underline active indicator:
 *      - Home (#/student/home)
 *      - Learning Hub (#/student/dashboard)
 *      - Pre-Test (#/student/pre-test)
 *      - Error Feedback (#/student/error-analysis)
 *      - Game Lessons (#/student/games)
 *      - Understanding Check (#/student/post-test/start)
 *   4. Right-side user avatar dropdown menu (My Profile, Sign Out)
 *   5. Fully responsive with mobile hamburger dropdown menu
 */

import { getCurrentUser, logout } from "../utils/auth.js";

export function renderStudentLayout(container, activeRoute = "") {
    const user = getCurrentUser();
    const studentName = user?.name || user?.displayName || user?.email?.split("@")[0] || "Student";
    const initial = studentName.charAt(0).toUpperCase();

    const navItems = [
        { path: "/student/home", label: "Home" },
        { path: "/student/dashboard", label: "Learning Hub" },
        { path: "/student/pre-test", label: "Pre-Test" },
        { path: "/student/error-analysis", label: "Error Feedback" },
        { path: "/student/games", label: "Game Lessons" },
        { path: "/student/post-test", label: "Understanding Check", matchPrefix: "/student/post-test" },
    ];

    container.innerHTML = `
        <div class="student-lms-layout">
            <!-- Clean Website-Style Top Navbar -->
            <header class="student-topbar">
                <div class="student-topbar-inner">
                    <!-- Brand Section -->
                    <div class="student-brand-box">
                        <a href="#/student/home" class="student-brand-link" title="CodeQuest Home">
                            <div class="student-logo-icon">
                                <i class="fa-solid fa-code"></i>
                            </div>
                            <div class="student-brand-text">
                                <span class="student-logo-title">CodeQuest</span>
                            </div>
                        </a>
                    </div>

                    <!-- Desktop Text-Only Navigation Links -->
                    <nav class="student-nav-menu" aria-label="Student Navigation">
                        ${navItems.map(item => {
                            const isMatch = item.matchPrefix
                                ? activeRoute.startsWith(item.matchPrefix)
                                : activeRoute === item.path || (item.path !== "/student/home" && activeRoute.startsWith(item.path + "/"));
                            const targetHref = item.path === "/student/post-test" ? "#/student/post-test/start" : `#${item.path}`;

                            return `
                                <a href="${targetHref}" class="student-nav-item ${isMatch ? 'active' : ''}" data-path="${item.path}">
                                    ${item.label}
                                </a>
                            `;
                        }).join('')}
                    </nav>

                    <!-- Right Controls / User Profile Dropdown -->
                    <div class="student-controls-box">
                        <div class="student-profile-menu-container" style="position: relative;">
                            <button id="student-profile-trigger" class="student-user-pill" aria-haspopup="true" aria-expanded="false" title="Account Menu">
                                <div class="student-avatar-badge">${initial}</div>
                                <span class="student-display-name">${studentName}</span>
                                <i class="fa-solid fa-chevron-down student-chevron-icon"></i>
                            </button>

                            <!-- Profile Dropdown Menu -->
                            <div id="student-profile-dropdown" class="student-profile-dropdown hidden">
                                <a href="#/student/profile" class="student-dropdown-item">
                                    <i class="fa-solid fa-user-graduate" style="color: #2563EB; width: 16px;"></i> My Profile
                                </a>
                                <div class="student-dropdown-divider"></div>
                                <button id="student-dropdown-logout-btn" class="student-dropdown-logout">
                                    <i class="fa-solid fa-arrow-right-from-bracket" style="width: 16px;"></i> Sign Out
                                </button>
                            </div>
                        </div>

                        <!-- Mobile Hamburger Button -->
                        <button id="student-mobile-toggle" class="student-mobile-toggle" aria-label="Toggle Menu">
                            <i class="fa-solid fa-bars"></i>
                        </button>
                    </div>
                </div>

                <!-- Responsive Mobile Menu Dropdown -->
                <div id="student-mobile-drawer" class="student-mobile-drawer hidden">
                    <nav class="student-mobile-nav">
                        ${navItems.map(item => {
                            const isMatch = item.matchPrefix
                                ? activeRoute.startsWith(item.matchPrefix)
                                : activeRoute === item.path || (item.path !== "/student/home" && activeRoute.startsWith(item.path + "/"));
                            const targetHref = item.path === "/student/post-test" ? "#/student/post-test/start" : `#${item.path}`;

                            return `
                                <a href="${targetHref}" class="student-mobile-nav-item ${isMatch ? 'active' : ''}" data-path="${item.path}">
                                    ${item.label}
                                </a>
                            `;
                        }).join('')}
                        <div class="mobile-drawer-divider"></div>
                        <a href="#/student/profile" class="student-mobile-nav-item">
                            My Profile
                        </a>
                        <button id="student-mobile-logout-btn" class="student-mobile-logout">
                            Sign Out (${studentName})
                        </button>
                    </nav>
                </div>
            </header>

            <!-- Main Page Content Container -->
            <main class="student-page-content" id="student-content">
                <div style="padding: 3rem; text-align: center;"><div class="spinner"></div></div>
            </main>
        </div>
    `;

    // Profile menu toggle
    const profileTrigger = document.getElementById("student-profile-trigger");
    const profileDropdown = document.getElementById("student-profile-dropdown");
    if (profileTrigger && profileDropdown) {
        profileTrigger.addEventListener("click", (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle("hidden");
            profileTrigger.setAttribute("aria-expanded", !profileDropdown.classList.contains("hidden"));
        });
    }

    // Mobile menu toggle
    const toggleBtn = document.getElementById("student-mobile-toggle");
    const drawer = document.getElementById("student-mobile-drawer");
    if (toggleBtn && drawer) {
        toggleBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const isHidden = drawer.classList.contains("hidden");
            drawer.classList.toggle("hidden", !isHidden);
            const icon = toggleBtn.querySelector("i");
            if (icon) {
                icon.className = isHidden ? "fa-solid fa-xmark" : "fa-solid fa-bars";
            }
        });

        drawer.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                drawer.classList.add("hidden");
                const icon = toggleBtn.querySelector("i");
                if (icon) icon.className = "fa-solid fa-bars";
            });
        });
    }

    // Unified document click listener for outside clicks
    document.addEventListener("click", (e) => {
        if (profileTrigger && profileDropdown && !profileTrigger.contains(e.target) && !profileDropdown.contains(e.target)) {
            profileDropdown.classList.add("hidden");
            profileTrigger.setAttribute("aria-expanded", "false");
        }
        if (toggleBtn && drawer && !toggleBtn.contains(e.target) && !drawer.contains(e.target)) {
            drawer.classList.add("hidden");
            const icon = toggleBtn.querySelector("i");
            if (icon) icon.className = "fa-solid fa-bars";
        }
    });

    // Logout handlers
    const handleLogout = async () => {
        await logout();
        window.location.hash = "#/login";
    };

    document.getElementById("student-dropdown-logout-btn")?.addEventListener("click", handleLogout);
    document.getElementById("student-mobile-logout-btn")?.addEventListener("click", handleLogout);
}
