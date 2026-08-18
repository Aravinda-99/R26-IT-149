/**
 * Level 64 — "The Specimen Hall" (Arrays Methods: Accretion Phase —
 * Arrays.toString())
 * ===========================================================================
 * Opens the Arrays Wing. The hero mechanic is the Specimen Tray — a FIXED-
 * SIZE row of compartments — and the Display Plaque, which assembles
 * Arrays.toString(tray)'s bracket-comma-space label. Printing the tray
 * directly (no toString) produces the CURSED LABEL — a garbled hash
 * string — dramatizing Java's most-FAQ'd array surprise. The evaluator is
 * honest: array creation, the static Arrays.toString(arr) call (vs the
 * instance arr.toString() trap, which returns the SAME hash as a bare
 * println), bracket access with bounds checking, the .length property
 * (no parens, unlike String's .length()), and the ArrayList-method
 * compile checks (.get/.add/.size don't exist on arrays).
 */

import Phaser from "phaser";
import { GameManager } from "../../../../GameManager.js";
import { BadgeSystem } from "../../../../BadgeSystem.js";

const W = 1280, H = 720;

const C_CYAN = 0x4fc3f7, C_GOLD = 0xffd740, C_ORANGE = 0xff9800, C_BLUE_GRAY = 0x8ea6c8;
const C_GREEN_BRIGHT = 0x00e676, C_RED = 0xf44336, C_GRAY = 0x78909c, C_BRASS = 0xc8a05a;
const HEX_CYAN = "#4fc3f7", HEX_GOLD = "#ffd740", HEX_ORANGE = "#ff9800", HEX_BLUE_GRAY = "#8ea6c8";
const HEX_GREEN_BRIGHT = "#00e676", HEX_RED = "#f44336", HEX_GRAY = "#78909c", HEX_BRASS = "#c8a05a";
const HEX_GREEN_MUTED = "#5d7a5d";

// Specimen tray
const TRAY_X0 = 310, TRAY_X1 = 810, TRAY_Y0 = 200, TRAY_Y1 = 360;
const TRAY_CX = (TRAY_X0 + TRAY_X1) / 2;
// Display plaque
const PLAQUE_X = 240, PLAQUE_Y = 400, PLAQUE_W = 320, PLAQUE_H = 60;
// Curator's slate
const SLATE_X = 860, SLATE_Y = 130, SLATE_W = 370, SLATE_H = 300;

const TUTORIAL_KEY = "level64_tutorial_done";

// ══════════════════════════════════════════════════════════════
// ROUND CONFIGURATION
// ══════════════════════════════════════════════════════════════
const ROUNDS = [
  // ── Type A: Display Prediction ──
  { round: 1, type: "predict",
    arrayInit: "{5, 10, 15}", arrayType: "int[]",
    source: "int[] data = {5, 10, 15};\nSystem.out.println(Arrays.toString(data));",
    question: "What prints?", correct: "[5, 10, 15]",
    options: [
      { value: "[5, 10, 15]", tag: null },
      { value: "5 10 15", tag: "toString_no_brackets_belief" },
      { value: "{5, 10, 15}", tag: "toString_curly_brackets_belief" },
      { value: "[I@...", tag: "toString_prints_hash_belief", label: "[I@4e50df2e (the hash)" },
    ],
    concept: "basic_toString_int" },

  { round: 2, type: "predict",
    arrayInit: '{"Quartz", "Amber", "Jade"}', arrayType: "String[]",
    source: 'String[] gems = {"Quartz", "Amber", "Jade"};\nSystem.out.println(Arrays.toString(gems));',
    question: "What prints?", correct: "[Quartz, Amber, Jade]",
    options: [
      { value: "[Quartz, Amber, Jade]", tag: null },
      { value: '["Quartz", "Amber", "Jade"]', tag: "toString_includes_quotes_belief" },
      { value: "Quartz, Amber, Jade", tag: "toString_no_brackets_belief" },
      { value: "[Ljava.lang.String;@...", tag: "toString_prints_hash_belief" },
    ],
    revealNote: "String arrays: the values appear WITHOUT their source-code quotes — Quartz, not \"Quartz\". The display is human-readable, not code-readable.",
    concept: "basic_toString_string" },

  { round: 3, type: "predict",
    arrayInit: "{}", arrayType: "int[]",
    source: "int[] empty = {};\nSystem.out.println(Arrays.toString(empty));",
    question: "What prints?", correct: "[]",
    options: [
      { value: "[]", tag: null },
      { value: "(nothing)", tag: "empty_prints_nothing_belief" },
      { value: "null", tag: "empty_is_null_belief" },
      { value: "[I@...", tag: "toString_prints_hash_belief" },
    ],
    revealNote: "An empty tray: zero compartments, the scan finds nothing, the plaque reads [] — brackets with no contents. Not null, not blank — an honest empty display.",
    concept: "empty_array_toString" },

  // ── Type B: The Curse & Syntax Discriminations ──
  { round: 4, type: "predict",
    arrayInit: "{1, 2, 3}", arrayType: "int[]",
    source: "int[] nums = {1, 2, 3};\nSystem.out.println(nums);",
    question: "What prints?", correct: "hash",
    options: [
      { value: "hash", tag: null, label: "[I@... (the hash — NOT the contents)" },
      { value: "[1, 2, 3]", tag: "array_prints_contents_belief" },
      { value: "error", tag: "array_hash_is_error_belief", label: "Runtime error" },
      { value: "1, 2, 3", tag: "array_prints_values_belief" },
    ],
    revealNote: "THE CURSE in the wild: println(nums) prints the tray's ADDRESS, not its specimens. The code compiled, the code ran — it just printed something no human can use. Arrays.toString() is the cure.",
    concept: "cursed_label" },

  { round: 5, type: "predict",
    arrayInit: '{"A", "B", "C"}', arrayType: "String[]",
    source: 'String[] arr = {"A", "B", "C"};\nString x = arr.get(1);',
    question: "What happens?", correct: "compile_error",
    options: [
      { value: "compile_error", tag: null, label: "COMPILE ERROR — arrays don't have .get()" },
      { value: "x_is_B", tag: "arraylist_method_on_array_belief", label: 'x = "B"' },
      { value: "x_is_A", tag: "arraylist_method_on_array_belief", label: 'x = "A"' },
      { value: "runtime_error", tag: "runtime_vs_compile_confusion", label: "Runtime exception" },
    ],
    revealNote: "Arrays are NOT ArrayLists — there is no .get() method. Bracket syntax: arr[1]. The tray has compartments, not methods. Same zero-based index, different grammar.",
    concept: "no_get_method" },

  { round: 6, type: "predict",
    arrayInit: "{10, 20, 30}", arrayType: "int[]",
    source: "int[] arr = {10, 20, 30};\nSystem.out.println(arr.length);",
    question: "What prints?", correct: "3",
    options: [
      { value: "3", tag: null },
      { value: "compile_error", tag: "dot_length_parens_belief", label: "COMPILE ERROR" },
      { value: "2", tag: "length_is_last_index_belief" },
      { value: "30", tag: "length_returns_last_belief" },
    ],
    revealNote: "arr.length — a PROPERTY, not a method. No parentheses! (String had .length() with parens; arrays have .length without.) Three compartments, length 3. And that length NEVER changes — the tray is fixed.",
    concept: "length_property" },

  { round: 7, type: "predict",
    arrayInit: "{5, 10}", arrayType: "int[]",
    source: "int[] arr = {5, 10};\narr.toString();",
    question: "What does arr.toString() return?", correct: "the_hash",
    options: [
      { value: "the_hash", tag: null, label: "[I@... (the hash — NOT the readable form)" },
      { value: "[5, 10]", tag: "arrays_instance_call_belief", label: "[5, 10]" },
      { value: "compile_error", tag: "toString_on_array_error_belief", label: "COMPILE ERROR" },
      { value: "5, 10", tag: "toString_no_brackets_belief" },
    ],
    revealNote: "The DEEPEST trap: arr.toString() calls the ARRAY'S OWN toString — inherited from Object — which returns the HASH, not the readable label. Only ARRAYS.toString(arr) — the static utility — scans and formats. The class name makes all the difference.",
    concept: "instance_vs_static_toString" },

  // ── Type C: Expressions with toString ──
  { round: 8, type: "predict",
    arrayInit: "{1, 2, 3}", arrayType: "int[]",
    source: 'int[] arr = {1, 2, 3};\nString label = Arrays.toString(arr);\nSystem.out.println("Tray: " + label);',
    question: "What prints?", correct: "Tray: [1, 2, 3]",
    options: [
      { value: "Tray: [1, 2, 3]", tag: null },
      { value: "Tray: [I@...", tag: "label_is_hash_belief" },
      { value: "[1, 2, 3]", tag: "prefix_missing_belief" },
      { value: "Tray: 1, 2, 3", tag: "toString_no_brackets_belief" },
    ],
    revealNote: "toString returns a STRING — and strings concatenate freely. The label captured [1, 2, 3]; the println dressed it with a prefix. Same brackets, same commas as ArrayList.toString() — the format is universal.",
    concept: "toString_into_concat" },

  { round: 9, type: "predict",
    arrayInit: "{4, 5, 6}", arrayType: "int[]",
    source: "int[] arr = {4, 5, 6};\nString s = Arrays.toString(arr);\narr[0] = 99;\nSystem.out.println(s);",
    question: "What prints?", correct: "[4, 5, 6]",
    options: [
      { value: "[4, 5, 6]", tag: null },
      { value: "[99, 5, 6]", tag: "toString_is_live_view_belief" },
      { value: "error", tag: "modification_crashes_belief", label: "Runtime error" },
      { value: "[4, 5, 6, 99]", tag: "array_size_dynamic_belief" },
    ],
    revealNote: "toString captured a SNAPSHOT — the String was built at call time and is now independent. Changing the tray afterward doesn't rewrite the label. And note: arr[0] = 99 is legal (overwriting a specimen), but the tray didn't grow — three slots, fixed.",
    concept: "toString_snapshot" },

  // ── Type D: Curator Command ──
  { round: 10, type: "command",
    arrayInit: "{7, 14, 21}", arrayType: "int[]",
    source: "int[] readings = {7, 14, 21};\nSystem.out.println(<slot:display>);",
    mission: "Display the tray's contents on the plaque — readable, not cursed.",
    slots: [{ id: "display", hint: "the readable display" }],
    cartridges: [
      { code: "Arrays.toString(readings)", correct: true },
      { code: "readings", tag: "array_prints_contents_belief" },
      { code: "readings.toString()", tag: "arrays_instance_call_belief" },
      { code: "arrays.toString(readings)", tag: "arrays_lowercase_belief" },
    ],
    tests: [{ expectedOutput: "[7, 14, 21]" }],
    concept: "command_basic_display" },

  { round: 11, type: "command",
    arrayInit: '{"Mars", "Venus", "Earth"}', arrayType: "String[]",
    source: 'String[] planets = {"Mars", "Venus", "Earth"};\nString second = <slot:access>;\nSystem.out.println("Second: " + second);',
    mission: "Access the SECOND planet (Venus) and print it. For this tray: 'Second: Venus'.",
    slots: [{ id: "access", hint: "the second element" }],
    cartridges: [
      { code: "planets[1]", correct: true },
      { code: "planets.get(1)", tag: "arraylist_method_on_array_belief" },
      { code: "planets[2]", tag: "array_bracket_off_by_one" },
      { code: "planets(1)", tag: "parens_not_brackets_belief" },
    ],
    tests: [{ expectedOutput: "Second: Venus" }],
    concept: "command_bracket_access" },

  { round: 12, type: "command",
    arrayInit: "{100, 200, 300}", arrayType: "int[]",
    source: 'int[] vals = {100, 200, 300};\nSystem.out.println("Length: " + <slot:len>);\nSystem.out.println("Contents: " + <slot:display>);',
    mission: "Print the tray's LENGTH, then its CONTENTS. For this tray:\nLength: 3\nContents: [100, 200, 300]",
    slots: [{ id: "len", hint: "the length" }, { id: "display", hint: "the readable display" }],
    cartridges: [
      { code: "vals.length", correct: true, slotId: "len" },
      { code: "vals.length()", tag: "dot_length_parens_belief", slotId: "len" },
      { code: "vals.size()", tag: "arraylist_method_on_array_belief", slotId: "len" },
      { code: "Arrays.toString(vals)", correct: true, slotId: "display" },
      { code: "vals", tag: "array_prints_contents_belief", slotId: "display" },
      { code: "vals.toString()", tag: "arrays_instance_call_belief", slotId: "display" },
    ],
    tests: [{ expectedOutput: "Length: 3⏎Contents: [100, 200, 300]" }],
    postMissionNote: "Bit: 'Length without parens — a property, not a method. And the display through Arrays.toString, never plain println. Two rules for the tray: measure with .length, read with Arrays.toString. The curator's first tools.'",
    concept: "command_length_and_display" },
];

const MISCONCEPTION_FEEDBACK = {
  array_prints_contents_belief: "The plaque showed the ADDRESS, not the specimens — println(arr) prints the tray's identity hash, never its contents. Arrays.toString(arr) reads and formats them.",
  array_hash_is_error_belief: "Not an error — the code ran. The hash IS valid output; it's just useless to humans. The tray needs its labeller: Arrays.toString.",
  array_prints_values_belief: "Not a plain value list either — println(arr) prints the tray's identity hash, not the specimens at all.",
  arraylist_method_on_array_belief: "Arrays are NOT ArrayLists — there's no .get(), no .add(), no .size(). Brackets for access (arr[i]), .length for size (no parens). Same zero-indexed idea, different grammar entirely.",
  array_bracket_off_by_one: "The second element sits at index 1 — indices start at zero in arrays and ArrayLists alike. planets[1] is Venus.",
  arrays_instance_call_belief: "arr.toString() calls the ARRAY'S OWN toString — inherited from Object — which returns the HASH. Only the static utility ARRAYS.toString(arr) scans and formats. The class name is the whole difference.",
  arrays_lowercase_belief: "Case is law — 'arrays' is nobody; 'Arrays' is the utility class. Capital A, like Math's capital M.",
  import_missing_belief: "Without `import java.util.Arrays;` at the top, Java doesn't recognize the name. The tray is built-in; the LABELLER is imported.",
  toString_modifies_array_belief: "toString READS — it never moves, adds, or removes specimens. The label is a copy of the moment; the tray is untouched.",
  toString_returns_array_belief: "toString returns a STRING — '[1, 2, 3]' is text, not an array. You can't index into it with brackets; you CAN concatenate, print, or compare it.",
  array_size_dynamic_belief: "Three slots means three slots FOREVER — arrays don't grow. arr[0] = 99 overwrites an existing specimen; it never adds a fourth compartment.",
  dot_length_parens_belief: ".length is a PROPERTY on arrays — no parentheses. (String has .length() the method; ArrayList has .size() the method; arrays have .length the field.) Three containers, three grammars.",
  toString_no_brackets_belief: "The format includes brackets: [5, 10, 15]. Without them, how would you tell a labelled tray from a list of loose values?",
  toString_curly_brackets_belief: "Curly braces are the SOURCE CODE initializer — the plaque label uses SQUARE brackets: [5, 10, 15]. Different contexts, different brackets.",
  toString_includes_quotes_belief: 'The display is human-readable — Quartz, not "Quartz". Source-code quotes stay in the source code.',
  toString_is_live_view_belief: "The String was built at call time — a snapshot, now independent. Changing the tray afterward doesn't rewrite old labels.",
  toString_prints_hash_belief: "Arrays.toString (the static utility) produces the readable label — you're thinking of plain println(arr), which prints the hash. The class name in front changes everything.",
  parens_not_brackets_belief: "Parentheses call methods; BRACKETS access array slots. planets[1], not planets(1).",
  length_is_last_index_belief: "length counts compartments; the last INDEX is length − 1. Three compartments, indices 0–2. The familiar cliff from prior wings.",
  length_returns_last_belief: ".length returns the COUNT of slots, not the value in the last one.",
  empty_prints_nothing_belief: "An empty tray still prints something — [] — brackets with nothing between them. Not silence.",
  empty_is_null_belief: "An empty array isn't null — it's a real tray with zero compartments. Arrays.toString shows that honestly as [].",
  label_is_hash_belief: "label already holds the READABLE string — Arrays.toString ran before the print. The hash never entered the picture.",
  prefix_missing_belief: 'The concatenation ("Tray: " + label) keeps BOTH pieces — the prefix text and the label. Neither half vanishes.',
  modification_crashes_belief: "Overwriting a slot (arr[0] = 99) is completely legal — no crash. It just doesn't reach back and rewrite a String captured earlier.",
  runtime_vs_compile_confusion: "Forbidden calls and missing methods die at COMPILE time — before anything runs.",
  toString_on_array_error_belief: "No compile error — every object (arrays included) inherits toString() from Object. It compiles and runs; it just returns the hash, not a readable label.",
};

const HINTS = {
  1: "Arrays.toString(data) — brackets, commas, the values themselves.",
  2: "Arrays.toString on Strings drops the source-code quotes: [Quartz, Amber, Jade].",
  3: "Zero compartments, zero values between the brackets: [].",
  4: "println(nums) without toString prints the hash — the tray's address, not its contents.",
  5: "Arrays have no .get() — that's ArrayList. Brackets: arr[1].",
  6: "arr.length — no parentheses. Three compartments, length 3.",
  7: "arr.toString() is Object's toString — the hash. Only Arrays.toString(arr) is readable.",
  8: '"Tray: " + label — label already holds "[1, 2, 3]" from Arrays.toString.',
  9: "s was captured before arr[0] = 99 — s still holds the old snapshot [4, 5, 6].",
  10: "Arrays.toString(readings) — the readable display.",
  11: "planets[1] — index 1 is the second element, Venus.",
  12: "vals.length (no parens) for the count; Arrays.toString(vals) for the display.",
};

export class Level64Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level64Scene" });
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
    this.inputLocked = true;
    this.gameEnded = false;
    this._alive = true;
    this.firstCurseAnnotationShown = false;
    this.firstBareCallAnnotationShown = false;
    this._hashCounter = 0;
  }

  preload() {}

  create() {
    this._alive = true;
    this.createParticleTexture();
    this.createBackground();
    this.createHallInterior();
    this.createMuseumFloor();
    this.createParticles();
    this.createSpecimenTray();
    this.createDisplayPlaque();
    this.createCuratorsSlate();
    this.createSourceDisplay();
    this.createHUD();
    this.createExpressionMonitor();
    this.createBit();

    this.events.on("shutdown", () => { this._alive = false; });
    this.checkTutorial();
  }

  update(time, delta) {
    this.updateParticles(time, delta);
    this.updateDisplayCaseGlow(time);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // SETUP — THE SPECIMEN HALL INTERIOR
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l64_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l64_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x0a1208).setDepth(0);
  }

  createHallInterior() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x1a0e05, 1);
    g.fillRect(0, 108, W, 108);
    g.lineStyle(1, 0x3a2618, 0.5);
    for (let x = 0; x < W; x += 30) g.lineBetween(x, 108, x, 216);
    g.fillStyle(0x0a1208, 1);
    g.fillRect(0, 0, W, 108);
    g.lineStyle(2, C_BRASS, 0.4);
    g.lineBetween(0, 108, W, 108);

    this._caseGlows = [];
    [200, 550, 900].forEach((cx) => {
      const cg = this.add.graphics().setDepth(2);
      cg.fillStyle(0x0a1208, 1);
      cg.lineStyle(2, 0x3a2618, 1);
      cg.fillRect(cx, 60, 100, 70);
      cg.strokeRect(cx, 60, 100, 70);
      cg.lineStyle(1, 0xe8eaf6, 0.08);
      cg.lineBetween(cx + 10, 60, cx + 90, 130);
      const colors = [0xc8a05a, 0x8a6435, 0x5d7a5d, 0xa0522d];
      for (let i = 0; i < 4; i++) {
        const sx = cx + 15 + (i % 2) * 40, sy = 80 + Math.floor(i / 2) * 30;
        const shape = i % 3;
        if (shape === 0) this.add.circle(sx, sy, 6, colors[i]).setAlpha(0.3).setDepth(3);
        else if (shape === 1) this.add.triangle(sx, sy, -6, 6, 6, 6, 0, -6, colors[i]).setAlpha(0.3).setDepth(3);
        else this.add.rectangle(sx, sy, 10, 10, colors[i]).setAlpha(0.3).setDepth(3);
      }
      const glow = this.add.ellipse(cx + 50, 130, 90, 20, 0xffa726, 0).setDepth(2);
      this._caseGlows.push(glow);
    });

    const skel = this.add.graphics().setDepth(2).setAlpha(0.2);
    skel.lineStyle(1.5, 0x3a2618, 1);
    skel.lineBetween(60, 100, 60, 240);
    for (let i = 0; i < 5; i++) {
      const y = 110 + i * 26;
      skel.beginPath();
      skel.arc(60, y, 30, Math.PI * 0.15, Math.PI * 0.85, false);
      skel.strokePath();
    }

    const bg = this.add.graphics().setDepth(3);
    bg.fillStyle(0x0a1208, 1);
    bg.lineStyle(1, C_BRASS, 0.5);
    bg.fillRoundedRect(400, 12, 360, 26, 3);
    bg.strokeRoundedRect(400, 12, 360, 26, 3);
    this.add.text(580, 25, "T H E   S P E C I M E N   H A L L", { font: "bold 15px Georgia", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.7).setDepth(4);
  }

  updateDisplayCaseGlow(time) {
    if (!this._caseGlows) return;
    this._caseGlows.forEach((g, i) => {
      g.setAlpha(0.02 + Math.abs(Math.sin(time * 0.0006 + i)) * 0.02);
    });
  }

  createMuseumFloor() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x0d0a06, 1);
    g.fillRect(0, 635, W, 85);
    for (let x = 0; x < W; x += 40) {
      for (let y = 635; y < 720; y += 40) {
        if (((x / 40) + (y / 40)) % 2 === 0) {
          g.fillStyle(0x100d08, 0.3);
          g.fillRect(x, y, 40, 40);
        }
      }
    }
    g.lineStyle(2, C_BRASS, 0.4);
    g.lineBetween(0, 637, W, 637);
  }

  createParticles() {
    this.ambient = [];
    const colors = [0xc8a05a, 0x5d7a5d, 0xa0522d];
    for (let i = 0; i < 6; i++) {
      this.ambient.push(this.add.circle(Phaser.Math.Between(0, W), Phaser.Math.Between(150, 630), 1, Phaser.Utils.Array.GetRandom(colors), Phaser.Math.FloatBetween(0.03, 0.05)).setDepth(2));
    }
  }

  updateParticles(time, delta) {
    if (!this.ambient) return;
    const step = 0.004 * (delta / 16.7);
    this.ambient.forEach((p, i) => {
      p.x += step * (i % 2 === 0 ? 1 : -0.6);
      p.y += Math.sin(time * 0.0003 + i) * 0.015;
      if (p.x > W) p.x = 0; if (p.x < 0) p.x = W;
      if (p.y > 630) p.y = 150; if (p.y < 150) p.y = 630;
    });
  }

  createAnnotation(x, y, text, colorHex) {
    const t = this.add.text(x, y, text, { font: "italic 13px Georgia", color: colorHex, wordWrap: { width: 300 }, align: "center" }).setOrigin(0.5).setDepth(70).setAlpha(0);
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
    const p = this.add.particles(x, y, "l64_dot", {
      speed: { min: 80, max: 240 }, angle: { min: 0, max: 360 }, scale: { start: 0.9, end: 0 }, lifespan: 500,
      tint: [C_BRASS, 0x8a6435, 0x5d7a5d, 0xa0522d, 0xffffff], emitting: false,
    }).setDepth(85);
    p.explode(count);
    this.time.delayedCall(900, () => p.destroy());
  }

  screenShake(intensity = 0.004, duration = 150) {
    this.cameras.main.shake(duration, intensity);
  }

  // ══════════════════════════════════════════════════════════════
  // THE SPECIMEN TRAY (hero visual)
  // ══════════════════════════════════════════════════════════════

  createSpecimenTray() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0d0a06, 0.8);
    g.lineStyle(3, C_BRASS, 1);
    g.fillRoundedRect(TRAY_X0, TRAY_Y0, TRAY_X1 - TRAY_X0, TRAY_Y1 - TRAY_Y0, 6);
    g.strokeRoundedRect(TRAY_X0, TRAY_Y0, TRAY_X1 - TRAY_X0, TRAY_Y1 - TRAY_Y0, 6);
    g.lineStyle(1.5, C_BRASS, 0.6);
    g.lineBetween(TRAY_X0, TRAY_Y0 + 6, TRAY_X1, TRAY_Y0 + 6);
    [[TRAY_X0 + 4, TRAY_Y0 + 4], [TRAY_X1 - 4, TRAY_Y0 + 4]].forEach(([x, y]) => {
      g.fillStyle(C_BRASS, 0.7);
      g.fillCircle(x, y, 3);
    });
    g.fillStyle(C_BRASS, 0.8);
    g.fillRoundedRect(TRAY_X1 - 6, (TRAY_Y0 + TRAY_Y1) / 2 - 10, 10, 20, 3);

    this.add.text(TRAY_X0 + 10, TRAY_Y0 - 16, "SPECIMEN TRAY", { font: "bold 11px Georgia", color: HEX_BRASS }).setDepth(11).setAlpha(0.8);
    this.trayTypeBadge = this.add.text(TRAY_X1 - 10, TRAY_Y0 - 16, "int[]", { font: "bold 12px Courier New", color: HEX_BLUE_GRAY }).setOrigin(1, 0).setDepth(11);

    this.trayCompartmentLayer = this.add.container(0, 0).setDepth(11);
    this.traySpecimenLayer = this.add.container(0, 0).setDepth(12);
    this._trayCompartments = [];
  }

  updateTypeBadge(type) {
    this.trayTypeBadge.setText(type || "int[]");
  }

  clearTray() {
    this.trayCompartmentLayer.removeAll(true);
    this.traySpecimenLayer.removeAll(true);
    this._trayCompartments = [];
  }

  async populateTray(values, type) {
    this.clearTray();
    this.updateTypeBadge(type);
    const n = values.length;
    const innerX0 = TRAY_X0 + 8, innerX1 = TRAY_X1 - 8;
    const innerW = innerX1 - innerX0;
    const cellW = n > 0 ? innerW / n : innerW;

    if (n === 0) {
      const t = this.add.text(TRAY_CX, (TRAY_Y0 + TRAY_Y1) / 2, "(empty tray)", { font: "italic 14px Georgia", color: "#3a2618" }).setOrigin(0.5).setAlpha(0);
      this.trayCompartmentLayer.add(t);
      this.tweens.add({ targets: t, alpha: 0.6, duration: 300 });
      return;
    }

    for (let i = 0; i < n; i++) {
      const cellX = innerX0 + i * cellW;
      if (i > 0) {
        const dg = this.add.graphics();
        dg.lineStyle(1, C_BRASS, 0.4);
        dg.lineBetween(cellX, TRAY_Y0 + 10, cellX, TRAY_Y1 - 24);
        this.trayCompartmentLayer.add(dg);
      }
      const idxPlate = this.add.text(cellX + cellW / 2, TRAY_Y1 - 12, `[${i}]`, { font: "bold 12px Courier New", color: HEX_BRASS }).setOrigin(0.5).setAlpha(i === 0 ? 0.9 : 0.6);
      this.trayCompartmentLayer.add(idxPlate);
      this._trayCompartments.push({ x: cellX, w: cellW, idxPlate });
    }

    for (let i = 0; i < n; i++) {
      const comp = this._trayCompartments[i];
      const color = type === "String[]" ? C_CYAN : type === "double[]" ? C_ORANGE : C_GOLD;
      const cardW = Math.min(cellW - 12, 70), cardH = 40;
      const cx = comp.x + comp.w / 2, cy = (TRAY_Y0 + TRAY_Y1) / 2 - 8;
      const card = this.add.container(cx, cy).setAlpha(0).setScale(0.7);
      const cg = this.add.graphics();
      cg.fillStyle(color, 0.9);
      cg.lineStyle(1, Phaser.Display.Color.IntegerToColor(color).darken(30).color, 1);
      cg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 5);
      cg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 5);
      const display = String(values[i]);
      const txt = this.add.text(0, 0, display, { font: "bold 15px Courier New", color: "#0a1208" }).setOrigin(0.5);
      if (txt.width > cardW - 8) txt.setFontSize(10);
      card.add([cg, txt]);
      this.traySpecimenLayer.add(card);
      comp.card = card;
      comp.cardGfx = cg;
      comp.cardText = txt;
      comp.cardColor = color;
      comp.cardW = cardW;
      comp.value = values[i];
      this.tweens.add({ targets: card, alpha: 1, scale: 1, duration: 180, delay: i * 120, ease: "Back.easeOut" });
      await this.delay(80);
    }
    await this.delay(120);
  }

  async highlightCompartment(index) {
    const comp = this._trayCompartments[index];
    if (!comp) return;
    const ring = this.add.rectangle(comp.x + comp.w / 2, (TRAY_Y0 + TRAY_Y1) / 2 - 8, comp.cardW ? comp.cardW + 10 : 40, 48, 0, 0).setStrokeStyle(2, C_CYAN, 0.9).setDepth(13);
    this.tweens.add({ targets: comp.idxPlate, alpha: 1, scale: 1.3, duration: 120, yoyo: true });
    await this.delay(200);
    this.tweens.add({ targets: ring, alpha: 0, duration: 250, onComplete: () => ring.destroy() });
  }

  async overwriteSpecimen(index, value) {
    const comp = this._trayCompartments[index];
    if (!comp || !comp.card) return;
    comp.value = value;
    this.tweens.add({ targets: comp.card, scale: 0.7, alpha: 0.3, duration: 100 });
    await this.delay(110);
    comp.cardText.setText(String(value));
    if (comp.cardText.width > comp.cardW - 8) comp.cardText.setFontSize(10);
    this.tweens.add({ targets: comp.card, scale: 1, alpha: 1, duration: 140, ease: "Back.easeOut" });
    await this.delay(150);
  }

  // ══════════════════════════════════════════════════════════════
  // THE DISPLAY PLAQUE (signature choreography)
  // ══════════════════════════════════════════════════════════════

  createDisplayPlaque() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x1a1408, 1);
    g.lineStyle(2, C_BRASS, 1);
    g.fillRoundedRect(PLAQUE_X, PLAQUE_Y, PLAQUE_W, PLAQUE_H, 4);
    g.strokeRoundedRect(PLAQUE_X, PLAQUE_Y, PLAQUE_W, PLAQUE_H, 4);
    this.plaqueText = this.add.text(PLAQUE_X + PLAQUE_W / 2, PLAQUE_Y + PLAQUE_H / 2, "", { font: "bold 18px Courier New", color: "#e8eaf6", wordWrap: { width: PLAQUE_W - 20 }, align: "center" }).setOrigin(0.5).setDepth(11);
    this.scanBar = this.add.rectangle(TRAY_X0 + 8, (TRAY_Y0 + TRAY_Y1) / 2 - 8, 3, TRAY_Y1 - TRAY_Y0 - 30, C_GOLD, 0.8).setDepth(13).setVisible(false);
  }

  clearPlaque() {
    this.plaqueText.setText("").setColor("#e8eaf6").setFontSize(16);
  }

  _fakeHash(roundIndex, type) {
    const hex = ((roundIndex + 1) * 7919 + 12345).toString(16).padStart(8, "0");
    return type === "String[]" ? `[Ljava.lang.String;@${hex}` : `[I@${hex}`;
  }

  /** The signature choreography: scan sweep → opening bracket → each
   * value ghost-copies from its compartment onto the plaque, comma-
   * typed between → closing bracket. Returns the assembled String —
   * genuinely read from the tray's current specimens, never scripted. */
  async runToStringScan(values, type) {
    this.clearPlaque();
    const n = values.length;
    if (n > 0) {
      this.scanBar.setPosition(TRAY_X0 + 8, (TRAY_Y0 + TRAY_Y1) / 2 - 8).setVisible(true).setAlpha(0.9);
      await new Promise((res) => { this.tweens.add({ targets: this.scanBar, x: TRAY_X1 - 8, duration: Math.min(150 * n, 800), ease: "Linear", onComplete: res }); });
      this.scanBar.setVisible(false);
      this._trayCompartments.forEach((comp, i) => {
        if (i === 0) return;
        const spark = this.add.circle(comp.x, TRAY_Y0 + 10, 2, C_GOLD, 0.6).setDepth(13);
        this.tweens.add({ targets: spark, alpha: 0, duration: 200, onComplete: () => spark.destroy() });
      });
    }
    this.plaqueText.setText("[");
    await this.delay(90);
    const parts = [];
    for (let i = 0; i < n; i++) {
      if (!this._alive) return `[${parts.join(", ")}]`;
      const comp = this._trayCompartments[i];
      if (comp && comp.card) {
        const ghost = this.add.text(comp.card.x, comp.card.y, String(values[i]), { font: "bold 14px Courier New", color: "#e8eaf6" }).setOrigin(0.5).setDepth(14);
        await new Promise((res) => { this.tweens.add({ targets: ghost, x: PLAQUE_X + 30 + i * 12, y: PLAQUE_Y + PLAQUE_H / 2, duration: 200, ease: "Sine.easeIn", onComplete: () => { ghost.destroy(); res(); } }); });
      }
      parts.push(String(values[i]));
      this.plaqueText.setText("[" + parts.join(", "));
      await this.delay(70);
    }
    this.plaqueText.setText("[" + parts.join(", ") + "]");
    return "[" + parts.join(", ") + "]";
  }

  /** The cursed label: the tray shudders, a garbled hash materializes
   * with a static-glitch jitter. Reused for BOTH the bare println(arr)
   * case and the arr.toString() instance-call trap — same underlying
   * phenomenon (Object's hash-based toString), same visual. */
  async showCursedLabel(type) {
    this.clearPlaque();
    this.tweens.add({ targets: this.traySpecimenLayer, x: "+=3", duration: 30, yoyo: true, repeat: 5 });
    this.screenShake(0.003, 150);
    await this.delay(200);
    const hash = this._fakeHash(this.currentRound, type);
    this.plaqueText.setColor(HEX_RED).setFontSize(13);
    const baseX = this.plaqueText.x;
    for (let i = 0; i < hash.length; i++) {
      if (!this._alive) return hash;
      this.plaqueText.setText(hash.slice(0, i + 1));
      this.plaqueText.setX(baseX + (Math.random() - 0.5) * 2);
      await this.delay(15);
    }
    this.plaqueText.setX(baseX);
    if (!this.firstCurseAnnotationShown) {
      this.firstCurseAnnotationShown = true;
      this.createAnnotation(PLAQUE_X + PLAQUE_W / 2, PLAQUE_Y - 18, "the array's ADDRESS, not its contents — every tray has one, no human can read it", HEX_GREEN_MUTED);
    }
    await this.delay(300);
    this.plaqueText.setFontSize(16);
    return hash;
  }

  // ══════════════════════════════════════════════════════════════
  // BRACKET ACCESS
  // ══════════════════════════════════════════════════════════════

  async bracketAccessGhost(index) {
    await this.highlightCompartment(index);
    const comp = this._trayCompartments[index];
    if (!comp || !comp.card) return comp ? comp.value : null;
    const color = comp.cardColor === C_CYAN ? HEX_CYAN : comp.cardColor === C_ORANGE ? HEX_ORANGE : HEX_GOLD;
    const ghost = this.add.text(comp.card.x, comp.card.y, String(comp.value), { font: "bold 15px Courier New", color }).setOrigin(0.5).setDepth(14);
    await new Promise((res) => { this.tweens.add({ targets: ghost, y: ghost.y - 60, alpha: 0, duration: 280, ease: "Sine.easeOut", onComplete: () => { ghost.destroy(); res(); } }); });
    return comp.value;
  }

  // ══════════════════════════════════════════════════════════════
  // REJECTIONS
  // ══════════════════════════════════════════════════════════════

  showCompileErrorStamp() {
    const stamp = this.add.text(SLATE_X + SLATE_W / 2, SLATE_Y + SLATE_H / 2, "COMPILE ERROR", { font: "bold 21px Arial", color: HEX_RED }).setOrigin(0.5).setDepth(30).setScale(1.4).setAngle(-6).setAlpha(0);
    this.roundElements.push(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 180 });
    this.screenShake(0.004, 130);
    this.time.delayedCall(1000, () => { if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 220, onComplete: () => stamp.destroy() }); });
  }

  // ══════════════════════════════════════════════════════════════
  // THE CURATOR'S SLATE
  // ══════════════════════════════════════════════════════════════

  createCuratorsSlate() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0a0d18, 1);
    g.lineStyle(2, C_BRASS, 1);
    g.fillRoundedRect(SLATE_X, SLATE_Y, SLATE_W, SLATE_H, 8);
    g.strokeRoundedRect(SLATE_X, SLATE_Y, SLATE_W, SLATE_H, 8);
    this.add.text(SLATE_X + 14, SLATE_Y + 12, "CURATOR'S SLATE", { font: "bold 12px Georgia", color: HEX_BRASS }).setDepth(11);

    const pillG = this.add.graphics().setDepth(11);
    this.importPillGfx = pillG;
    this.importPillText = this.add.text(SLATE_X + SLATE_W - 12, SLATE_Y + 16, "import java.util.Arrays", { font: "bold 10px Courier New", color: HEX_GREEN_BRIGHT }).setOrigin(1, 0.5).setDepth(12);
    this._drawImportPill(true);

    this.slateLines = this.add.container(0, 0).setDepth(11);
    this._slateY = SLATE_Y + 42;

    this.add.text(SLATE_X + 14, SLATE_Y + SLATE_H - 34, "returns:", { font: "13px Georgia", color: "#8a6435" }).setDepth(11);
    this.resultText = this.add.text(SLATE_X + 70, SLATE_Y + SLATE_H - 34, "—", { font: "bold 15px Courier New", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(11);
  }

  _drawImportPill(present) {
    this.importPillGfx.clear();
    this.importPillGfx.lineStyle(1.5, present ? C_GREEN_BRIGHT : C_RED, present ? 0.6 : 1);
    const w = 140, x = SLATE_X + SLATE_W - 12 - w, y = SLATE_Y + 8;
    this.importPillGfx.strokeRoundedRect(x, y, w, 16, 8);
    if (!present) {
      this.importPillGfx.lineStyle(1.5, C_RED, 1);
      this.importPillGfx.lineBetween(x, y, x + w, y + 16);
    }
    this.importPillText.setColor(present ? HEX_GREEN_BRIGHT : HEX_RED);
  }

  showImportMissing() {
    this._drawImportPill(false);
  }

  resetImportIndicator() {
    this._drawImportPill(true);
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
    if (type === null) { this.resultText.setText("—").setColor(HEX_GRAY); return; }
    if (type === "crash") { this.resultText.setText("✗ ERROR").setColor(HEX_RED); return; }
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
    const re = /("(?:[^"\\]|\\.)*")|(\bimport\b|\bint\b|\bdouble\b|\bString\b|\bnew\b)|(\bArrays\b)|(\.toString\b|\.length\b|\.get\b|\.add\b|\.size\b)|(\bSystem\.out\b)|(int\[\]|String\[\]|double\[\])|(-?\d+\.\d+|-?\d+)|([(){}\[\];.,=+])/g;
    let last = 0, m;
    const plain = (t) => t && tokens.push({ t, c: "#e0e0e0" });
    while ((m = re.exec(line))) {
      if (m.index > last) plain(line.slice(last, m.index));
      if (m[1]) tokens.push({ t: m[1], c: "#4caf50" });
      else if (m[2]) tokens.push({ t: m[2], c: "#1565c0" });
      else if (m[3]) tokens.push({ t: m[3], c: HEX_GOLD });
      else if (m[4]) tokens.push({ t: m[4], c: HEX_CYAN });
      else if (m[5]) tokens.push({ t: m[5], c: "#78909c" });
      else if (m[6]) tokens.push({ t: m[6], c: HEX_BLUE_GRAY });
      else if (m[7]) tokens.push({ t: m[7], c: "#ff8a65" });
      else if (m[8]) tokens.push({ t: m[8], c: "#78909c" });
      last = m.index + m[0].length;
    }
    if (last < line.length) plain(line.slice(last));
    return tokens.length ? tokens : [{ t: line, c: "#e0e0e0" }];
  }

  updateSourceDisplay(lines) {
    this.sourceContainer.removeAll(true);
    if (!lines || !lines.length) return;
    const fontSize = lines.length > 2 ? 12 : 14;
    const lineH = fontSize + 9;
    const startY = 130 - ((lines.length - 1) * lineH) / 2;
    lines.forEach((line, i) => {
      const y = startY + i * lineH;
      const tokens = this._syntaxTokenize(line);
      const measured = tokens.map((tok) => { const tmp = this.add.text(0, 0, tok.t, { font: `bold ${fontSize}px Courier New` }); const w = tmp.width; tmp.destroy(); return w; });
      const totalW = measured.reduce((a, b) => a + b, 0);
      let x = TRAY_CX - totalW / 2;
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
    g.fillStyle(0x0a1208, 0.9);
    g.fillRoundedRect(400, 70, 480, 20, 4);
    this.exprMonitorText = this.add.text(640, 80, "", { font: "13px Courier New", color: HEX_GRAY }).setOrigin(0.5).setDepth(51);
  }

  updateExpressionMonitor(text) { this.exprMonitorText.setText(text); }

  // ══════════════════════════════════════════════════════════════
  // HUD
  // ══════════════════════════════════════════════════════════════

  createHUD() {
    const g = this.add.graphics().setDepth(49);
    g.fillStyle(0x0a1208, 0.93);
    g.fillRect(0, 0, W, 64);
    g.lineStyle(1, 0x3a2618, 1);
    g.lineBetween(0, 64, W, 64);

    this.add.text(20, 14, "THE SPECIMEN HALL", { font: "bold 16px Georgia", color: "#b0bec5" }).setDepth(50);
    this.add.text(20, 32, "Accretion Phase — Arrays Methods: toString()", { font: "12px Arial", color: "#546e7a" }).setDepth(50);

    this.add.text(1060, 8, "SCORE", { font: "11px Arial", color: "#546e7a" }).setDepth(50);
    this.scoreText = this.add.text(1060, 20, "0", { font: "bold 19px Arial", color: "#ffffff" }).setDepth(50);
    this.comboText = this.add.text(1060, 42, "×1", { font: "bold 14px Arial", color: HEX_GOLD }).setDepth(50);

    this.lifeIcons = [];
    for (let i = 0; i < 3; i++) {
      const lg = this.add.graphics({ x: 1150 + i * 26, y: 24 }).setDepth(50);
      lg.lineStyle(2, C_BRASS, 1);
      lg.strokeRoundedRect(-5, -6, 10, 12, 2);
      lg.lineBetween(-6, -6, 6, -6);
      this.lifeIcons.push(lg);
    }
  }

  // ══════════════════════════════════════════════════════════════
  // BIT — MUSEUM CURATOR VARIANT
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
    const frock = this.add.graphics();
    frock.fillStyle(0x1a0e05, 0.9);
    frock.lineStyle(1, 0x3a2618, 0.7);
    frock.fillTriangle(-17, -12, 17, -12, 0, 22);
    frock.fillStyle(C_BRASS, 0.6);
    frock.fillCircle(-3, 4, 1.3);
    frock.fillCircle(-3, 12, 1.3);
    this.loupe = this.add.container(10, 8);
    const loupeChain = this.add.graphics();
    loupeChain.lineStyle(1, C_BRASS, 0.5);
    loupeChain.lineBetween(0, -8, 0, 0);
    const loupeLens = this.add.circle(0, 3, 5, 0x0a1208, 0.3).setStrokeStyle(1.5, C_BRASS, 0.9);
    this.loupe.add([loupeChain, loupeLens]);
    const gloveL = this.add.circle(-16, 10, 4, 0xe0d6b8, 0.85);
    const tag = this.add.graphics();
    tag.fillStyle(0xe0d6b8, 0.8);
    tag.lineStyle(1, 0x8a6435, 0.6);
    tag.fillRoundedRect(12, 8, 10, 7, 1);
    tag.strokeRoundedRect(12, 8, 10, 7, 1);
    c.add([g, frock, eye, pupil, this.loupe, gloveL, tag, tip]);
    this.tweens.add({ targets: tip, alpha: 0.3, duration: 900, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: c, y: "+=3", duration: 2000, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
    this.bit = c;
  }

  async raiseLoupe() {
    await new Promise((res) => { this.tweens.add({ targets: this.loupe, x: -4, y: -14, duration: 200, ease: "Sine.easeOut", onComplete: res }); });
  }

  lowerLoupe() {
    this.tweens.add({ targets: this.loupe, x: 10, y: 8, duration: 200, ease: "Sine.easeIn" });
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
    await this.bitSay("Welcome to the Museum of Natural Order, Curator — leave the observatory's dome behind; tonight we catalogue a different kind of collection. Before you sits a SPECIMEN TRAY: fixed compartments, numbered from zero, each holding one value. You've worked with ArrayLists — flexible shelves that grew and shrank. An array is the RIGID original: its size is set at birth and NEVER changes.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(6000)]); if (!A()) return;
    this.hideBubble();

    this.updateSourceDisplay(["int[] tray = {10, 20, 30};"]);
    await this.populateTray([10, 20, 30], "int[]");
    if (!A()) return;
    await this.bitSay("Three slots, three specimens, three indices starting from zero — familiar ground. But here's the first difference: no import needed to CREATE an array. It's built into Java, like int and String. The UTILITY METHODS need an import; the tray itself does not.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(6000)]); if (!A()) return;
    this.hideBubble();

    this.updateSourceDisplay(["System.out.println(tray);"]);
    await this.raiseLoupe();
    const hash1 = await this.showCursedLabel("int[]");
    this.lowerLoupe();
    if (!A()) return;
    await this.bitSay("THE CURSE — the most-asked question in every Java classroom. 'Why did my array print garbage?' It's not garbage — it's the tray's ADDRESS: its type ([I = int array) and its identity hash. No human can read specimens from an address. The contents are IN there; the plaque just doesn't know how to show them. Yet.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(6500)]); if (!A()) return;
    this.hideBubble();

    this.updateSourceDisplay(["System.out.println(Arrays.toString(tray));"]);
    await this.runToStringScan([10, 20, 30], "int[]");
    if (!A()) return;
    await this.bitSay("Arrays dot toString — the CURE. A static method, like Math's instruments, called on the class name. It reads every compartment, left to right, and assembles a human label: brackets, commas, values. The format is IDENTICAL to what ArrayList printed — same brackets, same commas. Different tray, same label.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(6500)]); if (!A()) return;
    this.hideBubble();
    this.clearPlaque();

    this.updateSourceDisplay(["int x = tray[1];"]);
    await this.bracketAccessGhost(1);
    if (!A()) return;
    await this.bitSay("Reading a slot: tray BRACKET one BRACKET — not dot get, not parentheses. Brackets are the array's language; get() belongs to ArrayList. Same zero-based index, different grammar. And see: the original stayed in its compartment. Reading, not taking.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(6000)]); if (!A()) return;
    this.hideBubble();

    this.updateSourceDisplay(["// missing: import java.util.Arrays;", "Arrays.toString(tray);"]);
    this.showImportMissing();
    this.showCompileErrorStamp();
    await this.delay(600);
    if (!A()) return;
    await this.bitSay("One more rule: Arrays (the utility class) needs its import — import java.util.Arrays; — at the top of every file. Without it, Java doesn't recognize the name. The tray needs no import; the LABELLER does. Remember it, Curator — the hall is yours!");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(6000)]); if (!A()) return;
    this.hideBubble();
    this.resetImportIndicator();
    this.clearTray();
    this.clearPlaque();
    this.updateSourceDisplay([]);
    this.updateExpressionMonitor("");

    try { localStorage.setItem(TUTORIAL_KEY, "true"); } catch (_) {}
    this.startRound(0);
  }

  // ══════════════════════════════════════════════════════════════
  // ROUND LIFECYCLE
  // ══════════════════════════════════════════════════════════════

  _parseArrayInit(initStr, type) {
    const inner = initStr.trim().replace(/^\{/, "").replace(/\}$/, "").trim();
    if (!inner) return [];
    const parts = this._splitTopArgs(inner);
    if (type === "String[]") return parts.map((p) => p.trim().replace(/^"(.*)"$/, "$1"));
    return parts.map((p) => parseFloat(p.trim()));
  }

  async startRound(index) {
    this.currentRound = index;
    const config = ROUNDS[index];
    this.roundAttempts = 0;
    this.clearRound();
    this.wipeSlate();
    this.updateResultRow(null);
    this.clearPlaque();
    this.roundStartTime = this.time.now;

    const initValues = this._parseArrayInit(config.arrayInit, config.arrayType);
    await this.populateTray(initValues, config.arrayType);
    if (!this._alive) return;

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
    const c = this.add.container(TRAY_CX, 460).setDepth(40).setAlpha(0);
    const g = this.add.graphics();
    g.fillStyle(0x0a0d18, 0.95);
    g.fillRoundedRect(-260, -30, 520, 60, 10);
    g.lineStyle(1, C_BRASS, 0.5);
    g.strokeRoundedRect(-260, -30, 520, 60, 10);
    const badge = this.add.circle(-230, 0, 15, C_BRASS);
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
    const startX = TRAY_CX - ((n - 1) * spacing) / 2;
    shuffled.forEach((opt, i) => {
      const x = startX + i * spacing, y = 550;
      const c = this.add.container(x, y).setDepth(41);
      const g = this.add.graphics();
      const w = 260, h = 46;
      const draw = (stroke) => {
        g.clear();
        g.fillStyle(0x0a0d18, 1);
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
        g.lineStyle(2, stroke, 1);
        g.strokeRoundedRect(-w / 2, -h / 2, w, h, 10);
      };
      draw(C_BRASS);
      const label = opt.label || opt.value;
      const txt = this.add.text(0, 0, label, { font: "bold 14px Courier New", color: "#e8eaf6", wordWrap: { width: w - 20 }, align: "center" }).setOrigin(0.5);
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
    g.fillRoundedRect(-130, -23, 260, 46, 10);
    g.lineStyle(2, correct ? C_GREEN_BRIGHT : C_RED, 1);
    g.strokeRoundedRect(-130, -23, 260, 46, 10);
    if (!correct) this.tweens.add({ targets: bubbleContainer, x: bubbleContainer.x + 5, duration: 35, yoyo: true, repeat: 4 });

    const vars = {};
    await this.runStatements(config.source.split("\n"), vars);
    if (!this._alive) return;
    if (config.revealNote) this.createFloatingText(TRAY_CX, 175, config.revealNote, HEX_GRAY, "13px Arial", 3000);
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
  // TYPE D — CURATOR COMMAND
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
    const startY = 130 - ((lines.length - 1) * lineH) / 2;
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
      let x = TRAY_CX - totalW / 2;
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

    const btn = this.add.container(TRAY_CX, 600).setDepth(42);
    const bg = this.add.graphics();
    const bdraw = (enabled, hover) => {
      bg.clear();
      bg.fillStyle(enabled ? C_BRASS : 0x2a2f36, hover && enabled ? 1 : 0.95);
      bg.fillRoundedRect(-65, -22, 130, 44, 22);
    };
    bdraw(false, false);
    const bt = this.add.text(0, 0, "LABEL", { font: "bold 16px Arial", color: "#0a1208" }).setOrigin(0.5);
    btn.add([bg, bt]);
    btn.setSize(130, 44);
    btn.on("pointerover", () => { if (this._labelReady) { bdraw(true, true); btn.setScale(1.03); } });
    btn.on("pointerout", () => { bdraw(this._labelReady, false); btn.setScale(1); });
    btn.on("pointerdown", () => { if (this._labelReady) this.onLabelPressed(config); });
    this.labelButton = { c: btn, draw: bdraw };
    this.roundElements.push(btn);
    this.disableLabelButton();
    this.setupDragEvents();
  }

  enableLabelButton() { this._labelReady = true; this.labelButton.draw(true, false); this.labelButton.c.setInteractive({ useHandCursor: true }); }
  disableLabelButton() { this._labelReady = false; this.labelButton.draw(false, false); this.labelButton.c.disableInteractive(); }

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
        this.updateLabelButtonState();
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
      this.updateLabelButtonState();
    } else {
      const home = obj.getData("home");
      this.tweens.add({ targets: obj, x: home.x, y: home.y, duration: 250, ease: "Back.easeOut" });
    }
  }

  updateLabelButtonState() {
    const allFilled = Object.keys(this.slotDefs).every((id) => (this.slotContents[id] || []).length > 0);
    if (allFilled) this.enableLabelButton(); else this.disableLabelButton();
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

  async onLabelPressed(config) {
    this.inputLocked = true;
    this.disableLabelButton();
    this.roundAttempts++;
    const timeMs0 = this.time.now;

    const usedCodes = Object.keys(this.slotDefs).map((id) => this.slotContents[id][0].container.getData("code"));
    const usedTags = Object.keys(this.slotDefs).map((id) => this.slotContents[id][0].container.getData("tag"));

    const test = config.tests[0];
    this.wipeSlate();
    this.updateResultRow(null);
    this.clearPlaque();

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
    this.createFloatingText(TRAY_CX, 175, pass ? "✓" : "✗", pass ? HEX_GREEN_BRIGHT : HEX_RED, "bold 23px Arial", 900);

    const timeMs = Math.round(this.time.now - timeMs0);
    const failTag = usedTags.find((t) => t);
    this.logAttempt(config, pass, usedCodes.join(" | "), pass ? null : failTag, timeMs);

    if (pass) {
      this.updateScore(this.scoreForAttempt(timeMs));
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
      await this.showBitFeedback(MISCONCEPTION_FEEDBACK[failTag] || config.revealNote || "The plaque shows exactly what your code produced — compare it against the mission and adjust.");
      if (!this._alive) return;
      this.inputLocked = false;
      await this.populateTray(this._parseArrayInit(config.arrayInit, config.arrayType), config.arrayType);
      this.wipeSlate();
      this.updateResultRow(null);
      this.clearPlaque();
      this.slotContents = {};
      this.renderCommandSkeleton(config);
      this.cartridges.forEach((cart) => {
        cart.container.setData("placedIn", null);
        const home = cart.container.getData("home");
        this.tweens.add({ targets: cart.container, x: home.x, y: home.y, duration: 200 });
      });
      this.disableLabelButton();
    }
  }

  // ══════════════════════════════════════════════════════════════
  // HONEST EVALUATOR — array creation (fixed-size), the static
  // Arrays.toString(arr) call vs the instance arr.toString() trap
  // (both return the SAME hash as a bare println), bracket access
  // with bounds checking, the .length property (no parens),
  // concatenation, and the ArrayList-method compile checks.
  // ══════════════════════════════════════════════════════════════

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

  /** Resolves any non-statement expression: Arrays.toString(arr) [the
   * static cure], arr.toString() [the instance trap — same hash as a
   * bare println], bracket access, the .length property, string
   * concatenation, literals, and bare variables. */
  async resolveExpr(expr, vars) {
    const t = expr.trim();

    const atsMatch = t.match(/^Arrays\.toString\((\w+)\)$/);
    if (atsMatch) {
      const arr = vars[atsMatch[1]];
      if (!arr || arr.kind !== "array") return { ok: false, crash: "eval" };
      const result = await this.runToStringScan(arr.values, arr.type);
      await this.chalkWriteLine(`Arrays.toString(${atsMatch[1]})`, "#8ea6c8");
      this.chalkEvaluationArrow(result);
      this.updateResultRow("String");
      return { ok: true, value: result, type: "String" };
    }

    const instToStringMatch = t.match(/^(\w+)\.toString\(\)$/);
    if (instToStringMatch) {
      const arr = vars[instToStringMatch[1]];
      if (arr && arr.kind === "array") {
        const hash = await this.showCursedLabel(arr.type);
        await this.chalkWriteLine(`${instToStringMatch[1]}.toString()`, "#8ea6c8");
        this.chalkEvaluationArrow(hash);
        this.updateResultRow("String");
        return { ok: true, value: hash, type: "String" };
      }
    }

    const bracketMatch = t.match(/^(\w+)\[(\d+)\]$/);
    if (bracketMatch) {
      const arr = vars[bracketMatch[1]];
      const idx = parseInt(bracketMatch[2], 10);
      if (!arr || arr.kind !== "array") return { ok: false, crash: "eval" };
      if (idx < 0 || idx >= arr.values.length) { await this.crashIOOBE(idx); return { ok: false, crash: "ioobe" }; }
      const value = await this.bracketAccessGhost(idx);
      await this.chalkWriteLine(`${bracketMatch[1]}[${idx}]`, "#8ea6c8");
      this.chalkEvaluationArrow(value);
      const elemType = arr.type === "String[]" ? "String" : arr.type.replace("[]", "");
      this.updateResultRow(elemType);
      return { ok: true, value, type: elemType };
    }

    const lengthMatch = t.match(/^(\w+)\.length$/);
    if (lengthMatch) {
      const arr = vars[lengthMatch[1]];
      if (!arr || arr.kind !== "array") return { ok: false, crash: "eval" };
      await this.chalkWriteLine(`${lengthMatch[1]}.length`, "#8ea6c8");
      this.chalkEvaluationArrow(arr.values.length);
      this.updateResultRow("int");
      return { ok: true, value: arr.values.length, type: "int" };
    }

    const plusParts = this._splitTopPlus(t);
    if (plusParts.length > 1) {
      let out = "";
      for (const p of plusParts) {
        const pt = p.trim();
        if (/^".*"$/.test(pt)) { out += pt.slice(1, -1); continue; }
        const r = await this.resolveExpr(pt, vars);
        if (!r.ok) return r;
        out += String(r.value);
      }
      return { ok: true, value: out, type: "String" };
    }

    if (/^".*"$/.test(t)) return { ok: true, value: t.slice(1, -1), type: "String" };
    if (/^-?\d+\.\d+$/.test(t)) return { ok: true, value: parseFloat(t), type: "double" };
    if (/^-?\d+$/.test(t)) return { ok: true, value: parseInt(t, 10), type: "int" };

    if (vars[t] !== undefined) {
      const v = vars[t];
      if (v.kind === "array") return { ok: false, crash: "eval" };
      return { ok: true, value: v.value, type: v.type };
    }

    return { ok: false, crash: "eval" };
  }

  /** println's argument gets ONE special case beyond resolveExpr: a
   * BARE array variable (no toString anywhere) triggers the cursed
   * label — println's own hash-printing behavior, distinct from the
   * arr.toString() instance trap (same visual, different call site). */
  async evalPrintArg(argExpr, vars) {
    const t = argExpr.trim();
    if (/^\w+$/.test(t) && vars[t] && vars[t].kind === "array") {
      const hash = await this.showCursedLabel(vars[t].type);
      await this.chalkWriteLine(`println(${t})`, "#8ea6c8");
      this.chalkEvaluationArrow(hash);
      this.updateResultRow("String");
      return hash;
    }
    const r = await this.resolveExpr(t, vars);
    if (!r.ok) return null;
    return String(r.value);
  }

  async crashIOOBE(idx) {
    const stamp = this.add.text(TRAY_CX, TRAY_Y0 - 30, "ArrayIndexOutOfBoundsException", { font: "bold 11px Courier New", color: HEX_RED }).setOrigin(0.5).setAngle(-4).setAlpha(0);
    this.roundElements.push(stamp);
    this.tweens.add({ targets: stamp, alpha: 1, duration: 100 });
    this.screenShake(0.005, 140);
    await this.delay(450);
    if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 160, onComplete: () => stamp.destroy() });
  }

  async execStatement(line, vars) {
    const arrDecl = line.match(/^(int|String|double)\[\]\s+(\w+)\s*=\s*\{(.*)\}\s*;$/);
    if (arrDecl) {
      // the tray is already populated by the round-level orchestration
      // (startRound / onLabelPressed's retry) before any statement runs —
      // re-populating here would just re-flicker the same specimens in.
      const baseType = arrDecl[1], name = arrDecl[2];
      const type = `${baseType}[]`;
      const values = this._parseArrayInit(`{${arrDecl[3]}}`, type);
      vars[name] = { kind: "array", values, type };
      return { ok: true };
    }

    const instanceMatch = line.match(/(\w+)\.(get|add|size)\(/);
    if (instanceMatch && vars[instanceMatch[1]] && vars[instanceMatch[1]].kind === "array") {
      this.showCompileErrorStamp();
      await this.delay(450);
      return { ok: false, crash: "compile" };
    }

    if (/\barrays\.toString\(/.test(line)) {
      this.showCompileErrorStamp();
      await this.delay(450);
      return { ok: false, crash: "compile" };
    }

    const lengthParens = line.match(/(\w+)\.length\(\)/);
    if (lengthParens && vars[lengthParens[1]] && vars[lengthParens[1]].kind === "array") {
      this.showCompileErrorStamp();
      await this.delay(450);
      return { ok: false, crash: "compile" };
    }

    const parenAccess = line.match(/(\w+)\((\d+)\)/);
    if (parenAccess && vars[parenAccess[1]] && vars[parenAccess[1]].kind === "array") {
      this.showCompileErrorStamp();
      await this.delay(450);
      return { ok: false, crash: "compile" };
    }

    const bracketAssign = line.match(/^(\w+)\[(\d+)\]\s*=\s*(.+);$/);
    if (bracketAssign) {
      const name = bracketAssign[1], idx = parseInt(bracketAssign[2], 10), rhsVal = bracketAssign[3].trim();
      const arr = vars[name];
      if (arr && arr.kind === "array") {
        const newVal = /^-?\d+(\.\d+)?$/.test(rhsVal) ? parseFloat(rhsVal) : rhsVal.replace(/^"(.*)"$/, "$1");
        arr.values[idx] = newVal;
        await this.overwriteSpecimen(idx, newVal);
      }
      return { ok: true };
    }

    const declVar = line.match(/^(int|double|String)\s+(\w+)\s*=\s*(.*);$/);
    if (declVar) {
      const varType = declVar[1], name = declVar[2], rhs = declVar[3].trim();
      const r = await this.resolveExpr(rhs, vars);
      if (!r.ok) return r;
      vars[name] = { value: r.value, type: varType, kind: "scalar" };
      return { ok: true };
    }

    const bareToString = line.match(/^(\w+)\.toString\(\)\s*;$/);
    if (bareToString) {
      const name = bareToString[1];
      if (vars[name] && vars[name].kind === "array") {
        const hash = await this.showCursedLabel(vars[name].type);
        await this.chalkWriteLine(`${name}.toString()`, "#8ea6c8");
        this.chalkEvaluationArrow(hash);
        this.updateResultRow("String");
      }
      return { ok: true };
    }

    const printMatch = line.match(/^System\.out\.println\((.*)\);$/);
    if (printMatch) {
      const out = await this.evalPrintArg(printMatch[1].trim(), vars);
      if (out === null) return { ok: false, crash: "eval" };
      if (!this._printedLines) this._printedLines = [];
      this._printedLines.push(out);
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
      this.clearTray();
      this.clearPlaque();
      this.wipeSlate();
      this._caseGlows.forEach((g) => this.tweens.add({ targets: g, alpha: 0, duration: 400 }));
      const motes = this.ambient;
      this.ambient = null;
      (motes || []).forEach((m) => this.tweens.add({ targets: m, alpha: 0, duration: 1200 }));

      const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
      this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });
      const title = this.add.text(640, 240, "HALL CLOSED", { font: "bold 36px Georgia", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
      this.tweens.add({ targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut", onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }) });
      this.add.text(640, 310, `Score: ${this.score}`, { font: "21px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
      this.add.text(640, 350, `Rounds Completed: ${this.currentRound} / 12`, { font: "18px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);
      this._makeButton(525, 420, "REOPEN THE HALL", 200, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
      this._makeButton(755, 420, "RETURN TO MENU", 200, 50, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.start("MenuScene"));
    })();
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearRound();
    this.hideBubble();

    try { GameManager.completeLevel(63, Math.round((this.correctFirstTry / 12) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("arrays_toString_schema"); } catch (_) {}
    try {
      localStorage.setItem("level64_results", JSON.stringify({
        level: 64, concept: "arrays_toString", phase: "accretion",
        score: this.score, accuracy: this.correctFirstTry / 12, avgTime: this.totalTime / 12,
        comboMax: this.maxCombo, stars: this._starRating(), livesRemaining: this.lives,
        attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.hallFinale().then(() => { if (this._alive) this.showScoreTally(); });
  }

  async hallFinale() {
    this.tweens.add({ targets: this.traySpecimenLayer, y: "-=4", duration: 300, yoyo: true, repeat: 1 });
    const finalValues = ["10", "20", "30"];
    await this.runToStringScan(finalValues, "int[]");
    await this.delay(300);
    this.plaqueText.setText("COLLECTION CATALOGUED").setFontSize(13).setColor(HEX_GREEN_BRIGHT);
    this._caseGlows.forEach((g, i) => {
      this.time.delayedCall(i * 150, () => { if (g.active) this.tweens.add({ targets: g, alpha: 0.06, duration: 400, yoyo: true, repeat: 1 }); });
    });
    this.createConfetti(TRAY_CX, (TRAY_Y0 + TRAY_Y1) / 2, 40);
    await this.delay(900);
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
    panel.fillStyle(0x0a1208, 1);
    panel.fillRoundedRect(360, 150, 560, 420, 16);
    panel.lineStyle(2, C_BRASS, 1);
    panel.strokeRoundedRect(360, 150, 560, 420, 16);

    const title = this.add.text(640, 190, "HALL OPENED", { font: "bold 32px Georgia", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(91).setScale(0);
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
    bg.lineStyle(1.2, C_BRASS, 0.9);
    bg.strokeRoundedRect(-16, -8, 32, 10, 2);
    bg.lineBetween(-16, 4, 16, 4);
    bg.fillStyle(C_GOLD, 0.9);
    bg.fillRect(-14, 6, 28, 6);
    badge.add(bg);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 1950 });
    const badgeLbl = this.add.text(640, 505, "toString() SCHEMA ACQUIRED", { font: "bold 14px Georgia", color: HEX_GOLD }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: badgeLbl, alpha: 1, duration: 300, delay: 2100 });

    this._makeButton(500, 545, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(770, 545, "NEXT: The Sorting Room →", 280, 44, { fill: 0x00733a, stroke: C_GREEN_BRIGHT, textColor: "#ffffff" }, () => {
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
