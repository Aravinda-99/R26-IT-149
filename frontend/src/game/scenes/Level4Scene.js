/**
 * Level4Scene — "Float Discovery: Decimal Ocean Dive" (Accretion Phase)
 * =====================================================================
 * Mechanic: Underwater Collection Adventure
 * - Player controls a submarine through an ocean environment
 * - Float numbers (decimals) drift in bubbles — COLLECT them!
 * - Integer numbers also drift — AVOID them!
 * - Collect 25 valid floats with ≥85% accuracy to pass
 * - Oxygen system depletes over time; gain/lose on correct/wrong
 *
 * Schema Theory: Accretion — introducing float/decimal concepts
 */

import Phaser from "phaser";
import { GameManager } from "../GameManager.js";
import { BadgeSystem } from "../BadgeSystem.js";
import { ProgressTracker } from "../ProgressTracker.js";

/* ───────── Constants ───────── */
const W = 800;
const H = 600;
const TARGET_COLLECT = 25;
const ACCURACY_THRESHOLD = 85;
const MAX_BUBBLES = 8;
const BUBBLE_RADIUS = 30;
const PLAYER_SPEED = 250;
const BOOST_SPEED = 400;
const BOOST_COOLDOWN = 3000;
const OXYGEN_MAX = 100;
const OXYGEN_DECAY_PER_SEC = 0.5;
const OXYGEN_PENALTY = 10;
const OXYGEN_REWARD = 5;
const SPAWN_INTERVAL = 2500;
const BUBBLE_RISE_SPEED = 50;

/* ───────── Number Pools ───────── */
const SIMPLE_FLOATS = [
  3.5, -2.7, 0.5, 1.25, -4.8, 6.1, -7.3, 8.9, -1.5, 2.4,
  -3.6, 5.2, -0.8, 4.7, -9.1, 0.3, -6.5, 7.8, -2.1, 1.6,
];
const MONEY_FLOATS = [9.99, 19.95, 0.01, -5.50, 4.99, 29.99, 0.50, 14.95, 7.49, 2.99];
const FRACTION_FLOATS = [0.5, 0.25, 0.333, 0.75, 0.125, -0.5, 0.667, -0.25, 0.2, -0.75];
const PIE_FLOATS = [3.14159, 2.718, 1.414, 1.732, 0.577, 2.236, 1.618, 3.14];
const SCIENTIFIC_FLOATS = [0.001, 0.0001, 0.123, 0.0056, 0.00789, 0.0023, 0.00001];

const INTEGERS = [
  5, -3, 0, 100, -42, 7, -8, 12, -15, 1,
  -1, 25, -20, 3, -6, 10, -9, 42, -17, 50,
];

const FLOAT_CATEGORIES = [
  { pool: SIMPLE_FLOATS, color: 0x00d4ff, label: "Simple", difficulty: 0 },
  { pool: MONEY_FLOATS, color: 0x2ecc71, label: "Money", difficulty: 0 },
  { pool: FRACTION_FLOATS, color: 0x3498db, label: "Fraction", difficulty: 1 },
  { pool: PIE_FLOATS, color: 0x9b59b6, label: "Math Constant", difficulty: 2 },
  { pool: SCIENTIFIC_FLOATS, color: 0x1abc9c, label: "Scientific", difficulty: 2 },
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

function getFloatTip(value, category) {
  const v = typeof value === "number" ? value : parseFloat(value);
  const tips = {
    Money: [
      `✓ Money values like $${Math.abs(v).toFixed(2)} are floats!`,
      `✓ Prices always use decimal points — floats!`,
    ],
    Fraction: [
      `✓ ${v} represents a fraction as a float!`,
      `✓ ${v} is the decimal form of a fraction!`,
    ],
    "Math Constant": [
      `✓ ${v} is a famous math constant — a float!`,
      `✓ Constants like ${v} always have decimals!`,
    ],
    Scientific: [
      `✓ ${v} is a very precise float!`,
      `✓ Scientific values like ${v} need decimal precision!`,
    ],
    Simple: [
      `✓ ${v} is a FLOAT — it has a decimal point!`,
      `✓ Great catch! ${v} has fractional digits!`,
      `✓ ${v} is a decimal number — that's a float!`,
    ],
  };
  const pool = tips[category] || tips.Simple;
  return pool[Math.floor(Math.random() * pool.length)];
}

function getIntegerTip(value) {
  const tips = [
    `✗ ${value} is an INTEGER — no decimal point!`,
    `✗ Whole numbers like ${value} are NOT floats!`,
    `✗ ${value} has no fractional part — it's an integer!`,
  ];
  return tips[Math.floor(Math.random() * tips.length)];
}

/* ═══════════════════════════════════════════════════════════════
 *  LEVEL 4 SCENE
 * ═══════════════════════════════════════════════════════════════ */
export class Level4Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level4Scene" });
  }

  create() {
    this.physics.world.gravity.y = 0;

    /* ── State ── */
    this.floatsCollected = 0;
    this.totalAttempts = 0;
    this.wrongAttempts = 0;
    this.score = 0;
    this.oxygen = OXYGEN_MAX;
    this.isComplete = false;
    this.gameStarted = false;
    this.bubbles = [];
    this.startTime = 0;
    this.combo = 0;
    this.boostAvailable = true;
    this.isBoosting = false;
    this.boostTimer = null;

    this._drawOceanBackground();
    this._generateTextures();
    this._createParticles();
    this._createAmbientBubbles();
    this._createPlayer();
    this._createHUD();

    const uiScene = this.scene.get("UIScene");
    if (uiScene && uiScene.setLevelLabel) {
      uiScene.setLevelLabel("Level 4: Accretion — Decimal Ocean Dive!");
    }

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
    });

    this._showInstruction();
  }

  /* ═══════════════════════════════════════════════════════════════
   *  OCEAN BACKGROUND
   * ═══════════════════════════════════════════════════════════════ */
  _drawOceanBackground() {
    const gfx = this.add.graphics().setDepth(0);
    const topColor = 0x006994;
    const botColor = 0x003f5c;
    const steps = 60;
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const c = lerpColor(topColor, botColor, t);
      gfx.fillStyle(c, 1);
      gfx.fillRect(0, Math.floor((H * i) / steps), W, Math.ceil(H / steps) + 1);
    }

    // Light rays from surface
    const rayGfx = this.add.graphics().setDepth(1).setAlpha(0.08);
    for (let i = 0; i < 5; i++) {
      const x = 100 + i * 160;
      rayGfx.fillStyle(0xffffff, 1);
      rayGfx.beginPath();
      rayGfx.moveTo(x - 5, 0);
      rayGfx.lineTo(x + 5, 0);
      rayGfx.lineTo(x + 40 + i * 10, H);
      rayGfx.lineTo(x - 40 - i * 5, H);
      rayGfx.closePath();
      rayGfx.fill();
    }

    // Depth zone labels (faint text on left)
    const zoneStyle = { fontFamily: "Arial", fontSize: "11px", color: "#ffffff", alpha: 0.15 };
    this.add.text(8, 80, "SHALLOW", zoneStyle).setAlpha(0.2).setDepth(2);
    this.add.text(8, 280, "MEDIUM", zoneStyle).setAlpha(0.15).setDepth(2);
    this.add.text(8, 480, "DEEP", zoneStyle).setAlpha(0.1).setDepth(2);

    // Zone divider lines (subtle)
    const lineGfx = this.add.graphics().setDepth(1).setAlpha(0.06);
    lineGfx.lineStyle(1, 0xffffff);
    lineGfx.beginPath();
    lineGfx.moveTo(0, 200);
    lineGfx.lineTo(W, 200);
    lineGfx.strokePath();
    lineGfx.beginPath();
    lineGfx.moveTo(0, 420);
    lineGfx.lineTo(W, 420);
    lineGfx.strokePath();
  }

  /* ═══════════════════════════════════════════════════════════════
   *  TEXTURES
   * ═══════════════════════════════════════════════════════════════ */
  _generateTextures() {
    // Submarine body
    if (!this.textures.exists("subBody")) {
      const g = this.add.graphics();
      // Hull
      g.fillStyle(0x2980b9, 1);
      g.fillRoundedRect(4, 12, 72, 36, 14);
      // Darker bottom hull
      g.fillStyle(0x1a5276, 1);
      g.fillRoundedRect(4, 30, 72, 18, { tl: 0, tr: 0, bl: 14, br: 14 });
      // Cockpit window
      g.fillStyle(0x85c1e9, 1);
      g.fillCircle(54, 26, 10);
      g.fillStyle(0xaed6f1, 1);
      g.fillCircle(56, 24, 4);
      // Periscope
      g.fillStyle(0x5dade2, 1);
      g.fillRect(48, 2, 4, 14);
      g.fillRect(48, 2, 12, 4);
      // Tail fin
      g.fillStyle(0x2471a3, 1);
      g.beginPath();
      g.moveTo(4, 18);
      g.lineTo(0, 6);
      g.lineTo(0, 48);
      g.lineTo(4, 38);
      g.closePath();
      g.fill();
      // Propeller area
      g.fillStyle(0x7f8c8d, 1);
      g.fillRect(0, 22, 6, 4);
      g.fillRect(0, 30, 6, 4);
      g.generateTexture("subBody", 80, 56);
      g.destroy();
    }

    // Blue spark for water splash
    if (!this.textures.exists("blueSpark")) {
      const g = this.add.graphics();
      g.fillStyle(0x00d4ff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("blueSpark", 8, 8);
      g.destroy();
    }

    // Red spark
    if (!this.textures.exists("redSpark")) {
      const g = this.add.graphics();
      g.fillStyle(0xe74c3c, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("redSpark", 8, 8);
      g.destroy();
    }

    // Confetti spark
    if (!this.textures.exists("confettiSpark")) {
      const g = this.add.graphics();
      g.fillStyle(0xffd700, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("confettiSpark", 8, 8);
      g.destroy();
    }

    // Tiny bubble for ambient
    if (!this.textures.exists("tinyBubble")) {
      const g = this.add.graphics();
      g.fillStyle(0xffffff, 0.4);
      g.fillCircle(3, 3, 3);
      g.generateTexture("tinyBubble", 6, 6);
      g.destroy();
    }
  }

  /* ═══════════════════════════════════════════════════════════════
   *  PARTICLES
   * ═══════════════════════════════════════════════════════════════ */
  _createParticles() {
    this.splashParticles = this.add.particles(0, 0, "blueSpark", {
      speed: { min: 80, max: 250 },
      scale: { start: 1.2, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 700,
      blendMode: "ADD",
      emitting: false,
    });

    this.alertParticles = this.add.particles(0, 0, "redSpark", {
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
   *  AMBIENT BUBBLES (decorative)
   * ═══════════════════════════════════════════════════════════════ */
  _createAmbientBubbles() {
    this.ambientBubbles = [];
    for (let i = 0; i < 25; i++) {
      const x = Phaser.Math.Between(10, W - 10);
      const y = Phaser.Math.Between(0, H);
      const size = Phaser.Math.FloatBetween(1, 4);
      const alpha = Phaser.Math.FloatBetween(0.1, 0.3);
      const bubble = this.add.circle(x, y, size, 0xffffff, alpha).setDepth(3);
      this.ambientBubbles.push({
        obj: bubble,
        speed: Phaser.Math.FloatBetween(0.2, 0.8),
        wobbleOffset: Phaser.Math.FloatBetween(0, Math.PI * 2),
        wobbleSpeed: Phaser.Math.FloatBetween(0.5, 1.5),
      });
    }
  }

  /* ═══════════════════════════════════════════════════════════════
   *  PLAYER (SUBMARINE)
   * ═══════════════════════════════════════════════════════════════ */
  _createPlayer() {
    this.player = this.physics.add.sprite(W / 2, H / 2, "subBody");
    this.player.setCollideWorldBounds(true);
    this.player.setDrag(200);
    this.player.body.setAllowGravity(false);
    this.player.body.setSize(70, 44);
    this.player.setDepth(50);

    // Headlight cone (follows sub)
    this.headlight = this.add.graphics().setDepth(49).setAlpha(0.06);
    this._drawHeadlight();

    // Propeller animation: small circles that rotate
    this.propAngle = 0;
  }

  _drawHeadlight() {
    this.headlight.clear();
    this.headlight.fillStyle(0xffffff, 1);
    this.headlight.beginPath();
    this.headlight.moveTo(this.player.x + 36, this.player.y - 2);
    this.headlight.lineTo(this.player.x + 120, this.player.y - 40);
    this.headlight.lineTo(this.player.x + 120, this.player.y + 36);
    this.headlight.closePath();
    this.headlight.fill();
  }

  /* ═══════════════════════════════════════════════════════════════
   *  HUD
   * ═══════════════════════════════════════════════════════════════ */
  _createHUD() {
    const dp = 100;

    // Score (top-left)
    this.scoreText = this.add.text(16, 68, "Score: 0", {
      fontFamily: "Arial",
      fontSize: "22px",
      color: "#ffffff",
      fontStyle: "bold",
      stroke: "#003f5c",
      strokeThickness: 3,
    }).setDepth(dp);

    // Progress (top center)
    this.add.text(W / 2, 68, "Floats Collected", {
      fontFamily: "Arial",
      fontSize: "12px",
      color: "#aed6f1",
      fontStyle: "bold",
    }).setOrigin(0.5, 0).setDepth(dp);

    this.progressBarBg = this.add.rectangle(W / 2, 90, 260, 16, 0x1a5276, 0.6)
      .setStrokeStyle(1, 0x2980b9).setDepth(dp);
    this.progressBarFill = this.add.rectangle(W / 2 - 130, 90, 0, 14, 0x00d4ff)
      .setOrigin(0, 0.5).setDepth(dp + 1);
    this.progressText = this.add.text(W / 2, 90, "0 / 25", {
      fontFamily: "Arial",
      fontSize: "11px",
      color: "#ffffff",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(dp + 2);

    // Oxygen bar (top-right)
    this.add.text(W - 170, 64, "O₂", {
      fontFamily: "Arial",
      fontSize: "14px",
      color: "#2ecc71",
      fontStyle: "bold",
    }).setDepth(dp);

    this.oxygenBarBg = this.add.rectangle(W - 85, 80, 140, 16, 0x1a5276, 0.6)
      .setStrokeStyle(1, 0x2980b9).setDepth(dp);
    this.oxygenBarFill = this.add.rectangle(W - 155, 80, 140, 14, 0x2ecc71)
      .setOrigin(0, 0.5).setDepth(dp + 1);
    this.oxygenText = this.add.text(W - 85, 80, "100%", {
      fontFamily: "Arial",
      fontSize: "10px",
      color: "#ffffff",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(dp + 2);

    // Depth indicator (left vertical bar)
    this.depthBarBg = this.add.rectangle(20, H / 2, 8, H - 140, 0x1a5276, 0.4)
      .setStrokeStyle(1, 0x2980b9, 0.3).setDepth(dp);
    this.depthMarker = this.add.circle(20, H / 2, 6, 0x00d4ff, 0.8).setDepth(dp + 1);

    // Tooltip
    this.tooltip = this.add.text(W / 2, H - 40, "", {
      fontFamily: "Arial",
      fontSize: "16px",
      color: "#ffffff",
      backgroundColor: "rgba(0, 60, 80, 0.9)",
      padding: { x: 14, y: 6 },
      align: "center",
      wordWrap: { width: 600 },
    }).setOrigin(0.5).setAlpha(0).setDepth(dp + 10);

    // Combo text
    this.comboText = this.add.text(W / 2, 110, "", {
      fontFamily: "Arial",
      fontSize: "15px",
      color: "#fbbf24",
      fontStyle: "bold",
      stroke: "#003f5c",
      strokeThickness: 2,
    }).setOrigin(0.5).setAlpha(0).setDepth(dp);

    // Boost indicator
    this.boostText = this.add.text(W / 2, H - 16, "SPACE = BOOST", {
      fontFamily: "Arial",
      fontSize: "11px",
      color: "#5dade2",
    }).setOrigin(0.5).setAlpha(0).setDepth(dp);
  }

  /* ═══════════════════════════════════════════════════════════════
   *  INSTRUCTION OVERLAY
   * ═══════════════════════════════════════════════════════════════ */
  _showInstruction() {
    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.85).setDepth(200);

    const panelG = this.add.graphics().setDepth(201);
    panelG.fillStyle(0x003345, 0.98);
    panelG.fillRoundedRect(W / 2 - 320, 50, 640, 480, 16);
    panelG.lineStyle(3, 0x00d4ff);
    panelG.strokeRoundedRect(W / 2 - 320, 50, 640, 480, 16);

    const title = this.add.text(W / 2, 90, "🌊 MISSION 4: FLOAT DISCOVERY", {
      fontFamily: "Arial Black, Arial, sans-serif",
      fontSize: "26px",
      color: "#00d4ff",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(202);

    const sub = this.add.text(W / 2, 125, "Decimal Ocean Dive", {
      fontFamily: "Arial",
      fontSize: "18px",
      color: "#5dade2",
      fontStyle: "italic",
    }).setOrigin(0.5).setDepth(202);

    const desc = this.add.text(W / 2, 225,
      "Floats are numbers with DECIMAL POINTS!\n" +
      "They represent fractions and precise values.\n\n" +
      "🔵  COLLECT float bubbles (3.14, 0.5, 9.99)\n" +
      "🟠  AVOID integer bubbles (5, -3, 100)\n\n" +
      "Controls:\n" +
      "← → ↑ ↓  or  WASD  to swim\n" +
      "SPACE  for speed boost (3s cooldown)\n\n" +
      "⚠ Watch your OXYGEN — it drains over time!\n" +
      "Correct catches restore O₂, mistakes drain it!",
      {
        fontFamily: "Arial",
        fontSize: "15px",
        color: "#bdc3c7",
        align: "center",
        lineSpacing: 6,
      }
    ).setOrigin(0.5).setDepth(202);

    const goal = this.add.text(W / 2, 410, "Collect 25 floats with 85%+ accuracy\nto earn the Float Explorer badge! 🌊", {
      fontFamily: "Arial",
      fontSize: "14px",
      color: "#f1c40f",
      align: "center",
      fontStyle: "bold",
      lineSpacing: 6,
    }).setOrigin(0.5).setDepth(202);

    const btnBg = this.add.rectangle(W / 2, 470, 240, 48, 0x00a8cc, 1).setDepth(202);
    btnBg.setStrokeStyle(2, 0x00d4ff);
    const btnTxt = this.add.text(W / 2, 470, "DIVE IN!", {
      fontFamily: "Arial",
      fontSize: "20px",
      color: "#ffffff",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(203);

    btnBg.setInteractive({ useHandCursor: true });
    btnBg.on("pointerover", () => {
      btnBg.setFillStyle(0x00d4ff);
      this.tweens.add({ targets: [btnBg, btnTxt], scaleX: 1.08, scaleY: 1.08, duration: 120 });
    });
    btnBg.on("pointerout", () => {
      btnBg.setFillStyle(0x00a8cc);
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
    GameManager.set("lives", 3);
    this.boostText.setAlpha(0.6);
    this._scheduleSpawn();
  }

  /* ═══════════════════════════════════════════════════════════════
   *  SPAWNING
   * ═══════════════════════════════════════════════════════════════ */
  _getIntegerChance() {
    if (this.floatsCollected < 10) return 0.20;
    if (this.floatsCollected < 20) return 0.28;
    return 0.35;
  }

  _getDifficulty() {
    if (this.floatsCollected < 10) return 0;
    if (this.floatsCollected < 20) return 1;
    return 2;
  }

  _scheduleSpawn() {
    if (this.isComplete) return;
    this.spawnTimer = this.time.delayedCall(SPAWN_INTERVAL, () => {
      this._spawnBubble();
      this._scheduleSpawn();
    });
  }

  _spawnBubble() {
    if (this.isComplete) return;
    this.bubbles = this.bubbles.filter(b => b.active);
    if (this.bubbles.length >= MAX_BUBBLES) return;

    const isFloat = Math.random() > this._getIntegerChance();
    const difficulty = this._getDifficulty();

    let value, displayText, category, bubbleColor;

    if (isFloat) {
      // Pick from categories matching current difficulty
      const eligible = FLOAT_CATEGORIES.filter(c => c.difficulty <= difficulty);
      const cat = Phaser.Utils.Array.GetRandom(eligible);
      value = Phaser.Utils.Array.GetRandom(cat.pool);
      displayText = String(value);
      category = cat.label;
      bubbleColor = cat.color;
    } else {
      value = Phaser.Utils.Array.GetRandom(INTEGERS);
      displayText = String(value);
      category = null;
      bubbleColor = 0xff6b35;
    }

    // Spawn position — deeper = more complex
    let spawnY;
    if (!isFloat) {
      spawnY = Phaser.Math.Between(H + 20, H + 60);
    } else if (difficulty === 0) {
      spawnY = Phaser.Math.Between(H + 20, H + 60);
    } else if (difficulty === 1) {
      spawnY = Phaser.Math.Between(H + 30, H + 80);
    } else {
      spawnY = Phaser.Math.Between(H + 40, H + 100);
    }
    const spawnX = Phaser.Math.Between(60, W - 60);

    const container = this.add.container(spawnX, spawnY).setDepth(40);

    // Bubble circle
    const outerGlow = this.add.circle(0, 0, BUBBLE_RADIUS + 4, bubbleColor, 0.15);
    container.add(outerGlow);

    const circle = this.add.circle(0, 0, BUBBLE_RADIUS, bubbleColor, isFloat ? 0.25 : 0.3);
    circle.setStrokeStyle(2, bubbleColor, 0.8);
    container.add(circle);

    // Highlight reflection
    const highlight = this.add.circle(-8, -10, 6, 0xffffff, 0.2);
    container.add(highlight);

    // Number text
    const fontSize = displayText.length > 5 ? "13px" : displayText.length > 3 ? "15px" : "18px";
    const txt = this.add.text(0, 0, displayText, {
      fontFamily: "Courier New, monospace",
      fontSize,
      color: "#ffffff",
      fontStyle: "bold",
      stroke: isFloat ? "#003f5c" : "#7f1d1d",
      strokeThickness: 2,
    }).setOrigin(0.5);
    container.add(txt);

    // Category label for special floats
    if (isFloat && category !== "Simple") {
      const labelTxt = this.add.text(0, BUBBLE_RADIUS + 8, category, {
        fontFamily: "Arial",
        fontSize: "9px",
        color: isFloat ? "#aed6f1" : "#fca5a5",
        fontStyle: "bold",
      }).setOrigin(0.5);
      container.add(labelTxt);
    }

    // Physics
    this.physics.add.existing(container);
    container.body.setCircle(BUBBLE_RADIUS, -BUBBLE_RADIUS, -BUBBLE_RADIUS);
    container.body.setAllowGravity(false);
    container.body.setVelocityY(-BUBBLE_RISE_SPEED);

    container.setData("isFloat", isFloat);
    container.setData("value", value);
    container.setData("displayText", displayText);
    container.setData("category", category);
    container.setData("wobbleBase", spawnX);
    container.setData("wobbleTime", 0);
    container.active = true;

    // Scale-in animation
    container.setScale(0);
    this.tweens.add({
      targets: container,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: "Back.out",
    });

    // Overlap with player
    this.physics.add.overlap(this.player, container, () => {
      this._onCollectBubble(container);
    }, null, this);

    this.bubbles.push(container);
  }

  /* ═══════════════════════════════════════════════════════════════
   *  BUBBLE COLLECTION
   * ═══════════════════════════════════════════════════════════════ */
  _onCollectBubble(container) {
    if (this.isComplete || !container.active) return;
    container.active = false;

    const isFloat = container.getData("isFloat");
    const value = container.getData("value");
    const displayText = container.getData("displayText");
    const category = container.getData("category");
    const cx = container.x;
    const cy = container.y;

    this.tweens.killTweensOf(container);
    container.destroy();

    if (isFloat) {
      this._onCorrectCollect(cx, cy, value, displayText, category);
    } else {
      this._onWrongCollect(cx, cy, value, displayText);
    }
  }

  _onCorrectCollect(cx, cy, value, displayText, category) {
    this.floatsCollected++;
    this.totalAttempts++;
    this.combo++;
    this.score += 15;

    GameManager.addXP(15 * GameManager.getComboMultiplier());
    GameManager.addScore(15);
    GameManager.addCombo();

    // Oxygen gain
    this.oxygen = Math.min(OXYGEN_MAX, this.oxygen + OXYGEN_REWARD);

    // Effects
    this.splashParticles.emitParticleAt(cx, cy, 20);
    this._showPopup(cx, cy - 20, "+15", "#00d4ff");
    this._showTooltip(getFloatTip(value, category), "#00d4ff");

    if (this.combo >= 5) {
      this.cameras.main.flash(200, 0, 200, 255);
    }

    this._updateHUD();

    if (this.floatsCollected >= TARGET_COLLECT) {
      this._checkLevelEnd();
    }
  }

  _onWrongCollect(cx, cy, value, displayText) {
    this.totalAttempts++;
    this.wrongAttempts++;
    this.combo = 0;
    this.score = Math.max(0, this.score - 10);

    GameManager.resetCombo();

    // Oxygen penalty
    this.oxygen = Math.max(0, this.oxygen - OXYGEN_PENALTY);

    // Knockback — push submarine away from bubble
    const angle = Phaser.Math.Angle.Between(cx, cy, this.player.x, this.player.y);
    this.player.body.setVelocity(
      Math.cos(angle) * 300,
      Math.sin(angle) * 300
    );

    // Effects
    this.alertParticles.emitParticleAt(cx, cy, 15);
    this.cameras.main.shake(250, 0.015);
    this.cameras.main.flash(200, 255, 50, 0);

    this._showPopup(cx, cy - 20, "-10", "#ff6b35");
    this._showTooltip(getIntegerTip(displayText), "#ff6b35");

    this._updateHUD();

    if (this.oxygen <= 0) {
      this._gameOver();
    }
  }

  /* ═══════════════════════════════════════════════════════════════
   *  HUD UPDATES
   * ═══════════════════════════════════════════════════════════════ */
  _updateHUD() {
    // Score
    if (this.scoreText && this.scoreText.active) {
      this.scoreText.setText(`Score: ${this.score}`);
      this.tweens.add({
        targets: this.scoreText,
        scaleX: 1.15, scaleY: 1.15,
        yoyo: true,
        duration: 100,
      });
    }

    // Progress bar
    if (this.progressBarFill && this.progressText) {
      const pct = Math.min(this.floatsCollected / TARGET_COLLECT, 1);
      this.tweens.add({
        targets: this.progressBarFill,
        width: 260 * pct,
        duration: 300,
        ease: "Cubic.out",
      });
      this.progressText.setText(`${this.floatsCollected} / ${TARGET_COLLECT}`);
    }

    // Oxygen bar
    if (this.oxygenBarFill && this.oxygenText) {
      const pct = this.oxygen / OXYGEN_MAX;
      this.tweens.add({
        targets: this.oxygenBarFill,
        width: 140 * pct,
        duration: 200,
      });
      this.oxygenText.setText(`${Math.round(this.oxygen)}%`);

      // Color: green → yellow → red
      let oxyColor;
      if (pct > 0.5) oxyColor = 0x2ecc71;
      else if (pct > 0.25) oxyColor = 0xf1c40f;
      else oxyColor = 0xe74c3c;
      this.oxygenBarFill.setFillStyle(oxyColor);
    }

    // Combo
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

  /* ═══════════════════════════════════════════════════════════════
   *  POPUPS & TOOLTIPS
   * ═══════════════════════════════════════════════════════════════ */
  _showPopup(x, y, text, color) {
    const popup = this.add.text(x, y, text, {
      fontFamily: "Arial",
      fontSize: "22px",
      color,
      fontStyle: "bold",
      stroke: "#003f5c",
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
    const accuracy = this.totalAttempts > 0
      ? Math.round(((this.totalAttempts - this.wrongAttempts) / this.totalAttempts) * 100)
      : 100;
    this._levelComplete(accuracy);
  }

  _levelComplete(accuracy) {
    this.isComplete = true;
    if (this.spawnTimer) this.spawnTimer.destroy();

    this.bubbles.forEach(b => {
      if (b && b.active) {
        this.tweens.killTweensOf(b);
        b.destroy();
      }
    });

    const passed = accuracy >= ACCURACY_THRESHOLD;
    const elapsed = Math.round((this.time.now - this.startTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    const timeStr = `${mins}:${secs.toString().padStart(2, "0")}`;

    if (passed) {
      GameManager.completeLevel(3, accuracy);
      BadgeSystem.unlock("float_explorer");
      ProgressTracker.saveProgress(GameManager.getState());
      this.cameras.main.flash(600, 0, 200, 255);

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
    const panelColor = passed ? 0x003345 : 0x4a1e1e;
    const borderColor = passed ? 0x00d4ff : 0xe74c3c;
    panelG.fillStyle(panelColor, 0.95);
    panelG.fillRoundedRect(W / 2 - 280, 80, 560, 430, 16);
    panelG.lineStyle(3, borderColor);
    panelG.strokeRoundedRect(W / 2 - 280, 80, 560, 430, 16);

    const titleText = passed ? "🎉 LEVEL 4 COMPLETE!" : "❌ ACCURACY TOO LOW";
    const titleColor = passed ? "#00d4ff" : "#e74c3c";

    this.add.text(W / 2, 120, titleText, {
      fontFamily: "Arial Black, Arial, sans-serif",
      fontSize: "28px",
      color: titleColor,
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(202);

    const statsY = 175;
    const stats = [
      `Floats Collected: ${this.floatsCollected} / ${TARGET_COLLECT}`,
      `Accuracy: ${accuracy}%`,
      `Score: ${this.score}`,
      `Time: ${timeStr}`,
      `Oxygen Remaining: ${Math.round(this.oxygen)}%`,
      `Wrong Catches: ${this.wrongAttempts}`,
    ];

    stats.forEach((s, i) => {
      this.add.text(W / 2, statsY + i * 30, s, {
        fontFamily: "Arial",
        fontSize: "17px",
        color: "#ecf0f1",
      }).setOrigin(0.5).setDepth(202);
    });

    if (passed) {
      this.add.text(W / 2, statsY + stats.length * 30 + 15, "🌊 Badge Unlocked: Float Explorer!", {
        fontFamily: "Arial",
        fontSize: "16px",
        color: "#f1c40f",
        fontStyle: "bold",
      }).setOrigin(0.5).setDepth(202);

      this.add.text(W / 2, statsY + stats.length * 30 + 50,
        "✅ You learned: Floats are numbers with\ndecimal points that represent fractional values!", {
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
      this._createEndButton(W / 2 + 130, btnY, "REPLAY", 0x00a8cc, () => {
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
    if (this.spawnTimer) this.spawnTimer.destroy();

    this.bubbles.forEach(b => {
      if (b && b.active) {
        this.tweens.killTweensOf(b);
        b.destroy();
      }
    });

    this.cameras.main.shake(500, 0.02);
    this.cameras.main.flash(300, 255, 0, 0);

    this.time.delayedCall(600, () => {
      const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.88).setDepth(200);

      this.add.text(W / 2, H / 2 - 80, "💀 OXYGEN DEPLETED", {
        fontFamily: "Arial Black, Arial, sans-serif",
        fontSize: "32px",
        color: "#e74c3c",
        fontStyle: "bold",
      }).setOrigin(0.5).setDepth(201);

      this.add.text(W / 2, H / 2 - 20, `You collected ${this.floatsCollected} / ${TARGET_COLLECT} floats`, {
        fontFamily: "Arial",
        fontSize: "20px",
        color: "#ecf0f1",
      }).setOrigin(0.5).setDepth(201);

      this.add.text(W / 2, H / 2 + 15, "Your oxygen ran out!", {
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

  /* ═══════════════════════════════════════════════════════════════
   *  UPDATE LOOP
   * ═══════════════════════════════════════════════════════════════ */
  update(time, delta) {
    if (!this.gameStarted || this.isComplete) {
      this._updateAmbient(time);
      return;
    }

    const dt = delta / 1000;

    /* ── Player movement (8-directional) ── */
    const speed = this.isBoosting ? BOOST_SPEED : PLAYER_SPEED;
    let vx = 0;
    let vy = 0;

    const left = this.cursors.left.isDown || this.wasd.left.isDown;
    const right = this.cursors.right.isDown || this.wasd.right.isDown;
    const up = this.cursors.up.isDown || this.wasd.up.isDown;
    const down = this.cursors.down.isDown || this.wasd.down.isDown;

    if (left) vx = -speed;
    else if (right) vx = speed;
    if (up) vy = -speed;
    else if (down) vy = speed;

    // Normalize diagonal speed
    if (vx !== 0 && vy !== 0) {
      vx *= 0.707;
      vy *= 0.707;
    }

    this.player.setVelocity(vx, vy);

    // Submarine tilt in movement direction
    if (vy < 0) this.player.setAngle(-8);
    else if (vy > 0) this.player.setAngle(8);
    else this.player.setAngle(0);

    // Flip for left/right
    this.player.setFlipX(vx < 0);

    // Boost handling
    if (Phaser.Input.Keyboard.JustDown(this.wasd.space) && this.boostAvailable) {
      this.isBoosting = true;
      this.boostAvailable = false;
      this.boostText.setText("BOOST ACTIVE!").setColor("#fbbf24");

      this.time.delayedCall(800, () => {
        this.isBoosting = false;
        this.boostText.setText("COOLDOWN...").setColor("#e74c3c");
      });
      this.time.delayedCall(BOOST_COOLDOWN, () => {
        this.boostAvailable = true;
        this.boostText.setText("SPACE = BOOST").setColor("#5dade2");
      });
    }

    /* ── Headlight follows sub ── */
    if (this.headlight) {
      this._drawHeadlight();
    }

    /* ── Depth marker ── */
    if (this.depthMarker) {
      const depthPct = this.player.y / H;
      const markerY = 100 + depthPct * (H - 200);
      this.depthMarker.setY(markerY);
    }

    /* ── Oxygen decay ── */
    this.oxygen = Math.max(0, this.oxygen - OXYGEN_DECAY_PER_SEC * dt);
    this._updateOxygenBar();
    if (this.oxygen <= 0) {
      this._gameOver();
      return;
    }

    /* ── Bubble wobble and cleanup ── */
    this.bubbles.forEach(b => {
      if (b && b.active) {
        // Sine wobble
        const t = b.getData("wobbleTime") + dt;
        b.setData("wobbleTime", t);
        const baseX = b.getData("wobbleBase");
        b.x = baseX + Math.sin(t * 1.5) * 20;

        // Scale pulse
        const pulse = 1 + Math.sin(t * 3) * 0.04;
        b.setScale(pulse);

        // Remove if off top of screen
        if (b.y < -60) {
          this.tweens.killTweensOf(b);
          b.destroy();
          b.active = false;
        }
      }
    });

    /* ── Ambient ── */
    this._updateAmbient(time);
  }

  _updateOxygenBar() {
    if (!this.oxygenBarFill || !this.oxygenText) return;
    const pct = this.oxygen / OXYGEN_MAX;
    this.oxygenBarFill.width = 140 * pct;
    this.oxygenText.setText(`${Math.round(this.oxygen)}%`);

    let oxyColor;
    if (pct > 0.5) oxyColor = 0x2ecc71;
    else if (pct > 0.25) oxyColor = 0xf1c40f;
    else oxyColor = 0xe74c3c;
    this.oxygenBarFill.setFillStyle(oxyColor);
  }

  _updateAmbient(time) {
    if (!this.ambientBubbles) return;
    this.ambientBubbles.forEach(ab => {
      ab.obj.y -= ab.speed;
      ab.obj.x += Math.sin(time / 1000 * ab.wobbleSpeed + ab.wobbleOffset) * 0.3;
      if (ab.obj.y < -10) {
        ab.obj.y = H + 10;
        ab.obj.x = Phaser.Math.Between(10, W - 10);
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════════
   *  SHUTDOWN
   * ═══════════════════════════════════════════════════════════════ */
  shutdown() {
    if (this.spawnTimer) this.spawnTimer.destroy();
    this.bubbles = [];
  }
}
