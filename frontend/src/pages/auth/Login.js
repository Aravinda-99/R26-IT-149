/**
 * Login Page — Clean SaaS Multi-Role Authentication
 * =================================================
 */

import { loginWithCredentials, loginWithMockUser, getUserRole } from "../../utils/auth.js";

export function renderLogin(container, onNavigate) {
    let activePortal = "student"; // "student" | "teacher"

    function renderView() {
        container.innerHTML = `
            <div class="card" style="padding: 2.5rem 2rem; box-shadow: var(--shadow-lg);">
                <!-- Brand Header -->
                <div style="text-align: center; margin-bottom: 2rem;">
                    <div style="display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; background: ${activePortal === 'student' ? '#2563EB' : '#1E40AF'}; border-radius: 12px; font-size: 1.5rem; color: white; margin-bottom: 1rem; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25);">
                        <i class="fa-solid ${activePortal === 'student' ? 'fa-code' : 'fa-graduation-cap'}"></i>
                    </div>
                    <h1 style="font-size: 1.75rem; font-weight: 800; color: #0F172A; margin-bottom: 0.35rem;">
                        Welcome to CodeQuest
                    </h1>
                    <p style="color: #64748B; font-size: 0.875rem;">
                        ${activePortal === 'student' ? 'Sign in to access your guided programming learning path.' : 'Sign in to manage questions, review drafts, and view analytics.'}
                    </p>
                </div>

                <!-- Portal Selector Tabs -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; background: #F1F5F9; padding: 0.25rem; border-radius: 8px; margin-bottom: 1.5rem; gap: 0.25rem;">
                    <button class="btn portal-tab ${activePortal === 'student' ? 'active' : ''}" data-portal="student" style="padding: 0.5rem; font-size: 0.8125rem; font-weight: 700; border-radius: 6px; border: none; background: ${activePortal === 'student' ? '#FFFFFF' : 'transparent'}; color: ${activePortal === 'student' ? '#2563EB' : '#64748B'}; box-shadow: ${activePortal === 'student' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'};">
                        <i class="fa-solid fa-user-graduate" style="margin-right: 0.35rem;"></i> Student Portal
                    </button>
                    <button class="btn portal-tab ${activePortal === 'teacher' ? 'active' : ''}" data-portal="teacher" style="padding: 0.5rem; font-size: 0.8125rem; font-weight: 700; border-radius: 6px; border: none; background: ${activePortal === 'teacher' ? '#FFFFFF' : 'transparent'}; color: ${activePortal === 'teacher' ? '#1E40AF' : '#64748B'}; box-shadow: ${activePortal === 'teacher' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'};">
                        <i class="fa-solid fa-chalkboard-user" style="margin-right: 0.35rem;"></i> Educator Portal
                    </button>
                </div>

                <!-- Login Form -->
                <form id="login-form">
                    <div class="form-group">
                        <label class="form-label" for="login-email">Email Address</label>
                        <input 
                            type="email" 
                            id="login-email" 
                            class="input-field" 
                            placeholder="${activePortal === 'student' ? 'student@codequest.lk' : 'teacher@codequest.lk'}" 
                            value="${activePortal === 'student' ? 'student@codequest.lk' : 'teacher@codequest.lk'}" 
                            required 
                        />
                    </div>

                    <div class="form-group" style="margin-bottom: 1.5rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
                            <label class="form-label" for="login-password" style="margin-bottom: 0;">Password</label>
                            <a href="#" id="forgot-pass-link" style="font-size: 0.75rem; color: #2563EB; font-weight: 600;">Forgot password?</a>
                        </div>
                        <input 
                            type="password" 
                            id="login-password" 
                            class="input-field" 
                            placeholder="••••••••" 
                            value="${activePortal === 'student' ? 'student123' : 'teacher123'}" 
                            required 
                        />
                    </div>

                    <div id="login-error-box" class="alert alert-danger" style="display: none; margin-bottom: 1.25rem;"></div>

                    <button type="submit" class="btn btn-primary" id="login-submit-btn" style="width: 100%; padding: 0.75rem; font-size: 0.95rem; background: ${activePortal === 'student' ? '#2563EB' : '#1E40AF'}; border-color: ${activePortal === 'student' ? '#2563EB' : '#1E40AF'};">
                        ${activePortal === 'student' ? 'Sign In as Student' : 'Sign In to Educator Portal'}
                    </button>
                </form>

                <!-- One-Click Demo Access -->
                <div style="margin-top: 1.75rem; border-top: 1px solid #E2E8F0; padding-top: 1.25rem;">
                    <div style="font-size: 0.75rem; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem; text-align: center;">
                        Quick Demo Accounts
                    </div>
                    
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        ${activePortal === 'student' ? `
                            <button type="button" class="btn btn-secondary demo-quick-btn" data-email="student@codequest.lk" data-pass="student123" style="justify-content: space-between; font-size: 0.8125rem; padding: 0.55rem 0.85rem;">
                                <span><i class="fa-solid fa-user-graduate" style="color: #2563EB; margin-right: 0.4rem;"></i> Demo Student (S001)</span>
                                <span style="font-size: 0.75rem; color: #64748B;">student123 →</span>
                            </button>
                        ` : `
                            <button type="button" class="btn btn-secondary demo-quick-btn" data-email="teacher@codequest.lk" data-pass="teacher123" style="justify-content: space-between; font-size: 0.8125rem; padding: 0.55rem 0.85rem;">
                                <span><i class="fa-solid fa-chalkboard-user" style="color: #1E40AF; margin-right: 0.4rem;"></i> Demo Teacher</span>
                                <span style="font-size: 0.75rem; color: #64748B;">teacher123 →</span>
                            </button>
                            <button type="button" class="btn btn-secondary demo-quick-btn" data-email="admin@codequest.lk" data-pass="admin123" style="justify-content: space-between; font-size: 0.8125rem; padding: 0.55rem 0.85rem;">
                                <span><i class="fa-solid fa-shield-halved" style="color: #0F766E; margin-right: 0.4rem;"></i> Demo Administrator</span>
                                <span style="font-size: 0.75rem; color: #64748B;">admin123 →</span>
                            </button>
                        `}
                    </div>
                </div>

                <!-- Signup Link -->
                <div style="margin-top: 1.5rem; text-align: center; font-size: 0.875rem; color: #64748B;">
                    Don't have an account? 
                    <a href="/signup" id="go-signup-link" style="font-weight: 600; color: #2563EB;">Create student account</a>
                </div>
            </div>
        `;

        // Attach event listeners
        container.querySelectorAll(".portal-tab").forEach(tab => {
            tab.addEventListener("click", () => {
                activePortal = tab.dataset.portal;
                renderView();
            });
        });

        container.querySelectorAll(".demo-quick-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const em = btn.dataset.email;
                const ps = btn.dataset.pass;
                performLogin(em, ps);
            });
        });

        const form = document.getElementById("login-form");
        if (form) {
            form.addEventListener("submit", (e) => {
                e.preventDefault();
                const em = document.getElementById("login-email").value.trim();
                const ps = document.getElementById("login-password").value;
                performLogin(em, ps);
            });
        }

        document.getElementById("go-signup-link")?.addEventListener("click", (e) => {
            e.preventDefault();
            if (onNavigate) onNavigate("/signup");
        });

        document.getElementById("forgot-pass-link")?.addEventListener("click", (e) => {
            e.preventDefault();
            alert("For demo accounts, please use the provided one-click login buttons.");
        });
    }

    async function performLogin(email, password) {
        const errorEl = document.getElementById("login-error-box");
        const submitBtn = document.getElementById("login-submit-btn");

        if (errorEl) errorEl.style.display = "none";
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...`;
        }

        const res = await loginWithCredentials(email, password);

        if (res.success) {
            const role = getUserRole(res.user);
            const params = new URLSearchParams(window.location.search);
            const returnUrl = params.get("returnUrl");

            if (returnUrl) {
                if (onNavigate) onNavigate(returnUrl);
            } else if (role === "teacher" || role === "admin") {
                if (onNavigate) onNavigate("/teacher/dashboard");
            } else {
                if (onNavigate) onNavigate("/student/dashboard");
            }
        } else {
            if (errorEl) {
                errorEl.textContent = res.error || "Invalid credentials. Please use the quick demo accounts.";
                errorEl.style.display = "flex";
            }
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = activePortal === "student" ? "Sign In as Student" : "Sign In to Educator Portal";
            }
        }
    }

    renderView();
}
