/**
 * ProgressTracker — Firebase / localStorage Persistence
 * ======================================================
 * Saves and loads game progress. Uses Firestore when authenticated,
 * falls back to localStorage otherwise.
 */

import { db, auth } from "../config/firebase.js";

let _firestore = null;
let _setDoc = null;
let _getDoc = null;
let _doc = null;

// Lazy-load Firestore methods to avoid blocking if Firebase isn't ready
async function ensureFirestore() {
  if (_setDoc) return true;
  try {
    const mod = await import("firebase/firestore");
    _setDoc = mod.setDoc;
    _getDoc = mod.getDoc;
    _doc = mod.doc;
    _firestore = db;
    return !!_firestore;
  } catch {
    return false;
  }
}

function getCurrentUserId() {
  try {
    return auth?.currentUser?.uid || null;
  } catch {
    return null;
  }
}

const STORAGE_KEY = "codequest_game_progress";

export const ProgressTracker = {

  /**
   * Save the full game state.
   */
  async saveProgress(state) {
    // Always save to localStorage first (instant)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...state,
        savedAt: Date.now(),
      }));
    } catch { /* quota exceeded — ignore */ }

    // Try Firestore
    const uid = getCurrentUserId();
    if (!uid) return;

    try {
      const ready = await ensureFirestore();
      if (!ready) return;
      await _setDoc(_doc(_firestore, "users", uid, "gameProgress", "integerModule"), {
        ...state,
        savedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (err) {
      console.warn("[ProgressTracker] Firestore save failed:", err.message);
    }
  },

  /**
   * Load progress — prefers Firestore, falls back to localStorage.
   */
  async loadProgress() {
    const uid = getCurrentUserId();

    // Try Firestore first
    if (uid) {
      try {
        const ready = await ensureFirestore();
        if (ready) {
          const snap = await _getDoc(_doc(_firestore, "users", uid, "gameProgress", "integerModule"));
          if (snap.exists()) return snap.data();
        }
      } catch (err) {
        console.warn("[ProgressTracker] Firestore load failed:", err.message);
      }
    }

    // Fallback: localStorage
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch { /* corrupted — ignore */ }

    return null;
  },

  /**
   * Calculate overall completion percentage across 3 levels.
   */
  getCompletionPercentage(state) {
    if (!state || !state.levelsCompleted) return 0;
    const done = state.levelsCompleted.filter(Boolean).length;
    return Math.round((done / 3) * 100);
  },

  /**
   * Clear all saved progress.
   */
  async clearProgress() {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }

    const uid = getCurrentUserId();
    if (!uid) return;

    try {
      const ready = await ensureFirestore();
      if (!ready) return;
      const { deleteDoc } = await import("firebase/firestore");
      await deleteDoc(_doc(_firestore, "users", uid, "gameProgress", "integerModule"));
    } catch { /* ignore */ }
  },
};
