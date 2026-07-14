/**
 * Level 45 — "The Print Floor" (Output Methods: Restructuring Phase —
 * printf() trilogy finale, OUTPUT WING SEAL — 9 levels, 3 methods complete)
 * ===========================================================================
 * The learner CONSTRUCTS complete printf()-producing programs — no multiple
 * choice. Reuses the Level 27/30/33/36/39/42 code-canvas/parts-bin/RUN-button
 * construction architecture. A masked rig window hosts a compact composing
 * bed + type case rail (Level 43/44 lineage) feeding a cursor-tracked log
 * (Level 40+ lineage). A genuine per-mission interpreter (never scripted)
 * executes exactly what the player assembled — real half-up precision
 * rounding, real type-mismatch/missing-argument crashes, real Scanner tape
 * consumption (Missions 5/6), real String case-method evaluation (Mission 6).
 *
 * DESIGN NOTE — grading rule (resolved before writing any code): some
 * missions' correct answers end with a real trailing %n (Missions 4/5/6);
 * Mission 1 explicitly accepts both a trailing-%n form and a no-trailing-%n
 * form as equally correct ("bonus" cartridge, alsoAccepted). A blanket
 * closedProperly flag (as L42 used, where every mission happened to end in
 * println()) would break one side or the other here. Resolved with a
 * single direct-join rule: match = logText === expected || logText ===
 * expected + "⏎" — a trailing newline is always optional-but-consistent,
 * which satisfies every mission's test data without special-casing, and
 * still catches Mission 4's "missing final %n" distractor (which changes
 * row COUNT, not just trailing-newline state) as a genuine text mismatch.
 */

import Phaser from "phaser";
import { GameManager } from "../../../GameManager.js";
import { BadgeSystem } from "../../../BadgeSystem.js";

const W = 1280, H = 720;

const C_CYAN = 0x4fc3f7, C_GOLD = 0xffd740, C_ORANGE = 0xff9800, C_VIOLET = 0x7b1fa2;
const C_GREEN_BRIGHT = 0x00e676, C_RED = 0xf44336, C_GRAY = 0x78909c, C_BRASS = 0xc8a05a;
const HEX_CYAN = "#4fc3f7", HEX_GOLD = "#ffd740", HEX_ORANGE = "#ff9800", HEX_VIOLET = "#7b1fa2";
const HEX_GREEN_BRIGHT = "#00e676", HEX_RED = "#f44336", HEX_GRAY = "#78909c";
const HEX_MAGENTA = "#ff4081", HEX_BRASS = "#c8a05a", HEX_ECHO = "#4fc3f7";

const CX = 40, CY = 90, CW = 680, CH = 380;
const TAB_H = 34, GUTTER_W = 34, CODE_PAD = 10;
const CODE_X = CX + GUTTER_W + CODE_PAD;
const CODE_Y0 = CY + TAB_H + 14;
const LINE_H = 21;
const PX = 40, PY = 490, PW = 680, PH = 130;
const OX = 760, OY = 80, OW = 460, OH = 250;
const BED_Y = OY + 40, RAIL_Y = OY + 72, TAPE_Y = OY + 92;
const LOG_TOP_Y = OY + 106, LOG_X0 = OX + 34, LOG_X1 = OX + OW - 12;
const ROW_H = 16;
const STRIP_Y = OY + OH + 15;
const RX = 760, RY = 345, RW = 460, RH = 125;
const BX = 760, BY = 490, BW = 460, BH = 130;
const TUTORIAL_KEY = "level45_tutorial_done";

// ══════════════════════════════════════════════════════════════
// MISSION CONFIGURATION
// ══════════════════════════════════════════════════════════════
const MISSIONS = [
  { mission: 1, title: "The Score Report",
    brief: "The scoreboard prints one line per player: '<name> scored <points> points!'",
    skeleton: ["String name = /* test value */;", "int points = /* test value */;", "System.out.printf(<slot:format>, name, points);"],
    slots: [{ id: "format", hint: "format string", capacity: 1 }],
    palette: [
      { code: '"%s scored %d points!"', correct: true },
      { code: '"%s scored %s points!"', correct: true, alsoCorrect: true },
      { code: '"%d scored %s points!"', tag: "wrong_specifier_for_type" },
      { code: '"name scored points points!"', tag: "variable_as_literal_belief" },
      { code: '"%s scored %d point!"', tag: "wrong_content" },
      { code: '"%s scored %d points!%n"', tag: "extra_newline", alsoAccepted: true },
    ],
    tests: [
      { subs: { name: '"Bit"', points: "42" }, expectedOutput: "Bit scored 42 points!" },
      { subs: { name: '"Anjana"', points: "100" }, expectedOutput: "Anjana scored 100 points!" },
      { subs: { name: '"Kai"', points: "0" }, expectedOutput: "Kai scored 0 points!" },
    ],
    postMissionNote: "%s is the flexible one — it accepts any type via toString. %d demands an int. Both work here; use %d when you want to be explicit about intent.",
    lenientTrailingNewline: true,
    concept: "basic_printf_output" },

  { mission: 2, title: "The Price Tag",
    brief: "The store's price display shows every price with exactly 2 decimals: 'Total: $<price>' where <price> always has 2 decimals (e.g., $3.14, $100.50, $0.99).",
    skeleton: ["double price = /* test value */;", "System.out.printf(<slot:format>, price);"],
    slots: [{ id: "format", hint: "format string", capacity: 1 }],
    palette: [
      { code: '"Total: $%.2f"', correct: true },
      { code: '"Total: $%f"', tag: "precision_missing" },
      { code: '"Total: $%.2d"', tag: "wrong_specifier_for_precision" },
      { code: '"Total: $%d"', tag: "wrong_specifier_for_type" },
      { code: '"Total: $%.0f"', tag: "precision_removes_decimals" },
      { code: '"Total: $price"', tag: "variable_as_literal_belief" },
    ],
    tests: [
      { subs: { price: "3.14159" }, expectedOutput: "Total: $3.14" },
      { subs: { price: "100.5" }, expectedOutput: "Total: $100.50" },
      { subs: { price: "0.99" }, expectedOutput: "Total: $0.99" },
      { subs: { price: "1000" }, expectedOutput: "Total: $1000.00" },
    ],
    precisionMarker: "%.2f",
    postMissionNote: "The Signal Room showed you the precision math — up here you REACHED for it. $%.2f is the standard price format in every Java program in the world.",
    concept: "precision_payoff_production" },

  { mission: 3, title: "The Column Report",
    brief: "The inventory line shows three fields with mixed types: 'Item: <item> | Qty: <qty> | Price: $<price>' where item is the name, qty is a whole number, price has 2 decimals.",
    skeleton: ["String item = /* test value */;", "int qty = /* test value */;", "double price = /* test value */;", "System.out.printf(<slot:format>, item, qty, price);"],
    slots: [{ id: "format", hint: "format string", capacity: 1 }],
    palette: [
      { code: '"Item: %s | Qty: %d | Price: $%.2f"', correct: true },
      { code: '"Item: %s | Qty: %s | Price: $%.2f"', correct: true, alsoCorrect: true },
      { code: '"Item: %s | Qty: %d | Price: $%f"', tag: "precision_missing" },
      { code: '"Item: %d | Qty: %s | Price: $%.2f"', tag: "wrong_specifier_for_type" },
      { code: '"Item: %s | Qty: %d | Price: $%d"', tag: "wrong_specifier_for_type" },
      { code: '"Item: item | Qty: qty | Price: $price"', tag: "variable_as_literal_belief" },
    ],
    tests: [
      { subs: { item: '"Coffee"', qty: "3", price: "3.50" }, expectedOutput: "Item: Coffee | Qty: 3 | Price: $3.50" },
      { subs: { item: '"Tea"', qty: "1", price: "2.00" }, expectedOutput: "Item: Tea | Qty: 1 | Price: $2.00" },
      { subs: { item: '"Espresso"', qty: "10", price: "4.99" }, expectedOutput: "Item: Espresso | Qty: 10 | Price: $4.99" },
    ],
    precisionMarker: "%.2f",
    postMissionNote: "Three fields, three specifiers, three types — all matched. This is what printf was designed for: one line, one format, everything in its right place.",
    concept: "three_specifier_mixed_types" },

  { mission: 4, title: "The Bill Summary",
    brief: "The bill prints a multi-line summary — a header, three price lines (each with 2-decimal precision), and a closing newline.",
    skeleton: ["double subtotal = /* test value */;", "double tax = /* test value */;", "double total = /* test value */;", "System.out.printf(<slot:format>, subtotal, tax, total);"],
    slots: [{ id: "format", hint: "multi-line format", capacity: 1 }],
    palette: [
      { code: '"=== BILL ===%nSubtotal: $%.2f%nTax:      $%.2f%nTotal:    $%.2f%n"', correct: true },
      { code: '"=== BILL ===\\nSubtotal: $%.2f\\nTax:      $%.2f\\nTotal:    $%.2f\\n"', correct: true, alsoCorrect: true },
      { code: '"=== BILL === Subtotal: $%.2f Tax: $%.2f Total: $%.2f"', tag: "newline_missing" },
      { code: '"=== BILL ===%nSubtotal: $%f%nTax:      $%f%nTotal:    $%f%n"', tag: "precision_missing" },
      { code: '"=== BILL ===%nSubtotal: $%d%nTax:      $%d%nTotal:    $%d%n"', tag: "wrong_specifier_for_type" },
      { code: '"=== BILL ===%nSubtotal: $%.2f%nTax:      $%.2f%nTotal:    $%.2f"', tag: "n_at_end_only_belief" },
    ],
    tests: [
      { subs: { subtotal: "10.00", tax: "1.50", total: "11.50" }, expectedOutput: "=== BILL ===⏎Subtotal: $10.00⏎Tax:      $1.50⏎Total:    $11.50⏎" },
      { subs: { subtotal: "99.99", tax: "15.00", total: "114.99" }, expectedOutput: "=== BILL ===⏎Subtotal: $99.99⏎Tax:      $15.00⏎Total:    $114.99⏎" },
    ],
    precisionMarker: "%.2f",
    postMissionNote: "A single printf built four lines — that's the power of the format string. %n between lines, %.2f for every price, all threaded in order.",
    concept: "multi_line_bill_with_precision" },

  { mission: 5, title: "The Interactive Order",
    brief: "The order terminal reads an ITEM (line) and QUANTITY (int), then prints a confirmation: 'You ordered <qty> <item>(s)!'",
    skeleton: ["Scanner sc = new Scanner(System.in);", 'System.out.printf("Enter item: ");', "String item = sc.nextLine();", "", 'System.out.printf("Enter quantity: ");', "int qty = sc.nextInt();", "", "System.out.printf(<slot:confirm>, qty, item);"],
    slots: [{ id: "confirm", hint: "confirmation format", capacity: 1 }],
    palette: [
      { code: '"You ordered %d %s(s)!%n"', correct: true },
      { code: '"You ordered %d %s(s)!\\n"', correct: true, alsoCorrect: true },
      { code: '"You ordered %s %s(s)!%n"', correct: true, alsoCorrect: true },
      { code: '"You ordered %s %d(s)!%n"', tag: "argument_order_reversed_belief" },
      { code: '"You ordered qty item(s)!%n"', tag: "variable_as_literal_belief" },
      { code: '"You ordered %d %s(s)!"', tag: "newline_missing" },
      { code: '"You ordered %d(s)!%n"', tag: "missing_argument_belief" },
    ],
    tests: [
      { input: ["Coffee", "3"], expectedLog: "Enter item: Coffee⏎Enter quantity: 3⏎You ordered 3 Coffee(s)!⏎" },
      { input: ["Tea", "1"], expectedLog: "Enter item: Tea⏎Enter quantity: 1⏎You ordered 1 Tea(s)!⏎" },
      { input: ["Espresso", "10"], expectedLog: "Enter item: Espresso⏎Enter quantity: 10⏎You ordered 10 Espresso(s)!⏎" },
    ],
    postMissionNote: "Two wings shipping together — Scanner brings in the order, printf ships out the confirmation. Everything you've learned, meeting in one program.",
    concept: "scanner_printf_pipeline" },

  { mission: 6, title: "The Newsroom Broadcast",
    brief: "The 6PM broadcast needs the full formatted script. Read the anchor's NAME and the top HEADLINE (both lines), uppercase both, and print the full multi-line script with the given DURATION at 1-decimal precision.",
    skeleton: ["Scanner sc = new Scanner(System.in);", "String anchor = sc.nextLine();", "String headline = sc.nextLine();", "double duration = /* test value */;", "", "System.out.printf(<slot:format>, <slot:anchor_arg>, <slot:headline_arg>, duration);"],
    slots: [{ id: "format", hint: "full format string", capacity: 1 }, { id: "anchor_arg", hint: "anchor (LOUD)", capacity: 1 }, { id: "headline_arg", hint: "headline (LOUD)", capacity: 1 }],
    palette: [
      { code: '"=== 6PM BROADCAST ===%nAnchor: %s%nTop story: %s%n%nDuration: %.1f minutes%n=== 6PM BROADCAST ===%n"', correct: true, slot: "format" },
      { code: '"=== 6PM BROADCAST ===\\nAnchor: %s\\nTop story: %s\\n\\nDuration: %.1f minutes\\n=== 6PM BROADCAST ===\\n"', correct: true, alsoCorrect: true, slot: "format" },
      { code: '"=== 6PM BROADCAST ===%nAnchor: %s%nTop story: %s%nDuration: %f minutes%n=== 6PM BROADCAST ===%n"', tag: "precision_missing", slot: "format" },
      { code: '"=== 6PM BROADCAST ===%nAnchor: %s%nTop story: %d%n%nDuration: %.1f minutes%n=== 6PM BROADCAST ===%n"', tag: "wrong_specifier_for_type", slot: "format" },
      { code: '"=== 6PM BROADCAST ===%nAnchor: %s%nTop story: %s%nDuration: %.1f minutes%n=== 6PM BROADCAST ===%n"', tag: "missing_blank_line", slot: "format" },
      { code: "anchor.toUpperCase()", correct: true, slot: "anchor_arg" },
      { code: "headline.toUpperCase()", correct: true, slot: "headline_arg" },
      { code: "anchor", tag: "no_normalization", slot: "anchor_arg" },
      { code: "headline", tag: "no_normalization", slot: "headline_arg" },
      { code: "anchor.toLowerCase()", tag: "method_direction_confusion", slot: "anchor_arg" },
      { code: "anchor.toUpperCase", tag: "property_vs_method_syntax", slot: "anchor_arg" },
      { code: '"anchor".toUpperCase()', tag: "literal_as_variable_belief", slot: "anchor_arg" },
    ],
    tests: [
      { input: ["anjana perera", "breaking news"], subs: { duration: "45.5" }, expectedLog: "=== 6PM BROADCAST ===⏎Anchor: ANJANA PERERA⏎Top story: BREAKING NEWS⏎⏎Duration: 45.5 minutes⏎=== 6PM BROADCAST ===⏎" },
      { input: ["kai", "local update"], subs: { duration: "30.0" }, expectedLog: "=== 6PM BROADCAST ===⏎Anchor: KAI⏎Top story: LOCAL UPDATE⏎⏎Duration: 30.0 minutes⏎=== 6PM BROADCAST ===⏎" },
      { input: ["OK", "AI"], subs: { duration: "15.75" }, expectedLog: "=== 6PM BROADCAST ===⏎Anchor: OK⏎Top story: AI⏎⏎Duration: 15.8 minutes⏎=== 6PM BROADCAST ===⏎" },
    ],
    precisionMarker: "%.1f",
    postMissionNote: "Scanner brought them in from outside. String taught you to make them loud. printf composed the whole script with precision, alignment, and structure. That's what all NINE levels of the Output Wing were building toward, Manager. Real programs. Real deliverables. You produce them now.",
    concept: "output_wing_grand_capstone" },
];

const MISCONCEPTION_FEEDBACK = {
  precision_missing: "Look at the log — 6 decimals instead of the mission's exact count! Default %f gives you 6 decimals. Reach for the precision marker: %.2f or %.1f.",
  wrong_specifier_for_type: "The runtime rejection — a specifier demanded one type but met another. %s is flexible; %d is strict (ints only); %f/%.Nf is for doubles.",
  wrong_specifier_for_precision: "%d has no decimal precision — %.2d is a runtime error. Precision only makes sense on floating-point specifiers like %f.",
  precision_removes_decimals: "%.0f drops all decimals — but the mission needs cents visible. Reach for %.2f.",
  variable_as_literal_belief: "Inside quotes, the letters spell the variable NAME. Use %s (or the matching specifier) in the format string to insert the value.",
  wrong_content: "Read the mission's exact wording — printf composes what you type, letter for letter. Grammar counts.",
  newline_missing: "The mission needs line breaks between fields — %n or \\n where each row ends. Without them, everything jams onto one line.",
  n_at_end_only_belief: "%n can appear anywhere in the format — start, middle, end. The mission needs one between every row AND at the very end.",
  missing_blank_line: "The broadcast script needs a blank line between the story and the duration — that's %n%n (or \\n\\n) at that position.",
  missing_argument_belief: "MissingFormatArgumentException — more specifiers than arguments. Every %s and %d and %f needs its own slug.",
  argument_order_reversed_belief: "Position is destiny. arg1 fills the first %-slot, arg2 the second. Reorder the specifiers and the wrong-typed slug gets rejected.",
  no_normalization: "The broadcast showed mixed case — the mission asked for LOUD. Uppercase before you pass to printf.",
  method_direction_confusion: "You lowercased where the mission asked for LOUD. toUpperCase() sends letters up; toLowerCase() sends them down.",
  property_vs_method_syntax: "The arc's oldest trap returns for the ultimate finale — parentheses on Strings! toUpperCase is a METHOD: toUpperCase().",
  literal_as_variable_belief: '"anchor".toUpperCase() returns the LITERAL word \'ANCHOR\', not the variable\'s value. Drop the quotes.',
  format_specifier_prints_literally_belief: "The %-specifier IS the slot, not text. It never prints as letters — the value fills it.",
};

export class Level45Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level45Scene" });
  }

  init() {
    this.currentMission = 0;
    this.score = 0;
    this.displayScore = 0;
    this.lives = 3;
    this.flawlessCount = 0;
    this.runCount = 0;
    this.failedRunCount = 0;
    this.hintCount = 0;
    this.selfCorrectionCount = 0;
    this.precisionProactive = {};
    this.specifierProactive = {};
    this.newlineFormChoice = {};
    this.crossWingCleanFirstRun = {};
    this.attemptLog = [];
    this.missionElements = [];
    this.slotContents = {};
    this.slotDefs = {};
    this.wrongBlockHistory = {};
    this.missionStartTime = 0;
    this.missionRunsFailed = 0;
    this.missionHintUsed = false;
    this._runCountAtMissionStart = 0;
    this.paletteBlocks = [];
    this.rows = [""];
    this.cursorRowIdx = 0;
    this.cursorOnFreshLine = true;
    this.rowObjs = [];
    this.inputLocked = true;
    this.gameEnded = false;
    this._alive = true;
    this._bubble = null;
    this._dragHoverSlotKey = null;
    this._proactiveRecorded = {};
    this.tapeState = [];
  }

  preload() {}

  create() {
    this._alive = true;
    this.events.once("shutdown", () => { this._alive = false; });

    const cam = this.cameras.main;
    const zoom = Math.min(this.scale.width / W, this.scale.height / H);
    cam.setZoom(zoom);
    cam.centerOn(W / 2, H / 2);
    cam.setBackgroundColor("#0b0a08");

    try { GameManager.incrementAttempt(44); } catch (_) {}

    this.createParticleTexture();
    this.createBackground();
    this.createPrintFloorInterior();
    this.createPrintFloorFloor();
    this.createProductionSign();
    this.createAmbientParticles();
    this.createCodeCanvas();
    this.createBlockPalette();
    this.createRunButton();
    this.createRigWindow();
    this.createMiniComposingBed();
    this.createMiniTypeCaseRail();
    this.createMiniTape();
    this.createMiniLog();
    this.createManifestStrip();
    this.createTestReportPanel();
    this.createMissionBriefPanel();
    this.createHUD();
    this.createBit();
    this.setupDragEvents();

    cam.fadeIn(700, 3, 3, 5);
    this.checkTutorial();
  }

  update(time, delta) {
    this.updateAmbient(time, delta);
    this.updateProductionSignPulse(time);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // BACKGROUND — print floor
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l45_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l45_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x0b0a08).setDepth(0);
  }

  createPrintFloorInterior() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x120e09, 1);
    g.fillRect(0, 0, W, 216);
    for (let y = 0; y < 216; y += 20) { g.lineStyle(1, 0x1a1108, 0.3); g.lineBetween(0, y, W, y); }
    [200, 940].forEach((x) => {
      g.fillStyle(0x1a1108, 1);
      g.lineStyle(1, C_BRASS, 0.4);
      g.fillRoundedRect(x, 30, 220, 140, 4);
      g.strokeRoundedRect(x, 30, 220, 140, 4);
      for (let i = 0; i < 5; i++) { g.lineStyle(1, 0xe0e0e0, 0.15); g.lineBetween(x + 16, 50 + i * 22, x + 204, 50 + i * 22); }
    });

    const clock = this.add.container(610, 96).setDepth(2);
    const ring = this.add.graphics();
    ring.lineStyle(2, C_BRASS, 0.5);
    ring.strokeCircle(0, 0, 26);
    this.floorMinute = this.add.graphics();
    this.floorHour = this.add.graphics();
    clock.add([ring, this.floorHour, this.floorMinute]);

    const banner = this.add.graphics().setDepth(2);
    banner.fillStyle(0x1a1108, 1);
    banner.lineStyle(1, C_BRASS, 0.4);
    banner.fillRoundedRect(230, 12, 340, 28, 5);
    banner.strokeRoundedRect(230, 12, 340, 28, 5);
    this.add.text(400, 26, "PRINT FLOOR — PRODUCTION", { font: "bold 14px Georgia", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.7).setDepth(3);
  }

  createPrintFloorFloor() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x1a1108, 1);
    g.fillRect(0, 635, W, 85);
    g.lineStyle(2, 0x3a2618, 1);
    g.lineBetween(0, 637, W, 637);
    g.lineStyle(1, C_BRASS, 0.06);
    for (let x = 300; x < 900; x += 18) g.lineBetween(x, 685, x + 12, 685);
    for (let i = 0; i < 3; i++) g.fillRect(30 + i * 220, 668, 26, 8);
  }

  createProductionSign() {
    const g = this.add.graphics().setDepth(4);
    g.fillStyle(0x0d0a05, 1);
    g.lineStyle(2, C_RED, 1);
    g.fillRoundedRect(840, 48, 100, 28, 5);
    g.strokeRoundedRect(840, 48, 100, 28, 5);
    this.productionText = this.add.text(890, 62, "IN PRODUCTION", { font: "bold 10px Arial", color: "#e53935" }).setOrigin(0.5).setAlpha(0.35).setDepth(5);
    this.productionSignBg = g;
    this._prodBright = false;
  }

  updateProductionSignPulse() {}

  setProduction(on, hold) {
    this._prodBright = on;
    this.tweens.killTweensOf(this.productionText);
    if (on) {
      this.productionText.setAlpha(0.9).setColor("#e53935").setText("IN PRODUCTION");
      if (!hold) this.tweens.add({ targets: this.productionText, alpha: 0.6, duration: 500, yoyo: true, repeat: -1 });
    } else {
      this.productionText.setAlpha(0.35);
    }
  }

  setProductionGold(text) {
    this.tweens.killTweensOf(this.productionText);
    this.productionSignBg.clear();
    this.productionSignBg.fillStyle(0x0d0a05, 1);
    this.productionSignBg.lineStyle(2, C_GOLD, 1);
    this.productionSignBg.fillRoundedRect(840, 48, 100, 28, 5);
    this.productionSignBg.strokeRoundedRect(840, 48, 100, 28, 5);
    this.productionText.setColor(HEX_GOLD).setAlpha(1).setText(text);
  }

  createAmbientParticles() {
    this.ambient = [];
    const colors = [0xc8a05a, 0x8a6435, 0xa89078];
    for (let i = 0; i < 9; i++) {
      this.ambient.push(this.add.circle(Phaser.Math.Between(0, W), Phaser.Math.Between(220, 630), 1, Phaser.Utils.Array.GetRandom(colors), Phaser.Math.FloatBetween(0.03, 0.06)).setDepth(2));
    }
  }

  updateAmbient(time, delta) {
    if (!this.ambient) return;
    const step = 0.01 * (delta / 16.7);
    this.ambient.forEach((p, i) => {
      p.y += step;
      p.x += Math.sin(time * 0.0004 + i) * 0.03;
      if (p.y > 630) { p.y = 220; p.x = Phaser.Math.Between(0, W); }
    });
    if (this.floorMinute) {
      const a = time * 0.00006;
      this.floorMinute.clear();
      this.floorMinute.lineStyle(2, C_BRASS, 0.35);
      this.floorMinute.lineBetween(0, 0, Math.cos(a - Math.PI / 2) * 18, Math.sin(a - Math.PI / 2) * 18);
      this.floorHour.clear();
      this.floorHour.lineStyle(2, C_BRASS, 0.3);
      this.floorHour.lineBetween(0, 0, Math.cos(a / 12 - Math.PI / 2) * 12, Math.sin(a / 12 - Math.PI / 2) * 12);
    }
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
    side(x, y, x + w, y); side(x + w, y, x + w, y + h);
    side(x + w, y + h, x, y + h); side(x, y + h, x, y);
  }

  // ══════════════════════════════════════════════════════════════
  // CODE CANVAS (L27/L30/L33/L36/L39/L42 architecture, reused)
  // ══════════════════════════════════════════════════════════════

  createCodeCanvas() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0d1117, 1);
    g.fillRoundedRect(CX, CY, CW, CH, 12);
    g.lineStyle(2, 0x21262d, 1);
    g.strokeRoundedRect(CX, CY, CW, CH, 12);

    const tab = this.add.graphics().setDepth(11);
    tab.fillStyle(0x10151d, 1);
    tab.fillRoundedRect(CX, CY, CW, TAB_H, { tl: 12, tr: 12, bl: 0, br: 0 });
    [0xf44336, 0xffd740, 0x00e676].forEach((c, i) => {
      tab.fillStyle(c, 0.5);
      tab.fillCircle(CX + 16 + i * 16, CY + TAB_H / 2, 5);
    });
    this.tabFilename = this.add.text(CX + CW - 12, CY + TAB_H / 2, "Press1.java", { font: "11px Courier New", color: "#546e7a" }).setOrigin(1, 0.5).setDepth(11);

    this.lineHighlight = this.add.rectangle(CX + CW / 2, 0, CW - 4, LINE_H, 0xffab00, 0.06).setDepth(19).setVisible(false);
    this.codeContainer = this.add.container(0, 0).setDepth(20);
  }

  _syntaxTokens(line) {
    const tokens = [];
    const re = /(%\.\d+f|%[sdfcbn])|(\\[nt])|("(?:[^"\\]|\\.)*")|(\bif\b|\belse\b|\bfor\b|\bint\b|\bdouble\b|\bString\b|\bnew\b|\bScanner\b)|(\bSystem\.out\b)|([A-Za-z_]\w*(?=\())|(\bSystem\.in\b)|(>=|<=|==|!=|\+\+|--|[+\-*/><])|([(){}\[\];.,=])/g;
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
      else if (m[5]) tokens.push({ t: m[5], c: "#ffd740" });
      else if (m[6]) tokens.push({ t: m[6], c: "#78909c" });
      else if (m[7]) tokens.push({ t: m[7], c: "#ff8a65" });
      else if (m[8]) tokens.push({ t: m[8], c: "#78909c" });
      last = m.index + m[0].length;
    }
    if (last < line.length) plain(line.slice(last));
    return tokens.length ? tokens : [{ t: line, c: "#e0e0e0" }];
  }

  _slotColor(specifier) {
    switch (specifier) {
      case "s": return HEX_CYAN;
      case "d": return HEX_GOLD;
      case "f": return HEX_ORANGE;
      case "n": return HEX_VIOLET;
      default: return HEX_GRAY;
    }
  }

  renderSkeleton(mission) {
    this.codeContainer.removeAll(true);
    this.slotDefs = {};
    mission.slots.forEach((s) => { this.slotDefs[s.id] = { ...s, rect: null }; });

    mission.skeleton.forEach((rawLine, i) => {
      const y = CODE_Y0 + i * LINE_H;
      const numT = this.add.text(CX + 8, y, String(i + 1), { font: "11px Courier New", color: "#3d4450" });
      this.codeContainer.add(numT);

      if (/^Scanner sc = new Scanner/.test(rawLine) || /^System\.out\.printf\("Enter/.test(rawLine) || /^String \w+ = sc\.nextLine/.test(rawLine) || /^int qty = sc\.nextInt/.test(rawLine)) {
        const t = this.add.text(CODE_X, y, rawLine, { font: "12px Courier New", color: "#3d4450" }).setAlpha(0.6);
        this.codeContainer.add(t);
        return;
      }

      const parts = rawLine.split(/<slot:(\w+)>/);
      let x = CODE_X;
      parts.forEach((part, pi) => {
        if (pi % 2 === 0) {
          if (!part) return;
          this._syntaxTokens(part).forEach((tok) => {
            const t = this.add.text(x, y, tok.t, { font: "bold 12px Courier New", color: tok.c });
            this.codeContainer.add(t);
            x += t.width;
          });
        } else {
          const slotId = part;
          const def = this.slotDefs[slotId];
          const w = 200;
          def.rect = { x, y: y - 2, w, h: 17 };
          this._drawSlotPlaceholder(slotId);
          x += w + 6;
        }
      });
    });
  }

  _drawSlotPlaceholder(slotId) {
    const def = this.slotDefs[slotId];
    if (!def || !def.rect) return;
    if (def.dg) def.dg.destroy();
    if (def.hintLabel) { def.hintLabel.destroy(); def.hintLabel = null; }
    const { x, y, w, h } = def.rect;
    const dg = this.add.graphics().setDepth(21);
    const filled = (this.slotContents[slotId] || []).length > 0;
    const draw = (highlight) => {
      dg.clear();
      dg.fillStyle(0x161b22, 1);
      dg.fillRoundedRect(x, y, w, h, 5);
      if (filled) {
        dg.lineStyle(2, highlight ? 0xffab00 : 0x2a3a4a, 1);
        dg.strokeRoundedRect(x, y, w, h, 5);
      } else {
        dg.lineStyle(2, highlight ? 0xffab00 : 0x546e7a, 1);
        this._dashedRectOutline(dg, x, y, w, h, 5, 4);
      }
    };
    draw(false);
    def.dg = dg;
    def.drawDash = draw;
    this.codeContainer.add(dg);
    if (!filled) {
      const label = this.add.text(x + w / 2, y + h / 2, def.hint, { font: "italic 9px Courier New", color: "#3d4450" }).setOrigin(0.5).setDepth(22);
      def.hintLabel = label;
      this.codeContainer.add(label);
    }
  }

  _relayoutSlot(slotId) {
    const def = this.slotDefs[slotId];
    const placed = this.slotContents[slotId] || [];
    if (!def || !def.rect) return;
    const { x, y, h } = def.rect;
    if (placed[0]) {
      const block = placed[0];
      const bw = block.container.getData("w");
      this.tweens.add({ targets: block.container, x: x + bw / 2, y: y + h / 2, duration: 150, ease: "Cubic.easeOut" });
    }
    this._drawSlotPlaceholder(slotId);
  }

  highlightCodeLine(lineIndex) {
    if (lineIndex === null || lineIndex === undefined) { this.lineHighlight.setVisible(false); return; }
    const y = CODE_Y0 + lineIndex * LINE_H - 2;
    this.lineHighlight.setPosition(CX + CW / 2, y + LINE_H / 2).setVisible(true);
  }

  // ══════════════════════════════════════════════════════════════
  // BLOCK PALETTE (drag system, reused)
  // ══════════════════════════════════════════════════════════════

  createBlockPalette() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0f0a06, 1);
    g.fillRoundedRect(PX, PY, PW, PH, 10);
    g.lineStyle(1, 0x3a2618, 1);
    g.strokeRoundedRect(PX, PY, PW, PH, 10);
    this.add.text(PX + 10, PY + 8, "PRESS COPY", { font: "bold 9px Arial", color: "#3d4450" }).setDepth(11);
    this.paletteContainer = this.add.container(0, 0).setDepth(30);
  }

  populatePalette(mission) {
    this.paletteBlocks.forEach((b) => b.container.destroy());
    this.paletteBlocks = [];
    const shuffled = Phaser.Utils.Array.Shuffle(mission.palette.slice());
    const rowY = [PY + 32, PY + 66, PY + 100];
    let x = PX + 12, row = 0;
    const maxX = PX + PW - 12;

    shuffled.forEach((def) => {
      const style = { font: "bold 11px Courier New", color: HEX_CYAN };
      const label = def.label || def.code;
      const measure = this.add.text(0, 0, label, style);
      const w = measure.width + 16;
      measure.destroy();
      if (x + w > maxX) { row = Math.min(row + 1, 2); x = PX + 12; }
      const home = { x: x + w / 2, y: rowY[row] };
      x += w + 8;

      const c = this.add.container(home.x, home.y).setDepth(31);
      const bg = this.add.graphics();
      const draw = (stroke) => {
        bg.clear();
        bg.fillStyle(0x241a10, 1);
        bg.fillRoundedRect(-w / 2, -13, w, 26, 6);
        bg.lineStyle(2, stroke, 1);
        bg.strokeRoundedRect(-w / 2, -13, w, 26, 6);
      };
      draw(C_BRASS);
      const txt = this.add.text(0, 0, label, style).setOrigin(0.5);
      c.add([bg, txt]);
      c.setSize(w, 26);
      c.setData("w", w);
      c.setData("code", def.code);
      c.setData("tag", def.tag || null);
      c.setData("targetSlot", def.slot);
      c.setData("home", home);
      c.setData("draw", draw);
      c.setData("placedIn", null);
      c.setInteractive({ useHandCursor: true, draggable: true });
      c.on("pointerover", () => { if (!this.inputLocked) draw(0xffab00); });
      c.on("pointerout", () => { if (!this.inputLocked) draw(C_BRASS); });
      this.paletteContainer.add(c);
      this.paletteBlocks.push({ container: c, def, home });
    });
  }

  setupDragEvents() {
    this.input.on("dragstart", (pointer, obj) => {
      if (!this.paletteBlocks.find((b) => b.container === obj) || this.inputLocked) return;
      obj.setDepth(60);
      this.tweens.add({ targets: obj, scale: 1.1, duration: 100 });
      const prevSlot = obj.getData("placedIn");
      if (prevSlot) {
        this.slotContents[prevSlot] = (this.slotContents[prevSlot] || []).filter((b) => b.container !== obj);
        obj.setData("_cameFromSlot", prevSlot);
        obj.setData("placedIn", null);
        this._relayoutSlot(prevSlot);
        this.updateRunButtonState();
      } else {
        obj.setData("_cameFromSlot", null);
      }
    });
    this.input.on("drag", (pointer, obj, dragX, dragY) => {
      if (!this.paletteBlocks.find((b) => b.container === obj) || this.inputLocked) return;
      obj.x = dragX; obj.y = dragY;
      this._updateSlotHover(obj);
    });
    this.input.on("dragend", (pointer, obj) => {
      if (!this.paletteBlocks.find((b) => b.container === obj) || this.inputLocked) return;
      this._finishBlockDrag(obj);
    });
  }

  _nearestOpenSlot(x, y) {
    let best = null, bestDist = 60;
    for (const id in this.slotDefs) {
      const def = this.slotDefs[id];
      if (!def || !def.rect) continue;
      const placed = this.slotContents[id] || [];
      if (placed.length >= def.capacity) continue;
      const cx = def.rect.x + def.rect.w / 2, cy = def.rect.y + def.rect.h / 2;
      const dist = Phaser.Math.Distance.Between(x, y, cx, cy);
      const within = x >= def.rect.x - 30 && x <= def.rect.x + def.rect.w + 30 && y >= def.rect.y - 20 && y <= def.rect.y + def.rect.h + 20;
      if (within && dist < bestDist) { bestDist = dist; best = id; }
    }
    return best;
  }

  _updateSlotHover(obj) {
    const key = this._nearestOpenSlot(obj.x, obj.y);
    if (key !== this._dragHoverSlotKey) {
      if (this._dragHoverSlotKey && this.slotDefs[this._dragHoverSlotKey]) this.slotDefs[this._dragHoverSlotKey].drawDash(false);
      this._dragHoverSlotKey = key;
      if (key) this.slotDefs[key].drawDash(true);
    }
    if (key) {
      const def = this.slotDefs[key];
      const cx = def.rect.x + def.rect.w / 2, cy = def.rect.y + def.rect.h / 2;
      obj.x = Phaser.Math.Linear(obj.x, cx, 0.25);
      obj.y = Phaser.Math.Linear(obj.y, cy, 0.25);
    }
  }

  _finishBlockDrag(obj) {
    obj.setDepth(31);
    this.tweens.add({ targets: obj, scale: 1, duration: 100 });
    const key = this._nearestOpenSlot(obj.x, obj.y);
    if (this._dragHoverSlotKey && this.slotDefs[this._dragHoverSlotKey]) this.slotDefs[this._dragHoverSlotKey].drawDash(false);
    this._dragHoverSlotKey = null;

    if (key) {
      this.placeBlockInSlot(obj, key);
    } else {
      const home = obj.getData("home");
      this.tweens.add({ targets: obj, x: home.x, y: home.y, duration: 250, ease: "Back.easeOut" });
      const cameFrom = obj.getData("_cameFromSlot");
      if (cameFrom && obj.getData("tag") && this.runCount === this._runCountAtMissionStart) {
        this.selfCorrectionCount++;
        this.attemptLog.push({ mission: this.currentMission + 1, selfCorrected: true, code: obj.getData("code"), misconceptionTag: obj.getData("tag"), timestamp: Date.now() });
      }
    }
  }

  placeBlockInSlot(blockObj, slotId) {
    if (!this.slotContents[slotId]) this.slotContents[slotId] = [];
    this.slotContents[slotId].push({ container: blockObj });
    blockObj.setData("placedIn", slotId);
    this._relayoutSlot(slotId);
    this.updateRunButtonState();
  }

  allSlotsFilled() {
    return Object.keys(this.slotDefs).every((id) => (this.slotContents[id] || []).length > 0);
  }

  updateRunButtonState() {
    if (this.allSlotsFilled()) this.enableRunButton(); else this.disableRunButton();
  }

  getAssembledCode() {
    const out = {};
    for (const id in this.slotDefs) {
      out[id] = (this.slotContents[id] || []).map((b) => ({ code: b.container.getData("code"), tag: b.container.getData("tag") }));
    }
    return out;
  }

  // ══════════════════════════════════════════════════════════════
  // RUN BUTTON
  // ══════════════════════════════════════════════════════════════

  createRunButton() {
    const bx = 585, by = 640;
    const glow = this.add.ellipse(bx, by, 150, 60, C_GREEN_BRIGHT, 0.06).setDepth(29);
    this.tweens.add({ targets: glow, fillAlpha: 0.12, duration: 1000, yoyo: true, repeat: -1 });
    const c = this.add.container(bx, by).setDepth(30);
    const g = this.add.graphics();
    const draw = (enabled, hover) => {
      g.clear();
      g.fillStyle(enabled ? C_GREEN_BRIGHT : 0x2a2f36, hover && enabled ? 1 : 0.95);
      g.fillRoundedRect(-67, -26, 134, 52, 10);
    };
    draw(false, false);
    const t = this.add.text(0, 0, "▶ RUN", { font: "bold 18px Arial", color: "#0a0d08" }).setOrigin(0.5);
    c.add([g, t]);
    c.setSize(134, 52);
    c.on("pointerover", () => { if (this._runReady) { draw(true, true); c.setScale(1.03); } });
    c.on("pointerout", () => { draw(this._runReady, false); c.setScale(1); });
    c.on("pointerdown", () => {
      if (!this._runReady) return;
      this.tweens.add({ targets: c, scale: 0.95, duration: 80, yoyo: true });
      this.onRunPressed();
    });
    this.runButton = { c, t, g, draw };
  }

  enableRunButton() {
    this._runReady = true;
    this.runButton.draw(true, false);
    this.runButton.t.setText("▶ RUN").setColor("#0a0d08");
    this.runButton.c.setInteractive({ useHandCursor: true });
  }

  disableRunButton() {
    this._runReady = false;
    this.runButton.draw(false, false);
    this.runButton.t.setText("▶ RUN").setColor("#546e7a");
    this.runButton.c.disableInteractive();
  }

  // ══════════════════════════════════════════════════════════════
  // RIG WINDOW — mini composing bed + type case rail + tape + log
  // ══════════════════════════════════════════════════════════════

  createRigWindow() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x050914, 1);
    g.fillRoundedRect(OX, OY, OW, OH, 12);
    g.lineStyle(3, C_BRASS, 1);
    g.strokeRoundedRect(OX, OY, OW, OH, 12);
    this.add.text(OX + 10, OY + 6, "PRODUCTION RIG — LIVE", { font: "bold 9px Arial", color: HEX_BRASS }).setAlpha(0.7).setDepth(11);

    const maskShape = this.make.graphics({ x: 0, y: 0, add: false });
    maskShape.fillRoundedRect(OX + 4, OY + 20, OW - 8, OH - 24, 10);
    this.windowMask = maskShape.createGeometryMask();
    this.rigLayer = this.add.container(0, 0).setDepth(15);
    this.rigLayer.setMask(this.windowMask);

    this.verdictLamp = this.add.circle(OX + OW - 18, OY + 14, 6, C_GRAY).setDepth(20);
  }

  createMiniComposingBed() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x0a0503, 1);
    g.lineStyle(1, 0x3a2618, 0.6);
    g.fillRoundedRect(OX + 10, BED_Y - 14, OW - 20, 26, 4);
    g.strokeRoundedRect(OX + 10, BED_Y - 14, OW - 20, 26, 4);
    this.rigLayer.add(g);
    this.bedContainer = this.add.container(0, 0);
    this.rigLayer.add(this.bedContainer);
  }

  clearBed() { this.bedContainer.removeAll(true); }

  createMiniTypeCaseRail() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x1a1108, 1);
    g.lineStyle(1, 0x8a6435, 0.4);
    g.fillRoundedRect(OX + 10, RAIL_Y - 9, OW - 20, 18, 3);
    g.strokeRoundedRect(OX + 10, RAIL_Y - 9, OW - 20, 18, 3);
    this.rigLayer.add(g);
    this.railContainer = this.add.container(0, 0);
    this.rigLayer.add(this.railContainer);
  }

  clearRail() { this.railContainer.removeAll(true); }

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
  // MINI SCANNER TAPE (cross-wing cameo, M5/M6)
  // ══════════════════════════════════════════════════════════════

  createMiniTape() {
    this.tapeContainer = this.add.container(0, 0);
    this.rigLayer.add(this.tapeContainer);
    this.tapeCellObjs = [];
    this.tapeState = [];
  }

  _classifyChar(ch) {
    if (ch === " ") return "space";
    if (ch === "\n") return "newline";
    return "alpha";
  }

  buildCellsFromLines(inputLines) {
    const cells = [];
    (inputLines || []).forEach((line) => {
      line.split("").forEach((ch) => cells.push({ ch, kind: this._classifyChar(ch) }));
      cells.push({ ch: "\n", kind: "newline" });
    });
    return cells;
  }

  loadMiniTape(inputLines) {
    this.tapeState = this.buildCellsFromLines(inputLines);
    this.renderMiniTape();
  }

  renderMiniTape() {
    this.tapeContainer.removeAll(true);
    if (this.tapeState.length === 0) return;
    const cellW = 8, x0 = OX + 12, x1 = OX + OW - 12;
    const totalW = Math.min(this.tapeState.length * cellW, x1 - x0);
    const startX = x1 - totalW;
    const bg = this.add.graphics();
    bg.fillStyle(0xe8f0e8, 0.85);
    bg.fillRoundedRect(startX - 4, TAPE_Y - 8, totalW + 8, 16, 3);
    this.tapeContainer.add(bg);
    this.tapeState.slice(-Math.floor(totalW / cellW)).forEach((cell, i) => {
      const x = startX + i * cellW + cellW / 2;
      const disp = cell.kind === "space" ? "␣" : cell.kind === "newline" ? "⏎" : cell.ch;
      const color = cell.kind === "space" ? "#c2185b" : cell.kind === "newline" ? "#7b1fa2" : "#2e7d32";
      const t = this.add.text(x, TAPE_Y, disp, { font: "bold 7px Courier New", color }).setOrigin(0.5);
      this.tapeContainer.add(t);
    });
  }

  evaluateNextLine(cells) {
    const consumed = [];
    let j = 0;
    while (j < cells.length && cells[j].kind !== "newline") { consumed.push(cells[j]); j++; }
    if (j < cells.length) consumed.push(cells[j]);
    const strValue = consumed.filter((c) => c.kind !== "newline").map((c) => c.ch).join("");
    return { rawValue: strValue, consumedCount: consumed.length };
  }

  evaluateNextToken(cells) {
    let j = 0;
    while (j < cells.length && (cells[j].kind === "space" || cells[j].kind === "newline")) j++;
    const consumed = cells.slice(0, j);
    const tokenStart = j;
    while (j < cells.length && cells[j].kind === "alpha") j++;
    const tokenCells = cells.slice(tokenStart, j);
    const strValue = tokenCells.map((c) => c.ch).join("");
    return { rawValue: strValue, consumedCount: j };
  }

  async tapeConsumeVisual(count) {
    this.tapeState = this.tapeState.slice(count);
    this.renderMiniTape();
    await this.delay(70);
  }

  // ══════════════════════════════════════════════════════════════
  // MINI LOG + CURSOR
  // ══════════════════════════════════════════════════════════════

  createMiniLog() {
    this.logContainer = this.add.container(0, 0);
    this.rigLayer.add(this.logContainer);
    this.rows = [""];
    this.cursorRowIdx = 0;
    this.cursorOnFreshLine = true;
    this.rowObjs = [];
    this.renderLogFromScratch();
    this.cursorGlow = this.add.rectangle(0, 0, 10, 15, C_CYAN, 0.15);
    this.cursorBlock = this.add.rectangle(0, 0, 6, 12, C_CYAN, 0.75);
    this.rigLayer.add([this.cursorGlow, this.cursorBlock]);
    this.tweens.add({ targets: [this.cursorBlock, this.cursorGlow], alpha: 0.1, duration: 700, yoyo: true, repeat: -1 });
    this.updateCursorVisualPosition();
  }

  _rowY(i) { return LOG_TOP_Y + 8 + i * ROW_H; }

  renderLogFromScratch() {
    this.logContainer.removeAll(true);
    this.rowObjs = [];
    this.rows.forEach((rowStr, i) => {
      const y = this._rowY(i);
      const textT = this.add.text(LOG_X0, y, this._displayRow(rowStr), { font: "bold 11px Courier New", color: HEX_CYAN }).setOrigin(0, 0.5);
      this.logContainer.add(textT);
      this.rowObjs.push({ textT });
    });
  }

  _displayRow(rowStr) { return rowStr.replace(/ /g, " "); }

  ensureRow(idx) {
    while (this.rowObjs.length <= idx) {
      const i = this.rowObjs.length;
      const y = this._rowY(i);
      const textT = this.add.text(LOG_X0, y, "", { font: "bold 11px Courier New", color: HEX_CYAN }).setOrigin(0, 0.5).setAlpha(0);
      this.tweens.add({ targets: textT, alpha: 1, duration: 120 });
      this.logContainer.add(textT);
      this.rowObjs.push({ textT });
    }
  }

  updateCursorVisualPosition() {
    if (!this.rowObjs[this.cursorRowIdx]) return;
    const rowText = this.rowObjs[this.cursorRowIdx].textT;
    this.cursorBlock.setPosition(LOG_X0 + rowText.width + 2, this._rowY(this.cursorRowIdx));
    this.cursorGlow.setPosition(LOG_X0 + rowText.width + 2, this._rowY(this.cursorRowIdx));
  }

  cursorSparkle() {
    const p = this.add.particles(this.cursorBlock.x, this.cursorBlock.y, "l45_dot", {
      speed: { min: 20, max: 50 }, angle: { min: 0, max: 360 }, scale: { start: 0.4, end: 0 }, lifespan: 160,
      tint: [C_CYAN], emitting: false,
    }).setDepth(20);
    this.rigLayer.add(p);
    p.explode(3);
    this.time.delayedCall(240, () => p.destroy());
  }

  async typeAtCursor(text, styleType) {
    const color = styleType === "echo" ? HEX_ECHO : "#e8dfc8";
    for (const ch of text) {
      if (!this._alive) return;
      if (ch === "\n") {
        this.cursorSparkle();
        this.rows.push("");
        this.cursorRowIdx++;
        this.ensureRow(this.cursorRowIdx);
        this.cursorOnFreshLine = true;
        this.updateCursorVisualPosition();
        await this.delay(24);
        continue;
      }
      this.rows[this.cursorRowIdx] += ch;
      this.rowObjs[this.cursorRowIdx].textT.setColor(color).setText(this._displayRow(this.rows[this.cursorRowIdx]));
      this.cursorOnFreshLine = false;
      this.updateCursorVisualPosition();
      await this.delay(7);
    }
    this.cursorSparkle();
  }

  async forceNewlineAfterPrintln() {
    this.rows.push("");
    this.cursorRowIdx++;
    this.ensureRow(this.cursorRowIdx);
    this.cursorOnFreshLine = true;
    this.updateCursorVisualPosition();
    this.cursorSparkle();
    await this.delay(24);
  }

  /** Scanner-echo resolution (L42 rule, reused verbatim): echoes onto the
   * SAME row only when the cursor is mid-row from a preceding printf
   * prompt — a genuine "interactive prompt" condition, never scripted. */
  async echoScannerInput(text) {
    if (this.cursorOnFreshLine) return;
    await this.typeAtCursor(text, "echo");
    await this.forceNewlineAfterPrintln();
  }

  clearMiniLog() {
    this.logContainer.removeAll(true);
    this.rowObjs = [];
    this.rows = [""];
    this.cursorRowIdx = 0;
    this.cursorOnFreshLine = true;
    this.renderLogFromScratch();
    this.updateCursorVisualPosition();
  }

  // ══════════════════════════════════════════════════════════════
  // EVALUATOR — printf (ported from L43/L44) + Scanner + case methods
  // ══════════════════════════════════════════════════════════════

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
        steps.push({ type: "slot", specifier: "s", text });
      } else if (seg.specifier === "d") {
        if (argVal.type !== "int") return { ok: false, crash: "type_mismatch", steps };
        resultText += String(argVal.value);
        steps.push({ type: "slot", specifier: "d", text: String(argVal.value) });
      } else if (seg.specifier === "f") {
        if (argVal.type !== "double" && argVal.type !== "int") return { ok: false, crash: "type_mismatch", steps };
        const precision = seg.precision !== undefined ? seg.precision : 6;
        const text = this._fmtFixed(argVal.value, precision);
        resultText += text;
        steps.push({ type: "slot", specifier: "f", text, precision });
      } else {
        const text = this._toStringForArg(argVal);
        resultText += text;
        steps.push({ type: "slot", specifier: seg.specifier, text });
      }
    }
    return { ok: true, text: resultText, steps };
  }

  evaluateCaseArg(code, decls) {
    const trimmed = (code || "").trim();
    if (/\.toUpperCase$/.test(trimmed) || /\.toLowerCase$/.test(trimmed)) return { ok: false, compileError: true, tag: "property_vs_method_syntax" };
    const methodMatch = trimmed.match(/^([A-Za-z_]\w*)\.(toUpperCase|toLowerCase)\(\)$/);
    if (methodMatch) {
      const recv = decls && decls[methodMatch[1]];
      if (!recv || recv.type !== "string") return { ok: false };
      const val = methodMatch[2] === "toUpperCase" ? recv.value.toUpperCase() : recv.value.toLowerCase();
      return { ok: true, value: val, type: "string" };
    }
    const literalMatch = trimmed.match(/^"([^"]*)"\.toUpperCase\(\)$/);
    if (literalMatch) return { ok: true, value: literalMatch[1].toUpperCase(), type: "string" };
    if (/^[A-Za-z_]\w*$/.test(trimmed) && decls && decls[trimmed]) return { ok: true, value: decls[trimmed].value, type: decls[trimmed].type };
    return { ok: false };
  }

  // ══════════════════════════════════════════════════════════════
  // COMPOSITION REVEAL — simplified mini bed/rail (honest evaluator,
  // lighter-weight choreography appropriate for a compact rig window)
  // ══════════════════════════════════════════════════════════════

  async animateComposingBed(fmtDisplaySource, argVals, evalResult) {
    this.clearBed();
    this.clearRail();
    const inner = fmtDisplaySource.trim().slice(1, -1);
    let x = OX + 16;
    const y = BED_Y;
    let i = 0;
    while (i < inner.length && x < OX + OW - 20) {
      if (!this._alive) return;
      if (inner[i] === "%" && inner[i + 1] === "n") {
        const t = this._miniGlyph("⏎", this._slotColorInt("n"), x, y, "n");
        x += t.width + 2; i += 2; await this.delay(10); continue;
      }
      const precMatch = inner.slice(i).match(/^%\.(\d+)f/);
      if (precMatch) {
        const t = this._miniGlyph(`%.${precMatch[1]}f`, this._slotColorInt("f"), x, y, "f");
        x += t.width + 2; i += precMatch[0].length; await this.delay(10); continue;
      }
      const simpleMatch = inner.slice(i).match(/^%([sdfcb])/);
      if (simpleMatch) {
        const t = this._miniGlyph(simpleMatch[0], this._slotColorInt(simpleMatch[1]), x, y, simpleMatch[1]);
        x += t.width + 2; i += simpleMatch[0].length; await this.delay(10); continue;
      }
      if (inner[i] === "\\" && inner[i + 1] === "n") {
        const t = this._miniGlyph("⏎", this._slotColorInt("n"), x, y, "n");
        x += t.width + 2; i += 2; await this.delay(6); continue;
      }
      const ch = inner[i] === " " ? "␣" : inner[i];
      const t = this._miniGlyph(ch, "#e8dfc8", x, y, null);
      x += t.width; i++; await this.delay(6);
    }
    // type case rail: show resolved argument slugs, in order
    let rx = OX + 16;
    for (const av of argVals) {
      if (!this._alive) return;
      const display = av.type === "string" ? `"${av.value}"` : this._toStringForArg(av);
      const color = av.type === "string" ? HEX_CYAN : av.type === "double" ? HEX_ORANGE : HEX_GOLD;
      const t = this.add.text(rx, RAIL_Y, display, { font: "bold 10px Courier New", color }).setOrigin(0, 0.5).setAlpha(0);
      this.railContainer.add(t);
      this.tweens.add({ targets: t, alpha: 1, duration: 100 });
      rx += t.width + 8;
      await this.delay(40);
    }
    await this.delay(80);
  }

  _miniGlyph(text, colorHex, x, y, specifier) {
    const isSlot = !!specifier;
    const t = this.add.text(x, y, text, { font: `bold ${isSlot ? 11 : 12}px Courier New`, color: colorHex }).setOrigin(0, 0.5).setAlpha(0);
    this.bedContainer.add(t);
    this.tweens.add({ targets: t, alpha: 1, duration: 80 });
    return t;
  }

  async showCompileErrorOnBed() {
    this.clearBed();
    const stamp = this.add.text(OX + OW / 2, BED_Y, "COMPILE ERROR", { font: "bold 14px Arial", color: HEX_RED }).setOrigin(0.5).setAlpha(0);
    this.bedContainer.add(stamp);
    this.tweens.add({ targets: stamp, alpha: 1, duration: 150 });
    this.screenShake(0.004, 150);
    await this.delay(700);
    if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 180, onComplete: () => stamp.destroy() });
  }

  async showCrashStamp(crash) {
    const labels = { type_mismatch: "IllegalFormatConversionException", missing_argument: "MissingFormatArgumentException", malformed_specifier: "IllegalFormatPrecisionException" };
    const stamp = this.add.text(OX + OW / 2, RAIL_Y + 10, labels[crash] || "RUNTIME CRASH", { font: "bold 10px Courier New", color: HEX_RED }).setOrigin(0.5).setAlpha(0);
    this.railContainer.add(stamp);
    this.tweens.add({ targets: stamp, alpha: 1, duration: 150 });
    this.screenShake(0.005, 180);
    await this.delay(750);
    if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 180, onComplete: () => stamp.destroy() });
  }

  /** Runs one printf call: real parser/evaluator, then a lighter-weight
   * (but still trace-driven, never scripted) visual reveal appropriate
   * for the compact rig window. */
  async runComposition(fmtSource, argVals) {
    const evalResult = this.evaluatePrintf(fmtSource, argVals);
    if (evalResult.compileError) { await this.showCompileErrorOnBed(); return evalResult; }
    await this.animateComposingBed(fmtSource, argVals, evalResult);
    if (!this._alive) return evalResult;
    if (!evalResult.ok) {
      await this.showCrashStamp(evalResult.crash);
      this.clearBed(); this.clearRail();
      return evalResult;
    }
    this.verdictLamp.setFillStyle(0xffab00);
    await this.transferRowToLog(evalResult.text);
    this.clearBed(); this.clearRail();
    return evalResult;
  }

  async transferRowToLog(text) {
    const capsule = this.add.circle(OX + OW / 2, RAIL_Y, 4, C_BRASS, 0.9).setDepth(30);
    this.rigLayer.add(capsule);
    await this.delay(60);
    if (!this._alive) return;
    const targetX = this.cursorBlock.x, targetY = this.cursorBlock.y;
    await new Promise((res) => { this.tweens.add({ targets: capsule, x: targetX, y: targetY, duration: 200, ease: "Cubic.easeInOut", onComplete: res }); });
    capsule.destroy();
    this.verdictLamp.setFillStyle(0xffab00);
    await this.typeAtCursor(text, "compose");
    await this.delay(50);
  }

  showCompileErrorStamp() {
    const stamp = this.add.text(CX + CW / 2, CY + CH / 2, "COMPILE ERROR", { font: "bold 26px Arial", color: HEX_RED }).setOrigin(0.5).setDepth(80).setScale(1.7).setAngle(-8).setAlpha(0);
    this.missionElements.push(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 200, ease: "Cubic.easeOut" });
    this.screenShake(0.005, 170);
    this.time.delayedCall(1100, () => { if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 220, onComplete: () => stamp.destroy() }); });
  }

  screenShake(intensity = 0.004, duration = 150) {
    this.cameras.main.shake(duration, intensity);
  }

  // ══════════════════════════════════════════════════════════════
  // TEST REPORT & MISSION BRIEF
  // ══════════════════════════════════════════════════════════════

  createTestReportPanel() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0f0a06, 1);
    g.fillRoundedRect(RX, RY, RW, RH, 10);
    g.lineStyle(1, 0x3a2618, 1);
    g.strokeRoundedRect(RX, RY, RW, RH, 10);
    this.add.text(RX + 10, RY + 6, "TEST REPORT", { font: "bold 9px Arial", color: "#3d4450" }).setDepth(11);
    this.reportRows = [];
  }

  _compactTestLabel(test) {
    if (test.input) return test.input.join(" ⏎ ");
    return Object.values(test.subs || {}).join(", ");
  }

  buildReportRows(mission) {
    this.reportRows.forEach((r) => r.container.destroy());
    this.reportRows = [];
    mission.tests.forEach((test, i) => {
      const y = RY + 22 + i * 22;
      const c = this.add.container(RX + 10, y).setDepth(11).setAlpha(0.35);
      const label = this._compactTestLabel(test);
      const inputT = this.add.text(0, 0, label || "—", { font: "9px Courier New", color: "#b0bec5" }).setOrigin(0, 0.5);
      const expected = (test.expectedLog || test.expectedOutput || "").slice(0, 20);
      const expT = this.add.text(200, 0, expected, { font: "9px Courier New", color: "#78909c" }).setOrigin(0, 0.5);
      const statusT = this.add.text(RW - 16, 0, "…", { font: "13px Arial", color: "#78909c" }).setOrigin(0.5);
      c.add([inputT, expT, statusT]);
      this.reportRows.push({ container: c, statusT });
    });
  }

  updateReportRow(index, match) {
    const row = this.reportRows[index];
    if (!row) return;
    row.container.setAlpha(1);
    row.statusT.setText(match ? "✓" : "✗").setColor(match ? HEX_GREEN_BRIGHT : HEX_RED);
    if (!match) this.tweens.add({ targets: row.container, x: row.container.x + 3, duration: 35, yoyo: true, repeat: 5 });
  }

  createMissionBriefPanel() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x1a1108, 1);
    g.fillRoundedRect(BX, BY, BW, BH, 10);
    g.lineStyle(1, 0x3a2618, 1);
    g.strokeRoundedRect(BX, BY, BW, BH, 10);
    this.briefContainer = this.add.container(0, 0).setDepth(11);
  }

  renderMissionBrief(mission) {
    this.briefContainer.removeAll(true);
    const badge = this.add.circle(BX + 24, BY + 24, 13, C_GOLD);
    const badgeNum = this.add.text(BX + 24, BY + 24, String(mission.mission), { font: "bold 13px Arial", color: "#0a0e14" }).setOrigin(0.5);
    const title = this.add.text(BX + 46, BY + 16, mission.title, { font: "bold 14px Arial", color: "#e8dfc8" }).setOrigin(0, 0.5);
    const brief = this.add.text(BX + 14, BY + 42, mission.brief, { font: "12px Arial", color: "#90a4ae", wordWrap: { width: BW - 28 } }).setOrigin(0, 0);
    const hint = this.add.text(BX + BW - 12, BY + BH - 12, "HINT", { font: "bold 11px Arial", color: "#546e7a" }).setOrigin(1, 1).setInteractive({ useHandCursor: true });
    hint.on("pointerover", () => hint.setColor(HEX_GOLD));
    hint.on("pointerout", () => hint.setColor("#546e7a"));
    hint.on("pointerdown", () => this.onHintPressed());
    this.briefContainer.add([badge, badgeNum, title, brief, hint]);
  }

  createManifestStrip() {
    const g = this.add.graphics().setDepth(14);
    g.fillStyle(0x0f0a06, 0.9);
    g.fillRect(OX, STRIP_Y - 2, OW, 20);
    this.manifestStripText = this.add.text(OX + 8, STRIP_Y + 8, "", { font: "10px Arial", color: HEX_BRASS }).setOrigin(0, 0.5).setDepth(15);
  }
  updateManifestStrip(text) { this.manifestStripText.setText(text); }

  // ══════════════════════════════════════════════════════════════
  // HUD
  // ══════════════════════════════════════════════════════════════

  createHUD() {
    const g = this.add.graphics().setDepth(50);
    g.fillStyle(0x0f0a06, 0.93);
    g.fillRect(0, 0, W, 64);
    g.lineStyle(1, 0x3a2618, 1);
    g.lineBetween(0, 64, W, 64);

    this.add.text(20, 14, "THE PRINT FLOOR", { font: "bold 13px Arial", color: "#b0bec5" }).setDepth(51);
    this.add.text(20, 32, "Restructuring Phase — Output Methods: printf()", { font: "10px Arial", color: "#546e7a" }).setDepth(51);

    this.missionHexes = [];
    for (let i = 0; i < 6; i++) {
      const x = 490 + i * 26;
      const hx = this.add.graphics().setDepth(51);
      this.missionHexes.push({ g: hx, x, y: 32 });
    }
    this._drawHexes();

    this.add.text(1060, 10, "SCORE", { font: "9px Arial", color: "#546e7a" }).setDepth(51);
    this.scoreText = this.add.text(1060, 22, "0", { font: "bold 18px Arial", color: "#ffffff" }).setDepth(51);

    this.lifeIcons = [];
    for (let i = 0; i < 3; i++) {
      const lg = this.add.graphics({ x: 1150 + i * 30, y: 26 }).setDepth(51);
      lg.lineStyle(2, C_BRASS, 1);
      lg.strokeRoundedRect(-8, -6, 16, 11, 2);
      lg.fillStyle(C_BRASS, 1);
      lg.fillRect(-3, -3, 4, 4);
      this.lifeIcons.push(lg);
    }
  }

  _drawHexPath(g, x, y, r) {
    g.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i - Math.PI / 2;
      const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
      if (i === 0) g.moveTo(px, py); else g.lineTo(px, py);
    }
    g.closePath();
  }

  _drawHexes() {
    // Kill any leftover pulse tween on EVERY hex first — otherwise a
    // previous mission's infinite alpha-yoyo tween keeps running silently
    // on its (now completed) graphics object forever once the current
    // mission advances past it.
    this.missionHexes.forEach(({ g }) => { this.tweens.killTweensOf(g); g.setAlpha(1); });
    this.missionHexes.forEach(({ g, x, y }, i) => {
      g.clear();
      if (i < this.currentMission) { g.fillStyle(C_GOLD, 1); this._drawHexPath(g, x, y, 9); g.fillPath(); }
      else if (i === this.currentMission) { g.lineStyle(2, C_GOLD, 1); this._drawHexPath(g, x, y, 9); g.strokePath(); }
      else { g.lineStyle(1, C_GRAY, 1); this._drawHexPath(g, x, y, 9); g.strokePath(); }
    });
    if (this.missionHexes[this.currentMission]) {
      const m = this.missionHexes[this.currentMission];
      m.pulse = this.tweens.add({ targets: m.g, alpha: 0.5, duration: 600, yoyo: true, repeat: -1 });
    }
  }

  // ══════════════════════════════════════════════════════════════
  // BIT — Print Floor Manager variant
  // ══════════════════════════════════════════════════════════════

  createBit() {
    const c = this.add.container(90, 560).setDepth(60);
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
    apron.fillStyle(0x0a0503, 0.6);
    apron.fillCircle(6, 14, 2.5);
    const wrench = this.add.graphics();
    wrench.lineStyle(2, 0x8a6435, 0.8);
    wrench.lineBetween(18, 5, 30, 5);
    wrench.fillStyle(0x241a10, 1);
    wrench.fillRect(28, 1, 6, 8);
    const clipboard = this.add.graphics();
    clipboard.fillStyle(0x0d0a05, 1);
    clipboard.lineStyle(1, C_BRASS, 1);
    clipboard.fillRoundedRect(-32, -6, 14, 10, 1);
    clipboard.strokeRoundedRect(-32, -6, 14, 10, 1);
    clipboard.lineStyle(1, 0xe0e0e0, 0.5);
    for (let i = 0; i < 3; i++) clipboard.lineBetween(-30, -3 + i * 3, -20, -3 + i * 3);
    c.add([g, apron, eye, pupil, tip, wrench, clipboard]);
    this.tweens.add({ targets: tip, alpha: 0.3, duration: 900, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: c, y: "+=3", duration: 2000, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
    this.bit = c;
  }

  bitSay(text) {
    this.hideBubble();
    const inner = this.add.text(0, 0, text, { font: "13px Arial", color: "#e0e0e0", wordWrap: { width: 340 } });
    const bw = Math.min(inner.width, 340) + 30, bh = inner.height + 24;
    inner.setText("");
    const bx = Phaser.Math.Clamp(this.bit.x + 30, 20, W - bw - 20);
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
        delay: 20, repeat: Math.max(0, text.length - 1),
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
    const t = this.add.text(x, y, text, { font: "bold 8px Arial", color: colorHex }).setOrigin(0.5).setDepth(21).setAlpha(0);
    this.rigLayer.add(t);
    this.tweens.add({ targets: t, alpha: 1, duration: 180 });
    this.time.delayedCall(1300, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 200, onComplete: () => t.destroy() }); });
    return t;
  }

  floatingAnnotation(x, y, text, colorHex) {
    const t = this.add.text(x, y, text, { font: "bold 11px Arial", color: colorHex }).setOrigin(0.5).setDepth(70).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 300 });
    return t;
  }

  // ══════════════════════════════════════════════════════════════
  // TUTORIAL
  // ══════════════════════════════════════════════════════════════

  checkTutorial() {
    let done = false;
    try { done = localStorage.getItem(TUTORIAL_KEY) === "true"; } catch (_) {}
    if (done) this.time.delayedCall(300, () => this.showProjectBriefing(0));
    else this.runTutorial();
  }

  async runTutorial() {
    const A = () => this._alive;
    await this.delay(400); if (!A()) return;
    await this.bitSay("Welcome to the Print Floor, Manager. Down in the composing room you laid the type; up in the pressroom you struck the impressions. Here — HERE — we produce the finished work. Choose the right specifier for every value; precision where it counts; %n where the line breaks. Own every character.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4800)]); if (!A()) return;
    this.hideBubble();

    const a1 = this.floatingAnnotation(CX + CW / 2, CY - 16, "the format string is the script", HEX_CYAN);
    await this.delay(350); if (!A()) return;
    const a2 = this.floatingAnnotation(PX + PW / 2, PY - 12, "blocks — some are typos, some are wrong specifiers", HEX_GRAY);
    await this.delay(350); if (!A()) return;
    const a3 = this.floatingAnnotation(OX + OW / 2, OY - 12, "the composing bed shows the truth", C_GREEN_BRIGHT);
    await this.delay(350); if (!A()) return;
    const a4 = this.floatingAnnotation(890, 40, "lights when a run's live", "#e53935");
    await this.delay(350); if (!A()) return;
    const a5 = this.floatingAnnotation(RX + RW / 2, RY - 12, "every scenario must land clean", C_VIOLET);
    await this.delay(400); if (!A()) return;

    await this.bitSay("One promise: precision is the difference between a receipt that says '$3.14' and one that says '$3.140000'. Reach for %.2f when it matters. To the floor!");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();
    [a1, a2, a3, a4, a5].forEach((a) => this.tweens.add({ targets: a, alpha: 0, duration: 250, onComplete: () => a.destroy() }));

    try { localStorage.setItem(TUTORIAL_KEY, "true"); } catch (_) {}
    this.showProjectBriefing(0);
  }

  // ══════════════════════════════════════════════════════════════
  // MISSION LIFECYCLE
  // ══════════════════════════════════════════════════════════════

  showProjectBriefing(index) {
    this.currentMission = index;
    const mission = MISSIONS[index];
    this._drawHexes();

    const card = this.add.container(W / 2, H + 200).setDepth(90);
    const g = this.add.graphics();
    g.fillStyle(0x1a1108, 1);
    g.fillRoundedRect(-260, -105, 520, 210, 12);
    g.lineStyle(2, C_GOLD, 1);
    g.strokeRoundedRect(-260, -105, 520, 210, 12);
    g.fillStyle(C_GOLD, 1);
    g.fillRect(-260, -105, 5, 210);
    const badge = this.add.circle(-225, -75, 18, C_GOLD);
    const badgeNum = this.add.text(-225, -75, String(mission.mission), { font: "bold 16px Arial", color: "#0a0e14" }).setOrigin(0.5);
    const title = this.add.text(-195, -85, mission.title, { font: "bold 20px Arial", color: "#ffffff" }).setOrigin(0, 0.5);
    const desc = this.add.text(-225, -35, mission.brief, { font: "13px Arial", color: "#b0bec5", wordWrap: { width: 460 } }).setOrigin(0, 0);

    const startBtn = this.add.container(0, 85).setDepth(1);
    const sg = this.add.graphics();
    sg.fillStyle(C_GOLD, 1);
    sg.fillRoundedRect(-70, -20, 140, 40, 20);
    const st = this.add.text(0, 0, "START", { font: "bold 13px Arial", color: "#0a0e14" }).setOrigin(0.5);
    startBtn.add([sg, st]);
    startBtn.setSize(140, 40);
    startBtn.setInteractive({ useHandCursor: true });
    startBtn.on("pointerover", () => startBtn.setScale(1.05));
    startBtn.on("pointerout", () => startBtn.setScale(1));
    startBtn.on("pointerdown", () => {
      startBtn.disableInteractive();
      this.tweens.add({ targets: card, y: H + 200, duration: 400, ease: "Cubic.easeIn", onComplete: () => { card.destroy(); this.startMission(mission); } });
    });

    card.add([g, badge, badgeNum, title, desc, startBtn]);
    this.tweens.add({ targets: card, y: 335, duration: 400, ease: "Back.easeOut" });
  }

  startMission(mission) {
    this.slotContents = {};
    this.slotDefs = {};
    this.missionRunsFailed = 0;
    this.missionHintUsed = false;
    this.missionStartTime = this.time.now;
    this._runCountAtMissionStart = this.runCount;
    this._proactiveRecorded[mission.mission] = false;
    this.clearMission();

    this.tabFilename.setText(`Press${mission.mission}.java`);
    this.renderSkeleton(mission);
    this.populatePalette(mission);
    this.buildReportRows(mission);
    this.renderMissionBrief(mission);
    this.disableRunButton();
    this.highlightCodeLine(null);
    this.verdictLamp.setFillStyle(C_GRAY);
    this.clearMiniLog();
    this.clearBed();
    this.clearRail();
    this.loadMiniTape(mission.tests[0].input);
    this.updateManifestStrip("");
    this.setProduction(false);
  }

  clearMission() {
    this.missionElements.forEach((e) => { if (e && e.destroy) e.destroy(); });
    this.missionElements = [];
  }

  // ══════════════════════════════════════════════════════════════
  // SUBSTITUTION HELPERS
  // ══════════════════════════════════════════════════════════════

  _substitute(mission, test) {
    const decls = {};
    mission.skeleton.forEach((line) => {
      const m = line.match(/^(int|double|String)\s+(\w+)\s*=\s*\/\* test value \*\/;$/);
      if (!m) return;
      const [, type, name] = m;
      const raw = test.subs ? test.subs[name] : undefined;
      if (raw === undefined) return;
      let value;
      if (type === "int") value = parseInt(raw, 10);
      else if (type === "double") value = parseFloat(raw);
      else value = raw.replace(/^"|"$/g, "");
      decls[name] = { value, type: type === "String" ? "string" : type };
    });
    return decls;
  }

  compileCheck(code) {
    if (/\.toUpperCase$/.test((code || "").trim()) || /\.toLowerCase$/.test((code || "").trim())) return { ok: false, tag: "property_vs_method_syntax" };
    return { ok: true };
  }

  // ══════════════════════════════════════════════════════════════
  // GENUINE INTERPRETER — per-mission, honest sequential execution
  // ══════════════════════════════════════════════════════════════

  async runProgram(mission, assembled, test) {
    const decls = this._substitute(mission, test);

    if (mission.mission === 1) {
      const argVals = [decls.name, decls.points];
      const r = await this.runComposition(assembled.format[0].code, argVals);
      return { ok: r.ok };
    }

    if (mission.mission === 2) {
      const argVals = [decls.price];
      const r = await this.runComposition(assembled.format[0].code, argVals);
      return { ok: r.ok };
    }

    if (mission.mission === 3) {
      const argVals = [decls.item, decls.qty, decls.price];
      const r = await this.runComposition(assembled.format[0].code, argVals);
      return { ok: r.ok };
    }

    if (mission.mission === 4) {
      const argVals = [decls.subtotal, decls.tax, decls.total];
      const r = await this.runComposition(assembled.format[0].code, argVals);
      return { ok: r.ok };
    }

    if (mission.mission === 5) {
      this.updateManifestStrip('line 2 → System.out.printf("Enter item: ")');
      const r1 = await this.runComposition('"Enter item: "', []);
      if (!r1.ok) return { ok: false };
      await this.delay(60);
      if (!this._alive) return { ok: false };
      this.updateManifestStrip("line 3 → String item = sc.nextLine()");
      const read1 = this.evaluateNextLine(this.tapeState);
      await this.tapeConsumeVisual(read1.consumedCount);
      await this.echoScannerInput(read1.rawValue);
      decls.item = { value: read1.rawValue, type: "string" };

      this.updateManifestStrip('line 5 → System.out.printf("Enter quantity: ")');
      const r2 = await this.runComposition('"Enter quantity: "', []);
      if (!r2.ok) return { ok: false };
      await this.delay(60);
      if (!this._alive) return { ok: false };
      this.updateManifestStrip("line 6 → int qty = sc.nextInt()");
      const read2 = this.evaluateNextToken(this.tapeState);
      await this.tapeConsumeVisual(read2.consumedCount);
      await this.echoScannerInput(read2.rawValue);
      decls.qty = { value: parseInt(read2.rawValue, 10) || 0, type: "int" };

      this.updateManifestStrip("line 8 → System.out.printf(confirm, qty, item)");
      const argVals = [decls.qty, decls.item];
      const r3 = await this.runComposition(assembled.confirm[0].code, argVals);
      return { ok: r3.ok };
    }

    if (mission.mission === 6) {
      this.updateManifestStrip("line 2 → String anchor = sc.nextLine()");
      const read1 = this.evaluateNextLine(this.tapeState);
      await this.tapeConsumeVisual(read1.consumedCount);
      await this.echoScannerInput(read1.rawValue);
      decls.anchor = { value: read1.rawValue, type: "string" };

      this.updateManifestStrip("line 3 → String headline = sc.nextLine()");
      const read2 = this.evaluateNextLine(this.tapeState);
      await this.tapeConsumeVisual(read2.consumedCount);
      await this.echoScannerInput(read2.rawValue);
      decls.headline = { value: read2.rawValue, type: "string" };

      const anchorCode = assembled.anchor_arg[0].code;
      const headlineCode = assembled.headline_arg[0].code;
      const anchorCheck = this.compileCheck(anchorCode);
      if (!anchorCheck.ok) { await this.showCompileErrorOnBed(); return { ok: false }; }
      const headlineCheck = this.compileCheck(headlineCode);
      if (!headlineCheck.ok) { await this.showCompileErrorOnBed(); return { ok: false }; }

      const anchorEval = this.evaluateCaseArg(anchorCode, decls);
      const headlineEval = this.evaluateCaseArg(headlineCode, decls);
      if (!anchorEval.ok || !headlineEval.ok) { await this.showCompileErrorOnBed(); return { ok: false }; }

      this.updateManifestStrip("line 6 → System.out.printf(format, anchor_arg, headline_arg, duration)");
      const argVals = [anchorEval, headlineEval, decls.duration];
      const r = await this.runComposition(assembled.format[0].code, argVals);
      return { ok: r.ok };
    }

    return { ok: true };
  }

  // ══════════════════════════════════════════════════════════════
  // RUN
  // ══════════════════════════════════════════════════════════════

  _collectWrongBlocksUsed() {
    const used = [];
    for (const id in this.slotContents) {
      (this.slotContents[id] || []).forEach((b) => {
        const tag = b.container.getData("tag");
        if (tag) used.push({ code: b.container.getData("code"), tag });
      });
    }
    return used;
  }

  _recordProactiveMetrics(mission) {
    if (this._proactiveRecorded[mission.mission]) return;
    this._proactiveRecorded[mission.mission] = true;
    if (mission.precisionMarker) {
      const fmtCode = this.slotContents.format && this.slotContents.format[0].container.getData("code");
      this.precisionProactive[`mission${mission.mission}`] = !!(fmtCode && fmtCode.includes(mission.precisionMarker));
    }
  }

  _recordRunOutcomeMetrics(mission, passed) {
    if (mission.mission === 3 || mission.mission === 6) {
      if (this.specifierProactive[`mission${mission.mission}`] === undefined) this.specifierProactive[`mission${mission.mission}`] = passed;
    }
    if (mission.mission === 5 || mission.mission === 6) {
      if (this.crossWingCleanFirstRun[`mission${mission.mission}`] === undefined) this.crossWingCleanFirstRun[`mission${mission.mission}`] = passed;
    }
    if (passed && (mission.mission === 4 || mission.mission === 5 || mission.mission === 6)) {
      const fmtCode = (this.slotContents.format || this.slotContents.confirm)[0].container.getData("code");
      this.newlineFormChoice[`mission${mission.mission}`] = fmtCode.includes("\\n") && !fmtCode.includes("%n") ? "\\n" : "%n";
    }
  }

  async onRunPressed() {
    if (this.inputLocked) return;
    this.inputLocked = true;
    this.disableRunButton();
    this.runButton.t.setText("...");
    this.runCount++;
    const mission = MISSIONS[this.currentMission];
    const isFirstRunOfMission = this.runCount === this._runCountAtMissionStart + 1;
    this._recordProactiveMetrics(mission);
    const assembled = this.getAssembledCode();
    const wrongBlocksUsed = this._collectWrongBlocksUsed();
    this.setProduction(true, true);

    let anyMismatch = false;
    const failedTests = [];
    for (let i = 0; i < mission.tests.length; i++) {
      if (!this._alive) return;
      const test = mission.tests[i];
      const outcome = await this.runTestCase(mission, test, i, assembled);
      if (!outcome.match) { anyMismatch = true; failedTests.push(this._compactTestLabel(test)); }
    }

    if (isFirstRunOfMission) this._recordRunOutcomeMetrics(mission, !anyMismatch);
    const resultKind = anyMismatch ? "logic_fail" : "pass";
    this._resolveRunOutcome(mission, resultKind, wrongBlocksUsed, failedTests);
  }

  async runTestCase(mission, test, index, assembled) {
    this.clearMiniLog();
    this.loadMiniTape(test.input);
    const runResult = await this.runProgram(mission, assembled, test);
    if (!this._alive) return { match: false };

    let match;
    if (!runResult.ok) {
      match = false;
      this.verdictLamp.setFillStyle(C_RED);
    } else {
      const logText = this.rows.join("⏎");
      const expected = test.expectedLog || test.expectedOutput;
      match = logText === expected;
      if (!match && mission.lenientTrailingNewline) match = logText === expected + "⏎";
      this.verdictLamp.setFillStyle(match ? C_GREEN_BRIGHT : C_RED);
    }

    this.updateReportRow(index, match);
    await this.delay(150);
    return { match };
  }

  _resolveRunOutcome(mission, result, wrongBlocksUsed, failedTests) {
    const timeMs = Math.round(this.time.now - this.missionStartTime);
    this.attemptLog.push({
      mission: mission.mission, runNumber: this.runCount, result,
      blocksUsed: Object.values(this.getAssembledCode()).flat().map((b) => b.code),
      wrongBlocks: wrongBlocksUsed, failedTests, timeMs, hintUsedBefore: this.missionHintUsed,
    });

    if (result === "pass") { this.onMissionComplete(); return; }

    this.failedRunCount++;
    this.missionRunsFailed++;
    this.runButton.t.setText("▶ RUN");
    this.setProduction(false);

    let livesLostThisRun = false;
    const tagsThisRun = new Set(wrongBlocksUsed.map((b) => b.tag));
    tagsThisRun.forEach((tag) => {
      if (!tag) return;
      this.wrongBlockHistory[tag] = (this.wrongBlockHistory[tag] || 0) + 1;
      if (this.wrongBlockHistory[tag] >= 2) livesLostThisRun = true;
    });

    const feedbackTag = wrongBlocksUsed[0] && wrongBlocksUsed[0].tag;

    (async () => {
      if (livesLostThisRun) {
        const dead = this.loseLife();
        if (dead) { this.time.delayedCall(500, () => this.gameOver()); return; }
      }
      await this.showBitFeedback(MISCONCEPTION_FEEDBACK[feedbackTag] || "Check the report — the rig shows exactly what your code actually does.");
      if (!this._alive) return;
      this.unlockForRepair();
    })();
  }

  unlockForRepair() {
    this.inputLocked = false;
    this.updateRunButtonState();
  }

  onHintPressed() {
    if (this.inputLocked) return;
    this.missionHintUsed = true;
    this.hintCount++;
    this.updateScore(-25);
    const mission = MISSIONS[this.currentMission];
    const hints = {
      1: "%s accepts any type; %d demands an int. Match the specifier count to the argument count, in order.",
      2: "Precision on a floating-point specifier: %.2f gives exactly two decimals, always — trimmed or padded.",
      3: "Three values, three specifiers: %s for the String, %d for the int, %.2f for the double, in that order.",
      4: "Every line needs %n before the next one starts — including one after the last line.",
      5: "The confirm format takes qty (int) then item (String), in that exact order — match your specifiers to that order.",
      6: "Uppercase both fields with .toUpperCase(), use %.1f for duration, and don't forget the blank line (%n%n) between the story and the duration.",
    };
    this.showBitFeedback(hints[mission.mission] || "Reread the brief carefully — the answer is in the wording.");
  }

  onMissionComplete() {
    if (this.gameEnded) return;
    const flawless = this.missionRunsFailed === 0 && !this.missionHintUsed;
    if (flawless) this.flawlessCount++;
    this.updateScore(250 + (flawless ? 100 : 0));
    if (flawless) this.createFloatingText(OX + OW / 2, OY - 14, "FLAWLESS +100", HEX_GOLD, "bold 14px Arial");

    this.missionFanfare().then(() => {
      if (!this._alive || this.gameEnded) return;
      const next = this.currentMission + 1;
      if (next >= MISSIONS.length) this.levelComplete();
      else this.showProjectBriefing(next);
    });
  }

  async missionFanfare() {
    this.verdictLamp.setFillStyle(C_GREEN_BRIGHT);
    this.setProduction(true, true);
    this.createConfetti(OX + OW / 2, OY + OH / 2);
    this._drawHexes();
    const hx = this.missionHexes[this.currentMission];
    if (hx) {
      hx.g.clear();
      hx.g.fillStyle(C_GOLD, 1);
      this._drawHexPath(hx.g, hx.x, hx.y, 9);
      hx.g.fillPath();
      this.tweens.add({ targets: hx.g, alpha: 0.4, duration: 150, yoyo: true, repeat: 2 });
    }
    const mission = MISSIONS[this.currentMission];
    await this.bitSay(mission.postMissionNote || "Nice work — the rig confirms it's correct!");
    await Promise.race([this.waitForClick(), this.delay(2200)]);
    this.hideBubble();
    await this.delay(400);
  }

  createFloatingText(x, y, text, colorHex, font = "bold 14px Arial") {
    const t = this.add.text(x, y, text, { font, color: colorHex }).setOrigin(0.5).setDepth(75);
    this.tweens.add({ targets: t, y: y - 25, alpha: 0, duration: 800, ease: "Cubic.easeOut", onComplete: () => t.destroy() });
    return t;
  }

  createConfetti(x, y, count = 24) {
    const p = this.add.particles(x, y, "l45_dot", {
      speed: { min: 70, max: 220 }, angle: { min: 0, max: 360 }, scale: { start: 0.8, end: 0 }, lifespan: 450,
      tint: [C_CYAN, C_GOLD, C_GREEN_BRIGHT, C_ORANGE, 0xffffff], emitting: false,
    }).setDepth(75);
    p.explode(count);
    this.time.delayedCall(800, () => p.destroy());
  }

  createGoldCyanOrangeConfetti(x, y, count = 40) {
    const p = this.add.particles(x, y, "l45_dot", {
      speed: { min: 100, max: 280 }, angle: { min: 0, max: 360 }, scale: { start: 1, end: 0 }, lifespan: 700,
      tint: [C_GOLD, C_CYAN, C_ORANGE, 0xffffff], emitting: false,
    }).setDepth(96);
    p.explode(count);
    this.time.delayedCall(1000, () => p.destroy());
  }

  updateScore(points) {
    this.score = Math.max(0, this.score + points);
    const counter = { v: this.displayScore };
    this.tweens.add({
      targets: counter, v: this.score, duration: 300,
      onUpdate: () => { this.displayScore = Math.round(counter.v); if (this.scoreText.active) this.scoreText.setText(String(this.displayScore)); },
    });
  }

  loseLife() {
    this.lives = Math.max(0, this.lives - 1);
    const icon = this.lifeIcons[this.lives];
    if (icon) this.tweens.add({ targets: icon, alpha: 0.12, duration: 400 });
    return this.lives <= 0;
  }

  // ══════════════════════════════════════════════════════════════
  // END STATES
  // ══════════════════════════════════════════════════════════════

  gameOver() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearMission();
    this.hideBubble();
    this.verdictLamp.setFillStyle(0x333333);
    this.setProduction(false);

    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
    this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });

    const title = this.add.text(640, 240, "PRINT FLOOR HALTED", { font: "bold 36px Arial", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
    this.tweens.add({ targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut", onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }) });
    this.add.text(640, 310, `Score: ${this.score}`, { font: "20px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
    this.add.text(640, 350, `Missions Completed: ${this.currentMission} / ${MISSIONS.length}`, { font: "16px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);

    this._makeButton(640, 420, "RESUME PRODUCTION", 240, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearMission();
    this.hideBubble();

    try { GameManager.completeLevel(44, Math.round((this.flawlessCount / MISSIONS.length) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("printf_mastery"); } catch (_) {}
    try {
      localStorage.setItem("level45_results", JSON.stringify({
        level: 45, concept: "output_printf", phase: "restructuring",
        score: this.score, missionsCompleted: 6, flawlessMissions: this.flawlessCount,
        totalRuns: this.runCount, failedRuns: this.failedRunCount, hintsUsed: this.hintCount,
        selfCorrections: this.selfCorrectionCount, precisionAppliedProactively: this.precisionProactive,
        specifierMatchProactively: this.specifierProactive, newlineFormChoice: this.newlineFormChoice,
        crossWingCleanFirstRun: this.crossWingCleanFirstRun,
        livesRemaining: this.lives, attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.triggerWingFinaleCeremony();
  }

  // ══════════════════════════════════════════════════════════════
  // WING FINALE CEREMONY (5 phases)
  // ══════════════════════════════════════════════════════════════

  async triggerWingFinaleCeremony() {
    await this.ceremonyPhase1_MissionFanfare();
    if (!this._alive) return;
    await this.ceremonyPhase2_MachinesAssemble();
    if (!this._alive) return;
    await this.ceremonyPhase3_CentralPanel();
    if (!this._alive) return;
    await this.ceremonyPhase4_WingSeal();
    if (!this._alive) return;
    await this.ceremonyPhase5_BitFinalSpeech();
  }

  async ceremonyPhase1_MissionFanfare() {
    this.setProductionGold("BROADCAST READY");
    this.clearMiniLog();
    await this.runComposition('"%s"', [{ value: "ALL SIX MISSIONS SHIPPED", type: "string" }]);
    this.createGoldCyanOrangeConfetti(OX + OW / 2, OY + OH / 2, 30);
    this.ambient.forEach((p) => this.tweens.add({ targets: p, y: p.y - 200, duration: 900, ease: "Cubic.easeOut" }));
    await this.delay(1200);
  }

  async ceremonyPhase2_MachinesAssemble() {
    this._trilogyIcons = this.add.container(0, 0).setDepth(88);
    const positions = [[300, 260], [500, 260], [700, 260]];
    const labels = ["🗼", "🗜", "📋"];
    for (let i = 0; i < 3; i++) {
      const [x, y] = positions[i];
      const c = this.add.container(x, -60);
      const g = this.add.graphics();
      g.fillStyle(0x1a1108, 0.9);
      g.lineStyle(2, C_GOLD, 1);
      g.fillCircle(0, 0, 30);
      g.strokeCircle(0, 0, 30);
      const label = this.add.text(0, 0, labels[i], { font: "24px Arial" }).setOrigin(0.5);
      c.add([g, label]);
      this._trilogyIcons.add(c);
      this.tweens.add({ targets: c, y, duration: 500, delay: i * 300, ease: "Back.easeOut" });
    }
    await this.delay(2000);
  }

  async ceremonyPhase3_CentralPanel() {
    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
    this.tweens.add({ targets: ov, fillAlpha: 0.85, duration: 500 });
    this._ceremonyOverlay = ov;

    const panel = this.add.graphics().setDepth(90);
    panel.fillStyle(0x1a1108, 1);
    panel.fillRoundedRect(320, 65, 640, 540, 16);
    panel.lineStyle(2, C_GOLD, 1);
    panel.strokeRoundedRect(320, 65, 640, 540, 16);
    this._ceremonyPanel = panel;

    const title = this.add.text(640, 100, "PRINT FLOOR MANAGER", { font: "bold 32px Georgia", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(91).setScale(0);
    this.tweens.add({ targets: title, scale: 1, duration: 350, ease: "Back.easeOut" });
    this._ceremonyElements = [title];

    const precisionCount = Object.values(this.precisionProactive).filter(Boolean).length;
    const crossWingCount = Object.values(this.crossWingCleanFirstRun).filter(Boolean).length;
    const lines = [
      `MISSIONS: 6/6`, `FLAWLESS: ${this.flawlessCount}`, `SELF-CORRECTIONS: ${this.selfCorrectionCount}`,
      `PRECISION-PROACTIVE: ${precisionCount}/4`, `CROSS-WING CLEAN: ${crossWingCount}/2`, `HINTS: ${this.hintCount}`,
    ];
    lines.forEach((s, i) => {
      const t = this.add.text(480, 148 + i * 24, s, { font: "13px Arial", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 250, delay: 300 + i * 130 });
      this._ceremonyElements.push(t);
    });
    const totalText = this.add.text(480, 148 + 6 * 24, "TOTAL: 0", { font: "bold 20px Arial", color: HEX_GOLD }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: totalText, alpha: 1, duration: 250, delay: 1100 });
    const counter = { v: 0 };
    this.tweens.add({ targets: counter, v: this.score, duration: 1000, delay: 1100, onUpdate: () => totalText.setText(`TOTAL: ${Math.round(counter.v)}`) });
    this._ceremonyElements.push(totalText);

    const stars = this._starRating();
    for (let i = 0; i < 3; i++) {
      const earned = i < stars;
      const s = this.add.text(640 + (i - 1) * 60, 350, "★", { font: "34px Arial", color: earned ? HEX_GOLD : "#2a3040" }).setOrigin(0.5).setDepth(91).setScale(0);
      this.tweens.add({ targets: s, scale: 1, duration: 250, delay: 1700 + i * 200, ease: earned ? "Back.easeOut" : "Cubic.easeOut" });
      this._ceremonyElements.push(s);
    }

    const badge = this.add.container(640, 420).setDepth(91).setAlpha(0);
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillCircle(0, 0, 34);
    bg.lineStyle(3, C_GOLD, 1);
    bg.strokeCircle(0, 0, 34);
    const icons = this.add.text(0, -2, "🖨", { font: "20px Arial" }).setOrigin(0.5);
    badge.add([bg, icons]);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 2100 });
    const badgeLbl = this.add.text(640, 462, "printf() MASTERY", { font: "bold 14px Arial", color: HEX_GOLD }).setOrigin(0.5).setDepth(91).setAlpha(0);
    const badgeSub = this.add.text(640, 480, "Accretion ✓  Tuning ✓  Restructuring ✓", { font: "10px Arial", color: "#78909c" }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: [badgeLbl, badgeSub], alpha: 1, duration: 300, delay: 2200 });
    this._ceremonyElements.push(badge, badgeLbl, badgeSub);

    await this.delay(2600);
  }

  async ceremonyPhase4_WingSeal() {
    const ribbon = this.add.container(640 - 500, 545).setDepth(92);
    const rg = this.add.graphics();
    rg.fillStyle(0x1a1a2e, 1);
    rg.lineStyle(3, C_GOLD, 1);
    rg.fillRoundedRect(-225, -35, 450, 70, 6);
    rg.strokeRoundedRect(-225, -35, 450, 70, 6);
    const wingTitle = this.add.text(0, -20, "OUTPUT WING — COMPLETE", { font: "bold 18px Georgia", color: HEX_GOLD }).setOrigin(0.5);
    ribbon.add([rg, wingTitle]);
    this._ceremonyElements.push(ribbon);

    await new Promise((res) => { this.tweens.add({ targets: ribbon, x: 640, duration: 500, ease: "Back.easeOut", onComplete: res }); });

    const methods = [
      { label: "println() ✓", icon: "🗼" },
      { label: "print() ✓", icon: "🎙" },
      { label: "printf() ✓", icon: "🔤" },
    ];
    for (let i = 0; i < methods.length; i++) {
      if (!this._alive) return;
      const t = this.add.text(ribbon.x - 150 + i * 150, ribbon.y + 8, methods[i].label, { font: "bold 13px Arial", color: "#2a3040" }).setOrigin(0.5).setDepth(93);
      this._ceremonyElements.push(t);
      await this.delay(400);
      t.setColor(HEX_GREEN_BRIGHT);
      this.createConfetti(t.x, t.y, 8);
      this.tweens.add({ targets: t, scale: 1.2, duration: 150, yoyo: true });
    }

    const caption = this.add.text(640, 600, "9 levels · 3 methods · 1 production-ready output schema", { font: "italic 11px Georgia", color: HEX_BRASS }).setOrigin(0.5).setDepth(93).setAlpha(0);
    this.tweens.add({ targets: caption, alpha: 0.85, duration: 300 });
    this._ceremonyElements.push(caption);

    this.createGoldCyanOrangeConfetti(640, 100, 50);
    if (this._trilogyIcons) {
      this.tweens.add({ targets: this._trilogyIcons.list, angle: 90, duration: 800, ease: "Cubic.easeInOut" });
    }
    await this.delay(1200);
  }

  async ceremonyPhase5_BitFinalSpeech() {
    this.bit.setPosition(W + 100, 500);
    this.bit.setVisible(true);
    await new Promise((res) => { this.tweens.add({ targets: this.bit, x: 1150, duration: 500, ease: "Cubic.easeOut", onComplete: res }); });
    await this.bitSay("Fifteen levels of the Output Wing — println's shout, print's whisper, printf's precise composition. You now have every tool Java gives you to speak to the world. The next wing awaits. But take this in first, Manager. You EARNED the Output Wing.");
    if (!this._alive) return;
    await Promise.race([this.waitForClick(), this.delay(6000)]);
    this.hideBubble();

    this._makeButton(500, 570, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(760, 570, "NEXT WING →", 220, 44, { fill: 0x00733a, stroke: C_GREEN_BRIGHT, textColor: "#ffffff" }, () => {
      this.scene.start("MenuScene");
    });
  }

  _starRating() {
    if (this.flawlessCount >= 4 && this.hintCount <= 1) return 3;
    if (this.attemptLog.filter((a) => a.result !== "pass").length <= 6) return 2;
    return 1;
  }

  _makeButton(x, y, label, w, h, style, onClick, depth = 97) {
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
