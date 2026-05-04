/**
 * Level7Scene — "Char Discovery: Alphabet Nebula Explorer" (Accretion Phase)
 * ===========================================================================
 * Mechanic: Space Exploration Collection Adventure
 * - Player controls a ship through a cosmic alphabet nebula
 * - Valid single-character values drift in orbs — COLLECT them!
 * - Invalid data (strings, numbers, empty, multi-char) also drift — AVOID them!
 * - Collect 30 valid chars with ≥85% accuracy to pass
 * - Must collect at least 5 from each of 5 categories
 * - Oxygen system depletes over time; gain/lose on correct/wrong
 *
 * Schema Theory: Accretion — introducing char/character concepts
 */

import Phaser from "phaser";
import { GameManager } from "../../GameManager.js";
import { BadgeSystem } from "../../BadgeSystem.js";
import { ProgressTracker } from "../../ProgressTracker.js";

/* ───────── Constants ───────── */
const W = 800;
const H = 600;
const TARGET_COLLECT = 30;
const ACCURACY_THRESHOLD = 85;
const MAX_ORBS = 8;
const ORB_RADIUS = 28;
const PLAYER_SPEED = 350;
const BOOST_SPEED = 550;
const BOOST_DURATION = 800;
const BOOST_COOLDOWN = 3000;
const OXYGEN_MAX = 100;
const OXYGEN_DECAY_PER_SEC = 0.5;
const OXYGEN_PENALTY = 10;
const OXYGEN_REWARD = 5;
const SPAWN_INTERVAL = 2200;
const VALID_CHANCE = 0.70;
const CATEGORY_REQUIREMENT = 5;

/* ───────── Char Pools ───────── */
const UPPERCASE_CHARS = ["A", "B", "Z", "M", "K"];
const LOWERCASE_CHARS = ["a", "z", "m", "k", "p"];
const DIGIT_CHARS = ["0", "5", "9", "3", "7"];
const SYMBOL_CHARS = ["@", "#", "!", "?", "*"];
const SPACE_CHARS = [" "];

const INVALID_STRINGS = ["ABC", "Hi", "hello"];
const INVALID_NUMBERS = [123, 42, -5];
const INVALID_EMPTY = [""];
const INVALID_MULTI = ["AB", "XY"];

const CHAR_CATEGORIES = [
  { pool: UPPERCASE_CHARS, color: 0x00ff88, label: "Uppercase", icon: "A" },
  { pool: LOWERCASE_CHARS, color: 0x0088ff, label: "Lowercase", icon: "a" },
  { pool: DIGIT_CHARS, color: 0x00ffff, label: "Digit", icon: "0" },
  { pool: SYMBOL_CHARS, color: 0xff00ff, label: "Symbol", icon: "@" },
  { pool: SPACE_CHARS, color: 0xffffff, label: "Space", icon: "□" },
];

const INVALID_CATEGORIES = [
  { pool: INVALID_STRINGS, color: 0xff4444, label: "String", type: "string" },
  { pool: INVALID_NUMBERS, color: 0xff8800, label: "Number", type: "number" },
  { pool: INVALID_EMPTY, color: 0x333333, label: "Empty", type: "empty" },
  { pool: INVALID_MULTI, color: 0xff4444, label: "Multi-char", type: "multi" },
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

function getCharTip(value, category) {
  const tips = {
    Uppercase: [
      `✓ '${value}' is a valid char — uppercase letter!`,
      `✓ Single uppercase letters like '${value}' are chars!`,
      `✓ '${value}' fits in a single char — great catch!`,
    ],
    Lowercase: [
      `✓ '${value}' is a valid char — lowercase letter!`,
      `✓ Lowercase letters like '${value}' are single chars!`,
      `✓ '${value}' is one character — valid char!`,
    ],
    Digit: [
      `✓ '${value}' is a valid char — it's a digit character!`,
      `✓ Digit chars like '${value}' store the symbol, not the number!`,
      `✓ '${value}' as a char holds the digit symbol!`,
    ],
    Symbol: [
      `✓ '${value}' is a valid char — special symbol!`,
      `✓ Symbols like '${value}' are single characters too!`,
      `✓ '${value}' is one character — valid char!`,
    ],
    Space: [
      `✓ ' ' (space) is a valid char — it's a character too!`,
      `✓ Space is a real character with ASCII value 32!`,
      `✓ Even whitespace like space is a valid char!`,
    ],
  };
  const pool = tips[category] || tips.Uppercase;
  return pool[Math.floor(Math.random() * pool.length)];
}

function getInvalidTip(displayText, type) {
  const tips = {
    string: [
      `✗ "${displayText}" is a STRING — chars are single characters only!`,
      `✗ "${displayText}" has multiple characters — not a char!`,
      `✗ Strings like "${displayText}" use double quotes and hold many chars!`,
    ],
    number: [
      `✗ ${displayText} is a NUMBER — not a character!`,
      `✗ Numbers like ${displayText} are int/float, not char!`,
      `✗ ${displayText} is numeric data — chars use single quotes!`,
    ],
    empty: [
      `✗ '' is EMPTY — a char must contain exactly one character!`,
      `✗ Empty quotes '' are not valid — chars need one character!`,
      `✗ A char cannot be empty — it must hold one character!`,
    ],
    multi: [
      `✗ '${displayText}' has multiple characters — not a valid char!`,
      `✗ '${displayText}' is too long — chars hold exactly ONE character!`,
      `✗ Multi-character '${displayText}' doesn't fit in a single char!`,
    ],
  };
  const pool = tips[type] || tips.string;
  return pool[Math.floor(Math.random() * pool.length)];
}

/* ═══════════════════════════════════════════════════════════════
 *  LEVEL 7 SCENE
 * ═══════════════════════════════════════════════════════════════ */
export class Level7Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level7Scene" });
  }

  create() {
    this.physics.world.gravity.y = 0;

    /* ── State ── */
    this.charsCollected = 0;
    this.totalAttempts = 0;
    this.wrongAttempts = 0;
    this.score = 0;
    this.oxygen = OXYGEN_MAX;
    this.isComplete = false;
    this.gameStarted = false;
    this.orbs = [];
    this.startTime = 0;
    this.combo = 0;
    this.boostAvailable = true;
    this.isBoosting = false;
    this.boostTimer = null;

    this.categoryCount = {
      Uppercase: 0,
      Lowercase: 0,
      Digit: 0,
      Symbol: 0,
      Space: 0,
    };

    this._drawSpaceBackground();
    this._generateTextures();
    this._createParticles();
    this._createAmbientDust();
    this._createPlayer();
    this._createHUD();
    this._createCategoryTracker();

    const uiScene = this.scene.get("UIScene");
    if (uiScene && uiScene.setLevelLabel) {
      uiScene.setLevelLabel("Level 7: Accretion — Alphabet Nebula Explorer!");
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
   *  SPACE BACKGROUND
   * ═══════════════════════════════════════════════════════════════ */
  _drawSpaceBackground() {
    /* Layer 0: Deep space gradient */
    const gfx = this.add.graphics().setDepth(0);
    const topColor = 0x0a0020;
    const botColor = 0x1a0040;
    const steps = 60;
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const c = lerpColor(topColor, botColor, t);
      gfx.fillStyle(c, 1);
      gfx.fillRect(0, Math.floor((H * i) / steps), W, Math.ceil(H / steps) + 1);
    }

    /* Layer 1: Far stars (small white dots, slow drift via tweens) */
    this.farStars = [];
    for (let i = 0; i < 60; i++) {
      const x = Phaser.Math.Between(0, W);
      const y = Phaser.Math.Between(0, H);
      const size = Phaser.Math.FloatBetween(0.5, 1.5);
      const alpha = Phaser.Math.FloatBetween(0.2, 0.7);
      const star = this.add.circle(x, y, size, 0xffffff, alpha).setDepth(1);
      this.tweens.add({
        targets: star,
        alpha: alpha * 0.3,
        duration: Phaser.Math.Between(1500, 4000),
        yoyo: true,
        repeat: -1,
        ease: "Sine.inOut",
      });
      this.farStars.push({ obj: star, speed: Phaser.Math.FloatBetween(0.05, 0.2) });
    }

    /* Layer 2: Nebula clouds (purple/magenta tinted, semi-transparent, slow rotation) */
    this.nebulaClouds = [];
    const nebulaColors = [0x6a0dad, 0x9b30ff, 0xda70d6, 0x8b008b, 0x4b0082];
    for (let i = 0; i < 5; i++) {
      const nx = Phaser.Math.Between(100, W - 100);
      const ny = Phaser.Math.Between(80, H - 80);
      const cloud = this.add.graphics().setDepth(2);
      const color = nebulaColors[i % nebulaColors.length];
      cloud.fillStyle(color, 0.06);
      cloud.fillCircle(0, 0, Phaser.Math.Between(80, 160));
      cloud.fillStyle(color, 0.04);
      cloud.fillCircle(Phaser.Math.Between(-30, 30), Phaser.Math.Between(-30, 30), Phaser.Math.Between(60, 120));
      cloud.setPosition(nx, ny);
      this.tweens.add({
        targets: cloud,
        angle: 360,
        duration: Phaser.Math.Between(40000, 80000),
        repeat: -1,
      });
      this.tweens.add({
        targets: cloud,
        alpha: 0.3,
        duration: Phaser.Math.Between(5000, 10000),
        yoyo: true,
        repeat: -1,
        ease: "Sine.inOut",
      });
      this.nebulaClouds.push(cloud);
    }
  }

  /* ═══════════════════════════════════════════════════════════════
   *  TEXTURES
   * ═══════════════════════════════════════════════════════════════ */
  _generateTextures() {
    if (!this.textures.exists("shipBody")) {
      const g = this.add.graphics();
      // Main body — sleek triangle/arrow shape
      g.fillStyle(0x1a1a3e, 1);
      g.beginPath();
      g.moveTo(75, 28);
      g.lineTo(10, 6);
      g.lineTo(4, 28);
      g.lineTo(10, 50);
      g.closePath();
      g.fill();
      // Darker inner hull
      g.fillStyle(0x2a2a5e, 1);
      g.beginPath();
      g.moveTo(65, 28);
      g.lineTo(18, 12);
      g.lineTo(14, 28);
      g.lineTo(18, 44);
      g.closePath();
      g.fill();
      // Cockpit window
      g.fillStyle(0x00e5ff, 0.9);
      g.fillCircle(52, 28, 7);
      g.fillStyle(0x80f0ff, 0.6);
      g.fillCircle(54, 26, 3);
      // Engine core — cyan glow
      g.fillStyle(0x00ffff, 0.8);
      g.fillCircle(8, 28, 5);
      g.fillStyle(0x00ffff, 0.3);
      g.fillCircle(8, 28, 10);
      // Wing details
      g.fillStyle(0x4040a0, 1);
      g.fillTriangle(30, 8, 45, 4, 40, 16);
      g.fillTriangle(30, 48, 45, 52, 40, 40);
      // Energy shield hint (faint circle)
      g.lineStyle(1, 0x00ffff, 0.15);
      g.strokeCircle(40, 28, 26);
      g.generateTexture("shipBody", 80, 56);
      g.destroy();
    }

    if (!this.textures.exists("purpleSpark")) {
      const g = this.add.graphics();
      g.fillStyle(0xc084fc, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("purpleSpark", 8, 8);
      g.destroy();
    }

    if (!this.textures.exists("greenSpark")) {
      const g = this.add.graphics();
      g.fillStyle(0x00ff88, 1);
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
    this.collectParticles = this.add.particles(0, 0, "greenSpark", {
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

    this.nebulaParticles = this.add.particles(0, 0, "purpleSpark", {
      speed: { min: 20, max: 60 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.5, end: 0 },
      lifespan: 1200,
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
   *  AMBIENT COSMIC DUST (Layer 3 — decorative)
   * ═══════════════════════════════════════════════════════════════ */
  _createAmbientDust() {
    this.ambientDust = [];
    for (let i = 0; i < 30; i++) {
      const x = Phaser.Math.Between(10, W - 10);
      const y = Phaser.Math.Between(0, H);
      const size = Phaser.Math.FloatBetween(0.5, 2);
      const alpha = Phaser.Math.FloatBetween(0.05, 0.2);
      const colors = [0xc084fc, 0x818cf8, 0xffffff, 0x60a5fa];
      const color = colors[Phaser.Math.Between(0, colors.length - 1)];
      const dust = this.add.circle(x, y, size, color, alpha).setDepth(3);
      this.ambientDust.push({
        obj: dust,
        speed: Phaser.Math.FloatBetween(0.1, 0.5),
        wobbleOffset: Phaser.Math.FloatBetween(0, Math.PI * 2),
        wobbleSpeed: Phaser.Math.FloatBetween(0.3, 1.0),
      });
    }
  }

  /* ═══════════════════════════════════════════════════════════════
   *  PLAYER (SPACESHIP)
   * ═══════════════════════════════════════════════════════════════ */
  _createPlayer() {
    this.player = this.physics.add.sprite(W / 2, H / 2, "shipBody");
    this.player.setCollideWorldBounds(true);
    this.player.setDrag(200);
    this.player.body.setAllowGravity(false);
    this.player.body.setSize(70, 44);
    this.player.setDepth(50);

    // Engine glow effect (pulsing tween)
    this.engineGlow = this.add.circle(this.player.x - 32, this.player.y, 8, 0x00ffff, 0.4).setDepth(49);
    this.tweens.add({
      targets: this.engineGlow,
      alpha: 0.1,
      scaleX: 1.4,
      scaleY: 1.4,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });

    // Energy shield (faint circle around ship)
    this.shield = this.add.circle(this.player.x, this.player.y, 34, 0x00ffff, 0.05).setDepth(48);
    this.shield.setStrokeStyle(1, 0x00ffff, 0.12);
  }

  /* ═══════════════════════════════════════════════════════════════
   *  HUD
   * ═══════════════════════════════════════════════════════════════ */
  _createHUD() {
    const dp = 100;

    // Score (top-left)
    this.scoreText = this.add.text(16, 68, "CHARS: 0 / 30", {
      fontFamily: "Arial",
      fontSize: "20px",
      color: "#ffffff",
      fontStyle: "bold",
      stroke: "#1a0040",
      strokeThickness: 3,
    }).setDepth(dp);

    // Progress label (top center)
    this.add.text(W / 2, 68, "Chars Collected", {
      fontFamily: "Arial",
      fontSize: "12px",
      color: "#c084fc",
      fontStyle: "bold",
    }).setOrigin(0.5, 0).setDepth(dp);

    // Progress bar (top center)
    this.progressBarBg = this.add.rectangle(W / 2, 90, 260, 16, 0x1a0040, 0.6)
      .setStrokeStyle(1, 0x6a0dad).setDepth(dp);
    this.progressBarFill = this.add.rectangle(W / 2 - 130, 90, 0, 14, 0xc084fc)
      .setOrigin(0, 0.5).setDepth(dp + 1);
    this.progressText = this.add.text(W / 2, 90, "0 / 30", {
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

    this.oxygenBarBg = this.add.rectangle(W - 85, 80, 140, 16, 0x1a0040, 0.6)
      .setStrokeStyle(1, 0x6a0dad).setDepth(dp);
    this.oxygenBarFill = this.add.rectangle(W - 155, 80, 140, 14, 0x2ecc71)
      .setOrigin(0, 0.5).setDepth(dp + 1);
    this.oxygenText = this.add.text(W - 85, 80, "100%", {
      fontFamily: "Arial",
      fontSize: "10px",
      color: "#ffffff",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(dp + 2);

    // Depth marker (left side vertical bar)
    this.depthBarBg = this.add.rectangle(20, H / 2, 8, H - 140, 0x1a0040, 0.4)
      .setStrokeStyle(1, 0x6a0dad, 0.3).setDepth(dp);
    this.depthMarker = this.add.circle(20, H / 2, 6, 0xc084fc, 0.8).setDepth(dp + 1);

    // Tooltip (bottom)
    this.tooltip = this.add.text(W / 2, H - 60, "", {
      fontFamily: "Arial",
      fontSize: "16px",
      color: "#ffffff",
      backgroundColor: "rgba(20, 0, 50, 0.9)",
      padding: { x: 14, y: 6 },
      align: "center",
      wordWrap: { width: 600 },
    }).setOrigin(0.5).setAlpha(0).setDepth(dp + 10);

    // Combo text (below progress bar)
    this.comboText = this.add.text(W / 2, 110, "", {
      fontFamily: "Arial",
      fontSize: "15px",
      color: "#fbbf24",
      fontStyle: "bold",
      stroke: "#1a0040",
      strokeThickness: 2,
    }).setOrigin(0.5).setAlpha(0).setDepth(dp);

    // Boost indicator (very bottom)
    this.boostText = this.add.text(W / 2, H - 16, "SPACE = BOOST", {
      fontFamily: "Arial",
      fontSize: "11px",
      color: "#c084fc",
    }).setOrigin(0.5).setAlpha(0).setDepth(dp);
  }

  /* ═══════════════════════════════════════════════════════════════
   *  CATEGORY TRACKER (bottom of screen)
   * ═══════════════════════════════════════════════════════════════ */
  _createCategoryTracker() {
    const dp = 100;
    const baseY = H - 100;
    const startX = W / 2 - 160;
    const spacing = 80;

    this.categoryTrackerItems = [];

    CHAR_CATEGORIES.forEach((cat, i) => {
      const cx = startX + i * spacing;

      // Outer circle (category color)
      const circle = this.add.circle(cx, baseY, 16, cat.color, 0.2).setDepth(dp);
      circle.setStrokeStyle(2, cat.color, 0.6);

      // Icon text
      const icon = this.add.text(cx, baseY, cat.icon, {
        fontFamily: "Courier New, monospace",
        fontSize: "14px",
        color: "#ffffff",
        fontStyle: "bold",
      }).setOrigin(0.5).setDepth(dp + 1);

      // Counter text
      const counter = this.add.text(cx, baseY + 24, "0", {
        fontFamily: "Arial",
        fontSize: "11px",
        color: "#aaaaaa",
        fontStyle: "bold",
      }).setOrigin(0.5).setDepth(dp + 1);

      // Label
      const label = this.add.text(cx, baseY - 24, cat.label, {
        fontFamily: "Arial",
        fontSize: "8px",
        color: "#888888",
      }).setOrigin(0.5).setDepth(dp);

      this.categoryTrackerItems.push({ circle, icon, counter, label, cat });
    });
  }

  _updateCategoryTracker() {
    this.categoryTrackerItems.forEach(item => {
      const count = this.categoryCount[item.cat.label] || 0;
      item.counter.setText(String(count));

      if (count >= CATEGORY_REQUIREMENT) {
        item.circle.setFillStyle(item.cat.color, 0.5);
        item.counter.setColor("#ffffff");
      } else {
        item.circle.setFillStyle(item.cat.color, 0.2);
        item.counter.setColor("#aaaaaa");
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════════
   *  INSTRUCTION OVERLAY
   * ═══════════════════════════════════════════════════════════════ */
  _showInstruction() {
    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.85).setDepth(200);

    const panelG = this.add.graphics().setDepth(201);
    panelG.fillStyle(0x0e0030, 0.98);
    panelG.fillRoundedRect(W / 2 - 320, 40, 640, 510, 16);
    panelG.lineStyle(3, 0xc084fc);
    panelG.strokeRoundedRect(W / 2 - 320, 40, 640, 510, 16);

    const title = this.add.text(W / 2, 78, "🌌 MISSION 7: CHAR DISCOVERY", {
      fontFamily: "Arial Black, Arial, sans-serif",
      fontSize: "26px",
      color: "#c084fc",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(202);

    const sub = this.add.text(W / 2, 112, "Alphabet Nebula Explorer", {
      fontFamily: "Arial",
      fontSize: "18px",
      color: "#818cf8",
      fontStyle: "italic",
    }).setOrigin(0.5).setDepth(202);

    const desc = this.add.text(W / 2, 210,
      "A char holds exactly ONE character in single quotes!\n\n" +
      "✅  VALID chars:   'A'  'z'  '5'  '@'  ' '\n" +
      "❌  INVALID:  \"ABC\" (string)  123 (number)  '' (empty)  'AB' (multi)\n\n" +
      "Controls:\n" +
      "← → ↑ ↓  or  WASD  to fly\n" +
      "SPACE  for speed boost (3s cooldown)\n\n" +
      "⚠ Watch your OXYGEN — it drains over time!\n" +
      "Correct catches restore O₂, mistakes drain it!\n" +
      "Collect at least 5 from each of the 5 categories!",
      {
        fontFamily: "Arial",
        fontSize: "14px",
        color: "#bdc3c7",
        align: "center",
        lineSpacing: 5,
      }
    ).setOrigin(0.5).setDepth(202);

    const goal = this.add.text(W / 2, 410, "Collect 30 valid chars with 85%+ accuracy\nto earn the Char Explorer badge! 🌌", {
      fontFamily: "Arial",
      fontSize: "14px",
      color: "#f1c40f",
      align: "center",
      fontStyle: "bold",
      lineSpacing: 6,
    }).setOrigin(0.5).setDepth(202);

    const btnBg = this.add.rectangle(W / 2, 475, 280, 48, 0x6a0dad, 1).setDepth(202);
    btnBg.setStrokeStyle(2, 0xc084fc);
    const btnTxt = this.add.text(W / 2, 475, "BEGIN EXPLORATION", {
      fontFamily: "Arial",
      fontSize: "20px",
      color: "#ffffff",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(203);

    btnBg.setInteractive({ useHandCursor: true });
    btnBg.on("pointerover", () => {
      btnBg.setFillStyle(0xc084fc);
      this.tweens.add({ targets: [btnBg, btnTxt], scaleX: 1.08, scaleY: 1.08, duration: 120 });
    });
    btnBg.on("pointerout", () => {
      btnBg.setFillStyle(0x6a0dad);
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
  _scheduleSpawn() {
    if (this.isComplete) return;
    this.spawnTimer = this.time.delayedCall(SPAWN_INTERVAL, () => {
      this._spawnOrb();
      this._scheduleSpawn();
    });
  }

  _spawnOrb() {
    if (this.isComplete) return;
    this.orbs = this.orbs.filter(b => b.active);
    if (this.orbs.length >= MAX_ORBS) return;

    const isValid = Math.random() < VALID_CHANCE;

    let value, displayText, category, orbColor, invalidType;

    if (isValid) {
      const cat = Phaser.Utils.Array.GetRandom(CHAR_CATEGORIES);
      value = Phaser.Utils.Array.GetRandom(cat.pool);
      displayText = value === " " ? "' '" : `'${value}'`;
      category = cat.label;
      orbColor = cat.color;
      invalidType = null;
    } else {
      const invCat = Phaser.Utils.Array.GetRandom(INVALID_CATEGORIES);
      const raw = Phaser.Utils.Array.GetRandom(invCat.pool);
      value = raw;
      invalidType = invCat.type;
      orbColor = invCat.color;
      category = null;

      if (invCat.type === "string") {
        displayText = `"${raw}"`;
      } else if (invCat.type === "number") {
        displayText = String(raw);
      } else if (invCat.type === "empty") {
        displayText = "''";
      } else {
        displayText = `'${raw}'`;
      }
    }

    // Spawn from edges, drift toward center
    const edge = Phaser.Math.Between(0, 3);
    let spawnX, spawnY, velX, velY;
    const driftSpeed = Phaser.Math.Between(20, 50);

    switch (edge) {
      case 0: // top
        spawnX = Phaser.Math.Between(60, W - 60);
        spawnY = -40;
        velX = (W / 2 - spawnX) * 0.02;
        velY = driftSpeed;
        break;
      case 1: // right
        spawnX = W + 40;
        spawnY = Phaser.Math.Between(80, H - 120);
        velX = -driftSpeed;
        velY = (H / 2 - spawnY) * 0.02;
        break;
      case 2: // bottom
        spawnX = Phaser.Math.Between(60, W - 60);
        spawnY = H + 40;
        velX = (W / 2 - spawnX) * 0.02;
        velY = -driftSpeed;
        break;
      default: // left
        spawnX = -40;
        spawnY = Phaser.Math.Between(80, H - 120);
        velX = driftSpeed;
        velY = (H / 2 - spawnY) * 0.02;
        break;
    }

    const container = this.add.container(spawnX, spawnY).setDepth(40);

    // Outer glow layers (3 layers, pulsing)
    const glow3 = this.add.circle(0, 0, ORB_RADIUS + 12, orbColor, 0.06);
    const glow2 = this.add.circle(0, 0, ORB_RADIUS + 7, orbColor, 0.1);
    const glow1 = this.add.circle(0, 0, ORB_RADIUS + 3, orbColor, 0.15);
    container.add([glow3, glow2, glow1]);

    this.tweens.add({
      targets: [glow3, glow2, glow1],
      alpha: { from: 0.04, to: 0.2 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });

    // Core circle
    const coreAlpha = isValid ? 0.25 : 0.35;
    const core = this.add.circle(0, 0, ORB_RADIUS, orbColor, coreAlpha);
    core.setStrokeStyle(2, orbColor, 0.8);
    container.add(core);

    // Invalid-specific effects
    if (!isValid) {
      if (invalidType === "empty") {
        // Swirling dark hole effect
        const swirl = this.add.circle(0, 0, ORB_RADIUS - 5, 0x000000, 0.6);
        container.add(swirl);
        this.tweens.add({
          targets: swirl,
          angle: 360,
          duration: 3000,
          repeat: -1,
        });
      } else if (invalidType === "number") {
        // Warning pulse (orange ring)
        const warningRing = this.add.circle(0, 0, ORB_RADIUS + 2, 0xff8800, 0.0);
        warningRing.setStrokeStyle(2, 0xff8800, 0.4);
        container.add(warningRing);
        this.tweens.add({
          targets: warningRing,
          scaleX: 1.3,
          scaleY: 1.3,
          alpha: 0,
          duration: 800,
          repeat: -1,
        });
      } else {
        // Red aura for strings and multi-char
        const redAura = this.add.circle(0, 0, ORB_RADIUS + 6, 0xff4444, 0.08);
        container.add(redAura);
        this.tweens.add({
          targets: redAura,
          alpha: 0.2,
          scaleX: 1.15,
          scaleY: 1.15,
          duration: 600,
          yoyo: true,
          repeat: -1,
        });
      }
    }

    // Value text
    const fontSize = displayText.length > 5 ? "12px" : displayText.length > 3 ? "14px" : "17px";
    const txt = this.add.text(0, 0, displayText, {
      fontFamily: "Courier New, monospace",
      fontSize,
      color: "#ffffff",
      fontStyle: "bold",
      stroke: isValid ? "#0a0020" : "#4a0000",
      strokeThickness: 2,
    }).setOrigin(0.5);
    container.add(txt);

    // SPACE label for space character
    if (isValid && value === " ") {
      const spaceLbl = this.add.text(0, ORB_RADIUS + 10, "SPACE", {
        fontFamily: "Arial",
        fontSize: "9px",
        color: "#cccccc",
        fontStyle: "bold",
      }).setOrigin(0.5);
      container.add(spaceLbl);
    }

    // Category label for valid chars
    if (isValid && category !== "Space") {
      const catLabel = this.add.text(0, ORB_RADIUS + 10, category, {
        fontFamily: "Arial",
        fontSize: "9px",
        color: "#aaaacc",
        fontStyle: "bold",
      }).setOrigin(0.5);
      container.add(catLabel);
    }

    // Invalid type label
    if (!isValid) {
      const warnLabel = this.add.text(0, ORB_RADIUS + 10, "⚠ " + (invalidType === "string" ? "STRING" : invalidType === "number" ? "NUMBER" : invalidType === "empty" ? "EMPTY" : "MULTI"), {
        fontFamily: "Arial",
        fontSize: "8px",
        color: "#ff6666",
        fontStyle: "bold",
      }).setOrigin(0.5);
      container.add(warnLabel);
    }

    // Physics
    this.physics.add.existing(container);
    container.body.setCircle(ORB_RADIUS, -ORB_RADIUS, -ORB_RADIUS);
    container.body.setAllowGravity(false);
    container.body.setVelocity(velX, velY);

    container.setData("isValid", isValid);
    container.setData("value", value);
    container.setData("displayText", displayText);
    container.setData("category", category);
    container.setData("invalidType", invalidType);
    container.setData("wobbleBase", spawnX);
    container.setData("wobbleTime", 0);
    container.active = true;

    // Scale-in animation
    container.setScale(0);
    this.tweens.add({
      targets: container,
      scaleX: 1,
      scaleY: 1,
      duration: 350,
      ease: "Back.out",
    });

    // Overlap with player
    this.physics.add.overlap(this.player, container, () => {
      this._onCollectOrb(container);
    }, null, this);

    this.orbs.push(container);
  }

  /* ═══════════════════════════════════════════════════════════════
   *  ORB COLLECTION
   * ═══════════════════════════════════════════════════════════════ */
  _onCollectOrb(container) {
    if (this.isComplete || !container.active) return;
    container.active = false;

    const isValid = container.getData("isValid");
    const value = container.getData("value");
    const displayText = container.getData("displayText");
    const category = container.getData("category");
    const invalidType = container.getData("invalidType");
    const cx = container.x;
    const cy = container.y;

    this.tweens.killTweensOf(container);
    container.destroy();

    if (isValid) {
      this._onCorrectCollect(cx, cy, value, displayText, category);
    } else {
      this._onWrongCollect(cx, cy, value, displayText, invalidType);
    }
  }

  _onCorrectCollect(cx, cy, value, displayText, category) {
    this.charsCollected++;
    this.totalAttempts++;
    this.combo++;
    this.score += 20;

    // Update category count
    if (category) {
      this.categoryCount[category] = (this.categoryCount[category] || 0) + 1;
    }

    GameManager.addXP(20 * GameManager.getComboMultiplier());
    GameManager.addScore(20);
    GameManager.addCombo();

    this.oxygen = Math.min(OXYGEN_MAX, this.oxygen + OXYGEN_REWARD);

    // Particle burst
    this.collectParticles.emitParticleAt(cx, cy, 20);

    // Sound-wave ripple effect (expanding circle)
    this._createRippleEffect(cx, cy, 0x00ff88, 0.4);

    this._showPopup(cx, cy - 20, "+20", "#00ff88");
    this._showTooltip(getCharTip(value, category), "#c084fc");

    if (this.combo >= 5) {
      this.cameras.main.flash(200, 100, 0, 255);
    }

    this._updateHUD();
    this._updateCategoryTracker();

    if (this.charsCollected >= TARGET_COLLECT) {
      this._checkLevelEnd();
    }
  }

  _onWrongCollect(cx, cy, value, displayText, invalidType) {
    this.totalAttempts++;
    this.wrongAttempts++;
    this.combo = 0;
    this.score = Math.max(0, this.score - 15);

    GameManager.resetCombo();

    this.oxygen = Math.max(0, this.oxygen - OXYGEN_PENALTY);

    // Knockback
    const angle = Phaser.Math.Angle.Between(cx, cy, this.player.x, this.player.y);
    this.player.body.setVelocity(
      Math.cos(angle) * 300,
      Math.sin(angle) * 300
    );

    // Effects
    this.alertParticles.emitParticleAt(cx, cy, 15);
    this.cameras.main.shake(250, 0.015);
    this.cameras.main.flash(200, 255, 50, 0);

    this._showPopup(cx, cy - 20, "-15", "#ff4444");
    this._showTooltip(getInvalidTip(typeof value === "string" ? value : String(value), invalidType), "#ff4444");

    this._updateHUD();

    if (this.oxygen <= 0) {
      this._gameOver();
    }
  }

  /* ═══════════════════════════════════════════════════════════════
   *  RIPPLE EFFECT
   * ═══════════════════════════════════════════════════════════════ */
  _createRippleEffect(x, y, color, startAlpha) {
    const ripple = this.add.circle(x, y, 10, color, 0).setDepth(45);
    ripple.setStrokeStyle(2, color, startAlpha);
    this.tweens.add({
      targets: ripple,
      scaleX: 3,
      scaleY: 3,
      duration: 600,
      ease: "Cubic.out",
      onUpdate: (tween) => {
        const progress = tween.progress;
        ripple.setStrokeStyle(2, color, startAlpha * (1 - progress));
      },
      onComplete: () => ripple.destroy(),
    });

    // Second ripple, delayed
    this.time.delayedCall(150, () => {
      const ripple2 = this.add.circle(x, y, 8, color, 0).setDepth(45);
      ripple2.setStrokeStyle(1.5, color, startAlpha * 0.6);
      this.tweens.add({
        targets: ripple2,
        scaleX: 2.5,
        scaleY: 2.5,
        duration: 500,
        ease: "Cubic.out",
        onUpdate: (tween) => {
          const progress = tween.progress;
          ripple2.setStrokeStyle(1.5, color, startAlpha * 0.6 * (1 - progress));
        },
        onComplete: () => ripple2.destroy(),
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════════
   *  HUD UPDATES
   * ═══════════════════════════════════════════════════════════════ */
  _updateHUD() {
    // Score
    if (this.scoreText && this.scoreText.active) {
      this.scoreText.setText(`CHARS: ${this.charsCollected} / ${TARGET_COLLECT}`);
      this.tweens.add({
        targets: this.scoreText,
        scaleX: 1.15, scaleY: 1.15,
        yoyo: true,
        duration: 100,
      });
    }

    // Progress bar
    if (this.progressBarFill && this.progressText) {
      const pct = Math.min(this.charsCollected / TARGET_COLLECT, 1);
      this.tweens.add({
        targets: this.progressBarFill,
        width: 260 * pct,
        duration: 300,
        ease: "Cubic.out",
      });
      this.progressText.setText(`${this.charsCollected} / ${TARGET_COLLECT}`);
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
      stroke: "#0a0020",
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
      delay: 2200,
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

  _allCategoriesMet() {
    return Object.values(this.categoryCount).every(c => c >= CATEGORY_REQUIREMENT);
  }

  _levelComplete(accuracy) {
    this.isComplete = true;
    if (this.spawnTimer) this.spawnTimer.destroy();

    this.orbs.forEach(b => {
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
    const categoriesMet = this._allCategoriesMet();

    if (passed && categoriesMet) {
      GameManager.completeLevel(6, accuracy);
      BadgeSystem.unlock("char_explorer");
      ProgressTracker.saveProgress(GameManager.getState());
      this.cameras.main.flash(600, 100, 0, 255);

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

    this.time.delayedCall(passed && categoriesMet ? 500 : 200, () => {
      this._showEndScreen(passed && categoriesMet, accuracy, timeStr, categoriesMet);
    });
  }

  _showEndScreen(passed, accuracy, timeStr, categoriesMet) {
    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.88).setDepth(200);

    const panelG = this.add.graphics().setDepth(201);
    const panelColor = passed ? 0x0e0030 : 0x4a1e1e;
    const borderColor = passed ? 0xc084fc : 0xe74c3c;
    panelG.fillStyle(panelColor, 0.95);
    panelG.fillRoundedRect(W / 2 - 280, 50, 560, 490, 16);
    panelG.lineStyle(3, borderColor);
    panelG.strokeRoundedRect(W / 2 - 280, 50, 560, 490, 16);

    const titleText = passed ? "🎉 LEVEL 7 COMPLETE!" : (!categoriesMet ? "❌ MISSING CATEGORIES" : "❌ ACCURACY TOO LOW");
    const titleColor = passed ? "#c084fc" : "#e74c3c";

    this.add.text(W / 2, 85, titleText, {
      fontFamily: "Arial Black, Arial, sans-serif",
      fontSize: "28px",
      color: titleColor,
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(202);

    const statsY = 130;
    const stats = [
      `Chars Collected: ${this.charsCollected} / ${TARGET_COLLECT}`,
      `Accuracy: ${accuracy}%`,
      `Score: ${this.score}`,
      `Time: ${timeStr}`,
      `Oxygen Remaining: ${Math.round(this.oxygen)}%`,
      `Wrong Catches: ${this.wrongAttempts}`,
    ];

    stats.forEach((s, i) => {
      this.add.text(W / 2, statsY + i * 26, s, {
        fontFamily: "Arial",
        fontSize: "16px",
        color: "#ecf0f1",
      }).setOrigin(0.5).setDepth(202);
    });

    // Category breakdown
    const catY = statsY + stats.length * 26 + 15;
    this.add.text(W / 2, catY, "Category Breakdown:", {
      fontFamily: "Arial",
      fontSize: "13px",
      color: "#c084fc",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(202);

    CHAR_CATEGORIES.forEach((cat, i) => {
      const count = this.categoryCount[cat.label] || 0;
      const met = count >= CATEGORY_REQUIREMENT;
      const statusIcon = met ? "✅" : "❌";
      const colorHex = met ? "#00ff88" : "#ff4444";
      this.add.text(W / 2, catY + 20 + i * 18, `${statusIcon} ${cat.label}: ${count} / ${CATEGORY_REQUIREMENT}`, {
        fontFamily: "Arial",
        fontSize: "12px",
        color: colorHex,
      }).setOrigin(0.5).setDepth(202);
    });

    if (passed) {
      const badgeY = catY + 20 + CHAR_CATEGORIES.length * 18 + 10;
      this.add.text(W / 2, badgeY, "🌌 Badge Unlocked: Char Explorer!", {
        fontFamily: "Arial",
        fontSize: "16px",
        color: "#f1c40f",
        fontStyle: "bold",
      }).setOrigin(0.5).setDepth(202);

      this.add.text(W / 2, badgeY + 30,
        "✅ You learned: A char holds exactly one character\nin single quotes — letters, digits, symbols, or space!", {
        fontFamily: "Arial",
        fontSize: "12px",
        color: "#bdc3c7",
        align: "center",
        lineSpacing: 4,
      }).setOrigin(0.5).setDepth(202);
    }

    const btnY = 500;
    if (passed) {
      this._createEndButton(W / 2 - 130, btnY, "NEXT LEVEL →", 0x6a0dad, () => {
        this.scene.stop("UIScene");
        this.scene.start("MenuScene");
      });
      this._createEndButton(W / 2 + 130, btnY, "REPLAY", 0x4a0dad, () => {
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

    this.orbs.forEach(b => {
      if (b && b.active) {
        this.tweens.killTweensOf(b);
        b.destroy();
      }
    });

    this.cameras.main.shake(500, 0.02);
    this.cameras.main.flash(300, 255, 0, 0);

    this.time.delayedCall(600, () => {
      const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.88).setDepth(200);

      const panelG = this.add.graphics().setDepth(201);
      panelG.fillStyle(0x3a0000, 0.95);
      panelG.fillRoundedRect(W / 2 - 250, H / 2 - 150, 500, 300, 16);
      panelG.lineStyle(3, 0xe74c3c);
      panelG.strokeRoundedRect(W / 2 - 250, H / 2 - 150, 500, 300, 16);

      this.add.text(W / 2, H / 2 - 100, "💀 OXYGEN DEPLETED", {
        fontFamily: "Arial Black, Arial, sans-serif",
        fontSize: "30px",
        color: "#e74c3c",
        fontStyle: "bold",
      }).setOrigin(0.5).setDepth(202);

      this.add.text(W / 2, H / 2 - 40, `You collected ${this.charsCollected} / ${TARGET_COLLECT} chars`, {
        fontFamily: "Arial",
        fontSize: "20px",
        color: "#ecf0f1",
      }).setOrigin(0.5).setDepth(202);

      this.add.text(W / 2, H / 2 - 5, "Your oxygen ran out in the nebula!", {
        fontFamily: "Arial",
        fontSize: "16px",
        color: "#e74c3c",
      }).setOrigin(0.5).setDepth(202);

      // Category progress
      let catInfoStr = "";
      CHAR_CATEGORIES.forEach(cat => {
        const count = this.categoryCount[cat.label] || 0;
        catInfoStr += `${cat.icon}:${count}  `;
      });
      this.add.text(W / 2, H / 2 + 30, catInfoStr.trim(), {
        fontFamily: "Courier New, monospace",
        fontSize: "14px",
        color: "#aaaaaa",
      }).setOrigin(0.5).setDepth(202);

      this._createEndButton(W / 2 - 100, H / 2 + 90, "TRY AGAIN", 0xe74c3c, () => {
        GameManager.resetLevel();
        this.scene.restart();
      });
      this._createEndButton(W / 2 + 100, H / 2 + 90, "MENU", 0x34495e, () => {
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

    /* ── Player movement (8-directional with acceleration) ── */
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

    // Ship tilt
    if (vy < 0) this.player.setAngle(-10);
    else if (vy > 0) this.player.setAngle(10);
    else this.player.setAngle(0);

    // Flip for left/right
    this.player.setFlipX(vx < 0);

    // Update engine glow and shield position
    if (this.engineGlow) {
      const flipOffset = this.player.flipX ? 32 : -32;
      this.engineGlow.setPosition(this.player.x + flipOffset, this.player.y);
    }
    if (this.shield) {
      this.shield.setPosition(this.player.x, this.player.y);
    }

    // Boost handling
    if (Phaser.Input.Keyboard.JustDown(this.wasd.space) && this.boostAvailable) {
      this.isBoosting = true;
      this.boostAvailable = false;
      this.boostText.setText("BOOST ACTIVE!").setColor("#fbbf24");

      // Engine flare
      if (this.engineGlow) {
        this.tweens.add({
          targets: this.engineGlow,
          scaleX: 2,
          scaleY: 2,
          alpha: 0.8,
          duration: 200,
          yoyo: false,
        });
      }

      this.time.delayedCall(BOOST_DURATION, () => {
        this.isBoosting = false;
        this.boostText.setText("COOLDOWN...").setColor("#e74c3c");
        if (this.engineGlow) {
          this.tweens.add({
            targets: this.engineGlow,
            scaleX: 1,
            scaleY: 1,
            alpha: 0.4,
            duration: 300,
          });
        }
      });
      this.time.delayedCall(BOOST_COOLDOWN, () => {
        this.boostAvailable = true;
        this.boostText.setText("SPACE = BOOST").setColor("#c084fc");
      });
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

    /* ── Orb wobble and cleanup ── */
    this.orbs.forEach(b => {
      if (b && b.active) {
        const t = b.getData("wobbleTime") + dt;
        b.setData("wobbleTime", t);
        // Sine wave wobble on x-axis
        b.x += Math.sin(t * 2) * 0.5;

        // Scale pulse
        const pulse = 1 + Math.sin(t * 3) * 0.04;
        b.setScale(pulse);

        // Remove if far off screen
        if (b.x < -80 || b.x > W + 80 || b.y < -80 || b.y > H + 80) {
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
    // Cosmic dust drifting down
    if (this.ambientDust) {
      this.ambientDust.forEach(ad => {
        ad.obj.y += ad.speed;
        ad.obj.x += Math.sin(time / 1000 * ad.wobbleSpeed + ad.wobbleOffset) * 0.2;
        if (ad.obj.y > H + 10) {
          ad.obj.y = -10;
          ad.obj.x = Phaser.Math.Between(10, W - 10);
        }
      });
    }

    // Far stars slow drift
    if (this.farStars) {
      this.farStars.forEach(fs => {
        fs.obj.x -= fs.speed;
        if (fs.obj.x < -5) {
          fs.obj.x = W + 5;
          fs.obj.y = Phaser.Math.Between(0, H);
        }
      });
    }
  }

  /* ═══════════════════════════════════════════════════════════════
   *  SHUTDOWN
   * ═══════════════════════════════════════════════════════════════ */
  shutdown() {
    if (this.spawnTimer) this.spawnTimer.destroy();
    this.orbs = [];
  }
}
