/**
 * Main Entry Point
 * =================
 * Initializes Firebase, sets up navigation, and loads the default page.
 */

import "./style.css";
import { initFirebase } from "./config/firebase.js";
import { initAuthListener, onAuthChange, logout, getCurrentUser } from "./utils/auth.js";
import { renderDashboard } from "./pages/dashboard.js";
import { renderLearningPath } from "./pages/learning-path.js";
import { renderQuizLab } from "./pages/quiz-lab.js";
import { renderGames, disposeGames, launchModuleFromQuery } from "./pages/games.js";
import { renderErrorAnalysis } from "./pages/error-analysis.js";
import { renderMastery } from "./pages/mastery.js";

import { renderQuizResults } from "./pages/quiz-results.js";
import { renderQuizSummary } from "./pages/quiz-summary.js";

import { renderDemoFlow } from "./pages/demo-flow.js";

import { renderLogin } from "./pages/login.js";
import { renderRegister } from "./pages/register.js";
import { renderProfile } from "./pages/profile.js";
import { renderLanding, disposeLanding } from "./pages/landing.js";

initFirebase();
initAuthListener();

const pages = {
    dashboard: renderDashboard,
    "learning-path": renderLearningPath,
    "quiz-lab": renderQuizLab,
    games: renderGames,
    "error-analysis": renderErrorAnalysis,
    mastery: renderMastery,
    "quiz-results": renderQuizResults,
    "quiz-summary": renderQuizSummary,

    "demo-flow": renderDemoFlow,
    profile: renderProfile,

};

const authPages = {
    landing: (c) => renderLanding(c, navigateTo),
    login: (c) => renderLogin(c, navigateTo),
    register: (c) => renderRegister(c, navigateTo),
};

/** Pages that require a logged-in user. Login/register stay public. */
const PROTECTED_PAGES = new Set([
    "dashboard",
    "learning-path",
    "quiz-lab",
    "games",
    "error-analysis",
    "mastery",
    "quiz-results",
    "quiz-summary",
    "demo-flow",
    "profile",
]);

let currentPage = "landing";

function isLoggedIn() {
    return !!getCurrentUser() || !!localStorage.getItem("codequest_user");
}

function navigateTo(page) {
    // Require login for app routes; send guests to the landing page
    if (PROTECTED_PAGES.has(page) && !isLoggedIn()) {
        page = "landing";
    }

    // Bug fix: ensure the gamified (Phaser) UI is fully removed when navigating away.
    // `#phaser-container` lives outside `#page-container`, so it won't unmount automatically.
    if (currentPage === "games" && page !== "games") {
        disposeGames();
    }

    const container = document.getElementById("page-container");
    if (currentPage === "landing" && page !== "landing") {
        disposeLanding(container);
    }

    currentPage = page;

    document.querySelectorAll(".nav-link").forEach((link) => {
        link.classList.toggle("active", link.dataset.page === page);
    });

    const renderFn = pages[page] || authPages[page];

    if (renderFn) {
        renderFn(container);
    } else {
        container.innerHTML = `<h2>Page not found</h2>`;
    }
}

// expose navigateTo globally
window.navigateTo = navigateTo;

function updateNavForUser(user) {
    const actionsEl = document.getElementById("nav-actions");
    const navLinks = document.getElementById("nav-links");

    if (!actionsEl) return;

    // Hide main nav while logged out so guests only see Sign In / Register
    if (navLinks) {
        navLinks.style.display = user ? "" : "none";
    }

    if (user) {
        actionsEl.innerHTML = `
            <button 
                class="btn" 
                id="nav-profile-btn"
                style="background: rgba(255,255,255,0.05); color: var(--text-primary); font-size: 0.85rem; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; margin-right: 0.75rem; display: flex; align-items: center; gap: 0.5rem;"
            >
                <div style="width: 20px; height: 20px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #a855f7); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.6rem; font-weight: bold;">
                    ${(user.display_name || user.email || '?').charAt(0).toUpperCase()}
                </div>
                ${user.display_name || user.email}
            </button>

            <button 
                class="btn" 
                id="logout-btn"
                style="background: transparent; border: 1px solid var(--border-color); color: var(--text-secondary); font-size: 0.8rem;"
            >
                Logout
            </button>
        `;

        document.getElementById("nav-profile-btn").addEventListener("click", () => {
            navigateTo("profile");
        });

        document.getElementById("logout-btn").addEventListener("click", async () => {
            await logout();
            navigateTo("landing");
        });

    } else {

        actionsEl.innerHTML = `
            <button 
                class="btn" 
                id="nav-login-btn"
                style="font-size: 0.8rem; background: transparent; border: 1px solid var(--border-color); color: var(--text-secondary); margin-right: 0.5rem;"
            >
                Sign In
            </button>
            <button 
                class="btn btn-primary" 
                id="nav-register-btn"
                style="font-size: 0.8rem;"
            >
                Get Started
            </button>
        `;

        document.getElementById("nav-login-btn").addEventListener("click", () => {
            navigateTo("login");
        });
        document.getElementById("nav-register-btn").addEventListener("click", () => {
            navigateTo("register");
        });

        // If session ended while on a protected page, return to landing
        if (PROTECTED_PAGES.has(currentPage)) {
            navigateTo("landing");
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("[OK] CodeQuest app loaded");

    const brandEl = document.getElementById("nav-brand");
    if (brandEl) {
        const goHome = () => navigateTo(isLoggedIn() ? "learning-path" : "landing");
        brandEl.addEventListener("click", goHome);
        brandEl.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                goHome();
            }
        });
    }

    document.querySelectorAll(".nav-link").forEach((link) => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            navigateTo(link.dataset.page);
        });
    });

    onAuthChange((user) => {
        updateNavForUser(user);
    });

    // If this tab was opened via a "Launch Module" button (new-tab flow from
    // the Games page), show only the game itself — skip rendering the Games
    // category/module cards behind it.
    const launchModule = new URLSearchParams(window.location.search).get("launchModule");
    if (launchModule) {
        if (!isLoggedIn()) {
            navigateTo("landing");
            return;
        }
        currentPage = "games";
        document.querySelectorAll(".nav-link").forEach((link) => {
            link.classList.toggle("active", link.dataset.page === "games");
        });
        document.getElementById("page-container").innerHTML = "";
        launchModuleFromQuery(launchModule);
        window.history.replaceState({}, "", window.location.pathname);
        return;
    }

    // Guests see the landing page; signed-in users go to Home
    navigateTo(isLoggedIn() ? "learning-path" : "landing");
});