/**
 * Onboarding Wizard — CodeQuest Beginner Onboarding Flow
 * =======================================================
 * Step-by-step personalized onboarding for new programming students:
 * Step 1: Student Name
 * Step 2: Programming Experience Level
 * Step 3: Primary Learning Goal
 * Step 4: Preferred Learning Pace
 * Next: Redirects to /signup with prefilled details.
 */

import { animateStepTransition, animatePageEntrance } from "../../utils/animations.js";

export function renderOnboarding(container, onNavigate) {
    let currentStep = 1;
    const TOTAL_STEPS = 4;

    const onboardingData = {
        name: sessionStorage.getItem("cq_onboarding_name") || "",
        experience: "beginner",
        learningGoal: "coursework",
        learningPace: "steady",
    };

    function renderView() {
        container.innerHTML = `
            <div class="card onboarding-card" style="width: 100%; max-width: 580px; margin: 0 auto; padding: 2.5rem 2rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.07);">
                
                <!-- Progress Indicator -->
                <div style="margin-bottom: 2rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <span style="font-size: 0.75rem; font-weight: 700; color: #2563EB; text-transform: uppercase; letter-spacing: 0.05em;">
                            Step ${currentStep} of ${TOTAL_STEPS}
                        </span>
                        <span style="font-size: 0.8125rem; font-weight: 600; color: #64748B;">
                            ${Math.round((currentStep / TOTAL_STEPS) * 100)}% Completed
                        </span>
                    </div>
                    <div style="height: 6px; background: #E2E8F0; border-radius: 999px; overflow: hidden;">
                        <div style="height: 100%; width: ${(currentStep / TOTAL_STEPS) * 100}%; background: #2563EB; transition: width 250ms ease;"></div>
                    </div>
                </div>

                <!-- Step Content Container -->
                <div id="onboarding-step-body" style="min-height: 260px;">
                    ${getStepHtml(currentStep)}
                </div>

                <!-- Navigation Buttons -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 2rem; padding-top: 1.25rem; border-top: 1px solid #E2E8F0;">
                    ${currentStep > 1 ? `
                        <button type="button" class="btn btn-secondary" id="onb-prev-btn" style="padding: 0.6rem 1.25rem;">
                            <i class="fa-solid fa-arrow-left"></i> Back
                        </button>
                    ` : `<div></div>`}

                    <button type="button" class="btn btn-primary" id="onb-next-btn" style="padding: 0.65rem 1.5rem; font-weight: 700;">
                        ${currentStep === TOTAL_STEPS ? 'Create Account <i class="fa-solid fa-arrow-right" style="margin-left: 0.35rem;"></i>' : 'Continue <i class="fa-solid fa-arrow-right" style="margin-left: 0.35rem;"></i>'}
                    </button>
                </div>

            </div>
        `;

        // Apply animations
        const bodyEl = document.getElementById("onboarding-step-body");
        animateStepTransition(bodyEl, 1);

        attachStepListeners();
    }

    function getStepHtml(step) {
        if (step === 1) {
            return `
                <div>
                    <h2 style="font-size: 1.4rem; font-weight: 800; color: #0F172A; margin-bottom: 0.4rem;">
                        What should we call you?
                    </h2>
                    <p style="color: #64748B; font-size: 0.875rem; margin-bottom: 1.75rem;">
                        We'll use your name to personalize your learning dashboard and progress reports.
                    </p>

                    <div class="form-group">
                        <label class="form-label" for="onb-name-input">Your Full Name</label>
                        <input 
                            type="text" 
                            id="onb-name-input" 
                            class="input-field" 
                            placeholder="e.g. Alex Silva" 
                            value="${onboardingData.name}" 
                            style="font-size: 1rem; padding: 0.75rem 1rem;"
                            autofocus
                        />
                    </div>
                </div>
            `;
        }

        if (step === 2) {
            const options = [
                { id: "beginner", label: "Absolute Beginner", desc: "No prior coding experience. Ready to start from scratch." },
                { id: "some_experience", label: "Some Programming Experience", desc: "Familiar with basic logic in Python or C, now learning Java." },
                { id: "learning_java", label: "Studying Java Specifically", desc: "Taking an introductory university or school Java course." },
            ];

            return `
                <div>
                    <h2 style="font-size: 1.4rem; font-weight: 800; color: #0F172A; margin-bottom: 0.4rem;">
                        What is your programming background?
                    </h2>
                    <p style="color: #64748B; font-size: 0.875rem; margin-bottom: 1.5rem;">
                        This helps us adjust diagnostic questions and pace to your comfort level.
                    </p>

                    <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                        ${options.map((opt) => `
                            <label class="onb-option-card ${onboardingData.experience === opt.id ? 'selected' : ''}" data-value="${opt.id}" style="display: flex; align-items: flex-start; gap: 0.85rem; padding: 1rem; border: 1.5px solid ${onboardingData.experience === opt.id ? '#2563EB' : '#E2E8F0'}; background: ${onboardingData.experience === opt.id ? '#EFF6FF' : '#FFFFFF'}; border-radius: 10px; cursor: pointer; transition: all 150ms;">
                                <input type="radio" name="onb-exp" value="${opt.id}" ${onboardingData.experience === opt.id ? 'checked' : ''} style="margin-top: 0.25rem; accent-color: #2563EB;" />
                                <div>
                                    <strong style="font-size: 0.9375rem; color: #0F172A; display: block;">${opt.label}</strong>
                                    <span style="font-size: 0.8125rem; color: #64748B;">${opt.desc}</span>
                                </div>
                            </label>
                        `).join("")}
                    </div>
                </div>
            `;
        }

        if (step === 3) {
            const goals = [
                { id: "coursework", label: "Pass University / College Coursework", desc: "Master introductory exams, lab assignments, and tests." },
                { id: "mental_models", label: "Build Strong Programming Mental Models", desc: "Understand variables, memory, loops, and methods deeply." },
                { id: "projects", label: "Learn to Build Real Projects", desc: "Gain practical confidence to write Java applications." },
            ];

            return `
                <div>
                    <h2 style="font-size: 1.4rem; font-weight: 800; color: #0F172A; margin-bottom: 0.4rem;">
                        What is your primary learning goal?
                    </h2>
                    <p style="color: #64748B; font-size: 0.875rem; margin-bottom: 1.5rem;">
                        We will highlight practice exercises aligned with your primary focus.
                    </p>

                    <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                        ${goals.map((g) => `
                            <label class="onb-option-card ${onboardingData.learningGoal === g.id ? 'selected' : ''}" data-value="${g.id}" style="display: flex; align-items: flex-start; gap: 0.85rem; padding: 1rem; border: 1.5px solid ${onboardingData.learningGoal === g.id ? '#2563EB' : '#E2E8F0'}; background: ${onboardingData.learningGoal === g.id ? '#EFF6FF' : '#FFFFFF'}; border-radius: 10px; cursor: pointer; transition: all 150ms;">
                                <input type="radio" name="onb-goal" value="${g.id}" ${onboardingData.learningGoal === g.id ? 'checked' : ''} style="margin-top: 0.25rem; accent-color: #2563EB;" />
                                <div>
                                    <strong style="font-size: 0.9375rem; color: #0F172A; display: block;">${g.label}</strong>
                                    <span style="font-size: 0.8125rem; color: #64748B;">${g.desc}</span>
                                </div>
                            </label>
                        `).join("")}
                    </div>
                </div>
            `;
        }

        if (step === 4) {
            const paces = [
                { id: "casual", label: "Casual Pace", desc: "1–2 hours per week. Flexible learning around your schedule." },
                { id: "steady", label: "Steady Pace", desc: "3–5 hours per week. Recommended for consistent progression." },
                { id: "intensive", label: "Intensive Pace", desc: "5+ hours per week. Fast-track mastering Java fundamentals." },
            ];

            return `
                <div>
                    <h2 style="font-size: 1.4rem; font-weight: 800; color: #0F172A; margin-bottom: 0.4rem;">
                        What is your preferred learning pace?
                    </h2>
                    <p style="color: #64748B; font-size: 0.875rem; margin-bottom: 1.5rem;">
                        Set your weekly target to help us track your learning streaks and milestones.
                    </p>

                    <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                        ${paces.map((p) => `
                            <label class="onb-option-card ${onboardingData.learningPace === p.id ? 'selected' : ''}" data-value="${p.id}" style="display: flex; align-items: flex-start; gap: 0.85rem; padding: 1rem; border: 1.5px solid ${onboardingData.learningPace === p.id ? '#2563EB' : '#E2E8F0'}; background: ${onboardingData.learningPace === p.id ? '#EFF6FF' : '#FFFFFF'}; border-radius: 10px; cursor: pointer; transition: all 150ms;">
                                <input type="radio" name="onb-pace" value="${p.id}" ${onboardingData.learningPace === p.id ? 'checked' : ''} style="margin-top: 0.25rem; accent-color: #2563EB;" />
                                <div>
                                    <strong style="font-size: 0.9375rem; color: #0F172A; display: block;">${p.label}</strong>
                                    <span style="font-size: 0.8125rem; color: #64748B;">${p.desc}</span>
                                </div>
                            </label>
                        `).join("")}
                    </div>
                </div>
            `;
        }

        return "";
    }

    function attachStepListeners() {
        if (currentStep === 1) {
            const input = document.getElementById("onb-name-input");
            input?.addEventListener("input", (e) => {
                onboardingData.name = e.target.value.trim();
                sessionStorage.setItem("cq_onboarding_name", onboardingData.name);
            });
            input?.addEventListener("keydown", (e) => {
                if (e.key === "Enter") handleNext();
            });
        } else if (currentStep === 2) {
            container.querySelectorAll('input[name="onb-exp"]').forEach((radio) => {
                radio.addEventListener("change", (e) => {
                    onboardingData.experience = e.target.value;
                    renderView();
                });
            });
        } else if (currentStep === 3) {
            container.querySelectorAll('input[name="onb-goal"]').forEach((radio) => {
                radio.addEventListener("change", (e) => {
                    onboardingData.learningGoal = e.target.value;
                    renderView();
                });
            });
        } else if (currentStep === 4) {
            container.querySelectorAll('input[name="onb-pace"]').forEach((radio) => {
                radio.addEventListener("change", (e) => {
                    onboardingData.learningPace = e.target.value;
                    renderView();
                });
            });
        }

        document.getElementById("onb-prev-btn")?.addEventListener("click", () => {
            if (currentStep > 1) {
                currentStep--;
                renderView();
            }
        });

        document.getElementById("onb-next-btn")?.addEventListener("click", handleNext);
    }

    function handleNext() {
        if (currentStep === 1) {
            const nameInput = document.getElementById("onb-name-input")?.value?.trim();
            if (!nameInput) {
                alert("Please enter your name to continue.");
                return;
            }
            onboardingData.name = nameInput;
            sessionStorage.setItem("cq_onboarding_name", nameInput);
        }

        if (currentStep < TOTAL_STEPS) {
            currentStep++;
            renderView();
        } else {
            // Save preferences and navigate to account creation
            sessionStorage.setItem("cq_onboarding_data", JSON.stringify(onboardingData));
            if (onNavigate) onNavigate("/signup");
        }
    }

    renderView();
}
