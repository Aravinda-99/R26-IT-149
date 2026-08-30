/**
 * RoleGuard
 * =========
 * Route protection and role validation utility.
 */

import { getCurrentUser } from "../utils/auth.js";

export function checkRouteAccess(routePath) {
    const user = getCurrentUser();
    const role = user?.role || (user?.email?.includes("teacher") || user?.email?.includes("admin") ? "teacher" : "student");

    // Public routes are open to everyone
    if (
        routePath.startsWith("/welcome") ||
        routePath.startsWith("/login") ||
        routePath.startsWith("/register") ||
        routePath.startsWith("/signup") ||
        routePath === "/" ||
        routePath === ""
    ) {
        return { allowed: true };
    }

    // Unauthenticated access to protected routes
    if (!user) {
        return { allowed: false, redirectTo: "/login" };
    }

    // Teacher-only routes
    if (routePath.startsWith("/teacher")) {
        if (role !== "teacher" && role !== "admin") {
            return { allowed: false, redirectTo: "/student/dashboard", reason: "Student cannot access teacher workspace" };
        }
    }

    return { allowed: true };
}
