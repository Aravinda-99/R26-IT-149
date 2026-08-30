/**
 * Auth State Manager
 * ==================
 * Manages Firebase Auth state and local session fallback with role support.
 */

import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { GameManager } from "../game/GameManager.js";

let currentUser = null;
let authListeners = [];

// Initialize cached user from local storage
try {
    const saved = localStorage.getItem("codequest_user");
    if (saved) {
        currentUser = JSON.parse(saved);
    }
} catch (e) {
    console.warn("Failed to load local auth session:", e);
}

export function initAuthListener() {
    try {
        const auth = getAuth();
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                const role = (user.email && (user.email.includes("teacher") || user.email.includes("admin"))) ? "teacher" : "student";
                currentUser = {
                    uid: user.uid,
                    id: user.uid,
                    email: user.email,
                    displayName: user.displayName || user.email?.split("@")[0] || "Learner",
                    name: user.displayName || user.email?.split("@")[0] || "Learner",
                    role: role,
                    joinedAt: new Date().toISOString(),
                };
                localStorage.setItem("codequest_user", JSON.stringify(currentUser));
                await GameManager.syncWithFirebase();
            } else {
                if (!localStorage.getItem("codequest_user")) {
                    currentUser = null;
                    GameManager.resetAll();
                }
            }

            authListeners.forEach((cb) => cb(currentUser));
        });
    } catch (err) {
        console.warn("[Auth] Firebase auth listener unavailable (running in local mode):", err);
    }
}

export function onAuthChange(callback) {
    authListeners.push(callback);
    if (currentUser !== undefined) callback(currentUser);
}

export function getCurrentUser() {
    if (!currentUser) {
        try {
            const saved = localStorage.getItem("codequest_user");
            if (saved) currentUser = JSON.parse(saved);
        } catch (e) { }
    }
    return currentUser;
}

export function getUserRole() {
    const user = getCurrentUser();
    return user?.role || "student";
}

export function setCurrentUser(user) {
    currentUser = user;
    if (user) {
        localStorage.setItem("codequest_user", JSON.stringify(user));
    } else {
        localStorage.removeItem("codequest_user");
    }
    authListeners.forEach((cb) => cb(currentUser));
}

export async function logout() {
    try {
        const auth = getAuth();
        await signOut(auth);
    } catch (e) { }
    currentUser = null;
    localStorage.removeItem("codequest_user");
    authListeners.forEach((cb) => cb(null));
}

export async function getIdToken() {
    if (!currentUser) return null;
    if (currentUser.getIdToken) return currentUser.getIdToken();
    return "local-token";
}
