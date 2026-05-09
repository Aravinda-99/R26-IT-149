/**
 * Level6Scene — "Float Restructuring: Neon Cyber-Core" (Restructuring Phase)
 * ===========================================================================
 * Top-down 2D RPG-style level. Engineer navigates a dark tech room to solve
 * float arithmetic problems at 3 terminals. Completing all 3 restores the
 * Main Core and earns the Calculation Wizard badge.
 *
 *   Terminal 1 — Float Addition    (Power Routing)
 *   Terminal 2 — Float Subtraction (Coolant Stabilization)
 *   Terminal 3 — Float Constraints (Laser Alignment)
 *
 * Schema Theory: Restructuring — applying float logic to solve problems
 */

import Phaser from "phaser";
import { GameManager } from "../../GameManager.js";
import { BadgeSystem } from "../../BadgeSystem.js";
import { ProgressTracker } from "../../ProgressTracker.js";

const W = 800;
const H = 600;
const PLAYER_SPEED = 180;
const TERMINAL_SIZE = 60;

/* ═══════════════════════════════════════════════════════════════
 *  SCENE
 * ═══════════════════════════════════════════════════════════════ */
export class Level6Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level6Scene" });
  }

  create() {
    this.physics.world.gravity.y = 0;
    this.physics.world.setBounds(0, 0, W, H);

    this.terminalsSolved = 0;
    this.score = 0;
    this.isComplete = false;
    this.panelOpen = false;
    this.activeTerminalIdx = -1;
    this.activeDom = null;

    this._drawRoom();
    this._genTextures();
    this._createCore();
    this._createTerminals();
    this._createPlayer();
    this._createHUD();
    this._createParticles();

    const ui = this.scene.get("UIScene");
    if (ui?.setLevelLabel) ui.setLevelLabel("Level 6: Restructuring — Neon Cyber-Core!");

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });

    this._showIntro();
  }

  /* ─────────────────────────────────────────────────────────────
   *  ROOM BACKGROUND
   * ───────────────────────────────────────────────────────────── */
  _drawRoom() {
    // Dark tech-room floor
    const g = this.add.graphics().setDepth(0);
    g.fillStyle(0x0a0f1a, 1);
    g.fillRect(0, 0, W, H);

    // Grid lines (subtle neon)
    g.lineStyle(1, 0x1a2744, 0.3);
    for (let x = 0; x < W; x += 40) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.strokePath(); }
    for (let y = 0; y < H; y += 40) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.strokePath(); }

    // Floor accent lines
    g.lineStyle(1, 0x00d4ff, 0.06);
    g.beginPath(); g.moveTo(0, H / 2); g.lineTo(W, H / 2); g.strokePath();
    g.beginPath(); g.moveTo(W / 2, 0); g.lineTo(W / 2, H); g.strokePath();

    // Corner accent markers
    const corners = [[30, 30], [W - 30, 30], [30, H - 30], [W - 30, H - 30]];
    corners.forEach(([cx, cy]) => {
      g.lineStyle(2, 0x00d4ff, 0.15);
      g.strokeCircle(cx, cy, 8);
    });

    // Room border
    g.lineStyle(2, 0x1a3a5c, 0.5);
    g.strokeRect(10, 10, W - 20, H - 20);
  }

  /* ─────────────────────────────────────────────────────────────
   *  TEXTURES
   * ───────────────────────────────────────────────────────────── */
  _genTextures() {
    const make = (key, color) => {
      if (this.textures.exists(key)) return;
      const g = this.add.graphics();
      g.fillStyle(color, 1); g.fillCircle(4, 4, 4);
      g.generateTexture(key, 8, 8); g.destroy();
    };
    make("cyanSpark", 0x00d4ff);
    make("greenSpark", 0x4ade80);
    make("pinkSpark", 0xf472b6);
    make("goldSpark", 0xfbbf24);
    make("whiteSpark", 0xffffff);
    make("iceSpark", 0x88ddff);

    // Engineer character (top-down)
    if (!this.textures.exists("engineer")) {
      const g = this.add.graphics();
      // Body
      g.fillStyle(0x3b82f6, 1);
      g.fillRoundedRect(6, 8, 20, 24, 4);
      // Head
      g.fillStyle(0xfbbf24, 1);
      g.fillCircle(16, 8, 7);
      // Visor
      g.fillStyle(0x00d4ff, 1);
      g.fillRect(12, 5, 8, 4);
      // Legs
      g.fillStyle(0x1e3a5f, 1);
      g.fillRect(8, 30, 6, 6);
      g.fillRect(18, 30, 6, 6);
      g.generateTexture("engineer", 32, 36);
      g.destroy();
    }
  }

  /* ─────────────────────────────────────────────────────────────
   *  MAIN CORE — center of room, pulses red initially
   * ───────────────────────────────────────────────────────────── */
  _createCore() {
    const cx = W / 2, cy = H / 2;

    this.coreOuter = this.add.circle(cx, cy, 50, 0x1a0000, 0.4).setDepth(5);
    this.coreOuter.setStrokeStyle(3, 0xff0000, 0.5);
    this.coreInner = this.add.circle(cx, cy, 28, 0xff0000, 0.3).setDepth(6);
    this.coreInner.setStrokeStyle(2, 0xff4444, 0.8);

    this.coreLabel = this.add.text(cx, cy + 62, "MAIN CORE", {
      fontFamily: "monospace", fontSize: "11px", color: "#ff4444", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(6);

    this.coreStatusTxt = this.add.text(cx, cy + 76, "STATUS: OFFLINE", {
      fontFamily: "monospace", fontSize: "9px", color: "#ef4444",
    }).setOrigin(0.5).setDepth(6);

    // Pulsing animation
    this.tweens.add({
      targets: this.coreInner, alpha: 0.1, yoyo: true, repeat: -1, duration: 800,
    });
    this.tweens.add({
      targets: this.coreOuter, scaleX: 1.05, scaleY: 1.05, yoyo: true, repeat: -1, duration: 1200,
    });
  }

  /* ─────────────────────────────────────────────────────────────
   *  TERMINALS — 3 interactive stations around the room
   * ───────────────────────────────────────────────────────────── */
  _createTerminals() {
    this.terminals = [];
    const defs = [
      { x: 120, y: 130, label: "T1: Power\nRouting", color: 0x00d4ff, solvedColor: 0x00d4ff },
      { x: W - 120, y: 130, label: "T2: Coolant\nStabilize", color: 0x3b82f6, solvedColor: 0x3b82f6 },
      { x: W / 2, y: H - 100, label: "T3: Laser\nAlignment", color: 0xf472b6, solvedColor: 0xf472b6 },
    ];

    defs.forEach((d, i) => {
      const bg = this.add.rectangle(d.x, d.y, TERMINAL_SIZE, TERMINAL_SIZE, 0x0f1a2e, 0.9).setDepth(8);
      bg.setStrokeStyle(2, d.color, 0.6);

      const icon = this.add.text(d.x, d.y - 6, ">_", {
        fontFamily: "Courier New", fontSize: "18px", color: "#" + d.color.toString(16).padStart(6, "0"),
        fontStyle: "bold",
      }).setOrigin(0.5).setDepth(9);

      const label = this.add.text(d.x, d.y + TERMINAL_SIZE / 2 + 14, d.label, {
        fontFamily: "monospace", fontSize: "9px", color: "#64748b", align: "center",
      }).setOrigin(0.5).setDepth(9);

      // Indicator dot (unsolved = dim, solved = bright)
      const dot = this.add.circle(d.x + TERMINAL_SIZE / 2 - 6, d.y - TERMINAL_SIZE / 2 + 6, 4, 0x333333).setDepth(10);

      // Pulse when unsolved
      this.tweens.add({
        targets: bg, alpha: 0.6, yoyo: true, repeat: -1, duration: 1500,
      });

      // Physics zone for overlap
      const zone = this.add.zone(d.x, d.y, TERMINAL_SIZE + 20, TERMINAL_SIZE + 20).setDepth(1);
      this.physics.add.existing(zone, true);

      this.terminals.push({ bg, icon, label, dot, zone, solved: false, def: d, idx: i });
    });
  }

  /* ─────────────────────────────────────────────────────────────
   *  PLAYER
   * ───────────────────────────────────────────────────────────── */
  _createPlayer() {
    this.player = this.physics.add.sprite(W / 2, H / 2 + 120, "engineer");
    this.player.setCollideWorldBounds(true);
    this.player.setDrag(300);
    this.player.body.setAllowGravity(false);
    this.player.body.setSize(20, 24, true);
    this.player.setDepth(30);

    // Player glow
    this.playerGlow = this.add.circle(this.player.x, this.player.y, 18, 0x3b82f6, 0.08).setDepth(29);

    // Set up overlaps with terminals
    this.terminals.forEach(t => {
      this.physics.add.overlap(this.player, t.zone, () => {
        if (!t.solved && !this.panelOpen && !this.isComplete) {
          this._openTerminal(t.idx);
        }
      });
    });
  }

  /* ─────────────────────────────────────────────────────────────
   *  HUD
   * ───────────────────────────────────────────────────────────── */
  _createHUD() {
    const dp = 100;

    this.add.rectangle(W / 2, 28, W, 56, 0x0a0f1a, 0.92).setDepth(dp);

    this.scoreText = this.add.text(16, 18, "Score: 0", {
      fontFamily: "monospace", fontSize: "16px", color: "#ffffff", fontStyle: "bold",
    }).setDepth(dp + 1);

    this.add.text(W / 2, 14, "Terminals Restored", {
      fontFamily: "monospace", fontSize: "11px", color: "#64748b",
    }).setOrigin(0.5).setDepth(dp + 1);

    this.progressBg = this.add.rectangle(W / 2, 34, 200, 10, 0x1e293b).setStrokeStyle(1, 0x334155).setDepth(dp + 1);
    this.progressFill = this.add.rectangle(W / 2 - 100, 34, 0, 8, 0x4ade80).setOrigin(0, 0.5).setDepth(dp + 2);
    this.progressTxt = this.add.text(W / 2, 34, "0 / 3", {
      fontFamily: "monospace", fontSize: "9px", color: "#ffffff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(dp + 3);

    // Instruction hint
    this.hintTxt = this.add.text(W / 2, H - 16, "Walk to a terminal to interact", {
      fontFamily: "monospace", fontSize: "11px", color: "#475569",
    }).setOrigin(0.5).setDepth(dp);
  }

  _updateProgress() {
    this.progressFill.width = 200 * (this.terminalsSolved / 3);
    this.progressTxt.setText(`${this.terminalsSolved} / 3`);
    this.scoreText.setText(`Score: ${this.score}`);
  }

  /* ─────────────────────────────────────────────────────────────
   *  PARTICLES
   * ───────────────────────────────────────────────────────────── */
  _createParticles() {
    this.sparkParticles = this.add.particles(0, 0, "cyanSpark", {
      speed: { min: 60, max: 200 }, scale: { start: 1.2, end: 0 },
      alpha: { start: 1, end: 0 }, lifespan: 600, blendMode: "ADD", emitting: false,
    }).setDepth(50);

    this.iceParticles = this.add.particles(0, 0, "iceSpark", {
      speed: { min: 30, max: 120 }, angle: { min: 250, max: 290 },
      scale: { start: 1, end: 0.3 }, alpha: { start: 0.8, end: 0 },
      lifespan: 1500, gravityY: 40, emitting: false,
    }).setDepth(50);

    this.victoryParticles = this.add.particles(0, 0, "greenSpark", {
      speed: { min: 80, max: 350 }, scale: { start: 1.5, end: 0 },
      alpha: { start: 1, end: 0 }, lifespan: 1200, blendMode: "ADD", emitting: false,
    }).setDepth(50);
  }

  /* ─────────────────────────────────────────────────────────────
   *  INTRO OVERLAY
   * ───────────────────────────────────────────────────────────── */
  _showIntro() {
    const els = [];
    const track = (e) => { els.push(e); return e; };

    track(this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.88).setDepth(200)).setInteractive();

    const pg = track(this.add.graphics().setDepth(201));
    pg.fillStyle(0x0a0f1a, 0.98);
    pg.fillRoundedRect(70, 45, 660, 490, 16);
    pg.lineStyle(3, 0x4ade80);
    pg.strokeRoundedRect(70, 45, 660, 490, 16);

    track(this.add.text(400, 80, "MISSION 6: CYBER-CORE RESTORATION", {
      fontFamily: "Arial Black", fontSize: "22px", color: "#4ade80", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(202));

    track(this.add.text(400, 112, "Float Restructuring Phase", {
      fontFamily: "Arial", fontSize: "16px", color: "#86efac", fontStyle: "italic",
    }).setOrigin(0.5).setDepth(202));

    const desc =
      "\nThe Main Core is OFFLINE. Three terminals must be restored\n" +
      "by solving float arithmetic problems.\n\n" +
      "TERMINAL 1 - Power Routing      (Float Addition)\n" +
      "TERMINAL 2 - Coolant Stabilize  (Float Subtraction)\n" +
      "TERMINAL 3 - Laser Alignment    (Float Constraints)\n\n" +
      "Walk to each terminal with Arrow Keys or WASD.\n" +
      "Solve the code challenge to restore each system.\n\n" +
      "Restore ALL 3 terminals to bring the Core online!";

    track(this.add.text(400, 160, desc, {
      fontFamily: "Arial", fontSize: "13px", color: "#cbd5e1",
      align: "center", lineSpacing: 6, wordWrap: { width: 560 },
    }).setOrigin(0.5, 0).setDepth(202));

    const btnBg = track(this.add.rectangle(400, 492, 220, 44, 0x166534).setDepth(210));
    btnBg.setStrokeStyle(2, 0x4ade80);
    track(this.add.text(400, 492, ">>  BEGIN MISSION", {
      fontFamily: "Arial", fontSize: "17px", color: "#ffffff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(211));

    btnBg.setInteractive({ useHandCursor: true });
    btnBg.on("pointerover", () => btnBg.setFillStyle(0x4ade80));
    btnBg.on("pointerout", () => btnBg.setFillStyle(0x166534));
    btnBg.on("pointerup", () => {
      els.forEach(e => { try { e.destroy(); } catch (_) {} });
      this.gameStarted = true;
    });
  }

  /* ═══════════════════════════════════════════════════════════════
   *  TERMINAL INTERACTION — DOM Code Panels
   * ═══════════════════════════════════════════════════════════════ */
  _openTerminal(idx) {
    if (this.panelOpen || this.terminals[idx].solved) return;
    this.panelOpen = true;
    this.activeTerminalIdx = idx;
    this.player.body.setVelocity(0, 0);

    if (idx === 0) this._buildTerminal1Panel();
    else if (idx === 1) this._buildTerminal2Panel();
    else this._buildTerminal3Panel();
  }

  _closePanel() {
    if (this.activeDom) {
      this.activeDom.destroy();
      this.activeDom = null;
    }
    if (this._panelOverlay) {
      this._panelOverlay.destroy();
      this._panelOverlay = null;
    }
    this.panelOpen = false;
    this.activeTerminalIdx = -1;
  }

  _markTerminalSolved(idx) {
    const t = this.terminals[idx];
    t.solved = true;
    this.terminalsSolved++;
    this.score += 100;
    GameManager.addScore(100);
    GameManager.addXP(200);

    // Visual feedback on terminal
    t.dot.setFillStyle(t.def.solvedColor);
    t.bg.setStrokeStyle(3, t.def.solvedColor, 1);
    t.bg.setAlpha(1);
    this.tweens.killTweensOf(t.bg);

    // Sparks at terminal
    this.sparkParticles.emitParticleAt(t.def.x, t.def.y, 25);
    this.cameras.main.flash(300, 0, 200, 255);

    this._updateProgress();
    this._closePanel();

    if (this.terminalsSolved === 3) {
      this.time.delayedCall(800, () => this._victorySequence());
    }
  }

  /* ─── Terminal 1: Float Addition ─── */
  _buildTerminal1Panel() {
    this._panelOverlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.7).setDepth(150).setInteractive();

    const html = `
      <div style="width:460px; background:#0d1117; border:2px solid #00d4ff; border-radius:12px; padding:24px; font-family:'Courier New',monospace; color:#c9d1d9;">
        <div style="color:#00d4ff; font-size:16px; font-weight:bold; margin-bottom:12px;">TERMINAL 1: POWER ROUTING</div>
        <div style="color:#fbbf24; font-size:13px; margin-bottom:16px;">CRITICAL: Route power to exactly <span style="color:#4ade80; font-weight:bold;">12.75V</span></div>
        <div style="background:#161b22; border:1px solid #30363d; border-radius:8px; padding:14px; margin-bottom:16px; line-height:2;">
          <span style="color:#ff7b72;">float</span> batteryA = <span style="color:#79c0ff;">4.50</span>;<br>
          <span style="color:#ff7b72;">float</span> batteryB = <span style="color:#79c0ff;">5.25</span>;<br>
          <span style="color:#ff7b72;">float</span> backupCell = <input id="t1Input" type="text" placeholder="?" 
            style="width:60px; background:#0d1117; border:2px solid #00d4ff; border-radius:4px; color:#4ade80; 
            font-family:'Courier New'; font-size:15px; text-align:center; padding:4px; outline:none;" autofocus>;<br>
          <br><span style="color:#8b949e;">// Total = batteryA + batteryB + backupCell</span><br>
          <span style="color:#8b949e;">// Must equal 12.75V</span>
        </div>
        <div style="display:flex; gap:10px; justify-content:center;">
          <button id="t1Submit" style="background:#166534; color:#4ade80; border:2px solid #4ade80; border-radius:8px; padding:10px 28px; font-family:'Courier New'; font-size:14px; font-weight:bold; cursor:pointer;">SUBMIT</button>
          <button id="t1Close" style="background:#1e293b; color:#94a3b8; border:1px solid #334155; border-radius:8px; padding:10px 20px; font-family:'Courier New'; font-size:13px; cursor:pointer;">CANCEL</button>
        </div>
        <div id="t1Feedback" style="color:#ef4444; font-size:12px; text-align:center; margin-top:10px; min-height:18px;"></div>
      </div>
    `;

    this.activeDom = this.add.dom(W / 2, H / 2).createFromHTML(html).setDepth(160);

    const el = this.activeDom.node;
    el.querySelector("#t1Submit").addEventListener("click", () => {
      const val = el.querySelector("#t1Input").value.trim();
      const num = parseFloat(val);
      if (!isNaN(num) && Math.abs(num - 3.0) < 0.01) {
        this._markTerminalSolved(0);
      } else {
        el.querySelector("#t1Feedback").textContent = `Wrong! 4.50 + 5.25 + ${val || "?"} != 12.75. Try again.`;
        this.cameras.main.shake(150, 0.008);
      }
    });

    el.querySelector("#t1Close").addEventListener("click", () => this._closePanel());

    el.querySelector("#t1Input").addEventListener("keydown", (e) => {
      if (e.key === "Enter") el.querySelector("#t1Submit").click();
      if (e.key === "Escape") this._closePanel();
    });
  }

  /* ─── Terminal 2: Float Subtraction ─── */
  _buildTerminal2Panel() {
    this._panelOverlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.7).setDepth(150).setInteractive();

    const html = `
      <div style="width:460px; background:#0d1117; border:2px solid #3b82f6; border-radius:12px; padding:24px; font-family:'Courier New',monospace; color:#c9d1d9;">
        <div style="color:#3b82f6; font-size:16px; font-weight:bold; margin-bottom:12px;">TERMINAL 2: COOLANT STABILIZATION</div>
        <div style="color:#fbbf24; font-size:13px; margin-bottom:16px;">CRITICAL: Calculate the required cooling amount</div>
        <div style="background:#161b22; border:1px solid #30363d; border-radius:8px; padding:14px; margin-bottom:16px; line-height:2;">
          <span style="color:#ff7b72;">float</span> currentTemp = <span style="color:#79c0ff;">105.5</span>;<br>
          <span style="color:#ff7b72;">float</span> optimalTemp = <span style="color:#79c0ff;">82.2</span>;<br>
          <span style="color:#ff7b72;">float</span> requiredCooling = currentTemp - optimalTemp;<br>
          <br><span style="color:#8b949e;">// What is requiredCooling?</span><br>
          <span style="color:#8b949e;">// Type the result:</span>
        </div>
        <div style="display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:14px;">
          <span style="color:#94a3b8;">requiredCooling =</span>
          <input id="t2Input" type="text" placeholder="?" 
            style="width:80px; background:#0d1117; border:2px solid #3b82f6; border-radius:4px; color:#4ade80; 
            font-family:'Courier New'; font-size:15px; text-align:center; padding:4px; outline:none;" autofocus>
        </div>
        <div style="display:flex; gap:10px; justify-content:center;">
          <button id="t2Submit" style="background:#1e3a5f; color:#60a5fa; border:2px solid #3b82f6; border-radius:8px; padding:10px 28px; font-family:'Courier New'; font-size:14px; font-weight:bold; cursor:pointer;">SUBMIT</button>
          <button id="t2Close" style="background:#1e293b; color:#94a3b8; border:1px solid #334155; border-radius:8px; padding:10px 20px; font-family:'Courier New'; font-size:13px; cursor:pointer;">CANCEL</button>
        </div>
        <div id="t2Feedback" style="color:#ef4444; font-size:12px; text-align:center; margin-top:10px; min-height:18px;"></div>
      </div>
    `;

    this.activeDom = this.add.dom(W / 2, H / 2).createFromHTML(html).setDepth(160);

    const el = this.activeDom.node;
    el.querySelector("#t2Submit").addEventListener("click", () => {
      const val = el.querySelector("#t2Input").value.trim();
      const num = parseFloat(val);
      if (!isNaN(num) && Math.abs(num - 23.3) < 0.05) {
        // Ice/snow effect at terminal
        const t = this.terminals[1];
        this.iceParticles.emitParticleAt(t.def.x, t.def.y, 30);
        this._markTerminalSolved(1);
      } else {
        el.querySelector("#t2Feedback").textContent = `Wrong! 105.5 - 82.2 = ? (not "${val || "?"}"). Try again.`;
        this.cameras.main.shake(150, 0.008);
      }
    });

    el.querySelector("#t2Close").addEventListener("click", () => this._closePanel());

    el.querySelector("#t2Input").addEventListener("keydown", (e) => {
      if (e.key === "Enter") el.querySelector("#t2Submit").click();
      if (e.key === "Escape") this._closePanel();
    });
  }

  /* ─── Terminal 3: Float Constraints ─── */
  _buildTerminal3Panel() {
    this._panelOverlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.7).setDepth(150).setInteractive();

    const html = `
      <div style="width:500px; background:#0d1117; border:2px solid #f472b6; border-radius:12px; padding:24px; font-family:'Courier New',monospace; color:#c9d1d9;">
        <div style="color:#f472b6; font-size:16px; font-weight:bold; margin-bottom:12px;">TERMINAL 3: LASER ALIGNMENT</div>
        <div style="color:#fbbf24; font-size:13px; margin-bottom:16px;">CRITICAL: Adjust angle into valid range <span style="color:#4ade80;">[45.0, 46.0]</span></div>
        <div style="background:#161b22; border:1px solid #30363d; border-radius:8px; padding:14px; margin-bottom:16px; line-height:2;">
          <span style="color:#ff7b72;">float</span> minAngle = <span style="color:#79c0ff;">45.0</span>;<br>
          <span style="color:#ff7b72;">float</span> maxAngle = <span style="color:#79c0ff;">46.0</span>;<br>
          <span style="color:#ff7b72;">float</span> currentAngle = <span style="color:#79c0ff;">42.5</span>;<br>
          <br><span style="color:#8b949e;">// Pick the adjustment that puts currentAngle</span><br>
          <span style="color:#8b949e;">// within [minAngle, maxAngle]:</span>
        </div>
        <div style="display:flex; gap:12px; justify-content:center; margin-bottom:14px;">
          <button class="t3Btn" data-val="2.1" style="background:#1e293b; color:#f472b6; border:2px solid #f472b6; border-radius:8px; padding:12px 24px; font-family:'Courier New'; font-size:16px; font-weight:bold; cursor:pointer;">+2.1</button>
          <button class="t3Btn" data-val="3.2" style="background:#1e293b; color:#f472b6; border:2px solid #f472b6; border-radius:8px; padding:12px 24px; font-family:'Courier New'; font-size:16px; font-weight:bold; cursor:pointer;">+3.2</button>
          <button class="t3Btn" data-val="4.5" style="background:#1e293b; color:#f472b6; border:2px solid #f472b6; border-radius:8px; padding:12px 24px; font-family:'Courier New'; font-size:16px; font-weight:bold; cursor:pointer;">+4.5</button>
        </div>
        <div style="text-align:center; margin-bottom:10px;">
          <button id="t3Close" style="background:#1e293b; color:#94a3b8; border:1px solid #334155; border-radius:8px; padding:8px 20px; font-family:'Courier New'; font-size:12px; cursor:pointer;">CANCEL</button>
        </div>
        <div id="t3Feedback" style="color:#ef4444; font-size:12px; text-align:center; min-height:18px;"></div>
      </div>
    `;

    this.activeDom = this.add.dom(W / 2, H / 2).createFromHTML(html).setDepth(160);

    const el = this.activeDom.node;
    el.querySelectorAll(".t3Btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const adj = parseFloat(btn.dataset.val);
        const result = 42.5 + adj;
        if (result >= 45.0 && result <= 46.0) {
          // Draw laser line from Terminal 3 to Core
          this._drawLaserLine();
          this._markTerminalSolved(2);
        } else {
          el.querySelector("#t3Feedback").textContent =
            `42.5 + ${adj} = ${result.toFixed(1)} — NOT in [45.0, 46.0]. Try another!`;
          this.cameras.main.shake(150, 0.008);
        }
      });
    });

    el.querySelector("#t3Close").addEventListener("click", () => this._closePanel());
  }

  _drawLaserLine() {
    const t3 = this.terminals[2].def;
    const cx = W / 2, cy = H / 2;

    const laserGfx = this.add.graphics().setDepth(7);
    laserGfx.lineStyle(4, 0xf472b6, 0.9);
    laserGfx.beginPath();
    laserGfx.moveTo(t3.x, t3.y);
    laserGfx.lineTo(cx, cy);
    laserGfx.strokePath();

    // Glow line
    laserGfx.lineStyle(10, 0xf472b6, 0.15);
    laserGfx.beginPath();
    laserGfx.moveTo(t3.x, t3.y);
    laserGfx.lineTo(cx, cy);
    laserGfx.strokePath();

    // Spark burst along line
    const steps = 8;
    for (let i = 0; i <= steps; i++) {
      const frac = i / steps;
      const px = t3.x + (cx - t3.x) * frac;
      const py = t3.y + (cy - t3.y) * frac;
      this.time.delayedCall(i * 60, () => {
        this.sparkParticles.emitParticleAt(px, py, 5);
      });
    }
  }

  /* ═══════════════════════════════════════════════════════════════
   *  VICTORY SEQUENCE
   * ═══════════════════════════════════════════════════════════════ */
  _victorySequence() {
    this.isComplete = true;

    // Core transforms: red → green/cyan
    this.tweens.killTweensOf(this.coreInner);
    this.tweens.killTweensOf(this.coreOuter);

    this.tweens.add({
      targets: this.coreInner,
      fillColor: 0x4ade80,
      duration: 800,
      onUpdate: (tween) => {
        const t = tween.progress;
        const r = Math.round(255 * (1 - t));
        const g = Math.round(74 + (222 - 74) * t);
        const b = Math.round(0 + (128) * t);
        this.coreInner.setFillStyle((r << 16) | (g << 8) | b, 0.7);
      }
    });

    this.coreOuter.setStrokeStyle(3, 0x4ade80, 0.8);
    this.coreOuter.setFillStyle(0x0a2a1a, 0.6);
    this.coreLabel.setColor("#4ade80");
    this.coreStatusTxt.setText("STATUS: ONLINE").setColor("#4ade80");

    // Core pulse (healthy)
    this.tweens.add({
      targets: this.coreInner, alpha: 0.4, yoyo: true, repeat: -1, duration: 1000,
    });
    this.tweens.add({
      targets: this.coreOuter, scaleX: 1.08, scaleY: 1.08, yoyo: true, repeat: -1, duration: 1400,
    });

    // Massive particle explosion
    for (let i = 0; i < 10; i++) {
      this.time.delayedCall(i * 120, () => {
        const angle = (i / 10) * Math.PI * 2;
        const px = W / 2 + Math.cos(angle) * 40;
        const py = H / 2 + Math.sin(angle) * 40;
        this.victoryParticles.emitParticleAt(px, py, 20);
      });
    }

    this.cameras.main.flash(600, 74, 222, 128);
    this.cameras.main.shake(500, 0.015);

    // Draw connection lines from all terminals to core
    this.terminals.forEach(t => {
      const lg = this.add.graphics().setDepth(7);
      lg.lineStyle(2, t.def.solvedColor, 0.4);
      lg.beginPath();
      lg.moveTo(t.def.x, t.def.y);
      lg.lineTo(W / 2, H / 2);
      lg.strokePath();
    });

    // Save progress
    GameManager.completeLevel(5, 100);
    BadgeSystem.unlock("calculation_wizard");
    ProgressTracker.saveProgress(GameManager.getState());
    GameManager.addXP(500);

    this.time.delayedCall(1500, () => this._showVictoryScreen());
  }

  _showVictoryScreen() {
    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.82).setDepth(200);

    const pg = this.add.graphics().setDepth(201);
    pg.fillStyle(0x0a0f1a, 0.96);
    pg.fillRoundedRect(100, 80, 600, 420, 16);
    pg.lineStyle(3, 0x4ade80);
    pg.strokeRoundedRect(100, 80, 600, 420, 16);

    const title = this.add.text(400, 120, "SYSTEM RESTORED!", {
      fontFamily: "Arial Black", fontSize: "32px", color: "#4ade80", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(202).setAlpha(0).setScale(0.5);

    this.tweens.add({ targets: title, alpha: 1, scale: 1, duration: 600, ease: "Back.out" });

    this.add.text(400, 165, "All terminals calibrated. Core is online.", {
      fontFamily: "Arial", fontSize: "15px", color: "#cbd5e1",
    }).setOrigin(0.5).setDepth(202);

    // Badge box
    const badgeG = this.add.graphics().setDepth(202);
    badgeG.fillStyle(0x0f172a, 0.95);
    badgeG.fillRoundedRect(230, 200, 340, 70, 12);
    badgeG.lineStyle(2, 0x4ade80);
    badgeG.strokeRoundedRect(230, 200, 340, 70, 12);

    this.add.text(400, 222, "FLOAT MASTER", {
      fontFamily: "Arial Black", fontSize: "20px", color: "#4ade80",
    }).setOrigin(0.5).setDepth(203);
    this.add.text(400, 248, "Badge Unlocked: Calculation Wizard!", {
      fontFamily: "Arial", fontSize: "12px", color: "#86efac",
    }).setOrigin(0.5).setDepth(203);

    // Stats
    const stats = [
      `Terminals Restored: ${this.terminalsSolved} / 3`,
      `Score: ${this.score}`,
    ];
    stats.forEach((s, i) => {
      this.add.text(400, 295 + i * 26, s, {
        fontFamily: "monospace", fontSize: "15px", color: "#ecf0f1",
      }).setOrigin(0.5).setDepth(202);
    });

    this.add.text(400, 365, "You applied float addition, subtraction, and\nconstraint logic to restore a cyber system!", {
      fontFamily: "Arial", fontSize: "13px", color: "#94a3b8",
      align: "center", lineSpacing: 5,
    }).setOrigin(0.5).setDepth(202);

    // Buttons
    const finishBtn = this.add.rectangle(300, 440, 220, 44, 0x166534).setDepth(210);
    finishBtn.setStrokeStyle(2, 0x4ade80);
    this.add.text(300, 440, "Finish Module", {
      fontFamily: "Arial", fontSize: "15px", color: "#4ade80", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(211);
    finishBtn.setInteractive({ useHandCursor: true });
    finishBtn.on("pointerover", () => finishBtn.setFillStyle(0x4ade80));
    finishBtn.on("pointerout", () => finishBtn.setFillStyle(0x166534));
    finishBtn.on("pointerup", () => {
      this.scene.stop("UIScene");
      this.scene.start("MenuScene");
    });

    const replayBtn = this.add.rectangle(500, 440, 140, 44, 0x1e293b).setDepth(210);
    replayBtn.setStrokeStyle(2, 0x3b82f6);
    this.add.text(500, 440, "Replay", {
      fontFamily: "Arial", fontSize: "15px", color: "#3b82f6", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(211);
    replayBtn.setInteractive({ useHandCursor: true });
    replayBtn.on("pointerover", () => replayBtn.setFillStyle(0x3b82f6));
    replayBtn.on("pointerout", () => replayBtn.setFillStyle(0x1e293b));
    replayBtn.on("pointerup", () => {
      GameManager.resetLevel();
      this.scene.restart();
    });
  }

  /* ═══════════════════════════════════════════════════════════════
   *  UPDATE LOOP
   * ═══════════════════════════════════════════════════════════════ */
  update() {
    if (!this.gameStarted || this.isComplete) return;

    /* ── Player movement (blocked when panel open) ── */
    if (this.panelOpen) {
      this.player.setVelocity(0, 0);
    } else {
      let vx = 0, vy = 0;

      const left = this.cursors.left.isDown || this.wasd.left.isDown;
      const right = this.cursors.right.isDown || this.wasd.right.isDown;
      const up = this.cursors.up.isDown || this.wasd.up.isDown;
      const down = this.cursors.down.isDown || this.wasd.down.isDown;

      if (left) vx = -PLAYER_SPEED;
      else if (right) vx = PLAYER_SPEED;
      if (up) vy = -PLAYER_SPEED;
      else if (down) vy = PLAYER_SPEED;

      if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707; }
      this.player.setVelocity(vx, vy);
    }

    /* ── Player glow follows ── */
    if (this.playerGlow?.active) {
      this.playerGlow.setPosition(this.player.x, this.player.y);
    }

    /* ── Hint text updates ── */
    if (this.hintTxt?.active && !this.panelOpen) {
      let nearTerminal = false;
      this.terminals.forEach(t => {
        if (!t.solved) {
          const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, t.def.x, t.def.y);
          if (dist < 80) nearTerminal = true;
        }
      });
      this.hintTxt.setText(nearTerminal ? "Walk into the terminal to interact!" : "Walk to a terminal to interact");
      this.hintTxt.setColor(nearTerminal ? "#4ade80" : "#475569");
    }
  }
}
