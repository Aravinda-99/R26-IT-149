/**
 * Login Page
 * ==========
 * Firebase email/password authentication.
 */

import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

export function renderLogin(container, onNavigate) {
    container.innerHTML = `
        <div style="max-width: 400px; margin: 4rem auto; text-align: center;">
            <h1 style="margin-bottom: 0.5rem;">Welcome to CodeQuest</h1>
            <p style="color: var(--text-secondary); margin-bottom: 2rem;">Sign in to continue your learning journey</p>

            <div class="card" style="text-align: left;">
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.4rem;">Email</label>
                    <input type="email" id="login-email" class="input-field" placeholder="you@example.com" />
                </div>
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.4rem;">Password</label>
                    <input type="password" id="login-password" class="input-field" placeholder="Your password" />
                </div>
                <div id="login-error" style="color: var(--accent-orange); font-size: 0.85rem; margin-bottom: 1rem; display: none;"></div>
                <button class="btn btn-primary" id="login-btn" style="width: 100%;">Sign In</button>
                <p style="text-align: center; margin-top: 1rem; font-size: 0.85rem; color: var(--text-secondary);">
                    Don't have an account? <a href="#" id="go-register" style="color: var(--accent-blue);">Register</a>
                </p>
            </div>
        </div>
    `;

    document.getElementById("login-btn").addEventListener("click", async () => {
        const email = document.getElementById("login-email").value.trim();
        const password = document.getElementById("login-password").value;
        const errorEl = document.getElementById("login-error");
        const btn = document.getElementById("login-btn");

        if (!email || !password) {
            errorEl.textContent = "Please fill in all fields";
            errorEl.style.display = "block";
            return;
        }

        btn.disabled = true;
        btn.textContent = "Signing in...";
        errorEl.style.display = "none";

        try {
            const auth = getAuth();
            await signInWithEmailAndPassword(auth, email, password);
            if (onNavigate) onNavigate("dashboard");
        } catch (e) {
            errorEl.textContent = e.message.replace("Firebase: ", "");
            errorEl.style.display = "block";
            btn.disabled = false;
            btn.textContent = "Sign In";
        }
    });

    const regLink = document.getElementById("go-register");
    if (regLink && onNavigate) {
        regLink.addEventListener("click", (e) => {
            e.preventDefault();
            onNavigate("register");
        });
    }
}
