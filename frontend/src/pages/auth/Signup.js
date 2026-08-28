/**
 * Signup / Register Page — CodeQuest Student Account Creation
 * ==========================================================
 * Connects directly to the real backend database registration endpoint.
 * Hashes passwords on server, enforces student role, and verifies uniqueness.
 */

import { animatePageEntrance } from "../../utils/animations.js";
import { persistAuthState, setOnboardingCompleted } from "../../utils/auth.js";
import { AuthAPI } from "../../api/api.js";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

export function renderSignup(container, onNavigate) {
    let onboardingData = {};
    try {
        const stored = sessionStorage.getItem("cq_onboarding_data");
        if (stored) onboardingData = JSON.parse(stored);
    } catch {}

    const initialName = onboardingData.name || sessionStorage.getItem("cq_onboarding_name") || "";

    container.innerHTML = `
        <div class="card signup-card" style="width: 100%; max-width: 480px; margin: 0 auto; padding: 2.5rem 2rem; border-radius: var(--radius-md); box-shadow: var(--shadow-md);">
            
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 2rem;">
                <div style="display: inline-flex; align-items: center; justify-content: center; width: 52px; height: 52px; background: var(--primary-soft); color: var(--primary); border-radius: var(--radius-sm); font-size: 1.4rem; margin-bottom: 1rem;">
                    <i class="fa-solid fa-user-plus"></i>
                </div>
                <h1 style="font-size: 1.65rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.35rem;">
                    Create Your Account
                </h1>
                <p style="color: var(--text-muted); font-size: 0.875rem;">
                    Save your progress and access your personalized learning roadmap.
                </p>
            </div>

            <!-- Form -->
            <form id="signup-form" novalidate>
                
                <!-- Full Name -->
                <div class="form-group" style="margin-bottom: 1.15rem;">
                    <label class="form-label" for="signup-name">Full Name</label>
                    <input 
                        type="text" 
                        id="signup-name" 
                        class="form-input" 
                        placeholder="Alex Silva" 
                        value="${initialName}" 
                        autocomplete="name"
                        required 
                    />
                    <div id="err-signup-name" style="font-size: 0.75rem; color: var(--status-error); margin-top: 0.25rem; display: none;"></div>
                </div>

                <!-- Email Address -->
                <div class="form-group" style="margin-bottom: 1.15rem;">
                    <label class="form-label" for="signup-email">Email Address</label>
                    <input 
                        type="email" 
                        id="signup-email" 
                        class="form-input" 
                        placeholder="alex@example.com" 
                        autocomplete="email"
                        required 
                    />
                    <div id="err-signup-email" style="font-size: 0.75rem; color: var(--status-error); margin-top: 0.25rem; display: none;"></div>
                </div>

                <!-- Create Password -->
                <div class="form-group" style="margin-bottom: 1.15rem;">
                    <label class="form-label" for="signup-password">Password</label>
                    <div style="position: relative; display: flex; align-items: center;">
                        <input 
                            type="password" 
                            id="signup-password" 
                            class="form-input" 
                            placeholder="At least 6 characters" 
                            autocomplete="new-password"
                            required 
                            minlength="6" 
                            style="padding-right: 2.5rem;"
                        />
                        <button type="button" id="toggle-pass-btn" class="btn btn-subtle btn-sm" style="position: absolute; right: 4px; padding: 0.3rem 0.5rem; color: var(--text-muted);" title="Show/Hide Password">
                            <i class="fa-solid fa-eye" id="pass-eye-icon"></i>
                        </button>
                    </div>
                    <div id="err-signup-password" style="font-size: 0.75rem; color: var(--status-error); margin-top: 0.25rem; display: none;"></div>
                </div>

                <!-- Confirm Password -->
                <div class="form-group" style="margin-bottom: 1.5rem;">
                    <label class="form-label" for="signup-confirm-password">Confirm Password</label>
                    <div style="position: relative; display: flex; align-items: center;">
                        <input 
                            type="password" 
                            id="signup-confirm-password" 
                            class="form-input" 
                            placeholder="Re-enter your password" 
                            autocomplete="new-password"
                            required 
                            minlength="6" 
                            style="padding-right: 2.5rem;"
                        />
                        <button type="button" id="toggle-confirm-btn" class="btn btn-subtle btn-sm" style="position: absolute; right: 4px; padding: 0.3rem 0.5rem; color: var(--text-muted);" title="Show/Hide Password">
                            <i class="fa-solid fa-eye" id="confirm-eye-icon"></i>
                        </button>
                    </div>
                    <div id="err-signup-confirm" style="font-size: 0.75rem; color: var(--status-error); margin-top: 0.25rem; display: none;"></div>
                </div>

                <!-- General Error Banner -->
                <div id="signup-error-box" class="badge badge-danger" style="display: none; width: 100%; padding: 0.75rem 1rem; border-radius: var(--radius-sm); font-size: 0.8125rem; margin-bottom: 1.25rem; justify-content: flex-start; text-align: left; line-height: 1.4;">
                    <i class="fa-solid fa-circle-exclamation" style="margin-right: 0.4rem; flex-shrink: 0;"></i>
                    <span id="signup-error-msg"></span>
                </div>

                <!-- Submit Button -->
                <button type="submit" class="btn btn-primary" id="signup-submit-btn" style="width: 100%; padding: 0.75rem; font-size: 0.95rem; font-weight: 700;">
                    Create Account & Go to Dashboard <i class="fa-solid fa-arrow-right" style="margin-left: 0.35rem;"></i>
                </button>
            </form>

            <!-- Terms Notice -->
            <div style="font-size: 0.75rem; color: var(--text-muted); text-align: center; margin-top: 1.25rem; line-height: 1.4;">
                By registering, you agree to CodeQuest's educational terms of use.
            </div>

            <!-- Login Link -->
            <div style="margin-top: 1.5rem; text-align: center; font-size: 0.875rem; color: var(--text-muted); border-top: 1px solid var(--border-main); padding-top: 1.25rem;">
                Already have an account? 
                <a href="/login" id="signup-to-login" style="color: var(--primary); font-weight: 600; text-decoration: none;">Sign in here</a>
            </div>

        </div>
    `;

    animatePageEntrance(container.querySelector(".signup-card"));

    // Form elements
    const form = document.getElementById("signup-form");
    const nameInput = document.getElementById("signup-name");
    const emailInput = document.getElementById("signup-email");
    const passInput = document.getElementById("signup-password");
    const confirmInput = document.getElementById("signup-confirm-password");
    
    const errorBox = document.getElementById("signup-error-box");
    const errorMsg = document.getElementById("signup-error-msg");
    const submitBtn = document.getElementById("signup-submit-btn");

    // Password Toggle Listeners
    document.getElementById("toggle-pass-btn")?.addEventListener("click", () => {
        const isPass = passInput.type === "password";
        passInput.type = isPass ? "text" : "password";
        const icon = document.getElementById("pass-eye-icon");
        if (icon) icon.className = isPass ? "fa-solid fa-eye-slash" : "fa-solid fa-eye";
    });

    document.getElementById("toggle-confirm-btn")?.addEventListener("click", () => {
        const isPass = confirmInput.type === "password";
        confirmInput.type = isPass ? "text" : "password";
        const icon = document.getElementById("confirm-eye-icon");
        if (icon) icon.className = isPass ? "fa-solid fa-eye-slash" : "fa-solid fa-eye";
    });

    function showFieldError(fieldId, msg) {
        const errEl = document.getElementById(`err-${fieldId}`);
        if (errEl) {
            errEl.innerText = msg;
            errEl.style.display = "block";
        }
    }

    function clearFieldErrors() {
        ["signup-name", "signup-email", "signup-password", "signup-confirm"].forEach(id => {
            const errEl = document.getElementById(`err-${id}`);
            if (errEl) errEl.style.display = "none";
        });
        if (errorBox) errorBox.style.display = "none";
    }

    form?.addEventListener("submit", async (e) => {
        e.preventDefault();
        clearFieldErrors();

        const name = nameInput.value.trim();
        const email = emailInput.value.trim().toLowerCase();
        const pass = passInput.value;
        const confirmPass = confirmInput.value;

        // Client-side Validation
        let hasErrors = false;

        if (!name) {
            showFieldError("signup-name", "Please enter your full name.");
            hasErrors = true;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            showFieldError("signup-email", "Please enter a valid email address.");
            hasErrors = true;
        }

        if (!pass || pass.length < 6) {
            showFieldError("signup-password", "Password must be at least 6 characters long.");
            hasErrors = true;
        }

        if (pass !== confirmPass) {
            showFieldError("signup-confirm", "Passwords do not match. Please re-enter.");
            hasErrors = true;
        }

        if (hasErrors) return;

        // Prevent double submission
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="spinner" style="width: 16px; height: 16px; border-width: 2px; display: inline-block; vertical-align: middle; margin-right: 0.5rem;"></span> Creating account...`;

        try {
            // 1. Send registration request to real backend database API
            const payload = {
                name,
                email,
                password: pass,
                experience: onboardingData.experience || "beginner",
                learningGoal: onboardingData.learningGoal || "coursework",
                learningPace: onboardingData.learningPace || "steady",
            };

            const result = await AuthAPI.register(payload);

            if (result.success && result.user) {
                // Also create Firebase Auth account if available in browser
                try {
                    const auth = getAuth();
                    const userCred = await createUserWithEmailAndPassword(auth, email, pass);
                    await updateProfile(userCred.user, { displayName: name });
                } catch (fbErr) {
                    console.warn("[INFO] Client Firebase Auth sync:", fbErr.message);
                }

                // 2. Persist authenticated session
                persistAuthState(result.user, "student", result.token);
                setOnboardingCompleted(result.user.id || result.user.uid, true);

                // 3. Clear transient onboarding session data
                sessionStorage.removeItem("cq_onboarding_name");
                sessionStorage.removeItem("cq_onboarding_data");

                // 4. Redirect to student dashboard
                if (onNavigate) onNavigate("/student/dashboard");
            } else {
                throw new Error(result.error || "Registration failed. Please try again.");
            }

        } catch (err) {
            const msg = err.message || "Failed to create account. Please try again.";
            if (errorMsg) errorMsg.innerText = msg;
            if (errorBox) errorBox.style.display = "flex";

            submitBtn.disabled = false;
            submitBtn.innerHTML = `Create Account & Go to Dashboard <i class="fa-solid fa-arrow-right" style="margin-left: 0.35rem;"></i>`;
        }
    });

    document.getElementById("signup-to-login")?.addEventListener("click", (e) => {
        e.preventDefault();
        if (onNavigate) onNavigate("/login");
    });
}
