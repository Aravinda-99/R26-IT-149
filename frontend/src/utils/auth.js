/**
 * Auth State Manager
 * ==================
 * Manages authenticated user session, role resolution, and profile synchronization.
 */

import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { GameManager } from "../game/GameManager.js";
import { AuthAPI } from "../api/api.js";

let currentUser = null;
let authListeners = [];
let authInitialized = false;

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
 * Attaches auth initialization and returns a Promise that resolves once
 * whichever path actually applies (cached backend profile, or the Firebase
 * fallback) has fully settled — including GameManager.syncWithFirebase(),
 * so callers (main.js) never proceed to render before real gamification
 * state (XP/score/badges) has had a chance to load.
 */
export function initAuthListener() {
    return new Promise((resolve) => {
        // 1. If we have a cached user, verify/hydrate from the backend profile
        // and sync their gamification state. This is the PRIMARY path for
        // users authenticated via the custom backend auth system — they may
        // have no corresponding Firebase Auth session at all, so this can't
        // depend on onAuthStateChanged firing.
        if (currentUser?.uid || currentUser?.id) {
            const uid = currentUser.uid || currentUser.id;
            AuthAPI.getProfile(uid)
                .then(async (freshProfile) => {
                    if (freshProfile && (freshProfile.uid || freshProfile.id)) {
                        currentUser = { ...currentUser, ...freshProfile };
                        localStorage.setItem("codequest_user", JSON.stringify(currentUser));
                    }
                    await GameManager.syncWithFirebase();
                    authInitialized = true;
                    notifyListeners();
                    resolve(currentUser);
                })
                .catch(() => {
                    // Backend unreachable / profile fetch failed — don't hang
                    // the app waiting on it; resolve with whatever's cached.
                    authInitialized = true;
                    notifyListeners();
                    resolve(currentUser);
                });
        } else {
            // No cached session at all — nothing to hydrate or sync yet.
            // Resolve immediately rather than penalizing every logged-out
            // visit with the Firebase check's latency; the listener below
            // still runs and will notify/resolve again later if it turns
            // out there IS a real Firebase session (a resolved promise's
            // resolve() calls are harmless no-ops).
            authInitialized = true;
            resolve(currentUser);
        }

        // 2. Firebase Auth State Listener — kept as a fallback for accounts
        // that do have a real Firebase session (e.g. the legacy client-side
        // Firebase flow).
        try {
            const auth = getAuth();
            onAuthStateChanged(auth, async (user) => {
                if (user) {
                    try {
                        const profile = await AuthAPI.getProfile(user.uid);
                        if (profile && profile.uid) {
                            currentUser = profile;
                        } else {
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
                        }
                    } catch (e) {
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
                    }
                    localStorage.setItem("codequest_user", JSON.stringify(currentUser));
                    await GameManager.syncWithFirebase();
                } else {
                    if (!localStorage.getItem("codequest_user")) {
                        currentUser = null;
                        GameManager.resetAll();
                    }
                }

                notifyListeners();
                resolve(currentUser);
            });
        } catch (err) {
            // Firebase client SDK offline or uninitialized — the backend
            // path above is still what matters; just make sure we don't
            // leave the promise hanging if it somehow hasn't resolved yet.
            resolve(currentUser);
        }
    });
}

function notifyListeners() {
    authListeners.forEach((cb) => {
        try {
            cb(currentUser);
        } catch (e) {
            console.warn("Auth listener error:", e);
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
        } catch (e) {}
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
    notifyListeners();
}

export async function logout() {
    try {
        const auth = getAuth();
        await signOut(auth);
    } catch (e) {}
    currentUser = null;
    localStorage.removeItem("codequest_user");
    sessionStorage.clear();
    notifyListeners();
}

export async function getIdToken() {
    if (!currentUser) return null;
    if (currentUser.getIdToken) return currentUser.getIdToken();
    return `cq_token_${currentUser.uid || currentUser.id}`;
}
