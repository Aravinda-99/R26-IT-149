/**
 * Auth State Manager — CodeQuest Dual-Role Platform
 * ==================================================
 * Provides robust authentication against the real backend API,
 * role persistence, and loading synchronization to eliminate race conditions.
 */

import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { AuthAPI } from "../api/api.js";
import { GameManager } from "../game/GameManager.js";

const STORAGE_KEY_USER = "cq_auth_user";
const STORAGE_KEY_ROLE = "cq_auth_role";
const STORAGE_KEY_TOKEN = "cq_auth_token";
const STORAGE_KEY_ONBOARDED = "cq_onboarded_";

// Initial state hydrated synchronously from localStorage
let currentUser = null;
let currentRole = "student";
let currentToken = null;
let isLoading = true;
let profileLoaded = false;
let authListeners = [];

try {
    const cachedUser = localStorage.getItem(STORAGE_KEY_USER);
    const cachedRole = localStorage.getItem(STORAGE_KEY_ROLE);
    currentToken = localStorage.getItem(STORAGE_KEY_TOKEN);
    if (cachedUser) {
        currentUser = JSON.parse(cachedUser);
        currentRole = cachedRole || currentUser.role || "student";
    }
} catch {
    // Ignore localStorage parse errors
}

export function isAuthLoading() {
    return isLoading;
}

export function getCurrentUser() {
    return currentUser;
}

export function getUserRole(user = null) {
    const u = user || currentUser;
    if (!u) return "student";
    if (u.role) return u.role;
    if (u.email) {
        const em = u.email.toLowerCase().trim();
        if (em.startsWith("teacher@") || em.includes("teacher")) return "teacher";
        if (em.startsWith("admin@") || em.includes("admin")) return "admin";
    }
    return currentRole || "student";
}

export function hasCompletedOnboarding(userId = null) {
    const uid = userId || currentUser?.uid || currentUser?.id || "guest";
    if (currentUser?.onboardingCompleted) return true;
    try {
        const stored = localStorage.getItem(`${STORAGE_KEY_ONBOARDED}${uid}`);
        return stored === "true";
    } catch {
        return true;
    }
}

export function setOnboardingCompleted(userId = null, completed = true) {
    const uid = userId || currentUser?.uid || currentUser?.id || "guest";
    if (currentUser) {
        currentUser.onboardingCompleted = completed;
    }
    try {
        localStorage.setItem(`${STORAGE_KEY_ONBOARDED}${uid}`, String(completed));
    } catch {
        // Ignore storage error
    }
}

export function persistAuthState(user, role, token = null) {
    currentUser = user;
    currentRole = role;
    if (token) currentToken = token;
    window.__cqRole = role;

    try {
        if (user) {
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
            localStorage.setItem(STORAGE_KEY_ROLE, role);
            if (token) localStorage.setItem(STORAGE_KEY_TOKEN, token);
        } else {
            localStorage.removeItem(STORAGE_KEY_USER);
            localStorage.removeItem(STORAGE_KEY_ROLE);
            localStorage.removeItem(STORAGE_KEY_TOKEN);
        }
    } catch {
        // Ignore localStorage error
    }
}

function notifyListeners() {
    authListeners.forEach((cb) => {
        try {
            cb({
                user: currentUser,
                role: currentRole,
                loading: isLoading,
                profileLoaded,
            });
        } catch (e) {
            console.warn("[WARN] Auth listener error:", e);
        }
    });
}

export function onAuthChange(callback) {
    authListeners.push(callback);
    // Trigger immediately with current state
    callback({
        user: currentUser,
        role: currentRole,
        loading: isLoading,
        profileLoaded,
    });
}

export function initAuthListener() {
    try {
        const auth = getAuth();
        onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser && !currentUser) {
                const detectedRole = getUserRole(firebaseUser);
                const userObj = {
                    id: firebaseUser.uid,
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName || (detectedRole === "teacher" ? "Educator" : "Student"),
                    name: firebaseUser.displayName || (detectedRole === "teacher" ? "Educator" : "Student"),
                    role: detectedRole,
                    onboardingCompleted: hasCompletedOnboarding(firebaseUser.uid),
                };
                persistAuthState(userObj, detectedRole);

                try {
                    await GameManager.syncWithFirebase();
                } catch (e) {
                    console.warn("[WARN] Firebase game manager sync warning:", e);
                }
            }

            isLoading = false;
            profileLoaded = true;
            notifyListeners();
        });
    } catch (err) {
        console.warn("[WARN] Firebase Auth listener initialization fallback:", err);
        isLoading = false;
        profileLoaded = true;
        notifyListeners();
    }
}

export async function loginWithCredentials(email, password) {
    const cleanEmail = (email || "").toLowerCase().trim();

    // 1. Authenticate with real backend database API
    try {
        const res = await AuthAPI.login({ email: cleanEmail, password });
        if (res.success && res.user) {
            const role = res.user.role || "student";
            persistAuthState(res.user, role, res.token);
            isLoading = false;
            profileLoaded = true;
            notifyListeners();

            // Optional client Firebase Auth sync if available
            try {
                const auth = getAuth();
                await signInWithEmailAndPassword(auth, cleanEmail, password);
            } catch {}

            return { success: true, user: res.user };
        }
    } catch (apiErr) {
        // If real backend explicitly rejected credentials with 401
        if (apiErr.message.includes("401") || apiErr.message.includes("Invalid")) {
            return { success: false, error: "Invalid email or password. Please check your credentials." };
        }
        console.warn("[WARN] Backend login API error, checking Firebase Auth fallback:", apiErr.message);
    }

    // 2. Fallback to direct client Firebase Auth
    try {
        const auth = getAuth();
        const res = await signInWithEmailAndPassword(auth, cleanEmail, password);
        const role = getUserRole(res.user);
        const userObj = {
            id: res.user.uid,
            uid: res.user.uid,
            email: res.user.email,
            displayName: res.user.displayName || (role === "teacher" ? "Educator" : "Student"),
            name: res.user.displayName || (role === "teacher" ? "Educator" : "Student"),
            role: role,
            onboardingCompleted: hasCompletedOnboarding(res.user.uid),
        };
        persistAuthState(userObj, role);
        isLoading = false;
        profileLoaded = true;
        notifyListeners();
        return { success: true, user: userObj };
    } catch (fbErr) {
        return { success: false, error: "Invalid email or password. Please try again." };
    }
}

export async function logout() {
    try {
        const auth = getAuth();
        await signOut(auth);
    } catch {
        // Ignore offline error
    }
    persistAuthState(null, "student");
    isLoading = false;
    profileLoaded = true;
    notifyListeners();
}

export async function getIdToken() {
    if (currentToken) return currentToken;
    if (!currentUser) return null;
    return `token_${currentUser.id || currentUser.uid || "anon"}`;
}
