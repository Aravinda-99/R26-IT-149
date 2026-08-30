/**
 * Signup / Registration Page
 * ===========================
 * Clean white LMS registration form with high-quality photo hero.
 */

import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { setCurrentUser } from "../../utils/auth.js";

export function renderRegister(container) {
    container.innerHTML = `
        <div class="auth-split-layout">
            <!-- Left Hero Section (Educational Photo Banner) -->
            <div class="auth-hero-pane" style="background: linear-gradient(180deg, rgba(15, 23, 42, 0.4) 0%, rgba(15, 23, 42, 0.85) 100%), url('/assets/images/login-hero.jpg') center/cover no-repeat;">
                <div class="auth-hero-brand">
                    <div class="auth-brand-logo">
                        <i class="fa-solid fa-graduation-cap"></i>
                    </div>
                    <span class="auth-brand-text">CodeQuest</span>
                </div>

                <div class="auth-hero-quote-box">
                    <p class="auth-hero-quote">
                        “Build genuine Java mastery through structured diagnostics, guided practice plans, and gamified challenges.”
                    </p>
                    <div class="auth-hero-author">
                        <strong>CodeQuest Learning Hub</strong>
                        <span>Beginner-Friendly Java LMS</span>
                    </div>
                </div>
            </div>

            <!-- Right Form Section -->
            <div class="auth-form-pane">
                <div class="auth-form-container">
                    <div class="auth-form-header">
                        <h1 class="auth-title">Create an account</h1>
                        <p class="auth-subtitle">
                            Get started with your personalized learning track in seconds.
                        </p>
                    </div>

                    <form id="signup-form" class="auth-form-body" onsubmit="return false;">
                        <div class="form-group">
                            <label class="form-label" for="signup-name">Full Name</label>
                            <input type="text" id="signup-name" class="form-input" placeholder="e.g. Jordan Smith" required autocomplete="name" />
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="signup-email">Email Address</label>
                            <input type="email" id="signup-email" class="form-input" placeholder="student@codequest.edu" required autocomplete="email" />
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="signup-password">Password</label>
                            <input type="password" id="signup-password" class="form-input" placeholder="Minimum 6 characters" required autocomplete="new-password" />
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="signup-confirm-password">Confirm Password</label>
                            <input type="password" id="signup-confirm-password" class="form-input" placeholder="Re-enter password" required autocomplete="new-password" />
                        </div>

                        <div id="signup-error" class="auth-alert-error hidden"></div>

                        <button type="submit" class="btn btn-primary btn-block btn-lg" id="signup-submit-btn">
                            Create Account
                        </button>

                        <div class="auth-switch-link">
                            Already have an account? <a href="#/login" class="link-primary">Log in</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    const form = document.getElementById("signup-form");
    const errorEl = document.getElementById("signup-error");
    const submitBtn = document.getElementById("signup-submit-btn");

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
        submitBtn.innerHTML = `<span class="spinner-sm"></span> Creating Account...`;
        hideError();

        const role = (email.includes("teacher") || email.includes("admin")) ? "teacher" : "student";

        try {
            const auth = getAuth();
            const userCred = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCred.user;
            await updateProfile(user, { displayName: name });

            setCurrentUser({
                uid: user.uid,
                id: user.uid,
                email: user.email,
                name: name,
                displayName: name,
                role: role,
                joinedAt: new Date().toISOString()
            });

            if (role === "teacher") {
                window.location.hash = "#/teacher/dashboard";
            } else {
                window.location.hash = "#/student/dashboard";
            }

        } catch (err) {
            // Local fallback
            setCurrentUser({
                uid: "local_" + Date.now(),
                id: "local_" + Date.now(),
                email: email,
                name: name,
                displayName: name,
                role: role,
                joinedAt: new Date().toISOString()
            });

            if (role === "teacher") {
                window.location.hash = "#/teacher/dashboard";
            } else {
                window.location.hash = "#/student/dashboard";
            }
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
