/**
 * GameManager — Central State Manager
 * ====================================
 * Singleton that tracks all game state across scenes.
 * Uses a simple event-emitter pattern for cross-scene communication.
 */

const DEFAULT_STATE = {
  currentLevel: 0,       // 0 = menu, 1-12 = levels
  score: 0,
  xp: 0,
  lives: 3,
  maxLives: 3,
  combo: 0,
  levelsCompleted: [false, false, false, false, false, false, false, false, false, false, false, false],
  levelAccuracy: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  levelAttempts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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
    this.state = {
      ...DEFAULT_STATE,
      levelsCompleted: [false, false, false, false, false, false, false, false, false, false, false, false],
      levelAccuracy: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      levelAttempts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      badges: [],
    };
    this._emit("reset");
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
