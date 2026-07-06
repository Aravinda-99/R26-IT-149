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
  garden_keeper: {
    id: "garden_keeper",
    name: "Garden Keeper",
    emoji: "🌸",
    description: "Completed Level 10 — String Accretion (Message Garden)",
    level: 10,
    color: 0xf472b6,
  },
  assembly_master: {
    id: "assembly_master",
    name: "Assembly Master",
    emoji: "🏭",
    description: "Completed Level 11 — String Tuning (String.length() Ruler)",
    level: 11,
    color: 0x34d399,
  },
  string_master: {
    id: "string_master",
    name: "String Master",
    emoji: "🧪",
    description: "Completed Level 11 — String Tuning (String Lab)",
    level: 11,
    color: 0x34d399,
  },
  string_genius: {
    id: "string_genius",
    name: "String Genius",
    emoji: "🎓",
    description: "Completed Level 12 — String Restructuring (Advanced String Master)",
    level: 12,
    color: 0xfbbf24,
  },
  math_wizard: {
    id: "math_wizard",
    name: "Math Wizard",
    emoji: "🧙",
    description: "Completed Level 13 — Operators Accretion (Math Magic Academy)",
    level: 13,
    color: 0xff6b6b,
  },
  combat_calculator: {
    id: "combat_calculator",
    name: "Combat Calculator",
    emoji: "⚔️",
    description: "Completed Level 14 — Operators Tuning (Calculation Arena)",
    level: 14,
    color: 0xffa500,
  },
  code_master: {
    id: "code_master",
    name: "Code Master",
    emoji: "👑",
    description: "Completed Level 15 — Operators Restructuring (Code Builder Pro)",
    level: 15,
    color: 0xffd700,
  },
  loop_engineer: {
    id: "loop_engineer",
    name: "Loop Engineer",
    emoji: "🔄",
    description: "Completed Level 16 — For Loop Accretion (Loop Train Express)",
    level: 16,
    color: 0x14b8a6,
  },
  loop_detective: {
    id: "loop_detective",
    name: "Loop Detective",
    emoji: "🔁",
    description: "Completed Level 17 — For Loop Tuning (Iteration Arena)",
    level: 17,
    color: 0x0891b2,
  },
  loop_architect: {
    id: "loop_architect",
    name: "Loop Architect",
    emoji: "⚙",
    description: "Completed Level 18 — For Loop Restructuring (Loop Architect)",
    level: 18,
    color: 0x0891b2,
  },
  while_schema: {
    id: "while_schema",
    name: "While Schema",
    emoji: "∞",
    description: "Completed Level 19 — While Loop Accretion (Power Core Charger)",
    level: 19,
    color: 0x14b8a6,
  },
  loop_debugger: {
    id: "loop_debugger",
    name: "Loop Debugger",
    emoji: "⚡",
    description: "Completed Level 20 — While Loop Tuning (Debug Dimension)",
    level: 20,
    color: 0xff00ff,
  },
  stream_architect: {
    id: "stream_architect",
    name: "Stream Architect",
    emoji: "🌊",
    description: "Completed Level 21 — While Loop Restructuring (Data Stream Processor)",
    level: 21,
    color: 0x00e5ff,
  },
  array_schema: {
    id: "array_schema",
    name: "Array Schema",
    emoji: "🗃️",
    description: "Completed Level 22 — Array Accretion (Memory Vault)",
    level: 22,
    color: 0x06b6d4,
  },
  index_expert: {
    id: "index_expert",
    name: "Index Expert",
    emoji: "🎯",
    description: "Completed Level 23 — Array Tuning (Index Interceptor)",
    level: 23,
    color: 0x00e5ff,
  },
  array_smith: {
    id: "array_smith",
    name: "Array Smith",
    emoji: "⚒️",
    description: "Completed Level 24 — Array Restructuring (Array Forge)",
    level: 24,
    color: 0xff6e00,
  },
  length_schema: {
    id: "length_schema",
    name: "length() Schema",
    emoji: "🔍",
    description: "Completed Level 25 — String Methods Accretion (The Scan Chamber)",
    level: 25,
    color: 0x00e5ff,
  },
  length_schema_tuned: {
    id: "length_schema_tuned",
    name: "length() Schema Tuned",
    emoji: "🏭",
    description: "Completed Level 26 — String Methods Tuning (The Inspection Line)",
    level: 26,
    color: 0xffd740,
  },
  length_mastery: {
    id: "length_mastery",
    name: "length() Mastery",
    emoji: "⚙️",
    description: "Completed Level 27 — String Methods Restructuring (The Control Room). length() trilogy complete!",
    level: 27,
    color: 0xffd740,
  },
  charAt_schema: {
    id: "charAt_schema",
    name: "charAt() Schema",
    emoji: "🦾",
    description: "Completed Level 28 — String Methods Accretion (The Retrieval Claw)",
    level: 28,
    color: 0x8c7ae6,
  },
  charAt_schema_tuned: {
    id: "charAt_schema_tuned",
    name: "charAt() Schema Tuned",
    emoji: "🎖️",
    description: "Completed Level 29 — String Methods Tuning (The Claw Trials)",
    level: 29,
    color: 0x00e676,
  },
  charAt_mastery: {
    id: "charAt_mastery",
    name: "charAt() Mastery",
    emoji: "🔧",
    description: "Completed Level 30 — String Methods Restructuring (The Workshop). charAt() trilogy complete! String Access Wing complete.",
    level: 30,
    color: 0xffd740,
  },
  case_methods_schema: {
    id: "case_methods_schema",
    name: "Case Methods Schema",
    emoji: "🏭",
    description: "Completed Level 31 — String Methods Accretion (The Case Press)",
    level: 31,
    color: 0x8c7ae6,
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

    // Persist immediately via ProgressTracker
    const { ProgressTracker } = await import("./ProgressTracker.js");
    ProgressTracker.saveProgress(GameManager.getState());

    return true;
  },

  async loadBadges() {
    unlockedBadges.clear();
    const current = GameManager.get("badges") || [];
    current.forEach(id => unlockedBadges.add(id));
  },

  /**
   * Reset all badges (for testing).
   */
  resetAll() {
    unlockedBadges.clear();
  },
};
