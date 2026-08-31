/**
 * RoleGuard
 * =========
 * Route protection and role validation utility.
 * Enforces strict role boundary separation:
 *   - Public auth pages (/login, /register, /signup, /teacher/login)
 *   - Student learning pages (Students only; teachers redirected to /teacher/dashboard)
 *   - Faculty workspace (Teachers/Admins only; students redirected to /student/home)
 */

import { getCurrentUser } from "../utils/auth.js";

export function checkRouteAccess(routePath) {
    const user = getCurrentUser();
    const role = user?.role || (user?.email?.includes("teacher") || user?.email?.includes("admin") ? "teacher" : "student");

    // Public authentication routes
    if (
        routePath === "/login" ||
        routePath === "/register" ||
        routePath === "/signup" ||
        routePath === "/teacher/login" ||
        routePath === "/" ||
        routePath === ""
    ) {
        return { allowed: true };
    }

    // Teacher/Admin attempts to access student routes
    if (routePath.startsWith("/student")) {
        if (user && (role === "teacher" || role === "admin")) {
            return { allowed: false, redirectTo: "/teacher/dashboard", reason: "Educators access the teacher dashboard" };
        }
        return { allowed: true };
    }

    // Student or unauthenticated user attempts to access teacher workspace
    if (routePath.startsWith("/teacher")) {
        if (!user) {
            return { allowed: false, redirectTo: "/teacher/login", reason: "Educator credentials required" };
        }
        if (role !== "teacher" && role !== "admin") {
            return { allowed: false, redirectTo: "/student/home", reason: "Students cannot access teacher workspace" };
        }
    }

    return { allowed: true };
}
