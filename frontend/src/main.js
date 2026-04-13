/**
 * Main Entry Point
 * =================
 * Initializes Firebase, sets up navigation, and loads the default page.
 */

import "./style.css";
import { initFirebase } from "./config/firebase.js";
import { initAuthListener, onAuthChange, logout } from "./utils/auth.js";
import { renderDashboard } from "./pages/dashboard.js";
import { renderLearningPath } from "./pages/learning-path.js";
import { renderGames } from "./pages/games.js";
import { renderErrorAnalysis } from "./pages/error-analysis.js";
import { renderMastery } from "./pages/mastery.js";
import { renderLogin } from "./pages/login.js";
import { renderRegister } from "./pages/register.js";

initFirebase();
initAuthListener();

const pages = {
    dashboard: renderDashboard,
    "learning-path": renderLearningPath,
    games: renderGames,
    "error-analysis": renderErrorAnalysis,
    mastery: renderMastery,
};

const authPages = {
    login: (c) => renderLogin(c, navigateTo),
    register: (c) => renderRegister(c, navigateTo),
};

let currentPage = "dashboard";

function navigateTo(page) {
    currentPage = page;

    document.querySelectorAll(".nav-link").forEach((link) => {
        link.classList.toggle("active", link.dataset.page === page);
    });

    const container = document.getElementById("page-container");
    const renderFn = pages[page] || authPages[page];
    if (renderFn) {
        renderFn(container);
    } else {
        container.innerHTML = `<h2>Page not found</h2>`;
    }
}

function updateNavForUser(user) {
    const actionsEl = document.getElementById("nav-actions");
    if (!actionsEl) return;

    if (user) {
        actionsEl.innerHTML = `
            <span style="color: var(--text-secondary); font-size: 0.85rem; margin-right: 0.5rem;">${user.email}</span>
            <button class="btn" id="logout-btn" style="background: var(--border-color); color: var(--text-primary); font-size: 0.8rem;">Logout</button>
        `;
        document.getElementById("logout-btn").addEventListener("click", async () => {
            await logout();
            navigateTo("login");
        });
    } else {
        actionsEl.innerHTML = `
            <button class="btn btn-primary" id="nav-login-btn" style="font-size: 0.8rem;">Sign In</button>
        `;
        document.getElementById("nav-login-btn").addEventListener("click", () => {
            navigateTo("login");
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("[OK] CodeQuest app loaded");

    document.querySelectorAll(".nav-link").forEach((link) => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            navigateTo(link.dataset.page);
        });
    });

    onAuthChange((user) => {
        updateNavForUser(user);
    });

    navigateTo("dashboard");
});
