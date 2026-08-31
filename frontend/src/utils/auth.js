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

/**
 * Attaches the Firebase auth-state listener and returns a Promise that
 * resolves once the FIRST onAuthStateChanged firing has fully settled —
 * including GameManager.syncWithFirebase() when a user is signed in.
 * Callers (main.js) should await this before their first page render, so
 * pages never paint GameManager's empty DEFAULT_STATE while the real
 * backend data is still in flight.
 */
export function initAuthListener() {
    return new Promise((resolve) => {
        let settled = false;
        const settle = () => {
            if (settled) return;
            settled = true;
            resolve(currentUser);
        };

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
                    // settle() only happens AFTER this fully finishes, so authReady
                    // never resolves with GameManager still at its empty defaults.
                    await GameManager.syncWithFirebase();
                    authListeners.forEach((cb) => cb(currentUser));
                    settle();
                } else if (localStorage.getItem("codequest_user")) {
                    // Firebase reporting "no user" here doesn't necessarily mean a
                    // real logout — on a fresh page load, onAuthStateChanged commonly
                    // fires once with a not-yet-resolved/null user BEFORE it finishes
                    // checking the persisted session and fires again with the real
                    // one. We have a cached session, so treat this as transient:
                    // don't touch currentUser, don't settle, don't notify listeners —
                    // just wait for the subsequent (real) firing. If no subsequent
                    // firing ever comes, main.js's own bounded timeout is the safety
                    // net that keeps the app from hanging forever.
                    return;
                } else {
                    // Genuinely logged out — no cached session either.
                    currentUser = null;
                    GameManager.resetAll();
                    authListeners.forEach((cb) => cb(currentUser));
                    settle();
                }
            });
        } catch (err) {
            console.warn("[Auth] Firebase auth listener unavailable (running in local mode):", err);
            settle();
        }
    });
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
