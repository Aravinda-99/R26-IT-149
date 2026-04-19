/**
 * BadgeSystem — Badge Unlock & Storage
 * =====================================
 * Manages the 3 achievement badges earned per level.
 * Persists to Firestore and provides unlock animation triggers.
 */

import { db, auth } from "../config/firebase.js";
import { GameManager } from "./GameManager.js";

// Badge definitions
export const BADGES = {
  integer_explorer: {
    id: "integer_explorer",
    name: "Integer Explorer",
    emoji: "🏆",
    description: "Completed Level 1 — Accretion Phase",
    level: 1,
    color: 0x4ade80,
  },
  math_warrior: {
    id: "math_warrior",
    name: "Math Warrior",
    emoji: "⚔️",
    description: "Completed Level 2 — Tuning Phase",
    level: 2,
    color: 0xf59e0b,
  },
  logic_master: {
    id: "logic_master",
    name: "Logic Master",
    emoji: "🧠",
    description: "Completed Level 3 — Restructuring Phase",
    level: 3,
    color: 0xa78bfa,
  },
  float_explorer: {
    id: "float_explorer",
    name: "Float Explorer",
    emoji: "🌊",
    description: "Completed Level 4 — Float Accretion Phase",
    level: 4,
    color: 0x00d4ff,
  },
  precision_master: {
    id: "precision_master",
    name: "Precision Master",
    emoji: "🔬",
    description: "Completed Level 5 — Float Tuning Phase",
    level: 5,
    color: 0x00bcd4,
  },
  calculation_wizard: {
    id: "calculation_wizard",
    name: "Calculation Wizard",
    emoji: "🧮",
    description: "Completed Level 6 — Float Restructuring Phase",
    level: 6,
    color: 0x4ade80,
  },
  char_explorer: {
    id: "char_explorer",
    name: "Char Explorer",
    emoji: "🌌",
    description: "Completed Level 7 — Char Accretion Phase",
    level: 7,
    color: 0xc084fc,
  },
  ascii_master: {
    id: "ascii_master",
    name: "ASCII Master",
    emoji: "🔤",
    description: "Completed Level 8 — Char Tuning Phase",
    level: 8,
    color: 0xf472b6,
  },
  char_wizard: {
    id: "char_wizard",
    name: "Char Champion",
    emoji: "⚔️",
    description: "Completed Level 9 — Char Quest (Restructuring)",
    level: 9,
    color: 0x818cf8,
  },
};

// In-memory cache of unlocked badges
let unlockedBadges = new Set();

export const BadgeSystem = {

  /**
   * Check if a badge is already unlocked.
   */
  isUnlocked(badgeId) {
    return unlockedBadges.has(badgeId);
  },

  /**
   * Get all unlocked badge IDs.
   */
  getUnlockedBadges() {
    return [...unlockedBadges];
  },

  /**
   * Get badge definition by ID.
   */
  getBadge(badgeId) {
    return BADGES[badgeId] || null;
  },

  /**
   * Unlock a badge — saves to Firestore and emits event.
   * Returns true if newly unlocked, false if already had it.
   */
  async unlock(badgeId) {
    if (unlockedBadges.has(badgeId)) return false;

    const badge = BADGES[badgeId];
    if (!badge) return false;

    unlockedBadges.add(badgeId);

    // Update GameManager state
    const current = GameManager.get("badges") || [];
    if (!current.includes(badgeId)) {
      GameManager.set("badges", [...current, badgeId]);
    }

    // Emit event for UIScene to display notification
    GameManager._emit("badgeUnlocked", badge);

    // Persist to Firestore
    try {
      const uid = auth?.currentUser?.uid;
      if (uid && db) {
        const { setDoc, doc } = await import("firebase/firestore");
        await setDoc(doc(db, "users", uid, "badges", badgeId), {
          ...badge,
          unlockedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn("[BadgeSystem] Firestore save failed:", err.message);
    }

    // Also persist in localStorage
    try {
      localStorage.setItem("codequest_badges", JSON.stringify([...unlockedBadges]));
    } catch { /* ignore */ }

    return true;
  },

  /**
   * Load badges from Firestore or localStorage.
   */
  async loadBadges() {
    // Try Firestore
    try {
      const uid = auth?.currentUser?.uid;
      if (uid && db) {
        const { collection, getDocs } = await import("firebase/firestore");
        const snap = await getDocs(collection(db, "users", uid, "badges"));
        snap.forEach(doc => unlockedBadges.add(doc.id));
        if (unlockedBadges.size > 0) return;
      }
    } catch { /* ignore */ }

    // Fallback: localStorage
    try {
      const raw = localStorage.getItem("codequest_badges");
      if (raw) {
        JSON.parse(raw).forEach(id => unlockedBadges.add(id));
      }
    } catch { /* ignore */ }
  },

  /**
   * Reset all badges (for testing).
   */
  resetAll() {
    unlockedBadges.clear();
    try { localStorage.removeItem("codequest_badges"); } catch { /* ignore */ }
  },
};
