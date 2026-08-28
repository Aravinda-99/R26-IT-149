/**
 * Welcome Page — CodeQuest First-Time Landing
 * ============================================
 * Clean, friendly welcome screen introducing beginners to CodeQuest.
 * Features GSAP entrance animations, clear CTA, and feature highlights.
 */

import { animatePageEntrance, animateStaggerCards } from "../../utils/animations.js";
import { getCurrentUser } from "../../utils/auth.js";

export function renderWelcome(container, onNavigate) {
    const user = getCurrentUser();

    container.innerHTML = `
        <div class="welcome-container" style="width: 100%; max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; gap: 2.5rem; text-align: center;">
            
            <!-- Hero Section -->
            <div class="welcome-hero-card" style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; padding: 3.5rem 2rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                <div style="display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; background: #DBEAFE; color: #2563EB; border-radius: 16px; font-size: 1.75rem; margin-bottom: 1.5rem; box-shadow: 0 4px 10px rgba(37,99,235,0.15);">
                    <i class="fa-solid fa-code"></i>
                </div>

                <div style="display: inline-block; background: #EFF6FF; color: #1E40AF; padding: 0.3rem 0.85rem; border-radius: 999px; font-size: 0.8125rem; font-weight: 700; margin-bottom: 1rem; letter-spacing: 0.03em;">
                    BEGINNER-FRIENDLY PROGRAMMING LMS
                </div>

                <h1 style="font-size: 2.25rem; font-weight: 800; color: #0F172A; margin-bottom: 1rem; letter-spacing: -0.03em; line-height: 1.25;">
                    Master Java Programming <br/>with Structured Guidance
                </h1>

                <p style="font-size: 1.05rem; color: #64748B; max-width: 620px; margin: 0 auto 2rem auto; line-height: 1.6;">
                    Learn core programming concepts step-by-step through interactive lessons, targeted practice games, diagnostic checks, and adaptive feedback.
                </p>

                <div style="display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
                    <button class="btn btn-primary" id="welcome-start-btn" style="padding: 0.85rem 2.25rem; font-size: 1.05rem; font-weight: 700; border-radius: 10px; box-shadow: 0 4px 12px rgba(37,99,235,0.25);">
                        Get Started <i class="fa-solid fa-arrow-right" style="margin-left: 0.5rem;"></i>
                    </button>
                    <button class="btn btn-secondary" id="welcome-login-btn" style="padding: 0.85rem 1.75rem; font-size: 1.05rem; font-weight: 600; border-radius: 10px;">
                        Sign In
                    </button>
                </div>
            </div>

            <!-- Value Props Grid -->
            <div class="welcome-features-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.25rem; text-align: left;">
                
                <div class="welcome-feature-card" style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                    <div style="width: 40px; height: 40px; border-radius: 10px; background: #DBEAFE; color: #2563EB; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; margin-bottom: 1rem;">
                        <i class="fa-solid fa-map"></i>
                    </div>
                    <h3 style="font-size: 1.05rem; font-weight: 700; color: #0F172A; margin-bottom: 0.4rem;">Structured Roadmap</h3>
                    <p style="font-size: 0.875rem; color: #64748B; line-height: 1.5;">
                        Progress smoothly through Variables, Operators, Loops, Arrays, and Methods at your own pace.
                    </p>
                </div>

                <div class="welcome-feature-card" style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                    <div style="width: 40px; height: 40px; border-radius: 10px; background: #DCFCE7; color: #16A34A; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; margin-bottom: 1rem;">
                        <i class="fa-solid fa-gamepad"></i>
                    </div>
                    <h3 style="font-size: 1.05rem; font-weight: 700; color: #0F172A; margin-bottom: 0.4rem;">Interactive Practice</h3>
                    <p style="font-size: 0.875rem; color: #64748B; line-height: 1.5;">
                        Solidify mental models with hands-on exercises and gamified challenges designed for beginners.
                    </p>
                </div>

                <div class="welcome-feature-card" style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                    <div style="width: 40px; height: 40px; border-radius: 10px; background: #FEF3C7; color: #D97706; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; margin-bottom: 1rem;">
                        <i class="fa-solid fa-circle-check"></i>
                    </div>
                    <h3 style="font-size: 1.05rem; font-weight: 700; color: #0F172A; margin-bottom: 0.4rem;">Understanding Checks</h3>
                    <p style="font-size: 0.875rem; color: #64748B; line-height: 1.5;">
                        Validate your understanding after every topic and receive personalized next-step recommendations.
                    </p>
                </div>

            </div>

        </div>
    `;

    // Apply GSAP entrance animations
    animatePageEntrance(container.querySelector(".welcome-hero-card"));
    animateStaggerCards(".welcome-feature-card", container);

    document.getElementById("welcome-start-btn")?.addEventListener("click", () => {
        if (onNavigate) {
            if (user) {
                onNavigate("/student/dashboard");
            } else {
                onNavigate("/onboarding");
            }
        }
    });

    document.getElementById("welcome-login-btn")?.addEventListener("click", () => {
        if (onNavigate) onNavigate("/login");
    });
}
