/**
 * Level5Scene — "Float Precision: Calibration Lab" (Tuning Phase)
 * ================================================================
 * Mechanic: Interactive Precision Challenges
 * - Classify numbers by decimal precision (1dp, 2dp, 3+dp)
 * - Round floats to target decimal places
 * - Compare pairs of floats (choose larger/smaller)
 * - Complete 20 challenges with ≥85% accuracy to pass
 *
 * Schema Theory: Tuning — refining understanding of float precision,
 * rounding, and comparison.
 */

import Phaser from "phaser";
import { GameManager } from "../GameManager.js";
import { BadgeSystem } from "../BadgeSystem.js";
import { ProgressTracker } from "../ProgressTracker.js";

/* ───────── Constants ───────── */
const W = 800;
const H = 600;
const TOTAL_CHALLENGES = 20;
const ACCURACY_THRESHOLD = 85;
const MAX_LIVES = 3;
const CHALLENGE_TIME = 12000;

/* ───────── Challenge Data ───────── */

// Classify challenges: identify decimal places
const CLASSIFY_NUMBERS = [
  { value: 3.5, dp: 1 }, { value: -2.7, dp: 1 }, { value: 0.8, dp: 1 },
  { value: 4.1, dp: 1 }, { value: -9.6, dp: 1 }, { value: 1.3, dp: 1 },
  { value: 3.14, dp: 2 }, { value: 9.99, dp: 2 }, { value: -0.25, dp: 2 },
  { value: 1.75, dp: 2 }, { value: 6.01, dp: 2 }, { value: -4.50, dp: 2 },
  { value: 2.718, dp: 3 }, { value: 3.142, dp: 3 }, { value: 0.001, dp: 3 },
  { value: -1.333, dp: 3 }, { value: 0.125, dp: 3 }, { value: 5.0056, dp: 3 },
  { value: 3.14159, dp: 3 }, { value: 0.00789, dp: 3 },
];

// Round challenges: round to N decimal places
const ROUND_CHALLENGES = [
  { value: 3.456, target: 1, answer: 3.5, options: [3.4, 3.5, 3.46, 4.0] },
  { value: 7.891, target: 1, answer: 7.9, options: [7.8, 7.9, 8.0, 7.89] },
  { value: 2.345, target: 2, answer: 2.35, options: [2.34, 2.35, 2.30, 2.40] },
  { value: 9.999, target: 2, answer: 10.00, options: [9.99, 10.00, 9.90, 10.01] },
  { value: 0.1234, target: 2, answer: 0.12, options: [0.12, 0.13, 0.10, 0.123] },
  { value: -3.678, target: 1, answer: -3.7, options: [-3.6, -3.7, -4.0, -3.68] },
  { value: 5.555, target: 2, answer: 5.56, options: [5.55, 5.56, 5.50, 5.60] },
  { value: 1.005, target: 2, answer: 1.01, options: [1.00, 1.01, 1.005, 1.10] },
  { value: 0.0456, target: 2, answer: 0.05, options: [0.04, 0.05, 0.046, 0.00] },
  { value: 12.349, target: 1, answer: 12.3, options: [12.3, 12.4, 12.35, 12.0] },
];

// Compare challenges: pick the larger number
const COMPARE_CHALLENGES = [
  { a: 3.14, b: 3.2, larger: "b", tip: "3.2 > 3.14 because 3.20 > 3.14" },
  { a: -0.5, b: -0.3, larger: "b", tip: "-0.3 > -0.5 (closer to zero)" },
  { a: 1.001, b: 1.01, larger: "b", tip: "1.01 = 1.010 > 1.001" },
  { a: 0.9, b: 0.99, larger: "b", tip: "0.99 > 0.90" },
  { a: -2.1, b: -2.01, larger: "b", tip: "-2.01 > -2.10 (closer to zero)" },
  { a: 0.333, b: 0.33, larger: "a", tip: "0.333 > 0.330" },
  { a: 5.5, b: 5.50, larger: "tie", tip: "5.5 = 5.50 — they're equal!" },
  { a: 7.09, b: 7.1, larger: "b", tip: "7.10 > 7.09" },
  { a: 0.1, b: 0.099, larger: "a", tip: "0.100 > 0.099" },
  { a: -1.5, b: -1.50, larger: "tie", tip: "-1.5 = -1.50 — they're equal!" },
];

/* Challenge sequence: 8 classify, 7 round, 5 compare */
const CHALLENGE_SEQUENCE = [
  "classify", "classify", "classify",
  "round", "round",
  "classify", "classify",
  "round", "round",
  "compare", "compare",
  "classify", "round",
  "compare",
  "classify", "round",
  "compare", "round",
  "classify", "compare",
];

/* ───────── Helpers ───────── */
function lerpColor(a, b, t) {
  const ar = (a >> 16) & 0xff, ag = (a >> 8) & 0xff, ab = a & 0xff;
  const br = (b >> 16) & 0xff, bg = (b >> 8) & 0xff, bb = b & 0xff;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return (r << 16) | (g << 8) | bl;
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ═══════════════════════════════════════════════════════════════
 *  LEVEL 5 SCENE
 * ═══════════════════════════════════════════════════════════════ */
export class Level5Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level5Scene" });
  }

  create() {
    this.physics.world.gravity.y = 0;

    /* ── State ── */
    this.currentChallenge = 0;
    this.correctAnswers = 0;
    this.totalAnswered = 0;
    this.score = 0;
    this.lives = MAX_LIVES;
    this.isComplete = false;
    this.gameStarted = false;
    this.startTime = 0;
    this.combo = 0;
    this.challengeActive = false;
    this.timerEvent = null;
    this.timerBarTween = null;
    this.challengeElements = [];

    // Shuffle challenge pools
    this.classifyPool = shuffleArray(CLASSIFY_NUMBERS);
    this.roundPool = shuffleArray(ROUND_CHALLENGES);
    this.comparePool = shuffleArray(COMPARE_CHALLENGES);
    this.classifyIdx = 0;
    this.roundIdx = 0;
    this.compareIdx = 0;

    this._drawLabBackground();
    this._generateTextures();
    this._createParticles();
    this._createHUD();

    const uiScene = this.scene.get("UIScene");
    if (uiScene && uiScene.setLevelLabel) {
      uiScene.setLevelLabel("Level 5: Tuning — Precision Calibration Lab!");
    }

    this._showInstruction();
  }

  /* ═══════════════════════════════════════════════════════════════
   *  LAB BACKGROUND
   * ═══════════════════════════════════════════════════════════════ */
  _drawLabBackground() {
    const gfx = this.add.graphics().setDepth(0);
    const topColor = 0x0d1b2a;
    const botColor = 0x1b2838;
    const steps = 40;
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const c = lerpColor(topColor, botColor, t);
      gfx.fillStyle(c, 1);
      gfx.fillRect(0, Math.floor((H * i) / steps), W, Math.ceil(H / steps) + 1);
    }

    // Grid lines (lab feel)
    const gridGfx = this.add.graphics().setDepth(1).setAlpha(0.04);
    gridGfx.lineStyle(1, 0x00bcd4);
    for (let x = 0; x < W; x += 40) {
      gridGfx.beginPath();
      gridGfx.moveTo(x, 0);
      gridGfx.lineTo(x, H);
      gridGfx.strokePath();
    }
    for (let y = 0; y < H; y += 40) {
      gridGfx.beginPath();
      gridGfx.moveTo(0, y);
      gridGfx.lineTo(W, y);
      gridGfx.strokePath();
    }

    // Glowing accent lines
    const accentGfx = this.add.graphics().setDepth(1).setAlpha(0.15);
    accentGfx.lineStyle(2, 0x00bcd4);
    accentGfx.beginPath();
    accentGfx.moveTo(0, 120);
    accentGfx.lineTo(W, 120);
    accentGfx.strokePath();
  }

  /* ═══════════════════════════════════════════════════════════════
   *  TEXTURES & PARTICLES
   * ═══════════════════════════════════════════════════════════════ */
  _generateTextures() {
    if (!this.textures.exists("greenSpark")) {
      const g = this.add.graphics();
      g.fillStyle(0x27ae60, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("greenSpark", 8, 8);
      g.destroy();
    }
    if (!this.textures.exists("redSpark")) {
      const g = this.add.graphics();
      g.fillStyle(0xe74c3c, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("redSpark", 8, 8);
      g.destroy();
    }
    if (!this.textures.exists("confettiSpark")) {
      const g = this.add.graphics();
      g.fillStyle(0xffd700, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("confettiSpark", 8, 8);
      g.destroy();
    }
    if (!this.textures.exists("cyanSpark")) {
      const g = this.add.graphics();
      g.fillStyle(0x00bcd4, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("cyanSpark", 8, 8);
      g.destroy();
    }
  }

  _createParticles() {
    this.successParticles = this.add.particles(0, 0, "greenSpark", {
      speed: { min: 80, max: 250 },
      scale: { start: 1.2, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 700,
      blendMode: "ADD",
      emitting: false,
    });
    this.errorParticles = this.add.particles(0, 0, "redSpark", {
      speed: { min: 60, max: 180 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 500,
      blendMode: "ADD",
      emitting: false,
    });
    this.confettiParticles = this.add.particles(0, 0, "confettiSpark", {
      speed: { min: 40, max: 180 },
      angle: { min: 230, max: 310 },
      scale: { start: 1, end: 0.3 },
      alpha: { start: 1, end: 0 },
      lifespan: 2500,
      gravityY: 120,
      emitting: false,
    });
  }

  /* ═══════════════════════════════════════════════════════════════
   *  HUD
   * ═══════════════════════════════════════════════════════════════ */
  _createHUD() {
    const dp = 100;

    // Score
    this.scoreText = this.add.text(16, 68, "Score: 0", {
      fontFamily: "Arial",
      fontSize: "22px",
      color: "#e2e8f0",
      fontStyle: "bold",
      stroke: "#0d1b2a",
      strokeThickness: 3,
    }).setDepth(dp);

    // Progress
    this.add.text(W / 2, 68, "Challenges", {
      fontFamily: "Arial",
      fontSize: "12px",
      color: "#00bcd4",
      fontStyle: "bold",
    }).setOrigin(0.5, 0).setDepth(dp);

    this.progressBarBg = this.add.rectangle(W / 2, 90, 260, 16, 0x1b2838, 0.6)
      .setStrokeStyle(1, 0x00bcd4).setDepth(dp);
    this.progressBarFill = this.add.rectangle(W / 2 - 130, 90, 0, 14, 0x00bcd4)
      .setOrigin(0, 0.5).setDepth(dp + 1);
    this.progressTextHUD = this.add.text(W / 2, 90, "0 / 20", {
      fontFamily: "Arial",
      fontSize: "11px",
      color: "#ffffff",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(dp + 2);

    // Lives
    this.livesIcons = [];
    for (let i = 0; i < MAX_LIVES; i++) {
      const heart = this.add.text(W - 30 - i * 35, 72, "❤️", {
        fontSize: "22px",
      }).setOrigin(0.5).setDepth(dp);
      this.livesIcons.push(heart);
    }

    // Timer bar
    this.timerBarBg = this.add.rectangle(W / 2, 115, 400, 8, 0x1b2838, 0.6)
      .setStrokeStyle(1, 0x334155).setDepth(dp);
    this.timerBarFill = this.add.rectangle(W / 2 - 200, 115, 400, 6, 0x00bcd4)
      .setOrigin(0, 0.5).setDepth(dp + 1);

    // Challenge type label
    this.challengeLabel = this.add.text(W / 2, 140, "", {
      fontFamily: "Arial",
      fontSize: "14px",
      color: "#64748b",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(dp);

    // Tooltip (feedback)
    this.tooltip = this.add.text(W / 2, H - 30, "", {
      fontFamily: "Arial",
      fontSize: "15px",
      color: "#ffffff",
      backgroundColor: "rgba(13, 27, 42, 0.9)",
      padding: { x: 14, y: 6 },
      align: "center",
      wordWrap: { width: 600 },
    }).setOrigin(0.5).setAlpha(0).setDepth(dp + 10);

    // Combo
    this.comboText = this.add.text(W / 2, 46, "", {
      fontFamily: "Arial",
      fontSize: "15px",
      color: "#fbbf24",
      fontStyle: "bold",
      stroke: "#0d1b2a",
      strokeThickness: 2,
    }).setOrigin(0.5).setAlpha(0).setDepth(dp);
  }

  /* ═══════════════════════════════════════════════════════════════
   *  INSTRUCTION OVERLAY
   * ═══════════════════════════════════════════════════════════════ */
  _showInstruction() {
    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.85).setDepth(200);

    const panelG = this.add.graphics().setDepth(201);
    panelG.fillStyle(0x0d1b2a, 0.98);
    panelG.fillRoundedRect(W / 2 - 320, 50, 640, 480, 16);
    panelG.lineStyle(3, 0x00bcd4);
    panelG.strokeRoundedRect(W / 2 - 320, 50, 640, 480, 16);

    const title = this.add.text(W / 2, 90, "🔬 MISSION 5: FLOAT PRECISION", {
      fontFamily: "Arial Black, Arial, sans-serif",
      fontSize: "26px",
      color: "#00bcd4",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(202);

    const sub = this.add.text(W / 2, 125, "Precision Calibration Lab", {
      fontFamily: "Arial",
      fontSize: "18px",
      color: "#4dd0e1",
      fontStyle: "italic",
    }).setOrigin(0.5).setDepth(202);

    const desc = this.add.text(W / 2, 230,
      "Precision matters in programming!\n" +
      "3.1 and 3.14 and 3.14159 are all different.\n\n" +
      "🔢  CLASSIFY: How many decimal places?\n" +
      "🎯  ROUND: Round to the target precision\n" +
      "⚖️  COMPARE: Which float is larger?\n\n" +
      "Click the correct answer for each challenge.\n" +
      "Watch the timer — answer before it runs out!\n" +
      "You have 3 lives. Wrong answers cost a life.",
      {
        fontFamily: "Arial",
        fontSize: "15px",
        color: "#bdc3c7",
        align: "center",
        lineSpacing: 6,
      }
    ).setOrigin(0.5).setDepth(202);

    const goal = this.add.text(W / 2, 410, "Complete 20 challenges with 85%+ accuracy\nto earn the Precision Master badge! 🔬", {
      fontFamily: "Arial",
      fontSize: "14px",
      color: "#f1c40f",
      align: "center",
      fontStyle: "bold",
      lineSpacing: 6,
    }).setOrigin(0.5).setDepth(202);

    const btnBg = this.add.rectangle(W / 2, 470, 260, 48, 0x00838f, 1).setDepth(202);
    btnBg.setStrokeStyle(2, 0x00bcd4);
    const btnTxt = this.add.text(W / 2, 470, "ENTER THE LAB", {
      fontFamily: "Arial",
      fontSize: "20px",
      color: "#ffffff",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(203);

    btnBg.setInteractive({ useHandCursor: true });
    btnBg.on("pointerover", () => {
      btnBg.setFillStyle(0x00bcd4);
      this.tweens.add({ targets: [btnBg, btnTxt], scaleX: 1.08, scaleY: 1.08, duration: 120 });
    });
    btnBg.on("pointerout", () => {
      btnBg.setFillStyle(0x00838f);
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
    this._showNextChallenge();
  }

  /* ═══════════════════════════════════════════════════════════════
   *  CHALLENGE ROUTER
   * ═══════════════════════════════════════════════════════════════ */
  _showNextChallenge() {
    if (this.isComplete) return;
    if (this.currentChallenge >= TOTAL_CHALLENGES) {
      this._checkLevelEnd();
      return;
    }

    this._clearChallengeElements();

    const type = CHALLENGE_SEQUENCE[this.currentChallenge];
    this.challengeActive = true;

    // Start timer
    this.timerBarFill.width = 400;
    this.timerBarFill.setFillStyle(0x00bcd4);
    if (this.timerBarTween) this.timerBarTween.destroy();
    this.timerBarTween = this.tweens.add({
      targets: this.timerBarFill,
      width: 0,
      duration: CHALLENGE_TIME,
      ease: "Linear",
      onUpdate: () => {
        const pct = this.timerBarFill.width / 400;
        if (pct < 0.25) this.timerBarFill.setFillStyle(0xe74c3c);
        else if (pct < 0.5) this.timerBarFill.setFillStyle(0xf1c40f);
      },
    });

    if (this.timerEvent) this.timerEvent.destroy();
    this.timerEvent = this.time.delayedCall(CHALLENGE_TIME, () => {
      if (this.challengeActive) this._onTimeout();
    });

    switch (type) {
      case "classify": this._showClassifyChallenge(); break;
      case "round": this._showRoundChallenge(); break;
      case "compare": this._showCompareChallenge(); break;
    }
  }

  _clearChallengeElements() {
    this.challengeElements.forEach(el => {
      if (el && el.destroy) el.destroy();
    });
    this.challengeElements = [];
  }

  /* ═══════════════════════════════════════════════════════════════
   *  CLASSIFY CHALLENGE
   * ═══════════════════════════════════════════════════════════════ */
  _showClassifyChallenge() {
    const data = this.classifyPool[this.classifyIdx % this.classifyPool.length];
    this.classifyIdx++;

    this.challengeLabel.setText("CLASSIFY — How many decimal places?");

    // Display the number
    const numDisplay = this.add.text(W / 2, 230, String(data.value), {
      fontFamily: "Courier New, monospace",
      fontSize: "64px",
      color: "#00bcd4",
      fontStyle: "bold",
      shadow: { blur: 20, color: "#00bcd4", fill: true },
    }).setOrigin(0.5).setDepth(110);
    this.challengeElements.push(numDisplay);

    const question = this.add.text(W / 2, 310, "How many decimal places does this number have?", {
      fontFamily: "Arial",
      fontSize: "18px",
      color: "#94a3b8",
    }).setOrigin(0.5).setDepth(110);
    this.challengeElements.push(question);

    // Answer buttons
    const options = [
      { label: "1 Decimal", value: 1 },
      { label: "2 Decimals", value: 2 },
      { label: "3+ Decimals", value: 3 },
    ];

    const correctDp = data.dp >= 3 ? 3 : data.dp;

    options.forEach((opt, i) => {
      const bx = 200 + i * 200;
      const by = 410;
      const btn = this._createOptionButton(bx, by, 170, 60, opt.label, () => {
        this._handleAnswer(opt.value === correctDp, this._getClassifyTip(data, correctDp));
      });
      this.challengeElements.push(...btn);
    });
  }

  _getClassifyTip(data, correctDp) {
    const dpWord = correctDp === 1 ? "1 decimal place" : correctDp === 2 ? "2 decimal places" : "3+ decimal places";
    return `${data.value} has ${dpWord}`;
  }

  /* ═══════════════════════════════════════════════════════════════
   *  ROUND CHALLENGE
   * ═══════════════════════════════════════════════════════════════ */
  _showRoundChallenge() {
    const data = this.roundPool[this.roundIdx % this.roundPool.length];
    this.roundIdx++;

    this.challengeLabel.setText("ROUND — Select the correctly rounded value");

    const numDisplay = this.add.text(W / 2, 210, String(data.value), {
      fontFamily: "Courier New, monospace",
      fontSize: "52px",
      color: "#f59e0b",
      fontStyle: "bold",
      shadow: { blur: 15, color: "#f59e0b", fill: true },
    }).setOrigin(0.5).setDepth(110);
    this.challengeElements.push(numDisplay);

    const dpLabel = data.target === 1 ? "1 decimal place" : `${data.target} decimal places`;
    const question = this.add.text(W / 2, 290, `Round to ${dpLabel}:`, {
      fontFamily: "Arial",
      fontSize: "20px",
      color: "#fbbf24",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(110);
    this.challengeElements.push(question);

    const shuffled = shuffleArray(data.options);

    shuffled.forEach((opt, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const bx = 280 + col * 240;
      const by = 370 + row * 75;

      const btn = this._createOptionButton(bx, by, 200, 55, String(opt), () => {
        const correct = opt === data.answer;
        const tip = correct
          ? `✓ ${data.value} rounded to ${dpLabel} = ${data.answer}`
          : `✗ The correct answer is ${data.answer}`;
        this._handleAnswer(correct, tip);
      });
      this.challengeElements.push(...btn);
    });
  }

  /* ═══════════════════════════════════════════════════════════════
   *  COMPARE CHALLENGE
   * ═══════════════════════════════════════════════════════════════ */
  _showCompareChallenge() {
    const data = this.comparePool[this.compareIdx % this.comparePool.length];
    this.compareIdx++;

    this.challengeLabel.setText("COMPARE — Which number is larger?");

    const question = this.add.text(W / 2, 170, "Click the LARGER number:", {
      fontFamily: "Arial",
      fontSize: "18px",
      color: "#94a3b8",
    }).setOrigin(0.5).setDepth(110);
    this.challengeElements.push(question);

    const vsText = this.add.text(W / 2, 280, "VS", {
      fontFamily: "Arial Black",
      fontSize: "28px",
      color: "#475569",
    }).setOrigin(0.5).setDepth(110);
    this.challengeElements.push(vsText);

    // Card A (left)
    const cardA = this._createCompareCard(240, 280, String(data.a), () => {
      const correct = data.larger === "a";
      this._handleAnswer(correct, data.tip);
    });
    this.challengeElements.push(...cardA);

    // Card B (right)
    const cardB = this._createCompareCard(560, 280, String(data.b), () => {
      const correct = data.larger === "b";
      this._handleAnswer(correct, data.tip);
    });
    this.challengeElements.push(...cardB);

    // Equal button (for ties)
    const equalBtn = this._createOptionButton(W / 2, 430, 200, 50, "They're Equal!", () => {
      const correct = data.larger === "tie";
      this._handleAnswer(correct, data.tip);
    });
    this.challengeElements.push(...equalBtn);
  }

  _createCompareCard(x, y, text, callback) {
    const bg = this.add.rectangle(x, y, 180, 140, 0x1e293b, 0.9).setDepth(110);
    bg.setStrokeStyle(2, 0x334155);

    const txt = this.add.text(x, y, text, {
      fontFamily: "Courier New, monospace",
      fontSize: "42px",
      color: "#e2e8f0",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(111);

    bg.setInteractive({ useHandCursor: true });
    bg.on("pointerover", () => {
      bg.setStrokeStyle(3, 0x00bcd4);
      this.tweens.add({ targets: [bg, txt], scaleX: 1.05, scaleY: 1.05, duration: 100 });
    });
    bg.on("pointerout", () => {
      bg.setStrokeStyle(2, 0x334155);
      this.tweens.add({ targets: [bg, txt], scaleX: 1, scaleY: 1, duration: 100 });
    });
    bg.on("pointerup", callback);

    return [bg, txt];
  }

  /* ═══════════════════════════════════════════════════════════════
   *  OPTION BUTTON FACTORY
   * ═══════════════════════════════════════════════════════════════ */
  _createOptionButton(x, y, w, h, label, callback) {
    const bg = this.add.rectangle(x, y, w, h, 0x1e293b, 0.9).setDepth(110);
    bg.setStrokeStyle(2, 0x334155);

    const txt = this.add.text(x, y, label, {
      fontFamily: "Arial",
      fontSize: "18px",
      color: "#e2e8f0",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(111);

    bg.setInteractive({ useHandCursor: true });
    bg.on("pointerover", () => {
      bg.setStrokeStyle(2, 0x00bcd4);
      bg.setFillStyle(0x263852);
      this.tweens.add({ targets: [bg, txt], scaleX: 1.05, scaleY: 1.05, duration: 100 });
    });
    bg.on("pointerout", () => {
      bg.setStrokeStyle(2, 0x334155);
      bg.setFillStyle(0x1e293b, 0.9);
      this.tweens.add({ targets: [bg, txt], scaleX: 1, scaleY: 1, duration: 100 });
    });
    bg.on("pointerup", callback);

    return [bg, txt];
  }

  /* ═══════════════════════════════════════════════════════════════
   *  ANSWER HANDLING
   * ═══════════════════════════════════════════════════════════════ */
  _handleAnswer(correct, tipText) {
    if (!this.challengeActive) return;
    this.challengeActive = false;
    this.totalAnswered++;
    this.currentChallenge++;

    if (this.timerEvent) this.timerEvent.destroy();
    if (this.timerBarTween) this.timerBarTween.destroy();

    if (correct) {
      this._onCorrectAnswer(tipText);
    } else {
      this._onWrongAnswer(tipText);
    }

    this._updateHUD();

    // Next challenge after delay
    this.time.delayedCall(1800, () => {
      if (!this.isComplete) this._showNextChallenge();
    });
  }

  _onCorrectAnswer(tipText) {
    this.correctAnswers++;
    this.combo++;
    this.score += 15;

    GameManager.addXP(15 * GameManager.getComboMultiplier());
    GameManager.addScore(15);
    GameManager.addCombo();

    this.successParticles.emitParticleAt(W / 2, 280, 25);
    this.cameras.main.flash(200, 0, 150, 0);

    this._showPopup(W / 2, 200, "+15", "#2ecc71");
    this._showTooltip(`✓ ${tipText}`, "#2ecc71");

    if (this.combo >= 5) {
      this.cameras.main.flash(200, 255, 215, 0);
    }
  }

  _onWrongAnswer(tipText) {
    this.combo = 0;
    this.score = Math.max(0, this.score - 10);
    this.lives--;

    GameManager.resetCombo();
    GameManager.loseLife();

    this.errorParticles.emitParticleAt(W / 2, 280, 15);
    this.cameras.main.shake(250, 0.015);
    this.cameras.main.flash(200, 255, 0, 0);

    this._showPopup(W / 2, 200, "-10", "#e74c3c");
    this._showTooltip(`✗ ${tipText}`, "#e74c3c");

    this._updateLives();

    if (this.lives <= 0) {
      this.time.delayedCall(800, () => this._gameOver());
    }
  }

  _onTimeout() {
    this._handleAnswer(false, "Time's up! Be quicker next time.");
  }

  /* ═══════════════════════════════════════════════════════════════
   *  HUD UPDATES
   * ═══════════════════════════════════════════════════════════════ */
  _updateHUD() {
    if (this.scoreText && this.scoreText.active) {
      this.scoreText.setText(`Score: ${this.score}`);
      this.tweens.add({
        targets: this.scoreText,
        scaleX: 1.15, scaleY: 1.15,
        yoyo: true,
        duration: 100,
      });
    }

    if (this.progressBarFill && this.progressTextHUD) {
      const pct = Math.min(this.currentChallenge / TOTAL_CHALLENGES, 1);
      this.tweens.add({
        targets: this.progressBarFill,
        width: 260 * pct,
        duration: 300,
        ease: "Cubic.out",
      });
      this.progressTextHUD.setText(`${this.currentChallenge} / ${TOTAL_CHALLENGES}`);
    }

    if (this.comboText) {
      if (this.combo >= 2) {
        const mult = GameManager.getComboMultiplier();
        this.comboText.setText(`${this.combo}x COMBO!${mult > 1 ? ` (${mult}x XP)` : ""}`);
        this.comboText.setAlpha(1);
        this.tweens.add({
          targets: this.comboText,
          scaleX: 1.2, scaleY: 1.2,
          yoyo: true,
          duration: 150,
        });
      } else {
        this.comboText.setAlpha(0);
      }
    }
  }

  _updateLives() {
    for (let i = 0; i < MAX_LIVES; i++) {
      if (this.livesIcons[i]) {
        this.livesIcons[i].setText(i < this.lives ? "❤️" : "🖤");
        if (i >= this.lives) {
          this.tweens.add({
            targets: this.livesIcons[i],
            scaleX: 1.3, scaleY: 1.3,
            yoyo: true,
            duration: 150,
          });
        }
      }
    }
  }

  /* ═══════════════════════════════════════════════════════════════
   *  POPUPS & TOOLTIPS
   * ═══════════════════════════════════════════════════════════════ */
  _showPopup(x, y, text, color) {
    const popup = this.add.text(x, y, text, {
      fontFamily: "Arial",
      fontSize: "24px",
      color,
      fontStyle: "bold",
      stroke: "#0d1b2a",
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(150);

    this.tweens.add({
      targets: popup,
      y: y - 60,
      alpha: 0,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 800,
      ease: "Cubic.out",
      onComplete: () => popup.destroy(),
    });
  }

  _showTooltip(text, color) {
    if (!this.tooltip || !this.tooltip.active) return;
    this.tooltip.setText(text);
    this.tooltip.setColor(color || "#ffffff");
    this.tooltip.setAlpha(1);
    this.tweens.killTweensOf(this.tooltip);
    this.tweens.add({
      targets: this.tooltip,
      alpha: 0,
      delay: 2000,
      duration: 500,
    });
  }

  /* ═══════════════════════════════════════════════════════════════
   *  LEVEL END
   * ═══════════════════════════════════════════════════════════════ */
  _checkLevelEnd() {
    const accuracy = this.totalAnswered > 0
      ? Math.round((this.correctAnswers / this.totalAnswered) * 100)
      : 100;
    this._levelComplete(accuracy);
  }

  _levelComplete(accuracy) {
    this.isComplete = true;
    this._clearChallengeElements();
    if (this.timerEvent) this.timerEvent.destroy();
    if (this.timerBarTween) this.timerBarTween.destroy();

    const passed = accuracy >= ACCURACY_THRESHOLD;
    const elapsed = Math.round((this.time.now - this.startTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    const timeStr = `${mins}:${secs.toString().padStart(2, "0")}`;

    if (passed) {
      GameManager.completeLevel(4, accuracy);
      BadgeSystem.unlock("precision_master");
      ProgressTracker.saveProgress(GameManager.getState());
      this.cameras.main.flash(600, 0, 180, 200);

      for (let i = 0; i < 8; i++) {
        this.time.delayedCall(i * 200, () => {
          this.confettiParticles.emitParticleAt(
            Phaser.Math.Between(100, W - 100),
            Phaser.Math.Between(0, 50),
            15
          );
        });
      }
    }

    this.time.delayedCall(passed ? 500 : 200, () => {
      this._showEndScreen(passed, accuracy, timeStr);
    });
  }

  _showEndScreen(passed, accuracy, timeStr) {
    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.88).setDepth(200);

    const panelG = this.add.graphics().setDepth(201);
    const panelColor = passed ? 0x0d2b3a : 0x4a1e1e;
    const borderColor = passed ? 0x00bcd4 : 0xe74c3c;
    panelG.fillStyle(panelColor, 0.95);
    panelG.fillRoundedRect(W / 2 - 280, 80, 560, 430, 16);
    panelG.lineStyle(3, borderColor);
    panelG.strokeRoundedRect(W / 2 - 280, 80, 560, 430, 16);

    const titleText = passed ? "🎉 LEVEL 5 COMPLETE!" : "❌ ACCURACY TOO LOW";
    const titleColor = passed ? "#00bcd4" : "#e74c3c";

    this.add.text(W / 2, 120, titleText, {
      fontFamily: "Arial Black, Arial, sans-serif",
      fontSize: "28px",
      color: titleColor,
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(202);

    const statsY = 175;
    const stats = [
      `Correct: ${this.correctAnswers} / ${this.totalAnswered}`,
      `Accuracy: ${accuracy}%`,
      `Score: ${this.score}`,
      `Time: ${timeStr}`,
      `Lives Remaining: ${this.lives}`,
    ];

    stats.forEach((s, i) => {
      this.add.text(W / 2, statsY + i * 30, s, {
        fontFamily: "Arial",
        fontSize: "17px",
        color: "#ecf0f1",
      }).setOrigin(0.5).setDepth(202);
    });

    if (passed) {
      this.add.text(W / 2, statsY + stats.length * 30 + 15, "🔬 Badge Unlocked: Precision Master!", {
        fontFamily: "Arial",
        fontSize: "16px",
        color: "#f1c40f",
        fontStyle: "bold",
      }).setOrigin(0.5).setDepth(202);

      this.add.text(W / 2, statsY + stats.length * 30 + 50,
        "✅ You learned: Float precision matters!\nRounding & comparison are essential skills.", {
        fontFamily: "Arial",
        fontSize: "13px",
        color: "#bdc3c7",
        align: "center",
        lineSpacing: 5,
      }).setOrigin(0.5).setDepth(202);
    }

    const btnY = 445;
    if (passed) {
      this._createEndButton(W / 2 - 130, btnY, "NEXT LEVEL →", 0x2980b9, () => {
        this.scene.stop("UIScene");
        this.scene.start("MenuScene");
      });
      this._createEndButton(W / 2 + 130, btnY, "REPLAY", 0x00838f, () => {
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
    const bg = this.add.rectangle(x, y, 200, 44, color, 1).setDepth(202);
    bg.setStrokeStyle(2, Phaser.Display.Color.IntegerToColor(color).brighten(30).color);
    const txt = this.add.text(x, y, text, {
      fontFamily: "Arial",
      fontSize: "16px",
      color: "#ffffff",
      fontStyle: "bold",
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
    this._clearChallengeElements();
    if (this.timerEvent) this.timerEvent.destroy();
    if (this.timerBarTween) this.timerBarTween.destroy();

    this.cameras.main.shake(500, 0.02);
    this.cameras.main.flash(300, 255, 0, 0);

    this.time.delayedCall(600, () => {
      const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.88).setDepth(200);

      this.add.text(W / 2, H / 2 - 80, "💀 NO LIVES REMAINING", {
        fontFamily: "Arial Black, Arial, sans-serif",
        fontSize: "32px",
        color: "#e74c3c",
        fontStyle: "bold",
      }).setOrigin(0.5).setDepth(201);

      this.add.text(W / 2, H / 2 - 20, `You completed ${this.currentChallenge} / ${TOTAL_CHALLENGES} challenges`, {
        fontFamily: "Arial",
        fontSize: "20px",
        color: "#ecf0f1",
      }).setOrigin(0.5).setDepth(201);

      this._createEndButton(W / 2 - 100, H / 2 + 60, "TRY AGAIN", 0xe74c3c, () => {
        GameManager.resetLevel();
        this.scene.restart();
      });
      this._createEndButton(W / 2 + 100, H / 2 + 60, "MENU", 0x34495e, () => {
        this.scene.stop("UIScene");
        this.scene.start("MenuScene");
      });
    });
  }

  update() {
    // No continuous update needed; challenge-driven scene
  }

  shutdown() {
    if (this.timerEvent) this.timerEvent.destroy();
    if (this.timerBarTween) this.timerBarTween.destroy();
    this._clearChallengeElements();
  }
}
