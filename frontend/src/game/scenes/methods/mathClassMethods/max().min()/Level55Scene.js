/**
 * Level 55 — "The Observatory" (Math Class Methods: Accretion Phase —
 * Math.max() & Math.min(), opening the Math Wing)
 * ===========================================================================
 * Teaches Java's first STATIC methods: Math.max(a, b) / Math.min(a, b).
 * The Great Comparator is a permanent brass instrument — the receiver is
 * the CLASS ITSELF, never an object. Two argument stars enter twin
 * cradles; a needle oscillates and locks toward the winner (max: larger,
 * min: smaller); the loser DIMS BUT REMAINS (pure computation, nothing
 * consumed — the L49 ghost-copy lesson, now for arithmetic); a COPY of
 * the winner descends the chute as the return value. Instance-style
 * calls (`a.max(b)`), construction (`new Math()`), and case errors
 * (`math.max`) all get their own honest compile-error choreography.
 * Nested calls resolve inner-first, with the inner verdict physically
 * carried into the outer cradle by a small brass arm.
 *
 * The evaluator is honest: real comparison, real int→double widening
 * when either argument is a double, real inner-first nested resolution,
 * and a genuine bare-call discard when the return value is never used.
 */

import Phaser from "phaser";
import { GameManager } from "../../../../GameManager.js";
import { addTutorialReplayButton } from "../../../../TutorialReplayButton.js";
import { WellbeingAPI } from "../../../../../api/api.js";
import { BadgeSystem } from "../../../../BadgeSystem.js";

const W = 1280, H = 720;

const C_CYAN = 0x4fc3f7, C_GOLD = 0xffd740, C_ORANGE = 0xff9800, C_VIOLET = 0xb39ddb;
const C_GREEN_BRIGHT = 0x00e676, C_RED = 0xf44336, C_GRAY = 0x78909c, C_BRASS = 0xc8a05a;
const C_BLUE_GRAY = 0x8ea6c8;
const HEX_CYAN = "#4fc3f7", HEX_GOLD = "#ffd740", HEX_ORANGE = "#ff9800", HEX_VIOLET = "#b39ddb";
const HEX_GREEN_BRIGHT = "#00e676", HEX_RED = "#f44336", HEX_GRAY = "#78909c", HEX_BRASS = "#c8a05a";
const HEX_BLUE_GRAY = "#8ea6c8";

// The Great Comparator
const PED_X = 610, PED_Y0 = 410, PED_Y1 = 520;
const BEAM_CX = 640, BEAM_Y = 300;
const CRADLE_A = { x: 470, y: 360 }, CRADLE_B = { x: 810, y: 360 };
const PLINTH = { x: 640, y: 470 };
// Astronomer's slate
const SLATE_X = 940, SLATE_Y = 130, SLATE_W = 300, SLATE_H = 290;
const TUTORIAL_KEY = "level55_tutorial_done";

// ══════════════════════════════════════════════════════════════
// ROUND CONFIGURATION
// ══════════════════════════════════════════════════════════════
const ROUNDS = [
  { round: 1, type: "predict", method: "max",
    source: ["int r = Math.max(4, 9);"],
    question: "What is stored in r?", correct: "9",
    options: [
      { value: "9", tag: null },
      { value: "4", tag: "max_min_direction_confusion" },
      { value: "1", tag: "max_returns_position_belief" },
      { value: "13", tag: "max_adds_belief" },
    ],
    concept: "basic_max" },

  { round: 2, type: "predict", method: "min",
    source: ["int r = Math.min(12, 5);"],
    question: "What is stored in r?", correct: "5",
    options: [
      { value: "5", tag: null },
      { value: "12", tag: "max_min_direction_confusion" },
      { value: "7", tag: "min_subtracts_belief" },
      { value: "0", tag: "min_returns_zero_belief" },
    ],
    concept: "basic_min" },

  { round: 3, type: "predict", method: "max",
    source: ["int a = 6;", "int b = 6;", "int r = Math.max(a, b);"],
    question: "What happens?", correct: "returns_6",
    options: [
      { value: "returns_6", tag: null, label: "r = 6 — equal values, same answer" },
      { value: "error", tag: "equal_args_error_belief", label: "Runtime error — can't compare equals" },
      { value: "returns_12", tag: "max_adds_belief", label: "r = 12" },
      { value: "returns_0", tag: "equal_returns_zero_belief", label: "r = 0" },
    ],
    revealNote: "The needle hesitates dead-center... then shrugs — with equal values, either choice IS the answer. r = 6, no drama, no error.",
    concept: "equal_values" },

  { round: 4, type: "predict", method: "max",
    source: ["int a = 8;", "int b = 3;", "int r = a.max(b);"],
    question: "What happens?", correct: "compile_error",
    options: [
      { value: "compile_error", tag: null, label: "COMPILE ERROR — int has no methods" },
      { value: "returns_8", tag: "instance_call_on_number_belief", label: "r = 8 — works fine" },
      { value: "runtime_error", tag: "runtime_vs_compile_confusion", label: "Runtime exception" },
      { value: "returns_3", tag: "instance_call_reversed_belief", label: "r = 3" },
    ],
    revealNote: "The star shudders — a bare int carries NO instruments. The comparator lives in the Math class: Math.max(a, b). The class name is the address; the values are just visitors.",
    concept: "static_not_instance" },

  { round: 5, type: "predict", method: "max",
    source: ["Math m = new Math();", "int r = m.max(2, 9);"],
    question: "What happens?", correct: "compile_error",
    options: [
      { value: "compile_error", tag: null, label: "COMPILE ERROR — Math cannot be instantiated" },
      { value: "returns_9", tag: "new_math_object_belief", label: "r = 9 — works fine" },
      { value: "returns_null", tag: "uninitialized_math_belief", label: "r is null" },
      { value: "runtime_error", tag: "runtime_vs_compile_confusion", label: "Runtime exception" },
    ],
    revealNote: "The ghost instrument collapses to dust — Java seals Math shut; its constructor is private. One Comparator, no copies. Call it by name: Math.max(2, 9).",
    concept: "no_instantiation" },

  { round: 6, type: "predict", method: "max",
    source: ["Math.max(10, 20);", 'System.out.println("done");'],
    question: "What prints — and what happened to the 20?", correct: "done_discarded",
    options: [
      { value: "done_discarded", tag: null, label: "'done' — the 20 was computed, then discarded" },
      { value: "20_then_done", tag: "bare_call_prints_belief", label: "20 / done" },
      { value: "done_stored", tag: "bare_call_stores_result_belief", label: "'done' — the 20 is saved somewhere" },
      { value: "compile_error", tag: "bare_call_error_belief", label: "COMPILE ERROR — result must be used" },
    ],
    revealNote: "The winning star lands on the plinth... and no one collects it. It fades. A bare call computes and DISCARDS — legal, but pointless. Capture it, print it, or feed it onward: returns are gifts you must catch.",
    concept: "bare_call_discard" },

  { round: 7, type: "predict", method: "max",
    source: ["int r = Math.max(3, Math.max(8, 5));"],
    question: "What is stored in r?", correct: "8",
    options: [
      { value: "8", tag: null },
      { value: "5", tag: "nested_outer_first_belief" },
      { value: "3", tag: "max_min_direction_confusion" },
      { value: "16", tag: "max_adds_belief" },
    ],
    revealNote: "Inner first: Math.max(8, 5) → 8; the brass arm carries 8 into the outer cradle; Math.max(3, 8) → 8. Two measurements, one champion — the greatest of three.",
    concept: "nested_max" },

  { round: 8, type: "predict", method: "mixed",
    source: ["int r = Math.min(10, Math.max(4, 7));"],
    question: "What is stored in r?", correct: "7",
    options: [
      { value: "7", tag: null },
      { value: "4", tag: "nested_outer_first_belief" },
      { value: "10", tag: "max_min_direction_confusion" },
      { value: "constraint", tag: "mixed_nest_invalid_belief", label: "COMPILE ERROR — can't mix max and min" },
    ],
    revealNote: "Mixed twins nest freely: inner Math.max(4, 7) → 7; outer Math.min(10, 7) → 7. Max-inside-min is the CLAMP pattern's seed — you'll grow it in the trials ahead.",
    concept: "mixed_nesting" },

  { round: 9, type: "predict", method: "max",
    source: ["double r = Math.max(3, 4.5);"],
    question: "What is stored in r?", correct: "4.5",
    options: [
      { value: "4.5", tag: null },
      { value: "4", tag: "double_truncated_belief" },
      { value: "3", tag: "max_min_direction_confusion" },
      { value: "compile_error", tag: "int_double_mix_error_belief", label: "COMPILE ERROR — mixed types" },
    ],
    revealNote: "Mixed cradles are welcome — the int 3 quietly widens to 3.0 (the gold star warms to orange), the double overload runs, and 4.5 wins. Math's methods come in int AND double editions; Java picks the fit.",
    concept: "mixed_type_overload" },

  { round: 10, type: "command", method: "max",
    skeleton: ["int bright1 = 62;", "int bright2 = 88;", "int winner = <slot:call>;"],
    mission: "Record the BRIGHTER magnitude in winner.",
    slots: [{ id: "call", hint: "the measurement" }],
    cartridges: [
      { code: "Math.max(bright1, bright2)", correct: true },
      { code: "Math.min(bright1, bright2)", tag: "max_min_direction_confusion" },
      { code: "bright1.max(bright2)", tag: "instance_call_on_number_belief" },
      { code: "math.max(bright1, bright2)", tag: "math_lowercase_belief" },
    ],
    tests: [{ expectedVariable: { name: "winner", value: 88 } }],
    concept: "command_max_basic" },

  { round: 11, type: "command", method: "min",
    skeleton: ["int t1 = /* test */;", "int t2 = /* test */;", "int t3 = /* test */;", "int coldest = <slot:call>;"],
    mission: "Record the COLDEST of the three readings in coldest. (One call won't reach all three — nest!)",
    slots: [{ id: "call", hint: "the nested measurement" }],
    cartridges: [
      { code: "Math.min(t1, Math.min(t2, t3))", correct: true },
      { code: "Math.min(Math.min(t1, t2), t3)", correct: true },
      { code: "Math.min(t1, t2, t3)", tag: "max_three_args_belief" },
      { code: "Math.min(t1, t2)", tag: "third_value_ignored" },
      { code: "Math.max(t1, Math.max(t2, t3))", tag: "max_min_direction_confusion" },
    ],
    tests: [
      { substitutions: { t1: 31, t2: 27, t3: 35 }, expectedVariable: { name: "coldest", value: 27 } },
      { substitutions: { t1: 31, t2: 27, t3: 19 }, expectedVariable: { name: "coldest", value: 19 } },
    ],
    revealNote: "The two-arg build passed the first night and froze on the second — 19 was the coldest, and it was never measured. Nest to reach all three: the inner verdict rides into the outer cradle. And Math.min(t1, t2, t3)? The instrument has TWO cradles — no three-argument edition exists.",
    concept: "command_nested_min" },

  { round: 12, type: "command", method: "min",
    skeleton: ["int reading = /* test */;", "int capped = <slot:call>;", 'System.out.println("Reported: " + capped);'],
    mission: "The report caps readings at 100 — anything higher reports as 100; anything at-or-below passes through. For 137: 'Reported: 100'. For 82: 'Reported: 82'.",
    slots: [{ id: "call", hint: "the cap" }],
    cartridges: [
      { code: "Math.min(reading, 100)", correct: true },
      { code: "Math.min(100, reading)", correct: true },
      { code: "Math.max(reading, 100)", tag: "max_min_direction_confusion" },
      { code: "100", tag: "constant_ignores_reading" },
    ],
    tests: [
      { substitutions: { reading: 137 }, expectedOutput: "Reported: 100" },
      { substitutions: { reading: 82 }, expectedOutput: "Reported: 82" },
    ],
    revealNote: "The CAP pattern — min against a ceiling: 137 vs 100, the smaller (100) wins; 82 vs 100, the smaller (82) passes through. The max build did the OPPOSITE — it raised 82 up to 100: a floor, not a ceiling. min caps, max floors. Argument order doesn't matter; the METHOD does.",
    postMissionNote: "min against a limit is how real code caps a value — scores, speeds, volumes, everywhere. One instrument, one line, no if-statement in sight. That's the Comparator earning its pedestal.",
    concept: "command_cap_pattern" },
];

const MISCONCEPTION_FEEDBACK = {
  instance_call_on_number_belief: "Numbers carry no instruments — there is no 5.max. The comparator lives in the Math CLASS: Math.max(a, b). Class name first, always.",
  instance_call_reversed_belief: "Numbers carry no instruments — there is no 5.max. The comparator lives in the Math CLASS: Math.max(a, b). Class name first, always.",
  new_math_object_belief: "You cannot build a second Comparator — Java seals Math's constructor shut. No new Math(), ever. The one instrument serves all callers, by name.",
  uninitialized_math_belief: "The line never compiles — new Math() is refused before your program runs, so there's no 'null' to speak of.",
  math_lowercase_belief: "Case matters — 'math' is no one; 'Math' is the class. Capital M, engraved on the nameplate.",
  max_min_direction_confusion: "Check the needle — max swings to the LARGER, min to the SMALLER. Brightest star, faintest star: know which question you're asking.",
  max_returns_position_belief: "The Comparator returns the VALUE itself, not which cradle it sat in. No indices here — this isn't the shelf wing.",
  max_modifies_argument_belief: "Both stars still shine in their cradles — the Comparator measures and never takes. Pure computation: arguments in, answer out, nothing changed.",
  bare_call_stores_result_belief: "Nothing is saved unless YOU catch it — the star faded on the plinth, uncollected. Assign it, print it, or nest it; Java keeps no lost-and-found.",
  bare_call_prints_belief: "A bare call doesn't print itself — nothing but your own println statements ever reach the console.",
  bare_call_error_belief: "Discarding a return is legal — wasteful, but legal. The call ran; the answer simply had nowhere to go.",
  nested_outer_first_belief: "Inner first, always — the deepest call resolves before its parent can even begin. Watch the brass arm: the inner verdict RIDES INTO the outer cradle.",
  mixed_nest_invalid_belief: "max and min nest together freely — each is just a value-producing call, and any call can be an argument to another.",
  max_three_args_belief: "Two cradles, two arguments — there is no three-value edition. To judge three, nest: the inner winner faces the third.",
  third_value_ignored: "The unmeasured value froze you — the second night's coldest reading never touched a cradle. Every candidate must pass through the instrument.",
  max_adds_belief: "The Comparator never does arithmetic — it CHOOSES. One of the two arguments comes back, untouched, exactly as it arrived.",
  min_subtracts_belief: "The Comparator never does arithmetic — it CHOOSES. One of the two arguments comes back, untouched, exactly as it arrived.",
  min_returns_zero_belief: "The Comparator always hands back one of the two ARGUMENTS — never zero, never a computed difference.",
  equal_args_error_belief: "Equal values are no crisis — the answer equals both. The needle shrugs and hands over the shared value.",
  equal_returns_zero_belief: "Equal values are no crisis — the answer equals both, not zero. The needle shrugs and hands over the shared value.",
  int_double_mix_error_belief: "Mixed cradles are fine — the int quietly widens to a double, and the double edition of the method runs. Java picks the overload that fits.",
  double_truncated_belief: "Nothing was trimmed — the double edition ran and returned 4.5 whole. Widening never loses digits; only narrowing does.",
  runtime_vs_compile_confusion: "Bad SYNTAX and forbidden calls die at COMPILE time — before anything runs. The instance-call and new-Math errors never reached the dome floor.",
  constant_ignores_reading: "A bare 100 reports 100 forever — the reading never mattered. The cap must CONSULT the value: min(reading, limit).",
};

const HINTS = {
  1: "Math.max(4, 9) — the needle swings to the larger value. Read the numbers, not their order.",
  2: "Math.min(12, 5) — the needle swings to the smaller value this time. min ≠ max.",
  3: "With equal arguments, Math.max just hands back that shared value — no error, no special case.",
  4: "int has no .max method — the comparator only answers to Math.max(a, b), the class name first.",
  5: "Math's constructor is private — you can never write new Math(). Call Math.max(...) directly.",
  6: "Math.max(10, 20) alone computes 20 and throws it away — nothing captures it, so only the println's own text appears.",
  7: "Resolve the inner call first: Math.max(8, 5) is 8, then Math.max(3, 8) is 8.",
  8: "Inner Math.max(4, 7) is 7; then Math.min(10, 7) is 7 — max and min nest freely.",
  9: "One double argument makes BOTH treated as doubles — 3 widens to 3.0, and 4.5 (the larger) wins.",
  10: "Math.max(bright1, bright2) — the class name Math, capitalized, calling .max on both values directly.",
  11: "One call only compares two values. Nest: Math.min(t1, Math.min(t2, t3)) reaches all three.",
  12: "Math.min(reading, 100) — whichever is smaller passes through, capping anything above 100.",
};

export class Level55Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level55Scene" });
  }

  init(data = {}) {
    this._forceTutorial = !!data.forceTutorial;
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
    this.inputLocked = true;
    this.gameEnded = false;
    this._alive = true;
    this._bubble = null;
    this.slotContents = {};
    this.slotDefs = {};
    this.cartridges = [];
    this._commandFirstFail = true;
    this._dragHoverSlotKey = null;
    this.firstBareCallAnnotationShown = false;
    this._varContainers = [];
    this._currentMode = "max";
    this._needleAngle = 0;
    this._starsA = null;
    this._starsB = null;
    this._nightStars = [];
    this._orreryPlanets = [];
  }

  preload() {}

  create() {
    this._alive = true;
    this.events.once("shutdown", () => { this._alive = false; });

    const cam = this.cameras.main;
    const zoom = Math.min(this.scale.width / W, this.scale.height / H);
    cam.setZoom(zoom);
    cam.centerOn(W / 2, H / 2);
    cam.setBackgroundColor("#060810");

    try { GameManager.incrementAttempt(54); } catch (_) {}

    this.createParticleTexture();
    this.createBackground();
    this.createDome();
    this.createGreatTelescope();
    this.createStarCharts();
    this.createOrrery();
    this.createObservatoryBanner();
    this.createObservatoryFloor();
    this.createParticles();
    this.createGreatComparator();
    this.createAstronomersSlate();
    this.createSourceDisplay();
    this.createHUD();
    addTutorialReplayButton(this, W, this.lifeIcons[2].x, this.lifeIcons[0].y);
    this.createExpressionMonitor();
    this.createBit();
    this.setupDragEvents();

    cam.fadeIn(700, 3, 3, 5);
    this.checkTutorial();
  }

  update(time, delta) {
    this.updateParticles(time, delta);
    this.updateNightStarsTwinkle(time);
    this.updateOrrery(time);
    this.updateTelescopeGlint(time);
    this.updateNeedleIdle(time);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // BACKGROUND / DOME INTERIOR
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l55_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l55_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x060810).setDepth(0);
  }

  createDome() {
    const g = this.add.graphics().setDepth(1);
    // dome arc band
    g.lineStyle(3, 0x2a3654, 0.6);
    g.beginPath(); g.arc(640, 480, 720, Math.PI * 1.18, Math.PI * 1.82, false); g.strokePath();
    g.beginPath(); g.arc(640, 480, 700, Math.PI * 1.18, Math.PI * 1.82, false); g.strokePath();
    g.lineStyle(1, 0x2a3654, 0.3);
    for (let i = 0; i <= 12; i++) {
      const a = Math.PI * 1.18 + (Math.PI * 0.64 * i) / 12;
      g.lineBetween(640 + Math.cos(a) * 700, 480 + Math.sin(a) * 700, 640 + Math.cos(a) * 720, 480 + Math.sin(a) * 720);
    }
    // observation slit — dark sky with stars
    g.fillStyle(0x03040a, 1);
    g.fillRect(560, 20, 160, 70);
    this._nightStars = [];
    for (let i = 0; i < 14; i++) {
      const s = this.add.circle(Phaser.Math.Between(566, 714), Phaser.Math.Between(26, 84), 1, 0xe8eaf6, Phaser.Math.FloatBetween(0.3, 0.8)).setDepth(2);
      this._nightStars.push({ obj: s, phase: Phaser.Math.Between(0, 3000), twinkles: Phaser.Math.Between(0, 1) === 1 });
    }
  }

  updateNightStarsTwinkle(time) {
    this._nightStars.forEach((s) => {
      if (!s.twinkles) return;
      const t = (time + s.phase) % 2600;
      s.obj.setAlpha(0.3 + Math.abs(Math.sin((t / 2600) * Math.PI)) * 0.5);
    });
  }

  createGreatTelescope() {
    const g = this.add.graphics().setDepth(3);
    g.fillStyle(0x1a1408, 1);
    g.lineStyle(2, C_BRASS, 1);
    g.beginPath();
    g.moveTo(383, 420); g.lineTo(417, 420); g.lineTo(651, 65); g.lineTo(629, 60);
    g.closePath();
    g.fillPath(); g.strokePath();
    [0.25, 0.5, 0.75].forEach((t) => {
      const x = 400 + (640 - 400) * t, y = 420 + (60 - 420) * t;
      g.lineStyle(2, C_BRASS, 0.6);
      g.strokeCircle(x, y, 17 - t * 6);
    });
    g.fillStyle(0x1a1408, 1);
    g.lineStyle(2, C_BRASS, 1);
    g.fillRoundedRect(378, 408, 44, 28, 4);
    g.strokeRoundedRect(378, 408, 44, 28, 4);
    this.telescopeGlint = this.add.rectangle(400, 240, 6, 24, 0xffffff, 0.25).setDepth(4).setAngle(-32);
  }

  updateTelescopeGlint(time) {
    const t = (time % 8000) / 8000;
    const startX = 400, endX = 640, startY = 420, endY = 65;
    this.telescopeGlint.setPosition(startX + (endX - startX) * t, startY + (endY - startY) * t);
    this.telescopeGlint.setAlpha(t > 0.05 && t < 0.95 ? 0.25 : 0);
  }

  createStarCharts() {
    [[80, 460, -3], [1140, 470, 3]].forEach(([x, y, rot]) => {
      const g = this.add.graphics({ x, y }).setDepth(2).setAngle(rot);
      g.fillStyle(0xe0d6b8, 0.12);
      g.lineStyle(1, 0x8a6435, 0.4);
      g.fillRoundedRect(-45, -32, 90, 64, 3);
      g.strokeRoundedRect(-45, -32, 90, 64, 3);
      const pts = [];
      for (let i = 0; i < 5; i++) pts.push([Phaser.Math.Between(-32, 32), Phaser.Math.Between(-20, 20)]);
      g.lineStyle(1, 0xe8eaf6, 0.3);
      for (let i = 1; i < pts.length; i++) g.lineBetween(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1]);
      g.fillStyle(0xe8eaf6, 0.4);
      pts.forEach(([px, py]) => g.fillCircle(px, py, 1.5));
    });
  }

  createOrrery() {
    const c = this.add.container(1160, 590).setDepth(3);
    const g = this.add.graphics();
    g.fillStyle(C_GOLD, 0.6);
    g.fillCircle(0, 0, 5);
    g.lineStyle(1, C_BRASS, 0.3);
    g.strokeCircle(0, 0, 12);
    g.strokeCircle(0, 0, 20);
    c.add(g);
    this._orreryPlanets = [
      { r: 12, period: 20000, dot: this.add.circle(12, 0, 2, C_CYAN, 0.6) },
      { r: 20, period: 33000, dot: this.add.circle(20, 0, 2, C_ORANGE, 0.6) },
    ];
    this._orreryPlanets.forEach((p) => c.add(p.dot));
    this._orreryContainer = c;
  }

  updateOrrery(time) {
    if (!this._orreryPlanets) return;
    const speed = this._orrerySpeedMult || 1;
    this._orreryPlanets.forEach((p) => {
      const a = ((time * speed) / p.period) * Math.PI * 2;
      p.dot.setPosition(Math.cos(a) * p.r, Math.sin(a) * p.r);
    });
  }

  createObservatoryBanner() {
    const g = this.add.graphics().setDepth(2);
    g.fillStyle(0x060810, 1);
    g.lineStyle(1, C_BRASS, 0.5);
    g.fillRoundedRect(230, 12, 340, 26, 3);
    g.strokeRoundedRect(230, 12, 340, 26, 3);
    this.add.text(400, 25, "T H E   O B S E R V A T O R Y", { font: "bold 15px Georgia", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.7).setDepth(3);
  }

  createObservatoryFloor() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x0a0d18, 1);
    g.fillRect(0, 635, W, 85);
    g.lineStyle(1, 0x2a3654, 1);
    g.lineBetween(0, 637, W, 637);
    g.lineStyle(1, 0x2a3654, 0.3);
    for (let x = 0; x < W; x += 100) g.lineBetween(x, 640, x, 720);
    g.lineStyle(1, C_BRASS, 0.1);
    g.strokeCircle(640, 680, 40);
    g.strokeCircle(640, 680, 28);
    for (let i = 0; i < 8; i++) {
      const a = (Math.PI / 4) * i;
      g.lineBetween(640 + Math.cos(a) * 28, 680 + Math.sin(a) * 28, 640 + Math.cos(a) * 40, 680 + Math.sin(a) * 40);
    }
  }

  createParticles() {
    this.ambient = [];
    const colors = [0x8ea6c8, 0xc8a05a, 0xe8eaf6];
    for (let i = 0; i < 8; i++) {
      this.ambient.push(this.add.circle(Phaser.Math.Between(0, W), Phaser.Math.Between(150, 630), 1, Phaser.Utils.Array.GetRandom(colors), Phaser.Math.FloatBetween(0.03, 0.05)).setDepth(2));
    }
  }

  updateParticles(time, delta) {
    if (!this.ambient) return;
    const step = 0.01 * (delta / 16.7);
    this.ambient.forEach((p, i) => {
      p.y += step * (i % 2 === 0 ? 1 : -0.6);
      p.x += Math.sin(time * 0.0004 + i) * 0.03;
      if (p.y > 630) p.y = 150; if (p.y < 150) p.y = 630;
      if (p.x > W) p.x = 0; if (p.x < 0) p.x = W;
    });
  }

  // ══════════════════════════════════════════════════════════════
  // THE GREAT COMPARATOR
  // ══════════════════════════════════════════════════════════════

  createGreatComparator() {
    const g = this.add.graphics().setDepth(4);
    // pedestal
    g.fillStyle(0x141a2c, 1);
    g.lineStyle(2, C_BRASS, 1);
    g.fillRect(PED_X, PED_Y0, 60, PED_Y1 - PED_Y0);
    g.strokeRect(PED_X, PED_Y0, 60, PED_Y1 - PED_Y0);
    g.fillRect(PED_X - 10, PED_Y1 - 14, 80, 14);
    g.strokeRect(PED_X - 10, PED_Y1 - 14, 80, 14);
    this.add.text(PED_X + 30, PED_Y0 + 60, "MATH — EST. FOREVER", { font: "bold 9px Georgia", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.5).setAngle(-90).setDepth(5);

    // crossbeam
    g.fillStyle(0x1a1408, 1);
    g.lineStyle(2, C_BRASS, 1);
    g.fillRoundedRect(BEAM_CX - 210, BEAM_Y - 9, 420, 18, 6);
    g.strokeRoundedRect(BEAM_CX - 210, BEAM_Y - 9, 420, 18, 6);
    [BEAM_CX - 210, BEAM_CX + 210].forEach((x) => {
      g.lineStyle(1.5, C_BRASS, 0.6);
      g.strokeCircle(x, BEAM_Y, 6);
    });

    // class nameplate
    const npBg = this.add.graphics().setDepth(5);
    npBg.fillStyle(0x060810, 1);
    npBg.lineStyle(2, C_GOLD, 1);
    npBg.fillRoundedRect(BEAM_CX - 55, BEAM_Y - 44, 110, 30, 4);
    npBg.strokeRoundedRect(BEAM_CX - 55, BEAM_Y - 44, 110, 30, 4);
    this.add.text(BEAM_CX, BEAM_Y - 29, "Math", { font: "bold 18px Courier New", color: HEX_GOLD }).setOrigin(0.5).setDepth(6);

    const modeBg = this.add.graphics().setDepth(5);
    modeBg.fillStyle(0x0a0d18, 1);
    modeBg.lineStyle(1, C_CYAN, 0.7);
    modeBg.fillRoundedRect(BEAM_CX - 35, BEAM_Y + 12, 70, 18, 3);
    modeBg.strokeRoundedRect(BEAM_CX - 35, BEAM_Y + 12, 70, 18, 3);
    this.modeBg = modeBg;
    this.modeText = this.add.text(BEAM_CX, BEAM_Y + 21, ".max", { font: "bold 14px Courier New", color: HEX_CYAN }).setOrigin(0.5).setDepth(6);

    // link chains to cradles — 3 small linked circles down each drop
    [CRADLE_A, CRADLE_B].forEach((c) => {
      g.lineStyle(1.5, C_BRASS, 0.5);
      const dropTop = BEAM_Y + 9, dropBot = c.y - 17;
      for (let i = 0; i < 3; i++) {
        const ly = dropTop + ((dropBot - dropTop) * (i + 0.5)) / 3;
        g.strokeCircle(c.x, ly, 3);
      }
      g.lineBetween(c.x, dropTop, c.x, dropBot);
    });

    // cradles
    this.cradleGfx = { a: this.add.graphics().setDepth(4), b: this.add.graphics().setDepth(4) };
    [["a", CRADLE_A], ["b", CRADLE_B]].forEach(([key, pos]) => {
      const cg = this.cradleGfx[key];
      cg.fillStyle(0x141a2c, 1);
      cg.lineStyle(2, C_BRASS, 1);
      cg.fillEllipse(pos.x, pos.y, 90, 34);
      cg.strokeEllipse(pos.x, pos.y, 90, 34);
      this.add.text(pos.x, pos.y + 30, key, { font: "bold 13px Courier New", color: HEX_BLUE_GRAY }).setOrigin(0.5).setAlpha(0.7).setDepth(5);
    });

    // needle
    this.needleContainer = this.add.container(BEAM_CX, BEAM_Y + 9).setDepth(7);
    const ng = this.add.graphics();
    ng.fillStyle(0x1a1408, 1);
    ng.lineStyle(1, C_BRASS, 1);
    ng.fillTriangle(-3, 0, 3, 0, 0, 40);
    ng.strokePath();
    ng.fillStyle(C_BRASS, 1);
    ng.fillCircle(0, 0, 4);
    this.needleContainer.add(ng);
    this._needleAngle = 0;

    // output chute + result plinth
    const chute = this.add.graphics().setDepth(3);
    chute.lineStyle(3, C_BRASS, 0.6);
    chute.beginPath();
    chute.moveTo(BEAM_CX - 8, BEAM_Y + 9);
    chute.lineTo(BEAM_CX - 8, 420);
    chute.lineTo(PLINTH.x, PLINTH.y - 20);
    chute.strokePath();
    const plinthG = this.add.graphics().setDepth(3);
    plinthG.fillStyle(0x0a0d18, 1);
    plinthG.lineStyle(2, C_BRASS, 1);
    plinthG.fillCircle(PLINTH.x, PLINTH.y, 24);
    plinthG.strokeCircle(PLINTH.x, PLINTH.y, 24);

    this.starLayer = this.add.container(0, 0).setDepth(8);
  }

  setModePlate(method) {
    if (this._currentMode === method) return;
    this._currentMode = method;
    this.tweens.add({
      targets: this.modeText, scaleY: 0, duration: 100,
      onComplete: () => { this.modeText.setText(`.${method}`); this.tweens.add({ targets: this.modeText, scaleY: 1, duration: 100 }); },
    });
  }

  updateNeedleIdle(time) {
    if (this._needleBusy) return;
    this.needleContainer.setAngle(Math.sin(time * 0.0015) * 1);
  }

  // ── argument stars ──

  _typeColorHex(type) { return type === "double" ? HEX_ORANGE : HEX_GOLD; }
  _typeColorInt(type) { return type === "double" ? C_ORANGE : C_GOLD; }

  _makeStar(value, type, x, y) {
    const c = this.add.container(x, y);
    const g = this.add.graphics();
    const color = this._typeColorInt(type);
    g.fillStyle(color, 0.9);
    g.lineStyle(1, Phaser.Display.Color.IntegerToColor(color).darken(30).color, 1);
    const pts = [];
    for (let i = 0; i < 8; i++) {
      const r = i % 2 === 0 ? 20 : 9;
      const a = (Math.PI / 4) * i - Math.PI / 2;
      pts.push(Math.cos(a) * r, Math.sin(a) * r);
    }
    g.fillPoints(pts, true);
    g.strokePoints(pts, true);
    const display = type === "double" ? Number(value).toFixed(1).replace(/\.0$/, ".0") : String(value);
    const txt = this.add.text(0, 0, display, { font: "bold 17px Courier New", color: "#060810" }).setOrigin(0.5);
    if (txt.width > 34) txt.setFontSize(11);
    c.add([g, txt]);
    return { container: c, gfx: g, text: txt, value, type };
  }

  async spawnArgumentStar(value, type, cradleKey) {
    const pos = cradleKey === "a" ? CRADLE_A : CRADLE_B;
    const star = this._makeStar(value, type, pos.x, pos.y);
    star.container.setAlpha(0).setScale(0);
    this.starLayer.add(star.container);
    const sparks = this.add.particles(pos.x, pos.y, "l55_dot", { speed: { min: 20, max: 50 }, angle: { min: 0, max: 360 }, scale: { start: 0.4, end: 0 }, lifespan: 220, tint: [0xffffff, C_GOLD], emitting: false }).setDepth(9);
    sparks.explode(3);
    this.time.delayedCall(280, () => sparks.destroy());
    await new Promise((res) => { this.tweens.add({ targets: star.container, alpha: 1, scale: 1.15, duration: 180, ease: "Back.easeOut", onComplete: () => { this.tweens.add({ targets: star.container, scale: 1, duration: 100 }); res(); } }); });
    if (cradleKey === "a") this._starsA = star; else this._starsB = star;
    return star;
  }

  resetCradles() {
    if (this._starsA) { this._starsA.container.destroy(); this._starsA = null; }
    if (this._starsB) { this._starsB.container.destroy(); this._starsB = null; }
  }

  // ══════════════════════════════════════════════════════════════
  // THE COMPARISON RUN (signature choreography)
  // ══════════════════════════════════════════════════════════════

  async needleOscillate() {
    this._needleBusy = true;
    const angles = [-28, 24, -18, 14, -8];
    for (const a of angles) {
      await new Promise((res) => { this.tweens.add({ targets: this.needleContainer, angle: a, duration: 110, ease: "Sine.easeInOut", onComplete: res }); });
      const cradle = a < 0 ? CRADLE_A : CRADLE_B;
      const tick = this.add.circle(cradle.x, cradle.y - 20, 2, C_BRASS, 0.7).setDepth(9);
      this.tweens.add({ targets: tick, alpha: 0, scale: 2, duration: 200, onComplete: () => tick.destroy() });
    }
  }

  async needleLock(side) {
    const angle = side === "a" ? -34 : 34;
    await new Promise((res) => { this.tweens.add({ targets: this.needleContainer, angle, duration: 100, ease: "Back.easeOut", onComplete: res }); });
    const chime = this.add.circle(BEAM_CX, BEAM_Y, 6, C_GOLD, 0.5).setDepth(9);
    this.tweens.add({ targets: chime, scale: 4, alpha: 0, duration: 300, onComplete: () => chime.destroy() });
  }

  async descendReturnStar(value, type, sourceStar) {
    const from = sourceStar ? { x: sourceStar.container.x, y: sourceStar.container.y } : { x: BEAM_CX, y: BEAM_Y };
    const copy = this._makeStar(value, type, from.x, from.y - 10);
    copy.container.setScale(0.7);
    this.starLayer.add(copy.container);
    await new Promise((res) => {
      this.tweens.add({ targets: copy.container, x: BEAM_CX - 8, y: 300, duration: 200, ease: "Sine.easeIn", onComplete: res });
    });
    if (!this._alive) return;
    await new Promise((res) => {
      this.tweens.add({ targets: copy.container, x: PLINTH.x, y: PLINTH.y, duration: 220, ease: "Sine.easeIn", onComplete: res });
    });
    this._plinthStar = copy;
    this.chalkEvaluationArrow(value, type);
    this.updateResultRow(value, type);
  }

  async deliverToVariable(name, value, type) {
    const idx = this._varContainers.length;
    const x = PLINTH.x - 60 + (idx % 2) * 120, y = PLINTH.y + 44 + Math.floor(idx / 2) * 30;
    const c = this.add.container(x, y).setDepth(12).setAlpha(0);
    const g = this.add.graphics();
    g.fillStyle(0x0a1520, 1);
    g.lineStyle(1.5, this._typeColorInt(type), 0.8);
    g.fillRoundedRect(-44, -13, 88, 26, 5);
    g.strokeRoundedRect(-44, -13, 88, 26, 5);
    const nameT = this.add.text(0, -20, name, { font: "bold 11px Courier New", color: HEX_BRASS }).setOrigin(0.5);
    const display = type === "double" ? Number(value).toFixed(1) : String(value);
    const valT = this.add.text(0, 0, display, { font: "bold 14px Courier New", color: this._typeColorHex(type) }).setOrigin(0.5);
    c.add([g, nameT, valT]);
    this.roundElements.push(c);
    this._varContainers.push(c);
    this.tweens.add({ targets: c, alpha: 1, duration: 200 });
    if (this._plinthStar) {
      const star = this._plinthStar;
      this._plinthStar = null;
      await new Promise((res) => { this.tweens.add({ targets: star.container, x, y, alpha: 0.2, duration: 300, ease: "Sine.easeIn", onComplete: () => { star.container.destroy(); res(); } }); });
    } else {
      await this.delay(200);
    }
  }

  async discardFade() {
    if (!this._plinthStar) return;
    const star = this._plinthStar;
    this._plinthStar = null;
    await this.delay(600);
    if (!this.firstBareCallAnnotationShown) {
      this.firstBareCallAnnotationShown = true;
      this.createAnnotation(PLINTH.x, PLINTH.y - 40, "returned... to no one", HEX_BLUE_GRAY);
    }
    await new Promise((res) => { this.tweens.add({ targets: star.container, alpha: 0, scale: 0.6, duration: 400, onComplete: () => { star.container.destroy(); res(); } }); });
  }

  clearVarContainers() {
    this._varContainers.forEach((c) => { if (c.active) c.destroy(); });
    this._varContainers = [];
  }

  // ══════════════════════════════════════════════════════════════
  // REJECTIONS — the static-call compile-error choreography
  // ══════════════════════════════════════════════════════════════

  async instanceCallShudder(value, type) {
    const star = await this.spawnArgumentStar(value, type, "a");
    await this.delay(150);
    this.tweens.add({ targets: star.container, x: star.container.x + 3, duration: 40, yoyo: true, repeat: 5 });
    const q = this.add.text(star.container.x, star.container.y - 34, "?", { font: "bold 21px Georgia", color: HEX_RED }).setOrigin(0.5).setDepth(20).setAlpha(0);
    this.roundElements.push(q);
    this.tweens.add({ targets: q, alpha: 1, duration: 100, yoyo: true, repeat: 3 });
    await this.delay(500);
    this.showCompileErrorStamp();
    await this.delay(600);
  }

  async ghostInstrumentCollapse() {
    const ghost = this.add.container(BEAM_CX + 140, BEAM_Y).setDepth(6).setAlpha(0);
    const g = this.add.graphics();
    g.lineStyle(2, C_BLUE_GRAY, 0.6);
    g.strokeRoundedRect(-40, -9, 80, 18, 4);
    g.strokeRoundedRect(-25, -30, 50, 20, 3);
    ghost.add(g);
    this.roundElements.push(ghost);
    await new Promise((res) => { this.tweens.add({ targets: ghost, alpha: 0.6, duration: 200, onComplete: res }); });
    await this.delay(300);
    const p = this.add.particles(ghost.x, ghost.y, "l55_dot", { speed: { min: 30, max: 80 }, angle: { min: 0, max: 360 }, scale: { start: 0.5, end: 0 }, lifespan: 350, tint: [C_BLUE_GRAY], emitting: false }).setDepth(20);
    p.explode(12);
    this.time.delayedCall(400, () => p.destroy());
    ghost.destroy();
    this.showCompileErrorStamp();
    await this.delay(600);
  }

  async nameplateDarkFlicker() {
    for (let i = 0; i < 3; i++) {
      this.modeText.setAlpha(0.15);
      await this.delay(90);
      this.modeText.setAlpha(1);
      await this.delay(90);
    }
    this.showCompileErrorStamp();
    await this.delay(600);
  }

  showCompileErrorStamp() {
    const stamp = this.add.text(640, 96, "COMPILE ERROR", { font: "bold 23px Arial", color: HEX_RED }).setOrigin(0.5).setDepth(30).setScale(1.5).setAngle(-6).setAlpha(0);
    this.roundElements.push(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 180 });
    this.screenShake(0.004, 150);
    this.time.delayedCall(1100, () => { if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 220, onComplete: () => stamp.destroy() }); });
  }

  screenShake(intensity = 0.004, duration = 150) {
    this.cameras.main.shake(duration, intensity);
  }

  // ══════════════════════════════════════════════════════════════
  // ASTRONOMER'S SLATE
  // ══════════════════════════════════════════════════════════════

  createAstronomersSlate() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0a0d18, 1);
    g.lineStyle(2, C_BRASS, 1);
    g.fillRoundedRect(SLATE_X, SLATE_Y, SLATE_W, SLATE_H, 8);
    g.strokeRoundedRect(SLATE_X, SLATE_Y, SLATE_W, SLATE_H, 8);
    g.lineStyle(1, 0x8a6435, 0.4);
    g.strokeRoundedRect(SLATE_X + 6, SLATE_Y + 6, SLATE_W - 12, SLATE_H - 12, 6);
    this.add.text(SLATE_X + 14, SLATE_Y + 16, "OBSERVATION SLATE", { font: "bold 12px Georgia", color: HEX_BRASS }).setDepth(11);
    this.slateLines = this.add.container(0, 0).setDepth(11);
    this._slateY = SLATE_Y + 42;

    this.add.text(SLATE_X + 14, SLATE_Y + SLATE_H - 34, "result:", { font: "13px Georgia", color: "#8a6435" }).setDepth(11);
    this.resultText = this.add.text(SLATE_X + 70, SLATE_Y + SLATE_H - 34, "—", { font: "bold 16px Courier New", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(11);
  }

  async chalkWriteLine(text, color) {
    const t = this.add.text(SLATE_X + 14, this._slateY, "", { font: "bold 15px Courier New", color: color || "#e8eaf6" }).setDepth(11);
    this.slateLines.add(t);
    for (let i = 0; i < text.length; i++) {
      if (!this._alive) return;
      t.setText(t.text + text[i]);
      if (t.width > SLATE_W - 28) t.setFontSize(10);
      await this.delay(24);
    }
    this._slateY += 26;
    if (this._slateY > SLATE_Y + SLATE_H - 60) this._slateY = SLATE_Y + 42;
  }

  chalkEvaluationArrow(value, type) {
    const display = type === "double" ? Number(value).toFixed(1) : String(value);
    const t = this.add.text(SLATE_X + 14, this._slateY, `→ ${display}`, { font: "bold 15px Courier New", color: this._typeColorHex(type) }).setAlpha(0);
    this.slateLines.add(t);
    this.tweens.add({ targets: t, alpha: 1, duration: 150 });
    this._slateY += 26;
  }

  wipeSlate() {
    this.slateLines.removeAll(true);
    this._slateY = SLATE_Y + 42;
  }

  updateResultRow(value, type) {
    if (value === null) { this.resultText.setFontSize(14).setText("—").setColor(HEX_GRAY); return; }
    if (type === "crash") { this.resultText.setText("✗ COMPILE ERROR").setColor(HEX_RED).setFontSize(11); return; }
    const display = type === "double" ? Number(value).toFixed(1) : String(value);
    this.resultText.setFontSize(14).setText(display).setColor(this._typeColorHex(type));
    this.tweens.add({ targets: this.resultText, scale: 1.2, duration: 110, yoyo: true });
  }

  // ══════════════════════════════════════════════════════════════
  // SOURCE DISPLAY / EXPRESSION MONITOR
  // ══════════════════════════════════════════════════════════════

  createSourceDisplay() {
    this.sourceContainer = this.add.container(0, 0).setDepth(15);
  }

  _syntaxTokenize(line) {
    const tokens = [];
    const re = /("(?:[^"\\]|\\.)*")|(\bMath\b)|(\bnew\b|\bint\b|\bdouble\b)|(\bSystem\.out\b)|(\.max\b|\.min\b|\bprintln\b)|(-?\d+\.?\d*)|([(){};.,=+])/g;
    let last = 0, m;
    const plain = (t) => t && tokens.push({ t, c: "#e0e0e0" });
    while ((m = re.exec(line))) {
      if (m.index > last) plain(line.slice(last, m.index));
      if (m[1]) tokens.push({ t: m[1], c: HEX_CYAN });
      else if (m[2]) tokens.push({ t: m[2], c: HEX_GOLD });
      else if (m[3]) tokens.push({ t: m[3], c: "#66bb6a" });
      else if (m[4]) tokens.push({ t: m[4], c: "#ffd740" });
      else if (m[5]) tokens.push({ t: m[5], c: HEX_CYAN });
      else if (m[6]) tokens.push({ t: m[6], c: /\./.test(m[6]) ? HEX_ORANGE : HEX_GOLD });
      else if (m[7]) tokens.push({ t: m[7], c: /[()]/.test(m[7]) ? "#ff4081" : "#78909c" });
      last = m.index + m[0].length;
    }
    if (last < line.length) plain(line.slice(last));
    return tokens.length ? tokens : [{ t: line, c: "#e0e0e0" }];
  }

  updateSourceDisplay(lines) {
    this.sourceContainer.removeAll(true);
    this.slotDefs = {};
    const fontSize = lines.length > 2 ? 13 : 15;
    const lineH = fontSize + 7;
    lines.forEach((line, i) => {
      const y = 96 + i * lineH - ((lines.length - 1) * lineH) / 2;
      const tokens = this._syntaxTokenize(line);
      const measured = tokens.map((t) => { const tmp = this.add.text(0, 0, t.t, { font: `bold ${fontSize}px Courier New` }); const w = tmp.width; tmp.destroy(); return w; });
      const totalW = measured.reduce((a, b) => a + b, 0);
      let x = 640 - totalW / 2;
      tokens.forEach((tok, ti) => {
        const t = this.add.text(x, y, tok.t, { font: `bold ${fontSize}px Courier New`, color: tok.c }).setOrigin(0, 0.5);
        this.sourceContainer.add(t);
        x += measured[ti];
      });
    });
  }

  createExpressionMonitor() {
    const g = this.add.graphics().setDepth(50);
    g.fillStyle(0x0a0d18, 1);
    g.lineStyle(1, 0x2a3654, 1);
    g.fillRoundedRect(W / 2 - 200, 10, 400, 44, 8);
    g.strokeRoundedRect(W / 2 - 200, 10, 400, 44, 8);
    this.monitorText = this.add.text(W / 2, 32, "", { font: "14px Courier New", color: "#e8eaf6" }).setOrigin(0.5).setDepth(51);
  }

  updateExpressionMonitor(text) {
    this.monitorText.setText(text);
    this.monitorText.setFontSize(this.monitorText.width > 380 ? 10 : 12);
  }

  // ══════════════════════════════════════════════════════════════
  // HUD
  // ══════════════════════════════════════════════════════════════

  createHUD() {
    const g = this.add.graphics().setDepth(49);
    g.fillStyle(0x060810, 0.93);
    g.fillRect(0, 0, W, 64);
    g.lineStyle(1, 0x2a3654, 1);
    g.lineBetween(0, 64, W, 64);

    this.add.text(20, 14, "THE OBSERVATORY", { font: "bold 17px Georgia", color: "#b0bec5" }).setDepth(50);
    this.add.text(20, 32, "Accretion Phase — Math Methods: max() & min()", { font: "13px Arial", color: "#546e7a" }).setDepth(50);

    this.add.text(1060, 8, "SCORE", { font: "11px Arial", color: "#546e7a" }).setDepth(50);
    this.scoreText = this.add.text(1060, 20, "0", { font: "bold 19px Arial", color: "#ffffff" }).setDepth(50);
    this.comboText = this.add.text(1060, 42, "×1", { font: "bold 14px Arial", color: HEX_GOLD }).setDepth(50);

    this.lifeIcons = [];
    for (let i = 0; i < 3; i++) {
      const lg = this.add.graphics({ x: 1150 + i * 26, y: 24 }).setDepth(50);
      lg.lineStyle(2, C_BRASS, 1);
      lg.beginPath();
      lg.moveTo(-7, 3); lg.lineTo(7, -3);
      lg.strokePath();
      lg.strokeCircle(-7, 3, 2.5);
      this.lifeIcons.push(lg);
    }
  }

  // ══════════════════════════════════════════════════════════════
  // BIT — astronomer variant (observing cloak, hand telescope)
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
    const scope = this.add.graphics();
    scope.lineStyle(2, C_BRASS, 0.8);
    scope.lineBetween(16, 10, 28, 4);
    scope.fillStyle(0x1a1408, 1);
    scope.fillRect(26, 1, 6, 7);
    c.add([g, cloak, eye, pupil, gloveL, scope, tip]);
    this.tweens.add({ targets: tip, alpha: 0.3, duration: 900, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: c, y: "+=3", duration: 2000, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
    this.bit = c;
  }

  bitSay(text) {
    this.hideBubble();
    const inner = this.add.text(0, 0, text, { font: "15px Arial", color: "#e0e0e0", wordWrap: { width: 340 } });
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
    this.tweens.add({ targets: b, alpha: 0, scale: 0.8, duration: 150, onComplete: () => b.destroy() });
  }

  async showBitFeedback(message) {
    await this.bitSay(message);
    if (!this._alive) return;
    await Promise.race([this.waitForClick(), this.delay(4000)]);
    this.hideBubble();
  }

  createAnnotation(x, y, text, colorHex) {
    const t = this.add.text(x, y, text, { font: "italic 13px Georgia", color: colorHex }).setOrigin(0.5).setDepth(70).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 200 });
    this.time.delayedCall(1600, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() }); });
    return t;
  }

  createFloatingText(x, y, text, colorHex, font = "bold 15px Arial", hold = 1400) {
    const t = this.add.text(x, y, text, { font, color: colorHex, wordWrap: { width: 280 }, align: "center" }).setOrigin(0.5).setDepth(31).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 180 });
    this.time.delayedCall(hold, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() }); });
    return t;
  }

  createConfetti(x, y, count = 30) {
    const p = this.add.particles(x, y, "l55_dot", {
      speed: { min: 80, max: 240 }, angle: { min: 0, max: 360 }, scale: { start: 0.9, end: 0 }, lifespan: 500,
      tint: [C_BRASS, C_GOLD, C_CYAN, C_BLUE_GRAY, 0xffffff], emitting: false,
    }).setDepth(75);
    p.explode(count);
    this.time.delayedCall(900, () => p.destroy());
  }

  // ══════════════════════════════════════════════════════════════
  // HONEST EVALUATOR — Math.max/min with inner-first nesting
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

  _evalSimpleValue(expr, vars) {
    const t = expr.trim();
    if (/^-?\d+\.\d+$/.test(t)) return { ok: true, value: parseFloat(t), type: "double" };
    if (/^-?\d+$/.test(t)) return { ok: true, value: parseInt(t, 10), type: "int" };
    if (/^[A-Za-z_]\w*$/.test(t) && vars && vars[t] !== undefined) return { ok: true, value: vars[t].value, type: vars[t].type };
    return { ok: false, crash: "eval" };
  }

  _warmStarToDouble(star) {
    star.type = "double";
    star.gfx.clear();
    star.gfx.fillStyle(C_ORANGE, 0.9);
    star.gfx.lineStyle(1, Phaser.Display.Color.IntegerToColor(C_ORANGE).darken(30).color, 1);
    const pts = [];
    for (let i = 0; i < 8; i++) { const r = i % 2 === 0 ? 20 : 9; const a = (Math.PI / 4) * i - Math.PI / 2; pts.push(Math.cos(a) * r, Math.sin(a) * r); }
    star.gfx.fillPoints(pts, true);
    star.gfx.strokePoints(pts, true);
    star.text.setText(Number(star.value).toFixed(1));
  }

  async carryIntoOuterCradle_byStar(starObj, cradleKey) {
    const pos = cradleKey === "a" ? CRADLE_A : CRADLE_B;
    await new Promise((res) => { this.tweens.add({ targets: starObj.container, x: pos.x, y: pos.y - 50, duration: 260, ease: "Sine.easeInOut", onComplete: res }); });
    await new Promise((res) => { this.tweens.add({ targets: starObj.container, y: pos.y, duration: 140, ease: "Sine.easeOut", onComplete: res }); });
    starObj.container.setAlpha(1);
    if (cradleKey === "a") this._starsA = starObj; else this._starsB = starObj;
  }

  /** Resolves an argument to its VALUE only — does NOT touch the outer
   * cradles yet. A nested Math.max/min recurses fully (its own isolated
   * spawn+oscillate+lock cycle, using both cradles since the outer
   * cradles are still empty at this point) and returns its detached
   * winner star for the caller to place later. This two-phase split
   * (resolve both values, THEN populate both outer cradles) is what
   * lets a nested call safely reuse the same two cradle slots without
   * clobbering the outer call's other, not-yet-placed argument. */
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
    if (resolved.kind === "nested") {
      await this.carryIntoOuterCradle_byStar(resolved.starObj, cradleKey);
    } else {
      await this.spawnArgumentStar(resolved.value, resolved.type, cradleKey);
    }
  }

  /** Real Math.max/min evaluation with genuine comparison, int→double
   * widening, and inner-first nested resolution. isTopLevel controls
   * whether the winner descends to the plinth (true) or is left
   * detached for the parent call to carry (false, nested). */
  async evalMathCall(callText, vars, isTopLevel) {
    const m = callText.trim().match(/^Math\.(max|min)\((.*)\)$/);
    if (!m) return { ok: false, crash: "eval" };
    const method = m[1];
    const args = this._splitTopArgs(m[2]);
    if (args.length !== 2) return { ok: false, crash: "wrong_arity" };
    this.setModePlate(method);

    // Phase 1 — resolve both argument VALUES first (any nested call runs
    // its own complete, isolated cradle cycle here, before either outer
    // cradle is touched).
    const aRes = await this._resolveArgValue(args[0], vars);
    if (!aRes.ok) return aRes;
    const bRes = await this._resolveArgValue(args[1], vars);
    if (!bRes.ok) return bRes;

    // Phase 2 — now populate the outer cradles: fresh spawn for literal/
    // variable args, or carry the nested call's already-resolved winner
    // star into place.
    await this._placeIntoCradle(aRes, "a");
    await this._placeIntoCradle(bRes, "b");

    // re-assert this call's own method — a nested inner call (e.g. the
    // .max inside Math.min(10, Math.max(4, 7))) may have flipped the
    // nameplate to its own method during Phase 1; the plate must read
    // THIS call's method before its own needle run.
    this.setModePlate(method);

    // widening happens BEFORE the comparison runs — both cradles widen
    // to double if either argument is a double, regardless of which one
    // ultimately wins (a losing int must still visibly widen).
    const widened = aRes.type === "double" || bRes.type === "double";
    if (widened) {
      if (this._starsA && this._starsA.type !== "double") this._warmStarToDouble(this._starsA);
      if (this._starsB && this._starsB.type !== "double") this._warmStarToDouble(this._starsB);
      await this.delay(150);
      if (!this._alive) return { ok: true, value: aRes.value, type: aRes.type };
    }

    await this.delay(120);
    if (!this._alive) return { ok: true, value: aRes.value, type: aRes.type };
    await this.needleOscillate();
    if (!this._alive) return { ok: true, value: aRes.value, type: aRes.type };

    const av = widened ? Number(aRes.value) : aRes.value;
    const bv = widened ? Number(bRes.value) : bRes.value;
    let winSide, winner, winnerType;
    if (av === bv) {
      await this.delay(200);
      this.createAnnotation(BEAM_CX, BEAM_Y - 70, "equal — either way, same answer", HEX_BLUE_GRAY);
      winSide = "a"; winner = av; winnerType = widened ? "double" : aRes.type;
    } else {
      const aWins = method === "min" ? av < bv : av > bv;
      winSide = aWins ? "a" : "b";
      winner = aWins ? av : bv;
      winnerType = widened ? "double" : (aWins ? aRes.type : bRes.type);
    }
    await this.needleLock(winSide);
    if (!this._alive) return { ok: true, value: winner, type: winnerType };

    const winStar = winSide === "a" ? this._starsA : this._starsB;
    const loseStar = winSide === "a" ? this._starsB : this._starsA;
    if (winStar) {
      this.tweens.add({ targets: winStar.container, scale: 1.25, duration: 150, yoyo: true });
      const glow = this.add.circle(winStar.container.x, winStar.container.y, 26, this._typeColorInt(winnerType), 0.25).setDepth(7);
      this.tweens.add({ targets: glow, alpha: 0, scale: 1.6, duration: 400, onComplete: () => glow.destroy() });
    }
    if (loseStar) this.tweens.add({ targets: loseStar.container, alpha: 0.6, duration: 200 });

    if (isTopLevel) {
      await this.descendReturnStar(winner, winnerType, winStar);
      this.time.delayedCall(500, () => { if (this._alive) this.resetCradles(); });
      return { ok: true, value: winner, type: winnerType };
    }
    // nested: detach the winner for the parent to carry; fade the loser now
    this._starsA = null; this._starsB = null;
    if (loseStar) {
      this.time.delayedCall(250, () => { if (loseStar.container.active) this.tweens.add({ targets: loseStar.container, alpha: 0, duration: 200, onComplete: () => loseStar.container.destroy() }); });
    }
    return { ok: true, value: winner, type: winnerType, winnerStarObj: winStar };
  }

  /** Executes statements honestly, including the static-call compile
   * rejections, which halt the run exactly where they occur. */
  async runStatements(lines, vars) {
    for (const raw of lines) {
      if (!this._alive) return { ok: true };
      const line = raw.trim();
      if (!line) continue;

      if (/^Math\s+\w+\s*=\s*new Math\(\);$/.test(line)) {
        await this.ghostInstrumentCollapse();
        return { ok: false, crash: "compile" };
      }
      const instanceMatch = line.match(/(\w+)\.(max|min)\(/);
      if (instanceMatch && instanceMatch[1] !== "Math") {
        if (instanceMatch[1] === "math") {
          await this.nameplateDarkFlicker();
          return { ok: false, crash: "compile" };
        }
        const recv = vars[instanceMatch[1]];
        await this.instanceCallShudder(recv ? recv.value : 0, recv ? recv.type : "int");
        return { ok: false, crash: "compile" };
      }
      const threeArgMatch = line.match(/Math\.(max|min)\(([^)]*)\)/);
      if (threeArgMatch && this._splitTopArgs(threeArgMatch[2]).length > 2) {
        this.showCompileErrorStamp();
        await this.delay(700);
        return { ok: false, crash: "compile" };
      }

      const declVar = line.match(/^(int|double)\s+(\w+)\s*=\s*(.*);$/);
      if (declVar) {
        const rhs = declVar[3].trim();
        if (/^Math\.(max|min)\(/.test(rhs)) {
          const r = await this.evalMathCall(rhs, vars, true);
          if (!r.ok) return r;
          vars[declVar[2]] = { value: r.value, type: declVar[1] === "double" ? "double" : r.type };
          await this.deliverToVariable(declVar[2], r.value, vars[declVar[2]].type);
        } else {
          const lit = this._evalSimpleValue(rhs, vars);
          if (!lit.ok) return lit;
          vars[declVar[2]] = { value: lit.value, type: declVar[1] === "double" ? "double" : lit.type };
        }
        continue;
      }

      const bareMathCall = line.match(/^(Math\.(max|min)\(.*\));$/);
      if (bareMathCall) {
        const r = await this.evalMathCall(bareMathCall[1], vars, true);
        if (!r.ok) return r;
        await this.discardFade();
        continue;
      }

      const printMatch = line.match(/^System\.out\.println\((.*)\);$/);
      if (printMatch) {
        const parts = printMatch[1].split("+").map((p) => p.trim());
        let out = "";
        for (const p of parts) {
          if (/^".*"$/.test(p)) out += p.slice(1, -1);
          else if (vars[p] !== undefined) out += vars[p].type === "double" ? Number(vars[p].value).toFixed(1) : String(vars[p].value);
        }
        this._lastPrintedLine = out;
        continue;
      }
    }
    return { ok: true };
  }

  // ══════════════════════════════════════════════════════════════
  // TUTORIAL (6 steps)
  // ══════════════════════════════════════════════════════════════

  checkTutorial() {
    let done = false;
    try { done = localStorage.getItem(TUTORIAL_KEY) === "true"; } catch (_) {}
    if (done && !this._forceTutorial) this.time.delayedCall(300, () => this.startRound(0));
    else this.runTutorial();
  }

  async runTutorial() {
    const A = () => this._alive;
    await this.delay(400); if (!A()) return;
    await this.bitSay("Welcome to the Observatory, Astronomer — leave the archive's lamplight behind; tonight we work by starlight. Before you stands the GREAT COMPARATOR. It answers one ancient question: of two values... which is greater? And here is the strangest thing about it: nobody ever built it, and nobody ever will. It simply IS.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(5500)]); if (!A()) return;
    this.hideBubble();

    let vars = {};
    this.updateSourceDisplay(["int brighter = Math.max(3, 7);"]);
    await this.runStatements(["int brighter = Math.max(3, 7);"], vars); if (!A()) return;
    await this.bitSay("Math dot max — read it carefully. 'Math' is the CLASS — the instrument's name, engraved forever. Not a variable, not an object you made. You bring two values TO it; it hands back the greater. And see the cradles: both stars still shine. The Comparator measures — it never takes.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(5500)]); if (!A()) return;
    this.hideBubble();
    this.wipeSlate();
    this.clearVarContainers();
    this.resetCradles();

    vars = {};
    this.updateSourceDisplay(["int fainter = Math.min(3, 7);"]);
    await this.runStatements(["int fainter = Math.min(3, 7);"], vars); if (!A()) return;
    await this.bitSay("The twin method — min. Same instrument, opposite verdict: the SMALLER value wins the descent. Max for the brightest star, min for the faintest. Two questions, one machine.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4800)]); if (!A()) return;
    this.hideBubble();
    this.wipeSlate();
    this.clearVarContainers();
    this.resetCradles();

    vars = { a: { value: 5, type: "int" }, b: { value: 3, type: "int" } };
    this.updateSourceDisplay(["int x = 5.max(3);"]);
    await this.runStatements(["int x = a.max(b);"], vars); if (!A()) return;
    await this.bitSay("REFUSED — and here is the wing's great lesson. Every method you've ever called rode on an object: str dot length, list dot add. But a bare number carries NO instruments. The comparator does not live inside 5 — it lives HERE, in the Math class. Math dot max. The class name is the address.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(6000)]); if (!A()) return;
    this.hideBubble();
    this.clearRound();

    this.updateSourceDisplay(["Math m = new Math();"]);
    await this.runStatements(["Math m = new Math();"], {}); if (!A()) return;
    await this.bitSay("Also refused! You cannot build a second Comparator — Java seals the Math class shut. No 'new Math()', ever. One instrument, standing since before your program began, free for all callers. That's what STATIC means — and every method in this wing works this way.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(6000)]); if (!A()) return;
    this.hideBubble();
    this.clearRound();

    vars = {};
    this.updateSourceDisplay(["int top = Math.max(4, Math.max(9, 2));"]);
    await this.runStatements(["int top = Math.max(4, Math.max(9, 2));"], vars); if (!A()) return;
    await this.bitSay("Calls can NEST — and the INNERMOST resolves first. Its answer becomes the outer call's argument. Two measurements, one final verdict — this is how you find the greatest of THREE. The dome is yours, Astronomer — the stars are waiting!");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(5500)]); if (!A()) return;
    this.hideBubble();

    try { localStorage.setItem(TUTORIAL_KEY, "true"); } catch (_) {}
    this.wipeSlate();
    this.clearVarContainers();
    this.resetCradles();
    this.updateSourceDisplay([]);
    this.updateResultRow(null, null);
    this.startRound(0);
  }

  // ══════════════════════════════════════════════════════════════
  // ROUND LIFECYCLE
  // ══════════════════════════════════════════════════════════════

  startRound(index) {
    this.currentRound = index;
    const config = ROUNDS[index];
    this.roundAttempts = 0;
    this.roundStartTime = this.time.now;
    this.clearRound();
    this.clearVarContainers();
    this.resetCradles();
    this.wipeSlate();
    this.updateResultRow(null, null);
    this.setModePlate(config.method === "min" ? "min" : "max");

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
    const badgeT = this.add.text(-250, -10, String(this.currentRound + 1), { font: "bold 16px Arial", color: "#060810" }).setOrigin(0.5);
    const t = this.add.text(-220, -10, promptText, { font: "16px Arial", color: "#e8eaf6", wordWrap: { width: 460 } }).setOrigin(0, 0.5);
    c.add([g, badge, badgeT, t]);
    this.tweens.add({ targets: c, alpha: 1, duration: 250 });
    this.roundElements.push(c);
    return c;
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE A/B/C — PREDICT
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
    const spacing = 290;
    const startX = 640 - ((n - 1) * spacing) / 2;
    shuffled.forEach((opt, i) => {
      const x = startX + i * spacing, y = 660;
      const c = this.add.container(x, y).setDepth(41);
      const g = this.add.graphics();
      const w = 270, h = 46;
      const draw = (stroke) => {
        g.clear();
        g.fillStyle(0x0a0d18, 1);
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
        g.lineStyle(2, stroke, 1);
        g.strokeRoundedRect(-w / 2, -h / 2, w, h, 10);
      };
      draw(C_BRASS);
      const label = opt.label || opt.value;
      const txt = this.add.text(0, 0, label, { font: "bold 14px Courier New", color: "#e8eaf6" }).setOrigin(0.5);
      if (txt.width > w - 20) txt.setFontSize(10);
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
    this.roundAttempts++;
    const correct = opt.value === config.correct;
    const timeMs = Math.round(this.time.now - this.roundStartTime);
    this.logAttempt(config, correct, opt.value, opt.tag, timeMs);

    this.roundElements.forEach((e) => e.disableInteractive && e.disableInteractive());
    const g = bubbleContainer.list[0];
    g.clear();
    g.fillStyle(0x0a0d18, 1);
    g.fillRoundedRect(-135, -23, 270, 46, 10);
    g.lineStyle(2, correct ? C_GREEN_BRIGHT : C_RED, 1);
    g.strokeRoundedRect(-135, -23, 270, 46, 10);
    if (!correct) this.tweens.add({ targets: bubbleContainer, x: bubbleContainer.x + 5, duration: 40, yoyo: true, repeat: 4 });

    await this.delay(200);
    if (!this._alive) return;

    for (const l of config.source) await this.chalkWriteLine(l, "#8ea6c8");
    await this.runStatements(config.source, {});
    if (config.revealNote) this.createFloatingText(SLATE_X + SLATE_W / 2, SLATE_Y + SLATE_H + 30, config.revealNote, HEX_GRAY, "13px Arial", 2800);
    await this.delay(400);
    if (!this._alive) return;

    if (correct) {
      this.updateScore(100 * this.getComboMultiplier() + (timeMs < 6000 ? 25 : 0));
      this.updateCombo(true);
      if (this.roundAttempts === 1) this.correctFirstTry++;
      this.totalTime += timeMs;
      await this.delay(300);
      this.advanceRound();
    } else {
      this.loseLife();
      this.updateCombo(false);
      this.totalTime += timeMs;
      if (this.lives <= 0) { this.time.delayedCall(400, () => this.gameOver()); return; }
      await this.showBitFeedback(MISCONCEPTION_FEEDBACK[opt.tag] || "Not quite — watch the needle and try again.");
      if (!this._alive) return;
      this.clearRound();
      this.clearVarContainers();
      this.resetCradles();
      this.wipeSlate();
      this.updateResultRow(null, null);
      this.setModePlate(config.method === "min" ? "min" : "max");
      this.setupPredict(config);
    }
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE D — ASTRONOMER COMMAND
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
    const fontSize = lines.length > 2 ? 13 : 15;
    const lineH = fontSize + 8;
    lines.forEach((rawLine, i) => {
      const y = 96 + i * lineH - ((lines.length - 1) * lineH) / 2;
      const parts = rawLine.split(/<slot:(\w+)>/);
      const measured = [];
      let totalW = 0;
      parts.forEach((part, pi) => {
        if (pi % 2 === 0) {
          const tmp = this.add.text(0, 0, part, { font: `bold ${fontSize}px Courier New` });
          measured.push(tmp.width); totalW += tmp.width; tmp.destroy();
        } else { measured.push(190); totalW += 196; }
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
          const w = 190, h = fontSize + 8;
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
      const label = this.add.text(x + w / 2, y + h / 2, hintDef ? hintDef.hint : "", { font: "italic 11px Courier New", color: "#3d4450" }).setOrigin(0.5).setDepth(17);
      def.hintLabel = label;
      this.sourceContainer.add(label);
    }
  }

  createCartridgeTray(config) {
    const shuffled = Phaser.Utils.Array.Shuffle(config.cartridges.slice());
    let x = 60;
    const rowY = 600;

    shuffled.forEach((def) => {
      const style = { font: "bold 14px Courier New", color: HEX_CYAN };
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
    const bt = this.add.text(0, 0, "MEASURE", { font: "bold 16px Arial", color: "#060810" }).setOrigin(0.5);
    btn.add([bg, bt]);
    btn.setSize(130, 44);
    btn.on("pointerover", () => { if (this._measureReady) { bdraw(true, true); btn.setScale(1.03); } });
    btn.on("pointerout", () => { bdraw(this._measureReady, false); btn.setScale(1); });
    btn.on("pointerdown", () => { if (this._measureReady) this.onMeasurePressed(config); });
    this.measureButton = { c: btn, draw: bdraw };
    this.roundElements.push(btn);
    this.disableMeasureButton();
  }

  enableMeasureButton() { this._measureReady = true; this.measureButton.draw(true, false); this.measureButton.c.setInteractive({ useHandCursor: true }); }
  disableMeasureButton() { this._measureReady = false; this.measureButton.draw(false, false); this.measureButton.c.disableInteractive(); }

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
        this.updateMeasureButtonState();
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

  _nearestOpenSlot(x, y) {
    let best = null, bestDist = 80;
    for (const id in this.slotDefs) {
      const def = this.slotDefs[id];
      if (!def || !def.rect) continue;
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
    const key = this._nearestOpenSlot(obj.x, obj.y);
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
    const key = this._nearestOpenSlot(obj.x, obj.y);
    if (this._dragHoverSlotKey && this.slotDefs[this._dragHoverSlotKey]) this.slotDefs[this._dragHoverSlotKey].drawDash(false);
    this._dragHoverSlotKey = null;

    if (key) {
      if (!this.slotContents[key]) this.slotContents[key] = [];
      this.slotContents[key].push({ container: obj });
      obj.setData("placedIn", key);
      const def = this.slotDefs[key];
      this.tweens.add({ targets: obj, x: def.rect.x + def.rect.w / 2, y: def.rect.y + def.rect.h / 2, duration: 150, ease: "Cubic.easeOut" });
      this._drawSlotPlaceholder(key);
      this.updateMeasureButtonState();
    } else {
      const home = obj.getData("home");
      this.tweens.add({ targets: obj, x: home.x, y: home.y, duration: 250, ease: "Back.easeOut" });
    }
  }

  updateMeasureButtonState() {
    const allFilled = Object.keys(this.slotDefs).every((id) => (this.slotContents[id] || []).length > 0);
    if (allFilled) this.enableMeasureButton(); else this.disableMeasureButton();
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

  async onMeasurePressed(config) {
    this.inputLocked = true;
    this.disableMeasureButton();
    this.roundAttempts++;
    const timeMs = Math.round(this.time.now - this.roundStartTime);

    const slotId = Object.keys(this.slotDefs)[0];
    const code = this.slotContents[slotId][0].container.getData("code");
    const tag = this.slotContents[slotId][0].container.getData("tag");

    const tests = config.tests;
    let allPass = true;
    for (let ti = 0; ti < tests.length; ti++) {
      if (!this._alive) return;
      const test = tests[ti];
      this.clearVarContainers();
      this.resetCradles();
      this.wipeSlate();
      this.updateResultRow(null, null);
      this._lastPrintedLine = null;
      const statements = this._substituteSkeleton(config, test);
      if (tests.length > 1) this.createFloatingText(640, 200, `TEST ${ti + 1}`, HEX_BRASS, "bold 14px Courier New", 1200);

      const vars = {};
      for (const l of statements) await this.chalkWriteLine(l, "#8ea6c8");
      const runResult = await this.runStatements(statements, vars);
      if (!this._alive) return;

      let pass = runResult.ok;
      if (pass && test.expectedVariable) {
        const v = vars[test.expectedVariable.name];
        pass = v && Number(v.value) === Number(test.expectedVariable.value);
      }
      if (pass && test.expectedOutput !== undefined) {
        pass = this._lastPrintedLine === test.expectedOutput;
      }
      this.createFloatingText(PLINTH.x, PLINTH.y - 60, pass ? "✓" : "✗", pass ? HEX_GREEN_BRIGHT : HEX_RED, "bold 23px Arial", 900);
      if (!pass) { allPass = false; break; }
      await this.delay(350);
    }

    this.logAttempt(config, allPass, code, allPass ? null : tag, timeMs);

    if (allPass) {
      this.updateScore(100 * this.getComboMultiplier() + (timeMs < 6000 ? 25 : 0));
      this.updateCombo(true);
      if (this.roundAttempts === 1) this.correctFirstTry++;
      this.totalTime += timeMs;
      if (config.postMissionNote) await this.showBitFeedback(config.postMissionNote);
      if (!this._alive) return;
      await this.delay(300);
      this.advanceRound();
    } else {
      const exploratory = this._commandFirstFail;
      this._commandFirstFail = false;
      this.totalTime += timeMs;
      if (!exploratory) {
        this.loseLife();
        if (this.lives <= 0) { this.time.delayedCall(400, () => this.gameOver()); return; }
      }
      this.updateCombo(false);
      await this.showBitFeedback(MISCONCEPTION_FEEDBACK[tag] || "The instrument ran exactly what you assembled — compare the slate against the mission and adjust.");
      if (!this._alive) return;
      this.inputLocked = false;
      this.clearVarContainers();
      this.resetCradles();
      this.wipeSlate();
      this.updateResultRow(null, null);
      this.slotContents = {};
      this.renderCommandSkeleton(config);
      this.cartridges.forEach((cart) => {
        cart.container.setData("placedIn", null);
        const home = cart.container.getData("home");
        this.tweens.add({ targets: cart.container, x: home.x, y: home.y, duration: 200 });
      });
      this.disableMeasureButton();
    }
  }

  // ══════════════════════════════════════════════════════════════
  // SCORING / LIVES / COMBO
  // ══════════════════════════════════════════════════════════════

  getComboMultiplier() {
    if (this.combo >= 5) return 3;
    if (this.combo >= 3) return 2;
    return 1;
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
    if (mult > 1) this.tweens.add({ targets: this.comboText, scale: 1.3, duration: 150, yoyo: true });
  }

  loseLife() {
    this.lives = Math.max(0, this.lives - 1);
    const icon = this.lifeIcons[this.lives];
    if (icon) this.tweens.add({ targets: icon, alpha: 0.12, duration: 400 });
    return this.lives <= 0;
  }

  logAttempt(config, correct, selectedAnswer, misconceptionTag, timeMs) {
    this.attemptLog.push({
      round: config.round, type: config.type, concept: config.concept,
      correct, selectedAnswer, misconceptionTag: misconceptionTag || null,
      timeMs, attemptNumber: this.roundAttempts,
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
      console.warn("Level55Scene: /api/wellbeing/predict-struggle unreachable, skipping behavioral signal for this level:", e);
    }
  }

  advanceRound() {
    if (this.currentRound === 2) this.runBehavioralCheck();
    this.clearRound();
    const next = this.currentRound + 1;
    if (next >= ROUNDS.length) this.levelComplete();
    else this.startRound(next);
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
      this._nightStars.forEach((s, i) => this.time.delayedCall(i * 60, () => { if (s.obj.active) this.tweens.add({ targets: s.obj, alpha: 0.05, duration: 300 }); }));
      this._orrerySpeedMult = 0;
      this.needleContainer.setAngle(85);
      this.wipeSlate();
      const motes = this.ambient;
      this.ambient = null;
      (motes || []).forEach((m) => this.tweens.add({ targets: m, y: 632, alpha: 0, duration: 1500, ease: "Sine.easeIn" }));
      this.tweens.add({ targets: this.telescopeGlint, alpha: 0, duration: 500 });

      const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
      this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });
      const title = this.add.text(640, 240, "CLOUDED OUT", { font: "bold 38px Georgia", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
      this.tweens.add({ targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut", onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }) });
      this.add.text(640, 310, `Score: ${this.score}`, { font: "21px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
      this.add.text(640, 350, `Rounds Completed: ${this.currentRound} / 12`, { font: "18px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);
      this._makeButton(525, 420, "WAIT FOR CLEAR SKIES", 200, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
      this._makeButton(755, 420, "RETURN TO MENU", 200, 50, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.start("MenuScene"));
    })();
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearRound();
    this.hideBubble();

    try { GameManager.completeLevel(54, Math.round((this.correctFirstTry / 12) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("math_max_min_schema"); } catch (_) {}
    try {
      localStorage.setItem("level55_results", JSON.stringify({
        level: 55, concept: "math_max_min", phase: "accretion",
        score: this.score, accuracy: this.correctFirstTry / 12, avgTime: this.totalTime / 12,
        comboMax: this.maxCombo, stars: this._starRating(), livesRemaining: this.lives,
        attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.observatoryFinale().then(() => { if (this._alive) this.showScoreTally(); });
  }

  async observatoryFinale() {
    // the slit widens, flooding the scene with starlight
    const wash = this.add.rectangle(640, 360, W, H, 0xe8eaf6, 0).setDepth(3);
    this.tweens.add({ targets: wash, fillAlpha: 0.06, duration: 800, yoyo: true, hold: 400 });
    this._nightStars.forEach((s) => { s.twinkles = true; });
    this.tweens.add({ targets: this.telescopeGlint, alpha: 0.5, duration: 300, yoyo: true, repeat: 2 });
    this._orrerySpeedMult = 3;
    this.time.delayedCall(2200, () => { this._orrerySpeedMult = 1; });

    // needle happy spin
    await new Promise((res) => { this.tweens.add({ targets: this.needleContainer, angle: 360 + 34, duration: 700, ease: "Cubic.easeInOut", onComplete: res }); });
    this.needleContainer.setAngle(0);

    // constellation spelling MAX then MIN
    const spellWord = async (word) => {
      const stars = [];
      const startX = 640 - (word.length * 34) / 2;
      for (let i = 0; i < word.length; i++) {
        const s = this.add.text(startX + i * 34, 90, word[i], { font: "bold 23px Georgia", color: HEX_GOLD }).setOrigin(0.5).setDepth(5).setAlpha(0);
        this.tweens.add({ targets: s, alpha: 0.8, duration: 150, delay: i * 80 });
        stars.push(s);
      }
      await this.delay(900);
      return stars;
    };
    const maxStars = await spellWord("MAX");
    await this.delay(500);
    maxStars.forEach((s) => this.tweens.add({ targets: s, alpha: 0, duration: 300 }));
    await this.delay(350);
    const minStars = await spellWord("MIN");
    this.createConfetti(640, 300, 40);
    await this.delay(700);
    minStars.forEach((s) => s.destroy());
  }

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

    const title = this.add.text(640, 190, "FIRST LIGHT", { font: "bold 34px Georgia", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(91).setScale(0);
    this.tweens.add({ targets: title, scale: 1, duration: 350, ease: "Back.easeOut" });

    const acc = Math.round((this.correctFirstTry / 12) * 100);
    const avgSec = (this.totalTime / 12 / 1000).toFixed(1);
    const lines = [`ACCURACY: ${acc}%`, `BEST COMBO: ×${this.getComboMultiplierFor(this.maxCombo)}`, `AVG TIME: ${avgSec}s`];
    lines.forEach((s, i) => {
      const t = this.add.text(500, 245 + i * 28, s, { font: "16px Arial", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
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

    // badge — a tiny balance-needle over twin stars
    const badge = this.add.container(640, 465).setDepth(91).setAlpha(0);
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillCircle(0, 0, 30);
    bg.lineStyle(3, C_GOLD, 1);
    bg.strokeCircle(0, 0, 30);
    bg.lineStyle(2, C_BRASS, 1);
    bg.lineBetween(-14, 4, 14, -4);
    bg.fillCircle(-14, 4, 2);
    bg.fillCircle(14, -4, 2);
    bg.fillStyle(C_GOLD, 0.9);
    const starPts1 = [], starPts2 = [];
    for (let i = 0; i < 8; i++) { const r = i % 2 === 0 ? 7 : 3; const a = (Math.PI / 4) * i - Math.PI / 2; starPts1.push(-14 + Math.cos(a) * r, -8 + Math.sin(a) * r); }
    for (let i = 0; i < 8; i++) { const r = i % 2 === 0 ? 7 : 3; const a = (Math.PI / 4) * i - Math.PI / 2; starPts2.push(14 + Math.cos(a) * r, -16 + Math.sin(a) * r); }
    bg.fillPoints(starPts1, true);
    bg.fillPoints(starPts2, true);
    badge.add(bg);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 1950 });
    const badgeLbl = this.add.text(640, 505, "max()/min() SCHEMA ACQUIRED", { font: "bold 14px Georgia", color: HEX_GOLD }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: badgeLbl, alpha: 1, duration: 300, delay: 2100 });

    this._makeButton(500, 545, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(760, 545, "NEXT: The Meridian Trials →", 270, 44, { fill: 0x00733a, stroke: C_GREEN_BRIGHT, textColor: "#ffffff" }, () => {
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
    const t = this.add.text(0, 0, label, { font: "bold 17px Arial", color: style.textColor }).setOrigin(0.5);
    c.add([g, t]);
    c.setSize(w, h);
    c.setInteractive({ useHandCursor: true });
    c.on("pointerover", () => { draw(true); c.setScale(1.04); });
    c.on("pointerout", () => { draw(false); c.setScale(1); });
    c.on("pointerdown", onClick);
    return c;
  }
}
