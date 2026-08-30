/**
 * Main Entry Point — CodeQuest Adaptive Learning Platform
 * ========================================================
 * Dual-Role Learning Platform:
 * - Public Views (Welcome, Onboarding, Login, Signup)
 * - Student Adaptive LMS Interface (Home/Dashboard, Learning Path, Practice, Assessments, Progress, Profile)
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
import { renderWelcome } from "./pages/public/Welcome.js";
import { renderOnboarding } from "./pages/auth/Onboarding.js";
import { renderLogin } from "./pages/auth/Login.js";
import { renderSignup } from "./pages/auth/Signup.js";

// Student Adaptive Pages
import { renderStudentDashboard } from "./pages/student/StudentDashboard.js";
import { renderFocusArea } from "./pages/student/FocusArea.js";
import { renderLearningPath } from "./pages/student/LearningPath.js";
import { renderPractice } from "./pages/student/Practice.js";
import { renderAssessments } from "./pages/student/Assessments.js";
import { renderProgress } from "./pages/student/Progress.js";
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

    // 1. Public Routes
    if (r === "/welcome" || r === "welcome" || r === "/" || r === "") {
        return { layout: "public", render: (c) => renderWelcome(c, navigateTo) };
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

    // 3. Student Adaptive Routes
    if (r === "/student/dashboard" || r === "dashboard") {
        return { layout: "student", render: (c) => renderStudentDashboard(c, navigateTo) };
    }
    if (r === "/student/focus-area" || r === "/student/recommended-practice" || r === "focus-area" || r === "recommended-practice") {
        return { layout: "student", render: (c) => renderFocusArea(c, navigateTo) };
    }
    if (r === "/student/learning-path" || r === "learning-path" || r === "/student/modules" || r === "modules" || r === "/student/curriculum") {
        return { layout: "student", render: (c) => renderLearningPath(c, navigateTo) };
    }
    if (r === "/student/practice" || r === "practice") {
        return { layout: "student", render: (c) => renderPractice(c, navigateTo) };
    }
    if (r === "/student/assessments" || r === "assessments") {
        return { layout: "student", render: (c) => renderAssessments(c, navigateTo) };
    }
    if (r === "/student/progress" || r === "progress" || r === "/student/results") {
        return { layout: "student", render: (c) => renderProgress(c, navigateTo) };
    }
    if (r === "/student/profile" || r === "profile" || r === "/student/settings") {
        return { layout: "student", render: (c) => renderProfile(c, navigateTo) };
    }
    if (r === "/student/pre-test" || r === "/student/quiz" || r === "quiz-lab" || r === "/quiz-lab") {
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
                <div style="max-width: 500px; margin: 4rem auto; text-align: center; padding: 3rem 1.5rem; background: #FFFFFF; border-radius: var(--radius-md); border: 1px solid var(--border-main);">
                    <div style="font-size: 2.5rem; color: var(--text-muted); margin-bottom: 1rem;">
                        <i class="fa-solid fa-compass"></i>
                    </div>
                    <h2 style="font-size: 1.35rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem;">Page Not Found</h2>
                    <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.5rem;">The page you are looking for does not exist or has moved.</p>
                    <button class="btn btn-primary" onclick="window.navigateTo('/student/dashboard')">Return to Dashboard</button>
                </div>
            `;
        }
    };
}

/**
 * Main application router and state renderer.
 */
function renderApp() {
    const appEl = document.getElementById("app");
    const phaserContainer = document.getElementById("phaser-container");
    if (!appEl) return;

    // 1. Show global loading state while authenticating
    if (isAuthLoading()) {
        renderLoadingScreen(appEl);
        return;
    }

    // 2. Perform Role & Route Access Guarding
    const guard = checkRouteAccess(currentRoute);
    if (!guard.allowed && guard.redirectTo) {
        currentRoute = guard.redirectTo;
        window.history.replaceState({}, "", currentRoute);
    }

    const { layout, render } = resolveRoute(currentRoute);

    // 3. Handle Game Container Visibility (Phaser Canvas)
    const isGameRoute = currentRoute.includes("/student/games") || currentRoute === "games";
    if (phaserContainer) {
        if (isGameRoute) {
            phaserContainer.classList.remove("hidden");
        } else {
            phaserContainer.classList.add("hidden");
            disposeGames();
        }
    }

    // 4. Update body theme class based on active role & layout
    const userRole = getUserRole();
    document.body.classList.remove("theme-student", "theme-teacher", "theme-admin");
    if (layout === "teacher") {
        document.body.classList.add("theme-teacher");
    } else {
        document.body.classList.add("theme-student");
    }

    // 5. Render Selected Layout Shell
    if (layout === "public") {
        renderPublicLayout(appEl, currentRoute, render, navigateTo);
    } else if (layout === "teacher") {
        renderTeacherLayout(appEl, currentRoute, render, navigateTo);
    } else {
        renderStudentLayout(appEl, currentRoute, render, navigateTo);
    }
}

/**
 * Global Navigation Function
 */
export function navigateTo(route, params = {}) {
    currentRoute = route;
    currentParams = params;

    let url = route;
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) queryParams.set(k, String(v));
    });
    const qs = queryParams.toString();
    if (qs) url += `?${qs}`;

    window.history.pushState({ route, params }, "", url);
    window.scrollTo({ top: 0, behavior: "instant" });
    renderApp();
}

window.navigateTo = navigateTo;
window.__onNavigate = navigateTo;

// Handle browser Back / Forward buttons
window.addEventListener("popstate", (e) => {
    if (e.state && e.state.route) {
        currentRoute = e.state.route;
        currentParams = e.state.params || {};
    } else {
        currentRoute = window.location.pathname || "/welcome";
        const urlParams = new URLSearchParams(window.location.search);
        currentParams = Object.fromEntries(urlParams.entries());
    }
    renderApp();
});

// Reactively re-render when auth state resolves or changes
onAuthChange(() => {
    renderApp();
});

// Initial Route Hydration
const initialPath = window.location.pathname;
if (initialPath && initialPath !== "/") {
    currentRoute = initialPath;
    const urlParams = new URLSearchParams(window.location.search);
    currentParams = Object.fromEntries(urlParams.entries());
} else {
    currentRoute = "/welcome";
}

// Initial render
renderApp();