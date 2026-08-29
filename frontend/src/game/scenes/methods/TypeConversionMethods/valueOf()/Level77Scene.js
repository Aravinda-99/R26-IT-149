/**
 * Level 77 — "The Inscription Press" (Type Conversion Wing: Accretion
 * Phase — String.valueOf())
 * ===========================================================================
 * The wing's third and final conversion method, running the OPPOSITE
 * direction from L71/L74's furnace/crucible: number/boolean/char → text,
 * not text → number. The hero visual is a brass letterpress: a typed
 * value (solid bar for int, liquid vial for double, crystal for boolean,
 * ceramic tile for char) enters the input tray, descends into the press,
 * a blank paper strip slides in, the arm THUNKS down and stamps the
 * value's String representation onto the paper, and the strip slides out
 * into a String container. CRITICALLY there is no validation gate — the
 * press never jams, never throws. Every value has a String form.
 *
 * SPEC-DESIGN NOTE (caught during design, before any code was written,
 * via hand-tracing Round 10/11's parseInt/parseInt-on-passed distractors):
 * every prior level's parseInt/parseDouble call sites always passed a
 * genuinely String-typed argument, so the established evaluator (L71-
 * L76) never needed to verify the ARGUMENT's type before running the
 * furnace/crucible choreography — it just blindly stringified whatever
 * value resolveExpr returned. Round 10's `Integer.parseInt(score)`
 * distractor (score is a plain int variable, not a String) exposes that
 * gap for the first time: in real Java, passing an int where a String
 * parameter is expected is a compile-time type mismatch, not something
 * that reaches the furnace at all. Fixed by making parseInt check that
 * its resolved argument's type is actually "String" before proceeding,
 * treating a non-String argument as a compile error. This is a strictly
 * backward-compatible tightening — every previous level's parseInt/
 * parseDouble call sites always used real String arguments already, so
 * the fix changes nothing for them; it only matters here.
 *
 * New evaluator vocabulary beyond L71-L76's cascade:
 *  - String.valueOf(anything) — routes by the resolved argument's type
 *    (int/double/boolean/char/String), NEVER fails, always returns a
 *    String. Drives the press choreography.
 *  - Boolean.toString(boolean) — a second, also-correct route to the
 *    same String-from-boolean result (Round 11).
 *  - char and boolean as first-class literal/value types ('A', true,
 *    false), needed because valueOf must handle them.
 *  - A bare reassignment statement (`x = 99;`, no type keyword) — Round
 *    5's snapshot-independence proof needs to mutate a variable AFTER
 *    valueOf already captured its value.
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
const C_CREAM = 0xe0d6b8, HEX_CREAM = "#e0d6b8";

// Press geometry
const TRAY_X0 = 420, TRAY_X1 = 620, TRAY_Y0 = 190, TRAY_Y1 = 250;
const PRESS_X0 = 380, PRESS_X1 = 660, PRESS_Y0 = 260, PRESS_Y1 = 400;
const COL_L_X = 395, COL_R_X = 645, BEAM_Y = 260;
const BED_X0 = 400, BED_X1 = 640, BED_Y = 380;
const STRIP_X0 = 430, STRIP_X1 = 610, STRIP_Y0 = 400, STRIP_Y1 = 440;
const PRESS_CX = (PRESS_X0 + PRESS_X1) / 2;
const CONT_X = 700, CONT_Y = 420;
// Sibling silhouettes
const FSIL_X = 60, FSIL_Y = 160;
const CSIL_X = 60, CSIL_Y = 310;
// Slate
const SLATE_X = 800, SLATE_Y = 130, SLATE_W = 420, SLATE_H = 300;

const TUTORIAL_KEY = "level77_tutorial_done";

// ══════════════════════════════════════════════════════════════
// ROUND CONFIGURATION
// ══════════════════════════════════════════════════════════════
const ROUNDS = [
  // ── Type A: Inscription Prediction ──
  { round: 1, type: "predict",
    source: 'String s = String.valueOf(100);',
    question: "What is stored in s?", correct: '"100"',
    options: [
      { value: '"100"', tag: null, label: '"100" (String)' },
      { value: "100", tag: "valueOf_returns_number_belief", label: "100 (int)" },
      { value: "error", tag: "valueOf_crashes_on_number_belief", label: "NumberFormatException" },
      { value: "null", tag: "valueOf_returns_null_belief", label: "null" },
    ],
    concept: "basic_valueOf_int" },

  { round: 2, type: "predict",
    source: 'String s = String.valueOf(9.81);',
    question: "What is stored in s?", correct: '"9.81"',
    options: [
      { value: '"9.81"', tag: null, label: '"9.81" (String)' },
      { value: "9.81", tag: "valueOf_returns_number_belief", label: "9.81 (double)" },
      { value: '"9"', tag: "valueOf_truncates_belief", label: '"9" (truncated)' },
      { value: "error", tag: "valueOf_crashes_on_double_belief", label: "Error" },
    ],
    concept: "basic_valueOf_double" },

  { round: 3, type: "predict",
    source: 'String s = String.valueOf(false);',
    question: "What is stored in s?", correct: '"false"',
    options: [
      { value: '"false"', tag: null, label: '"false" (String)' },
      { value: '"0"', tag: "boolean_is_zero_belief", label: '"0"' },
      { value: "false", tag: "valueOf_returns_boolean_belief", label: "false (boolean)" },
      { value: '"False"', tag: "boolean_valueOf_caps_belief", label: '"False" (capitalized)' },
    ],
    revealNote: "Booleans stamp as their lowercase word: 'false', not '0', not 'False'. Java's boolean-to-String is always lowercase.",
    concept: "basic_valueOf_boolean" },

  // ── Type B: Universality & Direction Probes ──
  { round: 4, type: "predict",
    source: "String s = String.valueOf('A');",
    question: "What is stored in s?", correct: '"A"',
    options: [
      { value: '"A"', tag: null, label: '"A" (String)' },
      { value: "65", tag: "char_valueOf_ascii_belief", label: "65 (ASCII code)" },
      { value: '"\'A\'"', tag: "valueOf_includes_quotes_belief", label: "\"'A'\" (with quotes)" },
      { value: "error", tag: "valueOf_rejects_char_belief", label: "Error" },
    ],
    revealNote: "char 'A' stamps as 'A' — the character itself, not its ASCII code (65). valueOf gives the REPRESENTATION, not the encoding.",
    concept: "valueOf_char" },

  { round: 5, type: "trace",
    source: 'int x = 10;\nString s = String.valueOf(x);\nx = 99;\nSystem.out.println(s);',
    question: "What prints?", correct: '"10"',
    options: [
      { value: '"10"', tag: null, label: "10" },
      { value: '"99"', tag: "valueOf_is_live_view_belief", label: "99" },
      { value: "error", tag: "valueOf_after_change_error_belief", label: "Error" },
      { value: '"x"', tag: "valueOf_prints_name_belief", label: "x" },
    ],
    revealNote: "valueOf captures a SNAPSHOT — the String was stamped when x was 10. Changing x to 99 afterward doesn't rewrite the strip. Same snapshot independence as Arrays.toString.",
    concept: "valueOf_snapshot" },

  { round: 6, type: "predict",
    source: 'String s = String.valueOf("hello");',
    question: "What is stored in s?", correct: '"hello"',
    options: [
      { value: '"hello"', tag: null, label: '"hello" (same String)' },
      { value: "error", tag: "valueOf_on_string_crashes_belief", label: "Error — already a String!" },
      { value: "null", tag: "valueOf_string_null_belief", label: "null" },
      { value: '"String: hello"', tag: "valueOf_adds_prefix_belief", label: '"String: hello"' },
    ],
    revealNote: "valueOf on a String returns... the same String. It's a no-op — already text. The press stamps text onto text: the same text. No error, no change. It's harmless, just unnecessary.",
    concept: "valueOf_on_string" },

  { round: 7, type: "predict",
    source: 'String s = string.valueOf(42);',
    question: "What happens?", correct: "compile_error",
    options: [
      { value: "compile_error", tag: null, label: "COMPILE ERROR — string is not a class" },
      { value: '"42"', tag: "string_class_lowercase_belief", label: 's = "42"' },
      { value: "42", tag: "valueOf_returns_number_belief", label: "42" },
      { value: "error", tag: "runtime_vs_compile_confusion", label: "Runtime error" },
    ],
    revealNote: "String with a capital S — the class name. 'string' (lowercase) doesn't exist in Java. Same pattern as Integer/int and Double/double: the class name is capitalized.",
    concept: "wrapper_class_capitalization" },

  // ── Type C: Expressions with valueOf ──
  { round: 8, type: "trace",
    source: 'int a = 5;\nString s = String.valueOf(a) + String.valueOf(a);\nSystem.out.println(s);',
    question: "What prints?", correct: '"55"',
    options: [
      { value: '"55"', tag: null, label: "55" },
      { value: "10", tag: "valueOf_keeps_as_number_belief", label: "10" },
      { value: '"5 5"', tag: "valueOf_adds_space_belief", label: "5 5" },
      { value: "error", tag: "double_valueOf_crashes_belief", label: "Error" },
    ],
    revealNote: "valueOf(5) + valueOf(5) = '5' + '5' = '55' — String CONCATENATION, not addition. Both operands are now Strings; + means glue. This is the REVERSE of the parseInt lesson: convert to String, and + becomes concat.",
    concept: "valueOf_then_concat" },

  { round: 9, type: "trace",
    source: 'double d = 2.5;\nString label = "Value: " + String.valueOf(d);\nSystem.out.println(label);',
    question: "What prints?", correct: "Value: 2.5",
    options: [
      { value: "Value: 2.5", tag: null },
      { value: "Value: 2", tag: "valueOf_truncates_belief" },
      { value: "Value: d", tag: "valueOf_prints_name_belief" },
      { value: "error", tag: "concat_with_valueOf_error_belief", label: "Error" },
    ],
    revealNote: "valueOf(2.5) → '2.5'; 'Value: ' + '2.5' → 'Value: 2.5'. Note: 'Value: ' + d (without valueOf) would produce the SAME result — println already converts for concatenation. valueOf makes the intent EXPLICIT.",
    concept: "valueOf_in_concat" },

  // ── Type D: Scribe Command ──
  { round: 10, type: "command",
    source: 'int score = 95;\nString msg = "Score: " + <slot:convert>;\nSystem.out.println(msg);',
    mission: "Convert the score to a String for the message. Expected: Score: 95",
    slots: [{ id: "convert", hint: "number to text" }],
    cartridges: [
      { code: "String.valueOf(score)", correct: true },
      { code: "score", correct: true, alsoCorrect: true },
      { code: "Integer.parseInt(score)", tag: "valueOf_is_parse_belief" },
      { code: "string.valueOf(score)", tag: "string_class_lowercase_belief" },
    ],
    tests: [{ expectedOutput: "Score: 95" }],
    concept: "command_basic_valueOf" },

  { round: 11, type: "command",
    source: 'boolean passed = true;\nString result = <slot:convert>;\nSystem.out.println("Passed: " + result);',
    mission: "Convert the boolean to a String. Expected: Passed: true",
    slots: [{ id: "convert", hint: "boolean to text" }],
    cartridges: [
      { code: "String.valueOf(passed)", correct: true },
      { code: "passed", tag: "implicit_boolean_belief" },
      { code: "Boolean.toString(passed)", correct: true, alsoCorrect: true },
      { code: "Integer.parseInt(passed)", tag: "valueOf_is_parse_belief" },
    ],
    tests: [{ expectedOutput: "Passed: true" }],
    concept: "command_boolean_valueOf" },

  { round: 12, type: "command",
    source: 'int a = 10;\nint b = 20;\nString digitConcat = <slot:concat>;\nint mathSum = a + b;\nSystem.out.println("Digits: " + digitConcat);\nSystem.out.println("Math: " + mathSum);',
    mission: "Produce BOTH the digit-concatenation ('1020') and the mathematical sum (30).\nDigits: 1020\nMath: 30",
    slots: [{ id: "concat", hint: "concatenate as text (not add!)" }],
    cartridges: [
      { code: "String.valueOf(a) + String.valueOf(b)", correct: true },
      { code: "a + b", tag: "concat_is_addition_belief" },
      { code: '"" + a + b', correct: true, alsoCorrect: true },
      { code: "String.valueOf(a + b)", tag: "valueOf_on_sum_belief" },
    ],
    tests: [{ expectedOutput: "Digits: 1020⏎Math: 30" }],
    postMissionNote: "Bit (setting down the composing stick with a satisfied click): 'The conversion triangle, complete in one program. valueOf turns numbers into text for concatenation; raw + keeps them as numbers for math. Same values, same operator, different types, different results. The press reverses the furnace; the furnace reverses the press. You hold ALL THREE instruments now, Scribe. The wing seals at dawn.'",
    concept: "command_contrast_final" },
];

const MISCONCEPTION_FEEDBACK = {
  valueOf_crashes_on_number_belief: "The press NEVER jams — valueOf accepts any type. No validation gate, no NFE. Every value has a String form.",
  valueOf_crashes_on_double_belief: "The press NEVER jams — valueOf accepts any type, including every double. No validation, no crash.",
  valueOf_rejects_char_belief: "The press NEVER jams — chars stamp cleanly too. No validation gate for any type.",
  valueOf_returns_number_belief: "valueOf returns a STRING — the result is text, not the original number. The strip is paper; the bar is gone.",
  valueOf_returns_boolean_belief: "valueOf returns a STRING — 'false' is text, not the boolean false. Characters on paper.",
  valueOf_returns_null_belief: "valueOf on a valid value never returns null — it stamps the value's real representation.",
  valueOf_is_parse_belief: "valueOf goes in the OPPOSITE direction from parseInt. parseInt: String → int (and needs a String argument). valueOf: any value → String. They're reverses, not synonyms — and parseInt can't even accept a non-String argument.",
  valueOf_on_string_crashes_belief: "valueOf on a String returns the same String — harmless no-op. Already text; stamping text on text gives the same text.",
  valueOf_string_null_belief: "valueOf on a String is a no-op, not null — it returns the identical text unchanged.",
  valueOf_adds_prefix_belief: "valueOf adds nothing — it stamps exactly the value's natural representation. No prefixes, no extra words.",
  string_class_lowercase_belief: "String with a capital S — it's a class name. 'string' (lowercase) doesn't exist in Java. Same rule as Integer and Double.",
  valueOf_instance_call_belief: "String.valueOf — static, on the class. Not value.valueOf() or 42.valueOf(). The press belongs to String.",
  valueOf_is_live_view_belief: "The strip was stamped when x was 10 — a snapshot. Changing x afterward doesn't rewrite old paper.",
  valueOf_after_change_error_belief: "Changing x after the stamp causes no error — the String s is already independent, sealed paper.",
  valueOf_prints_name_belief: "valueOf reads the VALUE of the variable, not its NAME. The press stamps what the variable holds, not the identifier text.",
  valueOf_truncates_belief: "valueOf preserves the full representation — every decimal digit stamps intact.",
  valueOf_includes_quotes_belief: "The quotes are Java SOURCE CODE syntax — the String itself doesn't contain them. 'A' the String has one character: A.",
  char_valueOf_ascii_belief: "valueOf stamps the CHARACTER, not its ASCII code. 'A' becomes \"A\", not \"65\".",
  boolean_is_zero_belief: "Java booleans are 'true' and 'false', not 1 and 0. valueOf stamps the word.",
  boolean_valueOf_caps_belief: "Java's boolean-to-String is always LOWERCASE: 'true' and 'false', never 'True' or 'False'.",
  valueOf_keeps_as_number_belief: "After valueOf, both operands are Strings — + means CONCAT ('55'), not addition (10).",
  double_valueOf_crashes_belief: "Concatenating two valueOf results never crashes — both sides are ordinary Strings by then.",
  concat_with_valueOf_error_belief: "String + String concatenation never crashes — 'Value: ' + '2.5' glues cleanly into 'Value: 2.5'.",
  implicit_boolean_belief: "boolean can't auto-assign to String — you need String.valueOf(passed) or Boolean.toString(passed) to make the conversion explicit.",
  concat_is_addition_belief: "a + b on two ints = 30 (addition). For concatenation, convert FIRST: valueOf(a) + valueOf(b) = '1020'.",
  valueOf_on_sum_belief: "valueOf(a + b) converts the SUM (30) to '30'. For digit concat ('1020'), convert each SEPARATELY: valueOf(a) + valueOf(b).",
  runtime_vs_compile_confusion: "A wrong class name is caught at COMPILE time, before the program ever runs — not a runtime error.",
  timeout: "Reread the source carefully — trace it against the press.",
};

export class Level77Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level77Scene" });
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
    this.firstGateAnnotationShown = false;
    this.firstConsumeAnnotationShown = false;
  }

  preload() {}

  create() {
    this._alive = true;
    this.createParticleTexture();
    this.createBackground();
    this.createRoomInterior();
    this.createRoomFloor();
    this.createParticles();
    this.createInscriptionPress();
    this.createScribesSlate();
    this.createSourceDisplay();
    this.createHUD();
    addTutorialReplayButton(this, W, this.lifeIcons[4].x, this.lifeIcons[0].y);
    this.createExpressionMonitor();
    this.createBit();
    this.checkTutorial();
  }

  update(time, delta) {
    this.updateParticles(time, delta);
    this.updateInkwellRipple(time);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // SETUP — THE INSCRIPTION ROOM INTERIOR
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l77_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l77_dot", 8, 8);
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

    // Conversion triangle diagram
    g.lineStyle(2, C_COPPER, 0.5);
    g.strokeRect(300, 40, 440, 110);
    const triTop = { x: 520, y: 55 }, triL = { x: 440, y: 130 }, triR = { x: 600, y: 130 };
    g.lineStyle(1, C_CREAM, 0.3);
    g.lineBetween(triTop.x, triTop.y, triL.x, triL.y);
    g.lineBetween(triTop.x, triTop.y, triR.x, triR.y);
    g.lineStyle(1, C_CREAM, 0.25);
    g.lineBetween(triL.x, triL.y, triR.x, triR.y);
    this.add.text(triTop.x, triTop.y - 10, "String", { font: "bold 10px Georgia", color: HEX_CREAM }).setOrigin(0.5).setAlpha(0.5).setDepth(2);
    this.add.text(triL.x - 14, triL.y + 8, "int", { font: "bold 10px Georgia", color: HEX_GOLD }).setOrigin(0.5).setAlpha(0.5).setDepth(2);
    this.add.text(triR.x + 18, triR.y + 8, "double", { font: "bold 10px Georgia", color: HEX_ORANGE }).setOrigin(0.5).setAlpha(0.5).setDepth(2);
    this.add.text((triTop.x + triL.x) / 2 - 18, (triTop.y + triL.y) / 2, "parseInt", { font: "8px Courier New", color: HEX_GOLD }).setOrigin(0.5).setAlpha(0.4).setDepth(2);
    this.add.text((triTop.x + triR.x) / 2 + 22, (triTop.y + triR.y) / 2, "parseDouble", { font: "8px Courier New", color: HEX_ORANGE }).setOrigin(0.5).setAlpha(0.4).setDepth(2);
    this.add.text(triTop.x, triL.y + 22, "valueOf ↑", { font: "bold 8px Courier New", color: HEX_CREAM }).setOrigin(0.5).setAlpha(0.45).setDepth(2);
    this._triangleGfx = g;

    // Sibling silhouettes
    const fg = this.add.graphics().setDepth(2).setAlpha(0.2);
    fg.lineStyle(1.2, C_COPPER, 1);
    fg.strokeTriangle(FSIL_X - 20, FSIL_Y + 20, FSIL_X + 20, FSIL_Y + 20, FSIL_X, FSIL_Y - 10);
    fg.strokeRect(FSIL_X - 15, FSIL_Y + 20, 30, 30);
    this.add.text(FSIL_X, FSIL_Y + 58, "FURNACE", { font: "8px Georgia", color: HEX_COPPER }).setOrigin(0.5).setAlpha(0.3).setDepth(3);

    const cg = this.add.graphics().setDepth(2).setAlpha(0.2);
    cg.lineStyle(1.2, C_ORANGE, 1);
    cg.strokeRoundedRect(CSIL_X - 18, CSIL_Y, 36, 40, 4);
    this.add.text(CSIL_X, CSIL_Y + 48, "CRUCIBLE", { font: "8px Georgia", color: HEX_ORANGE }).setOrigin(0.5).setAlpha(0.3).setDepth(3);

    // Paper-stock cabinet
    const pg = this.add.graphics().setDepth(2).setAlpha(0.5);
    pg.lineStyle(1.5, C_COPPER, 0.8);
    pg.strokeRect(1120, 100, 100, 140);
    for (let i = 0; i < 4; i++) {
      const sy = 115 + i * 30;
      pg.fillStyle(C_CREAM, 0.3);
      pg.fillRect(1130, sy, 80, 16);
      pg.lineStyle(1, C_COPPER, 0.5);
      pg.strokeRect(1130, sy, 80, 16);
    }

    // Inkwell
    const ig = this.add.graphics().setDepth(2);
    ig.lineStyle(1.5, C_COPPER, 0.7);
    ig.strokeCircle(1150, 300, 12);
    this.inkwellPool = this.add.circle(1150, 300, 8, C_INDIGO, 0.6).setDepth(3);

    // Banner
    const bnG = this.add.graphics().setDepth(2);
    bnG.fillStyle(0x0c0818, 1);
    bnG.lineStyle(1, C_CREAM, 0.5);
    bnG.fillRoundedRect(460, 12, 360, 26, 3);
    bnG.strokeRoundedRect(460, 12, 360, 26, 3);
    this.add.text(640, 25, "T H E   I N S C R I P T I O N   P R E S S", { font: "bold 14px Georgia", color: HEX_CREAM }).setOrigin(0.5).setAlpha(0.7).setDepth(3);
  }

  updateInkwellRipple(time) {
    if (!this.inkwellPool) return;
    this.inkwellPool.setScale(1 + Math.sin(time * 0.001) * 0.04);
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
    for (let i = 0; i < 6; i++) {
      const px = Phaser.Math.Between(20, W - 20), py = Phaser.Math.Between(645, 710);
      const scrap = this.add.rectangle(px, py, 10, 6, C_CREAM, 0.05).setDepth(1);
      scrap.setAngle(Phaser.Math.Between(0, 360));
    }
  }

  createParticles() {
    this.ambient = [];
    const colors = [0x3949ab, 0xe0d6b8, 0xb87333];
    for (let i = 0; i < 7; i++) {
      this.ambient.push(this.add.circle(Phaser.Math.Between(0, W), Phaser.Math.Between(230, 630), 1, Phaser.Utils.Array.GetRandom(colors), Phaser.Math.FloatBetween(0.03, 0.05)).setDepth(2));
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
    const p = this.add.particles(x, y, "l77_dot", {
      speed: { min: 80, max: 240 }, angle: { min: 0, max: 360 }, scale: { start: 0.9, end: 0 }, lifespan: 500,
      tint: [C_CREAM, C_GOLD, C_INDIGO, 0xffffff], emitting: false,
    }).setDepth(85);
    p.explode(count);
    this.time.delayedCall(900, () => p.destroy());
  }

  screenShake(intensity = 0.004, duration = 150) {
    this.cameras.main.shake(duration, intensity);
  }

  // ══════════════════════════════════════════════════════════════
  // THE INSCRIPTION PRESS (hero visual) — reverse of L71/L74's
  // furnace/crucible: no validation gate, the press stamps anything.
  // ══════════════════════════════════════════════════════════════

  createInscriptionPress() {
    const g = this.add.graphics().setDepth(10);

    // Input tray
    g.lineStyle(3, C_COPPER, 1);
    g.fillStyle(0x0c0818, 0.6);
    g.fillRoundedRect(TRAY_X0, TRAY_Y0, TRAY_X1 - TRAY_X0, TRAY_Y1 - TRAY_Y0, 6);
    g.strokeRoundedRect(TRAY_X0, TRAY_Y0, TRAY_X1 - TRAY_X0, TRAY_Y1 - TRAY_Y0, 6);
    this.add.text(PRESS_CX, TRAY_Y0 - 12, "INPUT", { font: "bold 11px Georgia", color: HEX_COPPER }).setOrigin(0.5).setDepth(11);

    // Press frame
    g.fillStyle(C_COPPER, 1);
    g.fillRect(COL_L_X, PRESS_Y0, 20, 140);
    g.fillRect(COL_R_X, PRESS_Y0, 20, 140);
    g.fillStyle(0x1a0e05, 1);
    g.lineStyle(2, C_COPPER, 1);
    g.fillRect(PRESS_X0, BEAM_Y, PRESS_X1 - PRESS_X0, 16);
    g.strokeRect(PRESS_X0, BEAM_Y, PRESS_X1 - PRESS_X0, 16);

    // Press bed
    g.fillStyle(0x1a0e05, 1);
    g.lineStyle(2, C_COPPER, 1);
    g.fillRoundedRect(BED_X0, BED_Y, BED_X1 - BED_X0, 20, 4);
    g.strokeRoundedRect(BED_X0, BED_Y, BED_X1 - BED_X0, 20, 4);

    // Press arm (movable)
    this.pressArm = this.add.container(PRESS_CX, PRESS_Y0 + 20);
    const armG = this.add.graphics();
    armG.fillStyle(0x1a0e05, 1);
    armG.lineStyle(3, C_COPPER, 1);
    armG.fillRoundedRect(-100, -15, 200, 30, 6);
    armG.strokeRoundedRect(-100, -15, 200, 30, 6);
    armG.fillStyle(C_COPPER, 1);
    armG.fillCircle(0, -20, 8);
    this.pressArm.add(armG);
    this.armTypeface = this.add.text(0, 0, "", { font: "bold 12px Courier New", color: HEX_CREAM }).setOrigin(0.5).setAlpha(0.6).setScale(-1, 1);
    this.pressArm.add(this.armTypeface);

    // String container (output)
    const contG = this.add.graphics().setDepth(11);
    contG.fillStyle(0x0c0818, 0.9);
    contG.lineStyle(2, C_CREAM, 1);
    contG.fillRoundedRect(CONT_X - 45, CONT_Y, 90, 40, 5);
    contG.strokeRoundedRect(CONT_X - 45, CONT_Y, 90, 40, 5);
    this.add.text(CONT_X, CONT_Y - 12, "String", { font: "bold 11px Courier New", color: HEX_CREAM }).setOrigin(0.5).setDepth(12);
    this.containerValueText = this.add.text(CONT_X, CONT_Y + 22, "—", { font: "bold 15px Courier New", color: HEX_GRAY }).setOrigin(0.5).setDepth(12);

    this.pressDynamicLayer = this.add.container(0, 0).setDepth(20);
    this._pressStaticGfx = g;
  }

  clearPress() {
    this.pressDynamicLayer.removeAll(true);
    this.pressArm.y = PRESS_Y0 + 20;
    this.armTypeface.setText("");
  }

  /** Materializes the input value in its type-specific physical form:
   * int=solid bar, double=liquid vial, boolean=crystal, char=ceramic
   * tile — different shapes for different types, reinforcing the type
   * system visually. Returns the container for later animation. */
  async materializeInputValue(value, type) {
    const cx = PRESS_CX, cy = (TRAY_Y0 + TRAY_Y1) / 2;
    const c = this.add.container(cx, cy).setAlpha(0).setScale(0.7);
    const g = this.add.graphics();
    let label = String(value);

    if (type === "int") {
      g.fillStyle(C_GOLD, 1);
      g.lineStyle(1.5, 0x8a6435, 1);
      g.fillRoundedRect(-30, -14, 60, 28, 4);
      g.strokeRoundedRect(-30, -14, 60, 28, 4);
    } else if (type === "double") {
      g.lineStyle(1.5, C_ORANGE, 1);
      g.fillStyle(0x0c0818, 0.5);
      g.fillRoundedRect(-16, -18, 32, 36, 4);
      g.strokeRoundedRect(-16, -18, 32, 36, 4);
      g.fillStyle(C_ORANGE, 0.6);
      g.fillRoundedRect(-14, -4, 28, 18, 3);
    } else if (type === "boolean") {
      const col = value ? 0x42a5f5 : C_RED;
      g.fillStyle(col, 0.85);
      g.lineStyle(1.5, 0xffffff, 0.5);
      const hexPts = [];
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 2;
        hexPts.push({ x: 20 * Math.cos(a), y: 20 * Math.sin(a) });
      }
      g.fillPoints(hexPts, true);
      g.strokePoints(hexPts, true);
    } else if (type === "char") {
      g.fillStyle(C_BLUE_GRAY, 0.85);
      g.lineStyle(1.5, 0xffffff, 0.4);
      g.fillRoundedRect(-16, -16, 32, 32, 3);
      g.strokeRoundedRect(-16, -16, 32, 32, 3);
    } else {
      // String (no-op valueOf) — a small paper card already
      g.fillStyle(C_CREAM, 0.9);
      g.lineStyle(1, 0x8a6435, 1);
      g.fillRoundedRect(-Math.max(24, label.length * 5), -12, Math.max(48, label.length * 10), 24, 3);
      g.strokeRoundedRect(-Math.max(24, label.length * 5), -12, Math.max(48, label.length * 10), 24, 3);
    }
    const txt = this.add.text(0, 0, label, { font: "bold 14px Courier New", color: type === "int" ? "#241a0e" : "#e8eaf6" }).setOrigin(0.5);
    if (txt.width > 56) txt.setFontSize(9);
    c.add([g, txt]);
    this.pressDynamicLayer.add(c);
    this._currentInput = { container: c, value, type, txt };
    this.tweens.add({ targets: c, alpha: 1, scale: 1, duration: 180, ease: "Back.easeOut" });
    await this.delay(200);
    return this._currentInput;
  }

  async slideInputToPress() {
    const input = this._currentInput;
    if (!input) return;
    await new Promise((res) => {
      this.tweens.add({ targets: input.container, y: BED_Y - 20, duration: 250, ease: "Sine.easeIn", onComplete: res });
    });
  }

  async slideInBlankPaper() {
    const strip = this.add.container(STRIP_X1 + 60, (STRIP_Y0 + STRIP_Y1) / 2).setAlpha(0);
    const bg = this.add.graphics();
    bg.fillStyle(C_CREAM, 1);
    bg.lineStyle(1, 0x8a6435, 1);
    bg.fillRoundedRect(-90, -18, 180, 36, 3);
    bg.strokeRoundedRect(-90, -18, 180, 36, 3);
    const txt = this.add.text(0, 0, "", { font: "bold 17px Courier New", color: "#241a0e" }).setOrigin(0.5);
    strip.add([bg, txt]);
    this.pressDynamicLayer.add(strip);
    this._currentStrip = { container: strip, txt, bg };
    this.tweens.add({ targets: strip, alpha: 1, duration: 100 });
    await new Promise((res) => {
      this.tweens.add({ targets: strip, x: (STRIP_X0 + STRIP_X1) / 2, y: BED_Y - 4, duration: 220, ease: "Sine.easeOut", onComplete: res });
    });
  }

  /** THE press arm THUNK — heavy descent, brief shake, ink splash at
   * contact. No validation gate: this always runs, unconditionally. */
  async pressArmDescend(strRepr) {
    this.armTypeface.setText([...strRepr].reverse().join(""));
    const startY = this.pressArm.y;
    await new Promise((res) => {
      this.tweens.add({
        targets: this.pressArm, y: BED_Y - 20, duration: 280, ease: "Cubic.easeIn",
        onComplete: () => { this.screenShake(0.006, 90); res(); },
      });
    });
    for (let i = 0; i < 4; i++) {
      const drop = this.add.circle((STRIP_X0 + STRIP_X1) / 2 + Phaser.Math.Between(-30, 30), BED_Y - 8, 1.5, 0x241a0e, 0.7).setDepth(22);
      this.pressDynamicLayer.add(drop);
      this.tweens.add({ targets: drop, y: drop.y + Phaser.Math.Between(4, 10), alpha: 0, duration: 250, onComplete: () => drop.destroy() });
    }
    return startY;
  }

  stampValue(strRepr) {
    const strip = this._currentStrip;
    if (!strip) return;
    strip.txt.setText(strRepr);
    if (strip.txt.width > 160) strip.txt.setFontSize(11);
    this.tweens.add({ targets: strip.txt, scale: 1.2, duration: 80, yoyo: true });
  }

  async pressArmRise(startY) {
    await new Promise((res) => { this.tweens.add({ targets: this.pressArm, y: startY, duration: 220, ease: "Sine.easeOut", onComplete: res }); });
  }

  async consumeInput() {
    const input = this._currentInput;
    if (!input) return;
    if (!this.firstConsumeAnnotationShown && (input.type === "int" || input.type === "double")) {
      this.firstConsumeAnnotationShown = true;
      this.createAnnotation(PRESS_CX, BED_Y + 40, "the number became text — it's characters now, not a value you can add to", HEX_GRAY);
    }
    await new Promise((res) => {
      this.tweens.add({ targets: input.container, alpha: 0, scale: 0.6, duration: 200, onComplete: () => { input.container.destroy(); res(); } });
    });
    this._currentInput = null;
  }

  async slideStripToContainer(strRepr) {
    const strip = this._currentStrip;
    if (!strip) return;
    await new Promise((res) => {
      this.tweens.add({ targets: strip.container, x: CONT_X, y: CONT_Y + 22, scale: 0.6, alpha: 0, duration: 260, ease: "Sine.easeIn", onComplete: () => { strip.container.destroy(); res(); } });
    });
    this._currentStrip = null;
    this.containerValueText.setText(`"${strRepr}"`).setColor(HEX_CREAM);
    this.tweens.add({ targets: this.containerValueText, scale: 1.15, duration: 90, yoyo: true });
    if (this.containerValueText.width > 90) this.containerValueText.setFontSize(10);
    await this.delay(120);
  }

  showCompileErrorStamp() {
    const stamp = this.add.text(PRESS_CX, 150, "COMPILE ERROR", { font: "bold 18px Arial", color: HEX_RED }).setOrigin(0.5).setDepth(30).setScale(1.3).setAngle(-6).setAlpha(0);
    this.roundElements.push(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 150 });
    this.screenShake(0.004, 120);
    this.time.delayedCall(850, () => { if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 200, onComplete: () => stamp.destroy() }); });
  }

  showNFEStamp() {
    const stamp = this.add.text(PRESS_CX, 150, "NumberFormatException", { font: "bold 15px Courier New", color: HEX_RED }).setOrigin(0.5).setDepth(30).setScale(1.2).setAlpha(0);
    this.roundElements.push(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 150 });
    this.screenShake(0.004, 120);
    this.time.delayedCall(850, () => { if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 200, onComplete: () => stamp.destroy() }); });
  }

  /** The full honest inscription choreography — NO validation gate:
   * every type reaches the paper. This is called for String.valueOf
   * AND Boolean.toString. */
  async runPressChoreography(value, type, strRepr) {
    if (!this.firstGateAnnotationShown) {
      this.firstGateAnnotationShown = true;
      this.createAnnotation(PRESS_CX, TRAY_Y1 + 14, "notice: no gate. the press stamps anything — no inspection, no rejection", HEX_GRAY);
    }
    await this.materializeInputValue(value, type);
    await this.slideInputToPress();
    await this.slideInBlankPaper();
    const startY = await this.pressArmDescend(strRepr);
    this.stampValue(strRepr);
    await this.delay(80);
    await this.pressArmRise(startY);
    await this.consumeInput();
    await this.slideStripToContainer(strRepr);
    return { ok: true, value: strRepr };
  }

  /** The "" + value shortcut (Round 6 tutorial step + command
   * distractor visuals): no press theatrics — the empty strip and the
   * input value simply glue together beside a glowing +. */
  async showConcatAnimation(value, type, strRepr) {
    const leftX = PRESS_CX - 60, rightX = PRESS_CX + 60, cy = BED_Y - 20;
    const emptyStrip = this.add.container(leftX, cy).setAlpha(0);
    const eb = this.add.graphics();
    eb.fillStyle(C_CREAM, 1);
    eb.lineStyle(1, 0x8a6435, 1);
    eb.fillRoundedRect(-20, -12, 40, 24, 3);
    eb.strokeRoundedRect(-20, -12, 40, 24, 3);
    const et = this.add.text(0, 0, '""', { font: "bold 12px Courier New", color: "#241a0e" }).setOrigin(0.5);
    emptyStrip.add([eb, et]);
    this.pressDynamicLayer.add(emptyStrip);
    this.tweens.add({ targets: emptyStrip, alpha: 1, duration: 120 });

    const input = await this.materializeInputValue(value, type);
    await new Promise((res) => { this.tweens.add({ targets: input.container, x: rightX, y: cy, duration: 200, onComplete: res }); });

    const plus = this.add.text(PRESS_CX, cy, "+", { font: "bold 18px Georgia", color: HEX_GOLD }).setOrigin(0.5).setAlpha(0);
    this.pressDynamicLayer.add(plus);
    this.tweens.add({ targets: plus, alpha: 1, scale: 1.3, duration: 120, yoyo: true });
    await this.delay(200);

    et.setText(`"${strRepr}"`);
    if (et.width > 60) et.setFontSize(7);
    this.tweens.add({ targets: [emptyStrip, plus], alpha: 0, duration: 150, delay: 150 });
    this.tweens.add({ targets: input.container, alpha: 0, duration: 150, delay: 150, onComplete: () => input.container.destroy() });
    await this.delay(300);
    plus.destroy();
    emptyStrip.destroy();
    this._currentInput = null;
  }

  // ══════════════════════════════════════════════════════════════
  // SCRIBE'S SLATE
  // ══════════════════════════════════════════════════════════════

  createScribesSlate() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0a0d18, 1);
    g.lineStyle(2, C_INDIGO, 1);
    g.fillRoundedRect(SLATE_X, SLATE_Y, SLATE_W, SLATE_H, 8);
    g.strokeRoundedRect(SLATE_X, SLATE_Y, SLATE_W, SLATE_H, 8);
    this.add.text(SLATE_X + 14, SLATE_Y + 12, "SCRIBE'S SLATE", { font: "bold 12px Georgia", color: HEX_INDIGO }).setDepth(11);

    const pillG = this.add.graphics().setDepth(11);
    pillG.lineStyle(1.2, C_CREAM, 0.7);
    pillG.strokeRoundedRect(SLATE_X + SLATE_W - 168, SLATE_Y + 8, 156, 16, 8);
    this.add.text(SLATE_X + SLATE_W - 90, SLATE_Y + 16, "String (wrapper class)", { font: "bold 9px Courier New", color: HEX_CREAM }).setOrigin(0.5).setDepth(12);

    this.add.text(SLATE_X + 14, SLATE_Y + 30, "number → text", { font: "italic 11px Georgia", color: HEX_CREAM }).setDepth(11);

    this.slateLines = this.add.container(0, 0).setDepth(11);
    this._slateY = SLATE_Y + 52;

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
    if (this._slateY > SLATE_Y + SLATE_H - 46) this._slateY = SLATE_Y + 52;
  }

  chalkEvaluationArrow(value) {
    const t = this.add.text(SLATE_X + 14, this._slateY, `→ ${value}`, { font: "bold 14px Courier New", color: HEX_CREAM }).setAlpha(0);
    this.slateLines.add(t);
    if (t.width > SLATE_W - 28) t.setFontSize(10);
    this.tweens.add({ targets: t, alpha: 1, duration: 140 });
    this._slateY += 22;
    if (this._slateY > SLATE_Y + SLATE_H - 46) this._slateY = SLATE_Y + 52;
  }

  wipeSlate() {
    this.slateLines.removeAll(true);
    this._slateY = SLATE_Y + 52;
  }

  updateResultRow(type) {
    if (type === null || type === undefined) { this.resultText.setText("—").setColor(HEX_GRAY); return; }
    if (type === "crash") { this.resultText.setText("✗ NFE").setColor(HEX_RED); return; }
    if (type === "compile") { this.resultText.setText("✗ COMPILE").setColor(HEX_RED); return; }
    this.resultText.setText(type).setColor(type === "String" ? HEX_CREAM : HEX_GOLD);
  }

  // ══════════════════════════════════════════════════════════════
  // SOURCE DISPLAY & EXPRESSION MONITOR
  // ══════════════════════════════════════════════════════════════

  createSourceDisplay() {
    this.sourceContainer = this.add.container(0, 0).setDepth(15);
  }

  _syntaxTokenize(line) {
    const tokens = [];
    const re = /("(?:[^"\\]|\\.)*"|'.')|(\bimport\b|\bint\b|\bdouble\b|\bboolean\b|\bchar\b|\bString\b|\bnew\b)|(\bInteger\b|\bBoolean\b)|(\.valueOf\b|\.parseInt\b|\.toString\b|\.length\b)|(\bSystem\.out\b)|(\btrue\b|\bfalse\b)|(-?\d+\.\d+|-?\d+)|([(){}\[\];.,=+])/g;
    let last = 0, m;
    const plain = (t) => t && tokens.push({ t, c: "#e0e0e0" });
    while ((m = re.exec(line))) {
      if (m.index > last) plain(line.slice(last, m.index));
      if (m[1]) tokens.push({ t: m[1], c: "#e0d6b8" });
      else if (m[2]) tokens.push({ t: m[2], c: "#1565c0" });
      else if (m[3]) tokens.push({ t: m[3], c: HEX_COPPER });
      else if (m[4]) tokens.push({ t: m[4], c: HEX_CYAN });
      else if (m[5]) tokens.push({ t: m[5], c: "#78909c" });
      else if (m[6]) tokens.push({ t: m[6], c: HEX_CYAN });
      else if (m[7]) tokens.push({ t: m[7], c: HEX_GOLD });
      else if (m[8]) tokens.push({ t: m[8], c: "#78909c" });
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

    this.add.text(20, 14, "THE INSCRIPTION PRESS", { font: "bold 16px Georgia", color: "#b0bec5" }).setDepth(50);
    this.add.text(20, 32, "Accretion Phase — Type Conversion: valueOf()", { font: "12px Arial", color: "#546e7a" }).setDepth(50);

    this.add.text(1060, 8, "SCORE", { font: "11px Arial", color: "#546e7a" }).setDepth(50);
    this.scoreText = this.add.text(1060, 20, "0", { font: "bold 19px Arial", color: "#ffffff" }).setDepth(50);
    this.comboText = this.add.text(1060, 42, "×1", { font: "bold 14px Arial", color: HEX_GOLD }).setDepth(50);

    this.lifeIcons = [];
    for (let i = 0; i < 5; i++) {
      const lg = this.add.graphics({ x: 1150 + i * 20, y: 24 }).setDepth(50);
      lg.fillStyle(C_CREAM, 0.9);
      lg.lineStyle(1, 0x8a6435, 1);
      lg.fillRoundedRect(-6, -5, 12, 10, 2);
      lg.strokeRoundedRect(-6, -5, 12, 10, 2);
      this.lifeIcons.push(lg);
    }
  }

  // ══════════════════════════════════════════════════════════════
  // BIT — INSCRIPTION SCRIBE VARIANT (composing stick, ink-spotted apron)
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
    apron.fillStyle(C_INDIGO, 0.25);
    apron.fillCircle(-6, 2, 1.3);
    apron.fillCircle(4, 8, 1.1);
    apron.fillCircle(-3, 12, 1);
    const goggles = this.add.container(0, -26);
    const gogG = this.add.graphics();
    gogG.lineStyle(1.2, C_CYAN, 0.5);
    gogG.strokeCircle(-6, 3, 5);
    gogG.strokeCircle(6, 3, 5);
    gogG.lineBetween(-1, 3, 1, 3);
    goggles.add(gogG);
    const gloveL = this.add.circle(-16, 10, 4, 0xffffff, 0).setStrokeStyle(1, 0xe8eaf6, 0.7);
    this.composingStick = this.add.container(17, 6);
    const stickG = this.add.graphics();
    stickG.lineStyle(1.3, C_COPPER, 0.9);
    stickG.strokeRect(-5, -8, 10, 4);
    stickG.strokeRect(-5, -3, 10, 4);
    ["S", "t", "r"].forEach((ch, i) => {
      const bt = this.add.text(-3 + i * 3, -6, ch, { font: "5px Courier New", color: HEX_CREAM }).setOrigin(0.5);
      this.composingStick.add(bt);
    });
    this.composingStick.add(stickG);
    c.add([g, apron, eye, pupil, goggles, gloveL, this.composingStick, tip]);
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
    g.lineStyle(1.5, C_CREAM, 1);
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
    await this.bitSay("The Inscription Press, Scribe — the wing's final instrument, running in the OPPOSITE direction. The furnace turned text into ints; the crucible turned text into doubles. The press turns EVERYTHING back into text. Numbers, booleans, characters — every value has a String form, and the press stamps it.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(6500)]); if (!A()) return;
    this.hideBubble();

    this.updateSourceDisplay(['String s = String.valueOf(42);']);
    await this.runPressChoreography(42, "int", "42");
    if (!A()) return;
    await this.bitSay("The int 42 — a solid bar — entered the press and became '42' — a paper strip. The number is now TEXT. You can't add to it, subtract from it, or compare it numerically anymore. It's characters: '4' and '2'. The press reversed the furnace.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(6500)]); if (!A()) return;
    this.hideBubble();
    this.clearPress();
    this.containerValueText.setText("—").setColor(HEX_GRAY);

    this.updateSourceDisplay(['String s = String.valueOf(3.14);']);
    await this.runPressChoreography(3.14, "double", "3.14");
    if (!A()) return;
    await this.bitSay("The crucible's liquid became paper too. 3.14 the double is now '3.14' the String. The decimal point is now just a character, not a separator. valueOf handles doubles, ints, booleans, chars — any type becomes text.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(6500)]); if (!A()) return;
    this.hideBubble();
    this.clearPress();
    this.containerValueText.setText("—").setColor(HEX_GRAY);

    this.updateSourceDisplay(['String s = String.valueOf(true);']);
    await this.runPressChoreography(true, "boolean", "true");
    if (!A()) return;
    await this.bitSay("A boolean: true or false. The press stamps 'true' — lowercase, no quotes in the value, just the word. Every type, every value — the press never refuses.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(6500)]); if (!A()) return;
    this.hideBubble();

    await this.bitSay("Notice what's MISSING: no validation gate. No red spotlights, no gate slam, no NumberFormatException. The furnace and crucible inspected every character because text-to-number can fail. But number-to-text ALWAYS succeeds. Every int, every double, every boolean has a legal String representation. The press never jams.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(6500)]); if (!A()) return;
    this.hideBubble();
    this.clearPress();
    this.containerValueText.setText("—").setColor(HEX_GRAY);

    this.updateSourceDisplay(['String s = "" + 42;']);
    await this.showConcatAnimation(42, "int", "42");
    if (!A()) return;
    await this.bitSay('The shortcut: empty string plus a value. "" + 42 concatenates nothing with the number, producing "42". Same result as valueOf. Both legal; valueOf is EXPLICIT (says "I am converting"), concatenation is IMPLICIT (uses + as glue). Know both; prefer clarity.');
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(6500)]); if (!A()) return;
    this.hideBubble();

    this.clearPress();
    this.wipeSlate();
    this.updateResultRow(null);
    this.updateSourceDisplay([]);
    this.updateExpressionMonitor("");
    this.containerValueText.setText("—").setColor(HEX_GRAY);

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
    this.clearPress();
    this.containerValueText.setText("—").setColor(HEX_GRAY);
    this.roundStartTime = this.time.now;

    if (config.type === "predict" || config.type === "trace") this.setupPredict(config);
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
    g.lineStyle(1, C_CREAM, 0.5);
    g.strokeRoundedRect(-260, -30, 520, 60, 10);
    const badge = this.add.circle(-230, 0, 15, C_CREAM);
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
      draw(C_CREAM);
      const label = opt.label || opt.value;
      const txt = this.add.text(0, 0, label, { font: "bold 13px Courier New", color: "#e8eaf6", wordWrap: { width: w - 20 }, align: "center" }).setOrigin(0.5);
      if (txt.height > h - 6) txt.setFontSize(9);
      c.add([g, txt]);
      c.setSize(w, h);
      c.setInteractive({ useHandCursor: true });
      c.on("pointerover", () => { if (!this.inputLocked) draw(C_GOLD); });
      c.on("pointerout", () => { if (!this.inputLocked) draw(C_CREAM); });
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

    const vars = {};
    this._printedLines = [];
    await this.runStatements(config.source.split("\n"), vars);
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
  // TYPE D — SCRIBE COMMAND
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
        dg.lineStyle(2, highlight ? 0xffab00 : C_CREAM, 0.6);
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
      draw(C_CREAM);
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
      c.on("pointerout", () => { if (!this.inputLocked) draw(C_CREAM); });
      this.cartridges.push({ container: c, def, home });
      this.roundElements.push(c);
    });

    const btn = this.add.container(470, 600).setDepth(42);
    const bg = this.add.graphics();
    const bdraw = (enabled, hover) => {
      bg.clear();
      bg.fillStyle(enabled ? C_CREAM : 0x2a2f36, hover && enabled ? 1 : 0.95);
      bg.fillRoundedRect(-65, -22, 130, 44, 22);
    };
    bdraw(false, false);
    const bt = this.add.text(0, 0, "STAMP", { font: "bold 15px Arial", color: "#0a1208" }).setOrigin(0.5);
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

  _substituteSkeleton(config) {
    return config.source.split("\n").map((line) => {
      const slotM = line.match(/<slot:(\w+)>/);
      if (slotM) {
        const code = this.slotContents[slotM[1]] && this.slotContents[slotM[1]][0] ? this.slotContents[slotM[1]][0].container.getData("code") : "";
        return line.replace(/<slot:\w+>/, code);
      }
      return line;
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
    this.clearPress();

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
      await this.showBitFeedback(MISCONCEPTION_FEEDBACK[failTag] || config.revealNote || "The press shows exactly what your code produced — compare it against the mission and adjust.");
      if (!this._alive) return;
      this.inputLocked = false;
      this.clearPress();
      this.containerValueText.setText("—").setColor(HEX_GRAY);
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
  // HONEST EVALUATOR — String.valueOf (routes by the resolved
  // argument's type: int/double/boolean/char/String — NEVER fails,
  // always returns a String), Boolean.toString (a second route to the
  // same boolean-to-String result), Integer.parseInt (reused from
  // L71's rule, but now checking the argument is genuinely String-
  // typed before running — see header comment), iterative left-to-
  // right +/- with int/double type promotion, and a bare reassignment
  // statement (no type keyword) for Round 5's snapshot proof.
  // ══════════════════════════════════════════════════════════════

  isValidIntegerString(str) {
    return /^-?[0-9]+$/.test(str);
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

  _javaToString(value, type) {
    if (type === "double") return Number.isInteger(value) ? `${value}.0` : String(value);
    return String(value);
  }

  async resolveExpr(expr, vars) {
    const t = expr.trim();

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
          const accStr = accIsString ? String(accValue) : this._javaToString(accValue, accType);
          const partStr = partType === "String" ? String(partVal) : this._javaToString(partVal, partType);
          accValue = accStr + partStr;
          accIsString = true;
        } else {
          const numVal = op === "-" ? -Number(partVal) : Number(partVal);
          accValue = Number(accValue) + numVal;
          accType = (accType === "double" || partType === "double") ? "double" : "int";
        }
      }
      return { ok: true, value: accValue, type: accIsString ? "String" : accType };
    }

    const valueOfMatch = t.match(/^String\.valueOf\((.+)\)$/);
    if (valueOfMatch) {
      const argRes = await this.resolveExpr(valueOfMatch[1].trim(), vars);
      if (!argRes.ok) return argRes;
      const strRepr = this._javaToString(argRes.value, argRes.type);
      await this.runPressChoreography(argRes.value, argRes.type, strRepr);
      this.updateResultRow("String");
      return { ok: true, value: strRepr, type: "String" };
    }

    const boolToStringMatch = t.match(/^Boolean\.toString\((.+)\)$/);
    if (boolToStringMatch) {
      const argRes = await this.resolveExpr(boolToStringMatch[1].trim(), vars);
      if (!argRes.ok) return argRes;
      if (argRes.type !== "boolean") {
        this.showCompileErrorStamp();
        return { ok: false, crash: "compile" };
      }
      const strRepr = String(argRes.value);
      await this.runPressChoreography(argRes.value, "boolean", strRepr);
      this.updateResultRow("String");
      return { ok: true, value: strRepr, type: "String" };
    }

    // parseInt requires a genuinely String-typed argument — Java has no
    // implicit int/boolean → String coercion at a call site, so passing
    // a non-String value here is a COMPILE error, never reaching the
    // furnace at all (see header comment for why this check is new).
    const parseIntMatch = t.match(/^Integer\.parseInt\((.+)\)$/);
    if (parseIntMatch) {
      const argRes = await this.resolveExpr(parseIntMatch[1].trim(), vars);
      if (!argRes.ok) return argRes;
      if (argRes.type !== "String") {
        this.showCompileErrorStamp();
        return { ok: false, crash: "compile" };
      }
      const strVal = String(argRes.value);
      if (!this.isValidIntegerString(strVal)) {
        this.showNFEStamp();
        return { ok: false, crash: "nfe" };
      }
      this.updateResultRow("int");
      return { ok: true, value: parseInt(strVal, 10), type: "int" };
    }

    const staticCallMatch = t.match(/^(\w+)\.(\w+)\(/);
    if (staticCallMatch) {
      this.showCompileErrorStamp();
      return { ok: false, crash: "compile" };
    }

    if (t === "true" || t === "false") return { ok: true, value: t === "true", type: "boolean" };
    if (/^'.'$/.test(t)) return { ok: true, value: t[1], type: "char" };
    if (/^".*"$/.test(t)) return { ok: true, value: t.slice(1, -1), type: "String" };
    if (/^[+-]?\d+\.\d+$/.test(t)) return { ok: true, value: parseFloat(t), type: "double" };
    if (/^[+-]?\d+$/.test(t)) return { ok: true, value: parseInt(t, 10), type: "int" };

    if (vars[t] !== undefined) return { ok: true, value: vars[t].value, type: vars[t].type };

    return { ok: false, crash: "eval" };
  }

  async execStatement(line, vars) {
    const declVar = line.match(/^(int|double|String|boolean|char)\s+(\w+)\s*=\s*(.*);$/);
    if (declVar) {
      const varType = declVar[1], name = declVar[2], rhs = declVar[3].trim();
      const r = await this.resolveExpr(rhs, vars);
      if (!r.ok) return r;
      if (varType !== r.type) {
        this.showCompileErrorStamp();
        return { ok: false, crash: "compile" };
      }
      vars[name] = { value: r.value, type: varType, kind: "scalar" };
      return { ok: true };
    }

    const reassign = line.match(/^(\w+)\s*=\s*(.*);$/);
    if (reassign) {
      const name = reassign[1], rhs = reassign[2].trim();
      const r = await this.resolveExpr(rhs, vars);
      if (!r.ok) return r;
      const existing = vars[name];
      vars[name] = { value: r.value, type: existing ? existing.type : r.type, kind: "scalar" };
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
      console.warn("Level77Scene: /api/wellbeing/predict-struggle unreachable, skipping behavioral signal for this level:", e);
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
      this.clearPress();
      this.wipeSlate();
      const motes = this.ambient;
      this.ambient = null;
      (motes || []).forEach((m) => this.tweens.add({ targets: m, alpha: 0, duration: 1200 }));

      const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
      this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });
      const title = this.add.text(640, 240, "PRESS JAMMED", { font: "bold 36px Georgia", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
      this.tweens.add({ targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut", onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }) });
      this.add.text(640, 310, `Score: ${this.score}`, { font: "21px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
      this.add.text(640, 350, `Rounds Completed: ${this.currentRound} / 12`, { font: "18px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);
      this._makeButton(525, 420, "UNJAM THE PRESS", 200, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
      this._makeButton(755, 420, "RETURN TO MENU", 200, 50, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.start("MenuScene"));
    })();
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearRound();
    this.hideBubble();

    try { GameManager.completeLevel(76, Math.round((this.correctFirstTry / 12) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("string_valueOf_schema"); } catch (_) {}
    try {
      localStorage.setItem("level77_results", JSON.stringify({
        level: 77, concept: "string_valueOf", phase: "accretion",
        score: this.score, accuracy: this.correctFirstTry / 12, avgTime: this.totalTime / 12,
        comboMax: this.maxCombo, stars: this._starRating(), livesRemaining: this.lives,
        attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.pressFinale().then(() => { if (this._alive) this.showScoreTally(); });
  }

  async pressFinale() {
    const stamps = [
      { value: 42, type: "int", strRepr: "42" },
      { value: 3.14, type: "double", strRepr: "3.14" },
      { value: true, type: "boolean", strRepr: "true" },
    ];
    for (const s of stamps) {
      this.clearPress();
      this.containerValueText.setText("—").setColor(HEX_GRAY);
      await this.materializeInputValue(s.value, s.type);
      await this.slideInputToPress();
      await this.slideInBlankPaper();
      const startY = await this.pressArmDescend(s.strRepr);
      this.stampValue(s.strRepr);
      this.screenShake(0.005, 100);
      await this.delay(60);
      await this.pressArmRise(startY);
      this.createConfetti(PRESS_CX, BED_Y, 15);
      await this.delay(200);
    }
    this.tweens.add({ targets: this._triangleGfx, alpha: 1, duration: 300, yoyo: true, repeat: 2 });
    this.createConfetti(PRESS_CX, BED_Y, 40);
    await this.delay(800);
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
    panel.lineStyle(2, C_CREAM, 1);
    panel.strokeRoundedRect(360, 150, 560, 420, 16);

    const title = this.add.text(640, 190, "PRESS ACTIVATED", { font: "bold 30px Georgia", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(91).setScale(0);
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
    bg.fillStyle(C_COPPER, 0.9);
    bg.fillRect(-12, -14, 24, 6);
    bg.fillStyle(C_CREAM, 0.9);
    bg.fillRect(-10, -2, 20, 8);
    badge.add(bg);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 1950 });
    const badgeLbl = this.add.text(640, 505, "valueOf() SCHEMA ACQUIRED", { font: "bold 14px Georgia", color: HEX_GOLD }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: badgeLbl, alpha: 1, duration: 300, delay: 2100 });

    this._makeButton(500, 545, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(770, 545, "NEXT: The Inscription Trials →", 300, 44, { fill: 0x00733a, stroke: C_GREEN_BRIGHT, textColor: "#ffffff" }, () => {
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
