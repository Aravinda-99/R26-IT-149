/**
 * Level 49 — "The Consultation Desk" (ArrayList Methods: Accretion Phase —
 * get(), opening the get() trilogy)
 * ===========================================================================
 * Teaches ArrayList.get(index): a NON-DESTRUCTIVE READ. A request slip
 * arrives at the consultation desk bearing an index; a translucent GHOST
 * COPY of the book lifts off its shelf and floats to the reading cradle —
 * while the original never moves. The ghost is the level's central
 * instrument: get() reads, it never removes (the deliberate visual
 * contrast with remove(), arriving in L52). Boundary crashes echo L29's
 * charAt(length()) cliff: valid indices are 0 to size − 1; get(size) and
 * any get() on an empty list throw IndexOutOfBoundsException.
 *
 * The evaluator is honest: get() bounds-checks against the live list,
 * size() evaluates inside get arguments (with the inner computation shown
 * as an annotation), retrieved Integers fuse arithmetically via the L37
 * gold-+ cameo, retrieved values concatenate and print, and charAt-on-a-
 * list / get-by-value are COMPILE errors (no bell, no scan — stamp only,
 * preserving the compile-vs-runtime distinction from L47). currentList is
 * NEVER mutated by a get — the shelf state after any run is bit-identical
 * to the round's initialList.
 */

import Phaser from "phaser";
import { GameManager } from "../../../GameManager.js";
import { BadgeSystem } from "../../../BadgeSystem.js";

const W = 1280, H = 720;

const C_CYAN = 0x4fc3f7, C_GOLD = 0xffd740, C_ORANGE = 0xff9800, C_VIOLET = 0xb39ddb;
const C_GREEN_BRIGHT = 0x00e676, C_RED = 0xf44336, C_GRAY = 0x78909c, C_BRASS = 0xc8a05a;
const HEX_CYAN = "#4fc3f7", HEX_GOLD = "#ffd740", HEX_ORANGE = "#ff9800", HEX_VIOLET = "#b39ddb";
const HEX_GREEN_BRIGHT = "#00e676", HEX_RED = "#f44336", HEX_GRAY = "#78909c", HEX_BRASS = "#c8a05a";

const SHELF_X0 = 60, SHELF_X1 = 440, SHELF_Y0 = 130, SHELF_Y1 = 610;
const SHELF_CX = (SHELF_X0 + SHELF_X1) / 2;
const SHELF_BASE_Y = 550, SHELF_STEP = 50;
const DESK_X0 = 470, DESK_X1 = 780, DESK_Y0 = 350, DESK_Y1 = 460;
const CRADLE = { x: 545, y: 362 };
const BELL = { x: 738, y: 416 };
const SLIP_POS = { x: 652, y: 400 };
const PANEL_X = 810, PANEL_Y = 130, PANEL_W = 420, PANEL_H = 250;
const TUTORIAL_KEY = "level49_tutorial_done";

// ══════════════════════════════════════════════════════════════
// ROUND CONFIGURATION
// ══════════════════════════════════════════════════════════════
const ROUNDS = [
  // ── Type A: Retrieval Prediction ──
  { round: 1, type: "predict",
    initialList: ["Dune", "Emma", "Ivanhoe"], listType: "String", listName: "list",
    source: ["String b = list.get(0);"],
    question: "What is stored in b?", correct: "Dune",
    options: [
      { value: "Dune", tag: null },
      { value: "Emma", tag: "index_starts_at_one_belief" },
      { value: "0", tag: "get_returns_index_belief" },
      { value: "Ivanhoe", tag: "get_from_end_belief" },
    ],
    concept: "get_at_zero" },

  { round: 2, type: "predict",
    initialList: [10, 20, 30, 40], listType: "Integer", listName: "nums",
    source: ["int n = nums.get(2);"],
    question: "What is stored in n?", correct: "30",
    options: [
      { value: "30", tag: null },
      { value: "20", tag: "index_starts_at_one_belief" },
      { value: "2", tag: "get_returns_index_belief" },
      { value: "40", tag: "index_off_by_one_high" },
    ],
    concept: "get_middle_index" },

  { round: 3, type: "predict",
    initialList: ["A", "B", "C"], listType: "String", listName: "list",
    source: ["String last = list.get(list.size() - 1);"],
    question: "What is stored in last?", correct: "C",
    options: [
      { value: "C", tag: null },
      { value: "B", tag: "size_minus_one_off_belief" },
      { value: "Error", tag: "size_in_get_crashes_belief" },
      { value: "3", tag: "get_returns_index_belief" },
    ],
    revealNote: "size() is 3; 3 − 1 = 2; get(2) fetches 'C'. The size-minus-one pattern is THE way to reach the last element — the same trick charAt taught for Strings (length() - 1).",
    concept: "get_last_via_size_minus_one" },

  // ── Type B: The Non-Destructive Read ──
  { round: 4, type: "predict",
    initialList: ["X", "Y", "Z"], listType: "String", listName: "list",
    source: ["String a = list.get(1);"],
    question: "What is the list state AFTER this line?", correct: "[X, Y, Z]",
    options: [
      { value: "[X, Y, Z]", tag: null, label: "[X, Y, Z] — unchanged" },
      { value: "[X, Z]", tag: "get_removes_element_belief", label: "[X, Z] — Y removed" },
      { value: "[Y]", tag: "get_keeps_only_retrieved_belief", label: "[Y] — only Y remains" },
      { value: "[X, null, Z]", tag: "get_leaves_null_belief", label: "[X, null, Z]" },
    ],
    revealNote: "The ghost lifts, the original STAYS. get() never modifies the list — size 3 before, size 3 after. This is the desk's first law.",
    concept: "non_destructive_read" },

  { round: 5, type: "predict",
    initialList: ["hi"], listType: "String", listName: "list",
    source: ["String a = list.get(0);", "String b = list.get(0);", "String c = list.get(0);"],
    question: "What is stored in c?", correct: "hi",
    options: [
      { value: "hi", tag: null },
      { value: "(empty)", tag: "get_second_call_empty_belief" },
      { value: "Error", tag: "get_consumed_belief" },
      { value: "null", tag: "get_on_read_nulls_belief" },
    ],
    revealNote: "Three ghosts, one original — every call returns 'hi', and the book never tires. Reading is repeatable, always.",
    concept: "repeatable_reads" },

  { round: 6, type: "predict",
    initialList: [5, 10], listType: "Integer", listName: "nums",
    source: ["int total = nums.get(0) + nums.get(1);"],
    question: "What is stored in total?", correct: "15",
    options: [
      { value: "15", tag: null },
      { value: "01", tag: "get_returns_index_belief" },
      { value: "510", tag: "plus_always_concatenates" },
      { value: "Error", tag: "get_in_expression_invalid_belief" },
    ],
    revealNote: "Two retrievals, one gold + fusion — the L37 arithmetic animation returns. Retrieved Integers auto-unbox to ints; the math is ordinary Java.",
    concept: "get_in_arithmetic" },

  // ── Type C: Boundary Crashes ──
  { round: 7, type: "predict",
    initialList: ["A", "B", "C"], listType: "String", listName: "list",
    source: ["list.get(3);"],
    question: "What happens?", correct: "runtime_crash",
    options: [
      { value: "runtime_crash", tag: null, label: "IndexOutOfBoundsException (crash)" },
      { value: "returns_C", tag: "get_at_size_valid_belief", label: "Returns 'C' (the last element)" },
      { value: "returns_null", tag: "get_on_empty_returns_null_belief", label: "Returns null" },
      { value: "compile_error", tag: "runtime_vs_compile_confusion", label: "COMPILE ERROR" },
    ],
    revealNote: "Size 3, valid indices 0–2. get(3) reaches past the top shelf — the red scan blinks at the phantom position, the stamp slams. The same law charAt taught: last valid index is size − 1.",
    concept: "get_at_size_crashes" },

  { round: 8, type: "predict",
    initialList: [], listType: "String", listName: "empty",
    source: ["ArrayList<String> empty = new ArrayList<>();", "empty.get(0);"],
    question: "What happens?", correct: "runtime_crash",
    options: [
      { value: "runtime_crash", tag: null, label: "IndexOutOfBoundsException (crash)" },
      { value: "returns_null", tag: "get_on_empty_returns_null_belief", label: "Returns null" },
      { value: "returns_empty_string", tag: "get_on_empty_returns_default_belief", label: 'Returns ""' },
      { value: "waits_for_add", tag: "get_blocks_belief", label: "Waits until something is added" },
    ],
    revealNote: "An empty list has NO valid index — not even 0. The scan finds bare shelf-frame and air. Know your size before you consult.",
    concept: "get_on_empty_crashes" },

  { round: 9, type: "predict",
    initialList: ["A", "B", "C"], listType: "String", listName: "list",
    source: ["list.charAt(0);"],
    question: "What happens?", correct: "compile_error",
    options: [
      { value: "compile_error", tag: null, label: "COMPILE ERROR — no such method" },
      { value: "returns_A", tag: "charat_on_list_belief", label: "Returns 'A'" },
      { value: "returns_char_A", tag: "charat_on_list_belief_char", label: "Returns the char 'A'" },
      { value: "runtime_crash", tag: "runtime_vs_compile_confusion", label: "Runtime exception" },
    ],
    revealNote: "charAt belongs to STRINGS; get belongs to LISTS. The compiler refuses before anything runs — a COMPILE ERROR stamp on the source, no bell, no scan. Two tools, two owners: str.charAt(i) and list.get(i).",
    concept: "charat_vs_get_discrimination" },

  // ── Type D: Consultation Command ──
  { round: 10, type: "command",
    initialList: ["Iliad", "Odyssey", "Aeneid"], listType: "String", listName: "list",
    skeleton: ["String pick = <slot:call>;"],
    mission: 'Retrieve "Odyssey" into the variable pick.',
    slots: [{ id: "call", hint: "the retrieval" }],
    cartridges: [
      { code: "list.get(1)", correct: true },
      { code: "list.get(2)", tag: "index_starts_at_one_belief" },
      { code: 'list.get("Odyssey")', tag: "get_by_value_belief" },
      { code: "list.charAt(1)", tag: "charat_on_list_belief" },
    ],
    tests: [
      { expectedVariables: { pick: "Odyssey" } },
    ],
    concept: "command_get_middle" },

  { round: 11, type: "command",
    initialList: [7, 14, 21, 28], listType: "Integer", listName: "nums",
    skeleton: ["int first = <slot:call1>;", "int last = <slot:call2>;"],
    mission: "Retrieve the FIRST element into first and the LAST element into last. (The list length may vary — use a size-proof form for last!)",
    slots: [
      { id: "call1", hint: "first element" },
      { id: "call2", hint: "last element" },
    ],
    cartridges: [
      { code: "nums.get(0)", correct: true },
      { code: "nums.get(nums.size() - 1)", correct: true },
      { code: "nums.get(1)", tag: "index_starts_at_one_belief" },
      { code: "nums.get(3)", tag: "hardcoded_last_index" },
      { code: "nums.get(nums.size())", tag: "get_at_size_valid_belief" },
    ],
    tests: [
      { initialList: [7, 14, 21, 28], expectedVariables: { first: 7, last: 28 } },
      { initialList: [3, 9], expectedVariables: { first: 3, last: 9 } },
    ],
    revealNote: "The size − 1 pattern survives ANY length — a hardcoded index works once and betrays you on the next list. The get(size) build crashes every time, on every list: the same cliff charAt(length()) taught.",
    concept: "command_first_and_last" },

  { round: 12, type: "command",
    initialList: ["Ada", "Grace"], listType: "String", listName: "list",
    skeleton: ["System.out.println(<slot:arg>);"],
    mission: "Print exactly:  Winner: Ada",
    slots: [{ id: "arg", hint: "the announcement" }],
    cartridges: [
      { code: '"Winner: " + list.get(0)', correct: true },
      { code: '"Winner: list.get(0)"', tag: "variable_as_literal_belief" },
      { code: '"Winner: " + list.get(1)', tag: "index_starts_at_one_belief" },
      { code: '"Winner: " + list', tag: "whole_list_instead_of_element" },
    ],
    tests: [
      { expectedOutput: "Winner: Ada" },
    ],
    revealNote: "The retrieval feeds the concatenation feeds the println — three wings' worth of machinery in one line. The whole-list distractor prints '[Ada, Grace]' with brackets — get(0) extracts the single element.",
    postMissionNote: "Retrieve, combine, announce — the everyday rhythm of list code. get() hands you the element; the rest is Java you already own.",
    concept: "command_get_into_println" },
];

const MISCONCEPTION_FEEDBACK = {
  get_removes_element_belief: "Watch the shelf — the original never moved! get() lifts a GHOST, not the book. Reading and removing are different tools; remove() is a lesson for another day.",
  get_keeps_only_retrieved_belief: "get() doesn't curate the shelf — it copies ONE value out and leaves every book exactly where it was.",
  get_second_call_empty_belief: "Books don't wear out from reading. Every get() on the same index returns the same value — the shelf is a library, not a vending machine.",
  get_consumed_belief: "Books don't wear out from reading. Every get() on the same index returns the same value — the shelf is a library, not a vending machine.",
  get_on_read_nulls_belief: "get() leaves no hole behind — the element stays whole and in place.",
  get_leaves_null_belief: "get() leaves no hole behind — the element stays whole and in place.",
  index_starts_at_one_belief: "Zero-based, always — the first book lives at index 0. Same law as charAt, same law as add.",
  get_returns_index_belief: "get(i) returns the ELEMENT at position i, not the number i. You hand it a position; it hands you what lives there.",
  get_at_size_valid_belief: "The last valid index is size − 1 — get(size) reaches past the top shelf every time. The exact cliff charAt(length()) taught you in the Claw trials.",
  get_on_empty_returns_null_belief: "Java never quietly hands back null or a default from get() — an invalid index CRASHES, empty list included.",
  get_on_empty_returns_default_belief: "Java never quietly hands back null or a default from get() — an invalid index CRASHES, empty list included.",
  get_blocks_belief: "get() doesn't wait — it demands the element exist NOW. Empty shelf, instant crash.",
  charat_on_list_belief: "charAt belongs to Strings; lists use get(). Two containers, two vocabularies — str.charAt(i), list.get(i).",
  charat_on_list_belief_char: "charAt belongs to Strings; lists use get(). Two containers, two vocabularies — str.charAt(i), list.get(i).",
  get_by_value_belief: "get() takes an INDEX, not a value. To find WHERE something lives you'd need other tools — get only answers 'what lives at position i?'",
  size_minus_one_off_belief: "size() − 1 IS the last index — count it on the shelf. Three books: size 3, last index 2.",
  size_in_get_crashes_belief: "size() − 1 inside get() is not just legal, it's the CANONICAL way to reach the end — the expression evaluates first, then the get runs.",
  hardcoded_last_index: "The hardcoded index worked for THIS list and betrayed you on the next. size() − 1 survives any length — write it once, trust it forever.",
  index_off_by_one_high: "Count the shelves from zero — the index you named is one past the target.",
  get_from_end_belief: "Java's get() counts from the FRONT, always. Index 0 is the first book, not the last.",
  whole_list_instead_of_element: "Printing the list prints EVERYTHING — brackets, commas, all. get(0) extracts the single element you wanted.",
  variable_as_literal_belief: "Inside quotes, the call is just LETTERS. Close the quote, then + the real call to run it.",
  plus_always_concatenates: "Two retrieved Integers under a + is pure arithmetic — no String in sight, the gold + adds.",
  get_in_expression_invalid_belief: "get() calls live happily inside expressions — retrieve and compute in one line. The retrieval runs first, the math second.",
  runtime_vs_compile_confusion: "Wrong METHOD on a type = compile error (before the run). Wrong INDEX at a valid method = runtime crash (during the run). Two different failure moments.",
};

export class Level49Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level49Scene" });
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
    this.currentList = [];
    this.currentListType = null;
    this.currentListName = "list";
    this.shelfBookSprites = [];
    this.inputLocked = true;
    this.gameEnded = false;
    this._alive = true;
    this._bubble = null;
    this.slotContents = {};
    this.slotDefs = {};
    this.cartridges = [];
    this._commandFirstFail = true;
    this._dragHoverSlotKey = null;
    this.firstOriginalStaysAnnotationShown = false;
    this._varContainers = [];
    this._activeSlip = null;
    this._consoleText = null;
  }

  preload() {}

  create() {
    this._alive = true;
    this.events.once("shutdown", () => { this._alive = false; });

    const cam = this.cameras.main;
    const zoom = Math.min(this.scale.width / W, this.scale.height / H);
    cam.setZoom(zoom);
    cam.centerOn(W / 2, H / 2);
    cam.setBackgroundColor("#0a0704");

    try { GameManager.incrementAttempt(48); } catch (_) {}

    this.createParticleTexture();
    this.createBackground();
    this.createBackWall();
    this.createConsultationBanner();
    this.createWallClock();
    this.createArchiveFloor();
    this.createParticles();
    this.createBookshelf();
    this.createConsultationDesk();
    this.createListStatePanel();
    this.createSourceDisplay();
    this.createHUD();
    this.createExpressionMonitor();
    this.createBit();
    this.setupDragEvents();

    cam.fadeIn(700, 3, 3, 5);
    this.checkTutorial();
  }

  update(time, delta) {
    this.updateParticles(time, delta);
    this.updateWallClock(time);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // BACKGROUND / ARCHIVE INTERIOR
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l49_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l49_dot", 8, 8);
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
    [520, 700].forEach((x) => {
      g.fillStyle(0x0a0704, 1);
      g.lineStyle(1, C_BRASS, 0.5);
      g.fillRoundedRect(x, 60, 90, 60, 2);
      g.strokeRoundedRect(x, 60, 90, 60, 2);
      g.fillStyle(0x3a2618, 0.4);
      g.fillEllipse(x + 45, 90, 34, 42);
    });
  }

  createConsultationBanner() {
    const g = this.add.graphics().setDepth(2);
    g.fillStyle(0x0a0704, 1);
    g.lineStyle(1, C_BRASS, 0.5);
    g.fillRoundedRect(230, 70, 340, 26, 3);
    g.strokeRoundedRect(230, 70, 340, 26, 3);
    this.add.text(400, 83, "C O N S U L T A T I O N   D E S K", { font: "bold 13px Georgia", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.7).setDepth(3);
  }

  createWallClock() {
    const ring = this.add.graphics().setDepth(2);
    ring.lineStyle(2, C_BRASS, 0.5);
    ring.strokeCircle(1180, 96, 22);
    this.clockMinute = this.add.graphics().setDepth(2);
    this._clockStopped = false;
  }

  updateWallClock(time) {
    if (!this.clockMinute || this._clockStopped) return;
    const a = time * 0.00006;
    this.clockMinute.clear();
    this.clockMinute.lineStyle(2, C_BRASS, 0.35);
    this.clockMinute.lineBetween(1180, 96, 1180 + Math.cos(a - Math.PI / 2) * 15, 96 + Math.sin(a - Math.PI / 2) * 15);
  }

  createArchiveFloor() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x1a0e05, 1);
    g.fillRect(0, 635, W, 85);
    g.lineStyle(2, 0x3a2618, 1);
    g.lineBetween(0, 637, W, 637);
    g.lineStyle(1, C_BRASS, 0.06);
    for (let i = 1; i <= 4; i++) g.strokeRoundedRect(640 - 200 + i * 6, 662 + i * 1.5, 400 - i * 12, 36 - i * 3, 6);
  }

  createParticles() {
    this.ambient = [];
    const colors = [0xc8a05a, 0x8a6435, 0xa89078];
    for (let i = 0; i < 7; i++) {
      this.ambient.push(this.add.circle(Phaser.Math.Between(0, W), Phaser.Math.Between(150, 630), 1, Phaser.Utils.Array.GetRandom(colors), Phaser.Math.FloatBetween(0.03, 0.05)).setDepth(2));
    }
  }

  updateParticles(time, delta) {
    if (!this.ambient) return;
    const step = 0.01 * (delta / 16.7);
    this.ambient.forEach((p, i) => {
      p.y += step;
      p.x += Math.sin(time * 0.0004 + i) * 0.03;
      if (p.y > 630) { p.y = 150; p.x = Phaser.Math.Between(0, W); }
    });
  }

  // ══════════════════════════════════════════════════════════════
  // BOOKSHELF (L46 construction)
  // ══════════════════════════════════════════════════════════════

  createBookshelf() {
    const g = this.add.graphics().setDepth(4);
    g.fillStyle(0x241a0e, 1);
    g.lineStyle(2, 0x3a2618, 1);
    g.fillRect(SHELF_X0, SHELF_Y0, 14, SHELF_Y1 - SHELF_Y0);
    g.strokeRect(SHELF_X0, SHELF_Y0, 14, SHELF_Y1 - SHELF_Y0);
    g.fillRect(SHELF_X1 - 14, SHELF_Y0, 14, SHELF_Y1 - SHELF_Y0);
    g.strokeRect(SHELF_X1 - 14, SHELF_Y0, 14, SHELF_Y1 - SHELF_Y0);
    g.fillRect(SHELF_X0, SHELF_Y0, SHELF_X1 - SHELF_X0, 20);
    g.fillRect(SHELF_X0, SHELF_Y1 - 20, SHELF_X1 - SHELF_X0, 20);

    const stampBg = this.add.graphics().setDepth(5);
    stampBg.fillStyle(0x0a0704, 1);
    stampBg.lineStyle(1, C_BRASS, 1);
    stampBg.fillRoundedRect(140, 138, 200, 24, 3);
    stampBg.strokeRoundedRect(140, 138, 200, 24, 3);
    this.typeStampText = this.add.text(240, 150, "", { font: "bold 12px Courier New", color: HEX_CYAN }).setOrigin(0.5).setDepth(6);

    const sizeBg = this.add.graphics().setDepth(5);
    sizeBg.fillStyle(0x0a0704, 1);
    sizeBg.lineStyle(1, C_BRASS, 0.6);
    sizeBg.fillRoundedRect(348, 140, 76, 20, 10);
    sizeBg.strokeRoundedRect(348, 140, 76, 20, 10);
    this.sizeCounterText = this.add.text(386, 150, "size: 0", { font: "bold 11px Courier New", color: HEX_BRASS }).setOrigin(0.5).setDepth(6);

    this.shelfLedges = [];
    this.shelfIndexPlates = [];
    for (let i = 0; i < 8; i++) {
      const y = SHELF_BASE_Y - i * SHELF_STEP;
      const ledgeG = this.add.graphics().setDepth(4);
      ledgeG.fillStyle(0x3a2618, 0.6);
      ledgeG.lineStyle(1, 0x8a6435, 0.4);
      ledgeG.fillRoundedRect(SHELF_CX - 170, y - 23, 340, 46, 3);
      ledgeG.strokeRoundedRect(SHELF_CX - 170, y - 23, 340, 46, 3);

      const plateG = this.add.graphics().setDepth(6);
      plateG.fillStyle(0x0a0704, 1);
      plateG.lineStyle(1, C_BRASS, 0.7);
      plateG.fillRoundedRect(78, y - 8, 24, 16, 2);
      plateG.strokeRoundedRect(78, y - 8, 24, 16, 2);
      const idxText = this.add.text(90, y, String(i), { font: "bold 14px Courier New", color: HEX_GRAY }).setOrigin(0.5).setDepth(7);

      this.shelfLedges.push({ y, ledgeG });
      this.shelfIndexPlates.push({ g: plateG, text: idxText, y });
    }
    const glowRing = this.add.circle(90, SHELF_BASE_Y, 14, C_GOLD, 0);
    this.tweens.add({ targets: glowRing, alpha: 0.15, duration: 1200, yoyo: true, repeat: -1 });
    glowRing.setDepth(5);
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
      default: return HEX_GRAY;
    }
  }
  _typeColorInt(type) {
    switch (type) {
      case "string": return C_CYAN;
      case "int": return C_GOLD;
      case "double": return C_ORANGE;
      default: return C_GRAY;
    }
  }
  _displayValueOnSpine(entry) {
    if (entry.type === "string") return `"${entry.value}"`;
    return String(entry.value);
  }
  _displayValueInPanel(entry) {
    return String(entry.value);
  }

  _shelfY(idx) { return SHELF_BASE_Y - Math.min(idx, 7) * SHELF_STEP; }

  _makeBookVisual(entry, x, y) {
    const color = this._typeColorInt(entry.type);
    const colorHex = this._typeColorHex(entry.type);
    const display = this._displayValueOnSpine(entry);
    const c = this.add.container(x, y).setDepth(6);
    const g = this.add.graphics();
    g.fillStyle(color, 0.85);
    g.lineStyle(2, Phaser.Display.Color.IntegerToColor(color).darken(30).color, 1);
    g.fillRoundedRect(-30, -20, 60, 40, 2);
    g.strokeRoundedRect(-30, -20, 60, 40, 2);
    g.lineStyle(1, 0xffffff, 0.4);
    g.lineBetween(-28, -18, 28, -18);
    g.lineBetween(-28, 18, 28, 18);
    const useVertical = display.length > 5;
    const txt = this.add.text(0, 0, display, { font: "bold 12px Georgia", color: "#0a0704" }).setOrigin(0.5);
    if (useVertical) txt.setAngle(-90);
    if (useVertical && txt.width > 36) txt.setFontSize(9);
    c.add([g, txt]);
    return { container: c, text: txt, colorHex, entry };
  }

  /** Pre-populates the shelf from a round's initialList — staggered
   * fade-in, bottom-up. The learner's task here is READING, not building. */
  async populateShelf(initialList, listType) {
    this.clearShelf();
    this.setShelfType(listType);
    const typeOf = listType === "Integer" ? "int" : listType === "Double" ? "double" : "string";
    for (let i = 0; i < initialList.length; i++) {
      const entry = { value: initialList[i], type: typeOf };
      const y = this._shelfY(i);
      const book = this._makeBookVisual(entry, SHELF_CX, y);
      book.container.setAlpha(0);
      const label = this.add.text(0, 26, `[${i}]`, { font: "bold 8px Courier New", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.6);
      book.container.add(label);
      this.tweens.add({ targets: book.container, alpha: 1, duration: 160, delay: i * 80 });
      const plate = this.shelfIndexPlates[Math.min(i, 7)];
      if (plate) plate.text.setColor(this._typeColorHex(typeOf));
      this.currentList.push(entry);
      this.shelfBookSprites.push(book);
    }
    this.sizeCounterText.setText(`size: ${this.currentList.length}`);
    this.updateListStatePanel();
    await this.delay(initialList.length * 80 + 200);
  }

  clearShelf() {
    this.shelfBookSprites.forEach((b) => b.container.destroy());
    this.shelfBookSprites = [];
    this.currentList = [];
    this.sizeCounterText.setText("size: 0");
    this.updateListStatePanel();
    this.shelfIndexPlates.forEach((p) => { p.text.setColor(HEX_GRAY); p.text.setAlpha(1); p.g.setAlpha(1); });
  }

  // ══════════════════════════════════════════════════════════════
  // CONSULTATION DESK
  // ══════════════════════════════════════════════════════════════

  createConsultationDesk() {
    const g = this.add.graphics().setDepth(4);
    g.fillStyle(0x241a0e, 1);
    g.lineStyle(3, 0x8a6435, 1);
    g.fillRoundedRect(DESK_X0, DESK_Y0, DESK_X1 - DESK_X0, DESK_Y1 - DESK_Y0, 8);
    g.strokeRoundedRect(DESK_X0, DESK_Y0, DESK_X1 - DESK_X0, DESK_Y1 - DESK_Y0, 8);
    g.lineStyle(1, 0x3a2618, 0.3);
    for (let y = DESK_Y0 + 10; y < DESK_Y1 - 6; y += 7) g.lineBetween(DESK_X0 + 6, y, DESK_X1 - 6, y);
    g.lineStyle(1, C_BRASS, 0.7);
    g.lineBetween(DESK_X0 + 4, DESK_Y0 + 2, DESK_X1 - 4, DESK_Y0 + 2);

    // reading cradle — shallow V
    g.lineStyle(2, C_BRASS, 0.6);
    g.lineBetween(CRADLE.x - 30, CRADLE.y, CRADLE.x, CRADLE.y + 10);
    g.lineBetween(CRADLE.x, CRADLE.y + 10, CRADLE.x + 30, CRADLE.y);

    // banker's lamp on the desk's left end
    g.lineStyle(2, C_BRASS, 0.6);
    g.beginPath();
    g.arc(492, 388, 12, Math.PI, Math.PI * 1.6, false);
    g.strokePath();
    g.fillStyle(0x2e7d32, 0.5);
    g.lineStyle(1, C_BRASS, 0.7);
    g.fillRoundedRect(478, 374, 40, 12, 5);
    g.strokeRoundedRect(478, 374, 40, 12, 5);
    this.lampGlow = this.add.ellipse(498, 396, 52, 16, 0xffa726, 0.04).setDepth(4);

    // reading spectacles
    g.lineStyle(1.5, C_BRASS, 0.5);
    g.strokeCircle(500, 435, 5);
    g.strokeCircle(514, 435, 5);
    g.lineBetween(505, 435, 509, 435);
    g.lineBetween(495, 433, 488, 430);
    g.lineBetween(519, 433, 526, 430);

    // stack of blank request slips
    for (let i = 0; i < 5; i++) {
      g.fillStyle(0xe0d6b8, 0.4);
      g.fillRect(750 + (i % 2) * 2, 444 - i * 4, 26, 4);
    }

    // brass service bell
    this.bellContainer = this.add.container(BELL.x, BELL.y).setDepth(6);
    const bg = this.add.graphics();
    bg.fillStyle(C_BRASS, 0.8);
    bg.lineStyle(1, 0x8a6435, 1);
    bg.beginPath();
    bg.arc(0, 0, 10, Math.PI, 0, false);
    bg.closePath();
    bg.fillPath();
    bg.strokePath();
    bg.fillStyle(C_BRASS, 1);
    bg.fillCircle(0, -11, 2);
    bg.fillStyle(0x8a6435, 1);
    bg.fillRect(-13, 0, 26, 2);
    this.bellContainer.add(bg);

    this.slipLayer = this.add.container(0, 0).setDepth(7);
    this.ghostLayer = this.add.container(0, 0).setDepth(9);
  }

  dingBell() {
    this.tweens.add({ targets: this.bellContainer, scale: 1.15, duration: 75, yoyo: true });
    for (let i = 0; i < 3; i++) {
      const arc = this.add.graphics().setDepth(6);
      arc.lineStyle(1, C_BRASS, 0.7);
      arc.beginPath();
      arc.arc(BELL.x, BELL.y - 4, 14 + i * 6, -Math.PI * 0.8, -Math.PI * 0.2, false);
      arc.strokePath();
      arc.setAlpha(0);
      this.tweens.add({ targets: arc, alpha: 0.6, duration: 100, delay: i * 60, yoyo: true, onComplete: () => arc.destroy() });
    }
  }

  /** Slides a request slip onto the desk bearing the call text. */
  async slideInRequestSlip(callText) {
    this.clearSlip();
    const c = this.add.container(W + 100, SLIP_POS.y);
    const g = this.add.graphics();
    g.fillStyle(0xe0d6b8, 1);
    g.lineStyle(1, 0x8a6435, 1);
    g.fillRoundedRect(-60, -27, 120, 54, 3);
    g.strokeRoundedRect(-60, -27, 120, 54, 3);
    g.lineStyle(1, 0xc62828, 0.3);
    g.strokeCircle(44, -16, 8);
    const t = this.add.text(0, 0, callText, { font: "bold 12px Courier New", color: "#241a0e", wordWrap: { width: 110 }, align: "center" }).setOrigin(0.5);
    if (t.width > 110) t.setFontSize(9);
    c.add([g, t]);
    this.slipLayer.add(c);
    this._activeSlip = { container: c, gfx: g, text: t };
    await new Promise((res) => { this.tweens.add({ targets: c, x: SLIP_POS.x, duration: 300, ease: "Sine.easeOut", onComplete: res }); });
    this.dingBell();
    await this.delay(120);
  }

  clearSlip() {
    if (this._activeSlip) { this._activeSlip.container.destroy(); this._activeSlip = null; }
    this.slipLayer.removeAll(true);
  }

  // ══════════════════════════════════════════════════════════════
  // LIST STATE PANEL (+ retrieved-value row)
  // ══════════════════════════════════════════════════════════════

  createListStatePanel() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0d0805, 1);
    g.lineStyle(2, C_BRASS, 1);
    g.fillRoundedRect(PANEL_X, PANEL_Y, PANEL_W, PANEL_H, 8);
    g.strokeRoundedRect(PANEL_X, PANEL_Y, PANEL_W, PANEL_H, 8);
    const header = this.add.graphics().setDepth(11);
    header.fillStyle(0x1a0e05, 1);
    header.fillRoundedRect(PANEL_X, PANEL_Y, PANEL_W, 32, { tl: 8, tr: 8, bl: 0, br: 0 });
    this.add.text(PANEL_X + 12, PANEL_Y + 16, "LIST STATE", { font: "bold 11px Georgia", color: HEX_BRASS }).setOrigin(0, 0.5).setDepth(12);
    this.syncDot = this.add.circle(PANEL_X + PANEL_W - 16, PANEL_Y + 16, 3, C_GREEN_BRIGHT, 0.7).setDepth(12);
    this.tweens.add({ targets: this.syncDot, alpha: 0.3, duration: 700, yoyo: true, repeat: -1 });

    this.typeEchoText = this.add.text(PANEL_X + PANEL_W - 10, PANEL_Y + 44, "", { font: "bold 9px Courier New", color: HEX_GRAY }).setOrigin(1, 0.5).setAlpha(0.6).setDepth(12);
    this.bracketText = this.add.text(PANEL_X + PANEL_W / 2, PANEL_Y + 100, "[]", { font: "bold 15px Courier New", color: HEX_GRAY, wordWrap: { width: PANEL_W - 30 }, align: "center" }).setOrigin(0.5).setDepth(12);
    this.panelSizeText = this.add.text(PANEL_X + PANEL_W / 2, PANEL_Y + 140, "size: 0", { font: "11px Courier New", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.85).setDepth(12);
    this.panelIndexText = this.add.text(PANEL_X + PANEL_W / 2, PANEL_Y + 163, "", { font: "bold 10px Courier New", color: "#8a6435" }).setOrigin(0.5).setAlpha(0.7).setDepth(12);

    // retrieved-value row
    this.add.text(PANEL_X + 16, PANEL_Y + 205, "retrieved:", { font: "11px Georgia", color: "#8a6435" }).setOrigin(0, 0.5).setDepth(12);
    this.retrievedValueText = this.add.text(PANEL_X + 92, PANEL_Y + 205, "—", { font: "bold 14px Courier New", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(12);
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
    this.panelIndexText.setText(this.currentList.map((_, i) => `[${i}]`).join("  "));
  }

  updateRetrievedValueRow(value, type) {
    if (value === null) {
      this.retrievedValueText.setText("—").setColor(HEX_GRAY);
      return;
    }
    if (type === "crash") {
      this.retrievedValueText.setText("✗ IndexOutOfBoundsException").setColor(HEX_RED).setFontSize(11);
      return;
    }
    this.retrievedValueText.setFontSize(14).setText(String(value)).setColor(this._typeColorHex(type));
    this.tweens.add({ targets: this.retrievedValueText, scale: 1.2, duration: 120, yoyo: true });
  }

  // ══════════════════════════════════════════════════════════════
  // SOURCE DISPLAY / EXPRESSION MONITOR
  // ══════════════════════════════════════════════════════════════

  createSourceDisplay() {
    this.sourceContainer = this.add.container(0, 0).setDepth(15);
  }

  _syntaxTokenize(line) {
    const tokens = [];
    const re = /("(?:[^"\\]|\\.)*")|(\bArrayList\b|\bnew\b|\bString\b|\bint\b)|(<\w*>)|(\bSystem\.out\b)|(\.get\b|\.size\b|\.charAt\b|\bprintln\b)|(-?\d+)|([(){};.,=+\-])/g;
    let last = 0, m;
    const plain = (t) => t && tokens.push({ t, c: "#e0e0e0" });
    while ((m = re.exec(line))) {
      if (m.index > last) plain(line.slice(last, m.index));
      if (m[1]) tokens.push({ t: m[1], c: HEX_CYAN });
      else if (m[2]) tokens.push({ t: m[2], c: "#66bb6a" });
      else if (m[3]) tokens.push({ t: m[3], c: HEX_GOLD });
      else if (m[4]) tokens.push({ t: m[4], c: "#66bb6a" });
      else if (m[5]) tokens.push({ t: m[5], c: "#ffd740" });
      else if (m[6]) tokens.push({ t: m[6], c: HEX_GOLD });
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
      let x = 620 - totalW / 2;
      tokens.forEach((tok, ti) => {
        const t = this.add.text(x, y, tok.t, { font: `bold ${fontSize}px Courier New`, color: tok.c }).setOrigin(0, 0.5);
        this.sourceContainer.add(t);
        x += measured[ti];
      });
    });
  }

  createExpressionMonitor() {
    const g = this.add.graphics().setDepth(50);
    g.fillStyle(0x1a0e05, 1);
    g.fillRoundedRect(W / 2 - 200, 10, 400, 44, 8);
    g.lineStyle(1, 0x3a2618, 1);
    g.strokeRoundedRect(W / 2 - 200, 10, 400, 44, 8);
    this.monitorText = this.add.text(W / 2, 32, "", { font: "12px Courier New", color: "#e8dfc8" }).setOrigin(0.5).setDepth(51);
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
    g.fillStyle(0x0a0704, 0.93);
    g.fillRect(0, 0, W, 64);
    g.lineStyle(1, 0x3a2618, 1);
    g.lineBetween(0, 64, W, 64);

    this.add.text(20, 14, "THE CONSULTATION DESK", { font: "bold 14px Georgia", color: "#b0bec5" }).setDepth(50);
    this.add.text(20, 32, "Accretion Phase — ArrayList Methods: get()", { font: "11px Arial", color: "#546e7a" }).setDepth(50);

    this.add.text(1060, 8, "SCORE", { font: "9px Arial", color: "#546e7a" }).setDepth(50);
    this.scoreText = this.add.text(1060, 20, "0", { font: "bold 18px Arial", color: "#ffffff" }).setDepth(50);
    this.comboText = this.add.text(1060, 42, "×1", { font: "bold 12px Arial", color: HEX_GOLD }).setDepth(50);

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

  // ══════════════════════════════════════════════════════════════
  // BIT — consulting archivist variant (cape, gloves, magnifier)
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
    const cape = this.add.graphics();
    cape.fillStyle(0x3a2618, 0.7);
    cape.lineStyle(1, C_BRASS, 0.7);
    cape.fillTriangle(-16, -14, 16, -14, 0, 20);
    const gloveL = this.add.circle(-16, 10, 4, 0xe0d6b8, 0.85);
    const gloveR = this.add.circle(16, 10, 4, 0xe0d6b8, 0.85);
    // magnifying glass in the right glove
    const mag = this.add.graphics();
    mag.lineStyle(2, C_BRASS, 0.9);
    mag.strokeCircle(24, 2, 7);
    mag.lineBetween(19, 8, 14, 13);
    this.bitMagGlint = this.add.circle(26, 0, 1.5, 0xffffff, 0);
    c.add([g, cape, eye, pupil, gloveL, gloveR, mag, this.bitMagGlint, tip]);
    this.tweens.add({ targets: tip, alpha: 0.3, duration: 900, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: c, y: "+=3", duration: 2000, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
    this.bit = c;
  }

  glintMagnifier() {
    if (!this.bitMagGlint) return;
    this.bitMagGlint.setAlpha(0.9);
    this.tweens.add({ targets: this.bitMagGlint, alpha: 0, duration: 200 });
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
    this.tweens.add({ targets: c, alpha: 1, scale: 1, duration: 180, ease: "Back.easeOut" });

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
        delay: 22, repeat: Math.max(0, text.length - 1),
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
    const t = this.add.text(x, y, text, { font: "italic 11px Georgia", color: colorHex }).setOrigin(0.5).setDepth(70).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 200 });
    this.time.delayedCall(1800, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() }); });
    return t;
  }

  createFloatingText(x, y, text, colorHex, font = "bold 13px Arial", hold = 1400) {
    const t = this.add.text(x, y, text, { font, color: colorHex, wordWrap: { width: 320 }, align: "center" }).setOrigin(0.5).setDepth(31).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 180 });
    this.time.delayedCall(hold, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() }); });
    return t;
  }

  createConfetti(x, y, count = 30) {
    const p = this.add.particles(x, y, "l49_dot", {
      speed: { min: 80, max: 240 }, angle: { min: 0, max: 360 }, scale: { start: 0.9, end: 0 }, lifespan: 500,
      tint: [C_BRASS, C_GOLD, C_ORANGE, C_CYAN, 0xffffff], emitting: false,
    }).setDepth(75);
    p.explode(count);
    this.time.delayedCall(900, () => p.destroy());
  }

  screenShake(intensity = 0.004, duration = 150) {
    this.cameras.main.shake(duration, intensity);
  }

  // ══════════════════════════════════════════════════════════════
  // GHOST RETRIEVAL (the signature choreography)
  // ══════════════════════════════════════════════════════════════

  /** Full §3.3 choreography for a VALID get(index). Returns the element.
   * The original book NEVER moves — the ghost is a translucent copy. */
  async retrieveGhost(index) {
    const entry = this.currentList[index];
    const book = this.shelfBookSprites[index];
    const shelfY = this._shelfY(index);

    // locate: plate glow + scan line
    const plate = this.shelfIndexPlates[Math.min(index, 7)];
    if (plate) {
      plate.text.setColor(HEX_GOLD);
      this.tweens.add({ targets: plate.text, scale: 1.5, duration: 150, yoyo: true });
      this.time.delayedCall(1400, () => { if (plate.text.active && this.currentList[index]) plate.text.setColor(this._typeColorHex(this.currentList[index].type)); });
    }
    const scan = this.add.rectangle(SHELF_CX - 168, shelfY, 2, 42, 0xffd740, 0.7).setDepth(8);
    await new Promise((res) => { this.tweens.add({ targets: scan, x: SHELF_CX + 168, duration: 250, ease: "Sine.easeInOut", onComplete: () => { scan.destroy(); res(); } }); });
    if (!this._alive) return entry;

    // warm halo on the original — it never moves
    const halo = this.add.graphics().setDepth(7);
    halo.lineStyle(3, C_GOLD, 0.5);
    halo.strokeRoundedRect(SHELF_CX - 33, shelfY - 23, 66, 46, 4);
    const haloTween = this.tweens.add({ targets: halo, alpha: 0.2, duration: 350, yoyo: true, repeat: -1 });

    // ghost copy materializes on top of the original and lifts
    const ghost = this._makeBookVisual(entry, SHELF_CX, shelfY);
    const rim = this.add.graphics();
    rim.fillStyle(C_GOLD, 0.15);
    rim.fillRoundedRect(-34, -24, 68, 48, 4);
    ghost.container.addAt(rim, 0);
    ghost.container.setAlpha(0).setDepth(9);
    this.ghostLayer.add(ghost.container);
    await new Promise((res) => { this.tweens.add({ targets: ghost.container, alpha: 0.45, duration: 150, onComplete: res }); });
    await new Promise((res) => { this.tweens.add({ targets: ghost.container, y: shelfY - 20, duration: 200, ease: "Sine.easeOut", onComplete: res }); });
    if (!this._alive) return entry;

    // float in an arc to the reading cradle
    this.glintMagnifier();
    await new Promise((res) => {
      this.tweens.add({ targets: ghost.container, x: CRADLE.x, duration: 600, ease: "Sine.easeInOut", onComplete: res });
      this.tweens.add({ targets: ghost.container, y: CRADLE.y - 90, duration: 300, ease: "Sine.easeOut", yoyo: false });
      this.time.delayedCall(300, () => { if (ghost.container.active) this.tweens.add({ targets: ghost.container, y: CRADLE.y - 12, duration: 300, ease: "Sine.easeIn" }); });
    });
    if (!this._alive) return entry;

    // value delivery — the return value pops above the cradle
    const valText = this.add.text(CRADLE.x, CRADLE.y - 55, String(entry.value), { font: "bold 20px Courier New", color: this._typeColorHex(entry.type) }).setOrigin(0.5).setDepth(30).setAlpha(0);
    this.roundElements.push(valText);
    this.tweens.add({ targets: valText, alpha: 1, y: CRADLE.y - 65, duration: 200 });
    this.updateRetrievedValueRow(entry.value, entry.type);
    this._lastValueLabel = valText;

    // "the original stays on the shelf" — once per session
    if (!this.firstOriginalStaysAnnotationShown) {
      this.firstOriginalStaysAnnotationShown = true;
      this.createAnnotation(SHELF_CX, shelfY - 38, "the original stays on the shelf →", HEX_GOLD);
    }

    // ghost dissolve
    await this.delay(800);
    haloTween.stop();
    halo.destroy();
    if (ghost.container.active) {
      const p = this.add.particles(CRADLE.x, CRADLE.y - 12, "l49_dot", { speed: { min: 15, max: 45 }, angle: { min: 220, max: 320 }, scale: { start: 0.4, end: 0 }, lifespan: 350, tint: [C_GOLD], emitting: false }).setDepth(30);
      p.explode(4);
      this.time.delayedCall(450, () => p.destroy());
      await new Promise((res) => { this.tweens.add({ targets: ghost.container, alpha: 0, duration: 400, onComplete: () => { ghost.container.destroy(); res(); } }); });
    }
    return entry;
  }

  _fadeValueLabel() {
    if (this._lastValueLabel && this._lastValueLabel.active) {
      const t = this._lastValueLabel;
      this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() });
    }
    this._lastValueLabel = null;
  }

  /** Delivers the last-retrieved value into a typed variable container
   * beside the desk (L34 style). */
  async deliverToVariable(name, value, type) {
    const idx = this._varContainers.length;
    const x = 610 + (idx % 2) * 92, y = 320 - Math.floor(idx / 2) * 30;
    const c = this.add.container(x, y).setDepth(12).setAlpha(0);
    const g = this.add.graphics();
    g.fillStyle(0x0a1520, 1);
    g.lineStyle(1.5, this._typeColorInt(type), 0.8);
    g.fillRoundedRect(-42, -13, 84, 26, 5);
    g.strokeRoundedRect(-42, -13, 84, 26, 5);
    const nameT = this.add.text(0, -20, name, { font: "bold 9px Courier New", color: HEX_BRASS }).setOrigin(0.5);
    const valT = this.add.text(0, 0, String(value), { font: "bold 12px Courier New", color: this._typeColorHex(type) }).setOrigin(0.5);
    if (valT.width > 76) valT.setFontSize(9);
    c.add([g, nameT, valT]);
    this.roundElements.push(c);
    this._varContainers.push(c);
    this.tweens.add({ targets: c, alpha: 1, duration: 200 });
    if (this._lastValueLabel && this._lastValueLabel.active) {
      const lbl = this._lastValueLabel;
      this._lastValueLabel = null;
      await new Promise((res) => { this.tweens.add({ targets: lbl, x, y, alpha: 0.2, duration: 300, ease: "Sine.easeIn", onComplete: () => { lbl.destroy(); res(); } }); });
    } else {
      await this.delay(200);
    }
  }

  clearVarContainers() {
    this._varContainers.forEach((c) => { if (c.active) c.destroy(); });
    this._varContainers = [];
  }

  /** The L37 gold-+ fusion cameo: two retrieved ints fuse into their sum
   * at the cradle. */
  async plusFusion(v1, v2) {
    const a = this.add.text(CRADLE.x - 50, CRADLE.y - 65, String(v1), { font: "bold 18px Courier New", color: HEX_GOLD }).setOrigin(0.5).setDepth(30);
    const plus = this.add.text(CRADLE.x, CRADLE.y - 65, "+", { font: "bold 20px Courier New", color: HEX_GOLD }).setOrigin(0.5).setDepth(30).setAlpha(0);
    const b = this.add.text(CRADLE.x + 50, CRADLE.y - 65, String(v2), { font: "bold 18px Courier New", color: HEX_GOLD }).setOrigin(0.5).setDepth(30);
    this.tweens.add({ targets: plus, alpha: 1, scale: 1.4, duration: 200, yoyo: true });
    await this.delay(400);
    if (!this._alive) return v1 + v2;
    await new Promise((res) => {
      this.tweens.add({ targets: a, x: CRADLE.x, alpha: 0, duration: 220, onComplete: res });
      this.tweens.add({ targets: b, x: CRADLE.x, alpha: 0, duration: 220 });
      this.tweens.add({ targets: plus, alpha: 0, duration: 220 });
    });
    a.destroy(); b.destroy(); plus.destroy();
    const sum = v1 + v2;
    const sumT = this.add.text(CRADLE.x, CRADLE.y - 65, String(sum), { font: "bold 22px Courier New", color: HEX_GOLD }).setOrigin(0.5).setDepth(30).setScale(0.5);
    this.roundElements.push(sumT);
    this.tweens.add({ targets: sumT, scale: 1, duration: 200, ease: "Back.easeOut" });
    const p = this.add.particles(CRADLE.x, CRADLE.y - 65, "l49_dot", { speed: { min: 30, max: 80 }, angle: { min: 0, max: 360 }, scale: { start: 0.5, end: 0 }, lifespan: 250, tint: [C_GOLD], emitting: false }).setDepth(30);
    p.explode(6);
    this.time.delayedCall(350, () => p.destroy());
    this._lastValueLabel = sumT;
    return sum;
  }

  /** Types println output as a console line beneath the desk. */
  async printToConsole(text) {
    if (this._consoleText && this._consoleText.active) this._consoleText.destroy();
    const t = this.add.text(DESK_X0 + 10, DESK_Y1 + 16, "> ", { font: "bold 14px Courier New", color: HEX_GREEN_BRIGHT }).setOrigin(0, 0.5).setDepth(12);
    this.roundElements.push(t);
    this._consoleText = t;
    this._fadeValueLabel();
    for (const ch of text) {
      if (!this._alive) return;
      t.setText(t.text + ch);
      await this.delay(14);
    }
  }

  // ══════════════════════════════════════════════════════════════
  // CRASH REJECTION + COMPILE STAMP
  // ══════════════════════════════════════════════════════════════

  /** §3.4 — red scan sweeps up past the top shelf, blinks at the phantom
   * index, IOOBE stamp slams onto the slip. NOTHING is retrieved. */
  async crashRetrieval(index) {
    const topIdx = this.currentList.length - 1;
    const startY = topIdx >= 0 ? this._shelfY(topIdx) : SHELF_BASE_Y;
    const phantomY = this._shelfY(Math.max(0, Math.min(index, 7)));
    const scan = this.add.rectangle(SHELF_CX, startY, 340, 3, C_RED, 0.6).setDepth(8);
    await new Promise((res) => { this.tweens.add({ targets: scan, y: phantomY - 10, duration: 400, ease: "Sine.easeOut", onComplete: res }); });
    if (!this._alive) { scan.destroy(); return; }
    await new Promise((res) => { this.tweens.add({ targets: scan, alpha: 0, duration: 90, yoyo: true, repeat: 3, onComplete: () => { scan.destroy(); res(); } }); });

    // stamp slams onto the slip; the slip singes
    if (this._activeSlip && this._activeSlip.container.active) {
      const slip = this._activeSlip.container;
      const stamp = this.add.text(0, 6, "IndexOutOfBounds\nException", { font: "bold 11px Courier New", color: HEX_RED, align: "center" }).setOrigin(0.5).setAngle(-8).setScale(1.5).setAlpha(0);
      slip.add(stamp);
      this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 150, ease: "Cubic.easeIn" });
      [[-52, -20], [52, 20], [-48, 22]].forEach(([dx, dy]) => {
        const singe = this.add.circle(dx, dy, 5, 0x241a0e, 0.5);
        slip.add(singe);
      });
    }
    this.screenShake(0.005, 180);
    this.tweens.add({ targets: this.lampGlow, alpha: 0.01, duration: 120, yoyo: true, repeat: 2 });
    this.updateRetrievedValueRow(null, null);
    this.updateRetrievedValueRow("", "crash");
    await this.delay(1200);
  }

  /** Compile errors are visually DISTINCT from runtime crashes: no bell,
   * no scan, no slip — only the stamp on the source display. */
  async showCompileErrorStamp() {
    const stamp = this.add.text(620, 96, "COMPILE ERROR", { font: "bold 22px Arial", color: HEX_RED }).setOrigin(0.5).setDepth(30).setScale(1.5).setAngle(-6).setAlpha(0);
    this.roundElements.push(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 180 });
    this.screenShake(0.004, 150);
    await this.delay(1100);
    if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 220, onComplete: () => stamp.destroy() });
  }

  // ══════════════════════════════════════════════════════════════
  // HONEST EVALUATOR
  // ══════════════════════════════════════════════════════════════

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
    const last = cur.trim();
    if (last) parts.push(last);
    return parts;
  }

  /** Evaluates a get() argument expression: int literal, size(), or
   * size() - 1. Shows the inner computation when size() participates. */
  _evalIndexArg(argExpr) {
    const t = argExpr.trim();
    if (/^-?\d+$/.test(t)) return { ok: true, index: parseInt(t, 10) };
    let m = t.match(/^(\w+)\.size\(\)\s*-\s*1$/);
    if (m) {
      const size = this.currentList.length;
      this.createAnnotation(SLIP_POS.x, SLIP_POS.y - 44, `size() = ${size} → ${size} - 1 = ${size - 1}`, HEX_BRASS);
      return { ok: true, index: size - 1, showedComputation: true };
    }
    m = t.match(/^(\w+)\.size\(\)$/);
    if (m) {
      const size = this.currentList.length;
      this.createAnnotation(SLIP_POS.x, SLIP_POS.y - 44, `size() = ${size}`, HEX_BRASS);
      return { ok: true, index: size };
    }
    if (/^".*"$/.test(t)) return { ok: false, compile: true, tag: "get_by_value_belief" };
    return { ok: false, compile: true };
  }

  /** Async expression evaluator — get() calls play their full ghost (or
   * crash) choreography as they are encountered. Returns
   * {ok, value, type} | {ok:false, compile} | {ok:false, crash}. */
  async evalRetrievalExpr(expr) {
    const parts = this._splitTopPlus(expr);
    if (parts.length > 1) {
      const results = [];
      for (const p of parts) {
        const r = await this.evalRetrievalExpr(p);
        if (!r.ok) return r;
        results.push(r);
      }
      if (results.every((r) => r.type === "int")) {
        let acc = results[0].value;
        for (let i = 1; i < results.length; i++) acc = await this.plusFusion(acc, results[i].value);
        return { ok: true, value: acc, type: "int" };
      }
      let out = "";
      results.forEach((r) => { out += String(r.value); });
      return { ok: true, value: out, type: "string" };
    }

    const t = expr.trim();
    if (/^".*"$/.test(t)) return { ok: true, value: t.slice(1, -1), type: "string" };
    if (/^-?\d+$/.test(t)) return { ok: true, value: parseInt(t, 10), type: "int" };
    if (/\.charAt\(/.test(t)) return { ok: false, compile: true, tag: "charat_on_list_belief" };
    const getMatch = t.match(/^(\w+)\.get\((.*)\)$/);
    if (getMatch) {
      const arg = this._evalIndexArg(getMatch[2]);
      if (!arg.ok) return { ok: false, compile: true, tag: arg.tag };
      const idx = arg.index;
      if (idx < 0 || idx >= this.currentList.length) {
        await this.crashRetrieval(idx);
        return { ok: false, crash: "ioobe" };
      }
      const entry = await this.retrieveGhost(idx);
      return { ok: true, value: entry.value, type: entry.type };
    }
    if (t === this.currentListName) {
      return { ok: true, value: `[${this.currentList.map((e) => String(e.value)).join(", ")}]`, type: "string" };
    }
    return { ok: false, compile: true };
  }

  /** Runs a full statement list honestly — each statement gets its own
   * request slip; a crash halts execution (later statements never run). */
  async runStatements(lines) {
    for (const raw of lines) {
      if (!this._alive) return { ok: true };
      const line = raw.trim();
      if (!line) continue;

      const declList = line.match(/^ArrayList<(\w+)>\s+(\w+)\s*=\s*new ArrayList<>\(\);$/);
      if (declList) {
        this.clearShelf();
        this.setShelfType(declList[1]);
        this.currentListName = declList[2];
        await this.delay(200);
        continue;
      }

      // compile errors surface with NO slip, NO bell, NO scan
      if (/\.charAt\(/.test(line)) {
        await this.showCompileErrorStamp();
        return { ok: false, compile: true, tag: "charat_on_list_belief" };
      }

      const assignMatch = line.match(/^(String|int)\s+(\w+)\s*=\s*(.*);$/);
      if (assignMatch) {
        const inner = assignMatch[3];
        if (/^"/.test(inner) === false && /\.get\("/.test(inner)) {
          await this.showCompileErrorStamp();
          return { ok: false, compile: true, tag: "get_by_value_belief" };
        }
        await this.slideInRequestSlip(inner.length > 26 ? inner.slice(0, 26) + "…" : inner);
        const r = await this.evalRetrievalExpr(inner);
        if (!r.ok) {
          if (r.compile) { this.clearSlip(); await this.showCompileErrorStamp(); }
          return r;
        }
        if (!this.lastVars) this.lastVars = {};
        this.lastVars[assignMatch[2]] = r.value;
        await this.deliverToVariable(assignMatch[2], r.value, r.type);
        continue;
      }

      const printMatch = line.match(/^System\.out\.println\((.*)\);$/);
      if (printMatch) {
        if (/\.get\("/.test(printMatch[1])) {
          await this.showCompileErrorStamp();
          return { ok: false, compile: true, tag: "get_by_value_belief" };
        }
        await this.slideInRequestSlip("println(…)");
        const r = await this.evalRetrievalExpr(printMatch[1]);
        if (!r.ok) {
          if (r.compile) { this.clearSlip(); await this.showCompileErrorStamp(); }
          return r;
        }
        await this.printToConsole(String(r.value));
        continue;
      }

      const bareMatch = line.match(/^(.*);$/);
      if (bareMatch) {
        if (/\.get\("/.test(bareMatch[1])) {
          await this.showCompileErrorStamp();
          return { ok: false, compile: true, tag: "get_by_value_belief" };
        }
        await this.slideInRequestSlip(bareMatch[1].length > 26 ? bareMatch[1].slice(0, 26) + "…" : bareMatch[1]);
        const r = await this.evalRetrievalExpr(bareMatch[1]);
        if (!r.ok) {
          if (r.compile) { this.clearSlip(); await this.showCompileErrorStamp(); }
          return r;
        }
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
    if (done) this.time.delayedCall(300, () => this.startRound(0));
    else this.runTutorial();
  }

  async runTutorial() {
    const A = () => this._alive;
    await this.delay(400); if (!A()) return;
    this.currentListName = "list";
    await this.populateShelf(["Dune", "Emma", "Ivanhoe"], "String"); if (!A()) return;

    await this.bitSay("Welcome to the Consultation Desk, Archivist. You've learned to FILE books — now you learn to CONSULT them. Readers submit a slip with a shelf number; we fetch them a look at the book. And here is the desk's first law: THE BOOK NEVER LEAVES THE SHELF.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(5200)]); if (!A()) return;
    this.hideBubble();

    this.updateSourceDisplay(["String book = list.get(1);"]);
    await this.runStatements(["String book = list.get(1);"]); if (!A()) return;
    await this.bitSay("get(1) fetched the book at index 1 — 'Emma', because we count from zero, same as always. But look at the shelf: Emma is STILL THERE. get() reads; it never removes. The size didn't budge.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(5000)]); if (!A()) return;
    this.hideBubble();

    this.updateSourceDisplay(["String book = list.get(1);", "String again = list.get(1);"]);
    await this.runStatements(["String again = list.get(1);"]); if (!A()) return;
    await this.bitSay("Consult the same shelf a hundred times — the answer never changes and the book never tires. Reading is REPEATABLE. That's the difference between looking and taking.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4800)]); if (!A()) return;
    this.hideBubble();

    this.updateSourceDisplay(["list.get(3);"]);
    await this.runStatements(["list.get(3);"]); if (!A()) return;
    await this.bitSay("Three books — indices 0, 1, 2. Index 3 is PAST THE TOP: nothing there but air. The last valid index is always size minus one. If this feels familiar, it should — charAt taught you the same law back in the Claw trials. Same rule, new shelf.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(5200)]); if (!A()) return;
    this.hideBubble();
    this.clearSlip();
    this.clearVarContainers();
    this.roundElements.forEach((e) => { if (e && e.destroy) e.destroy(); });
    this.roundElements = [];

    this.updateSourceDisplay(["ArrayList<String> empty = new ArrayList<>();", "empty.get(0);"]);
    await this.runStatements(["ArrayList<String> empty = new ArrayList<>();", "empty.get(0);"]); if (!A()) return;
    await this.bitSay("An empty list has NO valid index — not even zero. get(0) on emptiness crashes just the same. Always know your size before you consult.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4800)]); if (!A()) return;
    this.hideBubble();
    this.clearSlip();

    this.currentListName = "list";
    await this.populateShelf([10, 20, 30], "Integer"); if (!A()) return;
    this.updateSourceDisplay(["int sum = list.get(0) + list.get(2);"]);
    await this.runStatements(["int sum = list.get(0) + list.get(2);"]); if (!A()) return;
    await this.bitSay("Retrieved values are REAL values — add them, print them, store them. get() hands you the element; what you do next is ordinary Java. Your desk is open, Archivist — the readers await!");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(5000)]); if (!A()) return;
    this.hideBubble();

    try { localStorage.setItem(TUTORIAL_KEY, "true"); } catch (_) {}
    this.clearSlip();
    this.clearVarContainers();
    this.roundElements.forEach((e) => { if (e && e.destroy) e.destroy(); });
    this.roundElements = [];
    this.updateSourceDisplay([]);
    this.updateRetrievedValueRow(null, null);
    this.startRound(0);
  }

  // ══════════════════════════════════════════════════════════════
  // ROUND LIFECYCLE
  // ══════════════════════════════════════════════════════════════

  async startRound(index) {
    this.currentRound = index;
    const config = ROUNDS[index];
    this.roundAttempts = 0;
    this.roundStartTime = this.time.now;
    this.clearRound();
    this.clearVarContainers();
    this.clearSlip();
    this.updateRetrievedValueRow(null, null);
    this.currentListName = config.listName;
    await this.populateShelf(config.initialList, config.listType);
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
    this._consoleText = null;
    this._lastValueLabel = null;
  }

  showQuestionCard(promptText) {
    const c = this.add.container(640, 490).setDepth(40).setAlpha(0);
    const g = this.add.graphics();
    g.fillStyle(0x1a0e05, 0.95);
    g.fillRoundedRect(-260, -40, 520, 80, 10);
    g.lineStyle(1, C_BRASS, 0.5);
    g.strokeRoundedRect(-260, -40, 520, 80, 10);
    const badge = this.add.circle(-230, -10, 16, C_BRASS);
    const badgeT = this.add.text(-230, -10, String(this.currentRound + 1), { font: "bold 14px Arial", color: "#0a0704" }).setOrigin(0.5);
    const t = this.add.text(-200, -10, promptText, { font: "14px Arial", color: "#e8dfc8", wordWrap: { width: 420 } }).setOrigin(0, 0.5);
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
    const spacing = 280;
    const startX = 640 - ((n - 1) * spacing) / 2;
    shuffled.forEach((opt, i) => {
      const x = startX + i * spacing, y = 600;
      const c = this.add.container(x, y).setDepth(41);
      const g = this.add.graphics();
      const w = 260, h = 50;
      const draw = (stroke) => {
        g.clear();
        g.fillStyle(0x1a0e05, 1);
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
        g.lineStyle(2, stroke, 1);
        g.strokeRoundedRect(-w / 2, -h / 2, w, h, 10);
      };
      draw(C_BRASS);
      const label = opt.label || opt.value;
      const txt = this.add.text(0, 0, label, { font: "bold 13px Courier New", color: "#e8dfc8" }).setOrigin(0.5);
      if (txt.width > w - 20) txt.setFontSize(11);
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
    g.fillStyle(0x1a0e05, 1);
    g.fillRoundedRect(-130, -25, 260, 50, 10);
    g.lineStyle(2, correct ? C_GREEN_BRIGHT : C_RED, 1);
    g.strokeRoundedRect(-130, -25, 260, 50, 10);
    if (!correct) this.tweens.add({ targets: bubbleContainer, x: bubbleContainer.x + 5, duration: 40, yoyo: true, repeat: 4 });

    await this.delay(200);
    if (!this._alive) return;

    // the universal reveal: run the round's source honestly
    await this.runStatements(config.source);
    if (config.revealNote) this.createFloatingText(PANEL_X + PANEL_W / 2, PANEL_Y + PANEL_H + 40, config.revealNote, HEX_GRAY, "11px Arial", 2800);
    await this.delay(500);
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
      await this.showBitFeedback(MISCONCEPTION_FEEDBACK[opt.tag] || "Not quite — watch the desk and try again.");
      if (!this._alive) return;
      // retry the same round with a fresh setup (shelf back to initialList)
      this.clearRound();
      this.clearVarContainers();
      this.clearSlip();
      this.updateRetrievedValueRow(null, null);
      await this.populateShelf(config.initialList, config.listType);
      if (!this._alive) return;
      this.setupPredict(config);
    }
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE D — CONSULTATION COMMAND
  // ══════════════════════════════════════════════════════════════

  setupCommand(config) {
    this.renderCommandSkeleton(config);
    this.updateExpressionMonitor(config.mission);
    this.showQuestionCard(config.mission);
    this.createCartridgeTray(config);
    this._commandFirstFail = true;
    // input stays locked from the previous round's answer click without
    // this — the same soft-lock class of bug found in L30–L45/L46.
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
    const fontSize = 14;
    const lineH = fontSize + 9;
    lines.forEach((rawLine, i) => {
      const y = 96 + i * lineH - ((lines.length - 1) * lineH) / 2;
      const parts = rawLine.split(/<slot:(\w+)>/);
      const measured = [];
      let totalW = 0;
      parts.forEach((part, pi) => {
        if (pi % 2 === 0) {
          const tmp = this.add.text(0, 0, part, { font: `bold ${fontSize}px Courier New` });
          measured.push(tmp.width); totalW += tmp.width; tmp.destroy();
        } else { measured.push(210); totalW += 216; }
      });
      let x = 620 - totalW / 2;
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
          const w = 210, h = fontSize + 8;
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
      dg.fillStyle(0x1a0e05, 1);
      dg.fillRoundedRect(x, y, w, h, 4);
      if (filled) {
        dg.lineStyle(2, highlight ? 0xffab00 : 0x3a2618, 1);
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
      const label = this.add.text(x + w / 2, y + h / 2, hintDef ? hintDef.hint : "", { font: "italic 9px Courier New", color: "#5a4a30" }).setOrigin(0.5).setDepth(17);
      def.hintLabel = label;
      this.sourceContainer.add(label);
    }
  }

  createCartridgeTray(config) {
    const shuffled = Phaser.Utils.Array.Shuffle(config.cartridges.slice());
    let x = 80;
    const rowY = 580;

    shuffled.forEach((def) => {
      const style = { font: "bold 12px Courier New", color: HEX_CYAN };
      const label = def.label || def.code;
      const measure = this.add.text(0, 0, label, style);
      const w = measure.width + 20;
      measure.destroy();
      const home = { x: x + w / 2, y: rowY };
      x += w + 14;

      const c = this.add.container(home.x, home.y).setDepth(42);
      const bg = this.add.graphics();
      const draw = (stroke) => {
        bg.clear();
        bg.fillStyle(0x241a0e, 1);
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
    const bt = this.add.text(0, 0, "CONSULT", { font: "bold 14px Arial", color: "#0a0704" }).setOrigin(0.5);
    btn.add([bg, bt]);
    btn.setSize(130, 44);
    btn.on("pointerover", () => { if (this._consultReady) { bdraw(true, true); btn.setScale(1.03); } });
    btn.on("pointerout", () => { bdraw(this._consultReady, false); btn.setScale(1); });
    btn.on("pointerdown", () => { if (this._consultReady) this.onConsultPressed(config); });
    this.consultButton = { c: btn, draw: bdraw };
    this.roundElements.push(btn);
    this.disableConsultButton();
  }

  enableConsultButton() { this._consultReady = true; this.consultButton.draw(true, false); this.consultButton.c.setInteractive({ useHandCursor: true }); }
  disableConsultButton() { this._consultReady = false; this.consultButton.draw(false, false); this.consultButton.c.disableInteractive(); }

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
        this.updateConsultButtonState();
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
      const cx = def.rect.x + def.rect.w / 2, cy = def.rect.y + def.rect.h / 2;
      obj.x = Phaser.Math.Linear(obj.x, cx, 0.25);
      obj.y = Phaser.Math.Linear(obj.y, cy, 0.25);
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
      this.updateConsultButtonState();
    } else {
      const home = obj.getData("home");
      this.tweens.add({ targets: obj, x: home.x, y: home.y, duration: 250, ease: "Back.easeOut" });
    }
  }

  updateConsultButtonState() {
    const allFilled = Object.keys(this.slotDefs).every((id) => (this.slotContents[id] || []).length > 0);
    if (allFilled) this.enableConsultButton(); else this.disableConsultButton();
  }

  async onConsultPressed(config) {
    this.inputLocked = true;
    this.disableConsultButton();
    this.roundAttempts++;
    const timeMs = Math.round(this.time.now - this.roundStartTime);

    const slotIds = Object.keys(this.slotDefs).sort();
    const codes = {};
    const tags = [];
    slotIds.forEach((id) => {
      codes[id] = this.slotContents[id][0].container.getData("code");
      const tag = this.slotContents[id][0].container.getData("tag");
      if (tag) tags.push(tag);
    });

    const statements = config.skeleton.map((line) => line.replace(/<slot:(\w+)>/g, (_, id) => codes[id]));

    const tests = config.tests;
    let allPass = true;
    for (let ti = 0; ti < tests.length; ti++) {
      if (!this._alive) return;
      const test = tests[ti];
      const listForTest = test.initialList || config.initialList;
      this.clearVarContainers();
      this.clearSlip();
      if (this._consoleText && this._consoleText.active) { this._consoleText.destroy(); this._consoleText = null; }
      this.updateRetrievedValueRow(null, null);
      await this.populateShelf(listForTest, config.listType);
      if (!this._alive) return;
      if (tests.length > 1) this.createFloatingText(SHELF_CX, SHELF_Y0 - 14, `TEST ${ti + 1}: [${listForTest.join(", ")}]`, HEX_BRASS, "bold 12px Courier New", 1400);

      this.lastVars = {};
      const runResult = await this.runStatements(statements);
      if (!this._alive) return;

      let pass = runResult.ok;
      if (pass && test.expectedVariables) {
        for (const name in test.expectedVariables) {
          if (String(this.lastVars[name]) !== String(test.expectedVariables[name])) pass = false;
        }
      }
      if (pass && test.expectedOutput !== undefined) {
        const printed = this._consoleText && this._consoleText.active ? this._consoleText.text.replace(/^> /, "") : "";
        if (printed !== test.expectedOutput) pass = false;
      }
      this.createFloatingText(CRADLE.x, CRADLE.y - 95, pass ? "✓" : "✗", pass ? HEX_GREEN_BRIGHT : HEX_RED, "bold 24px Arial", 900);
      if (!pass) { allPass = false; break; }
      await this.delay(400);
    }

    const firstFailTag = tags[0] || null;
    this.logAttempt(config, allPass, slotIds.map((id) => codes[id]).join(" | "), firstFailTag, timeMs);

    if (allPass) {
      if (config.revealNote) this.createFloatingText(PANEL_X + PANEL_W / 2, PANEL_Y + PANEL_H + 40, config.revealNote, HEX_GRAY, "11px Arial", 2800);
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
      await this.showBitFeedback(MISCONCEPTION_FEEDBACK[firstFailTag] || "The desk executed exactly what you assembled — compare the result against the mission and adjust.");
      if (!this._alive) return;
      this.inputLocked = false;
      this.clearVarContainers();
      this.clearSlip();
      await this.populateShelf(config.initialList, config.listType);
      if (!this._alive) return;
      this.slotContents = {};
      this.renderCommandSkeleton(config);
      this.cartridges.forEach((cart) => {
        cart.container.setData("placedIn", null);
        const home = cart.container.getData("home");
        this.tweens.add({ targets: cart.container, x: home.x, y: home.y, duration: 200 });
      });
      this.disableConsultButton();
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

  advanceRound() {
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
      // the desk closes
      this.tweens.add({ targets: this.lampGlow, alpha: 0, duration: 800 });
      this.tweens.add({ targets: this.bellContainer, alpha: 0.25, duration: 800 });
      this.tweens.add({ targets: this.typeStampText, alpha: 0.15, duration: 800 });
      this._clockStopped = true;
      const motes = this.ambient;
      this.ambient = null;
      (motes || []).forEach((m) => this.tweens.add({ targets: m, y: 632, alpha: 0, duration: 1500, ease: "Sine.easeIn" }));
      if (this._activeSlip && this._activeSlip.container.active) {
        this.tweens.add({ targets: this._activeSlip.container, y: "+=40", angle: 15, alpha: 0, duration: 900 });
      }

      const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
      this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });
      const title = this.add.text(640, 240, "DESK CLOSED", { font: "bold 40px Georgia", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
      this.tweens.add({ targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut", onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }) });
      this.add.text(640, 310, `Score: ${this.score}`, { font: "20px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
      this.add.text(640, 350, `Rounds Completed: ${this.currentRound} / 12`, { font: "16px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);
      this._makeButton(640, 420, "RING THE BELL", 200, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
    })();
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearRound();
    this.hideBubble();

    try { GameManager.completeLevel(48, Math.round((this.correctFirstTry / 12) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("arraylist_get_schema"); } catch (_) {}
    try {
      localStorage.setItem("level49_results", JSON.stringify({
        level: 49, concept: "arraylist_get", phase: "accretion",
        score: this.score, accuracy: this.correctFirstTry / 12, avgTime: this.totalTime / 12,
        comboMax: this.maxCombo, stars: this._starRating(), livesRemaining: this.lives,
        attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.consultationFinale().then(() => { if (this._alive) this.showScoreTally(); });
  }

  async consultationFinale() {
    // the lamp brightens; the bell rings thrice
    this.tweens.add({ targets: this.lampGlow, alpha: 0.12, duration: 600 });
    for (let i = 0; i < 3; i++) { this.dingBell(); await this.delay(220); }
    if (!this._alive) return;

    // a wave of ghosts lifts off the shelf, bottom to top
    await this.populateShelf(["W", "E", "L", "L", "D", "O", "N", "E"], "String");
    if (!this._alive) return;
    for (let i = 0; i < this.shelfBookSprites.length; i++) {
      const b = this.shelfBookSprites[i];
      const ghost = this._makeBookVisual(b.entry, SHELF_CX, this._shelfY(i));
      ghost.container.setAlpha(0.45).setDepth(9);
      this.tweens.add({
        targets: ghost.container, y: this._shelfY(i) - 60, alpha: 0, duration: 700, delay: i * 110, ease: "Sine.easeOut",
        onComplete: () => {
          const p = this.add.particles(ghost.container.x, ghost.container.y, "l49_dot", { speed: { min: 15, max: 40 }, angle: { min: 240, max: 300 }, scale: { start: 0.4, end: 0 }, lifespan: 300, tint: [C_GOLD], emitting: false }).setDepth(30);
          p.explode(4);
          this.time.delayedCall(400, () => p.destroy());
          ghost.container.destroy();
        },
      });
    }
    await this.delay(900);
    if (!this._alive) return;

    // retrieved-value row celebration
    this.updateRetrievedValueRow("WELL", "string");
    await this.delay(400);
    this.updateRetrievedValueRow("CONSULTED", "string");
    this.createConfetti(CRADLE.x, CRADLE.y - 30, 36);
    await this.delay(600);
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
    panel.fillStyle(0x1a0e05, 1);
    panel.fillRoundedRect(360, 150, 560, 420, 16);
    panel.lineStyle(2, C_BRASS, 1);
    panel.strokeRoundedRect(360, 150, 560, 420, 16);

    const title = this.add.text(640, 190, "READERS SERVED", { font: "bold 34px Georgia", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(91).setScale(0);
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

    // badge — a magnifying glass over a book
    const badge = this.add.container(640, 465).setDepth(91).setAlpha(0);
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillCircle(0, 0, 30);
    bg.lineStyle(3, C_GOLD, 1);
    bg.strokeCircle(0, 0, 30);
    bg.fillStyle(C_CYAN, 0.85);
    bg.fillRoundedRect(-12, -2, 24, 14, 2);
    bg.lineStyle(2, C_BRASS, 1);
    bg.strokeCircle(2, -8, 7);
    bg.lineBetween(7, -3, 13, 3);
    badge.add(bg);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 1950 });
    const badgeLbl = this.add.text(640, 505, "get() SCHEMA ACQUIRED", { font: "bold 13px Georgia", color: HEX_GOLD }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: badgeLbl, alpha: 1, duration: 300, delay: 2100 });

    this._makeButton(500, 545, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(760, 545, "NEXT: The Stacks →", 250, 44, { fill: 0x00733a, stroke: C_GREEN_BRIGHT, textColor: "#ffffff" }, () => {
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
    const t = this.add.text(0, 0, label, { font: "bold 15px Arial", color: style.textColor }).setOrigin(0.5);
    c.add([g, t]);
    c.setSize(w, h);
    c.setInteractive({ useHandCursor: true });
    c.on("pointerover", () => { draw(true); c.setScale(1.04); });
    c.on("pointerout", () => { draw(false); c.setScale(1); });
    c.on("pointerdown", onClick);
    return c;
  }
}
