/**
 * AuthLayout Component — Clean authentication and onboarding container
 * ====================================================================
 */

export function renderAuthLayout(targetElement) {
    targetElement.innerHTML = `
        <div style="min-height: 100vh; background: #F8FAFC; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 2rem 1rem;">
            <div style="width: 100%; max-width: 520px;" id="auth-content-area"></div>
            <div style="margin-top: 2rem; font-size: 0.8125rem; color: #94A3B8; text-align: center;">
                CodeQuest Programming Learning Framework • Research ID: R26-IT-149
            </div>
        </div>
    `;
    return document.getElementById("auth-content-area");
}
