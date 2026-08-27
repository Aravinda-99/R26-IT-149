/**
 * Auth State Manager — CodeQuest Dual-Role Platform
 * ==================================================
 * Provides robust client-side authentication, role persistence,
 * and loading synchronization to eliminate race conditions on page refresh.
 */

import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { GameManager } from "../game/GameManager.js";

const STORAGE_KEY_USER = "cq_auth_user";
const STORAGE_KEY_ROLE = "cq_auth_role";
const STORAGE_KEY_ONBOARDED = "cq_onboarded_";

export const MOCK_USERS = {
    "student@codequest.lk": {
        uid: "MOCK_STUDENT_01",
        email: "student@codequest.lk",
        displayName: "Demo Student (S001)",
        role: "student",
        onboardingCompleted: true,
    },
    "teacher@codequest.lk": {
        uid: "MOCK_TEACHER_01",
        email: "teacher@codequest.lk",
        displayName: "Prof. Sarah Johnson",
        role: "teacher",
        onboardingCompleted: true,
    },
    "admin@codequest.lk": {
        uid: "MOCK_ADMIN_01",
        email: "admin@codequest.lk",
        displayName: "System Administrator",
        role: "admin",
        onboardingCompleted: true,
    },
};

// Initial state hydrated synchronously from localStorage
let currentUser = null;
let currentRole = "student";
let isLoading = true;
let profileLoaded = false;
let authListeners = [];

try {
    const cachedUser = localStorage.getItem(STORAGE_KEY_USER);
    const cachedRole = localStorage.getItem(STORAGE_KEY_ROLE);
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
    const uid = userId || currentUser?.uid || "guest";
    if (currentUser?.onboardingCompleted) return true;
    try {
        const stored = localStorage.getItem(`${STORAGE_KEY_ONBOARDED}${uid}`);
        return stored === "true";
    } catch {
        return true;
    }
}

export function setOnboardingCompleted(userId = null, completed = true) {
    const uid = userId || currentUser?.uid || "guest";
    if (currentUser) {
        currentUser.onboardingCompleted = completed;
    }
    try {
        localStorage.setItem(`${STORAGE_KEY_ONBOARDED}${uid}`, String(completed));
    } catch {
        // Ignore storage error
    }
}

function persistAuthState(user, role) {
    currentUser = user;
    currentRole = role;
    window.__cqRole = role;

    try {
        if (user) {
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
            localStorage.setItem(STORAGE_KEY_ROLE, role);
        } else {
            localStorage.removeItem(STORAGE_KEY_USER);
            localStorage.removeItem(STORAGE_KEY_ROLE);
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
            if (firebaseUser) {
                const detectedRole = getUserRole(firebaseUser);
                const userObj = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName || (detectedRole === "teacher" ? "Educator" : "Student"),
                    role: detectedRole,
                    onboardingCompleted: hasCompletedOnboarding(firebaseUser.uid),
                };
                persistAuthState(userObj, detectedRole);

                try {
                    await GameManager.syncWithFirebase();
                } catch (e) {
                    console.warn("[WARN] Firebase game manager sync warning:", e);
                }
            } else if (!currentUser || !currentUser.uid?.startsWith("MOCK_")) {
                // If not logged in via mock user, clear state
                persistAuthState(null, "student");
                GameManager.resetAll();
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

export async function loginWithMockUser(email, password) {
    const cleanEmail = (email || "").toLowerCase().trim();
    const mock = MOCK_USERS[cleanEmail];
    if (mock) {
        persistAuthState(mock, mock.role);
        isLoading = false;
        profileLoaded = true;
        notifyListeners();
        return { success: true, user: mock };
    }
    return { success: false, error: "Invalid mock credentials" };
}

export async function loginWithCredentials(email, password) {
    try {
        const auth = getAuth();
        const res = await signInWithEmailAndPassword(auth, email, password);
        const role = getUserRole(res.user);
        const userObj = {
            uid: res.user.uid,
            email: res.user.email,
            displayName: res.user.displayName || (role === "teacher" ? "Educator" : "Student"),
            role: role,
            onboardingCompleted: hasCompletedOnboarding(res.user.uid),
        };
        persistAuthState(userObj, role);
        isLoading = false;
        profileLoaded = true;
        notifyListeners();
        return { success: true, user: userObj };
    } catch (err) {
        // Check mock fallback for development demo
        return loginWithMockUser(email, password);
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
    if (!currentUser) return null;
    if (typeof currentUser.getIdToken === "function") {
        return currentUser.getIdToken();
    }
    return `mock_token_${currentUser.uid || "anon"}`;
}
