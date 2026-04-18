/**
 * Level6Scene — "Float Calculations: Mission Control" (Restructuring Phase)
 * ==========================================================================
 * Mechanic: Arithmetic Challenge Arena
 * - Solve float math problems (add, subtract, multiply, divide)
 * - Precision awareness questions (0.1 + 0.2 = ?)
 * - Real-world scenarios (money, measurements)
 * - 18 problems, multiple choice, timed (15s each)
 * - Need ≥80% accuracy to pass
 *
 * Schema Theory: Restructuring — deep conceptual understanding of
 * float operations and real-world applications.
 */

import Phaser from "phaser";
import { GameManager } from "../GameManager.js";
import { BadgeSystem } from "../BadgeSystem.js";
import { ProgressTracker } from "../ProgressTracker.js";

/* ───────── Constants ───────── */
const W = 800;
const H = 600;
const TOTAL_PROBLEMS = 18;
const ACCURACY_THRESHOLD = 80;
const MAX_LIVES = 3;
const PROBLEM_TIME = 15000;

/* ───────── Problem Bank ───────── */

// Addition/Subtraction (5)
const ADD_SUB_PROBLEMS = [
  {
    question: "1.5 + 2.3 = ?",
    answer: 3.8,
    options: [3.8, 3.7, 4.8, 3.53],
    tip: "Line up the decimals: 1.5 + 2.3 = 3.8",
    category: "Addition",
  },
  {
    question: "5.75 - 2.25 = ?",
    answer: 3.50,
    options: [3.50, 3.25, 3.00, 3.75],
    tip: "5.75 - 2.25 = 3.50 — decimals line up nicely!",
    category: "Subtraction",
  },
  {
    question: "10.0 - 3.7 = ?",
    answer: 6.3,
    options: [6.3, 7.3, 6.7, 7.7],
    tip: "10.0 - 3.7 = 6.3 — borrow from the ones place",
    category: "Subtraction",
  },
  {
    question: "0.25 + 0.75 = ?",
    answer: 1.00,
    options: [1.00, 0.100, 0.75, 1.25],
    tip: "0.25 + 0.75 = 1.00 — quarter + three-quarters = whole!",
    category: "Addition",
  },
  {
    question: "-1.5 + 3.7 = ?",
    answer: 2.2,
    options: [2.2, -2.2, 5.2, -5.2],
    tip: "-1.5 + 3.7 = 2.2 — add the difference, keep the sign of larger",
    category: "Addition",
  },
];

// Multiplication/Division (5)
const MUL_DIV_PROBLEMS = [
  {
    question: "2.5 × 4 = ?",
    answer: 10.0,
    options: [10.0, 8.5, 6.5, 10.5],
    tip: "2.5 × 4 = 10.0 — same as 2½ × 4",
    category: "Multiplication",
  },
  {
    question: "3.0 × 1.5 = ?",
    answer: 4.5,
    options: [4.5, 3.5, 4.0, 5.0],
    tip: "3.0 × 1.5 = 4.5 — multiply, then count decimal places",
    category: "Multiplication",
  },
  {
    question: "7.5 ÷ 2.5 = ?",
    answer: 3.0,
    options: [3.0, 2.5, 5.0, 3.5],
    tip: "7.5 ÷ 2.5 = 3.0 — how many 2.5s fit in 7.5?",
    category: "Division",
  },
  {
    question: "0.6 × 0.5 = ?",
    answer: 0.30,
    options: [0.30, 0.11, 0.35, 3.0],
    tip: "0.6 × 0.5 = 0.30 — product has more decimal places!",
    category: "Multiplication",
  },
  {
    question: "9.9 ÷ 3 = ?",
    answer: 3.3,
    options: [3.3, 3.0, 3.6, 33],
    tip: "9.9 ÷ 3 = 3.3 — divide each digit by 3",
    category: "Division",
  },
];

// Precision Awareness (4)
const PRECISION_PROBLEMS = [
  {
    question: "In programming:\n0.1 + 0.2 = ?",
    answer: "0.30000000000000004",
    answerLabel: "≈ 0.30000...04",
    options: ["0.3", "≈ 0.30000...04", "0.12", "0.30"],
    tip: "Computers store floats in binary — 0.1 + 0.2 ≈ 0.30000000000000004!",
    category: "Precision",
  },
  {
    question: "Why does 0.1 + 0.2 ≠ 0.3\nin computers?",
    answer: "Binary representation",
    options: ["Bug in code", "Binary representation", "Wrong math", "Rounding error only"],
    tip: "Floats use binary (base 2) which can't perfectly represent 0.1 or 0.2",
    category: "Precision",
  },
  {
    question: "What is $19.99 + $0.01\nstored as a float?",
    answer: "Exactly $20.00",
    options: ["Exactly $20.00", "≈ $19.999...9", "≈ $20.0000...1", "Error"],
    tip: "Some float sums are exact! 19.99 + 0.01 = 20.00 in IEEE 754",
    category: "Precision",
  },
  {
    question: "To avoid float errors\nwith money, you should:",
    answer: "Use integers (cents)",
    options: ["Use integers (cents)", "Use doubles", "Round everything", "Ignore it"],
    tip: "Store money as integer cents (e.g., $19.99 → 1999) to avoid precision loss!",
    category: "Precision",
  },
];

// Real-World Scenarios (4)
const REAL_WORLD_PROBLEMS = [
  {
    question: "A coffee costs $4.50.\nYou pay with $10.00.\nChange = ?",
    answer: 5.50,
    options: [5.50, 6.50, 4.50, 5.00],
    tip: "$10.00 - $4.50 = $5.50 — basic money arithmetic!",
    category: "Real World",
  },
  {
    question: "A recipe needs 0.75 cups of flour.\nYou're making a triple batch.\nTotal flour = ?",
    answer: 2.25,
    options: [2.25, 2.75, 3.75, 0.225],
    tip: "0.75 × 3 = 2.25 cups — scaling recipes uses float multiplication!",
    category: "Real World",
  },
  {
    question: "A 2.5 km race.\nYou've run 1.75 km.\nRemaining = ?",
    answer: 0.75,
    options: [0.75, 1.25, 0.25, 1.75],
    tip: "2.5 - 1.75 = 0.75 km remaining — keep going!",
    category: "Real World",
  },
  {
    question: "Temperature dropped from\n23.5°C to 18.2°C.\nDrop = ?",
    answer: 5.3,
    options: [5.3, 4.3, 5.7, 41.7],
    tip: "23.5 - 18.2 = 5.3°C — real-world float subtraction!",
    category: "Real World",
  },
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
 *  LEVEL 6 SCENE
 * ═══════════════════════════════════════════════════════════════ */
export class Level6Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level6Scene" });
  }

  create() {
    this.physics.world.gravity.y = 0;

    /* ── State ── */
    this.currentProblem = 0;
    this.correctAnswers = 0;
    this.totalAnswered = 0;
    this.score = 0;
    this.lives = MAX_LIVES;
    this.isComplete = false;
    this.gameStarted = false;
    this.startTime = 0;
    this.combo = 0;
    this.problemActive = false;
    this.timerEvent = null;
    this.timerBarTween = null;
    this.problemElements = [];

    // Build problem sequence: interleave categories
    this.problems = this._buildProblemSequence();

    this._drawCommandCenterBackground();
    this._generateTextures();
    this._createParticles();
    this._createHUD();
    this._createScreenDecorations();

    const uiScene = this.scene.get("UIScene");
    if (uiScene && uiScene.setLevelLabel) {
      uiScene.setLevelLabel("Level 6: Restructuring — Mission Control!");
    }

    this._showInstruction();
  }

  _buildProblemSequence() {
    const addSub = shuffleArray(ADD_SUB_PROBLEMS);
    const mulDiv = shuffleArray(MUL_DIV_PROBLEMS);
    const precision = shuffleArray(PRECISION_PROBLEMS);
    const realWorld = shuffleArray(REAL_WORLD_PROBLEMS);

    // Interleave: 5 add/sub, 5 mul/div, 4 precision, 4 real-world
    const sequence = [];
    let ai = 0, mi = 0, pi = 0, ri = 0;

    // Phase 1: Addition/Subtraction (1-5)
    for (let i = 0; i < 5; i++) sequence.push(addSub[ai++]);
    // Phase 2: Multiplication/Division (6-10)
    for (let i = 0; i < 5; i++) sequence.push(mulDiv[mi++]);
    // Phase 3: Precision (11-14)
    for (let i = 0; i < 4; i++) sequence.push(precision[pi++]);
    // Phase 4: Real-World (15-18)
    for (let i = 0; i < 4; i++) sequence.push(realWorld[ri++]);

    return sequence;
  }

  /* ═══════════════════════════════════════════════════════════════
   *  COMMAND CENTER BACKGROUND
   * ═══════════════════════════════════════════════════════════════ */
  _drawCommandCenterBackground() {
    const gfx = this.add.graphics().setDepth(0);
    const topColor = 0x0a0a1a;
    const botColor = 0x0f1729;
    const steps = 40;
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const c = lerpColor(topColor, botColor, t);
      gfx.fillStyle(c, 1);
      gfx.fillRect(0, Math.floor((H * i) / steps), W, Math.ceil(H / steps) + 1);
    }

    // Hexagonal grid pattern
    const hexGfx = this.add.graphics().setDepth(1).setAlpha(0.03);
    hexGfx.lineStyle(1, 0x4ade80);
    for (let x = 0; x < W + 50; x += 50) {
      for (let y = 0; y < H + 50; y += 44) {
        const offset = (Math.floor(y / 44) % 2) * 25;
        hexGfx.strokeCircle(x + offset, y, 22);
      }
    }
  }

  _createScreenDecorations() {
    // Main "screen" border
    const screenGfx = this.add.graphics().setDepth(5);
    screenGfx.lineStyle(2, 0x4ade80, 0.3);
    screenGfx.strokeRoundedRect(80, 130, W - 160, 340, 8);

    // Corner accents
    const corners = [
      [80, 130], [W - 80, 130], [80, 470], [W - 80, 470],
    ];
    corners.forEach(([cx, cy]) => {
      screenGfx.fillStyle(0x4ade80, 0.6);
      screenGfx.fillCircle(cx, cy, 3);
    });

    // Status indicators on left
    for (let i = 0; i < 4; i++) {
      const y = 160 + i * 30;
      this.add.circle(50, y, 4, i < 2 ? 0x4ade80 : 0x334155, 0.6).setDepth(5);
    }

    // "MISSION CONTROL" text
    this.add.text(W / 2, 145, "▸ FLOAT OPERATIONS TERMINAL", {
      fontFamily: "monospace",
      fontSize: "11px",
      color: "#4ade80",
      alpha: 0.5,
    }).setOrigin(0.5).setDepth(6);
  }

  /* ═══════════════════════════════════════════════════════════════
   *  TEXTURES & PARTICLES
   * ═══════════════════════════════════════════════════════════════ */
  _generateTextures() {
    if (!this.textures.exists("greenSpark")) {
      const g = this.add.graphics();
      g.fillStyle(0x4ade80, 1);
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
      fontFamily: "monospace",
      fontSize: "20px",
      color: "#4ade80",
      fontStyle: "bold",
      stroke: "#0a0a1a",
      strokeThickness: 3,
    }).setDepth(dp);

    // Progress
    this.add.text(W / 2, 68, "Problems", {
      fontFamily: "monospace",
      fontSize: "12px",
      color: "#4ade80",
      fontStyle: "bold",
    }).setOrigin(0.5, 0).setDepth(dp);

    this.progressBarBg = this.add.rectangle(W / 2, 90, 260, 16, 0x0f1729, 0.6)
      .setStrokeStyle(1, 0x4ade80, 0.5).setDepth(dp);
    this.progressBarFill = this.add.rectangle(W / 2 - 130, 90, 0, 14, 0x4ade80)
      .setOrigin(0, 0.5).setDepth(dp + 1);
    this.progressTextHUD = this.add.text(W / 2, 90, "0 / 18", {
      fontFamily: "monospace",
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
    this.timerBarBg = this.add.rectangle(W / 2, 115, 500, 8, 0x0f1729, 0.6)
      .setStrokeStyle(1, 0x334155).setDepth(dp);
    this.timerBarFill = this.add.rectangle(W / 2 - 250, 115, 500, 6, 0x4ade80)
      .setOrigin(0, 0.5).setDepth(dp + 1);

    // Category label
    this.categoryLabel = this.add.text(W / 2, H - 55, "", {
      fontFamily: "monospace",
      fontSize: "12px",
      color: "#64748b",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(dp);

    // Tooltip
    this.tooltip = this.add.text(W / 2, H - 25, "", {
      fontFamily: "Arial",
      fontSize: "14px",
      color: "#ffffff",
      backgroundColor: "rgba(10, 10, 26, 0.9)",
      padding: { x: 14, y: 6 },
      align: "center",
      wordWrap: { width: 650 },
    }).setOrigin(0.5).setAlpha(0).setDepth(dp + 10);

    // Combo
    this.comboText = this.add.text(W / 2, 46, "", {
      fontFamily: "monospace",
      fontSize: "15px",
      color: "#fbbf24",
      fontStyle: "bold",
      stroke: "#0a0a1a",
      strokeThickness: 2,
    }).setOrigin(0.5).setAlpha(0).setDepth(dp);
  }

  /* ═══════════════════════════════════════════════════════════════
   *  INSTRUCTION OVERLAY
   * ═══════════════════════════════════════════════════════════════ */
  _showInstruction() {
    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.85).setDepth(200);

    const panelG = this.add.graphics().setDepth(201);
    panelG.fillStyle(0x0a0a1a, 0.98);
    panelG.fillRoundedRect(W / 2 - 320, 50, 640, 480, 16);
    panelG.lineStyle(3, 0x4ade80);
    panelG.strokeRoundedRect(W / 2 - 320, 50, 640, 480, 16);

    const title = this.add.text(W / 2, 90, "🚀 MISSION 6: FLOAT OPERATIONS", {
      fontFamily: "Arial Black, Arial, sans-serif",
      fontSize: "26px",
      color: "#4ade80",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(202);

    const sub = this.add.text(W / 2, 125, "Mission Control Calculator", {
      fontFamily: "Arial",
      fontSize: "18px",
      color: "#86efac",
      fontStyle: "italic",
    }).setOrigin(0.5).setDepth(202);

    const desc = this.add.text(W / 2, 235,
      "Apply everything you've learned about floats!\n\n" +
      "➕ Phase 1: Addition & Subtraction (5 problems)\n" +
      "✖️ Phase 2: Multiplication & Division (5 problems)\n" +
      "⚠️ Phase 3: Precision Awareness (4 problems)\n" +
      "🌍 Phase 4: Real-World Scenarios (4 problems)\n\n" +
      "Click the correct answer. You have 15 seconds!\n" +
      "Speed bonus: faster answers earn more XP.\n" +
      "You have 3 lives — use them wisely!",
      {
        fontFamily: "Arial",
        fontSize: "15px",
        color: "#bdc3c7",
        align: "center",
        lineSpacing: 6,
      }
    ).setOrigin(0.5).setDepth(202);

    const goal = this.add.text(W / 2, 415, "Solve 18 problems with 80%+ accuracy\nto earn the Calculation Wizard badge! 🧮", {
      fontFamily: "Arial",
      fontSize: "14px",
      color: "#f1c40f",
      align: "center",
      fontStyle: "bold",
      lineSpacing: 6,
    }).setOrigin(0.5).setDepth(202);

    const btnBg = this.add.rectangle(W / 2, 470, 260, 48, 0x166534, 1).setDepth(202);
    btnBg.setStrokeStyle(2, 0x4ade80);
    const btnTxt = this.add.text(W / 2, 470, "LAUNCH MISSION", {
      fontFamily: "Arial",
      fontSize: "20px",
      color: "#ffffff",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(203);

    btnBg.setInteractive({ useHandCursor: true });
    btnBg.on("pointerover", () => {
      btnBg.setFillStyle(0x4ade80);
      this.tweens.add({ targets: [btnBg, btnTxt], scaleX: 1.08, scaleY: 1.08, duration: 120 });
    });
    btnBg.on("pointerout", () => {
      btnBg.setFillStyle(0x166534);
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
    this._showNextProblem();
  }

  /* ═══════════════════════════════════════════════════════════════
   *  PROBLEM DISPLAY
   * ═══════════════════════════════════════════════════════════════ */
  _showNextProblem() {
    if (this.isComplete) return;
    if (this.currentProblem >= TOTAL_PROBLEMS) {
      this._checkLevelEnd();
      return;
    }

    this._clearProblemElements();

    const problem = this.problems[this.currentProblem];
    this.problemActive = true;
    this.problemStartTime = this.time.now;

    // Category label
    this.categoryLabel.setText(`[ ${problem.category.toUpperCase()} — Problem ${this.currentProblem + 1}/${TOTAL_PROBLEMS} ]`);

    // Phase header color
    let phaseColor;
    if (this.currentProblem < 5) phaseColor = 0x38bdf8;
    else if (this.currentProblem < 10) phaseColor = 0xf59e0b;
    else if (this.currentProblem < 14) phaseColor = 0xef4444;
    else phaseColor = 0x4ade80;

    // Timer
    this.timerBarFill.width = 500;
    this.timerBarFill.setFillStyle(0x4ade80);
    if (this.timerBarTween) this.timerBarTween.destroy();
    this.timerBarTween = this.tweens.add({
      targets: this.timerBarFill,
      width: 0,
      duration: PROBLEM_TIME,
      ease: "Linear",
      onUpdate: () => {
        const pct = this.timerBarFill.width / 500;
        if (pct < 0.2) this.timerBarFill.setFillStyle(0xe74c3c);
        else if (pct < 0.4) this.timerBarFill.setFillStyle(0xf1c40f);
      },
    });

    if (this.timerEvent) this.timerEvent.destroy();
    this.timerEvent = this.time.delayedCall(PROBLEM_TIME, () => {
      if (this.problemActive) this._onTimeout();
    });

    // Problem display
    const questionText = this.add.text(W / 2, 230, problem.question, {
      fontFamily: "Courier New, monospace",
      fontSize: "32px",
      color: "#e2e8f0",
      fontStyle: "bold",
      align: "center",
      lineSpacing: 8,
      shadow: { blur: 10, color: Phaser.Display.Color.IntegerToColor(phaseColor).rgba, fill: true },
    }).setOrigin(0.5).setDepth(110);
    this.problemElements.push(questionText);

    // Entrance animation
    questionText.setAlpha(0).setScale(0.8);
    this.tweens.add({
      targets: questionText,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: "Back.out",
    });

    // Answer options (2×2 grid)
    const shuffled = shuffleArray(problem.options);

    shuffled.forEach((opt, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const bx = 280 + col * 240;
      const by = 360 + row * 70;

      const displayStr = typeof opt === "number" ? String(opt) : opt;
      const isCorrect = typeof problem.answer === "number"
        ? opt === problem.answer
        : opt === problem.answer || (problem.answerLabel && opt === problem.answerLabel);

      const btn = this._createAnswerButton(bx, by, 210, 55, displayStr, phaseColor, () => {
        this._handleAnswer(isCorrect, problem.tip);
      });
      this.problemElements.push(...btn);
    });
  }

  _clearProblemElements() {
    this.problemElements.forEach(el => {
      if (el && el.destroy) el.destroy();
    });
    this.problemElements = [];
  }

  /* ═══════════════════════════════════════════════════════════════
   *  ANSWER BUTTON
   * ═══════════════════════════════════════════════════════════════ */
  _createAnswerButton(x, y, w, h, label, accentColor, callback) {
    const bg = this.add.rectangle(x, y, w, h, 0x0f1729, 0.9).setDepth(110);
    bg.setStrokeStyle(2, 0x334155);

    const txt = this.add.text(x, y, label, {
      fontFamily: "Courier New, monospace",
      fontSize: label.length > 15 ? "14px" : "18px",
      color: "#e2e8f0",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(111);

    bg.setInteractive({ useHandCursor: true });
    bg.on("pointerover", () => {
      bg.setStrokeStyle(2, accentColor);
      bg.setFillStyle(0x1e293b, 0.9);
      this.tweens.add({ targets: [bg, txt], scaleX: 1.05, scaleY: 1.05, duration: 100 });
    });
    bg.on("pointerout", () => {
      bg.setStrokeStyle(2, 0x334155);
      bg.setFillStyle(0x0f1729, 0.9);
      this.tweens.add({ targets: [bg, txt], scaleX: 1, scaleY: 1, duration: 100 });
    });
    bg.on("pointerup", callback);

    return [bg, txt];
  }

  /* ═══════════════════════════════════════════════════════════════
   *  ANSWER HANDLING
   * ═══════════════════════════════════════════════════════════════ */
  _handleAnswer(correct, tipText) {
    if (!this.problemActive) return;
    this.problemActive = false;
    this.totalAnswered++;
    this.currentProblem++;

    if (this.timerEvent) this.timerEvent.destroy();
    if (this.timerBarTween) this.timerBarTween.destroy();

    // Speed bonus: answer within 5s = bonus XP
    const answerTime = this.time.now - (this.problemStartTime || this.time.now);
    const speedBonus = answerTime < 5000 ? 5 : 0;

    if (correct) {
      this._onCorrectAnswer(tipText, speedBonus);
    } else {
      this._onWrongAnswer(tipText);
    }

    this._updateHUD();

    this.time.delayedCall(2000, () => {
      if (!this.isComplete) this._showNextProblem();
    });
  }

  _onCorrectAnswer(tipText, speedBonus) {
    this.correctAnswers++;
    this.combo++;
    this.score += 20 + speedBonus;

    const xp = (20 + speedBonus) * GameManager.getComboMultiplier();
    GameManager.addXP(xp);
    GameManager.addScore(20 + speedBonus);
    GameManager.addCombo();

    this.successParticles.emitParticleAt(W / 2, 280, 25);
    this.cameras.main.flash(200, 0, 150, 0);

    const bonusLabel = speedBonus > 0 ? ` (+${speedBonus} speed!)` : "";
    this._showPopup(W / 2, 180, `+${20 + speedBonus}${bonusLabel}`, "#4ade80");
    this._showTooltip(`✓ ${tipText}`, "#4ade80");

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

    this._showPopup(W / 2, 180, "-10", "#e74c3c");
    this._showTooltip(`✗ ${tipText}`, "#e74c3c");

    this._updateLives();

    if (this.lives <= 0) {
      this.time.delayedCall(800, () => this._gameOver());
    }
  }

  _onTimeout() {
    this._handleAnswer(false, "Time's up! Think faster next round.");
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
      const pct = Math.min(this.currentProblem / TOTAL_PROBLEMS, 1);
      this.tweens.add({
        targets: this.progressBarFill,
        width: 260 * pct,
        duration: 300,
        ease: "Cubic.out",
      });
      this.progressTextHUD.setText(`${this.currentProblem} / ${TOTAL_PROBLEMS}`);
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
      stroke: "#0a0a1a",
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
      delay: 2500,
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
    this._clearProblemElements();
    if (this.timerEvent) this.timerEvent.destroy();
    if (this.timerBarTween) this.timerBarTween.destroy();

    const passed = accuracy >= ACCURACY_THRESHOLD;
    const elapsed = Math.round((this.time.now - this.startTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    const timeStr = `${mins}:${secs.toString().padStart(2, "0")}`;

    if (passed) {
      GameManager.completeLevel(5, accuracy);
      BadgeSystem.unlock("calculation_wizard");
      ProgressTracker.saveProgress(GameManager.getState());
      this.cameras.main.flash(600, 100, 255, 100);

      for (let i = 0; i < 10; i++) {
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
    const panelColor = passed ? 0x0a2015 : 0x4a1e1e;
    const borderColor = passed ? 0x4ade80 : 0xe74c3c;
    panelG.fillStyle(panelColor, 0.95);
    panelG.fillRoundedRect(W / 2 - 280, 70, 560, 450, 16);
    panelG.lineStyle(3, borderColor);
    panelG.strokeRoundedRect(W / 2 - 280, 70, 560, 450, 16);

    const titleText = passed ? "🎉 MISSION COMPLETE!" : "❌ MISSION FAILED";
    const titleColor = passed ? "#4ade80" : "#e74c3c";

    this.add.text(W / 2, 110, titleText, {
      fontFamily: "Arial Black, Arial, sans-serif",
      fontSize: "30px",
      color: titleColor,
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(202);

    if (passed) {
      this.add.text(W / 2, 145, "Float Module Complete!", {
        fontFamily: "Arial",
        fontSize: "16px",
        color: "#86efac",
        fontStyle: "italic",
      }).setOrigin(0.5).setDepth(202);
    }

    const statsY = 175;
    const stats = [
      `Correct: ${this.correctAnswers} / ${this.totalAnswered}`,
      `Accuracy: ${accuracy}%`,
      `Score: ${this.score}`,
      `Time: ${timeStr}`,
      `Lives Remaining: ${this.lives}`,
    ];

    stats.forEach((s, i) => {
      this.add.text(W / 2, statsY + i * 28, s, {
        fontFamily: "Arial",
        fontSize: "17px",
        color: "#ecf0f1",
      }).setOrigin(0.5).setDepth(202);
    });

    if (passed) {
      this.add.text(W / 2, statsY + stats.length * 28 + 15, "🧮 Badge Unlocked: Calculation Wizard!", {
        fontFamily: "Arial",
        fontSize: "16px",
        color: "#f1c40f",
        fontStyle: "bold",
      }).setOrigin(0.5).setDepth(202);

      this.add.text(W / 2, statsY + stats.length * 28 + 48,
        "✅ You mastered float operations!\nAddition, multiplication, precision & real-world usage.", {
        fontFamily: "Arial",
        fontSize: "13px",
        color: "#bdc3c7",
        align: "center",
        lineSpacing: 5,
      }).setOrigin(0.5).setDepth(202);
    }

    const btnY = 450;
    if (passed) {
      this._createEndButton(W / 2 - 130, btnY, "MAIN MENU", 0x166534, () => {
        this.scene.stop("UIScene");
        this.scene.start("MenuScene");
      });
      this._createEndButton(W / 2 + 130, btnY, "REPLAY", 0x4ade80, () => {
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
    this._clearProblemElements();
    if (this.timerEvent) this.timerEvent.destroy();
    if (this.timerBarTween) this.timerBarTween.destroy();

    this.cameras.main.shake(500, 0.02);
    this.cameras.main.flash(300, 255, 0, 0);

    this.time.delayedCall(600, () => {
      const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.88).setDepth(200);

      this.add.text(W / 2, H / 2 - 80, "💀 MISSION ABORTED", {
        fontFamily: "Arial Black, Arial, sans-serif",
        fontSize: "32px",
        color: "#e74c3c",
        fontStyle: "bold",
      }).setOrigin(0.5).setDepth(201);

      this.add.text(W / 2, H / 2 - 20, `You solved ${this.currentProblem} / ${TOTAL_PROBLEMS} problems`, {
        fontFamily: "Arial",
        fontSize: "20px",
        color: "#ecf0f1",
      }).setOrigin(0.5).setDepth(201);

      this.add.text(W / 2, H / 2 + 15, "You ran out of lives!", {
        fontFamily: "Arial",
        fontSize: "16px",
        color: "#e74c3c",
      }).setOrigin(0.5).setDepth(201);

      this._createEndButton(W / 2 - 100, H / 2 + 80, "TRY AGAIN", 0xe74c3c, () => {
        GameManager.resetLevel();
        this.scene.restart();
      });
      this._createEndButton(W / 2 + 100, H / 2 + 80, "MENU", 0x34495e, () => {
        this.scene.stop("UIScene");
        this.scene.start("MenuScene");
      });
    });
  }

  update() {
    // Challenge-driven scene — no continuous update needed
  }

  shutdown() {
    if (this.timerEvent) this.timerEvent.destroy();
    if (this.timerBarTween) this.timerBarTween.destroy();
    this._clearProblemElements();
  }
}
