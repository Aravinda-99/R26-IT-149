import Phaser from "phaser";
import { GameManager } from "../../../../GameManager.js";
import { WellbeingAPI } from "../../../../../api/api.js";
import { BadgeSystem } from "../../../../BadgeSystem.js";
import { BehavioralRules } from "../../../../ml/BehavioralRules.js";
import { PanelFit } from "../../../../PanelFit.js";

const W = 1280, H = 720;

const C_CYAN = 0x4fc3f7, C_GOLD = 0xffd740, C_ORANGE = 0xff9800, C_BLUE_GRAY = 0x8ea6c8;
const C_GREEN_BRIGHT = 0x00e676, C_RED = 0xf44336, C_GRAY = 0x78909c, C_BRASS = 0xc8a05a;
const HEX_CYAN = "#4fc3f7", HEX_GOLD = "#ffd740", HEX_ORANGE = "#ff9800", HEX_BLUE_GRAY = "#8ea6c8";
const HEX_GREEN_BRIGHT = "#00e676", HEX_RED = "#f44336", HEX_GRAY = "#78909c", HEX_BRASS = "#c8a05a";

// Measurement form
const SLIP_X0 = 330, SLIP_X1 = 760, SLIP_Y0 = 110, SLIP_Y1 = 450;
const SLIP_CX = (SLIP_X0 + SLIP_X1) / 2, SLIP_CY = (SLIP_Y0 + SLIP_Y1) / 2;
// Measuring Tape (the timer)
const TAPE_X0 = SLIP_X0, TAPE_X1 = SLIP_X1, TAPE_Y = 92;
// Measuring Rail panel
const PANEL = { x: 800, y: 285, w: 450, h: 190 };
const RAIL_X0 = 835, RAIL_X1 = 1215, RAIL_Y = 410;
// Distance plinth
const PL_X = 1025, PL_Y = 560;
// Slate
const SLATE_X = 830, SLATE_Y = 80, SLATE_W = 400, SLATE_H = 190;

const TUTORIAL_KEY = "level59_tutorial_done";
const WAVE_TIME = { 1: 12000, 2: 10000, 3: 9000 };

const ROUNDS = [
  { round: 1, wave: 1, type: "predict",
    source: "int d = Math.abs(-12);",
    question: "What is stored in d?", correct: "12",
    options: [
      { value: "12", tag: null },
      { value: "-12", tag: "abs_returns_negative_belief" },
      { value: "144", tag: "abs_squares_belief" },
      { value: "24", tag: "abs_doubles_belief" }
    ],
    concept: "fluent_abs_negative" },

  { round: 2, wave: 1, type: "predict",
    source: "int d = Math.abs(0);",
    question: "What is stored in d?", correct: "0",
    options: [
      { value: "0", tag: null },
      { value: "1", tag: "abs_min_one_belief" },
      { value: "error", tag: "abs_of_zero_error_belief", label: "Runtime error" },
      { value: "-0", tag: "abs_returns_negative_belief" }
    ],
    concept: "fluent_abs_zero" },

  { round: 3, wave: 1, type: "predict",
    source: "int a = 7;\nint r = a.abs();",
    question: "What happens?", correct: "compile_error",
    options: [
      { value: "compile_error", tag: null, label: "COMPILE ERROR — int has no methods" },
      { value: "returns_7", tag: "instance_call_on_number_belief", label: "r = 7" },
      { value: "returns_minus7", tag: "instance_call_on_number_belief", label: "r = -7" },
      { value: "runtime_error", tag: "runtime_vs_compile_confusion", label: "Runtime exception" }
    ],
    revealNote: "The stability probe — at speed, the reflex must hold: numbers carry no instruments. Math.abs(a). The class name is the address, tonight and always.",
    concept: "fluent_static_probe" },

  { round: 4, wave: 1, type: "predict",
    source: "double r = Math.abs(-6);",
    question: "What is stored in r?", correct: "6.0",
    options: [
      { value: "6.0", tag: null },
      { value: "6", tag: "abs_type_ignored_belief" },
      { value: "-6.0", tag: "abs_returns_negative_belief" },
      { value: "compile_error", tag: "int_to_double_error_belief", label: "COMPILE ERROR — int into double" }
    ],
    revealNote: "abs hands back an int, and an int widens into a double without complaint — the variable is a double, so it holds 6.0.",
    concept: "fluent_abs_widening" },

  { round: 5, wave: 1, type: "predict",
    source: "int r = Math.abs(-3.5);",
    question: "What happens?", correct: "compile_error",
    options: [
      { value: "compile_error", tag: null, label: "COMPILE ERROR — double won't fit an int" },
      { value: "3", tag: "abs_double_to_int_belief", label: "r = 3" },
      { value: "3.5", tag: "int_stores_decimal_belief", label: "r = 3.5" },
      { value: "4", tag: "abs_rounds_belief", label: "r = 4" }
    ],
    revealNote: "abs keeps its argument's type. A double goes in, a double comes out — and a double can't be squeezed into an int variable.",
    concept: "fluent_abs_double_to_int" },

  { round: 6, wave: 2, type: "predict",
    source: "int a = 3;\nint b = 11;\nint gap = Math.abs(a - b);",
    question: "What is stored in gap?", correct: "8",
    options: [
      { value: "8", tag: null },
      { value: "-8", tag: "abs_returns_negative_belief" },
      { value: "14", tag: "abs_of_sum_belief" },
      { value: "3", tag: "abs_takes_first_belief" }
    ],
    revealNote: "3 - 11 is -8; the beam measures that from zero: 8. The gap between the markers, always positive.",
    concept: "gap_basic" },

  { round: 7, wave: 2, type: "predict",
    source: "int a = 11;\nint b = 3;\nint gap = Math.abs(a - b);",
    question: "What is stored in gap?", correct: "8",
    options: [
      { value: "8", tag: null },
      { value: "-8", tag: "difference_order_matters_belief" },
      { value: "14", tag: "abs_of_sum_belief" },
      { value: "0", tag: "abs_cancels_belief" }
    ],
    revealNote: "Swap the values and the difference lands on the OTHER side of zero — the beam reads the same length. Under abs, order is a matter of taste.",
    concept: "gap_reversed" },

  { round: 8, wave: 2, type: "predict",
    source: "int r = Math.abs(-3) + Math.abs(4);",
    question: "What is stored in r?", correct: "7",
    options: [
      { value: "7", tag: null },
      { value: "1", tag: "sum_inside_outside_confusion" },
      { value: "-7", tag: "abs_returns_negative_belief" },
      { value: "12", tag: "abs_multiplies_belief" }
    ],
    revealNote: "Two beams, then a sum: abs(-3) → 3, abs(4) → 4, and 3 + 4 → 7.",
    concept: "two_measurements_then_sum" },

  { round: 9, wave: 2, type: "predict",
    source: "int r = Math.abs(-3 + 4);",
    question: "What is stored in r?", correct: "1",
    options: [
      { value: "1", tag: null },
      { value: "7", tag: "sum_inside_outside_confusion" },
      { value: "-1", tag: "abs_returns_negative_belief" },
      { value: "3", tag: "abs_takes_first_belief" }
    ],
    revealNote: "One sum, then one beam: -3 + 4 → 1, and the beam measures 1. Read where the call CLOSES.",
    concept: "sum_then_measurement" },

  { round: 10, wave: 2, type: "predict",
    source: "double d = Math.abs(2.5 - 6);",
    question: "What is stored in d?", correct: "3.5",
    options: [
      { value: "3.5", tag: null },
      { value: "-3.5", tag: "abs_returns_negative_belief" },
      { value: "8.5", tag: "abs_of_sum_belief" },
      { value: "3.0", tag: "abs_rounds_belief" }
    ],
    revealNote: "2.5 - 6 is -3.5; the beam measures 3.5 — decimals intact, the double edition ran and returned the length whole.",
    concept: "gap_double" },

  { round: 11, wave: 3, type: "trace",
    source: 'int x = -9;\nint y = Math.abs(x);\nSystem.out.println(x + " " + y);',
    question: "What prints?", correct: "-9 9",
    options: [
      { value: "-9 9", tag: null },
      { value: "9 9", tag: "abs_modifies_variable_belief" },
      { value: "-9 -9", tag: "abs_returns_negative_belief" },
      { value: "9 -9", tag: "abs_flips_all_signs_belief" }
    ],
    revealNote: "abs measures x and hands back a NEW value for y — x itself never moved. x is still -9.",
    concept: "trace_abs_leaves_variable" },

  { round: 12, wave: 3, type: "trace",
    source: "int temp = 18;\nint target = 35;\nSystem.out.println(Math.abs(temp - target) <= 10);",
    question: "What prints?", correct: "false",
    options: [
      { value: "false", tag: null },
      { value: "true", tag: "signed_difference_belief" },
      { value: "17", tag: "condition_prints_number_belief" },
      { value: "-17", tag: "condition_prints_number_belief" }
    ],
    revealNote: "temp - target is -17 — and -17 <= 10 would be true. But the beam measures first: abs gives 17, and 17 <= 10 is false. Compare the DISTANCE, not the signed gap.",
    concept: "trace_abs_in_condition" },

  { round: 13, wave: 3, type: "trace",
    source: 'int guess = 42;\nint secret = 50;\nint off = Math.abs(guess - secret);\nif (off <= 10) System.out.println("Warm " + off);\nelse System.out.println("Cold " + off);',
    question: "What prints?", correct: "Warm 8",
    options: [
      { value: "Warm 8", tag: null },
      { value: "Cold 8", tag: "threshold_confusion" },
      { value: "Warm -8", tag: "abs_returns_negative_belief" },
      { value: "Cold -8", tag: "abs_returns_negative_belief" }
    ],
    revealNote: "off = |42 - 50| = 8, and 8 <= 10 — so the warm branch runs, printing the positive distance.",
    concept: "trace_abs_branch" },

  { round: 14, wave: 3, type: "bughunt",
    lines: ["int a = -12;", "int b = 5;", "int gap = Math.abs(a) - Math.abs(b);", "System.out.println(gap);", "// intent: the distance BETWEEN a and b"],
    faultToken: "Math.abs(a) - Math.abs(b)", faultLine: 3, tokenRegion: "expression",
    fix: "Math.abs(a - b)",
    explanation: "abs of a difference is NOT the difference of abs's. The first measures the gap between the markers (17); the second measures each from zero and subtracts (7). Different questions, different answers.",
    wrongTag: "abs_distributes_belief",
    revealNote: "Dual-future reveal: the buggy run measures 12 and 5 from zero and subtracts — 7, not the true gap. Reset; the fixed run measures -17 from zero: 17.",
    concept: "abs_distributes_bug" },

  { round: 15, wave: 3, type: "bughunt",
    lines: ["double depth = -4.5;", "int dist = Math.abs(depth);", "System.out.println(dist);", "// intent: the distance, decimals kept"],
    faultToken: "int", faultLine: 2, tokenRegion: "type_keyword",
    fix: "double",
    explanation: "abs keeps its argument's type — a double goes in, a double comes out, and an int variable can't hold it. The variable must be a double.",
    wrongTag: "abs_double_to_int_belief",
    revealNote: "Dual-future reveal: the buggy run stops at compile time — a double can't squeeze into int. Reset; the fixed run measures 4.5 and keeps its decimals.",
    concept: "double_into_int_bug" },
];

const MISCONCEPTION_FEEDBACK = {
  instance_call_on_number_belief: "At speed, the reflex must hold — numbers carry no instruments. Math dot abs, tonight and always.",
  runtime_vs_compile_confusion: "Bad syntax and forbidden calls die at COMPILE time — before anything runs.",
  abs_returns_negative_belief: "The beam cannot read a negative — distances start at zero and go up. Whatever enters, what returns is ≥ 0, always.",
  abs_squares_belief: "The beam does no arithmetic — it reads a length. One argument in, its distance out, nothing multiplied.",
  abs_doubles_belief: "The beam does no arithmetic — it reads a length. One argument in, its distance out, nothing multiplied.",
  abs_multiplies_belief: "The beam does no arithmetic — it reads a length. One argument in, its distance out, nothing multiplied.",
  abs_min_one_belief: "No minimum — the shortest distance is 0, and abs(0) reports it honestly.",
  abs_of_zero_error_belief: "Zero is a fine question — zero steps from home, answer 0, no error, no drama.",
  abs_type_ignored_belief: "The VARIABLE is a double, so it prints with its decimal point — 6.0. The int result widens on its way in.",
  int_to_double_error_belief: "An int slips into a double variable without complaint — widening is automatic. Only the other direction is forbidden.",
  abs_double_to_int_belief: "No rounding, no trimming, no automatic conversion down — abs(-3.5) is a double, and a double can't be stored in an int.",
  int_stores_decimal_belief: "An int variable can't hold a decimal — that line never compiles, so nothing is stored at all.",
  abs_rounds_belief: "No rounding, no trimming — decimals come back whole. abs touches the SIGN's meaning, never the digits.",
  abs_of_sum_belief: "The gap is a difference, not a sum — a minus between the values, then the beam. Subtract first, measure second.",
  abs_takes_first_belief: "abs reads the WHOLE argument — the arithmetic inside resolves first, and only the finished value is measured.",
  difference_order_matters_belief: "Watch both reveals — the difference lands on opposite sides of zero, and BOTH beams read the same length. Under abs, subtraction order is a matter of taste.",
  abs_cancels_belief: "A gap between different values is never zero — 11 and 3 are 8 steps apart, whichever you list first.",
  sum_inside_outside_confusion: "Parentheses decide what gets measured — abs(-3) + abs(4) is two beams then a sum (7); abs(-3 + 4) is one sum then one beam (1). Read where the call closes.",
  abs_modifies_variable_belief: "The marker never moved — abs measures the value and leaves it exactly where it stood. The distance is a NEW value; x is untouched.",
  abs_flips_all_signs_belief: "abs doesn't FLIP anything — it MEASURES. x keeps its sign; only the returned distance is positive.",
  signed_difference_belief: "Compare the DISTANCE, not the signed gap — the beam measures first: abs gives 17, and 17 <= 10 is false.",
  condition_prints_number_belief: "A comparison prints true or false — never the number inside it. The distance is only compared, not displayed.",
  threshold_confusion: "off is 8 and the threshold is 10 — 8 <= 10 holds, so the first branch runs.",
  abs_distributes_belief: "abs of a difference is NOT the difference of abs's — the first measures the gap between the markers; the second measures each from zero and subtracts. Different questions, different answers.",
  timeout: "The tape ran out! Fluent surveyors log before the tape snaps back. Verdict first, doubt later.",
};

export class Level59Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level59Scene" });
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
    this._bugHuntTokenObjs = [];
    this.baseTutorialScene = "Level58Scene";
  }

  preload() {}

  create() {
    this._alive = true;
    this.createParticleTexture();
    this.createBackground();
    this.createHall();
    this.createBanner();
    this.createForm();
    this.createTape();
    this.createRail();
    this.createSlate();
    this.createHUD();
    this.createBit();

    this.events.on("shutdown", () => { this._alive = false; this._killTimer(); });
    this.checkTutorial();
  }

  update() {
    if (GameManager.interventionInFlight) {
      if (this._timerTween && !this._timerTween.isPaused()) {
        this._timerTween.pause();
        this._timerHalted = true;
      }
      return;
    } else if (this._timerTween && this._timerTween.isPaused()) {
      this._timerTween.resume();
      this._timerHalted = false;
    }
    this.updateTape();
    this.updateAmbient();
  }

  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }
  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }

  createParticleTexture() {
    if (!this.textures.exists("l59_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l59_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x04060c).setDepth(0);
  }

  createHall() {
    const g = this.add.graphics().setDepth(1);
    // colonnade
    g.fillStyle(0x0a0d18, 1);
    g.lineStyle(1.5, 0x2a3654, 1);
    [150, 270].forEach((x) => { g.fillRect(x - 14, 150, 28, 485); g.strokeRect(x - 14, 150, 28, 485); });
    // floor with a measuring-ruler edge
    g.fillStyle(0x0a0d18, 1);
    g.fillRect(0, 635, W, 85);
    g.lineStyle(1, 0x2a3654, 1);
    g.lineBetween(0, 637, W, 637);
    for (let x = 0; x < W; x += 20) {
      const major = x % 100 === 0;
      g.lineStyle(1, 0x2a3654, major ? 0.8 : 0.35);
      g.lineBetween(x, 637, x, major ? 654 : 645);
    }
    this._motes = [];
    const colors = [0x8ea6c8, 0xe8eaf6, 0xc8a05a];
    for (let i = 0; i < 7; i++) {
      this._motes.push(this.add.circle(Phaser.Math.Between(0, W), Phaser.Math.Between(150, 630), 1, Phaser.Utils.Array.GetRandom(colors), Phaser.Math.FloatBetween(0.02, 0.04)).setDepth(2));
    }
  }

  updateAmbient() {
    if (!this._motes) return;
    this._motes.forEach((p, i) => {
      p.y += 0.006 * (i % 2 === 0 ? 1 : -0.6);
      if (p.y > 630) p.y = 150; if (p.y < 150) p.y = 630;
    });
  }

  createBanner() {
    const g = this.add.graphics().setDepth(2);
    g.fillStyle(0x04060c, 1);
    g.lineStyle(1, C_BRASS, 0.5);
    g.fillRoundedRect(400, 12, 360, 26, 3);
    g.strokeRoundedRect(400, 12, 360, 26, 3);
    this.add.text(580, 25, "T H E   D I S T A N C E   T R I A L S", { font: "bold 15px Georgia", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.7).setDepth(3);
  }

  createAnnotation(x, y, text, colorHex) {
    const t = this.add.text(x, y, text, { font: "italic 18px Arial", color: colorHex, wordWrap: { width: 380 }, align: "center" }).setOrigin(0.5).setDepth(70).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 200 });
    this.time.delayedCall(2200, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() }); });
    return t;
  }

  createFloatingText(x, y, text, colorHex, font = "bold 18px Arial", hold = 1400) {
    font = font.replace(/(\d+)px/, (_, n) => Math.max(18, +n) + "px"); // keep small call-site fonts legible
    const t = this.add.text(x, y, text, { font, color: colorHex, wordWrap: { width: 460 }, align: "center" }).setOrigin(0.5).setDepth(31).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 180 });
    this.time.delayedCall(hold, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() }); });
    return t;
  }

  createConfetti(x, y, count = 30) {
    const p = this.add.particles(x, y, "l59_dot", {
      speed: { min: 80, max: 240 }, angle: { min: 0, max: 360 }, scale: { start: 0.9, end: 0 }, lifespan: 500,
      tint: [C_BRASS, C_GOLD, C_RED, C_CYAN, 0xffffff], emitting: false,
    }).setDepth(75);
    p.explode(count);
    this.time.delayedCall(900, () => p.destroy());
  }

  screenShake(intensity = 0.004, duration = 150) {
    this.cameras.main.shake(duration, intensity);
  }

  createForm() {
    const g = this.add.graphics().setDepth(20);
    g.fillStyle(0xe0d6b8, 1);
    g.lineStyle(2, 0x8a6435, 1);
    g.fillRoundedRect(SLIP_X0, SLIP_Y0, SLIP_X1 - SLIP_X0, SLIP_Y1 - SLIP_Y0, 4);
    g.strokeRoundedRect(SLIP_X0, SLIP_Y0, SLIP_X1 - SLIP_X0, SLIP_Y1 - SLIP_Y0, 4);
    g.fillStyle(0x8a6435, 0.15);
    g.fillRect(SLIP_X0, SLIP_Y0, SLIP_X1 - SLIP_X0, 24);
    g.lineStyle(1, 0x8a6435, 0.15);
    for (let y = SLIP_Y0 + 48; y < SLIP_Y1 - 44; y += 20) g.lineBetween(SLIP_X0 + 16, y, SLIP_X1 - 16, y);

    this.add.text(SLIP_CX, SLIP_Y0 + 12, "MEASUREMENT FORM — 59", { font: "bold 10px Georgia", color: "#8a6435" }).setOrigin(0.5).setDepth(21);
    this.slipRoundLabel = this.add.text(SLIP_X1 - 14, SLIP_Y0 + 12, "MEASURE 1/15", { font: "bold 11px Courier New", color: "#8a6435" }).setOrigin(1, 0.5).setDepth(21);
    this.slipContentContainer = this.add.container(0, 0).setDepth(21);
    this.slipQuestionText = this.add.text(SLIP_CX, SLIP_Y1 - 26, "", { font: "bold 14px Georgia", color: "#241a0e", wordWrap: { width: SLIP_X1 - SLIP_X0 - 40 }, align: "center" }).setOrigin(0.5).setDepth(21);
    this.slipStampLayer = this.add.container(SLIP_CX, SLIP_CY).setDepth(35);
  }

  clearSlipContent() {
    this.slipContentContainer.removeAll(true);
    this.slipQuestionText.setText("");
    this.slipStampLayer.removeAll(true);
  }

  showTrialOnSlip(lines, questionText) {
    this.clearSlipContent();
    const maxLen = Math.max(...lines.map((l) => l.length));
    const fontSize = maxLen > 42 ? 10 : maxLen > 30 ? 12 : 14;
    const lineH = fontSize + 11;
    const startY = SLIP_Y0 + 60 + Math.max(0, (3 - lines.length)) * (lineH / 2);
    lines.forEach((line, i) => {
      const y = startY + i * lineH;
      if (line.trim().startsWith("//")) {
        const t = this.add.text(SLIP_CX, y, line, { font: `italic ${fontSize}px Courier New`, color: "#8a6435" }).setOrigin(0.5).setAlpha(0);
        this.slipContentContainer.add(t);
        this.tweens.add({ targets: t, alpha: 1, duration: 180 });
        return;
      }
      const tokens = this._codeTokenize(line);
      const measured = tokens.map((tk) => { const tmp = this.add.text(0, 0, tk.t, { font: `bold ${fontSize}px Courier New` }); const w = tmp.width; tmp.destroy(); return w; });
      const totalW = measured.reduce((a, b) => a + b, 0);
      let x = SLIP_CX - totalW / 2;
      tokens.forEach((tok, ti) => {
        const t = this.add.text(x, y, tok.t, { font: `bold ${fontSize}px Courier New`, color: tok.c }).setOrigin(0, 0.5).setAlpha(0);
        this.slipContentContainer.add(t);
        this.tweens.add({ targets: t, alpha: 1, duration: 180 });
        x += measured[ti];
      });
    });
    if (questionText) this.slipQuestionText.setText(questionText);
  }

  _codeTokenize(line) {
    const tokens = [];
    const re = /("(?:[^"\\]|\\.)*")|(\bint\b|\bdouble\b|\bboolean\b|\bif\b|\belse\b|\bnew\b)|(\bMath\b|\bSystem\b)|(\babs\b|\bprintln\b)|(-?\d+\.\d+|-?\d+)|([(){};,=+.<>!*/-])/g;
    let last = 0, m;
    const plain = (t) => t && tokens.push({ t, c: "#241a0e" });
    while ((m = re.exec(line))) {
      if (m.index > last) plain(line.slice(last, m.index));
      if (m[1]) tokens.push({ t: m[1], c: "#2e7d32" });
      else if (m[2]) tokens.push({ t: m[2], c: "#1565c0" });
      else if (m[3]) tokens.push({ t: m[3], c: "#b8860b" });
      else if (m[4]) tokens.push({ t: m[4], c: "#1565c0" });
      else if (m[5]) tokens.push({ t: m[5], c: "#e65100" });
      else if (m[6]) tokens.push({ t: m[6], c: /[()]/.test(m[6]) ? "#c62828" : "#78909c" });
      last = m.index + m[0].length;
    }
    if (last < line.length) plain(line.slice(last));
    return tokens.length ? tokens : [{ t: line, c: "#241a0e" }];
  }

  async stampSlip(kind) {
    const labels = { logged: "MEASUREMENT LOGGED", misread: "MISREAD", missed: "TAPE RAN OUT" };
    const colors = { logged: HEX_GREEN_BRIGHT, misread: HEX_RED, missed: HEX_RED };
    const stamp = this.add.text(0, 0, labels[kind], { font: "bold 21px Georgia", color: colors[kind] }).setOrigin(0.5).setScale(1.4).setAngle(-8).setAlpha(0);
    this.slipStampLayer.add(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 180 });
    const hold = kind === "missed" ? 1800 : 700;
    await this.delay(hold);
    if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 200, onComplete: () => stamp.destroy() });
  }

  createTape() {
    this.tapeGfx = this.add.graphics().setDepth(22);
    this.add.text(TAPE_X0, TAPE_Y - 14, "MEASURING TAPE", { font: "bold 9px Georgia", color: HEX_BRASS }).setAlpha(0.6).setDepth(22);
    this._tProgress = 0;
    this._warnState = "safe";
    this._drawTape(1, C_CYAN);
  }

  _drawTape(frac, color, alpha = 1) {
    const g = this.tapeGfx;
    g.clear();
    g.fillStyle(0x0a0d18, 1);
    g.lineStyle(1.5, C_BRASS, 1);
    g.fillRoundedRect(TAPE_X0, TAPE_Y - 5, TAPE_X1 - TAPE_X0, 10, 3);
    g.strokeRoundedRect(TAPE_X0, TAPE_Y - 5, TAPE_X1 - TAPE_X0, 10, 3);
    const inner = TAPE_X1 - TAPE_X0 - 4;
    if (frac > 0) {
      g.fillStyle(color, alpha);
      g.fillRoundedRect(TAPE_X0 + 2, TAPE_Y - 3, inner * frac, 6, 2);
    }
    g.lineStyle(1, 0x04060c, 0.7);
    for (let i = 1; i < 10; i++) {
      const x = TAPE_X0 + 2 + (inner * i) / 10;
      g.lineBetween(x, TAPE_Y - 3, x, TAPE_Y + 3);
    }
  }

  startTimer(timeLimitMs) {
    this._killTimer();
    this.roundTimeLimit = timeLimitMs;
    this._tProgress = 0;
    this._timerHalted = false;
    this._warnState = "safe";
    this._drawTape(1, C_CYAN);
    const state = { v: 0 };
    this._timerTween = this.tweens.add({
      targets: state, v: 1, duration: timeLimitMs, ease: "Linear",
      onUpdate: () => { this._tProgress = state.v; },
      onComplete: () => { if (this._alive && !this._timerHalted) this.onTimeout(this._currentConfig); },
    });
  }

  _killTimer() {
    if (this._timerTween) { this._timerTween.stop(); this._timerTween = null; }
    this._pulseAlpha = 1;
    if (this._pulseTween) { this._pulseTween.stop(); this._pulseTween = null; }
  }

  updateTape() {
    if (!this.tapeGfx || this._timerHalted || !this._timerTween) return;
    const rem = 1 - (this._tProgress || 0);
    const state = rem <= 0.15 ? "critical" : rem <= 0.33 ? "warning" : "safe";
    if (state !== this._warnState) {
      this._warnState = state;
      if (this._pulseTween) { this._pulseTween.stop(); this._pulseTween = null; }
      this._pulseAlpha = 1;
      if (state === "critical") {
        const o = { v: 1 };
        this._pulseTween = this.tweens.add({ targets: o, v: 0.45, duration: 320, yoyo: true, repeat: -1, onUpdate: () => { this._pulseAlpha = o.v; } });
      }
    }
    const color = state === "critical" ? C_RED : state === "warning" ? C_ORANGE : C_CYAN;
    this._drawTape(rem, color, state === "critical" ? this._pulseAlpha : 1);
  }

  async haltTimerAndCapture() {
    this._timerHalted = true;
    this._killTimer();
    const frac = Math.max(0, 1 - (this._tProgress || 0));
    this._drawTape(frac, C_GOLD);
    await this.delay(150);
  }

  async tapeRunsOut() {
    this._timerHalted = true;
    this._drawTape(0, C_RED);
    await this.delay(300);
    await this.stampSlip("missed");
  }

  createRail() {
    const g = this.add.graphics().setDepth(12);
    g.fillStyle(0x0a0d18, 1);
    g.lineStyle(2, C_BRASS, 1);
    g.fillRoundedRect(PANEL.x, PANEL.y, PANEL.w, PANEL.h, 8);
    g.strokeRoundedRect(PANEL.x, PANEL.y, PANEL.w, PANEL.h, 8);
    this.add.text(PANEL.x + 12, PANEL.y + 8, "MEASURING RAIL", { font: "bold 11px Georgia", color: HEX_BRASS }).setDepth(13);

    const p = this.add.graphics().setDepth(12);
    p.fillStyle(0x0a0d18, 1);
    p.lineStyle(1.5, C_BRASS, 1);
    p.fillCircle(PL_X, PL_Y, 16);
    p.strokeCircle(PL_X, PL_Y, 16);
    this.add.text(PL_X, PL_Y, "|x|", { font: "bold 12px Courier New", color: HEX_BRASS }).setOrigin(0.5).setDepth(13);
    this.add.text(PL_X, PL_Y + 30, "the distance returned", { font: "italic 11px Georgia", color: HEX_GRAY }).setOrigin(0.5).setDepth(13).setAlpha(0.7);

    this.railGfx = this.add.graphics().setDepth(14);
    this.railLabels = this.add.container(0, 0).setDepth(15);
    this.railMarkers = this.add.container(0, 0).setDepth(16);
    this.plinthLayer = this.add.container(0, 0).setDepth(17);
    this._drawIdleRail();
  }

  _drawIdleRail() {
    this.railGfx.clear();
    this.railGfx.lineStyle(2, C_BRASS, 0.6);
    this.railGfx.lineBetween(RAIL_X0, RAIL_Y, RAIL_X1, RAIL_Y);
  }

  _niceStep(raw) {
    const pow = Math.pow(10, Math.floor(Math.log10(Math.max(raw, 0.0001))));
    const n = raw / pow;
    const step = n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10;
    return step * pow;
  }

  clearRail() {
    this.railMarkers.removeAll(true);
    this.railLabels.removeAll(true);
    this._drawIdleRail();
  }

  clearPlinth() {
    this.plinthLayer.removeAll(true);
  }

  _makeStar(value, type, x, y) {
    const c = this.add.container(x, y);
    const g = this.add.graphics();
    const color = type === "double" ? C_ORANGE : C_GOLD;
    g.fillStyle(color, 0.9);
    g.lineStyle(1, Phaser.Display.Color.IntegerToColor(color).darken(30).color, 1);
    const pts = [];
    for (let i = 0; i < 8; i++) { const r = i % 2 === 0 ? 13 : 6; const a = (Math.PI / 4) * i - Math.PI / 2; pts.push(Math.cos(a) * r, Math.sin(a) * r); }
    g.fillPoints(pts, true);
    g.strokePoints(pts, true);
    const txt = this.add.text(0, -20, this._fmtNum(value, type), { font: "bold 11px Courier New", color: type === "double" ? HEX_ORANGE : HEX_GOLD }).setOrigin(0.5);
    c.add([g, txt]);
    return c;
  }

  _tweenValue(from, to, duration, ease, onUpdate) {
    return new Promise((res) => {
      const o = { v: from };
      this.tweens.add({ targets: o, v: to, duration, ease, onUpdate: () => onUpdate(o.v), onComplete: res });
    });
  }

  async measure(arg) {
    const v = Number(arg.v), dist = Math.abs(v);
    this.clearRail();
    this.clearPlinth();

    let lo = Math.min(v, 0), hi = Math.max(v, 0);
    if (hi - lo < 1) { lo -= 1; hi += 1; }
    const pad = (hi - lo) * 0.12;
    lo -= pad; hi += pad;
    const toX = (val) => RAIL_X0 + ((val - lo) / (hi - lo)) * (RAIL_X1 - RAIL_X0);
    const zx = toX(0), vx = toX(v);

    // ticks
    const tickStep = this._niceStep((hi - lo) / 8);
    for (let t = Math.ceil(lo / tickStep) * tickStep; t <= hi; t += tickStep) {
      const x = toX(t);
      const isZero = Math.abs(t) < 1e-9;
      if (isZero) continue;
      this.railGfx.lineStyle(1, C_BRASS, 0.4);
      this.railGfx.lineBetween(x, RAIL_Y - 5, x, RAIL_Y + 5);
      const lbl = this.add.text(x, RAIL_Y + 13, String(Math.round(t * 10) / 10), { font: "11px Courier New", color: HEX_BLUE_GRAY }).setOrigin(0.5).setAlpha(0.7);
      this.railLabels.add(lbl);
    }
    // zero obelisk
    this.railGfx.fillStyle(C_BRASS, 0.9);
    this.railGfx.fillTriangle(zx - 7, RAIL_Y + 7, zx + 7, RAIL_Y + 7, zx, RAIL_Y - 34);
    this.railLabels.add(this.add.text(zx, RAIL_Y + 18, "0", { font: "bold 12px Courier New", color: HEX_BRASS }).setOrigin(0.5));

    // marker drops
    const star = this._makeStar(arg.v, arg.t, vx, RAIL_Y - 62);
    star.setAlpha(0);
    this.railMarkers.add(star);
    await new Promise((res) => this.tweens.add({ targets: star, y: RAIL_Y - 20, alpha: 1, duration: 170, ease: "Bounce.easeOut", onComplete: res }));
    if (!this._alive) return;

    // beam: zero → marker
    const beam = this.add.graphics();
    this.railMarkers.add(beam);
    const dir = vx >= zx ? 1 : -1;
    const fullLen = Math.abs(vx - zx);
    await this._tweenValue(0, fullLen, 200, "Cubic.easeOut", (len) => {
      beam.clear();
      beam.fillStyle(C_CYAN, 0.85);
      if (dir > 0) beam.fillRect(zx, RAIL_Y - 10, len, 5);
      else beam.fillRect(zx - len, RAIL_Y - 10, len, 5);
    });
    if (!this._alive) return;
    if (dist === 0) {
      const flash = this.add.circle(zx, RAIL_Y - 10, 5, C_CYAN, 0.9);
      this.railMarkers.add(flash);
      this.tweens.add({ targets: flash, scale: 3, alpha: 0, duration: 260 });
    }

    // the length detaches — always rightward, always positive
    const distC = this.add.container(0, 0);
    this.plinthLayer.add(distC);
    const bar = this.add.graphics();
    bar.fillStyle(C_GOLD, 0.95);
    if (fullLen > 0) bar.fillRect(zx, RAIL_Y + 34, fullLen, 8);
    else bar.fillCircle(zx, RAIL_Y + 38, 4);
    const lbl = this.add.text(zx + fullLen / 2, RAIL_Y + 28, `|${this._fmtNum(arg.v, arg.t)}| = ${this._fmtNum(dist, arg.t)}`, { font: "bold 11px Courier New", color: HEX_GOLD }).setOrigin(0.5, 1);
    distC.add([bar, lbl]);
    distC.setAlpha(0);
    await new Promise((res) => this.tweens.add({ targets: distC, alpha: 1, duration: 140, onComplete: res }));
    await this.delay(80);
    if (!this._alive) return;
    const dx = PL_X - (zx + fullLen / 2);
    const dy = (PL_Y - 28) - (RAIL_Y + 38);
    await new Promise((res) => this.tweens.add({ targets: distC, x: dx, y: dy, duration: 230, ease: "Sine.easeIn", onComplete: res }));
    if (!this._alive) return;
    this.tweens.add({ targets: beam, alpha: 0.25, duration: 200 });

    this.chalkEvaluationArrow(dist, arg.t);
    this.updateResultRow(dist, arg.t);
    return { v: dist, t: arg.t };
  }

  _fmtNum(value, type) {
    if (type === "double") return this._fmtDouble(Number(value));
    return String(value);
  }

  _fmtDouble(n) {
    const r = Math.round(n * 1e10) / 1e10;
    return Number.isInteger(r) ? r.toFixed(1) : String(r);
  }

  createSlate() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0a0d18, 1);
    g.lineStyle(2, C_BRASS, 1);
    g.fillRoundedRect(SLATE_X, SLATE_Y, SLATE_W, SLATE_H, 8);
    g.strokeRoundedRect(SLATE_X, SLATE_Y, SLATE_W, SLATE_H, 8);
    this.add.text(SLATE_X + 12, SLATE_Y + 10, "SURVEY SLATE", { font: "bold 11px Georgia", color: HEX_BRASS }).setDepth(11);
    this.slateLines = this.add.container(0, 0).setDepth(11);
    this._slateY = SLATE_Y + 30;
    this.add.text(SLATE_X + 12, SLATE_Y + SLATE_H - 20, "result:", { font: "12px Georgia", color: "#8a6435" }).setDepth(11);
    this.resultText = this.add.text(SLATE_X + 58, SLATE_Y + SLATE_H - 20, "—", { font: "bold 14px Courier New", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(11);
  }

  _slateAdvance() {
    this._slateY += 16;
    if (this._slateY > SLATE_Y + SLATE_H - 34) {
      this.slateLines.removeAll(true);
      this._slateY = SLATE_Y + 30;
    }
  }

  async chalkWriteLine(text, color) {
    const t = this.add.text(SLATE_X + 12, this._slateY, "", { font: "bold 12px Courier New", color: color || "#e8eaf6" }).setDepth(11);
    this.slateLines.add(t);
    for (let i = 0; i < text.length; i++) {
      if (!this._alive || !t.active) return;
      t.setText(t.text + text[i]);
      if (t.width > SLATE_W - 24) t.setFontSize(9);
      await this.delay(12);
    }
    this._slateAdvance();
  }

  chalkEvaluationArrow(value, type) {
    const t = this.add.text(SLATE_X + 12, this._slateY, `   abs → ${this._fmtNum(value, type)}`, { font: "bold 12px Courier New", color: type === "double" ? HEX_ORANGE : HEX_GOLD }).setAlpha(0);
    this.slateLines.add(t);
    this.tweens.add({ targets: t, alpha: 1, duration: 120 });
    this._slateAdvance();
  }

  wipeSlate() {
    this.slateLines.removeAll(true);
    this._slateY = SLATE_Y + 30;
  }

  updateResultRow(value, type) {
    if (value === null || value === undefined) { this.resultText.setFontSize(12).setText("—").setColor(HEX_GRAY); return; }
    if (type === "crash") { this.resultText.setText("✗ ERROR").setColor(HEX_RED).setFontSize(10); return; }
    if (type === "boolean") { this.resultText.setFontSize(12).setText(String(value)).setColor(HEX_CYAN); return; }
    if (type === "String") { this.resultText.setFontSize(11).setText(String(value)).setColor(HEX_CYAN); return; }
    this.resultText.setFontSize(12).setText(this._fmtNum(value, type)).setColor(type === "double" ? HEX_ORANGE : HEX_GOLD);
  }

  createHUD() {
    const g = this.add.graphics().setDepth(49);
    g.fillStyle(0x04060c, 0.93);
    g.fillRect(0, 0, W, 64);
    g.lineStyle(1, 0x2a3654, 1);
    g.lineBetween(0, 64, W, 64);

    this.add.text(20, 14, "THE DISTANCE TRIALS", { font: "bold 18px Georgia", color: "#b0bec5" }).setDepth(50);
    this.add.text(20, 38, "Tuning Phase — abs()", { font: "18px Arial", color: "#546e7a" }).setDepth(50);

    this.waveText = this.add.text(640, 18, "WAVE 1 / 3", { font: "bold 16px Georgia", color: HEX_GOLD }).setOrigin(0.5).setDepth(50);
    this._waveSquares = [];
    for (let i = 0; i < 5; i++) {
      const sq = this.add.rectangle(640 - 44 + i * 22, 42, 10, 10, 0x2a2f36).setDepth(50).setStrokeStyle(1, 0x546e7a);
      this._waveSquares.push(sq);
    }

    this.add.text(1050, 32, "SCORE", { font: "18px Arial", color: "#546e7a" }).setOrigin(1, 0.5).setDepth(50);
    this.scoreText = this.add.text(1060, 32, "0", { font: "bold 22px Arial", color: "#ffffff" }).setOrigin(0, 0.5).setDepth(50);
    this.comboText = this.add.text(960, 32, "×1", { font: "bold 18px Arial", color: HEX_GOLD }).setOrigin(1, 0.5).setDepth(50);

    this.lifeIcons = [];
    for (let i = 0; i < 5; i++) {
      const lg = this.add.graphics({ x: 1150 + i * 20, y: 24 }).setDepth(50);
      lg.lineStyle(2, C_BRASS, 1);
      lg.strokeCircle(0, 0, 6);
      lg.lineBetween(4, -4, 9, -9);
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
    const gloveL = this.add.circle(-16, 10, 4, 0xe0d6b8, 0.85);
    const gloveR = this.add.circle(16, 10, 4, 0xe0d6b8, 0.85);
    // folded measuring tape under one arm
    const tape = this.add.graphics();
    tape.fillStyle(C_GOLD, 0.85);
    tape.fillRoundedRect(-27, 4, 11, 9, 2);
    tape.lineStyle(1, 0x8a6435, 0.8);
    tape.strokeRoundedRect(-27, 4, 11, 9, 2);
    tape.lineBetween(-24, 4, -24, 13);
    tape.lineBetween(-20, 4, -20, 13);
    c.add([g, eye, pupil, gloveL, gloveR, tape, tip]);
    this.tweens.add({ targets: tip, alpha: 0.3, duration: 900, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: c, y: "+=2", duration: 2200, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
    this.bit = c;
  }

  bitSay(text) {
    this.hideBubble();
    const inner = this.add.text(0, 0, text, { font: "18px Arial", color: "#e0e0e0", wordWrap: { width: 400 } });
    const bw = Math.min(inner.width, 400) + 30, bh = inner.height + 24;
    inner.setText("");
    const bx = Phaser.Math.Clamp(this.bit.x + 40, 20, W - bw - 20);
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

  async showBitFeedback(message, maxMs = 2500) {
    await this.bitSay(message);
    if (!this._alive) return;
    await Promise.race([this.waitForClick(), this.delay(maxMs)]);
    this.hideBubble();
  }

  checkTutorial() {
    let done = false;
    try { done = localStorage.getItem(TUTORIAL_KEY) === "true"; } catch (_) {}
    if (done) this.time.delayedCall(300, () => this.startWave(1));
    else this.runTutorial();
  }

  async runTutorial() {
    const A = () => this._alive;
    await this.delay(400); if (!A()) return;
    await this.bitSay("The Distance Trials, Surveyor — where fluency is timed by the tape itself. Each question runs a measuring tape down; answer before it runs out. The beam's verdicts must become your reflexes tonight.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(5500)]); if (!A()) return;
    this.hideBubble();

    this.showTrialOnSlip(["int d = Math.abs(-5);"], "What is stored in d?");
    this.startTimer(9000);
    await this.runReveal("int d = Math.abs(-5);");
    if (!A()) return;
    const a1 = this.createAnnotation(SLIP_CX, SLIP_Y1 + 14, "the reading", HEX_BLUE_GRAY);
    const a2 = this.createAnnotation(SLIP_CX, TAPE_Y + 22, "your window — gone when it runs out", HEX_BLUE_GRAY);
    const a3 = this.createAnnotation(PL_X, PL_Y + 56, "the distance, never negative", HEX_BLUE_GRAY);
    await this.bitSay("Log the measurement before the tape runs out. Eyes on the rail!");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();
    [a1, a2, a3].forEach((a) => a.destroy());
    this._killTimer();
    this._drawTape(1, C_CYAN);
    this.clearSlipContent();
    this.wipeSlate();
    this.clearRail();
    this.clearPlinth();
    this.updateResultRow(null, null);

    try { localStorage.setItem(TUTORIAL_KEY, "true"); } catch (_) {}
    this.startWave(1);
  }

  async startWave(waveNumber) {
    this.currentWave = waveNumber;
    this.resetWaveIndicator();
    this.waveText.setText(`WAVE ${waveNumber} / 3`);
    const banners = {
      1: "WAVE 1 — RAPID VERDICTS",
      2: "WAVE 2 — GAPS & DISTANCES",
      3: "WAVE 3 — DEEP MEASUREMENTS & BUG HUNT",
    };
    await this.showWaveBanner(banners[waveNumber]);
    if (!this._alive) return;
    if (waveNumber === 2) {
      await this.showBitFeedback("Gaps now, Surveyor. abs(a - b) is the distance between two markers — and it doesn't care which one you list first. Subtract, then measure.", 4500);
    } else if (waveNumber === 3) {
      await this.showBitFeedback("Final measurements — long traces, and two flawed surveys hiding in the forms. The slate and the rail tell the truth; your hunches don't.", 4500);
    }
    if (!this._alive) return;

    const startIndex = waveNumber === 1 ? 0 : waveNumber === 2 ? 5 : 10;
    this.startRound(startIndex);
  }

  async showWaveBanner(text) {
    const c = this.add.container(640, -60).setDepth(85);
    const g = this.add.graphics();
    g.fillStyle(0x04060c, 0.95);
    g.fillRoundedRect(-230, -24, 460, 48, 8);
    g.lineStyle(2, C_GOLD, 1);
    g.strokeRoundedRect(-230, -24, 460, 48, 8);
    const t = this.add.text(0, 0, text, { font: "bold 20px Georgia", color: HEX_GOLD }).setOrigin(0.5);
    if (t.width > 440) t.setFontSize(14);
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
    this.clearRail();
    this.clearPlinth();
    this.wipeSlate();
    this.updateResultRow(null, null);
    this.slipRoundLabel.setText(`MEASURE ${index + 1}/15`);
    this.roundStartTime = this.time.now;

    const limit = config.type === "bughunt" ? 12000 : WAVE_TIME[config.wave];
    if (config.type === "predict" || config.type === "trace") this.setupPredict(config);
    else if (config.type === "bughunt") this.setupBugHunt(config);

    this.startTimer(limit);
  }

  clearRound() {
    this.roundElements.forEach((e) => { if (e && e.destroy) e.destroy(); });
    this.roundElements = [];
    this.clearSlipContent();
    this._bugHuntTokenObjs = [];
    if (this._bugHeaderTween) { this._bugHeaderTween.stop(); this._bugHeaderTween = null; }
  }

  async onTimeout(config) {
    if (this.gameEnded) return;
    this.inputLocked = true;
    this.roundElements.forEach((e) => e.disableInteractive && e.disableInteractive());
    (this._bugHuntTokenObjs || []).forEach((t) => t.disableInteractive());
    this.logAttempt(config, false, null, "timeout", this.roundTimeLimit, 1);
    await this.tapeRunsOut();
    if (!this._alive) return;
    if (config.type === "bughunt") await this.runDualFutureReveal(config);
    else await this.runReveal(config);
    if (!this._alive) return;
    if (config.revealNote) this.createFloatingText(SLIP_CX, SLIP_Y1 + 40, config.revealNote, HEX_GRAY, "12px Arial", 2800);
    this.updateWaveIndicator(this._roundInWave(), false);
    this.loseLife();
    this.updateCombo(false);
    if (this.lives <= 0) { this.time.delayedCall(400, () => this.gameOver()); return; }
    await this.showBitFeedback(MISCONCEPTION_FEEDBACK.timeout);
    if (!this._alive) return;
    this.advanceRound();
  }

  setupPredict(config) {
    const lines = this._sourceLines(config);
    this.showTrialOnSlip(lines, config.question);
    this.showOptionBubbles(config.options, config);
  }

  showOptionBubbles(options, config) {
    const shuffled = Phaser.Utils.Array.Shuffle(options.slice());
    const positions = [[420, 558], [672, 558], [420, 614], [672, 614]];
    shuffled.forEach((opt, i) => {
      const [x, y] = positions[i];
      const c = this.add.container(x, y).setDepth(41);
      const g = this.add.graphics();
      const w = 240, h = 46;
      const draw = (stroke) => {
        g.clear();
        g.fillStyle(0x0a0d18, 1);
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
        g.lineStyle(2, stroke, 1);
        g.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);
      };
      draw(C_BRASS);
      const label = opt.label || opt.value;
      const txt = this.add.text(0, 0, label, { font: "bold 13px Courier New", color: "#e8eaf6", wordWrap: { width: w - 16 }, align: "center" }).setOrigin(0.5);
      if (txt.height > h - 8) txt.setFontSize(9);
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
    await this.haltTimerAndCapture();
    const timePctUsed = this.getTimePctUsed();
    const timeMs = Math.round(this.time.now - this.roundStartTime);
    const correct = opt.value === config.correct;
    this.logAttempt(config, correct, opt.value, opt.tag, timeMs, timePctUsed);
    this.roundElements.forEach((e) => e.disableInteractive && e.disableInteractive());

    const g = bubbleContainer.list[0];
    g.clear();
    g.fillStyle(0x0a0d18, 1);
    g.fillRoundedRect(-120, -23, 240, 46, 8);
    g.lineStyle(2, correct ? C_GREEN_BRIGHT : C_RED, 1);
    g.strokeRoundedRect(-120, -23, 240, 46, 8);
    if (!correct) this.tweens.add({ targets: bubbleContainer, x: bubbleContainer.x + 5, duration: 35, yoyo: true, repeat: 4 });

    await this.stampSlip(correct ? "logged" : "misread");
    if (!this._alive) return;
    await this.runReveal(config);
    if (!this._alive) return;
    if (config.revealNote) this.createFloatingText(SLIP_CX, SLIP_Y1 + 40, config.revealNote, HEX_GRAY, "12px Arial", 2800);
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

  setupBugHunt(config) {
    this.clearSlipContent();
    const header = this.add.text(SLIP_CX, SLIP_Y0 + 36, "CLICK THE BUG", { font: "bold 14px Georgia", color: "#c62828" }).setOrigin(0.5);
    this.slipContentContainer.add(header);
    this._bugHeaderTween = this.tweens.add({ targets: header, alpha: 0.5, duration: 450, yoyo: true, repeat: -1 });

    this._bugHuntTokenObjs = [];
    const maxLen = Math.max(...config.lines.map((l) => l.length));
    const fontSize = maxLen > 36 ? 9 : 11;
    const startY = SLIP_Y0 + 62;
    const measure = (t, fs) => { const tmp = this.add.text(0, 0, t, { font: `bold ${fs}px Courier New` }); const w = tmp.width; tmp.destroy(); return w; };

    config.lines.forEach((line, li) => {
      const y = startY + li * (fontSize + 9);
      if (line.trim().startsWith("//")) {
        const t = this.add.text(SLIP_CX, y, line, { font: `italic ${fontSize}px Courier New`, color: "#8a6435" }).setOrigin(0.5);
        this.slipContentContainer.add(t);
        return;
      }
      const isFaultLine = li + 1 === config.faultLine;
      const isPhrase = isFaultLine && config.faultToken.includes("(");

      if (isPhrase) {
        const idx = line.indexOf(config.faultToken);
        const pre = line.slice(0, idx), phrase = line.slice(idx, idx + config.faultToken.length), post = line.slice(idx + config.faultToken.length);
        const preTokens = pre ? this._codeTokenize(pre) : [];
        const postTokens = post ? this._codeTokenize(post) : [];
        const preW = preTokens.reduce((a, tk) => a + measure(tk.t, fontSize), 0);
        const phraseW = measure(phrase, fontSize);
        const postW = postTokens.reduce((a, tk) => a + measure(tk.t, fontSize), 0);
        let x = SLIP_CX - (preW + phraseW + postW) / 2;
        preTokens.forEach((tok) => { const w = measure(tok.t, fontSize); const t = this.add.text(x, y, tok.t, { font: `bold ${fontSize}px Courier New`, color: tok.c }).setOrigin(0, 0.5); this.slipContentContainer.add(t); x += w; });
        const bugT = this.add.text(x, y, phrase, { font: `bold ${fontSize}px Courier New`, color: "#e65100" }).setOrigin(0, 0.5);
        bugT.setData("isBug", true);
        bugT.setData("line", li + 1);
        const hitW = Math.max(phraseW + 6, 30), hitH = Math.max(fontSize + 8, 30);
        bugT.setInteractive(new Phaser.Geom.Rectangle(0, -hitH / 2, hitW, hitH), Phaser.Geom.Rectangle.Contains);
        this.slipContentContainer.add(bugT);
        bugT.on("pointerover", () => { if (!this.inputLocked) bugT.setColor("#8a6435"); });
        bugT.on("pointerout", () => { if (!this.inputLocked) bugT.setColor("#e65100"); });
        bugT.on("pointerdown", () => { if (this.inputLocked) return; this.inputLocked = true; this.onTokenClicked(bugT, config, y); });
        this._bugHuntTokenObjs.push(bugT);
        x += phraseW;
        postTokens.forEach((tok) => { const w = measure(tok.t, fontSize); const t = this.add.text(x, y, tok.t, { font: `bold ${fontSize}px Courier New`, color: tok.c }).setOrigin(0, 0.5); this.slipContentContainer.add(t); x += w; });
        return;
      }

      const tokens = this._codeTokenize(line);
      const measured = tokens.map((tk) => measure(tk.t, fontSize));
      const totalW = measured.reduce((a, b) => a + b, 0);
      let x = SLIP_CX - totalW / 2;
      tokens.forEach((tok, ti) => {
        const w = measured[ti];
        const isBug = isFaultLine && tok.t === config.faultToken;
        const t = this.add.text(x + w / 2, y, tok.t, { font: `bold ${fontSize}px Courier New`, color: tok.c }).setOrigin(0.5);
        t.setData("isBug", isBug);
        t.setData("line", li + 1);
        const hitW = Math.max(w + 6, 30), hitH = Math.max(fontSize + 8, 30);
        t.setInteractive(new Phaser.Geom.Rectangle(-hitW / 2, -hitH / 2, hitW, hitH), Phaser.Geom.Rectangle.Contains);
        this.slipContentContainer.add(t);
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
    await this.haltTimerAndCapture();
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
      this.slipContentContainer.add(strike);
      const fixT = this.add.text(SLIP_CX, lineY - 14, config.fix, { font: "bold 12px Courier New", color: "#2e7d32", wordWrap: { width: 380 } }).setOrigin(0.5).setAlpha(0);
      this.slipContentContainer.add(fixT);
      this.tweens.add({ targets: fixT, alpha: 1, duration: 220 });
    } else {
      tokenObj.setColor(HEX_RED);
      this.tweens.add({ targets: tokenObj, x: tokenObj.x + 4, duration: 30, yoyo: true, repeat: 4 });
      this._bugHuntTokenObjs.filter((t) => t.getData("isBug")).forEach((t) => {
        t.setColor(HEX_RED);
        this.tweens.add({ targets: t, alpha: 0.3, duration: 160, yoyo: true, repeat: 3 });
      });
    }

    await this.stampSlip(correct ? "logged" : "misread");
    if (!this._alive) return;
    await this.runDualFutureReveal(config);
    if (!this._alive) return;
    if (config.revealNote) this.createFloatingText(SLIP_CX, SLIP_Y1 + 40, config.revealNote, HEX_GRAY, "12px Arial", 2800);
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

  async runDualFutureReveal(config) {
    await this.runReveal(config);
    await this.delay(450);
    if (!this._alive) return;
    this.wipeSlate();
    this.clearRail();
    this.clearPlinth();
    this.updateResultRow(null, null);
    const fixedLines = config.lines
      .map((l, i) => (i + 1 === config.faultLine ? l.replace(config.faultToken, config.fix) : l))
      .filter((l) => !l.trim().startsWith("//"));
    await this.runReveal({ lines: fixedLines });
  }

  _lex(src) {
    const toks = [];
    const re = /\s*(?:(\d+\.\d+|\d+)|("(?:[^"\\]|\\.)*")|([A-Za-z_]\w*)|(<=|>=|==|!=|[-+*/%<>(),.]))/y;
    let pos = 0;
    while (pos < src.length) {
      if (/^\s*$/.test(src.slice(pos))) break;
      re.lastIndex = pos;
      const m = re.exec(src);
      if (!m) throw { crash: "compile" };
      const start = m.index + (m[0].length - m[0].trimStart().length);
      if (m[1] !== undefined) toks.push({ k: "num", t: m[1], pos: start, end: re.lastIndex });
      else if (m[2] !== undefined) toks.push({ k: "str", t: m[2], pos: start, end: re.lastIndex });
      else if (m[3] !== undefined) toks.push({ k: "id", t: m[3], pos: start, end: re.lastIndex });
      else toks.push({ k: "op", t: m[4], pos: start, end: re.lastIndex });
      pos = re.lastIndex;
    }
    return toks;
  }

  _isNum(v) { return v.t === "int" || v.t === "double"; }

  _show(v) {
    if (v.t === "double") return this._fmtDouble(Number(v.v));
    return String(v.v);
  }

  _peekTok() { return this._lx.toks[this._lx.i]; }
  _nextTok() { return this._lx.toks[this._lx.i++]; }
  _peekIsOp(...ops) { const t = this._peekTok(); return !!t && t.k === "op" && ops.includes(t.t); }
  _expectOp(op) {
    const t = this._nextTok();
    if (!t || t.k !== "op" || t.t !== op) throw { crash: "compile" };
    return t;
  }

  async evalExpr(src, vars) {
    this._lx = { toks: this._lex(src), i: 0, src, vars };
    const r = await this._pCmp();
    if (this._lx.i < this._lx.toks.length) throw { crash: "compile" };
    return r;
  }

  async _pCmp() {
    const left = await this._pAdd();
    if (this._peekIsOp("<", "<=", ">", ">=", "==", "!=")) {
      const op = this._nextTok().t;
      const right = await this._pAdd();
      if (!(this._isNum(left) && this._isNum(right))) throw { crash: "compile" };
      const a = Number(left.v), b = Number(right.v);
      const v = op === "<" ? a < b : op === "<=" ? a <= b : op === ">" ? a > b : op === ">=" ? a >= b : op === "==" ? a === b : a !== b;
      return { v, t: "boolean" };
    }
    return left;
  }

  async _pAdd() {
    let left = await this._pMul();
    while (this._peekIsOp("+", "-")) {
      const op = this._nextTok().t;
      const right = await this._pMul();
      if (op === "+" && (left.t === "String" || right.t === "String")) {
        left = { v: this._show(left) + this._show(right), t: "String" };
        continue;
      }
      if (!(this._isNum(left) && this._isNum(right))) throw { crash: "compile" };
      const t = left.t === "double" || right.t === "double" ? "double" : "int";
      left = { v: op === "+" ? left.v + right.v : left.v - right.v, t };
    }
    return left;
  }

  async _pMul() {
    let left = await this._pUnary();
    while (this._peekIsOp("*", "/", "%")) {
      const op = this._nextTok().t;
      const right = await this._pUnary();
      if (!(this._isNum(left) && this._isNum(right))) throw { crash: "compile" };
      const t = left.t === "double" || right.t === "double" ? "double" : "int";
      let v;
      if (op === "*") v = left.v * right.v;
      else if (t === "int") {
        if (right.v === 0) throw { crash: "runtime" };
        v = op === "/" ? Math.trunc(left.v / right.v) : left.v % right.v;
      } else v = op === "/" ? left.v / right.v : left.v % right.v;
      left = { v, t };
    }
    return left;
  }

  async _pUnary() {
    if (this._peekIsOp("-")) {
      this._nextTok();
      const v = await this._pUnary();
      if (!this._isNum(v)) throw { crash: "compile" };
      return { v: v.v === 0 ? 0 : -v.v, t: v.t };
    }
    return this._pPrimary();
  }

  async _pPrimary() {
    const tok = this._nextTok();
    if (!tok) throw { crash: "compile" };
    if (tok.k === "num") {
      return tok.t.includes(".") ? { v: parseFloat(tok.t), t: "double" } : { v: parseInt(tok.t, 10), t: "int" };
    }
    if (tok.k === "str") return { v: tok.t.slice(1, -1), t: "String" };
    if (tok.k === "op" && tok.t === "(") {
      const v = await this._pCmp();
      this._expectOp(")");
      return v;
    }
    if (tok.k === "id") {
      if (tok.t === "true" || tok.t === "false") return { v: tok.t === "true", t: "boolean" };
      if (tok.t === "Math") {
        this._expectOp(".");
        const name = this._nextTok();
        if (!name || name.k !== "id" || name.t !== "abs") throw { crash: "compile" };
        return this._pAbsCall();
      }
      if (this._peekIsOp(".")) throw { crash: "compile", instance: tok.t };
      const variable = this._lx.vars[tok.t];
      if (variable === undefined) throw { crash: "compile" };
      return { v: variable.v, t: variable.t };
    }
    throw { crash: "compile" };
  }

  async _pAbsCall() {
    this._expectOp("(");
    const args = [];
    let argStart = -1, argEnd = -1;
    if (!this._peekIsOp(")")) {
      for (;;) {
        const first = this._peekTok();
        if (!first) throw { crash: "compile" };
        if (args.length === 0) argStart = first.pos;
        args.push(await this._pCmp());
        argEnd = this._lx.toks[this._lx.i - 1].end;
        if (this._peekIsOp(",")) { this._nextTok(); continue; }
        break;
      }
    }
    this._expectOp(")");
    if (args.length !== 1 || !this._isNum(args[0])) throw { crash: "compile" };
    const arg = args[0];
    if (this._dry) return { v: Math.abs(arg.v), t: arg.t };
    const argText = this._lx.src.slice(argStart, argEnd).trim();
    const simple = /^-?\s*[\w.]+$/.test(argText);
    if (!simple) await this.chalkWriteLine(`   ${argText} → ${this._show(arg)}`, "#8ea6c8");
    const out = await this.measure(arg);
    if (!out) return { v: Math.abs(arg.v), t: arg.t };
    return out;
  }

  _matchParen(str, openIdx) {
    let depth = 0, inStr = false;
    for (let i = openIdx; i < str.length; i++) {
      const ch = str[i];
      if (ch === '"' && str[i - 1] !== "\\") inStr = !inStr;
      if (inStr) continue;
      if (ch === "(") depth++;
      if (ch === ")") { depth--; if (depth === 0) return i; }
    }
    return -1;
  }

  async _runStatement(stmt, vars) {
    const decl = stmt.match(/^(int|double|boolean)\s+(\w+)\s*=\s*(.+);$/);
    if (decl) {
      const r = await this.evalExpr(decl[3], vars);
      const want = decl[1];
      if (want === "int") {
        if (r.t !== "int") throw { crash: "compile" };
        vars[decl[2]] = { v: r.v, t: "int" };
      } else if (want === "double") {
        if (!this._isNum(r)) throw { crash: "compile" };
        vars[decl[2]] = { v: r.v, t: "double" };
      } else {
        if (r.t !== "boolean") throw { crash: "compile" };
        vars[decl[2]] = { v: r.v, t: "boolean" };
      }
      if (!this._dry) this.updateResultRow(vars[decl[2]].v, vars[decl[2]].t);
      return;
    }
    const print = stmt.match(/^System\.out\.println\((.*)\);$/);
    if (print) {
      const r = await this.evalExpr(print[1], vars);
      const out = this._show(r);
      if (this._dry) return;
      this._lastPrintedLine = out;
      await this.chalkWriteLine(`▸ ${out}`, HEX_CYAN);
      this.updateResultRow(out, "String");
      return;
    }
  }

  async runLine(line, vars, ctx) {
    if (!this._dry) await this.chalkWriteLine(line, "#8ea6c8");
    try {
      let stmt = line;
      const elseM = stmt.match(/^else\s+(.*)$/);
      if (elseM) {
        if (ctx.lastIf === true) return { ok: true };
        stmt = elseM[1];
      } else if (/^if\s*\(/.test(stmt)) {
        const open = stmt.indexOf("(");
        const close = this._matchParen(stmt, open);
        if (close < 0) throw { crash: "compile" };
        const cond = await this.evalExpr(stmt.slice(open + 1, close), vars);
        if (cond.t !== "boolean") throw { crash: "compile" };
        ctx.lastIf = cond.v;
        if (!cond.v) return { ok: true };
        stmt = stmt.slice(close + 1).trim();
      }
      await this._runStatement(stmt, vars);
      return { ok: true };
    } catch (err) {
      if (err && err.crash) {
        if (this._dry) return { ok: false, crash: err.crash, line };
        this.showCompileErrorStamp(err.crash === "runtime" ? "RUNTIME ERROR" : "COMPILE ERROR");
        this.updateResultRow(null, "crash");
        await this.delay(500);
        return { ok: false, crash: err.crash };
      }
      throw err;
    }
  }

  async _execAll(lines, dry) {
    this._dry = dry;
    const vars = {};
    const ctx = { lastIf: null };
    try {
      for (const line of lines) {
        if (!this._alive) return { ok: true };
        const r = await this.runLine(line, vars, ctx);
        if (r && r.ok === false) return r;
      }
    } finally {
      this._dry = false;
    }
    return { ok: true };
  }

  async runReveal(input) {
    const raw = input.lines ? input.lines : (input.source !== undefined ? input.source : input);
    const lines = (Array.isArray(raw) ? raw : String(raw).split("\n")).map((l) => l.trim()).filter((l) => l && !l.startsWith("//"));
    const check = await this._execAll(lines, true);
    if (!this._alive) return { ok: true };
    if (check.ok === false && check.crash === "compile") {
      await this.chalkWriteLine(check.line, "#8ea6c8");
      this.showCompileErrorStamp("COMPILE ERROR");
      this.updateResultRow(null, "crash");
      await this.delay(500);
      return { ok: false, crash: "compile" };
    }
    return this._execAll(lines, false);
  }

  showCompileErrorStamp(label = "COMPILE ERROR") {
    const stamp = this.add.text(SLIP_CX, SLIP_Y0 - 22, label, { font: "bold 19px Arial", color: HEX_RED }).setOrigin(0.5).setDepth(30).setScale(1.4).setAngle(-6).setAlpha(0);
    this.roundElements.push(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 160 });
    this.screenShake(0.004, 130);
    this.time.delayedCall(900, () => { if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 200, onComplete: () => stamp.destroy() }); });
  }

  getComboMultiplier() { if (this.combo >= 5) return 3; if (this.combo >= 3) return 2; return 1; }

  scoreForAttempt(timePctUsed) {
    let points = 100 * this.getComboMultiplier();
    const remaining = 1 - timePctUsed;
    if (remaining > 0.6) { points += 50; this.fastBonusCount++; this.createFloatingText(SLIP_CX, SLIP_Y0 - 14, "⚡ EARLY MEASURE +50", HEX_GOLD, "bold 15px Arial", 900); }
    else if (remaining > 0.3) { points += 25; this.fastBonusCount++; this.createFloatingText(SLIP_CX, SLIP_Y0 - 14, "⚡ +25", HEX_GOLD, "bold 14px Arial", 800); }
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

  getTimePctUsed() {
    const elapsed = this.time.now - this.roundStartTime;
    return Phaser.Math.Clamp(elapsed / this.roundTimeLimit, 0, 1);
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
      const features = { attempts_count, time_taken_seconds, misconception_repeat_count, combo_breaks };
      const effectivePrediction = BehavioralRules.getEffectivePrediction(features, prediction, true);
      GameManager.fusionEngine.checkBehavioral(effectivePrediction);
    } catch (e) {
      console.warn("Level59Scene: /api/wellbeing/predict-struggle unreachable, skipping behavioral signal for this level:", e);
    }
  }

  async advanceRound() {
    if (this.currentRound === 2) {
      await this.runBehavioralCheck();

      let waitTime = 0;
      while (!GameManager.interventionInFlight && waitTime < 1500) {
        await this.delay(100);
        waitTime += 100;
      }
      while (GameManager.interventionInFlight) {
        await this.delay(200);
      }
    }
    if (!this._alive || this.gameEnded) return;
    this.clearRound();
    const next = this.currentRound + 1;
    if (next >= ROUNDS.length) { this.levelComplete(); return; }
    const nextConfig = ROUNDS[next];
    if (nextConfig.wave !== this.currentWave) { this.startWave(nextConfig.wave); return; }
    this.time.delayedCall(700, () => { if (this._alive && !this.gameEnded) this.startRound(next); });
  }

  gameOver() {
    PanelFit.arm(this);
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this._killTimer();
    this.clearRound();
    this.hideBubble();

    (async () => {
      this._drawTape(0, C_RED);
      this.clearRail();
      this.wipeSlate();
      const motes = this._motes;
      this._motes = null;
      (motes || []).forEach((m) => this.tweens.add({ targets: m, y: 632, alpha: 0, duration: 1500, ease: "Sine.easeIn" }));

      const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
      this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });
      const title = this.add.text(640, 240, "HALL CLOSED", { font: "bold 38px Georgia", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
      this.tweens.add({ targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut", onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }) });
      this.add.text(640, 310, `Score: ${this.score}`, { font: "21px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
      this.add.text(640, 350, `Measurements Logged: ${this.currentRound} / 15`, { font: "18px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);
      this._makeButton(525, 420, "REOPEN THE HALL", 200, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
      this._makeButton(755, 420, "RETURN TO MENU", 200, 50, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.start("MenuScene"));
    })();
  }

  levelComplete() {
    PanelFit.arm(this);
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this._killTimer();
    this.clearRound();
    this.hideBubble();

    try { GameManager.completeLevel(58, Math.round((this.correctFirstTry / 15) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("math_abs_tuned"); } catch (_) {}
    try {
      localStorage.setItem("level59_results", JSON.stringify({
        level: 59, concept: "math_abs", phase: "tuning",
        score: this.score, accuracy: this.correctFirstTry / 15, avgTimePct: this.totalTimePctUsed / 15,
        fastBonuses: this.fastBonusCount, comboMax: this.maxCombo, stars: this._starRating(),
        livesRemaining: this.lives, attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.hallFinale().then(() => { if (this._alive) this.showScoreTally(); });
  }

  async hallFinale() {
    this._drawTape(1, C_GREEN_BRIGHT);
    const glow = this.add.rectangle((RAIL_X0 + RAIL_X1) / 2, RAIL_Y, RAIL_X1 - RAIL_X0, 4, C_GOLD, 0.5).setDepth(18);
    this.tweens.add({ targets: glow, alpha: 0, duration: 1200, onComplete: () => glow.destroy() });
    this.createConfetti(PL_X, PL_Y - 40, 40);
    await this.delay(1100);
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
    panel.fillStyle(0x0a0d18, 1);
    panel.fillRoundedRect(360, 145, 560, 430, 16);
    panel.lineStyle(2, C_BRASS, 1);
    panel.strokeRoundedRect(360, 145, 560, 430, 16);

    const title = this.add.text(640, 185, "MEASUREMENTS LOGGED", { font: "bold 30px Georgia", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(91).setScale(0);
    this.tweens.add({ targets: title, scale: 1, duration: 350, ease: "Back.easeOut" });

    const acc = Math.round((this.correctFirstTry / 15) * 100);
    const avgSec = (this.totalTimeMs / 15 / 1000).toFixed(1);
    const lines = [
      `ACCURACY: ${acc}%`,
      `AVG RESPONSE: ${avgSec}s`,
      `EARLY-MEASURE BONUSES: ${this.fastBonusCount}`,
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
    bg.lineStyle(2, C_CYAN, 0.9);
    bg.lineBetween(-18, 0, 18, 0);
    bg.lineStyle(2, C_BRASS, 1);
    bg.lineBetween(0, -14, 0, 14);
    bg.fillStyle(C_GOLD, 0.95);
    bg.fillTriangle(-4, 6, 4, 6, 0, -8);
    badge.add(bg);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 0 });
    const badgeLbl = this.add.text(640, 520, "abs() SCHEMA TUNED", { font: "bold 14px Georgia", color: HEX_GOLD }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: badgeLbl, alpha: 1, duration: 300, delay: 0 });

    this._makeButton(500, 555, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(770, 555, "NEXT: The Standards Office →", 290, 44, { fill: 0x00733a, stroke: C_GREEN_BRIGHT, textColor: "#ffffff" }, () => {
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
