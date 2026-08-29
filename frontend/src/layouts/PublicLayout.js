/**
 * PublicLayout — CodeQuest Modern LMS Public Shell
 * =================================================
 * Clean, lightweight public layout for Welcome, Onboarding, Login, and Signup.
 */

import { getCurrentUser } from "../utils/auth.js";

export function renderPublicLayout(targetElement, activeRoute, renderPageContent, onNavigate) {
    const user = getCurrentUser();

    targetElement.innerHTML = `
        <div class="public-layout" style="min-height: 100vh; background: var(--bg-app); display: flex; flex-direction: column;">
            <!-- Public Top Navbar -->
            <header style="background: var(--bg-surface); border-bottom: 1px solid var(--border-main); position: sticky; top: 0; z-index: 50;">
                <div style="max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; height: 64px; display: flex; align-items: center; justify-content: space-between;">
                    
                    <!-- Brand -->
                    <div style="display: flex; align-items: center; gap: 0.75rem; cursor: pointer;" id="public-brand-click">
                        <div style="width: 36px; height: 36px; background: var(--primary); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; color: white; font-size: 1.1rem; box-shadow: var(--shadow-sm);">
                            <i class="fa-solid fa-code"></i>
                        </div>
                        <div>
                            <div style="font-weight: 800; font-size: 1.15rem; color: var(--text-main); letter-spacing: -0.02em; line-height: 1.1;">CodeQuest</div>
                            <div style="font-size: 0.6875rem; font-weight: 600; color: var(--text-muted); letter-spacing: 0.04em;">Java Programming Learning System</div>
                        </div>
                    </div>

                    <!-- Right Actions -->
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        ${user ? `
                            <button class="btn btn-primary btn-sm" id="public-dash-btn">
                                Go to Dashboard <i class="fa-solid fa-arrow-right" style="margin-left: 0.35rem;"></i>
                            </button>
                        ` : `
                            ${activeRoute === '/login' ? `
                                <span style="font-size: 0.875rem; color: var(--text-muted);">New student?</span>
                                <button class="btn btn-primary btn-sm" id="public-start-btn">
                                    Get Started
                                </button>
                            ` : `
                                <span style="font-size: 0.875rem; color: var(--text-muted);">Already registered?</span>
                                <button class="btn btn-secondary btn-sm" id="public-login-btn">
                                    Sign In
                                </button>
                            `}
                        `}
                    </div>
                </div>
            </header>

            <!-- Main Content Container -->
            <main style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 2.5rem 1rem;" id="public-content-area"></main>

            <!-- Clean Footer -->
            <footer style="padding: 1.5rem; text-align: center; font-size: 0.8125rem; color: var(--text-subtle); border-top: 1px solid var(--border-main); background: var(--bg-surface);">
                CodeQuest Programming Learning Framework • Research ID: R26-IT-149
            </footer>
        </div>
    `;

    // Render inner public page content (Welcome, Login, Signup, Onboarding)
    const contentArea = targetElement.querySelector("#public-content-area");
    if (contentArea && typeof renderPageContent === "function") {
        renderPageContent(contentArea);
    }

    document.getElementById("public-brand-click")?.addEventListener("click", () => {
        if (onNavigate) onNavigate("/welcome");
    });
    document.getElementById("public-dash-btn")?.addEventListener("click", () => {
        if (onNavigate) onNavigate("/student/dashboard");
    });
    document.getElementById("public-start-btn")?.addEventListener("click", () => {
        if (onNavigate) onNavigate("/welcome");
    });
    document.getElementById("public-login-btn")?.addEventListener("click", () => {
        if (onNavigate) onNavigate("/login");
    });
}
