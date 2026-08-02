/**
 * Level 61 — "The Power Tower" (Math Methods: Accretion Phase — pow())
 * ===========================================================================
 * Opens the pow() trilogy — the Math Wing's third and final method. The
 * Cascade Engine is a vertical stack of multiplication stages: the base
 * enters at the bottom as a star, each stage multiplies the running
 * product by the base, the exponent sets how many stages fire, and the
 * final product emerges from the summit — ALWAYS a double, even for
 * int arguments. Zero exponent bypasses the whole cascade (product of
 * nothing is 1); one exponent fires a single stage (passthrough);
 * fractional exponents run the cascade in reverse (a root).
 *
 * The evaluator is honest: Math.pow(base, exp) computes via genuine
 * repeated multiplication (never string-matched), the return type is
 * always double, and negative bases/fractional exponents behave exactly
 * as Java's Math.pow (identical to JS's Math.pow for every case here).
 */

import Phaser from "phaser";
import { GameManager } from "../../../GameManager.js";
import { BadgeSystem } from "../../../BadgeSystem.js";

const W = 1280, H = 720;

const C_CYAN = 0x4fc3f7, C_GOLD = 0xffd740, C_ORANGE = 0xff9800, C_BLUE_GRAY = 0x8ea6c8;
const C_GREEN_BRIGHT = 0x00e676, C_RED = 0xf44336, C_GRAY = 0x78909c, C_BRASS = 0xc8a05a;
const HEX_CYAN = "#4fc3f7", HEX_GOLD = "#ffd740", HEX_ORANGE = "#ff9800", HEX_BLUE_GRAY = "#8ea6c8";
const HEX_GREEN_BRIGHT = "#00e676", HEX_RED = "#f44336", HEX_GRAY = "#78909c", HEX_BRASS = "#c8a05a";

// Cascade engine layout
const ENGINE_CX = 455;
const BASE_PLATE_Y = 496;
const ENTRY_PORT_Y = 522;
const STAGE_COUNT = 6;
const STAGE_Y0 = 430, STAGE_DY = 60; // stage i (0=lowest) at STAGE_Y0 - i*STAGE_DY
const SUMMIT_Y = 100;
const PLINTH_X = 455, PLINTH_Y = 575;
const DIAL_X = 280, DIAL_Y = 350, DIAL_R = 30;
const SLATE_X = 680, SLATE_Y = 258, SLATE_W = 520, SLATE_H = 200;
const TUTORIAL_KEY = "level61_tutorial_done";

// ══════════════════════════════════════════════════════════════
// ROUND CONFIGURATION
// ══════════════════════════════════════════════════════════════
const ROUNDS = [
  { round: 1, type: "predict",
    source: ["double r = Math.pow(3, 4);"],
    question: "What is stored in r?", correct: "81.0",
    options: [
      { value: "81.0", tag: null },
      { value: "12.0", tag: "pow_multiplies_args_belief" },
      { value: "7.0", tag: "pow_adds_args_belief" },
      { value: "64.0", tag: "pow_base_exp_swapped_belief" },
    ],
    revealNote: "Four stages, each × 3: 3 → 9 → 27 → 81. The cascade makes it visible — pow is REPEATED MULTIPLICATION, not a single multiply.",
    concept: "basic_pow" },

  { round: 2, type: "predict",
    source: ["double r = Math.pow(10, 3);"],
    question: "What is stored in r?", correct: "1000.0",
    options: [
      { value: "1000.0", tag: null },
      { value: "30.0", tag: "pow_multiplies_args_belief" },
      { value: "1000", tag: "pow_returns_int_belief" },
      { value: "13.0", tag: "pow_adds_args_belief" },
    ],
    revealNote: "Three stages of × 10: 10 → 100 → 1000. And 1000.0, not 1000 — the cascade always exits in double.",
    concept: "pow_ten" },

  { round: 3, type: "predict",
    source: ["double r = Math.pow(2, 10);"],
    question: "What is stored in r?", correct: "1024.0",
    options: [
      { value: "1024.0", tag: null },
      { value: "20.0", tag: "pow_multiplies_args_belief" },
      { value: "100.0", tag: "pow_base_exp_swapped_belief" },
      { value: "1024", tag: "pow_returns_int_belief" },
    ],
    revealNote: "Ten stages of × 2 — the cascade climbs fast. 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024. Exponentiation grows MUCH faster than multiplication.",
    concept: "pow_large_exp" },

  { round: 4, type: "predict",
    source: ["double r = Math.pow(7, 0);"],
    question: "What is stored in r?", correct: "1.0",
    options: [
      { value: "1.0", tag: null },
      { value: "0.0", tag: "pow_zero_returns_zero_belief" },
      { value: "7.0", tag: "pow_zero_returns_base_belief" },
      { value: "error", tag: "pow_zero_error_belief", label: "Runtime error" },
    ],
    revealNote: "Zero stages — the cascade stands idle. The bypass channel carries the star straight to the summit, where it becomes 1.0. ANY base, exponent zero, answer 1.",
    concept: "zero_exponent" },

  { round: 5, type: "predict",
    source: ["double r = Math.pow(42, 1);"],
    question: "What is stored in r?", correct: "42.0",
    options: [
      { value: "42.0", tag: null },
      { value: "1.0", tag: "pow_one_returns_one_belief" },
      { value: "42", tag: "pow_returns_int_belief" },
      { value: "43.0", tag: "pow_adds_one_belief" },
    ],
    revealNote: "One stage — the base passes through whole. 42 multiplied by itself ONCE is still 42. (In double: 42.0.)",
    concept: "one_exponent" },

  { round: 6, type: "predict",
    source: ["int area = Math.pow(5, 2);"],
    question: "What happens?", correct: "compile_error",
    options: [
      { value: "compile_error", tag: null, label: "COMPILE ERROR — lossy conversion double → int" },
      { value: "area_25", tag: "pow_returns_int_belief", label: "area = 25" },
      { value: "area_25_0", tag: "int_holds_double_belief", label: "area = 25.0" },
      { value: "runtime_error", tag: "runtime_vs_compile_confusion", label: "Runtime exception" },
    ],
    revealNote: "The cascade produced 25.0 — a double — and the int container refused it. pow's permanent type: double out, always. Cast it ((int) Math.pow(5, 2)) or use a double container.",
    concept: "double_return_type" },

  { round: 7, type: "predict",
    source: ["double r = 3.pow(4);"],
    question: "What happens?", correct: "compile_error",
    options: [
      { value: "compile_error", tag: null, label: "COMPILE ERROR — int has no methods" },
      { value: "returns_81", tag: "instance_call_on_number_belief", label: "r = 81.0" },
      { value: "returns_12", tag: "instance_call_on_number_belief", label: "r = 12.0" },
      { value: "runtime_error", tag: "runtime_vs_compile_confusion", label: "Runtime exception" },
    ],
    revealNote: "The star shuddered — numbers carry no engines. The cascade belongs to the Math class: Math.pow(3, 4). Seven levels, three instruments, one law: Math dot method. Always.",
    concept: "static_probe" },

  { round: 8, type: "predict",
    source: ["double r = Math.pow(-2, 3);"],
    question: "What is stored in r?", correct: "-8.0",
    options: [
      { value: "-8.0", tag: null },
      { value: "8.0", tag: "pow_strips_sign_belief" },
      { value: "-6.0", tag: "pow_multiplies_args_belief" },
      { value: "error", tag: "pow_negative_base_error_belief", label: "Runtime error" },
    ],
    revealNote: "Negative bases are welcome: (−2) × (−2) = 4 × (−2) = −8. Odd exponents keep the sign; even exponents erase it.",
    concept: "negative_base" },

  { round: 9, type: "predict",
    source: ["double r = Math.pow(9, 0.5);"],
    question: "What is stored in r?", correct: "3.0",
    options: [
      { value: "3.0", tag: null },
      { value: "4.5", tag: "pow_multiplies_args_belief" },
      { value: "81.0", tag: "pow_base_exp_swapped_belief" },
      { value: "error", tag: "pow_fraction_error_belief", label: "Runtime error" },
    ],
    revealNote: "Half a stage — the cascade in reverse. pow(9, 0.5) asks: what number, multiplied by ITSELF, gives 9? The answer is 3. A fractional exponent is a root.",
    concept: "fractional_exponent_seed" },

  { round: 10, type: "command",
    skeleton: ["int side = 6;", "double area = <slot:call>;", 'System.out.println("Area: " + area);'],
    mission: "Compute the area of a SQUARE with the given side length.",
    slots: [{ id: "call", hint: "the squared area" }],
    cartridges: [
      { code: "Math.pow(side, 2)", correct: true },
      { code: "Math.pow(2, side)", tag: "pow_base_exp_swapped_belief" },
      { code: "side * 2", tag: "pow_multiplies_args_belief" },
      { code: "side.pow(2)", tag: "instance_call_on_number_belief" },
    ],
    tests: [{ expectedOutput: "Area: 36.0" }],
    postMissionNote: "Bit: 'Side squared — one line, the oldest geometry in the world. And the swapped build computed 2^6 = 64: the base and exponent are NOT interchangeable.'",
    concept: "command_square" },

  { round: 11, type: "command",
    skeleton: ["double principal = 1000;", "double rate = 1.05;", "int years = /* test value */;", "double balance = <slot:call>;", 'System.out.println("Balance: " + balance);'],
    mission: "Compute compound growth: balance = principal × rate^years. For 3 years: 'Balance: 1157.625'.",
    slots: [{ id: "call", hint: "the compound calculation" }],
    cartridges: [
      { code: "principal * Math.pow(rate, years)", correct: true },
      { code: "Math.pow(principal * rate, years)", tag: "compound_shape_wrong" },
      { code: "principal * rate * years", tag: "simple_interest_belief" },
      { code: "Math.pow(rate, years)", tag: "principal_missing" },
    ],
    tests: [
      { substitutions: { years: "3" }, expectedOutput: "Balance: 1157.625" },
      { substitutions: { years: "1" }, expectedOutput: "Balance: 1050.0" },
      { substitutions: { years: "0" }, expectedOutput: "Balance: 1000.0" },
    ],
    revealNote: "principal × rate^years — the cascade raises the rate through `years` stages, then the principal scales the result. The zero-year test proves it: rate^0 = 1, balance = principal × 1 = 1000.",
    postMissionNote: "Bit: 'Compound growth — the formula behind savings, populations, and epidemics. The cascade handles the exponent; ordinary multiplication scales the base.'",
    concept: "command_compound" },

  { round: 12, type: "command",
    skeleton: ["int base = /* test value */;", "int exp = /* test value */;", "double result = Math.pow(base, exp);", "int whole = <slot:cast>;", 'System.out.println("Whole: " + whole);'],
    mission: "Store the pow result as a WHOLE NUMBER (int). For base=2, exp=5: 'Whole: 32'. For base=3, exp=3: 'Whole: 27'.",
    slots: [{ id: "cast", hint: "the cast" }],
    cartridges: [
      { code: "(int) result", correct: true },
      { code: "result", tag: "pow_returns_int_belief" },
      { code: "(int) Math.pow(base, exp)", tag: "redundant_but_correct" },
      { code: "Integer.valueOf(result)", tag: "valueof_wrong_type" },
    ],
    tests: [
      { substitutions: { base: "2", exp: "5" }, expectedOutput: "Whole: 32" },
      { substitutions: { base: "3", exp: "3" }, expectedOutput: "Whole: 27" },
    ],
    revealNote: "The cast cuts the .0 — 32.0 becomes 32. Java won't narrow a double to an int silently; (int) is the key.",
    postMissionNote: "Bit (setting the gear in place): 'The cascade is yours, Engineer — repeated multiplication, any base, any exponent, always a double. Three instruments under this dome now answer to you: the Comparator, the Rail, and the Cascade.'",
    concept: "command_cast" },
];

const MISCONCEPTION_FEEDBACK = {
  pow_multiplies_args_belief: "The cascade doesn't multiply base BY exp — it multiplies base by ITSELF, exp TIMES. pow(3, 4) is 3 × 3 × 3 × 3 = 81, not 3 × 4 = 12. Count the stages.",
  pow_adds_args_belief: "pow is multiplication, not addition — and not single multiplication, but REPEATED multiplication. Read the cascade: each stage multiplies.",
  pow_base_exp_swapped_belief: "The FIRST argument enters the port (the base); the SECOND sets the dial (the exponent). They're not interchangeable — pow(2, 5) and pow(5, 2) are different engines entirely.",
  pow_zero_returns_zero_belief: "Zero stages means NO multiplication — and the product of zero multiplications is 1 (the multiplicative identity), not 0.",
  pow_zero_returns_base_belief: "Zero stages didn't pass the base through — the cascade was IDLE. No multiplication means the identity: 1.0.",
  pow_zero_error_belief: "No error — pow(x, 0) is a perfectly ordinary call. Zero stages, answer 1.0, every time.",
  pow_one_returns_one_belief: "pow(x, 1) returns x, not 1. One stage = one multiplication by itself = the base unchanged. (You may be thinking of pow(x, 0) = 1.)",
  pow_adds_one_belief: "The cascade doesn't add — it multiplies. One stage means one multiplication by the base, which leaves the base unchanged.",
  pow_returns_int_belief: "The value is right, but the TYPE is double — pow ALWAYS returns a double, even for integer inputs. Use a double container, or cast with (int).",
  int_holds_double_belief: "A double value won't fit silently into an int container — Java calls it a 'possible lossy conversion.' Double container or explicit cast.",
  pow_strips_sign_belief: "Negative bases are honest: (−2) × (−2) × (−2) = −8. Odd exponents preserve the sign; even exponents erase it.",
  pow_negative_base_error_belief: "No error — negative bases are perfectly legal. The final sign depends on whether the exponent is odd or even.",
  pow_fraction_error_belief: "Fractional exponents are welcome — pow(9, 0.5) is the square root. The dial points between 0 and 1; the cascade runs in reverse.",
  pow_sqrt_unfamiliar: "pow(x, 0.5) = √x — the square root. What number, times itself, gives 9? Three.",
  compound_shape_wrong: "The shape matters: principal × pow(rate, years), not pow(principal × rate, years). The cascade should raise the RATE, not the product.",
  simple_interest_belief: "principal × rate × years is linear growth. Compound growth is principal × rate^years — the cascade is exponential; multiplication is linear.",
  principal_missing: "The cascade gave you rate^years — but you forgot to scale by the principal. 1.05^3 is the growth FACTOR; principal × factor is the balance.",
  valueof_wrong_type: "Integer.valueOf takes an int or a String, not a double — the compile stamp says so. Cast with (int) instead.",
  instance_call_on_number_belief: "Seven levels, three instruments, one law — Math dot pow. Numbers carry no engines.",
  math_lowercase_belief: "Case is law — 'math' is nobody. Capital M, engraved on the base plate.",
  new_math_object_belief: "You cannot build a second engine — Java seals Math's constructor shut. No new Math(), ever.",
  bare_call_stores_result_belief: "The star faded on the plinth, uncaught. Assign it, print it, or embed it — the tower keeps no lost-and-found.",
  runtime_vs_compile_confusion: "Forbidden calls and type mismatches die at COMPILE time — before anything runs.",
};

const HINTS = {
  1: "Math.pow(3, 4) — four stages, each multiplying by 3: 3, 9, 27, 81.",
  2: "Math.pow(10, 3) — three stages of × 10.",
  3: "Math.pow(2, 10) — ten stages of × 2; exponentiation climbs fast.",
  4: "Zero stages fire — the identity 1.0 emerges untouched.",
  5: "One stage fires — the base passes through as itself, in double form.",
  6: "pow always returns a double — an int container can't hold it without a cast.",
  7: "Numbers carry no engines — Math.pow(3, 4), never 3.pow(4).",
  8: "Negative bases multiply honestly — (-2)×(-2)×(-2) = -8.",
  9: "A fractional exponent is a root — pow(9, 0.5) is the square root of 9.",
  10: "Math.pow(side, 2) — the side enters the port, 2 sets the dial.",
  11: "principal * Math.pow(rate, years) — the cascade raises the rate; principal scales it.",
  12: "(int) result — cast the double down to an int; the .0 is cut, not rounded.",
};

export class Level61Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level61Scene" });
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
    this.firstZeroAnnotationShown = false;
    this.firstOneAnnotationShown = false;
    this.firstBareCallAnnotationShown = false;
    this.firstFractionAnnotationShown = false;
    this._varContainers = [];
    this._plinthStar = null;
    this.inputLocked = true;
    this.gameEnded = false;
    this._alive = true;
  }

  preload() {}

  create() {
    this._alive = true;
    this.createParticleTexture();
    this.createBackground();
    this.createTowerInterior();
    this.createTowerFloor();
    this.createParticles();
    this.createCascadeEngine();
    this.createExponentDial();
    this.createResultPlinth();
    this.createEngineersSlate();
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
    this.updateBitGear(time);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // SETUP — BACKGROUND & TOWER INTERIOR
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l61_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l61_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x060810).setDepth(0);
  }

  createTowerInterior() {
    const g = this.add.graphics().setDepth(1);
    // dome arc band at the very top
    g.lineStyle(2, 0x2a3654, 0.5);
    g.beginPath(); g.arc(640, 900, 850, Math.PI * 1.28, Math.PI * 1.72, false); g.strokePath();
    g.fillStyle(0x03040a, 1);
    g.fillRect(580, 20, 120, 45);
    this._nightStars = [];
    for (let i = 0; i < 8; i++) {
      const s = this.add.circle(Phaser.Math.Between(586, 694), Phaser.Math.Between(24, 60), 1, 0xe8eaf6, Phaser.Math.FloatBetween(0.2, 0.5)).setDepth(2);
      this._nightStars.push({ obj: s, phase: Phaser.Math.Between(0, 3000) });
    }

    // tower walls
    [280, 630].forEach((wx) => {
      g.fillStyle(0x0d1220, 1);
      g.lineStyle(2, 0x2a3654, 0.5);
      g.fillRect(wx, 70, 12, 470);
      g.strokeRect(wx, 70, 12, 470);
      for (let i = 0; i < 3; i++) {
        const ry = 150 + i * 140;
        g.lineStyle(2, C_BRASS, 0.3);
        g.lineBetween(wx - 2, ry, wx + 14, ry);
      }
    });

    // chain pulleys
    [[300, 100], [610, 100]].forEach(([px, py]) => {
      g.lineStyle(1, C_BRASS, 0.4);
      g.strokeCircle(px, py, 8);
      g.beginPath();
      for (let i = 0; i <= 6; i++) {
        const a = (Math.PI / 3) * i;
        const cx = px + Math.cos(a) * 8, cy = py + 8 + Math.sin(a) * 4;
        if (i === 0) g.moveTo(cx, cy); else g.lineTo(cx, cy);
      }
      g.strokePath();
    });

    // engineer's workbench
    const bench = this.add.graphics().setDepth(2);
    bench.lineStyle(2, 0x8a6435, 0.5);
    bench.strokeRect(380, 565, 170, 50);
    bench.lineStyle(1, C_BRASS, 0.3);
    [[400, 585], [420, 590], [440, 583], [460, 588]].forEach(([gx, gy], i) => {
      bench.strokeCircle(gx, gy, 3 + (i % 2) * 2);
    });
    bench.lineStyle(1, 0x8a6435, 0.4);
    bench.strokeRect(500, 578, 14, 10);
    bench.strokeRect(516, 580, 14, 10);

    const bg = this.add.graphics().setDepth(2);
    bg.fillStyle(0x060810, 1);
    bg.lineStyle(1, C_BRASS, 0.5);
    bg.fillRoundedRect(40, 12, 320, 26, 3);
    bg.strokeRoundedRect(40, 12, 320, 26, 3);
    this.add.text(200, 25, "T H E   P O W E R   T O W E R", { font: "bold 14px Georgia", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.7).setDepth(3);
  }

  createTowerFloor() {
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
    const colors = [0x8ea6c8, 0xc8a05a, 0xe8eaf6];
    for (let i = 0; i < 7; i++) {
      this.ambient.push(this.add.circle(Phaser.Math.Between(0, W), Phaser.Math.Between(150, 630), 1, Phaser.Utils.Array.GetRandom(colors), Phaser.Math.FloatBetween(0.03, 0.05)).setDepth(2));
    }
  }

  updateParticles(time, delta) {
    if (!this.ambient) return;
    const step = 0.01 * (delta / 16.7);
    this.ambient.forEach((p, i) => {
      p.y -= step * (i % 2 === 0 ? 1 : 0.6);
      p.x += Math.sin(time * 0.0003 + i) * 0.02;
      if (p.y < 150) p.y = 630;
      if (p.x > W) p.x = 0; if (p.x < 0) p.x = W;
    });
    if (this._nightStars) this._nightStars.forEach((s) => {
      const t = (time + s.phase) % 3000;
      s.obj.setAlpha(0.2 + Math.abs(Math.sin((t / 3000) * Math.PI)) * 0.3);
    });
  }

  createAnnotation(x, y, text, colorHex) {
    const t = this.add.text(x, y, text, { font: "italic 11px Georgia", color: colorHex, wordWrap: { width: 300 }, align: "center" }).setOrigin(0.5).setDepth(70).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 200 });
    this.time.delayedCall(2400, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() }); });
    return t;
  }

  createFloatingText(x, y, text, colorHex, font = "bold 13px Arial", hold = 1400) {
    const t = this.add.text(x, y, text, { font, color: colorHex, wordWrap: { width: 320 }, align: "center" }).setOrigin(0.5).setDepth(31).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 180 });
    this.time.delayedCall(hold, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() }); });
    return t;
  }

  createConfetti(x, y, count = 30) {
    const p = this.add.particles(x, y, "l61_dot", {
      speed: { min: 80, max: 240 }, angle: { min: 0, max: 360 }, scale: { start: 0.9, end: 0 }, lifespan: 500,
      tint: [C_BRASS, C_GOLD, C_RED, C_CYAN, 0xffffff], emitting: false,
    }).setDepth(85);
    p.explode(count);
    this.time.delayedCall(900, () => p.destroy());
  }

  screenShake(intensity = 0.004, duration = 150) {
    this.cameras.main.shake(duration, intensity);
  }

  // ══════════════════════════════════════════════════════════════
  // THE CASCADE ENGINE (hero visual)
  // ══════════════════════════════════════════════════════════════

  createCascadeEngine() {
    const g = this.add.graphics().setDepth(4);
    g.fillStyle(0x1a1408, 1);
    g.lineStyle(2, C_BRASS, 1);
    g.fillRoundedRect(ENGINE_CX - 115, BASE_PLATE_Y, 230, 24, 6);
    g.strokeRoundedRect(ENGINE_CX - 115, BASE_PLATE_Y, 230, 24, 6);
    this.add.text(ENGINE_CX, BASE_PLATE_Y + 34, "MATH — EST. FOREVER", { font: "bold 7px Georgia", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.5).setDepth(5);

    const npBg = this.add.graphics().setDepth(5);
    npBg.fillStyle(0x060810, 1);
    npBg.lineStyle(2, C_GOLD, 1);
    npBg.fillRoundedRect(ENGINE_CX - 55, BASE_PLATE_Y - 34, 110, 28, 4);
    npBg.strokeRoundedRect(ENGINE_CX - 55, BASE_PLATE_Y - 34, 110, 28, 4);
    this.add.text(ENGINE_CX, BASE_PLATE_Y - 26, "Math", { font: "bold 16px Courier New", color: HEX_GOLD }).setOrigin(0.5).setDepth(6);
    this.methodPlateText = this.add.text(ENGINE_CX, BASE_PLATE_Y - 8, ".pow", { font: "bold 12px Courier New", color: HEX_CYAN }).setOrigin(0.5).setDepth(6);

    const port = this.add.graphics().setDepth(4);
    port.lineStyle(2, C_BRASS, 0.8);
    port.strokeRoundedRect(ENGINE_CX - 15, ENTRY_PORT_Y - 10, 30, 20, { tl: 15, tr: 15, bl: 0, br: 0 });
    this.add.text(ENGINE_CX, ENTRY_PORT_Y + 18, "base", { font: "italic 9px Georgia", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.6).setDepth(4);

    this.stageGfx = []; this.stageWindowGfx = []; this.stageInscriptions = []; this.stageProductLabels = [];
    for (let i = 0; i < STAGE_COUNT; i++) {
      const y = STAGE_Y0 - i * STAGE_DY;
      const sg = this.add.graphics().setDepth(4);
      sg.fillStyle(0x0d1220, 1);
      sg.lineStyle(2, C_BRASS, 1);
      sg.fillRoundedRect(ENGINE_CX - 70, y - 20, 140, 40, 12);
      sg.strokeRoundedRect(ENGINE_CX - 70, y - 20, 140, 40, 12);
      this.stageGfx.push(sg);

      const wg = this.add.graphics().setDepth(5);
      wg.lineStyle(2, C_BRASS, 0.8);
      wg.strokeCircle(ENGINE_CX, y, 14);
      this.stageWindowGfx.push(wg);

      const insc = this.add.text(ENGINE_CX, y, "", { font: "bold 11px Courier New", color: HEX_GOLD }).setOrigin(0.5).setDepth(6).setAlpha(0);
      this.stageInscriptions.push(insc);

      const label = this.add.text(ENGINE_CX + 82, y, "", { font: "bold 9px Courier New", color: HEX_BLUE_GRAY }).setOrigin(0, 0.5).setDepth(6).setAlpha(0);
      this.stageProductLabels.push(label);

      if (i < STAGE_COUNT - 1) {
        const pipe = this.add.graphics().setDepth(3);
        pipe.lineStyle(2, C_BRASS, 0.4);
        pipe.lineBetween(ENGINE_CX, y - 20, ENGINE_CX, y - STAGE_DY + 20);
        pipe.fillStyle(C_BRASS, 0.5);
        pipe.fillCircle(ENGINE_CX, y - STAGE_DY / 2, 2);
      }
    }

    const topStageTop = STAGE_Y0 - (STAGE_COUNT - 1) * STAGE_DY - 20;
    const cone = this.add.graphics().setDepth(4);
    cone.fillStyle(0x1a1408, 1);
    cone.lineStyle(2, C_GOLD, 1);
    cone.fillTriangle(ENGINE_CX - 20, topStageTop, ENGINE_CX + 20, topStageTop, ENGINE_CX, topStageTop - 30);
    cone.strokeTriangle(ENGINE_CX - 20, topStageTop, ENGINE_CX + 20, topStageTop, ENGINE_CX, topStageTop - 30);
    this.summitY = topStageTop - 30;

    this.bypassGfx = this.add.graphics().setDepth(3);
    this._drawBypassChannel();

    this.starLayer = this.add.container(0, 0).setDepth(9);
  }

  _drawBypassChannel() {
    this.bypassGfx.clear();
    this.bypassGfx.lineStyle(1.5, C_CYAN, 0.35);
    const x = ENGINE_CX - 100;
    const dash = 5, gap = 4;
    let y = ENTRY_PORT_Y;
    while (y > this.summitY) {
      const y2 = Math.max(this.summitY, y - dash);
      this.bypassGfx.lineBetween(x, y, x, y2);
      y -= dash + gap;
    }
    this.bypassGfx.lineBetween(ENGINE_CX - 15, ENTRY_PORT_Y, x, ENTRY_PORT_Y);
    this.bypassGfx.lineBetween(x, this.summitY, ENGINE_CX, this.summitY);
  }

  // ══════════════════════════════════════════════════════════════
  // THE EXPONENT DIAL
  // ══════════════════════════════════════════════════════════════

  _dialPoint(angleDeg, radius) {
    const rad = Phaser.Math.DegToRad(angleDeg);
    return { x: DIAL_X + Math.sin(rad) * radius, y: DIAL_Y - Math.cos(rad) * radius };
  }

  createExponentDial() {
    const g = this.add.graphics().setDepth(4);
    g.fillStyle(0x0d1220, 1);
    g.lineStyle(2, C_BRASS, 1);
    g.fillCircle(DIAL_X, DIAL_Y, DIAL_R);
    g.strokeCircle(DIAL_X, DIAL_Y, DIAL_R);
    for (let i = 0; i <= 6; i++) {
      const angleDeg = -150 + 300 * (i / 6);
      const p1 = this._dialPoint(angleDeg, DIAL_R - 4), p2 = this._dialPoint(angleDeg, DIAL_R + 2);
      g.lineStyle(1, C_BRASS, 0.6);
      g.lineBetween(p1.x, p1.y, p2.x, p2.y);
      const lp = this._dialPoint(angleDeg, DIAL_R + 13);
      this.add.text(lp.x, lp.y, String(i), { font: "8px Courier New", color: HEX_BLUE_GRAY }).setOrigin(0.5).setDepth(5);
    }
    this.dialNeedle = this.add.container(DIAL_X, DIAL_Y).setDepth(6);
    const ng = this.add.graphics();
    ng.fillStyle(C_GOLD, 1);
    ng.fillTriangle(-2, 0, 2, 0, 0, -(DIAL_R - 6));
    ng.fillStyle(C_BRASS, 1);
    ng.fillCircle(0, 0, 3);
    this.dialNeedle.add(ng);
    this.add.text(DIAL_X, DIAL_Y + DIAL_R + 22, "exp", { font: "bold 11px Courier New", color: HEX_CYAN }).setOrigin(0.5).setDepth(5);
  }

  async setDialToExponent(exp) {
    const clamped = Math.max(0, Math.min(6, Math.abs(exp)));
    const angle = -150 + 300 * (clamped / 6);
    await new Promise((res) => { this.tweens.add({ targets: this.dialNeedle, angle, duration: 260, ease: "Back.easeOut", onComplete: res }); });
    const click = this.add.circle(DIAL_X, DIAL_Y, 3, C_GOLD, 0.5).setDepth(7);
    this.tweens.add({ targets: click, scale: 3, alpha: 0, duration: 200, onComplete: () => click.destroy() });
  }

  resetDial() {
    this.dialNeedle.setAngle(-150);
  }

  // ══════════════════════════════════════════════════════════════
  // STARS & FORMATTING
  // ══════════════════════════════════════════════════════════════

  _fmtDoubleForPrint(v) {
    const rounded = Math.round(v * 1e9) / 1e9;
    if (Number.isInteger(rounded)) return rounded.toFixed(1);
    return String(rounded);
  }

  _fmtStarValue(value, type) {
    if (type === "double") return this._fmtDoubleForPrint(Number(value));
    return String(value);
  }

  _makeStar(value, type, x, y, scale = 1) {
    const c = this.add.container(x, y);
    const g = this.add.graphics();
    const color = type === "double" ? C_ORANGE : C_GOLD;
    g.fillStyle(color, 0.9);
    g.lineStyle(1, Phaser.Display.Color.IntegerToColor(color).darken(30).color, 1);
    const R = 16 * scale;
    const pts = [];
    for (let i = 0; i < 8; i++) { const r = i % 2 === 0 ? R : R * 0.45; const a = (Math.PI / 4) * i - Math.PI / 2; pts.push(Math.cos(a) * r, Math.sin(a) * r); }
    g.fillPoints(pts, true);
    g.strokePoints(pts, true);
    const display = this._fmtStarValue(value, type);
    const txt = this.add.text(0, 0, display, { font: "bold 11px Courier New", color: "#060810" }).setOrigin(0.5);
    if (txt.width > R * 1.7) txt.setFontSize(8);
    c.add([g, txt]);
    return { container: c, gfx: g, text: txt, value, type, scale };
  }

  _redrawStar(star, value, type, scale) {
    star.value = value; star.type = type; star.scale = scale;
    star.gfx.clear();
    const color = type === "double" ? C_ORANGE : C_GOLD;
    star.gfx.fillStyle(color, 0.9);
    star.gfx.lineStyle(1, Phaser.Display.Color.IntegerToColor(color).darken(30).color, 1);
    const R = 16 * scale;
    const pts = [];
    for (let i = 0; i < 8; i++) { const r = i % 2 === 0 ? R : R * 0.45; const a = (Math.PI / 4) * i - Math.PI / 2; pts.push(Math.cos(a) * r, Math.sin(a) * r); }
    star.gfx.fillPoints(pts, true);
    star.gfx.strokePoints(pts, true);
    const display = this._fmtStarValue(value, type);
    star.text.setFontSize(11).setText(display);
    if (star.text.width > R * 1.7) star.text.setFontSize(8);
  }

  _growthScale(base, product) {
    if (base === 0) return 1;
    const ratio = Math.abs(product / base);
    return Math.min(2, Math.pow(Math.max(ratio, 0.001), 0.15));
  }

  // ══════════════════════════════════════════════════════════════
  // THE CASCADE CHOREOGRAPHY
  // ══════════════════════════════════════════════════════════════

  async spawnBaseStar(value, type) {
    const star = this._makeStar(value, type, ENGINE_CX, ENTRY_PORT_Y + 30);
    star.container.setAlpha(0);
    this.starLayer.add(star.container);
    await new Promise((res) => { this.tweens.add({ targets: star.container, y: STAGE_Y0, alpha: 1, duration: 200, ease: "Sine.easeOut", onComplete: res }); });
    return star;
  }

  async igniteStage(index, base, product, star) {
    const y = STAGE_Y0 - index * STAGE_DY;
    const wg = this.stageWindowGfx[index];
    wg.clear();
    wg.fillStyle(C_GOLD, 0.3);
    wg.fillCircle(ENGINE_CX, y, 14);
    wg.lineStyle(2, C_GOLD, 1);
    wg.strokeCircle(ENGINE_CX, y, 14);

    const insc = this.stageInscriptions[index];
    insc.setText(`× ${base}`).setAlpha(0);
    this.tweens.add({ targets: insc, alpha: 1, duration: 110 });

    const label = this.stageProductLabels[index];
    label.setText(this._fmtDoubleForPrint(product)).setAlpha(0);
    this.tweens.add({ targets: label, alpha: 1, duration: 110 });

    const spark = this.add.particles(ENGINE_CX, y, "l61_dot", { speed: { min: 20, max: 50 }, angle: { min: 0, max: 360 }, scale: { start: 0.4, end: 0 }, lifespan: 200, tint: [C_GOLD], emitting: false }).setDepth(7);
    spark.explode(4);
    this.time.delayedCall(230, () => spark.destroy());

    const scale = this._growthScale(base, product);
    await new Promise((res) => { this.tweens.add({ targets: star.container, y, duration: 160, ease: "Sine.easeOut", onComplete: res }); });
    this._redrawStar(star, product, star.type, scale);
    await this.delay(90);
  }

  async emergeSummit(finalValue, star) {
    await new Promise((res) => { this.tweens.add({ targets: star.container, y: this.summitY, duration: 190, ease: "Sine.easeOut", onComplete: res }); });
    this._redrawStar(star, finalValue, "double", Math.min(2, star.scale || 1));
    const burst = this.add.particles(ENGINE_CX, this.summitY, "l61_dot", { speed: { min: 40, max: 100 }, angle: { min: 200, max: 340 }, scale: { start: 0.6, end: 0 }, lifespan: 300, tint: [C_GOLD, C_ORANGE], emitting: false }).setDepth(8);
    burst.explode(8);
    this.time.delayedCall(350, () => burst.destroy());
    await this.delay(140);
    if (!this._alive) return { value: finalValue, type: "double" };
    await new Promise((res) => { this.tweens.add({ targets: star.container, x: PLINTH_X, y: PLINTH_Y, duration: 240, ease: "Sine.easeIn", onComplete: res }); });
    this._plinthStar = star;
    this.chalkEvaluationArrow(finalValue);
    this.updateResultRow(finalValue);
    return { value: finalValue, type: "double" };
  }

  async bypassCascadeZero(base, type) {
    const star = await this.spawnBaseStar(base, type);
    await new Promise((res) => { this.tweens.add({ targets: star.container, x: ENGINE_CX - 100, duration: 140, ease: "Sine.easeInOut", onComplete: res }); });
    await new Promise((res) => { this.tweens.add({ targets: star.container, y: this.summitY, duration: 220, ease: "Sine.easeInOut", onComplete: res }); });
    await new Promise((res) => { this.tweens.add({ targets: star.container, x: ENGINE_CX, duration: 140, ease: "Sine.easeInOut", onComplete: res }); });
    this.tweens.add({ targets: star.container, scale: 0.7, duration: 100, yoyo: true });
    this._redrawStar(star, 1, "double", 1);
    if (!this.firstZeroAnnotationShown) {
      this.firstZeroAnnotationShown = true;
      this.createAnnotation(ENGINE_CX - 160, (ENTRY_PORT_Y + this.summitY) / 2, "zero stages — no multiplication at all. The product of nothing is 1.", HEX_BLUE_GRAY);
    }
    await this.delay(280);
    if (!this._alive) return { value: 1, type: "double" };
    await new Promise((res) => { this.tweens.add({ targets: star.container, x: PLINTH_X, y: PLINTH_Y, duration: 230, ease: "Sine.easeIn", onComplete: res }); });
    this._plinthStar = star;
    this.chalkEvaluationArrow(1);
    this.updateResultRow(1);
    return { value: 1, type: "double" };
  }

  async runFractionalCascade(base, exp, type) {
    const star = await this.spawnBaseStar(base, type);
    for (let i = STAGE_COUNT - 1; i >= 0; i--) {
      const wg = this.stageWindowGfx[i];
      const y = STAGE_Y0 - i * STAGE_DY;
      wg.clear();
      wg.fillStyle(C_CYAN, 0.25);
      wg.fillCircle(ENGINE_CX, y, 14);
      wg.lineStyle(2, C_CYAN, 0.8);
      wg.strokeCircle(ENGINE_CX, y, 14);
      await this.delay(35);
    }
    const result = Math.pow(base, exp);
    await new Promise((res) => { this.tweens.add({ targets: star.container, y: this.summitY, duration: 280, ease: "Sine.easeInOut", onComplete: res }); });
    const shrinkScale = Math.min(1, this._growthScale(base, result));
    this._redrawStar(star, result, "double", shrinkScale);
    if (!this.firstFractionAnnotationShown) {
      this.firstFractionAnnotationShown = true;
      this.createAnnotation(ENGINE_CX + 150, (STAGE_Y0 + this.summitY) / 2, "half a stage — the cascade in reverse. pow(x, 0.5) is the square root.", HEX_BLUE_GRAY);
    }
    await this.delay(280);
    if (!this._alive) return { value: result, type: "double" };
    this.stageWindowGfx.forEach((wg, i) => { wg.clear(); wg.lineStyle(2, C_BRASS, 0.8); wg.strokeCircle(ENGINE_CX, STAGE_Y0 - i * STAGE_DY, 14); });
    await new Promise((res) => { this.tweens.add({ targets: star.container, x: PLINTH_X, y: PLINTH_Y, duration: 230, ease: "Sine.easeIn", onComplete: res }); });
    this._plinthStar = star;
    this.chalkEvaluationArrow(result);
    this.updateResultRow(result);
    return { value: result, type: "double" };
  }

  /** The full §2.5 choreography for a genuine Math.pow(base, exp) call.
   * Integer exponents ≥ 0 run a REAL repeated-multiplication loop (the
   * product must emerge from base *= base each stage, never from a
   * single Math.pow shortcut). exp===0 bypasses; non-integer exp runs
   * the reverse-hum teaser. */
  async runCascade(base, exp, type) {
    await this.setDialToExponent(exp);
    if (!this._alive) return { value: Math.pow(base, exp), type: "double" };

    if (exp === 0) return await this.bypassCascadeZero(base, type);
    if (!Number.isInteger(exp)) return await this.runFractionalCascade(base, exp, type);

    const star = await this.spawnBaseStar(base, type);
    let product = base;
    const visualStages = Math.min(exp, STAGE_COUNT);
    for (let i = 0; i < visualStages; i++) {
      if (i > 0) product *= base;
      await this.igniteStage(i, base, product, star);
      if (!this._alive) return { value: product, type: "double" };
    }
    for (let i = visualStages; i < exp; i++) product *= base;

    if (exp === 1 && !this.firstOneAnnotationShown) {
      this.firstOneAnnotationShown = true;
      this.createAnnotation(ENGINE_CX + 150, STAGE_Y0, "one stage — the base passes through whole.", HEX_BLUE_GRAY);
    }
    return await this.emergeSummit(product, star);
  }

  resetCascade() {
    this.stageWindowGfx.forEach((wg, i) => { wg.clear(); wg.lineStyle(2, C_BRASS, 0.8); wg.strokeCircle(ENGINE_CX, STAGE_Y0 - i * STAGE_DY, 14); });
    this.stageInscriptions.forEach((t) => { t.setAlpha(0); t.setText(""); });
    this.stageProductLabels.forEach((t) => { t.setAlpha(0); t.setText(""); });
    this.starLayer.removeAll(true);
    if (this._plinthStar) { this._plinthStar.container.destroy(); this._plinthStar = null; }
    this.resetDial();
  }

  // ── delivery ──

  async deliverToVariable(name, value, type) {
    const idx = this._varContainers.length;
    const x = PLINTH_X - 60 + (idx % 2) * 120, y = PLINTH_Y + 50 + Math.floor(idx / 2) * 30;
    const color = type === "double" ? C_ORANGE : C_GOLD;
    const hexColor = type === "double" ? HEX_ORANGE : HEX_GOLD;
    const c = this.add.container(x, y).setDepth(12).setAlpha(0);
    const g = this.add.graphics();
    g.fillStyle(0x0a1520, 1);
    g.lineStyle(1.5, color, 0.8);
    g.fillRoundedRect(-46, -13, 92, 26, 5);
    g.strokeRoundedRect(-46, -13, 92, 26, 5);
    const nameT = this.add.text(0, -20, name, { font: "bold 9px Courier New", color: HEX_BRASS }).setOrigin(0.5);
    const display = type === "double" ? this._fmtDoubleForPrint(Number(value)) : String(value);
    const valT = this.add.text(0, 0, display, { font: "bold 12px Courier New", color: hexColor }).setOrigin(0.5);
    c.add([g, nameT, valT]);
    this.roundElements.push(c);
    this._varContainers.push(c);
    this.tweens.add({ targets: c, alpha: 1, duration: 200 });
    if (this._plinthStar) {
      const star = this._plinthStar;
      this._plinthStar = null;
      await new Promise((res) => { this.tweens.add({ targets: star.container, x, y, alpha: 0.2, duration: 260, ease: "Sine.easeIn", onComplete: () => { star.container.destroy(); res(); } }); });
    } else {
      await this.delay(200);
    }
  }

  async discardFade() {
    if (!this._plinthStar) return;
    const star = this._plinthStar;
    this._plinthStar = null;
    await this.delay(500);
    if (!this.firstBareCallAnnotationShown) {
      this.firstBareCallAnnotationShown = true;
      this.createAnnotation(PLINTH_X, PLINTH_Y - 40, "returned... to no one", HEX_BLUE_GRAY);
    }
    await new Promise((res) => { this.tweens.add({ targets: star.container, alpha: 0, scale: 0.6, duration: 350, onComplete: () => { star.container.destroy(); res(); } }); });
  }

  clearVarContainers() {
    this._varContainers.forEach((c) => { if (c.active) c.destroy(); });
    this._varContainers = [];
  }

  // ── rejections ──

  async entryPortShudder(value, type) {
    const star = await this.spawnBaseStar(value, type);
    await this.delay(100);
    this.tweens.add({ targets: star.container, x: star.container.x + 3, duration: 35, yoyo: true, repeat: 5 });
    const q = this.add.text(star.container.x, star.container.y - 24, "?", { font: "bold 18px Georgia", color: HEX_RED }).setOrigin(0.5).setDepth(20).setAlpha(0);
    this.roundElements.push(q);
    this.tweens.add({ targets: q, alpha: 1, duration: 90, yoyo: true, repeat: 3 });
    await this.delay(450);
    this.showCompileErrorStamp();
    await this.delay(550);
  }

  async ghostEngineCollapse() {
    const ghost = this.add.container(ENGINE_CX + 150, 300).setDepth(6).setAlpha(0);
    const g = this.add.graphics();
    g.lineStyle(2, C_BLUE_GRAY, 0.6);
    g.strokeRoundedRect(-40, -60, 80, 120, 6);
    ghost.add(g);
    this.roundElements.push(ghost);
    await new Promise((res) => { this.tweens.add({ targets: ghost, alpha: 0.6, duration: 180, onComplete: res }); });
    await this.delay(280);
    const p = this.add.particles(ghost.x, ghost.y, "l61_dot", { speed: { min: 30, max: 80 }, angle: { min: 0, max: 360 }, scale: { start: 0.5, end: 0 }, lifespan: 350, tint: [C_BLUE_GRAY], emitting: false }).setDepth(20);
    p.explode(12);
    this.time.delayedCall(400, () => p.destroy());
    ghost.destroy();
    this.showCompileErrorStamp();
    await this.delay(550);
  }

  async nameplateDarkFlicker() {
    for (let i = 0; i < 3; i++) {
      this.methodPlateText.setAlpha(0.15);
      await this.delay(85);
      this.methodPlateText.setAlpha(1);
      await this.delay(85);
    }
    this.showCompileErrorStamp();
    await this.delay(550);
  }

  showCompileErrorStamp() {
    const stamp = this.add.text(ENGINE_CX, 300, "COMPILE ERROR", { font: "bold 20px Arial", color: HEX_RED }).setOrigin(0.5).setDepth(30).setScale(1.5).setAngle(-6).setAlpha(0);
    this.roundElements.push(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 180 });
    this.screenShake(0.004, 150);
    this.time.delayedCall(1000, () => { if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 220, onComplete: () => stamp.destroy() }); });
  }

  // ══════════════════════════════════════════════════════════════
  // RESULT PLINTH
  // ══════════════════════════════════════════════════════════════

  createResultPlinth() {
    const chute = this.add.graphics().setDepth(6);
    chute.lineStyle(2, C_BRASS, 0.5);
    chute.lineBetween(ENGINE_CX, this.summitY, PLINTH_X, PLINTH_Y - 20);
    const plinthG = this.add.graphics().setDepth(6);
    plinthG.fillStyle(0x0a0d18, 1);
    plinthG.lineStyle(2, C_BRASS, 1);
    plinthG.fillCircle(PLINTH_X, PLINTH_Y, 24);
    plinthG.strokeCircle(PLINTH_X, PLINTH_Y, 24);
  }

  // ══════════════════════════════════════════════════════════════
  // ENGINEER'S SLATE
  // ══════════════════════════════════════════════════════════════

  createEngineersSlate() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0a0d18, 1);
    g.lineStyle(2, C_BRASS, 1);
    g.fillRoundedRect(SLATE_X, SLATE_Y, SLATE_W, SLATE_H, 8);
    g.strokeRoundedRect(SLATE_X, SLATE_Y, SLATE_W, SLATE_H, 8);
    g.lineStyle(1, 0x8a6435, 0.4);
    g.strokeRoundedRect(SLATE_X + 6, SLATE_Y + 6, SLATE_W - 12, SLATE_H - 12, 6);
    this.add.text(SLATE_X + 14, SLATE_Y + 16, "ENGINEER'S SLATE", { font: "bold 10px Georgia", color: HEX_BRASS }).setDepth(11);
    this.slateLines = this.add.container(0, 0).setDepth(11);
    this._slateY = SLATE_Y + 42;

    this.add.text(SLATE_X + 14, SLATE_Y + SLATE_H - 24, "result (double):", { font: "11px Georgia", color: "#8a6435" }).setDepth(11);
    this.resultText = this.add.text(SLATE_X + 130, SLATE_Y + SLATE_H - 24, "—", { font: "bold 14px Courier New", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(11);
  }

  async chalkWriteLine(text, color) {
    const t = this.add.text(SLATE_X + 14, this._slateY, "", { font: "bold 13px Courier New", color: color || "#e8eaf6" }).setDepth(11);
    this.slateLines.add(t);
    for (let i = 0; i < text.length; i++) {
      if (!this._alive) return;
      t.setText(t.text + text[i]);
      if (t.width > SLATE_W - 28) t.setFontSize(10);
      await this.delay(16);
    }
    this._slateY += 22;
    if (this._slateY > SLATE_Y + SLATE_H - 48) this._slateY = SLATE_Y + 42;
  }

  chalkExpandedForm(base, exp) {
    let text;
    if (exp === 0) text = "(no multiplication)";
    else if (!Number.isInteger(exp)) text = `√${base}`;
    else text = Array(exp).fill(base).join(" × ");
    const t = this.add.text(SLATE_X + 14, this._slateY, text, { font: "bold 12px Courier New", color: HEX_BLUE_GRAY }).setAlpha(0);
    this.slateLines.add(t);
    if (t.width > SLATE_W - 28) t.setFontSize(9);
    this.tweens.add({ targets: t, alpha: 1, duration: 150 });
    this._slateY += 22;
    if (this._slateY > SLATE_Y + SLATE_H - 48) this._slateY = SLATE_Y + 42;
  }

  chalkEvaluationArrow(value, type = "double") {
    const display = type === "double" ? this._fmtDoubleForPrint(Number(value)) : String(value);
    const t = this.add.text(SLATE_X + 14, this._slateY, `→ ${display}`, { font: "bold 13px Courier New", color: HEX_ORANGE }).setAlpha(0);
    this.slateLines.add(t);
    this.tweens.add({ targets: t, alpha: 1, duration: 140 });
    this._slateY += 22;
    if (this._slateY > SLATE_Y + SLATE_H - 48) this._slateY = SLATE_Y + 42;
  }

  wipeSlate() {
    this.slateLines.removeAll(true);
    this._slateY = SLATE_Y + 42;
  }

  updateResultRow(value) {
    if (value === null) { this.resultText.setFontSize(14).setText("—").setColor(HEX_GRAY); return; }
    const display = this._fmtDoubleForPrint(Number(value));
    this.resultText.setFontSize(14).setText(display).setColor(HEX_ORANGE);
  }

  // ══════════════════════════════════════════════════════════════
  // SOURCE DISPLAY & EXPRESSION MONITOR
  // ══════════════════════════════════════════════════════════════

  createSourceDisplay() {
    this.sourceContainer = this.add.container(0, 0).setDepth(15);
  }

  _syntaxTokenize(line) {
    const tokens = [];
    const re = /("(?:[^"\\]|\\.)*")|(\bint\b|\bdouble\b|\bnew\b|\bString\b)|(\bMath\b)|(\.pow\b)|(-?\d+\.\d+|-?\d+)|([(){};,=+\-*/])/g;
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
    const startY = 150 - ((lines.length - 1) * lineH) / 2;
    lines.forEach((line, i) => {
      const y = startY + i * lineH;
      const tokens = this._syntaxTokenize(line);
      const measured = tokens.map((tok) => { const tmp = this.add.text(0, 0, tok.t, { font: `bold ${fontSize}px Courier New` }); const w = tmp.width; tmp.destroy(); return w; });
      const totalW = measured.reduce((a, b) => a + b, 0);
      let x = 910 - totalW / 2;
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

    this.add.text(20, 14, "THE POWER TOWER", { font: "bold 14px Georgia", color: "#b0bec5" }).setDepth(50);
    this.add.text(20, 32, "Accretion Phase — Math Methods: pow()", { font: "10px Arial", color: "#546e7a" }).setDepth(50);

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
  // BIT — TOWER ENGINEER VARIANT
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
    const goggles = this.add.graphics();
    goggles.lineStyle(1.5, C_BRASS, 0.7);
    goggles.strokeCircle(-6, -14, 5);
    goggles.strokeCircle(6, -14, 5);
    goggles.lineBetween(-1, -14, 1, -14);
    goggles.fillStyle(C_CYAN, 0.15);
    goggles.fillCircle(-6, -14, 4.5);
    goggles.fillCircle(6, -14, 4.5);
    const gloveL = this.add.circle(-16, 10, 4, 0xe0d6b8, 0.85);
    this.bitGear = this.add.graphics();
    this._drawGear(this.bitGear, 17, 8, 0);
    c.add([g, cloak, eye, pupil, goggles, gloveL, this.bitGear, tip]);
    this.tweens.add({ targets: tip, alpha: 0.3, duration: 900, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: c, y: "+=3", duration: 2000, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
    this.bit = c;
  }

  _drawGear(g, cx, cy, angle) {
    g.clear();
    g.fillStyle(C_BRASS, 0.85);
    const teeth = 8, rOuter = 8, rInner = 5.5;
    const pts = [];
    for (let i = 0; i < teeth * 2; i++) {
      const r = i % 2 === 0 ? rOuter : rInner;
      const a = (Math.PI / teeth) * i + angle;
      pts.push(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    }
    g.fillPoints(pts, true);
    g.fillStyle(0x1a1408, 1);
    g.fillCircle(cx, cy, 2.5);
  }

  updateBitGear(time) {
    if (!this.bitGear) return;
    this._drawGear(this.bitGear, 17, 8, time * 0.0015);
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
    await this.bitSay("The Power Tower, Engineer — the last great instrument beneath this dome. The Comparator chose; the Rail measured; this engine AMPLIFIES. Feed it a base and tell it how many times to multiply — the cascade does the rest.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(6000)]); if (!A()) return;
    this.hideBubble();

    let vars = {};
    this.updateSourceDisplay(["double r = Math.pow(2, 3);"]);
    this.updateExpressionMonitor("double r = Math.pow(2, 3);");
    await this.runStatements(["double r = Math.pow(2, 3);"], vars); if (!A()) return;
    await this.bitSay("Two, multiplied by itself, three times: 2 × 2 × 2 = 8. That's all pow does — repeated multiplication. The dial set three stages; three stages fired. And notice the color: 8.0, not 8. pow() ALWAYS returns a double — even when both arguments are ints.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(6500)]); if (!A()) return;
    this.hideBubble();
    this.wipeSlate(); this.clearVarContainers(); this.resetCascade();

    vars = {};
    this.updateSourceDisplay(["double r = Math.pow(5, 0);"]);
    this.updateExpressionMonitor("double r = Math.pow(5, 0);");
    await this.runStatements(["double r = Math.pow(5, 0);"], vars); if (!A()) return;
    await this.bitSay("Zero stages — the cascade stands idle, and the product of ZERO multiplications is 1. Not 0, not the base — 1. The multiplicative identity: the number that changes nothing when you multiply by it.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(6000)]); if (!A()) return;
    this.hideBubble();
    this.wipeSlate(); this.clearVarContainers(); this.resetCascade();

    vars = {};
    this.updateSourceDisplay(["double r = Math.pow(10, 1);"]);
    this.updateExpressionMonitor("double r = Math.pow(10, 1);");
    await this.runStatements(["double r = Math.pow(10, 1);"], vars); if (!A()) return;
    await this.bitSay("One stage — the base passes through whole. pow(x, 1) is always x. One multiplication by itself changes nothing.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(5000)]); if (!A()) return;
    this.hideBubble();
    this.wipeSlate(); this.clearVarContainers(); this.resetCascade();

    vars = {};
    this.updateSourceDisplay(["int r = Math.pow(3, 2);"]);
    this.updateExpressionMonitor("int r = Math.pow(3, 2);");
    await this.runStatements(["int r = Math.pow(3, 2);"], vars); if (!A()) return;
    await this.bitSay("There it is — pow's permanent rule: the answer is ALWAYS a double. An int container can't hold 9.0 without a cast: (int) Math.pow(3, 2). Java won't risk the conversion silently.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(6500)]); if (!A()) return;
    this.hideBubble();
    this.clearRound();
    this.wipeSlate(); this.clearVarContainers(); this.resetCascade();

    vars = {};
    this.updateSourceDisplay(["double r = 4.pow(3);"]);
    this.updateExpressionMonitor("double r = 4.pow(3);");
    await this.runStatements(["double r = 4.pow(3);"], vars); if (!A()) return;
    await this.bitSay("The wing's oldest law, one last instrument — numbers carry no engines. The cascade belongs to the Math class: Math.pow(4, 3). The address hasn't changed; the instrument has.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(6000)]); if (!A()) return;
    this.hideBubble();

    try { localStorage.setItem(TUTORIAL_KEY, "true"); } catch (_) {}
    this.wipeSlate(); this.clearVarContainers(); this.resetCascade();
    this.updateSourceDisplay([]);
    this.updateExpressionMonitor("");
    this.updateResultRow(null);
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
    this.resetCascade();
    this.wipeSlate();
    this.updateResultRow(null);

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
    const c = this.add.container(940, 480).setDepth(40).setAlpha(0);
    const g = this.add.graphics();
    g.fillStyle(0x0a0d18, 0.95);
    g.fillRoundedRect(-250, -36, 500, 72, 10);
    g.lineStyle(1, C_BRASS, 0.5);
    g.strokeRoundedRect(-250, -36, 500, 72, 10);
    const badge = this.add.circle(-220, 0, 15, C_BRASS);
    const badgeT = this.add.text(-220, 0, String(this.currentRound + 1), { font: "bold 13px Arial", color: "#060810" }).setOrigin(0.5);
    const t = this.add.text(-195, 0, promptText, { font: "14px Arial", color: "#e8eaf6", wordWrap: { width: 420 } }).setOrigin(0, 0.5);
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
    await this.runStatements(config.source, vars);
    if (!this._alive) return;
    if (config.revealNote) this.createFloatingText(ENGINE_CX, 60, config.revealNote, HEX_GRAY, "11px Arial", 2800);
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
  // TYPE D — ENGINEER COMMAND
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
    const startY = 150 - ((lines.length - 1) * lineH) / 2;
    lines.forEach((rawLine, i) => {
      const y = startY + i * lineH;
      const parts = rawLine.split(/<slot:(\w+)>/);
      const measured = [];
      let totalW = 0;
      parts.forEach((part, pi) => {
        if (pi % 2 === 0) {
          const tmp = this.add.text(0, 0, part, { font: `bold ${fontSize}px Courier New` });
          measured.push(tmp.width); totalW += tmp.width; tmp.destroy();
        } else { measured.push(160); totalW += 166; }
      });
      let x = 910 - totalW / 2;
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
          const w = 160, h = fontSize + 8;
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
    const rowY = 660;
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
      c.setData("home", home);
      c.setData("draw", draw);
      c.setData("placedIn", null);
      c.setInteractive({ useHandCursor: true, draggable: true });
      c.on("pointerover", () => { if (!this.inputLocked) draw(C_GOLD); });
      c.on("pointerout", () => { if (!this.inputLocked) draw(C_BRASS); });
      this.cartridges.push({ container: c, def, home });
      this.roundElements.push(c);
    });

    const btn = this.add.container(940, 620).setDepth(42);
    const bg = this.add.graphics();
    const bdraw = (enabled, hover) => {
      bg.clear();
      bg.fillStyle(enabled ? C_BRASS : 0x2a2f36, hover && enabled ? 1 : 0.95);
      bg.fillRoundedRect(-65, -22, 130, 44, 22);
    };
    bdraw(false, false);
    const bt = this.add.text(0, 0, "ENGAGE", { font: "bold 14px Arial", color: "#060810" }).setOrigin(0.5);
    btn.add([bg, bt]);
    btn.setSize(130, 44);
    btn.on("pointerover", () => { if (this._engageReady) { bdraw(true, true); btn.setScale(1.03); } });
    btn.on("pointerout", () => { bdraw(this._engageReady, false); btn.setScale(1); });
    btn.on("pointerdown", () => { if (this._engageReady) this.onEngagePressed(config); });
    this.engageButton = { c: btn, draw: bdraw };
    this.roundElements.push(btn);
    this.disableEngageButton();
  }

  enableEngageButton() { this._engageReady = true; this.engageButton.draw(true, false); this.engageButton.c.setInteractive({ useHandCursor: true }); }
  disableEngageButton() { this._engageReady = false; this.engageButton.draw(false, false); this.engageButton.c.disableInteractive(); }

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
        this.updateEngageButtonState();
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
      this.updateEngageButtonState();
    } else {
      const home = obj.getData("home");
      this.tweens.add({ targets: obj, x: home.x, y: home.y, duration: 250, ease: "Back.easeOut" });
    }
  }

  updateEngageButtonState() {
    const allFilled = Object.keys(this.slotDefs).every((id) => (this.slotContents[id] || []).length > 0);
    if (allFilled) this.enableEngageButton(); else this.disableEngageButton();
  }

  _substituteSkeleton(config, test) {
    return config.skeleton.map((line) => {
      const m = line.match(/^(int|double)\s+(\w+)\s*=\s*\/\* test value \*\/;$/);
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

  async onEngagePressed(config) {
    this.inputLocked = true;
    this.disableEngageButton();
    this.roundAttempts++;
    const timeMs0 = this.time.now;

    const slotId = Object.keys(this.slotDefs)[0];
    const code = this.slotContents[slotId][0].container.getData("code");
    const tag = this.slotContents[slotId][0].container.getData("tag");

    const tests = config.tests;
    let allPass = true;
    for (let ti = 0; ti < tests.length; ti++) {
      if (!this._alive) return;
      const test = tests[ti];
      this.clearVarContainers();
      this.resetCascade();
      this.wipeSlate();
      this.updateResultRow(null);
      this._printedLines = [];
      const statements = this._substituteSkeleton(config, test);
      if (tests.length > 1) this.createFloatingText(ENGINE_CX, 60, `TEST ${ti + 1}`, HEX_BRASS, "bold 12px Courier New", 1200);

      const vars = {};
      const runResult = await this.runStatements(statements, vars);
      if (!this._alive) return;

      let pass = runResult.ok;
      if (pass && test.expectedOutput !== undefined) {
        const output = this._printedLines.join("⏎");
        pass = output === test.expectedOutput;
      }
      this.createFloatingText(PLINTH_X, PLINTH_Y - 60, pass ? "✓" : "✗", pass ? HEX_GREEN_BRIGHT : HEX_RED, "bold 22px Arial", 900);
      if (!pass) { allPass = false; break; }
      await this.delay(350);
    }

    const timeMs = Math.round(this.time.now - timeMs0);
    this.logAttempt(config, allPass, code, allPass ? null : tag, timeMs);

    if (allPass) {
      this.updateScore(this.scoreForAttempt(timeMs));
      this.updateCombo(true);
      if (this.roundAttempts === 1) this.correctFirstTry++;
      this.totalTime += timeMs;
      const scenicOnly = (config.cartridges || []).filter((c) => c.alsoCorrect && !c.correct);
      let showNote = true;
      if (scenicOnly.length > 0) {
        showNote = scenicOnly.some((c) => c.code === code);
      }
      if (config.postMissionNote && showNote) await this.showBitFeedback(config.postMissionNote);
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
      await this.showBitFeedback(MISCONCEPTION_FEEDBACK[tag] || config.revealNote || "The engine ran exactly what you assembled — compare the slate against the mission and adjust.");
      if (!this._alive) return;
      this.inputLocked = false;
      this.clearVarContainers();
      this.resetCascade();
      this.wipeSlate();
      this.updateResultRow(null);
      this.slotContents = {};
      this.renderCommandSkeleton(config);
      this.cartridges.forEach((cart) => {
        cart.container.setData("placedIn", null);
        const home = cart.container.getData("home");
        this.tweens.add({ targets: cart.container, x: home.x, y: home.y, duration: 200 });
      });
      this.disableEngageButton();
    }
  }

  // ══════════════════════════════════════════════════════════════
  // HONEST EVALUATOR — Math.pow (int+double args, real repeated
  // multiplication, always-double return), zero/one/fractional
  // exponents, negative bases, multiplication/cast composition,
  // println. Never scripted; genuine outcomes only.
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

  _splitTopMul(expr) {
    const parts = [];
    let cur = "", depth = 0;
    for (let i = 0; i < expr.length; i++) {
      const ch = expr[i];
      if (ch === "(") depth++;
      if (ch === ")") depth--;
      if (ch === "*" && depth === 0) { parts.push(cur.trim()); cur = ""; continue; }
      cur += ch;
    }
    if (cur.trim()) parts.push(cur.trim());
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
    return { ok: false, crash: "eval" };
  }

  async evalPowCall(argsStr, vars) {
    const args = this._splitTopArgs(argsStr);
    if (args.length !== 2) return { ok: false, crash: "wrong_arity" };
    const baseRes = await this.resolveTopLevelValue(args[0], vars);
    if (!baseRes.ok) return baseRes;
    const expRes = await this.resolveTopLevelValue(args[1], vars);
    if (!expRes.ok) return expRes;
    if (this._plinthStar) {
      const s = this._plinthStar;
      this._plinthStar = null;
      this.tweens.add({ targets: s.container, alpha: 0, duration: 150, onComplete: () => s.container.destroy() });
    }
    const result = await this.runCascade(baseRes.value, expRes.value, baseRes.type);
    return { ok: true, value: result.value, type: result.type };
  }

  /** Top-level value resolution: Math.pow(...), (int) casts, top-level
   * multiplication (each factor independently resolved — a factor that
   * is itself a Math.pow(...) runs the real cascade), or a plain value. */
  async resolveTopLevelValue(expr, vars) {
    const t = expr.trim();
    const powMatch = t.match(/^Math\.pow\((.*)\)$/);
    if (powMatch) return await this.evalPowCall(powMatch[1], vars);

    const castMatch = t.match(/^\(int\)\s*(.+)$/);
    if (castMatch) {
      const r = await this.resolveTopLevelValue(castMatch[1].trim(), vars);
      if (!r.ok) return r;
      return { ok: true, value: Math.trunc(Number(r.value)), type: "int" };
    }

    const mulParts = this._splitTopMul(t);
    if (mulParts.length > 1) {
      let total = 1, sawDouble = false;
      for (const p of mulParts) {
        const r = await this.resolveTopLevelValue(p, vars);
        if (!r.ok) return r;
        if (r.type === "double") sawDouble = true;
        total *= r.value;
        if (this._plinthStar) {
          const s = this._plinthStar;
          this._plinthStar = null;
          this.tweens.add({ targets: s.container, alpha: 0, duration: 150, onComplete: () => s.container.destroy() });
        }
      }
      const finalType = sawDouble ? "double" : "int";
      const star = this._makeStar(total, finalType, PLINTH_X, PLINTH_Y);
      this.starLayer.add(star.container);
      this._plinthStar = star;
      this.chalkEvaluationArrow(total);
      this.updateResultRow(total);
      return { ok: true, value: finalType === "double" ? total : Math.round(total), type: finalType };
    }

    return this._evalSimpleValue(t, vars);
  }

  async intAssignmentRejection(value) {
    if (this._plinthStar) {
      const s = this._plinthStar;
      this._plinthStar = null;
      this.tweens.add({ targets: s.container, x: s.container.x + 3, duration: 30, yoyo: true, repeat: 5 });
      await this.delay(250);
      this.tweens.add({ targets: s.container, alpha: 0, duration: 200, onComplete: () => s.container.destroy() });
    }
    this.showCompileErrorStamp();
    await this.delay(500);
  }

  async execStatement(line, vars) {
    const instanceMatch = line.match(/(\w+)\.pow\(/);
    if (instanceMatch && instanceMatch[1] !== "Math") {
      const token = instanceMatch[1];
      if (token === "math") { await this.nameplateDarkFlicker(); return { ok: false, crash: "compile" }; }
      let val = 0, typ = "int";
      if (vars[token] !== undefined) { val = vars[token].value; typ = vars[token].type; }
      else if (/^\d+$/.test(token)) { val = parseInt(token, 10); typ = "int"; }
      await this.entryPortShudder(val, typ);
      return { ok: false, crash: "compile" };
    }
    if (/new Math\(\)/.test(line)) { await this.ghostEngineCollapse(); return { ok: false, crash: "compile" }; }
    if (/Integer\.valueOf\(/.test(line)) { this.showCompileErrorStamp(); await this.delay(500); return { ok: false, crash: "compile" }; }

    const declVar = line.match(/^(int|double)\s+(\w+)\s*=\s*(.*);$/);
    if (declVar) {
      const varType = declVar[1], name = declVar[2], rhs = declVar[3].trim();
      const r = await this.resolveTopLevelValue(rhs, vars);
      if (!r.ok) return r;
      if (varType === "int" && r.type === "double") {
        await this.intAssignmentRejection(r.value);
        return { ok: false, crash: "compile" };
      }
      vars[name] = { value: r.value, type: varType === "double" ? "double" : r.type };
      this.chalkEvaluationArrow(vars[name].value, vars[name].type);
      await this.deliverToVariable(name, vars[name].value, vars[name].type);
      return { ok: true };
    }

    const reassign = line.match(/^(\w+)\s*=\s*(.*);$/);
    if (reassign) {
      const name = reassign[1], rhs = reassign[2].trim();
      const r = await this.resolveTopLevelValue(rhs, vars);
      if (!r.ok) return r;
      vars[name] = { value: r.value, type: vars[name] ? vars[name].type : r.type };
      this.chalkEvaluationArrow(vars[name].value, vars[name].type);
      await this.deliverToVariable(name, vars[name].value, vars[name].type);
      return { ok: true };
    }

    const bareMath = line.match(/^(Math\.pow\(.*\));$/);
    if (bareMath) {
      const r = await this.resolveTopLevelValue(bareMath[1], vars);
      if (!r.ok) return r;
      await this.discardFade();
      return { ok: true };
    }

    const printMatch = line.match(/^System\.out\.println\((.*)\);$/);
    if (printMatch) {
      this.updateExpressionMonitor("System.out.println(…)");
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

  async runStatements(lines, vars) {
    for (const raw of lines) {
      if (!this._alive) return { ok: true };
      const line = raw.trim();
      if (!line) continue;
      await this.chalkWriteLine(line, "#8ea6c8");
      const powMatch = line.match(/Math\.pow\(([^()]*)\)/);
      if (powMatch) {
        const args = this._splitTopArgs(powMatch[1]);
        const bV = this._evalSimpleValue(args[0], vars), eV = this._evalSimpleValue(args[1], vars);
        if (bV.ok && eV.ok) this.chalkExpandedForm(bV.value, eV.value);
      }
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
      this.clearVarContainers();
      this.resetCascade();
      this.wipeSlate();
      const motes = this.ambient;
      this.ambient = null;
      (motes || []).forEach((m) => this.tweens.add({ targets: m, y: 632, alpha: 0, duration: 1500, ease: "Sine.easeIn" }));

      const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
      this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });
      const title = this.add.text(640, 240, "THE TOWER STANDS SILENT", { font: "bold 32px Georgia", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
      this.tweens.add({ targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut", onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }) });
      this.add.text(640, 310, `Score: ${this.score}`, { font: "20px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
      this.add.text(640, 350, `Rounds Completed: ${this.currentRound} / 12`, { font: "16px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);
      this._makeButton(640, 420, "RE-ENTER THE TOWER", 260, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
    })();
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearRound();
    this.hideBubble();

    try { GameManager.completeLevel(60, Math.round((this.correctFirstTry / 12) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("math_pow_schema"); } catch (_) {}
    try {
      localStorage.setItem("level61_results", JSON.stringify({
        level: 61, concept: "math_pow", phase: "accretion",
        score: this.score, accuracy: this.correctFirstTry / 12, avgTime: this.totalTime / 12,
        comboMax: this.maxCombo, stars: this._starRating(), livesRemaining: this.lives,
        attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.towerFinale().then(() => { if (this._alive) this.showScoreTally(); });
  }

  async towerFinale() {
    this.clearVarContainers();
    this.resetCascade();
    this.wipeSlate();
    await this.setDialToExponent(6);
    const star = await this.spawnBaseStar(2, "int");
    let product = 2;
    for (let i = 0; i < STAGE_COUNT; i++) {
      if (i > 0) product *= 2;
      await this.igniteStage(i, 2, product, star);
      if (!this._alive) return;
    }
    await this.emergeSummit(product, star);
    this.createConfetti(PLINTH_X, PLINTH_Y, 40);
    await this.delay(1000);
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

    const title = this.add.text(640, 190, "THE TOWER ASCENDED", { font: "bold 32px Georgia", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(91).setScale(0);
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
    for (let i = 0; i < 3; i++) {
      bg.fillRect(-10 + i * 8, 4 - i * 5, 5, 6 + i * 5);
    }
    badge.add(bg);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 1950 });
    const badgeLbl = this.add.text(640, 505, "pow() SCHEMA ACQUIRED", { font: "bold 13px Georgia", color: HEX_GOLD }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: badgeLbl, alpha: 1, duration: 300, delay: 2100 });

    this._makeButton(500, 545, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(760, 545, "NEXT: pow() Tuning awaits →", 280, 44, { fill: 0x00733a, stroke: C_GREEN_BRIGHT, textColor: "#ffffff" }, () => {
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
