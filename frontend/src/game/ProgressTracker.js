/**
 * ProgressTracker — Backend-mediated Persistence (with LocalStorage Fallback)
 * ==============================================================================
 * Saves and loads game progress via the Flask backend's
 * /api/gamification/state routes (backed by the Firebase Admin SDK).
 *
 * Resilience: if a backend save fails (network issue, quota limits, etc.),
 * we do NOT alert the user — we log a warning and stash the state under
 * `cq_pending_save_{uid}` in localStorage. The next loadProgress() call
 * recovers it, uses it as the authoritative state, and silently re-syncs
 * it with the backend in the background.
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

function pendingSaveKey(uid) {
  return `cq_pending_save_${uid}`;
}

export const ProgressTracker = {

  /**
   * Save the full game state. Falls back to localStorage (silently — no
   * alert()) if the backend write fails, so nothing is lost.
   */
  async saveProgress(state) {
    const uid = getCurrentUserId();
    if (!uid) return;

    const key = pendingSaveKey(uid);
    try {
      await GameStateAPI.saveState({ uid, state, savedAt: new Date().toISOString() });
      // Backend save succeeded — clear any stale fallback from an earlier
      // failed attempt so we don't resurrect old data on a future load.
      try { localStorage.removeItem(key); } catch { /* ignore */ }
    } catch (e) {
      console.warn("[ProgressTracker] Backend save failed — falling back to localStorage:", e);
      try {
        localStorage.setItem(key, JSON.stringify({ uid, state, savedAt: new Date().toISOString() }));
      } catch (storageErr) {
        console.error("[ProgressTracker] LocalStorage fallback also failed:", storageErr);
      }
    }
  },

  /**
   * Load progress from the backend, recovering and prioritizing any pending
   * local save left behind by a previously-failed saveProgress() call.
   */
  async loadProgress() {
    const uid = getCurrentUserId();
    if (!uid) return null;

    const key = pendingSaveKey(uid);

    // 1. Always try the backend first.
    let backendData = null;
    let backendReachable = true;
    try {
      backendData = await GameStateAPI.loadState(uid);
    } catch (e) {
      backendReachable = false;
      console.error("[ProgressTracker] Failed to load progress from backend:", e);
    }

    // 2. Check for a pending local save left behind by an earlier failed save.
    let pending = null;
    try {
      const raw = localStorage.getItem(key);
      if (raw) pending = JSON.parse(raw);
    } catch (e) {
      console.warn("[ProgressTracker] Failed to parse pending local save:", e);
    }

    if (pending && pending.state) {
      // A pending local save means the most recent save attempt failed —
      // it's more up to date than whatever the backend currently has, so
      // it wins. Use it now; silently re-sync it with the backend in the
      // background and only clear it once that actually succeeds.
      console.warn("[ProgressTracker] Recovered a pending local save (last backend save had failed) — using it and re-syncing in the background.");

      GameStateAPI.saveState({
        uid,
        state: pending.state,
        savedAt: pending.savedAt || new Date().toISOString(),
      }).then(() => {
        try { localStorage.removeItem(key); } catch { /* ignore */ }
        console.warn("[ProgressTracker] Pending local save re-synced with backend successfully.");
      }).catch((e) => {
        console.warn("[ProgressTracker] Re-sync of pending local save failed — will retry on next load:", e);
      });

      return pending.state;
    }

    // 3. No pending local save — trust the backend result.
    if (!backendReachable) return null;
    return backendData ? backendData.state : "NEW_USER";
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
    try { localStorage.removeItem(pendingSaveKey(uid)); } catch { /* ignore */ }
  },
};
