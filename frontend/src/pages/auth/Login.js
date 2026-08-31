/**
 * Public Student Login Page
 * =========================
 * Clean, modern split-layout login for learners.
 * Features:
 *   - Left: Educational photo hero with brand badge
 *   - Right: Clean LMS form, email & password, toggle visibility, friendly alerts
 *   - Authenticates strictly against backend authentication service
 *   - Redirects students directly to #/student/home, and educators to #/teacher/dashboard
 *   - Strictly NO demo credentials, demo chips, or fake login fallbacks
 */

import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { setCurrentUser } from "../../utils/auth.js";
import { AuthAPI } from "../../api/api.js";

export function renderLogin(container) {
    container.innerHTML = `
        <div class="auth-page-wrapper" style="min-height: 100vh; background: #F8FAFC; display: flex; align-items: center; justify-content: center; padding: 2rem 1.5rem;">
            <div class="auth-card-split" style="width: 100%; max-width: 980px; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 24px; box-shadow: 0 12px 36px rgba(15, 23, 42, 0.05); display: grid; grid-template-columns: 1fr 1.15fr; overflow: hidden;">
                
                <!-- Left Photo Hero Pane -->
                <div class="auth-side-pane" style="position: relative; background: url('/assets/images/login-hero.jpg') center/cover no-repeat; padding: 2rem; display: flex; flex-direction: column; justify-content: flex-start; min-height: 560px;">
                    <!-- Clean Brand Badge -->
                    <div style="display: inline-flex; align-items: center; gap: 0.55rem; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); padding: 0.45rem 0.85rem; border-radius: 9999px; border: 1px solid rgba(255, 255, 255, 0.15); width: fit-content;">
                        <div style="width: 24px; height: 24px; border-radius: 6px; background: #2563EB; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 0.75rem;">
                            <i class="fa-solid fa-code"></i>
                        </div>
                        <span style="font-size: 0.92rem; font-weight: 800; color: #FFFFFF; letter-spacing: -0.2px;">CodeQuest</span>
                    </div>
                </div>

                <!-- Right Form Pane -->
                <div class="auth-main-pane" style="padding: 3.5rem 3rem; display: flex; flex-direction: column; justify-content: center;">
                    <div style="margin-bottom: 2rem;">
                        <h1 style="font-size: 1.7rem; font-weight: 800; color: #0F172A; margin: 0 0 0.4rem 0; letter-spacing: -0.3px;">Welcome back</h1>
                        <p style="font-size: 0.9rem; color: #64748B; margin: 0;">Continue your Java learning journey.</p>
                    </div>

                    <form id="student-login-form" onsubmit="return false;" style="display: flex; flex-direction: column; gap: 1.25rem;">
                        <!-- Email Input -->
                        <div style="display: flex; flex-direction: column; gap: 0.4rem;">
                            <label for="login-email" style="font-size: 0.86rem; font-weight: 600; color: #0F172A;">Email Address</label>
                            <input type="email" id="login-email" required placeholder="name@example.com" autocomplete="email" style="padding: 0.75rem 1rem; border: 1px solid #CBD5E1; border-radius: 10px; font-size: 0.92rem; color: #0F172A; background: #FFFFFF; outline: none; transition: border-color 0.15s;" />
                        </div>

                        <!-- Password Input with Toggle -->
                        <div style="display: flex; flex-direction: column; gap: 0.4rem;">
                            <label for="login-password" style="font-size: 0.86rem; font-weight: 600; color: #0F172A;">Password</label>
                            <div style="position: relative; display: flex; align-items: center;">
                                <input type="password" id="login-password" required placeholder="Enter your password" autocomplete="current-password" style="width: 100%; padding: 0.75rem 2.75rem 0.75rem 1rem; border: 1px solid #CBD5E1; border-radius: 10px; font-size: 0.92rem; color: #0F172A; background: #FFFFFF; outline: none; transition: border-color 0.15s;" />
                                <button type="button" id="btn-toggle-password" style="position: absolute; right: 0.75rem; background: none; border: none; color: #94A3B8; cursor: pointer; padding: 0.25rem; font-size: 0.9rem;">
                                    <i class="fa-regular fa-eye"></i>
                                </button>
                            </div>
                        </div>

                        <!-- Error Message Box -->
                        <div id="login-error-msg" class="hidden" style="background: #FEF2F2; border: 1px solid #FCA5A5; color: #DC2626; padding: 0.65rem 0.85rem; border-radius: 8px; font-size: 0.84rem; font-weight: 500;"></div>

                        <!-- Submit Button -->
                        <button type="submit" id="btn-login-submit" style="padding: 0.8rem; font-size: 0.95rem; font-weight: 700; border-radius: 10px; background: #2563EB; color: #FFFFFF; border: none; cursor: pointer; transition: background 0.15s; margin-top: 0.5rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);">
                            <span>Sign In</span>
                        </button>

                        <!-- Switch to Signup Link -->
                        <div style="text-align: center; margin-top: 0.5rem; font-size: 0.88rem; color: #64748B;">
                            Don't have an account? <a href="#/register" style="color: #2563EB; font-weight: 700; text-decoration: none;">Create an account</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    const form = document.getElementById("student-login-form");
    const errorEl = document.getElementById("login-error-msg");
    const submitBtn = document.getElementById("btn-login-submit");
    const emailInput = document.getElementById("login-email");
    const passwordInput = document.getElementById("login-password");
    const togglePasswordBtn = document.getElementById("btn-toggle-password");

    // Toggle password visibility
    togglePasswordBtn?.addEventListener("click", () => {
        const isPassword = passwordInput.type === "password";
        passwordInput.type = isPassword ? "text" : "password";
        const icon = togglePasswordBtn.querySelector("i");
        if (icon) {
            icon.className = isPassword ? "fa-regular fa-eye-slash" : "fa-regular fa-eye";
        }
    });

    // Form submit handler
    form?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!email || !password) {
            showError("Please enter both email and password.");
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="spinner" style="width:16px;height:16px;border-width:2px;display:inline-block;"></span> <span>Signing in...</span>`;
        hideError();

        try {
            // 1. Authenticate with backend API service
            const res = await AuthAPI.login({ email, password });
            if (!res || !res.success || !res.user) {
                throw new Error(res?.error || "Invalid email or password.");
            }

            const user = res.user;

            // Optional client Firebase auth sync if available
            try {
                const auth = getAuth();
                await signInWithEmailAndPassword(auth, email, password);
            } catch (fbErr) {
                // Backend authentication succeeded
            }

            // Save authenticated session
            setCurrentUser(user);

            // Redirect: Educator to teacher dashboard; Student to student home
            if (user.role === "teacher" || user.role === "admin") {
                window.location.hash = "#/teacher/dashboard";
            } else {
                window.location.hash = "#/student/home";
            }

        } catch (err) {
            let msg = "Invalid email or password.";
            if (err.message && err.message.includes("connect") || err.message.includes("Failed to fetch")) {
                msg = "Unable to connect to server. Please try again.";
            } else if (err.message) {
                msg = err.message;
            }

            showError(msg);
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<span>Sign In</span>`;
        }
    });

    function showError(msg) {
        if (errorEl) {
            errorEl.textContent = msg;
            errorEl.classList.remove("hidden");
        }
    }

    function hideError() {
        if (errorEl) {
            errorEl.classList.add("hidden");
        }
    }
}
