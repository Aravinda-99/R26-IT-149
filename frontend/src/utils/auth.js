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

export function initAuthListener() {
    // 1. If we have a cached user, verify and hydrate from backend profile
    if (currentUser?.uid || currentUser?.id) {
        const uid = currentUser.uid || currentUser.id;
        AuthAPI.getProfile(uid)
            .then((freshProfile) => {
                if (freshProfile && (freshProfile.uid || freshProfile.id)) {
                    currentUser = { ...currentUser, ...freshProfile };
                    localStorage.setItem("codequest_user", JSON.stringify(currentUser));
                }
                authInitialized = true;
                notifyListeners();
            })
            .catch(() => {
                authInitialized = true;
                notifyListeners();
            });
    } else {
        authInitialized = true;
    }

    // 2. Firebase Auth State Listener (if using Firebase client)
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
        });
    } catch (err) {
        // Firebase client SDK offline or uninitialized
    }
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
