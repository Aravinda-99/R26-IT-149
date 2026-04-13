/**
 * Register Page
 * ==============
 * Firebase email/password registration with profile creation.
 */

import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

export function renderRegister(container, onNavigate) {
    container.innerHTML = `
        <div style="max-width: 400px; margin: 4rem auto; text-align: center;">
            <h1 style="margin-bottom: 0.5rem;">Create Account</h1>
            <p style="color: var(--text-secondary); margin-bottom: 2rem;">Join CodeQuest and start learning</p>

            <div class="card" style="text-align: left;">
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.4rem;">Display Name</label>
                    <input type="text" id="reg-name" class="input-field" placeholder="Your name" />
                </div>
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.4rem;">Email</label>
                    <input type="email" id="reg-email" class="input-field" placeholder="you@example.com" />
                </div>
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.4rem;">Password</label>
                    <input type="password" id="reg-password" class="input-field" placeholder="Min 6 characters" />
                </div>
                <div id="reg-error" style="color: var(--accent-orange); font-size: 0.85rem; margin-bottom: 1rem; display: none;"></div>
                <button class="btn btn-primary" id="reg-btn" style="width: 100%;">Create Account</button>
                <p style="text-align: center; margin-top: 1rem; font-size: 0.85rem; color: var(--text-secondary);">
                    Already have an account? <a href="#" id="go-login" style="color: var(--accent-blue);">Sign In</a>
                </p>
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
        btn.textContent = "Creating account...";
        errorEl.style.display = "none";

        try {
            const auth = getAuth();
            const cred = await createUserWithEmailAndPassword(auth, email, password);

            await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    uid: cred.user.uid,
                    email: email,
                    display_name: name,
                }),
            });

            if (onNavigate) onNavigate("dashboard");
        } catch (e) {
            errorEl.textContent = e.message.replace("Firebase: ", "");
            errorEl.style.display = "block";
            btn.disabled = false;
            btn.textContent = "Create Account";
        }
    });

    const loginLink = document.getElementById("go-login");
    if (loginLink && onNavigate) {
        loginLink.addEventListener("click", (e) => {
            e.preventDefault();
            onNavigate("login");
        });
    }
}
