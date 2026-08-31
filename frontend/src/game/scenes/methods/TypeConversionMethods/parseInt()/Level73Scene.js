/**
 * Level 73 — "The Conversion Works" (Type Conversion Wing: Restructuring
 * Phase — Integer.parseInt() trilogy finale)
 * ===========================================================================
 * The learner CONSTRUCTS complete conversion-and-computation programs — no
 * multiple choice. Reuses the L27→L70 code-canvas/parts-bin/RUN
 * architecture. The rig hosts a compact Conversion Furnace (from L71/L72)
 * and a mini Arithmetic Stage where converted values combine.
 *
 * A genuine unified mini-interpreter executes the assembled program:
 * parseInt (character-validated, honest furnace choreography, real NFE),
 * String.trim() (chained before parseInt), Math.abs (cross-wing callback
 * to the Math Wing), Scanner (sc.nextLine()/sc.nextInt(), including as
 * NESTED expressions inside parseInt — not just top-level declarations),
 * +, -, *, / arithmetic with correct precedence (+ split before * and /,
 * matching L72's fix), and println concatenation. Wrong builds yield REAL
 * outcomes — never scripted: M1's raw-String build is a genuine compile
 * error (String assigned to int); M2's concat-then-parse build actually
 * runs and prints a wrong total (a runtime-correct, logically-wrong
 * build — the most dangerous kind); M4's untrimmed build genuinely NFEs
 * on the embedded spaces; M5's abs-less build genuinely goes negative on
 * the one test where the second input is larger.
 *
 * SPEC CORRECTIONS (caught by hand-tracing every mission before writing
 * any code, per the established discipline):
 *  1. Mission 2's `Integer.parseInt(a + b)` distractor was authored with
 *     no slotId, but the skeleton's two-slot structure
 *     (`<slot:left> + <slot:right>`) has no single slot that could hold
 *     an expression spanning both operands — there is no way to drop it
 *     in as written. Assigned it to slotId "left" (paired with the
 *     correct right slot); traced through: with a="40",b="60" it
 *     resolves to parseInt("40"+"60") + parseInt("60") = parseInt("4060")
 *     + 60 = 4120, failing test 1's expected "Sum: 100" (and similarly
 *     diverging on test 3) — still genuinely wrong, just via a different
 *     number than the spec's inline explanation assumed. Reworded the
 *     misconception feedback to state the CONCEPTUAL error (smelts the
 *     concatenated string) without asserting a specific wrong total that
 *     depends on which slot it lands in.
 *  2. Mission 3's `sc.nextInt()` distractor (for the `read` slot, feeding
 *     `String input = <slot:read>;`) was documented as "alsoCorrect but
 *     bypasses the mission's purpose" — but sc.nextInt() returns a
 *     primitive int, and assigning an int to a String variable is a
 *     genuine Java COMPILE ERROR (incompatible types), not a working
 *     bypass. Reclassified as a real wrongTag with a compile-error
 *     outcome (the evaluator's declVar check already flags
 *     varType==="String" && resolvedType!=="String"). Mission 6's
 *     otherwise-identical `sc.nextInt()` cartridge is UNCHANGED — there
 *     it fills `int price = <slot:convertPrice>;`, an int-typed target,
 *     so assigning int-returning nextInt() is perfectly legal Java; it
 *     genuinely IS an also-correct bypass in that mission, just not in
 *     Mission 3.
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
const TUTORIAL_KEY = "level73_tutorial_done";

// Rig internal layout — mini furnace (left), mini arithmetic stage
// (right), variables strip (below both), Scanner tape (top edge,
// only visible for cross-wing missions), output ticker (bottom).
const TAPE_Y = OY + 14;
const M_HOPPER_X0 = OX + 20, M_HOPPER_X1 = OX + 140, M_HOPPER_Y0 = OY + 30, M_HOPPER_Y1 = OY + 52;
const M_GATE_X0 = OX + 30, M_GATE_X1 = OX + 130, M_GATE_Y0 = OY + 56, M_GATE_Y1 = OY + 82;
const M_CHAMBER_X0 = OX + 24, M_CHAMBER_X1 = OX + 136, M_CHAMBER_Y0 = OY + 86, M_CHAMBER_Y1 = OY + 128;
const M_FURNACE_CX = (M_HOPPER_X0 + M_HOPPER_X1) / 2;
const M_CONT_X = OX + 80, M_CONT_Y = OY + 132;
const STAGE_X0 = OX + 180, STAGE_X1 = OX + 440, STAGE_Y0 = OY + 34, STAGE_Y1 = OY + 130;
const VARS_Y = OY + 150;
const TICKER_Y = OY + 205;
const INT_MAX = 2147483647, INT_MIN = -2147483648;

// ══════════════════════════════════════════════════════════════
// MISSION CONFIGURATION
// ══════════════════════════════════════════════════════════════
const MISSIONS = [
  // ── Mission 1: The First Ingot ──
  { mission: 1, title: "The First Ingot",
    brief: "Convert a price String to an int and compute the total for 3 items.\nFor price = \"25\":\nTotal: 75",
    skeleton: [
      "String priceStr = /* test value */;",
      "",
      "int price = <slot:convert>;",
      "int total = price * 3;",
      'System.out.println("Total: " + total);',
    ],
    slots: [{ id: "convert", hint: "smelt the String" }],
    palette: [
      { code: "Integer.parseInt(priceStr)", correct: true, slotId: "convert" },
      { code: "priceStr", tag: "string_is_number_belief", slotId: "convert" },
      { code: "int.parseInt(priceStr)", tag: "lowercase_integer_belief", slotId: "convert" },
      { code: "Integer.parseDouble(priceStr)", tag: "wrong_parse_method", slotId: "convert" },
      { code: "priceStr.parseInt()", tag: "parseInt_instance_call_belief", slotId: "convert" },
    ],
    tests: [
      { substitutions: { priceStr: '"25"' }, expectedOutput: "Total: 75" },
      { substitutions: { priceStr: '"100"' }, expectedOutput: "Total: 300" },
      { substitutions: { priceStr: '"0"' }, expectedOutput: "Total: 0" },
    ],
    postMissionNote: "Bit: 'String in, int out, math from there. The furnace smelted once; arithmetic ran three times over. Without parseInt, the String would have refused to multiply — the compiler catches type mismatches before any fire lights.'",
    concept: "basic_convert_compute" },

  // ── Mission 2: The Sum Ledger (FLAGSHIP — convert-before-arithmetic) ──
  { mission: 2, title: "The Sum Ledger",
    brief: "Two values arrive as Strings. Convert BOTH and compute their sum.\nFor a = \"40\", b = \"60\":\nSum: 100",
    skeleton: [
      "String a = /* test value */;",
      "String b = /* test value */;",
      "",
      "int sum = <slot:left> + <slot:right>;",
      'System.out.println("Sum: " + sum);',
    ],
    slots: [
      { id: "left", hint: "convert first operand" },
      { id: "right", hint: "convert second operand" },
    ],
    isFlagship: true,
    palette: [
      { code: "Integer.parseInt(a)", correct: true, slotId: "left" },
      { code: "a", tag: "unconverted_operand_belief", slotId: "left" },
      { code: "Integer.parseInt(a + b)", tag: "concat_then_parse_belief", slotId: "left" },
      { code: "Integer.parseInt(b)", correct: true, slotId: "right" },
      { code: "b", tag: "unconverted_operand_belief", slotId: "right" },
    ],
    tests: [
      { substitutions: { a: '"40"', b: '"60"' }, expectedOutput: "Sum: 100" },
      { substitutions: { a: '"0"', b: '"0"' }, expectedOutput: "Sum: 0" },
      { substitutions: { a: '"-10"', b: '"30"' }, expectedOutput: "Sum: 20" },
    ],
    postMissionNote: "Bit (pressing the medallion): 'BOTH operands — one furnace each. parseInt(a + b) smelts the CONCATENATED string, not each value separately — the addition needs to happen AFTER both operands already exist as ints. Conversion first, arithmetic second — the order that makes + mean addition.'",
    concept: "convert_both_flagship" },

  // ── Mission 3: The Scanner Pipeline ──
  { mission: 3, title: "The Scanner Pipeline",
    brief: "Read a number as text from the user, convert it, and compute its square.\nFor input \"7\":\nSquare: 49",
    skeleton: [
      "Scanner sc = new Scanner(System.in);",
      "",
      "String input = <slot:read>;",
      "int num = <slot:convert>;",
      "int square = num * num;",
      'System.out.println("Square: " + square);',
    ],
    slots: [
      { id: "read", hint: "read from user" },
      { id: "convert", hint: "smelt to int" },
    ],
    isCrossWing: true,
    palette: [
      { code: "sc.nextLine()", correct: true, slotId: "read" },
      { code: "sc.nextInt()", tag: "nextInt_bypass_belief", slotId: "read" },
      { code: "Integer.parseInt(input)", correct: true, slotId: "convert" },
      { code: "input", tag: "string_is_number_belief", slotId: "convert" },
      { code: "(int) input", tag: "cast_string_to_int_belief", slotId: "convert" },
    ],
    tests: [
      { input: ["7"], expectedOutput: "Square: 49" },
      { input: ["12"], expectedOutput: "Square: 144" },
      { input: ["0"], expectedOutput: "Square: 0" },
    ],
    postMissionNote: "Bit: 'nextLine reads text; parseInt smelts it; math runs on the result. This is EXACTLY what nextInt does internally — read the characters, validate, convert. Now you see the machinery inside the Scanner's convenience method.'",
    concept: "scanner_parseInt_pipeline" },

  // ── Mission 4: The Trimmed Conversion ──
  { mission: 4, title: "The Trimmed Conversion",
    brief: "The data arrives with WHITESPACE. Trim it before converting.\nFor raw = \" 42 \":\nValue: 42",
    skeleton: [
      "String raw = /* test value with spaces */;",
      "",
      "int value = <slot:convert>;",
      'System.out.println("Value: " + value);',
    ],
    slots: [{ id: "convert", hint: "trim THEN smelt" }],
    palette: [
      { code: "Integer.parseInt(raw.trim())", correct: true, slotId: "convert" },
      { code: "Integer.parseInt(raw)", tag: "parseInt_strips_spaces_belief", slotId: "convert" },
      { code: "Integer.trim(raw)", tag: "trim_on_wrong_class", slotId: "convert" },
      { code: "raw.trim()", tag: "trim_returns_int_belief", slotId: "convert" },
      { code: "Integer.parseInt(raw).trim()", tag: "trim_after_parse_belief", slotId: "convert" },
    ],
    tests: [
      { substitutions: { raw: '" 42 "' }, expectedOutput: "Value: 42" },
      { substitutions: { raw: '"  100  "' }, expectedOutput: "Value: 100" },
      { substitutions: { raw: '" -7 "' }, expectedOutput: "Value: -7" },
    ],
    postMissionNote: "Bit: 'Trim first, smelt second — raw.trim() strips the spaces and returns a clean String; parseInt smelts the clean String into an int. trim is a String method (called ON the String); parseInt is a static method (called ON Integer, with the String as argument). Chain them: Integer.parseInt(raw.trim()).'",
    concept: "trim_before_parse" },

  // ── Mission 5: The Difference Report (Scanner + parseInt + arithmetic) ──
  { mission: 5, title: "The Difference Report",
    brief: "Read two values as Strings, convert both, and compute the absolute difference.\nFor inputs \"80\" and \"53\":\nDifference: 27",
    skeleton: [
      "Scanner sc = new Scanner(System.in);",
      "",
      "int first = Integer.parseInt(sc.nextLine());",
      "int second = <slot:convert>;",
      "int diff = <slot:formula>;",
      'System.out.println("Difference: " + diff);',
    ],
    slots: [
      { id: "convert", hint: "read and convert the second" },
      { id: "formula", hint: "absolute difference" },
    ],
    isCrossWing: true,
    palette: [
      { code: "Integer.parseInt(sc.nextLine())", correct: true, slotId: "convert" },
      { code: "sc.nextLine()", tag: "unconverted_operand_belief", slotId: "convert" },
      { code: "Math.abs(first - second)", correct: true, slotId: "formula" },
      { code: "first - second", tag: "abs_missing", slotId: "formula" },
      { code: "Math.abs(first + second)", tag: "abs_on_sum_belief", slotId: "formula" },
    ],
    tests: [
      { input: ["80", "53"], expectedOutput: "Difference: 27" },
      { input: ["10", "30"], expectedOutput: "Difference: 20" },
      { input: ["50", "50"], expectedOutput: "Difference: 0" },
    ],
    postMissionNote: "Bit: 'Scanner reads, parseInt smelts, Math.abs measures the gap. Three wings in one pipeline: Intake, Type Conversion, Math. The unguarded subtraction failed when the second number was larger — abs erases the sign. Cross-wing thinking.'",
    concept: "scanner_parseInt_abs_pipeline" },

  // ── Mission 6: The Inventory Calculator (GRAND CAPSTONE) ──
  { mission: 6, title: "The Inventory Calculator",
    brief: "Process an inventory record: read item name, quantity, and unit price (all as Strings from Scanner), convert the numbers, compute the line total, and publish a formatted report.\nFor inputs \"Widget\", \"12\", \"8\":\nItem: Widget\nQty: 12  Price: 8\nLine Total: 96",
    skeleton: [
      "Scanner sc = new Scanner(System.in);",
      "",
      "String name = sc.nextLine();",
      "int qty = <slot:convertQty>;",
      "int price = <slot:convertPrice>;",
      "int lineTotal = <slot:compute>;",
      "",
      'System.out.println("Item: " + name);',
      'System.out.println("Qty: " + qty + "  Price: " + price);',
      'System.out.println("Line Total: " + lineTotal);',
    ],
    slots: [
      { id: "convertQty", hint: "read & convert quantity" },
      { id: "convertPrice", hint: "read & convert price" },
      { id: "compute", hint: "compute the total" },
    ],
    isCapstone: true,
    palette: [
      { code: "Integer.parseInt(sc.nextLine())", correct: true, slotId: "convertQty" },
      { code: "sc.nextLine()", tag: "unconverted_operand_belief", slotId: "convertQty" },
      { code: "Integer.parseInt(sc.nextLine())", correct: true, slotId: "convertPrice" },
      { code: "sc.nextInt()", correct: true, alsoCorrect: true, slotId: "convertPrice" },
      { code: "qty * price", correct: true, slotId: "compute" },
      { code: "qty + price", tag: "wrong_arithmetic_op", slotId: "compute" },
      { code: '"qty" * "price"', tag: "strings_in_arithmetic_belief", slotId: "compute" },
    ],
    tests: [
      { input: ["Widget", "12", "8"], expectedOutput: "Item: Widget⏎Qty: 12  Price: 8⏎Line Total: 96" },
      { input: ["Bolt", "100", "1"], expectedOutput: "Item: Bolt⏎Qty: 100  Price: 1⏎Line Total: 100" },
      { input: ["Gear", "0", "50"], expectedOutput: "Item: Gear⏎Qty: 0  Price: 50⏎Line Total: 0" },
    ],
    postMissionNote: "Bit (setting the conversion manual down with finality): 'The full pipeline: Scanner reads three lines — one stays as text (the name), two pass through the furnace (qty and price). Arithmetic runs on the ints; println publishes the report. Master Assayer — the works publishes under your name. The next furnace burns hotter: decimals await.'",
    concept: "inventory_capstone" },
];

const MISCONCEPTION_FEEDBACK = {
  unconverted_operand_belief: "The String can't participate in int arithmetic — the compiler stamps INCOMPATIBLE TYPES. Convert with parseInt first, then compute.",
  string_is_number_belief: "The String looks like a number but IS text. The compiler sees the type, not the content. parseInt converts; nothing else will.",
  concat_then_parse_belief: "parseInt(a + b) smelts the CONCATENATED string as a single value — not each operand separately. Convert each operand ALONE, then add the resulting ints.",
  parseInt_strips_spaces_belief: "parseInt does NOT trim — spaces are not digits. Trim first: raw.trim() strips the whitespace, THEN parseInt smelts the clean digits.",
  trim_after_parse_belief: "parseInt returns an int — ints don't have a trim() method. Trim the STRING first, then parse: Integer.parseInt(raw.trim()).",
  trim_on_wrong_class: "trim() is a STRING method — called on the String object, not on Integer. raw.trim(), not Integer.trim(raw).",
  trim_returns_int_belief: "trim() returns a String (the trimmed text), not an int. You still need parseInt to convert the trimmed String to a number.",
  cast_string_to_int_belief: "(int) only works between compatible numeric types (double → int). String is not a number — you can't cast text into an int. Only parseInt converts.",
  nextInt_bypass_belief: "sc.nextInt() returns an int directly — but here the slot feeds a String-typed variable. Assigning an int to a String is a COMPILE ERROR (incompatible types). Use sc.nextLine() to read text; THEN parseInt converts it explicitly.",
  abs_missing: "Without abs, the difference is negative when the second number is larger: 10 - 30 = -20. Math.abs ensures the gap is always positive.",
  abs_on_sum_belief: "abs(first + second) is the absolute SUM, not the difference. The difference is first - second; abs just removes the sign.",
  wrong_arithmetic_op: "qty + price adds them (12 + 8 = 20); qty * price multiplies them (12 × 8 = 96). A line total is quantity TIMES price.",
  strings_in_arithmetic_belief: "String literals in quotes can't multiply — \"qty\" is text, not a variable. The variables qty and price (already converted to ints) are the operands.",
  lowercase_integer_belief: "int is a primitive keyword, no methods. Integer (capital I) is the wrapper class that holds parseInt.",
  parseInt_instance_call_belief: "parseInt is STATIC on Integer — Integer.parseInt(str), not str.parseInt(). The furnace lives on the class.",
  wrong_parse_method: "parseDouble isn't even a method on Integer — that furnace belongs to Double. The int container needs Integer.parseInt.",
  parseInt_returns_string_belief: "parseInt returns int, not String. The bar that exits the furnace is metal, not paper.",
  timeout: "Check the report — the rig shows exactly what your code actually does.",
};

const HINTS = {
  1: "Integer.parseInt(priceStr) — smelt the String, then multiply the resulting int.",
  2: "Integer.parseInt(a) in the left slot, Integer.parseInt(b) in the right slot — convert BOTH before adding.",
  3: "sc.nextLine() to read text; Integer.parseInt(input) to smelt it. Math runs on the int.",
  4: "Integer.parseInt(raw.trim()) — trim the String first, THEN convert the clean result.",
  5: "Integer.parseInt(sc.nextLine()) for the second read; Math.abs(first - second) so the gap is always positive.",
  6: "Integer.parseInt(sc.nextLine()) for both qty and price; qty * price for the line total.",
};

export class Level73Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level73Scene" });
  }

  init() {
    this.currentMission = 0;
    this.score = 0;
    this.lives = 5;
    this.flawlessCount = 0;
    this.runCount = 0;
    this.failedRunCount = 0;
    this.hintCount = 0;
    this.selfCorrectionCount = 0;
    this.conversionProactive = {};
    this.trimClean = {};
    this.crossWingClean = {};
    this.scannerClean = {};
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
    this.firstOverflowAnnotationShown = false;
  }

  preload() {}

  create() {
    this._alive = true;
    this.createParticleTexture();
    this.createBackground();
    this.createWorksInterior();
    this.createQualitySeal();
    this.createWorksFloor();
    this.createAmbientParticles();
    this.createCodeCanvas();
    this.createBlockPalette();
    this.createRunButton();
    this.createRigWindow();
    this.createMiniFurnace();
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
    this.updateSealPulse(time);
    this.updateFurnaceGlow(time);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // SETUP — THE CONVERSION WORKS INTERIOR
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l73_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l73_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x0c0818).setDepth(0);
  }

  createWorksInterior() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x120c22, 1);
    g.fillRect(0, 0, W, 30);

    // Production manifest board
    g.fillStyle(0x0c0818, 0.6);
    g.lineStyle(3, C_COPPER, 1);
    g.fillRect(200, 30, 580, 140);
    g.strokeRect(200, 30, 580, 140);
    this._manifestCards = [];
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 4; c++) {
        const cx = 230 + c * 135, cy = 55 + r * 55;
        const cardG = this.add.graphics().setDepth(2);
        cardG.fillStyle(C_COPPER, 0.15);
        cardG.lineStyle(1, C_COPPER, 0.3);
        cardG.fillRoundedRect(cx, cy, 110, 40, 3);
        cardG.strokeRoundedRect(cx, cy, 110, 40, 3);
        const dot = this.add.circle(cx + 10, cy + 10, 3, 0xffa726, 0.5).setDepth(3);
        this._manifestCards.push({ g: cardG, dot, cx, cy });
      }
    }

    // Safety poster (left wall)
    const sp = this.add.graphics().setDepth(2);
    sp.lineStyle(1, C_RED, 0.4);
    sp.strokeRect(60, 100, 80, 100);
    sp.lineStyle(1, 0xe0d6c8, 0.4);
    sp.strokeRect(70, 115, 60, 16);
    sp.lineStyle(2, C_RED, 0.4);
    sp.lineBetween(70, 115, 130, 131);
    sp.lineBetween(130, 115, 70, 131);
    this.add.text(100, 175, "VALIDATE BEFORE\nSMELTING", { font: "bold 8px Georgia", color: HEX_RED, align: "center" }).setOrigin(0.5).setAlpha(0.4).setDepth(3);

    // Finished-ingots shelf (right wall)
    const shelf = this.add.graphics().setDepth(2);
    shelf.lineStyle(1.5, C_COPPER, 0.5);
    shelf.strokeRect(1140, 100, 100, 100);
    shelf.lineBetween(1140, 170, 1240, 170);
    this._ingotShelf = [];
    [ [1160, 160, 14, 8], [1185, 155, 18, 10], [1215, 150, 22, 12] ].forEach(([x, y, w, h]) => {
      const ig = this.add.graphics().setDepth(3);
      ig.fillStyle(C_COPPER, 0.25);
      ig.fillRoundedRect(x - w / 2, y - h / 2, w, h, 2);
      this._ingotShelf.push({ g: ig, x, y, w, h });
    });

    // Banner
    const bg = this.add.graphics().setDepth(2);
    bg.fillStyle(0x0c0818, 1);
    bg.lineStyle(1, C_COPPER, 0.5);
    bg.fillRoundedRect(400, 12, 380, 26, 3);
    bg.strokeRoundedRect(400, 12, 380, 26, 3);
    this.add.text(590, 25, "T H E   C O N V E R S I O N   W O R K S", { font: "bold 14px Georgia", color: HEX_COPPER }).setOrigin(0.5).setAlpha(0.7).setDepth(3);
  }

  createQualitySeal() {
    const c = this.add.container(880, 56).setDepth(4);
    const g = this.add.graphics();
    g.lineStyle(2, C_COPPER, 1);
    g.strokeCircle(0, 0, 18);
    const label = this.add.text(0, 0, "QA", { font: "bold 12px Georgia", color: HEX_CYAN }).setOrigin(0.5);
    c.add([g, label]);
    c.setAlpha(0.4);
    this._qaSeal = { c, g, label, state: "idle" };
  }

  pulseSeal(state) {
    const s = this._qaSeal;
    s.state = state;
    if (state === "idle") s.c.setAlpha(0.4);
    else if (state === "session") s.c.setAlpha(0.8);
    else if (state === "gold") {
      this.tweens.add({
        targets: s.c, scaleX: 0, duration: 150,
        onComplete: () => {
          s.g.lineStyle(2, C_GOLD, 1);
          s.g.strokeCircle(0, 0, 18);
          s.label.setColor(HEX_GOLD);
          s.c.setAlpha(1);
          this.tweens.add({ targets: s.c, scaleX: 1, duration: 150 });
        },
      });
    }
  }

  updateSealPulse(time) {
    if (!this._qaSeal || this._qaSeal.state !== "session") return;
    this._qaSeal.c.setAlpha(0.6 + Math.abs(Math.sin(time * 0.006)) * 0.4);
  }

  createWorksFloor() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x0a0612, 1);
    g.fillRect(0, 635, W, 85);
    g.lineStyle(1, 0x0e0a1a, 0.5);
    g.lineBetween(0, 637, W, 637);
    g.fillStyle(C_COPPER, 0.15);
    for (let x = 0; x < W; x += 100) g.fillRect(x, 637, 3, 83);
  }

  createAmbientParticles() {
    this.ambient = [];
    const colors = [0x3949ab, 0xb87333, 0x42a5f5];
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
    const p = this.add.particles(x, y, "l73_dot", {
      speed: { min: 80, max: 240 }, angle: { min: 0, max: 360 }, scale: { start: 0.9, end: 0 }, lifespan: 500,
      tint: [C_COPPER, C_INDIGO, C_GOLD, 0xffffff], emitting: false,
    }).setDepth(95);
    p.explode(count);
    this.time.delayedCall(900, () => p.destroy());
  }

  createTrilogyConfetti(x, y, count = 40) {
    const p = this.add.particles(x, y, "l73_dot", {
      speed: { min: 100, max: 280 }, angle: { min: 0, max: 360 }, scale: { start: 1, end: 0 }, lifespan: 700,
      tint: [C_GOLD, C_COPPER, C_INDIGO, 0xffffff], emitting: false,
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
    this.tabFilename = this.add.text(CX + CW - 12, CY + TAB_H / 2, "Convert1.java", { font: "13px Courier New", color: "#546e7a" }).setOrigin(1, 0.5).setDepth(11);

    this.lineHighlight = this.add.rectangle(CX + CW / 2, 0, CW - 4, LINE_H, 0xffab00, 0.06).setDepth(19).setVisible(false);
    this.codeContainer = this.add.container(0, 0).setDepth(20);
  }

  _syntaxTokens(line) {
    const tokens = [];
    const re = /("(?:[^"\\]|\\.)*")|(\bimport\b|\bfor\b|\bint\b|\bdouble\b|\bString\b|\bnew\b|\bScanner\b)|(\bMath\b|\bInteger\b)|(\.parseInt\b|\.trim\b|\.abs\b|\.nextInt\b|\.nextLine\b|\.println\b)|(\bSystem\.out\b|\bSystem\.in\b)|(-?\d+\.\d+|-?\d+)|(>=|<=|==|!=|\+\+|--|[+\-*/><?:])|([(){}\[\];.,=])/g;
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
    this.add.text(PX + 10, PY + 8, "ASSAYER'S PARTS", { font: "bold 11px Arial", color: "#3d4450" }).setDepth(11);
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
      draw(C_COPPER);
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
      c.on("pointerout", () => { if (!this.inputLocked) draw(C_COPPER); });
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
    g.lineStyle(3, C_COPPER, 1);
    g.strokeRoundedRect(OX, OY, OW, OH, 12);
    this.add.text(OX + 10, OY + 6, "WORKS RIG — LIVE", { font: "bold 11px Georgia", color: HEX_COPPER }).setAlpha(0.7).setDepth(11);

    const maskShape = this.make.graphics({ x: 0, y: 0, add: false });
    maskShape.fillRoundedRect(OX + 4, OY + 20, OW - 8, OH - 24, 10);
    this.windowMask = maskShape.createGeometryMask();
    this.rigLayer = this.add.container(0, 0).setDepth(15);
    this.rigLayer.setMask(this.windowMask);

    this.verdictLamp = this.add.circle(OX + OW - 18, OY + 14, 6, C_GRAY).setDepth(20);
  }

  // ══════════════════════════════════════════════════════════════
  // MINI CONVERSION FURNACE (compact L71/L72 furnace)
  // ══════════════════════════════════════════════════════════════

  createMiniFurnace() {
    const g = this.add.graphics();
    g.lineStyle(2, C_COPPER, 1);
    g.fillStyle(0x0c0818, 0.8);
    g.beginPath();
    g.moveTo(M_HOPPER_X0, M_HOPPER_Y0); g.lineTo(M_HOPPER_X1, M_HOPPER_Y0);
    g.lineTo(M_FURNACE_CX + 12, M_HOPPER_Y1); g.lineTo(M_FURNACE_CX - 12, M_HOPPER_Y1);
    g.closePath();
    g.fillPath(); g.strokePath();

    g.lineStyle(1.5, C_CYAN, 1);
    g.fillStyle(0x0c0818, 0.5);
    g.fillRoundedRect(M_GATE_X0, M_GATE_Y0, M_GATE_X1 - M_GATE_X0, M_GATE_Y1 - M_GATE_Y0, 4);
    g.strokeRoundedRect(M_GATE_X0, M_GATE_Y0, M_GATE_X1 - M_GATE_X0, M_GATE_Y1 - M_GATE_Y0, 4);
    this.gateBarrier = this.add.rectangle((M_GATE_X0 + M_GATE_X1) / 2, M_GATE_Y0 + 3, M_GATE_X1 - M_GATE_X0 - 6, 3, C_RED, 0);

    g.lineStyle(2, C_COPPER, 1);
    g.fillStyle(0x1a0e05, 0.85);
    g.fillRoundedRect(M_CHAMBER_X0, M_CHAMBER_Y0, M_CHAMBER_X1 - M_CHAMBER_X0, M_CHAMBER_Y1 - M_CHAMBER_Y0, 6);
    g.strokeRoundedRect(M_CHAMBER_X0, M_CHAMBER_Y0, M_CHAMBER_X1 - M_CHAMBER_X0, M_CHAMBER_Y1 - M_CHAMBER_Y0, 6);
    const vcx = (M_CHAMBER_X0 + M_CHAMBER_X1) / 2, vcy = (M_CHAMBER_Y0 + M_CHAMBER_Y1) / 2;
    this.furnaceGlow = this.add.rectangle(vcx, vcy, M_CHAMBER_X1 - M_CHAMBER_X0 - 8, M_CHAMBER_Y1 - M_CHAMBER_Y0 - 8, 0x42a5f5, 0.25);

    const contG = this.add.graphics();
    contG.fillStyle(0x0c0818, 0.9);
    contG.lineStyle(1.5, C_GOLD, 1);
    contG.fillRoundedRect(M_CONT_X - 40, M_CONT_Y, 80, 16, 4);
    contG.strokeRoundedRect(M_CONT_X - 40, M_CONT_Y, 80, 16, 4);
    this.containerValueText = this.add.text(M_CONT_X, M_CONT_Y + 8, "int —", { font: "bold 11px Courier New", color: HEX_GRAY }).setOrigin(0.5);

    this.rigLayer.add([g, this.gateBarrier, this.furnaceGlow, contG, this.containerValueText]);
    this.furnaceDynamicLayer = this.add.container(0, 0);
    this.rigLayer.add(this.furnaceDynamicLayer);
  }

  updateFurnaceGlow(time) {
    if (!this.furnaceGlow) return;
    const base = this._furnaceGlowGold ? 0xffd740 : 0x42a5f5;
    this.furnaceGlow.setFillStyle(base, 0.2 + Math.abs(Math.sin(time * 0.002)) * 0.1);
  }

  clearFurnace() {
    this.furnaceDynamicLayer.removeAll(true);
    this.gateBarrier.setAlpha(0);
    this.containerValueText.setText("int —").setColor(HEX_GRAY);
  }

  async materializePaperStrip(value) {
    const strip = this.add.container(M_FURNACE_CX, M_HOPPER_Y0 + 4).setAlpha(0);
    const bg = this.add.graphics();
    const w = Math.max(34, value.length * 7 + 10), h = 14;
    bg.fillStyle(0xe0d6c8, 1);
    bg.lineStyle(1, 0x8a6435, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 2);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 2);
    const txt = this.add.text(0, 0, value, { font: "bold 10px Courier New", color: "#241a0e" }).setOrigin(0.5);
    if (txt.width > w - 6) txt.setFontSize(6);
    strip.add([bg, txt]);
    this.furnaceDynamicLayer.add(strip);
    this._currentStrip = { container: strip, bg, txt, w, value };
    this.tweens.add({ targets: strip, alpha: 1, duration: 110 });
    await this.delay(130);
    return this._currentStrip;
  }

  async runTrimAnimation(raw, trimmed) {
    if (raw === trimmed) return;
    const strip = this._currentStrip;
    if (!strip) return;
    const leadSpaces = raw.length - raw.trimStart().length;
    const trailSpaces = raw.length - raw.trimEnd().length;
    for (let i = 0; i < leadSpaces + trailSpaces; i++) {
      const speck = this.add.rectangle(strip.container.x + Phaser.Math.Between(-strip.w / 2, strip.w / 2), strip.container.y, 3, 3, 0x78909c, 0.7);
      this.furnaceDynamicLayer.add(speck);
      this.tweens.add({ targets: speck, y: speck.y + Phaser.Math.Between(8, 16), alpha: 0, duration: 220, onComplete: () => speck.destroy() });
    }
    await this.delay(160);
    strip.txt.setText(trimmed);
    strip.value = trimmed;
    const newW = Math.max(34, trimmed.length * 7 + 10);
    strip.bg.clear();
    strip.bg.fillStyle(0xe0d6c8, 1);
    strip.bg.lineStyle(1, 0x8a6435, 1);
    strip.bg.fillRoundedRect(-newW / 2, -7, newW, 14, 2);
    strip.bg.strokeRoundedRect(-newW / 2, -7, newW, 14, 2);
    strip.w = newW;
    await this.delay(100);
  }

  async feedStripDown() {
    const strip = this._currentStrip;
    if (!strip) return;
    await new Promise((res) => {
      this.tweens.add({ targets: strip.container, y: (M_GATE_Y0 + M_GATE_Y1) / 2, duration: 160, ease: "Sine.easeIn", onComplete: res });
    });
  }

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
    const startX = strip ? strip.container.x - strip.w / 2 + 8 : M_FURNACE_CX - 10;
    const y = (M_GATE_Y0 + M_GATE_Y1) / 2;
    const showCount = validMatch ? chars.length : invalidIndex + 1;
    const step = strip ? Math.min(8, (strip.w - 10) / Math.max(chars.length, 1)) : 8;
    for (let i = 0; i < showCount; i++) {
      if (!this._alive) return { allValid: true, invalidIndex: -1 };
      const isLast = i === showCount - 1;
      const isValid = validMatch || !isLast;
      const spotX = startX + i * step;
      const spot = this.add.circle(spotX, y, 4, isValid ? C_GREEN_BRIGHT : C_RED, isValid ? 0.35 : 0.6);
      this.furnaceDynamicLayer.add(spot);
      this.tweens.add({ targets: spot, alpha: 0, duration: 200, delay: 90, onComplete: () => spot.destroy() });
      await this.delay(85);
    }
    return { allValid: validMatch, invalidIndex };
  }

  async openGate() {
    await new Promise((res) => { this.tweens.add({ targets: this.gateBarrier, alpha: 0, duration: 50, onComplete: res }); });
  }

  async slamGate() {
    this.gateBarrier.setFillStyle(C_RED, 0.9).setAlpha(1);
    const flash = this.add.rectangle((M_GATE_X0 + M_GATE_X1) / 2, (M_GATE_Y0 + M_GATE_Y1) / 2, M_GATE_X1 - M_GATE_X0, M_GATE_Y1 - M_GATE_Y0, C_RED, 0.4);
    this.furnaceDynamicLayer.add(flash);
    this.tweens.add({ targets: flash, alpha: 0, duration: 200, onComplete: () => flash.destroy() });
    await this.delay(70);
  }

  async ejectStrip() {
    const strip = this._currentStrip;
    if (!strip) return;
    for (let i = 0; i < 3; i++) {
      const spark = this.add.circle(strip.container.x + Phaser.Math.Between(-6, 6), strip.container.y, 1.2, C_RED, 0.8);
      this.furnaceDynamicLayer.add(spark);
      this.tweens.add({ targets: spark, y: spark.y + Phaser.Math.Between(6, 16), alpha: 0, duration: 200, onComplete: () => spark.destroy() });
    }
    await new Promise((res) => {
      this.tweens.add({ targets: strip.container, y: M_HOPPER_Y0 - 12, alpha: 0, duration: 130, ease: "Sine.easeIn", onComplete: () => { strip.container.destroy(); res(); } });
    });
    this._currentStrip = null;
  }

  async burnStrip() {
    const strip = this._currentStrip;
    if (!strip) return;
    await new Promise((res) => {
      this.tweens.add({ targets: strip.container, y: (M_CHAMBER_Y0 + M_CHAMBER_Y1) / 2, duration: 100, ease: "Sine.easeIn", onComplete: res });
    });
    for (let i = 0; i < 3; i++) {
      const ember = this.add.circle(strip.container.x + Phaser.Math.Between(-8, 8), strip.container.y, 1.2, C_ORANGE, 0.7);
      this.furnaceDynamicLayer.add(ember);
      this.tweens.add({ targets: ember, y: ember.y - Phaser.Math.Between(10, 22), alpha: 0, duration: 260, onComplete: () => ember.destroy() });
    }
    await new Promise((res) => {
      this.tweens.add({ targets: strip.container, alpha: 0, scale: 0.6, duration: 220, onComplete: () => { strip.container.destroy(); res(); } });
    });
    this._currentStrip = null;
  }

  async formIntegerBar(value) {
    const bar = this.add.container((M_CHAMBER_X0 + M_CHAMBER_X1) / 2, (M_CHAMBER_Y0 + M_CHAMBER_Y1) / 2).setAlpha(0).setScale(0.6);
    const bg = this.add.graphics();
    const w = Math.max(38, String(value).length * 8 + 10), h = 18;
    bg.fillStyle(C_COPPER, 1);
    bg.lineStyle(1.2, 0x8a6435, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 3);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 3);
    const txt = this.add.text(0, 0, String(value), { font: "bold 11px Courier New", color: "#241a0e" }).setOrigin(0.5);
    if (txt.width > w - 6) txt.setFontSize(7);
    bar.add([bg, txt]);
    this.furnaceDynamicLayer.add(bar);
    const glow = this.add.circle((M_CHAMBER_X0 + M_CHAMBER_X1) / 2, (M_CHAMBER_Y0 + M_CHAMBER_Y1) / 2, 24, C_GOLD, 0.3);
    this.furnaceDynamicLayer.add(glow);
    this.tweens.add({ targets: [bar], alpha: 1, scale: 1, duration: 130, ease: "Back.easeOut" });
    this.tweens.add({ targets: glow, alpha: 0, duration: 260, onComplete: () => glow.destroy() });
    await this.delay(160);
    this._currentBar = bar;
    return bar;
  }

  async slideBarToContainer(value) {
    const bar = this._currentBar;
    if (bar) {
      await new Promise((res) => {
        this.tweens.add({ targets: bar, x: M_CONT_X, y: M_CONT_Y + 8, scale: 0.5, alpha: 0, duration: 170, ease: "Sine.easeIn", onComplete: () => { bar.destroy(); res(); } });
      });
      this._currentBar = null;
    }
    this.containerValueText.setText(`int ${value}`).setColor(HEX_GOLD);
    this.tweens.add({ targets: this.containerValueText, scale: 1.2, duration: 80, yoyo: true });
    await this.delay(90);
  }

  async showNFE() {
    this.screenShake(0.005, 200);
    const banner = this.add.text(M_FURNACE_CX, (M_CHAMBER_Y0 + M_CHAMBER_Y1) / 2, "NFE!", { font: "bold 12px Courier New", color: HEX_RED }).setOrigin(0.5).setScale(1.1).setAlpha(0);
    this.furnaceDynamicLayer.add(banner);
    this.tweens.add({ targets: banner, alpha: 1, scale: 1, duration: 110 });
    await this.delay(700);
    if (banner.active) this.tweens.add({ targets: banner, alpha: 0, duration: 180, onComplete: () => banner.destroy() });
    this.containerValueText.setText("✗ NFE").setColor(HEX_RED);
  }

  async showOverflowNFE() {
    this.screenShake(0.006, 220);
    const shudder = this.add.rectangle((M_CHAMBER_X0 + M_CHAMBER_X1) / 2, (M_CHAMBER_Y0 + M_CHAMBER_Y1) / 2, M_CHAMBER_X1 - M_CHAMBER_X0, M_CHAMBER_Y1 - M_CHAMBER_Y0, C_RED, 0.35);
    this.furnaceDynamicLayer.add(shudder);
    this.tweens.add({ targets: shudder, alpha: 0, duration: 300, onComplete: () => shudder.destroy() });
    await this.showNFE();
  }

  showCompileErrorStamp() {
    const stamp = this.add.text(OX + OW / 2, OY + 100, "COMPILE ERROR", { font: "bold 15px Arial", color: HEX_RED }).setOrigin(0.5).setDepth(30).setScale(1.3).setAngle(-6).setAlpha(0);
    this.missionElements.push(stamp);
    this.rigLayer.add(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 130 });
    this.screenShake(0.004, 110);
    this.time.delayedCall(750, () => { if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 160, onComplete: () => stamp.destroy() }); });
  }

  showRuntimeHaltStamp() {
    const stamp = this.add.text(OX + OW / 2, OY + 100, "BUILD HALTED", { font: "bold 14px Arial", color: HEX_RED }).setOrigin(0.5).setDepth(30).setScale(1.2).setAngle(-4).setAlpha(0);
    this.missionElements.push(stamp);
    this.rigLayer.add(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 130 });
    this.screenShake(0.004, 110);
    this.time.delayedCall(750, () => { if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 160, onComplete: () => stamp.destroy() }); });
  }

  /** The full honest conversion choreography: strip in, (optionally
   * trimmed), inspected character-by-character, and EITHER smelted into
   * an int bar OR rejected with a NumberFormatException — character
   * validity and numeric range (overflow) are checked SEPARATELY. */
  async runConversionChoreography(strValue) {
    await this.materializePaperStrip(strValue);
    await this.feedStripDown();

    if (strValue.length === 0) {
      await this.slamGate();
      await this.ejectStrip();
      await this.showNFE();
      return { ok: false, crash: "nfe" };
    }

    const inspection = await this.inspectCharacters(strValue);
    if (!inspection.allValid) {
      await this.slamGate();
      await this.ejectStrip();
      await this.showNFE();
      return { ok: false, crash: "nfe" };
    }

    const numericVal = parseInt(strValue, 10);
    if (numericVal > INT_MAX || numericVal < INT_MIN) {
      await this.openGate();
      await this.burnStrip();
      await this.showOverflowNFE();
      return { ok: false, crash: "nfe" };
    }

    await this.openGate();
    await this.burnStrip();
    await this.formIntegerBar(numericVal);
    await this.slideBarToContainer(numericVal);
    return { ok: true, value: numericVal };
  }

  // ══════════════════════════════════════════════════════════════
  // MINI ARITHMETIC STAGE — two bars combine with an operator glow
  // ══════════════════════════════════════════════════════════════

  createMiniArithmeticStage() {
    const g = this.add.graphics();
    g.lineStyle(1.5, C_INDIGO, 0.7);
    g.strokeRoundedRect(STAGE_X0, STAGE_Y0, STAGE_X1 - STAGE_X0, STAGE_Y1 - STAGE_Y0, 6);
    this.add.text(STAGE_X0 + 6, STAGE_Y0 + 4, "ARITHMETIC", { font: "bold 9px Georgia", color: HEX_INDIGO }).setAlpha(0.7);
    this.rigLayer.add(g);
    this.stageDynamicLayer = this.add.container(0, 0);
    this.rigLayer.add(this.stageDynamicLayer);
  }

  clearArithmeticStage() {
    this.stageDynamicLayer.removeAll(true);
  }

  async runArithmeticAnimation(aVal, op, bVal, result) {
    const cy = (STAGE_Y0 + STAGE_Y1) / 2;
    const leftX = STAGE_X0 + 40, rightX = STAGE_X1 - 40, midX = (STAGE_X0 + STAGE_X1) / 2;
    const makeBar = (x, val) => {
      const c = this.add.container(x, cy).setAlpha(0).setScale(0.7);
      const bg = this.add.graphics();
      const w = Math.max(30, String(val).length * 7 + 8), h = 16;
      bg.fillStyle(C_COPPER, 0.9);
      bg.lineStyle(1, 0x8a6435, 1);
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, 3);
      bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 3);
      const t = this.add.text(0, 0, String(val), { font: "bold 10px Courier New", color: "#241a0e" }).setOrigin(0.5);
      c.add([bg, t]);
      this.stageDynamicLayer.add(c);
      this.tweens.add({ targets: c, alpha: 1, scale: 1, duration: 100 });
      return c;
    };
    const barA = makeBar(leftX, aVal);
    const barB = makeBar(rightX, bVal);
    const opText = this.add.text(midX, cy, op, { font: "bold 16px Georgia", color: HEX_INDIGO }).setOrigin(0.5).setAlpha(0);
    this.stageDynamicLayer.add(opText);
    this.tweens.add({ targets: opText, alpha: 1, duration: 100 });
    await this.delay(160);
    await new Promise((res) => {
      this.tweens.add({ targets: barA, x: midX - 18, duration: 140, ease: "Sine.easeInOut" });
      this.tweens.add({ targets: barB, x: midX + 18, duration: 140, ease: "Sine.easeInOut", onComplete: res });
    });
    const flash = this.add.circle(midX, cy, 4, C_GOLD, 0.6);
    this.stageDynamicLayer.add(flash);
    this.tweens.add({ targets: flash, scale: 6, alpha: 0, duration: 250, onComplete: () => flash.destroy() });
    barA.destroy(); barB.destroy(); opText.destroy();
    const resultBar = makeBar(midX, result);
    await this.delay(150);
    this.tweens.add({ targets: resultBar, alpha: 0, duration: 200, delay: 250, onComplete: () => resultBar.destroy() });
    await this.delay(120);
  }

  // ══════════════════════════════════════════════════════════════
  // MINI SCANNER TAPE (Missions 3, 5, 6)
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
    const cellW = 5, x1 = OX + OW - 10;
    const totalW = Math.min(this.tapeState.length * cellW, 200);
    const startX = x1 - totalW;
    const bg = this.add.graphics();
    bg.fillStyle(0xe8f0e8, 0.85);
    bg.fillRoundedRect(startX - 3, TAPE_Y - 5, totalW + 6, 10, 3);
    this.tapeContainer.add(bg);
    this.tapeState.slice(-Math.floor(totalW / cellW)).forEach((cell, i) => {
      const x = startX + i * cellW + cellW / 2;
      const disp = cell.kind === "space" ? "␣" : cell.kind === "newline" ? "⏎" : cell.ch;
      const color = cell.kind === "space" ? "#c2185b" : cell.kind === "newline" ? "#7b1fa2" : "#2e7d32";
      const t = this.add.text(x, TAPE_Y, disp, { font: "bold 5.5px Courier New", color }).setOrigin(0.5);
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
    await this.delay(35);
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
  // VARIABLES STRIP — a simple live readout of declared scalars
  // ══════════════════════════════════════════════════════════════

  createVariablesStrip() {
    const hdr = this.add.text(OX + 490 - 456 + 14, VARS_Y - 12, "VARIABLES", { font: "bold 9px Georgia", color: HEX_COPPER }).setAlpha(0.7);
    this.varsContainer = this.add.container(0, 0);
    this.rigLayer.add([hdr, this.varsContainer]);
  }

  clearVariablesStrip() {
    this.varsContainer.removeAll(true);
  }

  updateVariablesStrip(vars) {
    this.varsContainer.removeAll(true);
    let idx = 0;
    for (const name in vars) {
      const v = vars[name];
      const y = VARS_Y + idx * 12;
      const display = v.type === "String" ? `"${v.value}"` : String(v.value);
      const text = `${v.type} ${name}=${display}`.slice(0, 38);
      const t = this.add.text(OX + 20, y, text, { font: "bold 9px Courier New", color: v.type === "String" ? HEX_CYAN : HEX_GOLD }).setOrigin(0, 0.5);
      this.varsContainer.add(t);
      idx++;
      if (idx >= 4) break;
    }
  }

  // ══════════════════════════════════════════════════════════════
  // MANIFEST STRIP / RESULT ROW
  // ══════════════════════════════════════════════════════════════

  createManifestStrip() {
    const g = this.add.graphics().setDepth(16);
    g.fillStyle(0x0f0a06, 0.92);
    g.fillRect(OX, MANIFEST_Y - 2, OW, 20);
    this.manifestStripText = this.add.text(OX + 8, MANIFEST_Y + 8, "", { font: "12px Arial", color: HEX_COPPER }).setOrigin(0, 0.5).setDepth(17);
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

    this.add.text(20, 14, "THE CONVERSION WORKS", { font: "bold 15px Georgia", color: "#b0bec5" }).setDepth(51);
    this.add.text(20, 32, "Restructuring Phase — Type Conversion: parseInt()", { font: "12px Arial", color: "#546e7a" }).setDepth(51);

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
    for (let i = 0; i < 5; i++) {
      const lg = this.add.graphics({ x: 1150 + i * 20, y: 26 }).setDepth(51);
      lg.lineStyle(2, C_COPPER, 1);
      lg.strokeCircle(0, 0, 6);
      lg.lineBetween(4, -4, 9, -9);
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
  // BIT — MASTER ASSAYER VARIANT (medallion, conversion manual)
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
    const medallionChain = this.add.graphics();
    medallionChain.lineStyle(1.5, C_COPPER, 0.8);
    medallionChain.lineBetween(-10, -14, 0, 4);
    medallionChain.lineBetween(10, -14, 0, 4);
    const medallion = this.add.circle(0, 6, 6, C_COPPER, 0.9).setStrokeStyle(1.5, 0x8a6435, 1);
    const medallionMark = this.add.text(0, 6, "⚒", { font: "9px Arial", color: "#241a0e" }).setOrigin(0.5);
    const gloveL = this.add.circle(-16, 10, 4, 0xffffff, 0).setStrokeStyle(1, 0xe8eaf6, 0.7);
    const manual = this.add.container(17, 12);
    const manualG = this.add.graphics();
    manualG.fillStyle(0x1a0e05, 1);
    manualG.lineStyle(1, C_COPPER, 0.6);
    manualG.fillRoundedRect(-4, -8, 8, 12, 1);
    manualG.strokeRoundedRect(-4, -8, 8, 12, 1);
    manual.add(manualG);
    c.add([g, frock, medallionChain, medallion, medallionMark, eye, pupil, gloveL, manual, tip]);
    this.tweens.add({ targets: tip, alpha: 0.3, duration: 900, yoyo: true, repeat: -1 });
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
    g.lineStyle(1.5, C_COPPER, 1);
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
    await this.bitSay("The Conversion Works, Assayer — where raw text data becomes computable numbers. You've predicted parseInt's verdicts and drilled its edge cases; tonight you BUILD the workflows that convert, compute, and publish. Every mission processes real data through the furnace.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(5500)]); if (!A()) return;
    this.hideBubble();

    const a1 = this.floatingAnnotation(CX + CW / 2, CY - 16, "the workflow", HEX_CYAN);
    await this.delay(400); if (!A()) return;
    const a2 = this.floatingAnnotation(PX + PW / 2, PY - 12, "blocks — one forgets to convert before adding, one feeds the furnace untrimmed", HEX_GRAY);
    await this.delay(400); if (!A()) return;
    const a3 = this.floatingAnnotation(OX + OW / 2, OY - 12, "furnace, arithmetic stage, and ticker — LIVE", HEX_GREEN_BRIGHT);
    await this.delay(400); if (!A()) return;
    const a4 = this.floatingAnnotation(880, 36, "stamps when we publish", HEX_GOLD);
    await this.delay(400); if (!A()) return;
    const a5 = this.floatingAnnotation(RX + RW / 2, RY - 12, "every scenario must verify", HEX_BLUE_GRAY);
    await this.delay(400); if (!A()) return;

    await this.bitSay("The works' three laws: convert BEFORE you compute — text plus text is more text; trim before you smelt — spaces crack the furnace; and never trust raw input. Build, run, verify, repair.");
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

    this.tabFilename.setText(`Convert${mission.mission}.java`);
    this.renderSkeleton(mission);
    this.populatePalette(mission);
    this.buildReportRows(mission);
    this.renderMissionBrief(mission);
    this.disableRunButton();
    this.highlightCodeLine(null);
    this.verdictLamp.setFillStyle(C_GRAY);
    this.clearFurnace();
    this.clearArithmeticStage();
    this.clearTicker();
    this.clearVariablesStrip();
    this.parkScannerCameo();
    this.updateManifestStrip("");
    this.updateResultRow(null, null);
    this.pulseSeal("idle");

    if (mission.isCrossWing) this.activateScannerCameo();

    this.inputLocked = false;
  }

  clearMission() {
    this.missionElements.forEach((e) => { if (e && e.destroy) e.destroy(); });
    this.missionElements = [];
  }

  buildProgramItems(mission, assembled) {
    // Unlike every prior restructuring level, Mission 2's line
    // ("int sum = <slot:left> + <slot:right>;") holds TWO slot markers
    // on one line — a pattern L70's precedent never needed. Substitute
    // ALL markers on the line (not just the first) via split/join.
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
    const m = line.match(/^(int|String|double)\s+(\w+)\s*=\s*\/\*[^*]*\*\/;$/);
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

    if (mission.mission === 2) {
      this.conversionProactive[key] = this._slotCode("left") === "Integer.parseInt(a)" && this._slotCode("right") === "Integer.parseInt(b)";
    }
    if (mission.mission === 4) {
      this.trimClean[key] = this._slotCode("convert") === "Integer.parseInt(raw.trim())";
    }
    if (mission.mission === 3) {
      this.scannerClean[key] = this._slotCode("read") === "sc.nextLine()" && this._slotCode("convert") === "Integer.parseInt(input)";
    }
    if (mission.mission === 6) {
      this.scannerClean[key] = this._slotCode("convertQty") === "Integer.parseInt(sc.nextLine())" && this._slotCode("convertPrice") === "Integer.parseInt(sc.nextLine())";
    }
    if (mission.mission === 5) {
      this.crossWingClean[key] = this._slotCode("formula") === "Math.abs(first - second)";
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
      this.time.delayedCall(1400, () => { if (c.active && draw) draw(C_COPPER); });
    }
  }

  async onRunPressed() {
    if (this.inputLocked) return;
    this.inputLocked = true;
    this.disableRunButton();
    this.runButton.t.setText("...");
    this.runCount++;
    this.pulseSeal("session");
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
    this.clearFurnace();
    this.clearArithmeticStage();
    this.clearTicker();
    this.clearVariablesStrip();
    this.updateManifestStrip("");
    this.updateResultRow(null, null);

    if (mission.isCrossWing) { this.parkScannerCameo(); this.activateScannerCameo(); this.loadMiniTape(test.input); }

    this._printedLines = [];
    const execLines = items.map((it) => this._substituteTestLine(it.text, test));
    const runResult = await this.runStatements(execLines, {});
    if (!this._alive) return { pass: false, crashed: false };

    const output = this._printedLines.join("⏎");
    const pass = runResult.ok && output === test.expectedOutput;
    this.verdictLamp.setFillStyle(pass ? C_GREEN_BRIGHT : C_RED);
    this.updateReportRow(index, pass);
    await this.delay(200);
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
      console.warn("Level73Scene: /api/wellbeing/predict-struggle unreachable, skipping behavioral signal for this level:", e);
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

    this.pulseSeal("idle");
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
    if (flawless) this.createFloatingText(OX + OW / 2, OY - 14, "FLAWLESS +100", HEX_GOLD, "bold 16px Arial");
    this.pulseSeal("gold");

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
    const card = this._manifestCards[this.currentMission];
    if (card) {
      card.g.clear();
      card.g.fillStyle(C_GREEN_BRIGHT, 0.25);
      card.g.lineStyle(1, C_GREEN_BRIGHT, 0.6);
      card.g.fillRoundedRect(card.cx, card.cy, 110, 40, 3);
      card.g.strokeRoundedRect(card.cx, card.cy, 110, 40, 3);
      card.dot.setFillStyle(C_GREEN_BRIGHT, 0.9);
    }
    const mission = MISSIONS[this.currentMission];
    await this.bitSay(mission.postMissionNote || "Clean certification — the rig confirms it.");
    await Promise.race([this.waitForClick(), this.delay(2400)]);
    this.hideBubble();
    await this.delay(400);
  }

  // ══════════════════════════════════════════════════════════════
  // UNIFIED INTERPRETER — parseInt (character-validated, honest furnace
  // choreography, real NumberFormatException, overflow-as-NFE),
  // String.trim() (chainable before parseInt), Math.abs (cross-wing
  // callback to the Math Wing), Scanner (sc.nextLine()/sc.nextInt(),
  // usable as NESTED expressions — not just top-level declarations),
  // +, -, *, / arithmetic with correct precedence, println concatenation.
  //
  // Precedence note: top-level + is split FIRST (it's the loosest-
  // binding operator), THEN */÷ within whatever remains, THEN binary -.
  // This matches L72's fix (never L71's original mul-before-plus check,
  // which only ever worked because L71 never mixed + and * in one
  // expression).
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

  /** Splits on a top-level binary minus. Every character is scanned
   * (including index 0) so quote/depth tracking stays correct for
   * strings that themselves start with a quote — e.g. " -7 " must NOT
   * have its interior minus treated as an operator. A '-' is only
   * treated as a split point when i > 0, so a LEADING '-' (a negative
   * literal, e.g. "-7") is never mistaken for a binary operator with
   * an empty left side. */
  _splitTopMinus(expr) {
    let depth = 0, inQuotes = false;
    for (let i = 0; i < expr.length; i++) {
      const ch = expr[i];
      if (ch === '"' && expr[i - 1] !== "\\") inQuotes = !inQuotes;
      if (!inQuotes) {
        if (ch === "(" || ch === "[") depth++;
        else if (ch === ")" || ch === "]") depth--;
        else if (ch === "-" && depth === 0 && i > 0) return [expr.slice(0, i).trim(), expr.slice(i + 1).trim()];
      }
    }
    return null;
  }

  async resolveExpr(expr, vars) {
    const t = expr.trim();

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
        else {
          const sum = Number(accValue) + Number(partVal);
          await this.runArithmeticAnimation(accValue, "+", partVal, sum);
          accValue = sum;
        }
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
      await this.runArithmeticAnimation(lv, mdParts[2], rv, value);
      return { ok: true, value, type: "int" };
    }

    const minusParts = this._splitTopMinus(t);
    if (minusParts) {
      const l = await this.resolveExpr(minusParts[0], vars);
      if (!l.ok) return l;
      const r = await this.resolveExpr(minusParts[1], vars);
      if (!r.ok) return r;
      if (l.type === "String" || r.type === "String") {
        this.showCompileErrorStamp();
        return { ok: false, crash: "compile" };
      }
      const value = Number(l.value) - Number(r.value);
      await this.runArithmeticAnimation(l.value, "-", r.value, value);
      return { ok: true, value, type: "int" };
    }

    // .trim() — chainable before parseInt; only valid on a String.
    const trimSuffixMatch = t.match(/^(.+)\.trim\(\)$/);
    if (trimSuffixMatch) {
      const inner = await this.resolveExpr(trimSuffixMatch[1].trim(), vars);
      if (!inner.ok) return inner;
      if (inner.type !== "String") {
        this.showCompileErrorStamp();
        return { ok: false, crash: "compile" };
      }
      const trimmed = String(inner.value).trim();
      if (this._currentStrip && this._currentStrip.value === inner.value) await this.runTrimAnimation(inner.value, trimmed);
      return { ok: true, value: trimmed, type: "String" };
    }

    const absMatch = t.match(/^Math\.abs\((.+)\)$/);
    if (absMatch) {
      const inner = await this.resolveExpr(absMatch[1].trim(), vars);
      if (!inner.ok) return inner;
      if (inner.type === "String") {
        this.showCompileErrorStamp();
        return { ok: false, crash: "compile" };
      }
      const value = Math.abs(Number(inner.value));
      return { ok: true, value, type: inner.type === "double" ? "double" : "int" };
    }

    const parseIntMatch = t.match(/^Integer\.parseInt\((.+)\)$/);
    if (parseIntMatch) {
      const argRes = await this.resolveExpr(parseIntMatch[1].trim(), vars);
      if (!argRes.ok) return argRes;
      const strVal = String(argRes.value);
      const outcome = await this.runConversionChoreography(strVal);
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

    // A static/instance call that isn't one of the recognized forms
    // above — e.g. int.parseInt(...) (primitive has no methods),
    // Integer.parseDouble(...) (lives on Double, not Integer),
    // priceStr.parseInt() (String has no such instance method).
    const staticCallMatch = t.match(/^(\w+)\.(\w+)\(/);
    if (staticCallMatch) {
      this.showCompileErrorStamp();
      return { ok: false, crash: "compile" };
    }

    // A bare cast like (int) input has no home in this vocabulary.
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
      if (varType === "int" && r.type === "String") {
        this.showCompileErrorStamp();
        return { ok: false, crash: "compile" };
      }
      if (varType === "String" && r.type !== "String") {
        this.showCompileErrorStamp();
        return { ok: false, crash: "compile" };
      }
      vars[name] = { value: r.value, type: varType, kind: "scalar" };
      this.updateVariablesStrip(vars);
      return { ok: true };
    }

    const reassign = line.match(/^(\w+)\s*=\s*(.*);$/);
    if (reassign) {
      const name = reassign[1], rhs = reassign[2].trim();
      const r = await this.resolveExpr(rhs, vars);
      if (!r.ok) return r;
      const existing = vars[name];
      vars[name] = { value: r.value, type: existing ? existing.type : r.type, kind: "scalar" };
      this.updateVariablesStrip(vars);
      return { ok: true };
    }

    const printMatch = line.match(/^System\.out\.println\((.*)\);$/);
    if (printMatch) {
      this.updateManifestStrip("System.out.println(…)");
      const r = await this.resolveExpr(printMatch[1].trim(), vars);
      if (!r.ok) return r;
      if (!this._printedLines) this._printedLines = [];
      this._printedLines.push(String(r.value));
      await this.printToTicker(String(r.value));
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
      this.clearFurnace();
      this.clearArithmeticStage();
      this.clearTicker();
      this.clearVariablesStrip();
      this.parkScannerCameo();
      this._qaSeal.c.setAlpha(0.1);
      this._manifestCards.forEach(({ g }) => this.tweens.add({ targets: g, alpha: 0.05, duration: 500 }));
      const motes = this.ambient;
      this.ambient = null;
      (motes || []).forEach((m) => this.tweens.add({ targets: m, y: 632, alpha: 0, duration: 1500, ease: "Sine.easeIn" }));

      const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
      this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });
      const title = this.add.text(640, 240, "WORKS SHUT DOWN", { font: "bold 32px Georgia", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
      this.tweens.add({ targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut", onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }) });
      this.add.text(640, 310, `Score: ${this.score}`, { font: "21px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
      this.add.text(640, 350, `Missions Published: ${this.currentMission} / 6`, { font: "18px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);
      this._makeButton(525, 420, "RESTART THE WORKS", 200, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
      this._makeButton(755, 420, "RETURN TO MENU", 200, 50, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.start("MenuScene"));
    })();
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearMission();
    this.hideBubble();

    try { GameManager.completeLevel(72, Math.round((this.flawlessCount / MISSIONS.length) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("integer_parseInt_mastery"); } catch (_) {}
    try {
      localStorage.setItem("level73_results", JSON.stringify({
        level: 73, concept: "integer_parseInt", phase: "restructuring",
        score: this.score, missionsCompleted: 6, flawlessMissions: this.flawlessCount,
        totalRuns: this.runCount, failedRuns: this.failedRunCount, hintsUsed: this.hintCount,
        selfCorrections: this.selfCorrectionCount,
        conversionBeforeArithmeticProactive: this.conversionProactive,
        trimBeforeParseClean: this.trimClean,
        crossWingCleanFirstRun: this.crossWingClean,
        scannerPipelineClean: this.scannerClean,
        livesRemaining: this.lives, attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.triggerTrilogyFinale();
  }

  async triggerTrilogyFinale() {
    // The works celebration: the quality seal detaches and presses gold,
    // the manifest board's remaining cards flip green, the ingot shelf
    // gains a fourth bar, the safety poster's warning fades, confetti.
    const sealC = this._qaSeal.c;
    await new Promise((res) => {
      this.tweens.add({ targets: sealC, x: 640, y: 300, scale: 2, duration: 700, ease: "Sine.easeInOut", onComplete: res });
    });
    this.pulseSeal("gold");
    this.screenShake(0.005, 180);
    const shock = this.add.circle(640, 300, 6, C_GOLD, 0.6).setDepth(89);
    this.tweens.add({ targets: shock, scale: 10, alpha: 0, duration: 500, onComplete: () => shock.destroy() });

    this._manifestCards.forEach(({ g, dot }) => {
      g.clear();
      g.fillStyle(C_GREEN_BRIGHT, 0.25);
      g.lineStyle(1, C_GREEN_BRIGHT, 0.6);
      dot.setFillStyle(C_GREEN_BRIGHT, 0.9);
    });

    const fourthIngot = this.add.graphics().setDepth(3);
    fourthIngot.fillStyle(C_GOLD, 0.4);
    fourthIngot.fillRoundedRect(1145 - 13, 145 - 7, 26, 14, 2);
    this._ingotShelf.push({ g: fourthIngot });

    this.createTrilogyConfetti(640, 300, 40);
    await this.delay(1000);

    const flash = this.add.rectangle(W / 2, H / 2, W, H, 0xffffff, 0).setDepth(94);
    this.tweens.add({ targets: flash, fillAlpha: 0.4, duration: 250, yoyo: true, onComplete: () => flash.destroy() });

    await this.delay(400);

    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
    this.tweens.add({ targets: ov, fillAlpha: 0.85, duration: 500 });
    this._ceremonyElements = [ov];

    const panel = this.add.graphics().setDepth(90);
    panel.fillStyle(0x0c0818, 1);
    panel.fillRoundedRect(350, 60, 580, 600, 16);
    panel.lineStyle(2, C_GOLD, 1);
    panel.strokeRoundedRect(350, 60, 580, 600, 16);
    this._ceremonyElements.push(panel);

    const title = this.add.text(640, 100, "MASTER ASSAYER", { font: "bold 32px Georgia", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(91).setScale(0);
    this.tweens.add({ targets: title, scale: 1, duration: 350, ease: "Back.easeOut" });
    this._ceremonyElements.push(title);

    const convertPct = Object.values(this.conversionProactive).some(Boolean) ? "✓" : "✗";
    const trimPct = Object.values(this.trimClean).some(Boolean) ? "✓" : "✗";
    const crossPct = Object.values(this.crossWingClean).some(Boolean) ? "✓" : "✗";
    const scannerPct = `${Object.values(this.scannerClean).filter(Boolean).length}/2`;
    const lines = [
      "MISSIONS: 6/6",
      `FLAWLESS: ${this.flawlessCount}`,
      `SELF-CORRECTIONS: ${this.selfCorrectionCount}`,
      `CONVERT-BEFORE-ARITHMETIC: ${convertPct}`,
      `TRIM-BEFORE-PARSE: ${trimPct}`,
      `CROSS-WING CLEAN: ${crossPct}`,
      `SCANNER PIPELINE: ${scannerPct}`,
      `HINTS: ${this.hintCount}`,
    ];
    lines.forEach((s, i) => {
      const t = this.add.text(400, 140 + i * 24, s, { font: "15px Arial", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 250, delay: 300 + i * 120 });
      this._ceremonyElements.push(t);
    });
    const totalText = this.add.text(400, 140 + 8 * 24, "TOTAL: 0", { font: "bold 21px Arial", color: HEX_GOLD }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: totalText, alpha: 1, duration: 250, delay: 1300 });
    const counter = { v: 0 };
    this.tweens.add({ targets: counter, v: this.score, duration: 1000, delay: 1300, onUpdate: () => totalText.setText(`TOTAL: ${Math.round(counter.v)}`) });
    this._ceremonyElements.push(totalText);

    const stars = this._starRating();
    for (let i = 0; i < 3; i++) {
      const earned = i < stars;
      const s = this.add.text(640 + (i - 1) * 60, 400, "★", { font: "40px Arial", color: earned ? HEX_GOLD : "#2a3040" }).setOrigin(0.5).setDepth(91).setScale(0);
      this.tweens.add({ targets: s, scale: 1, duration: 250, delay: 1900 + i * 200, ease: earned ? "Back.easeOut" : "Cubic.easeOut" });
      this._ceremonyElements.push(s);
    }

    const badge = this.add.container(640, 470).setDepth(91).setAlpha(0);
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillCircle(0, 0, 34);
    bg.lineStyle(3, C_GOLD, 1);
    bg.strokeCircle(0, 0, 34);
    const furnaceIcon = this.add.text(-14, -6, "🔥", { font: "bold 14px Arial", color: HEX_COPPER }).setOrigin(0.5);
    const gaugeIcon = this.add.text(0, -6, "⏱", { font: "bold 14px Arial", color: HEX_GOLD }).setOrigin(0.5);
    const ingotIcon = this.add.text(14, -6, "⚒", { font: "bold 13px Arial", color: HEX_COPPER }).setOrigin(0.5);
    badge.add([bg, furnaceIcon, gaugeIcon, ingotIcon]);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 0 });
    const badgeLbl = this.add.text(640, 512, "parseInt() MASTERY", { font: "bold 15px Georgia", color: HEX_GOLD }).setOrigin(0.5).setDepth(91).setAlpha(0);
    const badgeSub = this.add.text(640, 528, "Accretion ✓  Tuning ✓  Restructuring ✓", { font: "12px Arial", color: "#78909c" }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: [badgeLbl, badgeSub], alpha: 1, duration: 300, delay: 0 });
    this._ceremonyElements.push(badge, badgeLbl, badgeSub);

    const barY = 570;
    const barG = this.add.graphics().setDepth(91).setAlpha(0);
    barG.lineStyle(1.5, C_GRAY, 1);
    barG.strokeRoundedRect(450, barY, 380, 14, 6);
    barG.fillStyle(C_CYAN, 1);
    barG.fillRoundedRect(450, barY, 380 / 3, 14, 6);
    const progLabel = this.add.text(640, barY + 26, "TYPE CONVERSION WING — 1 of 3 trilogies complete", { font: "bold 13px Georgia", color: HEX_CYAN }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: [barG, progLabel], alpha: 1, duration: 300, delay: 2900 });
    this._ceremonyElements.push(barG, progLabel);

    await this.delay(3200);
    if (!this._alive) return;

    await new Promise((res) => { this.tweens.add({ targets: this.bit, x: 640, y: 610, duration: 500, ease: "Sine.easeInOut", onComplete: res }); });
    await this.bitSay("The full pipeline: Scanner reads, parseInt smelts, arithmetic computes, println publishes. Six missions, one conversion trilogy sealed — Accretion taught the schema, Tuning drilled the edge cases, Restructuring built the production programs. Master Assayer — the works publishes under your name. The next furnace burns hotter: decimals await.");
    if (!this._alive) return;
    await Promise.race([this.waitForClick(), this.delay(7000)]);
    this.hideBubble();
    this.showScoreTally();
  }

  _starRating() {
    if (this.flawlessCount >= 4 && this.hintCount <= 1) return 3;
    if (this.failedRunCount <= 3) return 2;
    return 1;
  }

  showScoreTally() {
    this._makeButton(500, 640, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(770, 640, "NEXT: The Decimal Crucible →", 300, 44, { fill: 0x00733a, stroke: C_GREEN_BRIGHT, textColor: "#ffffff" }, () => {
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
