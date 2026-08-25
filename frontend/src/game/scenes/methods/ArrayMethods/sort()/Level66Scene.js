/**
 * Level 66 — "The Classification Trials" (Arrays Methods: Tuning Phase —
 * Arrays.sort())
 * ===========================================================================
 * Tunes the Level 65 sort() schema through rapid-fire fluency trials. A
 * creeping green patina spreading inward from the specimen tray's corners
 * IS the timer — one linear tween drives the blobs' radii/alpha; timeout
 * fires from the tween's onComplete when the tarnish fully covers the
 * brass. No parallel clock.
 *
 * New fluency material:
 *  - LEXICOGRAPHIC ORDERING drilled to reflex: uppercase (65-90) sorts
 *    BEFORE lowercase (97-122) in Unicode, and numeric STRINGS sort by
 *    character code, not by value ("10" < "9" because '1' < '9').
 *  - THE MUTATION CONSEQUENCE AT SPEED: multi-statement traces where a
 *    value captured BEFORE sort stays frozen while every bracket read
 *    AFTER sort sees the new arrangement.
 * The evaluator reuses L65's honest sort (genuine in-place mutation,
 * void return, numeric vs. natural-Unicode comparators) extended with
 * pre/post-sort variable snapshots and multi-statement trace execution.
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
const C_PATINA = 0x2e7d32, HEX_PATINA = "#2e7d32";
const HEX_GREEN_MUTED_66 = "#5d7a5d";

// Classification card
const CARD_X0 = 250, CARD_X1 = 720, CARD_Y0 = 100, CARD_Y1 = 420;
const CARD_CX = (CARD_X0 + CARD_X1) / 2;
// Specimen tray (compact horizontal, timer surface — beneath the card)
const TRAY_X0 = 250, TRAY_X1 = 720, TRAY_Y0 = 440, TRAY_Y1 = 540;
// Mini reveal apparatus (tray + engine)
const MINI_X0 = 770, MINI_X1 = 1210, MINI_CX = (MINI_X0 + MINI_X1) / 2;
const MINI_GANTRY_Y = 112, MINI_GANTRY_H = 7;
const MINI_TRAY_Y0 = 155, MINI_TRAY_Y1 = 225;
const MINI_ENTRY_Y = MINI_TRAY_Y0 + 6;
const MINI_PLAQUE_X = 770, MINI_PLAQUE_Y = 290, MINI_PLAQUE_W = 440, MINI_PLAQUE_H = 36;
const MINI_STRIP_Y = MINI_PLAQUE_Y + MINI_PLAQUE_H + 6;
// Classification slate
const SLATE_X = 760, SLATE_Y = 345, SLATE_W = 460, SLATE_H = 120;

const TUTORIAL_KEY = "level66_tutorial_done";
const WAVE_TIME = { 1: 12000, 2: 10000, 3: 9000 };

// ══════════════════════════════════════════════════════════════
// ROUND CONFIGURATION
// ══════════════════════════════════════════════════════════════
const ROUNDS = [
  // ══ WAVE 1 — Rapid Arrangements (12s) ══
  { round: 1, wave: 1, type: "predict",
    source: "int[] a = {8, 2, 5, 1};\nArrays.sort(a);\nSystem.out.println(Arrays.toString(a));",
    question: "What prints?", correct: "[1, 2, 5, 8]",
    options: [
      { value: "[1, 2, 5, 8]", tag: null },
      { value: "[8, 5, 2, 1]", tag: "sort_descending_belief" },
      { value: "[8, 2, 5, 1]", tag: "sort_preserves_original_belief" },
      { value: "[I@...", tag: "array_prints_contents_belief" },
    ],
    concept: "fluent_sort" },

  { round: 2, wave: 1, type: "predict",
    source: "int[] a = {4, 4, 4};\nArrays.sort(a);\nSystem.out.println(Arrays.toString(a));",
    question: "What prints?", correct: "[4, 4, 4]",
    options: [
      { value: "[4, 4, 4]", tag: null },
      { value: "[4]", tag: "sort_removes_duplicates_belief" },
      { value: "error", tag: "sort_identical_error_belief", label: "Runtime error" },
      { value: "[]", tag: "sort_empties_belief" },
    ],
    concept: "fluent_all_identical" },

  { round: 3, wave: 1, type: "predict",
    source: "int[] a = {3, 1, 4};\nArrays.sort(a);\nSystem.out.println(a[2]);",
    question: "What prints?", correct: "4",
    options: [
      { value: "4", tag: null },
      { value: "3", tag: "sort_preserves_original_belief" },
      { value: "1", tag: "sort_reverses_index_belief" },
      { value: "[1, 3, 4]", tag: "bracket_prints_whole_belief" },
    ],
    revealNote: "After sort: [1, 3, 4]. Index 2 holds 4 — the largest, sitting at the end. Every bracket read after sort sees the new arrangement.",
    concept: "fluent_bracket_after_sort" },

  { round: 4, wave: 1, type: "predict",
    source: "int[] a = {6, 2, 9};\nint[] b = Arrays.sort(a);",
    question: "What happens?", correct: "compile_error",
    options: [
      { value: "compile_error", tag: null, label: "COMPILE ERROR — void cannot convert to int[]" },
      { value: "b_sorted", tag: "sort_returns_new_array_belief", label: "b = [2, 6, 9]" },
      { value: "b_same", tag: "sort_returns_sorted_belief", label: "b = a (same reference)" },
      { value: "both_sorted", tag: "sort_copies_and_sorts_belief", label: "Both sorted" },
    ],
    concept: "fluent_void_reflex" },

  { round: 5, wave: 1, type: "predict",
    source: "int[] a = {5, 1, 3};\na.sort();",
    question: "What happens?", correct: "compile_error",
    options: [
      { value: "compile_error", tag: null, label: "COMPILE ERROR — arrays have no .sort()" },
      { value: "a_sorted", tag: "arrays_instance_call_belief", label: "a is sorted" },
      { value: "runtime_error", tag: "runtime_vs_compile_confusion", label: "Runtime exception" },
      { value: "void", tag: "instance_sort_void_belief", label: "void — sorted in place" },
    ],
    concept: "fluent_static_probe" },

  // ══ WAVE 2 — The Lexicographic Gallery (10s) ══
  { round: 6, wave: 2, type: "predict",
    source: 'String[] s = {"cherry", "apple", "banana"};\nArrays.sort(s);\nSystem.out.println(Arrays.toString(s));',
    question: "What prints?", correct: "[apple, banana, cherry]",
    options: [
      { value: "[apple, banana, cherry]", tag: null },
      { value: "[cherry, banana, apple]", tag: "sort_descending_belief" },
      { value: "[apple, cherry, banana]", tag: "sort_by_length_belief" },
      { value: "[cherry, apple, banana]", tag: "sort_preserves_original_belief" },
    ],
    concept: "fluent_string_sort" },

  { round: 7, wave: 2, type: "predict",
    source: 'String[] s = {"banana", "Apple", "cherry"};\nArrays.sort(s);\nSystem.out.println(Arrays.toString(s));',
    question: "What prints?", correct: "[Apple, banana, cherry]",
    options: [
      { value: "[Apple, banana, cherry]", tag: null },
      { value: "[apple, banana, cherry]", tag: "sort_lowercases_belief" },
      { value: "[apple, Apple, banana, cherry]", tag: "sort_adds_lowercase_belief" },
      { value: "[banana, cherry, Apple]", tag: "uppercase_last_belief" },
    ],
    revealNote: "Uppercase first: 'A' is 65, 'b' is 98 — Apple sorts before banana in Unicode. The engine reads character codes, not human intuition. Every uppercase letter beats every lowercase letter.",
    concept: "fluent_case_sensitivity" },

  { round: 8, wave: 2, type: "predict",
    source: 'String[] s = {"Zebra", "ant", "Bear"};\nArrays.sort(s);\nSystem.out.println(Arrays.toString(s));',
    question: "What prints?", correct: "[Bear, Zebra, ant]",
    options: [
      { value: "[Bear, Zebra, ant]", tag: null },
      { value: "[ant, Bear, Zebra]", tag: "uppercase_before_lowercase_surprise" },
      { value: "[ant, bear, zebra]", tag: "sort_lowercases_belief" },
      { value: "[Bear, ant, Zebra]", tag: "sort_by_length_belief" },
    ],
    revealNote: "B (66), Z (90), a (97) — ALL uppercase codes sit below ALL lowercase codes. Bear < Zebra < ant in Unicode. The 'ant' that looks smallest alphabetically sorts LAST. Character codes are the truth.",
    concept: "fluent_uppercase_block" },

  { round: 9, wave: 2, type: "predict",
    source: 'String[] nums = {"9", "10", "2", "100"};\nArrays.sort(nums);\nSystem.out.println(Arrays.toString(nums));',
    question: "What prints?", correct: "[10, 100, 2, 9]",
    options: [
      { value: "[10, 100, 2, 9]", tag: null },
      { value: "[2, 9, 10, 100]", tag: "lexicographic_numeric_trap" },
      { value: "[100, 10, 9, 2]", tag: "sort_descending_belief" },
      { value: "[9, 10, 2, 100]", tag: "sort_preserves_original_belief" },
    ],
    revealNote: "THE TRAP: these are STRINGS, not ints! Lexicographic: '1' (49) < '2' (50) < '9' (57). '10' starts with '1' (49), which beats '2' (50). '100' starts with '1' too. So: 10, 100, 2, 9. Numeric order would be 2, 9, 10, 100 — but String sort reads characters, not math.",
    concept: "fluent_numeric_string_trap" },

  { round: 10, wave: 2, type: "predict",
    source: 'String[] s = {"", "a", "A"};\nArrays.sort(s);\nSystem.out.println(Arrays.toString(s));',
    question: "What prints?", correct: "[, A, a]",
    options: [
      { value: "[, A, a]", tag: null },
      { value: "[A, a, ]", tag: "empty_last_belief" },
      { value: "error", tag: "empty_string_error_belief", label: "Runtime error" },
      { value: "[a, A, ]", tag: "lowercase_first_belief" },
    ],
    revealNote: "The empty string sorts FIRST — it's shorter than everything, and lexicographic comparison finds no character to beat. Then 'A' (65) before 'a' (97). Empty < uppercase < lowercase.",
    concept: "fluent_empty_string_sort" },

  // ══ WAVE 3 — Deep Traces & Bug Hunt ══
  { round: 11, wave: 3, type: "trace",
    source: 'int[] a = {5, 3, 8, 1};\nint first = a[0];\nArrays.sort(a);\nSystem.out.println(first + " vs " + a[0]);',
    question: "What prints?", correct: "5 vs 1",
    options: [
      { value: "5 vs 1", tag: null },
      { value: "5 vs 5", tag: "mutation_blind_read" },
      { value: "1 vs 1", tag: "first_reads_sorted_belief" },
      { value: "1 vs 5", tag: "sort_reverses_belief" },
    ],
    revealNote: "first captured 5 BEFORE sort — a snapshot. a[0] AFTER sort reads 1 — the new tenant. Two moments, two values: the int was frozen, the array was mutated.",
    concept: "trace_snapshot_vs_mutation" },

  { round: 12, wave: 3, type: "trace",
    source: 'int[] a = {7, 2, 9, 4};\nArrays.sort(a);\nint range = a[a.length - 1] - a[0];\nSystem.out.println("Range: " + range);',
    question: "What prints?", correct: "Range: 7",
    options: [
      { value: "Range: 7", tag: null },
      { value: "Range: 5", tag: "sort_preserves_original_belief" },
      { value: "Range: -7", tag: "sort_descending_belief" },
      { value: "error", tag: "length_minus_one_error_belief", label: "ArrayIndexOutOfBoundsException" },
    ],
    revealNote: "Sort → [2, 4, 7, 9]; a[3] - a[0] = 9 - 2 = 7. The RANGE pattern: sort, then subtract the endpoints. Sort made the extremes easy to find.",
    concept: "trace_range_pattern" },

  { round: 13, wave: 3, type: "trace",
    source: 'String[] w = {"Dog", "cat", "Bird"};\nArrays.sort(w);\nSystem.out.println(w[0] + " & " + w[2]);',
    question: "What prints?", correct: "Bird & cat",
    options: [
      { value: "Bird & cat", tag: null },
      { value: "Dog & Bird", tag: "sort_preserves_original_belief" },
      { value: "Bird & Dog", tag: "uppercase_before_lowercase_surprise" },
      { value: "cat & Bird", tag: "sort_descending_belief" },
    ],
    revealNote: "Sorted: [Bird, Dog, cat] — B(66) < D(68) < c(99). Index 0 = Bird, index 2 = cat. Uppercase block first, then lowercase.",
    concept: "trace_mixed_case_bracket" },

  { round: 14, wave: 3, type: "bughunt",
    lines: ["int[] scores = {88, 45, 92, 71};", "int[] ranked = Arrays.sort(scores);", "System.out.println(Arrays.toString(ranked));", "// intent: create a sorted copy"],
    faultToken: "int[] ranked = Arrays.sort(scores)", faultLine: 2, tokenRegion: "void_assignment",
    fix: "Arrays.sort(scores)",
    explanation: "sort returns void — you can't catch it in a variable. The engine rearranges the original tray and hands back nothing. To create a sorted COPY, you'd copy first (Arrays.copyOf), then sort the copy — but that's L68's instrument. For now: sort the original and read it directly.",
    wrongTag: "sort_returns_new_array_belief",
    revealNote: "Dual-future reveal: the buggy run's engine hums then HALTS — the compile stamp lands: 'void cannot be converted to int[]'. Reset; the fixed run (sort directly, print scores): the engine runs, the plaque assembles [45, 71, 88, 92]. Bit: 'void is void — nothing to catch. Sort changes what you have; read what you have.'",
    concept: "void_capture_bug" },

  { round: 15, wave: 3, type: "bughunt",
    lines: ["int[] data = {30, 10, 20};", "Arrays.sort(data);", 'System.out.println("Original first: " + data[0]);', "// intent: print the ORIGINAL first element (30)"],
    faultToken: "data[0]", faultLine: 3, tokenRegion: "post_sort_read",
    fix: 'int first = data[0];', // saved BEFORE sort — line moves above the sort call, handled specially
    explanation: "The mutation-blind read: data[0] AFTER sort holds 10 (the smallest), not 30 (the original first). Sort rewrote the tray — the old order is gone. To preserve a value, capture it in a variable BEFORE sorting.",
    wrongTag: "mutation_blind_read",
    revealNote: "Dual-future reveal: the buggy run sorts the tray ([10, 20, 30]), then reads data[0] = 10 — 'Original first: 10' prints while the intent was 30. Reset; the fixed run captures first = data[0] before sort, then prints 'Original first: 30'. Bit: 'The tray has no memory of its past — save what you need before the engine touches it.'",
    concept: "mutation_blind_bug" },
];

const MISCONCEPTION_FEEDBACK = {
  sort_returns_new_array_belief: "sort returns VOID — nothing comes back. The tray itself changed; read it through the original name.",
  sort_returns_sorted_belief: "The compile stamp: void cannot be assigned. sort changes the tray and walks away — read the result through the original reference.",
  sort_descending_belief: "The engine sorts ASCENDING — smallest to largest, A to Z, always.",
  sort_preserves_original_belief: "At speed, the old order is tempting — but the tray CHANGED. Every read after sort sees the new arrangement. The mutation is real.",
  sort_removes_duplicates_belief: "sort arranges — it never removes. Identical values sit side by side.",
  sort_empties_belief: "A tray of identical specimens is already in order — the engine settles instantly. No error, no removal.",
  sort_identical_error_belief: "All-identical elements are already in order — the engine activates, finds nothing to swap, and settles. No error.",
  array_prints_contents_belief: "Without toString, println prints the hash — even after sorting. sort rearranges; toString labels. Both are needed.",
  sort_reverses_index_belief: "The sort is ascending, not reversed — trace the sorted order from index 0 forward.",
  bracket_prints_whole_belief: "A single bracket access reads ONE compartment, not the whole tray.",
  sort_copies_and_sorts_belief: "sort modifies the ORIGINAL — there is no copy. Both names would point to the same tray, now sorted (but here, the assignment itself is illegal).",
  arrays_instance_call_belief: "Arrays have no built-in sort or toString method — the engine lives in the Arrays class. Arrays.sort(arr), not arr.sort().",
  instance_sort_void_belief: "arr.sort() isn't legal Java at all — arrays have no sort method to return anything, void or otherwise. It's a COMPILE ERROR, not a silent no-op.",
  runtime_vs_compile_confusion: "Forbidden calls and type mismatches die at COMPILE time — before anything runs.",
  sort_by_length_belief: "Lexicographic compares character by character, left to right — not by length.",
  uppercase_last_belief: "Uppercase sorts FIRST, not last — lower code points come first. B < Z < a in the character table.",
  sort_lowercases_belief: "sort never changes the strings — it arranges them. 'Apple' keeps its capital A; it just moves to the front.",
  sort_adds_lowercase_belief: "sort never adds or modifies strings — it only rearranges them within the tray.",
  uppercase_before_lowercase_surprise: "Unicode: uppercase letters (65-90) sit BELOW lowercase (97-122). ALL uppercase sorts before ALL lowercase. 'Z' (90) < 'a' (97) — Zebra before ant.",
  lexicographic_numeric_trap: "These are STRINGS — the engine reads character codes, not math. '1' (49) < '2' (50) < '9' (57). '10' starts with '1', which beats '2'. For numeric sorting, use int[], not String[].",
  empty_last_belief: "The empty string is shorter than everything — lexicographic comparison finds nothing to compete with. It sorts FIRST, not last.",
  empty_string_error_belief: "The empty string is a completely legal specimen — no crash. It just sorts first, being shorter than everything else.",
  lowercase_first_belief: "'a' (97) comes AFTER 'A' (65) in Unicode. Lowercase sorts after uppercase.",
  mutation_blind_read: "data[0] AFTER sort holds the SMALLEST, not the original first. Sort rewrote the tray — capture values in variables BEFORE sorting if you need them later.",
  first_reads_sorted_belief: "first was captured BEFORE sort — it's a frozen int, not a live view. The tray mutated; the snapshot didn't.",
  sort_reverses_belief: "The sort is ascending — a[0] is the smallest after sort, not the largest.",
  length_minus_one_error_belief: "arr.length - 1 is exactly the last valid index — no crash.",
  timeout: "The patina claimed the brass! Classify before the verdigris spreads — sort verdicts are reflexes now.",
};

export class Level66Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level66Scene" });
  }

  init() {
    this.currentRound = 0;
    this.currentWave = 1;
    this.score = 0;
    this.displayScore = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.lives = 3;
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
    this._patinaHalted = true;
  }

  preload() {}

  create() {
    this._alive = true;
    this.createParticleTexture();
    this.createBackground();
    this.createWingDim();
    this.createCorkboard();
    this.createHumidifier();
    this.createPatinaReference();
    this.createTrialsBanner();
    this.createParticles();
    this.createClassificationCard();
    this.createSpecimenTray();
    this.createPatinaLayer();
    this.createMiniTrayAndEngine();
    this.createMiniPlaque();
    this.createClassificationSlate();
    this.createHUD();
    this.createBit();

    this.events.on("shutdown", () => { this._alive = false; this._killPatinaTween(); });
    this.checkTutorial();
  }

  update(time, delta) {
    this.updateParticles(time, delta);
    this.updatePatinaUrgency(time);
    this.updateHumidifierVapor(time);
    this.updatePatinaSpread();
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // SETUP — CLASSIFICATION WING DRESSING
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l66_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l66_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x081008).setDepth(0);
  }

  createWingDim() {
    const g = this.add.graphics().setDepth(1).setAlpha(0.5);
    g.fillStyle(0x1a0e05, 1);
    g.fillRect(0, 108, W, 108);
    g.lineStyle(1, 0x3a2618, 0.4);
    for (let x = 0; x < W; x += 30) g.lineBetween(x, 108, x, 216);
    g.fillStyle(0x081008, 1);
    g.fillRect(0, 0, W, 108);
  }

  createCorkboard() {
    const g = this.add.graphics().setDepth(2);
    g.fillStyle(C_BRASS, 0.25);
    g.lineStyle(2, 0x3a2618, 1);
    g.fillRect(CARD_X0 - 30, CARD_Y0 - 40, CARD_X1 - CARD_X0 + 60, 110);
    g.strokeRect(CARD_X0 - 30, CARD_Y0 - 40, CARD_X1 - CARD_X0 + 60, 110);
    for (let i = 0; i < 6; i++) {
      const nx = CARD_X0 + i * 75 + Phaser.Math.Between(-8, 8), ny = CARD_Y0 - 20 + Phaser.Math.Between(-10, 10);
      const ang = Phaser.Math.Between(-8, 8);
      const note = this.add.rectangle(nx, ny, 26, 18, 0xe0d6b8, 0.2).setAngle(ang).setDepth(2);
      const pin = this.add.circle(nx, ny - 9, 1.5, C_BRASS, 0.5).setDepth(3);
    }
  }

  createHumidifier() {
    const c = this.add.container(80, 480).setDepth(3);
    const g = this.add.graphics();
    g.fillStyle(0x1a1408, 1);
    g.lineStyle(1.5, C_BRASS, 0.8);
    g.fillRoundedRect(-16, -6, 32, 20, { tl: 3, tr: 3, bl: 2, br: 2 });
    g.strokeRoundedRect(-16, -6, 32, 20, { tl: 3, tr: 3, bl: 2, br: 2 });
    g.beginPath();
    g.arc(0, -6, 16, Math.PI, 0, false);
    g.strokePath();
    c.add(g);
    this._humidifierVapor = [];
    for (let i = 0; i < 3; i++) {
      const v = this.add.text(-8 + i * 8, -22, "~", { font: "12px Georgia", color: HEX_GREEN_MUTED_66 }).setOrigin(0.5).setAlpha(0.15);
      c.add(v);
      this._humidifierVapor.push({ obj: v, phase: i * 500 });
    }
    this._humidifierContainer = c;
  }

  updateHumidifierVapor(time) {
    if (!this._humidifierVapor) return;
    this._humidifierVapor.forEach((v) => {
      const t = (time + v.phase) % 2000;
      v.obj.y = -22 - (t / 2000) * 14;
      v.obj.setAlpha(0.2 * (1 - t / 2000));
    });
  }

  createPatinaReference() {
    const g = this.add.graphics().setDepth(3);
    const x0 = 1140, y = 100, w = 100, h = 14;
    const steps = 12;
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const color = this._lerpColor66(C_BRASS, C_PATINA, t);
      g.fillStyle(color, 0.4);
      g.fillRect(x0 + i * (w / steps), y, w / steps + 1, h);
    }
    this.add.text(x0 + w / 2, y + h + 8, "PATINA SCALE", { font: "bold 9px Georgia", color: HEX_BLUE_GRAY }).setOrigin(0.5).setAlpha(0.5).setDepth(3);
    this._patinaRefMarker = this.add.rectangle(x0, y + h / 2, 3, h + 4, 0xffffff, 0.8).setDepth(4);
  }

  _lerpColor66(c1, c2, t) {
    const r1 = (c1 >> 16) & 0xff, g1 = (c1 >> 8) & 0xff, b1 = c1 & 0xff;
    const r2 = (c2 >> 16) & 0xff, g2 = (c2 >> 8) & 0xff, b2 = c2 & 0xff;
    const r = Math.round(r1 + (r2 - r1) * t), g = Math.round(g1 + (g2 - g1) * t), b = Math.round(b1 + (b2 - b1) * t);
    return (r << 16) | (g << 8) | b;
  }

  createTrialsBanner() {
    const g = this.add.graphics().setDepth(2);
    g.fillStyle(0x081008, 1);
    g.lineStyle(1, C_BRASS, 0.5);
    g.fillRoundedRect(400, 12, 380, 26, 3);
    g.strokeRoundedRect(400, 12, 380, 26, 3);
    this.add.text(590, 25, "T H E   C L A S S I F I C A T I O N   T R I A L S", { font: "bold 13px Georgia", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.7).setDepth(3);
  }

  createParticles() {
    this.ambient = [];
    const colors = [0x5d7a5d, 0xc8a05a, 0x2e7d32];
    for (let i = 0; i < 6; i++) {
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
    const p = this.add.particles(x, y, "l66_dot", {
      speed: { min: 80, max: 240 }, angle: { min: 0, max: 360 }, scale: { start: 0.9, end: 0 }, lifespan: 500,
      tint: [C_BRASS, C_GREEN_BRIGHT, 0x2e7d32, 0xffffff], emitting: false,
    }).setDepth(85);
    p.explode(count);
    this.time.delayedCall(900, () => p.destroy());
  }

  screenShake(intensity = 0.004, duration = 150) {
    this.cameras.main.shake(duration, intensity);
  }

  // ══════════════════════════════════════════════════════════════
  // THE CLASSIFICATION CARD
  // ══════════════════════════════════════════════════════════════

  createClassificationCard() {
    const g = this.add.graphics().setDepth(20);
    g.fillStyle(0xe0d6b8, 1);
    g.lineStyle(2, 0x8a6435, 1);
    g.fillRoundedRect(CARD_X0, CARD_Y0, CARD_X1 - CARD_X0, CARD_Y1 - CARD_Y0, 4);
    g.strokeRoundedRect(CARD_X0, CARD_Y0, CARD_X1 - CARD_X0, CARD_Y1 - CARD_Y0, 4);
    g.fillStyle(0x8a6435, 0.15);
    g.fillRect(CARD_X0, CARD_Y0, CARD_X1 - CARD_X0, 22);
    g.lineStyle(1, 0x8a6435, 0.15);
    for (let y = CARD_Y0 + 46; y < CARD_Y1 - 40; y += 18) g.lineBetween(CARD_X0 + 14, y, CARD_X1 - 14, y);
    [CARD_X0 + 26, CARD_X1 - 26].forEach((cx) => {
      g.fillStyle(C_BRASS, 1);
      g.fillCircle(cx, CARD_Y0 - 4, 4);
      g.lineStyle(1.5, 0x8a6435, 1);
      g.lineBetween(cx, CARD_Y0 - 4, cx, CARD_Y0 + 4);
    });

    this.add.text(CARD_CX, CARD_Y0 + 11, "CLASSIFICATION FORM — SPECIMEN SERIES", { font: "bold 10px Georgia", color: "#8a6435" }).setOrigin(0.5).setDepth(21);
    this.cardRoundLabel = this.add.text(CARD_X1 - 12, CARD_Y0 + 11, "CLASS. 1/15", { font: "bold 11px Courier New", color: "#8a6435" }).setOrigin(1, 0.5).setDepth(21);
    this.cardContentContainer = this.add.container(0, 0).setDepth(21);
    this.cardQuestionText = this.add.text(CARD_CX, CARD_Y1 - 24, "", { font: "bold 14px Georgia", color: "#241a0e", wordWrap: { width: CARD_X1 - CARD_X0 - 36 }, align: "center" }).setOrigin(0.5).setDepth(21);
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
    const fontSize = maxLen > 40 ? 10 : maxLen > 28 ? 12 : 13;
    const lineH = fontSize + 10;
    const startY = CARD_Y0 + 56 + Math.max(0, 4 - lines.length) * (lineH / 2);
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
    const re = /("(?:[^"\\]|\\.)*")|(\bint\b|\bString\b|\bnew\b)|(\bArrays\b)|(\.sort\b|\.toString\b|\.length\b)|(-?\d+\.\d+|-?\d+)|([(){}\[\];.,=+])/g;
    let last = 0, m;
    const plain = (t) => t && tokens.push({ t, c: "#241a0e" });
    while ((m = re.exec(line))) {
      if (m.index > last) plain(line.slice(last, m.index));
      if (m[1]) tokens.push({ t: m[1], c: "#2e7d32" });
      else if (m[2]) tokens.push({ t: m[2], c: "#1565c0" });
      else if (m[3]) tokens.push({ t: m[3], c: "#b8860b" });
      else if (m[4]) tokens.push({ t: m[4], c: "#e65100" });
      else if (m[5]) tokens.push({ t: m[5], c: "#e65100" });
      else if (m[6]) tokens.push({ t: m[6], c: /[()]/.test(m[6]) ? "#c62828" : "#78909c" });
      last = m.index + m[0].length;
    }
    if (last < line.length) plain(line.slice(last));
    return tokens.length ? tokens : [{ t: line, c: "#241a0e" }];
  }

  async stampCard(kind) {
    const labels = { classified: "CLASSIFIED", misclassified: "MISCLASSIFIED", oxidized: "OXIDIZED" };
    const colors = { classified: HEX_GREEN_BRIGHT, misclassified: HEX_RED, oxidized: HEX_PATINA };
    const stamp = this.add.text(0, 0, labels[kind], { font: "bold 21px Georgia", color: colors[kind] }).setOrigin(0.5).setScale(1.4).setAngle(-8).setAlpha(0);
    this.cardStampLayer.add(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 180 });
    const hold = kind === "oxidized" ? 1800 : 700;
    await this.delay(hold);
    if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 200, onComplete: () => stamp.destroy() });
  }

  // ══════════════════════════════════════════════════════════════
  // THE SPECIMEN TRAY (compact timer surface)
  // ══════════════════════════════════════════════════════════════

  createSpecimenTray() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0d0a06, 0.8);
    g.lineStyle(3, C_BRASS, 1);
    g.fillRoundedRect(TRAY_X0, TRAY_Y0, TRAY_X1 - TRAY_X0, TRAY_Y1 - TRAY_Y0, 6);
    g.strokeRoundedRect(TRAY_X0, TRAY_Y0, TRAY_X1 - TRAY_X0, TRAY_Y1 - TRAY_Y0, 6);
    this.trayFrameGfx = g;
    this.add.text(TRAY_X0 + 10, TRAY_Y0 - 14, "SPECIMEN TRAY", { font: "bold 10px Georgia", color: HEX_BRASS }).setDepth(11).setAlpha(0.7);
  }

  // ══════════════════════════════════════════════════════════════
  // THE CREEPING PATINA (THE TIMER — hero mechanic)
  // ══════════════════════════════════════════════════════════════

  createPatinaLayer() {
    this.patinaGfx = this.add.graphics().setDepth(13);
    this.patinaBlobs = [];
    const corners = [
      { cx: TRAY_X0 + 15, cy: TRAY_Y0 + 15 },
      { cx: TRAY_X1 - 15, cy: TRAY_Y0 + 15 },
      { cx: TRAY_X0 + 15, cy: TRAY_Y1 - 15 },
      { cx: TRAY_X1 - 15, cy: TRAY_Y1 - 15 },
    ];
    corners.forEach((corner) => {
      for (let i = 0; i < 6; i++) {
        this.patinaBlobs.push({
          baseX: corner.cx + Phaser.Math.Between(-18, 18),
          baseY: corner.cy + Phaser.Math.Between(-14, 14),
          maxRadius: Phaser.Math.Between(30, 48),
          rateMul: Phaser.Math.FloatBetween(0.85, 1.15),
        });
      }
    });
    this._patinaAlphaMul = 1;
  }

  updatePatinaSpread() {
    if (!this.patinaGfx) return;
    this.patinaGfx.clear();
    const progress = this._patinaProgress || 0;
    if (progress <= 0) return;
    const mul = this._patinaAlphaMul !== undefined ? this._patinaAlphaMul : 1;
    this.patinaBlobs.forEach((b) => {
      const localProgress = Math.min(1, progress * b.rateMul);
      if (localProgress <= 0) return;
      const r = localProgress * b.maxRadius;
      const alpha = localProgress * 0.85 * mul;
      this.patinaGfx.fillStyle(C_PATINA, alpha);
      this.patinaGfx.fillCircle(b.baseX, b.baseY, r);
    });
    if (this._patinaRefMarker) this._patinaRefMarker.x = 1140 + progress * 100;
  }

  updatePatinaUrgency(time) {
    if (this._patinaProgress === undefined) return;
    const rem = 1 - this._patinaProgress;
    const state = rem <= 0.15 ? "critical" : rem <= 0.33 ? "warning" : "safe";
    if (state === this._warnState) return;
    this._warnState = state;
    if (state === "critical") this._startCriticalPulse();
    else this._stopCriticalPulse();
  }

  _startCriticalPulse() {
    if (this._patinaPulseTween) return;
    this._patinaAlphaObj = { v: 1 };
    this._patinaPulseTween = this.tweens.add({
      targets: this._patinaAlphaObj, v: 0.82, duration: 400, yoyo: true, repeat: -1,
      onUpdate: () => { this._patinaAlphaMul = this._patinaAlphaObj.v; },
    });
  }

  _stopCriticalPulse() {
    if (this._patinaPulseTween) { this._patinaPulseTween.stop(); this._patinaPulseTween = null; }
    this._patinaAlphaMul = 1;
  }

  startPatinaSpread(timeLimitMs) {
    this._killPatinaTween();
    this.roundTimeLimit = timeLimitMs;
    this._patinaProgress = 0;
    this._patinaHalted = false;
    this._warnState = "safe";
    this._patinaAlphaMul = 1;
    if (this._patinaRefMarker) this._patinaRefMarker.x = 1140;
    const state = { v: 0 };
    this._patinaTween = this.tweens.add({
      targets: state, v: 1, duration: timeLimitMs, ease: "Linear",
      onUpdate: () => { this._patinaProgress = state.v; },
      onComplete: () => { if (this._alive && !this._patinaHalted) this.onPatinaTimeout(this._currentConfig); },
    });
  }

  _killPatinaTween() {
    if (this._patinaTween) { this._patinaTween.stop(); this._patinaTween = null; }
    this._stopCriticalPulse();
  }

  async fullTarnish() {
    this._patinaHalted = true;
    this._killPatinaTween();
    this.screenShake(0.004, 150);
    this.patinaGfx.clear();
    this.patinaGfx.fillStyle(C_PATINA, 0.9);
    this.patinaGfx.fillRoundedRect(TRAY_X0, TRAY_Y0, TRAY_X1 - TRAY_X0, TRAY_Y1 - TRAY_Y0, 6);
    await this.delay(200);
    await this.stampCard("oxidized");
  }

  polishSpray() {
    this._patinaHalted = true;
    this._killPatinaTween();
    const midX = (TRAY_X0 + TRAY_X1) / 2, midY = (TRAY_Y0 + TRAY_Y1) / 2;
    for (let i = 0; i < 9; i++) {
      const spark = this.add.circle(80 + Phaser.Math.Between(-8, 8), 480 + Phaser.Math.Between(-8, 8), 2, C_GOLD, 0.8).setDepth(15);
      const tx = midX + Phaser.Math.Between(-120, 120), ty = midY + Phaser.Math.Between(-30, 30);
      this.tweens.add({ targets: spark, x: tx, y: ty, alpha: 0, duration: 220 + Math.random() * 100, onComplete: () => spark.destroy() });
    }
  }

  async recedePatina() {
    const startProgress = this._patinaProgress || 0;
    const obj = { v: startProgress };
    await new Promise((res) => {
      this.tweens.add({ targets: obj, v: 0, duration: 400, onUpdate: () => { this._patinaProgress = obj.v; }, onComplete: res });
    });
  }

  async onPatinaTimeout(config) {
    if (this.gameEnded) return;
    this.inputLocked = true;
    this.roundElements.forEach((e) => e.disableInteractive && e.disableInteractive());
    (this._bugHuntTokenObjs || []).forEach((t) => t.disableInteractive());
    this.logAttempt(config, false, null, "timeout", this.roundTimeLimit, 1);
    await this.fullTarnish();
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
  // MINI TRAY + MINI ARRANGEMENT ENGINE (50%-scale L65 reveal, 1.4x tempo)
  // ══════════════════════════════════════════════════════════════

  createMiniTrayAndEngine() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0d0a06, 0.8);
    g.lineStyle(2, C_BRASS, 1);
    g.fillRoundedRect(MINI_X0, MINI_TRAY_Y0, MINI_X1 - MINI_X0, MINI_TRAY_Y1 - MINI_TRAY_Y0, 5);
    g.strokeRoundedRect(MINI_X0, MINI_TRAY_Y0, MINI_X1 - MINI_X0, MINI_TRAY_Y1 - MINI_TRAY_Y0, 5);
    this.miniTrayTypeBadge = this.add.text(MINI_X1 - 8, MINI_TRAY_Y0 - 12, "int[]", { font: "bold 10px Courier New", color: HEX_BLUE_GRAY }).setOrigin(1, 0).setDepth(11);

    this.miniCompartmentLayer = this.add.container(0, 0).setDepth(11);
    this.miniSpecimenLayer = this.add.container(0, 0).setDepth(12);
    this._miniCompartments = [];

    // gantry
    g.fillStyle(0x1a1408, 1);
    g.lineStyle(1.5, C_BRASS, 1);
    g.fillRoundedRect(MINI_X0, MINI_GANTRY_Y, MINI_X1 - MINI_X0, MINI_GANTRY_H, 3);
    g.strokeRoundedRect(MINI_X0, MINI_GANTRY_Y, MINI_X1 - MINI_X0, MINI_GANTRY_H, 3);

    const plateW = 84, plateH = 16;
    const plateX = MINI_CX - plateW / 2, plateY = MINI_GANTRY_Y - plateH - 4;
    const pg = this.add.graphics().setDepth(11);
    pg.fillStyle(0x0a1208, 1);
    pg.lineStyle(1.5, C_GOLD, 1);
    pg.fillRoundedRect(plateX, plateY, plateW, plateH, 3);
    pg.strokeRoundedRect(plateX, plateY, plateW, plateH, 3);
    this.add.text(plateX + plateW / 2, plateY + 5, "Arrays.sort", { font: "bold 10px Courier New", color: HEX_GOLD }).setOrigin(0.5).setDepth(12);

    this.miniArmContainer = this.add.container(MINI_CX, MINI_GANTRY_Y + MINI_GANTRY_H).setDepth(14);
    const armG = this.add.graphics();
    armG.lineStyle(2, C_BRASS, 1);
    armG.lineBetween(0, 0, 0, 26);
    armG.lineStyle(1.5, C_BRASS, 1);
    armG.lineBetween(-4, 26, 0, 31);
    armG.lineBetween(4, 26, 0, 31);
    this.miniArmContainer.add(armG);
    this.miniArmContainer.setVisible(false);
  }

  updateMiniTypeBadge(type) { this.miniTrayTypeBadge.setText(type || "int[]"); }

  clearMiniTray() {
    this.miniCompartmentLayer.removeAll(true);
    this.miniSpecimenLayer.removeAll(true);
    this._miniCompartments = [];
  }

  async populateMiniTray(values, type) {
    this.clearMiniTray();
    this.updateMiniTypeBadge(type);
    const n = values.length;
    const innerX0 = MINI_X0 + 6, innerX1 = MINI_X1 - 6;
    const innerW = innerX1 - innerX0;
    const cellW = n > 0 ? innerW / n : innerW;

    for (let i = 0; i < n; i++) {
      const cellX = innerX0 + i * cellW;
      if (i > 0) {
        const dg = this.add.graphics();
        dg.lineStyle(1, C_BRASS, 0.4);
        dg.lineBetween(cellX, MINI_TRAY_Y0 + 6, cellX, MINI_TRAY_Y1 - 14);
        this.miniCompartmentLayer.add(dg);
      }
      const idxPlate = this.add.text(cellX + cellW / 2, MINI_TRAY_Y1 - 8, `[${i}]`, { font: "bold 9px Courier New", color: HEX_BRASS }).setOrigin(0.5).setAlpha(i === 0 ? 0.9 : 0.6);
      this.miniCompartmentLayer.add(idxPlate);
      this._miniCompartments.push({ x: cellX, w: cellW, idxPlate });
    }

    for (let i = 0; i < n; i++) {
      const comp = this._miniCompartments[i];
      const color = type === "String[]" ? C_CYAN : C_GOLD;
      const cardW = Math.min(cellW - 8, 48), cardH = 26;
      const cx = comp.x + comp.w / 2, cy = (MINI_TRAY_Y0 + MINI_TRAY_Y1) / 2 - 4;
      const card = this.add.container(cx, cy).setAlpha(0).setScale(0.7);
      const cg = this.add.graphics();
      cg.fillStyle(color, 0.9);
      cg.lineStyle(1, Phaser.Display.Color.IntegerToColor(color).darken(30).color, 1);
      cg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 4);
      cg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 4);
      const display = String(values[i]);
      const txt = this.add.text(0, 0, display, { font: "bold 11px Courier New", color: "#0a1208" }).setOrigin(0.5);
      if (txt.width > cardW - 6) txt.setFontSize(7);
      card.add([cg, txt]);
      this.miniSpecimenLayer.add(card);
      comp.card = card; comp.cardGfx = cg; comp.cardText = txt; comp.cardColor = color; comp.cardW = cardW; comp.value = values[i];
      this.tweens.add({ targets: card, alpha: 1, scale: 1, duration: 110, delay: i * 60, ease: "Back.easeOut" });
      await this.delay(45);
    }
    await this.delay(70);
  }

  async highlightMiniCompartment(index) {
    const comp = this._miniCompartments[index];
    if (!comp) return;
    this.tweens.add({ targets: comp.idxPlate, alpha: 1, scale: 1.3, duration: 90, yoyo: true });
    await this.delay(120);
  }

  async activateEngine() {
    this.miniArmContainer.setPosition(MINI_CX, MINI_GANTRY_Y + MINI_GANTRY_H).setVisible(true).setAlpha(0);
    await new Promise((res) => { this.tweens.add({ targets: this.miniArmContainer, alpha: 1, duration: 90, onComplete: res }); });
  }

  deactivateEngine() {
    this.tweens.add({ targets: this.miniArmContainer, alpha: 0, duration: 120, onComplete: () => { if (this.miniArmContainer.active) this.miniArmContainer.setVisible(false); } });
  }

  async haltEngine() {
    await this.activateEngine();
    await this.delay(120);
    this.tweens.add({ targets: this.miniArmContainer, alpha: 0.3, duration: 100 });
    this.showCompileErrorStamp();
    await this.delay(380);
    this.deactivateEngine();
  }

  async moveArmTo(x) {
    await new Promise((res) => { this.tweens.add({ targets: this.miniArmContainer, x, duration: 110, ease: "Sine.easeInOut", onComplete: res }); });
  }

  async armDescend() {
    await new Promise((res) => { this.tweens.add({ targets: this.miniArmContainer, y: MINI_ENTRY_Y, duration: 80, ease: "Sine.easeOut", onComplete: res }); });
  }

  async armAscend() {
    await new Promise((res) => { this.tweens.add({ targets: this.miniArmContainer, y: MINI_GANTRY_Y + MINI_GANTRY_H, duration: 80, ease: "Sine.easeIn", onComplete: res }); });
  }

  async animateSwap(indexA, indexB) {
    const compA = this._miniCompartments[indexA], compB = this._miniCompartments[indexB];
    if (!compA || !compB || !compA.card || !compB.card) return;
    const midX = (compA.x + compA.w / 2 + compB.x + compB.w / 2) / 2;
    await this.moveArmTo(midX);
    await this.armDescend();
    const cardA = compA.card, cardB = compB.card;
    const posA = { x: cardA.x, y: cardA.y }, posB = { x: cardB.x, y: cardB.y };
    await new Promise((res) => {
      this.tweens.add({ targets: cardA, y: posA.y - 14, duration: 65 });
      this.tweens.add({ targets: cardB, y: posB.y - 14, duration: 65, onComplete: res });
    });
    await new Promise((res) => {
      this.tweens.add({ targets: cardA, x: posB.x, duration: 150, ease: "Sine.easeInOut" });
      this.tweens.add({ targets: cardB, x: posA.x, duration: 150, ease: "Sine.easeInOut", onComplete: res });
    });
    await new Promise((res) => {
      this.tweens.add({ targets: cardA, y: posA.y, duration: 65 });
      this.tweens.add({ targets: cardB, y: posB.y, duration: 65, onComplete: res });
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
    const cards = this._miniCompartments.map((c) => c.card).filter(Boolean);
    cards.forEach((card) => {
      const flash = this.add.rectangle(card.x, card.y, 40, 30, C_GREEN_BRIGHT, 0.25).setDepth(13);
      this.tweens.add({ targets: flash, alpha: 0, duration: 250, onComplete: () => flash.destroy() });
    });
    await this.delay(180);
  }

  showVoidAnnotation() {
    const t = this.add.text(MINI_PLAQUE_X + MINI_PLAQUE_W / 2, MINI_PLAQUE_Y - 12, "void", { font: "bold 13px Courier New", color: HEX_GRAY }).setOrigin(0.5).setDepth(20).setAlpha(0);
    this.roundElements.push(t);
    this.tweens.add({ targets: t, alpha: 1, duration: 120 });
    this.time.delayedCall(500, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 150, onComplete: () => t.destroy() }); });
  }

  async runSortAnimation(before, after) {
    await this.activateEngine();
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
    await this.settlingGlow();
    this.deactivateEngine();
  }

  // ══════════════════════════════════════════════════════════════
  // MINI DISPLAY PLAQUE
  // ══════════════════════════════════════════════════════════════

  createMiniPlaque() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x1a1408, 1);
    g.lineStyle(2, C_BRASS, 1);
    g.fillRoundedRect(MINI_PLAQUE_X, MINI_PLAQUE_Y, MINI_PLAQUE_W, MINI_PLAQUE_H, 4);
    g.strokeRoundedRect(MINI_PLAQUE_X, MINI_PLAQUE_Y, MINI_PLAQUE_W, MINI_PLAQUE_H, 4);
    this.plaqueText = this.add.text(MINI_PLAQUE_X + MINI_PLAQUE_W / 2, MINI_PLAQUE_Y + MINI_PLAQUE_H / 2, "", { font: "bold 15px Courier New", color: "#e8eaf6", wordWrap: { width: MINI_PLAQUE_W - 16 }, align: "center" }).setOrigin(0.5).setDepth(11);

    this.stripBeforeText = this.add.text(MINI_X0, MINI_STRIP_Y, "", { font: "11px Courier New", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(11);
    this.stripArrowText = this.add.text(MINI_CX, MINI_STRIP_Y, "", { font: "bold 12px Arial", color: HEX_BRASS }).setOrigin(0.5).setDepth(11);
    this.stripAfterText = this.add.text(MINI_X1, MINI_STRIP_Y, "", { font: "bold 11px Courier New", color: "#e8eaf6" }).setOrigin(1, 0.5).setDepth(11);
  }

  clearPlaque() {
    this.plaqueText.setText("").setColor("#e8eaf6").setFontSize(13);
  }

  clearBeforeAfterStrip() {
    this.stripBeforeText.setText("");
    this.stripArrowText.setText("");
    this.stripAfterText.setText("");
  }

  showBeforeAfter(before, after) {
    const fmt = (arr) => `[${arr.join(", ")}]`;
    let bStr = fmt(before), aStr = fmt(after);
    this.stripBeforeText.setFontSize(9).setText(bStr);
    this.stripArrowText.setText("→");
    this.stripAfterText.setFontSize(9).setText(aStr);
    if (this.stripBeforeText.width > MINI_PLAQUE_W / 2 - 20) this.stripBeforeText.setFontSize(7);
    if (this.stripAfterText.width > MINI_PLAQUE_W / 2 - 20) this.stripAfterText.setFontSize(7);
  }

  _fakeHash(roundIndex, type) {
    const hex = ((roundIndex + 1) * 7919 + 12345).toString(16).padStart(8, "0");
    return type === "String[]" ? `[Ljava.lang.String;@${hex}` : `[I@${hex}`;
  }

  async runToStringScan(values, type) {
    this.clearPlaque();
    const n = values.length;
    this.plaqueText.setText("[");
    await this.delay(60);
    const parts = [];
    for (let i = 0; i < n; i++) {
      if (!this._alive) return `[${parts.join(", ")}]`;
      const comp = this._miniCompartments[i];
      if (comp && comp.card) {
        const ghost = this.add.text(comp.card.x, comp.card.y, String(values[i]), { font: "bold 11px Courier New", color: "#e8eaf6" }).setOrigin(0.5).setDepth(14);
        await new Promise((res) => { this.tweens.add({ targets: ghost, x: MINI_PLAQUE_X + 24 + i * 10, y: MINI_PLAQUE_Y + MINI_PLAQUE_H / 2, duration: 140, ease: "Sine.easeIn", onComplete: () => { ghost.destroy(); res(); } }); });
      }
      parts.push(String(values[i]));
      this.plaqueText.setText("[" + parts.join(", "));
      await this.delay(45);
    }
    this.plaqueText.setText("[" + parts.join(", ") + "]");
    return "[" + parts.join(", ") + "]";
  }

  async showCursedLabel(type) {
    this.clearPlaque();
    this.tweens.add({ targets: this.miniSpecimenLayer, x: "+=3", duration: 25, yoyo: true, repeat: 4 });
    const hash = this._fakeHash(this.currentRound, type);
    this.plaqueText.setColor(HEX_RED).setFontSize(10);
    for (let i = 0; i < hash.length; i++) {
      if (!this._alive) return hash;
      this.plaqueText.setText(hash.slice(0, i + 1));
      await this.delay(10);
    }
    await this.delay(200);
    this.plaqueText.setFontSize(13);
    return hash;
  }

  async bracketAccessGhost(index) {
    await this.highlightMiniCompartment(index);
    const comp = this._miniCompartments[index];
    if (!comp || !comp.card) return comp ? comp.value : null;
    const color = comp.cardColor === C_CYAN ? HEX_CYAN : HEX_GOLD;
    const ghost = this.add.text(comp.card.x, comp.card.y, String(comp.value), { font: "bold 12px Courier New", color }).setOrigin(0.5).setDepth(14);
    await new Promise((res) => { this.tweens.add({ targets: ghost, y: ghost.y - 40, alpha: 0, duration: 200, ease: "Sine.easeOut", onComplete: () => { ghost.destroy(); res(); } }); });
    return comp.value;
  }

  showCompileErrorStamp() {
    const stamp = this.add.text(SLATE_X + SLATE_W / 2, SLATE_Y + SLATE_H / 2, "COMPILE ERROR", { font: "bold 18px Arial", color: HEX_RED }).setOrigin(0.5).setDepth(30).setScale(1.3).setAngle(-6).setAlpha(0);
    this.roundElements.push(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 150 });
    this.screenShake(0.004, 120);
    this.time.delayedCall(850, () => { if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 180, onComplete: () => stamp.destroy() }); });
  }

  // ══════════════════════════════════════════════════════════════
  // CLASSIFICATION SLATE
  // ══════════════════════════════════════════════════════════════

  createClassificationSlate() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0a0d18, 1);
    g.lineStyle(2, C_BRASS, 1);
    g.fillRoundedRect(SLATE_X, SLATE_Y, SLATE_W, SLATE_H, 8);
    g.strokeRoundedRect(SLATE_X, SLATE_Y, SLATE_W, SLATE_H, 8);
    this.add.text(SLATE_X + 12, SLATE_Y + 10, "CLASSIFICATION SLATE", { font: "bold 11px Georgia", color: HEX_BRASS }).setDepth(11);
    this.slateLines = this.add.container(0, 0).setDepth(11);
    this._slateY = SLATE_Y + 30;
  }

  async chalkWriteLine(text, color) {
    const t = this.add.text(SLATE_X + 12, this._slateY, "", { font: "bold 13px Courier New", color: color || "#e8eaf6" }).setDepth(11);
    this.slateLines.add(t);
    for (let i = 0; i < text.length; i++) {
      if (!this._alive) return;
      t.setText(t.text + text[i]);
      if (t.width > SLATE_W - 24) t.setFontSize(9);
      await this.delay(8);
    }
    this._slateY += 18;
    if (this._slateY > SLATE_Y + SLATE_H - 20) this._slateY = SLATE_Y + 30;
  }

  chalkEvaluationArrow(value) {
    const t = this.add.text(SLATE_X + 12, this._slateY, `→ ${value}`, { font: "bold 13px Courier New", color: HEX_ORANGE }).setAlpha(0);
    this.slateLines.add(t);
    if (t.width > SLATE_W - 24) t.setFontSize(9);
    this.tweens.add({ targets: t, alpha: 1, duration: 100 });
    this._slateY += 18;
    if (this._slateY > SLATE_Y + SLATE_H - 20) this._slateY = SLATE_Y + 30;
  }

  wipeSlate() {
    this.slateLines.removeAll(true);
    this._slateY = SLATE_Y + 30;
  }

  updateResultRow(type) {}

  // ══════════════════════════════════════════════════════════════
  // HUD
  // ══════════════════════════════════════════════════════════════

  createHUD() {
    const g = this.add.graphics().setDepth(49);
    g.fillStyle(0x081008, 0.93);
    g.fillRect(0, 0, W, 64);
    g.lineStyle(1, 0x3a2618, 1);
    g.lineBetween(0, 64, W, 64);

    this.add.text(20, 14, "THE CLASSIFICATION TRIALS", { font: "bold 16px Georgia", color: "#b0bec5" }).setDepth(50);
    this.add.text(20, 32, "Tuning Phase — Arrays Methods: sort()", { font: "12px Arial", color: "#546e7a" }).setDepth(50);

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
    for (let i = 0; i < 3; i++) {
      const lg = this.add.graphics({ x: 1150 + i * 26, y: 24 }).setDepth(50);
      lg.lineStyle(2, C_BRASS, 1);
      lg.strokeRoundedRect(-5, -6, 10, 12, 2);
      lg.lineBetween(-6, -6, 6, -6);
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
  // BIT — CLASSIFICATION OFFICER VARIANT
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
    const frock = this.add.graphics();
    frock.fillStyle(0x1a0e05, 0.9);
    frock.lineStyle(1, 0x3a2618, 0.7);
    frock.fillTriangle(-17, -12, 17, -12, 0, 22);
    frock.fillStyle(C_BRASS, 0.6);
    frock.fillCircle(-3, 4, 1.3);
    frock.fillCircle(-3, 12, 1.3);
    const gloveL = this.add.circle(-16, 10, 4, 0xffffff, 0).setStrokeStyle(1, 0xe8eaf6, 0.7);
    this.stamp = this.add.container(17, 4);
    const stampG = this.add.graphics();
    stampG.fillStyle(C_BRASS, 0.85);
    stampG.lineStyle(1, 0x8a6435, 0.8);
    stampG.fillRoundedRect(-7, -9, 14, 9, 2);
    stampG.strokeRoundedRect(-7, -9, 14, 9, 2);
    stampG.lineStyle(1, C_BRASS, 0.6);
    stampG.lineBetween(0, 0, 0, 8);
    const check = this.add.text(0, -5, "✓", { font: "bold 9px Arial", color: "#0a1208" }).setOrigin(0.5);
    this.stamp.add([stampG, check]);
    const spray = this.add.graphics();
    spray.fillStyle(0x2e7d32, 0.5);
    spray.lineStyle(1, 0x5d7a5d, 0.6);
    spray.fillRoundedRect(13, 4, 6, 12, 1);
    spray.strokeRoundedRect(13, 4, 6, 12, 1);
    spray.fillRect(15, 0, 2, 4);
    c.add([g, frock, eye, pupil, gloveL, this.stamp, spray, tip]);
    this.tweens.add({ targets: tip, alpha: 0.3, duration: 850, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: c, y: "+=3", duration: 1750, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
    this.bit = c;
  }

  async raiseStamp() {
    await new Promise((res) => { this.tweens.add({ targets: this.stamp, angle: -25, y: -4, duration: 150, ease: "Sine.easeOut", onComplete: res }); });
    this.tweens.add({ targets: this.stamp, angle: 0, y: 4, duration: 150, ease: "Sine.easeIn" });
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

  async showBitFeedback(message) {
    await this.bitSay(message);
    if (!this._alive) return;
    await Promise.race([this.waitForClick(), this.delay(4000)]);
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
    await this.bitSay("The Classification Trials, Officer — every specimen tray rusts if you hesitate. The patina creeps from the corners; classify before it swallows the brass. Sort verdicts are reflexes tonight.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(5000)]); if (!A()) return;
    this.hideBubble();

    this.showTrialOnCard(["Arrays.sort(a)"], "Classify: {8, 3, 5} after sort?");
    this._currentConfig = { revealNote: null };
    this.startPatinaSpread(9000);
    await this.populateMiniTray([8, 3, 5], "int[]");
    const before = [8, 3, 5], after = [3, 5, 8];
    await this.runSortAnimation(before, after);
    this.showVoidAnnotation();
    this.showBeforeAfter(before, after);
    if (!A()) return;
    const a1 = this.createAnnotation(CARD_CX, CARD_Y1 + 14, "the form", HEX_BLUE_GRAY);
    const a2 = this.createAnnotation((TRAY_X0 + TRAY_X1) / 2, TRAY_Y1 + 20, "your time, corroding", HEX_BLUE_GRAY);
    const a3 = this.createAnnotation(MINI_CX, MINI_GANTRY_Y - 20, "the arrangement, honest as ever", HEX_BLUE_GRAY);
    await this.bitSay("Polish early, classify fast. The brass won't wait!");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();
    [a1, a2, a3].forEach((a) => a.destroy());
    this._killPatinaTween();
    this.clearCardContent();
    this.wipeSlate();
    this.clearPlaque();
    this.clearBeforeAfterStrip();
    this.clearMiniTray();
    this._patinaProgress = 0;
    this.updatePatinaSpread();

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
      1: "WAVE 1 — RAPID ARRANGEMENTS",
      2: "WAVE 2 — THE LEXICOGRAPHIC GALLERY",
      3: "WAVE 3 — DEEP TRACES & BUG HUNT",
    };
    await this.showWaveBanner(banners[waveNumber]);
    if (!this._alive) return;
    if (waveNumber === 2) {
      await this.showBitFeedback("The gallery reads character codes now, Officer. Uppercase specimens (65-90) are classified BEFORE every lowercase one (97-122) — no exceptions, no intuition. And numeric strings sort by digit, not by value.");
    } else if (waveNumber === 3) {
      await this.showBitFeedback("Final specimens — multi-statement traces where the tray mutates mid-form, and two flawed logs hiding in the corkboard. One tried to catch a void; one read the tray after it changed. The engine tells the truth; your assumptions don't.");
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
    this.wipeSlate();
    this.clearMiniTray();
    this.clearPlaque();
    this.clearBeforeAfterStrip();
    this.cardRoundLabel.setText(`CLASS. ${index + 1}/15`);
    this.roundStartTime = this.time.now;

    const limit = config.type === "bughunt" ? 12000 : WAVE_TIME[config.wave];
    if (config.type === "predict" || config.type === "trace") this.setupPredict(config);
    else if (config.type === "bughunt") this.setupBugHunt(config);

    this.startPatinaSpread(limit);
  }

  clearRound() {
    this.roundElements.forEach((e) => { if (e && e.destroy) e.destroy(); });
    this.roundElements = [];
    this._bugHuntTokenObjs = [];
    if (this._bugHeaderTween) { this._bugHeaderTween.stop(); this._bugHeaderTween = null; }
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE A/B — PREDICT / TRACE
  // ══════════════════════════════════════════════════════════════

  setupPredict(config) {
    const lines = this._sourceLines(config);
    this.showTrialOnCard(lines, config.question);
    this.showOptionBubbles(config.options, config);
  }

  showOptionBubbles(options, config) {
    const shuffled = Phaser.Utils.Array.Shuffle(options.slice());
    const positions = [[365, 568], [605, 568], [365, 624], [605, 624]];
    shuffled.forEach((opt, i) => {
      const [x, y] = positions[i];
      const c = this.add.container(x, y).setDepth(41);
      const g = this.add.graphics();
      const w = 220, h = 44;
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
    await this.polishSpray();
    const timePctUsed = this.getTimePctUsed();
    const timeMs = Math.round(this.time.now - this.roundStartTime);
    const correct = opt.value === config.correct;
    this.logAttempt(config, correct, opt.value, opt.tag, timeMs, timePctUsed);
    this.roundElements.forEach((e) => e.disableInteractive && e.disableInteractive());

    const g = bubbleContainer.list[0];
    g.clear();
    g.fillStyle(0x0a0d18, 1);
    g.fillRoundedRect(-110, -22, 220, 44, 8);
    g.lineStyle(2, correct ? C_GREEN_BRIGHT : C_RED, 1);
    g.strokeRoundedRect(-110, -22, 220, 44, 8);
    if (!correct) this.tweens.add({ targets: bubbleContainer, x: bubbleContainer.x + 5, duration: 35, yoyo: true, repeat: 4 });

    await this.runReveal(config);
    if (!this._alive) return;
    await this.stampCard(correct ? "classified" : "misclassified");
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
  // TYPE C — BUG HUNT
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
    await this.polishSpray();
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
    await this.stampCard(correct ? "classified" : "misclassified");
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
   * evaluator, never scripted. Three repair strategies depending on
   * WHERE the fault lives: "type_declaration" replaces the whole faulty
   * line; "void_assignment" (and generally any faultToken that's a pure
   * substring) replaces just the faulty substring in place; and
   * "post_sort_read" RESTRUCTURES — a new capture line is inserted
   * before the mutating Arrays.sort(...) statement, and the faulty
   * post-sort read is substituted with the new variable everywhere it
   * appeared. */
  async runDualFutureReveal(config) {
    const honestLines = config.lines.filter((l) => !l.trim().startsWith("//"));
    await this.runReveal(honestLines);
    await this.delay(400);
    if (!this._alive) return;
    this.wipeSlate();
    this.clearMiniTray();
    this.clearPlaque();
    this.clearBeforeAfterStrip();

    let fixedLines;
    if (config.tokenRegion === "type_declaration") {
      fixedLines = config.lines
        .map((l, i) => (i + 1 === config.faultLine ? config.fix : l))
        .filter((l) => !l.trim().startsWith("//"));
    } else if (config.tokenRegion === "post_sort_read") {
      const sortIdx = honestLines.findIndex((l) => /Arrays\.sort\(/.test(l));
      const faultIdx = config.faultLine - 1;
      const newReadLine = honestLines[faultIdx].replace(config.faultToken, "first");
      fixedLines = [
        ...honestLines.slice(0, sortIdx),
        config.fix,
        ...honestLines.slice(sortIdx, faultIdx),
        newReadLine,
        ...honestLines.slice(faultIdx + 1),
      ];
    } else if (config.tokenRegion === "void_assignment") {
      // The fault line's declared name (e.g. "ranked") disappears once the
      // capture is removed — every LATER reference to it must fall back to
      // the array it was meant to alias (e.g. "scores"), or the fixed run
      // would crash on an undefined variable.
      const declMatch = config.faultToken.match(/^\w+(?:\[\])?\s+(\w+)\s*=\s*Arrays\.sort\((\w+)\)$/);
      fixedLines = config.lines
        .map((l, i) => {
          if (i + 1 === config.faultLine) return l.replace(config.faultToken, config.fix);
          return declMatch ? l.replace(new RegExp(`\\b${declMatch[1]}\\b`, "g"), declMatch[2]) : l;
        })
        .filter((l) => !l.trim().startsWith("//"));
    } else {
      fixedLines = config.lines
        .map((l, i) => (i + 1 === config.faultLine ? l.replace(config.faultToken, config.fix) : l))
        .filter((l) => !l.trim().startsWith("//"));
    }
    await this.runReveal(fixedLines);
  }

  // ══════════════════════════════════════════════════════════════
  // HONEST EVALUATOR — reuses/extends L65's sort() evaluator: genuine
  // in-place mutation, void return, numeric vs. natural-Unicode string
  // comparators, bracket-index expressions — extended with a top-level
  // minus splitter (for the a[a.length-1] - a[0] range pattern) and
  // multi-statement pre/post-sort variable snapshots.
  // ══════════════════════════════════════════════════════════════

  _parseArrayInit(initStr, type) {
    const inner = initStr.trim().replace(/^\{/, "").replace(/\}$/, "").trim();
    if (!inner) return [];
    const parts = this._splitTopArgs(inner);
    if (type === "String[]") return parts.map((p) => p.trim().replace(/^"(.*)"$/, "$1"));
    return parts.map((p) => parseFloat(p.trim()));
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

  /** Splits a top-level " - " (whitespace-flanked, bracket-depth-aware)
   * for the range pattern a[a.length - 1] - a[0] — never fires inside
   * a bracket (the "- 1" inside a.length - 1 sits at depth 1). */
  _splitTopMinus(expr) {
    let depth = 0;
    for (let i = 1; i < expr.length - 1; i++) {
      const ch = expr[i];
      if (ch === "(" || ch === "[") depth++;
      else if (ch === ")" || ch === "]") depth--;
      else if (ch === "-" && depth === 0 && expr[i - 1] === " " && expr[i + 1] === " ") {
        return [expr.slice(0, i).trim(), expr.slice(i + 1).trim()];
      }
    }
    return null;
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
      return { ok: true, value: result, type: "String" };
    }

    const instToStringMatch = t.match(/^(\w+)\.toString\(\)$/);
    if (instToStringMatch) {
      const arr = vars[instToStringMatch[1]];
      if (arr && arr.kind === "array") {
        const hash = await this.showCursedLabel(arr.type);
        await this.chalkWriteLine(`${instToStringMatch[1]}.toString()`, "#8ea6c8");
        this.chalkEvaluationArrow(hash);
        return { ok: true, value: hash, type: "String" };
      }
    }

    // Top-level +/- splits MUST run before the bracket-access match below:
    // a bracket-match regex anchored on the WHOLE string is greedy (the
    // (.+) swallows up to the LAST "]"), so a compound expression that
    // merely STARTS with a bracket read — "a[a.length - 1] - a[0]",
    // "w[0] + \" & \" + w[2]" — would otherwise be wrongly parsed as one
    // single bracket access with a garbage index expression.
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

    const minusParts = this._splitTopMinus(t);
    if (minusParts) {
      const l = await this.resolveExpr(minusParts[0], vars);
      if (!l.ok) return l;
      const r = await this.resolveExpr(minusParts[1], vars);
      if (!r.ok) return r;
      return { ok: true, value: Number(l.value) - Number(r.value), type: "int" };
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
      return { ok: true, value, type: elemType };
    }

    const lengthMatch = t.match(/^(\w+)\.length$/);
    if (lengthMatch) {
      const arr = vars[lengthMatch[1]];
      if (!arr || arr.kind !== "array") return { ok: false, crash: "eval" };
      await this.chalkWriteLine(`${lengthMatch[1]}.length`, "#8ea6c8");
      this.chalkEvaluationArrow(arr.values.length);
      return { ok: true, value: arr.values.length, type: "int" };
    }

    if (/^".*"$/.test(t)) return { ok: true, value: t.slice(1, -1), type: "String" };
    if (/^-?\d+\.\d+$/.test(t)) return { ok: true, value: parseFloat(t), type: "double" };
    if (/^-?\d+$/.test(t)) return { ok: true, value: parseInt(t, 10), type: "int" };

    if (vars[t] !== undefined) {
      const v = vars[t];
      if (v.kind === "array") {
        const hash = await this.showCursedLabel(v.type);
        await this.chalkWriteLine(t, "#8ea6c8");
        this.chalkEvaluationArrow(hash);
        return { ok: true, value: hash, type: "String" };
      }
      return { ok: true, value: v.value, type: v.type };
    }

    return { ok: false, crash: "eval" };
  }

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
    const stamp = this.add.text(MINI_CX, MINI_TRAY_Y0 - 20, "ArrayIndexOutOfBoundsException", { font: "bold 11px Courier New", color: HEX_RED }).setOrigin(0.5).setAngle(-4).setAlpha(0);
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
      await this.populateMiniTray(values, type);
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
     * sort. Sorts the array's actual values in place (numeric comparator
     * for numbers; JS's default natural-Unicode comparator for Strings,
     * which matches Java's uppercase-before-lowercase ordering exactly)
     * and runs the honest choreography before/after the mutation. */
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

  /** Runs a round's source (or a reconstructed dual-future variant)
   * through the honest evaluator. Accepts a config object ({.source}),
   * a raw multi-line string, or an already-split lines array. */
  async runReveal(input) {
    const raw = Array.isArray(input) ? input : input.source !== undefined ? input.source : input;
    const lines = (Array.isArray(raw) ? raw : String(raw).split("\n")).map((l) => l.trim()).filter((l) => l && !l.startsWith("//"));
    this._printedLines = [];
    const vars = {};
    return await this.runStatements(lines, vars);
  }

  // ══════════════════════════════════════════════════════════════
  // SCORING, LIVES, COMBO
  // ══════════════════════════════════════════════════════════════

  getComboMultiplier() { if (this.combo >= 5) return 3; if (this.combo >= 3) return 2; return 1; }

  scoreForAttempt(timePctUsed) {
    let points = 100 * this.getComboMultiplier();
    const remaining = 1 - timePctUsed;
    if (remaining > 0.6) { points += 50; this.fastBonusCount++; this.createFloatingText(CARD_CX, CARD_Y0 - 14, "⚡ EARLY VERDICT +50", HEX_GOLD, "bold 15px Arial", 900); }
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
      GameManager.fusionEngine.checkBehavioral(prediction);
    } catch (e) {
      console.warn("Level66Scene: /api/wellbeing/predict-struggle unreachable, skipping behavioral signal for this level:", e);
    }
  }

  advanceRound() {
    if (this.currentRound === 2) this.runBehavioralCheck();
    this.clearRound();
    const next = this.currentRound + 1;
    if (next >= ROUNDS.length) { this.levelComplete(); return; }
    const nextConfig = ROUNDS[next];
    if (nextConfig.wave !== this.currentWave) {
      this.recedePatina().then(() => { if (this._alive && !this.gameEnded) this.startWave(nextConfig.wave); });
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
    this._killPatinaTween();
    this.clearRound();
    this.hideBubble();

    (async () => {
      this.wipeSlate();
      this.clearMiniTray();
      this.clearPlaque();
      this.clearBeforeAfterStrip();
      const motes = this.ambient;
      this.ambient = null;
      (motes || []).forEach((m) => this.tweens.add({ targets: m, y: 632, alpha: 0, duration: 1500, ease: "Sine.easeIn" }));

      const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
      this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });
      const title = this.add.text(640, 240, "TRIALS SUSPENDED", { font: "bold 36px Georgia", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
      this.tweens.add({ targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut", onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }) });
      this.add.text(640, 310, `Score: ${this.score}`, { font: "21px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
      this.add.text(640, 350, `Specimens Classified: ${this.currentRound} / 15`, { font: "18px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);
      this._makeButton(525, 420, "WIPE THE TARNISH", 200, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
      this._makeButton(755, 420, "RETURN TO MENU", 200, 50, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.start("MenuScene"));
    })();
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this._killPatinaTween();
    this.clearRound();
    this.hideBubble();

    try { GameManager.completeLevel(65, Math.round((this.correctFirstTry / 15) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("arrays_sort_tuned"); } catch (_) {}
    try {
      localStorage.setItem("level66_results", JSON.stringify({
        level: 66, concept: "arrays_sort", phase: "tuning",
        score: this.score, accuracy: this.correctFirstTry / 15, avgTimePct: this.totalTimePctUsed / 15,
        fastBonuses: this.fastBonusCount, comboMax: this.maxCombo, stars: this._starRating(),
        livesRemaining: this.lives, attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.classificationFinale().then(() => { if (this._alive) this.showScoreTally(); });
  }

  async classificationFinale() {
    await this.recedePatina();
    await this.stampCard("classified");
    this.createConfetti(CARD_CX, (CARD_Y0 + CARD_Y1) / 2, 30);

    this.wipeSlate();
    this.clearMiniTray();
    this.clearPlaque();
    this.clearBeforeAfterStrip();
    const before = [9, 3, 6];
    await this.populateMiniTray(before, "int[]");
    const after = before.slice().sort((a, b) => a - b);
    await this.runSortAnimation(before, after);
    this.showVoidAnnotation();
    this.showBeforeAfter(before, after);
    this.createConfetti(MINI_CX, (MINI_TRAY_Y0 + MINI_TRAY_Y1) / 2, 24);
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
      `EARLY-VERDICT BONUSES: ${this.fastBonusCount}`,
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
    bg.lineBetween(-9, 4, -3, 10);
    bg.lineBetween(-3, 10, 9, -6);
    badge.add(bg);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 2100 });
    const badgeLbl = this.add.text(640, 520, "sort() SCHEMA TUNED", { font: "bold 14px Georgia", color: HEX_GOLD }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: badgeLbl, alpha: 1, duration: 300, delay: 2250 });

    this._makeButton(500, 555, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(770, 555, "BACK TO MENU →", 290, 44, { fill: 0x00733a, stroke: C_GREEN_BRIGHT, textColor: "#ffffff" }, () => {
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
