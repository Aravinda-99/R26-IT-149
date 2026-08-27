/**
 * Auth State Manager
 * ==================
 * Manages Firebase Auth state and provides current user info.
 */

import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { GameManager } from "../game/GameManager.js";

let currentUser = null;
let authListeners = [];

const MOCK_USERS = {
    "teacher@codequest.lk": { email: "teacher@codequest.lk", displayName: "Teacher", role: "teacher", uid: "MOCK_TEACHER_01" },
    "admin@codequest.lk": { email: "admin@codequest.lk", displayName: "Admin", role: "admin", uid: "MOCK_ADMIN_01" },
    "student@codequest.lk": { email: "student@codequest.lk", displayName: "Student", role: "student", uid: "MOCK_STUDENT_01" },
};

export function getUserRole(user = null) {
    const u = user || currentUser;
    if (!u || !u.email) return "student";
    const email = u.email.toLowerCase().trim();
    if (email.startsWith("teacher@") || email.includes("teacher")) return "teacher";
    if (email.startsWith("admin@") || email.includes("admin")) return "admin";
    return "student";
}

export function initAuthListener() {
    try {
        const auth = getAuth();
        onAuthStateChanged(auth, async (user) => {
            currentUser = user;
            
            if (user) {
                try {
                    await GameManager.syncWithFirebase();
                } catch (e) {
                    console.warn("[WARN] Firebase sync error:", e);
                }
            } else {
                GameManager.resetAll();
            }

            authListeners.forEach((cb) => cb(user));
        });
    } catch (err) {
        console.warn("[WARN] Firebase Auth initialization error:", err);
    }
}

export function onAuthChange(callback) {
    authListeners.push(callback);
    if (currentUser !== undefined) callback(currentUser);
}

export function getCurrentUser() {
    return currentUser;
}

export async function loginWithMockUser(email, password) {
    const cleanEmail = email.toLowerCase().trim();
    const mock = MOCK_USERS[cleanEmail];
    if (mock) {
        currentUser = mock;
        window.__cqRole = mock.role;
        authListeners.forEach((cb) => cb(currentUser));
        return { success: true, user: currentUser };
    }
    return { success: false, error: "Invalid mock credentials" };
}

export async function logout() {
    try {
        const auth = getAuth();
        await signOut(auth);
    } catch {
        // Ignore offline signOut errors
    }
    currentUser = null;
    window.__cqRole = "student";
    authListeners.forEach((cb) => cb(null));
}

export async function getIdToken() {
    if (!currentUser) return null;
    if (typeof currentUser.getIdToken === "function") {
        return currentUser.getIdToken();
    }
    return `mock_token_${currentUser.uid || "anon"}`;
}

