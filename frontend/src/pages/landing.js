/**
 * Landing Page
 * ============
 * Public, student-friendly entry point for CodeQuest.
 */

export function renderLanding(container, onNavigate) {
    container.innerHTML = `
        <div class="landing">
            <section class="landing-hero" aria-label="Welcome">
                <div class="landing-hero-bg" aria-hidden="true">
                    <div class="landing-grid"></div>
                    <div class="landing-orb landing-orb-a"></div>
                    <div class="landing-orb landing-orb-b"></div>
                </div>

                <div class="landing-hero-inner">
                    <p class="landing-brand">CodeQuest</p>
                    <h1 class="landing-headline">Learn to code by playing through it</h1>
                    <p class="landing-sub">
                        Games, quizzes, and clear feedback — built so students can practice Java at their own pace.
                    </p>
                    <div class="landing-cta">
                        <button type="button" class="landing-btn landing-btn-primary" id="landing-start">
                            Start learning free
                        </button>
                        <button type="button" class="landing-btn landing-btn-ghost" id="landing-signin">
                            I already have an account
                        </button>
                    </div>
                </div>

                <div class="landing-visual" aria-hidden="true">
                    <div class="landing-screen">
                        <div class="landing-screen-bar">
                            <span></span><span></span><span></span>
                        </div>
                        <div class="landing-screen-body">
                            <div class="landing-code-line landing-code-delay-1"><span class="tok-kw">int</span> score = <span class="tok-num">0</span>;</div>
                            <div class="landing-code-line landing-code-delay-2"><span class="tok-kw">if</span> (score &gt; <span class="tok-num">10</span>) {</div>
                            <div class="landing-code-line landing-code-delay-3">&nbsp;&nbsp;levelUp();</div>
                            <div class="landing-code-line landing-code-delay-4">}</div>
                            <div class="landing-bit">
                                <div class="landing-bit-face">◆</div>
                                <p>Nice! Try the next challenge.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section class="landing-path" aria-label="How it works">
                <h2 class="landing-section-title">Your path, step by step</h2>
                <p class="landing-section-sub">No complicated setup — just pick up where you left off.</p>

                <ol class="landing-steps">
                    <li class="landing-step">
                        <span class="landing-step-num">1</span>
                        <div>
                            <h3>Play short game levels</h3>
                            <p>Practice concepts inside fun missions instead of long lectures.</p>
                        </div>
                    </li>
                    <li class="landing-step">
                        <span class="landing-step-num">2</span>
                        <div>
                            <h3>Check yourself with quizzes</h3>
                            <p>Quick questions show what you know and what still needs work.</p>
                        </div>
                    </li>
                    <li class="landing-step">
                        <span class="landing-step-num">3</span>
                        <div>
                            <h3>Watch your mastery grow</h3>
                            <p>See progress clearly so studying feels rewarding, not stressful.</p>
                        </div>
                    </li>
                </ol>
            </section>

            <section class="landing-close" aria-label="Get started">
                <h2 class="landing-section-title">Ready when you are</h2>
                <p class="landing-section-sub">Create a free account and jump into your first lesson.</p>
                <button type="button" class="landing-btn landing-btn-primary" id="landing-start-bottom">
                    Create student account
                </button>
            </section>
        </div>
    `;

    // Full-bleed: landing ignores the default page max-width
    container.classList.add("page-landing");

    const goRegister = () => onNavigate && onNavigate("/signup");
    const goLogin = () => onNavigate && onNavigate("/login");

    container.querySelector("#landing-start")?.addEventListener("click", goRegister);
    container.querySelector("#landing-start-bottom")?.addEventListener("click", goRegister);
    container.querySelector("#landing-signin")?.addEventListener("click", goLogin);
}

export function disposeLanding(container) {
    container?.classList.remove("page-landing");
}
