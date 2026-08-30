/**
 * Public Welcome Landing Page & First-Time Onboarding
 * ====================================================
 * Modern white-theme introduction with a 3-step student onboarding wizard.
 */

import { renderPublicLayout } from "../../layouts/PublicLayout.js";
import { getCurrentUser, setCurrentUser } from "../../utils/auth.js";

export function renderWelcome(container) {
    const user = getCurrentUser();
    const ctaLink = user ? (user.role === "teacher" ? "#/teacher/dashboard" : "#/student/dashboard") : "#onboarding-wizard";
    const ctaText = user ? "Go to Dashboard" : "Start Student Onboarding";

    const contentHtml = `
        <div class="welcome-hero-section">
            <div class="welcome-hero-container">
                <span class="badge badge-primary welcome-pill">
                    <i class="fa-solid fa-code"></i> Beginner-Friendly Java LMS
                </span>
                
                <h1 class="welcome-hero-title">
                    Master Java Programming Through <span class="text-highlight">Interactive Practice</span>
                </h1>
                
                <p class="welcome-hero-desc">
                    CodeQuest connects diagnostic checks, intelligent error pattern insights, and gamified challenges into one seamless adaptive learning system.
                </p>

                <div class="welcome-cta-group">
                    <button class="btn btn-primary btn-lg" id="btn-start-onboarding">
                        <i class="fa-solid fa-user-plus"></i> ${user ? "Open My Dashboard" : "Start 3-Step Onboarding"}
                    </button>
                    <a href="#/login" class="btn btn-outline btn-lg">
                        <i class="fa-solid fa-arrow-right-to-bracket"></i> Sign In to Existing Account
                    </a>
                </div>

                <!-- Onboarding Wizard Card (Clean White Box) -->
                <div class="card onboarding-card" id="onboarding-wizard-card" style="max-width: 680px; margin: 0 auto 3rem auto; text-align: left; padding: 2rem;">
                    <div class="onboarding-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; border-bottom:1px solid var(--border-color); padding-bottom:1rem;">
                        <div>
                            <span class="badge badge-primary" style="margin-bottom:0.25rem;">Student Onboarding</span>
                            <h3 style="margin:0; font-size:1.25rem;" id="onboard-step-title">Step 1 of 3: Your Learning Goal</h3>
                        </div>
                        <div class="onboard-step-indicator" style="display:flex; gap:0.4rem;">
                            <span class="step-dot active" id="dot-1" style="width:10px; height:10px; border-radius:50%; background:var(--primary);"></span>
                            <span class="step-dot" id="dot-2" style="width:10px; height:10px; border-radius:50%; background:var(--border-color);"></span>
                            <span class="step-dot" id="dot-3" style="width:10px; height:10px; border-radius:50%; background:var(--border-color);"></span>
                        </div>
                    </div>

                    <!-- Step 1: Goal -->
                    <div id="onboard-step-1" class="onboard-step-pane">
                        <p style="color:var(--text-secondary); margin-bottom:1.25rem; font-size:0.9rem;">What is your primary focus for studying Java?</p>
                        <div style="display:grid; grid-template-columns:1fr; gap:0.75rem; margin-bottom:1.5rem;">
                            <label class="role-option active" style="padding:1rem;">
                                <input type="radio" name="onboard-goal" value="fundamentals" checked />
                                <i class="fa-solid fa-book-open" style="color:var(--primary);"></i>
                                <div>
                                    <strong style="display:block; font-size:0.9rem;">Java Foundations Track</strong>
                                    <span style="font-size:0.8rem; color:var(--text-secondary);">Variables, Operators, Control Flow, and Loops</span>
                                </div>
                            </label>
                            <label class="role-option" style="padding:1rem;">
                                <input type="radio" name="onboard-goal" value="arrays_methods" />
                                <i class="fa-solid fa-cubes" style="color:var(--secondary);"></i>
                                <div>
                                    <strong style="display:block; font-size:0.9rem;">Structured Programming</strong>
                                    <span style="font-size:0.8rem; color:var(--text-secondary);">Arrays, Zero-Based Indexing, and Method Signatures</span>
                                </div>
                            </label>
                        </div>
                        <button type="button" class="btn btn-primary" id="btn-onboard-next-1">
                            Continue to Experience Level <i class="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>

                    <!-- Step 2: Experience -->
                    <div id="onboard-step-2" class="onboard-step-pane hidden">
                        <p style="color:var(--text-secondary); margin-bottom:1.25rem; font-size:0.9rem;">How familiar are you with Java programming?</p>
                        <div style="display:grid; grid-template-columns:1fr; gap:0.75rem; margin-bottom:1.5rem;">
                            <label class="role-option active" style="padding:1rem;">
                                <input type="radio" name="onboard-exp" value="beginner" checked />
                                <i class="fa-solid fa-seedling" style="color:var(--success);"></i>
                                <div>
                                    <strong style="display:block; font-size:0.9rem;">Beginner / Novice</strong>
                                    <span style="font-size:0.8rem; color:var(--text-secondary);">I am new or just starting to learn Java programming</span>
                                </div>
                            </label>
                            <label class="role-option" style="padding:1rem;">
                                <input type="radio" name="onboard-exp" value="intermediate" />
                                <i class="fa-solid fa-graduation-cap" style="color:var(--primary);"></i>
                                <div>
                                    <strong style="display:block; font-size:0.9rem;">Some Experience</strong>
                                    <span style="font-size:0.8rem; color:var(--text-secondary);">I know basic syntax but want to eliminate common bugs and misconceptions</span>
                                </div>
                            </label>
                        </div>
                        <div style="display:flex; justify-content:space-between;">
                            <button type="button" class="btn btn-outline" id="btn-onboard-prev-2"><i class="fa-solid fa-arrow-left"></i> Back</button>
                            <button type="button" class="btn btn-primary" id="btn-onboard-next-2">Set Up Account <i class="fa-solid fa-arrow-right"></i></button>
                        </div>
                    </div>

                    <!-- Step 3: Account Credentials -->
                    <div id="onboard-step-3" class="onboard-step-pane hidden">
                        <p style="color:var(--text-secondary); margin-bottom:1.25rem; font-size:0.9rem;">Create your student credentials to save your progress.</p>
                        <form id="onboard-form" onsubmit="return false;">
                            <div class="form-group">
                                <label class="form-label" for="onboard-name">Your Full Name</label>
                                <div class="input-with-icon">
                                    <i class="fa-regular fa-user"></i>
                                    <input type="text" id="onboard-name" class="input-field" placeholder="e.g. Jordan Smith" required />
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="onboard-email">Email Address</label>
                                <div class="input-with-icon">
                                    <i class="fa-regular fa-envelope"></i>
                                    <input type="email" id="onboard-email" class="input-field" placeholder="learner@codequest.edu" required />
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="onboard-password">Create Password</label>
                                <div class="input-with-icon">
                                    <i class="fa-solid fa-lock"></i>
                                    <input type="password" id="onboard-password" class="input-field" placeholder="Minimum 6 characters" required />
                                </div>
                            </div>
                            <div id="onboard-error" class="form-error-alert hidden"></div>
                            <div style="display:flex; justify-content:space-between; margin-top:1.5rem;">
                                <button type="button" class="btn btn-outline" id="btn-onboard-prev-3"><i class="fa-solid fa-arrow-left"></i> Back</button>
                                <button type="submit" class="btn btn-primary" id="btn-onboard-submit">
                                    <i class="fa-solid fa-check"></i> Complete & Enter Dashboard
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Learning Journey Stepper Preview -->
                <div class="welcome-journey-preview card">
                    <h3 class="preview-title"><i class="fa-solid fa-route"></i> Your Structured 6-Step Learning Journey</h3>
                    <div class="journey-steps-grid">
                        <div class="journey-step-item">
                            <div class="step-num">1</div>
                            <h4>Pre-Test Check</h4>
                            <p>Identify knowledge gaps across Java concepts.</p>
                        </div>
                        <div class="journey-step-item">
                            <div class="step-num">2</div>
                            <h4>Error Feedback</h4>
                            <p>Understand why specific mistakes happen.</p>
                        </div>
                        <div class="journey-step-item">
                            <div class="step-num">3</div>
                            <h4>Practice Plan</h4>
                            <p>Targeted learning tailored to your pace.</p>
                        </div>
                        <div class="journey-step-item">
                            <div class="step-num">4</div>
                            <h4>Game Lessons</h4>
                            <p>Fix misconceptions through gamified practice.</p>
                        </div>
                        <div class="journey-step-item">
                            <div class="step-num">5</div>
                            <h4>Understanding Check</h4>
                            <p>Validate your mastery on fresh questions.</p>
                        </div>
                        <div class="journey-step-item">
                            <div class="step-num">6</div>
                            <h4>Verified Results</h4>
                            <p>Gain confidence and unlock advanced topics.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    renderPublicLayout(container, contentHtml, "/welcome");

    // Wire Start Onboarding / Dashboard button
    document.getElementById("btn-start-onboarding")?.addEventListener("click", () => {
        const u = getCurrentUser();
        if (u) {
            window.location.hash = u.role === "teacher" ? "#/teacher/dashboard" : "#/student/dashboard";
        } else {
            const el = document.getElementById("onboarding-wizard-card");
            if (el) el.scrollIntoView({ behavior: "smooth" });
        }
    });

    // Onboarding step navigation
    const step1 = document.getElementById("onboard-step-1");
    const step2 = document.getElementById("onboard-step-2");
    const step3 = document.getElementById("onboard-step-3");
    const title = document.getElementById("onboard-step-title");
    const dot1 = document.getElementById("dot-1");
    const dot2 = document.getElementById("dot-2");
    const dot3 = document.getElementById("dot-3");

    document.getElementById("btn-onboard-next-1")?.addEventListener("click", () => {
        step1.classList.add("hidden");
        step2.classList.remove("hidden");
        title.textContent = "Step 2 of 3: Experience Level";
        dot2.style.background = "var(--primary)";
    });

    document.getElementById("btn-onboard-prev-2")?.addEventListener("click", () => {
        step2.classList.add("hidden");
        step1.classList.remove("hidden");
        title.textContent = "Step 1 of 3: Your Learning Goal";
        dot2.style.background = "var(--border-color)";
    });

    document.getElementById("btn-onboard-next-2")?.addEventListener("click", () => {
        step2.classList.add("hidden");
        step3.classList.remove("hidden");
        title.textContent = "Step 3 of 3: Create Student Profile";
        dot3.style.background = "var(--primary)";
    });

    document.getElementById("btn-onboard-prev-3")?.addEventListener("click", () => {
        step3.classList.add("hidden");
        step2.classList.remove("hidden");
        title.textContent = "Step 2 of 3: Experience Level";
        dot3.style.background = "var(--border-color)";
    });

    // Form submission
    const form = document.getElementById("onboard-form");
    const errorEl = document.getElementById("onboard-error");
    const submitBtn = document.getElementById("btn-onboard-submit");

    form?.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("onboard-name").value.trim();
        const email = document.getElementById("onboard-email").value.trim();
        const password = document.getElementById("onboard-password").value;

        if (!name || !email || !password) {
            errorEl.textContent = "Please fill in all fields.";
            errorEl.classList.remove("hidden");
            return;
        }

        if (password.length < 6) {
            errorEl.textContent = "Password must be at least 6 characters.";
            errorEl.classList.remove("hidden");
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = `<div class="spinner-sm"></div> Creating Profile...`;

        // Store student state
        const studentUser = {
            uid: "stu_" + Date.now(),
            id: "stu_" + Date.now(),
            name: name,
            displayName: name,
            email: email,
            role: "student",
            enrolledTrack: "Java Foundations",
            currentConcept: "Variables",
            joinedAt: new Date().toISOString()
        };

        setCurrentUser(studentUser);
        window.location.hash = "#/student/dashboard";
    });
}
