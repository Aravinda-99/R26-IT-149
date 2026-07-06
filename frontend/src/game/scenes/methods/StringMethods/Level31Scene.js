/**
 * Level 31 — "The Case Press" (String Methods: Accretion Phase)
 * =================================================================
 * Teaches toUpperCase()/toLowerCase() AND — the deeper lesson — String
 * immutability. Three stations: the sealed Original Case (left), the
 * Press (center), and the Output Tray (right). The press only ever works
 * on a ghost COPY of the original tiles; the case itself is architecturally
 * untouchable except by the one deliberate "reassignment" reveal, so the
 * game's own code structure embodies the semantics being taught — no
 * method can reach inside a String.
 *
 * Four challenge types across 12 rounds:
 *  A. Press Prediction (1-3)   — predict the transformed String
 *  B. The Sealed Case  (4-6)   — immutability trilogy: discard, capture, reassign
 *  C. Die Inspection   (7-9)   — syntax judgment (arguments, method-name case)
 *  D. Press Command    (10-12) — drag method/assignment cartridges, STAMP for real
 */

import Phaser from "phaser";
import { GameManager } from "../../../GameManager.js";
import { BadgeSystem } from "../../../BadgeSystem.js";

const W = 1280, H = 720;

const C_CYAN = 0x00e5ff, C_AMBER = 0xffd740, C_GREEN = 0x00e676;
const C_RED = 0xf44336, C_GRAY = 0x78909c, C_MAGENTA = 0xff4081;
const C_PURPLE = 0x8c7ae6, C_ORANGE = 0xff9800;
const HEX_CYAN = "#00e5ff", HEX_AMBER = "#ffd740", HEX_GREEN = "#00e676";
const HEX_RED = "#f44336", HEX_GRAY = "#78909c", HEX_MAGENTA = "#ff4081";
const HEX_PURPLE = "#8c7ae6", HEX_ORANGE = "#ff9800";

const CASE_CX = 250, CASE_CY = 370;
const TRAY_CX = 1030, TRAY_CY = 370;
const PRESS_CX = 640;
const RAM_UP_Y = 180, ANVIL_Y = 400;

const TUTORIAL_KEY = "level31_tutorial_done";

// ─────────────────────────────────────────────────────────────────
// Round configuration
// ─────────────────────────────────────────────────────────────────
const ROUNDS = [
  { round: 1, type: "predict", varName: "s", str: "java", method: "upper",
    question: "What will s.toUpperCase() return?", correct: '"JAVA"',
    options: [
      { value: '"JAVA"', tag: null },
      { value: '"Java"', tag: "first_letter_only_belief" },
      { value: '"java"', tag: "no_change_belief" },
      { value: '"jAVA"', tag: "method_direction_confusion" },
    ], concept: "basic_upper" },

  { round: 2, type: "predict", varName: "name", str: "Hello", method: "lower",
    question: "What will name.toLowerCase() return?", correct: '"hello"',
    options: [
      { value: '"hello"', tag: null },
      { value: '"HELLO"', tag: "method_direction_confusion" },
      { value: '"hELLO"', tag: "first_letter_only_belief" },
      { value: '"Hello"', tag: "no_change_belief" },
    ], concept: "basic_lower" },

  { round: 3, type: "predict", varName: "code", str: "Go2Win!", method: "upper",
    question: "What will code.toUpperCase() return?", correct: '"GO2WIN!"',
    options: [
      { value: '"GO2WIN!"', tag: null },
      { value: '"GO@WIN!"', tag: "digits_symbols_converted_belief" },
      { value: '"GO2WIN"', tag: "symbols_dropped_belief" },
      { value: '"Go2Win!"', tag: "no_change_belief" },
    ], concept: "non_letters_pass_through" },

  { round: 4, type: "sealed", varName: "s", str: "press",
    snippet: ['String s = "press";', "s.toUpperCase();", "print(s);"],
    question: "What prints?", correct: '"press"',
    options: [
      { value: '"press"', tag: null },
      { value: '"PRESS"', tag: "in_place_mutation_belief" },
      { value: '"Press"', tag: "first_letter_only_belief" },
      { value: "Error", tag: "discard_error_belief" },
    ], reveal: "discard", concept: "immutability_discard" },

  { round: 5, type: "sealed", varName: "s", str: "press",
    snippet: ['String s = "press";', "String up = s.toUpperCase();", "print(s);"],
    question: "What prints?", correct: '"press"',
    options: [
      { value: '"press"', tag: null },
      { value: '"PRESS"', tag: "in_place_mutation_belief" },
      { value: '"press PRESS"', tag: "both_printed_belief" },
      { value: "Error", tag: "capture_error_belief" },
    ], reveal: "capture", shelfName: "up", concept: "immutability_capture" },

  { round: 6, type: "sealed", varName: "s", str: "press",
    snippet: ['String s = "press";', "s = s.toUpperCase();", "print(s);"],
    question: "What prints?", correct: '"PRESS"',
    options: [
      { value: '"PRESS"', tag: null },
      { value: '"press"', tag: "reassignment_ignored_belief" },
      { value: '"press PRESS"', tag: "both_printed_belief" },
      { value: "Error", tag: "self_assign_error_belief" },
    ], reveal: "reassign", concept: "immutability_reassign" },

  { round: 7, type: "judge", varName: "s", str: "mint",
    snippet: "String big = s.toUpperCase();",
    correct: "valid", resultValue: '"MINT"',
    wrongTag: "method_call_doubt", concept: "valid_call" },

  { round: 8, type: "judge", varName: "s", str: "mint",
    snippet: 'String big = s.toUpperCase("all");',
    correct: "invalid", faultPart: '("all")',
    explanation: "toUpperCase() takes NO arguments — the press converts EVERY letter, always. Empty parentheses!",
    wrongTag: "needs_argument_belief", concept: "no_arguments" },

  { round: 9, type: "judge", varName: "s", str: "mint",
    snippet: "String big = s.touppercase();",
    correct: "invalid", faultPart: "touppercase",
    explanation: "Method names are case-sensitive too! Java only knows toUpperCase — capital U, capital C.",
    wrongTag: "method_name_case_insensitive_belief", concept: "method_name_case" },

  { round: 10, type: "command", varName: "s", str: "Hello Bit",
    mission: 'Produce exactly "HELLO BIT" in the tray.',
    monitorTemplate: "s§method", slotIds: ["method"],
    cartridges: [
      { code: ".toUpperCase()", slotId: "method", correct: true },
      { code: ".toLowerCase()", slotId: "method", tag: "method_direction_confusion" },
      { code: '.toUpperCase("H")', slotId: "method", tag: "needs_argument_belief" },
    ], expectedResult: "HELLO BIT", concept: "command_upper" },

  { round: 11, type: "command", varName: "alarm", str: "STOP!!",
    mission: 'The alarm label is too aggressive. Produce exactly "stop!!".',
    monitorTemplate: "alarm§method", slotIds: ["method"],
    cartridges: [
      { code: ".toLowerCase()", slotId: "method", correct: true },
      { code: ".toUpperCase()", slotId: "method", tag: "method_direction_confusion" },
      { code: ".tolowercase()", slotId: "method", tag: "method_name_case_insensitive_belief", compileError: true },
    ], expectedResult: "stop!!", concept: "command_lower" },

  { round: 12, type: "command", varName: "user", str: "AnJaNa",
    mission: "Usernames must be stored in lowercase — PERMANENTLY. Make the change stick to the variable user.",
    monitorTemplate: "§lhs user§method;\nprint(user);", slotIds: ["lhs", "method"],
    cartridges: [
      { code: "user =", slotId: "lhs", correct: true },
      { code: ".toLowerCase()", slotId: "method", correct: true },
      { code: "(nothing)", slotId: "lhs", tag: "in_place_mutation_belief", empty: true },
      { code: "String low =", slotId: "lhs", tag: "result_discarded_confusion" },
      { code: ".toUpperCase()", slotId: "method", tag: "method_direction_confusion" },
    ], expectedPrint: "anjana", concept: "reassignment_application" },
];

const MISCONCEPTION_FEEDBACK = {
  in_place_mutation_belief: "The case is SEALED, Builder! No method can reach inside a String. The press returns a NEW String — if nobody saves it, s never changes.",
  no_change_belief: "The press never sleeps! Every letter gets stamped — check the tray, all of them converted.",
  first_letter_only_belief: "That's a different tool (you'll meet it someday). toUpperCase() converts EVERY letter, first to last.",
  method_direction_confusion: "Wrong die! A↑ makes capitals, a↓ makes small letters. Read the method name — it tells you its direction.",
  digits_symbols_converted_belief: "The press only speaks LETTERS. Digits, symbols and spaces slide through untouched.",
  symbols_dropped_belief: "Symbols don't disappear! toUpperCase() only converts LETTERS — every digit, space, and symbol stays exactly where it was.",
  needs_argument_belief: "Empty parentheses, always! toUpperCase() has no settings — it converts everything, no arguments accepted.",
  method_name_case_insensitive_belief: "Java is case-sensitive about EVERYTHING — even method names. touppercase doesn't exist; toUpperCase does.",
  discard_error_belief: "No exception here — calling toUpperCase() without saving it is perfectly legal Java. It just means the result is thrown away.",
  both_printed_belief: "Only ONE variable was printed — check exactly which name is inside print(...). The other String still exists, just wasn't printed.",
  capture_error_belief: "Storing a result in a new variable works fine — String up = s.toUpperCase(); is completely valid Java.",
  reassignment_ignored_belief: "Look at the case-swap in the reveal — s = s.toUpperCase() pointed s at the NEW String. Reassignment sticks.",
  self_assign_error_belief: "s = s.toUpperCase(); is totally legal — Java computes the new String FIRST, then points s at it. No error.",
  method_call_doubt: "That call is exactly right — a String variable, a dot, and toUpperCase() with empty parentheses. Totally valid Java!",
  result_discarded_confusion: "The press did its job and the result went... somewhere else. The variable you PRINTED was never reassigned. Save it to the right name!",
};

export class Level31Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level31Scene" });
  }

  init() {
    this.currentRound = 0;
    this.score = 0;
    this.displayScore = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.lives = 3;
    this.correctFirstTry = 0;
    this.attemptLog = [];
    this.roundElements = [];
    this.roundStartTime = 0;
    this.roundAttempts = 0;
    this.commandMissCount = 0;
    this.totalTime = 0;
    this.pressMode = null;
    this.caseTiles = [];
    this.trayTiles = [];
    this.optionBubbles = [];
    this.cartridges = [];
    this.monitorSlots = {};
    this.slotContents = {};
    this.inputLocked = true;
    this.gameEnded = false;
    this._alive = true;
    this._bubble = null;
  }

  preload() {}

  create() {
    this._alive = true;
    this.events.once("shutdown", () => { this._alive = false; });

    const cam = this.cameras.main;
    const zoom = Math.min(this.scale.width / W, this.scale.height / H);
    cam.setZoom(zoom);
    cam.centerOn(W / 2, H / 2);
    cam.setBackgroundColor("#0b0a0e");

    try { GameManager.incrementAttempt(30); } catch (_) {}

    this.createParticleTexture();
    this.createBackground();
    this.createHallFloor();
    this.createBeams();
    this.createMachinery();
    this.createFurnaceGlow();
    this.createParticles();
    this.createPress();
    this.createOriginalCase();
    this.createOutputTray();
    this.createHUD();
    this.createExpressionMonitor();
    this.createTickerTape();
    this.createBit();
    this.setupDragEvents();

    cam.fadeIn(700, 5, 5, 8);
    this.checkTutorial();
  }

  update(time, delta) {
    this.updateParticles(time, delta);
    this.updateFurnace(time);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // SETUP — background & environment
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l31_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l31_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x0b0a0e).setDepth(0);
  }

  createHallFloor() {
    const g = this.add.graphics().setDepth(1);
    const top = 605, panelH = 23;
    for (let i = 0; i < 5; i++) {
      const y = top + i * panelH;
      g.fillStyle(i % 2 === 0 ? 0x12111a : 0x0e0d14, 1);
      g.fillRect(0, y, W, panelH);
      g.lineStyle(1, 0x221f2e, 0.25);
      g.lineBetween(0, y, W, y);
      for (let x = 20; x < W; x += 90) { g.fillStyle(0x221f2e, 0.4); g.fillCircle(x, y, 1.5); }
    }
  }

  createBeams() {
    const g = this.add.graphics().setDepth(3);
    [130, 1150].forEach((x) => {
      g.fillStyle(0x14121c, 1);
      g.lineStyle(1, 0x221f2e, 1);
      g.fillRect(x - 10, 40, 20, 565);
      g.strokeRect(x - 10, 40, 20, 565);
      for (let y = 60; y < 600; y += 60) g.lineBetween(x - 10, y, x + 10, y);
    });
    g.fillStyle(0x14121c, 1);
    g.lineStyle(1, 0x221f2e, 1);
    g.fillRect(130, 71, 1020, 14);
    g.strokeRect(130, 71, 1020, 14);
  }

  createMachinery() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x0d0b16, 0.4);
    g.lineStyle(1, 0x221f2e, 0.06);
    g.fillRect(40, 300, 70, 220);
    g.strokeRect(40, 300, 70, 220);
    [0, 1].forEach((i) => { g.strokeCircle(75, 350 + i * 60, 12); g.lineBetween(75, 350 + i * 60, 75 + 8, 350 + i * 60 - 8); });
    g.fillStyle(0x0d0b16, 0.4);
    g.fillRect(1170, 300, 70, 220);
    g.strokeRect(1170, 300, 70, 220);
    [0, 1, 2].forEach((i) => { g.fillStyle(C_AMBER, 0.05); g.fillCircle(1205, 330 + i * 40, 2); });
  }

  createFurnaceGlow() {
    this.furnaceCircles = [60, 90, 120].map((r, i) => this.add.circle(20, 700, r, 0xff6f00, [0.02, 0.012, 0.006][i]).setDepth(1));
    this.time.addEvent({
      delay: 4000, loop: true,
      callback: () => {
        if (!this._alive) return;
        const p = this.add.circle(Phaser.Math.Between(10, 100), 650, 1, C_ORANGE, 0.15).setDepth(2);
        this.tweens.add({ targets: p, y: p.y - 80, alpha: 0, duration: 1800, onComplete: () => p.destroy() });
      },
    });
  }

  updateFurnace(time) {
    if (!this.furnaceCircles) return;
    const pulse = 1 + Math.sin(time * 0.00024) * 0.2;
    this.furnaceCircles.forEach((c, i) => c.setScale(pulse));
  }

  createParticles() {
    this.dust = [];
    for (let i = 0; i < 10; i++) {
      const p = this.add.circle(Phaser.Math.Between(20, 1260), Phaser.Math.Between(0, 600), 1, 0x90a4ae, Phaser.Math.FloatBetween(0.02, 0.05)).setDepth(2);
      this.dust.push(p);
    }
  }

  updateParticles(time, delta) {
    if (!this.dust) return;
    const step = 0.04 * (delta / 16.7);
    this.dust.forEach((p, i) => {
      p.x += step;
      p.y += Math.sin(time * 0.0008 + i) * 0.03;
      if (p.x > 1280) { p.x = 0; p.y = Phaser.Math.Between(0, 600); }
    });
  }

  _dashedRectOutline(g, x, y, w, h, dash, gap) {
    const side = (x1, y1, x2, y2) => {
      const len = Phaser.Math.Distance.Between(x1, y1, x2, y2);
      if (len === 0) return;
      const dx = (x2 - x1) / len, dy = (y2 - y1) / len;
      for (let d = 0; d < len; d += dash + gap) {
        const e = Math.min(d + dash, len);
        g.lineBetween(x1 + dx * d, y1 + dy * d, x1 + dx * e, y1 + dy * e);
      }
    };
    side(x, y, x + w, y);
    side(x + w, y, x + w, y + h);
    side(x + w, y + h, x, y + h);
    side(x, y + h, x, y);
  }

  _charMeta(ch) {
    if (ch === " ") return { display: "␣", color: HEX_MAGENTA, isSpace: true };
    if (/[0-9]/.test(ch)) return { display: ch, color: HEX_AMBER, isSpace: false };
    if (/[a-zA-Z]/.test(ch)) return { display: ch, color: HEX_CYAN, isSpace: false };
    return { display: ch, color: HEX_ORANGE, isSpace: false };
  }

  applyCase(str, mode) {
    return mode === "upper" ? str.toUpperCase() : str.toLowerCase();
  }

  // ══════════════════════════════════════════════════════════════
  // THE PRESS
  // ══════════════════════════════════════════════════════════════

  createPress() {
    const g = this.add.graphics().setDepth(10);
    [540, 740].forEach((x) => {
      g.fillStyle(0x181624, 1);
      g.lineStyle(2, 0x2e2a40, 1);
      g.fillRect(x - 13, 78, 26, 392);
      g.strokeRect(x - 13, 78, 26, 392);
      for (let y = 100; y < 460; y += 50) { g.fillStyle(0x2e2a40, 1); g.fillCircle(x, y, 2); }
    });
    const anvilG = this.add.graphics().setDepth(11);
    anvilG.fillStyle(0x14121c, 1);
    anvilG.lineStyle(1, 0x2e2a40, 1);
    anvilG.fillRoundedRect(PRESS_CX - 105, ANVIL_Y - 11, 210, 22, 4);
    anvilG.strokeRoundedRect(PRESS_CX - 105, ANVIL_Y - 11, 210, 22, 4);

    // steam vent nozzles
    this.ventPoints = [[540 + 13, 200], [740 - 13, 200]];

    this.ramContainer = this.add.container(PRESS_CX, RAM_UP_Y).setDepth(12);
    const ramBody = this.add.graphics();
    ramBody.fillStyle(0x1e1b2e, 1);
    ramBody.lineStyle(2, C_PURPLE, 1);
    ramBody.fillRoundedRect(-95, -27, 190, 54, 6);
    ramBody.strokeRoundedRect(-95, -27, 190, 54, 6);
    const dieG = this.add.graphics();
    dieG.fillStyle(0x0d0b16, 1);
    dieG.fillRoundedRect(-85, 24, 170, 16, 3);
    this.dieText = this.add.text(0, 32, "?", { font: "bold 14px Courier New", color: HEX_GRAY }).setOrigin(0.5);
    this.modeLamp = this.add.circle(0, -34, 5, C_GRAY);
    this.ramContainer.add([ramBody, dieG, this.dieText, this.modeLamp]);
  }

  setPressMode(mode) {
    this.pressMode = mode;
    if (mode === "upper") { this.dieText.setText("A↑").setColor(HEX_CYAN); this.modeLamp.setFillStyle(C_CYAN); }
    else { this.dieText.setText("a↓").setColor(HEX_ORANGE); this.modeLamp.setFillStyle(C_ORANGE); }
  }

  _steamPuff() {
    this.ventPoints.forEach(([x, y]) => {
      for (let i = 0; i < 2; i++) {
        const p = this.add.circle(x, y, 3, 0xb0bec5, 0.15).setDepth(13);
        this.tweens.add({ targets: p, y: y - 20, alpha: 0, scale: 1.8, duration: 400, delay: i * 60, onComplete: () => p.destroy() });
      }
    });
  }

  // ══════════════════════════════════════════════════════════════
  // ORIGINAL CASE
  // ══════════════════════════════════════════════════════════════

  createOriginalCase() {
    this.caseFrame = this.add.graphics().setDepth(10);
    this.add.text(CASE_CX, CASE_CY + 78, "ORIGINAL — SEALED", { font: "bold 9px Arial", color: HEX_CYAN }).setOrigin(0.5).setDepth(11);
    this.padlock = this.add.graphics().setDepth(11);
    this._drawPadlock(CASE_CX + 78, CASE_CY + 78);
    this.caseTileLayer = this.add.container(0, 0).setDepth(11);
    this.caseLensRing = this.add.circle(CASE_CX, CASE_CY, 26, 0x000000, 0).setStrokeStyle(2, C_AMBER, 0).setDepth(13);
  }

  _drawPadlock(x, y) {
    this.padlock.clear();
    this.padlock.lineStyle(1.5, C_CYAN, 0.6);
    this.padlock.strokeRect(x - 5, y - 2, 10, 8);
    this.padlock.beginPath();
    this.padlock.arc(x, y - 4, 4, Math.PI, 0, false);
    this.padlock.strokePath();
  }

  _drawCaseFrame(w, h) {
    this.caseFrame.clear();
    this.caseFrame.fillStyle(0x0d1420, 0.5);
    this.caseFrame.lineStyle(1, C_CYAN, 1);
    this.caseFrame.fillRoundedRect(CASE_CX - w / 2, CASE_CY - h / 2, w, h, 10);
    this.caseFrame.strokeRoundedRect(CASE_CX - w / 2, CASE_CY - h / 2, w, h, 10);
    this.caseFrame.lineStyle(1, C_CYAN, 0.06);
    this.caseFrame.lineBetween(CASE_CX - w / 2 + 10, CASE_CY - h / 2 + 5, CASE_CX - w / 2 + 30, CASE_CY + h / 2 - 5);
    this.caseFrame.lineBetween(CASE_CX - w / 2 + 20, CASE_CY - h / 2 + 5, CASE_CX - w / 2 + 40, CASE_CY + h / 2 - 5);
  }

  loadOriginalCase(str) {
    this.caseTileLayer.removeAll(true);
    this.caseTiles = [];
    const scale = 0.7, tw = 52 * scale, th = 64 * scale, gap = 6 * scale;
    const n = str.length;
    const totalW = n * tw + (n - 1) * gap;
    const w = Math.max(180, totalW + 30), h = 110;
    this._drawCaseFrame(w, h);
    const startX = CASE_CX - totalW / 2;
    str.split("").forEach((ch, i) => {
      const x = startX + i * (tw + gap) + tw / 2;
      const tile = this._buildTile(ch, x, CASE_CY, scale);
      this.caseTileLayer.add(tile.container);
      this.caseTiles.push(tile);
    });
  }

  _buildTile(ch, x, y, scale = 1) {
    const meta = this._charMeta(ch);
    const tw = 52 * scale, th = 64 * scale;
    const container = this.add.container(x, y);
    const body = this.add.graphics();
    body.fillStyle(0x0d1117, 1);
    body.lineStyle(1.5, 0x2a3a4a, 1);
    body.fillRoundedRect(-tw / 2, -th / 2, tw, th, 5 * scale);
    body.strokeRoundedRect(-tw / 2, -th / 2, tw, th, 5 * scale);
    const txt = this.add.text(0, meta.isSpace ? -4 * scale : 0, meta.display, {
      font: `bold ${Math.round(24 * scale)}px Courier New`, color: meta.color,
    }).setOrigin(0.5);
    if (meta.isSpace) txt.setAlpha(0.85);
    container.add([body, txt]);
    return { container, body, txt, ch, tw, th, scale, x, y };
  }

  async sealCase() {
    this.tweens.add({ targets: this.caseFrame, alpha: 1, duration: 200 });
    this._drawPadlock(CASE_CX + 78, CASE_CY + 78);
    this.tweens.add({ targets: this.padlock, scale: 1.4, duration: 150, yoyo: true });
    await this.delay(200);
  }

  async inspectionSweep() {
    this.caseLensRing.setStrokeStyle(2, C_AMBER, 0.7).setPosition(CASE_CX - 70, CASE_CY);
    await new Promise((res) => {
      this.tweens.add({ targets: this.caseLensRing, x: CASE_CX + 70, duration: 500, onComplete: () => res() });
    });
    this.caseLensRing.setStrokeStyle(2, C_AMBER, 0);
    this.tweens.add({ targets: this.padlock, scale: 1.3, duration: 120, yoyo: true, repeat: 1 });
    await this.delay(150);
  }

  async replaceCaseContents(newStr) {
    // unlock
    this.tweens.add({ targets: this.padlock, alpha: 0.3, duration: 150 });
    await this.delay(150);
    if (!this._alive) return;
    // dissolve old
    await new Promise((res) => {
      this.tweens.add({ targets: this.caseTiles.map((t) => t.container), alpha: 0, scale: 0.7, duration: 250, onComplete: () => res() });
    });
    this.loadOriginalCase(newStr);
    this.caseTiles.forEach((t) => t.container.setAlpha(0).setScale(0.7));
    await new Promise((res) => {
      this.tweens.add({ targets: this.caseTiles.map((t) => t.container), alpha: 1, scale: 1, duration: 250, onComplete: () => res() });
    });
    this.padlock.setAlpha(1);
    this.tweens.add({ targets: this.padlock, scale: 1.4, duration: 150, yoyo: true });
  }

  updateSourceLiteral(varName, str) {
    if (this.literalGroup) this.literalGroup.destroy();
    const c = this.add.container(0, 285).setDepth(15);
    let x = 0;
    const put = (t, color) => {
      const txt = this.add.text(x, 0, t, { font: "15px Courier New", color }).setOrigin(0, 0.5);
      c.add(txt); x += txt.width;
    };
    put("String", HEX_MAGENTA);
    put(" " + varName + " = ", HEX_GRAY);
    put('"', HEX_GRAY);
    put(str, HEX_AMBER);
    put('"', HEX_GRAY);
    put(";", HEX_GRAY);
    c.x = CASE_CX - x / 2;
    this.literalGroup = c;
  }

  // ══════════════════════════════════════════════════════════════
  // OUTPUT TRAY
  // ══════════════════════════════════════════════════════════════

  createOutputTray() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x12111a, 1);
    g.lineStyle(1, 0x2e2a40, 1);
    g.beginPath();
    g.moveTo(TRAY_CX - 100, TRAY_CY - 45);
    g.lineTo(TRAY_CX + 100, TRAY_CY - 45);
    g.lineTo(TRAY_CX + 80, TRAY_CY + 45);
    g.lineTo(TRAY_CX - 80, TRAY_CY + 45);
    g.closePath();
    g.fillPath(); g.strokePath();
    this.add.text(TRAY_CX, TRAY_CY - 62, "RESULT", { font: "bold 9px Arial", color: "#546e7a" }).setOrigin(0.5).setDepth(11);
    this.trayTileLayer = this.add.container(0, 0).setDepth(11);
    this.trayResultText = this.add.text(TRAY_CX, TRAY_CY - 80, "", { font: "bold 16px Courier New", color: HEX_GREEN }).setOrigin(0.5).setDepth(12);
    this.trayTypeTag = this.add.text(TRAY_CX, TRAY_CY - 60, "", { font: "bold 11px Courier New", color: "#4fc3f7" }).setOrigin(0.5).setDepth(12).setAlpha(0);
    this.shelfLabel = null;
    this.shelfTiles = [];
  }

  clearTray() {
    this.trayTileLayer.removeAll(true);
    this.trayTiles = [];
    this.trayResultText.setText("");
    this.trayTypeTag.setAlpha(0);
    if (this.shelfLabel) { this.shelfLabel.destroy(); this.shelfLabel = null; }
    this.shelfTiles.forEach((t) => t.container.destroy());
    this.shelfTiles = [];
  }

  showTrayResult(resultStr) {
    this.trayResultText.setText(`"${resultStr}"`).setScale(0);
    this.tweens.add({ targets: this.trayResultText, scale: 1, duration: 200, ease: "Back.easeOut" });
    this.time.delayedCall(120, () => { if (this._alive) this.trayTypeTag.setText("String").setAlpha(1); });
  }

  async discardTrayToChute() {
    const chuteX = TRAY_CX + 140;
    await new Promise((res) => {
      this.tweens.add({
        targets: this.trayTiles.map((t) => t.container), x: `+=${140}`, y: `+=40`, alpha: 0, duration: 400, ease: "Cubic.easeIn",
        onComplete: () => res(),
      });
    });
    const label = this.add.text(chuteX, TRAY_CY + 60, "UNSAVED", { font: "bold 10px Arial", color: HEX_RED }).setOrigin(0.5).setDepth(20).setAlpha(0);
    this.roundElements.push(label);
    this.tweens.add({ targets: label, alpha: 1, duration: 200 });
    this.time.delayedCall(700, () => this.tweens.add({ targets: label, alpha: 0, duration: 300 }));
    this.clearTray();
  }

  async captureToShelf(name, resultStr) {
    const shelfX = TRAY_CX, shelfY = TRAY_CY + 70;
    this.shelfLabel = this.add.text(shelfX, shelfY - 18, `"${name}" holds "${resultStr}"`, {
      font: "bold 11px Courier New", color: HEX_CYAN,
    }).setOrigin(0.5).setDepth(20).setAlpha(0);
    this.roundElements.push(this.shelfLabel);
    this.tweens.add({ targets: this.shelfLabel, alpha: 1, duration: 250 });
    await this.delay(300);
  }

  // ══════════════════════════════════════════════════════════════
  // THE TRANSFORMATION ANIMATION (universal reveal)
  // ══════════════════════════════════════════════════════════════

  async runTransformation(str, mode) {
    this.setPressMode(mode);
    const scale = 0.7, tw = 52 * scale, th = 64 * scale, gap = 6 * scale;
    const n = str.length;
    const totalW = n * tw + (n - 1) * gap;
    const feedStartX = PRESS_CX - 220;

    // ghost copy lifts from the case (new objects — case tiles are untouched)
    const ghosts = str.split("").map((ch, i) => {
      const tile = this._buildTile(ch, feedStartX - i * 20, ANVIL_Y - 60, scale);
      tile.container.setAlpha(0.45);
      tile.body.lineStyle(1.5, C_CYAN, 0.6);
      this.roundElements.push(tile.container);
      return tile;
    });
    this.tweens.add({ targets: this.padlock, scale: 1.3, duration: 150, yoyo: true });
    await this.delay(200);
    if (!this._alive) return "";

    let result = "";
    let firstPassThrough = true;
    for (let i = 0; i < ghosts.length; i++) {
      if (!this._alive) return result;
      const ghost = ghosts[i];
      await new Promise((res) => this.tweens.add({ targets: ghost.container, x: PRESS_CX, y: ANVIL_Y, duration: 180, onComplete: () => res() }));
      const ch = ghost.ch;
      const converted = /[a-zA-Z]/.test(ch) ? this.applyCase(ch, mode) : ch;
      result += converted;

      if (/[a-zA-Z]/.test(ch)) {
        await new Promise((res) => this.tweens.add({ targets: this.ramContainer, y: ANVIL_Y - 30, duration: 120, ease: "Quad.easeIn", onComplete: () => res() }));
        this.screenShake(0.002, 100);
        this._steamPuff();
        const sparks = this.add.particles(ghost.container.x, ANVIL_Y, "l31_dot", {
          speed: { min: 30, max: 70 }, angle: { min: 200, max: 340 }, scale: { start: 0.5, end: 0 }, lifespan: 220,
          tint: mode === "upper" ? C_CYAN : C_ORANGE, emitting: false,
        }).setDepth(13);
        sparks.explode(4);
        this.time.delayedCall(300, () => sparks.destroy());
        await new Promise((res) => {
          this.tweens.add({
            targets: ghost.container, scaleY: 0.1, duration: 80, yoyo: false,
            onComplete: () => {
              ghost.txt.setText(this._charMeta(converted).display).setColor(this._charMeta(converted).color);
              ghost.container.setAlpha(1);
              this.tweens.add({ targets: ghost.container, scaleY: scale, duration: 80, onComplete: () => res() });
            },
          });
        });
        if (converted === ch) {
          const check = this.add.text(ghost.container.x, ANVIL_Y - 30, "✓", { font: "10px Arial", color: HEX_GREEN }).setOrigin(0.5).setDepth(14);
          this.time.delayedCall(300, () => check.destroy());
        }
        this.tweens.add({ targets: this.ramContainer, y: RAM_UP_Y, duration: 160 });
        await this.delay(160);
      } else {
        await new Promise((res) => this.tweens.add({ targets: this.ramContainer, y: ANVIL_Y - 100, duration: 100, onComplete: () => res() }));
        ghost.container.setAlpha(1);
        const chime = this.add.text(ghost.container.x, ANVIL_Y - 30, "—", { font: "bold 14px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(14);
        this.time.delayedCall(300, () => chime.destroy());
        if (firstPassThrough) {
          firstPassThrough = false;
          const anno = this.add.text(ghost.container.x, ANVIL_Y - 55, "not a letter — passes through", {
            font: "10px Arial", color: HEX_GRAY,
          }).setOrigin(0.5).setDepth(14);
          this.roundElements.push(anno);
          this.time.delayedCall(900, () => anno.destroy());
        }
        this.tweens.add({ targets: this.ramContainer, y: RAM_UP_Y, duration: 140 });
        await this.delay(140);
      }

      const trayX = TRAY_CX - totalW / 2 + i * (tw + gap) + tw / 2;
      await new Promise((res) => this.tweens.add({ targets: ghost.container, x: trayX, y: TRAY_CY, duration: 160, onComplete: () => res() }));
      this.trayTileLayer.add(ghost.container);
      this.trayTiles.push(ghost);
    }

    return result;
  }

  // ══════════════════════════════════════════════════════════════
  // HUD & DISPLAYS
  // ══════════════════════════════════════════════════════════════

  createHUD() {
    const g = this.add.graphics().setDepth(50);
    g.fillStyle(0x0c0b12, 0.93);
    g.fillRect(0, 0, W, 64);
    g.lineStyle(1, 0x221f2e, 1);
    g.lineBetween(0, 64, W, 64);

    this.add.text(20, 14, "THE CASE PRESS", { font: "bold 15px Arial", color: "#b0bec5" }).setDepth(51);
    this.add.text(20, 36, "Accretion Phase — String Methods: toUpperCase() / toLowerCase()", { font: "11px Arial", color: "#546e7a" }).setDepth(51);

    this.add.text(1050, 12, "SCORE", { font: "9px Arial", color: "#546e7a" }).setDepth(51);
    this.scoreText = this.add.text(1050, 24, "0", { font: "bold 20px Arial", color: "#ffffff" }).setDepth(51);
    this.comboText = this.add.text(1140, 30, "×1", { font: "bold 16px Arial", color: HEX_AMBER }).setDepth(51);

    this.lifeIcons = [];
    for (let i = 0; i < 3; i++) {
      const lg = this.add.graphics({ x: 1195 + i * 28, y: 30 }).setDepth(51);
      lg.lineStyle(2, C_PURPLE, 1);
      lg.strokeRect(-6, -6, 12, 12);
      lg.fillStyle(C_PURPLE, 1);
      const t = this.add.text(1195 + i * 28, 30, "A", { font: "bold 8px Arial", color: HEX_PURPLE }).setOrigin(0.5).setDepth(51);
      this.lifeIcons.push({ g: lg, t });
    }
  }

  createExpressionMonitor() {
    const g = this.add.graphics().setDepth(51);
    g.fillStyle(0x1a1a2e, 1);
    g.fillRoundedRect(400, 10, 480, 44, 8);
    g.lineStyle(1, 0x2a2a4a, 1);
    g.strokeRoundedRect(400, 10, 480, 44, 8);
    this.monitorGroup = null;
  }

  _syntaxTokens(line) {
    const tokens = [];
    const re = /("(?:[^"\\]|\\.)*")|(\bString\b|\bint\b)|(toUpperCase|toLowerCase|touppercase|tolowercase|print)|([(){}\[\];.,=])/g;
    let last = 0, m;
    const plain = (t) => t && tokens.push({ t, c: "#e0e0e0" });
    while ((m = re.exec(line))) {
      if (m.index > last) plain(line.slice(last, m.index));
      if (m[1]) tokens.push({ t: m[1], c: HEX_AMBER });
      else if (m[2]) tokens.push({ t: m[2], c: HEX_MAGENTA });
      else if (m[3]) tokens.push({ t: m[3], c: HEX_AMBER });
      else if (m[4]) tokens.push({ t: m[4], c: HEX_GRAY });
      last = m.index + m[0].length;
    }
    if (last < line.length) plain(line.slice(last));
    return tokens.length ? tokens : [{ t: line, c: HEX_CYAN }];
  }

  updateExpressionMonitor(lines) {
    if (this.monitorGroup) { this.monitorGroup.destroy(); this.monitorGroup = null; }
    const c = this.add.container(640, 32).setDepth(52);
    const arr = Array.isArray(lines) ? lines : [lines];
    const fontSize = arr.length > 1 ? 12 : 15;
    arr.forEach((line, i) => {
      const y = (i - (arr.length - 1) / 2) * (fontSize + 4);
      let x = 0;
      const tokens = this._syntaxTokens(line);
      const lineC = this.add.container(0, y);
      tokens.forEach((tok) => {
        const t = this.add.text(x, 0, tok.t, { font: `bold ${fontSize}px Courier New`, color: tok.c }).setOrigin(0, 0.5);
        lineC.add(t);
        x += t.width;
      });
      lineC.x = -x / 2;
      c.add(lineC);
    });
    this.monitorGroup = c;
  }

  showCompileErrorStamp(faultPart) {
    const stamp = this.add.text(640, 32, "COMPILE ERROR", { font: "bold 24px Arial", color: HEX_RED }).setOrigin(0.5).setDepth(60).setScale(2).setAngle(-8).setAlpha(0);
    this.roundElements.push(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 250, ease: "Cubic.easeOut" });
    this.screenShake(0.005, 180);
  }

  createTickerTape() {
    this.tickerStrip = this.add.rectangle(1000, 20, 60, 0, 0xeceff1, 0).setOrigin(0.5, 0).setDepth(55);
    this.tickerText = this.add.text(1000, 25, "", { font: "bold 12px Courier New", color: "#263238" }).setOrigin(0.5, 0).setDepth(56).setAlpha(0);
  }

  async printTickerTape(value) {
    const h = 30;
    this.tickerStrip.setSize(70, 0).setFillStyle(0xeceff1, 1).setPosition(1000, 68);
    await new Promise((res) => {
      this.tweens.add({ targets: this.tickerStrip, displayHeight: h, duration: 250, onComplete: () => res() });
    });
    this.tickerText.setText(value).setPosition(1000, 78).setAlpha(1);
    this.roundElements.push(this.tickerStrip, this.tickerText);
    await this.delay(500);
  }

  clearTickerTape() {
    this.tickerStrip.setSize(60, 0).setFillStyle(0xeceff1, 0);
    this.tickerText.setText("").setAlpha(0);
  }

  // ══════════════════════════════════════════════════════════════
  // BIT — press operator variant
  // ══════════════════════════════════════════════════════════════

  createBit() {
    const c = this.add.container(W + 80, 520).setDepth(60);
    const g = this.add.graphics();
    g.lineStyle(2, 0x78909c, 1);
    g.lineBetween(0, -17, 0, -32);
    g.fillStyle(0x37474f, 1);
    g.fillRoundedRect(-20, -17, 40, 35, 10);
    const tip = this.add.circle(0, -32, 3, 0xffd740);
    const eye = this.add.circle(0, 0, 8, 0x00e5ff);
    const pupil = this.add.circle(0, 0, 3, 0xffffff);
    const goggles = this.add.graphics();
    goggles.lineStyle(2, C_AMBER, 1);
    goggles.strokeCircle(-9, -2, 5);
    goggles.strokeCircle(9, -2, 5);
    goggles.lineBetween(-4, -2, 4, -2);
    c.add([g, tip, eye, pupil, goggles]);
    this.tweens.add({ targets: tip, alpha: 0.3, duration: 900, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: c, y: "+=4", duration: 2000, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
    this.bit = c;
  }

  bitSlideTo(x, y, duration = 300) {
    return new Promise((res) => this.tweens.add({ targets: this.bit, x, y, duration, ease: "Cubic.easeOut", onComplete: () => res() }));
  }

  bitSay(text) {
    this.hideBubble();
    const inner = this.add.text(0, 0, text, { font: "13px Arial", color: "#e0e0e0", wordWrap: { width: 330 } });
    const bw = Math.min(inner.width, 330) + 30, bh = inner.height + 24;
    inner.setText("");
    const bx = Phaser.Math.Clamp(this.bit.x - 24 - bw, 20, W - bw - 20);
    const by = Phaser.Math.Clamp(this.bit.y - bh / 2, 80, H - bh - 20);
    const c = this.add.container(bx, by).setDepth(61).setAlpha(0).setScale(0.7);
    const g = this.add.graphics();
    g.fillStyle(0x1a1a2e, 0.97);
    g.fillRoundedRect(0, 0, bw, bh, 10);
    g.lineStyle(1.5, C_CYAN, 1);
    g.strokeRoundedRect(0, 0, bw, bh, 10);
    inner.setPosition(15, 12);
    c.add([g, inner]);
    this._bubble = c;
    this.tweens.add({ targets: c, alpha: 1, scale: 1, duration: 180, ease: "Back.easeOut" });

    return new Promise((res) => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        ev.remove();
        this.input.off("pointerdown", finish);
        if (inner.active) inner.setText(text);
        res();
      };
      let i = 0;
      const ev = this.time.addEvent({
        delay: 25, repeat: Math.max(0, text.length - 1),
        callback: () => { i++; if (inner.active) inner.setText(text.slice(0, i)); if (i >= text.length) finish(); },
      });
      this.input.once("pointerdown", finish);
    });
  }

  hideBubble() {
    if (!this._bubble) return;
    const b = this._bubble;
    this._bubble = null;
    this.tweens.add({ targets: b, alpha: 0, scale: 0.8, duration: 150, onComplete: () => b.destroy() });
  }

  async showBitFeedback(message) {
    await this.bitSlideTo(1090, 520);
    if (!this._alive) return;
    await this.bitSay(message);
    if (!this._alive) return;
    await Promise.race([this.waitForClick(), this.delay(3500)]);
    this.hideBubble();
    await this.bitSlideTo(W + 80, 520, 250);
  }

  // ══════════════════════════════════════════════════════════════
  // TUTORIAL
  // ══════════════════════════════════════════════════════════════

  checkTutorial() {
    let done = false;
    try { done = localStorage.getItem(TUTORIAL_KEY) === "true"; } catch (_) {}
    if (done) this.time.delayedCall(300, () => this.startRound(0));
    else this.runTutorial();
  }

  async runTutorial() {
    const A = () => this._alive;
    this.loadOriginalCase("");
    await this.delay(500); if (!A()) return;
    await this.bitSlideTo(1090, 520); if (!A()) return;
    await this.bitSay("Welcome to the Case Press, Builder! Remember the Gatekeeper — 'x' and 'X' were strangers to Java? This machine converts between them. But it has ONE sacred rule you must learn first...");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;

    this.updateSourceLiteral("s", "java");
    await this.tutorialDropCaseTiles("java"); if (!A()) return;
    await this.sealCase(); if (!A()) return;
    await this.bitSay("Strings are IMMUTABLE — once made, they can never be changed. Not by any method. Not ever. The case stays sealed. So how does the press work? Watch closely...");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4000)]); if (!A()) return;

    this.updateExpressionMonitor("s.toUpperCase()");
    await this.delay(200); if (!A()) return;
    const midAnno = this.createAnnotation(PRESS_CX - 150, ANVIL_Y - 90, "a COPY! the originals never move!", HEX_CYAN);
    this.time.delayedCall(900, () => this.tweens.add({ targets: midAnno, alpha: 0, duration: 250, onComplete: () => midAnno.destroy() }));
    const result = await this.runTransformation("java", "upper"); if (!A()) return;
    this.showTrayResult(result);
    await this.inspectionSweep(); if (!A()) return;

    await this.bitSay('toUpperCase() RETURNED a brand-new String — "JAVA" — while s is still "java" in its sealed case. The method gives you a new String; it never edits the old one. And notice: it returns a String in double quotes, not a char!');
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(5000)]); if (!A()) return;
    this.clearTray();

    this.updateExpressionMonitor(["s.toUpperCase();", "print(s);"]);
    const result2 = await this.runTransformation("java", "upper"); if (!A()) return;
    await this.discardTrayToChute(); if (!A()) return;
    await this.inspectionSweep(); if (!A()) return;
    await this.printTickerTape('"java"'); if (!A()) return;
    await this.bitSay('The most famous String mistake in Java! We pressed a beautiful "JAVA"... and threw it away. Nobody SAVED the returned String, so s is still "java". The press worked perfectly — WE wasted its work.');
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(5000)]); if (!A()) return;
    this.clearTickerTape();

    this.updateExpressionMonitor("s = s.toUpperCase();");
    const result3 = await this.runTransformation("java", "upper"); if (!A()) return;
    await this.replaceCaseContents(result3); if (!A()) return;
    this.updateSourceLiteral("s", result3);
    this.clearTray();
    await this.bitSay('s = s.toUpperCase() — save the new String back INTO the variable. The old "java" is discarded, and s now points at "JAVA". Reassignment is the ONLY way the change \'sticks\'. Remember: transform, then SAVE.');
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(5000)]); if (!A()) return;

    this.setPressMode("lower");
    await this.bitSay("toLowerCase() is the same press in reverse. Digits, symbols and spaces? The press ignores them — it only speaks LETTERS. Your shift starts now, Builder!");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4000)]); if (!A()) return;
    this.hideBubble();
    await this.bitSlideTo(W + 80, 520, 250);

    try { localStorage.setItem(TUTORIAL_KEY, "true"); } catch (_) {}
    this.startRound(0);
  }

  async tutorialDropCaseTiles(str) {
    const scale = 0.7, tw = 52 * scale, th = 64 * scale, gap = 6 * scale;
    const n = str.length;
    const totalW = n * tw + (n - 1) * gap;
    const w = Math.max(180, totalW + 30), h = 110;
    this._drawCaseFrame(w, h);
    this.caseFrame.setAlpha(0);
    const startX = CASE_CX - totalW / 2;
    this.caseTiles = [];
    for (let i = 0; i < n; i++) {
      if (!this._alive) return;
      const x = startX + i * (tw + gap) + tw / 2;
      const tile = this._buildTile(str[i], x, CASE_CY, scale);
      tile.container.y = CASE_CY - 60;
      tile.container.setAlpha(0);
      this.caseTileLayer.add(tile.container);
      this.caseTiles.push(tile);
      this.tweens.add({ targets: tile.container, y: CASE_CY, alpha: 1, duration: 220, ease: "Bounce.easeOut" });
      await this.delay(130);
    }
  }

  createAnnotation(x, y, text, colorHex, arrowTarget = null) {
    const c = this.add.container(0, 0).setDepth(70).setAlpha(0);
    const txt = this.add.text(x, y, text, { font: "bold 12px Arial", color: colorHex }).setOrigin(0.5);
    c.add(txt);
    if (arrowTarget) {
      const g = this.add.graphics();
      const color = Phaser.Display.Color.HexStringToColor(colorHex).color;
      g.lineStyle(2, color, 1);
      g.lineBetween(arrowTarget.x, y + 10, arrowTarget.x, arrowTarget.y - 8);
      g.fillStyle(color, 1);
      g.fillTriangle(arrowTarget.x, arrowTarget.y, arrowTarget.x - 5, arrowTarget.y - 9, arrowTarget.x + 5, arrowTarget.y - 9);
      c.add(g);
    }
    this.tweens.add({ targets: c, alpha: 1, duration: 300 });
    return c;
  }

  // ══════════════════════════════════════════════════════════════
  // GAMEPLAY — round system
  // ══════════════════════════════════════════════════════════════

  async startRound(index) {
    if (!this._alive || this.gameEnded) return;
    this.currentRound = index;
    const cfg = ROUNDS[index];
    this.roundAttempts = 0;
    this.commandMissCount = 0;
    this.roundStartTime = this.time.now;
    this.inputLocked = true;
    this.clearRound();

    this.updateSourceLiteral(cfg.varName, cfg.str);
    this.loadOriginalCase(cfg.str);
    await this.sealCase();
    this.clearTray();

    if (cfg.type === "predict") {
      this.updateExpressionMonitor(`${cfg.varName}.to${cfg.method === "upper" ? "Upper" : "Lower"}Case()`);
    } else if (cfg.type === "sealed") {
      this.updateExpressionMonitor(cfg.snippet);
    } else if (cfg.type === "judge") {
      this.updateExpressionMonitor(cfg.snippet);
    } else if (cfg.type === "command") {
      this.updateExpressionMonitor(cfg.mission);
    }

    this.showQuestionCard(cfg);
    switch (cfg.type) {
      case "predict": this.setupPredict(cfg); break;
      case "sealed": this.setupSealed(cfg); break;
      case "judge": this.setupJudge(cfg); break;
      case "command": this.setupCommand(cfg); break;
    }
    this.inputLocked = false;
  }

  clearRound() {
    this.hideBubble();
    this.optionBubbles.forEach((b) => b.destroy());
    this.optionBubbles = [];
    this.cartridges.forEach((c) => c.container.destroy());
    this.cartridges = [];
    this.monitorSlots = {};
    this.slotContents = {};
    this.roundElements.forEach((e) => { if (e && e.destroy) e.destroy(); });
    this.roundElements = [];
    if (this.questionCard) { this.questionCard.destroy(); this.questionCard = null; }
    this.clearTickerTape();
  }

  _defaultQuestionText(cfg) {
    if (cfg.question) return cfg.question;
    if (cfg.type === "judge") return "Is this code VALID or INVALID Java?";
    if (cfg.type === "command") return cfg.mission;
    return "";
  }

  showQuestionCard(cfg) {
    const card = this.add.container(640, 540).setDepth(20).setAlpha(0);
    const g = this.add.graphics();
    g.fillStyle(0x1a1a2e, 1);
    g.fillRoundedRect(-260, -40, 520, 80, 10);
    g.lineStyle(1, 0x2a2a4a, 1);
    g.strokeRoundedRect(-260, -40, 520, 80, 10);
    const badge = this.add.circle(-228, 0, 13, C_AMBER);
    const badgeNum = this.add.text(-228, 0, String(cfg.round), { font: "bold 14px Arial", color: "#0a0e14" }).setOrigin(0.5);
    const text = this.add.text(-200, 0, this._defaultQuestionText(cfg), {
      font: "16px Arial", color: "#e0e0e0", wordWrap: { width: 440 },
    }).setOrigin(0, 0.5);
    card.add([g, badge, badgeNum, text]);
    this.tweens.add({ targets: card, y: 480, alpha: 1, duration: 300, ease: "Back.easeOut" });
    this.questionCard = card;
  }

  // ══════════════════════════════════════════════════════════════
  // OPTION BUBBLES
  // ══════════════════════════════════════════════════════════════

  showOptionBubbles(options, onSelect) {
    this.optionBubbles = [];
    const shuffled = Phaser.Utils.Array.Shuffle(options.slice());
    const style = { font: "bold 15px Courier New", color: HEX_CYAN };
    const widths = shuffled.map((o) => {
      const t = this.add.text(0, 0, String(o.value), style);
      const w = Math.max(t.width + 28, 56);
      t.destroy();
      return w;
    });
    const totalW = widths.reduce((a, b) => a + b, 0) + (shuffled.length - 1) * 12;
    let bx = 640 - totalW / 2;

    shuffled.forEach((opt, i) => {
      const w = widths[i], h = 38;
      const c = this.add.container(bx + w / 2, 580).setDepth(25);
      bx += w + 12;
      const g = this.add.graphics();
      const draw = (stroke) => {
        g.clear();
        g.fillStyle(0x1e1e3a, 1);
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 19);
        g.lineStyle(1.5, stroke, 1);
        g.strokeRoundedRect(-w / 2, -h / 2, w, h, 19);
      };
      draw(C_CYAN);
      const txt = this.add.text(0, 0, String(opt.value), style).setOrigin(0.5);
      c.add([g, txt]);
      c.setSize(w, h);
      c.setData("value", opt.value);
      c.setData("draw", draw);
      c.setInteractive({ useHandCursor: true });
      c.on("pointerover", () => { if (!this.inputLocked) draw(0xffffff); });
      c.on("pointerout", () => { if (c.getData("state") !== "locked") draw(C_CYAN); });
      c.on("pointerdown", () => {
        if (this.inputLocked) return;
        this.inputLocked = true;
        c.setData("state", "locked");
        onSelect(opt, c, draw);
      });
      this.roundElements.push(c);
      this.optionBubbles.push(c);
    });
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE A — PREDICT
  // ══════════════════════════════════════════════════════════════

  setupPredict(cfg) {
    this.showOptionBubbles(cfg.options, async (opt, bubble, draw) => {
      const correct = opt.value === cfg.correct;
      this.logAttempt(cfg, correct, opt.value, opt.tag);
      draw(correct ? C_GREEN : C_RED);
      if (!correct) {
        this.tweens.add({ targets: bubble, x: bubble.x + 6, duration: 45, yoyo: true, repeat: 5 });
        const correctBubble = this.optionBubbles.find((b) => b.getData("value") === cfg.correct);
        if (correctBubble) correctBubble.getData("draw")(C_GREEN);
      }
      const result = await this.runTransformation(cfg.str, cfg.method);
      if (!this._alive) return;
      this.showTrayResult(result);
      await this.inspectionSweep();
      if (!this._alive) return;
      if (correct) this.onCorrectAnswer(cfg);
      else this.onIncorrectAnswer(cfg, opt.tag);
    });
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE B — SEALED (immutability trilogy)
  // ══════════════════════════════════════════════════════════════

  setupSealed(cfg) {
    this.showOptionBubbles(cfg.options, async (opt, bubble, draw) => {
      const correct = opt.value === cfg.correct;
      this.logAttempt(cfg, correct, opt.value, opt.tag);
      draw(correct ? C_GREEN : C_RED);
      if (!correct) {
        this.tweens.add({ targets: bubble, x: bubble.x + 6, duration: 45, yoyo: true, repeat: 5 });
        const correctBubble = this.optionBubbles.find((b) => b.getData("value") === cfg.correct);
        if (correctBubble) correctBubble.getData("draw")(C_GREEN);
      }
      const method = cfg.snippet.some((l) => l.includes("toUpperCase")) ? "upper" : "lower";
      const result = await this.runTransformation(cfg.str, method);
      if (!this._alive) return;

      if (cfg.reveal === "discard") {
        await this.discardTrayToChute();
        await this.inspectionSweep();
        await this.printTickerTape(`"${cfg.str}"`);
      } else if (cfg.reveal === "capture") {
        this.showTrayResult(result);
        await this.captureToShelf(cfg.shelfName, result);
        await this.inspectionSweep();
        await this.printTickerTape(`"${cfg.str}"`);
      } else if (cfg.reveal === "reassign") {
        this.showTrayResult(result);
        await this.delay(300);
        await this.replaceCaseContents(result);
        this.updateSourceLiteral(cfg.varName, result);
        this.clearTray();
        await this.printTickerTape(`"${result}"`);
      }
      if (!this._alive) return;
      if (correct) this.onCorrectAnswer(cfg);
      else this.onIncorrectAnswer(cfg, opt.tag);
    });
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE C — JUDGE
  // ══════════════════════════════════════════════════════════════

  showJudgmentButtons(onSelect) {
    const mk = (x, label, color) => {
      const c = this.add.container(x, 570).setDepth(25);
      const g = this.add.graphics();
      const draw = (fillA) => {
        g.clear();
        g.fillStyle(color, fillA);
        g.fillRoundedRect(-90, -27, 180, 54, 12);
        g.lineStyle(2, color, 1);
        g.strokeRoundedRect(-90, -27, 180, 54, 12);
      };
      draw(0);
      const hex = "#" + color.toString(16).padStart(6, "0");
      const t = this.add.text(0, 0, label, { font: "bold 15px Arial", color: hex }).setOrigin(0.5);
      c.add([g, t]);
      c.setSize(180, 54);
      c.setInteractive({ useHandCursor: true });
      c.on("pointerover", () => { if (!this.inputLocked) { draw(0.08); c.setScale(1.03); } });
      c.on("pointerout", () => { draw(0); c.setScale(1); });
      c.on("pointerdown", () => { if (!this.inputLocked) { this.inputLocked = true; onSelect(label.includes("IN") ? "invalid" : "valid"); } });
      this.roundElements.push(c);
      this.optionBubbles.push(c);
    };
    mk(480, "✓ VALID", C_GREEN);
    mk(800, "✗ INVALID", C_RED);
  }

  setupJudge(cfg) {
    this.showJudgmentButtons(async (choice) => {
      const correct = choice === cfg.correct;
      this.logAttempt(cfg, correct, choice, correct ? null : cfg.wrongTag);

      if (cfg.correct === "invalid") {
        this.showCompileErrorStamp(cfg.faultPart);
        await this.delay(300);
        if (!this._alive) return;
        const anno = this.add.text(640, 62, cfg.explanation, { font: "bold 12px Arial", color: HEX_RED, wordWrap: { width: 560 } }).setOrigin(0.5).setDepth(60).setAlpha(0);
        this.roundElements.push(anno);
        this.tweens.add({ targets: anno, alpha: 1, duration: 250 });
        await this.delay(700);
      } else {
        const method = cfg.snippet.includes("toUpperCase") ? "upper" : "lower";
        const result = await this.runTransformation(cfg.str, method);
        if (!this._alive) return;
        this.showTrayResult(result);
        await this.inspectionSweep();
      }
      if (!this._alive) return;
      if (correct) this.onCorrectAnswer(cfg);
      else this.onIncorrectAnswer(cfg, cfg.wrongTag);
    });
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE D — PRESS COMMAND
  // ══════════════════════════════════════════════════════════════

  setupCommand(cfg) {
    this.monitorSlots = {};
    // parse the monitor template into rows with §slot markers
    const rows = cfg.monitorTemplate.split("\n");
    const lineObjs = [];
    rows.forEach((row, ri) => {
      const parts = row.split(/§(\w+)/);
      lineObjs.push({ parts, ri });
    });

    const monitorY = 32;
    const container = this.add.container(640, monitorY).setDepth(52);
    const fontSize = rows.length > 1 ? 13 : 15;
    lineObjs.forEach(({ parts }, ri) => {
      const y = (ri - (rows.length - 1) / 2) * (fontSize + 6);
      let x = 0;
      const lineC = this.add.container(0, y);
      parts.forEach((part, pi) => {
        if (pi % 2 === 0) {
          if (!part) return;
          this._syntaxTokens(part).forEach((tok) => {
            const t = this.add.text(x, 0, tok.t, { font: `bold ${fontSize}px Courier New`, color: tok.c }).setOrigin(0, 0.5);
            lineC.add(t);
            x += t.width;
          });
        } else {
          const slotId = part;
          const w = 90;
          const dg = this.add.graphics();
          const filled = () => (this.slotContents[slotId] || []).length > 0;
          const draw = (highlight) => {
            dg.clear();
            dg.fillStyle(0x161b22, 1);
            dg.fillRoundedRect(x, -11, w, 22, 5);
            if (filled()) { dg.lineStyle(1.5, highlight ? C_AMBER : 0x2a3a4a, 1); dg.strokeRoundedRect(x, -11, w, 22, 5); }
            else { dg.lineStyle(1.5, highlight ? C_AMBER : 0x546e7a, 1); this._dashedRectOutline(dg, x, -11, w, 22, 4, 3); }
          };
          draw(false);
          lineC.add(dg);
          this.monitorSlots[slotId] = { x, y, w, h: 22, dg, drawDash: draw, lineContainer: lineC };
          x += w + 6;
        }
      });
      lineC.x = -x / 2;
      // re-anchor slot rects to container-space x once width known
      Object.values(this.monitorSlots).forEach((s) => { if (s.lineContainer === lineC) s._offsetX = lineC.x; });
      container.add(lineC);
    });
    this.monitorGroup = container;

    // compute absolute slot rects (world space) for drag targeting
    Object.keys(this.monitorSlots).forEach((id) => {
      const s = this.monitorSlots[id];
      s.absX = 640 + s._offsetX + s.x;
      s.absY = monitorY + s.y;
    });

    // cartridge tray
    const trayY = 570;
    const widths = cfg.cartridges.map((c) => {
      const t = this.add.text(0, 0, c.code, { font: "bold 13px Courier New", color: HEX_AMBER });
      const w = Math.max(t.width + 22, 50);
      t.destroy();
      return w;
    });
    const totalW = widths.reduce((a, b) => a + b, 0) + (cfg.cartridges.length - 1) * 10;
    let cx = 640 - totalW / 2;
    cfg.cartridges.forEach((cart, i) => {
      const w = widths[i], h = 34;
      const home = { x: cx + w / 2, y: trayY };
      cx += w + 10;
      const c = this.add.container(home.x, home.y).setDepth(31);
      const g = this.add.graphics();
      g.fillStyle(0x1a1a2e, 1);
      g.fillRoundedRect(-w / 2, -h / 2, w, h, 17);
      g.lineStyle(1, C_AMBER, 1);
      g.strokeRoundedRect(-w / 2, -h / 2, w, h, 17);
      const t = this.add.text(0, 0, cart.code, { font: "bold 13px Courier New", color: HEX_AMBER }).setOrigin(0.5);
      c.add([g, t]);
      c.setSize(w, h);
      c.setData("w", w);
      c.setData("cart", cart);
      c.setData("home", home);
      c.setData("placedIn", null);
      c.setInteractive({ useHandCursor: true, draggable: true });
      this.roundElements.push(c);
      this.cartridges.push({ container: c, cart, home });
    });

    const stampBtn = this.add.container(1000, 570).setDepth(32);
    const bg = this.add.graphics();
    const drawStamp = (enabled, hover) => {
      bg.clear();
      bg.fillStyle(enabled ? C_PURPLE : 0x2a2f36, hover && enabled ? 1 : 0.9);
      bg.fillRoundedRect(-65, -22, 130, 44, 8);
    };
    drawStamp(false, false);
    const st = this.add.text(0, 0, "STAMP", { font: "bold 14px Arial", color: "#0a0e14" }).setOrigin(0.5);
    stampBtn.add([bg, st]);
    stampBtn.setSize(130, 44);
    stampBtn.on("pointerover", () => { if (this._stampReady) { drawStamp(true, true); stampBtn.setScale(1.03); } });
    stampBtn.on("pointerout", () => { drawStamp(this._stampReady, false); stampBtn.setScale(1); });
    stampBtn.on("pointerdown", () => { if (this._stampReady) this.onStampPressed(cfg); });
    this.roundElements.push(stampBtn);
    this.stampButton = { c: stampBtn, draw: drawStamp };
    this._updateStampReady(cfg);
  }

  _updateStampReady(cfg) {
    const filled = cfg.slotIds.every((id) => (this.slotContents[id] || []).length > 0);
    this._stampReady = filled;
    if (this.stampButton) {
      this.stampButton.draw(filled, false);
      if (filled) this.stampButton.c.setInteractive({ useHandCursor: true });
      else this.stampButton.c.disableInteractive();
    }
  }

  setupDragEvents() {
    this.input.on("dragstart", (pointer, obj) => {
      if (!this.cartridges.find((c) => c.container === obj) || this.inputLocked) return;
      obj.setDepth(60);
      this.tweens.add({ targets: obj, scale: 1.08, alpha: 0.85, duration: 100 });
      const prevSlot = obj.getData("placedIn");
      if (prevSlot) {
        this.slotContents[prevSlot] = (this.slotContents[prevSlot] || []).filter((b) => b.container !== obj);
        obj.setData("placedIn", null);
        this._redrawMonitorSlot(prevSlot);
        const cfg = ROUNDS[this.currentRound];
        this._updateStampReady(cfg);
      }
    });
    this.input.on("drag", (pointer, obj, dragX, dragY) => {
      if (!this.cartridges.find((c) => c.container === obj) || this.inputLocked) return;
      obj.x = dragX;
      obj.y = dragY;
      this._updateCartridgeHover(obj);
    });
    this.input.on("dragend", (pointer, obj) => {
      if (!this.cartridges.find((c) => c.container === obj) || this.inputLocked) return;
      this._finishCartridgeDrag(obj);
    });
  }

  _nearestOpenMonitorSlot(x, y, wantSlotId) {
    let best = null, bestDist = 60;
    Object.keys(this.monitorSlots).forEach((id) => {
      if (wantSlotId && id !== wantSlotId) return;
      const s = this.monitorSlots[id];
      if ((this.slotContents[id] || []).length > 0) return;
      const cx = s.absX + s.w / 2, cy = s.absY;
      const dist = Phaser.Math.Distance.Between(x, y, cx, cy);
      const within = x >= s.absX - 25 && x <= s.absX + s.w + 25 && y >= s.absY - 20 && y <= s.absY + 20;
      if (within && dist < bestDist) { bestDist = dist; best = id; }
    });
    return best;
  }

  _updateCartridgeHover(obj) {
    const cart = obj.getData("cart");
    const key = this._nearestOpenMonitorSlot(obj.x, obj.y, cart.slotId);
    if (key) {
      const s = this.monitorSlots[key];
      obj.x = Phaser.Math.Linear(obj.x, s.absX + s.w / 2, 0.25);
      obj.y = Phaser.Math.Linear(obj.y, s.absY, 0.25);
      s.drawDash(true);
    }
    Object.keys(this.monitorSlots).forEach((id) => { if (id !== key) this.monitorSlots[id].drawDash(false); });
  }

  _finishCartridgeDrag(obj) {
    obj.setDepth(31);
    this.tweens.add({ targets: obj, scale: 1, alpha: 1, duration: 100 });
    const cart = obj.getData("cart");
    const key = this._nearestOpenMonitorSlot(obj.x, obj.y, cart.slotId);
    Object.values(this.monitorSlots).forEach((s) => s.drawDash(false));

    const cfg = ROUNDS[this.currentRound];
    if (key) {
      if (!this.slotContents[key]) this.slotContents[key] = [];
      this.slotContents[key].push({ container: obj });
      obj.setData("placedIn", key);
      const s = this.monitorSlots[key];
      this.tweens.add({ targets: obj, x: s.absX + s.w / 2, y: s.absY, duration: 150, ease: "Cubic.easeOut" });
      this._redrawMonitorSlot(key);
      this._updateStampReady(cfg);
    } else {
      const home = obj.getData("home");
      this.tweens.add({ targets: obj, x: home.x, y: home.y, duration: 250, ease: "Cubic.easeOut" });
    }
  }

  _redrawMonitorSlot(slotId) {
    const s = this.monitorSlots[slotId];
    if (s) s.drawDash(false);
  }

  async onStampPressed(cfg) {
    if (!this._stampReady) return;
    this.inputLocked = true;
    this.stampButton.draw(false, false);
    this.stampButton.c.disableInteractive();

    const chosen = {};
    cfg.slotIds.forEach((id) => { chosen[id] = (this.slotContents[id] || [])[0].container.getData("cart"); });

    // compile check: any cartridge flagged compileError
    const compileOffender = Object.values(chosen).find((c) => c.compileError);
    if (compileOffender) {
      this.showCompileErrorStamp(compileOffender.code);
      await this.delay(300);
      if (!this._alive) return;
      this.logAttempt(cfg, false, Object.values(chosen).map((c) => c.code), compileOffender.tag);
      await this._onCommandOutcome(cfg, false, compileOffender.tag, null);
      return;
    }

    const methodCode = chosen.method ? chosen.method.code : null;
    const mode = methodCode && methodCode.includes("toUpperCase") ? "upper" : "lower";
    const result = await this.runTransformation(cfg.str, mode);
    if (!this._alive) return;
    this.showTrayResult(result);

    let allCorrect, printedValue = null;
    if (cfg.expectedResult !== undefined) {
      allCorrect = result === cfg.expectedResult;
    } else {
      // round 12: lhs determines whether the case actually gets reassigned.
      // print(user) is the ground truth — only a real reassignment changes it,
      // so the comparison must be exact/case-sensitive (never normalize with
      // toLowerCase(), which would make the original mixed-case "AnJaNa"
      // falsely equal the expected "anjana" even when nothing was saved).
      const lhsCart = chosen.lhs;
      if (lhsCart.correct) {
        await this.replaceCaseContents(result);
        this.updateSourceLiteral(cfg.varName, result);
        printedValue = result;
      } else if (lhsCart.empty) {
        // no assignment at all — result discarded, case (and variable) unchanged
        await this.discardTrayToChute();
        printedValue = cfg.str;
      } else {
        // captured into an unrelated variable ("String low = ...")
        await this.captureToShelf("low", result);
        printedValue = cfg.str;
      }
      await this.inspectionSweep();
      await this.printTickerTape(`"${printedValue}"`);
      allCorrect = printedValue === cfg.expectedPrint;
    }

    const wrongCart = Object.values(chosen).find((c) => c.tag);
    const primaryTag = wrongCart ? wrongCart.tag : null;
    this.logAttempt(cfg, allCorrect, Object.values(chosen).map((c) => c.code), allCorrect ? null : primaryTag);
    await this._onCommandOutcome(cfg, allCorrect, primaryTag, result);
  }

  async _onCommandOutcome(cfg, allCorrect, tag, result) {
    if (allCorrect) {
      this.onCorrectAnswer(cfg);
      return;
    }
    this.commandMissCount++;
    const costLife = this.commandMissCount >= 2;
    this.updateCombo(false);
    if (costLife) {
      const dead = this.loseLife();
      if (dead) { this.time.delayedCall(500, () => this.gameOver()); return; }
    }
    await this.showBitFeedback(MISCONCEPTION_FEEDBACK[tag] || "Recheck the die and the assignment — the press only lies to nobody.");
    if (!this._alive || this.gameEnded) return;

    // reset cartridges placed in slots for retry
    cfg.slotIds.forEach((id) => {
      (this.slotContents[id] || []).forEach((b) => {
        const home = b.container.getData("home");
        b.container.setData("placedIn", null);
        this.tweens.add({ targets: b.container, x: home.x, y: home.y, duration: 250 });
      });
      this.slotContents[id] = [];
      this._redrawMonitorSlot(id);
    });
    this.clearTray();
    this._updateStampReady(cfg);
    this.inputLocked = false;
  }

  // ══════════════════════════════════════════════════════════════
  // EVALUATION
  // ══════════════════════════════════════════════════════════════

  logAttempt(cfg, correct, selected, tag) {
    this.roundAttempts++;
    this.attemptLog.push({
      round: cfg.round, type: cfg.type, concept: cfg.concept, correct,
      selectedAnswer: selected, misconceptionTag: tag || null,
      timeMs: Math.round(this.time.now - this.roundStartTime), attemptNumber: this.roundAttempts,
    });
  }

  onCorrectAnswer(cfg) {
    if (this.gameEnded) return;
    this.inputLocked = true;
    const firstTry = this.roundAttempts === 1;
    if (firstTry) this.correctFirstTry++;
    this.updateCombo(true);
    const multiplier = Math.min(this.combo, 5);
    const timeMs = this.time.now - this.roundStartTime;
    this.totalTime += timeMs;
    let points = 100 * multiplier;
    if (timeMs <= 6000) { points += 25; this.createFloatingText(TRAY_CX, TRAY_CY - 100, "+25 QUICK!", HEX_AMBER, "bold 13px Arial"); }
    this.updateScore(points);

    const t = this.add.text(640, 200, "✓ CORRECT", { font: "bold 28px Arial", color: HEX_GREEN }).setOrigin(0.5).setScale(0).setDepth(70);
    this.tweens.add({
      targets: t, scale: 1.15, duration: 200, ease: "Back.easeOut",
      onComplete: () => this.tweens.add({ targets: t, scale: 1, duration: 100 }),
    });
    this.time.delayedCall(900, () => this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() }));

    this.time.delayedCall(1300, () => {
      if (!this._alive || this.gameEnded) return;
      if (this.currentRound + 1 >= ROUNDS.length) this.levelComplete();
      else this.startRound(this.currentRound + 1);
    });
  }

  async onIncorrectAnswer(cfg, tag) {
    if (this.gameEnded) return;
    this.inputLocked = true;
    this.updateCombo(false);
    this.screenShake(0.003, 150);
    const dead = this.loseLife();
    if (dead) { this.time.delayedCall(600, () => this.gameOver()); return; }
    await this.showBitFeedback(MISCONCEPTION_FEEDBACK[tag] || "Recheck the die, the case, and the tray — the press never lies.");
    if (!this._alive || this.gameEnded) return;
    this.time.delayedCall(300, () => {
      if (!this._alive || this.gameEnded) return;
      if (this.currentRound + 1 >= ROUNDS.length) this.levelComplete();
      else this.startRound(this.currentRound + 1);
    });
  }

  updateScore(points) {
    this.score += points;
    const counter = { v: this.displayScore };
    this.tweens.add({
      targets: counter, v: this.score, duration: 350,
      onUpdate: () => { this.displayScore = Math.round(counter.v); if (this.scoreText.active) this.scoreText.setText(String(this.displayScore)); },
    });
  }

  updateCombo(correct) {
    if (correct) {
      this.combo++;
      this.maxCombo = Math.max(this.maxCombo, this.combo);
      this.comboText.setText(`×${this.combo}`);
      if (this.combo >= 2) this.tweens.add({ targets: this.comboText, scale: 1.4, duration: 150, yoyo: true });
    } else {
      if (this.combo >= 2) this.comboShatterEffect();
      this.combo = 0;
      this.comboText.setText("×1");
    }
  }

  comboShatterEffect() {
    const { x, y } = this.comboText;
    const p = this.add.particles(x + 10, y + 8, "l31_dot", {
      speed: { min: 40, max: 140 }, angle: { min: 0, max: 360 }, scale: { start: 0.5, end: 0 }, lifespan: 400, tint: 0xffd740, emitting: false,
    }).setDepth(55);
    p.explode(12);
    this.time.delayedCall(600, () => p.destroy());
  }

  loseLife() {
    this.lives = Math.max(0, this.lives - 1);
    const icon = this.lifeIcons[this.lives];
    if (icon) { this.tweens.add({ targets: icon.g, alpha: 0.12, duration: 400 }); this.tweens.add({ targets: icon.t, alpha: 0.12, duration: 400 }); }
    return this.lives <= 0;
  }

  createFloatingText(x, y, text, colorHex, font = "bold 16px Arial") {
    const t = this.add.text(x, y, text, { font, color: colorHex }).setOrigin(0.5).setDepth(65);
    this.tweens.add({ targets: t, y: y - 34, alpha: 0, duration: 900, ease: "Cubic.easeOut", onComplete: () => t.destroy() });
    return t;
  }

  createConfetti(x, y, count = 30) {
    const p = this.add.particles(x, y, "l31_dot", {
      speed: { min: 80, max: 260 }, angle: { min: 0, max: 360 }, scale: { start: 0.9, end: 0 }, lifespan: 500,
      tint: [C_CYAN, C_AMBER, C_GREEN, C_PURPLE, 0xffffff], emitting: false,
    }).setDepth(65);
    p.explode(count);
    this.time.delayedCall(900, () => p.destroy());
  }

  screenShake(intensity = 0.003, duration = 150) {
    this.cameras.main.shake(duration, intensity);
  }

  // ══════════════════════════════════════════════════════════════
  // END STATES
  // ══════════════════════════════════════════════════════════════

  async celebrationDrumRoll() {
    for (let i = 0; i < 6; i++) {
      if (!this._alive) return;
      this.setPressMode(i % 2 === 0 ? "upper" : "lower");
      await new Promise((res) => this.tweens.add({ targets: this.ramContainer, y: ANVIL_Y - 30, duration: 60, onComplete: () => res() }));
      this._steamPuff();
      const sparks = this.add.particles(PRESS_CX, ANVIL_Y, "l31_dot", {
        speed: { min: 40, max: 100 }, angle: { min: 200, max: 340 }, scale: { start: 0.6, end: 0 }, lifespan: 300,
        tint: i % 2 === 0 ? C_CYAN : C_ORANGE, emitting: false,
      }).setDepth(13);
      sparks.explode(5);
      this.time.delayedCall(400, () => sparks.destroy());
      await this.delay(30);
      this.tweens.add({ targets: this.ramContainer, y: RAM_UP_Y, duration: 60 });
      await this.delay(90);
    }
    this.createConfetti(TRAY_CX, TRAY_CY);
    this.tweens.add({ targets: this.padlock, scale: 1.4, duration: 200, yoyo: true, repeat: 2 });
    await this.delay(700);
  }

  gameOver() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearRound();
    this.hideBubble();

    this.tweens.add({ targets: this.ramContainer, y: ANVIL_Y - 20, duration: 800 });
    this.modeLamp.setFillStyle(0x333333);

    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
    this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });

    const title = this.add.text(640, 240, "PRESS SEIZED", { font: "bold 40px Arial", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
    this.tweens.add({
      targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut",
      onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }),
    });
    this.add.text(640, 310, `Score: ${this.score}`, { font: "20px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
    this.add.text(640, 350, `Rounds Completed: ${this.currentRound} / ${ROUNDS.length}`, { font: "16px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);

    this._makeButton(640, 420, "RESTART THE PRESS", 220, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearRound();
    this.hideBubble();

    const accuracy = this.correctFirstTry / ROUNDS.length;
    try { GameManager.completeLevel(30, Math.round(accuracy * 100)); } catch (_) {}
    try { BadgeSystem.unlock("case_methods_schema"); } catch (_) {}
    try {
      localStorage.setItem("level31_results", JSON.stringify({
        level: 31, concept: "string_case_methods", phase: "accretion",
        score: this.score, accuracy, avgTime: Math.round(this.totalTime / ROUNDS.length),
        comboMax: this.maxCombo, stars: this._starRating(accuracy),
        livesRemaining: this.lives, attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.celebrationDrumRoll().then(() => { if (this._alive) this.showScoreTally(accuracy); });
  }

  _starRating(accuracy) {
    if (accuracy >= 0.9) return 3;
    if (accuracy >= 0.7) return 2;
    return 1;
  }

  showScoreTally(accuracy) {
    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
    this.tweens.add({ targets: ov, fillAlpha: 0.85, duration: 500 });

    const panel = this.add.graphics().setDepth(90);
    panel.fillStyle(0x131019, 1);
    panel.fillRoundedRect(360, 150, 560, 420, 16);
    panel.lineStyle(2, C_PURPLE, 1);
    panel.strokeRoundedRect(360, 150, 560, 420, 16);

    const title = this.add.text(640, 200, "PRESSING COMPLETE", { font: "bold 34px Arial", color: HEX_GREEN }).setOrigin(0.5).setDepth(91).setScale(0);
    this.tweens.add({ targets: title, scale: 1, duration: 350, ease: "Back.easeOut" });

    const avgTime = (this.totalTime / ROUNDS.length / 1000).toFixed(1);
    const lines = [`ACCURACY: ${Math.round(accuracy * 100)}%`, `BEST COMBO: ×${this.maxCombo}`, `AVG TIME: ${avgTime}s`];
    lines.forEach((s, i) => {
      const t = this.add.text(500, 260 + i * 30, s, { font: "14px Arial", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 250, delay: 300 + i * 150 });
    });
    const totalText = this.add.text(500, 260 + 3 * 30, "TOTAL: 0", { font: "bold 24px Arial", color: HEX_AMBER }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: totalText, alpha: 1, duration: 250, delay: 900 });
    const counter = { v: 0 };
    this.tweens.add({ targets: counter, v: this.score, duration: 1000, delay: 900, onUpdate: () => totalText.setText(`TOTAL: ${Math.round(counter.v)}`) });

    const stars = this._starRating(accuracy);
    for (let i = 0; i < 3; i++) {
      const earned = i < stars;
      const s = this.add.text(640 + (i - 1) * 60, 385, "★", { font: "40px Arial", color: earned ? HEX_AMBER : "#2a3040" }).setOrigin(0.5).setDepth(91).setScale(0);
      this.tweens.add({ targets: s, scale: 1, duration: 250, delay: 1500 + i * 200, ease: earned ? "Back.easeOut" : "Cubic.easeOut" });
    }

    const badge = this.add.container(640, 470).setDepth(91).setAlpha(0);
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillCircle(0, 0, 30);
    bg.lineStyle(2, C_AMBER, 1);
    bg.strokeCircle(0, 0, 30);
    bg.lineStyle(2, C_PURPLE, 1);
    bg.strokeRect(-14, -10, 28, 20);
    bg.fillStyle(C_AMBER, 1);
    bg.fillRect(-6, -4, 12, 8);
    badge.add(bg);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 2100 });
    const badgeLbl = this.add.text(640, 508, "CASE METHODS SCHEMA ACQUIRED", { font: "bold 12px Arial", color: HEX_AMBER }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: badgeLbl, alpha: 1, duration: 300, delay: 2200 });

    this._makeButton(500, 540, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(760, 540, "NEXT: Press Gauntlet →", 240, 44, { fill: 0x00733a, stroke: C_GREEN, textColor: "#ffffff" }, () => {
      if (this.scene.get("Level32Scene")) this.scene.start("Level32Scene");
      else this.scene.start("MenuScene");
    });
  }

  _makeButton(x, y, label, w, h, style, onClick, depth = 92) {
    const c = this.add.container(x, y).setDepth(depth);
    const g = this.add.graphics();
    const draw = (hover) => {
      g.clear();
      if (style.fill !== undefined) {
        g.fillStyle(style.fill, hover ? 1 : 0.9);
        g.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2);
      }
      g.lineStyle(hover ? 2.5 : 1.5, style.stroke, 1);
      g.strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2);
    };
    draw(false);
    const t = this.add.text(0, 0, label, { font: "bold 15px Arial", color: style.textColor }).setOrigin(0.5);
    c.add([g, t]);
    c.setSize(w, h);
    c.setInteractive({ useHandCursor: true });
    c.on("pointerover", () => { draw(true); c.setScale(1.04); });
    c.on("pointerout", () => { draw(false); c.setScale(1); });
    c.on("pointerdown", onClick);
    return c;
  }
}
