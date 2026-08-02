/**
 * Level 75 — "The Precision Trials" (Type Conversion Wing: Tuning Phase —
 * Double.parseDouble())
 * ===========================================================================
 * Tunes the L74 parseDouble() schema through rapid-fire fluency trials. A
 * titration burette dripping into a receiving flask IS the timer — a
 * linear tween drives the burette's draining level and the flask's
 * filling level, exactly like L69's sand column / L72's pressure gauge,
 * re-skinned as laboratory glassware. The reveal stage hosts a MINI DUAL
 * APPARATUS — a compact Integer Furnace (L71) and Decimal Crucible (L74)
 * side by side — so every discrimination round can show BOTH instruments,
 * one glowing (the one that actually ran), one dim.
 *
 * SPEC CORRECTION (caught by hand-tracing Round 12 before any code was
 * written, per the established discipline): the original spec's Round 12
 * used price = "19.99", computing cents = (int)(price * 100) and
 * asserting the answer is "1999 cents". Direct computation (both in this
 * evaluator's JS and in real Java, since both use IEEE 754 doubles)
 * shows 19.99 * 100 = 1998.9999999999998 — the double representation of
 * 19.99 is not exact, so the product falls just short of 1999.0, and
 * (int) TRUNCATION (never rounding — which is precisely what this round
 * is teaching) yields 1998, not 1999. This is not a JS quirk; Java would
 * produce the identical wrong answer for the identical reason. Changed
 * the test price to "24.99" (24.99 * 100 = 2499 exactly, verified via
 * direct computation with no floating-point remainder), preserving the
 * exact pedagogical shape (decimal-to-cents via multiply-then-cast,
 * truncation not rounding) without the silent precision trap. Adjusted
 * the distractor set's values to match (24.99 cents / 2500 cents for the
 * "rounds instead of truncates" belief).
 *
 * New fluency material beyond L74's evaluator:
 *  - Scientific notation ("2.5e3" → 2500.0) — Java's parseDouble accepts
 *    'e'/'E' exponent markers; JS's parseFloat already handles the same
 *    notation, so only the VALIDATION regex needed extending.
 *  - Whitespace tolerance (" 3.14 " → 3.14) — a genuine Java asymmetry:
 *    parseDouble trims internally; parseInt does NOT. The evaluator
 *    trims before validating/parsing for parseDouble specifically,
 *    leaving parseInt's stricter no-whitespace rule untouched.
 *  - The three special strings parseDouble recognizes beyond ordinary
 *    numbers: "NaN", "Infinity", "-Infinity".
 *  - An explicit (int) cast on a double expression (truncates toward
 *    zero, changes the value's type to int) — new to the evaluator.
 *  - A minimal if/(...)  {...} else {...} block (Round 13's freezing
 *    check), with '==' comparison performing Java's automatic
 *    int/double promotion (0.0 == 0 is true).
 */

import Phaser from "phaser";
import { GameManager } from "../../../GameManager.js";
import { BadgeSystem } from "../../../BadgeSystem.js";

const W = 1280, H = 720;

const C_CYAN = 0x4fc3f7, C_GOLD = 0xffd740, C_ORANGE = 0xff9800, C_BLUE_GRAY = 0x8ea6c8;
const C_GREEN_BRIGHT = 0x00e676, C_RED = 0xf44336, C_GRAY = 0x78909c, C_COPPER = 0xb87333;
const HEX_CYAN = "#4fc3f7", HEX_GOLD = "#ffd740", HEX_ORANGE = "#ff9800", HEX_BLUE_GRAY = "#8ea6c8";
const HEX_GREEN_BRIGHT = "#00e676", HEX_RED = "#f44336", HEX_GRAY = "#78909c", HEX_COPPER = "#b87333";
const C_INDIGO = 0x3949ab, HEX_INDIGO = "#3949ab";
const C_AMBER = 0xff9800, HEX_AMBER = "#ff9800";

// Precision card
const CARD_X0 = 230, CARD_X1 = 690, CARD_Y0 = 100, CARD_Y1 = 420;
const CARD_CX = (CARD_X0 + CARD_X1) / 2;
// Titration burette (hero timer)
const BUR_X = 785, BUR_Y0 = 90, BUR_Y1 = 390, BUR_W = 30;
const CLAMP_X = BUR_X - 24;
const STOPCOCK_Y = 395;
const FLASK_X = 800, FLASK_Y0 = 430, FLASK_Y1 = 500, FLASK_W = 80;
// Mini dual apparatus (reveal stage) — mini furnace (left) + mini crucible (right)
const MINI_Y0 = 90, MINI_Y1 = 340;
const MF_X0 = 915, MF_X1 = 1060; // mini furnace footprint
const MC_X0 = 1075, MC_X1 = 1220; // mini crucible footprint
// Trial slate / container shelf
const SLATE_X = 910, SLATE_Y = 355, SLATE_W = 310, SLATE_H = 130;
const SHELF_X = 910, SHELF_Y = 500, SHELF_W = 310, SHELF_H = 80;

const TUTORIAL_KEY = "level75_tutorial_done";
const WAVE_TIME = { 1: 12000, 2: 10000, 3: 9000 };

// ══════════════════════════════════════════════════════════════
// ROUND CONFIGURATION
// ══════════════════════════════════════════════════════════════
const ROUNDS = [
  // ══ WAVE 1 — Rapid Dissolutions (12s) ══
  { round: 1, wave: 1, type: "predict",
    source: 'double x = Double.parseDouble("6.28");',
    question: "What is stored in x?", correct: "6.28",
    options: [
      { value: "6.28", tag: null },
      { value: "6", tag: "parseDouble_truncates_belief" },
      { value: "error", tag: "nfe_on_valid_double", label: "NumberFormatException" },
      { value: '"6.28"', tag: "parseDouble_returns_string_belief", label: '"6.28" (String)' },
    ],
    concept: "fluent_basic_double" },

  { round: 2, wave: 1, type: "predict",
    source: 'double x = Double.parseDouble("50");',
    question: "What is stored in x?", correct: "50.0",
    options: [
      { value: "50.0", tag: null },
      { value: "50", tag: "parseDouble_returns_int_belief" },
      { value: "error", tag: "integer_string_crashes_parseDouble_belief", label: "NumberFormatException" },
      { value: '"50"', tag: "parseDouble_returns_string_belief", label: '"50" (String)' },
    ],
    concept: "fluent_integer_to_double" },

  { round: 3, wave: 1, type: "predict",
    source: 'int y = Integer.parseInt("50");',
    question: "What is stored in y?", correct: "50",
    options: [
      { value: "50", tag: null },
      { value: "50.0", tag: "parseInt_returns_double_belief" },
      { value: "error", tag: "nfe_on_valid_int", label: "NumberFormatException" },
      { value: '"50"', tag: "parseInt_returns_string_belief", label: '"50" (String)' },
    ],
    revealNote: "The furnace produces a SOLID bar: 50, not 50.0. parseInt → int; parseDouble → double. Same input, different instrument, different type.",
    concept: "fluent_parseInt_contrast" },

  { round: 4, wave: 1, type: "predict",
    source: 'double x = Double.parseDouble("xyz");',
    question: "What happens?", correct: "nfe",
    options: [
      { value: "nfe", tag: null, label: "NumberFormatException" },
      { value: "0.0", tag: "nfe_returns_zero_belief" },
      { value: "compile_error", tag: "nfe_is_compile_error_belief", label: "COMPILE ERROR" },
      { value: "NaN", tag: "nfe_returns_nan_belief" },
    ],
    concept: "fluent_nfe_double" },

  { round: 5, wave: 1, type: "trace",
    source: 'String s = "4.5";\ndouble d = Double.parseDouble(s);\nSystem.out.println(d + 0.5);',
    question: "What prints?", correct: "5.0",
    options: [
      { value: "5.0", tag: null },
      { value: "5", tag: "double_prints_without_dot_belief" },
      { value: '"4.50.5"', tag: "string_concat_vs_addition", label: '"4.50.5"' },
      { value: "error", tag: "mixed_types_crash_belief", label: "Error" },
    ],
    concept: "fluent_parseDouble_arithmetic" },

  // ══ WAVE 2 — The Decimal Edge (10s) ══
  { round: 6, wave: 2, type: "predict",
    source: 'double x = Double.parseDouble("5.");',
    question: "What is stored in x?", correct: "5.0",
    options: [
      { value: "5.0", tag: null },
      { value: "error", tag: "trailing_dot_crash_belief", label: "NumberFormatException" },
      { value: "5", tag: "parseDouble_returns_int_belief" },
      { value: "0.5", tag: "trailing_dot_is_leading_belief" },
    ],
    revealNote: "Trailing dot is legal: '5.' dissolves to 5.0. The dot is present but nothing follows — Java treats it as 5.0. Trailing dot, leading dot (.5 = 0.5), or middle dot (3.14) — all valid positions.",
    concept: "edge_trailing_dot" },

  { round: 7, wave: 2, type: "predict",
    source: 'double x = Double.parseDouble(".");',
    question: "What happens?", correct: "nfe",
    options: [
      { value: "nfe", tag: null, label: "NumberFormatException" },
      { value: "0.0", tag: "lone_dot_valid_belief", label: "x = 0.0" },
      { value: "0", tag: "lone_dot_zero_belief" },
      { value: "compile_error", tag: "nfe_is_compile_error_belief", label: "COMPILE ERROR" },
    ],
    revealNote: "A lone dot is NOT a number — there are no digits at all. '.' has a separator but nothing to separate. NFE. The dot needs at least one digit on either side.",
    concept: "edge_lone_dot" },

  { round: 8, wave: 2, type: "predict",
    source: 'double x = Double.parseDouble("2.5e3");',
    question: "What is stored in x?", correct: "2500.0",
    options: [
      { value: "2500.0", tag: null },
      { value: "error", tag: "scientific_notation_crash_belief", label: "NumberFormatException" },
      { value: "2.5", tag: "e_ignored_belief" },
      { value: "2503.0", tag: "e_means_plus_belief" },
    ],
    revealNote: "Scientific notation: '2.5e3' means 2.5 × 10³ = 2500.0. The 'e' (or 'E') is LEGAL in parseDouble — it's the exponent marker. parseInt would crash on 'e', but parseDouble reads it as a power of ten.",
    concept: "edge_scientific_notation" },

  { round: 9, wave: 2, type: "predict",
    source: 'double x = Double.parseDouble(" 3.14 ");',
    question: "What happens?", correct: "3.14",
    options: [
      { value: "3.14", tag: null },
      { value: "error", tag: "parseDouble_strips_spaces_belief", label: "NumberFormatException" },
      { value: "0.0", tag: "spaces_give_zero_belief" },
      { value: "compile_error", tag: "nfe_is_compile_error_belief", label: "COMPILE ERROR" },
    ],
    revealNote: "SURPRISE: parseDouble DOES accept leading/trailing whitespace — unlike parseInt which crashes on spaces! parseDouble internally trims before parsing. This is a Java-specific behavior: the decimal crucible is more forgiving than the integer furnace on whitespace.",
    concept: "edge_whitespace_accepted" },

  { round: 10, wave: 2, type: "predict",
    source: 'double x = Double.parseDouble("NaN");',
    question: "What is stored in x?", correct: "NaN",
    options: [
      { value: "NaN", tag: null, label: "NaN (Not a Number)" },
      { value: "error", tag: "nan_string_crash_belief", label: "NumberFormatException" },
      { value: "0.0", tag: "nan_is_zero_belief" },
      { value: "compile_error", tag: "nfe_is_compile_error_belief", label: "COMPILE ERROR" },
    ],
    revealNote: "THE STRANGEST EDGE: 'NaN' is a VALID parseDouble input — it produces Double.NaN (Not a Number). NaN is a special double value meaning 'this computation has no meaningful result.' The String literally spells out the special value. 'Infinity' and '-Infinity' also work. These are the doubles that aren't really numbers.",
    concept: "edge_nan_string" },

  // ══ WAVE 3 — Deep Traces & Bug Hunt ══
  { round: 11, wave: 3, type: "trace",
    source: 'String a = "2.5";\nString b = "3";\ndouble sum = Double.parseDouble(a) + Integer.parseInt(b);\nSystem.out.println(sum);',
    question: "What prints?", correct: "5.5",
    options: [
      { value: "5.5", tag: null },
      { value: "5.0", tag: "int_truncates_double_belief" },
      { value: "5", tag: "double_prints_without_dot_belief" },
      { value: "error", tag: "mixed_parsers_crash_belief", label: "Error" },
    ],
    revealNote: "Mixed parsers: parseDouble('2.5') = 2.5 (double); parseInt('3') = 3 (int). double + int → double (Java promotes the int to double): 2.5 + 3.0 = 5.5. Using both instruments in one expression is legal — the int is promoted to double automatically.",
    concept: "trace_mixed_parsers" },

  { round: 12, wave: 3, type: "trace",
    source: 'double price = Double.parseDouble("24.99");\nint cents = (int) (price * 100);\nSystem.out.println(cents + " cents");',
    question: "What prints?", correct: "2499 cents",
    options: [
      { value: "2499 cents", tag: null },
      { value: "24.99 cents", tag: "cast_ignored_belief" },
      { value: "error", tag: "cast_on_expression_crashes_belief", label: "Error" },
      { value: "2500 cents", tag: "cast_rounds_belief" },
    ],
    revealNote: "parseDouble → 24.99; × 100 = 2499.0; (int) truncates to 2499. The cast is the bridge from double to int — acknowledging the narrowing explicitly. The cents pattern: multiply to shift the decimals, then cast to int.",
    concept: "trace_cents_pattern" },

  { round: 13, wave: 3, type: "trace",
    source: 'String temp = "0.0";\ndouble t = Double.parseDouble(temp);\nif (t == 0) {\n    System.out.println("Freezing");\n} else {\n    System.out.println("Not freezing");\n}',
    question: "What prints?", correct: "Freezing",
    options: [
      { value: "Freezing", tag: null },
      { value: "Not freezing", tag: "double_zero_not_equal_belief" },
      { value: "error", tag: "double_int_comparison_crashes_belief", label: "Error" },
      { value: "compile_error", tag: "double_int_compare_compile_belief", label: "COMPILE ERROR" },
    ],
    revealNote: "0.0 == 0 is TRUE — Java promotes the int 0 to double 0.0 for the comparison. The parseDouble gave 0.0; the comparison matched. Double-to-int promotion in comparisons is automatic and silent.",
    concept: "trace_double_int_comparison" },

  { round: 14, wave: 3, type: "bughunt",
    lines: ['String priceStr = "19.99";', "int price = Integer.parseInt(priceStr);", 'System.out.println("Price: " + price);', "// intent: store the decimal price"],
    faultToken: "int price = Integer.parseInt(priceStr)", faultLine: 2, tokenRegion: "wrong_parser",
    fix: "double price = Double.parseDouble(priceStr);",
    explanation: "The wrong parser — parseInt on '19.99' crashes at the dot. The text contains a decimal; the crucible (parseDouble) is the right instrument, not the furnace (parseInt). And the container must be double, not int.",
    wrongTag: "wrong_parser_choice",
    revealNote: "Dual-future reveal: the buggy run feeds '19.99' into the mini furnace — '.' RED, gate slams, NFE crash. Reset; the fixed run feeds '19.99' into the mini crucible — '.' AMBER, dissolves, 19.99 pours into a double container. Bit: 'Dots mean decimals; decimals mean parseDouble. The furnace is for whole numbers only.'",
    concept: "wrong_parser_bug" },

  { round: 15, wave: 3, type: "bughunt",
    lines: ['String val = "3.14";', "int x = Double.parseDouble(val);", 'System.out.println("Value: " + x);', "// intent: get 3.14 as a number"],
    faultToken: "int x = Double.parseDouble(val)", faultLine: 2, tokenRegion: "type_mismatch",
    fix: "double x = Double.parseDouble(val);",
    explanation: "The type mismatch — parseDouble returns a double (3.14), but the container is int. Java won't narrow double to int silently — COMPILE ERROR. Fix: use a double container, or explicitly cast with (int) to truncate.",
    wrongTag: "type_mismatch_assignment",
    revealNote: "Dual-future reveal: the buggy run's crucible dissolves '3.14' into liquid 3.14 — the liquid tries to pour into an INT container (solid block shape) and BOUNCES off (compile stamp: 'incompatible types: possible lossy conversion from double to int'). Reset; the fixed run pours into a DOUBLE container (graduated cylinder) cleanly. Bit: 'The crucible produces liquid; liquid needs a liquid container. int is solid — it won't accept the pour without a cast.'",
    concept: "type_mismatch_bug" },
];

const MISCONCEPTION_FEEDBACK = {
  parseDouble_truncates_belief: "parseDouble does NOT truncate — the full decimal dissolves exactly. Every digit is preserved.",
  parseDouble_returns_string_belief: "parseDouble returns a primitive double — the liquid metal, not the paper strip.",
  nfe_on_valid_double: "That's a valid decimal — the crucible accepts it. Digits plus at most one dot plus an optional leading sign.",
  parseDouble_returns_int_belief: "parseDouble ALWAYS returns a double — even a whole-number String becomes X.0. The .0 is permanent.",
  integer_string_crashes_parseDouble_belief: "Integer Strings are VALID in parseDouble — the crucible is more permissive than the furnace: it accepts everything the furnace accepts, plus dots.",
  parseInt_returns_double_belief: "parseInt returns int — always. 50, not 50.0. The furnace produces solid bars, never liquid.",
  nfe_on_valid_int: "A well-formed digit string never crashes parseInt — only invalid characters (like dots) do.",
  parseInt_returns_string_belief: "parseInt returns int, not String. The bar that exits the furnace is metal, not paper.",
  nfe_returns_zero_belief: "The crucible doesn't return a default — it CRASHES on invalid input. No fallback.",
  nfe_is_compile_error_belief: "NumberFormatException is a RUNTIME crash — the compiler approved the String argument. Only at run time does the crucible discover invalid input.",
  nfe_returns_nan_belief: "parseDouble doesn't quietly substitute NaN for garbage text — it CRASHES with NumberFormatException. NaN only appears when you ask for it explicitly (the String \"NaN\" itself).",
  double_prints_without_dot_belief: "println on a double ALWAYS shows the decimal part — 5.0, not 5. The .0 is the double's signature.",
  string_concat_vs_addition: "Without parseDouble, + between Strings concatenates. After parseDouble, + is real arithmetic.",
  mixed_types_crash_belief: "double + double is ordinary arithmetic — no crash. Both operands were already valid doubles before the +.",
  trailing_dot_crash_belief: "Trailing dot is legal: '5.' = 5.0. The dot is present but nothing follows — Java reads it as 5 point nothing.",
  trailing_dot_is_leading_belief: "The dot's position matters — '5.' keeps 5 as the whole part, not as a fraction. It's 5.0, not 0.5.",
  lone_dot_valid_belief: "A lone dot has no digits — nothing to separate. NFE. At least one digit must appear on either side.",
  lone_dot_zero_belief: "A lone dot isn't a silent zero — it's an invalid String. NumberFormatException, not 0.",
  scientific_notation_crash_belief: "'e' in parseDouble is the EXPONENT marker — 2.5e3 means 2.5 × 10³ = 2500.0. Legal and common in scientific data.",
  e_ignored_belief: "The 'e' is NOT ignored — it multiplies by the power of ten that follows. 2.5e3 = 2500.0, not 2.5.",
  e_means_plus_belief: "'e3' means × 10³, not + 3. Scientific notation is multiplication by a power of ten.",
  parseDouble_strips_spaces_belief: "Unlike parseInt, parseDouble DOES tolerate leading/trailing whitespace — it trims internally. ' 3.14 ' → 3.14. One of Java's quiet mercies.",
  spaces_give_zero_belief: "The spaces don't erase the number — parseDouble trims them away and reads the digits underneath. Not zero, 3.14.",
  nan_string_crash_belief: "'NaN' is a VALID parseDouble input — it produces Double.NaN. NaN, Infinity, and -Infinity are the three special strings parseDouble recognizes beyond normal numbers.",
  nan_is_zero_belief: "NaN is NOT zero — it's 'Not a Number', a special value meaning the computation has no meaningful result. NaN ≠ 0.0.",
  int_truncates_double_belief: "When int and double meet in +, the int promotes to double — no truncation happens. 3 becomes 3.0, then 2.5 + 3.0 = 5.5.",
  mixed_parsers_crash_belief: "Mixing parseInt and parseDouble in one expression is fine — the int result auto-promotes to double for the addition.",
  cast_ignored_belief: "(int) fires — it truncated 2499.0 to 2499. The cast changes the type and drops the fraction.",
  cast_on_expression_crashes_belief: "A cast on a parenthesized numeric expression is completely legal — no crash. (int) (price * 100) casts the PRODUCT.",
  cast_rounds_belief: "(int) TRUNCATES toward zero, never rounds. 2499.0 → 2499. 2499.9 would also become 2499, not 2500.",
  double_zero_not_equal_belief: "0.0 == 0 is true — Java promotes 0 to 0.0 for the comparison. Zero is zero in any type.",
  double_int_comparison_crashes_belief: "Comparing a double to an int with == never crashes — Java silently promotes the int side to double first.",
  double_int_compare_compile_belief: "int and double are compatible in ==  — Java allows numeric comparisons across primitive types via automatic promotion. No compile error.",
  wrong_parser_choice: "parseInt on decimal text = crash. The dot is a digit-only furnace's kryptonite. Use parseDouble for ANY text that might contain a dot.",
  type_mismatch_assignment: "parseDouble returns double; an int container can't hold it without a cast. Fix: double container, or (int) cast for intentional truncation.",
  double_to_int_auto_belief: "Java doesn't auto-narrow double to int — that would lose precision silently. You must acknowledge the narrowing with (int) or use a double container.",
  timeout: "The endpoint! Close the stopcock faster — dissolution verdicts are reflexes now.",
};

export class Level75Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level75Scene" });
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
    this.totalTimeMs = 0;
    this.attemptLog = [];
    this.roundElements = [];
    this.roundStartTime = 0;
    this.roundAttempts = 0;
    this.inputLocked = true;
    this.gameEnded = false;
    this._alive = true;
    this._titrationHalted = true;
  }

  preload() {}

  create() {
    this._alive = true;
    this.createParticleTexture();
    this.createBackground();
    this.createLabDim();
    this.createLabBench();
    this.createCalibrationCert();
    this.createPeriodicPoster();
    this.createTrialsBanner();
    this.createParticles();
    this.createPrecisionCard();
    this.createTitrationBurette();
    this.createMiniDualApparatus();
    this.createTrialSlate();
    this.createContainerShelf();
    this.createHUD();
    this.createBit();

    this.events.on("shutdown", () => { this._alive = false; this._killTitrationTween(); });
    this.checkTutorial();
  }

  update(time, delta) {
    this.updateParticles(time, delta);
    this.updateTitrationDrain(time);
    this.updateTitrationUrgency(time);
    this.updateDropStream(time);
    this.updateFurnaceGlow(time);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // SETUP — PRECISION TRIALS LAB DRESSING
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l75_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l75_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x0a0614).setDepth(0);
  }

  createLabDim() {
    const g = this.add.graphics().setDepth(1).setAlpha(0.4);
    g.fillStyle(0x0a0d18, 1);
    g.fillRect(0, 635, W, 85);
    g.lineStyle(1, 0x2a3654, 0.5);
    g.lineBetween(0, 637, W, 637);
  }

  createLabBench() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x1a0e05, 0.3);
    g.lineStyle(2, C_COPPER, 1);
    g.fillRect(200, 50, 580, 120);
    g.strokeRect(200, 50, 580, 120);
    const drawFlask = (x, y) => {
      g.lineStyle(1, C_COPPER, 0.15);
      g.strokeTriangle(x - 8, y - 12, x + 8, y - 12, x, y + 10);
      g.strokeRect(x - 3, y - 18, 6, 8);
    };
    const drawBeaker = (x, y) => {
      g.lineStyle(1, C_COPPER, 0.15);
      g.strokeRect(x - 8, y - 12, 16, 20);
    };
    const drawRack = (x, y) => {
      g.lineStyle(1, C_COPPER, 0.15);
      for (let i = 0; i < 4; i++) g.strokeRect(x - 16 + i * 10, y - 14, 6, 16);
    };
    drawFlask(260, 130);
    drawBeaker(320, 130);
    drawRack(420, 130);
  }

  createCalibrationCert() {
    const g = this.add.graphics().setDepth(2).setAlpha(0.3);
    g.lineStyle(2, C_COPPER, 1);
    g.strokeRect(1130, 100, 100, 70);
    g.lineStyle(1, C_COPPER, 0.6);
    for (let i = 0; i < 4; i++) g.lineBetween(1140, 115 + i * 10, 1220, 115 + i * 10);
    g.fillStyle(C_GOLD, 0.8);
    g.fillCircle(1180, 158, 6);
  }

  createPeriodicPoster() {
    const g = this.add.graphics().setDepth(2).setAlpha(0.25);
    g.lineStyle(2, C_COPPER, 1);
    g.strokeRect(60, 100, 100, 80);
    const cells = [{ label: "int", x: 78 }, { label: "double", x: 108 }, { label: "String", x: 138 }];
    cells.forEach((c) => {
      g.lineStyle(1, C_COPPER, 0.5);
      g.strokeRect(c.x - 12, 112, 24, 24);
      this.add.text(c.x, 124, c.label, { font: "6px Courier New", color: HEX_COPPER }).setOrigin(0.5).setAlpha(0.4).setDepth(3);
    });
    this.add.text(110, 160, "parseInt · parseDouble · valueOf", { font: "5px Georgia", color: HEX_CYAN }).setOrigin(0.5).setAlpha(0.35).setDepth(3);
  }

  createTrialsBanner() {
    const g = this.add.graphics().setDepth(2);
    g.fillStyle(0x0a0614, 1);
    g.lineStyle(1, C_ORANGE, 0.5);
    g.fillRoundedRect(460, 12, 360, 26, 3);
    g.strokeRoundedRect(460, 12, 360, 26, 3);
    this.add.text(640, 25, "T H E   P R E C I S I O N   T R I A L S", { font: "bold 11px Georgia", color: HEX_ORANGE }).setOrigin(0.5).setAlpha(0.7).setDepth(3);
  }

  createParticles() {
    this.ambient = [];
    const colors = [0x3949ab, 0xff9800, 0xb87333];
    for (let i = 0; i < 7; i++) {
      this.ambient.push(this.add.circle(Phaser.Math.Between(0, W), Phaser.Math.Between(150, 630), 1, Phaser.Utils.Array.GetRandom(colors), Phaser.Math.FloatBetween(0.02, 0.04)).setDepth(2));
    }
  }

  updateParticles(time, delta) {
    if (!this.ambient) return;
    const step = 0.006 * (delta / 16.7);
    this.ambient.forEach((p, i) => {
      p.y -= step * (i % 2 === 0 ? 1 : 0.6);
      p.x += Math.sin(time * 0.0003 + i) * 0.02;
      if (p.y < 150) p.y = 630; if (p.y > 630) p.y = 150;
      if (p.x > W) p.x = 0; if (p.x < 0) p.x = W;
    });
  }

  createAnnotation(x, y, text, colorHex) {
    const t = this.add.text(x, y, text, { font: "italic 10px Arial", color: colorHex, wordWrap: { width: 280 }, align: "center" }).setOrigin(0.5).setDepth(70).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 200 });
    this.time.delayedCall(2200, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() }); });
    return t;
  }

  createFloatingText(x, y, text, colorHex, font = "bold 13px Arial", hold = 1400) {
    const t = this.add.text(x, y, text, { font, color: colorHex, wordWrap: { width: 320 }, align: "center" }).setOrigin(0.5).setDepth(31).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 180 });
    this.time.delayedCall(hold, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() }); });
    return t;
  }

  createConfetti(x, y, count = 30) {
    const p = this.add.particles(x, y, "l75_dot", {
      speed: { min: 80, max: 240 }, angle: { min: 0, max: 360 }, scale: { start: 0.9, end: 0 }, lifespan: 500,
      tint: [C_ORANGE, C_GOLD, C_INDIGO, 0xffffff], emitting: false,
    }).setDepth(75);
    p.explode(count);
    this.time.delayedCall(900, () => p.destroy());
  }

  screenShake(intensity = 0.004, duration = 150) {
    this.cameras.main.shake(duration, intensity);
  }

  // ══════════════════════════════════════════════════════════════
  // THE PRECISION CARD
  // ══════════════════════════════════════════════════════════════

  createPrecisionCard() {
    const g = this.add.graphics().setDepth(20);
    g.fillStyle(0xe0d6c8, 1);
    g.lineStyle(2, 0x8a6435, 1);
    g.fillRoundedRect(CARD_X0, CARD_Y0, CARD_X1 - CARD_X0, CARD_Y1 - CARD_Y0, 4);
    g.strokeRoundedRect(CARD_X0, CARD_Y0, CARD_X1 - CARD_X0, CARD_Y1 - CARD_Y0, 4);
    g.fillStyle(0x8a6435, 0.15);
    g.fillRect(CARD_X0, CARD_Y0, CARD_X1 - CARD_X0, 24);
    g.lineStyle(1, 0x8a6435, 0.15);
    for (let y = CARD_Y0 + 48; y < CARD_Y1 - 44; y += 20) g.lineBetween(CARD_X0 + 16, y, CARD_X1 - 16, y);

    this.cardHeaderText = this.add.text(CARD_CX, CARD_Y0 + 12, "", { font: "bold 8px Georgia", color: "#8a6435" }).setOrigin(0.5).setDepth(21);
    this.cardRoundLabel = this.add.text(CARD_X1 - 14, CARD_Y0 + 12, "SAMPLE 1/15", { font: "bold 9px Courier New", color: "#8a6435" }).setOrigin(1, 0.5).setDepth(21);
    this.cardContentContainer = this.add.container(0, 0).setDepth(21);
    this.cardQuestionText = this.add.text(CARD_CX, CARD_Y1 - 26, "", { font: "bold 12px Georgia", color: "#241a0e", wordWrap: { width: CARD_X1 - CARD_X0 - 40 }, align: "center" }).setOrigin(0.5).setDepth(21);
    this.cardStampLayer = this.add.container(CARD_CX, (CARD_Y0 + CARD_Y1) / 2).setDepth(35);
  }

  clearCardContent() {
    this.cardContentContainer.removeAll(true);
    this.cardQuestionText.setText("");
    this.cardStampLayer.removeAll(true);
  }

  showTrialOnCard(lines, questionText) {
    this.clearCardContent();
    this.cardHeaderText.setText(`PRECISION TRIAL — SAMPLE ${this.currentRound + 1}`);
    const maxLen = Math.max(...lines.map((l) => l.length));
    const fontSize = maxLen > 40 ? 10 : maxLen > 28 ? 12 : 14;
    const lineH = fontSize + 10;
    const startY = CARD_Y0 + 56 + Math.max(0, 4 - lines.length) * (lineH / 2);
    lines.forEach((line, i) => {
      const y = startY + i * lineH;
      if (line.trim().startsWith("//")) {
        const t = this.add.text(CARD_CX, y, line, { font: `italic ${fontSize}px Courier New`, color: "#8a6435" }).setOrigin(0.5).setAlpha(0);
        this.cardContentContainer.add(t);
        this.tweens.add({ targets: t, alpha: 1, duration: 180 });
        return;
      }
      const tokens = this._codeTokenize(line);
      const measured = tokens.map((tk) => { const tmp = this.add.text(0, 0, tk.t, { font: `bold ${fontSize}px Courier New` }); const w = tmp.width; tmp.destroy(); return w; });
      const totalW = measured.reduce((a, b) => a + b, 0);
      let x = CARD_CX - totalW / 2;
      tokens.forEach((tok, ti) => {
        const t = this.add.text(x, y, tok.t, { font: `bold ${fontSize}px Courier New`, color: tok.c }).setOrigin(0, 0.5).setAlpha(0);
        this.cardContentContainer.add(t);
        this.tweens.add({ targets: t, alpha: 1, duration: 180 });
        x += measured[ti];
      });
    });
    if (questionText) this.cardQuestionText.setText(questionText);
    this.cardRoundLabel.setText(`SAMPLE ${this.currentRound + 1}/15`);
  }

  _codeTokenize(line) {
    const tokens = [];
    const re = /("(?:[^"\\]|\\.)*")|(\bint\b|\bdouble\b|\bString\b|\bif\b|\belse\b)|(\bInteger\b|\bDouble\b)|(\.parseInt\b|\.parseDouble\b|\.println\b)|(\bSystem\.out\b)|(-?\d+\.?\d*(?:[eE][+-]?\d+)?)|(==|[(){}\[\];.,=+*/])/g;
    let last = 0, m;
    const plain = (t) => t && tokens.push({ t, c: "#241a0e" });
    while ((m = re.exec(line))) {
      if (m.index > last) plain(line.slice(last, m.index));
      if (m[1]) tokens.push({ t: m[1], c: "#2e7d32" });
      else if (m[2]) tokens.push({ t: m[2], c: "#1565c0" });
      else if (m[3]) tokens.push({ t: m[3], c: "#b8860b" });
      else if (m[4]) tokens.push({ t: m[4], c: "#e65100" });
      else if (m[5]) tokens.push({ t: m[5], c: "#78909c" });
      else if (m[6]) tokens.push({ t: m[6], c: "#00695c" });
      else if (m[7]) tokens.push({ t: m[7], c: /[()]/.test(m[7]) ? "#c62828" : "#78909c" });
      last = m.index + m[0].length;
    }
    if (last < line.length) plain(line.slice(last));
    return tokens.length ? tokens : [{ t: line, c: "#241a0e" }];
  }

  async stampCard(kind) {
    const labels = { certified: "CALIBRATED", misjudged: "MISCALIBRATED", void: "TRIAL VOID" };
    const colors = { certified: HEX_GREEN_BRIGHT, misjudged: HEX_RED, void: HEX_RED };
    const stamp = this.add.text(0, 0, labels[kind], { font: "bold 20px Georgia", color: colors[kind] }).setOrigin(0.5).setScale(1.4).setAngle(-8).setAlpha(0);
    this.cardStampLayer.add(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 180 });
    const hold = kind === "void" ? 1800 : 700;
    await this.delay(hold);
    if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 200, onComplete: () => stamp.destroy() });
  }

  // ══════════════════════════════════════════════════════════════
  // THE TITRATION BURETTE (THE TIMER — hero mechanic): a linear tween
  // drains the burette (liquid top surface descends toward the
  // stopcock) while the receiving flask fills correspondingly, exactly
  // like L69's sand column / L72's pressure gauge, re-skinned as lab
  // glassware with a discrete drop-stream on top of the continuous
  // progress drive.
  // ══════════════════════════════════════════════════════════════

  createTitrationBurette() {
    const g = this.add.graphics().setDepth(10);
    g.lineStyle(2, C_ORANGE, 0.6);
    g.strokeRect(BUR_X, BUR_Y0, BUR_W, BUR_Y1 - BUR_Y0);
    for (let i = 0; i <= 10; i++) {
      const y = BUR_Y0 + (i / 10) * (BUR_Y1 - BUR_Y0);
      g.lineStyle(1, C_ORANGE, 0.4);
      g.lineBetween(BUR_X + BUR_W, y, BUR_X + BUR_W + 6, y);
    }
    g.lineStyle(2, C_COPPER, 0.7);
    g.lineBetween(CLAMP_X, BUR_Y0 - 10, CLAMP_X, BUR_Y1 + 20);
    g.lineBetween(CLAMP_X, (BUR_Y0 + BUR_Y1) / 2, BUR_X, (BUR_Y0 + BUR_Y1) / 2);

    this.buretteLiquidGfx = this.add.graphics().setDepth(9);
    this.stopcockHandle = this.add.rectangle(BUR_X + BUR_W / 2, STOPCOCK_Y, 16, 3, C_COPPER, 1).setDepth(12);
    this.dropLayer = this.add.container(0, 0).setDepth(11);
    this._drops = [];

    const fg = this.add.graphics().setDepth(10);
    fg.lineStyle(2, C_ORANGE, 0.6);
    fg.beginPath();
    fg.moveTo(FLASK_X - FLASK_W / 2, FLASK_Y0);
    fg.lineTo(FLASK_X - 8, FLASK_Y0 + 22);
    fg.lineTo(FLASK_X - FLASK_W / 2 + 6, FLASK_Y1);
    fg.lineTo(FLASK_X + FLASK_W / 2 - 6, FLASK_Y1);
    fg.lineTo(FLASK_X + 8, FLASK_Y0 + 22);
    fg.lineTo(FLASK_X + FLASK_W / 2, FLASK_Y0);
    fg.strokePath();
    this.flaskLiquidGfx = this.add.graphics().setDepth(9);
    this.endpointLine = this.add.rectangle(FLASK_X, FLASK_Y0 + (FLASK_Y1 - FLASK_Y0) * 0.15, FLASK_W - 16, 2, C_RED, 0.5).setDepth(11);
    this.endpointLabel = this.add.text(FLASK_X + FLASK_W / 2 + 2, FLASK_Y0 + (FLASK_Y1 - FLASK_Y0) * 0.15, "EP", { font: "bold 6px Georgia", color: HEX_RED }).setOrigin(0, 0.5).setDepth(11).setAlpha(0.6);

    this._titrationProgress = 0;
    this._titrationUrgency = "safe";
    this._lastDropSpawn = 0;
  }

  _lerpColor75(c1, c2, t) {
    const r1 = (c1 >> 16) & 0xff, g1 = (c1 >> 8) & 0xff, b1 = c1 & 0xff;
    const r2 = (c2 >> 16) & 0xff, g2 = (c2 >> 8) & 0xff, b2 = c2 & 0xff;
    const r = Math.round(r1 + (r2 - r1) * t), g = Math.round(g1 + (g2 - g1) * t), b = Math.round(b1 + (b2 - b1) * t);
    return (r << 16) | (g << 8) | b;
  }

  updateTitrationDrain(time) {
    if (!this.buretteLiquidGfx) return;
    const progress = this._titrationProgress || 0;
    const liquidTopY = Phaser.Math.Linear(BUR_Y0, BUR_Y1, progress);
    this.buretteLiquidGfx.clear();
    if (progress < 1) {
      this.buretteLiquidGfx.fillStyle(C_ORANGE, 0.5);
      this.buretteLiquidGfx.fillRect(BUR_X + 2, liquidTopY, BUR_W - 4, BUR_Y1 - liquidTopY);
    }

    const flaskColor = this._lerpColor75(0xe8eaf6, C_ORANGE, Math.min(progress * 1.1, 1));
    const flaskAlpha = 0.06 + progress * 0.34;
    const innerY0 = FLASK_Y0 + 22, innerY1 = FLASK_Y1 - 4;
    const fillH = progress * (innerY1 - innerY0);
    this.flaskLiquidGfx.clear();
    if (fillH > 0) {
      const topY = innerY1 - fillH;
      const wAtTop = (FLASK_W - 12) * Math.min(1, 0.5 + (fillH / (innerY1 - innerY0)) * 0.5);
      this.flaskLiquidGfx.fillStyle(flaskColor, flaskAlpha);
      this.flaskLiquidGfx.fillPoints([
        FLASK_X - wAtTop / 2, topY, FLASK_X + wAtTop / 2, topY,
        FLASK_X + FLASK_W / 2 - 6, innerY1, FLASK_X - FLASK_W / 2 + 6, innerY1,
      ], true);
    }
  }

  updateTitrationUrgency(time) {
    if (this._titrationProgress === undefined) return;
    const rem = 1 - this._titrationProgress;
    const state = rem <= 0.15 ? "critical" : rem <= 0.33 ? "warning" : "safe";
    if (state === this._titrationUrgency) return;
    this._titrationUrgency = state;
    if (state === "critical") this._startEndpointPulse(); else this._stopEndpointPulse();
  }

  _startEndpointPulse() {
    if (this._epTween) return;
    this.endpointLabel.setAlpha(0.9);
    this._epTween = this.tweens.add({ targets: [this.endpointLabel, this.endpointLine], alpha: 0.2, duration: 300, yoyo: true, repeat: -1 });
  }

  _stopEndpointPulse() {
    if (this._epTween) { this._epTween.stop(); this._epTween = null; }
    this.endpointLabel.setAlpha(0.6);
    this.endpointLine.setAlpha(0.5);
  }

  updateDropStream(time) {
    if (this._titrationHalted || this._titrationProgress >= 1) return;
    const interval = this._titrationUrgency === "critical" ? 90 : this._titrationUrgency === "warning" ? 180 : 320;
    if (time - this._lastDropSpawn < interval) return;
    this._lastDropSpawn = time;
    this.spawnDrop();
  }

  spawnDrop() {
    const drop = this.add.circle(BUR_X + BUR_W / 2, STOPCOCK_Y + 4, 1.5, C_ORANGE, 0.8).setDepth(11);
    this.dropLayer.add(drop);
    const targetY = FLASK_Y0 + 10;
    this.tweens.add({
      targets: drop, y: targetY, duration: 260, ease: "Quad.easeIn",
      onComplete: () => {
        if (!drop.active) return;
        for (let i = 0; i < 2; i++) {
          const splash = this.add.circle(drop.x + Phaser.Math.Between(-4, 4), targetY, 1, C_ORANGE, 0.6).setDepth(11);
          this.dropLayer.add(splash);
          this.tweens.add({ targets: splash, alpha: 0, y: splash.y - 4, duration: 150, onComplete: () => splash.destroy() });
        }
        drop.destroy();
      },
    });
  }

  startTitration(timeLimitMs) {
    this._killTitrationTween();
    this.roundTimeLimit = timeLimitMs;
    this._titrationProgress = 0;
    this._titrationHalted = false;
    this._titrationUrgency = "safe";
    this._stopEndpointPulse();
    this.stopcockHandle.setAngle(0);
    const state = { v: 0 };
    this._titrationTween = this.tweens.add({
      targets: state, v: 1, duration: timeLimitMs, ease: "Linear",
      onUpdate: () => { this._titrationProgress = state.v; },
      onComplete: () => { if (this._alive && !this._titrationHalted) this.onTitrationTimeout(this._currentConfig); },
    });
  }

  _killTitrationTween() {
    if (this._titrationTween) { this._titrationTween.stop(); this._titrationTween = null; }
    this._stopEndpointPulse();
  }

  async closeStopcock() {
    this._titrationHalted = true;
    this._killTitrationTween();
    await new Promise((res) => { this.tweens.add({ targets: this.stopcockHandle, angle: 90, duration: 120, ease: "Back.easeOut", onComplete: res }); });
  }

  async reachEndpoint() {
    for (let i = 0; i < 6; i++) {
      if (!this._alive) return;
      this.spawnDrop();
      await this.delay(35);
    }
    this.flaskLiquidGfx.clear();
    this.flaskLiquidGfx.fillStyle(C_RED, 0.5);
    const innerY0 = FLASK_Y0 + 22, innerY1 = FLASK_Y1 - 4;
    this.flaskLiquidGfx.fillPoints([
      FLASK_X - (FLASK_W - 12) / 2, innerY0, FLASK_X + (FLASK_W - 12) / 2, innerY0,
      FLASK_X + FLASK_W / 2 - 6, innerY1, FLASK_X - FLASK_W / 2 + 6, innerY1,
    ], true);
    const stamp = this.add.text(FLASK_X, FLASK_Y1 + 14, "ENDPOINT", { font: "bold 8px Courier New", color: HEX_RED }).setOrigin(0.5).setDepth(12).setAlpha(0);
    this.roundElements.push(stamp);
    this.tweens.add({ targets: stamp, alpha: 1, duration: 150 });
    await this.delay(150);
  }

  async _refillBurette() {
    const state = { v: this._titrationProgress || 0 };
    await new Promise((res) => {
      this.tweens.add({ targets: state, v: 0, duration: 450, ease: "Sine.easeInOut", onUpdate: () => { this._titrationProgress = state.v; }, onComplete: res });
    });
    this.stopcockHandle.setAngle(0);
    this.flaskLiquidGfx.clear();
  }

  // ══════════════════════════════════════════════════════════════
  // MINI DUAL APPARATUS — compact Integer Furnace (left) + Decimal
  // Crucible (right), side by side. Every discrimination round shows
  // BOTH: the one that actually runs glows; the other stays dim.
  // ══════════════════════════════════════════════════════════════

  createMiniDualApparatus() {
    const drawFrame = (x0, x1, label, colorHex) => {
      const g = this.add.graphics().setDepth(10);
      g.lineStyle(1.5, colorHex, 0.5);
      g.strokeRoundedRect(x0, MINI_Y0, x1 - x0, MINI_Y1 - MINI_Y0, 4);
      const t = this.add.text((x0 + x1) / 2, MINI_Y0 - 10, label, { font: "bold 7px Georgia", color: colorHex === C_COPPER ? HEX_COPPER : HEX_ORANGE }).setOrigin(0.5).setDepth(11).setAlpha(0.5);
      return { g, t };
    };
    this._mfFrame = drawFrame(MF_X0, MF_X1, "INTEGER FURNACE", C_COPPER);
    this._mcFrame = drawFrame(MC_X0, MC_X1, "DECIMAL CRUCIBLE", C_ORANGE);

    this.mfDynamicLayer = this.add.container(0, 0).setDepth(20);
    this.mcDynamicLayer = this.add.container(0, 0).setDepth(20);

    const mfCx = (MF_X0 + MF_X1) / 2, mcCx = (MC_X0 + MC_X1) / 2;
    this._mfGate = this.add.rectangle(mfCx, MINI_Y0 + 60, MF_X1 - MF_X0 - 30, 3, C_RED, 0).setDepth(14);
    this._mcGate = this.add.rectangle(mcCx, MINI_Y0 + 60, MC_X1 - MC_X0 - 30, 3, C_RED, 0).setDepth(14);

    this._mfContText = this.add.text(mfCx, MINI_Y1 - 14, "int —", { font: "bold 9px Courier New", color: HEX_GRAY }).setOrigin(0.5).setDepth(12);
    this._mcContText = this.add.text(mcCx, MINI_Y1 - 14, "double —", { font: "bold 9px Courier New", color: HEX_GRAY }).setOrigin(0.5).setDepth(12);
  }

  clearMiniApparatus() {
    this.mfDynamicLayer.removeAll(true);
    this.mcDynamicLayer.removeAll(true);
    this._mfGate.setAlpha(0);
    this._mcGate.setAlpha(0);
    this._mfContText.setText("int —").setColor(HEX_GRAY);
    this._mcContText.setText("double —").setColor(HEX_GRAY);
    this.dimMiniInstrument("furnace");
    this.dimMiniInstrument("crucible");
  }

  activateMiniInstrument(which) {
    const frame = which === "furnace" ? this._mfFrame : this._mcFrame;
    this.tweens.add({ targets: [frame.g, frame.t], alpha: 1, duration: 200 });
  }

  dimMiniInstrument(which) {
    const frame = which === "furnace" ? this._mfFrame : this._mcFrame;
    this.tweens.add({ targets: [frame.g, frame.t], alpha: 0.3, duration: 200 });
  }

  _miniStrip(layer, cx, value) {
    const strip = this.add.container(cx, MINI_Y0 + 14).setAlpha(0);
    const bg = this.add.graphics();
    const w = Math.max(30, value.length * 6 + 8), h = 12;
    bg.fillStyle(0xe0d6c8, 1);
    bg.lineStyle(1, 0x8a6435, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 2);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 2);
    const txt = this.add.text(0, 0, value, { font: "bold 7px Courier New", color: "#241a0e" }).setOrigin(0.5);
    if (txt.width > w - 4) txt.setFontSize(5);
    strip.add([bg, txt]);
    layer.add(strip);
    this.tweens.add({ targets: strip, alpha: 1, duration: 100 });
    return strip;
  }

  /** Runs the honest mini-furnace attempt: digits/leading-sign GREEN,
   * anything else (crucially including a dot) RED — no amber here,
   * the furnace has no special case for decimal points. */
  async runMiniFurnaceConversion(strValue) {
    this.activateMiniInstrument("furnace");
    const cx = (MF_X0 + MF_X1) / 2;
    const strip = this._miniStrip(this.mfDynamicLayer, cx, strValue);
    await this.delay(120);
    await new Promise((res) => { this.tweens.add({ targets: strip, y: MINI_Y0 + 60, duration: 140, onComplete: res }); });

    const valid = /^-?[0-9]+$/.test(strValue);
    let invalidIndex = -1;
    if (!valid) {
      for (let i = 0; i < strValue.length; i++) {
        const ch = strValue[i];
        if (/[0-9]/.test(ch) || (ch === "-" && i === 0)) continue;
        invalidIndex = i; break;
      }
      if (invalidIndex === -1) invalidIndex = strValue.length - 1;
    }
    const showCount = valid ? strValue.length : invalidIndex + 1;
    const startX = strip.x - (strip.list[0].width || 30) / 2 + 6;
    for (let i = 0; i < showCount; i++) {
      if (!this._alive) return { ok: true };
      const isLast = i === showCount - 1;
      const isValidChar = valid || !isLast;
      const spot = this.add.circle(startX + i * 8, MINI_Y0 + 60, 3, isValidChar ? C_GREEN_BRIGHT : C_RED, 0.5).setDepth(21);
      this.mfDynamicLayer.add(spot);
      this.tweens.add({ targets: spot, alpha: 0, duration: 200, delay: 90 });
      await this.delay(80);
    }

    if (!valid) {
      this._mfGate.setFillStyle(C_RED, 0.9).setAlpha(1);
      this.screenShake(0.004, 150);
      this.tweens.add({ targets: strip, alpha: 0, y: strip.y - 20, duration: 150, onComplete: () => strip.destroy() });
      await this.delay(200);
      const nfe = this.add.text(cx, MINI_Y0 + 110, "NFE", { font: "bold 10px Courier New", color: HEX_RED }).setOrigin(0.5).setDepth(22).setAlpha(0);
      this.mfDynamicLayer.add(nfe);
      this.tweens.add({ targets: nfe, alpha: 1, duration: 120 });
      await this.delay(500);
      this._mfContText.setText("✗").setColor(HEX_RED);
      return { ok: false, crash: "nfe" };
    }

    const value = parseInt(strValue, 10);
    await new Promise((res) => { this.tweens.add({ targets: strip, y: MINI_Y0 + 95, duration: 130, onComplete: res }); });
    strip.destroy();
    const bar = this.add.container(cx, MINI_Y0 + 95).setAlpha(0).setScale(0.6);
    const bg = this.add.graphics();
    const w = Math.max(30, String(value).length * 7 + 8), h = 16;
    bg.fillStyle(C_COPPER, 1);
    bg.lineStyle(1, 0x8a6435, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 3);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 3);
    const txt = this.add.text(0, 0, String(value), { font: "bold 8px Courier New", color: "#241a0e" }).setOrigin(0.5);
    bar.add([bg, txt]);
    this.mfDynamicLayer.add(bar);
    this.tweens.add({ targets: bar, alpha: 1, scale: 1, duration: 120, ease: "Back.easeOut" });
    await this.delay(140);
    this.tweens.add({ targets: bar, y: MINI_Y1 - 14, alpha: 0, duration: 160, onComplete: () => bar.destroy() });
    this._mfContText.setText(`int ${value}`).setColor(HEX_GOLD);
    await this.delay(120);
    return { ok: true, value, type: "int" };
  }

  /** Runs the honest mini-crucible attempt: digits/sign GREEN, ONE dot
   * AMBER, anything else (including a second dot) RED. */
  async runMiniCrucibleConversion(strValue) {
    this.activateMiniInstrument("crucible");
    const cx = (MC_X0 + MC_X1) / 2;
    const trimmed = strValue.trim();
    const strip = this._miniStrip(this.mcDynamicLayer, cx, strValue);
    await this.delay(120);
    await new Promise((res) => { this.tweens.add({ targets: strip, y: MINI_Y0 + 60, duration: 140, onComplete: res }); });

    const isSpecial = trimmed === "NaN" || trimmed === "Infinity" || trimmed === "-Infinity";
    const valid = isSpecial || (trimmed.length > 0 && /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(trimmed));
    let dotSeen = false, invalidIndex = -1;
    const kinds = [];
    if (!isSpecial) {
      for (let i = 0; i < strValue.length; i++) {
        const ch = strValue[i];
        let kind;
        if (/[0-9]/.test(ch)) kind = "green";
        else if ((ch === "+" || ch === "-") && i === 0) kind = "green";
        else if (ch === " ") kind = "green";
        else if (ch === "." && !dotSeen) { dotSeen = true; kind = "amber"; }
        else if (/[eE]/.test(ch)) kind = "green";
        else kind = "red";
        kinds.push(kind);
        if (!valid && kind === "red" && invalidIndex === -1) invalidIndex = i;
      }
      if (!valid && invalidIndex === -1) invalidIndex = strValue.length - 1;
    }
    const showCount = isSpecial ? strValue.length : (valid ? strValue.length : invalidIndex + 1);
    const startX = strip.x - (strip.list[0].width || 30) / 2 + 6;
    for (let i = 0; i < showCount; i++) {
      if (!this._alive) return { ok: true };
      const kind = isSpecial ? "green" : (!valid && i === invalidIndex ? "red" : kinds[i]);
      const color = kind === "green" ? C_GREEN_BRIGHT : kind === "amber" ? C_AMBER : C_RED;
      const spot = this.add.circle(startX + i * 8, MINI_Y0 + 60, 3, color, 0.5).setDepth(21);
      this.mcDynamicLayer.add(spot);
      this.tweens.add({ targets: spot, alpha: 0, duration: 200, delay: 90 });
      await this.delay(80);
      if (kind === "red") break;
    }

    if (!valid) {
      this._mcGate.setFillStyle(C_RED, 0.9).setAlpha(1);
      this.screenShake(0.004, 150);
      this.tweens.add({ targets: strip, alpha: 0, y: strip.y - 20, duration: 150, onComplete: () => strip.destroy() });
      await this.delay(200);
      const nfe = this.add.text(cx, MINI_Y0 + 110, "NFE", { font: "bold 10px Courier New", color: HEX_RED }).setOrigin(0.5).setDepth(22).setAlpha(0);
      this.mcDynamicLayer.add(nfe);
      this.tweens.add({ targets: nfe, alpha: 1, duration: 120 });
      await this.delay(500);
      this._mcContText.setText("✗").setColor(HEX_RED);
      return { ok: false, crash: "nfe" };
    }

    const value = trimmed === "NaN" ? NaN : trimmed === "Infinity" ? Infinity : trimmed === "-Infinity" ? -Infinity : parseFloat(trimmed);
    await new Promise((res) => { this.tweens.add({ targets: strip, y: MINI_Y0 + 95, alpha: 0, duration: 200, onComplete: res }); });
    strip.destroy();
    const display = Number.isFinite(value) ? (Number.isInteger(value) ? `${value}.0` : String(value)) : String(value);
    const liquid = this.add.rectangle(cx, MINI_Y0 + 95, 40, 16, C_AMBER, 0.5).setDepth(21).setScale(0, 1);
    this.mcDynamicLayer.add(liquid);
    this.tweens.add({ targets: liquid, scaleX: 1, duration: 150 });
    const valText = this.add.text(cx, MINI_Y0 + 95, display, { font: "bold 7px Courier New", color: "#241a0e" }).setOrigin(0.5).setDepth(22).setAlpha(0);
    this.mcDynamicLayer.add(valText);
    this.tweens.add({ targets: valText, alpha: 1, duration: 150 });
    await this.delay(200);
    this.tweens.add({ targets: [liquid, valText], y: "+=" + (MINI_Y1 - 14 - (MINI_Y0 + 95)), alpha: 0, duration: 180 });
    await this.delay(150);
    this._mcContText.setText(`double ${display}`).setColor(HEX_ORANGE);
    await this.delay(100);
    return { ok: true, value, type: "double" };
  }

  /** Round 15's signature: the crucible dissolves cleanly but the
   * liquid tries to pour into an INT container (a solid block) and
   * BOUNCES off — the compile error made physically dramatic. */
  async runMiniCrucibleTypeMismatch(strValue) {
    const outcome = await this.runMiniCrucibleConversion(strValue);
    if (!outcome.ok) return outcome;
    const cx = (MC_X0 + MC_X1) / 2;
    const block = this.add.rectangle(cx, MINI_Y1 - 14, 34, 14, C_COPPER, 0.9).setDepth(21);
    this.mcDynamicLayer.add(block);
    const drop = this.add.circle(cx, MINI_Y0 + 105, 5, C_AMBER, 0.7).setDepth(22);
    this.mcDynamicLayer.add(drop);
    await new Promise((res) => { this.tweens.add({ targets: drop, y: MINI_Y1 - 20, duration: 160, onComplete: res }); });
    this.tweens.add({ targets: drop, y: MINI_Y0 + 130, alpha: 0, duration: 200 });
    this.screenShake(0.004, 120);
    this.showCompileErrorStamp();
    this._mcContText.setText("✗ TYPE").setColor(HEX_RED);
    await this.delay(400);
    return { ok: false, crash: "compile" };
  }

  updateFurnaceGlow() {}

  // ══════════════════════════════════════════════════════════════
  // TRIAL SLATE
  // ══════════════════════════════════════════════════════════════

  createTrialSlate() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0a0d18, 1);
    g.lineStyle(2, C_ORANGE, 1);
    g.fillRoundedRect(SLATE_X, SLATE_Y, SLATE_W, SLATE_H, 8);
    g.strokeRoundedRect(SLATE_X, SLATE_Y, SLATE_W, SLATE_H, 8);
    this.add.text(SLATE_X + 10, SLATE_Y + 8, "TRIAL SLATE", { font: "bold 8px Georgia", color: HEX_ORANGE }).setDepth(11);
    this.slateLines = this.add.container(0, 0).setDepth(11);
    this._slateY = SLATE_Y + 26;
    this.add.text(SLATE_X + 10, SLATE_Y + SLATE_H - 16, "returns:", { font: "9px Georgia", color: "#8a6435" }).setDepth(11);
    this.resultText = this.add.text(SLATE_X + 56, SLATE_Y + SLATE_H - 16, "—", { font: "bold 10px Courier New", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(11);
  }

  async chalkWriteLine(text, color) {
    const t = this.add.text(SLATE_X + 10, this._slateY, "", { font: "bold 9px Courier New", color: color || "#e8eaf6" }).setDepth(11);
    this.slateLines.add(t);
    for (let i = 0; i < text.length; i++) {
      if (!this._alive) return;
      t.setText(t.text + text[i]);
      if (t.width > SLATE_W - 18) t.setFontSize(7.5);
      await this.delay(5);
    }
    this._slateY += 15;
    if (this._slateY > SLATE_Y + SLATE_H - 30) this._slateY = SLATE_Y + 26;
  }

  wipeSlate() {
    this.slateLines.removeAll(true);
    this._slateY = SLATE_Y + 26;
  }

  updateResultRow(type) {
    if (type === null || type === undefined) { this.resultText.setText("—").setColor(HEX_GRAY); return; }
    if (type === "crash") { this.resultText.setText("✗ ERROR").setColor(HEX_RED); return; }
    this.resultText.setText(type).setColor(type === "double" ? HEX_ORANGE : type === "String" ? HEX_CYAN : HEX_GOLD);
  }

  // ══════════════════════════════════════════════════════════════
  // CONTAINER SHELF — simple typed-variable readout
  // ══════════════════════════════════════════════════════════════

  createContainerShelf() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0f0a06, 1);
    g.lineStyle(1, 0x3a2618, 1);
    g.fillRoundedRect(SHELF_X, SHELF_Y, SHELF_W, SHELF_H, 8);
    g.strokeRoundedRect(SHELF_X, SHELF_Y, SHELF_W, SHELF_H, 8);
    this.add.text(SHELF_X + 10, SHELF_Y + 6, "VARIABLES", { font: "bold 8px Georgia", color: HEX_ORANGE }).setDepth(11);
    this.shelfContainer = this.add.container(0, 0).setDepth(11);
  }

  clearContainerShelf() { this.shelfContainer.removeAll(true); }

  updateContainerShelf(vars) {
    this.shelfContainer.removeAll(true);
    let idx = 0;
    for (const name in vars) {
      const v = vars[name];
      const y = SHELF_Y + 20 + idx * 13;
      const display = v.type === "String" ? `"${v.value}"` : String(v.value);
      const text = `${v.type} ${name}=${display}`.slice(0, 36);
      const t = this.add.text(SHELF_X + 10, y, text, { font: "bold 7.5px Courier New", color: v.type === "String" ? HEX_CYAN : v.type === "double" ? HEX_ORANGE : HEX_GOLD }).setOrigin(0, 0.5);
      this.shelfContainer.add(t);
      idx++;
      if (idx >= 4) break;
    }
  }

  // ══════════════════════════════════════════════════════════════
  // HUD
  // ══════════════════════════════════════════════════════════════

  createHUD() {
    const g = this.add.graphics().setDepth(49);
    g.fillStyle(0x0a0614, 0.93);
    g.fillRect(0, 0, W, 64);
    g.lineStyle(1, 0x3a2618, 1);
    g.lineBetween(0, 64, W, 64);

    this.add.text(20, 14, "THE PRECISION TRIALS", { font: "bold 14px Georgia", color: "#b0bec5" }).setDepth(50);
    this.add.text(20, 32, "Tuning Phase — Type Conversion: parseDouble()", { font: "10px Arial", color: "#546e7a" }).setDepth(50);

    this.waveText = this.add.text(640, 18, "WAVE 1 / 3", { font: "bold 14px Georgia", color: HEX_GOLD }).setOrigin(0.5).setDepth(50);
    this._waveSquares = [];
    for (let i = 0; i < 5; i++) {
      const sq = this.add.rectangle(640 - 44 + i * 22, 42, 10, 10, 0x2a2f36).setDepth(50).setStrokeStyle(1, 0x546e7a);
      this._waveSquares.push(sq);
    }

    this.add.text(1060, 8, "SCORE", { font: "9px Arial", color: "#546e7a" }).setDepth(50);
    this.scoreText = this.add.text(1060, 20, "0", { font: "bold 18px Arial", color: "#ffffff" }).setDepth(50);
    this.comboText = this.add.text(1060, 42, "×1", { font: "bold 12px Arial", color: HEX_GOLD }).setDepth(50);

    this.lifeIcons = [];
    for (let i = 0; i < 3; i++) {
      const lg = this.add.graphics({ x: 1150 + i * 26, y: 24 }).setDepth(50);
      lg.lineStyle(1.5, C_ORANGE, 1);
      lg.strokeRect(-4, -7, 8, 14);
      lg.fillStyle(C_ORANGE, 0.7);
      lg.fillRect(-4, -1, 8, 7);
      this.lifeIcons.push(lg);
    }
  }

  updateWaveIndicator(roundInWave, correct) {
    const sq = this._waveSquares[roundInWave];
    if (sq) sq.setFillStyle(correct ? C_GREEN_BRIGHT : C_RED);
  }

  resetWaveIndicator() { this._waveSquares.forEach((sq) => sq.setFillStyle(0x2a2f36)); }

  _roundInWave() {
    if (this.currentWave === 1) return this.currentRound;
    if (this.currentWave === 2) return this.currentRound - 5;
    return this.currentRound - 10;
  }

  // ══════════════════════════════════════════════════════════════
  // BIT — CALIBRATION OFFICER VARIANT (lab coat, precision dropper)
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
    const frock = this.add.graphics();
    frock.fillStyle(0x120c22, 0.9);
    frock.lineStyle(1, C_COPPER, 0.7);
    frock.fillTriangle(-17, -12, 17, -12, 0, 22);
    const coat = this.add.graphics();
    coat.fillStyle(0xe8eaf6, 0.12);
    coat.lineStyle(1, 0xe8eaf6, 0.3);
    coat.fillTriangle(-15, -10, 15, -10, 0, 19);
    const lenses = this.add.container(0, -26);
    const lensG = this.add.graphics();
    lensG.lineStyle(1.2, C_ORANGE, 0.7);
    lensG.strokeCircle(-6, 0, 5);
    lensG.strokeCircle(6, 0, 5);
    lensG.lineBetween(-1, 0, 1, 0);
    lensG.fillStyle(C_ORANGE, 0.15);
    lensG.fillCircle(-6, 0, 4.5);
    lensG.fillCircle(6, 0, 4.5);
    lenses.add(lensG);
    const gloveL = this.add.circle(-16, 10, 4, 0xffffff, 0).setStrokeStyle(1, 0xe8eaf6, 0.7);
    this.dropper = this.add.container(17, 6);
    const dropG = this.add.graphics();
    dropG.lineStyle(1.3, C_ORANGE, 0.9);
    dropG.lineBetween(0, 8, 3, -10);
    dropG.fillStyle(C_ORANGE, 0.6);
    dropG.fillCircle(3, -12, 3);
    this.dropper.add(dropG);
    c.add([g, frock, coat, eye, pupil, lenses, gloveL, this.dropper, tip]);
    this.tweens.add({ targets: tip, alpha: 0.3, duration: 850, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: c, y: "+=3", duration: 1650, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
    this.bit = c;
  }

  bitSay(text) {
    this.hideBubble();
    const inner = this.add.text(0, 0, text, { font: "13px Arial", color: "#e0e0e0", wordWrap: { width: 340 } });
    const bw = Math.min(inner.width, 340) + 30, bh = inner.height + 24;
    inner.setText("");
    const bx = Phaser.Math.Clamp(this.bit.x + 40, 20, W - bw - 20);
    const by = Phaser.Math.Clamp(this.bit.y - bh - 20, 80, H - bh - 20);
    const c = this.add.container(bx, by).setDepth(61).setAlpha(0).setScale(0.7);
    const g = this.add.graphics();
    g.fillStyle(0x1a1a2e, 0.97);
    g.fillRoundedRect(0, 0, bw, bh, 10);
    g.lineStyle(1.5, C_ORANGE, 1);
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
        delay: 18, repeat: Math.max(0, text.length - 1),
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

  async showBitFeedback(message) {
    await this.bitSay(message);
    if (!this._alive) return;
    await Promise.race([this.waitForClick(), this.delay(4000)]);
    this.hideBubble();
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
    await this.bitSay("The Precision Trials, Officer — every dissolution verdict timed against the titration. The burette drips; the flask fills. Calibrate before the endpoint. Which parser? Which type? Reflexes tonight.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(5000)]); if (!A()) return;
    this.hideBubble();

    this.showTrialOnCard(['double x = Double.parseDouble("3.14");'], "What is stored in x?");
    this._currentConfig = { revealNote: null };
    this.startTitration(7000);
    await this.runMiniCrucibleConversion("3.14");
    if (!A()) return;
    const a1 = this.createAnnotation(CARD_CX, CARD_Y1 + 14, "the sample", HEX_BLUE_GRAY);
    const a2 = this.createAnnotation(BUR_X + BUR_W / 2, BUR_Y1 + 40, "your time, dripping", HEX_BLUE_GRAY);
    const a3 = this.createAnnotation((MF_X0 + MC_X1) / 2, MINI_Y0 - 24, "both instruments, one verdict", HEX_BLUE_GRAY);
    await this.bitSay("Close the stopcock with a verdict. The first drop is falling!");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();
    [a1, a2, a3].forEach((a) => a.destroy());
    this._killTitrationTween();
    this.clearCardContent();
    this.wipeSlate();
    this.clearMiniApparatus();
    this.clearContainerShelf();
    this._titrationProgress = 0;
    this.updateTitrationDrain(0);

    try { localStorage.setItem(TUTORIAL_KEY, "true"); } catch (_) {}
    this.startWave(1);
  }

  // ══════════════════════════════════════════════════════════════
  // WAVE SYSTEM
  // ══════════════════════════════════════════════════════════════

  async startWave(waveNumber) {
    this.currentWave = waveNumber;
    this.resetWaveIndicator();
    this.waveText.setText(`WAVE ${waveNumber} / 3`);
    const banners = {
      1: "WAVE 1 — RAPID DISSOLUTIONS",
      2: "WAVE 2 — THE DECIMAL EDGE",
      3: "WAVE 3 — DEEP TRACES & BUG HUNT",
    };
    await this.showWaveBanner(banners[waveNumber]);
    if (!this._alive) return;
    if (waveNumber === 2) {
      await this.showBitFeedback("The crucible's boundary at speed now, Specialist. Trailing dots, lone dots, scientific notation, and the strange String that IS a number: 'NaN'. Every trial this wave tests one decimal edge. The titration doesn't wait for certainty.");
    } else if (waveNumber === 3) {
      await this.showBitFeedback("Final titrations — traces where the wrong parser fires and one where the container refused the liquid. Trust the types; the endpoint cares less than the compiler.");
    }
    if (!this._alive) return;

    const startIndex = waveNumber === 1 ? 0 : waveNumber === 2 ? 5 : 10;
    this.startRound(startIndex);
  }

  async showWaveBanner(text) {
    const c = this.add.container(640, -60).setDepth(85);
    const g = this.add.graphics();
    g.fillStyle(0x0a0614, 0.95);
    g.fillRoundedRect(-230, -24, 460, 48, 8);
    g.lineStyle(2, C_GOLD, 1);
    g.strokeRoundedRect(-230, -24, 460, 48, 8);
    const t = this.add.text(0, 0, text, { font: "bold 15px Georgia", color: HEX_GOLD }).setOrigin(0.5);
    if (t.width > 420) t.setFontSize(12);
    c.add([g, t]);
    await new Promise((res) => {
      this.tweens.add({
        targets: c, y: 260, duration: 300, ease: "Back.easeOut",
        onComplete: () => this.time.delayedCall(700, () => {
          this.tweens.add({ targets: c, y: -60, alpha: 0, duration: 250, ease: "Cubic.easeIn", onComplete: () => { c.destroy(); res(); } });
        }),
      });
    });
  }

  // ══════════════════════════════════════════════════════════════
  // ROUND LIFECYCLE
  // ══════════════════════════════════════════════════════════════

  _sourceLines(config) {
    if (Array.isArray(config.source)) return config.source;
    return String(config.source || "").split("\n");
  }

  startRound(index) {
    this.currentRound = index;
    const config = ROUNDS[index];
    this._currentConfig = config;
    this.roundAttempts = 0;
    this.clearRound();
    this.wipeSlate();
    this.clearMiniApparatus();
    this.clearContainerShelf();
    this.updateResultRow(null);
    this.roundStartTime = this.time.now;

    const limit = config.type === "bughunt" ? 12000 : WAVE_TIME[config.wave];
    if (config.type === "predict" || config.type === "trace") this.setupPredict(config);
    else if (config.type === "bughunt") this.setupBugHunt(config);

    this.startTitration(limit);
  }

  clearRound() {
    this.roundElements.forEach((e) => { if (e && e.destroy) e.destroy(); });
    this.roundElements = [];
    this._bugHuntTokenObjs = [];
    if (this._bugHeaderTween) { this._bugHeaderTween.stop(); this._bugHeaderTween = null; }
  }

  async onTitrationTimeout(config) {
    if (this.gameEnded) return;
    this._titrationHalted = true;
    this._stopEndpointPulse();
    this.inputLocked = true;
    this.roundElements.forEach((e) => e.disableInteractive && e.disableInteractive());
    (this._bugHuntTokenObjs || []).forEach((t) => t.disableInteractive());
    this.logAttempt(config, false, null, "timeout", this.roundTimeLimit, 1);
    await this.reachEndpoint();
    if (!this._alive) return;
    await this.stampCard("void");
    if (!this._alive) return;
    if (config.type === "bughunt") await this.runDualFutureReveal(config);
    else await this.runReveal(config);
    if (!this._alive) return;
    if (config.revealNote) this.createFloatingText(CARD_CX, CARD_Y1 + 40, config.revealNote, HEX_GRAY, "10px Arial", 2800);
    this.updateWaveIndicator(this._roundInWave(), false);
    this.loseLife();
    this.updateCombo(false);
    if (this.lives <= 0) { this.time.delayedCall(400, () => this.gameOver()); return; }
    await this.showBitFeedback(MISCONCEPTION_FEEDBACK.timeout);
    if (!this._alive) return;
    this.advanceRound();
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE A/B/C — PREDICT / TRACE
  // ══════════════════════════════════════════════════════════════

  setupPredict(config) {
    const lines = this._sourceLines(config);
    this.showTrialOnCard(lines, config.question);
    this.showOptionBubbles(config.options, config);
  }

  showOptionBubbles(options, config) {
    const shuffled = Phaser.Utils.Array.Shuffle(options.slice());
    const positions = [[365, 568], [605, 568], [365, 624], [605, 624]];
    shuffled.forEach((opt, i) => {
      const [x, y] = positions[i];
      const c = this.add.container(x, y).setDepth(41);
      const g = this.add.graphics();
      const w = 220, h = 44;
      const draw = (stroke) => {
        g.clear();
        g.fillStyle(0x0a0d18, 1);
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
        g.lineStyle(2, stroke, 1);
        g.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);
      };
      draw(C_ORANGE);
      const label = opt.label || opt.value;
      const txt = this.add.text(0, 0, label, { font: "bold 11px Courier New", color: "#e8eaf6", wordWrap: { width: w - 16 }, align: "center" }).setOrigin(0.5);
      if (txt.height > h - 8) txt.setFontSize(9);
      c.add([g, txt]);
      c.setSize(w, h);
      c.setInteractive({ useHandCursor: true });
      c.on("pointerover", () => { if (!this.inputLocked) draw(C_GOLD); });
      c.on("pointerout", () => { if (!this.inputLocked) draw(C_ORANGE); });
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
    await this.closeStopcock();
    const timePctUsed = this.getTimePctUsed();
    const timeMs = Math.round(this.time.now - this.roundStartTime);
    const correct = opt.value === config.correct;
    this.logAttempt(config, correct, opt.value, opt.tag, timeMs, timePctUsed);
    this.roundElements.forEach((e) => e.disableInteractive && e.disableInteractive());

    const g = bubbleContainer.list[0];
    g.clear();
    g.fillStyle(0x0a0d18, 1);
    g.fillRoundedRect(-110, -22, 220, 44, 8);
    g.lineStyle(2, correct ? C_GREEN_BRIGHT : C_RED, 1);
    g.strokeRoundedRect(-110, -22, 220, 44, 8);
    if (!correct) this.tweens.add({ targets: bubbleContainer, x: bubbleContainer.x + 5, duration: 35, yoyo: true, repeat: 4 });

    await this.runReveal(config);
    if (!this._alive) return;
    await this.stampCard(correct ? "certified" : "misjudged");
    if (!this._alive) return;
    if (config.revealNote) this.createFloatingText(CARD_CX, CARD_Y1 + 40, config.revealNote, HEX_GRAY, "10px Arial", 2800);
    await this.delay(300);
    if (!this._alive) return;

    this.updateWaveIndicator(this._roundInWave(), correct);
    if (correct) {
      this.updateScore(this.scoreForAttempt(timePctUsed));
      this.updateCombo(true);
      if (this.roundAttempts === 1) this.correctFirstTry++;
      await this.delay(250);
      this.advanceRound();
    } else {
      this.loseLife();
      this.updateCombo(false);
      if (this.lives <= 0) { this.time.delayedCall(400, () => this.gameOver()); return; }
      await this.showBitFeedback(MISCONCEPTION_FEEDBACK[opt.tag] || "Not quite — trace the slate again.");
      if (!this._alive) return;
      this.advanceRound();
    }
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE D — BUG HUNT
  // ══════════════════════════════════════════════════════════════

  setupBugHunt(config) {
    this.clearCardContent();
    this.cardHeaderText.setText(`PRECISION TRIAL — SAMPLE ${this.currentRound + 1}`);
    const header = this.add.text(CARD_CX, CARD_Y0 + 36, "CLICK THE BUG", { font: "bold 12px Georgia", color: "#c62828" }).setOrigin(0.5);
    this.cardContentContainer.add(header);
    this._bugHeaderTween = this.tweens.add({ targets: header, alpha: 0.5, duration: 450, yoyo: true, repeat: -1 });

    this._bugHuntTokenObjs = [];
    const maxLen = Math.max(...config.lines.map((l) => l.length));
    const fontSize = maxLen > 36 ? 9 : 11;
    const startY = CARD_Y0 + 62;
    const measure = (t, fs) => { const tmp = this.add.text(0, 0, t, { font: `bold ${fs}px Courier New` }); const w = tmp.width; tmp.destroy(); return w; };

    config.lines.forEach((line, li) => {
      const y = startY + li * (fontSize + 9);
      if (line.trim().startsWith("//")) {
        const t = this.add.text(CARD_CX, y, line, { font: `italic ${fontSize}px Courier New`, color: "#8a6435" }).setOrigin(0.5);
        this.cardContentContainer.add(t);
        return;
      }
      const isFaultLine = li + 1 === config.faultLine;
      const isPhrase = isFaultLine && config.faultToken.includes(" ");

      if (isPhrase) {
        const idx = line.indexOf(config.faultToken);
        const pre = line.slice(0, idx), phrase = line.slice(idx, idx + config.faultToken.length), post = line.slice(idx + config.faultToken.length);
        const preTokens = pre ? this._codeTokenize(pre) : [];
        const postTokens = post ? this._codeTokenize(post) : [];
        const preW = preTokens.reduce((a, tk) => a + measure(tk.t, fontSize), 0);
        const phraseW = measure(phrase, fontSize);
        const postW = postTokens.reduce((a, tk) => a + measure(tk.t, fontSize), 0);
        let x = CARD_CX - (preW + phraseW + postW) / 2;
        preTokens.forEach((tok) => { const w = measure(tok.t, fontSize); const t = this.add.text(x, y, tok.t, { font: `bold ${fontSize}px Courier New`, color: tok.c }).setOrigin(0, 0.5); this.cardContentContainer.add(t); x += w; });
        const bugT = this.add.text(x, y, phrase, { font: `bold ${fontSize}px Courier New`, color: "#e65100" }).setOrigin(0, 0.5);
        bugT.setData("isBug", true);
        bugT.setData("line", li + 1);
        const hitW = Math.max(phraseW + 6, 30), hitH = Math.max(fontSize + 8, 30);
        bugT.setInteractive(new Phaser.Geom.Rectangle(0, -hitH / 2, hitW, hitH), Phaser.Geom.Rectangle.Contains);
        this.cardContentContainer.add(bugT);
        bugT.on("pointerover", () => { if (!this.inputLocked) bugT.setColor("#8a6435"); });
        bugT.on("pointerout", () => { if (!this.inputLocked) bugT.setColor("#e65100"); });
        bugT.on("pointerdown", () => { if (this.inputLocked) return; this.inputLocked = true; this.onTokenClicked(bugT, config, y); });
        this._bugHuntTokenObjs.push(bugT);
        x += phraseW;
        postTokens.forEach((tok) => { const w = measure(tok.t, fontSize); const t = this.add.text(x, y, tok.t, { font: `bold ${fontSize}px Courier New`, color: tok.c }).setOrigin(0, 0.5); this.cardContentContainer.add(t); x += w; });
        return;
      }

      const tokens = this._codeTokenize(line);
      const measured = tokens.map((tk) => measure(tk.t, fontSize));
      const totalW = measured.reduce((a, b) => a + b, 0);
      let x = CARD_CX - totalW / 2;
      tokens.forEach((tok, ti) => {
        const w = measured[ti];
        const isBug = isFaultLine && tok.t === config.faultToken;
        const t = this.add.text(x + w / 2, y, tok.t, { font: `bold ${fontSize}px Courier New`, color: tok.c }).setOrigin(0.5);
        t.setData("isBug", isBug);
        t.setData("line", li + 1);
        const hitW = Math.max(w + 6, 30), hitH = Math.max(fontSize + 8, 30);
        t.setInteractive(new Phaser.Geom.Rectangle(-hitW / 2, -hitH / 2, hitW, hitH), Phaser.Geom.Rectangle.Contains);
        this.cardContentContainer.add(t);
        t.on("pointerover", () => { if (!this.inputLocked) t.setColor("#8a6435"); });
        t.on("pointerout", () => { if (!this.inputLocked) t.setColor(tok.c); });
        t.on("pointerdown", () => { if (this.inputLocked) return; this.inputLocked = true; this.onTokenClicked(t, config, y); });
        this._bugHuntTokenObjs.push(t);
        x += w;
      });
    });
    this.inputLocked = false;
  }

  async onTokenClicked(tokenObj, config, lineY) {
    await this.closeStopcock();
    const timePctUsed = this.getTimePctUsed();
    const timeMs = Math.round(this.time.now - this.roundStartTime);
    const correct = tokenObj.getData("isBug");
    this.logAttempt(config, correct, `line ${tokenObj.getData("line")}`, correct ? null : config.wrongTag, timeMs, timePctUsed);
    this._bugHuntTokenObjs.forEach((t) => t.disableInteractive());

    if (correct) {
      tokenObj.setColor("#2e7d32");
      const leftX = tokenObj.originX === 0 ? tokenObj.x : tokenObj.x - tokenObj.width / 2;
      const rightX = leftX + tokenObj.width;
      const strike = this.add.graphics();
      strike.lineStyle(2, 0xc62828, 0.9);
      strike.lineBetween(leftX - 2, lineY, rightX + 2, lineY);
      this.cardContentContainer.add(strike);
      if (config.fix) {
        const fixT = this.add.text(CARD_CX, lineY - 14, config.fix, { font: "bold 10px Courier New", color: "#2e7d32", wordWrap: { width: 380 } }).setOrigin(0.5).setAlpha(0);
        this.cardContentContainer.add(fixT);
        this.tweens.add({ targets: fixT, alpha: 1, duration: 220 });
      }
    } else {
      tokenObj.setColor(HEX_RED);
      this.tweens.add({ targets: tokenObj, x: tokenObj.x + 4, duration: 30, yoyo: true, repeat: 4 });
      this._bugHuntTokenObjs.filter((t) => t.getData("isBug")).forEach((t) => {
        t.setColor(HEX_RED);
        this.tweens.add({ targets: t, alpha: 0.3, duration: 160, yoyo: true, repeat: 3 });
      });
    }

    await this.runDualFutureReveal(config);
    if (!this._alive) return;
    await this.stampCard(correct ? "certified" : "misjudged");
    if (!this._alive) return;
    if (config.revealNote) this.createFloatingText(CARD_CX, CARD_Y1 + 40, config.revealNote, HEX_GRAY, "10px Arial", 2800);
    await this.delay(300);
    if (!this._alive) return;

    this.updateWaveIndicator(this._roundInWave(), correct);
    if (correct) {
      this.updateScore(this.scoreForAttempt(timePctUsed));
      this.updateCombo(true);
      if (this.roundAttempts === 1) this.correctFirstTry++;
      await this.delay(250);
      this.advanceRound();
    } else {
      this.loseLife();
      this.updateCombo(false);
      if (this.lives <= 0) { this.time.delayedCall(400, () => this.gameOver()); return; }
      await this.showBitFeedback(config.explanation || MISCONCEPTION_FEEDBACK[config.wrongTag] || "Not that one — look again.");
      if (!this._alive) return;
      this.advanceRound();
    }
  }

  /** Dual-future reveal, specialized for this level's two bug shapes:
   * "wrong_parser" (R14) shows the SAME String fed into the mini
   * furnace (crashes on the dot) and then the mini crucible (succeeds)
   * — the discrimination made physical. "type_mismatch" (R15) shows
   * the mini crucible dissolving cleanly but bouncing off an INT
   * container, then succeeding into a proper DOUBLE container. Both
   * reuse the mini-apparatus choreography rather than the generic
   * statement-based reveal, since the whole point is the visual
   * instrument contrast, not a line-by-line trace. */
  async runDualFutureReveal(config) {
    const strMatch = config.lines.join(" ").match(/"([^"]*)"/);
    const strVal = strMatch ? strMatch[1] : "";

    if (config.tokenRegion === "wrong_parser") {
      await this.runMiniFurnaceConversion(strVal);
      await this.delay(450);
      if (!this._alive) return;
      this.wipeSlate();
      this.clearMiniApparatus();
      this.clearContainerShelf();
      this.updateResultRow(null);
      await this.runMiniCrucibleConversion(strVal);
      return;
    }

    if (config.tokenRegion === "type_mismatch") {
      await this.runMiniCrucibleTypeMismatch(strVal);
      await this.delay(450);
      if (!this._alive) return;
      this.wipeSlate();
      this.clearMiniApparatus();
      this.clearContainerShelf();
      this.updateResultRow(null);
      await this.runMiniCrucibleConversion(strVal);
      return;
    }

    await this.runReveal(config.lines.filter((l) => !l.trim().startsWith("//")));
  }

  // ══════════════════════════════════════════════════════════════
  // HONEST EVALUATOR — reuses L74's parseInt/parseDouble cascade and
  // iterative left-to-right +/-/*// arithmetic with type promotion,
  // extended with: scientific notation, whitespace-tolerant
  // parseDouble (trimmed before validation — parseInt stays strict),
  // the "NaN"/"Infinity"/"-Infinity" special strings, an explicit
  // (int) cast (truncating, changes type to int), and a minimal
  // if (cond) {...} else {...} block with '==' promotion.
  // ══════════════════════════════════════════════════════════════

  _stripOuterParens(t) {
    if (t[0] !== "(" || t[t.length - 1] !== ")") return t;
    let depth = 0;
    for (let i = 0; i < t.length; i++) {
      if (t[i] === "(") depth++;
      else if (t[i] === ")") {
        depth--;
        if (depth === 0 && i < t.length - 1) return t;
      }
    }
    return t.slice(1, -1).trim();
  }

  _splitAdditive(expr) {
    const parts = [];
    let cur = "", inQuotes = false, depth = 0, curOp = null;
    for (let i = 0; i < expr.length; i++) {
      const ch = expr[i];
      if (ch === '"' && expr[i - 1] !== "\\") inQuotes = !inQuotes;
      if (!inQuotes) {
        if (ch === "(" || ch === "[") depth++;
        else if (ch === ")" || ch === "]") depth--;
        else if ((ch === "+" || ch === "-") && depth === 0 && i > 0) {
          parts.push({ op: curOp, text: cur.trim() });
          cur = ""; curOp = ch;
          continue;
        }
      }
      cur += ch;
    }
    parts.push({ op: curOp, text: cur.trim() });
    return parts.length > 1 ? parts : null;
  }

  _splitMultiplicative(expr) {
    const parts = [];
    let cur = "", inQuotes = false, depth = 0, curOp = null;
    for (let i = 0; i < expr.length; i++) {
      const ch = expr[i];
      if (ch === '"' && expr[i - 1] !== "\\") inQuotes = !inQuotes;
      if (!inQuotes) {
        if (ch === "(" || ch === "[") depth++;
        else if (ch === ")" || ch === "]") depth--;
        else if ((ch === "*" || ch === "/") && depth === 0) {
          parts.push({ op: curOp, text: cur.trim() });
          cur = ""; curOp = ch;
          continue;
        }
      }
      cur += ch;
    }
    parts.push({ op: curOp, text: cur.trim() });
    return parts.length > 1 ? parts : null;
  }

  _javaToString(value, type) {
    if (type === "double") {
      if (Number.isNaN(value)) return "NaN";
      if (value === Infinity) return "Infinity";
      if (value === -Infinity) return "-Infinity";
      return Number.isInteger(value) ? `${value}.0` : String(value);
    }
    return String(value);
  }

  async resolveExpr(expr, vars) {
    const t = this._stripOuterParens(expr.trim());

    const castMatch = t.match(/^\(int\)\s*(.+)$/);
    if (castMatch) {
      const inner = await this.resolveExpr(castMatch[1].trim(), vars);
      if (!inner.ok) return inner;
      if (inner.type === "String") {
        this.showCompileErrorStamp();
        return { ok: false, crash: "compile" };
      }
      return { ok: true, value: Math.trunc(Number(inner.value)), type: "int" };
    }

    const addParts = this._splitAdditive(t);
    if (addParts) {
      let accValue = null, accIsString = false, accType = null;
      for (let i = 0; i < addParts.length; i++) {
        const { op, text } = addParts[i];
        let partVal, partType;
        if (/^".*"$/.test(text)) { partVal = text.slice(1, -1); partType = "String"; }
        else {
          const r = await this.resolveExpr(text, vars);
          if (!r.ok) return r;
          partVal = r.value; partType = r.type;
        }
        if (i === 0) {
          accValue = partVal; accIsString = partType === "String"; accType = partType;
        } else if (accIsString || partType === "String") {
          accValue = String(accValue) + String(partVal);
          accIsString = true;
        } else {
          const numVal = op === "-" ? -Number(partVal) : Number(partVal);
          accValue = Number(accValue) + numVal;
          accType = (accType === "double" || partType === "double") ? "double" : "int";
        }
      }
      return { ok: true, value: accValue, type: accIsString ? "String" : accType };
    }

    const mulParts = this._splitMultiplicative(t);
    if (mulParts) {
      let accValue = null, accType = null;
      for (let i = 0; i < mulParts.length; i++) {
        const { op, text } = mulParts[i];
        const r = await this.resolveExpr(text, vars);
        if (!r.ok) return r;
        if (r.type === "String") {
          this.showCompileErrorStamp();
          return { ok: false, crash: "compile" };
        }
        if (i === 0) {
          accValue = Number(r.value); accType = r.type;
        } else {
          const bothInt = accType === "int" && r.type === "int";
          if (op === "*") accValue = accValue * Number(r.value);
          else accValue = bothInt ? Math.trunc(accValue / Number(r.value)) : accValue / Number(r.value);
          accType = bothInt ? "int" : "double";
        }
      }
      return { ok: true, value: accValue, type: accType };
    }

    const parseDoubleMatch = t.match(/^Double\.parseDouble\((.+)\)$/);
    if (parseDoubleMatch) {
      const argRes = await this.resolveExpr(parseDoubleMatch[1].trim(), vars);
      if (!argRes.ok) return argRes;
      const strVal = String(argRes.value);
      const outcome = await this.runMiniCrucibleConversion(strVal);
      if (!outcome.ok) { this.updateResultRow("crash"); return { ok: false, crash: "nfe" }; }
      this.updateResultRow("double");
      return { ok: true, value: outcome.value, type: "double" };
    }

    const parseIntMatch = t.match(/^Integer\.parseInt\((.+)\)$/);
    if (parseIntMatch) {
      const argRes = await this.resolveExpr(parseIntMatch[1].trim(), vars);
      if (!argRes.ok) return argRes;
      const strVal = String(argRes.value);
      const outcome = await this.runMiniFurnaceConversion(strVal);
      if (!outcome.ok) { this.updateResultRow("crash"); return { ok: false, crash: "nfe" }; }
      this.updateResultRow("int");
      return { ok: true, value: outcome.value, type: "int" };
    }

    const staticCallMatch = t.match(/^(\w+)\.(\w+)\(/);
    if (staticCallMatch) {
      this.showCompileErrorStamp();
      return { ok: false, crash: "compile" };
    }

    if (/^".*"$/.test(t)) return { ok: true, value: t.slice(1, -1), type: "String" };
    if (/^[+-]?\d+\.\d+$/.test(t)) return { ok: true, value: parseFloat(t), type: "double" };
    if (/^[+-]?\d+$/.test(t)) return { ok: true, value: parseInt(t, 10), type: "int" };

    if (vars[t] !== undefined) return { ok: true, value: vars[t].value, type: vars[t].type };

    return { ok: false, crash: "eval" };
  }

  /** '==' with Java's automatic numeric promotion (int compares equal
   * to a numerically-equal double). Only comparison this level needs. */
  async resolveCondition(condExpr, vars) {
    const eqMatch = condExpr.match(/^(.+?)==(.+)$/);
    if (eqMatch) {
      const l = await this.resolveExpr(eqMatch[1].trim(), vars);
      if (!l.ok) return l;
      const r = await this.resolveExpr(eqMatch[2].trim(), vars);
      if (!r.ok) return r;
      return { ok: true, value: Number(l.value) === Number(r.value) };
    }
    return { ok: false, crash: "eval" };
  }

  showCompileErrorStamp() {
    const stamp = this.add.text(CARD_CX, CARD_Y0 - 22, "COMPILE ERROR", { font: "bold 16px Arial", color: HEX_RED }).setOrigin(0.5).setDepth(30).setScale(1.3).setAngle(-6).setAlpha(0);
    this.roundElements.push(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 150 });
    this.screenShake(0.004, 120);
    this.time.delayedCall(850, () => { if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 200, onComplete: () => stamp.destroy() }); });
  }

  async execStatement(line, vars) {
    const declVar = line.match(/^(int|double|String)\s+(\w+)\s*=\s*(.*);$/);
    if (declVar) {
      const varType = declVar[1], name = declVar[2], rhs = declVar[3].trim();
      const r = await this.resolveExpr(rhs, vars);
      if (!r.ok) return r;
      if (varType === "double" && r.type === "String") { this.showCompileErrorStamp(); return { ok: false, crash: "compile" }; }
      if (varType === "int" && r.type !== "int") { this.showCompileErrorStamp(); return { ok: false, crash: "compile" }; }
      if (varType === "String" && r.type !== "String") { this.showCompileErrorStamp(); return { ok: false, crash: "compile" }; }
      vars[name] = { value: r.value, type: varType, kind: "scalar" };
      this.updateContainerShelf(vars);
      return { ok: true };
    }

    const printMatch = line.match(/^System\.out\.println\((.*)\);$/);
    if (printMatch) {
      const r = await this.resolveExpr(printMatch[1].trim(), vars);
      if (!r.ok) return r;
      if (!this._printedLines) this._printedLines = [];
      this._printedLines.push(this._javaToString(r.value, r.type));
      return { ok: true };
    }

    return { ok: true };
  }

  /** Handles a flat statement list PLUS one optional if/(...) {...}
   * else {...} block (Round 13's exact shape: single-line bodies,
   * "} else {" on its own line). Index-scans rather than recursing
   * through execStatement, since the block spans multiple array
   * entries. */
  async runStatements(lines, vars) {
    let i = 0;
    while (i < lines.length) {
      if (!this._alive) return { ok: true };
      const raw = lines[i];
      const line = raw.trim();
      if (!line) { i++; continue; }

      const ifMatch = line.match(/^if\s*\((.+)\)\s*\{$/);
      if (ifMatch) {
        const condRes = await this.resolveCondition(ifMatch[1].trim(), vars);
        if (!condRes.ok) return condRes;
        let j = i + 1;
        const thenLines = [];
        while (j < lines.length && lines[j].trim() !== "} else {") { thenLines.push(lines[j]); j++; }
        let k = j + 1;
        const elseLines = [];
        while (k < lines.length && lines[k].trim() !== "}") { elseLines.push(lines[k]); k++; }
        const branchLines = condRes.value ? thenLines : elseLines;
        const r = await this.runStatements(branchLines, vars);
        if (!r.ok) return r;
        i = k + 1;
        continue;
      }

      const r = await this.execStatement(line, vars);
      if (!r.ok) return r;
      i++;
    }
    return { ok: true };
  }

  async runReveal(input) {
    const raw = Array.isArray(input) ? input : input.source !== undefined ? input.source : input;
    const lines = Array.isArray(raw) ? raw : String(raw).split("\n");
    this._printedLines = [];
    const vars = {};
    return await this.runStatements(lines, vars);
  }

  getTimePctUsed() {
    const elapsed = this.time.now - this.roundStartTime;
    return Phaser.Math.Clamp(elapsed / this.roundTimeLimit, 0, 1);
  }

  // ══════════════════════════════════════════════════════════════
  // SCORING, LIVES, COMBO
  // ══════════════════════════════════════════════════════════════

  getComboMultiplier() { if (this.combo >= 5) return 3; if (this.combo >= 3) return 2; return 1; }

  scoreForAttempt(timePctUsed) {
    let points = 100 * this.getComboMultiplier();
    const remaining = 1 - timePctUsed;
    if (remaining > 0.6) { points += 50; this.fastBonusCount++; this.createFloatingText(CARD_CX, CARD_Y0 - 14, "⚡ EARLY CLOSE +50", HEX_GOLD, "bold 13px Arial", 900); }
    else if (remaining > 0.3) { points += 25; this.fastBonusCount++; this.createFloatingText(CARD_CX, CARD_Y0 - 14, "⚡ +25", HEX_GOLD, "bold 12px Arial", 800); }
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
    if (mult > 1) this.tweens.add({ targets: this.comboText, scale: 1.3, duration: 120, yoyo: true });
  }

  loseLife() {
    this.lives = Math.max(0, this.lives - 1);
    const icon = this.lifeIcons[this.lives];
    if (icon) this.tweens.add({ targets: icon, alpha: 0.12, duration: 320 });
    return this.lives <= 0;
  }

  logAttempt(config, correct, selectedAnswer, misconceptionTag, timeMs, timePctUsed) {
    this.roundAttempts = (this.roundAttempts || 0) + 1;
    this.totalTimePctUsed += timePctUsed !== undefined ? timePctUsed : 1;
    this.totalTimeMs += timeMs || 0;
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
    if (nextConfig.wave !== this.currentWave) {
      this._refillBurette().then(() => { if (this._alive && !this.gameEnded) this.startWave(nextConfig.wave); });
      return;
    }
    this.time.delayedCall(700, () => { if (this._alive && !this.gameEnded) this.startRound(next); });
  }

  // ══════════════════════════════════════════════════════════════
  // END STATES
  // ══════════════════════════════════════════════════════════════

  gameOver() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this._killTitrationTween();
    this.clearRound();
    this.hideBubble();

    (async () => {
      this.wipeSlate();
      this.clearMiniApparatus();
      this.clearContainerShelf();
      this._titrationProgress = 1;
      this.updateTitrationDrain(0);
      this._stopEndpointPulse();
      this.buretteLiquidGfx.clear();
      const motes = this.ambient;
      this.ambient = null;
      (motes || []).forEach((m) => this.tweens.add({ targets: m, y: 632, alpha: 0, duration: 1500, ease: "Sine.easeIn" }));

      const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
      this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });
      const title = this.add.text(640, 240, "TITRATION FAILED", { font: "bold 34px Georgia", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
      this.tweens.add({ targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut", onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }) });
      this.add.text(640, 310, `Score: ${this.score}`, { font: "20px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
      this.add.text(640, 350, `Trials Calibrated: ${this.currentRound} / 15`, { font: "16px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);
      this._makeButton(640, 420, "REFILL THE BURETTE", 240, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
    })();
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this._killTitrationTween();
    this.clearRound();
    this.hideBubble();

    try { GameManager.completeLevel(74, Math.round((this.correctFirstTry / 15) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("double_parseDouble_tuned"); } catch (_) {}
    try {
      localStorage.setItem("level75_results", JSON.stringify({
        level: 75, concept: "double_parseDouble", phase: "tuning",
        score: this.score, accuracy: this.correctFirstTry / 15, avgTimePct: this.totalTimePctUsed / 15,
        fastBonuses: this.fastBonusCount, comboMax: this.maxCombo, stars: this._starRating(),
        livesRemaining: this.lives, attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.trialsFinale().then(() => { if (this._alive) this.showScoreTally(); });
  }

  async trialsFinale() {
    await this._refillBurette();
    const state = { v: 0 };
    await new Promise((res) => {
      this.tweens.add({
        targets: state, v: 1, duration: 700, ease: "Sine.easeOut",
        onUpdate: () => {
          this._titrationProgress = 0;
          this.buretteLiquidGfx.clear();
          this.buretteLiquidGfx.fillStyle(C_GOLD, 0.6);
          this.buretteLiquidGfx.fillRect(BUR_X + 2, BUR_Y0, BUR_W - 4, (BUR_Y1 - BUR_Y0) * state.v);
          this.flaskLiquidGfx.clear();
          this.flaskLiquidGfx.fillStyle(C_GOLD, 0.5);
          const innerY0 = FLASK_Y0 + 22, innerY1 = FLASK_Y1 - 4;
          this.flaskLiquidGfx.fillPoints([
            FLASK_X - (FLASK_W - 12) / 2 * state.v, innerY1 - (innerY1 - innerY0) * state.v, FLASK_X + (FLASK_W - 12) / 2 * state.v, innerY1 - (innerY1 - innerY0) * state.v,
            FLASK_X + FLASK_W / 2 - 6, innerY1, FLASK_X - FLASK_W / 2 + 6, innerY1,
          ], true);
        },
        onComplete: res,
      });
    });
    await this.stampCard("certified");
    this.createConfetti(CARD_CX, (CARD_Y0 + CARD_Y1) / 2, 30);
    this.createConfetti(FLASK_X, FLASK_Y1 - 20, 20);
    await this.delay(700);
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
    panel.fillStyle(0x0c0818, 1);
    panel.fillRoundedRect(360, 145, 560, 430, 16);
    panel.lineStyle(2, C_ORANGE, 1);
    panel.strokeRoundedRect(360, 145, 560, 430, 16);

    const title = this.add.text(640, 185, "PRECISION CALIBRATED", { font: "bold 30px Georgia", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(91).setScale(0);
    this.tweens.add({ targets: title, scale: 1, duration: 350, ease: "Back.easeOut" });

    const acc = Math.round((this.correctFirstTry / 15) * 100);
    const avgSec = (this.totalTimeMs / 15 / 1000).toFixed(1);
    const lines = [
      `ACCURACY: ${acc}%`,
      `AVG RESPONSE: ${avgSec}s`,
      `EARLY-CLOSE BONUSES: ${this.fastBonusCount}`,
      `BEST COMBO: ×${this.getComboMultiplierFor(this.maxCombo)}`,
    ];
    lines.forEach((s, i) => {
      const t = this.add.text(500, 240 + i * 26, s, { font: "14px Arial", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 250, delay: 300 + i * 150 });
    });
    const totalText = this.add.text(500, 240 + 4 * 26, "TOTAL: 0", { font: "bold 24px Arial", color: HEX_GOLD }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: totalText, alpha: 1, duration: 250, delay: 900 });
    const counter = { v: 0 };
    this.tweens.add({ targets: counter, v: this.score, duration: 1000, delay: 900, onUpdate: () => totalText.setText(`TOTAL: ${Math.round(counter.v)}`) });

    const stars = this._starRating();
    for (let i = 0; i < 3; i++) {
      const earned = i < stars;
      const s = this.add.text(640 + (i - 1) * 60, 400, "★", { font: "40px Arial", color: earned ? HEX_GOLD : "#2a3040" }).setOrigin(0.5).setDepth(91).setScale(0);
      this.tweens.add({ targets: s, scale: 1, duration: 250, delay: 1500 + i * 200, ease: earned ? "Back.easeOut" : "Cubic.easeOut" });
    }

    const badge = this.add.container(640, 480).setDepth(91).setAlpha(0);
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillCircle(0, 0, 30);
    bg.lineStyle(3, C_GOLD, 1);
    bg.strokeCircle(0, 0, 30);
    bg.lineStyle(1.2, C_ORANGE, 0.9);
    bg.strokeRect(-3, -12, 6, 16);
    bg.fillStyle(C_GOLD, 0.8);
    bg.fillTriangle(-10, 6, 10, 6, 0, 16);
    badge.add(bg);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 2100 });
    const badgeLbl = this.add.text(640, 520, "parseDouble() SCHEMA TUNED", { font: "bold 13px Georgia", color: HEX_GOLD }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: badgeLbl, alpha: 1, duration: 300, delay: 2250 });

    this._makeButton(500, 555, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(770, 555, "NEXT: The Decimal Works →", 260, 44, { fill: 0x00733a, stroke: C_GREEN_BRIGHT, textColor: "#ffffff" }, () => {
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
    const t = this.add.text(0, 0, label, { font: "bold 14px Arial", color: style.textColor }).setOrigin(0.5);
    if (t.width > w - 16) t.setFontSize(11);
    c.add([g, t]);
    c.setSize(w, h);
    c.setInteractive({ useHandCursor: true });
    c.on("pointerover", () => { draw(true); c.setScale(1.04); });
    c.on("pointerout", () => { draw(false); c.setScale(1); });
    c.on("pointerdown", onClick);
    return c;
  }
}
