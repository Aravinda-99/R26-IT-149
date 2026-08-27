/**
 * Level 72 — "The Smelting Trials" (Type Conversion Wing: Tuning Phase —
 * Integer.parseInt())
 * ===========================================================================
 * Tunes the Level 71 parseInt() schema through rapid-fire fluency trials.
 * A copper pressure gauge with a sweeping needle IS the timer — a linear
 * tween drives the needle from a green "full pressure" zone through amber
 * into a red critical wedge, exactly like the sand column of the
 * Replication Trials, re-skinned for the furnace.
 *
 * New fluency material:
 *  - EDGE-CASE NFE FLUENCY (Wave 2): empty string, embedded space, trailing
 *    sign, and the CRUCIAL new rule that Java 7+ accepts a LEADING '+'
 *    (unlike L71, which only ever tested a leading '-').
 *  - OVERFLOW AS NFE (Wave 2's capstone): a string of ALL valid digits
 *    ("9999999999") still throws NumberFormatException once the numeric
 *    VALUE exceeds Integer.MAX_VALUE (2147483647) — character validity
 *    and numeric range are two SEPARATE checks.
 *  - OPERATOR PRECEDENCE UNDER PARSEINT (Wave 3): "Total: " + parseInt(price)
 *    * qty — * binds tighter than the String +, so the multiplication
 *    resolves FIRST, then concatenates. The evaluator must split top-level
 *    + BEFORE checking for a top-level * (the reverse of L71's check
 *    order, which never needed to arbitrate between the two because L71
 *    had no mixed +/* expression).
 *  - THE UNGUARDED CONVERSION BUG HUNT (Wave 3's second bug): Scanner
 *    input fed straight into parseInt with no safety net — the bug isn't
 *    a token to swap, it's a MISSING try-catch (not yet taught), so the
 *    dual-future reveal runs the SAME source twice with different tape
 *    inputs ("twenty" crashes, "20" succeeds) to teach that the flaw is
 *    latent and input-dependent, not a one-line fix.
 * The evaluator reuses L71's honest cascade (real character-by-character
 * validation, real furnace choreography, real NumberFormatException),
 * extended with the leading-plus rule, overflow detection, and corrected
 * +/* precedence.
 */

import Phaser from "phaser";
import { GameManager } from "../../../../GameManager.js";
import { WellbeingAPI } from "../../../../../api/api.js";
import { BadgeSystem } from "../../../../BadgeSystem.js";

const W = 1280, H = 720;

const C_CYAN = 0x4fc3f7, C_GOLD = 0xffd740, C_ORANGE = 0xff9800, C_BLUE_GRAY = 0x8ea6c8;
const C_GREEN_BRIGHT = 0x00e676, C_RED = 0xf44336, C_GRAY = 0x78909c, C_COPPER = 0xb87333;
const HEX_CYAN = "#4fc3f7", HEX_GOLD = "#ffd740", HEX_ORANGE = "#ff9800", HEX_BLUE_GRAY = "#8ea6c8";
const HEX_GREEN_BRIGHT = "#00e676", HEX_RED = "#f44336", HEX_GRAY = "#78909c", HEX_COPPER = "#b87333";
const C_INDIGO = 0x3949ab, HEX_INDIGO = "#3949ab";

// Smelting ticket card
const CARD_X0 = 250, CARD_X1 = 730, CARD_Y0 = 100, CARD_Y1 = 430;
const CARD_CX = (CARD_X0 + CARD_X1) / 2;
// Pressure gauge (hero timer)
const GAUGE_CX = 830, GAUGE_CY = 190, GAUGE_R = 78;
// Mini conversion furnace (compact 55%-scale L71 furnace, 1.3x tempo)
const M_HOPPER_X0 = 970, M_HOPPER_X1 = 1090, M_HOPPER_Y0 = 100, M_HOPPER_Y1 = 130;
const M_GATE_X0 = 985, M_GATE_X1 = 1075, M_GATE_Y0 = 136, M_GATE_Y1 = 172;
const M_CHAMBER_X0 = 975, M_CHAMBER_X1 = 1085, M_CHAMBER_Y0 = 178, M_CHAMBER_Y1 = 232;
const M_FURNACE_CX = (M_HOPPER_X0 + M_HOPPER_X1) / 2;
const M_CONT_X = 1030, M_CONT_Y = 258;
// Mini assayer's slate
const SLATE_X = 955, SLATE_Y = 300, SLATE_W = 290, SLATE_H = 130;
// Variables panel
const VARS_X = 955, VARS_Y = 445, VARS_W = 290, VARS_H = 90;

const TUTORIAL_KEY = "level72_tutorial_done";
const WAVE_TIME = { 1: 8000, 2: 9000, 3: 10000 };
const INT_MAX = 2147483647, INT_MIN = -2147483648;

// ══════════════════════════════════════════════════════════════
// ROUND CONFIGURATION
// ══════════════════════════════════════════════════════════════
const ROUNDS = [
  // ══ WAVE 1 — Rapid Conversions (8s) ══
  { round: 1, wave: 1, type: "predict",
    source: 'int x = Integer.parseInt("256");',
    question: "What is stored in x?", correct: "256",
    options: [
      { value: "256", tag: null },
      { value: '"256"', tag: "parseInt_returns_string_belief", label: '"256" (String)' },
      { value: "nfe", tag: "valid_input_error_belief", label: "NumberFormatException" },
      { value: "0", tag: "parseInt_returns_zero_belief" },
    ],
    concept: "rapid_basic" },

  { round: 2, wave: 1, type: "predict",
    source: 'int x = Integer.parseInt("0");',
    question: "What is stored in x?", correct: "0",
    options: [
      { value: "0", tag: null },
      { value: "nfe", tag: "zero_string_error_belief", label: "NumberFormatException" },
      { value: "null", tag: "zero_string_null_belief" },
      { value: '"0"', tag: "parseInt_returns_string_belief", label: '"0" (String)' },
    ],
    concept: "rapid_zero" },

  { round: 3, wave: 1, type: "predict",
    source: 'int x = Integer.parseInt("-42");',
    question: "What is stored in x?", correct: "-42",
    options: [
      { value: "-42", tag: null },
      { value: "42", tag: "parseInt_strips_sign_belief" },
      { value: "nfe", tag: "negative_crashes_belief", label: "NumberFormatException" },
      { value: '"42"', tag: "parseInt_returns_string_belief", label: '"42" (String)' },
    ],
    concept: "rapid_negative" },

  { round: 4, wave: 1, type: "predict",
    source: 'int x = Integer.parseInt("abc");',
    question: "What happens?", correct: "nfe",
    options: [
      { value: "nfe", tag: null, label: "NumberFormatException" },
      { value: "compile_error", tag: "nfe_is_compile_error_belief", label: "COMPILE ERROR" },
      { value: "0", tag: "nfe_returns_zero_belief", label: "x = 0" },
      { value: "null", tag: "nfe_returns_null_belief", label: "x = null" },
    ],
    concept: "rapid_nfe" },

  { round: 5, wave: 1, type: "trace",
    source: 'String s = "50";\nint y = Integer.parseInt(s);\nSystem.out.println(y + 10);',
    question: "What prints?", correct: "60",
    options: [
      { value: "60", tag: null },
      { value: '"5010"', tag: "string_concat_belief", label: '"5010" (concat)' },
      { value: "5010", tag: "string_plus_int_confusion" },
      { value: "nfe", tag: "variable_input_error_belief", label: "NumberFormatException" },
    ],
    revealNote: "s smelts to 50 (an int); 50 + 10 = 60 — real arithmetic, not concatenation, because parseInt ran first.",
    concept: "rapid_expression" },

  // ══ WAVE 2 — The Edge Cases (9s) ══
  { round: 6, wave: 2, type: "predict",
    source: 'int x = Integer.parseInt("");',
    question: "What happens?", correct: "nfe",
    options: [
      { value: "nfe", tag: null, label: "NumberFormatException" },
      { value: "0", tag: "empty_string_zero_belief", label: "x = 0" },
      { value: "compile_error", tag: "nfe_is_compile_error_belief", label: "COMPILE ERROR" },
      { value: "null", tag: "nfe_returns_null_belief", label: "x = null" },
    ],
    revealNote: "An empty String has no digits at all — the furnace has nothing to smelt. NumberFormatException, not zero.",
    concept: "edge_empty" },

  { round: 7, wave: 2, type: "predict",
    source: 'int x = Integer.parseInt("12 34");',
    question: "What happens?", correct: "nfe",
    options: [
      { value: "nfe", tag: null, label: "NumberFormatException" },
      { value: "12", tag: "parseInt_stops_at_space_belief", label: "x = 12" },
      { value: "1234", tag: "parseInt_strips_spaces_belief", label: "x = 1234" },
      { value: "compile_error", tag: "nfe_is_compile_error_belief", label: "COMPILE ERROR" },
    ],
    revealNote: "The embedded space is not a digit. The furnace inspects EVERY character — one bad character anywhere fails the whole String, not just from that point on.",
    concept: "edge_embedded_space" },

  { round: 8, wave: 2, type: "predict",
    source: 'int x = Integer.parseInt("42-");',
    question: "What happens?", correct: "nfe",
    options: [
      { value: "nfe", tag: null, label: "NumberFormatException" },
      { value: "-42", tag: "trailing_sign_valid_belief", label: "x = -42" },
      { value: "42", tag: "trailing_sign_ignored_belief", label: "x = 42" },
      { value: "compile_error", tag: "nfe_is_compile_error_belief", label: "COMPILE ERROR" },
    ],
    revealNote: "A sign is only legal in the FIRST position. '42-' has the minus at the END — the furnace rejects it there, no matter how valid the digits before it were.",
    concept: "edge_trailing_sign" },

  { round: 9, wave: 2, type: "predict",
    source: 'int x = Integer.parseInt("+5");',
    question: "What is stored in x?", correct: "5",
    options: [
      { value: "5", tag: null },
      { value: "nfe", tag: "leading_plus_crashes_belief", label: "NumberFormatException" },
      { value: "compile_error", tag: "leading_plus_compile_belief", label: "COMPILE ERROR" },
      { value: '"+5"', tag: "parseInt_returns_string_belief", label: '"+5" (String)' },
    ],
    revealNote: "A leading '+' is legal too, just like '-' — the furnace accepts an explicit positive sign in the first position. x is a plain 5, the sign isn't kept in the value.",
    concept: "edge_leading_plus" },

  { round: 10, wave: 2, type: "predict",
    source: 'int x = Integer.parseInt("9999999999");',
    question: "What happens?", correct: "nfe",
    options: [
      { value: "nfe", tag: null, label: "NumberFormatException (overflow)" },
      { value: "9999999999", tag: "overflow_stores_anyway_belief", label: "x = 9999999999" },
      { value: "compile_error", tag: "nfe_is_compile_error_belief", label: "COMPILE ERROR" },
      { value: "-1410065409", tag: "overflow_wraps_silently_belief", label: "x = -1410065409 (silent wraparound)" },
    ],
    revealNote: "Every character is a valid digit — the gate opens, the strip burns clean. But the VALUE itself is too large: int's ceiling is 2,147,483,647. Ten digits overflows it, and the furnace throws NumberFormatException anyway. Character validity and numeric range are two SEPARATE checks.",
    concept: "edge_overflow" },

  // ══ WAVE 3 — Deep Traces & Bug Hunt (10-12s) ══
  { round: 11, wave: 3, type: "trace",
    source: 'String a = "3";\nString b = "7";\nSystem.out.println(a + b);\nSystem.out.println(Integer.parseInt(a) + Integer.parseInt(b));',
    question: "What prints (two lines)?", correct: "37\n10",
    options: [
      { value: "37\n10", tag: null, label: "37\n10" },
      { value: "10\n10", tag: "both_convert_belief", label: "10\n10" },
      { value: "37\n37", tag: "neither_converts_belief", label: "37\n37" },
      { value: "10\n37", tag: "lines_swapped_belief", label: "10\n37" },
    ],
    revealNote: "Line 1: unconverted, a + b concatenates text — '3' + '7' = '37'. Line 2: both smelted first — 3 + 7 = 10 — real addition. Same characters, two completely different results.",
    concept: "trace_concat_vs_convert" },

  { round: 12, wave: 3, type: "trace",
    source: 'String s = "100";\nint n = Integer.parseInt(s);\nn = n / 3;\nSystem.out.println(n);',
    question: "What prints?", correct: "33",
    options: [
      { value: "33", tag: null },
      { value: "33.3", tag: "int_division_keeps_decimal_belief" },
      { value: "34", tag: "int_division_rounds_belief" },
      { value: "nfe", tag: "reassignment_error_belief", label: "NumberFormatException" },
    ],
    revealNote: "n smelts to 100 (an int). int ÷ int truncates — no rounding, no decimal kept. 100 / 3 = 33.333..., and the furnace's int math drops everything after the point: 33.",
    concept: "trace_int_division" },

  { round: 13, wave: 3, type: "trace",
    source: 'String price = "25";\nint qty = 4;\nSystem.out.println("Total: " + Integer.parseInt(price) * qty);',
    question: "What prints?", correct: "Total: 100",
    options: [
      { value: "Total: 100", tag: null },
      { value: "Total: 254", tag: "left_to_right_no_precedence_belief" },
      { value: "Total: 25425", tag: "everything_concatenates_belief" },
      { value: "compile_error", tag: "precedence_confusion_belief", label: "COMPILE ERROR" },
    ],
    revealNote: "* binds TIGHTER than the String +. parseInt(price) * qty resolves first — 25 * 4 = 100 — THEN the result concatenates onto \"Total: \". Precedence doesn't care what order the operators appear in the line.",
    concept: "trace_precedence" },

  { round: 14, wave: 3, type: "bughunt",
    lines: ['String a = "10";', 'String b = "20";', "int sum = a + b;", 'System.out.println("Sum: " + sum);', "// intent: add the two numeric Strings together"],
    faultToken: "a + b", faultLine: 3, tokenRegion: "unconverted_addition",
    fix: "Integer.parseInt(a) + Integer.parseInt(b)",
    explanation: "Unconverted addition — a + b with two Strings CONCATENATES ('10' + '20' = \"1020\"), and assigning that text to an int is a COMPILE ERROR, not even a runtime crash. Both Strings need parseInt before + can mean arithmetic.",
    wrongTag: "unconverted_addition_bug",
    revealNote: "Dual-future reveal: the buggy run never even compiles — \"1020\" (a String) cannot assign into an int. Reset; the fixed run smelts both Strings first — sum = 10 + 20 = 30 — and prints \"Sum: 30\" cleanly.",
    concept: "unconverted_addition_bug" },

  { round: 15, wave: 3, type: "bughunt",
    lines: ["Scanner sc = new Scanner(System.in);", "String input = sc.nextLine();", "int age = Integer.parseInt(input);", 'System.out.println("Age: " + age);', "// intent: always works, no matter what the user types"],
    faultToken: "Integer.parseInt(input)", faultLine: 3, tokenRegion: "unguarded_conversion",
    badInput: "twenty", goodInput: "20",
    fix: null,
    explanation: "The unguarded conversion — parseInt trusts the Scanner completely. Type a real number like \"20\" and it works. Type a word like \"twenty\" and it throws NumberFormatException and CRASHES THE PROGRAM. There's no one-line token swap here: safely handling bad input needs a try-catch block, which this wing hasn't built yet. The lesson: an unguarded parseInt is only as reliable as its input.",
    wrongTag: "unguarded_conversion_bug",
    revealNote: "Dual-future reveal: same three lines, run twice. With \"twenty\" on the tape, line 3 throws NumberFormatException and the program halts. With \"20\" on the tape, the very same code runs clean and prints \"Age: 20\". The flaw isn't a token — it's the missing safety net.",
    concept: "unguarded_conversion_bug" },
];

const MISCONCEPTION_FEEDBACK = {
  parseInt_returns_string_belief: "parseInt returns a primitive int — the metal bar, not the paper strip. The text is consumed; the number remains.",
  valid_input_error_belief: "A well-formed digit string never crashes — parseInt only throws on invalid characters or out-of-range values.",
  parseInt_returns_zero_belief: "The furnace doesn't substitute a default for valid input — it smelts the actual value.",
  zero_string_error_belief: "\"0\" is a perfectly valid digit string — zero is a number like any other. No crash.",
  zero_string_null_belief: "int is a primitive — it holds 0, never null. And parseInt(\"0\") succeeds cleanly.",
  parseInt_strips_sign_belief: "The leading minus is part of the number's value — -42 stays negative, the sign isn't discarded.",
  negative_crashes_belief: "A leading minus is legal in the first position — parseInt(\"-42\") smelts cleanly to -42.",
  nfe_is_compile_error_belief: "NumberFormatException is a RUNTIME crash — the compiler approved the String argument. Only at run time does the furnace discover invalid input.",
  nfe_returns_zero_belief: "The furnace doesn't return a default on failure — it CRASHES. No zero, no fallback.",
  nfe_returns_null_belief: "int is a primitive — it cannot hold null. On invalid input the furnace throws instead of returning anything.",
  string_concat_belief: "Without parseInt, + between Strings means CONCATENATION. After parseInt, + means ARITHMETIC.",
  string_plus_int_confusion: "The result is a real int, not concatenated text. parseInt converted first; the + after it was arithmetic.",
  variable_input_error_belief: "A variable holding a numeric String parses exactly like the literal would — parseInt reads the contents, not the name.",
  empty_string_zero_belief: "An empty String has no digits to smelt — there's nothing to default to zero. NumberFormatException.",
  parseInt_stops_at_space_belief: "parseInt doesn't stop early and keep a partial result — one invalid character anywhere fails the ENTIRE String.",
  parseInt_strips_spaces_belief: "parseInt does not trim or remove spaces — a space anywhere is an invalid character, full stop.",
  trailing_sign_valid_belief: "A sign is only legal in the FIRST position, never at the end. '42-' is rejected in full.",
  trailing_sign_ignored_belief: "The furnace doesn't just ignore the bad character and keep the digits before it — ANY invalid character fails the whole String.",
  leading_plus_crashes_belief: "A leading '+' is explicitly legal (Java 7+) — parseInt(\"+5\") smelts cleanly to 5, same as a bare \"5\".",
  leading_plus_compile_belief: "This compiles fine — parseInt takes any String argument. The '+' sign is a RUNTIME validity question, not a compile-time one, and it happens to be valid.",
  overflow_stores_anyway_belief: "int cannot hold a value past 2,147,483,647 — there's no larger container to fall back to. The furnace throws instead of storing an impossible value.",
  overflow_wraps_silently_belief: "parseInt does NOT silently wrap around on overflow — that's a different operation entirely (int arithmetic overflow). parseInt explicitly THROWS NumberFormatException when the text represents a value outside int's range.",
  both_convert_belief: "Line 1 has NO parseInt — a + b is still plain String concatenation there. Only line 2 converts both sides.",
  neither_converts_belief: "Line 2 DOES call parseInt on both a and b before adding — that's real int arithmetic, not concatenation.",
  lines_swapped_belief: "Trace top to bottom: line 1 prints first (concatenation, \"37\"), line 2 prints second (arithmetic, 10).",
  int_division_keeps_decimal_belief: "int ÷ int in Java produces an int result — the decimal portion is truncated, not kept. There's no automatic promotion to a fractional type.",
  int_division_rounds_belief: "Integer division doesn't round to the nearest whole number — it truncates (drops everything after the decimal point). 100/3 = 33, not 34.",
  reassignment_error_belief: "Reassigning an existing int variable (n = n / 3;) is completely legal — no new declaration needed, and no crash here.",
  left_to_right_no_precedence_belief: "Java doesn't evaluate strictly left-to-right when precedence differs — * always resolves before + gets its turn, regardless of where each operator sits in the line.",
  everything_concatenates_belief: "Only the OUTER + touches the String literal. The * between parseInt(price) and qty is still real multiplication — it resolves to a number BEFORE that number ever touches the \"Total: \" text.",
  precedence_confusion_belief: "This compiles and runs fine — mixing String concatenation and int arithmetic in one expression is completely legal Java, as long as precedence is respected.",
  unconverted_addition_bug: "a + b with two un-parsed Strings concatenates instead of adding — and assigning that String to an int variable is a COMPILE ERROR. Convert both operands first: Integer.parseInt(a) + Integer.parseInt(b).",
  unguarded_conversion_bug: "parseInt has no built-in safety net — bad input crashes the program. A real fix needs try-catch (not yet taught); for now, the lesson is to recognize the exposure.",
  timeout: "The gauge won! Certify faster — parseInt verdicts are reflexes now. Read the characters; trust the furnace.",
};

export class Level72Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level72Scene" });
  }

  init() {
    this.currentRound = 0;
    this.currentWave = 1;
    this.score = 0;
    this.displayScore = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.lives = 5;
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
    this._gaugeHalted = true;
    this.firstOverflowAnnotationShown = false;
  }

  preload() {}

  create() {
    this._alive = true;
    this.createParticleTexture();
    this.createBackground();
    this.createOfficeInterior();
    this.createOfficeFloor();
    this.createParticles();
    this.createTrialsBanner();
    this.createSmeltingTicket();
    this.createPressureGauge();
    this.createMiniFurnace();
    this.createMiniSlate();
    this.createVariablesPanel();
    this.createHUD();
    this.createBit();

    this.events.on("shutdown", () => { this._alive = false; this._killGaugeTween(); });
    this.checkTutorial();
  }

  update(time, delta) {
    this.updateParticles(time, delta);
    this.updateGaugeNeedle(time);
    this.updateGaugeUrgency(time);
    this.updateFurnaceGlow(time);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // SETUP — THE ASSAY OFFICE INTERIOR (Trials variant)
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l72_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l72_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x0c0818).setDepth(0);
  }

  createOfficeInterior() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x120c22, 1);
    g.fillRect(0, 0, W, 80);
    g.lineStyle(2, C_COPPER, 0.35);
    for (let x = 0; x < W; x += 120) {
      g.lineBetween(x, 40, x + 120, 40);
      g.fillStyle(C_COPPER, 0.45);
      g.fillCircle(x, 40, 3);
    }

    // Bunsen burner (small, ambient dressing bottom-left)
    const bc = this.add.container(80, 560).setDepth(3);
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1408, 1);
    bg.lineStyle(1.5, C_COPPER, 0.8);
    bg.fillRect(-10, 10, 20, 8);
    bg.fillRect(-3, -10, 6, 20);
    bc.add(bg);
    this.flameInner = this.add.ellipse(0, -14, 6, 12, 0x42a5f5, 0.6).setOrigin(0.5, 1);
    this.flameOuter = this.add.ellipse(0, -14, 10, 18, 0x1565c0, 0.3).setOrigin(0.5, 1);
    bc.add([this.flameOuter, this.flameInner]);
    this._burnerContainer = bc;
  }

  updateBurnerFlame(time) {
    if (!this.flameInner) return;
    const jitter = Math.sin(time * 0.03) * 1;
    this.flameInner.y = -14 + jitter * 0.3;
    this.flameInner.setScale(1 + Math.sin(time * 0.05) * 0.05);
  }

  createOfficeFloor() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x0a0612, 1);
    g.fillRect(0, 635, W, 85);
    g.lineStyle(1, 0x0e0a1a, 0.5);
    for (let x = 0; x < W; x += 60) {
      for (let y = 635; y < 720; y += 40) {
        if (((x / 60) + (y / 40)) % 2 === 0) {
          g.fillStyle(0x0e0a1a, 0.3);
          g.fillRect(x, y, 60, 40);
        }
      }
    }
    g.fillStyle(C_COPPER, 0.15);
    g.fillRect(0, 637, 6, 83);
  }

  createTrialsBanner() {
    const g = this.add.graphics().setDepth(2);
    g.fillStyle(0x0c0818, 1);
    g.lineStyle(1, C_COPPER, 0.5);
    g.fillRoundedRect(460, 12, 360, 26, 3);
    g.strokeRoundedRect(460, 12, 360, 26, 3);
    this.add.text(640, 25, "T H E   S M E L T I N G   T R I A L S", { font: "bold 13px Georgia", color: HEX_COPPER }).setOrigin(0.5).setAlpha(0.7).setDepth(3);
  }

  createParticles() {
    this.ambient = [];
    const colors = [0x3949ab, 0xb87333, 0x42a5f5];
    for (let i = 0; i < 7; i++) {
      this.ambient.push(this.add.circle(Phaser.Math.Between(0, W), Phaser.Math.Between(150, 630), 1, Phaser.Utils.Array.GetRandom(colors), Phaser.Math.FloatBetween(0.03, 0.05)).setDepth(2));
    }
  }

  updateParticles(time, delta) {
    if (!this.ambient) return;
    const step = 0.006 * (delta / 16.7);
    this.ambient.forEach((p, i) => {
      const nearFurnace = p.x > M_FURNACE_CX - 100 && p.x < M_FURNACE_CX + 100 && p.y > 150 && p.y < 280;
      p.y -= step * (nearFurnace ? 1.6 : 0.5) * (i % 2 === 0 ? 1 : 0.6);
      p.x += Math.sin(time * 0.0003 + i) * 0.02;
      if (p.y < 150) p.y = 630; if (p.y > 630) p.y = 150;
      if (p.x > W) p.x = 0; if (p.x < 0) p.x = W;
    });
  }

  createAnnotation(x, y, text, colorHex) {
    const t = this.add.text(x, y, text, { font: "italic 12px Arial", color: colorHex, wordWrap: { width: 280 }, align: "center" }).setOrigin(0.5).setDepth(70).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 200 });
    this.time.delayedCall(2600, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() }); });
    return t;
  }

  createFloatingText(x, y, text, colorHex, font = "bold 15px Arial", hold = 1400) {
    const t = this.add.text(x, y, text, { font, color: colorHex, wordWrap: { width: 320 }, align: "center" }).setOrigin(0.5).setDepth(31).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 180 });
    this.time.delayedCall(hold, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() }); });
    return t;
  }

  createConfetti(x, y, count = 30) {
    const p = this.add.particles(x, y, "l72_dot", {
      speed: { min: 80, max: 240 }, angle: { min: 0, max: 360 }, scale: { start: 0.9, end: 0 }, lifespan: 500,
      tint: [C_COPPER, 0x3949ab, C_GOLD, 0xffffff], emitting: false,
    }).setDepth(85);
    p.explode(count);
    this.time.delayedCall(900, () => p.destroy());
  }

  screenShake(intensity = 0.004, duration = 150) {
    this.cameras.main.shake(duration, intensity);
  }

  // ══════════════════════════════════════════════════════════════
  // THE SMELTING TICKET (order card)
  // ══════════════════════════════════════════════════════════════

  createSmeltingTicket() {
    const g = this.add.graphics().setDepth(20);
    g.fillStyle(0xe0d6c8, 1);
    g.lineStyle(2, 0x8a6435, 1);
    g.fillRoundedRect(CARD_X0, CARD_Y0, CARD_X1 - CARD_X0, CARD_Y1 - CARD_Y0, 4);
    g.strokeRoundedRect(CARD_X0, CARD_Y0, CARD_X1 - CARD_X0, CARD_Y1 - CARD_Y0, 4);
    g.fillStyle(0x8a6435, 0.15);
    g.fillRect(CARD_X0, CARD_Y0, CARD_X1 - CARD_X0, 24);
    g.lineStyle(1, 0x8a6435, 0.15);
    for (let y = CARD_Y0 + 48; y < CARD_Y1 - 44; y += 20) g.lineBetween(CARD_X0 + 16, y, CARD_X1 - 16, y);
    [CARD_X0 + 30, CARD_X1 - 30].forEach((cx) => {
      g.fillStyle(C_COPPER, 1);
      g.lineStyle(1, 0x8a6435, 1);
      g.fillCircle(cx, CARD_Y0 - 4, 4);
      g.lineBetween(cx, CARD_Y0 - 4, cx, CARD_Y0 + 4);
    });
    g.fillStyle(C_COPPER, 1);
    g.fillCircle(CARD_CX, CARD_Y0 - 4, 4);

    this.cardHeaderText = this.add.text(CARD_CX, CARD_Y0 + 12, "", { font: "bold 10px Georgia", color: "#8a6435" }).setOrigin(0.5).setDepth(21);
    this.cardRoundLabel = this.add.text(CARD_X1 - 14, CARD_Y0 + 12, "TRIAL 1/15", { font: "bold 11px Courier New", color: "#8a6435" }).setOrigin(1, 0.5).setDepth(21);
    this.cardContentContainer = this.add.container(0, 0).setDepth(21);
    this.cardQuestionText = this.add.text(CARD_CX, CARD_Y1 - 26, "", { font: "bold 14px Georgia", color: "#241a0e", wordWrap: { width: CARD_X1 - CARD_X0 - 40 }, align: "center" }).setOrigin(0.5).setDepth(21);
    this.cardStampLayer = this.add.container(CARD_CX, (CARD_Y0 + CARD_Y1) / 2).setDepth(35);
  }

  clearCardContent() {
    this.cardContentContainer.removeAll(true);
    this.cardQuestionText.setText("");
    this.cardStampLayer.removeAll(true);
  }

  showTrialOnTicket(lines, questionText) {
    this.clearCardContent();
    this.cardHeaderText.setText(`SMELTING TICKET — TRIAL NO. ${this.currentRound + 1}`);
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
    this.cardRoundLabel.setText(`TRIAL ${this.currentRound + 1}/15`);
  }

  _codeTokenize(line) {
    const tokens = [];
    const re = /("(?:[^"\\]|\\.)*")|(\bint\b|\bString\b|\bnew\b|\bScanner\b)|(\bInteger\b|\bSystem\b)|(\.parseInt\b|\.out\b|\.println\b|\.nextLine\b|\.nextInt\b)|(-?\+?\d+\.\d+|-?\+?\d+)|([(){}\[\];.,=+*/])/g;
    let last = 0, m;
    const plain = (t) => t && tokens.push({ t, c: "#241a0e" });
    while ((m = re.exec(line))) {
      if (m.index > last) plain(line.slice(last, m.index));
      if (m[1]) tokens.push({ t: m[1], c: "#2e7d32" });
      else if (m[2]) tokens.push({ t: m[2], c: "#1565c0" });
      else if (m[3]) tokens.push({ t: m[3], c: "#b8860b" });
      else if (m[4]) tokens.push({ t: m[4], c: "#e65100" });
      else if (m[5]) tokens.push({ t: m[5], c: "#e65100" });
      else if (m[6]) tokens.push({ t: m[6], c: /[()]/.test(m[6]) ? "#c62828" : "#78909c" });
      last = m.index + m[0].length;
    }
    if (last < line.length) plain(line.slice(last));
    return tokens.length ? tokens : [{ t: line, c: "#241a0e" }];
  }

  async stampTicket(kind) {
    const labels = { certified: "CERTIFIED", misjudged: "MISJUDGED", void: "CERTIFICATION VOID" };
    const colors = { certified: HEX_GREEN_BRIGHT, misjudged: HEX_RED, void: HEX_RED };
    const stamp = this.add.text(0, 0, labels[kind], { font: "bold 21px Georgia", color: colors[kind] }).setOrigin(0.5).setScale(1.4).setAngle(-8).setAlpha(0);
    this.cardStampLayer.add(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 180 });
    const hold = kind === "void" ? 1800 : 700;
    await this.delay(hold);
    if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 200, onComplete: () => stamp.destroy() });
  }

  // ══════════════════════════════════════════════════════════════
  // THE PRESSURE GAUGE (THE TIMER — hero mechanic, re-skins L69's
  // sand column as a copper gauge with a sweeping needle: a linear
  // tween drives progress from 0 (full pressure, green) to 1 (empty,
  // red critical wedge) exactly like the sand's fill/drain, just
  // read off an angle instead of a height.)
  // ══════════════════════════════════════════════════════════════

  createPressureGauge() {
    const startDeg = 135, sweepDeg = 270;
    this._gaugeStartDeg = startDeg;
    this._gaugeSweepDeg = sweepDeg;

    const g = this.add.graphics().setDepth(10);
    g.lineStyle(4, C_COPPER, 1);
    g.strokeCircle(GAUGE_CX, GAUGE_CY, GAUGE_R);
    g.fillStyle(0x0c0818, 0.9);
    g.fillCircle(GAUGE_CX, GAUGE_CY, GAUGE_R - 3);

    const zoneR = GAUGE_R - 12;
    const drawZone = (fromT, toT, color) => {
      const a0 = Phaser.Math.DegToRad(startDeg + fromT * sweepDeg);
      const a1 = Phaser.Math.DegToRad(startDeg + toT * sweepDeg);
      g.lineStyle(7, color, 0.85);
      g.beginPath();
      g.arc(GAUGE_CX, GAUGE_CY, zoneR, a0, a1, false);
      g.strokePath();
    };
    drawZone(0, 0.67, C_GREEN_BRIGHT);
    drawZone(0.67, 0.85, C_ORANGE);
    drawZone(0.85, 1.0, C_RED);

    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      const ang = Phaser.Math.DegToRad(startDeg + t * sweepDeg);
      const x0 = GAUGE_CX + Math.cos(ang) * (GAUGE_R - 18), y0 = GAUGE_CY + Math.sin(ang) * (GAUGE_R - 18);
      const x1 = GAUGE_CX + Math.cos(ang) * (GAUGE_R - 6), y1 = GAUGE_CY + Math.sin(ang) * (GAUGE_R - 6);
      g.lineStyle(1.5, C_COPPER, 0.7);
      g.lineBetween(x0, y0, x1, y1);
    }
    this.add.text(GAUGE_CX, GAUGE_CY + GAUGE_R + 16, "PRESSURE", { font: "bold 11px Georgia", color: HEX_COPPER }).setOrigin(0.5).setAlpha(0.75).setDepth(11);

    this.needlePivot = this.add.container(GAUGE_CX, GAUGE_CY).setDepth(13);
    const needleG = this.add.graphics();
    needleG.fillStyle(C_RED, 1);
    needleG.fillTriangle(0, -3, GAUGE_R - 20, 0, 0, 3);
    needleG.fillStyle(0xffffff, 0.9);
    needleG.fillTriangle(0, -2, -12, 0, 0, 2);
    this.needlePivot.add(needleG);
    this.needlePivot.setAngle(startDeg);
    this._needleGfx = needleG;

    this.add.circle(GAUGE_CX, GAUGE_CY, 6, C_COPPER, 1).setStrokeStyle(1.5, 0x8a6435, 1).setDepth(14);

    this.reliefValve = this.add.circle(GAUGE_CX + GAUGE_R + 14, GAUGE_CY - 4, 5, C_RED, 0).setDepth(12);
    this.gaugeLockPin = this.add.rectangle(GAUGE_CX, GAUGE_CY - GAUGE_R - 6, 10, 6, C_COPPER, 0).setDepth(14);

    this._gaugeProgress = 0;
    this._gaugeUrgency = "safe";
  }

  updateGaugeNeedle(time) {
    if (!this.needlePivot) return;
    const progress = this._gaugeProgress || 0;
    this.needlePivot.setAngle(this._gaugeStartDeg + progress * this._gaugeSweepDeg);
    const shake = this._gaugeUrgency === "critical" ? 1.4 : this._gaugeUrgency === "warning" ? 0.5 : 0;
    if (shake > 0) this.needlePivot.setAngle(this.needlePivot.angle + Math.sin(time * 0.05) * shake);
  }

  updateGaugeUrgency(time) {
    if (this._gaugeProgress === undefined) return;
    const rem = 1 - this._gaugeProgress;
    const state = rem <= 0.15 ? "critical" : rem <= 0.33 ? "warning" : "safe";
    if (state === this._gaugeUrgency) return;
    this._gaugeUrgency = state;
    if (state === "critical") this._startCriticalHiss(); else this._stopCriticalHiss();
  }

  _startCriticalHiss() {
    if (this._criticalTween) return;
    this.reliefValve.setAlpha(0.4);
    this._criticalTween = this.tweens.add({ targets: this.reliefValve, alpha: 0.1, duration: 300, yoyo: true, repeat: -1 });
  }

  _stopCriticalHiss() {
    if (this._criticalTween) { this._criticalTween.stop(); this._criticalTween = null; }
    this.reliefValve.setAlpha(0);
  }

  startGaugeDrop(timeLimitMs) {
    this._killGaugeTween();
    this.roundTimeLimit = timeLimitMs;
    this._gaugeProgress = 0;
    this._gaugeHalted = false;
    this._gaugeUrgency = "safe";
    this._stopCriticalHiss();
    this.gaugeLockPin.setAlpha(0);
    const state = { v: 0 };
    this._gaugeTween = this.tweens.add({
      targets: state, v: 1, duration: timeLimitMs, ease: "Linear",
      onUpdate: () => { this._gaugeProgress = state.v; },
      onComplete: () => { if (this._alive && !this._gaugeHalted) this.onGaugeTimeout(this._currentConfig); },
    });
  }

  _killGaugeTween() {
    if (this._gaugeTween) { this._gaugeTween.stop(); this._gaugeTween = null; }
    this._stopCriticalHiss();
  }

  async sealGauge() {
    this._gaugeHalted = true;
    this._killGaugeTween();
    await new Promise((res) => { this.tweens.add({ targets: this.gaugeLockPin, alpha: 1, duration: 120, ease: "Back.easeOut", onComplete: res }); });
  }

  async lastPressureSpike() {
    for (let i = 0; i < 6; i++) {
      if (!this._alive) return;
      this.needlePivot.setAngle(this.needlePivot.angle + Phaser.Math.Between(-4, 4));
      await this.delay(35);
    }
    for (let i = 0; i < 5; i++) {
      const puff = this.add.circle(this.reliefValve.x, this.reliefValve.y, 2, 0xe8eaf6, 0.7).setDepth(15);
      this.tweens.add({ targets: puff, x: puff.x + Phaser.Math.Between(6, 16), y: puff.y - Phaser.Math.Between(4, 12), alpha: 0, scale: 2, duration: 300, onComplete: () => puff.destroy() });
    }
    const flash = this.add.circle(GAUGE_CX, GAUGE_CY, 10, 0xffffff, 0.6).setDepth(15);
    this.tweens.add({ targets: flash, radius: 30, alpha: 0, duration: 250, onComplete: () => flash.destroy() });
    await this.delay(150);
  }

  async _refillGauge() {
    const state = { v: this._gaugeProgress || 0 };
    await new Promise((res) => {
      this.tweens.add({ targets: state, v: 0, duration: 450, ease: "Sine.easeInOut", onUpdate: () => { this._gaugeProgress = state.v; }, onComplete: res });
    });
    this.gaugeLockPin.setAlpha(0);
  }

  // ══════════════════════════════════════════════════════════════
  // MINI CONVERSION FURNACE (compact L71 furnace, ~55% scale, 1.3x
  // tempo) — hopper → validation gate → smelting chamber → chute →
  // int container. Same honest choreography as L71, just faster and
  // smaller so it fits alongside the pressure gauge.
  // ══════════════════════════════════════════════════════════════

  createMiniFurnace() {
    const g = this.add.graphics().setDepth(10);

    g.lineStyle(2, C_COPPER, 1);
    g.fillStyle(0x0c0818, 0.8);
    g.beginPath();
    g.moveTo(M_HOPPER_X0, M_HOPPER_Y0); g.lineTo(M_HOPPER_X1, M_HOPPER_Y0);
    g.lineTo(M_FURNACE_CX + 16, M_HOPPER_Y1); g.lineTo(M_FURNACE_CX - 16, M_HOPPER_Y1);
    g.closePath();
    g.fillPath(); g.strokePath();
    this.add.text(M_FURNACE_CX, M_HOPPER_Y0 - 10, "STRING IN", { font: "bold 10px Georgia", color: HEX_COPPER }).setOrigin(0.5).setDepth(11);

    g.lineStyle(1.5, C_CYAN, 1);
    g.fillStyle(0x0c0818, 0.5);
    g.fillRoundedRect(M_GATE_X0, M_GATE_Y0, M_GATE_X1 - M_GATE_X0, M_GATE_Y1 - M_GATE_Y0, 4);
    g.strokeRoundedRect(M_GATE_X0, M_GATE_Y0, M_GATE_X1 - M_GATE_X0, M_GATE_Y1 - M_GATE_Y0, 4);
    this.gateBarrier = this.add.rectangle((M_GATE_X0 + M_GATE_X1) / 2, M_GATE_Y0 + 3, M_GATE_X1 - M_GATE_X0 - 6, 3, C_RED, 0).setDepth(14);

    g.lineStyle(2, C_COPPER, 1);
    g.fillStyle(0x1a0e05, 0.85);
    g.fillRoundedRect(M_CHAMBER_X0, M_CHAMBER_Y0, M_CHAMBER_X1 - M_CHAMBER_X0, M_CHAMBER_Y1 - M_CHAMBER_Y0, 6);
    g.strokeRoundedRect(M_CHAMBER_X0, M_CHAMBER_Y0, M_CHAMBER_X1 - M_CHAMBER_X0, M_CHAMBER_Y1 - M_CHAMBER_Y0, 6);
    const vcx = (M_CHAMBER_X0 + M_CHAMBER_X1) / 2, vcy = (M_CHAMBER_Y0 + M_CHAMBER_Y1) / 2;
    this.furnaceGlow = this.add.rectangle(vcx, vcy, M_CHAMBER_X1 - M_CHAMBER_X0 - 10, M_CHAMBER_Y1 - M_CHAMBER_Y0 - 10, 0x42a5f5, 0.25).setDepth(11);

    const contG = this.add.graphics().setDepth(11);
    contG.fillStyle(0x0c0818, 0.9);
    contG.lineStyle(1.5, C_GOLD, 1);
    contG.fillRoundedRect(M_CONT_X - 45, M_CONT_Y, 90, 40, 5);
    contG.strokeRoundedRect(M_CONT_X - 45, M_CONT_Y, 90, 40, 5);
    this.add.text(M_CONT_X, M_CONT_Y - 10, "int", { font: "bold 10px Courier New", color: HEX_GOLD }).setOrigin(0.5).setDepth(12);
    this.containerValueText = this.add.text(M_CONT_X, M_CONT_Y + 20, "—", { font: "bold 15px Courier New", color: HEX_GRAY }).setOrigin(0.5).setDepth(12);
    this.containerNameText = this.add.text(M_CONT_X, M_CONT_Y + 36, "", { font: "italic 9px Courier New", color: HEX_GRAY }).setOrigin(0.5).setDepth(12);

    this.furnaceDynamicLayer = this.add.container(0, 0).setDepth(20);
    this._furnaceStaticGfx = g;
  }

  updateFurnaceGlow(time) {
    if (!this.furnaceGlow) return;
    const base = this._furnaceGlowGold ? 0xffd740 : 0x42a5f5;
    this.furnaceGlow.setFillStyle(base, 0.2 + Math.abs(Math.sin(time * 0.002)) * 0.1);
  }

  clearFurnace() {
    this.furnaceDynamicLayer.removeAll(true);
    this.gateBarrier.setAlpha(0);
  }

  async materializePaperStrip(value) {
    const strip = this.add.container(M_FURNACE_CX, M_HOPPER_Y0 + 6).setAlpha(0);
    const bg = this.add.graphics();
    const w = Math.max(40, value.length * 8 + 14), h = 18;
    bg.fillStyle(0xe0d6c8, 1);
    bg.lineStyle(1, 0x8a6435, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 3);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 3);
    const txt = this.add.text(0, 0, value, { font: "bold 13px Courier New", color: "#241a0e" }).setOrigin(0.5);
    if (txt.width > w - 8) txt.setFontSize(8);
    strip.add([bg, txt]);
    this.furnaceDynamicLayer.add(strip);
    this._currentStrip = { container: strip, bg, txt, w, value };
    this.tweens.add({ targets: strip, alpha: 1, duration: 150 });
    await this.delay(180);
    return this._currentStrip;
  }

  async feedStripDown() {
    const strip = this._currentStrip;
    if (!strip) return;
    await new Promise((res) => {
      this.tweens.add({ targets: strip.container, y: (M_GATE_Y0 + M_GATE_Y1) / 2, duration: 190, ease: "Sine.easeIn", onComplete: res });
    });
  }

  /** Inspects characters left-to-right with a per-character spotlight,
   * stopping at the FIRST invalid one. The master validity rule (used
   * for BOTH the visual spotlight and the real result) is the honest
   * regex: an optional leading '+' or '-', then one-or-more digits,
   * nothing else — matching Java's real parseInt character rules
   * (Java 7+ accepts a leading '+', not just '-'). Returns
   * { allValid, invalidIndex }. */
  async inspectCharacters(strValue) {
    const chars = strValue.split("");
    const validMatch = /^[+-]?[0-9]+$/.test(strValue);
    let invalidIndex = -1;
    if (!validMatch) {
      for (let i = 0; i < chars.length; i++) {
        const ch = chars[i];
        const okHere = /[0-9]/.test(ch) || ((ch === "+" || ch === "-") && i === 0);
        if (!okHere) { invalidIndex = i; break; }
      }
      if (invalidIndex === -1) invalidIndex = chars.length - 1;
    }

    const strip = this._currentStrip;
    const startX = strip ? strip.container.x - strip.w / 2 + 10 : M_FURNACE_CX - 14;
    const y = (M_GATE_Y0 + M_GATE_Y1) / 2;
    const showCount = validMatch ? chars.length : invalidIndex + 1;
    const step = strip ? Math.min(10, (strip.w - 14) / Math.max(chars.length, 1)) : 10;
    for (let i = 0; i < showCount; i++) {
      if (!this._alive) return { allValid: true, invalidIndex: -1 };
      const isLast = i === showCount - 1;
      const isValid = validMatch || !isLast;
      const spotX = startX + i * step;
      const spot = this.add.circle(spotX, y, 5, isValid ? C_GREEN_BRIGHT : C_RED, isValid ? 0.35 : 0.6).setDepth(21);
      this.furnaceDynamicLayer.add(spot);
      this.tweens.add({ targets: spot, alpha: 0, duration: 230, delay: 110, onComplete: () => spot.destroy() });
      await this.delay(115);
    }
    return { allValid: validMatch, invalidIndex };
  }

  async openGate() {
    await new Promise((res) => { this.tweens.add({ targets: this.gateBarrier, alpha: 0, duration: 60, onComplete: res }); });
  }

  async slamGate() {
    this.gateBarrier.setFillStyle(C_RED, 0.9).setAlpha(1);
    const flash = this.add.rectangle((M_GATE_X0 + M_GATE_X1) / 2, (M_GATE_Y0 + M_GATE_Y1) / 2, M_GATE_X1 - M_GATE_X0, M_GATE_Y1 - M_GATE_Y0, C_RED, 0.4).setDepth(22);
    this.furnaceDynamicLayer.add(flash);
    this.tweens.add({ targets: flash, alpha: 0, duration: 230, onComplete: () => flash.destroy() });
    await this.delay(80);
  }

  async ejectStrip() {
    const strip = this._currentStrip;
    if (!strip) return;
    for (let i = 0; i < 4; i++) {
      const spark = this.add.circle(strip.container.x + Phaser.Math.Between(-8, 8), strip.container.y, 1.5, C_RED, 0.8).setDepth(22);
      this.furnaceDynamicLayer.add(spark);
      this.tweens.add({ targets: spark, y: spark.y + Phaser.Math.Between(8, 22), alpha: 0, duration: 230, onComplete: () => spark.destroy() });
    }
    await new Promise((res) => {
      this.tweens.add({ targets: strip.container, y: M_HOPPER_Y0 - 14, alpha: 0, duration: 150, ease: "Sine.easeIn", onComplete: () => { strip.container.destroy(); res(); } });
    });
    this._currentStrip = null;
  }

  async burnStrip() {
    const strip = this._currentStrip;
    if (!strip) return;
    await new Promise((res) => {
      this.tweens.add({ targets: strip.container, y: (M_CHAMBER_Y0 + M_CHAMBER_Y1) / 2, duration: 115, ease: "Sine.easeIn", onComplete: res });
    });
    for (let i = 0; i < 3; i++) {
      const ember = this.add.circle(strip.container.x + Phaser.Math.Between(-10, 10), strip.container.y, 1.5, C_ORANGE, 0.7).setDepth(22);
      this.furnaceDynamicLayer.add(ember);
      this.tweens.add({ targets: ember, y: ember.y - Phaser.Math.Between(14, 28), alpha: 0, duration: 300, onComplete: () => ember.destroy() });
    }
    await new Promise((res) => {
      this.tweens.add({ targets: strip.container, alpha: 0, scale: 0.6, duration: 270, onComplete: () => { strip.container.destroy(); res(); } });
    });
    this._currentStrip = null;
  }

  async formIntegerBar(value) {
    const bar = this.add.container((M_CHAMBER_X0 + M_CHAMBER_X1) / 2, (M_CHAMBER_Y0 + M_CHAMBER_Y1) / 2).setAlpha(0).setScale(0.6);
    const bg = this.add.graphics();
    const w = Math.max(50, String(value).length * 9 + 16), h = 24;
    bg.fillStyle(C_COPPER, 1);
    bg.lineStyle(1.5, 0x8a6435, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 4);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 4);
    const txt = this.add.text(0, 0, String(value), { font: "bold 14px Courier New", color: "#241a0e" }).setOrigin(0.5);
    if (txt.width > w - 8) txt.setFontSize(9);
    bar.add([bg, txt]);
    this.furnaceDynamicLayer.add(bar);
    const glow = this.add.circle((M_CHAMBER_X0 + M_CHAMBER_X1) / 2, (M_CHAMBER_Y0 + M_CHAMBER_Y1) / 2, 32, C_GOLD, 0.3).setDepth(19);
    this.furnaceDynamicLayer.add(glow);
    this.tweens.add({ targets: [bar], alpha: 1, scale: 1, duration: 150, ease: "Back.easeOut" });
    this.tweens.add({ targets: glow, alpha: 0, duration: 300, onComplete: () => glow.destroy() });
    await this.delay(220);
    this._currentBar = bar;
    return bar;
  }

  async slideBarToContainer(value, varName) {
    const bar = this._currentBar;
    if (bar) {
      await new Promise((res) => {
        this.tweens.add({ targets: bar, x: M_CONT_X, y: M_CONT_Y + 20, scale: 0.5, alpha: 0, duration: 210, ease: "Sine.easeIn", onComplete: () => { bar.destroy(); res(); } });
      });
      this._currentBar = null;
    }
    const flash = this.add.circle(M_CONT_X, M_CONT_Y + 20, 22, C_GOLD, 0.4).setDepth(21);
    this.tweens.add({ targets: flash, alpha: 0, scale: 1.4, duration: 200, onComplete: () => flash.destroy() });
    this.containerValueText.setText(String(value)).setColor(HEX_GOLD);
    this.containerNameText.setText(varName || "");
    this.tweens.add({ targets: this.containerValueText, scale: 1.2, duration: 90, yoyo: true });
    await this.delay(110);
  }

  async showNFE(inputStr) {
    this.screenShake(0.005, 240);
    const banner = this.add.text(M_FURNACE_CX, (M_CHAMBER_Y0 + M_CHAMBER_Y1) / 2, "NumberFormatException", { font: "bold 12px Courier New", color: HEX_RED }).setOrigin(0.5).setDepth(30).setScale(1.2).setAlpha(0).setWordWrapWidth(120);
    this.furnaceDynamicLayer.add(banner);
    this.tweens.add({ targets: banner, alpha: 1, scale: 1, duration: 120 });
    await this.delay(1000);
    if (banner.active) this.tweens.add({ targets: banner, alpha: 0, duration: 200, onComplete: () => banner.destroy() });
    this.containerValueText.setText("✗").setColor(HEX_RED);
    this.containerNameText.setText("CRASH");
  }

  async showOverflowNFE(inputStr) {
    this.screenShake(0.006, 280);
    const shudder = this.add.rectangle((M_CHAMBER_X0 + M_CHAMBER_X1) / 2, (M_CHAMBER_Y0 + M_CHAMBER_Y1) / 2, M_CHAMBER_X1 - M_CHAMBER_X0, M_CHAMBER_Y1 - M_CHAMBER_Y0, C_RED, 0.35).setDepth(22);
    this.furnaceDynamicLayer.add(shudder);
    this.tweens.add({ targets: shudder, alpha: 0, duration: 350, onComplete: () => shudder.destroy() });
    if (!this.firstOverflowAnnotationShown) {
      this.firstOverflowAnnotationShown = true;
      this.createAnnotation(M_FURNACE_CX, M_CHAMBER_Y1 + 26, "every character was a valid digit — but the VALUE overflows int's range. NumberFormatException anyway.", HEX_GRAY);
    }
    await this.showNFE(inputStr);
  }

  showCompileErrorStamp() {
    const stamp = this.add.text(M_FURNACE_CX, 90, "COMPILE ERROR", { font: "bold 16px Arial", color: HEX_RED }).setOrigin(0.5).setDepth(30).setScale(1.3).setAngle(-6).setAlpha(0);
    this.roundElements.push(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 140 });
    this.screenShake(0.004, 120);
    this.time.delayedCall(800, () => { if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 180, onComplete: () => stamp.destroy() }); });
  }

  /** The full honest conversion choreography: strip in, inspected
   * character-by-character, and EITHER smelted into an int bar OR
   * rejected with a NumberFormatException — character validity and
   * numeric range (overflow) are checked SEPARATELY, exactly like the
   * real Integer.parseInt does internally. Never scripted: both checks
   * run against the real string. */
  async runConversionChoreography(strValue, varName) {
    await this.materializePaperStrip(strValue);
    await this.feedStripDown();

    if (strValue.length === 0) {
      await this.slamGate();
      await this.ejectStrip();
      await this.showNFE(strValue);
      return { ok: false, crash: "nfe" };
    }

    const inspection = await this.inspectCharacters(strValue);
    if (!inspection.allValid) {
      await this.slamGate();
      await this.ejectStrip();
      await this.showNFE(strValue);
      return { ok: false, crash: "nfe" };
    }

    const numericVal = parseInt(strValue, 10);
    if (numericVal > INT_MAX || numericVal < INT_MIN) {
      await this.openGate();
      await this.burnStrip();
      await this.showOverflowNFE(strValue);
      return { ok: false, crash: "nfe" };
    }

    await this.openGate();
    await this.burnStrip();
    await this.formIntegerBar(numericVal);
    await this.slideBarToContainer(numericVal, varName);
    return { ok: true, value: numericVal };
  }

  // ══════════════════════════════════════════════════════════════
  // MINI ASSAYER'S SLATE
  // ══════════════════════════════════════════════════════════════

  createMiniSlate() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0a0d18, 1);
    g.lineStyle(2, C_COPPER, 1);
    g.fillRoundedRect(SLATE_X, SLATE_Y, SLATE_W, SLATE_H, 8);
    g.strokeRoundedRect(SLATE_X, SLATE_Y, SLATE_W, SLATE_H, 8);
    this.add.text(SLATE_X + 10, SLATE_Y + 8, "MINI SLATE", { font: "bold 10px Georgia", color: HEX_COPPER }).setDepth(11);
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

  chalkEvaluationArrow(value) {
    const t = this.add.text(SLATE_X + 10, this._slateY, `→ ${value}`, { font: "bold 11px Courier New", color: HEX_ORANGE }).setAlpha(0);
    this.slateLines.add(t);
    if (t.width > SLATE_W - 18) t.setFontSize(7.5);
    this.tweens.add({ targets: t, alpha: 1, duration: 100 });
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
    if (type === "void") { this.resultText.setText("void").setColor(HEX_GRAY); return; }
    this.resultText.setText(type).setColor(type === "String" ? HEX_CYAN : HEX_GOLD);
  }

  // ══════════════════════════════════════════════════════════════
  // VARIABLES PANEL — a simple live readout of every declared
  // scalar (name, type, value), refreshed after each statement
  // ══════════════════════════════════════════════════════════════

  createVariablesPanel() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0f0a06, 1);
    g.lineStyle(1, 0x3a2618, 1);
    g.fillRoundedRect(VARS_X, VARS_Y, VARS_W, VARS_H, 8);
    g.strokeRoundedRect(VARS_X, VARS_Y, VARS_W, VARS_H, 8);
    this.add.text(VARS_X + 10, VARS_Y + 6, "VARIABLES", { font: "bold 10px Georgia", color: HEX_COPPER }).setDepth(11);
    this.varsContainer = this.add.container(0, 0).setDepth(11);
  }

  clearVariablesPanel() {
    this.varsContainer.removeAll(true);
  }

  updateVariablesPanel(vars) {
    this.varsContainer.removeAll(true);
    let idx = 0;
    for (const name in vars) {
      const v = vars[name];
      const y = VARS_Y + 22 + idx * 15;
      const display = v.type === "String" ? `"${v.value}"` : String(v.value);
      const text = `${v.type} ${name} = ${display}`.slice(0, 36);
      const t = this.add.text(VARS_X + 10, y, text, { font: "bold 10px Courier New", color: v.type === "String" ? HEX_CYAN : HEX_GOLD }).setOrigin(0, 0.5);
      this.varsContainer.add(t);
      idx++;
      if (idx >= 5) break;
    }
  }

  // ══════════════════════════════════════════════════════════════
  // HUD
  // ══════════════════════════════════════════════════════════════

  createHUD() {
    const g = this.add.graphics().setDepth(49);
    g.fillStyle(0x0c0818, 0.93);
    g.fillRect(0, 0, W, 64);
    g.lineStyle(1, 0x3a2618, 1);
    g.lineBetween(0, 64, W, 64);

    this.add.text(20, 14, "THE SMELTING TRIALS", { font: "bold 16px Georgia", color: "#b0bec5" }).setDepth(50);
    this.add.text(20, 32, "Tuning Phase — Type Conversion: Integer.parseInt()", { font: "12px Arial", color: "#546e7a" }).setDepth(50);

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
    for (let i = 0; i < 5; i++) {
      const lg = this.add.graphics({ x: 1150 + i * 20, y: 24 }).setDepth(50);
      lg.lineStyle(2, C_COPPER, 1);
      lg.strokeRoundedRect(-5, -6, 10, 12, 2);
      lg.lineBetween(-6, -6, 6, -6);
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
  // BIT — SMELTING INSPECTOR VARIANT (medallion, certification pen)
  // ══════════════════════════════════════════════════════════════

  createBit() {
    const c = this.add.container(90, 590).setDepth(60);
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
    frock.fillStyle(C_COPPER, 0.6);
    frock.fillCircle(-3, 4, 1.3);
    frock.fillCircle(-3, 12, 1.3);
    const ribbon = this.add.graphics();
    ribbon.lineStyle(2, C_INDIGO, 0.8);
    ribbon.lineBetween(-6, -14, 0, 2);
    ribbon.lineBetween(6, -14, 0, 2);
    const medallion = this.add.circle(0, 4, 4, C_COPPER, 0.9).setStrokeStyle(1, 0x8a6435, 1);
    const gloveL = this.add.circle(-16, 10, 4, 0xffffff, 0).setStrokeStyle(1, 0xe8eaf6, 0.7);
    this.pen = this.add.container(17, 4);
    const penG = this.add.graphics();
    penG.lineStyle(1.5, C_COPPER, 0.9);
    penG.lineBetween(0, 8, 6, -8);
    penG.fillStyle(0x120c22, 1);
    penG.fillTriangle(5, -10, 7, -6, 4, -6);
    this.pen.add(penG);
    c.add([g, frock, ribbon, medallion, eye, pupil, gloveL, this.pen, tip]);
    this.tweens.add({ targets: tip, alpha: 0.3, duration: 850, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: c, y: "+=3", duration: 1650, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
    this.bit = c;
  }

  async raisePen() {
    await new Promise((res) => { this.tweens.add({ targets: this.pen, angle: -25, y: -4, duration: 150, ease: "Sine.easeOut", onComplete: res }); });
    this.tweens.add({ targets: this.pen, angle: 0, y: 4, duration: 150, ease: "Sine.easeIn" });
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
    g.lineStyle(1.5, C_COPPER, 1);
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
    await this.raisePen();
    await this.bitSay("The Smelting Trials, Assayer — where conversion verdicts race the gauge. Every ticket gets one pressure drop; certify before the needle hits red. The furnace's honesty is your reflex tonight.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(5000)]); if (!A()) return;
    this.hideBubble();

    this.showTrialOnTicket(['int x = Integer.parseInt("42");'], "What is stored in x?");
    this._currentConfig = { revealNote: null };
    this.startGaugeDrop(7000);
    await this.runConversionChoreography("42", "x");
    if (!A()) return;
    const a1 = this.createAnnotation(CARD_CX, CARD_Y1 + 14, "the trial", HEX_BLUE_GRAY);
    const a2 = this.createAnnotation(GAUGE_CX, GAUGE_CY + GAUGE_R + 34, "your time, dropping", HEX_BLUE_GRAY);
    const a3 = this.createAnnotation(M_FURNACE_CX, M_HOPPER_Y0 - 24, "the furnace, honest as ever — just faster", HEX_BLUE_GRAY);
    await this.bitSay("Lock the pin with a verdict — early locks score. The needle starts falling NOW!");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();
    [a1, a2, a3].forEach((a) => a.destroy());
    this._killGaugeTween();
    this.clearCardContent();
    this.wipeSlate();
    this.clearFurnace();
    this.clearVariablesPanel();
    this.containerValueText.setText("—").setColor(HEX_GRAY);
    this.containerNameText.setText("");
    this._gaugeProgress = 0;
    this.updateGaugeNeedle(0);

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
      1: "WAVE 1 — RAPID CONVERSIONS",
      2: "WAVE 2 — THE EDGE CASES",
      3: "WAVE 3 — DEEP TRACES & BUG HUNT",
    };
    await this.showWaveBanner(banners[waveNumber]);
    if (!this._alive) return;
    if (waveNumber === 2) {
      await this.showBitFeedback("Edge cases now, Assayer. Empty strings, embedded spaces, trailing signs, a leading plus, and a String of all-valid digits that STILL overflows. Character validity and numeric range are two separate gates.");
    } else if (waveNumber === 3) {
      await this.showBitFeedback("Final trials — traces that thread precedence and truncation, and two flawed conversions the ledger mustn't see. The gauge won't wait, and neither will the audit.");
    }
    if (!this._alive) return;

    const startIndex = waveNumber === 1 ? 0 : waveNumber === 2 ? 5 : 10;
    this.startRound(startIndex);
  }

  async showWaveBanner(text) {
    const c = this.add.container(640, -60).setDepth(85);
    const g = this.add.graphics();
    g.fillStyle(0x0c0818, 0.95);
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
    this.clearFurnace();
    this.clearVariablesPanel();
    this.containerValueText.setText("—").setColor(HEX_GRAY);
    this.containerNameText.setText("");
    this.updateResultRow(null);
    this.roundStartTime = this.time.now;

    const limit = config.type === "bughunt" ? 12000 : WAVE_TIME[config.wave];
    if (config.type === "predict" || config.type === "trace") this.setupPredict(config);
    else if (config.type === "bughunt") this.setupBugHunt(config);

    this.startGaugeDrop(limit);
  }

  clearRound() {
    this.roundElements.forEach((e) => { if (e && e.destroy) e.destroy(); });
    this.roundElements = [];
    this._bugHuntTokenObjs = [];
    if (this._bugHeaderTween) { this._bugHeaderTween.stop(); this._bugHeaderTween = null; }
  }

  async onGaugeTimeout(config) {
    if (this.gameEnded) return;
    this._gaugeHalted = true;
    this._stopCriticalHiss();
    this.inputLocked = true;
    this.roundElements.forEach((e) => e.disableInteractive && e.disableInteractive());
    (this._bugHuntTokenObjs || []).forEach((t) => t.disableInteractive());
    this.logAttempt(config, false, null, "timeout", this.roundTimeLimit, 1);
    await this.lastPressureSpike();
    if (!this._alive) return;
    await this.stampTicket("void");
    if (!this._alive) return;
    if (config.type === "bughunt") await this.runDualFutureReveal(config);
    else await this.runReveal(config);
    if (!this._alive) return;
    if (config.revealNote) this.createFloatingText(CARD_CX, CARD_Y1 + 40, config.revealNote, HEX_GRAY, "12px Arial", 2800);
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
    this.showTrialOnTicket(lines, config.question);
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
      draw(C_COPPER);
      const label = opt.label || opt.value;
      const txt = this.add.text(0, 0, label, { font: "bold 13px Courier New", color: "#e8eaf6", wordWrap: { width: w - 16 }, align: "center" }).setOrigin(0.5);
      if (txt.height > h - 8) txt.setFontSize(9);
      c.add([g, txt]);
      c.setSize(w, h);
      c.setInteractive({ useHandCursor: true });
      c.on("pointerover", () => { if (!this.inputLocked) draw(C_GOLD); });
      c.on("pointerout", () => { if (!this.inputLocked) draw(C_COPPER); });
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
    await this.sealGauge();
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
    await this.stampTicket(correct ? "certified" : "misjudged");
    if (!this._alive) return;
    if (config.revealNote) this.createFloatingText(CARD_CX, CARD_Y1 + 40, config.revealNote, HEX_GRAY, "12px Arial", 2800);
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
    this.cardHeaderText.setText(`SMELTING TICKET — TRIAL NO. ${this.currentRound + 1}`);
    const header = this.add.text(CARD_CX, CARD_Y0 + 36, "CLICK THE BUG", { font: "bold 14px Georgia", color: "#c62828" }).setOrigin(0.5);
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
    await this.sealGauge();
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
        const fixT = this.add.text(CARD_CX, lineY - 14, config.fix, { font: "bold 12px Courier New", color: "#2e7d32", wordWrap: { width: 380 } }).setOrigin(0.5).setAlpha(0);
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
    await this.stampTicket(correct ? "certified" : "misjudged");
    if (!this._alive) return;
    if (config.revealNote) this.createFloatingText(CARD_CX, CARD_Y1 + 40, config.revealNote, HEX_GRAY, "12px Arial", 2800);
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

  /** Dual-future reveal: the buggy code first (honest wrong outcome),
   * then reset and run a second future. Two repair strategies:
   * "unguarded_conversion" (round 15) — there IS no one-line token
   * fix, so both "futures" run the SAME source lines, differing only
   * in what's on the Scanner tape (bad input crashes, good input
   * succeeds) — teaching that the flaw is latent/input-dependent, not
   * a patchable line. The default (round 14, "unconverted_addition")
   * replaces just the faulty substring in place. */
  async runDualFutureReveal(config) {
    const honestLines = config.lines.filter((l) => !l.trim().startsWith("//"));

    if (config.tokenRegion === "unguarded_conversion") {
      this._scannerTape = [config.badInput];
      await this.runReveal(honestLines);
      await this.delay(500);
      if (!this._alive) return;
      this.wipeSlate();
      this.clearFurnace();
      this.clearVariablesPanel();
      this.containerValueText.setText("—").setColor(HEX_GRAY);
      this.containerNameText.setText("");
      this.updateResultRow(null);

      this._scannerTape = [config.goodInput];
      await this.runReveal(honestLines);
      return;
    }

    await this.runReveal(honestLines);
    await this.delay(400);
    if (!this._alive) return;
    this.wipeSlate();
    this.clearFurnace();
    this.clearVariablesPanel();
    this.containerValueText.setText("—").setColor(HEX_GRAY);
    this.containerNameText.setText("");
    this.updateResultRow(null);

    const fixedLines = config.lines
      .map((l, i) => (i + 1 === config.faultLine ? l.replace(config.faultToken, config.fix) : l))
      .filter((l) => !l.trim().startsWith("//"));
    await this.runReveal(fixedLines);
  }

  // ══════════════════════════════════════════════════════════════
  // HONEST EVALUATOR — reuses/extends L71's Integer.parseInt cascade
  // (character-validated, real furnace choreography, real
  // NumberFormatException), extended with:
  //  - a leading '+' accepted alongside '-' (Java 7+), checked inside
  //    the furnace's inspectCharacters/runConversionChoreography;
  //  - overflow-past-Integer.MAX_VALUE/MIN_VALUE treated as NFE even
  //    when every character is a valid digit (a SEPARATE numeric-range
  //    check after character validation passes — see runConversionChoreography);
  //  - CORRECTED +/* precedence: top-level + is split BEFORE top-level
  //    */÷, matching real operator precedence (+ is the OUTERMOST split
  //    since it binds loosest; L71 never needed this because it never
  //    mixed + and * in one expression, so its mul-before-plus check
  //    order never got exercised against a case where it mattered).
  // ══════════════════════════════════════════════════════════════

  _splitTopPlus(expr) {
    const parts = [];
    let cur = "", inQuotes = false, depth = 0;
    for (let i = 0; i < expr.length; i++) {
      const ch = expr[i];
      if (ch === '"' && expr[i - 1] !== "\\") inQuotes = !inQuotes;
      if (!inQuotes) {
        if (ch === "(" || ch === "[") depth++;
        if (ch === ")" || ch === "]") depth--;
        if (ch === "+" && depth === 0) { parts.push(cur.trim()); cur = ""; continue; }
      }
      cur += ch;
    }
    if (cur.trim() || parts.length) parts.push(cur.trim());
    return parts;
  }

  _splitTopMulDiv(expr) {
    let depth = 0, inQuotes = false;
    for (let i = 0; i < expr.length; i++) {
      const ch = expr[i];
      if (ch === '"' && expr[i - 1] !== "\\") inQuotes = !inQuotes;
      if (!inQuotes) {
        if (ch === "(" || ch === "[") depth++;
        else if (ch === ")" || ch === "]") depth--;
        else if ((ch === "*" || ch === "/") && depth === 0) return [expr.slice(0, i).trim(), expr.slice(i + 1).trim(), ch];
      }
    }
    return null;
  }

  async resolveExpr(expr, vars) {
    const t = expr.trim();

    // Top-level + is checked FIRST — it's the outermost (loosest-binding)
    // operator. Each +-separated part is resolved recursively; a part
    // with a top-level * / falls through to the mul/div check below,
    // giving correct precedence without a full expression tree.
    const plusParts = this._splitTopPlus(t);
    if (plusParts.length > 1) {
      let accValue = null, accIsString = false;
      for (let i = 0; i < plusParts.length; i++) {
        const pt = plusParts[i].trim();
        let partVal, partType;
        if (/^".*"$/.test(pt)) { partVal = pt.slice(1, -1); partType = "String"; }
        else {
          const r = await this.resolveExpr(pt, vars);
          if (!r.ok) return r;
          partVal = r.value; partType = r.type;
        }
        if (i === 0) { accValue = partVal; accIsString = partType === "String"; }
        else if (accIsString || partType === "String") { accValue = String(accValue) + String(partVal); accIsString = true; }
        else { accValue = Number(accValue) + Number(partVal); }
      }
      return { ok: true, value: accValue, type: accIsString ? "String" : "int" };
    }

    const mdParts = this._splitTopMulDiv(t);
    if (mdParts) {
      const l = await this.resolveExpr(mdParts[0], vars);
      if (!l.ok) return l;
      const r = await this.resolveExpr(mdParts[1], vars);
      if (!r.ok) return r;
      if (l.type === "String" || r.type === "String") {
        this.showCompileErrorStamp();
        return { ok: false, crash: "compile" };
      }
      const lv = Number(l.value), rv = Number(r.value);
      const value = mdParts[2] === "*" ? lv * rv : Math.trunc(lv / rv);
      return { ok: true, value, type: "int" };
    }

    const parseIntMatch = t.match(/^Integer\.parseInt\((.+)\)$/);
    if (parseIntMatch) {
      const argRes = await this.resolveExpr(parseIntMatch[1].trim(), vars);
      if (!argRes.ok) return argRes;
      const strVal = String(argRes.value);
      const outcome = await this.runConversionChoreography(strVal, null);
      if (!outcome.ok) { this.updateResultRow("crash"); return { ok: false, crash: "nfe" }; }
      this.updateResultRow("int");
      return { ok: true, value: outcome.value, type: "int" };
    }

    // A static call on the WRONG class or the WRONG method — e.g.
    // int.parseInt(...) (primitive has no methods) or
    // Integer.parseDouble(...) (lives on Double, not Integer).
    const staticCallMatch = t.match(/^(\w+)\.(\w+)\(/);
    if (staticCallMatch && (staticCallMatch[1] !== "Integer" || staticCallMatch[2] !== "parseInt")) {
      this.showCompileErrorStamp();
      return { ok: false, crash: "compile" };
    }

    if (/^".*"$/.test(t)) return { ok: true, value: t.slice(1, -1), type: "String" };
    if (/^[+-]?\d+\.\d+$/.test(t)) return { ok: true, value: parseFloat(t), type: "double" };
    if (/^[+-]?\d+$/.test(t)) return { ok: true, value: parseInt(t, 10), type: "int" };

    if (vars[t] !== undefined) return { ok: true, value: vars[t].value, type: vars[t].type };

    return { ok: false, crash: "eval" };
  }

  async execStatement(line, vars) {
    if (/^Scanner\s+\w+\s*=\s*new\s+Scanner\(System\.in\)\s*;$/.test(line)) {
      return { ok: true };
    }

    const declVar = line.match(/^(int|double|String)\s+(\w+)\s*=\s*(.*);$/);
    if (declVar) {
      const varType = declVar[1], name = declVar[2], rhs = declVar[3].trim();

      if (rhs === "sc.nextLine()") {
        if (varType !== "String") {
          this.showCompileErrorStamp();
          return { ok: false, crash: "compile" };
        }
        const val = (this._scannerTape && this._scannerTape.length) ? this._scannerTape.shift() : "";
        vars[name] = { value: val, type: "String", kind: "scalar" };
        await this.chalkWriteLine(`sc.nextLine() → "${val}"`, "#8ea6c8");
        this.updateVariablesPanel(vars);
        return { ok: true };
      }

      const r = await this.resolveExpr(rhs, vars);
      if (!r.ok) return r;
      if (varType === "int" && r.type === "String") {
        this.showCompileErrorStamp();
        return { ok: false, crash: "compile" };
      }
      vars[name] = { value: r.value, type: varType, kind: "scalar" };
      this.updateVariablesPanel(vars);
      return { ok: true };
    }

    const reassign = line.match(/^(\w+)\s*=\s*(.*);$/);
    if (reassign) {
      const name = reassign[1], rhs = reassign[2].trim();
      const r = await this.resolveExpr(rhs, vars);
      if (!r.ok) return r;
      const existing = vars[name];
      vars[name] = { value: r.value, type: existing ? existing.type : r.type, kind: "scalar" };
      this.updateVariablesPanel(vars);
      return { ok: true };
    }

    const printMatch = line.match(/^System\.out\.println\((.*)\);$/);
    if (printMatch) {
      const r = await this.resolveExpr(printMatch[1].trim(), vars);
      if (!r.ok) return r;
      if (!this._printedLines) this._printedLines = [];
      this._printedLines.push(String(r.value));
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
    const lines = (Array.isArray(raw) ? raw : String(raw).split("\n")).map((l) => l.trim()).filter((l) => l && !l.startsWith("//"));
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
    if (remaining > 0.6) { points += 50; this.fastBonusCount++; this.createFloatingText(CARD_CX, CARD_Y0 - 14, "⚡ EARLY LOCK +50", HEX_GOLD, "bold 15px Arial", 900); }
    else if (remaining > 0.3) { points += 25; this.fastBonusCount++; this.createFloatingText(CARD_CX, CARD_Y0 - 14, "⚡ +25", HEX_GOLD, "bold 14px Arial", 800); }
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

  /**
   * Computes the 4 struggle-detection features from the first 3 rounds'
   * attempt history and asks the backend's Isolation Forest model whether
   * this looks like typical or struggling play. Wired into FusionEngine so
   * the existing 'fusionAction' subscription can react to it, exactly like
   * the emotion/fatigue signals. Never throws — a failed/unreachable
   * backend just means no behavioral signal for this level; face and
   * fatigue detection keep working on their own regardless.
   */
  async runBehavioralCheck() {
    const relevant = this.attemptLog.filter((a) => a.round <= 3);
    const attempts_count = relevant.length;
    const time_taken_seconds = relevant.reduce((sum, a) => sum + a.timeMs, 0) / 1000;
    const misconception_repeat_count = relevant.filter((a) => a.misconceptionTag !== null).length;
    const combo_breaks = GameManager.get("comboBreaksThisLevel") || 0;

    try {
      const { prediction } = await WellbeingAPI.predictStruggle({
        attempts_count,
        time_taken_seconds,
        misconception_repeat_count,
        combo_breaks,
      });
      if (!this._alive) return;
      GameManager.fusionEngine.checkBehavioral(prediction);
    } catch (e) {
      console.warn("Level72Scene: /api/wellbeing/predict-struggle unreachable, skipping behavioral signal for this level:", e);
    }
  }

  advanceRound() {
    if (this.currentRound === 2) this.runBehavioralCheck();
    this.clearRound();
    const next = this.currentRound + 1;
    if (next >= ROUNDS.length) { this.levelComplete(); return; }
    const nextConfig = ROUNDS[next];
    if (nextConfig.wave !== this.currentWave) {
      this._refillGauge().then(() => { if (this._alive && !this.gameEnded) this.startWave(nextConfig.wave); });
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
    this._killGaugeTween();
    this.clearRound();
    this.hideBubble();

    (async () => {
      this.wipeSlate();
      this.clearFurnace();
      this.clearVariablesPanel();
      this._gaugeProgress = 1;
      this.updateGaugeNeedle(0);
      this._stopCriticalHiss();
      const motes = this.ambient;
      this.ambient = null;
      (motes || []).forEach((m) => this.tweens.add({ targets: m, y: 632, alpha: 0, duration: 1500, ease: "Sine.easeIn" }));

      const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
      this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });
      const title = this.add.text(640, 240, "CERTIFICATION LAPSED", { font: "bold 32px Georgia", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
      this.tweens.add({ targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut", onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }) });
      this.add.text(640, 310, `Score: ${this.score}`, { font: "21px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
      this.add.text(640, 350, `Certifications: ${this.currentRound} / 15`, { font: "18px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);
      this._makeButton(525, 420, "RESTOKE THE FURNACE", 200, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
      this._makeButton(755, 420, "RETURN TO MENU", 200, 50, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.start("MenuScene"));
    })();
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this._killGaugeTween();
    this.clearRound();
    this.hideBubble();

    try { GameManager.completeLevel(71, Math.round((this.correctFirstTry / 15) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("integer_parseInt_tuned"); } catch (_) {}
    try {
      localStorage.setItem("level72_results", JSON.stringify({
        level: 72, concept: "integer_parseInt", phase: "tuning",
        score: this.score, accuracy: this.correctFirstTry / 15, avgTimePct: this.totalTimePctUsed / 15,
        fastBonuses: this.fastBonusCount, comboMax: this.maxCombo, stars: this._starRating(),
        livesRemaining: this.lives, attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.trialsFinale().then(() => { if (this._alive) this.showScoreTally(); });
  }

  async trialsFinale() {
    await this._refillGauge();
    await this.stampTicket("certified");
    this.createConfetti(CARD_CX, (CARD_Y0 + CARD_Y1) / 2, 30);

    this.wipeSlate();
    this.clearFurnace();
    this.clearVariablesPanel();
    await this.runConversionChoreography("777", "champion");
    this.createConfetti(M_FURNACE_CX, (M_CHAMBER_Y0 + M_CHAMBER_Y1) / 2, 24);
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
    panel.lineStyle(2, C_COPPER, 1);
    panel.strokeRoundedRect(360, 145, 560, 430, 16);

    const title = this.add.text(640, 185, "TRIALS CERTIFIED", { font: "bold 32px Georgia", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(91).setScale(0);
    this.tweens.add({ targets: title, scale: 1, duration: 350, ease: "Back.easeOut" });

    const acc = Math.round((this.correctFirstTry / 15) * 100);
    const avgSec = (this.totalTimeMs / 15 / 1000).toFixed(1);
    const lines = [
      `ACCURACY: ${acc}%`,
      `AVG RESPONSE: ${avgSec}s`,
      `EARLY-LOCK BONUSES: ${this.fastBonusCount}`,
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
    bg.lineStyle(1.2, C_COPPER, 0.9);
    bg.fillStyle(C_COPPER, 0.9);
    bg.fillRoundedRect(-10, -10, 20, 20, 4);
    bg.lineStyle(1, 0x1a1a2e, 0.8);
    bg.lineBetween(-6, 0, 6, 0);
    badge.add(bg);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 2100 });
    const badgeLbl = this.add.text(640, 520, "parseInt() SCHEMA TUNED", { font: "bold 15px Georgia", color: HEX_GOLD }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: badgeLbl, alpha: 1, duration: 300, delay: 2250 });

    this._makeButton(500, 555, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(770, 555, "NEXT LEVEL →", 240, 44, { fill: 0x00733a, stroke: C_GREEN_BRIGHT, textColor: "#ffffff" }, () => {
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
