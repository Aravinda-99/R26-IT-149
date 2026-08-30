/**
 * CodeQuest Main Client Router & Application Entry Point
 * ========================================================
 * Implements strict role-based layout mounting, clean white SaaS routing,
 * and handles transitions across Public, Student, and Teacher portals.
 */

import "./style.css";
import { initFirebase } from "./config/firebase.js";
import { initAuthListener, getCurrentUser, onAuthChange } from "./utils/auth.js";
import { checkRouteAccess } from "./components/RoleGuard.js";

// Layouts
import { renderPublicLayout } from "./layouts/PublicLayout.js";
import { renderStudentLayout } from "./layouts/StudentLayout.js";
import { renderTeacherLayout } from "./layouts/TeacherLayout.js";

// Public & Auth Pages
import { renderWelcome } from "./pages/public/Welcome.js";
import { renderLogin } from "./pages/auth/Login.js";
import { renderRegister } from "./pages/auth/Signup.js";
import { renderTeacherLogin } from "./pages/auth/TeacherLogin.js";

// Student Workspace Pages
import { renderStudentHome } from "./pages/student/Home.js";
import { renderStudentDashboard } from "./pages/student/StudentDashboard.js";
import { renderQuizLab } from "./pages/quiz-lab.js";
import { renderErrorAnalysis } from "./pages/error-analysis.js";
import { renderGames, disposeGames, launchModuleFromQuery } from "./pages/games.js";
import { renderGamePlayer } from "./pages/student/GamePlayer.js";
import { renderPostTest } from "./pages/posttest.js";
import { renderProfile } from "./pages/student/Profile.js";

// Teacher Workspace Pages
import { renderTeacherDashboard } from "./pages/teacher/TeacherDashboard.js";
import { renderQuestionBank } from "./pages/question-bank.js";
import { renderMastery } from "./pages/mastery.js";

// Initialize Firebase & Auth
initFirebase();
initAuthListener();

// Global navigation bridge for internal module routing
window.navigateTo = function (page) {
    if (!page) return;
    if (page === "quiz-lab" || page === "pre-test") {
        window.location.hash = "#/student/pre-test";
    } else if (page === "quiz-results" || page === "error-analysis" || page === "error-feedback" || page === "quiz-summary") {
        window.location.hash = "#/student/error-analysis";
    } else if (page === "games" || page === "recommended-learning" || page === "focus-area" || page === "practice-plan") {
        window.location.hash = "#/student/games";
    } else if (page === "post-test" || page === "posttest") {
        window.location.hash = "#/student/post-test/start";
    } else if (page === "dashboard" || page === "learning-hub") {
        window.location.hash = "#/student/dashboard";
    } else if (page === "home") {
        window.location.hash = "#/student/home";
    } else if (page.startsWith("/")) {
        window.location.hash = `#${page}`;
    } else {
        window.location.hash = `#/student/${page}`;
    }
};

let currentRoute = "";
let currentLayout = null; // 'public' | 'student' | 'teacher'

/**
 * Route Dispatcher
 */
export async function handleNavigation() {
    const rawHash = window.location.hash || "#/student/home";
    let routePath = rawHash.replace(/^#/, "").trim();

    // Default route redirects
    if (!routePath || routePath === "/" || routePath === "/home" || routePath === "/welcome") {
        const user = getCurrentUser();
        if (user && (user.role === "teacher" || user.role === "admin")) {
            routePath = "/teacher/dashboard";
        } else {
            routePath = "/student/home";
        }
        window.location.hash = `#${routePath}`;
        return;
    }

    // Legacy Route Aliases
    const LEGACY_ALIASES = {
        "/home": "/student/home",
        "/welcome": "/student/home",
        "/dashboard": "/student/dashboard",
        "/learning-hub": "/student/dashboard",
        "/learning-path": "/student/dashboard",
        "/quiz-lab": "/student/pre-test",
        "/pre-test": "/student/pre-test",
        "/games": "/student/games",
        "/game": "/student/games",
        "/error-analysis": "/student/error-analysis",
        "/error-feedback": "/student/error-analysis",
        "/student/error-feedback": "/student/error-analysis",
        "/practice-plan": "/student/error-analysis",
        "/student/practice-plan": "/student/error-analysis",
        "/student/practice": "/student/error-analysis",
        "/focus-area": "/student/error-analysis",
        "/student/focus-area": "/student/error-analysis",
        "/student/recommended-learning": "/student/error-analysis",
        "/recommended-learning": "/student/error-analysis",
        "/mastery": "/teacher/analytics",
        "/question-bank": "/teacher/questions/generate",
        "/demo-flow": "/student/dashboard",
    };

    if (LEGACY_ALIASES[routePath]) {
        window.location.hash = `#${LEGACY_ALIASES[routePath]}`;
        return;
    }

    // Clean up Phaser instances if leaving game lessons
    if ((currentRoute.includes("/games") || currentRoute.includes("game-player") || currentRoute.includes("game-play")) &&
        (!routePath.includes("/games") && !routePath.includes("game-player") && !routePath.includes("game-play"))) {
        disposeGames();
    }

    currentRoute = routePath;

    // Check Role Access & Security
    const access = checkRouteAccess(routePath);
    if (!access.allowed) {
        window.location.hash = `#${access.redirectTo || "/login"}`;
        return;
    }

    const appEl = document.getElementById("app");
    if (!appEl) return;

    // Determine target layout category
    let targetLayout = "public";
    if (routePath === "/teacher/login") targetLayout = "public";
    else if (routePath.startsWith("/teacher")) targetLayout = "teacher";
    else if (routePath.startsWith("/student")) targetLayout = "student";

    // ── PUBLIC & AUTH ROUTES ─────────────────────────────────────────────
    if (targetLayout === "public") {
        currentLayout = "public";
        if (routePath === "/login") {
            renderLogin(appEl);
        } else if (routePath === "/register" || routePath === "/signup") {
            renderRegister(appEl);
        } else if (routePath === "/teacher/login") {
            renderTeacherLogin(appEl);
        } else {
            renderWelcome(appEl);
        }
        return;
    }

    // ── STUDENT PORTAL ROUTES ───────────────────────────────────────────
    if (targetLayout === "student") {
        if (currentLayout !== "student" || !document.getElementById("student-content")) {
            renderStudentLayout(appEl, routePath);
            currentLayout = "student";
        }

        const contentEl = document.getElementById("student-content");
        if (!contentEl) return;

        // Update active student topbar nav links
        document.querySelectorAll(".student-nav-item, .student-mobile-nav-item").forEach(link => {
            const dataPath = link.getAttribute("data-path") || "";
            const href = link.getAttribute("href") || "";
            const path = dataPath || href.replace(/^#/, "");
            const isActive = path === "/student/post-test"
                ? routePath.startsWith("/student/post-test")
                : routePath === path || (path !== "/student/home" && routePath.startsWith(path + "/"));
            link.classList.toggle("active", isActive);
        });

        if (routePath.startsWith("/student/game-player") || routePath.startsWith("/student/game-play")) {
            await renderGamePlayer(contentEl);
        } else if (routePath === "/student/home") {
            await renderStudentHome(contentEl);
        } else if (routePath === "/student/dashboard") {
            await renderStudentDashboard(contentEl);
        } else if (routePath === "/student/pre-test") {
            await renderQuizLab(contentEl);
        } else if (routePath === "/student/error-analysis") {
            await renderErrorAnalysis(contentEl);
        } else if (routePath === "/student/games") {
            await renderGames(contentEl);
        } else if (routePath.startsWith("/student/post-test")) {
            await renderPostTest(contentEl);
        } else if (routePath === "/student/profile") {
            await renderProfile(contentEl);
        } else {
            await renderStudentHome(contentEl);
        }
        return;
    }

    // ── TEACHER / FACULTY ROUTES ─────────────────────────────────────────
    if (targetLayout === "teacher") {
        if (currentLayout !== "teacher" || !document.getElementById("teacher-content")) {
            renderTeacherLayout(appEl, routePath);
            currentLayout = "teacher";
        }

        const contentEl = document.getElementById("teacher-content");
        if (!contentEl) return;

        // Update active sidebar nav links
        document.querySelectorAll(".teacher-app-layout .sidebar-nav-link").forEach(link => {
            const href = link.getAttribute("href") || "";
            const path = href.replace(/^#/, "");
            link.classList.toggle("active", routePath.startsWith(path));
        });

        if (routePath === "/teacher/dashboard") {
            await renderTeacherDashboard(contentEl);
        } else if (routePath === "/teacher/questions/generate") {
            await renderQuestionBank(contentEl, { initialTab: "generate" });
        } else if (routePath === "/teacher/questions/pending") {
            await renderQuestionBank(contentEl, { initialTab: "pending" });
        } else if (routePath === "/teacher/questions/approved") {
            await renderQuestionBank(contentEl, { initialTab: "approved" });
        } else if (routePath === "/teacher/questions/rejected") {
            await renderQuestionBank(contentEl, { initialTab: "rejected" });
        } else if (routePath === "/teacher/analytics") {
            await renderMastery(contentEl);
        } else {
            await renderTeacherDashboard(contentEl);
        }
    }
}

// Global window event listeners
window.addEventListener("hashchange", handleNavigation);

document.addEventListener("DOMContentLoaded", () => {
    // Check if launched directly from a game module link
    const launchModule = new URLSearchParams(window.location.search).get("launchModule");
    if (launchModule) {
        window.location.hash = "#/student/games";
        handleNavigation().then(() => {
            launchModuleFromQuery(launchModule);
            window.history.replaceState({}, "", window.location.pathname + window.location.hash);
        });
        return;
    }

    // Auth change listener
    onAuthChange(() => {
        handleNavigation();
    });

    handleNavigation();
});