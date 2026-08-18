/**
 * Level 65 — "The Sorting Room" (Arrays Methods: Accretion Phase —
 * Arrays.sort())
 * ===========================================================================
 * The wing's second method, and its first IN-PLACE MUTATION. The hero
 * mechanic is the Arrangement Engine — a gantry-mounted arm above the L64
 * Specimen Tray that physically rearranges the tray's contents into
 * ascending order. Arrays.sort(arr) returns void: nothing comes back, the
 * tray itself IS the answer. Attempting to capture the return in a
 * variable is a compile error. The evaluator is honest: sort mutates the
 * array's actual value array in place (numeric comparator for int[],
 * natural Unicode ordering for String[] — matching Java's uppercase-
 * before-lowercase surprise), every subsequent read (bracket access,
 * Arrays.toString, length) sees the new arrangement, and toString calls
 * made BEFORE sort keep their frozen snapshot.
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

// Specimen tray (mounted lower than L64 to make room for the engine above)
const TRAY_X0 = 310, TRAY_X1 = 810, TRAY_Y0 = 280, TRAY_Y1 = 410;
const TRAY_CX = (TRAY_X0 + TRAY_X1) / 2;
// Arrangement engine (gantry above the tray)
const GANTRY_Y = 175, GANTRY_H = 12;
const ARM_TRAVEL_Y = TRAY_Y0 - 6;
// Display plaque
const PLAQUE_X = 240, PLAQUE_Y = 480, PLAQUE_W = 320, PLAQUE_H = 50;
// Before/after strip
const STRIP_X = TRAY_X0, STRIP_Y = 540, STRIP_W = TRAY_X1 - TRAY_X0, STRIP_H = 40;
// Curator's slate
const SLATE_X = 860, SLATE_Y = 130, SLATE_W = 370, SLATE_H = 300;

const TUTORIAL_KEY = "level65_tutorial_done";

// ══════════════════════════════════════════════════════════════
// ROUND CONFIGURATION
// ══════════════════════════════════════════════════════════════
const ROUNDS = [
  // ── Type A: Arrangement Prediction ──
  { round: 1, type: "predict",
    arrayInit: "{50, 20, 40, 10, 30}", arrayType: "int[]",
    source: "int[] data = {50, 20, 40, 10, 30};\nArrays.sort(data);\nSystem.out.println(Arrays.toString(data));",
    question: "What prints?", correct: "[10, 20, 30, 40, 50]",
    options: [
      { value: "[10, 20, 30, 40, 50]", tag: null },
      { value: "[50, 40, 30, 20, 10]", tag: "sort_descending_belief" },
      { value: "[50, 20, 40, 10, 30]", tag: "sort_preserves_original_belief" },
      { value: "[I@...", tag: "array_prints_contents_belief" },
    ],
    concept: "basic_sort_ascending" },

  { round: 2, type: "predict",
    arrayInit: "{3, 1, 3, 2}", arrayType: "int[]",
    source: "int[] nums = {3, 1, 3, 2};\nArrays.sort(nums);\nSystem.out.println(Arrays.toString(nums));",
    question: "What prints?", correct: "[1, 2, 3, 3]",
    options: [
      { value: "[1, 2, 3, 3]", tag: null },
      { value: "[1, 2, 3]", tag: "sort_removes_duplicates_belief" },
      { value: "[3, 3, 2, 1]", tag: "sort_descending_belief" },
      { value: "[3, 1, 3, 2]", tag: "sort_preserves_original_belief" },
    ],
    revealNote: "Duplicates stay — the engine arranges, never removes. Two 3s sit side by side in the sorted tray.",
    concept: "sort_preserves_duplicates" },

  { round: 3, type: "predict",
    arrayInit: "{7}", arrayType: "int[]",
    source: "int[] solo = {7};\nArrays.sort(solo);\nSystem.out.println(Arrays.toString(solo));",
    question: "What prints?", correct: "[7]",
    options: [
      { value: "[7]", tag: null },
      { value: "[]", tag: "sort_empties_belief" },
      { value: "error", tag: "sort_needs_multiple_belief", label: "Runtime error — can't sort one element" },
      { value: "7", tag: "sort_unwraps_single_belief" },
    ],
    revealNote: "One specimen is already in order — the engine activates, finds nothing to swap, settles immediately. No error, no drama; a sorted tray of one.",
    concept: "single_element_sort" },

  // ── Type B: Void, Mutation & Probes ──
  { round: 4, type: "predict",
    arrayInit: "{5, 1, 3}", arrayType: "int[]",
    source: "int[] arr = {5, 1, 3};\nint[] sorted = Arrays.sort(arr);",
    question: "What happens?", correct: "compile_error",
    options: [
      { value: "compile_error", tag: null, label: "COMPILE ERROR — void cannot be converted to int[]" },
      { value: "sorted_is_113_5", tag: "sort_returns_new_array_belief", label: "sorted = [1, 3, 5]" },
      { value: "sorted_is_same", tag: "sort_returns_sorted_belief", label: "sorted = arr (same tray)" },
      { value: "runtime_error", tag: "runtime_vs_compile_confusion", label: "Runtime exception" },
    ],
    revealNote: "THE void lesson: sort hands back NOTHING. You can't catch void in a variable. The tray itself changed — read it through the original name. arr is now [1, 3, 5]; no 'sorted' needed.",
    concept: "void_return" },

  { round: 5, type: "predict",
    arrayInit: "{9, 4, 7}", arrayType: "int[]",
    source: 'int[] arr = {9, 4, 7};\nString before = Arrays.toString(arr);\nArrays.sort(arr);\nString after = Arrays.toString(arr);\nSystem.out.println(before + " -> " + after);',
    question: "What prints?", correct: "[9, 4, 7] -> [4, 7, 9]",
    options: [
      { value: "[9, 4, 7] -> [4, 7, 9]", tag: null },
      { value: "[4, 7, 9] -> [4, 7, 9]", tag: "toString_is_live_view_belief" },
      { value: "[9, 4, 7] -> [9, 4, 7]", tag: "sort_preserves_original_belief" },
      { value: "[9, 4, 7] -> [I@...", tag: "toString_after_sort_fails_belief" },
    ],
    revealNote: "The BEFORE-AND-AFTER: 'before' captured the snapshot BEFORE sort ran — the String is frozen. 'after' captured the snapshot AFTER — the sorted tray. Two labels, two moments, one tray that changed between them. toString is a snapshot; sort is a mutation.",
    concept: "before_after_snapshot" },

  { round: 6, type: "predict",
    arrayInit: "{3, 1, 2}", arrayType: "int[]",
    source: "int[] arr = {3, 1, 2};\nArrays.sort(arr);\nSystem.out.println(arr[0]);",
    question: "What prints?", correct: "1",
    options: [
      { value: "1", tag: null },
      { value: "3", tag: "sort_preserves_original_belief" },
      { value: "2", tag: "sort_off_by_one_belief" },
      { value: "[1, 2, 3]", tag: "bracket_prints_whole_belief" },
    ],
    revealNote: "arr[0] AFTER sort reads the SMALLEST — sort placed it at index 0. The old tenant (3) moved up the tray. Every bracket access after sort sees the new arrangement.",
    concept: "mutation_persistence" },

  { round: 7, type: "predict",
    arrayInit: "{8, 2, 5}", arrayType: "int[]",
    source: "int[] arr = {8, 2, 5};\narr.sort();",
    question: "What happens?", correct: "compile_error",
    options: [
      { value: "compile_error", tag: null, label: "COMPILE ERROR — arrays don't have .sort()" },
      { value: "arr_sorted", tag: "arrays_instance_call_belief", label: "arr is sorted: [2, 5, 8]" },
      { value: "runtime_error", tag: "runtime_vs_compile_confusion", label: "Runtime exception" },
      { value: "void", tag: "instance_sort_void_belief", label: "Nothing — void" },
    ],
    revealNote: "The static law holds: Arrays.sort(arr), not arr.sort(). The tray has no built-in engine; the engine lives in the Arrays class. Same lesson as toString — the class name is the address.",
    concept: "static_call_probe" },

  // ── Type C: String Sorting & Expressions ──
  { round: 8, type: "predict",
    arrayInit: '{"banana", "Apple", "cherry"}', arrayType: "String[]",
    source: 'String[] words = {"banana", "Apple", "cherry"};\nArrays.sort(words);\nSystem.out.println(Arrays.toString(words));',
    question: "What prints?", correct: "[Apple, banana, cherry]",
    options: [
      { value: "[Apple, banana, cherry]", tag: null },
      { value: "[apple, banana, cherry]", tag: "sort_lowercases_belief" },
      { value: "[banana, cherry, Apple]", tag: "sort_ignores_case_belief" },
      { value: "[Apple, cherry, banana]", tag: "sort_by_length_belief" },
    ],
    revealNote: "LEXICOGRAPHIC order: uppercase letters come BEFORE lowercase in Unicode. 'A' (65) < 'b' (98) < 'c' (99), so Apple leads. The engine reads character codes, not human alphabet sense. Case-insensitive sorting requires extra work.",
    concept: "lexicographic_seed" },

  { round: 9, type: "predict",
    arrayInit: "{5, 2, 8, 1}", arrayType: "int[]",
    source: 'int[] arr = {5, 2, 8, 1};\nArrays.sort(arr);\nint smallest = arr[0];\nint largest = arr[arr.length - 1];\nSystem.out.println(smallest + " to " + largest);',
    question: "What prints?", correct: "1 to 8",
    options: [
      { value: "1 to 8", tag: null },
      { value: "5 to 1", tag: "sort_preserves_original_belief" },
      { value: "1 to 5", tag: "sort_changes_length_belief" },
      { value: "error", tag: "length_minus_one_error_belief", label: "ArrayIndexOutOfBoundsException" },
    ],
    revealNote: "Sort + bracket access: after sorting, arr[0] is the SMALLEST and arr[length−1] is the LARGEST — a free min/max lookup. Sort once, read the extremes by position. The pattern writes itself.",
    postMissionNote: "Bit: 'Sort, then read the edges — the smallest at index 0, the largest at length minus 1. The engine did the comparison work; your brackets just pick the winners. Cheaper than a loop, when you can afford the rearrangement.'",
    concept: "sort_then_extremes" },

  // ── Type D: Curator Command ──
  { round: 10, type: "command",
    arrayInit: "{42, 17, 88, 3}", arrayType: "int[]",
    source: "int[] scores = {42, 17, 88, 3};\n<slot:sort>\nSystem.out.println(Arrays.toString(scores));",
    mission: "Sort the scores and display them. Expected: [3, 17, 42, 88]",
    slots: [{ id: "sort", hint: "the sort call" }],
    cartridges: [
      { code: "Arrays.sort(scores);", correct: true },
      { code: "scores.sort();", tag: "arrays_instance_call_belief" },
      { code: "scores = Arrays.sort(scores);", tag: "sort_returns_new_array_belief" },
      { code: "arrays.sort(scores);", tag: "arrays_lowercase_belief" },
    ],
    tests: [{ expectedOutput: "[3, 17, 42, 88]" }],
    concept: "command_basic_sort" },

  { round: 11, type: "command",
    arrayInit: "{60, 30, 90, 10}", arrayType: "int[]",
    source: 'int[] temps = {60, 30, 90, 10};\nArrays.sort(temps);\nSystem.out.println("Coldest: " + <slot:min>);\nSystem.out.println("Hottest: " + <slot:max>);',
    mission: "After sorting, print the coldest (smallest) and hottest (largest). Expected:\nColdest: 10\nHottest: 90",
    slots: [{ id: "min", hint: "the smallest (after sort)" }, { id: "max", hint: "the largest (after sort)" }],
    cartridges: [
      { code: "temps[0]", correct: true, slotId: "min" },
      { code: "temps[1]", tag: "array_bracket_off_by_one", slotId: "min" },
      { code: "temps[temps.length - 1]", correct: true, slotId: "max" },
      { code: "temps[temps.length]", tag: "length_not_minus_one_belief", slotId: "max" },
      { code: "temps[3]", tag: "hardcoded_last_index", alsoCorrect: true, slotId: "max" },
    ],
    tests: [{ expectedOutput: "Coldest: 10⏎Hottest: 90" }],
    noteIsScenicSpecific: true,
    revealNote: "Sort, then read the edges: [0] is the minimum, [length−1] is the maximum. The engine did the comparing; the brackets just pick the results.",
    postMissionNote: "Bit (on the hardcoded build): 'temps[3] works for THIS tray — but temps[temps.length - 1] works for any tray, any size. Hardcoded indices break the moment the data changes.'",
    concept: "command_sort_extremes" },

  { round: 12, type: "command",
    arrayInit: '{"Echo", "Delta", "Alpha", "Bravo", "Charlie"}', arrayType: "String[]",
    source: 'String[] callsigns = {"Echo", "Delta", "Alpha", "Bravo", "Charlie"};\n<slot:sort>\nSystem.out.println("Sorted: " + <slot:display>);',
    mission: "Sort the callsigns alphabetically and display them.\nSorted: [Alpha, Bravo, Charlie, Delta, Echo]",
    slots: [{ id: "sort", hint: "sort the callsigns" }, { id: "display", hint: "display them" }],
    cartridges: [
      { code: "Arrays.sort(callsigns);", correct: true, slotId: "sort" },
      { code: "callsigns.sort();", tag: "arrays_instance_call_belief", slotId: "sort" },
      { code: "Arrays.toString(callsigns)", correct: true, slotId: "display" },
      { code: "callsigns", tag: "array_prints_contents_belief", slotId: "display" },
      { code: "callsigns.toString()", tag: "arrays_instance_call_belief", slotId: "display" },
    ],
    tests: [{ expectedOutput: "Sorted: [Alpha, Bravo, Charlie, Delta, Echo]" }],
    postMissionNote: "Bit (settling the sorting paddle): 'Sort then toString — the curator's workflow. The engine arranges; the labeller displays. Two static calls, one tray, one published result. The museum demands order; you have the tools to provide it.'",
    concept: "command_sort_and_display" },
];

const MISCONCEPTION_FEEDBACK = {
  sort_returns_new_array_belief: "sort returns VOID — nothing comes back. The tray itself changed; read it through the original name. There's no 'sorted' copy; there's the same tray, rearranged.",
  sort_returns_sorted_belief: "The compile stamp: void cannot be assigned. sort is a COMMAND, not a question. It changes the tray and walks away — you read the result through the original reference.",
  sort_void_surprise: "void means the method has no return value — it did its work on the tray itself. Print the tray afterward with Arrays.toString to see the result.",
  sort_descending_belief: "The engine sorts ASCENDING — smallest to largest, A to Z. The direction indicator says ASC. Descending requires extra work (not in this wing's scope).",
  sort_preserves_original_belief: "The original order is GONE — sort rewrote the tray in place. Every access after sort sees the new arrangement. To preserve the old order, you'd need a copy first.",
  sort_leaves_first_belief: "Index 0 changed — the engine put the SMALLEST value there. The old tenant moved to wherever it belongs in the sorted order.",
  sort_removes_duplicates_belief: "sort arranges — it never removes. Duplicates sit side by side in the sorted tray, both present.",
  sort_empties_belief: "A single specimen is already in order — the engine activates, finds nothing to swap, and settles. No error, no removal.",
  sort_needs_multiple_belief: "A single specimen is already in order — the engine activates, finds nothing to swap, and settles. No error, no removal.",
  sort_unwraps_single_belief: "A one-element array is still an ARRAY — Arrays.toString still wraps it in brackets: [7], not bare 7.",
  arrays_instance_call_belief: "Arrays have no built-in sort or toString method — the engine lives in the Arrays class. Arrays.sort(arr), not arr.sort(). The class name is the address.",
  arrays_lowercase_belief: "Case is law — 'arrays' is nobody; 'Arrays' is the class. Capital A.",
  sort_not_imported_belief: "Without import java.util.Arrays;, the class name is unrecognized. Same import as toString.",
  array_prints_contents_belief: "Without toString, println prints the hash, not the contents — even after sorting. sort rearranges; toString labels. Both are needed.",
  toString_is_live_view_belief: "The 'before' String was captured BEFORE sort ran — it's a frozen snapshot. The 'after' String captured the sorted state. toString takes a picture; sort changes the scene.",
  toString_before_sort_belief: "toString reads whatever the tray holds NOW — if called before sort, it reads the original order; after sort, the sorted order. The timing matters.",
  toString_after_sort_fails_belief: "toString never fails after a sort — it just reads whatever the tray currently holds, sorted or not.",
  sort_ignores_case_belief: "Lexicographic: uppercase letters have LOWER Unicode values than lowercase — 'A' (65) < 'a' (97). So uppercase sorts first. The engine reads codes, not human alphabet sense.",
  sort_lowercases_belief: "sort rearranges — it never changes the letters themselves. Apple keeps its capital A; it just moves to the front.",
  sort_by_length_belief: "Lexicographic compares letter by letter, not by length. 'Apple' before 'banana' because 'A' < 'b' in Unicode.",
  sort_changes_length_belief: "Sort never adds or removes — the tray's length is FIXED. Same number of compartments, same length, different arrangement.",
  sort_off_by_one_belief: "arr[0] is the FIRST slot — the smallest, after sort. Trace the sorted order from the start.",
  bracket_prints_whole_belief: "A single bracket access reads ONE compartment, not the whole tray. arr[0] is just the first value.",
  length_minus_one_error_belief: "arr.length - 1 is exactly the last valid index — no crash. length counts compartments; the last index is one less.",
  length_not_minus_one_belief: "The cliff: arr[length] reaches past the last compartment. The last index is length − 1, in every wing, forever.",
  hardcoded_last_index: "temps[3] works for THIS tray — but the pattern is temps[temps.length - 1], which works for any tray. Hardcoded indices break on different data.",
  array_bracket_off_by_one: "Index 0 is the smallest after sort — index 1 is the second-smallest, not the minimum.",
  runtime_vs_compile_confusion: "Forbidden calls and type mismatches die at COMPILE time — before anything runs.",
  instance_sort_void_belief: "arr.sort() isn't legal Java at all — arrays have no sort method to return anything, void or otherwise. It's a COMPILE ERROR, not a silent no-op.",
};

const HINTS = {
  1: "Arrays.sort(data) rearranges ascending: smallest to largest.",
  2: "Duplicates aren't removed — [1, 2, 3, 3].",
  3: "One element is already sorted: [7].",
  4: "sort returns void — nothing to assign. COMPILE ERROR.",
  5: "before was captured pre-sort; after was captured post-sort — different snapshots.",
  6: "After sort, arr[0] holds the smallest value.",
  7: "Arrays.sort(arr), never arr.sort() — arrays have no instance method.",
  8: "Uppercase sorts before lowercase: Apple, banana, cherry.",
  9: "arr[0] is the min, arr[arr.length - 1] is the max, after sorting.",
  10: "Arrays.sort(scores); — the plain static call, no assignment.",
  11: "temps[0] for the coldest; temps[temps.length - 1] for the hottest.",
  12: "Arrays.sort(callsigns); then Arrays.toString(callsigns) to display.",
};

export class Level65Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level65Scene" });
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
    this._metronomeActive = false;
    this._firstRunMetricsRecorded = {};
  }

  preload() {}

  create() {
    this._alive = true;
    this.createParticleTexture();
    this.createBackground();
    this.createRoomInterior();
    this.createMuseumFloor();
    this.createParticles();
    this.createSpecimenTray();
    this.createArrangementEngine();
    this.createDisplayPlaque();
    this.createBeforeAfterStrip();
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
    this.updateMetronome(time);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // SETUP — THE SORTING ROOM INTERIOR
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l65_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l65_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x0a1208).setDepth(0);
  }

  createRoomInterior() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x1a0e05, 1);
    g.fillRect(0, 108, W, 108);
    g.lineStyle(1, 0x3a2618, 0.5);
    for (let x = 0; x < W; x += 30) g.lineBetween(x, 108, x, 216);
    g.fillStyle(0x0a1208, 1);
    g.fillRect(0, 0, W, 108);
    g.lineStyle(2, C_BRASS, 0.4);
    g.lineBetween(0, 108, W, 108);

    // tool hooks along the picture rail
    for (let i = 0; i < 6; i++) {
      const hx = 950 + i * 22;
      g.fillStyle(C_BRASS, 0.5);
      g.fillCircle(hx, 100, 2);
      g.lineStyle(1, C_BRASS, 0.4);
      g.lineBetween(hx, 100, hx, 106);
      const toolShapes = ["brush", "tweezers", "loupe", "tag", "brush", "tweezers"];
      const shape = toolShapes[i];
      if (shape === "brush") { g.fillStyle(0x8a6435, 0.4); g.fillRect(hx - 1, 106, 2, 10); }
      else if (shape === "tweezers") { g.lineStyle(1, 0x8a6435, 0.4); g.lineBetween(hx - 2, 106, hx, 114); g.lineBetween(hx + 2, 106, hx, 114); }
      else if (shape === "loupe") { g.lineStyle(1, 0x8a6435, 0.4); g.strokeCircle(hx, 110, 3); }
      else { g.fillStyle(0xe0d6b8, 0.3); g.fillRect(hx - 2, 106, 4, 6); }
    }

    // sorting reference charts
    [200, 880].forEach((cx, i) => {
      const cg = this.add.graphics().setDepth(2);
      cg.fillStyle(0x0a1208, 1);
      cg.lineStyle(2, 0x3a2618, 1);
      cg.fillRect(cx, 60, 120, 80);
      cg.strokeRect(cx, 60, 120, 80);
      this._chartGlow = this._chartGlow || [];
      const glowEl = this.add.rectangle(cx + 60, 100, 116, 76, 0xffa726, 0).setDepth(2);
      this._chartGlow.push(glowEl);
      if (i === 0) {
        cg.lineStyle(1, C_BLUE_GRAY, 0.4);
        cg.lineBetween(cx + 10, 100, cx + 110, 100);
        [1, 3, 5, 9].forEach((v, vi) => {
          const px = cx + 20 + vi * 25;
          cg.fillStyle(C_BLUE_GRAY, 0.4);
          cg.fillCircle(px, 100, 2);
          this.add.text(px, 88, String(v), { font: "9px Courier New", color: HEX_BLUE_GRAY }).setOrigin(0.5).setAlpha(0.35).setDepth(3);
        });
      } else {
        this.add.text(cx + 60, 84, "A B C ... Z", { font: "10px Courier New", color: HEX_BLUE_GRAY }).setOrigin(0.5).setAlpha(0.4).setDepth(3);
        this.add.text(cx + 60, 100, "a b c ...", { font: "10px Courier New", color: HEX_GREEN_MUTED }).setOrigin(0.5).setAlpha(0.4).setDepth(3);
        this.add.text(cx + 60, 116, "(upper before lower)", { font: "italic 8px Georgia", color: "#3a2618" }).setOrigin(0.5).setAlpha(0.5).setDepth(3);
      }
    });

    // brass metronome
    const metC = this.add.container(80, 480).setDepth(3);
    const metBody = this.add.graphics();
    metBody.fillStyle(0x1a1408, 1);
    metBody.lineStyle(1.5, C_BRASS, 1);
    metBody.fillTriangle(-14, 30, 14, 30, 0, -30);
    metBody.strokeTriangle(-14, 30, 14, 30, 0, -30);
    this.metronomePendulum = this.add.container(0, 0);
    const pend = this.add.graphics();
    pend.lineStyle(1.5, C_BRASS, 0.9);
    pend.lineBetween(0, 0, 0, 22);
    pend.fillStyle(C_GOLD, 0.8);
    pend.fillCircle(0, 14, 3);
    this.metronomePendulum.add(pend);
    metC.add([metBody, this.metronomePendulum]);
    this._metronomeContainer = metC;
    this._metronomeSwing = 0;

    const bg = this.add.graphics().setDepth(3);
    bg.fillStyle(0x0a1208, 1);
    bg.lineStyle(1, C_BRASS, 0.5);
    bg.fillRoundedRect(400, 12, 340, 26, 3);
    bg.strokeRoundedRect(400, 12, 340, 26, 3);
    this.add.text(570, 25, "T H E   S O R T I N G   R O O M", { font: "bold 15px Georgia", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.7).setDepth(4);
  }

  updateMetronome(time) {
    if (!this.metronomePendulum) return;
    const swing = this._metronomeActive ? Math.sin(time * 0.01) * 22 : Math.sin(time * 0.0015) * 2;
    this.metronomePendulum.setAngle(swing);
  }

  _metronomeTick() {
    if (!this._metronomeContainer) return;
    this.tweens.add({ targets: this._metronomeContainer, scale: 1.06, duration: 60, yoyo: true });
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
    const p = this.add.particles(x, y, "l65_dot", {
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
  // THE SPECIMEN TRAY (reused from L64)
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

  // ══════════════════════════════════════════════════════════════
  // THE ARRANGEMENT ENGINE (hero mechanic — NEW)
  // ══════════════════════════════════════════════════════════════

  createArrangementEngine() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x1a1408, 1);
    g.lineStyle(2, C_BRASS, 1);
    g.fillRoundedRect(TRAY_X0, GANTRY_Y, TRAY_X1 - TRAY_X0, GANTRY_H, 4);
    g.strokeRoundedRect(TRAY_X0, GANTRY_Y, TRAY_X1 - TRAY_X0, GANTRY_H, 4);
    [TRAY_X0 + 6, TRAY_X1 - 6].forEach((x) => {
      g.fillStyle(0x1a1408, 1);
      g.lineStyle(1.5, C_BRASS, 0.8);
      g.fillRect(x - 4, GANTRY_Y + GANTRY_H, 8, TRAY_Y0 - (GANTRY_Y + GANTRY_H));
      g.strokeRect(x - 4, GANTRY_Y + GANTRY_H, 8, TRAY_Y0 - (GANTRY_Y + GANTRY_H));
    });

    const plateW = 110, plateH = 22;
    const plateX = TRAY_CX - 14 - plateW / 2, plateY = GANTRY_Y - plateH - 6;
    const pg = this.add.graphics().setDepth(11);
    pg.fillStyle(0x0a1208, 1);
    pg.lineStyle(2, C_GOLD, 1);
    pg.fillRoundedRect(plateX, plateY, plateW, plateH, 4);
    pg.strokeRoundedRect(plateX, plateY, plateW, plateH, 4);
    this.add.text(plateX + plateW / 2, plateY + 7, "Arrays", { font: "bold 13px Courier New", color: HEX_GOLD }).setOrigin(0.5).setDepth(12);
    this.add.text(plateX + plateW / 2, plateY + 16, ".sort", { font: "11px Courier New", color: HEX_CYAN }).setOrigin(0.5).setDepth(12);

    const arrowG = this.add.graphics().setDepth(12);
    const ax = plateX + plateW + 16, ay = plateY + plateH / 2;
    arrowG.lineStyle(2, C_GREEN_BRIGHT, 1);
    arrowG.lineBetween(ax, ay + 6, ax, ay - 6);
    arrowG.lineBetween(ax - 3, ay - 3, ax, ay - 6);
    arrowG.lineBetween(ax + 3, ay - 3, ax, ay - 6);
    this.directionArrow = arrowG;
    this.add.text(ax, ay + 14, "ASC", { font: "bold 9px Courier New", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(12).setAlpha(0.8);

    this.armContainer = this.add.container(TRAY_CX, GANTRY_Y + GANTRY_H).setDepth(14);
    const armG = this.add.graphics();
    armG.lineStyle(3, C_BRASS, 1);
    armG.lineBetween(0, 0, 0, 50);
    armG.lineStyle(2, C_BRASS, 1);
    armG.lineBetween(-6, 50, 0, 58);
    armG.lineBetween(6, 50, 0, 58);
    this.armContainer.add(armG);
    this.armContainer.setVisible(false);
  }

  async activateEngine() {
    this.armContainer.setPosition(TRAY_CX, GANTRY_Y + GANTRY_H).setVisible(true).setAlpha(0);
    this.tweens.add({ targets: this.directionArrow, alpha: 0.4, duration: 180, yoyo: true, repeat: 2 });
    await new Promise((res) => { this.tweens.add({ targets: this.armContainer, alpha: 1, duration: 140, onComplete: res }); });
  }

  deactivateEngine() {
    this.tweens.add({ targets: this.armContainer, alpha: 0, duration: 180, onComplete: () => { if (this.armContainer.active) this.armContainer.setVisible(false); } });
  }

  async haltEngine() {
    await this.activateEngine();
    await this.delay(180);
    this.tweens.add({ targets: this.armContainer, alpha: 0.3, duration: 140 });
    this.showCompileErrorStamp();
    await this.delay(500);
    this.deactivateEngine();
  }

  async moveArmTo(x) {
    await new Promise((res) => { this.tweens.add({ targets: this.armContainer, x, duration: 170, ease: "Sine.easeInOut", onComplete: res }); });
  }

  async armDescend() {
    await new Promise((res) => { this.tweens.add({ targets: this.armContainer, y: ARM_TRAVEL_Y, duration: 110, ease: "Sine.easeOut", onComplete: res }); });
  }

  async armAscend() {
    await new Promise((res) => { this.tweens.add({ targets: this.armContainer, y: GANTRY_Y + GANTRY_H, duration: 110, ease: "Sine.easeIn", onComplete: res }); });
  }

  /** Swaps the specimens at two compartments — the arm travels above
   * their midpoint while both cards lift, cross, and settle. Index
   * plates never move; only the compartment bookkeeping (card, value,
   * text/gfx refs) swaps, so the tray's slots stay fixed. */
  async animateSwap(indexA, indexB) {
    const compA = this._trayCompartments[indexA], compB = this._trayCompartments[indexB];
    if (!compA || !compB || !compA.card || !compB.card) return;
    this._metronomeTick();
    const midX = (compA.x + compA.w / 2 + compB.x + compB.w / 2) / 2;
    await this.moveArmTo(midX);
    await this.armDescend();
    const cardA = compA.card, cardB = compB.card;
    const posA = { x: cardA.x, y: cardA.y }, posB = { x: cardB.x, y: cardB.y };
    await new Promise((res) => {
      this.tweens.add({ targets: cardA, y: posA.y - 22, duration: 90 });
      this.tweens.add({ targets: cardB, y: posB.y - 22, duration: 90, onComplete: res });
    });
    await new Promise((res) => {
      this.tweens.add({ targets: cardA, x: posB.x, duration: 210, ease: "Sine.easeInOut" });
      this.tweens.add({ targets: cardB, x: posA.x, duration: 210, ease: "Sine.easeInOut", onComplete: res });
    });
    await new Promise((res) => {
      this.tweens.add({ targets: cardA, y: posA.y, duration: 90 });
      this.tweens.add({ targets: cardB, y: posB.y, duration: 90, onComplete: res });
    });
    await this.armAscend();

    compA.card = cardB; compB.card = cardA;
    [compA.value, compB.value] = [compB.value, compA.value];
    [compA.cardText, compB.cardText] = [compB.cardText, compA.cardText];
    [compA.cardGfx, compB.cardGfx] = [compB.cardGfx, compA.cardGfx];
    [compA.cardColor, compB.cardColor] = [compB.cardColor, compA.cardColor];
    [compA.cardW, compB.cardW] = [compB.cardW, compA.cardW];
  }

  async settlingGlow() {
    const cards = this._trayCompartments.map((c) => c.card).filter(Boolean);
    cards.forEach((card) => {
      const flash = this.add.rectangle(card.x, card.y, 60, 44, C_GREEN_BRIGHT, 0.25).setDepth(13);
      this.tweens.add({ targets: flash, alpha: 0, duration: 350, onComplete: () => flash.destroy() });
    });
    await this.delay(300);
  }

  showVoidAnnotation() {
    const t = this.add.text(PLAQUE_X + PLAQUE_W / 2, PLAQUE_Y - 16, "void", { font: "bold 16px Courier New", color: HEX_GRAY }).setOrigin(0.5).setDepth(20).setAlpha(0);
    this.roundElements.push(t);
    this.tweens.add({ targets: t, alpha: 1, duration: 150 });
    this.time.delayedCall(700, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 200, onComplete: () => t.destroy() }); });
  }

  /** The full choreography for a genuine Arrays.sort(arr) call: engine
   * activates, the metronome ticks per swap, a bounded sequence of
   * honest swaps carries each value to its sorted position (never more
   * swaps than the permutation actually needs), a settling glow, then
   * the void beat. */
  async runSortAnimation(before, after) {
    await this.activateEngine();
    this._metronomeActive = true;
    const working = before.slice();
    const n = working.length;
    let swaps = 0;
    for (let i = 0; i < n && swaps < 8; i++) {
      if (!this._alive) break;
      if (working[i] === after[i]) continue;
      let j = -1;
      for (let k = i + 1; k < n; k++) { if (working[k] === after[i]) { j = k; break; } }
      if (j === -1) continue;
      await this.animateSwap(i, j);
      const tmp = working[i]; working[i] = working[j]; working[j] = tmp;
      swaps++;
    }
    this._metronomeActive = false;
    await this.settlingGlow();
    this.deactivateEngine();
  }

  // ══════════════════════════════════════════════════════════════
  // THE DISPLAY PLAQUE (reused from L64)
  // ══════════════════════════════════════════════════════════════

  createDisplayPlaque() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x1a1408, 1);
    g.lineStyle(2, C_BRASS, 1);
    g.fillRoundedRect(PLAQUE_X, PLAQUE_Y, PLAQUE_W, PLAQUE_H, 4);
    g.strokeRoundedRect(PLAQUE_X, PLAQUE_Y, PLAQUE_W, PLAQUE_H, 4);
    this.plaqueText = this.add.text(PLAQUE_X + PLAQUE_W / 2, PLAQUE_Y + PLAQUE_H / 2, "", { font: "bold 17px Courier New", color: "#e8eaf6", wordWrap: { width: PLAQUE_W - 20 }, align: "center" }).setOrigin(0.5).setDepth(11);
    this.scanBar = this.add.rectangle(TRAY_X0 + 8, (TRAY_Y0 + TRAY_Y1) / 2 - 8, 3, TRAY_Y1 - TRAY_Y0 - 30, C_GOLD, 0.8).setDepth(13).setVisible(false);
  }

  clearPlaque() {
    this.plaqueText.setText("").setColor("#e8eaf6").setFontSize(15);
  }

  _fakeHash(roundIndex, type) {
    const hex = ((roundIndex + 1) * 7919 + 12345).toString(16).padStart(8, "0");
    return type === "String[]" ? `[Ljava.lang.String;@${hex}` : `[I@${hex}`;
  }

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

  async showCursedLabel(type) {
    this.clearPlaque();
    this.tweens.add({ targets: this.traySpecimenLayer, x: "+=3", duration: 30, yoyo: true, repeat: 5 });
    this.screenShake(0.003, 150);
    await this.delay(200);
    const hash = this._fakeHash(this.currentRound, type);
    this.plaqueText.setColor(HEX_RED).setFontSize(12);
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
      this.createAnnotation(PLAQUE_X + PLAQUE_W / 2, PLAQUE_Y - 18, "the array's ADDRESS, not its contents", HEX_GREEN_MUTED);
    }
    await this.delay(300);
    this.plaqueText.setFontSize(15);
    return hash;
  }

  // ══════════════════════════════════════════════════════════════
  // THE BEFORE/AFTER STRIP (the mutation receipt — NEW)
  // ══════════════════════════════════════════════════════════════

  createBeforeAfterStrip() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0a0d18, 0.85);
    g.lineStyle(1, C_BRASS, 0.4);
    g.fillRoundedRect(STRIP_X, STRIP_Y, STRIP_W, STRIP_H, 4);
    g.strokeRoundedRect(STRIP_X, STRIP_Y, STRIP_W, STRIP_H, 4);
    this.stripBeforeText = this.add.text(STRIP_X + STRIP_W / 2 - 12, STRIP_Y + STRIP_H / 2, "", { font: "13px Courier New", color: HEX_GRAY }).setOrigin(1, 0.5).setDepth(11);
    this.stripArrowText = this.add.text(STRIP_X + STRIP_W / 2, STRIP_Y + STRIP_H / 2, "", { font: "bold 14px Arial", color: HEX_BRASS }).setOrigin(0.5).setDepth(11);
    this.stripAfterText = this.add.text(STRIP_X + STRIP_W / 2 + 12, STRIP_Y + STRIP_H / 2, "", { font: "bold 13px Courier New", color: "#e8eaf6" }).setOrigin(0, 0.5).setDepth(11);
  }

  clearBeforeAfterStrip() {
    this.stripBeforeText.setFontSize(11).setText("");
    this.stripArrowText.setText("");
    this.stripAfterText.setFontSize(11).setText("");
    if (this._stripStrike) { this._stripStrike.destroy(); this._stripStrike = null; }
  }

  showBeforeAfter(before, after) {
    const fmt = (arr) => `[${arr.join(", ")}]`;
    this.stripBeforeText.setFontSize(11).setText(fmt(before));
    this.stripArrowText.setText("→");
    this.stripAfterText.setFontSize(11).setText(fmt(after));
    if (this.stripBeforeText.width > STRIP_W / 2 - 24) this.stripBeforeText.setFontSize(9);
    if (this.stripAfterText.width > STRIP_W / 2 - 24) this.stripAfterText.setFontSize(9);
    if (this._stripStrike) this._stripStrike.destroy();
    const bx0 = this.stripBeforeText.x - this.stripBeforeText.width, bx1 = this.stripBeforeText.x;
    this._stripStrike = this.add.rectangle((bx0 + bx1) / 2, this.stripBeforeText.y, this.stripBeforeText.width, 1, 0x78909c, 0.8).setDepth(12);
    this.roundElements.push(this._stripStrike);
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
    const re = /("(?:[^"\\]|\\.)*")|(\bimport\b|\bint\b|\bdouble\b|\bString\b|\bnew\b)|(\bArrays\b)|(\.toString\b|\.sort\b|\.length\b|\.get\b|\.add\b|\.size\b)|(\bSystem\.out\b)|(int\[\]|String\[\]|double\[\])|(-?\d+\.\d+|-?\d+)|([(){}\[\];.,=+])/g;
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
    const lineH = fontSize + 8;
    const startY = 110 - ((lines.length - 1) * lineH) / 2;
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
    g.fillRoundedRect(400, 70, 480, 18, 4);
    this.exprMonitorText = this.add.text(640, 79, "", { font: "12px Courier New", color: HEX_GRAY }).setOrigin(0.5).setDepth(51);
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

    this.add.text(20, 14, "THE SORTING ROOM", { font: "bold 16px Georgia", color: "#b0bec5" }).setDepth(50);
    this.add.text(20, 32, "Accretion Phase — Arrays Methods: sort()", { font: "12px Arial", color: "#546e7a" }).setDepth(50);

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
  // BIT — ARRANGEMENT CLERK VARIANT
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
    const gloveR = this.add.circle(16, 10, 4, 0xffffff, 0).setStrokeStyle(1, 0xe8eaf6, 0.7);
    this.paddle = this.add.container(18, 6);
    const paddleG = this.add.graphics();
    paddleG.lineStyle(1, C_BRASS, 0.5);
    paddleG.lineBetween(0, 0, 0, 10);
    paddleG.fillStyle(C_BRASS, 0.8);
    paddleG.lineStyle(1, 0x8a6435, 0.8);
    paddleG.fillRoundedRect(-8, -10, 16, 10, 2);
    paddleG.strokeRoundedRect(-8, -10, 16, 10, 2);
    const paddleArrow = this.add.text(0, -5, "↑", { font: "bold 9px Arial", color: "#0a1208" }).setOrigin(0.5);
    this.paddle.add([paddleG, paddleArrow]);
    c.add([g, frock, eye, pupil, gloveL, this.paddle, gloveR, tip]);
    this.tweens.add({ targets: tip, alpha: 0.3, duration: 900, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: c, y: "+=3", duration: 2000, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
    this.bit = c;
  }

  async raisePaddle() {
    await new Promise((res) => { this.tweens.add({ targets: this.paddle, angle: -30, y: -4, duration: 200, ease: "Sine.easeOut", onComplete: res }); });
  }

  lowerPaddle() {
    this.tweens.add({ targets: this.paddle, angle: 0, y: 6, duration: 200, ease: "Sine.easeIn" });
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
    await this.raisePaddle();
    await this.bitSay("The Sorting Room, Clerk — where every collection is arranged before the public sees it. The Arrangement Engine does one thing: it reaches INTO the tray and puts the specimens in order. Ascending — smallest to largest, A to Z. But here's the lesson that separates this room from every other: the engine returns NOTHING. It changes the tray and walks away.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(6500)]); if (!A()) return;
    this.hideBubble();
    this.lowerPaddle();

    this.updateSourceDisplay(["int[] data = {30, 10, 20};"]);
    await this.populateTray([30, 10, 20], "int[]");
    if (!A()) return;
    this.updateSourceDisplay(["Arrays.sort(data);"]);
    const before1 = [30, 10, 20], after1 = [10, 20, 30];
    await this.runSortAnimation(before1, after1);
    this.showVoidAnnotation();
    this.showBeforeAfter(before1, after1);
    if (!A()) return;
    await this.bitSay("Watch the tray — the specimens MOVED. 30 was in slot zero; now 10 lives there. The engine reached in and rearranged. And see the plaque: it's BLANK. sort() returned void — nothing to display. The tray IS the result; you read it afterward.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(6500)]); if (!A()) return;
    this.hideBubble();

    this.updateSourceDisplay(["System.out.println(Arrays.toString(data));"]);
    await this.runToStringScan(after1, "int[]");
    if (!A()) return;
    await this.bitSay("toString AFTER sort — the pair that works. sort rearranges; toString labels. And notice: we printed 'data' — the SAME variable, the SAME tray. The old order is gone. There is no undo, no backup. This is IN-PLACE mutation.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(6500)]); if (!A()) return;
    this.hideBubble();
    this.clearPlaque();
    this.clearBeforeAfterStrip();

    this.updateSourceDisplay(["int[] sorted = Arrays.sort(data);"]);
    await this.haltEngine();
    if (!A()) return;
    await this.bitSay("REFUSED — sort returns void, not an array. You can't catch what doesn't come back. The tray doesn't leave the room; the engine just rearranges what's inside. To preserve the original order, you'd need a COPY first — but that's another instrument's work, for another day.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(6500)]); if (!A()) return;
    this.hideBubble();

    this.updateSourceDisplay(['String[] names = {"Charlie", "Alice", "Bob"};', "Arrays.sort(names);", "System.out.println(Arrays.toString(names));"]);
    await this.populateTray(["Charlie", "Alice", "Bob"], "String[]");
    const before2 = ["Charlie", "Alice", "Bob"], after2 = ["Alice", "Bob", "Charlie"];
    await this.runSortAnimation(before2, after2);
    this.showVoidAnnotation();
    this.showBeforeAfter(before2, after2);
    await this.runToStringScan(after2, "String[]");
    if (!A()) return;
    await this.bitSay("Strings sort ALPHABETICALLY — lexicographic order, the dictionary's rule. Alice before Bob before Charlie. The engine reads the same tray type (String[]) and arranges by the letters' natural order. Numbers by size, words by alphabet — the engine knows both.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(6500)]); if (!A()) return;
    this.hideBubble();

    this.clearTray();
    this.clearPlaque();
    this.clearBeforeAfterStrip();
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
    this.clearBeforeAfterStrip();
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
    const c = this.add.container(TRAY_CX, 600).setDepth(40).setAlpha(0);
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
    g.fillRoundedRect(-130, -20, 260, 40, 10);
    g.lineStyle(2, correct ? C_GREEN_BRIGHT : C_RED, 1);
    g.strokeRoundedRect(-130, -20, 260, 40, 10);
    if (!correct) this.tweens.add({ targets: bubbleContainer, x: bubbleContainer.x + 5, duration: 35, yoyo: true, repeat: 4 });

    const vars = {};
    await this.runStatements(config.source.split("\n"), vars);
    if (!this._alive) return;
    if (config.revealNote) this.createFloatingText(TRAY_CX, 155, config.revealNote, HEX_GRAY, "13px Arial", 3000);
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
    const startY = 110 - ((lines.length - 1) * lineH) / 2;
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
    const bt = this.add.text(0, 0, "ARRANGE", { font: "bold 15px Arial", color: "#0a1208" }).setOrigin(0.5);
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
    this.clearPlaque();
    this.clearBeforeAfterStrip();

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
    this.createFloatingText(TRAY_CX, 155, pass ? "✓" : "✗", pass ? HEX_GREEN_BRIGHT : HEX_RED, "bold 23px Arial", 900);

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
      await this.showBitFeedback(MISCONCEPTION_FEEDBACK[failTag] || config.revealNote || "The tray shows exactly what your code produced — compare it against the mission and adjust.");
      if (!this._alive) return;
      this.inputLocked = false;
      await this.populateTray(this._parseArrayInit(config.arrayInit, config.arrayType), config.arrayType);
      this.wipeSlate();
      this.updateResultRow(null);
      this.clearPlaque();
      this.clearBeforeAfterStrip();
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
  // HONEST EVALUATOR — array creation, Arrays.sort (genuine in-place
  // mutation via a numeric comparator for int[] / natural Unicode
  // ordering for String[], void return, the void-assignment compile
  // check), Arrays.toString on the CURRENT array state, bracket access,
  // .length, and the ArrayList/instance-method compile checks.
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

    const bracketMatch = t.match(/^(\w+)\[(.+)\]$/);
    if (bracketMatch) {
      const arr = vars[bracketMatch[1]];
      if (!arr || arr.kind !== "array") return { ok: false, crash: "eval" };
      const idxExpr = bracketMatch[2].trim();
      const idxRes = await this._resolveIndexExpr(idxExpr, vars);
      if (!idxRes.ok) return idxRes;
      const idx = idxRes.value;
      if (idx < 0 || idx >= arr.values.length) { await this.crashIOOBE(idx); return { ok: false, crash: "ioobe" }; }
      const value = await this.bracketAccessGhost(idx);
      await this.chalkWriteLine(`${bracketMatch[1]}[${idxExpr}]`, "#8ea6c8");
      this.chalkEvaluationArrow(value);
      const elemType = arr.type === "String[]" ? "String" : arr.type.replace("[]", "");
      this.updateResultRow(elemType);
      return { ok: true, value, type: elemType };
    }

    // a bare array reference OUTSIDE any of the patterns above (e.g.
    // nested inside a concatenation, "Sorted: " + arr) is the same
    // cursed-hash case println(arr) shows — handled in the bare-
    // variable fallback below, not just at the top-level print call.

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
      if (v.kind === "array") {
        // a bare array reference — whether it's println's WHOLE argument
        // or just nested inside a concatenation — is the cursed hash,
        // never the contents.
        const hash = await this.showCursedLabel(v.type);
        await this.chalkWriteLine(t, "#8ea6c8");
        this.chalkEvaluationArrow(hash);
        this.updateResultRow("String");
        return { ok: true, value: hash, type: "String" };
      }
      return { ok: true, value: v.value, type: v.type };
    }

    return { ok: false, crash: "eval" };
  }

  /** Resolves a bracket index expression: a literal digit, a bare
   * arr.length, arr.length - N (the only arithmetic this level's
   * rounds need), or a plain int variable. */
  async _resolveIndexExpr(idxExpr, vars) {
    const t = idxExpr.trim();
    if (/^\d+$/.test(t)) return { ok: true, value: parseInt(t, 10) };
    const lengthMinusMatch = t.match(/^(\w+)\.length\s*-\s*(\d+)$/);
    if (lengthMinusMatch) {
      const refArr = vars[lengthMinusMatch[1]];
      if (!refArr || refArr.kind !== "array") return { ok: false, crash: "eval" };
      return { ok: true, value: refArr.values.length - parseInt(lengthMinusMatch[2], 10) };
    }
    const lengthMatch = t.match(/^(\w+)\.length$/);
    if (lengthMatch) {
      const refArr = vars[lengthMatch[1]];
      if (!refArr || refArr.kind !== "array") return { ok: false, crash: "eval" };
      return { ok: true, value: refArr.values.length };
    }
    if (vars[t] !== undefined && vars[t].kind !== "array") return { ok: true, value: vars[t].value };
    return { ok: false, crash: "eval" };
  }

  async evalPrintArg(argExpr, vars) {
    const r = await this.resolveExpr(argExpr.trim(), vars);
    if (!r.ok) return { ok: false, crash: r.crash || "eval" };
    return { ok: true, value: String(r.value) };
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
      const baseType = arrDecl[1], name = arrDecl[2];
      const type = `${baseType}[]`;
      const values = this._parseArrayInit(`{${arrDecl[3]}}`, type);
      vars[name] = { kind: "array", values, type };
      return { ok: true };
    }

    // sort's return is void — ANY attempt to capture it is a compile error.
    if (/=\s*Arrays\.sort\(/.test(line)) {
      await this.haltEngine();
      return { ok: false, crash: "compile" };
    }

    const instanceMatch = line.match(/(\w+)\.(get|add|size|sort)\(/);
    if (instanceMatch && vars[instanceMatch[1]] && vars[instanceMatch[1]].kind === "array") {
      this.showCompileErrorStamp();
      await this.delay(450);
      return { ok: false, crash: "compile" };
    }

    if (/\barrays\.(toString|sort)\(/.test(line)) {
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
      }
      return { ok: true };
    }

    /** The bare Arrays.sort(name); statement — the ONLY legal shape for
     * sort, since its void return can never be captured. Sorts the
     * array's actual values in place (numeric comparator for numbers;
     * default/natural-Unicode comparator for Strings, matching Java's
     * uppercase-before-lowercase ordering) and runs the honest
     * choreography before/after the mutation. */
    const sortMatch = line.match(/^Arrays\.sort\((\w+)\)\s*;$/);
    if (sortMatch) {
      const arr = vars[sortMatch[1]];
      if (arr && arr.kind === "array") {
        const before = arr.values.slice();
        if (arr.type === "String[]") arr.values.sort();
        else arr.values.sort((a, b) => a - b);
        const after = arr.values.slice();
        await this.runSortAnimation(before, after);
        this.showVoidAnnotation();
        this.showBeforeAfter(before, after);
        await this.chalkWriteLine(`Arrays.sort(${sortMatch[1]})`, "#8ea6c8");
        this.chalkEvaluationArrow("void");
        this.updateResultRow("void");
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
      this.clearTray();
      this.clearPlaque();
      this.clearBeforeAfterStrip();
      this.wipeSlate();
      this._metronomeActive = false;
      this.tweens.add({ targets: this.armContainer, alpha: 0.15, duration: 400 });
      if (this._chartGlow) this._chartGlow.forEach((g) => this.tweens.add({ targets: g, alpha: 0, duration: 400 }));
      const motes = this.ambient;
      this.ambient = null;
      (motes || []).forEach((m) => this.tweens.add({ targets: m, alpha: 0, duration: 1200 }));

      const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
      this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });
      const title = this.add.text(640, 240, "ARRANGEMENT HALTED", { font: "bold 36px Georgia", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
      this.tweens.add({ targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut", onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }) });
      this.add.text(640, 310, `Score: ${this.score}`, { font: "21px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
      this.add.text(640, 350, `Rounds Completed: ${this.currentRound} / 12`, { font: "18px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);
      this._makeButton(525, 420, "RESTART THE ENGINE", 200, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
      this._makeButton(755, 420, "RETURN TO MENU", 200, 50, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.start("MenuScene"));
    })();
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearRound();
    this.hideBubble();

    try { GameManager.completeLevel(64, Math.round((this.correctFirstTry / 12) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("arrays_sort_schema"); } catch (_) {}
    try {
      localStorage.setItem("level65_results", JSON.stringify({
        level: 65, concept: "arrays_sort", phase: "accretion",
        score: this.score, accuracy: this.correctFirstTry / 12, avgTime: this.totalTime / 12,
        comboMax: this.maxCombo, stars: this._starRating(), livesRemaining: this.lives,
        attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.sortingRoomFinale().then(() => { if (this._alive) this.showScoreTally(); });
  }

  async sortingRoomFinale() {
    await this.populateTray([8, 7, 6, 5, 4, 3, 2, 1], "int[]");
    const before = [8, 7, 6, 5, 4, 3, 2, 1], after = [1, 2, 3, 4, 5, 6, 7, 8];
    await this.activateEngine();
    this._metronomeActive = true;
    const working = before.slice();
    const n = working.length;
    let tick = 0;
    for (let i = 0; i < n; i++) {
      if (working[i] === after[i]) continue;
      let j = -1;
      for (let k = i + 1; k < n; k++) { if (working[k] === after[i]) { j = k; break; } }
      if (j === -1) continue;
      await this.animateSwap(i, j);
      const tmp = working[i]; working[i] = working[j]; working[j] = tmp;
      tick++;
    }
    this._metronomeActive = false;
    await this.settlingGlow();
    this.showVoidAnnotation();
    this.showBeforeAfter(before, after);
    this.deactivateEngine();

    if (this._chartGlow) {
      this._chartGlow.forEach((g, i) => {
        this.time.delayedCall(i * 150, () => { if (g.active) this.tweens.add({ targets: g, alpha: 0.06, duration: 400, yoyo: true, repeat: 1 }); });
      });
    }
    this.tweens.add({ targets: this._metronomeContainer, angle: 8, duration: 120, yoyo: true, repeat: 5 });
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

    const title = this.add.text(640, 190, "COLLECTION ARRANGED", { font: "bold 30px Georgia", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(91).setScale(0);
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
    bg.strokeRoundedRect(-14, -4, 28, 12, 2);
    bg.lineStyle(2, C_GREEN_BRIGHT, 1);
    bg.lineBetween(0, -4, 0, -14);
    bg.lineBetween(-3, -11, 0, -14);
    bg.lineBetween(3, -11, 0, -14);
    badge.add(bg);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 1950 });
    const badgeLbl = this.add.text(640, 505, "sort() SCHEMA ACQUIRED", { font: "bold 14px Georgia", color: HEX_GOLD }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: badgeLbl, alpha: 1, duration: 300, delay: 2100 });

    this._makeButton(500, 545, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(770, 545, "NEXT: The Classification Trials →", 300, 44, { fill: 0x00733a, stroke: C_GREEN_BRIGHT, textColor: "#ffffff" }, () => {
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
