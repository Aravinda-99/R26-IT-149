/**
 * Login Page
 * ==========
 * Dual-Portal Role-Based Authentication (Student & Teacher/Admin).
 */

import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { loginWithMockUser, getUserRole } from "../utils/auth.js";

export function renderLogin(container, onNavigate) {
    let activePortal = "student"; // "student" | "teacher"

    function renderPortalContent() {
        container.innerHTML = `
            <div style="max-width: 480px; margin: 3rem auto; color: var(--text-primary);">
                <!-- App Logo / Header -->
                <div style="text-align: center; margin-bottom: 2rem;">
                    <div style="display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; background: linear-gradient(135deg, #6366f1, #4f46e5); border-radius: 1rem; font-size: 1.8rem; color: white; margin-bottom: 1rem; box-shadow: 0 10px 25px rgba(99, 102, 241, 0.35);">
                        <i class="fa-solid fa-code"></i>
                    </div>
                    <h1 style="font-size: 1.9rem; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 0.3rem;">
                        CodeQuest Portal
                    </h1>
                    <p style="color: var(--text-secondary); font-size: 0.95rem;">
                        Adaptive Programming & Schema Mastery Learning Platform
                    </p>
                </div>

                <!-- Portal Selector Tabs -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; background: var(--bg-card, #1e2a3a); padding: 0.35rem; border-radius: 0.75rem; border: 1px solid var(--border-color); margin-bottom: 1.5rem; gap: 0.35rem;">
                    <button class="btn portal-tab-btn ${activePortal === 'student' ? 'active' : ''}" data-portal="student" style="padding: 0.65rem; border-radius: 0.5rem; font-weight: 700; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; background: ${activePortal === 'student' ? '#6366f1' : 'transparent'}; color: ${activePortal === 'student' ? 'white' : 'var(--text-secondary)'}; border: none; cursor: pointer; transition: all 0.2s;">
                        <i class="fa-solid fa-user-graduate"></i> Student Portal
                    </button>
                    <button class="btn portal-tab-btn ${activePortal === 'teacher' ? 'active' : ''}" data-portal="teacher" style="padding: 0.65rem; border-radius: 0.5rem; font-weight: 700; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; background: ${activePortal === 'teacher' ? '#4338ca' : 'transparent'}; color: ${activePortal === 'teacher' ? 'white' : 'var(--text-secondary)'}; border: none; cursor: pointer; transition: all 0.2s;">
                        <i class="fa-solid fa-chalkboard-user"></i> Educator Portal
                    </button>
                </div>

                <!-- Auth Card -->
                <div class="card" style="background: var(--card-bg, #181c28); border: 1px solid var(--border-color); border-radius: 1rem; padding: 2rem; box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);">
                    <div style="margin-bottom: 1.5rem;">
                        <h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.2rem; color: ${activePortal === 'student' ? '#818cf8' : '#a5b4fc'};">
                            ${activePortal === 'student' ? 'Student Sign In' : 'Teacher & Administrator Sign In'}
                        </h2>
                        <p style="font-size: 0.85rem; color: var(--text-secondary);">
                            ${activePortal === 'student' 
                                ? 'Access your personalized learning journey, diagnostic quizzes, and gamified lessons.' 
                                : 'Access curriculum questions, LLM drafting tools, and schema mastery approval workflow.'}
                        </p>
                    </div>

                    <form id="login-form">
                        <div style="margin-bottom: 1.1rem;">
                            <label style="display: block; font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.4rem;">Institutional Email</label>
                            <input 
                                type="email" 
                                id="login-email" 
                                class="input-field" 
                                placeholder="${activePortal === 'student' ? 'student@codequest.lk' : 'teacher@codequest.lk'}" 
                                value="${activePortal === 'student' ? 'student@codequest.lk' : 'teacher@codequest.lk'}"
                                required 
                            />
                        </div>
                        <div style="margin-bottom: 1.4rem;">
                            <label style="display: block; font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.4rem;">Password</label>
                            <input 
                                type="password" 
                                id="login-password" 
                                class="input-field" 
                                placeholder="••••••••" 
                                value="${activePortal === 'student' ? 'student123' : 'teacher123'}"
                                required 
                            />
                        </div>

                        <div id="login-error" style="color: #f87171; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); padding: 0.6rem 0.8rem; border-radius: 0.4rem; font-size: 0.85rem; margin-bottom: 1.2rem; display: none;"></div>

                        <button type="submit" class="btn btn-primary" id="login-btn" style="width: 100%; padding: 0.8rem; font-size: 0.95rem; font-weight: 700; background: linear-gradient(135deg, #6366f1, #4f46e5); border-radius: 0.5rem;">
                            ${activePortal === 'student' ? 'Sign In as Student' : 'Sign In to Educator Portal'}
                        </button>
                    </form>

                    <!-- Quick Demo Sign In Shortcut -->
                    <div style="margin-top: 1.8rem; border-top: 1px solid var(--border-color); padding-top: 1.2rem;">
                        <span style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; display: block; margin-bottom: 0.8rem; text-align: center;">
                            ⚡ One-Click Demo Access
                        </span>
                        
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            ${activePortal === 'student' ? `
                                <button class="btn demo-quick-login" data-email="student@codequest.lk" data-pass="student123" style="background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.4); color: #c7d2fe; text-align: left; padding: 0.55rem 0.9rem; border-radius: 0.4rem; font-size: 0.85rem; display: flex; justify-content: space-between; align-items: center;">
                                    <span><i class="fa-solid fa-user-graduate" style="margin-right: 0.4rem;"></i> Demo Student (S001)</span>
                                    <span style="font-size: 0.75rem; color: #a5b4fc;">student123 →</span>
                                </button>
                            ` : `
                                <button class="btn demo-quick-login" data-email="teacher@codequest.lk" data-pass="teacher123" style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #a7f3d0; text-align: left; padding: 0.55rem 0.9rem; border-radius: 0.4rem; font-size: 0.85rem; display: flex; justify-content: space-between; align-items: center;">
                                    <span><i class="fa-solid fa-chalkboard-user" style="margin-right: 0.4rem;"></i> Demo Teacher</span>
                                    <span style="font-size: 0.75rem; color: #6ee7b7;">teacher123 →</span>
                                </button>
                                <button class="btn demo-quick-login" data-email="admin@codequest.lk" data-pass="admin123" style="background: rgba(168, 85, 247, 0.15); border: 1px solid rgba(168, 85, 247, 0.4); color: #e9d5ff; text-align: left; padding: 0.55rem 0.9rem; border-radius: 0.4rem; font-size: 0.85rem; display: flex; justify-content: space-between; align-items: center;">
                                    <span><i class="fa-solid fa-shield-halved" style="margin-right: 0.4rem;"></i> Demo Administrator</span>
                                    <span style="font-size: 0.75rem; color: #d8b4fe;">admin123 →</span>
                                </button>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Portal Switchers
        container.querySelectorAll(".portal-tab-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                activePortal = btn.dataset.portal;
                renderPortalContent();
            });
        });

        // Demo Quick Login buttons
        container.querySelectorAll(".demo-quick-login").forEach(btn => {
            btn.addEventListener("click", () => {
                const em = btn.dataset.email;
                const ps = btn.dataset.pass;
                executeLogin(em, ps);
            });
        });

        // Form Submit
        const form = document.getElementById("login-form");
        if (form) {
            form.addEventListener("submit", (e) => {
                e.preventDefault();
                const em = document.getElementById("login-email").value.trim();
                const ps = document.getElementById("login-password").value;
                executeLogin(em, ps);
            });
        }
    }

    async function executeLogin(email, password) {
        const errorEl = document.getElementById("login-error");
        const btn = document.getElementById("login-btn");

        if (!email || !password) {
            if (errorEl) {
                errorEl.textContent = "Please provide both email and password";
                errorEl.style.display = "block";
            }
            return;
        }

        if (btn) {
            btn.disabled = true;
            btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...`;
        }
        if (errorEl) errorEl.style.display = "none";

        try {
            const auth = getAuth();
            await signInWithEmailAndPassword(auth, email, password);
            const role = getUserRole();
            if (role === "teacher" || role === "admin") {
                if (onNavigate) onNavigate("teacher-dashboard");
            } else {
                if (onNavigate) onNavigate("dashboard");
            }
        } catch {
            // Check mock login fallback
            const mockRes = await loginWithMockUser(email, password);
            if (mockRes.success) {
                const role = getUserRole(mockRes.user);
                if (role === "teacher" || role === "admin") {
                    if (onNavigate) onNavigate("teacher-dashboard");
                } else {
                    if (onNavigate) onNavigate("dashboard");
                }
            } else {
                if (errorEl) {
                    errorEl.textContent = "Invalid login credentials. Please use the demo accounts or check your details.";
                    errorEl.style.display = "block";
                }
                if (btn) {
                    btn.disabled = false;
                    btn.textContent = "Sign In";
                }
            }
        }
    }

    renderPortalContent();
}

