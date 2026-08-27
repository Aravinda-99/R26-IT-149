/**
 * Level 79 — "The Assay Bureau" (Type Conversion Wing: Restructuring
 * Phase — String.valueOf() trilogy finale + WING SEAL)
 * ===========================================================================
 * The learner CONSTRUCTS complete conversion-and-display programs — no
 * multiple choice. Reuses the L27→L76 code-canvas/parts-bin/RUN
 * architecture. The rig hosts a TRIPLE apparatus (mini Integer Furnace +
 * mini Decimal Crucible + mini Inscription Press, all three from the
 * wing's prior levels) — the evaluator routes each call to whichever
 * instrument its method name names. Closes the valueOf() trilogy AND
 * seals the entire Type Conversion Wing (the curriculum's seventh).
 *
 * SPEC CORRECTIONS (caught by hand-tracing every mission's test cases
 * before any code was written, per the established discipline):
 *
 *  1. Mission 1's original object-literal had TWO conflicting drafts —
 *     a radius/area version and a simpler score-based redesign, both
 *     assigned to the same keys (brief/skeleton/slots/validCombos) in
 *     the same literal. Per ordinary JS semantics the second draft wins
 *     silently; treated as the author's own inline "actually, let's
 *     simplify" redesign note and built ONLY the surviving score
 *     version, not a bug to reconcile.
 *
 *  2. Mission 1's surviving skeleton ended with
 *     `System.out.println(label);` where label = "95 points" — but the
 *     brief/expectedOutput promise "Result: 95 points". Hand-tracing
 *     caught the missing prefix before writing any code. Fixed by
 *     changing the skeleton's final line to
 *     `System.out.println("Result: " + label);`, preserving the slot's
 *     role (building "95 points") while making the full printed line
 *     match the brief.
 *
 *  3. Mission 3's `inscribe` slot offered a bare `product` cartridge
 *     tagged `alsoCorrect: true` (implicit_vs_explicit_valueOf). But
 *     the skeleton's slot fills an entire bare assignment target —
 *     `String result = <slot:inscribe>;` — not a concatenation
 *     expression. `String result = product;` (int assigned directly to
 *     a String variable, no + operator anywhere) is a genuine Java
 *     COMPILE ERROR; the "auto-valueOf inside +" rule that makes M1's
 *     `score + " points"` and M4's `(a + b)` legal never applies here,
 *     since there is no + at all. Reclassified as a real wrong answer
 *     (tag `bare_assign_needs_convert`), not alsoCorrect.
 *
 *  4. Mission 4's `result` slot offered a bare `a + b` (no parens)
 *     cartridge ALSO tagged `alsoCorrect: true`, alongside the
 *     correctly-parenthesized `(a + b)`. But the skeleton embeds the
 *     slot as `"Sum: " + <slot:result>;` — substituting the bare,
 *     unparenthesized `a + b` produces `"Sum: " + a + b`, which Java
 *     evaluates LEFT TO RIGHT: `("Sum: " + a)` concatenates to
 *     "Sum: 20" FIRST (String + int = concat), then `+ b` concatenates
 *     AGAIN → "Sum: 2030", not the intended "Sum: 50". Verified by
 *     direct left-to-right trace, the same associativity trap this
 *     evaluator's iterative accumulator was built to model correctly
 *     (see L75's design note). Reclassified as a real wrong answer
 *     (tag `unparenthesized_concat_belief`) — a textbook case of why
 *     the parenthesized form is the one that actually works.
 *
 * All 6 missions' test cases were re-traced by hand against the fixed
 * data and confirmed exact before writing the evaluator.
 *
 * New evaluator features beyond L76's parseInt/parseDouble/cast/
 * Scanner/printf cascade:
 *  - String.valueOf(anything) — routes by the resolved argument's type
 *    (int/double/String), never fails, drives the mini press.
 *  - A THIRD instrument (mini press) in the rig, alongside the reused
 *    mini furnace and mini crucible — activateInstrument/dimInstrument
 *    now cover three names instead of two.
 *  - Bare assignment of a non-String expression to a String-typed
 *    variable, with NO enclosing + operator, is a compile error (the
 *    fix for bug #3 above) — this was implicitly already true of
 *    L76's declVar type-check (`varType === "String" && r.type !==
 *    "String"` already triggers showCompileErrorStamp), so no new
 *    machinery was needed — only the MISSIONS data needed correcting.
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
const C_AMBER = 0xff9800, HEX_AMBER = "#ff9800";
const C_CREAM = 0xe0d6b8, HEX_CREAM = "#e0d6b8";

const CX = 40, CY = 90, CW = 680, CH = 380;
const TAB_H = 34, GUTTER_W = 34, CODE_PAD = 10;
const CODE_X = CX + GUTTER_W + CODE_PAD;
const CODE_Y0 = CY + TAB_H + 14;
const LINE_H = 20;
const PX = 40, PY = 490, PW = 680, PH = 130;
const OX = 760, OY = 80, OW = 460, OH = 250;
const MANIFEST_Y = 316;
const RX = 760, RY = 345, RW = 460, RH = 125;
const BX = 760, BY = 490, BW = 460, BH = 130;
const TUTORIAL_KEY = "level79_tutorial_done";

// Rig internal layout — mini furnace / mini crucible / mini press in one
// row, mini arithmetic stage in a row below, variables strip, Scanner
// tape, output ticker beneath that.
const MINI_Y0 = OY + 18, MINI_Y1 = OY + 80;
const MF_X0 = OX + 8, MF_X1 = OX + 150;
const MC_X0 = OX + 158, MC_X1 = OX + 300;
const MP_X0 = OX + 308, MP_X1 = OX + 450;
const ROUTE_ARROW_X = OX + OW / 2, ROUTE_ARROW_Y = MINI_Y0 - 10;
const STAGE_X0 = OX + 10, STAGE_X1 = OX + 450, STAGE_Y0 = OY + 84, STAGE_Y1 = OY + 108;
const TAPE_Y = OY + 8;
const VARS_Y = OY + 122;
const TICKER_Y = OY + 200;

// ══════════════════════════════════════════════════════════════
// MISSION CONFIGURATION
// ══════════════════════════════════════════════════════════════
const MISSIONS = [
  // ── Mission 1: The Label Maker ──
  { mission: 1, title: "The Label Maker",
    brief: "Build a display label from a score. For score = 95:\nResult: 95 points",
    skeleton: [
      "int score = /* test value */;",
      "",
      "String label = <slot:build>;",
      'System.out.println("Result: " + label);',
    ],
    slots: [{ id: "build", hint: "build the label string" }],
    palette: [
      { code: 'String.valueOf(score) + " points"', correct: true, slotId: "build" },
      { code: 'score + " points"', tag: "implicit_vs_explicit_valueOf", correct: true, alsoCorrect: true, slotId: "build" },
      { code: 'Integer.parseInt(score) + " points"', tag: "valueOf_is_parse_belief", slotId: "build" },
      { code: '"score" + " points"', tag: "variable_name_as_value", slotId: "build" },
      { code: 'String.valueOf("score") + " points"', tag: "variable_name_quoted", slotId: "build" },
    ],
    tests: [
      { substitutions: { score: "95" }, expectedOutput: "Result: 95 points" },
      { substitutions: { score: "0" }, expectedOutput: "Result: 0 points" },
      { substitutions: { score: "100" }, expectedOutput: "Result: 100 points" },
    ],
    postMissionNote: "Bit: 'valueOf(score) turned the int into text; + \" points\" glued the suffix. The auto-concat version works too — Java calls valueOf implicitly inside +. But the explicit form says \"I am converting\" loudly. Both correct; one is clearer.'",
    concept: "basic_valueOf_label" },

  // ── Mission 2: The Composite Record ──
  { mission: 2, title: "The Composite Record",
    brief: "Build a single-line record from mixed types. For name=\"Iron\", purity=73.2, grade=3:\nRecord: Iron | 73.2% | Grade 3",
    skeleton: [
      "String name = /* test value */;",
      "double purity = /* test value */;",
      "int grade = /* test value */;",
      "",
      'String record = name + " | " + <slot:pur> + "% | Grade " + <slot:gr>;',
      'System.out.println("Record: " + record);',
    ],
    slots: [
      { id: "pur", hint: "purity as text" },
      { id: "gr", hint: "grade as text" },
    ],
    isFlagship: false,
    palette: [
      { code: "String.valueOf(purity)", correct: true, slotId: "pur" },
      { code: "purity", tag: "implicit_vs_explicit_valueOf", correct: true, alsoCorrect: true, slotId: "pur" },
      { code: "Double.parseDouble(purity)", tag: "valueOf_is_parse_belief", slotId: "pur" },
      { code: "String.valueOf(grade)", correct: true, slotId: "gr" },
      { code: "grade", tag: "implicit_vs_explicit_valueOf", correct: true, alsoCorrect: true, slotId: "gr" },
      { code: "Integer.parseInt(grade)", tag: "valueOf_is_parse_belief", slotId: "gr" },
    ],
    tests: [
      { substitutions: { name: '"Iron"', purity: "73.2", grade: "3" }, expectedOutput: "Record: Iron | 73.2% | Grade 3" },
      { substitutions: { name: '"Gold"', purity: "99.9", grade: "1" }, expectedOutput: "Record: Gold | 99.9% | Grade 1" },
      { substitutions: { name: '"Tin"', purity: "50.0", grade: "5" }, expectedOutput: "Record: Tin | 50.0% | Grade 5" },
    ],
    postMissionNote: "Bit: 'Three types — String, double, int — woven into one label. valueOf converted each number to text for the composite. The parse distractors went the WRONG direction: parseDouble/parseInt take Strings, not numbers. Direction matters.'",
    concept: "composite_label" },

  // ── Mission 3: The Full Triangle (FLAGSHIP — parse → compute → valueOf) ──
  { mission: 3, title: "The Full Triangle",
    brief: "Parse two String inputs as ints, compute their product, and inscribe the result as a String label.\nFor a = \"6\", b = \"7\":\nProduct: 42",
    skeleton: [
      "String a = /* test value */;",
      "String b = /* test value */;",
      "",
      "int x = <slot:parseA>;",
      "int y = <slot:parseB>;",
      "int product = x * y;",
      "String result = <slot:inscribe>;",
      "",
      'System.out.println("Product: " + result);',
    ],
    slots: [
      { id: "parseA", hint: "DOWN the triangle (text → int)" },
      { id: "parseB", hint: "DOWN the triangle (text → int)" },
      { id: "inscribe", hint: "UP the triangle (int → text)" },
    ],
    isFlagship: true,
    palette: [
      { code: "Integer.parseInt(a)", correct: true, slotId: "parseA" },
      { code: "String.valueOf(a)", tag: "direction_confusion", slotId: "parseA" },
      { code: "Integer.parseInt(b)", correct: true, slotId: "parseB" },
      { code: "String.valueOf(b)", tag: "direction_confusion", slotId: "parseB" },
      { code: "String.valueOf(product)", correct: true, slotId: "inscribe" },
      { code: "Integer.parseInt(product)", tag: "direction_confusion", slotId: "inscribe" },
      { code: "product", tag: "bare_assign_needs_convert", slotId: "inscribe" },
    ],
    tests: [
      { substitutions: { a: '"6"', b: '"7"' }, expectedOutput: "Product: 42" },
      { substitutions: { a: '"10"', b: '"0"' }, expectedOutput: "Product: 0" },
      { substitutions: { a: '"-3"', b: '"4"' }, expectedOutput: "Product: -12" },
    ],
    postMissionNote: "Bit (touching the chain's triangle pendant): 'THE FULL TRIANGLE — DOWN, DOWN, ACROSS, UP. Two parses brought the text to int; multiplication computed across; valueOf carried the result back to text. Three instruments, one program, one publication. The triangle navigated completely.'",
    concept: "full_triangle_flagship" },

  // ── Mission 4: The Sum Label (compute-then-convert) ──
  { mission: 4, title: "The Sum Label",
    brief: "Compute the sum of two ints and build a label showing the result. For a = 20, b = 30:\nSum: 50",
    skeleton: [
      "int a = /* test value */;",
      "int b = /* test value */;",
      "",
      'String label = "Sum: " + <slot:result>;',
      "System.out.println(label);",
    ],
    slots: [{ id: "result", hint: "the sum AS TEXT" }],
    palette: [
      { code: "String.valueOf(a + b)", correct: true, slotId: "result" },
      { code: "String.valueOf(a) + String.valueOf(b)", tag: "concat_as_arithmetic", slotId: "result" },
      { code: "(a + b)", tag: "implicit_vs_explicit_valueOf", correct: true, alsoCorrect: true, slotId: "result" },
      { code: "String.valueOf(a) + b", tag: "partial_concat", slotId: "result" },
      { code: "a + b", tag: "unparenthesized_concat_belief", slotId: "result" },
    ],
    tests: [
      { substitutions: { a: "20", b: "30" }, expectedOutput: "Sum: 50" },
      { substitutions: { a: "0", b: "0" }, expectedOutput: "Sum: 0" },
      { substitutions: { a: "-5", b: "15" }, expectedOutput: "Sum: 10" },
    ],
    postMissionNote: "Bit: 'valueOf(a + b) — compute INSIDE, convert OUTSIDE. valueOf(a) + valueOf(b) would have glued digits instead of adding numbers. The parentheses are the boundary between math and text. Get the math done before the press stamps.'",
    concept: "compute_then_convert" },

  // ── Mission 5: The Scanner Report (parse + compute + valueOf pipeline) ──
  { mission: 5, title: "The Scanner Report",
    brief: "Read a decimal measurement, double it, and build a labeled result.\nFor input \"4.5\":\nOriginal: 4.5 | Doubled: 9.0",
    skeleton: [
      "Scanner sc = new Scanner(System.in);",
      "",
      "double val = <slot:parse>;",
      "double doubled = val * 2;",
      'String report = "Original: " + String.valueOf(val) + " | Doubled: " + <slot:inscribe>;',
      "System.out.println(report);",
    ],
    slots: [
      { id: "parse", hint: "read and dissolve (DOWN)" },
      { id: "inscribe", hint: "inscribe the doubled value (UP)" },
    ],
    isCrossWing: true,
    palette: [
      { code: "Double.parseDouble(sc.nextLine())", correct: true, slotId: "parse" },
      { code: "Integer.parseInt(sc.nextLine())", tag: "wrong_parser_choice", slotId: "parse" },
      { code: "String.valueOf(sc.nextLine())", tag: "direction_confusion", slotId: "parse" },
      { code: "String.valueOf(doubled)", correct: true, slotId: "inscribe" },
      { code: "Double.parseDouble(doubled)", tag: "direction_confusion", slotId: "inscribe" },
      { code: "doubled", tag: "implicit_vs_explicit_valueOf", correct: true, alsoCorrect: true, slotId: "inscribe" },
    ],
    tests: [
      { input: ["4.5"], expectedOutput: "Original: 4.5 | Doubled: 9.0" },
      { input: ["10.0"], expectedOutput: "Original: 10.0 | Doubled: 20.0" },
      { input: ["0.5"], expectedOutput: "Original: 0.5 | Doubled: 1.0" },
    ],
    postMissionNote: "Bit: 'Four wings in one pipeline: Scanner reads (Intake), parseDouble dissolves (DOWN), arithmetic doubles (ACROSS), valueOf inscribes (UP). The full conversion lifecycle — text in, number in the middle, text out.'",
    concept: "full_pipeline" },

  // ── Mission 6: The Grand Assay (GRAND CAPSTONE — ALL THREE methods) ──
  { mission: 6, title: "The Grand Assay",
    brief: "Process a sample: read the sample ID (text stays text), weight (decimal), and count (integer). Compute unit weight (weight / count). Build a one-line summary.\nFor inputs \"SAMPLE-7\", \"150.0\", \"6\":\nSAMPLE-7: 6 units @ 25.0 each (total 150.0)",
    skeleton: [
      "Scanner sc = new Scanner(System.in);",
      "",
      "String id = sc.nextLine();",
      "double weight = <slot:parseW>;",
      "int count = <slot:parseC>;",
      "double unitWeight = weight / count;",
      "",
      'String summary = id + ": " + <slot:countStr> + " units @ "',
      '    + String.valueOf(unitWeight) + " each (total "',
      '    + <slot:weightStr> + ")";',
      "System.out.println(summary);",
    ],
    slots: [
      { id: "parseW", hint: "dissolve weight (DOWN)" },
      { id: "parseC", hint: "smelt count (DOWN)" },
      { id: "countStr", hint: "inscribe count (UP)" },
      { id: "weightStr", hint: "inscribe weight (UP)" },
    ],
    isCapstone: true,
    isCrossWing: true,
    palette: [
      { code: "Double.parseDouble(sc.nextLine())", correct: true, slotId: "parseW" },
      { code: "String.valueOf(sc.nextLine())", tag: "direction_confusion", slotId: "parseW" },
      { code: "Integer.parseInt(sc.nextLine())", correct: true, slotId: "parseC" },
      { code: "Double.parseDouble(sc.nextLine())", tag: "parseDouble_on_int_field", slotId: "parseC" },
      { code: "String.valueOf(count)", correct: true, slotId: "countStr" },
      { code: "Integer.parseInt(count)", tag: "direction_confusion", slotId: "countStr" },
      { code: "String.valueOf(weight)", correct: true, slotId: "weightStr" },
      { code: "weight", tag: "implicit_vs_explicit_valueOf", correct: true, alsoCorrect: true, slotId: "weightStr" },
    ],
    tests: [
      { input: ["SAMPLE-7", "150.0", "6"], expectedOutput: "SAMPLE-7: 6 units @ 25.0 each (total 150.0)" },
      { input: ["ORE-1", "100.0", "4"], expectedOutput: "ORE-1: 4 units @ 25.0 each (total 100.0)" },
      { input: ["DUST-3", "10.0", "1"], expectedOutput: "DUST-3: 1 units @ 10.0 each (total 10.0)" },
    ],
    postMissionNote: "Bit (closing the master ledger, the chain pendant catching the chandelier light): 'The Grand Assay — three reads, two DOWN conversions, one computation, two UP inscriptions, one publication. Crucible, furnace, and press — every instrument in the wing fired on one rig. Grand Assayer — the wing seals at your seal.'",
    concept: "grand_assay_capstone" },
];

const MISCONCEPTION_FEEDBACK = {
  direction_confusion: "The direction is WRONG — valueOf goes UP (to String); parseInt/parseDouble go DOWN (to number). Check the arrow on the triangle: which way are you converting?",
  concat_as_arithmetic: "valueOf(a) + valueOf(b) = '2030' (concat). valueOf(a + b) = '50' (addition then conversion). Compute FIRST, convert AFTER.",
  partial_concat: "valueOf(a) + b = '20' + 30 = '2030'. Once the left operand is a String, + becomes concat. Both operands must stay as ints for math.",
  valueOf_is_parse_belief: "parseInt/parseDouble take STRINGS and return numbers (DOWN). You're passing a NUMBER — that's valueOf territory (UP). Wrong instrument.",
  implicit_vs_explicit_valueOf: "Auto-concat works — Java calls valueOf implicitly inside +. Both forms produce the same result. valueOf is the EXPLICIT declaration of intent.",
  variable_name_as_value: "'\"score\"' is a String LITERAL — the word 'score', not the variable's value. Drop the quotes: use the variable name without quotes.",
  variable_name_quoted: "String.valueOf(\"score\") inscribes the literal text 'score', not the variable's value (95). Pass the VARIABLE, not a quoted name.",
  wrong_parser_choice: "parseInt on decimal text = crash. parseDouble on an int field = double in an int container = COMPILE ERROR. Match the parser to the data type.",
  parseDouble_on_int_field: "parseDouble gives a double; the int container needs parseInt. Wrong instrument for the container.",
  string_is_number_belief: "Text that looks like a number is still text until parsed. The furnace or crucible converts; nothing else will.",
  valueOf_returns_number_belief: "valueOf ALWAYS returns String — '42' is text, not the number 42.",
  bare_assign_needs_convert: "Assigning a number directly to a String variable needs valueOf — auto-conversion only happens INSIDE a concatenation (something + something), not for a plain assignment. 'String result = product;' is a compile error; 'String result = String.valueOf(product);' works.",
  unparenthesized_concat_belief: "Without parentheses, \"Sum: \" + a + b evaluates LEFT TO RIGHT: (\"Sum: \" + a) becomes a String first, then + b concatenates again — 'Sum: 2030', not 'Sum: 50'. Wrap the arithmetic: \"Sum: \" + (a + b), so the addition happens before the concatenation reaches it.",
};

const HINTS = {
  1: 'String.valueOf(score) + " points" — convert the int to text, then glue the suffix.',
  2: "String.valueOf(purity) for the decimal field, String.valueOf(grade) for the integer field — both go UP the triangle.",
  3: "Integer.parseInt(a) and Integer.parseInt(b) go DOWN; after the multiply, String.valueOf(product) goes back UP.",
  4: "String.valueOf(a + b) — compute the sum FIRST (inside the parentheses), convert SECOND.",
  5: "Double.parseDouble(sc.nextLine()) to read and dissolve; String.valueOf(doubled) to inscribe the result.",
  6: "Double.parseDouble(sc.nextLine()) for weight, Integer.parseInt(sc.nextLine()) for count; String.valueOf(count) and String.valueOf(weight) to inscribe both back.",
};

export class Level79Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level79Scene" });
  }

  init() {
    this.currentMission = 0;
    this.score = 0;
    this.lives = 3;
    this.flawlessCount = 0;
    this.runCount = 0;
    this.failedRunCount = 0;
    this.hintCount = 0;
    this.selfCorrectionCount = 0;
    this.triangleProactive = {};
    this.computeConvertClean = {};
    this.pipelineClean = {};
    this._firstRunMetricsRecorded = {};
    this.attemptLog = [];
    this.missionElements = [];
    this.slotContents = {};
    this.slotDefs = {};
    this.paletteBlocks = [];
    this.wrongBlockHistory = {};
    this.missionStartTime = 0;
    this.missionRunsFailed = 0;
    this.missionHintUsed = false;
    this._runCountAtMissionStart = 0;
    this.inputLocked = true;
    this.gameEnded = false;
    this._alive = true;
  }

  preload() {}

  create() {
    this._alive = true;
    this.createParticleTexture();
    this.createBackground();
    this.createBureauInterior();
    this.createWingCrest();
    this.createBureauFloor();
    this.createAmbientParticles();
    this.createCodeCanvas();
    this.createBlockPalette();
    this.createRunButton();
    this.createRigWindow();
    this.createTripleApparatus();
    this.createMiniArithmeticStage();
    this.createMiniScannerTape();
    this.createMiniOutputTicker();
    this.createVariablesStrip();
    this.createManifestStrip();
    this.createTestReportPanel();
    this.createMissionBriefPanel();
    this.createHUD();
    this.createBit();
    this.setupDragEvents();

    this.events.on("shutdown", () => { this._alive = false; });
    this.checkTutorial();
  }

  update(time, delta) {
    this.updateAmbient(time, delta);
    this.updateCrestPulse(time);
    this.updateChandelierSparkle(time);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // SETUP — THE ASSAY BUREAU INTERIOR
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l79_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l79_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x0c0818).setDepth(0);
  }

  createBureauInterior() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x120c22, 1);
    g.fillRect(0, 0, W, 30);

    // The assayer's ledger — the wing's master record
    g.fillStyle(0x0c0818, 0.6);
    g.lineStyle(3, C_COPPER, 1);
    g.fillRect(200, 30, 580, 140);
    g.strokeRect(200, 30, 580, 140);
    g.lineStyle(1, C_COPPER, 0.4);
    g.lineBetween(490, 34, 490, 166);
    this._ledgerLines = [];
    for (let col = 0; col < 2; col++) {
      for (let r = 0; r < 6; r++) {
        const x0 = 214 + col * 290, x1 = x0 + 260;
        const y = 46 + r * 20;
        const lg = this.add.graphics().setDepth(2).setAlpha(0.12);
        lg.lineStyle(1, r % 2 === 0 ? C_CREAM : C_ORANGE, 1);
        lg.lineBetween(x0, y, x1 - Phaser.Math.Between(0, 60), y);
        this._ledgerLines.push(lg);
      }
    }

    // Three instrument silhouettes — achievement plaques, right wall
    const silDefs = [
      { x: 1100, y: 100, label: "parseInt", color: C_COPPER },
      { x: 1100, y: 150, label: "parseDouble", color: C_ORANGE },
      { x: 1100, y: 200, label: "valueOf", color: C_CREAM },
    ];
    this._instrumentSilhouettes = silDefs.map((d) => {
      const c = this.add.container(d.x + 25, d.y + 25).setDepth(2).setAlpha(0.25);
      const sg = this.add.graphics();
      sg.lineStyle(1.5, d.color, 1);
      sg.strokeRoundedRect(-22, -22, 44, 44, 4);
      sg.fillStyle(d.color, 0.15);
      sg.fillRoundedRect(-22, -22, 44, 44, 4);
      const lbl = this.add.text(0, 30, d.label, { font: "8px Georgia", color: d.color === C_COPPER ? HEX_COPPER : d.color === C_ORANGE ? HEX_ORANGE : HEX_CREAM }).setOrigin(0.5);
      c.add([sg, lbl]);
      return { c, sg, colorHex: d.color === C_COPPER ? HEX_COPPER : d.color === C_ORANGE ? HEX_ORANGE : HEX_CREAM, color: d.color };
    });

    // Grand chandelier
    this.createChandelier();

    // Banner — gold trim signals the wing-finale level
    const bg = this.add.graphics().setDepth(2);
    bg.fillStyle(0x0c0818, 1);
    bg.lineStyle(1, C_GOLD, 0.5);
    bg.fillRoundedRect(460, 12, 360, 26, 3);
    bg.strokeRoundedRect(460, 12, 360, 26, 3);
    this.add.text(640, 25, "T H E   A S S A Y   B U R E A U", { font: "bold 15px Georgia", color: HEX_GOLD }).setOrigin(0.5).setAlpha(0.8).setDepth(3);
  }

  createChandelier() {
    const c = this.add.container(640, 90).setDepth(3);
    const g = this.add.graphics();
    g.fillStyle(C_INDIGO, 0.5);
    g.fillCircle(0, 0, 5);
    const arms = [];
    for (let i = 0; i < 4; i++) {
      const a = (Math.PI / 2) * i;
      const ax = Math.cos(a) * 16, ay = Math.sin(a) * 16;
      g.lineStyle(1.2, C_INDIGO, 0.4);
      g.lineBetween(0, 0, ax, ay);
      const crystal = this.add.circle(ax, ay, 2.5, C_INDIGO, 0.5);
      arms.push(crystal);
    }
    const sparkles = [];
    for (let i = 0; i < 5; i++) {
      const s = this.add.circle(Phaser.Math.Between(-16, 16), Phaser.Math.Between(-16, 16), 1, C_GOLD, 0.4);
      sparkles.push(s);
    }
    c.add([g, ...arms, ...sparkles]);
    this._chandelier = { c, arms, sparkles };
  }

  updateChandelierSparkle(time) {
    if (!this._chandelier) return;
    this._chandelier.sparkles.forEach((s, i) => {
      s.setAlpha(0.2 + Math.abs(Math.sin(time * 0.002 + i)) * 0.4);
    });
  }

  createWingCrest() {
    const c = this.add.container(920, 80).setDepth(4);
    const g = this.add.graphics();
    const pStr = { x: 0, y: -22 }, pInt = { x: -24, y: 16 }, pDbl = { x: 24, y: 16 };
    g.lineStyle(1.5, C_GOLD, 0.8);
    g.lineBetween(pStr.x, pStr.y, pInt.x, pInt.y);
    g.lineStyle(1.5, C_ORANGE, 0.8);
    g.lineBetween(pStr.x, pStr.y, pDbl.x, pDbl.y);
    g.lineStyle(1, C_GRAY, 0.6);
    g.lineBetween(pInt.x, pInt.y, pDbl.x, pDbl.y);
    const tStr = this.add.text(pStr.x, pStr.y - 10, "String", { font: "bold 9px Georgia", color: HEX_CREAM }).setOrigin(0.5);
    const tInt = this.add.text(pInt.x, pInt.y + 10, "int", { font: "bold 9px Georgia", color: HEX_GOLD }).setOrigin(0.5);
    const tDbl = this.add.text(pDbl.x, pDbl.y + 10, "double", { font: "bold 9px Georgia", color: HEX_ORANGE }).setOrigin(0.5);
    c.add([g, tStr, tInt, tDbl]);
    c.setAlpha(0.4);
    this._crestOriginalPos = { x: 920, y: 80 };
    this._wingCrest = { c, g, state: "idle" };
  }

  pulseCrest(state) {
    const s = this._wingCrest;
    s.state = state;
    if (state === "idle") s.c.setAlpha(0.4);
    else if (state === "session") s.c.setAlpha(0.8);
    else if (state === "gold") s.c.setAlpha(1);
  }

  updateCrestPulse(time) {
    if (!this._wingCrest || this._wingCrest.state !== "session") return;
    this._wingCrest.c.setAlpha(0.6 + Math.abs(Math.sin(time * 0.006)) * 0.4);
  }

  createBureauFloor() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x0a0612, 1);
    g.fillRect(0, 635, W, 85);
    g.lineStyle(1, 0x0e0a1a, 0.5);
    g.lineBetween(0, 637, W, 637);
    g.fillStyle(C_GOLD, 0.1);
    for (let x = 0; x < W; x += 100) g.fillRect(x, 637, 3, 83);
  }

  createAmbientParticles() {
    this.ambient = [];
    const colors = [C_INDIGO, C_GOLD, C_COPPER];
    for (let i = 0; i < 8; i++) {
      this.ambient.push(this.add.circle(Phaser.Math.Between(0, W), Phaser.Math.Between(230, 630), 1, Phaser.Utils.Array.GetRandom(colors), Phaser.Math.FloatBetween(0.03, 0.06)).setDepth(2));
    }
  }

  updateAmbient(time, delta) {
    if (!this.ambient) return;
    const step = 0.008 * (delta / 16.7);
    this.ambient.forEach((p, i) => {
      p.y += step * (i % 2 === 0 ? 1 : -0.6);
      p.x += Math.sin(time * 0.0003 + i) * 0.02;
      if (p.y > 630) p.y = 230; if (p.y < 230) p.y = 630;
      if (p.x > W) p.x = 0; if (p.x < 0) p.x = W;
    });
  }

  screenShake(intensity = 0.004, duration = 150) {
    this.cameras.main.shake(duration, intensity);
  }

  createFloatingText(x, y, text, colorHex, font = "bold 15px Arial", hold = 1200) {
    const t = this.add.text(x, y, text, { font, color: colorHex, wordWrap: { width: 300 }, align: "center" }).setOrigin(0.5).setDepth(75).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 160 });
    this.time.delayedCall(hold, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 220, onComplete: () => t.destroy() }); });
    return t;
  }

  createAnnotation(x, y, text, colorHex) {
    const t = this.add.text(x, y, text, { font: "italic 12px Arial", color: colorHex, wordWrap: { width: 260 }, align: "center" }).setOrigin(0.5).setDepth(70).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 200 });
    return t;
  }

  createConfetti(x, y, count = 30) {
    const p = this.add.particles(x, y, "l79_dot", {
      speed: { min: 80, max: 240 }, angle: { min: 0, max: 360 }, scale: { start: 0.9, end: 0 }, lifespan: 500,
      tint: [C_GOLD, C_COPPER, C_INDIGO, 0xffffff], emitting: false,
    }).setDepth(95);
    p.explode(count);
    this.time.delayedCall(900, () => p.destroy());
  }

  createWingConfetti(x, y, count = 40) {
    const p = this.add.particles(x, y, "l79_dot", {
      speed: { min: 100, max: 280 }, angle: { min: 0, max: 360 }, scale: { start: 1, end: 0 }, lifespan: 700,
      tint: [C_INDIGO, C_COPPER, C_GOLD, C_CREAM], emitting: false,
    }).setDepth(96);
    p.explode(count);
    this.time.delayedCall(1100, () => p.destroy());
  }

  // ══════════════════════════════════════════════════════════════
  // CODE CANVAS
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
    this.tabFilename = this.add.text(CX + CW - 12, CY + TAB_H / 2, "Bureau1.java", { font: "13px Courier New", color: "#546e7a" }).setOrigin(1, 0.5).setDepth(11);

    this.lineHighlight = this.add.rectangle(CX + CW / 2, 0, CW - 4, LINE_H, 0xffab00, 0.06).setDepth(19).setVisible(false);
    this.codeContainer = this.add.container(0, 0).setDepth(20);
  }

  _syntaxTokens(line) {
    const tokens = [];
    const re = /("(?:[^"\\]|\\.)*")|(\bimport\b|\bfor\b|\bint\b|\bdouble\b|\bString\b|\bnew\b|\bScanner\b)|(\bInteger\b|\bDouble\b)|(\.parseInt\b|\.parseDouble\b|\.valueOf\b|\.nextInt\b|\.nextLine\b|\.println\b|\.printf\b)|(\bSystem\.out\b|\bSystem\.in\b)|(-?\d+\.\d+|-?\d+)|(>=|<=|==|!=|\+\+|--|[+\-*/><?:%])|([(){}\[\];.,=])/g;
    let last = 0, m;
    const plain = (t) => t && tokens.push({ t, c: "#e0e0e0" });
    while ((m = re.exec(line))) {
      if (m.index > last) plain(line.slice(last, m.index));
      if (m[1]) tokens.push({ t: m[1], c: "#4caf50" });
      else if (m[2]) tokens.push({ t: m[2], c: "#6a1b9a" });
      else if (m[3]) tokens.push({ t: m[3], c: HEX_GOLD });
      else if (m[4]) tokens.push({ t: m[4], c: HEX_CYAN });
      else if (m[5]) tokens.push({ t: m[5], c: "#78909c" });
      else if (m[6]) tokens.push({ t: m[6], c: HEX_ORANGE });
      else if (m[7]) tokens.push({ t: m[7], c: "#4caf50" });
      else if (m[8]) tokens.push({ t: m[8], c: "#78909c" });
      last = m.index + m[0].length;
    }
    if (last < line.length) plain(line.slice(last));
    return tokens.length ? tokens : [{ t: line, c: "#e0e0e0" }];
  }

  _isDimmedInfrastructure(rawLine) {
    const t = rawLine.trim();
    return /^Scanner sc = new Scanner/.test(rawLine)
      || /^(int|String|double)\s+\w+\s*=\s*\/\*.*\*\/;\s*$/.test(rawLine)
      || t === "";
  }

  renderSkeleton(mission) {
    this.codeContainer.removeAll(true);
    this.slotDefs = {};
    mission.slots.forEach((s) => { this.slotDefs[s.id] = { ...s, capacity: 1, rect: null }; });

    mission.skeleton.forEach((rawLine, i) => {
      const y = CODE_Y0 + i * LINE_H;
      const numT = this.add.text(CX + 8, y, String(i + 1), { font: "13px Courier New", color: "#3d4450" });
      this.codeContainer.add(numT);

      if (!rawLine.trim()) return;

      if (this._isDimmedInfrastructure(rawLine)) {
        const t = this.add.text(CODE_X, y, rawLine, { font: "13px Courier New", color: "#3d4450" }).setAlpha(0.6);
        this.codeContainer.add(t);
        return;
      }

      const parts = rawLine.split(/<slot:(\w+)>/);
      let x = CODE_X;
      parts.forEach((part, pi) => {
        if (pi % 2 === 0) {
          if (!part) return;
          this._syntaxTokens(part).forEach((tok) => {
            const t = this.add.text(x, y, tok.t, { font: "bold 13px Courier New", color: tok.c });
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
      const label = this.add.text(x + w / 2, y + h / 2, def.hint, { font: "italic 10px Courier New", color: "#3d4450" }).setOrigin(0.5).setDepth(22);
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
  // BLOCK PALETTE + DRAG
  // ══════════════════════════════════════════════════════════════

  createBlockPalette() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0f0a06, 1);
    g.fillRoundedRect(PX, PY, PW, PH, 10);
    g.lineStyle(1, 0x3a2618, 1);
    g.strokeRoundedRect(PX, PY, PW, PH, 10);
    this.add.text(PX + 10, PY + 8, "ASSAYER'S BUREAU PARTS", { font: "bold 11px Arial", color: "#3d4450" }).setDepth(11);
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
      const style = { font: "bold 12px Courier New", color: HEX_CYAN };
      const label = def.label || def.code.replace(/\n\s*/g, "  ");
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
      draw(C_GOLD);
      const txt = this.add.text(0, 0, label, style).setOrigin(0.5);
      c.add([bg, txt]);
      c.setSize(w, 26);
      c.setData("w", w);
      c.setData("code", def.code);
      c.setData("tag", def.tag || null);
      c.setData("slotId", def.slotId || null);
      c.setData("home", home);
      c.setData("draw", draw);
      c.setData("placedIn", null);
      c.setInteractive({ useHandCursor: true, draggable: true });
      c.on("pointerover", () => { if (!this.inputLocked) draw(0xffab00); });
      c.on("pointerout", () => { if (!this.inputLocked) draw(C_GOLD); });
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

  _nearestOpenSlot(x, y, forObj) {
    let best = null, bestDist = 60;
    const wantSlotId = forObj ? forObj.getData("slotId") : null;
    for (const id in this.slotDefs) {
      const def = this.slotDefs[id];
      if (!def || !def.rect) continue;
      if (wantSlotId && id !== wantSlotId) continue;
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
    const key = this._nearestOpenSlot(obj.x, obj.y, obj);
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
    const key = this._nearestOpenSlot(obj.x, obj.y, obj);
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

  _slotCode(slotId) {
    const placed = this.slotContents[slotId] && this.slotContents[slotId][0];
    return placed ? placed.container.getData("code") : "";
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
    const t = this.add.text(0, 0, "▶ RUN", { font: "bold 19px Arial", color: "#0a0d08" }).setOrigin(0.5);
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
  // RIG WINDOW
  // ══════════════════════════════════════════════════════════════

  createRigWindow() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x04060c, 1);
    g.fillRoundedRect(OX, OY, OW, OH, 12);
    g.lineStyle(3, C_GOLD, 1);
    g.strokeRoundedRect(OX, OY, OW, OH, 12);
    this.add.text(OX + 10, OY + 4, "BUREAU RIG — LIVE", { font: "bold 11px Georgia", color: HEX_GOLD }).setAlpha(0.7).setDepth(11);

    const maskShape = this.make.graphics({ x: 0, y: 0, add: false });
    maskShape.fillRoundedRect(OX + 4, OY + 14, OW - 8, OH - 18, 10);
    this.windowMask = maskShape.createGeometryMask();
    this.rigLayer = this.add.container(0, 0).setDepth(15);
    this.rigLayer.setMask(this.windowMask);

    this.verdictLamp = this.add.circle(OX + OW - 18, OY + 10, 6, C_GRAY).setDepth(20);
  }

  // ══════════════════════════════════════════════════════════════
  // THE TRIPLE APPARATUS — compact Integer Furnace (left) + Decimal
  // Crucible (middle) + Inscription Press (right), all three
  // reused from the wing's prior levels, now doing real production
  // work. The evaluator ROUTES each call to whichever instrument its
  // method name names; activateInstrument dims the other two so the
  // one that actually fired is always the one that glows.
  // ══════════════════════════════════════════════════════════════

  createTripleApparatus() {
    const drawFrame = (x0, x1, label, colorHex, labelHex) => {
      const g = this.add.graphics();
      g.lineStyle(1.2, colorHex, 0.5);
      g.strokeRoundedRect(x0, MINI_Y0, x1 - x0, MINI_Y1 - MINI_Y0, 4);
      this.rigLayer.add(g);
      const t = this.add.text((x0 + x1) / 2, MINI_Y0 - 9, label, { font: "bold 8px Georgia", color: labelHex }).setOrigin(0.5).setAlpha(0.5);
      this.rigLayer.add(t);
      return { g, t };
    };
    this._mfFrame = drawFrame(MF_X0, MF_X1, "FURNACE", C_COPPER, HEX_COPPER);
    this._mcFrame = drawFrame(MC_X0, MC_X1, "CRUCIBLE", C_ORANGE, HEX_ORANGE);
    this._mpFrame = drawFrame(MP_X0, MP_X1, "PRESS", C_CREAM, HEX_CREAM);

    this.mfDynamicLayer = this.add.container(0, 0);
    this.mcDynamicLayer = this.add.container(0, 0);
    this.mpDynamicLayer = this.add.container(0, 0);
    this.rigLayer.add([this.mfDynamicLayer, this.mcDynamicLayer, this.mpDynamicLayer]);

    const mfCx = (MF_X0 + MF_X1) / 2, mcCx = (MC_X0 + MC_X1) / 2, mpCx = (MP_X0 + MP_X1) / 2;
    this._mfGate = this.add.rectangle(mfCx, MINI_Y0 + 34, MF_X1 - MF_X0 - 16, 2, C_RED, 0);
    this._mcGate = this.add.rectangle(mcCx, MINI_Y0 + 34, MC_X1 - MC_X0 - 16, 2, C_RED, 0);
    this.rigLayer.add([this._mfGate, this._mcGate]);

    this._mfContText = this.add.text(mfCx, MINI_Y1 - 9, "int —", { font: "bold 9px Courier New", color: HEX_GRAY }).setOrigin(0.5);
    this._mcContText = this.add.text(mcCx, MINI_Y1 - 9, "double —", { font: "bold 9px Courier New", color: HEX_GRAY }).setOrigin(0.5);
    this._mpContText = this.add.text(mpCx, MINI_Y1 - 9, "String —", { font: "bold 9px Courier New", color: HEX_GRAY }).setOrigin(0.5);
    this.rigLayer.add([this._mfContText, this._mcContText, this._mpContText]);

    this.routeArrow = this.add.text(ROUTE_ARROW_X, ROUTE_ARROW_Y, "?", { font: "bold 12px Georgia", color: HEX_GRAY }).setOrigin(0.5).setAlpha(0.4);
    this.rigLayer.add(this.routeArrow);
  }

  _instrumentFrame(which) { return which === "furnace" ? this._mfFrame : which === "crucible" ? this._mcFrame : this._mpFrame; }

  clearTripleApparatus() {
    this.mfDynamicLayer.removeAll(true);
    this.mcDynamicLayer.removeAll(true);
    this.mpDynamicLayer.removeAll(true);
    this._mfGate.setAlpha(0);
    this._mcGate.setAlpha(0);
    this._mfContText.setText("int —").setColor(HEX_GRAY);
    this._mcContText.setText("double —").setColor(HEX_GRAY);
    this._mpContText.setText("String —").setColor(HEX_GRAY);
    this.routeArrow.setText("?").setAlpha(0.4).setColor(HEX_GRAY);
    this.dimInstrument("furnace");
    this.dimInstrument("crucible");
    this.dimInstrument("press");
  }

  activateInstrument(which) {
    this.dimInstrument("furnace"); this.dimInstrument("crucible"); this.dimInstrument("press");
    const frame = this._instrumentFrame(which);
    this.tweens.add({ targets: [frame.g, frame.t], alpha: 1, duration: 180 });
    const arrowText = which === "furnace" ? "↓ int" : which === "crucible" ? "↓ double" : "↑ String";
    const arrowColor = which === "furnace" ? HEX_COPPER : which === "crucible" ? HEX_ORANGE : HEX_CREAM;
    this.routeArrow.setText(arrowText).setColor(arrowColor).setAlpha(1);
  }

  dimInstrument(which) {
    const frame = this._instrumentFrame(which);
    this.tweens.add({ targets: [frame.g, frame.t], alpha: 0.3, duration: 180 });
  }

  _miniStrip(layer, cx, value) {
    const strip = this.add.container(cx, MINI_Y0 + 10).setAlpha(0);
    const bg = this.add.graphics();
    const w = Math.max(24, value.length * 5.5 + 8), h = 10;
    bg.fillStyle(0xe0d6c8, 1);
    bg.lineStyle(1, 0x8a6435, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 2);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 2);
    const txt = this.add.text(0, 0, value, { font: "bold 8px Courier New", color: "#241a0e" }).setOrigin(0.5);
    if (txt.width > w - 4) txt.setFontSize(5);
    strip.add([bg, txt]);
    layer.add(strip);
    this.tweens.add({ targets: strip, alpha: 1, duration: 80 });
    return strip;
  }

  /** Honest mini-furnace attempt: digits/leading-sign GREEN, anything
   * else (including a dot) RED — no amber, the furnace has no special
   * case for decimal points. */
  async runFurnaceConversion(strValue) {
    this.activateInstrument("furnace");
    const cx = (MF_X0 + MF_X1) / 2;
    const strip = this._miniStrip(this.mfDynamicLayer, cx, strValue);
    await this.delay(80);
    await new Promise((res) => { this.tweens.add({ targets: strip, y: MINI_Y0 + 34, duration: 100, onComplete: res }); });

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
    const startX = strip.x - (strip.list[0].width || 24) / 2 + 4;
    for (let i = 0; i < showCount; i++) {
      if (!this._alive) return { ok: true };
      const isLast = i === showCount - 1;
      const isValidChar = valid || !isLast;
      const spot = this.add.circle(startX + i * 6, MINI_Y0 + 34, 2, isValidChar ? C_GREEN_BRIGHT : C_RED, 0.5);
      this.mfDynamicLayer.add(spot);
      this.tweens.add({ targets: spot, alpha: 0, duration: 160, delay: 70 });
      await this.delay(55);
    }

    if (!valid) {
      this._mfGate.setFillStyle(C_RED, 0.9).setAlpha(1);
      this.screenShake(0.004, 120);
      this.tweens.add({ targets: strip, alpha: 0, y: strip.y - 12, duration: 120, onComplete: () => strip.destroy() });
      await this.delay(150);
      const nfe = this.add.text(cx, MINI_Y0 + 55, "NFE", { font: "bold 9px Courier New", color: HEX_RED }).setOrigin(0.5).setAlpha(0);
      this.mfDynamicLayer.add(nfe);
      this.tweens.add({ targets: nfe, alpha: 1, duration: 90 });
      await this.delay(400);
      this._mfContText.setText("✗").setColor(HEX_RED);
      return { ok: false, crash: "nfe" };
    }

    const value = parseInt(strValue, 10);
    await new Promise((res) => { this.tweens.add({ targets: strip, y: MINI_Y0 + 48, duration: 90, onComplete: res }); });
    strip.destroy();
    const bar = this.add.container(cx, MINI_Y0 + 48).setAlpha(0).setScale(0.6);
    const bg = this.add.graphics();
    const w = Math.max(24, String(value).length * 5.5 + 8), h = 11;
    bg.fillStyle(C_COPPER, 1);
    bg.lineStyle(1, 0x8a6435, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 3);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 3);
    const txt = this.add.text(0, 0, String(value), { font: "bold 8px Courier New", color: "#241a0e" }).setOrigin(0.5);
    bar.add([bg, txt]);
    this.mfDynamicLayer.add(bar);
    this.tweens.add({ targets: bar, alpha: 1, scale: 1, duration: 90, ease: "Back.easeOut" });
    await this.delay(90);
    this.tweens.add({ targets: bar, y: MINI_Y1 - 9, alpha: 0, duration: 110, onComplete: () => bar.destroy() });
    this._mfContText.setText(`int ${value}`).setColor(HEX_GOLD);
    await this.delay(80);
    return { ok: true, value, type: "int" };
  }

  /** Honest mini-crucible attempt: digits/sign GREEN, ONE dot AMBER,
   * anything else RED. */
  async runCrucibleConversion(strValue) {
    this.activateInstrument("crucible");
    const cx = (MC_X0 + MC_X1) / 2;
    const trimmed = strValue.trim();
    const strip = this._miniStrip(this.mcDynamicLayer, cx, strValue);
    await this.delay(80);
    await new Promise((res) => { this.tweens.add({ targets: strip, y: MINI_Y0 + 34, duration: 100, onComplete: res }); });

    const valid = trimmed.length > 0 && /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(trimmed);
    let dotSeen = false, invalidIndex = -1;
    const kinds = [];
    for (let i = 0; i < strValue.length; i++) {
      const ch = strValue[i];
      let kind;
      if (/[0-9]/.test(ch)) kind = "green";
      else if ((ch === "+" || ch === "-") && i === 0) kind = "green";
      else if (ch === " ") kind = "green";
      else if (ch === "." && !dotSeen) { dotSeen = true; kind = "amber"; }
      else kind = "red";
      kinds.push(kind);
      if (!valid && kind === "red" && invalidIndex === -1) invalidIndex = i;
    }
    if (!valid && invalidIndex === -1) invalidIndex = strValue.length - 1;
    const showCount = valid ? strValue.length : invalidIndex + 1;
    const startX = strip.x - (strip.list[0].width || 24) / 2 + 4;
    for (let i = 0; i < showCount; i++) {
      if (!this._alive) return { ok: true };
      const kind = !valid && i === invalidIndex ? "red" : kinds[i];
      const color = kind === "green" ? C_GREEN_BRIGHT : kind === "amber" ? C_AMBER : C_RED;
      const spot = this.add.circle(startX + i * 6, MINI_Y0 + 34, 2, color, 0.5);
      this.mcDynamicLayer.add(spot);
      this.tweens.add({ targets: spot, alpha: 0, duration: 160, delay: 70 });
      await this.delay(55);
      if (kind === "red") break;
    }

    if (!valid) {
      this._mcGate.setFillStyle(C_RED, 0.9).setAlpha(1);
      this.screenShake(0.004, 120);
      this.tweens.add({ targets: strip, alpha: 0, y: strip.y - 12, duration: 120, onComplete: () => strip.destroy() });
      await this.delay(150);
      const nfe = this.add.text(cx, MINI_Y0 + 55, "NFE", { font: "bold 9px Courier New", color: HEX_RED }).setOrigin(0.5).setAlpha(0);
      this.mcDynamicLayer.add(nfe);
      this.tweens.add({ targets: nfe, alpha: 1, duration: 90 });
      await this.delay(400);
      this._mcContText.setText("✗").setColor(HEX_RED);
      return { ok: false, crash: "nfe" };
    }

    const value = parseFloat(trimmed);
    await new Promise((res) => { this.tweens.add({ targets: strip, y: MINI_Y0 + 48, alpha: 0, duration: 120, onComplete: res }); });
    strip.destroy();
    const display = Number.isInteger(value) ? `${value}.0` : String(value);
    const liquid = this.add.rectangle(cx, MINI_Y0 + 48, 28, 11, C_AMBER, 0.5).setScale(0, 1);
    this.mcDynamicLayer.add(liquid);
    this.tweens.add({ targets: liquid, scaleX: 1, duration: 90 });
    const valText = this.add.text(cx, MINI_Y0 + 48, display, { font: "bold 5.5px Courier New", color: "#241a0e" }).setOrigin(0.5).setAlpha(0);
    this.mcDynamicLayer.add(valText);
    this.tweens.add({ targets: valText, alpha: 1, duration: 90 });
    await this.delay(110);
    this.tweens.add({ targets: [liquid, valText], y: "+=" + (MINI_Y1 - 9 - (MINI_Y0 + 48)), alpha: 0, duration: 110 });
    await this.delay(90);
    this._mcContText.setText(`double ${display}`).setColor(HEX_ORANGE);
    await this.delay(70);
    return { ok: true, value, type: "double" };
  }

  /** Honest mini-press attempt: NO gate, ever — valueOf never fails.
   * A type-tinted chip descends, the arm thunks, a paper strip
   * carrying the String representation emerges. */
  async runPressConversion(value, type, strRepr) {
    this.activateInstrument("press");
    const cx = (MP_X0 + MP_X1) / 2;
    const inputDisplay = type === "String" ? `"${value}"` : String(value);
    const typeColor = type === "int" ? C_GOLD : type === "double" ? C_ORANGE : C_CREAM;

    const chip = this.add.container(cx, MINI_Y0 + 10).setAlpha(0);
    const chipBg = this.add.graphics();
    const cw = Math.max(22, inputDisplay.length * 5.5 + 8), ch = 10;
    chipBg.fillStyle(typeColor, 0.85);
    chipBg.lineStyle(1, 0x241a0e, 0.4);
    chipBg.fillRoundedRect(-cw / 2, -ch / 2, cw, ch, 2);
    chipBg.strokeRoundedRect(-cw / 2, -ch / 2, cw, ch, 2);
    const chipTxt = this.add.text(0, 0, inputDisplay, { font: "bold 8px Courier New", color: "#1a1408" }).setOrigin(0.5);
    if (chipTxt.width > cw - 4) chipTxt.setFontSize(5);
    chip.add([chipBg, chipTxt]);
    this.mpDynamicLayer.add(chip);
    this.tweens.add({ targets: chip, alpha: 1, duration: 80 });
    await this.delay(80);

    await new Promise((res) => { this.tweens.add({ targets: chip, y: MINI_Y0 + 34, duration: 100, onComplete: res }); });

    const arm = this.add.rectangle(cx, MINI_Y0 + 14, MP_X1 - MP_X0 - 30, 4, C_COPPER, 0.9).setAlpha(0);
    this.mpDynamicLayer.add(arm);
    this.tweens.add({ targets: arm, alpha: 1, duration: 50 });
    await new Promise((res) => { this.tweens.add({ targets: arm, y: MINI_Y0 + 30, duration: 70, ease: "Quad.easeIn", onComplete: res }); });
    this.screenShake(0.003, 70);
    this.tweens.add({ targets: chip, scaleY: 0.7, duration: 60, yoyo: true });
    await this.delay(70);
    this.tweens.add({ targets: arm, y: MINI_Y0 + 14, alpha: 0, duration: 90, onComplete: () => arm.destroy() });
    this.tweens.add({ targets: chip, alpha: 0, duration: 100, onComplete: () => chip.destroy() });
    await this.delay(90);

    const stripDisplay = `"${strRepr}"`;
    const strip = this._miniStrip(this.mpDynamicLayer, cx, stripDisplay);
    strip.setPosition(cx, MINI_Y0 + 34);
    this.tweens.add({ targets: strip, y: MINI_Y1 - 9, duration: 100 });
    await this.delay(110);
    this.tweens.add({ targets: strip, alpha: 0, duration: 100 });
    this._mpContText.setText(`String ${stripDisplay}`).setColor(HEX_CREAM);
    await this.delay(80);
    return { ok: true, value: strRepr, type: "String" };
  }

  /** The (int) cast cameo: the crucible's most recent liquid pours
   * through a narrowing funnel labeled "(int)" and solidifies into a
   * furnace-style bar — double → int truncation made visible. */
  async runCastAnimation(doubleValue, intResult) {
    const mcCx = (MC_X0 + MC_X1) / 2, mfCx = (MF_X0 + MF_X1) / 2;
    const funnelY = MINI_Y0 + 60;
    const funnel = this.add.text((mcCx + mfCx) / 2, funnelY, "(int)", { font: "bold 8px Courier New", color: HEX_GOLD }).setOrigin(0.5).setAlpha(0);
    this.rigLayer.add(funnel);
    this.tweens.add({ targets: funnel, alpha: 1, duration: 100 });
    const drop = this.add.circle(mcCx, MINI_Y0 + 48, 3, C_AMBER, 0.7);
    this.rigLayer.add(drop);
    await new Promise((res) => { this.tweens.add({ targets: drop, x: (mcCx + mfCx) / 2, y: funnelY, duration: 160, onComplete: res }); });
    this.screenShake(0.002, 70);
    drop.setFillStyle(C_COPPER, 0.9);
    await new Promise((res) => { this.tweens.add({ targets: drop, x: mfCx, y: MINI_Y0 + 48, scale: 1.4, duration: 160, onComplete: res }); });
    drop.destroy();
    const bar = this.add.text(mfCx, MINI_Y0 + 48, String(intResult), { font: "bold 9px Courier New", color: HEX_GOLD }).setOrigin(0.5).setAlpha(0);
    this.rigLayer.add(bar);
    this.tweens.add({ targets: bar, alpha: 1, duration: 90 });
    await this.delay(160);
    this.tweens.add({ targets: [funnel, bar], alpha: 0, duration: 120 });
    await this.delay(80);
  }

  showCompileErrorStamp() {
    const stamp = this.add.text(CX + CW / 2, CY + CH / 2, "COMPILE ERROR", { font: "bold 18px Arial", color: HEX_RED }).setOrigin(0.5).setDepth(70).setScale(1.3).setAngle(-6).setAlpha(0);
    this.missionElements.push(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 130 });
    this.screenShake(0.004, 110);
    this.time.delayedCall(750, () => { if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 160, onComplete: () => stamp.destroy() }); });
  }

  showRuntimeHaltStamp() {
    const stamp = this.add.text(CX + CW / 2, CY + CH / 2, "BUILD HALTED", { font: "bold 17px Arial", color: HEX_RED }).setOrigin(0.5).setDepth(70).setScale(1.2).setAngle(-4).setAlpha(0);
    this.missionElements.push(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 130 });
    this.screenShake(0.004, 110);
    this.time.delayedCall(750, () => { if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 160, onComplete: () => stamp.destroy() }); });
  }

  // ══════════════════════════════════════════════════════════════
  // MINI ARITHMETIC STAGE
  // ══════════════════════════════════════════════════════════════

  createMiniArithmeticStage() {
    const g = this.add.graphics();
    g.lineStyle(1.2, C_INDIGO, 0.6);
    g.strokeRoundedRect(STAGE_X0, STAGE_Y0, STAGE_X1 - STAGE_X0, STAGE_Y1 - STAGE_Y0, 5);
    this.rigLayer.add(g);
    const t = this.add.text(STAGE_X0 + 4, STAGE_Y0 + 1, "MATH", { font: "bold 8px Georgia", color: HEX_INDIGO }).setAlpha(0.6);
    this.rigLayer.add(t);
    this.stageDynamicLayer = this.add.container(0, 0);
    this.rigLayer.add(this.stageDynamicLayer);
  }

  clearArithmeticStage() { this.stageDynamicLayer.removeAll(true); }

  async runArithmeticAnimation(aVal, op, bVal, result) {
    const cy = (STAGE_Y0 + STAGE_Y1) / 2 + 3;
    const leftX = STAGE_X0 + 40, rightX = STAGE_X1 - 40, midX = (STAGE_X0 + STAGE_X1) / 2;
    const makeBar = (x, val) => {
      const c = this.add.container(x, cy).setAlpha(0).setScale(0.7);
      const bg = this.add.graphics();
      const w = Math.max(22, String(val).length * 5.5 + 6), h = 11;
      bg.fillStyle(C_ORANGE, 0.85);
      bg.lineStyle(1, 0x8a6435, 1);
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, 2);
      bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 2);
      const t = this.add.text(0, 0, String(val), { font: "bold 5.5px Courier New", color: "#241a0e" }).setOrigin(0.5);
      c.add([bg, t]);
      this.stageDynamicLayer.add(c);
      this.tweens.add({ targets: c, alpha: 1, scale: 1, duration: 70 });
      return c;
    };
    const barA = makeBar(leftX, aVal);
    const barB = makeBar(rightX, bVal);
    const opText = this.add.text(midX, cy, op, { font: "bold 12px Georgia", color: HEX_INDIGO }).setOrigin(0.5).setAlpha(0);
    this.stageDynamicLayer.add(opText);
    this.tweens.add({ targets: opText, alpha: 1, duration: 70 });
    await this.delay(90);
    await new Promise((res) => {
      this.tweens.add({ targets: barA, x: midX - 10, duration: 80 });
      this.tweens.add({ targets: barB, x: midX + 10, duration: 80, onComplete: res });
    });
    const flash = this.add.circle(midX, cy, 2.5, C_GOLD, 0.6);
    this.stageDynamicLayer.add(flash);
    this.tweens.add({ targets: flash, scale: 6, alpha: 0, duration: 150, onComplete: () => flash.destroy() });
    barA.destroy(); barB.destroy(); opText.destroy();
    const resultBar = makeBar(midX, result);
    await this.delay(90);
    this.tweens.add({ targets: resultBar, alpha: 0, duration: 130, delay: 150, onComplete: () => resultBar.destroy() });
    await this.delay(70);
  }

  // ══════════════════════════════════════════════════════════════
  // MINI SCANNER TAPE
  // ══════════════════════════════════════════════════════════════

  createMiniScannerTape() {
    this.tapeContainer = this.add.container(0, 0).setVisible(false);
    this.rigLayer.add(this.tapeContainer);
    this.tapeState = [];
  }

  activateScannerCameo() { this.tapeContainer.setVisible(true); }

  parkScannerCameo() {
    this.tapeContainer.setVisible(false);
    this.tapeContainer.removeAll(true);
    this.tapeState = [];
  }

  _classifyChar(ch) {
    if (ch === " ") return "space";
    if (ch === "\n") return "newline";
    return "alpha";
  }

  loadMiniTape(inputLines) {
    const cells = [];
    (inputLines || []).forEach((line) => {
      line.split("").forEach((ch) => cells.push({ ch, kind: this._classifyChar(ch) }));
      cells.push({ ch: "\n", kind: "newline" });
    });
    this.tapeState = cells;
    this.renderMiniTape();
  }

  renderMiniTape() {
    this.tapeContainer.removeAll(true);
    if (this.tapeState.length === 0) return;
    const cellW = 4.5, x1 = OX + OW - 10;
    const totalW = Math.min(this.tapeState.length * cellW, 150);
    const startX = x1 - totalW;
    const bg = this.add.graphics();
    bg.fillStyle(0xe8f0e8, 0.85);
    bg.fillRoundedRect(startX - 3, TAPE_Y - 4, totalW + 6, 8, 3);
    this.tapeContainer.add(bg);
    this.tapeState.slice(-Math.floor(totalW / cellW)).forEach((cell, i) => {
      const x = startX + i * cellW + cellW / 2;
      const disp = cell.kind === "space" ? "␣" : cell.kind === "newline" ? "⏎" : cell.ch;
      const color = cell.kind === "space" ? "#c2185b" : cell.kind === "newline" ? "#7b1fa2" : "#2e7d32";
      const t = this.add.text(x, TAPE_Y, disp, { font: "bold 7px Courier New", color }).setOrigin(0.5);
      this.tapeContainer.add(t);
    });
  }

  evaluateNextToken(cells) {
    let j = 0;
    while (j < cells.length && (cells[j].kind === "space" || cells[j].kind === "newline")) j++;
    const tokenStart = j;
    while (j < cells.length && cells[j].kind !== "space" && cells[j].kind !== "newline") j++;
    const strValue = cells.slice(tokenStart, j).map((c) => c.ch).join("");
    return { rawValue: strValue, consumedCount: j };
  }

  async tapeConsumeVisual(count) {
    this.tapeState = this.tapeState.slice(count);
    this.renderMiniTape();
    await this.delay(30);
  }

  // ══════════════════════════════════════════════════════════════
  // OUTPUT TICKER
  // ══════════════════════════════════════════════════════════════

  createMiniOutputTicker() {
    const tg = this.add.graphics();
    tg.fillStyle(0x050914, 0.9);
    tg.fillRect(OX + 8, TICKER_Y - 8, OW - 16, 16);
    this.tickerText = this.add.text(OX + 14, TICKER_Y, "", { font: "bold 10px Courier New", color: HEX_GREEN_BRIGHT }).setOrigin(0, 0.5);
    this.rigLayer.add([tg, this.tickerText]);
    this._tickerLines = [];
  }

  async printToTicker(text) {
    this._tickerLines.push(text);
    const joined = this._tickerLines.join(" ⏎ ");
    for (let i = this.tickerText.text.length; i <= joined.length; i++) {
      if (!this._alive) return;
      this.tickerText.setText(joined.slice(0, i));
      if (this.tickerText.width > OW - 26) this.tickerText.setFontSize(6.5);
      await this.delay(4);
    }
  }

  clearTicker() {
    this._tickerLines = [];
    if (this.tickerText) this.tickerText.setText("").setFontSize(8);
  }

  // ══════════════════════════════════════════════════════════════
  // VARIABLES STRIP
  // ══════════════════════════════════════════════════════════════

  createVariablesStrip() {
    const hdr = this.add.text(OX + 14, VARS_Y - 10, "VARIABLES", { font: "bold 9px Georgia", color: HEX_GOLD }).setAlpha(0.7);
    this.varsContainer = this.add.container(0, 0);
    this.rigLayer.add([hdr, this.varsContainer]);
  }

  clearVariablesStrip() { this.varsContainer.removeAll(true); }

  updateVariablesStrip(vars) {
    this.varsContainer.removeAll(true);
    let idx = 0;
    for (const name in vars) {
      const v = vars[name];
      const y = VARS_Y + idx * 11;
      const display = v.type === "String" ? `"${v.value}"` : String(v.value);
      const text = `${v.type} ${name}=${display}`.slice(0, 38);
      const t = this.add.text(OX + 20, y, text, { font: "bold 6.5px Courier New", color: v.type === "String" ? HEX_CREAM : v.type === "double" ? HEX_ORANGE : HEX_GOLD }).setOrigin(0, 0.5);
      this.varsContainer.add(t);
      idx++;
      if (idx >= 5) break;
    }
  }

  // ══════════════════════════════════════════════════════════════
  // MANIFEST STRIP / RESULT ROW
  // ══════════════════════════════════════════════════════════════

  createManifestStrip() {
    const g = this.add.graphics().setDepth(16);
    g.fillStyle(0x0f0a06, 0.92);
    g.fillRect(OX, MANIFEST_Y - 2, OW, 20);
    this.manifestStripText = this.add.text(OX + 8, MANIFEST_Y + 8, "", { font: "12px Arial", color: HEX_GOLD }).setOrigin(0, 0.5).setDepth(17);
    this.resultText = this.add.text(OX + OW - 8, MANIFEST_Y + 8, "—", { font: "bold 13px Courier New", color: HEX_GRAY }).setOrigin(1, 0.5).setDepth(17);
  }
  updateManifestStrip(text) { this.manifestStripText.setText(text); }

  updateResultRow(value, type) {
    if (!this.resultText) return;
    if (value === null) { this.resultText.setText("—").setColor(HEX_GRAY); return; }
    if (type === "crash") { this.resultText.setText("✗ ERROR").setColor(HEX_RED); return; }
    if (type === "void") { this.resultText.setText("void").setColor(HEX_GRAY); return; }
    this.resultText.setText(`→ ${value}`).setColor(HEX_GOLD);
  }

  // ══════════════════════════════════════════════════════════════
  // TEST REPORT / MISSION BRIEF
  // ══════════════════════════════════════════════════════════════

  createTestReportPanel() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0f0a06, 1);
    g.fillRoundedRect(RX, RY, RW, RH, 10);
    g.lineStyle(1, 0x3a2618, 1);
    g.strokeRoundedRect(RX, RY, RW, RH, 10);
    this.add.text(RX + 10, RY + 6, "TEST REPORT", { font: "bold 11px Arial", color: "#3d4450" }).setDepth(11);
    this.reportRows = [];
  }

  _compactTestLabel(test) {
    if (test.input) return `in: ${test.input.join(",")}`;
    if (test.substitutions) return Object.entries(test.substitutions).map(([k, v]) => `${k}=${v}`).join(", ").slice(0, 26);
    return "";
  }

  buildReportRows(mission) {
    this.reportRows.forEach((r) => r.container.destroy());
    this.reportRows = [];
    mission.tests.forEach((test, i) => {
      const y = RY + 24 + i * 24;
      const c = this.add.container(RX + 10, y).setDepth(11).setAlpha(0.35);
      const inputT = this.add.text(0, 0, this._compactTestLabel(test), { font: "11px Courier New", color: "#b0bec5" }).setOrigin(0, 0.5);
      const expT = this.add.text(190, 0, test.expectedOutput.replace(/⏎/g, " / ").slice(0, 22), { font: "11px Courier New", color: "#78909c" }).setOrigin(0, 0.5);
      const statusT = this.add.text(RW - 24, 0, "…", { font: "15px Arial", color: "#78909c" }).setOrigin(0.5);
      c.add([inputT, expT, statusT]);
      this.reportRows.push({ container: c, statusT });
    });
  }

  updateReportRow(index, pass) {
    const row = this.reportRows[index];
    if (!row) return;
    row.container.setAlpha(1);
    row.statusT.setText(pass ? "✓" : "✗").setColor(pass ? HEX_GREEN_BRIGHT : HEX_RED);
    if (!pass) this.tweens.add({ targets: row.container, x: row.container.x + 3, duration: 35, yoyo: true, repeat: 5 });
  }

  createMissionBriefPanel() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0a0d18, 1);
    g.fillRoundedRect(BX, BY, BW, BH, 10);
    g.lineStyle(1, 0x3a2618, 1);
    g.strokeRoundedRect(BX, BY, BW, BH, 10);
    this.briefContainer = this.add.container(0, 0).setDepth(11);
  }

  renderMissionBrief(mission) {
    this.briefContainer.removeAll(true);
    const badge = this.add.circle(BX + 24, BY + 24, 13, C_GOLD);
    const badgeNum = this.add.text(BX + 24, BY + 24, String(mission.mission), { font: "bold 15px Arial", color: "#0a0e14" }).setOrigin(0.5);
    const title = this.add.text(BX + 46, BY + 16, mission.title, { font: "bold 16px Arial", color: "#e8dfc8" }).setOrigin(0, 0.5);
    const brief = this.add.text(BX + 14, BY + 42, mission.brief, { font: "10.5px Arial", color: "#90a4ae", wordWrap: { width: BW - 28 } }).setOrigin(0, 0);
    const hint = this.add.text(BX + BW - 12, BY + BH - 12, "HINT", { font: "bold 13px Arial", color: "#546e7a" }).setOrigin(1, 1).setInteractive({ useHandCursor: true });
    hint.on("pointerover", () => hint.setColor(HEX_GOLD));
    hint.on("pointerout", () => hint.setColor("#546e7a"));
    hint.on("pointerdown", () => this.onHintPressed());
    this.briefContainer.add([badge, badgeNum, title, brief, hint]);
  }

  // ══════════════════════════════════════════════════════════════
  // HUD
  // ══════════════════════════════════════════════════════════════

  createHUD() {
    const g = this.add.graphics().setDepth(50);
    g.fillStyle(0x0a0704, 0.93);
    g.fillRect(0, 0, W, 64);
    g.lineStyle(1, 0x2a3654, 1);
    g.lineBetween(0, 64, W, 64);

    this.add.text(20, 14, "THE ASSAY BUREAU", { font: "bold 15px Georgia", color: "#b0bec5" }).setDepth(51);
    this.add.text(20, 32, "Restructuring Phase — Type Conversion: valueOf()", { font: "12px Arial", color: "#546e7a" }).setDepth(51);

    this.missionHexes = [];
    for (let i = 0; i < 6; i++) {
      const x = 490 + i * 26;
      const hx = this.add.graphics().setDepth(51);
      this.missionHexes.push({ g: hx, x, y: 32 });
    }
    this._drawHexes();

    this.add.text(1060, 10, "SCORE", { font: "11px Arial", color: "#546e7a" }).setDepth(51);
    this.scoreText = this.add.text(1060, 22, "0", { font: "bold 19px Arial", color: "#ffffff" }).setDepth(51);

    this.lifeIcons = [];
    for (let i = 0; i < 3; i++) {
      const lg = this.add.graphics({ x: 1150 + i * 26, y: 26 }).setDepth(51);
      lg.fillStyle(C_CREAM, 0.85);
      lg.fillRect(-4, -7, 8, 14);
      lg.lineStyle(1.2, C_COPPER, 1);
      lg.strokeRect(-4, -7, 8, 14);
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
    this.missionHexes.forEach(({ g }) => { this.tweens.killTweensOf(g); g.setAlpha(1); });
    this.missionHexes.forEach(({ g, x, y }, i) => {
      g.clear();
      if (i < this.currentMission) { g.fillStyle(C_GOLD, 1); this._drawHexPath(g, x, y, 9); g.fillPath(); }
      else if (i === this.currentMission) { g.lineStyle(2, C_GOLD, 1); this._drawHexPath(g, x, y, 9); g.strokePath(); }
      else { g.lineStyle(1, C_GRAY, 1); this._drawHexPath(g, x, y, 9); g.strokePath(); }
    });
    if (this.missionHexes[this.currentMission]) {
      const m = this.missionHexes[this.currentMission];
      this.tweens.add({ targets: m.g, alpha: 0.5, duration: 600, yoyo: true, repeat: -1 });
    }
  }

  // ══════════════════════════════════════════════════════════════
  // BIT — GRAND ASSAYER VARIANT (chain of office + master ledger)
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
    frock.lineStyle(1, C_GOLD, 0.7);
    frock.fillTriangle(-17, -12, 17, -12, 0, 22);
    const coat = this.add.graphics();
    coat.fillStyle(0xe8eaf6, 0.12);
    coat.lineStyle(1, 0xe8eaf6, 0.3);
    coat.fillTriangle(-15, -10, 15, -10, 0, 19);

    // Chain of office — gold links around the neck, with a triangle pendant
    const chainG = this.add.graphics();
    chainG.lineStyle(1.5, C_GOLD, 0.9);
    chainG.beginPath();
    chainG.arc(0, -14, 14, Phaser.Math.DegToRad(20), Phaser.Math.DegToRad(160), false);
    chainG.strokePath();
    this.chainPendant = this.add.container(0, 2);
    const pendG = this.add.graphics();
    pendG.lineStyle(1, C_GOLD, 1);
    pendG.lineBetween(0, -4, -3, 3);
    pendG.lineBetween(0, -4, 3, 3);
    pendG.lineBetween(-3, 3, 3, 3);
    pendG.fillStyle(C_GOLD, 0.4);
    pendG.fillTriangle(0, -4, -3, 3, 3, 3);
    this.chainPendant.add(pendG);

    const lenses = this.add.container(0, -26);
    const lensG = this.add.graphics();
    lensG.lineStyle(1.2, C_GOLD, 0.7);
    lensG.strokeCircle(-6, 0, 5);
    lensG.strokeCircle(6, 0, 5);
    lensG.lineBetween(-1, 0, 1, 0);
    lensG.fillStyle(C_GOLD, 0.15);
    lensG.fillCircle(-6, 0, 4.5);
    lensG.fillCircle(6, 0, 4.5);
    lenses.add(lensG);
    const gloveL = this.add.circle(-16, 10, 4, 0xffffff, 0).setStrokeStyle(1, 0xe8eaf6, 0.7);

    // Master ledger — larger than prior journals, brass clasp, held at side
    const ledger = this.add.container(17, 12);
    const ledgerG = this.add.graphics();
    ledgerG.fillStyle(0x1a0e05, 1);
    ledgerG.lineStyle(1, C_COPPER, 0.7);
    ledgerG.fillRoundedRect(-5, -9, 10, 15, 1);
    ledgerG.strokeRoundedRect(-5, -9, 10, 15, 1);
    ledgerG.lineStyle(1, C_GOLD, 0.7);
    ledgerG.lineBetween(-5, -1, 5, -1);
    ledger.add(ledgerG);

    c.add([g, frock, coat, chainG, this.chainPendant, eye, pupil, lenses, gloveL, ledger, tip]);
    this.tweens.add({ targets: tip, alpha: 0.3, duration: 900, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: this.chainPendant, alpha: 0.6, duration: 1100, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: c, y: "+=3", duration: 2000, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
    this.bit = c;
  }

  bitSay(text) {
    this.hideBubble();
    const inner = this.add.text(0, 0, text, { font: "15px Arial", color: "#e0e0e0", wordWrap: { width: 340 } });
    const bw = Math.min(inner.width, 340) + 30, bh = inner.height + 24;
    inner.setText("");
    const bx = Phaser.Math.Clamp(this.bit.x + 30, 20, W - bw - 20);
    const by = Phaser.Math.Clamp(this.bit.y - bh - 20, 80, H - bh - 20);
    const c = this.add.container(bx, by).setDepth(61).setAlpha(0).setScale(0.7);
    const g = this.add.graphics();
    g.fillStyle(0x1a1a2e, 0.97);
    g.fillRoundedRect(0, 0, bw, bh, 10);
    g.lineStyle(1.5, C_GOLD, 1);
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

  floatingAnnotation(x, y, text, colorHex) {
    const t = this.add.text(x, y, text, { font: "bold 13px Arial", color: colorHex }).setOrigin(0.5).setDepth(70).setAlpha(0);
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
    await this.bitSay("The Assay Bureau, Grand Assayer — the wing's highest office, where every conversion is recorded for posterity. You've smelted with parseInt, dissolved with parseDouble, and stamped with valueOf. Tonight you BUILD the programs that USE all three in concert — parse inputs, compute results, and inscribe the answers.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(5500)]); if (!A()) return;
    this.hideBubble();

    const a1 = this.floatingAnnotation(CX + CW / 2, CY - 16, "the complete conversion program", HEX_CYAN);
    await this.delay(400); if (!A()) return;
    const a2 = this.floatingAnnotation(PX + PW / 2, PY - 12, "blocks — one reverses the direction, one computes after converting", HEX_GRAY);
    await this.delay(400); if (!A()) return;
    const a3 = this.floatingAnnotation(OX + OW / 2, OY - 10, "ALL THREE instruments live — the triangle navigated", HEX_GREEN_BRIGHT);
    await this.delay(400); if (!A()) return;
    const a4 = this.floatingAnnotation(920, 44, "the wing watches", HEX_GOLD);
    await this.delay(400); if (!A()) return;
    const a5 = this.floatingAnnotation(RX + RW / 2, RY - 12, "every scenario must verify", HEX_BLUE_GRAY);
    await this.delay(400); if (!A()) return;

    await this.bitSay("The bureau's three laws: parse goes DOWN (text to number), valueOf goes UP (number to text), and compute happens IN BETWEEN. The triangle has a direction; follow it. Build, run, verify, repair. The wing seals tonight.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(5500)]); if (!A()) return;
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
    g.fillStyle(0x1a0e05, 1);
    g.fillRoundedRect(-260, -105, 520, 210, 12);
    g.lineStyle(2, C_GOLD, 1);
    g.strokeRoundedRect(-260, -105, 520, 210, 12);
    g.fillStyle(C_GOLD, 1);
    g.fillRect(-260, -105, 5, 210);
    const badge = this.add.circle(-225, -75, 18, C_GOLD);
    const badgeNum = this.add.text(-225, -75, String(mission.mission), { font: "bold 18px Arial", color: "#0a0e14" }).setOrigin(0.5);
    const title = this.add.text(-195, -85, mission.title, { font: "bold 21px Arial", color: "#ffffff" }).setOrigin(0, 0.5);
    const desc = this.add.text(-225, -35, mission.brief, { font: "12.5px Arial", color: "#b0bec5", wordWrap: { width: 460 } }).setOrigin(0, 0);

    const startBtn = this.add.container(0, 85).setDepth(1);
    const sg = this.add.graphics();
    sg.fillStyle(C_GOLD, 1);
    sg.fillRoundedRect(-70, -20, 140, 40, 20);
    const st = this.add.text(0, 0, "START", { font: "bold 15px Arial", color: "#0a0e14" }).setOrigin(0.5);
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
    this.clearMission();

    this.tabFilename.setText(`Bureau${mission.mission}.java`);
    this.renderSkeleton(mission);
    this.populatePalette(mission);
    this.buildReportRows(mission);
    this.renderMissionBrief(mission);
    this.disableRunButton();
    this.highlightCodeLine(null);
    this.verdictLamp.setFillStyle(C_GRAY);
    this.clearTripleApparatus();
    this.clearArithmeticStage();
    this.clearTicker();
    this.clearVariablesStrip();
    this.parkScannerCameo();
    this.updateManifestStrip("");
    this.updateResultRow(null, null);
    this.pulseCrest("idle");

    if (mission.isCrossWing) this.activateScannerCameo();

    this.inputLocked = false;
  }

  clearMission() {
    this.missionElements.forEach((e) => { if (e && e.destroy) e.destroy(); });
    this.missionElements = [];
  }

  // Multiple slots on one line (M6's summary line) require substituting
  // ALL markers per line, not just the first — the same defensive
  // multi-slot fix proven necessary since L73/L74.
  buildProgramItems(mission, assembled) {
    const out = [];
    mission.skeleton.forEach((rawLine) => {
      const slotMatches = [...rawLine.matchAll(/<slot:(\w+)>/g)];
      if (slotMatches.length > 0) {
        let text = rawLine;
        slotMatches.forEach((sm) => {
          const slotId = sm[1];
          const code = assembled[slotId] && assembled[slotId][0] ? assembled[slotId][0].code : "";
          text = text.split(`<slot:${slotId}>`).join(code);
        });
        out.push({ text, slotId: slotMatches[0][1] });
      } else {
        out.push({ text: rawLine, slotId: null });
      }
    });
    return out;
  }

  _substituteTestLine(line, test) {
    const m = line.match(/^(int|double|String)\s+(\w+)\s*=\s*\/\*[^*]*\*\/;$/);
    if (!m) return line;
    const type = m[1], name = m[2];
    if (!test.substitutions || !(name in test.substitutions)) return line;
    return `${type} ${name} = ${test.substitutions[name]};`;
  }

  // ══════════════════════════════════════════════════════════════
  // PROACTIVE-METRIC DETECTION
  // ══════════════════════════════════════════════════════════════

  _recordFirstRunMetrics(mission) {
    const key = `mission${mission.mission}`;
    if (this._firstRunMetricsRecorded[key]) return;
    this._firstRunMetricsRecorded[key] = true;

    if (mission.mission === 3) {
      this.triangleProactive[key] = this._slotCode("parseA") === "Integer.parseInt(a)"
        && this._slotCode("parseB") === "Integer.parseInt(b)"
        && this._slotCode("inscribe") === "String.valueOf(product)";
    }
    if (mission.mission === 4) {
      this.computeConvertClean[key] = this._slotCode("result") === "String.valueOf(a + b)";
    }
    if (mission.mission === 5) {
      this.pipelineClean[key] = this._slotCode("parse") === "Double.parseDouble(sc.nextLine())"
        && this._slotCode("inscribe") === "String.valueOf(doubled)";
    }
    if (mission.mission === 6) {
      this.pipelineClean[key] = this._slotCode("parseW") === "Double.parseDouble(sc.nextLine())"
        && this._slotCode("parseC") === "Integer.parseInt(sc.nextLine())"
        && this._slotCode("countStr") === "String.valueOf(count)"
        && this._slotCode("weightStr") === "String.valueOf(weight)";
    }
  }

  // ══════════════════════════════════════════════════════════════
  // RUN PIPELINE
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

  _pulseWrongBlocks() {
    for (const id in this.slotContents) {
      const placed = this.slotContents[id] && this.slotContents[id][0];
      if (!placed || !placed.container.getData("tag")) continue;
      const c = placed.container;
      const draw = c.getData("draw");
      if (draw) draw(C_RED);
      this.tweens.add({ targets: c, x: c.x + 4, duration: 40, yoyo: true, repeat: 5 });
      this.time.delayedCall(1400, () => { if (c.active && draw) draw(C_GOLD); });
    }
  }

  async onRunPressed() {
    if (this.inputLocked) return;
    this.inputLocked = true;
    this.disableRunButton();
    this.runButton.t.setText("...");
    this.runCount++;
    this.pulseCrest("session");
    const mission = MISSIONS[this.currentMission];
    const isFirstRun = this.runCount === this._runCountAtMissionStart + 1;
    const assembled = this.getAssembledCode();
    const wrongBlocksUsed = this._collectWrongBlocksUsed();

    const items = this.buildProgramItems(mission, assembled);

    let anyMismatch = false, anyCrash = false;
    const failedTests = [];
    for (let i = 0; i < mission.tests.length; i++) {
      if (!this._alive) return;
      const test = mission.tests[i];
      const outcome = await this.runTestCase(mission, test, i, items);
      if (!outcome.pass) { anyMismatch = true; failedTests.push(this._compactTestLabel(test)); }
      if (outcome.crashed) anyCrash = true;
    }

    if (isFirstRun) this._recordFirstRunMetrics(mission);
    const resultKind = anyMismatch ? (anyCrash ? "runtime_crash" : "logic_fail") : "pass";
    this._resolveRunOutcome(mission, resultKind, wrongBlocksUsed, failedTests);
  }

  async runTestCase(mission, test, index, items) {
    this.clearTripleApparatus();
    this.clearArithmeticStage();
    this.clearTicker();
    this.clearVariablesStrip();
    this.updateManifestStrip("");
    this.updateResultRow(null, null);

    if (mission.isCrossWing) { this.parkScannerCameo(); this.activateScannerCameo(); this.loadMiniTape(test.input); }

    this._printedLines = [];
    const execLines = items.map((it) => this._substituteTestLine(it.text, test));
    const coalesced = this._coalesceStatements(execLines);
    const runResult = await this.runStatements(coalesced, {});
    if (!this._alive) return { pass: false, crashed: false };

    const output = this._printedLines.join("⏎");
    const pass = runResult.ok && output === test.expectedOutput;
    this.verdictLamp.setFillStyle(pass ? C_GREEN_BRIGHT : C_RED);
    this.updateReportRow(index, pass);
    await this.delay(180);
    return { pass, crashed: !runResult.ok };
  }

  /**
   * Computes the 4 struggle-detection features from the first 3 missions'
   * attempt history and asks the backend's Isolation Forest model whether
   * this looks like typical or struggling play. Wired into FusionEngine so
   * the existing 'fusionAction' subscription can react to it, exactly like
   * the emotion/fatigue signals. Never throws — a failed/unreachable
   * backend just means no behavioral signal for this level; face and
   * fatigue detection keep working on their own regardless.
   *
   * This level uses the MISSIONS/currentMission architecture, not
   * ROUNDS/currentRound — attemptLog entries here carry `mission` (not
   * `round`) and have no `misconceptionTag` field on the main run-outcome
   * entries. misconception_repeat_count is the structural equivalent: a
   * failed run (`result !== "pass"`) whose wrongBlocks carried a tagged
   * distractor, mirroring "a wrong attempt attributable to a specific
   * misconception" from the ROUNDS-based levels.
   */
  async runBehavioralCheck() {
    const relevant = this.attemptLog.filter((a) => a.mission <= 3);
    const attempts_count = relevant.length;
    const time_taken_seconds = relevant.reduce((sum, a) => sum + a.timeMs, 0) / 1000;
    const misconception_repeat_count = relevant.filter(
      (a) => a.result !== "pass" && (a.wrongBlocks || []).some((b) => b && b.tag)
    ).length;
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
      console.warn("Level79Scene: /api/wellbeing/predict-struggle unreachable, skipping behavioral signal for this level:", e);
    }
  }

  _resolveRunOutcome(mission, result, wrongBlocksUsed, failedTests) {
    const timeMs = Math.round(this.time.now - this.missionStartTime);
    this.attemptLog.push({
      mission: mission.mission, runNumber: this.runCount, result,
      blocksUsed: Object.values(this.getAssembledCode()).flat().map((b) => b.code),
      wrongBlocks: wrongBlocksUsed, failedTests, timeMs, hintUsedBefore: this.missionHintUsed,
    });

    if (result === "pass") { this.onMissionComplete(); return; }

    this.pulseCrest("idle");
    this.failedRunCount++;
    this.missionRunsFailed++;
    this.runButton.t.setText("▶ RUN");
    this._pulseWrongBlocks();

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
    this.showBitFeedback(HINTS[mission.mission] || "Reread the brief carefully — the answer is in the wording.");
  }

  onMissionComplete() {
    if (this.currentMission === 2) this.runBehavioralCheck();
    if (this.gameEnded) return;
    const flawless = this.missionRunsFailed === 0 && !this.missionHintUsed;
    if (flawless) this.flawlessCount++;
    this.updateScore(250 + (flawless ? 100 : 0));
    if (flawless) this.createFloatingText(OX + OW / 2, OY - 12, "FLAWLESS +100", HEX_GOLD, "bold 16px Arial");
    this.pulseCrest("gold");

    this.missionFanfare().then(() => {
      if (!this._alive || this.gameEnded) return;
      const next = this.currentMission + 1;
      if (next >= MISSIONS.length) this.levelComplete();
      else this.showProjectBriefing(next);
    });
  }

  async missionFanfare() {
    this.verdictLamp.setFillStyle(C_GREEN_BRIGHT);
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
    const sil = this._instrumentSilhouettes[this.currentMission % this._instrumentSilhouettes.length];
    if (sil) this.tweens.add({ targets: sil.c, alpha: 0.5, duration: 200, yoyo: true, repeat: 2 });
    const mission = MISSIONS[this.currentMission];
    await this.bitSay(mission.postMissionNote || "Clean certification — the rig confirms it.");
    await Promise.race([this.waitForClick(), this.delay(2400)]);
    this.hideBubble();
    await this.delay(400);
  }

  // ══════════════════════════════════════════════════════════════
  // UNIFIED INTERPRETER — merges L76's parseInt/parseDouble/(int)-cast/
  // Scanner/printf/arithmetic cascade with String.valueOf (routes to
  // the mini press, never fails). Two fixes caught by hand-tracing
  // this level's own missions before writing any evaluator code:
  //
  //  1. parseInt/parseDouble now gate on the resolved argument's TYPE
  //     (must be genuinely "String") before running the furnace/
  //     crucible — the fix L77 introduced for its own parseInt round.
  //     L76's version never needed this gate because every one of ITS
  //     distractors that misused parseInt/parseDouble happened to sit
  //     in a direct declVar assignment, where the OUTER type check
  //     already caught the mismatch. L79's M5 (`Double.parseDouble
  //     (doubled)`, doubled already a double) and M6 (`Integer.
  //     parseInt(count)`, count already an int) both call the wrong-
  //     direction parser INSIDE a larger concatenation expression, not
  //     a direct assignment — without the gate, String(argRes.value)
  //     would silently stringify the already-numeric argument and the
  //     furnace/crucible would "parse" it right back to the SAME
  //     value, making a direction_confusion distractor accidentally
  //     produce the CORRECT output. Verified by direct trace before
  //     writing code, then added the gate to close the gap.
  //
  //  2. Mission 6's skeleton wraps ONE Java statement across three
  //     array lines (no semicolon until the third) for readability,
  //     matching real Java line-wrapping style. Every prior
  //     restructuring level's skeleton had exactly one statement per
  //     line, so the execStatement/runStatements pair never needed to
  //     handle continuation — feeding M6's three lines through
  //     independently would silently no-op all three (none end up
  //     matching any statement regex on their own) and leave `summary`
  //     undefined. Fixed with _coalesceStatements(), which buffers
  //     lines until one ends in ';' before handing the joined text to
  //     the statement executor.
  // ══════════════════════════════════════════════════════════════

  _coalesceStatements(lines) {
    const out = [];
    let buffer = "";
    for (const raw of lines) {
      const line = raw.trim();
      if (!line) continue;
      buffer += (buffer ? " " : "") + line;
      if (/;\s*$/.test(line)) { out.push(buffer); buffer = ""; }
    }
    if (buffer.trim()) out.push(buffer);
    return out;
  }

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

  _splitTopArgs(argsStr) {
    const parts = [];
    let cur = "", depth = 0, inQuotes = false;
    for (let i = 0; i < argsStr.length; i++) {
      const ch = argsStr[i];
      if (ch === '"' && argsStr[i - 1] !== "\\") inQuotes = !inQuotes;
      if (!inQuotes) {
        if (ch === "(" || ch === "{" || ch === "[") depth++;
        if (ch === ")" || ch === "}" || ch === "]") depth--;
        if (ch === "," && depth === 0) { parts.push(cur.trim()); cur = ""; continue; }
      }
      cur += ch;
    }
    const last = cur.trim();
    if (last || parts.length) parts.push(last);
    return parts.filter((p) => p !== "");
  }

  _javaToString(value, type) {
    if (type === "double") return Number.isInteger(value) ? `${value}.0` : String(value);
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
      const truncated = Math.trunc(Number(inner.value));
      if (inner.type === "double") await this.runCastAnimation(inner.value, truncated);
      return { ok: true, value: truncated, type: "int" };
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
          const sum = Number(accValue) + numVal;
          await this.runArithmeticAnimation(accValue, op || "+", partVal, sum);
          accValue = sum;
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
          const prevAcc = accValue;
          if (op === "*") accValue = accValue * Number(r.value);
          else accValue = bothInt ? Math.trunc(accValue / Number(r.value)) : accValue / Number(r.value);
          await this.runArithmeticAnimation(prevAcc, op, r.value, accValue);
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
      await this.runPressConversion(argRes.value, argRes.type, strRepr);
      this.updateResultRow(strRepr, "String");
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
      const outcome = await this.runCrucibleConversion(strVal);
      if (!outcome.ok) { this.updateResultRow(null, "crash"); return { ok: false, crash: "nfe" }; }
      this.updateResultRow(this._javaToString(outcome.value, "double"), "double");
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
      const outcome = await this.runFurnaceConversion(strVal);
      if (!outcome.ok) { this.updateResultRow(null, "crash"); return { ok: false, crash: "nfe" }; }
      this.updateResultRow(outcome.value, "int");
      return { ok: true, value: outcome.value, type: "int" };
    }

    if (t === "sc.nextLine()") {
      const read = this.evaluateNextToken(this.tapeState);
      await this.tapeConsumeVisual(read.consumedCount);
      return { ok: true, value: read.rawValue, type: "String" };
    }
    if (t === "sc.nextInt()") {
      const read = this.evaluateNextToken(this.tapeState);
      await this.tapeConsumeVisual(read.consumedCount);
      return { ok: true, value: parseInt(read.rawValue, 10) || 0, type: "int" };
    }

    const staticCallMatch = t.match(/^(\w+)\.(\w+)\(/);
    if (staticCallMatch) {
      this.showCompileErrorStamp();
      return { ok: false, crash: "compile" };
    }

    if (/^\(\w+\)\s*\w+$/.test(t)) {
      this.showCompileErrorStamp();
      return { ok: false, crash: "compile" };
    }

    if (/^".*"$/.test(t)) return { ok: true, value: t.slice(1, -1), type: "String" };
    if (/^[+-]?\d+\.\d+$/.test(t)) return { ok: true, value: parseFloat(t), type: "double" };
    if (/^[+-]?\d+$/.test(t)) return { ok: true, value: parseInt(t, 10), type: "int" };

    if (vars[t] !== undefined) return { ok: true, value: vars[t].value, type: vars[t].type };

    this.showRuntimeHaltStamp();
    return { ok: false, crash: "eval" };
  }

  async execStatement(line, vars) {
    if (/^Scanner\s+\w+\s*=\s*new\s+Scanner\(System\.in\)\s*;$/.test(line)) return { ok: true };

    const declVar = line.match(/^(int|double|String)\s+(\w+)\s*=\s*(.*);$/);
    if (declVar) {
      const varType = declVar[1], name = declVar[2], rhs = declVar[3].trim();

      if (rhs === "sc.nextLine()" || rhs === "sc.nextInt()") {
        const validCombo = (varType === "String" && rhs === "sc.nextLine()") || (varType === "int" && rhs === "sc.nextInt()");
        if (!validCombo) {
          this.showCompileErrorStamp();
          return { ok: false, crash: "compile" };
        }
        this.updateManifestStrip(`${varType} ${name} = ${rhs}`);
        const read = this.evaluateNextToken(this.tapeState);
        await this.tapeConsumeVisual(read.consumedCount);
        const value = rhs === "sc.nextInt()" ? (parseInt(read.rawValue, 10) || 0) : read.rawValue;
        vars[name] = { value, type: varType, kind: "scalar" };
        this.updateVariablesStrip(vars);
        return { ok: true };
      }

      const r = await this.resolveExpr(rhs, vars);
      if (!r.ok) return r;
      if (varType === "double" && r.type === "String") { this.showCompileErrorStamp(); return { ok: false, crash: "compile" }; }
      if (varType === "int" && r.type !== "int") { this.showCompileErrorStamp(); return { ok: false, crash: "compile" }; }
      if (varType === "String" && r.type !== "String") { this.showCompileErrorStamp(); return { ok: false, crash: "compile" }; }
      vars[name] = { value: r.value, type: varType, kind: "scalar" };
      this.updateVariablesStrip(vars);
      return { ok: true };
    }

    const printMatch = line.match(/^System\.out\.println\((.*)\);$/);
    if (printMatch) {
      this.updateManifestStrip("System.out.println(…)");
      const r = await this.resolveExpr(printMatch[1].trim(), vars);
      if (!r.ok) return r;
      if (!this._printedLines) this._printedLines = [];
      const s = this._javaToString(r.value, r.type);
      this._printedLines.push(s);
      await this.printToTicker(s);
      return { ok: true };
    }

    const printfMatch = line.match(/^System\.out\.printf\((.*)\);$/);
    if (printfMatch) {
      this.updateManifestStrip("System.out.printf(…)");
      const parts = this._splitTopArgs(printfMatch[1].trim());
      let fmt = parts[0].replace(/^"(.*)"$/, "$1");
      for (let i = 1; i < parts.length; i++) {
        const r = await this.resolveExpr(parts[i].trim(), vars);
        if (!r.ok) return r;
        const specMatch = fmt.match(/%\.(\d+)f/);
        if (specMatch) fmt = fmt.replace(/%\.(\d+)f/, Number(r.value).toFixed(parseInt(specMatch[1], 10)));
      }
      fmt = fmt.replace(/%n/g, "");
      fmt = fmt.replace(/%%/g, "%");
      if (!this._printedLines) this._printedLines = [];
      this._printedLines.push(fmt);
      await this.printToTicker(fmt);
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

  // ══════════════════════════════════════════════════════════════
  // SCORING & LIVES
  // ══════════════════════════════════════════════════════════════

  updateScore(points) {
    this.score = Math.max(0, this.score + points);
    this.scoreText.setText(String(this.score));
  }

  loseLife() {
    this.lives = Math.max(0, this.lives - 1);
    const icon = this.lifeIcons[this.lives];
    if (icon) this.tweens.add({ targets: icon, alpha: 0.12, duration: 320 });
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

    (async () => {
      this.clearTripleApparatus();
      this.clearArithmeticStage();
      this.clearTicker();
      this.clearVariablesStrip();
      this.parkScannerCameo();
      this._wingCrest.c.setAlpha(0.1);
      this._instrumentSilhouettes.forEach(({ c }) => this.tweens.add({ targets: c, alpha: 0.05, duration: 500 }));
      const motes = this.ambient;
      this.ambient = null;
      (motes || []).forEach((m) => this.tweens.add({ targets: m, y: 632, alpha: 0, duration: 1500, ease: "Sine.easeIn" }));

      const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
      this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });
      const title = this.add.text(640, 240, "BUREAU CLOSED", { font: "bold 32px Georgia", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
      this.tweens.add({ targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut", onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }) });
      this.add.text(640, 310, `Score: ${this.score}`, { font: "21px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
      this.add.text(640, 350, `Missions Published: ${this.currentMission} / 6`, { font: "18px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);
      this._makeButton(525, 420, "REOPEN THE BUREAU", 200, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
      this._makeButton(755, 420, "RETURN TO MENU", 200, 50, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.start("MenuScene"));
    })();
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearMission();
    this.hideBubble();

    try { GameManager.completeLevel(78, Math.round((this.flawlessCount / MISSIONS.length) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("string_valueOf_mastery"); } catch (_) {}
    try { BadgeSystem.unlock("type_conversion_wing_seal"); } catch (_) {}
    try {
      localStorage.setItem("level79_results", JSON.stringify({
        level: 79, concept: "string_valueOf", phase: "restructuring",
        score: this.score, missionsCompleted: 6, flawlessMissions: this.flawlessCount,
        totalRuns: this.runCount, failedRuns: this.failedRunCount, hintsUsed: this.hintCount,
        selfCorrections: this.selfCorrectionCount,
        fullTriangleProactive: this.triangleProactive,
        computeThenConvertClean: this.computeConvertClean,
        fullPipelineClean: this.pipelineClean,
        livesRemaining: this.lives, attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.triggerWingFinaleCeremony();
  }

  // ══════════════════════════════════════════════════════════════
  // THE TYPE CONVERSION WING SEAL — 5-phase finale ceremony
  // ══════════════════════════════════════════════════════════════

  async triggerWingFinaleCeremony() {
    await this.ceremonyPhase1_Fanfare();
    if (!this._alive) return;
    await this.ceremonyPhase2_InstrumentsAssemble();
    if (!this._alive) return;
    await this.ceremonyPhase3_CentralPanel();
    if (!this._alive) return;
    await this.ceremonyPhase4_WingSeal();
    if (!this._alive) return;
    await this.ceremonyPhase5_BitClosingAddress();
    if (!this._alive) return;
    this.showScoreTally();
  }

  async ceremonyPhase1_Fanfare() {
    this._chandelier.arms.forEach((a) => this.tweens.add({ targets: a, alpha: 1, scale: 1.6, duration: 350, yoyo: true }));
    this._chandelier.sparkles.forEach((s) => this.tweens.add({ targets: s, alpha: 1, duration: 350, yoyo: true }));
    this.screenShake(0.003, 200);
    this._ledgerLines.forEach((lg, i) => {
      this.tweens.add({ targets: lg, alpha: 0.5, duration: 70, delay: i * 12, yoyo: true });
    });
    this._instrumentSilhouettes.forEach((s) => this.tweens.add({ targets: s.c, alpha: 1, duration: 400 }));
    this.tweens.add({ targets: this.chainPendant, alpha: 1, duration: 400 });

    await new Promise((res) => {
      this.tweens.add({ targets: this._wingCrest.c, x: 640, y: 210, scale: 2.2, duration: 900, ease: "Sine.easeInOut", onComplete: res });
    });
    this.pulseCrest("gold");
    await this.delay(300);
  }

  async ceremonyPhase2_InstrumentsAssemble() {
    const cx = 640, cy = 210;
    const makeMiniIcon = (startX, startY, endX, endY, colorHex, colorText, label) => {
      const c = this.add.container(startX, startY).setDepth(89).setAlpha(0).setScale(0.6);
      const g = this.add.graphics();
      g.lineStyle(2, colorHex, 1);
      g.strokeRoundedRect(-16, -16, 32, 32, 4);
      g.fillStyle(colorHex, 0.25);
      g.fillRoundedRect(-16, -16, 32, 32, 4);
      const t = this.add.text(0, 24, label, { font: "bold 10px Georgia", color: colorText }).setOrigin(0.5);
      c.add([g, t]);
      this.tweens.add({ targets: c, alpha: 1, duration: 300 });
      this.tweens.add({ targets: c, x: endX, y: endY, scale: 1, duration: 900, ease: "Cubic.easeInOut" });
      return c;
    };
    const sils = this._instrumentSilhouettes;
    this._ceremonyFurnace = makeMiniIcon(sils[0].c.x, sils[0].c.y, cx - 70, cy + 24, C_COPPER, HEX_COPPER, "parseInt");
    this._ceremonyCrucible = makeMiniIcon(sils[1].c.x, sils[1].c.y, cx + 70, cy + 24, C_ORANGE, HEX_ORANGE, "parseDouble");
    this._ceremonyPress = makeMiniIcon(sils[2].c.x, sils[2].c.y, cx, cy + 74, C_CREAM, HEX_CREAM, "valueOf");
    await this.delay(1000);

    const arrowG = this.add.graphics().setDepth(88).setAlpha(0);
    arrowG.lineStyle(2, C_GOLD, 0.8);
    arrowG.lineBetween(cx, cy, cx - 70, cy + 24);
    arrowG.lineBetween(cx, cy, cx + 70, cy + 24);
    arrowG.lineStyle(2, C_CREAM, 0.6);
    arrowG.lineBetween(cx - 70, cy + 24, cx, cy + 74);
    arrowG.lineBetween(cx + 70, cy + 24, cx, cy + 74);
    this._ceremonyArrows = arrowG;
    this.tweens.add({ targets: arrowG, alpha: 1, duration: 400 });
    await this.delay(1000);
  }

  async ceremonyPhase3_CentralPanel() {
    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
    this.tweens.add({ targets: ov, fillAlpha: 0.85, duration: 500 });
    this._ceremonyElements = [ov];

    const panel = this.add.graphics().setDepth(90);
    panel.fillStyle(0x0c0818, 1);
    panel.fillRoundedRect(320, 60, 640, 480, 16);
    panel.lineStyle(2, C_GOLD, 1);
    panel.strokeRoundedRect(320, 60, 640, 480, 16);
    this._ceremonyElements.push(panel);

    const title = this.add.text(640, 100, "GRAND ASSAYER", { font: "bold 34px Georgia", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(91).setScale(0);
    this.tweens.add({ targets: title, scale: 1, duration: 350, ease: "Back.easeOut" });
    this._ceremonyElements.push(title);

    const triPct = Object.values(this.triangleProactive).some(Boolean) ? "✓" : "✗";
    const compPct = Object.values(this.computeConvertClean).some(Boolean) ? "✓" : "✗";
    const pipePct = `${Object.values(this.pipelineClean).filter(Boolean).length}/2`;
    const lines = [
      "MISSIONS: 6/6",
      `FLAWLESS: ${this.flawlessCount}`,
      `SELF-CORRECTIONS: ${this.selfCorrectionCount}`,
      `FULL TRIANGLE: ${triPct}`,
      `COMPUTE-THEN-CONVERT: ${compPct}`,
      `FULL PIPELINE: ${pipePct}`,
      `HINTS: ${this.hintCount}`,
    ];
    lines.forEach((s, i) => {
      const t = this.add.text(370, 140 + i * 22, s, { font: "15px Arial", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 250, delay: 300 + i * 110 });
      this._ceremonyElements.push(t);
    });
    const totalText = this.add.text(370, 140 + 7 * 22, "TOTAL: 0", { font: "bold 21px Arial", color: HEX_GOLD }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: totalText, alpha: 1, duration: 250, delay: 1150 });
    const counter = { v: 0 };
    this.tweens.add({ targets: counter, v: this.score, duration: 900, delay: 1150, onUpdate: () => totalText.setText(`TOTAL: ${Math.round(counter.v)}`) });
    this._ceremonyElements.push(totalText);

    const stars = this._starRating();
    for (let i = 0; i < 3; i++) {
      const earned = i < stars;
      const s = this.add.text(640 + (i - 1) * 60, 380, "★", { font: "40px Arial", color: earned ? HEX_GOLD : "#2a3040" }).setOrigin(0.5).setDepth(91).setScale(0);
      this.tweens.add({ targets: s, scale: 1, duration: 250, delay: 1650 + i * 200, ease: earned ? "Back.easeOut" : "Cubic.easeOut" });
      this._ceremonyElements.push(s);
    }

    const badge = this.add.container(640, 450).setDepth(91).setAlpha(0);
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillCircle(0, 0, 34);
    bg.lineStyle(3, C_GOLD, 1);
    bg.strokeCircle(0, 0, 34);
    const pressIcon = this.add.text(-14, -6, "🖨️", { font: "bold 13px Arial" }).setOrigin(0.5);
    const wax = this.add.text(0, -6, "🕯️", { font: "bold 13px Arial" }).setOrigin(0.5);
    const chain = this.add.text(14, -6, "⛓️", { font: "bold 13px Arial" }).setOrigin(0.5);
    badge.add([bg, pressIcon, wax, chain]);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 2250 });
    const badgeLbl = this.add.text(640, 492, "valueOf() MASTERY", { font: "bold 15px Georgia", color: HEX_GOLD }).setOrigin(0.5).setDepth(91).setAlpha(0);
    const badgeSub = this.add.text(640, 508, "Accretion ✓  Tuning ✓  Restructuring ✓", { font: "12px Arial", color: "#78909c" }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: [badgeLbl, badgeSub], alpha: 1, duration: 300, delay: 2400 });
    this._ceremonyElements.push(badge, badgeLbl, badgeSub);

    await this.delay(3200);
  }

  async ceremonyPhase4_WingSeal() {
    const banner = this.add.container(640 - 480, 580).setDepth(92);
    const bg = this.add.graphics();
    bg.fillStyle(0x0c0818, 1);
    bg.lineStyle(3, C_GOLD, 1);
    bg.fillRoundedRect(-240, -40, 480, 80, 6);
    bg.strokeRoundedRect(-240, -40, 480, 80, 6);
    bg.fillStyle(C_ORANGE, 0.5);
    bg.fillCircle(-230, 0, 3);
    bg.fillCircle(230, 0, 3);
    const title = this.add.text(0, -22, "TYPE CONVERSION WING — COMPLETE", { font: "bold 17px Georgia", color: HEX_GOLD }).setOrigin(0.5);
    banner.add([bg, title]);
    this._ceremonyElements.push(banner);

    await new Promise((res) => { this.tweens.add({ targets: banner, x: 640, duration: 500, ease: "Back.easeOut", onComplete: res }); });

    const cols = [
      { x: -140, label: "parseInt() ✓", icon: "🧱", color: HEX_COPPER },
      { x: 0, label: "parseDouble() ✓", icon: "⚗️", color: HEX_ORANGE },
      { x: 140, label: "valueOf() ✓", icon: "🖨️", color: HEX_CREAM },
    ];
    for (const col of cols) {
      const icon = this.add.text(banner.x + col.x - 14, banner.y + 8, col.icon, { font: "12px Arial" }).setOrigin(0.5).setDepth(93).setAlpha(0);
      const lbl = this.add.text(banner.x + col.x, banner.y + 8, col.label, { font: "bold 13px Georgia", color: col.color }).setOrigin(0.5).setDepth(93).setAlpha(0);
      this._ceremonyElements.push(icon, lbl);
      this.tweens.add({ targets: [icon, lbl], alpha: 1, scale: { from: 1.4, to: 1 }, duration: 200 });
      this.screenShake(0.0015, 60);
      await this.delay(400);
    }

    const caption = this.add.text(640, banner.y + 28, "9 levels · 3 methods · one office of conversion", { font: "italic 13px Georgia", color: HEX_CYAN }).setOrigin(0.5).setDepth(93).setAlpha(0);
    this.tweens.add({ targets: caption, alpha: 0.85, duration: 300 });
    this._ceremonyElements.push(caption);
    await this.delay(400);

    // The floating wing crest locks into the banner's center — seal-press
    await new Promise((res) => {
      this.tweens.add({ targets: this._wingCrest.c, x: 640, y: banner.y - 2, scale: 0.5, duration: 400, ease: "Cubic.easeIn", onComplete: res });
    });
    this.tweens.add({ targets: this._wingCrest.c, scale: 0.35, duration: 90, yoyo: true });
    this.screenShake(0.006, 200);
    const shock = this.add.circle(640, banner.y, 6, C_GOLD, 0.6).setDepth(94);
    this.tweens.add({ targets: shock, scale: 14, alpha: 0, duration: 550, onComplete: () => shock.destroy() });

    [this._ceremonyFurnace, this._ceremonyCrucible, this._ceremonyPress].forEach((c) => {
      if (c) this.tweens.add({ targets: c, x: 640, y: banner.y - 20, alpha: 0, scale: 0.4, duration: 400 });
    });
    if (this._ceremonyArrows) this.tweens.add({ targets: this._ceremonyArrows, alpha: 0, duration: 300 });

    const flame = this.add.circle(640, banner.y - 60, 4, C_GOLD, 0.7).setDepth(93);
    this.tweens.add({ targets: flame, scale: 12, alpha: 0, y: banner.y - 120, duration: 600, onComplete: () => flame.destroy() });

    this.createWingConfetti(640, banner.y, 50);
    await this.delay(900);

    const flash = this.add.rectangle(W / 2, H / 2, W, H, 0xffffff, 0).setDepth(94);
    this.tweens.add({ targets: flash, fillAlpha: 0.35, duration: 200, yoyo: true, onComplete: () => flash.destroy() });
    await this.delay(400);
  }

  async ceremonyPhase5_BitClosingAddress() {
    await new Promise((res) => { this.tweens.add({ targets: this.bit, x: 640, y: 610, duration: 500, ease: "Sine.easeInOut", onComplete: res }); });
    this.tweens.add({ targets: this.chainPendant, alpha: 1, duration: 400 });
    await this.bitSay("Nine levels of the Type Conversion Wing — parseInt SMELTED text into solid integers, parseDouble DISSOLVED text into flowing decimals, valueOf INSCRIBED every value back onto paper. Three static methods, three directions on one triangle, one office of transformation. You can parse, compute, and publish — the conversion between text and number is no longer a mystery but a tool. Seven wings sealed, Grand Assayer. One remains beyond the assay office doors.");
    if (!this._alive) return;
    await Promise.race([this.waitForClick(), this.delay(8000)]);
    this.hideBubble();
  }

  _starRating() {
    if (this.flawlessCount >= 4 && this.hintCount <= 1) return 3;
    if (this.failedRunCount <= 3) return 2;
    return 1;
  }

  showScoreTally() {
    this._makeButton(500, 640, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(770, 640, "NEXT WING →", 260, 44, { fill: 0x00733a, stroke: C_GREEN_BRIGHT, textColor: "#ffffff" }, () => {
      this.scene.start("MenuScene");
    });
  }

  _makeButton(x, y, label, w, h, style, onClick, depth = 95) {
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
