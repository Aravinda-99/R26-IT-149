/**
 * Auth State Manager
 * ==================
 * Manages Firebase Auth state and provides current user info.
 */

import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { GameManager } from "../game/GameManager.js";

let currentUser = null;
let authListeners = [];

export function initAuthListener() {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
        currentUser = user;
        
        if (user) {
            await GameManager.syncWithFirebase();
        } else {
            GameManager.resetAll();
        }

        authListeners.forEach((cb) => cb(user));
    });
}

export function onAuthChange(callback) {
    authListeners.push(callback);
    if (currentUser !== undefined) callback(currentUser);
}

export function getCurrentUser() {
    return currentUser;
}

export async function logout() {
    const auth = getAuth();
    await signOut(auth);
    currentUser = null;
}

export async function getIdToken() {
    if (!currentUser) return null;
    return currentUser.getIdToken();
}
