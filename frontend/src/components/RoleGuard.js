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
        return { status: "LOADING" };
    }

    const user = getCurrentUser();
    const role = getUserRole(user);
    const cleanRoute = (route || "").toLowerCase();

    // 1. Teacher & Admin Routes
    if (cleanRoute.startsWith("/teacher") || cleanRoute.startsWith("teacher/") || cleanRoute.startsWith("/admin")) {
        if (!user) {
            return { status: "REDIRECT", target: `/login?returnUrl=${encodeURIComponent(route)}` };
        }
        if (role !== "teacher" && role !== "admin") {
            return { status: "REDIRECT", target: "/student/dashboard" };
        }
        return { status: "AUTHORIZED", role };
    }

    // 2. Student Protected Routes
    if (cleanRoute.startsWith("/student") || cleanRoute.startsWith("student/")) {
        // If unauthenticated, demo access or redirect
        return { status: "AUTHORIZED", role: role || "student" };
    }

    // 3. Auth Routes (Login, Signup, Onboarding)
    if (cleanRoute === "/login" || cleanRoute === "/signup" || cleanRoute === "login" || cleanRoute === "signup") {
        if (user) {
            if (role === "teacher" || role === "admin") {
                return { status: "REDIRECT", target: "/teacher/dashboard" };
            } else {
                return { status: "REDIRECT", target: "/student/dashboard" };
            }
        }
        return { status: "AUTHORIZED", role: "guest" };
    }

    return { status: "AUTHORIZED", role: role || "student" };
}

export function renderLoadingScreen(container) {
    container.innerHTML = `
        <div style="min-height: 80vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--bg-app, #F8FAFC);">
            <div class="spinner" style="margin-bottom: 1.25rem;"></div>
            <div style="font-size: 0.95rem; font-weight: 600; color: var(--text-muted, #64748B);">
                Loading CodeQuest workspace...
            </div>
        </div>
    `;
}
