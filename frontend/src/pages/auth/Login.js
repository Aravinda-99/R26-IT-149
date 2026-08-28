/**
 * Login Page — CodeQuest Clean SaaS Multi-Role Authentication
 * =============================================================
 * Returning user login with role-specific navigation and demo accounts.
 */

import { animatePageEntrance } from "../../utils/animations.js";
import { loginWithCredentials, getUserRole } from "../../utils/auth.js";

export function renderLogin(container, onNavigate) {
    let activePortal = "student"; // "student" | "teacher"

    function renderView() {
        container.innerHTML = `
            <div class="card login-card" style="width: 100%; max-width: 480px; margin: 0 auto; padding: 2.5rem 2rem; border-radius: var(--radius-md); box-shadow: var(--shadow-md);">
                
                <!-- Brand Header -->
                <div style="text-align: center; margin-bottom: 2rem;">
                    <div style="display: inline-flex; align-items: center; justify-content: center; width: 52px; height: 52px; background: ${activePortal === 'student' ? 'var(--primary-soft)' : '#EFF6FF'}; color: ${activePortal === 'student' ? 'var(--primary)' : '#1E40AF'}; border-radius: var(--radius-sm); font-size: 1.4rem; margin-bottom: 1rem;">
                        <i class="fa-solid ${activePortal === 'student' ? 'fa-user-graduate' : 'fa-chalkboard-user'}"></i>
                    </div>
                    <h1 style="font-size: 1.65rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.35rem;">
                        ${activePortal === 'student' ? 'Welcome to CodeQuest' : 'Educator Portal'}
                    </h1>
                    <p style="color: var(--text-muted); font-size: 0.875rem;">
                        ${activePortal === 'student' ? 'Sign in to continue your Java learning track.' : 'Sign in to manage curriculum, review drafts, and view analytics.'}
                    </p>
                </div>

                <!-- Portal Selector Tabs -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; background: var(--bg-surface-subtle); padding: 0.25rem; border-radius: var(--radius-sm); margin-bottom: 1.5rem; gap: 0.25rem;">
                    <button class="btn portal-tab ${activePortal === 'student' ? 'active' : ''}" data-portal="student" style="padding: 0.5rem; font-size: 0.8125rem; font-weight: 700; border-radius: var(--radius-sm); border: none; background: ${activePortal === 'student' ? 'var(--bg-surface)' : 'transparent'}; color: ${activePortal === 'student' ? 'var(--primary)' : 'var(--text-muted)'}; box-shadow: ${activePortal === 'student' ? 'var(--shadow-sm)' : 'none'};">
                        <i class="fa-solid fa-user-graduate" style="margin-right: 0.35rem;"></i> Student
                    </button>
                    <button class="btn portal-tab ${activePortal === 'teacher' ? 'active' : ''}" data-portal="teacher" style="padding: 0.5rem; font-size: 0.8125rem; font-weight: 700; border-radius: var(--radius-sm); border: none; background: ${activePortal === 'teacher' ? 'var(--bg-surface)' : 'transparent'}; color: ${activePortal === 'teacher' ? '#1E40AF' : 'var(--text-muted)'}; box-shadow: ${activePortal === 'teacher' ? 'var(--shadow-sm)' : 'none'};">
                        <i class="fa-solid fa-chalkboard-user" style="margin-right: 0.35rem;"></i> Educator
                    </button>
                </div>

                <!-- Login Form -->
                <form id="login-form">
                    <div class="form-group" style="margin-bottom: 1.15rem;">
                        <label class="form-label" for="login-email">Email Address</label>
                        <input 
                            type="email" 
                            id="login-email" 
                            class="form-input" 
                            placeholder="${activePortal === 'student' ? 'student@codequest.lk' : 'teacher@codequest.lk'}" 
                            value="${activePortal === 'student' ? 'student@codequest.lk' : 'teacher@codequest.lk'}" 
                            autocomplete="email"
                            required 
                        />
                    </div>

                    <div class="form-group" style="margin-bottom: 1.5rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
                            <label class="form-label" for="login-password" style="margin-bottom: 0;">Password</label>
                        </div>
                        <input 
                            type="password" 
                            id="login-password" 
                            class="form-input" 
                            placeholder="••••••••" 
                            value="${activePortal === 'student' ? 'student123' : 'teacher123'}" 
                            autocomplete="current-password"
                            required 
                        />
                    </div>

                    <!-- General Error Banner -->
                    <div id="login-error-box" class="badge badge-danger" style="display: none; width: 100%; padding: 0.75rem 1rem; border-radius: var(--radius-sm); font-size: 0.8125rem; margin-bottom: 1.25rem; justify-content: flex-start; text-align: left; line-height: 1.4;">
                        <i class="fa-solid fa-circle-exclamation" style="margin-right: 0.4rem; flex-shrink: 0;"></i>
                        <span id="login-error-msg"></span>
                    </div>

                    <button type="submit" class="btn btn-primary" id="login-submit-btn" style="width: 100%; padding: 0.75rem; font-size: 0.95rem; font-weight: 700; background: ${activePortal === 'student' ? 'var(--primary)' : '#1E40AF'}; border-color: ${activePortal === 'student' ? 'var(--primary)' : '#1E40AF'};">
                        ${activePortal === 'student' ? 'Sign In as Student' : 'Sign In as Educator'}
                    </button>
                </form>

                <!-- Quick Demo Credentials -->
                <div style="margin-top: 1.5rem; border-top: 1px solid var(--border-main); padding-top: 1.25rem;">
                    <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem; text-align: center;">
                        Quick Demo Credentials
                    </div>
                    
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        ${activePortal === 'student' ? `
                            <button type="button" class="btn btn-secondary demo-quick-btn" data-email="student@codequest.lk" data-pass="student123" style="justify-content: space-between; font-size: 0.8125rem; padding: 0.55rem 0.85rem;">
                                <span><i class="fa-solid fa-user-graduate" style="color: var(--primary); margin-right: 0.4rem;"></i> Demo Student</span>
                                <span style="font-size: 0.75rem; color: var(--text-muted);">student123 →</span>
                            </button>
                        ` : `
                            <button type="button" class="btn btn-secondary demo-quick-btn" data-email="teacher@codequest.lk" data-pass="teacher123" style="justify-content: space-between; font-size: 0.8125rem; padding: 0.55rem 0.85rem;">
                                <span><i class="fa-solid fa-chalkboard-user" style="color: #1E40AF; margin-right: 0.4rem;"></i> Demo Teacher</span>
                                <span style="font-size: 0.75rem; color: var(--text-muted);">teacher123 →</span>
                            </button>
                        `}
                    </div>
                </div>

                <!-- Signup Link -->
                <div style="margin-top: 1.5rem; text-align: center; font-size: 0.875rem; color: var(--text-muted); border-top: 1px solid var(--border-main); padding-top: 1.25rem;">
                    New student? 
                    <a href="/welcome" id="login-to-register" style="color: var(--primary); font-weight: 600; text-decoration: none;">Start here</a>
                </div>

            </div>
        `;

        animatePageEntrance(container.querySelector(".login-card"));

        // Tab Switching
        container.querySelectorAll(".portal-tab").forEach((btn) => {
            btn.addEventListener("click", () => {
                activePortal = btn.dataset.portal;
                renderView();
            });
        });

        // Demo quick login buttons
        container.querySelectorAll(".demo-quick-btn").forEach((btn) => {
            btn.addEventListener("click", async () => {
                const em = btn.dataset.email;
                const ps = btn.dataset.pass;
                await performLogin(em, ps);
            });
        });

        // Form Submit
        const form = document.getElementById("login-form");
        form?.addEventListener("submit", async (e) => {
            e.preventDefault();
            const em = document.getElementById("login-email").value.trim();
            const ps = document.getElementById("login-password").value;
            await performLogin(em, ps);
        });

        document.getElementById("login-to-register")?.addEventListener("click", (e) => {
            e.preventDefault();
            if (onNavigate) onNavigate("/welcome");
        });
    }

    async function performLogin(email, password) {
        const errorBox = document.getElementById("login-error-box");
        const errorMsg = document.getElementById("login-error-msg");
        const submitBtn = document.getElementById("login-submit-btn");

        if (errorBox) errorBox.style.display = "none";
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span class="spinner" style="width: 16px; height: 16px; border-width: 2px; display: inline-block; vertical-align: middle; margin-right: 0.5rem;"></span> Signing in...`;
        }

        const res = await loginWithCredentials(email, password);

        if (res.success) {
            const role = getUserRole(res.user);
            if (onNavigate) {
                if (role === "teacher" || role === "admin") {
                    onNavigate("/teacher/dashboard");
                } else {
                    onNavigate("/student/dashboard");
                }
            }
        } else {
            if (errorBox && errorMsg) {
                errorMsg.innerText = res.error || "Invalid credentials. Please verify your email and password.";
                errorBox.style.display = "flex";
            }
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerText = activePortal === "student" ? "Sign In as Student" : "Sign In as Educator";
            }
        }
    }

    renderView();
}
