/**
 * Level 71 — "The Integer Furnace" (Type Conversion Wing: Accretion Phase
 * — Integer.parseInt())
 * ===========================================================================
 * Opens the Type Conversion Wing. The hero mechanic is the Conversion
 * Furnace: a paper strip (String) feeds through a validation gate
 * (character-by-character digit inspection) into a smelting chamber,
 * emerging as an integer bar (int) — or, on any invalid character, the
 * gate slams, the strip is ejected with sparks, and a NumberFormatException
 * banner stamps across the apparatus. The wing's foundational lesson:
 * text that LOOKS like a number is still text until parseInt converts it,
 * and that conversion can fail at RUNTIME (never at compile time).
 *
 * NOTE ON ROUND 12: the spec's own "concat_via_parseInt" distractor
 * (`Integer.parseInt(s) + Integer.parseInt(s)` in the concat slot) was
 * authored assuming it evaluates to 20 (int addition) — but embedded in
 * `System.out.println("Concat: " + <slot>)`, Java's left-to-right +
 * makes the FIRST operand (the string literal "Concat: ") poison every
 * later + into concatenation, so this distractor actually prints
 * "Concat: " + 7 + 7. With the spec's original s = "10", parseInt("10")
 * happens to equal the digit-count coincidence 10, and printing 10
 * concatenated twice ("1010") is INDISTINGUISHABLE from the correct
 * s + s ("1010") — the distractor would silently "pass" with the
 * spec's own test data. Changed s to "07": parseInt("07") = 7 (leading
 * zero dropped from the VALUE, same lesson as Round 3), so the correct
 * s + s = "0707" while the distractor's concatenated-int path produces
 * "77" — now genuinely, verifiably wrong. Verified independently via
 * direct trace before writing any code (the L63 std-dev discipline).
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

// Furnace geometry
const HOPPER_X0 = 430, HOPPER_X1 = 610, HOPPER_Y0 = 180, HOPPER_Y1 = 230;
const GATE_X0 = 460, GATE_X1 = 580, GATE_Y0 = 240, GATE_Y1 = 300;
const CHAMBER_X0 = 440, CHAMBER_X1 = 600, CHAMBER_Y0 = 310, CHAMBER_Y1 = 410;
const CHUTE_X0 = 470, CHUTE_X1 = 570, CHUTE_Y0 = 420, CHUTE_Y1 = 480;
const FURNACE_CX = (HOPPER_X0 + HOPPER_X1) / 2;
const CONT_X = 640, CONT_Y = 440;
// Slate
const SLATE_X = 800, SLATE_Y = 130, SLATE_W = 420, SLATE_H = 300;

const TUTORIAL_KEY = "level71_tutorial_done";

// ══════════════════════════════════════════════════════════════
// ROUND CONFIGURATION
// ══════════════════════════════════════════════════════════════
const ROUNDS = [
  // ── Type A: Conversion Prediction ──
  { round: 1, type: "predict",
    source: 'int x = Integer.parseInt("100");',
    question: "What is stored in x?", correct: "100",
    options: [
      { value: "100", tag: null },
      { value: '"100"', tag: "parseInt_returns_string_belief", label: '"100" (String)' },
      { value: "error", tag: "valid_input_error_belief", label: "NumberFormatException" },
      { value: "0", tag: "parseInt_returns_zero_belief" },
    ],
    concept: "basic_parseInt" },

  { round: 2, type: "predict",
    source: 'int x = Integer.parseInt("-25");',
    question: "What is stored in x?", correct: "-25",
    options: [
      { value: "-25", tag: null },
      { value: "25", tag: "parseInt_strips_sign_belief" },
      { value: "error", tag: "negative_crashes_belief", label: "NumberFormatException" },
      { value: '"25"', tag: "parseInt_returns_string_belief", label: '"25" (String)' },
    ],
    concept: "negative_parseInt" },

  { round: 3, type: "predict",
    source: 'int x = Integer.parseInt("007");',
    question: "What is stored in x?", correct: "7",
    options: [
      { value: "7", tag: null },
      { value: "007", tag: "leading_zeros_kept_belief" },
      { value: "error", tag: "leading_zeros_crash_belief", label: "NumberFormatException" },
      { value: "0", tag: "parseInt_first_digit_belief" },
    ],
    revealNote: "Leading zeros are legal and ignored: '007' → 7. The furnace reads the NUMERIC VALUE, not the character count.",
    concept: "leading_zeros" },

  // ── Type B: NFE & Wrapper Probes ──
  { round: 4, type: "predict",
    source: 'int x = Integer.parseInt("hello");',
    question: "What happens?", correct: "nfe",
    options: [
      { value: "nfe", tag: null, label: "NumberFormatException (RUNTIME CRASH)" },
      { value: "compile_error", tag: "nfe_is_compile_error_belief", label: "COMPILE ERROR" },
      { value: "0", tag: "nfe_returns_zero_belief", label: "x = 0 (default)" },
      { value: "null", tag: "nfe_returns_null_belief", label: "x = null" },
    ],
    revealNote: "RUNTIME crash — the compiler let it pass because 'hello' is a valid String argument. Only at run time, character by character, does the furnace discover 'h' is not a digit.",
    concept: "nfe_basic" },

  { round: 5, type: "predict",
    source: 'int x = Integer.parseInt("3.14");',
    question: "What happens?", correct: "nfe",
    options: [
      { value: "nfe", tag: null, label: "NumberFormatException" },
      { value: "3", tag: "parseInt_truncates_decimal_belief", label: "x = 3 (truncated)" },
      { value: "3.14", tag: "parseInt_allows_decimal_belief", label: "x = 3.14" },
      { value: "compile_error", tag: "nfe_is_compile_error_belief", label: "COMPILE ERROR" },
    ],
    revealNote: "The decimal point is NOT a digit — the furnace rejects it. parseInt is for INTEGERS: whole numbers, no dots.",
    concept: "nfe_decimal_point" },

  { round: 6, type: "predict",
    source: 'int x = Integer.parseInt(" 5 ");',
    question: "What happens?", correct: "nfe",
    options: [
      { value: "nfe", tag: null, label: "NumberFormatException" },
      { value: "5", tag: "parseInt_strips_spaces_belief", label: "x = 5" },
      { value: "compile_error", tag: "nfe_is_compile_error_belief", label: "COMPILE ERROR" },
      { value: "0", tag: "nfe_returns_zero_belief", label: "x = 0" },
    ],
    revealNote: "SPACES are not digits — the furnace rejects them. parseInt does NOT trim. The fix: Integer.parseInt(str.trim()).",
    concept: "nfe_whitespace" },

  { round: 7, type: "predict",
    source: 'int x = int.parseInt("42");',
    question: "What happens?", correct: "compile_error",
    options: [
      { value: "compile_error", tag: null, label: "COMPILE ERROR — int has no methods" },
      { value: "42", tag: "lowercase_integer_belief", label: "x = 42" },
      { value: "nfe", tag: "runtime_vs_compile_confusion", label: "NumberFormatException" },
      { value: "error", tag: "generic_error", label: "Some other error" },
    ],
    revealNote: "int is a PRIMITIVE keyword — no methods, no class. Integer (capital I) is the WRAPPER CLASS that holds parseInt.",
    concept: "wrapper_vs_primitive" },

  // ── Type C: Expressions with parseInt ──
  { round: 8, type: "predict",
    source: 'String s = "10";\nint x = Integer.parseInt(s) + 5;\nSystem.out.println(x);',
    question: "What prints?", correct: "15",
    options: [
      { value: "15", tag: null },
      { value: '"105"', tag: "string_concat_belief", label: '"105" (concat)' },
      { value: "105", tag: "string_plus_int_confusion" },
      { value: "error", tag: "variable_input_error_belief", label: "NumberFormatException" },
    ],
    revealNote: "parseInt smelts '10' → 10 (an int); 10 + 5 = 15. Without parseInt, '10' + 5 would be '105' (String concatenation). The furnace changes + from glue to addition.",
    concept: "parseInt_arithmetic" },

  { round: 9, type: "predict",
    source: 'String a = "20";\nString b = "30";\nint sum = Integer.parseInt(a) + Integer.parseInt(b);\nSystem.out.println(sum);',
    question: "What prints?", correct: "50",
    options: [
      { value: "50", tag: null },
      { value: '"2030"', tag: "string_concat_belief", label: '"2030"' },
      { value: "2030", tag: "string_plus_int_confusion" },
      { value: "error", tag: "double_parse_error_belief", label: "Can't parse twice" },
    ],
    revealNote: "Two smelts: '20' → 20, '30' → 30. Then 20 + 30 = 50. Both Strings became ints BEFORE the addition.",
    concept: "double_parseInt_sum" },

  // ── Type D: Assayer Command ──
  { round: 10, type: "command",
    source: 'String input = "75";\nint score = <slot:convert>;\nSystem.out.println("Score: " + score);',
    mission: "Convert the String '75' into an int and print it. Expected: Score: 75",
    slots: [{ id: "convert", hint: "convert to int" }],
    cartridges: [
      { code: "Integer.parseInt(input)", correct: true },
      { code: "input", tag: "string_is_number_belief" },
      { code: "int.parseInt(input)", tag: "lowercase_integer_belief" },
      { code: "Integer.parseDouble(input)", tag: "wrong_parse_method" },
    ],
    tests: [{ expectedOutput: "Score: 75" }],
    concept: "command_basic_convert" },

  { round: 11, type: "command",
    source: 'String ageStr = "25";\nString salaryStr = "50000";\nint total = <slot:age> + <slot:salary>;\nSystem.out.println("Total: " + total);',
    mission: "Convert BOTH Strings and add them. Expected: Total: 50025",
    slots: [
      { id: "age", hint: "convert age" },
      { id: "salary", hint: "convert salary" },
    ],
    cartridges: [
      { code: "Integer.parseInt(ageStr)", correct: true, slotId: "age" },
      { code: "ageStr", tag: "string_is_number_belief", slotId: "age" },
      { code: "Integer.parseInt(salaryStr)", correct: true, slotId: "salary" },
      { code: "salaryStr", tag: "string_is_number_belief", slotId: "salary" },
    ],
    tests: [{ expectedOutput: "Total: 50025" }],
    concept: "command_double_convert" },

  { round: 12, type: "command",
    source: 'String s = "07";\nint doubled = <slot:convert> * 2;\nSystem.out.println("Doubled: " + doubled);\nSystem.out.println("Concat: " + <slot:concat>);',
    mission: "Convert and double the value. Then show the STRING concat for comparison.\nDoubled: 14\nConcat: 0707",
    slots: [
      { id: "convert", hint: "convert to int for math" },
      { id: "concat", hint: "String concat (NO conversion)" },
    ],
    cartridges: [
      { code: "Integer.parseInt(s)", correct: true, slotId: "convert" },
      { code: "s + s", correct: true, slotId: "concat" },
      { code: "Integer.parseInt(s) + Integer.parseInt(s)", tag: "concat_via_parseInt", slotId: "concat" },
      { code: "s", tag: "string_is_number_belief", slotId: "convert" },
    ],
    tests: [{ expectedOutput: "Doubled: 14⏎Concat: 0707" }],
    postMissionNote: "Bit (holding the tongs, nodding at the two output lines): 'Same characters, two worlds. parseInt(s) * 2 = 14 — arithmetic, and the leading zero vanished from the VALUE. s + s = \"0707\" — concatenation, and the leading zero survives because it's still just text. The furnace changes the MEANING of the operation. This is the core lesson of the whole wing: text looks like numbers, but it BEHAVES like text until you convert it.'",
    concept: "command_contrast" },
];

const MISCONCEPTION_FEEDBACK = {
  string_is_number_belief: "A String that LOOKS like a number is still text — it's characters on paper, not a value you can add or assign to an int. The furnace converts text to number; without it, the type doesn't match.",
  parseInt_returns_string_belief: "parseInt returns a primitive INT — the metal bar, not the paper strip. The text is consumed; the number remains.",
  parseInt_on_int_belief: "You're already holding an int — no conversion needed. parseInt converts STRINGS to ints; ints are already ints.",
  parseInt_on_double_belief: "parseInt smelts to INT, not double. For doubles, use Double.parseDouble — a different furnace.",
  parseInt_allows_decimal_belief: "A decimal point is NOT a digit. '3.14' is not a valid integer representation. parseInt rejects dots.",
  parseInt_allows_spaces_belief: "Spaces are not digits. The furnace reads character by character: ' ' is not a digit. Trim first, smelt second: Integer.parseInt(str.trim()).",
  parseInt_strips_spaces_belief: "Spaces are not digits. The furnace reads character by character: ' ' is not a digit. Trim first, smelt second: Integer.parseInt(str.trim()).",
  parseInt_returns_zero_belief: "The furnace doesn't substitute a default for valid input — it smelts the actual value. '100' becomes 100, not 0.",
  nfe_is_compile_error_belief: "NumberFormatException is a RUNTIME crash — the compiler saw a String argument and approved it. Only at run time, reading character by character, does the furnace discover the invalid input.",
  nfe_returns_zero_belief: "The furnace doesn't return a default — it CRASHES. No zero, no null, no fallback. The program halts.",
  nfe_returns_null_belief: "int is a primitive — it cannot hold null. And the furnace doesn't return at all on invalid input; it throws an exception.",
  parseInt_truncates_decimal_belief: "parseInt doesn't round or truncate — '3.14' is REJECTED entirely because the dot is not a digit. There is no partial smelting.",
  parseInt_instance_call_belief: "Integer.parseInt — static, on the wrapper class. Not str.parseInt(); Strings don't have parse methods.",
  lowercase_integer_belief: "int is a primitive keyword — no methods, no class. Integer (capital I) is the wrapper class. The furnace lives on Integer.",
  parseInt_empty_string_belief: "An empty string has no digits — the furnace has nothing to smelt. NumberFormatException.",
  parseInt_null_belief: "null is not a String — the furnace can't even read it. NullPointerException before parsing begins.",
  parseInt_handles_words_belief: "Words contain letters, not digits. 'hello' → 'h' → REJECTED. The furnace is digit-strict.",
  leading_zeros_kept_belief: "Leading zeros are legal but don't affect the value: '007' smelts to 7, not 007. The int holds the numeric VALUE, not the character representation.",
  leading_zeros_crash_belief: "Leading zeros are fine — they're still digits (character '0' passes validation). The value is just 7.",
  parseInt_first_digit_belief: "The furnace reads the WHOLE string, not just the first digit — '007' is fully read as 7, not truncated to the first character.",
  parseInt_strips_sign_belief: "The leading minus is part of the number — -25 is negative twenty-five, not 25 with the sign stripped.",
  negative_crashes_belief: "A leading minus is the ONE non-digit the furnace accepts, in the first position only. -25 smelts cleanly.",
  string_concat_belief: "Without parseInt, + between Strings means CONCATENATION. After parseInt, + means ARITHMETIC. The conversion changes the meaning of +.",
  string_plus_int_confusion: "The result is an int, not a concatenated String. parseInt converted first; then + was arithmetic.",
  wrong_parse_method: "parseDouble returns a double, not an int. An int variable can't hold a double without a cast. Use parseInt for ints.",
  concat_via_parseInt: "Both parseInt calls converted to int — but printed right after a String literal, + turns back into concatenation for the REST of the line too. The concat line needs the RAW Strings, unconverted: s + s.",
  variable_input_error_belief: "A variable holding a numeric String is the same as the literal — parseInt reads the contents, not the name.",
  double_parse_error_belief: "parseInt can be called as many times as you like — each call is independent. Both Strings convert cleanly.",
  valid_input_error_belief: "A well-formed digit string never crashes — parseInt only throws on invalid characters.",
  generic_error: "Trace the actual rule: int is a primitive with no methods; Integer is the wrapper class that holds parseInt.",
  runtime_vs_compile_confusion: "Missing/renamed methods and wrong classes are COMPILE errors — caught before the program ever runs. NumberFormatException is a RUNTIME event, from bad DATA, not bad syntax.",
  timeout: "Reread the source carefully — trace it against the furnace.",
};

export class Level71Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level71Scene" });
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
    this.firstNFEAnnotationShown = false;
    this.firstTypeAnnotationShown = false;
  }

  preload() {}

  create() {
    this._alive = true;
    this.createParticleTexture();
    this.createBackground();
    this.createOfficeInterior();
    this.createOfficeFloor();
    this.createParticles();
    this.createConversionFurnace();
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
    this.updateBurnerFlame(time);
    this.updateFurnaceGlow(time);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // SETUP — THE ASSAY OFFICE INTERIOR
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l71_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l71_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x0c0818).setDepth(0);
  }

  createOfficeInterior() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x120c22, 1);
    g.fillRect(0, 0, W, 216);
    g.lineStyle(3, C_COPPER, 0.4);
    for (let x = 0; x < W; x += 120) {
      g.lineBetween(x, 40, x + 120, 40);
      g.fillStyle(C_COPPER, 0.5);
      g.fillCircle(x, 40, 3);
    }

    // periodic table fragment
    const pg = this.add.graphics().setDepth(2);
    pg.fillStyle(0x0c0818, 1);
    pg.lineStyle(2, C_COPPER, 1);
    pg.fillRect(200, 60, 120, 80);
    pg.strokeRect(200, 60, 120, 80);
    const cells = [
      { label: "int", tag: "P", x: 220 },
      { label: "double", tag: "P", x: 260 },
      { label: "String", tag: "O", x: 300 },
    ];
    cells.forEach((c) => {
      pg.lineStyle(1, C_COPPER, 0.5);
      pg.strokeRect(c.x - 15, 70, 30, 60);
      this.add.text(c.x, 78, c.tag, { font: "bold 9px Georgia", color: HEX_COPPER }).setOrigin(0.5).setAlpha(0.4).setDepth(3);
      this.add.text(c.x, 108, c.label, { font: "9px Courier New", color: HEX_CYAN }).setOrigin(0.5).setAlpha(0.35).setDepth(3);
    });

    // glass vessel rack
    const vg = this.add.graphics().setDepth(2);
    vg.lineStyle(1.5, C_COPPER, 0.6);
    vg.strokeRect(1120, 100, 120, 160);
    const liquids = [HEX_INDIGO, HEX_COPPER, "#e8eaf6"];
    [1150, 1180, 1210].forEach((vx, i) => {
      vg.lineStyle(1, C_COPPER, 0.5);
      vg.strokeRect(vx - 8, 120, 16, 100);
      const level = 60 + i * 15;
      vg.fillStyle(Phaser.Display.Color.HexStringToColor(liquids[i]).color, 0.5);
      vg.fillRect(vx - 7, 220 - level, 14, level);
    });

    // Bunsen burner
    const bc = this.add.container(80, 480).setDepth(3);
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1408, 1);
    bg.lineStyle(1.5, C_COPPER, 0.8);
    bg.fillRect(-10, 10, 20, 8);
    bg.fillRect(-3, -10, 6, 20);
    bc.add(bg);
    this.flameInner = this.add.ellipse(0, -14, 6, 12, 0x42a5f5, 0.6).setOrigin(0.5, 1);
    this.flameOuter = this.add.ellipse(0, -14, 10, 18, 0x1565c0, 0.3).setOrigin(0.5, 1);
    bc.add([this.flameOuter, this.flameInner]);
    this._burnerContainer = bc;

    // Banner
    const bnG = this.add.graphics().setDepth(2);
    bnG.fillStyle(0x0c0818, 1);
    bnG.lineStyle(1, C_COPPER, 0.5);
    bnG.fillRoundedRect(460, 12, 360, 26, 3);
    bnG.strokeRoundedRect(460, 12, 360, 26, 3);
    this.add.text(640, 25, "T H E   I N T E G E R   F U R N A C E", { font: "bold 14px Georgia", color: HEX_COPPER }).setOrigin(0.5).setAlpha(0.7).setDepth(3);
  }

  updateBurnerFlame(time) {
    if (!this.flameInner) return;
    const jitter = Math.sin(time * 0.03) * 1;
    this.flameInner.y = -14 + jitter * 0.3;
    this.flameInner.setScale(1 + Math.sin(time * 0.05) * 0.05);
  }

  createOfficeFloor() {
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
    g.fillStyle(C_COPPER, 0.15);
    g.fillRect(0, 637, 6, 83);
  }

  createParticles() {
    this.ambient = [];
    const colors = [0x3949ab, 0xb87333, 0x42a5f5];
    for (let i = 0; i < 7; i++) {
      this.ambient.push(this.add.circle(Phaser.Math.Between(0, W), Phaser.Math.Between(230, 630), 1, Phaser.Utils.Array.GetRandom(colors), Phaser.Math.FloatBetween(0.03, 0.05)).setDepth(2));
    }
  }

  updateParticles(time, delta) {
    if (!this.ambient) return;
    const step = 0.006 * (delta / 16.7);
    this.ambient.forEach((p, i) => {
      const nearFurnace = p.x > FURNACE_CX - 150 && p.x < FURNACE_CX + 150 && p.y > 300 && p.y < 480;
      p.y -= step * (nearFurnace ? 1.6 : 0.5) * (i % 2 === 0 ? 1 : 0.6);
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
    const p = this.add.particles(x, y, "l71_dot", {
      speed: { min: 80, max: 240 }, angle: { min: 0, max: 360 }, scale: { start: 0.9, end: 0 }, lifespan: 500,
      tint: [C_COPPER, 0x3949ab, C_GOLD, 0xffffff], emitting: false,
    }).setDepth(85);
    p.explode(count);
    this.time.delayedCall(900, () => p.destroy());
  }

  screenShake(intensity = 0.004, duration = 150) {
    this.cameras.main.shake(duration, intensity);
  }

  // ══════════════════════════════════════════════════════════════
  // THE CONVERSION FURNACE (hero visual)
  // ══════════════════════════════════════════════════════════════

  createConversionFurnace() {
    const g = this.add.graphics().setDepth(10);

    // Hopper (trapezoid)
    g.lineStyle(3, C_COPPER, 1);
    g.fillStyle(0x0c0818, 0.8);
    g.beginPath();
    g.moveTo(HOPPER_X0, HOPPER_Y0); g.lineTo(HOPPER_X1, HOPPER_Y0);
    g.lineTo(FURNACE_CX + 30, HOPPER_Y1); g.lineTo(FURNACE_CX - 30, HOPPER_Y1);
    g.closePath();
    g.fillPath(); g.strokePath();
    this.add.text(FURNACE_CX, HOPPER_Y0 - 12, "STRING INPUT", { font: "bold 11px Georgia", color: HEX_COPPER }).setOrigin(0.5).setDepth(11);

    // Validation gate (glass chamber)
    g.lineStyle(2, C_CYAN, 1);
    g.fillStyle(0x0c0818, 0.5);
    g.fillRoundedRect(GATE_X0, GATE_Y0, GATE_X1 - GATE_X0, GATE_Y1 - GATE_Y0, 6);
    g.strokeRoundedRect(GATE_X0, GATE_Y0, GATE_X1 - GATE_X0, GATE_Y1 - GATE_Y0, 6);
    [GATE_X0 + 6, GATE_X1 - 6].forEach((x) => {
      g.fillStyle(C_CYAN, 0.4);
      g.fillCircle(x, (GATE_Y0 + GATE_Y1) / 2, 6);
    });
    this.gateBarrier = this.add.rectangle((GATE_X0 + GATE_X1) / 2, GATE_Y0 + 4, GATE_X1 - GATE_X0 - 10, 4, C_RED, 0).setDepth(14);

    // Smelting chamber
    g.lineStyle(3, C_COPPER, 1);
    g.fillStyle(0x1a0e05, 0.85);
    g.fillRoundedRect(CHAMBER_X0, CHAMBER_Y0, CHAMBER_X1 - CHAMBER_X0, CHAMBER_Y1 - CHAMBER_Y0, 8);
    g.strokeRoundedRect(CHAMBER_X0, CHAMBER_Y0, CHAMBER_X1 - CHAMBER_X0, CHAMBER_Y1 - CHAMBER_Y0, 8);
    const viewportCx = (CHAMBER_X0 + CHAMBER_X1) / 2, viewportCy = (CHAMBER_Y0 + CHAMBER_Y1) / 2;
    g.fillStyle(0x081020, 1);
    g.fillRoundedRect(viewportCx - 30, viewportCy - 20, 60, 40, 4);
    this.furnaceGlow = this.add.rectangle(viewportCx, viewportCy, 56, 36, 0x42a5f5, 0.3).setDepth(11);

    // Output chute
    g.lineStyle(2, C_COPPER, 1);
    g.lineBetween(CHUTE_X0, CHUTE_Y0, CHUTE_X1, CHUTE_Y1);
    g.lineBetween(CHUTE_X0, CHUTE_Y0 + 6, CHUTE_X1, CHUTE_Y1 + 6);

    // int container at bottom
    const contG = this.add.graphics().setDepth(11);
    contG.fillStyle(0x0c0818, 0.9);
    contG.lineStyle(2, C_GOLD, 1);
    contG.fillRoundedRect(CONT_X - 50, CONT_Y, 100, 50, 6);
    contG.strokeRoundedRect(CONT_X - 50, CONT_Y, 100, 50, 6);
    this.add.text(CONT_X, CONT_Y - 12, "int", { font: "bold 11px Courier New", color: HEX_GOLD }).setOrigin(0.5).setDepth(12);
    this.containerValueText = this.add.text(CONT_X, CONT_Y + 25, "—", { font: "bold 18px Courier New", color: HEX_GRAY }).setOrigin(0.5).setDepth(12);
    this.containerNameText = this.add.text(CONT_X, CONT_Y + 45, "", { font: "italic 10px Courier New", color: HEX_GRAY }).setOrigin(0.5).setDepth(12);

    this.furnaceDynamicLayer = this.add.container(0, 0).setDepth(20);
    this._furnaceStaticGfx = g;
  }

  updateFurnaceGlow(time) {
    if (!this.furnaceGlow) return;
    const base = this._furnaceGlowGold ? 0xffd740 : 0x42a5f5;
    this.furnaceGlow.setFillStyle(base, 0.25 + Math.abs(Math.sin(time * 0.002)) * 0.1);
  }

  clearFurnace() {
    this.furnaceDynamicLayer.removeAll(true);
    this.gateBarrier.setAlpha(0);
  }

  async materializePaperStrip(value) {
    const strip = this.add.container(FURNACE_CX, HOPPER_Y0 + 10).setAlpha(0);
    const bg = this.add.graphics();
    const w = Math.max(60, value.length * 11 + 20), h = 26;
    bg.fillStyle(0xe0d6b8, 1);
    bg.lineStyle(1, 0x8a6435, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 3);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 3);
    const txt = this.add.text(0, 0, value, { font: "bold 18px Courier New", color: "#241a0e" }).setOrigin(0.5);
    if (txt.width > w - 10) txt.setFontSize(12);
    strip.add([bg, txt]);
    this.furnaceDynamicLayer.add(strip);
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

  /** Inspects characters left-to-right with a per-character spotlight.
   * Stops at the FIRST invalid character (matching Java's real parseInt
   * behavior — it doesn't keep scanning past the failure). Returns
   * { allValid, invalidIndex }. */
  async inspectCharacters(chars) {
    const strip = this._currentStrip;
    const startX = strip ? strip.container.x - strip.w / 2 + 14 : FURNACE_CX - 20;
    const y = (GATE_Y0 + GATE_Y1) / 2;
    for (let i = 0; i < chars.length; i++) {
      if (!this._alive) return { allValid: true, invalidIndex: -1 };
      const ch = chars[i];
      const isValid = /[0-9]/.test(ch) || (ch === "-" && i === 0);
      const spotX = startX + i * (strip ? Math.min(14, (strip.w - 20) / Math.max(chars.length, 1)) : 14);
      const spot = this.add.circle(spotX, y, 7, isValid ? C_GREEN_BRIGHT : C_RED, isValid ? 0.35 : 0.6).setDepth(21);
      this.furnaceDynamicLayer.add(spot);
      this.tweens.add({ targets: spot, alpha: 0, duration: 300, delay: 150, onComplete: () => spot.destroy() });
      await this.delay(150);
      if (!isValid) return { allValid: false, invalidIndex: i };
    }
    return { allValid: true, invalidIndex: -1 };
  }

  async openGate() {
    await new Promise((res) => { this.tweens.add({ targets: this.gateBarrier, alpha: 0, duration: 80, onComplete: res }); });
  }

  async slamGate() {
    this.gateBarrier.setFillStyle(C_RED, 0.9).setAlpha(1);
    const flash = this.add.rectangle((GATE_X0 + GATE_X1) / 2, (GATE_Y0 + GATE_Y1) / 2, GATE_X1 - GATE_X0, GATE_Y1 - GATE_Y0, C_RED, 0.4).setDepth(22);
    this.furnaceDynamicLayer.add(flash);
    this.tweens.add({ targets: flash, alpha: 0, duration: 300, onComplete: () => flash.destroy() });
    await this.delay(100);
  }

  async ejectStrip() {
    const strip = this._currentStrip;
    if (!strip) return;
    for (let i = 0; i < 5; i++) {
      const spark = this.add.circle(strip.container.x + Phaser.Math.Between(-10, 10), strip.container.y, 2, C_RED, 0.8).setDepth(22);
      this.furnaceDynamicLayer.add(spark);
      this.tweens.add({ targets: spark, y: spark.y + Phaser.Math.Between(10, 30), alpha: 0, duration: 300, onComplete: () => spark.destroy() });
    }
    await new Promise((res) => {
      this.tweens.add({ targets: strip.container, y: HOPPER_Y0 - 20, alpha: 0, duration: 200, ease: "Sine.easeIn", onComplete: () => { strip.container.destroy(); res(); } });
    });
    this._currentStrip = null;
  }

  async burnStrip() {
    const strip = this._currentStrip;
    if (!strip) return;
    await new Promise((res) => {
      this.tweens.add({ targets: strip.container, y: (CHAMBER_Y0 + CHAMBER_Y1) / 2, duration: 150, ease: "Sine.easeIn", onComplete: res });
    });
    for (let i = 0; i < 4; i++) {
      const ember = this.add.circle(strip.container.x + Phaser.Math.Between(-15, 15), strip.container.y, 2, C_ORANGE, 0.7).setDepth(22);
      this.furnaceDynamicLayer.add(ember);
      this.tweens.add({ targets: ember, y: ember.y - Phaser.Math.Between(20, 40), alpha: 0, duration: 400, onComplete: () => ember.destroy() });
    }
    await new Promise((res) => {
      this.tweens.add({ targets: strip.container, alpha: 0, scale: 0.6, duration: 350, onComplete: () => { strip.container.destroy(); res(); } });
    });
    this._currentStrip = null;
  }

  async formIntegerBar(value) {
    const bar = this.add.container((CHAMBER_X0 + CHAMBER_X1) / 2, (CHAMBER_Y0 + CHAMBER_Y1) / 2).setAlpha(0).setScale(0.6);
    const bg = this.add.graphics();
    const w = Math.max(70, String(value).length * 12 + 24), h = 32;
    bg.fillStyle(C_COPPER, 1);
    bg.lineStyle(2, 0x8a6435, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 5);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 5);
    const txt = this.add.text(0, 0, String(value), { font: "bold 19px Courier New", color: "#241a0e" }).setOrigin(0.5);
    if (txt.width > w - 10) txt.setFontSize(13);
    bar.add([bg, txt]);
    this.furnaceDynamicLayer.add(bar);
    const glow = this.add.circle((CHAMBER_X0 + CHAMBER_X1) / 2, (CHAMBER_Y0 + CHAMBER_Y1) / 2, 45, C_GOLD, 0.3).setDepth(19);
    this.furnaceDynamicLayer.add(glow);
    this.tweens.add({ targets: [bar], alpha: 1, scale: 1, duration: 200, ease: "Back.easeOut" });
    this.tweens.add({ targets: glow, alpha: 0, duration: 400, onComplete: () => glow.destroy() });
    await this.delay(300);
    this._currentBar = bar;
    return bar;
  }

  async slideBarToContainer(value, varName) {
    const bar = this._currentBar;
    if (bar) {
      await new Promise((res) => {
        this.tweens.add({ targets: bar, x: CONT_X, y: CONT_Y + 25, scale: 0.6, alpha: 0, duration: 280, ease: "Sine.easeIn", onComplete: () => { bar.destroy(); res(); } });
      });
      this._currentBar = null;
    }
    const flash = this.add.circle(CONT_X, CONT_Y + 25, 30, C_GOLD, 0.4).setDepth(21);
    this.tweens.add({ targets: flash, alpha: 0, scale: 1.4, duration: 250, onComplete: () => flash.destroy() });
    this.containerValueText.setText(String(value)).setColor(HEX_GOLD);
    this.containerNameText.setText(varName || "");
    this.tweens.add({ targets: this.containerValueText, scale: 1.2, duration: 100, yoyo: true });

    if (!this.firstTypeAnnotationShown) {
      this.firstTypeAnnotationShown = true;
      this.createAnnotation(CONT_X, CONT_Y + 70, "primitive int — not String, not Integer", HEX_GRAY);
    }
    await this.delay(150);
  }

  async showNFE(inputStr) {
    this.screenShake(0.006, 300);
    const banner = this.add.text(FURNACE_CX, (CHAMBER_Y0 + CHAMBER_Y1) / 2, "NumberFormatException", { font: "bold 17px Courier New", color: HEX_RED }).setOrigin(0.5).setDepth(30).setScale(1.3).setAlpha(0);
    this.furnaceDynamicLayer.add(banner);
    this.tweens.add({ targets: banner, alpha: 1, scale: 1, duration: 150 });
    if (!this.firstNFEAnnotationShown) {
      this.firstNFEAnnotationShown = true;
      this.createAnnotation(FURNACE_CX, CHAMBER_Y1 + 30, "RUNTIME — the compiler couldn't predict this would fail. The String looked fine in the source code.", HEX_GRAY);
    }
    await this.delay(1600);
    if (banner.active) this.tweens.add({ targets: banner, alpha: 0, duration: 250, onComplete: () => banner.destroy() });
    this.containerValueText.setText("✗").setColor(HEX_RED);
    this.containerNameText.setText("CRASH");
  }

  showCompileErrorStamp() {
    const stamp = this.add.text(FURNACE_CX, 150, "COMPILE ERROR", { font: "bold 18px Arial", color: HEX_RED }).setOrigin(0.5).setDepth(30).setScale(1.3).setAngle(-6).setAlpha(0);
    this.roundElements.push(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 150 });
    this.screenShake(0.004, 120);
    this.time.delayedCall(900, () => { if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 200, onComplete: () => stamp.destroy() }); });
  }

  /** The full honest conversion choreography: strip in, inspected
   * character-by-character, and EITHER smelted into an int bar OR
   * rejected with a NumberFormatException — never scripted; the
   * validity check and the resulting value are both computed for real. */
  async runConversionChoreography(strValue, varName) {
    await this.materializePaperStrip(strValue);
    await this.feedStripDown();
    const inspection = await this.inspectCharacters(strValue.split(""));
    if (!inspection.allValid) {
      await this.slamGate();
      await this.ejectStrip();
      await this.showNFE(strValue);
      return { ok: false, crash: "nfe" };
    }
    await this.openGate();
    await this.burnStrip();
    const intVal = parseInt(strValue, 10);
    await this.formIntegerBar(intVal);
    await this.slideBarToContainer(intVal, varName);
    return { ok: true, value: intVal };
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
    pillG.lineStyle(1.2, C_COPPER, 0.7);
    pillG.strokeRoundedRect(SLATE_X + SLATE_W - 172, SLATE_Y + 8, 160, 16, 8);
    this.add.text(SLATE_X + SLATE_W - 92, SLATE_Y + 16, "Integer (wrapper class)", { font: "bold 9px Courier New", color: HEX_COPPER }).setOrigin(0.5).setDepth(12);

    this.slateLines = this.add.container(0, 0).setDepth(11);
    this._slateY = SLATE_Y + 42;

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
    if (this._slateY > SLATE_Y + SLATE_H - 46) this._slateY = SLATE_Y + 42;
  }

  chalkEvaluationArrow(value) {
    const t = this.add.text(SLATE_X + 14, this._slateY, `→ ${value}`, { font: "bold 14px Courier New", color: HEX_ORANGE }).setAlpha(0);
    this.slateLines.add(t);
    if (t.width > SLATE_W - 28) t.setFontSize(10);
    this.tweens.add({ targets: t, alpha: 1, duration: 140 });
    this._slateY += 22;
    if (this._slateY > SLATE_Y + SLATE_H - 46) this._slateY = SLATE_Y + 42;
  }

  wipeSlate() {
    this.slateLines.removeAll(true);
    this._slateY = SLATE_Y + 42;
  }

  updateResultRow(type) {
    if (type === null || type === undefined) { this.resultText.setText("—").setColor(HEX_GRAY); return; }
    if (type === "crash") { this.resultText.setText("✗ NFE").setColor(HEX_RED); return; }
    if (type === "compile") { this.resultText.setText("✗ COMPILE").setColor(HEX_RED); return; }
    this.resultText.setText(type).setColor(type === "String" ? HEX_CYAN : HEX_GOLD);
  }

  // ══════════════════════════════════════════════════════════════
  // SOURCE DISPLAY & EXPRESSION MONITOR
  // ══════════════════════════════════════════════════════════════

  createSourceDisplay() {
    this.sourceContainer = this.add.container(0, 0).setDepth(15);
  }

  _syntaxTokenize(line) {
    const tokens = [];
    const re = /("(?:[^"\\]|\\.)*")|(\bimport\b|\bint\b|\bdouble\b|\bString\b|\bnew\b)|(\bInteger\b)|(\.parseInt\b|\.parseDouble\b|\.length\b)|(\bSystem\.out\b)|(-?\d+\.\d+|-?\d+)|([(){}\[\];.,=+*])/g;
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

    this.add.text(20, 14, "THE INTEGER FURNACE", { font: "bold 16px Georgia", color: "#b0bec5" }).setDepth(50);
    this.add.text(20, 32, "Accretion Phase — Type Conversion: parseInt()", { font: "12px Arial", color: "#546e7a" }).setDepth(50);

    this.add.text(1060, 8, "SCORE", { font: "11px Arial", color: "#546e7a" }).setDepth(50);
    this.scoreText = this.add.text(1060, 20, "0", { font: "bold 19px Arial", color: "#ffffff" }).setDepth(50);
    this.comboText = this.add.text(1060, 42, "×1", { font: "bold 14px Arial", color: HEX_GOLD }).setDepth(50);

    this.lifeIcons = [];
    for (let i = 0; i < 5; i++) {
      const lg = this.add.graphics({ x: 1150 + i * 20, y: 24 }).setDepth(50);
      lg.fillStyle(C_COPPER, 0.9);
      lg.lineStyle(1, 0x8a6435, 1);
      lg.fillRoundedRect(-6, -5, 12, 10, 2);
      lg.strokeRoundedRect(-6, -5, 12, 10, 2);
      this.lifeIcons.push(lg);
    }
  }

  // ══════════════════════════════════════════════════════════════
  // BIT — ASSAYER VARIANT (leather apron, goggles, copper tongs)
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
    const goggles = this.add.container(0, -26);
    const gogG = this.add.graphics();
    gogG.lineStyle(1.2, C_CYAN, 0.7);
    gogG.strokeCircle(-6, 0, 5);
    gogG.strokeCircle(6, 0, 5);
    gogG.lineBetween(-1, 0, 1, 0);
    goggles.add(gogG);
    const gloveL = this.add.circle(-16, 10, 4, 0xffffff, 0).setStrokeStyle(1, 0xe8eaf6, 0.7);
    this.tongs = this.add.container(17, 6);
    const tongsG = this.add.graphics();
    tongsG.lineStyle(1.3, C_COPPER, 0.9);
    tongsG.lineBetween(-3, -10, -6, 6);
    tongsG.lineBetween(3, -10, 6, 6);
    tongsG.lineBetween(-3, -10, 3, -10);
    this.tongs.add(tongsG);
    c.add([g, apron, eye, pupil, goggles, gloveL, this.tongs, tip]);
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
    g.lineStyle(1.5, C_COPPER, 1);
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
    await this.bitSay("Welcome to the Assay Office, Assayer — leave the museum behind; tonight we work with fire. Before you stands the Integer Furnace: it takes a String — text made of characters — and converts it into a real int. The number you can add, compare, and compute with. But heed this: not every String survives the furnace.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(6500)]); if (!A()) return;
    this.hideBubble();

    this.updateSourceDisplay(['int x = Integer.parseInt("42");']);
    await this.runConversionChoreography("42", "x");
    if (!A()) return;
    await this.bitSay("The String '42' — two characters, four and two, ink on paper. The furnace read each character, validated it as a digit, and smelted the text into pure int metal: 42. Notice: the bar sits in an INT container. Not a String, not an Integer object — a primitive int. The text is gone; the number remains.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(6500)]); if (!A()) return;
    this.hideBubble();
    this.clearFurnace();
    this.containerValueText.setText("—").setColor(HEX_GRAY);
    this.containerNameText.setText("");

    this.updateSourceDisplay(['int y = Integer.parseInt("abc");']);
    await this.runConversionChoreography("abc", "y");
    if (!A()) return;
    await this.bitSay("THE CRASH — NumberFormatException. 'abc' contains no digits; the furnace had nothing to smelt. This is a RUNTIME error, not a compile error — the compiler saw a String going into parseInt and said 'looks fine.' Only at run time, when the furnace actually reads the characters, does it discover the fraud. Runtime crashes are the assayer's hazard.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(6500)]); if (!A()) return;
    this.hideBubble();
    this.clearFurnace();

    this.updateSourceDisplay(['int z = Integer.parseInt("3.14");']);
    await this.runConversionChoreography("3.14", "z");
    if (!A()) return;
    await this.bitSay("A decimal point is NOT a digit — '3.14' is not a valid INTEGER. The furnace is strict: digits and an optional leading minus, nothing else. No dots, no spaces, no letters. For decimals, there's a different instrument — the Decimal Crucible — but that's the next room.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(6500)]); if (!A()) return;
    this.hideBubble();
    this.clearFurnace();

    this.updateSourceDisplay(['int n = Integer.parseInt("-7");']);
    await this.runConversionChoreography("-7", "n");
    if (!A()) return;
    await this.bitSay("Negative numbers: a leading minus is the ONE non-digit the furnace accepts — it must be the FIRST character. '-7' smelts to -7. But '7-' or '--7' would crash. The minus has one legal position: the front of the line.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(6500)]); if (!A()) return;
    this.hideBubble();
    this.clearFurnace();
    this.containerValueText.setText("—").setColor(HEX_GRAY);
    this.containerNameText.setText("");

    this.updateSourceDisplay(["int bad = parseInt(\"5\");"]);
    this.showCompileErrorStamp();
    await this.delay(700); if (!A()) return;
    await this.bitSay("One last rule: the furnace belongs to the Integer class — the WRAPPER class for int, capital I. Integer.parseInt, not just parseInt. And not int.parseInt — 'int' is a primitive keyword with no methods. The wrapper wraps the primitive; the method lives on the wrapper. Remember it, Assayer — the office is yours!");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(6500)]); if (!A()) return;
    this.hideBubble();

    this.clearFurnace();
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
    this.clearFurnace();
    this.containerValueText.setText("—").setColor(HEX_GRAY);
    this.containerNameText.setText("");
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
    g.lineStyle(1, C_COPPER, 0.5);
    g.strokeRoundedRect(-260, -30, 520, 60, 10);
    const badge = this.add.circle(-230, 0, 15, C_COPPER);
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
      draw(C_COPPER);
      const label = opt.label || opt.value;
      const txt = this.add.text(0, 0, label, { font: "bold 13px Courier New", color: "#e8eaf6", wordWrap: { width: w - 20 }, align: "center" }).setOrigin(0.5);
      if (txt.height > h - 6) txt.setFontSize(9);
      c.add([g, txt]);
      c.setSize(w, h);
      c.setInteractive({ useHandCursor: true });
      c.on("pointerover", () => { if (!this.inputLocked) draw(C_GOLD); });
      c.on("pointerout", () => { if (!this.inputLocked) draw(C_COPPER); });
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
        dg.lineStyle(2, highlight ? 0xffab00 : C_COPPER, 0.6);
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
      draw(C_COPPER);
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
      c.on("pointerout", () => { if (!this.inputLocked) draw(C_COPPER); });
      this.cartridges.push({ container: c, def, home });
      this.roundElements.push(c);
    });

    const btn = this.add.container(470, 600).setDepth(42);
    const bg = this.add.graphics();
    const bdraw = (enabled, hover) => {
      bg.clear();
      bg.fillStyle(enabled ? C_COPPER : 0x2a2f36, hover && enabled ? 1 : 0.95);
      bg.fillRoundedRect(-65, -22, 130, 44, 22);
    };
    bdraw(false, false);
    const bt = this.add.text(0, 0, "SMELT", { font: "bold 15px Arial", color: "#0a1208" }).setOrigin(0.5);
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
    this.clearFurnace();

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
      await this.showBitFeedback(MISCONCEPTION_FEEDBACK[failTag] || config.revealNote || "The furnace shows exactly what your code produced — compare it against the mission and adjust.");
      if (!this._alive) return;
      this.inputLocked = false;
      this.clearFurnace();
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
  // HONEST EVALUATOR — Integer.parseInt (character-validated: optional
  // leading '-' then one-or-more digits, nothing else; valid input
  // smelts to a real int via the furnace choreography; invalid input
  // throws NumberFormatException — a RUNTIME crash, never a compile
  // error), left-to-right +/concat (Java's real rule: once ANY operand
  // in a chain is a String, everything from that point on concatenates
  // as text; otherwise + is numeric addition), a single top-level *
  // (String * anything is a compile error), and the wrapper-class /
  // wrong-method compile checks.
  // ══════════════════════════════════════════════════════════════

  isValidIntegerString(str) {
    return /^-?[0-9]+$/.test(str);
  }

  _splitTopPlus(expr) {
    const parts = [];
    let cur = "", inQuotes = false, depth = 0;
    for (let i = 0; i < expr.length; i++) {
      const ch = expr[i];
      if (ch === '"' && expr[i - 1] !== "\\") inQuotes = !inQuotes;
      if (!inQuotes) {
        if (ch === "(" || ch === "[") depth++;
        if (ch === ")" || ch === "]") depth--;
        if (ch === "+" && depth === 0) { parts.push(cur.trim()); cur = ""; continue; }
      }
      cur += ch;
    }
    if (cur.trim() || parts.length) parts.push(cur.trim());
    return parts;
  }

  _splitTopMul(expr) {
    let depth = 0, inQuotes = false;
    for (let i = 0; i < expr.length; i++) {
      const ch = expr[i];
      if (ch === '"' && expr[i - 1] !== "\\") inQuotes = !inQuotes;
      if (!inQuotes) {
        if (ch === "(" || ch === "[") depth++;
        else if (ch === ")" || ch === "]") depth--;
        else if (ch === "*" && depth === 0) return [expr.slice(0, i).trim(), expr.slice(i + 1).trim()];
      }
    }
    return null;
  }

  async resolveExpr(expr, vars) {
    const t = expr.trim();

    const mulParts = this._splitTopMul(t);
    if (mulParts) {
      const l = await this.resolveExpr(mulParts[0], vars);
      if (!l.ok) return l;
      const r = await this.resolveExpr(mulParts[1], vars);
      if (!r.ok) return r;
      if (l.type === "String" || r.type === "String") {
        this.showCompileErrorStamp();
        return { ok: false, crash: "compile" };
      }
      return { ok: true, value: Number(l.value) * Number(r.value), type: "int" };
    }

    // Top-level + MUST be split before the parseInt/static-call regexes
    // below: those are anchored-whole-string matches, and an anchored
    // "\(.+\)$" is greedy — it would swallow a compound expression like
    // "Integer.parseInt(a) + Integer.parseInt(b)" whole (capturing
    // "a) + Integer.parseInt(b" as the "argument"), exactly the bug
    // class from misparsing compound expressions with anchored regexes.
    const plusParts = this._splitTopPlus(t);
    if (plusParts.length > 1) {
      let accValue = null, accIsString = false;
      for (let i = 0; i < plusParts.length; i++) {
        const pt = plusParts[i].trim();
        let partVal, partType;
        if (/^".*"$/.test(pt)) { partVal = pt.slice(1, -1); partType = "String"; }
        else {
          const r = await this.resolveExpr(pt, vars);
          if (!r.ok) return r;
          partVal = r.value; partType = r.type;
        }
        if (i === 0) { accValue = partVal; accIsString = partType === "String"; }
        else if (accIsString || partType === "String") { accValue = String(accValue) + String(partVal); accIsString = true; }
        else { accValue = Number(accValue) + Number(partVal); }
      }
      return { ok: true, value: accValue, type: accIsString ? "String" : "int" };
    }

    const parseIntMatch = t.match(/^Integer\.parseInt\((.+)\)$/);
    if (parseIntMatch) {
      const argRes = await this.resolveExpr(parseIntMatch[1].trim(), vars);
      if (!argRes.ok) return argRes;
      const strVal = String(argRes.value);
      const outcome = await this.runConversionChoreography(strVal, null);
      if (!outcome.ok) { this.updateResultRow("crash"); return { ok: false, crash: "nfe" }; }
      this.updateResultRow("int");
      return { ok: true, value: outcome.value, type: "int" };
    }

    // A static call on the WRONG class or the WRONG method name — e.g.
    // int.parseInt(...) (primitive has no methods) or
    // Integer.parseDouble(...) (that method lives on Double, not Integer;
    // even if it existed, it would return a double, a compile-time type
    // mismatch against an int-typed destination).
    const staticCallMatch = t.match(/^(\w+)\.(\w+)\(/);
    if (staticCallMatch && (staticCallMatch[1] !== "Integer" || staticCallMatch[2] !== "parseInt")) {
      this.showCompileErrorStamp();
      return { ok: false, crash: "compile" };
    }

    if (/^".*"$/.test(t)) return { ok: true, value: t.slice(1, -1), type: "String" };
    if (/^-?\d+\.\d+$/.test(t)) return { ok: true, value: parseFloat(t), type: "double" };
    if (/^-?\d+$/.test(t)) return { ok: true, value: parseInt(t, 10), type: "int" };

    if (vars[t] !== undefined) return { ok: true, value: vars[t].value, type: vars[t].type };

    return { ok: false, crash: "eval" };
  }

  async execStatement(line, vars) {
    const declVar = line.match(/^(int|double|String)\s+(\w+)\s*=\s*(.*);$/);
    if (declVar) {
      const varType = declVar[1], name = declVar[2], rhs = declVar[3].trim();
      const r = await this.resolveExpr(rhs, vars);
      if (!r.ok) return r;
      if (varType === "int" && r.type === "String") {
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
      this._printedLines.push(String(r.value));
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
      console.warn("Level71Scene: /api/wellbeing/predict-struggle unreachable, skipping behavioral signal for this level:", e);
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
      this.clearFurnace();
      this.wipeSlate();
      this.tweens.add({ targets: this.furnaceGlow, alpha: 0, duration: 400 });
      this.tweens.add({ targets: [this.flameInner, this.flameOuter], alpha: 0, duration: 400 });
      const motes = this.ambient;
      this.ambient = null;
      (motes || []).forEach((m) => this.tweens.add({ targets: m, alpha: 0, duration: 1200 }));

      const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
      this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });
      const title = this.add.text(640, 240, "FURNACE COLD", { font: "bold 36px Georgia", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
      this.tweens.add({ targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut", onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }) });
      this.add.text(640, 310, `Score: ${this.score}`, { font: "21px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
      this.add.text(640, 350, `Rounds Completed: ${this.currentRound} / 12`, { font: "18px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);
      this._makeButton(525, 420, "RELIGHT THE FURNACE", 200, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
      this._makeButton(755, 420, "RETURN TO MENU", 200, 50, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.start("MenuScene"));
    })();
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearRound();
    this.hideBubble();

    try { GameManager.completeLevel(70, Math.round((this.correctFirstTry / 12) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("integer_parseInt_schema"); } catch (_) {}
    try {
      localStorage.setItem("level71_results", JSON.stringify({
        level: 71, concept: "integer_parseInt", phase: "accretion",
        score: this.score, accuracy: this.correctFirstTry / 12, avgTime: this.totalTime / 12,
        comboMax: this.maxCombo, stars: this._starRating(), livesRemaining: this.lives,
        attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.furnaceFinale().then(() => { if (this._alive) this.showScoreTally(); });
  }

  async furnaceFinale() {
    this._furnaceGlowGold = true;
    this.tweens.add({ targets: this.furnaceGlow, fillColor: C_GOLD, duration: 500 });
    this.tweens.add({ targets: [this.flameInner, this.flameOuter], fillColor: C_GOLD, duration: 500 });

    for (let i = 0; i < 8; i++) {
      const val = Phaser.Math.Between(1, 99);
      const bar = this.add.container(CONT_X, CONT_Y + 25).setAlpha(0).setScale(0.6).setDepth(80);
      const bg = this.add.graphics();
      bg.fillStyle(C_COPPER, 1);
      bg.lineStyle(1.5, 0x8a6435, 1);
      bg.fillRoundedRect(-24, -14, 48, 28, 4);
      bg.strokeRoundedRect(-24, -14, 48, 28, 4);
      const txt = this.add.text(0, 0, String(val), { font: "bold 14px Courier New", color: "#241a0e" }).setOrigin(0.5);
      bar.add([bg, txt]);
      const tx = 300 + Math.random() * 680, ty = 200 + Math.random() * 300;
      this.tweens.add({ targets: bar, alpha: 1, scale: 1, x: tx, y: ty, duration: 500, ease: "Back.easeOut", delay: i * 120 });
      this.time.delayedCall(i * 120 + 900, () => { if (bar.active) this.tweens.add({ targets: bar, alpha: 0, duration: 300, onComplete: () => bar.destroy() }); });
    }
    this.tweens.add({ targets: this._burnerContainer, scale: 1.3, duration: 200, yoyo: true, repeat: 3 });
    this.createConfetti(FURNACE_CX, 350, 40);
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
    panel.lineStyle(2, C_COPPER, 1);
    panel.strokeRoundedRect(360, 150, 560, 420, 16);

    const title = this.add.text(640, 190, "FURNACE LIT", { font: "bold 30px Georgia", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(91).setScale(0);
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
    bg.lineStyle(1.2, C_COPPER, 0.9);
    bg.strokeRect(-14, -8, 10, 14);
    bg.fillStyle(C_COPPER, 0.8);
    bg.fillRoundedRect(2, -2, 12, 8, 2);
    badge.add(bg);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 1950 });
    const badgeLbl = this.add.text(640, 505, "parseInt() SCHEMA ACQUIRED", { font: "bold 14px Georgia", color: HEX_GOLD }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: badgeLbl, alpha: 1, duration: 300, delay: 2100 });

    this._makeButton(500, 545, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(770, 545, "NEXT: The Decimal Crucible →", 300, 44, { fill: 0x00733a, stroke: C_GREEN_BRIGHT, textColor: "#ffffff" }, () => {
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
