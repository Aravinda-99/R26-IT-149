/**
 * Main Entry Point — CodeQuest Platform
 * =====================================
 * Dual-Role Architecture:
 * - Student Portal (Calm Educational Theme, Learning Journey, Quizzes & Games)
 * - Teacher & Admin Portal (White/Light SaaS Admin Panel, LLM Question Drafting, Question Bank & Approval Workflow)
 */

import "./style.css";
import { initFirebase } from "./config/firebase.js";
import { initAuthListener, onAuthChange, logout, getUserRole, getCurrentUser } from "./utils/auth.js";
import { renderDashboard } from "./pages/dashboard.js";
import { renderQuizLab } from "./pages/quiz-lab.js";
import { renderGames, disposeGames, launchModuleFromQuery } from "./pages/games.js";
import { renderErrorAnalysis } from "./pages/error-analysis.js";
import { renderQuizResults } from "./pages/quiz-results.js";
import { renderQuizSummary } from "./pages/quiz-summary.js";
import { renderDemoFlow } from "./pages/demo-flow.js";
import { renderQuestionBank } from "./pages/question-bank.js";
import { renderPostTest } from "./pages/posttest.js";
import { renderLogin } from "./pages/login.js";
import { renderRegister } from "./pages/register.js";

initFirebase();
initAuthListener();

const pages = {
    // Student Routes
    dashboard: renderDashboard,
    "student/dashboard": renderDashboard,
    "learning-path": renderDashboard,
    "quiz-lab": renderQuizLab,
    "student/quiz": renderQuizLab,
    games: renderGames,
    "student/games": renderGames,
    "error-analysis": renderErrorAnalysis,
    "student/errors": renderErrorAnalysis,
    "post-test": (c) => renderPostTest(c, { onBack: () => navigateTo("dashboard") }),
    "student/post-test": (c) => renderPostTest(c, { onBack: () => navigateTo("dashboard") }),
    "quiz-results": renderQuizResults,
    "quiz-summary": renderQuizSummary,
    "demo-flow": renderDemoFlow,

    // Teacher & Admin Routes (White/Light Theme)
    "question-bank": renderQuestionBank,
    "teacher-dashboard": renderQuestionBank,
    "teacher/dashboard": renderQuestionBank,
    "teacher/question-generation": renderQuestionBank,
    "teacher/pending-review": renderQuestionBank,
    "teacher/question-bank": renderQuestionBank,
    "teacher/post-test-analytics": renderQuestionBank,
};

const authPages = {
    login: (c) => renderLogin(c, navigateTo),
    register: (c) => renderRegister(c, navigateTo),
};

let currentPage = "dashboard";

export function isTeacherPage(page) {
    return (
        page === "teacher-dashboard" ||
        page === "question-bank" ||
        page.startsWith("teacher/")
    );
}

export function isAuthPage(page) {
    return page === "login" || page === "register";
}

function updateThemeAndLayout(page) {
    const isTeacher = isTeacherPage(page);
    const isAuth = isAuthPage(page);

    // Dynamic Body Theme Class
    if (isTeacher) {
        document.body.className = "theme-teacher";
    } else {
        document.body.className = "theme-student";
    }

    renderNavbar(isTeacher, isAuth);
}

function renderNavbar(isTeacher, isAuth) {
    const navbar = document.getElementById("navbar");
    if (!navbar) return;

    if (isAuth) {
        navbar.style.display = "none";
        return;
    }
    navbar.style.display = "flex";

    const user = getCurrentUser();
    const role = getUserRole(user);

    if (isTeacher) {
        // Teacher / Admin White SaaS Navbar
        navbar.innerHTML = `
            <div class="nav-brand" style="display: flex; align-items: center; gap: 0.6rem; cursor: pointer;" id="teacher-brand-btn">
                <i class="fa-solid fa-graduation-cap" style="color: #4338ca; font-size: 1.4rem;"></i>
                <span style="font-weight: 800; color: #4338ca; letter-spacing: -0.5px;">CodeQuest</span>
                <span style="background: #e0e7ff; color: #4338ca; font-size: 0.7rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 0.3rem; margin-left: 0.2rem; text-transform: uppercase;">
                    Educator Portal
                </span>
            </div>

            <div class="nav-links" id="nav-links">
                <a href="#" class="nav-link active" data-page="teacher-dashboard">
                    <i class="fa-solid fa-chalkboard-user"></i> Management Panel
                </a>
            </div>

            <div class="nav-actions" id="nav-actions" style="display: flex; align-items: center; gap: 0.6rem;">
                <span style="background: rgba(67, 56, 202, 0.1); color: #4338ca; border: 1px solid rgba(67, 56, 202, 0.2); padding: 0.2rem 0.6rem; border-radius: 0.3rem; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">
                    ${role}
                </span>
                <span style="color: #475569; font-size: 0.85rem; font-weight: 500;">
                    ${user?.email || "teacher@codequest.lk"}
                </span>
                <button 
                    class="btn" 
                    id="switch-to-student-btn"
                    style="background: #eef2ff; color: #4338ca; font-size: 0.8rem; font-weight: 600; border: 1px solid #c7d2fe; border-radius: 0.4rem; padding: 0.4rem 0.8rem;"
                    title="Preview student interface"
                >
                    <i class="fa-solid fa-eye"></i> Student View
                </button>
                <button 
                    class="btn" 
                    id="logout-btn"
                    style="background: #ffffff; color: #dc2626; border: 1px solid #fecaca; font-size: 0.8rem; font-weight: 600; border-radius: 0.4rem; padding: 0.4rem 0.8rem;"
                >
                    <i class="fa-solid fa-right-from-bracket"></i> Logout
                </button>
            </div>
        `;

        document.getElementById("teacher-brand-btn")?.addEventListener("click", () => navigateTo("teacher-dashboard"));
        document.getElementById("switch-to-student-btn")?.addEventListener("click", () => navigateTo("dashboard"));
        document.getElementById("logout-btn")?.addEventListener("click", async () => {
            await logout();
            navigateTo("login");
        });
    } else {
        // Student Calm Educational Navbar
        navbar.innerHTML = `
            <div class="nav-brand" style="display: flex; align-items: center; gap: 0.6rem; cursor: pointer;" id="student-brand-btn">
                <i class="fa-solid fa-code" style="color: #818cf8; font-size: 1.3rem;"></i>
                <span style="font-weight: 800; color: #818cf8; letter-spacing: -0.5px;">CodeQuest</span>
                <span style="background: rgba(99, 102, 241, 0.15); color: #a5b4fc; font-size: 0.7rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 0.3rem; margin-left: 0.2rem; text-transform: uppercase;">
                    Student Hub
                </span>
            </div>

            <div class="nav-links" id="nav-links">
                <a href="#" class="nav-link ${currentPage === 'dashboard' ? 'active' : ''}" data-page="dashboard">
                    <i class="fa-solid fa-gauge-high"></i> Dashboard
                </a>
                <a href="#" class="nav-link ${currentPage === 'quiz-lab' ? 'active' : ''}" data-page="quiz-lab">
                    <i class="fa-solid fa-clipboard-list"></i> Diagnostic Quiz
                </a>
                <a href="#" class="nav-link ${currentPage === 'games' ? 'active' : ''}" data-page="games">
                    <i class="fa-solid fa-gamepad"></i> Games
                </a>
                <a href="#" class="nav-link ${currentPage === 'error-analysis' ? 'active' : ''}" data-page="error-analysis">
                    <i class="fa-solid fa-magnifying-glass-chart"></i> Errors
                </a>
                <a href="#" class="nav-link ${currentPage === 'demo-flow' ? 'active' : ''}" data-page="demo-flow" style="color:#a78bfa;">
                    <i class="fa-solid fa-play"></i> Demo Flow
                </a>
            </div>

            <div class="nav-actions" id="nav-actions" style="display: flex; align-items: center; gap: 0.6rem;">
                ${user ? `
                    <span style="background: rgba(99, 102, 241, 0.2); color: #a5b4fc; border: 1px solid rgba(99, 102, 241, 0.3); padding: 0.15rem 0.5rem; border-radius: 0.3rem; font-size: 0.75rem; text-transform: uppercase; font-weight: 700;">
                        ${role}
                    </span>
                    <span style="color: var(--text-secondary); font-size: 0.85rem;">
                        ${user.email}
                    </span>
                    ${(role === "teacher" || role === "admin") ? `
                        <button 
                            class="btn" 
                            id="nav-to-teacher-btn"
                            style="background: rgba(99, 102, 241, 0.2); color: #c7d2fe; font-size: 0.8rem; border: 1px solid rgba(99, 102, 241, 0.4); border-radius: 0.4rem; padding: 0.4rem 0.75rem;"
                        >
                            <i class="fa-solid fa-chalkboard-user"></i> Teacher Panel
                        </button>
                    ` : ''}
                    <button 
                        class="btn" 
                        id="logout-btn"
                        style="background: var(--border-color); color: var(--text-primary); font-size: 0.8rem; border-radius: 0.4rem; padding: 0.4rem 0.75rem;"
                    >
                        <i class="fa-solid fa-right-from-bracket"></i> Logout
                    </button>
                ` : `
                    <button 
                        class="btn btn-primary" 
                        id="nav-login-btn"
                        style="font-size: 0.85rem; padding: 0.45rem 1rem;"
                    >
                        Sign In
                    </button>
                `}
            </div>
        `;

        document.getElementById("student-brand-btn")?.addEventListener("click", () => navigateTo("dashboard"));
        document.getElementById("nav-to-teacher-btn")?.addEventListener("click", () => navigateTo("teacher-dashboard"));
        document.getElementById("nav-login-btn")?.addEventListener("click", () => navigateTo("login"));
        document.getElementById("logout-btn")?.addEventListener("click", async () => {
            await logout();
            navigateTo("login");
        });

        navbar.querySelectorAll(".nav-link").forEach((link) => {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                navigateTo(link.dataset.page);
            });
        });
    }
}

export function navigateTo(page) {
    if (currentPage === "games" && page !== "games") {
        disposeGames();
    }

    currentPage = page;
    updateThemeAndLayout(page);

    const container = document.getElementById("page-container");
    const renderFn = pages[page] || authPages[page];

    if (renderFn) {
        renderFn(container);
    } else {
        container.innerHTML = `
            <div style="text-align: center; margin: 4rem auto;">
                <h2>Page Not Found</h2>
                <p style="color: var(--text-secondary); margin-top: 0.5rem;">The requested page could not be located.</p>
                <button class="btn btn-primary" onclick="window.navigateTo('dashboard')" style="margin-top: 1rem;">
                    Return to Dashboard
                </button>
            </div>
        `;
    }
}

window.navigateTo = navigateTo;

document.addEventListener("DOMContentLoaded", () => {
    console.log("[OK] CodeQuest dual-role app loaded");

    onAuthChange((user) => {
        const role = getUserRole(user);
        window.__cqRole = role;
        renderNavbar(isTeacherPage(currentPage), isAuthPage(currentPage));
    });

    const launchModule = new URLSearchParams(window.location.search).get("launchModule");
    if (launchModule) {
        currentPage = "games";
        updateThemeAndLayout("games");
        document.getElementById("page-container").innerHTML = "";
        launchModuleFromQuery(launchModule);
        window.history.replaceState({}, "", window.location.pathname);
        return;
    }

    // Default to student dashboard
    navigateTo("dashboard");
});