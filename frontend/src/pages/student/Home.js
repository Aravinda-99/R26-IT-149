/**
 * Student Home Page
 * =================
 * Clean, modern intro & hero page for the CodeQuest learning platform.
 * Contains strictly the hero headline, CTAs, system architecture preview cards,
 * and a concise 5-step overview.
 * (Does NOT contain dashboard widgets, schedule, progression tracker, or module cards).
 */

import { getCurrentUser } from "../../utils/auth.js";

export function renderStudentHome(container) {
    const user = getCurrentUser();
    const studentName = user?.displayName || user?.name || user?.email?.split("@")[0] || "Learner";

    container.innerHTML = `
        <div class="home-page-container">
            
            <!-- Hero Section -->
            <section class="home-hero-card">
                
                <!-- Left Hero Content -->
                <div class="hero-content-left">
                    <div style="display: inline-flex; align-items: center; gap: 0.45rem; background: #EFF6FF; color: #2563EB; font-weight: 700; font-size: 0.78rem; padding: 0.3rem 0.75rem; border-radius: 9999px; margin-bottom: 1.25rem;">
                        <i class="fa-solid fa-code"></i> Java Foundations LMS Track
                    </div>
                    
                    <h1 class="hero-title">
                        Track Your Java <br />
                        <span style="color: #2563EB;">Learning Progress</span>
                    </h1>
                    
                    <p class="hero-subtitle">
                        Complete pre-tests, understand your mistakes, practice through game lessons, and check your understanding with guided post-tests.
                    </p>
                    
                    <div class="hero-cta-group">
                        <a href="#/student/pre-test" class="btn btn-primary" style="padding: 0.75rem 1.6rem; font-size: 0.95rem; font-weight: 700; border-radius: 8px; background: #2563EB; color: #FFFFFF; text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);">
                            <i class="fa-solid fa-play"></i> Start Pre-Test
                        </a>
                        <a href="#/student/dashboard" class="btn btn-outline" style="padding: 0.75rem 1.4rem; font-size: 0.95rem; font-weight: 600; border-radius: 8px; border: 1px solid #CBD5E1; background: #FFFFFF; color: #0F172A; text-decoration: none; display: inline-flex; align-items: center; gap: 0.45rem;">
                            <i class="fa-solid fa-house"></i> View Learning Hub
                        </a>
                    </div>
                </div>

                <!-- Right Hero: 5-Step System Architecture Card -->
                <div class="hero-preview-box">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                        <span style="font-size: 0.75rem; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.6px;">5-Step Learning Architecture</span>
                        <span style="font-size: 0.72rem; color: #16A34A; background: #DCFCE7; font-weight: 700; padding: 0.15rem 0.55rem; border-radius: 9999px;">Active Track</span>
                    </div>

                    <!-- Step 1 Card -->
                    <div class="hero-step-row" style="border-left: 3.5px solid #2563EB;">
                        <div class="hero-step-left">
                            <span class="hero-step-num" style="background: #EFF6FF; color: #2563EB;">1</span>
                            <div class="hero-step-info">
                                <strong class="hero-step-title">Diagnostic Pre-Test</strong>
                                <span class="hero-step-desc">Multi-concept baseline evaluation</span>
                            </div>
                        </div>
                        <i class="fa-solid fa-chevron-right" style="font-size: 0.75rem; color: #94A3B8; flex-shrink: 0;"></i>
                    </div>

                    <!-- Step 2 Card -->
                    <div class="hero-step-row" style="border-left: 3.5px solid #D97706;">
                        <div class="hero-step-left">
                            <span class="hero-step-num" style="background: #FEF3C7; color: #D97706;">2</span>
                            <div class="hero-step-info">
                                <strong class="hero-step-title">Error Feedback</strong>
                                <span class="hero-step-desc">Root-cause misconception diagnosis</span>
                            </div>
                        </div>
                        <i class="fa-solid fa-chevron-right" style="font-size: 0.75rem; color: #94A3B8; flex-shrink: 0;"></i>
                    </div>

                    <!-- Step 3 Card -->
                    <div class="hero-step-row" style="border-left: 3.5px solid #059669;">
                        <div class="hero-step-left">
                            <span class="hero-step-num" style="background: #ECFDF5; color: #059669;">3</span>
                            <div class="hero-step-info">
                                <strong class="hero-step-title">Game Lessons</strong>
                                <span class="hero-step-desc">Interactive Phaser 3 practice trilogy</span>
                            </div>
                        </div>
                        <i class="fa-solid fa-chevron-right" style="font-size: 0.75rem; color: #94A3B8; flex-shrink: 0;"></i>
                    </div>

                    <!-- Step 4 Card -->
                    <div class="hero-step-row" style="border-left: 3.5px solid #7C3AED;">
                        <div class="hero-step-left">
                            <span class="hero-step-num" style="background: #EDE9FE; color: #7C3AED;">4</span>
                            <div class="hero-step-info">
                                <strong class="hero-step-title">Understanding Check</strong>
                                <span class="hero-step-desc">Post-learning evaluation</span>
                            </div>
                        </div>
                        <i class="fa-solid fa-chevron-right" style="font-size: 0.75rem; color: #94A3B8; flex-shrink: 0;"></i>
                    </div>

                    <!-- Step 5 Card -->
                    <div class="hero-step-row" style="border-left: 3.5px solid #2563EB;">
                        <div class="hero-step-left">
                            <span class="hero-step-num" style="background: #EFF6FF; color: #2563EB;">5</span>
                            <div class="hero-step-info">
                                <strong class="hero-step-title">Mastery Result</strong>
                                <span class="hero-step-desc">Validated Schema Mastery level</span>
                            </div>
                        </div>
                        <i class="fa-solid fa-check" style="font-size: 0.75rem; color: #16A34A; flex-shrink: 0;"></i>
                    </div>
                </div>
            </section>

            <!-- How CodeQuest Works Section -->
            <section class="home-flow-section" style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; padding: clamp(1.5rem, 3vw, 2.25rem); box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <h2 style="font-size: 1.4rem; font-weight: 800; color: #0F172A; margin: 0 0 0.4rem 0;">How CodeQuest Works</h2>
                    <p style="font-size: 0.88rem; color: #64748B; margin: 0 auto; max-width: 580px;">A systematic cognitive framework designed to identify compiler misconceptions and turn them into solid programming intuition.</p>
                </div>

                <div class="home-flow-grid">
                    <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 1.25rem; text-align: center;">
                        <div style="width: 40px; height: 40px; border-radius: 10px; background: #EFF6FF; color: #2563EB; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; margin: 0 auto 0.75rem auto;">
                            <i class="fa-solid fa-clipboard-list"></i>
                        </div>
                        <h3 style="font-size: 0.95rem; font-weight: 700; color: #0F172A; margin: 0 0 0.35rem 0;">1. Diagnostic Pre-Test</h3>
                        <p style="font-size: 0.8rem; color: #64748B; line-height: 1.45; margin: 0;">Multi-domain diagnostic to evaluate understanding across Java core domains.</p>
                    </div>

                    <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 1.25rem; text-align: center;">
                        <div style="width: 40px; height: 40px; border-radius: 10px; background: #FEF3C7; color: #D97706; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; margin: 0 auto 0.75rem auto;">
                            <i class="fa-solid fa-magnifying-glass-chart"></i>
                        </div>
                        <h3 style="font-size: 0.95rem; font-weight: 700; color: #0F172A; margin: 0 0 0.35rem 0;">2. Error Feedback</h3>
                        <p style="font-size: 0.8rem; color: #64748B; line-height: 1.45; margin: 0;">Identify root causes, syntax misunderstandings, and repair strategies.</p>
                    </div>

                    <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 1.25rem; text-align: center;">
                        <div style="width: 40px; height: 40px; border-radius: 10px; background: #ECFDF5; color: #059669; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; margin: 0 auto 0.75rem auto;">
                            <i class="fa-solid fa-gamepad"></i>
                        </div>
                        <h3 style="font-size: 0.95rem; font-weight: 700; color: #0F172A; margin: 0 0 0.35rem 0;">3. Game Lessons</h3>
                        <p style="font-size: 0.8rem; color: #64748B; line-height: 1.45; margin: 0;">Interactive 3-level game challenges reinforcing proper mental schemas.</p>
                    </div>

                    <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 1.25rem; text-align: center;">
                        <div style="width: 40px; height: 40px; border-radius: 10px; background: #EDE9FE; color: #7C3AED; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; margin: 0 auto 0.75rem auto;">
                            <i class="fa-solid fa-clipboard-check"></i>
                        </div>
                        <h3 style="font-size: 0.95rem; font-weight: 700; color: #0F172A; margin: 0 0 0.35rem 0;">4. Understanding Check</h3>
                        <p style="font-size: 0.8rem; color: #64748B; line-height: 1.45; margin: 0;">Balanced 15-question post-test to evaluate retention and concept mastery.</p>
                    </div>
                </div>
            </section>
        </div>
    `;
}
