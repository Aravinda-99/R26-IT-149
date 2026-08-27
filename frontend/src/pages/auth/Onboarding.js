/**
 * Onboarding Wizard — CodeQuest Beginner Onboarding
 * ==================================================
 * 4-step survey to personalize the student's learning experience.
 */

import { setOnboardingCompleted } from "../../utils/auth.js";

export function renderOnboarding(container, onNavigate) {
    let currentStep = 1;
    const studentName = sessionStorage.getItem("cq_onboarding_name") || "Learner";

    const answers = {
        experience: "beginner",
        learningStyle: "interactive",
        weeklyGoal: "3_5_hours",
        interest: "coursework",
    };

    function renderStep() {
        container.innerHTML = `
            <div class="card" style="padding: 2.5rem 2rem; box-shadow: var(--shadow-lg);">
                <!-- Progress Stepper Header -->
                <div style="margin-bottom: 2rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                        <span style="font-size: 0.75rem; font-weight: 700; color: #2563EB; text-transform: uppercase; letter-spacing: 0.05em;">
                            Step ${currentStep} of 4
                        </span>
                        <span style="font-size: 0.8125rem; font-weight: 600; color: #64748B;">
                            ${Math.round((currentStep / 4) * 100)}% Completed
                        </span>
                    </div>
                    <div style="height: 6px; background: #E2E8F0; border-radius: 999px; overflow: hidden;">
                        <div style="height: 100%; width: ${(currentStep / 4) * 100}%; background: #2563EB; transition: width 200ms ease;"></div>
                    </div>
                </div>

                <!-- Step Content -->
                <div id="onboarding-step-body">
                    ${getStepHtml(currentStep)}
                </div>

                <!-- Navigation Controls -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 2.5rem; padding-top: 1.25rem; border-top: 1px solid #E2E8F0;">
                    ${currentStep > 1 ? `
                        <button type="button" class="btn btn-secondary" id="onb-prev-btn">
                            <i class="fa-solid fa-arrow-left"></i> Back
                        </button>
                    ` : `<div></div>`}

                    <button type="button" class="btn btn-primary" id="onb-next-btn" style="padding: 0.65rem 1.5rem;">
                        ${currentStep === 4 ? 'Complete & Start Learning <i class="fa-solid fa-check" style="margin-left: 0.35rem;"></i>' : 'Continue <i class="fa-solid fa-arrow-right" style="margin-left: 0.35rem;"></i>'}
                    </button>
                </div>
            </div>
        `;

        // Attach listeners
        attachStepListeners();
    }

    function getStepHtml(step) {
        if (step === 1) {
            return `
                <div style="text-align: center;">
                    <div style="width: 64px; height: 64px; background: #DBEAFE; color: #2563EB; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 1.75rem; margin-bottom: 1.25rem;">
                        <i class="fa-solid fa-hand-wave"></i>
                    </div>
                    <h2 style="font-size: 1.5rem; font-weight: 800; color: #0F172A; margin-bottom: 0.5rem;">
                        Welcome to CodeQuest, ${studentName}!
                    </h2>
                    <p style="color: #64748B; font-size: 0.9375rem; line-height: 1.6; margin-bottom: 1.75rem;">
                        CodeQuest is an adaptive learning system designed to help you build solid mental models (schemas) for Java programming through interactive lessons, diagnostic quizzes, and targeted remediation.
                    </p>
                    <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 1.25rem; text-align: left; display: flex; flex-direction: column; gap: 0.75rem;">
                        <div style="display: flex; align-items: center; gap: 0.6rem; font-size: 0.875rem; color: #334155;">
                            <i class="fa-solid fa-check-circle" style="color: #16A34A;"></i> Guided step-by-step topic roadmap
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.6rem; font-size: 0.875rem; color: #334155;">
                            <i class="fa-solid fa-check-circle" style="color: #16A34A;"></i> AI-assisted error pattern recognition
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.6rem; font-size: 0.875rem; color: #16A34A;">
                            <i class="fa-solid fa-check-circle" style="color: #16A34A;"></i> Rigorous ML schema mastery validation
                        </div>
                    </div>
                </div>
            `;
        }

        if (step === 2) {
            return `
                <div>
                    <h2 style="font-size: 1.35rem; font-weight: 800; color: #0F172A; margin-bottom: 0.35rem;">
                        What is your programming experience?
                    </h2>
                    <p style="color: #64748B; font-size: 0.875rem; margin-bottom: 1.5rem;">
                        This helps us tailor foundational lessons and diagnostic questions to your comfort level.
                    </p>

                    <div style="display: flex; flex-direction: column; gap: 0.75rem;" id="experience-options">
                        <label style="display: flex; align-items: flex-start; gap: 0.75rem; padding: 1rem; border: 2px solid ${answers.experience === 'beginner' ? '#2563EB' : '#E2E8F0'}; background: ${answers.experience === 'beginner' ? '#EFF6FF' : '#FFFFFF'}; border-radius: 10px; cursor: pointer;">
                            <input type="radio" name="exp" value="beginner" ${answers.experience === 'beginner' ? 'checked' : ''} style="margin-top: 0.25rem;">
                            <div>
                                <strong style="display: block; font-size: 0.9375rem; color: #0F172A;">Complete Beginner</strong>
                                <span style="font-size: 0.8125rem; color: #64748B;">I am brand new to coding and have never written Java before.</span>
                            </div>
                        </label>

                        <label style="display: flex; align-items: flex-start; gap: 0.75rem; padding: 1rem; border: 2px solid ${answers.experience === 'basics' ? '#2563EB' : '#E2E8F0'}; background: ${answers.experience === 'basics' ? '#EFF6FF' : '#FFFFFF'}; border-radius: 10px; cursor: pointer;">
                            <input type="radio" name="exp" value="basics" ${answers.experience === 'basics' ? 'checked' : ''} style="margin-top: 0.25rem;">
                            <div>
                                <strong style="display: block; font-size: 0.9375rem; color: #0F172A;">Some Basic Knowledge</strong>
                                <span style="font-size: 0.8125rem; color: #64748B;">I know basic concepts (variables, print statements) but struggle with logic and loops.</span>
                            </div>
                        </label>

                        <label style="display: flex; align-items: flex-start; gap: 0.75rem; padding: 1rem; border: 2px solid ${answers.experience === 'intermediate' ? '#2563EB' : '#E2E8F0'}; background: ${answers.experience === 'intermediate' ? '#EFF6FF' : '#FFFFFF'}; border-radius: 10px; cursor: pointer;">
                            <input type="radio" name="exp" value="intermediate" ${answers.experience === 'intermediate' ? 'checked' : ''} style="margin-top: 0.25rem;">
                            <div>
                                <strong style="display: block; font-size: 0.9375rem; color: #0F172A;">Intermediate Learner</strong>
                                <span style="font-size: 0.8125rem; color: #64748B;">I have written code before and want to master arrays, methods, and error debugging.</span>
                            </div>
                        </label>
                    </div>
                </div>
            `;
        }

        if (step === 3) {
            return `
                <div>
                    <h2 style="font-size: 1.35rem; font-weight: 800; color: #0F172A; margin-bottom: 0.35rem;">
                        Learning Preferences & Goals
                    </h2>
                    <p style="color: #64748B; font-size: 0.875rem; margin-bottom: 1.5rem;">
                        Set your preferred learning pace and weekly time commitment.
                    </p>

                    <div class="form-group">
                        <label class="form-label">Preferred Learning Style</label>
                        <select class="select-field" id="onb-style-select">
                            <option value="interactive" ${answers.learningStyle === 'interactive' ? 'selected' : ''}>Interactive Game Challenges & Puzzles</option>
                            <option value="conceptual" ${answers.learningStyle === 'conceptual' ? 'selected' : ''}>Step-by-step Conceptual Explanations & Tracing</option>
                            <option value="balanced" ${answers.learningStyle === 'balanced' ? 'selected' : ''}>Balanced Mix of Theory & Practice</option>
                        </select>
                    </div>

                    <div class="form-group" style="margin-top: 1.25rem;">
                        <label class="form-label">Weekly Learning Goal</label>
                        <select class="select-field" id="onb-goal-select">
                            <option value="1_2_hours" ${answers.weeklyGoal === '1_2_hours' ? 'selected' : ''}>1 - 2 hours per week (Casual practice)</option>
                            <option value="3_5_hours" ${answers.weeklyGoal === '3_5_hours' ? 'selected' : ''}>3 - 5 hours per week (Recommended)</option>
                            <option value="5_plus_hours" ${answers.weeklyGoal === '5_plus_hours' ? 'selected' : ''}>5+ hours per week (Fast-track mastery)</option>
                        </select>
                    </div>
                </div>
            `;
        }

        if (step === 4) {
            return `
                <div>
                    <h2 style="font-size: 1.35rem; font-weight: 800; color: #0F172A; margin-bottom: 0.35rem;">
                        What is your primary learning goal?
                    </h2>
                    <p style="color: #64748B; font-size: 0.875rem; margin-bottom: 1.5rem;">
                        Choose the main reason you are learning Java programming with us.
                    </p>

                    <div style="display: flex; flex-direction: column; gap: 0.75rem;" id="interest-options">
                        <label style="display: flex; align-items: center; gap: 0.75rem; padding: 1rem; border: 2px solid ${answers.interest === 'coursework' ? '#2563EB' : '#E2E8F0'}; background: ${answers.interest === 'coursework' ? '#EFF6FF' : '#FFFFFF'}; border-radius: 10px; cursor: pointer;">
                            <input type="radio" name="interest" value="coursework" ${answers.interest === 'coursework' ? 'checked' : ''}>
                            <div>
                                <strong style="display: block; font-size: 0.9375rem; color: #0F172A;">University / School Coursework</strong>
                                <span style="font-size: 0.8125rem; color: #64748B;">Preparing for Java exams and programming assignments.</span>
                            </div>
                        </label>

                        <label style="display: flex; align-items: center; gap: 0.75rem; padding: 1rem; border: 2px solid ${answers.interest === 'career' ? '#2563EB' : '#E2E8F0'}; background: ${answers.interest === 'career' ? '#EFF6FF' : '#FFFFFF'}; border-radius: 10px; cursor: pointer;">
                            <input type="radio" name="interest" value="career" ${answers.interest === 'career' ? 'checked' : ''}>
                            <div>
                                <strong style="display: block; font-size: 0.9375rem; color: #0F172A;">Career & Technical Interviews</strong>
                                <span style="font-size: 0.8125rem; color: #64748B;">Building strong fundamentals for software engineering roles.</span>
                            </div>
                        </label>

                        <label style="display: flex; align-items: center; gap: 0.75rem; padding: 1rem; border: 2px solid ${answers.interest === 'hobby' ? '#2563EB' : '#E2E8F0'}; background: ${answers.interest === 'hobby' ? '#EFF6FF' : '#FFFFFF'}; border-radius: 10px; cursor: pointer;">
                            <input type="radio" name="interest" value="hobby" ${answers.interest === 'hobby' ? 'checked' : ''}>
                            <div>
                                <strong style="display: block; font-size: 0.9375rem; color: #0F172A;">Personal Curiosity & Hobby</strong>
                                <span style="font-size: 0.8125rem; color: #64748B;">Learning how software and algorithms work.</span>
                            </div>
                        </label>
                    </div>
                </div>
            `;
        }
    }

    function attachStepListeners() {
        document.getElementById("onb-prev-btn")?.addEventListener("click", () => {
            if (currentStep > 1) {
                currentStep--;
                renderStep();
            }
        });

        document.getElementById("onb-next-btn")?.addEventListener("click", () => {
            if (currentStep === 2) {
                const selected = document.querySelector('input[name="exp"]:checked');
                if (selected) answers.experience = selected.value;
            } else if (currentStep === 3) {
                const styleSel = document.getElementById("onb-style-select");
                const goalSel = document.getElementById("onb-goal-select");
                if (styleSel) answers.learningStyle = styleSel.value;
                if (goalSel) answers.weeklyGoal = goalSel.value;
            } else if (currentStep === 4) {
                const interestSel = document.querySelector('input[name="interest"]:checked');
                if (interestSel) answers.interest = interestSel.value;

                // Save onboarding status and redirect
                setOnboardingCompleted(null, true);
                if (onNavigate) onNavigate("/student/dashboard");
                return;
            }

            currentStep++;
            renderStep();
        });

        // Interactive radio card selection styling
        container.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener("change", () => {
                const parent = radio.closest("div");
                parent?.querySelectorAll("label").forEach(l => {
                    l.style.borderColor = "#E2E8F0";
                    l.style.background = "#FFFFFF";
                });
                const selectedLabel = radio.closest("label");
                if (selectedLabel) {
                    selectedLabel.style.borderColor = "#2563EB";
                    selectedLabel.style.background = "#EFF6FF";
                }
            });
        });
    }

    renderStep();
}
