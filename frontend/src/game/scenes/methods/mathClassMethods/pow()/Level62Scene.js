/**
 * Level 62 — "The Exponent Trials" (Math Methods: Tuning Phase — pow())
 * ===========================================================================
 * Tunes the Level 61 pow() schema through rapid-fire fluency trials on the
 * tower's testing floor. A heavy brass counterweight descending on a chain
 * IS the timer — one linear tween drives its y-position from the drum to
 * the floor plate; timeout fires from the tween's onComplete when the
 * weight strikes. No parallel clock.
 *
 * New fluency material:
 *  - FRACTIONAL EXPONENTS drilled to reflex: pow(x, 0.5) the square root,
 *    pow(x, 1.0/3) the cube root — and the INTEGER-DIVISION TRAP where
 *    1/3 (both operands int) truncates to 0 before pow ever sees it.
 *  - THE DOUBLE-RETURN REFLEX: by wave 3 the learner must anticipate that
 *    int x = Math.pow(a, b) fails to compile, without watching it fail.
 *  - Wave 3 bug hunts drill the two everyday pow() bugs: the missing cast
 *    and the base-exponent swap.
 * The evaluator reuses L61's honest cascade (genuine repeated
 * multiplication, real reverse-hum for fractional exponents), extended
 * with Java's int/int floor division, nested pow calls, (int) truncation,
 * and a small for-loop engine for the trace rounds.
 */

import Phaser from "phaser";
import { GameManager } from "../../../../GameManager.js";
import { WellbeingAPI } from "../../../../../api/api.js";
import { BadgeSystem } from "../../../../BadgeSystem.js";

const W = 1280, H = 720;

const C_CYAN = 0x4fc3f7, C_GOLD = 0xffd740, C_ORANGE = 0xff9800, C_BLUE_GRAY = 0x8ea6c8;
const C_GREEN_BRIGHT = 0x00e676, C_RED = 0xf44336, C_GRAY = 0x78909c, C_BRASS = 0xc8a05a;
const HEX_CYAN = "#4fc3f7", HEX_GOLD = "#ffd740", HEX_ORANGE = "#ff9800", HEX_BLUE_GRAY = "#8ea6c8";
const HEX_GREEN_BRIGHT = "#00e676", HEX_RED = "#f44336", HEX_GRAY = "#78909c", HEX_BRASS = "#c8a05a";

// Test card
const CARD_X0 = 310, CARD_X1 = 730, CARD_Y0 = 90, CARD_Y1 = 430;
const CARD_CX = (CARD_X0 + CARD_X1) / 2;
// The rig / counterweight
const RIG_X0 = 250, RIG_X1 = 770, RIG_Y0 = 60, RIG_Y1 = 500;
const DRUM_X = 790, DRUM_Y = 70;
const WEIGHT_X = 800;
const WEIGHT_Y0 = 100, WEIGHT_Y1 = 475;
const PLATE_Y = 480;
// Mini cascade engine (compact L61 engine, 55% scale)
const MCE_CX = 955, MCE_TOP = 96, MCE_BOTTOM = 330;
const MCE_STAGE_COUNT = 4;
const MCE_STAGE_Y0 = 290, MCE_STAGE_DY = 40;
const MCE_ENTRY_Y = 320;
const MCE_PLINTH = { x: 955, y: 400 };
// Trial slate + container shelf
const SLATE_X = 830, SLATE_Y = 430, SLATE_W = 440, SLATE_H = 100;
const SHELF_X = 830, SHELF_Y = 540, SHELF_W = 440, SHELF_H = 60;

const TUTORIAL_KEY = "level62_tutorial_done";
const WAVE_TIME = { 1: 12000, 2: 10000, 3: 9000 };

// ══════════════════════════════════════════════════════════════
// ROUND CONFIGURATION
// ══════════════════════════════════════════════════════════════
const ROUNDS = [
  // ══ WAVE 1 — Rapid Powers (12s) ══
  { round: 1, wave: 1, type: "predict",
    source: "Math.pow(5, 3)",
    question: "What does this return?", correct: "125.0",
    options: [
      { value: "125.0", tag: null },
      { value: "15.0", tag: "pow_multiplies_args_belief" },
      { value: "125", tag: "pow_returns_int_belief" },
      { value: "243.0", tag: "pow_base_exp_swapped_belief" },
    ],
    concept: "fluent_pow" },

  { round: 2, wave: 1, type: "predict",
    source: "Math.pow(100, 0)",
    question: "What does this return?", correct: "1.0",
    options: [
      { value: "1.0", tag: null },
      { value: "0.0", tag: "pow_zero_returns_zero_belief" },
      { value: "100.0", tag: "pow_zero_returns_base_belief" },
      { value: "error", tag: "pow_zero_error_belief", label: "Runtime error" },
    ],
    revealNote: "The bypass — any base, exponent zero, answer 1.0. Reflex now, not reasoning.",
    concept: "fluent_zero_exp" },

  { round: 3, wave: 1, type: "predict",
    source: "Math.pow(4, 1)",
    question: "What does this return?", correct: "4.0",
    options: [
      { value: "4.0", tag: null },
      { value: "1.0", tag: "pow_one_returns_one_belief" },
      { value: "4", tag: "pow_returns_int_belief" },
      { value: "5.0", tag: "pow_adds_one_belief" },
    ],
    concept: "fluent_one_exp" },

  { round: 4, wave: 1, type: "predict",
    source: "Math.pow(-3, 2)",
    question: "What does this return?", correct: "9.0",
    options: [
      { value: "9.0", tag: null },
      { value: "-9.0", tag: "pow_keeps_sign_always_belief" },
      { value: "-6.0", tag: "pow_multiplies_args_belief" },
      { value: "6.0", tag: "pow_strips_sign_belief" },
    ],
    revealNote: "(−3) × (−3) = 9 — EVEN exponent erases the sign. Odd kept it (L61); even erases it. Two stages, two sign-flips, back to positive.",
    concept: "fluent_negative_base_even" },

  { round: 5, wave: 1, type: "predict",
    source: "double r = 6.pow(2);",
    question: "What happens?", correct: "compile_error",
    options: [
      { value: "compile_error", tag: null, label: "COMPILE ERROR — int has no methods" },
      { value: "returns_36", tag: "instance_call_on_number_belief", label: "r = 36.0" },
      { value: "returns_12", tag: "instance_call_on_number_belief", label: "r = 12.0" },
      { value: "runtime_error", tag: "runtime_vs_compile_confusion", label: "Runtime exception" },
    ],
    concept: "fluent_static_probe" },

  // ══ WAVE 2 — The Fractional Dial (10s) ══
  { round: 6, wave: 2, type: "predict",
    source: "Math.pow(25, 0.5)",
    question: "What does this return?", correct: "5.0",
    options: [
      { value: "5.0", tag: null },
      { value: "12.5", tag: "pow_fraction_is_multiply_belief" },
      { value: "625.0", tag: "pow_base_exp_swapped_belief" },
      { value: "error", tag: "pow_fraction_error_belief", label: "Runtime error" },
    ],
    revealNote: "The dial between 0 and 1 — the cascade in reverse: what times itself gives 25? Five. pow(x, 0.5) is the square root, every time.",
    concept: "fluent_sqrt" },

  { round: 7, wave: 2, type: "predict",
    source: "Math.pow(27, 1.0 / 3)",
    question: "What does this return?", correct: "3.0",
    options: [
      { value: "3.0", tag: null },
      { value: "9.0", tag: "pow_cube_root_confusion" },
      { value: "27.0", tag: "pow_fraction_passthrough_belief" },
      { value: "0.0", tag: "pow_int_division_trap" },
    ],
    revealNote: "The CUBE root — one-third of a stage: what times itself THRICE gives 27? Three. And notice: 1.0 / 3, not 1 / 3. Integer division would make 1/3 = 0, and pow(27, 0) = 1. The decimal point in 1.0 is critical.",
    concept: "fluent_cube_root" },

  { round: 8, wave: 2, type: "predict",
    source: "Math.pow(2, 1/3)",
    question: "What does this return?", correct: "1.0",
    options: [
      { value: "1.0", tag: null, label: "1.0 — because 1/3 is INTEGER DIVISION = 0" },
      { value: "1.26", tag: "pow_float_division_belief", label: "≈1.26 — the cube root of 2" },
      { value: "0.67", tag: "pow_multiplies_args_belief", label: "≈0.67" },
      { value: "error", tag: "pow_fraction_error_belief", label: "Runtime error" },
    ],
    revealNote: "THE TRAP: 1/3 in Java is INTEGER DIVISION — both operands are ints, so 1/3 = 0 with the remainder discarded. pow(2, 0) = 1.0. The fix: 1.0/3 — one decimal point changes the division to double. This is not a pow trap; it's a Java arithmetic trap, sprung inside pow.",
    concept: "int_division_trap" },

  { round: 9, wave: 2, type: "predict",
    source: "double side = 4.0;\ndouble diag = Math.pow(2 * Math.pow(side, 2), 0.5);",
    question: "What is stored in diag? (diagonal of a square)", correct: "approx_5.66",
    options: [
      { value: "approx_5.66", tag: null, label: "≈5.66 — √(2 × 16) = √32" },
      { value: "32.0", tag: "sqrt_not_applied", label: "32.0" },
      { value: "4.0", tag: "nested_cancelled_belief", label: "4.0" },
      { value: "8.0", tag: "pow_multiplies_args_belief", label: "8.0" },
    ],
    revealNote: "Nested power calls: inner pow(4, 2) = 16; 2 × 16 = 32; outer pow(32, 0.5) = √32 ≈ 5.66. The diagonal formula — two cascades, one forward (squaring), one reverse (root). Real geometry in one line.",
    concept: "fluent_nested_pow" },

  { round: 10, wave: 2, type: "predict",
    source: "int n = (int) Math.pow(3, 3);",
    question: "What is stored in n?", correct: "27",
    options: [
      { value: "27", tag: null },
      { value: "27.0", tag: "cast_ignored_belief" },
      { value: "compile_error", tag: "cast_missing_belief", label: "COMPILE ERROR" },
      { value: "error", tag: "cast_crashes_belief", label: "Runtime error" },
    ],
    revealNote: "The cast — (int) trims the .0 and the int container accepts 27. pow returns 27.0; the cast acknowledges the narrowing explicitly. No surprise, no error, just Java requiring honesty about types.",
    concept: "fluent_cast" },

  // ══ WAVE 3 — Deep Computations & Bug Hunt ══
  { round: 11, wave: 3, type: "trace",
    source: "double base = 2;\nfor (int i = 0; i <= 3; i++) {\n    System.out.println(Math.pow(base, i));\n}",
    question: "What prints?", correct: "1.0_2.0_4.0_8.0",
    options: [
      { value: "1.0_2.0_4.0_8.0", tag: null, label: "1.0 / 2.0 / 4.0 / 8.0" },
      { value: "2.0_4.0_8.0", tag: "loop_starts_at_one_belief", label: "2.0 / 4.0 / 8.0" },
      { value: "2.0_4.0_8.0_16.0", tag: "loop_bound_off_by_one", label: "2.0 / 4.0 / 8.0 / 16.0" },
      { value: "1_2_4_8", tag: "pow_returns_int_belief", label: "1 / 2 / 4 / 8" },
    ],
    revealNote: "Four iterations (0, 1, 2, 3): pow(2, 0)=1.0, pow(2, 1)=2.0, pow(2, 2)=4.0, pow(2, 3)=8.0. The zero exponent is the loop's first gift — i starts at 0, and 2^0 = 1. Doubling from 1, the powers of 2 printed in .0.",
    concept: "trace_power_loop" },

  { round: 12, wave: 3, type: "trace",
    source: "double p = 500;\ndouble r = 1.08;\nint y = 2;\ndouble bal = p * Math.pow(r, y);\nSystem.out.println((int) bal);",
    question: "What prints?", correct: "583",
    options: [
      { value: "583", tag: null },
      { value: "583.0", tag: "cast_ignored_belief" },
      { value: "1080", tag: "pow_base_exp_swapped_belief" },
      { value: "580", tag: "rounding_confusion" },
    ],
    revealNote: "Compound: 1.08^2 = 1.1664; 500 × 1.1664 = 583.2; (int) 583.2 = 583. The cast truncates — 583.2 becomes 583, the fractional cents dropped. Real financial code rounds instead, but the cast's truncation is the Java lesson here.",
    concept: "trace_compound_cast" },

  { round: 13, wave: 3, type: "trace",
    source: "int x = 5;\ndouble a = Math.pow(x, 2) + Math.pow(x, 0);\nSystem.out.println(a);",
    question: "What prints?", correct: "26.0",
    options: [
      { value: "26.0", tag: null },
      { value: "25.0", tag: "pow_zero_returns_zero_belief" },
      { value: "30.0", tag: "pow_zero_returns_base_belief" },
      { value: "26", tag: "pow_returns_int_belief" },
    ],
    revealNote: "pow(5, 2) = 25.0; pow(5, 0) = 1.0; 25.0 + 1.0 = 26.0. The zero exponent delivers 1 inside any expression — a quick reflex check nested in arithmetic.",
    concept: "trace_pow_sum" },

  { round: 14, wave: 3, type: "bughunt",
    lines: ["int side = 7;", "int volume = Math.pow(side, 3);", 'System.out.println("Volume: " + volume);', "// intent: compute volume of a cube"],
    faultToken: "int volume", faultLine: 2, tokenRegion: "type_declaration",
    fix: "double volume = Math.pow(side, 3);",
    explanation: "The missing cast — pow returns a double (343.0), and the int container refused it. Java won't narrow silently. Fix: declare as double, or explicitly cast: (int) Math.pow(side, 3).",
    wrongTag: "cast_missing_belief",
    revealNote: "Dual-future reveal: the buggy run's cascade produces 343.0 — the orange star reaches the int container and BOUNCES off (the compile-error stamp). Reset; the fixed run (double or cast) accepts it cleanly — 'Volume: 343.0'. Bit: 'The .0 is a permanent passenger. Acknowledge it or accommodate it.'",
    concept: "missing_cast_bug" },

  { round: 15, wave: 3, type: "bughunt",
    lines: ["double principal = 1000;", "double rate = 1.05;", "int years = 10;", "double balance = principal * Math.pow(years, rate);", 'System.out.println("Balance: " + balance);', "// intent: compound growth over 10 years"],
    faultToken: "Math.pow(years, rate)", faultLine: 4, tokenRegion: "swapped_args",
    fix: "Math.pow(rate, years)",
    explanation: "The base-exp swap — the cascade raised 10 to the power of 1.05 instead of raising 1.05 to the power of 10. pow(10, 1.05) ≈ 11.22; balance ≈ 11220. But pow(1.05, 10) ≈ 1.629; balance ≈ 1628.89. The first argument is the base (what gets multiplied); the second is the exponent (how many times). In compound growth, the RATE climbs through YEARS stages.",
    wrongTag: "pow_base_exp_swapped_belief",
    revealNote: "Dual-future reveal: the buggy run's cascade lights a single stage plus a fractional sliver (dial at 1.05) — 'Balance: 11220.18...' vs the expected ≈1628.89. Reset; the fixed run lights 10 full stages of × 1.05 — the rate climbs patiently, correctly. Bit: 'The rate enters the port; the years set the dial. Compound growth is a SMALL base through MANY stages — swap them and the engine roars instead of growing.'",
    concept: "base_exp_swap_bug" },
];

const MISCONCEPTION_FEEDBACK = {
  pow_multiplies_args_belief: "The cascade doesn't multiply base BY exp — it multiplies base by ITSELF, exp TIMES. Count the stages.",
  pow_adds_args_belief: "pow is multiplication, not addition — and not single multiplication, but REPEATED multiplication.",
  pow_base_exp_swapped_belief: "The FIRST argument enters the port (the base); the SECOND sets the dial (the exponent). In compound growth: small base (rate), many stages (years). Swap them and the engine roars.",
  pow_zero_returns_zero_belief: "Zero stages means NO multiplication — and the product of zero multiplications is 1, not 0. Reflex now: any base, exponent zero, answer 1.0.",
  pow_zero_returns_base_belief: "Zero stages didn't pass the base through — the cascade was IDLE. No multiplication means the identity: 1.0.",
  pow_zero_error_belief: "No error — pow(x, 0) is a perfectly ordinary call. Zero stages, answer 1.0, every time.",
  pow_one_returns_one_belief: "pow(x, 1) returns x, not 1. One stage = one multiplication by itself = the base unchanged.",
  pow_adds_one_belief: "The cascade doesn't add — it multiplies. One stage means one multiplication by the base, which leaves the base unchanged.",
  pow_returns_int_belief: "The value is right, but the TYPE is double — pow ALWAYS returns a double, even for integer inputs.",
  pow_keeps_sign_always_belief: "(−3)² = 9, positive — EVEN exponents erase the sign (two flips = back to positive). Odd exponents keep it. Count the stages.",
  pow_strips_sign_belief: "Not stripped — computed. (−3) × (−3) = +9. The sign resolved through multiplication, not magic.",
  instance_call_on_number_belief: "Eighth level, same law — the cascade belongs to Math, not to the number. Math.pow, always.",
  runtime_vs_compile_confusion: "Forbidden calls and type mismatches die at COMPILE time — before anything runs.",
  pow_fraction_is_multiply_belief: "Half a stage isn't half of the base — it's the ROOT: what number, times itself, gives the base? pow(25, 0.5) = 5 because 5 × 5 = 25. Fractional exponents are roots in disguise.",
  pow_cube_root_confusion: "The cube root of 27 is 3 (3 × 3 × 3 = 27), not 9 (27 ÷ 3). Dividing by the exponent finds an average; the ROOT finds what multiplies.",
  pow_fraction_passthrough_belief: "A fractional exponent doesn't pass the base through unchanged — it runs the cascade in REVERSE. pow(27, 1/3) asks for the cube root, not 27 itself.",
  pow_int_division_trap: "1/3 in Java is INTEGER division — both operands are ints, so 1/3 = 0. pow(anything, 0) = 1. Write 1.0/3 to get the real third. One decimal point, the whole difference.",
  pow_float_division_belief: "That would be the cube root — if the exponent were 0.333... But 1/3 is int division: 0. pow(2, 0) = 1.0. The decimal point in 1.0/3 is the fix.",
  pow_fraction_error_belief: "Fractional exponents are welcome — the dial points between marks; the cascade runs in reverse.",
  sqrt_not_applied: "The outer pow(, 0.5) is the square root — without it, 32 published as-is. Two cascades: square, then root.",
  nested_cancelled_belief: "Squaring then rooting doesn't cancel to the original — squaring gave 16, doubling gave 32, rooting gave √32 ≈ 5.66. The × 2 between them breaks the symmetry.",
  cast_missing_belief: "pow exits in double — the .0 is a permanent passenger. An int container needs (int) as the key: (int) Math.pow(side, 3). Or use double and skip the cast.",
  cast_ignored_belief: "The (int) cast DID fire — it trimmed the .0 and handed an int to the println. 583, not 583.0. The cast changes the type.",
  cast_crashes_belief: "Casting double to int is legal and safe for values in int range — it truncates, never crashes.",
  rounding_confusion: "(int) TRUNCATES, not rounds — 583.2 becomes 583, the .2 dropped. Math.round would give 583 too here, but truncation and rounding diverge at .5+.",
  loop_starts_at_one_belief: "i starts at 0 — and pow(base, 0) = 1.0 is the loop's first output. The zero exponent earns its seat.",
  loop_bound_off_by_one: "i <= 3 runs 0, 1, 2, 3 — four iterations. Check the bound: <= includes 3.",
  timeout: "The weight struck the plate! Brake early — power verdicts are reflexes now, not deliberations.",
};

export class Level62Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level62Scene" });
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
    this._varContainers = [];
    this.firstBareCallAnnotationShown = false;
  }

  preload() {}

  create() {
    this._alive = true;
    this.createParticleTexture();
    this.createBackground();
    this.createTowerDim();
    this.createTestingRig();
    this.createCalibrationChart();
    this.createTrialsBanner();
    this.createTestingFloor();
    this.createParticles();
    this.createTestCard();
    this.createCounterweight();
    this.createMiniCascade();
    this.createTrialSlate();
    this.createContainerShelf();
    this.createHUD();
    this.createBit();

    this.events.on("shutdown", () => { this._alive = false; this._killWeightTween(); });
    this.checkTutorial();
  }

  update(time, delta) {
    this.updateParticles(time, delta);
    this.updateWeightDescent(time);
    this.updateWeightUrgency(time);
    this.updateChainLinks(time);
  }

  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }
  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }

  // ══════════════════════════════════════════════════════════════
  // SETUP — BACKGROUND & TESTING FLOOR
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l62_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l62_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x04060c).setDepth(0);
  }

  createTowerDim() {
    const g = this.add.graphics().setDepth(1).setAlpha(0.35);
    g.lineStyle(2, 0x2a3654, 0.5);
    g.beginPath(); g.arc(640, 900, 850, Math.PI * 1.28, Math.PI * 1.72, false); g.strokePath();
    [130, 1150].forEach((wx) => {
      g.fillStyle(0x0d1220, 1);
      g.lineStyle(1.5, 0x2a3654, 0.4);
      g.fillRect(wx, 70, 10, 470);
      g.strokeRect(wx, 70, 10, 470);
    });
    this._nightStars = [];
    for (let i = 0; i < 8; i++) {
      const s = this.add.circle(Phaser.Math.Between(0, W), Phaser.Math.Between(24, 60), 1, 0xe8eaf6, Phaser.Math.FloatBetween(0.1, 0.3)).setDepth(2);
      this._nightStars.push({ obj: s, phase: Phaser.Math.Between(0, 3000) });
    }
  }

  createTestingRig() {
    const g = this.add.graphics().setDepth(3);
    g.fillStyle(0x141a2c, 1);
    g.lineStyle(2, C_BRASS, 1);
    g.fillRect(RIG_X0, RIG_Y0, 8, RIG_Y1 - RIG_Y0);
    g.strokeRect(RIG_X0, RIG_Y0, 8, RIG_Y1 - RIG_Y0);
    g.fillRect(RIG_X1 - 8, RIG_Y0, 8, RIG_Y1 - RIG_Y0);
    g.strokeRect(RIG_X1 - 8, RIG_Y0, 8, RIG_Y1 - RIG_Y0);
    g.fillRect(RIG_X0, RIG_Y0, RIG_X1 - RIG_X0, 12);
    g.strokeRect(RIG_X0, RIG_Y0, RIG_X1 - RIG_X0, 12);
    g.fillRect(RIG_X0, RIG_Y1, RIG_X1 - RIG_X0, 12);
    g.strokeRect(RIG_X0, RIG_Y1, RIG_X1 - RIG_X0, 12);
    [[RIG_X0 + 4, RIG_Y0 + 6], [RIG_X1 - 4, RIG_Y0 + 6], [RIG_X0 + 4, RIG_Y1 + 6], [RIG_X1 - 4, RIG_Y1 + 6]].forEach(([x, y]) => {
      g.fillStyle(C_BRASS, 0.7);
      g.fillCircle(x, y, 3);
    });
  }

  createCalibrationChart() {
    const g = this.add.graphics().setDepth(3).setAlpha(0.15);
    g.lineStyle(1, C_BLUE_GRAY, 1);
    const vals = [1, 2, 4, 8, 16, 32];
    vals.forEach((v, i) => {
      const y = 170 - i * 12;
      g.lineBetween(1140, y, 1140 + Math.min(40, 6 + Math.log2(v) * 7), y);
    });
    this.add.text(1140, 96, "2ⁿ", { font: "11px Courier New", color: HEX_BLUE_GRAY }).setDepth(3).setAlpha(0.25);
  }

  createTrialsBanner() {
    const g = this.add.graphics().setDepth(2);
    g.fillStyle(0x04060c, 1);
    g.lineStyle(1, C_BRASS, 0.5);
    g.fillRoundedRect(400, 12, 360, 26, 3);
    g.strokeRoundedRect(400, 12, 360, 26, 3);
    this.add.text(580, 25, "T H E   E X P O N E N T   T R I A L S", { font: "bold 15px Georgia", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.7).setDepth(3);
  }

  createTestingFloor() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x0a0d18, 1);
    g.fillRect(0, 635, W, 85);
    g.lineStyle(1, 0x2a3654, 1);
    g.lineBetween(0, 637, W, 637);
    g.lineStyle(1, 0x2a3654, 0.3);
    for (let x = 0; x < W; x += 100) g.lineBetween(x, 640, x, 720);
  }

  createParticles() {
    this.ambient = [];
    const colors = [0x8ea6c8, 0xe8eaf6, 0xc8a05a];
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
    if (this._nightStars) this._nightStars.forEach((s) => {
      const t = (time + s.phase) % 3000;
      s.obj.setAlpha(0.1 + Math.abs(Math.sin((t / 3000) * Math.PI)) * 0.2);
    });
  }

  createAnnotation(x, y, text, colorHex) {
    const t = this.add.text(x, y, text, { font: "italic 12px Arial", color: colorHex, wordWrap: { width: 300 }, align: "center" }).setOrigin(0.5).setDepth(70).setAlpha(0);
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
    const p = this.add.particles(x, y, "l62_dot", {
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
  // THE TEST CARD
  // ══════════════════════════════════════════════════════════════

  createTestCard() {
    const g = this.add.graphics().setDepth(20);
    g.fillStyle(0xe0d6b8, 1);
    g.lineStyle(2, 0x8a6435, 1);
    g.fillRoundedRect(CARD_X0, CARD_Y0, CARD_X1 - CARD_X0, CARD_Y1 - CARD_Y0, 4);
    g.strokeRoundedRect(CARD_X0, CARD_Y0, CARD_X1 - CARD_X0, CARD_Y1 - CARD_Y0, 4);
    g.fillStyle(0x8a6435, 0.15);
    g.fillRect(CARD_X0, CARD_Y0, CARD_X1 - CARD_X0, 24);
    g.lineStyle(1, 0x8a6435, 0.15);
    for (let y = CARD_Y0 + 48; y < CARD_Y1 - 44; y += 20) g.lineBetween(CARD_X0 + 16, y, CARD_X1 - 16, y);
    [CARD_X0 + 30, CARD_X1 - 30].forEach((cx) => {
      g.fillStyle(0xc8a05a, 1);
      g.lineStyle(1, 0x8a6435, 1);
      g.fillRect(cx - 7, CARD_Y0 - 8, 14, 14);
      g.strokeRect(cx - 7, CARD_Y0 - 8, 14, 14);
    });

    this.add.text(CARD_CX, CARD_Y0 + 12, "EXPONENT TRIAL — TEST CARD", { font: "bold 10px Georgia", color: "#8a6435" }).setOrigin(0.5).setDepth(21);
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

  showTrialOnCard(lines, questionText) {
    this.clearCardContent();
    const maxLen = Math.max(...lines.map((l) => l.length));
    const fontSize = maxLen > 42 ? 10 : maxLen > 30 ? 12 : 14;
    const lineH = fontSize + 11;
    const startY = CARD_Y0 + 60 + Math.max(0, 3 - lines.length) * (lineH / 2);
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
  }

  _codeTokenize(line) {
    const tokens = [];
    const re = /("(?:[^"\\]|\\.)*")|(\bint\b|\bdouble\b|\bfor\b|\bnew\b)|(\bMath\b)|(\.pow\b)|(-?\d+\.\d+|-?\d+)|([(){};,=+\-*/<>])/g;
    let last = 0, m;
    const plain = (t) => t && tokens.push({ t, c: "#241a0e" });
    while ((m = re.exec(line))) {
      if (m.index > last) plain(line.slice(last, m.index));
      if (m[1]) tokens.push({ t: m[1], c: "#2e7d32" });
      else if (m[2]) tokens.push({ t: m[2], c: "#1565c0" });
      else if (m[3]) tokens.push({ t: m[3], c: "#b8860b" });
      else if (m[4]) tokens.push({ t: m[4], c: HEX_CYAN });
      else if (m[5]) tokens.push({ t: m[5], c: "#e65100" });
      else if (m[6]) tokens.push({ t: m[6], c: /[()]/.test(m[6]) ? "#c62828" : "#78909c" });
      last = m.index + m[0].length;
    }
    if (last < line.length) plain(line.slice(last));
    return tokens.length ? tokens : [{ t: line, c: "#241a0e" }];
  }

  async stampCard(kind) {
    const labels = { passed: "TRIAL PASSED", failed: "TRIAL FAILED", void: "TRIAL VOID" };
    const colors = { passed: HEX_GREEN_BRIGHT, failed: HEX_RED, void: HEX_RED };
    const stamp = this.add.text(0, 0, labels[kind], { font: "bold 21px Georgia", color: colors[kind] }).setOrigin(0.5).setScale(1.4).setAngle(-8).setAlpha(0);
    this.cardStampLayer.add(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 180 });
    const hold = kind === "void" ? 1800 : 700;
    await this.delay(hold);
    if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 200, onComplete: () => stamp.destroy() });
    if (kind === "passed") {
      await new Promise((res) => { this.tweens.add({ targets: this.weightContainer, y: this.weightContainer.y - 3, duration: 100, yoyo: true, onComplete: res }); });
    }
  }

  // ══════════════════════════════════════════════════════════════
  // THE COUNTERWEIGHT (THE TIMER — hero mechanic)
  // ══════════════════════════════════════════════════════════════

  createCounterweight() {
    const drum = this.add.graphics().setDepth(4);
    drum.fillStyle(0x1a1408, 1);
    drum.lineStyle(2, C_BRASS, 1);
    drum.fillRoundedRect(DRUM_X - 12, DRUM_Y - 8, 24, 16, 3);
    drum.strokeRoundedRect(DRUM_X - 12, DRUM_Y - 8, 24, 16, 3);
    this.drumGear = this.add.graphics().setDepth(5);
    this._drawDrumGear(0);

    this.chainGfx = this.add.graphics().setDepth(4);

    this.weightContainer = this.add.container(WEIGHT_X, WEIGHT_Y0).setDepth(6);
    const wg = this.add.graphics();
    this.weightGfx = wg;
    const ring = this.add.circle(0, -28, 3, 0x1a1408, 1).setStrokeStyle(2, C_BRASS);
    const massLabel = this.add.text(0, 2, "14 kg", { font: "bold 11px Georgia", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.6);
    this.weightContainer.add([wg, ring, massLabel]);
    this._paintWeight(C_BRASS);

    this.weightShadow = this.add.ellipse(WEIGHT_X, PLATE_Y + 10, 40, 8, 0x000000, 0.3).setDepth(3);

    this.plateGfx = this.add.graphics().setDepth(3);
    this._paintPlate(0x8a6435);
    [[-24, 6], [24, 6], [-24, -6], [24, -6]].forEach(([dx, dy]) => {
      this.add.circle(WEIGHT_X + dx, PLATE_Y + 6 + dy, 2, 0x1a1408, 0.6).setDepth(4);
    });

    this.brakeLever = this.add.container(DRUM_X + 22, DRUM_Y).setDepth(5).setAlpha(0);
    const lg = this.add.graphics();
    lg.lineStyle(3, C_CYAN, 1);
    lg.lineBetween(0, 0, 10, -8);
    lg.fillStyle(C_CYAN, 1);
    lg.fillCircle(0, 0, 2);
    this.brakeLever.add(lg);

    this._warnState = "safe";
    this._weightHalted = true;
  }

  _paintWeight(color) {
    const g = this.weightGfx;
    g.clear();
    g.fillStyle(0x1a1408, 1);
    g.lineStyle(3, color, 1);
    g.beginPath();
    g.moveTo(-12, -25); g.lineTo(12, -25); g.lineTo(17, 25); g.lineTo(-17, 25);
    g.closePath();
    g.fillPath(); g.strokePath();
  }

  _paintPlate(strokeColor) {
    const g = this.plateGfx;
    g.clear();
    g.fillStyle(C_BRASS, 1);
    g.lineStyle(2, strokeColor, 1);
    g.fillRoundedRect(WEIGHT_X - 30, PLATE_Y, 60, 12, 3);
    g.strokeRoundedRect(WEIGHT_X - 30, PLATE_Y, 60, 12, 3);
  }

  _drawDrumGear(angleDeg) {
    this.drumGear.clear();
    this.drumGear.fillStyle(C_BRASS, 0.85);
    const teeth = 6, rOuter = 8, rInner = 5, cx = DRUM_X, cy = DRUM_Y;
    const pts = [];
    for (let i = 0; i < teeth * 2; i++) {
      const r = i % 2 === 0 ? rOuter : rInner;
      const a = (Math.PI / teeth) * i + Phaser.Math.DegToRad(angleDeg);
      pts.push(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    }
    this.drumGear.fillPoints(pts, true);
    this.drumGear.fillStyle(0x1a1408, 1);
    this.drumGear.fillCircle(cx, cy, 2);
  }

  _drawChain(weightY) {
    this.chainGfx.clear();
    this.chainGfx.fillStyle(C_BRASS, 0.7);
    const topY = DRUM_Y + 8, dash = 8, gap = 3;
    for (let y = topY; y < weightY - 26; y += dash + gap) {
      this.chainGfx.fillEllipse(WEIGHT_X, y, 6, 4);
    }
  }

  startWeightDescent(timeLimitMs) {
    this._killWeightTween();
    this.roundTimeLimit = timeLimitMs;
    this._weightProgress = 0;
    this._weightHalted = false;
    this._warnState = "safe";
    this.weightContainer.setPosition(WEIGHT_X, WEIGHT_Y0);
    this._paintWeight(C_BRASS);
    this._paintPlate(0x8a6435);
    this._drawChain(WEIGHT_Y0);
    this.brakeLever.setAlpha(0);
    this.weightShadow.setScale(0.6).setAlpha(0.2);
    const state = { v: 0 };
    this._weightTween = this.tweens.add({
      targets: state, v: 1, duration: timeLimitMs, ease: "Linear",
      onUpdate: () => { this._weightProgress = state.v; },
      onComplete: () => { if (this._alive && !this._weightHalted) this.onWeightTimeout(this._currentConfig); },
    });
  }

  _killWeightTween() {
    if (this._weightTween) { this._weightTween.stop(); this._weightTween = null; }
    this._stopCriticalPulse();
  }

  updateWeightDescent(time) {
    if (!this.weightContainer || this._weightHalted || this._weightProgress === undefined) return;
    const y = WEIGHT_Y0 + (WEIGHT_Y1 - WEIGHT_Y0) * this._weightProgress;
    this.weightContainer.setPosition(WEIGHT_X, y);
    this.weightShadow.setScale(0.6 + 0.4 * this._weightProgress).setAlpha(0.2 + 0.3 * this._weightProgress);
    this._drawChain(y);
    this._drawDrumGear(this._weightProgress * 500);
  }

  updateWeightUrgency(time) {
    if (!this.weightContainer || this._weightProgress === undefined) return;
    const rem = 1 - this._weightProgress;
    const state = rem <= 0.15 ? "critical" : rem <= 0.33 ? "warning" : "safe";
    if (state !== this._warnState) {
      this._warnState = state;
      if (state === "warning") { this._paintWeight(0xffab40); this._stopCriticalPulse(); }
      else if (state === "critical") { this._paintWeight(0xff6f60); this._startCriticalPulse(); }
      else { this._paintWeight(C_BRASS); this._stopCriticalPulse(); }
    }
    if (!this._weightHalted) {
      this.weightContainer.x = state === "critical" ? WEIGHT_X + (Math.random() - 0.5) * 2 : WEIGHT_X;
    }
  }

  _lerpColor(c1, c2, t) {
    const r1 = (c1 >> 16) & 0xff, g1 = (c1 >> 8) & 0xff, b1 = c1 & 0xff;
    const r2 = (c2 >> 16) & 0xff, g2 = (c2 >> 8) & 0xff, b2 = c2 & 0xff;
    const r = Math.round(r1 + (r2 - r1) * t), g = Math.round(g1 + (g2 - g1) * t), b = Math.round(b1 + (b2 - b1) * t);
    return (r << 16) | (g << 8) | b;
  }

  _startCriticalPulse() {
    if (this._platePulseTween) return;
    this._plateAlphaObj = { v: 0 };
    this._platePulseTween = this.tweens.add({
      targets: this._plateAlphaObj, v: 1, duration: 350, yoyo: true, repeat: -1,
      onUpdate: () => { this._paintPlate(this._lerpColor(0x8a6435, 0xff6f60, this._plateAlphaObj.v)); },
    });
  }

  _stopCriticalPulse() {
    if (this._platePulseTween) { this._platePulseTween.stop(); this._platePulseTween = null; }
    this._paintPlate(0x8a6435);
  }

  updateChainLinks(time) {
    if (!this.drumGear || this._weightHalted) return;
    const interval = this._warnState === "critical" ? 150 : this._warnState === "warning" ? 300 : 500;
    if (time - (this._lastClinkTime || 0) > interval) {
      this._lastClinkTime = time;
      const spark = this.add.circle(DRUM_X, DRUM_Y + 10, 2, C_GOLD, 0.6).setDepth(6);
      this.tweens.add({ targets: spark, alpha: 0, y: spark.y + 6, duration: 200, onComplete: () => spark.destroy() });
    }
  }

  async weightStrikes() {
    this._weightHalted = true;
    this._killWeightTween();
    this._stopCriticalPulse();
    this.screenShake(0.01, 180);
    this.tweens.add({ targets: this.plateGfx, y: 3, duration: 70, yoyo: true });
    const shock = this.add.circle(WEIGHT_X, PLATE_Y, 4, 0xffffff, 0.6).setDepth(7);
    this.tweens.add({ targets: shock, radius: 44, alpha: 0, duration: 380, onComplete: () => shock.destroy() });
    await this.delay(150);
    if (!this._alive) return;
    await this.stampCard("void");
  }

  async engageBrake() {
    this._weightHalted = true;
    this._killWeightTween();
    this._stopCriticalPulse();
    this.tweens.add({ targets: this.brakeLever, angle: -35, alpha: 1, duration: 120, ease: "Back.easeOut" });
    await this.delay(120);
    if (!this._alive) return;
    await new Promise((res) => { this.tweens.add({ targets: this.weightContainer, x: WEIGHT_X + 2, duration: 90, yoyo: true, repeat: 2, ease: "Sine.easeInOut", onComplete: res }); });
  }

  async hoistWeight() {
    await new Promise((res) => {
      this.tweens.add({
        targets: this.weightContainer, y: WEIGHT_Y0, duration: 500, ease: "Sine.easeInOut", onComplete: res,
        onUpdate: () => { this._drawChain(this.weightContainer.y); this._drawDrumGear(-this.time.now * 0.3); },
      });
    });
    this.weightContainer.setX(WEIGHT_X);
    this.brakeLever.setAlpha(0);
    this._paintWeight(C_BRASS);
    this._paintPlate(0x8a6435);
  }

  // ══════════════════════════════════════════════════════════════
  // MINI CASCADE ENGINE (55%-scale L61 engine, tuning tempo)
  // ══════════════════════════════════════════════════════════════

  createMiniCascade() {
    const g = this.add.graphics().setDepth(4);
    g.fillStyle(0x1a1408, 1);
    g.lineStyle(1.5, C_BRASS, 1);
    g.fillRoundedRect(MCE_CX - 70, MCE_ENTRY_Y + 14, 140, 14, 4);
    g.strokeRoundedRect(MCE_CX - 70, MCE_ENTRY_Y + 14, 140, 14, 4);

    const npBg = this.add.graphics().setDepth(5);
    npBg.fillStyle(0x060810, 1);
    npBg.lineStyle(1.5, C_GOLD, 1);
    npBg.fillRoundedRect(MCE_CX - 40, MCE_ENTRY_Y + 32, 80, 18, 3);
    npBg.strokeRoundedRect(MCE_CX - 40, MCE_ENTRY_Y + 32, 80, 18, 3);
    this.add.text(MCE_CX, MCE_ENTRY_Y + 41, "Math.pow", { font: "bold 11px Courier New", color: HEX_GOLD }).setOrigin(0.5).setDepth(6);

    const port = this.add.graphics().setDepth(4);
    port.lineStyle(1.5, C_BRASS, 0.8);
    port.strokeRoundedRect(MCE_CX - 10, MCE_ENTRY_Y - 6, 20, 14, { tl: 10, tr: 10, bl: 0, br: 0 });

    this.mceStageGfx = []; this.mceStageWindow = []; this.mceStageLabel = [];
    for (let i = 0; i < MCE_STAGE_COUNT; i++) {
      const y = MCE_STAGE_Y0 - i * MCE_STAGE_DY;
      const sg = this.add.graphics().setDepth(4);
      sg.fillStyle(0x0d1220, 1);
      sg.lineStyle(1.5, C_BRASS, 1);
      sg.fillRoundedRect(MCE_CX - 46, y - 13, 92, 26, 8);
      sg.strokeRoundedRect(MCE_CX - 46, y - 13, 92, 26, 8);
      this.mceStageGfx.push(sg);
      const wg = this.add.graphics().setDepth(5);
      wg.lineStyle(1.5, C_BRASS, 0.8);
      wg.strokeCircle(MCE_CX, y, 9);
      this.mceStageWindow.push(wg);
      const lbl = this.add.text(MCE_CX, y, "", { font: "bold 10px Courier New", color: HEX_GOLD }).setOrigin(0.5).setDepth(6).setAlpha(0);
      this.mceStageLabel.push(lbl);
    }

    const topStageTop = MCE_STAGE_Y0 - (MCE_STAGE_COUNT - 1) * MCE_STAGE_DY - 13;
    const cone = this.add.graphics().setDepth(4);
    cone.fillStyle(0x1a1408, 1);
    cone.lineStyle(1.5, C_GOLD, 1);
    cone.fillTriangle(MCE_CX - 14, topStageTop, MCE_CX + 14, topStageTop, MCE_CX, topStageTop - 20);
    cone.strokeTriangle(MCE_CX - 14, topStageTop, MCE_CX + 14, topStageTop, MCE_CX, topStageTop - 20);
    this.mceSummitY = topStageTop - 20;

    this.mceBypassGfx = this.add.graphics().setDepth(3);
    this._drawMceBypass();

    const chute = this.add.graphics().setDepth(3);
    chute.lineStyle(1.5, C_BRASS, 0.6);
    chute.lineBetween(MCE_CX, this.mceSummitY, MCE_PLINTH.x, MCE_PLINTH.y - 10);
    const plinthG = this.add.graphics().setDepth(3);
    plinthG.fillStyle(0x0a0d18, 1);
    plinthG.lineStyle(1.5, C_BRASS, 1);
    plinthG.fillCircle(MCE_PLINTH.x, MCE_PLINTH.y, 12);
    plinthG.strokeCircle(MCE_PLINTH.x, MCE_PLINTH.y, 12);

    this.mceStarLayer = this.add.container(0, 0).setDepth(8);
  }

  _drawMceBypass() {
    this.mceBypassGfx.clear();
    this.mceBypassGfx.lineStyle(1.2, C_CYAN, 0.35);
    const x = MCE_CX - 60;
    const dash = 4, gap = 3;
    let y = MCE_ENTRY_Y;
    while (y > this.mceSummitY) {
      const y2 = Math.max(this.mceSummitY, y - dash);
      this.mceBypassGfx.lineBetween(x, y, x, y2);
      y -= dash + gap;
    }
    this.mceBypassGfx.lineBetween(MCE_CX - 10, MCE_ENTRY_Y, x, MCE_ENTRY_Y);
    this.mceBypassGfx.lineBetween(x, this.mceSummitY, MCE_CX, this.mceSummitY);
  }

  _fmtDoubleForPrint(v) {
    const rounded = Math.round(v * 1e9) / 1e9;
    if (Number.isInteger(rounded)) return rounded.toFixed(1);
    return String(rounded);
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
    const R = 10 * scale;
    const pts = [];
    for (let i = 0; i < 8; i++) { const r = i % 2 === 0 ? R : R * 0.45; const a = (Math.PI / 4) * i - Math.PI / 2; pts.push(Math.cos(a) * r, Math.sin(a) * r); }
    g.fillPoints(pts, true);
    g.strokePoints(pts, true);
    const display = this._fmtStarValue(value, type);
    const txt = this.add.text(0, 0, display, { font: "bold 10px Courier New", color: "#060810" }).setOrigin(0.5);
    if (txt.width > R * 1.7) txt.setFontSize(6);
    c.add([g, txt]);
    return { container: c, gfx: g, text: txt, value, type, scale };
  }

  _mceRedrawStar(star, value, type, scale) {
    star.value = value; star.type = type; star.scale = scale;
    star.gfx.clear();
    const color = type === "double" ? C_ORANGE : C_GOLD;
    star.gfx.fillStyle(color, 0.9);
    star.gfx.lineStyle(1, Phaser.Display.Color.IntegerToColor(color).darken(30).color, 1);
    const R = 10 * scale;
    const pts = [];
    for (let i = 0; i < 8; i++) { const r = i % 2 === 0 ? R : R * 0.45; const a = (Math.PI / 4) * i - Math.PI / 2; pts.push(Math.cos(a) * r, Math.sin(a) * r); }
    star.gfx.fillPoints(pts, true);
    star.gfx.strokePoints(pts, true);
    const display = this._fmtStarValue(value, type);
    star.text.setFontSize(8).setText(display);
    if (star.text.width > R * 1.7) star.text.setFontSize(6);
  }

  _mceGrowthScale(base, product) {
    if (base === 0) return 1;
    const ratio = Math.abs(product / base);
    return Math.min(1.8, Math.pow(Math.max(ratio, 0.001), 0.15));
  }

  async mceSpawnBaseStar(value, type) {
    const star = this._mceMakeStar(value, type, MCE_CX, MCE_ENTRY_Y + 20);
    star.container.setAlpha(0);
    this.mceStarLayer.add(star.container);
    await new Promise((res) => { this.tweens.add({ targets: star.container, y: MCE_STAGE_Y0, alpha: 1, duration: 130, ease: "Sine.easeOut", onComplete: res }); });
    return star;
  }

  async mceIgniteStage(index, base, product, star) {
    const y = MCE_STAGE_Y0 - index * MCE_STAGE_DY;
    const wg = this.mceStageWindow[index];
    wg.clear();
    wg.fillStyle(C_GOLD, 0.3);
    wg.fillCircle(MCE_CX, y, 9);
    wg.lineStyle(1.5, C_GOLD, 1);
    wg.strokeCircle(MCE_CX, y, 9);
    const lbl = this.mceStageLabel[index];
    lbl.setText(`×${base}`).setAlpha(0);
    this.tweens.add({ targets: lbl, alpha: 1, duration: 80 });
    const scale = this._mceGrowthScale(base, product);
    await new Promise((res) => { this.tweens.add({ targets: star.container, y, duration: 100, ease: "Sine.easeOut", onComplete: res }); });
    this._mceRedrawStar(star, product, star.type, scale);
    await this.delay(60);
  }

  async mceEmergeSummit(finalValue, star) {
    await new Promise((res) => { this.tweens.add({ targets: star.container, y: this.mceSummitY, duration: 120, ease: "Sine.easeOut", onComplete: res }); });
    this._mceRedrawStar(star, finalValue, "double", Math.min(1.6, star.scale || 1));
    await this.delay(80);
    if (!this._alive) return { value: finalValue, type: "double" };
    await new Promise((res) => { this.tweens.add({ targets: star.container, x: MCE_PLINTH.x, y: MCE_PLINTH.y, duration: 150, ease: "Sine.easeIn", onComplete: res }); });
    this._mcePlinthStar = star;
    this.chalkEvaluationArrow(finalValue, "double");
    this.updateResultRow(finalValue, "double");
    return { value: finalValue, type: "double" };
  }

  async mceBypassZero(base, type) {
    const star = await this.mceSpawnBaseStar(base, type);
    await new Promise((res) => { this.tweens.add({ targets: star.container, x: MCE_CX - 60, duration: 90, ease: "Sine.easeInOut", onComplete: res }); });
    await new Promise((res) => { this.tweens.add({ targets: star.container, y: this.mceSummitY, duration: 130, ease: "Sine.easeInOut", onComplete: res }); });
    await new Promise((res) => { this.tweens.add({ targets: star.container, x: MCE_CX, duration: 90, ease: "Sine.easeInOut", onComplete: res }); });
    this._mceRedrawStar(star, 1, "double", 1);
    await this.delay(120);
    if (!this._alive) return { value: 1, type: "double" };
    await new Promise((res) => { this.tweens.add({ targets: star.container, x: MCE_PLINTH.x, y: MCE_PLINTH.y, duration: 140, ease: "Sine.easeIn", onComplete: res }); });
    this._mcePlinthStar = star;
    this.chalkEvaluationArrow(1, "double");
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
      wg.fillCircle(MCE_CX, y, 9);
      wg.lineStyle(1.5, C_CYAN, 0.8);
      wg.strokeCircle(MCE_CX, y, 9);
      await this.delay(20);
    }
    const result = Math.pow(base, exp);
    await new Promise((res) => { this.tweens.add({ targets: star.container, y: this.mceSummitY, duration: 160, ease: "Sine.easeInOut", onComplete: res }); });
    const shrinkScale = Math.min(1, this._mceGrowthScale(base, result));
    this._mceRedrawStar(star, result, "double", shrinkScale);
    await this.delay(120);
    if (!this._alive) return { value: result, type: "double" };
    this.mceStageWindow.forEach((wg, i) => { wg.clear(); wg.lineStyle(1.5, C_BRASS, 0.8); wg.strokeCircle(MCE_CX, MCE_STAGE_Y0 - i * MCE_STAGE_DY, 9); });
    await new Promise((res) => { this.tweens.add({ targets: star.container, x: MCE_PLINTH.x, y: MCE_PLINTH.y, duration: 140, ease: "Sine.easeIn", onComplete: res }); });
    this._mcePlinthStar = star;
    this.chalkEvaluationArrow(result, "double");
    this.updateResultRow(result, "double");
    return { value: result, type: "double" };
  }

  /** exp === 0 bypasses; non-integer exp runs the reverse-hum; integer
   * exp ≥ 0 runs a REAL repeated-multiplication loop — never a shortcut
   * Math.pow call for the visual/value. Exponents beyond the visible
   * stage count keep multiplying past the last animated window. */
  async runCascade(base, exp, type) {
    if (exp === 0) return await this.mceBypassZero(base, type);
    if (!Number.isInteger(exp)) return await this.mceFractionalCascade(base, exp, type);
    const star = await this.mceSpawnBaseStar(base, type);
    let product = base;
    const visualStages = Math.min(exp, MCE_STAGE_COUNT);
    for (let i = 0; i < visualStages; i++) {
      if (i > 0) product *= base;
      await this.mceIgniteStage(i, base, product, star);
      if (!this._alive) return { value: product, type: "double" };
    }
    for (let i = visualStages; i < exp; i++) product *= base;
    return await this.mceEmergeSummit(product, star);
  }

  resetCascade() {
    this.mceStageWindow.forEach((wg, i) => { wg.clear(); wg.lineStyle(1.5, C_BRASS, 0.8); wg.strokeCircle(MCE_CX, MCE_STAGE_Y0 - i * MCE_STAGE_DY, 9); });
    this.mceStageLabel.forEach((t) => { t.setAlpha(0); t.setText(""); });
    this.mceStarLayer.removeAll(true);
    if (this._mcePlinthStar) { this._mcePlinthStar.container.destroy(); this._mcePlinthStar = null; }
  }

  async mceDiscardFade() {
    if (!this._mcePlinthStar) return;
    const star = this._mcePlinthStar;
    this._mcePlinthStar = null;
    await this.delay(250);
    if (!this.firstBareCallAnnotationShown) {
      this.firstBareCallAnnotationShown = true;
      this.createAnnotation(MCE_PLINTH.x, MCE_PLINTH.y - 30, "returned... to no one", HEX_BLUE_GRAY);
    }
    await new Promise((res) => { this.tweens.add({ targets: star.container, alpha: 0, scale: 0.6, duration: 200, onComplete: () => { star.container.destroy(); res(); } }); });
  }

  async mceInstanceCallShudder(value, type) {
    const star = await this.mceSpawnBaseStar(value, type);
    await this.delay(80);
    this.tweens.add({ targets: star.container, x: star.container.x + 3, duration: 30, yoyo: true, repeat: 5 });
    const q = this.add.text(star.container.x, star.container.y - 18, "?", { font: "bold 16px Georgia", color: HEX_RED }).setOrigin(0.5).setDepth(20).setAlpha(0);
    this.roundElements.push(q);
    this.tweens.add({ targets: q, alpha: 1, duration: 80, yoyo: true, repeat: 3 });
    await this.delay(350);
    this.showCompileErrorStamp();
    await this.delay(450);
  }

  async mceIntAssignmentRejection() {
    if (this._mcePlinthStar) {
      const s = this._mcePlinthStar;
      this._mcePlinthStar = null;
      this.tweens.add({ targets: s.container, x: s.container.x + 3, duration: 25, yoyo: true, repeat: 5 });
      await this.delay(200);
      this.tweens.add({ targets: s.container, alpha: 0, duration: 180, onComplete: () => s.container.destroy() });
    }
    this.showCompileErrorStamp();
    await this.delay(450);
  }

  showCompileErrorStamp() {
    const stamp = this.add.text(CARD_CX, CARD_Y0 - 22, "COMPILE ERROR", { font: "bold 19px Arial", color: HEX_RED }).setOrigin(0.5).setDepth(30).setScale(1.4).setAngle(-6).setAlpha(0);
    this.roundElements.push(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 160 });
    this.screenShake(0.004, 130);
    this.time.delayedCall(900, () => { if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 200, onComplete: () => stamp.destroy() }); });
  }

  // ══════════════════════════════════════════════════════════════
  // TRIAL SLATE
  // ══════════════════════════════════════════════════════════════

  createTrialSlate() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0a0d18, 1);
    g.lineStyle(2, C_BRASS, 1);
    g.fillRoundedRect(SLATE_X, SLATE_Y, SLATE_W, SLATE_H, 8);
    g.strokeRoundedRect(SLATE_X, SLATE_Y, SLATE_W, SLATE_H, 8);
    this.add.text(SLATE_X + 12, SLATE_Y + 10, "TRIAL SLATE", { font: "bold 11px Georgia", color: HEX_BRASS }).setDepth(11);
    this.slateLines = this.add.container(0, 0).setDepth(11);
    this._slateY = SLATE_Y + 32;
    this.add.text(SLATE_X + 12, SLATE_Y + SLATE_H - 18, "result (double):", { font: "12px Georgia", color: "#8a6435" }).setDepth(11);
    this.resultText = this.add.text(SLATE_X + 108, SLATE_Y + SLATE_H - 18, "—", { font: "bold 14px Courier New", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(11);
  }

  async chalkWriteLine(text, color) {
    const t = this.add.text(SLATE_X + 12, this._slateY, "", { font: "bold 13px Courier New", color: color || "#e8eaf6" }).setDepth(11);
    this.slateLines.add(t);
    for (let i = 0; i < text.length; i++) {
      if (!this._alive) return;
      t.setText(t.text + text[i]);
      if (t.width > SLATE_W - 24) t.setFontSize(9);
      await this.delay(10);
    }
    this._slateY += 17;
    if (this._slateY > SLATE_Y + SLATE_H - 34) this._slateY = SLATE_Y + 32;
  }

  chalkEvaluationArrow(value, type) {
    const display = type === "double" ? this._fmtDoubleForPrint(Number(value)) : String(value);
    const t = this.add.text(SLATE_X + 12, this._slateY, `→ ${display}`, { font: "bold 13px Courier New", color: type === "double" ? HEX_ORANGE : HEX_GOLD }).setAlpha(0);
    this.slateLines.add(t);
    this.tweens.add({ targets: t, alpha: 1, duration: 120 });
    this._slateY += 17;
    if (this._slateY > SLATE_Y + SLATE_H - 34) this._slateY = SLATE_Y + 32;
  }

  wipeSlate() {
    this.slateLines.removeAll(true);
    this._slateY = SLATE_Y + 32;
  }

  updateResultRow(value, type) {
    if (value === null) { this.resultText.setFontSize(12).setText("—").setColor(HEX_GRAY); return; }
    const display = type === "double" ? this._fmtDoubleForPrint(Number(value)) : String(value);
    this.resultText.setFontSize(12).setText(display).setColor(type === "double" ? HEX_ORANGE : HEX_GOLD);
  }

  // ══════════════════════════════════════════════════════════════
  // CONTAINER SHELF
  // ══════════════════════════════════════════════════════════════

  createContainerShelf() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0a0d18, 1);
    g.lineStyle(2, C_BRASS, 1);
    g.fillRoundedRect(SHELF_X, SHELF_Y, SHELF_W, SHELF_H, 8);
    g.strokeRoundedRect(SHELF_X, SHELF_Y, SHELF_W, SHELF_H, 8);
    this.add.text(SHELF_X + 12, SHELF_Y + 8, "CONTAINERS", { font: "bold 11px Georgia", color: HEX_BRASS }).setDepth(11);
    this.shelfContainer = this.add.container(0, 0).setDepth(11);
  }

  updateContainerShelf(vars) {
    this.shelfContainer.removeAll(true);
    const names = Object.keys(vars || {});
    const y = SHELF_Y + 38;
    let x = SHELF_X + 14;
    names.forEach((name) => {
      const v = vars[name];
      const color = v.type === "double" ? C_ORANGE : C_GOLD;
      const hexColor = v.type === "double" ? HEX_ORANGE : HEX_GOLD;
      const display = v.type === "double" ? this._fmtDoubleForPrint(Number(v.value)) : String(v.value);
      const label = `${name}: ${display}`;
      const meas = this.add.text(0, 0, label, { font: "bold 12px Courier New", color: hexColor });
      const w = meas.width + 14;
      meas.destroy();
      if (x + w > SHELF_X + SHELF_W - 10) return;
      const c = this.add.container(x + w / 2, y).setAlpha(0);
      const bg = this.add.graphics();
      bg.fillStyle(0x0a1520, 1);
      bg.lineStyle(1.2, color, 0.8);
      bg.fillRoundedRect(-w / 2, -11, w, 22, 5);
      bg.strokeRoundedRect(-w / 2, -11, w, 22, 5);
      const txt = this.add.text(0, 0, label, { font: "bold 12px Courier New", color: hexColor }).setOrigin(0.5);
      c.add([bg, txt]);
      this.shelfContainer.add(c);
      this.tweens.add({ targets: c, alpha: 1, duration: 150 });
      x += w + 8;
    });
  }

  clearContainerShelf() {
    this.shelfContainer.removeAll(true);
  }

  // ══════════════════════════════════════════════════════════════
  // HUD
  // ══════════════════════════════════════════════════════════════

  createHUD() {
    const g = this.add.graphics().setDepth(49);
    g.fillStyle(0x04060c, 0.93);
    g.fillRect(0, 0, W, 64);
    g.lineStyle(1, 0x2a3654, 1);
    g.lineBetween(0, 64, W, 64);

    this.add.text(20, 14, "THE EXPONENT TRIALS", { font: "bold 17px Georgia", color: "#b0bec5" }).setDepth(50);
    this.add.text(20, 32, "Tuning Phase — Math Methods: pow()", { font: "13px Arial", color: "#546e7a" }).setDepth(50);

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
      lg.lineStyle(2, C_BRASS, 1);
      lg.strokeCircle(0, 0, 6);
      lg.fillStyle(C_BRASS, 1);
      lg.fillCircle(0, 0, 2);
      lg.lineBetween(5, -1, 11, -4);
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
  // BIT — TEST PROCTOR VARIANT
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
    const goggles = this.add.graphics();
    goggles.lineStyle(1.5, C_BRASS, 0.7);
    goggles.strokeCircle(-6, -26, 4);
    goggles.strokeCircle(6, -26, 4);
    goggles.lineBetween(-2, -26, 2, -26);
    const gloveL = this.add.circle(-16, 10, 4, 0xe0d6b8, 0.85);
    const clipboard = this.add.graphics();
    clipboard.fillStyle(0xe0d6b8, 0.5);
    clipboard.lineStyle(1, 0x8a6435, 0.6);
    clipboard.fillRoundedRect(14, 0, 12, 16, 1);
    clipboard.strokeRoundedRect(14, 0, 12, 16, 1);
    clipboard.fillStyle(0x78909c, 0.6);
    clipboard.fillRect(18, -1, 4, 2);
    clipboard.lineStyle(0.5, 0x8a6435, 0.4);
    [4, 7, 10, 13].forEach((dy) => clipboard.lineBetween(16, dy, 24, dy));
    const pencil = this.add.graphics();
    pencil.lineStyle(2, C_GOLD, 0.8);
    pencil.lineBetween(-24, -6, -18, -14);
    pencil.fillStyle(0x241a0e, 0.8);
    pencil.fillCircle(-18, -14, 1.4);
    const gloveR = this.add.circle(16, 10, 4, 0xe0d6b8, 0.85);
    c.add([g, cloak, eye, pupil, goggles, gloveL, clipboard, pencil, gloveR, tip]);
    this.tweens.add({ targets: tip, alpha: 0.3, duration: 900, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: c, y: "+=2", duration: 1870, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
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
        delay: 16, repeat: Math.max(0, text.length - 1),
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
    if (done) this.time.delayedCall(300, () => this.startWave(1));
    else this.runTutorial();
  }

  async runTutorial() {
    const A = () => this._alive;
    await this.delay(400); if (!A()) return;
    await this.bitSay("The Exponent Trials, Tester — where the cascade runs at speed and the weight keeps time. Every card gets one drop; brake the chain before the plate rings. Your power verdicts must be reflex tonight.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(5500)]); if (!A()) return;
    this.hideBubble();

    this.showTrialOnCard(["Math.pow(2, 4)"], "What does this return?");
    this.startWeightDescent(9000);
    await this.runReveal("Math.pow(2, 4)");
    if (!A()) return;
    const a1 = this.createAnnotation(CARD_CX, CARD_Y1 + 14, "the computation", HEX_BLUE_GRAY);
    const a2 = this.createAnnotation(WEIGHT_X, WEIGHT_Y1 + 30, "your time, falling", HEX_BLUE_GRAY);
    const a3 = this.createAnnotation(MCE_CX, MCE_ENTRY_Y + 60, "the stages, honest as ever", HEX_BLUE_GRAY);
    const a4 = this.createAnnotation(SHELF_X + SHELF_W / 2, SHELF_Y + SHELF_H + 16, "types matter — double always", HEX_BLUE_GRAY);
    await this.bitSay("Brake early, score the bonus. The testing floor is live!");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();
    [a1, a2, a3, a4].forEach((a) => a.destroy());
    this._killWeightTween();
    this.clearCardContent();
    this.wipeSlate();
    this.clearContainerShelf();
    this.updateResultRow(null, null);
    this.resetCascade();

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
      1: "WAVE 1 — RAPID POWERS",
      2: "WAVE 2 — THE FRACTIONAL DIAL",
      3: "WAVE 3 — DEEP COMPUTATIONS & BUG HUNT",
    };
    await this.showWaveBanner(banners[waveNumber]);
    if (!this._alive) return;
    if (waveNumber === 2) {
      await this.showBitFeedback("The dial goes between the marks now, Tester. Half a stage is a root; a third of a stage is a deeper root. And every answer exits in double — make the type a reflex before the weight falls.", 4500);
    } else if (waveNumber === 3) {
      await this.showBitFeedback("Final drops — compound traces and two flawed computations hiding in the cards. One forgot the cast; one swapped the arguments. The cascade tells the truth; your assumptions don't.", 4500);
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
    this.resetCascade();
    this.wipeSlate();
    this.clearContainerShelf();
    this.updateResultRow(null, null);
    this.cardRoundLabel.setText(`TRIAL ${index + 1}/15`);
    this.roundStartTime = this.time.now;

    const limit = config.type === "bughunt" ? 12000 : WAVE_TIME[config.wave];
    if (config.type === "predict" || config.type === "trace") this.setupPredict(config);
    else if (config.type === "bughunt") this.setupBugHunt(config);

    this.startWeightDescent(limit);
  }

  clearRound() {
    this.roundElements.forEach((e) => { if (e && e.destroy) e.destroy(); });
    this.roundElements = [];
    this.clearCardContent();
    this._bugHuntTokenObjs = [];
    if (this._bugHeaderTween) { this._bugHeaderTween.stop(); this._bugHeaderTween = null; }
  }

  async onWeightTimeout(config) {
    if (this.gameEnded) return;
    this.inputLocked = true;
    this.roundElements.forEach((e) => e.disableInteractive && e.disableInteractive());
    (this._bugHuntTokenObjs || []).forEach((t) => t.disableInteractive());
    this.logAttempt(config, false, null, "timeout", this.roundTimeLimit, 1);
    await this.weightStrikes();
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
    this.showTrialOnCard(lines, config.question);
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
    await this.engageBrake();
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

    await this.runReveal(config);
    if (!this._alive) return;
    await this.stampCard(correct ? "passed" : "failed");
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
      const isPhrase = isFaultLine && config.faultToken.includes("(");

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
    await this.engageBrake();
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
      const fixT = this.add.text(CARD_CX, lineY - 14, config.fix, { font: "bold 12px Courier New", color: "#2e7d32", wordWrap: { width: 380 } }).setOrigin(0.5).setAlpha(0);
      this.cardContentContainer.add(fixT);
      this.tweens.add({ targets: fixT, alpha: 1, duration: 220 });
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
    await this.stampCard(correct ? "passed" : "failed");
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
   * then reset and run the fixed version — both derived from the real
   * evaluator, never scripted. */
  async runDualFutureReveal(config) {
    await this.runReveal({ source: config.lines.filter((l) => !l.trim().startsWith("//")), wave: config.wave });
    await this.delay(400);
    if (!this._alive) return;
    this.wipeSlate();
    this.resetCascade();
    this.clearContainerShelf();
    this.updateResultRow(null, null);
    // The repair strategy depends on WHERE the fault lives: a type-
    // declaration fault (round 14) needs the whole line replaced (the
    // TYPE changed, not the call); a swapped-arguments fault (round 15)
    // needs only the faulty call substring replaced in place.
    const fixedLines = config.lines
      .map((l, i) => {
        if (i + 1 !== config.faultLine) return l;
        return config.tokenRegion === "type_declaration" ? config.fix : l.replace(config.faultToken, config.fix);
      })
      .filter((l) => !l.trim().startsWith("//"));
    await this.runReveal({ source: fixedLines, wave: config.wave });
  }

  // ══════════════════════════════════════════════════════════════
  // HONEST EVALUATOR — Math.pow (real cascade), Java int/int floor
  // division, nested pow, (int) truncation, a small for-loop engine
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

  _splitTopPM(expr) {
    const parts = [], ops = [];
    let cur = "", depth = 0;
    for (let i = 0; i < expr.length; i++) {
      const ch = expr[i];
      if (ch === "(") depth++;
      if (ch === ")") depth--;
      if (depth === 0 && (ch === "+" || ch === "-") && cur.trim() !== "") {
        parts.push(cur.trim()); ops.push(ch); cur = ""; continue;
      }
      cur += ch;
    }
    parts.push(cur.trim());
    return { parts, ops };
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

  _evalSimpleValue(expr, vars) {
    const t = expr.trim();
    if (/^-?\d+\.\d+$/.test(t)) return { ok: true, value: parseFloat(t), type: "double" };
    if (/^-?\d+$/.test(t)) return { ok: true, value: parseInt(t, 10), type: "int" };
    if (/^[A-Za-z_]\w*$/.test(t) && vars && vars[t] !== undefined) return { ok: true, value: vars[t].value, type: vars[t].type };
    return { ok: false, crash: "eval" };
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
      this.tweens.add({ targets: s.container, alpha: 0, duration: 120, onComplete: () => s.container.destroy() });
    }
    const result = await this.runCascade(baseRes.value, expRes.value, baseRes.type);
    return { ok: true, value: result.value, type: result.type };
  }

  /** Precedence-climbing resolver: +/- (this level) → * // (product) →
   * Math.pow / (int) cast / parens / literal (atom). Java's int/int
   * division floors toward zero — the "1/3 → 0" trap lives in the
   * product level, where both operand types are known. */
  async resolveTopLevelValue(expr, vars) {
    const t = expr.trim();
    const pm = this._splitTopPM(t);
    if (pm.parts.length > 1) {
      let total = null, sawDouble = false;
      for (let i = 0; i < pm.parts.length; i++) {
        const r = await this._resolveProduct(pm.parts[i], vars);
        if (!r.ok) return r;
        if (r.type === "double") sawDouble = true;
        const signedVal = i === 0 ? r.value : (pm.ops[i - 1] === "-" ? -r.value : r.value);
        total = total === null ? signedVal : total + signedVal;
        if (this._mcePlinthStar) {
          const s = this._mcePlinthStar;
          this._mcePlinthStar = null;
          this.tweens.add({ targets: s.container, alpha: 0, duration: 120, onComplete: () => s.container.destroy() });
        }
      }
      const finalType = sawDouble ? "double" : "int";
      const star = this._mceMakeStar(total, finalType, MCE_PLINTH.x, MCE_PLINTH.y);
      this.mceStarLayer.add(star.container);
      this._mcePlinthStar = star;
      this.chalkEvaluationArrow(total, finalType);
      this.updateResultRow(total, finalType);
      return { ok: true, value: finalType === "double" ? total : Math.round(total), type: finalType };
    }
    return await this._resolveProduct(t, vars);
  }

  async _resolveProduct(expr, vars) {
    const t = expr.trim();
    const md = this._splitTopMulDiv(t);
    if (md.parts.length > 1) {
      let acc = null, accType = null;
      for (let i = 0; i < md.parts.length; i++) {
        const r = await this._resolveAtom(md.parts[i], vars);
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
    return await this._resolveAtom(t, vars);
  }

  _isBalanced(s) {
    let depth = 0;
    for (const ch of s) { if (ch === "(") depth++; if (ch === ")") depth--; if (depth < 0) return false; }
    return depth === 0;
  }

  async _resolveAtom(expr, vars) {
    const t = expr.trim();
    const powMatch = t.match(/^Math\.pow\((.*)\)$/);
    if (powMatch) return await this.evalPowCall(powMatch[1], vars);
    const castMatch = t.match(/^\(int\)\s*(.+)$/);
    if (castMatch) {
      const r = await this.resolveTopLevelValue(castMatch[1].trim(), vars);
      if (!r.ok) return r;
      return { ok: true, value: Math.trunc(Number(r.value)), type: "int" };
    }
    const parenMatch = t.match(/^\((.*)\)$/);
    if (parenMatch && this._isBalanced(parenMatch[1])) return await this.resolveTopLevelValue(parenMatch[1], vars);
    return this._evalSimpleValue(t, vars);
  }

  async execStatement(line, vars) {
    const instanceMatch = line.match(/(\w+)\.pow\(/);
    if (instanceMatch && instanceMatch[1] !== "Math") {
      const token = instanceMatch[1];
      if (token === "math") { this.showCompileErrorStamp(); await this.delay(450); return { ok: false, crash: "compile" }; }
      let val = 0, typ = "int";
      if (vars[token] !== undefined) { val = vars[token].value; typ = vars[token].type; }
      else if (/^\d+$/.test(token)) { val = parseInt(token, 10); typ = "int"; }
      await this.mceInstanceCallShudder(val, typ);
      return { ok: false, crash: "compile" };
    }
    if (/new Math\(\)/.test(line)) { this.showCompileErrorStamp(); await this.delay(450); return { ok: false, crash: "compile" }; }

    const declVar = line.match(/^(int|double)\s+(\w+)\s*=\s*(.*);$/);
    if (declVar) {
      const varType = declVar[1], name = declVar[2], rhs = declVar[3].trim();
      const r = await this.resolveTopLevelValue(rhs, vars);
      if (!r.ok) return r;
      if (varType === "int" && r.type === "double") {
        await this.mceIntAssignmentRejection();
        return { ok: false, crash: "compile" };
      }
      vars[name] = { value: r.value, type: varType === "double" ? "double" : r.type };
      this.chalkEvaluationArrow(vars[name].value, vars[name].type);
      this.updateContainerShelf(vars);
      return { ok: true };
    }

    const bareMath = line.match(/^(Math\.pow\(.*\));$/);
    if (bareMath) {
      const r = await this.resolveTopLevelValue(bareMath[1], vars);
      if (!r.ok) return r;
      await this.mceDiscardFade();
      return { ok: true };
    }

    const printMatch = line.match(/^System\.out\.println\((.*)\);$/);
    if (printMatch) {
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
      await this.chalkWriteLine(`▸ ${out}`, HEX_CYAN);
      return { ok: true };
    }
    return { ok: true };
  }

  async runLine(line, vars) {
    if (!this._alive) return { ok: true };
    await this.chalkWriteLine(line, "#8ea6c8");
    return await this.execStatement(line, vars);
  }

  /** Detects a single `for (int V = start; V <= end; V++) { BODY }`
   * loop (round 11's shape only) and unrolls it into flat, literal-
   * substituted statements the normal evaluator can run unmodified. */
  _expandForLoop(lines) {
    const forIdx = lines.findIndex((l) => /^for\s*\(/.test(l.trim()));
    if (forIdx === -1) return null;
    const m = lines[forIdx].trim().match(/^for\s*\(int\s+(\w+)\s*=\s*(-?\d+)\s*;\s*\1\s*<=\s*(-?\d+)\s*;\s*\1\+\+\)\s*\{$/);
    if (!m) return null;
    const varName = m[1], start = parseInt(m[2], 10), end = parseInt(m[3], 10);
    const closeIdx = lines.findIndex((l, i) => i > forIdx && l.trim() === "}");
    const body = lines.slice(forIdx + 1, closeIdx === -1 ? lines.length : closeIdx).map((l) => l.trim()).filter(Boolean);
    const before = lines.slice(0, forIdx);
    const after = closeIdx === -1 ? [] : lines.slice(closeIdx + 1);
    const expanded = [];
    for (let v = start; v <= end; v++) {
      body.forEach((l) => expanded.push(l.replace(new RegExp(`\\b${varName}\\b`, "g"), String(v))));
    }
    return { before, expanded, after };
  }

  /** Runs a config's source (or a raw line array) through the honest
   * evaluator. A single bare Math.pow(...) expression (no assignment —
   * Wave 1/2's rapid-verdict rounds) is treated as a live expression
   * evaluation: run the call, show the arrow + result, done. */
  async runReveal(input) {
    const raw = input.lines ? input.lines : input.source !== undefined ? input.source : input;
    const lines = (Array.isArray(raw) ? raw : String(raw).split("\n")).map((l) => l.trim()).filter((l) => l && !l.startsWith("//"));
    this._printedLines = [];
    const vars = {};
    if (lines.length === 1) {
      const stripped = lines[0].replace(/;$/, "");
      if (/^Math\.pow\(.*\)$/.test(stripped)) {
        await this.chalkWriteLine(lines[0], "#8ea6c8");
        return await this.resolveTopLevelValue(stripped, vars);
      }
    }
    const loop = this._expandForLoop(lines);
    if (loop) {
      for (const l of loop.before) { if (!this._alive) return { ok: true }; const r = await this.runLine(l, vars); if (r && r.ok === false) return r; }
      for (const l of loop.expanded) { if (!this._alive) return { ok: true }; const r = await this.runLine(l, vars); if (r && r.ok === false) return r; }
      for (const l of loop.after) { if (!this._alive) return { ok: true }; const r = await this.runLine(l, vars); if (r && r.ok === false) return r; }
      return { ok: true };
    }
    for (const line of lines) {
      if (!this._alive) return { ok: true };
      const r = await this.runLine(line, vars);
      if (r && r.ok === false) return r;
    }
    return { ok: true };
  }

  // ══════════════════════════════════════════════════════════════
  // SCORING, LIVES, COMBO
  // ══════════════════════════════════════════════════════════════

  getComboMultiplier() { if (this.combo >= 5) return 3; if (this.combo >= 3) return 2; return 1; }

  scoreForAttempt(timePctUsed) {
    let points = 100 * this.getComboMultiplier();
    const remaining = 1 - timePctUsed;
    if (remaining > 0.6) { points += 50; this.fastBonusCount++; this.createFloatingText(CARD_CX, CARD_Y0 - 14, "⚡ EARLY BRAKE +50", HEX_GOLD, "bold 15px Arial", 900); }
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
      const effectivePrediction = (prediction === "typical" && misconception_repeat_count === 3)
        ? "struggling" : prediction;
      GameManager.fusionEngine.checkBehavioral(effectivePrediction);
    } catch (e) {
      console.warn("Level62Scene: /api/wellbeing/predict-struggle unreachable, skipping behavioral signal for this level:", e);
    }
  }

  advanceRound() {
    if (this.currentRound === 2) this.runBehavioralCheck();
    this.clearRound();
    const next = this.currentRound + 1;
    if (next >= ROUNDS.length) { this.levelComplete(); return; }
    const nextConfig = ROUNDS[next];
    if (nextConfig.wave !== this.currentWave) {
      this.hoistWeight().then(() => { if (this._alive && !this.gameEnded) this.startWave(nextConfig.wave); });
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
    this._killWeightTween();
    this.clearRound();
    this.hideBubble();

    (async () => {
      this.resetCascade();
      this.wipeSlate();
      this.clearContainerShelf();
      const motes = this.ambient;
      this.ambient = null;
      (motes || []).forEach((m) => this.tweens.add({ targets: m, y: 632, alpha: 0, duration: 1500, ease: "Sine.easeIn" }));

      const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
      this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });
      const title = this.add.text(640, 240, "TRIALS SUSPENDED", { font: "bold 36px Georgia", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
      this.tweens.add({ targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut", onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }) });
      this.add.text(640, 310, `Score: ${this.score}`, { font: "21px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
      this.add.text(640, 350, `Trials Passed: ${this.currentRound} / 15`, { font: "18px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);
      this._makeButton(525, 420, "HOIST THE WEIGHT", 200, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
      this._makeButton(755, 420, "RETURN TO MENU", 200, 50, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.start("MenuScene"));
    })();
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this._killWeightTween();
    this.clearRound();
    this.hideBubble();

    try { GameManager.completeLevel(62, Math.round((this.correctFirstTry / 15) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("math_pow_tuned"); } catch (_) {}
    try {
      localStorage.setItem("level62_results", JSON.stringify({
        level: 62, concept: "math_pow", phase: "tuning",
        score: this.score, accuracy: this.correctFirstTry / 15, avgTimePct: this.totalTimePctUsed / 15,
        fastBonuses: this.fastBonusCount, comboMax: this.maxCombo, stars: this._starRating(),
        livesRemaining: this.lives, attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.trialsFinale().then(() => { if (this._alive) this.showScoreTally(); });
  }

  async trialsFinale() {
    await this.hoistWeight();
    await this.stampCard("passed");
    this.createConfetti(CARD_CX, (CARD_Y0 + CARD_Y1) / 2, 30);
    ["²", "³", "⁴"].forEach((sup, i) => {
      this.time.delayedCall(i * 150, () => {
        if (!this._alive) return;
        const t = this.add.text(Phaser.Math.Between(CARD_X0 + 20, CARD_X1 - 20), Phaser.Math.Between(CARD_Y0 + 20, CARD_Y1 - 20), sup, { font: "bold 24px Georgia", color: HEX_GOLD }).setDepth(80).setAlpha(0);
        this.tweens.add({ targets: t, alpha: 1, y: t.y - 30, duration: 600, onComplete: () => { this.tweens.add({ targets: t, alpha: 0, duration: 400, onComplete: () => t.destroy() }); } });
      });
    });

    this.resetCascade();
    this.wipeSlate();
    this.updateResultRow(null, null);
    const star = await this.mceSpawnBaseStar(2, "int");
    let product = 2;
    for (let i = 0; i < MCE_STAGE_COUNT; i++) {
      if (i > 0) product *= 2;
      await this.mceIgniteStage(i, 2, product, star);
      if (!this._alive) return;
    }
    await this.mceEmergeSummit(product, star);
    this.createConfetti(MCE_PLINTH.x, MCE_PLINTH.y, 30);
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
    panel.fillStyle(0x0a0d18, 1);
    panel.fillRoundedRect(360, 145, 560, 430, 16);
    panel.lineStyle(2, C_BRASS, 1);
    panel.strokeRoundedRect(360, 145, 560, 430, 16);

    const title = this.add.text(640, 185, "TRIALS COMPLETE", { font: "bold 32px Georgia", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(91).setScale(0);
    this.tweens.add({ targets: title, scale: 1, duration: 350, ease: "Back.easeOut" });

    const acc = Math.round((this.correctFirstTry / 15) * 100);
    const avgSec = (this.totalTimeMs / 15 / 1000).toFixed(1);
    const lines = [
      `ACCURACY: ${acc}%`,
      `AVG RESPONSE: ${avgSec}s`,
      `EARLY-BRAKE BONUSES: ${this.fastBonusCount}`,
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
    bg.lineStyle(1.5, C_BRASS, 0.8);
    bg.lineBetween(0, -14, 0, 6);
    bg.fillStyle(C_GOLD, 0.9);
    bg.fillTriangle(-8, 6, 8, 6, 0, 14);
    badge.add(bg);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 2100 });
    const badgeLbl = this.add.text(640, 520, "pow() SCHEMA TUNED", { font: "bold 14px Georgia", color: HEX_GOLD }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: badgeLbl, alpha: 1, duration: 300, delay: 2250 });

    this._makeButton(500, 555, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(770, 555, "NEXT: The Formula Works →", 290, 44, { fill: 0x00733a, stroke: C_GREEN_BRIGHT, textColor: "#ffffff" }, () => {
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
