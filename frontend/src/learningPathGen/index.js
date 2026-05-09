export async function renderLearningPath(container) {
    container.innerHTML = `
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                background: #0a0e1a;
                color: #e0e6ed;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            }

            /* Hero Section */
            .hero-section {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 3rem;
                align-items: center;
                padding: 4rem 3rem;
                max-width: 1400px;
                margin: 0 auto;
            }

            .hero-left {
                display: flex;
                flex-direction: column;
                gap: 1.5rem;
            }

            .ai-badge {
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                width: fit-content;
                padding: 0.6rem 1rem;
                background: rgba(99, 102, 241, 0.15);
                border: 1px solid rgba(99, 102, 241, 0.3);
                border-radius: 0.6rem;
                color: #a78bfa;
                font-size: 0.85rem;
                font-weight: 600;
            }

            .hero-title {
                font-size: 3.5rem;
                font-weight: 800;
                line-height: 1.2;
                color: white;
            }

            .hero-title-highlight {
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            .hero-subtitle {
                font-size: 1.1rem;
                color: rgba(224, 230, 237, 0.7);
                line-height: 1.6;
            }

            .hero-buttons {
                display: flex;
                gap: 1rem;
                margin-top: 1rem;
            }

            .btn-primary {
                padding: 0.8rem 2rem;
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                color: white;
                border: none;
                border-radius: 0.6rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
                font-size: 0.95rem;
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
            }

            .btn-primary:hover {
                transform: translateY(-2px);
                filter: brightness(1.1);
            }

            .btn-secondary {
                padding: 0.8rem 2rem;
                background: transparent;
                color: white;
                border: 2px solid rgba(224, 230, 237, 0.3);
                border-radius: 0.6rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
                font-size: 0.95rem;
            }

            .btn-secondary:hover {
                border-color: white;
                background: rgba(255, 255, 255, 0.05);
            }

            .hero-stats {
                display: flex;
                gap: 3rem;
                margin-top: 2rem;
            }

            .stat-item {
                display: flex;
                flex-direction: column;
                gap: 0.3rem;
            }

            .stat-number {
                font-size: 1.3rem;
                font-weight: 700;
                color: white;
            }

            .stat-label {
                font-size: 0.85rem;
                color: rgba(224, 230, 237, 0.6);
            }

            .hero-right {
                position: relative;
            }

            .code-window {
                background: rgba(15, 15, 23, 0.8);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 0.8rem;
                overflow: hidden;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            }

            .code-header {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.8rem 1.2rem;
                background: rgba(0, 0, 0, 0.3);
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }

            .code-dot {
                width: 12px;
                height: 12px;
                border-radius: 50%;
            }

            .code-dot-red { background: #ff5f57; }
            .code-dot-yellow { background: #febc2e; }
            .code-dot-green { background: #28c940; }

            .code-filename {
                margin-left: auto;
                font-size: 0.75rem;
                color: rgba(224, 230, 237, 0.5);
                font-family: 'Monaco', monospace;
            }

            .code-content {
                padding: 1.5rem;
                font-family: 'Monaco', 'Menlo', monospace;
                font-size: 0.85rem;
                line-height: 1.6;
                color: #a78bfa;
            }

            .code-keyword { color: #8b5cf6; }
            .code-string { color: #22c55e; }
            .code-number { color: #f59e0b; }
            .code-comment { color: rgba(224, 230, 237, 0.4); }

            .accuracy-badge {
                position: absolute;
                bottom: 20px;
                right: 20px;
                background: rgba(10, 14, 26, 0.9);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 0.8rem;
                padding: 1rem;
                text-align: center;
                backdrop-filter: blur(10px);
            }

            .accuracy-label {
                font-size: 0.75rem;
                color: rgba(224, 230, 237, 0.6);
                margin-bottom: 0.3rem;
            }

            .accuracy-value {
                font-size: 1.8rem;
                font-weight: 700;
                color: #22c55e;
            }

            .streak-badge {
                position: absolute;
                bottom: 20px;
                left: 20px;
                background: rgba(10, 14, 26, 0.9);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 0.8rem;
                padding: 1rem;
                text-align: center;
                backdrop-filter: blur(10px);
            }

            .streak-label {
                font-size: 0.75rem;
                color: rgba(224, 230, 237, 0.6);
                margin-bottom: 0.3rem;
            }

            .streak-value {
                font-size: 1.5rem;
                font-weight: 700;
                color: #06b6d4;
            }

            @media (max-width: 1024px) {
                .hero-section { grid-template-columns: 1fr; }
            }
        </style>

        <!-- Hero Section -->
        <section class="hero-section">
            <div class="hero-left">
                <div class="ai-badge">
                    <span>⚡</span>
                    <span>AI-powered Java curriculum</span>
                </div>
                <h1 class="hero-title">
                    Master <span class="hero-title-highlight">Java</span> with<br>AI-Powered Learning
                </h1>
                <p class="hero-subtitle">
                    Adaptive quizzes that adjust to your level in real time. Built for self-taught developers who want measurable progress.
                </p>
                <div class="hero-buttons">
                    <button id="start-learning-btn" class="btn-primary">
                        <span>▶</span>
                        <span>Start Learning</span>
                    </button>
                    <button class="btn-secondary">See How It Works</button>
                </div>
                <div class="hero-stats">
                    <div class="stat-item">
                        <span class="stat-number">10,000+</span>
                        <span class="stat-label">students</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">83%</span>
                        <span class="stat-label">completion rate</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">5</span>
                        <span class="stat-label">topics covered</span>
                    </div>
                </div>
            </div>

            <div class="hero-right">
                <div class="code-window">
                    <div class="code-header">
                        <span class="code-dot code-dot-red"></span>
                        <span class="code-dot code-dot-yellow"></span>
                        <span class="code-dot code-dot-green"></span>
                        <span class="code-filename">AdaptiveQuiz.java</span>
                    </div>
                    <div class="code-content">
                        <div><span class="code-keyword">public class</span> AdaptiveQuiz {</div>
                        <div>&nbsp;&nbsp;&nbsp;&nbsp;<span class="code-keyword">int</span> level = <span class="code-number">1</span>;</div>
                        <div>&nbsp;&nbsp;&nbsp;&nbsp;<span class="code-keyword">double</span> accuracy = <span class="code-number">0.87</span>;</div>
                        <div></div>
                        <div>&nbsp;&nbsp;&nbsp;&nbsp;<span class="code-keyword">String</span> next() {</div>
                        <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="code-comment">// ML decides</span></div>
                        <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="code-keyword">return</span> accuracy > <span class="code-number">0.8</span></div>
                        <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;? <span class="code-string">"PROMOTE"</span></div>
                        <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: <span class="code-string">"MAINTAIN"</span>;</div>
                        <div>&nbsp;&nbsp;&nbsp;&nbsp;}</div>
                        <div>}</div>
                    </div>
                </div>
                <div class="accuracy-badge">
                    <div class="accuracy-label">Accuracy</div>
                    <div class="accuracy-value">87%</div>
                </div>
                <div class="streak-badge">
                    <div class="streak-label">Streak</div>
                    <div class="streak-value">12 days 🔥</div>
                </div>
            </div>
        </section>
    `;

    // Navigation Handler
    const startBtn = document.getElementById("start-learning-btn");
    if (startBtn) {
        startBtn.addEventListener("click", () => {
            if (typeof window.navigateTo === "function") {
                window.navigateTo("quiz-lab");
            } else {
                location.hash = "#quiz-lab";
            }
        });
    }
}