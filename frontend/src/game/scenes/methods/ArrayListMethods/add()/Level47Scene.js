/**
 * Level 47 — "The Card Catalog" (ArrayList Methods: Tuning Phase — add())
 * ===========================================================================
 * Tunes the Level 46 add() schema under time pressure at the archive's
 * card-catalog station. The reference candle's wax height IS the timer —
 * it burns down linearly over the round's limit; answer before the flame
 * gutters or the card is lost to the dark. The level's central NEW skill
 * is the two-argument add(index, element) overload: it INSERTS at the
 * index and shifts subsequent elements right (never replaces).
 *
 * The evaluator is the Level 46 interpreter extended honestly:
 *  - single-arg add(element) appends (type-checked at "compile time"),
 *  - two-arg add(index, element) type-checks the element, then validates
 *    the index against [0, size] inclusive — a genuine
 *    IndexOutOfBoundsException choreography plays for invalid indices
 *    (rhyming with L29's charAt out-of-range crash), and a genuine
 *    splice-and-shift insertion animation plays for valid ones.
 * Ground truth (this.currentList) only mutates on genuine successes.
 */

import Phaser from "phaser";
import { GameManager } from "../../../../GameManager.js";
import { WellbeingAPI } from "../../../../../api/api.js";
import { BadgeSystem } from "../../../../BadgeSystem.js";

const W = 1280, H = 720;

const C_CYAN = 0x4fc3f7, C_GOLD = 0xffd740, C_ORANGE = 0xff9800, C_VIOLET = 0xb39ddb;
const C_GREEN_BRIGHT = 0x00e676, C_RED = 0xf44336, C_GRAY = 0x78909c, C_BRASS = 0xc8a05a;
const HEX_CYAN = "#4fc3f7", HEX_GOLD = "#ffd740", HEX_ORANGE = "#ff9800", HEX_VIOLET = "#b39ddb";
const HEX_GREEN_BRIGHT = "#00e676", HEX_RED = "#f44336", HEX_GRAY = "#78909c", HEX_BRASS = "#c8a05a";

// Reference desk + trial card
const DESK_X0 = 280, DESK_X1 = 780, DESK_Y0 = 100, DESK_Y1 = 460;
const CARD_X0 = 300, CARD_X1 = 660, CARD_Y0 = 120, CARD_Y1 = 400;
const CARD_CX = (CARD_X0 + CARD_X1) / 2, CARD_CY = (CARD_Y0 + CARD_Y1) / 2;
// Reference candle
const CANDLE_X = 720, CANDLE_BASE_Y = 400, CANDLE_FULL_H = 240, CANDLE_W = 20;
// Compact reference bookshelf
const SHELF_X0 = 810, SHELF_X1 = 1010, SHELF_Y0 = 90, SHELF_Y1 = 560;
const SHELF_CX = (SHELF_X0 + SHELF_X1) / 2;
const SHELF_BASE_Y = 520, SHELF_STEP = 54;
// Book prep area (compact)
const PREP_X0 = 810, PREP_Y0 = 570, PREP_W = 200, PREP_H = 50;
// Compact list state panel
const PANEL_X = 1030, PANEL_Y = 90, PANEL_W = 210, PANEL_H = 470;
const TUTORIAL_KEY = "level47_tutorial_done";
const WAVE_TIME = { 1: 12000, 2: 10000, 3: 9000 };

// ══════════════════════════════════════════════════════════════
// ROUND CONFIGURATION
// ══════════════════════════════════════════════════════════════
const ROUNDS = [
  // ══ WAVE 1 — Rapid Basic Additions (12s) ══
  { round: 1, wave: 1, type: "predict", listType: "String",
    source: ["ArrayList<String> list = new ArrayList<>();", 'list.add("A");', 'list.add("B");', 'list.add("C");'],
    question: "What is at index 1?", correct: "B",
    options: [
      { value: "B", tag: null },
      { value: "A", tag: "first_add_at_index_one_belief" },
      { value: "C", tag: "add_reverses_order_belief" },
      { value: "(empty)", tag: "index_starts_at_one_belief" },
    ], concept: "fluent_middle_index" },

  { round: 2, wave: 1, type: "predict", listType: "Integer",
    source: ["ArrayList<Integer> nums = new ArrayList<>();", "nums.add(10);", "nums.add(20);", "nums.add(30);", "nums.add(40);"],
    question: "What is the size?", correct: "4",
    options: [
      { value: "4", tag: null },
      { value: "3", tag: "size_equals_last_index_belief" },
      { value: "5", tag: "size_off_by_one_high" },
      { value: "0", tag: "size_before_adds_belief" },
    ], concept: "fluent_size_after_adds" },

  { round: 3, wave: 1, type: "predict", listType: "String",
    source: ["ArrayList<String> l = new ArrayList<>();", 'l.add("hi");', 'l.add("hi");', 'l.add("hi");'],
    question: "What is the size?", correct: "3",
    options: [
      { value: "3", tag: null },
      { value: "1", tag: "duplicates_not_allowed_belief" },
      { value: "0", tag: "duplicates_forbidden_belief" },
      { value: "2", tag: "duplicates_partial_dedup_belief" },
    ],
    revealNote: "Duplicates keep every entry — three books with the same title, three shelves, size 3.",
    concept: "fluent_duplicates_size" },

  { round: 4, wave: 1, type: "predict", listType: "Integer",
    source: ["ArrayList<Integer> nums = new ArrayList<>();", "nums.add(5);", "nums.add(10);"],
    question: "What is at index 0?", correct: "5",
    options: [
      { value: "5", tag: null },
      { value: "10", tag: "add_reverses_order_belief" },
      { value: "0", tag: "index_starts_at_one_belief" },
      { value: "(empty)", tag: "first_add_at_index_one_belief" },
    ], concept: "fluent_first_stays_at_zero" },

  { round: 5, wave: 1, type: "predict", listType: "String",
    source: ["ArrayList<String> l = new ArrayList<>();", 'l.add("A");', 'l.add("B");', 'l.add("C");', 'l.add("D");', 'l.add("E");'],
    question: "What is the list state?", correct: "[A, B, C, D, E]",
    options: [
      { value: "[A, B, C, D, E]", tag: null, label: "[A, B, C, D, E]" },
      { value: "[E, D, C, B, A]", tag: "add_reverses_order_belief", label: "[E, D, C, B, A]" },
      { value: "[A, B, C]", tag: "size_off_by_two", label: "[A, B, C] (only 3)" },
      { value: "[A]", tag: "only_first_add_counts_belief", label: "[A] (only first)" },
    ], concept: "fluent_five_adds_ordered" },

  // ══ WAVE 2 — The Insertion Overload (10s) ══
  { round: 6, wave: 2, type: "predict", listType: "String",
    source: ["ArrayList<String> list = new ArrayList<>();", 'list.add("A");', 'list.add("B");', 'list.add(0, "X");'],
    question: "What is the list state?", correct: "[X, A, B]",
    options: [
      { value: "[X, A, B]", tag: null, label: "[X, A, B] (X inserted at 0, others shift right)" },
      { value: "[A, B, X]", tag: "add_index_specifies_destination_end_belief", label: "[A, B, X] (X appended)" },
      { value: "[X, B]", tag: "add_replaces_at_index_belief", label: "[X, B] (X replaces A)" },
      { value: "[X]", tag: "add_index_erases_belief", label: "[X] (index 0 clears others)" },
    ],
    revealNote: "The two-argument add() INSERTS at the given index. Shelf 0 gets the CYAN insertion glow; A and B slide up one shelf to make room; X settles into shelf 0. Nothing was replaced — everything got shifted.",
    concept: "insertion_at_zero" },

  { round: 7, wave: 2, type: "predict", listType: "String",
    source: ["ArrayList<String> list = new ArrayList<>();", 'list.add("A");', 'list.add("B");', 'list.add("C");', 'list.add(1, "Z");'],
    question: "What is the list state?", correct: "[A, Z, B, C]",
    options: [
      { value: "[A, Z, B, C]", tag: null, label: "[A, Z, B, C] (Z inserted at 1, B and C shift right)" },
      { value: "[A, Z, C]", tag: "add_replaces_at_index_belief", label: "[A, Z, C] (Z replaces B)" },
      { value: "[Z, A, B, C]", tag: "add_index_offset_belief", label: "[Z, A, B, C] (index off by one)" },
      { value: "[A, B, Z, C]", tag: "add_index_offset_belief_after", label: "[A, B, Z, C] (Z goes AFTER index 1)" },
    ],
    revealNote: "The trilogy's CENTRAL discrimination: add(1, 'Z') INSERTS Z at index 1 and SHIFTS B and C right. It does NOT replace B. Shelf 1 glows cyan, B and C slide up, Z settles into shelf 1. Result: [A, Z, B, C].",
    concept: "insertion_vs_replacement" },

  { round: 8, wave: 2, type: "predict", listType: "Integer",
    source: ["ArrayList<Integer> nums = new ArrayList<>();", "nums.add(10);", "nums.add(20);", "nums.add(30);", "nums.add(2, 25);"],
    question: "What is the list state?", correct: "[10, 20, 25, 30]",
    options: [
      { value: "[10, 20, 25, 30]", tag: null, label: "[10, 20, 25, 30] (25 inserted at 2)" },
      { value: "[10, 20, 25]", tag: "add_replaces_at_index_belief", label: "[10, 20, 25] (25 replaces 30)" },
      { value: "[10, 25, 20, 30]", tag: "add_index_offset_belief", label: "[10, 25, 20, 30]" },
      { value: "[10, 20, 30, 25]", tag: "add_index_specifies_destination_end_belief", label: "[10, 20, 30, 25]" },
    ], concept: "insertion_middle_ints" },

  { round: 9, wave: 2, type: "predict", listType: "String",
    source: ["ArrayList<String> list = new ArrayList<>();", 'list.add("X");', 'list.add("Y");', 'list.add(2, "Z");'],
    question: "What is the list state?", correct: "[X, Y, Z]",
    options: [
      { value: "[X, Y, Z]", tag: null, label: "[X, Y, Z] (Z appended at index 2 = size, legal)" },
      { value: "IOOBE", tag: "index_at_size_crashes_belief", label: "IndexOutOfBoundsException" },
      { value: "[Z, X, Y]", tag: "add_index_offset_belief", label: "[Z, X, Y]" },
      { value: "[X, Z, Y]", tag: "add_index_offset_belief_mid", label: "[X, Z, Y]" },
    ],
    revealNote: "The insertion index CAN equal the size — add(2, 'Z') on a size-2 list appends Z at the end (shelf 2), same as list.add('Z'). This boundary case is legal; add(3, 'Z') on a size-2 list would crash.",
    concept: "insertion_at_size_boundary" },

  { round: 10, wave: 2, type: "predict", listType: "String",
    source: ["ArrayList<String> list = new ArrayList<>();", 'list.add("A");', 'list.add(5, "B");'],
    question: "What happens?", correct: "runtime_crash",
    options: [
      { value: "runtime_crash", tag: null, label: "IndexOutOfBoundsException (crash)" },
      { value: "list_padded", tag: "index_out_of_range_pads_nulls_belief", label: "[A, null, null, null, null, B]" },
      { value: "list_appends", tag: "index_out_of_range_appends_belief", label: "[A, B]" },
      { value: "compile_error", tag: "runtime_vs_compile_confusion", label: "COMPILE ERROR" },
    ],
    revealNote: "add(5, 'B') on a size-1 list — target shelf 5 doesn't exist and can't be created. Shelf 5's plate flares red BEFORE the book arrives, book bounces back and dissolves, IndexOutOfBoundsException. The valid insertion range is 0 to size, inclusive.",
    concept: "invalid_insertion_index" },

  // ══ WAVE 3 — Complex Traces & Bug Hunt ══
  { round: 11, wave: 3, type: "trace", listType: "String",
    source: ["ArrayList<String> list = new ArrayList<>();", 'list.add("A");', 'list.add("B");', 'list.add(0, "START");', 'list.add("C");'],
    question: "What is the list state?", correct: "[START, A, B, C]",
    options: [
      { value: "[START, A, B, C]", tag: null, label: "[START, A, B, C]" },
      { value: "[START, A, B]", tag: "last_add_ignored", label: "[START, A, B] (missed C)" },
      { value: "[A, B, START, C]", tag: "add_index_specifies_destination_end_belief", label: "[A, B, START, C]" },
      { value: "[C, START, A, B]", tag: "add_reverses_order_belief", label: "[C, START, A, B]" },
    ],
    revealNote: "Trace: [] → [A] → [A, B] → [START, A, B] (insertion at 0 shifts A, B right) → [START, A, B, C] (append). Mixing simple and index adds — same rules apply throughout.",
    concept: "trace_mixed_adds" },

  { round: 12, wave: 3, type: "trace", listType: "Integer",
    source: ["ArrayList<Integer> nums = new ArrayList<>();", "nums.add(10);", "nums.add(20);", "nums.add(30);", "nums.add(1, 15);"],
    question: "What is the list state?", correct: "[10, 15, 20, 30]",
    options: [
      { value: "[10, 15, 20, 30]", tag: null, label: "[10, 15, 20, 30]" },
      { value: "[10, 15, 30]", tag: "add_replaces_at_index_belief", label: "[10, 15, 30]" },
      { value: "[15, 10, 20, 30]", tag: "add_index_offset_belief", label: "[15, 10, 20, 30]" },
      { value: "[10, 20, 30, 15]", tag: "add_index_specifies_destination_end_belief", label: "[10, 20, 30, 15]" },
    ], concept: "trace_middle_insertion" },

  { round: 13, wave: 3, type: "trace", listType: "String",
    source: ["ArrayList<String> list = new ArrayList<>();", 'list.add("hello");', 'list.add(0, "world");', 'list.add(1, "!");'],
    question: "What is the list state?", correct: "[world, !, hello]",
    options: [
      { value: "[world, !, hello]", tag: null, label: "[world, !, hello]" },
      { value: "[world, hello, !]", tag: "add_index_specifies_destination_end_belief", label: "[world, hello, !]" },
      { value: "[!, world, hello]", tag: "add_index_offset_belief", label: "[!, world, hello]" },
      { value: "[hello, world, !]", tag: "first_stays_first_belief", label: "[hello, world, !]" },
    ],
    revealNote: "Trace: [] → [hello] → [world, hello] (insert at 0, hello shifts up) → [world, !, hello] (insert at 1, hello shifts up again). Two consecutive insertions produce this unusual arrangement — trust the trace.",
    concept: "trace_two_insertions" },

  { round: 14, wave: 3, type: "bughunt", listType: "Integer",
    lines: ["ArrayList<Integer> nums = new ArrayList<>();", 'nums.add("hello");'],
    faultLine: 2, faultToken: '"hello"',
    fix: "nums.add(42);   // or any int",
    explanation: "Wrong type — ArrayList<Integer> refuses String at COMPILE time. The angle brackets are a strict promise. Use an int (autoboxed) or Integer literal.",
    wrongTag: "wrong_type_for_generic",
    concept: "wrong_type_bug_fluent" },

  { round: 15, wave: 3, type: "bughunt", listType: "String",
    lines: ["ArrayList<String> list = new ArrayList<>();", 'list.add("A");', 'list.add(3, "B");', "// expected: [A, B]"],
    faultLine: 3, faultToken: "3",
    fix: 'list.add(1, "B");   // or list.add("B");',
    explanation: "Invalid insertion index — add(3, 'B') needs shelf 3 to exist (or be at the end), but the list only has size 1. Max valid insertion index is size (here, 1). IndexOutOfBoundsException at runtime.",
    wrongTag: "invalid_insertion_index",
    revealNote: "Both futures: first the buggy crash — shelf 3's plate flares red, IndexOutOfBoundsException, list unchanged at [A]. Then the fix: add(1, 'B') files cleanly at shelf 1 (index 1 = size, legal append) — [A, B].",
    concept: "invalid_index_bug_fluent" },
];

const MISCONCEPTION_FEEDBACK = {
  // Wave 1 — carried over from Level 46
  first_add_at_index_one_belief: "The first shelf is 0, not 1. Java lists count from zero, same as Strings. If it's the first thing added, its home is 0.",
  index_starts_at_one_belief: "Zero-based indexing throughout Java. The first shelf is 0, the second is 1, and so on. Same rule as charAt.",
  add_reverses_order_belief: "add() puts the NEW book at the END, on the next empty shelf. The oldest additions stay at the lowest indices. First in, lowest number.",
  size_equals_last_index_belief: "Size counts the elements. Last index is size - 1 (because of zero-based). Four books means indices 0 to 3, but size = 4.",
  size_before_adds_belief: "Size updates AFTER each add. Count the successful adds; that's the size.",
  size_off_by_one_high: "Size counts the elements, one per successful add. Not one extra.",
  size_off_by_two: "Every add increments size by exactly one. Count the adds; that's the size.",
  only_first_add_counts_belief: "Every add stores a new book. Not just the first.",
  duplicates_not_allowed_belief: "ArrayList happily stores duplicates — three matching books get three shelves. Each add creates a new entry.",
  duplicates_forbidden_belief: "Duplicates are perfectly legal. If you wanted uniqueness, that's a Set — a different collection entirely.",
  duplicates_partial_dedup_belief: "ArrayList stores every add without checking. No dedup, no merge — three adds means three books.",
  // Wave 2/3 — the insertion overload
  add_replaces_at_index_belief: "The two-argument add INSERTS — it doesn't replace. The existing shelf's book gets pushed up one, not evicted. Watch the cyan glow at the target shelf, then the shift.",
  add_index_specifies_destination_end_belief: "The first argument is WHERE to insert, not where to end up. add(1, 'X') means 'insert X at shelf 1' — X becomes shelf 1's book, and everything from the old shelf 1 onward shifts up.",
  add_index_offset_belief: "The index is EXACT — add(1, 'X') puts X at index 1, not at index 0 or index 2. Read the target shelf number directly.",
  add_index_offset_belief_after: "The index is EXACT — add(1, 'X') puts X at index 1, not at index 0 or index 2. Read the target shelf number directly.",
  add_index_offset_belief_mid: "The index is EXACT — add(1, 'X') puts X at index 1, not at index 0 or index 2. Read the target shelf number directly.",
  add_index_erases_belief: "Insertion never erases — it makes room. Every existing book gets a new shelf; nothing disappears.",
  index_at_size_crashes_belief: "add(size, x) is LEGAL — it's just append. Valid range for insertion is 0 to size, inclusive. Only size + 1 or beyond crashes.",
  index_out_of_range_pads_nulls_belief: "ArrayList never pads with nulls. If the index is out of range, it crashes — no silent fill.",
  index_out_of_range_appends_belief: "The runtime doesn't 'guess' — it crashes on invalid indices. IndexOutOfBoundsException, no forgiveness.",
  runtime_vs_compile_confusion: "Invalid indices are caught at RUNTIME (when the program runs the line), not at compile time. Type errors are compile time; range errors are runtime.",
  wrong_type_for_generic: "The angle brackets are the type contract. Java catches wrong types at compile time — the code never even runs.",
  invalid_insertion_index: "The insertion index has to fit the shelf's current growth. For a size-N list, valid insertion indices are 0 through N (inclusive). N+1 or beyond crashes.",
  first_stays_first_belief: "Insertions can push the 'first' book to a higher shelf. Whichever book is at index 0 is 'first' — not necessarily the one that was added first.",
  last_add_ignored: "Every add executes in order — none are ignored. Trace them one at a time.",
  timeout: "The wick guttered! Fluent catalogers file the card before the flame drops. Trust the trace and commit.",
};

export class Level47Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level47Scene" });
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
    this.attemptLog = [];
    this.roundElements = [];
    this.roundStartTime = 0;
    this.roundTimeLimit = 12000;
    this.currentList = [];
    this.currentListType = null;
    this.shelfBookSprites = [];
    this.inputLocked = true;
    this.gameEnded = false;
    this._alive = true;
    this._bubble = null;
    this._burnTween = null;
    this._burnProgress = 0;
    this._candleLit = true;
    this._flamePaused = false;
    this._lastWispTime = 0;
    this._waveSquares = [];
    this._drawerRects = [];
  }

  preload() {}

  create() {
    this._alive = true;
    this.events.once("shutdown", () => { this._alive = false; this._killBurnTween(); });

    const cam = this.cameras.main;
    const zoom = Math.min(this.scale.width / W, this.scale.height / H);
    cam.setZoom(zoom);
    cam.centerOn(W / 2, H / 2);
    cam.setBackgroundColor("#0a0704");

    try { GameManager.incrementAttempt(46); } catch (_) {}

    this.createParticleTexture();
    this.createBackground();
    this.createBackWall();
    this.createCardCatalogCabinet();
    this.createWallSconce();
    this.createCardCatalogBanner();
    this.createWallClock();
    this.createArchiveFloor();
    this.createParticles();
    this.createReferenceDesk();
    this.createDeskDressing();
    this.createTrialCard();
    this.createReferenceCandle();
    this.createReferenceBookshelf();
    this.createBookPrepArea();
    this.createReferenceListStatePanel();
    this.createHUD();
    this.createBit();

    cam.fadeIn(700, 3, 3, 5);
    this.checkTutorial();
  }

  update(time, delta) {
    this.updateParticles(time, delta);
    this.updateWallSconceFlicker(time);
    this.updateWallClock(time);
    this.updateFlame(time);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // BACKGROUND / ARCHIVE INTERIOR (card-catalog station)
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l47_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l47_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x0a0704).setDepth(0);
  }

  createBackWall() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x0d0906, 1);
    g.fillRect(0, 0, W, 216);
    g.lineStyle(1, 0x241a0e, 0.3);
    for (let x = 0; x < W; x += 40) g.lineBetween(x, 0, x, 216);
    [420, 620].forEach((x) => {
      g.fillStyle(0x0a0704, 1);
      g.lineStyle(1, C_BRASS, 0.5);
      g.fillRoundedRect(x, 68, 70, 26, 2);
      g.strokeRoundedRect(x, 68, 70, 26, 2);
    });
  }

  createCardCatalogCabinet() {
    const g = this.add.graphics().setDepth(2);
    g.fillStyle(0x1a0e05, 1);
    g.lineStyle(2, 0x3a2618, 1);
    g.fillRoundedRect(60, 100, 200, 360, 4);
    g.strokeRoundedRect(60, 100, 200, 360, 4);
    this._drawerRects = [];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 2; col++) {
        const dx = 72 + col * 90, dy = 112 + row * 86;
        const drawer = this.add.graphics().setDepth(3);
        drawer.fillStyle(0x241a0e, 1);
        drawer.lineStyle(1, 0x3a2618, 0.6);
        drawer.fillRoundedRect(dx, dy, 82, 70, 3);
        drawer.strokeRoundedRect(dx, dy, 82, 70, 3);
        drawer.fillStyle(0x0a0704, 1);
        drawer.lineStyle(1, C_BRASS, 0.7);
        drawer.fillRoundedRect(dx + 21, dy + 24, 40, 8, 1);
        drawer.strokeRoundedRect(dx + 21, dy + 24, 40, 8, 1);
        drawer.fillStyle(C_BRASS, 0.7);
        drawer.fillCircle(dx + 41, dy + 44, 3);
        this._drawerRects.push({ g: drawer, x: dx, y: dy });
      }
    }
  }

  createWallSconce() {
    const g = this.add.graphics().setDepth(2);
    g.fillStyle(0x3a2618, 1);
    g.lineStyle(1, C_BRASS, 0.6);
    g.fillRoundedRect(42, 74, 16, 20, 3);
    g.strokeRoundedRect(42, 74, 16, 20, 3);
    this.sconceFlame = this.add.circle(50, 68, 5, 0xffa726, 0.5).setDepth(3);
    this.sconceHalo = this.add.circle(50, 68, 26, 0xffa726, 0.05).setDepth(2);
    this._sconceLevel = 1; // 1 = normal, 0 = dark, 2 = bright
  }

  updateWallSconceFlicker(time) {
    if (!this.sconceFlame || !this.sconceFlame.active) return;
    const base = this._sconceLevel === 0 ? 0.06 : this._sconceLevel === 2 ? 0.85 : 0.5;
    const t = time % 2800;
    const flick = t > 2650 ? base * Phaser.Math.FloatBetween(0.4, 0.8) : base;
    this.sconceFlame.setAlpha(flick);
    this.sconceHalo.setAlpha(base * 0.1);
  }

  createCardCatalogBanner() {
    const g = this.add.graphics().setDepth(2);
    g.fillStyle(0x0a0704, 1);
    g.lineStyle(1, C_BRASS, 0.5);
    g.fillRoundedRect(360, 70, 340, 26, 3);
    g.strokeRoundedRect(360, 70, 340, 26, 3);
    this.add.text(530, 83, "C A R D   C A T A L O G", { font: "bold 16px Georgia", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.7).setDepth(3);
  }

  createWallClock() {
    const ring = this.add.graphics().setDepth(2);
    ring.lineStyle(2, C_BRASS, 0.5);
    ring.strokeCircle(770, 82, 14);
    this.clockMinute = this.add.graphics().setDepth(2);
    this._clockStopped = false;
  }

  updateWallClock(time) {
    if (!this.clockMinute || this._clockStopped) return;
    const a = time * 0.00006;
    this.clockMinute.clear();
    this.clockMinute.lineStyle(1.5, C_BRASS, 0.35);
    this.clockMinute.lineBetween(770, 82, 770 + Math.cos(a - Math.PI / 2) * 10, 82 + Math.sin(a - Math.PI / 2) * 10);
  }

  createArchiveFloor() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x1a0e05, 1);
    g.fillRect(0, 635, W, 85);
    g.lineStyle(2, 0x3a2618, 1);
    g.lineBetween(0, 637, W, 637);
    g.lineStyle(1, 0x8a6435, 0.06);
    for (let i = 1; i <= 4; i++) g.strokeRoundedRect(440 - 160 + i * 6, 662 + i * 1.5, 320 - i * 12, 36 - i * 3, 6);
  }

  createParticles() {
    this.ambient = [];
    const colors = [0xc8a05a, 0x8a6435, 0xa89078];
    for (let i = 0; i < 7; i++) {
      this.ambient.push(this.add.circle(Phaser.Math.Between(0, W), Phaser.Math.Between(150, 630), 1, Phaser.Utils.Array.GetRandom(colors), Phaser.Math.FloatBetween(0.03, 0.05)).setDepth(2));
    }
    this._motesSettling = false;
  }

  updateParticles(time, delta) {
    if (!this.ambient) return;
    const step = (this._motesSettling ? 0.06 : 0.01) * (delta / 16.7);
    this.ambient.forEach((p, i) => {
      p.y += step;
      p.x += Math.sin(time * 0.0004 + i) * 0.03;
      if (p.y > 630) {
        if (this._motesSettling) { p.setAlpha(0); return; }
        p.y = 150; p.x = Phaser.Math.Between(0, W);
      }
    });
  }

  // ══════════════════════════════════════════════════════════════
  // REFERENCE DESK + TRIAL CARD
  // ══════════════════════════════════════════════════════════════

  createReferenceDesk() {
    const g = this.add.graphics().setDepth(4);
    g.fillStyle(0x241a0e, 1);
    g.lineStyle(3, 0x8a6435, 1);
    g.fillRoundedRect(DESK_X0, DESK_Y0, DESK_X1 - DESK_X0, DESK_Y1 - DESK_Y0, 8);
    g.strokeRoundedRect(DESK_X0, DESK_Y0, DESK_X1 - DESK_X0, DESK_Y1 - DESK_Y0, 8);
    g.lineStyle(1, 0x3a2618, 0.3);
    for (let y = DESK_Y0 + 10; y < DESK_Y1 - 6; y += 6) g.lineBetween(DESK_X0 + 6, y, DESK_X1 - 6, y);
    g.lineStyle(1, C_BRASS, 0.7);
    g.lineBetween(DESK_X0 + 4, DESK_Y0 + 2, DESK_X1 - 4, DESK_Y0 + 2);
  }

  createDeskDressing() {
    const g = this.add.graphics().setDepth(5);
    // ink bottle (bottom-left of desk)
    g.fillStyle(0x0a0704, 1);
    g.lineStyle(1, 0x3a2618, 0.6);
    g.fillRoundedRect(300, 420, 22, 26, 4);
    g.strokeRoundedRect(300, 420, 22, 26, 4);
    g.fillRect(308, 414, 6, 8);
    g.fillStyle(C_BRASS, 0.5);
    g.fillRect(307, 412, 8, 3);
    // quill leaning beside it
    g.lineStyle(1.5, C_BRASS, 0.4);
    g.lineBetween(330, 444, 352, 418);
    g.fillStyle(C_BRASS, 0.3);
    g.fillTriangle(348, 414, 358, 420, 350, 424);
    // small stack of unfiled cards
    for (let i = 0; i < 5; i++) {
      g.fillStyle(0xe0d6b8, 0.3);
      g.fillRect(374 + (i % 2) * 2, 440 - i * 3.5, 20, 3);
    }
  }

  createTrialCard() {
    const g = this.add.graphics().setDepth(6);
    g.fillStyle(0xe0d6b8, 1);
    g.lineStyle(2, 0x8a6435, 1);
    g.fillRoundedRect(CARD_X0, CARD_Y0, CARD_X1 - CARD_X0, CARD_Y1 - CARD_Y0, 4);
    g.strokeRoundedRect(CARD_X0, CARD_Y0, CARD_X1 - CARD_X0, CARD_Y1 - CARD_Y0, 4);
    g.lineStyle(1, 0x8a6435, 0.15);
    for (let y = CARD_Y0 + 30; y < CARD_Y1 - 10; y += 20) g.lineBetween(CARD_X0 + 10, y, CARD_X1 - 10, y);
    this.cardLabel = this.add.text(CARD_X1 - 10, CARD_Y0 + 8, "", { font: "bold 11px Courier New", color: "#8a6435" }).setOrigin(1, 0).setAlpha(0.7).setDepth(7);
    this.cardQuestionText = this.add.text(CARD_CX, CARD_Y1 - 16, "", { font: "14px Georgia", color: "#241a0e" }).setOrigin(0.5).setDepth(7);
    this.cardContainer = this.add.container(0, 0).setDepth(7);
  }

  clearCard() { this.cardContainer.removeAll(true); this.cardQuestionText.setText(""); }

  /** Dark-on-cream syntax tokenizer for the index card. */
  _cardTokenize(line) {
    const tokens = [];
    const re = /("(?:[^"\\]|\\.)*")|(\bArrayList\b)|(<\w*>)|(\bnew\b)|(\.add\b)|(-?\d+\.?\d*)|([(){};,=.])/g;
    let last = 0, m;
    const plain = (t) => t && tokens.push({ t, c: "#241a0e" });
    while ((m = re.exec(line))) {
      if (m.index > last) plain(line.slice(last, m.index));
      if (m[1]) tokens.push({ t: m[1], c: "#d84315" });
      else if (m[2]) tokens.push({ t: m[2], c: "#1565c0" });
      else if (m[3]) tokens.push({ t: m[3], c: "#e65100" });
      else if (m[4]) tokens.push({ t: m[4], c: "#1565c0" });
      else if (m[5]) tokens.push({ t: m[5], c: "#1565c0" });
      else if (m[6]) tokens.push({ t: m[6], c: "#e65100" });
      else if (m[7]) tokens.push({ t: m[7], c: /[()]/.test(m[7]) ? "#c62828" : "#78909c" });
      last = m.index + m[0].length;
    }
    if (last < line.length) plain(line.slice(last));
    return tokens.length ? tokens : [{ t: line, c: "#241a0e" }];
  }

  showTrialOnCard(lines, questionText) {
    this.clearCard();
    const maxLen = Math.max(...lines.map((l) => l.length));
    const fontSize = maxLen > 40 ? 10 : maxLen > 34 ? 11 : 13;
    const lineH = fontSize + 10;
    const startY = CARD_CY - 20 - ((lines.length - 1) * lineH) / 2;
    lines.forEach((line, i) => {
      const y = startY + i * lineH;
      if (line.trim().startsWith("//")) {
        const t = this.add.text(CARD_CX, y, line, { font: `italic ${fontSize}px Courier New`, color: "#78909c" }).setOrigin(0.5).setAlpha(0);
        this.cardContainer.add(t);
        this.tweens.add({ targets: t, alpha: 1, duration: 180 });
        return;
      }
      const tokens = this._cardTokenize(line);
      const measured = tokens.map((tk) => { const tmp = this.add.text(0, 0, tk.t, { font: `bold ${fontSize}px Courier New` }); const w = tmp.width; tmp.destroy(); return w; });
      const totalW = measured.reduce((a, b) => a + b, 0);
      let x = CARD_CX - totalW / 2;
      tokens.forEach((tok, ti) => {
        const t = this.add.text(x, y, tok.t, { font: `bold ${fontSize}px Courier New`, color: tok.c }).setOrigin(0, 0.5).setAlpha(0);
        this.cardContainer.add(t);
        this.tweens.add({ targets: t, alpha: 1, duration: 180 });
        x += measured[ti];
      });
    });
    if (questionText) this.cardQuestionText.setText(questionText);
    this.cardLabel.setText(`CARD ${this.currentRound + 1}/15`);
  }

  async stampTrialCard(kind) {
    const labels = { cataloged: "CATALOGED", miscataloged: "MISCATALOGED", timeout: "OUT OF TIME" };
    const colors = { cataloged: HEX_GREEN_BRIGHT, miscataloged: HEX_RED, timeout: HEX_RED };
    const stamp = this.add.text(CARD_CX, CARD_CY, labels[kind], { font: "bold 24px Georgia", color: colors[kind] }).setOrigin(0.5).setDepth(30).setScale(1.4).setAngle(-8).setAlpha(0);
    this.cardContainer.add(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 180 });
    const hold = kind === "timeout" ? 1800 : 700;
    await this.delay(hold);
    if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 200, onComplete: () => stamp.destroy() });
  }

  // ══════════════════════════════════════════════════════════════
  // THE REFERENCE CANDLE (THE TIMER)
  // ══════════════════════════════════════════════════════════════

  createReferenceCandle() {
    // brass holder — static
    const g = this.add.graphics().setDepth(6);
    g.fillStyle(0x8a6435, 1);
    g.lineStyle(2, C_BRASS, 1);
    g.fillEllipse(CANDLE_X, CANDLE_BASE_Y + 14, 48, 10);
    g.strokeEllipse(CANDLE_X, CANDLE_BASE_Y + 14, 48, 10);
    g.fillStyle(C_BRASS, 1);
    g.lineStyle(1, 0x8a6435, 1);
    g.fillRoundedRect(CANDLE_X - 6, CANDLE_BASE_Y - 2, 12, 18, 3);
    g.strokeRoundedRect(CANDLE_X - 6, CANDLE_BASE_Y - 2, 12, 18, 3);
    [-22, -11, 11, 22].forEach((dx) => { g.fillStyle(C_BRASS, 0.8); g.fillCircle(CANDLE_X + dx, CANDLE_BASE_Y + 14, 1.5); });

    this.waxGfx = this.add.graphics().setDepth(7);
    this.flameGfx = this.add.graphics().setDepth(8);
    this.haloGfx = this.add.graphics().setDepth(5);
    this._burnProgress = 0;
    this._candleLit = true;
    this._dripSeeds = [Phaser.Math.FloatBetween(0.2, 0.45), Phaser.Math.FloatBetween(0.55, 0.85)];
    this._drawWax();
  }

  _waxTopY() { return CANDLE_BASE_Y - CANDLE_FULL_H * (1 - this._burnProgress); }

  _drawWax() {
    const h = CANDLE_FULL_H * (1 - this._burnProgress);
    this.waxGfx.clear();
    if (h <= 2) return;
    const topY = CANDLE_BASE_Y - h;
    this.waxGfx.fillStyle(0xe0d6b8, 1);
    this.waxGfx.lineStyle(1, 0x8a6435, 0.5);
    this.waxGfx.fillRoundedRect(CANDLE_X - CANDLE_W / 2, topY, CANDLE_W, h, 2);
    this.waxGfx.strokeRoundedRect(CANDLE_X - CANDLE_W / 2, topY, CANDLE_W, h, 2);
    // wax drips along the sides
    this._dripSeeds.forEach((seed, i) => {
      const dy = topY + h * seed;
      if (dy < CANDLE_BASE_Y - 6) {
        this.waxGfx.lineStyle(2, 0xe8dfc8, 0.6);
        const dx = i === 0 ? CANDLE_X - CANDLE_W / 2 + 2 : CANDLE_X + CANDLE_W / 2 - 2;
        this.waxGfx.lineBetween(dx, dy, dx, Math.min(dy + 10, CANDLE_BASE_Y - 2));
      }
    });
  }

  /** Per-frame flame + halo rendering with jitter, driven entirely by the
   * burn tween's progress. No parallel clock. */
  updateFlame(time) {
    if (!this.flameGfx) return;
    this.flameGfx.clear();
    this.haloGfx.clear();
    if (!this._candleLit) return;

    const remaining = 1 - this._burnProgress;
    let outerColor = 0xffa726, scale = 1, haloAlpha = 0.05, jitterAmp = 0.15;
    if (this._flamePaused) { scale = 1.05; jitterAmp = 0.04; }
    else if (remaining <= 0.15) { outerColor = 0xe65100; scale = 0.4; haloAlpha = 0.01; jitterAmp = 0.4; }
    else if (remaining <= 0.33) { outerColor = 0xff9800; scale = 0.8; haloAlpha = 0.03; jitterAmp = 0.25; }

    const topY = this._waxTopY();
    const jx = Phaser.Math.FloatBetween(-1, 1) * (jitterAmp > 0.2 ? 1.5 : 1);
    const js = 1 + Phaser.Math.FloatBetween(-jitterAmp, jitterAmp);
    const fw = 16 * scale * js, fh = 24 * scale * js;
    const fx = CANDLE_X + jx, fy = topY - fh / 2 - 2;

    this.haloGfx.fillStyle(0xffa726, haloAlpha);
    this.haloGfx.fillCircle(fx, fy, 90 * Math.max(0.4, scale));

    // wick
    this.flameGfx.lineStyle(1, 0x241a0e, 1);
    this.flameGfx.lineBetween(CANDLE_X, topY, CANDLE_X, topY - 3);
    // outer teardrop (approximated: ellipse body + triangle tip)
    this.flameGfx.fillStyle(outerColor, 0.85);
    this.flameGfx.fillEllipse(fx, fy + fh * 0.12, fw, fh * 0.75);
    this.flameGfx.fillTriangle(fx - fw * 0.3, fy, fx + fw * 0.3, fy, fx, fy - fh * 0.55);
    // inner core
    this.flameGfx.fillStyle(0xfff9c4, 0.9);
    this.flameGfx.fillEllipse(fx, fy + fh * 0.18, fw * 0.55, fh * 0.5);

    // urgency side-effects (smoke, shudder) — driven off the same progress
    if (!this._flamePaused && remaining <= 0.33) {
      const interval = remaining <= 0.15 ? 200 : 500;
      if (time - this._lastWispTime > interval) {
        this._lastWispTime = time;
        this.spawnSmokeWisp(fx, fy - fh);
        if (remaining <= 0.15 && Phaser.Math.Between(0, 100) < 30) this.cameras.main.shake(60, 0.0012);
      }
    }
  }

  spawnSmokeWisp(x, y) {
    const w = this.add.circle(x, y, 2, 0x9e9e9e, 0.35).setDepth(9);
    this.tweens.add({ targets: w, y: y - 30, x: x + Phaser.Math.Between(-6, 6), alpha: 0, duration: 700, onComplete: () => w.destroy() });
  }

  startCandleBurn(timeLimitMs, onTimeout) {
    this._killBurnTween();
    this.roundTimeLimit = timeLimitMs;
    this._burnProgress = 0;
    this._candleLit = true;
    this._flamePaused = false;
    this._drawWax();
    const state = { v: 0 };
    this._burnTween = this.tweens.add({
      targets: state, v: 1, duration: timeLimitMs, ease: "Linear",
      onUpdate: () => { this._burnProgress = state.v; this._drawWax(); },
      onComplete: () => { if (this._alive) onTimeout(); },
    });
  }

  _killBurnTween() {
    if (this._burnTween) { this._burnTween.stop(); this._burnTween = null; }
  }

  pauseCandle() {
    if (this._burnTween) this._burnTween.pause();
    this._flamePaused = true;
  }

  getTimePctUsed() {
    const elapsed = this.time.now - this.roundStartTime;
    return Phaser.Math.Clamp(elapsed / this.roundTimeLimit, 0, 1);
  }

  /** Timeout choreography: violent flicker → flame out → smoke puff. */
  async candleFlameOut() {
    this._killBurnTween();
    this._burnProgress = 1;
    this._drawWax();
    this._flamePaused = true; // freeze jitter into the big flicker
    // one violent large flicker
    const topY = this._waxTopY();
    const big = this.add.graphics().setDepth(9);
    big.fillStyle(0xffa726, 0.9);
    big.fillEllipse(CANDLE_X, topY - 18, 24, 36);
    big.fillStyle(0xfff9c4, 0.9);
    big.fillEllipse(CANDLE_X, topY - 14, 13, 20);
    await this.delay(100);
    big.destroy();
    this._candleLit = false;
    const p = this.add.particles(CANDLE_X, topY - 8, "l47_dot", {
      speed: { min: 20, max: 70 }, angle: { min: 240, max: 300 }, scale: { start: 0.7, end: 0 }, lifespan: 800,
      tint: [0x9e9e9e, 0x757575], alpha: { start: 0.5, end: 0 }, emitting: false,
    }).setDepth(9);
    p.explode(10);
    this.time.delayedCall(900, () => p.destroy());
    // the darkness closes in — sconce flickers dim
    const prevLevel = this._sconceLevel;
    this._sconceLevel = 0;
    this.time.delayedCall(800, () => { if (this._alive && !this.gameEnded) this._sconceLevel = prevLevel; });
  }

  async relightCandle(fullWax) {
    if (fullWax) { this._burnProgress = 0; this._drawWax(); }
    this._candleLit = true;
    this._flamePaused = true; // steady bright flame
    const topY = this._waxTopY();
    const p = this.add.particles(CANDLE_X, topY - 10, "l47_dot", {
      speed: { min: 15, max: 45 }, angle: { min: 0, max: 360 }, scale: { start: 0.4, end: 0 }, lifespan: 250,
      tint: [0xffa726, 0xfff9c4], emitting: false,
    }).setDepth(9);
    p.explode(6);
    this.time.delayedCall(350, () => p.destroy());
  }

  // ══════════════════════════════════════════════════════════════
  // COMPACT REFERENCE BOOKSHELF (L46 machinery, reduced scale)
  // ══════════════════════════════════════════════════════════════

  createReferenceBookshelf() {
    const g = this.add.graphics().setDepth(4);
    g.fillStyle(0x241a0e, 1);
    g.lineStyle(2, 0x3a2618, 1);
    g.fillRect(SHELF_X0, SHELF_Y0, 12, SHELF_Y1 - SHELF_Y0);
    g.strokeRect(SHELF_X0, SHELF_Y0, 12, SHELF_Y1 - SHELF_Y0);
    g.fillRect(SHELF_X1 - 12, SHELF_Y0, 12, SHELF_Y1 - SHELF_Y0);
    g.strokeRect(SHELF_X1 - 12, SHELF_Y0, 12, SHELF_Y1 - SHELF_Y0);
    g.fillRect(SHELF_X0, SHELF_Y0, SHELF_X1 - SHELF_X0, 16);
    g.fillRect(SHELF_X0, SHELF_Y1 - 16, SHELF_X1 - SHELF_X0, 16);
    this.shelfFrameGfx = g;

    const stampBg = this.add.graphics().setDepth(5);
    stampBg.fillStyle(0x0a0704, 1);
    stampBg.lineStyle(1, C_BRASS, 1);
    stampBg.fillRoundedRect(SHELF_X0 + 16, 96, 118, 20, 3);
    stampBg.strokeRoundedRect(SHELF_X0 + 16, 96, 118, 20, 3);
    this.typeStampText = this.add.text(SHELF_X0 + 75, 106, "", { font: "bold 11px Courier New", color: HEX_CYAN }).setOrigin(0.5).setDepth(6);

    const sizeBg = this.add.graphics().setDepth(5);
    sizeBg.fillStyle(0x0a0704, 1);
    sizeBg.lineStyle(1, C_BRASS, 0.6);
    sizeBg.fillRoundedRect(SHELF_X1 - 76, 96, 62, 20, 10);
    sizeBg.strokeRoundedRect(SHELF_X1 - 76, 96, 62, 20, 10);
    this.sizeCounterText = this.add.text(SHELF_X1 - 45, 106, "size: 0", { font: "bold 12px Courier New", color: HEX_BRASS }).setOrigin(0.5).setDepth(6);

    this.shelfLedges = [];
    this.shelfIndexPlates = [];
    for (let i = 0; i < 8; i++) {
      const y = SHELF_BASE_Y - i * SHELF_STEP;
      const ledgeG = this.add.graphics().setDepth(4);
      ledgeG.fillStyle(0x3a2618, 0.6);
      ledgeG.lineStyle(1, 0x8a6435, 0.4);
      ledgeG.fillRoundedRect(SHELF_CX - 78, y - 19, 156, 38, 3);
      ledgeG.strokeRoundedRect(SHELF_CX - 78, y - 19, 156, 38, 3);

      const plateG = this.add.graphics().setDepth(6);
      this._drawIndexPlate(plateG, y, false);
      const idxText = this.add.text(SHELF_X0 + 22, y, String(i), { font: "bold 14px Courier New", color: HEX_GRAY }).setOrigin(0.5).setDepth(7);

      this.shelfLedges.push({ y, ledgeG });
      this.shelfIndexPlates.push({ g: plateG, text: idxText, y });
    }
  }

  _drawIndexPlate(plateG, y, flare) {
    plateG.clear();
    plateG.fillStyle(0x0a0704, 1);
    plateG.lineStyle(1, flare ? C_RED : C_BRASS, flare ? 1 : 0.7);
    plateG.fillRoundedRect(SHELF_X0 + 12, y - 7, 20, 14, 2);
    plateG.strokeRoundedRect(SHELF_X0 + 12, y - 7, 20, 14, 2);
  }

  setShelfType(listType) {
    this.currentListType = listType;
    const colorMap = { String: HEX_CYAN, Integer: HEX_GOLD, Double: HEX_ORANGE, Character: HEX_CYAN, Boolean: HEX_VIOLET };
    this.typeStampText.setText(`ArrayList<${listType}>`).setColor(colorMap[listType] || HEX_CYAN);
    if (this.typeEchoText) this.typeEchoText.setText(`<${listType}>`).setColor(colorMap[listType] || HEX_GRAY);
  }

  _typeColorHex(type) {
    switch (type) {
      case "string": return HEX_CYAN;
      case "int": return HEX_GOLD;
      case "double": return HEX_ORANGE;
      case "char": return HEX_CYAN;
      case "boolean": return HEX_VIOLET;
      default: return HEX_GRAY;
    }
  }
  _typeColorInt(type) {
    switch (type) {
      case "string": return C_CYAN;
      case "int": return C_GOLD;
      case "double": return C_ORANGE;
      case "char": return C_CYAN;
      case "boolean": return C_VIOLET;
      default: return C_GRAY;
    }
  }
  _displayValueOnSpine(entry) {
    if (entry.type === "string") return `"${entry.value}"`;
    if (entry.type === "boolean") return entry.value ? "true" : "false";
    return String(entry.value);
  }
  _displayValueInPanel(entry) {
    if (entry.type === "boolean") return entry.value ? "true" : "false";
    return String(entry.value);
  }
  _typeMatchesShelf(argType, listType) {
    const map = { String: "string", Integer: "int", Double: "double", Character: "char", Boolean: "boolean" };
    return map[listType] === argType;
  }

  _shelfY(idx) { return SHELF_BASE_Y - Math.min(idx, 7) * SHELF_STEP; }

  clearShelf() {
    this.shelfBookSprites.forEach((b) => b.container.destroy());
    this.shelfBookSprites = [];
    this.currentList = [];
    this.updateSizeCounter(false);
    this.updateListStatePanel();
    this.shelfIndexPlates.forEach((p) => { this._drawIndexPlate(p.g, p.y, false); p.text.setColor(HEX_GRAY); });
  }

  updateSizeCounter(pulse = true) {
    this.sizeCounterText.setText(`size: ${this.currentList.length}`);
    if (pulse) this.tweens.add({ targets: this.sizeCounterText, scale: 1.3, duration: 110, yoyo: true });
  }

  _recolorPlates() {
    this.shelfIndexPlates.forEach((p, i) => {
      const entry = this.currentList[i];
      p.text.setColor(entry ? this._typeColorHex(entry.type) : HEX_GRAY);
    });
  }

  // ── Book prep + visuals ──

  _makeBookVisual(entry, x, y) {
    const color = this._typeColorInt(entry.type);
    const colorHex = this._typeColorHex(entry.type);
    const display = this._displayValueOnSpine(entry);
    const c = this.add.container(x, y).setDepth(8);
    const g = this.add.graphics();
    g.fillStyle(color, 0.85);
    g.lineStyle(2, Phaser.Display.Color.IntegerToColor(color).darken(30).color, 1);
    g.fillRoundedRect(-24, -16, 48, 32, 2);
    g.strokeRoundedRect(-24, -16, 48, 32, 2);
    g.lineStyle(1, 0xffffff, 0.4);
    g.lineBetween(-22, -14, 22, -14);
    g.lineBetween(-22, 14, 22, 14);
    const useVertical = display.length > 4;
    const txt = this.add.text(0, 0, display, { font: "bold 12px Georgia", color: "#0a0704" }).setOrigin(0.5);
    if (useVertical) txt.setAngle(-90);
    if (txt.width > 30 && useVertical) txt.setFontSize(8);
    const label = this.add.text(0, 22, "", { font: "bold 9px Courier New", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.6);
    c.add([g, txt, label]);
    return { container: c, text: txt, label, colorHex, entry };
  }

  createBookPrepArea() {
    const g = this.add.graphics().setDepth(4);
    g.fillStyle(0x241a0e, 1);
    g.lineStyle(1, 0x8a6435, 0.5);
    g.fillRoundedRect(PREP_X0, PREP_Y0, PREP_W, PREP_H, 4);
    g.strokeRoundedRect(PREP_X0, PREP_Y0, PREP_W, PREP_H, 4);
    this.add.text(PREP_X0 + 6, PREP_Y0 + 4, "NEW ENTRY", { font: "bold 10px Georgia", color: HEX_BRASS }).setAlpha(0.7).setDepth(5);
    this.prepContainer = this.add.container(0, 0).setDepth(8);
  }

  clearPrep() { this.prepContainer.removeAll(true); }

  async createBookInPrep(entry) {
    // NOTE: the book lives directly on the scene (depth set in
    // _makeBookVisual), NOT inside prepContainer — earlier books that
    // already settled on shelves must survive the next book's arrival.
    const x = PREP_X0 + 55, y = PREP_Y0 + 26;
    const book = this._makeBookVisual(entry, x, y);
    book.container.setAlpha(0).setScale(0.6);
    await new Promise((res) => { this.tweens.add({ targets: book.container, alpha: 1, scale: 1, duration: 140, ease: "Back.easeOut", onComplete: res }); });
    return book;
  }

  // ── Append choreography (single-arg add) — 1.4× L46 tempo ──

  async addBookToShelf(entry) {
    const book = await this.createBookInPrep(entry);
    if (!this._alive) return { ok: true };

    const targetOk = this._typeMatchesShelf(entry.type, this.currentListType);
    const idx = this.currentList.length;
    const targetY = this._shelfY(idx);

    await new Promise((res) => {
      this.tweens.add({ targets: book.container, x: SHELF_CX, y: targetY - 50, angle: Phaser.Math.Between(-3, 3), duration: 250, ease: "Sine.easeInOut", onComplete: res });
    });
    if (!this._alive) return { ok: true };

    if (!targetOk) return await this.rejectBook(book, idx);

    await this._settleBook(book, idx, targetY);
    return { ok: true };
  }

  async _settleBook(book, idx, targetY) {
    const plate = this.shelfIndexPlates[Math.min(idx, 7)];
    if (plate) {
      this.tweens.add({ targets: plate.text, scale: 1.5, duration: 120, yoyo: true });
      plate.text.setColor(book.colorHex);
    }
    await new Promise((res) => {
      this.tweens.add({ targets: book.container, y: targetY, angle: 0, duration: 140, ease: "Sine.easeIn", onComplete: res });
    });
    this.tweens.add({ targets: book.container, y: targetY - 2, duration: 50, yoyo: true });
    book.label.setText(`[${idx}]`);

    const p = this.add.particles(SHELF_CX, targetY + 16, "l47_dot", { speed: { min: 25, max: 60 }, angle: { min: 200, max: 340 }, scale: { start: 0.4, end: 0 }, lifespan: 180, tint: [this._typeColorInt(book.entry.type)], emitting: false }).setDepth(9);
    p.explode(4);
    this.time.delayedCall(260, () => p.destroy());

    this.currentList.splice(idx, 0, book.entry);
    this.shelfBookSprites.splice(idx, 0, book);
    this._recolorPlates();
    this.updateSizeCounter();
    this.updateListStatePanel();
    await this.delay(60);
  }

  // ── Insertion choreography (two-arg add, valid index) — NEW for L47 ──

  async insertBookAtIndex(entry, index) {
    const book = await this.createBookInPrep(entry);
    if (!this._alive) return { ok: true };

    const targetY = this._shelfY(index);

    // cyan insertion glow on the target shelf
    const glow = this.add.graphics().setDepth(5);
    glow.fillStyle(C_CYAN, 0.25);
    glow.fillRoundedRect(SHELF_CX - 78, targetY - 19, 156, 38, 3);
    const plate = this.shelfIndexPlates[Math.min(index, 7)];
    if (plate) this.tweens.add({ targets: plate.text, scale: 1.6, duration: 150, yoyo: true });
    this.tweens.add({ targets: glow, alpha: 0, duration: 500, delay: 200, onComplete: () => glow.destroy() });

    // book flies toward the target shelf
    const flight = new Promise((res) => {
      this.tweens.add({ targets: book.container, x: SHELF_CX, y: targetY - 50, angle: Phaser.Math.Between(-3, 3), duration: 250, ease: "Sine.easeInOut", onComplete: res });
    });

    // books at >= index slide UP one shelf simultaneously to make room
    const shifting = this.shelfBookSprites.slice(index);
    const shiftPromise = new Promise((res) => {
      if (shifting.length === 0) { res(); return; }
      let done = 0;
      shifting.forEach((b, k) => {
        const newIdx = index + k + 1;
        this.tweens.add({
          targets: b.container, y: this._shelfY(newIdx), duration: 300, ease: "Sine.easeOut",
          onComplete: () => { b.label.setText(`[${newIdx}]`); if (++done === shifting.length) res(); },
        });
      });
    });
    await Promise.all([flight, shiftPromise]);
    if (!this._alive) return { ok: true };

    await this._settleBook(book, index, targetY);
    return { ok: true };
  }

  // ── Wrong-type rejection (compile error) — as L46 ──

  async rejectBook(book, idx) {
    const plate = this.shelfIndexPlates[Math.min(idx, 7)];
    if (plate) {
      plate.text.setColor(HEX_RED);
      this.tweens.add({ targets: plate.g, alpha: 0.3, duration: 100, yoyo: true, repeat: 2 });
      this.time.delayedCall(900, () => { if (plate.text.active) { plate.text.setColor(HEX_GRAY); this._recolorPlates(); } });
    }
    await new Promise((res) => {
      this.tweens.add({ targets: book.container, x: book.container.x - 35, y: book.container.y - 18, angle: -20, duration: 180, ease: "Cubic.easeOut", onComplete: res });
    });
    const p = this.add.particles(book.container.x, book.container.y, "l47_dot", { speed: { min: 45, max: 110 }, angle: { min: 0, max: 360 }, scale: { start: 0.6, end: 0 }, lifespan: 230, tint: [0xf44336], emitting: false }).setDepth(9);
    p.explode(8);
    book.container.destroy();
    this.time.delayedCall(300, () => p.destroy());

    const stamp = this.add.text(SHELF_CX, SHELF_Y0 + 50, "TYPE MISMATCH", { font: "bold 14px Courier New", color: HEX_RED }).setOrigin(0.5).setAngle(-8).setAlpha(0).setDepth(20);
    this.tweens.add({ targets: stamp, alpha: 1, duration: 130 });
    this.screenShake(0.005, 160);
    this.time.delayedCall(1400, () => { if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 200, onComplete: () => stamp.destroy() }); });
    this.showCompileErrorStamp();
    await this.delay(250);
    return { ok: false, crash: "type_mismatch" };
  }

  // ── Invalid-index rejection (IndexOutOfBoundsException) — NEW for L47 ──

  async rejectInvalidIndex(entry, targetIndex) {
    const book = await this.createBookInPrep(entry);
    if (!this._alive) return { ok: false, crash: "ioobe" };

    // the target shelf's plate flares red BEFORE the book arrives
    const plate = this.shelfIndexPlates[Math.min(targetIndex, 7)];
    if (plate) {
      plate.text.setColor(HEX_RED);
      this._drawIndexPlate(plate.g, plate.y, true);
      this.tweens.add({ targets: [plate.g, plate.text], alpha: 0.3, duration: 100, yoyo: true, repeat: 3 });
    }
    await this.delay(250);
    if (!this._alive) return { ok: false, crash: "ioobe" };

    // book launches, bounces back mid-flight, dissolves
    await new Promise((res) => {
      this.tweens.add({ targets: book.container, x: SHELF_CX, y: (PREP_Y0 + this._shelfY(Math.min(targetIndex, 7))) / 2, duration: 180, ease: "Sine.easeOut", onComplete: res });
    });
    await new Promise((res) => {
      this.tweens.add({ targets: book.container, x: book.container.x - 30, y: book.container.y + 30, angle: -25, duration: 180, ease: "Cubic.easeIn", onComplete: res });
    });
    const p = this.add.particles(book.container.x, book.container.y, "l47_dot", { speed: { min: 45, max: 110 }, angle: { min: 0, max: 360 }, scale: { start: 0.6, end: 0 }, lifespan: 230, tint: [0xf44336], emitting: false }).setDepth(9);
    p.explode(8);
    book.container.destroy();
    this.time.delayedCall(300, () => p.destroy());

    const stamp = this.add.text(SHELF_CX, SHELF_Y0 + 50, "IndexOutOfBoundsException", { font: "bold 12px Courier New", color: HEX_RED }).setOrigin(0.5).setAngle(-6).setAlpha(0).setDepth(20);
    this.tweens.add({ targets: stamp, alpha: 1, duration: 130 });
    this.screenShake(0.005, 160);
    this.time.delayedCall(1600, () => { if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 200, onComplete: () => stamp.destroy() }); });
    if (plate) this.time.delayedCall(1000, () => { if (plate.text.active) { this._drawIndexPlate(plate.g, plate.y, false); plate.g.setAlpha(1); plate.text.setAlpha(1); this._recolorPlates(); } });
    await this.delay(400);
    return { ok: false, crash: "ioobe" };
  }

  showCompileErrorStamp() {
    const stamp = this.add.text(CARD_CX, CARD_Y0 - 14, "COMPILE ERROR", { font: "bold 18px Arial", color: HEX_RED }).setOrigin(0.5).setDepth(30).setScale(1.4).setAngle(-6).setAlpha(0);
    this.roundElements.push(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 160 });
    this.time.delayedCall(1000, () => { if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 200, onComplete: () => stamp.destroy() }); });
  }

  // ══════════════════════════════════════════════════════════════
  // LIST STATE PANEL (compact)
  // ══════════════════════════════════════════════════════════════

  createReferenceListStatePanel() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0d0805, 1);
    g.lineStyle(2, C_BRASS, 1);
    g.fillRoundedRect(PANEL_X, PANEL_Y, PANEL_W, PANEL_H, 8);
    g.strokeRoundedRect(PANEL_X, PANEL_Y, PANEL_W, PANEL_H, 8);
    const header = this.add.graphics().setDepth(11);
    header.fillStyle(0x1a0e05, 1);
    header.fillRoundedRect(PANEL_X, PANEL_Y, PANEL_W, 30, { tl: 8, tr: 8, bl: 0, br: 0 });
    this.add.text(PANEL_X + 10, PANEL_Y + 15, "LIST STATE", { font: "bold 12px Georgia", color: HEX_BRASS }).setOrigin(0, 0.5).setDepth(12);
    this.syncDot = this.add.circle(PANEL_X + PANEL_W - 14, PANEL_Y + 15, 3, C_GREEN_BRIGHT, 0.7).setDepth(12);
    this.tweens.add({ targets: this.syncDot, alpha: 0.3, duration: 700, yoyo: true, repeat: -1 });

    this.typeEchoText = this.add.text(PANEL_X + PANEL_W - 10, PANEL_Y + 44, "", { font: "bold 11px Courier New", color: HEX_GRAY }).setOrigin(1, 0.5).setAlpha(0.6).setDepth(12);
    this.bracketText = this.add.text(PANEL_X + PANEL_W / 2, PANEL_Y + 130, "[]", { font: "bold 15px Courier New", color: HEX_GRAY, wordWrap: { width: PANEL_W - 24 }, align: "center" }).setOrigin(0.5).setDepth(12);
    this.panelSizeText = this.add.text(PANEL_X + PANEL_W / 2, PANEL_Y + 200, "size: 0", { font: "12px Courier New", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.85).setDepth(12);
    this.panelIndexText = this.add.text(PANEL_X + PANEL_W / 2, PANEL_Y + 224, "", { font: "bold 11px Courier New", color: "#8a6435", wordWrap: { width: PANEL_W - 24 }, align: "center" }).setOrigin(0.5).setAlpha(0.7).setDepth(12);
  }

  updateListStatePanel() {
    if (this.currentList.length === 0) {
      this.bracketText.setText("[]").setColor(HEX_GRAY);
      this.panelSizeText.setText("size: 0");
      this.panelIndexText.setText("");
      return;
    }
    const parts = this.currentList.map((e) => this._displayValueInPanel(e));
    this.bracketText.setText(`[${parts.join(", ")}]`).setColor("#e8dfc8");
    this.panelSizeText.setText(`size: ${this.currentList.length}`);
    this.panelIndexText.setText(this.currentList.map((_, i) => `[${i}]`).join(" "));
    this.tweens.add({ targets: this.bracketText, scale: 1.06, duration: 110, yoyo: true });
  }

  // ══════════════════════════════════════════════════════════════
  // EVALUATOR — honest ArrayList interpreter with add(index, element)
  // ══════════════════════════════════════════════════════════════

  _splitArgs(argsStr) {
    const parts = [];
    let cur = "", inQuotes = false;
    for (let i = 0; i < argsStr.length; i++) {
      const ch = argsStr[i];
      if (ch === '"' && argsStr[i - 1] !== "\\") inQuotes = !inQuotes;
      if (ch === "," && !inQuotes) { parts.push(cur.trim()); cur = ""; continue; }
      cur += ch;
    }
    const last = cur.trim();
    if (last || parts.length) parts.push(last);
    return parts.filter((p) => p !== "");
  }

  _evalAddArg(argExpr, listType) {
    const trimmed = argExpr.trim();
    if (/^".*"$/.test(trimmed)) {
      if (listType !== "String") return { ok: false, crash: "type_mismatch" };
      return { ok: true, value: trimmed.slice(1, -1), type: "string" };
    }
    if (/^-?\d+\.\d+$/.test(trimmed)) {
      if (listType !== "Double") return { ok: false, crash: "type_mismatch" };
      return { ok: true, value: parseFloat(trimmed), type: "double" };
    }
    if (/^-?\d+$/.test(trimmed)) {
      if (listType !== "Integer") return { ok: false, crash: "type_mismatch" };
      return { ok: true, value: parseInt(trimmed, 10), type: "int" };
    }
    if (trimmed === "true" || trimmed === "false") {
      if (listType !== "Boolean") return { ok: false, crash: "type_mismatch" };
      return { ok: true, value: trimmed === "true", type: "boolean" };
    }
    if (/^'.'$/.test(trimmed)) {
      if (listType !== "Character") return { ok: false, crash: "type_mismatch" };
      return { ok: true, value: trimmed[1], type: "char" };
    }
    return { ok: false, crash: "malformed" };
  }

  _guessedType(argExpr) {
    const trimmed = argExpr.trim();
    if (/^".*"$/.test(trimmed)) return "string";
    if (/^-?\d+\.\d+$/.test(trimmed)) return "double";
    if (/^-?\d+$/.test(trimmed)) return "int";
    if (trimmed === "true" || trimmed === "false") return "boolean";
    return "string";
  }

  _guessedValue(argExpr) {
    const trimmed = argExpr.trim();
    if (/^".*"$/.test(trimmed)) return trimmed.slice(1, -1);
    if (/^-?\d+\.\d+$/.test(trimmed)) return parseFloat(trimmed);
    if (/^-?\d+$/.test(trimmed)) return parseInt(trimmed, 10);
    if (trimmed === "true" || trimmed === "false") return trimmed === "true";
    return trimmed;
  }

  /** Parses+executes an ArrayList<T> program line by line, honestly
   * mutating this.currentList only on genuine successful adds/inserts.
   * Handles BOTH add(element) and add(index, element). Type checks
   * ("compile time") come before index validation ("runtime"), matching
   * javac's ordering. */
  async runProgram(sourceLines) {
    for (const rawLine of sourceLines) {
      if (!this._alive) return { ok: true };
      const line = rawLine.trim();
      if (!line || line.startsWith("//")) continue;
      const declMatch = line.match(/^ArrayList<(\w+)>\s+\w+\s*=\s*new ArrayList<>\(\);$/);
      if (declMatch) { this.setShelfType(declMatch[1]); continue; }
      const addMatch = line.match(/^\w+\.add\((.*)\);$/);
      if (addMatch) {
        const args = this._splitArgs(addMatch[1]);
        if (args.length === 1) {
          const evalResult = this._evalAddArg(args[0], this.currentListType);
          if (!evalResult.ok) {
            return await this.addBookToShelf({ value: this._guessedValue(args[0]), type: this._guessedType(args[0]) });
          }
          const outcome = await this.addBookToShelf(evalResult);
          if (!outcome.ok) return outcome;
          continue;
        }
        if (args.length === 2) {
          // first argument must be an int index
          if (!/^-?\d+$/.test(args[0].trim())) {
            this.showCompileErrorStamp();
            this.screenShake(0.004, 150);
            await this.delay(400);
            return { ok: false, crash: "wrong_arity" };
          }
          const index = parseInt(args[0].trim(), 10);
          // COMPILE-time: element type check first
          const evalResult = this._evalAddArg(args[1], this.currentListType);
          if (!evalResult.ok) {
            return await this.addBookToShelf({ value: this._guessedValue(args[1]), type: this._guessedType(args[1]) });
          }
          // RUNTIME: index must be in [0, size] inclusive
          if (index < 0 || index > this.currentList.length) {
            return await this.rejectInvalidIndex(evalResult, index);
          }
          const outcome = await this.insertBookAtIndex(evalResult, index);
          if (!outcome.ok) return outcome;
          continue;
        }
        this.showCompileErrorStamp();
        this.screenShake(0.004, 150);
        await this.delay(400);
        return { ok: false, crash: "wrong_arity" };
      }
    }
    return { ok: true };
  }

  // ══════════════════════════════════════════════════════════════
  // HUD
  // ══════════════════════════════════════════════════════════════

  createHUD() {
    const g = this.add.graphics().setDepth(49);
    g.fillStyle(0x0a0704, 0.93);
    g.fillRect(0, 0, W, 64);
    g.lineStyle(1, 0x3a2618, 1);
    g.lineBetween(0, 64, W, 64);

    this.add.text(20, 14, "THE CARD CATALOG", { font: "bold 17px Georgia", color: "#b0bec5" }).setDepth(50);
    this.add.text(20, 32, "Tuning Phase — ArrayList Methods: add()", { font: "13px Arial", color: "#546e7a" }).setDepth(50);

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
      lg.strokeRoundedRect(-5, -7, 10, 14, 1);
      lg.lineStyle(1, C_BRASS, 0.6);
      lg.lineBetween(-5, 0, 5, 0);
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
  // BIT — cataloger variant (cape + gloves + spectacles + ink stain)
  // ══════════════════════════════════════════════════════════════

  createBit() {
    const c = this.add.container(90, 560).setDepth(60);
    const g = this.add.graphics();
    g.lineStyle(2, 0x78909c, 1);
    g.lineBetween(0, -17, 0, -32);
    g.fillStyle(0x37474f, 1);
    g.fillRoundedRect(-20, -17, 40, 35, 10);
    const tip = this.add.circle(0, -32, 3, C_GOLD);
    // brass label plate on the antenna tip — the archivist's badge
    const antennaPlate = this.add.graphics();
    antennaPlate.fillStyle(C_BRASS, 0.9);
    antennaPlate.fillRoundedRect(3, -36, 8, 5, 1);
    const eye = this.add.circle(0, 0, 8, C_CYAN);
    const pupil = this.add.circle(0, 0, 3, 0xffffff);
    // half-moon reading spectacles
    const specs = this.add.graphics();
    specs.lineStyle(1.5, C_BRASS, 1);
    specs.beginPath();
    specs.arc(-5, 4, 5, 0, Math.PI, false);
    specs.strokePath();
    specs.beginPath();
    specs.arc(6, 4, 5, 0, Math.PI, false);
    specs.strokePath();
    specs.lineBetween(0, 4, 1, 4);
    const cape = this.add.graphics();
    cape.fillStyle(0x3a2618, 0.7);
    cape.lineStyle(1, C_BRASS, 0.7);
    cape.fillTriangle(-16, -14, 16, -14, 0, 20);
    const gloveL = this.add.circle(-16, 10, 4, 0xe0d6b8, 0.85);
    const gloveR = this.add.circle(16, 10, 4, 0xe0d6b8, 0.85);
    // ink stain on the left glove
    const ink = this.add.circle(-17, 11, 1.5, 0x241a0e, 0.7);
    const stamp = this.add.graphics();
    stamp.lineStyle(2, C_BRASS, 0.7);
    stamp.lineBetween(16, 10, 24, 4);
    stamp.fillStyle(0x241a0e, 1);
    stamp.fillRoundedRect(22, 0, 6, 6, 1);
    c.add([g, cape, eye, pupil, specs, gloveL, gloveR, ink, tip, antennaPlate, stamp]);
    this.tweens.add({ targets: tip, alpha: 0.3, duration: 900, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: c, y: "+=3", duration: 2000, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
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

  createAnnotation(x, y, text, colorHex) {
    const t = this.add.text(x, y, text, { font: "italic 12px Arial", color: colorHex }).setOrigin(0.5).setDepth(70).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 200 });
    this.time.delayedCall(1800, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() }); });
    return t;
  }

  createFloatingText(x, y, text, colorHex, font = "bold 15px Arial", hold = 1400) {
    const t = this.add.text(x, y, text, { font, color: colorHex, wordWrap: { width: 320 }, align: "center" }).setOrigin(0.5).setDepth(31).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 180 });
    this.time.delayedCall(hold, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() }); });
    return t;
  }

  createConfetti(x, y, count = 30) {
    const p = this.add.particles(x, y, "l47_dot", {
      speed: { min: 80, max: 240 }, angle: { min: 0, max: 360 }, scale: { start: 0.9, end: 0 }, lifespan: 500,
      tint: [C_BRASS, C_GOLD, C_ORANGE, C_CYAN, 0xffffff], emitting: false,
    }).setDepth(75);
    p.explode(count);
    this.time.delayedCall(900, () => p.destroy());
  }

  screenShake(intensity = 0.004, duration = 180) {
    this.cameras.main.shake(duration, intensity);
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
    await this.bitSay("Welcome to the Card Catalog, Cataloger. Every trial goes on the desk, and the candle burns while you decide. Answer before the flame gutters, or the card is lost to the dark. Fluent catalogers read the shelf's future before the wax runs down.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(5000)]); if (!A()) return;
    this.hideBubble();

    this.setShelfType("String");
    this.showTrialOnCard(['list.add("A");', 'list.add("B");'], "What is at index 1?");
    this.createAnnotation(CARD_CX, CARD_Y0 - 14, "the operations to trace", "#d84315");
    await this.delay(300); if (!A()) return;
    this.createAnnotation(CANDLE_X, CANDLE_BASE_Y - CANDLE_FULL_H - 40, "wax = deadline", HEX_GOLD);
    await this.delay(300); if (!A()) return;
    this.createAnnotation(SHELF_CX, SHELF_Y0 - 10, "the truth files here after you decide", HEX_GREEN_BRIGHT);
    await this.delay(400); if (!A()) return;

    await this.bitSay("The shelf on the right shows what actually happens. Trust it. Ready your catalog!");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4000)]); if (!A()) return;
    this.hideBubble();
    this.clearCard();

    try { localStorage.setItem(TUTORIAL_KEY, "true"); } catch (_) {}
    this.startWave(1);
  }

  // ══════════════════════════════════════════════════════════════
  // WAVE / ROUND LIFECYCLE
  // ══════════════════════════════════════════════════════════════

  async startWave(waveNumber) {
    this.currentWave = waveNumber;
    this.resetWaveIndicator();
    this.waveText.setText(`WAVE ${waveNumber} / 3`);

    const banners = { 1: "WAVE 1 — RAPID BASIC ADDITIONS", 2: "WAVE 2 — THE INSERTION OVERLOAD", 3: "WAVE 3 — COMPLEX TRACES & BUGS" };
    await this.showWaveBanner(banners[waveNumber]);
    if (!this._alive) return;

    if (waveNumber === 2) {
      await this.showBitFeedback("A new form, Cataloger: add(index, element). TWO arguments — the first is WHERE to insert, the second is WHAT. It makes room; it never replaces. Watch the cyan glow.", 4500);
      if (!this._alive) return;
    }
    if (waveNumber === 3) {
      await this.showBitFeedback("Wave three, Cataloger. Real programs — traces to read and mistakes to catch. Insertion and append, working together. Speed now, and precision.", 4500);
      if (!this._alive) return;
    }

    const startIndex = waveNumber === 1 ? 0 : waveNumber === 2 ? 5 : 10;
    this.startRound(startIndex);
  }

  async showWaveBanner(text) {
    const c = this.add.container((DESK_X0 + DESK_X1) / 2, -60).setDepth(85);
    const g = this.add.graphics();
    g.fillStyle(0x1a0e05, 0.95);
    g.fillRoundedRect(-235, -24, 470, 48, 8);
    g.lineStyle(2, C_GOLD, 1);
    g.strokeRoundedRect(-235, -24, 470, 48, 8);
    const t = this.add.text(0, 0, text, { font: "bold 17px Georgia", color: HEX_GOLD }).setOrigin(0.5);
    c.add([g, t]);
    // wax-splatter dust as the banner arrives
    const p = this.add.particles((DESK_X0 + DESK_X1) / 2, 260, "l47_dot", {
      speed: { min: 20, max: 60 }, angle: { min: 60, max: 120 }, scale: { start: 0.4, end: 0 }, lifespan: 400,
      tint: [0xe0d6b8], emitting: false,
    }).setDepth(84);
    await new Promise((res) => {
      this.tweens.add({
        targets: c, y: 260, duration: 300, ease: "Back.easeOut",
        onComplete: () => {
          p.explode(8);
          this.time.delayedCall(700, () => {
            this.tweens.add({ targets: c, y: -60, alpha: 0, duration: 250, ease: "Cubic.easeIn", onComplete: () => { c.destroy(); p.destroy(); res(); } });
          });
        },
      });
    });
  }

  startRound(index) {
    this.currentRound = index;
    const config = ROUNDS[index];
    this.roundAttempts = 0;
    this.roundStartTime = this.time.now;
    this.clearRound();
    this.clearShelf();
    this.setShelfType(config.listType);

    const limit = config.type === "bughunt" ? 12000 : WAVE_TIME[config.wave];

    if (config.type === "predict" || config.type === "trace") this.setupPredict(config);
    else if (config.type === "bughunt") this.setupBugHunt(config);

    this.startCandleBurn(limit, () => this.onCandleTimeout(config));
  }

  clearRound() {
    this.roundElements.forEach((e) => { if (e && e.destroy) e.destroy(); });
    this.roundElements = [];
    this.clearCard();
    this.clearPrep();
  }

  async onCandleTimeout(config) {
    if (this.gameEnded) return;
    this.inputLocked = true;
    this.roundElements.forEach((e) => e.disableInteractive && e.disableInteractive());
    this.logAttempt(config, false, null, "timeout", this.roundTimeLimit, 1);
    await this.candleFlameOut();
    if (!this._alive) return;
    await this.stampTrialCard("timeout");
    if (!this._alive) return;
    // the machine never lies — the true reveal still plays
    this.clearShelf();
    this.setShelfType(config.listType);
    await this.runProgram(config.source || config.lines);
    if (!this._alive) return;
    this.updateWaveIndicator(this._roundInWave(), false);
    this.loseLife();
    this.updateCombo(false);
    if (this.lives <= 0) { this.time.delayedCall(400, () => this.gameOver()); return; }
    await this.showBitFeedback(MISCONCEPTION_FEEDBACK.timeout);
    if (!this._alive) return;
    this.clearRound();
    this.advanceRound();
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE A/B/C — PREDICT / TRACE
  // ══════════════════════════════════════════════════════════════

  setupPredict(config) {
    this.showTrialOnCard(config.source, config.question);
    this.showOptionBubbles(config.options, config);
  }

  showOptionBubbles(options, config) {
    const shuffled = Phaser.Utils.Array.Shuffle(options.slice());
    const positions = [[300, 522], [640, 522], [300, 582], [640, 582]];
    shuffled.forEach((opt, i) => {
      const [x, y] = positions[i];
      const c = this.add.container(x, y).setDepth(41);
      const g = this.add.graphics();
      const w = 320, h = 50;
      const draw = (stroke) => {
        g.clear();
        g.fillStyle(0x1a0e05, 1);
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
        g.lineStyle(2, stroke, 1);
        g.strokeRoundedRect(-w / 2, -h / 2, w, h, 10);
      };
      draw(C_BRASS);
      const label = opt.label || opt.value;
      const txt = this.add.text(0, 0, label, { font: "bold 14px Courier New", color: "#e8dfc8", wordWrap: { width: w - 20 }, align: "center" }).setOrigin(0.5);
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
    this.pauseCandle();
    const timePctUsed = this.getTimePctUsed();
    const timeMs = Math.round(this.time.now - this.roundStartTime);
    const correct = opt.value === config.correct;
    this.logAttempt(config, correct, opt.value, opt.tag, timeMs, timePctUsed);
    this.roundElements.forEach((e) => e.disableInteractive && e.disableInteractive());

    const g = bubbleContainer.list[0];
    g.clear();
    g.fillStyle(0x1a0e05, 1);
    g.fillRoundedRect(-160, -25, 320, 50, 10);
    g.lineStyle(2, correct ? C_GREEN_BRIGHT : C_RED, 1);
    g.strokeRoundedRect(-160, -25, 320, 50, 10);
    if (!correct) this.tweens.add({ targets: bubbleContainer, x: bubbleContainer.x + 5, duration: 35, yoyo: true, repeat: 4 });

    await this.stampTrialCard(correct ? "cataloged" : "miscataloged");
    if (!this._alive) return;
    this.clearShelf();
    this.setShelfType(config.listType);
    await this.runProgram(config.source);
    if (config.revealNote) this.createFloatingText(PANEL_X + PANEL_W / 2 - 60, PANEL_Y + PANEL_H + 60, config.revealNote, HEX_GRAY, "13px Arial", 2800);
    await this.delay(350);
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
      await this.showBitFeedback(MISCONCEPTION_FEEDBACK[opt.tag] || "Not quite — trace the shelf again.");
      if (!this._alive) return;
      this.advanceRound();
    }
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE D — BUG HUNT (token-level, line-aware)
  // ══════════════════════════════════════════════════════════════

  setupBugHunt(config) {
    this.clearCard();
    const header = this.add.text(CARD_CX, CARD_Y0 + 16, "CLICK THE BUG", { font: "bold 15px Georgia", color: "#c62828" }).setOrigin(0.5);
    this.cardContainer.add(header);
    this.tweens.add({ targets: header, alpha: 0.5, duration: 500, yoyo: true, repeat: -1 });
    this.cardLabel.setText(`CARD ${this.currentRound + 1}/15`);

    this._bugHuntTokenObjs = [];
    const maxLen = Math.max(...config.lines.map((l) => l.length));
    const fontSize = maxLen > 40 ? 10 : 12;
    const startY = CARD_Y0 + 60;

    config.lines.forEach((line, li) => {
      const y = startY + li * 30;
      if (line.trim().startsWith("//")) {
        const t = this.add.text(CARD_CX, y, line, { font: `italic ${fontSize}px Courier New`, color: "#78909c" }).setOrigin(0.5);
        this.cardContainer.add(t);
        return;
      }
      const tokens = this._cardTokenize(line);
      const measured = tokens.map((tk) => { const tmp = this.add.text(0, 0, tk.t, { font: `bold ${fontSize}px Courier New` }); const w = tmp.width; tmp.destroy(); return w; });
      const totalW = measured.reduce((a, b) => a + b, 0);
      let x = CARD_CX - totalW / 2;
      tokens.forEach((tok, ti) => {
        const w = measured[ti];
        const isBug = (li + 1 === config.faultLine) && tok.t === config.faultToken;
        const t = this.add.text(x + w / 2, y, tok.t, { font: `bold ${fontSize}px Courier New`, color: tok.c }).setOrigin(0.5);
        t.setData("isBug", isBug);
        t.setData("line", li + 1);
        t.setData("origColor", tok.c);
        const hitW = Math.max(w + 6, 30), hitH = Math.max(fontSize + 8, 30);
        t.setInteractive(new Phaser.Geom.Rectangle(-hitW / 2, -hitH / 2, hitW, hitH), Phaser.Geom.Rectangle.Contains);
        this.cardContainer.add(t);
        t.on("pointerover", () => { if (!this.inputLocked) t.setColor("#8a6435"); });
        t.on("pointerout", () => { if (!this.inputLocked) t.setColor(tok.c); });
        t.on("pointerdown", () => {
          if (this.inputLocked) return;
          this.inputLocked = true;
          this.onTokenClicked(t, config, y);
        });
        this._bugHuntTokenObjs.push(t);
        x += w;
      });
    });
    this.inputLocked = false;
  }

  async onTokenClicked(tokenObj, config, lineY) {
    this.pauseCandle();
    const timePctUsed = this.getTimePctUsed();
    const timeMs = Math.round(this.time.now - this.roundStartTime);
    const correct = tokenObj.getData("isBug");
    this.logAttempt(config, correct, `line ${tokenObj.getData("line")}`, correct ? null : config.wrongTag, timeMs, timePctUsed);
    this._bugHuntTokenObjs.forEach((t) => t.disableInteractive());

    if (correct) {
      tokenObj.setColor("#2e7d32");
      // strikethrough + green fix typed above the fault line
      const strike = this.add.graphics();
      strike.lineStyle(2, 0xc62828, 0.9);
      strike.lineBetween(tokenObj.x - tokenObj.width / 2 - 2, lineY, tokenObj.x + tokenObj.width / 2 + 2, lineY);
      this.cardContainer.add(strike);
      const fixT = this.add.text(CARD_CX, lineY - 16, config.fix, { font: "bold 13px Courier New", color: "#2e7d32" }).setOrigin(0.5).setAlpha(0);
      this.cardContainer.add(fixT);
      this.tweens.add({ targets: fixT, alpha: 1, duration: 250 });
    } else {
      tokenObj.setColor(HEX_RED);
      this.tweens.add({ targets: tokenObj, x: tokenObj.x + 4, duration: 30, yoyo: true, repeat: 4 });
      this._bugHuntTokenObjs.filter((t) => t.getData("isBug")).forEach((t) => {
        t.setColor(HEX_RED);
        this.tweens.add({ targets: t, alpha: 0.3, duration: 180, yoyo: true, repeat: 3 });
      });
    }

    await this.stampTrialCard(correct ? "cataloged" : "miscataloged");
    if (!this._alive) return;
    await this.runBugHuntReveal(config);
    if (config.revealNote) this.createFloatingText(PANEL_X + PANEL_W / 2 - 60, PANEL_Y + PANEL_H + 60, config.revealNote, HEX_GRAY, "13px Arial", 2800);
    await this.delay(350);
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

  /** Bug-hunt reveals run the learner's ACTUAL (buggy) program through
   * the real interpreter — the compile error / IndexOutOfBoundsException
   * choreographies are genuinely derived, never scripted. Round 15 plays
   * BOTH futures: the buggy crash, then the fixed insertion. */
  async runBugHuntReveal(config) {
    this.clearShelf();
    this.setShelfType(config.listType);
    if (config.round === 14) {
      await this.runProgram(config.lines);
      return;
    }
    if (config.round === 15) {
      await this.runProgram(config.lines);
      await this.delay(500);
      if (!this._alive) return;
      this.clearShelf();
      this.setShelfType(config.listType);
      await this.runProgram(["ArrayList<String> list = new ArrayList<>();", 'list.add("A");', 'list.add(1, "B");']);
      this.createAnnotation(SHELF_CX, SHELF_Y0 - 10, "the insertion index has to fit: 0 to size, no farther", HEX_CYAN);
      return;
    }
  }

  // ══════════════════════════════════════════════════════════════
  // SCORING / LIVES / COMBO (tuning-weighted)
  // ══════════════════════════════════════════════════════════════

  getComboMultiplier() {
    if (this.combo >= 5) return 3;
    if (this.combo >= 3) return 2;
    return 1;
  }

  scoreForAttempt(timePctUsed) {
    let points = 100 * this.getComboMultiplier();
    const remaining = 1 - timePctUsed;
    if (remaining > 0.6) { points += 50; this.fastBonusCount++; this.createFloatingText(CARD_CX, CARD_Y0 - 20, "⚡ FILED CLEAN +50", HEX_GOLD, "bold 15px Arial", 900); }
    else if (remaining > 0.3) { points += 25; this.fastBonusCount++; this.createFloatingText(CARD_CX, CARD_Y0 - 20, "⚡ +25", HEX_GOLD, "bold 14px Arial", 800); }
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
    if (mult > 1) this.tweens.add({ targets: this.comboText, scale: 1.3, duration: 130, yoyo: true });
  }

  loseLife() {
    this.lives = Math.max(0, this.lives - 1);
    const icon = this.lifeIcons[this.lives];
    if (icon) this.tweens.add({ targets: icon, alpha: 0.12, duration: 350 });
    return this.lives <= 0;
  }

  logAttempt(config, correct, selectedAnswer, misconceptionTag, timeMs, timePctUsed) {
    this.roundAttempts = (this.roundAttempts || 0) + 1;
    this.totalTimePctUsed += timePctUsed !== undefined ? timePctUsed : 1;
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
      console.warn("Level47Scene: /api/wellbeing/predict-struggle unreachable, skipping behavioral signal for this level:", e);
    }
  }

  advanceRound() {
    if (this.currentRound === 2) this.runBehavioralCheck();
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
    this._killBurnTween();
    this.clearRound();
    this.hideBubble();

    (async () => {
      // the archive goes dark
      if (this._candleLit) await this.candleFlameOut();
      this._sconceLevel = 0;
      this._clockStopped = true;
      this._motesSettling = true;
      if (this.shelfFrameGfx) this.tweens.add({ targets: this.shelfFrameGfx, alpha: 0.3, duration: 700 });

      const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
      this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });
      const title = this.add.text(640, 240, "ARCHIVE DARK", { font: "bold 40px Georgia", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
      this.tweens.add({ targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut", onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }) });
      this.add.text(640, 310, `Score: ${this.score}`, { font: "21px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
      this.add.text(640, 350, `Cards Filed: ${this.currentRound} / 15`, { font: "18px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);
      this._makeButton(525, 420, "RELIGHT THE CANDLE", 200, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
      this._makeButton(755, 420, "RETURN TO MENU", 200, 50, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.start("MenuScene"));
    })();
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this._killBurnTween();
    this.clearRound();
    this.hideBubble();

    try { GameManager.completeLevel(46, Math.round((this.correctFirstTry / 15) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("arraylist_add_tuned"); } catch (_) {}
    try {
      localStorage.setItem("level47_results", JSON.stringify({
        level: 47, concept: "arraylist_add", phase: "tuning",
        score: this.score, accuracy: this.correctFirstTry / 15, avgTimePct: this.totalTimePctUsed / 15,
        fastBonuses: this.fastBonusCount, comboMax: this.maxCombo, stars: this._starRating(),
        livesRemaining: this.lives, attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.cardCatalogFinale().then(() => { if (this._alive) this.showScoreTally(); });
  }

  async cardCatalogFinale() {
    // candle relights and burns steadily gold
    await this.relightCandle(true);
    // sconce brightens to full glow
    this._sconceLevel = 2;
    // cabinet drawers open sequentially, releasing paper sparkles
    for (const drawer of this._drawerRects) {
      if (!this._alive) return;
      this.tweens.add({ targets: drawer.g, x: 8, duration: 180, ease: "Cubic.easeOut" });
      const p = this.add.particles(drawer.x + 45, drawer.y + 35, "l47_dot", {
        speed: { min: 25, max: 70 }, angle: { min: 220, max: 320 }, scale: { start: 0.4, end: 0 }, lifespan: 450,
        tint: [0xe0d6b8, C_BRASS], emitting: false,
      }).setDepth(9);
      p.explode(5);
      this.time.delayedCall(600, () => p.destroy());
      await this.delay(200);
    }
    // ambient dust motes surge upward (release them from the per-frame
    // drift in updateParticles so the tween owns their motion)
    const motes = this.ambient;
    this.ambient = null;
    motes.forEach((m) => this.tweens.add({ targets: m, y: m.y - Phaser.Math.Between(60, 160), alpha: 0.1, duration: 1200, ease: "Sine.easeOut" }));
    // a ceremonial run of books files onto the reference shelf
    this.clearShelf();
    this.setShelfType("String");
    for (const letter of "CATALOG!".split("")) {
      if (!this._alive) return;
      await this.addBookToShelf({ value: letter, type: "string" });
    }
    this.createConfetti(SHELF_CX, SHELF_Y0 + 40, 36);
    await this.delay(500);
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
    panel.fillStyle(0x1a0e05, 1);
    panel.fillRoundedRect(360, 110, 560, 430, 16);
    panel.lineStyle(2, C_BRASS, 1);
    panel.strokeRoundedRect(360, 110, 560, 430, 16);

    const title = this.add.text(640, 150, "CARDS FILED", { font: "bold 34px Georgia", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(91).setScale(0);
    this.tweens.add({ targets: title, scale: 1, duration: 350, ease: "Back.easeOut" });

    const acc = Math.round((this.correctFirstTry / 15) * 100);
    const avgResponseSec = ((this.totalTimePctUsed / 15) * (WAVE_TIME[2] / 1000)).toFixed(1);
    const lines = [`ACCURACY: ${acc}%`, `AVG RESPONSE: ${avgResponseSec}s`, `CLEAN-FILE BONUSES: ${this.fastBonusCount}`, `BEST COMBO: ×${this.getComboMultiplierFor(this.maxCombo)}`];
    lines.forEach((s, i) => {
      const t = this.add.text(500, 205 + i * 26, s, { font: "16px Arial", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 250, delay: 300 + i * 130 });
    });
    const totalText = this.add.text(500, 205 + 4 * 26, "TOTAL: 0", { font: "bold 23px Arial", color: HEX_GOLD }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: totalText, alpha: 1, duration: 250, delay: 900 });
    const counter = { v: 0 };
    this.tweens.add({ targets: counter, v: this.score, duration: 1000, delay: 900, onUpdate: () => totalText.setText(`TOTAL: ${Math.round(counter.v)}`) });

    const stars = this._starRating();
    for (let i = 0; i < 3; i++) {
      const earned = i < stars;
      const s = this.add.text(640 + (i - 1) * 60, 370, "★", { font: "40px Arial", color: earned ? HEX_GOLD : "#2a3040" }).setOrigin(0.5).setDepth(91).setScale(0);
      this.tweens.add({ targets: s, scale: 1, duration: 250, delay: 1500 + i * 200, ease: earned ? "Back.easeOut" : "Cubic.easeOut" });
    }

    // badge — a tiny candle in a brass holder
    const badge = this.add.container(640, 445).setDepth(91).setAlpha(0);
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillCircle(0, 0, 30);
    bg.lineStyle(3, C_GOLD, 1);
    bg.strokeCircle(0, 0, 30);
    bg.fillStyle(0x8a6435, 1);
    bg.fillEllipse(0, 14, 24, 5);
    bg.fillStyle(0xe0d6b8, 1);
    bg.fillRoundedRect(-4, -8, 8, 20, 1);
    bg.fillStyle(0xffa726, 0.9);
    bg.fillEllipse(0, -12, 6, 9);
    bg.fillStyle(0xfff9c4, 0.9);
    bg.fillEllipse(0, -11, 3, 5);
    badge.add(bg);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 2000 });
    const badgeLbl = this.add.text(640, 485, "add() SCHEMA TUNED", { font: "bold 15px Georgia", color: HEX_GOLD }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: badgeLbl, alpha: 1, duration: 300, delay: 2150 });

    this._makeButton(500, 520, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(760, 520, "NEXT: The Reading Room →", 260, 44, { fill: 0x00733a, stroke: C_GREEN_BRIGHT, textColor: "#ffffff" }, () => {
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
