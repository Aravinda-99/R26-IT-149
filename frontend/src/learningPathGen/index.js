export async function renderLearningPath(container) {
    container.innerHTML = `
        <style>
            .hero-section {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 1.5rem;
                padding: 3rem;
                margin-bottom: 2rem;
                color: white;
                position: relative;
                overflow: hidden;
            }
            
            .hero-section::before {
                content: '';
                position: absolute;
                top: 0; left: 0; right: 0; bottom: 0;
                background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="10" cy="10" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="90" cy="20" r="3" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="80" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="30" cy="50" r="1.5" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="70" r="2.5" fill="rgba(255,255,255,0.1)"/></svg>');
                background-repeat: repeat;
                opacity: 0.3;
            }
            
            .hero-title {
                font-size: 3.5rem;
                font-weight: 800;
                margin-bottom: 1rem;
                line-height: 1.2;
                background: linear-gradient(135deg, #fff 0%, #e0e7ff 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            /* Optimized Feature Card - Fixed Contrast Issues */
            .feature-card {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 1rem;
                padding: 1.5rem;
                margin-top: 1rem;
                border: 1px solid rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
            }
            
            .feature-title {
                font-size: 1.25rem;
                font-weight: 600;
                margin-bottom: 1rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                color: #ffffff;
            }

            .feature-list {
                list-style: none;
                padding: 0;
                margin: 0;
            }

            .feature-list li {
                display: flex;
                align-items: flex-start;
                gap: 0.75rem;
                margin-bottom: 0.75rem;
                font-size: 0.95rem;
                line-height: 1.5;
                color: rgba(255, 255, 255, 0.9);
            }

            /* Button Styles */
            .btn {
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 0.5rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
                font-size: 0.875rem;
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .btn-primary {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }
            
            .btn-secondary {
                background: rgba(255, 255, 255, 0.1);
                color: white;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }

            .btn:hover {
                transform: translateY(-2px);
                filter: brightness(1.1);
            }

            .lp-main-grid {
                display: grid;
                grid-template-columns: 1fr; /* Full width for the Lab card */
                gap: 1.5rem;
                margin-top: 2rem;
            }

            .card-lab {
                background: #1a1f2e; /* Darker navy for better depth */
                border-radius: 1.5rem;
                padding: 2rem;
                border: 1px solid rgba(255, 255, 255, 0.05);
            }

            .pro-tip {
                margin-top: 1.5rem;
                padding: 1rem;
                background: rgba(102, 126, 234, 0.1);
                border-radius: 0.75rem;
                border-left: 4px solid #667eea;
                font-size: 0.9rem;
                color: rgba(255, 255, 255, 0.9);
            }
        </style>

        <!-- Hero Section -->
        <div class="hero-section">
            <div class="hero-content">
                <div class="hero-badge">🚀 Powered by AI</div>
                <h1 class="hero-title">Master Programming Your Way</h1>
                <p class="hero-subtitle">
                    Adaptive learning path with 20 smart quizzes designed to boost your coding confidence.
                </p>
            </div>
        </div>

        <!-- Main Content -->
        <div class="lp-main-grid">
            <div class="card-lab">
                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                    <span style="font-size: 1.75rem;">🧪</span>
                    <h2 style="margin: 0; color: white;">Quiz Lab</h2>
                </div>
                <p style="color: rgba(255,255,255,0.6); margin-bottom: 1.5rem;">
                    20 quizzes • 4 choices each • instant feedback
                </p>
                
                <div class="feature-card">
                    <div class="feature-title">
                        <span>✨</span>
                        <span>Why Quiz Lab?</span>
                    </div>
                    <ul class="feature-list">
                        <li><span>🎯</span> <span>Distraction-free learning environment</span></li>
                        <li><span>⚡</span> <span>Instant feedback and explanations</span></li>
                        <li><span>📊</span> <span>Track your progress in real-time</span></li>
                        <li><span>🔄</span> <span>Adaptive difficulty based on performance</span></li>
                    </ul>
                </div>

                <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                    <button id="open-quiz-lab-btn" class="btn btn-primary">🚀 Launch Quiz Lab</button>
                    <button id="preview-quiz-btn" class="btn btn-secondary">👀 Quick Preview</button>
                </div>

                <div class="pro-tip">
                    <strong>💡 Pro Tip:</strong> Start with the first topic in your roadmap, then test your knowledge in Quiz Lab for reinforcement!
                </div>
            </div>
        </div>
    `;

    // Event Listeners
    const navigate = () => {
        if (typeof window.navigateTo === "function") {
            window.navigateTo("quiz-lab");
        } else {
            location.hash = "#quiz-lab";
        }
    };

    document.getElementById("open-quiz-lab-btn")?.addEventListener("click", navigate);
    document.getElementById("preview-quiz-btn")?.addEventListener("click", navigate);
}