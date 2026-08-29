/**
 * Main Entry Point - CodeQuest LMS Platform
 * ==========================================
 * Dual-Role Learning Platform:
 * - Public Views (Welcome, Onboarding, Login, Signup)
 * - Student LMS Interface (StudentLayout: Dashboard, Modules, Practice, Diagnostic Quiz, PostTest, Profile)
 * - Educator & Admin Portal (TeacherLayout: Dashboard, Generation, Review, Question Bank, Analytics, Settings)
 */

import "./style.css";
import { initFirebase } from "./config/firebase.js";
import { 
    initAuthListener, 
    onAuthChange, 
    getCurrentUser, 
    getUserRole, 
    isAuthLoading 
} from "./utils/auth.js";
import { checkRouteAccess, renderLoadingScreen } from "./components/RoleGuard.js";

// Layouts
import { renderPublicLayout } from "./layouts/PublicLayout.js";
import { renderStudentLayout } from "./layouts/StudentLayout.js";
import { renderTeacherLayout } from "./layouts/TeacherLayout.js";

// Public Pages
import { renderOnboarding } from "./pages/auth/Onboarding.js";
import { renderLogin } from "./pages/login.js";
import { renderSignup } from "./pages/register.js";
import { renderLanding, disposeLanding } from "./pages/landing.js";

// Student Pages
import { renderStudentDashboard } from "./pages/student/StudentDashboard.js";
import { renderModules } from "./pages/student/Modules.js";
import { renderProfile } from "./pages/student/Profile.js";
import { renderPostTest } from "./pages/student/posttest.js";
import { renderQuizLab } from "./pages/quiz-lab.js";
import { renderGames, disposeGames, launchModuleFromQuery } from "./pages/games.js";
import { renderQuizResults } from "./pages/quiz-results.js";
import { renderQuizSummary } from "./pages/quiz-summary.js";

// Teacher Pages
import { renderTeacherDashboard } from "./pages/teacher/TeacherDashboard.js";
import { renderGenerateQuestions } from "./pages/teacher/GenerateQuestions.js";
import { renderPendingReview } from "./pages/teacher/PendingReview.js";
import { renderApprovedQuestionBank } from "./pages/teacher/ApprovedQuestionBank.js";
import { renderRejectedArchive } from "./pages/teacher/RejectedArchive.js";
import { renderPostTestAnalytics } from "./pages/teacher/PostTestAnalytics.js";
import { renderTeacherSettings } from "./pages/teacher/TeacherSettings.js";

// Initialize Firebase & Auth
initFirebase();
initAuthListener();

let currentRoute = "/welcome";
let currentParams = {};

/**
 * Maps normalized route strings to their respective layout and render handlers.
 */
function resolveRoute(route) {
    const r = (route || "/").toLowerCase().trim();

    // 1. Public Routes Ã¢â¬â student-friendly marketing landing at /
    if (r === "/welcome" || r === "welcome" || r === "/" || r === "" || r === "/landing" || r === "landing") {
        return { layout: "bare", render: (c) => renderLanding(c, navigateTo) };
    }
    if (r === "/onboarding" || r === "onboarding") {
        return { layout: "public", render: (c) => renderOnboarding(c, navigateTo) };
    }
    if (r === "/signup" || r === "signup" || r === "/register" || r === "register") {
        return { layout: "public", render: (c) => renderSignup(c, navigateTo) };
    }
    if (r === "/login" || r === "login" || r === "/forgot-password") {
        return { layout: "public", render: (c) => renderLogin(c, navigateTo) };
    }

    // 2. Teacher & Admin Routes
    if (r === "/teacher/dashboard" || r === "/admin/dashboard" || r === "teacher-dashboard" || r === "/teacher") {
        return { layout: "teacher", render: (c) => renderTeacherDashboard(c, navigateTo) };
    }
    if (r === "/teacher/questions/generate" || r === "teacher/question-generation") {
        return { layout: "teacher", render: (c) => renderGenerateQuestions(c, navigateTo) };
    }
    if (r === "/teacher/questions/pending" || r === "teacher/pending-review") {
        return { layout: "teacher", render: (c) => renderPendingReview(c, navigateTo) };
    }
    if (r === "/teacher/questions/approved" || r === "/teacher/question-bank" || r === "question-bank") {
        return { layout: "teacher", render: (c) => renderApprovedQuestionBank(c, navigateTo) };
    }
    if (r === "/teacher/questions/rejected") {
        return { layout: "teacher", render: (c) => renderRejectedArchive(c, navigateTo) };
    }
    if (r === "/teacher/analytics" || r === "teacher/post-test-analytics") {
        return { layout: "teacher", render: (c) => renderPostTestAnalytics(c, navigateTo) };
    }
    if (r === "/teacher/settings") {
        return { layout: "teacher", render: (c) => renderTeacherSettings(c, navigateTo) };
    }

    // 3. Student Routes
    if (r === "/student/dashboard" || r === "dashboard") {
        return { layout: "student", render: (c) => renderStudentDashboard(c, navigateTo) };
    }
    if (r === "/student/modules" || r === "modules" || r === "/student/curriculum") {
        return { layout: "student", render: (c) => renderModules(c, navigateTo) };
    }
    if (r === "/student/profile" || r === "profile" || r === "/student/settings") {
        return { layout: "student", render: (c) => renderProfile(c, navigateTo) };
    }
    if (r === "/student/pre-test" || r === "/student/quiz" || r === "quiz-lab") {
        return { layout: "student", render: (c) => renderQuizLab(c) };
    }
    if (r === "/student/games" || r === "games") {
        return { layout: "student", render: (c) => renderGames(c) };
    }
    if (r.startsWith("/student/post-test") || r === "post-test") {
        return { layout: "student", render: (c) => renderPostTest(c, currentParams, navigateTo) };
    }
    if (r === "quiz-results") {
        return { layout: "student", render: (c) => renderQuizResults(c) };
    }
    if (r === "quiz-summary") {
        return { layout: "student", render: (c) => renderQuizSummary(c) };
    }

    // Legacy Redirects (Redirects old demo/learning-journey paths directly to student dashboard)
    if (
        r === "/student/learn" || 
        r === "/student/lessons" || 
        r === "demo-flow" || 
        r === "/demo-flow" || 
        r === "/demo" || 
        r === "demo" || 
        r === "learning-path" ||
        r === "/flow" ||
        r === "/learning-journey" ||
        r === "/test-flow"
    ) {
        return { layout: "student", render: (c) => renderStudentDashboard(c, navigateTo) };
    }

    // Default 404 Fallback
    return {
        layout: "student",
        render: (c) => {
            c.innerHTML = `
                <div class="card" style="max-width: 500px; margin: 4rem auto; text-align: center; padding: 3rem 1.5rem; border-radius: var(--radius-md);">
                    <div style="font-size: 2.5rem; color: var(--text-muted); margin-bottom: 1rem;">
                        <i class="fa-solid fa-compass"></i>
                    </div>
                    <h2 style="font-size: 1.35rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.5rem;">Page Not Found</h2>
                    <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.5rem;">The page you are looking for does not exist or has moved.</p>
                    <button class="btn btn-primary" onclick="window.navigateTo('/student/dashboard')">Return to Dashboard</button>
                </div>
            `;
        }
    };
}

export function navigateTo(route, params = {}) {
    if (
        (currentRoute === "/student/games" || currentRoute === "games") &&
        route !== "/student/games" &&
        route !== "games"
    ) {
        try {
            disposeGames();
        } catch {}
    }

    // Clean landing full-bleed class when leaving
    if (
        (currentRoute === "/welcome" || currentRoute === "/" || currentRoute === "/landing") &&
        route !== "/welcome" &&
        route !== "/" &&
        route !== "/landing"
    ) {
        const appEl = document.getElementById("app");
        disposeLanding(appEl);
    }

    currentRoute = route.startsWith("/") ? route : `/${route}`;
    currentParams = params || {};

    // Update browser URL history without reloading
    try {
        if (window.location.pathname !== currentRoute) {
            window.history.pushState(currentParams, "", currentRoute);
        }
    } catch {}

    renderApp();
}

window.navigateTo = navigateTo;

function renderApp() {
    const appEl = document.getElementById("app");
    if (!appEl) return;

    // Check RoleGuard access
    const access = checkRouteAccess(currentRoute);

    if (access.status === "LOADING") {
        renderLoadingScreen(appEl);
        return;
    }

    if (access.status === "REDIRECT" && access.target) {
        currentRoute = access.target;
        try {
            window.history.replaceState({}, "", currentRoute);
        } catch {}
    }

    const routeInfo = resolveRoute(currentRoute);

    // Apply appropriate theme class to document body
    if (routeInfo.layout === "teacher") {
        document.body.className = "theme-teacher";
    } else if (routeInfo.layout === "public") {
        document.body.className = "theme-student";
    } else {
        document.body.className = "theme-student";
    }

    // Render Layout Container
    let contentContainer = null;
    if (routeInfo.layout === "teacher") {
        contentContainer = renderTeacherLayout(appEl, currentRoute, navigateTo);
    } else if (routeInfo.layout === "public") {
        contentContainer = renderPublicLayout(appEl, currentRoute, navigateTo);
    } else if (routeInfo.layout === "bare") {
        // Full-bleed pages (marketing landing) Ã¢â¬â no chrome layout
        appEl.innerHTML = "";
        contentContainer = appEl;
    } else {
        contentContainer = renderStudentLayout(appEl, currentRoute, navigateTo);
    }

    // Render Target Page View
    if (contentContainer && typeof routeInfo.render === "function") {
        routeInfo.render(contentContainer);
    }
}

// Global Browser Navigation Listener
window.addEventListener("popstate", () => {
    currentRoute = window.location.pathname || "/welcome";
    renderApp();
});

// Initialization on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
    console.log("[OK] CodeQuest LMS initialized");

    const pathname = window.location.pathname;
    if (pathname && pathname !== "/") {
        currentRoute = pathname;
    } else {
        const user = getCurrentUser();
        currentRoute = user ? "/student/dashboard" : "/welcome";
    }

    // Listen for auth state transitions
    onAuthChange(({ user, role, loading }) => {
        if (!loading) {
            renderApp();
        }
    });

    // Check query params for specific module launchers
    const launchModule = new URLSearchParams(window.location.search).get("launchModule");
    if (launchModule) {
        currentRoute = "/student/games";
        renderApp();
        launchModuleFromQuery(launchModule);
        window.history.replaceState({}, "", "/student/games");
        return;
    }

    renderApp();
});