/**
 * Level 76 — "The Decimal Works" (Type Conversion Wing: Restructuring
 * Phase — Double.parseDouble() trilogy finale)
 * ===========================================================================
 * The learner CONSTRUCTS complete decimal-conversion programs — no
 * multiple choice. Reuses the L27→L73 code-canvas/parts-bin/RUN
 * architecture. The rig hosts a DUAL apparatus (mini Integer Furnace +
 * mini Decimal Crucible, both from L75's reveal stage, now doing real
 * production work) — the evaluator routes each parse call to whichever
 * instrument its method name names, and both instruments' choreography
 * is genuine (character-by-character validation, real NFE, real
 * dissolution/smelting).
 *
 * SPEC CORRECTION (caught by hand-tracing Mission 5 before any code was
 * written, per the established discipline): the spec's `sc.nextInt()`
 * cartridge for the `parseAge` slot was tagged as a plain wrong answer
 * ("nextInt_bypass_belief"), following the same label used for L73's
 * Mission 3 — but there the surrounding declaration was `String input`,
 * where nextInt()'s int return is a genuine type mismatch. Here the
 * declaration is `int age = <slot:parseAge>;` — an INT-typed target, so
 * sc.nextInt() returning an int is perfectly legal Java and produces the
 * exact correct value for every test (identical to L73's own Mission 6,
 * where the analogous cartridge was already correctly marked
 * alsoCorrect). Reclassified this cartridge as `correct: true,
 * alsoCorrect: true` to match its actual, verified behavior — it
 * bypasses the intended explicit nextLine()+parseInt() pipeline
 * pedagogically, but it does not fail any test, so tagging it as a
 * hard wrong answer would have been a false rejection of correct code.
 *
 * New evaluator features beyond L73/L74/L75's cascade:
 *  - The evaluator ROUTES each parse call to the instrument matching
 *    its method name (Integer.parseInt → furnace, Double.parseDouble →
 *    crucible) rather than committing to one instrument per level.
 *  - printf's "%%" (a literal percent sign) — must be resolved AFTER
 *    "%n" is stripped, not before: "%.2f%%%n" naively replacing "%%"
 *    first leaves a stray "%" adjacent to the unconsumed "%n" ("%%n"
 *    instead of the intended "%"). Stripping "%n" first, then folding
 *    "%%" → "%", produces the correct literal percent sign.
 *  - A cast-animation cameo (M4): the crucible's liquid pours through a
 *    narrowing "(int)" funnel and solidifies into a furnace-style bar —
 *    the double→int truncation made physically visible.
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
const TUTORIAL_KEY = "level76_tutorial_done";

// Rig internal layout — mini furnace (upper-left), mini crucible
// (upper-right), routing arrow between, arithmetic stage (below both),
// variables strip, Scanner tape, output ticker.
const TAPE_Y = OY + 14;
const MF_X0 = OX + 12, MF_X1 = OX + 120, MF_Y0 = OY + 26, MF_Y1 = OY + 128;
const MC_X0 = OX + 200, MC_X1 = OX + 308, MC_Y0 = OY + 26, MC_Y1 = OY + 128;
const ROUTE_ARROW_X = (MF_X1 + MC_X0) / 2, ROUTE_ARROW_Y = (MF_Y0 + MF_Y1) / 2;
const STAGE_X0 = OX + 330, STAGE_X1 = OX + 450, STAGE_Y0 = OY + 40, STAGE_Y1 = OY + 128;
const VARS_Y = OY + 150;
const TICKER_Y = OY + 205;
const INT_MAX = 2147483647, INT_MIN = -2147483648;

// ══════════════════════════════════════════════════════════════
// MISSION CONFIGURATION
// ══════════════════════════════════════════════════════════════
const MISSIONS = [
  // ── Mission 1: The Temperature Log ──
  { mission: 1, title: "The Temperature Log",
    brief: "Convert a temperature reading and compute the difference from freezing (0°C).\nFor temp = \"36.6\":\nTemp: 36.6\nAbove freezing: 36.6",
    skeleton: [
      "String tempStr = /* test value */;",
      "",
      "double temp = <slot:convert>;",
      "double diff = temp - 0;",
      'System.out.println("Temp: " + temp);',
      'System.out.println("Above freezing: " + diff);',
    ],
    slots: [{ id: "convert", hint: "dissolve the reading" }],
    palette: [
      { code: "Double.parseDouble(tempStr)", correct: true, slotId: "convert" },
      { code: "Integer.parseInt(tempStr)", tag: "wrong_parser_choice", slotId: "convert" },
      { code: "tempStr", tag: "string_is_number_belief", slotId: "convert" },
      { code: "double.parseDouble(tempStr)", tag: "double_vs_Double_belief", slotId: "convert" },
      { code: "Double.parseInt(tempStr)", tag: "wrong_method_on_class", slotId: "convert" },
    ],
    tests: [
      { substitutions: { tempStr: '"36.6"' }, expectedOutput: "Temp: 36.6⏎Above freezing: 36.6" },
      { substitutions: { tempStr: '"-5.5"' }, expectedOutput: "Temp: -5.5⏎Above freezing: -5.5" },
      { substitutions: { tempStr: '"0.0"' }, expectedOutput: "Temp: 0.0⏎Above freezing: 0.0" },
    ],
    postMissionNote: "Bit: 'parseDouble on decimal text — the crucible dissolves what the furnace would reject. And notice: even \"0.0\" dissolved cleanly. The crucible doesn't care about the value, only the format.'",
    concept: "basic_parseDouble_compute" },

  // ── Mission 2: The Dual Instrument (FLAGSHIP — parser discrimination) ──
  { mission: 2, title: "The Dual Instrument",
    brief: "Process a record with TWO fields: an integer quantity and a decimal unit price. Use the RIGHT parser for each.\nFor qty = \"12\", price = \"9.99\":\nQty: 12\nPrice: 9.99\nTotal: 119.88",
    skeleton: [
      "String qtyStr = /* test value */;",
      "String priceStr = /* test value */;",
      "",
      "int qty = <slot:parseQty>;",
      "double price = <slot:parsePrice>;",
      "double total = qty * price;",
      "",
      'System.out.println("Qty: " + qty);',
      'System.out.println("Price: " + price);',
      'System.out.printf("Total: %.2f%n", total);',
    ],
    slots: [
      { id: "parseQty", hint: "the integer quantity" },
      { id: "parsePrice", hint: "the decimal price" },
    ],
    isFlagship: true,
    palette: [
      { code: "Integer.parseInt(qtyStr)", correct: true, slotId: "parseQty" },
      { code: "Double.parseDouble(qtyStr)", tag: "parseDouble_on_int_field", slotId: "parseQty" },
      { code: "Double.parseDouble(priceStr)", correct: true, slotId: "parsePrice" },
      { code: "Integer.parseInt(priceStr)", tag: "wrong_parser_choice", slotId: "parsePrice" },
      { code: "priceStr", tag: "string_is_number_belief", slotId: "parsePrice" },
    ],
    tests: [
      { substitutions: { qtyStr: '"12"', priceStr: '"9.99"' }, expectedOutput: "Qty: 12⏎Price: 9.99⏎Total: 119.88" },
      { substitutions: { qtyStr: '"1"', priceStr: '"0.50"' }, expectedOutput: "Qty: 1⏎Price: 0.5⏎Total: 0.50" },
      { substitutions: { qtyStr: '"100"', priceStr: '"1.00"' }, expectedOutput: "Qty: 100⏎Price: 1.0⏎Total: 100.00" },
    ],
    postMissionNote: "Bit (touching the dual-instrument badge): 'TWO instruments, TWO fields, TWO correct choices. parseInt for whole numbers; parseDouble for decimals. The routing arrow showed the path — qty through the furnace, price through the crucible. The discrimination IS the skill.'",
    concept: "parser_discrimination_flagship" },

  // ── Mission 3: The Measurement Pipeline (Scanner + parseDouble) ──
  { mission: 3, title: "The Measurement Pipeline",
    brief: "Read a measurement as text from the user, convert it, and compute the measurement in centimeters (multiply by 2.54).\nFor input \"5.5\" (inches):\nCentimeters: 13.97",
    skeleton: [
      "Scanner sc = new Scanner(System.in);",
      "",
      "String input = sc.nextLine();",
      "double inches = <slot:convert>;",
      "double cm = inches * 2.54;",
      'System.out.printf("Centimeters: %.2f%n", cm);',
    ],
    slots: [{ id: "convert", hint: "dissolve to double" }],
    isCrossWing: true,
    palette: [
      { code: "Double.parseDouble(input)", correct: true, slotId: "convert" },
      { code: "Integer.parseInt(input)", tag: "wrong_parser_choice", slotId: "convert" },
      { code: "input", tag: "string_is_number_belief", slotId: "convert" },
      { code: "(double) input", tag: "cast_string_to_double_belief", slotId: "convert" },
    ],
    tests: [
      { input: ["5.5"], expectedOutput: "Centimeters: 13.97" },
      { input: ["10.0"], expectedOutput: "Centimeters: 25.40" },
      { input: ["1.0"], expectedOutput: "Centimeters: 2.54" },
    ],
    postMissionNote: "Bit: 'Scanner reads text; parseDouble dissolves it; arithmetic converts the unit; printf formats the result. The decimal pipeline: read → dissolve → compute → format. Same pattern as parseInt's pipeline, but for precision data.'",
    concept: "scanner_parseDouble_pipeline" },

  // ── Mission 4: The Truncated Reading (parseDouble → cast) ──
  { mission: 4, title: "The Truncated Reading",
    brief: "The data arrives as decimal text, but the report needs a WHOLE NUMBER. Convert via parseDouble, then cast to int.\nFor reading = \"7.89\":\nRaw: 7.89\nTruncated: 7",
    skeleton: [
      "String reading = /* test value */;",
      "",
      "double raw = Double.parseDouble(reading);",
      "int truncated = <slot:cast>;",
      'System.out.println("Raw: " + raw);',
      'System.out.println("Truncated: " + truncated);',
    ],
    slots: [{ id: "cast", hint: "truncate to int" }],
    palette: [
      { code: "(int) raw", correct: true, slotId: "cast" },
      { code: "Integer.parseInt(reading)", tag: "parseInt_accepts_dot_belief", slotId: "cast" },
      { code: "raw", tag: "double_to_int_auto_belief", slotId: "cast" },
      { code: "(int) reading", tag: "cast_string_to_int_belief", slotId: "cast" },
      { code: "(int) Double.parseDouble(reading)", correct: true, alsoCorrect: true, slotId: "cast" },
    ],
    tests: [
      { substitutions: { reading: '"7.89"' }, expectedOutput: "Raw: 7.89⏎Truncated: 7" },
      { substitutions: { reading: '"0.5"' }, expectedOutput: "Raw: 0.5⏎Truncated: 0" },
      { substitutions: { reading: '"-3.7"' }, expectedOutput: "Raw: -3.7⏎Truncated: -3" },
    ],
    postMissionNote: "Bit: 'The two-step: dissolve to double, cast to int. parseInt would have CRASHED on the dot. parseDouble dissolves the decimal text; (int) truncates the result. Two operations where one can't suffice. And the one-step: (int) Double.parseDouble(reading) — both in one expression.'",
    concept: "parseDouble_then_cast" },

  // ── Mission 5: The Mixed Record (Scanner + both parsers + arithmetic) ──
  { mission: 5, title: "The Mixed Record",
    brief: "Read a student's name, age (whole number), and GPA (decimal). Compute years until graduation (assume age 22).\nFor inputs \"Alice\", \"19\", \"3.85\":\nStudent: Alice\nGPA: 3.85\nYears left: 3",
    skeleton: [
      "Scanner sc = new Scanner(System.in);",
      "",
      "String name = sc.nextLine();",
      "int age = <slot:parseAge>;",
      "double gpa = <slot:parseGPA>;",
      "int yearsLeft = 22 - age;",
      "",
      'System.out.println("Student: " + name);',
      'System.out.println("GPA: " + gpa);',
      'System.out.println("Years left: " + yearsLeft);',
    ],
    slots: [
      { id: "parseAge", hint: "read & convert age (whole number)" },
      { id: "parseGPA", hint: "read & convert GPA (decimal)" },
    ],
    isCrossWing: true,
    palette: [
      { code: "Integer.parseInt(sc.nextLine())", correct: true, slotId: "parseAge" },
      { code: "Double.parseDouble(sc.nextLine())", tag: "parseDouble_on_int_field", slotId: "parseAge" },
      { code: "Double.parseDouble(sc.nextLine())", correct: true, slotId: "parseGPA" },
      { code: "Integer.parseInt(sc.nextLine())", tag: "wrong_parser_choice", slotId: "parseGPA" },
      { code: "sc.nextLine()", tag: "string_is_number_belief", slotId: "parseAge" },
      { code: "sc.nextInt()", correct: true, alsoCorrect: true, slotId: "parseAge" },
    ],
    tests: [
      { input: ["Alice", "19", "3.85"], expectedOutput: "Student: Alice⏎GPA: 3.85⏎Years left: 3" },
      { input: ["Bob", "22", "3.00"], expectedOutput: "Student: Bob⏎GPA: 3.0⏎Years left: 0" },
      { input: ["Cara", "18", "4.00"], expectedOutput: "Student: Cara⏎GPA: 4.0⏎Years left: 4" },
    ],
    postMissionNote: "Bit: 'Three reads: one stays text, one goes through the furnace (parseInt for age), one goes through the crucible (parseDouble for GPA). Three types, three destinations. The dual-instrument badge earned its place — real data mixes types.'",
    concept: "mixed_parser_pipeline" },

  // ── Mission 6: The Assay Report (GRAND CAPSTONE) ──
  { mission: 6, title: "The Assay Report",
    brief: "Process a mineral sample: read the sample name, weight (decimal), and purity percentage (decimal). Compute the pure weight (weight × purity / 100) and publish a formatted report.\nFor inputs \"Copper Ore\", \"250.5\", \"73.2\":\nSample: Copper Ore\nWeight: 250.50 g\nPurity: 73.20%\nPure weight: 183.37 g",
    skeleton: [
      "Scanner sc = new Scanner(System.in);",
      "",
      "String sample = sc.nextLine();",
      "double weight = <slot:parseW>;",
      "double purity = <slot:parseP>;",
      "double pureWeight = <slot:formula>;",
      "",
      'System.out.println("Sample: " + sample);',
      'System.out.printf("Weight: %.2f g%n", weight);',
      'System.out.printf("Purity: %.2f%%%n", purity);',
      'System.out.printf("Pure weight: %.2f g%n", pureWeight);',
    ],
    slots: [
      { id: "parseW", hint: "dissolve the weight" },
      { id: "parseP", hint: "dissolve the purity" },
      { id: "formula", hint: "compute pure weight" },
    ],
    isCapstone: true,
    palette: [
      { code: "Double.parseDouble(sc.nextLine())", correct: true, slotId: "parseW" },
      { code: "Integer.parseInt(sc.nextLine())", tag: "wrong_parser_choice", slotId: "parseW" },
      { code: "Double.parseDouble(sc.nextLine())", correct: true, slotId: "parseP" },
      { code: "sc.nextLine()", tag: "string_is_number_belief", slotId: "parseP" },
      { code: "weight * purity / 100", correct: true, slotId: "formula" },
      { code: "weight * purity", tag: "missing_division", slotId: "formula" },
      { code: "weight + purity / 100", tag: "wrong_formula_shape", slotId: "formula" },
    ],
    tests: [
      { input: ["Copper Ore", "250.5", "73.2"], expectedOutput: "Sample: Copper Ore⏎Weight: 250.50 g⏎Purity: 73.20%⏎Pure weight: 183.37 g" },
      { input: ["Gold Flake", "10.0", "99.9"], expectedOutput: "Sample: Gold Flake⏎Weight: 10.00 g⏎Purity: 99.90%⏎Pure weight: 9.99 g" },
      { input: ["Iron Dust", "1000.0", "50.0"], expectedOutput: "Sample: Iron Dust⏎Weight: 1000.00 g⏎Purity: 50.00%⏎Pure weight: 500.00 g" },
    ],
    postMissionNote: "Bit (setting the measurement journal down, touching the dual badge): 'The full assay report: three reads, two dissolutions, one formula, four lines of formatted output. The crucible processed both fields — weight and purity were BOTH decimal. And the printf: %.2f for precision, %% for a literal percent sign. Chief Assayer — the works publishes under your seal. The last instrument waits in the inscription room.'",
    concept: "assay_report_capstone" },
];

const MISCONCEPTION_FEEDBACK = {
  wrong_parser_choice: "parseInt on decimal text = crash. The dot is the integer furnace's absolute boundary. Use parseDouble for ANY text that might contain a decimal point.",
  parseDouble_on_int_field: "parseDouble gives a double. But the container is int. COMPILE ERROR: double to int needs a cast. For integer fields, parseInt is the right tool.",
  string_is_number_belief: "Text that looks like a number is still text. Neither the furnace nor the crucible fires without being called.",
  cast_string_to_double_belief: "(double) only works between compatible numeric types. String is not a number — you can't cast text. Only parseDouble converts.",
  parseInt_accepts_dot_belief: "parseInt CRASHES on dots — it doesn't truncate. For int from decimal text: parseDouble first, then (int) cast. Two steps, not one.",
  double_to_int_auto_belief: "Java won't narrow double to int silently — precision would be lost. The (int) cast makes the truncation explicit.",
  cast_string_to_int_belief: "(int) can't cast String to int — they're completely different types. The two-step: parseDouble first (String → double), then (int) cast (double → int).",
  cast_before_parse_belief: "You can't cast the String — it must be PARSED first. Cast works on the double RESULT of parsing, not on the text itself.",
  missing_division: "weight × purity gives a number in the thousands — you need to divide by 100 because purity is a percentage (73.2 means 73.2%). The formula: weight × purity / 100.",
  wrong_formula_shape: "weight + purity / 100 adds weight to a fraction of purity — that's not how percentages work. It should be weight TIMES purity / 100.",
  wrong_method_on_class: "parseInt lives on Integer; parseDouble lives on Double. Each wrapper class has its own method. Double.parseInt doesn't exist.",
  double_vs_Double_belief: "double is a primitive — no methods. Double is the wrapper class. Same pattern as int/Integer.",
  nextInt_bypass_belief: "nextInt works but skips the explicit conversion — the mission teaches the manual pipeline.",
  cast_rounds_belief: "(int) TRUNCATES toward zero — 7.89 becomes 7, not 8. -3.7 becomes -3, not -4. No rounding.",
};

const HINTS = {
  1: "Double.parseDouble(tempStr) — the reading has a decimal point.",
  2: "Integer.parseInt(qtyStr) for the whole-number quantity; Double.parseDouble(priceStr) for the decimal price.",
  3: "sc.nextLine() already read the text; Double.parseDouble(input) dissolves it — the measurement has a decimal point.",
  4: "Double.parseDouble(reading) already ran; (int) raw truncates the double to a whole number.",
  5: "Integer.parseInt(sc.nextLine()) for age (whole number); Double.parseDouble(sc.nextLine()) for GPA (decimal).",
  6: "Double.parseDouble(sc.nextLine()) for both weight and purity; weight * purity / 100 for the formula.",
};

export class Level76Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level76Scene" });
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
    this.discriminationProactive = {};
    this.castClean = {};
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
    this.createDualApparatus();
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
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // SETUP — THE DECIMAL WORKS INTERIOR
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l76_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l76_dot", 8, 8);
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

    // Measurement manifest board
    g.fillStyle(0x0c0818, 0.6);
    g.lineStyle(3, C_ORANGE, 1);
    g.fillRect(200, 30, 580, 140);
    g.strokeRect(200, 30, 580, 140);
    this._manifestCards = [];
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 4; c++) {
        const cx = 230 + c * 135, cy = 55 + r * 55;
        const cardG = this.add.graphics().setDepth(2);
        cardG.fillStyle(C_ORANGE, 0.15);
        cardG.lineStyle(1, C_ORANGE, 0.3);
        cardG.fillRoundedRect(cx, cy, 110, 40, 3);
        cardG.strokeRoundedRect(cx, cy, 110, 40, 3);
        const dot = this.add.circle(cx + 10, cy + 10, 3, 0xffa726, 0.5).setDepth(3);
        this._manifestCards.push({ g: cardG, dot, cx, cy });
      }
    }

    // Type-selection chart (left wall)
    const tg = this.add.graphics().setDepth(2);
    tg.lineStyle(2, C_COPPER, 0.5);
    tg.strokeRect(60, 100, 100, 120);
    tg.lineStyle(1, C_GOLD, 0.4);
    tg.strokeRect(68, 112, 38, 30);
    tg.fillStyle(C_GOLD, 0.3);
    tg.fillRect(76, 122, 22, 12);
    tg.lineStyle(1, C_ORANGE, 0.4);
    tg.strokeRect(114, 112, 38, 30);
    tg.fillStyle(C_ORANGE, 0.25);
    tg.fillRect(122, 118, 22, 20);
    this.add.text(87, 148, "int", { font: "bold 9px Courier New", color: HEX_GOLD }).setOrigin(0.5).setAlpha(0.5).setDepth(3);
    this.add.text(133, 148, "double", { font: "bold 9px Courier New", color: HEX_ORANGE }).setOrigin(0.5).setAlpha(0.5).setDepth(3);
    this.add.text(87, 160, "parseInt", { font: "8px Georgia", color: HEX_GOLD }).setOrigin(0.5).setAlpha(0.4).setDepth(3);
    this.add.text(133, 160, "parseDouble", { font: "8px Georgia", color: HEX_ORANGE }).setOrigin(0.5).setAlpha(0.4).setDepth(3);
    this.add.text(110, 178, "dot in text? → double", { font: "italic 8px Georgia", color: HEX_BLUE_GRAY }).setOrigin(0.5).setAlpha(0.4).setDepth(3);

    // Completed-measurements shelf (right wall)
    const sg = this.add.graphics().setDepth(2);
    sg.lineStyle(1.5, C_ORANGE, 0.5);
    sg.strokeRect(1140, 100, 100, 100);
    this._measureShelf = [];
    [[1160, 165, 8, 30], [1185, 155, 8, 40], [1215, 150, 8, 45]].forEach(([x, y, w, h]) => {
      const ig = this.add.graphics().setDepth(3);
      ig.lineStyle(1, C_ORANGE, 0.4);
      ig.strokeRect(x - w / 2, y - h, w, h);
      ig.fillStyle(C_ORANGE, 0.25);
      ig.fillRect(x - w / 2, y - h * 0.5, w, h * 0.5);
      this._measureShelf.push({ g: ig, x, y, w, h });
    });

    // Banner
    const bg = this.add.graphics().setDepth(2);
    bg.fillStyle(0x0c0818, 1);
    bg.lineStyle(1, C_ORANGE, 0.5);
    bg.fillRoundedRect(400, 12, 380, 26, 3);
    bg.strokeRoundedRect(400, 12, 380, 26, 3);
    this.add.text(590, 25, "T H E   D E C I M A L   W O R K S", { font: "bold 14px Georgia", color: HEX_ORANGE }).setOrigin(0.5).setAlpha(0.7).setDepth(3);
  }

  createQualitySeal() {
    const c = this.add.container(880, 56).setDepth(4);
    const g = this.add.graphics();
    g.lineStyle(2, C_ORANGE, 1);
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
    g.fillStyle(C_ORANGE, 0.15);
    for (let x = 0; x < W; x += 100) g.fillRect(x, 637, 3, 83);
  }

  createAmbientParticles() {
    this.ambient = [];
    const colors = [0x3949ab, 0xff9800, 0xb87333];
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
    const p = this.add.particles(x, y, "l76_dot", {
      speed: { min: 80, max: 240 }, angle: { min: 0, max: 360 }, scale: { start: 0.9, end: 0 }, lifespan: 500,
      tint: [C_ORANGE, C_COPPER, C_GOLD, 0xffffff], emitting: false,
    }).setDepth(95);
    p.explode(count);
    this.time.delayedCall(900, () => p.destroy());
  }

  createTrilogyConfetti(x, y, count = 40) {
    const p = this.add.particles(x, y, "l76_dot", {
      speed: { min: 100, max: 280 }, angle: { min: 0, max: 360 }, scale: { start: 1, end: 0 }, lifespan: 700,
      tint: [C_GOLD, C_ORANGE, C_COPPER, 0xffffff], emitting: false,
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
    this.tabFilename = this.add.text(CX + CW - 12, CY + TAB_H / 2, "Measure1.java", { font: "13px Courier New", color: "#546e7a" }).setOrigin(1, 0.5).setDepth(11);

    this.lineHighlight = this.add.rectangle(CX + CW / 2, 0, CW - 4, LINE_H, 0xffab00, 0.06).setDepth(19).setVisible(false);
    this.codeContainer = this.add.container(0, 0).setDepth(20);
  }

  _syntaxTokens(line) {
    const tokens = [];
    const re = /("(?:[^"\\]|\\.)*")|(\bimport\b|\bfor\b|\bint\b|\bdouble\b|\bString\b|\bnew\b|\bScanner\b)|(\bInteger\b|\bDouble\b)|(\.parseInt\b|\.parseDouble\b|\.nextInt\b|\.nextLine\b|\.println\b|\.printf\b)|(\bSystem\.out\b|\bSystem\.in\b)|(-?\d+\.\d+|-?\d+)|(>=|<=|==|!=|\+\+|--|[+\-*/><?:%])|([(){}\[\];.,=])/g;
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
    this.add.text(PX + 10, PY + 8, "ASSAYER'S PRECISION PARTS", { font: "bold 11px Arial", color: "#3d4450" }).setDepth(11);
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
      draw(C_ORANGE);
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
      c.on("pointerout", () => { if (!this.inputLocked) draw(C_ORANGE); });
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
    g.lineStyle(3, C_ORANGE, 1);
    g.strokeRoundedRect(OX, OY, OW, OH, 12);
    this.add.text(OX + 10, OY + 6, "WORKS RIG — LIVE", { font: "bold 11px Georgia", color: HEX_ORANGE }).setAlpha(0.7).setDepth(11);

    const maskShape = this.make.graphics({ x: 0, y: 0, add: false });
    maskShape.fillRoundedRect(OX + 4, OY + 20, OW - 8, OH - 24, 10);
    this.windowMask = maskShape.createGeometryMask();
    this.rigLayer = this.add.container(0, 0).setDepth(15);
    this.rigLayer.setMask(this.windowMask);

    this.verdictLamp = this.add.circle(OX + OW - 18, OY + 14, 6, C_GRAY).setDepth(20);
  }

  // ══════════════════════════════════════════════════════════════
  // THE DUAL APPARATUS — compact Integer Furnace (left) + Decimal
  // Crucible (right), reused from L75's reveal-stage choreography.
  // The evaluator ROUTES each parse call to whichever instrument its
  // method name names; a routing arrow between them highlights which
  // one just fired.
  // ══════════════════════════════════════════════════════════════

  createDualApparatus() {
    const drawFrame = (x0, x1, label, colorHex) => {
      const g = this.add.graphics();
      g.lineStyle(1.2, colorHex, 0.5);
      g.strokeRoundedRect(x0, MF_Y0, x1 - x0, MF_Y1 - MF_Y0, 4);
      this.rigLayer.add(g);
      const t = this.add.text((x0 + x1) / 2, MF_Y0 - 9, label, { font: "bold 8px Georgia", color: colorHex === C_COPPER ? HEX_COPPER : HEX_ORANGE }).setOrigin(0.5).setAlpha(0.5);
      this.rigLayer.add(t);
      return { g, t };
    };
    this._mfFrame = drawFrame(MF_X0, MF_X1, "FURNACE", C_COPPER);
    this._mcFrame = drawFrame(MC_X0, MC_X1, "CRUCIBLE", C_ORANGE);

    this.mfDynamicLayer = this.add.container(0, 0);
    this.mcDynamicLayer = this.add.container(0, 0);
    this.rigLayer.add([this.mfDynamicLayer, this.mcDynamicLayer]);

    const mfCx = (MF_X0 + MF_X1) / 2, mcCx = (MC_X0 + MC_X1) / 2;
    this._mfGate = this.add.rectangle(mfCx, MF_Y0 + 46, MF_X1 - MF_X0 - 20, 2, C_RED, 0);
    this._mcGate = this.add.rectangle(mcCx, MF_Y0 + 46, MC_X1 - MC_X0 - 20, 2, C_RED, 0);
    this.rigLayer.add([this._mfGate, this._mcGate]);

    this._mfContText = this.add.text(mfCx, MF_Y1 - 12, "int —", { font: "bold 10px Courier New", color: HEX_GRAY }).setOrigin(0.5);
    this._mcContText = this.add.text(mcCx, MF_Y1 - 12, "double —", { font: "bold 10px Courier New", color: HEX_GRAY }).setOrigin(0.5);
    this.rigLayer.add([this._mfContText, this._mcContText]);

    this.routeArrow = this.add.text(ROUTE_ARROW_X, ROUTE_ARROW_Y, "?", { font: "bold 14px Georgia", color: HEX_GRAY }).setOrigin(0.5).setAlpha(0.4);
    this.rigLayer.add(this.routeArrow);
  }

  clearDualApparatus() {
    this.mfDynamicLayer.removeAll(true);
    this.mcDynamicLayer.removeAll(true);
    this._mfGate.setAlpha(0);
    this._mcGate.setAlpha(0);
    this._mfContText.setText("int —").setColor(HEX_GRAY);
    this._mcContText.setText("double —").setColor(HEX_GRAY);
    this.routeArrow.setText("?").setAlpha(0.4).setColor(HEX_GRAY);
    this.dimInstrument("furnace");
    this.dimInstrument("crucible");
  }

  activateInstrument(which) {
    const frame = which === "furnace" ? this._mfFrame : this._mcFrame;
    this.tweens.add({ targets: [frame.g, frame.t], alpha: 1, duration: 180 });
    this.routeArrow.setText(which === "furnace" ? "← int" : "double →").setColor(which === "furnace" ? HEX_COPPER : HEX_ORANGE).setAlpha(1);
  }

  dimInstrument(which) {
    const frame = which === "furnace" ? this._mfFrame : this._mcFrame;
    this.tweens.add({ targets: [frame.g, frame.t], alpha: 0.3, duration: 180 });
  }

  _miniStrip(layer, cx, value) {
    const strip = this.add.container(cx, MF_Y0 + 12).setAlpha(0);
    const bg = this.add.graphics();
    const w = Math.max(26, value.length * 6 + 8), h = 11;
    bg.fillStyle(0xe0d6c8, 1);
    bg.lineStyle(1, 0x8a6435, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 2);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 2);
    const txt = this.add.text(0, 0, value, { font: "bold 6.5px Courier New", color: "#241a0e" }).setOrigin(0.5);
    if (txt.width > w - 4) txt.setFontSize(5);
    strip.add([bg, txt]);
    layer.add(strip);
    this.tweens.add({ targets: strip, alpha: 1, duration: 90 });
    return strip;
  }

  /** Honest mini-furnace attempt: digits/leading-sign GREEN, anything
   * else (including a dot) RED — no amber, the furnace has no special
   * case for decimal points. */
  async runFurnaceConversion(strValue) {
    this.activateInstrument("furnace");
    const cx = (MF_X0 + MF_X1) / 2;
    const strip = this._miniStrip(this.mfDynamicLayer, cx, strValue);
    await this.delay(90);
    await new Promise((res) => { this.tweens.add({ targets: strip, y: MF_Y0 + 46, duration: 110, onComplete: res }); });

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
    const startX = strip.x - (strip.list[0].width || 26) / 2 + 5;
    for (let i = 0; i < showCount; i++) {
      if (!this._alive) return { ok: true };
      const isLast = i === showCount - 1;
      const isValidChar = valid || !isLast;
      const spot = this.add.circle(startX + i * 7, MF_Y0 + 46, 2.5, isValidChar ? C_GREEN_BRIGHT : C_RED, 0.5);
      this.mfDynamicLayer.add(spot);
      this.tweens.add({ targets: spot, alpha: 0, duration: 180, delay: 80 });
      await this.delay(65);
    }

    if (!valid) {
      this._mfGate.setFillStyle(C_RED, 0.9).setAlpha(1);
      this.screenShake(0.004, 130);
      this.tweens.add({ targets: strip, alpha: 0, y: strip.y - 14, duration: 130, onComplete: () => strip.destroy() });
      await this.delay(170);
      const nfe = this.add.text(cx, MF_Y0 + 80, "NFE", { font: "bold 10px Courier New", color: HEX_RED }).setOrigin(0.5).setAlpha(0);
      this.mfDynamicLayer.add(nfe);
      this.tweens.add({ targets: nfe, alpha: 1, duration: 100 });
      await this.delay(450);
      this._mfContText.setText("✗").setColor(HEX_RED);
      return { ok: false, crash: "nfe" };
    }

    const value = parseInt(strValue, 10);
    await new Promise((res) => { this.tweens.add({ targets: strip, y: MF_Y0 + 68, duration: 100, onComplete: res }); });
    strip.destroy();
    const bar = this.add.container(cx, MF_Y0 + 68).setAlpha(0).setScale(0.6);
    const bg = this.add.graphics();
    const w = Math.max(26, String(value).length * 6 + 8), h = 13;
    bg.fillStyle(C_COPPER, 1);
    bg.lineStyle(1, 0x8a6435, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 3);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 3);
    const txt = this.add.text(0, 0, String(value), { font: "bold 9px Courier New", color: "#241a0e" }).setOrigin(0.5);
    bar.add([bg, txt]);
    this.mfDynamicLayer.add(bar);
    this.tweens.add({ targets: bar, alpha: 1, scale: 1, duration: 100, ease: "Back.easeOut" });
    await this.delay(110);
    this.tweens.add({ targets: bar, y: MF_Y1 - 12, alpha: 0, duration: 130, onComplete: () => bar.destroy() });
    this._mfContText.setText(`int ${value}`).setColor(HEX_GOLD);
    await this.delay(100);
    return { ok: true, value, type: "int" };
  }

  /** Honest mini-crucible attempt: digits/sign GREEN, ONE dot AMBER,
   * anything else RED. */
  async runCrucibleConversion(strValue) {
    this.activateInstrument("crucible");
    const cx = (MC_X0 + MC_X1) / 2;
    const trimmed = strValue.trim();
    const strip = this._miniStrip(this.mcDynamicLayer, cx, strValue);
    await this.delay(90);
    await new Promise((res) => { this.tweens.add({ targets: strip, y: MF_Y0 + 46, duration: 110, onComplete: res }); });

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
    const startX = strip.x - (strip.list[0].width || 26) / 2 + 5;
    for (let i = 0; i < showCount; i++) {
      if (!this._alive) return { ok: true };
      const kind = !valid && i === invalidIndex ? "red" : kinds[i];
      const color = kind === "green" ? C_GREEN_BRIGHT : kind === "amber" ? C_AMBER : C_RED;
      const spot = this.add.circle(startX + i * 7, MF_Y0 + 46, 2.5, color, 0.5);
      this.mcDynamicLayer.add(spot);
      this.tweens.add({ targets: spot, alpha: 0, duration: 180, delay: 80 });
      await this.delay(65);
      if (kind === "red") break;
    }

    if (!valid) {
      this._mcGate.setFillStyle(C_RED, 0.9).setAlpha(1);
      this.screenShake(0.004, 130);
      this.tweens.add({ targets: strip, alpha: 0, y: strip.y - 14, duration: 130, onComplete: () => strip.destroy() });
      await this.delay(170);
      const nfe = this.add.text(cx, MF_Y0 + 80, "NFE", { font: "bold 10px Courier New", color: HEX_RED }).setOrigin(0.5).setAlpha(0);
      this.mcDynamicLayer.add(nfe);
      this.tweens.add({ targets: nfe, alpha: 1, duration: 100 });
      await this.delay(450);
      this._mcContText.setText("✗").setColor(HEX_RED);
      return { ok: false, crash: "nfe" };
    }

    const value = parseFloat(trimmed);
    await new Promise((res) => { this.tweens.add({ targets: strip, y: MF_Y0 + 68, alpha: 0, duration: 130, onComplete: res }); });
    strip.destroy();
    const display = Number.isInteger(value) ? `${value}.0` : String(value);
    const liquid = this.add.rectangle(cx, MF_Y0 + 68, 32, 13, C_AMBER, 0.5).setScale(0, 1);
    this.mcDynamicLayer.add(liquid);
    this.tweens.add({ targets: liquid, scaleX: 1, duration: 100 });
    const valText = this.add.text(cx, MF_Y0 + 68, display, { font: "bold 8px Courier New", color: "#241a0e" }).setOrigin(0.5).setAlpha(0);
    this.mcDynamicLayer.add(valText);
    this.tweens.add({ targets: valText, alpha: 1, duration: 100 });
    await this.delay(130);
    this.tweens.add({ targets: [liquid, valText], y: "+=" + (MF_Y1 - 12 - (MF_Y0 + 68)), alpha: 0, duration: 130 });
    await this.delay(110);
    this._mcContText.setText(`double ${display}`).setColor(HEX_ORANGE);
    await this.delay(80);
    this._lastCrucibleValue = value;
    return { ok: true, value, type: "double" };
  }

  /** The (int) cast cameo: the crucible's most recent liquid pours
   * through a narrowing funnel labeled "(int)" and solidifies into a
   * furnace-style bar — double → int truncation made visible. */
  async runCastAnimation(doubleValue, intResult) {
    const mcCx = (MC_X0 + MC_X1) / 2, mfCx = (MF_X0 + MF_X1) / 2;
    const funnelY = MF_Y0 + 90;
    const funnel = this.add.text((mcCx + mfCx) / 2, funnelY, "(int)", { font: "bold 9px Courier New", color: HEX_GOLD }).setOrigin(0.5).setAlpha(0);
    this.rigLayer.add(funnel);
    this.tweens.add({ targets: funnel, alpha: 1, duration: 120 });
    const drop = this.add.circle(mcCx, MF_Y0 + 68, 4, C_AMBER, 0.7);
    this.rigLayer.add(drop);
    await new Promise((res) => { this.tweens.add({ targets: drop, x: (mcCx + mfCx) / 2, y: funnelY, duration: 200, onComplete: res }); });
    this.screenShake(0.002, 80);
    drop.setFillStyle(C_COPPER, 0.9);
    await new Promise((res) => { this.tweens.add({ targets: drop, x: mfCx, y: MF_Y0 + 68, scale: 1.4, duration: 200, onComplete: res }); });
    drop.destroy();
    const bar = this.add.text(mfCx, MF_Y0 + 68, String(intResult), { font: "bold 10px Courier New", color: HEX_GOLD }).setOrigin(0.5).setAlpha(0);
    this.rigLayer.add(bar);
    this.tweens.add({ targets: bar, alpha: 1, duration: 100 });
    await this.delay(200);
    this.tweens.add({ targets: [funnel, bar], alpha: 0, duration: 150 });
    await this.delay(100);
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
    const t = this.add.text(STAGE_X0 + 4, STAGE_Y0 + 3, "MATH", { font: "bold 8px Georgia", color: HEX_INDIGO }).setAlpha(0.6);
    this.rigLayer.add(t);
    this.stageDynamicLayer = this.add.container(0, 0);
    this.rigLayer.add(this.stageDynamicLayer);
  }

  clearArithmeticStage() { this.stageDynamicLayer.removeAll(true); }

  async runArithmeticAnimation(aVal, op, bVal, result) {
    const cy = (STAGE_Y0 + STAGE_Y1) / 2;
    const leftX = STAGE_X0 + 22, rightX = STAGE_X1 - 22, midX = (STAGE_X0 + STAGE_X1) / 2;
    const makeBar = (x, val) => {
      const c = this.add.container(x, cy).setAlpha(0).setScale(0.7);
      const bg = this.add.graphics();
      const w = Math.max(24, String(val).length * 6 + 6), h = 12;
      bg.fillStyle(C_ORANGE, 0.85);
      bg.lineStyle(1, 0x8a6435, 1);
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, 2);
      bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 2);
      const t = this.add.text(0, 0, String(val), { font: "bold 8px Courier New", color: "#241a0e" }).setOrigin(0.5);
      c.add([bg, t]);
      this.stageDynamicLayer.add(c);
      this.tweens.add({ targets: c, alpha: 1, scale: 1, duration: 80 });
      return c;
    };
    const barA = makeBar(leftX, aVal);
    const barB = makeBar(rightX, bVal);
    const opText = this.add.text(midX, cy, op, { font: "bold 13px Georgia", color: HEX_INDIGO }).setOrigin(0.5).setAlpha(0);
    this.stageDynamicLayer.add(opText);
    this.tweens.add({ targets: opText, alpha: 1, duration: 80 });
    await this.delay(110);
    await new Promise((res) => {
      this.tweens.add({ targets: barA, x: midX - 12, duration: 100 });
      this.tweens.add({ targets: barB, x: midX + 12, duration: 100, onComplete: res });
    });
    const flash = this.add.circle(midX, cy, 3, C_GOLD, 0.6);
    this.stageDynamicLayer.add(flash);
    this.tweens.add({ targets: flash, scale: 6, alpha: 0, duration: 180, onComplete: () => flash.destroy() });
    barA.destroy(); barB.destroy(); opText.destroy();
    const resultBar = makeBar(midX, result);
    await this.delay(110);
    this.tweens.add({ targets: resultBar, alpha: 0, duration: 150, delay: 180, onComplete: () => resultBar.destroy() });
    await this.delay(90);
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
  // VARIABLES STRIP
  // ══════════════════════════════════════════════════════════════

  createVariablesStrip() {
    const hdr = this.add.text(OX + 14, VARS_Y - 12, "VARIABLES", { font: "bold 9px Georgia", color: HEX_ORANGE }).setAlpha(0.7);
    this.varsContainer = this.add.container(0, 0);
    this.rigLayer.add([hdr, this.varsContainer]);
  }

  clearVariablesStrip() { this.varsContainer.removeAll(true); }

  updateVariablesStrip(vars) {
    this.varsContainer.removeAll(true);
    let idx = 0;
    for (const name in vars) {
      const v = vars[name];
      const y = VARS_Y + idx * 12;
      const display = v.type === "String" ? `"${v.value}"` : String(v.value);
      const text = `${v.type} ${name}=${display}`.slice(0, 38);
      const t = this.add.text(OX + 20, y, text, { font: "bold 9px Courier New", color: v.type === "String" ? HEX_CYAN : v.type === "double" ? HEX_ORANGE : HEX_GOLD }).setOrigin(0, 0.5);
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
    this.manifestStripText = this.add.text(OX + 8, MANIFEST_Y + 8, "", { font: "12px Arial", color: HEX_ORANGE }).setOrigin(0, 0.5).setDepth(17);
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

    this.add.text(20, 14, "THE DECIMAL WORKS", { font: "bold 15px Georgia", color: "#b0bec5" }).setDepth(51);
    this.add.text(20, 32, "Restructuring Phase — Type Conversion: parseDouble()", { font: "12px Arial", color: "#546e7a" }).setDepth(51);

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
      lg.lineStyle(1.5, C_ORANGE, 1);
      lg.strokeRect(-4, -7, 8, 14);
      lg.fillStyle(C_ORANGE, 0.7);
      lg.fillRect(-4, -1, 8, 7);
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
  // BIT — CHIEF ASSAYER VARIANT (dual-instrument badge, journal)
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
    frock.lineStyle(1, C_ORANGE, 0.7);
    frock.fillTriangle(-17, -12, 17, -12, 0, 22);
    const badgeG = this.add.graphics();
    badgeG.fillStyle(0x1a0e05, 1);
    badgeG.lineStyle(1, C_GOLD, 0.8);
    badgeG.strokeCircle(0, 4, 6);
    badgeG.fillStyle(C_COPPER, 0.8);
    badgeG.slice(0, 4, 6, Phaser.Math.DegToRad(90), Phaser.Math.DegToRad(270), false);
    badgeG.fillPath();
    badgeG.fillStyle(C_ORANGE, 0.8);
    badgeG.slice(0, 4, 6, Phaser.Math.DegToRad(-90), Phaser.Math.DegToRad(90), false);
    badgeG.fillPath();
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
    const journal = this.add.container(17, 10);
    const journalG = this.add.graphics();
    journalG.fillStyle(0x1a0e05, 1);
    journalG.lineStyle(1, C_ORANGE, 0.6);
    journalG.fillRoundedRect(-4, -7, 8, 11, 1);
    journalG.strokeRoundedRect(-4, -7, 8, 11, 1);
    journal.add(journalG);
    c.add([g, frock, badgeG, eye, pupil, lenses, gloveL, journal, tip]);
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
    g.lineStyle(1.5, C_ORANGE, 1);
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
    await this.bitSay("The Decimal Works, Assayer — where the right parser meets the right data. You've mastered both instruments; tonight you BUILD programs that choose between them. Dots mean doubles; whole numbers mean ints. The wrong choice cracks the furnace or loses precision.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(5500)]); if (!A()) return;
    this.hideBubble();

    const a1 = this.floatingAnnotation(CX + CW / 2, CY - 16, "the measurement program", HEX_CYAN);
    await this.delay(400); if (!A()) return;
    const a2 = this.floatingAnnotation(PX + PW / 2, PY - 12, "blocks — one reaches for the wrong instrument", HEX_GRAY);
    await this.delay(400); if (!A()) return;
    const a3 = this.floatingAnnotation(OX + OW / 2, OY - 12, "BOTH instruments live — the routing arrow shows which fires", HEX_GREEN_BRIGHT);
    await this.delay(400); if (!A()) return;
    const a4 = this.floatingAnnotation(110, 90, "the decision rule on the wall", HEX_GOLD);
    await this.delay(400); if (!A()) return;
    const a5 = this.floatingAnnotation(RX + RW / 2, RY - 12, "every scenario must verify", HEX_BLUE_GRAY);
    await this.delay(400); if (!A()) return;

    await this.bitSay("The works' three laws: dots mean parseDouble — always; when you need an int from decimal text, dissolve THEN cast — never parseInt on dots; and the container must match the liquid. Build, run, verify, repair.");
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

    this.tabFilename.setText(`Measure${mission.mission}.java`);
    this.renderSkeleton(mission);
    this.populatePalette(mission);
    this.buildReportRows(mission);
    this.renderMissionBrief(mission);
    this.disableRunButton();
    this.highlightCodeLine(null);
    this.verdictLamp.setFillStyle(C_GRAY);
    this.clearDualApparatus();
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

  // Mission 2's line ("int qty = <slot:parseQty>;") is single-slot, but
  // the pattern of multiple slots on one line (proven necessary in
  // L73's Mission 2 and L74's Mission 12) is reused defensively here
  // too — substitute ALL markers per line, not just the first.
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

    if (mission.mission === 2) {
      this.discriminationProactive[key] = this._slotCode("parseQty") === "Integer.parseInt(qtyStr)" && this._slotCode("parsePrice") === "Double.parseDouble(priceStr)";
    }
    if (mission.mission === 5) {
      this.discriminationProactive[key] = this._slotCode("parseAge") === "Integer.parseInt(sc.nextLine())" && this._slotCode("parseGPA") === "Double.parseDouble(sc.nextLine())";
    }
    if (mission.mission === 4) {
      this.castClean[key] = this._slotCode("cast") === "(int) raw";
    }
    if (mission.mission === 3) {
      this.scannerClean[key] = this._slotCode("convert") === "Double.parseDouble(input)";
    }
    if (mission.mission === 6) {
      this.scannerClean[key] = this._slotCode("parseW") === "Double.parseDouble(sc.nextLine())" && this._slotCode("parseP") === "Double.parseDouble(sc.nextLine())";
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
      this.time.delayedCall(1400, () => { if (c.active && draw) draw(C_ORANGE); });
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
    this.clearDualApparatus();
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
      console.warn("Level76Scene: /api/wellbeing/predict-struggle unreachable, skipping behavioral signal for this level:", e);
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
  // UNIFIED INTERPRETER — routes each parse call to the instrument
  // matching its method name (Integer.parseInt → furnace,
  // Double.parseDouble → crucible), an explicit (int) cast
  // (truncating, with a liquid→solid cast-animation cameo when the
  // cast operand is itself a double), Scanner (nextLine/nextInt,
  // usable as nested expressions), iterative left-to-right +/-/*//
  // arithmetic with int/double promotion, and printf (%.Nf AND the
  // literal-percent %% — order matters: %n must be stripped BEFORE
  // %% is folded, or a trailing %% adjacent to an unconsumed %n
  // collapses wrong).
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
          // Each operand must be stringified per JAVA's rules at the
          // point of concatenation (Double.toString() keeps the ".0"
          // for whole-number doubles) — plain JS String() silently
          // drops it. accValue may still be a RAW unformatted number
          // the first time this branch fires (accIsString was false),
          // so it needs the same treatment as partVal, not just partVal.
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

    const parseDoubleMatch = t.match(/^Double\.parseDouble\((.+)\)$/);
    if (parseDoubleMatch) {
      const argRes = await this.resolveExpr(parseDoubleMatch[1].trim(), vars);
      if (!argRes.ok) return argRes;
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
      // %n MUST be stripped before %% is folded — see header comment.
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
      this.clearDualApparatus();
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

    try { GameManager.completeLevel(75, Math.round((this.flawlessCount / MISSIONS.length) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("double_parseDouble_mastery"); } catch (_) {}
    try {
      localStorage.setItem("level76_results", JSON.stringify({
        level: 76, concept: "double_parseDouble", phase: "restructuring",
        score: this.score, missionsCompleted: 6, flawlessMissions: this.flawlessCount,
        totalRuns: this.runCount, failedRuns: this.failedRunCount, hintsUsed: this.hintCount,
        selfCorrections: this.selfCorrectionCount,
        parserDiscriminationProactive: this.discriminationProactive,
        parseDoubleThenCastClean: this.castClean,
        scannerPipelineClean: this.scannerClean,
        livesRemaining: this.lives, attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.triggerTrilogyFinale();
  }

  async triggerTrilogyFinale() {
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

    const fourthMeasure = this.add.graphics().setDepth(3);
    fourthMeasure.lineStyle(1, C_GOLD, 0.6);
    fourthMeasure.strokeRect(1140 - 4, 145 - 40, 8, 40);
    fourthMeasure.fillStyle(C_GOLD, 0.35);
    fourthMeasure.fillRect(1140 - 4, 145 - 20, 8, 20);
    this._measureShelf.push({ g: fourthMeasure });

    // Both mini instruments fire simultaneously — a shared golden glow.
    const glow = this.add.circle((MF_X0 + MC_X1) / 2, (MF_Y0 + MF_Y1) / 2, 4, C_GOLD, 0.5).setDepth(80);
    this.tweens.add({ targets: glow, scale: 30, alpha: 0, duration: 900, onComplete: () => glow.destroy() });

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

    const title = this.add.text(640, 100, "CHIEF ASSAYER", { font: "bold 32px Georgia", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(91).setScale(0);
    this.tweens.add({ targets: title, scale: 1, duration: 350, ease: "Back.easeOut" });
    this._ceremonyElements.push(title);

    const discPct = `${Object.values(this.discriminationProactive).filter(Boolean).length}/2`;
    const castPct = Object.values(this.castClean).some(Boolean) ? "✓" : "✗";
    const scannerPct = `${Object.values(this.scannerClean).filter(Boolean).length}/2`;
    const lines = [
      "MISSIONS: 6/6",
      `FLAWLESS: ${this.flawlessCount}`,
      `SELF-CORRECTIONS: ${this.selfCorrectionCount}`,
      `PARSER DISCRIMINATION: ${discPct}`,
      `DISSOLVE-THEN-CAST: ${castPct}`,
      `SCANNER PIPELINE: ${scannerPct}`,
      `HINTS: ${this.hintCount}`,
    ];
    lines.forEach((s, i) => {
      const t = this.add.text(400, 140 + i * 24, s, { font: "15px Arial", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 250, delay: 300 + i * 120 });
      this._ceremonyElements.push(t);
    });
    const totalText = this.add.text(400, 140 + 7 * 24, "TOTAL: 0", { font: "bold 21px Arial", color: HEX_GOLD }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: totalText, alpha: 1, duration: 250, delay: 1250 });
    const counter = { v: 0 };
    this.tweens.add({ targets: counter, v: this.score, duration: 1000, delay: 1250, onUpdate: () => totalText.setText(`TOTAL: ${Math.round(counter.v)}`) });
    this._ceremonyElements.push(totalText);

    const stars = this._starRating();
    for (let i = 0; i < 3; i++) {
      const earned = i < stars;
      const s = this.add.text(640 + (i - 1) * 60, 400, "★", { font: "40px Arial", color: earned ? HEX_GOLD : "#2a3040" }).setOrigin(0.5).setDepth(91).setScale(0);
      this.tweens.add({ targets: s, scale: 1, duration: 250, delay: 1850 + i * 200, ease: earned ? "Back.easeOut" : "Cubic.easeOut" });
      this._ceremonyElements.push(s);
    }

    const badge = this.add.container(640, 470).setDepth(91).setAlpha(0);
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillCircle(0, 0, 34);
    bg.lineStyle(3, C_GOLD, 1);
    bg.strokeCircle(0, 0, 34);
    const crucibleIcon = this.add.text(-14, -6, "⚗️", { font: "bold 14px Arial", color: HEX_ORANGE }).setOrigin(0.5);
    const buretteIcon = this.add.text(0, -6, "🧪", { font: "bold 14px Arial", color: HEX_GOLD }).setOrigin(0.5);
    const dualIcon = this.add.text(14, -6, "⚖️", { font: "bold 13px Arial", color: HEX_COPPER }).setOrigin(0.5);
    badge.add([bg, crucibleIcon, buretteIcon, dualIcon]);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 2450 });
    const badgeLbl = this.add.text(640, 512, "parseDouble() MASTERY", { font: "bold 15px Georgia", color: HEX_GOLD }).setOrigin(0.5).setDepth(91).setAlpha(0);
    const badgeSub = this.add.text(640, 528, "Accretion ✓  Tuning ✓  Restructuring ✓", { font: "12px Arial", color: "#78909c" }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: [badgeLbl, badgeSub], alpha: 1, duration: 300, delay: 2600 });
    this._ceremonyElements.push(badge, badgeLbl, badgeSub);

    const barY = 568;
    const barG = this.add.graphics().setDepth(91).setAlpha(0);
    barG.lineStyle(1.5, C_GRAY, 1);
    barG.strokeRoundedRect(450, barY, 380, 14, 6);
    barG.fillStyle(C_ORANGE, 1);
    barG.fillRoundedRect(450, barY, (380 * 2) / 3, 14, 6);
    const progLabel = this.add.text(640, barY + 26, "TYPE CONVERSION WING — 2 of 3 trilogies complete", { font: "bold 13px Georgia", color: HEX_ORANGE }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: [barG, progLabel], alpha: 1, duration: 300, delay: 2850 });
    this._ceremonyElements.push(barG, progLabel);

    await this.delay(3200);
    if (!this._alive) return;

    await new Promise((res) => { this.tweens.add({ targets: this.bit, x: 640, y: 610, duration: 500, ease: "Sine.easeInOut", onComplete: res }); });
    await this.bitSay("The full works: parseInt for whole numbers, parseDouble for decimals, cast when a double must narrow to an int. Six missions, one dissolution trilogy sealed — Accretion taught the schema, Tuning drilled the discrimination, Restructuring built the production programs. Chief Assayer — the works publishes under your seal. The last instrument of this trilogy of trilogies waits in the inscription room.");
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
    this._makeButton(770, 640, "NEXT: The Inscription Press →", 300, 44, { fill: 0x00733a, stroke: C_GREEN_BRIGHT, textColor: "#ffffff" }, () => {
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
