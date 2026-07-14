/**
 * Level 43 — "The Composing Room" (Output Methods: Accretion Phase —
 * printf() opens the third and final Output Wing trilogy)
 * ===========================================================================
 * Teaches System.out.printf(): a format-string template with typed
 * placeholder SLOTS (%s, %d, %f, %.Nf, %n) filled by arguments in order.
 * Reuses the Output Wing's Broadcast Log with its prominent cursor (L40
 * lineage) — printf shares print()'s no-auto-newline behavior exactly.
 *
 * parseFormatString()/evaluatePrintf() are an honest parser+evaluator:
 * the format string is scanned left-to-right into literal/slot segments;
 * each slot consumes the next argument in order and validates its type
 * (%d demands int, %f demands int/double, %s accepts anything via
 * toString); a mismatch is a genuine computed crash, not a scripted one.
 * Precision (%.Nf) uses real half-up rounding via toFixed() — verified by
 * hand against every test value in this level's rounds to confirm none
 * hit JS's floating-point toFixed() edge cases.
 *
 * DESIGN NOTE: a malformed specifier like %.2d (precision on a non-float
 * specifier) is a genuine Java runtime exception (IllegalFormatPrecision-
 * Exception) — the parser explicitly detects this and reports it as a
 * failure rather than silently falling back to printing "%.2d" as literal
 * text, which sequentially first draft would have masked test intent.
 */

import Phaser from "phaser";
import { GameManager } from "../../../GameManager.js";
import { BadgeSystem } from "../../../BadgeSystem.js";

const W = 1280, H = 720;

const C_CYAN = 0x00e5ff, C_GOLD = 0xffd740, C_ORANGE = 0xff9800, C_VIOLET = 0x7b1fa2;
const C_GREEN_BRIGHT = 0x00e676, C_RED = 0xf44336, C_GRAY = 0x78909c;
const C_PARCHMENT = 0xe8dfc8, C_MAGENTA = 0xff4081, C_BRASS = 0xc8a05a;
const HEX_CYAN = "#4fc3f7", HEX_GOLD = "#ffd740", HEX_ORANGE = "#ff9800", HEX_VIOLET = "#7b1fa2";
const HEX_GREEN_BRIGHT = "#00e676", HEX_RED = "#f44336", HEX_GRAY = "#78909c";
const HEX_PARCHMENT = "#e8dfc8", HEX_MAGENTA = "#ff4081", HEX_BRASS = "#c8a05a";

const TRAY_X0 = 60, TRAY_X1 = 700, TRAY_Y = 255;
const CASE_X0 = 40, CASE_X1 = 720, CASE_Y = 425;
const LOG_X = 750, LOG_Y = 96, LOG_W = 490, LOG_H = 500;
const LOG_CONTENT_Y0 = LOG_Y + 44;
const ROW_H = 30;
const LOG_TEXT_X = LOG_X + 38;
const SRC_Y = 108;
const TUTORIAL_KEY = "level43_tutorial_done";

// ══════════════════════════════════════════════════════════════
// ROUND CONFIGURATION
// ══════════════════════════════════════════════════════════════
const ROUNDS = [
  { round: 1, type: "predict", source: ['System.out.printf("Hi %s!", "Bit");'],
    question: "What appears on the log?", correct: "Hi Bit!",
    options: [
      { value: "Hi Bit!", tag: null },
      { value: "Hi %s!", tag: "format_specifier_prints_literally_belief" },
      { value: 'Hi "Bit"!', tag: "quotes_print_belief" },
      { value: "Hi bit!", tag: "case_change_belief" },
    ], concept: "basic_s_substitution" },

  { round: 2, type: "predict", source: ['System.out.printf("Age: %d", 42);'],
    question: "What appears on the log?", correct: "Age: 42",
    options: [
      { value: "Age: 42", tag: null },
      { value: "Age: %d", tag: "format_specifier_prints_literally_belief" },
      { value: "Age: 42.0", tag: "int_becomes_double_belief" },
      { value: "Age: 42⏎", tag: "printf_adds_newline_belief" },
    ], concept: "basic_d_substitution" },

  { round: 3, type: "predict", source: ['System.out.printf("%s is %d", "Bit", 5);'],
    question: "What appears on the log?", correct: "Bit is 5",
    options: [
      { value: "Bit is 5", tag: null },
      { value: "5 is Bit", tag: "argument_order_reversed_belief" },
      { value: "%s is %d", tag: "format_specifier_prints_literally_belief" },
      { value: "Bit is Bit", tag: "same_arg_used_twice_belief" },
    ],
    revealNote: "Two slots, two slugs, matched in ORDER — arg1 to slot1, arg2 to slot2.",
    concept: "two_placeholders_ordered" },

  { round: 4, type: "predict", source: ['System.out.printf("%s scored %d/%d", "Kai", 42, 50);'],
    question: "What appears on the log?", correct: "Kai scored 42/50",
    options: [
      { value: "Kai scored 42/50", tag: null },
      { value: "Kai scored 50/42", tag: "argument_order_reversed_belief" },
      { value: "42 scored Kai/50", tag: "argument_order_scrambled_belief" },
      { value: "Kai scored %d/%d", tag: "format_specifier_prints_literally_belief" },
    ], concept: "three_placeholders_ordered" },

  { round: 5, type: "predict", source: ['System.out.printf("%s%s", "hi", "bit");'],
    question: "What appears on the log?", correct: "hibit",
    options: [
      { value: "hibit", tag: null },
      { value: "hi bit", tag: "space_between_specifiers_belief" },
      { value: "%s%s", tag: "format_specifier_prints_literally_belief" },
      { value: 'hi"bit"', tag: "quotes_print_belief" },
    ],
    revealNote: "Two cyan slots side by side, no letters between them — the values fuse edge to edge.",
    concept: "adjacent_placeholders" },

  { round: 6, type: "predict", source: ['System.out.printf("A");', 'System.out.printf("B");'],
    question: "What appears on the log?", correct: "AB",
    options: [
      { value: "AB", label: "AB on ONE line", tag: null },
      { value: "A⏎B", label: "A / B (two lines)", tag: "printf_adds_newline_belief" },
      { value: "A B", tag: "space_between_calls_belief" },
      { value: "B", tag: "last_overwrites_belief" },
    ],
    revealNote: "Two printf calls, one line — just like print! No auto-newline.",
    concept: "printf_no_auto_newline" },

  { round: 7, type: "predict", source: ['System.out.printf("%.2f", 3.14159);'],
    question: "What appears on the log?", correct: "3.14",
    options: [
      { value: "3.14", tag: null },
      { value: "3.14159", tag: "precision_ignored_belief" },
      { value: "3.1", tag: "precision_off_by_one_belief" },
      { value: "3", tag: "precision_removes_all_decimals_belief" },
    ],
    revealNote: "The precision marker '.2' trims the extra digits (159) — %.2f always shows two decimal places.",
    concept: "precision_truncation" },

  { round: 8, type: "predict", source: ['System.out.printf("A%nB");'],
    question: "What appears on the log AND where is the cursor?", correct: "A_row01_B_row02_cursor_end_B",
    options: [
      { value: "A_row01_B_row02_cursor_end_B", label: "A / B (cursor at end of B on row 02)", tag: null },
      { value: "A_percent_n_B_row01", label: "A%nB literal (one row)", tag: "format_specifier_prints_literally_belief" },
      { value: "AB_row01", label: "AB (one row)", tag: "n_specifier_ignored_belief" },
      { value: "A_row01_B_row02_cursor_row03", label: "A / B / cursor row 03", tag: "printf_adds_newline_belief" },
    ],
    revealNote: "The %n slot auto-fills with ⏎. A on row 01, cursor jumps, B on row 02. No final auto-newline — cursor rests at end of B.",
    concept: "n_specifier_newline" },

  { round: 9, type: "predict", source: ['System.out.printf("%d", "hello");'],
    question: "What happens?", correct: "runtime_crash",
    options: [
      { value: "runtime_crash", label: "IllegalFormatConversionException (crash)", tag: null },
      { value: "hello", tag: "type_mismatch_returns_value_belief" },
      { value: "0", tag: "type_mismatch_returns_zero_belief" },
      { value: "%d", tag: "format_specifier_prints_literally_belief" },
    ],
    revealNote: "String slug approaches the gold %d slot, the slot flares red and rejects — the same choreography as Scanner's InputMismatchException.",
    concept: "type_mismatch_crash" },

  { round: 10, type: "command", sourceTemplate: ["String name = ____;", "System.out.printf(<slot:format>, name);"],
    mission: "Compose a greeting: 'Welcome, <name>!'",
    slots: [{ id: "format" }], argType: "String",
    cartridges: [
      { code: '"Welcome, %s!"', correct: true },
      { code: '"Welcome, name!"', tag: "variable_as_literal_belief" },
      { code: '"Welcome, %d!"', tag: "wrong_specifier_for_type" },
      { code: '"Welcome, %s"', tag: "missing_content", label: '"Welcome, %s" (no !)' },
    ],
    tests: [
      { subs: { name: '"Anjana"' }, expectedOutput: "Welcome, Anjana!" },
      { subs: { name: '"Bit"' }, expectedOutput: "Welcome, Bit!" },
      { subs: { name: '""' }, expectedOutput: "Welcome, !" },
    ], concept: "command_s_greeting" },

  { round: 11, type: "command", sourceTemplate: ["double price = ____;", "System.out.printf(<slot:format>, price);"],
    mission: "Compose a price display: '$<price with 2 decimals>' (e.g., '$3.14')",
    slots: [{ id: "format" }], argType: "double",
    cartridges: [
      { code: '"$%.2f"', correct: true },
      { code: '"$%f"', tag: "precision_missing", label: '"$%f" (no precision)' },
      { code: '"$%.2d"', tag: "wrong_specifier_for_precision" },
      { code: '"$%d"', tag: "wrong_specifier_for_type" },
    ],
    tests: [
      { subs: { price: "3.14159" }, expectedOutput: "$3.14" },
      { subs: { price: "100.5" }, expectedOutput: "$100.50" },
      { subs: { price: "0.999" }, expectedOutput: "$1.00" },
    ],
    postMissionNote: "%.2f is a slot that ALWAYS shows 2 decimals — trim, pad, or round as needed.",
    concept: "command_precision_price" },

  { round: 12, type: "command", sourceTemplate: ["int items = ____;", "int total = ____;", "System.out.printf(<slot:format>, items, total);"],
    mission: "Compose two lines: 'Items: <items>' then 'Total: <total>'",
    slots: [{ id: "format" }], argType: "int,int",
    cartridges: [
      { code: '"Items: %d%nTotal: %d"', correct: true },
      { code: '"Items: %d\\nTotal: %d"', correct: true, alsoCorrect: true, label: '"Items: %d\\nTotal: %d"' },
      { code: '"Items: %d Total: %d"', tag: "newline_missing", label: '"Items: %d Total: %d" (one line)' },
      { code: '"Items: items%nTotal: total"', tag: "variable_as_literal_belief" },
    ],
    tests: [
      { subs: { items: "5", total: "150" }, expectedOutput: "Items: 5⏎Total: 150" },
      { subs: { items: "0", total: "0" }, expectedOutput: "Items: 0⏎Total: 0" },
    ],
    postMissionNote: "Both %n and \\n break lines in printf — %n is platform-independent; \\n is always LF. Either wins in beginner Java.",
    concept: "command_two_lines_with_newline" },
];

const MISCONCEPTION_FEEDBACK = {
  format_specifier_prints_literally_belief: "The specifier IS the slot — it never prints. It becomes whatever slug fills it.",
  printf_adds_newline_belief: "printf works like print, NOT like println. The cursor rested where the text ended. Add %n or \\n for a newline.",
  argument_order_reversed_belief: "Slugs match slots by POSITION, always. arg1 fills the first slot; arg2 fills the second.",
  argument_order_scrambled_belief: "Position is destiny in printf. Every argument goes to its numbered slot in order.",
  space_between_specifiers_belief: "printf doesn't insert spaces. %s%s means TWO slots back to back — put a space in the format string if you want one.",
  space_between_calls_belief: "Consecutive printf calls extend the same line, cursor to cursor. No spaces, no newlines.",
  last_overwrites_belief: "The log doesn't erase — it extends. Every printf() call adds MORE text.",
  precision_ignored_belief: "The precision marker '.2' trims the extra digits! %.2f means TWO decimal places, always.",
  precision_off_by_one_belief: "Read the specifier — '.2' means TWO decimals, not one.",
  precision_removes_all_decimals_belief: "%.2f keeps two decimals — it doesn't strip them all. %.0f would remove decimals entirely.",
  n_specifier_ignored_belief: "%n is a real slot — a newline slot. It doesn't need a slug, but it definitely fires.",
  type_mismatch_returns_value_belief: "A wrong-type slug doesn't just carry on — it CRASHES the program. IllegalFormatConversionException, no fallback.",
  type_mismatch_returns_zero_belief: "printf never quietly substitutes zero or defaults. Wrong type = runtime exception, program down.",
  int_becomes_double_belief: "%d prints an int as an int — no decimals appear. %f prints doubles with decimals.",
  wrong_specifier_for_type: "The slot demanded the wrong type — check the report. %d needs an int; %f needs a double.",
  wrong_specifier_for_precision: "Precision (.N) is a FLOATING-POINT feature — it only makes sense on %f. %.2d isn't valid; the runtime rejects it.",
  precision_missing: "Without precision, %f uses its default (6 decimals). Add .N to control the count: %.2f for 2.",
  newline_missing: "The mission needed TWO lines — insert %n or \\n where you want the break.",
  variable_as_literal_belief: "A bare word inside the format string is TEXT — those exact letters. Use a %s or %d slot to insert the variable's VALUE.",
  same_arg_used_twice_belief: "Each slug fills exactly ONE slot, in order. No re-use.",
  missing_content: "printf composes EXACTLY what you type. Every character in the format string except specifiers is literal.",
  quotes_print_belief: "The quotes wrap the String in your code — on the log, only the value between them appears.",
  case_change_belief: "printf never changes case. What you passed is what lands.",
  missing_argument_belief: "Every slot needs a slug (except %n). Fewer arguments than specifiers throws MissingFormatArgumentException.",
};

export class Level43Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level43Scene" });
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
    this.rows = [""];
    this.cursorRowIdx = 0;
    this.rowObjs = [];
    this.inputLocked = true;
    this.gameEnded = false;
    this._alive = true;
    this._bubble = null;
    this.slotContents = {};
    this.slotDefs = {};
    this.cartridges = [];
    this._dragHoverSlotKey = null;
    this._commandFirstFail = true;
    this._firstPrecisionAnnotationShown = false;
    this._firstNewlineAnnotationShown = false;
  }

  preload() {}

  create() {
    this._alive = true;
    this.events.once("shutdown", () => { this._alive = false; });

    const cam = this.cameras.main;
    const zoom = Math.min(this.scale.width / W, this.scale.height / H);
    cam.setZoom(zoom);
    cam.centerOn(W / 2, H / 2);
    cam.setBackgroundColor("#0f0a06");

    try { GameManager.incrementAttempt(42); } catch (_) {}

    this.createParticleTexture();
    this.createBackground();
    this.createRoomDecor();
    this.createComposingTray();
    this.createTypeCase();
    this.createBroadcastLog();
    this.createSourceDisplay();
    this.createHUD();
    this.createExpressionMonitor();
    this.createParticles();
    this.createBit();
    this.setupDragEvents();

    cam.fadeIn(700, 3, 3, 5);
    this.checkTutorial();
  }

  update(time, delta) {
    this.updateParticles(time, delta);
    this.updateSlotPulse(time);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // BACKGROUND / ROOM
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l43_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l43_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x0f0a06).setDepth(0);
  }

  createRoomDecor() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x1a1108, 0.35);
    for (let row = 0; row < 6; row++) {
      for (let x = (row % 2) * 22; x < W; x += 44) g.fillRoundedRect(x, row * 18, 40, 14, 2);
    }
    [[220, 360], [780, 920]].forEach(([x0]) => {
      for (let i = 0; i < 5; i++) {
        g.fillStyle(0x1a1108, 1);
        g.lineStyle(1, 0x3a2618, 0.4);
        g.fillRect(x0, 20 + i * 26, 130, 22);
        g.strokeRect(x0, 20 + i * 26, 130, 22);
      }
    });

    const clock = this.add.container(610, 96).setDepth(2);
    const ring = this.add.graphics();
    ring.lineStyle(2, 0x3a2618, 0.5);
    ring.strokeCircle(0, 0, 22);
    this.clockMinute = this.add.graphics();
    clock.add([ring, this.clockMinute]);

    const banner = this.add.graphics().setDepth(2);
    banner.fillStyle(0x1a1108, 1);
    banner.lineStyle(1, 0x8a6435, 0.4);
    banner.fillRoundedRect(230, 12, 340, 28, 5);
    banner.strokeRoundedRect(230, 12, 340, 28, 5);
    this.add.text(400, 26, "COMPOSING ROOM", { font: "bold 14px Georgia", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.6).setDepth(3);

    const floor = this.add.graphics().setDepth(1);
    floor.fillStyle(0x1a1108, 1);
    floor.fillRect(0, 635, W, 85);
    floor.lineStyle(2, 0x3a2618, 1);
    floor.lineBetween(0, 637, W, 637);
  }

  createParticles() {
    this.ambient = [];
    const colors = [0xc8a05a, 0x8a6435, 0xa89078];
    for (let i = 0; i < 9; i++) {
      this.ambient.push(this.add.circle(Phaser.Math.Between(0, W), Phaser.Math.Between(150, 630), 1, Phaser.Utils.Array.GetRandom(colors), Phaser.Math.FloatBetween(0.03, 0.06)).setDepth(2));
    }
  }

  updateParticles(time, delta) {
    if (!this.ambient) return;
    const step = 0.012 * (delta / 16.7);
    this.ambient.forEach((p, i) => {
      p.y += step;
      p.x += Math.sin(time * 0.0005 + i) * 0.03;
      if (p.y > 630) { p.y = 150; p.x = Phaser.Math.Between(0, W); }
    });
    if (this.clockMinute) {
      const a = time * 0.00006;
      this.clockMinute.clear();
      this.clockMinute.lineStyle(2, HEX_BRASS === "#c8a05a" ? 0xc8a05a : 0xc8a05a, 0.35);
      this.clockMinute.lineBetween(0, 0, Math.cos(a - Math.PI / 2) * 15, Math.sin(a - Math.PI / 2) * 15);
    }
  }

  // ══════════════════════════════════════════════════════════════
  // COMPOSING TRAY
  // ══════════════════════════════════════════════════════════════

  createComposingTray() {
    const g = this.add.graphics().setDepth(4);
    g.fillStyle(0x241a10, 1);
    g.fillRoundedRect(40, 165, 680, 190, 8);
    g.lineStyle(3, 0x8a6435, 1);
    g.strokeRoundedRect(40, 165, 680, 190, 8);
    const inner = this.add.graphics().setDepth(5);
    inner.fillStyle(0x1a1108, 1);
    inner.strokeRoundedRect(60, 185, 640, 140, 6);
    inner.fillRoundedRect(60, 185, 640, 140, 6);
    this.trayLabel = this.add.text(50, 172, "COMPOSING TRAY", { font: "bold 10px Georgia", color: HEX_BRASS }).setAlpha(0.7).setDepth(6);
    this.trayContainer = this.add.container(0, 0).setDepth(7);
  }

  clearTray() { this.trayContainer.removeAll(true); }

  updateSlotPulse() {}

  // ══════════════════════════════════════════════════════════════
  // TYPE CASE
  // ══════════════════════════════════════════════════════════════

  createTypeCase() {
    const g = this.add.graphics().setDepth(4);
    g.fillStyle(0x1a1108, 1);
    g.fillRoundedRect(40, 380, 680, 90, 6);
    g.lineStyle(2, 0x8a6435, 0.5);
    g.strokeRoundedRect(40, 380, 680, 90, 6);
    this.add.text(50, 387, "TYPE CASE", { font: "bold 10px Georgia", color: HEX_BRASS }).setAlpha(0.7).setDepth(5);
    this.caseContainer = this.add.container(0, 0).setDepth(6);
  }

  clearCase() { this.caseContainer.removeAll(true); }

  _slotColor(specifier) {
    switch (specifier) {
      case "s": return HEX_CYAN;
      case "d": return HEX_GOLD;
      case "f": return HEX_ORANGE;
      case "n": return HEX_VIOLET;
      default: return HEX_GRAY;
    }
  }
  _slotColorInt(specifier) {
    switch (specifier) {
      case "s": return C_CYAN;
      case "d": return C_GOLD;
      case "f": return C_ORANGE;
      case "n": return C_VIOLET;
      default: return C_GRAY;
    }
  }

  // ══════════════════════════════════════════════════════════════
  // BROADCAST LOG + CURSOR (L40 lineage)
  // ══════════════════════════════════════════════════════════════

  createBroadcastLog() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x08111c, 1);
    g.fillRoundedRect(LOG_X, LOG_Y, LOG_W, LOG_H, 12);
    g.lineStyle(2, C_CYAN, 1);
    g.strokeRoundedRect(LOG_X, LOG_Y, LOG_W, LOG_H, 12);
    for (let y = LOG_Y + 4; y < LOG_Y + LOG_H - 4; y += 4) {
      g.lineStyle(1, 0x0a1520, 0.3);
      g.lineBetween(LOG_X + 4, y, LOG_X + LOG_W - 4, y);
    }
    const header = this.add.graphics().setDepth(11);
    header.fillStyle(0x0a1830, 1);
    header.fillRoundedRect(LOG_X, LOG_Y, LOG_W, 44, { tl: 12, tr: 12, bl: 0, br: 0 });
    this.logLed = this.add.circle(LOG_X + 20, LOG_Y + 22, 5, C_RED).setDepth(12);
    this.add.text(LOG_X + 40, LOG_Y + 22, "BROADCAST LOG", { font: "bold 11px Arial", color: "#00e5ff" }).setOrigin(0, 0.5).setDepth(12);
    this.add.text(LOG_X + LOG_W - 15, LOG_Y + 22, "CH 01", { font: "10px Arial", color: HEX_GRAY }).setOrigin(1, 0.5).setDepth(12);

    const maskShape = this.make.graphics({ x: 0, y: 0, add: false });
    maskShape.fillRoundedRect(LOG_X + 4, LOG_CONTENT_Y0, LOG_W - 8, LOG_Y + LOG_H - LOG_CONTENT_Y0 - 6, 6);
    this.logMask = maskShape.createGeometryMask();
    this.logLayer = this.add.container(0, 0).setDepth(13);
    this.logLayer.setMask(this.logMask);

    this.rows = [""];
    this.cursorRowIdx = 0;
    this.rowObjs = [];
    this.renderLogFromScratch();
    this.cursorGlow = this.add.rectangle(0, 0, 16, 26, C_CYAN, 0.15);
    this.cursorBlock = this.add.rectangle(0, 0, 12, 22, C_CYAN, 0.75);
    this.logLayer.add([this.cursorGlow, this.cursorBlock]);
    this.tweens.add({ targets: [this.cursorBlock, this.cursorGlow], alpha: 0.1, duration: 700, yoyo: true, repeat: -1 });
    this.updateCursorVisualPosition();
  }

  flashLed() {
    this.logLed.setFillStyle(C_GREEN_BRIGHT, 1);
    this.time.delayedCall(300, () => { if (this.logLed.active) this.logLed.setFillStyle(C_RED, 1); });
  }

  _rowY(i) { return LOG_CONTENT_Y0 + 16 + i * ROW_H; }

  renderLogFromScratch() {
    this.rowObjs.forEach((r) => { r.numT.destroy(); r.textT.destroy(); });
    this.rowObjs = [];
    this.rows.forEach((rowStr, i) => {
      const y = this._rowY(i);
      const numT = this.add.text(LOG_X + 10, y, String(i + 1).padStart(2, "0"), { font: "11px Courier New", color: "#3d4450" }).setOrigin(0, 0.5);
      const textT = this.add.text(LOG_TEXT_X, y, this._displayRow(rowStr), { font: "bold 16px Courier New", color: HEX_CYAN }).setOrigin(0, 0.5);
      this.logLayer.add([numT, textT]);
      this.rowObjs.push({ numT, textT });
    });
  }

  _displayRow(rowStr) { return rowStr.replace(/ /g, "␣"); }

  ensureRow(idx) {
    while (this.rowObjs.length <= idx) {
      const i = this.rowObjs.length;
      const y = this._rowY(i);
      const numT = this.add.text(LOG_X + 10, y, String(i + 1).padStart(2, "0"), { font: "11px Courier New", color: "#3d4450" }).setOrigin(0, 0.5);
      const textT = this.add.text(LOG_TEXT_X, y, "", { font: "bold 16px Courier New", color: HEX_CYAN }).setOrigin(0, 0.5).setAlpha(0);
      this.tweens.add({ targets: textT, alpha: 1, duration: 150 });
      this.logLayer.add([numT, textT]);
      this.rowObjs.push({ numT, textT });
    }
  }

  updateCursorVisualPosition() {
    if (!this.rowObjs[this.cursorRowIdx]) return;
    const rowText = this.rowObjs[this.cursorRowIdx].textT;
    this.cursorBlock.setPosition(LOG_TEXT_X + rowText.width + 2, this._rowY(this.cursorRowIdx));
    this.cursorGlow.setPosition(LOG_TEXT_X + rowText.width + 2, this._rowY(this.cursorRowIdx));
  }

  cursorSparkle() {
    const p = this.add.particles(this.cursorBlock.x, this.cursorBlock.y, "l43_dot", {
      speed: { min: 25, max: 60 }, angle: { min: 0, max: 360 }, scale: { start: 0.45, end: 0 }, lifespan: 180,
      tint: [C_CYAN], emitting: false,
    }).setDepth(20);
    this.logLayer.add(p);
    p.explode(4);
    this.time.delayedCall(280, () => p.destroy());
  }

  /** Types text at the cursor (printf's ground truth), breaking rows at
   * real newline chars (from \n or %n). printf never forces a trailing
   * newline — identical to print()'s cursor semantics. */
  async typeAtCursor(text, styleType) {
    const color = styleType === "compose" ? HEX_PARCHMENT : this._slotColor(styleType);
    for (const ch of text) {
      if (!this._alive) return;
      if (ch === "\n") {
        if (!this._firstNewlineAnnotationShown) {
          this._firstNewlineAnnotationShown = true;
          this.createAnnotation(this.cursorBlock.x, this.cursorBlock.y - 26, "%n / \\n → newline", HEX_VIOLET);
        }
        this.cursorSparkle();
        this.rows.push("");
        this.cursorRowIdx++;
        this.ensureRow(this.cursorRowIdx);
        this.updateCursorVisualPosition();
        await this.delay(35);
        continue;
      }
      this.rows[this.cursorRowIdx] += ch;
      this.rowObjs[this.cursorRowIdx].textT.setColor(HEX_PARCHMENT).setText(this._displayRow(this.rows[this.cursorRowIdx]));
      this.updateCursorVisualPosition();
      await this.delay(10);
    }
    this.cursorSparkle();
  }

  clearLog() {
    return new Promise((res) => {
      const wipe = this.add.rectangle(LOG_X + LOG_W / 2, LOG_CONTENT_Y0, LOG_W, 0, 0x08111c, 1).setOrigin(0.5, 0);
      this.logLayer.add(wipe);
      this.tweens.add({
        targets: wipe, height: LOG_Y + LOG_H - LOG_CONTENT_Y0, duration: 300, ease: "Cubic.easeIn",
        onComplete: () => {
          this.rowObjs.forEach((r) => { r.numT.destroy(); r.textT.destroy(); });
          this.rowObjs = [];
          wipe.destroy();
          this.rows = [""];
          this.cursorRowIdx = 0;
          this.renderLogFromScratch();
          this.updateCursorVisualPosition();
          res();
        },
      });
    });
  }

  // ══════════════════════════════════════════════════════════════
  // SOURCE DISPLAY / EXPRESSION MONITOR
  // ══════════════════════════════════════════════════════════════

  createSourceDisplay() {
    this.sourceContainer = this.add.container(0, 0).setDepth(15);
  }

  _syntaxTokenize(line) {
    const tokens = [];
    const re = /(%\.\d+f|%[sdfcbn])|(\\[nt])|("(?:[^"\\]|\\.)*")|(\bSystem\.out\b)|(\.)|(\bprintf\b)|([(){};=])/g;
    let last = 0, m;
    const plain = (t) => t && tokens.push({ t, c: "#e0e0e0" });
    while ((m = re.exec(line))) {
      if (m.index > last) plain(line.slice(last, m.index));
      if (m[1]) { const spec = m[1].match(/[sdfcbn]$/)[0]; tokens.push({ t: m[1], c: this._slotColor(spec) }); }
      else if (m[2]) tokens.push({ t: m[2], c: HEX_MAGENTA });
      else if (m[3]) {
        const inner = m[3];
        const parts = inner.split(/(%\.\d+f|%[sdfcbn]|\\[nt])/);
        parts.forEach((p) => {
          if (/^%\.\d+f$|^%[sdfcbn]$/.test(p)) { const spec = p.match(/[sdfcbn]$/)[0]; tokens.push({ t: p, c: this._slotColor(spec) }); }
          else if (/^\\[nt]$/.test(p)) tokens.push({ t: p, c: HEX_MAGENTA });
          else if (p) tokens.push({ t: p, c: HEX_CYAN });
        });
      } else if (m[4]) tokens.push({ t: m[4], c: "#4caf50" });
      else if (m[5]) tokens.push({ t: m[5], c: "#78909c" });
      else if (m[6]) tokens.push({ t: m[6], c: "#ffd740" });
      else if (m[7]) tokens.push({ t: m[7], c: "#ff4081" });
      last = m.index + m[0].length;
    }
    if (last < line.length) plain(line.slice(last));
    return tokens.length ? tokens : [{ t: line, c: "#e0e0e0" }];
  }

  updateSourceDisplay(lines) {
    this.sourceContainer.removeAll(true);
    const fontSize = lines.length > 2 ? 12 : 14;
    lines.forEach((line, i) => {
      const tokens = this._syntaxTokenize(line);
      const measured = tokens.map((t) => { const tmp = this.add.text(0, 0, t.t, { font: `bold ${fontSize}px Courier New` }); const w = tmp.width; tmp.destroy(); return w; });
      const totalW = measured.reduce((a, b) => a + b, 0);
      let x = 380 - totalW / 2;
      const y = SRC_Y + i * (fontSize + 6) - ((lines.length - 1) * (fontSize + 6)) / 2;
      tokens.forEach((tok, ti) => {
        const t = this.add.text(x, y, tok.t, { font: `bold ${fontSize}px Courier New`, color: tok.c }).setOrigin(0, 0.5);
        this.sourceContainer.add(t);
        x += measured[ti];
      });
    });
  }

  createExpressionMonitor() {
    const g = this.add.graphics().setDepth(50);
    g.fillStyle(0x1a1108, 1);
    g.fillRoundedRect(W / 2 - 200, 10, 400, 44, 8);
    g.lineStyle(1, 0x3a2618, 1);
    g.strokeRoundedRect(W / 2 - 200, 10, 400, 44, 8);
    this.monitorText = this.add.text(W / 2, 32, "", { font: "13px Courier New", color: "#e8dfc8" }).setOrigin(0.5).setDepth(51);
  }

  updateExpressionMonitor(text) {
    this.monitorText.setText(text);
    this.monitorText.setFontSize(this.monitorText.width > 380 ? 11 : 13);
  }

  showCompileErrorStamp() {
    const stamp = this.add.text(380, TRAY_Y, "COMPILE ERROR", { font: "bold 22px Arial", color: HEX_RED }).setOrigin(0.5).setDepth(80).setScale(1.6).setAngle(-6).setAlpha(0);
    this.trayContainer.add(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 200 });
    this.screenShake(0.004, 160);
    this.time.delayedCall(1200, () => { if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 220, onComplete: () => stamp.destroy() }); });
  }

  async showTrayErrorStamp(text) {
    const stamp = this.add.text(380, TRAY_Y, text, { font: "bold 14px Courier New", color: HEX_RED }).setOrigin(0.5).setDepth(80).setAngle(-8).setAlpha(0);
    this.trayContainer.add(stamp);
    this.tweens.add({ targets: stamp, alpha: 1, duration: 200 });
    this.tweens.killTweensOf(this.trayLabel);
    this.trayLabel.setColor(HEX_RED);
    this.time.delayedCall(800, () => { if (this.trayLabel.active) this.trayLabel.setColor(HEX_BRASS); });
    this.screenShake(0.006, 250);
    await this.delay(1500);
    if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 220, onComplete: () => stamp.destroy() });
  }

  screenShake(intensity = 0.004, duration = 180) {
    this.cameras.main.shake(duration, intensity);
  }

  // ══════════════════════════════════════════════════════════════
  // HUD
  // ══════════════════════════════════════════════════════════════

  createHUD() {
    const g = this.add.graphics().setDepth(49);
    g.fillStyle(0x0f0a06, 0.93);
    g.fillRect(0, 0, W, 64);
    g.lineStyle(1, 0x3a2618, 1);
    g.lineBetween(0, 64, W, 64);

    this.add.text(20, 14, "THE COMPOSING ROOM", { font: "bold 15px Arial", color: "#b0bec5" }).setDepth(50);
    this.add.text(20, 32, "Accretion Phase — Output Methods: printf()", { font: "11px Arial", color: "#546e7a" }).setDepth(50);

    this.add.text(1060, 8, "SCORE", { font: "9px Arial", color: "#546e7a" }).setDepth(50);
    this.scoreText = this.add.text(1060, 20, "0", { font: "bold 18px Arial", color: "#ffffff" }).setDepth(50);
    this.comboText = this.add.text(1060, 42, "×1", { font: "bold 12px Arial", color: HEX_GOLD }).setDepth(50);

    this.lifeIcons = [];
    for (let i = 0; i < 3; i++) {
      const lg = this.add.graphics({ x: 1150 + i * 26, y: 24 }).setDepth(50);
      lg.lineStyle(2, C_BRASS, 1);
      lg.strokeCircle(0, 0, 5);
      lg.lineBetween(3, 3, 7, 7);
      this.lifeIcons.push(lg);
    }
  }

  // ══════════════════════════════════════════════════════════════
  // BIT — compositor variant
  // ══════════════════════════════════════════════════════════════

  createBit() {
    const c = this.add.container(1090, 520).setDepth(60);
    const g = this.add.graphics();
    g.lineStyle(2, 0x78909c, 1);
    g.lineBetween(0, -17, 0, -32);
    g.fillStyle(0x37474f, 1);
    g.fillRoundedRect(-20, -17, 40, 35, 10);
    const tip = this.add.circle(0, -32, 3, C_GOLD);
    const eye = this.add.circle(0, 0, 8, C_CYAN);
    const pupil = this.add.circle(0, 0, 3, 0xffffff);
    const apron = this.add.graphics();
    apron.fillStyle(0x3a2618, 0.7);
    apron.lineStyle(1, 0x8a6435, 0.7);
    apron.fillTriangle(-14, 18, 14, 18, 0, 4);
    const stick = this.add.graphics();
    stick.lineStyle(2, C_BRASS, 0.7);
    stick.lineBetween(18, 5, 26, 5);
    stick.lineBetween(26, 5, 26, -3);
    c.add([g, apron, eye, pupil, tip, stick]);
    this.tweens.add({ targets: tip, alpha: 0.3, duration: 900, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: c, y: "+=3", duration: 2000, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
    this.bit = c;
  }

  bitSay(text) {
    this.hideBubble();
    const inner = this.add.text(0, 0, text, { font: "13px Arial", color: "#e0e0e0", wordWrap: { width: 340 } });
    const bw = Math.min(inner.width, 340) + 30, bh = inner.height + 24;
    inner.setText("");
    const bx = Phaser.Math.Clamp(this.bit.x - bw - 30, 20, W - bw - 20);
    const by = Phaser.Math.Clamp(this.bit.y - bh - 20, 80, H - bh - 20);
    const c = this.add.container(bx, by).setDepth(61).setAlpha(0).setScale(0.7);
    const g = this.add.graphics();
    g.fillStyle(0x1a1a2e, 0.97);
    g.fillRoundedRect(0, 0, bw, bh, 10);
    g.lineStyle(1.5, C_BRASS, 1);
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
        delay: 22, repeat: Math.max(0, text.length - 1),
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
    await this.bitSay(message);
    if (!this._alive) return;
    await Promise.race([this.waitForClick(), this.delay(4000)]);
    this.hideBubble();
  }

  createAnnotation(x, y, text, colorHex) {
    const t = this.add.text(x, y, text, { font: "bold 10px Arial", color: colorHex }).setOrigin(0.5).setDepth(70).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 200 });
    this.time.delayedCall(1800, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() }); });
    return t;
  }

  createFloatingText(x, y, text, colorHex, font = "bold 13px Arial", hold = 1400) {
    const t = this.add.text(x, y, text, { font, color: colorHex, wordWrap: { width: 300 }, align: "center" }).setOrigin(0.5).setDepth(31).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 180 });
    this.time.delayedCall(hold, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() }); });
    return t;
  }

  createConfetti(x, y, count = 30) {
    const p = this.add.particles(x, y, "l43_dot", {
      speed: { min: 80, max: 240 }, angle: { min: 0, max: 360 }, scale: { start: 0.9, end: 0 }, lifespan: 500,
      tint: [C_BRASS, C_GOLD, C_ORANGE, C_CYAN, 0xffffff], emitting: false,
    }).setDepth(75);
    p.explode(count);
    this.time.delayedCall(900, () => p.destroy());
  }

  // ══════════════════════════════════════════════════════════════
  // EVALUATOR — honest format-string parser + printf semantics
  // ══════════════════════════════════════════════════════════════

  _parseDecls(subs) {
    // subs: { name: '"Anjana"' } or { price: '3.14159' } etc — raw source
    // literal text substituted for the skeleton's test placeholders.
    const decls = {};
    if (!subs) return decls;
    Object.keys(subs).forEach((name) => {
      const raw = subs[name];
      if (/^".*"$/.test(raw)) decls[name] = { value: raw.slice(1, -1), type: "string" };
      else if (/^-?\d+\.\d+$/.test(raw)) decls[name] = { value: parseFloat(raw), type: "double" };
      else if (/^-?\d+$/.test(raw)) decls[name] = { value: parseInt(raw, 10), type: "int" };
    });
    return decls;
  }

  /** Scans a format string into literal/slot segments. Returns
   * {ok:false} for a malformed specifier (e.g. %.2d) — a genuine Java
   * runtime exception (IllegalFormatPrecisionException), not literal text. */
  parseFormatString(fmt) {
    const segments = [];
    let i = 0;
    while (i < fmt.length) {
      if (fmt[i] === "%") {
        if (fmt[i + 1] === "n") { segments.push({ type: "slot", specifier: "n" }); i += 2; continue; }
        const precMatch = fmt.slice(i).match(/^%\.(\d+)([a-zA-Z])/);
        if (precMatch) {
          if (precMatch[2] !== "f") return { ok: false };
          segments.push({ type: "slot", specifier: "f", precision: parseInt(precMatch[1], 10) });
          i += precMatch[0].length; continue;
        }
        const simpleMatch = fmt.slice(i).match(/^%([sdfcb])/);
        if (simpleMatch) { segments.push({ type: "slot", specifier: simpleMatch[1] }); i += simpleMatch[0].length; continue; }
        return { ok: false };
      }
      let j = i;
      while (j < fmt.length && fmt[j] !== "%") j++;
      segments.push({ type: "literal", text: fmt.slice(i, j).replace(/\\n/g, "\n") });
      i = j;
    }
    return { ok: true, segments };
  }

  _fmtFixed(value, precision) { return value.toFixed(precision); }

  _toStringForArg(argVal) {
    if (argVal.type === "double") { const r = Math.round(argVal.value * 1e6) / 1e6; return Number.isInteger(r) ? r.toFixed(1) : String(r); }
    if (argVal.type === "boolean") return argVal.value ? "true" : "false";
    return String(argVal.value);
  }

  /** Runs a full printf call honestly: parses the format string, walks
   * segments consuming arguments in order, validates types, applies real
   * precision rounding. Returns {ok, crash, text, steps} where steps
   * drives the tray/case animation. */
  evaluatePrintf(fmtSource, argVals) {
    if (!/^".*"$/.test(fmtSource.trim())) return { ok: false, compileError: true };
    const fmt = fmtSource.trim().slice(1, -1).replace(/\\n/g, "\n");
    const parsed = this.parseFormatString(fmt);
    if (!parsed.ok) return { ok: false, crash: "malformed_specifier" };

    let argIdx = 0, resultText = "";
    const steps = [];
    for (const seg of parsed.segments) {
      if (seg.type === "literal") { resultText += seg.text; steps.push({ type: "literal", text: seg.text }); continue; }
      if (seg.specifier === "n") { resultText += "\n"; steps.push({ type: "n" }); continue; }
      if (argIdx >= argVals.length) return { ok: false, crash: "missing_argument", steps };
      const argVal = argVals[argIdx]; argIdx++;
      if (seg.specifier === "s") {
        const text = this._toStringForArg(argVal);
        resultText += text;
        steps.push({ type: "slot", specifier: "s", text, argType: argVal.type });
      } else if (seg.specifier === "d") {
        if (argVal.type !== "int") return { ok: false, crash: "type_mismatch", steps, argType: argVal.type, specifier: "d" };
        resultText += String(argVal.value);
        steps.push({ type: "slot", specifier: "d", text: String(argVal.value) });
      } else if (seg.specifier === "f") {
        if (argVal.type !== "double" && argVal.type !== "int") return { ok: false, crash: "type_mismatch", steps, argType: argVal.type, specifier: "f" };
        const precision = seg.precision !== undefined ? seg.precision : 6;
        const text = this._fmtFixed(argVal.value, precision);
        resultText += text;
        steps.push({ type: "slot", specifier: "f", text, precision, rawText: String(argVal.value) });
      } else {
        // %c / %b — not deeply exercised in this level's rounds
        const text = this._toStringForArg(argVal);
        resultText += text;
        steps.push({ type: "slot", specifier: seg.specifier, text });
      }
    }
    return { ok: true, text: resultText, steps };
  }

  // ══════════════════════════════════════════════════════════════
  // COMPOSITION ANIMATION — reveal, shared by all rounds
  // ══════════════════════════════════════════════════════════════

  async renderFormatOnTray(fmtDisplaySource) {
    this.clearTray();
    this._traySlots = [];
    const inner = fmtDisplaySource.trim().slice(1, -1);
    let x = TRAY_X0 + 20;
    const y = TRAY_Y;
    let i = 0;
    while (i < inner.length) {
      if (!this._alive) return;
      if (inner[i] === "%" && inner[i + 1] === "n") {
        const slot = this._makeTraySlot("%n", "n", null, x, y);
        x += slot.width + 6;
        await this.delay(60);
        i += 2;
        continue;
      }
      const precMatch = inner.slice(i).match(/^%\.(\d+)f/);
      if (precMatch) {
        const slot = this._makeTraySlot(precMatch[0], "f", precMatch[1], x, y);
        x += slot.width + 6;
        await this.delay(60);
        i += precMatch[0].length;
        continue;
      }
      const simpleMatch = inner.slice(i).match(/^%([sdfcb])/);
      if (simpleMatch) {
        const slot = this._makeTraySlot(simpleMatch[0], simpleMatch[1], null, x, y);
        x += slot.width + 6;
        await this.delay(60);
        i += simpleMatch[0].length;
        continue;
      }
      if (inner[i] === "\\" && inner[i + 1] === "n") {
        const t = this.add.text(x, y, "\\n", { font: "bold 16px Courier New", color: HEX_MAGENTA }).setOrigin(0, 0.5).setAlpha(0);
        this.trayContainer.add(t);
        this.tweens.add({ targets: t, alpha: 1, duration: 100 });
        x += t.width + 2;
        i += 2;
        await this.delay(20);
        continue;
      }
      const ch = inner[i] === " " ? "␣" : inner[i];
      const color = inner[i] === " " ? HEX_MAGENTA : HEX_PARCHMENT;
      const t = this.add.text(x, y, ch, { font: "bold 22px Courier New", color }).setOrigin(0, 0.5).setAlpha(0);
      this.trayContainer.add(t);
      this.tweens.add({ targets: t, alpha: 1, duration: 80 });
      x += t.width;
      i++;
      await this.delay(20);
    }
  }

  _makeTraySlot(label, specifier, precision, x, y) {
    const color = this._slotColorInt(specifier);
    const colorHex = this._slotColor(specifier);
    const tmp = this.add.text(0, 0, label, { font: "bold 18px Courier New" });
    const w = tmp.width + 16;
    tmp.destroy();
    const c = this.add.container(x + w / 2, y).setScale(1.2).setAlpha(0);
    const g = this.add.graphics();
    g.fillStyle(0x0a0e14, 0.6);
    g.fillRoundedRect(-w / 2, -17, w, 34, 6);
    g.lineStyle(2, color, 1);
    g.strokeRoundedRect(-w / 2, -17, w, 34, 6);
    const txt = this.add.text(0, 0, label, { font: "bold 18px Courier New", color: colorHex }).setOrigin(0.5);
    c.add([g, txt]);
    this.trayContainer.add(c);
    this.tweens.add({ targets: c, scale: 1, alpha: 1, duration: 200, ease: "Back.easeOut" });
    if (precision !== null && precision !== undefined) {
      const pm = this.add.text(x + w / 2, y - 24, `.${precision}`, { font: "bold 10px Courier New", color: "#ff6f00" }).setOrigin(0.5).setAlpha(0);
      this.trayContainer.add(pm);
      this.tweens.add({ targets: pm, alpha: 0.85, duration: 200 });
      if (!this._firstPrecisionAnnotationShown) {
        this._firstPrecisionAnnotationShown = true;
        this.createAnnotation(x + w / 2, y - 40, "precision trims and rounds", "#ff6f00");
      }
    }
    const slotInfo = { container: c, text: txt, width: w, x: x + w / 2, y, specifier, color };
    if (this._traySlots) this._traySlots.push(slotInfo);
    return slotInfo;
  }

  async renderSlugsInCase(argVals) {
    this.clearCase();
    let x = CASE_X0 + 16;
    this._caseSlugs = [];
    for (let idx = 0; idx < argVals.length; idx++) {
      if (!this._alive) return;
      const av = argVals[idx];
      const display = av.type === "string" ? `"${av.value}"` : this._toStringForArg(av);
      const color = av.type === "string" ? HEX_CYAN : av.type === "double" ? HEX_ORANGE : av.type === "boolean" ? "#b39ddb" : HEX_GOLD;
      const tmp = this.add.text(0, 0, display, { font: "bold 18px Courier New" });
      const w = tmp.width + 16;
      tmp.destroy();
      const home = { x: x + w / 2, y: CASE_Y };
      const c = this.add.container(home.x, home.y).setAlpha(0).setScale(0.5);
      const g = this.add.graphics();
      g.fillStyle(0x241a10, 1);
      g.lineStyle(2, 0x8a6435, 1);
      g.fillRoundedRect(-w / 2, -22, w, 44, 4);
      g.strokeRoundedRect(-w / 2, -22, w, 44, 4);
      const txt = this.add.text(0, -6, display, { font: "bold 18px Courier New", color }).setOrigin(0.5);
      const idxLbl = this.add.text(0, 16, `arg${idx + 1}`, { font: "bold 8px Courier New", color: HEX_BRASS }).setOrigin(0.5);
      c.add([g, txt, idxLbl]);
      this.caseContainer.add(c);
      this.tweens.add({ targets: c, alpha: 1, scale: 1, duration: 200, ease: "Back.easeOut" });
      this._caseSlugs.push({ container: c, home, type: av.type, color });
      x += w + 12;
      await this.delay(150);
    }
  }

  /** Flies a slug from the case to a tray slot; on type match, inserts;
   * on mismatch, plays the L34-style rejection choreography. Returns
   * {rejected:bool}. */
  async slugToSlot(slugEntry, slotInfo, matchOk) {
    const slug = slugEntry.container;
    await new Promise((res) => {
      this.tweens.add({
        targets: slug, x: slotInfo.x, y: slotInfo.y - 40, duration: 220, ease: "Sine.easeOut",
        onComplete: res,
      });
    });
    if (!matchOk) {
      const g = slotInfo.container.list[0];
      g.clear();
      g.fillStyle(0x0a0e14, 0.6);
      g.fillRoundedRect(-slotInfo.width / 2, -17, slotInfo.width, 34, 6);
      g.lineStyle(2, C_RED, 1);
      g.strokeRoundedRect(-slotInfo.width / 2, -17, slotInfo.width, 34, 6);
      this.screenShake(0.003, 150);
      await new Promise((res) => {
        this.tweens.add({ targets: slug, x: slugEntry.home.x, y: slugEntry.home.y, duration: 200, ease: "Sine.easeIn", onComplete: res });
      });
      const p = this.add.particles(slug.x, slug.y, "l43_dot", { speed: { min: 40, max: 100 }, angle: { min: 0, max: 360 }, scale: { start: 0.6, end: 0 }, lifespan: 250, tint: [C_RED], emitting: false }).setDepth(30);
      this.trayContainer.add(p);
      p.explode(8);
      this.time.delayedCall(350, () => p.destroy());
      slug.destroy();
      return { rejected: true };
    }
    await new Promise((res) => {
      this.tweens.add({ targets: slug, y: slotInfo.y, scale: 0.9, duration: 150, ease: "Cubic.easeOut", onComplete: res });
    });
    this.tweens.add({ targets: slug, scale: 1.1, duration: 80, yoyo: true });
    slotInfo.text.setAlpha(0);
    slug.destroy();
    const p = this.add.particles(slotInfo.x, slotInfo.y, "l43_dot", { speed: { min: 20, max: 50 }, angle: { min: 0, max: 360 }, scale: { start: 0.5, end: 0 }, lifespan: 200, tint: [slotInfo.color], emitting: false }).setDepth(30);
    this.trayContainer.add(p);
    p.explode(4);
    this.time.delayedCall(300, () => p.destroy());
    return { rejected: false };
  }

  /** Full composition reveal for a single printf call. */
  async runComposition(fmtSource, argVals) {
    await this.renderFormatOnTray(fmtSource);
    if (!this._alive) return { ok: true, text: "" };
    await this.renderSlugsInCase(argVals);
    if (!this._alive) return { ok: true, text: "" };

    const evalResult = this.evaluatePrintf(fmtSource, argVals);
    if (evalResult.compileError) { this.clearTray(); this.clearCase(); this.showCompileErrorStamp(); return evalResult; }
    if (!evalResult.ok && evalResult.crash === "malformed_specifier") {
      await this.showTrayErrorStamp("IllegalFormatPrecisionException");
      this.clearTray(); this.clearCase();
      return evalResult;
    }

    if (!evalResult.ok && evalResult.crash === "type_mismatch") {
      // Genuine rejection: fly the offending slug to the actual rendered
      // tray slot it was rejected from (argument-consuming slots only —
      // %n slots take no slug and are skipped in this lookup).
      const badIdx = evalResult.steps.filter((s) => s.type === "slot").length;
      const argSlots = this._traySlots.filter((s) => s.specifier !== "n");
      const slotInfo = argSlots[badIdx];
      const slugEntry = this._caseSlugs[badIdx];
      if (slugEntry && slotInfo) await this.slugToSlot(slugEntry, slotInfo, false);
      await this.showTrayErrorStamp("IllegalFormatConversionException");
      this.clearTray(); this.clearCase();
      return evalResult;
    }
    if (!evalResult.ok && evalResult.crash === "missing_argument") {
      await this.showTrayErrorStamp("MissingFormatArgumentException");
      this.clearTray(); this.clearCase();
      return evalResult;
    }

    // Success: fly each consumed slug into its actual rendered tray slot,
    // in argument order, before transferring the composed line to the log.
    const argSlotsOk = this._traySlots.filter((s) => s.specifier !== "n");
    let slugPos = 0;
    for (const step of evalResult.steps) {
      if (!this._alive) return evalResult;
      if (step.type !== "slot") continue;
      const slotInfo = argSlotsOk[slugPos];
      const slugEntry = this._caseSlugs[slugPos];
      if (slugEntry && slotInfo) await this.slugToSlot(slugEntry, slotInfo, true);
      slugPos++;
    }
    this._caseSlugs.forEach((s) => { if (s.container.active) s.container.destroy(); });
    await this.delay(150);
    await this.transferRowToLog(evalResult.text);
    this.clearTray(); this.clearCase();
    return evalResult;
  }

  async transferRowToLog(text) {
    const capsule = this.add.rectangle(380, TRAY_Y, 60, 20, C_BRASS, 0.7).setDepth(30);
    this.tweens.add({ targets: this.trayContainer, alpha: 0.3, duration: 150 });
    await this.delay(100);
    if (!this._alive) return;
    const targetX = this.cursorBlock.x, targetY = this.cursorBlock.y;
    await new Promise((res) => { this.tweens.add({ targets: capsule, x: targetX, y: targetY, duration: 300, ease: "Cubic.easeInOut", onComplete: res }); });
    capsule.destroy();
    this.flashLed();
    await this.typeAtCursor(text, "compose");
    await this.delay(80);
  }

  async runSnippetReveal(sourceLines, decls) {
    for (const line of sourceLines) {
      if (!this._alive) return { ok: true };
      const m = line.match(/printf\((.+)\)/);
      if (!m) continue;
      const { fmt, args } = this._parsePrintfCall(m[1], decls);
      const argVals = args.map((a) => this._evalArgToken(a, decls));
      const result = await this.runComposition(fmt, argVals);
      if (!result.ok) return result;
      await this.delay(90);
    }
    return { ok: true };
  }

  /** Splits a printf(...) call's inner arguments on top-level commas
   * (respecting quotes), returning {fmt, args:[...]}. */
  _parsePrintfCall(inner, decls) {
    const parts = [];
    let cur = "", inQuotes = false;
    for (let i = 0; i < inner.length; i++) {
      const ch = inner[i];
      if (ch === '"' && inner[i - 1] !== "\\") inQuotes = !inQuotes;
      if (ch === "," && !inQuotes) { parts.push(cur.trim()); cur = ""; continue; }
      cur += ch;
    }
    parts.push(cur.trim());
    return { fmt: parts[0], args: parts.slice(1) };
  }

  _evalArgToken(tok, decls) {
    if (/^".*"$/.test(tok)) return { value: tok.slice(1, -1), type: "string" };
    if (/^-?\d+\.\d+$/.test(tok)) return { value: parseFloat(tok), type: "double" };
    if (/^-?\d+$/.test(tok)) return { value: parseInt(tok, 10), type: "int" };
    if (tok === "true" || tok === "false") return { value: tok === "true", type: "boolean" };
    if (decls && Object.prototype.hasOwnProperty.call(decls, tok)) return decls[tok];
    return { value: tok, type: "string" };
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
    await this.delay(400); if (!A()) return;
    await this.bitSay("Welcome to the Composing Room, Typesetter. Two ways to write have taught you to shout (println) and to whisper (print). Today, we COMPOSE. Every printf is a format — a template with slots. We fill the slots with type slugs, in order, and press it onto the log.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();

    this.updateSourceDisplay(['System.out.printf("Hello, %s!", "Bit");']);
    await this.runComposition('"Hello, %s!"', [{ value: "Bit", type: "string" }]);
    if (!A()) return;
    await this.bitSay("The slug clicked in — 'Bit' filled the slot, the quotes stayed behind, and the whole line pressed onto the log. Notice: NO newline. printf works like print — the cursor rests where it stopped.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();

    await this.clearLog();
    this.updateSourceDisplay(['System.out.printf("%s is %d", "Cat", 5);']);
    await this.runComposition('"%s is %d"', [{ value: "Cat", type: "string" }, { value: 5, type: "int" }]);
    if (!A()) return;
    await this.bitSay("Two slots, two slugs — matched IN ORDER. The FIRST slug fills the FIRST slot; second to second. %s needs a String, %d needs an int, always in order.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();

    await this.clearLog();
    this.updateSourceDisplay(['System.out.printf("%.2f", 3.14159);']);
    await this.runComposition('"%.2f"', [{ value: 3.14159, type: "double" }]);
    if (!A()) return;
    await this.bitSay("Precision! %.2f says 'give me TWO decimal places.' The slug shows up full-precision, but the slot trims it — and rounds when it has to. 3.14159 becomes 3.14.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();

    await this.clearLog();
    this.updateSourceDisplay(['System.out.printf("%d", "oops");']);
    await this.runComposition('"%d"', [{ value: "oops", type: "string" }]);
    if (!A()) return;
    await this.bitSay("OUCH — wrong type! A %d slot demands an integer. A String slug walks up... rejected on the spot. Runtime crash, program down. The slot always wins.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();

    await this.clearLog();
    await this.bitSay("One more — the special one. %n is a NEWLINE slot. It needs no slug. It just becomes a line break, wherever you place it. Now you know the whole family — compose well, Typesetter!");
    if (!A()) return;
    this.updateSourceDisplay(['System.out.printf("A%nB");']);
    await this.runComposition('"A%nB"', []);
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(3500)]); if (!A()) return;
    this.hideBubble();

    try { localStorage.setItem(TUTORIAL_KEY, "true"); } catch (_) {}
    await this.clearLog();
    this.updateSourceDisplay([]);
    this.startRound(0);
  }

  // ══════════════════════════════════════════════════════════════
  // ROUND LIFECYCLE
  // ══════════════════════════════════════════════════════════════

  async startRound(index) {
    this.currentRound = index;
    const config = ROUNDS[index];
    this.roundAttempts = 0;
    this.roundStartTime = this.time.now;
    this.clearRound();
    await this.clearLog();

    if (config.type === "predict") this.setupPredict(config);
    else if (config.type === "command") this.setupCommand(config);
  }

  clearRound() {
    this.roundElements.forEach((e) => { if (e && e.destroy) e.destroy(); });
    this.roundElements = [];
    this.slotContents = {};
    this.slotDefs = {};
    this.cartridges.forEach((c) => c.container.destroy());
    this.cartridges = [];
    this.clearTray();
    this.clearCase();
  }

  showQuestionCard(promptText) {
    const c = this.add.container(640, 490).setDepth(40).setAlpha(0);
    const g = this.add.graphics();
    g.fillStyle(0x1a1108, 0.95);
    g.fillRoundedRect(-260, -40, 520, 80, 10);
    g.lineStyle(1, C_BRASS, 0.5);
    g.strokeRoundedRect(-260, -40, 520, 80, 10);
    const badge = this.add.circle(-230, -10, 16, C_BRASS);
    const badgeT = this.add.text(-230, -10, String(this.currentRound + 1), { font: "bold 14px Arial", color: "#0f0a06" }).setOrigin(0.5);
    const t = this.add.text(-200, -10, promptText, { font: "14px Arial", color: "#e8dfc8", wordWrap: { width: 420 } }).setOrigin(0, 0.5);
    c.add([g, badge, badgeT, t]);
    this.tweens.add({ targets: c, alpha: 1, y: 490, duration: 250 });
    this.roundElements.push(c);
    return c;
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE A/B/C — PREDICT
  // ══════════════════════════════════════════════════════════════

  setupPredict(config) {
    this.updateSourceDisplay(config.source);
    this.updateExpressionMonitor(config.source.join("  "));
    this.showQuestionCard(config.question);
    this.showOptionBubbles(config.options, config);
  }

  showOptionBubbles(options, config) {
    const shuffled = Phaser.Utils.Array.Shuffle(options.slice());
    const n = shuffled.length;
    const spacing = 280;
    const startX = 640 - ((n - 1) * spacing) / 2;
    shuffled.forEach((opt, i) => {
      const x = startX + i * spacing, y = 590;
      const c = this.add.container(x, y).setDepth(41);
      const g = this.add.graphics();
      const w = 260, h = 50;
      const draw = (stroke) => {
        g.clear();
        g.fillStyle(0x1a1108, 1);
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
        g.lineStyle(2, stroke, 1);
        g.strokeRoundedRect(-w / 2, -h / 2, w, h, 10);
      };
      draw(C_BRASS);
      const label = opt.label || opt.value;
      const txt = this.add.text(0, 0, label, { font: "bold 14px Courier New", color: "#e8dfc8" }).setOrigin(0.5);
      if (txt.width > w - 20) txt.setFontSize(11);
      c.add([g, txt]);
      c.setSize(w, h);
      c.setInteractive({ useHandCursor: true });
      c.on("pointerover", () => { if (!this.inputLocked) draw(C_GOLD); });
      c.on("pointerout", () => { if (!this.inputLocked) draw(C_BRASS); });
      c.on("pointerdown", () => {
        if (this.inputLocked) return;
        this.inputLocked = true;
        this.onBubbleSelected(opt, config, c);
      });
      this.roundElements.push(c);
    });
    this.inputLocked = false;
  }

  async onBubbleSelected(opt, config, bubbleContainer) {
    this.roundAttempts++;
    const correct = opt.value === config.correct;
    const timeMs = Math.round(this.time.now - this.roundStartTime);
    this.logAttempt(config, correct, opt.value, opt.tag, timeMs);

    this.roundElements.filter((e) => e !== bubbleContainer).forEach((e) => e.disableInteractive && e.disableInteractive());
    const g = bubbleContainer.list[0];
    g.clear();
    g.fillStyle(0x1a1108, 1);
    g.fillRoundedRect(-130, -25, 260, 50, 10);
    g.lineStyle(2, correct ? C_GREEN_BRIGHT : C_RED, 1);
    g.strokeRoundedRect(-130, -25, 260, 50, 10);
    if (!correct) this.tweens.add({ targets: bubbleContainer, x: bubbleContainer.x + 5, duration: 40, yoyo: true, repeat: 4 });

    await this.delay(200);
    if (!this._alive) return;
    await this.runSnippetReveal(config.source, {});
    if (config.revealNote) this.createFloatingText(LOG_X + LOG_W / 2, LOG_Y + LOG_H + 30, config.revealNote, HEX_GRAY, "11px Arial", 2600);
    await this.delay(500);
    if (!this._alive) return;

    if (correct) {
      this.updateScore(100 * this.getComboMultiplier() + (timeMs < 6000 ? 25 : 0));
      this.updateCombo(true);
      if (this.roundAttempts === 1) this.correctFirstTry++;
      await this.delay(300);
      this.advanceRound();
    } else {
      this.loseLife();
      this.updateCombo(false);
      if (this.lives <= 0) { this.time.delayedCall(400, () => this.gameOver()); return; }
      await this.showBitFeedback(MISCONCEPTION_FEEDBACK[opt.tag] || "Not quite — watch the tray and try again.");
      if (!this._alive) return;
      this.clearRound();
      await this.clearLog();
      this.setupPredict(config);
    }
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE D — COMMAND (drag cartridges)
  // ══════════════════════════════════════════════════════════════

  setupCommand(config) {
    this.updateSourceDisplay(config.sourceTemplate);
    this.slotDefs = {};
    config.slots.forEach((s) => { this.slotDefs[s.id] = { id: s.id, lineIndex: config.sourceTemplate.findIndex((l) => l.includes(`<slot:${s.id}>`)) }; });
    this.updateExpressionMonitor(config.mission);
    this.showQuestionCard(config.mission);
    this.createCartridgeTray(config);
    this._commandFirstFail = true;
  }

  createCartridgeTray(config) {
    const shuffled = Phaser.Utils.Array.Shuffle(config.cartridges.slice());
    let x = 60;
    const rowY = 590;

    shuffled.forEach((def) => {
      const style = { font: "bold 12px Courier New", color: HEX_CYAN };
      const label = def.label || def.code;
      const measure = this.add.text(0, 0, label, style);
      const w = measure.width + 20;
      measure.destroy();
      const home = { x: x + w / 2, y: rowY };
      x += w + 12;

      const c = this.add.container(home.x, home.y).setDepth(42);
      const bg = this.add.graphics();
      const draw = (stroke) => {
        bg.clear();
        bg.fillStyle(0x241a10, 1);
        bg.fillRoundedRect(-w / 2, -14, w, 28, 7);
        bg.lineStyle(2, stroke, 1);
        bg.strokeRoundedRect(-w / 2, -14, w, 28, 7);
      };
      draw(C_BRASS);
      const txt = this.add.text(0, 0, label, style).setOrigin(0.5);
      c.add([bg, txt]);
      c.setSize(w, 28);
      c.setData("w", w);
      c.setData("code", def.code);
      c.setData("tag", def.tag || null);
      c.setData("home", home);
      c.setData("draw", draw);
      c.setData("placedIn", null);
      c.setInteractive({ useHandCursor: true, draggable: true });
      c.on("pointerover", () => { if (!this.inputLocked) draw(C_GOLD); });
      c.on("pointerout", () => { if (!this.inputLocked) draw(C_BRASS); });
      this.cartridges.push({ container: c, def, home });
      this.roundElements.push(c);
    });

    const btn = this.add.container(640, 660).setDepth(42);
    const bg = this.add.graphics();
    const bdraw = (enabled, hover) => {
      bg.clear();
      bg.fillStyle(enabled ? C_BRASS : 0x2a2f36, hover && enabled ? 1 : 0.95);
      bg.fillRoundedRect(-70, -22, 140, 44, 10);
    };
    bdraw(false, false);
    const bt = this.add.text(0, 0, "COMPOSE", { font: "bold 14px Arial", color: "#0f0a06" }).setOrigin(0.5);
    btn.add([bg, bt]);
    btn.setSize(140, 44);
    btn.on("pointerover", () => { if (this._composeReady) { bdraw(true, true); btn.setScale(1.03); } });
    btn.on("pointerout", () => { bdraw(this._composeReady, false); btn.setScale(1); });
    btn.on("pointerdown", () => { if (this._composeReady) this.onComposePressed(config); });
    this.composeButton = { c: btn, draw: bdraw };
    this.roundElements.push(btn);
    this.disableComposeButton();
  }

  enableComposeButton() { this._composeReady = true; this.composeButton.draw(true, false); this.composeButton.c.setInteractive({ useHandCursor: true }); }
  disableComposeButton() { this._composeReady = false; this.composeButton.draw(false, false); this.composeButton.c.disableInteractive(); }

  setupDragEvents() {
    this.input.on("dragstart", (pointer, obj) => {
      if (!this.cartridges.find((b) => b.container === obj) || this.inputLocked) return;
      obj.setDepth(90);
      this.tweens.add({ targets: obj, scale: 1.1, duration: 100 });
      const prevSlot = obj.getData("placedIn");
      if (prevSlot) {
        this.slotContents[prevSlot] = (this.slotContents[prevSlot] || []).filter((b) => b.container !== obj);
        obj.setData("placedIn", null);
        this.updateComposeButtonState();
      }
    });
    this.input.on("drag", (pointer, obj, dragX, dragY) => {
      if (!this.cartridges.find((b) => b.container === obj) || this.inputLocked) return;
      obj.x = dragX; obj.y = dragY;
      this._updateSlotHover(obj);
    });
    this.input.on("dragend", (pointer, obj) => {
      if (!this.cartridges.find((b) => b.container === obj) || this.inputLocked) return;
      this._finishCartridgeDrag(obj);
    });
  }

  _slotDropZone(slotId) {
    const config = ROUNDS[this.currentRound];
    const def = this.slotDefs[slotId];
    const totalLines = config.sourceTemplate.length;
    const y = SRC_Y + def.lineIndex * 19 - ((totalLines - 1) * 19) / 2;
    return { x: 380 - 70, y: y - 12, w: 140, h: 24 };
  }

  _nearestOpenSlot(x, y) {
    let best = null, bestDist = 70;
    for (const id in this.slotDefs) {
      const placed = this.slotContents[id] || [];
      if (placed.length >= 1) continue;
      const zone = this._slotDropZone(id);
      const cx = zone.x + zone.w / 2, cy = zone.y + zone.h / 2;
      const dist = Phaser.Math.Distance.Between(x, y, cx, cy);
      const within = x >= zone.x - 40 && x <= zone.x + zone.w + 40 && y >= zone.y - 30 && y <= zone.y + zone.h + 30;
      if (within && dist < bestDist) { bestDist = dist; best = id; }
    }
    return best;
  }

  _updateSlotHover(obj) {
    const key = this._nearestOpenSlot(obj.x, obj.y);
    if (key) {
      const zone = this._slotDropZone(key);
      const cx = zone.x + zone.w / 2, cy = zone.y + zone.h / 2;
      obj.x = Phaser.Math.Linear(obj.x, cx, 0.25);
      obj.y = Phaser.Math.Linear(obj.y, cy, 0.25);
    }
  }

  _finishCartridgeDrag(obj) {
    obj.setDepth(42);
    this.tweens.add({ targets: obj, scale: 1, duration: 100 });
    const key = this._nearestOpenSlot(obj.x, obj.y);
    if (key) {
      if (!this.slotContents[key]) this.slotContents[key] = [];
      this.slotContents[key].push({ container: obj });
      obj.setData("placedIn", key);
      const zone = this._slotDropZone(key);
      this.tweens.add({ targets: obj, x: zone.x + zone.w / 2, y: zone.y + zone.h / 2, duration: 150, ease: "Cubic.easeOut" });
      this.updateComposeButtonState();
    } else {
      const home = obj.getData("home");
      this.tweens.add({ targets: obj, x: home.x, y: home.y, duration: 250, ease: "Back.easeOut" });
    }
  }

  updateComposeButtonState() {
    const allFilled = Object.keys(this.slotDefs).every((id) => (this.slotContents[id] || []).length > 0);
    if (allFilled) this.enableComposeButton(); else this.disableComposeButton();
  }

  async onComposePressed(config) {
    this.inputLocked = true;
    this.disableComposeButton();
    this.roundAttempts++;
    const timeMs = Math.round(this.time.now - this.roundStartTime);

    const fmtCode = this.slotContents.format[0].container.getData("code");
    const fmtTag = this.slotContents.format[0].container.getData("tag");
    const cartridgeDef = config.cartridges.find((c) => c.code === fmtCode);
    const isFlaggedCorrect = !!(cartridgeDef && (cartridgeDef.correct || cartridgeDef.alsoCorrect));

    this.updateSourceDisplay(config.sourceTemplate.map((l) => l.replace(`<slot:format>`, fmtCode)));

    let allTestsPass = true;
    const testResults = [];
    for (const test of config.tests) {
      if (!this._alive) return;
      await this.clearLog();
      const decls = this._parseDecls(test.subs);
      const argNames = Object.keys(test.subs);
      const argVals = argNames.map((n) => decls[n]);
      const result = await this.runComposition(fmtCode, argVals);
      const trimmedRows = this.rows;
      const logText = trimmedRows.join("⏎");
      const match = result.ok && logText === test.expectedOutput;
      testResults.push(match);
      if (!match) allTestsPass = false;
      await this.delay(200);
      if (!this._alive) return;
    }

    const success = isFlaggedCorrect && allTestsPass;
    this.logAttempt(config, success, fmtCode, success ? null : fmtTag, timeMs);

    if (success) {
      this.updateScore(100 * this.getComboMultiplier() + (timeMs < 6000 ? 25 : 0));
      this.updateCombo(true);
      if (this.roundAttempts === 1) this.correctFirstTry++;
      if (config.postMissionNote) await this.showBitFeedback(config.postMissionNote);
      if (!this._alive) return;
      await this.delay(300);
      this.advanceRound();
    } else {
      const exploratory = this._commandFirstFail;
      this._commandFirstFail = false;
      if (!exploratory) {
        this.loseLife();
        if (this.lives <= 0) { this.time.delayedCall(400, () => this.gameOver()); return; }
      }
      this.updateCombo(false);
      await this.showBitFeedback(MISCONCEPTION_FEEDBACK[fmtTag] || "That format doesn't compose what the mission needs — check the log and try another cartridge.");
      if (!this._alive) return;
      this.inputLocked = false;
      await this.clearLog();
      this.updateSourceDisplay(config.sourceTemplate);
      this.cartridges.forEach((cart) => {
        cart.container.setData("placedIn", null);
        const home = cart.container.getData("home");
        this.tweens.add({ targets: cart.container, x: home.x, y: home.y, duration: 200 });
      });
      this.slotContents = {};
      this.disableComposeButton();
    }
  }

  // ══════════════════════════════════════════════════════════════
  // SCORING / LIVES / COMBO
  // ══════════════════════════════════════════════════════════════

  getComboMultiplier() {
    if (this.combo >= 5) return 3;
    if (this.combo >= 3) return 2;
    return 1;
  }

  updateScore(points) {
    this.score = Math.max(0, this.score + points);
    const counter = { v: this.displayScore };
    this.tweens.add({
      targets: counter, v: this.score, duration: 300,
      onUpdate: () => { this.displayScore = Math.round(counter.v); if (this.scoreText.active) this.scoreText.setText(String(this.displayScore)); },
    });
  }

  updateCombo(correct) {
    if (correct) { this.combo++; this.maxCombo = Math.max(this.maxCombo, this.combo); }
    else this.combo = 0;
    const mult = this.getComboMultiplier();
    this.comboText.setText(`×${mult}`);
    if (mult > 1) this.tweens.add({ targets: this.comboText, scale: 1.3, duration: 150, yoyo: true });
  }

  loseLife() {
    this.lives = Math.max(0, this.lives - 1);
    const icon = this.lifeIcons[this.lives];
    if (icon) this.tweens.add({ targets: icon, alpha: 0.12, duration: 400 });
    return this.lives <= 0;
  }

  logAttempt(config, correct, selectedAnswer, misconceptionTag, timeMs) {
    this.attemptLog.push({
      round: config.round, type: config.type, concept: config.concept,
      correct, selectedAnswer, misconceptionTag: misconceptionTag || null,
      timeMs, attemptNumber: this.roundAttempts,
    });
  }

  advanceRound() {
    this.clearRound();
    const next = this.currentRound + 1;
    if (next >= ROUNDS.length) this.levelComplete();
    else this.startRound(next);
  }

  // ══════════════════════════════════════════════════════════════
  // END STATES
  // ══════════════════════════════════════════════════════════════

  gameOver() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearRound();
    this.hideBubble();

    (async () => {
      this.rowObjs.forEach((r) => r.textT.setColor("#3d4450"));
      const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
      this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });
      const title = this.add.text(640, 240, "PRESSES STOPPED", { font: "bold 40px Arial", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
      this.tweens.add({ targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut", onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }) });
      this.add.text(640, 310, `Score: ${this.score}`, { font: "20px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
      this.add.text(640, 350, `Rounds Completed: ${this.currentRound} / 12`, { font: "16px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);
      this._makeButton(640, 420, "BACK TO THE TRAY", 210, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
    })();
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearRound();
    this.hideBubble();

    try { GameManager.completeLevel(42, Math.round((this.correctFirstTry / 12) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("printf_schema"); } catch (_) {}
    try {
      localStorage.setItem("level43_results", JSON.stringify({
        level: 43, concept: "output_printf", phase: "accretion",
        score: this.score, accuracy: this.correctFirstTry / 12, avgTime: 0,
        comboMax: this.maxCombo, stars: this._starRating(), livesRemaining: this.lives,
        attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.composingRoomFinale().then(() => { if (this._alive) this.showScoreTally(); });
  }

  async composingRoomFinale() {
    await this.clearLog();
    await this.runComposition('"%s"', [{ value: "COMPOSED WELL", type: "string" }]);
    this.createConfetti(LOG_X + LOG_W / 2, LOG_Y + LOG_H / 2, 36);
    await this.delay(500);
  }

  _starRating() {
    const acc = this.correctFirstTry / 12;
    if (acc >= 0.9) return 3;
    if (acc >= 0.7) return 2;
    return 1;
  }

  showScoreTally() {
    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
    this.tweens.add({ targets: ov, fillAlpha: 0.85, duration: 500 });

    const panel = this.add.graphics().setDepth(90);
    panel.fillStyle(0x1a1108, 1);
    panel.fillRoundedRect(360, 100, 560, 420, 16);
    panel.lineStyle(2, C_BRASS, 1);
    panel.strokeRoundedRect(360, 100, 560, 420, 16);

    const title = this.add.text(640, 140, "IMPRESSIONS TAKEN", { font: "bold 30px Georgia", color: HEX_BRASS }).setOrigin(0.5).setDepth(91).setScale(0);
    this.tweens.add({ targets: title, scale: 1, duration: 350, ease: "Back.easeOut" });

    const acc = Math.round((this.correctFirstTry / 12) * 100);
    const lines = [`ACCURACY: ${acc}%`, `BEST COMBO: ×${this.getComboMultiplierFor(this.maxCombo)}`];
    lines.forEach((s, i) => {
      const t = this.add.text(500, 195 + i * 28, s, { font: "14px Arial", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 250, delay: 300 + i * 150 });
    });
    const totalText = this.add.text(500, 195 + 2 * 28, "TOTAL: 0", { font: "bold 24px Arial", color: HEX_GOLD }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: totalText, alpha: 1, duration: 250, delay: 700 });
    const counter = { v: 0 };
    this.tweens.add({ targets: counter, v: this.score, duration: 1000, delay: 700, onUpdate: () => totalText.setText(`TOTAL: ${Math.round(counter.v)}`) });

    const stars = this._starRating();
    for (let i = 0; i < 3; i++) {
      const earned = i < stars;
      const s = this.add.text(640 + (i - 1) * 60, 320, "★", { font: "40px Arial", color: earned ? HEX_GOLD : "#2a3040" }).setOrigin(0.5).setDepth(91).setScale(0);
      this.tweens.add({ targets: s, scale: 1, duration: 250, delay: 1300 + i * 200, ease: earned ? "Back.easeOut" : "Cubic.easeOut" });
    }

    const badge = this.add.container(640, 405).setDepth(91).setAlpha(0);
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillCircle(0, 0, 30);
    bg.lineStyle(3, C_GOLD, 1);
    bg.strokeCircle(0, 0, 30);
    bg.fillStyle(0x241a10, 1);
    bg.lineStyle(1.5, C_BRASS, 1);
    bg.fillRoundedRect(-16, -8, 14, 16, 2);
    bg.strokeRoundedRect(-16, -8, 14, 16, 2);
    const spec = this.add.text(6, 0, "%s", { font: "bold 11px Courier New", color: HEX_CYAN }).setOrigin(0.5);
    badge.add([bg, spec]);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 1900 });
    const badgeLbl = this.add.text(640, 445, "printf() SCHEMA ACQUIRED", { font: "bold 13px Arial", color: HEX_GOLD }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: badgeLbl, alpha: 1, duration: 300, delay: 2050 });

    this._makeButton(500, 480, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(760, 480, "NEXT: The Presses →", 260, 44, { fill: 0x00733a, stroke: C_GREEN_BRIGHT, textColor: "#ffffff" }, () => {
      this.scene.start("MenuScene");
    });
  }

  getComboMultiplierFor(combo) {
    if (combo >= 5) return 3;
    if (combo >= 3) return 2;
    return 1;
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
