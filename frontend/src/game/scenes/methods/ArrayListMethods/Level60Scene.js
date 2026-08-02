/**
 * Level 60 — "The Standards Office" (Math Methods: Restructuring Phase
 * — abs() trilogy finale)
 * ===========================================================================
 * The learner CONSTRUCTS complete distance-measurement programs — no
 * multiple choice. Reuses the L27→L57 code-canvas/parts-bin/RUN
 * architecture. The rig hosts BOTH the L58 Measuring Rail (abs, with a
 * new tolerance-fence sub-instrument) and the L57 mini Comparator
 * (max/min), cross-wired so Math.abs(Math.min(...)) and
 * Math.min(Math.abs(...), ...) both resolve honestly inner-first,
 * whichever instrument fires first genuinely fires first.
 *
 * A genuine unified mini-interpreter executes the assembled program:
 * abs (int+double, difference-distance), max/min (with the L55 cradle
 * choreography), Scanner, ArrayList.get() + for-loop, if/else, println
 * with ternary/comparison. Wrong builds yield their REAL outcomes —
 * order_reversed genuinely publishes 73 instead of 50 because abs(min(x,50))
 * evaluates the cap before the measurement ever runs; the signed-deviation
 * build genuinely lets a 15-off reading PASS a ±10 gate.
 */

import Phaser from "phaser";
import { GameManager } from "../../../GameManager.js";
import { BadgeSystem } from "../../../BadgeSystem.js";

const W = 1280, H = 720;

const C_CYAN = 0x4fc3f7, C_GOLD = 0xffd740, C_ORANGE = 0xff9800, C_BLUE_GRAY = 0x8ea6c8;
const C_GREEN_BRIGHT = 0x00e676, C_RED = 0xf44336, C_GRAY = 0x78909c, C_BRASS = 0xc8a05a;
const HEX_CYAN = "#4fc3f7", HEX_GOLD = "#ffd740", HEX_ORANGE = "#ff9800", HEX_BLUE_GRAY = "#8ea6c8";
const HEX_GREEN_BRIGHT = "#00e676", HEX_RED = "#f44336", HEX_GRAY = "#78909c", HEX_BRASS = "#c8a05a";

const CX = 40, CY = 90, CW = 680, CH = 380;
const TAB_H = 34, GUTTER_W = 34, CODE_PAD = 10;
const CODE_X = CX + GUTTER_W + CODE_PAD;
const CODE_Y0 = CY + TAB_H + 14;
const LINE_H = 21;
const PX = 40, PY = 490, PW = 680, PH = 130;
const OX = 760, OY = 80, OW = 460, OH = 250;
const MANIFEST_Y = 316;
const RX = 760, RY = 345, RW = 460, RH = 125;
const BX = 760, BY = 490, BW = 460, BH = 130;
const TUTORIAL_KEY = "level60_tutorial_done";

// Rig internal layout — the rail (top) and comparator (below) share one window
const RAIL_X0 = OX + 30, RAIL_X1 = OX + 430, RAIL_Y = OY + 52;
const MC_BEAM_CX = OX + 230, MC_BEAM_Y = OY + 118;
const MC_CRADLE_A = { x: MC_BEAM_CX - 36, y: MC_BEAM_Y + 26 };
const MC_CRADLE_B = { x: MC_BEAM_CX + 36, y: MC_BEAM_Y + 26 };
const PLINTH_X = OX + 230, PLINTH_Y = OY + 96;
const TAPE_Y = OY + 25;
const CONT_X = OX + 10, CONT_Y0 = OY + 160;
const TRK_X = OX + 330, TRK_W = 120, TRK_Y0 = OY + 160;
const TICKER_Y = OY + 236;
const SHELF_Y = OY + 205;

// ══════════════════════════════════════════════════════════════
// MISSION CONFIGURATION
// ══════════════════════════════════════════════════════════════
const MISSIONS = [
  { mission: 1, title: "The Error Report",
    brief: "Publish the error — the distance between the predicted and actual magnitudes — always positive. For predicted=100, actual=93:\nError: 7",
    skeleton: [
      'int predicted = /* test value */;',
      'int actual = /* test value */;',
      '',
      'int error = <slot:measure>;',
      'System.out.println("Error: " + error);',
    ],
    slots: [{ id: "measure", hint: "the error measurement" }],
    palette: [
      { code: 'Math.abs(predicted - actual)', correct: true },
      { code: 'Math.abs(actual - predicted)', correct: true, alsoCorrect: true },
      { code: 'predicted - actual', tag: "abs_missing" },
      { code: 'Math.abs(predicted) - Math.abs(actual)', tag: "abs_distributes_belief" },
      { code: 'actual.abs(predicted)', tag: "instance_call_on_number_belief" },
    ],
    tests: [
      { substitutions: { predicted: "100", actual: "93" }, expectedOutput: "Error: 7" },
      { substitutions: { predicted: "85", actual: "92" }, expectedOutput: "Error: 7" },
      { substitutions: { predicted: "50", actual: "50" }, expectedOutput: "Error: 0" },
    ],
    postMissionNote: "Bit: 'Both orders, same distance — the beam between the markers doesn't care who stood first. And the abs-less build's negative seven is a measurement that LIES about its own size. The office refuses unsigned errors.'",
    concept: "error_measurement" },

  { mission: 2, title: "The Sign Sorter",
    brief: "Read a number and publish BOTH its sign-stripped magnitude AND its sign. For input -14:\nMagnitude: 14\nSign: negative",
    skeleton: [
      'int x = /* test value */;',
      '',
      'int mag = <slot:magnitude>;',
      'String sign = <slot:classify>;',
      'System.out.println("Magnitude: " + mag);',
      'System.out.println("Sign: " + sign);',
    ],
    slots: [{ id: "magnitude", hint: "the magnitude" }, { id: "classify", hint: "the classification" }],
    palette: [
      { code: "Math.abs(x)", correct: true, slotId: "magnitude" },
      { code: "x", tag: "abs_missing", slotId: "magnitude" },
      { code: "-x", tag: "manual_negate_belief", slotId: "magnitude" },
      { code: 'x < 0 ? "negative" : "non-negative"', correct: true, slotId: "classify" },
      { code: 'Math.abs(x) < 0 ? "negative" : "non-negative"', tag: "abs_for_sign_check", slotId: "classify" },
      { code: 'x < 0 ? "negative" : "positive"', tag: "zero_sign_label", slotId: "classify" },
    ],
    tests: [
      { substitutions: { x: "-14" }, expectedOutput: "Magnitude: 14⏎Sign: negative" },
      { substitutions: { x: "7" }, expectedOutput: "Magnitude: 7⏎Sign: non-negative" },
      { substitutions: { x: "0" }, expectedOutput: "Magnitude: 0⏎Sign: non-negative" },
    ],
    postMissionNote: "Bit: 'abs for SIZE, the original value for CLASSIFICATION — two questions about the same number, answered by different tools. And the manual negate passed one night, failed the other: a compass that only works in one hemisphere.'",
    concept: "magnitude_and_sign" },

  { mission: 3, title: "The Safe Reading",
    brief: "A sensor reports signed raw readings. The published reading must be the ABSOLUTE VALUE, clamped to [0, 50]. For raw=-73:\nPublished: 50\nFor raw=30:\nPublished: 30",
    skeleton: [
      'int raw = /* test value */;',
      '',
      'int safe = <slot:pipeline>;',
      'System.out.println("Published: " + safe);',
    ],
    slots: [{ id: "pipeline", hint: "absolute, then clamped" }],
    isPipeline: true,
    palette: [
      { code: "Math.min(Math.abs(raw), 50)", correct: true },
      { code: "Math.abs(Math.min(raw, 50))", tag: "order_reversed" },
      { code: "Math.abs(raw)", tag: "clamp_missing" },
      { code: "Math.min(raw, 50)", tag: "abs_missing" },
      { code: "Math.max(Math.abs(raw), 50)", tag: "max_min_direction_confusion" },
    ],
    tests: [
      { substitutions: { raw: "-73" }, expectedOutput: "Published: 50" },
      { substitutions: { raw: "30" }, expectedOutput: "Published: 30" },
      { substitutions: { raw: "-20" }, expectedOutput: "Published: 20" },
      { substitutions: { raw: "55" }, expectedOutput: "Published: 50" },
    ],
    postMissionNote: "Bit: 'abs FIRST, then the cap — the order matters because abs can produce values OVER the limit. Reverse the tools and the 73 escapes. Two Math instruments, one pipeline — the office demands the right sequence.'",
    concept: "abs_then_clamp" },

  { mission: 4, title: "The Tolerance Gate",
    brief: "A reading passes the gate if it's within 10 of the standard (80). Publish PASS or FAIL. For reading=87:\nDeviation: 7\nPASS\nFor reading=65:\nDeviation: 15\nFAIL",
    skeleton: [
      "int standard = 80;",
      "int reading = /* test value */;",
      "",
      "int dev = <slot:deviation>;",
      'System.out.println("Deviation: " + dev);',
      "if (<slot:gate>) {",
      '    System.out.println("PASS");',
      "} else {",
      '    System.out.println("FAIL");',
      "}",
    ],
    slots: [{ id: "deviation", hint: "the deviation" }, { id: "gate", hint: "the tolerance check" }],
    isTolerance: true, toleranceLimit: 10,
    palette: [
      { code: "Math.abs(reading - standard)", correct: true, slotId: "deviation" },
      { code: "reading - standard", tag: "signed_threshold_bug", slotId: "deviation" },
      { code: "Math.abs(reading) - Math.abs(standard)", tag: "abs_distributes_belief", slotId: "deviation" },
      { code: "dev <= 10", correct: true, slotId: "gate" },
      { code: "dev < 10", tag: "boundary_off_by_one", slotId: "gate" },
      { code: "dev >= 10", tag: "tolerance_reversed", slotId: "gate" },
    ],
    tests: [
      { substitutions: { reading: "87" }, expectedOutput: "Deviation: 7⏎PASS" },
      { substitutions: { reading: "65" }, expectedOutput: "Deviation: 15⏎FAIL" },
      { substitutions: { reading: "70" }, expectedOutput: "Deviation: 10⏎PASS" },
      { substitutions: { reading: "94" }, expectedOutput: "Deviation: 14⏎FAIL" },
    ],
    postMissionNote: "Bit (pressing the wax seal onto the certification): 'The tolerance gate — abs wraps the difference, the fence guards the standard, the else catches the outliers. The signed build passed the insiders and waved in the outsiders — a gate that opens both ways is no gate at all. Your gate holds.'",
    concept: "tolerance_flagship" },

  { mission: 5, title: "The Visitor's Calibration",
    brief: "A visitor reports their instrument's reading; the office computes the correction needed (how far from the standard of 100, always positive) and clamps it to a maximum correction of 20. For input 87:\nCorrection: 13\nFor input 130:\nCorrection: 20",
    skeleton: [
      "Scanner sc = new Scanner(System.in);",
      "int standard = 100;",
      "",
      "int visitor = <slot:read>;",
      "int raw_dev = <slot:deviation>;",
      "int correction = <slot:cap>;",
      'System.out.println("Correction: " + correction);',
    ],
    slots: [{ id: "read", hint: "read the visitor's value" }, { id: "deviation", hint: "the raw deviation" }, { id: "cap", hint: "cap the correction" }],
    crossWing: true,
    palette: [
      { code: "sc.nextInt()", correct: true, slotId: "read" },
      { code: "sc.nextLine()", tag: "wrong_scanner_method", slotId: "read" },
      { code: "Math.abs(visitor - standard)", correct: true, slotId: "deviation" },
      { code: "visitor - standard", tag: "signed_threshold_bug", slotId: "deviation" },
      { code: "Math.min(raw_dev, 20)", correct: true, slotId: "cap" },
      { code: "Math.max(raw_dev, 20)", tag: "max_min_direction_confusion", slotId: "cap" },
      { code: "raw_dev", tag: "clamp_missing", slotId: "cap" },
    ],
    tests: [
      { input: ["87"], expectedOutput: "Correction: 13" },
      { input: ["130"], expectedOutput: "Correction: 20" },
      { input: ["72"], expectedOutput: "Correction: 20" },
      { input: ["100"], expectedOutput: "Correction: 0" },
    ],
    postMissionNote: "Bit: 'Three instruments in one pipeline — Scanner reads it, abs measures it, min caps it. The visitor's reading, the office's judgment, and the report's guarantee: correction never negative, never above 20. Three wings in three lines.'",
    concept: "scanner_abs_clamp_pipeline" },

  { mission: 6, title: "The Deviation Survey",
    brief: "The standard reading is 50. Survey every entry in the dataset, computing each deviation, and publish the WORST (the largest). For [48, 62, 51, 43]:\nWorst deviation: 12",
    skeleton: [
      "ArrayList<Integer> data = /* populated by test */;",
      "int standard = 50;",
      "",
      "int worst = <slot:seed>;",
      "for (int i = 1; <slot:cond>; i++) {",
      "    int dev = Math.abs(data.get(i) - standard);",
      "    <slot:update>",
      "}",
      'System.out.println("Worst deviation: " + worst);',
    ],
    slots: [{ id: "seed", hint: "seed with the FIRST reading's deviation" }, { id: "cond", hint: "the bound" }, { id: "update", hint: "challenge the record" }],
    crossWing: true,
    palette: [
      { code: "Math.abs(data.get(0) - standard)", correct: true, slotId: "seed" },
      { code: "data.get(0)", tag: "seed_not_deviation", slotId: "seed" },
      { code: "Math.abs(data.get(0))", tag: "seed_abs_not_difference", slotId: "seed" },
      { code: "i < data.size()", correct: true, slotId: "cond" },
      { code: "i <= data.size()", tag: "loop_bound_inclusive_size", slotId: "cond" },
      { code: "worst = Math.max(worst, dev);", correct: true, slotId: "update" },
      { code: "worst = dev;", tag: "running_record_not_updated", slotId: "update" },
      { code: "worst = Math.min(worst, dev);", tag: "max_min_direction_confusion", slotId: "update" },
      { code: "Math.max(worst, dev);", tag: "bare_call_stores_result_belief", slotId: "update" },
    ],
    tests: [
      { initialList: [48, 62, 51, 43], expectedOutput: "Worst deviation: 12" },
      { initialList: [30, 70], expectedOutput: "Worst deviation: 20" },
      { initialList: [50], expectedOutput: "Worst deviation: 0" },
    ],
    postMissionNote: "Bit (quiet, pressing the seal onto the final certification): 'abs of the difference — each reading's deviation. max of the running record — the worst among them. Scanner's wing, ArrayList's wing, the Comparator's wing, the Measuring Rail's wing — all in one loop, Clerk. Two trilogies in this hall now carry your stamp. The third instrument waits above the dome.'",
    concept: "deviation_survey_capstone" },
];

const MISCONCEPTION_FEEDBACK = {
  abs_missing: "The report shows a negative error — a measurement that lies about its own size. abs wraps the difference: always positive, always honest.",
  abs_distributes_belief: "Two beams from zero, subtracted — that's a different question. The error lives BETWEEN the markers: Math.abs(a − b), one beam, marker to marker.",
  signed_threshold_bug: "The signed deviation ducked under the fence — the report shows PASS on a reading far from the standard. Negative distances slip under positive thresholds; abs first, then compare.",
  tolerance_reversed: "PASS and FAIL swapped — the readings inside the fence failed and the outliers passed. The gate checks dev <= limit, not dev >= limit.",
  boundary_off_by_one: "Exactly on the fence: the brief says 'within 10,' and 10 itself passes. <= holds the boundary; < surrenders it.",
  order_reversed: "abs(min(raw, 50)) = abs(-73) = 73 — the cap never bit! abs first, THEN the cap: min(abs(raw), 50). The order decides everything.",
  clamp_missing: "The value published uncapped — abs produced it, but nothing held it down. min against the limit caps the result.",
  abs_for_sign_check: "abs is NEVER negative — so `abs(x) < 0` is always false, and the ternary always picks 'non-negative.' Check the ORIGINAL value for the sign, not the measured one.",
  manual_negate_belief: "One green, one red — negate works for negatives but BREAKS for positives. abs handles both hemispheres; negate handles one.",
  zero_sign_label: "Zero is neither positive nor negative — 'non-negative' is the right label. The boundary matters in every classification.",
  seed_not_deviation: "The seed held the RAW reading, not its deviation from the standard. Seed with the FIRST deviation: Math.abs(data.get(0) − standard).",
  seed_abs_not_difference: "The seed held the reading's distance from ZERO, not from the standard. The deviation is the distance from the STANDARD: abs(reading − standard).",
  running_record_not_updated: "worst = dev REPLACES — the tracker shows the record bouncing to whatever came last. The record must be DEFENDED: worst = Math.max(worst, challenger).",
  bare_call_stores_result_belief: "The verdict faded on the plinth every lap — computed, never caught. Assign it back: worst = Math.max(worst, dev).",
  max_min_direction_confusion: "Check the needle — it picked the smaller / it tracked the minimum. Caps use min; records use max. The question picks the method.",
  loop_bound_inclusive_size: "The tracker's last row is red — i reached size and get(size) fell off the shelf.",
  instance_call_on_number_belief: "The oldest reflex in the wing — numbers carry no instruments. Math.abs(x).",
  wrong_scanner_method: "nextLine() hands back a String; the int container refused it. A number needs nextInt().",
  variable_as_literal_belief: "Quotes freeze a name into text. Drop them to use the live value.",
};

const HINTS = {
  1: "Math.abs(predicted - actual) — one beam, marker to marker, always positive.",
  2: "Math.abs(x) for the magnitude; x < 0 ? \"negative\" : \"non-negative\" for the classification — check the ORIGINAL value's sign.",
  3: "abs first: Math.min(Math.abs(raw), 50) — measure, then cap.",
  4: "Math.abs(reading - standard) for the deviation; dev <= 10 for the gate — <= holds the boundary.",
  5: "sc.nextInt() reads it, Math.abs(visitor - standard) measures it, Math.min(raw_dev, 20) caps it.",
  6: "Seed with Math.abs(data.get(0) - standard), loop while i < data.size(), and inside: worst = Math.max(worst, dev);",
};

export class Level60Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level60Scene" });
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
    this.toleranceProactive = {};
    this.absClampOrderFirst = {};
    this.crossWingCleanFirstRun = {};
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
    this._firstRunMetricsRecorded = {};
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
    this.createOfficeInterior();
    this.createOfficeFloor();
    this.createCertificationSeal();
    this.createAmbientParticles();
    this.createCodeCanvas();
    this.createBlockPalette();
    this.createRunButton();
    this.createRigWindow();
    this.createMiniRail();
    this.createMiniComparator();
    this.createMiniContainers();
    this.createMiniDeviationTracker();
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
    this.updateSealPulse(time);
    this.updateLampGlow(time);
    this.updateNeedleIdle(time);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // SETUP — OFFICE INTERIOR
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l60_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l60_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x060810).setDepth(0);
  }

  createOfficeInterior() {
    const g = this.add.graphics().setDepth(1);
    g.lineStyle(1, 0x141a2c, 0.4);
    for (let x = 0; x < W; x += 24) g.lineBetween(x, 108, x, 216);

    this._certDocs = [];
    const certXs = [200, 460, 720, 900];
    certXs.forEach((cx) => {
      const c = this.add.graphics().setDepth(2);
      c.fillStyle(0x0a0d18, 1);
      c.lineStyle(1, C_BRASS, 0.4);
      c.fillRect(cx, 50, 80, 60);
      c.strokeRect(cx, 50, 80, 60);
      c.lineStyle(1, C_BLUE_GRAY, 0.25);
      for (let i = 0; i < 4; i++) c.lineBetween(cx + 8, 60 + i * 10, cx + 72, 60 + i * 10);
      c.lineStyle(1, C_BRASS, 0.3);
      c.strokeCircle(cx + 40, 98, 8);
      const check = this.add.text(cx + 40, 98, "", { font: "bold 10px Arial", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(3);
      this._certDocs.push({ check });
    });

    const cabinet = this.add.graphics().setDepth(2);
    cabinet.fillStyle(0x241a10, 1);
    cabinet.lineStyle(1.5, 0x8a6435, 0.6);
    cabinet.fillRect(70, 380, 50, 200);
    cabinet.strokeRect(70, 380, 50, 200);
    for (let i = 0; i < 4; i++) {
      const dy = 384 + i * 48;
      cabinet.strokeRect(74, dy, 42, 44);
      cabinet.fillStyle(C_BRASS, 0.6);
      cabinet.fillCircle(95, dy + 22, 2);
      cabinet.fillStyle(0x241a10, 1);
    }
    this.add.text(95, 388, "PASS", { font: "bold 7px Georgia", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.4).setDepth(3);
    this.add.text(95, 436, "FAIL", { font: "bold 7px Georgia", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.4).setDepth(3);
    this._cabinetDrawer = this.add.graphics().setDepth(2);
    this._cabinetDrawerY = 384;

    const lampShade = this.add.graphics().setDepth(2);
    lampShade.fillStyle(0x2e7d32, 0.5);
    lampShade.lineStyle(1, C_BRASS, 0.6);
    lampShade.fillTriangle(90, 300, 110, 300, 100, 316);
    lampShade.strokeTriangle(90, 300, 110, 300, 100, 316);
    lampShade.lineStyle(2, C_BRASS, 0.6);
    lampShade.lineBetween(100, 316, 100, 330);
    lampShade.fillStyle(0x1a1408, 1);
    lampShade.fillRect(88, 328, 24, 6);
    this._lampPool = this.add.ellipse(100, 340, 60, 18, 0xffa726, 0.04).setDepth(2);

    const bg = this.add.graphics().setDepth(2);
    bg.fillStyle(0x060810, 1);
    bg.lineStyle(1, C_BRASS, 0.5);
    bg.fillRoundedRect(460, 12, 360, 26, 3);
    bg.strokeRoundedRect(460, 12, 360, 26, 3);
    this.add.text(640, 25, "T H E   S T A N D A R D S   O F F I C E", { font: "bold 12px Georgia", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.7).setDepth(3);
  }

  updateLampGlow(time) {
    if (!this._lampPool) return;
    this._lampPool.setAlpha(0.03 + Math.abs(Math.sin(time * 0.0008)) * 0.02);
  }

  createOfficeFloor() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x0a0d18, 1);
    g.fillRect(0, 635, W, 85);
    g.lineStyle(1, 0x2a3654, 1);
    g.lineBetween(0, 637, W, 637);
    g.lineStyle(1, 0x2a3654, 0.3);
    for (let x = 0; x < W; x += 100) g.lineBetween(x, 640, x, 720);
    g.lineStyle(1, C_BRASS, 0.06);
    for (let r = 8; r <= 32; r += 8) g.strokeRoundedRect(100 - r, 480 + 60 - r, r * 2, r * 2, 4);
  }

  createCertificationSeal() {
    const c = this.add.container(880, 56).setDepth(4);
    const g = this.add.graphics();
    g.fillStyle(0x060810, 1);
    g.lineStyle(2, C_BRASS, 1);
    g.fillCircle(0, 0, 18);
    g.strokeCircle(0, 0, 18);
    const star = this.add.text(0, 0, "★", { font: "10px Arial", color: HEX_BLUE_GRAY }).setOrigin(0.5).setAlpha(0.6);
    const t1 = this.add.text(0, -8, "STANDARDS", { font: "bold 6px Georgia", color: HEX_BLUE_GRAY }).setOrigin(0.5).setAlpha(0.5);
    const t2 = this.add.text(0, 8, "OFFICE", { font: "bold 6px Georgia", color: HEX_BLUE_GRAY }).setOrigin(0.5).setAlpha(0.5);
    c.add([g, star, t1, t2]);
    c.setAlpha(0.4);
    this._seal = { c, g, state: "idle" };
  }

  setSealState(state) {
    const s = this._seal;
    s.state = state;
    if (state === "idle") s.c.setAlpha(0.4);
    else if (state === "session") s.c.setAlpha(0.8);
    else if (state === "gold") {
      this.tweens.add({
        targets: s.c, scaleX: 0, duration: 150,
        onComplete: () => {
          s.g.lineStyle(2, C_GOLD, 1);
          s.g.strokeCircle(0, 0, 18);
          s.c.setAlpha(1);
          this.tweens.add({ targets: s.c, scaleX: 1, duration: 150 });
        },
      });
    }
  }

  updateSealPulse(time) {
    if (!this._seal || this._seal.state !== "session") return;
    this._seal.c.setAlpha(0.6 + Math.abs(Math.sin(time * 0.006)) * 0.4);
  }

  createAmbientParticles() {
    this.ambient = [];
    const colors = [0x8ea6c8, 0xc8a05a, 0xe8eaf6];
    for (let i = 0; i < 7; i++) {
      this.ambient.push(this.add.circle(Phaser.Math.Between(0, W), Phaser.Math.Between(230, 630), 1, Phaser.Utils.Array.GetRandom(colors), Phaser.Math.FloatBetween(0.03, 0.05)).setDepth(2));
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

  createFloatingText(x, y, text, colorHex, font = "bold 13px Arial", hold = 1200) {
    const t = this.add.text(x, y, text, { font, color: colorHex, wordWrap: { width: 300 }, align: "center" }).setOrigin(0.5).setDepth(75).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 160 });
    this.time.delayedCall(hold, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 220, onComplete: () => t.destroy() }); });
    return t;
  }

  createAnnotation(x, y, text, colorHex) {
    const t = this.add.text(x, y, text, { font: "italic 10px Arial", color: colorHex, wordWrap: { width: 260 }, align: "center" }).setOrigin(0.5).setDepth(70).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 200 });
    return t;
  }

  createConfetti(x, y, count = 30) {
    const p = this.add.particles(x, y, "l60_dot", {
      speed: { min: 80, max: 240 }, angle: { min: 0, max: 360 }, scale: { start: 0.9, end: 0 }, lifespan: 500,
      tint: [C_BRASS, C_GOLD, C_RED, C_CYAN, 0xffffff], emitting: false,
    }).setDepth(95);
    p.explode(count);
    this.time.delayedCall(900, () => p.destroy());
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
    this.tabFilename = this.add.text(CX + CW - 12, CY + TAB_H / 2, "Std1.java", { font: "11px Courier New", color: "#546e7a" }).setOrigin(1, 0.5).setDepth(11);

    this.lineHighlight = this.add.rectangle(CX + CW / 2, 0, CW - 4, LINE_H, 0xffab00, 0.06).setDepth(19).setVisible(false);
    this.codeContainer = this.add.container(0, 0).setDepth(20);
  }

  _syntaxTokens(line) {
    const tokens = [];
    const re = /("(?:[^"\\]|\\.)*")|(\/\*.*\*\/)|(\bimport\b|\bfor\b|\bif\b|\belse\b|\bint\b|\bdouble\b|\bString\b|\bnew\b|\bScanner\b|\bArrayList\b)|(<\w*>)|(\bMath\b)|(\.abs\b|\.max\b|\.min\b|\.get\b|\.size\b|\.nextInt\b|\.nextLine\b)|(\bSystem\.out\b|\bSystem\.in\b)|(-?\d+\.\d+|-?\d+)|(>=|<=|==|!=|\+\+|--|[+\-*/><?:])|([(){}\[\];.,=])/g;
    let last = 0, m;
    const plain = (t) => t && tokens.push({ t, c: "#e0e0e0" });
    while ((m = re.exec(line))) {
      if (m.index > last) plain(line.slice(last, m.index));
      if (m[1]) tokens.push({ t: m[1], c: "#4caf50" });
      else if (m[2]) tokens.push({ t: m[2], c: "#546e7a" });
      else if (m[3]) tokens.push({ t: m[3], c: "#1565c0" });
      else if (m[4]) tokens.push({ t: m[4], c: "#6a1b9a" });
      else if (m[5]) tokens.push({ t: m[5], c: HEX_GOLD });
      else if (m[6]) tokens.push({ t: m[6], c: HEX_CYAN });
      else if (m[7]) tokens.push({ t: m[7], c: "#78909c" });
      else if (m[8]) tokens.push({ t: m[8], c: HEX_ORANGE });
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
      || /^(int|double)\s+\w+\s*=\s*\/\*\s*test value\s*\*\/;$/.test(rawLine)
      || t === "}" || t === "} else {"
      || /^System\.out\.println\("(PASS|FAIL)"\);$/.test(t);
  }

  renderSkeleton(mission) {
    this.codeContainer.removeAll(true);
    this.slotDefs = {};
    mission.slots.forEach((s) => { this.slotDefs[s.id] = { ...s, capacity: 1, rect: null }; });

    mission.skeleton.forEach((rawLine, i) => {
      const y = CODE_Y0 + i * LINE_H;
      const numT = this.add.text(CX + 8, y, String(i + 1), { font: "11px Courier New", color: "#3d4450" });
      this.codeContainer.add(numT);

      if (!rawLine.trim()) return;

      if (this._isDimmedInfrastructure(rawLine)) {
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
          const w = 190;
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
  // BLOCK PALETTE + DRAG
  // ══════════════════════════════════════════════════════════════

  createBlockPalette() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0f0a06, 1);
    g.fillRoundedRect(PX, PY, PW, PH, 10);
    g.lineStyle(1, 0x3a2618, 1);
    g.strokeRoundedRect(PX, PY, PW, PH, 10);
    this.add.text(PX + 10, PY + 8, "CLERK'S INSTRUMENTS", { font: "bold 9px Arial", color: "#3d4450" }).setDepth(11);
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
  // RIG WINDOW
  // ══════════════════════════════════════════════════════════════

  createRigWindow() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x04060c, 1);
    g.fillRoundedRect(OX, OY, OW, OH, 12);
    g.lineStyle(3, C_BRASS, 1);
    g.strokeRoundedRect(OX, OY, OW, OH, 12);
    this.add.text(OX + 10, OY + 6, "STANDARDS RIG — LIVE", { font: "bold 9px Georgia", color: HEX_BRASS }).setAlpha(0.7).setDepth(11);

    const maskShape = this.make.graphics({ x: 0, y: 0, add: false });
    maskShape.fillRoundedRect(OX + 4, OY + 20, OW - 8, OH - 24, 10);
    this.windowMask = maskShape.createGeometryMask();
    this.rigLayer = this.add.container(0, 0).setDepth(15);
    this.rigLayer.setMask(this.windowMask);

    this.verdictLamp = this.add.circle(OX + OW - 18, OY + 14, 6, C_GRAY).setDepth(20);
  }

  // ══════════════════════════════════════════════════════════════
  // MINI MEASURING RAIL (60%-scale L58 rail + tolerance fence)
  // ══════════════════════════════════════════════════════════════

  createMiniRail() {
    this.railGfx = this.add.graphics();
    this.railTicksGfx = this.add.graphics();
    this.railLabels = this.add.container(0, 0);
    this.fenceGfx = this.add.graphics();
    this.rigLayer.add([this.railGfx, this.railTicksGfx, this.railLabels, this.fenceGfx]);
    this.railGfx.lineStyle(2, C_BRASS, 0.8);
    this.railGfx.lineBetween(RAIL_X0, RAIL_Y, RAIL_X1, RAIL_Y);

    this.absLabel = this.add.text(RAIL_X0 - 2, RAIL_Y - 24, "Math.abs", { font: "bold 9px Courier New", color: HEX_GOLD }).setAlpha(0.8);
    this.rigLayer.add(this.absLabel);

    this.obelisk = this.add.container((RAIL_X0 + RAIL_X1) / 2, RAIL_Y);
    const og = this.add.graphics();
    og.fillStyle(0x1a1408, 1);
    og.lineStyle(1.5, C_GOLD, 1);
    og.beginPath();
    og.moveTo(-5, 0); og.lineTo(5, 0); og.lineTo(3, -15); og.lineTo(0, -18); og.lineTo(-3, -15);
    og.closePath();
    og.fillPath(); og.strokePath();
    this.obeliskGlow = this.add.circle(0, 1, 7, C_GOLD, 0.25);
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
    const pow = Math.pow(10, Math.floor(Math.log10(Math.max(raw, 0.0001))));
    const n = raw / pow;
    const step = n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10;
    return step * pow;
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
    const tickStep = this._niceStep(span / 6);
    let n = 0;
    for (let v = Math.ceil(lo / tickStep) * tickStep; v <= hi; v += tickStep) {
      const x = toX(v);
      if (Math.abs(v) < 1e-9) { n++; continue; }
      this.railTicksGfx.lineStyle(1, C_BRASS, 0.4);
      this.railTicksGfx.lineBetween(x, RAIL_Y - 5, x, RAIL_Y + 5);
      if (n % 2 === 0) {
        const lbl = this.add.text(x, RAIL_Y + 14, this._fmtNum(v), { font: "bold 8px Courier New", color: HEX_BLUE_GRAY }).setOrigin(0.5).setAlpha(0.7);
        this.railLabels.add(lbl);
      }
      n++;
    }
    const zeroX = toX(0);
    this.tweens.add({ targets: this.obelisk, x: zeroX, duration: 260, ease: "Sine.easeInOut" });
    if (this._activeFenceLimit !== undefined && this._activeFenceLimit !== null) this.raiseToleranceFence(this._activeFenceLimit);
  }

  clearRail() {
    this.markerLayer.removeAll(true);
    this.beamLayer.removeAll(true);
    if (this._plinthChip) { this._plinthChip.destroy(); this._plinthChip = null; }
    this._varMarkers = {};
  }

  raiseToleranceFence(limit) {
    this._activeFenceLimit = limit;
    this.fenceGfx.clear();
    if (limit === null || limit === undefined) return;
    const zeroX = this._railToX(0);
    [limit, -limit].forEach((lim) => {
      const x = this._railToX(lim);
      this.fenceGfx.lineStyle(1.5, C_GOLD, 0.55);
      const dash = 4, gap = 3;
      for (let yy = RAIL_Y - 24; yy < RAIL_Y; yy += dash + gap) {
        this.fenceGfx.lineBetween(x, yy, x, Math.min(yy + dash, RAIL_Y));
      }
    });
  }

  clearFence() {
    this._activeFenceLimit = null;
    this.fenceGfx.clear();
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
    const display = type === "double" ? Number(value).toFixed(1) : String(value);
    const txt = this.add.text(0, -size / 2 - 10, display, { font: "bold 9px Courier New", color: type === "double" ? HEX_ORANGE : HEX_GOLD }).setOrigin(0.5);
    c.add([g, txt]);
    return { container: c, gfx: g, text: txt, value, type };
  }

  async dropMarker(value, type, opts = {}) {
    const x = this._railToX(Number(value));
    const marker = this._makeMarker(value, type, opts.size || 14, opts.dashed);
    marker.container.setPosition(x, RAIL_Y - 40);
    marker.container.setAlpha(0);
    this.markerLayer.add(marker.container);
    await new Promise((res) => { this.tweens.add({ targets: marker.container, y: RAIL_Y, alpha: opts.dashed ? 0.6 : 1, duration: 180, ease: "Bounce.easeOut", onComplete: res }); });
    return marker;
  }

  async ensureVarMarker(name, value, type) {
    if (this._varMarkers[name]) {
      this.tweens.add({ targets: this._varMarkers[name].container, scale: 1.3, duration: 100, yoyo: true });
      return this._varMarkers[name];
    }
    const m = await this.dropMarker(value, type);
    this._varMarkers[name] = m;
    return m;
  }

  async extendBeam(fromX, toX, color = C_CYAN) {
    const dir = toX >= fromX ? 1 : -1;
    const dist = Math.abs(toX - fromX);
    const beam = this.add.rectangle(fromX, RAIL_Y, 0, 3, color, 0.9);
    const glow = this.add.rectangle(fromX, RAIL_Y, 0, 7, color, 0.2);
    this.beamLayer.add([glow, beam]);
    const state = { w: 0 };
    await new Promise((res) => {
      this.tweens.add({
        targets: state, w: dist, duration: 220, ease: "Sine.easeOut",
        onUpdate: () => { beam.width = state.w; beam.x = fromX + (dir * state.w) / 2; glow.width = state.w + 5; glow.x = beam.x; },
        onComplete: res,
      });
    });
    return { beam, glow, fromX, toX };
  }

  showLengthChip(midX, length, type) {
    const display = type === "double" ? Number(length).toFixed(1) : String(length);
    const c = this.add.container(midX, RAIL_Y - 20).setDepth(9).setAlpha(0).setScale(0.5);
    const g = this.add.graphics();
    g.fillStyle(0x0a0d18, 1);
    g.lineStyle(1.5, C_CYAN, 1);
    g.fillRoundedRect(-18, -10, 36, 20, 5);
    g.strokeRoundedRect(-18, -10, 36, 20, 5);
    const t = this.add.text(0, 0, display, { font: "bold 11px Courier New", color: HEX_CYAN }).setOrigin(0.5);
    c.add([g, t]);
    this.tweens.add({ targets: c, alpha: 1, scale: 1, duration: 140, ease: "Back.easeOut" });
    return c;
  }

  async checkAgainstFence(chip, chipValue) {
    if (this._activeFenceLimit === null || this._activeFenceLimit === undefined) return;
    const pass = Math.abs(chipValue) <= this._activeFenceLimit;
    const mark = this.add.text(chip.x, chip.y - 16, pass ? "✓" : "✗", { font: "bold 12px Arial", color: pass ? HEX_GREEN_BRIGHT : HEX_RED }).setOrigin(0.5).setAlpha(0);
    this.rigLayer.add(mark);
    this.tweens.add({ targets: mark, alpha: 1, duration: 120 });
    await this.delay(300);
    this.tweens.add({ targets: mark, alpha: 0, duration: 200, onComplete: () => mark.destroy() });
  }

  async zeroPulse() {
    const ring = this.add.circle(this.obelisk.x, RAIL_Y, 6, C_GOLD, 0.4);
    this.rigLayer.add(ring);
    this.tweens.add({ targets: ring, scale: 3, alpha: 0, duration: 350, onComplete: () => ring.destroy() });
    await this.delay(250);
  }

  async detachAndDeliver(beamObj, chip) {
    await new Promise((res) => { this.tweens.add({ targets: [beamObj.beam, beamObj.glow, chip], y: "-=14", duration: 180, ease: "Sine.easeOut", onComplete: res }); });
    await new Promise((res) => { this.tweens.add({ targets: [beamObj.beam, beamObj.glow], scaleX: 0, alpha: 0, duration: 150, onComplete: () => { beamObj.beam.destroy(); beamObj.glow.destroy(); res(); } }); });
    await new Promise((res) => { this.tweens.add({ targets: chip, x: PLINTH_X, y: PLINTH_Y, duration: 200, ease: "Sine.easeIn", onComplete: res }); });
    this._plinthChip = chip;
  }

  async _deliverChipOnly(chip) {
    await new Promise((res) => { this.tweens.add({ targets: chip, y: "-=14", duration: 150, onComplete: res }); });
    await new Promise((res) => { this.tweens.add({ targets: chip, x: PLINTH_X, y: PLINTH_Y, duration: 200, ease: "Sine.easeIn", onComplete: res }); });
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

    if (Number(value) === 0) {
      await this.zeroPulse();
    } else {
      beamObj = await this.extendBeam(this.obelisk.x, targetX);
    }
    const chip = this.showLengthChip(Number(value) === 0 ? this.obelisk.x : midX, length, type);
    await this.checkAgainstFence(chip, length);
    await this.delay(280);
    if (!this._alive) return { value: length, type };
    if (beamObj) await this.detachAndDeliver(beamObj, chip);
    else await this._deliverChipOnly(chip);

    this.chalkEvaluationArrow(length, type);
    this.updateResultRow(length, type);
    return { value: length, type };
  }

  async runDifferenceMeasurement(aRes, bRes) {
    const av = Number(aRes.value), bv = Number(bRes.value);
    const diff = av - bv;
    const widened = aRes.type === "double" || bRes.type === "double";
    const diffType = widened ? "double" : "int";

    this.rescaleRail([av, bv, diff]);
    await this.delay(260);
    if (!this._alive) return { value: Math.abs(diff), type: diffType };

    await this.dropMarker(av, widened ? "double" : aRes.type, { size: 16 });
    await this.dropMarker(bv, widened ? "double" : bRes.type, { size: 16 });

    const annoText = `${this._fmtNum(av)} - ${this._fmtNum(bv)} = ${this._fmtNum(diff)}`;
    this.createFloatingText(OX + OW / 2, RAIL_Y - 60, annoText, HEX_BLUE_GRAY, "bold 11px Courier New", 800);
    await this.delay(380);
    if (!this._alive) return { value: Math.abs(diff), type: diffType };

    const diffMarker = await this.dropMarker(diff, diffType, { size: 13, dashed: true });

    const length = Math.abs(diff);
    const targetX = this._railToX(diff);
    const midX = (this.obelisk.x + targetX) / 2;
    let beamObj = null;
    if (diff === 0) await this.zeroPulse();
    else beamObj = await this.extendBeam(this.obelisk.x, targetX);
    const mainChip = this.showLengthChip(diff === 0 ? this.obelisk.x : midX, length, diffType);
    await this.checkAgainstFence(mainChip, diff);

    const ax = this._railToX(av), bx = this._railToX(bv);
    const betweenBeam = await this.extendBeam(ax, bx, C_GOLD);
    const betweenChip = this.showLengthChip((ax + bx) / 2, length, diffType);
    this.tweens.add({ targets: [mainChip, betweenChip], scale: 1.15, duration: 130, yoyo: true });
    await this.delay(650);
    if (!this._alive) return { value: length, type: diffType };

    await new Promise((res) => {
      this.tweens.add({ targets: [betweenBeam.beam, betweenBeam.glow, betweenChip], alpha: 0, duration: 200, onComplete: () => { betweenBeam.beam.destroy(); betweenBeam.glow.destroy(); betweenChip.destroy(); res(); } });
    });

    if (beamObj) await this.detachAndDeliver(beamObj, mainChip);
    else await this._deliverChipOnly(mainChip);

    this.chalkWriteLine(annoText, HEX_BLUE_GRAY);
    this.chalkEvaluationArrow(length, diffType);
    this.updateResultRow(length, diffType);

    this.tweens.add({ targets: diffMarker.container, alpha: 0, duration: 260, delay: 120, onComplete: () => diffMarker.container.destroy() });
    return { value: length, type: diffType };
  }

  async markerShudder(value, type, varName) {
    const marker = (varName && this._varMarkers[varName]) ? this._varMarkers[varName] : await this.dropMarker(value, type);
    await this.delay(90);
    this.tweens.add({ targets: marker.container, x: marker.container.x + 2, duration: 30, yoyo: true, repeat: 5 });
    const q = this.add.text(marker.container.x, marker.container.y - 24, "?", { font: "bold 16px Georgia", color: HEX_RED }).setOrigin(0.5);
    this.rigLayer.add(q);
    this.missionElements.push(q);
    this.tweens.add({ targets: q, alpha: 0.2, duration: 70, yoyo: true, repeat: 3 });
    await this.delay(350);
  }

  async nameplateDarkFlicker() {
    for (let i = 0; i < 3; i++) {
      this.absLabel.setAlpha(0.15);
      await this.delay(80);
      this.absLabel.setAlpha(0.8);
      await this.delay(80);
    }
  }

  showCompileErrorStamp() {
    const stamp = this.add.text(CX + CW / 2, CY + CH / 2, "COMPILE ERROR", { font: "bold 26px Arial", color: HEX_RED }).setOrigin(0.5).setDepth(80).setScale(1.7).setAngle(-8).setAlpha(0);
    this.missionElements.push(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 200, ease: "Cubic.easeOut" });
    this.screenShake(0.005, 170);
    this.time.delayedCall(1100, () => { if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 220, onComplete: () => stamp.destroy() }); });
  }

  // ══════════════════════════════════════════════════════════════
  // MINI COMPARATOR (40%-scale L55/L57 Great Comparator)
  // ══════════════════════════════════════════════════════════════

  createMiniComparator() {
    const g = this.add.graphics();
    g.fillStyle(0x1a1408, 1);
    g.lineStyle(1.2, C_BRASS, 1);
    g.fillRoundedRect(MC_BEAM_CX - 48, MC_BEAM_Y - 4, 96, 8, 3);
    g.strokeRoundedRect(MC_BEAM_CX - 48, MC_BEAM_Y - 4, 96, 8, 3);
    this.rigLayer.add(g);

    this.mcModeText = this.add.text(MC_BEAM_CX, MC_BEAM_Y - 14, "Math.max/min", { font: "bold 8px Courier New", color: HEX_CYAN }).setOrigin(0.5);
    this.rigLayer.add(this.mcModeText);

    [MC_CRADLE_A, MC_CRADLE_B].forEach((c) => {
      g.lineStyle(1, C_BRASS, 0.5);
      g.lineBetween(c.x, MC_BEAM_Y + 4, c.x, c.y - 8);
    });

    this.mcCradleGfx = { a: this.add.graphics(), b: this.add.graphics() };
    [["a", MC_CRADLE_A], ["b", MC_CRADLE_B]].forEach(([key, pos]) => {
      const cg = this.mcCradleGfx[key];
      cg.fillStyle(0x141a2c, 1);
      cg.lineStyle(1, C_BRASS, 1);
      cg.fillEllipse(pos.x, pos.y, 30, 12);
      cg.strokeEllipse(pos.x, pos.y, 30, 12);
      this.rigLayer.add(cg);
    });

    this.mcNeedle = this.add.container(MC_BEAM_CX, MC_BEAM_Y + 4);
    const ng = this.add.graphics();
    ng.fillStyle(0x1a1408, 1);
    ng.lineStyle(1, C_BRASS, 1);
    ng.fillTriangle(-1.5, 0, 1.5, 0, 0, 15);
    ng.fillStyle(C_BRASS, 1);
    ng.fillCircle(0, 0, 1.5);
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
      targets: this.mcModeText, scaleY: 0, duration: 60,
      onComplete: () => { this.mcModeText.setText(`Math.${method}`); this.tweens.add({ targets: this.mcModeText, scaleY: 1, duration: 60 }); },
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
    for (let i = 0; i < 8; i++) { const r = i % 2 === 0 ? 8 : 3.5; const a = (Math.PI / 4) * i - Math.PI / 2; pts.push(Math.cos(a) * r, Math.sin(a) * r); }
    g.fillPoints(pts, true);
    g.strokePoints(pts, true);
    const display = type === "double" ? Number(value).toFixed(1) : String(value);
    const txt = this.add.text(0, 0, display, { font: "bold 7px Courier New", color: "#060810" }).setOrigin(0.5);
    if (txt.width > 16) txt.setFontSize(5.5);
    c.add([g, txt]);
    return { container: c, gfx: g, text: txt, value, type };
  }

  async mcSpawnStar(value, type, cradleKey) {
    const pos = cradleKey === "a" ? MC_CRADLE_A : MC_CRADLE_B;
    const star = this._mcMakeStar(value, type, pos.x, pos.y);
    star.container.setAlpha(0).setScale(0);
    this.mcStarLayer.add(star.container);
    await new Promise((res) => { this.tweens.add({ targets: star.container, alpha: 1, scale: 1.1, duration: 90, ease: "Back.easeOut", onComplete: () => { this.tweens.add({ targets: star.container, scale: 1, duration: 60 }); res(); } }); });
    if (cradleKey === "a") this._mcStarsA = star; else this._mcStarsB = star;
    return star;
  }

  mcResetCradles() {
    if (this._mcStarsA) { this._mcStarsA.container.destroy(); this._mcStarsA = null; }
    if (this._mcStarsB) { this._mcStarsB.container.destroy(); this._mcStarsB = null; }
  }

  async mcCarryStar(starObj, cradleKey) {
    const pos = cradleKey === "a" ? MC_CRADLE_A : MC_CRADLE_B;
    await new Promise((res) => { this.tweens.add({ targets: starObj.container, x: pos.x, y: pos.y - 10, duration: 110, ease: "Sine.easeInOut", onComplete: res }); });
    await new Promise((res) => { this.tweens.add({ targets: starObj.container, y: pos.y, duration: 70, ease: "Sine.easeOut", onComplete: res }); });
    if (cradleKey === "a") this._mcStarsA = starObj; else this._mcStarsB = starObj;
  }

  _mcWarmStarToDouble(star) {
    star.type = "double";
    star.gfx.clear();
    star.gfx.fillStyle(C_ORANGE, 0.9);
    star.gfx.lineStyle(1, Phaser.Display.Color.IntegerToColor(C_ORANGE).darken(30).color, 1);
    const pts = [];
    for (let i = 0; i < 8; i++) { const r = i % 2 === 0 ? 8 : 3.5; const a = (Math.PI / 4) * i - Math.PI / 2; pts.push(Math.cos(a) * r, Math.sin(a) * r); }
    star.gfx.fillPoints(pts, true);
    star.gfx.strokePoints(pts, true);
    star.text.setText(Number(star.value).toFixed(1));
  }

  async mcNeedleOscillate() {
    const angles = [-20, 16, -12];
    for (const a of angles) {
      await new Promise((res) => { this.tweens.add({ targets: this.mcNeedle, angle: a, duration: 55, ease: "Sine.easeInOut", onComplete: res }); });
    }
  }

  async mcNeedleLock(side) {
    const angle = side === "a" ? -26 : 26;
    await new Promise((res) => { this.tweens.add({ targets: this.mcNeedle, angle, duration: 60, ease: "Back.easeOut", onComplete: res }); });
    const chime = this.add.circle(MC_BEAM_CX, MC_BEAM_Y + 4, 2.5, C_GOLD, 0.5);
    this.rigLayer.add(chime);
    this.tweens.add({ targets: chime, scale: 3, alpha: 0, duration: 180, onComplete: () => chime.destroy() });
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
    chip.setPosition(from.x, from.y - 6);
    await new Promise((res) => { this.tweens.add({ targets: chip, x: PLINTH_X, y: PLINTH_Y, duration: 180, ease: "Sine.easeIn", onComplete: res }); });
    this._plinthChip = chip;
  }

  async _placeIntoCradle(resolved, cradleKey) {
    if (resolved.kind === "nested") await this.mcCarryStar(resolved.starObj, cradleKey);
    else await this.mcSpawnStar(resolved.value, resolved.type, cradleKey);
  }

  async runComparison(aRes, bRes, method) {
    // reset BEFORE placing — never a fire-and-forget delayed reset, so a
    // later top-level call (e.g. the next loop iteration in M6) can never
    // race a still-pending cleanup and leak the previous cradle stars.
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
      await this.delay(70);
    }
    await this.delay(60);
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
    if (winStar) this.tweens.add({ targets: winStar.container, scale: 1.2, duration: 90, yoyo: true });
    if (loseStar) this.tweens.add({ targets: loseStar.container, alpha: 0.6, duration: 140 });

    this._mcNeedleBusy = false;
    await this.mcDescendReturnStar(winner, winnerType, winStar);
    this.chalkEvaluationArrow(winner, winnerType);
    this.updateResultRow(winner, winnerType);
    return { ok: true, value: winner, type: winnerType, winnerStarObj: winStar };
  }

  // ══════════════════════════════════════════════════════════════
  // MINI TYPED CONTAINERS
  // ══════════════════════════════════════════════════════════════

  createMiniContainers() {
    const hdr = this.add.text(CONT_X, CONT_Y0 - 12, "VARIABLES", { font: "bold 7px Georgia", color: HEX_BRASS }).setAlpha(0.7);
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
    const display = type === "double" ? Number(value).toFixed(1) : String(value);
    this.containerObjs[name].setText(`${name} = ${display}`);
    this.tweens.add({ targets: this.containerObjs[name], scale: 1.15, duration: 80, yoyo: true });
  }

  clearContainers() {
    this.containerLayer.removeAll(true);
    this.containerObjs = {};
    this._containerOrder = [];
  }

  // ══════════════════════════════════════════════════════════════
  // DEVIATION TRACKER (L57 Survey Tracker, re-labeled)
  // ══════════════════════════════════════════════════════════════

  createMiniDeviationTracker() {
    const hdr = this.add.text(TRK_X, TRK_Y0 - 12, "DEVIATION TRACKER", { font: "bold 7px Georgia", color: HEX_BRASS }).setAlpha(0.7);
    this.trackerContainer = this.add.container(0, 0);
    this.rigLayer.add([hdr, this.trackerContainer]);
    this._trackerRows = [];
    this._trackerDash = this.add.text(TRK_X + TRK_W / 2, TRK_Y0 + 50, "—", { font: "bold 10px Courier New", color: "#3a2618" }).setOrigin(0.5);
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
    if (!this._trackerDash) { this._trackerDash = this.add.text(TRK_X + TRK_W / 2, TRK_Y0 + 50, "—", { font: "bold 10px Courier New", color: "#3a2618" }).setOrigin(0.5); this.rigLayer.add(this._trackerDash); }
  }

  // ══════════════════════════════════════════════════════════════
  // OUTPUT TICKER
  // ══════════════════════════════════════════════════════════════

  createMiniOutputTicker() {
    const tg = this.add.graphics();
    tg.fillStyle(0x050914, 0.9);
    tg.fillRect(OX + 8, TICKER_Y - 8, OW - 16, 16);
    this.tickerText = this.add.text(OX + 14, TICKER_Y, "", { font: "bold 9px Courier New", color: HEX_GREEN_BRIGHT }).setOrigin(0, 0.5);
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
      await this.delay(6);
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
    const totalW = Math.min(this.tapeState.length * cellW, 150);
    const startX = x1 - totalW;
    const bg = this.add.graphics();
    bg.fillStyle(0xe8f0e8, 0.85);
    bg.fillRoundedRect(startX - 3, TAPE_Y - 6, totalW + 6, 12, 3);
    this.tapeContainer.add(bg);
    this.tapeState.slice(-Math.floor(totalW / cellW)).forEach((cell, i) => {
      const x = startX + i * cellW + cellW / 2;
      const disp = cell.kind === "space" ? "␣" : cell.kind === "newline" ? "⏎" : cell.ch;
      const color = cell.kind === "space" ? "#c2185b" : cell.kind === "newline" ? "#7b1fa2" : "#2e7d32";
      const t = this.add.text(x, TAPE_Y, disp, { font: "bold 6px Courier New", color }).setOrigin(0.5);
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
    await this.delay(50);
  }

  populateMiniShelf(initialList) {
    this.shelfContainer.removeAll(true);
    this.shelfBookSprites = [];
    this.currentList = initialList.map((v) => ({ value: v, type: "int" }));
    const hdr = this.add.text(CONT_X, SHELF_Y - 12, "data", { font: "bold 7px Georgia", color: HEX_BRASS }).setAlpha(0.7);
    this.shelfContainer.add(hdr);
    this.currentList.forEach((entry, i) => {
      const x = CONT_X + 8 + i * 24;
      const c = this.add.container(x, SHELF_Y);
      const g = this.add.graphics();
      g.fillStyle(C_GOLD, 0.85);
      g.lineStyle(1, 0xb8860b, 1);
      g.fillRoundedRect(-10, -7, 20, 14, 2);
      g.strokeRoundedRect(-10, -7, 20, 14, 2);
      const t = this.add.text(0, -1, String(entry.value), { font: "bold 6px Courier New", color: "#0a0704" }).setOrigin(0.5);
      if (t.width > 17) t.setFontSize(5);
      const lbl = this.add.text(0, 10, `[${i}]`, { font: "bold 5.5px Courier New", color: HEX_GRAY }).setOrigin(0.5);
      c.add([g, t, lbl]);
      this.shelfContainer.add(c);
      this.shelfBookSprites.push({ container: c, entry });
    });
  }

  async retrieveGhost(index) {
    const entry = this.currentList[index];
    if (!entry) return null;
    const book = this.shelfBookSprites[index];
    if (book) this.tweens.add({ targets: book.container, scale: 1.25, duration: 80, yoyo: true });
    const ghostX = book ? book.container.x : CONT_X + 8;
    const ghost = this.add.container(ghostX, SHELF_Y).setAlpha(0);
    const g = this.add.graphics();
    g.fillStyle(C_GOLD, 0.5);
    g.fillRoundedRect(-9, -6, 18, 12, 2);
    const t = this.add.text(0, 0, String(entry.value), { font: "bold 6px Courier New", color: "#0a0704" }).setOrigin(0.5);
    ghost.add([g, t]);
    this.shelfContainer.add(ghost);
    await new Promise((res) => { this.tweens.add({ targets: ghost, alpha: 0.8, y: SHELF_Y - 8, duration: 90, onComplete: res }); });
    await new Promise((res) => { this.tweens.add({ targets: ghost, x: MC_CRADLE_B.x, y: MC_CRADLE_B.y - 16, alpha: 0, duration: 140, ease: "Sine.easeIn", onComplete: () => { ghost.destroy(); res(); } }); });
    return entry;
  }

  // ══════════════════════════════════════════════════════════════
  // MANIFEST STRIP / TEST REPORT / MISSION BRIEF
  // ══════════════════════════════════════════════════════════════

  createManifestStrip() {
    const g = this.add.graphics().setDepth(16);
    g.fillStyle(0x0f0a06, 0.92);
    g.fillRect(OX, MANIFEST_Y - 2, OW, 20);
    this.manifestStripText = this.add.text(OX + 8, MANIFEST_Y + 8, "", { font: "10px Arial", color: HEX_BRASS }).setOrigin(0, 0.5).setDepth(17);
    this.resultText = this.add.text(OX + OW - 8, MANIFEST_Y + 8, "—", { font: "bold 11px Courier New", color: HEX_GRAY }).setOrigin(1, 0.5).setDepth(17);
  }
  updateManifestStrip(text) { this.manifestStripText.setText(text); }

  /** No dedicated slate panel in this level's layout (unlike L58) — the
   * per-instrument reveals (rail chip, comparator star) already narrate
   * each measurement visually, so this is a silent, safe no-op rather
   * than a fabricated text surface. */
  chalkWriteLine(text, color) {}

  chalkEvaluationArrow(value, type) { this.updateResultRow(value, type); }

  updateResultRow(value, type) {
    if (!this.resultText) return;
    if (value === null) { this.resultText.setText("—").setColor(HEX_GRAY); return; }
    if (type === "crash") { this.resultText.setText("✗ ERROR").setColor(HEX_RED); return; }
    const display = type === "double" ? Number(value).toFixed(1) : String(value);
    this.resultText.setText(`→ ${display}`).setColor(type === "double" ? HEX_ORANGE : HEX_GOLD);
  }

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
      const inputT = this.add.text(0, 0, this._compactTestLabel(test), { font: "9px Courier New", color: "#b0bec5" }).setOrigin(0, 0.5);
      const expT = this.add.text(190, 0, test.expectedOutput.slice(0, 22), { font: "9px Courier New", color: "#78909c" }).setOrigin(0, 0.5);
      const statusT = this.add.text(RW - 24, 0, "…", { font: "13px Arial", color: "#78909c" }).setOrigin(0.5);
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
    const badgeNum = this.add.text(BX + 24, BY + 24, String(mission.mission), { font: "bold 13px Arial", color: "#0a0e14" }).setOrigin(0.5);
    const title = this.add.text(BX + 46, BY + 16, mission.title, { font: "bold 14px Arial", color: "#e8dfc8" }).setOrigin(0, 0.5);
    const brief = this.add.text(BX + 14, BY + 42, mission.brief, { font: "11px Arial", color: "#90a4ae", wordWrap: { width: BW - 28 } }).setOrigin(0, 0);
    const hint = this.add.text(BX + BW - 12, BY + BH - 12, "HINT", { font: "bold 11px Arial", color: "#546e7a" }).setOrigin(1, 1).setInteractive({ useHandCursor: true });
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

    this.add.text(20, 14, "THE STANDARDS OFFICE", { font: "bold 13px Georgia", color: "#b0bec5" }).setDepth(51);
    this.add.text(20, 32, "Restructuring Phase — Math Methods: abs()", { font: "10px Arial", color: "#546e7a" }).setDepth(51);

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
  // BIT — Standards Clerk variant (monocle, wax-seal stamp)
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
    const monocle = this.add.graphics();
    monocle.lineStyle(1.5, C_BRASS, 0.8);
    monocle.strokeCircle(7, 2, 6);
    monocle.lineStyle(1, C_BRASS, 0.6);
    monocle.lineBetween(12, 6, 18, 16);
    const glint = this.add.circle(9, 0, 1.5, 0xffffff, 0.9);
    const gloveL = this.add.circle(-16, 10, 4, 0xe0d6b8, 0.85);
    const seal = this.add.graphics();
    seal.fillStyle(0x241a10, 1);
    seal.fillRect(15, 6, 5, 10);
    seal.fillStyle(0xc62828, 0.7);
    seal.fillCircle(17, 3, 4);
    c.add([g, cloak, eye, pupil, monocle, glint, gloveL, seal, tip]);
    this.tweens.add({ targets: tip, alpha: 0.3, duration: 900, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: glint, alpha: 0.2, duration: 5000, yoyo: true, repeat: -1 });
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
    await this.bitSay("The Standards Office, Clerk — where no reading publishes without certification. You've measured distances, drilled the pattern, spotted the bugs. Tonight you BUILD the standards themselves: error computations, tolerance gates, deviation surveys. Every beam your code fires must hold up to the fence.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(5500)]); if (!A()) return;
    this.hideBubble();

    const a1 = this.floatingAnnotation(CX + CW / 2, CY - 16, "the standard", HEX_CYAN);
    await this.delay(400); if (!A()) return;
    const a2 = this.floatingAnnotation(PX + PW / 2, PY - 12, "blocks — one omits the beam, one distributes it", HEX_GRAY);
    await this.delay(400); if (!A()) return;
    const a3 = this.floatingAnnotation(OX + OW / 2, OY - 12, "beam, fence, tracker — LIVE", HEX_GREEN_BRIGHT);
    await this.delay(400); if (!A()) return;
    const a4 = this.floatingAnnotation(880, 36, "stamps when we certify", HEX_GOLD);
    await this.delay(400); if (!A()) return;
    const a5 = this.floatingAnnotation(RX + RW / 2, RY - 12, "every reading must verify", HEX_BLUE_GRAY);
    await this.delay(400); if (!A()) return;

    await this.bitSay("The office's two laws: distances can't be negative — if you see one, abs is missing; and abs wraps the DIFFERENCE, never the parts — distribute it and you measure the wrong thing. Certify, Clerk. The observatory depends on this bureau.");
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
    this.clearMission();

    this.tabFilename.setText(`Std${mission.mission}.java`);
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
    this.clearFence();
    this.mcResetCradles();
    this.mcResetNeedle();
    this.parkCameos();
    this.updateManifestStrip("");
    this.setSealState("idle");
    if (mission.isTolerance) this.raiseToleranceFence(mission.toleranceLimit);

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

  _substituteTestLine(line, test) {
    const m = line.match(/^(int|double)\s+(\w+)\s*=\s*\/\*\s*test value\s*\*\/;$/);
    if (m && test.substitutions && test.substitutions[m[2]] !== undefined) {
      return `${m[1]} ${m[2]} = ${test.substitutions[m[2]]};`;
    }
    return line;
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

    const instanceMatch = fullText.match(/(\w+)\.(abs|max|min)\(/);
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

    if (mission.isTolerance) {
      const block = this.slotContents.deviation && this.slotContents.deviation[0];
      const tag = block ? block.container.getData("tag") : null;
      this.toleranceProactive[key] = !tag;
    }
    if (mission.isPipeline) {
      const block = this.slotContents.pipeline && this.slotContents.pipeline[0];
      const code = block ? block.container.getData("code") : "";
      this.absClampOrderFirst[key] = code === "Math.min(Math.abs(raw), 50)";
    }
    if (mission.crossWing) {
      this.crossWingCleanFirstRun[key] = passed;
    }
  }

  // ══════════════════════════════════════════════════════════════
  // UNIFIED INTERPRETER — Math.abs (int+double, difference-distance)
  // cross-nested with Math.max/min, Scanner, ArrayList.get() + loop,
  // if/else, ternary, println. Never scripted; genuine outcomes only.
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

  _splitTopPM(expr) {
    const parts = [];
    let cur = "", depth = 0, opForNext = "+";
    for (let i = 0; i < expr.length; i++) {
      const ch = expr[i];
      if (ch === "(") depth++;
      if (ch === ")") depth--;
      if (depth === 0 && (ch === "+" || ch === "-")) {
        if (cur.trim().length > 0) {
          parts.push({ op: opForNext, term: cur.trim() });
          opForNext = ch;
          cur = "";
          continue;
        }
      }
      cur += ch;
    }
    if (cur.trim()) parts.push({ op: opForNext, term: cur.trim() });
    return parts;
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
    const stamp = this.add.text(OX + OW / 2, OY + 130, "IndexOutOfBoundsException", { font: "bold 8px Courier New", color: HEX_RED }).setOrigin(0.5).setAngle(-6).setAlpha(0);
    this.rigLayer.add(stamp);
    this.missionElements.push(stamp);
    this.tweens.add({ targets: stamp, alpha: 1, duration: 100 });
    this.screenShake(0.005, 140);
    await this.delay(450);
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
    return this._evalSimpleValue(t, vars);
  }

  /** A single top-level term: Math.abs(...), Math.max/min(...), get(),
   * or a plain value. The term is guaranteed paren-balanced because it
   * came from _splitTopPM's depth-aware split. */
  async _resolveSingleTerm(t, vars) {
    const absMatch = t.match(/^Math\.abs\((.*)\)$/);
    if (absMatch) return await this.evalAbsCall(absMatch[1], vars);
    const mmMatch = t.match(/^Math\.(max|min)\((.*)\)$/);
    if (mmMatch) return await this.evalMaxMinCall(mmMatch[1], mmMatch[2], vars);
    return await this._resolveValueOnly(t, vars);
  }

  /** Top-level value resolution for declaration/reassignment RHS,
   * println parts, and condition operands. Always splits on +/- FIRST
   * (paren-aware) so "Math.abs(a) - Math.abs(b)" is never mistaken for
   * a single Math.abs(...) call — that distinction is the whole point
   * of the abs_distributes_belief misconception. */
  async resolveTopLevelValue(expr, vars) {
    const t = expr.trim();
    const shape = this._matchTernaryShape(t);
    if (shape) return await this.evalTernaryGeneral(shape, vars);

    const parts = this._splitTopPM(t);
    if (parts.length === 0) return { ok: false, crash: "eval" };
    if (parts.length === 1) return await this._resolveSingleTerm(parts[0].term, vars);

    let total = 0, sawDouble = false;
    for (const p of parts) {
      const r = await this._resolveSingleTerm(p.term, vars);
      if (!r.ok) return r;
      if (this._plinthChip) {
        const c = this._plinthChip;
        this._plinthChip = null;
        this.tweens.add({ targets: c, alpha: 0, duration: 180, onComplete: () => c.destroy() });
      }
      if (r.type === "double") sawDouble = true;
      total += p.op === "-" ? -r.value : r.value;
    }
    const finalType = sawDouble ? "double" : "int";
    const finalValue = sawDouble ? total : Math.round(total);
    const chip = this.showLengthChip(PLINTH_X, finalValue, finalType);
    chip.setPosition(PLINTH_X, PLINTH_Y);
    this._plinthChip = chip;
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

  // ── ternary + boolean conditions ──

  _matchTernaryShape(t) {
    const m = t.match(/^(.+?)\?\s*"([^"]*)"\s*:\s*"([^"]*)"$/);
    if (!m) return null;
    return { condExpr: m[1].trim(), a: m[2], b: m[3] };
  }

  async evalTernaryGeneral(shape, vars) {
    const condResult = await this.evalBooleanCondition(shape.condExpr, vars);
    if (!condResult.ok) return condResult;
    return { ok: true, value: condResult.value ? shape.a : shape.b, type: "string" };
  }

  async evalBooleanCondition(condExpr, vars) {
    const m = condExpr.trim().match(/^(.+?)\s*(<=|>=|<|>|==|!=)\s*(-?\d+(?:\.\d+)?)$/);
    if (!m) return { ok: false, crash: "eval" };
    const lhsRes = await this.resolveTopLevelValue(m[1].trim(), vars);
    if (!lhsRes.ok) return lhsRes;
    const lhs = Number(lhsRes.value);
    const rhs = parseFloat(m[3]);
    let result;
    switch (m[2]) {
      case "<=": result = lhs <= rhs; break;
      case ">=": result = lhs >= rhs; break;
      case "<": result = lhs < rhs; break;
      case ">": result = lhs > rhs; break;
      case "==": result = lhs === rhs; break;
      case "!=": result = lhs !== rhs; break;
    }
    return { ok: true, value: result };
  }

  // ── statements ──

  async execStatement(line, vars) {
    const instanceMatch = line.match(/(\w+)\.(abs|max|min)\(/);
    if (instanceMatch && instanceMatch[1] !== "Math") {
      const recv = vars[instanceMatch[1]];
      await this.markerShudder(recv ? recv.value : 0, recv ? recv.type : "int", instanceMatch[1]);
      return { ok: false, crash: "compile" };
    }

    const declVar = line.match(/^(int|double|String)\s+(\w+)\s*=\s*(.*);$/);
    if (declVar) {
      const varType = declVar[1], name = declVar[2], rhs = declVar[3].trim();
      if (varType === "String") {
        const r = await this.resolveTopLevelValue(rhs, vars);
        if (!r.ok) return r;
        vars[name] = { value: r.value, type: "string" };
        this.miniDispenseTo(name, r.value, "string");
        return { ok: true };
      }
      if (rhs === "sc.nextInt()") {
        this.updateManifestStrip(`int ${name} = sc.nextInt()`);
        const read = this.evaluateNextToken(this.tapeState);
        await this.tapeConsumeVisual(read.consumedCount);
        const value = parseInt(read.rawValue, 10) || 0;
        vars[name] = { value, type: "int" };
        this.miniDispenseTo(name, value, "int");
        await this.delay(70);
        return { ok: true };
      }
      if (rhs === "sc.nextLine()") return { ok: false, crash: "compile" };

      const isMeasureExpr = /Math\.(abs|max|min)\(/.test(rhs);
      const r = await this.resolveTopLevelValue(rhs, vars);
      if (!r.ok) return r;
      vars[name] = { value: r.value, type: varType === "double" ? "double" : r.type };
      if (isMeasureExpr) { if (this._plinthChip) await this.deliverToVariable(name, vars[name].value, vars[name].type); }
      else { await this.ensureVarMarker(name, vars[name].value, vars[name].type); }
      return { ok: true };
    }

    const reassign = line.match(/^(\w+)\s*=\s*(.*);$/);
    if (reassign) {
      const name = reassign[1], rhs = reassign[2].trim();
      const isMeasureExpr = /Math\.(abs|max|min)\(/.test(rhs);
      const r = await this.resolveTopLevelValue(rhs, vars);
      if (!r.ok) return r;
      vars[name] = { value: r.value, type: vars[name] ? vars[name].type : r.type };
      if (isMeasureExpr) { if (this._plinthChip) await this.deliverToVariable(name, vars[name].value, vars[name].type); }
      else { await this.ensureVarMarker(name, vars[name].value, vars[name].type); }
      return { ok: true };
    }

    const bareMath = line.match(/^(Math\.(abs|max|min)\(.*\));$/);
    if (bareMath) {
      const r = await this.resolveTopLevelValue(bareMath[1], vars);
      if (!r.ok) return r;
      await this.discardFade();
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
        out += r.type === "double" ? Number(r.value).toFixed(1) : String(r.value);
      }
      if (!this._printedLines) this._printedLines = [];
      this._printedLines.push(out);
      await this.chalkWriteLine(`▸ ${out}`, HEX_CYAN);
      return { ok: true };
    }

    return { ok: true };
  }

  async discardFade() {
    if (!this._plinthChip) return;
    const chip = this._plinthChip;
    this._plinthChip = null;
    await this.delay(400);
    await new Promise((res) => { this.tweens.add({ targets: chip, alpha: 0, scale: 0.6, duration: 300, onComplete: () => { chip.destroy(); res(); } }); });
  }

  async deliverToVariable(name, value, type) {
    const chip = this._plinthChip;
    this._plinthChip = null;
    this.miniDispenseTo(name, value, type);
    if (chip) {
      const destY = this.containerObjs[name].y;
      await new Promise((res) => { this.tweens.add({ targets: chip, x: CONT_X + 55, y: destY, alpha: 0.2, duration: 220, ease: "Sine.easeIn", onComplete: () => { chip.destroy(); res(); } }); });
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

  async execForLoop(condExpr, bodyLines, vars) {
    let iv = 1, iterations = 0;
    while (iterations < 200) {
      if (!this._alive) return { ok: true };
      vars.i = { value: iv, type: "int" };
      if (!this.evalLoopCond(condExpr, vars)) {
        if (iterations === 0) { this.appendTrackerRow(`i=${iv} | size=${this.currentList.length} → skipped`); await this.delay(260); }
        break;
      }
      const worstBefore = vars.worst ? vars.worst.value : undefined;
      let crashed = null;
      for (const l of bodyLines) {
        const r = await this.execStatement(l.trim(), vars);
        if (!r.ok) { crashed = r; break; }
      }
      if (crashed) { this.appendTrackerRow(`i=${iv} → ✗ crash`, true); return crashed; }
      const devValue = vars.dev ? vars.dev.value : "?";
      const worstAfter = vars.worst ? vars.worst.value : undefined;
      this.appendTrackerRow(`i=${iv} | dev=${devValue} | worst: ${worstAfter}`, false, worstAfter !== worstBefore);
      iv++; iterations++;
      await this.delay(200);
    }
    return { ok: true };
  }

  _findBlockEnd(lines, openIdx) {
    let depth = 1;
    for (let j = openIdx + 1; j < lines.length; j++) {
      const t = lines[j].trim();
      if (t.endsWith("{") && t !== "} else {") depth++;
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
        const r = await this.execForLoop(forMatch[3], bodyLines, vars);
        if (!r.ok) { this.highlightCodeLine(null); return r; }
        i = end + 1;
        if (i < lines.length) this.highlightCodeLine(i);
        continue;
      }

      const ifMatch = t.match(/^if \((.*)\) \{$/);
      if (ifMatch) {
        let elseIdx = -1, endIdx = -1, depth = 1;
        for (let j = i + 1; j < lines.length; j++) {
          const t2 = lines[j].trim();
          if (t2 === "} else {") { if (depth === 1) elseIdx = j; continue; }
          if (t2.endsWith("{")) { depth++; continue; }
          if (t2 === "}") { depth--; if (depth === 0) { endIdx = j; break; } }
        }
        this.highlightCodeLine(i);
        const condRes = await this.evalBooleanCondition(ifMatch[1], vars);
        if (!condRes.ok) { this.highlightCodeLine(null); return condRes; }
        const bodyLines = condRes.value ? lines.slice(i + 1, elseIdx) : lines.slice(elseIdx + 1, endIdx);
        for (const l of bodyLines) {
          const r = await this.execStatement(l.trim(), vars);
          if (!r.ok) { this.highlightCodeLine(null); return r; }
        }
        i = endIdx + 1;
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
    this.setSealState("session");
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
      this.setSealState("idle");
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
    this.parkCameos();
    this.updateManifestStrip("");
    if (mission.isTolerance) this.raiseToleranceFence(mission.toleranceLimit);
    else this.clearFence();

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
    await this.delay(220);
    return { pass, crashed: !runResult.ok };
  }

  _resolveRunOutcome(mission, result, wrongBlocksUsed, failedTests, compileTag) {
    const timeMs = Math.round(this.time.now - this.missionStartTime);
    this.attemptLog.push({
      mission: mission.mission, runNumber: this.runCount, result,
      blocksUsed: Object.values(this.getAssembledCode()).flat().map((b) => b.code),
      wrongBlocks: wrongBlocksUsed, failedTests, timeMs, hintUsedBefore: this.missionHintUsed,
    });

    if (result === "pass") { this.onMissionComplete(); return; }

    this.setSealState("idle");
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
    if (flawless) this.createFloatingText(OX + OW / 2, OY - 14, "FLAWLESS +100", HEX_GOLD, "bold 14px Arial");
    this.setSealState("gold");

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
    const mission = MISSIONS[this.currentMission];
    await this.bitSay(mission.postMissionNote || "Clean certification — the rig confirms it.");
    await Promise.race([this.waitForClick(), this.delay(2200)]);
    this.hideBubble();
    await this.delay(400);
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
    if (icon) this.tweens.add({ targets: icon, alpha: 0.12, duration: 350 });
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
      this.setSealState("idle");
      this._seal.c.setAlpha(0.15);
      this.tweens.add({ targets: this._lampPool, alpha: 0, duration: 500 });
      this.clearRail();
      const motes = this.ambient;
      this.ambient = null;
      (motes || []).forEach((m) => this.tweens.add({ targets: m, y: 632, alpha: 0, duration: 1500, ease: "Sine.easeIn" }));

      const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
      this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });
      const title = this.add.text(640, 240, "CERTIFICATION REVOKED", { font: "bold 30px Georgia", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
      this.tweens.add({ targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut", onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }) });
      this.add.text(640, 310, `Score: ${this.score}`, { font: "20px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
      this.add.text(640, 350, `Missions Certified: ${this.currentMission} / ${MISSIONS.length}`, { font: "16px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);
      this._makeButton(640, 420, "RE-OPEN THE OFFICE", 240, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
    })();
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearMission();
    this.hideBubble();

    try { GameManager.completeLevel(59, Math.round((this.flawlessCount / MISSIONS.length) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("math_abs_mastery"); } catch (_) {}
    try {
      localStorage.setItem("level60_results", JSON.stringify({
        level: 60, concept: "math_abs", phase: "restructuring",
        score: this.score, missionsCompleted: 6, flawlessMissions: this.flawlessCount,
        totalRuns: this.runCount, failedRuns: this.failedRunCount, hintsUsed: this.hintCount,
        selfCorrections: this.selfCorrectionCount,
        toleranceAssembledProactively: this.toleranceProactive, absClampOrderCorrectFirstRun: this.absClampOrderFirst,
        crossWingCleanFirstRun: this.crossWingCleanFirstRun,
        livesRemaining: this.lives, attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.officeFinale().then(() => { if (this._alive) this.showScoreTally(); });
  }

  async officeFinale() {
    this.setSealState("gold");
    await new Promise((res) => { this.tweens.add({ targets: this._seal.c, scale: 0.7, duration: 150, yoyo: true, onComplete: res }); });
    this.createConfetti(880, 56, 20);

    this._cabinetDrawer.clear();
    this._cabinetDrawer.fillStyle(C_GOLD, 0.8);
    this._cabinetDrawer.fillRect(78, this._cabinetDrawerY + 14, 24, 8);
    this.tweens.add({ targets: this._lampPool, alpha: 0.1, duration: 600, yoyo: true, repeat: 1 });
    this._certDocs.forEach((d, i) => {
      this.time.delayedCall(i * 150, () => { if (d.check.active) d.check.setText("✓"); });
    });
    await this.delay(1100);

    const [leftBeam, rightBeam] = await Promise.all([
      this.extendBeam(this.obelisk.x, RAIL_X0, C_GOLD),
      this.extendBeam(this.obelisk.x, RAIL_X1, C_GOLD),
    ]);
    await this.delay(500);
    [leftBeam, rightBeam].forEach((b) => {
      this.tweens.add({ targets: [b.beam, b.glow], alpha: 0, duration: 350, onComplete: () => { b.beam.destroy(); b.glow.destroy(); } });
    });
    this.createConfetti(640, 300, 40);
    await this.delay(700);
  }

  _starRating() {
    if (this.flawlessCount >= 4 && this.hintCount <= 1) return 3;
    if (this.failedRunCount <= 3) return 2;
    return 1;
  }

  showScoreTally() {
    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
    this.tweens.add({ targets: ov, fillAlpha: 0.85, duration: 500 });

    const panel = this.add.graphics().setDepth(90);
    panel.fillStyle(0x0a0d18, 1);
    panel.fillRoundedRect(350, 90, 580, 560, 16);
    panel.lineStyle(2, C_GOLD, 1);
    panel.strokeRoundedRect(350, 90, 580, 560, 16);

    const title = this.add.text(640, 130, "STANDARDS CLERK", { font: "bold 32px Georgia", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(91).setScale(0);
    this.tweens.add({ targets: title, scale: 1, duration: 350, ease: "Back.easeOut" });

    const toleranceStr = this.toleranceProactive.mission4 ? "✓" : "✗";
    const orderStr = this.absClampOrderFirst.mission3 ? "✓" : "✗";
    const crossWingCount = Object.values(this.crossWingCleanFirstRun).filter(Boolean).length;
    const lines = [
      "MISSIONS: 6/6",
      `FLAWLESS: ${this.flawlessCount}`,
      `SELF-CORRECTIONS: ${this.selfCorrectionCount}`,
      `TOLERANCE-PROACTIVE: ${toleranceStr}`,
      `ABS-CLAMP ORDER: ${orderStr}`,
      `CROSS-WING CLEAN: ${crossWingCount}/2`,
      `HINTS: ${this.hintCount}`,
    ];
    lines.forEach((s, i) => {
      const t = this.add.text(410, 170 + i * 22, s, { font: "13px Arial", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 250, delay: 300 + i * 130 });
    });
    const totalText = this.add.text(410, 170 + 7 * 22, "TOTAL: 0", { font: "bold 20px Arial", color: HEX_GOLD }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: totalText, alpha: 1, duration: 250, delay: 1200 });
    const counter = { v: 0 };
    this.tweens.add({ targets: counter, v: this.score, duration: 1000, delay: 1200, onUpdate: () => totalText.setText(`TOTAL: ${Math.round(counter.v)}`) });

    const stars = this._starRating();
    for (let i = 0; i < 3; i++) {
      const earned = i < stars;
      const s = this.add.text(640 + (i - 1) * 60, 358, "★", { font: "34px Arial", color: earned ? HEX_GOLD : "#2a3040" }).setOrigin(0.5).setDepth(91).setScale(0);
      this.tweens.add({ targets: s, scale: 1, duration: 250, delay: 1700 + i * 200, ease: earned ? "Back.easeOut" : "Cubic.easeOut" });
    }

    const badge = this.add.container(640, 420).setDepth(91).setAlpha(0);
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillCircle(0, 0, 34);
    bg.lineStyle(3, C_GOLD, 1);
    bg.strokeCircle(0, 0, 34);
    bg.fillStyle(0x1a1408, 1);
    bg.lineStyle(1.5, C_GOLD, 1);
    bg.beginPath();
    bg.moveTo(-16, 10); bg.lineTo(-8, 10); bg.lineTo(-10, -6); bg.lineTo(-12, -9); bg.lineTo(-14, -6);
    bg.closePath();
    bg.fillPath(); bg.strokePath();
    bg.lineStyle(1.5, C_CYAN, 0.9);
    bg.lineBetween(-12, 4, -2, 4);
    bg.fillStyle(C_BRASS, 0.7);
    bg.fillCircle(6, 4, 5);
    bg.fillStyle(0xc62828, 0.7);
    bg.fillCircle(14, -6, 5);
    badge.add(bg);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 2100 });
    const badgeLbl = this.add.text(640, 462, "abs() MASTERY", { font: "bold 13px Georgia", color: HEX_GOLD }).setOrigin(0.5).setDepth(91).setAlpha(0);
    const badgeSub = this.add.text(640, 478, "Accretion ✓  Tuning ✓  Restructuring ✓", { font: "10px Arial", color: "#78909c" }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: [badgeLbl, badgeSub], alpha: 1, duration: 300, delay: 2200 });

    const barY = 505;
    const barG = this.add.graphics().setDepth(91).setAlpha(0);
    barG.lineStyle(1.5, 0x78909c, 1);
    barG.strokeRoundedRect(450, barY, 380, 14, 7);
    barG.fillStyle(C_CYAN, 1);
    barG.fillRoundedRect(450, barY, 380 * 0.67, 14, 7);
    this.tweens.add({ targets: barG, alpha: 1, duration: 300, delay: 2300 });
    const progressLbl = this.add.text(640, barY + 26, "MATH WING — 2 of 3 trilogies complete", { font: "bold 11px Georgia", color: HEX_CYAN }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: progressLbl, alpha: 1, duration: 300, delay: 2400 });

    this._makeButton(470, 605, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(760, 605, "NEXT: pow() awaits →", 260, 44, { fill: 0x00733a, stroke: C_GREEN_BRIGHT, textColor: "#ffffff" }, () => {
      this.scene.start("MenuScene");
    });
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
