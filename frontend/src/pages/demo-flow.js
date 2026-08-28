/**
 * LEGACY ARCHIVE: Demo Flow
 * =========================
 * Superseded by the real LMS Student Dashboard and Understanding Check.
 * If loaded, automatically redirects to /student/dashboard.
 */

export function renderDemoFlow(container) {
    if (typeof window.navigateTo === "function") {
        window.navigateTo("/student/dashboard");
        return;
    }
    container.innerHTML = `
        <div class="card" style="max-width: 540px; margin: 3rem auto; text-align: center; padding: 2.5rem; border-radius: 14px;">
            <h2 style="font-size: 1.35rem; font-weight: 800; color: #0F172A; margin-bottom: 0.5rem;">Redirecting...</h2>
            <p style="color: #64748B; font-size: 0.9rem; margin-bottom: 1.5rem;">Taking you to the Student Dashboard.</p>
            <button class="btn btn-primary" onclick="window.navigateTo('/student/dashboard')">Go to Dashboard</button>
        </div>
    `;
}
