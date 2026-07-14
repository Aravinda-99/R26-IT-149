/**
 * Level 44 — "The Presses" (Output Methods: Tuning Phase — printf())
 * ===========================================================================
 * Tunes the Level 43 printf() schema under time pressure. The impression
 * arm's height IS the timer — it descends linearly over the round's time
 * limit; answer before it strikes or the tray SMEARS. The reveal always
 * plays the true composition on the press bed + type case rail (ported
 * from Level 43's parser/evaluator and slug/slot machinery) before
 * transferring honestly to the reference log — never scripted.
 *
 * evaluatePrintf() is the Level 43 evaluator unmodified: real half-up
 * rounding via toFixed(), real padding, real type checks producing
 * IllegalFormatConversionException / MissingFormatArgumentException.
 * Wave 3's bug-hunt rounds don't special-case their crashes — they run
 * the learner's actual buggy call through the same evaluator, so the
 * "missing argument" and "wrong specifier" exceptions are genuinely
 * derived, matching the level's own design rationale (§0).
 */

import Phaser from "phaser";
import { GameManager } from "../../../GameManager.js";
import { BadgeSystem } from "../../../BadgeSystem.js";

const W = 1280, H = 720;

const C_CYAN = 0x4fc3f7, C_GOLD = 0xffd740, C_ORANGE = 0xff9800, C_VIOLET = 0x7b1fa2;
const C_GREEN_BRIGHT = 0x00e676, C_RED = 0xf44336, C_GRAY = 0x78909c, C_BRASS = 0xc8a05a;
const HEX_CYAN = "#4fc3f7", HEX_GOLD = "#ffd740", HEX_ORANGE = "#ff9800", HEX_VIOLET = "#7b1fa2";
const HEX_GREEN_BRIGHT = "#00e676", HEX_RED = "#f44336", HEX_GRAY = "#78909c";
const HEX_MAGENTA = "#ff4081", HEX_BRASS = "#c8a05a";

const BED_CX = 500;
const ARM_X0 = 230, ARM_X1 = 770, ARM_Y_HIGH = 140, ARM_Y_LOW = 290;
const BED_X0 = 220, BED_X1 = 780, BED_Y0 = 300, BED_Y1 = 440, BED_CY = 356;
const RAIL_X0 = 220, RAIL_X1 = 780, RAIL_Y = 505;
const LOG_X = 830, LOG_Y = 96, LOG_W = 410, LOG_H = 490;
const LOG_CONTENT_Y0 = LOG_Y + 40;
const ROW_H = 26;
const LOG_TEXT_X = LOG_X + 34;
const TUTORIAL_KEY = "level44_tutorial_done";
const WAVE_TIME = { 1: 12000, 2: 10000, 3: 9000 };

// ══════════════════════════════════════════════════════════════
// ROUND CONFIGURATION
// ══════════════════════════════════════════════════════════════
const ROUNDS = [
  // ══ WAVE 1 — Rapid Substitution Fluency (12s) ══
  { round: 1, wave: 1, type: "predict", source: ['System.out.printf("Score: %d", 100);'],
    question: "What appears on the log?", correct: "Score: 100",
    options: [
      { value: "Score: 100", tag: null },
      { value: "Score: %d", tag: "format_specifier_prints_literally_belief" },
      { value: "Score: 100⏎", tag: "printf_adds_newline_belief" },
      { value: "Score: 100.0", tag: "int_becomes_double_belief" },
    ], concept: "fluent_d_substitution" },

  { round: 2, wave: 1, type: "predict", source: ['System.out.printf("%s says %s", "Bit", "hi");'],
    question: "What appears on the log?", correct: "Bit says hi",
    options: [
      { value: "Bit says hi", tag: null },
      { value: "hi says Bit", tag: "argument_order_reversed_belief" },
      { value: "%s says %s", tag: "format_specifier_prints_literally_belief" },
      { value: "Bit says Bit", tag: "same_arg_used_twice_belief" },
    ], concept: "fluent_two_s_ordered" },

  { round: 3, wave: 1, type: "predict", source: ['System.out.printf("Item %d: %s", 3, "coffee");'],
    question: "What appears on the log?", correct: "Item 3: coffee",
    options: [
      { value: "Item 3: coffee", tag: null },
      { value: "Item coffee: 3", tag: "argument_order_reversed_belief" },
      { value: "Item %d: %s", tag: "format_specifier_prints_literally_belief" },
      { value: 'Item 3: "coffee"', tag: "quotes_print_belief" },
    ], concept: "fluent_mixed_types" },

  { round: 4, wave: 1, type: "predict", source: ['System.out.printf("%s%d", "L", 42);'],
    question: "What appears on the log?", correct: "L42",
    options: [
      { value: "L42", tag: null },
      { value: "L 42", tag: "space_between_specifiers_belief" },
      { value: "42L", tag: "argument_order_reversed_belief" },
      { value: "%s%d", tag: "format_specifier_prints_literally_belief" },
    ],
    revealNote: "Cyan slot and gold slot side by side — 'L' and 42 fuse edge to edge on the log. printf never adds spaces.",
    concept: "fluent_adjacent_specifiers" },

  { round: 5, wave: 1, type: "predict", source: ['System.out.printf("%s = %d", "count", 7);'],
    question: "What appears on the log?", correct: "count = 7",
    options: [
      { value: "count = 7", tag: null },
      { value: "count = count", tag: "same_arg_used_twice_belief" },
      { value: '"count" = 7', tag: "quotes_print_belief" },
      { value: "7 = count", tag: "argument_order_reversed_belief" },
    ], concept: "fluent_variable_label_pattern" },

  // ══ WAVE 2 — Precision & Newlines (10s) ══
  { round: 6, wave: 2, type: "predict", source: ['System.out.printf("%.1f", 5.678);'],
    question: "What appears on the log?", correct: "5.7",
    options: [
      { value: "5.7", tag: null },
      { value: "5.6", tag: "precision_truncates_not_rounds_belief" },
      { value: "5.678", tag: "precision_ignored_belief" },
      { value: "6", tag: "precision_removes_all_decimals_belief" },
    ],
    revealNote: "Half-up rounding: 5.678 rounds to 5.7 at one decimal (the 78 pushes UP). Java printf rounds, it doesn't just drop digits.",
    concept: "precision_rounds_up" },

  { round: 7, wave: 2, type: "predict", source: ['System.out.printf("%.2f", 100.5);'],
    question: "What appears on the log?", correct: "100.50",
    options: [
      { value: "100.50", tag: null },
      { value: "100.5", tag: "padding_ignored_belief" },
      { value: "100.500", tag: "precision_off_by_one_belief" },
      { value: "101", tag: "precision_removes_all_decimals_belief" },
    ],
    revealNote: "Precision PADS as well as trims. 100.5 has one decimal, but %.2f demands TWO — a trailing zero pads it: 100.50.",
    concept: "precision_pads_with_zero" },

  { round: 8, wave: 2, type: "predict", source: ['System.out.printf("%.0f", 3.7);'],
    question: "What appears on the log?", correct: "4",
    options: [
      { value: "4", tag: null },
      { value: "3", tag: "rounding_direction_confusion" },
      { value: "3.7", tag: "precision_ignored_belief" },
      { value: "3.0", tag: "precision_off_by_one_belief" },
    ],
    revealNote: "%.0f keeps ZERO decimals but STILL rounds. 3.7 → 4 (half-up), and no decimal point at all.",
    concept: "precision_zero_decimals_rounds" },

  { round: 9, wave: 2, type: "predict", source: ['System.out.printf("Line %d%nLine %d", 1, 2);'],
    question: "What appears on the log AND where is the cursor?", correct: "line1_line2_cursor_end_of_second",
    options: [
      { value: "line1_line2_cursor_end_of_second", tag: null, label: "Line 1 / Line 2 (cursor at end of 'Line 2')" },
      { value: "line1_percentn_line2_one_row", tag: "n_specifier_ignored_belief", label: "'Line 1%nLine 2' literal (one row)" },
      { value: "line1_line2_cursor_row_03", tag: "printf_adds_newline_belief", label: "Line 1 / Line 2 (cursor on row 03)" },
      { value: "line1line2_no_break", tag: "n_specifier_ignored_belief", label: "'Line 1Line 2' (no break)" },
    ],
    revealNote: "The violet %n slot auto-fills with ⏎. 'Line 1' types row 01, ⏎ jumps to row 02, 'Line 2' types there. No final newline — cursor rests at end.",
    concept: "n_mid_string_fluent" },

  { round: 10, wave: 2, type: "predict", source: ['System.out.printf("A");', 'System.out.printf("B%n");', 'System.out.printf("C");'],
    question: "What appears on the log AND where is the cursor?", correct: "AB_row01_C_row02_cursor_end_C",
    options: [
      { value: "AB_row01_C_row02_cursor_end_C", tag: null, label: "'AB' (row 01) / 'C' (row 02, cursor at end of C)" },
      { value: "A_B_C_three_rows", tag: "printf_adds_newline_belief", label: "A / B / C (three rows)" },
      { value: "ABC_one_row", tag: "n_specifier_ignored_belief", label: "'ABC' (one row)" },
      { value: "AB_C_cursor_row03", tag: "printf_adds_newline_belief_end", label: "'AB' / 'C' / cursor row 03" },
    ],
    revealNote: "Three printfs, three transmissions. A on row 01. B extends row 01 → 'AB', then %n jumps to row 02. C on row 02. Cursor rests at end of C.",
    concept: "printf_chain_with_n_fluent" },

  // ══ WAVE 3 — Complex Traces & Bug Hunt ══
  { round: 11, wave: 3, type: "trace", source: ['System.out.printf("%s: %.2f%n%s: %.2f", "Coffee", 3.5, "Tea", 2.0);'],
    question: "What appears on the log AND where is the cursor?", correct: "coffee350_tea200_cursor_end",
    options: [
      { value: "coffee350_tea200_cursor_end", tag: null, label: "'Coffee: 3.50' / 'Tea: 2.00' (cursor at end of 2.00)" },
      { value: "coffee35_tea2_no_padding", tag: "padding_ignored_belief", label: "'Coffee: 3.5' / 'Tea: 2.0'" },
      { value: "all_one_row", tag: "n_specifier_ignored_belief", label: "'Coffee: 3.50Tea: 2.00' (one row)" },
      { value: "coffee35_tea2_cursor_row03", tag: "printf_adds_newline_belief", label: "'Coffee: 3.5' / 'Tea: 2.0' / cursor row 03" },
    ],
    revealNote: "Four slugs, four slots, in order. %.2f pads 3.5 → '3.50' and 2.0 → '2.00'. %n splits the rows. No final newline.",
    concept: "complex_trace_multi_specifier" },

  { round: 12, wave: 3, type: "trace", source: ['System.out.printf("%s", "Total: ");', 'System.out.printf("$%.2f%n", 42.5);', 'System.out.printf("Thanks!");'],
    question: "What appears on the log AND where is the cursor?", correct: "total_dollar_4250_row01_thanks_row02",
    options: [
      { value: "total_dollar_4250_row01_thanks_row02", tag: null, label: "'Total: $42.50' (row 01) / 'Thanks!' (row 02, cursor at end)" },
      { value: "total_dollar_425_row01_thanks_row02", tag: "padding_ignored_belief", label: "'Total: $42.5' / 'Thanks!'" },
      { value: "three_separate_rows", tag: "printf_adds_newline_belief", label: "Total: / $42.50 / Thanks! (three rows)" },
      { value: "all_one_row_no_break", tag: "n_specifier_ignored_belief", label: "'Total: $42.50Thanks!' (one row)" },
    ],
    revealNote: "First: 'Total: ' extends row01. Second: '$42.50' (padded) extends row01, then %n jumps to row02. Third: 'Thanks!' on row02.",
    concept: "chain_with_precision_and_n" },

  { round: 13, wave: 3, type: "predict", source: ['System.out.printf("[%d]", 3.14);'],
    question: "What happens?", correct: "runtime_crash",
    options: [
      { value: "runtime_crash", tag: null, label: "IllegalFormatConversionException (crash)" },
      { value: "[3]", tag: "type_mismatch_returns_value_belief", label: "'[3]' (int part only)" },
      { value: "[3.14]", tag: "type_mismatch_returns_value_belief", label: "'[3.14]'" },
      { value: "[%d]", tag: "format_specifier_prints_literally_belief", label: "'[%d]' literal" },
    ],
    revealNote: "The double slug approaches the gold %d slot — REJECTED. %d requires an integer type; a double doesn't downcast automatically.",
    concept: "type_mismatch_fluent" },

  { round: 14, wave: 3, type: "bughunt", lines: ['System.out.printf("%s is %d years old", "Bit");'],
    args: [{ value: "Bit", type: "string" }], faultLine: 1, faultToken: "%d",
    explanation: "MissingFormatArgumentException — the format string has TWO slots (%s and %d) but only ONE argument was provided. Every specifier needs its slug.",
    wrongTag: "missing_argument_belief", concept: "missing_argument_bug" },

  { round: 15, wave: 3, type: "bughunt", lines: ['double price = 19.99;', 'System.out.printf("Price: $%d", price);', '// expected: "Price: $19.99"'],
    args: [{ value: 19.99, type: "double" }], faultLine: 2, faultToken: "%d",
    fixedLine: 'System.out.printf("Price: $%.2f", price);',
    explanation: "Wrong specifier for the type — %d demands an int, but price is a double. IllegalFormatConversionException at runtime. For a formatted double, use %.2f.",
    wrongTag: "wrong_specifier_for_type",
    revealNote: "The reveal plays both futures: first the actual crash (double slug rejected by the gold %d slot), then the fixed %.2f version lands 'Price: $19.99' cleanly.",
    concept: "wrong_specifier_bug" },
];

const MISCONCEPTION_FEEDBACK = {
  format_specifier_prints_literally_belief: "The specifier IS the slot — it never prints. Look at the tray: it was a colored frame, and a slug filled it.",
  printf_adds_newline_belief: "printf doesn't add ANY newline unless you write %n or \\n. If your last character wasn't a newline, the cursor stayed inline.",
  printf_adds_newline_belief_end: "printf doesn't add ANY newline unless you write %n or \\n. If your last character wasn't a newline, the cursor stayed inline.",
  argument_order_reversed_belief: "Position is destiny in printf. arg1 fills slot1, arg2 fills slot2 — always in order.",
  same_arg_used_twice_belief: "Each slug fills exactly ONE slot, in order. No re-use, no re-reading.",
  quotes_print_belief: "Quotes stay on the slug's face in the type case — they never travel to the log.",
  space_between_specifiers_belief: "printf composes EXACTLY what you asked for. No auto-spaces between adjacent specifiers.",
  int_becomes_double_belief: "%d prints an int as an int — no decimals. Decimals only appear from %f/%.Nf on a double.",
  precision_truncates_not_rounds_belief: "Java printf ROUNDS, half-up — it doesn't just drop digits. 5.678 with %.1f becomes 5.7 because the 78 pushes up, not 5.6.",
  precision_ignored_belief: "The precision marker trims AND rounds the value — it never passes through unchanged.",
  precision_removes_all_decimals_belief: "Precision keeps exactly N decimals — it doesn't strip them all unless N is 0, and even then it still rounds.",
  padding_ignored_belief: "Precision PADS as well as trims. If your value has fewer decimals than the specifier demands, trailing zeros fill in. 100.5 with %.2f → 100.50.",
  precision_off_by_one_belief: "Read the number after the dot — that's the exact decimal count. %.2f = 2 decimals, no more, no less.",
  rounding_direction_confusion: "Half-up rounding: at .5, always round toward higher. 3.5 → 4, 4.5 → 5. Never toward zero.",
  n_specifier_ignored_belief: "%n is a real newline that fires wherever it appears in the format. Watch the cursor jump when the tray reaches %n.",
  type_mismatch_returns_value_belief: "printf never falls back gracefully — wrong type crashes the program. Both %d on a double AND %f on a String throw exceptions.",
  missing_argument_belief: "Every specifier needs its slug — MissingFormatArgumentException at runtime. Two specifiers means two arguments, no exceptions.",
  wrong_specifier_for_type: "The slot demanded the wrong type — IllegalFormatConversionException. %d is for ints, %f/%.Nf is for doubles, %s accepts anything.",
  variable_as_literal_belief: "A bare word inside the format string is TEXT — those exact letters. Use a slot to insert the variable's VALUE.",
  timeout: "The arm hit! Fluent operators call the impression before the shadow lands. Trust the pattern and commit.",
};

export class Level44Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level44Scene" });
  }

  init() {
    this.currentRound = 0;
    this.currentWave = 1;
    this.score = 0;
    this.displayScore = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.lives = 3;
    this.correctFirstTry = 0;
    this.fastBonusCount = 0;
    this.totalTimePctUsed = 0;
    this.attemptLog = [];
    this.roundElements = [];
    this.roundStartTime = 0;
    this.roundTimeLimit = 12000;
    this.rows = [""];
    this.cursorRowIdx = 0;
    this.rowObjs = [];
    this.inputLocked = true;
    this.gameEnded = false;
    this._alive = true;
    this._bubble = null;
    this._armTween = null;
    this._urgencyState = "safe";
    this._waveSquares = [];
    this._firstNewlineAnnotationShown = false;
    this._firstPrecisionAnnotationShown = false;
    this._bulbs = [];
  }

  preload() {}

  create() {
    this._alive = true;
    this.events.once("shutdown", () => { this._alive = false; this._killArmTween(); });

    const cam = this.cameras.main;
    const zoom = Math.min(this.scale.width / W, this.scale.height / H);
    cam.setZoom(zoom);
    cam.centerOn(W / 2, H / 2);
    cam.setBackgroundColor("#0d0805");

    try { GameManager.incrementAttempt(43); } catch (_) {}

    this.createParticleTexture();
    this.createBackground();
    this.createPressroomDecor();
    this.createParticles();
    this.createPressFrame();
    this.createImpressionArm();
    this.createPressBed();
    this.createTypeCaseRail();
    this.createReferenceLog();
    this.createHUD();
    this.createBit();

    cam.fadeIn(700, 3, 3, 5);
    this.checkTutorial();
  }

  update(time, delta) {
    this.updateParticles(time, delta);
    this.updateBulbFlicker(time);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // BACKGROUND / PRESSROOM
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l44_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l44_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x0d0805).setDepth(0);
  }

  createPressroomDecor() {
    const g = this.add.graphics().setDepth(1);
    // ceiling beams
    g.fillStyle(0x241a10, 1);
    g.fillRect(0, 24, W, 8);
    g.fillRect(0, 48, W, 6);
    g.lineStyle(1, 0x3a2618, 0.5);
    g.strokeRect(0, 24, W, 8);

    // tin sign
    g.fillStyle(0x241a10, 1);
    g.lineStyle(1, C_BRASS, 0.4);
    g.fillRoundedRect(60, 200, 130, 36, 4);
    g.strokeRoundedRect(60, 200, 130, 36, 4);
    this.add.text(125, 218, "NO SMOKING", { font: "bold 9px Georgia", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.5).setDepth(2);

    // ink barrels
    [60, 1220].forEach((x) => {
      g.fillStyle(0x1a1108, 1);
      g.lineStyle(1, 0x3a2618, 0.6);
      g.fillRoundedRect(x - 22, 500, 44, 120, 6);
      g.strokeRoundedRect(x - 22, 500, 44, 120, 6);
      g.fillEllipse(x, 500, 44, 12);
      g.strokeEllipse(x, 500, 44, 12);
      this.add.text(x, 560, "INK", { font: "bold 8px Georgia", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.4).setDepth(2);
    });

    // pressroom banner
    g.fillStyle(0x1a1108, 1);
    g.lineStyle(1, 0x8a6435, 0.4);
    g.fillRoundedRect(230, 12, 340, 28, 5);
    g.strokeRoundedRect(230, 12, 340, 28, 5);
    this.add.text(400, 26, "PRESSROOM — LIVE", { font: "bold 14px Georgia", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.7).setDepth(2);

    // wall clock
    const clockRing = this.add.graphics().setDepth(2);
    clockRing.lineStyle(2, 0x3a2618, 0.5);
    clockRing.strokeCircle(1180, 96, 22);
    this.clockMinute = this.add.graphics().setDepth(2);

    // floor
    g.fillStyle(0x1a1108, 1);
    g.fillRect(0, 635, W, 85);
    g.lineStyle(2, 0x3a2618, 1);
    g.lineBetween(0, 637, W, 637);
    for (let i = 0; i < 3; i++) g.fillRect(30 + i * 220, 668, 26, 8);

    // hanging bulbs
    this._bulbs = [];
    [380, 900].forEach((x) => {
      const cable = this.add.graphics().setDepth(2);
      cable.lineStyle(1, 0x3a2618, 0.5);
      cable.lineBetween(x, 54, x, 78);
      const bulb = this.add.circle(x, 82, 6, 0xffa726, 0.4).setDepth(2);
      this._bulbs.push({ bulb, phase: Phaser.Math.Between(0, 4000) });
    });
  }

  updateBulbFlicker(time) {
    this._bulbs.forEach((b) => {
      const t = (time + b.phase) % 3600;
      const flick = t > 3400 ? Phaser.Math.FloatBetween(0.15, 0.4) : 0.4;
      if (b.bulb.active) b.bulb.setAlpha(flick);
    });
    if (this.clockMinute) {
      const a = time * 0.00006;
      this.clockMinute.clear();
      this.clockMinute.lineStyle(2, 0xc8a05a, 0.35);
      this.clockMinute.lineBetween(1180, 96, 1180 + Math.cos(a - Math.PI / 2) * 15, 96 + Math.sin(a - Math.PI / 2) * 15);
    }
  }

  createParticles() {
    this.ambient = [];
    const colors = [0xc8a05a, 0x8a6435, 0xa89078];
    for (let i = 0; i < 8; i++) {
      this.ambient.push(this.add.circle(Phaser.Math.Between(0, W), Phaser.Math.Between(80, 630), 1, Phaser.Utils.Array.GetRandom(colors), Phaser.Math.FloatBetween(0.03, 0.06)).setDepth(2));
    }
  }

  updateParticles(time, delta) {
    if (!this.ambient) return;
    const step = 0.012 * (delta / 16.7);
    this.ambient.forEach((p, i) => {
      p.x += Math.cos(time * 0.0004 + i) * step * 2;
      p.y += Math.sin(time * 0.0005 + i) * 0.04;
      if (p.x > W) p.x = 0; if (p.x < 0) p.x = W;
      if (p.y > 630) p.y = 80; if (p.y < 80) p.y = 630;
    });
  }

  // ══════════════════════════════════════════════════════════════
  // PRESS FRAME
  // ══════════════════════════════════════════════════════════════

  createPressFrame() {
    const g = this.add.graphics().setDepth(4);
    g.fillStyle(0x1a1108, 1);
    g.lineStyle(3, 0x3a2618, 1);
    g.fillRoundedRect(200, 80, 620, 34, 6);
    g.strokeRoundedRect(200, 80, 620, 34, 6);
    g.fillStyle(C_BRASS, 0.6);
    g.fillCircle(260, 97, 3);
    g.fillCircle(740, 97, 3);

    [210, 770].forEach((x) => {
      g.fillStyle(0x1a1108, 1);
      g.lineStyle(2, 0x3a2618, 1);
      g.fillRect(x, 120, 20, 340);
      g.strokeRect(x, 120, 20, 340);
      for (let i = 0; i < 3; i++) { g.fillStyle(C_BRASS, 0.5); g.fillCircle(x + 10, 150 + i * 110, 2.5); }
    });
    this.add.text(220, 440, "MODEL C — 1892", { font: "bold 7px Georgia", color: HEX_BRASS }).setOrigin(0, 0.5).setAlpha(0.4).setDepth(5);

    g.fillStyle(0x1a1108, 1);
    g.lineStyle(3, 0x3a2618, 1);
    g.fillRoundedRect(200, 448, 620, 22, 6);
    g.strokeRoundedRect(200, 448, 620, 22, 6);
    g.fillStyle(C_BRASS, 0.6);
    g.fillCircle(260, 459, 3);
    g.fillCircle(740, 459, 3);

    this.warningLed = this.add.circle(BED_CX, 96, 3, C_RED, 0.4).setDepth(6);
  }

  // ══════════════════════════════════════════════════════════════
  // IMPRESSION ARM (THE TIMER)
  // ══════════════════════════════════════════════════════════════

  createImpressionArm() {
    this.armGlowGfx = this.add.graphics().setDepth(7);
    this.armGfx = this.add.graphics().setDepth(8);
    this.armY = ARM_Y_HIGH;
    this._drawArm(C_GREEN_BRIGHT, 0.25);
  }

  _drawArm(glowColor, glowAlpha) {
    const y = this.armY;
    this.armGlowGfx.clear();
    this.armGlowGfx.fillStyle(glowColor, glowAlpha);
    this.armGlowGfx.fillRoundedRect(BED_CX - 280, y - 24, 560, 48, 10);

    this.armGfx.clear();
    this.armGfx.lineStyle(1.5, C_BRASS, 0.3);
    this.armGfx.lineBetween(ARM_X0, 114, ARM_X0, y);
    this.armGfx.lineBetween(ARM_X1, 114, ARM_X1, y);
    this.armGfx.fillStyle(0x241a10, 1);
    this.armGfx.lineStyle(3, C_BRASS, 1);
    this.armGfx.fillRoundedRect(BED_CX - 270, y - 18, 540, 36, 8);
    this.armGfx.strokeRoundedRect(BED_CX - 270, y - 18, 540, 36, 8);
    this.armGfx.fillStyle(0x1a1108, 1);
    this.armGfx.lineStyle(1, 0x8a6435, 0.6);
    this.armGfx.fillRoundedRect(BED_CX - 260, y + 6, 520, 8, 3);
    this.armGfx.strokeRoundedRect(BED_CX - 260, y + 6, 520, 8, 3);
  }

  startArmDescent(timeLimitMs, onTimeout) {
    this._killArmTween();
    this._urgencyState = "safe";
    this.roundTimeLimit = timeLimitMs;
    const state = { v: 0 };
    this._armTween = this.tweens.add({
      targets: state, v: 1, duration: timeLimitMs, ease: "Linear",
      onUpdate: () => { this.armY = Phaser.Math.Linear(ARM_Y_HIGH, ARM_Y_LOW, state.v); this._drawArmForProgress(state.v); this._checkUrgency(1 - state.v); },
      onComplete: () => { if (this._alive) onTimeout(); },
    });
  }

  _drawArmForProgress(progress) {
    const remaining = 1 - progress;
    const color = remaining > 0.33 ? C_GREEN_BRIGHT : remaining > 0.15 ? C_GOLD : C_RED;
    const alpha = remaining > 0.15 ? 0.22 : 0.35 + Math.sin(this.time.now * 0.012) * 0.15;
    this._drawArm(color, Math.max(0.1, alpha));
    this.warningLed.setFillStyle(C_RED, remaining > 0.15 ? 0.4 : 0.4 + Math.abs(Math.sin(this.time.now * 0.01)) * 0.5);
    if (remaining <= 0.33 && Phaser.Math.Between(0, 100) < 4) this.spawnCreakDust();
    this.armGfx.setAngle(remaining <= 0.15 ? Math.sin(this.time.now * 0.02) * 0.3 : 0);
  }

  _checkUrgency(remaining) {
    if (remaining <= 0.15 && this._urgencyState !== "critical") this._urgencyState = "critical";
  }

  spawnCreakDust() {
    const x = Phaser.Math.Between(BED_CX - 250, BED_CX + 250);
    const d = this.add.circle(x, 100, 1.5, C_BRASS, 0.5).setDepth(9);
    this.tweens.add({ targets: d, y: 120, alpha: 0, duration: 400, onComplete: () => d.destroy() });
  }

  _killArmTween() {
    if (this._armTween) { this._armTween.stop(); this._armTween = null; }
  }

  pauseArm() {
    if (this._armTween) this._armTween.pause();
    this.armGfx.setAngle(0);
  }

  getTimePctUsed() {
    const elapsed = this.time.now - this.roundStartTime;
    return Phaser.Math.Clamp(elapsed / this.roundTimeLimit, 0, 1);
  }

  async retractArm() {
    this._killArmTween();
    await new Promise((res) => {
      this.tweens.add({ targets: this, armY: ARM_Y_HIGH, duration: 400, ease: "Sine.easeOut", onUpdate: () => this._drawArm(C_GREEN_BRIGHT, 0.22), onComplete: res });
    });
  }

  async armSlam() {
    this._killArmTween();
    this.armY = ARM_Y_LOW - 30;
    this._drawArm(C_RED, 0.6);
    await new Promise((res) => {
      this.tweens.add({ targets: this, armY: ARM_Y_LOW, duration: 200, ease: "Cubic.easeIn", onUpdate: () => this._drawArm(C_RED, 0.6), onComplete: res });
    });
    this.screenShake(0.008, 400);
    this._bulbs.forEach((b) => { if (b.bulb.active) { this.tweens.add({ targets: b.bulb, alpha: 0.08, duration: 200 }); this.time.delayedCall(800, () => { if (b.bulb.active) b.bulb.setAlpha(0.4); }); } });
    this.spawnInkSplatter();
  }

  spawnInkSplatter() {
    const p = this.add.particles(BED_CX, BED_Y0 + 10, "l44_dot", {
      speed: { min: 60, max: 180 }, angle: { min: 0, max: 360 }, scale: { start: 1.1, end: 0.2 }, lifespan: 500,
      tint: [0x0a0503], alpha: { start: 0.7, end: 0 }, emitting: false,
    }).setDepth(30);
    p.explode(18);
    this.time.delayedCall(700, () => p.destroy());
  }

  // ══════════════════════════════════════════════════════════════
  // PRESS BED (trial content area)
  // ══════════════════════════════════════════════════════════════

  createPressBed() {
    const g = this.add.graphics().setDepth(5);
    g.fillStyle(0x0a0503, 1);
    g.lineStyle(2, 0x3a2618, 1);
    g.fillRoundedRect(BED_X0, BED_Y0, BED_X1 - BED_X0, BED_Y1 - BED_Y0, 4);
    g.strokeRoundedRect(BED_X0, BED_Y0, BED_X1 - BED_X0, BED_Y1 - BED_Y0, 4);
    this.bedLabel = this.add.text(BED_X1 - 12, BED_Y0 + 10, "", { font: "bold 9px Courier New", color: HEX_GRAY }).setOrigin(1, 0).setAlpha(0.7).setDepth(6);
    this.bedQuestionText = this.add.text(BED_CX, BED_Y1 - 16, "", { font: "11px Arial", color: "#b0bec5" }).setOrigin(0.5).setDepth(6);
    this.bedContainer = this.add.container(0, 0).setDepth(6);
  }

  clearBed() { this.bedContainer.removeAll(true); this.bedQuestionText.setText(""); }

  // ══════════════════════════════════════════════════════════════
  // TYPE CASE RAIL (slug staging area)
  // ══════════════════════════════════════════════════════════════

  createTypeCaseRail() {
    const g = this.add.graphics().setDepth(4);
    g.fillStyle(0x1a1108, 1);
    g.lineStyle(1, 0x8a6435, 0.5);
    g.fillRoundedRect(RAIL_X0, RAIL_Y - 22, RAIL_X1 - RAIL_X0, 44, 4);
    g.strokeRoundedRect(RAIL_X0, RAIL_Y - 22, RAIL_X1 - RAIL_X0, 44, 4);
    this.railContainer = this.add.container(0, 0).setDepth(6);
  }

  clearRail() { this.railContainer.removeAll(true); }

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
  // REFERENCE LOG + CURSOR (ported from L40–L43)
  // ══════════════════════════════════════════════════════════════

  createReferenceLog() {
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
    header.fillRoundedRect(LOG_X, LOG_Y, LOG_W, 40, { tl: 12, tr: 12, bl: 0, br: 0 });
    this.logLed = this.add.circle(LOG_X + 18, LOG_Y + 20, 4, C_RED).setDepth(12);
    this.add.text(LOG_X + 32, LOG_Y + 20, "BROADCAST LOG — LIVE", { font: "bold 10px Arial", color: HEX_CYAN }).setOrigin(0, 0.5).setDepth(12);

    const maskShape = this.make.graphics({ x: 0, y: 0, add: false });
    maskShape.fillRoundedRect(LOG_X + 4, LOG_CONTENT_Y0, LOG_W - 8, LOG_Y + LOG_H - LOG_CONTENT_Y0 - 6, 6);
    this.logMask = maskShape.createGeometryMask();
    this.logLayer = this.add.container(0, 0).setDepth(13);
    this.logLayer.setMask(this.logMask);

    this.rows = [""];
    this.cursorRowIdx = 0;
    this.rowObjs = [];
    this.renderLogFromScratch();
    this.cursorGlow = this.add.rectangle(0, 0, 14, 22, C_CYAN, 0.15);
    this.cursorBlock = this.add.rectangle(0, 0, 10, 18, C_CYAN, 0.75);
    this.logLayer.add([this.cursorGlow, this.cursorBlock]);
    this.tweens.add({ targets: [this.cursorBlock, this.cursorGlow], alpha: 0.1, duration: 700, yoyo: true, repeat: -1 });
    this.updateCursorVisualPosition();
  }

  flashLed() {
    this.logLed.setFillStyle(C_GREEN_BRIGHT, 1);
    this.time.delayedCall(300, () => { if (this.logLed.active) this.logLed.setFillStyle(C_RED, 1); });
  }

  _rowY(i) { return LOG_CONTENT_Y0 + 15 + i * ROW_H; }

  renderLogFromScratch() {
    this.rowObjs.forEach((r) => { r.numT.destroy(); r.textT.destroy(); });
    this.rowObjs = [];
    this.rows.forEach((rowStr, i) => {
      const y = this._rowY(i);
      const numT = this.add.text(LOG_X + 10, y, String(i + 1).padStart(2, "0"), { font: "10px Courier New", color: "#3d4450" }).setOrigin(0, 0.5);
      const textT = this.add.text(LOG_TEXT_X, y, this._displayRow(rowStr), { font: "bold 15px Courier New", color: HEX_CYAN }).setOrigin(0, 0.5);
      this.logLayer.add([numT, textT]);
      this.rowObjs.push({ numT, textT });
    });
  }

  _displayRow(rowStr) { return rowStr.replace(/ /g, "␣"); }

  ensureRow(idx) {
    while (this.rowObjs.length <= idx) {
      const i = this.rowObjs.length;
      const y = this._rowY(i);
      const numT = this.add.text(LOG_X + 10, y, String(i + 1).padStart(2, "0"), { font: "10px Courier New", color: "#3d4450" }).setOrigin(0, 0.5);
      const textT = this.add.text(LOG_TEXT_X, y, "", { font: "bold 15px Courier New", color: HEX_CYAN }).setOrigin(0, 0.5).setAlpha(0);
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
    const p = this.add.particles(this.cursorBlock.x, this.cursorBlock.y, "l44_dot", {
      speed: { min: 25, max: 60 }, angle: { min: 0, max: 360 }, scale: { start: 0.45, end: 0 }, lifespan: 180,
      tint: [C_CYAN], emitting: false,
    }).setDepth(20);
    this.logLayer.add(p);
    p.explode(4);
    this.time.delayedCall(280, () => p.destroy());
  }

  /** Types text at the cursor — printf's ground truth. Real '\n' chars
   * (from \n literal or %n) break rows. No auto-newline, ever. */
  async typeAtCursor(text, styleType) {
    for (const ch of text) {
      if (!this._alive) return;
      if (ch === "\n") {
        if (!this._firstNewlineAnnotationShown) {
          this._firstNewlineAnnotationShown = true;
          this.createAnnotation(this.cursorBlock.x, this.cursorBlock.y - 24, "%n / \\n → newline", HEX_VIOLET);
        }
        this.cursorSparkle();
        this.rows.push("");
        this.cursorRowIdx++;
        this.ensureRow(this.cursorRowIdx);
        this.updateCursorVisualPosition();
        await this.delay(28);
        continue;
      }
      this.rows[this.cursorRowIdx] += ch;
      this.rowObjs[this.cursorRowIdx].textT.setColor("#e8dfc8").setText(this._displayRow(this.rows[this.cursorRowIdx]));
      this.updateCursorVisualPosition();
      await this.delay(8);
    }
    this.cursorSparkle();
  }

  clearLog() {
    return new Promise((res) => {
      const wipe = this.add.rectangle(LOG_X + LOG_W / 2, LOG_CONTENT_Y0, LOG_W, 0, 0x08111c, 1).setOrigin(0.5, 0);
      this.logLayer.add(wipe);
      this.tweens.add({
        targets: wipe, height: LOG_Y + LOG_H - LOG_CONTENT_Y0, duration: 260, ease: "Cubic.easeIn",
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
  // HUD
  // ══════════════════════════════════════════════════════════════

  createHUD() {
    const g = this.add.graphics().setDepth(49);
    g.fillStyle(0x0d0805, 0.93);
    g.fillRect(0, 0, W, 64);
    g.lineStyle(1, 0x3a2618, 1);
    g.lineBetween(0, 64, W, 64);

    this.add.text(20, 14, "THE PRESSES", { font: "bold 15px Arial", color: "#b0bec5" }).setDepth(50);
    this.add.text(20, 32, "Tuning Phase — Output Methods: printf()", { font: "11px Arial", color: "#546e7a" }).setDepth(50);

    this.waveText = this.add.text(BED_CX, 18, "WAVE 1 / 3", { font: "bold 14px Arial", color: HEX_GOLD }).setOrigin(0.5).setDepth(50);
    this._waveSquares = [];
    for (let i = 0; i < 5; i++) {
      const sq = this.add.rectangle(BED_CX - 44 + i * 22, 42, 10, 10, 0x2a2f36).setDepth(50).setStrokeStyle(1, 0x546e7a);
      this._waveSquares.push(sq);
    }

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

  updateWaveIndicator(roundInWave, correct) {
    const sq = this._waveSquares[roundInWave];
    if (!sq) return;
    sq.setFillStyle(correct ? C_GREEN_BRIGHT : C_RED);
  }

  resetWaveIndicator() { this._waveSquares.forEach((sq) => sq.setFillStyle(0x2a2f36)); }

  _roundInWave() {
    if (this.currentWave === 1) return this.currentRound;
    if (this.currentWave === 2) return this.currentRound - 5;
    return this.currentRound - 10;
  }

  // ══════════════════════════════════════════════════════════════
  // BIT — press operator variant
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
    c.add([g, apron, eye, pupil, tip, wrench]);
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
    this.tweens.add({ targets: c, alpha: 1, scale: 1, duration: 160, ease: "Back.easeOut" });

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
    this.tweens.add({ targets: b, alpha: 0, scale: 0.8, duration: 130, onComplete: () => b.destroy() });
  }

  async showBitFeedback(message, maxMs = 2500) {
    await this.bitSay(message);
    if (!this._alive) return;
    await Promise.race([this.waitForClick(), this.delay(maxMs)]);
    this.hideBubble();
  }

  createAnnotation(x, y, text, colorHex) {
    const t = this.add.text(x, y, text, { font: "italic 10px Arial", color: colorHex }).setOrigin(0.5).setDepth(70).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 200 });
    this.time.delayedCall(1600, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() }); });
    return t;
  }

  createFloatingText(x, y, text, colorHex, font = "bold 13px Arial", hold = 1400) {
    const t = this.add.text(x, y, text, { font, color: colorHex, wordWrap: { width: 300 }, align: "center" }).setOrigin(0.5).setDepth(31).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 180 });
    this.time.delayedCall(hold, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() }); });
    return t;
  }

  createConfetti(x, y, count = 30) {
    const p = this.add.particles(x, y, "l44_dot", {
      speed: { min: 80, max: 240 }, angle: { min: 0, max: 360 }, scale: { start: 0.9, end: 0 }, lifespan: 500,
      tint: [C_BRASS, C_GOLD, C_ORANGE, C_CYAN, 0xffffff], emitting: false,
    }).setDepth(75);
    p.explode(count);
    this.time.delayedCall(900, () => p.destroy());
  }

  screenShake(intensity = 0.004, duration = 180) {
    this.cameras.main.shake(duration, intensity);
  }

  async stampBed(kind) {
    const labels = { clean: "CLEAN IMPRESSION", missed: "MISSED", smeared: "SMEARED IMPRESSION", compile: "COMPILE ERROR" };
    const colors = { clean: HEX_GREEN_BRIGHT, missed: HEX_RED, smeared: HEX_RED, compile: HEX_RED };
    const stamp = this.add.text(BED_CX, BED_CY, labels[kind], { font: "bold 22px Arial", color: colors[kind] }).setOrigin(0.5).setDepth(30).setScale(1.4).setAngle(-6).setAlpha(0);
    this.bedContainer.add(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 180 });
    const hold = kind === "smeared" ? 1600 : 700;
    await this.delay(hold);
    if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 200, onComplete: () => stamp.destroy() });
  }

  // ══════════════════════════════════════════════════════════════
  // EVALUATOR — printf format-string parser (ported from L43)
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
        const text = this._toStringForArg(argVal);
        resultText += text;
        steps.push({ type: "slot", specifier: seg.specifier, text });
      }
    }
    return { ok: true, text: resultText, steps };
  }

  _evalArgToken(tok, decls) {
    if (/^".*"$/.test(tok)) return { value: tok.slice(1, -1), type: "string" };
    if (/^-?\d+\.\d+$/.test(tok)) return { value: parseFloat(tok), type: "double" };
    if (/^-?\d+$/.test(tok)) return { value: parseInt(tok, 10), type: "int" };
    if (tok === "true" || tok === "false") return { value: tok === "true", type: "boolean" };
    if (decls && Object.prototype.hasOwnProperty.call(decls, tok)) return decls[tok];
    return { value: tok, type: "string" };
  }

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

  // ══════════════════════════════════════════════════════════════
  // COMPOSITION ANIMATION — press bed + type case rail
  // ══════════════════════════════════════════════════════════════

  async renderFormatOnBed(fmtDisplaySource) {
    this.clearBed();
    this._bedSlots = [];
    const inner = fmtDisplaySource.trim().slice(1, -1);
    let x = BED_X0 + 16;
    const y = BED_CY - 10;
    let i = 0;
    while (i < inner.length) {
      if (!this._alive) return;
      if (inner[i] === "%" && inner[i + 1] === "n") {
        const slot = this._makeBedSlot("%n", "n", null, x, y);
        x += slot.width + 4;
        await this.delay(35);
        i += 2;
        continue;
      }
      const precMatch = inner.slice(i).match(/^%\.(\d+)f/);
      if (precMatch) {
        const slot = this._makeBedSlot(precMatch[0], "f", precMatch[1], x, y);
        x += slot.width + 4;
        await this.delay(35);
        i += precMatch[0].length;
        continue;
      }
      const simpleMatch = inner.slice(i).match(/^%([sdfcb])/);
      if (simpleMatch) {
        const slot = this._makeBedSlot(simpleMatch[0], simpleMatch[1], null, x, y);
        x += slot.width + 4;
        await this.delay(35);
        i += simpleMatch[0].length;
        continue;
      }
      if (inner[i] === "\\" && inner[i + 1] === "n") {
        const t = this.add.text(x, y, "\\n", { font: "bold 15px Courier New", color: HEX_MAGENTA }).setOrigin(0, 0.5).setAlpha(0);
        this.bedContainer.add(t);
        this.tweens.add({ targets: t, alpha: 1, duration: 80 });
        x += t.width + 2;
        i += 2;
        await this.delay(12);
        continue;
      }
      const ch = inner[i] === " " ? "␣" : inner[i];
      const color = inner[i] === " " ? HEX_MAGENTA : "#e8dfc8";
      const t = this.add.text(x, y, ch, { font: "bold 19px Courier New", color }).setOrigin(0, 0.5).setAlpha(0);
      this.bedContainer.add(t);
      this.tweens.add({ targets: t, alpha: 1, duration: 60 });
      x += t.width;
      i++;
      await this.delay(12);
    }
  }

  _makeBedSlot(label, specifier, precision, x, y) {
    const color = this._slotColorInt(specifier);
    const colorHex = this._slotColor(specifier);
    const tmp = this.add.text(0, 0, label, { font: "bold 17px Courier New" });
    const w = tmp.width + 14;
    tmp.destroy();
    const c = this.add.container(x + w / 2, y).setScale(1.2).setAlpha(0);
    const g = this.add.graphics();
    g.fillStyle(0x0a0e14, 0.6);
    g.fillRoundedRect(-w / 2, -16, w, 32, 6);
    g.lineStyle(2, color, 1);
    g.strokeRoundedRect(-w / 2, -16, w, 32, 6);
    const txt = this.add.text(0, 0, label, { font: "bold 17px Courier New", color: colorHex }).setOrigin(0.5);
    c.add([g, txt]);
    this.bedContainer.add(c);
    this.tweens.add({ targets: c, scale: 1, alpha: 1, duration: 160, ease: "Back.easeOut" });
    if (precision !== null && precision !== undefined) {
      const pm = this.add.text(x + w / 2, y - 22, `.${precision}`, { font: "bold 9px Courier New", color: "#ff6f00" }).setOrigin(0.5).setAlpha(0);
      this.bedContainer.add(pm);
      this.tweens.add({ targets: pm, alpha: 0.85, duration: 160 });
      if (!this._firstPrecisionAnnotationShown) {
        this._firstPrecisionAnnotationShown = true;
        this.createAnnotation(x + w / 2, y - 36, "precision trims and rounds", "#ff6f00");
      }
    }
    const slotInfo = { container: c, text: txt, width: w, x: x + w / 2, y, specifier, color };
    if (this._bedSlots) this._bedSlots.push(slotInfo);
    return slotInfo;
  }

  async renderSlugsOnRail(argVals) {
    this.clearRail();
    let x = RAIL_X0 + 14;
    this._railSlugs = [];
    for (let idx = 0; idx < argVals.length; idx++) {
      if (!this._alive) return;
      const av = argVals[idx];
      const display = av.type === "string" ? `"${av.value}"` : this._toStringForArg(av);
      const color = av.type === "string" ? HEX_CYAN : av.type === "double" ? HEX_ORANGE : av.type === "boolean" ? "#b39ddb" : HEX_GOLD;
      const tmp = this.add.text(0, 0, display, { font: "bold 15px Courier New" });
      const w = tmp.width + 14;
      tmp.destroy();
      const home = { x: x + w / 2, y: RAIL_Y };
      const c = this.add.container(home.x, home.y).setAlpha(0).setScale(0.5);
      const g = this.add.graphics();
      g.fillStyle(0x241a10, 1);
      g.lineStyle(2, 0x8a6435, 1);
      g.fillRoundedRect(-w / 2, -17, w, 34, 4);
      g.strokeRoundedRect(-w / 2, -17, w, 34, 4);
      const txt = this.add.text(0, 0, display, { font: "bold 15px Courier New", color }).setOrigin(0.5);
      c.add([g, txt]);
      this.railContainer.add(c);
      this.tweens.add({ targets: c, alpha: 1, scale: 1, duration: 160, ease: "Back.easeOut" });
      this._railSlugs.push({ container: c, home, type: av.type, color });
      x += w + 10;
      await this.delay(90);
    }
  }

  async slugToSlot(slugEntry, slotInfo, matchOk) {
    const slug = slugEntry.container;
    await new Promise((res) => {
      this.tweens.add({ targets: slug, x: slotInfo.x, y: slotInfo.y - 34, duration: 180, ease: "Sine.easeOut", onComplete: res });
    });
    if (!matchOk) {
      const g = slotInfo.container.list[0];
      g.clear();
      g.fillStyle(0x0a0e14, 0.6);
      g.fillRoundedRect(-slotInfo.width / 2, -16, slotInfo.width, 32, 6);
      g.lineStyle(2, C_RED, 1);
      g.strokeRoundedRect(-slotInfo.width / 2, -16, slotInfo.width, 32, 6);
      this.screenShake(0.003, 150);
      await new Promise((res) => {
        this.tweens.add({ targets: slug, x: slugEntry.home.x, y: slugEntry.home.y, duration: 170, ease: "Sine.easeIn", onComplete: res });
      });
      const p = this.add.particles(slug.x, slug.y, "l44_dot", { speed: { min: 40, max: 100 }, angle: { min: 0, max: 360 }, scale: { start: 0.6, end: 0 }, lifespan: 220, tint: [C_RED], emitting: false }).setDepth(30);
      this.railContainer.add(p);
      p.explode(8);
      this.time.delayedCall(320, () => p.destroy());
      slug.destroy();
      return { rejected: true };
    }
    await new Promise((res) => {
      this.tweens.add({ targets: slug, y: slotInfo.y, scale: 0.9, duration: 130, ease: "Cubic.easeOut", onComplete: res });
    });
    this.tweens.add({ targets: slug, scale: 1.1, duration: 70, yoyo: true });
    slotInfo.text.setAlpha(0);
    slug.destroy();
    const p = this.add.particles(slotInfo.x, slotInfo.y, "l44_dot", { speed: { min: 20, max: 50 }, angle: { min: 0, max: 360 }, scale: { start: 0.5, end: 0 }, lifespan: 180, tint: [slotInfo.color], emitting: false }).setDepth(30);
    this.railContainer.add(p);
    p.explode(4);
    this.time.delayedCall(260, () => p.destroy());
    return { rejected: false };
  }

  /** Full composition reveal for a single printf call — 1.4× L43 tempo. */
  async runComposition(fmtSource, argVals) {
    await this.renderFormatOnBed(fmtSource);
    if (!this._alive) return { ok: true, text: "" };
    await this.renderSlugsOnRail(argVals);
    if (!this._alive) return { ok: true, text: "" };

    const evalResult = this.evaluatePrintf(fmtSource, argVals);
    if (evalResult.compileError) { this.clearBed(); this.clearRail(); await this.stampBed("compile"); return evalResult; }
    if (!evalResult.ok && evalResult.crash === "malformed_specifier") {
      await this.stampBed("compile");
      this.clearBed(); this.clearRail();
      return evalResult;
    }

    if (!evalResult.ok && evalResult.crash === "type_mismatch") {
      const badIdx = evalResult.steps.filter((s) => s.type === "slot").length;
      const argSlots = this._bedSlots.filter((s) => s.specifier !== "n");
      const slotInfo = argSlots[badIdx];
      const slugEntry = this._railSlugs[badIdx];
      if (slugEntry && slotInfo) await this.slugToSlot(slugEntry, slotInfo, false);
      await this.stampBed("missed");
      this.clearBed(); this.clearRail();
      return evalResult;
    }
    if (!evalResult.ok && evalResult.crash === "missing_argument") {
      // Honest trace: any slots BEFORE the missing one genuinely succeeded
      // (evalResult.steps proves it) — show those insertions first, then
      // flare the slot that has no slug left to fill it.
      const argSlotsForMiss = this._bedSlots.filter((s) => s.specifier !== "n");
      let filledCount = 0;
      for (const step of evalResult.steps) {
        if (!this._alive) return evalResult;
        if (step.type !== "slot") continue;
        const slotInfo = argSlotsForMiss[filledCount];
        const slugEntry = this._railSlugs[filledCount];
        if (slugEntry && slotInfo) await this.slugToSlot(slugEntry, slotInfo, true);
        filledCount++;
      }
      const emptySlot = argSlotsForMiss[filledCount];
      if (emptySlot) {
        const g = emptySlot.container.list[0];
        g.clear();
        g.fillStyle(0x0a0e14, 0.6);
        g.fillRoundedRect(-emptySlot.width / 2, -16, emptySlot.width, 32, 6);
        g.lineStyle(2, C_RED, 1);
        g.strokeRoundedRect(-emptySlot.width / 2, -16, emptySlot.width, 32, 6);
        this.screenShake(0.003, 150);
      }
      await this.stampBed("missed");
      this.clearBed(); this.clearRail();
      return evalResult;
    }

    const argSlotsOk = this._bedSlots.filter((s) => s.specifier !== "n");
    let slugPos = 0;
    for (const step of evalResult.steps) {
      if (!this._alive) return evalResult;
      if (step.type !== "slot") continue;
      const slotInfo = argSlotsOk[slugPos];
      const slugEntry = this._railSlugs[slugPos];
      if (slugEntry && slotInfo) await this.slugToSlot(slugEntry, slotInfo, true);
      slugPos++;
    }
    this._railSlugs.forEach((s) => { if (s.container.active) s.container.destroy(); });
    await this.delay(100);
    await this.transferRowToLog(evalResult.text);
    this.clearBed(); this.clearRail();
    return evalResult;
  }

  async transferRowToLog(text) {
    const capsule = this.add.rectangle(BED_CX, BED_CY, 50, 16, C_BRASS, 0.7).setDepth(30);
    this.tweens.add({ targets: this.bedContainer, alpha: 0.3, duration: 120 });
    await this.delay(80);
    if (!this._alive) return;
    const targetX = this.cursorBlock.x, targetY = this.cursorBlock.y;
    await new Promise((res) => { this.tweens.add({ targets: capsule, x: targetX, y: targetY, duration: 240, ease: "Cubic.easeInOut", onComplete: res }); });
    capsule.destroy();
    this.flashLed();
    await this.typeAtCursor(text, "compose");
    await this.delay(60);
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
      await this.delay(70);
    }
    return { ok: true };
  }

  // ══════════════════════════════════════════════════════════════
  // TUTORIAL
  // ══════════════════════════════════════════════════════════════

  checkTutorial() {
    let done = false;
    try { done = localStorage.getItem(TUTORIAL_KEY) === "true"; } catch (_) {}
    if (done) this.time.delayedCall(300, () => this.startWave(1));
    else this.runTutorial();
  }

  async runTutorial() {
    const A = () => this._alive;
    await this.delay(400); if (!A()) return;
    await this.bitSay("Welcome to the Presses, Operator. The composing room shaped the type — up here we STRIKE it. Every trial has a deadline: the impression arm descends, and if it hits before you answer, the whole tray SMEARS.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();

    this.showTrialOnBed(['System.out.printf("Hi %s!", "Bit");'], "What appears on the log?");
    const a1 = this.createAnnotation(BED_CX, BED_Y0 - 14, "the tray waits here", HEX_CYAN);
    await this.delay(300); if (!A()) return;
    const a2 = this.createAnnotation(BED_CX, 100, "descent = deadline", HEX_GOLD);
    await this.delay(300); if (!A()) return;
    const a3 = this.createAnnotation(LOG_X + LOG_W / 2, LOG_Y - 10, "the truth lands here after you call it", HEX_GREEN_BRIGHT);
    await this.delay(400); if (!A()) return;

    await this.bitSay("The arm freezes when you answer; the slugs still fly true. Ready your call!");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();
    this.clearBed();

    try { localStorage.setItem(TUTORIAL_KEY, "true"); } catch (_) {}
    this.startWave(1);
  }

  // ══════════════════════════════════════════════════════════════
  // TRIAL DISPLAY (syntax-highlighted, printf-aware)
  // ══════════════════════════════════════════════════════════════

  _syntaxTokenize(line) {
    const tokens = [];
    const re = /(%\.\d+f|%[sdfcbn])|(\\[nt])|("(?:[^"\\]|\\.)*")|(\bSystem\.out\b)|(\.)|(\bprintf\b)|([(){};=])/g;
    let last = 0, m;
    const plain = (t) => t && tokens.push({ t, c: "#b0bec5" });
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
    return tokens.length ? tokens : [{ t: line, c: "#b0bec5" }];
  }

  showTrialOnBed(lines, questionText) {
    this.clearBed();
    const fontSize = lines.length > 1 ? 13 : 16;
    const startY = BED_CY - ((lines.length - 1) * (fontSize + 8)) / 2;
    lines.forEach((line, i) => {
      const tokens = this._syntaxTokenize(line);
      const measured = tokens.map((t) => { const tmp = this.add.text(0, 0, t.t, { font: `bold ${fontSize}px Courier New` }); const w = tmp.width; tmp.destroy(); return w; });
      const totalW = measured.reduce((a, b) => a + b, 0);
      let x = BED_CX - totalW / 2;
      const y = startY + i * (fontSize + 8);
      tokens.forEach((tok, ti) => {
        const t = this.add.text(x, y, tok.t, { font: `bold ${fontSize}px Courier New`, color: tok.c }).setOrigin(0, 0.5).setAlpha(0);
        this.bedContainer.add(t);
        this.tweens.add({ targets: t, alpha: 1, duration: 180 });
        x += measured[ti];
      });
    });
    if (questionText) this.bedQuestionText.setText(questionText);
    this.bedLabel.setText(`IMPRESSION ${this.currentRound + 1}/15`);
  }

  // ══════════════════════════════════════════════════════════════
  // WAVE / ROUND LIFECYCLE
  // ══════════════════════════════════════════════════════════════

  async startWave(waveNumber) {
    this.currentWave = waveNumber;
    this.resetWaveIndicator();
    this.waveText.setText(`WAVE ${waveNumber} / 3`);

    const banners = { 1: "WAVE 1 — RAPID SUBSTITUTION", 2: "WAVE 2 — PRECISION & NEWLINES", 3: "WAVE 3 — COMPLEX TRACES & BUGS" };
    await this.showWaveBanner(banners[waveNumber]);
    if (!this._alive) return;

    if (waveNumber === 3) {
      await this.showBitFeedback("Wave three, Operator. Real trays — traces to read and bugs to spot. The slugs never lie. Trust the slots.", 4500);
      if (!this._alive) return;
    }

    const startIndex = waveNumber === 1 ? 0 : waveNumber === 2 ? 5 : 10;
    this.startRound(startIndex);
  }

  async showWaveBanner(text) {
    const c = this.add.container(BED_CX, -60).setDepth(85);
    const g = this.add.graphics();
    g.fillStyle(0x1a1108, 0.95);
    g.fillRoundedRect(-230, -24, 460, 48, 8);
    g.lineStyle(2, C_GOLD, 1);
    g.strokeRoundedRect(-230, -24, 460, 48, 8);
    const t = this.add.text(0, 0, text, { font: "bold 15px Arial", color: HEX_GOLD }).setOrigin(0.5);
    c.add([g, t]);
    await new Promise((res) => {
      this.tweens.add({
        targets: c, y: 250, duration: 300, ease: "Back.easeOut",
        onComplete: () => this.time.delayedCall(600, () => {
          this.tweens.add({ targets: c, y: -60, alpha: 0, duration: 250, ease: "Cubic.easeIn", onComplete: () => { c.destroy(); res(); } });
        }),
      });
    });
  }

  startRound(index) {
    this.currentRound = index;
    const config = ROUNDS[index];
    this.roundAttempts = 0;
    this.roundStartTime = this.time.now;
    this.clearRound();

    // The arm may have been left mid-air (struck/frozen) by the previous
    // round's timeout or wrong answer — every round starts fresh at top.
    this.armY = ARM_Y_HIGH;
    this._drawArm(C_GREEN_BRIGHT, 0.22);

    const limit = config.type === "bughunt" ? 12000 : WAVE_TIME[config.wave];

    if (config.type === "predict" || config.type === "trace") this.setupPredict(config);
    else if (config.type === "bughunt") this.setupBugHunt(config);

    this.startArmDescent(limit, () => this.onArmExpired(config));
  }

  clearRound() {
    this.roundElements.forEach((e) => { if (e && e.destroy) e.destroy(); });
    this.roundElements = [];
    this.clearBed();
    this.clearRail();
  }

  async onArmExpired(config) {
    if (this.gameEnded) return;
    this.inputLocked = true;
    this.roundElements.forEach((e) => e.disableInteractive && e.disableInteractive());
    this.logAttempt(config, false, null, "timeout", this.roundTimeLimit, 1);
    await this.armSlam();
    if (!this._alive) return;
    await this.stampBed("smeared");
    if (!this._alive) return;
    this.updateWaveIndicator(this._roundInWave(), false);
    this.loseLife();
    this.updateCombo(false);
    if (this.lives <= 0) { this.time.delayedCall(400, () => this.gameOver()); return; }
    await this.showBitFeedback(MISCONCEPTION_FEEDBACK.timeout);
    if (!this._alive) return;
    this.clearRound();
    this.advanceRound();
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE A/B/C — PREDICT / TRACE
  // ══════════════════════════════════════════════════════════════

  setupPredict(config) {
    this.showTrialOnBed(config.source, config.question);
    this.showOptionBubbles(config.options, config);
  }

  showOptionBubbles(options, config) {
    const shuffled = Phaser.Utils.Array.Shuffle(options.slice());
    const n = shuffled.length;
    const spacing = 260;
    const startX = BED_CX - ((n - 1) * spacing) / 2;
    shuffled.forEach((opt, i) => {
      const x = startX + i * spacing, y = 600;
      const c = this.add.container(x, y).setDepth(41);
      const g = this.add.graphics();
      const w = 240, h = 48;
      const draw = (stroke) => {
        g.clear();
        g.fillStyle(0x1a1108, 1);
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
        g.lineStyle(2, stroke, 1);
        g.strokeRoundedRect(-w / 2, -h / 2, w, h, 10);
      };
      draw(C_BRASS);
      const label = opt.label || opt.value;
      const txt = this.add.text(0, 0, label, { font: "bold 12px Courier New", color: "#e8dfc8" }).setOrigin(0.5);
      if (txt.width > w - 16) txt.setFontSize(10);
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
    this.pauseArm();
    const timePctUsed = this.getTimePctUsed();
    const timeMs = Math.round(this.time.now - this.roundStartTime);
    const correct = opt.value === config.correct;
    this.logAttempt(config, correct, opt.value, opt.tag, timeMs, timePctUsed);
    this.roundElements.forEach((e) => e.disableInteractive && e.disableInteractive());

    const g = bubbleContainer.list[0];
    g.clear();
    g.fillStyle(0x1a1108, 1);
    g.fillRoundedRect(-120, -24, 240, 48, 10);
    g.lineStyle(2, correct ? C_GREEN_BRIGHT : C_RED, 1);
    g.strokeRoundedRect(-120, -24, 240, 48, 10);
    if (!correct) this.tweens.add({ targets: bubbleContainer, x: bubbleContainer.x + 5, duration: 35, yoyo: true, repeat: 4 });

    if (correct) await this.retractArm();
    await this.delay(100);
    if (!this._alive) return;
    await this.clearLog();
    this.clearBed();
    await this.runSnippetReveal(config.source, {});
    if (config.revealNote) this.createFloatingText(LOG_X + LOG_W / 2, LOG_Y + LOG_H + 30, config.revealNote, HEX_GRAY, "11px Arial", 2600);
    await this.delay(350);
    if (!this._alive) return;

    this.updateWaveIndicator(this._roundInWave(), correct);
    if (correct) {
      this.updateScore(this.scoreForAttempt(timePctUsed));
      this.updateCombo(true);
      if (this.roundAttempts === 0) this.correctFirstTry++;
      await this.delay(250);
      this.advanceRound();
    } else {
      await this.stampBed("missed");
      if (!this._alive) return;
      this.loseLife();
      this.updateCombo(false);
      if (this.lives <= 0) { this.time.delayedCall(400, () => this.gameOver()); return; }
      await this.showBitFeedback(MISCONCEPTION_FEEDBACK[opt.tag] || "Not quite — trace the log again.");
      if (!this._alive) return;
      this.advanceRound();
    }
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE D — BUG HUNT (token-level, line-aware)
  // ══════════════════════════════════════════════════════════════

  setupBugHunt(config) {
    this.clearBed();
    const header = this.add.text(BED_CX, BED_Y0 + 14, "CLICK THE BUG", { font: "bold 13px Arial", color: HEX_MAGENTA }).setOrigin(0.5);
    this.bedContainer.add(header);
    this.tweens.add({ targets: header, alpha: 0.5, duration: 500, yoyo: true, repeat: -1 });
    this.bedLabel.setText(`IMPRESSION ${this.currentRound + 1}/15`);

    this._bugHuntTokenObjs = [];
    const fontSize = 14;
    const startY = BED_Y0 + 40;

    config.lines.forEach((line, li) => {
      const y = startY + li * 26;
      if (line.trim().startsWith("//")) {
        const t = this.add.text(BED_CX, y, line, { font: "italic 11px Courier New", color: "#546e7a" }).setOrigin(0.5);
        this.bedContainer.add(t);
        return;
      }
      const tokens = this._syntaxTokenize(line);
      const measured = tokens.map((tk) => { const tmp = this.add.text(0, 0, tk.t, { font: `bold ${fontSize}px Courier New` }); const w = tmp.width; tmp.destroy(); return w; });
      const totalW = measured.reduce((a, b) => a + b, 0);
      let x = BED_CX - totalW / 2;
      tokens.forEach((tok, ti) => {
        const w = measured[ti];
        const isBug = (li + 1 === config.faultLine) && tok.t === config.faultToken;
        const t = this.add.text(x + w / 2, y, tok.t, { font: `bold ${fontSize}px Courier New`, color: tok.c }).setOrigin(0.5);
        t.setData("isBug", isBug);
        t.setData("line", li + 1);
        const hitW = Math.max(w + 6, 30), hitH = Math.max(fontSize + 8, 30);
        t.setInteractive(new Phaser.Geom.Rectangle(-hitW / 2, -hitH / 2, hitW, hitH), Phaser.Geom.Rectangle.Contains);
        this.bedContainer.add(t);
        t.on("pointerover", () => { if (!this.inputLocked) t.setColor(HEX_GOLD); });
        t.on("pointerout", () => { if (!this.inputLocked) t.setColor(tok.c); });
        t.on("pointerdown", () => {
          if (this.inputLocked) return;
          this.inputLocked = true;
          this.onTokenClicked(t, config);
        });
        this._bugHuntTokenObjs.push(t);
        x += w;
      });
    });
    this.inputLocked = false;
  }

  async onTokenClicked(tokenObj, config) {
    this.pauseArm();
    const timePctUsed = this.getTimePctUsed();
    const timeMs = Math.round(this.time.now - this.roundStartTime);
    const correct = tokenObj.getData("isBug");
    this.logAttempt(config, correct, `line ${tokenObj.getData("line")}`, correct ? null : config.wrongTag, timeMs, timePctUsed);
    this._bugHuntTokenObjs.forEach((t) => t.disableInteractive());

    if (correct) {
      tokenObj.setColor(HEX_GREEN_BRIGHT);
      this.tweens.add({ targets: tokenObj, alpha: 0.4, duration: 200, yoyo: true, repeat: 1 });
      await this.retractArm();
    } else {
      tokenObj.setColor(HEX_RED);
      this.tweens.add({ targets: tokenObj, x: tokenObj.x + 4, duration: 30, yoyo: true, repeat: 4 });
      this._bugHuntTokenObjs.filter((t) => t.getData("isBug")).forEach((t) => this.tweens.add({ targets: t, alpha: 0.3, duration: 180, yoyo: true, repeat: 3 }));
    }

    await this.delay(150);
    if (!this._alive) return;
    await this.clearLog();
    this.clearBed();
    await this.runBugHuntReveal(config);
    if (config.revealNote) this.createFloatingText(LOG_X + LOG_W / 2, LOG_Y + LOG_H + 30, config.revealNote, HEX_GRAY, "11px Arial", 2600);
    await this.delay(350);
    if (!this._alive) return;

    this.updateWaveIndicator(this._roundInWave(), correct);
    if (correct) {
      this.updateScore(this.scoreForAttempt(timePctUsed));
      this.updateCombo(true);
      if (this.roundAttempts === 0) this.correctFirstTry++;
      await this.delay(250);
      this.advanceRound();
    } else {
      await this.stampBed("missed");
      if (!this._alive) return;
      this.loseLife();
      this.updateCombo(false);
      if (this.lives <= 0) { this.time.delayedCall(400, () => this.gameOver()); return; }
      await this.showBitFeedback(config.explanation || MISCONCEPTION_FEEDBACK[config.wrongTag] || "Not that one — look again.");
      if (!this._alive) return;
      this.advanceRound();
    }
  }

  /** Bug-hunt reveals run the learner's ACTUAL (buggy) call through the
   * real evaluator — the missing-argument / wrong-specifier exceptions
   * are genuinely derived, never scripted. */
  async runBugHuntReveal(config) {
    if (config.round === 14) {
      const r = await this.runComposition('"%s is %d years old"', config.args);
      return r;
    }
    if (config.round === 15) {
      await this.runComposition('"Price: $%d"', config.args);
      await this.delay(400);
      if (!this._alive) return;
      await this.clearLog();
      await this.runComposition('"Price: $%.2f"', config.args);
      return;
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

  scoreForAttempt(timePctUsed) {
    let points = 100 * this.getComboMultiplier();
    const remaining = 1 - timePctUsed;
    if (remaining > 0.6) { points += 50; this.fastBonusCount++; this.createFloatingText(BED_CX, BED_Y0 - 20, "⚡ CLEAN CATCH +50", HEX_GOLD, "bold 13px Arial", 900); }
    else if (remaining > 0.3) { points += 25; this.fastBonusCount++; this.createFloatingText(BED_CX, BED_Y0 - 20, "⚡ +25", HEX_GOLD, "bold 12px Arial", 800); }
    return points;
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
    if (mult > 1) this.tweens.add({ targets: this.comboText, scale: 1.3, duration: 130, yoyo: true });
  }

  loseLife() {
    this.lives = Math.max(0, this.lives - 1);
    const icon = this.lifeIcons[this.lives];
    if (icon) this.tweens.add({ targets: icon, alpha: 0.12, duration: 350 });
    return this.lives <= 0;
  }

  logAttempt(config, correct, selectedAnswer, misconceptionTag, timeMs, timePctUsed) {
    this.roundAttempts = (this.roundAttempts || 0) + 1;
    this.totalTimePctUsed += timePctUsed !== undefined ? timePctUsed : 1;
    this.attemptLog.push({
      round: config.round, wave: config.wave, type: config.type, concept: config.concept,
      correct, selectedAnswer, misconceptionTag: misconceptionTag || null,
      timeMs, timePctUsed: timePctUsed !== undefined ? timePctUsed : 1, attemptNumber: this.roundAttempts,
    });
  }

  advanceRound() {
    this.clearRound();
    const next = this.currentRound + 1;
    if (next >= ROUNDS.length) { this.levelComplete(); return; }
    const nextConfig = ROUNDS[next];
    if (nextConfig.wave !== this.currentWave) { this.startWave(nextConfig.wave); return; }
    this.time.delayedCall(700, () => { if (this._alive && !this.gameEnded) this.startRound(next); });
  }

  // ══════════════════════════════════════════════════════════════
  // END STATES
  // ══════════════════════════════════════════════════════════════

  gameOver() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this._killArmTween();
    this.clearRound();
    this.hideBubble();

    (async () => {
      this.rowObjs.forEach((r) => r.textT.setColor("#3d4450"));
      this._bulbs.forEach((b) => { if (b.bulb.active) this.tweens.add({ targets: b.bulb, alpha: 0.05, duration: 500 }); });

      const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
      this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });
      const title = this.add.text(640, 240, "PRESSES JAMMED", { font: "bold 40px Arial", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
      this.tweens.add({ targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut", onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }) });
      this.add.text(640, 310, `Score: ${this.score}`, { font: "20px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
      this.add.text(640, 350, `Impressions Cleared: ${this.currentRound} / 15`, { font: "16px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);
      this._makeButton(640, 420, "CLEAR THE JAM", 220, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
    })();
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this._killArmTween();
    this.clearRound();
    this.hideBubble();

    try { GameManager.completeLevel(43, Math.round((this.correctFirstTry / 15) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("printf_schema_tuned"); } catch (_) {}
    try {
      localStorage.setItem("level44_results", JSON.stringify({
        level: 44, concept: "output_printf", phase: "tuning",
        score: this.score, accuracy: this.correctFirstTry / 15, avgTimePct: this.totalTimePctUsed / 15,
        fastBonuses: this.fastBonusCount, comboMax: this.maxCombo, stars: this._starRating(),
        livesRemaining: this.lives, attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.pressroomFinale().then(() => { if (this._alive) this.showScoreTally(); });
  }

  async pressroomFinale() {
    await this.retractArm();
    this.warningLed.setFillStyle(C_GOLD, 0.9);
    this._bulbs.forEach((b) => { if (b.bulb.active) this.tweens.add({ targets: b.bulb, alpha: 0.7, duration: 600 }); });
    await this.clearLog();
    await this.runComposition('"%s"', [{ value: "ALL IMPRESSIONS CLEAN", type: "string" }]);
    this.createConfetti(LOG_X + LOG_W / 2, LOG_Y + LOG_H / 2, 32);
    await this.delay(500);
  }

  _starRating() {
    const acc = this.correctFirstTry / 15;
    const avgPct = this.totalTimePctUsed / 15;
    if (acc >= 0.9 && avgPct <= 0.55) return 3;
    if (acc >= 0.75) return 2;
    return 1;
  }

  showScoreTally() {
    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
    this.tweens.add({ targets: ov, fillAlpha: 0.85, duration: 500 });

    const panel = this.add.graphics().setDepth(90);
    panel.fillStyle(0x1a1108, 1);
    panel.fillRoundedRect(360, 90, 560, 440, 16);
    panel.lineStyle(2, C_BRASS, 1);
    panel.strokeRoundedRect(360, 90, 560, 440, 16);

    const title = this.add.text(640, 130, "IMPRESSIONS CLEAN", { font: "bold 32px Georgia", color: HEX_BRASS }).setOrigin(0.5).setDepth(91).setScale(0);
    this.tweens.add({ targets: title, scale: 1, duration: 350, ease: "Back.easeOut" });

    const acc = Math.round((this.correctFirstTry / 15) * 100);
    const avgResponseSec = ((this.totalTimePctUsed / 15) * (WAVE_TIME[2] / 1000)).toFixed(1);
    const lines = [`ACCURACY: ${acc}%`, `AVG RESPONSE: ${avgResponseSec}s`, `CLEAN-CATCH BONUSES: ${this.fastBonusCount}`, `BEST COMBO: ×${this.getComboMultiplierFor(this.maxCombo)}`];
    lines.forEach((s, i) => {
      const t = this.add.text(500, 185 + i * 26, s, { font: "14px Arial", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 250, delay: 300 + i * 130 });
    });
    const totalText = this.add.text(500, 185 + 4 * 26, "TOTAL: 0", { font: "bold 22px Arial", color: HEX_GOLD }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: totalText, alpha: 1, duration: 250, delay: 900 });
    const counter = { v: 0 };
    this.tweens.add({ targets: counter, v: this.score, duration: 1000, delay: 900, onUpdate: () => totalText.setText(`TOTAL: ${Math.round(counter.v)}`) });

    const stars = this._starRating();
    for (let i = 0; i < 3; i++) {
      const earned = i < stars;
      const s = this.add.text(640 + (i - 1) * 60, 340, "★", { font: "40px Arial", color: earned ? HEX_GOLD : "#2a3040" }).setOrigin(0.5).setDepth(91).setScale(0);
      this.tweens.add({ targets: s, scale: 1, duration: 250, delay: 1500 + i * 200, ease: earned ? "Back.easeOut" : "Cubic.easeOut" });
    }

    const badge = this.add.container(640, 420).setDepth(91).setAlpha(0);
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillCircle(0, 0, 30);
    bg.lineStyle(3, C_GOLD, 1);
    bg.strokeCircle(0, 0, 30);
    bg.fillStyle(0x241a10, 1);
    bg.lineStyle(1.5, C_BRASS, 1);
    bg.fillRoundedRect(-14, -6, 28, 5, 1);
    const sluglet = this.add.text(0, 3, "%d", { font: "bold 10px Courier New", color: HEX_GOLD }).setOrigin(0.5);
    badge.add([bg, sluglet]);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 2000 });
    const badgeLbl = this.add.text(640, 458, "printf() SCHEMA TUNED", { font: "bold 13px Arial", color: HEX_GOLD }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: badgeLbl, alpha: 1, duration: 300, delay: 2150 });

    this._makeButton(500, 495, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(760, 495, "NEXT: The Print Floor →", 260, 44, { fill: 0x00733a, stroke: C_GREEN_BRIGHT, textColor: "#ffffff" }, () => {
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
