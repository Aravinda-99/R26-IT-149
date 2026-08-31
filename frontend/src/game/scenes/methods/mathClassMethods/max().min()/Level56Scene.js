/**
 * Level 56 — "The Meridian Trials" (Math Methods: Tuning Phase —
 * max()/min())
 * ===========================================================================
 * Tunes the Level 55 max()/min() schema through rapid transit-observation
 * trials. The eyepiece's drifting transit star IS the timer — one sweep
 * tween drives its x-position across the field; timeout fires from the
 * tween's onComplete when the star slips the exit limb. No parallel clock.
 *
 * New fluency material:
 *  - NEGATIVE NUMBERS: Math.max(-3, -7) returns -3 — the value CLOSER TO
 *    POSITIVE INFINITY, not the "bigger-looking" one. The number-line rail
 *    makes the ordering spatial: max sweeps rightmost, min sweeps leftmost.
 *  - THE CAP/FLOOR DISCRIMINATION: min against a limit caps (a ceiling);
 *    max against a limit floors (raises up). Drilled bidirectionally,
 *    including the two-sided CLAMP preview (max(low, min(x, high))).
 * The evaluator reuses L55's honest max/min tree-walk (resolve-both-values-
 * then-place-both-cradles for nested calls), extended with negative
 * literals, chained statements, and println concatenation (L37-style).
 */

import Phaser from "phaser";
import { GameManager } from "../../../../GameManager.js";
import { WellbeingAPI } from "../../../../../api/api.js";
import { BadgeSystem } from "../../../../BadgeSystem.js";
import { BehavioralRules } from "../../../../ml/BehavioralRules.js";

const W = 1280, H = 720;

const C_CYAN = 0x4fc3f7, C_GOLD = 0xffd740, C_ORANGE = 0xff9800, C_BLUE_GRAY = 0x8ea6c8;
const C_GREEN_BRIGHT = 0x00e676, C_RED = 0xf44336, C_GRAY = 0x78909c, C_BRASS = 0xc8a05a;
const HEX_CYAN = "#4fc3f7", HEX_GOLD = "#ffd740", HEX_ORANGE = "#ff9800", HEX_BLUE_GRAY = "#8ea6c8";
const HEX_GREEN_BRIGHT = "#00e676", HEX_RED = "#f44336", HEX_GRAY = "#78909c", HEX_BRASS = "#c8a05a";

// Observation slip
const SLIP_X0 = 330, SLIP_X1 = 760, SLIP_Y0 = 110, SLIP_Y1 = 450;
const SLIP_CX = (SLIP_X0 + SLIP_X1) / 2, SLIP_CY = (SLIP_Y0 + SLIP_Y1) / 2;
// Eyepiece (the transit timer)
const EYE_CX = 985, EYE_CY = 280, EYE_R = 165;
// Mini comparator (55%-scale Great Comparator)
const MC_BEAM_CX = 985, MC_BEAM_Y = 500;
const MC_CRADLE_A = { x: 900, y: 560 }, MC_CRADLE_B = { x: 1070, y: 560 };
const MC_PLINTH = { x: 985, y: 612 };
// Number-line rail
const RAIL_X0 = 350, RAIL_X1 = 745, RAIL_Y = 484;
// Observation slate
const SLATE_X = 830, SLATE_Y = 88, SLATE_W = 310, SLATE_H = 108;

const TUTORIAL_KEY = "level56_tutorial_done";
const WAVE_TIME = { 1: 12000, 2: 10000, 3: 9000 };

// ══════════════════════════════════════════════════════════════
// ROUND CONFIGURATION
// ══════════════════════════════════════════════════════════════
const ROUNDS = [
  // ══ WAVE 1 — Rapid Verdicts (12s) ══
  { round: 1, wave: 1, type: "predict",
    source: "Math.max(4, 11)",
    question: "What does this return?", correct: "11",
    options: [
      { value: "11", tag: null },
      { value: "4", tag: "max_min_direction_confusion" },
      { value: "15", tag: "max_adds_belief" },
      { value: "7", tag: "max_subtracts_belief" }
    ],
    concept: "fluent_max" },

  { round: 2, wave: 1, type: "predict",
    source: "Math.min(20, 8)",
    question: "What does this return?", correct: "8",
    options: [
      { value: "8", tag: null },
      { value: "20", tag: "max_min_direction_confusion" },
      { value: "12", tag: "min_subtracts_belief" },
      { value: "0", tag: "min_returns_zero_belief" }
    ],
    concept: "fluent_min" },

  { round: 3, wave: 1, type: "predict",
    source: "int a = 7;\nint r = a.max(12);",
    question: "What happens?", correct: "compile_error",
    options: [
      { value: "compile_error", tag: null, label: "COMPILE ERROR — int has no methods" },
      { value: "returns_12", tag: "instance_call_on_number_belief", label: "r = 12" },
      { value: "returns_7", tag: "instance_call_on_number_belief", label: "r = 7" },
      { value: "runtime_error", tag: "runtime_vs_compile_confusion", label: "Runtime exception" }
    ],
    revealNote: "The stability probe — at speed, the reflex must hold: numbers carry no instruments. Math.max(a, 12). The class name is the address, tonight and always.",
    concept: "fluent_static_probe" },

  { round: 4, wave: 1, type: "predict",
    source: "int r = Math.max(6, 6);",
    question: "What is stored in r?", correct: "6",
    options: [
      { value: "6", tag: null },
      { value: "12", tag: "max_adds_belief" },
      { value: "0", tag: "equal_returns_zero_belief" },
      { value: "error", tag: "equal_args_error_belief", label: "Runtime error" }
    ],
    concept: "fluent_equal" },

  { round: 5, wave: 1, type: "predict",
    source: "int r = Math.min(3, Math.min(9, 2));",
    question: "What is stored in r?", correct: "2",
    options: [
      { value: "2", tag: null },
      { value: "3", tag: "nested_outer_first_belief" },
      { value: "9", tag: "max_min_direction_confusion" },
      { value: "14", tag: "max_adds_belief" }
    ],
    revealNote: "Inner first: min(9, 2) → 2; the arm carries 2 outward; min(3, 2) → 2. The faintest of three, found in two measurements.",
    concept: "fluent_nested" },

  // ══ WAVE 2 — The Negative Sky (10s) ══
  { round: 6, wave: 2, type: "predict",
    source: "Math.max(-3, -7)",
    question: "What does this return?", correct: "-3",
    options: [
      { value: "-3", tag: null },
      { value: "-7", tag: "negative_max_confusion" },
      { value: "3", tag: "max_strips_sign_belief" },
      { value: "-10", tag: "max_adds_belief" }
    ],
    revealNote: "THE trap of the negative sky: -3 sits RIGHT of -7 on the rail — closer to zero, closer to positive infinity. Max means rightmost, not biggest-looking.",
    concept: "negative_max" },

  { round: 7, wave: 2, type: "predict",
    source: "Math.min(-2, -9)",
    question: "What does this return?", correct: "-9",
    options: [
      { value: "-9", tag: null },
      { value: "-2", tag: "negative_min_confusion" },
      { value: "9", tag: "min_strips_sign_belief" },
      { value: "-11", tag: "max_adds_belief" }
    ],
    revealNote: "The mirror: -9 sits LEFTMOST — deepest below zero. Min sweeps left. On the rail, direction is everything.",
    concept: "negative_min" },

  { round: 8, wave: 2, type: "predict",
    source: "Math.max(-5, 0)",
    question: "What does this return?", correct: "0",
    options: [
      { value: "0", tag: null },
      { value: "-5", tag: "zero_beats_negative_confusion" },
      { value: "5", tag: "max_strips_sign_belief" },
      { value: "-5_or_0", tag: "equal_args_error_belief", label: "Error — can't compare with zero" }
    ],
    revealNote: "Zero is a citizen of the rail like any other — and it sits RIGHT of every negative. Zero beats -5 at max, always.",
    concept: "zero_vs_negative" },

  { round: 9, wave: 2, type: "predict",
    source: "int r = Math.max(-4, Math.min(-1, -6));",
    question: "What is stored in r?", correct: "-4",
    options: [
      { value: "-4", tag: null },
      { value: "-6", tag: "nested_outer_first_belief" },
      { value: "-1", tag: "clamp_order_confusion" },
      { value: "4", tag: "max_strips_sign_belief" }
    ],
    revealNote: "Inner: min(-1, -6) → -6 (leftmost). Outer: max(-4, -6) → -4 (rightmost). Two rail sweeps, opposite directions, all below zero.",
    concept: "negative_nested" },

  { round: 10, wave: 2, type: "predict",
    source: "double r = Math.min(-2.5, -2);",
    question: "What is stored in r?", correct: "-2.5",
    options: [
      { value: "-2.5", tag: null },
      { value: "-2", tag: "negative_min_confusion" },
      { value: "-2.0", tag: "double_rounds_belief" },
      { value: "compile_error", tag: "int_double_mix_error_belief", label: "COMPILE ERROR — mixed types" }
    ],
    revealNote: "-2.5 sits LEFT of -2 — half a step deeper below zero. The int widens (gold warms to orange), the double edition runs, and the rail settles it.",
    concept: "negative_double_mix" },

  // ══ WAVE 3 — Deep Transits & Bug Hunt ══
  { round: 11, wave: 3, type: "trace",
    source: 'int a = Math.max(3, 8);\nint b = Math.min(a, 5);\nSystem.out.println(b);',
    question: "What prints?", correct: "5",
    options: [
      { value: "5", tag: null },
      { value: "8", tag: "second_call_ignored" },
      { value: "3", tag: "max_min_direction_confusion" },
      { value: "13", tag: "max_adds_belief" }
    ],
    revealNote: "Chained verdicts: max(3, 8) → 8 lands in a; min(8, 5) → 5 lands in b; the println announces 5. Captured results feed the next measurement.",
    concept: "trace_chained_calls" },

  { round: 12, wave: 3, type: "trace",
    source: "int x = 14;\nint clamped = Math.max(0, Math.min(x, 10));\nSystem.out.println(clamped);",
    question: "What prints?", correct: "10",
    options: [
      { value: "10", tag: null, label: "10 — capped at the ceiling" },
      { value: "14", tag: "clamp_not_applied", label: "14" },
      { value: "0", tag: "clamp_order_confusion", label: "0 — floored" },
      { value: "compile_error", tag: "mixed_nest_invalid_belief", label: "COMPILE ERROR" }
    ],
    revealNote: "THE CLAMP — inner min(14, 10) → 10 caps the ceiling; outer max(0, 10) → 10 clears the floor. One line pins x into [0, 10].",
    concept: "trace_clamp_preview" },

  { round: 13, wave: 3, type: "trace",
    source: 'int t1 = -3;\nint t2 = -8;\nint t3 = -1;\nint warmest = Math.max(t1, Math.max(t2, t3));\nSystem.out.println("Warmest: " + warmest);',
    question: "What prints?", correct: "Warmest: -1",
    options: [
      { value: "Warmest: -1", tag: null },
      { value: "Warmest: -8", tag: "negative_max_confusion" },
      { value: "Warmest: -3", tag: "nested_outer_first_belief" },
      { value: "Warmest: 1", tag: "max_strips_sign_belief" }
    ],
    revealNote: "Three below-zero readings: inner max(-8, -1) → -1 (rightmost); outer max(-3, -1) → -1. The warmest winter night is the one closest to zero.",
    concept: "trace_negative_triple" },

  { round: 14, wave: 3, type: "bughunt",
    lines: ["int score = 82;", "int capped = Math.max(score, 100);", "System.out.println(capped);", "// intent: cap the score at 100"],
    faultToken: "max", faultLine: 2, tokenRegion: "method_name",
    fix: "Math.min(score, 100)",
    explanation: "The direction mix-up — max against a limit is a FLOOR: it RAISED 82 to 100. A cap needs min: min(82, 100) → 82 passes through. min caps, max floors.",
    wrongTag: "cap_floor_swap",
    revealNote: "Dual-future reveal: the buggy run's rail sweep goes RIGHT and flares at 100 — 82 became 100. Reset; the fixed min-run sweeps LEFT, 82 passes through untouched.",
    concept: "cap_floor_bug" },

  { round: 15, wave: 3, type: "bughunt",
    lines: ["int m1 = 45;", "int m2 = 71;", "int m3 = 88;", "int peak = Math.max(m1, m2);", 'System.out.println("Peak: " + peak);', "// intent: the highest of ALL THREE readings"],
    faultToken: "Math.max(m1, m2)", faultLine: 4, tokenRegion: "incomplete_call",
    fix: "Math.max(m1, Math.max(m2, m3))",
    explanation: "The unreached candidate — m3 never touched a cradle, and m3 held the peak. Two cradles judge two values; the third needs a nested second measurement.",
    wrongTag: "third_value_ignored",
    revealNote: "Dual-future reveal: the buggy run measures 45 vs 71 → 71, while 88 sits unmeasured, flagged with a fading red ring. Reset; the fixed nested run reaches 88.",
    concept: "unreached_candidate_bug" },
];

const MISCONCEPTION_FEEDBACK = {
  instance_call_on_number_belief: "At speed, the reflex must hold — numbers carry no instruments. Math dot max, tonight and always.",
  max_min_direction_confusion: "Check the needle — max swings to the LARGER, min to the SMALLER. Read which question you're asking.",
  max_adds_belief: "The Comparator never does arithmetic — it CHOOSES. One argument comes back, untouched.",
  max_subtracts_belief: "The Comparator never does arithmetic — it CHOOSES. One argument comes back, untouched.",
  min_subtracts_belief: "The Comparator never does arithmetic — it CHOOSES. One argument comes back, untouched.",
  min_returns_zero_belief: "The Comparator always hands back one of the two ARGUMENTS — never zero.",
  equal_returns_zero_belief: "Equal values are no crisis — the answer equals both, not zero.",
  equal_args_error_belief: "Equal values are no crisis — the answer equals both. The needle shrugs and hands over the shared value.",
  nested_outer_first_belief: "Inner first, always — the deepest call resolves before its parent can even begin.",
  runtime_vs_compile_confusion: "Bad syntax and forbidden calls die at COMPILE time — before anything runs.",
  negative_max_confusion: "Below zero, 'bigger-looking' lies — -3 sits RIGHT of -7 on the rail, closer to zero, so max picks it. Read positions, not sign-stripped sizes.",
  negative_min_confusion: "Min sweeps LEFT — the deepest below zero wins. The minus signs just place the stars.",
  max_strips_sign_belief: "The Comparator returns an argument EXACTLY as it arrived — signs intact. No stripping, no flipping.",
  min_strips_sign_belief: "The Comparator returns an argument EXACTLY as it arrived — signs intact. No stripping, no flipping.",
  zero_beats_negative_confusion: "Zero is a full citizen of the rail — and it sits right of EVERY negative. At max, zero beats them all.",
  double_rounds_belief: "No rounding at the Comparator — the double edition ran and returned the value whole, half-step and all.",
  int_double_mix_error_belief: "Mixed cradles are fine — the int quietly widens to a double, and the double edition of the method runs.",
  clamp_order_confusion: "The clamp reads inside-out: min against the HIGH pins the ceiling first; max against the LOW clears the floor second.",
  clamp_not_applied: "The verdicts ran — watch the rail: the ceiling capped the value before the floor ever looked at it.",
  mixed_nest_invalid_belief: "max and min nest together freely — each is just a value-producing call, and any call can be an argument to another.",
  second_call_ignored: "Every statement runs — the first verdict became the second call's cradle-mate. Trace the relay one measurement at a time.",
  third_value_ignored: "The unmeasured value held the record — every candidate must pass through a cradle. Nest to reach the third.",
  cap_floor_swap: "min caps (a ceiling), max floors (a trampoline). Against a limit, the method name IS the behavior — check which way the rail swept.",
  bare_call_stores_result_belief: "Nothing is saved unless YOU catch it. Assign it, print it, or nest it; Java keeps no lost-and-found.",
  timeout: "The star slipped the limb! Fluent observers log before the crossing wires. Verdict first, doubt later.",
};

export class Level56Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level56Scene" });
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
    this.firstNegativeAnnotationShown = false;
    this.baseTutorialScene = "Level55Scene";
  }

  preload() {}

  create() {
    this._alive = true;
    this.createParticleTexture();
    this.createBackground();
    this.createDomeDim();
    this.createMeridianTelescope();
    this.createPrecisionClock();
    this.createObserversChair();
    this.createMeridianBanner();
    this.createObservatoryFloor();
    this.createParticles();
    this.createObservationSlip();
    this.createEyepiece();
    this.createMiniComparator();
    this.createNumberLineRail();
    this.createObservationSlate();
    this.createHUD();
    this.createBit();

    this.events.on("shutdown", () => { this._alive = false; this._killTransitTween(); });
    this.checkTutorial();
  }

  update(time, delta) {
    if (GameManager.interventionInFlight) {
      if (this._transitTween && !this._transitTween.isPaused()) {
        this._transitTween.pause();
        this._transitHalted = true;
      }
      return;
    } else {
      if (this._transitTween && this._transitTween.isPaused()) {
        this._transitTween.resume();
        this._transitHalted = false;
      }
    }
    this.updateParticles(time, delta);
    this.updatePendulum(time);
    this.updateTransitDrift(time);
    this.updateFieldStarsTwinkle(time);
    this.updateNeedleIdle(time);
  }

  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }
  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }

  // ══════════════════════════════════════════════════════════════
  // SETUP — BACKGROUND & ROOM DRESSING
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l56_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l56_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x04060c).setDepth(0);
  }

  createDomeDim() {
    const g = this.add.graphics().setDepth(1).setAlpha(0.6);
    g.lineStyle(3, 0x2a3654, 0.6);
    g.beginPath(); g.arc(640, 480, 720, Math.PI * 1.18, Math.PI * 1.82, false); g.strokePath();
    g.lineStyle(1, 0x2a3654, 0.3);
    for (let i = 0; i <= 12; i++) {
      const a = Math.PI * 1.18 + (Math.PI * 0.64 * i) / 12;
      g.lineBetween(640 + Math.cos(a) * 700, 480 + Math.sin(a) * 700, 640 + Math.cos(a) * 720, 480 + Math.sin(a) * 720);
    }
    g.fillStyle(0x02030a, 1);
    g.fillRect(560, 20, 160, 60);
    this._nightStars = [];
    for (let i = 0; i < 10; i++) {
      const s = this.add.circle(Phaser.Math.Between(566, 714), Phaser.Math.Between(26, 74), 1, 0xe8eaf6, Phaser.Math.FloatBetween(0.2, 0.5)).setDepth(2);
      this._nightStars.push({ obj: s, phase: Phaser.Math.Between(0, 3000) });
    }
  }

  createMeridianTelescope() {
    const g = this.add.graphics().setDepth(3);
    g.fillStyle(0x1a1408, 1);
    g.lineStyle(2, C_BRASS, 1);
    g.beginPath();
    g.moveTo(104, 526); g.lineTo(136, 526); g.lineTo(292, 176); g.lineTo(268, 182);
    g.closePath();
    g.fillPath(); g.strokePath();
    // stone piers + axle
    g.fillStyle(0x0d1220, 1);
    g.lineStyle(1.5, 0x2a3654, 1);
    g.fillRect(73, 400, 34, 180); g.strokeRect(73, 400, 34, 180);
    g.fillRect(213, 400, 34, 180); g.strokeRect(213, 400, 34, 180);
    g.lineStyle(4, 0x2a3654, 1);
    g.lineBetween(90, 470, 230, 470);
    g.fillStyle(C_BRASS, 0.7);
    g.fillCircle(90, 470, 7); g.fillCircle(230, 470, 7);
    this.add.text(90, 392, "MERIDIAN CIRCLE", { font: "bold 10px Georgia", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.5).setDepth(4);
  }

  createPrecisionClock() {
    const c = this.add.container(1150, 120).setDepth(3);
    const g = this.add.graphics();
    g.lineStyle(1.5, C_BRASS, 0.5);
    g.strokeRect(-18, -45, 36, 90);
    c.add(g);
    const pivot = this.add.container(0, -30);
    const pend = this.add.graphics();
    pend.lineStyle(1.5, C_BRASS, 0.6);
    pend.lineBetween(0, 0, 0, 46);
    pend.fillStyle(C_BRASS, 0.6);
    pend.fillCircle(0, 46, 4);
    pivot.add(pend);
    c.add(pivot);
    this._pendulum = pivot;
  }

  updatePendulum(time) {
    if (!this._pendulum) return;
    this._pendulum.setAngle(Math.sin(time * 0.00314) * 12);
  }

  createObserversChair() {
    const g = this.add.graphics().setDepth(2).setAlpha(0.4);
    g.lineStyle(2, 0x8a6435, 1);
    g.lineBetween(230, 590, 300, 590);
    g.lineBetween(230, 590, 210, 500);
    g.lineBetween(300, 590, 320, 480);
    g.lineBetween(210, 500, 320, 480);
    g.lineBetween(230, 590, 235, 620);
    g.lineBetween(300, 590, 295, 620);
  }

  createMeridianBanner() {
    const g = this.add.graphics().setDepth(2);
    g.fillStyle(0x04060c, 1);
    g.lineStyle(1, C_BRASS, 0.5);
    g.fillRoundedRect(400, 12, 360, 26, 3);
    g.strokeRoundedRect(400, 12, 360, 26, 3);
    this.add.text(580, 25, "T H E   M E R I D I A N   T R I A L S", { font: "bold 15px Georgia", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.7).setDepth(3);
  }

  createObservatoryFloor() {
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
      p.y += step * (i % 2 === 0 ? 1 : -0.6);
      p.x += Math.sin(time * 0.0003 + i) * 0.02;
      if (p.y > 630) p.y = 150; if (p.y < 150) p.y = 630;
      if (p.x > W) p.x = 0; if (p.x < 0) p.x = W;
    });
  }

  updateFieldStarsTwinkle(time) {
    if (!this._fieldStars) return;
    this._fieldStars.forEach((s) => {
      const t = (time + s.phase) % 2600;
      s.obj.setAlpha(0.15 + Math.abs(Math.sin((t / 2600) * Math.PI)) * 0.25);
    });
    if (this._nightStars) this._nightStars.forEach((s) => {
      const t = (time + s.phase) % 3000;
      s.obj.setAlpha(0.2 + Math.abs(Math.sin((t / 3000) * Math.PI)) * 0.3);
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
    const p = this.add.particles(x, y, "l56_dot", {
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
  // THE OBSERVATION SLIP
  // ══════════════════════════════════════════════════════════════

  createObservationSlip() {
    const g = this.add.graphics().setDepth(20);
    g.fillStyle(0xe0d6b8, 1);
    g.lineStyle(2, 0x8a6435, 1);
    g.fillRoundedRect(SLIP_X0, SLIP_Y0, SLIP_X1 - SLIP_X0, SLIP_Y1 - SLIP_Y0, 4);
    g.strokeRoundedRect(SLIP_X0, SLIP_Y0, SLIP_X1 - SLIP_X0, SLIP_Y1 - SLIP_Y0, 4);
    g.fillStyle(0x8a6435, 0.15);
    g.fillRect(SLIP_X0, SLIP_Y0, SLIP_X1 - SLIP_X0, 24);
    g.lineStyle(1, 0x8a6435, 0.15);
    for (let y = SLIP_Y0 + 48; y < SLIP_Y1 - 44; y += 20) g.lineBetween(SLIP_X0 + 16, y, SLIP_X1 - 16, y);

    this.add.text(SLIP_CX, SLIP_Y0 + 12, "TRANSIT OBSERVATION — FORM 7", { font: "bold 10px Georgia", color: "#8a6435" }).setOrigin(0.5).setDepth(21);
    this.slipRoundLabel = this.add.text(SLIP_X1 - 14, SLIP_Y0 + 12, "TRANSIT 1/15", { font: "bold 11px Courier New", color: "#8a6435" }).setOrigin(1, 0.5).setDepth(21);
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
    const re = /("(?:[^"\\]|\\.)*")|(\bint\b|\bdouble\b|\bnew\b)|(\bMath\b)|(\bmax\b|\bmin\b)|(-?\d+\.\d+|-?\d+)|([(){};,=+.])/g;
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
    const labels = { logged: "TRANSIT LOGGED", misread: "MISREAD", missed: "TRANSIT MISSED" };
    const colors = { logged: HEX_GREEN_BRIGHT, misread: HEX_RED, missed: HEX_RED };
    const stamp = this.add.text(0, 0, labels[kind], { font: "bold 21px Georgia", color: colors[kind] }).setOrigin(0.5).setScale(1.4).setAngle(-8).setAlpha(0);
    this.slipStampLayer.add(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 180 });
    const hold = kind === "missed" ? 1800 : 700;
    await this.delay(hold);
    if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 200, onComplete: () => stamp.destroy() });
  }

  // ══════════════════════════════════════════════════════════════
  // THE EYEPIECE (THE TRANSIT TIMER — hero mechanic)
  // ══════════════════════════════════════════════════════════════

  createEyepiece() {
    const housing = this.add.graphics().setDepth(15);
    housing.lineStyle(3, C_BRASS, 1);
    housing.strokeCircle(EYE_CX, EYE_CY, EYE_R);
    housing.lineStyle(1.5, C_BRASS, 0.8);
    housing.strokeCircle(EYE_CX, EYE_CY, EYE_R - 13);
    [45, 135, 225, 315].forEach((deg) => {
      const a = Phaser.Math.DegToRad(deg);
      const x = EYE_CX + Math.cos(a) * EYE_R, y = EYE_CY + Math.sin(a) * EYE_R;
      this.add.circle(x, y, 5, 0x8a6435).setDepth(15);
    });

    this.fieldContainer = this.add.container(0, 0).setDepth(10);
    const fieldBg = this.add.circle(EYE_CX, EYE_CY, EYE_R - 14, 0x02030a);
    this.fieldContainer.add(fieldBg);

    const maskShape = this.make.graphics({ x: 0, y: 0, add: false });
    maskShape.fillStyle(0xffffff);
    maskShape.fillCircle(EYE_CX, EYE_CY, EYE_R - 14);
    this.fieldContainer.setMask(maskShape.createGeometryMask());

    this._fieldStars = [];
    for (let i = 0; i < 9; i++) {
      const ang = Phaser.Math.FloatBetween(0, Math.PI * 2), rad = Phaser.Math.FloatBetween(10, EYE_R - 34);
      const s = this.add.circle(EYE_CX + Math.cos(ang) * rad, EYE_CY + Math.sin(ang) * rad, 1, 0xe8eaf6, 0.2);
      this.fieldContainer.add(s);
      this._fieldStars.push({ obj: s, phase: Phaser.Math.Between(0, 3000) });
    }

    this.reticleGfx = this.add.graphics();
    this.reticleGfx.lineStyle(1, C_BLUE_GRAY, 0.35);
    this.reticleGfx.lineBetween(EYE_CX - EYE_R + 16, EYE_CY, EYE_CX + EYE_R - 16, EYE_CY);
    this.reticleGfx.lineBetween(EYE_CX, EYE_CY - EYE_R + 16, EYE_CX, EYE_CY + EYE_R - 16);
    this.reticleGfx.lineStyle(1, C_BLUE_GRAY, 0.25);
    this.reticleGfx.lineBetween(EYE_CX - 28, EYE_CY - EYE_R + 16, EYE_CX - 28, EYE_CY + EYE_R - 16);
    this.reticleGfx.lineBetween(EYE_CX + 28, EYE_CY - EYE_R + 16, EYE_CX + 28, EYE_CY + EYE_R - 16);
    this.fieldContainer.add(this.reticleGfx);

    this.limbGfx = this.add.graphics();
    this.fieldContainer.add(this.limbGfx);
    this._drawLimb(0.15);

    this.transitStar = this._makeTransitStar();
    this.fieldContainer.add(this.transitStar.container);
    this._transitStreak = [];
    for (let i = 0; i < 3; i++) {
      const d = this.add.circle(0, 0, 2, 0xe8eaf6, 0.28 - i * 0.08);
      this.fieldContainer.add(d);
      this._transitStreak.push(d);
    }
    this._warnState = "safe";
  }

  _makeTransitStar() {
    const c = this.add.container(EYE_CX - (EYE_R - 20), EYE_CY);
    const glow = this.add.circle(0, 0, 14, 0xe8eaf6, 0.22);
    const g = this.add.graphics();
    c.add([glow, g]);
    this._paintTransitStar(g, 0xe8eaf6);
    return { container: c, glow, gfx: g };
  }

  _paintTransitStar(g, color) {
    g.clear();
    g.fillStyle(color, 1);
    const pts = [];
    for (let i = 0; i < 8; i++) { const r = i % 2 === 0 ? 9 : 4; const a = (Math.PI / 4) * i - Math.PI / 2; pts.push(Math.cos(a) * r, Math.sin(a) * r); }
    g.fillPoints(pts, true);
  }

  _drawLimb(alpha) {
    this.limbGfx.clear();
    this.limbGfx.lineStyle(4, C_RED, alpha);
    const r = EYE_R - 14;
    this.limbGfx.beginPath();
    this.limbGfx.arc(EYE_CX, EYE_CY, r, -0.5, 0.5, false);
    this.limbGfx.strokePath();
  }

  startTransit(timeLimitMs) {
    this._killTransitTween();
    this.roundTimeLimit = timeLimitMs;
    this._transitProgress = 0;
    this._transitHalted = false;
    this._transitCrossed = false;
    this._warnState = "safe";
    this._drawLimb(0.15);
    this.transitStar.container.setAlpha(1).setPosition(EYE_CX - (EYE_R - 20), EYE_CY);
    this._transitStreak.forEach((d) => d.setAlpha(0.28));
    this._paintTransitStar(this.transitStar.gfx, 0xe8eaf6);
    this.transitStar.glow.setFillStyle(0xe8eaf6, 0.22);
    const state = { v: 0 };
    this._transitTween = this.tweens.add({
      targets: state, v: 1, duration: timeLimitMs, ease: "Linear",
      onUpdate: () => { this._transitProgress = state.v; },
      onComplete: () => { if (this._alive && !this._transitHalted) this.onTransitTimeout(this._currentConfig); },
    });
  }

  _killTransitTween() {
    if (this._transitTween) { this._transitTween.stop(); this._transitTween = null; }
    this._stopCriticalPulse();
  }

  updateTransitDrift() {
    if (!this.transitStar || this._transitHalted || this._transitProgress === undefined) return;
    const leftX = EYE_CX - (EYE_R - 20), rightX = EYE_CX + (EYE_R - 20);
    const x = leftX + (rightX - leftX) * this._transitProgress;
    this.transitStar.container.setPosition(x, EYE_CY);
    this._transitStreak.forEach((d, i) => d.setPosition(x - (i + 1) * 7, EYE_CY));
    if (!this._transitCrossed && this._transitProgress >= 0.5) {
      this._transitCrossed = true;
      this.meridianCrossingBeat();
    }
    this.updateTransitUrgency();
  }

  updateTransitUrgency() {
    const rem = 1 - (this._transitProgress || 0);
    const state = rem <= 0.15 ? "critical" : rem <= 0.33 ? "warning" : "safe";
    if (state === this._warnState) return;
    this._warnState = state;
    if (state === "warning") {
      this._paintTransitStar(this.transitStar.gfx, 0xffcc80);
      this.transitStar.glow.setFillStyle(0xffcc80, 0.25);
      this._drawLimb(0.3);
      this._stopCriticalPulse();
    } else if (state === "critical") {
      this._paintTransitStar(this.transitStar.gfx, 0xff8a80);
      this.transitStar.glow.setFillStyle(0xff8a80, 0.3);
      this._startCriticalPulse();
    } else {
      this._paintTransitStar(this.transitStar.gfx, 0xe8eaf6);
      this.transitStar.glow.setFillStyle(0xe8eaf6, 0.22);
      this._drawLimb(0.15);
      this._stopCriticalPulse();
    }
  }

  _startCriticalPulse() {
    if (this._limbPulseTween) return;
    this._limbAlphaObj = { v: 0.3 };
    this._limbPulseTween = this.tweens.add({
      targets: this._limbAlphaObj, v: 0.55, duration: 400, yoyo: true, repeat: -1,
      onUpdate: () => this._drawLimb(this._limbAlphaObj.v),
    });
  }

  _stopCriticalPulse() {
    if (this._limbPulseTween) { this._limbPulseTween.stop(); this._limbPulseTween = null; }
  }

  meridianCrossingBeat() {
    const flash = this.add.rectangle(EYE_CX, EYE_CY, 2, (EYE_R - 14) * 2, 0xffffff, 0.4);
    this.fieldContainer.add(flash);
    this.tweens.add({ targets: flash, alpha: 0, duration: 250, onComplete: () => flash.destroy() });
  }

  async haltStarAndCapture() {
    this._transitHalted = true;
    this._killTransitTween();
    const x = this.transitStar.container.x, y = this.transitStar.container.y;
    const frame = this.add.graphics().setDepth(2);
    frame.lineStyle(2, C_CYAN, 1);
    const s = 14;
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => {
      frame.beginPath();
      frame.moveTo(x + sx * s, y + sy * (s - 6));
      frame.lineTo(x + sx * s, y + sy * s);
      frame.lineTo(x + sx * (s - 6), y + sy * s);
      frame.strokePath();
    });
    this.fieldContainer.add(frame);
    await this.delay(150);
    if (frame.active) frame.destroy();
  }

  async starExitsField() {
    this._transitHalted = true;
    await new Promise((res) => {
      this.tweens.add({ targets: [this.transitStar.container, ...this._transitStreak], alpha: 0, duration: 200, onComplete: res });
    });
    await this.delay(300);
    await this.stampSlip("missed");
  }

  // ══════════════════════════════════════════════════════════════
  // MINI COMPARATOR (55%-scale Great Comparator, tuning tempo)
  // ══════════════════════════════════════════════════════════════

  createMiniComparator() {
    const g = this.add.graphics().setDepth(4);
    g.fillStyle(0x1a1408, 1);
    g.lineStyle(1.5, C_BRASS, 1);
    g.fillRoundedRect(MC_BEAM_CX - 120, MC_BEAM_Y - 6, 240, 12, 4);
    g.strokeRoundedRect(MC_BEAM_CX - 120, MC_BEAM_Y - 6, 240, 12, 4);

    const npBg = this.add.graphics().setDepth(5);
    npBg.fillStyle(0x060810, 1);
    npBg.lineStyle(1.5, C_GOLD, 1);
    npBg.fillRoundedRect(MC_BEAM_CX - 38, MC_BEAM_Y - 28, 76, 20, 3);
    npBg.strokeRoundedRect(MC_BEAM_CX - 38, MC_BEAM_Y - 28, 76, 20, 3);
    this.add.text(MC_BEAM_CX, MC_BEAM_Y - 18, "Math", { font: "bold 13px Courier New", color: HEX_GOLD }).setOrigin(0.5).setDepth(6);

    const modeBg = this.add.graphics().setDepth(5);
    modeBg.fillStyle(0x0a0d18, 1);
    modeBg.lineStyle(1, C_CYAN, 0.7);
    modeBg.fillRoundedRect(MC_BEAM_CX - 24, MC_BEAM_Y + 6, 48, 13, 3);
    modeBg.strokeRoundedRect(MC_BEAM_CX - 24, MC_BEAM_Y + 6, 48, 13, 3);
    this.mcModeText = this.add.text(MC_BEAM_CX, MC_BEAM_Y + 12, ".max", { font: "bold 11px Courier New", color: HEX_CYAN }).setOrigin(0.5).setDepth(6);

    [MC_CRADLE_A, MC_CRADLE_B].forEach((c) => {
      g.lineStyle(1, C_BRASS, 0.5);
      g.lineBetween(c.x, MC_BEAM_Y + 6, c.x, c.y - 12);
    });

    this.mcCradleGfx = { a: this.add.graphics().setDepth(4), b: this.add.graphics().setDepth(4) };
    [["a", MC_CRADLE_A], ["b", MC_CRADLE_B]].forEach(([key, pos]) => {
      const cg = this.mcCradleGfx[key];
      cg.fillStyle(0x141a2c, 1);
      cg.lineStyle(1.5, C_BRASS, 1);
      cg.fillEllipse(pos.x, pos.y, 52, 20);
      cg.strokeEllipse(pos.x, pos.y, 52, 20);
    });

    this.mcNeedle = this.add.container(MC_BEAM_CX, MC_BEAM_Y + 6).setDepth(7);
    const ng = this.add.graphics();
    ng.fillStyle(0x1a1408, 1);
    ng.lineStyle(1, C_BRASS, 1);
    ng.fillTriangle(-2, 0, 2, 0, 0, 24);
    ng.fillStyle(C_BRASS, 1);
    ng.fillCircle(0, 0, 2.5);
    this.mcNeedle.add(ng);

    const chute = this.add.graphics().setDepth(3);
    chute.lineStyle(2, C_BRASS, 0.6);
    chute.beginPath();
    chute.moveTo(MC_BEAM_CX - 5, MC_BEAM_Y + 6);
    chute.lineTo(MC_BEAM_CX - 5, MC_PLINTH.y - 14);
    chute.lineTo(MC_PLINTH.x, MC_PLINTH.y - 14);
    chute.strokePath();
    const plinthG = this.add.graphics().setDepth(3);
    plinthG.fillStyle(0x0a0d18, 1);
    plinthG.lineStyle(1.5, C_BRASS, 1);
    plinthG.fillCircle(MC_PLINTH.x, MC_PLINTH.y, 14);
    plinthG.strokeCircle(MC_PLINTH.x, MC_PLINTH.y, 14);

    this.mcStarLayer = this.add.container(0, 0).setDepth(8);
    this._mcCurrentMode = null;
  }

  mcSetModePlate(method) {
    if (this._mcCurrentMode === method) return;
    this._mcCurrentMode = method;
    this.tweens.add({
      targets: this.mcModeText, scaleY: 0, duration: 80,
      onComplete: () => { this.mcModeText.setText(`.${method}`); this.tweens.add({ targets: this.mcModeText, scaleY: 1, duration: 80 }); },
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
    for (let i = 0; i < 8; i++) { const r = i % 2 === 0 ? 13 : 6; const a = (Math.PI / 4) * i - Math.PI / 2; pts.push(Math.cos(a) * r, Math.sin(a) * r); }
    g.fillPoints(pts, true);
    g.strokePoints(pts, true);
    const display = type === "double" ? Number(value).toFixed(1) : String(value);
    const txt = this.add.text(0, 0, display, { font: "bold 12px Courier New", color: "#060810" }).setOrigin(0.5);
    if (txt.width > 24) txt.setFontSize(8);
    c.add([g, txt]);
    return { container: c, gfx: g, text: txt, value, type };
  }

  async mcSpawnStar(value, type, cradleKey) {
    const pos = cradleKey === "a" ? MC_CRADLE_A : MC_CRADLE_B;
    const star = this._mcMakeStar(value, type, pos.x, pos.y);
    star.container.setAlpha(0).setScale(0);
    this.mcStarLayer.add(star.container);
    await new Promise((res) => { this.tweens.add({ targets: star.container, alpha: 1, scale: 1.1, duration: 120, ease: "Back.easeOut", onComplete: () => { this.tweens.add({ targets: star.container, scale: 1, duration: 80 }); res(); } }); });
    if (cradleKey === "a") this._mcStarsA = star; else this._mcStarsB = star;
    return star;
  }

  mcResetCradles() {
    if (this._mcStarsA) { this._mcStarsA.container.destroy(); this._mcStarsA = null; }
    if (this._mcStarsB) { this._mcStarsB.container.destroy(); this._mcStarsB = null; }
    if (this._mcPlinthStar) { this._mcPlinthStar.container.destroy(); this._mcPlinthStar = null; }
  }

  async mcCarryStar(starObj, cradleKey) {
    const pos = cradleKey === "a" ? MC_CRADLE_A : MC_CRADLE_B;
    await new Promise((res) => { this.tweens.add({ targets: starObj.container, x: pos.x, y: pos.y - 20, duration: 160, ease: "Sine.easeInOut", onComplete: res }); });
    await new Promise((res) => { this.tweens.add({ targets: starObj.container, y: pos.y, duration: 100, ease: "Sine.easeOut", onComplete: res }); });
    if (cradleKey === "a") this._mcStarsA = starObj; else this._mcStarsB = starObj;
  }

  _mcWarmStarToDouble(star) {
    star.type = "double";
    star.gfx.clear();
    star.gfx.fillStyle(C_ORANGE, 0.9);
    star.gfx.lineStyle(1, Phaser.Display.Color.IntegerToColor(C_ORANGE).darken(30).color, 1);
    const pts = [];
    for (let i = 0; i < 8; i++) { const r = i % 2 === 0 ? 13 : 6; const a = (Math.PI / 4) * i - Math.PI / 2; pts.push(Math.cos(a) * r, Math.sin(a) * r); }
    star.gfx.fillPoints(pts, true);
    star.gfx.strokePoints(pts, true);
    star.text.setText(Number(star.value).toFixed(1));
  }

  async mcNeedleOscillate() {
    const angles = [-26, 22, -16];
    for (const a of angles) {
      await new Promise((res) => { this.tweens.add({ targets: this.mcNeedle, angle: a, duration: 80, ease: "Sine.easeInOut", onComplete: res }); });
    }
  }

  async mcNeedleLock(side) {
    const angle = side === "a" ? -32 : 32;
    await new Promise((res) => { this.tweens.add({ targets: this.mcNeedle, angle, duration: 80, ease: "Back.easeOut", onComplete: res }); });
    const chime = this.add.circle(MC_BEAM_CX, MC_BEAM_Y + 6, 4, C_GOLD, 0.5).setDepth(9);
    this.tweens.add({ targets: chime, scale: 3, alpha: 0, duration: 220, onComplete: () => chime.destroy() });
  }

  async mcDescendReturnStar(value, type, sourceStar) {
    if (this._mcPlinthStar) { this._mcPlinthStar.container.destroy(); this._mcPlinthStar = null; }
    const from = sourceStar ? { x: sourceStar.container.x, y: sourceStar.container.y } : { x: MC_BEAM_CX, y: MC_BEAM_Y };
    const copy = this._mcMakeStar(value, type, from.x, from.y - 8);
    copy.container.setScale(0.6);
    this.mcStarLayer.add(copy.container);
    await new Promise((res) => { this.tweens.add({ targets: copy.container, x: MC_BEAM_CX - 5, y: MC_PLINTH.y - 14, duration: 160, ease: "Sine.easeIn", onComplete: res }); });
    if (!this._alive) return;
    await new Promise((res) => { this.tweens.add({ targets: copy.container, x: MC_PLINTH.x, y: MC_PLINTH.y, duration: 160, ease: "Sine.easeIn", onComplete: res }); });
    this._mcPlinthStar = copy;
    this.chalkEvaluationArrow(value, type);
    this.updateResultRow(value, type);
  }

  async mcDiscardFade() {
    if (!this._mcPlinthStar) return;
    const star = this._mcPlinthStar;
    this._mcPlinthStar = null;
    await this.delay(300);
    await new Promise((res) => { this.tweens.add({ targets: star.container, alpha: 0, scale: 0.6, duration: 250, onComplete: () => { star.container.destroy(); res(); } }); });
  }

  async mcInstanceCallShudder(value, type) {
    const star = await this.mcSpawnStar(value, type, "a");
    await this.delay(120);
    this.tweens.add({ targets: star.container, x: star.container.x + 3, duration: 35, yoyo: true, repeat: 5 });
    const q = this.add.text(star.container.x, star.container.y - 24, "?", { font: "bold 18px Georgia", color: HEX_RED }).setOrigin(0.5).setDepth(20).setAlpha(0);
    this.roundElements.push(q);
    this.tweens.add({ targets: q, alpha: 1, duration: 90, yoyo: true, repeat: 3 });
    await this.delay(400);
    this.showCompileErrorStamp();
    await this.delay(500);
  }

  showCompileErrorStamp() {
    const stamp = this.add.text(SLIP_CX, SLIP_Y0 - 22, "COMPILE ERROR", { font: "bold 19px Arial", color: HEX_RED }).setOrigin(0.5).setDepth(30).setScale(1.4).setAngle(-6).setAlpha(0);
    this.roundElements.push(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 160 });
    this.screenShake(0.004, 130);
    this.time.delayedCall(900, () => { if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 200, onComplete: () => stamp.destroy() }); });
  }

  // ══════════════════════════════════════════════════════════════
  // THE NUMBER-LINE RAIL
  // ══════════════════════════════════════════════════════════════

  createNumberLineRail() {
    this.railGfx = this.add.graphics().setDepth(14);
    this.railLabels = this.add.container(0, 0).setDepth(15);
    this.railMarkers = this.add.container(0, 0).setDepth(16);
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
    this.railGfx.clear();
    this.railGfx.lineStyle(2, C_BRASS, 0.6);
    this.railGfx.lineBetween(RAIL_X0, RAIL_Y, RAIL_X1, RAIL_Y);
    this._railEntries = null;
  }

  async placeOnRail(entries) {
    this.clearRail();
    const vals = entries.map((e) => Number(e.value));
    let lo = Math.min(...vals, 0), hi = Math.max(...vals, 0);
    const pad = Math.max(1, hi - lo) * 0.2;
    lo -= pad; hi += pad;
    const toX = (v) => RAIL_X0 + ((v - lo) / (hi - lo)) * (RAIL_X1 - RAIL_X0);

    const span = hi - lo;
    const tickStep = this._niceStep(span / 8);
    for (let v = Math.ceil(lo / tickStep) * tickStep; v <= hi; v += tickStep) {
      const x = toX(v);
      const isZero = Math.abs(v) < 1e-9;
      this.railGfx.lineStyle(isZero ? 2 : 1, C_BRASS, isZero ? 0.9 : 0.4);
      this.railGfx.lineBetween(x, RAIL_Y - (isZero ? 8 : 5), x, RAIL_Y + (isZero ? 8 : 5));
      const lbl = this.add.text(x, RAIL_Y + 13, isZero ? "0" : String(Math.round(v * 10) / 10), { font: "11px Courier New", color: HEX_BLUE_GRAY }).setOrigin(0.5).setAlpha(0.7);
      this.railLabels.add(lbl);
    }

    for (const e of entries) {
      const x = toX(Number(e.value));
      const m = this.add.container(x, RAIL_Y - 40).setAlpha(0);
      const dot = this.add.circle(0, 0, 5, e.type === "double" ? C_ORANGE : C_GOLD, 1);
      const lbl = this.add.text(0, -14, e.type === "double" ? Number(e.value).toFixed(1) : String(e.value), { font: "bold 11px Courier New", color: e.type === "double" ? HEX_ORANGE : HEX_GOLD }).setOrigin(0.5);
      m.add([dot, lbl]);
      this.railMarkers.add(m);
      await new Promise((res) => { this.tweens.add({ targets: m, y: RAIL_Y, alpha: 1, duration: 180, ease: "Bounce.easeOut", onComplete: res }); });
      e._railMarker = m;
    }
    this._railEntries = entries;
  }

  async railSweep(method, winSide) {
    const entries = this._railEntries;
    if (!entries) return;
    const winner = winSide === "a" ? entries[0] : entries[1];
    if (!winner || !winner._railMarker) return;
    const color = method === "max" ? C_GOLD : C_CYAN;
    const fromX = method === "max" ? RAIL_X0 : RAIL_X1;
    const toX = winner._railMarker.x;
    const sweepLine = this.add.rectangle(fromX, RAIL_Y, 4, 12, color, 0.7);
    this.railMarkers.add(sweepLine);
    await new Promise((res) => { this.tweens.add({ targets: sweepLine, x: toX, duration: 320, ease: "Cubic.easeOut", onComplete: res }); });
    sweepLine.destroy();
    this.tweens.add({ targets: winner._railMarker, scale: 1.5, duration: 140, yoyo: true });
    const glow = this.add.circle(winner._railMarker.x, RAIL_Y, 10, color, 0.3);
    this.railMarkers.add(glow);
    this.tweens.add({ targets: glow, alpha: 0, scale: 2, duration: 350, onComplete: () => glow.destroy() });
    if (!this.firstNegativeAnnotationShown && (Number(entries[0].value) < 0 || Number(entries[1].value) < 0)) {
      this.firstNegativeAnnotationShown = true;
      this.createAnnotation(SLIP_CX, RAIL_Y + 30, "max = rightmost on the line — not biggest-looking", HEX_BLUE_GRAY);
    }
  }

  // ══════════════════════════════════════════════════════════════
  // OBSERVATION SLATE
  // ══════════════════════════════════════════════════════════════

  createObservationSlate() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0a0d18, 1);
    g.lineStyle(2, C_BRASS, 1);
    g.fillRoundedRect(SLATE_X, SLATE_Y, SLATE_W, SLATE_H, 8);
    g.strokeRoundedRect(SLATE_X, SLATE_Y, SLATE_W, SLATE_H, 8);
    this.add.text(SLATE_X + 12, SLATE_Y + 10, "OBSERVATION SLATE", { font: "bold 11px Georgia", color: HEX_BRASS }).setDepth(11);
    this.slateLines = this.add.container(0, 0).setDepth(11);
    this._slateY = SLATE_Y + 32;
    this.add.text(SLATE_X + 12, SLATE_Y + SLATE_H - 18, "result:", { font: "12px Georgia", color: "#8a6435" }).setDepth(11);
    this.resultText = this.add.text(SLATE_X + 58, SLATE_Y + SLATE_H - 18, "—", { font: "bold 14px Courier New", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(11);
  }

  async chalkWriteLine(text, color) {
    const t = this.add.text(SLATE_X + 12, this._slateY, "", { font: "bold 13px Courier New", color: color || "#e8eaf6" }).setDepth(11);
    this.slateLines.add(t);
    for (let i = 0; i < text.length; i++) {
      if (!this._alive) return;
      t.setText(t.text + text[i]);
      if (t.width > SLATE_W - 24) t.setFontSize(9);
      await this.delay(16);
    }
    this._slateY += 18;
    if (this._slateY > SLATE_Y + SLATE_H - 36) this._slateY = SLATE_Y + 32;
  }

  chalkEvaluationArrow(value, type) {
    const display = type === "double" ? Number(value).toFixed(1) : String(value);
    const t = this.add.text(SLATE_X + 12, this._slateY, `→ ${display}`, { font: "bold 13px Courier New", color: this._mcTypeColorHex(type) }).setAlpha(0);
    this.slateLines.add(t);
    this.tweens.add({ targets: t, alpha: 1, duration: 120 });
    this._slateY += 18;
    if (this._slateY > SLATE_Y + SLATE_H - 36) this._slateY = SLATE_Y + 32;
  }

  wipeSlate() {
    this.slateLines.removeAll(true);
    this._slateY = SLATE_Y + 32;
  }

  updateResultRow(value, type) {
    if (value === null) { this.resultText.setFontSize(12).setText("—").setColor(HEX_GRAY); return; }
    if (type === "crash") { this.resultText.setText("✗ ERROR").setColor(HEX_RED).setFontSize(10); return; }
    const display = type === "double" ? Number(value).toFixed(1) : String(value);
    this.resultText.setFontSize(12).setText(display).setColor(this._mcTypeColorHex(type));
  }

  updateNeedleIdle(time) {
    if (this._mcNeedleBusy) return;
    this.mcNeedle.setAngle(Math.sin(time * 0.0015) * 1);
  }

  mcResetNeedle() {
    this._mcNeedleBusy = false;
    this.mcNeedle.setAngle(0);
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

    this.add.text(20, 14, "THE MERIDIAN TRIALS", { font: "bold 17px Georgia", color: "#b0bec5" }).setDepth(50);
    this.add.text(20, 32, "Tuning Phase — max() & min()", { font: "13px Arial", color: "#546e7a" }).setDepth(50);

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

  // ══════════════════════════════════════════════════════════════
  // BIT — TRANSIT OBSERVER VARIANT
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
    [[-6, -4], [4, 2], [-2, 10]].forEach(([px, py]) => { cloak.fillStyle(C_GOLD, 0.6); cloak.fillCircle(px, py, 1); });
    const gloveL = this.add.circle(-16, 10, 4, 0xe0d6b8, 0.85);
    const gloveR = this.add.circle(16, 10, 4, 0xe0d6b8, 0.85);
    // red-lensed observer's lamp
    const lamp = this.add.graphics();
    lamp.fillStyle(0x2e2e2e, 1);
    lamp.fillRect(15, 5, 8, 6);
    lamp.fillStyle(0xc62828, 0.6);
    lamp.fillCircle(19, 8, 4);
    // transit logbook under one arm
    const book = this.add.graphics();
    book.fillStyle(0x3a2618, 0.8);
    book.lineStyle(1, 0x8a6435, 0.6);
    book.fillRoundedRect(-24, 2, 9, 13, 1);
    book.strokeRoundedRect(-24, 2, 9, 13, 1);
    const ribbon = this.add.rectangle(-20, 15, 1.5, 4, 0xc8a05a, 0.7);
    c.add([g, cloak, eye, pupil, gloveL, gloveR, lamp, book, ribbon, tip]);
    this.tweens.add({ targets: tip, alpha: 0.3, duration: 900, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: c, y: "+=2", duration: 2200, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
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
    await this.bitSay("The Meridian Trials, Observer — where fluency is timed by the sky itself. Each question rides a star across the field; answer before it slips the far limb. The Comparator's verdicts must become your reflexes tonight.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(5500)]); if (!A()) return;
    this.hideBubble();

    this.showTrialOnSlip(["Math.max(2, 9)"], "What does this return?");
    this.startTransit(9000);
    await this.runReveal("Math.max(2, 9)");
    if (!A()) return;
    const a1 = this.createAnnotation(SLIP_CX, SLIP_Y1 + 14, "the reading", HEX_BLUE_GRAY);
    const a2 = this.createAnnotation(EYE_CX, EYE_CY + EYE_R + 16, "your window — gone when it exits", HEX_BLUE_GRAY);
    const a3 = this.createAnnotation(MC_BEAM_CX, MC_PLINTH.y + 24, "the verdict, honest as ever", HEX_BLUE_GRAY);
    await this.bitSay("Log the transit before the limb takes it. Eyes to the eyepiece!");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();
    [a1, a2, a3].forEach((a) => a.destroy());
    this._killTransitTween();
    this.clearSlipContent();
    this.wipeSlate();
    this.updateResultRow(null, null);

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
      1: "WAVE 1 — RAPID VERDICTS",
      2: "WAVE 2 — THE NEGATIVE SKY",
      3: "WAVE 3 — DEEP TRANSITS & BUG HUNT",
    };
    await this.shutterBlink();
    await this.showWaveBanner(banners[waveNumber]);
    if (!this._alive) return;
    if (waveNumber === 2) {
      await this.showBitFeedback("Below-zero readings now, Observer. Forget 'bigger-looking' — on the line, max is RIGHTMOST, always. Minus three beats minus seven. Trust the rail.", 4500);
    } else if (waveNumber === 3) {
      await this.showBitFeedback("Final transits — long traces, and two flawed observations hiding in the forms. The slate and the rail tell the truth; your hunches don't.", 4500);
    }
    if (!this._alive) return;

    const startIndex = waveNumber === 1 ? 0 : waveNumber === 2 ? 5 : 10;
    this.startRound(startIndex);
  }

  async shutterBlink() {
    const shutter = this.add.rectangle(EYE_CX, EYE_CY, (EYE_R - 14) * 2, (EYE_R - 14) * 2, 0x000000, 0).setDepth(17);
    this.fieldContainer.add(shutter);
    await new Promise((res) => { this.tweens.add({ targets: shutter, fillAlpha: 1, duration: 150, yoyo: true, onComplete: res }); });
    shutter.destroy();
  }

  async showWaveBanner(text) {
    const c = this.add.container(640, -60).setDepth(85);
    const g = this.add.graphics();
    g.fillStyle(0x04060c, 0.95);
    g.fillRoundedRect(-230, -24, 460, 48, 8);
    g.lineStyle(2, C_GOLD, 1);
    g.strokeRoundedRect(-230, -24, 460, 48, 8);
    const t = this.add.text(0, 0, text, { font: "bold 17px Georgia", color: HEX_GOLD }).setOrigin(0.5);
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

  _primaryMethod(config) {
    const text = Array.isArray(config.source) ? config.source.join(" ") : (config.source || (config.lines || []).join(" "));
    const m = String(text).match(/Math\.(max|min)/);
    return m ? m[1] : "max";
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
    this.mcResetCradles();
    this.mcResetNeedle();
    this.clearRail();
    this.wipeSlate();
    this.updateResultRow(null, null);
    this.mcSetModePlate(this._primaryMethod(config));
    this._railEnabled = config.wave >= 2;
    this.slipRoundLabel.setText(`TRANSIT ${index + 1}/15`);
    this.roundStartTime = this.time.now;

    const limit = config.type === "bughunt" ? 12000 : WAVE_TIME[config.wave];
    if (config.type === "predict" || config.type === "trace") this.setupPredict(config);
    else if (config.type === "bughunt") this.setupBugHunt(config);

    this.startTransit(limit);
  }

  clearRound() {
    this.roundElements.forEach((e) => { if (e && e.destroy) e.destroy(); });
    this.roundElements = [];
    this.clearSlipContent();
    this._bugHuntTokenObjs = [];
    if (this._bugHeaderTween) { this._bugHeaderTween.stop(); this._bugHeaderTween = null; }
  }

  async onTransitTimeout(config) {
    if (this.gameEnded) return;
    this.inputLocked = true;
    this.roundElements.forEach((e) => e.disableInteractive && e.disableInteractive());
    (this._bugHuntTokenObjs || []).forEach((t) => t.disableInteractive());
    this.logAttempt(config, false, null, "timeout", this.roundTimeLimit, 1);
    await this.starExitsField();
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

  // ══════════════════════════════════════════════════════════════
  // TYPE A/B/C — PREDICT / TRACE
  // ══════════════════════════════════════════════════════════════

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
    await this.haltStarAndCapture();
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

  // ══════════════════════════════════════════════════════════════
  // TYPE D — BUG HUNT
  // ══════════════════════════════════════════════════════════════

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
    await this.haltStarAndCapture();
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

  /** Dual-future reveal: the buggy code first (honest wrong outcome),
   * then reset and run the fixed version — both derived from the real
   * evaluator, never scripted. */
  async runDualFutureReveal(config) {
    await this.runReveal(config);
    await this.delay(450);
    if (!this._alive) return;
    this.wipeSlate();
    this.mcResetCradles();
    this.mcResetNeedle();
    this.clearRail();
    this.updateResultRow(null, null);
    const fixedLines = config.lines
      .map((l, i) => (i + 1 === config.faultLine ? l.replace(/Math\.(max|min)\([^)]*\)/, config.fix) : l))
      .filter((l) => !l.trim().startsWith("//"));
    await this.runReveal({ source: fixedLines, wave: config.wave });
  }

  // ══════════════════════════════════════════════════════════════
  // HONEST EVALUATOR — Math.max/min with inner-first nesting,
  // negatives, chained statements, println concatenation
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

  _evalSimpleValue(expr, vars) {
    const t = expr.trim();
    if (/^-?\d+\.\d+$/.test(t)) return { ok: true, value: parseFloat(t), type: "double" };
    if (/^-?\d+$/.test(t)) return { ok: true, value: parseInt(t, 10), type: "int" };
    if (/^[A-Za-z_]\w*$/.test(t) && vars && vars[t] !== undefined) return { ok: true, value: vars[t].value, type: vars[t].type };
    return { ok: false, crash: "eval" };
  }

  /** Resolves an argument to its VALUE only — a nested Math.max/min
   * recurses fully (its own isolated cradle cycle) BEFORE either outer
   * cradle is touched, so the outer call's two cradles are populated
   * together only once both argument values are known. */
  async _resolveArgValue(argExpr, vars) {
    const t = argExpr.trim();
    if (/^Math\.(max|min)\(/.test(t)) {
      const inner = await this.evalMathCall(t, vars, false);
      if (!inner.ok) return inner;
      return { ok: true, kind: "nested", value: inner.value, type: inner.type, starObj: inner.winnerStarObj };
    }
    const lit = this._evalSimpleValue(t, vars);
    if (!lit.ok) return lit;
    return { ok: true, kind: "literal", value: lit.value, type: lit.type };
  }

  async _placeIntoCradle(resolved, cradleKey) {
    if (resolved.kind === "nested") await this.mcCarryStar(resolved.starObj, cradleKey);
    else await this.mcSpawnStar(resolved.value, resolved.type, cradleKey);
  }

  async evalMathCall(callText, vars, isTopLevel) {
    const m = callText.trim().match(/^Math\.(max|min)\((.*)\)$/);
    if (!m) return { ok: false, crash: "eval" };
    const method = m[1];
    const args = this._splitTopArgs(m[2]);
    if (args.length !== 2) return { ok: false, crash: "wrong_arity" };
    this.mcSetModePlate(method);
    this._mcNeedleBusy = true;

    // Phase 1 — resolve both argument VALUES first.
    const aRes = await this._resolveArgValue(args[0], vars);
    if (!aRes.ok) return aRes;
    const bRes = await this._resolveArgValue(args[1], vars);
    if (!bRes.ok) return bRes;

    // Phase 2 — populate both outer cradles together.
    await this._placeIntoCradle(aRes, "a");
    await this._placeIntoCradle(bRes, "b");

    // Re-assert this call's own method — a nested inner call may have
    // flipped the mode plate to its own method during Phase 1.
    this.mcSetModePlate(method);

    // Widening happens BEFORE the comparison — both cradles widen to
    // double if either argument is a double, win or lose.
    const widened = aRes.type === "double" || bRes.type === "double";
    if (widened) {
      if (this._mcStarsA && this._mcStarsA.type !== "double") this._mcWarmStarToDouble(this._mcStarsA);
      if (this._mcStarsB && this._mcStarsB.type !== "double") this._mcWarmStarToDouble(this._mcStarsB);
      await this.delay(100);
      if (!this._alive) return { ok: true, value: aRes.value, type: aRes.type };
    }

    if (this._railEnabled) {
      await this.placeOnRail([
        { value: aRes.value, type: widened ? "double" : aRes.type },
        { value: bRes.value, type: widened ? "double" : bRes.type },
      ]);
      if (!this._alive) return { ok: true, value: aRes.value, type: aRes.type };
    }

    await this.delay(90);
    if (!this._alive) return { ok: true, value: aRes.value, type: aRes.type };
    await this.mcNeedleOscillate();
    if (!this._alive) return { ok: true, value: aRes.value, type: aRes.type };

    const av = widened ? Number(aRes.value) : aRes.value;
    const bv = widened ? Number(bRes.value) : bRes.value;
    let winSide, winner, winnerType;
    if (av === bv) {
      winSide = "a"; winner = av; winnerType = widened ? "double" : aRes.type;
    } else {
      const aWins = method === "min" ? av < bv : av > bv;
      winSide = aWins ? "a" : "b";
      winner = aWins ? av : bv;
      winnerType = widened ? "double" : (aWins ? aRes.type : bRes.type);
    }
    await this.mcNeedleLock(winSide);
    if (!this._alive) return { ok: true, value: winner, type: winnerType };

    if (this._railEnabled) await this.railSweep(method, winSide);

    const winStar = winSide === "a" ? this._mcStarsA : this._mcStarsB;
    const loseStar = winSide === "a" ? this._mcStarsB : this._mcStarsA;
    if (winStar) {
      this.tweens.add({ targets: winStar.container, scale: 1.2, duration: 120, yoyo: true });
      const glow = this.add.circle(winStar.container.x, winStar.container.y, 18, this._mcTypeColorInt(winnerType), 0.25).setDepth(7);
      this.tweens.add({ targets: glow, alpha: 0, scale: 1.6, duration: 350, onComplete: () => glow.destroy() });
    }
    if (loseStar) this.tweens.add({ targets: loseStar.container, alpha: 0.6, duration: 180 });

    if (isTopLevel) {
      this._mcNeedleBusy = false;
      await this.mcDescendReturnStar(winner, winnerType, winStar);
      this.time.delayedCall(400, () => { if (this._alive) this.mcResetCradles(); });
      return { ok: true, value: winner, type: winnerType };
    }
    this._mcStarsA = null; this._mcStarsB = null;
    if (loseStar) {
      this.time.delayedCall(200, () => { if (loseStar.container.active) this.tweens.add({ targets: loseStar.container, alpha: 0, duration: 180, onComplete: () => loseStar.container.destroy() }); });
    }
    return { ok: true, value: winner, type: winnerType, winnerStarObj: winStar };
  }

  async runLine(line, vars) {
    if (/^Math\s+\w+\s*=\s*new Math\(\);$/.test(line)) {
      await this.chalkWriteLine(line, "#8ea6c8");
      this.showCompileErrorStamp();
      await this.delay(500);
      return { ok: false, crash: "compile" };
    }
    const instanceMatch = line.match(/(\w+)\.(max|min)\(/);
    if (instanceMatch && instanceMatch[1] !== "Math") {
      await this.chalkWriteLine(line, "#8ea6c8");
      if (instanceMatch[1] === "math") {
        this.showCompileErrorStamp();
        await this.delay(500);
        return { ok: false, crash: "compile" };
      }
      const recv = vars[instanceMatch[1]];
      await this.mcInstanceCallShudder(recv ? recv.value : 0, recv ? recv.type : "int");
      return { ok: false, crash: "compile" };
    }
    const threeArgMatch = line.match(/Math\.(max|min)\(([^)]*)\)/);
    if (threeArgMatch && this._splitTopArgs(threeArgMatch[2]).length > 2) {
      await this.chalkWriteLine(line, "#8ea6c8");
      this.showCompileErrorStamp();
      await this.delay(500);
      return { ok: false, crash: "compile" };
    }

    await this.chalkWriteLine(line, "#8ea6c8");

    const declVar = line.match(/^(int|double)\s+(\w+)\s*=\s*(.*);$/);
    if (declVar) {
      const rhs = declVar[3].trim();
      if (/^Math\.(max|min)\(/.test(rhs)) {
        const r = await this.evalMathCall(rhs, vars, true);
        if (!r.ok) return r;
        vars[declVar[2]] = { value: r.value, type: declVar[1] === "double" ? "double" : r.type };
      } else {
        const lit = this._evalSimpleValue(rhs, vars);
        if (!lit.ok) return lit;
        vars[declVar[2]] = { value: lit.value, type: declVar[1] === "double" ? "double" : lit.type };
      }
      return { ok: true };
    }

    const bareMathCall = line.match(/^(Math\.(max|min)\(.*\));?$/);
    if (bareMathCall) {
      const r = await this.evalMathCall(bareMathCall[1], vars, true);
      if (!r.ok) return r;
      return { ok: true };
    }

    const printMatch = line.match(/^System\.out\.println\((.*)\);$/);
    if (printMatch) {
      const parts = this._splitTopPlus(printMatch[1]);
      let out = "";
      for (const p of parts) {
        const pt = p.trim();
        if (/^".*"$/.test(pt)) out += pt.slice(1, -1);
        else if (vars[pt] !== undefined) out += vars[pt].type === "double" ? Number(vars[pt].value).toFixed(1) : String(vars[pt].value);
      }
      this._lastPrintedLine = out;
      await this.chalkWriteLine(`▸ ${out}`, HEX_CYAN);
      return { ok: true };
    }
    return { ok: true };
  }

  /** Runs a config's source (or a raw line array) through the honest
   * evaluator. A single bare Math.max/min(...) expression (no
   * assignment — Wave 1/2's rapid-verdict rounds) is treated as a live
   * expression evaluation: run the call, show the arrow + result, done. */
  async runReveal(input) {
    const raw = input.lines ? input.lines : (input.source !== undefined ? input.source : input);
    const lines = (Array.isArray(raw) ? raw : String(raw).split("\n")).map((l) => l.trim()).filter((l) => l && !l.startsWith("//"));
    const vars = {};
    if (lines.length === 1) {
      const stripped = lines[0].replace(/;$/, "");
      if (/^Math\.(max|min)\(.*\)$/.test(stripped)) {
        await this.chalkWriteLine(lines[0], "#8ea6c8");
        const r = await this.evalMathCall(stripped, vars, true);
        if (r.ok) { /* mcDescendReturnStar already wrote the arrow + result row */ }
        return r;
      }
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
    if (remaining > 0.6) { points += 50; this.fastBonusCount++; this.createFloatingText(SLIP_CX, SLIP_Y0 - 14, "⚡ EARLY TRANSIT +50", HEX_GOLD, "bold 15px Arial", 900); }
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

  addLife() {
    if (this.lives < 5) {
      const icon = this.lifeIcons[this.lives];
      if (icon) { this.tweens.add({ targets: icon, alpha: 1, duration: 320 }); }
      this.lives++;
    }
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
      const features = { attempts_count, time_taken_seconds, misconception_repeat_count, combo_breaks };
      const effectivePrediction = BehavioralRules.getEffectivePrediction(features, prediction, true);
      GameManager.fusionEngine.checkBehavioral(effectivePrediction);
    } catch (e) {
      console.warn("Level56Scene: /api/wellbeing/predict-struggle unreachable, skipping behavioral signal for this level:", e);
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

  // ══════════════════════════════════════════════════════════════
  // END STATES
  // ══════════════════════════════════════════════════════════════

  gameOver() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this._killTransitTween();
    this.clearRound();
    this.hideBubble();

    (async () => {
      this.transitStar.container.setAlpha(0);
      this._transitStreak.forEach((d) => d.setAlpha(0));
      this.reticleGfx.setAlpha(0.4);
      this.mcNeedle.setAngle(70);
      this.clearRail();
      this.wipeSlate();
      const motes = this.ambient;
      this.ambient = null;
      (motes || []).forEach((m) => this.tweens.add({ targets: m, y: 632, alpha: 0, duration: 1500, ease: "Sine.easeIn" }));

      const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
      this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });
      const title = this.add.text(640, 240, "NIGHT LOST", { font: "bold 38px Georgia", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
      this.tweens.add({ targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut", onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }) });
      this.add.text(640, 310, `Score: ${this.score}`, { font: "21px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
      this.add.text(640, 350, `Transits Logged: ${this.currentRound} / 15`, { font: "18px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);
      this._makeButton(525, 420, "AWAIT THE NEXT STAR", 200, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
      this._makeButton(755, 420, "RETURN TO MENU", 200, 50, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.start("MenuScene"));
    })();
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this._killTransitTween();
    this.clearRound();
    this.hideBubble();

    try { GameManager.completeLevel(56, Math.round((this.correctFirstTry / 15) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("math_max_min_tuned"); } catch (_) {}
    try {
      localStorage.setItem("level56_results", JSON.stringify({
        level: 56, concept: "math_max_min", phase: "tuning",
        score: this.score, accuracy: this.correctFirstTry / 15, avgTimePct: this.totalTimePctUsed / 15,
        fastBonuses: this.fastBonusCount, comboMax: this.maxCombo, stars: this._starRating(),
        livesRemaining: this.lives, attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.meridianFinale().then(() => { if (this._alive) this.showScoreTally(); });
  }

  async meridianFinale() {
    for (let i = 0; i < 7; i++) {
      this.time.delayedCall(i * 260, () => {
        if (!this._alive) return;
        const ang = Phaser.Math.FloatBetween(0.3, 1.2) + Math.PI;
        const r = EYE_R - 20;
        const startX = EYE_CX - Math.cos(ang) * r, startY = EYE_CY - Math.sin(ang) * r;
        const endX = EYE_CX + Math.cos(ang) * r, endY = EYE_CY + Math.sin(ang) * r;
        const streak = this.add.line(0, 0, startX, startY, endX, endY, 0xe8eaf6, 0.7).setLineWidth(1.5);
        this.fieldContainer.add(streak);
        this.tweens.add({ targets: streak, alpha: 0, duration: 500, onComplete: () => streak.destroy() });
      });
    }

    this._transitHalted = true;
    await new Promise((res) => { this.tweens.add({ targets: this.transitStar.container, x: EYE_CX, y: EYE_CY, alpha: 1, duration: 500, ease: "Sine.easeInOut", onComplete: res }); });
    this._paintTransitStar(this.transitStar.gfx, 0xffffff);
    this.transitStar.glow.setFillStyle(0xffffff, 0.4);
    this.tweens.add({ targets: this.transitStar.glow, scale: 1.6, duration: 600, yoyo: true, repeat: 2 });

    const glint = this.add.circle(1150, 74, 3, C_GOLD, 0.8).setDepth(4);
    this.tweens.add({ targets: glint, alpha: 0, duration: 900, onComplete: () => glint.destroy() });

    if (this._railEntries) {
      const railGlow = this.add.rectangle((RAIL_X0 + RAIL_X1) / 2, RAIL_Y, RAIL_X1 - RAIL_X0, 4, C_GOLD, 0.5);
      this.tweens.add({ targets: railGlow, alpha: 0, duration: 1200, onComplete: () => railGlow.destroy() });
    }

    await new Promise((res) => { this.tweens.add({ targets: this.mcNeedle, angle: 360 + 30, duration: 600, ease: "Cubic.easeInOut", onComplete: res }); });
    this.mcNeedle.setAngle(0);
    this.createConfetti(EYE_CX, EYE_CY, 40);
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

    const title = this.add.text(640, 185, "TRANSITS LOGGED", { font: "bold 32px Georgia", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(91).setScale(0);
    this.tweens.add({ targets: title, scale: 1, duration: 350, ease: "Back.easeOut" });

    const acc = Math.round((this.correctFirstTry / 15) * 100);
    const avgSec = (this.totalTimeMs / 15 / 1000).toFixed(1);
    const lines = [
      `ACCURACY: ${acc}%`,
      `AVG RESPONSE: ${avgSec}s`,
      `EARLY-TRANSIT BONUSES: ${this.fastBonusCount}`,
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
    bg.lineStyle(1, C_BLUE_GRAY, 0.6);
    bg.strokeCircle(0, 0, 18);
    bg.lineBetween(-18, 0, 18, 0);
    bg.lineBetween(0, -18, 0, 18);
    bg.fillStyle(C_GOLD, 0.9);
    const pts = [];
    for (let i = 0; i < 8; i++) { const r = i % 2 === 0 ? 6 : 2.5; const a = (Math.PI / 4) * i - Math.PI / 2; pts.push(Math.cos(a) * r, Math.sin(a) * r); }
    bg.fillPoints(pts, true);
    badge.add(bg);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 0 });
    const badgeLbl = this.add.text(640, 520, "max()/min() SCHEMA TUNED", { font: "bold 14px Georgia", color: HEX_GOLD }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: badgeLbl, alpha: 1, duration: 300, delay: 0 });

    this._makeButton(500, 555, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(770, 555, "NEXT: The Calculation Chamber →", 290, 44, { fill: 0x00733a, stroke: C_GREEN_BRIGHT, textColor: "#ffffff" }, () => {
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
