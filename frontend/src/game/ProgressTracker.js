/**
 * ProgressTracker — Backend-mediated Persistence
 * ================================================
 * Saves and loads game progress via the Flask backend's
 * /api/gamification/state routes (backed by the Firebase Admin SDK).
 * No direct Firebase client SDK usage — the backend owns Firestore access.
 */
import { GameStateAPI } from "../api/api.js";
import { getCurrentUser } from "../utils/auth.js";

function getCurrentUserId() {
  try {
    return getCurrentUser()?.uid || null;
  } catch {
    return null;
  }
}

export const ProgressTracker = {

  /**
   * Save the full game state.
   */
  async saveProgress(state) {
    const uid = getCurrentUserId();
    if (!uid) return;
    try {
      await GameStateAPI.saveState({ uid, state, savedAt: new Date().toISOString() });
    } catch (e) {
      console.error("[ProgressTracker] Failed to save progress to backend:", e);
    }
  },

  /**
   * Load progress from the backend.
   */
  async loadProgress() {
    const uid = getCurrentUserId();
    if (!uid) return null;
    try {
      const data = await GameStateAPI.loadState(uid);
      return data ? data.state : "NEW_USER";
    } catch (e) {
      console.error("[ProgressTracker] Failed to load progress from backend:", e);
      return null;
    }
  },

  /**
   * Calculate overall completion percentage across all levels.
   */
  getCompletionPercentage(state) {
    if (!state || !state.levelsCompleted) return 0;
    const done = state.levelsCompleted.filter(Boolean).length;
    const total = state.levelsCompleted.length || 6;
    return Math.round((done / total) * 100);
  },

  /**
   * Clear all saved progress (used by the Menu's "Reset" button).
   */
  async clearProgress() {
    const uid = getCurrentUserId();
    if (!uid) return;
    try {
      await GameStateAPI.deleteState(uid);
    } catch (e) {
      console.error("[ProgressTracker] Failed to clear progress on backend:", e);
    }
  },
};
