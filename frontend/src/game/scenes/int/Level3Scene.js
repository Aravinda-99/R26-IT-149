/**
 * Level3Scene — "Integer Escape Facility" (Restructuring Phase)
 * ==============================================================
 * Perspective: Top-down 2D puzzle room
 * Environment: High-tech facility with 3 locked gates + security terminals
 * Mechanic: Arrow-key robot movement, interact with terminals to solve
 *           int-based logic puzzles. Strictly int-only — no loops/arrays.
 *
 * Terminal 1: Direct Assignment (type a valid integer)
 * Terminal 2: Arithmetic Application (calculate int result)
 * Terminal 3: Validation & Constraint (pick the safe int load)
 *
 * Schema Theory: Restructuring — applying int knowledge in context
 */

import Phaser from "phaser";
import { GameManager } from "../../GameManager.js";
import { BadgeSystem } from "../../BadgeSystem.js";
import { ProgressTracker } from "../../ProgressTracker.js";
import { WellbeingAPI } from "../../../api/api.js";
import { BehavioralRules } from "../../ml/BehavioralRules.js";

/* ───────── Constants ───────── */
const W = 1280;
const H = 720;
const TILE = 40;
const ROBOT_SIZE = 28;
const ROBOT_SPEED = 140;
const MAX_LIVES = 5;

/* Colors */
const COL_FLOOR     = 0x0f172a;
const COL_WALL      = 0x1e293b;
const COL_WALL_LINE = 0x334155;
const COL_GATE_LOCKED   = 0xef4444;
const COL_GATE_OPEN     = 0x4ade80;
const COL_TERMINAL  = 0xfbbf24;
const COL_EXIT      = 0xa78bfa;
const COL_ROBOT     = 0x22d3ee;

/* Gate / Terminal layout (pixel positions) */
const GATES = [
  { x: 500, y: 340, w: 8, h: 80 },   // Gate 1 — left column
  { x: 690, y: 340, w: 8, h: 80 },   // Gate 2 — middle column
  { x: 880, y: 340, w: 8, h: 80 },   // Gate 3 — right column
];

const TERMINALS = [
  { x: 480, y: 450, label: "T1" },    // Terminal 1 — near Gate 1
  { x: 670, y: 450, label: "T2" },    // Terminal 2 — near Gate 2
  { x: 860, y: 450, label: "T3" },    // Terminal 3 — near Gate 3
];

const EXIT_ZONE = { x: 970, y: 360, w: 50, h: 60 };

export class Level3Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level3Scene" });
  }

  init() {
    // Reset local counters
    this.wrongAttempts = 0;

    // Reset Global ML & Intervention States
    if (GameManager.fusionEngine) {
      GameManager.fusionEngine.resetForNewLevel();
    }
    GameManager.interventionInFlight = false;
  }

  /* ═══════════════════════════════════════════════
   *  CREATE
   * ═══════════════════════════════════════════════ */
  create() {
    const cam = this.cameras.main;
    const updateCamera = () => {
      const zoom = Math.min(this.scale.width / W, this.scale.height / H);
      cam.setZoom(zoom);
      cam.centerOn(W / 2, H / 2);
    };
    updateCamera();
    this.scale.on('resize', updateCamera, this);
    this.events.once('shutdown', () => this.scale.off('resize', updateCamera, this));

    cam.setBackgroundColor("#060b18");
    this.physics.world.gravity.y = 0;

    /* ── State ── */
    this.gatesOpen = [false, false, false];
    this.isComplete = false;
    this.overlayActive = false;
    this.score = 0;
    this.wrongAttempts = 0;
    this.lives = MAX_LIVES;
    this.levelStartTime = this.time.now;
    // Tracks the currently-open terminal's Phaser DOM Element GameObject (the
    // <input> wrapper), so submit handlers always read from the live, active
    // node rather than risking a stale document.getElementById() hit against
    // a leftover element from a previous terminal open/close cycle.
    this.currentTerminalDom = null;
    // Tracks the currently-open terminal's background/border/text elements
    // (the local `els` array each _terminalN() builds), so _closeTerminal()
    // can tear the whole overlay down from anywhere — including right before
    // the ML struggle check may trigger the Bit intervention menu.
    this.overlayEls = null;

    /* ── Textures ── */
    this._genTex();

    /* ── Particles ── */
    this._createParticles();

    /* ── Draw facility ── */
    this._drawFacility();

    /* ── Create physics bodies ── */
    this._createPhysicsBodies();

    /* ── Player robot ── */
    this._createRobot();

    /* ── HUD ── */
    this._createHUD();

    /* ── Controls ── */
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
    this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    /* ── UIScene label ── */
    const uiScene = this.scene.get("UIScene");
    if (uiScene && uiScene.setLevelLabel) {
      uiScene.setLevelLabel("Level 3: Restructuring — Integer Escape Facility!");
    }
    if (uiScene && uiScene.setLivesVisible) uiScene.setLivesVisible(false);

    /* ── Instruction overlay ── */
    this._showInstruction();
  }

  /* ═══════════════════════════════════════════════
   *  TEXTURES
   * ═══════════════════════════════════════════════ */
  _genTex() {
    const mk = (key, color) => {
      if (this.textures.exists(key)) return;
      const g = this.add.graphics();
      g.fillStyle(color, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture(key, 8, 8);
      g.destroy();
    };
    mk("purpleSp3", 0xa78bfa);
    mk("greenSp3", 0x4ade80);
    mk("goldSp3", 0xffd700);
    mk("cyanSp3", 0x22d3ee);
  }

  _createParticles() {
    this.successPart = this.add.particles(0, 0, "greenSp3", {
      speed: { min: 80, max: 250 }, scale: { start: 1.3, end: 0 },
      lifespan: 700, blendMode: "ADD", emitting: false,
    }).setDepth(80);
    this.celebPart = this.add.particles(0, 0, "goldSp3", {
      speed: { min: 50, max: 200 }, angle: { min: 220, max: 320 },
      scale: { start: 1.2, end: 0.3 }, lifespan: 2500,
      gravityY: 80, blendMode: "ADD", emitting: false,
    }).setDepth(80);
    this.terminalPart = this.add.particles(0, 0, "cyanSp3", {
      speed: { min: 20, max: 80 }, scale: { start: 0.8, end: 0 },
      lifespan: 400, blendMode: "ADD", emitting: false,
    }).setDepth(80);
  }

  /* ═══════════════════════════════════════════════
   *  DRAW FACILITY
   * ═══════════════════════════════════════════════ */
  _drawFacility() {
    const gfx = this.add.graphics().setDepth(1);

    // Floor (Stretched)
    gfx.fillStyle(COL_FLOOR, 1);
    gfx.fillRect(-W, 160, W * 3, 400);

    // Grid pattern on floor (Stretched)
    gfx.lineStyle(1, 0x1a2744, 0.3);
    for (let x = -W; x <= W * 2; x += TILE) {
      gfx.beginPath();
      gfx.moveTo(x, 160);
      gfx.lineTo(x, 560);
      gfx.strokePath();
    }
    for (let y = 160; y <= 560; y += TILE) {
      gfx.beginPath();
      gfx.moveTo(-W, y);
      gfx.lineTo(W * 2, y);
      gfx.strokePath();
    }

    // Outer walls (Kept at original bounds for gameplay collision constraints)
    gfx.lineStyle(3, COL_WALL_LINE, 1);
    gfx.strokeRect(280, 160, 720, 400);

    // Title banner at top (Stretched)
    gfx.fillStyle(0x0d1530, 0.95);
    gfx.fillRect(-W, 128, W * 3, 32);
    gfx.lineStyle(1, 0x334155);
    gfx.strokeRect(-W, 128, W * 3, 32);

    this.add.text(W / 2, 144, "⚡ INTEGER ESCAPE FACILITY ⚡", {
      fontFamily: "monospace", fontSize: "14px",
      color: "#a78bfa", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(5);

    // ── Draw the 3 gate walls (vertical barriers) ──
    this.gateGraphics = [];
    this.gateLabels = [];
    GATES.forEach((g, i) => {
      // Wall segment above gate
      gfx.fillStyle(COL_WALL, 1);
      gfx.fillRect(g.x - 4, 160, 8, g.y - 160);
      // Wall segment below gate
      gfx.fillRect(g.x - 4, g.y + g.h, 8, 560 - (g.y + g.h));
      gfx.lineStyle(1, COL_WALL_LINE);
      gfx.strokeRect(g.x - 4, 160, 8, g.y - 160);
      gfx.strokeRect(g.x - 4, g.y + g.h, 8, 560 - (g.y + g.h));

      // Gate itself (drawn separately for re-coloring)
      const gateG = this.add.graphics().setDepth(3);
      gateG.fillStyle(COL_GATE_LOCKED, 0.9);
      gateG.fillRect(g.x - 4, g.y, g.w, g.h);
      gateG.lineStyle(2, 0xff6b6b);
      gateG.strokeRect(g.x - 4, g.y, g.w, g.h);
      this.gateGraphics.push(gateG);

      // Gate label
      const lbl = this.add.text(g.x, g.y - 14, `🔒 GATE ${i + 1}`, {
        fontFamily: "monospace", fontSize: "9px", color: "#ef4444", fontStyle: "bold",
      }).setOrigin(0.5).setDepth(5);
      this.gateLabels.push(lbl);
    });

    // ── Draw terminals ──
    this.terminalSprites = [];
    TERMINALS.forEach((t, i) => {
      // Terminal box
      const tg = this.add.rectangle(t.x, t.y, 36, 36, 0x1e293b, 0.95).setDepth(3);
      tg.setStrokeStyle(2, COL_TERMINAL);
      this.terminalSprites.push(tg);

      // Terminal label
      this.add.text(t.x, t.y - 2, "💻", { fontSize: "18px" }).setOrigin(0.5).setDepth(4);
      this.add.text(t.x, t.y + 24, `Terminal ${i + 1}`, {
        fontFamily: "monospace", fontSize: "8px", color: "#fbbf24",
      }).setOrigin(0.5).setDepth(4);

      // Pulse glow
      this.tweens.add({
        targets: tg, alpha: 0.6, yoyo: true, repeat: -1, duration: 800,
        delay: i * 200,
      });
    });

    // ── EXIT zone ──
    this.exitRect = this.add.rectangle(
      EXIT_ZONE.x, EXIT_ZONE.y, EXIT_ZONE.w, EXIT_ZONE.h, COL_EXIT, 0.25
    ).setDepth(2);
    this.exitRect.setStrokeStyle(2, COL_EXIT);
    this.add.text(EXIT_ZONE.x, EXIT_ZONE.y - 6, "EXIT", {
      fontFamily: "monospace", fontSize: "12px", color: "#a78bfa", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(5);
    this.add.text(EXIT_ZONE.x, EXIT_ZONE.y + 10, "→", {
      fontSize: "20px", color: "#a78bfa",
    }).setOrigin(0.5).setDepth(5);

    // ── START label ──
    this.add.text(340, 370, "START\n  ↓", {
      fontFamily: "monospace", fontSize: "10px", color: "#475569",
      align: "center",
    }).setOrigin(0.5).setDepth(5);

    // ── Prompt text ──
    this.promptText = this.add.text(W / 2, 580, "Walk to a 💻 Terminal and press [E] to interact", {
      fontFamily: "Arial", fontSize: "13px", color: "#64748b",
      fontStyle: "italic",
    }).setOrigin(0.5).setDepth(10);
  }

  /* ═══════════════════════════════════════════════
   *  PHYSICS BODIES — walls + gates
   * ═══════════════════════════════════════════════ */
  _createPhysicsBodies() {
    this.wallGroup = this.physics.add.staticGroup();

    // Outer walls (4 sides)
    this._addWall(W / 2, 158, 720, 8);      // top
    this._addWall(W / 2, 562, 720, 8);     // bottom
    this._addWall(278, 360, 8, 404);         // left
    this._addWall(1002, 360, 8, 404);        // right

    // Gate wall segments (vertical barriers)
    this.gateWallBodies = [];
    GATES.forEach((g, i) => {
      // Segment above gate
      const aboveH = g.y - 160;
      if (aboveH > 0) this._addWall(g.x, 160 + aboveH / 2, 8, aboveH);
      // Segment below gate
      const belowY = g.y + g.h;
      const belowH = 560 - belowY;
      if (belowH > 0) this._addWall(g.x, belowY + belowH / 2, 8, belowH);

      // Gate body (removable when opened)
      const gateBody = this.add.rectangle(g.x, g.y + g.h / 2, g.w + 4, g.h, 0x000000, 0)
        .setDepth(0);
      this.physics.add.existing(gateBody, true);
      this.gateWallBodies.push(gateBody);
    });
  }

  _addWall(x, y, w, h) {
    const wall = this.add.rectangle(x, y, w, h, 0x000000, 0);
    this.physics.add.existing(wall, true);
    this.wallGroup.add(wall);
  }

  /* ═══════════════════════════════════════════════
   *  PLAYER ROBOT
   * ═══════════════════════════════════════════════ */
  _createRobot() {
    const startX = 340;
    const startY = 400;

    // Draw a robot texture
    if (!this.textures.exists("robot3")) {
      const g = this.add.graphics();
      // Body
      g.fillStyle(COL_ROBOT, 1);
      g.fillRect(4, 6, 22, 20);
      // Head
      g.fillStyle(0x38bdf8, 1);
      g.fillRect(8, 0, 14, 8);
      // Eye
      g.fillStyle(0xffffff, 1);
      g.fillCircle(15, 3, 2);
      g.fillStyle(0x0f172a, 1);
      g.fillCircle(15, 3, 1);
      // Treads
      g.fillStyle(0x0e7490, 1);
      g.fillRect(2, 26, 8, 4);
      g.fillRect(20, 26, 8, 4);
      g.generateTexture("robot3", 30, 30);
      g.destroy();
    }

    this.robot = this.physics.add.sprite(startX, startY, "robot3").setDepth(20);
    this.robot.setCollideWorldBounds(true);
    this.robot.body.setSize(ROBOT_SIZE, ROBOT_SIZE);

    // Collide with walls
    this.physics.add.collider(this.robot, this.wallGroup);
    // Collide with gate bodies
    this.gateColliders = [];
    this.gateWallBodies.forEach((gb, i) => {
      const col = this.physics.add.collider(this.robot, gb);
      this.gateColliders.push(col);
    });

    // Direction indicator
    this.robotDir = this.add.triangle(startX + 16, startY, 0, 8, 4, 0, 8, 8, COL_ROBOT, 0.7)
      .setDepth(21);
  }

  /* ═══════════════════════════════════════════════
   *  HUD
   * ═══════════════════════════════════════════════ */
  _createHUD() {
    const dp = 100;

    // ── Lives (top-right) ──
    this.livesIcons = [];
    for (let i = 0; i < MAX_LIVES; i++) {
      const heart = this.add.text(W - 40 - i * 35, 78, "❤️", {
        fontSize: "22px",
      }).setOrigin(0.5).setDepth(dp);
      this.livesIcons.push(heart);
    }

    // Gate status indicators
    this.gateStatusTexts = [];
    for (let i = 0; i < 3; i++) {
      const txt = this.add.text(420 + i * 180, 600, `Gate ${i + 1}: 🔒`, {
        fontFamily: "monospace", fontSize: "11px", color: "#ef4444",
      }).setOrigin(0.5).setDepth(dp);
      this.gateStatusTexts.push(txt);
    }

    // Score
    this.scoreText = this.add.text(W - 16, 600, "Score: 0", {
      fontFamily: "monospace", fontSize: "12px", color: "#fbbf24",
    }).setOrigin(1, 0.5).setDepth(dp);

    // Near-terminal prompt
    this.interactPrompt = this.add.text(W / 2, 520, "", {
      fontFamily: "Arial", fontSize: "14px", color: "#fbbf24",
      fontStyle: "bold", backgroundColor: "rgba(15, 23, 42, 0.9)",
      padding: { x: 12, y: 6 },
    }).setOrigin(0.5).setAlpha(0).setDepth(dp);
  }

  /* ═══════════════════════════════════════════════
   *  INSTRUCTION OVERLAY
   * ═══════════════════════════════════════════════ */
  _showInstruction() {
    this.overlayActive = true;
    const els = [];
    const d = 200;

    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.88).setDepth(d);
    els.push(ov);

    const pg = this.add.graphics().setDepth(d + 1);
    pg.fillStyle(0x0d1530, 0.98);
    pg.fillRoundedRect(W / 2 - 300, 70, 600, 490, 16);
    pg.lineStyle(3, 0xa78bfa);
    pg.strokeRoundedRect(W / 2 - 300, 70, 600, 490, 16);
    els.push(pg);

    els.push(this.add.text(W / 2, 105, "🧠 FINAL MISSION: INTEGER ESCAPE", {
      fontFamily: "Arial Black, Arial", fontSize: "22px",
      color: "#a78bfa", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(d + 2));

    els.push(this.add.text(W / 2, 135, "Restructuring Phase — Apply Your int Knowledge", {
      fontFamily: "Arial", fontSize: "13px", color: "#c4b5fd", fontStyle: "italic",
    }).setOrigin(0.5).setDepth(d + 2));

    els.push(this.add.text(W / 2, 260,
      "You are trapped in the Integer Escape Facility!\n" +
      "3 locked gates block your path to the EXIT.\n\n" +
      "🤖 Move your robot with Arrow Keys / WASD\n" +
      "💻 Walk to a Security Terminal, press [E]\n" +
      "🔐 Solve the int-based puzzle to open the gate\n\n" +
      "⚠️ No decimals, no strings — INTEGERS ONLY!",
      {
        fontFamily: "Arial", fontSize: "13px",
        color: "#bdc3c7", align: "center", lineSpacing: 6,
      }
    ).setOrigin(0.5).setDepth(d + 2));

    els.push(this.add.text(W / 2, 440,
      "Open all 3 gates and reach the EXIT\nto earn the Master of Integers badge! 🧠", {
        fontFamily: "Arial", fontSize: "13px",
        color: "#fbbf24", align: "center", fontStyle: "bold", lineSpacing: 5,
      }
    ).setOrigin(0.5).setDepth(d + 2));

    const btnBg = this.add.rectangle(W / 2, 500, 240, 46, 0x7c3aed).setDepth(d + 2);
    btnBg.setStrokeStyle(2, 0xa78bfa);
    const btnTxt = this.add.text(W / 2, 500, "ENTER FACILITY", {
      fontFamily: "Arial", fontSize: "18px", color: "#fff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(d + 3);
    els.push(btnBg, btnTxt);

    btnBg.setInteractive({ useHandCursor: true });
    btnBg.on("pointerover", () => {
      btnBg.setFillStyle(0x6d28d9);
      this.tweens.add({ targets: [btnBg, btnTxt], scaleX: 1.06, scaleY: 1.06, duration: 80 });
    });
    btnBg.on("pointerout", () => {
      btnBg.setFillStyle(0x7c3aed);
      this.tweens.add({ targets: [btnBg, btnTxt], scaleX: 1, scaleY: 1, duration: 80 });
    });
    btnBg.on("pointerup", () => {
      els.forEach(e => e.destroy());
      this.overlayActive = false;
    });
  }

  /* ═══════════════════════════════════════════════
   *  UPDATE — robot movement + terminal detection
   * ═══════════════════════════════════════════════ */
  update() {
    if (this.isComplete || this.overlayActive || GameManager.interventionInFlight) {
      if (this.robot && this.robot.body) {
        this.robot.body.setVelocity(0, 0);
      }
      return;
    }

    /* ── Movement ── */
    const left = this.cursors.left.isDown || this.wasd.left.isDown;
    const right = this.cursors.right.isDown || this.wasd.right.isDown;
    const up = this.cursors.up.isDown || this.wasd.up.isDown;
    const down = this.cursors.down.isDown || this.wasd.down.isDown;

    let vx = 0, vy = 0;
    if (left) vx = -ROBOT_SPEED;
    if (right) vx = ROBOT_SPEED;
    if (up) vy = -ROBOT_SPEED;
    if (down) vy = ROBOT_SPEED;

    this.robot.body.setVelocity(vx, vy);

    // Rotate direction indicator
    if (this.robotDir) {
      this.robotDir.setPosition(this.robot.x, this.robot.y);
      if (vx > 0) this.robotDir.setAngle(90);
      else if (vx < 0) this.robotDir.setAngle(-90);
      else if (vy < 0) this.robotDir.setAngle(0);
      else if (vy > 0) this.robotDir.setAngle(180);
    }

    /* ── Detect proximity to terminals ── */
    let nearTerminal = -1;
    TERMINALS.forEach((t, i) => {
      const dist = Phaser.Math.Distance.Between(this.robot.x, this.robot.y, t.x, t.y);
      if (dist < 45 && !this.gatesOpen[i]) {
        nearTerminal = i;
      }
    });

    if (nearTerminal >= 0) {
      this.interactPrompt.setText(`Press [E] to hack Terminal ${nearTerminal + 1}`);
      this.interactPrompt.setAlpha(1);

      if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
        this.terminalPart.emitParticleAt(TERMINALS[nearTerminal].x, TERMINALS[nearTerminal].y, 10);
        this._openTerminalOverlay(nearTerminal);
      }
    } else {
      this.interactPrompt.setAlpha(0);
    }

    /* ── Check EXIT zone ── */
    if (this.gatesOpen[0] && this.gatesOpen[1] && this.gatesOpen[2]) {
      const dx = Math.abs(this.robot.x - EXIT_ZONE.x);
      const dy = Math.abs(this.robot.y - EXIT_ZONE.y);
      if (dx < EXIT_ZONE.w / 2 + 10 && dy < EXIT_ZONE.h / 2 + 10) {
        this._escape();
      }
    }
  }

  /* ═══════════════════════════════════════════════
   *  TERMINAL OVERLAY — puzzle UI
   * ═══════════════════════════════════════════════ */
  _openTerminalOverlay(index) {
    if (this.overlayActive || this.gatesOpen[index]) return;
    // Defensive: make sure no stale overlay/DOM input survives from a
    // previous terminal session before opening a new one.
    this._closeTerminal();
    this.overlayActive = true;
    this.robot.body.setVelocity(0, 0);

    switch (index) {
      case 0: this._terminal1(); break;
      case 1: this._terminal2(); break;
      case 2: this._terminal3(); break;
    }
  }

  /**
   * Fully tears down whichever terminal overlay is currently open — every
   * Phaser background/border/text element it created (this.overlayEls) AND
   * its DOM <input> (this.currentTerminalDom) — and resets overlayActive.
   * This is the single source of truth for "close the terminal": used by
   * every terminal's Cancel button, the correct-answer path (_gateOpen),
   * the game-over path, AND — critically — forced at the very top of
   * runBehavioralCheck(), so the Bit intervention menu never has to render
   * on top of a still-open terminal.
   */
  _closeTerminal() {
    if (this.overlayEls) {
      this.overlayEls.forEach(e => { if (e) e.destroy(); });
      this.overlayEls = null;
    }
    if (this.currentTerminalDom) {
      this.currentTerminalDom.destroy();
      this.currentTerminalDom = null;
    }
    this.overlayActive = false;
  }

  /* ── Terminal 1: Direct Assignment ── */
  _terminal1() {
    const els = [];
    this.overlayEls = els;
    const d = 200;
    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.85).setDepth(d);
    els.push(ov);

    const pg = this.add.graphics().setDepth(d + 1);
    pg.fillStyle(0x0d1530, 0.97);
    pg.fillRoundedRect(W / 2 - 280, 90, 560, 400, 14);
    pg.lineStyle(2, 0xfbbf24);
    pg.strokeRoundedRect(W / 2 - 280, 90, 560, 400, 14);
    els.push(pg);

    els.push(this.add.text(W / 2, 118, "💻 TERMINAL 1: Direct Assignment", {
      fontFamily: "monospace", fontSize: "16px", color: "#fbbf24", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(d + 2));

    els.push(this.add.text(W / 2, 150, "Access Code Required. Must be a valid Integer.", {
      fontFamily: "Arial", fontSize: "13px", color: "#94a3b8",
    }).setOrigin(0.5).setDepth(d + 2));

    // Code block
    const codeLines1 = [
      "int a = ???;",
      "int b = 10;",
      "System.out.print(a + b); output = 17"
    ];
    codeLines1.forEach((line, i) => {
      const color = line.startsWith("//") ? "#64748b" : "#4ade80";
      els.push(this.add.text(W / 2 - 160, 180 + i * 24, line, {
        fontFamily: "Courier New, monospace", fontSize: "16px", color,
      }).setDepth(d + 2));
    });

    // DOM input field
    const inputEl = this.add.dom(W / 2, 280).createFromHTML(
      `<input type="text" id="t1-input" placeholder="a = ?"
       style="width:220px; padding:10px 16px; font-size:18px; font-family:'Courier New',monospace;
       background:#0a1628; color:#22d3ee; border:2px solid #334155; border-radius:6px;
       text-align:center; outline:none;" />`
    ).setDepth(d + 3);
    this.currentTerminalDom = inputEl;

    // Error text
    const errTxt = this.add.text(W / 2, 320, "", {
      fontFamily: "monospace", fontSize: "13px", color: "#ef4444",
    }).setOrigin(0.5).setDepth(d + 2);
    els.push(errTxt);

    // Submit button
    const btnBg = this.add.rectangle(W / 2, 370, 180, 42, 0x0e7490).setDepth(d + 2);
    btnBg.setStrokeStyle(2, 0x22d3ee);
    const btnTxt = this.add.text(W / 2, 370, "COMPILE", {
      fontFamily: "Arial", fontSize: "16px", color: "#fff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(d + 3);
    els.push(btnBg, btnTxt);

    // Cancel button
    const cancelBg = this.add.rectangle(W / 2, 420, 120, 30, 0x334155).setDepth(d + 2);
    const cancelTxt = this.add.text(W / 2, 420, "Cancel", {
      fontFamily: "Arial", fontSize: "12px", color: "#94a3b8",
    }).setOrigin(0.5).setDepth(d + 3);
    els.push(cancelBg, cancelTxt);

    cancelBg.setInteractive({ useHandCursor: true });
    cancelBg.on("pointerup", () => {
      this._closeTerminal();
    });

    btnBg.setInteractive({ useHandCursor: true });
    btnBg.on("pointerover", () => btnBg.setFillStyle(0x0891b2));
    btnBg.on("pointerout", () => btnBg.setFillStyle(0x0e7490));
    btnBg.on("pointerup", () => {
      const inputField = this.currentTerminalDom?.getChildByID("t1-input");
      if (!inputField) return;
      const val = inputField.value.trim();

      // Validate: must be a valid integer (no decimals, no text)
      if (val !== "7") {
        errTxt.setText('❌ Wrong! a + 10 = 17, so a = 7');
        this.cameras.main.shake(150, 0.01);
        this.wrongAttempts++;
        this.lives = Math.max(0, this.lives - 1);
        this._updateLives();
        if (this.wrongAttempts === 3) this.runBehavioralCheck();
        if (this.lives <= 0) {
           this._closeTerminal();
           this.time.delayedCall(500, () => this._gameOver());
        }
        return;
      }

      this._gateOpen(0, "int a = 7; // 7 + 10 = 17 ✓");
    });

    // Focus the input after a tiny delay
    this.time.delayedCall(100, () => {
      const inp = this.currentTerminalDom?.getChildByID("t1-input");
      if (inp) inp.focus();
    });
  }

  /* ── Terminal 2: Arithmetic Application ── */
  _terminal2() {
    const els = [];
    this.overlayEls = els;
    const d = 200;
    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.85).setDepth(d);
    els.push(ov);

    const pg = this.add.graphics().setDepth(d + 1);
    pg.fillStyle(0x0d1530, 0.97);
    pg.fillRoundedRect(W / 2 - 280, 80, 560, 420, 14);
    pg.lineStyle(2, 0xfbbf24);
    pg.strokeRoundedRect(W / 2 - 280, 80, 560, 420, 14);
    els.push(pg);

    els.push(this.add.text(W / 2, 108, "💻 TERMINAL 2: Arithmetic Application", {
      fontFamily: "monospace", fontSize: "16px", color: "#fbbf24", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(d + 2));

    els.push(this.add.text(W / 2, 135, "Calculate the integer variable.", {
      fontFamily: "Arial", fontSize: "13px", color: "#94a3b8",
    }).setOrigin(0.5).setDepth(d + 2));

    // Code block
    const codeLines = [
      "int x = 4;",
      "int y = ???;",
      "System.out.print(x * y); output = 32"
    ];
    codeLines.forEach((line, i) => {
      const color = line.startsWith("//") ? "#64748b" : "#4ade80";
      els.push(this.add.text(W / 2 - 160, 170 + i * 24, line, {
        fontFamily: "Courier New, monospace", fontSize: "16px", color,
      }).setDepth(d + 2));
    });

    // DOM input
    const inputEl = this.add.dom(W / 2, 290).createFromHTML(
      `<input type="text" id="t2-input" placeholder="y = ?"
       style="width:180px; padding:10px 16px; font-size:18px; font-family:'Courier New',monospace;
       background:#0a1628; color:#22d3ee; border:2px solid #334155; border-radius:6px;
       text-align:center; outline:none;" />`
    ).setDepth(d + 3);
    this.currentTerminalDom = inputEl;

    // Error text
    const errTxt = this.add.text(W / 2, 330, "", {
      fontFamily: "monospace", fontSize: "13px", color: "#ef4444",
    }).setOrigin(0.5).setDepth(d + 2);
    els.push(errTxt);

    // Hint removed to increase difficulty

    // Submit
    const btnBg = this.add.rectangle(W / 2, 395, 180, 42, 0x0e7490).setDepth(d + 2);
    btnBg.setStrokeStyle(2, 0x22d3ee);
    const btnTxt = this.add.text(W / 2, 395, "EXECUTE", {
      fontFamily: "Arial", fontSize: "16px", color: "#fff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(d + 3);
    els.push(btnBg, btnTxt);

    // Cancel
    const cancelBg = this.add.rectangle(W / 2, 445, 120, 30, 0x334155).setDepth(d + 2);
    const cancelTxt = this.add.text(W / 2, 445, "Cancel", {
      fontFamily: "Arial", fontSize: "12px", color: "#94a3b8",
    }).setOrigin(0.5).setDepth(d + 3);
    els.push(cancelBg, cancelTxt);

    cancelBg.setInteractive({ useHandCursor: true });
    cancelBg.on("pointerup", () => {
      this._closeTerminal();
    });

    btnBg.setInteractive({ useHandCursor: true });
    btnBg.on("pointerover", () => btnBg.setFillStyle(0x0891b2));
    btnBg.on("pointerout", () => btnBg.setFillStyle(0x0e7490));
    btnBg.on("pointerup", () => {
      const inp = this.currentTerminalDom?.getChildByID("t2-input");
      if (!inp) return;
      const val = inp.value.trim();

      if (val !== "8") {
        errTxt.setText(`❌ Wrong! 4 * y = 32, so y = 8`);
        this.cameras.main.shake(150, 0.01);
        this.wrongAttempts++;
        this.lives = Math.max(0, this.lives - 1);
        this._updateLives();
        if (this.wrongAttempts === 3) this.runBehavioralCheck();
        if (this.lives <= 0) {
           this._closeTerminal();
           this.time.delayedCall(500, () => this._gameOver());
        }
        return;
      }

      this._gateOpen(1, "int y = 8; // 4 * 8 = 32 ✓");
    });

    this.time.delayedCall(100, () => {
      const inp = this.currentTerminalDom?.getChildByID("t2-input");
      if (inp) inp.focus();
    });
  }

  /* ── Terminal 3: Validation & Constraint ── */
  _terminal3() {
    const els = [];
    this.overlayEls = els;
    const d = 200;
    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.85).setDepth(d);
    els.push(ov);

    const pg = this.add.graphics().setDepth(d + 1);
    pg.fillStyle(0x0d1530, 0.97);
    pg.fillRoundedRect(W / 2 - 280, 70, 560, 440, 14);
    pg.lineStyle(2, 0xfbbf24);
    pg.strokeRoundedRect(W / 2 - 280, 70, 560, 440, 14);
    els.push(pg);

    els.push(this.add.text(W / 2, 98, "💻 TERMINAL 3: Logic & Constraints", {
      fontFamily: "monospace", fontSize: "15px", color: "#fbbf24", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(d + 2));

    els.push(this.add.text(W / 2, 125, "Critical load limits. Prevent overflow!", {
      fontFamily: "Arial", fontSize: "13px", color: "#94a3b8",
    }).setOrigin(0.5).setDepth(d + 2));

    // Code block
    const cLines = [
      "int target = 100;",
      "int score = 85;",
      "int bonus = ???;",
      "score + bonus == target"
    ];
    cLines.forEach((line, i) => {
      const color = line.startsWith("//") ? "#64748b" : (line === "" ? "#000" : "#4ade80");
      els.push(this.add.text(W / 2 - 160, 160 + i * 20, line, {
        fontFamily: "Courier New, monospace", fontSize: "14px", color,
      }).setDepth(d + 2));
    });

    // Options as buttons
    const options = [
      { label: "15.5", value: "15.5", hint: "decimal — not an int!" },
      { label: "25",   value: "25",   hint: "85 + 25 = 110 ≠ 100" },
      { label: "15",   value: "15",   hint: "85 + 15 = 100 ✓" },
    ];

    els.push(this.add.text(W / 2, 325, "Select the correct safeLoad value:", {
      fontFamily: "Arial", fontSize: "12px", color: "#e2e8f0",
    }).setOrigin(0.5).setDepth(d + 2));

    // Error text
    const errTxt = this.add.text(W / 2, 430, "", {
      fontFamily: "monospace", fontSize: "12px", color: "#ef4444",
    }).setOrigin(0.5).setDepth(d + 2);
    els.push(errTxt);

    options.forEach((opt, i) => {
      const bx = W / 2 - 150 + i * 150;
      const bg = this.add.rectangle(bx, 370, 120, 46, 0x1e293b).setDepth(d + 2);
      bg.setStrokeStyle(2, 0x475569);
      const txt = this.add.text(bx, 363, opt.label, {
        fontFamily: "Courier New, monospace", fontSize: "22px",
        color: "#e2e8f0", fontStyle: "bold",
      }).setOrigin(0.5).setDepth(d + 3);
      const sub = this.add.text(bx, 385, `Option ${i + 1}`, {
        fontFamily: "Arial", fontSize: "9px", color: "#64748b",
      }).setOrigin(0.5).setDepth(d + 3);

      bg.setInteractive({ useHandCursor: true });
      bg.on("pointerover", () => {
        bg.setStrokeStyle(2, 0xfbbf24);
        this.tweens.add({ targets: [bg, txt, sub], scaleX: 1.08, scaleY: 1.08, duration: 80 });
      });
      bg.on("pointerout", () => {
        bg.setStrokeStyle(2, 0x475569);
        this.tweens.add({ targets: [bg, txt, sub], scaleX: 1, scaleY: 1, duration: 80 });
      });
      bg.on("pointerup", () => {
        if (opt.value === "15") {
          this._gateOpen(2, "int bonus = 15; // 85 + 15 = 100 ✓");
        } else {
          errTxt.setText(`❌ ${opt.hint}`);
          this.cameras.main.shake(150, 0.01);
          this.wrongAttempts++;
          this.lives = Math.max(0, this.lives - 1);
          this._updateLives();
          if (this.wrongAttempts === 3) this.runBehavioralCheck();
          if (this.lives <= 0) {
             this._closeTerminal();
             this.time.delayedCall(500, () => this._gameOver());
          }
        }
      });

      els.push(bg, txt, sub);
    });

    // Cancel
    const cancelBg = this.add.rectangle(W / 2, 465, 100, 26, 0x334155).setDepth(d + 2);
    const cancelTxt = this.add.text(W / 2, 465, "Cancel", {
      fontFamily: "Arial", fontSize: "11px", color: "#94a3b8",
    }).setOrigin(0.5).setDepth(d + 3);
    els.push(cancelBg, cancelTxt);

    cancelBg.setInteractive({ useHandCursor: true });
    cancelBg.on("pointerup", () => {
      this._closeTerminal();
    });
  }

  /* ═══════════════════════════════════════════════
   *  GATE OPEN
   * ═══════════════════════════════════════════════ */
  _gateOpen(index, codeStr) {
    // Correct-answer path — whichever terminal called this owns the
    // currently-open overlay (background/border/text + DOM input, if any);
    // tear it all down here so nothing lingers for the next interaction.
    this._closeTerminal();
    this.gatesOpen[index] = true;

    // Score
    this.score += 200;
    GameManager.addXP(200);
    GameManager.addScore(200);
    this.scoreText.setText(`Score: ${this.score}`);

    // Visual: open gate
    const gg = this.gateGraphics[index];
    if (gg) {
      gg.clear();
      const g = GATES[index];
      gg.fillStyle(COL_GATE_OPEN, 0.5);
      gg.fillRect(g.x - 4, g.y, g.w, g.h);
      gg.lineStyle(2, 0x86efac);
      gg.strokeRect(g.x - 4, g.y, g.w, g.h);
    }

    // Label
    if (this.gateLabels[index]) {
      this.gateLabels[index].setText(`🔓 GATE ${index + 1}`);
      this.gateLabels[index].setColor("#4ade80");
    }

    // Remove physics collider for that gate
    if (this.gateColliders[index]) {
      this.gateColliders[index].destroy();
    }
    if (this.gateWallBodies[index]) {
      this.gateWallBodies[index].destroy();
    }

    // Terminal visual: dim it
    if (this.terminalSprites[index]) {
      this.terminalSprites[index].setAlpha(0.3);
      this.terminalSprites[index].setStrokeStyle(1, 0x475569);
    }

    // HUD status
    if (this.gateStatusTexts[index]) {
      this.gateStatusTexts[index].setText(`Gate ${index + 1}: 🔓`);
      this.gateStatusTexts[index].setColor("#4ade80");
    }

    // Particles
    this.successPart.emitParticleAt(GATES[index].x, GATES[index].y + 40, 25);
    this.cameras.main.flash(200, 74, 222, 128);

    // Code display toast
    this._showCodeToast(codeStr);

    // Check if all gates open → show EXIT glow
    if (this.gatesOpen[0] && this.gatesOpen[1] && this.gatesOpen[2]) {
      this._highlightExit();
    }
  }

  _updateLives() {
    for (let i = 0; i < MAX_LIVES; i++) {
      if (this.livesIcons[i]) {
        this.livesIcons[i].setText(i < this.lives ? "❤️" : "🖤");
        if (i >= this.lives) {
          this.tweens.add({ targets: this.livesIcons[i], scaleX: 1.3, scaleY: 1.3, yoyo: true, duration: 150 });
        }
      }
    }
  }

  addLife() {
    // BitMenu already calls GameManager.addLife() for the global count before
    // calling this — only touch local state here, or the global count would
    // be incremented twice per bonus life (matches Level1Scene's convention).
    if (this.lives < MAX_LIVES) {
      this.lives++;
      this._updateLives();
    }
  }

  _gameOver() {
    this.isComplete = true;
    this._closeTerminal();
    if (this.robot && this.robot.body) this.robot.body.setVelocity(0, 0);

    this.cameras.main.shake(500, 0.025);
    this.cameras.main.flash(400, 255, 0, 0);

    this.time.delayedCall(600, () => {
      const d = 200;
      this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.88).setDepth(d);

      this.add.text(W / 2, H / 2 - 80, "💀 SYSTEM CRASH", {
        fontFamily: "Arial Black, Arial", fontSize: "32px",
        color: "#ef4444", fontStyle: "bold",
      }).setOrigin(0.5).setDepth(d + 1);

      this.add.text(W / 2, H / 2 - 30, "You ran out of lives!", {
        fontFamily: "Arial", fontSize: "17px", color: "#e2e8f0",
      }).setOrigin(0.5).setDepth(d + 1);

      const btnBg1 = this.add.rectangle(W / 2 - 110, H / 2 + 50, 190, 42, 0xef4444).setDepth(d + 1).setStrokeStyle(2, 0xffffff);
      const txt1 = this.add.text(W / 2 - 110, H / 2 + 50, "REBOOT TERMINALS", { fontFamily: "Arial", fontSize: "14px", color: "#fff", fontStyle: "bold" }).setOrigin(0.5).setDepth(d + 2);
      btnBg1.setInteractive({ useHandCursor: true });
      btnBg1.on("pointerup", () => { GameManager.resetLevel(); this.scene.restart(); });

      const btnBg2 = this.add.rectangle(W / 2 + 110, H / 2 + 50, 190, 42, 0x334155).setDepth(d + 1).setStrokeStyle(2, 0xffffff);
      const txt2 = this.add.text(W / 2 + 110, H / 2 + 50, "MENU", { fontFamily: "Arial", fontSize: "14px", color: "#fff", fontStyle: "bold" }).setOrigin(0.5).setDepth(d + 2);
      btnBg2.setInteractive({ useHandCursor: true });
      btnBg2.on("pointerup", () => { this.scene.stop("UIScene"); this.scene.start("MenuScene"); });
    });
  }

  /** ML struggle check — reports real wrong-attempt/timing stats (not rapid-fire: puzzle level). */
  async runBehavioralCheck() {
    // Force-close any open terminal overlay BEFORE the ML check even starts
    // (synchronous — runs immediately, before the first `await` below), so
    // the Bit intervention menu — which may appear once checkBehavioral()
    // resolves, asynchronously, elsewhere — never has to render on top of a
    // still-open terminal.
    this._closeTerminal();

    const attempts_count = this.wrongAttempts;
    const time_taken_seconds = (this.time.now - this.levelStartTime) / 1000;
    const misconception_repeat_count = this.wrongAttempts;
    const combo_breaks = 0;

    try {
      const { prediction } = await WellbeingAPI.predictStruggle({
        attempts_count, time_taken_seconds, misconception_repeat_count, combo_breaks,
      });
      if (this.isComplete) return;
      const features = { attempts_count, time_taken_seconds, misconception_repeat_count, combo_breaks };
      const effectivePrediction = BehavioralRules.getEffectivePrediction(features, prediction, false);
      GameManager.fusionEngine.checkBehavioral(effectivePrediction);
    } catch (e) {
      console.warn("Level3Scene: /api/wellbeing/predict-struggle unreachable", e);
    }
  }

  _showCodeToast(code) {
    const toast = this.add.text(W / 2, H / 2, code, {
      fontFamily: "Courier New, monospace", fontSize: "15px",
      color: "#4ade80", backgroundColor: "rgba(10, 22, 40, 0.95)",
      padding: { x: 16, y: 10 }, fontStyle: "bold",
    }).setOrigin(0.5).setDepth(150);

    this.tweens.add({
      targets: toast, y: H / 2 - 40, alpha: 0,
      delay: 1500, duration: 800,
      onComplete: () => toast.destroy(),
    });
  }

  _highlightExit() {
    this.exitRect.setFillStyle(COL_EXIT, 0.5);
    this.tweens.add({
      targets: this.exitRect, alpha: 0.4, yoyo: true,
      repeat: -1, duration: 500,
    });

    this.promptText.setText("🏁 All gates open! Head to the EXIT! →");
    this.promptText.setColor("#a78bfa");
    this.promptText.setAlpha(1);
  }

  /* ═══════════════════════════════════════════════
   *  ESCAPE — level complete!
   * ═══════════════════════════════════════════════ */
  _escape() {
    if (this.isComplete) return;
    this.isComplete = true;
    this.robot.body.setVelocity(0, 0);

    const accuracy = 100;
    GameManager.completeLevel(2, accuracy);
    BadgeSystem.unlock("logic_master");
    /* saved by GameManager */

    this.cameras.main.flash(800, 167, 139, 250);

    // Massive celebration particles
    for (let i = 0; i < 12; i++) {
      this.time.delayedCall(i * 200, () => {
        this.celebPart.emitParticleAt(
          Phaser.Math.Between(100, W - 100),
          Phaser.Math.Between(50, 100),
          18
        );
      });
    }

    // Victory screen
    this.time.delayedCall(800, () => this._showVictory());
  }

  _showVictory() {
    const d = 200;
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.9).setDepth(d);

    this.add.text(W / 2, 100, "🧠", { fontSize: "60px" }).setOrigin(0.5).setDepth(d + 1);

    this.add.text(W / 2, 170, "MODULE COMPLETE!", {
      fontFamily: "Arial Black, Arial", fontSize: "34px",
      color: "#ffd700", fontStyle: "bold",
      shadow: { blur: 20, color: "#ffd700", fill: true },
    }).setOrigin(0.5).setDepth(d + 1);

    this.add.text(W / 2, 215, "MASTER OF INTEGERS", {
      fontFamily: "Arial", fontSize: "22px", color: "#a78bfa", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(d + 1);

    this.add.text(W / 2, 260,
      `Total XP: ${GameManager.get("xp")}  |  Score: ${this.score}  |  Badges: ${BadgeSystem.getUnlockedBadges().length}/3`, {
        fontFamily: "Arial", fontSize: "16px", color: "#e2e8f0",
      }
    ).setOrigin(0.5).setDepth(d + 1);

    // Badges display removed

    // Summary
    this.add.text(W / 2, 320,
      "✅ You mastered the int data type!\n\n" +
      "You have successfully learned what an integer is.", {
        fontFamily: "Arial", fontSize: "16px", color: "#4ade80",
        align: "center", lineSpacing: 8,
      }
    ).setOrigin(0.5).setDepth(d + 1);

    // Return button
    const btnBg = this.add.rectangle(W / 2, 445, 220, 44, 0x7c3aed).setDepth(d + 1);
    btnBg.setStrokeStyle(2, 0xa78bfa);
    const btnTxt = this.add.text(W / 2, 445, "RETURN TO MENU", {
      fontFamily: "Arial", fontSize: "16px", color: "#fff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(d + 2);

    btnBg.setInteractive({ useHandCursor: true });
    btnBg.on("pointerover", () => {
      btnBg.setFillStyle(0x6d28d9);
      this.tweens.add({ targets: [btnBg, btnTxt], scaleX: 1.06, scaleY: 1.06, duration: 80 });
    });
    btnBg.on("pointerout", () => {
      btnBg.setFillStyle(0x7c3aed);
      this.tweens.add({ targets: [btnBg, btnTxt], scaleX: 1, scaleY: 1, duration: 80 });
    });
    btnBg.on("pointerup", () => {
      this.scene.stop("UIScene");
      this.scene.start("MenuScene");
    });
  }

  /* ═══════════════════════════════════════════════
   *  SHUTDOWN
   * ═══════════════════════════════════════════════ */
  shutdown() {
    this.gatesOpen = [false, false, false];
    // Restore lives visibility for other levels
    const uiScene = this.scene.get("UIScene");
    if (uiScene && uiScene.setLivesVisible) uiScene.setLivesVisible(true);
  }
}
