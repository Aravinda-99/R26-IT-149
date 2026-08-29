/**
 * Login Page
 * ==========
 * Custom login against Firestore 'users' collection or Firebase Auth.
 */

export function renderLogin(container, onNavigate) {
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
                    background: var(--accent-blue);
                    top: -100px; right: -100px;
                    border-radius: 50%;
                }
                .blob-2 {
                    width: 400px; height: 400px;
                    background: var(--accent-purple);
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
                    color: var(--text-secondary);
                    transition: color 0.3s ease;
                }
                .premium-input {
                    width: 100%;
                    padding: 1rem 1rem 1rem 3rem;
                    background: rgba(15, 23, 36, 0.6);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    color: var(--text-primary);
                    font-size: 0.95rem;
                    outline: none;
                    transition: all 0.3s ease;
                    font-family: var(--font);
                }
                .premium-input:focus {
                    border-color: var(--accent-blue);
                    background: rgba(15, 23, 36, 0.8);
                    box-shadow: 0 0 0 4px rgba(74, 144, 226, 0.15);
                }
                .premium-input:focus + i {
                    color: var(--accent-blue);
                }
                .premium-btn {
                    width: 100%;
                    padding: 1rem;
                    background: linear-gradient(135deg, var(--accent-blue), #3b82f6);
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
                    box-shadow: 0 8px 16px rgba(74, 144, 226, 0.3);
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
                    <div style="font-size: 3rem; color: var(--accent-blue); margin-bottom: 1rem; animation: pulseGlow 2s infinite; border-radius: 50%; display: inline-block;">
                        <i class="fas fa-cube"></i>
                    </div>
                    <h1 class="form-title">CodeQuest</h1>
                    <p style="color: var(--text-secondary); font-size: 0.95rem;">Unlock your programming potential</p>
                </div>

                <div>
                    <div class="premium-input-wrap">
                        <input type="email" id="login-email" class="premium-input" placeholder="Email Address" />
                        <i class="fas fa-envelope"></i>
                    </div>
                    
                    <div class="premium-input-wrap">
                        <input type="password" id="login-password" class="premium-input" placeholder="Password" />
                        <i class="fas fa-lock"></i>
                    </div>
                    
                    <div id="login-error" style="color: #ef4444; font-size: 0.85rem; padding: 0.5rem; background: rgba(239, 68, 68, 0.1); border-radius: 8px; margin-bottom: 1rem; display: none; text-align: center; border: 1px solid rgba(239, 68, 68, 0.2);">
                    </div>

                    <button class="premium-btn" id="login-btn">
                        <span>Sign In</span>
                    </button>
                    
                    <p style="text-align: center; margin-top: 1.5rem; font-size: 0.9rem; color: var(--text-secondary);">
                        Don't have an account? 
                        <a href="#" id="go-register" style="color: var(--accent-purple); text-decoration: none; font-weight: 600; margin-left: 0.3rem;">Create one</a>
                    </p>
                    <p style="text-align: center; margin-top: 0.75rem; font-size: 0.85rem;">
                        <a href="#" id="go-landing" style="color: var(--text-secondary); text-decoration: none;">← Back to home</a>
                    </p>
                </div>
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
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
        errorEl.style.display = "none";

        try {
            // Using custom backend login for the users DB
            const response = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Invalid login credentials");
            }

            // Save the user data returned by backend to use globally
            localStorage.setItem("codequest_user", JSON.stringify(data.user));
            // Trigger a custom event to notify auth.js or other components
            window.dispatchEvent(new Event("custom_auth_change"));
            
            if (onNavigate) onNavigate("dashboard");
        } catch (e) {
            errorEl.innerHTML = '<i class="fas fa-exclamation-circle" style="margin-right:0.4rem;"></i> ' + e.message;
            errorEl.style.display = "block";
            btn.disabled = false;
            btn.innerHTML = '<span>Sign In</span>';
        }
    });

    const regLink = document.getElementById("go-register");
    if (regLink && onNavigate) {
        regLink.addEventListener("click", (e) => {
            e.preventDefault();
            onNavigate("register");
        });
    }

    const homeLink = document.getElementById("go-landing");
    if (homeLink && onNavigate) {
        homeLink.addEventListener("click", (e) => {
            e.preventDefault();
            onNavigate("landing");
        });
    }
}
