/**
 * PublicLayout — CodeQuest Modern LMS Public Shell
 * =================================================
 * Clean, lightweight public layout for Welcome, Onboarding, Login, and Signup.
 */

import { getCurrentUser } from "../utils/auth.js";

export function renderPublicLayout(targetElement, activeRoute, onNavigate) {
    const user = getCurrentUser();

    targetElement.innerHTML = `
        <div class="public-layout" style="min-height: 100vh; background: #F8FAFC; display: flex; flex-direction: column;">
            <!-- Public Top Navbar -->
            <header style="background: #FFFFFF; border-bottom: 1px solid #E2E8F0; position: sticky; top: 0; z-index: 50;">
                <div style="max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; height: 64px; display: flex; align-items: center; justify-content: space-between;">
                    
                    <!-- Brand -->
                    <div style="display: flex; align-items: center; gap: 0.75rem; cursor: pointer;" id="public-brand-click">
                        <div style="width: 36px; height: 36px; background: #2563EB; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.1rem; box-shadow: 0 2px 4px rgba(37,99,235,0.2);">
                            <i class="fa-solid fa-code"></i>
                        </div>
                        <div>
                            <div style="font-weight: 800; font-size: 1.15rem; color: #0F172A; letter-spacing: -0.02em; line-height: 1.1;">CodeQuest</div>
                            <div style="font-size: 0.6875rem; font-weight: 600; color: #64748B; letter-spacing: 0.04em;">Java Programming Learning System</div>
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
                                <span style="font-size: 0.875rem; color: #64748B;">New student?</span>
                                <button class="btn btn-primary btn-sm" id="public-start-btn">
                                    Get Started
                                </button>
                            ` : `
                                <span style="font-size: 0.875rem; color: #64748B;">Already registered?</span>
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
            <footer style="padding: 1.5rem; text-align: center; font-size: 0.8125rem; color: #94A3B8; border-top: 1px solid #E2E8F0; background: #FFFFFF;">
                CodeQuest Programming Learning Framework • Research ID: R26-IT-149
            </footer>
        </div>
    `;

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

    return document.getElementById("public-content-area");
}
