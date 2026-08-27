/**
 * Main Entry Point
 * =================
 * Initializes Firebase, sets up navigation, and loads the default page.
 */

import "./style.css";
import { initFirebase } from "./config/firebase.js";
import { initAuthListener, onAuthChange, logout, getUserRole } from "./utils/auth.js";
import { renderDashboard } from "./pages/dashboard.js";
import { renderLearningPath } from "./pages/learning-path.js";
import { renderQuizLab } from "./pages/quiz-lab.js";
import { renderGames, disposeGames, launchModuleFromQuery } from "./pages/games.js";
import { renderErrorAnalysis } from "./pages/error-analysis.js";
import { renderMastery } from "./pages/mastery.js";

import { renderQuizResults } from "./pages/quiz-results.js";
import { renderQuizSummary } from "./pages/quiz-summary.js";

import { renderDemoFlow } from "./pages/demo-flow.js";
import { renderQuestionBank } from "./pages/question-bank.js";

import { renderLogin } from "./pages/login.js";
import { renderRegister } from "./pages/register.js";

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
    "question-bank": renderQuestionBank,
    "demo-flow": renderDemoFlow,
};

const authPages = {
    login: (c) => renderLogin(c, navigateTo),
    register: (c) => renderRegister(c, navigateTo),
};

// CHANGED DEFAULT PAGE
let currentPage = "learning-path";

function navigateTo(page) {
    // Bug fix: ensure the gamified (Phaser) UI is fully removed when navigating away.
    // `#phaser-container` lives outside `#page-container`, so it won't unmount automatically.
    if (currentPage === "games" && page !== "games") {
        disposeGames();
    }

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

// expose navigateTo globally
window.navigateTo = navigateTo;

function updateNavForUser(user) {
    const role = getUserRole(user);
    window.__cqRole = role;

    // Toggle teacher-only nav links (Question Bank)
    const qbLink = document.querySelector('.nav-link[data-page="question-bank"]');
    if (qbLink) {
        if (role === "teacher" || role === "admin") {
            qbLink.style.display = "inline-flex";
        } else {
            qbLink.style.display = "none";
        }
    }

    const actionsEl = document.getElementById("nav-actions");
    if (!actionsEl) return;

    if (user) {
        actionsEl.innerHTML = `
            <span style="background: rgba(99, 102, 241, 0.2); color: #a5b4fc; border: 1px solid rgba(99, 102, 241, 0.3); padding: 0.15rem 0.5rem; border-radius: 0.3rem; font-size: 0.75rem; text-transform: uppercase; margin-right: 0.5rem; font-weight: 700;">
                ${role}
            </span>
            <span style="color: var(--text-secondary); font-size: 0.85rem; margin-right: 0.5rem;">
                ${user.email}
            </span>

            <button 
                class="btn" 
                id="logout-btn"
                style="background: var(--border-color); color: var(--text-primary); font-size: 0.8rem;"
            >
                Logout
            </button>
        `;

        document.getElementById("logout-btn").addEventListener("click", async () => {
            await logout();
            navigateTo("login");
        });

    } else {

        actionsEl.innerHTML = `
            <button 
                class="btn btn-primary" 
                id="nav-login-btn"
                style="font-size: 0.8rem;"
            >
                Sign In
            </button>
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

    // If this tab was opened via a "Launch Module" button (new-tab flow from
    // the Games page), show only the game itself — skip rendering the Games
    // category/module cards behind it.
    const launchModule = new URLSearchParams(window.location.search).get("launchModule");
    if (launchModule) {
        currentPage = "games";
        document.querySelectorAll(".nav-link").forEach((link) => {
            link.classList.toggle("active", link.dataset.page === "games");
        });
        document.getElementById("page-container").innerHTML = "";
        launchModuleFromQuery(launchModule);
        window.history.replaceState({}, "", window.location.pathname);
        return;
    }

    // LOAD HOME PAGE FIRST
    navigateTo("learning-path");
});