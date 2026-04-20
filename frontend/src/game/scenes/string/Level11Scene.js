/**
 * Level11Scene — "String Tuning: String Lab Master" (Tuning Phase)
 * ===============================================================
 * Mechanic: Laboratory/workshop for string manipulation challenges
 * - Challenge-based progression with timed puzzles
 * - String operations: concatenation, length, charAt, substring
 * - Pattern recognition: string equality, case sensitivity
 * - Wave system with increasing difficulty
 * - Physics-based dragging elements to test strings
 *
 * Schema Theory: Tuning — deepening string understanding through repetition & challenges
 */

import Phaser from "phaser";
import { GameManager } from "../../GameManager.js";
import { BadgeSystem } from "../../BadgeSystem.js";
import { ProgressTracker } from "../../ProgressTracker.js";

/* ───────── Constants ───────── */
const W =800;
const H = 600;
const ACCURACY_THRESHOLD = 85;
const MAX_LIVES = 3;
const TARGET_CHALLENGES = 40;

/* ───────── Challenge Pools ───────── */
const CONCAT_CHALLENGES = [
  { part1: '"Hello"', part2: '" "', result: '"Hello "', explanation: "Concatenation: combining two strings with +" },
  { part1: '"Hi"', part2: '"!"', result: '"Hi!"', explanation: '"Hi" + "!" = "Hi!"' },
  { part1: '"Java"', part2: '"Script"', result: '"JavaScript"', explanation: 'Two strings joined: "Java" + "Script"' },
  { part1: '"2"', part2: '"024"', result: '"2024"', explanation: 'String concat: "2" + "024" = "2024"' },
];

const LENGTH_CHALLENGES = [
  { string: '"Hello"', length: "5", explanation: 'The string "Hello" contains 5 characters' },
  { string: '""', length: "0", explanation: 'Empty string has length 0' },
  { string: '"Hi!"', length: "3", explanation: 'Punctuation counts: "Hi!" has 3 characters' },
  { string: '" "', length: "1", explanation: 'Space counts as 1 character' },
  { string: '"Code123"', length: "8", explanation: 'Mix of letters and numbers: 8 total' },
];

const CHARAT_CHALLENGES = [
  { string: '"Hello"', index: "0", char: '"H"', explanation: 'Index 0 is the first character: "H"' },
  { string: '"Hello"', index: "4", char: '"o"', explanation: 'Index 4 is the last character: "o"' },
  { string: '"Java"', index: "1", char: '"a"', explanation: 'Character at index 1: "a"' },
  { string: '"Code"', index: "2", char: '"d"', explanation: 'Third character (index 2): "d"' },
];

const SUBSTRING_CHALLENGES = [
  { string: '"Hello"', start: "0", end: "3", result: '"Hel"', explanation: 'First 3 characters: "Hel"' },
  { string: '"World"', start: "1", end: "4", result: '"orl"', explanation: 'Characters 1-3: "orl"' },
  { string: '"JavaScript"', start: "4", end: "10", result: '"Script"', explanation: '"Script" from position 4 to 10' },
];

const EQUALITY_CHALLENGES = [
  { str1: '"hello"', str2: '"hello"', equal: true, explanation: 'Same strings are equal!' },
  { str1: '"Hello"', str2: '"hello"', equal: false, explanation: 'Case matters! "Hello" ≠ "hello"' },
  { str1: '"123"', str2: '"" + "123"', equal: true, explanation: 'Both represent the same string' },
  { str1: '"Hi"', str2: '"Hi "', equal: false, explanation: 'Space makes them different!' },
];

const UPPER_LOWER_CHALLENGES = [
  { string: '"Hello"', action: "uppercase", result: '"HELLO"', explanation: 'toUpperCase() makes all letters big' },
  { string: '"CODE"', action: "lowercase", result: '"code"', explanation: 'toLowerCase() makes all letters small' },
  { string: '"JavaScript"', action: "uppercase", result: '"JAVASCRIPT"', explanation: 'All to uppercase: "JAVASCRIPT"' },
];

const REPLACE_CHALLENGES = [
  { string: '"Hello World"', find: '"World"', replace: '"Universe"', result: '"Hello Universe"', explanation: 'Replace old string with new one' },
  { string: '"Cat"', find: '"C"', replace: '"c"', result: '"cat"', explanation: 'Replace "C" with "c"' },
];

/**
 * Helper: Pick random from array
 */
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
 *  LEVEL 11 SCENE — String Lab Master
 * ═══════════════════════════════════════════════════════════════ */
export class Level11Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level11Scene" });
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

    this._drawLabBackground();
    this._generateTextures();
    this._createParticles();
    this._createHUD();

    const uiScene = this.scene.get("UIScene");
    if (uiScene && uiScene.setLevelLabel) {
      uiScene.setLevelLabel("Level 11: Tuning — String Lab Master!");
    }

    this._showInstruction();
  }

  /* ═══════════════════════════════════════════════════════════════
   *  LAB BACKGROUND
   * ═══════════════════════════════════════════════════════════════ */
  _drawLabBackground() {
    const gfx = this.add.graphics().setDepth(0);
    const top = 0x1a1a3e;
    const bot = 0x0d0d1a;
    for (let i = 0; i < 60; i++) {
      const t = i / 60;
      gfx.fillStyle(lerpColor(top, bot, t), 1);
      gfx.fillRect(0, Math.floor((H * i) / 60), W, Math.ceil(H / 60) + 1);
    }

    /* Tech grid */
    const gridGfx = this.add.graphics().setDepth(1).setAlpha(0.05);
    gridGfx.lineStyle(1, 0x00ffff, 1);
    for (let x = 0; x < W; x += 50) {
      gridGfx.beginPath(); gridGfx.moveTo(x, 0); gridGfx.lineTo(x, H); gridGfx.strokePath();
    }
    for (let y = 0; y < H; y += 50) {
      gridGfx.beginPath(); gridGfx.moveTo(0, y); gridGfx.lineTo(W, y); gridGfx.strokePath();
    }

    /* Lab stations (shimmer effects) */
    for (let i = 0; i < 3; i++) {
      const cx = 120 + i * 280;
      const stationLabel = this.add.text(cx, 30, ["CONCAT LAB", "ANALYSIS LAB", "TRANSFORM LAB"][i], {
        fontFamily: "Courier New, monospace",
        fontSize: "10px",
        color: "#00ffff",
        fontStyle: "bold",
      }).setOrigin(0.5).setAlpha(0.3).setDepth(2);

      this.tweens.add({
        targets: stationLabel,
        alpha: { from: 0.2, to: 0.4 },
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
    make("cyanSpark", 0x00ffff, 4);
    make("goldSpark", 0xffd700, 4);
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
    this.add.rectangle(W / 2, 55, W, 1, 0x00ffff, 0.15).setDepth(dp - 1);

    this.scoreText = this.add.text(16, 12, "SCORE: 0", {
      fontFamily: "Courier New, monospace", fontSize: "15px",
      color: "#00ffff", fontStyle: "bold",
    }).setDepth(dp);

    this.waveText = this.add.text(16, 35, "CHALLENGE: 0 / 40", {
      fontFamily: "Courier New, monospace", fontSize: "11px", color: "#888888",
    }).setDepth(dp);

    this.progBg = this.add.rectangle(W / 2, 16, 240, 12, 0x1a1a2e, 0.8).setDepth(dp);
    this.progBg.setStrokeStyle(1, 0x00ffff, 0.3);
    this.progFill = this.add.rectangle(W / 2 - 120, 16, 0, 10, 0x00ffff, 0.7)
      .setOrigin(0, 0.5).setDepth(dp + 1);
    this.progText = this.add.text(W / 2, 16, "0 / 40", {
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
      fontFamily: "Courier New, monospace", fontSize: "13px",
      color: "#ffffff",
      backgroundColor: "rgba(10, 10, 26, 0.9)",
      padding: { x: 14, y: 6 },
      align: "center",
      wordWrap: { width: 550 },
    }).setOrigin(0.5).setAlpha(0).setDepth(dp + 10);

    this.timerBarBg = this.add.rectangle(W / 2, 160, 200, 8, 0x1a1a2e, 0.6).setDepth(dp);
    this.timerBarBg.setStrokeStyle(1, 0x00ffff, 0.2);
    this.timerBarFill = this.add.rectangle(W / 2 - 100, 160, 200, 6, 0x00ffff, 0.7)
      .setOrigin(0, 0.5).setDepth(dp + 1);
    this.timerBarBg.setAlpha(0);
    this.timerBarFill.setAlpha(0);
  }

  _updateHUD() {
    if (this.scoreText?.active) this.scoreText.setText(`SCORE: ${this.score}`);
    if (this.waveText?.active) this.waveText.setText(`CHALLENGE: ${Math.min(this.totalProcessed, TARGET_CHALLENGES)} / ${TARGET_CHALLENGES}`);

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
    panelG.fillStyle(0x0d1b2a, 0.98);
    panelG.fillRoundedRect(W / 2 - 320, 20, 640, 540, 16);
    panelG.lineStyle(3, 0x00ffff);
    panelG.strokeRoundedRect(W / 2 - 320, 20, 640, 540, 16);

    const title = this.add.text(W / 2, 55, "🧪 MISSION 11: STRING LAB MASTER", {
      fontFamily: "Arial Black, Arial, sans-serif",
      fontSize: "22px", color: "#00ffff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(202);

    const sub = this.add.text(W / 2, 85, "Master string manipulation & operations", {
      fontFamily: "Arial", fontSize: "14px",
      color: "#818cf8", fontStyle: "italic",
    }).setOrigin(0.5).setDepth(202);

    const desc = this.add.text(W / 2, 195,
      "Complete 40 string challenges!\n\n" +
      "OPERATIONS TESTED:\n" +
      '• Concatenation: "Hi" + "!" = "Hi!"\n' +
      '• Length: "Hello".length = 5\n' +
      '• Character Access: charAt(0), substring()\n' +
      '• Case: toUpperCase(), toLowerCase()\n' +
      '• Comparison: "hello" ≠ "Hello"\n' +
      "• Replace: replace old with new\n\n" +
      "⚠ 3 lives — wrong answers cost lives!",
      {
        fontFamily: "Courier New, monospace",
        fontSize: "11px", color: "#bdc3c7",
        align: "center", lineSpacing: 4,
      }
    ).setOrigin(0.5).setDepth(202);

    const goal = this.add.text(W / 2, 405, "Complete 40 challenges with 85%+ accuracy\nto earn the String Master badge! 🧪", {
      fontFamily: "Arial", fontSize: "12px",
      color: "#f1c40f", align: "center", fontStyle: "bold", lineSpacing: 4,
    }).setOrigin(0.5).setDepth(202);

    const btnBg = this.add.rectangle(W / 2, 465, 280, 48, 0x1a3a5e, 1).setDepth(202);
    btnBg.setStrokeStyle(2, 0x00ffff);
    const btnTxt = this.add.text(W / 2, 465, "BEGIN EXPERIMENTS", {
      fontFamily: "Courier New, monospace",
      fontSize: "18px", color: "#00ffff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(203);

    btnBg.setInteractive({ useHandCursor: true });
    btnBg.on("pointerover", () => {
      btnBg.setFillStyle(0x00ffff);
      this.tweens.add({ targets: [btnBg, btnTxt], scaleX: 1.08, scaleY: 1.08, duration: 120 });
    });
    btnBg.on("pointerout", () => {
      btnBg.setFillStyle(0x1a3a5e);
      this.tweens.add({ targets: [btnBg, btnTxt], scaleX: 1, scaleY: 1, duration: 120 });
    });
    btnBg.on("pointerup", () => {
      [overlay, panelG, title, sub, desc, goal, btnBg, btnTxt].forEach(e => e.destroy());
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

    const challengeType = ["concat", "length", "charAt", "substring", "equality", "upperLower", "replace"][
      Math.floor(Math.random() * 7)
    ];

    switch (challengeType) {
      case "concat": this._showConcatChallenge(); break;
      case "length": this._showLengthChallenge(); break;
      case "charAt": this._showCharAtChallenge(); break;
      case "substring": this._showSubstringChallenge(); break;
      case "equality": this._showEqualityChallenge(); break;
      case "upperLower": this._showUpperLowerChallenge(); break;
      case "replace": this._showReplaceChallenge(); break;
    }

    this._updateHUD();
  }

  _showConcatChallenge() {
    const q = pickRandom(CONCAT_CHALLENGES);
    this.currentChallenge = { type: "concat", answer: q.result };

    const title = this.add.text(W / 2, 120, "⚗️ CONCATENATION LAB", {
      fontFamily: "Courier New, monospace", fontSize: "14px",
      color: "#00ffff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(110);

    const problem = this.add.text(W / 2, 200, `${q.part1} + ${q.part2} = ?`, {
      fontFamily: "Courier New, monospace", fontSize: "28px",
      color: "#ffd93d", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(110);

    this.currentElements.push(title, problem);

    const options = [q.result, `"${q.part1.slice(1, -1)}${q.part2.slice(1, -1)}"`, '""', `${q.part1}${q.part2}`];
    const shuffled = Phaser.Utils.Array.Shuffle(options.slice());

    this._createChallengeButtons(shuffled, options.indexOf(q.result), q.explanation, 280);
  }

  _showLengthChallenge() {
    const q = pickRandom(LENGTH_CHALLENGES);
    this.currentChallenge = { type: "length", answer: q.length };

    const title = this.add.text(W / 2, 120, "📏 LENGTH ANALYZER", {
      fontFamily: "Courier New, monospace", fontSize: "14px",
      color: "#00ffff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(110);

    const problem = this.add.text(W / 2, 200, `${q.string}.length = ?`, {
      fontFamily: "Courier New, monospace", fontSize: "24px",
      color: "#ffd93d", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(110);

    this.currentElements.push(title, problem);

    const nums = ["0", "1", "2", "3", "4", "5", "8", "10"];
    const options = [q.length, nums[Math.floor(Math.random() * nums.length)], nums[Math.floor(Math.random() * nums.length)]];
    const shuffled = Phaser.Utils.Array.Shuffle(options.slice());

    this._createChallengeButtons(shuffled, shuffled.indexOf(q.length), q.explanation, 280);
  }

  _showCharAtChallenge() {
    const q = pickRandom(CHARAT_CHALLENGES);
    this.currentChallenge = { type: "charAt", answer: q.char };

    const title = this.add.text(W / 2, 120, "🔍 CHARACTER FINDER", {
      fontFamily: "Courier New, monospace", fontSize: "14px",
      color: "#00ffff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(110);

    const problem = this.add.text(W / 2, 200, `${q.string}.charAt(${q.index}) = ?`, {
      fontFamily: "Courier New, monospace", fontSize: "22px",
      color: "#ffd93d", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(110);

    this.currentElements.push(title, problem);

    const options = [q.char, '"X"', '""', '"0"'];
    const shuffled = Phaser.Utils.Array.Shuffle(options.slice());

    this._createChallengeButtons(shuffled, shuffled.indexOf(q.char), q.explanation, 280);
  }

  _showSubstringChallenge() {
    const q = pickRandom(SUBSTRING_CHALLENGES);
    this.currentChallenge = { type: "substring", answer: q.result };

    const title = this.add.text(W / 2, 120, "✂️ SUBSTRING CUTTER", {
      fontFamily: "Courier New, monospace", fontSize: "14px",
      color: "#00ffff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(110);

    const problem = this.add.text(W / 2, 200, `${q.string}.substring(${q.start}, ${q.end}) = ?`, {
      fontFamily: "Courier New, monospace", fontSize: "18px",
      color: "#ffd93d", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(110);

    this.currentElements.push(title, problem);

    const options = [q.result, '""', `"${q.string.slice(1, -1)}"`, '"?"'];
    const shuffled = Phaser.Utils.Array.Shuffle(options.slice());

    this._createChallengeButtons(shuffled, shuffled.indexOf(q.result), q.explanation, 280);
  }

  _showEqualityChallenge() {
    const q = pickRandom(EQUALITY_CHALLENGES);
    const answer = q.equal ? "TRUE" : "FALSE";
    this.currentChallenge = { type: "equality", answer };

    const title = this.add.text(W / 2, 120, "⚖️ EQUALITY CHECK", {
      fontFamily: "Courier New, monospace", fontSize: "14px",
      color: "#00ffff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(110);

    const problem = this.add.text(W / 2, 200, `${q.str1} == ${q.str2}`, {
      fontFamily: "Courier New, monospace", fontSize: "20px",
      color: "#ffd93d", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(110);

    const questionMark = this.add.text(W / 2, 240, "?", {
      fontFamily: "Arial", fontSize: "32px",
      color: "#ff00ff",
    }).setOrigin(0.5).setDepth(110);

    this.currentElements.push(title, problem, questionMark);

    const options = ["TRUE", "FALSE"];
    this._createChallengeButtons(options, options.indexOf(answer), q.explanation, 280);
  }

  _showUpperLowerChallenge() {
    const q = pickRandom(UPPER_LOWER_CHALLENGES);
    this.currentChallenge = { type: "case", answer: q.result };

    const title = this.add.text(W / 2, 120, "🔤 CASE TRANSFORMER", {
      fontFamily: "Courier New, monospace", fontSize: "14px",
      color: "#00ffff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(110);

    const action = q.action === "uppercase" ? "toUpperCase()" : "toLowerCase()";
    const problem = this.add.text(W / 2, 200, `${q.string}.${action} = ?`, {
      fontFamily: "Courier New, monospace", fontSize: "20px",
      color: "#ffd93d", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(110);

    this.currentElements.push(title, problem);

    const options = [q.result, q.string, '""'];
    const shuffled = Phaser.Utils.Array.Shuffle(options.slice());

    this._createChallengeButtons(shuffled, shuffled.indexOf(q.result), q.explanation, 280);
  }

  _showReplaceChallenge() {
    const q = pickRandom(REPLACE_CHALLENGES);
    this.currentChallenge = { type: "replace", answer: q.result };

    const title = this.add.text(W / 2, 120, "🔄 STRING REPLACER", {
      fontFamily: "Courier New, monospace", fontSize: "14px",
      color: "#00ffff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(110);

    const problem = this.add.text(W / 2, 200, `${q.string}.replace(${q.find}, ${q.replace})`, {
      fontFamily: "Courier New, monospace", fontSize: "16px",
      color: "#ffd93d", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(110);

    this.currentElements.push(title, problem);

    const options = [q.result, q.string, '""'];
    const shuffled = Phaser.Utils.Array.Shuffle(options.slice());

    this._createChallengeButtons(shuffled, shuffled.indexOf(q.result), q.explanation, 280);
  }

  /* ═══════════════════════════════════════════════════════════════
   *  CHALLENGE BUTTONS
   * ═══════════════════════════════════════════════════════════════ */
  _createChallengeButtons(options, correctIndex, explanation, yStart) {
    const btnW = 150;
    const btnH = 44;
    const cols = options.length <= 2 ? options.length : 2;
    const gapX = 16;
    const gapY = 12;
    const totalW = cols * btnW + (cols - 1) * gapX;
    const startX = W / 2 - totalW / 2 + btnW / 2;

    const buttons = [];

    options.forEach((opt, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const bx = startX + col * (btnW + gapX);
      const by = yStart + row * (btnH + gapY);

      const bg = this.add.rectangle(bx, by, btnW, btnH, 0x1a2332, 0.9).setDepth(120);
      bg.setStrokeStyle(2, 0x00ffff, 0.4);

      const fontSize = opt.length > 12 ? "12px" : opt.length > 6 ? "14px" : "16px";
      const txt = this.add.text(bx, by, opt, {
        fontFamily: "Courier New, monospace", fontSize,
        color: "#ffffff", fontStyle: "bold",
        wordWrap: { width: btnW - 14 }, align: "center",
      }).setOrigin(0.5).setDepth(121);

      bg.setInteractive({ useHandCursor: true });
      bg.on("pointerover", () => {
        bg.setStrokeStyle(2, 0x00ffff, 1);
        this.tweens.add({ targets: [bg, txt], scaleX: 1.05, scaleY: 1.05, duration: 80 });
      });
      bg.on("pointerout", () => {
        bg.setStrokeStyle(2, 0x00ffff, 0.4);
        this.tweens.add({ targets: [bg, txt], scaleX: 1, scaleY: 1, duration: 80 });
      });
      bg.on("pointerup", () => {
        this._handleChallengeAnswer(i, correctIndex, explanation, buttons);
      });

      this.currentElements.push(bg, txt);
      buttons.push({ bg, txt, index: i });
    });

    this._startTimer(4000, () => {
      this._onTimerExpired();
    });
  }

  _handleChallengeAnswer(selected, correctIndex, explanation, allButtons) {
    this._stopTimer();
    const correct = selected === correctIndex;

    if (correct) {
      this._onCorrect(explanation, 25);
    } else {
      this._onWrong(explanation);
      if (this.lives <= 0) return;

      const correctBtn = allButtons.find(b => b.index === correctIndex);
      if (correctBtn) {
        correctBtn.bg.setFillStyle(0x004d40, 1);
        correctBtn.bg.setStrokeStyle(3, 0x00ff88, 1);
        this.tweens.add({
          targets: [correctBtn.bg, correctBtn.txt],
          scaleX: 1.1, scaleY: 1.1, duration: 200, yoyo: true, repeat: 1,
        });
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

    const mult = this.combo >= 20 ? 5 : this.combo >= 10 ? 3 : this.combo >= 5 ? 2 : 1;
    const points = basePoints * mult;
    this.score += points;

    GameManager.addXP(points);
    GameManager.addScore(points);
    GameManager.addCombo();

    this.correctPart.emitParticleAt(W / 2, 270, 15);
    this._showPopup(W / 2, 240, `+${points}`, "#00ff88");
    this._showTooltip(message, "#00ff88");

    if (this.combo === 5 || this.combo === 10 || this.combo === 20) {
      this.cameras.main.flash(150, 255, 215, 0);
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
    this._onWrong("⏰ Time's up!");
    if (this.lives <= 0) return;
    this.totalProcessed++;
  }

  /* ═══════════════════════════════════════════════════════════════
   *  TIMER
   * ═══════════════════════════════════════════════════════════════ */
  _startTimer(duration, onExpire) {
    this.timerBarBg.setAlpha(1);
    this.timerBarFill.setAlpha(1);
    this.timerBarFill.width = 200;
    this.timerBarFill.setFillStyle(0x00ffff, 0.7);

    if (this.timerBarTween) this.timerBarTween.destroy();
    this.timerBarTween = this.tweens.add({
      targets: this.timerBarFill,
      width: 0,
      duration,
      ease: "Linear",
      onUpdate: () => {
        const pct = this.timerBarFill.width / 200;
        if (pct < 0.25) this.timerBarFill.setFillStyle(0xff4444, 0.8);
        else if (pct < 0.5) this.timerBarFill.setFillStyle(0xffd93d, 0.7);
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
      GameManager.completeLevel(10, accuracy);
      BadgeSystem.unlock("string_master");
      ProgressTracker.saveProgress(GameManager.getState());
      this.cameras.main.flash(600, 255, 215, 0);

      for (let i = 0; i < 8; i++) {
        this.time.delayedCall(i * 200, () => {
          this.confettiPart.emitParticleAt(
            Phaser.Math.Between(100, W - 100),
            Phaser.Math.Between(0, 50), 15
          );
        });
      }
    }

    this.time.delayedCall(passed ? 600 : 300, () => {
      this._showEndScreen(passed, accuracy, timeStr);
    });
  }

  _showEndScreen(passed, accuracy, timeStr) {
    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.9).setDepth(200);

    const panelG = this.add.graphics().setDepth(201);
    const panelColor = passed ? 0x0d1b2a : 0x4a1e1e;
    const borderColor = passed ? 0x00ffff : 0xe74c3c;
    panelG.fillStyle(panelColor, 0.97);
    panelG.fillRoundedRect(W / 2 - 300, 20, 600, 540, 16);
    panelG.lineStyle(3, borderColor);
    panelG.strokeRoundedRect(W / 2 - 300, 20, 600, 540, 16);

    const titleText = passed ? "🧪 LAB MASTERY ACHIEVED!" : "❌ ACCURACY TOO LOW";
    const titleColor = passed ? "#00ffff" : "#e74c3c";

    this.add.text(W / 2, 50, titleText, {
      fontFamily: "Arial Black, Arial, sans-serif", fontSize: "24px",
      color: titleColor, fontStyle: "bold",
    }).setOrigin(0.5).setDepth(202);

    let sy = 95;
    const stats = [
      `Challenges Completed: ${this.totalProcessed} / ${TARGET_CHALLENGES}`,
      `Accuracy: ${accuracy}%`,
      `Score: ${this.score}`,
      `Time: ${timeStr}`,
      `Max Combo: ${this.maxCombo}x`,
      `Lives Remaining: ${this.lives} / ${MAX_LIVES}`,
    ];
    stats.forEach((s, i) => {
      this.add.text(W / 2, sy + i * 22, s, {
        fontFamily: "Courier New, monospace", fontSize: "12px", color: "#ecf0f1",
      }).setOrigin(0.5).setDepth(202);
    });

    sy += stats.length * 22 + 15;

    if (passed) {
      this.add.text(W / 2, sy, "🧪 Badge Unlocked: String Master!", {
        fontFamily: "Arial", fontSize: "14px",
        color: "#f1c40f", fontStyle: "bold",
      }).setOrigin(0.5).setDepth(202);
      sy += 25;

      const bullets = [
        "✅ String concatenation: combining strings",
        "✅ Length property: measuring strings",
        "✅ charAt() & substring(): accessing parts",
        "✅ Case transformation: upper/lowercase",
        "✅ String comparison: equality matters",
        "✅ String replace: substitution operations",
      ];
      bullets.forEach((b, i) => {
        this.add.text(W / 2, sy + i * 16, b, {
          fontFamily: "Arial", fontSize: "9px", color: "#bdc3c7",
        }).setOrigin(0.5).setDepth(202);
      });
      sy += bullets.length * 16 + 12;

      this._createEndButton(W / 2 - 130, sy, "NEXT LEVEL →", 0x1a3a5e, () => {
        this.scene.stop("UIScene");
        this.scene.start("MenuScene");
      });
      this._createEndButton(W / 2 + 130, sy, "REPLAY", 0x0d1b2a, () => {
        GameManager.resetLevel();
        this.scene.restart();
      });
    } else {
      this.add.text(W / 2, sy, `Need ${ACCURACY_THRESHOLD}%+ accuracy to pass!`, {
        fontFamily: "Arial", fontSize: "13px",
        color: "#ff8888", fontStyle: "bold",
      }).setOrigin(0.5).setDepth(202);
      sy += 28;

      this._createEndButton(W / 2 - 100, sy, "TRY AGAIN", 0xe74c3c, () => {
        GameManager.resetLevel();
        this.scene.restart();
      });
      this._createEndButton(W / 2 + 100, sy, "MENU", 0x34495e, () => {
        this.scene.stop("UIScene");
        this.scene.start("MenuScene");
      });
    }
  }

  _createEndButton(x, y, text, color, callback) {
    const bg = this.add.rectangle(x, y, 200, 44, color, 1).setDepth(202);
    bg.setStrokeStyle(2, Phaser.Display.Color.IntegerToColor(color).brighten(30).color);
    const txt = this.add.text(x, y, text, {
      fontFamily: "Courier New, monospace", fontSize: "14px",
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

    this.cameras.main.shake(400, 0.02);
    this.cameras.main.flash(250, 255, 0, 0);

    this.time.delayedCall(500, () => {
      const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.9).setDepth(200);

      const panelG = this.add.graphics().setDepth(201);
      panelG.fillStyle(0x3a0000, 0.95);
      panelG.fillRoundedRect(W / 2 - 250, H / 2 - 150, 500, 300, 16);
      panelG.lineStyle(3, 0xe74c3c);
      panelG.strokeRoundedRect(W / 2 - 250, H / 2 - 150, 500, 300, 16);

      this.add.text(W / 2, H / 2 - 100, "💀 LAB FAILURE", {
        fontFamily: "Courier New, monospace", fontSize: "26px",
        color: "#e74c3c", fontStyle: "bold",
      }).setOrigin(0.5).setDepth(202);

      this.add.text(W / 2, H / 2 - 30, "All lives lost — experiments terminated!", {
        fontFamily: "Courier New, monospace", fontSize: "13px", color: "#ff8888",
      }).setOrigin(0.5).setDepth(202);

      const total = this.correctAnswers + this.wrongAnswers;
      const acc = total > 0 ? Math.round((this.correctAnswers / total) * 100) : 0;

      this.add.text(W / 2, H / 2 + 20, [
        `Completed: ${this.totalProcessed} / ${TARGET_CHALLENGES}`,
        `Correct: ${this.correctAnswers}  |  Wrong: ${this.wrongAnswers}`,
        `Accuracy: ${acc}%  |  Score: ${this.score}`,
      ].join("\n"), {
        fontFamily: "Courier New, monospace", fontSize: "11px",
        color: "#aaaaaa", align: "center", lineSpacing: 5,
      }).setOrigin(0.5).setDepth(202);

      this._createEndButton(W / 2 - 100, H / 2 + 100, "TRY AGAIN", 0xe74c3c, () => {
        GameManager.resetLevel();
        this.scene.restart();
      });
      this._createEndButton(W / 2 + 100, H / 2 + 100, "MENU", 0x34495e, () => {
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
