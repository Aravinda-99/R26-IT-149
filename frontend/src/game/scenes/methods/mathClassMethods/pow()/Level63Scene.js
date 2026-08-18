/**
 * Level 63 — "The Formula Works" (Math Methods: Restructuring Phase —
 * pow() trilogy finale + MATH WING SEAL)
 * ===========================================================================
 * The learner CONSTRUCTS complete exponentiation programs — no multiple
 * choice. Reuses the L27→L60 code-canvas/parts-bin/RUN architecture. The
 * rig hosts ALL THREE wing instruments simultaneously: the mini Cascade
 * Engine (pow, from L61/L62), the mini Measuring Rail (abs, from L58/L60),
 * and the mini Comparator (max/min, from L55/L57/L60) — cross-wired so any
 * combination of pow/abs/max/min nesting resolves honestly, inner-first.
 *
 * A genuine unified mini-interpreter executes the assembled program: pow
 * (cascade, zero-exponent bypass, fractional-exponent reverse, always-
 * double, int-division-in-exponent trap), abs (difference-distance), max/
 * min (cradle choreography), (int) casting, Math.PI, printf("%.2f%n", …),
 * Scanner, ArrayList.get() + 0-indexed for-loop with an accumulator.
 * Wrong builds yield REAL outcomes — M1's shape-wrong build genuinely
 * squares (πr) producing π²r²; M2's castless build genuinely stamps
 * COMPILE ERROR; M3's swapped build genuinely cascades years^rate; M6's
 * int-division-trap build genuinely bypasses to 1.0 on every test.
 *
 * NOTE ON MISSION 6 TEST DATA: the spec's own worked example claims
 * "Std Dev: 2.45" for [48, 53, 47, 52] against mean 50, but the honest
 * formula (deviations 2,3,3,2 → squares 4,9,9,4 → sum 26 → /4 = 6.5 →
 * √6.5 ≈ 2.5495) rounds to 2.55, not 2.45 — verified independently via
 * direct computation. Using the spec's stated 2.45 would fail the
 * CORRECT block combination against its own test, so the corrected,
 * genuinely-computed 2.55 is used here instead.
 */

import Phaser from "phaser";
import { GameManager } from "../../../../GameManager.js";
import { BadgeSystem } from "../../../../BadgeSystem.js";

const W = 1280, H = 720;

const C_CYAN = 0x4fc3f7, C_GOLD = 0xffd740, C_ORANGE = 0xff9800, C_BLUE_GRAY = 0x8ea6c8;
const C_GREEN_BRIGHT = 0x00e676, C_RED = 0xf44336, C_GRAY = 0x78909c, C_BRASS = 0xc8a05a;
const HEX_CYAN = "#4fc3f7", HEX_GOLD = "#ffd740", HEX_ORANGE = "#ff9800", HEX_BLUE_GRAY = "#8ea6c8";
const HEX_GREEN_BRIGHT = "#00e676", HEX_RED = "#f44336", HEX_GRAY = "#78909c", HEX_BRASS = "#c8a05a";

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
const TUTORIAL_KEY = "level63_tutorial_done";

// Rig internal layout — cascade (left), rail (center-top), comparator
// (right), sharing one window at 40-45% scale.
const MCE_CX = OX + 70, MCE_ENTRY_Y = OY + 190, MCE_STAGE_Y0 = OY + 160, MCE_STAGE_DY = 26, MCE_STAGE_COUNT = 3;
const RAIL_X0 = OX + 190, RAIL_X1 = OX + 340, RAIL_Y = OY + 70;
const MC_BEAM_CX = OX + 380, MC_BEAM_Y = OY + 130;
const MC_CRADLE_A = { x: MC_BEAM_CX - 28, y: MC_BEAM_Y + 20 };
const MC_CRADLE_B = { x: MC_BEAM_CX + 28, y: MC_BEAM_Y + 20 };
const PLINTH_X = OX + 230, PLINTH_Y = OY + 100;
const TAPE_Y = OY + 25;
const CONT_X = OX + 10, CONT_Y0 = OY + 160;
const TRK_X = OX + 330, TRK_W = 120, TRK_Y0 = OY + 160;
const TICKER_Y = OY + 236;
const SHELF_Y = OY + 205;

// ══════════════════════════════════════════════════════════════
// MISSION CONFIGURATION
// ══════════════════════════════════════════════════════════════
const MISSIONS = [
  { mission: 1, title: "The Area Table",
    brief: "Publish the area of a CIRCLE given its radius. Use Math.pow for the squaring. For radius=5:\nArea: 78.54\n(Use Math.PI and round to 2 decimal places with printf)",
    skeleton: [
      "int radius = /* test value */;",
      "",
      "double area = <slot:formula>;",
      'System.out.printf("Area: %.2f%n", area);',
    ],
    slots: [{ id: "formula", hint: "the circle area" }],
    isFormulaShape: true,
    palette: [
      { code: "Math.PI * Math.pow(radius, 2)", correct: true },
      { code: "Math.pow(Math.PI * radius, 2)", tag: "formula_shape_wrong" },
      { code: "Math.PI * radius * 2", tag: "pow_multiplies_args_belief" },
      { code: "Math.PI * Math.pow(2, radius)", tag: "pow_base_exp_swapped_belief" },
      { code: "Math.pow(radius, 2)", tag: "pi_missing" },
    ],
    tests: [
      { substitutions: { radius: "5" }, expectedOutput: "Area: 78.54" },
      { substitutions: { radius: "1" }, expectedOutput: "Area: 3.14" },
      { substitutions: { radius: "10" }, expectedOutput: "Area: 314.16" },
    ],
    postMissionNote: "Bit: 'πr² — the oldest formula in the dome. PI scales the square; the cascade does the squaring. And the shape-wrong build squared the PRODUCT — (πr)² is π²r², far too large. Multiply AFTER the cascade, not before.'",
    concept: "circle_area" },

  { mission: 2, title: "The Volume Register",
    brief: "Publish the volume of a CUBE as a WHOLE NUMBER. For side=4:\nVolume: 64",
    skeleton: [
      "int side = /* test value */;",
      "",
      "int volume = <slot:compute>;",
      'System.out.println("Volume: " + volume);',
    ],
    slots: [{ id: "compute", hint: "the cubed volume (as int!)" }],
    palette: [
      { code: "(int) Math.pow(side, 3)", correct: true },
      { code: "Math.pow(side, 3)", tag: "cast_missing_belief" },
      { code: "(int) Math.pow(3, side)", tag: "pow_base_exp_swapped_belief" },
      { code: "side * 3", tag: "pow_multiplies_args_belief" },
      { code: "(double) Math.pow(side, 3)", tag: "wrong_cast_direction" },
    ],
    tests: [
      { substitutions: { side: "4" }, expectedOutput: "Volume: 64" },
      { substitutions: { side: "3" }, expectedOutput: "Volume: 27" },
      { substitutions: { side: "10" }, expectedOutput: "Volume: 1000" },
    ],
    isCastFlagship: true,
    postMissionNote: "Bit: 'The cast is the toll — pow exits in double, the int container demands acknowledgment. (int) Math.pow: two tokens between the type and the engine. Make it reflex.'",
    concept: "cast_flagship" },

  { mission: 3, title: "The Growth Ledger",
    brief: "Publish the balance after compound growth. balance = principal × rate^years. For principal=1000, rate=1.06, years=5:\nBalance: 1338.23",
    skeleton: [
      "double principal = /* test value */;",
      "double rate = /* test value */;",
      "int years = /* test value */;",
      "",
      "double balance = <slot:formula>;",
      'System.out.printf("Balance: %.2f%n", balance);',
    ],
    slots: [{ id: "formula", hint: "the compound formula" }],
    palette: [
      { code: "principal * Math.pow(rate, years)", correct: true },
      { code: "principal * Math.pow(years, rate)", tag: "pow_base_exp_swapped_belief" },
      { code: "Math.pow(principal * rate, years)", tag: "compound_shape_wrong" },
      { code: "principal * rate * years", tag: "simple_interest_belief" },
      { code: "Math.pow(rate, years)", tag: "principal_missing" },
    ],
    tests: [
      { substitutions: { principal: "1000", rate: "1.06", years: "5" }, expectedOutput: "Balance: 1338.23" },
      { substitutions: { principal: "500", rate: "1.10", years: "3" }, expectedOutput: "Balance: 665.50" },
      { substitutions: { principal: "2000", rate: "1.05", years: "0" }, expectedOutput: "Balance: 2000.00" },
    ],
    isFormulaShape: true,
    postMissionNote: "Bit: 'principal × rate^years — the small base climbs through many stages. The zero-year test proved it again: no time, no growth. And the swapped build's cascade roared where it should have whispered — years in the port, rate on the dial, chaos in the ledger.'",
    concept: "compound_growth_production" },

  { mission: 4, title: "The Distance Gauge",
    brief: "Compute the DISTANCE between two points (x1,y1) and (x2,y2) using the Pythagorean formula. For (1,2) and (4,6):\nDistance: 5.00",
    skeleton: [
      "int x1 = /* test value */;  int y1 = /* test value */;",
      "int x2 = /* test value */;  int y2 = /* test value */;",
      "",
      "double dx = <slot:dx>;",
      "double dy = <slot:dy>;",
      "double dist = <slot:root>;",
      'System.out.printf("Distance: %.2f%n", dist);',
    ],
    slots: [{ id: "dx", hint: "horizontal gap" }, { id: "dy", hint: "vertical gap" }, { id: "root", hint: "the full distance" }],
    palette: [
      { code: "Math.abs(x1 - x2)", correct: true, slotId: "dx" },
      { code: "x1 - x2", tag: "abs_missing", alsoCorrect: true, slotId: "dx" },
      { code: "Math.abs(y1 - y2)", correct: true, slotId: "dy" },
      { code: "y1 - y2", tag: "abs_missing", alsoCorrect: true, slotId: "dy" },
      { code: "Math.pow(Math.pow(dx, 2) + Math.pow(dy, 2), 0.5)", correct: true, slotId: "root" },
      { code: "Math.pow(dx, 2) + Math.pow(dy, 2)", tag: "sqrt_missing", slotId: "root" },
      { code: "Math.pow(dx + dy, 0.5)", tag: "sum_before_square", slotId: "root" },
      { code: "dx + dy", tag: "manhattan_not_euclidean", slotId: "root" },
    ],
    isCrossMethod: true,
    tests: [
      { substitutions: { x1: "1", y1: "2", x2: "4", y2: "6" }, expectedOutput: "Distance: 5.00" },
      { substitutions: { x1: "0", y1: "0", x2: "3", y2: "4" }, expectedOutput: "Distance: 5.00" },
      { substitutions: { x1: "7", y1: "3", x2: "7", y2: "3" }, expectedOutput: "Distance: 0.00" },
    ],
    postMissionNote: "Bit (quiet, looking up at the three instrument silhouettes): 'Three instruments in one formula — abs measured the gaps, pow squared them and rooted the sum. The Pythagorean distance: the most-computed formula in graphics, physics, and every map you've ever scrolled. Every instrument under this dome just fired on one rig.'",
    concept: "euclidean_distance" },

  { mission: 5, title: "The Observer's Report",
    brief: "Read a magnitude, compute its SQUARE, and publish the result as a WHOLE NUMBER. For input 7:\nSquared: 49",
    skeleton: [
      "Scanner sc = new Scanner(System.in);",
      "",
      "int mag = <slot:read>;",
      "int squared = <slot:compute>;",
      'System.out.println("Squared: " + squared);',
    ],
    slots: [{ id: "read", hint: "read the magnitude" }, { id: "compute", hint: "square it (whole number!)" }],
    isCrossWing: true,
    noteIsScenicSpecific: true,
    palette: [
      { code: "sc.nextInt()", correct: true, slotId: "read" },
      { code: "sc.nextLine()", tag: "wrong_scanner_method", slotId: "read" },
      { code: "(int) Math.pow(mag, 2)", correct: true, slotId: "compute" },
      { code: "Math.pow(mag, 2)", tag: "cast_missing_belief", slotId: "compute" },
      { code: "(int) Math.pow(2, mag)", tag: "pow_base_exp_swapped_belief", slotId: "compute" },
      { code: "mag * mag", tag: "manual_square", alsoCorrect: true, slotId: "compute" },
    ],
    tests: [
      { input: ["7"], expectedOutput: "Squared: 49" },
      { input: ["12"], expectedOutput: "Squared: 144" },
      { input: ["0"], expectedOutput: "Squared: 0" },
    ],
    postMissionNote: "Bit (on the manual-square build): 'mag × mag works — and for squaring, it's even simpler. pow shines when the exponent is a VARIABLE, or when you need roots and fractional powers. Know both tools; choose the right one.'",
    concept: "scanner_pow_cast_pipeline" },

  { mission: 6, title: "The Deviation Index",
    brief: "Compute the population standard deviation of the dataset against a known mean of 50. For [48, 53, 47, 52]:\nStd Dev: 2.55\n\nFormula: sqrt( average of squared deviations )\n= sqrt( (dev₁² + dev₂² + ... + devₙ²) / n )",
    skeleton: [
      "ArrayList<Integer> data = /* populated by test */;",
      "int mean = 50;",
      "",
      "double sumSq = 0;",
      "for (int i = 0; <slot:cond>; i++) {",
      "    double dev = <slot:deviation>;",
      "    sumSq = sumSq + <slot:square>;",
      "}",
      "double stdDev = <slot:root>;",
      'System.out.printf("Std Dev: %.2f%n", stdDev);',
    ],
    slots: [{ id: "cond", hint: "the bound" }, { id: "deviation", hint: "each deviation" }, { id: "square", hint: "square it" }, { id: "root", hint: "the final formula" }],
    isCrossWing: true, isCapstone: true, isFormulaShape: true,
    palette: [
      { code: "i < data.size()", correct: true, slotId: "cond" },
      { code: "i <= data.size()", tag: "loop_bound_inclusive_size", slotId: "cond" },
      { code: "Math.abs(data.get(i) - mean)", correct: true, slotId: "deviation" },
      { code: "data.get(i) - mean", tag: "deviation_signed", alsoCorrect: true, slotId: "deviation" },
      { code: "Math.pow(dev, 2)", correct: true, slotId: "square" },
      { code: "dev * 2", tag: "pow_multiplies_args_belief", slotId: "square" },
      { code: "Math.pow(2, dev)", tag: "pow_base_exp_swapped_belief", slotId: "square" },
      { code: "Math.pow(sumSq / data.size(), 0.5)", correct: true, slotId: "root" },
      { code: "sumSq / data.size()", tag: "sqrt_missing", slotId: "root" },
      { code: "Math.pow(sumSq, 0.5) / data.size()", tag: "root_before_divide", slotId: "root" },
      { code: "Math.pow(sumSq / data.size(), 1/2)", tag: "pow_int_division_trap", slotId: "root" },
    ],
    tests: [
      { initialList: [48, 53, 47, 52], expectedOutput: "Std Dev: 2.55" },
      { initialList: [50, 50, 50], expectedOutput: "Std Dev: 0.00" },
      { initialList: [40, 60], expectedOutput: "Std Dev: 10.00" },
    ],
    postMissionNote: "Bit (holding the compass open, looking at the three instrument silhouettes now fully bright): 'The standard deviation — the dome's final formula. abs measured each deviation from the mean. pow squared them into weight and rooted the average into truth. The Rail, the Cascade, the accumulator, the traversal — four wings of this curriculum in one loop. You've written the formula that measures uncertainty itself. Master Formulist — the dome seals at dawn.'",
    concept: "std_dev_capstone" },
];

const MISCONCEPTION_FEEDBACK = {
  cast_missing_belief: "pow exits in double — the int container needs the (int) toll. Two tokens between the type and the engine; make it reflex.",
  wrong_cast_direction: "(double) doesn't help — the result is ALREADY a double. The int container needs (int), not the other way around.",
  pow_base_exp_swapped_belief: "The first argument enters the port, the second sets the dial — NEVER interchangeable. Side cubed is pow(side, 3), not pow(3, side).",
  pow_multiplies_args_belief: "The cascade doesn't multiply by the exponent — it multiplies the base by ITSELF, exp times. dev × 2 doubles; pow(dev, 2) squares. Count the stages.",
  formula_shape_wrong: "The cascade squared the WRONG thing — (πr)² is π²r², far too large. Multiply PI AFTER the squaring: PI × pow(r, 2).",
  pi_missing: "r² without π is just the square — a circle's area needs π as the scaling constant.",
  compound_shape_wrong: "pow(principal × rate, years) cascaded the PRODUCT — the principal should scale the result, not ride through the stages. principal × pow(rate, years).",
  simple_interest_belief: "Linear growth adds the same amount each period; compound growth MULTIPLIES the accumulated total. The cascade is exponential; simple multiplication is linear.",
  principal_missing: "rate^years is the growth FACTOR — multiply by the principal to get the balance.",
  abs_missing: "Squaring erases the sign here, so both builds pass. But abs makes the INTENT visible — the gap between coordinates is a distance, not a signed offset. Good code says what it means.",
  sqrt_missing: "Without the root, you published the SQUARED distance / the variance. The final pow(_, 0.5) takes it back to the original units.",
  sum_before_square: "pow(dx + dy, 0.5) roots the SUM of the gaps — that's neither Euclidean nor Pythagorean. Square each gap FIRST, add, THEN root.",
  manhattan_not_euclidean: "dx + dy is the MANHATTAN distance — the walking-grid distance, not the straight-line distance. Euclidean squares, sums, and roots.",
  loop_bound_inclusive_size: "The tracker's last row is red — i reached size and get(size) fell off the shelf.",
  deviation_signed: "It passed — squaring erased the sign. But abs makes the deviation's nature visible: it's a DISTANCE from the mean, not a signed offset. Both correct; one is clearer.",
  root_before_divide: "sqrt(sum) / n ≠ sqrt(sum / n) — the root must wrap the QUOTIENT, not precede the division. Mathematical order matters.",
  pow_int_division_trap: "1/2 is INTEGER DIVISION = 0. pow(anything, 0) = 1. Write 0.5 or 1.0/2 — one decimal point is the whole difference.",
  wrong_scanner_method: "nextLine() hands back a String; the int container refused it.",
  manual_square: "mag × mag works — and for squaring, it's simpler. pow shines when the exponent is a variable, or for roots and fractional powers. Know both tools; choose the right one.",
  instance_call_on_number_belief: "The wing's standing law, one final gate — Math.pow.",
};

const HINTS = {
  1: "Math.PI * Math.pow(radius, 2) — PI scales AFTER the squaring.",
  2: "(int) Math.pow(side, 3) — cast the double result down to an int.",
  3: "principal * Math.pow(rate, years) — the small rate climbs through the years.",
  4: "Math.abs for each gap; Math.pow(Math.pow(dx, 2) + Math.pow(dy, 2), 0.5) for the root.",
  5: "sc.nextInt() reads it; (int) Math.pow(mag, 2) squares it as a whole number.",
  6: "i < data.size(); Math.abs(data.get(i) - mean); Math.pow(dev, 2); Math.pow(sumSq / data.size(), 0.5).",
};

export class Level63Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level63Scene" });
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
    this.castProactive = {};
    this.formulaShapeFirst = {};
    this.crossMethodCleanFirst = {};
    this.crossWingCleanFirstRun = {};
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
    this.currentList = [];
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
    this.createInstrumentSilhouettes();
    this.createWingCrest();
    this.createMastersInkwell();
    this.createWorksFloor();
    this.createAmbientParticles();
    this.createCodeCanvas();
    this.createBlockPalette();
    this.createRunButton();
    this.createRigWindow();
    this.createMiniCascade();
    this.createMiniRail();
    this.createMiniComparator();
    this.createMiniContainers();
    this.createMiniAccumulationTracker();
    this.createMiniOutputTicker();
    this.createMiniCrossWingCameos();
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
    this.updateBitCompass(time);
    this.updateNeedleIdle(time);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // SETUP — THE FORMULA WORKS INTERIOR
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l63_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l63_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x060810).setDepth(0);
  }

  createWorksInterior() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x0a0f0c, 1);
    g.lineStyle(3, 0x8a6435, 1);
    g.fillRoundedRect(200, 30, 580, 140, 6);
    g.strokeRoundedRect(200, 30, 580, 140, 6);
    const formulae = [
      { t: "E = mc²", x: 260, y: 60 },
      { t: "a² + b² = c²", x: 460, y: 60 },
      { t: "A = πr²", x: 650, y: 60 },
    ];
    this._chalkFormulae = formulae.map((f) => this.add.text(f.x, f.y, f.t, { font: "italic 18px Georgia", color: "#e8eaf6" }).setAlpha(0.12).setDepth(2));
    const bell = this.add.graphics().setDepth(2).setAlpha(0.12);
    bell.lineStyle(1.5, 0xe8eaf6, 1);
    bell.beginPath();
    bell.moveTo(240, 145);
    for (let i = 0; i <= 20; i++) {
      const x = 240 + i * 6;
      const t = (i - 10) / 5;
      const y = 145 - 30 * Math.exp(-t * t);
      bell.lineTo(x, y);
    }
    bell.strokePath();
    this._bellCurve = bell;

    const caseG = this.add.graphics().setDepth(2);
    caseG.fillStyle(0x141a2c, 1);
    caseG.lineStyle(1, 0x8a6435, 0.4);
    caseG.fillRect(60, 350, 70, 180);
    caseG.strokeRect(60, 350, 70, 180);
    const symbols = ["+", "−", "×", "²", "√", "π", "÷", "∞"];
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 8; c++) {
        const x = 64 + c * 8, y = 354 + r * 35;
        caseG.lineStyle(1, 0x8a6435, 0.25);
        caseG.strokeRect(x, y, 7, 32);
      }
    }
    for (let i = 0; i < 8; i++) {
      const x = 64 + i * 8 + 3.5, y = 354 + (i % 5) * 35 + 16;
      this.add.text(x, y, symbols[i % symbols.length], { font: "8px Georgia", color: "#8a6435" }).setOrigin(0.5).setAlpha(0.25).setDepth(3);
    }

    const bg = this.add.graphics().setDepth(2);
    bg.fillStyle(0x060810, 1);
    bg.lineStyle(1, C_GOLD, 0.5);
    bg.fillRoundedRect(400, 12, 360, 26, 3);
    bg.strokeRoundedRect(400, 12, 360, 26, 3);
    this.add.text(580, 25, "T H E   F O R M U L A   W O R K S", { font: "bold 14px Georgia", color: HEX_GOLD }).setOrigin(0.5).setAlpha(0.8).setDepth(3);

    const wcg = this.add.graphics().setDepth(3);
    wcg.lineStyle(2, C_BRASS, 1);
    wcg.strokeRect(866, 40, 28, 24);
    this.add.text(880, 46, "★abs²", { font: "7px Georgia", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.4).setDepth(3);
  }

  createInstrumentSilhouettes() {
    this.silhouettes = {};
    const drawComparator = (g, x, y) => {
      g.lineStyle(1.5, C_BLUE_GRAY, 1);
      g.lineBetween(x - 20, y, x + 20, y);
      g.strokeEllipse(x - 15, y + 8, 12, 6);
      g.strokeEllipse(x + 15, y + 8, 12, 6);
      g.lineBetween(x, y, x, y - 14);
    };
    const drawRail = (g, x, y) => {
      g.lineStyle(1.5, C_BLUE_GRAY, 1);
      g.lineBetween(x - 22, y, x + 22, y);
      g.beginPath();
      g.moveTo(x - 4, y); g.lineTo(x + 4, y); g.lineTo(x + 2, y - 14); g.lineTo(x, y - 17); g.lineTo(x - 2, y - 14);
      g.closePath();
      g.strokePath();
    };
    const drawCascade = (g, x, y) => {
      g.lineStyle(1.5, C_BLUE_GRAY, 1);
      for (let i = 0; i < 3; i++) g.strokeRect(x - 14, y - i * 12, 28, 8);
      g.strokeTriangle(x - 10, y - 26, x + 10, y - 26, x, y - 38);
    };
    const specs = [
      { key: "comparator", x: 1130, y: 130, draw: drawComparator },
      { key: "rail", x: 1160, y: 170, draw: drawRail },
      { key: "cascade", x: 1130, y: 210, draw: drawCascade },
    ];
    specs.forEach(({ key, x, y, draw }) => {
      const g = this.add.graphics().setDepth(3).setAlpha(0.25);
      draw(g, x, y);
      this.silhouettes[key] = { g, x, y, draw };
    });
  }

  brightenSilhouettes(alpha = 1) {
    Object.values(this.silhouettes).forEach(({ g }) => this.tweens.add({ targets: g, alpha, duration: 500 }));
  }

  createWingCrest() {
    const c = this.add.container(880, 56).setDepth(4);
    const g = this.add.graphics();
    g.lineStyle(2, C_BRASS, 1);
    g.beginPath();
    g.moveTo(0, -18); g.lineTo(14, -12); g.lineTo(14, 6); g.lineTo(0, 20); g.lineTo(-14, 6); g.lineTo(-14, -12);
    g.closePath();
    g.strokePath();
    const cradles = this.add.text(0, -8, "◡◡", { font: "10px Arial", color: HEX_BLUE_GRAY }).setOrigin(0.5).setAlpha(0.7);
    const obelisk = this.add.text(0, 0, "▲", { font: "9px Arial", color: HEX_GOLD }).setOrigin(0.5).setAlpha(0.7);
    const stages = this.add.text(0, 9, "≡", { font: "10px Arial", color: HEX_CYAN }).setOrigin(0.5).setAlpha(0.7);
    c.add([g, cradles, obelisk, stages]);
    c.setAlpha(0.4);
    this._crest = { c, g, state: "idle" };
  }

  pulseCrest(state) {
    const s = this._crest;
    s.state = state;
    if (state === "idle") s.c.setAlpha(0.4);
    else if (state === "session") s.c.setAlpha(0.8);
    else if (state === "gold") {
      this.tweens.add({
        targets: s.c, scaleX: 0, duration: 150,
        onComplete: () => {
          s.g.lineStyle(2, C_GOLD, 1);
          s.g.beginPath();
          s.g.moveTo(0, -18); s.g.lineTo(14, -12); s.g.lineTo(14, 6); s.g.lineTo(0, 20); s.g.lineTo(-14, 6); s.g.lineTo(-14, -12);
          s.g.closePath();
          s.g.strokePath();
          s.c.setAlpha(1);
          this.tweens.add({ targets: s.c, scaleX: 1, duration: 150 });
        },
      });
    }
  }

  updateCrestPulse(time) {
    if (!this._crest || this._crest.state !== "session") return;
    this._crest.c.setAlpha(0.6 + Math.abs(Math.sin(time * 0.006)) * 0.4);
  }

  createMastersInkwell() {
    const c = this.add.container(730, 62).setDepth(4);
    const well = this.add.circle(0, 0, 8, 0x060810).setStrokeStyle(2, C_BRASS);
    const pen = this.add.graphics();
    pen.lineStyle(1.5, C_BRASS, 0.8);
    pen.lineBetween(10, -6, 26, -18);
    c.add([well, pen]);
    this._inkwell = { c, pen };
  }

  async inkwellFlourish() {
    const c = this._inkwell.c;
    const stroke = this.add.graphics().setDepth(80).setAlpha(0);
    stroke.lineStyle(2, C_GOLD, 0.9);
    stroke.beginPath();
    stroke.moveTo(c.x + 26, c.y - 18);
    stroke.lineTo(c.x + 50, c.y - 40);
    stroke.lineTo(c.x + 70, c.y - 20);
    stroke.strokePath();
    this.tweens.add({ targets: stroke, alpha: 1, duration: 200 });
    this.tweens.add({ targets: this._inkwell.pen, angle: -15, duration: 200, yoyo: true, repeat: 1 });
    await this.delay(800);
    this.tweens.add({ targets: stroke, alpha: 0, duration: 300, onComplete: () => stroke.destroy() });
  }

  createWorksFloor() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x0a0d18, 1);
    g.fillRect(0, 635, W, 85);
    g.lineStyle(1, 0x2a3654, 1);
    g.lineBetween(0, 637, W, 637);
    g.lineStyle(1, 0x2a3654, 0.3);
    for (let x = 0; x < W; x += 100) g.lineBetween(x, 640, x, 720);
  }

  createAmbientParticles() {
    this.ambient = [];
    const colors = [0x8ea6c8, 0xc8a05a, 0xe8eaf6];
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
    const p = this.add.particles(x, y, "l63_dot", {
      speed: { min: 80, max: 240 }, angle: { min: 0, max: 360 }, scale: { start: 0.9, end: 0 }, lifespan: 500,
      tint: [C_BRASS, C_GOLD, C_RED, C_CYAN, 0xffffff], emitting: false,
    }).setDepth(95);
    p.explode(count);
    this.time.delayedCall(900, () => p.destroy());
  }

  createGoldCyanMidnightConfetti(x, y, count = 40) {
    const p = this.add.particles(x, y, "l63_dot", {
      speed: { min: 100, max: 280 }, angle: { min: 0, max: 360 }, scale: { start: 1, end: 0 }, lifespan: 700,
      tint: [C_GOLD, C_CYAN, 0x141a2c, 0xffffff], emitting: false,
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
    this.tabFilename = this.add.text(CX + CW - 12, CY + TAB_H / 2, "Formula1.java", { font: "13px Courier New", color: "#546e7a" }).setOrigin(1, 0.5).setDepth(11);

    this.lineHighlight = this.add.rectangle(CX + CW / 2, 0, CW - 4, LINE_H, 0xffab00, 0.06).setDepth(19).setVisible(false);
    this.codeContainer = this.add.container(0, 0).setDepth(20);
  }

  _syntaxTokens(line) {
    const tokens = [];
    const re = /("(?:[^"\\]|\\.)*")|(\bimport\b|\bfor\b|\bint\b|\bdouble\b|\bString\b|\bnew\b|\bScanner\b|\bArrayList\b)|(<\w*>)|(\bMath\.PI\b|\bMath\b)|(\.abs\b|\.max\b|\.min\b|\.pow\b|\.get\b|\.size\b|\.nextInt\b|\.nextLine\b|\.printf\b|\.println\b)|(\bSystem\.out\b|\bSystem\.in\b)|(-?\d+\.\d+|-?\d+)|(%\.\d+f|%n)|(>=|<=|==|!=|\+\+|--|[+\-*/><?:])|([(){}\[\];.,=])/g;
    let last = 0, m;
    const plain = (t) => t && tokens.push({ t, c: "#e0e0e0" });
    while ((m = re.exec(line))) {
      if (m.index > last) plain(line.slice(last, m.index));
      if (m[1]) tokens.push({ t: m[1], c: "#4caf50" });
      else if (m[2]) tokens.push({ t: m[2], c: "#6a1b9a" });
      else if (m[3]) tokens.push({ t: m[3], c: "#1565c0" });
      else if (m[4]) tokens.push({ t: m[4], c: HEX_GOLD });
      else if (m[5]) tokens.push({ t: m[5], c: HEX_CYAN });
      else if (m[6]) tokens.push({ t: m[6], c: "#78909c" });
      else if (m[7]) tokens.push({ t: m[7], c: HEX_ORANGE });
      else if (m[8]) tokens.push({ t: m[8], c: "#4caf50" });
      else if (m[9]) tokens.push({ t: m[9], c: "#78909c" });
      else if (m[10]) tokens.push({ t: m[10], c: "#78909c" });
      last = m.index + m[0].length;
    }
    if (last < line.length) plain(line.slice(last));
    return tokens.length ? tokens : [{ t: line, c: "#e0e0e0" }];
  }

  _isDimmedInfrastructure(rawLine) {
    const t = rawLine.trim();
    return /^Scanner sc = new Scanner/.test(rawLine)
      || /^ArrayList<\w+>\s+\w+\s*=\s*\/\*.*\*\/;$/.test(rawLine)
      || /^((int|double)\s+\w+\s*=\s*\/\*\s*test value\s*\*\/;\s*)+$/.test(rawLine)
      || t === "}" || t === "} else {";
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
          const w = 175;
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
    this.add.text(PX + 10, PY + 8, "FORMULIST'S PARTS", { font: "bold 11px Arial", color: "#3d4450" }).setDepth(11);
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
      draw(C_BRASS);
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
    g.lineStyle(3, C_BRASS, 1);
    g.strokeRoundedRect(OX, OY, OW, OH, 12);
    this.add.text(OX + 10, OY + 6, "FORMULA RIG — LIVE", { font: "bold 11px Georgia", color: HEX_BRASS }).setAlpha(0.7).setDepth(11);

    const maskShape = this.make.graphics({ x: 0, y: 0, add: false });
    maskShape.fillRoundedRect(OX + 4, OY + 20, OW - 8, OH - 24, 10);
    this.windowMask = maskShape.createGeometryMask();
    this.rigLayer = this.add.container(0, 0).setDepth(15);
    this.rigLayer.setMask(this.windowMask);

    this.verdictLamp = this.add.circle(OX + OW - 18, OY + 14, 6, C_GRAY).setDepth(20);
  }

  // ══════════════════════════════════════════════════════════════
  // MINI CASCADE ENGINE (40%-scale L61 engine, restructuring tempo)
  // ══════════════════════════════════════════════════════════════

  createMiniCascade() {
    const g = this.add.graphics();
    g.fillStyle(0x1a1408, 1);
    g.lineStyle(1.2, C_BRASS, 1);
    g.fillRoundedRect(MCE_CX - 30, MCE_ENTRY_Y + 8, 60, 10, 3);
    g.strokeRoundedRect(MCE_CX - 30, MCE_ENTRY_Y + 8, 60, 10, 3);
    this.rigLayer.add(g);

    this.powLabel = this.add.text(MCE_CX, MCE_ENTRY_Y + 22, "Math.pow", { font: "bold 9px Courier New", color: HEX_GOLD }).setOrigin(0.5).setAlpha(0.85);
    this.rigLayer.add(this.powLabel);

    this.mceStageGfx = []; this.mceStageWindow = []; this.mceStageLabel = [];
    for (let i = 0; i < MCE_STAGE_COUNT; i++) {
      const y = MCE_STAGE_Y0 - i * MCE_STAGE_DY;
      const sg = this.add.graphics();
      sg.fillStyle(0x0d1220, 1);
      sg.lineStyle(1, C_BRASS, 1);
      sg.fillRoundedRect(MCE_CX - 24, y - 9, 48, 18, 6);
      sg.strokeRoundedRect(MCE_CX - 24, y - 9, 48, 18, 6);
      this.rigLayer.add(sg);
      this.mceStageGfx.push(sg);
      const wg = this.add.graphics();
      wg.lineStyle(1, C_BRASS, 0.8);
      wg.strokeCircle(MCE_CX, y, 6);
      this.rigLayer.add(wg);
      this.mceStageWindow.push(wg);
      const lbl = this.add.text(MCE_CX, y, "", { font: "bold 8px Courier New", color: HEX_GOLD }).setOrigin(0.5).setAlpha(0);
      this.rigLayer.add(lbl);
      this.mceStageLabel.push(lbl);
    }

    const topStageTop = MCE_STAGE_Y0 - (MCE_STAGE_COUNT - 1) * MCE_STAGE_DY - 9;
    const cone = this.add.graphics();
    cone.fillStyle(0x1a1408, 1);
    cone.lineStyle(1, C_GOLD, 1);
    cone.fillTriangle(MCE_CX - 10, topStageTop, MCE_CX + 10, topStageTop, MCE_CX, topStageTop - 14);
    cone.strokeTriangle(MCE_CX - 10, topStageTop, MCE_CX + 10, topStageTop, MCE_CX, topStageTop - 14);
    this.rigLayer.add(cone);
    this.mceSummitY = topStageTop - 14;

    this.mceBypassGfx = this.add.graphics();
    this.rigLayer.add(this.mceBypassGfx);
    this._drawMceBypass();

    this.mceStarLayer = this.add.container(0, 0);
    this.rigLayer.add(this.mceStarLayer);
  }

  _drawMceBypass() {
    this.mceBypassGfx.clear();
    this.mceBypassGfx.lineStyle(1, C_CYAN, 0.35);
    const x = MCE_CX - 40;
    const dash = 3, gap = 2;
    let y = MCE_ENTRY_Y;
    while (y > this.mceSummitY) {
      const y2 = Math.max(this.mceSummitY, y - dash);
      this.mceBypassGfx.lineBetween(x, y, x, y2);
      y -= dash + gap;
    }
    this.mceBypassGfx.lineBetween(MCE_CX - 6, MCE_ENTRY_Y, x, MCE_ENTRY_Y);
    this.mceBypassGfx.lineBetween(x, this.mceSummitY, MCE_CX, this.mceSummitY);
  }

  _fmtDoubleForPrint(v) {
    const rounded = Math.round(v * 1e9) / 1e9;
    if (Number.isInteger(rounded)) return rounded.toFixed(1);
    return String(rounded);
  }

  _fmt2dp(v) {
    return Number(v).toFixed(2);
  }

  _fmtStarValue(value, type) {
    if (type === "double") return this._fmtDoubleForPrint(Number(value));
    return String(value);
  }

  _mceMakeStar(value, type, x, y, scale = 1) {
    const c = this.add.container(x, y);
    const g = this.add.graphics();
    const color = type === "double" ? C_ORANGE : C_GOLD;
    g.fillStyle(color, 0.9);
    g.lineStyle(1, Phaser.Display.Color.IntegerToColor(color).darken(30).color, 1);
    const R = 7 * scale;
    const pts = [];
    for (let i = 0; i < 8; i++) { const r = i % 2 === 0 ? R : R * 0.45; const a = (Math.PI / 4) * i - Math.PI / 2; pts.push(Math.cos(a) * r, Math.sin(a) * r); }
    g.fillPoints(pts, true);
    g.strokePoints(pts, true);
    const display = this._fmtStarValue(value, type);
    const txt = this.add.text(0, 0, display, { font: "bold 8px Courier New", color: "#060810" }).setOrigin(0.5);
    if (txt.width > R * 1.8) txt.setFontSize(5);
    c.add([g, txt]);
    return { container: c, gfx: g, text: txt, value, type, scale };
  }

  _mceRedrawStar(star, value, type, scale) {
    star.value = value; star.type = type; star.scale = scale;
    star.gfx.clear();
    const color = type === "double" ? C_ORANGE : C_GOLD;
    star.gfx.fillStyle(color, 0.9);
    star.gfx.lineStyle(1, Phaser.Display.Color.IntegerToColor(color).darken(30).color, 1);
    const R = 7 * scale;
    const pts = [];
    for (let i = 0; i < 8; i++) { const r = i % 2 === 0 ? R : R * 0.45; const a = (Math.PI / 4) * i - Math.PI / 2; pts.push(Math.cos(a) * r, Math.sin(a) * r); }
    star.gfx.fillPoints(pts, true);
    star.gfx.strokePoints(pts, true);
    const display = this._fmtStarValue(value, type);
    star.text.setFontSize(6).setText(display);
    if (star.text.width > R * 1.8) star.text.setFontSize(5);
  }

  _mceGrowthScale(base, product) {
    if (base === 0) return 1;
    const ratio = Math.abs(product / base);
    return Math.min(1.6, Math.pow(Math.max(ratio, 0.001), 0.15));
  }

  async mceSpawnBaseStar(value, type) {
    const star = this._mceMakeStar(value, type, MCE_CX, MCE_ENTRY_Y);
    star.container.setAlpha(0);
    this.mceStarLayer.add(star.container);
    await new Promise((res) => { this.tweens.add({ targets: star.container, y: MCE_STAGE_Y0, alpha: 1, duration: 110, ease: "Sine.easeOut", onComplete: res }); });
    return star;
  }

  async mceIgniteStage(index, base, product, star) {
    const y = MCE_STAGE_Y0 - index * MCE_STAGE_DY;
    const wg = this.mceStageWindow[index];
    wg.clear();
    wg.fillStyle(C_GOLD, 0.3);
    wg.fillCircle(MCE_CX, y, 6);
    wg.lineStyle(1, C_GOLD, 1);
    wg.strokeCircle(MCE_CX, y, 6);
    const lbl = this.mceStageLabel[index];
    lbl.setText(`×${base}`).setAlpha(0);
    this.tweens.add({ targets: lbl, alpha: 1, duration: 70 });
    const scale = this._mceGrowthScale(base, product);
    await new Promise((res) => { this.tweens.add({ targets: star.container, y, duration: 90, ease: "Sine.easeOut", onComplete: res }); });
    this._mceRedrawStar(star, product, star.type, scale);
    await this.delay(50);
  }

  async mceEmergeSummit(finalValue, star) {
    await new Promise((res) => { this.tweens.add({ targets: star.container, y: this.mceSummitY, duration: 100, ease: "Sine.easeOut", onComplete: res }); });
    this._mceRedrawStar(star, finalValue, "double", Math.min(1.5, star.scale || 1));
    await this.delay(70);
    if (!this._alive) return { value: finalValue, type: "double" };
    await new Promise((res) => { this.tweens.add({ targets: star.container, x: PLINTH_X, y: PLINTH_Y, duration: 130, ease: "Sine.easeIn", onComplete: res }); });
    this._mcePlinthStar = star;
    this.updateResultRow(finalValue, "double");
    return { value: finalValue, type: "double" };
  }

  async mceBypassZero(base, type) {
    const star = await this.mceSpawnBaseStar(base, type);
    await new Promise((res) => { this.tweens.add({ targets: star.container, x: MCE_CX - 40, duration: 80, ease: "Sine.easeInOut", onComplete: res }); });
    await new Promise((res) => { this.tweens.add({ targets: star.container, y: this.mceSummitY, duration: 110, ease: "Sine.easeInOut", onComplete: res }); });
    await new Promise((res) => { this.tweens.add({ targets: star.container, x: MCE_CX, duration: 80, ease: "Sine.easeInOut", onComplete: res }); });
    this._mceRedrawStar(star, 1, "double", 1);
    await this.delay(100);
    if (!this._alive) return { value: 1, type: "double" };
    await new Promise((res) => { this.tweens.add({ targets: star.container, x: PLINTH_X, y: PLINTH_Y, duration: 120, ease: "Sine.easeIn", onComplete: res }); });
    this._mcePlinthStar = star;
    this.updateResultRow(1, "double");
    return { value: 1, type: "double" };
  }

  async mceFractionalCascade(base, exp, type) {
    const star = await this.mceSpawnBaseStar(base, type);
    for (let i = MCE_STAGE_COUNT - 1; i >= 0; i--) {
      const wg = this.mceStageWindow[i];
      const y = MCE_STAGE_Y0 - i * MCE_STAGE_DY;
      wg.clear();
      wg.fillStyle(C_CYAN, 0.25);
      wg.fillCircle(MCE_CX, y, 6);
      wg.lineStyle(1, C_CYAN, 0.8);
      wg.strokeCircle(MCE_CX, y, 6);
      await this.delay(16);
    }
    const result = Math.pow(base, exp);
    await new Promise((res) => { this.tweens.add({ targets: star.container, y: this.mceSummitY, duration: 130, ease: "Sine.easeInOut", onComplete: res }); });
    const shrinkScale = Math.min(1, this._mceGrowthScale(base, result));
    this._mceRedrawStar(star, result, "double", shrinkScale);
    await this.delay(100);
    if (!this._alive) return { value: result, type: "double" };
    this.mceStageWindow.forEach((wg, i) => { wg.clear(); wg.lineStyle(1, C_BRASS, 0.8); wg.strokeCircle(MCE_CX, MCE_STAGE_Y0 - i * MCE_STAGE_DY, 6); });
    await new Promise((res) => { this.tweens.add({ targets: star.container, x: PLINTH_X, y: PLINTH_Y, duration: 120, ease: "Sine.easeIn", onComplete: res }); });
    this._mcePlinthStar = star;
    this.updateResultRow(result, "double");
    return { value: result, type: "double" };
  }

  /** exp === 0 bypasses; non-integer exp runs the reverse-hum; integer
   * exp ≥ 0 runs a REAL repeated-multiplication loop — never a shortcut
   * Math.pow call for the visual/value. */
  async runCascade(base, exp, type) {
    if (exp === 0) return await this.mceBypassZero(base, type);
    if (!Number.isInteger(exp)) return await this.mceFractionalCascade(base, exp, type);
    const star = await this.mceSpawnBaseStar(base, type);
    let product = base;
    const visualStages = Math.min(Math.abs(exp), MCE_STAGE_COUNT);
    for (let i = 0; i < visualStages; i++) {
      if (i > 0) product *= base;
      await this.mceIgniteStage(i, base, product, star);
      if (!this._alive) return { value: product, type: "double" };
    }
    for (let i = visualStages; i < exp; i++) product *= base;
    return await this.mceEmergeSummit(product, star);
  }

  resetCascade() {
    this.mceStageWindow.forEach((wg, i) => { wg.clear(); wg.lineStyle(1, C_BRASS, 0.8); wg.strokeCircle(MCE_CX, MCE_STAGE_Y0 - i * MCE_STAGE_DY, 6); });
    this.mceStageLabel.forEach((t) => { t.setAlpha(0); t.setText(""); });
    this.mceStarLayer.removeAll(true);
    if (this._mcePlinthStar) { this._mcePlinthStar.container.destroy(); this._mcePlinthStar = null; }
  }

  async mceDiscardFade() {
    if (!this._mcePlinthStar) return;
    const star = this._mcePlinthStar;
    this._mcePlinthStar = null;
    await this.delay(200);
    await new Promise((res) => { this.tweens.add({ targets: star.container, alpha: 0, scale: 0.6, duration: 180, onComplete: () => { star.container.destroy(); res(); } }); });
  }

  async mceIntAssignmentRejection() {
    if (this._mcePlinthStar) {
      const s = this._mcePlinthStar;
      this._mcePlinthStar = null;
      this.tweens.add({ targets: s.container, x: s.container.x + 3, duration: 25, yoyo: true, repeat: 5 });
      await this.delay(180);
      this.tweens.add({ targets: s.container, alpha: 0, duration: 160, onComplete: () => s.container.destroy() });
    }
    this.showCompileErrorStamp();
    await this.delay(400);
  }

  // ══════════════════════════════════════════════════════════════
  // MINI MEASURING RAIL (abs, compact scale)
  // ══════════════════════════════════════════════════════════════

  createMiniRail() {
    this.railGfx = this.add.graphics();
    this.railTicksGfx = this.add.graphics();
    this.railLabels = this.add.container(0, 0);
    this.rigLayer.add([this.railGfx, this.railTicksGfx, this.railLabels]);
    this.railGfx.lineStyle(1.5, C_BRASS, 0.8);
    this.railGfx.lineBetween(RAIL_X0, RAIL_Y, RAIL_X1, RAIL_Y);

    this.absLabel = this.add.text(RAIL_X0 - 2, RAIL_Y - 18, "Math.abs", { font: "bold 9px Courier New", color: HEX_GOLD }).setAlpha(0.8);
    this.rigLayer.add(this.absLabel);

    this.obelisk = this.add.container((RAIL_X0 + RAIL_X1) / 2, RAIL_Y);
    const og = this.add.graphics();
    og.fillStyle(0x1a1408, 1);
    og.lineStyle(1, C_GOLD, 1);
    og.beginPath();
    og.moveTo(-3, 0); og.lineTo(3, 0); og.lineTo(2, -9); og.lineTo(0, -11); og.lineTo(-2, -9);
    og.closePath();
    og.fillPath(); og.strokePath();
    this.obeliskGlow = this.add.circle(0, 1, 4, C_GOLD, 0.25);
    this.obelisk.add([this.obeliskGlow, og]);
    this.rigLayer.add(this.obelisk);

    this.beamLayer = this.add.container(0, 0);
    this.markerLayer = this.add.container(0, 0);
    this.rigLayer.add([this.beamLayer, this.markerLayer]);
    this._varMarkers = {};

    this.rescaleRail([-10, 10]);
  }

  updateObeliskRing(time) {
    if (!this.obeliskGlow) return;
    this.obeliskGlow.setAlpha(0.2 + Math.abs(Math.sin(time * 0.001)) * 0.15);
  }

  _niceStep(raw) {
    const pw = Math.pow(10, Math.floor(Math.log10(Math.max(raw, 0.0001))));
    const n = raw / pw;
    const step = n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10;
    return step * pw;
  }

  _fmtNum(v) { return Number.isInteger(v) ? String(v) : (Math.round(v * 10) / 10).toFixed(1); }

  rescaleRail(values) {
    let lo = Math.min(...values, 0), hi = Math.max(...values, 0);
    const pad = Math.max(1, hi - lo) * 0.25;
    lo -= pad; hi += pad;
    this._railLo = lo; this._railHi = hi;
    const toX = (v) => RAIL_X0 + ((v - lo) / (hi - lo)) * (RAIL_X1 - RAIL_X0);
    this._railToX = toX;

    this.railTicksGfx.clear();
    this.railLabels.removeAll(true);
    const span = hi - lo;
    const tickStep = this._niceStep(span / 4);
    let n = 0;
    for (let v = Math.ceil(lo / tickStep) * tickStep; v <= hi; v += tickStep) {
      const x = toX(v);
      if (Math.abs(v) < 1e-9) { n++; continue; }
      this.railTicksGfx.lineStyle(1, C_BRASS, 0.4);
      this.railTicksGfx.lineBetween(x, RAIL_Y - 4, x, RAIL_Y + 4);
      n++;
    }
    const zeroX = toX(0);
    this.tweens.add({ targets: this.obelisk, x: zeroX, duration: 220, ease: "Sine.easeInOut" });
  }

  clearRail() {
    this.markerLayer.removeAll(true);
    this.beamLayer.removeAll(true);
    if (this._plinthChip) { this._plinthChip.destroy(); this._plinthChip = null; }
    this._varMarkers = {};
  }

  _makeMarker(value, type, size, dashed) {
    const c = this.add.container(0, 0);
    const g = this.add.graphics();
    const color = type === "double" ? C_ORANGE : C_GOLD;
    g.fillStyle(color, dashed ? 0.5 : 0.9);
    g.lineStyle(1, Phaser.Display.Color.IntegerToColor(color).darken(30).color, 1);
    const pts = [];
    const R = size / 2;
    for (let i = 0; i < 8; i++) { const r = i % 2 === 0 ? R : R * 0.45; const a = (Math.PI / 4) * i - Math.PI / 2; pts.push(Math.cos(a) * r, Math.sin(a) * r); }
    g.fillPoints(pts, true);
    g.strokePoints(pts, true);
    const display = type === "double" ? this._fmtDoubleForPrint(Number(value)) : String(value);
    const txt = this.add.text(0, -size / 2 - 8, display, { font: "bold 6.5px Courier New", color: type === "double" ? HEX_ORANGE : HEX_GOLD }).setOrigin(0.5);
    c.add([g, txt]);
    return { container: c, gfx: g, text: txt, value, type };
  }

  async dropMarker(value, type, opts = {}) {
    const x = this._railToX(Number(value));
    const marker = this._makeMarker(value, type, opts.size || 10, opts.dashed);
    marker.container.setPosition(x, RAIL_Y - 30);
    marker.container.setAlpha(0);
    this.markerLayer.add(marker.container);
    await new Promise((res) => { this.tweens.add({ targets: marker.container, y: RAIL_Y, alpha: opts.dashed ? 0.6 : 1, duration: 150, ease: "Bounce.easeOut", onComplete: res }); });
    return marker;
  }

  async ensureVarMarker(name, value, type) {
    if (this._varMarkers[name]) {
      this.tweens.add({ targets: this._varMarkers[name].container, scale: 1.3, duration: 90, yoyo: true });
      return this._varMarkers[name];
    }
    const m = await this.dropMarker(value, type);
    this._varMarkers[name] = m;
    return m;
  }

  async extendBeam(fromX, toX, color = C_CYAN) {
    const dir = toX >= fromX ? 1 : -1;
    const dist = Math.abs(toX - fromX);
    const beam = this.add.rectangle(fromX, RAIL_Y, 0, 2.5, color, 0.9);
    const glow = this.add.rectangle(fromX, RAIL_Y, 0, 5, color, 0.2);
    this.beamLayer.add([glow, beam]);
    const state = { w: 0 };
    await new Promise((res) => {
      this.tweens.add({
        targets: state, w: dist, duration: 180, ease: "Sine.easeOut",
        onUpdate: () => { beam.width = state.w; beam.x = fromX + (dir * state.w) / 2; glow.width = state.w + 4; glow.x = beam.x; },
        onComplete: res,
      });
    });
    return { beam, glow, fromX, toX };
  }

  showLengthChip(midX, length, type) {
    const display = type === "double" ? this._fmtDoubleForPrint(Number(length)) : String(length);
    const c = this.add.container(midX, RAIL_Y - 16).setDepth(9).setAlpha(0).setScale(0.5);
    const g = this.add.graphics();
    g.fillStyle(0x0a0d18, 1);
    g.lineStyle(1.2, C_CYAN, 1);
    g.fillRoundedRect(-15, -8, 30, 16, 4);
    g.strokeRoundedRect(-15, -8, 30, 16, 4);
    const t = this.add.text(0, 0, display, { font: "bold 10px Courier New", color: HEX_CYAN }).setOrigin(0.5);
    if (t.width > 26) t.setFontSize(6.5);
    c.add([g, t]);
    this.tweens.add({ targets: c, alpha: 1, scale: 1, duration: 120, ease: "Back.easeOut" });
    return c;
  }

  async zeroPulse() {
    const ring = this.add.circle(this.obelisk.x, RAIL_Y, 5, C_GOLD, 0.4);
    this.rigLayer.add(ring);
    this.tweens.add({ targets: ring, scale: 3, alpha: 0, duration: 300, onComplete: () => ring.destroy() });
    await this.delay(200);
  }

  async detachAndDeliver(beamObj, chip) {
    await new Promise((res) => { this.tweens.add({ targets: [beamObj.beam, beamObj.glow, chip], y: "-=12", duration: 150, ease: "Sine.easeOut", onComplete: res }); });
    await new Promise((res) => { this.tweens.add({ targets: [beamObj.beam, beamObj.glow], scaleX: 0, alpha: 0, duration: 130, onComplete: () => { beamObj.beam.destroy(); beamObj.glow.destroy(); res(); } }); });
    await new Promise((res) => { this.tweens.add({ targets: chip, x: PLINTH_X, y: PLINTH_Y, duration: 170, ease: "Sine.easeIn", onComplete: res }); });
    this._plinthChip = chip;
  }

  async _deliverChipOnly(chip) {
    await new Promise((res) => { this.tweens.add({ targets: chip, y: "-=12", duration: 130, onComplete: res }); });
    await new Promise((res) => { this.tweens.add({ targets: chip, x: PLINTH_X, y: PLINTH_Y, duration: 170, ease: "Sine.easeIn", onComplete: res }); });
    this._plinthChip = chip;
  }

  async runMeasurement(value, type, opts = {}) {
    let marker;
    if (opts.varName) marker = await this.ensureVarMarker(opts.varName, value, type);
    else marker = await this.dropMarker(value, type);
    if (!this._alive) return { value: Math.abs(Number(value)), type };

    const length = Math.abs(Number(value));
    const targetX = this._railToX(Number(value));
    const midX = (this.obelisk.x + targetX) / 2;
    let beamObj = null;

    if (Number(value) === 0) await this.zeroPulse();
    else beamObj = await this.extendBeam(this.obelisk.x, targetX);
    const chip = this.showLengthChip(Number(value) === 0 ? this.obelisk.x : midX, length, type);
    await this.delay(220);
    if (!this._alive) return { value: length, type };
    if (beamObj) await this.detachAndDeliver(beamObj, chip);
    else await this._deliverChipOnly(chip);

    this.updateResultRow(length, type);
    return { value: length, type };
  }

  async runDifferenceMeasurement(aRes, bRes) {
    const av = Number(aRes.value), bv = Number(bRes.value);
    const diff = av - bv;
    const widened = aRes.type === "double" || bRes.type === "double";
    const diffType = widened ? "double" : "int";

    this.rescaleRail([av, bv, diff]);
    await this.delay(200);
    if (!this._alive) return { value: Math.abs(diff), type: diffType };

    await this.dropMarker(av, widened ? "double" : aRes.type, { size: 12 });
    await this.dropMarker(bv, widened ? "double" : bRes.type, { size: 12 });

    await this.delay(280);
    if (!this._alive) return { value: Math.abs(diff), type: diffType };

    const diffMarker = await this.dropMarker(diff, diffType, { size: 10, dashed: true });

    const length = Math.abs(diff);
    const targetX = this._railToX(diff);
    const midX = (this.obelisk.x + targetX) / 2;
    let beamObj = null;
    if (diff === 0) await this.zeroPulse();
    else beamObj = await this.extendBeam(this.obelisk.x, targetX);
    const mainChip = this.showLengthChip(diff === 0 ? this.obelisk.x : midX, length, diffType);

    const ax = this._railToX(av), bx = this._railToX(bv);
    const betweenBeam = await this.extendBeam(ax, bx, C_GOLD);
    const betweenChip = this.showLengthChip((ax + bx) / 2, length, diffType);
    this.tweens.add({ targets: [mainChip, betweenChip], scale: 1.15, duration: 110, yoyo: true });
    await this.delay(450);
    if (!this._alive) return { value: length, type: diffType };

    await new Promise((res) => {
      this.tweens.add({ targets: [betweenBeam.beam, betweenBeam.glow, betweenChip], alpha: 0, duration: 180, onComplete: () => { betweenBeam.beam.destroy(); betweenBeam.glow.destroy(); betweenChip.destroy(); res(); } });
    });

    if (beamObj) await this.detachAndDeliver(beamObj, mainChip);
    else await this._deliverChipOnly(mainChip);

    this.updateResultRow(length, diffType);

    this.tweens.add({ targets: diffMarker.container, alpha: 0, duration: 220, delay: 100, onComplete: () => diffMarker.container.destroy() });
    return { value: length, type: diffType };
  }

  async markerShudder(value, type, varName) {
    const marker = (varName && this._varMarkers[varName]) ? this._varMarkers[varName] : await this.dropMarker(value, type);
    await this.delay(80);
    this.tweens.add({ targets: marker.container, x: marker.container.x + 2, duration: 28, yoyo: true, repeat: 5 });
    const q = this.add.text(marker.container.x, marker.container.y - 20, "?", { font: "bold 16px Georgia", color: HEX_RED }).setOrigin(0.5);
    this.rigLayer.add(q);
    this.missionElements.push(q);
    this.tweens.add({ targets: q, alpha: 0.2, duration: 60, yoyo: true, repeat: 3 });
    await this.delay(300);
  }

  showCompileErrorStamp() {
    const stamp = this.add.text(CX + CW / 2, CY + CH / 2, "COMPILE ERROR", { font: "bold 26px Arial", color: HEX_RED }).setOrigin(0.5).setDepth(80).setScale(1.7).setAngle(-8).setAlpha(0);
    this.missionElements.push(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 200, ease: "Cubic.easeOut" });
    this.screenShake(0.005, 170);
    this.time.delayedCall(1100, () => { if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 220, onComplete: () => stamp.destroy() }); });
  }

  // ══════════════════════════════════════════════════════════════
  // MINI GREAT COMPARATOR (max/min, compact scale)
  // ══════════════════════════════════════════════════════════════

  createMiniComparator() {
    const g = this.add.graphics();
    g.fillStyle(0x1a1408, 1);
    g.lineStyle(1, C_BRASS, 1);
    g.fillRoundedRect(MC_BEAM_CX - 34, MC_BEAM_Y - 3, 68, 6, 3);
    g.strokeRoundedRect(MC_BEAM_CX - 34, MC_BEAM_Y - 3, 68, 6, 3);
    this.rigLayer.add(g);

    this.mcModeText = this.add.text(MC_BEAM_CX, MC_BEAM_Y - 12, "Math.max/min", { font: "bold 6.5px Courier New", color: HEX_CYAN }).setOrigin(0.5);
    this.rigLayer.add(this.mcModeText);

    [MC_CRADLE_A, MC_CRADLE_B].forEach((c) => {
      g.lineStyle(1, C_BRASS, 0.5);
      g.lineBetween(c.x, MC_BEAM_Y + 3, c.x, c.y - 6);
    });

    this.mcCradleGfx = { a: this.add.graphics(), b: this.add.graphics() };
    [["a", MC_CRADLE_A], ["b", MC_CRADLE_B]].forEach(([key, pos]) => {
      const cg = this.mcCradleGfx[key];
      cg.fillStyle(0x141a2c, 1);
      cg.lineStyle(1, C_BRASS, 1);
      cg.fillEllipse(pos.x, pos.y, 22, 9);
      cg.strokeEllipse(pos.x, pos.y, 22, 9);
      this.rigLayer.add(cg);
    });

    this.mcNeedle = this.add.container(MC_BEAM_CX, MC_BEAM_Y + 3);
    const ng = this.add.graphics();
    ng.fillStyle(0x1a1408, 1);
    ng.lineStyle(1, C_BRASS, 1);
    ng.fillTriangle(-1, 0, 1, 0, 0, 11);
    ng.fillStyle(C_BRASS, 1);
    ng.fillCircle(0, 0, 1.2);
    this.mcNeedle.add(ng);
    this.rigLayer.add(this.mcNeedle);

    this.mcStarLayer = this.add.container(0, 0);
    this.rigLayer.add(this.mcStarLayer);
    this._mcCurrentMode = null;
  }

  mcSetModePlate(method) {
    if (this._mcCurrentMode === method) return;
    this._mcCurrentMode = method;
    this.tweens.add({
      targets: this.mcModeText, scaleY: 0, duration: 55,
      onComplete: () => { this.mcModeText.setText(`Math.${method}`); this.tweens.add({ targets: this.mcModeText, scaleY: 1, duration: 55 }); },
    });
  }

  _mcTypeColorInt(type) { return type === "double" ? C_ORANGE : C_GOLD; }
  _mcTypeColorHex(type) { return type === "double" ? HEX_ORANGE : HEX_GOLD; }

  _mcMakeStar(value, type, x, y) {
    const c = this.add.container(x, y);
    const g = this.add.graphics();
    const color = this._mcTypeColorInt(type);
    g.fillStyle(color, 0.9);
    g.lineStyle(1, Phaser.Display.Color.IntegerToColor(color).darken(30).color, 1);
    const pts = [];
    for (let i = 0; i < 8; i++) { const r = i % 2 === 0 ? 6 : 2.6; const a = (Math.PI / 4) * i - Math.PI / 2; pts.push(Math.cos(a) * r, Math.sin(a) * r); }
    g.fillPoints(pts, true);
    g.strokePoints(pts, true);
    const display = type === "double" ? this._fmtDoubleForPrint(Number(value)) : String(value);
    const txt = this.add.text(0, 0, display, { font: "bold 5.5px Courier New", color: "#060810" }).setOrigin(0.5);
    if (txt.width > 12) txt.setFontSize(4.5);
    c.add([g, txt]);
    return { container: c, gfx: g, text: txt, value, type };
  }

  async mcSpawnStar(value, type, cradleKey) {
    const pos = cradleKey === "a" ? MC_CRADLE_A : MC_CRADLE_B;
    const star = this._mcMakeStar(value, type, pos.x, pos.y);
    star.container.setAlpha(0).setScale(0);
    this.mcStarLayer.add(star.container);
    await new Promise((res) => { this.tweens.add({ targets: star.container, alpha: 1, scale: 1.1, duration: 80, ease: "Back.easeOut", onComplete: () => { this.tweens.add({ targets: star.container, scale: 1, duration: 55 }); res(); } }); });
    if (cradleKey === "a") this._mcStarsA = star; else this._mcStarsB = star;
    return star;
  }

  mcResetCradles() {
    if (this._mcStarsA) { this._mcStarsA.container.destroy(); this._mcStarsA = null; }
    if (this._mcStarsB) { this._mcStarsB.container.destroy(); this._mcStarsB = null; }
  }

  async mcCarryStar(starObj, cradleKey) {
    const pos = cradleKey === "a" ? MC_CRADLE_A : MC_CRADLE_B;
    await new Promise((res) => { this.tweens.add({ targets: starObj.container, x: pos.x, y: pos.y - 8, duration: 100, ease: "Sine.easeInOut", onComplete: res }); });
    await new Promise((res) => { this.tweens.add({ targets: starObj.container, y: pos.y, duration: 60, ease: "Sine.easeOut", onComplete: res }); });
    if (cradleKey === "a") this._mcStarsA = starObj; else this._mcStarsB = starObj;
  }

  _mcWarmStarToDouble(star) {
    star.type = "double";
    star.gfx.clear();
    star.gfx.fillStyle(C_ORANGE, 0.9);
    star.gfx.lineStyle(1, Phaser.Display.Color.IntegerToColor(C_ORANGE).darken(30).color, 1);
    const pts = [];
    for (let i = 0; i < 8; i++) { const r = i % 2 === 0 ? 6 : 2.6; const a = (Math.PI / 4) * i - Math.PI / 2; pts.push(Math.cos(a) * r, Math.sin(a) * r); }
    star.gfx.fillPoints(pts, true);
    star.gfx.strokePoints(pts, true);
    star.text.setText(this._fmtDoubleForPrint(Number(star.value)));
  }

  async mcNeedleOscillate() {
    const angles = [-18, 14, -10];
    for (const a of angles) {
      await new Promise((res) => { this.tweens.add({ targets: this.mcNeedle, angle: a, duration: 50, ease: "Sine.easeInOut", onComplete: res }); });
    }
  }

  async mcNeedleLock(side) {
    const angle = side === "a" ? -24 : 24;
    await new Promise((res) => { this.tweens.add({ targets: this.mcNeedle, angle, duration: 55, ease: "Back.easeOut", onComplete: res }); });
    const chime = this.add.circle(MC_BEAM_CX, MC_BEAM_Y + 3, 2, C_GOLD, 0.5);
    this.rigLayer.add(chime);
    this.tweens.add({ targets: chime, scale: 3, alpha: 0, duration: 160, onComplete: () => chime.destroy() });
  }

  mcResetNeedle() {
    this._mcNeedleBusy = false;
    this.mcNeedle.setAngle(0);
  }

  updateNeedleIdle(time) {
    if (!this.mcNeedle || this._mcNeedleBusy) return;
    this.mcNeedle.setAngle(Math.sin(time * 0.0015) * 1);
  }

  async mcDescendReturnStar(value, type, sourceStar) {
    if (this._plinthChip) { this._plinthChip.destroy(); this._plinthChip = null; }
    const from = sourceStar ? { x: sourceStar.container.x, y: sourceStar.container.y } : { x: MC_BEAM_CX, y: MC_BEAM_Y };
    const chip = this.showLengthChip(from.x, value, type);
    chip.setPosition(from.x, from.y - 5);
    await new Promise((res) => { this.tweens.add({ targets: chip, x: PLINTH_X, y: PLINTH_Y, duration: 150, ease: "Sine.easeIn", onComplete: res }); });
    this._plinthChip = chip;
  }

  async _placeIntoCradle(resolved, cradleKey) {
    if (resolved.kind === "nested") await this.mcCarryStar(resolved.starObj, cradleKey);
    else await this.mcSpawnStar(resolved.value, resolved.type, cradleKey);
  }

  async runComparison(aRes, bRes, method) {
    this.mcResetCradles();
    this.mcSetModePlate(method);
    this._mcNeedleBusy = true;
    await this._placeIntoCradle(aRes, "a");
    await this._placeIntoCradle(bRes, "b");
    this.mcSetModePlate(method);

    const widened = aRes.type === "double" || bRes.type === "double";
    if (widened) {
      if (this._mcStarsA && this._mcStarsA.type !== "double") this._mcWarmStarToDouble(this._mcStarsA);
      if (this._mcStarsB && this._mcStarsB.type !== "double") this._mcWarmStarToDouble(this._mcStarsB);
      await this.delay(60);
    }
    await this.delay(50);
    if (!this._alive) return { ok: true, value: aRes.value, type: aRes.type };
    await this.mcNeedleOscillate();
    if (!this._alive) return { ok: true, value: aRes.value, type: aRes.type };

    const av = widened ? Number(aRes.value) : aRes.value;
    const bv = widened ? Number(bRes.value) : bRes.value;
    let winSide, winner, winnerType;
    if (av === bv) { winSide = "a"; winner = av; winnerType = widened ? "double" : aRes.type; }
    else {
      const aWins = method === "min" ? av < bv : av > bv;
      winSide = aWins ? "a" : "b";
      winner = aWins ? av : bv;
      winnerType = widened ? "double" : (aWins ? aRes.type : bRes.type);
    }
    await this.mcNeedleLock(winSide);
    if (!this._alive) return { ok: true, value: winner, type: winnerType };

    const winStar = winSide === "a" ? this._mcStarsA : this._mcStarsB;
    const loseStar = winSide === "a" ? this._mcStarsB : this._mcStarsA;
    if (winStar) this.tweens.add({ targets: winStar.container, scale: 1.2, duration: 80, yoyo: true });
    if (loseStar) this.tweens.add({ targets: loseStar.container, alpha: 0.6, duration: 120 });

    this._mcNeedleBusy = false;
    await this.mcDescendReturnStar(winner, winnerType, winStar);
    this.updateResultRow(winner, winnerType);
    return { ok: true, value: winner, type: winnerType, winnerStarObj: winStar };
  }

  // ══════════════════════════════════════════════════════════════
  // MINI TYPED CONTAINERS
  // ══════════════════════════════════════════════════════════════

  createMiniContainers() {
    const hdr = this.add.text(CONT_X, CONT_Y0 - 12, "VARIABLES", { font: "bold 9px Georgia", color: HEX_BRASS }).setAlpha(0.7);
    this.containerLayer = this.add.container(0, 0);
    this.rigLayer.add([hdr, this.containerLayer]);
    this.containerObjs = {};
    this._containerOrder = [];
  }

  miniDispenseTo(name, value, type) {
    if (!this.containerObjs[name]) {
      const idx = this._containerOrder.length;
      const y = CONT_Y0 + idx * 14;
      const g = this.add.graphics();
      g.fillStyle(0x0a1520, 1);
      g.lineStyle(1, C_CYAN, 0.6);
      g.fillRoundedRect(CONT_X, y, 110, 12, 3);
      g.strokeRoundedRect(CONT_X, y, 110, 12, 3);
      const t = this.add.text(CONT_X + 4, y + 6, "", { font: "bold 6.5px Courier New", color: HEX_CYAN }).setOrigin(0, 0.5);
      this.containerLayer.add([g, t]);
      this.containerObjs[name] = t;
      this._containerOrder.push(name);
    }
    const display = type === "double" ? this._fmtDoubleForPrint(Number(value)) : String(value);
    this.containerObjs[name].setText(`${name} = ${display}`);
    this.tweens.add({ targets: this.containerObjs[name], scale: 1.15, duration: 80, yoyo: true });
  }

  clearContainers() {
    this.containerLayer.removeAll(true);
    this.containerObjs = {};
    this._containerOrder = [];
  }

  // ══════════════════════════════════════════════════════════════
  // ACCUMULATION TRACKER (per-iteration rows + running-sum column)
  // ══════════════════════════════════════════════════════════════

  createMiniAccumulationTracker() {
    const hdr = this.add.text(TRK_X, TRK_Y0 - 12, "ACCUMULATION TRACKER", { font: "bold 9px Georgia", color: HEX_BRASS }).setAlpha(0.7);
    this.trackerContainer = this.add.container(0, 0);
    this.rigLayer.add([hdr, this.trackerContainer]);
    this._trackerRows = [];
    this._trackerDash = this.add.text(TRK_X + TRK_W / 2, TRK_Y0 + 50, "—", { font: "bold 12px Courier New", color: "#3a2618" }).setOrigin(0.5);
    this.rigLayer.add(this._trackerDash);
  }

  appendTrackerRow(text, isCrash, bold) {
    if (this._trackerDash && this._trackerDash.active) { this._trackerDash.destroy(); this._trackerDash = null; }
    const maxRows = 5;
    if (this._trackerRows.length >= maxRows) {
      const removed = this._trackerRows.shift();
      removed.destroy();
      this._trackerRows.forEach((r) => { r.y -= 13; });
    }
    const y = TRK_Y0 + this._trackerRows.length * 13;
    const t = this.add.text(TRK_X, y, text, { font: "6.5px Courier New", color: isCrash ? HEX_RED : (bold ? HEX_GOLD : "#e8dfc8") }).setAlpha(0);
    if (t.width > TRK_W - 4) t.setFontSize(6);
    this.trackerContainer.add(t);
    this._trackerRows.push(t);
    this.tweens.add({ targets: t, alpha: 1, duration: 90 });
  }

  clearTracker() {
    this.trackerContainer.removeAll(true);
    this._trackerRows = [];
    if (!this._trackerDash) { this._trackerDash = this.add.text(TRK_X + TRK_W / 2, TRK_Y0 + 50, "—", { font: "bold 12px Courier New", color: "#3a2618" }).setOrigin(0.5); this.rigLayer.add(this._trackerDash); }
  }

  // ══════════════════════════════════════════════════════════════
  // OUTPUT TICKER
  // ══════════════════════════════════════════════════════════════

  createMiniOutputTicker() {
    const tg = this.add.graphics();
    tg.fillStyle(0x050914, 0.9);
    tg.fillRect(OX + 8, TICKER_Y - 8, OW - 16, 16);
    this.tickerText = this.add.text(OX + 14, TICKER_Y, "", { font: "bold 11px Courier New", color: HEX_GREEN_BRIGHT }).setOrigin(0, 0.5);
    this.rigLayer.add([tg, this.tickerText]);
    this._tickerLines = [];
  }

  async printToTicker(text) {
    this._tickerLines.push(text);
    const joined = this._tickerLines.join(" ⏎ ");
    for (let i = this.tickerText.text.length; i <= joined.length; i++) {
      if (!this._alive) return;
      this.tickerText.setText(joined.slice(0, i));
      if (this.tickerText.width > OW - 30) this.tickerText.setFontSize(7);
      await this.delay(5);
    }
  }

  clearTicker() {
    this._tickerLines = [];
    if (this.tickerText) this.tickerText.setText("").setFontSize(9);
  }

  // ══════════════════════════════════════════════════════════════
  // CROSS-WING CAMEOS — Scanner tape (M5) + mini bookshelf (M6)
  // ══════════════════════════════════════════════════════════════

  createMiniCrossWingCameos() {
    this.tapeContainer = this.add.container(0, 0).setVisible(false);
    this.rigLayer.add(this.tapeContainer);
    this.tapeState = [];

    this.shelfContainer = this.add.container(0, 0).setVisible(false);
    this.rigLayer.add(this.shelfContainer);
    this.shelfBookSprites = [];
  }

  activateCameo(kind) {
    if (kind === "tape") this.tapeContainer.setVisible(true);
    if (kind === "shelf") this.shelfContainer.setVisible(true);
  }

  parkCameos() {
    this.tapeContainer.setVisible(false);
    this.tapeContainer.removeAll(true);
    this.tapeState = [];
    this.shelfContainer.setVisible(false);
    this.shelfContainer.removeAll(true);
    this.shelfBookSprites = [];
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
    const cellW = 6, x1 = OX + OW - 10;
    const totalW = Math.min(this.tapeState.length * cellW, 130);
    const startX = x1 - totalW;
    const bg = this.add.graphics();
    bg.fillStyle(0xe8f0e8, 0.85);
    bg.fillRoundedRect(startX - 3, TAPE_Y - 6, totalW + 6, 12, 3);
    this.tapeContainer.add(bg);
    this.tapeState.slice(-Math.floor(totalW / cellW)).forEach((cell, i) => {
      const x = startX + i * cellW + cellW / 2;
      const disp = cell.kind === "space" ? "␣" : cell.kind === "newline" ? "⏎" : cell.ch;
      const color = cell.kind === "space" ? "#c2185b" : cell.kind === "newline" ? "#7b1fa2" : "#2e7d32";
      const t = this.add.text(x, TAPE_Y, disp, { font: "bold 8px Courier New", color }).setOrigin(0.5);
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
    await this.delay(45);
  }

  populateMiniShelf(initialList) {
    this.shelfContainer.removeAll(true);
    this.shelfBookSprites = [];
    this.currentList = initialList.map((v) => ({ value: v, type: "int" }));
    const hdr = this.add.text(CONT_X, SHELF_Y - 12, "data", { font: "bold 9px Georgia", color: HEX_BRASS }).setAlpha(0.7);
    this.shelfContainer.add(hdr);
    this.currentList.forEach((entry, i) => {
      const x = CONT_X + 8 + i * 22;
      const c = this.add.container(x, SHELF_Y);
      const g = this.add.graphics();
      g.fillStyle(C_GOLD, 0.85);
      g.lineStyle(1, 0xb8860b, 1);
      g.fillRoundedRect(-9, -6, 18, 12, 2);
      g.strokeRoundedRect(-9, -6, 18, 12, 2);
      const t = this.add.text(0, -1, String(entry.value), { font: "bold 8px Courier New", color: "#0a0704" }).setOrigin(0.5);
      if (t.width > 15) t.setFontSize(5);
      const lbl = this.add.text(0, 9, `[${i}]`, { font: "bold 7px Courier New", color: HEX_GRAY }).setOrigin(0.5);
      c.add([g, t, lbl]);
      this.shelfContainer.add(c);
      this.shelfBookSprites.push({ container: c, entry });
    });
  }

  async retrieveGhost(index) {
    const entry = this.currentList[index];
    if (!entry) return null;
    const book = this.shelfBookSprites[index];
    if (book) this.tweens.add({ targets: book.container, scale: 1.25, duration: 70, yoyo: true });
    const ghostX = book ? book.container.x : CONT_X + 8;
    const ghost = this.add.container(ghostX, SHELF_Y).setAlpha(0);
    const g = this.add.graphics();
    g.fillStyle(C_GOLD, 0.5);
    g.fillRoundedRect(-8, -5, 16, 10, 2);
    const t = this.add.text(0, 0, String(entry.value), { font: "bold 5.5px Courier New", color: "#0a0704" }).setOrigin(0.5);
    ghost.add([g, t]);
    this.shelfContainer.add(ghost);
    await new Promise((res) => { this.tweens.add({ targets: ghost, alpha: 0.8, y: SHELF_Y - 7, duration: 80, onComplete: res }); });
    await new Promise((res) => { this.tweens.add({ targets: ghost, x: MCE_CX, y: MCE_ENTRY_Y, alpha: 0, duration: 120, ease: "Sine.easeIn", onComplete: () => { ghost.destroy(); res(); } }); });
    return entry;
  }

  // ══════════════════════════════════════════════════════════════
  // MANIFEST STRIP / TEST REPORT / MISSION BRIEF
  // ══════════════════════════════════════════════════════════════

  createManifestStrip() {
    const g = this.add.graphics().setDepth(16);
    g.fillStyle(0x0f0a06, 0.92);
    g.fillRect(OX, MANIFEST_Y - 2, OW, 20);
    this.manifestStripText = this.add.text(OX + 8, MANIFEST_Y + 8, "", { font: "12px Arial", color: HEX_BRASS }).setOrigin(0, 0.5).setDepth(17);
    this.resultText = this.add.text(OX + OW - 8, MANIFEST_Y + 8, "—", { font: "bold 13px Courier New", color: HEX_GRAY }).setOrigin(1, 0.5).setDepth(17);
  }
  updateManifestStrip(text) { this.manifestStripText.setText(text); }

  chalkWriteLine(text, color) {}

  chalkEvaluationArrow(value, type) { this.updateResultRow(value, type); }

  updateResultRow(value, type) {
    if (!this.resultText) return;
    if (value === null) { this.resultText.setText("—").setColor(HEX_GRAY); return; }
    if (type === "crash") { this.resultText.setText("✗ ERROR").setColor(HEX_RED); return; }
    const display = type === "double" ? this._fmtDoubleForPrint(Number(value)) : String(value);
    this.resultText.setText(`→ ${display}`).setColor(type === "double" ? HEX_ORANGE : HEX_GOLD);
  }

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
    if (test.initialList) return `[${test.initialList.join(",")}]`.slice(0, 26);
    if (test.input) return `in: ${test.input.join(",")}`;
    const subs = test.substitutions || {};
    return Object.entries(subs).map(([k, v]) => `${k}=${v}`).join(" ").slice(0, 26);
  }

  buildReportRows(mission) {
    this.reportRows.forEach((r) => r.container.destroy());
    this.reportRows = [];
    mission.tests.forEach((test, i) => {
      const y = RY + 24 + i * 24;
      const c = this.add.container(RX + 10, y).setDepth(11).setAlpha(0.35);
      const inputT = this.add.text(0, 0, this._compactTestLabel(test), { font: "11px Courier New", color: "#b0bec5" }).setOrigin(0, 0.5);
      const expT = this.add.text(190, 0, test.expectedOutput.slice(0, 22), { font: "11px Courier New", color: "#78909c" }).setOrigin(0, 0.5);
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
    g.fillStyle(0x1a0e05, 1);
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

    this.add.text(20, 14, "THE FORMULA WORKS", { font: "bold 15px Georgia", color: "#b0bec5" }).setDepth(51);
    this.add.text(20, 32, "Restructuring Phase — Math Methods: pow()", { font: "12px Arial", color: "#546e7a" }).setDepth(51);

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
      lg.lineStyle(2, C_BRASS, 1);
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
  // BIT — MASTER FORMULIST VARIANT (compass, set square)
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
    const cloak = this.add.graphics();
    cloak.fillStyle(0x141a2c, 0.85);
    cloak.lineStyle(1, C_BLUE_GRAY, 0.6);
    cloak.fillTriangle(-16, -14, 16, -14, 0, 20);
    const setSquare = this.add.graphics();
    setSquare.lineStyle(1.2, C_BLUE_GRAY, 0.6);
    setSquare.strokeTriangle(-22, 8, -22, 20, -10, 20);
    const gloveL = this.add.circle(-16, 10, 4, 0xe0d6b8, 0.85);
    this.compassPivot = this.add.container(16, 4);
    const legL = this.add.graphics();
    legL.lineStyle(1.5, C_BRASS, 0.9);
    legL.lineBetween(0, 0, -5, 14);
    const legR = this.add.graphics();
    legR.lineStyle(1.5, C_BRASS, 0.9);
    legR.lineBetween(0, 0, 5, 14);
    this.compassLegR = legR;
    const pencilTip = this.add.circle(5, 14, 1, C_GOLD, 0.9);
    this.compassPivot.add([legL, legR, pencilTip]);
    c.add([g, cloak, eye, pupil, setSquare, gloveL, this.compassPivot, tip]);
    this.tweens.add({ targets: tip, alpha: 0.3, duration: 900, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: c, y: "+=3", duration: 2100, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
    this.bit = c;
  }

  updateBitCompass(time) {
    if (!this.compassLegR) return;
    this.compassLegR.setAngle(Math.sin(time * 0.00157) * 5);
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
    await this.bitSay("The Formula Works, Formulist — where the dome's raw power becomes published mathematics. You've predicted and drilled; tonight you BUILD the formulae themselves. Geometry, growth, distance, deviation — every formula assembles from the instruments you own.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(5500)]); if (!A()) return;
    this.hideBubble();

    const a1 = this.floatingAnnotation(CX + CW / 2, CY - 16, "the formula", HEX_CYAN);
    await this.delay(400); if (!A()) return;
    const a2 = this.floatingAnnotation(PX + PW / 2, PY - 12, "blocks — one type won't fit, one exponent is backwards", HEX_GRAY);
    await this.delay(400); if (!A()) return;
    const a3 = this.floatingAnnotation(OX + OW / 2, OY - 12, "cascade, rail, comparator — ALL THREE live", HEX_GREEN_BRIGHT);
    await this.delay(400); if (!A()) return;
    const a4 = this.floatingAnnotation(880, 36, "the dome watches", HEX_GOLD);
    await this.delay(400); if (!A()) return;
    const a5 = this.floatingAnnotation(RX + RW / 2, RY - 12, "every scenario must verify", HEX_BLUE_GRAY);
    await this.delay(400); if (!A()) return;

    await this.bitSay("The workshop's three rules: pow returns double — cast or accommodate; base enters the port, exponent sets the dial — never swap them; and 1.0 in the denominator saves the division from truncation. Build, run, verify, repair. The dome seals at dawn.");
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

    this.tabFilename.setText(`Formula${mission.mission}.java`);
    this.renderSkeleton(mission);
    this.populatePalette(mission);
    this.buildReportRows(mission);
    this.renderMissionBrief(mission);
    this.disableRunButton();
    this.highlightCodeLine(null);
    this.verdictLamp.setFillStyle(C_GRAY);
    this.clearContainers();
    this.clearTracker();
    this.clearTicker();
    this.clearRail();
    this.mcResetCradles();
    this.mcResetNeedle();
    this.resetCascade();
    this.parkCameos();
    this.updateManifestStrip("");
    this.updateResultRow(null, null);
    this.pulseCrest("idle");

    const firstTest = mission.tests[0];
    if (mission.mission === 5) { this.activateCameo("tape"); this.loadMiniTape(firstTest.input); }
    if (mission.mission === 6) { this.activateCameo("shelf"); this.populateMiniShelf(firstTest.initialList); }

    this.inputLocked = false;
  }

  clearMission() {
    this.missionElements.forEach((e) => { if (e && e.destroy) e.destroy(); });
    this.missionElements = [];
  }

  buildProgramItems(mission, assembled) {
    const out = [];
    mission.skeleton.forEach((rawLine) => {
      const sm = rawLine.match(/<slot:(\w+)>/);
      if (sm) {
        const slotId = sm[1];
        const code = assembled[slotId] && assembled[slotId][0] ? assembled[slotId][0].code : "";
        const codeLines = code.split("\n");
        out.push({ text: rawLine.replace(/<slot:\w+>/, codeLines[0]), slotId });
        for (let k = 1; k < codeLines.length; k++) out.push({ text: codeLines[k], slotId });
      } else {
        out.push({ text: rawLine, slotId: null });
      }
    });
    return out;
  }

  /** Substitutes EVERY "<type> <name> = /* test value * /;" placeholder
   * found in a line — mission 4's skeleton packs two declarations onto
   * one line ("int x1 = ...;  int y1 = ...;"), so a single-match ^...$
   * anchor (as used in prior levels) would miss the second. */
  _substituteTestLine(line, test) {
    if (!test.substitutions) return line;
    return line.replace(/(int|double)\s+(\w+)\s*=\s*\/\*\s*test value\s*\*\/;/g, (match, type, name) => {
      if (test.substitutions[name] !== undefined) return `${type} ${name} = ${test.substitutions[name]};`;
      return match;
    });
  }

  // ══════════════════════════════════════════════════════════════
  // COMPILE CHECK
  // ══════════════════════════════════════════════════════════════

  compileCheckProgram(mission, items, assembled) {
    const failFor = (slotId, fallbackTag) => {
      const blockTag = slotId && assembled[slotId] && assembled[slotId][0] ? assembled[slotId][0].tag : null;
      return { ok: false, slotId, tag: blockTag || fallbackTag };
    };
    const fullText = items.map((i) => i.text).join("\n");

    const instanceMatch = fullText.match(/(\w+)\.(abs|max|min|pow)\(/);
    if (instanceMatch && instanceMatch[1] !== "Math") {
      const badItem = items.find((i) => i.text.includes(instanceMatch[0]));
      return failFor(badItem && badItem.slotId, "instance_call_on_number_belief");
    }

    for (const slotId in this.slotDefs) {
      const skelLine = mission.skeleton.find((l) => l.includes(`<slot:${slotId}>`));
      if (!skelLine) continue;
      const code = (assembled[slotId] && assembled[slotId][0] ? assembled[slotId][0].code : "").trim();
      if (/^int\s+\w+\s*=\s*<slot:\w+>;$/.test(skelLine) && code === "sc.nextLine()") {
        return failFor(slotId, "wrong_scanner_method");
      }
    }

    return { ok: true };
  }

  // ══════════════════════════════════════════════════════════════
  // PROACTIVE-METRIC DETECTION
  // ══════════════════════════════════════════════════════════════

  _recordFirstRunMetrics(mission, passed) {
    const key = `mission${mission.mission}`;
    if (this._firstRunMetricsRecorded[key]) return;
    this._firstRunMetricsRecorded[key] = true;

    if (mission.isCastFlagship) {
      const block = this.slotContents.compute && this.slotContents.compute[0];
      const tag = block ? block.container.getData("tag") : null;
      this.castProactive[key] = !tag;
    }
    if (mission.mission === 5) {
      const block = this.slotContents.compute && this.slotContents.compute[0];
      const code = block ? block.container.getData("code") : "";
      this.castProactive[key] = code === "(int) Math.pow(mag, 2)";
    }
    if (mission.isFormulaShape) {
      const slotId = mission.mission === 6 ? "root" : "formula";
      const block = this.slotContents[slotId] && this.slotContents[slotId][0];
      const tag = block ? block.container.getData("tag") : null;
      this.formulaShapeFirst[key] = !tag;
    }
    if (mission.isCrossMethod) this.crossMethodCleanFirst[key] = passed;
    if (mission.isCrossWing) this.crossWingCleanFirstRun[key] = passed;
  }

  // ══════════════════════════════════════════════════════════════
  // UNIFIED INTERPRETER — Math.pow (cascade, zero-bypass, fractional-
  // reverse, always-double, int/int-division-in-exponent), cross-nested
  // with Math.abs (difference-distance) and Math.max/min (cradle
  // choreography), (int) casting, Math.PI, printf, Scanner, ArrayList
  // .get() + 0-indexed for-loop accumulator. Never scripted.
  // ══════════════════════════════════════════════════════════════

  _splitTopArgs(argsStr) {
    const parts = [];
    let cur = "", depth = 0;
    for (let i = 0; i < argsStr.length; i++) {
      const ch = argsStr[i];
      if (ch === "(") depth++;
      if (ch === ")") depth--;
      if (ch === "," && depth === 0) { parts.push(cur.trim()); cur = ""; continue; }
      cur += ch;
    }
    const last = cur.trim();
    if (last || parts.length) parts.push(last);
    return parts.filter((p) => p !== "");
  }

  /** Splits on top-level (paren-depth 0) binary +/- only — a LEADING
   * sign (empty accumulator so far) is never treated as an operator,
   * so "-3" stays one literal term, not an operator with no left side. */
  _splitTopPM(expr) {
    const parts = [];
    let cur = "", depth = 0, opForNext = "+";
    for (let i = 0; i < expr.length; i++) {
      const ch = expr[i];
      if (ch === "(") depth++;
      if (ch === ")") depth--;
      if (depth === 0 && (ch === "+" || ch === "-") && cur.trim().length > 0) {
        parts.push({ op: opForNext, term: cur.trim() });
        opForNext = ch;
        cur = "";
        continue;
      }
      cur += ch;
    }
    if (cur.trim()) parts.push({ op: opForNext, term: cur.trim() });
    return parts;
  }

  _splitTopMulDiv(expr) {
    const parts = [], ops = [];
    let cur = "", depth = 0;
    for (let i = 0; i < expr.length; i++) {
      const ch = expr[i];
      if (ch === "(") depth++;
      if (ch === ")") depth--;
      if (depth === 0 && (ch === "*" || ch === "/")) {
        parts.push(cur.trim()); ops.push(ch); cur = ""; continue;
      }
      cur += ch;
    }
    parts.push(cur.trim());
    return { parts, ops };
  }

  _splitTopPlus(expr) {
    const parts = [];
    let cur = "", inQuotes = false, depth = 0;
    for (let i = 0; i < expr.length; i++) {
      const ch = expr[i];
      if (ch === '"' && expr[i - 1] !== "\\") inQuotes = !inQuotes;
      if (!inQuotes) {
        if (ch === "(") depth++;
        if (ch === ")") depth--;
        if (ch === "+" && depth === 0) { parts.push(cur.trim()); cur = ""; continue; }
      }
      cur += ch;
    }
    if (cur.trim() || parts.length) parts.push(cur.trim());
    return parts;
  }

  _evalSimpleValue(expr, vars) {
    const t = expr.trim();
    if (/^-?\d+\.\d+$/.test(t)) return { ok: true, value: parseFloat(t), type: "double" };
    if (/^-?\d+$/.test(t)) return { ok: true, value: parseInt(t, 10), type: "int" };
    if (/^[A-Za-z_]\w*$/.test(t) && vars && vars[t] !== undefined) return { ok: true, value: vars[t].value, type: vars[t].type };
    const negVar = t.match(/^-([A-Za-z_]\w*)$/);
    if (negVar && vars && vars[negVar[1]] !== undefined) {
      const v = vars[negVar[1]];
      return { ok: true, value: -v.value, type: v.type };
    }
    return { ok: false, crash: "eval" };
  }

  async crashGet(index) {
    const stamp = this.add.text(OX + OW / 2, OY + 130, "IndexOutOfBoundsException", { font: "bold 9px Courier New", color: HEX_RED }).setOrigin(0.5).setAngle(-6).setAlpha(0);
    this.rigLayer.add(stamp);
    this.missionElements.push(stamp);
    this.tweens.add({ targets: stamp, alpha: 1, duration: 100 });
    this.screenShake(0.005, 140);
    await this.delay(400);
    if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 160, onComplete: () => stamp.destroy() });
  }

  /** Resolves a value that is NOT itself a Math call: data.get(i), a
   * variable (or its negation), or a literal. */
  async _resolveValueOnly(expr, vars) {
    const t = expr.trim();
    const getMatch = t.match(/^(\w+)\.get\((.*)\)$/);
    if (getMatch) {
      const idxArg = this._evalSimpleValue(getMatch[2], vars);
      if (!idxArg.ok) return { ok: false, crash: "eval" };
      const idx = idxArg.value;
      if (idx < 0 || idx >= this.currentList.length) { await this.crashGet(idx); return { ok: false, crash: "ioobe", index: idx }; }
      const entry = await this.retrieveGhost(idx);
      return { ok: true, value: entry.value, type: "int" };
    }
    const sizeMatch = t.match(/^(\w+)\.size\(\)$/);
    if (sizeMatch) return { ok: true, value: this.currentList.length, type: "int" };
    return this._evalSimpleValue(t, vars);
  }

  _isBalanced(s) {
    let depth = 0;
    for (const ch of s) { if (ch === "(") depth++; if (ch === ")") depth--; if (depth < 0) return false; }
    return depth === 0;
  }

  /** A single top-level factor: Math.PI, (int) cast, Math.abs/max/min/
   * pow(...), get(), a balanced parenthesized sub-expression, or a
   * plain value. Guaranteed paren-balanced (came from a depth-aware
   * split), so `.` never gets mistaken for a decimal point mid-call. */
  async _resolveSingleTerm(t, vars) {
    const tt = t.trim();
    if (tt === "Math.PI") return { ok: true, value: Math.PI, type: "double" };
    const castMatch = tt.match(/^\((int|double)\)\s*(.+)$/);
    if (castMatch) {
      const r = await this.resolveTopLevelValue(castMatch[2].trim(), vars);
      if (!r.ok) return r;
      if (castMatch[1] === "double") return { ok: true, value: Number(r.value), type: "double" };
      return { ok: true, value: Math.trunc(Number(r.value)), type: "int" };
    }
    const absMatch = tt.match(/^Math\.abs\((.*)\)$/);
    if (absMatch) return await this.evalAbsCall(absMatch[1], vars);
    const mmMatch = tt.match(/^Math\.(max|min)\((.*)\)$/);
    if (mmMatch) return await this.evalMaxMinCall(mmMatch[1], mmMatch[2], vars);
    const powMatch = tt.match(/^Math\.pow\((.*)\)$/);
    if (powMatch) return await this.evalPowCall(powMatch[1], vars);
    const parenMatch = tt.match(/^\((.*)\)$/);
    if (parenMatch && this._isBalanced(parenMatch[1])) return await this.resolveTopLevelValue(parenMatch[1], vars);
    return await this._resolveValueOnly(tt, vars);
  }

  /** * and / at the level directly above single terms — Java's int/int
   * division floors toward zero (the pow_int_division_trap: 1/2 = 0). */
  async _resolveProduct(expr, vars) {
    const t = expr.trim();
    const md = this._splitTopMulDiv(t);
    if (md.parts.length > 1) {
      let acc = null, accType = null;
      for (let i = 0; i < md.parts.length; i++) {
        const r = await this._resolveSingleTerm(md.parts[i], vars);
        if (!r.ok) return r;
        if (i === 0) { acc = r.value; accType = r.type; continue; }
        const op = md.ops[i - 1];
        if (op === "*") {
          acc = acc * r.value;
          accType = accType === "double" || r.type === "double" ? "double" : "int";
        } else if (accType === "int" && r.type === "int") {
          acc = Math.trunc(acc / r.value);
          accType = "int";
        } else {
          acc = acc / r.value;
          accType = "double";
        }
      }
      return { ok: true, value: acc, type: accType };
    }
    return await this._resolveSingleTerm(t, vars);
  }

  /** Top-level value resolution for declaration/reassignment RHS,
   * printf/println parts, and pow/abs/max-min call arguments. Always
   * splits on +/- FIRST (paren-aware) so "Math.abs(a) - Math.abs(b)"
   * is never mistaken for a single call, THEN * / (Java precedence),
   * THEN single terms (Math calls, casts, literals). */
  async resolveTopLevelValue(expr, vars) {
    const t = expr.trim();
    const parts = this._splitTopPM(t);
    if (parts.length === 0) return { ok: false, crash: "eval" };
    if (parts.length === 1) return await this._resolveProduct(parts[0].term, vars);

    let total = 0, sawDouble = false;
    for (const p of parts) {
      const r = await this._resolveProduct(p.term, vars);
      if (!r.ok) return r;
      if (this._mcePlinthStar) {
        const s = this._mcePlinthStar;
        this._mcePlinthStar = null;
        this.tweens.add({ targets: s.container, alpha: 0, duration: 130, onComplete: () => s.container.destroy() });
      }
      if (this._plinthChip) {
        const c = this._plinthChip;
        this._plinthChip = null;
        this.tweens.add({ targets: c, alpha: 0, duration: 130, onComplete: () => c.destroy() });
      }
      if (r.type === "double") sawDouble = true;
      total += p.op === "-" ? -r.value : r.value;
    }
    const finalType = sawDouble ? "double" : "int";
    const finalValue = sawDouble ? total : Math.round(total);
    const chip = this.showLengthChip(PLINTH_X, finalValue, finalType);
    chip.setPosition(PLINTH_X, PLINTH_Y);
    this._plinthChip = chip;
    this.updateResultRow(finalValue, finalType);
    return { ok: true, value: finalValue, type: finalType };
  }

  /** Math.abs(argExpr) — difference-distance choreography for a genuine
   * "a - b", the cross-nested Math.max/min case, or a plain measurement. */
  async evalAbsCall(argExpr, vars) {
    const t = argExpr.trim();
    const parts = this._splitTopPM(t);
    if (parts.length === 2 && parts[1].op === "-") {
      const aRes = await this._resolveValueOnly(parts[0].term, vars);
      if (!aRes.ok) return aRes;
      const bRes = await this._resolveValueOnly(parts[1].term, vars);
      if (!bRes.ok) return bRes;
      return await this.runDifferenceMeasurement(aRes, bRes);
    }
    if (/^Math\.(max|min)\(/.test(t)) {
      const mm = t.match(/^Math\.(max|min)\((.*)\)$/);
      const inner = await this.evalMaxMinCall(mm[1], mm[2], vars);
      if (!inner.ok) return inner;
      return await this.runMeasurement(inner.value, inner.type, {});
    }
    const r = await this._resolveValueOnly(t, vars);
    if (!r.ok) return r;
    const isVar = /^[A-Za-z_]\w*$/.test(t) && vars && vars[t] !== undefined;
    return await this.runMeasurement(r.value, r.type, isVar ? { varName: t } : {});
  }

  /** Math.max/min(argsStr) — each argument may itself be a nested
   * Math.abs(...) call (cross-nesting the other direction). */
  async evalMaxMinCall(method, argsStr, vars) {
    const args = this._splitTopArgs(argsStr);
    if (args.length !== 2) return { ok: false, crash: "wrong_arity" };
    const aRes = await this._resolveMaxMinArg(args[0], vars);
    if (!aRes.ok) return aRes;
    const bRes = await this._resolveMaxMinArg(args[1], vars);
    if (!bRes.ok) return bRes;
    return await this.runComparison(aRes, bRes, method);
  }

  async _resolveMaxMinArg(expr, vars) {
    const t = expr.trim();
    if (/^Math\.abs\(/.test(t)) {
      const absMatch = t.match(/^Math\.abs\((.*)\)$/);
      const r = await this.evalAbsCall(absMatch[1], vars);
      if (!r.ok) return r;
      return { ok: true, kind: "literal", value: r.value, type: r.type };
    }
    if (/^Math\.(max|min)\(/.test(t)) {
      const mm = t.match(/^Math\.(max|min)\((.*)\)$/);
      const r = await this.evalMaxMinCall(mm[1], mm[2], vars);
      if (!r.ok) return r;
      return { ok: true, kind: "nested", value: r.value, type: r.type, starObj: r.winnerStarObj };
    }
    const r = await this._resolveValueOnly(t, vars);
    if (!r.ok) return r;
    return { ok: true, kind: "literal", value: r.value, type: r.type };
  }

  async evalPowCall(argsStr, vars) {
    const args = this._splitTopArgs(argsStr);
    if (args.length !== 2) return { ok: false, crash: "wrong_arity" };
    const baseRes = await this.resolveTopLevelValue(args[0], vars);
    if (!baseRes.ok) return baseRes;
    const expRes = await this.resolveTopLevelValue(args[1], vars);
    if (!expRes.ok) return expRes;
    if (this._mcePlinthStar) {
      const s = this._mcePlinthStar;
      this._mcePlinthStar = null;
      this.tweens.add({ targets: s.container, alpha: 0, duration: 110, onComplete: () => s.container.destroy() });
    }
    if (this._plinthChip) {
      const c = this._plinthChip;
      this._plinthChip = null;
      this.tweens.add({ targets: c, alpha: 0, duration: 110, onComplete: () => c.destroy() });
    }
    const result = await this.runCascade(baseRes.value, expRes.value, baseRes.type);
    return { ok: true, value: result.value, type: result.type };
  }

  // ── statements ──

  async execStatement(line, vars) {
    const instanceMatch = line.match(/(\w+)\.(abs|max|min|pow)\(/);
    if (instanceMatch && instanceMatch[1] !== "Math") {
      const token = instanceMatch[1];
      let val = 0, typ = "int";
      if (vars[token] !== undefined) { val = vars[token].value; typ = vars[token].type; }
      else if (/^\d+$/.test(token)) { val = parseInt(token, 10); typ = "int"; }
      await this.markerShudder(val, typ, vars[token] !== undefined ? token : null);
      return { ok: false, crash: "compile" };
    }

    const declVar = line.match(/^(int|double)\s+(\w+)\s*=\s*(.*);$/);
    if (declVar) {
      const varType = declVar[1], name = declVar[2], rhs = declVar[3].trim();
      if (rhs === "sc.nextInt()") {
        this.updateManifestStrip(`int ${name} = sc.nextInt()`);
        const read = this.evaluateNextToken(this.tapeState);
        await this.tapeConsumeVisual(read.consumedCount);
        const value = parseInt(read.rawValue, 10) || 0;
        vars[name] = { value, type: "int" };
        this.miniDispenseTo(name, value, "int");
        await this.delay(60);
        return { ok: true };
      }
      if (rhs === "sc.nextLine()") return { ok: false, crash: "compile" };

      const r = await this.resolveTopLevelValue(rhs, vars);
      if (!r.ok) return r;
      if (varType === "int" && r.type === "double") {
        await this.mceIntAssignmentRejection();
        return { ok: false, crash: "compile" };
      }
      vars[name] = { value: r.value, type: varType === "double" ? "double" : r.type };
      const isMeasureExpr = /Math\.(abs|max|min|pow)\(/.test(rhs);
      if (isMeasureExpr) {
        if (this._mcePlinthStar) await this.deliverToVariableFromCascade(name, vars[name].value, vars[name].type);
        else if (this._plinthChip) await this.deliverToVariable(name, vars[name].value, vars[name].type);
        else this.miniDispenseTo(name, vars[name].value, vars[name].type);
      } else {
        this.miniDispenseTo(name, vars[name].value, vars[name].type);
      }
      return { ok: true };
    }

    const reassign = line.match(/^(\w+)\s*=\s*(.*);$/);
    if (reassign) {
      const name = reassign[1], rhs = reassign[2].trim();
      const r = await this.resolveTopLevelValue(rhs, vars);
      if (!r.ok) return r;
      vars[name] = { value: r.value, type: vars[name] ? vars[name].type : r.type };
      const isMeasureExpr = /Math\.(abs|max|min|pow)\(/.test(rhs);
      if (isMeasureExpr) {
        if (this._mcePlinthStar) await this.deliverToVariableFromCascade(name, vars[name].value, vars[name].type);
        else if (this._plinthChip) await this.deliverToVariable(name, vars[name].value, vars[name].type);
        else this.miniDispenseTo(name, vars[name].value, vars[name].type);
      } else {
        this.miniDispenseTo(name, vars[name].value, vars[name].type);
      }
      return { ok: true };
    }

    const printfMatch = line.match(/^System\.out\.printf\("([^"]*)%n"\s*,\s*(.*)\);$/);
    if (printfMatch) {
      this.updateManifestStrip("System.out.printf(…)");
      const fmt = printfMatch[1], argExpr = printfMatch[2].trim();
      const specMatch = fmt.match(/^(.*)%\.(\d+)f$/);
      const r = await this.resolveTopLevelValue(argExpr, vars);
      if (!r.ok) return r;
      const out = specMatch ? `${specMatch[1]}${Number(r.value).toFixed(parseInt(specMatch[2], 10))}` : `${fmt}${r.value}`;
      if (!this._printedLines) this._printedLines = [];
      this._printedLines.push(out);
      await this.printToTicker(out);
      return { ok: true };
    }

    const printMatch = line.match(/^System\.out\.println\((.*)\);$/);
    if (printMatch) {
      this.updateManifestStrip("System.out.println(…)");
      const parts = this._splitTopPlus(printMatch[1].trim());
      let out = "";
      for (const p of parts) {
        const pt = p.trim();
        if (/^".*"$/.test(pt)) { out += pt.slice(1, -1); continue; }
        const r = await this.resolveTopLevelValue(pt, vars);
        if (!r.ok) return r;
        out += r.type === "double" ? this._fmtDoubleForPrint(Number(r.value)) : String(r.value);
      }
      if (!this._printedLines) this._printedLines = [];
      this._printedLines.push(out);
      await this.printToTicker(out);
      return { ok: true };
    }

    const bareMath = line.match(/^(Math\.(abs|max|min|pow)\(.*\));$/);
    if (bareMath) {
      const r = await this.resolveTopLevelValue(bareMath[1], vars);
      if (!r.ok) return r;
      await this.discardFade();
      return { ok: true };
    }

    return { ok: true };
  }

  async discardFade() {
    if (this._mcePlinthStar) {
      const star = this._mcePlinthStar;
      this._mcePlinthStar = null;
      await this.delay(280);
      await new Promise((res) => { this.tweens.add({ targets: star.container, alpha: 0, scale: 0.6, duration: 220, onComplete: () => { star.container.destroy(); res(); } }); });
      return;
    }
    if (!this._plinthChip) return;
    const chip = this._plinthChip;
    this._plinthChip = null;
    await this.delay(280);
    await new Promise((res) => { this.tweens.add({ targets: chip, alpha: 0, scale: 0.6, duration: 220, onComplete: () => { chip.destroy(); res(); } }); });
  }

  async deliverToVariable(name, value, type) {
    const chip = this._plinthChip;
    this._plinthChip = null;
    this.miniDispenseTo(name, value, type);
    if (chip) {
      const destY = this.containerObjs[name].y;
      await new Promise((res) => { this.tweens.add({ targets: chip, x: CONT_X + 55, y: destY, alpha: 0.2, duration: 200, ease: "Sine.easeIn", onComplete: () => { chip.destroy(); res(); } }); });
    }
  }

  async deliverToVariableFromCascade(name, value, type) {
    const star = this._mcePlinthStar;
    this._mcePlinthStar = null;
    this.miniDispenseTo(name, value, type);
    if (star) {
      const destY = this.containerObjs[name].y;
      await new Promise((res) => { this.tweens.add({ targets: star.container, x: CONT_X + 55, y: destY, alpha: 0.2, duration: 200, ease: "Sine.easeIn", onComplete: () => { star.container.destroy(); res(); } }); });
    }
  }

  evalLoopCond(condExpr, vars) {
    const m = condExpr.trim().match(/^(\w+)\s*(<=|>=|<|>)\s*(\w+)\.size\(\)$/);
    if (!m) return false;
    const lhs = vars[m[1]] !== undefined ? vars[m[1]].value : NaN;
    const rhs = this.currentList.length;
    switch (m[2]) {
      case "<": return lhs < rhs;
      case "<=": return lhs <= rhs;
      case ">": return lhs > rhs;
      case ">=": return lhs >= rhs;
    }
    return false;
  }

  async execForLoop(startVal, condExpr, bodyLines, vars) {
    let iv = startVal, iterations = 0;
    while (iterations < 200) {
      if (!this._alive) return { ok: true };
      vars.i = { value: iv, type: "int" };
      if (!this.evalLoopCond(condExpr, vars)) {
        if (iterations === 0) { this.appendTrackerRow(`i=${iv} | size=${this.currentList.length} → skipped`); await this.delay(220); }
        break;
      }
      let crashed = null;
      for (const l of bodyLines) {
        const r = await this.execStatement(l.trim(), vars);
        if (!r.ok) { crashed = r; break; }
      }
      if (crashed) { this.appendTrackerRow(`i=${iv} → ✗ crash`, true); return crashed; }
      const devValue = vars.dev ? (vars.dev.type === "double" ? this._fmtDoubleForPrint(vars.dev.value) : vars.dev.value) : "?";
      const sumValue = vars.sumSq !== undefined ? this._fmtDoubleForPrint(Number(vars.sumSq.value)) : "?";
      this.appendTrackerRow(`i=${iv} | dev=${devValue} | sum=${sumValue}`);
      iv++; iterations++;
      await this.delay(170);
    }
    return { ok: true };
  }

  _findBlockEnd(lines, openIdx) {
    let depth = 1;
    for (let j = openIdx + 1; j < lines.length; j++) {
      const t = lines[j].trim();
      if (t.endsWith("{")) depth++;
      else if (t === "}") { depth--; if (depth === 0) return j; }
    }
    return lines.length - 1;
  }

  async runProgram(lines) {
    const vars = {};
    for (let li = 0; li < lines.length; li++) {
      const tt = lines[li].trim();
      if (tt && !tt.startsWith("//") && !/^Scanner sc/.test(tt) && !/^ArrayList</.test(tt)) { this.highlightCodeLine(li); break; }
    }
    let i = 0;
    while (i < lines.length) {
      if (!this._alive) return { ok: true };
      const raw = lines[i];
      const t = raw.trim();
      if (!t || t.startsWith("//") || t === "}") { i++; continue; }
      if (/^Scanner sc = new Scanner/.test(t) || /^ArrayList<\w+>\s+\w+\s*=\s*\/\*.*\*\/;$/.test(t)) { i++; continue; }

      const forMatch = t.match(/^for \(int (\w+) = (\d+); (.*); \1\+\+\) \{$/);
      if (forMatch) {
        const end = this._findBlockEnd(lines, i);
        const bodyLines = lines.slice(i + 1, end);
        const r = await this.execForLoop(parseInt(forMatch[2], 10), forMatch[3], bodyLines, vars);
        if (!r.ok) { this.highlightCodeLine(null); return r; }
        i = end + 1;
        if (i < lines.length) this.highlightCodeLine(i);
        continue;
      }

      this.highlightCodeLine(i);
      const r = await this.execStatement(raw, vars);
      if (!r.ok) { this.highlightCodeLine(null); return r; }
      i++;
      if (i < lines.length) this.highlightCodeLine(i);
    }
    this.highlightCodeLine(null);
    return { ok: true };
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

  _pulseOffendingBlock(slotId) {
    const placed = slotId && this.slotContents[slotId] && this.slotContents[slotId][0];
    if (!placed) return;
    const c = placed.container;
    const draw = c.getData("draw");
    if (draw) draw(C_RED);
    this.tweens.add({ targets: c, x: c.x + 4, duration: 40, yoyo: true, repeat: 5 });
    this.time.delayedCall(1400, () => { if (c.active && draw) draw(C_BRASS); });
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
    const compileResult = this.compileCheckProgram(mission, items, assembled);
    if (!compileResult.ok) {
      if (isFirstRun) this._recordFirstRunMetrics(mission, false);
      this.showCompileErrorStamp();
      this._pulseOffendingBlock(compileResult.slotId);
      this.pulseCrest("idle");
      await this.delay(900);
      this._resolveRunOutcome(mission, "compile_fail", wrongBlocksUsed.length ? wrongBlocksUsed : [{ code: "", tag: compileResult.tag }], [], compileResult.tag);
      return;
    }

    let anyMismatch = false, anyCrash = false;
    const failedTests = [];
    for (let i = 0; i < mission.tests.length; i++) {
      if (!this._alive) return;
      const test = mission.tests[i];
      const outcome = await this.runTestCase(mission, test, i, items);
      if (!outcome.pass) { anyMismatch = true; failedTests.push(this._compactTestLabel(test)); }
      if (outcome.crashed) anyCrash = true;
    }

    if (isFirstRun) this._recordFirstRunMetrics(mission, !anyMismatch);
    const resultKind = anyMismatch ? (anyCrash ? "runtime_crash" : "logic_fail") : "pass";
    this._resolveRunOutcome(mission, resultKind, wrongBlocksUsed, failedTests, null);
  }

  async runTestCase(mission, test, index, items) {
    this.clearContainers();
    this.clearTracker();
    this.clearTicker();
    this.clearRail();
    this.mcResetCradles();
    this.mcResetNeedle();
    this.resetCascade();
    this.parkCameos();
    this.updateManifestStrip("");
    this.updateResultRow(null, null);

    if (mission.mission === 5) { this.activateCameo("tape"); this.loadMiniTape(test.input); }
    if (mission.mission === 6) { this.activateCameo("shelf"); this.populateMiniShelf(test.initialList); }

    this._printedLines = [];
    const execLines = items.map((it) => this._substituteTestLine(it.text, test));
    const runResult = await this.runProgram(execLines);
    if (!this._alive) return { pass: false, crashed: false };

    const output = this._printedLines.join("⏎");
    const pass = runResult.ok && output === test.expectedOutput;
    this.verdictLamp.setFillStyle(pass ? C_GREEN_BRIGHT : C_RED);
    this.updateReportRow(index, pass);
    await this.delay(200);
    return { pass, crashed: !runResult.ok };
  }

  _shouldShowPostMissionNote(mission) {
    if (!mission.noteIsScenicSpecific) return true;
    const scenicOnly = (mission.palette || []).filter((c) => c.alsoCorrect && !c.correct);
    if (scenicOnly.length === 0) return true;
    return scenicOnly.some((c) => Object.keys(this.slotDefs).some((id) => this._slotCode(id) === c.code));
  }

  _resolveRunOutcome(mission, result, wrongBlocksUsed, failedTests, compileTag) {
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

    let livesLostThisRun = false;
    const tagsThisRun = new Set(wrongBlocksUsed.map((b) => b.tag));
    tagsThisRun.forEach((tag) => {
      if (!tag) return;
      this.wrongBlockHistory[tag] = (this.wrongBlockHistory[tag] || 0) + 1;
      if (this.wrongBlockHistory[tag] >= 2) livesLostThisRun = true;
    });

    const feedbackTag = compileTag || (wrongBlocksUsed[0] && wrongBlocksUsed[0].tag);

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
    if (this.gameEnded) return;
    const flawless = this.missionRunsFailed === 0 && !this.missionHintUsed;
    if (flawless) this.flawlessCount++;
    this.updateScore(250 + (flawless ? 100 : 0));
    if (flawless) this.createFloatingText(OX + OW / 2, OY - 14, "FLAWLESS +100", HEX_GOLD, "bold 16px Arial");
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
    this.inkwellFlourish();
    const mission = MISSIONS[this.currentMission];
    if (this._shouldShowPostMissionNote(mission)) {
      await this.bitSay(mission.postMissionNote || "Clean certification — the rig confirms it.");
      await Promise.race([this.waitForClick(), this.delay(2400)]);
      this.hideBubble();
    }
    await this.delay(400);
  }

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
      this.resetCascade();
      this.clearRail();
      this.mcResetCradles();
      this.clearContainers();
      this.clearTracker();
      this.clearTicker();
      this.parkCameos();
      Object.values(this.silhouettes).forEach(({ g }) => this.tweens.add({ targets: g, alpha: 0.1, duration: 500 }));
      this._crest.c.setAlpha(0.1);
      this._chalkFormulae.forEach((t) => this.tweens.add({ targets: t, alpha: 0.05, duration: 500 }));
      const motes = this.ambient;
      this.ambient = null;
      (motes || []).forEach((m) => this.tweens.add({ targets: m, y: 632, alpha: 0, duration: 1500, ease: "Sine.easeIn" }));

      const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
      this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });
      const title = this.add.text(640, 240, "FORMULA INCOMPLETE", { font: "bold 32px Georgia", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
      this.tweens.add({ targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut", onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }) });
      this.add.text(640, 310, `Score: ${this.score}`, { font: "21px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
      this.add.text(640, 350, `Missions Published: ${this.currentMission} / 6`, { font: "18px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);
      this._makeButton(525, 420, "REOPEN THE WORKS", 200, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
      this._makeButton(755, 420, "RETURN TO MENU", 200, 50, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.start("MenuScene"));
    })();
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearMission();
    this.hideBubble();

    try { GameManager.completeLevel(62, Math.round((this.flawlessCount / MISSIONS.length) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("math_pow_mastery"); } catch (_) {}
    try { BadgeSystem.unlock("math_wing_seal"); } catch (_) {}
    try {
      localStorage.setItem("level63_results", JSON.stringify({
        level: 63, concept: "math_pow", phase: "restructuring",
        score: this.score, missionsCompleted: 6, flawlessMissions: this.flawlessCount,
        totalRuns: this.runCount, failedRuns: this.failedRunCount, hintsUsed: this.hintCount,
        selfCorrections: this.selfCorrectionCount,
        castChoiceProactivelyCorrect: this.castProactive,
        formulaShapeCorrectFirstRun: this.formulaShapeFirst,
        crossMethodCleanFirstRun: this.crossMethodCleanFirst,
        crossWingCleanFirstRun: this.crossWingCleanFirstRun,
        livesRemaining: this.lives, attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.triggerWingFinaleCeremony();
  }

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
  }

  async ceremonyPhase1_Fanfare() {
    await this.inkwellFlourish();
    this.brightenSilhouettes(1);
    this._chalkFormulae.forEach((t) => {
      this.tweens.add({ targets: t, alpha: 0.6, duration: 400, yoyo: true, hold: 300 });
    });
    const motes = this.ambient;
    (motes || []).forEach((m) => this.tweens.add({ targets: m, y: m.y - 80, duration: 900, ease: "Sine.easeOut" }));
    this._ceremonyCrest = this._crest.c;
    await new Promise((res) => {
      this.tweens.add({ targets: this._ceremonyCrest, x: 640, y: 300, scale: 2.2, duration: 800, ease: "Sine.easeInOut", onComplete: res });
    });
  }

  async ceremonyPhase2_InstrumentsAssemble() {
    const targets = {
      comparator: { x: 520, y: 340 },
      rail: { x: 640, y: 400 },
      cascade: { x: 760, y: 340 },
    };
    const moves = Object.entries(this.silhouettes).map(([key, s]) => {
      return new Promise((res) => {
        this.tweens.add({ targets: s.g, x: targets[key].x, y: targets[key].y, scale: 1.8, duration: 700, ease: "Sine.easeInOut", onComplete: res });
      });
    });
    await Promise.all(moves);
    await this.delay(400);
  }

  async ceremonyPhase3_CentralPanel() {
    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
    this.tweens.add({ targets: ov, fillAlpha: 0.85, duration: 500 });
    this._ceremonyElements = [ov];

    const panel = this.add.graphics().setDepth(90);
    panel.fillStyle(0x0a0d18, 1);
    panel.fillRoundedRect(320, 70, 640, 560, 16);
    panel.lineStyle(2, C_GOLD, 1);
    panel.strokeRoundedRect(320, 70, 640, 560, 16);
    this._ceremonyElements.push(panel);

    const title = this.add.text(640, 108, "MASTER FORMULIST", { font: "bold 34px Georgia", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(91).setScale(0);
    this.tweens.add({ targets: title, scale: 1, duration: 350, ease: "Back.easeOut" });
    this._ceremonyElements.push(title);

    const castPct = `${Object.values(this.castProactive).filter(Boolean).length}/2`;
    const shapePct = `${Object.values(this.formulaShapeFirst).filter(Boolean).length}/3`;
    const crossMethod = Object.values(this.crossMethodCleanFirst).some(Boolean) ? "✓" : "✗";
    const crossWingCount = `${Object.values(this.crossWingCleanFirstRun).filter(Boolean).length}/2`;
    const lines = [
      "MISSIONS: 6/6",
      `FLAWLESS: ${this.flawlessCount}`,
      `SELF-CORRECTIONS: ${this.selfCorrectionCount}`,
      `CAST-PROACTIVE: ${castPct}`,
      `FORMULA-SHAPE FIRST RUN: ${shapePct}`,
      `CROSS-METHOD CLEAN: ${crossMethod}`,
      `CROSS-WING CLEAN: ${crossWingCount}`,
      `HINTS: ${this.hintCount}`,
    ];
    lines.forEach((s, i) => {
      const t = this.add.text(380, 150 + i * 22, s, { font: "15px Arial", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 250, delay: 300 + i * 120 });
      this._ceremonyElements.push(t);
    });
    const totalText = this.add.text(380, 150 + 8 * 22, "TOTAL: 0", { font: "bold 21px Arial", color: HEX_GOLD }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: totalText, alpha: 1, duration: 250, delay: 1300 });
    const counter = { v: 0 };
    this.tweens.add({ targets: counter, v: this.score, duration: 1000, delay: 1300, onUpdate: () => totalText.setText(`TOTAL: ${Math.round(counter.v)}`) });
    this._ceremonyElements.push(totalText);

    const stars = this._starRating();
    for (let i = 0; i < 3; i++) {
      const earned = i < stars;
      const s = this.add.text(640 + (i - 1) * 60, 420, "★", { font: "40px Arial", color: earned ? HEX_GOLD : "#2a3040" }).setOrigin(0.5).setDepth(91).setScale(0);
      this.tweens.add({ targets: s, scale: 1, duration: 250, delay: 1900 + i * 200, ease: earned ? "Back.easeOut" : "Cubic.easeOut" });
      this._ceremonyElements.push(s);
    }

    const badge = this.add.container(640, 490).setDepth(91).setAlpha(0);
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillCircle(0, 0, 34);
    bg.lineStyle(3, C_GOLD, 1);
    bg.strokeCircle(0, 0, 34);
    const stages = this.add.text(-14, -6, "≡", { font: "bold 14px Arial", color: HEX_GOLD }).setOrigin(0.5);
    const weight = this.add.text(0, -6, "⚖", { font: "bold 14px Arial", color: HEX_CYAN }).setOrigin(0.5);
    const compass = this.add.text(14, -6, "◺", { font: "bold 14px Arial", color: HEX_BLUE_GRAY }).setOrigin(0.5);
    badge.add([bg, stages, weight, compass]);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 2500 });
    const badgeLbl = this.add.text(640, 532, "pow() MASTERY", { font: "bold 15px Georgia", color: HEX_GOLD }).setOrigin(0.5).setDepth(91).setAlpha(0);
    const badgeSub = this.add.text(640, 548, "Accretion ✓  Tuning ✓  Restructuring ✓", { font: "12px Arial", color: "#78909c" }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: [badgeLbl, badgeSub], alpha: 1, duration: 300, delay: 2650 });
    this._ceremonyElements.push(badge, badgeLbl, badgeSub);

    await this.delay(3200);
  }

  async ceremonyPhase4_WingSeal() {
    const banner = this.add.container(-260, 590).setDepth(92);
    const bg = this.add.graphics();
    bg.fillStyle(0x0a0d18, 1);
    bg.lineStyle(3, C_GOLD, 1);
    bg.fillRoundedRect(-240, -40, 480, 80, 6);
    bg.strokeRoundedRect(-240, -40, 480, 80, 6);
    [-220, 220].forEach((sx) => {
      const s = this.add.text(sx, 0, "★", { font: "16px Arial", color: HEX_GOLD }).setOrigin(0.5).setAlpha(0.7);
      banner.add(s);
    });
    const title = this.add.text(0, -18, "MATH WING — COMPLETE", { font: "bold 19px Georgia", color: HEX_GOLD }).setOrigin(0.5);
    const caption = this.add.text(0, 30, "9 levels · 3 methods · 3 instruments beneath one dome", { font: "italic 13px Georgia", color: HEX_BLUE_GRAY }).setOrigin(0.5).setAlpha(0.85);
    banner.add([bg, title, caption]);

    const cols = [
      { x: -140, label: "max()/min() ✓" },
      { x: 0, label: "abs() ✓" },
      { x: 140, label: "pow() ✓" },
    ];
    const colTexts = cols.map((c) => {
      const t = this.add.text(c.x, 4, c.label, { font: "bold 15px Georgia", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setAlpha(0);
      banner.add(t);
      return t;
    });

    await new Promise((res) => { this.tweens.add({ targets: banner, x: 640, duration: 500, ease: "Back.easeOut", onComplete: res }); });

    for (const t of colTexts) {
      this.tweens.add({ targets: t, alpha: 1, duration: 200 });
      const chime = this.add.circle(banner.x + t.x, banner.y, 3, C_GOLD, 0.6).setDepth(93);
      this.tweens.add({ targets: chime, scale: 4, alpha: 0, duration: 300, onComplete: () => chime.destroy() });
      await this.delay(400);
    }

    if (this._ceremonyCrest) {
      await new Promise((res) => {
        this.tweens.add({ targets: this._ceremonyCrest, x: banner.x, y: banner.y - 60, scale: 1, duration: 500, ease: "Cubic.easeIn", onComplete: res });
      });
      this.tweens.add({ targets: this._ceremonyCrest, scale: 1.3, duration: 90, yoyo: true });
      this.screenShake(0.006, 160);
      const shock = this.add.circle(banner.x, banner.y - 60, 6, C_GOLD, 0.6).setDepth(93);
      this.tweens.add({ targets: shock, scale: 10, alpha: 0, duration: 500, onComplete: () => shock.destroy() });
    }

    Object.values(this.silhouettes).forEach(({ g }) => this.tweens.add({ targets: g, angle: 6, duration: 200, yoyo: true }));
    this.createGoldCyanMidnightConfetti(640, 300, 50);

    const flash = this.add.rectangle(W / 2, H / 2, W, H, 0xffffff, 0).setDepth(94);
    this.tweens.add({ targets: flash, fillAlpha: 0.5, duration: 250, yoyo: true, onComplete: () => flash.destroy() });

    await this.delay(1000);
  }

  async ceremonyPhase5_BitClosingAddress() {
    await new Promise((res) => { this.tweens.add({ targets: this.bit, x: 640, y: 610, duration: 500, ease: "Sine.easeInOut", onComplete: res }); });
    await this.bitSay("Nine levels of the Math Wing — max and min CHOSE between values, abs MEASURED the distance from zero, pow MULTIPLIED through the cascade. Three static methods, no objects ever built, one class name on every call: Math. You can compare, measure, and amplify — and tonight you proved it in geometry, growth, distance, and deviation. The Comparator, the Rail, and the Cascade stand ready in every program you'll ever write. The dome is sealed, Formulist. The next wing waits beyond the observatory doors.");
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
