/**
 * DOM Utilities
 * =============
 * Helper functions for common DOM operations.
 */

export function $(selector) {
    return document.querySelector(selector);
}

export function $$(selector) {
    return document.querySelectorAll(selector);
}

export function showLoading(container, message = "Loading...") {
    container.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
            <div class="spinner"></div>
            <p style="margin-top: 1rem;">${message}</p>
        </div>
    `;
}

export function showError(container, message = "Something went wrong") {
    container.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: var(--accent-orange);">
            <p>${message}</p>
            <button class="btn btn-primary" style="margin-top: 1rem;" onclick="location.reload()">Retry</button>
        </div>
    `;
}
