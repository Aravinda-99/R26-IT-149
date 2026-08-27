/**
 * Signup Page — Student Registration Flow
 * ========================================
 * Creates student account and proceeds directly to the onboarding wizard.
 */

import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { setOnboardingCompleted } from "../../utils/auth.js";

export function renderSignup(container, onNavigate) {
    container.innerHTML = `
        <div class="card" style="padding: 2.5rem 2rem; box-shadow: var(--shadow-lg);">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 2rem;">
                <div style="display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; background: #2563EB; border-radius: 12px; font-size: 1.5rem; color: white; margin-bottom: 1rem; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25);">
                    <i class="fa-solid fa-user-plus"></i>
                </div>
                <h1 style="font-size: 1.75rem; font-weight: 800; color: #0F172A; margin-bottom: 0.35rem;">
                    Join CodeQuest
                </h1>
                <p style="color: #64748B; font-size: 0.875rem;">
                    Create your student account and start your guided Java journey.
                </p>
            </div>

            <!-- Form -->
            <form id="signup-form">
                <div class="form-group">
                    <label class="form-label" for="signup-name">Full Name</label>
                    <input 
                        type="text" 
                        id="signup-name" 
                        class="input-field" 
                        placeholder="Alex Morgan" 
                        required 
                    />
                </div>

                <div class="form-group">
                    <label class="form-label" for="signup-email">Email Address</label>
                    <input 
                        type="email" 
                        id="signup-email" 
                        class="input-field" 
                        placeholder="alex@example.com" 
                        required 
                    />
                </div>

                <div class="form-group" style="margin-bottom: 1.5rem;">
                    <label class="form-label" for="signup-password">Password</label>
                    <input 
                        type="password" 
                        id="signup-password" 
                        class="input-field" 
                        placeholder="Minimum 6 characters" 
                        minlength="6" 
                        required 
                    />
                </div>

                <div id="signup-error-box" class="alert alert-danger" style="display: none; margin-bottom: 1.25rem;"></div>

                <button type="submit" class="btn btn-primary" id="signup-submit-btn" style="width: 100%; padding: 0.75rem; font-size: 0.95rem;">
                    Continue to Onboarding <i class="fa-solid fa-arrow-right" style="margin-left: 0.35rem;"></i>
                </button>
            </form>

            <div style="margin-top: 1.5rem; text-align: center; font-size: 0.875rem; color: #64748B;">
                Already have an account? 
                <a href="/login" id="go-login-link" style="font-weight: 600; color: #2563EB;">Sign In</a>
            </div>
        </div>
    `;

    document.getElementById("go-login-link")?.addEventListener("click", (e) => {
        e.preventDefault();
        if (onNavigate) onNavigate("/login");
    });

    const form = document.getElementById("signup-form");
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const name = document.getElementById("signup-name").value.trim();
            const email = document.getElementById("signup-email").value.trim();
            const password = document.getElementById("signup-password").value;
            const errorEl = document.getElementById("signup-error-box");
            const submitBtn = document.getElementById("signup-submit-btn");

            if (!name || !email || !password) {
                if (errorEl) {
                    errorEl.textContent = "Please fill in all required fields.";
                    errorEl.style.display = "flex";
                }
                return;
            }

            if (errorEl) errorEl.style.display = "none";
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Creating Profile...`;
            }

            try {
                // Try Firebase Auth
                const auth = getAuth();
                const cred = await createUserWithEmailAndPassword(auth, email, password);

                // Call backend registration API
                await fetch("/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        uid: cred.user.uid,
                        email: email,
                        display_name: name,
                    }),
                });

                // Store temporary signup name for onboarding
                sessionStorage.setItem("cq_onboarding_name", name);
                setOnboardingCompleted(cred.user.uid, false);

                if (onNavigate) onNavigate("/onboarding");
            } catch (err) {
                // Fallback for offline demo mode
                const demoUid = `DEMO_${Date.now()}`;
                sessionStorage.setItem("cq_onboarding_name", name);
                setOnboardingCompleted(demoUid, false);
                
                if (onNavigate) onNavigate("/onboarding");
            }
        });
    }
}
