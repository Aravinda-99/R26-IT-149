/**
 * RoleGuard
 * =========
 * Route protection and role validation utility.
 * Student learning routes are open for learning exploration.
 * Faculty / Teacher workspace is strictly protected.
 */

import { getCurrentUser } from "../utils/auth.js";

export function checkRouteAccess(routePath) {
    const user = getCurrentUser();
    const role = user?.role || (user?.email?.includes("teacher") || user?.email?.includes("admin") ? "teacher" : "student");

    // Public auth routes
    if (
        routePath.startsWith("/login") ||
        routePath.startsWith("/register") ||
        routePath.startsWith("/signup") ||
        routePath === "/teacher/login" ||
        routePath.startsWith("/welcome") ||
        routePath === "/" ||
        routePath === ""
    ) {
        return { allowed: true };
    }

    // Student learning pages are open to all students & learners
    if (routePath.startsWith("/student")) {
        return { allowed: true };
    }

    // Teacher-only routes (excluding /teacher/login which was checked above)
    if (routePath.startsWith("/teacher")) {
        if (!user || (role !== "teacher" && role !== "admin")) {
            return { allowed: false, redirectTo: "/teacher/login", reason: "Faculty credentials required" };
        }
    }

    return { allowed: true };
}
