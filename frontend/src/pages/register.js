/**
 * Register Page
 * ==============
 * Premium student-friendly signup UI (restored from login/reg updates commit).
 * Uses the dual-role auth manager so session works with RoleGuard.
 */

import { AuthAPI } from "../api/api.js";
import { persistAuthState, getUserRole } from "../utils/auth.js";

export function renderRegister(container, onNavigate) {
    container.innerHTML = `
        <div style="min-height: 85vh; display: flex; align-items: center; justify-content: center; padding: 2rem;">
            
            <style>
                @keyframes floatCard {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                    100% { transform: translateY(0px); }
                }
                @keyframes pulseGlow {
                    0% { box-shadow: 0 0 0 0 rgba(74, 144, 226, 0.4); }
                    70% { box-shadow: 0 0 20px 10px rgba(74, 144, 226, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(74, 144, 226, 0); }
                }
                .premium-login-card {
                    background: rgba(30, 42, 58, 0.4);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 24px;
                    padding: 3rem;
                    width: 100%;
                    max-width: 440px;
                    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1);
                    animation: floatCard 6s ease-in-out infinite;
                    position: relative;
                    z-index: 2;
                }
                .login-bg-blob {
                    position: absolute;
                    filter: blur(80px);
                    z-index: 1;
                    opacity: 0.5;
                    animation: floatCard 10s ease-in-out infinite reverse;
                }
                .blob-1 {
                    width: 300px; height: 300px;
                    background: var(--accent-purple, #a78bfa);
                    top: -100px; right: -100px;
                    border-radius: 50%;
                }
                .blob-2 {
                    width: 400px; height: 400px;
                    background: var(--accent-blue, #4a90e2);
                    bottom: -150px; left: -150px;
                    border-radius: 50%;
                }
                .premium-input-wrap {
                    position: relative;
                    margin-bottom: 1.5rem;
                }
                .premium-input-wrap i {
                    position: absolute;
                    left: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-secondary, #8899aa);
                    transition: color 0.3s ease;
                }
                .premium-input {
                    width: 100%;
                    padding: 1rem 1rem 1rem 3rem;
                    background: rgba(15, 23, 36, 0.6);
                    border: 1px solid var(--border-color, #2a3a4e);
                    border-radius: 12px;
                    color: var(--text-primary, #e8edf4);
                    font-size: 0.95rem;
                    outline: none;
                    transition: all 0.3s ease;
                    font-family: inherit;
                }
                .premium-input:focus {
                    border-color: var(--accent-purple, #a78bfa);
                    background: rgba(15, 23, 36, 0.8);
                    box-shadow: 0 0 0 4px rgba(167, 139, 250, 0.15);
                }
                .premium-btn {
                    width: 100%;
                    padding: 1rem;
                    background: linear-gradient(135deg, var(--accent-purple, #a78bfa), #8b5cf6);
                    color: #fff;
                    border: none;
                    border-radius: 12px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    margin-top: 1rem;
                    letter-spacing: 0.5px;
                }
                .premium-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 16px rgba(167, 139, 250, 0.3);
                }
                .premium-btn:active {
                    transform: translateY(0);
                }
                .form-title {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #fff;
                    margin-bottom: 0.5rem;
                    background: linear-gradient(to right, #e8edf4, #a78bfa);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
            </style>

            <div class="login-bg-blob blob-1"></div>
            <div class="login-bg-blob blob-2"></div>

            <div class="premium-login-card">
                <div style="text-align: center; margin-bottom: 2.5rem;">
                    <div style="font-size: 3rem; color: var(--accent-purple, #a78bfa); margin-bottom: 1rem; animation: pulseGlow 2s infinite; border-radius: 50%; display: inline-block;">
                        <i class="fas fa-user-plus"></i>
                    </div>
                    <h1 class="form-title">Join CodeQuest</h1>
                    <p style="color: var(--text-secondary, #8899aa); font-size: 0.95rem;">Start your learning journey today</p>
                </div>

                <div>
                    <div class="premium-input-wrap">
                        <input type="text" id="reg-name" class="premium-input" placeholder="Display Name" />
                        <i class="fas fa-user"></i>
                    </div>

                    <div class="premium-input-wrap">
                        <input type="email" id="reg-email" class="premium-input" placeholder="Email Address" />
                        <i class="fas fa-envelope"></i>
                    </div>
                    
                    <div class="premium-input-wrap">
                        <input type="password" id="reg-password" class="premium-input" placeholder="Password (Min 6 characters)" />
                        <i class="fas fa-lock"></i>
                    </div>
                    
                    <div id="reg-error" style="color: #ef4444; font-size: 0.85rem; padding: 0.5rem; background: rgba(239, 68, 68, 0.1); border-radius: 8px; margin-bottom: 1rem; display: none; text-align: center; border: 1px solid rgba(239, 68, 68, 0.2);">
                    </div>

                    <button class="premium-btn" id="reg-btn">
                        <span>Create Account</span>
                    </button>
                    
                    <p style="text-align: center; margin-top: 1.5rem; font-size: 0.9rem; color: var(--text-secondary, #8899aa);">
                        Already have an account? 
                        <a href="#" id="go-login" style="color: var(--accent-blue, #4a90e2); text-decoration: none; font-weight: 600; margin-left: 0.3rem;">Sign In</a>
                    </p>
                    <p style="text-align: center; margin-top: 0.75rem; font-size: 0.85rem;">
                        <a href="#" id="go-landing" style="color: var(--text-secondary, #8899aa); text-decoration: none;">← Back to home</a>
                    </p>
                </div>
            </div>
        </div>
    `;

    document.getElementById("reg-btn").addEventListener("click", async () => {
        const name = document.getElementById("reg-name").value.trim();
        const email = document.getElementById("reg-email").value.trim();
        const password = document.getElementById("reg-password").value;
        const errorEl = document.getElementById("reg-error");
        const btn = document.getElementById("reg-btn");

        if (!name || !email || !password) {
            errorEl.textContent = "Please fill in all fields";
            errorEl.style.display = "block";
            return;
        }

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
        errorEl.style.display = "none";

        try {
            const data = await AuthAPI.register({
                email,
                display_name: name,
                name,
                password,
            });

            if (!data.success && !data.user) {
                throw new Error(data.error || "Failed to create account");
            }

            const user = data.user;
            const role = user.role || getUserRole(user) || "student";
            persistAuthState(user, role, data.token || null);

            if (onNavigate) onNavigate("/student/dashboard");
        } catch (e) {
            errorEl.innerHTML = '<i class="fas fa-exclamation-circle" style="margin-right:0.4rem;"></i> ' + e.message;
            errorEl.style.display = "block";
            btn.disabled = false;
            btn.innerHTML = '<span>Create Account</span>';
        }
    });

    const loginLink = document.getElementById("go-login");
    if (loginLink && onNavigate) {
        loginLink.addEventListener("click", (e) => {
            e.preventDefault();
            onNavigate("/login");
        });
    }

    const homeLink = document.getElementById("go-landing");
    if (homeLink && onNavigate) {
        homeLink.addEventListener("click", (e) => {
            e.preventDefault();
            onNavigate("/welcome");
        });
    }
}

/** Alias used by the dual-role router */
export const renderSignup = renderRegister;
