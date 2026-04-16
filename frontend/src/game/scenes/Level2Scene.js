/**
 * Level2Scene — "Cyber Variable Arena" (Tuning Phase)
 * =====================================================
 * Learning: Reinforce the exact definition of the `int` data type
 *           by distinguishing it from floats/doubles/strings.
 *
 * Mechanic: Data Validation Combat System
 *   - Player = "The Compiler" (left)
 *   - Enemies = "Data Packets" showing values (right)
 *   - Two actions: 📥 ASSIGN (it's a valid int) or 🚫 REJECT (it's not)
 *   - Code panel shows real-time `int memorySlot = …;`
 *   - 15 enemies, combo system, time bonus, power-ups
 *
 * Schema Theory: Tuning — refining the learner's int schema
 */

import Phaser from "phaser";
import { GameManager } from "../GameManager.js";
import { BadgeSystem } from "../BadgeSystem.js";
import { ProgressTracker } from "../ProgressTracker.js";

/* ───────── Constants ───────── */
const W = 800;
const H = 600;
const TOTAL_ENEMIES = 15;
const PLAYER_MAX_HP = 500;
const ENEMY_BASE_SPEED = 1800; // ms for approach tween (gets faster)
const DMG_ON_WRONG = 50;

/* Values pool — each has a raw value, display string, and whether it's a valid int */
const DATA_VALUES = [
  // ── Valid ints ──
  { display: "7",    isInt: true,  raw: 7 },
  { display: "-15",  isInt: true,  raw: -15 },
  { display: "0",    isInt: true,  raw: 0 },
  { display: "42",   isInt: true,  raw: 42 },
  { display: "-3",   isInt: true,  raw: -3 },
  { display: "100",  isInt: true,  raw: 100 },
  { display: "-1",   isInt: true,  raw: -1 },
  { display: "25",   isInt: true,  raw: 25 },
  { display: "-50",  isInt: true,  raw: -50 },
  { display: "1",    isInt: true,  raw: 1 },
  // ── Invalid: decimals / doubles ──
  { display: "3.14",   isInt: false, raw: 3.14,    reason: "double" },
  { display: "-0.5",   isInt: false, raw: -0.5,    reason: "double" },
  { display: "9.99",   isInt: false, raw: 9.99,    reason: "double" },
  { display: "0.001",  isInt: false, raw: 0.001,   reason: "double" },
  { display: "2.718",  isInt: false, raw: 2.718,   reason: "double" },
  { display: "-7.5",   isInt: false, raw: -7.5,    reason: "double" },
  { display: "1.0",    isInt: false, raw: 1.0,     reason: "double" },
  // ── Invalid: strings ──
  { display: '"Hello"',   isInt: false, raw: "Hello",   reason: "String" },
  { display: '"true"',    isInt: false, raw: "true",    reason: "String" },
  { display: '"int"',     isInt: false, raw: "int",     reason: "String" },
  { display: '"3"',       isInt: false, raw: "3",       reason: "String" },
  { display: '"null"',    isInt: false, raw: "null",    reason: "String" },
];

/* ───────── Helpers ───────── */
function lerpColor(a, b, t) {
  const ar = (a >> 16) & 0xff, ag = (a >> 8) & 0xff, ab = a & 0xff;
  const br = (b >> 16) & 0xff, bg = (b >> 8) & 0xff, bb = b & 0xff;
  return (
    (Math.round(ar + (br - ar) * t) << 16) |
    (Math.round(ag + (bg - ag) * t) << 8) |
    Math.round(ab + (bb - ab) * t)
  );
}

function buildEnemyQueue() {
  /* Roughly 55% ints, 45% non-ints, shuffled */
  const ints = DATA_VALUES.filter(v => v.isInt);
  const nonInts = DATA_VALUES.filter(v => !v.isInt);
  const queue = [];
  for (let i = 0; i < TOTAL_ENEMIES; i++) {
    if (Math.random() < 0.55) {
      queue.push(Phaser.Utils.Array.GetRandom(ints));
    } else {
      queue.push(Phaser.Utils.Array.GetRandom(nonInts));
    }
  }
  return queue;
}

export class Level2Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level2Scene" });
  }

  /* ═══════════════════════════════════════════
   *  CREATE
   * ═══════════════════════════════════════════ */
  create() {
    this.cameras.main.setBackgroundColor("#060b18");

    /* ── State ── */
    this.playerHP = PLAYER_MAX_HP;
    this.currentIndex = 0;
    this.combo = 0;
    this.score = 0;
    this.correctCount = 0;
    this.isComplete = false;
    this.roundActive = false;
    this.roundStartTime = 0;
    this.enemyQueue = buildEnemyQueue();
    this.roundElements = [];

    /* Power-ups */
    this.powerAutoShield = 1;   // converts next 3 decimals → ints
    this.autoShieldLeft = 0;
    this.powerTimeFreeze = 1;
    this.enemySpeedMult = 1;    // 1 = normal, 0.3 = slowed

    /* ── Generate textures ── */
    this._genTex();

    /* ── Draw arena ── */
    this._drawArena();

    /* ── Particles ── */
    this._createParticles();

    /* ── Player sprite ── */
    this._drawPlayer();

    /* ── HUD ── */
    this._createHUD();

    /* ── Code panel ── */
    this._createCodePanel();

    /* ── UIScene label ── */
    const uiScene = this.scene.get("UIScene");
    if (uiScene && uiScene.setLevelLabel) {
      uiScene.setLevelLabel("Level 2: Tuning — Cyber Variable Arena!");
    }

    /* ── Instruction overlay ── */
    this._showInstruction();
  }

  /* ═══════════════════════════════════════════
   *  TEXTURES
   * ═══════════════════════════════════════════ */
  _genTex() {
    const make = (key, color) => {
      if (this.textures.exists(key)) return;
      const g = this.add.graphics();
      g.fillStyle(color, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture(key, 8, 8);
      g.destroy();
    };
    make("greenSp2", 0x4ade80);
    make("redSp2", 0xef4444);
    make("cyanSp", 0x22d3ee);
    make("purpleSp", 0xa78bfa);
    make("orangeSp", 0xfbbf24);
  }

  _createParticles() {
    this.beamParticles = this.add.particles(0, 0, "cyanSp", {
      speed: { min: 60, max: 200 }, scale: { start: 1.2, end: 0 },
      lifespan: 500, blendMode: "ADD", emitting: false,
    }).setDepth(80);

    this.shieldParticles = this.add.particles(0, 0, "purpleSp", {
      speed: { min: 40, max: 160 }, scale: { start: 1, end: 0 },
      lifespan: 600, blendMode: "ADD", emitting: false,
    }).setDepth(80);

    this.hitParticles = this.add.particles(0, 0, "orangeSp", {
      speed: { min: 100, max: 300 }, scale: { start: 1.5, end: 0 },
      lifespan: 650, blendMode: "ADD", emitting: false,
    }).setDepth(80);

    this.glitchParticles = this.add.particles(0, 0, "redSp2", {
      speed: { min: 80, max: 250 }, scale: { start: 1.3, end: 0 },
      lifespan: 550, blendMode: "ADD", emitting: false,
    }).setDepth(80);
  }

  /* ═══════════════════════════════════════════
   *  ARENA BACKGROUND
   * ═══════════════════════════════════════════ */
  _drawArena() {
    const gfx = this.add.graphics().setDepth(0);

    // Gradient
    for (let i = 0; i < 50; i++) {
      const t = i / 50;
      gfx.fillStyle(lerpColor(0x060b18, 0x0d1530), t);
      gfx.fillRect(0, Math.floor((H * i) / 50), W, Math.ceil(H / 50) + 1);
    }

    // Vertical data streams
    for (let x = 40; x < W; x += 60) {
      const alpha = Phaser.Math.FloatBetween(0.04, 0.12);
      gfx.lineStyle(1, 0x22d3ee, alpha);
      gfx.beginPath();
      gfx.moveTo(x, 0);
      gfx.lineTo(x, H);
      gfx.strokePath();
    }
    // Horizontal grid
    for (let y = 40; y < H; y += 60) {
      const alpha = Phaser.Math.FloatBetween(0.03, 0.08);
      gfx.lineStyle(1, 0x22d3ee, alpha);
      gfx.beginPath();
      gfx.moveTo(0, y);
      gfx.lineTo(W, y);
      gfx.strokePath();
    }

    // Glowing floor line
    gfx.lineStyle(2, 0x22d3ee, 0.25);
    gfx.beginPath();
    gfx.moveTo(0, 330);
    gfx.lineTo(W, 330);
    gfx.strokePath();

    // Animated data-stream dots (decorative)
    this.streamDots = [];
    for (let i = 0; i < 25; i++) {
      const dot = this.add.circle(
        Phaser.Math.Between(0, W),
        Phaser.Math.Between(0, H),
        Phaser.Math.FloatBetween(1, 2.5),
        0x22d3ee,
        Phaser.Math.FloatBetween(0.15, 0.5)
      ).setDepth(1);
      this.streamDots.push(dot);
    }
  }

  /* ═══════════════════════════════════════════
   *  PLAYER — "The Compiler"
   * ═══════════════════════════════════════════ */
  _drawPlayer() {
    this.playerGroup = this.add.container(130, 210).setDepth(10);

    // Main body (monitor-shaped)
    const body = this.add.rectangle(0, 0, 70, 80, 0x0e1a36, 1);
    body.setStrokeStyle(2, 0x22d3ee);
    this.playerGroup.add(body);

    // Screen/face
    const screen = this.add.rectangle(0, -6, 54, 44, 0x0a1628, 1);
    screen.setStrokeStyle(1, 0x38bdf8);
    this.playerGroup.add(screen);

    // Screen text
    const scrTxt = this.add.text(0, -8, "int", {
      fontFamily: "Courier New, monospace", fontSize: "18px",
      color: "#22d3ee", fontStyle: "bold",
    }).setOrigin(0.5);
    this.playerGroup.add(scrTxt);

    // Cursor blink
    this.cursorBlink = this.add.rectangle(20, -8, 2, 16, 0x22d3ee);
    this.playerGroup.add(this.cursorBlink);
    this.tweens.add({
      targets: this.cursorBlink, alpha: 0, yoyo: true,
      repeat: -1, duration: 500,
    });

    // Base/stand
    const base1 = this.add.rectangle(0, 50, 30, 16, 0x0e1a36);
    base1.setStrokeStyle(1, 0x22d3ee);
    const base2 = this.add.rectangle(0, 60, 50, 8, 0x0e1a36);
    base2.setStrokeStyle(1, 0x22d3ee);
    this.playerGroup.add(base1);
    this.playerGroup.add(base2);

    // Label
    this.playerGroup.add(
      this.add.text(0, 80, "THE COMPILER", {
        fontFamily: "monospace", fontSize: "9px", color: "#22d3ee", fontStyle: "bold",
      }).setOrigin(0.5)
    );

    // Shield visual (hidden, shown on REJECT)
    this.shieldGfx = this.add.arc(130, 210, 65, 0, 360, false, 0xa78bfa, 0).setDepth(11);
    this.shieldGfx.setStrokeStyle(3, 0xa78bfa);
    this.shieldGfx.setAlpha(0);

    // Idle bob
    this.tweens.add({
      targets: this.playerGroup, y: 213,
      yoyo: true, repeat: -1, duration: 1400, ease: "Sine.inOut",
    });
  }

  /* ═══════════════════════════════════════════
   *  ENEMY — "Data Packet"
   * ═══════════════════════════════════════════ */
  _spawnEnemy(data, index) {
    if (this.enemyContainer) {
      this.tweens.killTweensOf(this.enemyContainer);
      this.enemyContainer.destroy();
    }

    const startX = W + 80;
    this.enemyContainer = this.add.container(startX, 210).setDepth(10);

    // Outer shell
    const borderColor = data.isInt ? 0x4ade80 : 0xef4444;
    const shell = this.add.rectangle(0, 0, 80, 90, 0x1e293b, 0.95);
    shell.setStrokeStyle(2, borderColor);
    this.enemyContainer.add(shell);

    // Antenna
    const ant = this.add.rectangle(0, -56, 4, 16, borderColor);
    this.enemyContainer.add(ant);
    const antDot = this.add.circle(0, -66, 5, borderColor, 0.8);
    this.enemyContainer.add(antDot);
    this.tweens.add({ targets: antDot, alpha: 0.3, yoyo: true, repeat: -1, duration: 400 });

    // Chest display
    const chestBg = this.add.rectangle(0, 0, 66, 40, 0x0a1628);
    chestBg.setStrokeStyle(1, borderColor);
    this.enemyContainer.add(chestBg);

    const fontSize = data.display.length > 5 ? "14px" : "20px";
    const valTxt = this.add.text(0, 0, data.display, {
      fontFamily: "Courier New, monospace", fontSize,
      color: data.isInt ? "#4ade80" : "#f87171", fontStyle: "bold",
    }).setOrigin(0.5);
    this.enemyContainer.add(valTxt);

    // Type indicator
    const typeLabel = data.isInt ? "int?" : (data.reason === "String" ? "String?" : "double?");
    const typeTxt = this.add.text(0, 28, typeLabel, {
      fontFamily: "monospace", fontSize: "9px",
      color: "#94a3b8",
    }).setOrigin(0.5);
    this.enemyContainer.add(typeTxt);

    // Legs / wheels
    const wL = this.add.circle(-20, 55, 8, 0x334155);
    const wR = this.add.circle(20, 55, 8, 0x334155);
    wL.setStrokeStyle(1, borderColor);
    wR.setStrokeStyle(1, borderColor);
    this.enemyContainer.add(wL);
    this.enemyContainer.add(wR);

    // Label
    this.enemyContainer.add(
      this.add.text(0, 76, `DATA #${index}`, {
        fontFamily: "monospace", fontSize: "9px", color: "#64748b", fontStyle: "bold",
      }).setOrigin(0.5)
    );

    // ── Approach tween (enemy moves toward the player) ──
    const speed = Math.max(600, ENEMY_BASE_SPEED - this.currentIndex * 70);
    const actualSpeed = speed / this.enemySpeedMult;
    this.enemyApproachTween = this.tweens.add({
      targets: this.enemyContainer,
      x: 350,
      duration: actualSpeed,
      ease: "Sine.inOut",
      onComplete: () => {
        // enemy bob when it arrives
        this.tweens.add({
          targets: this.enemyContainer, y: 213,
          yoyo: true, repeat: -1, duration: 800, ease: "Sine.inOut",
        });
      },
    });
  }

  /* ═══════════════════════════════════════════
   *  HUD
   * ═══════════════════════════════════════════ */
  _createHUD() {
    const dp = 100;

    // Player HP bar
    this.add.text(16, 68, "COMPILER HP", {
      fontFamily: "monospace", fontSize: "9px", color: "#22d3ee",
    }).setDepth(dp);
    this.playerHPBarBg = this.add.rectangle(16, 82, 200, 14, 0x1e293b)
      .setOrigin(0, 0.5).setStrokeStyle(1, 0x334155).setDepth(dp);
    this.playerHPFill = this.add.rectangle(16, 82, 200, 12, 0x22d3ee)
      .setOrigin(0, 0.5).setDepth(dp + 1);
    this.playerHPText = this.add.text(116, 82, `${PLAYER_MAX_HP}/${PLAYER_MAX_HP}`, {
      fontFamily: "monospace", fontSize: "9px", color: "#fff",
    }).setOrigin(0.5).setDepth(dp + 2);

    // Score
    this.scoreText = this.add.text(W / 2, 68, "Score: 0", {
      fontFamily: "monospace", fontSize: "16px", color: "#fbbf24", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(dp);

    // Combo
    this.comboText = this.add.text(W / 2, 88, "", {
      fontFamily: "monospace", fontSize: "12px", color: "#a78bfa", fontStyle: "bold",
    }).setOrigin(0.5).setAlpha(0).setDepth(dp);

    // Round
    this.roundText = this.add.text(W / 2, 104, "", {
      fontFamily: "monospace", fontSize: "10px", color: "#64748b",
    }).setOrigin(0.5).setDepth(dp);

    // Timer
    this.timerText = this.add.text(W - 16, 105, "", {
      fontFamily: "monospace", fontSize: "11px", color: "#94a3b8",
    }).setOrigin(1, 0).setDepth(dp);

    // Feedback toast
    this.feedbackText = this.add.text(W / 2, 145, "", {
      fontFamily: "Arial, sans-serif", fontSize: "17px",
      color: "#ffffff", fontStyle: "bold", align: "center",
      wordWrap: { width: 700 },
    }).setOrigin(0.5).setAlpha(0).setDepth(dp + 10);
  }

  /* ═══════════════════════════════════════════
   *  CODE SIMULATION PANEL
   * ═══════════════════════════════════════════ */
  _createCodePanel() {
    this.codePanelBg = this.add.rectangle(W / 2, 555, W - 20, 80, 0x0a1628, 0.96)
      .setStrokeStyle(1, 0x1e293b).setDepth(90);

    this.add.text(20, 520, "// Code Execution", {
      fontFamily: "monospace", fontSize: "9px", color: "#475569",
    }).setDepth(91);

    this.codeLine1 = this.add.text(20, 536, "", {
      fontFamily: "Courier New, monospace", fontSize: "13px", color: "#22d3ee",
    }).setDepth(91);
    this.codeLine2 = this.add.text(20, 554, "", {
      fontFamily: "Courier New, monospace", fontSize: "13px", color: "#94a3b8",
    }).setDepth(91);
    this.codeLine3 = this.add.text(20, 572, "", {
      fontFamily: "Courier New, monospace", fontSize: "13px", color: "#4ade80",
    }).setDepth(91);
  }

  /* ═══════════════════════════════════════════
   *  INSTRUCTION OVERLAY
   * ═══════════════════════════════════════════ */
  _showInstruction() {
    const els = [];
    const d = 200;

    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.88).setDepth(d);
    els.push(ov);

    const panelG = this.add.graphics().setDepth(d + 1);
    panelG.fillStyle(0x0d1530, 0.98);
    panelG.fillRoundedRect(W / 2 - 310, 40, 620, 510, 16);
    panelG.lineStyle(3, 0x22d3ee);
    panelG.strokeRoundedRect(W / 2 - 310, 40, 620, 510, 16);
    els.push(panelG);

    const t1 = this.add.text(W / 2, 78, "🛡️ MISSION 2: CYBER VARIABLE ARENA", {
      fontFamily: "Arial Black, Arial", fontSize: "22px",
      color: "#22d3ee", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(d + 2);
    els.push(t1);

    const t2 = this.add.text(W / 2, 105, "Data Validation Combat — Tune Your int Schema", {
      fontFamily: "Arial", fontSize: "14px", color: "#38bdf8", fontStyle: "italic",
    }).setOrigin(0.5).setDepth(d + 2);
    els.push(t2);

    const desc = this.add.text(W / 2, 225,
      "You are THE COMPILER. You control the Integer Memory Core.\n" +
      "Incoming Data Packets approach — decide their type!\n\n" +
      "📥  ASSIGN  →  Value IS a valid integer (e.g. 7, -15, 0)\n" +
      "🚫  REJECT  →  Value is NOT an integer (e.g. 3.14, \"Hello\")\n\n" +
      "✅ Correct ASSIGN of int  →  Allocation Beam destroys enemy!\n" +
      "✅ Correct REJECT of non-int  →  Firewall Shield deflects!\n" +
      "❌ Wrong choice  →  Glitch explosion! You take damage!\n\n" +
      "⚡ 3-streak combo = 2x    ⏱ Answer < 3s = Quick Compile Bonus",
      {
        fontFamily: "Arial", fontSize: "13px",
        color: "#bdc3c7", align: "center", lineSpacing: 6,
      }
    ).setOrigin(0.5).setDepth(d + 2);
    els.push(desc);

    const goal = this.add.text(W / 2, 410,
      "Validate 15 data packets to earn\nthe Data Guardian badge! ⚔️", {
        fontFamily: "Arial", fontSize: "14px",
        color: "#fbbf24", align: "center", fontStyle: "bold", lineSpacing: 6,
      }
    ).setOrigin(0.5).setDepth(d + 2);
    els.push(goal);

    // Start button
    const btnBg = this.add.rectangle(W / 2, 475, 250, 48, 0x0e7490).setDepth(d + 2);
    btnBg.setStrokeStyle(2, 0x22d3ee);
    const btnTxt = this.add.text(W / 2, 475, "INITIALIZE COMPILER", {
      fontFamily: "Arial", fontSize: "18px", color: "#ffffff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(d + 3);
    els.push(btnBg, btnTxt);

    btnBg.setInteractive({ useHandCursor: true });
    btnBg.on("pointerover", () => {
      btnBg.setFillStyle(0x0891b2);
      this.tweens.add({ targets: [btnBg, btnTxt], scaleX: 1.06, scaleY: 1.06, duration: 80 });
    });
    btnBg.on("pointerout", () => {
      btnBg.setFillStyle(0x0e7490);
      this.tweens.add({ targets: [btnBg, btnTxt], scaleX: 1, scaleY: 1, duration: 80 });
    });
    btnBg.on("pointerup", () => {
      els.forEach(e => e.destroy());
      this._startCombat();
    });
  }

  /* ═══════════════════════════════════════════
   *  START COMBAT
   * ═══════════════════════════════════════════ */
  _startCombat() {
    this._nextEnemy();
  }

  /* ═══════════════════════════════════════════
   *  NEXT ENEMY
   * ═══════════════════════════════════════════ */
  _nextEnemy() {
    this.roundElements.forEach(e => { if (e && e.active) e.destroy(); });
    this.roundElements = [];

    if (this.currentIndex >= TOTAL_ENEMIES) {
      this._levelComplete();
      return;
    }

    this.roundActive = false;

    let data = this.enemyQueue[this.currentIndex];

    // Auto-Cast Shield: convert decimal to int automatically
    if (this.autoShieldLeft > 0 && !data.isInt && data.reason === "double") {
      const truncated = Math.trunc(data.raw);
      data = { display: truncated.toString(), isInt: true, raw: truncated };
      this.autoShieldLeft--;
      this._showFeedback(`🛡️ Auto-Cast: ${this.enemyQueue[this.currentIndex].display} → ${truncated} (converted to int)`, "#a78bfa");
    }

    this.currentData = data;
    this.currentIndex++;
    this.roundStartTime = this.time.now;

    this.roundText.setText(`Data Packet ${this.currentIndex} / ${TOTAL_ENEMIES}`);

    // Spawn enemy
    this._spawnEnemy(data, this.currentIndex);

    // Show action buttons once enemy arrives near center
    const arriveDelay = Math.max(300, (ENEMY_BASE_SPEED - this.currentIndex * 70) * 0.6);
    this.time.delayedCall(arriveDelay, () => {
      if (!this.isComplete) {
        this.roundActive = true;
        this._showActionButtons();
      }
    });
  }

  /* ═══════════════════════════════════════════
   *  ACTION BUTTONS — ASSIGN / REJECT
   * ═══════════════════════════════════════════ */
  _showActionButtons() {
    // ── ASSIGN button ──
    const assignBg = this.add.rectangle(W / 2 - 130, 410, 220, 55, 0x0e4429, 1).setDepth(50);
    assignBg.setStrokeStyle(2, 0x4ade80);
    const assignTxt = this.add.text(W / 2 - 130, 400, "📥  ASSIGN", {
      fontFamily: "Courier New, monospace", fontSize: "20px",
      color: "#4ade80", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(51);
    const assignSub = this.add.text(W / 2 - 130, 424, "Valid Integer", {
      fontFamily: "Arial", fontSize: "11px", color: "#86efac",
    }).setOrigin(0.5).setDepth(51);

    assignBg.setInteractive({ useHandCursor: true });
    assignBg.on("pointerover", () => {
      assignBg.setFillStyle(0x166534);
      this.tweens.add({ targets: [assignBg, assignTxt, assignSub], scaleX: 1.05, scaleY: 1.05, duration: 80 });
    });
    assignBg.on("pointerout", () => {
      assignBg.setFillStyle(0x0e4429);
      this.tweens.add({ targets: [assignBg, assignTxt, assignSub], scaleX: 1, scaleY: 1, duration: 80 });
    });
    assignBg.on("pointerup", () => this._handleChoice("ASSIGN"));

    this.roundElements.push(assignBg, assignTxt, assignSub);

    // ── REJECT button ──
    const rejectBg = this.add.rectangle(W / 2 + 130, 410, 220, 55, 0x4a1525, 1).setDepth(50);
    rejectBg.setStrokeStyle(2, 0xef4444);
    const rejectTxt = this.add.text(W / 2 + 130, 400, "🚫  REJECT", {
      fontFamily: "Courier New, monospace", fontSize: "20px",
      color: "#ef4444", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(51);
    const rejectSub = this.add.text(W / 2 + 130, 424, "Type Error", {
      fontFamily: "Arial", fontSize: "11px", color: "#fca5a5",
    }).setOrigin(0.5).setDepth(51);

    rejectBg.setInteractive({ useHandCursor: true });
    rejectBg.on("pointerover", () => {
      rejectBg.setFillStyle(0x7f1d1d);
      this.tweens.add({ targets: [rejectBg, rejectTxt, rejectSub], scaleX: 1.05, scaleY: 1.05, duration: 80 });
    });
    rejectBg.on("pointerout", () => {
      rejectBg.setFillStyle(0x4a1525);
      this.tweens.add({ targets: [rejectBg, rejectTxt, rejectSub], scaleX: 1, scaleY: 1, duration: 80 });
    });
    rejectBg.on("pointerup", () => this._handleChoice("REJECT"));

    this.roundElements.push(rejectBg, rejectTxt, rejectSub);

    // ── Power-up buttons (after 5 enemies) ──
    if (this.currentIndex > 5) {
      this._showPowerUps();
    }

    // Code panel: show pending
    this.codeLine1.setText(`int memorySlot = ${this.currentData.display};`);
    this.codeLine2.setText("// Awaiting compiler decision...");
    this.codeLine3.setText("");
  }

  /* ═══════════════════════════════════════════
   *  HANDLE PLAYER CHOICE
   * ═══════════════════════════════════════════ */
  _handleChoice(choice) {
    if (!this.roundActive || this.isComplete) return;
    this.roundActive = false;

    // Disable buttons
    this.roundElements.forEach(e => {
      if (e && e.active && e.input) e.disableInteractive();
    });

    // Stop enemy approach tween
    if (this.enemyApproachTween) this.enemyApproachTween.stop();

    const data = this.currentData;
    const elapsed = this.time.now - this.roundStartTime;
    const isCorrect =
      (choice === "ASSIGN" && data.isInt) ||
      (choice === "REJECT" && !data.isInt);

    if (isCorrect) {
      this._onCorrect(choice, data, elapsed);
    } else {
      this._onWrong(choice, data);
    }
  }

  /* ═══════════════════════════════════════════
   *  CORRECT
   * ═══════════════════════════════════════════ */
  _onCorrect(choice, data, elapsed) {
    this.correctCount++;
    this.combo++;

    // Combo multiplier
    let comboMult = 1;
    if (this.combo >= 10) comboMult = 5;
    else if (this.combo >= 5) comboMult = 3;
    else if (this.combo >= 3) comboMult = 2;

    // Time bonus
    const timeBonus = elapsed < 3000 ? 20 : 0;

    const baseScore = 100;
    const total = (baseScore + timeBonus) * comboMult;
    this.score += total;
    GameManager.addXP(total);
    GameManager.addScore(total);
    GameManager.addCombo();

    // ── Code panel ──
    if (choice === "ASSIGN") {
      this.codeLine1.setText(`int memorySlot = ${data.display};`);
      this.codeLine2.setColor("#4ade80");
      this.codeLine2.setText(`// SUCCESS: Valid integer assigned. ✓`);
      this.codeLine3.setText(`// memorySlot = ${data.raw}`);
      this.codeLine3.setColor("#4ade80");

      // Allocation Beam
      this._animateAllocationBeam(total, timeBonus, comboMult);
    } else {
      // REJECT of non-int
      const typeStr = data.reason === "String" ? "String" : "double";
      this.codeLine1.setText(`int memorySlot = ${data.display};`);
      this.codeLine2.setColor("#ef4444");
      this.codeLine2.setText(`// TYPE ERROR: Cannot convert from ${typeStr} to int!`);
      this.codeLine3.setColor("#4ade80");
      this.codeLine3.setText(`// REJECTED — Firewall engaged. ✓`);

      // Firewall Shield
      this._animateFirewallShield(total, timeBonus, comboMult);
    }

    this._showFeedback(
      `✓ Correct! +${total} pts` +
      (timeBonus > 0 ? "  ⚡Quick Compile!" : "") +
      (comboMult > 1 ? `  🔥${comboMult}x COMBO` : ""),
      "#4ade80"
    );
    this._updateScore();
    this._updateCombo();

    // Next enemy after animation
    this.time.delayedCall(1200, () => {
      if (!this.isComplete) this._nextEnemy();
    });
  }

  /* ═══════════════════════════════════════════
   *  WRONG
   * ═══════════════════════════════════════════ */
  _onWrong(choice, data) {
    this.combo = 0;
    GameManager.resetCombo();
    this.playerHP = Math.max(0, this.playerHP - DMG_ON_WRONG);
    GameManager.loseLife();

    // ── Code panel ──
    if (choice === "ASSIGN" && !data.isInt) {
      const typeStr = data.reason === "String" ? "String" : "double";
      this.codeLine1.setText(`int memorySlot = ${data.display};`);
      this.codeLine2.setColor("#ef4444");
      this.codeLine2.setText(`// TYPE ERROR: Cannot convert from ${typeStr} to int! ❌`);
      this.codeLine3.setColor("#ef4444");
      this.codeLine3.setText(`// SYSTEM GLITCH — Compiler takes damage!`);
    } else {
      // REJECT of a valid int
      this.codeLine1.setText(`// REJECTED: ${data.display}`);
      this.codeLine2.setColor("#ef4444");
      this.codeLine2.setText(`// ERROR: ${data.display} IS a valid integer!`);
      this.codeLine3.setColor("#ef4444");
      this.codeLine3.setText(`// Rejecting valid data damages the Compiler! ❌`);
    }

    // Glitch explosion on player
    this._animateGlitch();

    this._showFeedback(
      choice === "ASSIGN"
        ? `✗ ${data.display} is NOT an integer! −${DMG_ON_WRONG} HP`
        : `✗ ${data.display} IS a valid integer! −${DMG_ON_WRONG} HP`,
      "#ef4444"
    );
    this._updatePlayerHP();
    this._updateCombo();

    if (this.playerHP <= 0) {
      this.time.delayedCall(800, () => this._gameOver());
      return;
    }

    this.time.delayedCall(1400, () => {
      if (!this.isComplete) this._nextEnemy();
    });
  }

  /* ═══════════════════════════════════════════
   *  ANIMATIONS
   * ═══════════════════════════════════════════ */
  _animateAllocationBeam(total, timeBonus, comboMult) {
    // Cyan laser from player to enemy
    const laser = this.add.rectangle(380, 210, 350, 5, 0x22d3ee, 0.9).setDepth(70);
    laser.setAlpha(0);

    this.tweens.add({
      targets: laser, alpha: 1, duration: 80,
      onComplete: () => {
        // Trail particles along beam
        for (let i = 0; i < 10; i++) {
          this.beamParticles.emitParticleAt(160 + i * 30, 210, 2);
        }

        this.tweens.add({
          targets: laser, alpha: 0, scaleY: 4, duration: 200,
          onComplete: () => laser.destroy(),
        });

        // Hit enemy
        this.hitParticles.emitParticleAt(this.enemyContainer ? this.enemyContainer.x : 500, 210, 30);

        // Explode enemy
        if (this.enemyContainer) {
          this.tweens.add({
            targets: this.enemyContainer,
            scaleX: 1.4, scaleY: 1.4, alpha: 0, angle: 12, duration: 400,
            onComplete: () => {
              if (this.enemyContainer) this.enemyContainer.destroy();
            },
          });
        }

        // "DEFEATED" popup
        const dt = this.add.text(500, 180, "💥 ALLOCATED!", {
          fontFamily: "Arial Black, Arial", fontSize: "20px",
          color: "#22d3ee", fontStyle: "bold",
          stroke: "#000", strokeThickness: 3,
        }).setOrigin(0.5).setDepth(100);
        this.tweens.add({
          targets: dt, y: 140, alpha: 0, scaleX: 1.3, scaleY: 1.3,
          duration: 900, onComplete: () => dt.destroy(),
        });

        this.cameras.main.flash(100, 30, 200, 220);

        // Score popup
        const sp = this.add.text(500, 240, `+${total}`, {
          fontFamily: "Arial", fontSize: "16px", color: "#fbbf24",
          fontStyle: "bold", stroke: "#000", strokeThickness: 2,
        }).setOrigin(0.5).setDepth(100);
        this.tweens.add({ targets: sp, y: 200, alpha: 0, duration: 800, onComplete: () => sp.destroy() });
      },
    });

    if (comboMult >= 3) this.cameras.main.flash(200, 255, 215, 0);
  }

  _animateFirewallShield(total, timeBonus, comboMult) {
    // Shield pulse
    this.shieldGfx.setAlpha(0.7);
    this.tweens.add({
      targets: this.shieldGfx,
      alpha: 0, scaleX: 1.8, scaleY: 1.8,
      duration: 500, ease: "Cubic.out",
      onComplete: () => {
        this.shieldGfx.setScale(1);
      },
    });
    this.shieldParticles.emitParticleAt(130, 210, 25);

    // Enemy bounces off and explodes
    if (this.enemyContainer) {
      this.tweens.add({
        targets: this.enemyContainer,
        x: W + 100, duration: 400, ease: "Cubic.in",
        onComplete: () => {
          this.hitParticles.emitParticleAt(W - 50, 210, 20);
          if (this.enemyContainer) this.enemyContainer.destroy();
        },
      });
    }

    // "REJECTED" popup
    const rt = this.add.text(300, 180, "🛡️ FIREWALL!", {
      fontFamily: "Arial Black, Arial", fontSize: "20px",
      color: "#a78bfa", fontStyle: "bold",
      stroke: "#000", strokeThickness: 3,
    }).setOrigin(0.5).setDepth(100);
    this.tweens.add({
      targets: rt, y: 140, alpha: 0, scaleX: 1.3, scaleY: 1.3,
      duration: 900, onComplete: () => rt.destroy(),
    });

    this.cameras.main.flash(100, 120, 80, 200);

    const sp = this.add.text(300, 240, `+${total}`, {
      fontFamily: "Arial", fontSize: "16px", color: "#fbbf24",
      fontStyle: "bold", stroke: "#000", strokeThickness: 2,
    }).setOrigin(0.5).setDepth(100);
    this.tweens.add({ targets: sp, y: 200, alpha: 0, duration: 800, onComplete: () => sp.destroy() });
  }

  _animateGlitch() {
    this.glitchParticles.emitParticleAt(130, 210, 25);
    this.cameras.main.shake(300, 0.02);
    this.cameras.main.flash(250, 255, 0, 0);

    // Player flicker
    if (this.playerGroup) {
      this.tweens.add({
        targets: this.playerGroup,
        alpha: 0.3, yoyo: true, repeat: 3, duration: 80,
      });
    }

    // Enemy simply fades
    if (this.enemyContainer) {
      this.tweens.add({
        targets: this.enemyContainer,
        alpha: 0, duration: 400,
        onComplete: () => { if (this.enemyContainer) this.enemyContainer.destroy(); },
      });
    }

    // Damage popup
    const dp = this.add.text(130, 150, `−${DMG_ON_WRONG} HP`, {
      fontFamily: "Arial", fontSize: "20px", color: "#ef4444",
      fontStyle: "bold", stroke: "#000", strokeThickness: 3,
    }).setOrigin(0.5).setDepth(100);
    this.tweens.add({ targets: dp, y: 110, alpha: 0, duration: 800, onComplete: () => dp.destroy() });
  }

  /* ═══════════════════════════════════════════
   *  POWER-UPS
   * ═══════════════════════════════════════════ */
  _showPowerUps() {
    const py = 470;
    const powers = [
      {
        emoji: "🛡️", label: "Auto-Cast Shield", uses: this.powerAutoShield,
        action: () => {
          if (this.powerAutoShield <= 0) return;
          this.powerAutoShield--;
          this.autoShieldLeft = 3;
          this._showFeedback("🛡️ Auto-Cast: Next 3 decimals → auto-converted to int!", "#a78bfa");
        },
      },
      {
        emoji: "⏰", label: "Time Freeze", uses: this.powerTimeFreeze,
        action: () => {
          if (this.powerTimeFreeze <= 0) return;
          this.powerTimeFreeze--;
          this.enemySpeedMult = 0.3;
          this._showFeedback("⏰ Time Freeze: Enemies slowed for 10 seconds!", "#22d3ee");
          this.time.delayedCall(10000, () => { this.enemySpeedMult = 1; });
        },
      },
    ];

    powers.forEach((pw, i) => {
      if (pw.uses <= 0) return;
      const bx = W / 2 - 70 + i * 140;
      const bg = this.add.rectangle(bx, py, 120, 30, 0x1e293b, 0.9).setDepth(50);
      bg.setStrokeStyle(1, 0x475569);
      const txt = this.add.text(bx, py, `${pw.emoji} ${pw.label}`, {
        fontFamily: "Arial", fontSize: "9px", color: "#e2e8f0",
      }).setOrigin(0.5).setDepth(51);

      bg.setInteractive({ useHandCursor: true });
      bg.on("pointerover", () => bg.setStrokeStyle(1, 0x22d3ee));
      bg.on("pointerout", () => bg.setStrokeStyle(1, 0x475569));
      bg.on("pointerup", () => { pw.action(); bg.destroy(); txt.destroy(); });

      this.roundElements.push(bg, txt);
    });
  }

  /* ═══════════════════════════════════════════
   *  HUD UPDATES
   * ═══════════════════════════════════════════ */
  _updatePlayerHP() {
    const pct = Math.max(0, this.playerHP / PLAYER_MAX_HP);
    this.tweens.add({ targets: this.playerHPFill, displayWidth: 200 * pct, duration: 300 });
    this.playerHPText.setText(`${this.playerHP}/${PLAYER_MAX_HP}`);
    if (pct > 0.5) this.playerHPFill.setFillStyle(0x22d3ee);
    else if (pct > 0.25) this.playerHPFill.setFillStyle(0xfbbf24);
    else this.playerHPFill.setFillStyle(0xef4444);
  }

  _updateScore() {
    if (!this.scoreText) return;
    this.scoreText.setText(`Score: ${this.score}`);
    this.tweens.add({ targets: this.scoreText, scaleX: 1.12, scaleY: 1.12, yoyo: true, duration: 100 });
  }

  _updateCombo() {
    if (!this.comboText) return;
    if (this.combo >= 2) {
      let m = 1;
      if (this.combo >= 10) m = 5;
      else if (this.combo >= 5) m = 3;
      else if (this.combo >= 3) m = 2;
      this.comboText.setText(`🔥 ${this.combo}x COMBO${m > 1 ? ` (${m}x)` : ""}`);
      this.comboText.setAlpha(1);
      this.tweens.add({ targets: this.comboText, scaleX: 1.12, scaleY: 1.12, yoyo: true, duration: 100 });
    } else {
      this.comboText.setAlpha(0);
    }
  }

  _showFeedback(text, color) {
    if (!this.feedbackText) return;
    this.feedbackText.setText(text);
    this.feedbackText.setColor(color || "#ffffff");
    this.feedbackText.setAlpha(1);
    this.tweens.killTweensOf(this.feedbackText);
    this.tweens.add({ targets: this.feedbackText, alpha: 0, delay: 2200, duration: 500 });
  }

  /* ═══════════════════════════════════════════
   *  UPDATE LOOP
   * ═══════════════════════════════════════════ */
  update() {
    // Timer
    if (this.roundActive && !this.isComplete) {
      const s = ((this.time.now - this.roundStartTime) / 1000).toFixed(1);
      this.timerText.setText(`${s}s`);
      if (s <= 3) this.timerText.setColor("#4ade80");
      else if (s <= 6) this.timerText.setColor("#fbbf24");
      else this.timerText.setColor("#ef4444");
    }

    // Data-stream dots
    if (this.streamDots) {
      this.streamDots.forEach(dot => {
        dot.y += 0.4;
        if (dot.y > H + 5) {
          dot.y = -5;
          dot.x = Phaser.Math.Between(0, W);
        }
      });
    }
  }

  /* ═══════════════════════════════════════════
   *  LEVEL COMPLETE
   * ═══════════════════════════════════════════ */
  _levelComplete() {
    this.isComplete = true;
    const accuracy = Math.round((this.correctCount / TOTAL_ENEMIES) * 100);

    GameManager.completeLevel(1, accuracy);
    BadgeSystem.unlock("math_warrior");
    ProgressTracker.saveProgress(GameManager.getState());

    this.cameras.main.flash(600, 30, 200, 220);
    this.roundElements.forEach(e => { if (e && e.active) e.destroy(); });

    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.88).setDepth(200);

    const pg = this.add.graphics().setDepth(201);
    pg.fillStyle(0x0d1530, 0.96);
    pg.fillRoundedRect(W / 2 - 260, 70, 520, 440, 16);
    pg.lineStyle(3, 0x22d3ee);
    pg.strokeRoundedRect(W / 2 - 260, 70, 520, 440, 16);

    this.add.text(W / 2, 110, "🛡️ LEVEL 2 COMPLETE!", {
      fontFamily: "Arial Black, Arial", fontSize: "26px",
      color: "#22d3ee", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(202);

    this.add.text(W / 2, 145, "All data packets validated!", {
      fontFamily: "Arial", fontSize: "15px", color: "#38bdf8",
    }).setOrigin(0.5).setDepth(202);

    const stats = [
      `Data Packets Validated: ${TOTAL_ENEMIES}`,
      `Correct Decisions: ${this.correctCount} / ${TOTAL_ENEMIES}`,
      `Accuracy: ${accuracy}%`,
      `Final Score: ${this.score}`,
      `Max Combo: ${this.combo}`,
      `Compiler HP Remaining: ${this.playerHP} / ${PLAYER_MAX_HP}`,
    ];
    stats.forEach((s, i) => {
      this.add.text(W / 2, 185 + i * 26, s, {
        fontFamily: "Arial", fontSize: "14px", color: "#e2e8f0",
      }).setOrigin(0.5).setDepth(202);
    });

    this.add.text(W / 2, 365, "⚔️ Badge Unlocked: Data Guardian!", {
      fontFamily: "Arial", fontSize: "15px", color: "#fbbf24", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(202);

    this.add.text(W / 2, 395, "✅ You can now distinguish int from double/String\nCorrect: int x = 7;  Wrong: int x = 3.14;", {
      fontFamily: "Courier New, monospace", fontSize: "12px",
      color: "#94a3b8", align: "center", lineSpacing: 4,
    }).setOrigin(0.5).setDepth(202);

    this._createEndBtn(W / 2 - 100, 455, "NEXT LEVEL →", 0x0e7490, () => {
      this.scene.stop("UIScene");
      this.scene.start("MenuScene");
    });
    this._createEndBtn(W / 2 + 100, 455, "REPLAY", 0x334155, () => {
      GameManager.resetLevel();
      this.scene.restart();
    });
  }

  /* ═══════════════════════════════════════════
   *  GAME OVER
   * ═══════════════════════════════════════════ */
  _gameOver() {
    this.isComplete = true;
    this.roundElements.forEach(e => { if (e && e.active) e.destroy(); });

    this.cameras.main.shake(500, 0.025);
    this.cameras.main.flash(400, 255, 0, 0);

    this.time.delayedCall(600, () => {
      this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.88).setDepth(200);

      this.add.text(W / 2, H / 2 - 80, "💀 SYSTEM CRASH", {
        fontFamily: "Arial Black, Arial", fontSize: "32px",
        color: "#ef4444", fontStyle: "bold",
      }).setOrigin(0.5).setDepth(201);

      this.add.text(W / 2, H / 2 - 30, `Validated ${this.currentIndex - 1} / ${TOTAL_ENEMIES} data packets`, {
        fontFamily: "Arial", fontSize: "17px", color: "#e2e8f0",
      }).setOrigin(0.5).setDepth(201);

      this.add.text(W / 2, H / 2, `Score: ${this.score}`, {
        fontFamily: "Arial", fontSize: "15px", color: "#fbbf24",
      }).setOrigin(0.5).setDepth(201);

      this._createEndBtn(W / 2 - 100, H / 2 + 70, "RECOMPILE", 0xef4444, () => {
        GameManager.resetLevel();
        this.scene.restart();
      });
      this._createEndBtn(W / 2 + 100, H / 2 + 70, "MENU", 0x334155, () => {
        this.scene.stop("UIScene");
        this.scene.start("MenuScene");
      });
    });
  }

  /* ═══════════════════════════════════════════
   *  REUSABLE END BUTTON
   * ═══════════════════════════════════════════ */
  _createEndBtn(x, y, text, color, cb) {
    const bg = this.add.rectangle(x, y, 170, 42, color, 1).setDepth(202);
    bg.setStrokeStyle(2, 0xffffff);
    const txt = this.add.text(x, y, text, {
      fontFamily: "Arial", fontSize: "14px", color: "#fff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(203);

    bg.setInteractive({ useHandCursor: true });
    bg.on("pointerover", () => this.tweens.add({ targets: [bg, txt], scaleX: 1.06, scaleY: 1.06, duration: 80 }));
    bg.on("pointerout", () => this.tweens.add({ targets: [bg, txt], scaleX: 1, scaleY: 1, duration: 80 }));
    bg.on("pointerup", cb);
  }

  /* ═══════════════════════════════════════════
   *  SHUTDOWN
   * ═══════════════════════════════════════════ */
  shutdown() {
    this.roundElements = [];
    if (this.enemyContainer) this.enemyContainer.destroy();
    if (this.enemyApproachTween) this.enemyApproachTween.stop();
    this.streamDots = [];
  }
}
