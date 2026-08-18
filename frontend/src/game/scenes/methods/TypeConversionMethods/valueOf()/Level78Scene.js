/**
 * Level 78 — "The Inscription Trials" (Type Conversion Wing: Tuning Phase —
 * String.valueOf())
 * ===========================================================================
 * Tunes the L77 valueOf() schema through rapid-fire fluency trials. A
 * cooling wax seal IS the timer — a linear tween drives an inward-collapsing
 * molten-red core against a fixed maroon base, exactly like L69's sand
 * column / L72's pressure gauge / L75's titration burette, re-skinned as
 * a solidifying wax seal. The reveal stage hosts a MINI TRIPLE APPARATUS —
 * compact Integer Furnace (L71) + Decimal Crucible (L74) + Inscription
 * Press (L77) — so every round can route to whichever instrument actually
 * fires, honestly, at 35% scale.
 *
 * Hand-verification (before any code was written, per the established
 * discipline): traced all 15 rounds directly against real Java semantics —
 * String.valueOf/Integer.parseInt/Double.parseDouble round trips, the
 * a*a+b*b / parseInt(price)*qty nested expressions, "" + d then
 * .length() (3 chars: '7','.','5'), and both bug hunts' buggy vs fixed
 * outputs ("50"*2 compile error / int 50*2=100; "20"+"30"="2030" concat
 * vs 20+30=50 arithmetic then valueOf). All 15 rounds check out exactly
 * as scripted — no spec arithmetic bugs found this time (same clean
 * result as L74 and L77).
 *
 * New evaluator vocabulary beyond L75's cascade (mulParts/stripOuterParens)
 * merged with L77's cascade (valueOf/Boolean.toString/char/boolean):
 *  - String.length() — a zero-arg instance method call on a String
 *    variable, needed for Round 10's "" + d then .length() trace. New to
 *    every prior level's evaluator (L71-L77 never called a method ON a
 *    resolved value, only on the Integer/Double/String/Boolean classes).
 *  - Round-trip type tracking (String→int→String, int→String→int) falls
 *    out for free from the existing recursive resolveExpr — no new
 *    machinery needed, just new round CONTENT exercising the existing
 *    parseInt/parseDouble/valueOf branches in sequence.
 *  - The Trial Slate's chalk-line direction annotations ("String → int",
 *    "int → String") are wired to fire for real this time (previous
 *    levels' chalkWriteLine was defined but never called — see the
 *    scaffold checklist note below); L78's spec explicitly calls for
 *    per-evaluation direction lines, so resolveExpr's parseInt/
 *    parseDouble/valueOf/Boolean.toString branches each chalk-write their
 *    direction after a successful conversion.
 *
 * SCAFFOLD NOTE: L74, L75, and L77 all defined chalkWriteLine() on the
 * Trial Slate but never called it anywhere in their evaluators — dead
 * code shipped three times in a row. Not retroactively patched (out of
 * scope, and those levels' own specs never required slate narration),
 * but L78 wires it up for real since its own spec explicitly asks for
 * direction-annotated slate lines.
 */

import Phaser from "phaser";
import { GameManager } from "../../../../GameManager.js";
import { BadgeSystem } from "../../../../BadgeSystem.js";

const W = 1280, H = 720;

const C_CYAN = 0x4fc3f7, C_GOLD = 0xffd740, C_ORANGE = 0xff9800, C_BLUE_GRAY = 0x8ea6c8;
const C_GREEN_BRIGHT = 0x00e676, C_RED = 0xf44336, C_GRAY = 0x78909c, C_COPPER = 0xb87333;
const HEX_CYAN = "#4fc3f7", HEX_GOLD = "#ffd740", HEX_ORANGE = "#ff9800", HEX_BLUE_GRAY = "#8ea6c8";
const HEX_GREEN_BRIGHT = "#00e676", HEX_RED = "#f44336", HEX_GRAY = "#78909c", HEX_COPPER = "#b87333";
const C_INDIGO = 0x3949ab, HEX_INDIGO = "#3949ab";
const C_CREAM = 0xe0d6b8, HEX_CREAM = "#e0d6b8";
const C_WAX_GLOW = 0xff7043, C_MAROON = 0x5d1010, HEX_MAROON = "#5d1010";

// Inscription Order (trial content parchment)
const ORDER_X0 = 230, ORDER_X1 = 690, ORDER_Y0 = 100, ORDER_Y1 = 420;
const ORDER_CX = (ORDER_X0 + ORDER_X1) / 2;
// Wax seal (hero timer)
const WAX_CX = 760, WAX_CY = 200, WAX_R = 80;
// Mini triple apparatus (reveal stage) — furnace + crucible (top row), press (bottom, centered)
const MF_X0 = 925, MF_X1 = 1070, MC_X0 = 1080, MC_X1 = 1225;
const MINI_TOP_Y0 = 88, MINI_TOP_Y1 = 185;
const MP_X0 = 970, MP_X1 = 1180, MINI_BOT_Y0 = 195, MINI_BOT_Y1 = 312;
// Trial slate / container shelf
const SLATE_X = 920, SLATE_Y = 335, SLATE_W = 310, SLATE_H = 130;
const SHELF_X = 920, SHELF_Y = 480, SHELF_W = 310, SHELF_H = 100;

const TUTORIAL_KEY = "level78_tutorial_done";
const WAVE_TIME = { 1: 12000, 2: 10000, 3: 9000 };

// ══════════════════════════════════════════════════════════════
// ROUND CONFIGURATION
// ══════════════════════════════════════════════════════════════
const ROUNDS = [
  // ══ WAVE 1 — Rapid Inscriptions (12s) ══
  { round: 1, wave: 1, type: "predict",
    source: 'String s = String.valueOf(77);',
    question: "What is stored in s?", correct: '"77"',
    options: [
      { value: '"77"', tag: null, label: '"77" (String)' },
      { value: "77", tag: "valueOf_returns_number_belief", label: "77 (int)" },
      { value: "error", tag: "valueOf_crashes_belief", label: "Error" },
      { value: '"int: 77"', tag: "valueOf_adds_type_belief", label: '"int: 77"' },
    ],
    concept: "fluent_valueOf_int" },

  { round: 2, wave: 1, type: "predict",
    source: 'String s = String.valueOf(0.0);',
    question: "What is stored in s?", correct: '"0.0"',
    options: [
      { value: '"0.0"', tag: null, label: '"0.0" (String)' },
      { value: '"0"', tag: "valueOf_drops_dot_belief", label: '"0"' },
      { value: "0.0", tag: "valueOf_returns_number_belief", label: "0.0 (double)" },
      { value: "error", tag: "valueOf_crashes_belief", label: "Error" },
    ],
    concept: "fluent_valueOf_double" },

  { round: 3, wave: 1, type: "predict",
    source: 'String s = String.valueOf(true);',
    question: "What is stored in s?", correct: '"true"',
    options: [
      { value: '"true"', tag: null, label: '"true" (String)' },
      { value: '"1"', tag: "boolean_is_one_belief", label: '"1"' },
      { value: "true", tag: "valueOf_returns_boolean_belief", label: "true (boolean)" },
      { value: '"True"', tag: "boolean_valueOf_caps_belief", label: '"True"' },
    ],
    concept: "fluent_valueOf_boolean" },

  { round: 4, wave: 1, type: "predict",
    source: 'int x = Integer.parseInt("88");',
    question: "What is stored in x?", correct: "88",
    options: [
      { value: "88", tag: null },
      { value: '"88"', tag: "parseInt_returns_string_belief", label: '"88" (String)' },
      { value: "88.0", tag: "parseInt_returns_double_belief" },
      { value: "error", tag: "nfe_on_valid_belief", label: "NumberFormatException" },
    ],
    revealNote: "Direction check: parseInt goes DOWN — String to int. The furnace smelts; the bar is 88. Not a String, not a double — a solid int.",
    concept: "fluent_direction_check_parseInt" },

  { round: 5, wave: 1, type: "predict",
    source: 'int a = 5;\nString s = String.valueOf(a);\nSystem.out.println(s + s);',
    question: "What prints?", correct: "55",
    options: [
      { value: "55", tag: null, label: "55 (concat)" },
      { value: "10", tag: "valueOf_keeps_as_number_belief", label: "10 (addition)" },
      { value: "error", tag: "valueOf_then_concat_crashes_belief", label: "Error" },
      { value: '"5""5"', tag: "valueOf_adds_quotes_belief", label: '"5""5"' },
    ],
    concept: "fluent_valueOf_then_concat" },

  // ══ WAVE 2 — The Direction Triangle (10s) ══
  { round: 6, wave: 2, type: "predict",
    source: 'String s = "42";\nint n = Integer.parseInt(s);\nString back = String.valueOf(n);\nSystem.out.println(back);',
    question: "What prints?", correct: "42",
    options: [
      { value: "42", tag: null, label: '42 (prints "42" the String)' },
      { value: "error", tag: "round_trip_crashes_belief", label: "Error" },
      { value: "84", tag: "round_trip_doubles_belief" },
      { value: "null", tag: "round_trip_null_belief" },
    ],
    revealNote: "THE ROUND TRIP: String '42' → parseInt → int 42 → valueOf → String '42'. Down the triangle, then back up. The value survived the journey — same characters, different types along the way.",
    concept: "round_trip_string_int_string" },

  { round: 7, wave: 2, type: "predict",
    source: 'double d = Double.parseDouble("3.14");\nString s = String.valueOf(d);\nSystem.out.println(s);',
    question: "What prints?", correct: "3.14",
    options: [
      { value: "3.14", tag: null, label: '3.14 (prints "3.14" the String)' },
      { value: "3", tag: "valueOf_truncates_belief" },
      { value: "error", tag: "round_trip_crashes_belief", label: "Error" },
      { value: "3.14000...", tag: "valueOf_adds_precision_belief" },
    ],
    concept: "round_trip_string_double_string" },

  { round: 8, wave: 2, type: "predict",
    source: 'int x = 100;\nString s = String.valueOf(x);\nint y = Integer.parseInt(s);\nSystem.out.println(y + 1);',
    question: "What prints?", correct: "101",
    options: [
      { value: "101", tag: null },
      { value: '"1001"', tag: "concat_after_parse_belief", label: '"1001"' },
      { value: "error", tag: "round_trip_crashes_belief", label: "Error" },
      { value: '"101"', tag: "result_is_string_belief", label: '"101" (String)' },
    ],
    revealNote: "Up then down: int 100 → valueOf → '100' → parseInt → int 100 again. Then 100 + 1 = 101. The final + is ARITHMETIC because both operands are ints. The round trip preserved the value AND the type.",
    concept: "round_trip_int_string_int" },

  { round: 9, wave: 2, type: "predict",
    source: 'String numStr = "25";\nString label = "Value: " + Integer.parseInt(numStr);\nSystem.out.println(label);',
    question: "What prints?", correct: "Value: 25",
    options: [
      { value: "Value: 25", tag: null },
      { value: "Value: 25.0", tag: "parseInt_returns_double_belief" },
      { value: "error", tag: "mixed_types_crash_belief", label: "Error" },
      { value: '"Value: " + 25', tag: "concat_literal_belief", label: '"Value: " + 25' },
    ],
    revealNote: "parseInt('25') → int 25. Then 'Value: ' + 25 → String concat (the String on the left triggers concat). Java auto-converts 25 to '25' for the concat — so valueOf happens IMPLICITLY inside the +. The explicit form: 'Value: ' + String.valueOf(parseInt(numStr)).",
    concept: "implicit_valueOf_in_concat" },

  { round: 10, wave: 2, type: "predict",
    source: 'double d = 7.5;\nString s = "" + d;\nSystem.out.println(s.length());',
    question: "What prints?", correct: "3",
    options: [
      { value: "3", tag: null, label: '3 (length of "7.5")' },
      { value: "1", tag: "length_of_number_belief" },
      { value: "7.5", tag: "length_returns_value_belief" },
      { value: "error", tag: "concat_length_crashes_belief", label: "Error" },
    ],
    revealNote: "'\"\" + 7.5' → '7.5' (String). '7.5'.length() = 3 (three characters: '7', '.', '5'). The number became text; text has a length measured in characters. The dot counts as a character.",
    concept: "valueOf_then_string_methods" },

  // ══ WAVE 3 — Deep Traces & Bug Hunt ══
  { round: 11, wave: 3, type: "trace",
    source: 'int a = 3;\nint b = 4;\nString hyp = String.valueOf(a * a + b * b);\nSystem.out.println("Hyp²: " + hyp);',
    question: "What prints?", correct: "Hyp²: 25",
    options: [
      { value: "Hyp²: 25", tag: null },
      { value: "Hyp²: 34", tag: "valueOf_concats_individually_belief" },
      { value: "Hyp²: 9 + 16", tag: "valueOf_preserves_expression_belief" },
      { value: "error", tag: "valueOf_arithmetic_crashes_belief", label: "Error" },
    ],
    revealNote: "The argument evaluates FIRST: a*a + b*b = 9 + 16 = 25. Then valueOf(25) → '25'. valueOf receives the RESULT (25), not the expression. The math resolved before the press stamped.",
    concept: "trace_evaluate_then_valueOf" },

  { round: 12, wave: 3, type: "trace",
    source: 'String price = "15";\nint qty = 3;\nString receipt = String.valueOf(Integer.parseInt(price) * qty);\nSystem.out.println("Total: " + receipt);',
    question: "What prints?", correct: "Total: 45",
    options: [
      { value: "Total: 45", tag: null },
      { value: "Total: 153", tag: "concat_before_multiply_belief" },
      { value: "Total: 15 * 3", tag: "valueOf_preserves_expression_belief" },
      { value: "error", tag: "nested_conversion_crashes_belief", label: "Error" },
    ],
    revealNote: "Inside out: parseInt('15') → 15; 15 * 3 = 45; valueOf(45) → '45'. Three instruments in one expression: furnace (parse), arithmetic (*), press (valueOf). The conversion triangle traversed in a single line.",
    concept: "trace_nested_conversions" },

  { round: 13, wave: 3, type: "trace",
    source: 'boolean big = 100 > 50;\nString msg = "Big? " + String.valueOf(big);\nSystem.out.println(msg);',
    question: "What prints?", correct: "Big? true",
    options: [
      { value: "Big? true", tag: null },
      { value: "Big? 1", tag: "boolean_is_one_belief" },
      { value: "Big? True", tag: "boolean_valueOf_caps_belief" },
      { value: "error", tag: "boolean_in_string_crashes_belief", label: "Error" },
    ],
    concept: "trace_boolean_valueOf_in_context" },

  { round: 14, wave: 3, type: "bughunt",
    lines: ['String numStr = "50";', "int doubled = String.valueOf(numStr) * 2;", 'System.out.println("Doubled: " + doubled);', "// intent: double the number 50 to get 100"],
    faultToken: "String.valueOf(numStr)", faultLine: 2, tokenRegion: "wrong_direction",
    fix: "Integer.parseInt(numStr)",
    explanation: "The direction confusion — valueOf on a String returns the SAME String (a no-op). The code then tries to multiply a String by 2 → COMPILE ERROR. The intent was to convert text to int (parse direction, DOWN the triangle), not to inscribe (valueOf direction, UP). parseInt is the correct instrument.",
    wrongTag: "direction_confusion",
    revealNote: "Dual-future reveal: the buggy run routes to the mini press — the String enters and the SAME String exits (no-op). Then String * 2 → COMPILE ERROR stamp. Reset; the fixed run routes to the mini furnace — smelt '50' → bar 50, 50 * 2 = 100, prints 'Doubled: 100'. Bit: 'valueOf goes UP (to String); parseInt goes DOWN (to int). The triangle has directions — follow them.'",
    concept: "direction_confusion_bug" },

  { round: 15, wave: 3, type: "bughunt",
    lines: ["int a = 20;", "int b = 30;", "String result = String.valueOf(a) + String.valueOf(b);", 'System.out.println("Sum: " + result);', "// intent: compute 20 + 30 = 50"],
    faultToken: "String.valueOf(a) + String.valueOf(b)", faultLine: 3, tokenRegion: "concat_not_addition",
    fix: "String.valueOf(a + b)  // or just: \"\" + (a + b)",
    explanation: "The concat-as-arithmetic mistake — valueOf(a) + valueOf(b) = '20' + '30' = '2030' (String concat). The intent was 20 + 30 = 50. Fix: compute FIRST (a + b = 50), then convert: String.valueOf(a + b) → '50'. The conversion must happen AFTER the math, not before.",
    wrongTag: "concat_as_arithmetic",
    revealNote: "Dual-future reveal: the buggy run stamps a='20' and b='30' as Strings, then + glues them: '2030'. Prints 'Sum: 2030'. Reset; the fixed run computes a + b = 50 FIRST (arithmetic on ints), then valueOf(50) → '50'. Prints 'Sum: 50'. Bit: 'Convert AFTER computing, not before. valueOf(a) + valueOf(b) is concatenation; valueOf(a + b) is addition-then-conversion. The parentheses change everything.'",
    concept: "concat_as_arithmetic_bug" },
];

const MISCONCEPTION_FEEDBACK = {
  valueOf_returns_number_belief: "valueOf ALWAYS returns String. '77' is text, not the number 77.",
  valueOf_crashes_belief: "The press NEVER jams — valueOf accepts any type. No validation gate, no NFE. Every value has a String form.",
  valueOf_adds_type_belief: "valueOf stamps the VALUE only — '77', not 'int: 77'. No type prefixes.",
  valueOf_drops_dot_belief: "valueOf(0.0) → '0.0' — the dot and trailing zero are preserved. The String represents the double exactly as Java would print it.",
  boolean_is_one_belief: "Java booleans are 'true'/'false', not 1/0. valueOf(true) = 'true', not '1'.",
  valueOf_returns_boolean_belief: "valueOf returns String. 'true' is text, not the boolean true.",
  boolean_valueOf_caps_belief: "Always lowercase: 'true', 'false'. Never 'True' or 'False'.",
  parseInt_returns_string_belief: "parseInt returns int, not String. The bar that exits the furnace is metal, not paper.",
  parseInt_returns_double_belief: "parseInt returns int — always. Not 88.0. The furnace produces solid bars, never liquid.",
  nfe_on_valid_belief: "A well-formed digit string never crashes parseInt — only invalid characters do.",
  valueOf_keeps_as_number_belief: "After valueOf, both operands are Strings — + means CONCAT ('55'), not addition (10).",
  valueOf_then_concat_crashes_belief: "String + String concatenation never crashes — 's + s' glues cleanly.",
  valueOf_adds_quotes_belief: "valueOf produces the natural representation — clean, no extra formatting, no added quotes.",
  valueOf_adds_precision_belief: "valueOf produces the natural representation — clean, no extra formatting, no added precision.",
  direction_confusion: "valueOf goes UP the triangle (to String); parseInt/parseDouble go DOWN (to int/double). The direction is the choice. Read the intent: do you need a NUMBER or TEXT?",
  parse_is_valueOf_belief: "parseInt converts String → int (DOWN). valueOf converts anything → String (UP). They're OPPOSITES, not synonyms.",
  round_trip_crashes_belief: "Round trips are legal: String → int → String, or int → String → int. Each step uses the correct instrument. No crashes on the return trip.",
  round_trip_doubles_belief: "The round trip preserves the value — 42 stays 42 through every conversion. No multiplication, no side effects.",
  round_trip_null_belief: "valueOf never returns null for a valid conversion — it stamps the real representation.",
  valueOf_truncates_belief: "valueOf preserves the full representation — every decimal digit stamps intact.",
  concat_after_parse_belief: "After parseInt, y is a genuine int — y + 1 is ARITHMETIC (101), not concatenation.",
  result_is_string_belief: "parseInt returns int, not String — y + 1 is numeric addition, and println shows 101 (no quotes in real output).",
  concat_as_arithmetic: "valueOf(a) + valueOf(b) = concat ('2030'). valueOf(a + b) = addition then conversion ('50'). Convert AFTER computing when you want math.",
  valueOf_concats_individually_belief: "The argument evaluates FIRST. a*a + b*b = 25 before valueOf sees it. valueOf receives the RESULT, not the parts.",
  valueOf_preserves_expression_belief: "valueOf converts a VALUE, not an expression string. 3*3 + 4*4 = 25; valueOf(25) = '25', not '9 + 16'.",
  valueOf_arithmetic_crashes_belief: "Arithmetic inside valueOf's argument resolves normally before the press ever sees it — no crash.",
  concat_before_multiply_belief: "Multiplication resolves before valueOf sees the result. parseInt('15') * 3 = 45. Then valueOf(45) = '45'.",
  nested_conversion_crashes_belief: "Nesting parseInt inside an arithmetic expression inside valueOf is completely legal — each step resolves inside-out.",
  mixed_types_crash_belief: "String + int is legal concatenation — Java auto-converts the int. No crash.",
  concat_literal_belief: "The + triggers concatenation immediately — parseInt(numStr) resolves to the int 25 first, then Java converts it to '25' for the glue. The displayed output has no operator symbols.",
  implicit_valueOf_in_concat: "When you write 'text' + number, Java auto-calls valueOf on the number. The explicit form is String.valueOf(number). Both produce the same result.",
  length_of_number_belief: "The String '7.5' has 3 characters: '7', '.', '5'. The dot IS a character. String.length() counts characters, not numeric digits.",
  length_returns_value_belief: "length() returns the number of CHARACTERS in the String, not the numeric value the String represents.",
  concat_length_crashes_belief: "'\"\" + d' concatenates cleanly into a String; .length() on a real String never crashes.",
  boolean_in_string_crashes_belief: "Concatenating a boolean's valueOf result into a String never crashes — 'Big? ' + 'true' glues cleanly.",
  timeout: "The wax set! Press the signet faster — direction verdicts are reflexes now.",
};

export class Level78Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level78Scene" });
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
    this._waxHalted = true;
  }

  preload() {}

  create() {
    this._alive = true;
    this.createParticleTexture();
    this.createBackground();
    this.createChamberDim();
    this.createScribeDesk();
    this.createConversionTriangleWall();
    this.createSealRack();
    this.createTrialsBanner();
    this.createParticles();
    this.createInscriptionOrder();
    this.createWaxSeal();
    this.createMiniTripleApparatus();
    this.createTrialSlate();
    this.createContainerShelf();
    this.createHUD();
    this.createBit();

    this.events.on("shutdown", () => { this._alive = false; this._killWaxTween(); });
    this.checkTutorial();
  }

  update(time, delta) {
    this.updateParticles(time, delta);
    this.updateWaxCooling(time);
    this.updateWaxUrgency(time);
    this.updateWaxSheen(time);
    this.updateSteamWisps(time);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // SETUP — INSCRIPTION TRIALS CHAMBER DRESSING
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l78_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l78_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x0a0614).setDepth(0);
  }

  createChamberDim() {
    const g = this.add.graphics().setDepth(1).setAlpha(0.4);
    g.fillStyle(0x0a0d18, 1);
    g.fillRect(0, 635, W, 85);
    g.lineStyle(1, 0x2a3654, 0.5);
    g.lineBetween(0, 637, W, 637);
  }

  createScribeDesk() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x1a0e05, 0.3);
    g.lineStyle(2, C_COPPER, 1);
    g.fillRect(200, 50, 580, 120);
    g.strokeRect(200, 50, 580, 120);
    const drawQuill = (x, y) => {
      g.lineStyle(1, C_COPPER, 0.2);
      g.lineBetween(x, y, x + 14, y - 22);
      g.fillStyle(C_COPPER, 0.15);
      g.fillTriangle(x + 12, y - 20, x + 18, y - 26, x + 16, y - 16);
    };
    const drawInkpot = (x, y) => {
      g.lineStyle(1, C_COPPER, 0.15);
      g.strokeCircle(x, y, 7);
      g.fillStyle(C_COPPER, 0.1);
      g.fillCircle(x, y, 6);
    };
    const drawParchmentStack = (x, y) => {
      g.lineStyle(1, C_COPPER, 0.15);
      for (let i = 0; i < 4; i++) g.strokeRect(x - 14 + i, y - 10 - i, 28, 18);
    };
    drawQuill(260, 130);
    drawInkpot(300, 132);
    drawParchmentStack(420, 130);
  }

  createConversionTriangleWall() {
    const g = this.add.graphics().setDepth(2).setAlpha(0.5);
    g.lineStyle(2, C_COPPER, 1);
    g.strokeRect(60, 100, 120, 100);
    const sx = 60, sy = 100, sw = 120, sh = 100;
    const pStr = { x: sx + sw / 2, y: sy + 16 };
    const pInt = { x: sx + 18, y: sy + sh - 16 };
    const pDbl = { x: sx + sw - 18, y: sy + sh - 16 };
    g.lineStyle(1.5, C_GOLD, 0.7);
    g.lineBetween(pStr.x, pStr.y, pInt.x, pInt.y);
    g.lineStyle(1.5, C_ORANGE, 0.7);
    g.lineBetween(pStr.x, pStr.y, pDbl.x, pDbl.y);
    g.lineStyle(1, C_GRAY, 0.5);
    g.lineBetween(pInt.x, pInt.y, pDbl.x, pDbl.y);
    this.add.text(pStr.x, pStr.y - 10, "String", { font: "bold 9px Georgia", color: HEX_CREAM }).setOrigin(0.5).setDepth(3).setAlpha(0.7);
    this.add.text(pInt.x, pInt.y + 10, "int", { font: "bold 9px Georgia", color: HEX_GOLD }).setOrigin(0.5).setDepth(3).setAlpha(0.7);
    this.add.text(pDbl.x, pDbl.y + 10, "double", { font: "bold 9px Georgia", color: HEX_ORANGE }).setOrigin(0.5).setDepth(3).setAlpha(0.7);
    this._triangleGfx = g;
  }

  createSealRack() {
    const g = this.add.graphics().setDepth(2).setAlpha(0.3);
    g.lineStyle(2, C_COPPER, 1);
    g.strokeRect(1110, 100, 130, 60);
    const colors = [[0xf44336, 0x5d1010], [0xf44336, 0x5d1010], [0xf44336, 0x5d1010], [0xf44336, 0x5d1010]];
    colors.forEach((c, i) => {
      const cx = 1132 + i * 28, cy = 130;
      g.lineStyle(1, C_COPPER, 0.7);
      g.strokeCircle(cx, cy, 8);
      g.fillStyle(c[0], 0.4);
      g.fillCircle(cx, cy, 6);
    });
  }

  createTrialsBanner() {
    const g = this.add.graphics().setDepth(2);
    g.fillStyle(0x0a0614, 1);
    g.lineStyle(1, C_CREAM, 0.5);
    g.fillRoundedRect(460, 12, 380, 26, 3);
    g.strokeRoundedRect(460, 12, 380, 26, 3);
    this.add.text(640, 25, "THE INSCRIPTION TRIALS", { font: "bold 14px Georgia", color: HEX_CREAM }).setOrigin(0.5).setAlpha(0.7).setDepth(3);
  }

  createParticles() {
    this.ambient = [];
    const colors = [0x3949ab, C_CREAM, 0xb87333];
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
    const t = this.add.text(x, y, text, { font: "italic 12px Arial", color: colorHex, wordWrap: { width: 280 }, align: "center" }).setOrigin(0.5).setDepth(70).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 200 });
    this.time.delayedCall(2200, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() }); });
    return t;
  }

  createFloatingText(x, y, text, colorHex, font = "bold 15px Arial", hold = 1400) {
    const t = this.add.text(x, y, text, { font, color: colorHex, wordWrap: { width: 320 }, align: "center" }).setOrigin(0.5).setDepth(31).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 180 });
    this.time.delayedCall(hold, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() }); });
    return t;
  }

  createConfetti(x, y, count = 30) {
    const p = this.add.particles(x, y, "l78_dot", {
      speed: { min: 80, max: 240 }, angle: { min: 0, max: 360 }, scale: { start: 0.9, end: 0 }, lifespan: 500,
      tint: [C_GOLD, C_CREAM, C_INDIGO, 0xffffff], emitting: false,
    }).setDepth(75);
    p.explode(count);
    this.time.delayedCall(900, () => p.destroy());
  }

  screenShake(intensity = 0.004, duration = 150) {
    this.cameras.main.shake(duration, intensity);
  }

  // ══════════════════════════════════════════════════════════════
  // THE INSCRIPTION ORDER (trial content parchment)
  // ══════════════════════════════════════════════════════════════

  createInscriptionOrder() {
    const g = this.add.graphics().setDepth(20);
    g.fillStyle(0x1a1408, 1);
    g.lineStyle(2, C_COPPER, 1);
    g.fillRoundedRect(ORDER_X0, ORDER_Y0, ORDER_X1 - ORDER_X0, ORDER_Y1 - ORDER_Y0, 4);
    g.strokeRoundedRect(ORDER_X0, ORDER_Y0, ORDER_X1 - ORDER_X0, ORDER_Y1 - ORDER_Y0, 4);
    g.fillStyle(C_COPPER, 0.1);
    g.fillRect(ORDER_X0, ORDER_Y0, ORDER_X1 - ORDER_X0, 24);
    g.lineStyle(1, C_COPPER, 0.12);
    for (let y = ORDER_Y0 + 48; y < ORDER_Y1 - 44; y += 20) g.lineBetween(ORDER_X0 + 16, y, ORDER_X1 - 16, y);

    this.orderHeaderText = this.add.text(ORDER_CX, ORDER_Y0 + 12, "", { font: "bold 10px Georgia", color: HEX_COPPER }).setOrigin(0.5).setDepth(21);
    this.orderRoundLabel = this.add.text(ORDER_X1 - 14, ORDER_Y0 + 12, "SEAL 1/15", { font: "bold 11px Courier New", color: HEX_COPPER }).setOrigin(1, 0.5).setDepth(21);
    this.orderContentContainer = this.add.container(0, 0).setDepth(21);
    this.orderQuestionText = this.add.text(ORDER_CX, ORDER_Y1 - 26, "", { font: "bold 14px Georgia", color: "#e0d6c8", wordWrap: { width: ORDER_X1 - ORDER_X0 - 40 }, align: "center" }).setOrigin(0.5).setDepth(21);
    this.orderStampLayer = this.add.container(ORDER_CX, (ORDER_Y0 + ORDER_Y1) / 2).setDepth(35);
  }

  clearOrderContent() {
    this.orderContentContainer.removeAll(true);
    this.orderQuestionText.setText("");
    this.orderStampLayer.removeAll(true);
  }

  showTrialOnOrder(lines, questionText) {
    this.clearOrderContent();
    this.orderHeaderText.setText(`INSCRIPTION ORDER — SEAL ${this.currentRound + 1}`);
    const maxLen = Math.max(...lines.map((l) => l.length));
    const fontSize = maxLen > 40 ? 10 : maxLen > 28 ? 12 : 14;
    const lineH = fontSize + 10;
    const startY = ORDER_Y0 + 56 + Math.max(0, 4 - lines.length) * (lineH / 2);
    lines.forEach((line, i) => {
      const y = startY + i * lineH;
      if (line.trim().startsWith("//")) {
        const t = this.add.text(ORDER_CX, y, line, { font: `italic ${fontSize}px Courier New`, color: HEX_COPPER }).setOrigin(0.5).setAlpha(0);
        this.orderContentContainer.add(t);
        this.tweens.add({ targets: t, alpha: 1, duration: 180 });
        return;
      }
      const tokens = this._codeTokenize(line);
      const measured = tokens.map((tk) => { const tmp = this.add.text(0, 0, tk.t, { font: `bold ${fontSize}px Courier New` }); const w = tmp.width; tmp.destroy(); return w; });
      const totalW = measured.reduce((a, b) => a + b, 0);
      let x = ORDER_CX - totalW / 2;
      tokens.forEach((tok, ti) => {
        const t = this.add.text(x, y, tok.t, { font: `bold ${fontSize}px Courier New`, color: tok.c }).setOrigin(0, 0.5).setAlpha(0);
        this.orderContentContainer.add(t);
        this.tweens.add({ targets: t, alpha: 1, duration: 180 });
        x += measured[ti];
      });
    });
    if (questionText) this.orderQuestionText.setText(questionText);
    this.orderRoundLabel.setText(`SEAL ${this.currentRound + 1}/15`);
  }

  _codeTokenize(line) {
    const tokens = [];
    const re = /("(?:[^"\\]|\\.)*")|('.')|(\bint\b|\bdouble\b|\bString\b|\bboolean\b)|(\bInteger\b|\bDouble\b|\bBoolean\b)|(\.parseInt\b|\.parseDouble\b|\.valueOf\b|\.toString\b|\.println\b|\.length\b)|(\bSystem\.out\b)|(-?\d+\.?\d*(?:[eE][+-]?\d+)?)|(\btrue\b|\bfalse\b)|([(){}\[\];.,=+*/])/g;
    let last = 0, m;
    const plain = (t) => t && tokens.push({ t, c: "#e0d6c8" });
    while ((m = re.exec(line))) {
      if (m.index > last) plain(line.slice(last, m.index));
      if (m[1]) tokens.push({ t: m[1], c: "#8bc34a" });
      else if (m[2]) tokens.push({ t: m[2], c: "#8bc34a" });
      else if (m[3]) tokens.push({ t: m[3], c: "#4fc3f7" });
      else if (m[4]) tokens.push({ t: m[4], c: "#d4a843" });
      else if (m[5]) tokens.push({ t: m[5], c: "#e0a35a" });
      else if (m[6]) tokens.push({ t: m[6], c: HEX_GRAY });
      else if (m[7]) tokens.push({ t: m[7], c: "#4dd0c4" });
      else if (m[8]) tokens.push({ t: m[8], c: "#ba68c8" });
      else if (m[9]) tokens.push({ t: m[9], c: /[()]/.test(m[9]) ? "#e57373" : HEX_GRAY });
      last = m.index + m[0].length;
    }
    if (last < line.length) plain(line.slice(last));
    return tokens.length ? tokens : [{ t: line, c: "#e0d6c8" }];
  }

  async stampOrder(kind) {
    const labels = { certified: "INSCRIBED", misjudged: "MISINSCRIBED", void: "TRIAL CLOSED" };
    const colors = { certified: HEX_GREEN_BRIGHT, misjudged: HEX_RED, void: HEX_RED };
    const stamp = this.add.text(0, 0, labels[kind], { font: "bold 21px Georgia", color: colors[kind] }).setOrigin(0.5).setScale(1.4).setAngle(-8).setAlpha(0);
    this.orderStampLayer.add(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 180 });
    const hold = kind === "void" ? 1800 : 700;
    await this.delay(hold);
    if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 200, onComplete: () => stamp.destroy() });
  }

  // ══════════════════════════════════════════════════════════════
  // THE COOLING WAX SEAL (THE TIMER — hero mechanic): a linear tween
  // drives an inward-collapsing molten-red core against a fixed
  // maroon base — the cooling front's radius derives per-frame from
  // the tween's progress, exactly like L69's sand column / L72's
  // pressure gauge / L75's titration burette, re-skinned as
  // solidifying wax. waxContainer is positioned AT (WAX_CX, WAX_CY)
  // so its scale-squish press animation pivots correctly around the
  // seal's own center rather than the canvas origin.
  // ══════════════════════════════════════════════════════════════

  createWaxSeal() {
    const g = this.add.graphics().setDepth(9);
    g.fillStyle(C_CREAM, 0.15);
    g.fillRect(WAX_CX - 90, WAX_CY - 90, 180, 180);

    this._waxEdgeOffsets = Array.from({ length: 16 }, () => Phaser.Math.FloatBetween(-5, 5));
    this.waxContainer = this.add.container(WAX_CX, WAX_CY).setDepth(10);
    this.waxGfx = this.add.graphics();
    this.waxSheenGfx = this.add.graphics();
    this.waxContainer.add([this.waxGfx, this.waxSheenGfx]);

    this.signetRing = this.add.container(WAX_CX, WAX_CY - 110).setDepth(19).setAlpha(0);
    const ringG = this.add.graphics();
    ringG.lineStyle(2.5, C_COPPER, 1);
    ringG.strokeCircle(0, 0, 12);
    ringG.fillStyle(C_COPPER, 0.3);
    ringG.fillCircle(0, 0, 8);
    const ringFace = this.add.text(0, 0, "S", { font: "bold 10px Georgia", color: HEX_COPPER }).setOrigin(0.5);
    this.signetRing.add([ringG, ringFace]);

    this._waxProgress = 0;
    this._waxUrgency = "safe";
    this._waxPulseAlpha = 1;
    this._lastSteamSpawn = 0;
  }

  _waxPolyPoints(cx, cy, radiusScale) {
    const pts = [];
    const n = 16;
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * Math.PI * 2;
      const r = (WAX_R + this._waxEdgeOffsets[i]) * radiusScale;
      pts.push(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r);
    }
    return pts;
  }

  updateWaxCooling(time) {
    if (!this.waxGfx) return;
    const progress = this._waxProgress || 0;
    const pulse = this._waxPulseAlpha !== undefined ? this._waxPulseAlpha : 1;
    this.waxGfx.clear();

    const basePts = this._waxPolyPoints(0, 0, 1);
    this.waxGfx.fillStyle(C_MAROON, 1);
    this.waxGfx.fillPoints(basePts, true);
    this.waxGfx.lineStyle(1, 0x2a0808, 0.6);
    this.waxGfx.strokePoints(basePts, true);

    const moltenScale = Math.max(0, 1 - progress);
    if (moltenScale > 0.02) {
      const wobble = this._waxUrgency === "warning" ? Math.sin(time * 0.006) * 2 : 0;
      const glowAlpha = this._waxUrgency === "critical" ? pulse : 1;
      const moltenPts = this._waxPolyPoints(wobble, 0, moltenScale);
      this.waxGfx.fillStyle(C_RED, 0.95 * glowAlpha);
      this.waxGfx.fillPoints(moltenPts, true);
      const glowPts = this._waxPolyPoints(wobble, 0, moltenScale * 0.55);
      this.waxGfx.fillStyle(C_WAX_GLOW, 0.35 * glowAlpha);
      this.waxGfx.fillPoints(glowPts, true);
    }
  }

  updateWaxUrgency(time) {
    if (this._waxProgress === undefined) return;
    const rem = 1 - this._waxProgress;
    const state = rem <= 0.15 ? "critical" : rem <= 0.33 ? "warning" : "safe";
    if (state === this._waxUrgency) return;
    this._waxUrgency = state;
    if (state === "critical") this._startWaxPulse(); else this._stopWaxPulse();
  }

  _startWaxPulse() {
    if (this._waxPulseTween) return;
    const obj = { v: 1 };
    this._waxPulseTween = this.tweens.add({ targets: obj, v: 0.4, duration: 260, yoyo: true, repeat: -1, onUpdate: () => { this._waxPulseAlpha = obj.v; } });
  }

  _stopWaxPulse() {
    if (this._waxPulseTween) { this._waxPulseTween.stop(); this._waxPulseTween = null; }
    this._waxPulseAlpha = 1;
  }

  updateWaxSheen(time) {
    if (!this.waxSheenGfx) return;
    const progress = this._waxProgress || 0;
    const moltenScale = Math.max(0, 1 - progress);
    this.waxSheenGfx.clear();
    if (moltenScale > 0.05) {
      const r = WAX_R * moltenScale * 0.5;
      this.waxSheenGfx.fillStyle(0xe8eaf6, 0.1 * moltenScale);
      this.waxSheenGfx.fillEllipse(-r * 0.3, -r * 0.6, r * 1.1, r * 0.5);
    }
  }

  updateSteamWisps(time) {
    if (this._waxHalted || this._waxUrgency !== "critical") return;
    if (time - (this._lastSteamSpawn || 0) < 260) return;
    this._lastSteamSpawn = time;
    this.spawnSteamWisp();
  }

  spawnSteamWisp() {
    const x = WAX_CX + Phaser.Math.Between(-14, 14);
    const wisp = this.add.circle(x, WAX_CY - 10, 1.5, 0xe8eaf6, 0.4).setDepth(16);
    this.tweens.add({ targets: wisp, y: wisp.y - 26, x: wisp.x + Phaser.Math.Between(-6, 6), alpha: 0, duration: 700, ease: "Sine.easeOut", onComplete: () => wisp.destroy() });
  }

  startWaxCooling(timeLimitMs) {
    this._killWaxTween();
    this.roundTimeLimit = timeLimitMs;
    this._waxProgress = 0;
    this._waxHalted = false;
    this._waxUrgency = "safe";
    this._stopWaxPulse();
    this.signetRing.setPosition(WAX_CX, WAX_CY - 110).setAlpha(0);

    this.waxContainer.setScale(0.3).setAlpha(0.6);
    this.tweens.add({ targets: this.waxContainer, scale: 1, alpha: 1, duration: 300, ease: "Back.easeOut" });
    for (let i = 0; i < 4; i++) {
      const d = this.add.circle(WAX_CX + Phaser.Math.Between(-30, 30), WAX_CY + Phaser.Math.Between(-30, 30), 2, C_RED, 0.7).setDepth(16);
      this.tweens.add({ targets: d, alpha: 0, scale: 0, duration: 260, onComplete: () => d.destroy() });
    }

    const state = { v: 0 };
    this._waxTween = this.tweens.add({
      targets: state, v: 1, duration: timeLimitMs, ease: "Linear",
      onUpdate: () => { this._waxProgress = state.v; },
      onComplete: () => { if (this._alive && !this._waxHalted) this.onWaxTimeout(this._currentConfig); },
    });
  }

  _killWaxTween() {
    if (this._waxTween) { this._waxTween.stop(); this._waxTween = null; }
    this._stopWaxPulse();
  }

  async freezeWax() {
    this._waxHalted = true;
    this._killWaxTween();
  }

  /** The signet ring descends, presses (a brief container squish stands
   * in for per-vertex wax deformation), then lifts to reveal the
   * green ✓ / red ✗ imprint in the seal's center. */
  async pressSignetRing(correct) {
    const ring = this.signetRing;
    ring.setPosition(WAX_CX, WAX_CY - 110).setAlpha(1);
    await new Promise((res) => { this.tweens.add({ targets: ring, y: WAX_CY, duration: 120, ease: "Quad.easeIn", onComplete: res }); });
    this.tweens.add({ targets: this.waxContainer, scaleY: 0.93, scaleX: 1.04, duration: 90, yoyo: true });
    this.screenShake(0.003, 90);
    await this.delay(100);
    const imprint = this.add.text(WAX_CX, WAX_CY, correct ? "✓" : "✗", { font: "bold 26px Georgia", color: correct ? HEX_GREEN_BRIGHT : HEX_RED }).setOrigin(0.5).setDepth(18).setAlpha(0);
    this.roundElements.push(imprint);
    this.tweens.add({ targets: imprint, alpha: 0.85, duration: 150 });
    await new Promise((res) => { this.tweens.add({ targets: ring, y: WAX_CY - 110, alpha: 0, duration: 160, delay: 80, onComplete: res }); });
  }

  /** Timeout path: the last molten core solidifies fast and a
   * "SEALED" stamp embosses into the wax. */
  async waxFullySet() {
    const state = { v: this._waxProgress || 0 };
    await new Promise((res) => { this.tweens.add({ targets: state, v: 1, duration: 200, onUpdate: () => { this._waxProgress = state.v; }, onComplete: res }); });
    this._stopWaxPulse();
    const sealed = this.add.text(WAX_CX, WAX_CY, "SEALED", { font: "bold 12px Georgia", color: HEX_CREAM }).setOrigin(0.5).setDepth(18).setAlpha(0);
    this.roundElements.push(sealed);
    this.tweens.add({ targets: sealed, alpha: 0.4, duration: 200 });
    await this.delay(200);
  }

  /** Wave-transition / next-round reset: melts a fresh blob back to
   * progress 0 (the next startWaxCooling call re-pours it). */
  async remeltWax() {
    const state = { v: this._waxProgress || 0 };
    await new Promise((res) => {
      this.tweens.add({ targets: state, v: 0, duration: 450, ease: "Sine.easeInOut", onUpdate: () => { this._waxProgress = state.v; }, onComplete: res });
    });
    this._stopWaxPulse();
    this._waxUrgency = "safe";
  }

  // ══════════════════════════════════════════════════════════════
  // MINI TRIPLE APPARATUS — compact Integer Furnace (top-left) +
  // Decimal Crucible (top-right) + Inscription Press (bottom,
  // centered), at 35% scale. Whichever instrument actually runs
  // glows; the other two dim. Reused choreography from L75's mini
  // dual apparatus for the furnace/crucible; the press is new — and,
  // like L77's full-size press, has NO validation gate (valueOf never
  // fails).
  // ══════════════════════════════════════════════════════════════

  createMiniTripleApparatus() {
    const drawFrame = (x0, x1, y0, y1, label, colorHex, labelHex) => {
      const g = this.add.graphics().setDepth(10);
      g.lineStyle(1.5, colorHex, 0.5);
      g.strokeRoundedRect(x0, y0, x1 - x0, y1 - y0, 4);
      const t = this.add.text((x0 + x1) / 2, y0 - 10, label, { font: "bold 9px Georgia", color: labelHex }).setOrigin(0.5).setDepth(11).setAlpha(0.5);
      return { g, t };
    };
    this._mfFrame = drawFrame(MF_X0, MF_X1, MINI_TOP_Y0, MINI_TOP_Y1, "INTEGER FURNACE", C_COPPER, HEX_COPPER);
    this._mcFrame = drawFrame(MC_X0, MC_X1, MINI_TOP_Y0, MINI_TOP_Y1, "DECIMAL CRUCIBLE", C_ORANGE, HEX_ORANGE);
    this._mpFrame = drawFrame(MP_X0, MP_X1, MINI_BOT_Y0, MINI_BOT_Y1, "INSCRIPTION PRESS", C_CREAM, HEX_CREAM);

    this.mfDynamicLayer = this.add.container(0, 0).setDepth(20);
    this.mcDynamicLayer = this.add.container(0, 0).setDepth(20);
    this.mpDynamicLayer = this.add.container(0, 0).setDepth(20);

    const mfCx = (MF_X0 + MF_X1) / 2, mcCx = (MC_X0 + MC_X1) / 2, mpCx = (MP_X0 + MP_X1) / 2;
    this._mfGate = this.add.rectangle(mfCx, MINI_TOP_Y0 + 55, MF_X1 - MF_X0 - 30, 3, C_RED, 0).setDepth(14);
    this._mcGate = this.add.rectangle(mcCx, MINI_TOP_Y0 + 55, MC_X1 - MC_X0 - 30, 3, C_RED, 0).setDepth(14);

    this._mfContText = this.add.text(mfCx, MINI_TOP_Y1 - 12, "int —", { font: "bold 10px Courier New", color: HEX_GRAY }).setOrigin(0.5).setDepth(12);
    this._mcContText = this.add.text(mcCx, MINI_TOP_Y1 - 12, "double —", { font: "bold 10px Courier New", color: HEX_GRAY }).setOrigin(0.5).setDepth(12);
    this._mpContText = this.add.text(mpCx, MINI_BOT_Y1 - 12, "String —", { font: "bold 10px Courier New", color: HEX_GRAY }).setOrigin(0.5).setDepth(12);
  }

  clearMiniApparatus() {
    this.mfDynamicLayer.removeAll(true);
    this.mcDynamicLayer.removeAll(true);
    this.mpDynamicLayer.removeAll(true);
    this._mfGate.setAlpha(0);
    this._mcGate.setAlpha(0);
    this._mfContText.setText("int —").setColor(HEX_GRAY);
    this._mcContText.setText("double —").setColor(HEX_GRAY);
    this._mpContText.setText("String —").setColor(HEX_GRAY);
    this.dimMiniInstrument("furnace");
    this.dimMiniInstrument("crucible");
    this.dimMiniInstrument("press");
  }

  _miniFrame(which) { return which === "furnace" ? this._mfFrame : which === "crucible" ? this._mcFrame : this._mpFrame; }

  activateMiniInstrument(which) {
    this.dimAllMiniInstruments();
    const frame = this._miniFrame(which);
    this.tweens.add({ targets: [frame.g, frame.t], alpha: 1, duration: 200 });
  }

  dimAllMiniInstruments() {
    ["furnace", "crucible", "press"].forEach((w) => this.dimMiniInstrument(w));
  }

  dimMiniInstrument(which) {
    const frame = this._miniFrame(which);
    this.tweens.add({ targets: [frame.g, frame.t], alpha: 0.3, duration: 200 });
  }

  _miniStrip(layer, cx, cy, value) {
    const strip = this.add.container(cx, cy).setAlpha(0);
    const bg = this.add.graphics();
    const w = Math.max(30, value.length * 6 + 8), h = 12;
    bg.fillStyle(0xe0d6c8, 1);
    bg.lineStyle(1, 0x8a6435, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 2);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 2);
    const txt = this.add.text(0, 0, value, { font: "bold 9px Courier New", color: "#241a0e" }).setOrigin(0.5);
    if (txt.width > w - 4) txt.setFontSize(5);
    strip.add([bg, txt]);
    layer.add(strip);
    this.tweens.add({ targets: strip, alpha: 1, duration: 100 });
    return strip;
  }

  /** Honest mini-furnace attempt: digits/leading-sign GREEN, anything
   * else RED — no amber, the furnace has no decimal-point special
   * case. */
  async runMiniFurnaceConversion(strValue) {
    this.activateMiniInstrument("furnace");
    const cx = (MF_X0 + MF_X1) / 2;
    const strip = this._miniStrip(this.mfDynamicLayer, cx, MINI_TOP_Y0 + 14, strValue);
    await this.delay(120);
    await new Promise((res) => { this.tweens.add({ targets: strip, y: MINI_TOP_Y0 + 55, duration: 140, onComplete: res }); });

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
      const spot = this.add.circle(startX + i * 8, MINI_TOP_Y0 + 55, 3, isValidChar ? C_GREEN_BRIGHT : C_RED, 0.5).setDepth(21);
      this.mfDynamicLayer.add(spot);
      this.tweens.add({ targets: spot, alpha: 0, duration: 200, delay: 90 });
      await this.delay(80);
    }

    if (!valid) {
      this._mfGate.setFillStyle(C_RED, 0.9).setAlpha(1);
      this.screenShake(0.004, 150);
      this.tweens.add({ targets: strip, alpha: 0, y: strip.y - 20, duration: 150, onComplete: () => strip.destroy() });
      await this.delay(200);
      const nfe = this.add.text(cx, MINI_TOP_Y0 + 100, "NFE", { font: "bold 12px Courier New", color: HEX_RED }).setOrigin(0.5).setDepth(22).setAlpha(0);
      this.mfDynamicLayer.add(nfe);
      this.tweens.add({ targets: nfe, alpha: 1, duration: 120 });
      await this.delay(500);
      this._mfContText.setText("✗").setColor(HEX_RED);
      return { ok: false, crash: "nfe" };
    }

    const value = parseInt(strValue, 10);
    await new Promise((res) => { this.tweens.add({ targets: strip, y: MINI_TOP_Y0 + 85, duration: 130, onComplete: res }); });
    strip.destroy();
    const bar = this.add.container(cx, MINI_TOP_Y0 + 85).setAlpha(0).setScale(0.6);
    const bg = this.add.graphics();
    const w = Math.max(30, String(value).length * 7 + 8), h = 14;
    bg.fillStyle(C_COPPER, 1);
    bg.lineStyle(1, 0x8a6435, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 3);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 3);
    const txt = this.add.text(0, 0, String(value), { font: "bold 9px Courier New", color: "#241a0e" }).setOrigin(0.5);
    bar.add([bg, txt]);
    this.mfDynamicLayer.add(bar);
    this.tweens.add({ targets: bar, alpha: 1, scale: 1, duration: 120, ease: "Back.easeOut" });
    await this.delay(140);
    this.tweens.add({ targets: bar, y: MINI_TOP_Y1 - 12, alpha: 0, duration: 160, onComplete: () => bar.destroy() });
    this._mfContText.setText(`int ${value}`).setColor(HEX_GOLD);
    await this.delay(120);
    return { ok: true, value, type: "int" };
  }

  /** Honest mini-crucible attempt: digits/sign GREEN, ONE dot AMBER,
   * anything else RED. */
  async runMiniCrucibleConversion(strValue) {
    this.activateMiniInstrument("crucible");
    const cx = (MC_X0 + MC_X1) / 2;
    const trimmed = strValue.trim();
    const strip = this._miniStrip(this.mcDynamicLayer, cx, MINI_TOP_Y0 + 14, strValue);
    await this.delay(120);
    await new Promise((res) => { this.tweens.add({ targets: strip, y: MINI_TOP_Y0 + 55, duration: 140, onComplete: res }); });

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
      const color = kind === "green" ? C_GREEN_BRIGHT : kind === "amber" ? C_ORANGE : C_RED;
      const spot = this.add.circle(startX + i * 8, MINI_TOP_Y0 + 55, 3, color, 0.5).setDepth(21);
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
      const nfe = this.add.text(cx, MINI_TOP_Y0 + 100, "NFE", { font: "bold 12px Courier New", color: HEX_RED }).setOrigin(0.5).setDepth(22).setAlpha(0);
      this.mcDynamicLayer.add(nfe);
      this.tweens.add({ targets: nfe, alpha: 1, duration: 120 });
      await this.delay(500);
      this._mcContText.setText("✗").setColor(HEX_RED);
      return { ok: false, crash: "nfe" };
    }

    const value = trimmed === "NaN" ? NaN : trimmed === "Infinity" ? Infinity : trimmed === "-Infinity" ? -Infinity : parseFloat(trimmed);
    await new Promise((res) => { this.tweens.add({ targets: strip, y: MINI_TOP_Y0 + 85, alpha: 0, duration: 200, onComplete: res }); });
    strip.destroy();
    const display = Number.isFinite(value) ? (Number.isInteger(value) ? `${value}.0` : String(value)) : String(value);
    const liquid = this.add.rectangle(cx, MINI_TOP_Y0 + 85, 40, 14, C_ORANGE, 0.5).setDepth(21).setScale(0, 1);
    this.mcDynamicLayer.add(liquid);
    this.tweens.add({ targets: liquid, scaleX: 1, duration: 150 });
    const valText = this.add.text(cx, MINI_TOP_Y0 + 85, display, { font: "bold 9px Courier New", color: "#241a0e" }).setOrigin(0.5).setDepth(22).setAlpha(0);
    this.mcDynamicLayer.add(valText);
    this.tweens.add({ targets: valText, alpha: 1, duration: 150 });
    await this.delay(200);
    this.tweens.add({ targets: [liquid, valText], y: "+=" + (MINI_TOP_Y1 - 12 - (MINI_TOP_Y0 + 85)), alpha: 0, duration: 180 });
    await this.delay(150);
    this._mcContText.setText(`double ${display}`).setColor(HEX_ORANGE);
    await this.delay(100);
    return { ok: true, value, type: "double" };
  }

  /** Honest mini-press attempt: no gate, ever — valueOf/Boolean.toString
   * never fail. A type-tinted input chip descends, the arm thunks,
   * and a paper strip carrying the String representation emerges. */
  async runMiniPress(value, type, strRepr) {
    this.activateMiniInstrument("press");
    const cx = (MP_X0 + MP_X1) / 2;
    const topY = MINI_BOT_Y0 + 16, midY = MINI_BOT_Y0 + 60, botY = MINI_BOT_Y1 - 12;

    const typeColor = type === "int" ? C_GOLD : type === "double" ? C_ORANGE : type === "boolean" ? (value ? C_CYAN : C_RED) : type === "char" ? C_BLUE_GRAY : C_CREAM;
    const inputDisplay = type === "String" ? `"${value}"` : String(value);
    const chip = this.add.container(cx, topY).setAlpha(0);
    const chipBg = this.add.graphics();
    const cw = Math.max(26, inputDisplay.length * 6 + 8), ch = 12;
    chipBg.fillStyle(typeColor, 0.85);
    chipBg.lineStyle(1, 0x241a0e, 0.4);
    chipBg.fillRoundedRect(-cw / 2, -ch / 2, cw, ch, 2);
    chipBg.strokeRoundedRect(-cw / 2, -ch / 2, cw, ch, 2);
    const chipTxt = this.add.text(0, 0, inputDisplay, { font: "bold 9px Courier New", color: "#1a1408" }).setOrigin(0.5);
    if (chipTxt.width > cw - 4) chipTxt.setFontSize(5);
    chip.add([chipBg, chipTxt]);
    this.mpDynamicLayer.add(chip);
    this.tweens.add({ targets: chip, alpha: 1, duration: 100 });
    await this.delay(120);

    await new Promise((res) => { this.tweens.add({ targets: chip, y: midY, duration: 140, onComplete: res }); });

    const arm = this.add.rectangle(cx, midY - 24, MP_X1 - MP_X0 - 40, 5, C_COPPER, 0.9).setDepth(21).setAlpha(0);
    this.mpDynamicLayer.add(arm);
    this.tweens.add({ targets: arm, alpha: 1, duration: 60 });
    await new Promise((res) => { this.tweens.add({ targets: arm, y: midY - 6, duration: 90, ease: "Quad.easeIn", onComplete: res }); });
    this.screenShake(0.003, 80);
    this.tweens.add({ targets: chip, scaleY: 0.7, duration: 70, yoyo: true });
    await this.delay(80);
    this.tweens.add({ targets: arm, y: midY - 24, alpha: 0, duration: 100, onComplete: () => arm.destroy() });
    this.tweens.add({ targets: chip, alpha: 0, duration: 120, onComplete: () => chip.destroy() });
    await this.delay(100);

    const stripDisplay = `"${strRepr}"`;
    const strip = this._miniStrip(this.mpDynamicLayer, cx, midY, stripDisplay);
    this.tweens.add({ targets: strip, y: botY, duration: 160 });
    await this.delay(180);
    this.tweens.add({ targets: strip, alpha: 0, duration: 160 });
    this._mpContText.setText(`String ${stripDisplay}`).setColor(HEX_CREAM);
    await this.delay(100);
    return { ok: true, value: strRepr, type: "String" };
  }

  updateFurnaceGlow() {}

  // ══════════════════════════════════════════════════════════════
  // TRIAL SLATE — chalk-typed lines carry DIRECTION annotations
  // ("String → int", "int → String") beside each evaluation, wired
  // up for real this level (see header note on prior dead code).
  // ══════════════════════════════════════════════════════════════

  createTrialSlate() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0a0d18, 1);
    g.lineStyle(2, C_CREAM, 1);
    g.fillRoundedRect(SLATE_X, SLATE_Y, SLATE_W, SLATE_H, 8);
    g.strokeRoundedRect(SLATE_X, SLATE_Y, SLATE_W, SLATE_H, 8);
    this.add.text(SLATE_X + 10, SLATE_Y + 8, "TRIAL SLATE", { font: "bold 10px Georgia", color: HEX_CREAM }).setDepth(11);
    this.slateLines = this.add.container(0, 0).setDepth(11);
    this._slateY = SLATE_Y + 26;
    this.add.text(SLATE_X + 10, SLATE_Y + SLATE_H - 16, "returns:", { font: "11px Georgia", color: "#8a6435" }).setDepth(11);
    this.resultText = this.add.text(SLATE_X + 56, SLATE_Y + SLATE_H - 16, "—", { font: "bold 12px Courier New", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(11);
  }

  async chalkWriteLine(text, color) {
    const t = this.add.text(SLATE_X + 10, this._slateY, "", { font: "bold 11px Courier New", color: color || "#e8eaf6" }).setDepth(11);
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
    this.resultText.setText(type).setColor(type === "double" ? HEX_ORANGE : type === "String" ? HEX_CREAM : HEX_GOLD);
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
    this.add.text(SHELF_X + 10, SHELF_Y + 6, "VARIABLES", { font: "bold 10px Georgia", color: HEX_CREAM }).setDepth(11);
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
      const color = v.type === "String" ? HEX_CREAM : v.type === "double" ? HEX_ORANGE : v.type === "boolean" ? HEX_CYAN : v.type === "char" ? HEX_BLUE_GRAY : HEX_GOLD;
      const t = this.add.text(SHELF_X + 10, y, text, { font: "bold 7.5px Courier New", color }).setOrigin(0, 0.5);
      this.shelfContainer.add(t);
      idx++;
      if (idx >= 5) break;
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

    this.add.text(20, 14, "THE INSCRIPTION TRIALS", { font: "bold 16px Georgia", color: "#b0bec5" }).setDepth(50);
    this.add.text(20, 32, "Tuning Phase — Type Conversion: valueOf()", { font: "12px Arial", color: "#546e7a" }).setDepth(50);

    this.waveText = this.add.text(640, 18, "WAVE 1 / 3", { font: "bold 16px Georgia", color: HEX_GOLD }).setOrigin(0.5).setDepth(50);
    this._waveSquares = [];
    for (let i = 0; i < 5; i++) {
      const sq = this.add.rectangle(640 - 44 + i * 22, 42, 10, 10, 0x2a2f36).setDepth(50).setStrokeStyle(1, 0x546e7a);
      this._waveSquares.push(sq);
    }

    this.add.text(1060, 8, "SCORE", { font: "11px Arial", color: "#546e7a" }).setDepth(50);
    this.scoreText = this.add.text(1060, 20, "0", { font: "bold 19px Arial", color: "#ffffff" }).setDepth(50);
    this.comboText = this.add.text(1060, 42, "×1", { font: "bold 14px Arial", color: HEX_GOLD }).setDepth(50);

    this.lifeIcons = [];
    for (let i = 0; i < 3; i++) {
      const lg = this.add.graphics({ x: 1150 + i * 26, y: 24 }).setDepth(50);
      lg.fillStyle(C_CREAM, 0.85);
      lg.fillRect(-5, -6, 10, 10);
      lg.lineStyle(1.2, C_COPPER, 1);
      lg.strokeRect(-5, -6, 10, 10);
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
  // BIT — SEAL MASTER VARIANT (brass signet ring + wax stick)
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
    lensG.lineStyle(1.2, C_CREAM, 0.7);
    lensG.strokeCircle(-6, 0, 5);
    lensG.strokeCircle(6, 0, 5);
    lensG.lineBetween(-1, 0, 1, 0);
    lensG.fillStyle(C_CREAM, 0.15);
    lensG.fillCircle(-6, 0, 4.5);
    lensG.fillCircle(6, 0, 4.5);
    lenses.add(lensG);

    // brass signet ring on left hand
    this.bitRing = this.add.container(-16, 10);
    const ringG = this.add.graphics();
    ringG.lineStyle(1.3, C_COPPER, 0.9);
    ringG.strokeCircle(0, 0, 5);
    const ringFace = this.add.text(0, 0, "S→", { font: "bold 6px Georgia", color: HEX_COPPER }).setOrigin(0.5);
    this.bitRing.add([ringG, ringFace]);

    // wax stick, red fading to burned dark-red tip, on right hand
    this.waxStick = this.add.container(17, 6);
    const stickG = this.add.graphics();
    stickG.lineStyle(2, C_RED, 0.9);
    stickG.lineBetween(0, 8, 3, -10);
    stickG.fillStyle(C_MAROON, 0.8);
    stickG.fillCircle(3, -11, 2.5);
    this.waxStick.add(stickG);

    c.add([g, frock, coat, eye, pupil, lenses, this.bitRing, this.waxStick, tip]);
    this.tweens.add({ targets: tip, alpha: 0.3, duration: 850, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: c, y: "+=3", duration: 1650, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
    this.bit = c;
  }

  bitSay(text) {
    this.hideBubble();
    const inner = this.add.text(0, 0, text, { font: "15px Arial", color: "#e0e0e0", wordWrap: { width: 340 } });
    const bw = Math.min(inner.width, 340) + 30, bh = inner.height + 24;
    inner.setText("");
    const bx = Phaser.Math.Clamp(this.bit.x + 40, 20, W - bw - 20);
    const by = Phaser.Math.Clamp(this.bit.y - bh - 20, 80, H - bh - 20);
    const c = this.add.container(bx, by).setDepth(61).setAlpha(0).setScale(0.7);
    const g = this.add.graphics();
    g.fillStyle(0x1a1a2e, 0.97);
    g.fillRoundedRect(0, 0, bw, bh, 10);
    g.lineStyle(1.5, C_CREAM, 1);
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
    await this.bitSay("The Inscription Trials, Seal Master — every conversion verdict timed against the cooling wax. The seal starts molten; answer before it sets. Which direction? Which instrument? Which type emerges? The triangle is your map.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(5000)]); if (!A()) return;
    this.hideBubble();

    this.showTrialOnOrder(['String s = String.valueOf(77);'], "What is stored in s?");
    this._currentConfig = { revealNote: null };
    this.startWaxCooling(7000);
    await this.runMiniPress(77, "int", "77");
    if (!A()) return;
    const a1 = this.createAnnotation(ORDER_CX, ORDER_Y1 + 14, "the inscription", HEX_BLUE_GRAY);
    const a2 = this.createAnnotation(WAX_CX, WAX_CY + 100, "your time, cooling", HEX_BLUE_GRAY);
    const a3 = this.createAnnotation((MF_X0 + MC_X1) / 2, MINI_TOP_Y0 - 24, "all three instruments, one verdict", HEX_BLUE_GRAY);
    await this.bitSay("Press the signet before the wax sets. The first seal is poured!");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();
    [a1, a2, a3].forEach((a) => a.destroy());
    this._killWaxTween();
    this.clearOrderContent();
    this.wipeSlate();
    this.clearMiniApparatus();
    this.clearContainerShelf();
    this._waxProgress = 0;
    this.updateWaxCooling(0);

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
      1: "WAVE 1 — RAPID INSCRIPTIONS",
      2: "WAVE 2 — THE DIRECTION TRIANGLE",
      3: "WAVE 3 — DEEP TRACES & BUG HUNT",
    };
    await this.showWaveBanner(banners[waveNumber]);
    if (!this._alive) return;
    if (waveNumber === 2) {
      await this.showBitFeedback("The full triangle at speed now, Scribe. parseInt goes DOWN (String to int); parseDouble goes DOWN (String to double); valueOf goes UP (anything to String). Each trial this wave crosses the triangle. Read the direction before the wax sets.");
    } else if (waveNumber === 3) {
      await this.showBitFeedback("Final seals — traces through the triangle and two programs where the direction went wrong. One used valueOf where parse was needed; one concatenated where it should have added. The wax won't wait for second thoughts.");
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
    const t = this.add.text(0, 0, text, { font: "bold 17px Georgia", color: HEX_GOLD }).setOrigin(0.5);
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

    this.startWaxCooling(limit);
  }

  clearRound() {
    this.roundElements.forEach((e) => { if (e && e.destroy) e.destroy(); });
    this.roundElements = [];
    this._bugHuntTokenObjs = [];
    if (this._bugHeaderTween) { this._bugHeaderTween.stop(); this._bugHeaderTween = null; }
  }

  async onWaxTimeout(config) {
    if (this.gameEnded) return;
    this._waxHalted = true;
    this._stopWaxPulse();
    this.inputLocked = true;
    this.roundElements.forEach((e) => e.disableInteractive && e.disableInteractive());
    (this._bugHuntTokenObjs || []).forEach((t) => t.disableInteractive());
    this.logAttempt(config, false, null, "timeout", this.roundTimeLimit, 1);
    await this.waxFullySet();
    if (!this._alive) return;
    await this.stampOrder("void");
    if (!this._alive) return;
    if (config.type === "bughunt") await this.runDualFutureReveal(config);
    else await this.runReveal(config);
    if (!this._alive) return;
    if (config.revealNote) this.createFloatingText(ORDER_CX, ORDER_Y1 + 40, config.revealNote, HEX_GRAY, "12px Arial", 2800);
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
    this.showTrialOnOrder(lines, config.question);
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
      draw(C_CREAM);
      const label = opt.label || opt.value;
      const txt = this.add.text(0, 0, label, { font: "bold 13px Courier New", color: "#e8eaf6", wordWrap: { width: w - 16 }, align: "center" }).setOrigin(0.5);
      if (txt.height > h - 8) txt.setFontSize(9);
      c.add([g, txt]);
      c.setSize(w, h);
      c.setInteractive({ useHandCursor: true });
      c.on("pointerover", () => { if (!this.inputLocked) draw(C_GOLD); });
      c.on("pointerout", () => { if (!this.inputLocked) draw(C_CREAM); });
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
    await this.freezeWax();
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

    await this.pressSignetRing(correct);
    if (!this._alive) return;
    await this.runReveal(config);
    if (!this._alive) return;
    await this.stampOrder(correct ? "certified" : "misjudged");
    if (!this._alive) return;
    if (config.revealNote) this.createFloatingText(ORDER_CX, ORDER_Y1 + 40, config.revealNote, HEX_GRAY, "12px Arial", 2800);
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
    this.clearOrderContent();
    this.orderHeaderText.setText(`INSCRIPTION ORDER — SEAL ${this.currentRound + 1}`);
    const header = this.add.text(ORDER_CX, ORDER_Y0 + 36, "CLICK THE BUG", { font: "bold 14px Georgia", color: "#c62828" }).setOrigin(0.5);
    this.orderContentContainer.add(header);
    this._bugHeaderTween = this.tweens.add({ targets: header, alpha: 0.5, duration: 450, yoyo: true, repeat: -1 });

    this._bugHuntTokenObjs = [];
    const maxLen = Math.max(...config.lines.map((l) => l.length));
    const fontSize = maxLen > 36 ? 9 : 11;
    const startY = ORDER_Y0 + 62;
    const measure = (t, fs) => { const tmp = this.add.text(0, 0, t, { font: `bold ${fs}px Courier New` }); const w = tmp.width; tmp.destroy(); return w; };

    config.lines.forEach((line, li) => {
      const y = startY + li * (fontSize + 9);
      if (line.trim().startsWith("//")) {
        const t = this.add.text(ORDER_CX, y, line, { font: `italic ${fontSize}px Courier New`, color: HEX_COPPER }).setOrigin(0.5);
        this.orderContentContainer.add(t);
        return;
      }
      const isFaultLine = li + 1 === config.faultLine;
      const isPhrase = isFaultLine && (config.faultToken.includes(" ") || config.faultToken.includes("("));

      if (isPhrase) {
        const idx = line.indexOf(config.faultToken);
        const pre = line.slice(0, idx), phrase = line.slice(idx, idx + config.faultToken.length), post = line.slice(idx + config.faultToken.length);
        const preTokens = pre ? this._codeTokenize(pre) : [];
        const postTokens = post ? this._codeTokenize(post) : [];
        const preW = preTokens.reduce((a, tk) => a + measure(tk.t, fontSize), 0);
        const phraseW = measure(phrase, fontSize);
        const postW = postTokens.reduce((a, tk) => a + measure(tk.t, fontSize), 0);
        let x = ORDER_CX - (preW + phraseW + postW) / 2;
        preTokens.forEach((tok) => { const w = measure(tok.t, fontSize); const t = this.add.text(x, y, tok.t, { font: `bold ${fontSize}px Courier New`, color: tok.c }).setOrigin(0, 0.5); this.orderContentContainer.add(t); x += w; });
        const bugT = this.add.text(x, y, phrase, { font: `bold ${fontSize}px Courier New`, color: "#e0a35a" }).setOrigin(0, 0.5);
        bugT.setData("isBug", true);
        bugT.setData("line", li + 1);
        const hitW = Math.max(phraseW + 6, 30), hitH = Math.max(fontSize + 8, 30);
        bugT.setInteractive(new Phaser.Geom.Rectangle(0, -hitH / 2, hitW, hitH), Phaser.Geom.Rectangle.Contains);
        this.orderContentContainer.add(bugT);
        bugT.on("pointerover", () => { if (!this.inputLocked) bugT.setColor(HEX_COPPER); });
        bugT.on("pointerout", () => { if (!this.inputLocked) bugT.setColor("#e0a35a"); });
        bugT.on("pointerdown", () => { if (this.inputLocked) return; this.inputLocked = true; this.onTokenClicked(bugT, config, y); });
        this._bugHuntTokenObjs.push(bugT);
        x += phraseW;
        postTokens.forEach((tok) => { const w = measure(tok.t, fontSize); const t = this.add.text(x, y, tok.t, { font: `bold ${fontSize}px Courier New`, color: tok.c }).setOrigin(0, 0.5); this.orderContentContainer.add(t); x += w; });
        return;
      }

      const tokens = this._codeTokenize(line);
      const measured = tokens.map((tk) => measure(tk.t, fontSize));
      const totalW = measured.reduce((a, b) => a + b, 0);
      let x = ORDER_CX - totalW / 2;
      tokens.forEach((tok, ti) => {
        const w = measured[ti];
        const isBug = isFaultLine && tok.t === config.faultToken;
        const t = this.add.text(x + w / 2, y, tok.t, { font: `bold ${fontSize}px Courier New`, color: tok.c }).setOrigin(0.5);
        t.setData("isBug", isBug);
        t.setData("line", li + 1);
        const hitW = Math.max(w + 6, 30), hitH = Math.max(fontSize + 8, 30);
        t.setInteractive(new Phaser.Geom.Rectangle(-hitW / 2, -hitH / 2, hitW, hitH), Phaser.Geom.Rectangle.Contains);
        this.orderContentContainer.add(t);
        t.on("pointerover", () => { if (!this.inputLocked) t.setColor(HEX_COPPER); });
        t.on("pointerout", () => { if (!this.inputLocked) t.setColor(tok.c); });
        t.on("pointerdown", () => { if (this.inputLocked) return; this.inputLocked = true; this.onTokenClicked(t, config, y); });
        this._bugHuntTokenObjs.push(t);
        x += w;
      });
    });
    this.inputLocked = false;
  }

  async onTokenClicked(tokenObj, config, lineY) {
    await this.freezeWax();
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
      this.orderContentContainer.add(strike);
      if (config.fix) {
        const fixT = this.add.text(ORDER_CX, lineY - 14, config.fix, { font: "bold 12px Courier New", color: "#2e7d32", wordWrap: { width: 380 } }).setOrigin(0.5).setAlpha(0);
        this.orderContentContainer.add(fixT);
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

    await this.pressSignetRing(correct);
    if (!this._alive) return;
    await this.runDualFutureReveal(config);
    if (!this._alive) return;
    await this.stampOrder(correct ? "certified" : "misjudged");
    if (!this._alive) return;
    if (config.revealNote) this.createFloatingText(ORDER_CX, ORDER_Y1 + 40, config.revealNote, HEX_GRAY, "12px Arial", 2800);
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

  /** Dual-future reveal, specialized for this level's two bug shapes.
   * "wrong_direction" (R14): the buggy future routes to the mini press
   * (String.valueOf on an already-String is a no-op), then a String*2
   * compile error; the fixed future routes to the mini furnace
   * (parseInt), then real int arithmetic. "concat_not_addition" (R15):
   * the buggy future stamps both operands to Strings BEFORE combining
   * them (glue, "2030"); the fixed future adds them as ints FIRST,
   * then stamps the sum once ("50"). Both narrate through the slate
   * since the point is the ORDER of operations, not a single
   * instrument's internal mechanics. */
  async runDualFutureReveal(config) {
    if (config.tokenRegion === "wrong_direction") {
      await this.runMiniPress("50", "String", "50");
      await this.delay(250);
      if (!this._alive) return;
      await this.chalkWriteLine('doubled = "50" * 2', "#e8eaf6");
      this.showCompileErrorStamp();
      await this.delay(700);
      if (!this._alive) return;
      this.wipeSlate();
      this.clearMiniApparatus();
      this.clearContainerShelf();
      this.updateResultRow(null);
      const outcome = await this.runMiniFurnaceConversion("50");
      if (!this._alive) return;
      if (outcome.ok) {
        await this.chalkWriteLine("String → int", HEX_GOLD);
        await this.chalkWriteLine("doubled = 50 * 2 = 100", "#e8eaf6");
        await this.chalkWriteLine("prints: Doubled: 100", HEX_GREEN_BRIGHT);
      }
      return;
    }

    if (config.tokenRegion === "concat_not_addition") {
      await this.runMiniPress(20, "int", "20");
      await this.delay(180);
      if (!this._alive) return;
      this.clearMiniApparatus();
      await this.runMiniPress(30, "int", "30");
      await this.delay(180);
      if (!this._alive) return;
      await this.chalkWriteLine('result = "20" + "30" = "2030"', "#e8eaf6");
      await this.chalkWriteLine("prints: Sum: 2030", HEX_RED);
      await this.delay(700);
      if (!this._alive) return;
      this.wipeSlate();
      this.clearMiniApparatus();
      this.clearContainerShelf();
      this.updateResultRow(null);
      await this.chalkWriteLine("a + b = 50", "#e8eaf6");
      await this.delay(200);
      if (!this._alive) return;
      const outcome = await this.runMiniPress(50, "int", "50");
      if (!this._alive) return;
      if (outcome.ok) {
        await this.chalkWriteLine("int → String", HEX_CREAM);
        await this.chalkWriteLine("prints: Sum: 50", HEX_GREEN_BRIGHT);
      }
      return;
    }

    await this.runReveal(config.lines.filter((l) => !l.trim().startsWith("//")));
  }

  // ══════════════════════════════════════════════════════════════
  // HONEST EVALUATOR — merges L75's iterative left-to-right +/-/*//
  // splitters (needed for a*a+b*b and parseInt(price)*qty) with L77's
  // String.valueOf/char/boolean vocabulary, plus two additions new to
  // L78: a relational-operator split (100 > 50, for Round 13's
  // boolean declaration — no prior level ever assigned a comparison's
  // result to a variable) and a zero-arg String.length() instance
  // method call (Round 10 — no prior level ever called a method ON a
  // resolved value rather than on a conversion class). parseInt and
  // parseDouble both route through the mini furnace/crucible for an
  // honest visual (with the L77-established String-type gate before
  // an argument reaches either instrument); valueOf routes through
  // the mini press, which — like its full-size L77 counterpart — has
  // no gate at all.
  // ══════════════════════════════════════════════════════════════

  _splitRelational(expr) {
    let depth = 0, inQuotes = false;
    for (let i = 0; i < expr.length; i++) {
      const ch = expr[i];
      if (ch === '"' && expr[i - 1] !== "\\") inQuotes = !inQuotes;
      if (inQuotes) continue;
      if (ch === "(" || ch === "[") depth++;
      else if (ch === ")" || ch === "]") depth--;
      else if (depth === 0) {
        const two = expr.slice(i, i + 2);
        if (two === ">=" || two === "<=" || two === "==" || two === "!=") {
          return { left: expr.slice(0, i).trim(), op: two, right: expr.slice(i + 2).trim() };
        }
        if (ch === ">" || ch === "<") {
          return { left: expr.slice(0, i).trim(), op: ch, right: expr.slice(i + 1).trim() };
        }
      }
    }
    return null;
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
    if (type === "double") return Number.isInteger(value) ? `${value}.0` : String(value);
    return String(value);
  }

  async resolveExpr(expr, vars) {
    const t = expr.trim();

    const rel = this._splitRelational(t);
    if (rel) {
      const l = await this.resolveExpr(rel.left, vars);
      if (!l.ok) return l;
      const r = await this.resolveExpr(rel.right, vars);
      if (!r.ok) return r;
      const lv = Number(l.value), rv = Number(r.value);
      let result;
      if (rel.op === ">") result = lv > rv;
      else if (rel.op === "<") result = lv < rv;
      else if (rel.op === ">=") result = lv >= rv;
      else if (rel.op === "<=") result = lv <= rv;
      else if (rel.op === "==") result = lv === rv;
      else result = lv !== rv;
      return { ok: true, value: result, type: "boolean" };
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
          const accStr = accIsString ? String(accValue) : this._javaToString(accValue, accType);
          const partStr = partType === "String" ? String(partVal) : this._javaToString(partVal, partType);
          accValue = accStr + partStr;
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

    const valueOfMatch = t.match(/^String\.valueOf\((.+)\)$/);
    if (valueOfMatch) {
      const argRes = await this.resolveExpr(valueOfMatch[1].trim(), vars);
      if (!argRes.ok) return argRes;
      const strRepr = this._javaToString(argRes.value, argRes.type);
      await this.runMiniPress(argRes.value, argRes.type, strRepr);
      await this.chalkWriteLine(`${argRes.type} → String`, HEX_CREAM);
      this.updateResultRow("String");
      return { ok: true, value: strRepr, type: "String" };
    }

    const parseDoubleMatch = t.match(/^Double\.parseDouble\((.+)\)$/);
    if (parseDoubleMatch) {
      const argRes = await this.resolveExpr(parseDoubleMatch[1].trim(), vars);
      if (!argRes.ok) return argRes;
      if (argRes.type !== "String") {
        this.showCompileErrorStamp();
        return { ok: false, crash: "compile" };
      }
      const strVal = String(argRes.value);
      const outcome = await this.runMiniCrucibleConversion(strVal);
      if (!outcome.ok) { this.updateResultRow("crash"); return { ok: false, crash: "nfe" }; }
      await this.chalkWriteLine("String → double", HEX_ORANGE);
      this.updateResultRow("double");
      return { ok: true, value: outcome.value, type: "double" };
    }

    const parseIntMatch = t.match(/^Integer\.parseInt\((.+)\)$/);
    if (parseIntMatch) {
      const argRes = await this.resolveExpr(parseIntMatch[1].trim(), vars);
      if (!argRes.ok) return argRes;
      if (argRes.type !== "String") {
        this.showCompileErrorStamp();
        return { ok: false, crash: "compile" };
      }
      const strVal = String(argRes.value);
      const outcome = await this.runMiniFurnaceConversion(strVal);
      if (!outcome.ok) { this.updateResultRow("crash"); return { ok: false, crash: "nfe" }; }
      await this.chalkWriteLine("String → int", HEX_GOLD);
      this.updateResultRow("int");
      return { ok: true, value: outcome.value, type: "int" };
    }

    const lengthMatch = t.match(/^(\w+)\.length\(\)$/);
    if (lengthMatch) {
      const v = vars[lengthMatch[1]];
      if (!v || v.type !== "String") {
        this.showCompileErrorStamp();
        return { ok: false, crash: "compile" };
      }
      return { ok: true, value: v.value.length, type: "int" };
    }

    const staticCallMatch = t.match(/^(\w+)\.(\w+)\(/);
    if (staticCallMatch) {
      this.showCompileErrorStamp();
      return { ok: false, crash: "compile" };
    }

    if (t === "true" || t === "false") return { ok: true, value: t === "true", type: "boolean" };
    if (/^'.'$/.test(t)) return { ok: true, value: t[1], type: "char" };
    if (/^".*"$/.test(t)) return { ok: true, value: t.slice(1, -1), type: "String" };
    if (/^[+-]?\d+\.\d+$/.test(t)) return { ok: true, value: parseFloat(t), type: "double" };
    if (/^[+-]?\d+$/.test(t)) return { ok: true, value: parseInt(t, 10), type: "int" };

    if (vars[t] !== undefined) return { ok: true, value: vars[t].value, type: vars[t].type };

    return { ok: false, crash: "eval" };
  }

  async execStatement(line, vars) {
    const declVar = line.match(/^(int|double|String|boolean|char)\s+(\w+)\s*=\s*(.*);$/);
    if (declVar) {
      const varType = declVar[1], name = declVar[2], rhs = declVar[3].trim();
      const r = await this.resolveExpr(rhs, vars);
      if (!r.ok) return r;
      if (varType !== r.type) {
        this.showCompileErrorStamp();
        return { ok: false, crash: "compile" };
      }
      vars[name] = { value: r.value, type: varType, kind: "scalar" };
      this.updateContainerShelf(vars);
      return { ok: true };
    }

    const printMatch = line.match(/^System\.out\.println\((.*)\);$/);
    if (printMatch) {
      const r = await this.resolveExpr(printMatch[1].trim(), vars);
      if (!r.ok) return r;
      if (!this._printedLines) this._printedLines = [];
      const text = this._javaToString(r.value, r.type);
      this._printedLines.push(text);
      await this.chalkWriteLine(`▸ ${text}`, "#e8eaf6");
      return { ok: true };
    }

    return { ok: true };
  }

  async runStatements(lines, vars) {
    for (const raw of lines) {
      if (!this._alive) return { ok: true };
      const line = raw.trim();
      if (!line) continue;
      const r = await this.execStatement(line, vars);
      if (!r.ok) return r;
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

  showCompileErrorStamp() {
    const stamp = this.add.text(ORDER_CX, ORDER_Y0 - 22, "COMPILE ERROR", { font: "bold 18px Arial", color: HEX_RED }).setOrigin(0.5).setDepth(30).setScale(1.3).setAngle(-6).setAlpha(0);
    this.roundElements.push(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 150 });
    this.screenShake(0.004, 120);
    this.time.delayedCall(850, () => { if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 200, onComplete: () => stamp.destroy() }); });
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
    if (remaining > 0.6) { points += 50; this.fastBonusCount++; this.createFloatingText(ORDER_CX, ORDER_Y0 - 14, "⚡ HOT SEAL +50", HEX_GOLD, "bold 15px Arial", 900); }
    else if (remaining > 0.3) { points += 25; this.fastBonusCount++; this.createFloatingText(ORDER_CX, ORDER_Y0 - 14, "⚡ +25", HEX_GOLD, "bold 14px Arial", 800); }
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
      this.remeltWax().then(() => { if (this._alive && !this.gameEnded) this.startWave(nextConfig.wave); });
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
    this._killWaxTween();
    this.clearRound();
    this.hideBubble();

    (async () => {
      this.wipeSlate();
      this.clearMiniApparatus();
      this.clearContainerShelf();
      this._waxProgress = 1;
      this.updateWaxCooling(0);
      this._stopWaxPulse();
      const motes = this.ambient;
      this.ambient = null;
      (motes || []).forEach((m) => this.tweens.add({ targets: m, y: 632, alpha: 0, duration: 1500, ease: "Sine.easeIn" }));

      const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
      this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });
      const title = this.add.text(640, 240, "WAX SET", { font: "bold 36px Georgia", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
      this.tweens.add({ targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut", onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }) });
      this.add.text(640, 310, `Score: ${this.score}`, { font: "21px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
      this.add.text(640, 350, `Seals Inscribed: ${this.currentRound} / 15`, { font: "18px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);
      this._makeButton(525, 420, "REMELT THE WAX", 200, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
      this._makeButton(755, 420, "RETURN TO MENU", 200, 50, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.start("MenuScene"));
    })();
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this._killWaxTween();
    this.clearRound();
    this.hideBubble();

    try { GameManager.completeLevel(77, Math.round((this.correctFirstTry / 15) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("string_valueOf_tuned"); } catch (_) {}
    try {
      localStorage.setItem("level78_results", JSON.stringify({
        level: 78, concept: "string_valueOf", phase: "tuning",
        score: this.score, accuracy: this.correctFirstTry / 15, avgTimePct: this.totalTimePctUsed / 15,
        fastBonuses: this.fastBonusCount, comboMax: this.maxCombo, stars: this._starRating(),
        livesRemaining: this.lives, attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.sealsFinale().then(() => { if (this._alive) this.showScoreTally(); });
  }

  async sealsFinale() {
    await this.remeltWax();
    const state = { v: 0 };
    await new Promise((res) => {
      this.tweens.add({
        targets: state, v: 1, duration: 400, ease: "Sine.easeOut",
        onUpdate: () => {
          this._waxProgress = 0;
          this.waxGfx.clear();
          const basePts = this._waxPolyPoints(0, 0, 1);
          this.waxGfx.fillStyle(C_GOLD, state.v);
          this.waxGfx.fillPoints(basePts, true);
          this.waxGfx.lineStyle(1, 0x8a6a00, 0.6);
          this.waxGfx.strokePoints(basePts, true);
        },
        onComplete: res,
      });
    });
    await this.pressSignetRing(true);
    if (this._triangleGfx) this.tweens.add({ targets: this._triangleGfx, alpha: 1, duration: 300, yoyo: true, repeat: 2 });
    this.createConfetti(WAX_CX, WAX_CY, 40);
    this.createConfetti(ORDER_CX, (ORDER_Y0 + ORDER_Y1) / 2, 20);
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
    panel.lineStyle(2, C_CREAM, 1);
    panel.strokeRoundedRect(360, 145, 560, 430, 16);

    const title = this.add.text(640, 185, "SEALS MASTERED", { font: "bold 30px Georgia", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(91).setScale(0);
    this.tweens.add({ targets: title, scale: 1, duration: 350, ease: "Back.easeOut" });

    const acc = Math.round((this.correctFirstTry / 15) * 100);
    const avgSec = (this.totalTimeMs / 15 / 1000).toFixed(1);
    const lines = [
      `ACCURACY: ${acc}%`,
      `AVG RESPONSE: ${avgSec}s`,
      `HOT-SEAL BONUSES: ${this.fastBonusCount}`,
      `BEST COMBO: ×${this.getComboMultiplierFor(this.maxCombo)}`,
    ];
    lines.forEach((s, i) => {
      const t = this.add.text(500, 240 + i * 26, s, { font: "16px Arial", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
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
    bg.fillStyle(C_GOLD, 0.85);
    bg.fillCircle(0, 0, 14);
    bg.lineStyle(1, 0x8a6a00, 0.8);
    bg.strokeCircle(0, 0, 14);
    const badgeS = this.add.text(0, 0, "S", { font: "bold 13px Georgia", color: "#3a2a00" }).setOrigin(0.5);
    badge.add([bg, badgeS]);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 2100 });
    const badgeLbl = this.add.text(640, 520, "valueOf() SCHEMA TUNED", { font: "bold 15px Georgia", color: HEX_GOLD }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: badgeLbl, alpha: 1, duration: 300, delay: 2250 });

    this._makeButton(500, 555, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(770, 555, "NEXT: The Assay Bureau →", 260, 44, { fill: 0x00733a, stroke: C_GREEN_BRIGHT, textColor: "#ffffff" }, () => {
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
    const t = this.add.text(0, 0, label, { font: "bold 16px Arial", color: style.textColor }).setOrigin(0.5);
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
