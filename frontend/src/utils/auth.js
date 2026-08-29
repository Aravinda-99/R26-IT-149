/**
 * Auth State Manager
 * ==================
 * Manages custom backend auth state and provides current user info.
 */

import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { GameManager } from "../game/GameManager.js";

let currentUser = null;
let authListeners = [];

function notifyListeners() {
    authListeners.forEach((cb) => cb(currentUser));
}

export function initAuthListener() {
    // 1. Check custom backend login state first
    const storedUser = localStorage.getItem("codequest_user");
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
    }
    notifyListeners();

    // 2. Listen for custom auth events from our login/register pages
    window.addEventListener("custom_auth_change", () => {
        const storedUser = localStorage.getItem("codequest_user");
        currentUser = storedUser ? JSON.parse(storedUser) : null;
        notifyListeners();
    });

    // 3. Fallback/legacy Firebase Auth listener
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
        if (!localStorage.getItem("codequest_user")) {
            currentUser = user;
            if (user) {
                await GameManager.syncWithFirebase();
            } else {
                GameManager.resetAll();
            }
            notifyListeners();
        }
    });
}

export function onAuthChange(callback) {
    authListeners.push(callback);
    // Immediately call with current state
    if (currentUser !== undefined) callback(currentUser);
}

export function getCurrentUser() {
    return currentUser;
}

export async function logout() {
    // Clear custom backend auth
    localStorage.removeItem("codequest_user");
    
    // Clear Firebase Auth
    const auth = getAuth();
    try { await signOut(auth); } catch(e) {}
    
    currentUser = null;
    notifyListeners();
    GameManager.resetAll();
}

export async function getIdToken() {
    if (!currentUser) return null;
    // Note: Our custom auth currently doesn't use JWTs on the client side,
    // so we return the user ID or a mock token.
    if (currentUser.getIdToken) return currentUser.getIdToken();
    return currentUser.id || currentUser.user_id;
}
