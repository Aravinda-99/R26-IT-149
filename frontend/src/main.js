/**
 * Main Entry Point — CodeQuest Dual-Role Platform
 * ===============================================
 * Architecture:
 * - Student LMS Interface (theme-student, StudentLayout)
 * - Teacher & Admin Management Portal (theme-teacher, TeacherLayout)
 * - Public Auth & Onboarding (AuthLayout)
 * - RouteGuard with Refresh & Role Persistence
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
import { renderStudentLayout } from "./layouts/StudentLayout.js";
import { renderTeacherLayout } from "./layouts/TeacherLayout.js";
import { renderAuthLayout } from "./layouts/AuthLayout.js";

// Auth Pages
import { renderLogin } from "./pages/auth/Login.js";
import { renderSignup } from "./pages/auth/Signup.js";
import { renderOnboarding } from "./pages/auth/Onboarding.js";

// Student Pages
import { renderStudentDashboard } from "./pages/student/StudentDashboard.js";
import { renderPostTest } from "./pages/student/posttest.js";
import { renderQuizLab } from "./pages/quiz-lab.js";
import { renderGames, disposeGames, launchModuleFromQuery } from "./pages/games.js";
import { renderErrorAnalysis } from "./pages/error-analysis.js";
import { renderQuizResults } from "./pages/quiz-results.js";
import { renderQuizSummary } from "./pages/quiz-summary.js";
import { renderDemoFlow } from "./pages/demo-flow.js";

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

let currentRoute = "/student/dashboard";
let currentParams = {};

/**
 * Maps normalized route strings to their respective layout and render handlers.
 */
function resolveRoute(route) {
    const r = (route || "/").toLowerCase().trim();

    // 1. Public Auth Routes
    if (r === "/login" || r === "login") {
        return { layout: "auth", render: (c) => renderLogin(c, navigateTo) };
    }
    if (r === "/signup" || r === "signup" || r === "register") {
        return { layout: "auth", render: (c) => renderSignup(c, navigateTo) };
    }
    if (r === "/onboarding" || r === "onboarding") {
        return { layout: "auth", render: (c) => renderOnboarding(c, navigateTo) };
    }
    if (r === "/forgot-password") {
        return { layout: "auth", render: (c) => renderLogin(c, navigateTo) };
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
    if (r === "/student/dashboard" || r === "dashboard" || r === "/" || r === "") {
        return { layout: "student", render: (c) => renderStudentDashboard(c, navigateTo) };
    }
    if (r === "/student/pre-test" || r === "/student/quiz" || r === "quiz-lab") {
        return { layout: "student", render: (c) => renderQuizLab(c) };
    }
    if (r === "/student/games" || r === "games") {
        return { layout: "student", render: (c) => renderGames(c) };
    }
    if (r === "/student/errors" || r === "error-analysis") {
        return { layout: "student", render: (c) => renderErrorAnalysis(c) };
    }
    if (r === "/student/learn" || r === "/student/lessons" || r === "demo-flow" || r === "learning-path") {
        return { layout: "student", render: (c) => renderDemoFlow(c) };
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

    // Default Fallback
    return {
        layout: "student",
        render: (c) => {
            c.innerHTML = `
                <div class="card" style="max-width: 540px; margin: 4rem auto; text-align: center; padding: 3rem 1.5rem;">
                    <h2 style="font-size: 1.5rem; margin-bottom: 0.5rem;">Page Not Found</h2>
                    <p style="color: var(--text-muted); margin-bottom: 1.5rem;">The requested page path does not exist.</p>
                    <button class="btn btn-primary" onclick="window.navigateTo('/student/dashboard')">Return to Dashboard</button>
                </div>
            `;
        }
    };
}

export function navigateTo(route, params = {}) {
    if (currentRoute === "/student/games" && route !== "/student/games") {
        try {
            disposeGames();
        } catch {}
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
    } else {
        document.body.className = "theme-student";
    }

    // Render Layout Container
    let contentContainer = null;
    if (routeInfo.layout === "teacher") {
        contentContainer = renderTeacherLayout(appEl, currentRoute, navigateTo);
    } else if (routeInfo.layout === "auth") {
        contentContainer = renderAuthLayout(appEl);
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
    currentRoute = window.location.pathname || "/student/dashboard";
    renderApp();
});

// Initialization on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
    console.log("[OK] CodeQuest Dual-Role LMS initialized");

    // Capture initial route from pathname or default
    const pathname = window.location.pathname;
    if (pathname && pathname !== "/") {
        currentRoute = pathname;
    } else {
        currentRoute = "/student/dashboard";
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