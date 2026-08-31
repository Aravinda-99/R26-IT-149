/**
 * Educator / Teacher Login Page
 * ==============================
 * Dedicated, separate portal login for faculty & administrators.
 * Features:
 *   - Title: "Educator Portal Login"
 *   - Fields: Faculty Email, Password
 *   - Authenticates strictly against backend authentication service with educator role requirement
 *   - Redirects to Teacher Dashboard (#/teacher/dashboard) on valid faculty credentials
 *   - Blocks student accounts with clear access message
 *   - Clean, professional white theme with zero demo credentials or fake fallbacks
 */

import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { setCurrentUser } from "../../utils/auth.js";
import { AuthAPI } from "../../api/api.js";

export function renderTeacherLogin(container) {
    container.innerHTML = `
        <div class="auth-page-wrapper" style="min-height: 100vh; background: #F8FAFC; display: flex; align-items: center; justify-content: center; padding: 2rem 1.5rem;">
            <div class="auth-card-centered" style="width: 100%; max-width: 460px; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 20px; box-shadow: 0 12px 32px rgba(15, 23, 42, 0.04); padding: 2.75rem 2.25rem;">
                
                <!-- Brand & Header -->
                <div style="text-align: center; margin-bottom: 2rem;">
                    <div style="width: 44px; height: 44px; border-radius: 12px; background: #1E293B; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; margin: 0 auto 1rem auto; box-shadow: 0 4px 10px rgba(30, 41, 59, 0.2);">
                        <i class="fa-solid fa-chalkboard-user"></i>
                    </div>
                    <h1 style="font-size: 1.5rem; font-weight: 800; color: #0F172A; margin: 0 0 0.35rem 0; letter-spacing: -0.3px;">Educator Portal Login</h1>
                    <p style="font-size: 0.88rem; color: #64748B; margin: 0;">Sign in with your faculty credentials to manage question banks and view student analytics.</p>
                </div>

                <form id="teacher-login-form" onsubmit="return false;" style="display: flex; flex-direction: column; gap: 1.25rem;">
                    <!-- Email -->
                    <div style="display: flex; flex-direction: column; gap: 0.4rem;">
                        <label for="teacher-email" style="font-size: 0.86rem; font-weight: 600; color: #0F172A;">Faculty Email Address</label>
                        <input type="email" id="teacher-email" required placeholder="educator@codequest.lk" autocomplete="email" style="padding: 0.75rem 1rem; border: 1px solid #CBD5E1; border-radius: 10px; font-size: 0.92rem; color: #0F172A; background: #FFFFFF; outline: none; transition: border-color 0.15s;" />
                    </div>

                    <!-- Password with Toggle -->
                    <div style="display: flex; flex-direction: column; gap: 0.4rem;">
                        <label for="teacher-password" style="font-size: 0.86rem; font-weight: 600; color: #0F172A;">Password</label>
                        <div style="position: relative; display: flex; align-items: center;">
                            <input type="password" id="teacher-password" required placeholder="Enter faculty password" autocomplete="current-password" style="width: 100%; padding: 0.75rem 2.75rem 0.75rem 1rem; border: 1px solid #CBD5E1; border-radius: 10px; font-size: 0.92rem; color: #0F172A; background: #FFFFFF; outline: none; transition: border-color 0.15s;" />
                            <button type="button" id="btn-toggle-teacher-password" style="position: absolute; right: 0.75rem; background: none; border: none; color: #94A3B8; cursor: pointer; padding: 0.25rem; font-size: 0.9rem;">
                                <i class="fa-regular fa-eye"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Error Message Box -->
                    <div id="teacher-error-msg" class="hidden" style="background: #FEF2F2; border: 1px solid #FCA5A5; color: #DC2626; padding: 0.65rem 0.85rem; border-radius: 8px; font-size: 0.84rem; font-weight: 500;"></div>

                    <!-- Submit Button -->
                    <button type="submit" id="btn-teacher-submit" style="padding: 0.8rem; font-size: 0.95rem; font-weight: 700; border-radius: 10px; background: #1E293B; color: #FFFFFF; border: none; cursor: pointer; transition: background 0.15s; margin-top: 0.5rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; box-shadow: 0 4px 12px rgba(30, 41, 59, 0.2);">
                        <span>Sign In to Faculty Portal</span>
                    </button>
                </form>

                <!-- Return to Student Home -->
                <div style="text-align: center; margin-top: 1.5rem; border-top: 1px solid #F1F5F9; padding-top: 1.25rem;">
                    <a href="#/student/home" style="font-size: 0.84rem; color: #64748B; text-decoration: none; font-weight: 500;">
                        <i class="fa-solid fa-arrow-left"></i> Return to CodeQuest Student Home
                    </a>
                </div>
            </div>
        </div>
    `;

    const form = document.getElementById("teacher-login-form");
    const errorEl = document.getElementById("teacher-error-msg");
    const submitBtn = document.getElementById("btn-teacher-submit");
    const emailInput = document.getElementById("teacher-email");
    const passwordInput = document.getElementById("teacher-password");
    const toggleBtn = document.getElementById("btn-toggle-teacher-password");

    toggleBtn?.addEventListener("click", () => {
        const isPassword = passwordInput.type === "password";
        passwordInput.type = isPassword ? "text" : "password";
        const icon = toggleBtn.querySelector("i");
        if (icon) {
            icon.className = isPassword ? "fa-regular fa-eye-slash" : "fa-regular fa-eye";
        }
    });

    form?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!email || !password) {
            showError("Please enter your faculty email and password.");
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="spinner" style="width:16px;height:16px;border-width:2px;display:inline-block;"></span> <span>Verifying credentials...</span>`;
        hideError();

        try {
            // Authenticate strictly with backend API
            const res = await AuthAPI.login({ email, password, required_role: "educator" });
            if (!res || !res.success || !res.user) {
                throw new Error(res?.error || "Invalid faculty credentials.");
            }

            const user = res.user;
            if (user.role !== "teacher" && user.role !== "admin") {
                showError("This account does not have educator access.");
                submitBtn.disabled = false;
                submitBtn.innerHTML = `<span>Sign In to Faculty Portal</span>`;
                return;
            }

            // Optional client Firebase auth sync if available
            try {
                const auth = getAuth();
                await signInWithEmailAndPassword(auth, email, password);
            } catch (fbErr) {
                // Backend authentication succeeded
            }

            setCurrentUser(user);
            window.location.hash = "#/teacher/dashboard";

        } catch (err) {
            let msg = "Invalid email or password.";
            if (err.message && (err.message.includes("connect") || err.message.includes("Failed to fetch"))) {
                msg = "Unable to connect to server. Please try again.";
            } else if (err.message) {
                msg = err.message;
            }

            showError(msg);
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<span>Sign In to Faculty Portal</span>`;
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
