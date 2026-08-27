/**
 * Level 46 — "The Archive" (ArrayList Methods: Accretion Phase — add(),
 * opening the ArrayList Wing after the 9-level Output Wing)
 * ===========================================================================
 * Teaches ArrayList<T> and add(): the list is a tall numbered bookshelf,
 * each add() places a book on the next empty shelf (0-based indices,
 * insertion order). The generic type parameter is a "shelf type stamp" —
 * enforced honestly at parse time: a wrong-type book is rejected with the
 * same "wrong type for the container" choreography established by
 * Scanner's InputMismatchException (L34/35) and printf's slot rejection
 * (L43/44/45), now at compile time instead of runtime.
 *
 * DESIGN NOTE — list-state panel formatting: Java's real ArrayList
 * toString() does NOT include quotes around String elements
 * (System.out.println(list) on ["Hello"] prints [Hello], not ["Hello"]).
 * The panel renders bare values, matching real Java; only the physical
 * BOOK SPINES show quotes (since that's how the String literal was
 * WRITTEN in code). Command-mission grading compares the honest
 * evaluator's resulting array (value+type, in order) against each
 * mission's target array directly — never a scripted bracket-notation
 * string comparison — which sidesteps the quote-formatting question
 * entirely and stays robust regardless of which valid cartridge order
 * or type-parameter form the player assembles.
 */

import Phaser from "phaser";
import { GameManager } from "../../../../GameManager.js";
import { addTutorialReplayButton } from "../../../../TutorialReplayButton.js";
import { WellbeingAPI } from "../../../../../api/api.js";
import { BadgeSystem } from "../../../../BadgeSystem.js";

const W = 1280, H = 720;

const C_CYAN = 0x4fc3f7, C_GOLD = 0xffd740, C_ORANGE = 0xff9800, C_VIOLET = 0xb39ddb;
const C_GREEN_BRIGHT = 0x00e676, C_RED = 0xf44336, C_GRAY = 0x78909c, C_BRASS = 0xc8a05a;
const HEX_CYAN = "#4fc3f7", HEX_GOLD = "#ffd740", HEX_ORANGE = "#ff9800", HEX_VIOLET = "#b39ddb";
const HEX_GREEN_BRIGHT = "#00e676", HEX_RED = "#f44336", HEX_GRAY = "#78909c", HEX_BRASS = "#c8a05a";

const SHELF_X0 = 60, SHELF_X1 = 440, SHELF_Y0 = 130, SHELF_Y1 = 610;
const SHELF_CX = (SHELF_X0 + SHELF_X1) / 2;
const SHELF_BASE_Y = 550, SHELF_STEP = 50;
const PREP_X0 = 60, PREP_X1 = 440, PREP_Y0 = 620, PREP_Y1 = 715;
const PANEL_X = 470, PANEL_Y = 130, PANEL_W = 300, PANEL_H = 250;
const TUTORIAL_KEY = "level46_tutorial_done";

// ══════════════════════════════════════════════════════════════
// ROUND CONFIGURATION
// ══════════════════════════════════════════════════════════════
const ROUNDS = [
  { round: 1, type: "predict", listType: "String",
    source: ['ArrayList<String> books = new ArrayList<>();', 'books.add("Hamlet");'],
    question: "What is at index 0?", correct: "Hamlet",
    options: [
      { value: "Hamlet", tag: null },
      { value: '"Hamlet"', tag: "quotes_stored_belief" },
      { value: "(empty)", tag: "first_add_at_index_one_belief" },
      { value: "Error", tag: "add_requires_index_belief" },
    ],
    revealNote: "First add always lands on shelf 0. The book's cyan spine reads 'Hamlet' — quotes are how you WRITE a String in code, not what's stored.",
    concept: "first_add_at_zero" },

  { round: 2, type: "predict", listType: "String",
    source: ['ArrayList<String> list = new ArrayList<>();', 'list.add("A");', 'list.add("B");', 'list.add("C");'],
    question: "What is at index 2?", correct: "C",
    options: [
      { value: "C", tag: null },
      { value: "A", tag: "add_reverses_order_belief" },
      { value: "B", tag: "index_off_by_one_belief" },
      { value: "(empty)", tag: "index_starts_at_one_belief" },
    ],
    revealNote: "Three adds: A→shelf 0, B→shelf 1, C→shelf 2. Insertion order = index order.",
    concept: "order_preservation" },

  { round: 3, type: "predict", listType: "Integer",
    source: ['ArrayList<Integer> nums = new ArrayList<>();', 'nums.add(10);', 'nums.add(20);'],
    question: "What is the size of nums?", correct: "2",
    options: [
      { value: "2", tag: null },
      { value: "1", tag: "size_equals_last_index_belief" },
      { value: "3", tag: "size_off_by_one_high" },
      { value: "0", tag: "size_before_adds_belief" },
    ],
    revealNote: "Two adds, size = 2. Size is the COUNT of elements, not the highest index. (Highest index in a 2-element list is 1, but size is 2.)",
    concept: "size_after_adds" },

  { round: 4, type: "predict", listType: "String",
    source: ['ArrayList<String> list = new ArrayList<>();', 'list.add("A");', 'list.add("B");'],
    question: "What is at index 0?", correct: "A",
    options: [
      { value: "A", tag: null },
      { value: "B", tag: "add_reverses_order_belief" },
      { value: '"A"', tag: "quotes_stored_belief" },
      { value: "(empty)", tag: "first_add_at_index_one_belief" },
    ],
    concept: "first_stays_at_zero" },

  { round: 5, type: "predict", listType: "String",
    source: ['ArrayList<String> list = new ArrayList<>();', 'list.add("X");', 'list.add("X");', 'list.add("X");'],
    question: "What is the size?", correct: "3",
    options: [
      { value: "3", tag: null },
      { value: "1", tag: "duplicates_not_allowed_belief" },
      { value: "0", tag: "duplicates_replaced_belief" },
      { value: "Error", tag: "duplicates_forbidden_belief" },
    ],
    revealNote: "ArrayList ALLOWS duplicates — three separate books, three shelves, size 3. Each add creates a new entry regardless of value.",
    concept: "duplicates_allowed" },

  { round: 6, type: "predict", listType: "String",
    source: ['ArrayList<String> list = new ArrayList<>();', 'list.add("A");', 'list.add("B");', 'list.add("A");'],
    question: "What is the list state?", correct: "[A, B, A]",
    options: [
      { value: "[A, B, A]", tag: null, label: "[A, B, A] — three elements" },
      { value: "[A, B]", tag: "duplicates_not_allowed_belief", label: "[A, B] — duplicates merged" },
      { value: "[B, A]", tag: "duplicates_move_first_belief", label: "[B, A] — first A removed on second add" },
      { value: "[A, B, A, A]", tag: "extra_duplicate_belief" },
    ],
    concept: "duplicates_preserve_positions" },

  { round: 7, type: "predict", listType: "Integer",
    source: ['ArrayList<Integer> nums = new ArrayList<>();', 'nums.add("hello");'],
    question: "What happens?", correct: "compile_error",
    options: [
      { value: "compile_error", tag: null, label: "COMPILE ERROR — type mismatch" },
      { value: "runtime_error", tag: "type_check_at_runtime_belief" },
      { value: "list_size_1", tag: "type_parameter_ignored_belief", label: 'Works — list = ["hello"]' },
      { value: "list_empty", tag: "silent_reject_belief", label: "Silently ignored, list = []" },
    ],
    revealNote: "Full rejection choreography — the String book approaches the gold Integer shelf, Type Stamp flares red, book bounces back and dissolves. COMPILE ERROR — Java checks types BEFORE the program runs.",
    concept: "generic_type_safety" },

  { round: 8, type: "predict", listType: "String",
    source: ['ArrayList<String> list = new ArrayList<>();'],
    question: "What is the size and state right after this line?", correct: "size_0_empty",
    options: [
      { value: "size_0_empty", tag: null, label: "size 0, state []" },
      { value: "size_1_null", tag: "empty_has_null_belief", label: "size 1, state [null]" },
      { value: "size_infinity", tag: "unbounded_capacity_belief", label: "size ∞" },
      { value: "Error", tag: "empty_forbidden_belief" },
    ],
    revealNote: "A newly-created ArrayList is EMPTY. Size 0. No shelves filled. The shelf frame stands ready, but nothing occupies any index yet.",
    concept: "empty_list_state" },

  { round: 9, type: "predict", listType: "Integer",
    source: ['ArrayList<Integer> nums = new ArrayList<>();', 'nums.add(42);'],
    question: "Does this compile and run correctly?", correct: "yes_autoboxes",
    options: [
      { value: "yes_autoboxes", tag: null, label: "YES — Java autoboxes int → Integer" },
      { value: "no_int_not_integer", tag: "no_autoboxing_belief", label: "NO — int is not Integer" },
      { value: "yes_but_wraps_manually", tag: "manual_boxing_required_belief", label: "YES only if you write Integer.valueOf(42)" },
      { value: "runtime_error", tag: "type_check_at_runtime_belief" },
    ],
    revealNote: "Autoboxing! Java automatically wraps int 42 into Integer(42) when adding to ArrayList<Integer>. You don't need to write Integer.valueOf(42) — Java does it for you.",
    concept: "autoboxing_int_to_integer" },

  { round: 10, type: "command", listType: "String",
    skeleton: ["ArrayList<String> shelf = new ArrayList<>();", "<slot:call1>", "<slot:call2>"],
    slots: [{ id: "call1", hint: "first add" }, { id: "call2", hint: "second add" }],
    mission: 'File two books so the shelf reads: [apple, orange]',
    cartridges: [
      { code: 'shelf.add("apple");', correct: true },
      { code: 'shelf.add("orange");', correct: true },
      { code: 'shelf.add(42);', tag: "type_parameter_ignored_belief" },
      { code: 'shelf.add("apple", "orange");', tag: "add_multiple_args_belief" },
    ],
    target: [{ value: "apple", type: "string" }, { value: "orange", type: "string" }],
    concept: "command_two_adds_ordered" },

  { round: 11, type: "command", listType: "Integer",
    skeleton: ["ArrayList<Integer> scores = new ArrayList<>();", "<slot:call1>", "<slot:call2>", "<slot:call3>"],
    slots: [{ id: "call1", hint: "first" }, { id: "call2", hint: "second" }, { id: "call3", hint: "third" }],
    mission: "File three scores so the shelf reads: [100, 85, 92]",
    cartridges: [
      { code: "scores.add(100);", correct: true },
      { code: "scores.add(85);", correct: true },
      { code: "scores.add(92);", correct: true },
      { code: 'scores.add("100");', tag: "type_parameter_ignored_belief" },
    ],
    target: [{ value: 100, type: "int" }, { value: 85, type: "int" }, { value: 92, type: "int" }],
    concept: "command_three_ints_ordered" },

  { round: 12, type: "command", listType: "String",
    skeleton: ["ArrayList<String> tags = new ArrayList<>();", "<slot:call1>", "<slot:call2>", "<slot:call3>"],
    slots: [{ id: "call1", hint: "index 0" }, { id: "call2", hint: "index 1" }, { id: "call3", hint: "index 2" }],
    mission: "File three tags so the shelf has size 3 with 'new' at index 0, 'sale' at index 1, and 'new' again at index 2.",
    cartridges: [
      { code: 'tags.add("new");', correct: true, dupOf: "new" },
      { code: 'tags.add("sale");', correct: true },
      { code: 'tags.add("new");', correct: true, dupOf: "new" },
    ],
    target: [{ value: "new", type: "string" }, { value: "sale", type: "string" }, { value: "new", type: "string" }],
    postMissionNote: "Duplicates are perfectly legal — same value, different shelves. 'new' at 0 AND at 2 are DIFFERENT entries; the list doesn't care they share a value.",
    concept: "command_duplicates_at_specific_positions" },
];

const MISCONCEPTION_FEEDBACK = {
  first_add_at_index_one_belief: "The first shelf is 0, not 1. Java lists count from zero, same as Strings. If it's the first thing added, its home is 0.",
  index_starts_at_one_belief: "Zero-based indexing throughout Java. The first shelf is 0, the second is 1, and so on. Same rule as charAt.",
  add_reverses_order_belief: "add() puts the NEW book at the END, on the next empty shelf. The oldest additions stay at the lowest indices. First in, lowest number.",
  add_replaces_at_index_belief: "add() with just an element APPENDS — it doesn't replace anything. Older shelves keep their books; new books land above.",
  size_equals_last_index_belief: "Size counts the elements. Last index is size - 1 (because of zero-based). Two books means indices 0 and 1, but size = 2.",
  size_before_adds_belief: "Size updates AFTER each add. Two adds means size 2, not 0.",
  size_off_by_one_high: "Size is the COUNT of successful adds, one per book. Not one more.",
  duplicates_not_allowed_belief: "ArrayList happily stores duplicates — three matching books get three shelves. Each add creates a new entry.",
  duplicates_replaced_belief: "No replacement in ArrayList — every add is a NEW entry regardless of value.",
  duplicates_forbidden_belief: "Duplicates are perfectly legal. If you wanted uniqueness, that's a Set — a different collection entirely.",
  duplicates_move_first_belief: "add() never moves an existing element — earlier books stay exactly where they were filed.",
  extra_duplicate_belief: "Only as many books land as there were add() calls — count the calls, not the repeats.",
  quotes_stored_belief: "The quotes are how you write a String LITERAL in code. They mark the boundary; they don't travel with the value.",
  index_off_by_one_belief: "Match the add ORDER to the index carefully — the third add() lands at index 2, not index 1.",
  type_parameter_ignored_belief: "The angle brackets are a PROMISE. ArrayList<Integer> means ONLY Integers — Java refuses at compile time, before the program even runs.",
  type_check_at_runtime_belief: "Generic type checking happens at COMPILE time — Java catches the mismatch before your program runs. Runtime is too late.",
  silent_reject_belief: "Java never silently ignores type errors — it refuses to compile. The wrong-type book bounces off the shelf every time.",
  no_autoboxing_belief: "Java quietly wraps int into Integer when adding to ArrayList<Integer>. This is called autoboxing — automatic conversion for convenience.",
  manual_boxing_required_belief: "You COULD write Integer.valueOf(42), but Java saves you the trouble. Autoboxing does it for you.",
  add_requires_index_belief: "The basic add(element) call doesn't need an index — it always appends to the end. There's a two-argument version add(index, element) for inserting, but simple add just goes to the end.",
  add_returns_element_belief: "add() returns boolean true (indicating success) — not the element. The return value is usually ignored.",
  empty_has_null_belief: "Empty ArrayList has NO elements — not even null. Size 0, state [].",
  unbounded_capacity_belief: "ArrayList capacity grows on demand, but SIZE only grows via add(). Fresh list = size 0.",
  add_multiple_args_belief: "add(a, b) means 'insert a at index b' — not 'add both a and b'. For two elements, call add twice.",
};

export class Level46Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level46Scene" });
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
    this.currentList = [];
    this.currentListType = null;
    this.shelfBookSprites = [];
    this.inputLocked = true;
    this.gameEnded = false;
    this._alive = true;
    this._bubble = null;
    this.slotContents = {};
    this.slotDefs = {};
    this.cartridges = [];
    this._commandFirstFail = true;
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

    try { GameManager.incrementAttempt(45); } catch (_) {}

    this.createParticleTexture();
    this.createBackground();
    this.createBackWall();
    this.createChandelier();
    this.createWallFrames();
    this.createArchiveBanner();
    this.createArchiveFloor();
    this.createLectern();
    this.createReadingLamp();
    this.createParticles();
    this.createBookshelf();
    this.createBookPreparationArea();
    this.createListStatePanel();
    this.createSourceDisplay();
    this.createHUD();
    addTutorialReplayButton(this, W, this.lifeIcons[4].x, this.lifeIcons[0].y);
    this.createExpressionMonitor();
    this.createBit();
    this.setupDragEvents();

    cam.fadeIn(700, 3, 3, 5);
    this.checkTutorial();
  }

  update(time, delta) {
    this.updateParticles(time, delta);
    this.updateChandelierFlicker(time);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // BACKGROUND / ARCHIVE INTERIOR
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l46_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l46_dot", 8, 8);
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
    [260, 940].forEach((x) => {
      g.fillStyle(0x0a0704, 1);
      g.lineStyle(1, C_BRASS, 0.5);
      g.fillRoundedRect(x, 40, 100, 70, 2);
      g.strokeRoundedRect(x, 40, 100, 70, 2);
      g.fillStyle(0x3a2618, 0.4);
      g.fillEllipse(x + 50, 75, 40, 50);
    });
  }

  createChandelier() {
    const c = this.add.container(640, 68).setDepth(2);
    const g = this.add.graphics();
    g.fillStyle(0x3a2618, 1);
    g.lineStyle(1, C_BRASS, 0.6);
    this._drawHexPath(g, 0, 0, 14);
    g.fillPath(); g.strokePath();
    c.add(g);
    this._bulbs = [];
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i;
      const bx = Math.cos(a) * 20, by = Math.sin(a) * 20;
      const bulb = this.add.circle(bx, by, 3, 0xffa726, 0.5);
      c.add(bulb);
      this._bulbs.push({ bulb, phase: Phaser.Math.Between(0, 3000) });
    }
    const cone = this.add.graphics().setDepth(1);
    cone.fillStyle(0xffa726, 0.03);
    cone.fillTriangle(640, 90, 500, 300, 780, 300);
    this._chandelier = c;
  }

  _drawHexPath(g, x, y, r) {
    g.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i - Math.PI / 2;
      const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
      if (i === 0) g.moveTo(px, py); else g.lineTo(px, py);
    }
    g.closePath();
  }

  updateChandelierFlicker(time) {
    if (!this._bulbs) return;
    this._bulbs.forEach((b) => {
      const t = (time + b.phase) % 3000;
      const flick = t > 2850 ? Phaser.Math.FloatBetween(0.2, 0.45) : 0.5;
      if (b.bulb.active) b.bulb.setAlpha(flick);
    });
  }

  createWallFrames() {}

  createArchiveBanner() {
    const g = this.add.graphics().setDepth(2);
    g.fillStyle(0x0a0704, 1);
    g.lineStyle(1, C_BRASS, 0.5);
    g.fillRoundedRect(230, 30, 340, 26, 3);
    g.strokeRoundedRect(230, 30, 340, 26, 3);
    this.add.text(400, 43, "THE ARCHIVE", { font: "bold 16px Georgia", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.7).setDepth(3);
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

  createLectern() {
    const g = this.add.graphics().setDepth(3);
    g.fillStyle(0x241a0e, 1);
    g.lineStyle(1, C_BRASS, 0.5);
    g.fillRoundedRect(40, 590, 60, 80, 3);
    g.strokeRoundedRect(40, 590, 60, 80, 3);
    g.fillStyle(0xe0d6b8, 0.3);
    g.fillRect(48, 585, 20, 4);
    g.fillRect(70, 585, 20, 4);
  }

  createReadingLamp() {
    const g = this.add.graphics().setDepth(3);
    g.lineStyle(2, 0x3a2618, 0.6);
    g.lineBetween(1220, 90, 1180, 105);
    g.fillStyle(0xffa726, 0.4);
    g.fillCircle(1180, 105, 5);
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
  // BOOKSHELF (the ArrayList)
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
    stampBg.fillRoundedRect(140, 138, 220, 24, 3);
    stampBg.strokeRoundedRect(140, 138, 220, 24, 3);
    [[144, 142], [356, 142], [144, 156], [356, 156]].forEach(([x, y]) => { stampBg.fillStyle(C_BRASS, 0.6); stampBg.fillCircle(x, y, 1.5); });
    this.typeStampText = this.add.text(250, 150, "", { font: "bold 14px Courier New", color: HEX_CYAN }).setOrigin(0.5).setDepth(6);

    const sizeBg = this.add.graphics().setDepth(5);
    sizeBg.fillStyle(0x0a0704, 1);
    sizeBg.lineStyle(1, C_BRASS, 0.6);
    sizeBg.fillRoundedRect(340, 138, 76, 20, 10);
    sizeBg.strokeRoundedRect(340, 138, 76, 20, 10);
    this.sizeCounterText = this.add.text(378, 148, "size: 0", { font: "bold 13px Courier New", color: HEX_BRASS }).setOrigin(0.5).setDepth(6);

    this.shelfLedges = [];
    this.shelfIndexPlates = [];
    for (let i = 0; i < 8; i++) {
      const y = SHELF_BASE_Y - i * SHELF_STEP;
      const ledgeG = this.add.graphics().setDepth(4);
      ledgeG.fillStyle(0x3a2618, 0.6);
      ledgeG.lineStyle(1, 0x8a6435, 0.4);
      ledgeG.fillRoundedRect(SHELF_CX - 170, y - 23, 340, 46, 3);
      ledgeG.strokeRoundedRect(SHELF_CX - 170, y - 23, 340, 46, 3);
      ledgeG.lineStyle(1, 0x8a6435, 0.3);
      for (let dx = -160; dx < 160; dx += 6) ledgeG.lineBetween(SHELF_CX + dx, y + 20, SHELF_CX + dx + 3, y + 20);

      const plateG = this.add.graphics().setDepth(6);
      plateG.fillStyle(0x0a0704, 1);
      plateG.lineStyle(1, C_BRASS, 0.7);
      plateG.fillRoundedRect(78, y - 8, 24, 16, 2);
      plateG.strokeRoundedRect(78, y - 8, 24, 16, 2);
      const idxText = this.add.text(90, y, String(i), { font: "bold 16px Courier New", color: HEX_GRAY }).setOrigin(0.5).setDepth(7);

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
    this.updateTypeEcho(listType);
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

  clearShelf() {
    this.shelfBookSprites.forEach((b) => b.container.destroy());
    this.shelfBookSprites = [];
    this.currentList = [];
    this.updateSizeCounter();
    this.updateListStatePanel();
    this.shelfIndexPlates.forEach((p) => p.g.clear().fillStyle(0x0a0704, 1).lineStyle(1, C_BRASS, 0.7).fillRoundedRect(78, p.y - 8, 24, 16, 2).strokeRoundedRect(78, p.y - 8, 24, 16, 2));
  }

  updateSizeCounter() {
    this.sizeCounterText.setText(`size: ${this.currentList.length}`);
    this.tweens.add({ targets: this.sizeCounterText, scale: 1.3, duration: 120, yoyo: true });
  }

  // ══════════════════════════════════════════════════════════════
  // BOOK PREPARATION AREA
  // ══════════════════════════════════════════════════════════════

  createBookPreparationArea() {
    const g = this.add.graphics().setDepth(4);
    g.fillStyle(0x241a0e, 1);
    g.lineStyle(1, 0x8a6435, 0.5);
    g.fillRoundedRect(PREP_X0, PREP_Y0, PREP_X1 - PREP_X0, PREP_Y1 - PREP_Y0, 4);
    g.strokeRoundedRect(PREP_X0, PREP_Y0, PREP_X1 - PREP_X0, PREP_Y1 - PREP_Y0, 4);
    this.add.text(PREP_X0 + 8, PREP_Y0 + 6, "NEW ENTRY", { font: "bold 12px Georgia", color: HEX_BRASS }).setAlpha(0.7).setDepth(5);
    this.prepContainer = this.add.container(0, 0).setDepth(6);
  }

  clearPrep() { this.prepContainer.removeAll(true); }

  // ══════════════════════════════════════════════════════════════
  // BOOK CREATION + PLACEMENT ANIMATION
  // ══════════════════════════════════════════════════════════════

  _makeBookVisual(entry, x, y) {
    const color = this._typeColorInt(entry.type);
    const colorHex = this._typeColorHex(entry.type);
    const display = this._displayValueOnSpine(entry);
    const c = this.add.container(x, y);
    const g = this.add.graphics();
    g.fillStyle(color, 0.85);
    g.lineStyle(2, Phaser.Display.Color.IntegerToColor(color).darken(30).color, 1);
    g.fillRoundedRect(-30, -20, 60, 40, 2);
    g.strokeRoundedRect(-30, -20, 60, 40, 2);
    g.lineStyle(1, 0xffffff, 0.4);
    g.lineBetween(-28, -18, 28, -18);
    g.lineBetween(-28, 18, 28, 18);
    const useVertical = display.length > 5;
    const txt = this.add.text(0, 0, display, { font: "bold 14px Georgia", color: "#0a0704" }).setOrigin(0.5);
    if (useVertical) txt.setAngle(-90);
    c.add([g, txt]);
    return { container: c, text: txt, colorHex, entry };
  }

  async createBookInPrep(entry) {
    // NOTE: the book lives directly on the scene, NOT inside
    // prepContainer — earlier books that already settled on shelves
    // must survive the next book's arrival.
    const x = PREP_X0 + 70, y = PREP_Y0 + 47;
    const book = this._makeBookVisual(entry, x, y);
    book.container.setAlpha(0).setScale(0.6).setDepth(6);
    await new Promise((res) => { this.tweens.add({ targets: book.container, alpha: 1, scale: 1, duration: 200, ease: "Back.easeOut", onComplete: res }); });
    return book;
  }

  /** Flies a book from prep to its target shelf and settles it — or, on
   * type mismatch, plays the rejection choreography. Ground truth (this
   * .currentList) is only mutated on a genuine success. */
  async addBookToShelf(entry) {
    const book = await this.createBookInPrep(entry);
    if (!this._alive) return { ok: true };

    const targetOk = this._typeMatchesShelf(entry.type, this.currentListType);
    const idx = this.currentList.length;
    const targetY = idx < 8 ? SHELF_BASE_Y - idx * SHELF_STEP : SHELF_BASE_Y - 7 * SHELF_STEP;

    await new Promise((res) => {
      this.tweens.add({
        targets: book.container, x: SHELF_CX, y: targetY - 60, angle: Phaser.Math.Between(-3, 3), duration: 350, ease: "Sine.easeInOut", onComplete: res,
      });
    });
    if (!this._alive) return { ok: true };

    if (!targetOk) {
      return await this.rejectBook(book, idx);
    }

    const plate = this.shelfIndexPlates[idx];
    if (plate) {
      this.tweens.add({ targets: plate.text, scale: 1.5, duration: 150, yoyo: true });
      plate.text.setColor(this._typeColorHex(entry.type));
    }
    await new Promise((res) => {
      this.tweens.add({ targets: book.container, y: targetY, angle: 0, duration: 200, ease: "Sine.easeIn", onComplete: res });
    });
    this.tweens.add({ targets: book.container, y: targetY - 2, duration: 60, yoyo: true });
    const label = this.add.text(SHELF_CX, targetY + 26, `[${idx}]`, { font: "bold 10px Courier New", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.6).setDepth(6);
    book.container.add(label);

    const p = this.add.particles(SHELF_CX, targetY + 20, "l46_dot", { speed: { min: 30, max: 70 }, angle: { min: 200, max: 340 }, scale: { start: 0.5, end: 0 }, lifespan: 220, tint: [book.colorHex.replace("#", "0x")], emitting: false }).setDepth(8);
    p.explode(4);
    this.time.delayedCall(300, () => p.destroy());

    this.currentList.push(entry);
    this.shelfBookSprites.push(book);
    this.updateSizeCounter();
    this.updateListStatePanel();
    await this.delay(80);
    return { ok: true };
  }

  async rejectBook(book, idx) {
    const plate = this.shelfIndexPlates[Math.min(idx, 7)];
    if (plate) {
      const origColor = plate.text.style.color;
      plate.text.setColor(HEX_RED);
      this.tweens.add({ targets: plate.g, alpha: 0.3, duration: 100, yoyo: true, repeat: 2 });
      this.time.delayedCall(900, () => { if (plate.text.active) plate.text.setColor(HEX_GRAY); });
    }
    await new Promise((res) => {
      this.tweens.add({ targets: book.container, x: book.container.x - 40, y: book.container.y - 20, angle: -20, duration: 220, ease: "Cubic.easeOut", onComplete: res });
    });
    const p = this.add.particles(book.container.x, book.container.y, "l46_dot", { speed: { min: 50, max: 130 }, angle: { min: 0, max: 360 }, scale: { start: 0.7, end: 0 }, lifespan: 260, tint: [0xf44336], emitting: false }).setDepth(9);
    p.explode(8);
    book.container.destroy();
    this.time.delayedCall(350, () => p.destroy());

    const stamp = this.add.text(SHELF_CX, SHELF_Y0 + 60, "TYPE MISMATCH", { font: "bold 16px Courier New", color: HEX_RED }).setOrigin(0.5).setAngle(-8).setAlpha(0).setDepth(20);
    this.tweens.add({ targets: stamp, alpha: 1, duration: 150 });
    this.screenShake(0.005, 180);
    this.time.delayedCall(1600, () => { if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 200, onComplete: () => stamp.destroy() }); });
    this.showCompileErrorStamp();
    await this.delay(300);
    return { ok: false, crash: "type_mismatch" };
  }

  _typeMatchesShelf(argType, listType) {
    const map = { String: "string", Integer: "int", Double: "double", Character: "char", Boolean: "boolean" };
    return map[listType] === argType;
  }

  showCompileErrorStamp() {
    const stamp = this.add.text(SHELF_CX, 90, "COMPILE ERROR", { font: "bold 19px Arial", color: HEX_RED }).setOrigin(0.5).setDepth(30).setScale(1.4).setAngle(-6).setAlpha(0);
    this.roundElements.push(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 180 });
    this.time.delayedCall(1000, () => { if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 200, onComplete: () => stamp.destroy() }); });
  }

  screenShake(intensity = 0.004, duration = 150) {
    this.cameras.main.shake(duration, intensity);
  }

  // ══════════════════════════════════════════════════════════════
  // LIST STATE PANEL
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
    this.add.text(PANEL_X + 12, PANEL_Y + 16, "LIST STATE", { font: "bold 13px Georgia", color: HEX_BRASS }).setOrigin(0, 0.5).setDepth(12);
    this.syncDot = this.add.circle(PANEL_X + PANEL_W - 16, PANEL_Y + 16, 3, C_GREEN_BRIGHT, 0.7).setDepth(12);
    this.tweens.add({ targets: this.syncDot, alpha: 0.3, duration: 700, yoyo: true, repeat: -1 });

    this.typeEchoText = this.add.text(PANEL_X + PANEL_W - 10, PANEL_Y + 40, "", { font: "bold 11px Courier New", color: HEX_GRAY }).setOrigin(1, 0.5).setAlpha(0.6).setDepth(12);
    this.bracketText = this.add.text(PANEL_X + PANEL_W / 2, PANEL_Y + 110, "[]", { font: "bold 17px Courier New", color: HEX_GRAY }).setOrigin(0.5).setDepth(12);
    this.panelSizeText = this.add.text(PANEL_X + PANEL_W / 2, PANEL_Y + 150, "size: 0", { font: "13px Courier New", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.85).setDepth(12);
    this.panelIndexText = this.add.text(PANEL_X + PANEL_W / 2, PANEL_Y + 175, "", { font: "bold 12px Courier New", color: "#8a6435" }).setOrigin(0.5).setAlpha(0.7).setDepth(12);
  }

  updateTypeEcho(listType) {
    const colorMap = { String: HEX_CYAN, Integer: HEX_GOLD, Double: HEX_ORANGE, Character: HEX_CYAN, Boolean: HEX_VIOLET };
    this.typeEchoText.setText(`<${listType}>`).setColor(colorMap[listType] || HEX_GRAY);
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
    this.tweens.add({ targets: this.bracketText, scale: 1.08, duration: 120, yoyo: true });
  }

  // ══════════════════════════════════════════════════════════════
  // SOURCE DISPLAY / EXPRESSION MONITOR
  // ══════════════════════════════════════════════════════════════

  createSourceDisplay() {
    this.sourceContainer = this.add.container(0, 0).setDepth(15);
  }

  _syntaxTokenize(line) {
    const tokens = [];
    const re = /("(?:[^"\\]|\\.)*")|(\bArrayList\b)|(<\w*>)|(\bnew\b)|([A-Za-z_]\w*(?=\.add\())|(\.add\b)|([(){};.,=])/g;
    let last = 0, m;
    const plain = (t) => t && tokens.push({ t, c: "#e0e0e0" });
    while ((m = re.exec(line))) {
      if (m.index > last) plain(line.slice(last, m.index));
      if (m[1]) tokens.push({ t: m[1], c: HEX_CYAN });
      else if (m[2]) tokens.push({ t: m[2], c: "#66bb6a" });
      else if (m[3]) tokens.push({ t: m[3], c: HEX_GOLD });
      else if (m[4]) tokens.push({ t: m[4], c: "#66bb6a" });
      else if (m[5]) tokens.push({ t: m[5], c: "#ff8a65" });
      else if (m[6]) tokens.push({ t: m[6], c: "#ffd740" });
      else if (m[7]) tokens.push({ t: m[7], c: "#78909c" });
      last = m.index + m[0].length;
    }
    if (last < line.length) plain(line.slice(last));
    return tokens.length ? tokens : [{ t: line, c: "#e0e0e0" }];
  }

  updateSourceDisplay(lines) {
    this.sourceContainer.removeAll(true);
    const fontSize = lines.length > 2 ? 11 : 13;
    const lineH = fontSize + 6;
    lines.forEach((line, i) => {
      const tokens = this._syntaxTokenize(line);
      const measured = tokens.map((t) => { const tmp = this.add.text(0, 0, t.t, { font: `bold ${fontSize}px Courier New` }); const w = tmp.width; tmp.destroy(); return w; });
      const totalW = measured.reduce((a, b) => a + b, 0);
      let x = 640 - totalW / 2;
      const y = 90 + i * lineH - ((lines.length - 1) * lineH) / 2;
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
    this.monitorText = this.add.text(W / 2, 32, "", { font: "14px Courier New", color: "#e8dfc8" }).setOrigin(0.5).setDepth(51);
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

    this.add.text(20, 14, "THE ARCHIVE", { font: "bold 17px Georgia", color: "#b0bec5" }).setDepth(50);
    this.add.text(20, 32, "Accretion Phase — ArrayList Methods: add()", { font: "13px Arial", color: "#546e7a" }).setDepth(50);

    this.add.text(1060, 8, "SCORE", { font: "11px Arial", color: "#546e7a" }).setDepth(50);
    this.scoreText = this.add.text(1060, 20, "0", { font: "bold 19px Arial", color: "#ffffff" }).setDepth(50);
    this.comboText = this.add.text(1060, 42, "×1", { font: "bold 14px Arial", color: HEX_GOLD }).setDepth(50);

    this.lifeIcons = [];
    for (let i = 0; i < 5; i++) {
      const lg = this.add.graphics({ x: 1150 + i * 20, y: 24 }).setDepth(50);
      lg.lineStyle(2, C_BRASS, 1);
      lg.strokeRoundedRect(-5, -7, 10, 14, 1);
      lg.lineStyle(1, C_BRASS, 0.6);
      lg.lineBetween(-5, 0, 5, 0);
      this.lifeIcons.push(lg);
    }
  }

  // ══════════════════════════════════════════════════════════════
  // BIT — archivist variant
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
    const stamp = this.add.graphics();
    stamp.lineStyle(2, C_BRASS, 0.7);
    stamp.lineBetween(16, 10, 24, 4);
    stamp.fillStyle(0x241a0e, 1);
    stamp.fillRoundedRect(22, 0, 6, 6, 1);
    c.add([g, cape, eye, pupil, gloveL, gloveR, tip, stamp]);
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
    const t = this.add.text(x, y, text, { font: "bold 12px Arial", color: colorHex }).setOrigin(0.5).setDepth(70).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 200 });
    this.time.delayedCall(1800, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() }); });
    return t;
  }

  createFloatingText(x, y, text, colorHex, font = "bold 15px Arial", hold = 1400) {
    const t = this.add.text(x, y, text, { font, color: colorHex, wordWrap: { width: 300 }, align: "center" }).setOrigin(0.5).setDepth(31).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 180 });
    this.time.delayedCall(hold, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() }); });
    return t;
  }

  createConfetti(x, y, count = 30) {
    const p = this.add.particles(x, y, "l46_dot", {
      speed: { min: 80, max: 240 }, angle: { min: 0, max: 360 }, scale: { start: 0.9, end: 0 }, lifespan: 500,
      tint: [C_BRASS, C_GOLD, C_ORANGE, C_CYAN, 0xffffff], emitting: false,
    }).setDepth(75);
    p.explode(count);
    this.time.delayedCall(900, () => p.destroy());
  }

  // ══════════════════════════════════════════════════════════════
  // EVALUATOR — honest ArrayList<T>.add() interpreter
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

  /** Parses+executes an ArrayList<T> program line by line, honestly
   * mutating this.currentList only on genuine successful adds. Returns
   * {ok} — false on the first compile-time rejection or malformed call. */
  async runProgram(sourceLines) {
    for (const rawLine of sourceLines) {
      if (!this._alive) return { ok: true };
      const line = rawLine.trim();
      if (!line) continue;
      const declMatch = line.match(/^ArrayList<(\w+)>\s+\w+\s*=\s*new ArrayList<>\(\);$/);
      if (declMatch) { this.setShelfType(declMatch[1]); continue; }
      const addMatch = line.match(/^\w+\.add\((.*)\);$/);
      if (addMatch) {
        const args = this._splitArgs(addMatch[1]);
        if (args.length !== 1) {
          this.showCompileErrorStamp();
          this.screenShake(0.004, 150);
          await this.delay(400);
          return { ok: false, crash: "wrong_arity" };
        }
        const evalResult = this._evalAddArg(args[0], this.currentListType);
        if (!evalResult.ok) {
          const outcome = await this.addBookToShelf({ value: this._guessedValue(args[0]), type: this._guessedType(args[0]) });
          return outcome;
        }
        const outcome = await this.addBookToShelf(evalResult);
        if (!outcome.ok) return outcome;
        continue;
      }
    }
    return { ok: true };
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
    await this.delay(400); if (!A()) return;
    await this.bitSay("Welcome to the Archive, Curator. In prior wings you handled ONE value at a time — a String, an int, a line of user input. Here we handle MANY values at once, in ORDER. This is an ArrayList — a growing shelf of typed volumes.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4800)]); if (!A()) return;
    this.hideBubble();

    this.updateSourceDisplay(["ArrayList<String> books = new ArrayList<>();"]);
    this.setShelfType("String");
    await this.bitSay("The type stamp on the shelf declares what it holds — 'ArrayList<String>' means this shelf accepts ONLY String books. That's the generic type parameter, in the angle brackets. It's a promise: nothing else fits here.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();

    this.updateSourceDisplay(["ArrayList<String> books = new ArrayList<>();", 'books.add("Hamlet");']);
    await this.addBookToShelf({ value: "Hamlet", type: "string" });
    if (!A()) return;
    await this.bitSay("The first book always goes on shelf 0. Not shelf 1 — shelf 0. Java lists start counting at zero, same as Strings do.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();

    this.updateSourceDisplay(["ArrayList<String> books = new ArrayList<>();", 'books.add("Hamlet");', 'books.add("Macbeth");']);
    await this.addBookToShelf({ value: "Macbeth", type: "string" });
    if (!A()) return;
    await this.bitSay("Every add() places the new book at the NEXT empty position. Hamlet stays at 0; Macbeth takes 1. The list REMEMBERS the order — first in, lowest index.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();

    this.updateSourceDisplay(["ArrayList<String> books = new ArrayList<>();", 'books.add("Hamlet");', 'books.add("Macbeth");', "books.add(42);"]);
    await this.addBookToShelf({ value: 42, type: "int" });
    if (!A()) return;
    await this.bitSay("REJECTED! An Integer book cannot land on a String shelf — the compiler catches this BEFORE the program runs. The angle brackets are a promise, and Java enforces it. Match your types every time.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();

    this.clearShelf();
    this.updateSourceDisplay(["ArrayList<Integer> scores = new ArrayList<>();", "scores.add(85);", "scores.add(90);"]);
    this.setShelfType("Integer");
    await this.addBookToShelf({ value: 85, type: "int" });
    if (!A()) return;
    await this.addBookToShelf({ value: 90, type: "int" });
    if (!A()) return;
    await this.bitSay("Different type, same behavior. Integer shelf, integer books. That number 85 is technically an 'int' — Java quietly wraps it into an Integer for you when adding. This convenience is called autoboxing, and it's why beginners rarely notice the difference. The shelf's rules are unchanged: first in gets shelf 0.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(5000)]); if (!A()) return;
    this.hideBubble();

    await this.bitSay("One shelf, one type, growing forever — that's the ArrayList promise. Now: your first shift begins. To your post, Curator!");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(3500)]); if (!A()) return;
    this.hideBubble();

    try { localStorage.setItem(TUTORIAL_KEY, "true"); } catch (_) {}
    this.clearShelf();
    this.updateSourceDisplay([]);
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
    this.clearShelf();
    this.setShelfType(config.listType);
    this.updateSourceDisplay([]);

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
    const c = this.add.container(640, 490).setDepth(40).setAlpha(0);
    const g = this.add.graphics();
    g.fillStyle(0x1a0e05, 0.95);
    g.fillRoundedRect(-260, -40, 520, 80, 10);
    g.lineStyle(1, C_BRASS, 0.5);
    g.strokeRoundedRect(-260, -40, 520, 80, 10);
    const badge = this.add.circle(-230, -10, 16, C_BRASS);
    const badgeT = this.add.text(-230, -10, String(this.currentRound + 1), { font: "bold 16px Arial", color: "#0a0704" }).setOrigin(0.5);
    const t = this.add.text(-200, -10, promptText, { font: "16px Arial", color: "#e8dfc8", wordWrap: { width: 420 } }).setOrigin(0, 0.5);
    c.add([g, badge, badgeT, t]);
    this.tweens.add({ targets: c, alpha: 1, y: 490, duration: 250 });
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
      const txt = this.add.text(0, 0, label, { font: "bold 15px Courier New", color: "#e8dfc8" }).setOrigin(0.5);
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

    this.roundElements.filter((e) => e !== bubbleContainer).forEach((e) => e.disableInteractive && e.disableInteractive());
    const g = bubbleContainer.list[0];
    g.clear();
    g.fillStyle(0x1a0e05, 1);
    g.fillRoundedRect(-130, -25, 260, 50, 10);
    g.lineStyle(2, correct ? C_GREEN_BRIGHT : C_RED, 1);
    g.strokeRoundedRect(-130, -25, 260, 50, 10);
    if (!correct) this.tweens.add({ targets: bubbleContainer, x: bubbleContainer.x + 5, duration: 40, yoyo: true, repeat: 4 });

    await this.delay(200);
    if (!this._alive) return;
    this.clearShelf();
    this.setShelfType(config.listType);
    await this.runProgram(config.source);
    if (config.revealNote) this.createFloatingText(PANEL_X + PANEL_W / 2, PANEL_Y + PANEL_H + 30, config.revealNote, HEX_GRAY, "13px Arial", 2800);
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
      await this.showBitFeedback(MISCONCEPTION_FEEDBACK[opt.tag] || "Not quite — watch the shelf and try again.");
      if (!this._alive) return;
      this.clearRound();
      this.clearShelf();
      this.setShelfType(config.listType);
      this.updateSourceDisplay([]);
      this.setupPredict(config);
    }
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE D — COMMAND (drag cartridges)
  // ══════════════════════════════════════════════════════════════

  setupCommand(config) {
    this.renderCommandSkeleton(config);
    this.updateExpressionMonitor(config.mission);
    this.showQuestionCard(config.mission);
    this.createCartridgeTray(config);
    this._commandFirstFail = true;
    // input is still locked from the previous round's answer click —
    // without this unlock the command rounds' cartridges are undraggable
    // (the same soft-lock bug class found in L30–L45's startMission).
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

  /** Renders a command-round skeleton with REAL dashed drop-target
   * placeholders for each <slot:id> token (matching the established
   * command-round pattern from L27 onward) instead of literal
   * "<slot:call1>" text. */
  renderCommandSkeleton(config) {
    this.sourceContainer.removeAll(true);
    this.slotDefs = {};
    const lines = config.skeleton;
    const fontSize = lines.length > 2 ? 11 : 13;
    const lineH = fontSize + 6;
    lines.forEach((rawLine, i) => {
      const y = 90 + i * lineH - ((lines.length - 1) * lineH) / 2;
      const slotMatch = rawLine.match(/^<slot:(\w+)>$/);
      if (slotMatch) {
        const slotId = slotMatch[1];
        const w = 200, h = fontSize + 10;
        this.slotDefs[slotId] = { id: slotId, rect: { x: 640 - w / 2, y: y - h / 2, w, h } };
        this._drawSlotPlaceholder(slotId, config);
        return;
      }
      const tokens = this._syntaxTokenize(rawLine);
      const measured = tokens.map((t) => { const tmp = this.add.text(0, 0, t.t, { font: `bold ${fontSize}px Courier New` }); const w = tmp.width; tmp.destroy(); return w; });
      const totalW = measured.reduce((a, b) => a + b, 0);
      let x = 640 - totalW / 2;
      tokens.forEach((tok, ti) => {
        const t = this.add.text(x, y, tok.t, { font: `bold ${fontSize}px Courier New`, color: tok.c }).setOrigin(0, 0.5);
        this.sourceContainer.add(t);
        x += measured[ti];
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
      const label = this.add.text(x + w / 2, y + h / 2, hintDef ? hintDef.hint : "", { font: "italic 11px Courier New", color: "#5a4a30" }).setOrigin(0.5).setDepth(17);
      def.hintLabel = label;
      this.sourceContainer.add(label);
    }
  }

  createCartridgeTray(config) {
    const shuffled = Phaser.Utils.Array.Shuffle(config.cartridges.slice());
    let x = 60;
    const rowY = 600;

    shuffled.forEach((def) => {
      const style = { font: "bold 14px Courier New", color: HEX_CYAN };
      const label = def.label || def.code;
      const measure = this.add.text(0, 0, label, style);
      const w = measure.width + 20;
      measure.destroy();
      const home = { x: x + w / 2, y: rowY };
      x += w + 12;

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
      bg.fillRoundedRect(-60, -22, 120, 44, 10);
    };
    bdraw(false, false);
    const bt = this.add.text(0, 0, "FILE", { font: "bold 16px Arial", color: "#0a0704" }).setOrigin(0.5);
    btn.add([bg, bt]);
    btn.setSize(120, 44);
    btn.on("pointerover", () => { if (this._fileReady) { bdraw(true, true); btn.setScale(1.03); } });
    btn.on("pointerout", () => { bdraw(this._fileReady, false); btn.setScale(1); });
    btn.on("pointerdown", () => { if (this._fileReady) this.onFilePressed(config); });
    this.fileButton = { c: btn, draw: bdraw };
    this.roundElements.push(btn);
    this.disableFileButton();
  }

  enableFileButton() { this._fileReady = true; this.fileButton.draw(true, false); this.fileButton.c.setInteractive({ useHandCursor: true }); }
  disableFileButton() { this._fileReady = false; this.fileButton.draw(false, false); this.fileButton.c.disableInteractive(); }

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
        this.updateFileButtonState();
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

  _slotDropZone(slotId) {
    const def = this.slotDefs[slotId];
    return def && def.rect ? def.rect : { x: 640 - 90, y: 84, w: 180, h: 24 };
  }

  _nearestOpenSlot(x, y) {
    let best = null, bestDist = 80;
    for (const id in this.slotDefs) {
      const placed = this.slotContents[id] || [];
      if (placed.length >= 1) continue;
      const zone = this._slotDropZone(id);
      const cx = zone.x + zone.w / 2, cy = zone.y + zone.h / 2;
      const dist = Phaser.Math.Distance.Between(x, y, cx, cy);
      const within = x >= zone.x - 50 && x <= zone.x + zone.w + 50 && y >= zone.y - 35 && y <= zone.y + zone.h + 35;
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
      const zone = this._slotDropZone(key);
      const cx = zone.x + zone.w / 2, cy = zone.y + zone.h / 2;
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
      const zone = this._slotDropZone(key);
      this.tweens.add({ targets: obj, x: zone.x + zone.w / 2, y: zone.y + zone.h / 2, duration: 150, ease: "Cubic.easeOut" });
      this._drawSlotPlaceholder(key);
      this.updateFileButtonState();
    } else {
      const home = obj.getData("home");
      this.tweens.add({ targets: obj, x: home.x, y: home.y, duration: 250, ease: "Back.easeOut" });
    }
  }

  updateFileButtonState() {
    const allFilled = Object.keys(this.slotDefs).every((id) => (this.slotContents[id] || []).length > 0);
    if (allFilled) this.enableFileButton(); else this.disableFileButton();
  }

  async onFilePressed(config) {
    this.inputLocked = true;
    this.disableFileButton();
    this.roundAttempts++;
    const timeMs = Math.round(this.time.now - this.roundStartTime);

    const slotIds = Object.keys(this.slotDefs).sort();
    const codes = slotIds.map((id) => this.slotContents[id][0].container.getData("code"));
    const tags = slotIds.map((id) => this.slotContents[id][0].container.getData("tag"));

    this.updateSourceDisplay(config.skeleton.map((line) => {
      const m = line.match(/<slot:(\w+)>/);
      if (!m) return line;
      const idx = slotIds.indexOf(m[1]);
      return idx >= 0 ? codes[idx] : line;
    }));

    this.clearShelf();
    this.setShelfType(config.listType);
    const fullSource = [config.skeleton[0], ...codes];
    await this.runProgram(fullSource);

    const listMatches = this.currentList.length === config.target.length &&
      this.currentList.every((e, i) => e.value === config.target[i].value && e.type === config.target[i].type);
    const success = listMatches;
    const firstFailTag = tags.find((t) => t) || null;

    this.logAttempt(config, success, codes.join(" | "), firstFailTag, timeMs);

    if (success) {
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
      await this.showBitFeedback(MISCONCEPTION_FEEDBACK[firstFailTag] || "That filing doesn't match the mission — check the shelf and try another cartridge.");
      if (!this._alive) return;
      this.inputLocked = false;
      this.clearShelf();
      this.setShelfType(config.listType);
      this.slotContents = {};
      this.renderCommandSkeleton(config);
      this.cartridges.forEach((cart) => {
        cart.container.setData("placedIn", null);
        const home = cart.container.getData("home");
        this.tweens.add({ targets: cart.container, x: home.x, y: home.y, duration: 200 });
      });
      this.disableFileButton();
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
      console.warn("Level46Scene: /api/wellbeing/predict-struggle unreachable, skipping behavioral signal for this level:", e);
    }
  }

  advanceRound() {
    if (this.currentRound === 2) this.runBehavioralCheck();
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
      const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
      this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });
      const title = this.add.text(640, 240, "ARCHIVES SEALED", { font: "bold 36px Georgia", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
      this.tweens.add({ targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut", onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }) });
      this.add.text(640, 310, `Score: ${this.score}`, { font: "21px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
      this.add.text(640, 350, `Rounds Completed: ${this.currentRound} / 12`, { font: "18px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);
      this._makeButton(525, 420, "RETURN TO THE STACKS", 200, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
      this._makeButton(755, 420, "RETURN TO MENU", 200, 50, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.start("MenuScene"));
    })();
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearRound();
    this.hideBubble();

    try { GameManager.completeLevel(45, Math.round((this.correctFirstTry / 12) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("arraylist_add_schema"); } catch (_) {}
    try {
      localStorage.setItem("level46_results", JSON.stringify({
        level: 46, concept: "arraylist_add", phase: "accretion",
        score: this.score, accuracy: this.correctFirstTry / 12, avgTime: this.totalTime / 12,
        comboMax: this.maxCombo, stars: this._starRating(), livesRemaining: this.lives,
        attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.archiveFinale().then(() => { if (this._alive) this.showScoreTally(); });
  }

  async archiveFinale() {
    this._bulbs.forEach((b) => { if (b.bulb.active) this.tweens.add({ targets: b.bulb, alpha: 1, duration: 500 }); });
    this.clearShelf();
    this.setShelfType("String");
    const word = "CATALOGED".split("");
    for (const letter of word) {
      if (!this._alive) return;
      await this.addBookToShelf({ value: letter, type: "string" });
    }
    this.createConfetti(SHELF_CX, SHELF_Y0 + 40, 36);
    await this.delay(500);
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

    const title = this.add.text(640, 190, "BOOKS FILED", { font: "bold 34px Georgia", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(91).setScale(0);
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
    bg.fillStyle(0x241a0e, 1);
    bg.lineStyle(1.5, C_BRASS, 1);
    for (let i = 0; i < 3; i++) bg.fillRect(-12 + i * 8, -10, 6, 20);
    badge.add(bg);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 1950 });
    const badgeLbl = this.add.text(640, 505, "add() SCHEMA ACQUIRED", { font: "bold 15px Arial", color: HEX_GOLD }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: badgeLbl, alpha: 1, duration: 300, delay: 2100 });

    this._makeButton(500, 545, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(760, 545, "NEXT: The Card Catalog →", 260, 44, { fill: 0x00733a, stroke: C_GREEN_BRIGHT, textColor: "#ffffff" }, () => {
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
