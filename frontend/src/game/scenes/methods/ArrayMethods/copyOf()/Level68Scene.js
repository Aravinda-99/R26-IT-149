/**
 * Level 68 — "The Copy Bench" (Arrays Methods: Accretion Phase —
 * Arrays.copyOf())
 * ===========================================================================
 * The wing's third and final method. The hero mechanic is the Replication
 * Frame: a dual-tray workstation where a duplication beam sweeps the
 * ORIGINAL tray and ghost-copies fly across a bridge channel into a fresh
 * COPY tray. copyOf(arr, len) builds a genuinely NEW, independent array —
 * distinct from aliasing (int[] b = a, which shares the SAME array) and
 * from sort's void in-place mutation. Truncation drops trailing specimens;
 * padding fills extra compartments with the type's default (0 for int,
 * null for String, 0.0 for double).
 *
 * The evaluator tracks array IDENTITY, not just values: copyOf always
 * builds a brand-new backing array; a bare-variable assignment (b = a)
 * shares the SAME backing array object, so mutating through either name
 * mutates both — the alias/copy distinction made mechanically real.
 */

import Phaser from "phaser";
import { GameManager } from "../../../../GameManager.js";
import { BadgeSystem } from "../../../../BadgeSystem.js";

const W = 1280, H = 720;

const C_CYAN = 0x4fc3f7, C_GOLD = 0xffd740, C_ORANGE = 0xff9800, C_BLUE_GRAY = 0x8ea6c8;
const C_GREEN_BRIGHT = 0x00e676, C_RED = 0xf44336, C_GRAY = 0x78909c, C_BRASS = 0xc8a05a;
const HEX_CYAN = "#4fc3f7", HEX_GOLD = "#ffd740", HEX_ORANGE = "#ff9800", HEX_BLUE_GRAY = "#8ea6c8";
const HEX_GREEN_BRIGHT = "#00e676", HEX_RED = "#f44336", HEX_GRAY = "#78909c", HEX_BRASS = "#c8a05a";

// Replication frame
const ORIG_X0 = 150, ORIG_X1 = 560, TRAY_Y0 = 260, TRAY_Y1 = 380;
const COPY_X0 = 620, COPY_X1 = 1030;
const BRIDGE_X0 = ORIG_X1, BRIDGE_X1 = COPY_X0, BRIDGE_CY = (TRAY_Y0 + TRAY_Y1) / 2;
const DIAL_X = 590, DIAL_Y = 340;
// Curator's slate
const SLATE_X = 200, SLATE_Y = 440, SLATE_W = 800, SLATE_H = 100;
const TUTORIAL_KEY = "level68_tutorial_done";

// ══════════════════════════════════════════════════════════════
// ROUND CONFIGURATION
// ══════════════════════════════════════════════════════════════
const ROUNDS = [
  // ── Type A: Duplication Prediction ──
  { round: 1, type: "predict",
    source: "int[] a = {5, 10, 15};\nint[] b = Arrays.copyOf(a, 3);\nSystem.out.println(Arrays.toString(b));",
    question: "What prints?", correct: "[5, 10, 15]",
    options: [
      { value: "[5, 10, 15]", tag: null },
      { value: "[I@...", tag: "array_prints_contents_belief" },
      { value: "[]", tag: "copyOf_empty_belief" },
      { value: "[5, 10, 15, 0]", tag: "copyOf_pads_always_belief" },
    ],
    concept: "basic_copyOf" },

  { round: 2, type: "predict",
    source: "int[] a = {1, 2, 3, 4, 5};\nint[] b = Arrays.copyOf(a, 3);\nSystem.out.println(Arrays.toString(b));",
    question: "What prints?", correct: "[1, 2, 3]",
    options: [
      { value: "[1, 2, 3]", tag: null },
      { value: "[1, 2, 3, 4, 5]", tag: "copyOf_ignores_length_belief" },
      { value: "[3, 4, 5]", tag: "copyOf_takes_last_belief" },
      { value: "[1, 2, 3, 0, 0]", tag: "copyOf_pads_to_original_belief" },
    ],
    revealNote: "Truncated: the length dial said 3, so only the FIRST three specimens crossed the bridge. 4 and 5 stayed behind in the original. copyOf always takes from the FRONT.",
    concept: "truncation" },

  { round: 3, type: "predict",
    source: "int[] a = {7, 8};\nint[] b = Arrays.copyOf(a, 4);\nSystem.out.println(Arrays.toString(b));",
    question: "What prints?", correct: "[7, 8, 0, 0]",
    options: [
      { value: "[7, 8, 0, 0]", tag: null },
      { value: "[7, 8, 7, 8]", tag: "padding_repeats_belief" },
      { value: "[7, 8]", tag: "copyOf_ignores_length_belief" },
      { value: "[7, 8, null, null]", tag: "int_default_null_belief" },
    ],
    revealNote: "Padded: 4 compartments, but only 2 specimens to copy. The extras fill with 0 — the int default. Not null (that's for objects), not repeats of existing values — 0, the empty compartment's value.",
    concept: "padding" },

  // ── Type B: Independence, Alias & Edge Cases ──
  { round: 4, type: "predict",
    source: "int[] a = {1, 2, 3};\nint[] b = Arrays.copyOf(a, 3);\nb[0] = 99;\nSystem.out.println(Arrays.toString(a));",
    question: "What prints?", correct: "[1, 2, 3]",
    options: [
      { value: "[1, 2, 3]", tag: null },
      { value: "[99, 2, 3]", tag: "copyOf_shares_data_belief" },
      { value: "[1, 2, 3, 99]", tag: "copyOf_appends_belief" },
      { value: "error", tag: "modification_after_copy_error_belief", label: "Runtime error" },
    ],
    revealNote: "THE INDEPENDENCE PROOF: b[0] = 99 changed the COPY — the original's shield flashed green, untouched at 1. Two trays, two lives. The bridge was cut.",
    concept: "independence_proof" },

  { round: 5, type: "predict",
    source: "int[] a = {1, 2, 3};\nint[] b = a;\nb[0] = 99;\nSystem.out.println(Arrays.toString(a));",
    question: "What prints?", correct: "[99, 2, 3]",
    options: [
      { value: "[99, 2, 3]", tag: null },
      { value: "[1, 2, 3]", tag: "alias_is_copy_belief" },
      { value: "[1, 2, 3, 99]", tag: "alias_appends_belief" },
      { value: "error", tag: "alias_modification_error_belief", label: "Runtime error" },
    ],
    revealNote: "THE ALIAS CONTRAST: b = a did NOT copy — it put a second label on the SAME tray. When b[0] changed, a[0] changed too — because they're the same tray. No bridge, no duplication, no independence. ONLY copyOf builds a separate tray.",
    concept: "alias_vs_copy" },

  { round: 6, type: "predict",
    source: 'String[] s = {"Hi", "Bye"};\nString[] t = Arrays.copyOf(s, 4);\nSystem.out.println(Arrays.toString(t));',
    question: "What prints?", correct: "[Hi, Bye, null, null]",
    options: [
      { value: "[Hi, Bye, null, null]", tag: null },
      { value: "[Hi, Bye, 0, 0]", tag: "string_default_zero_belief" },
      { value: '[Hi, Bye, "", ""]', tag: "string_default_empty_belief" },
      { value: "[Hi, Bye]", tag: "copyOf_ignores_length_belief" },
    ],
    revealNote: "String padding: the default is NULL — not 0, not empty string. Each type has its own empty: int → 0, double → 0.0, String (and all objects) → null. The compartment is genuinely empty.",
    concept: "string_padding_null" },

  { round: 7, type: "predict",
    source: "int[] a = {5, 10};\nint[] b = Arrays.copyOf(a, 0);\nSystem.out.println(Arrays.toString(b));",
    question: "What prints?", correct: "[]",
    options: [
      { value: "[]", tag: null },
      { value: "[5, 10]", tag: "copyOf_ignores_length_belief" },
      { value: "error", tag: "zero_length_error_belief", label: "Runtime error" },
      { value: "null", tag: "zero_length_null_belief" },
    ],
    revealNote: "Length 0: a tray with ZERO compartments — legal, empty, and lonely. The copy exists but holds nothing. [] is an empty array, not null.",
    concept: "zero_length_copy" },

  // ── Type C: Expressions with copyOf ──
  { round: 8, type: "predict",
    source: 'int[] a = {5, 3, 8};\nint[] b = Arrays.copyOf(a, a.length);\nArrays.sort(b);\nSystem.out.println(Arrays.toString(a) + " | " + Arrays.toString(b));',
    question: "What prints?", correct: "[5, 3, 8] | [3, 5, 8]",
    options: [
      { value: "[5, 3, 8] | [3, 5, 8]", tag: null },
      { value: "[3, 5, 8] | [3, 5, 8]", tag: "copyOf_shares_data_belief" },
      { value: "[5, 3, 8] | [5, 3, 8]", tag: "sort_preserves_original_belief" },
      { value: "error", tag: "sort_on_copy_error_belief", label: "Runtime error" },
    ],
    revealNote: "THE FULL WORKFLOW: copy, then sort the copy — the original survives at [5, 3, 8] while the copy arranges to [3, 5, 8]. The bridge was cut before sort touched it. The L67 promise, delivered.",
    concept: "copy_then_sort" },

  { round: 9, type: "predict",
    source: "int[] a = {10, 20, 30};\nint[] b = Arrays.copyOf(a, a.length + 2);\nSystem.out.println(b.length);",
    question: "What prints?", correct: "5",
    options: [
      { value: "5", tag: null },
      { value: "3", tag: "copyOf_ignores_length_belief" },
      { value: "2", tag: "copyOf_length_is_extra_belief" },
      { value: "error", tag: "length_plus_error_belief", label: "Runtime error" },
    ],
    revealNote: "a.length + 2 = 5 — five compartments in the copy: three filled from the original, two padded with 0. The length parameter is the TOTAL size, not the extra amount.",
    concept: "length_expression" },

  // ── Type D: Specialist Command ──
  { round: 10, type: "command",
    source: 'int[] temps = {72, 68, 75, 80};\nint[] backup = <slot:copy>;\ntemps[0] = 0;\nSystem.out.println("Backup: " + Arrays.toString(backup));',
    mission: "Create a backup of temps BEFORE it's modified. Expected: 'Backup: [72, 68, 75, 80]' even after temps[0] = 0.",
    slots: [{ id: "copy", hint: "the independent backup" }],
    cartridges: [
      { code: "Arrays.copyOf(temps, temps.length)", correct: true, slotId: "copy" },
      { code: "temps", tag: "alias_is_copy_belief", slotId: "copy" },
      { code: "Arrays.copyOf(temps, 2)", tag: "copyOf_length_is_index_belief", slotId: "copy" },
      { code: "Arrays.toString(temps)", tag: "toString_is_copy_belief", slotId: "copy" },
    ],
    tests: [{ expectedOutput: "Backup: [72, 68, 75, 80]" }],
    postMissionNote: "Bit: 'Copy before you mutate — the backup was independent, so temps[0] = 0 never touched it. Wrong tray, wrong length, or the wrong instrument entirely — only Arrays.copyOf(temps, temps.length) builds a true, full-size twin.'",
    concept: "command_backup" },

  { round: 11, type: "command",
    source: 'String[] names = {"Zoe", "Amy", "Max"};\nString[] sorted = <slot:copy>;\n<slot:sort>\nSystem.out.println("Original: " + Arrays.toString(names));\nSystem.out.println("Sorted: " + Arrays.toString(sorted));',
    mission: "Sort a COPY of the names while keeping the original order. Expected:\nOriginal: [Zoe, Amy, Max]\nSorted: [Amy, Max, Zoe]",
    slots: [
      { id: "copy", hint: "the independent copy" },
      { id: "sort", hint: "sort the copy" },
    ],
    cartridges: [
      { code: "Arrays.copyOf(names, names.length)", correct: true, slotId: "copy" },
      { code: "names", tag: "alias_is_copy_belief", slotId: "copy" },
      { code: "Arrays.sort(sorted);", correct: true, slotId: "sort" },
      { code: "Arrays.sort(names);", tag: "sort_original_not_copy", slotId: "sort" },
      { code: "sorted = Arrays.sort(sorted);", tag: "sort_returns_new_array_belief", slotId: "sort" },
    ],
    tests: [{ expectedOutput: "Original: [Zoe, Amy, Max]⏎Sorted: [Amy, Max, Zoe]" }],
    postMissionNote: "Bit: 'Copy first, sort the copy — the original stays untouched because the bridge was cut. The alias build would have sorted BOTH (same tray, two names). And the sort-the-original build preserved the copy but destroyed the source. Target the right tray.'",
    concept: "command_copy_then_sort" },

  { round: 12, type: "command",
    source: "int[] data = {10, 20, 30};\nint[] extended = <slot:copy>;\nextended[3] = 40;\nextended[4] = 50;\nSystem.out.println(Arrays.toString(extended));",
    mission: "Create an extended copy with room for 2 more values. Fill slots [3] and [4] manually. Expected: [10, 20, 30, 40, 50].",
    slots: [{ id: "copy", hint: "the extended copy" }],
    cartridges: [
      { code: "Arrays.copyOf(data, 5)", correct: true, slotId: "copy" },
      { code: "Arrays.copyOf(data, data.length + 2)", correct: true, alsoCorrect: true, slotId: "copy" },
      { code: "Arrays.copyOf(data, 3)", tag: "no_room_for_extension", slotId: "copy" },
      { code: "Arrays.copyOf(data, data.length)", tag: "no_room_for_extension", slotId: "copy" },
    ],
    tests: [{ expectedOutput: "[10, 20, 30, 40, 50]" }],
    postMissionNote: "Bit (clicking the copy-stamp with finality): 'Arrays can't grow — but copyOf can build a BIGGER tray from a smaller one. Copy with extra room, fill the blanks: the closest an array gets to add(). The bench is complete, Specialist. Three instruments in this museum now: the plaque, the engine, and the bench. The wing seals at dusk.'",
    concept: "command_extend_pattern" },
];

const MISCONCEPTION_FEEDBACK = {
  copyOf_shares_data_belief: "The bridge was CUT — two trays, two lives. Changing one never touches the other. That's what independence means.",
  copyOf_same_reference_belief: "copyOf builds a NEW tray — a separate object in memory. The original and the copy share no compartments.",
  alias_is_copy_belief: "b = a is an ALIAS — two labels on ONE tray. Every change through b hits a too. Only copyOf builds a separate tray. The reference diagram on the wall shows the difference.",
  copyOf_modifies_original_belief: "The original was never touched — the shield flashed green. copyOf READS the original to build the copy; it never writes to it.",
  copyOf_returns_void_belief: "Unlike sort (which returns void), copyOf RETURNS a new array — you MUST capture it. Different instrument, different contract.",
  copyOf_ignores_length_belief: "The length parameter is the TOTAL size of the copy — not a suggestion. 3 means 3 compartments, no more. 5 means 5, padded if needed.",
  copyOf_takes_last_belief: "copyOf always takes from the FRONT — index 0 onward, up to the length. Never the tail end.",
  copyOf_pads_to_original_belief: "Truncated means SMALLER, not padded — a copy shorter than the original just stops early. No zeros added when shrinking.",
  copyOf_pads_always_belief: "Same length as the original means an EXACT duplicate — no padding needed, nothing added.",
  copyOf_empty_belief: "copyOf(a, 3) with a matching length duplicates the specimens — it doesn't discard them.",
  copyOf_length_is_index_belief: "The second argument is the LENGTH (total compartments), not an index. copyOf(arr, 2) builds a 2-compartment tray, not 'copy up to index 2.'",
  copyOf_length_is_extra_belief: "The length is the TOTAL, not the EXTRA. a.length + 2 = 5 total compartments, not 2 extra tacked on to the 3 existing.",
  copyOf_appends_belief: "copyOf doesn't grow the array after the fact — the length is fixed at creation. Modifying an element never changes its size.",
  alias_appends_belief: "An alias doesn't grow the array — b and a are the SAME tray, same fixed size. Assignment never resizes anything.",
  truncation_loses_data_belief: "Truncated specimens aren't lost — they're still in the ORIGINAL. They just didn't cross the bridge. The copy is smaller by design.",
  padding_repeats_belief: "Extra compartments fill with the TYPE'S DEFAULT — 0 for int, null for String — not copies of the last value.",
  padding_fills_with_last_belief: "Extra compartments fill with the TYPE'S DEFAULT — 0 for int, null for String — not copies of the last value.",
  padding_fills_with_garbage_belief: "No garbage — defaults are clean: 0 for int, null for objects. Every type has its own empty.",
  int_default_null_belief: "int compartments default to 0, not null. null is for object types (String, etc.). Primitives have numeric zeros.",
  string_default_zero_belief: "String is an object type — its default is null, not 0. A null compartment holds NO String at all.",
  string_default_empty_belief: "String is an object type — its default is null, not an empty string \"\". A null compartment holds NO String at all — not even a blank one.",
  zero_length_error_belief: "Length 0 is legal — an empty array, [], existing but holding nothing. Not an error.",
  zero_length_null_belief: "Length 0 is legal — an empty array, [], existing but holding nothing. Not null — [] is a real (empty) array.",
  sort_on_copy_error_belief: "Sorting a copy is perfectly legal — it's a full, independent array. The engine doesn't care where the tray came from.",
  sort_preserves_original_belief: "sort mutates in place — but here it was called on the COPY. The original was never given to the engine, so it stayed as-is.",
  sort_original_not_copy: "You sorted the ORIGINAL instead of the copy — the target matters. sort(sorted), not sort(names). The right tray, the right engine call.",
  sort_returns_new_array_belief: "sort returns void — nothing to assign. Capturing its result is a compile error.",
  toString_is_copy_belief: "toString returns a STRING — text, not an array. You can't index into it or sort it. A copy needs copyOf.",
  no_room_for_extension: "The copy has no room for the new index — that compartment doesn't exist in a smaller tray. Extend with a LARGER length: 5 or data.length + 2.",
  modification_after_copy_error_belief: "No error — modifying an independent copy is completely normal. The original just doesn't feel it.",
  alias_modification_error_belief: "No error — b and a are the same tray, so modifying through b is exactly as legal as modifying through a.",
  length_plus_error_belief: "a.length + 2 is ordinary arithmetic — 3 + 2 = 5, a perfectly legal length.",
  arrays_instance_call_belief: "Arrays.copyOf — static, like sort and toString. The bench lives in the Arrays class.",
  timeout: "Reread the source carefully — trace it line by line against the trays.",
};

export class Level68Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level68Scene" });
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
    this.firstPaddingAnnotationShown = false;
    this.firstIndependenceAnnotationShown = false;
    this.firstBridgeSnapShown = false;
  }

  preload() {}

  create() {
    this._alive = true;
    this.createParticleTexture();
    this.createBackground();
    this.createBenchInterior();
    this.createBenchFloor();
    this.createParticles();
    this.createReplicationFrame();
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
    this.updateLampGlow(time);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // SETUP — THE COPY BENCH INTERIOR
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l68_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l68_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x0a1208).setDepth(0);
  }

  createBenchInterior() {
    // Reference diagram
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x0a1208, 1);
    g.lineStyle(2, 0x3a2618, 1);
    g.fillRect(350, 40, 350, 110);
    g.strokeRect(350, 40, 350, 110);
    const tray1 = this.add.rectangle(410, 80, 50, 30, 0, 0).setStrokeStyle(1.2, C_BLUE_GRAY, 0.6).setDepth(2);
    const tray2 = this.add.rectangle(590, 80, 50, 30, 0, 0).setStrokeStyle(1.2, C_BLUE_GRAY, 0.6).setDepth(2);
    this._refDiagramTrays = [tray1, tray2];
    const arrow = this.add.text(500, 80, "→", { font: "bold 18px Georgia", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.6).setDepth(2);
    this.add.text(500, 80, "copyOf", { font: "italic 10px Georgia", color: HEX_BRASS }).setOrigin(0.5, 2.4).setAlpha(0.5).setDepth(2);
    this.add.text(500, 120, "independent", { font: "italic 11px Georgia", color: HEX_BLUE_GRAY }).setOrigin(0.5).setAlpha(0.4).setDepth(2);
    const ne = this.add.text(468, 120, "≠", { font: "bold 12px Georgia", color: HEX_GRAY }).setOrigin(0.5).setAlpha(0.5).setDepth(2);
    this._refDiagramNe = ne;

    // Precision lamp
    const lampC = this.add.container(500, 170).setDepth(3);
    const lampG = this.add.graphics();
    lampG.lineStyle(2, C_BRASS, 0.8);
    lampG.lineBetween(0, -20, -14, 0);
    lampG.lineBetween(-14, 0, -10, 16);
    lampG.fillStyle(0x1a1408, 1);
    lampG.fillTriangle(-18, 16, -2, 16, -10, 2);
    lampC.add(lampG);
    this._lampPool = this.add.ellipse(490, 210, 90, 30, 0xffa726, 0.04).setDepth(2);

    // Waste bin
    const binG = this.add.graphics().setDepth(2).setAlpha(0.4);
    binG.lineStyle(1.5, 0x3a2618, 1);
    binG.beginPath();
    binG.moveTo(1148, 570); binG.lineTo(1172, 570); binG.lineTo(1168, 600); binG.lineTo(1152, 600);
    binG.closePath();
    binG.strokePath();

    // Banner
    const bg = this.add.graphics().setDepth(2);
    bg.fillStyle(0x0a1208, 1);
    bg.lineStyle(1, C_BRASS, 0.5);
    bg.fillRoundedRect(480, 12, 320, 26, 3);
    bg.strokeRoundedRect(480, 12, 320, 26, 3);
    this.add.text(640, 25, "T H E   C O P Y   B E N C H", { font: "bold 16px Georgia", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.7).setDepth(3);
  }

  updateLampGlow(time) {
    if (!this._lampPool) return;
    this._lampPool.setAlpha(0.03 + Math.abs(Math.sin(time * 0.0006)) * 0.02);
  }

  createBenchFloor() {
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
    const colors = [0xc8a05a, 0x5d7a5d, 0x4fc3f7];
    for (let i = 0; i < 6; i++) {
      this.ambient.push(this.add.circle(Phaser.Math.Between(0, W), Phaser.Math.Between(230, 630), 1, Phaser.Utils.Array.GetRandom(colors), Phaser.Math.FloatBetween(0.03, 0.05)).setDepth(2));
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
    const t = this.add.text(x, y, text, { font: "italic 13px Georgia", color: colorHex, wordWrap: { width: 320 }, align: "center" }).setOrigin(0.5).setDepth(70).setAlpha(0);
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
    const p = this.add.particles(x, y, "l68_dot", {
      speed: { min: 80, max: 240 }, angle: { min: 0, max: 360 }, scale: { start: 0.9, end: 0 }, lifespan: 500,
      tint: [C_BRASS, C_CYAN, 0xffffff], emitting: false,
    }).setDepth(85);
    p.explode(count);
    this.time.delayedCall(900, () => p.destroy());
  }

  screenShake(intensity = 0.004, duration = 150) {
    this.cameras.main.shake(duration, intensity);
  }

  // ══════════════════════════════════════════════════════════════
  // THE REPLICATION FRAME (hero visual — dual-tray workstation)
  // ══════════════════════════════════════════════════════════════

  createReplicationFrame() {
    const drawTrayFrame = (x0, x1) => {
      const g = this.add.graphics().setDepth(10);
      g.fillStyle(0x0d0a06, 0.8);
      g.lineStyle(3, C_BRASS, 1);
      g.fillRoundedRect(x0, TRAY_Y0, x1 - x0, TRAY_Y1 - TRAY_Y0, 6);
      g.strokeRoundedRect(x0, TRAY_Y0, x1 - x0, TRAY_Y1 - TRAY_Y0, 6);
      [[x0 + 4, TRAY_Y0 + 4], [x1 - 4, TRAY_Y0 + 4]].forEach(([x, y]) => {
        g.fillStyle(C_BRASS, 0.7);
        g.fillCircle(x, y, 3);
      });
      return g;
    };
    this._origFrameGfx = drawTrayFrame(ORIG_X0, ORIG_X1);
    this._copyFrameGfx = drawTrayFrame(COPY_X0, COPY_X1);
    this._copyGlowOutline = this.add.rectangle((COPY_X0 + COPY_X1) / 2, (TRAY_Y0 + TRAY_Y1) / 2, COPY_X1 - COPY_X0 + 6, TRAY_Y1 - TRAY_Y0 + 6, 0, 0).setStrokeStyle(2, C_CYAN, 0).setDepth(11);

    this.origLabelPlate = this.add.text(ORIG_X0 + 6, TRAY_Y0 - 16, "ORIGINAL", { font: "bold 12px Georgia", color: HEX_BRASS }).setDepth(11);
    this.copyLabelPlate = this.add.text(COPY_X0 + 6, TRAY_Y0 - 16, "COPY", { font: "bold 12px Georgia", color: HEX_BRASS }).setDepth(11).setAlpha(0);
    this.origVarLabel = this.add.text(ORIG_X1 - 6, TRAY_Y0 - 16, "", { font: "italic 11px Courier New", color: HEX_CYAN }).setOrigin(1, 0).setDepth(11);
    this.origVarLabel2 = this.add.text(ORIG_X1 - 6, TRAY_Y0 - 30, "", { font: "italic 11px Courier New", color: HEX_GREEN_BRIGHT }).setOrigin(1, 0).setDepth(11);
    this.copyVarLabel = this.add.text(COPY_X1 - 6, TRAY_Y0 - 16, "", { font: "italic 11px Courier New", color: HEX_CYAN }).setOrigin(1, 0).setDepth(11).setAlpha(0);

    this.origCompartmentLayer = this.add.container(0, 0).setDepth(11);
    this.origSpecimenLayer = this.add.container(0, 0).setDepth(12);
    this._origCompartments = [];
    this.copyCompartmentLayer = this.add.container(0, 0).setDepth(11);
    this.copySpecimenLayer = this.add.container(0, 0).setDepth(12);
    this._copyCompartments = [];

    // bridge channel
    const bridgeG = this.add.graphics().setDepth(9);
    bridgeG.lineStyle(1.5, C_BRASS, 0.5);
    bridgeG.lineBetween(BRIDGE_X0, BRIDGE_CY - 14, BRIDGE_X1, BRIDGE_CY - 14);
    bridgeG.lineBetween(BRIDGE_X0, BRIDGE_CY + 14, BRIDGE_X1, BRIDGE_CY + 14);
    this.bridgeArrow = this.add.text((BRIDGE_X0 + BRIDGE_X1) / 2, BRIDGE_CY, "→", { font: "bold 21px Georgia", color: HEX_BRASS }).setOrigin(0.5).setDepth(10).setAlpha(0.6);
    this.bridgeCordLayer = this.add.container(0, 0).setDepth(13);

    // length dial
    const dg = this.add.graphics().setDepth(14);
    dg.lineStyle(2, C_BRASS, 0.8);
    dg.strokeCircle(DIAL_X, DIAL_Y, 22);
    dg.fillStyle(0x0a1208, 1);
    dg.fillCircle(DIAL_X, DIAL_Y, 20);
    for (let i = 0; i <= 8; i++) {
      const a = Phaser.Math.DegToRad(-135 + (270 / 8) * i);
      const x1 = DIAL_X + Math.cos(a) * 17, y1 = DIAL_Y + Math.sin(a) * 17;
      const x2 = DIAL_X + Math.cos(a) * 20, y2 = DIAL_Y + Math.sin(a) * 20;
      dg.lineStyle(1, C_BRASS, 0.5);
      dg.lineBetween(x1, y1, x2, y2);
    }
    this.add.text(DIAL_X, DIAL_Y - 34, "len", { font: "bold 12px Courier New", color: HEX_CYAN }).setOrigin(0.5).setDepth(14);
    this.dialPointer = this.add.container(DIAL_X, DIAL_Y).setDepth(15);
    const pg = this.add.graphics();
    pg.lineStyle(2, C_CYAN, 1);
    pg.lineBetween(0, 0, 0, -16);
    this.dialPointer.add(pg);
    this.dialValueText = this.add.text(DIAL_X, DIAL_Y + 30, "", { font: "bold 11px Courier New", color: HEX_CYAN }).setOrigin(0.5).setDepth(14);
  }

  setLengthDial(length) {
    const clamped = Phaser.Math.Clamp(length, 0, 8);
    const a = Phaser.Math.DegToRad(-135 + (270 / 8) * clamped);
    this.tweens.add({ targets: this.dialPointer, angle: Phaser.Math.RadToDeg(a) + 90, duration: 200, ease: "Back.easeOut" });
    this.dialValueText.setText(String(length));
  }

  async populateOriginalTray(values, type, varName) {
    this.origCompartmentLayer.removeAll(true);
    this.origSpecimenLayer.removeAll(true);
    this._origCompartments = [];
    this.origVarLabel.setText(varName || "a");
    this.origVarLabel2.setText("").setAlpha(0);
    const n = values.length;
    const innerX0 = ORIG_X0 + 8, innerX1 = ORIG_X1 - 8;
    const innerW = innerX1 - innerX0;
    const cellW = n > 0 ? innerW / n : innerW;

    for (let i = 0; i < n; i++) {
      const cellX = innerX0 + i * cellW;
      if (i > 0) {
        const dg = this.add.graphics();
        dg.lineStyle(1, C_BRASS, 0.4);
        dg.lineBetween(cellX, TRAY_Y0 + 10, cellX, TRAY_Y1 - 22);
        this.origCompartmentLayer.add(dg);
      }
      const idxPlate = this.add.text(cellX + cellW / 2, TRAY_Y1 - 10, `[${i}]`, { font: "bold 11px Courier New", color: HEX_BRASS }).setOrigin(0.5).setAlpha(i === 0 ? 0.9 : 0.6);
      this.origCompartmentLayer.add(idxPlate);
      this._origCompartments.push({ x: cellX, w: cellW, idxPlate });
    }
    for (let i = 0; i < n; i++) {
      const card = await this._buildCard(this.origSpecimenLayer, this._origCompartments[i], values[i], type, false);
      this._origCompartments[i] = { ...this._origCompartments[i], ...card, value: values[i] };
      await this.delay(60);
    }
    await this.delay(80);
  }

  async _buildCard(layer, comp, value, type, isGhostDefault) {
    const color = isGhostDefault ? 0x3a4048 : (type === "String[]" ? C_CYAN : C_GOLD);
    const cardW = Math.min(comp.w - 12, 66), cardH = 38;
    const cx = comp.x + comp.w / 2, cy = (TRAY_Y0 + TRAY_Y1) / 2 - 6;
    const card = this.add.container(cx, cy).setAlpha(0).setScale(0.7);
    const cg = this.add.graphics();
    cg.fillStyle(color, isGhostDefault ? 0.35 : 0.9);
    cg.lineStyle(1, Phaser.Display.Color.IntegerToColor(color).darken(30).color, 1);
    cg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 5);
    cg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 5);
    const display = this._fmtVal(value);
    const txt = this.add.text(0, 0, display, isGhostDefault
      ? { font: "italic 13px Courier New", color: "#78909c" }
      : { font: "bold 15px Courier New", color: "#0a1208" }).setOrigin(0.5);
    if (txt.width > cardW - 8) txt.setFontSize(9);
    card.add([cg, txt]);
    layer.add(card);
    this.tweens.add({ targets: card, alpha: 1, scale: 1, duration: 160, ease: "Back.easeOut" });
    return { card, cardGfx: cg, cardText: txt, cardColor: color, cardW };
  }

  _fmtVal(v) { return v === null ? "null" : String(v); }

  clearReplicationFrame() {
    this.origCompartmentLayer.removeAll(true);
    this.origSpecimenLayer.removeAll(true);
    this._origCompartments = [];
    this.copyCompartmentLayer.removeAll(true);
    this.copySpecimenLayer.removeAll(true);
    this._copyCompartments = [];
    this.copyLabelPlate.setAlpha(0);
    this.copyVarLabel.setAlpha(0);
    this.origVarLabel.setText("");
    this.origVarLabel2.setText("").setAlpha(0);
    this._copyGlowOutline.setStrokeStyle(2, C_CYAN, 0);
    this.bridgeCordLayer.removeAll(true);
    this.setLengthDial(0);
    this.dialValueText.setText("");
  }

  async materializeCopyTray(length, type, varName) {
    this.copyCompartmentLayer.removeAll(true);
    this.copySpecimenLayer.removeAll(true);
    this._copyCompartments = [];
    this.copyLabelPlate.setAlpha(0);
    this.copyVarLabel.setText(varName || "b").setAlpha(0);
    this.setLengthDial(length);

    const n = length;
    const innerX0 = COPY_X0 + 8, innerX1 = COPY_X1 - 8;
    const innerW = innerX1 - innerX0;
    const cellW = n > 0 ? innerW / n : innerW;
    for (let i = 0; i < n; i++) {
      const cellX = innerX0 + i * cellW;
      if (i > 0) {
        const dg = this.add.graphics();
        dg.lineStyle(1, C_BRASS, 0.4);
        dg.lineBetween(cellX, TRAY_Y0 + 10, cellX, TRAY_Y1 - 22);
        this.copyCompartmentLayer.add(dg);
      }
      const idxPlate = this.add.text(cellX + cellW / 2, TRAY_Y1 - 10, `[${i}]`, { font: "bold 11px Courier New", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.6);
      this.copyCompartmentLayer.add(idxPlate);
      this._copyCompartments.push({ x: cellX, w: cellW, idxPlate });
    }
    this._copyGlowOutline.setStrokeStyle(2, C_CYAN, 0.5);
    this.tweens.add({ targets: [this.copyLabelPlate, this.copyVarLabel], alpha: 1, duration: 300 });
    await this.delay(350);
  }

  async runDuplicationBeam() {
    const beam = this.add.rectangle(ORIG_X0, BRIDGE_CY, 3, TRAY_Y1 - TRAY_Y0 - 16, C_CYAN, 0.9).setDepth(16);
    await new Promise((res) => {
      this.tweens.add({ targets: beam, x: ORIG_X1, duration: 260, ease: "Sine.easeInOut", onComplete: () => { beam.destroy(); res(); } });
    });
  }

  async flyGhostCopies(values, copyLength, type) {
    const crossCount = Math.min(values.length, copyLength);
    for (let i = 0; i < crossCount; i++) {
      if (!this._alive) return;
      const origComp = this._origCompartments[i];
      const copyComp = this._copyCompartments[i];
      if (!origComp || !copyComp) continue;
      const ghost = this.add.text(origComp.x + origComp.w / 2, (TRAY_Y0 + TRAY_Y1) / 2 - 6, this._fmtVal(values[i]), { font: "bold 13px Courier New", color: HEX_CYAN }).setOrigin(0.5).setDepth(17).setAlpha(0.9);
      const destX = copyComp.x + copyComp.w / 2;
      this.tweens.add({ targets: ghost, x: destX, y: (TRAY_Y0 + TRAY_Y1) / 2 - 6, duration: 220, ease: "Sine.easeInOut", onComplete: () => ghost.destroy() });
      await this.delay(90);
      const card = await this._buildCard(this.copySpecimenLayer, copyComp, values[i], type, false);
      this._copyCompartments[i] = { ...copyComp, ...card, value: values[i] };
      await this.delay(70);
    }
  }

  async showPadding(startIndex, endIndex, type) {
    const defaultVal = type === "String[]" ? null : 0;
    for (let i = startIndex; i < endIndex; i++) {
      if (!this._alive) return;
      const comp = this._copyCompartments[i];
      if (!comp) continue;
      const card = await this._buildCard(this.copySpecimenLayer, comp, defaultVal, type, true);
      this._copyCompartments[i] = { ...comp, ...card, value: defaultVal };
      await this.delay(60);
    }
    if (!this.firstPaddingAnnotationShown && endIndex > startIndex) {
      this.firstPaddingAnnotationShown = true;
      this.createAnnotation((COPY_X0 + COPY_X1) / 2, TRAY_Y1 + 18, `default: ${this._fmtVal(defaultVal)} — the empty compartment's value`, HEX_GRAY);
    }
    await this.delay(100);
  }

  async showTruncation(skippedIndices) {
    if (!skippedIndices.length) return;
    for (const idx of skippedIndices) {
      const comp = this._origCompartments[idx];
      if (!comp || !comp.card) continue;
      this.tweens.add({ targets: comp.cardGfx, alpha: 0.3, duration: 90, yoyo: true, repeat: 2 });
    }
    this.createFloatingText(ORIG_X1 - 30, TRAY_Y0 - 4, "truncated", HEX_RED, "italic 12px Arial", 1200);
    await this.delay(300);
  }

  async snapBridge() {
    const first = !this.firstBridgeSnapShown;
    this.firstBridgeSnapShown = true;
    const cordY = BRIDGE_CY;
    const cord = this.add.graphics().setDepth(13);
    cord.lineStyle(1.5, C_CYAN, 0.7);
    for (let x = BRIDGE_X0 + 4; x < BRIDGE_X1 - 4; x += 6) cord.lineBetween(x, cordY, x + 3, cordY);
    this.bridgeCordLayer.add(cord);
    this.tweens.add({ targets: this.bridgeArrow, alpha: 1, scale: 1.3, duration: 100, yoyo: true });
    await this.delay(first ? 400 : 150);
    if (!this._alive) return;
    this.tweens.add({
      targets: cord, alpha: 0, duration: 150,
      onComplete: () => { cord.destroy(); },
    });
    this._copyGlowOutline.setStrokeStyle(2, C_BRASS, 0.3);
    if (first) this.createAnnotation((ORIG_X0 + ORIG_X1) / 2, TRAY_Y1 + 18, "the original is never touched", HEX_GRAY);
    await this.delay(first ? 300 : 100);
  }

  async showIndependenceShield(index) {
    const comp = this._origCompartments[index];
    if (!comp) return;
    const shield = this.add.rectangle(comp.x + comp.w / 2, (TRAY_Y0 + TRAY_Y1) / 2 - 6, comp.cardW ? comp.cardW + 8 : 40, 44, C_GREEN_BRIGHT, 0.3).setDepth(18);
    this.tweens.add({ targets: shield, alpha: 0, duration: 220, onComplete: () => shield.destroy() });
    await this.delay(200);
  }

  showAliasLabels(name1, name2) {
    this.origVarLabel.setText(name1);
    this.origVarLabel2.setText(name2).setAlpha(1);
  }

  modifyCompartment(trayKey, index, value, type) {
    const comp = trayKey === "copy" ? this._copyCompartments[index] : this._origCompartments[index];
    if (!comp || !comp.cardText) return;
    comp.value = value;
    const display = this._fmtVal(value);
    comp.cardText.setText(display).setColor(type === "default" ? "#78909c" : "#0a1208").setFontStyle(type === "default" ? "italic" : "bold");
    if (comp.cardText.width > (comp.cardW || 60) - 8) comp.cardText.setFontSize(9);
    if (comp.card) this.tweens.add({ targets: comp.card, scale: 1.15, duration: 80, yoyo: true });
  }

  /** A compact selection-sort-by-position swap animation, applied to
   * whichever tray (orig or copy) the sort call targeted — reused from
   * the Sorting Room's engine, simplified: swaps just the two cards'
   * on-screen positions and re-labels, no separate gantry/arm needed
   * here since this bench's hero mechanic is the replication, not the
   * sort. Never more swaps than the permutation actually needs. */
  async runTraySortAnimation(trayKey, before, after) {
    const comps = trayKey === "copy" ? this._copyCompartments : this._origCompartments;
    const working = before.slice();
    const n = working.length;
    let swaps = 0;
    for (let i = 0; i < n && swaps < 8; i++) {
      if (!this._alive) break;
      if (working[i] === after[i]) continue;
      let j = -1;
      for (let k = i + 1; k < n; k++) { if (working[k] === after[i]) { j = k; break; } }
      if (j === -1) continue;
      const compA = comps[i], compB = comps[j];
      if (compA && compA.card && compB && compB.card) {
        const cardA = compA.card, cardB = compB.card;
        const posA = { x: cardA.x, y: cardA.y }, posB = { x: cardB.x, y: cardB.y };
        await new Promise((res) => {
          this.tweens.add({ targets: cardA, y: posA.y - 10, duration: 60 });
          this.tweens.add({ targets: cardB, y: posB.y - 10, duration: 60, onComplete: res });
        });
        await new Promise((res) => {
          this.tweens.add({ targets: cardA, x: posB.x, duration: 140, ease: "Sine.easeInOut" });
          this.tweens.add({ targets: cardB, x: posA.x, duration: 140, ease: "Sine.easeInOut", onComplete: res });
        });
        await new Promise((res) => {
          this.tweens.add({ targets: cardA, y: posA.y, duration: 60 });
          this.tweens.add({ targets: cardB, y: posB.y, duration: 60, onComplete: res });
        });
        compA.card = cardB; compB.card = cardA;
        [compA.value, compB.value] = [compB.value, compA.value];
        [compA.cardText, compB.cardText] = [compB.cardText, compA.cardText];
        [compA.cardGfx, compB.cardGfx] = [compB.cardGfx, compA.cardGfx];
        [compA.cardColor, compB.cardColor] = [compB.cardColor, compA.cardColor];
        [compA.cardW, compB.cardW] = [compB.cardW, compA.cardW];
      }
      const tmp = working[i]; working[i] = working[j]; working[j] = tmp;
      swaps++;
    }
    await this.delay(100);
  }

  // ══════════════════════════════════════════════════════════════
  // CURATOR'S SLATE
  // ══════════════════════════════════════════════════════════════

  createCuratorsSlate() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0a0d18, 1);
    g.lineStyle(2, C_BRASS, 1);
    g.fillRoundedRect(SLATE_X, SLATE_Y, SLATE_W, SLATE_H, 8);
    g.strokeRoundedRect(SLATE_X, SLATE_Y, SLATE_W, SLATE_H, 8);
    this.add.text(SLATE_X + 14, SLATE_Y + 12, "CURATOR'S SLATE", { font: "bold 12px Georgia", color: HEX_BRASS }).setDepth(11);

    this.slateLines = this.add.container(0, 0).setDepth(11);
    this._slateY = SLATE_Y + 38;

    this.add.text(SLATE_X + 14, SLATE_Y + SLATE_H - 18, "returns:", { font: "13px Georgia", color: "#8a6435" }).setDepth(11);
    this.resultText = this.add.text(SLATE_X + 70, SLATE_Y + SLATE_H - 18, "—", { font: "bold 15px Courier New", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(11);
  }

  async chalkWriteLine(text, color) {
    const t = this.add.text(SLATE_X + 14, this._slateY, "", { font: "bold 14px Courier New", color: color || "#e8eaf6" }).setDepth(11);
    this.slateLines.add(t);
    for (let i = 0; i < text.length; i++) {
      if (!this._alive) return;
      t.setText(t.text + text[i]);
      if (t.width > SLATE_W - 28) t.setFontSize(10);
      await this.delay(8);
    }
    this._slateY += 20;
    if (this._slateY > SLATE_Y + SLATE_H - 34) this._slateY = SLATE_Y + 38;
  }

  chalkEvaluationArrow(value) {
    const t = this.add.text(SLATE_X + 14, this._slateY, `→ ${value}`, { font: "bold 14px Courier New", color: HEX_ORANGE }).setAlpha(0);
    this.slateLines.add(t);
    if (t.width > SLATE_W - 28) t.setFontSize(10);
    this.tweens.add({ targets: t, alpha: 1, duration: 120 });
    this._slateY += 20;
    if (this._slateY > SLATE_Y + SLATE_H - 34) this._slateY = SLATE_Y + 38;
  }

  wipeSlate() {
    this.slateLines.removeAll(true);
    this._slateY = SLATE_Y + 38;
  }

  updateResultRow(type) {
    if (type === null || type === undefined) { this.resultText.setText("—").setColor(HEX_GRAY); return; }
    if (type === "crash") { this.resultText.setText("✗ ERROR").setColor(HEX_RED); return; }
    if (type === "void") { this.resultText.setText("void").setColor(HEX_GRAY); return; }
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
    const re = /("(?:[^"\\]|\\.)*")|(\bimport\b|\bint\b|\bdouble\b|\bString\b|\bnew\b)|(\bArrays\b)|(\.copyOf\b|\.toString\b|\.sort\b|\.length\b)|(\bSystem\.out\b)|(int\[\]|String\[\]|double\[\])|(-?\d+\.\d+|-?\d+)|([(){}\[\];.,=+])/g;
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
    const fontSize = lines.length > 3 ? 12 : 15;
    const lineH = fontSize + 8;
    const startY = 130 - ((lines.length - 1) * lineH) / 2;
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
    g.fillStyle(0x0a1208, 0.9);
    g.fillRoundedRect(400, 200, 480, 18, 4);
    this.exprMonitorText = this.add.text(640, 209, "", { font: "12px Courier New", color: HEX_GRAY }).setOrigin(0.5).setDepth(51);
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

    this.add.text(20, 14, "THE COPY BENCH", { font: "bold 16px Georgia", color: "#b0bec5" }).setDepth(50);
    this.add.text(20, 32, "Accretion Phase — Arrays Methods: copyOf()", { font: "12px Arial", color: "#546e7a" }).setDepth(50);

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
  // BIT — REPLICATION SPECIALIST VARIANT (copy-stamp, tweezers)
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
    const gloveL = this.add.circle(-16, 10, 4, 0xffffff, 0).setStrokeStyle(1, 0xe8eaf6, 0.7);
    const loupeChain = this.add.graphics();
    loupeChain.lineStyle(1, C_BRASS, 0.5);
    loupeChain.lineBetween(-6, -10, 6, -10);
    this.stamp = this.add.container(17, 4);
    const stampG = this.add.graphics();
    stampG.fillStyle(C_BRASS, 0.85);
    stampG.lineStyle(1, 0x8a6435, 0.8);
    stampG.fillRoundedRect(-9, -8, 18, 9, 2);
    stampG.strokeRoundedRect(-9, -8, 18, 9, 2);
    stampG.lineStyle(1, C_BRASS, 0.6);
    stampG.lineBetween(0, 1, 0, 9);
    const stampT = this.add.text(0, -4, "DUP", { font: "bold 7px Arial", color: "#0a1208" }).setOrigin(0.5);
    this.stamp.add([stampG, stampT]);
    const tweezers = this.add.graphics();
    tweezers.lineStyle(1, C_BRASS, 0.6);
    tweezers.lineBetween(15, 14, 21, 22);
    tweezers.lineBetween(19, 14, 21, 22);
    c.add([g, frock, eye, pupil, gloveL, loupeChain, this.stamp, tweezers, tip]);
    this.tweens.add({ targets: tip, alpha: 0.3, duration: 900, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: c, y: "+=3", duration: 2000, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
    this.bit = c;
  }

  async raiseStamp() {
    await new Promise((res) => { this.tweens.add({ targets: this.stamp, angle: -25, y: -4, duration: 180, ease: "Sine.easeOut", onComplete: res }); });
    this.tweens.add({ targets: this.stamp, angle: 0, y: 4, duration: 180, ease: "Sine.easeIn" });
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
    await this.raiseStamp();
    await this.bitSay("The Copy Bench, Specialist — the instrument the sorting room promised. Remember the before-and-after ledger? You could snapshot the original as TEXT — but you couldn't sort a copy while keeping the original tray intact. Today you can: copyOf builds an INDEPENDENT twin.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(6500)]); if (!A()) return;
    this.hideBubble();

    this.updateSourceDisplay(["int[] data = {10, 20, 30};"]);
    await this.populateOriginalTray([10, 20, 30], "int[]", "data");
    if (!A()) return;

    this.updateSourceDisplay(["int[] copy = Arrays.copyOf(data, data.length);"]);
    await this.materializeCopyTray(3, "int[]", "copy");
    await this.runDuplicationBeam();
    await this.flyGhostCopies([10, 20, 30], 3, "int[]");
    await this.snapBridge();
    if (!A()) return;
    await this.bitSay("Three compartments, three duplicated specimens, one independent tray. The length dial matched the original — a perfect replica. And see the bridge: the cord SNAPPED. These trays are strangers now. What happens to one doesn't touch the other.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(6500)]); if (!A()) return;
    this.hideBubble();

    this.updateSourceDisplay(["copy[0] = 99;"]);
    this.modifyCompartment("copy", 0, 99, "value");
    await this.showIndependenceShield(0);
    if (!A()) return;

    this.updateSourceDisplay(["System.out.println(Arrays.toString(data));"]);
    await this.chalkWriteLine("Arrays.toString(data)", "#8ea6c8");
    this.chalkEvaluationArrow("[10, 20, 30]");
    this.updateResultRow("String");
    await this.delay(300); if (!A()) return;

    this.updateSourceDisplay(["System.out.println(Arrays.toString(copy));"]);
    await this.chalkWriteLine("Arrays.toString(copy)", "#8ea6c8");
    this.chalkEvaluationArrow("[99, 20, 30]");
    this.updateResultRow("String");
    if (!A()) return;
    await this.bitSay("The shield on the original — not touched. The copy absorbed the change alone. INDEPENDENCE: two trays, two lives. This is what 'copy' means in programming — a separate object with the same starting values.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(6500)]); if (!A()) return;
    this.hideBubble();
    this.wipeSlate();
    this.updateResultRow(null);

    this.updateSourceDisplay(["int[] longer = Arrays.copyOf(data, 5);"]);
    await this.materializeCopyTray(5, "int[]", "longer");
    await this.runDuplicationBeam();
    await this.flyGhostCopies([10, 20, 30], 5, "int[]");
    await this.showPadding(3, 5, "int[]");
    await this.snapBridge();
    if (!A()) return;
    await this.bitSay("The length dial set to 5 — but the original had only 3 specimens. The extra compartments fill with DEFAULTS: 0 for ints, null for Strings. Padding, not magic — the copy is longer than the source, and the blanks know their type.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(6500)]); if (!A()) return;
    this.hideBubble();

    this.updateSourceDisplay(["int[] shorter = Arrays.copyOf(data, 2);"]);
    await this.materializeCopyTray(2, "int[]", "shorter");
    await this.runDuplicationBeam();
    await this.flyGhostCopies([10, 20, 30], 2, "int[]");
    await this.showTruncation([2]);
    await this.snapBridge();
    if (!A()) return;
    await this.bitSay("The length dial set to 2 — the third specimen didn't make the copy. TRUNCATION: the copy is shorter, and what's left behind stays in the original but never crossed the bridge. copyOf gives you EXACTLY the size you ask for.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(6500)]); if (!A()) return;
    this.hideBubble();

    this.updateSourceDisplay(["int[] sorted = Arrays.copyOf(data, data.length);", "Arrays.sort(sorted);"]);
    await this.materializeCopyTray(3, "int[]", "sorted");
    await this.runDuplicationBeam();
    await this.flyGhostCopies([10, 20, 30], 3, "int[]");
    await this.snapBridge();
    await this.runTraySortAnimation("copy", [10, 20, 30], [10, 20, 30]);
    if (!A()) return;

    this.updateSourceDisplay(["System.out.println(Arrays.toString(data));", "System.out.println(Arrays.toString(sorted));"]);
    await this.chalkWriteLine("Arrays.toString(data)", "#8ea6c8");
    this.chalkEvaluationArrow("[10, 20, 30]");
    await this.delay(200);
    await this.chalkWriteLine("Arrays.toString(sorted)", "#8ea6c8");
    this.chalkEvaluationArrow("[10, 20, 30]");
    this.updateResultRow("String");
    if (!A()) return;
    await this.bitSay("THE PROMISE KEPT — copy first, sort the copy, original survives. The arrangement workshop's lesson completed: sort mutates, but mutation can't reach across the bridge you already cut. The bench is yours, Specialist — duplicate with care!");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(6500)]); if (!A()) return;
    this.hideBubble();

    this.clearReplicationFrame();
    this.wipeSlate();
    this.updateResultRow(null);
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

  _extractFirstArrayDecl(config) {
    const lines = config.source.split("\n");
    for (const raw of lines) {
      const m = raw.trim().match(/^(int|String|double)\[\]\s+(\w+)\s*=\s*\{(.*)\}\s*;$/);
      if (m) return { type: `${m[1]}[]`, name: m[2], values: this._parseArrayInit(`{${m[3]}}`, `${m[1]}[]`) };
    }
    return null;
  }

  async startRound(index) {
    this.currentRound = index;
    const config = ROUNDS[index];
    this.roundAttempts = 0;
    this.clearRound();
    this.clearReplicationFrame();
    this.wipeSlate();
    this.updateResultRow(null);
    this.roundStartTime = this.time.now;

    const firstArr = this._extractFirstArrayDecl(config);
    if (firstArr) await this.populateOriginalTray(firstArr.values, firstArr.type, firstArr.name);
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
    const c = this.add.container(640, 565).setDepth(40).setAlpha(0);
    const g = this.add.graphics();
    g.fillStyle(0x0a0d18, 0.95);
    g.fillRoundedRect(-280, -24, 560, 48, 10);
    g.lineStyle(1, C_BRASS, 0.5);
    g.strokeRoundedRect(-280, -24, 560, 48, 10);
    const badge = this.add.circle(-248, 0, 14, C_BRASS);
    const badgeT = this.add.text(-248, 0, String(this.currentRound + 1), { font: "bold 14px Arial", color: "#0a1208" }).setOrigin(0.5);
    const t = this.add.text(-226, 0, promptText, { font: "15px Arial", color: "#e8eaf6", wordWrap: { width: 480 } }).setOrigin(0, 0.5);
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
    const positions = [[445, 615], [835, 615], [445, 665], [835, 665]];
    shuffled.forEach((opt, i) => {
      const [x, y] = positions[i];
      const c = this.add.container(x, y).setDepth(41);
      const g = this.add.graphics();
      const w = 340, h = 40;
      const draw = (stroke) => {
        g.clear();
        g.fillStyle(0x0a0d18, 1);
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
        g.lineStyle(2, stroke, 1);
        g.strokeRoundedRect(-w / 2, -h / 2, w, h, 10);
      };
      draw(C_BRASS);
      const label = opt.label || opt.value;
      const txt = this.add.text(0, 0, label, { font: "bold 13px Courier New", color: "#e8eaf6", wordWrap: { width: w - 20 }, align: "center" }).setOrigin(0.5);
      if (txt.height > h - 6) txt.setFontSize(9);
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
    g.fillRoundedRect(-170, -20, 340, 40, 10);
    g.lineStyle(2, correct ? C_GREEN_BRIGHT : C_RED, 1);
    g.strokeRoundedRect(-170, -20, 340, 40, 10);
    if (!correct) this.tweens.add({ targets: bubbleContainer, x: bubbleContainer.x + 5, duration: 35, yoyo: true, repeat: 4 });

    const vars = {};
    this._printedLines = [];
    await this.runStatements(config.source.split("\n"), vars);
    if (!this._alive) return;
    if (config.revealNote) this.createFloatingText(640, 200, config.revealNote, HEX_GRAY, "13px Arial", 3000);
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
  // TYPE D — SPECIALIST COMMAND
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
    const fontSize = lines.length > 3 ? 11 : 13;
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
        } else { measured.push(160); totalW += 166; }
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
      const label = this.add.text(x + w / 2, y + h / 2, hintDef ? hintDef.hint : "", { font: "italic 10px Courier New", color: "#3d4450" }).setOrigin(0.5).setDepth(17);
      def.hintLabel = label;
      this.sourceContainer.add(label);
    }
  }

  createCartridgeTray(config) {
    const shuffled = Phaser.Utils.Array.Shuffle(config.cartridges.slice());
    let x = 60, row = 0;
    const rowY = [645, 685];
    const maxX = 1220;
    shuffled.forEach((def) => {
      const style = { font: "bold 13px Courier New", color: HEX_CYAN };
      const label = def.label || def.code;
      const measure = this.add.text(0, 0, label, style);
      const w = measure.width + 18;
      measure.destroy();
      if (x + w > maxX) { row = Math.min(row + 1, 1); x = 60; }
      const home = { x: x + w / 2, y: rowY[row] };
      x += w + 10;

      const c = this.add.container(home.x, home.y).setDepth(42);
      const bg = this.add.graphics();
      const draw = (stroke) => {
        bg.clear();
        bg.fillStyle(0x1a0e05, 1);
        bg.fillRoundedRect(-w / 2, -13, w, 26, 7);
        bg.lineStyle(2, stroke, 1);
        bg.strokeRoundedRect(-w / 2, -13, w, 26, 7);
      };
      draw(C_BRASS);
      const txt = this.add.text(0, 0, label, style).setOrigin(0.5);
      c.add([bg, txt]);
      c.setSize(w, 26);
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

    const btn = this.add.container(640, 600).setDepth(42);
    const bg = this.add.graphics();
    const bdraw = (enabled, hover) => {
      bg.clear();
      bg.fillStyle(enabled ? C_BRASS : 0x2a2f36, hover && enabled ? 1 : 0.95);
      bg.fillRoundedRect(-70, -20, 140, 40, 20);
    };
    bdraw(false, false);
    const bt = this.add.text(0, 0, "REPLICATE", { font: "bold 14px Arial", color: "#0a1208" }).setOrigin(0.5);
    btn.add([bg, bt]);
    btn.setSize(140, 40);
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

  _shouldShowPostMissionNote(config) {
    if (!config.noteIsScenicSpecific) return true;
    const scenicOnly = (config.cartridges || []).filter((c) => c.alsoCorrect && !c.correct);
    if (scenicOnly.length === 0) return true;
    return scenicOnly.some((c) => Object.keys(this.slotDefs).some((id) => {
      const placed = this.slotContents[id] && this.slotContents[id][0];
      return placed && placed.container.getData("code") === c.code;
    }));
  }

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
    this.createFloatingText(640, 200, pass ? "✓" : "✗", pass ? HEX_GREEN_BRIGHT : HEX_RED, "bold 23px Arial", 900);

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
      await this.showBitFeedback(MISCONCEPTION_FEEDBACK[failTag] || config.revealNote || "The trays show exactly what your code produced — compare it against the mission and adjust.");
      if (!this._alive) return;
      this.inputLocked = false;
      this.clearReplicationFrame();
      const firstArr = this._extractFirstArrayDecl(config);
      if (firstArr) await this.populateOriginalTray(firstArr.values, firstArr.type, firstArr.name);
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
  // HONEST EVALUATOR — Arrays.copyOf (a genuinely NEW independent
  // backing array, truncation/padding by the type's default), alias
  // (bare-variable assignment shares the SAME backing array object —
  // reference identity, not a deep copy), Arrays.sort (in-place, on
  // whichever array the call actually targets), Arrays.toString,
  // bracket access/assignment (bounds-checked), .length, println
  // concatenation, and the array-type-mismatch compile check.
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

  async _resolveLenExpr(expr, vars) {
    const t = expr.trim();
    if (/^\d+$/.test(t)) return { ok: true, value: parseInt(t, 10) };
    let m = t.match(/^(\w+)\.length\s*\+\s*(\d+)$/);
    if (m) {
      const arr = vars[m[1]];
      if (!arr || arr.kind !== "array") return { ok: false, crash: "eval" };
      return { ok: true, value: arr.values.length + parseInt(m[2], 10) };
    }
    m = t.match(/^(\w+)\.length$/);
    if (m) {
      const arr = vars[m[1]];
      if (!arr || arr.kind !== "array") return { ok: false, crash: "eval" };
      return { ok: true, value: arr.values.length };
    }
    return { ok: false, crash: "eval" };
  }

  async resolveExpr(expr, vars) {
    const t = expr.trim();

    const atsMatch = t.match(/^Arrays\.toString\((\w+)\)$/);
    if (atsMatch) {
      const arr = vars[atsMatch[1]];
      if (!arr || arr.kind !== "array") return { ok: false, crash: "eval" };
      const display = "[" + arr.values.map((v) => this._fmtVal(v)).join(", ") + "]";
      await this.chalkWriteLine(`Arrays.toString(${atsMatch[1]})`, "#8ea6c8");
      this.chalkEvaluationArrow(display);
      this.updateResultRow("String");
      return { ok: true, value: display, type: "String" };
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

    const bracketMatch = t.match(/^(\w+)\[(\d+)\]$/);
    if (bracketMatch) {
      const arr = vars[bracketMatch[1]];
      if (!arr || arr.kind !== "array") return { ok: false, crash: "eval" };
      const idx = parseInt(bracketMatch[2], 10);
      if (idx < 0 || idx >= arr.values.length) { await this.crashIOOBE(idx, arr.trayKey); return { ok: false, crash: "ioobe" }; }
      const value = arr.values[idx];
      const elemType = arr.type === "String[]" ? "String" : arr.type.replace("[]", "");
      await this.chalkWriteLine(`${bracketMatch[1]}[${idx}]`, "#8ea6c8");
      this.chalkEvaluationArrow(this._fmtVal(value));
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

    if (/^".*"$/.test(t)) return { ok: true, value: t.slice(1, -1), type: "String" };
    if (/^-?\d+\.\d+$/.test(t)) return { ok: true, value: parseFloat(t), type: "double" };
    if (/^-?\d+$/.test(t)) return { ok: true, value: parseInt(t, 10), type: "int" };

    if (vars[t] !== undefined) {
      const v = vars[t];
      if (v.kind === "array") {
        const display = "[" + v.values.map((x) => this._fmtVal(x)).join(", ") + "]";
        return { ok: true, value: display, type: "String" };
      }
      return { ok: true, value: v.value, type: v.type };
    }

    return { ok: false, crash: "eval" };
  }

  async evalPrintArg(argExpr, vars) {
    const r = await this.resolveExpr(argExpr.trim(), vars);
    if (!r.ok) return { ok: false, crash: r.crash || "eval" };
    return { ok: true, value: String(r.value) };
  }

  showCompileErrorStamp() {
    const stamp = this.add.text(640, 230, "COMPILE ERROR", { font: "bold 18px Arial", color: HEX_RED }).setOrigin(0.5).setDepth(30).setScale(1.3).setAngle(-6).setAlpha(0);
    this.roundElements.push(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 150 });
    this.screenShake(0.004, 120);
    this.time.delayedCall(850, () => { if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 180, onComplete: () => stamp.destroy() }); });
  }

  async crashIOOBE(idx, trayKey) {
    const cx = trayKey === "copy" ? (COPY_X0 + COPY_X1) / 2 : (ORIG_X0 + ORIG_X1) / 2;
    const stamp = this.add.text(cx, TRAY_Y0 - 16, "ArrayIndexOutOfBoundsException", { font: "bold 10px Courier New", color: HEX_RED }).setOrigin(0.5).setAngle(-3).setAlpha(0);
    this.roundElements.push(stamp);
    this.tweens.add({ targets: stamp, alpha: 1, duration: 90 });
    this.screenShake(0.005, 130);
    await this.delay(400);
    if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 150, onComplete: () => stamp.destroy() });
  }

  async execStatement(line, vars) {
    // sort's return is void — ANY attempt to capture it (declared or
    // reassigned) is a compile error. Checked first since it's a
    // narrower, more specific failure than the generic array-decl
    // fallback below.
    if (/=\s*Arrays\.sort\(/.test(line)) {
      this.showCompileErrorStamp();
      await this.delay(400);
      return { ok: false, crash: "compile" };
    }

    const arrLiteral = line.match(/^(int|String|double)\[\]\s+(\w+)\s*=\s*\{(.*)\}\s*;$/);
    if (arrLiteral) {
      const baseType = arrLiteral[1], name = arrLiteral[2];
      const type = `${baseType}[]`;
      const values = this._parseArrayInit(`{${arrLiteral[3]}}`, type);
      vars[name] = { kind: "array", values, type, trayKey: "orig" };
      await this.populateOriginalTray(values, type, name);
      return { ok: true };
    }

    // Alias: "int[] b = a;" — a bare-variable RHS referencing an
    // existing array shares the SAME backing array object. No copy
    // tray materializes; a second label plate joins the original.
    const aliasDecl = line.match(/^(int|String|double)\[\]\s+(\w+)\s*=\s*(\w+)\s*;$/);
    if (aliasDecl) {
      const name = aliasDecl[2], src = aliasDecl[3];
      if (vars[src] && vars[src].kind === "array") {
        vars[name] = vars[src];
        this.showAliasLabels(src, name);
        return { ok: true };
      }
    }

    // copyOf: builds a genuinely NEW, independent backing array —
    // truncated (only the first newLength elements) or padded (the
    // type's default: 0 for int, null for String, 0.0 for double).
    const copyDecl = line.match(/^(int|String|double)\[\]\s+(\w+)\s*=\s*Arrays\.copyOf\((\w+),\s*(.+)\)\s*;$/);
    if (copyDecl) {
      const name = copyDecl[2], srcName = copyDecl[3], lenExprRaw = copyDecl[4].trim();
      const src = vars[srcName];
      if (!src || src.kind !== "array") return { ok: false, crash: "eval" };
      const lenRes = await this._resolveLenExpr(lenExprRaw, vars);
      if (!lenRes.ok) return lenRes;
      const newLen = lenRes.value;
      const defaultVal = src.type === "String[]" ? null : src.type === "double[]" ? 0.0 : 0;
      const newValues = [];
      for (let i = 0; i < newLen; i++) newValues.push(i < src.values.length ? src.values[i] : defaultVal);
      vars[name] = { kind: "array", values: newValues, type: src.type, trayKey: "copy" };

      await this.materializeCopyTray(newLen, src.type, name);
      await this.runDuplicationBeam();
      await this.flyGhostCopies(src.values, newLen, src.type);
      if (newLen > src.values.length) await this.showPadding(src.values.length, newLen, src.type);
      if (newLen < src.values.length) {
        const skipped = [];
        for (let i = newLen; i < src.values.length; i++) skipped.push(i);
        await this.showTruncation(skipped);
      }
      await this.snapBridge();
      return { ok: true };
    }

    // Any OTHER RHS for an array-typed declaration (e.g. capturing a
    // String from Arrays.toString(...) into an int[]/String[] variable)
    // is a genuine type-mismatch compile error.
    const arrDeclAny = line.match(/^(int|String|double)\[\]\s+(\w+)\s*=\s*(.*);$/);
    if (arrDeclAny) {
      this.showCompileErrorStamp();
      await this.delay(400);
      return { ok: false, crash: "compile" };
    }

    const bracketAssign = line.match(/^(\w+)\[(\d+)\]\s*=\s*(.+);$/);
    if (bracketAssign) {
      const name = bracketAssign[1], idx = parseInt(bracketAssign[2], 10), rhsVal = bracketAssign[3].trim();
      const arr = vars[name];
      if (!arr || arr.kind !== "array") return { ok: true };
      if (idx < 0 || idx >= arr.values.length) { await this.crashIOOBE(idx, arr.trayKey); return { ok: false, crash: "ioobe" }; }
      const newVal = /^-?\d+(\.\d+)?$/.test(rhsVal) ? parseFloat(rhsVal) : rhsVal.replace(/^"(.*)"$/, "$1");
      arr.values[idx] = newVal;
      this.modifyCompartment(arr.trayKey, idx, newVal, "value");
      if (arr.trayKey === "copy") await this.showIndependenceShield(idx);
      return { ok: true };
    }

    /** The bare Arrays.sort(name); statement — sorts whichever array
     * the call actually targets (the original OR the copy — the
     * evaluator doesn't assume; it sorts vars[name]'s real backing
     * array and animates the tray that array is currently tied to). */
    const sortMatch = line.match(/^Arrays\.sort\((\w+)\)\s*;$/);
    if (sortMatch) {
      const arr = vars[sortMatch[1]];
      if (arr && arr.kind === "array") {
        const before = arr.values.slice();
        if (arr.type === "String[]") arr.values.sort();
        else arr.values.sort((a, b) => a - b);
        const after = arr.values.slice();
        await this.runTraySortAnimation(arr.trayKey, before, after);
        await this.chalkWriteLine(`Arrays.sort(${sortMatch[1]})`, "#8ea6c8");
        this.chalkEvaluationArrow("void");
        this.updateResultRow("void");
      }
      return { ok: true };
    }

    const printMatch = line.match(/^System\.out\.println\((.*)\);$/);
    if (printMatch) {
      const r = await this.evalPrintArg(printMatch[1].trim(), vars);
      if (!r.ok) return r;
      if (!this._printedLines) this._printedLines = [];
      this._printedLines.push(r.value);
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
      this.clearReplicationFrame();
      this.wipeSlate();
      this.updateResultRow(null);
      if (this._lampPool) this.tweens.add({ targets: this._lampPool, alpha: 0, duration: 400 });
      const motes = this.ambient;
      this.ambient = null;
      (motes || []).forEach((m) => this.tweens.add({ targets: m, alpha: 0, duration: 1200 }));

      const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
      this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });
      const title = this.add.text(640, 240, "REPLICATION FAILED", { font: "bold 34px Georgia", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
      this.tweens.add({ targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut", onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }) });
      this.add.text(640, 310, `Score: ${this.score}`, { font: "21px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
      this.add.text(640, 350, `Rounds Completed: ${this.currentRound} / 12`, { font: "18px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);
      this._makeButton(525, 420, "RESTART THE BENCH", 200, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
      this._makeButton(755, 420, "RETURN TO MENU", 200, 50, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.start("MenuScene"));
    })();
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearRound();
    this.hideBubble();

    try { GameManager.completeLevel(67, Math.round((this.correctFirstTry / 12) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("arrays_copyOf_schema"); } catch (_) {}
    try {
      localStorage.setItem("level68_results", JSON.stringify({
        level: 68, concept: "arrays_copyOf", phase: "accretion",
        score: this.score, accuracy: this.correctFirstTry / 12, avgTime: this.totalTime / 12,
        comboMax: this.maxCombo, stars: this._starRating(), livesRemaining: this.lives,
        attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.copyBenchFinale().then(() => { if (this._alive) this.showScoreTally(); });
  }

  async copyBenchFinale() {
    await this.populateOriginalTray([3, 1, 4, 2], "int[]", "data");
    await this.materializeCopyTray(4, "int[]", "copy");
    await this.runDuplicationBeam();
    await this.flyGhostCopies([3, 1, 4, 2], 4, "int[]");
    await this.snapBridge();

    this._refDiagramTrays.forEach((tray, i) => {
      this.tweens.add({ targets: tray, alpha: 0.3, duration: 200, yoyo: true, repeat: 3, delay: i * 250 });
    });
    if (this._lampPool) this.tweens.add({ targets: this._lampPool, alpha: 0.08, duration: 400, yoyo: true, repeat: 2 });

    const sparkLayer = [];
    for (let i = 0; i < 10; i++) {
      const spark = this.add.circle(BRIDGE_X0 + Math.random() * (BRIDGE_X1 - BRIDGE_X0), BRIDGE_CY + (Math.random() - 0.5) * 20, 2, C_CYAN, 0.9).setDepth(20);
      sparkLayer.push(spark);
      this.tweens.add({ targets: spark, x: spark.x + (Math.random() - 0.5) * 40, alpha: 0, duration: 500 + Math.random() * 300, delay: i * 60, onComplete: () => spark.destroy() });
    }
    this.tweens.add({ targets: [this._origFrameGfx, this._copyFrameGfx], alpha: 0.7, duration: 200, yoyo: true, repeat: 2 });

    this.createConfetti((ORIG_X0 + COPY_X1) / 2, (TRAY_Y0 + TRAY_Y1) / 2, 40);
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

    const title = this.add.text(640, 190, "REPLICATION CERTIFIED", { font: "bold 30px Georgia", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(91).setScale(0);
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
    bg.strokeRoundedRect(-16, -6, 12, 12, 2);
    bg.strokeRoundedRect(4, -6, 12, 12, 2);
    bg.lineStyle(1, C_CYAN, 0.9);
    bg.lineBetween(-4, 0, 4, 0);
    badge.add(bg);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 1950 });
    const badgeLbl = this.add.text(640, 505, "copyOf() SCHEMA ACQUIRED", { font: "bold 14px Georgia", color: HEX_GOLD }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: badgeLbl, alpha: 1, duration: 300, delay: 2100 });

    this._makeButton(500, 545, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(770, 545, "NEXT: The Replication Trials →", 300, 44, { fill: 0x00733a, stroke: C_GREEN_BRIGHT, textColor: "#ffffff" }, () => {
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
