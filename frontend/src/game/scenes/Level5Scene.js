/**
 * Level5Scene — "Float Tuning: Deep Type Dive" (Tuning Phase)
 * =============================================================
 * ENGINE: Duplicated from Level4Scene (Decimal Ocean Dive)
 *
 * Tuning modifications:
 *  - Darker ocean gradient (deeper danger zone)
 *  - 3 bubble types: FLOAT (cyan), INT (orange), CHAR (toxic green)
 *  - Live Code Panel at bottom showing assignment results
 *  - Distinct collision feedback per type (bounce, shake, penalties)
 *  - Dynamic difficulty: CHAR/INT spawn rate increases as score rises
 *  - Collect 25 valid floats to complete
 *
 * Schema Theory: Tuning — refining understanding of type precision
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
const OXYGEN_DECAY_PER_SEC = 0.6;
const OXYGEN_PENALTY_INT = 5;
const OXYGEN_PENALTY_CHAR = 15;
const OXYGEN_REWARD = 5;
const SPAWN_INTERVAL = 2200;
const BUBBLE_RISE_SPEED = 55;

/* ───────── Type Pools ───────── */
const FLOAT_VALUES = [3.14, -0.5, 9.99, 1.25, 0.75, -2.5, 6.28, 0.01, -1.75, 4.50, 2.718, 0.333, -3.14, 7.77, 0.125];
const INT_VALUES   = [5, 100, -42, 0, 7, -3, 12, -8, 25, -15, 1, 50];
const CHAR_VALUES  = ["'s'", "'k'", "'A'", "'#'", "'Z'", "'9'", "'!'", "'m'"];

const TYPE_FLOAT = "float";
const TYPE_INT   = "int";
const TYPE_CHAR  = "char";

/* ───────── Helpers ───────── */
function lerpColor(a, b, t) {
  const ar = (a >> 16) & 0xff, ag = (a >> 8) & 0xff, ab = a & 0xff;
  const br = (b >> 16) & 0xff, bg = (b >> 8) & 0xff, bb = b & 0xff;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return (r << 16) | (g << 8) | bl;
}

function getFloatTip(value) {
  const tips = [
    `float currentData = ${value}; // SUCCESS: Valid Float!`,
    `float currentData = ${value}; // Decimal value assigned correctly!`,
  ];
  return tips[Math.floor(Math.random() * tips.length)];
}

function getIntTip(value) {
  return `float currentData = ${value}; // WARNING: Expected decimal precision!`;
}

function getCharTip(value) {
  return `float currentData = ${value}; // TYPE ERROR: Cannot assign char to float!`;
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

    this._drawOceanBackground();
    this._generateTextures();
    this._createParticles();
    this._createAmbientBubbles();
    this._createPlayer();
    this._createHUD();
    this._createCodePanel();

    const uiScene = this.scene.get("UIScene");
    if (uiScene?.setLevelLabel) {
      uiScene.setLevelLabel("Level 5: Tuning — Deep Type Dive!");
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
   *  OCEAN BACKGROUND — darker danger-zone gradient
   * ═══════════════════════════════════════════════════════════════ */
  _drawOceanBackground() {
    const gfx = this.add.graphics().setDepth(0);
    const topColor = 0x002244;
    const botColor = 0x000a14;
    const steps = 60;
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const c = lerpColor(topColor, botColor, t);
      gfx.fillStyle(c, 1);
      gfx.fillRect(0, Math.floor((H * i) / steps), W, Math.ceil(H / steps) + 1);
    }

    const rayGfx = this.add.graphics().setDepth(1).setAlpha(0.04);
    for (let i = 0; i < 5; i++) {
      const x = 100 + i * 160;
      rayGfx.fillStyle(0x3388aa, 1);
      rayGfx.beginPath();
      rayGfx.moveTo(x - 5, 0);
      rayGfx.lineTo(x + 5, 0);
      rayGfx.lineTo(x + 40 + i * 10, H);
      rayGfx.lineTo(x - 40 - i * 5, H);
      rayGfx.closePath();
      rayGfx.fill();
    }

    const zoneStyle = { fontFamily: "Arial", fontSize: "11px", color: "#ffffff" };
    this.add.text(8, 80, "TWILIGHT ZONE", zoneStyle).setAlpha(0.15).setDepth(2);
    this.add.text(8, 280, "DARK ZONE", zoneStyle).setAlpha(0.10).setDepth(2);
    this.add.text(8, 480, "ABYSS", zoneStyle).setAlpha(0.07).setDepth(2);

    const lineGfx = this.add.graphics().setDepth(1).setAlpha(0.04);
    lineGfx.lineStyle(1, 0x3388aa);
    lineGfx.beginPath(); lineGfx.moveTo(0, 200); lineGfx.lineTo(W, 200); lineGfx.strokePath();
    lineGfx.beginPath(); lineGfx.moveTo(0, 420); lineGfx.lineTo(W, 420); lineGfx.strokePath();
  }

  /* ═══════════════════════════════════════════════════════════════
   *  TEXTURES
   * ═══════════════════════════════════════════════════════════════ */
  _generateTextures() {
    const make = (key, color) => {
      if (this.textures.exists(key)) return;
      const g = this.add.graphics();
      g.fillStyle(color, 1); g.fillCircle(4, 4, 4);
      g.generateTexture(key, 8, 8); g.destroy();
    };

    // Submarine body
    if (!this.textures.exists("subBody")) {
      const g = this.add.graphics();
      g.fillStyle(0x2980b9, 1);
      g.fillRoundedRect(4, 12, 72, 36, 14);
      g.fillStyle(0x1a5276, 1);
      g.fillRoundedRect(4, 30, 72, 18, { tl: 0, tr: 0, bl: 14, br: 14 });
      g.fillStyle(0x85c1e9, 1);
      g.fillCircle(54, 26, 10);
      g.fillStyle(0xaed6f1, 1);
      g.fillCircle(56, 24, 4);
      g.fillStyle(0x5dade2, 1);
      g.fillRect(48, 2, 4, 14);
      g.fillRect(48, 2, 12, 4);
      g.fillStyle(0x2471a3, 1);
      g.beginPath(); g.moveTo(4, 18); g.lineTo(0, 6); g.lineTo(0, 48); g.lineTo(4, 38); g.closePath(); g.fill();
      g.fillStyle(0x7f8c8d, 1);
      g.fillRect(0, 22, 6, 4);
      g.fillRect(0, 30, 6, 4);
      g.generateTexture("subBody", 80, 56);
      g.destroy();
    }

    make("cyanSpark", 0x00d4ff);
    make("redSpark", 0xe74c3c);
    make("orangeSpark", 0xff9f43);
    make("toxicSpark", 0x39ff14);
    make("confettiSpark", 0xffd700);
    make("tinyBubble", 0xffffff);
  }

  /* ═══════════════════════════════════════════════════════════════
   *  PARTICLES
   * ═══════════════════════════════════════════════════════════════ */
  _createParticles() {
    this.splashParticles = this.add.particles(0, 0, "cyanSpark", {
      speed: { min: 80, max: 250 }, scale: { start: 1.2, end: 0 },
      alpha: { start: 1, end: 0 }, lifespan: 700, blendMode: "ADD", emitting: false,
    });
    this.alertParticles = this.add.particles(0, 0, "orangeSpark", {
      speed: { min: 60, max: 180 }, scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 }, lifespan: 500, blendMode: "ADD", emitting: false,
    });
    this.toxicParticles = this.add.particles(0, 0, "toxicSpark", {
      speed: { min: 100, max: 300 }, scale: { start: 1.5, end: 0 },
      alpha: { start: 1, end: 0 }, lifespan: 800, blendMode: "ADD", emitting: false,
    });
    this.confettiParticles = this.add.particles(0, 0, "confettiSpark", {
      speed: { min: 40, max: 180 }, angle: { min: 230, max: 310 },
      scale: { start: 1, end: 0.3 }, alpha: { start: 1, end: 0 },
      lifespan: 2500, gravityY: 120, emitting: false,
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
      const alpha = Phaser.Math.FloatBetween(0.08, 0.22);
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

    this.headlight = this.add.graphics().setDepth(49).setAlpha(0.05);
    this._drawHeadlight();
  }

  _drawHeadlight() {
    this.headlight.clear();
    this.headlight.fillStyle(0x88ccff, 1);
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

    this.scoreText = this.add.text(16, 68, "Score: 0", {
      fontFamily: "Arial", fontSize: "22px", color: "#ffffff", fontStyle: "bold",
      stroke: "#001122", strokeThickness: 3,
    }).setDepth(dp);

    this.add.text(W / 2, 68, "Floats Collected", {
      fontFamily: "Arial", fontSize: "12px", color: "#88bbdd", fontStyle: "bold",
    }).setOrigin(0.5, 0).setDepth(dp);

    this.progressBarBg = this.add.rectangle(W / 2, 90, 260, 16, 0x0d2137, 0.7)
      .setStrokeStyle(1, 0x1a6b8a).setDepth(dp);
    this.progressBarFill = this.add.rectangle(W / 2 - 130, 90, 0, 14, 0x00d4ff)
      .setOrigin(0, 0.5).setDepth(dp + 1);
    this.progressText = this.add.text(W / 2, 90, "0 / 25", {
      fontFamily: "Arial", fontSize: "11px", color: "#ffffff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(dp + 2);

    this.add.text(W - 170, 64, "O2", {
      fontFamily: "Arial", fontSize: "14px", color: "#2ecc71", fontStyle: "bold",
    }).setDepth(dp);

    this.oxygenBarBg = this.add.rectangle(W - 85, 80, 140, 16, 0x0d2137, 0.7)
      .setStrokeStyle(1, 0x1a6b8a).setDepth(dp);
    this.oxygenBarFill = this.add.rectangle(W - 155, 80, 140, 14, 0x2ecc71)
      .setOrigin(0, 0.5).setDepth(dp + 1);
    this.oxygenText = this.add.text(W - 85, 80, "100%", {
      fontFamily: "Arial", fontSize: "10px", color: "#ffffff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(dp + 2);

    this.depthBarBg = this.add.rectangle(20, H / 2, 8, H - 140, 0x0d2137, 0.4)
      .setStrokeStyle(1, 0x1a6b8a, 0.3).setDepth(dp);
    this.depthMarker = this.add.circle(20, H / 2, 6, 0x00d4ff, 0.8).setDepth(dp + 1);

    this.tooltip = this.add.text(W / 2, H - 80, "", {
      fontFamily: "Arial", fontSize: "16px", color: "#ffffff",
      backgroundColor: "rgba(0, 20, 40, 0.92)",
      padding: { x: 14, y: 6 }, align: "center", wordWrap: { width: 600 },
    }).setOrigin(0.5).setAlpha(0).setDepth(dp + 10);

    this.comboText = this.add.text(W / 2, 110, "", {
      fontFamily: "Arial", fontSize: "15px", color: "#fbbf24", fontStyle: "bold",
      stroke: "#001122", strokeThickness: 2,
    }).setOrigin(0.5).setAlpha(0).setDepth(dp);

    this.boostText = this.add.text(W / 2, H - 16, "SPACE = BOOST", {
      fontFamily: "Arial", fontSize: "11px", color: "#5dade2",
    }).setOrigin(0.5).setAlpha(0).setDepth(dp);
  }

  /* ═══════════════════════════════════════════════════════════════
   *  LIVE CODE PANEL — bottom bar showing assignment result
   * ═══════════════════════════════════════════════════════════════ */
  _createCodePanel() {
    const dp = 105;
    const panelY = H - 38;

    this.codePanelBg = this.add.graphics().setDepth(dp);
    this.codePanelBg.fillStyle(0x0a0e1a, 0.94);
    this.codePanelBg.fillRoundedRect(40, panelY - 16, W - 80, 32, 6);
    this.codePanelBg.lineStyle(1, 0x334155);
    this.codePanelBg.strokeRoundedRect(40, panelY - 16, W - 80, 32, 6);

    this.add.text(54, panelY - 4, ">", {
      fontFamily: "Courier New, monospace", fontSize: "14px", color: "#4ade80", fontStyle: "bold",
    }).setOrigin(0, 0.5).setDepth(dp + 1);

    this.codePanelText = this.add.text(72, panelY - 4, "float currentData = [ Waiting... ];", {
      fontFamily: "Courier New, monospace", fontSize: "13px", color: "#94a3b8",
    }).setOrigin(0, 0.5).setDepth(dp + 1);
  }

  _updateCodePanel(text, color) {
    if (!this.codePanelText?.active) return;
    this.codePanelText.setText(text).setColor(color);
    this.tweens.killTweensOf(this.codePanelText);
    this.codePanelText.setScale(1.04);
    this.tweens.add({ targets: this.codePanelText, scaleX: 1, scaleY: 1, duration: 200 });
  }

  /* ═══════════════════════════════════════════════════════════════
   *  INSTRUCTION OVERLAY
   * ═══════════════════════════════════════════════════════════════ */
  _showInstruction() {
    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.88).setDepth(200);

    const panelG = this.add.graphics().setDepth(201);
    panelG.fillStyle(0x001a2e, 0.98);
    panelG.fillRoundedRect(W / 2 - 320, 40, 640, 500, 16);
    panelG.lineStyle(3, 0x00d4ff);
    panelG.strokeRoundedRect(W / 2 - 320, 40, 640, 500, 16);

    const title = this.add.text(W / 2, 80, "MISSION 5: FLOAT TUNING", {
      fontFamily: "Arial Black", fontSize: "26px", color: "#00d4ff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(202);

    const sub = this.add.text(W / 2, 115, "Deep Type Dive — Danger Zone", {
      fontFamily: "Arial", fontSize: "17px", color: "#5dade2", fontStyle: "italic",
    }).setOrigin(0.5).setDepth(202);

    const desc = this.add.text(W / 2, 230,
      "You've learned what floats are. Now PROVE IT!\n" +
      "Three data types are drifting in the deep...\n\n" +
      "CYAN  = FLOAT bubbles (3.14, -0.5, 9.99) — COLLECT!\n" +
      "ORANGE = INT bubbles (5, 100, -42) — AVOID!\n" +
      "TOXIC GREEN = CHAR bubbles ('s', 'A', '#') — DANGER!\n\n" +
      "Controls:\n" +
      "Arrow keys or WASD to swim  |  SPACE for boost\n\n" +
      "Watch your OXYGEN — wrong types drain it!\n" +
      "CHAR bubbles are TOXIC: massive O2 penalty!",
      {
        fontFamily: "Arial", fontSize: "14px", color: "#bdc3c7",
        align: "center", lineSpacing: 6,
      }
    ).setOrigin(0.5).setDepth(202);

    const goal = this.add.text(W / 2, 420, "Collect 25 floats with 85%+ accuracy\nto earn the Precision Master badge!", {
      fontFamily: "Arial", fontSize: "14px", color: "#f1c40f",
      align: "center", fontStyle: "bold", lineSpacing: 6,
    }).setOrigin(0.5).setDepth(202);

    const btnBg = this.add.rectangle(W / 2, 480, 240, 48, 0x00688a, 1).setDepth(202);
    btnBg.setStrokeStyle(2, 0x00d4ff);
    const btnTxt = this.add.text(W / 2, 480, "DIVE DEEPER!", {
      fontFamily: "Arial", fontSize: "20px", color: "#ffffff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(203);

    btnBg.setInteractive({ useHandCursor: true });
    btnBg.on("pointerover", () => {
      btnBg.setFillStyle(0x00d4ff);
      this.tweens.add({ targets: [btnBg, btnTxt], scaleX: 1.08, scaleY: 1.08, duration: 120 });
    });
    btnBg.on("pointerout", () => {
      btnBg.setFillStyle(0x00688a);
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
   *  SPAWNING — 3 types: FLOAT / INT / CHAR with dynamic difficulty
   * ═══════════════════════════════════════════════════════════════ */
  _getSpawnProbabilities() {
    const progress = this.floatsCollected / TARGET_COLLECT;
    if (progress < 0.3) return { float: 0.70, int: 0.20, char: 0.10 };
    if (progress < 0.6) return { float: 0.55, int: 0.25, char: 0.20 };
    if (progress < 0.85) return { float: 0.45, int: 0.28, char: 0.27 };
    return { float: 0.38, int: 0.30, char: 0.32 };
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

    const probs = this._getSpawnProbabilities();
    const roll = Math.random();
    let bubbleType, value, displayText, bubbleColor, glowColor;

    if (roll < probs.float) {
      bubbleType = TYPE_FLOAT;
      value = Phaser.Utils.Array.GetRandom(FLOAT_VALUES);
      displayText = String(value);
      bubbleColor = 0x00d4ff;
      glowColor = 0x00d4ff;
    } else if (roll < probs.float + probs.int) {
      bubbleType = TYPE_INT;
      value = Phaser.Utils.Array.GetRandom(INT_VALUES);
      displayText = String(value);
      bubbleColor = 0xff9f43;
      glowColor = 0xff6b35;
    } else {
      bubbleType = TYPE_CHAR;
      value = Phaser.Utils.Array.GetRandom(CHAR_VALUES);
      displayText = value;
      bubbleColor = 0x39ff14;
      glowColor = 0x9b59b6;
    }

    const spawnX = Phaser.Math.Between(60, W - 60);
    const spawnY = Phaser.Math.Between(H + 20, H + 80);

    const container = this.add.container(spawnX, spawnY).setDepth(40);

    // Outer glow — stronger for CHAR (toxic)
    const glowAlpha = bubbleType === TYPE_CHAR ? 0.3 : 0.15;
    const outerGlow = this.add.circle(0, 0, BUBBLE_RADIUS + 6, glowColor, glowAlpha);
    container.add(outerGlow);

    // Second glow ring for CHAR
    if (bubbleType === TYPE_CHAR) {
      const toxicRing = this.add.circle(0, 0, BUBBLE_RADIUS + 12, 0x9b59b6, 0.1);
      container.add(toxicRing);
    }

    const fillAlpha = bubbleType === TYPE_FLOAT ? 0.25 : bubbleType === TYPE_INT ? 0.3 : 0.35;
    const circle = this.add.circle(0, 0, BUBBLE_RADIUS, bubbleColor, fillAlpha);
    circle.setStrokeStyle(2, bubbleColor, 0.85);
    container.add(circle);

    const highlight = this.add.circle(-8, -10, 5, 0xffffff, 0.15);
    container.add(highlight);

    const fontSize = displayText.length > 4 ? "13px" : "17px";
    const strokeColor = bubbleType === TYPE_FLOAT ? "#003f5c"
      : bubbleType === TYPE_INT ? "#7f3300"
      : "#2d0a4e";

    const txt = this.add.text(0, 0, displayText, {
      fontFamily: "Courier New, monospace", fontSize, color: "#ffffff",
      fontStyle: "bold", stroke: strokeColor, strokeThickness: 2,
    }).setOrigin(0.5);
    container.add(txt);

    // Type label below bubble
    const typeLabel = bubbleType === TYPE_FLOAT ? "float"
      : bubbleType === TYPE_INT ? "int"
      : "char";
    const labelColor = bubbleType === TYPE_FLOAT ? "#88ddff"
      : bubbleType === TYPE_INT ? "#ffbb77"
      : "#88ff44";

    const lbl = this.add.text(0, BUBBLE_RADIUS + 9, typeLabel, {
      fontFamily: "Arial", fontSize: "9px", color: labelColor, fontStyle: "bold",
    }).setOrigin(0.5);
    container.add(lbl);

    // Physics
    this.physics.add.existing(container);
    container.body.setCircle(BUBBLE_RADIUS, -BUBBLE_RADIUS, -BUBBLE_RADIUS);
    container.body.setAllowGravity(false);
    container.body.setVelocityY(-BUBBLE_RISE_SPEED);

    container.setData("bubbleType", bubbleType);
    container.setData("value", value);
    container.setData("displayText", displayText);
    container.setData("wobbleBase", spawnX);
    container.setData("wobbleTime", 0);
    container.active = true;

    container.setScale(0);
    this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 300, ease: "Back.out" });

    // Toxic pulse animation for CHAR bubbles
    if (bubbleType === TYPE_CHAR) {
      this.tweens.add({
        targets: outerGlow, alpha: 0.05, yoyo: true, repeat: -1, duration: 600,
      });
    }

    this.physics.add.overlap(this.player, container, () => {
      this._onCollectBubble(container);
    }, null, this);

    this.bubbles.push(container);
  }

  /* ═══════════════════════════════════════════════════════════════
   *  BUBBLE COLLISION — type-specific feedback
   * ═══════════════════════════════════════════════════════════════ */
  _onCollectBubble(container) {
    if (this.isComplete || !container.active) return;
    container.active = false;

    const bubbleType = container.getData("bubbleType");
    const displayText = container.getData("displayText");
    const cx = container.x;
    const cy = container.y;

    this.tweens.killTweensOf(container);
    container.destroy();

    if (bubbleType === TYPE_FLOAT) {
      this._onCollectFloat(cx, cy, displayText);
    } else if (bubbleType === TYPE_INT) {
      this._onCollectInt(cx, cy, displayText);
    } else {
      this._onCollectChar(cx, cy, displayText);
    }
  }

  _onCollectFloat(cx, cy, displayText) {
    this.floatsCollected++;
    this.totalAttempts++;
    this.combo++;
    this.score += 15;

    GameManager.addXP(15 * GameManager.getComboMultiplier());
    GameManager.addScore(15);
    GameManager.addCombo();

    this.oxygen = Math.min(OXYGEN_MAX, this.oxygen + OXYGEN_REWARD);

    this.splashParticles.emitParticleAt(cx, cy, 20);
    this._showPopup(cx, cy - 20, "+15", "#00d4ff");
    this._showTooltip(getFloatTip(displayText), "#00d4ff");
    this._updateCodePanel(
      `float currentData = ${displayText}; // SUCCESS: Valid Float!`,
      "#4ade80"
    );

    if (this.combo >= 5) {
      this.cameras.main.flash(200, 0, 200, 255);
    }

    this._updateHUD();

    if (this.floatsCollected >= TARGET_COLLECT) {
      this._checkLevelEnd();
    }
  }

  _onCollectInt(cx, cy, displayText) {
    this.totalAttempts++;
    this.wrongAttempts++;
    this.combo = 0;
    this.score = Math.max(0, this.score - 10);
    GameManager.resetCombo();

    this.oxygen = Math.max(0, this.oxygen - OXYGEN_PENALTY_INT);

    // Bounce submarine away
    const angle = Phaser.Math.Angle.Between(cx, cy, this.player.x, this.player.y);
    this.player.body.setVelocity(Math.cos(angle) * 350, Math.sin(angle) * 350);

    this.alertParticles.emitParticleAt(cx, cy, 15);
    this.cameras.main.shake(200, 0.012);
    this.cameras.main.flash(200, 255, 100, 0);

    this._showPopup(cx, cy - 20, "-10", "#ff9f43");
    this._showTooltip(getIntTip(displayText), "#ff9f43");
    this._updateCodePanel(
      `float currentData = ${displayText}; // WARNING: Expected decimal precision!`,
      "#ff9f43"
    );

    this._updateHUD();
    if (this.oxygen <= 0) this._gameOver();
  }

  _onCollectChar(cx, cy, displayText) {
    this.totalAttempts++;
    this.wrongAttempts++;
    this.combo = 0;
    this.score = Math.max(0, this.score - 25);
    GameManager.resetCombo();

    this.oxygen = Math.max(0, this.oxygen - OXYGEN_PENALTY_CHAR);

    // Heavy knockback
    const angle = Phaser.Math.Angle.Between(cx, cy, this.player.x, this.player.y);
    this.player.body.setVelocity(Math.cos(angle) * 500, Math.sin(angle) * 500);

    this.toxicParticles.emitParticleAt(cx, cy, 30);
    this.cameras.main.shake(500, 0.03);
    this.cameras.main.flash(400, 50, 255, 20);

    this._showPopup(cx, cy - 20, "-25", "#39ff14");
    this._showTooltip(getCharTip(displayText), "#39ff14");
    this._updateCodePanel(
      `float currentData = ${displayText}; // TYPE ERROR: Cannot assign char to float!`,
      "#ef4444"
    );

    this._updateHUD();
    if (this.oxygen <= 0) this._gameOver();
  }

  /* ═══════════════════════════════════════════════════════════════
   *  HUD UPDATES
   * ═══════════════════════════════════════════════════════════════ */
  _updateHUD() {
    if (this.scoreText?.active) {
      this.scoreText.setText(`Score: ${this.score}`);
      this.tweens.add({ targets: this.scoreText, scaleX: 1.15, scaleY: 1.15, yoyo: true, duration: 100 });
    }

    if (this.progressBarFill && this.progressText) {
      const pct = Math.min(this.floatsCollected / TARGET_COLLECT, 1);
      this.tweens.add({ targets: this.progressBarFill, width: 260 * pct, duration: 300, ease: "Cubic.out" });
      this.progressText.setText(`${this.floatsCollected} / ${TARGET_COLLECT}`);
    }

    if (this.oxygenBarFill && this.oxygenText) {
      const pct = this.oxygen / OXYGEN_MAX;
      this.tweens.add({ targets: this.oxygenBarFill, width: 140 * pct, duration: 200 });
      this.oxygenText.setText(`${Math.round(this.oxygen)}%`);
      let oxyColor;
      if (pct > 0.5) oxyColor = 0x2ecc71;
      else if (pct > 0.25) oxyColor = 0xf1c40f;
      else oxyColor = 0xe74c3c;
      this.oxygenBarFill.setFillStyle(oxyColor);
    }

    if (this.comboText) {
      if (this.combo >= 2) {
        const mult = GameManager.getComboMultiplier();
        this.comboText.setText(`${this.combo}x COMBO!${mult > 1 ? ` (${mult}x XP)` : ""}`);
        this.comboText.setAlpha(1);
        this.tweens.add({ targets: this.comboText, scaleX: 1.2, scaleY: 1.2, yoyo: true, duration: 150 });
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
      fontFamily: "Arial", fontSize: "22px", color, fontStyle: "bold",
      stroke: "#001122", strokeThickness: 2,
    }).setOrigin(0.5).setDepth(150);

    this.tweens.add({
      targets: popup, y: y - 60, alpha: 0, scaleX: 1.3, scaleY: 1.3,
      duration: 800, ease: "Cubic.out", onComplete: () => popup.destroy(),
    });
  }

  _showTooltip(text, color) {
    if (!this.tooltip?.active) return;
    this.tooltip.setText(text).setColor(color || "#ffffff").setAlpha(1);
    this.tweens.killTweensOf(this.tooltip);
    this.tweens.add({ targets: this.tooltip, alpha: 0, delay: 2200, duration: 500 });
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
      if (b?.active) { this.tweens.killTweensOf(b); b.destroy(); }
    });

    const passed = accuracy >= ACCURACY_THRESHOLD;
    const elapsed = Math.round((this.time.now - this.startTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    const timeStr = `${mins}:${secs.toString().padStart(2, "0")}`;

    if (passed) {
      GameManager.completeLevel(4, accuracy);
      BadgeSystem.unlock("precision_master");
      ProgressTracker.saveProgress(GameManager.getState());
      this.cameras.main.flash(600, 0, 200, 255);

      for (let i = 0; i < 8; i++) {
        this.time.delayedCall(i * 200, () => {
          this.confettiParticles.emitParticleAt(
            Phaser.Math.Between(100, W - 100),
            Phaser.Math.Between(0, 50), 15
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
    const panelColor = passed ? 0x001a2e : 0x4a1e1e;
    const borderColor = passed ? 0x00d4ff : 0xe74c3c;
    panelG.fillStyle(panelColor, 0.95);
    panelG.fillRoundedRect(W / 2 - 280, 80, 560, 440, 16);
    panelG.lineStyle(3, borderColor);
    panelG.strokeRoundedRect(W / 2 - 280, 80, 560, 440, 16);

    const titleText = passed ? "LEVEL COMPLETE: TYPE TUNED!" : "ACCURACY TOO LOW";
    const titleColor = passed ? "#00d4ff" : "#e74c3c";

    this.add.text(W / 2, 120, titleText, {
      fontFamily: "Arial Black", fontSize: "28px", color: titleColor, fontStyle: "bold",
    }).setOrigin(0.5).setDepth(202);

    if (passed) {
      this.add.text(W / 2, 155, "You can distinguish float, int, and char types!", {
        fontFamily: "Arial", fontSize: "14px", color: "#86efac", fontStyle: "italic",
      }).setOrigin(0.5).setDepth(202);
    }

    const statsY = 185;
    const stats = [
      `Floats Collected: ${this.floatsCollected} / ${TARGET_COLLECT}`,
      `Accuracy: ${accuracy}%`,
      `Score: ${this.score}`,
      `Time: ${timeStr}`,
      `Oxygen Remaining: ${Math.round(this.oxygen)}%`,
      `Wrong Catches: ${this.wrongAttempts}`,
    ];

    stats.forEach((s, i) => {
      this.add.text(W / 2, statsY + i * 28, s, {
        fontFamily: "Arial", fontSize: "16px", color: "#ecf0f1",
      }).setOrigin(0.5).setDepth(202);
    });

    if (passed) {
      this.add.text(W / 2, statsY + stats.length * 28 + 12, "Badge Unlocked: Precision Master!", {
        fontFamily: "Arial", fontSize: "16px", color: "#f1c40f", fontStyle: "bold",
      }).setOrigin(0.5).setDepth(202);

      this.add.text(W / 2, statsY + stats.length * 28 + 48,
        "You learned: Assigning the wrong data type\nto a float variable causes type errors!", {
        fontFamily: "Arial", fontSize: "13px", color: "#bdc3c7",
        align: "center", lineSpacing: 5,
      }).setOrigin(0.5).setDepth(202);
    }

    const btnY = 460;
    if (passed) {
      this._createEndButton(W / 2 - 130, btnY, "NEXT LEVEL", 0x2980b9, () => {
        this.scene.stop("UIScene");
        this.scene.start("MenuScene");
      });
      this._createEndButton(W / 2 + 130, btnY, "REPLAY", 0x00688a, () => {
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
      fontFamily: "Arial", fontSize: "16px", color: "#ffffff", fontStyle: "bold",
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
      if (b?.active) { this.tweens.killTweensOf(b); b.destroy(); }
    });

    this.cameras.main.shake(500, 0.02);
    this.cameras.main.flash(300, 255, 0, 0);

    this._updateCodePanel("// FATAL: Oxygen depleted. Mission failed.", "#ef4444");

    this.time.delayedCall(600, () => {
      this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.88).setDepth(200);

      this.add.text(W / 2, H / 2 - 80, "OXYGEN DEPLETED", {
        fontFamily: "Arial Black", fontSize: "32px", color: "#e74c3c", fontStyle: "bold",
      }).setOrigin(0.5).setDepth(201);

      this.add.text(W / 2, H / 2 - 20, `You collected ${this.floatsCollected} / ${TARGET_COLLECT} floats`, {
        fontFamily: "Arial", fontSize: "20px", color: "#ecf0f1",
      }).setOrigin(0.5).setDepth(201);

      this.add.text(W / 2, H / 2 + 15, "Your oxygen ran out in the deep!", {
        fontFamily: "Arial", fontSize: "16px", color: "#e74c3c",
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

    /* ── Player movement ── */
    const speed = this.isBoosting ? BOOST_SPEED : PLAYER_SPEED;
    let vx = 0, vy = 0;

    const left = this.cursors.left.isDown || this.wasd.left.isDown;
    const right = this.cursors.right.isDown || this.wasd.right.isDown;
    const up = this.cursors.up.isDown || this.wasd.up.isDown;
    const down = this.cursors.down.isDown || this.wasd.down.isDown;

    if (left) vx = -speed;
    else if (right) vx = speed;
    if (up) vy = -speed;
    else if (down) vy = speed;

    if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707; }

    this.player.setVelocity(vx, vy);
    if (vy < 0) this.player.setAngle(-8);
    else if (vy > 0) this.player.setAngle(8);
    else this.player.setAngle(0);
    this.player.setFlipX(vx < 0);

    // Boost
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

    /* ── Headlight ── */
    if (this.headlight) this._drawHeadlight();

    /* ── Depth marker ── */
    if (this.depthMarker) {
      const depthPct = this.player.y / H;
      this.depthMarker.setY(100 + depthPct * (H - 200));
    }

    /* ── Oxygen decay ── */
    this.oxygen = Math.max(0, this.oxygen - OXYGEN_DECAY_PER_SEC * dt);
    this._updateOxygenBar();
    if (this.oxygen <= 0) { this._gameOver(); return; }

    /* ── Bubble wobble & cleanup ── */
    this.bubbles.forEach(b => {
      if (b?.active) {
        const t = b.getData("wobbleTime") + dt;
        b.setData("wobbleTime", t);
        b.x = b.getData("wobbleBase") + Math.sin(t * 1.5) * 22;
        b.setScale(1 + Math.sin(t * 3) * 0.04);

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
    let c;
    if (pct > 0.5) c = 0x2ecc71;
    else if (pct > 0.25) c = 0xf1c40f;
    else c = 0xe74c3c;
    this.oxygenBarFill.setFillStyle(c);
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
