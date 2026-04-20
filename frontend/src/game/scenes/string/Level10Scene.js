/**
 * Level10Scene — "String Discovery: Message Garden Collector" (Accretion Phase)
 * ===============================================================================
 * Mechanic: Garden adventure collecting message flowers (strings)
 * - Player controls a basket avatar through a magical garden
 * - Valid STRING flowers drift down — COLLECT them!
 * - CHAR flowers and invalid data also drift — AVOID them!
 * - Collect 30 valid strings with ≥85% accuracy to pass
 * - Key learning: Strings use DOUBLE quotes vs Chars use single quotes
 *
 * Schema Theory: Accretion — introducing STRING concepts through discovery
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
const MAX_FLOWERS = 8;
const FLOWER_RADIUS = 24;
const PLAYER_SPEED = 300;
const OXYGEN_MAX = 100;
const OXYGEN_DECAY_PER_SEC = 0.3;
const OXYGEN_PENALTY = 8;
const OXYGEN_REWARD = 3;
const SPAWN_INTERVAL = 2000;
const VALID_CHANCE = 0.70;

/* ───────── String Pools (VALID - double quotes) ───────── */
const STRINGS_TEXT = ['"Hello"', '"World"', '"Code"', '"Fun"', '"Java"', '"Python"'];
const STRINGS_NUMBER = ['"123"', '"456"', '"0"', '"99"', '"2024"'];
const STRINGS_EMPTY = ['""'];
const STRINGS_SPACES = ['" "', '"Hi "', '" World"'];
const STRINGS_SYMBOLS = ['"!"', '"#Code"', '"@User"', '"Hello!"', '"Hi?"'];

/* ───────── Invalid Data (to avoid) ───────── */
const INVALID_CHARS = ["'A'", "'z'", "'5'", "'@'", "' '"];
const INVALID_NUMBERS = [123, 42, 7];
const INVALID_EMPTY = ["''"];
const INVALID_NO_QUOTES = ["Hello", "World", "Code"];

const STRING_CATEGORIES = [
  { pool: STRINGS_TEXT, color: 0xff69b4, label: "Text", emoji: "📝" },
  { pool: STRINGS_NUMBER, color: 0xffd700, label: "Numbers", emoji: "🔢" },
  { pool: STRINGS_EMPTY, color: 0x87ceeb, label: "Empty", emoji: "⭕" },
  { pool: STRINGS_SPACES, color: 0x90ee90, label: "Spaces", emoji: "⎵" },
  { pool: STRINGS_SYMBOLS, color: 0xff6347, label: "Symbols", emoji: "❗" },
];

const INVALID_CATEGORIES = [
  { pool: INVALID_CHARS, color: 0xffd700, label: "Char", type: "char" },
  { pool: INVALID_NUMBERS, color: 0xff8800, label: "Number", type: "number" },
  { pool: INVALID_EMPTY, color: 0x333333, label: "Empty", type: "empty" },
  { pool: INVALID_NO_QUOTES, color: 0xff4444, label: "No Quotes", type: "noquote" },
];

/* ───────── Helpers ───────── */
function lerpColor(a, b, t) {
  const ar = (a >> 16) & 0xff, ag = (a >> 8) & 0xff, ab = a & 0xff;
  const br = (b >> 16) & 0xff, bg = (b >> 8) & 0xff, bb = b & 0xff;
  return (Math.round(ar + (br - ar) * t) << 16) |
         (Math.round(ag + (bg - ag) * t) << 8) |
          Math.round(ab + (bb - ab) * t);
}

function getStringTip(value, category) {
  const tips = {
    Text: [
      `✓ "${value}" is a string of text with double quotes!`,
      `✓ Text strings like "${value}" hold words and letters!`,
      `✓ "${value}" has double quotes — that makes it a string!`,
    ],
    Numbers: [
      `✓ "${value}" is a NUMBER STRING — not a math number!`,
      `✓ With double quotes, "${value}" is text, not math!`,
      `✓ "${value}" is a string, so 123 + 456 = "123456"!`,
    ],
    Empty: [
      `✓ "" is an EMPTY STRING — zero characters but still valid!`,
      `✓ Empty string "" is valid — it just has nothing in it!`,
      `✓ Length of "" is 0, but it's still a string!`,
    ],
    Spaces: [
      `✓ "${value}" is a string containing spaces!`,
      `✓ Strings can hold spaces inside: "${value}"!`,
      `✓ Whitespace in double quotes is part of the string!`,
    ],
    Symbols: [
      `✓ "${value}" is a string with special symbols!`,
      `✓ Symbols like ! @ # inside double quotes are strings!`,
      `✓ "${value}" shows strings can contain punctuation!`,
    ],
  };
  const pool = tips[category] || tips.Text;
  return pool[Math.floor(Math.random() * pool.length)];
}

function getInvalidTip(value, type) {
  const tips = {
    char: [
      `✗ '${value}' has SINGLE quotes — that's a CHAR, not a string!`,
      `✗ Single quotes '${value}' mean char — strings need DOUBLE quotes!`,
      `✗ 'A' is a char. To make it a string, write "A"!`,
    ],
    number: [
      `✗ ${value} is a NUMBER — needs double quotes to be a string!`,
      `✗ Plain ${value} is math, not a string — add quotes: "${value}"!`,
      `✗ Without quotes, ${value} is an integer, not a string!`,
    ],
    empty: [
      `✗ '' has SINGLE quotes — strings need DOUBLE quotes: ""!`,
      `✗ Empty single quotes '' are invalid — use double quotes!`,
    ],
    noquote: [
      `✗ ${value} has NO QUOTES — strings need double quotes: "${value}"!`,
      `✗ ${value} needs double quotes to become a string: "${value}"!`,
      `✗ Bare text ${value} is not a string — add double quotes!`,
    ],
  };
  const pool = tips[type] || tips.number;
  return pool[Math.floor(Math.random() * pool.length)];
}

/* ═══════════════════════════════════════════════════════════════
 *  LEVEL 10 SCENE — Message Garden Collector
 * ═══════════════════════════════════════════════════════════════ */
export class Level10Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level10Scene" });
  }

  create() {
    this.physics.world.gravity.y = 0;

    /* ── State ── */
    this.stringsCollected = 0;
    this.totalAttempts = 0;
    this.wrongAttempts = 0;
    this.score = 0;
    this.oxygen = OXYGEN_MAX;
    this.isComplete = false;
    this.gameStarted = false;
    this.flowers = [];
    this.startTime = 0;
    this.combo = 0;
    this.categoryCount = {
      Text: 0,
      Numbers: 0,
      Empty: 0,
      Spaces: 0,
      Symbols: 0,
    };

    this._drawGardenBackground();
    this._generateTextures();
    this._createParticles();
    this._createAmbientButterflies();
    this._createPlayer();
    this._createHUD();
    this._createCategoryTracker();

    const uiScene = this.scene.get("UIScene");
    if (uiScene && uiScene.setLevelLabel) {
      uiScene.setLevelLabel("Level 10: Accretion — Message Garden Collector!");
    }

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });

    this._showInstruction();
  }

  /* ═══════════════════════════════════════════════════════════════
   *  GARDEN BACKGROUND
   * ═══════════════════════════════════════════════════════════════ */
  _drawGardenBackground() {
    /* Sky gradient */
    const gfx = this.add.graphics().setDepth(0);
    const topColor = 0x87ceeb;
    const botColor = 0x90ee90;
    const steps = 60;
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const c = lerpColor(topColor, botColor, t);
      gfx.fillStyle(c, 1);
      gfx.fillRect(0, Math.floor((H * i) / steps), W, Math.ceil(H / steps) + 1);
    }

    /* Grass patch details */
    const grassGfx = this.add.graphics().setDepth(1).setAlpha(0.08);
    for (let i = 0; i < 80; i++) {
      const x = Phaser.Math.Between(0, W);
      const y = Phaser.Math.Between(H * 0.65, H);
      const h = Phaser.Math.Between(3, 12);
      grassGfx.fillStyle(0x228b22, 0.3);
      grassGfx.fillRect(x, y, 2, h);
    }

    /* Decorative bushes */
    for (let i = 0; i < 8; i++) {
      const bx = Phaser.Math.Between(50, W - 50);
      const by = Phaser.Math.Between(H * 0.7, H - 20);
      const bush = this.add.circle(bx, by, Phaser.Math.Between(30, 50), 0x228b22, 0.15);
      bush.setDepth(2);
    }

    /* Fence border */
    const fenceGfx = this.add.graphics().setDepth(3);
    fenceGfx.lineStyle(3, 0x8b4513, 0.5);
    fenceGfx.strokeRect(20, 20, W - 40, H - 100);

    /* Garden path (center) */
    const pathGfx = this.add.graphics().setDepth(4);
    pathGfx.fillStyle(0xdeb887, 0.2);
    pathGfx.fillRect(W / 2 - 40, 40, 80, H - 120);

    /* Sign */
    const signContainer = this.add.container(W - 80, 60).setDepth(50);
    const signPost = this.add.rectangle(0, 0, 12, 60, 0x8b4513, 1);
    const signBoard = this.add.rectangle(0, -35, 120, 50, 0xf5deb3, 1);
    signBoard.setStrokeStyle(3, 0x8b4513);
    const signText = this.add.text(0, -35, "MESSAGE\nGARDEN", {
      fontFamily: "Arial",
      fontSize: "12px",
      color: "#654321",
      align: "center",
      fontStyle: "bold",
    }).setOrigin(0.5);
    signContainer.add([signPost, signBoard, signText]);
  }

  /* ═══════════════════════════════════════════════════════════════
   *  TEXTURES
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
    make("goldSpark", 0xffd700, 4);
    make("pinkSpark", 0xff69b4, 4);
    make("confettiSpark", 0xffd700, 4);
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
    }).setDepth(160);

    this.alertParticles = this.add.particles(0, 0, "redSpark", {
      speed: { min: 60, max: 180 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 500,
      blendMode: "ADD",
      emitting: false,
    }).setDepth(160);

    this.confettiParticles = this.add.particles(0, 0, "confettiSpark", {
      speed: { min: 40, max: 180 },
      angle: { min: 230, max: 310 },
      scale: { start: 1, end: 0.3 },
      alpha: { start: 1, end: 0 },
      lifespan: 2500,
      gravityY: 120,
      emitting: false,
    }).setDepth(160);
  }

  /* ═══════════════════════════════════════════════════════════════
   *  AMBIENT BUTTERFLIES
   * ═══════════════════════════════════════════════════════════════ */
  _createAmbientButterflies() {
    for (let i = 0; i < 5; i++) {
      const butterfly = this.add.text(
        Phaser.Math.Between(100, W - 100),
        Phaser.Math.Between(100, 300),
        "🦋",
        { fontSize: "28px" }
      );
      this.tweens.add({
        targets: butterfly,
        x: `+=${Phaser.Math.Between(-200, 200)}`,
        y: `+=${Phaser.Math.Between(-100, 100)}`,
        duration: 3000,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }
  }

  /* ═══════════════════════════════════════════════════════════════
   *  PLAYER (BASKET)
   * ═══════════════════════════════════════════════════════════════ */
  _createPlayer() {
    this.player = this.add.container(W / 2, H - 80).setDepth(50);

    /* Basket shape */
    const basketGfx = this.add.graphics();
    basketGfx.fillStyle(0xd4a574, 1);
    basketGfx.fillRect(-25, 0, 50, 30);
    basketGfx.lineStyle(2, 0xa0826d, 1);
    basketGfx.strokeRect(-25, 0, 50, 30);

    /* Basket weave pattern */
    basketGfx.lineStyle(1, 0xa0826d, 0.5);
    for (let i = 0; i < 5; i++) {
      basketGfx.beginPath();
      basketGfx.moveTo(-25 + i * 10, 0);
      basketGfx.lineTo(-25 + i * 10, 30);
      basketGfx.strokePath();
    }
    basketGfx.generateTexture("basketTex", 50, 30);
    basketGfx.destroy();

    const basket = this.add.image(0, 0, "basketTex");

    /* Handle */
    const handle = this.add.arc(0, -8, 28, Math.PI, 0, false, 0xa0826d);
    handle.setStrokeStyle(3, 0xa0826d);

    /* Strings collected indicator */
    this.basketCount = this.add.text(0, 8, "0", {
      fontFamily: "Arial",
      fontSize: "14px",
      color: "#ffffff",
      fontStyle: "bold",
    }).setOrigin(0.5);

    this.player.add([basket, handle, this.basketCount]);

    /* Physics */
    this.physics.add.existing(this.player);
    this.player.body.setBounce(0.3, 0.3);
    this.player.body.setCollideWorldBounds(true);
    this.player.body.setAllowGravity(false);
    this.player.body.setDrag(1000);
    this.player.body.setMaxSpeed(200);
  }

  /* ═══════════════════════════════════════════════════════════════
   *  HUD
   * ═══════════════════════════════════════════════════════════════ */
  _createHUD() {
    const dp = 100;

    /* Score */
    this.scoreText = this.add.text(16, 40, "STRINGS: 0 / 30", {
      fontFamily: "Arial",
      fontSize: "18px",
      color: "#ffffff",
      fontStyle: "bold",
      stroke: "#228b22",
      strokeThickness: 2,
    }).setDepth(dp);

    /* Progress label */
    this.add.text(W / 2, 40, "Strings Collected", {
      fontFamily: "Arial",
      fontSize: "12px",
      color: "#ff69b4",
      fontStyle: "bold",
    }).setOrigin(0.5, 0).setDepth(dp);

    /* Progress bar */
    this.progressBarBg = this.add.rectangle(W / 2, 65, 260, 16, 0x228b22, 0.3)
      .setStrokeStyle(2, 0xff69b4).setDepth(dp);
    this.progressBarFill = this.add.rectangle(W / 2 - 130, 65, 0, 12, 0xff69b4)
      .setOrigin(0, 0.5).setDepth(dp + 1);
    this.progressText = this.add.text(W / 2, 65, "0 / 30", {
      fontFamily: "Arial",
      fontSize: "11px",
      color: "#ffffff",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(dp + 2);

    /* Oxygen bar */
    this.add.text(W - 70, 40, "O₂", {
      fontFamily: "Arial",
      fontSize: "14px",
      color: "#2ecc71",
      fontStyle: "bold",
    }).setOrigin(1, 0).setDepth(dp);

    this.oxygenBarBg = this.add.rectangle(W - 30, 60, 100, 14, 0x228b22, 0.3)
      .setStrokeStyle(1, 0x2ecc71).setDepth(dp);
    this.oxygenBarFill = this.add.rectangle(W - 80, 60, 100, 12, 0x2ecc71)
      .setOrigin(0, 0.5).setDepth(dp + 1);
    this.oxygenText = this.add.text(W - 95, 60, "100%", {
      fontFamily: "Arial",
      fontSize: "10px",
      color: "#ffffff",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(dp + 2);

    /* Combo */
    this.comboText = this.add.text(W / 2, 160, "", {
      fontFamily: "Arial",
      fontSize: "14px",
      color: "#fbbf24",
      fontStyle: "bold",
      stroke: "#228b22",
      strokeThickness: 2,
    }).setOrigin(0.5).setAlpha(0).setDepth(dp);

    /* Tooltip */
    this.tooltip = this.add.text(W / 2, H - 40, "", {
      fontFamily: "Arial",
      fontSize: "14px",
      color: "#ffffff",
      backgroundColor: "rgba(50, 50, 50, 0.9)",
      padding: { x: 12, y: 6 },
      align: "center",
      wordWrap: { width: 650 },
    }).setOrigin(0.5).setAlpha(0).setDepth(dp + 10);
  }

  /* ═══════════════════════════════════════════════════════════════
   *  CATEGORY TRACKER
   * ═══════════════════════════════════════════════════════════════ */
  _createCategoryTracker() {
    const dp = 100;
    const baseY = H - 110;
    const startX = W / 2 - 130;
    const spacing = 65;

    this.categoryTrackerItems = [];

    STRING_CATEGORIES.forEach((cat, i) => {
      const cx = startX + i * spacing;

      const circle = this.add.circle(cx, baseY, 14, cat.color, 0.2).setDepth(dp);
      circle.setStrokeStyle(2, cat.color, 0.6);

      const emoji = this.add.text(cx, baseY, cat.emoji, {
        fontSize: "16px",
      }).setOrigin(0.5).setDepth(dp + 1);

      const counter = this.add.text(cx, baseY + 22, "0", {
        fontFamily: "Arial",
        fontSize: "10px",
        color: "#aaaaaa",
        fontStyle: "bold",
      }).setOrigin(0.5).setDepth(dp + 1);

      const label = this.add.text(cx, baseY - 20, cat.label, {
        fontFamily: "Arial",
        fontSize: "8px",
        color: "#888888",
      }).setOrigin(0.5).setDepth(dp);

      this.categoryTrackerItems.push({ circle, emoji, counter, label, cat });
    });
  }

  _updateCategoryTracker() {
    this.categoryTrackerItems.forEach(item => {
      const count = this.categoryCount[item.cat.label] || 0;
      item.counter.setText(String(count));

      if (count >= 6) {
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
    panelG.fillStyle(0x1a3a1a, 0.98);
    panelG.fillRoundedRect(W / 2 - 320, 30, 640, 530, 16);
    panelG.lineStyle(3, 0xff69b4);
    panelG.strokeRoundedRect(W / 2 - 320, 30, 640, 530, 16);

    const title = this.add.text(W / 2, 68, "🌸 MISSION 10: STRING DISCOVERY", {
      fontFamily: "Arial Black, Arial, sans-serif",
      fontSize: "24px",
      color: "#ff69b4",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(202);

    const sub = this.add.text(W / 2, 100, "Message Garden Collector", {
      fontFamily: "Arial",
      fontSize: "16px",
      color: "#90ee90",
      fontStyle: "italic",
    }).setOrigin(0.5).setDepth(202);

    const desc = this.add.text(W / 2, 210,
      "A STRING is a sequence of characters wrapped in DOUBLE quotes!\n\n" +
      "✅ VALID STRINGS (collect these):\n" +
      '"Hello"  "123"  ""  "Hi World!"  "!"  " "\n\n' +
      "❌ AVOID THESE:\n" +
      "'A' (single quotes=char)  123 (no quotes)  '' (wrong bracket type)\n\n" +
      "Controls:\n" +
      "← → ↑ ↓  or  WASD  to move basket\n\n" +
      "⚠ Watch your OXYGEN — it drains over time!\n" +
      "Correct catches restore O₂, mistakes drain it!",
      {
        fontFamily: "Arial",
        fontSize: "13px",
        color: "#bdc3c7",
        align: "center",
        lineSpacing: 5,
      }
    ).setOrigin(0.5).setDepth(202);

    const goal = this.add.text(W / 2, 418, "Collect 30 valid strings with 85%+ accuracy\nto earn the Garden Keeper badge! 🌸", {
      fontFamily: "Arial",
      fontSize: "13px",
      color: "#f1c40f",
      align: "center",
      fontStyle: "bold",
      lineSpacing: 4,
    }).setOrigin(0.5).setDepth(202);

    const btnBg = this.add.rectangle(W / 2, 475, 280, 48, 0x228b22, 1).setDepth(202);
    btnBg.setStrokeStyle(2, 0xff69b4);
    const btnTxt = this.add.text(W / 2, 475, "BEGIN HARVEST", {
      fontFamily: "Arial",
      fontSize: "20px",
      color: "#ffffff",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(203);

    btnBg.setInteractive({ useHandCursor: true });
    btnBg.on("pointerover", () => {
      btnBg.setFillStyle(0xff69b4);
      this.tweens.add({ targets: [btnBg, btnTxt], scaleX: 1.08, scaleY: 1.08, duration: 120 });
    });
    btnBg.on("pointerout", () => {
      btnBg.setFillStyle(0x228b22);
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
    this._scheduleSpawn();
  }

  /* ═══════════════════════════════════════════════════════════════
   *  SPAWNING
   * ═══════════════════════════════════════════════════════════════ */
  _scheduleSpawn() {
    if (this.isComplete) return;
    this.spawnTimer = this.time.delayedCall(SPAWN_INTERVAL, () => {
      this._spawnFlower();
      this._scheduleSpawn();
    });
  }

  _spawnFlower() {
    if (this.isComplete) return;
    this.flowers = this.flowers.filter(f => f.active);
    if (this.flowers.length >= MAX_FLOWERS) return;

    const isValid = Math.random() < VALID_CHANCE;
    let value, displayText, category, flowerColor, invalidType;

    if (isValid) {
      const cat = Phaser.Utils.Array.GetRandom(STRING_CATEGORIES);
      value = Phaser.Utils.Array.GetRandom(cat.pool);
      displayText = value;
      category = cat.label;
      flowerColor = cat.color;
      invalidType = null;
    } else {
      const invCat = Phaser.Utils.Array.GetRandom(INVALID_CATEGORIES);
      const raw = Phaser.Utils.Array.GetRandom(invCat.pool);
      value = raw;
      invalidType = invCat.type;
      flowerColor = invCat.color;
      category = null;

      if (typeof raw === "number") {
        displayText = String(raw);
      } else {
        displayText = raw;
      }
    }

    const spawnX = Phaser.Math.Between(60, W - 60);
    const spawnY = 20;
    const fallSpeed = Phaser.Math.Between(40, 80);

    const container = this.add.container(spawnX, spawnY).setDepth(40);

    /* Flower petals (circular arrangement) */
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const petalX = Math.cos(angle) * 14;
      const petalY = Math.sin(angle) * 14;
      const petal = this.add.ellipse(petalX, petalY, 16, 10, flowerColor);
      petal.setRotation(angle);
      container.add(petal);
    }

    /* Stem */
    const stem = this.add.line(0, 0, 0, 10, 0, 40, 0x228b22);
    stem.setLineWidth(3);
    container.add(stem);

    /* Center */
    const center = this.add.circle(0, 0, 8, 0xffff00);
    container.add(center);

    /* Text */
    const fontSize = displayText.length > 8 ? "10px" : displayText.length > 5 ? "12px" : "14px";
    const txt = this.add.text(0, 12, displayText, {
      fontFamily: "Courier New, monospace",
      fontSize,
      color: "#000000",
      fontStyle: "bold",
      wordWrap: { width: 35 },
      align: "center",
    }).setOrigin(0.5);
    container.add(txt);

    /* Glow for valid strings */
    if (isValid) {
      const glow = this.add.circle(0, 0, 28, 0x00ff00, 0.15);
      container.add(glow);
      this.tweens.add({
        targets: glow,
        scale: { from: 1, to: 1.2 },
        alpha: { from: 0.2, to: 0.05 },
        duration: 1000,
        yoyo: true,
        repeat: -1,
      });
    }

    /* Physics */
    this.physics.add.existing(container);
    container.body.setAllowGravity(false);
    container.body.setVelocity(0, fallSpeed);

    container.setData("isValid", isValid);
    container.setData("value", value);
    container.setData("displayText", displayText);
    container.setData("category", category);
    container.setData("invalidType", invalidType);
    container.active = true;

    /* Scale-in */
    container.setScale(0);
    this.tweens.add({
      targets: container,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: "Back.out",
    });

    /* Gentle sway */
    this.tweens.add({
      targets: container,
      angle: { from: -5, to: 5 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    /* Overlap with player */
    this.physics.add.overlap(this.player, container, () => {
      this._onCollectFlower(container);
    }, null, this);

    this.flowers.push(container);
  }

  /* ═══════════════════════════════════════════════════════════════
   *  FLOWER COLLECTION
   * ═══════════════════════════════════════════════════════════════ */
  _onCollectFlower(container) {
    if (this.isComplete || !container.active) return;
    container.active = false;

    const isValid = container.getData("isValid");
    const value = container.getData("value");
    const displayText = container.getData("displayText");
    const category = container.getData("category");
    const invalidType = container.getData("invalidType");

    this.tweens.killTweensOf(container);

    if (isValid) {
      this._onCorrectCollect(container.x, container.y, value, displayText, category);
    } else {
      this._onWrongCollect(container.x, container.y, value, displayText, invalidType);
    }

    container.destroy();
  }

  _onCorrectCollect(cx, cy, value, displayText, category) {
    this.stringsCollected++;
    this.totalAttempts++;
    this.combo++;
    this.score += 20;

    if (category) {
      this.categoryCount[category] = (this.categoryCount[category] || 0) + 1;
    }

    GameManager.addXP(20 * GameManager.getComboMultiplier());
    GameManager.addScore(20);
    GameManager.addCombo();

    this.oxygen = Math.min(OXYGEN_MAX, this.oxygen + OXYGEN_REWARD);

    /* Particle burst */
    this.collectParticles.emitParticleAt(cx, cy, 20);

    /* Ripple effect */
    this._createRippleEffect(cx, cy, 0x00ff88, 0.4);

    this._showPopup(cx, cy - 20, "+20", "#00ff88");
    this._showTooltip(getStringTip(displayText, category), "#ff69b4");

    if (this.combo >= 5) {
      this.cameras.main.flash(150, 100, 0, 255);
    }

    this.basketCount.setText(String(this.stringsCollected));
    this._updateHUD();
    this._updateCategoryTracker();

    if (this.stringsCollected >= TARGET_COLLECT) {
      this._checkLevelEnd();
    }
  }

  _onWrongCollect(cx, cy, value, displayText, invalidType) {
    this.totalAttempts++;
    this.wrongAttempts++;
    this.combo = 0;
    this.score = Math.max(0, this.score - 10);

    GameManager.resetCombo();

    this.oxygen = Math.max(0, this.oxygen - OXYGEN_PENALTY);

    /* Knockback */
    const angle = Phaser.Math.Angle.Between(cx, cy, this.player.x, this.player.y);
    this.player.body.setVelocity(
      Math.cos(angle) * 200,
      Math.sin(angle) * 200
    );

    this.alertParticles.emitParticleAt(cx, cy, 15);
    this.cameras.main.shake(150, 0.008);
    this.cameras.main.flash(150, 255, 50, 0);

    this._showPopup(cx, cy - 20, "-10", "#ff4444");
    this._showTooltip(getInvalidTip(displayText, invalidType), "#ff4444");

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
      scaleX: 2.5,
      scaleY: 2.5,
      duration: 500,
      ease: "Cubic.out",
      onUpdate: (tween) => {
        const progress = tween.progress;
        ripple.setStrokeStyle(2, color, startAlpha * (1 - progress));
      },
      onComplete: () => ripple.destroy(),
    });
  }

  /* ═══════════════════════════════════════════════════════════════
   *  HUD UPDATES
   * ═══════════════════════════════════════════════════════════════ */
  _updateHUD() {
    if (this.scoreText && this.scoreText.active) {
      this.scoreText.setText(`STRINGS: ${this.stringsCollected} / ${TARGET_COLLECT}`);
      this.tweens.add({
        targets: this.scoreText,
        scaleX: 1.15, scaleY: 1.15,
        yoyo: true,
        duration: 100,
      });
    }

    if (this.progressBarFill && this.progressText) {
      const pct = Math.min(this.stringsCollected / TARGET_COLLECT, 1);
      this.tweens.add({
        targets: this.progressBarFill,
        width: 260 * pct,
        duration: 300,
        ease: "Cubic.out",
      });
      this.progressText.setText(`${this.stringsCollected} / ${TARGET_COLLECT}`);
    }

    if (this.oxygenBarFill && this.oxygenText) {
      const pct = this.oxygen / OXYGEN_MAX;
      this.tweens.add({
        targets: this.oxygenBarFill,
        width: 100 * pct,
        duration: 200,
      });
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
        this.tweens.add({
          targets: this.comboText,
          scaleX: 1.2, scaleY: 1.2,
          yoyo: true,
          duration: 120,
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
      fontSize: "20px",
      color,
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(150);

    this.tweens.add({
      targets: popup,
      y: y - 50,
      alpha: 0,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 700,
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

  _levelComplete(accuracy) {
    this.isComplete = true;
    if (this.spawnTimer) this.spawnTimer.destroy();

    this.flowers.forEach(f => {
      if (f && f.active) {
        this.tweens.killTweensOf(f);
        f.destroy();
      }
    });

    const passed = accuracy >= ACCURACY_THRESHOLD;
    const elapsed = Math.round((this.time.now - this.startTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    const timeStr = `${mins}:${secs.toString().padStart(2, "0")}`;

    if (passed) {
      GameManager.completeLevel(9, accuracy);
      BadgeSystem.unlock("garden_keeper");
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

    this.time.delayedCall(passed ? 500 : 200, () => {
      this._showEndScreen(passed, accuracy, timeStr);
    });
  }

  _showEndScreen(passed, accuracy, timeStr) {
    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.88).setDepth(200);

    const panelG = this.add.graphics().setDepth(201);
    const panelColor = passed ? 0x0d3d0d : 0x4a1e1e;
    const borderColor = passed ? 0xff69b4 : 0xe74c3c;
    panelG.fillStyle(panelColor, 0.95);
    panelG.fillRoundedRect(W / 2 - 280, 30, 560, 510, 16);
    panelG.lineStyle(3, borderColor);
    panelG.strokeRoundedRect(W / 2 - 280, 30, 560, 510, 16);

    const titleText = passed ? "🌸 GARDEN HARVEST COMPLETE!" : (!accuracy >= ACCURACY_THRESHOLD ? "❌ ACCURACY TOO LOW" : "❌ OUT OF TIME");
    const titleColor = passed ? "#ff69b4" : "#e74c3c";

    this.add.text(W / 2, 60, titleText, {
      fontFamily: "Arial Black, Arial, sans-serif",
      fontSize: "26px",
      color: titleColor,
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(202);

    const stats = [
      `Strings Collected: ${this.stringsCollected} / ${TARGET_COLLECT}`,
      `Accuracy: ${accuracy}%`,
      `Score: ${this.score}`,
      `Time: ${timeStr}`,
      `Wrong Catches: ${this.wrongAttempts}`,
    ];

    let sy = 105;
    stats.forEach((s, i) => {
      this.add.text(W / 2, sy + i * 24, s, {
        fontFamily: "Arial",
        fontSize: "15px",
        color: "#ecf0f1",
      }).setOrigin(0.5).setDepth(202);
    });

    sy += stats.length * 24 + 15;
    this.add.text(W / 2, sy, "String Categories Found:", {
      fontFamily: "Arial",
      fontSize: "13px",
      color: "#ff69b4",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(202);

    STRING_CATEGORIES.forEach((cat, i) => {
      const count = this.categoryCount[cat.label] || 0;
      const colorHex = Phaser.Display.Color.IntegerToColor(cat.color).rgba;
      this.add.text(W / 2, sy + 20 + i * 18, `${cat.emoji} ${cat.label}: ${count}`, {
        fontFamily: "Arial",
        fontSize: "12px",
        color: colorHex,
      }).setOrigin(0.5).setDepth(202);
    });

    sy += STRING_CATEGORIES.length * 18 + 25;

    if (passed) {
      this.add.text(W / 2, sy, "🌸 Badge Unlocked: Garden Keeper!", {
        fontFamily: "Arial",
        fontSize: "15px",
        color: "#f1c40f",
        fontStyle: "bold",
      }).setOrigin(0.5).setDepth(202);

      sy += 30;
      this.add.text(W / 2, sy,
        "✅ You learned:\n• Strings use DOUBLE quotes: \"X\"\n• Different from chars: 'X'\n• Can be empty: \"\"\n• Can contain anything: \"123!\"",
        {
          fontFamily: "Arial",
          fontSize: "12px",
          color: "#bdc3c7",
          align: "center",
          lineSpacing: 4,
        }
      ).setOrigin(0.5).setDepth(202);
    }

    const btnY = 460;
    if (passed) {
      this._createEndButton(W / 2 - 130, btnY, "NEXT LEVEL →", 0x228b22, () => {
        this.scene.stop("UIScene");
        this.scene.start("MenuScene");
      });
      this._createEndButton(W / 2 + 130, btnY, "REPLAY", 0x1a3a1a, () => {
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

    this.flowers.forEach(f => {
      if (f && f.active) {
        this.tweens.killTweensOf(f);
        f.destroy();
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

      this.add.text(W / 2, H / 2 - 100, "🌿 GARDEN FADED", {
        fontFamily: "Arial Black, Arial, sans-serif",
        fontSize: "28px",
        color: "#e74c3c",
        fontStyle: "bold",
      }).setOrigin(0.5).setDepth(202);

      this.add.text(W / 2, H / 2 - 40, `You collected ${this.stringsCollected} / ${TARGET_COLLECT} strings`, {
        fontFamily: "Arial",
        fontSize: "18px",
        color: "#ecf0f1",
      }).setOrigin(0.5).setDepth(202);

      this.add.text(W / 2, H / 2 + 10, "Your oxygen ran out!", {
        fontFamily: "Arial",
        fontSize: "14px",
        color: "#e74c3c",
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
    if (!this.gameStarted || this.isComplete) return;

    const dt = delta / 1000;

    /* Player movement */
    const speed = PLAYER_SPEED;
    let vx = 0, vy = 0;

    const left = this.cursors.left.isDown || this.wasd.left.isDown;
    const right = this.cursors.right.isDown || this.wasd.right.isDown;
    const up = this.cursors.up.isDown || this.wasd.up.isDown;
    const down = this.cursors.down.isDown || this.wasd.down.isDown;

    if (left) vx = -speed;
    else if (right) vx = speed;
    if (up) vy = -speed;
    else if (down) vy = speed;

    if (vx !== 0 && vy !== 0) {
      vx *= 0.707;
      vy *= 0.707;
    }

    this.player.setVelocity(vx, vy);

    /* Oxygen decay */
    this.oxygen = Math.max(0, this.oxygen - OXYGEN_DECAY_PER_SEC * dt);
    this._updateOxygenBar();

    if (this.oxygen <= 0) {
      this._gameOver();
      return;
    }

    /* Flower cleanup and physics */
    this.flowers.forEach(f => {
      if (f && f.active) {
        if (f.y > H + 50) {
          this.tweens.killTweensOf(f);
          f.destroy();
          f.active = false;
        }
      }
    });
  }

  _updateOxygenBar() {
    if (!this.oxygenBarFill || !this.oxygenText) return;
    const pct = this.oxygen / OXYGEN_MAX;
    this.oxygenBarFill.width = 100 * pct;
    this.oxygenText.setText(`${Math.round(this.oxygen)}%`);

    let oxyColor;
    if (pct > 0.5) oxyColor = 0x2ecc71;
    else if (pct > 0.25) oxyColor = 0xf1c40f;
    else oxyColor = 0xe74c3c;
    this.oxygenBarFill.setFillStyle(oxyColor);
  }

  /* ═══════════════════════════════════════════════════════════════
   *  SHUTDOWN
   * ═══════════════════════════════════════════════════════════════ */
  shutdown() {
    if (this.spawnTimer) this.spawnTimer.destroy();
    this.flowers = [];
  }
}
