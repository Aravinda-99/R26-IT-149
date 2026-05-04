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

/* ───────── Constants ───────── */
const W = 800;
const H = 600;
const TILE = 40;
const ROBOT_SIZE = 28;
const ROBOT_SPEED = 140;

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
  { x: 260, y: 280, w: 8, h: 80 },   // Gate 1 — left column
  { x: 450, y: 280, w: 8, h: 80 },   // Gate 2 — middle column
  { x: 640, y: 280, w: 8, h: 80 },   // Gate 3 — right column
];

const TERMINALS = [
  { x: 240, y: 390, label: "T1" },    // Terminal 1 — near Gate 1
  { x: 430, y: 390, label: "T2" },    // Terminal 2 — near Gate 2
  { x: 620, y: 390, label: "T3" },    // Terminal 3 — near Gate 3
];

const EXIT_ZONE = { x: 730, y: 300, w: 50, h: 60 };

export class Level3Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level3Scene" });
  }

  /* ═══════════════════════════════════════════════
   *  CREATE
   * ═══════════════════════════════════════════════ */
  create() {
    this.cameras.main.setBackgroundColor("#060b18");
    this.physics.world.gravity.y = 0;

    /* ── State ── */
    this.gatesOpen = [false, false, false];
    this.isComplete = false;
    this.overlayActive = false;
    this.score = 0;

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

    // Floor
    gfx.fillStyle(COL_FLOOR, 1);
    gfx.fillRect(40, 100, 720, 400);

    // Grid pattern on floor
    gfx.lineStyle(1, 0x1a2744, 0.3);
    for (let x = 40; x <= 760; x += TILE) {
      gfx.beginPath(); gfx.moveTo(x, 100); gfx.lineTo(x, 500); gfx.strokePath();
    }
    for (let y = 100; y <= 500; y += TILE) {
      gfx.beginPath(); gfx.moveTo(40, y); gfx.lineTo(760, y); gfx.strokePath();
    }

    // Outer walls
    gfx.lineStyle(3, COL_WALL_LINE, 1);
    gfx.strokeRect(40, 100, 720, 400);

    // Title banner at top
    gfx.fillStyle(0x0d1530, 0.95);
    gfx.fillRect(40, 68, 720, 32);
    gfx.lineStyle(1, 0x334155);
    gfx.strokeRect(40, 68, 720, 32);
    this.add.text(W / 2, 84, "⚡ INTEGER ESCAPE FACILITY ⚡", {
      fontFamily: "monospace", fontSize: "14px",
      color: "#a78bfa", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(5);

    // ── Draw the 3 gate walls (vertical barriers) ──
    this.gateGraphics = [];
    this.gateLabels = [];
    GATES.forEach((g, i) => {
      // Wall segment above gate
      gfx.fillStyle(COL_WALL, 1);
      gfx.fillRect(g.x - 4, 100, 8, g.y - 100);
      // Wall segment below gate
      gfx.fillRect(g.x - 4, g.y + g.h, 8, 500 - (g.y + g.h));
      gfx.lineStyle(1, COL_WALL_LINE);
      gfx.strokeRect(g.x - 4, 100, 8, g.y - 100);
      gfx.strokeRect(g.x - 4, g.y + g.h, 8, 500 - (g.y + g.h));

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
    this.add.text(100, 310, "START\n  ↓", {
      fontFamily: "monospace", fontSize: "10px", color: "#475569",
      align: "center",
    }).setOrigin(0.5).setDepth(5);

    // ── Prompt text ──
    this.promptText = this.add.text(W / 2, 520, "Walk to a 💻 Terminal and press [E] to interact", {
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
    this._addWall(W / 2, 98, 720, 8);      // top
    this._addWall(W / 2, 502, 720, 8);     // bottom
    this._addWall(38, 300, 8, 404);         // left
    this._addWall(762, 300, 8, 404);        // right

    // Gate wall segments (vertical barriers)
    this.gateWallBodies = [];
    GATES.forEach((g, i) => {
      // Segment above gate
      const aboveH = g.y - 100;
      if (aboveH > 0) this._addWall(g.x, 100 + aboveH / 2, 8, aboveH);
      // Segment below gate
      const belowY = g.y + g.h;
      const belowH = 500 - belowY;
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
    const startX = 100;
    const startY = 340;

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

    // Gate status indicators
    this.gateStatusTexts = [];
    for (let i = 0; i < 3; i++) {
      const txt = this.add.text(180 + i * 180, 540, `Gate ${i + 1}: 🔒`, {
        fontFamily: "monospace", fontSize: "11px", color: "#ef4444",
      }).setOrigin(0.5).setDepth(dp);
      this.gateStatusTexts.push(txt);
    }

    // Score
    this.scoreText = this.add.text(W - 16, 540, "Score: 0", {
      fontFamily: "monospace", fontSize: "12px", color: "#fbbf24",
    }).setOrigin(1, 0.5).setDepth(dp);

    // Near-terminal prompt
    this.interactPrompt = this.add.text(W / 2, 460, "", {
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
    pg.fillRoundedRect(W / 2 - 300, 50, 600, 490, 16);
    pg.lineStyle(3, 0xa78bfa);
    pg.strokeRoundedRect(W / 2 - 300, 50, 600, 490, 16);
    els.push(pg);

    els.push(this.add.text(W / 2, 85, "🧠 FINAL MISSION: INTEGER ESCAPE", {
      fontFamily: "Arial Black, Arial", fontSize: "22px",
      color: "#a78bfa", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(d + 2));

    els.push(this.add.text(W / 2, 115, "Restructuring Phase — Apply Your int Knowledge", {
      fontFamily: "Arial", fontSize: "13px", color: "#c4b5fd", fontStyle: "italic",
    }).setOrigin(0.5).setDepth(d + 2));

    els.push(this.add.text(W / 2, 230,
      "You are trapped in the Integer Escape Facility!\n" +
      "3 locked gates block your path to the EXIT.\n\n" +
      "🤖 Move your robot with Arrow Keys / WASD\n" +
      "💻 Walk to a Security Terminal, press [E]\n" +
      "🔐 Solve the int-based puzzle to open the gate\n\n" +
      "Terminal 1: Type a valid integer assignment\n" +
      "Terminal 2: Calculate an arithmetic expression\n" +
      "Terminal 3: Choose the safe integer value\n\n" +
      "⚠️ No decimals, no strings — INTEGERS ONLY!",
      {
        fontFamily: "Arial", fontSize: "13px",
        color: "#bdc3c7", align: "center", lineSpacing: 6,
      }
    ).setOrigin(0.5).setDepth(d + 2));

    els.push(this.add.text(W / 2, 420,
      "Open all 3 gates and reach the EXIT\nto earn the Master of Integers badge! 🧠", {
        fontFamily: "Arial", fontSize: "13px",
        color: "#fbbf24", align: "center", fontStyle: "bold", lineSpacing: 5,
      }
    ).setOrigin(0.5).setDepth(d + 2));

    const btnBg = this.add.rectangle(W / 2, 480, 240, 46, 0x7c3aed).setDepth(d + 2);
    btnBg.setStrokeStyle(2, 0xa78bfa);
    const btnTxt = this.add.text(W / 2, 480, "ENTER FACILITY", {
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
    if (this.isComplete || this.overlayActive) {
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
    this.overlayActive = true;
    this.robot.body.setVelocity(0, 0);

    switch (index) {
      case 0: this._terminal1(); break;
      case 1: this._terminal2(); break;
      case 2: this._terminal3(); break;
    }
  }

  /* ── Terminal 1: Direct Assignment ── */
  _terminal1() {
    const els = [];
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
    els.push(this.add.text(W / 2, 200, "int accessCode = _______ ;", {
      fontFamily: "Courier New, monospace", fontSize: "20px", color: "#4ade80",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(d + 2));

    els.push(this.add.text(W / 2, 235, "Type a whole number (e.g. 404, -10, 0)", {
      fontFamily: "Arial", fontSize: "11px", color: "#64748b",
    }).setOrigin(0.5).setDepth(d + 2));

    // DOM input field
    const inputEl = this.add.dom(W / 2, 280).createFromHTML(
      `<input type="text" id="t1-input" placeholder="Enter an integer..." 
       style="width:220px; padding:10px 16px; font-size:18px; font-family:'Courier New',monospace;
       background:#0a1628; color:#22d3ee; border:2px solid #334155; border-radius:6px;
       text-align:center; outline:none;" />`
    ).setDepth(d + 3);
    els.push(inputEl);

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
      els.forEach(e => e.destroy());
      this.overlayActive = false;
    });

    btnBg.setInteractive({ useHandCursor: true });
    btnBg.on("pointerover", () => btnBg.setFillStyle(0x0891b2));
    btnBg.on("pointerout", () => btnBg.setFillStyle(0x0e7490));
    btnBg.on("pointerup", () => {
      const inputField = document.getElementById("t1-input");
      if (!inputField) return;
      const val = inputField.value.trim();

      // Validate: must be a valid integer (no decimals, no text)
      if (val === "" || !/^-?\d+$/.test(val)) {
        errTxt.setText('❌ Syntax Error: Expected int, not "' + val + '"');
        this.cameras.main.shake(150, 0.01);
        return;
      }

      // Success!
      els.forEach(e => e.destroy());
      this._gateOpen(0, `int accessCode = ${val}; // ✓ Valid integer`);
    });

    // Focus the input after a tiny delay
    this.time.delayedCall(100, () => {
      const inp = document.getElementById("t1-input");
      if (inp) inp.focus();
    });
  }

  /* ── Terminal 2: Arithmetic Application ── */
  _terminal2() {
    const els = [];
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
      "int a = 15;",
      "int b = 5;",
      "int result = a - b;",
      "// Enter the value of result:",
    ];
    codeLines.forEach((line, i) => {
      const color = i === 3 ? "#64748b" : "#4ade80";
      els.push(this.add.text(240, 170 + i * 24, line, {
        fontFamily: "Courier New, monospace", fontSize: "15px", color,
      }).setDepth(d + 2));
    });

    // DOM input
    const inputEl = this.add.dom(W / 2, 290).createFromHTML(
      `<input type="text" id="t2-input" placeholder="result = ?" 
       style="width:180px; padding:10px 16px; font-size:18px; font-family:'Courier New',monospace;
       background:#0a1628; color:#22d3ee; border:2px solid #334155; border-radius:6px;
       text-align:center; outline:none;" />`
    ).setDepth(d + 3);
    els.push(inputEl);

    // Error text
    const errTxt = this.add.text(W / 2, 330, "", {
      fontFamily: "monospace", fontSize: "13px", color: "#ef4444",
    }).setOrigin(0.5).setDepth(d + 2);
    els.push(errTxt);

    // Hint
    els.push(this.add.text(W / 2, 355, "💡 Hint: a - b = 15 - 5 = ?", {
      fontFamily: "Arial", fontSize: "11px", color: "#475569",
    }).setOrigin(0.5).setDepth(d + 2));

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
      els.forEach(e => e.destroy());
      this.overlayActive = false;
    });

    btnBg.setInteractive({ useHandCursor: true });
    btnBg.on("pointerover", () => btnBg.setFillStyle(0x0891b2));
    btnBg.on("pointerout", () => btnBg.setFillStyle(0x0e7490));
    btnBg.on("pointerup", () => {
      const inp = document.getElementById("t2-input");
      if (!inp) return;
      const val = inp.value.trim();

      if (val !== "10") {
        errTxt.setText(`❌ Wrong! result = a - b = 15 - 5 ≠ ${val}`);
        this.cameras.main.shake(150, 0.01);
        return;
      }

      els.forEach(e => e.destroy());
      this._gateOpen(1, "int result = 15 - 5; // result = 10 ✓");
    });

    this.time.delayedCall(100, () => {
      const inp = document.getElementById("t2-input");
      if (inp) inp.focus();
    });
  }

  /* ── Terminal 3: Validation & Constraint ── */
  _terminal3() {
    const els = [];
    const d = 200;
    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.85).setDepth(d);
    els.push(ov);

    const pg = this.add.graphics().setDepth(d + 1);
    pg.fillStyle(0x0d1530, 0.97);
    pg.fillRoundedRect(W / 2 - 280, 70, 560, 440, 14);
    pg.lineStyle(2, 0xfbbf24);
    pg.strokeRoundedRect(W / 2 - 280, 70, 560, 440, 14);
    els.push(pg);

    els.push(this.add.text(W / 2, 98, "💻 TERMINAL 3: Validation & Constraint", {
      fontFamily: "monospace", fontSize: "15px", color: "#fbbf24", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(d + 2));

    els.push(this.add.text(W / 2, 125, "Critical load limits. Prevent overflow!", {
      fontFamily: "Arial", fontSize: "13px", color: "#94a3b8",
    }).setOrigin(0.5).setDepth(d + 2));

    // Code block
    const cLines = [
      "int maxCapacity = 50;",
      "int currentLoad = 40;",
      "",
      "// How much more can we safely add?",
      "// safeLoad must be an int and",
      "// currentLoad + safeLoad <= maxCapacity",
      "",
      "int safeLoad = ???;",
    ];
    cLines.forEach((line, i) => {
      const color = line.startsWith("//") ? "#64748b" : (line === "" ? "#000" : "#4ade80");
      els.push(this.add.text(230, 150 + i * 20, line, {
        fontFamily: "Courier New, monospace", fontSize: "13px", color,
      }).setDepth(d + 2));
    });

    // Options as buttons
    const options = [
      { label: "10.5", value: "10.5", hint: "decimal — not an int!" },
      { label: "15",   value: "15",   hint: "40 + 15 = 55 > 50 — overflow!" },
      { label: "10",   value: "10",   hint: "40 + 10 = 50 ≤ 50 ✓" },
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
        if (opt.value === "10") {
          els.forEach(e => e.destroy());
          this._gateOpen(2, "int safeLoad = 10; // 40 + 10 = 50 ≤ 50 ✓");
        } else {
          errTxt.setText(`❌ ${opt.hint}`);
          this.cameras.main.shake(150, 0.01);
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
      els.forEach(e => e.destroy());
      this.overlayActive = false;
    });
  }

  /* ═══════════════════════════════════════════════
   *  GATE OPEN
   * ═══════════════════════════════════════════════ */
  _gateOpen(index, codeStr) {
    this.overlayActive = false;
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
    this.gateLabels[index].setText(`🔓 GATE ${index + 1}`);
    this.gateLabels[index].setColor("#4ade80");

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
    this.gateStatusTexts[index].setText(`Gate ${index + 1}: 🔓`);
    this.gateStatusTexts[index].setColor("#4ade80");

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
    ProgressTracker.saveProgress(GameManager.getState());

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

    // Badges display
    const allBadges = BadgeSystem.getUnlockedBadges();
    const badgeStr = allBadges.map(id => {
      const b = BadgeSystem.getBadge(id);
      return b ? `${b.emoji} ${b.name}` : id;
    }).join("   ");
    this.add.text(W / 2, 300, badgeStr || "No badges", {
      fontFamily: "Arial", fontSize: "15px", color: "#fbbf24",
    }).setOrigin(0.5).setDepth(d + 1);

    // Summary
    this.add.text(W / 2, 350,
      "✅ You mastered the int data type!\n" +
      "• Level 1: Identified integers vs decimals/fractions\n" +
      "• Level 2: Validated int assignments vs type errors\n" +
      "• Level 3: Applied int logic in real scenarios", {
        fontFamily: "Arial", fontSize: "13px", color: "#94a3b8",
        align: "center", lineSpacing: 6,
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
  }
}
