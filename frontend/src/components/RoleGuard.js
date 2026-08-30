/**
 * RoleGuard Component — Route Authorization & Auth Hydration Protection
 * ======================================================================
 * Protects routes based on authenticated role and prevents premature
 * redirects while auth state is hydrating on page refresh.
 */

import { getCurrentUser, getUserRole, isAuthLoading } from "../utils/auth.js";

export function checkRouteAccess(route) {
    const loading = isAuthLoading();
    if (loading) {
        return { allowed: false, loading: true, status: "LOADING" };
    }

    const user = getCurrentUser();
    const role = getUserRole(user);
    const cleanRoute = (route || "").toLowerCase().trim();

    // 0. Root URL Handling
    if (cleanRoute === "/" || cleanRoute === "") {
        if (user) {
            if (role === "teacher" || role === "admin") {
                return { allowed: false, redirectTo: "/teacher/dashboard", target: "/teacher/dashboard", status: "REDIRECT" };
            } else {
                return { allowed: false, redirectTo: "/student/dashboard", target: "/student/dashboard", status: "REDIRECT" };
            }
        }
        return { allowed: false, redirectTo: "/welcome", target: "/welcome", status: "REDIRECT" };
    }

    // 1. Teacher & Admin Routes
    if (cleanRoute.startsWith("/teacher") || cleanRoute.startsWith("teacher/") || cleanRoute.startsWith("/admin")) {
        if (!user) {
            const redirectUrl = `/login?returnUrl=${encodeURIComponent(route)}`;
            return { allowed: false, redirectTo: redirectUrl, target: redirectUrl, status: "REDIRECT" };
        }
        if (role !== "teacher" && role !== "admin") {
            return { allowed: false, redirectTo: "/student/dashboard", target: "/student/dashboard", status: "REDIRECT" };
        }
        return { allowed: true, role, status: "AUTHORIZED" };
    }

    // 2. Public Auth Routes (Welcome, Onboarding, Login, Signup)
    if (
        cleanRoute === "/welcome" || 
        cleanRoute === "/onboarding" || 
        cleanRoute === "/login" || 
        cleanRoute === "/signup" || 
        cleanRoute === "/register" ||
        cleanRoute === "welcome" ||
        cleanRoute === "onboarding" ||
        cleanRoute === "login" ||
        cleanRoute === "signup" ||
        cleanRoute === "register"
    ) {
        if (user && cleanRoute !== "/welcome") {
            if (role === "teacher" || role === "admin") {
                return { allowed: false, redirectTo: "/teacher/dashboard", target: "/teacher/dashboard", status: "REDIRECT" };
            } else {
                return { allowed: false, redirectTo: "/student/dashboard", target: "/student/dashboard", status: "REDIRECT" };
            }
        }
        return { allowed: true, role: "guest", status: "AUTHORIZED" };
    }

    // 3. Student Protected Routes
    if (cleanRoute.startsWith("/student") || cleanRoute.startsWith("student/")) {
        return { allowed: true, role: role || "student", status: "AUTHORIZED" };
    }

    return { allowed: true, role: role || "student", status: "AUTHORIZED" };
}

export function renderLoadingScreen(container) {
    container.innerHTML = `
        <div style="min-height: 80vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #F8FAFC;">
            <div class="spinner" style="margin-bottom: 1.25rem;"></div>
            <div style="font-size: 0.95rem; font-weight: 600; color: #64748B;">
                Loading CodeQuest workspace...
            </div>
        </div>
    `;
}
