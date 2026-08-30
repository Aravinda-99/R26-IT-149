/**
 * Public Layout
 * =============
 * Layout for public-facing pages (Welcome, Login, Signup, Onboarding).
 * Clean white SaaS design with logo, simple header navigation, and footer.
 */

import { getCurrentUser } from "../utils/auth.js";

export function renderPublicLayout(container, contentHtml, activeRoute = "") {
    const user = getCurrentUser();
    const dashboardLink = user?.role === "teacher" ? "#/teacher/dashboard" : "#/student/dashboard";

    container.innerHTML = `
        <div class="public-layout">
            <!-- Public Navbar -->
            <header class="public-nav">
                <div class="public-nav-container">
                    <a href="#/welcome" class="public-brand">
                        <div class="brand-icon"><i class="fa-solid fa-code"></i></div>
                        <span class="brand-text">CodeQuest</span>
                    </a>
                    
                    <nav class="public-links">
                        <a href="#/welcome" class="${activeRoute === '/welcome' ? 'active' : ''}">Overview</a>
                        <a href="#/student/pre-test">Diagnostic Check</a>
                    </nav>

                    <div class="public-nav-actions">
                        ${user ? `
                            <a href="${dashboardLink}" class="btn btn-primary btn-sm">
                                <i class="fa-solid fa-gauge"></i> My Dashboard
                            </a>
                        ` : `
                            <a href="#/login" class="btn btn-outline btn-sm">Sign In</a>
                            <a href="#/register" class="btn btn-primary btn-sm">Get Started</a>
                        `}
                    </div>
                </div>
            </header>

            <!-- Page Content -->
            <main class="public-main-content">
                ${contentHtml}
            </main>

            <!-- Clean Minimal Footer -->
            <footer class="public-footer">
                <div class="public-footer-inner">
                    <p>© ${new Date().getFullYear()} CodeQuest — Adaptive Java Programming Learning System.</p>
                </div>
            </footer>
        </div>
    `;
}
