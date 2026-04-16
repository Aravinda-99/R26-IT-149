/**
 * Level1Scene — "Integer Discovery: Number Line Adventure" (Accretion Phase)
 * ===========================================================================
 * Mechanic: Number Line Adventure
 * - Player character moves along a number line (-10 to +10)
 * - Integers (whole numbers) fall from the top — COLLECT them!
 * - Non-integers (decimals, fractions) also fall — AVOID them!
 * - Collect 20 valid integers with ≥80% accuracy to pass
 *
 * Schema Theory: Accretion — introducing new integer concepts
 * (positive, negative, zero vs. decimals/fractions)
 */

import Phaser from "phaser";
import { GameManager } from "../GameManager.js";
import { BadgeSystem } from "../BadgeSystem.js";
import { ProgressTracker } from "../ProgressTracker.js";

/* ───────── Constants ───────── */
const W = 800;
const H = 600;
const GROUND_Y = 520;
const PLAYER_W = 48;
const PLAYER_H = 64;
const NUM_RADIUS = 26;
const TARGET_COLLECT = 20;
const MAX_LIVES = 3;
const MAX_ON_SCREEN = 5;

const INTEGERS = [
  0, 1, -1, 2, -2, 3, -3, 4, -4, 5, -5,
  6, -6, 7, -7, 8, -8, 9, -9, 10, -10,
];

const NON_INTEGERS = [
  "3.5", "-2.7", "0.5", "-1.2", "4.8", "-6.3",
  "1.1", "-0.9", "2.3", "-4.4", "7.6", "-8.1",
  "1/2", "-3/4", "2/3", "-5/8", "1/3", "-7/4",
  "3/2", "-1/5",
];

/* ───────── Helper — lerp a color ───────── */
function lerpColor(a, b, t) {
  const ar = (a >> 16) & 0xff, ag = (a >> 8) & 0xff, ab = a & 0xff;
  const br = (b >> 16) & 0xff, bg = (b >> 8) & 0xff, bb = b & 0xff;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return (r << 16) | (g << 8) | bl;
}

export class Level1Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level1Scene" });
  }

  /* ═══════════════════════════════════════════════════════════════
   *  CREATE
   * ═══════════════════════════════════════════════════════════════ */
  create() {
    /* ── Reset physics world gravity for this level ── */
    this.physics.world.gravity.y = 0; // we control fall speed manually

    /* ── State ── */
    this.integersCollected = 0;
    this.totalCatches = 0;   // correct + wrong
    this.wrongCatches = 0;
    this.lives = MAX_LIVES;
    this.score = 0;
    this.isComplete = false;
    this.gameStarted = false;
    this.spawnTimer = null;
    this.fallingNumbers = [];
    this.collectedList = [];  // last 5 collected ints
    this.startTime = 0;
    this.combo = 0;

    /* ── Draw background gradient ── */
    this._drawBackground();

    /* ── Generate textures ── */
    this._generateTextures();

    /* ── Particles ── */
    this.greenParticles = this.add.particles(0, 0, "greenSpark", {
      speed: { min: 80, max: 250 },
      scale: { start: 1.2, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 700,
      blendMode: "ADD",
      emitting: false,
    });
    this.redParticles = this.add.particles(0, 0, "redSpark", {
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

    /* ── Number line ── */
    this._drawNumberLine();

    /* ── Player ── */
    this._createPlayer();

    /* ── HUD ── */
    this._createHUD();

    /* ── UIScene label ── */
    const uiScene = this.scene.get("UIScene");
    if (uiScene && uiScene.setLevelLabel) {
      uiScene.setLevelLabel("Level 1: Accretion — Number Line Adventure!");
    }

    /* ── Instruction overlay ── */
    this._showInstruction();
  }

  /* ═══════════════════════════════════════════════════════════════
   *  BACKGROUND
   * ═══════════════════════════════════════════════════════════════ */
  _drawBackground() {
    const gfx = this.add.graphics().setDepth(0);
    const topColor = 0x87ceeb;
    const botColor = 0x4682b4;
    const steps = 60;
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const c = lerpColor(topColor, botColor, t);
      gfx.fillStyle(c, 1);
      gfx.fillRect(0, Math.floor((H * i) / steps), W, Math.ceil(H / steps) + 1);
    }
  }

  /* ═══════════════════════════════════════════════════════════════
   *  TEXTURES (programmatic)
   * ═══════════════════════════════════════════════════════════════ */
  _generateTextures() {
    /* Green spark */
    if (!this.textures.exists("greenSpark")) {
      const g = this.add.graphics();
      g.fillStyle(0x27ae60, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("greenSpark", 8, 8);
      g.destroy();
    }
    /* Red spark */
    if (!this.textures.exists("redSpark")) {
      const g = this.add.graphics();
      g.fillStyle(0xe74c3c, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("redSpark", 8, 8);
      g.destroy();
    }
    /* Confetti spark */
    if (!this.textures.exists("confettiSpark")) {
      const g = this.add.graphics();
      g.fillStyle(0xffd700, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("confettiSpark", 8, 8);
      g.destroy();
    }
    /* Player body */
    if (!this.textures.exists("playerBody")) {
      const g = this.add.graphics();
      // Body
      g.fillStyle(0x3498db, 1);
      g.fillRoundedRect(4, 14, 40, 42, 6);
      // Head
      g.fillStyle(0x5dade2, 1);
      g.fillCircle(24, 12, 12);
      // Eyes
      g.fillStyle(0xffffff, 1);
      g.fillCircle(19, 10, 3);
      g.fillCircle(29, 10, 3);
      g.fillStyle(0x2c3e50, 1);
      g.fillCircle(20, 10, 1.5);
      g.fillCircle(30, 10, 1.5);
      // Legs
      g.fillStyle(0x2980b9, 1);
      g.fillRect(10, 56, 8, 8);
      g.fillRect(30, 56, 8, 8);
      g.generateTexture("playerBody", 48, 64);
      g.destroy();
    }
  }

  /* ═══════════════════════════════════════════════════════════════
   *  NUMBER LINE
   * ═══════════════════════════════════════════════════════════════ */
  _drawNumberLine() {
    const gfx = this.add.graphics().setDepth(1);
    const lineY = GROUND_Y + 20;

    // Main line
    gfx.lineStyle(4, 0x2c3e50, 1);
    gfx.beginPath();
    gfx.moveTo(30, lineY);
    gfx.lineTo(W - 30, lineY);
    gfx.strokePath();

    // Tick marks
    const tickSpacing = (W - 60) / 20; // -10 to +10 = 20 intervals
    for (let i = -10; i <= 10; i++) {
      const tx = 30 + (i + 10) * tickSpacing;
      const tickH = (i % 5 === 0) ? 12 : 6;
      gfx.lineStyle(2, 0x2c3e50, 1);
      gfx.beginPath();
      gfx.moveTo(tx, lineY - tickH);
      gfx.lineTo(tx, lineY + tickH);
      gfx.strokePath();

      // Label major ticks
      if (i % 5 === 0) {
        this.add.text(tx, lineY + 16, i.toString(), {
          fontFamily: "Arial",
          fontSize: "14px",
          color: "#2c3e50",
          fontStyle: "bold",
        }).setOrigin(0.5, 0).setDepth(2);
      }
    }

    // Player glow (follows player)
    this.playerGlow = this.add.circle(W / 2, lineY, 20, 0x3498db, 0.25).setDepth(1);
  }

  /* ═══════════════════════════════════════════════════════════════
   *  PLAYER
   * ═══════════════════════════════════════════════════════════════ */
  _createPlayer() {
    // Create the player sprite from our generated texture
    this.player = this.physics.add.sprite(W / 2, GROUND_Y - PLAYER_H / 2 + 10, "playerBody");
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.1);
    this.player.setGravityY(800); // player-specific gravity
    this.player.body.setSize(PLAYER_W - 8, PLAYER_H - 4);

    // Ground collider (invisible rectangle)
    const ground = this.add.rectangle(W / 2, GROUND_Y + 14, W, 10, 0x2c3e50, 0).setDepth(0);
    this.physics.add.existing(ground, true); // static body
    this.physics.add.collider(this.player, ground);
    this.groundBody = ground;

    // Cursors
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
    });

    // Touch controls
    this.touchLeft = false;
    this.touchRight = false;
    this.touchJump = false;

    this.input.on("pointerdown", (pointer) => {
      if (!this.gameStarted || this.isComplete) return;
      const third = W / 3;
      if (pointer.x < third) this.touchLeft = true;
      else if (pointer.x > third * 2) this.touchRight = true;
      else this.touchJump = true;
    });
    this.input.on("pointerup", () => {
      this.touchLeft = false;
      this.touchRight = false;
      this.touchJump = false;
    });

    // Idle bob tween
    this.idleTween = this.tweens.add({
      targets: this.player,
      y: this.player.y - 3,
      yoyo: true,
      repeat: -1,
      duration: 600,
      ease: "Sine.inOut",
      paused: true,
    });
  }

  /* ═══════════════════════════════════════════════════════════════
   *  HUD
   * ═══════════════════════════════════════════════════════════════ */
  _createHUD() {
    const hudDepth = 100;

    // ── Score (top-left) ──
    this.scoreText = this.add.text(16, 68, "Score: 0", {
      fontFamily: "Arial",
      fontSize: "24px",
      color: "#2c3e50",
      fontStyle: "bold",
      stroke: "#ffffff",
      strokeThickness: 3,
    }).setDepth(hudDepth);

    // ── Progress bar (top center) ──
    this.add.text(W / 2, 68, "Integers Collected", {
      fontFamily: "Arial",
      fontSize: "13px",
      color: "#34495e",
      fontStyle: "bold",
    }).setOrigin(0.5, 0).setDepth(hudDepth);

    this.progressBarBg = this.add.rectangle(W / 2, 92, 280, 18, 0x34495e, 0.3)
      .setStrokeStyle(1, 0x34495e).setDepth(hudDepth);
    this.progressBarFill = this.add.rectangle(
      W / 2 - 140, 92, 0, 16, 0x27ae60
    ).setOrigin(0, 0.5).setDepth(hudDepth + 1);
    this.progressText = this.add.text(W / 2, 92, "0 / 20", {
      fontFamily: "Arial",
      fontSize: "12px",
      color: "#ffffff",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(hudDepth + 2);

    // ── Lives (top-right) ──
    this.livesIcons = [];
    for (let i = 0; i < MAX_LIVES; i++) {
      const heart = this.add.text(W - 30 - i * 35, 72, "❤️", {
        fontSize: "24px",
      }).setOrigin(0.5).setDepth(hudDepth);
      this.livesIcons.push(heart);
    }

    // ── Collected numbers (left sidebar) ──
    this.add.text(16, 110, "Collected:", {
      fontFamily: "Arial",
      fontSize: "11px",
      color: "#34495e",
      fontStyle: "bold",
    }).setDepth(hudDepth);
    this.collectedDisplay = this.add.text(16, 126, "", {
      fontFamily: "Courier New, monospace",
      fontSize: "14px",
      color: "#27ae60",
      fontStyle: "bold",
    }).setDepth(hudDepth);

    // ── Tooltip ──
    this.tooltip = this.add.text(W / 2, H - 50, "", {
      fontFamily: "Arial",
      fontSize: "18px",
      color: "#ffffff",
      backgroundColor: "rgba(44, 62, 80, 0.9)",
      padding: { x: 16, y: 8 },
      align: "center",
      wordWrap: { width: 600 },
    }).setOrigin(0.5).setAlpha(0).setDepth(hudDepth + 10);

    // ── Combo text ──
    this.comboText = this.add.text(W / 2, 46, "", {
      fontFamily: "Arial",
      fontSize: "16px",
      color: "#e67e22",
      fontStyle: "bold",
      stroke: "#ffffff",
      strokeThickness: 2,
    }).setOrigin(0.5).setAlpha(0).setDepth(hudDepth);
  }

  /* ═══════════════════════════════════════════════════════════════
   *  INSTRUCTION OVERLAY
   * ═══════════════════════════════════════════════════════════════ */
  _showInstruction() {
    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.82).setDepth(200);

    const panelG = this.add.graphics().setDepth(201);
    panelG.fillStyle(0x1a2634, 0.98);
    panelG.fillRoundedRect(W / 2 - 320, 60, 640, 460, 16);
    panelG.lineStyle(3, 0x27ae60);
    panelG.strokeRoundedRect(W / 2 - 320, 60, 640, 460, 16);

    const title = this.add.text(W / 2, 100, "🌟 MISSION 1: INTEGER DISCOVERY", {
      fontFamily: "Arial Black, Arial, sans-serif",
      fontSize: "28px",
      color: "#27ae60",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(202);

    const sub = this.add.text(W / 2, 140, "Number Line Adventure", {
      fontFamily: "Arial",
      fontSize: "18px",
      color: "#87ceeb",
      fontStyle: "italic",
    }).setOrigin(0.5).setDepth(202);

    const desc = this.add.text(W / 2, 230,
      "Integers are WHOLE NUMBERS: positive, negative, or zero.\n" +
      "Decimals (3.5) and fractions (1/2) are NOT integers!\n\n" +
      "🟢  CATCH falling integers (green circles)\n" +
      "🔴  AVOID non-integers (red circles)\n\n" +
      "Controls:\n" +
      "← → Arrow Keys or A/D to move\n" +
      "↑ or Space to jump",
      {
        fontFamily: "Arial",
        fontSize: "16px",
        color: "#bdc3c7",
        align: "center",
        lineSpacing: 8,
      }
    ).setOrigin(0.5).setDepth(202);

    const goal = this.add.text(W / 2, 390, "Collect 20 integers with 80%+ accuracy\nto earn the Integer Explorer badge! 🏆", {
      fontFamily: "Arial",
      fontSize: "15px",
      color: "#f1c40f",
      align: "center",
      fontStyle: "bold",
      lineSpacing: 6,
    }).setOrigin(0.5).setDepth(202);

    // Start button
    const btnBg = this.add.rectangle(W / 2, 460, 240, 50, 0x27ae60, 1).setDepth(202);
    btnBg.setStrokeStyle(2, 0x2ecc71);
    const btnTxt = this.add.text(W / 2, 460, "START ADVENTURE", {
      fontFamily: "Arial",
      fontSize: "20px",
      color: "#ffffff",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(203);

    btnBg.setInteractive({ useHandCursor: true });
    btnBg.on("pointerover", () => {
      btnBg.setFillStyle(0x2ecc71);
      this.tweens.add({ targets: [btnBg, btnTxt], scaleX: 1.08, scaleY: 1.08, duration: 120 });
    });
    btnBg.on("pointerout", () => {
      btnBg.setFillStyle(0x27ae60);
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

    // Start spawning
    this._scheduleSpawn();
  }

  /* ═══════════════════════════════════════════════════════════════
   *  SPAWNING
   * ═══════════════════════════════════════════════════════════════ */
  _getSpawnDelay() {
    if (this.integersCollected < 5) return 3000;
    if (this.integersCollected < 10) return 2000;
    if (this.integersCollected < 15) return 1500;
    return 1000;
  }

  _getNonIntegerChance() {
    if (this.integersCollected >= 16) return 0.40;
    return 0.30;
  }

  _scheduleSpawn() {
    if (this.isComplete) return;
    const delay = this._getSpawnDelay();
    this.spawnTimer = this.time.delayedCall(delay, () => {
      this._spawnFallingNumber();
      this._scheduleSpawn();
    });
  }

  _spawnFallingNumber() {
    if (this.isComplete) return;

    // Limit on-screen numbers
    this.fallingNumbers = this.fallingNumbers.filter(n => n.active);
    if (this.fallingNumbers.length >= MAX_ON_SCREEN) return;

    const isInteger = Math.random() > this._getNonIntegerChance();
    let value, displayText;

    if (isInteger) {
      value = Phaser.Utils.Array.GetRandom(INTEGERS);
      displayText = value.toString();
    } else {
      displayText = Phaser.Utils.Array.GetRandom(NON_INTEGERS);
      value = displayText; // string means non-integer
    }

    const x = Phaser.Math.Between(60, W - 60);

    // Container for the falling number
    const container = this.add.container(x, -40).setDepth(50);

    // Background circle
    const bgColor = isInteger ? 0x27ae60 : 0xe74c3c;
    const circle = this.add.circle(0, 0, NUM_RADIUS, bgColor, 0.92);
    circle.setStrokeStyle(2, isInteger ? 0x2ecc71 : 0xc0392b);
    container.add(circle);

    // Number text
    const fontSize = displayText.length > 3 ? "16px" : "20px";
    const txt = this.add.text(0, 0, displayText, {
      fontFamily: "Courier New, monospace",
      fontSize,
      color: "#ffffff",
      fontStyle: "bold",
    }).setOrigin(0.5);
    container.add(txt);

    // Physics
    this.physics.add.existing(container);
    container.body.setCircle(NUM_RADIUS, -NUM_RADIUS, -NUM_RADIUS);
    container.body.setAllowGravity(false);

    // Fall speed (varies with difficulty)
    const baseSpeed = 80 + this.integersCollected * 3;
    const speed = Phaser.Math.Between(baseSpeed, baseSpeed + 40);
    container.body.setVelocityY(speed);

    // Store metadata
    container.setData("isInteger", isInteger);
    container.setData("value", value);
    container.setData("displayText", displayText);
    container.active = true;

    // Rotation tween
    this.tweens.add({
      targets: container,
      angle: 360,
      duration: 2000,
      repeat: -1,
    });

    // Overlap with player
    this.physics.add.overlap(this.player, container, () => {
      this._onCatchNumber(container);
    }, null, this);

    this.fallingNumbers.push(container);
  }

  /* ═══════════════════════════════════════════════════════════════
   *  CATCH / COLLISION
   * ═══════════════════════════════════════════════════════════════ */
  _onCatchNumber(container) {
    if (this.isComplete || !container.active) return;
    container.active = false;

    const isInteger = container.getData("isInteger");
    const value = container.getData("value");
    const displayText = container.getData("displayText");
    const cx = container.x;
    const cy = container.y;

    // Remove the container
    this.tweens.killTweensOf(container);
    container.destroy();

    if (isInteger) {
      /* ── Correct: caught an integer ── */
      this.integersCollected++;
      this.totalCatches++;
      this.combo++;
      this.score += 10;

      GameManager.addXP(10 * GameManager.getComboMultiplier());
      GameManager.addScore(10);
      GameManager.addCombo();

      // Particles
      this.greenParticles.emitParticleAt(cx, cy, 20);

      // Score popup
      this._showPopup(cx, cy - 20, "+10", "#2ecc71");

      // Tooltip
      this._showTooltip(`Perfect! ${displayText} is an integer!`, "#2ecc71");

      // Add to collected list
      this.collectedList.push(displayText);
      if (this.collectedList.length > 5) this.collectedList.shift();
      this._updateCollectedDisplay();

      // Combo flash (5+ streak)
      if (this.combo >= 5) {
        this.cameras.main.flash(200, 255, 215, 0);
      }

      // Update HUD
      this._updateProgress();
      this._updateScore();
      this._updateCombo();

      // Check completion
      if (this.integersCollected >= TARGET_COLLECT) {
        this._checkLevelEnd();
      }
    } else {
      /* ── Wrong: caught a non-integer ── */
      this.totalCatches++;
      this.wrongCatches++;
      this.combo = 0;
      this.score = Math.max(0, this.score - 5);
      this.lives--;

      GameManager.resetCombo();
      GameManager.loseLife();

      // Particles
      this.redParticles.emitParticleAt(cx, cy, 15);

      // Screen shake
      this.cameras.main.shake(200, 0.012);

      // Score popup
      this._showPopup(cx, cy - 20, "-5", "#e74c3c");

      // Tooltip with educational content
      if (displayText.includes("/")) {
        this._showTooltip(`Fractions like ${displayText} are NOT integers!`, "#e74c3c");
      } else {
        this._showTooltip(`Decimals like ${displayText} are NOT integers!`, "#e74c3c");
      }

      // Update HUD
      this._updateLives();
      this._updateScore();
      this._updateCombo();

      // Check game over
      if (this.lives <= 0) {
        this._gameOver();
      }
    }
  }

  /* ═══════════════════════════════════════════════════════════════
   *  HUD UPDATES
   * ═══════════════════════════════════════════════════════════════ */
  _updateScore() {
    if (this.scoreText && this.scoreText.active) {
      this.scoreText.setText(`Score: ${this.score}`);
      // Quick scale-up animation
      this.tweens.add({
        targets: this.scoreText,
        scaleX: 1.15, scaleY: 1.15,
        yoyo: true,
        duration: 100,
      });
    }
  }

  _updateProgress() {
    if (!this.progressBarFill || !this.progressText) return;
    const pct = Math.min(this.integersCollected / TARGET_COLLECT, 1);
    this.tweens.add({
      targets: this.progressBarFill,
      width: 280 * pct,
      duration: 300,
      ease: "Cubic.out",
    });
    this.progressText.setText(`${this.integersCollected} / ${TARGET_COLLECT}`);
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

  _updateCollectedDisplay() {
    if (this.collectedDisplay && this.collectedDisplay.active) {
      const display = this.collectedList.map(n => `[${n}]`).join(" ");
      this.collectedDisplay.setText(display);
    }
  }

  _updateCombo() {
    if (!this.comboText) return;
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

  /* ═══════════════════════════════════════════════════════════════
   *  POPUPS & TOOLTIPS
   * ═══════════════════════════════════════════════════════════════ */
  _showPopup(x, y, text, color) {
    const popup = this.add.text(x, y, text, {
      fontFamily: "Arial",
      fontSize: "22px",
      color,
      fontStyle: "bold",
      stroke: "#ffffff",
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
    const accuracy = this.totalCatches > 0
      ? Math.round(((this.totalCatches - this.wrongCatches) / this.totalCatches) * 100)
      : 100;

    if (accuracy >= 80) {
      this._levelComplete(accuracy);
    } else {
      this._levelComplete(accuracy); // still show, but user can retry
    }
  }

  _levelComplete(accuracy) {
    this.isComplete = true;
    if (this.spawnTimer) this.spawnTimer.destroy();

    // Destroy remaining falling numbers
    this.fallingNumbers.forEach(n => {
      if (n && n.active) {
        this.tweens.killTweensOf(n);
        n.destroy();
      }
    });

    const passed = accuracy >= 80;
    const elapsed = Math.round((this.time.now - this.startTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    const timeStr = `${mins}:${secs.toString().padStart(2, "0")}`;

    if (passed) {
      GameManager.completeLevel(0, accuracy);
      BadgeSystem.unlock("integer_explorer");
      ProgressTracker.saveProgress(GameManager.getState());
      this.cameras.main.flash(600, 100, 255, 100);

      // Confetti
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

    // Show end screen after a short delay
    this.time.delayedCall(passed ? 500 : 200, () => {
      this._showEndScreen(passed, accuracy, timeStr);
    });
  }

  _showEndScreen(passed, accuracy, timeStr) {
    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.88).setDepth(200);

    const panelG = this.add.graphics().setDepth(201);
    const panelColor = passed ? 0x14532d : 0x4a1e1e;
    const borderColor = passed ? 0x27ae60 : 0xe74c3c;
    panelG.fillStyle(panelColor, 0.95);
    panelG.fillRoundedRect(W / 2 - 280, 80, 560, 430, 16);
    panelG.lineStyle(3, borderColor);
    panelG.strokeRoundedRect(W / 2 - 280, 80, 560, 430, 16);

    const titleText = passed ? "🎉 LEVEL 1 COMPLETE!" : "❌ NOT ENOUGH ACCURACY";
    const titleColor = passed ? "#2ecc71" : "#e74c3c";

    this.add.text(W / 2, 120, titleText, {
      fontFamily: "Arial Black, Arial, sans-serif",
      fontSize: "30px",
      color: titleColor,
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(202);

    // Stats
    const statsY = 180;
    const stats = [
      `Integers Collected: ${this.integersCollected} / ${TARGET_COLLECT}`,
      `Accuracy: ${accuracy}%`,
      `Score: ${this.score}`,
      `Time: ${timeStr}`,
      `Wrong Catches: ${this.wrongCatches}`,
    ];

    stats.forEach((s, i) => {
      this.add.text(W / 2, statsY + i * 32, s, {
        fontFamily: "Arial",
        fontSize: "18px",
        color: "#ecf0f1",
      }).setOrigin(0.5).setDepth(202);
    });

    if (passed) {
      // Badge
      this.add.text(W / 2, statsY + stats.length * 32 + 20, "🏆 Badge Unlocked: Integer Explorer!", {
        fontFamily: "Arial",
        fontSize: "17px",
        color: "#f1c40f",
        fontStyle: "bold",
      }).setOrigin(0.5).setDepth(202);

      // Educational summary
      this.add.text(W / 2, statsY + stats.length * 32 + 60, "✅ You learned: Integers are whole numbers\n(positive, negative, and zero)", {
        fontFamily: "Arial",
        fontSize: "14px",
        color: "#bdc3c7",
        align: "center",
        lineSpacing: 6,
      }).setOrigin(0.5).setDepth(202);
    }

    // Buttons
    const btnY = 440;

    if (passed) {
      // Next Level button
      this._createEndButton(W / 2 - 130, btnY, "NEXT LEVEL →", 0x2980b9, () => {
        this.scene.stop("UIScene");
        this.scene.start("MenuScene");
      });
      // Replay
      this._createEndButton(W / 2 + 130, btnY, "REPLAY", 0x27ae60, () => {
        GameManager.resetLevel();
        this.scene.restart();
      });
    } else {
      // Try Again
      this._createEndButton(W / 2 - 100, btnY, "TRY AGAIN", 0xe74c3c, () => {
        GameManager.resetLevel();
        this.scene.restart();
      });
      // Menu
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

    // Destroy remaining
    this.fallingNumbers.forEach(n => {
      if (n && n.active) {
        this.tweens.killTweensOf(n);
        n.destroy();
      }
    });

    this.cameras.main.shake(500, 0.02);
    this.cameras.main.flash(300, 255, 0, 0);

    this.time.delayedCall(600, () => {
      const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.88).setDepth(200);

      this.add.text(W / 2, H / 2 - 80, "💀 GAME OVER", {
        fontFamily: "Arial Black, Arial, sans-serif",
        fontSize: "36px",
        color: "#e74c3c",
        fontStyle: "bold",
      }).setOrigin(0.5).setDepth(201);

      this.add.text(W / 2, H / 2 - 20, `You collected ${this.integersCollected} / ${TARGET_COLLECT} integers`, {
        fontFamily: "Arial",
        fontSize: "20px",
        color: "#ecf0f1",
      }).setOrigin(0.5).setDepth(201);

      this.add.text(W / 2, H / 2 + 20, "You ran out of lives!", {
        fontFamily: "Arial",
        fontSize: "16px",
        color: "#e74c3c",
      }).setOrigin(0.5).setDepth(201);

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
  update() {
    if (!this.gameStarted || this.isComplete) return;

    /* ── Player movement ── */
    const speed = 300;
    const jumpSpeed = -400;

    const left = this.cursors.left.isDown || this.wasd.left.isDown || this.touchLeft;
    const right = this.cursors.right.isDown || this.wasd.right.isDown || this.touchRight;
    const jump = Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
                 Phaser.Input.Keyboard.JustDown(this.wasd.up) ||
                 Phaser.Input.Keyboard.JustDown(this.wasd.space) ||
                 this.touchJump;

    if (left) {
      this.player.setVelocityX(-speed);
      this.player.setFlipX(true);
    } else if (right) {
      this.player.setVelocityX(speed);
      this.player.setFlipX(false);
    } else {
      this.player.setVelocityX(0);
    }

    // Jump — only if on ground
    const onGround = this.player.body.touching.down || this.player.body.blocked.down;
    if (jump && onGround) {
      this.player.setVelocityY(jumpSpeed);
      this.touchJump = false; // consume touch
    }

    // Idle animation
    if (this.idleTween) {
      if (onGround && !left && !right) {
        this.idleTween.resume();
      } else {
        this.idleTween.pause();
      }
    }

    /* ── Player glow follows player ── */
    if (this.playerGlow && this.playerGlow.active) {
      this.playerGlow.setPosition(this.player.x, GROUND_Y + 20);
    }

    /* ── Clean up numbers that fell off screen ── */
    this.fallingNumbers.forEach(n => {
      if (n && n.active && n.y > H + 50) {
        this.tweens.killTweensOf(n);
        n.destroy();
        n.active = false;
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════════
   *  SHUTDOWN
   * ═══════════════════════════════════════════════════════════════ */
  shutdown() {
    if (this.spawnTimer) this.spawnTimer.destroy();
    this.fallingNumbers = [];
  }
}
