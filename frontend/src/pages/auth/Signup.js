/**
 * Public Student Registration Page
 * =================================
 * Clean, modern split-layout registration for learners.
 * Features:
 *   - Left: Educational photo hero
 *   - Right: Clean LMS form (Full Name, Email, Password, Confirm Password)
 *   - Strictly creates verified student accounts via backend API
 *   - Redirects directly to Student Home (#/student/home)
 *   - Friendly error validation & loading feedback with zero fake fallbacks
 */

import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { setCurrentUser } from "../../utils/auth.js";
import { AuthAPI } from "../../api/api.js";

export function renderRegister(container) {
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
                <div class="auth-main-pane" style="padding: 3rem 2.75rem; display: flex; flex-direction: column; justify-content: center;">
                    <div style="margin-bottom: 1.5rem;">
                        <h1 style="font-size: 1.65rem; font-weight: 800; color: #0F172A; margin: 0 0 0.35rem 0; letter-spacing: -0.3px;">Create an account</h1>
                        <p style="font-size: 0.9rem; color: #64748B; margin: 0;">Get started with your Java foundations track.</p>
                    </div>

                    <form id="student-signup-form" onsubmit="return false;" style="display: flex; flex-direction: column; gap: 1rem;">
                        <!-- Full Name -->
                        <div style="display: flex; flex-direction: column; gap: 0.35rem;">
                            <label for="signup-name" style="font-size: 0.86rem; font-weight: 600; color: #0F172A;">Full Name</label>
                            <input type="text" id="signup-name" required placeholder="e.g. Jordan Smith" autocomplete="name" style="padding: 0.7rem 1rem; border: 1px solid #CBD5E1; border-radius: 10px; font-size: 0.92rem; color: #0F172A; background: #FFFFFF; outline: none; transition: border-color 0.15s;" />
                        </div>

                        <!-- Email -->
                        <div style="display: flex; flex-direction: column; gap: 0.35rem;">
                            <label for="signup-email" style="font-size: 0.86rem; font-weight: 600; color: #0F172A;">Email Address</label>
                            <input type="email" id="signup-email" required placeholder="name@example.com" autocomplete="email" style="padding: 0.7rem 1rem; border: 1px solid #CBD5E1; border-radius: 10px; font-size: 0.92rem; color: #0F172A; background: #FFFFFF; outline: none; transition: border-color 0.15s;" />
                        </div>

                        <!-- Password -->
                        <div style="display: flex; flex-direction: column; gap: 0.35rem;">
                            <label for="signup-password" style="font-size: 0.86rem; font-weight: 600; color: #0F172A;">Password</label>
                            <input type="password" id="signup-password" required placeholder="Minimum 6 characters" autocomplete="new-password" style="padding: 0.7rem 1rem; border: 1px solid #CBD5E1; border-radius: 10px; font-size: 0.92rem; color: #0F172A; background: #FFFFFF; outline: none; transition: border-color 0.15s;" />
                        </div>

                        <!-- Confirm Password -->
                        <div style="display: flex; flex-direction: column; gap: 0.35rem;">
                            <label for="signup-confirm-password" style="font-size: 0.86rem; font-weight: 600; color: #0F172A;">Confirm Password</label>
                            <input type="password" id="signup-confirm-password" required placeholder="Re-enter your password" autocomplete="new-password" style="padding: 0.7rem 1rem; border: 1px solid #CBD5E1; border-radius: 10px; font-size: 0.92rem; color: #0F172A; background: #FFFFFF; outline: none; transition: border-color 0.15s;" />
                        </div>

                        <!-- Error Message Box -->
                        <div id="signup-error-msg" class="hidden" style="background: #FEF2F2; border: 1px solid #FCA5A5; color: #DC2626; padding: 0.65rem 0.85rem; border-radius: 8px; font-size: 0.84rem; font-weight: 500;"></div>

                        <!-- Submit Button -->
                        <button type="submit" id="btn-signup-submit" style="padding: 0.8rem; font-size: 0.95rem; font-weight: 700; border-radius: 10px; background: #2563EB; color: #FFFFFF; border: none; cursor: pointer; transition: background 0.15s; margin-top: 0.4rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);">
                            <span>Create Account</span>
                        </button>

                        <!-- Switch to Login Link -->
                        <div style="text-align: center; margin-top: 0.4rem; font-size: 0.88rem; color: #64748B;">
                            Already have an account? <a href="#/login" style="color: #2563EB; font-weight: 700; text-decoration: none;">Sign in</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    const form = document.getElementById("student-signup-form");
    const errorEl = document.getElementById("signup-error-msg");
    const submitBtn = document.getElementById("btn-signup-submit");

    form?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("signup-name").value.trim();
        const email = document.getElementById("signup-email").value.trim();
        const password = document.getElementById("signup-password").value;
        const confirmPassword = document.getElementById("signup-confirm-password").value;

        if (!name || !email || !password || !confirmPassword) {
            showError("Please fill out all fields.");
            return;
        }

        if (password !== confirmPassword) {
            showError("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            showError("Password must be at least 6 characters long.");
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="spinner" style="width:16px;height:16px;border-width:2px;display:inline-block;"></span> <span>Creating Account...</span>`;
        hideError();

        try {
            // 1. Create student account in backend API
            const res = await AuthAPI.register({ name, email, password });
            if (!res || !res.success || !res.user) {
                throw new Error(res?.error || "Registration failed.");
            }

            const studentProfile = res.user;

            // Optional client Firebase auth registration if available
            try {
                const auth = getAuth();
                const userCred = await createUserWithEmailAndPassword(auth, email, password);
                if (userCred?.user) {
                    await updateProfile(userCred.user, { displayName: name });
                }
            } catch (fbErr) {
                // Backend registration is authoritative
            }

            setCurrentUser(studentProfile);

            // Redirect directly to Home page
            window.location.hash = "#/student/home";

        } catch (err) {
            let msg = "Unable to create account. Please try again.";
            if (err.message && (err.message.includes("already exists") || err.message.includes("email-already-in-use"))) {
                msg = "An account with this email already exists.";
            } else if (err.message) {
                msg = err.message;
            }

            showError(msg);
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<span>Create Account</span>`;
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
