/**
 * Level 58 — "The Distance Hall" (Math Methods: Accretion Phase —
 * abs())
 * ===========================================================================
 * Opens the abs() trilogy. The L56 number-line rail is promoted to the
 * hall's centerpiece: a grand Measuring Rail with a movable Zero
 * Obelisk. A value drops as a star-marker at its true position; the
 * measuring beam extends from the obelisk to the marker; the beam's
 * LENGTH — always positive — detaches and descends as Math.abs(x)'s
 * return value. The difference-distance pattern (Math.abs(a - b)) gets
 * its own dual-beam choreography: the main beam measures the
 * difference from zero while a second gold beam, drawn directly
 * between the two original markers, confirms the same length is the
 * gap between them.
 *
 * The evaluator is honest: abs(x) must emerge from x<0?-x:x, never
 * string manipulation; inner arithmetic (a - b) resolves before the
 * beam ever measures; abs(-3)+abs(4) genuinely runs TWO separate
 * measurements before adding.
 */

import Phaser from "phaser";
import { GameManager } from "../../../GameManager.js";
import { BadgeSystem } from "../../../BadgeSystem.js";

const W = 1280, H = 720;

const C_CYAN = 0x4fc3f7, C_GOLD = 0xffd740, C_ORANGE = 0xff9800, C_BLUE_GRAY = 0x8ea6c8;
const C_GREEN_BRIGHT = 0x00e676, C_RED = 0xf44336, C_GRAY = 0x78909c, C_BRASS = 0xc8a05a;
const HEX_CYAN = "#4fc3f7", HEX_GOLD = "#ffd740", HEX_ORANGE = "#ff9800", HEX_BLUE_GRAY = "#8ea6c8";
const HEX_GREEN_BRIGHT = "#00e676", HEX_RED = "#f44336", HEX_GRAY = "#78909c", HEX_BRASS = "#c8a05a";

const RAIL_X0 = 180, RAIL_X1 = 1100, RAIL_Y = 330;
const NP_X = 640, NP_Y = 260;
const PLINTH_X = 640, PLINTH_Y = 470;
const SLATE_X = 940, SLATE_Y = 130, SLATE_W = 300, SLATE_H = 290;
const TUTORIAL_KEY = "level58_tutorial_done";

// ══════════════════════════════════════════════════════════════
// ROUND CONFIGURATION
// ══════════════════════════════════════════════════════════════
const ROUNDS = [
  { round: 1, type: "predict",
    source: ["int d = Math.abs(-8);"],
    question: "What is stored in d?", correct: "8",
    options: [
      { value: "8", tag: null },
      { value: "-8", tag: "abs_returns_negative_belief" },
      { value: "0", tag: "abs_of_zero_error_belief" },
      { value: "64", tag: "abs_squares_belief" },
    ],
    concept: "basic_abs_negative" },

  { round: 2, type: "predict",
    source: ["int d = Math.abs(7);"],
    question: "What is stored in d?", correct: "7",
    options: [
      { value: "7", tag: null },
      { value: "-7", tag: "abs_flips_all_signs_belief" },
      { value: "0", tag: "abs_of_zero_error_belief" },
      { value: "14", tag: "abs_doubles_belief" },
    ],
    revealNote: "The beam unspools rightward, reads 7, hands back 7 — positives are ALREADY distances. abs doesn't flip signs; it measures.",
    concept: "positive_passthrough" },

  { round: 3, type: "predict",
    source: ["int d = Math.abs(0);"],
    question: "What is stored in d?", correct: "0",
    options: [
      { value: "0", tag: null },
      { value: "1", tag: "abs_min_one_belief" },
      { value: "error", tag: "abs_of_zero_error_belief", label: "Runtime error" },
      { value: "-0", tag: "abs_returns_negative_belief" },
    ],
    concept: "zero_distance" },

  { round: 4, type: "predict",
    source: ["int x = -6;", "int d = Math.abs(x);", "System.out.println(x);"],
    question: "What prints?", correct: "-6",
    options: [
      { value: "-6", tag: null },
      { value: "6", tag: "abs_modifies_variable_belief" },
      { value: "0", tag: "abs_consumes_belief" },
      { value: "error", tag: "abs_after_use_error_belief" },
    ],
    revealNote: "The marker never moved — abs measured x and left it at −6. The distance went into d; the variable kept its sign. Measure, never move.",
    concept: "purity_probe" },

  { round: 5, type: "predict",
    source: ["double d = Math.abs(-2.5);"],
    question: "What is stored in d?", correct: "2.5",
    options: [
      { value: "2.5", tag: null },
      { value: "2", tag: "abs_strips_decimal_belief" },
      { value: "3", tag: "abs_rounds_belief" },
      { value: "-2.5", tag: "abs_returns_negative_belief" },
    ],
    revealNote: "The double edition — 2.5 whole, half-step intact. abs measures; it never rounds, trims, or tidies.",
    concept: "double_overload" },

  { round: 6, type: "predict",
    source: ["int x = -4;", "int r = x.abs();"],
    question: "What happens?", correct: "compile_error",
    options: [
      { value: "compile_error", tag: null, label: "COMPILE ERROR — int has no methods" },
      { value: "returns_4", tag: "instance_call_on_number_belief", label: "r = 4" },
      { value: "returns_-4", tag: "instance_call_on_number_belief", label: "r = -4" },
      { value: "runtime_error", tag: "runtime_vs_compile_confusion", label: "Runtime exception" },
    ],
    revealNote: "The stability probe, second trilogy — numbers carry no instruments. Math.abs(x). The class name is the address, forever.",
    concept: "static_probe" },

  { round: 7, type: "predict",
    source: ["int gap = Math.abs(3 - 10);"],
    question: "What is stored in gap?", correct: "7",
    options: [
      { value: "7", tag: null },
      { value: "-7", tag: "abs_returns_negative_belief" },
      { value: "13", tag: "abs_of_sum_belief" },
      { value: "3", tag: "abs_takes_first_belief" },
    ],
    revealNote: "Inner first: 3 − 10 = −7; then the beam measures 7. The gold beam between the markers agrees — abs of the difference IS the gap between the values.",
    concept: "difference_distance" },

  { round: 8, type: "predict",
    source: ["int g1 = Math.abs(3 - 10);", "int g2 = Math.abs(10 - 3);", "System.out.println(g1 == g2);"],
    question: "What prints?", correct: "true",
    options: [
      { value: "true", tag: null },
      { value: "false", tag: "difference_order_matters_belief" },
      { value: "7", tag: "println_prints_value_belief" },
      { value: "error", tag: "boolean_print_error_belief" },
    ],
    revealNote: "Both orders, back to back: −7 lands left of the obelisk, +7 lands right — and both beams read SEVEN. Distance forgets direction.",
    concept: "order_independence" },

  { round: 9, type: "predict",
    source: ["int r = Math.abs(-3) + Math.abs(4);"],
    question: "What is stored in r?", correct: "7",
    options: [
      { value: "7", tag: null },
      { value: "1", tag: "abs_of_sum_belief" },
      { value: "-7", tag: "abs_returns_negative_belief" },
      { value: "12", tag: "abs_multiplies_belief" },
    ],
    revealNote: "TWO separate measurements — 3 and 4 — then ordinary addition: 7. abs(-3) + abs(4) = 7, but abs(-3 + 4) would be 1. WHERE the parentheses close decides WHAT gets measured.",
    concept: "abs_distribution_discrimination" },

  { round: 10, type: "command",
    skeleton: ["int depth = -42;", "int magnitude = <slot:call>;"],
    mission: "Record the SIZE of the depth reading (a positive count of meters) in magnitude.",
    slots: [{ id: "call", hint: "the measurement" }],
    cartridges: [
      { code: "Math.abs(depth)", correct: true },
      { code: "depth.abs()", tag: "instance_call_on_number_belief" },
      { code: "Math.abs(-depth)", tag: "double_negation_overthink", alsoCorrect: true },
      { code: "math.abs(depth)", tag: "math_lowercase_belief" },
    ],
    tests: [{ expectedVariable: { name: "magnitude", value: 42 } }],
    postMissionNote: "Bit (on the alsoCorrect build): 'Math.abs(-depth) works — negate then measure — but it's a scenic route. abs alone already forgets the sign; trust the beam.'",
    concept: "command_abs_basic" },

  { round: 11, type: "command",
    skeleton: ["int predicted = 98;", "int observed = /* test */;", "int error = <slot:call>;", 'System.out.println("Error: " + error);'],
    mission: "Publish the ERROR — the distance between predicted and observed — always positive, whichever is larger.",
    slots: [{ id: "call", hint: "the error measurement" }],
    cartridges: [
      { code: "Math.abs(predicted - observed)", correct: true },
      { code: "Math.abs(observed - predicted)", correct: true, alsoCorrect: true },
      { code: "predicted - observed", tag: "abs_missing" },
      { code: "Math.abs(predicted) - Math.abs(observed)", tag: "abs_distributes_belief" },
    ],
    tests: [
      { substitutions: { observed: "104" }, expectedOutput: "Error: 6" },
      { substitutions: { observed: "91" }, expectedOutput: "Error: 7" },
    ],
    revealNote: "The abs-less build published 'Error: -6' — a negative distance, a nonsense measurement. abs wraps the DIFFERENCE: one beam, marker to marker.",
    concept: "command_error_measurement" },

  { round: 12, type: "command",
    skeleton: ["int target = 50;", "int shot = /* test */;", "int miss = <slot:call>;", "System.out.println(miss);", "System.out.println(<slot:verdict>);"],
    mission: "Publish the miss distance, then the verdict: within 5 of the target prints 'HIT', otherwise 'MISS'. For shot=53: 'HIT'. For shot=42: 'MISS'.",
    slots: [{ id: "call", hint: "the miss distance" }, { id: "verdict", hint: "the verdict (nest your tools!)" }],
    cartridges: [
      { code: "Math.abs(shot - target)", correct: true, slotId: "call" },
      { code: "shot - target", tag: "abs_missing", slotId: "call" },
      { code: 'miss <= 5 ? "HIT" : "MISS"', correct: true, slotId: "verdict" },
      { code: 'miss < 5 ? "HIT" : "MISS"', tag: "boundary_off_by_one", slotId: "verdict" },
    ],
    tests: [
      { substitutions: { shot: "53" }, expectedOutput: "3⏎HIT" },
      { substitutions: { shot: "42" }, expectedOutput: "8⏎MISS" },
      { substitutions: { shot: "45" }, expectedOutput: "5⏎HIT" },
    ],
    revealNote: "The abs-less build's dark magic: 42 − 50 = −8, and −8 <= 5 is TRUE — a nine-meter miss published as a HIT. abs first, THEN compare.",
    postMissionNote: "Bit: 'Distance, then verdict — the tolerance pattern. Every close-enough check in every program is abs-of-difference against a limit.'",
    concept: "command_tolerance_pattern" },
];

const MISCONCEPTION_FEEDBACK = {
  abs_flips_all_signs_belief: "abs doesn't FLIP — it MEASURES. Seven already stands seven steps from home; the beam hands it back whole. Only negatives change, and only because their distance was always positive.",
  abs_returns_negative_belief: "The beam cannot read a negative — distances start at zero and go up. Whatever enters, what returns is ≥ 0, always.",
  abs_modifies_variable_belief: "The marker never moved — look at the rail. abs measures the value and leaves it exactly where it stood. The distance is a NEW value; catch it in a variable.",
  abs_of_zero_error_belief: "Zero is a fine question — zero steps from home, answer 0, no error, no drama.",
  abs_rounds_belief: "No rounding, no trimming — 2.5 returned whole. abs touches the SIGN's meaning, never the digits.",
  abs_strips_decimal_belief: "No rounding, no trimming — 2.5 returned whole. abs touches the SIGN's meaning, never the digits.",
  abs_squares_belief: "The beam does no arithmetic — it reads a length. One argument in, its distance out, nothing multiplied.",
  abs_doubles_belief: "The beam does no arithmetic — it reads a length. One argument in, its distance out, nothing multiplied.",
  abs_multiplies_belief: "The beam does no arithmetic — it reads a length. One argument in, its distance out, nothing multiplied.",
  abs_min_one_belief: "No minimum — the shortest distance is 0, and abs(0) reports it honestly.",
  difference_order_matters_belief: "Watch both reveals — the difference lands on opposite sides of the obelisk, and BOTH beams read the same length. Under abs, subtraction order is a matter of taste.",
  abs_of_sum_belief: "Parentheses decide what gets measured — abs(-3) + abs(4) is two beams then a sum (7); abs(-3 + 4) is one sum then one beam (1). Read where the call closes.",
  abs_distributes_belief: "abs of a difference is NOT the difference of abs's — the first measures the gap between the markers; the second measures each from zero and subtracts. Different questions, different answers.",
  abs_takes_first_belief: "The whole expression inside the parens resolves first — abs saw −7, not the 3.",
  abs_missing: "A negative distance is a nonsense measurement — and worse, it slips under every threshold. Wrap the difference: Math.abs(a − b), then compare.",
  double_negation_overthink: "Negate-then-measure works — but abs alone already forgets the sign. Trust the beam; skip the scenic route.",
  boundary_off_by_one: "The brief said WITHIN 5 — five exactly counts. <= holds the boundary; < surrenders it.",
  instance_call_on_number_belief: "Second trilogy, same law — numbers carry no instruments. Math.abs(x); the class name is the address.",
  math_lowercase_belief: "Case is law — 'math' is nobody. Capital M, engraved on the nameplate above the rail.",
  bare_call_stores_result_belief: "The chip faded on the plinth, uncaught. Assign it, print it, or nest it — the hall keeps no lost-and-found.",
  runtime_vs_compile_confusion: "Forbidden calls die at COMPILE time — the instance-call never reached the rail.",
};

export class Level58Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level58Scene" });
  }

  init() {
    this.currentRound = 0;
    this.score = 0;
    this.displayScore = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.lives = 3;
    this.correctFirstTry = 0;
    this.totalTime = 0;
    this.attemptLog = [];
    this.roundElements = [];
    this.roundStartTime = 0;
    this.roundAttempts = 0;
    this.slotContents = {};
    this.slotDefs = {};
    this.cartridges = [];
    this.firstNegativeAnnotationShown = false;
    this.firstBareCallAnnotationShown = false;
    this.firstZeroAnnotationShown = false;
    this.inputLocked = true;
    this.gameEnded = false;
    this._alive = true;
  }

  preload() {}

  create() {
    this._alive = true;
    this.createParticleTexture();
    this.createBackground();
    this.createHallInterior();
    this.createSurveyorsTripod();
    this.createHallFloor();
    this.createParticles();
    this.createMeasuringRail();
    this.createResultPlinth();
    this.createSurveyorsSlate();
    this.createSourceDisplay();
    this.createHUD();
    this.createExpressionMonitor();
    this.createBit();
    this.setupDragEvents();

    this.events.on("shutdown", () => { this._alive = false; });
    this.checkTutorial();
  }

  update(time, delta) {
    this.updateParticles(time, delta);
    this.updateLampGlow(time);
    this.updateObeliskRing(time);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // SETUP — BACKGROUND & HALL INTERIOR
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l58_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l58_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x060810).setDepth(0);
  }

  createHallInterior() {
    const g = this.add.graphics().setDepth(1);
    for (let x = 60; x < W; x += 180) {
      g.fillStyle(0x0d1220, 1);
      g.lineStyle(1, 0x2a3654, 0.5);
      g.fillRect(x, 20, 12, 160);
      g.strokeRect(x, 20, 12, 160);
    }
    const frameXs = [200, 580, 960];
    this._surveyChartWhiskers = [];
    frameXs.forEach((fx) => {
      g.lineStyle(1, 0x8a6435, 0.4);
      g.strokeRect(fx, 50, 110, 80);
      const wave = this.add.graphics().setDepth(2);
      wave.lineStyle(1, C_BLUE_GRAY, 0.2);
      wave.beginPath();
      for (let i = 0; i <= 10; i++) {
        const px = fx + 10 + i * 9, py = 90 + Math.sin(i * 1.3) * 12;
        if (i === 0) wave.moveTo(px, py); else wave.lineTo(px, py);
        wave.lineBetween(px, py - 5, px, py + 5);
      }
      wave.strokePath();
      this._surveyChartWhiskers.push(wave);
    });

    this._galleryLamps = [];
    [320, 640, 960].forEach((lx) => {
      const shade = this.add.graphics().setDepth(2);
      shade.fillStyle(0x2e7d32, 0.5);
      shade.lineStyle(1, C_BRASS, 0.6);
      shade.fillTriangle(lx - 10, 40, lx + 10, 40, lx, 55);
      shade.strokeTriangle(lx - 10, 40, lx + 10, 40, lx, 55);
      const pool = this.add.ellipse(lx, 90, 70, 20, 0xffa726, 0.03).setDepth(2);
      this._galleryLamps.push({ shade, pool, phase: Phaser.Math.Between(0, 2000) });
    });

    const bg = this.add.graphics().setDepth(2);
    bg.fillStyle(0x060810, 1);
    bg.lineStyle(1, C_BRASS, 0.5);
    bg.fillRoundedRect(460, 12, 340, 26, 3);
    bg.strokeRoundedRect(460, 12, 340, 26, 3);
    this.add.text(630, 25, "T H E   D I S T A N C E   H A L L", { font: "bold 13px Georgia", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.7).setDepth(3);
  }

  updateLampGlow(time) {
    if (!this._galleryLamps) return;
    this._galleryLamps.forEach((l) => {
      const t = (time + l.phase) % 3000;
      l.pool.setAlpha(0.02 + Math.abs(Math.sin((t / 3000) * Math.PI)) * 0.02);
    });
  }

  createSurveyorsTripod() {
    const g = this.add.graphics().setDepth(2).setAlpha(0.5);
    g.lineStyle(2, 0x8a6435, 1);
    g.lineBetween(70, 500, 50, 590);
    g.lineBetween(70, 500, 90, 590);
    g.lineBetween(70, 500, 70, 595);
    g.fillStyle(0x8a6435, 1);
    g.fillCircle(70, 500, 5);
    g.lineStyle(2, C_BRASS, 0.9);
    g.strokeRect(64, 480, 12, 18);
  }

  createHallFloor() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x0a0d18, 1);
    g.fillRect(0, 635, W, 85);
    g.lineStyle(1, 0x2a3654, 1);
    g.lineBetween(0, 637, W, 637);
    g.lineStyle(1, 0x2a3654, 0.3);
    for (let x = 0; x < W; x += 100) g.lineBetween(x, 640, x, 720);
    g.lineStyle(2, C_BRASS, 0.15);
    g.lineBetween(0, 660, W, 660);
    g.lineStyle(1, C_BRASS, 0.15);
    for (let x = 0; x < W; x += 40) g.lineBetween(x, 656, x, 664);
  }

  createParticles() {
    this.ambient = [];
    const colors = [0x8ea6c8, 0xc8a05a, 0xe8eaf6];
    for (let i = 0; i < 7; i++) {
      this.ambient.push(this.add.circle(Phaser.Math.Between(0, W), Phaser.Math.Between(150, 630), 1, Phaser.Utils.Array.GetRandom(colors), Phaser.Math.FloatBetween(0.03, 0.05)).setDepth(2));
    }
  }

  updateParticles(time, delta) {
    if (!this.ambient) return;
    const step = 0.008 * (delta / 16.7);
    this.ambient.forEach((p, i) => {
      p.y += step * (i % 2 === 0 ? 1 : -0.6);
      p.x += Math.sin(time * 0.0003 + i) * 0.02;
      if (p.y > 630) p.y = 150; if (p.y < 150) p.y = 630;
      if (p.x > W) p.x = 0; if (p.x < 0) p.x = W;
    });
  }

  createAnnotation(x, y, text, colorHex) {
    const t = this.add.text(x, y, text, { font: "italic 11px Georgia", color: colorHex, wordWrap: { width: 300 }, align: "center" }).setOrigin(0.5).setDepth(70).setAlpha(0);
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
    const p = this.add.particles(x, y, "l58_dot", {
      speed: { min: 80, max: 240 }, angle: { min: 0, max: 360 }, scale: { start: 0.9, end: 0 }, lifespan: 500,
      tint: [C_BRASS, C_GOLD, C_RED, C_CYAN, 0xffffff], emitting: false,
    }).setDepth(75);
    p.explode(count);
    this.time.delayedCall(900, () => p.destroy());
  }

  screenShake(intensity = 0.004, duration = 150) {
    this.cameras.main.shake(duration, intensity);
  }

  // ══════════════════════════════════════════════════════════════
  // THE MEASURING RAIL (hero visual)
  // ══════════════════════════════════════════════════════════════

  createMeasuringRail() {
    const postG = this.add.graphics().setDepth(3);
    for (let i = 0; i < 5; i++) {
      const px = RAIL_X0 + ((RAIL_X1 - RAIL_X0) * i) / 4;
      postG.fillStyle(0x1a1408, 1);
      postG.fillRect(px - 2, RAIL_Y, 4, 14);
      postG.fillRect(px - 8, RAIL_Y + 14, 16, 4);
    }
    this.railGfx = this.add.graphics().setDepth(4);
    this.railGfx.lineStyle(3, C_BRASS, 0.8);
    this.railGfx.lineBetween(RAIL_X0, RAIL_Y, RAIL_X1, RAIL_Y);
    this.railTicksGfx = this.add.graphics().setDepth(4);
    this.railLabels = this.add.container(0, 0).setDepth(5);

    const npBg = this.add.graphics().setDepth(6);
    npBg.fillStyle(0x060810, 1);
    npBg.lineStyle(2, C_GOLD, 1);
    npBg.fillRoundedRect(NP_X - 55, NP_Y - 15, 110, 30, 4);
    npBg.strokeRoundedRect(NP_X - 55, NP_Y - 15, 110, 30, 4);
    this.add.text(NP_X, NP_Y - 8, "Math", { font: "bold 16px Courier New", color: HEX_GOLD }).setOrigin(0.5).setDepth(7);
    this.methodPlateText = this.add.text(NP_X, NP_Y + 8, ".abs", { font: "bold 12px Courier New", color: HEX_CYAN }).setOrigin(0.5).setDepth(7);
    this.nameplateBg = npBg;

    this.obelisk = this.add.container(NP_X, RAIL_Y).setDepth(8);
    const og = this.add.graphics();
    og.fillStyle(0x1a1408, 1);
    og.lineStyle(2, C_GOLD, 1);
    og.beginPath();
    og.moveTo(-7, 0); og.lineTo(7, 0); og.lineTo(4, -22); og.lineTo(0, -26); og.lineTo(-4, -22);
    og.closePath();
    og.fillPath(); og.strokePath();
    this.obeliskGlow = this.add.circle(0, 2, 10, C_GOLD, 0.25);
    const zeroLabel = this.add.text(0, 16, "0", { font: "bold 14px Courier New", color: HEX_GOLD }).setOrigin(0.5);
    this.obelisk.add([this.obeliskGlow, og, zeroLabel]);

    this.beamLayer = this.add.container(0, 0).setDepth(7.5);
    this.markerLayer = this.add.container(0, 0).setDepth(9);
    this._varMarkers = {};
    this._varContainers = [];

    this.rescaleRail([-8, 8]);
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
    const tickStep = this._niceStep(span / 10);
    let n = 0;
    for (let v = Math.ceil(lo / tickStep) * tickStep; v <= hi; v += tickStep) {
      const x = toX(v);
      if (Math.abs(v) < 1e-9) { n++; continue; }
      this.railTicksGfx.lineStyle(1, C_BRASS, 0.5);
      this.railTicksGfx.lineBetween(x, RAIL_Y - 8, x, RAIL_Y + 8);
      if (n % 2 === 0) {
        const lbl = this.add.text(x, RAIL_Y + 22, this._fmtNum(v), { font: "bold 11px Courier New", color: HEX_BLUE_GRAY }).setOrigin(0.5).setAlpha(0.7);
        this.railLabels.add(lbl);
      }
      n++;
    }

    const zeroX = toX(0);
    this.tweens.add({ targets: this.obelisk, x: zeroX, duration: 300, ease: "Sine.easeInOut" });
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
    const display = type === "double" ? Number(value).toFixed(1) : String(value);
    const txt = this.add.text(0, -size / 2 - 14, display, { font: "bold 15px Courier New", color: type === "double" ? HEX_ORANGE : HEX_GOLD }).setOrigin(0.5);
    c.add([g, txt]);
    return { container: c, gfx: g, text: txt, value, type };
  }

  async dropMarker(value, type, opts = {}) {
    const x = this._railToX(Number(value));
    const marker = this._makeMarker(value, type, opts.size || 26, opts.dashed);
    marker.container.setPosition(x, RAIL_Y - 90);
    marker.container.setAlpha(0);
    this.markerLayer.add(marker.container);
    await new Promise((res) => { this.tweens.add({ targets: marker.container, y: RAIL_Y, alpha: opts.dashed ? 0.6 : 1, duration: 260, ease: "Bounce.easeOut", onComplete: res }); });
    return marker;
  }

  async ensureVarMarker(name, value, type) {
    if (this._varMarkers[name]) {
      this.tweens.add({ targets: this._varMarkers[name].container, scale: 1.3, duration: 110, yoyo: true });
      return this._varMarkers[name];
    }
    const m = await this.dropMarker(value, type);
    this._varMarkers[name] = m;
    return m;
  }

  async extendBeam(fromX, toX, color = C_CYAN) {
    const dir = toX >= fromX ? 1 : -1;
    const dist = Math.abs(toX - fromX);
    const beam = this.add.rectangle(fromX, RAIL_Y, 0, 4, color, 0.9);
    const glow = this.add.rectangle(fromX, RAIL_Y, 0, 10, color, 0.2);
    this.beamLayer.add([glow, beam]);
    const state = { w: 0 };
    await new Promise((res) => {
      this.tweens.add({
        targets: state, w: dist, duration: 300, ease: "Sine.easeOut",
        onUpdate: () => { beam.width = state.w; beam.x = fromX + (dir * state.w) / 2; glow.width = state.w + 6; glow.x = beam.x; },
        onComplete: res,
      });
    });
    return { beam, glow, fromX, toX };
  }

  showLengthChip(midX, length, type) {
    const display = type === "double" ? Number(length).toFixed(1) : String(length);
    const c = this.add.container(midX, RAIL_Y - 28).setDepth(9).setAlpha(0).setScale(0.5);
    const g = this.add.graphics();
    g.fillStyle(0x0a0d18, 1);
    g.lineStyle(2, C_CYAN, 1);
    g.fillRoundedRect(-26, -14, 52, 28, 6);
    g.strokeRoundedRect(-26, -14, 52, 28, 6);
    const t = this.add.text(0, 0, display, { font: "bold 16px Courier New", color: HEX_CYAN }).setOrigin(0.5);
    c.add([g, t]);
    this.tweens.add({ targets: c, alpha: 1, scale: 1, duration: 160, ease: "Back.easeOut" });
    return c;
  }

  async zeroPulse() {
    const ring = this.add.circle(this.obelisk.x, RAIL_Y, 8, C_GOLD, 0.4).setDepth(8);
    this.tweens.add({ targets: ring, scale: 3, alpha: 0, duration: 400, onComplete: () => ring.destroy() });
    await this.delay(300);
  }

  async detachAndDeliver(beamObj, chip) {
    await new Promise((res) => { this.tweens.add({ targets: [beamObj.beam, beamObj.glow, chip], y: "-=20", duration: 220, ease: "Sine.easeOut", onComplete: res }); });
    await new Promise((res) => { this.tweens.add({ targets: [beamObj.beam, beamObj.glow], scaleX: 0, alpha: 0, duration: 180, onComplete: () => { beamObj.beam.destroy(); beamObj.glow.destroy(); res(); } }); });
    await new Promise((res) => { this.tweens.add({ targets: chip, x: PLINTH_X, y: PLINTH_Y, duration: 240, ease: "Sine.easeIn", onComplete: res }); });
    this._plinthChip = chip;
  }

  async _deliverChipOnly(chip) {
    await new Promise((res) => { this.tweens.add({ targets: chip, y: "-=20", duration: 180, onComplete: res }); });
    await new Promise((res) => { this.tweens.add({ targets: chip, x: PLINTH_X, y: PLINTH_Y, duration: 230, ease: "Sine.easeIn", onComplete: res }); });
    this._plinthChip = chip;
  }

  /** The full §2.3 choreography for a single Math.abs(x) measurement. */
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
      if (!this.firstZeroAnnotationShown) { this.firstZeroAnnotationShown = true; this.createAnnotation(this.obelisk.x, RAIL_Y + 50, "zero is zero steps from home", HEX_BLUE_GRAY); }
    } else {
      beamObj = await this.extendBeam(this.obelisk.x, targetX);
      if (!this.firstNegativeAnnotationShown && Number(value) < 0) {
        this.firstNegativeAnnotationShown = true;
        this.createAnnotation(midX, RAIL_Y + 50, "distance has no direction", HEX_BLUE_GRAY);
      }
    }
    const chip = this.showLengthChip(Number(value) === 0 ? this.obelisk.x : midX, length, type);
    await this.delay(400);
    if (!this._alive) return { value: length, type };
    if (beamObj) await this.detachAndDeliver(beamObj, chip);
    else await this._deliverChipOnly(chip);

    this.chalkEvaluationArrow(length, type);
    this.updateResultRow(length, type);
    return { value: length, type };
  }

  /** The full §2.5 choreography for Math.abs(a - b) — the difference-
   * distance pattern, including the gold between-beam confirmation. */
  async runDifferenceMeasurement(aRes, bRes) {
    const av = Number(aRes.value), bv = Number(bRes.value);
    const diff = av - bv;
    const widened = aRes.type === "double" || bRes.type === "double";
    const diffType = widened ? "double" : "int";

    this.rescaleRail([av, bv, diff]);
    await this.delay(320);
    if (!this._alive) return { value: Math.abs(diff), type: diffType };

    const markerA = await this.dropMarker(av, widened ? "double" : aRes.type, { size: 30 });
    const markerB = await this.dropMarker(bv, widened ? "double" : bRes.type, { size: 30 });

    const annoText = `${this._fmtNum(av)} - ${this._fmtNum(bv)} = ${this._fmtNum(diff)}`;
    this.createFloatingText(640, RAIL_Y - 110, annoText, HEX_BLUE_GRAY, "bold 13px Courier New", 900);
    await this.delay(450);
    if (!this._alive) return { value: Math.abs(diff), type: diffType };

    const diffMarker = await this.dropMarker(diff, diffType, { size: 24, dashed: true });

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
    this.tweens.add({ targets: [mainChip, betweenChip], scale: 1.15, duration: 140, yoyo: true });
    await this.delay(850);
    if (!this._alive) return { value: length, type: diffType };

    await new Promise((res) => {
      this.tweens.add({ targets: [betweenBeam.beam, betweenBeam.glow, betweenChip], alpha: 0, duration: 220, onComplete: () => { betweenBeam.beam.destroy(); betweenBeam.glow.destroy(); betweenChip.destroy(); res(); } });
    });

    if (beamObj) await this.detachAndDeliver(beamObj, mainChip);
    else await this._deliverChipOnly(mainChip);

    this.chalkWriteLine(annoText, HEX_BLUE_GRAY);
    this.chalkEvaluationArrow(length, diffType);
    this.updateResultRow(length, diffType);

    this.tweens.add({ targets: diffMarker.container, alpha: 0, duration: 280, delay: 150, onComplete: () => diffMarker.container.destroy() });

    return { value: length, type: diffType };
  }

  async deliverToVariable(name, value, type) {
    const idx = this._varContainers.length;
    const x = PLINTH_X - 60 + (idx % 2) * 120, y = PLINTH_Y + 44 + Math.floor(idx / 2) * 30;
    const c = this.add.container(x, y).setDepth(12).setAlpha(0);
    const g = this.add.graphics();
    g.fillStyle(0x0a1520, 1);
    g.lineStyle(1.5, type === "double" ? C_ORANGE : C_GOLD, 0.8);
    g.fillRoundedRect(-44, -13, 88, 26, 5);
    g.strokeRoundedRect(-44, -13, 88, 26, 5);
    const nameT = this.add.text(0, -20, name, { font: "bold 9px Courier New", color: HEX_BRASS }).setOrigin(0.5);
    const display = type === "double" ? Number(value).toFixed(1) : String(value);
    const valT = this.add.text(0, 0, display, { font: "bold 12px Courier New", color: type === "double" ? HEX_ORANGE : HEX_GOLD }).setOrigin(0.5);
    c.add([g, nameT, valT]);
    this.roundElements.push(c);
    this._varContainers.push(c);
    this.tweens.add({ targets: c, alpha: 1, duration: 180 });
    if (this._plinthChip) {
      const chip = this._plinthChip;
      this._plinthChip = null;
      await new Promise((res) => { this.tweens.add({ targets: chip, x, y, alpha: 0.2, duration: 280, ease: "Sine.easeIn", onComplete: () => { chip.destroy(); res(); } }); });
    } else {
      await this.delay(180);
    }
  }

  async discardFade() {
    if (!this._plinthChip) return;
    const chip = this._plinthChip;
    this._plinthChip = null;
    await this.delay(500);
    if (!this.firstBareCallAnnotationShown) {
      this.firstBareCallAnnotationShown = true;
      this.createAnnotation(PLINTH_X, PLINTH_Y - 40, "returned... to no one", HEX_BLUE_GRAY);
    }
    await new Promise((res) => { this.tweens.add({ targets: chip, alpha: 0, scale: 0.6, duration: 350, onComplete: () => { chip.destroy(); res(); } }); });
  }

  clearVarContainers() {
    this._varContainers.forEach((c) => { if (c.active) c.destroy(); });
    this._varContainers = [];
  }

  // ── rejections ──

  async markerShudder(value, type, varName) {
    const marker = (varName && this._varMarkers[varName]) ? this._varMarkers[varName] : await this.dropMarker(value, type);
    await this.delay(100);
    this.tweens.add({ targets: marker.container, x: marker.container.x + 3, duration: 35, yoyo: true, repeat: 5 });
    const q = this.add.text(marker.container.x, marker.container.y - 30, "?", { font: "bold 20px Georgia", color: HEX_RED }).setOrigin(0.5).setDepth(20).setAlpha(0);
    this.roundElements.push(q);
    this.tweens.add({ targets: q, alpha: 1, duration: 100, yoyo: true, repeat: 3 });
    await this.delay(500);
    this.showCompileErrorStamp();
    await this.delay(600);
  }

  async nameplateDarkFlicker() {
    for (let i = 0; i < 3; i++) {
      this.methodPlateText.setAlpha(0.15);
      await this.delay(90);
      this.methodPlateText.setAlpha(1);
      await this.delay(90);
    }
    this.showCompileErrorStamp();
    await this.delay(600);
  }

  showCompileErrorStamp() {
    const stamp = this.add.text(640, 96, "COMPILE ERROR", { font: "bold 22px Arial", color: HEX_RED }).setOrigin(0.5).setDepth(30).setScale(1.5).setAngle(-6).setAlpha(0);
    this.roundElements.push(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 180 });
    this.screenShake(0.004, 150);
    this.time.delayedCall(1100, () => { if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 220, onComplete: () => stamp.destroy() }); });
  }

  // ══════════════════════════════════════════════════════════════
  // RESULT PLINTH
  // ══════════════════════════════════════════════════════════════

  createResultPlinth() {
    const chute = this.add.graphics().setDepth(6);
    chute.lineStyle(2, C_BRASS, 0.5);
    chute.lineBetween(PLINTH_X, RAIL_Y + 10, PLINTH_X, PLINTH_Y - 20);
    const plinthG = this.add.graphics().setDepth(6);
    plinthG.fillStyle(0x0a0d18, 1);
    plinthG.lineStyle(2, C_BRASS, 1);
    plinthG.fillCircle(PLINTH_X, PLINTH_Y, 24);
    plinthG.strokeCircle(PLINTH_X, PLINTH_Y, 24);
  }

  // ══════════════════════════════════════════════════════════════
  // SURVEYOR'S SLATE
  // ══════════════════════════════════════════════════════════════

  createSurveyorsSlate() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0a0d18, 1);
    g.lineStyle(2, C_BRASS, 1);
    g.fillRoundedRect(SLATE_X, SLATE_Y, SLATE_W, SLATE_H, 8);
    g.strokeRoundedRect(SLATE_X, SLATE_Y, SLATE_W, SLATE_H, 8);
    g.lineStyle(1, 0x8a6435, 0.4);
    g.strokeRoundedRect(SLATE_X + 6, SLATE_Y + 6, SLATE_W - 12, SLATE_H - 12, 6);
    this.add.text(SLATE_X + 14, SLATE_Y + 16, "SURVEYOR'S SLATE", { font: "bold 10px Georgia", color: HEX_BRASS }).setDepth(11);
    this.slateLines = this.add.container(0, 0).setDepth(11);
    this._slateY = SLATE_Y + 42;

    this.add.text(SLATE_X + 14, SLATE_Y + SLATE_H - 34, "result:", { font: "11px Georgia", color: "#8a6435" }).setDepth(11);
    this.resultText = this.add.text(SLATE_X + 70, SLATE_Y + SLATE_H - 34, "—", { font: "bold 14px Courier New", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(11);
  }

  async chalkWriteLine(text, color) {
    const t = this.add.text(SLATE_X + 14, this._slateY, "", { font: "bold 13px Courier New", color: color || "#e8eaf6" }).setDepth(11);
    this.slateLines.add(t);
    for (let i = 0; i < text.length; i++) {
      if (!this._alive) return;
      t.setText(t.text + text[i]);
      if (t.width > SLATE_W - 28) t.setFontSize(10);
      await this.delay(18);
    }
    this._slateY += 24;
    if (this._slateY > SLATE_Y + SLATE_H - 58) this._slateY = SLATE_Y + 42;
  }

  chalkEvaluationArrow(value, type) {
    const display = type === "double" ? Number(value).toFixed(1) : String(value);
    const t = this.add.text(SLATE_X + 14, this._slateY, `→ ${display}`, { font: "bold 13px Courier New", color: type === "double" ? HEX_ORANGE : HEX_GOLD }).setAlpha(0);
    this.slateLines.add(t);
    this.tweens.add({ targets: t, alpha: 1, duration: 140 });
    this._slateY += 24;
    if (this._slateY > SLATE_Y + SLATE_H - 58) this._slateY = SLATE_Y + 42;
  }

  wipeSlate() {
    this.slateLines.removeAll(true);
    this._slateY = SLATE_Y + 42;
  }

  updateResultRow(value, type) {
    if (value === null) { this.resultText.setFontSize(14).setText("—").setColor(HEX_GRAY); return; }
    if (type === "crash") { this.resultText.setText("✗ ERROR").setColor(HEX_RED).setFontSize(11); return; }
    const display = type === "double" ? Number(value).toFixed(1) : String(value);
    this.resultText.setFontSize(14).setText(display).setColor(type === "double" ? HEX_ORANGE : HEX_GOLD);
  }

  // ══════════════════════════════════════════════════════════════
  // SOURCE DISPLAY & EXPRESSION MONITOR
  // ══════════════════════════════════════════════════════════════

  createSourceDisplay() {
    this.sourceContainer = this.add.container(0, 0).setDepth(15);
  }

  _syntaxTokenize(line) {
    const tokens = [];
    const re = /("(?:[^"\\]|\\.)*")|(\bint\b|\bdouble\b|\bnew\b)|(\bMath\b)|(\.abs\b)|(-?\d+\.\d+|-?\d+)|([(){};,=+\-<>?:])/g;
    let last = 0, m;
    const plain = (t) => t && tokens.push({ t, c: "#e0e0e0" });
    while ((m = re.exec(line))) {
      if (m.index > last) plain(line.slice(last, m.index));
      if (m[1]) tokens.push({ t: m[1], c: "#4caf50" });
      else if (m[2]) tokens.push({ t: m[2], c: "#1565c0" });
      else if (m[3]) tokens.push({ t: m[3], c: HEX_GOLD });
      else if (m[4]) tokens.push({ t: m[4], c: HEX_CYAN });
      else if (m[5]) tokens.push({ t: m[5], c: "#ff8a65" });
      else if (m[6]) tokens.push({ t: m[6], c: "#78909c" });
      last = m.index + m[0].length;
    }
    if (last < line.length) plain(line.slice(last));
    return tokens.length ? tokens : [{ t: line, c: "#e0e0e0" }];
  }

  updateSourceDisplay(lines) {
    this.sourceContainer.removeAll(true);
    if (!lines || !lines.length) return;
    const fontSize = lines.length > 2 ? 13 : 15;
    const lineH = fontSize + 9;
    const startY = 145 - ((lines.length - 1) * lineH) / 2;
    lines.forEach((line, i) => {
      const y = startY + i * lineH;
      const tokens = this._syntaxTokenize(line);
      const measured = tokens.map((tok) => { const tmp = this.add.text(0, 0, tok.t, { font: `bold ${fontSize}px Courier New` }); const w = tmp.width; tmp.destroy(); return w; });
      const totalW = measured.reduce((a, b) => a + b, 0);
      let x = 640 - totalW / 2;
      tokens.forEach((tok, ti) => {
        const t = this.add.text(x, y, tok.t, { font: `bold ${fontSize}px Courier New`, color: tok.c }).setOrigin(0, 0.5).setAlpha(0);
        this.sourceContainer.add(t);
        this.tweens.add({ targets: t, alpha: 1, duration: 150 });
        x += measured[ti];
      });
    });
  }

  createExpressionMonitor() {
    const g = this.add.graphics().setDepth(50);
    g.fillStyle(0x0a0d18, 0.9);
    g.fillRoundedRect(420, 70, 440, 20, 4);
    this.exprMonitorText = this.add.text(640, 80, "", { font: "11px Courier New", color: HEX_GRAY }).setOrigin(0.5).setDepth(51);
  }

  updateExpressionMonitor(text) { this.exprMonitorText.setText(text); }

  // ══════════════════════════════════════════════════════════════
  // HUD
  // ══════════════════════════════════════════════════════════════

  createHUD() {
    const g = this.add.graphics().setDepth(49);
    g.fillStyle(0x060810, 0.93);
    g.fillRect(0, 0, W, 64);
    g.lineStyle(1, 0x2a3654, 1);
    g.lineBetween(0, 64, W, 64);

    this.add.text(20, 14, "THE DISTANCE HALL", { font: "bold 14px Georgia", color: "#b0bec5" }).setDepth(50);
    this.add.text(20, 32, "Accretion Phase — Math Methods: abs()", { font: "10px Arial", color: "#546e7a" }).setDepth(50);

    this.add.text(1060, 8, "SCORE", { font: "9px Arial", color: "#546e7a" }).setDepth(50);
    this.scoreText = this.add.text(1060, 20, "0", { font: "bold 18px Arial", color: "#ffffff" }).setDepth(50);
    this.comboText = this.add.text(1060, 42, "×1", { font: "bold 12px Arial", color: HEX_GOLD }).setDepth(50);

    this.lifeIcons = [];
    for (let i = 0; i < 3; i++) {
      const lg = this.add.graphics({ x: 1150 + i * 26, y: 24 }).setDepth(50);
      lg.lineStyle(2, C_BRASS, 1);
      lg.strokeCircle(0, 0, 6);
      lg.lineBetween(4, -4, 9, -9);
      this.lifeIcons.push(lg);
    }
  }

  // ══════════════════════════════════════════════════════════════
  // BIT — SURVEYOR VARIANT
  // ══════════════════════════════════════════════════════════════

  createBit() {
    const c = this.add.container(1090, 520).setDepth(60);
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
    const gloveL = this.add.circle(-16, 10, 4, 0xe0d6b8, 0.85);
    const reel = this.add.graphics();
    reel.fillStyle(C_BRASS, 0.8);
    reel.fillCircle(18, 8, 6);
    reel.lineStyle(1, 0x8a6435, 1);
    reel.strokeCircle(18, 8, 6);
    reel.lineBetween(18, 8, 22, 4);
    reel.fillStyle(0xe0d6b8, 0.7);
    reel.fillRect(22, 7, 6, 2);
    const plumb = this.add.graphics();
    plumb.lineStyle(1, C_BRASS, 0.8);
    plumb.lineBetween(-16, 10, -16, 22);
    plumb.fillStyle(C_BRASS, 0.9);
    plumb.fillTriangle(-19, 22, -13, 22, -16, 28);
    c.add([g, cloak, eye, pupil, gloveL, reel, plumb, tip]);
    this.tweens.add({ targets: tip, alpha: 0.3, duration: 900, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: plumb, angle: 4, duration: 1400, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
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

  // ══════════════════════════════════════════════════════════════
  // TUTORIAL
  // ══════════════════════════════════════════════════════════════

  checkTutorial() {
    let done = false;
    try { done = localStorage.getItem(TUTORIAL_KEY) === "true"; } catch (_) {}
    if (done) this.time.delayedCall(300, () => this.startRound(0));
    else this.runTutorial();
  }

  async runTutorial() {
    const A = () => this._alive;
    await this.delay(500); if (!A()) return;
    await this.bitSay("The Distance Hall, Surveyor. You've read this rail before — in the meridian trials it told you ORDER: who sits left, who sits right. Tonight it answers a different question: how FAR? Every measurement in this hall starts at the obelisk. Zero is home; abs() is the walk back.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(6000)]); if (!A()) return;
    this.hideBubble();

    let vars = {};
    this.updateSourceDisplay(["int d = Math.abs(-5);"]);
    this.updateExpressionMonitor("int d = Math.abs(-5);");
    await this.runStatements(["int d = Math.abs(-5);"], vars); if (!A()) return;
    await this.bitSay("Minus five lives five steps from home — and steps have no sign. abs() hands you the DISTANCE: always zero or more, never negative. And look at the rail: the marker still sits at minus five. We measured it; we never moved it.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(6000)]); if (!A()) return;
    this.hideBubble();
    this.wipeSlate(); this.clearVarContainers(); this.clearRail(); this.rescaleRail([-8, 8]);

    vars = {};
    this.updateSourceDisplay(["int d = Math.abs(7);"]);
    this.updateExpressionMonitor("int d = Math.abs(7);");
    await this.runStatements(["int d = Math.abs(7);"], vars); if (!A()) return;
    await this.bitSay("Seven is already a distance — abs() hands it back UNTOUCHED. This is the trap half the class falls into: abs doesn't 'flip signs.' It measures. Positives pass through whole.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(5500)]); if (!A()) return;
    this.hideBubble();
    this.wipeSlate(); this.clearVarContainers(); this.clearRail(); this.rescaleRail([-8, 8]);

    vars = {};
    this.updateSourceDisplay(["Math.abs(0);"]);
    this.updateExpressionMonitor("Math.abs(0);");
    await this.runStatements(["Math.abs(0);"], vars); if (!A()) return;
    await this.bitSay("Zero is zero steps from home — the shortest walk there is. And notice: nobody caught that answer. Computed, delivered, discarded — the plinth keeps no lost-and-found. Catch what you measure.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(5500)]); if (!A()) return;
    this.hideBubble();
    this.wipeSlate(); this.clearVarContainers(); this.clearRail(); this.rescaleRail([-8, 8]);

    vars = {};
    this.updateSourceDisplay(["int x = -3;", "int r = x.abs();"]);
    this.updateExpressionMonitor("int r = x.abs();");
    await this.runStatements(["int x = -3;", "int r = x.abs();"], vars); if (!A()) return;
    await this.bitSay("The wing's oldest law, holding in a new hall — numbers carry no instruments. The rail belongs to the Math class: Math.abs(x). The address never changes.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(6000)]); if (!A()) return;
    this.hideBubble();
    this.clearRound();
    this.wipeSlate(); this.clearVarContainers(); this.clearRail(); this.rescaleRail([-8, 8]);

    vars = {};
    this.updateSourceDisplay(["int gap = Math.abs(3 - 10);"]);
    this.updateExpressionMonitor("int gap = Math.abs(3 - 10);");
    await this.runStatements(["int gap = Math.abs(3 - 10);"], vars); if (!A()) return;
    await this.bitSay("The trilogy's treasure, first sight: abs of a DIFFERENCE is the distance BETWEEN two values. Three and ten stand seven apart — and the subtraction's minus sign never matters, because distance forgets direction. Real code measures every gap, every error, every tolerance exactly this way. The hall is yours, Surveyor — walk the rail!");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(6500)]); if (!A()) return;
    this.hideBubble();

    try { localStorage.setItem(TUTORIAL_KEY, "true"); } catch (_) {}
    this.wipeSlate(); this.clearVarContainers(); this.clearRail();
    this.updateSourceDisplay([]);
    this.updateExpressionMonitor("");
    this.updateResultRow(null, null);
    this.startRound(0);
  }

  // ══════════════════════════════════════════════════════════════
  // ROUND LIFECYCLE
  // ══════════════════════════════════════════════════════════════

  _extractNumbers(strOrArr) {
    const text = Array.isArray(strOrArr) ? strOrArr.join(" ") : String(strOrArr || "");
    const matches = text.match(/-?\d+\.?\d*/g) || [];
    return matches.map(Number).filter((n) => !isNaN(n));
  }

  _roundValueRange(config) {
    let nums = [];
    if (config.source) nums = nums.concat(this._extractNumbers(config.source));
    if (config.skeleton) nums = nums.concat(this._extractNumbers(config.skeleton));
    if (config.cartridges) nums = nums.concat(this._extractNumbers(config.cartridges.map((c) => c.code)));
    if (nums.length === 0) nums = [-10, 10];
    return nums;
  }

  startRound(index) {
    this.currentRound = index;
    const config = ROUNDS[index];
    this.roundAttempts = 0;
    this.roundStartTime = this.time.now;
    this.clearRound();
    this.clearVarContainers();
    this.clearRail();
    this.rescaleRail(this._roundValueRange(config));
    this.wipeSlate();
    this.updateResultRow(null, null);

    if (config.type === "predict") this.setupPredict(config);
    else if (config.type === "command") this.setupCommand(config);
  }

  clearRound() {
    this.roundElements.forEach((e) => { if (e && e.destroy) e.destroy(); });
    this.roundElements = [];
    this.slotContents = {};
    this.slotDefs = {};
    this.cartridges.forEach((c) => c.container.destroy());
    this.cartridges = [];
  }

  showQuestionCard(promptText) {
    const c = this.add.container(640, 560).setDepth(40).setAlpha(0);
    const g = this.add.graphics();
    g.fillStyle(0x0a0d18, 0.95);
    g.fillRoundedRect(-280, -40, 560, 80, 10);
    g.lineStyle(1, C_BRASS, 0.5);
    g.strokeRoundedRect(-280, -40, 560, 80, 10);
    const badge = this.add.circle(-250, -10, 16, C_BRASS);
    const badgeT = this.add.text(-250, -10, String(this.currentRound + 1), { font: "bold 14px Arial", color: "#060810" }).setOrigin(0.5);
    const t = this.add.text(-220, -10, promptText, { font: "14px Arial", color: "#e8eaf6", wordWrap: { width: 460 } }).setOrigin(0, 0.5);
    c.add([g, badge, badgeT, t]);
    this.tweens.add({ targets: c, alpha: 1, duration: 250 });
    this.roundElements.push(c);
    return c;
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE A/B — PREDICT
  // ══════════════════════════════════════════════════════════════

  setupPredict(config) {
    this.updateSourceDisplay(config.source);
    this.updateExpressionMonitor(config.source.join("  "));
    this.showQuestionCard(config.question);
    this.showOptionBubbles(config.options, config);
  }

  showOptionBubbles(options, config) {
    const shuffled = Phaser.Utils.Array.Shuffle(options.slice());
    const n = shuffled.length;
    const spacing = 270;
    const startX = 640 - ((n - 1) * spacing) / 2;
    shuffled.forEach((opt, i) => {
      const x = startX + i * spacing, y = 660;
      const c = this.add.container(x, y).setDepth(41);
      const g = this.add.graphics();
      const w = 250, h = 46;
      const draw = (stroke) => {
        g.clear();
        g.fillStyle(0x0a0d18, 1);
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
        g.lineStyle(2, stroke, 1);
        g.strokeRoundedRect(-w / 2, -h / 2, w, h, 10);
      };
      draw(C_BRASS);
      const label = opt.label || opt.value;
      const txt = this.add.text(0, 0, label, { font: "bold 12px Courier New", color: "#e8eaf6", wordWrap: { width: w - 20 }, align: "center" }).setOrigin(0.5);
      if (txt.height > h - 8) txt.setFontSize(10);
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
    const timeMs = Math.round(this.time.now - this.roundStartTime);
    const correct = opt.value === config.correct;
    this.logAttempt(config, correct, opt.value, opt.tag, timeMs);
    this.roundElements.forEach((e) => e.disableInteractive && e.disableInteractive());

    const g = bubbleContainer.list[0];
    g.clear();
    g.fillStyle(0x0a0d18, 1);
    g.fillRoundedRect(-125, -23, 250, 46, 10);
    g.lineStyle(2, correct ? C_GREEN_BRIGHT : C_RED, 1);
    g.strokeRoundedRect(-125, -23, 250, 46, 10);
    if (!correct) this.tweens.add({ targets: bubbleContainer, x: bubbleContainer.x + 5, duration: 35, yoyo: true, repeat: 4 });

    const vars = {};
    this._printedLines = [];
    await this.runStatements(config.source, vars);
    if (!this._alive) return;
    if (config.revealNote) this.createFloatingText(640, RAIL_Y - 150, config.revealNote, HEX_GRAY, "11px Arial", 2800);
    await this.delay(350);
    if (!this._alive) return;

    if (correct) {
      this.updateScore(this.scoreForAttempt(timeMs));
      this.updateCombo(true);
      if (this.roundAttempts === 1) this.correctFirstTry++;
      this.totalTime += timeMs;
      await this.delay(250);
      this.advanceRound();
    } else {
      this.loseLife();
      this.updateCombo(false);
      this.totalTime += timeMs;
      if (this.lives <= 0) { this.time.delayedCall(400, () => this.gameOver()); return; }
      await this.showBitFeedback(MISCONCEPTION_FEEDBACK[opt.tag] || "Not quite — trace the slate again.");
      if (!this._alive) return;
      this.advanceRound();
    }
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE D — SURVEYOR COMMAND
  // ══════════════════════════════════════════════════════════════

  setupCommand(config) {
    this.renderCommandSkeleton(config);
    this.updateExpressionMonitor(config.mission);
    this.showQuestionCard(config.mission);
    this.createCartridgeTray(config);
    this._commandFirstFail = true;
    this.inputLocked = false;
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

  renderCommandSkeleton(config) {
    this.sourceContainer.removeAll(true);
    this.slotDefs = {};
    const lines = config.skeleton;
    const fontSize = lines.length > 3 ? 12 : 14;
    const lineH = fontSize + 8;
    const startY = 145 - ((lines.length - 1) * lineH) / 2;
    lines.forEach((rawLine, i) => {
      const y = startY + i * lineH;
      const parts = rawLine.split(/<slot:(\w+)>/);
      const measured = [];
      let totalW = 0;
      parts.forEach((part, pi) => {
        if (pi % 2 === 0) {
          const tmp = this.add.text(0, 0, part, { font: `bold ${fontSize}px Courier New` });
          measured.push(tmp.width); totalW += tmp.width; tmp.destroy();
        } else { measured.push(170); totalW += 176; }
      });
      let x = 640 - totalW / 2;
      parts.forEach((part, pi) => {
        if (pi % 2 === 0) {
          if (part) {
            this._syntaxTokenize(part).forEach((tok) => {
              const t = this.add.text(x, y, tok.t, { font: `bold ${fontSize}px Courier New`, color: tok.c }).setOrigin(0, 0.5);
              this.sourceContainer.add(t);
              x += t.width;
            });
          }
        } else {
          const slotId = part;
          const w = 170, h = fontSize + 8;
          this.slotDefs[slotId] = { id: slotId, rect: { x, y: y - h / 2, w, h } };
          this._drawSlotPlaceholder(slotId, config);
          x += w + 6;
        }
      });
    });
  }

  _drawSlotPlaceholder(slotId, config) {
    const def = this.slotDefs[slotId];
    if (!def || !def.rect) return;
    if (def.dg) def.dg.destroy();
    if (def.hintLabel) { def.hintLabel.destroy(); def.hintLabel = null; }
    const { x, y, w, h } = def.rect;
    const dg = this.add.graphics().setDepth(16);
    const filled = (this.slotContents[slotId] || []).length > 0;
    const draw = (highlight) => {
      dg.clear();
      dg.fillStyle(0x0a0d18, 1);
      dg.fillRoundedRect(x, y, w, h, 4);
      if (filled) {
        dg.lineStyle(2, highlight ? 0xffab00 : 0x2a3654, 1);
        dg.strokeRoundedRect(x, y, w, h, 4);
      } else {
        dg.lineStyle(2, highlight ? 0xffab00 : C_BRASS, 0.6);
        this._dashedRectOutline(dg, x, y, w, h, 4, 3);
      }
    };
    draw(false);
    def.dg = dg;
    def.drawDash = draw;
    this.sourceContainer.add(dg);
    if (!filled) {
      const hintDef = (config || ROUNDS[this.currentRound]).slots.find((s) => s.id === slotId);
      const label = this.add.text(x + w / 2, y + h / 2, hintDef ? hintDef.hint : "", { font: "italic 9px Courier New", color: "#3d4450" }).setOrigin(0.5).setDepth(17);
      def.hintLabel = label;
      this.sourceContainer.add(label);
    }
  }

  createCartridgeTray(config) {
    const shuffled = Phaser.Utils.Array.Shuffle(config.cartridges.slice());
    let x = 60;
    const rowY = 600;
    shuffled.forEach((def) => {
      const style = { font: "bold 12px Courier New", color: HEX_CYAN };
      const label = def.label || def.code;
      const measure = this.add.text(0, 0, label, style);
      const w = measure.width + 18;
      measure.destroy();
      const home = { x: x + w / 2, y: rowY };
      x += w + 12;

      const c = this.add.container(home.x, home.y).setDepth(42);
      const bg = this.add.graphics();
      const draw = (stroke) => {
        bg.clear();
        bg.fillStyle(0x141a2c, 1);
        bg.fillRoundedRect(-w / 2, -14, w, 28, 7);
        bg.lineStyle(2, stroke, 1);
        bg.strokeRoundedRect(-w / 2, -14, w, 28, 7);
      };
      draw(C_BRASS);
      const txt = this.add.text(0, 0, label, style).setOrigin(0.5);
      c.add([bg, txt]);
      c.setSize(w, 28);
      c.setData("w", w);
      c.setData("code", def.code);
      c.setData("tag", def.tag || null);
      c.setData("slotId", def.slotId || null);
      c.setData("home", home);
      c.setData("draw", draw);
      c.setData("placedIn", null);
      c.setInteractive({ useHandCursor: true, draggable: true });
      c.on("pointerover", () => { if (!this.inputLocked) draw(C_GOLD); });
      c.on("pointerout", () => { if (!this.inputLocked) draw(C_BRASS); });
      this.cartridges.push({ container: c, def, home });
      this.roundElements.push(c);
    });

    const btn = this.add.container(640, 660).setDepth(42);
    const bg = this.add.graphics();
    const bdraw = (enabled, hover) => {
      bg.clear();
      bg.fillStyle(enabled ? C_BRASS : 0x2a2f36, hover && enabled ? 1 : 0.95);
      bg.fillRoundedRect(-65, -22, 130, 44, 22);
    };
    bdraw(false, false);
    const bt = this.add.text(0, 0, "SURVEY", { font: "bold 14px Arial", color: "#060810" }).setOrigin(0.5);
    btn.add([bg, bt]);
    btn.setSize(130, 44);
    btn.on("pointerover", () => { if (this._surveyReady) { bdraw(true, true); btn.setScale(1.03); } });
    btn.on("pointerout", () => { bdraw(this._surveyReady, false); btn.setScale(1); });
    btn.on("pointerdown", () => { if (this._surveyReady) this.onSurveyPressed(config); });
    this.surveyButton = { c: btn, draw: bdraw };
    this.roundElements.push(btn);
    this.disableSurveyButton();
  }

  enableSurveyButton() { this._surveyReady = true; this.surveyButton.draw(true, false); this.surveyButton.c.setInteractive({ useHandCursor: true }); }
  disableSurveyButton() { this._surveyReady = false; this.surveyButton.draw(false, false); this.surveyButton.c.disableInteractive(); }

  setupDragEvents() {
    this.input.on("dragstart", (pointer, obj) => {
      if (!this.cartridges.find((b) => b.container === obj) || this.inputLocked) return;
      obj.setDepth(90);
      this.tweens.add({ targets: obj, scale: 1.1, duration: 100 });
      const prevSlot = obj.getData("placedIn");
      if (prevSlot) {
        this.slotContents[prevSlot] = (this.slotContents[prevSlot] || []).filter((b) => b.container !== obj);
        obj.setData("placedIn", null);
        this._drawSlotPlaceholder(prevSlot);
        this.updateSurveyButtonState();
      }
    });
    this.input.on("drag", (pointer, obj, dragX, dragY) => {
      if (!this.cartridges.find((b) => b.container === obj) || this.inputLocked) return;
      obj.x = dragX; obj.y = dragY;
      this._updateSlotHover(obj);
    });
    this.input.on("dragend", (pointer, obj) => {
      if (!this.cartridges.find((b) => b.container === obj) || this.inputLocked) return;
      this._finishCartridgeDrag(obj);
    });
  }

  _nearestOpenSlot(x, y, forObj) {
    let best = null, bestDist = 80;
    const wantSlotId = forObj ? forObj.getData("slotId") : null;
    for (const id in this.slotDefs) {
      const def = this.slotDefs[id];
      if (!def || !def.rect) continue;
      if (wantSlotId && id !== wantSlotId) continue;
      const placed = this.slotContents[id] || [];
      if (placed.length >= 1) continue;
      const cx = def.rect.x + def.rect.w / 2, cy = def.rect.y + def.rect.h / 2;
      const dist = Phaser.Math.Distance.Between(x, y, cx, cy);
      const within = x >= def.rect.x - 50 && x <= def.rect.x + def.rect.w + 50 && y >= def.rect.y - 35 && y <= def.rect.y + def.rect.h + 35;
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
      obj.x = Phaser.Math.Linear(obj.x, def.rect.x + def.rect.w / 2, 0.25);
      obj.y = Phaser.Math.Linear(obj.y, def.rect.y + def.rect.h / 2, 0.25);
    }
  }

  _finishCartridgeDrag(obj) {
    obj.setDepth(42);
    this.tweens.add({ targets: obj, scale: 1, duration: 100 });
    const key = this._nearestOpenSlot(obj.x, obj.y, obj);
    if (this._dragHoverSlotKey && this.slotDefs[this._dragHoverSlotKey]) this.slotDefs[this._dragHoverSlotKey].drawDash(false);
    this._dragHoverSlotKey = null;

    if (key) {
      if (!this.slotContents[key]) this.slotContents[key] = [];
      this.slotContents[key].push({ container: obj });
      obj.setData("placedIn", key);
      const def = this.slotDefs[key];
      this.tweens.add({ targets: obj, x: def.rect.x + def.rect.w / 2, y: def.rect.y + def.rect.h / 2, duration: 150, ease: "Cubic.easeOut" });
      this._drawSlotPlaceholder(key);
      this.updateSurveyButtonState();
    } else {
      const home = obj.getData("home");
      this.tweens.add({ targets: obj, x: home.x, y: home.y, duration: 250, ease: "Back.easeOut" });
    }
  }

  updateSurveyButtonState() {
    const allFilled = Object.keys(this.slotDefs).every((id) => (this.slotContents[id] || []).length > 0);
    if (allFilled) this.enableSurveyButton(); else this.disableSurveyButton();
  }

  _substituteSkeleton(config, test) {
    return config.skeleton.map((line) => {
      const m = line.match(/^(int|double)\s+(\w+)\s*=\s*\/\* test \*\/;$/);
      if (m && test.substitutions && test.substitutions[m[2]] !== undefined) {
        return `${m[1]} ${m[2]} = ${test.substitutions[m[2]]};`;
      }
      const slotM = line.match(/<slot:(\w+)>/);
      if (slotM) {
        const code = this.slotContents[slotM[1]] && this.slotContents[slotM[1]][0] ? this.slotContents[slotM[1]][0].container.getData("code") : "";
        return line.replace(/<slot:\w+>/, code);
      }
      return line;
    });
  }

  _slotCodeUsed(slotId) {
    const placed = this.slotContents[slotId] && this.slotContents[slotId][0];
    return placed ? placed.container.getData("code") : null;
  }

  compileCheckCommand(assembled) {
    for (const slotId in assembled) {
      const code = assembled[slotId];
      const instanceMatch = code.match(/(\w+)\.abs\(/);
      if (instanceMatch && instanceMatch[1] !== "Math") {
        if (instanceMatch[1] === "math") return { ok: false, tag: "math_lowercase_belief", slotId };
        return { ok: false, tag: "instance_call_on_number_belief", slotId };
      }
    }
    return { ok: true };
  }

  async onSurveyPressed(config) {
    this.inputLocked = true;
    this.disableSurveyButton();
    this.roundAttempts++;
    const startTs = this.time.now;

    const assembled = {};
    const wrongEntries = [];
    for (const slotId in this.slotDefs) {
      const placed = this.slotContents[slotId] && this.slotContents[slotId][0];
      const code = placed ? placed.container.getData("code") : "";
      const tag = placed ? placed.container.getData("tag") : null;
      assembled[slotId] = code;
      if (tag) wrongEntries.push({ slotId, code, tag });
    }

    const compileResult = this.compileCheckCommand(assembled);
    if (!compileResult.ok) {
      this.showCompileErrorStamp();
      await this.delay(700);
      this._finishSurveyRun(config, false, compileResult.tag, Math.round(this.time.now - startTs));
      return;
    }

    const tests = config.tests;
    let allPass = true;
    const firstFailTag = wrongEntries[0] ? wrongEntries[0].tag : null;
    for (let ti = 0; ti < tests.length; ti++) {
      if (!this._alive) return;
      const test = tests[ti];
      this.clearVarContainers();
      this.clearRail();
      this.rescaleRail(this._roundValueRange(config));
      this.wipeSlate();
      this.updateResultRow(null, null);
      this._printedLines = [];
      const statements = this._substituteSkeleton(config, test);
      if (tests.length > 1) this.createFloatingText(640, 200, `TEST ${ti + 1}`, HEX_BRASS, "bold 12px Courier New", 1200);

      const vars = {};
      const runResult = await this.runStatements(statements, vars);
      if (!this._alive) return;

      let pass = runResult.ok;
      if (pass && test.expectedVariable) {
        const v = vars[test.expectedVariable.name];
        pass = v && Number(v.value) === Number(test.expectedVariable.value);
      }
      if (pass && test.expectedOutput !== undefined) {
        const output = this._printedLines.join("⏎");
        pass = output === test.expectedOutput;
      }
      this.createFloatingText(PLINTH_X, PLINTH_Y - 60, pass ? "✓" : "✗", pass ? HEX_GREEN_BRIGHT : HEX_RED, "bold 22px Arial", 900);
      if (!pass) { allPass = false; break; }
      await this.delay(350);
    }

    const timeMs = Math.round(this.time.now - startTs);
    this._finishSurveyRun(config, allPass, firstFailTag, timeMs);
  }

  _finishSurveyRun(config, allPass, tag, timeMs) {
    this.logAttempt(config, allPass, "cartridge", allPass ? null : tag, timeMs);

    if (allPass) {
      this.updateScore(this.scoreForAttempt(timeMs));
      this.updateCombo(true);
      if (this.roundAttempts === 1) this.correctFirstTry++;
      this.totalTime += timeMs;
      (async () => {
        const scenicOnly = (config.cartridges || []).filter((c) => c.alsoCorrect && !c.correct);
        let showNote = true;
        if (scenicOnly.length > 0) {
          showNote = scenicOnly.some((c) => Object.keys(this.slotDefs).some((id) => this._slotCodeUsed(id) === c.code));
        }
        if (config.postMissionNote && showNote) await this.showBitFeedback(config.postMissionNote);
        if (!this._alive) return;
        await this.delay(300);
        this.advanceRound();
      })();
    } else {
      const exploratory = this._commandFirstFail;
      this._commandFirstFail = false;
      this.totalTime += timeMs;
      (async () => {
        if (!exploratory) {
          this.loseLife();
          if (this.lives <= 0) { this.time.delayedCall(400, () => this.gameOver()); return; }
        }
        this.updateCombo(false);
        await this.showBitFeedback(MISCONCEPTION_FEEDBACK[tag] || config.revealNote || "The instrument ran exactly what you assembled — compare the slate against the mission and adjust.");
        if (!this._alive) return;
        this.inputLocked = false;
        this.clearVarContainers();
        this.clearRail();
        this.rescaleRail(this._roundValueRange(config));
        this.wipeSlate();
        this.updateResultRow(null, null);
        this.slotContents = {};
        this.renderCommandSkeleton(config);
        this.cartridges.forEach((cart) => {
          cart.container.setData("placedIn", null);
          const home = cart.container.getData("home");
          this.tweens.add({ targets: cart.container, x: home.x, y: home.y, duration: 200 });
        });
        this.disableSurveyButton();
      })();
    }
  }

  // ══════════════════════════════════════════════════════════════
  // HONEST EVALUATOR — Math.abs(x) int+double, the difference-distance
  // pattern, sums of measurements, println/equality/ternary
  // ══════════════════════════════════════════════════════════════

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

  /** Math.abs(argExpr) — dispatches to the difference-distance
   * choreography when the argument is a genuine "a - b" difference,
   * otherwise the standard single-value measurement. */
  async evalAbsCall(argExpr, vars) {
    const t = argExpr.trim();
    const parts = this._splitTopPM(t);
    if (parts.length === 2 && parts[1].op === "-") {
      const aRes = this._evalSimpleValue(parts[0].term, vars);
      if (!aRes.ok) return aRes;
      const bRes = this._evalSimpleValue(parts[1].term, vars);
      if (!bRes.ok) return bRes;
      return await this.runDifferenceMeasurement(aRes, bRes);
    }
    const r = this._evalSimpleValue(t, vars);
    if (!r.ok) return r;
    const isVar = /^[A-Za-z_]\w*$/.test(t) && vars && vars[t] !== undefined;
    return await this.runMeasurement(r.value, r.type, isVar ? { varName: t } : {});
  }

  async evalTerm(term, vars) {
    const t = term.trim();
    const absMatch = t.match(/^Math\.abs\((.*)\)$/);
    if (absMatch) return await this.evalAbsCall(absMatch[1], vars);
    return this._evalSimpleValue(t, vars);
  }

  /** Combines +/- separated terms (each possibly its own Math.abs(...)
   * measurement) into one value. Each intermediate measurement's chip
   * is consumed (faded) immediately so only the FINAL combined value
   * is left at the plinth for delivery — never orphaned. */
  async evalExpr(expr, vars) {
    const parts = this._splitTopPM(expr);
    if (parts.length === 0) return { ok: false, crash: "eval" };
    if (parts.length === 1) return await this.evalTerm(parts[0].term, vars);

    let total = 0, sawDouble = false;
    for (const p of parts) {
      const r = await this.evalTerm(p.term, vars);
      if (!r.ok) return r;
      if (this._plinthChip) {
        const c = this._plinthChip;
        this._plinthChip = null;
        this.tweens.add({ targets: c, alpha: 0, duration: 200, onComplete: () => c.destroy() });
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

  async evalPrintable(inner, vars) {
    const eqMatch = inner.match(/^(\w+)\s*==\s*(\w+)$/);
    if (eqMatch) {
      const a = vars[eqMatch[1]], b = vars[eqMatch[2]];
      const result = !!(a && b && a.value === b.value);
      return { ok: true, text: String(result) };
    }
    const ternMatch = inner.match(/^(\w+)\s*(<=|>=|<|>|==)\s*(-?\d+(?:\.\d+)?)\s*\?\s*"([^"]*)"\s*:\s*"([^"]*)"$/);
    if (ternMatch) {
      const lhs = vars[ternMatch[1]] ? Number(vars[ternMatch[1]].value) : NaN;
      const rhs = parseFloat(ternMatch[3]);
      let condTrue;
      switch (ternMatch[2]) {
        case "<=": condTrue = lhs <= rhs; break;
        case ">=": condTrue = lhs >= rhs; break;
        case "<": condTrue = lhs < rhs; break;
        case ">": condTrue = lhs > rhs; break;
        case "==": condTrue = lhs === rhs; break;
      }
      return { ok: true, text: condTrue ? ternMatch[4] : ternMatch[5] };
    }
    const parts = this._splitTopPlus(inner);
    if (parts.length > 1 || /^".*"$/.test(parts[0] || "")) {
      let out = "";
      for (const p of parts) {
        const pt = p.trim();
        if (/^".*"$/.test(pt)) { out += pt.slice(1, -1); continue; }
        const r = await this.evalExpr(pt, vars);
        if (!r.ok) return r;
        out += r.type === "double" ? Number(r.value).toFixed(1) : String(r.value);
      }
      return { ok: true, text: out };
    }
    const r = await this.evalExpr(inner, vars);
    if (!r.ok) return r;
    return { ok: true, text: r.type === "double" ? Number(r.value).toFixed(1) : String(r.value) };
  }

  async execStatement(line, vars) {
    const instanceMatch = line.match(/(\w+)\.abs\(/);
    if (instanceMatch && instanceMatch[1] !== "Math") {
      if (instanceMatch[1] === "math") {
        await this.nameplateDarkFlicker();
        return { ok: false, crash: "compile" };
      }
      const recv = vars[instanceMatch[1]];
      await this.markerShudder(recv ? recv.value : 0, recv ? recv.type : "int", instanceMatch[1]);
      return { ok: false, crash: "compile" };
    }

    const declVar = line.match(/^(int|double)\s+(\w+)\s*=\s*(.*);$/);
    if (declVar) {
      const varType = declVar[1], name = declVar[2], rhs = declVar[3].trim();
      const isAbsExpr = /Math\.abs\(/.test(rhs);
      const r = await this.evalExpr(rhs, vars);
      if (!r.ok) return r;
      vars[name] = { value: r.value, type: varType === "double" ? "double" : r.type };
      if (isAbsExpr) {
        if (this._plinthChip) await this.deliverToVariable(name, vars[name].value, vars[name].type);
      } else {
        await this.ensureVarMarker(name, vars[name].value, vars[name].type);
      }
      return { ok: true };
    }

    const printMatch = line.match(/^System\.out\.println\((.*)\);$/);
    if (printMatch) {
      const inner = printMatch[1].trim();
      const out = await this.evalPrintable(inner, vars);
      if (!out.ok) return out;
      if (!this._printedLines) this._printedLines = [];
      this._printedLines.push(out.text);
      await this.chalkWriteLine(`▸ ${out.text}`, HEX_CYAN);
      return { ok: true };
    }

    const bareMatch = line.match(/^(.*);$/);
    if (bareMatch) {
      const r = await this.evalExpr(bareMatch[1], vars);
      if (!r.ok) return r;
      await this.discardFade();
      return { ok: true };
    }
    return { ok: true };
  }

  async runStatements(lines, vars) {
    for (const raw of lines) {
      if (!this._alive) return { ok: true };
      const line = raw.trim();
      if (!line) continue;
      await this.chalkWriteLine(line, "#8ea6c8");
      const r = await this.execStatement(line, vars);
      if (!r.ok) return r;
    }
    return { ok: true };
  }

  // ══════════════════════════════════════════════════════════════
  // SCORING, LIVES, COMBO
  // ══════════════════════════════════════════════════════════════

  getComboMultiplier() { if (this.combo >= 5) return 3; if (this.combo >= 3) return 2; return 1; }

  scoreForAttempt(timeMs) {
    let points = 100 * this.getComboMultiplier();
    if (timeMs < 6000) points += 25;
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

  logAttempt(config, correct, selectedAnswer, misconceptionTag, timeMs) {
    this.roundAttempts = (this.roundAttempts || 0) + 1;
    this.attemptLog.push({
      round: config.round, type: config.type, concept: config.concept,
      correct, selectedAnswer, misconceptionTag: misconceptionTag || null,
      timeMs, attemptNumber: this.roundAttempts,
    });
  }

  advanceRound() {
    this.clearRound();
    const next = this.currentRound + 1;
    if (next >= ROUNDS.length) { this.levelComplete(); return; }
    this.time.delayedCall(700, () => { if (this._alive && !this.gameEnded) this.startRound(next); });
  }

  // ══════════════════════════════════════════════════════════════
  // END STATES
  // ══════════════════════════════════════════════════════════════

  gameOver() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearRound();
    this.hideBubble();

    (async () => {
      this.clearRail();
      this.wipeSlate();
      this._galleryLamps.forEach((l, i) => this.time.delayedCall(i * 150, () => { if (l.pool.active) this.tweens.add({ targets: l.pool, alpha: 0, duration: 400 }); }));
      const motes = this.ambient;
      this.ambient = null;
      (motes || []).forEach((m) => this.tweens.add({ targets: m, y: 632, alpha: 0, duration: 1500, ease: "Sine.easeIn" }));

      const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
      this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });
      const title = this.add.text(640, 240, "SURVEY ABANDONED", { font: "bold 36px Georgia", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
      this.tweens.add({ targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut", onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }) });
      this.add.text(640, 310, `Score: ${this.score}`, { font: "20px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
      this.add.text(640, 350, `Rounds Completed: ${this.currentRound} / 12`, { font: "16px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);
      this._makeButton(640, 420, "RETURN TO THE OBELISK", 260, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
    })();
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearRound();
    this.hideBubble();

    try { GameManager.completeLevel(57, Math.round((this.correctFirstTry / 12) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("math_abs_schema"); } catch (_) {}
    try {
      localStorage.setItem("level58_results", JSON.stringify({
        level: 58, concept: "math_abs", phase: "accretion",
        score: this.score, accuracy: this.correctFirstTry / 12, avgTime: this.totalTime / 12,
        comboMax: this.maxCombo, stars: this._starRating(), livesRemaining: this.lives,
        attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.hallFinale().then(() => { if (this._alive) this.showScoreTally(); });
  }

  async hallFinale() {
    const [leftBeam, rightBeam] = await Promise.all([
      this.extendBeam(this.obelisk.x, RAIL_X0, C_GOLD),
      this.extendBeam(this.obelisk.x, RAIL_X1, C_GOLD),
    ]);
    this._galleryLamps.forEach((l) => this.tweens.add({ targets: l.pool, alpha: 0.08, duration: 500, yoyo: true, repeat: 1 }));
    this.tweens.add({ targets: this.obeliskGlow, scale: 2, alpha: 0.5, duration: 600, yoyo: true });

    const fibs = [1, 2, 3, 5, 8];
    for (let i = 0; i < fibs.length; i++) {
      this.time.delayedCall(i * 120, () => {
        if (!this._alive) return;
        const chip = this.showLengthChip(RAIL_X0 + 100 + i * 180, fibs[i], "int");
        this.tweens.add({ targets: chip, y: chip.y - 40, alpha: 0, duration: 700, delay: 200, onComplete: () => chip.destroy() });
      });
    }
    await this.delay(1000);
    [leftBeam, rightBeam].forEach((b) => {
      this.tweens.add({ targets: [b.beam, b.glow], alpha: 0, duration: 400, onComplete: () => { b.beam.destroy(); b.glow.destroy(); } });
    });
    this.createConfetti(640, 300, 40);
    await this.delay(700);
  }

  getComboMultiplierFor(combo) { if (combo >= 5) return 3; if (combo >= 3) return 2; return 1; }

  _starRating() {
    const acc = this.correctFirstTry / 12;
    if (acc >= 0.9) return 3;
    if (acc >= 0.7) return 2;
    return 1;
  }

  showScoreTally() {
    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
    this.tweens.add({ targets: ov, fillAlpha: 0.85, duration: 500 });

    const panel = this.add.graphics().setDepth(90);
    panel.fillStyle(0x0a0d18, 1);
    panel.fillRoundedRect(360, 150, 560, 420, 16);
    panel.lineStyle(2, C_BRASS, 1);
    panel.strokeRoundedRect(360, 150, 560, 420, 16);

    const title = this.add.text(640, 190, "THE HALL SURVEYED", { font: "bold 32px Georgia", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(91).setScale(0);
    this.tweens.add({ targets: title, scale: 1, duration: 350, ease: "Back.easeOut" });

    const acc = Math.round((this.correctFirstTry / 12) * 100);
    const avgSec = (this.totalTime / 12 / 1000).toFixed(1);
    const lines = [`ACCURACY: ${acc}%`, `BEST COMBO: ×${this.getComboMultiplierFor(this.maxCombo)}`, `AVG TIME: ${avgSec}s`];
    lines.forEach((s, i) => {
      const t = this.add.text(500, 245 + i * 28, s, { font: "14px Arial", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 250, delay: 300 + i * 150 });
    });
    const totalText = this.add.text(500, 245 + 3 * 28, "TOTAL: 0", { font: "bold 24px Arial", color: HEX_GOLD }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: totalText, alpha: 1, duration: 250, delay: 750 });
    const counter = { v: 0 };
    this.tweens.add({ targets: counter, v: this.score, duration: 1000, delay: 750, onUpdate: () => totalText.setText(`TOTAL: ${Math.round(counter.v)}`) });

    const stars = this._starRating();
    for (let i = 0; i < 3; i++) {
      const earned = i < stars;
      const s = this.add.text(640 + (i - 1) * 60, 380, "★", { font: "40px Arial", color: earned ? HEX_GOLD : "#2a3040" }).setOrigin(0.5).setDepth(91).setScale(0);
      this.tweens.add({ targets: s, scale: 1, duration: 250, delay: 1350 + i * 200, ease: earned ? "Back.easeOut" : "Cubic.easeOut" });
    }

    const badge = this.add.container(640, 465).setDepth(91).setAlpha(0);
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillCircle(0, 0, 30);
    bg.lineStyle(3, C_GOLD, 1);
    bg.strokeCircle(0, 0, 30);
    bg.fillStyle(0x1a1408, 1);
    bg.lineStyle(1.5, C_GOLD, 1);
    bg.beginPath();
    bg.moveTo(-4, 10); bg.lineTo(4, 10); bg.lineTo(2, -6); bg.lineTo(0, -9); bg.lineTo(-2, -6);
    bg.closePath();
    bg.fillPath(); bg.strokePath();
    bg.lineStyle(2, C_CYAN, 0.9);
    bg.lineBetween(0, 4, 16, 4);
    bg.fillStyle(C_GOLD, 0.9);
    const pts = [];
    for (let i = 0; i < 8; i++) { const r = i % 2 === 0 ? 7 : 3; const a = (Math.PI / 4) * i - Math.PI / 2; pts.push(16 + Math.cos(a) * r, 4 + Math.sin(a) * r); }
    bg.fillPoints(pts, true);
    badge.add(bg);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 1950 });
    const badgeLbl = this.add.text(640, 505, "abs() SCHEMA ACQUIRED", { font: "bold 13px Georgia", color: HEX_GOLD }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: badgeLbl, alpha: 1, duration: 300, delay: 2100 });

    this._makeButton(500, 545, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(760, 545, "NEXT: The Survey Sprint →", 280, 44, { fill: 0x00733a, stroke: C_GREEN_BRIGHT, textColor: "#ffffff" }, () => {
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
