/**
 * LEGACY ARCHIVE: Demo Flow (PP1 Presentation Mock Flow)
 * =======================================================
 * ARCHIVED ON: 2026-08-28
 * REASON: Superseded by the real LMS student dashboard, onboarding wizard,
 * and Component 4 post-test ML evaluation flow.
 * 
 * This file is archived for reference and is NOT part of active routing.
 */

// ── Mock Data ───────────────────────────────────────────────────────
const CONCEPTS = ["Variables", "Operators", "Loops", "Arrays", "Methods"];
const WEAK_CONCEPT = "Loops";

const MOCK_QUESTIONS = [
    { q: "What does a for loop do in Java?", code: null, options: ["Repeats a block of code a set number of times", "Defines a new variable", "Creates a new method", "Prints output to console"], correct: 0 },
    { q: "What is the output of this code?", code: "for (int i = 0; i < 3; i++) {\n    System.out.print(i + \" \");\n}", options: ["0 1 2", "1 2 3", "0 1 2 3", "1 2"], correct: 0 },
    { q: "Which loop is best when the number of iterations is unknown?", code: null, options: ["while loop", "for loop", "do-while loop", "switch statement"], correct: 0 },
    { q: "What happens if a loop condition is always true?", code: null, options: ["Infinite loop", "Compilation error", "Loop runs once", "Program exits"], correct: 0 },
    { q: "What is the correct syntax for a while loop?", code: null, options: ["while (condition) { }", "while { condition }", "loop (condition) { }", "for (condition) { }"], correct: 0 },
    { q: "What does 'break' do inside a loop?", code: null, options: ["Exits the loop immediately", "Skips to next iteration", "Restarts the loop", "Pauses the loop"], correct: 0 },
    { q: "What does 'continue' do inside a loop?", code: null, options: ["Skips to next iteration", "Exits the loop", "Restarts the loop", "Does nothing"], correct: 0 },
    { q: "How many times will this loop run?", code: "int i = 5;\nwhile (i > 0) {\n    i--;\n}", options: ["5 times", "4 times", "6 times", "Infinite"], correct: 0 },
    { q: "Which keyword is used to repeat code in Java?", code: null, options: ["for", "def", "repeat", "func"], correct: 0 },
    { q: "What is a nested loop?", code: null, options: ["A loop inside another loop", "Two loops running in parallel", "A loop that never ends", "A loop with no body"], correct: 0 },
];

export function renderArchivedDemoFlow(container) {
    container.innerHTML = `
        <div class="card" style="max-width: 600px; margin: 3rem auto; text-align: center; padding: 2.5rem; border-radius: 14px;">
            <h2 style="font-size: 1.35rem; font-weight: 800; color: #0F172A; margin-bottom: 0.5rem;">Legacy Demo Flow Archived</h2>
            <p style="color: #64748B; font-size: 0.9rem; margin-bottom: 1.5rem;">
                This demo flow has been superseded by the production LMS Student Dashboard and Understanding Check.
            </p>
            <button class="btn btn-primary" onclick="window.navigateTo('/student/dashboard')">Go to Student Dashboard</button>
        </div>
    `;
}
