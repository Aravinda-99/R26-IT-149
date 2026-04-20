/**
 * Level12Scene — "String Restructuring: Advanced String Master" (Restructuring Phase)
 * ===================================================================================
 * Mechanic: Real-world string manipulation challenges
 * - Advanced operations: split, join, trim, slice
 * - Escape sequences & special characters
 * - String matching & pattern analysis
 * - Complex real-world scenarios (email validation, text processing, etc.)
 * - Score multipliers for consecutive correct answers
 *
 * Schema Theory: Restructuring — mastery through real-world application & complex scenarios
 */

import Phaser from "phaser";
import { GameManager } from "../../GameManager.js";
import { BadgeSystem } from "../../BadgeSystem.js";
import { ProgressTracker } from "../../ProgressTracker.js";

/* ───────── Constants ───────── */
const W = 800;
const H = 600;
const ACCURACY_THRESHOLD = 85;
const MAX_LIVES = 3;
const TARGET_CHALLENGES = 50;

/* ───────── Advanced Challenge Pools ───────── */
const SPLIT_CHALLENGES = [
  { string: '"Hello,World"', delimiter: '","', expected: '2', explanation: 'Splitting on comma creates 2 pieces' },
  { string: '"One Two Three"', delimiter: '" "', expected: '3', explanation: 'Splitting on space creates 3 parts' },
];

const JOIN_CHALLENGES = [
  { arr: '["Hello", "World"]', joiner: '" "', result: '"Hello World"', explanation: 'Join with space: Hello + World' },
  { arr: '["Java", "Script"]', joiner: '""', result: '"JavaScript"', explanation: 'Join with nothing = concatenation' },
];

const TRIM_CHALLENGES = [
  { string: '" Hello "', result: '"Hello"', explanation: 'trim() removes leading/trailing spaces' },
  { string: '"  Code  "', result: '"Code"', explanation: 'Whitespace on both sides removed' },
];

const SLICE_CHALLENGES = [
  { string: '"Hello"', start: "1", end: "4", result: '"ell"', explanation: 'Characters 1 to 3: "ell"' },
  { string: '"JavaScript"', start: "-6", end: undefined, result: '"Script"', explanation: 'Last 6 characters via negative index' },
];

const INCLUDES_CHALLENGES = [
  { string: '"Hello World"', search: '"World"', result: 'true', explanation: '"World" is contained in the string' },
  { string: '"Code"', search: '"code"', result: 'false', explanation: 'Case matters: "Code" ≠ "code"' },
];

const STARTSWITH_ENDSWITH_CHALLENGES = [
  { string: '"Hello World"', check: '"Hello"', type: 'starts', result: 'true', explanation: 'Starts with "Hello"? YES!' },
  { string: '"JavaScript"', check: '"Script"', type: 'ends', result: 'true', explanation: 'Ends with "Script"? YES!' },
  { string: '"Python"', check: '"Java"', type: 'starts', result: 'false', explanation: '"Python" does NOT start with "Java"' },
];

const REPEAT_CHALLENGES = [
  { string: '"Ha"', count: "3", result: '"HaHaHa"', explanation: 'Repeating "Ha" 3 times' },
  { string: '"*"', count: "5", result: '"*****"', explanation: 'Repeating "*" 5 times' },
];

const INDEXOF_CHALLENGES = [
  { string: '"Hello"', search: '"l"', result: "2", explanation: '"l" first appears at index 2' },
  { string: '"Code"', search: '"x"', result: "-1", explanation: '"x" not found returns -1' },
];

const REAL_WORLD_CHALLENGES = [
  { scenario: 'Email validation', input: '"user@example.com"', check: 'contains "@"?', result: 'true', explanation: 'Valid emails must have @ symbol' },
  { scenario: 'URL path', input: '"/api/users"', check: 'starts with "/"?', result: 'true', explanation: 'API paths typically start with /' },
  { scenario: 'Phone number', input: '"123-456-7890"', check: 'length', result: '12', explanation: 'This phone format is 12 characters' },
  { scenario: 'Username', input: '"john_doe"', check: 'includes "_"?', result: 'true', explanation: 'Underscore is allowed in usernames' },
  { scenario: 'CSV data', input: '"Name,Age,City"', check: 'split on ","', result: '3', explanation: 'CSV splits into 3 fields' },
];

const ESCAPE_SEQUENCE_CHALLENGES = [
  { seq: "'\\n'", meaning: "Newline", explanation: "Creates a line break" },
  { seq: "'\\t'", meaning: "Tab", explanation: "Creates horizontal spacing" },
  { seq: "'\\\\'", meaning: "Backslash", explanation: "Literal backslash character" },
  { seq: "'\\''", meaning: "Single Quote", explanation: "Escaped single quote" },
  { seq: "'\\\"'", meaning: "Double Quote", explanation: "Escaped double quote" },
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function lerpColor(a, b, t) {
  const ar = (a >> 16) & 0xff, ag = (a >> 8) & 0xff, ab = a & 0xff;
  const br = (b >> 16) & 0xff, bg = (b >> 8) & 0xff, bb = b & 0xff;
  return (Math.round(ar + (br - ar) * t) << 16) |
         (Math.round(ag + (bg - ag) * t) << 8) |
          Math.round(ab + (bb - ab) * t);
}

/* ═══════════════════════════════════════════════════════════════
 *  LEVEL 12 SCENE — Advanced String Master
 * ═══════════════════════════════════════════════════════════════ */
export class Level12Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level12Scene" });
  }

  create() {
    this.physics.world.gravity.y = 0;

    /* ── State ── */
    this.score = 0;
    this.lives = MAX_LIVES;
    this.combo = 0;
    this.maxCombo = 0;
    this.totalProcessed = 0;
    this.correctAnswers = 0;
    this.wrongAnswers = 0;
    this.waveNumber = 0;
    this.isComplete = false;
    this.gameStarted = false;
    this.startTime = 0;
    this.currentElements = [];
    this.currentChallenge = null;

    this._drawAdvancedBackground();
    this._generateTextures();
    this._createParticles();
    this._createHUD();

    const uiScene = this.scene.get("UIScene");
    if (uiScene && uiScene.setLevelLabel) {
      uiScene.setLevelLabel("Level 12: Restructuring — Advanced String Master!");
    }

    this._showInstruction();
  }

  /* ═══════════════════════════════════════════════════════════════
   *  ADVANCED BACKGROUND
   * ═══════════════════════════════════════════════════════════════ */
  _drawAdvancedBackground() {
    const gfx = this.add.graphics().setDepth(0);
    const top = 0x2a1a4e;
    const bot = 0x0f0f1f;
    for (let i = 0; i < 60; i++) {
      const t = i / 60;
      gfx.fillStyle(lerpColor(top, bot, t), 1);
      gfx.fillRect(0, Math.floor((H * i) / 60), W, Math.ceil(H / 60) + 1);
    }

    /* Neon grid */
    const gridGfx = this.add.graphics().setDepth(1).setAlpha(0.08);
    gridGfx.lineStyle(1, 0xff00ff, 1);
    for (let x = 0; x < W; x += 40) {
      gridGfx.beginPath(); gridGfx.moveTo(x, 0); gridGfx.lineTo(x, H); gridGfx.strokePath();
    }
    for (let y = 0; y < H; y += 40) {
      gridGfx.beginPath(); gridGfx.moveTo(0, y); gridGfx.lineTo(W, y); gridGfx.strokePath();
    }

    /* Pulsing tech nodes */
    for (let i = 0; i < 4; i++) {
      const nx = 100 + i * 200;
      const node = this.add.circle(nx, 50, 8, 0xff00ff, 0.1);
      this.tweens.add({
        targets: node,
        alpha: { from: 0.05, to: 0.2 },
        scale: { from: 1, to: 1.3 },
        duration: 2000,
        yoyo: true,
        repeat: -1,
      });
    }
  }

  /* ═══════════════════════════════════════════════════════════════
   *  TEXTURES & PARTICLES
   * ═══════════════════════════════════════════════════════════════ */
  _generateTextures() {
    const make = (name, color, r) => {
      if (this.textures.exists(name)) return;
      const g = this.add.graphics();
      g.fillStyle(color, 1);
      g.fillCircle(r, r, r);
      g.generateTexture(name, r * 2, r * 2);
      g.destroy();
    };
    make("greenSpark", 0x00ff88, 4);
    make("redSpark", 0xe74c3c, 4);
    make("magentaSpark", 0xff00ff, 4);
    make("cyanSpark", 0x00ffff, 4);
    make("confettiSpark", 0xffd700, 4);
  }

  _createParticles() {
    this.correctPart = this.add.particles(0, 0, "greenSpark", {
      speed: { min: 80, max: 250 },
      scale: { start: 1.2, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 700, blendMode: "ADD", emitting: false,
    }).setDepth(160);

    this.wrongPart = this.add.particles(0, 0, "redSpark", {
      speed: { min: 60, max: 180 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 500, blendMode: "ADD", emitting: false,
    }).setDepth(160);

    this.confettiPart = this.add.particles(0, 0, "confettiSpark", {
      speed: { min: 40, max: 180 },
      angle: { min: 230, max: 310 },
      scale: { start: 1, end: 0.3 },
      alpha: { start: 1, end: 0 },
      lifespan: 2500, gravityY: 120, emitting: false,
    }).setDepth(160);
  }

  /* ═══════════════════════════════════════════════════════════════
   *  HUD
   * ═══════════════════════════════════════════════════════════════ */
  _createHUD() {
    const dp = 100;

    this.add.rectangle(W / 2, 28, W, 50, 0x0a0a1a, 0.88).setDepth(dp - 1);
    this.add.rectangle(W / 2, 55, W, 1, 0xff00ff, 0.15).setDepth(dp - 1);

    this.scoreText = this.add.text(16, 12, "SCORE: 0", {
      fontFamily: "Courier New, monospace", fontSize: "15px",
      color: "#ff00ff", fontStyle: "bold",
    }).setDepth(dp);

    this.waveText = this.add.text(16, 35, "MASTER: 0 / 50", {
      fontFamily: "Courier New, monospace", fontSize: "11px", color: "#888888",
    }).setDepth(dp);

    this.progBg = this.add.rectangle(W / 2, 16, 240, 12, 0x1a1a2e, 0.8).setDepth(dp);
    this.progBg.setStrokeStyle(1, 0xff00ff, 0.3);
    this.progFill = this.add.rectangle(W / 2 - 120, 16, 0, 10, 0xff00ff, 0.7)
      .setOrigin(0, 0.5).setDepth(dp + 1);
    this.progText = this.add.text(W / 2, 16, "0 / 50", {
      fontFamily: "Courier New, monospace", fontSize: "9px",
      color: "#ffffff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(dp + 2);

    this.livesText = this.add.text(W - 16, 12, "♥♥♥", {
      fontFamily: "Arial", fontSize: "20px",
      color: "#ff4444", fontStyle: "bold",
    }).setOrigin(1, 0).setDepth(dp);

    this.accText = this.add.text(W - 16, 36, "ACC: 100%", {
      fontFamily: "Courier New, monospace", fontSize: "10px", color: "#888888",
    }).setOrigin(1, 0).setDepth(dp);

    this.tooltip = this.add.text(W / 2, 360, "", {
      fontFamily: "Courier New, monospace", fontSize: "12px",
      color: "#ffffff",
      backgroundColor: "rgba(10, 10, 26, 0.9)",
      padding: { x: 12, y: 6 },
      align: "center",
      wordWrap: { width: 580 },
    }).setOrigin(0.5).setAlpha(0).setDepth(dp + 10);

    this.timerBarBg = this.add.rectangle(W / 2, 160, 200, 8, 0x1a1a2e, 0.6).setDepth(dp);
    this.timerBarBg.setStrokeStyle(1, 0xff00ff, 0.2);
    this.timerBarFill = this.add.rectangle(W / 2 - 100, 160, 200, 6, 0xff00ff, 0.7)
      .setOrigin(0, 0.5).setDepth(dp + 1);
    this.timerBarBg.setAlpha(0);
    this.timerBarFill.setAlpha(0);
  }

  _updateHUD() {
    if (this.scoreText?.active) this.scoreText.setText(`SCORE: ${this.score}`);
    if (this.waveText?.active) this.waveText.setText(`MASTER: ${Math.min(this.totalProcessed, TARGET_CHALLENGES)} / ${TARGET_CHALLENGES}`);

    const pct = Math.min(this.totalProcessed / TARGET_CHALLENGES, 1);
    if (this.progFill?.active) {
      this.tweens.add({ targets: this.progFill, width: 240 * pct, duration: 200, ease: "Cubic.out" });
    }
    if (this.progText?.active) this.progText.setText(`${this.totalProcessed} / ${TARGET_CHALLENGES}`);

    if (this.livesText?.active) {
      let h = "";
      for (let i = 0; i < MAX_LIVES; i++) h += i < this.lives ? "♥" : "♡";
      this.livesText.setText(h);
    }

    const total = this.correctAnswers + this.wrongAnswers;
    const acc = total > 0 ? Math.round((this.correctAnswers / total) * 100) : 100;
    if (this.accText?.active) this.accText.setText(`ACC: ${acc}%`);
  }

  /* ═══════════════════════════════════════════════════════════════
   *  INSTRUCTION OVERLAY
   * ═══════════════════════════════════════════════════════════════ */
  _showInstruction() {
    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.88).setDepth(200);

    const panelG = this.add.graphics().setDepth(201);
    panelG.fillStyle(0x1a0a2a, 0.98);
    panelG.fillRoundedRect(W / 2 - 325, 15, 650, 555, 16);
    panelG.lineStyle(3, 0xff00ff);
    panelG.strokeRoundedRect(W / 2 - 325, 15, 650, 555, 16);

    const title = this.add.text(W / 2, 50, "🎓 MISSION 12: ADVANCED STRING MASTER", {
      fontFamily: "Arial Black, Arial, sans-serif",
      fontSize: "21px", color: "#ff00ff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(202);

    const sub = this.add.text(W / 2, 80, "Master advanced string operations & real-world scenarios", {
      fontFamily: "Arial", fontSize: "13px",
      color: "#00ffff", fontStyle: "italic",
    }).setOrigin(0.5).setDepth(202);

    const desc = this.add.text(W / 2, 185,
      "Complete 50 ADVANCED string challenges!\n\n" +
      "ADVANCED OPERATIONS:\n" +
      '• split() & join(): breaking/combining strings\n' +
      '• trim(), slice(): cleaning/extracting\n' +
      '• includes(), startsWith(), endsWith(): searching\n' +
      '• indexOf(), repeat(): finding, replicating\n' +
      '• Real-world scenarios: emails, URLs, parsing\n' +
      '• Escape sequences: \\n, \\t, \\\\, etc.\n\n' +
      "🎯 ULTIMATE CHALLENGE — Become a String Expert!",
      {
        fontFamily: "Courier New, monospace",
        fontSize: "10px", color: "#bdc3c7",
        align: "center", lineSpacing: 3.5,
      }
    ).setOrigin(0.5).setDepth(202);

    const goal = this.add.text(W / 2, 410, "Conquer 50 expert challenges with 85%+ accuracy\nto earn the ULTIMATE String Genius badge! 🎓", {
      fontFamily: "Arial", fontSize: "12px",
      color: "#f1c40f", align: "center", fontStyle: "bold", lineSpacing: 4,
    }).setOrigin(0.5).setDepth(202);

    const warn = this.add.text(W / 2, 455, "⚠ 3 lives — final exam difficulty!", {
      fontFamily: "Arial", fontSize: "11px", color: "#ff6b6b",
    }).setOrigin(0.5).setDepth(202);

    const btnBg = this.add.rectangle(W / 2, 500, 300, 50, 0x8B008B, 1).setDepth(202);
    btnBg.setStrokeStyle(2, 0xff00ff);
    const btnTxt = this.add.text(W / 2, 500, "COMMENCE MASTERY", {
      fontFamily: "Courier New, monospace",
      fontSize: "19px", color: "#00ffff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(203);

    btnBg.setInteractive({ useHandCursor: true });
    btnBg.on("pointerover", () => {
      btnBg.setFillStyle(0xff00ff);
      this.tweens.add({ targets: [btnBg, btnTxt], scaleX: 1.08, scaleY: 1.08, duration: 120 });
    });
    btnBg.on("pointerout", () => {
      btnBg.setFillStyle(0x8B008B);
      this.tweens.add({ targets: [btnBg, btnTxt], scaleX: 1, scaleY: 1, duration: 120 });
    });
    btnBg.on("pointerup", () => {
      [overlay, panelG, title, sub, desc, goal, warn, btnBg, btnTxt].forEach(e => e.destroy());
      this._startGame();
    });
  }

  /* ═══════════════════════════════════════════════════════════════
   *  START GAME
   * ═══════════════════════════════════════════════════════════════ */
  _startGame() {
    this.gameStarted = true;
    this.startTime = this.time.now;
    GameManager.set("lives", MAX_LIVES);
    this._nextChallenge();
  }

  /* ═══════════════════════════════════════════════════════════════
   *  CHALLENGE SYSTEM
   * ═══════════════════════════════════════════════════════════════ */
  _nextChallenge() {
    if (this.isComplete || this.totalProcessed >= TARGET_CHALLENGES) {
      this._levelComplete();
      return;
    }

    this.waveNumber++;
    this._clearCurrentElements();

    const types = ["split", "join", "trim", "slice", "includes", "startswith", "repeat", "indexof", "realworld", "escape"];
    const challengeType = pickRandom(types);

    switch (challengeType) {
      case "split": this._showSplitChallenge(); break;
      case "join": this._showJoinChallenge(); break;
      case "trim": this._showTrimChallenge(); break;
      case "slice": this._showSliceChallenge(); break;
      case "includes": this._showIncludesChallenge(); break;
      case "startswith": this._showStartsWithChallenge(); break;
      case "repeat": this._showRepeatChallenge(); break;
      case "indexof": this._showIndexOfChallenge(); break;
      case "realworld": this._showRealWorldChallenge(); break;
      case "escape": this._showEscapeChallenge(); break;
    }

    this._updateHUD();
  }

  _showSplitChallenge() {
    const q = pickRandom(SPLIT_CHALLENGES);
    this.currentChallenge = { type: "split", answer: q.expected };

    const title = this.add.text(W / 2, 110, "✂️ STRING SPLIT", {
      fontFamily: "Courier New, monospace", fontSize: "13px",
      color: "#ff00ff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(110);

    const problem = this.add.text(W / 2, 190, `${q.string}.split(${q.delimiter}).length = ?`, {
      fontFamily: "Courier New, monospace", fontSize: "18px",
      color: "#00ffff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(110);

    this.currentElements.push(title, problem);

    const options = [q.expected, "1", "0", "4"];
    const shuffled = Phaser.Utils.Array.Shuffle(options.slice());
    this._createChallengeButtons(shuffled, shuffled.indexOf(q.expected), q.explanation, 260);
  }

  _showJoinChallenge() {
    const q = pickRandom(JOIN_CHALLENGES);
    this.currentChallenge = { type: "join", answer: q.result };

    const title = this.add.text(W / 2, 110, "🔗 ARRAY JOIN", {
      fontFamily: "Courier New, monospace", fontSize: "13px",
      color: "#ff00ff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(110);

    const problem = this.add.text(W / 2, 190, `${q.arr}.join(${q.joiner}) = ?`, {
      fontFamily: "Courier New, monospace", fontSize: "18px",
      color: "#00ffff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(110);

    this.currentElements.push(title, problem);

    const options = [q.result, '""', "[]", q.arr];
    const shuffled = Phaser.Utils.Array.Shuffle(options.slice());
    this._createChallengeButtons(shuffled, shuffled.indexOf(q.result), q.explanation, 260);
  }

  _showTrimChallenge() {
    const q = pickRandom(TRIM_CHALLENGES);
    this.currentChallenge = { type: "trim", answer: q.result };

    const title = this.add.text(W / 2, 110, "🧹 TRIM WHITESPACE", {
      fontFamily: "Courier New, monospace", fontSize: "13px",
      color: "#ff00ff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(110);

    const problem = this.add.text(W / 2, 190, `${q.string}.trim() = ?`, {
      fontFamily: "Courier New, monospace", fontSize: "20px",
      color: "#00ffff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(110);

    this.currentElements.push(title, problem);

    const options = [q.result, q.string, '""', '"  "'];
    const shuffled = Phaser.Utils.Array.Shuffle(options.slice());
    this._createChallengeButtons(shuffled, shuffled.indexOf(q.result), q.explanation, 260);
  }

  _showSliceChallenge() {
    const q = pickRandom(SLICE_CHALLENGES);
    this.currentChallenge = { type: "slice", answer: q.result };

    const title = this.add.text(W / 2, 110, "🍰 STRING SLICE", {
      fontFamily: "Courier New, monospace", fontSize: "13px",
      color: "#ff00ff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(110);

    const endStr = q.end === undefined ? "" : `, ${q.end}`;
    const problem = this.add.text(W / 2, 190, `${q.string}.slice(${q.start}${endStr}) = ?`, {
      fontFamily: "Courier New, monospace", fontSize: "18px",
      color: "#00ffff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(110);

    this.currentElements.push(title, problem);

    const options = [q.result, '""', q.string, '"?"'];
    const shuffled = Phaser.Utils.Array.Shuffle(options.slice());
    this._createChallengeButtons(shuffled, shuffled.indexOf(q.result), q.explanation, 260);
  }

  _showIncludesChallenge() {
    const q = pickRandom(INCLUDES_CHALLENGES);
    const answer = q.result === 'true' ? "TRUE" : "FALSE";
    this.currentChallenge = { type: "includes", answer };

    const title = this.add.text(W / 2, 110, "🔍 INCLUDES CHECK", {
      fontFamily: "Courier New, monospace", fontSize: "13px",
      color: "#ff00ff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(110);

    const problem = this.add.text(W / 2, 190, `${q.string}.includes(${q.search}) = ?`, {
      fontFamily: "Courier New, monospace", fontSize: "18px",
      color: "#00ffff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(110);

    this.currentElements.push(title, problem);

    const options = ["TRUE", "FALSE"];
    this._createChallengeButtons(options, options.indexOf(answer), q.explanation, 260);
  }

  _showStartsWithChallenge() {
    const q = pickRandom(STARTSWITH_ENDSWITH_CHALLENGES);
    const answer = q.result === 'true' ? "TRUE" : "FALSE";
    const method = q.type === "starts" ? "startsWith" : "endsWith";
    this.currentChallenge = { type: "method", answer };

    const title = this.add.text(W / 2, 110, `🎯 ${method.toUpperCase()}`, {
      fontFamily: "Courier New, monospace", fontSize: "13px",
      color: "#ff00ff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(110);

    const problem = this.add.text(W / 2, 190, `${q.string}.${method}(${q.check}) = ?`, {
      fontFamily: "Courier New, monospace", fontSize: "16px",
      color: "#00ffff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(110);

    this.currentElements.push(title, problem);

    const options = ["TRUE", "FALSE"];
    this._createChallengeButtons(options, options.indexOf(answer), q.explanation, 260);
  }

  _showRepeatChallenge() {
    const q = pickRandom(REPEAT_CHALLENGES);
    this.currentChallenge = { type: "repeat", answer: q.result };

    const title = this.add.text(W / 2, 110, "🔁 REPEAT STRING", {
      fontFamily: "Courier New, monospace", fontSize: "13px",
      color: "#ff00ff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(110);

    const problem = this.add.text(W / 2, 190, `${q.string}.repeat(${q.count}) = ?`, {
      fontFamily: "Courier New, monospace", fontSize: "20px",
      color: "#00ffff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(110);

    this.currentElements.push(title, problem);

    const options = [q.result, q.string, '""', `${q.string} x ${q.count}`];
    const shuffled = Phaser.Utils.Array.Shuffle(options.slice());
    this._createChallengeButtons(shuffled, shuffled.indexOf(q.result), q.explanation, 260);
  }

  _showIndexOfChallenge() {
    const q = pickRandom(INDEXOF_CHALLENGES);
    this.currentChallenge = { type: "indexof", answer: q.result };

    const title = this.add.text(W / 2, 110, "📍 INDEX OF", {
      fontFamily: "Courier New, monospace", fontSize: "13px",
      color: "#ff00ff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(110);

    const problem = this.add.text(W / 2, 190, `${q.string}.indexOf(${q.search}) = ?`, {
      fontFamily: "Courier New, monospace", fontSize: "18px",
      color: "#00ffff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(110);

    this.currentElements.push(title, problem);

    const options = [q.result, "0", "1", "-1"];
    const shuffled = Phaser.Utils.Array.Shuffle(options.slice());
    this._createChallengeButtons(shuffled, shuffled.indexOf(q.result), q.explanation, 260);
  }

  _showRealWorldChallenge() {
    const q = pickRandom(REAL_WORLD_CHALLENGES);
    const answer = q.result === 'true' ? "YES" : q.result === 'false' ? "NO" : q.result;
    this.currentChallenge = { type: "realworld", answer };

    const title = this.add.text(W / 2, 110, `🌐 REAL-WORLD: ${q.scenario}`, {
      fontFamily: "Courier New, monospace", fontSize: "12px",
      color: "#ff00ff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(110);

    const problem = this.add.text(W / 2, 190, `Input: ${q.input}\n${q.check} = ?`, {
      fontFamily: "Courier New, monospace", fontSize: "16px",
      color: "#00ffff", fontStyle: "bold",
      align: "center",
    }).setOrigin(0.5).setDepth(110);

    this.currentElements.push(title, problem);

    let options;
    if (q.result === 'true') options = ["YES", "NO"];
    else if (q.result === 'false') options = ["NO", "YES"];
    else options = [q.result, "0", q.result === "12" ? "10" : "12"];

    const shuffled = Phaser.Utils.Array.Shuffle(options.slice());
    const correctIdx = shuffled.indexOf(answer === "YES" ? q.result === 'true' ? "YES" : "NO" : answer);
    this._createChallengeButtons(shuffled, correctIdx, q.explanation, 260);
  }

  _showEscapeChallenge() {
    const q = pickRandom(ESCAPE_SEQUENCE_CHALLENGES);
    this.currentChallenge = { type: "escape", answer: q.meaning };

    const title = this.add.text(W / 2, 110, "⚡ ESCAPE SEQUENCE", {
      fontFamily: "Courier New, monospace", fontSize: "13px",
      color: "#ff00ff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(110);

    const problem = this.add.text(W / 2, 190, `What does ${q.seq} produce?`, {
      fontFamily: "Courier New, monospace", fontSize: "20px",
      color: "#00ffff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(110);

    this.currentElements.push(title, problem);

    const allMeanings = ESCAPE_SEQUENCE_CHALLENGES.map(e => e.meaning);
    const options = [q.meaning, ...Phaser.Utils.Array.GetRandom(allMeanings, 3)];
    const shuffled = Phaser.Utils.Array.Shuffle(options.slice());
    this._createChallengeButtons(shuffled, shuffled.indexOf(q.meaning), q.explanation, 260);
  }

  /* ═══════════════════════════════════════════════════════════════
   *  CHALLENGE BUTTONS
   * ═══════════════════════════════════════════════════════════════ */
  _createChallengeButtons(options, correctIndex, explanation, yStart) {
    const btnW = 140;
    const btnH = 40;
    const cols = Math.min(options.length, 2);
    const gapX = 14;
    const gapY = 10;
    const totalW = cols * btnW + (cols - 1) * gapX;
    const startX = W / 2 - totalW / 2 + btnW / 2;

    const buttons = [];

    options.forEach((opt, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const bx = startX + col * (btnW + gapX);
      const by = yStart + row * (btnH + gapY);

      const bg = this.add.rectangle(bx, by, btnW, btnH, 0x1a0a2a, 0.9).setDepth(120);
      bg.setStrokeStyle(2, 0xff00ff, 0.4);

      const fontSize = opt.length > 12 ? "11px" : opt.length > 8 ? "12px" : "14px";
      const txt = this.add.text(bx, by, opt, {
        fontFamily: "Courier New, monospace", fontSize,
        color: "#00ffff", fontStyle: "bold",
        wordWrap: { width: btnW - 12 }, align: "center",
      }).setOrigin(0.5).setDepth(121);

      bg.setInteractive({ useHandCursor: true });
      bg.on("pointerover", () => {
        bg.setStrokeStyle(2, 0xff00ff, 1);
        this.tweens.add({ targets: [bg, txt], scaleX: 1.05, scaleY: 1.05, duration: 80 });
      });
      bg.on("pointerout", () => {
        bg.setStrokeStyle(2, 0xff00ff, 0.4);
        this.tweens.add({ targets: [bg, txt], scaleX: 1, scaleY: 1, duration: 80 });
      });
      bg.on("pointerup", () => {
        this._handleChallengeAnswer(i, correctIndex, explanation, buttons);
      });

      this.currentElements.push(bg, txt);
      buttons.push({ bg, txt, index: i });
    });

    this._startTimer(5000, () => this._onTimerExpired());
  }

  _handleChallengeAnswer(selected, correctIndex, explanation, allButtons) {
    this._stopTimer();
    const correct = selected === correctIndex;

    if (correct) {
      this._onCorrect(explanation, 30);
    } else {
      this._onWrong(explanation);
      if (this.lives <= 0) return;

      const correctBtn = allButtons.find(b => b.index === correctIndex);
      if (correctBtn) {
        correctBtn.bg.setFillStyle(0x004d40, 1);
        correctBtn.bg.setStrokeStyle(3, 0x00ff88, 1);
      }
    }

    this.totalProcessed++;
    this._updateHUD();
    this.time.delayedCall(correct ? 600 : 1200, () => this._nextChallenge());
  }

  /* ═══════════════════════════════════════════════════════════════
   *  CORRECT / WRONG
   * ═══════════════════════════════════════════════════════════════ */
  _onCorrect(message, basePoints) {
    this.correctAnswers++;
    this.combo++;
    if (this.combo > this.maxCombo) this.maxCombo = this.combo;

    const mult = this.combo >= 25 ? 5 : this.combo >= 15 ? 3 : this.combo >= 8 ? 2 : 1;
    const points = basePoints * mult;
    this.score += points;

    GameManager.addXP(points);
    GameManager.addScore(points);
    GameManager.addCombo();

    this.correctPart.emitParticleAt(W / 2, 270, 15);
    this._showPopup(W / 2, 240, `+${points}`, "#00ff88");
    this._showTooltip(message, "#00ff88");

    if ([8, 15, 25].includes(this.combo)) {
      this.cameras.main.flash(150, 255, 100, 255);
    }
  }

  _onWrong(message) {
    this.wrongAnswers++;
    this.combo = 0;
    this.lives--;

    GameManager.resetCombo();
    GameManager.loseLife();

    this.wrongPart.emitParticleAt(W / 2, 270, 12);
    this.cameras.main.shake(150, 0.012);
    this.cameras.main.flash(120, 255, 50, 0);

    this._showPopup(W / 2, 240, "WRONG!", "#ff4444");
    this._showTooltip(message, "#ff4444");

    if (this.lives <= 0) {
      this.time.delayedCall(600, () => this._gameOver());
    }
  }

  _onTimerExpired() {
    this._onWrong("⏰ Time expired!");
    if (this.lives <= 0) return;
    this.totalProcessed++;
  }

  /* ═══════════════════════════════════════════════════════════════
   *  TIMER MANAGEMENT
   * ═══════════════════════════════════════════════════════════════ */
  _startTimer(duration, onExpire) {
    this.timerBarBg.setAlpha(1);
    this.timerBarFill.setAlpha(1);
    this.timerBarFill.width = 200;

    if (this.timerBarTween) this.timerBarTween.destroy();
    this.timerBarTween = this.tweens.add({
      targets: this.timerBarFill,
      width: 0,
      duration,
      ease: "Linear",
      onUpdate: () => {
        const pct = this.timerBarFill.width / 200;
        if (pct < 0.2) this.timerBarFill.setFillStyle(0xff4444, 0.8);
        else if (pct < 0.5) this.timerBarFill.setFillStyle(0xffff00, 0.7);
      },
    });

    if (this.timerEvent) this.timerEvent.destroy();
    this.timerEvent = this.time.delayedCall(duration, onExpire);
  }

  _stopTimer() {
    if (this.timerBarTween) { this.timerBarTween.destroy(); this.timerBarTween = null; }
    if (this.timerEvent) { this.timerEvent.destroy(); this.timerEvent = null; }
    this.timerBarBg.setAlpha(0);
    this.timerBarFill.setAlpha(0);
  }

  /* ═══════════════════════════════════════════════════════════════
   *  UI HELPERS
   * ═══════════════════════════════════════════════════════════════ */
  _showPopup(x, y, text, color) {
    const popup = this.add.text(x, y, text, {
      fontFamily: "Courier New, monospace", fontSize: "20px",
      color, fontStyle: "bold",
      stroke: "#0a0a1a", strokeThickness: 2,
    }).setOrigin(0.5).setDepth(170);

    this.tweens.add({
      targets: popup, y: y - 50, alpha: 0,
      scaleX: 1.3, scaleY: 1.3, duration: 700, ease: "Cubic.out",
      onComplete: () => popup.destroy(),
    });
  }

  _showTooltip(text, color) {
    if (!this.tooltip?.active) return;
    this.tooltip.setText(text);
    this.tooltip.setColor(color || "#ffffff");
    this.tooltip.setAlpha(1);
    this.tweens.killTweensOf(this.tooltip);
    this.tweens.add({
      targets: this.tooltip, alpha: 0, delay: 1800, duration: 500,
    });
  }

  _clearCurrentElements() {
    this.currentElements.forEach(el => {
      if (el?.active) { this.tweens.killTweensOf(el); el.destroy(); }
    });
    this.currentElements = [];
  }

  /* ═══════════════════════════════════════════════════════════════
   *  LEVEL COMPLETE
   * ═══════════════════════════════════════════════════════════════ */
  _levelComplete() {
    this.isComplete = true;
    this._stopTimer();
    this._clearCurrentElements();

    const total = this.correctAnswers + this.wrongAnswers;
    const accuracy = total > 0 ? Math.round((this.correctAnswers / total) * 100) : 100;
    const passed = accuracy >= ACCURACY_THRESHOLD;

    const elapsed = Math.round((this.time.now - this.startTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    const timeStr = `${mins}:${secs.toString().padStart(2, "0")}`;

    if (passed) {
      GameManager.completeLevel(11, accuracy);
      BadgeSystem.unlock("string_genius");
      ProgressTracker.saveProgress(GameManager.getState());
      this.cameras.main.flash(800, 255, 100, 255);

      for (let i = 0; i < 12; i++) {
        this.time.delayedCall(i * 150, () => {
          this.confettiPart.emitParticleAt(
            Phaser.Math.Between(50, W - 50),
            Phaser.Math.Between(0, 100), 20
          );
        });
      }
    }

    this.time.delayedCall(passed ? 800 : 300, () => {
      this._showEndScreen(passed, accuracy, timeStr);
    });
  }

  _showEndScreen(passed, accuracy, timeStr) {
    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.9).setDepth(200);

    const panelG = this.add.graphics().setDepth(201);
    const panelColor = passed ? 0x1a0a2a : 0x4a1e1e;
    const borderColor = passed ? 0xff00ff : 0xe74c3c;
    panelG.fillStyle(panelColor, 0.97);
    panelG.fillRoundedRect(W / 2 - 310, 15, 620, 560, 16);
    panelG.lineStyle(3, borderColor);
    panelG.strokeRoundedRect(W / 2 - 310, 15, 620, 560, 16);

    const titleText = passed ? "🎓 ULTIMATE MASTERY UNLOCKED!" : "❌ ACCURACY INSUFFICIENT";
    const titleColor = passed ? "#ff00ff" : "#e74c3c";

    this.add.text(W / 2, 45, titleText, {
      fontFamily: "Arial Black, Arial, sans-serif", fontSize: "24px",
      color: titleColor, fontStyle: "bold",
    }).setOrigin(0.5).setDepth(202);

    let sy = 85;
    const stats = [
      `Challenges Mastered: ${this.totalProcessed} / ${TARGET_CHALLENGES}`,
      `Accuracy: ${accuracy}%`,
      `Final Score: ${this.score}`,
      `Total Time: ${timeStr}`,
      `Maximum Combo: ${this.maxCombo}x`,
      `Lives Remaining: ${this.lives} / ${MAX_LIVES}`,
    ];
    stats.forEach((s, i) => {
      this.add.text(W / 2, sy + i * 20, s, {
        fontFamily: "Courier New, monospace", fontSize: "12px", color: "#ecf0f1",
      }).setOrigin(0.5).setDepth(202);
    });

    sy += stats.length * 20 + 20;

    if (passed) {
      this.add.text(W / 2, sy, "🎓 ULTIMATE BADGE UNLOCKED: String Genius!", {
        fontFamily: "Arial Black", fontSize: "15px",
        color: "#ffd700", fontStyle: "bold",
      }).setOrigin(0.5).setDepth(202);
      sy += 30;

      const achievements = [
        "✅ Advanced string operations mastered",
        "✅ Split & join: breaking and combining",
        "✅ Trim, slice, substring: extraction",
        "✅ Search methods: includes, indexOf, etc.",
        "✅ Real-world scenarios: practical applications",
        "✅ Escape sequences: special characters",
        "✅ STRING DATA TYPE: COMPLETE MASTERY! 🏆",
      ];
      achievements.forEach((a, i) => {
        this.add.text(W / 2, sy + i * 16, a, {
          fontFamily: "Arial", fontSize: "10px",
          color: i === achievements.length - 1 ? "#ffd700" : "#bdc3c7",
          fontStyle: i === achievements.length - 1 ? "bold" : "normal",
        }).setOrigin(0.5).setDepth(202);
      });
    }

    const btnY = passed ? 510 : 460;
    if (passed) {
      this._createEndButton(W / 2 - 135, btnY, "VIEW RESULTS →", 0xff00ff, () => {
        this.scene.stop("UIScene");
        this.scene.start("MenuScene");
      });
      this._createEndButton(W / 2 + 135, btnY, "REPLAY", 0x8B008B, () => {
        GameManager.resetLevel();
        this.scene.restart();
      });
    } else {
      this._createEndButton(W / 2 - 100, btnY, "TRY AGAIN", 0xe74c3c, () => {
        GameManager.resetLevel();
        this.scene.restart();
      });
      this._createEndButton(W / 2 + 100, btnY, "MENU", 0x34495e, () => {
        this.scene.stop("UIScene");
        this.scene.start("MenuScene");
      });
    }
  }

  _createEndButton(x, y, text, color, callback) {
    const bg = this.add.rectangle(x, y, 210, 44, color, 1).setDepth(202);
    bg.setStrokeStyle(2, Phaser.Display.Color.IntegerToColor(color).brighten(30).color);
    const txt = this.add.text(x, y, text, {
      fontFamily: "Courier New, monospace", fontSize: "13px",
      color: "#ffffff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(203);

    bg.setInteractive({ useHandCursor: true });
    bg.on("pointerover", () => {
      this.tweens.add({ targets: [bg, txt], scaleX: 1.08, scaleY: 1.08, duration: 100 });
    });
    bg.on("pointerout", () => {
      this.tweens.add({ targets: [bg, txt], scaleX: 1, scaleY: 1, duration: 100 });
    });
    bg.on("pointerup", callback);
  }

  _gameOver() {
    this.isComplete = true;
    this._stopTimer();
    this._clearCurrentElements();

    this.cameras.main.shake(500, 0.02);
    this.cameras.main.flash(300, 255, 0, 0);

    this.time.delayedCall(600, () => {
      const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.9).setDepth(200);

      const panelG = this.add.graphics().setDepth(201);
      panelG.fillStyle(0x3a0000, 0.95);
      panelG.fillRoundedRect(W / 2 - 260, H / 2 - 160, 520, 320, 16);
      panelG.lineStyle(3, 0xe74c3c);
      panelG.strokeRoundedRect(W / 2 - 260, H / 2 - 160, 520, 320, 16);

      this.add.text(W / 2, H / 2 - 110, "💀 EXPERIMENT FAILED", {
        fontFamily: "Courier New, monospace", fontSize: "26px",
        color: "#e74c3c", fontStyle: "bold",
      }).setOrigin(0.5).setDepth(202);

      this.add.text(W / 2, H / 2 - 50, "All lives exhausted — mastery quest ended!", {
        fontFamily: "Courier New, monospace", fontSize: "12px", color: "#ff8888",
      }).setOrigin(0.5).setDepth(202);

      const total = this.correctAnswers + this.wrongAnswers;
      const acc = total > 0 ? Math.round((this.correctAnswers / total) * 100) : 0;

      this.add.text(W / 2, H / 2 + 10, [
        `Progress: ${this.totalProcessed} / ${TARGET_CHALLENGES} challenges`,
        `Correct: ${this.correctAnswers}  |  Wrong: ${this.wrongAnswers}`,
        `Accuracy: ${acc}%  |  Score: ${this.score}`,
      ].join("\n"), {
        fontFamily: "Courier New, monospace", fontSize: "10px",
        color: "#aaaaaa", align: "center", lineSpacing: 4,
      }).setOrigin(0.5).setDepth(202);

      this._createEndButton(W / 2 - 110, H / 2 + 100, "TRY AGAIN", 0xe74c3c, () => {
        GameManager.resetLevel();
        this.scene.restart();
      });
      this._createEndButton(W / 2 + 110, H / 2 + 100, "MENU", 0x34495e, () => {
        this.scene.stop("UIScene");
        this.scene.start("MenuScene");
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════════
   *  SHUTDOWN
   * ═══════════════════════════════════════════════════════════════ */
  shutdown() {
    this._stopTimer();
    this._clearCurrentElements();
  }
}
