/**
 * Level 74 — "The Decimal Crucible" (Type Conversion Wing: Accretion
 * Phase — Double.parseDouble())
 * ===========================================================================
 * The Integer Furnace's precision sibling. A shared hopper and validation
 * gate feed a DIFFERENT chamber: a graduated glass vessel where the
 * validated strip DISSOLVES (not burns) into amber liquid that rises to a
 * precise level — the double value. Where L71's furnace produced discrete
 * solid bars, this crucible produces continuous liquid: the physical
 * metaphor for int vs double. The gate's ruleset extends L71's (digits,
 * optional leading sign) with ONE new character: the decimal point,
 * spotlit AMBER — neither the green of a digit nor the red of rejection.
 *
 * SPEC-DESIGN NOTE on operator precedence (caught during design, before
 * any code was written, via hand-tracing Round 11's Fahrenheit formula):
 * L72/L73's evaluators split "+/-" and "*, /" via a single find-ONE-
 * operator-and-recurse approach, which was safe there because neither
 * level ever chained more than one operator at the same precedence tier
 * ( "32 * 5 / 9" never occurred). L74's Round 11 needs exactly that
 * chain, and a find-the-FIRST-operator split breaks left-to-right
 * associativity: splitting "32 * 5 / 9" at the first "*" recurses into
 * "32 * (5 / 9)" = 32 * 0 = 0 (int truncation on the inner term) instead
 * of the correct (32 * 5) / 9 = 17. Fixed by switching both the additive
 * (+/-) and multiplicative (*, /) splitters to an ITERATIVE left-to-right
 * accumulator (split on EVERY top-level occurrence into a flat list of
 * {op, text} segments, then fold left to right), which is correct
 * regardless of chain length. Also added an explicit outer-parentheses
 * stripper (_stripOuterParens) — Round 11's correct answer,
 * "(tempF - 32) * 5 / 9", requires the parenthesized subexpression to
 * be recursively resolved as a bare "tempF - 32" once isolated by the
 * multiplicative split, which never came up in any prior level's
 * cartridges.
 */

import Phaser from "phaser";
import { GameManager } from "../../../../GameManager.js";
import { addTutorialReplayButton } from "../../../../TutorialReplayButton.js";
import { WellbeingAPI } from "../../../../../api/api.js";
import { BadgeSystem } from "../../../../BadgeSystem.js";

const W = 1280, H = 720;

const C_CYAN = 0x4fc3f7, C_GOLD = 0xffd740, C_ORANGE = 0xff9800, C_BLUE_GRAY = 0x8ea6c8;
const C_GREEN_BRIGHT = 0x00e676, C_RED = 0xf44336, C_GRAY = 0x78909c, C_COPPER = 0xb87333;
const HEX_CYAN = "#4fc3f7", HEX_GOLD = "#ffd740", HEX_ORANGE = "#ff9800", HEX_BLUE_GRAY = "#8ea6c8";
const HEX_GREEN_BRIGHT = "#00e676", HEX_RED = "#f44336", HEX_GRAY = "#78909c", HEX_COPPER = "#b87333";
const C_INDIGO = 0x3949ab, HEX_INDIGO = "#3949ab";
const C_AMBER = 0xff9800, HEX_AMBER = "#ff9800";

// Crucible geometry (shared hopper/gate footprint with L71, new chamber)
const HOPPER_X0 = 430, HOPPER_X1 = 610, HOPPER_Y0 = 180, HOPPER_Y1 = 230;
const GATE_X0 = 460, GATE_X1 = 580, GATE_Y0 = 240, GATE_Y1 = 300;
const VESSEL_X0 = 420, VESSEL_X1 = 620, VESSEL_Y0 = 310, VESSEL_Y1 = 430;
const CRUCIBLE_CX = (HOPPER_X0 + HOPPER_X1) / 2;
const CONT_X = 640, CONT_Y = 440;
// Integer Furnace silhouette (parseInt contrast, left wall)
const FSIL_X0 = 60, FSIL_X1 = 130, FSIL_Y0 = 160, FSIL_Y1 = 280;
// Slate
const SLATE_X = 800, SLATE_Y = 130, SLATE_W = 420, SLATE_H = 300;

const TUTORIAL_KEY = "level74_tutorial_done";

// ══════════════════════════════════════════════════════════════
// ROUND CONFIGURATION
// ══════════════════════════════════════════════════════════════
const ROUNDS = [
  // ── Type A: Dissolution Prediction ──
  { round: 1, type: "predict",
    source: 'double x = Double.parseDouble("9.81");',
    question: "What is stored in x?", correct: "9.81",
    options: [
      { value: "9.81", tag: null },
      { value: "9", tag: "parseDouble_truncates_belief" },
      { value: '"9.81"', tag: "parseDouble_returns_string_belief", label: '"9.81" (String)' },
      { value: "error", tag: "nfe_on_valid_double", label: "NumberFormatException" },
    ],
    concept: "basic_parseDouble" },

  { round: 2, type: "predict",
    source: 'double x = Double.parseDouble("100");',
    question: "What is stored in x?", correct: "100.0",
    options: [
      { value: "100.0", tag: null },
      { value: "100", tag: "parseDouble_returns_int_belief" },
      { value: "error", tag: "integer_string_crashes_parseDouble_belief", label: "NFE — needs a dot" },
      { value: '"100"', tag: "parseDouble_returns_string_belief", label: '"100" (String)' },
    ],
    revealNote: "No dot required: '100' dissolves into 100.0. The .0 is automatic — parseDouble ALWAYS returns a double, even from integer text. The crucible is more permissive than the furnace.",
    concept: "integer_to_double" },

  { round: 3, type: "predict",
    source: 'double x = Double.parseDouble("-0.5");',
    question: "What is stored in x?", correct: "-0.5",
    options: [
      { value: "-0.5", tag: null },
      { value: "0.5", tag: "parseDouble_strips_sign_belief" },
      { value: "error", tag: "negative_dot_crashes_belief", label: "NumberFormatException" },
      { value: "-1", tag: "parseDouble_rounds_belief" },
    ],
    concept: "negative_decimal" },

  // ── Type B: NFE & parseInt Discrimination ──
  { round: 4, type: "predict",
    source: 'double x = Double.parseDouble("hello");',
    question: "What happens?", correct: "nfe",
    options: [
      { value: "nfe", tag: null, label: "NumberFormatException" },
      { value: "0.0", tag: "nfe_returns_zero_belief" },
      { value: "compile_error", tag: "nfe_is_compile_error_belief", label: "COMPILE ERROR" },
      { value: "NaN", tag: "nfe_returns_nan_belief" },
    ],
    concept: "nfe_parseDouble" },

  { round: 5, type: "predict",
    source: 'int x = Integer.parseInt("7.5");',
    question: "What happens?", correct: "nfe",
    options: [
      { value: "nfe", tag: null, label: "NumberFormatException — parseInt rejects dots" },
      { value: "7", tag: "parseInt_truncates_decimal_belief", label: "x = 7 (truncated)" },
      { value: "7.5", tag: "parseInt_accepts_dot_belief", label: "x = 7.5" },
      { value: "8", tag: "parseInt_rounds_belief", label: "x = 8 (rounded)" },
    ],
    contrastFurnace: true,
    revealNote: "THE DISCRIMINATION — parseInt rejects dots. Period. '7.5' crashes in the furnace but would succeed in the crucible. If the text might contain a dot, use parseDouble. If it MUST be a whole number, use parseInt — it's stricter by design.",
    concept: "parseInt_vs_parseDouble_discrimination" },

  { round: 6, type: "predict",
    source: 'double x = Double.parseDouble(".75");',
    question: "What is stored in x?", correct: "0.75",
    options: [
      { value: "0.75", tag: null },
      { value: "error", tag: "leading_dot_crashes_belief", label: "NumberFormatException" },
      { value: ".75", tag: "parseDouble_returns_string_belief", label: ".75 (no leading zero)" },
      { value: "75.0", tag: "dot_ignored_belief" },
    ],
    revealNote: "Leading dot is legal: '.75' dissolves to 0.75. The zero before the decimal point is implied. The crucible reads .75 as 'zero point seven five' — a valid double.",
    concept: "leading_dot" },

  { round: 7, type: "predict",
    source: 'double x = double.parseDouble("5.0");',
    question: "What happens?", correct: "compile_error",
    options: [
      { value: "compile_error", tag: null, label: "COMPILE ERROR — double has no methods" },
      { value: "5.0", tag: "double_vs_Double_belief", label: "x = 5.0" },
      { value: "error", tag: "runtime_vs_compile_confusion", label: "NumberFormatException" },
      { value: "5", tag: "parseDouble_returns_int_belief" },
    ],
    revealNote: "double is a PRIMITIVE keyword — no methods. Double (capital D) is the wrapper class. Same pattern as int/Integer: the primitive stores; the wrapper converts.",
    concept: "wrapper_vs_primitive_double" },

  // ── Type C: Expressions with parseDouble ──
  { round: 8, type: "predict",
    source: 'String s = "2.5";\ndouble x = Double.parseDouble(s) * 4;\nSystem.out.println(x);',
    question: "What prints?", correct: "10.0",
    options: [
      { value: "10.0", tag: null },
      { value: "10", tag: "double_prints_without_dot_belief" },
      { value: '"2.52.52.52.5"', tag: "string_concat_vs_addition", label: '"2.52.52.52.5"' },
      { value: "error", tag: "multiplication_crashes_belief", label: "NumberFormatException" },
    ],
    revealNote: "parseDouble('2.5') → 2.5; 2.5 × 4 = 10.0. The result is a double — 10.0, not 10. Double arithmetic always yields double results, even when the math comes out whole.",
    concept: "parseDouble_arithmetic" },

  { round: 9, type: "predict",
    source: 'String a = "1.5";\nString b = "2.5";\nSystem.out.println(a + b);\nSystem.out.println(Double.parseDouble(a) + Double.parseDouble(b));',
    question: "What prints (two lines)?", correct: "1.52.5\n4.0",
    options: [
      { value: "1.52.5\n4.0", tag: null, label: "1.52.5\nthen  4.0" },
      { value: "4.0\n4.0", tag: "string_is_number_belief", label: "4.0\nthen  4.0" },
      { value: "1.52.5\n1.52.5", tag: "parseDouble_returns_string_belief", label: "1.52.5\nthen  1.52.5" },
      { value: "error", tag: "concat_dots_crash_belief", label: "NumberFormatException" },
    ],
    revealNote: "Same lesson, decimal edition: '1.5' + '2.5' = '1.52.5' (String concat). parseDouble('1.5') + parseDouble('2.5') = 1.5 + 2.5 = 4.0 (double addition). The crucible changes + from glue to arithmetic, just like the furnace did.",
    concept: "concat_vs_addition_double" },

  // ── Type D: Assayer Command ──
  { round: 10, type: "command",
    source: 'String input = "19.99";\ndouble price = <slot:convert>;\nSystem.out.println("Price: " + price);',
    mission: "Convert the price String to a double. Expected: Price: 19.99",
    slots: [{ id: "convert", hint: "dissolve the text" }],
    cartridges: [
      { code: "Double.parseDouble(input)", correct: true },
      { code: "Integer.parseInt(input)", tag: "parseInt_accepts_dot_belief" },
      { code: "double.parseDouble(input)", tag: "double_vs_Double_belief" },
      { code: "input", tag: "string_is_number_belief" },
    ],
    tests: [{ expectedOutput: "Price: 19.99" }],
    concept: "command_basic_parseDouble" },

  { round: 11, type: "command",
    source: 'String tempStr = "98.6";\ndouble tempF = Double.parseDouble(tempStr);\ndouble tempC = <slot:formula>;\nSystem.out.printf("Celsius: %.1f%n", tempC);',
    mission: "Convert Fahrenheit to Celsius using: (F - 32) × 5/9.\nFor 98.6°F: Celsius: 37.0",
    slots: [{ id: "formula", hint: "the conversion formula" }],
    cartridges: [
      { code: "(tempF - 32) * 5 / 9", correct: true },
      { code: "(tempF - 32) * 5.0 / 9", correct: true, alsoCorrect: true },
      { code: "tempF - 32 * 5 / 9", tag: "operator_precedence_wrong" },
      { code: "(tempF * 5 / 9) - 32", tag: "formula_shape_wrong" },
    ],
    tests: [{ expectedOutput: "Celsius: 37.0" }],
    postMissionNote: "Bit: 'parseDouble gave you the raw Fahrenheit; arithmetic gave you Celsius; printf formatted it to one decimal. The crucible's liquid became the formula's input — conversion serves computation.'",
    concept: "command_fahrenheit_celsius" },

  { round: 12, type: "command",
    source: 'String w = "7.5";\nString h = "3.2";\ndouble area = <slot:width> * <slot:height>;\nSystem.out.printf("Area: %.2f%n", area);',
    mission: "Convert width and height, then compute the area.\nFor 7.5 × 3.2: Area: 24.00",
    slots: [
      { id: "width", hint: "convert width" },
      { id: "height", hint: "convert height" },
    ],
    cartridges: [
      { code: "Double.parseDouble(w)", correct: true, slotId: "width" },
      { code: "Integer.parseInt(w)", tag: "parseInt_accepts_dot_belief", slotId: "width" },
      { code: "Double.parseDouble(h)", correct: true, slotId: "height" },
      { code: "h", tag: "string_is_number_belief", slotId: "height" },
    ],
    tests: [{ expectedOutput: "Area: 24.00" }],
    postMissionNote: "Bit (setting the pipette down, looking between the crucible and the furnace silhouette): 'Two Strings, two dissolutions, one multiplication, one formatted print. Both dimensions were decimal — parseInt would have cracked on the dots. The crucible was the right instrument. Knowing WHICH to reach for: that's the assayer's judgment.'",
    concept: "command_area_calculation" },
];

const MISCONCEPTION_FEEDBACK = {
  parseDouble_truncates_belief: "parseDouble does NOT truncate — '9.81' dissolves to 9.81 exactly. Every decimal digit is preserved.",
  parseDouble_rounds_belief: "parseDouble does NOT round — '-0.5' stays -0.5. The liquid level is precise.",
  parseDouble_returns_int_belief: "parseDouble ALWAYS returns a double — even '100' becomes 100.0. The .0 is permanent.",
  parseDouble_returns_string_belief: "parseDouble returns a primitive DOUBLE — the liquid metal, not the paper strip. The text is consumed; the number remains.",
  integer_string_crashes_parseDouble_belief: "Integer Strings are VALID in parseDouble — '100' dissolves to 100.0. The crucible is more permissive than the furnace: it accepts everything the furnace accepts, plus dots.",
  parseInt_accepts_dot_belief: "parseInt REJECTS dots — ALWAYS. A decimal String is an integer furnace crash. Use parseDouble for decimal text.",
  parseInt_truncates_decimal_belief: "parseInt doesn't truncate a decimal String to its whole part — it CRASHES. There's no gentle degradation; the dot is a full stop.",
  parseInt_rounds_belief: "parseInt doesn't round either — it CRASHES on any dot, full stop.",
  parseDouble_no_dot_belief: "A dot is welcome but not required. '42' dissolves to 42.0 — integers are valid doubles.",
  wrong_wrapper_class: "Double (capital D) for parseDouble; Integer (capital I) for parseInt. Each wrapper class serves its primitive.",
  double_vs_Double_belief: "double is a primitive keyword — no methods. Double is the wrapper class. Same pattern as int/Integer.",
  nfe_on_valid_double: "That's a valid decimal — the crucible accepts it. Digits plus at most one dot plus an optional leading sign.",
  nfe_returns_zero_belief: "The crucible doesn't return a default — it CRASHES on invalid input. Same as parseInt: no fallback.",
  nfe_returns_nan_belief: "Java's parseDouble doesn't return NaN on invalid Strings — it throws NumberFormatException. NaN comes from impossible math (like 0.0/0.0), not parsing.",
  nfe_is_compile_error_belief: "NumberFormatException is a RUNTIME crash — the compiler approved the String argument. Only at run time does the crucible discover invalid input.",
  runtime_vs_compile_confusion: "A wrong class/method name is a COMPILE error, caught before the program ever runs. NumberFormatException is a RUNTIME event, from bad data, not bad syntax.",
  two_dots_valid_belief: "One dot separates; two dots crash. A String with two dots has a second one that triggers NFE.",
  leading_dot_crashes_belief: "Leading dot is legal: '.75' = 0.75. The zero before the decimal is implied.",
  dot_ignored_belief: "The dot is NOT ignored — it determines the decimal position. '.75' is 0.75, not 75.0.",
  parseDouble_strips_sign_belief: "The leading minus is part of the value — -0.5 is negative zero-point-five.",
  negative_dot_crashes_belief: "A leading minus followed by a valid decimal is perfectly legal — '-0.5' dissolves cleanly.",
  string_is_number_belief: "Text that looks like a number is still text. The crucible converts; nothing else will.",
  string_concat_vs_addition: "'1.5' + '2.5' = '1.52.5' (concat). parseDouble('1.5') + parseDouble('2.5') = 4.0 (addition). The crucible changes the meaning of +.",
  concat_dots_crash_belief: "String concatenation never crashes on dots — dots are just characters in text. Only parsing validates them.",
  double_prints_without_dot_belief: "println on a double ALWAYS shows the decimal part — 10.0, not 10. The .0 is the double's signature.",
  multiplication_crashes_belief: "Arithmetic on two valid doubles never crashes — parseDouble already validated the text; the multiplication that follows is ordinary math.",
  operator_precedence_wrong: "Without parentheses around (tempF - 32), multiplication binds first: 32 * 5 / 9 = 17 (integer division truncates), then tempF - 17. Parentheses enforce subtraction first.",
  formula_shape_wrong: "The Fahrenheit formula is (F - 32) × 5/9. Multiplying F first changes the math entirely.",
  timeout: "Reread the source carefully — trace it against the crucible.",
};

export class Level74Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level74Scene" });
  }

  init(data = {}) {
    this._forceTutorial = !!data.forceTutorial;
    this.currentRound = 0;
    this.score = 0;
    this.displayScore = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.lives = 5;
    this.correctFirstTry = 0;
    this.totalTime = 0;
    this.attemptLog = [];
    this.roundElements = [];
    this.roundStartTime = 0;
    this.roundAttempts = 0;
    this.slotContents = {};
    this.slotDefs = {};
    this.cartridges = [];
    this.inputLocked = true;
    this.gameEnded = false;
    this._alive = true;
    this.firstDotAnnotationShown = false;
    this.firstTypeAnnotationShown = false;
  }

  preload() {}

  create() {
    this._alive = true;
    this.createParticleTexture();
    this.createBackground();
    this.createRoomInterior();
    this.createRoomFloor();
    this.createParticles();
    this.createDecimalCrucible();
    this.createAssayersSlate();
    this.createSourceDisplay();
    this.createHUD();
    addTutorialReplayButton(this, W, this.lifeIcons[4].x, this.lifeIcons[0].y);
    this.createExpressionMonitor();
    this.createBit();

    this.events.on("shutdown", () => { this._alive = false; });
    this.checkTutorial();
  }

  update(time, delta) {
    this.updateParticles(time, delta);
    this.updateBalanceRock(time);
    this.updateCrucibleGlow(time);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // SETUP — THE CRUCIBLE ROOM INTERIOR
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l74_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l74_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x0c0818).setDepth(0);
  }

  createRoomInterior() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x120c22, 1);
    g.fillRect(0, 0, W, 216);

    // Decimal precision chart
    g.lineStyle(2, C_COPPER, 0.5);
    g.strokeRect(300, 40, 440, 110);
    for (let i = 0; i <= 100; i += 10) {
      const x = 300 + (i / 100) * 440;
      const tall = i % 10 === 0;
      g.lineStyle(1, C_ORANGE, tall ? 0.3 : 0.15);
      g.lineBetween(x, 40, x, tall ? 60 : 52);
    }
    this.add.text(520, 30, "0.0 ————————— 10.0", { font: "9px Courier New", color: HEX_ORANGE }).setOrigin(0.5).setAlpha(0.3).setDepth(2);

    // Integer Furnace silhouette (parseInt contrast, dim by default)
    const fg = this.add.graphics().setDepth(2).setAlpha(0.2);
    fg.lineStyle(1.5, C_COPPER, 1);
    fg.beginPath();
    fg.moveTo(FSIL_X0, FSIL_Y0 + 20); fg.lineTo(FSIL_X1, FSIL_Y0 + 20);
    fg.lineTo((FSIL_X0 + FSIL_X1) / 2 + 10, FSIL_Y0 + 40); fg.lineTo((FSIL_X0 + FSIL_X1) / 2 - 10, FSIL_Y0 + 40);
    fg.closePath();
    fg.strokePath();
    fg.strokeRect((FSIL_X0 + FSIL_X1) / 2 - 25, FSIL_Y0 + 60, 50, 50);
    this._furnaceSilGfx = fg;
    this._furnaceSilLabel = this.add.text((FSIL_X0 + FSIL_X1) / 2, FSIL_Y1 - 4, "INTEGER FURNACE", { font: "bold 8px Georgia", color: HEX_COPPER }).setOrigin(0.5).setAlpha(0.3).setDepth(3);
    this._furnaceSilGate = this.add.rectangle((FSIL_X0 + FSIL_X1) / 2, FSIL_Y0 + 85, 40, 6, C_RED, 0).setDepth(4);

    // Rack of graduated cylinders
    const rg = this.add.graphics().setDepth(2);
    rg.lineStyle(1.5, C_ORANGE, 0.5);
    rg.strokeRect(1120, 100, 120, 140);
    [1145, 1180, 1215].forEach((cx, i) => {
      rg.lineStyle(1, C_ORANGE, 0.4);
      rg.strokeRect(cx - 8, 115, 16, 100);
      const level = 20 + i * 25;
      rg.fillStyle(C_ORANGE, 0.3);
      rg.fillRect(cx - 7, 214 - level, 14, level);
    });

    // Precision balance
    const bx = 80, by = 480;
    const balG = this.add.graphics().setDepth(2).setAlpha(0.4);
    balG.lineStyle(1.5, C_COPPER, 1);
    balG.lineBetween(bx, by, bx, by - 30);
    this._balanceBeam = this.add.container(bx, by - 30).setDepth(2).setAlpha(0.4);
    const beamG = this.add.graphics();
    beamG.lineStyle(1.5, C_COPPER, 1);
    beamG.lineBetween(-30, 0, 30, 0);
    beamG.strokeCircle(-30, 6, 8);
    beamG.strokeCircle(30, 6, 8);
    this._balanceBeam.add(beamG);

    // Banner
    const bnG = this.add.graphics().setDepth(2);
    bnG.fillStyle(0x0c0818, 1);
    bnG.lineStyle(1, C_ORANGE, 0.5);
    bnG.fillRoundedRect(460, 12, 360, 26, 3);
    bnG.strokeRoundedRect(460, 12, 360, 26, 3);
    this.add.text(640, 25, "T H E   D E C I M A L   C R U C I B L E", { font: "bold 15px Georgia", color: HEX_ORANGE }).setOrigin(0.5).setAlpha(0.7).setDepth(3);
  }

  updateBalanceRock(time) {
    if (!this._balanceBeam) return;
    this._balanceBeam.setAngle(Math.sin(time * 0.0004) * 1);
  }

  async activateFurnaceSilhouette() {
    this.tweens.add({ targets: [this._furnaceSilGfx, this._furnaceSilLabel], alpha: 0.7, duration: 250 });
    await this.delay(280);
  }

  dimFurnaceSilhouette() {
    this.tweens.add({ targets: [this._furnaceSilGfx, this._furnaceSilLabel], alpha: 0.2, duration: 300 });
    this._furnaceSilGate.setAlpha(0);
  }

  createRoomFloor() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x0a0612, 1);
    g.fillRect(0, 635, W, 85);
    g.lineStyle(1, 0x0e0a1a, 0.5);
    for (let x = 0; x < W; x += 60) {
      for (let y = 635; y < 720; y += 40) {
        if (((x / 60) + (y / 40)) % 2 === 0) {
          g.fillStyle(0x0e0a1a, 0.3);
          g.fillRect(x, y, 60, 40);
        }
      }
    }
    g.fillStyle(C_ORANGE, 0.12);
    g.fillRect(0, 637, 6, 83);
  }

  createParticles() {
    this.ambient = [];
    const colors = [0x3949ab, 0xff9800, 0xb87333];
    for (let i = 0; i < 7; i++) {
      this.ambient.push(this.add.circle(Phaser.Math.Between(0, W), Phaser.Math.Between(230, 630), 1, Phaser.Utils.Array.GetRandom(colors), Phaser.Math.FloatBetween(0.03, 0.05)).setDepth(2));
    }
  }

  updateParticles(time, delta) {
    if (!this.ambient) return;
    const step = 0.006 * (delta / 16.7);
    this.ambient.forEach((p, i) => {
      const nearCrucible = p.x > CRUCIBLE_CX - 150 && p.x < CRUCIBLE_CX + 150 && p.y > 300 && p.y < 480;
      p.y -= step * (nearCrucible ? 1.5 : 0.5) * (i % 2 === 0 ? 1 : 0.6);
      p.x += Math.sin(time * 0.0003 + i) * 0.02;
      if (p.y < 150) p.y = 630; if (p.y > 630) p.y = 150;
      if (p.x > W) p.x = 0; if (p.x < 0) p.x = W;
    });
  }

  createAnnotation(x, y, text, colorHex) {
    const t = this.add.text(x, y, text, { font: "italic 12px Arial", color: colorHex, wordWrap: { width: 280 }, align: "center" }).setOrigin(0.5).setDepth(70).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 200 });
    this.time.delayedCall(2600, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() }); });
    return t;
  }

  createFloatingText(x, y, text, colorHex, font = "bold 15px Arial", hold = 1400) {
    const t = this.add.text(x, y, text, { font, color: colorHex, wordWrap: { width: 320 }, align: "center" }).setOrigin(0.5).setDepth(31).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 180 });
    this.time.delayedCall(hold, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() }); });
    return t;
  }

  createConfetti(x, y, count = 30) {
    const p = this.add.particles(x, y, "l74_dot", {
      speed: { min: 80, max: 240 }, angle: { min: 0, max: 360 }, scale: { start: 0.9, end: 0 }, lifespan: 500,
      tint: [C_ORANGE, C_INDIGO, C_COPPER, 0xffffff], emitting: false,
    }).setDepth(85);
    p.explode(count);
    this.time.delayedCall(900, () => p.destroy());
  }

  screenShake(intensity = 0.004, duration = 150) {
    this.cameras.main.shake(duration, intensity);
  }

  // ══════════════════════════════════════════════════════════════
  // THE DECIMAL CRUCIBLE (hero visual)
  // ══════════════════════════════════════════════════════════════

  createDecimalCrucible() {
    const g = this.add.graphics().setDepth(10);

    // Hopper (shared design with L71's furnace)
    g.lineStyle(3, C_COPPER, 1);
    g.fillStyle(0x0c0818, 0.8);
    g.beginPath();
    g.moveTo(HOPPER_X0, HOPPER_Y0); g.lineTo(HOPPER_X1, HOPPER_Y0);
    g.lineTo(CRUCIBLE_CX + 30, HOPPER_Y1); g.lineTo(CRUCIBLE_CX - 30, HOPPER_Y1);
    g.closePath();
    g.fillPath(); g.strokePath();
    this.add.text(CRUCIBLE_CX, HOPPER_Y0 - 12, "STRING INPUT", { font: "bold 11px Georgia", color: HEX_COPPER }).setOrigin(0.5).setDepth(11);

    // Validation gate (extended: amber for the dot)
    g.lineStyle(2, C_ORANGE, 1);
    g.fillStyle(0x0c0818, 0.5);
    g.fillRoundedRect(GATE_X0, GATE_Y0, GATE_X1 - GATE_X0, GATE_Y1 - GATE_Y0, 6);
    g.strokeRoundedRect(GATE_X0, GATE_Y0, GATE_X1 - GATE_X0, GATE_Y1 - GATE_Y0, 6);
    [GATE_X0 + 6, GATE_X1 - 6].forEach((x) => {
      g.fillStyle(C_ORANGE, 0.4);
      g.fillCircle(x, (GATE_Y0 + GATE_Y1) / 2, 6);
    });
    this.gateBarrier = this.add.rectangle((GATE_X0 + GATE_X1) / 2, GATE_Y0 + 4, GATE_X1 - GATE_X0 - 10, 4, C_RED, 0).setDepth(14);

    // Dissolution chamber — graduated glass vessel
    g.lineStyle(2, C_ORANGE, 1);
    g.fillStyle(0x0c0818, 0.5);
    g.fillRoundedRect(VESSEL_X0, VESSEL_Y0, VESSEL_X1 - VESSEL_X0, VESSEL_Y1 - VESSEL_Y0, 8);
    g.strokeRoundedRect(VESSEL_X0, VESSEL_Y0, VESSEL_X1 - VESSEL_X0, VESSEL_Y1 - VESSEL_Y0, 8);
    g.lineStyle(1, 0xe8eaf6, 0.08);
    g.lineBetween(VESSEL_X0 + 8, VESSEL_Y0 + 6, VESSEL_X0 + 8, VESSEL_Y1 - 6);
    for (let i = 0; i <= 6; i++) {
      const gy = VESSEL_Y1 - (i / 6) * (VESSEL_Y1 - VESSEL_Y0);
      g.lineStyle(1, C_ORANGE, 0.35);
      g.lineBetween(VESSEL_X1 - 10, gy, VESSEL_X1 - 2, gy);
    }
    this.vesselLiquidGfx = this.add.graphics().setDepth(11);
    this.vesselBubbleLayer = this.add.container(0, 0).setDepth(12);
    this.vesselValueText = this.add.text(VESSEL_X1 + 14, (VESSEL_Y0 + VESSEL_Y1) / 2, "", { font: "bold 18px Courier New", color: HEX_ORANGE }).setOrigin(0, 0.5).setDepth(13);
    this.vesselDotZeroText = this.add.text(0, 0, "", { font: "14px Courier New", color: HEX_ORANGE }).setOrigin(0, 0.5).setDepth(13).setAlpha(0.6);

    // Output pour — graduated cylinder container
    const contG = this.add.graphics().setDepth(11);
    contG.fillStyle(0x0c0818, 0.9);
    contG.lineStyle(2, C_ORANGE, 1);
    contG.fillRoundedRect(CONT_X - 30, CONT_Y, 60, 50, 4);
    contG.strokeRoundedRect(CONT_X - 30, CONT_Y, 60, 50, 4);
    this.add.text(CONT_X, CONT_Y - 12, "double", { font: "bold 11px Courier New", color: HEX_ORANGE }).setOrigin(0.5).setDepth(12);
    this.containerValueText = this.add.text(CONT_X, CONT_Y + 25, "—", { font: "bold 16px Courier New", color: HEX_GRAY }).setOrigin(0.5).setDepth(12);
    this.containerNameText = this.add.text(CONT_X, CONT_Y + 45, "", { font: "italic 10px Courier New", color: HEX_GRAY }).setOrigin(0.5).setDepth(12);
    this.pourStreamGfx = this.add.graphics().setDepth(11);

    this.crucibleDynamicLayer = this.add.container(0, 0).setDepth(20);
    this._crucibleStaticGfx = g;
  }

  updateCrucibleGlow(time) {
    if (!this.vesselLiquidGfx) return;
    // subtle shimmer handled per-fill in settleLevel; nothing idle to animate
  }

  clearCrucible() {
    this.crucibleDynamicLayer.removeAll(true);
    this.gateBarrier.setAlpha(0);
    this.vesselLiquidGfx.clear();
    this.vesselBubbleLayer.removeAll(true);
    this.vesselValueText.setText("");
    this.vesselDotZeroText.setAlpha(0);
    this.pourStreamGfx.clear();
  }

  async materializePaperStrip(value) {
    const strip = this.add.container(CRUCIBLE_CX, HOPPER_Y0 + 10).setAlpha(0);
    const bg = this.add.graphics();
    const w = Math.max(60, value.length * 11 + 20), h = 26;
    bg.fillStyle(0xe0d6b8, 1);
    bg.lineStyle(1, 0x8a6435, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 3);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 3);
    const txt = this.add.text(0, 0, value, { font: "bold 18px Courier New", color: "#241a0e" }).setOrigin(0.5);
    if (txt.width > w - 10) txt.setFontSize(12);
    strip.add([bg, txt]);
    this.crucibleDynamicLayer.add(strip);
    this._currentStrip = { container: strip, bg, txt, w, value };
    this.tweens.add({ targets: strip, alpha: 1, duration: 200 });
    await this.delay(250);
    return this._currentStrip;
  }

  async feedStripDown() {
    const strip = this._currentStrip;
    if (!strip) return;
    await new Promise((res) => {
      this.tweens.add({ targets: strip.container, y: (GATE_Y0 + GATE_Y1) / 2, duration: 260, ease: "Sine.easeIn", onComplete: res });
    });
  }

  /** Inspects characters left-to-right with a per-character spotlight:
   * GREEN for digits and a leading sign, AMBER for the (single, legal)
   * decimal point, RED for anything else — including a SECOND dot.
   * Stops at the first RED character, matching Java's real behavior.
   * Validity is computed once via the master regex (source of truth,
   * accepting an optional sign, then digits/dot in any legal
   * arrangement: "3.14", "100", ".75", "5." are all valid; "1.2.3",
   * letters, spaces, and empty strings are not), and the spotlight
   * sequence is derived to agree with it. */
  async inspectCharacters(strValue) {
    const chars = strValue.split("");
    const validMatch = strValue.length > 0 && /^[+-]?(\d+\.?\d*|\.\d+)$/.test(strValue);
    let dotSeen = false;
    const kinds = [];
    let invalidIndex = -1;
    for (let i = 0; i < chars.length; i++) {
      const ch = chars[i];
      let kind;
      if (/[0-9]/.test(ch)) kind = "green";
      else if ((ch === "+" || ch === "-") && i === 0) kind = "green";
      else if (ch === "." && !dotSeen) { dotSeen = true; kind = "amber"; }
      else kind = "red";
      kinds.push(kind);
      if (!validMatch && kind === "red" && invalidIndex === -1) invalidIndex = i;
    }
    if (!validMatch && invalidIndex === -1) invalidIndex = chars.length - 1;

    const strip = this._currentStrip;
    const startX = strip ? strip.container.x - strip.w / 2 + 14 : CRUCIBLE_CX - 20;
    const y = (GATE_Y0 + GATE_Y1) / 2;
    const showCount = validMatch ? chars.length : invalidIndex + 1;
    const step = strip ? Math.min(14, (strip.w - 20) / Math.max(chars.length, 1)) : 14;
    let dotAnnotationShown = false;
    for (let i = 0; i < showCount; i++) {
      if (!this._alive) return { allValid: true, invalidIndex: -1 };
      const kind = !validMatch && i === invalidIndex ? "red" : kinds[i];
      const spotX = startX + i * step;
      const color = kind === "green" ? C_GREEN_BRIGHT : kind === "amber" ? C_AMBER : C_RED;
      const alpha = kind === "red" ? 0.6 : 0.4;
      const spot = this.add.circle(spotX, y, 7, color, alpha).setDepth(21);
      this.crucibleDynamicLayer.add(spot);
      this.tweens.add({ targets: spot, alpha: 0, duration: 300, delay: 150, onComplete: () => spot.destroy() });
      if (kind === "amber" && !this.firstDotAnnotationShown && !dotAnnotationShown) {
        dotAnnotationShown = true;
        this.firstDotAnnotationShown = true;
        this.createAnnotation(CRUCIBLE_CX, GATE_Y1 + 18, "the decimal point — one per strip, the crucible's key", HEX_AMBER);
      }
      await this.delay(150);
      if (kind === "red") break;
    }
    return { allValid: validMatch, invalidIndex };
  }

  async openGate() {
    await new Promise((res) => { this.tweens.add({ targets: this.gateBarrier, alpha: 0, duration: 80, onComplete: res }); });
  }

  async slamGate() {
    this.gateBarrier.setFillStyle(C_RED, 0.9).setAlpha(1);
    const flash = this.add.rectangle((GATE_X0 + GATE_X1) / 2, (GATE_Y0 + GATE_Y1) / 2, GATE_X1 - GATE_X0, GATE_Y1 - GATE_Y0, C_RED, 0.4).setDepth(22);
    this.crucibleDynamicLayer.add(flash);
    this.tweens.add({ targets: flash, alpha: 0, duration: 300, onComplete: () => flash.destroy() });
    await this.delay(100);
  }

  async ejectStrip() {
    const strip = this._currentStrip;
    if (!strip) return;
    for (let i = 0; i < 5; i++) {
      const spark = this.add.circle(strip.container.x + Phaser.Math.Between(-10, 10), strip.container.y, 2, C_RED, 0.8).setDepth(22);
      this.crucibleDynamicLayer.add(spark);
      this.tweens.add({ targets: spark, y: spark.y + Phaser.Math.Between(10, 30), alpha: 0, duration: 300, onComplete: () => spark.destroy() });
    }
    await new Promise((res) => {
      this.tweens.add({ targets: strip.container, y: HOPPER_Y0 - 20, alpha: 0, duration: 200, ease: "Sine.easeIn", onComplete: () => { strip.container.destroy(); res(); } });
    });
    this._currentStrip = null;
  }

  /** The strip DISSOLVES rather than burns: it submerges into the
   * vessel and fades out while amber liquid rises with bubbles. */
  async dissolveStrip(value) {
    const strip = this._currentStrip;
    if (!strip) return;
    const vcx = (VESSEL_X0 + VESSEL_X1) / 2;
    await new Promise((res) => {
      this.tweens.add({ targets: strip.container, y: VESSEL_Y0 + 20, duration: 150, ease: "Sine.easeIn", onComplete: res });
    });
    for (let i = 0; i < 5; i++) {
      const bub = this.add.circle(vcx + Phaser.Math.Between(-60, 60), VESSEL_Y1 - 6, Phaser.Math.Between(1, 3), 0xffe0b2, 0.6).setDepth(12);
      this.vesselBubbleLayer.add(bub);
      this.tweens.add({ targets: bub, y: bub.y - Phaser.Math.Between(40, 90), alpha: 0, duration: 500, onComplete: () => bub.destroy() });
    }
    await new Promise((res) => {
      this.tweens.add({ targets: strip.container, alpha: 0, scale: 0.7, duration: 400, onComplete: () => { strip.container.destroy(); res(); } });
    });
    this._currentStrip = null;
    await this.settleLevel(value);
  }

  /** The liquid settles at a level proportional to the value (capped
   * at the vessel's visible range, with a ▲ overflow indicator beyond
   * it), and the value glows beside the mark. Integer-valued doubles
   * get a ".0" annotation confirming the type. */
  async settleLevel(value) {
    const vcx0 = VESSEL_X0 + 2, vcx1 = VESSEL_X1 - 2;
    const maxDisplay = 110;
    const magnitude = Math.max(0, value);
    const frac = Phaser.Math.Clamp(magnitude / maxDisplay, 0, 1);
    const fillH = frac * (VESSEL_Y1 - VESSEL_Y0 - 8);
    const fillTopY = VESSEL_Y1 - 6 - fillH;

    const state = { h: 0 };
    await new Promise((res) => {
      this.tweens.add({
        targets: state, h: fillH, duration: 500, ease: "Sine.easeOut",
        onUpdate: () => {
          this.vesselLiquidGfx.clear();
          this.vesselLiquidGfx.fillStyle(C_AMBER, 0.35);
          this.vesselLiquidGfx.fillRoundedRect(vcx0, VESSEL_Y1 - 6 - state.h, vcx1 - vcx0, state.h, 4);
        },
        onComplete: res,
      });
    });

    if (magnitude / maxDisplay > 1) {
      const overflow = this.add.text(vcx0 + (vcx1 - vcx0) / 2, VESSEL_Y0 - 10, "▲", { font: "bold 16px Arial", color: HEX_AMBER }).setOrigin(0.5).setDepth(13);
      this.crucibleDynamicLayer.add(overflow);
    }

    const display = this._fmtDouble(value);
    this.vesselValueText.setPosition(VESSEL_X1 + 14, fillTopY).setText(display).setAlpha(0);
    this.tweens.add({ targets: this.vesselValueText, alpha: 1, duration: 200 });
    if (Number.isInteger(value)) {
      this.vesselDotZeroText.setPosition(VESSEL_X1 + 14 + this.vesselValueText.width - 14, fillTopY + 16).setAlpha(0);
    }
    await this.delay(200);
  }

  _fmtDouble(value) {
    return Number.isInteger(value) ? `${value}.0` : String(value);
  }

  async pourToContainer(value) {
    const vcx = (VESSEL_X0 + VESSEL_X1) / 2;
    this.pourStreamGfx.clear();
    this.pourStreamGfx.lineStyle(2, C_AMBER, 0.8);
    await new Promise((res) => {
      const state = { t: 0 };
      this.tweens.add({
        targets: state, t: 1, duration: 200,
        onUpdate: () => {
          this.pourStreamGfx.clear();
          this.pourStreamGfx.lineStyle(2, C_AMBER, 0.8);
          const y1 = Phaser.Math.Linear(VESSEL_Y1 + 4, CONT_Y + 10, state.t);
          this.pourStreamGfx.lineBetween(vcx, VESSEL_Y1 + 4, CONT_X, y1);
        },
        onComplete: res,
      });
    });
    for (let i = 0; i < 4; i++) {
      const splash = this.add.circle(CONT_X + Phaser.Math.Between(-6, 6), CONT_Y + 10, 1.5, C_AMBER, 0.7).setDepth(21);
      this.crucibleDynamicLayer.add(splash);
      this.tweens.add({ targets: splash, y: splash.y + Phaser.Math.Between(4, 10), alpha: 0, duration: 250, onComplete: () => splash.destroy() });
    }
    this.pourStreamGfx.clear();
    this.containerValueText.setText(this._fmtDouble(value)).setColor(HEX_ORANGE);
    this.tweens.add({ targets: this.containerValueText, scale: 1.2, duration: 100, yoyo: true });

    if (!this.firstTypeAnnotationShown) {
      this.firstTypeAnnotationShown = true;
      this.createAnnotation(CONT_X, CONT_Y + 70, "primitive double — not int, not String, not Double object", HEX_GRAY);
    }
    await this.delay(150);
  }

  async showNFE(inputStr) {
    this.screenShake(0.006, 300);
    const banner = this.add.text(CRUCIBLE_CX, (VESSEL_Y0 + VESSEL_Y1) / 2, "NumberFormatException", { font: "bold 17px Courier New", color: HEX_RED }).setOrigin(0.5).setDepth(30).setScale(1.3).setAlpha(0);
    this.crucibleDynamicLayer.add(banner);
    this.tweens.add({ targets: banner, alpha: 1, scale: 1, duration: 150 });
    await this.delay(1600);
    if (banner.active) this.tweens.add({ targets: banner, alpha: 0, duration: 250, onComplete: () => banner.destroy() });
    this.containerValueText.setText("✗").setColor(HEX_RED);
    this.containerNameText.setText("CRASH");
  }

  showCompileErrorStamp() {
    const stamp = this.add.text(CRUCIBLE_CX, 150, "COMPILE ERROR", { font: "bold 18px Arial", color: HEX_RED }).setOrigin(0.5).setDepth(30).setScale(1.3).setAngle(-6).setAlpha(0);
    this.roundElements.push(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 150 });
    this.screenShake(0.004, 120);
    this.time.delayedCall(850, () => { if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 200, onComplete: () => stamp.destroy() }); });
  }

  /** The full honest dissolution choreography: strip in, character-
   * inspected (green digits/sign, AMBER dot, red rejection), and
   * EITHER dissolved into a liquid level OR rejected with a
   * NumberFormatException — never scripted. */
  async runConversionChoreography(strValue) {
    await this.materializePaperStrip(strValue);
    await this.feedStripDown();
    const inspection = await this.inspectCharacters(strValue);
    if (!inspection.allValid) {
      await this.slamGate();
      await this.ejectStrip();
      await this.showNFE(strValue);
      return { ok: false, crash: "nfe" };
    }
    await this.openGate();
    const value = parseFloat(strValue);
    await this.dissolveStrip(value);
    await this.pourToContainer(value);
    return { ok: true, value };
  }

  /** Round 5's signature contrast: the same strip that the crucible
   * would welcome enters the INTEGER FURNACE silhouette instead. Its
   * gate rejects the dot in RED (never amber — the furnace has no
   * special case for decimal points), the furnace shudders, NFE. */
  async showParseIntContrastReveal(strValue) {
    await this.activateFurnaceSilhouette();
    const fcx = (FSIL_X0 + FSIL_X1) / 2;
    const strip = this.add.container(fcx, FSIL_Y0 + 10).setAlpha(0);
    const bg = this.add.graphics();
    const w = Math.max(40, strValue.length * 8 + 12), h = 16;
    bg.fillStyle(0xe0d6b8, 1);
    bg.lineStyle(1, 0x8a6435, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 2);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 2);
    const txt = this.add.text(0, 0, strValue, { font: "bold 12px Courier New", color: "#241a0e" }).setOrigin(0.5);
    strip.add([bg, txt]);
    this.roundElements.push(strip);
    this.tweens.add({ targets: strip, alpha: 1, duration: 150 });
    await this.delay(200);

    const gy = FSIL_Y0 + 85;
    let dotX = fcx;
    for (let i = 0; i < strValue.length; i++) {
      const ch = strValue[i];
      const isDot = ch === ".";
      const isDigitOrSign = /[0-9]/.test(ch) || ((ch === "+" || ch === "-") && i === 0);
      const spotX = fcx - w / 2 + 8 + i * Math.min(10, (w - 12) / strValue.length);
      if (isDot) dotX = spotX;
      const color = isDot ? C_RED : isDigitOrSign ? C_GREEN_BRIGHT : C_RED;
      const spot = this.add.circle(spotX, gy, 5, color, 0.5).setDepth(21);
      this.roundElements.push(spot);
      this.tweens.add({ targets: spot, alpha: 0, duration: 250, delay: 120 });
      await this.delay(110);
      if (isDot) break;
    }

    this.screenShake(0.005, 200);
    this._furnaceSilGate.setFillStyle(C_RED, 0.9).setAlpha(1);
    this.tweens.add({ targets: this._furnaceSilGfx, x: 3, duration: 40, yoyo: true, repeat: 4 });
    await this.delay(250);
    const banner = this.add.text(fcx, FSIL_Y0 + 85, "NFE", { font: "bold 13px Courier New", color: HEX_RED }).setOrigin(0.5).setDepth(30).setAlpha(0);
    this.roundElements.push(banner);
    this.tweens.add({ targets: banner, alpha: 1, duration: 150 });
    await this.delay(900);
    strip.destroy();
    this.dimFurnaceSilhouette();
    await this.delay(200);

    // Now play the correct dissolution in the crucible for comparison.
    await this.runConversionChoreography(strValue);
  }

  // ══════════════════════════════════════════════════════════════
  // ASSAYER'S SLATE
  // ══════════════════════════════════════════════════════════════

  createAssayersSlate() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0a0d18, 1);
    g.lineStyle(2, C_INDIGO, 1);
    g.fillRoundedRect(SLATE_X, SLATE_Y, SLATE_W, SLATE_H, 8);
    g.strokeRoundedRect(SLATE_X, SLATE_Y, SLATE_W, SLATE_H, 8);
    this.add.text(SLATE_X + 14, SLATE_Y + 12, "ASSAYER'S SLATE", { font: "bold 12px Georgia", color: HEX_INDIGO }).setDepth(11);

    const pillG = this.add.graphics().setDepth(11);
    pillG.lineStyle(1.2, C_ORANGE, 0.7);
    pillG.strokeRoundedRect(SLATE_X + SLATE_W - 178, SLATE_Y + 8, 166, 16, 8);
    this.add.text(SLATE_X + SLATE_W - 95, SLATE_Y + 16, "Double (wrapper class)", { font: "bold 9px Courier New", color: HEX_ORANGE }).setOrigin(0.5).setDepth(12);

    // parseInt vs parseDouble comparison strip
    this.add.text(SLATE_X + 14, SLATE_Y + 30, "parseInt → int", { font: "bold 10px Courier New", color: HEX_GOLD }).setDepth(11);
    this.add.text(SLATE_X + 130, SLATE_Y + 30, "parseDouble → double", { font: "bold 10px Courier New", color: HEX_ORANGE }).setDepth(11);

    this.slateLines = this.add.container(0, 0).setDepth(11);
    this._slateY = SLATE_Y + 56;

    this.add.text(SLATE_X + 14, SLATE_Y + SLATE_H - 34, "returns:", { font: "13px Georgia", color: "#8a6435" }).setDepth(11);
    this.resultText = this.add.text(SLATE_X + 70, SLATE_Y + SLATE_H - 34, "—", { font: "bold 15px Courier New", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(11);
  }

  async chalkWriteLine(text, color) {
    const t = this.add.text(SLATE_X + 14, this._slateY, "", { font: "bold 14px Courier New", color: color || "#e8eaf6" }).setDepth(11);
    this.slateLines.add(t);
    for (let i = 0; i < text.length; i++) {
      if (!this._alive) return;
      t.setText(t.text + text[i]);
      if (t.width > SLATE_W - 28) t.setFontSize(10);
      await this.delay(14);
    }
    this._slateY += 22;
    if (this._slateY > SLATE_Y + SLATE_H - 46) this._slateY = SLATE_Y + 56;
  }

  chalkEvaluationArrow(value) {
    const t = this.add.text(SLATE_X + 14, this._slateY, `→ ${value}`, { font: "bold 14px Courier New", color: HEX_ORANGE }).setAlpha(0);
    this.slateLines.add(t);
    if (t.width > SLATE_W - 28) t.setFontSize(10);
    this.tweens.add({ targets: t, alpha: 1, duration: 140 });
    this._slateY += 22;
    if (this._slateY > SLATE_Y + SLATE_H - 46) this._slateY = SLATE_Y + 56;
  }

  wipeSlate() {
    this.slateLines.removeAll(true);
    this._slateY = SLATE_Y + 56;
  }

  updateResultRow(type) {
    if (type === null || type === undefined) { this.resultText.setText("—").setColor(HEX_GRAY); return; }
    if (type === "crash") { this.resultText.setText("✗ NFE").setColor(HEX_RED); return; }
    if (type === "compile") { this.resultText.setText("✗ COMPILE").setColor(HEX_RED); return; }
    this.resultText.setText(type).setColor(type === "String" ? HEX_CYAN : type === "double" ? HEX_ORANGE : HEX_GOLD);
  }

  // ══════════════════════════════════════════════════════════════
  // SOURCE DISPLAY & EXPRESSION MONITOR
  // ══════════════════════════════════════════════════════════════

  createSourceDisplay() {
    this.sourceContainer = this.add.container(0, 0).setDepth(15);
  }

  _syntaxTokenize(line) {
    const tokens = [];
    const re = /("(?:[^"\\]|\\.)*")|(\bimport\b|\bint\b|\bdouble\b|\bString\b|\bnew\b)|(\bInteger\b|\bDouble\b)|(\.parseInt\b|\.parseDouble\b|\.printf\b|\.println\b|\.length\b)|(\bSystem\.out\b)|(-?\d+\.\d+|-?\d+)|([(){}\[\];.,=+*/%])/g;
    let last = 0, m;
    const plain = (t) => t && tokens.push({ t, c: "#e0e0e0" });
    while ((m = re.exec(line))) {
      if (m.index > last) plain(line.slice(last, m.index));
      if (m[1]) tokens.push({ t: m[1], c: "#e0d6b8" });
      else if (m[2]) tokens.push({ t: m[2], c: "#1565c0" });
      else if (m[3]) tokens.push({ t: m[3], c: HEX_COPPER });
      else if (m[4]) tokens.push({ t: m[4], c: HEX_CYAN });
      else if (m[5]) tokens.push({ t: m[5], c: "#78909c" });
      else if (m[6]) tokens.push({ t: m[6], c: HEX_GOLD });
      else if (m[7]) tokens.push({ t: m[7], c: "#78909c" });
      last = m.index + m[0].length;
    }
    if (last < line.length) plain(line.slice(last));
    return tokens.length ? tokens : [{ t: line, c: "#e0e0e0" }];
  }

  updateSourceDisplay(lines) {
    this.sourceContainer.removeAll(true);
    if (!lines || !lines.length) return;
    const fontSize = lines.length > 2 ? 12 : 15;
    const lineH = fontSize + 8;
    const startY = 120 - ((lines.length - 1) * lineH) / 2;
    lines.forEach((line, i) => {
      const y = startY + i * lineH;
      const tokens = this._syntaxTokenize(line);
      const measured = tokens.map((tok) => { const tmp = this.add.text(0, 0, tok.t, { font: `bold ${fontSize}px Courier New` }); const w = tmp.width; tmp.destroy(); return w; });
      const totalW = measured.reduce((a, b) => a + b, 0);
      let x = 470 - totalW / 2;
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
    g.fillStyle(0x0c0818, 0.9);
    g.fillRoundedRect(230, 155, 480, 18, 4);
    this.exprMonitorText = this.add.text(470, 164, "", { font: "12px Courier New", color: HEX_GRAY }).setOrigin(0.5).setDepth(51);
  }

  updateExpressionMonitor(text) { this.exprMonitorText.setText(text); }

  // ══════════════════════════════════════════════════════════════
  // HUD
  // ══════════════════════════════════════════════════════════════

  createHUD() {
    const g = this.add.graphics().setDepth(49);
    g.fillStyle(0x0c0818, 0.93);
    g.fillRect(0, 0, W, 64);
    g.lineStyle(1, 0x1a103a, 1);
    g.lineBetween(0, 64, W, 64);

    this.add.text(20, 14, "THE DECIMAL CRUCIBLE", { font: "bold 16px Georgia", color: "#b0bec5" }).setDepth(50);
    this.add.text(20, 32, "Accretion Phase — Type Conversion: parseDouble()", { font: "12px Arial", color: "#546e7a" }).setDepth(50);

    this.add.text(1060, 8, "SCORE", { font: "11px Arial", color: "#546e7a" }).setDepth(50);
    this.scoreText = this.add.text(1060, 20, "0", { font: "bold 19px Arial", color: "#ffffff" }).setDepth(50);
    this.comboText = this.add.text(1060, 42, "×1", { font: "bold 14px Arial", color: HEX_GOLD }).setDepth(50);

    this.lifeIcons = [];
    for (let i = 0; i < 5; i++) {
      const lg = this.add.graphics({ x: 1150 + i * 20, y: 24 }).setDepth(50);
      lg.lineStyle(1.5, C_ORANGE, 1);
      lg.strokeRect(-4, -7, 8, 14);
      lg.fillStyle(C_ORANGE, 0.7);
      lg.fillRect(-4, -1, 8, 7);
      this.lifeIcons.push(lg);
    }
  }

  // ══════════════════════════════════════════════════════════════
  // BIT — CRUCIBLE SPECIALIST VARIANT (apron, pipette, amber lenses)
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
    const apron = this.add.graphics();
    apron.fillStyle(0x1a0e05, 0.9);
    apron.lineStyle(1, C_COPPER, 0.8);
    apron.fillTriangle(-15, -10, 15, -10, 0, 18);
    apron.lineStyle(1, C_COPPER, 0.6);
    apron.lineBetween(-15, -10, -18, -16);
    apron.lineBetween(15, -10, 18, -16);
    apron.fillStyle(C_COPPER, 0.6);
    apron.fillCircle(-14, -12, 1.2);
    apron.fillCircle(14, -12, 1.2);
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
    this.pipette = this.add.container(17, 6);
    const pipG = this.add.graphics();
    pipG.lineStyle(1.3, C_ORANGE, 0.9);
    pipG.lineBetween(0, 8, 3, -10);
    pipG.fillStyle(C_ORANGE, 0.5);
    pipG.fillCircle(3, -12, 3);
    this.pipette.add(pipG);
    c.add([g, apron, eye, pupil, lenses, gloveL, this.pipette, tip]);
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
    g.lineStyle(1.5, C_ORANGE, 1);
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
    if (done && !this._forceTutorial) this.time.delayedCall(300, () => this.startRound(0));
    else this.runTutorial();
  }

  async runTutorial() {
    const A = () => this._alive;
    await this.delay(500); if (!A()) return;
    await this.bitSay("The Decimal Crucible, Specialist — the Integer Furnace's precision sibling. That furnace smelted text into solid bars; this crucible dissolves text into liquid metal. The difference: the decimal point. parseInt rejected it; parseDouble welcomes it.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(6500)]); if (!A()) return;
    this.hideBubble();

    this.updateSourceDisplay(['double x = Double.parseDouble("3.14");']);
    await this.runConversionChoreography("3.14");
    if (!A()) return;
    await this.bitSay("The dot passed in AMBER — the crucible's special character. Not a digit, but not rejected. One dot per strip: the decimal separator. The liquid settled at 3.14 — a DOUBLE, not an int. Flowing, precise, continuous.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(6500)]); if (!A()) return;
    this.hideBubble();
    this.clearCrucible();
    this.containerValueText.setText("—").setColor(HEX_GRAY);
    this.containerNameText.setText("");

    this.updateSourceDisplay(['double y = Double.parseDouble("42");']);
    await this.runConversionChoreography("42");
    if (!A()) return;
    await this.bitSay("No dot needed: '42' dissolves into 42.0. Every integer is a valid double — the crucible adds the .0 automatically. An int is always a legal double; a double is NOT always a legal int. The crucible is more permissive than the furnace.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(6500)]); if (!A()) return;
    this.hideBubble();
    this.clearCrucible();
    this.containerValueText.setText("—").setColor(HEX_GRAY);
    this.containerNameText.setText("");

    this.updateSourceDisplay(['int z = Integer.parseInt("3.14");']);
    await this.showParseIntContrastReveal("3.14");
    if (!A()) return;
    await this.bitSay("THE CONTRAST — the same strip that the crucible welcomed, the furnace REJECTED. parseInt cannot handle dots; parseDouble can. Different instruments, different rules. Use parseInt for whole numbers; use parseDouble when decimals are possible.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(6500)]); if (!A()) return;
    this.hideBubble();
    this.clearCrucible();
    this.containerValueText.setText("—").setColor(HEX_GRAY);
    this.containerNameText.setText("");

    this.updateSourceDisplay(['double bad = Double.parseDouble("1.2.3");']);
    await this.runConversionChoreography("1.2.3");
    if (!A()) return;
    await this.bitSay("Two dots: the crucible allows ONE decimal point, not two. '1.2.3' has two dots — the second one cracked the gate. One dot separates; two dots crash.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(6500)]); if (!A()) return;
    this.hideBubble();
    this.clearCrucible();
    this.containerValueText.setText("—").setColor(HEX_GRAY);
    this.containerNameText.setText("");

    this.updateSourceDisplay(['double q = double.parseDouble("5.0");']);
    this.showCompileErrorStamp();
    await this.delay(700); if (!A()) return;
    await this.bitSay("Same rule as Integer: double is a PRIMITIVE keyword — no methods. Double (capital D) is the WRAPPER CLASS that holds parseDouble. double stores the result; Double provides the crucible. Capital letter, class name, static method. The pattern holds.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(6500)]); if (!A()) return;
    this.hideBubble();

    this.clearCrucible();
    this.wipeSlate();
    this.updateResultRow(null);
    this.updateSourceDisplay([]);
    this.updateExpressionMonitor("");
    this.containerValueText.setText("—").setColor(HEX_GRAY);
    this.containerNameText.setText("");

    try { localStorage.setItem(TUTORIAL_KEY, "true"); } catch (_) {}
    this.startRound(0);
  }

  // ══════════════════════════════════════════════════════════════
  // ROUND LIFECYCLE
  // ══════════════════════════════════════════════════════════════

  startRound(index) {
    this.currentRound = index;
    const config = ROUNDS[index];
    this.roundAttempts = 0;
    this.clearRound();
    this.wipeSlate();
    this.updateResultRow(null);
    this.clearCrucible();
    this.containerValueText.setText("—").setColor(HEX_GRAY);
    this.containerNameText.setText("");
    this.dimFurnaceSilhouette();
    this.roundStartTime = this.time.now;

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
    const c = this.add.container(470, 600).setDepth(40).setAlpha(0);
    const g = this.add.graphics();
    g.fillStyle(0x0a0d18, 0.95);
    g.fillRoundedRect(-260, -30, 520, 60, 10);
    g.lineStyle(1, C_ORANGE, 0.5);
    g.strokeRoundedRect(-260, -30, 520, 60, 10);
    const badge = this.add.circle(-230, 0, 15, C_ORANGE);
    const badgeT = this.add.text(-230, 0, String(this.currentRound + 1), { font: "bold 15px Arial", color: "#0a1208" }).setOrigin(0.5);
    const t = this.add.text(-205, 0, promptText, { font: "16px Arial", color: "#e8eaf6", wordWrap: { width: 440 } }).setOrigin(0, 0.5);
    c.add([g, badge, badgeT, t]);
    this.tweens.add({ targets: c, alpha: 1, duration: 250 });
    this.roundElements.push(c);
    return c;
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE A/B/C — PREDICT
  // ══════════════════════════════════════════════════════════════

  setupPredict(config) {
    const lines = config.source.split("\n");
    this.updateSourceDisplay(lines);
    this.updateExpressionMonitor(lines.join("  "));
    this.showQuestionCard(config.question);
    this.showOptionBubbles(config.options, config);
  }

  showOptionBubbles(options, config) {
    const shuffled = Phaser.Utils.Array.Shuffle(options.slice());
    const n = shuffled.length;
    const spacing = 280;
    const startX = 470 - ((n - 1) * spacing) / 2;
    shuffled.forEach((opt, i) => {
      const x = startX + i * spacing, y = 670;
      const c = this.add.container(x, y).setDepth(41);
      const g = this.add.graphics();
      const w = 260, h = 40;
      const draw = (stroke) => {
        g.clear();
        g.fillStyle(0x0a0d18, 1);
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
        g.lineStyle(2, stroke, 1);
        g.strokeRoundedRect(-w / 2, -h / 2, w, h, 10);
      };
      draw(C_ORANGE);
      const label = opt.label || opt.value;
      const txt = this.add.text(0, 0, label, { font: "bold 13px Courier New", color: "#e8eaf6", wordWrap: { width: w - 20 }, align: "center" }).setOrigin(0.5);
      if (txt.height > h - 6) txt.setFontSize(9);
      c.add([g, txt]);
      c.setSize(w, h);
      c.setInteractive({ useHandCursor: true });
      c.on("pointerover", () => { if (!this.inputLocked) draw(C_GOLD); });
      c.on("pointerout", () => { if (!this.inputLocked) draw(C_ORANGE); });
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
    g.fillRoundedRect(-130, -20, 260, 40, 10);
    g.lineStyle(2, correct ? C_GREEN_BRIGHT : C_RED, 1);
    g.strokeRoundedRect(-130, -20, 260, 40, 10);
    if (!correct) this.tweens.add({ targets: bubbleContainer, x: bubbleContainer.x + 5, duration: 35, yoyo: true, repeat: 4 });

    if (config.contrastFurnace) {
      const strMatch = config.source.match(/"([^"]*)"/);
      await this.showParseIntContrastReveal(strMatch ? strMatch[1] : "");
    } else {
      const vars = {};
      this._printedLines = [];
      await this.runStatements(config.source.split("\n"), vars);
    }
    if (!this._alive) return;
    if (config.revealNote) this.createFloatingText(470, 155, config.revealNote, HEX_GRAY, "13px Arial", 3000);
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
  // TYPE D — ASSAYER COMMAND
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
    const lines = config.source.split("\n");
    const fontSize = lines.length > 2 ? 12 : 14;
    const lineH = fontSize + 8;
    const startY = 120 - ((lines.length - 1) * lineH) / 2;
    lines.forEach((rawLine, i) => {
      const y = startY + i * lineH;
      const parts = rawLine.split(/<slot:(\w+)>/);
      const measured = [];
      let totalW = 0;
      parts.forEach((part, pi) => {
        if (pi % 2 === 0) {
          const tmp = this.add.text(0, 0, part, { font: `bold ${fontSize}px Courier New` });
          measured.push(tmp.width); totalW += tmp.width; tmp.destroy();
        } else { measured.push(150); totalW += 156; }
      });
      let x = 470 - totalW / 2;
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
          const w = 150, h = fontSize + 8;
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
        dg.lineStyle(2, highlight ? 0xffab00 : C_ORANGE, 0.6);
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
    const rowY = 640;
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
        bg.fillStyle(0x1a0e05, 1);
        bg.fillRoundedRect(-w / 2, -14, w, 28, 7);
        bg.lineStyle(2, stroke, 1);
        bg.strokeRoundedRect(-w / 2, -14, w, 28, 7);
      };
      draw(C_ORANGE);
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
      c.on("pointerout", () => { if (!this.inputLocked) draw(C_ORANGE); });
      this.cartridges.push({ container: c, def, home });
      this.roundElements.push(c);
    });

    const btn = this.add.container(470, 600).setDepth(42);
    const bg = this.add.graphics();
    const bdraw = (enabled, hover) => {
      bg.clear();
      bg.fillStyle(enabled ? C_ORANGE : 0x2a2f36, hover && enabled ? 1 : 0.95);
      bg.fillRoundedRect(-65, -22, 130, 44, 22);
    };
    bdraw(false, false);
    const bt = this.add.text(0, 0, "DISSOLVE", { font: "bold 15px Arial", color: "#0a1208" }).setOrigin(0.5);
    btn.add([bg, bt]);
    btn.setSize(130, 44);
    btn.on("pointerover", () => { if (this._arrangeReady) { bdraw(true, true); btn.setScale(1.03); } });
    btn.on("pointerout", () => { bdraw(this._arrangeReady, false); btn.setScale(1); });
    btn.on("pointerdown", () => { if (this._arrangeReady) this.onArrangePressed(config); });
    this.arrangeButton = { c: btn, draw: bdraw };
    this.roundElements.push(btn);
    this.disableArrangeButton();
    this.setupDragEvents();
  }

  enableArrangeButton() { this._arrangeReady = true; this.arrangeButton.draw(true, false); this.arrangeButton.c.setInteractive({ useHandCursor: true }); }
  disableArrangeButton() { this._arrangeReady = false; this.arrangeButton.draw(false, false); this.arrangeButton.c.disableInteractive(); }

  setupDragEvents() {
    if (this._dragEventsBound) return;
    this._dragEventsBound = true;
    this.input.on("dragstart", (pointer, obj) => {
      if (!this.cartridges.find((b) => b.container === obj) || this.inputLocked) return;
      obj.setDepth(90);
      this.tweens.add({ targets: obj, scale: 1.1, duration: 100 });
      const prevSlot = obj.getData("placedIn");
      if (prevSlot) {
        this.slotContents[prevSlot] = (this.slotContents[prevSlot] || []).filter((b) => b.container !== obj);
        obj.setData("placedIn", null);
        this._drawSlotPlaceholder(prevSlot);
        this.updateArrangeButtonState();
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
      this.updateArrangeButtonState();
    } else {
      const home = obj.getData("home");
      this.tweens.add({ targets: obj, x: home.x, y: home.y, duration: 250, ease: "Back.easeOut" });
    }
  }

  updateArrangeButtonState() {
    const allFilled = Object.keys(this.slotDefs).every((id) => (this.slotContents[id] || []).length > 0);
    if (allFilled) this.enableArrangeButton(); else this.disableArrangeButton();
  }

  // Round 12's line ("double area = <slot:width> * <slot:height>;") has
  // TWO slot markers on one line — a pattern L71's precedent (this
  // lifecycle's origin) never needed. Substitute ALL markers per line,
  // not just the first (the same bug class fixed in L73's
  // buildProgramItems).
  _substituteSkeleton(config) {
    return config.source.split("\n").map((line) => {
      const slotMatches = [...line.matchAll(/<slot:(\w+)>/g)];
      if (!slotMatches.length) return line;
      let text = line;
      slotMatches.forEach((sm) => {
        const slotId = sm[1];
        const code = this.slotContents[slotId] && this.slotContents[slotId][0] ? this.slotContents[slotId][0].container.getData("code") : "";
        text = text.split(`<slot:${slotId}>`).join(code);
      });
      return text;
    });
  }

  _shouldShowPostMissionNote() { return true; }

  async onArrangePressed(config) {
    this.inputLocked = true;
    this.disableArrangeButton();
    this.roundAttempts++;
    const timeMs0 = this.time.now;

    const usedCodes = Object.keys(this.slotDefs).map((id) => this.slotContents[id][0].container.getData("code"));
    const usedTags = Object.keys(this.slotDefs).map((id) => this.slotContents[id][0].container.getData("tag"));

    const test = config.tests[0];
    this.wipeSlate();
    this.updateResultRow(null);
    this.clearCrucible();

    const statements = this._substituteSkeleton(config);
    const vars = {};
    this._printedLines = [];
    const runResult = await this.runStatements(statements, vars);
    if (!this._alive) return;

    let pass = runResult.ok;
    if (pass && test.expectedOutput !== undefined) {
      const output = this._printedLines.join("⏎");
      pass = output === test.expectedOutput;
    }
    this.createFloatingText(470, 155, pass ? "✓" : "✗", pass ? HEX_GREEN_BRIGHT : HEX_RED, "bold 23px Arial", 900);

    const timeMs = Math.round(this.time.now - timeMs0);
    const failTag = usedTags.find((t) => t);
    this.logAttempt(config, pass, usedCodes.join(" | "), pass ? null : failTag, timeMs);

    if (pass) {
      this.updateScore(this.scoreForAttempt(timeMs));
      this.updateCombo(true);
      if (this.roundAttempts === 1) this.correctFirstTry++;
      this.totalTime += timeMs;
      if (config.postMissionNote && this._shouldShowPostMissionNote(config)) await this.showBitFeedback(config.postMissionNote);
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
      await this.showBitFeedback(MISCONCEPTION_FEEDBACK[failTag] || config.revealNote || "The crucible shows exactly what your code produced — compare it against the mission and adjust.");
      if (!this._alive) return;
      this.inputLocked = false;
      this.clearCrucible();
      this.containerValueText.setText("—").setColor(HEX_GRAY);
      this.containerNameText.setText("");
      this.wipeSlate();
      this.updateResultRow(null);
      this.slotContents = {};
      this.renderCommandSkeleton(config);
      this.cartridges.forEach((cart) => {
        cart.container.setData("placedIn", null);
        const home = cart.container.getData("home");
        this.tweens.add({ targets: cart.container, x: home.x, y: home.y, duration: 200 });
      });
      this.disableArrangeButton();
    }
  }

  // ══════════════════════════════════════════════════════════════
  // HONEST EVALUATOR — Integer.parseInt (L71's rule: optional leading
  // '-', digits, nothing else — no dots, ever) and Double.parseDouble
  // (extends it: optional leading sign, digits/dot in any legal
  // arrangement, at most ONE dot), left-to-right +, -, *, / arithmetic
  // with correct precedence and left-to-right associativity (an
  // ITERATIVE accumulator per tier, not a single-split-then-recurse —
  // see the header comment for why), outer-parenthesis stripping,
  // printf %.Nf formatting, and the wrapper-class/type-mismatch
  // compile checks.
  // ══════════════════════════════════════════════════════════════

  isValidIntegerString(str) {
    return /^-?[0-9]+$/.test(str);
  }

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

  /** Splits on EVERY top-level '+'/'-' into a flat {op, text}[] list
   * (op is null for the first segment). An ITERATIVE accumulator
   * (not a single split + recurse) so chains stay left-to-right. */
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

  /** Same iterative approach for '*'/'/'. */
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
          accValue = String(accValue) + String(partVal);
          accIsString = true;
        } else {
          const numVal = op === "-" ? -Number(partVal) : Number(partVal);
          accValue = Number(accValue) + numVal;
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
          if (op === "*") accValue = accValue * Number(r.value);
          else accValue = bothInt ? Math.trunc(accValue / Number(r.value)) : accValue / Number(r.value);
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
      const outcome = await this.runConversionChoreography(strVal);
      if (!outcome.ok) { this.updateResultRow("crash"); return { ok: false, crash: "nfe" }; }
      this.updateResultRow("double");
      return { ok: true, value: outcome.value, type: "double" };
    }

    const parseIntMatch = t.match(/^Integer\.parseInt\((.+)\)$/);
    if (parseIntMatch) {
      const argRes = await this.resolveExpr(parseIntMatch[1].trim(), vars);
      if (!argRes.ok) return argRes;
      const strVal = String(argRes.value);
      if (!this.isValidIntegerString(strVal)) {
        await this.showParseIntBareNFE(strVal);
        return { ok: false, crash: "nfe" };
      }
      this.updateResultRow("int");
      return { ok: true, value: parseInt(strVal, 10), type: "int" };
    }

    // A static/instance call that isn't one of the recognized forms
    // above — e.g. double.parseDouble(...) (primitive has no methods),
    // int.parseInt(...), or a bare String's non-existent method.
    const staticCallMatch = t.match(/^(\w+)\.(\w+)\(/);
    if (staticCallMatch) {
      this.showCompileErrorStamp();
      return { ok: false, crash: "compile" };
    }

    if (/^".*"$/.test(t)) return { ok: true, value: t.slice(1, -1), type: "String" };
    if (/^[+-]?\d+\.\d+$/.test(t)) return { ok: true, value: parseFloat(t), type: "double" };
    if (/^[+-]?\d+$/.test(t)) return { ok: true, value: parseInt(t, 10), type: "int" };

    if (vars[t] !== undefined) return { ok: true, value: vars[t].value, type: vars[t].type };

    return { ok: false, crash: "eval" };
  }

  /** A bare Integer.parseInt(...) NFE that happens OUTSIDE the
   * contrast-furnace reveal (e.g. inside a command mission's
   * distractor cartridge) — no silhouette theatrics, just an honest
   * crash banner on the crucible's own stage, matching how every
   * other wrong build reports its failure. */
  async showParseIntBareNFE(strVal) {
    this.updateResultRow("crash");
    this.screenShake(0.005, 220);
    const stamp = this.add.text(CRUCIBLE_CX, 150, "NumberFormatException", { font: "bold 16px Courier New", color: HEX_RED }).setOrigin(0.5).setDepth(30).setAlpha(0);
    this.roundElements.push(stamp);
    this.tweens.add({ targets: stamp, alpha: 1, duration: 150 });
    await this.delay(700);
    if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 200, onComplete: () => stamp.destroy() });
  }

  async execStatement(line, vars) {
    const declVar = line.match(/^(int|double|String)\s+(\w+)\s*=\s*(.*);$/);
    if (declVar) {
      const varType = declVar[1], name = declVar[2], rhs = declVar[3].trim();
      const r = await this.resolveExpr(rhs, vars);
      if (!r.ok) return r;
      if (varType === "double" && r.type === "String") {
        this.showCompileErrorStamp();
        return { ok: false, crash: "compile" };
      }
      if (varType === "int" && r.type !== "int") {
        this.showCompileErrorStamp();
        return { ok: false, crash: "compile" };
      }
      if (varType === "String" && r.type !== "String") {
        this.showCompileErrorStamp();
        return { ok: false, crash: "compile" };
      }
      vars[name] = { value: r.value, type: varType, kind: "scalar" };
      return { ok: true };
    }

    const printMatch = line.match(/^System\.out\.println\((.*)\);$/);
    if (printMatch) {
      const r = await this.resolveExpr(printMatch[1].trim(), vars);
      if (!r.ok) return r;
      if (!this._printedLines) this._printedLines = [];
      this._printedLines.push(this._javaToString(r.value, r.type));
      return { ok: true };
    }

    const printfMatch = line.match(/^System\.out\.printf\((.*)\);$/);
    if (printfMatch) {
      const parts = this._splitTopArgs(printfMatch[1].trim());
      let fmt = parts[0].replace(/^"(.*)"$/, "$1");
      for (let i = 1; i < parts.length; i++) {
        const r = await this.resolveExpr(parts[i].trim(), vars);
        if (!r.ok) return r;
        const specMatch = fmt.match(/%\.(\d+)f/);
        if (specMatch) fmt = fmt.replace(/%\.(\d+)f/, Number(r.value).toFixed(parseInt(specMatch[1], 10)));
      }
      fmt = fmt.replace(/%n/g, "");
      if (!this._printedLines) this._printedLines = [];
      this._printedLines.push(fmt);
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
      console.warn("Level74Scene: /api/wellbeing/predict-struggle unreachable, skipping behavioral signal for this level:", e);
    }
  }

  advanceRound() {
    if (this.currentRound === 2) this.runBehavioralCheck();
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
      this.clearCrucible();
      this.wipeSlate();
      this.vesselLiquidGfx.clear();
      this.dimFurnaceSilhouette();
      const motes = this.ambient;
      this.ambient = null;
      (motes || []).forEach((m) => this.tweens.add({ targets: m, alpha: 0, duration: 1200 }));

      const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
      this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });
      const title = this.add.text(640, 240, "CRUCIBLE COLD", { font: "bold 36px Georgia", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
      this.tweens.add({ targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut", onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }) });
      this.add.text(640, 310, `Score: ${this.score}`, { font: "21px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
      this.add.text(640, 350, `Rounds Completed: ${this.currentRound} / 12`, { font: "18px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);
      this._makeButton(525, 420, "REHEAT THE CRUCIBLE", 200, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
      this._makeButton(755, 420, "RETURN TO MENU", 200, 50, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.start("MenuScene"));
    })();
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearRound();
    this.hideBubble();

    try { GameManager.completeLevel(73, Math.round((this.correctFirstTry / 12) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("double_parseDouble_schema"); } catch (_) {}
    try {
      localStorage.setItem("level74_results", JSON.stringify({
        level: 74, concept: "double_parseDouble", phase: "accretion",
        score: this.score, accuracy: this.correctFirstTry / 12, avgTime: this.totalTime / 12,
        comboMax: this.maxCombo, stars: this._starRating(), livesRemaining: this.lives,
        attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.crucibleFinale().then(() => { if (this._alive) this.showScoreTally(); });
  }

  async crucibleFinale() {
    const vcx0 = VESSEL_X0 + 2, vcx1 = VESSEL_X1 - 2;
    const state = { h: 0 };
    await new Promise((res) => {
      this.tweens.add({
        targets: state, h: VESSEL_Y1 - VESSEL_Y0 - 8, duration: 700, ease: "Sine.easeOut",
        onUpdate: () => {
          this.vesselLiquidGfx.clear();
          this.vesselLiquidGfx.fillStyle(C_GOLD, 0.4);
          this.vesselLiquidGfx.fillRoundedRect(vcx0, VESSEL_Y1 - 6 - state.h, vcx1 - vcx0, state.h, 4);
        },
        onComplete: res,
      });
    });
    for (let i = 0; i < 6; i++) {
      const drop = this.add.circle(vcx0 + Phaser.Math.Between(0, vcx1 - vcx0), VESSEL_Y0, 2, C_GOLD, 0.7).setDepth(21);
      this.tweens.add({ targets: drop, y: drop.y + 40, alpha: 0, duration: 500, delay: i * 80, onComplete: () => drop.destroy() });
    }
    this.tweens.add({ targets: this._balanceBeam, angle: 0, duration: 500 });
    if (this._furnaceSilGfx) this.tweens.add({ targets: this._furnaceSilGfx, alpha: 0.5, duration: 300, yoyo: true, repeat: 2 });
    this.createConfetti(CRUCIBLE_CX, 370, 40);
    await this.delay(1600);
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
    panel.fillStyle(0x0c0818, 1);
    panel.fillRoundedRect(360, 150, 560, 420, 16);
    panel.lineStyle(2, C_ORANGE, 1);
    panel.strokeRoundedRect(360, 150, 560, 420, 16);

    const title = this.add.text(640, 190, "CRUCIBLE ACTIVE", { font: "bold 30px Georgia", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(91).setScale(0);
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

    const badge = this.add.container(640, 465).setDepth(91).setAlpha(0);
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillCircle(0, 0, 30);
    bg.lineStyle(3, C_GOLD, 1);
    bg.strokeCircle(0, 0, 30);
    bg.lineStyle(1.2, C_ORANGE, 0.9);
    bg.strokeRect(-8, -10, 16, 18);
    bg.fillStyle(C_ORANGE, 0.5);
    bg.fillRect(-6, -2, 12, 8);
    badge.add(bg);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 0 });
    const badgeLbl = this.add.text(640, 505, "parseDouble() SCHEMA ACQUIRED", { font: "bold 14px Georgia", color: HEX_GOLD }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: badgeLbl, alpha: 1, duration: 300, delay: 0 });

    this._makeButton(500, 545, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(770, 545, "NEXT: The Precision Trials →", 300, 44, { fill: 0x00733a, stroke: C_GREEN_BRIGHT, textColor: "#ffffff" }, () => {
      this.scene.start("MenuScene");
    });
  }

  getComboMultiplierFor(combo) { if (combo >= 5) return 3; if (combo >= 3) return 2; return 1; }

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
