/**
 * RoleGuard
 * =========
 * Route protection and role validation utility.
 * Enforces strict role boundary separation:
 *   - Public auth pages (/login, /register, /signup, /teacher/login, /, /welcome)
 *   - Student learning pages (Authenticated students only; unauthenticated -> /login; educators -> /teacher/dashboard)
 *   - Faculty workspace (Authenticated teachers/admins only; unauthenticated -> /teacher/login; students -> /student/home)
 */

import { getCurrentUser } from "../utils/auth.js";

export function checkRouteAccess(routePath) {
    const user = getCurrentUser();
    const role = user?.role || "guest";

    // 1. Public authentication routes
    if (
        routePath === "/login" ||
        routePath === "/register" ||
        routePath === "/signup" ||
        routePath === "/teacher/login" ||
        routePath === "/" ||
        routePath === "" ||
        routePath === "/welcome"
    ) {
        return { allowed: true };
    }

    // 2. Student protected routes
    if (routePath.startsWith("/student")) {
        // Unauthenticated visitor -> redirect to student login
        if (!user) {
            return {
                allowed: false,
                redirectTo: "/login",
                reason: "Please sign in to access student learning."
            };
        }

        // Educators attempting to view student learner view -> redirect to educator workspace
        if (role === "teacher" || role === "admin") {
            return {
                allowed: false,
                redirectTo: "/teacher/dashboard",
                reason: "Educators access the teacher dashboard."
            };
        }

        // Authenticated student -> allowed
        return { allowed: true };
    }

    // 3. Teacher / Educator protected routes
    if (routePath.startsWith("/teacher")) {
        // Unauthenticated visitor -> redirect to teacher login
        if (!user) {
            return {
                allowed: false,
                redirectTo: "/teacher/login",
                reason: "Educator credentials required."
            };
        }

        // Students attempting to access teacher dashboard -> redirect to student home
        if (role !== "teacher" && role !== "admin") {
            return {
                allowed: false,
                redirectTo: "/student/home",
                reason: "Students cannot access educator workspace."
            };
        }

        // Authenticated educator -> allowed
        return { allowed: true };
    }

    return { allowed: true };
}
