/**
 * GameManager — Central State Manager
 * ====================================
 * Singleton that tracks all game state across scenes.
 * Uses a simple event-emitter pattern for cross-scene communication.
 */

import { ProgressTracker } from "./ProgressTracker.js";

const TOTAL_LEVELS = 45;

const DEFAULT_STATE = {
  currentLevel: 0,       // 0 = menu, 1-15 = levels
  score: 0,
  xp: 0,
  lives: 3,
  maxLives: 3,
  combo: 0,
  levelsCompleted: new Array(TOTAL_LEVELS).fill(false),
  levelAccuracy: new Array(TOTAL_LEVELS).fill(0),
  levelAttempts: new Array(TOTAL_LEVELS).fill(0),
  badges: [],
};

class _GameManager {
  constructor() {
    this.state = { ...DEFAULT_STATE };
    this._listeners = {};
  }

  // ── State Access ──────────────────────────────────────────────

  getState() {
    return { ...this.state };
  }

  get(key) {
    return this.state[key];
  }

  set(key, value) {
    this.state[key] = value;
    this._emit("stateChange", { key, value });
    this._emit(key, value);
  }

  // ── Game Actions ──────────────────────────────────────────────

  addXP(amount) {
    this.state.xp += amount;
    this._emit("xpChange", this.state.xp);
    this._emit("stateChange", { key: "xp", value: this.state.xp });
  }

  addScore(amount) {
    this.state.score += amount;
    this._emit("scoreChange", this.state.score);
    this._emit("stateChange", { key: "score", value: this.state.score });
  }

  loseLife() {
    this.state.lives = Math.max(0, this.state.lives - 1);
    this._emit("livesChange", this.state.lives);
    this._emit("stateChange", { key: "lives", value: this.state.lives });
    return this.state.lives;
  }

  addCombo() {
    this.state.combo++;
    this._emit("comboChange", this.state.combo);
    return this.state.combo;
  }

  resetCombo() {
    this.state.combo = 0;
    this._emit("comboChange", 0);
  }

  getComboMultiplier() {
    if (this.state.combo >= 5) return 3;
    if (this.state.combo >= 3) return 2;
    return 1;
  }

  completeLevel(levelIndex, accuracy) {
    this.state.levelsCompleted[levelIndex] = true;
    this.state.levelAccuracy[levelIndex] = Math.max(
      this.state.levelAccuracy[levelIndex],
      accuracy
    );
    this._emit("levelComplete", { levelIndex, accuracy });
    ProgressTracker.saveProgress(this.getState());
  }

  incrementAttempt(levelIndex) {
    this.state.levelAttempts[levelIndex]++;
  }

  isLevelUnlocked(levelIndex) {
    // DEV MODE: all levels unlocked for testing — set to false for production
    const DEV_MODE = true;
    if (DEV_MODE) return true;

    if (levelIndex === 0) return true;
    return this.state.levelsCompleted[levelIndex - 1];
  }

  resetLevel() {
    this.state.lives = this.state.maxLives;
    this.state.score = 0;
    this.state.combo = 0;
    this._emit("stateChange", { key: "lives", value: this.state.lives });
    this._emit("stateChange", { key: "score", value: this.state.score });
  }

  resetAll() {
    const currentActiveModule = this.state.activeModule;

    this.state = {
      ...DEFAULT_STATE,
      levelsCompleted: new Array(TOTAL_LEVELS).fill(false),
      levelAccuracy: new Array(TOTAL_LEVELS).fill(0),
      levelAttempts: new Array(TOTAL_LEVELS).fill(0),
      badges: [],
      activeModule: currentActiveModule,
    };
    this._emit("reset");
  }

  applyState(saved) {
    if (!saved) return;
    if (saved.levelsCompleted) {
      while (saved.levelsCompleted.length < TOTAL_LEVELS) saved.levelsCompleted.push(false);
      this.set("levelsCompleted", saved.levelsCompleted);
    }
    if (saved.levelAccuracy) {
      while (saved.levelAccuracy.length < TOTAL_LEVELS) saved.levelAccuracy.push(0);
      this.set("levelAccuracy", saved.levelAccuracy);
    }
    if (saved.levelAttempts) {
      while (saved.levelAttempts.length < TOTAL_LEVELS) saved.levelAttempts.push(0);
      this.set("levelAttempts", saved.levelAttempts);
    }
    this.set("xp", saved.xp || 0);
    this.set("score", saved.score || 0);
    this.set("badges", saved.badges || []);
    if (saved.currentLevel !== undefined) this.set("currentLevel", saved.currentLevel);
  }

  async syncWithFirebase() {
    // 1. Completely reset local state to ensure no old data carries over
    this.resetAll();

    // 2. Fetch from Firebase (now without localStorage fallback)
    const saved = await ProgressTracker.loadProgress();
    
    // 3. Handle data
    if (saved === "NEW_USER") {
      // Save default state immediately
      ProgressTracker.saveProgress(this.getState());
    } else if (saved) {
      // Apply fetched data
      this.applyState(saved);
    }
  }

  // ── Event System ──────────────────────────────────────────────

  on(event, callback) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(callback);
  }

  off(event, callback) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter(cb => cb !== callback);
  }

  _emit(event, data) {
    if (!this._listeners[event]) return;
    this._listeners[event].forEach(cb => cb(data));
  }
}

// Export singleton
export const GameManager = new _GameManager();
