/**
 * Level 51 — "The Restoration Room" (ArrayList Methods: Restructuring
 * Phase — get() trilogy finale; the ArrayList Wing's second complete
 * trilogy)
 * ===========================================================================
 * The learner CONSTRUCTS complete list-READING programs — no multiple
 * choice. Reuses the L27→L48 code-canvas/parts-bin/RUN architecture. The
 * rig hosts the get-era apparatus: 50%-scale bookshelf, list-state panel,
 * the L50 Traversal Tracker, a prominent output ticker, and Scanner-tape/
 * container cameos for the cross-wing missions.
 *
 * A genuine mini-interpreter (never scripted) executes the assembled
 * program: bounds-checked gets with ghost retrievals, size() and
 * size() − 1 (the size-proof pattern), real for-loop traversals with
 * per-iteration tracker rows and the 200-iteration guard, accumulators
 * (both += and long form), the curriculum's FIRST dynamic index
 * (get(shelf) where shelf arrives from Scanner), toUpperCase via the
 * press cameo, and println with honest partial traces on mid-loop
 * crashes. Wrong builds yield their REAL outcomes — M2's hardcoded
 * get(2) genuinely passes the 3-list test and fails the 5-list test
 * (the one-green-one-red report is the mission's sharpest lesson), and
 * M4's uninitialized `int total;` is a genuine COMPILE error (Java's
 * definite-assignment rule: loop bodies may run zero times).
 */

import Phaser from "phaser";
import { GameManager } from "../../../../GameManager.js";
import { WellbeingAPI } from "../../../../../api/api.js";
import { BadgeSystem } from "../../../../BadgeSystem.js";
import { BehavioralRules } from "../../../../ml/BehavioralRules.js";

const W = 1280, H = 720;

const C_CYAN = 0x4fc3f7, C_GOLD = 0xffd740, C_ORANGE = 0xff9800, C_VIOLET = 0xb39ddb;
const C_GREEN_BRIGHT = 0x00e676, C_RED = 0xf44336, C_GRAY = 0x78909c, C_BRASS = 0xc8a05a;
const HEX_CYAN = "#4fc3f7", HEX_GOLD = "#ffd740", HEX_ORANGE = "#ff9800", HEX_VIOLET = "#b39ddb";
const HEX_GREEN_BRIGHT = "#00e676", HEX_RED = "#f44336", HEX_GRAY = "#78909c", HEX_BRASS = "#c8a05a";

const CX = 40, CY = 90, CW = 680, CH = 380;
const TAB_H = 34, GUTTER_W = 34, CODE_PAD = 10;
const CODE_X = CX + GUTTER_W + CODE_PAD;
const CODE_Y0 = CY + TAB_H + 14;
const LINE_H = 21;
const PX = 40, PY = 490, PW = 680, PH = 130;
const OX = 760, OY = 80, OW = 460, OH = 250;
const TAPE_Y = OY + 30;
const MS_X0 = OX + 12, MS_X1 = OX + 132, MS_CX = OX + 72;
const MS_TOP = OY + 58, MS_BOT = OY + 206, MS_BASE_Y = OY + 192, MS_STEP = 19;
const LP_X = OX + 146, LP_CX = OX + 216;
const TRK_X = OX + 300, TRK_W = 148;
const TICKER_Y = OY + 234;
const STRIP_Y = OY + OH + 15;
const RX = 760, RY = 345, RW = 460, RH = 125;
const BX = 760, BY = 490, BW = 460, BH = 130;
const TUTORIAL_KEY = "level51_tutorial_done";

// ══════════════════════════════════════════════════════════════
// MISSION CONFIGURATION
// ══════════════════════════════════════════════════════════════
const MISSIONS = [
  { mission: 1, title: "The Headline Report",
    brief: "The morning report announces the collection's featured title — the FIRST book. Print exactly:  Featured: <first element>",
    skeleton: ["import java.util.ArrayList;", "ArrayList<String> titles = new ArrayList<>();", 'titles.add("Dune");        // pre-filled', 'titles.add("Emma");        // pre-filled', 'titles.add("Ivanhoe");     // pre-filled', "", "System.out.println(<slot:arg>);"],
    slots: [{ id: "arg", hint: "the announcement", capacity: 1 }],
    palette: [
      { code: '"Featured: " + titles.get(0)', correct: true },
      { code: '"Featured: " + titles.get(1)', tag: "index_starts_at_one_belief" },
      { code: '"Featured: titles.get(0)"', tag: "variable_as_literal_belief" },
      { code: '"Featured: " + titles', tag: "whole_list_instead_of_element" },
      { code: '"Featured: " + titles.get("Dune")', tag: "get_by_value_belief" },
    ],
    tests: [
      { initialList: ["Dune", "Emma", "Ivanhoe"], expectedOutput: "Featured: Dune" },
    ],
    listName: "titles", listJavaType: "String",
    postMissionNote: "Retrieve, label, announce — the smallest reading machine there is. get(0) is the front of every collection.",
    concept: "get_into_println" },

  { mission: 2, title: "The Bookends",
    brief: "The shelf card lists the collection's bookends — first and last titles. The collection's LENGTH VARIES between shipments. Print exactly:  <first> ... <last>",
    skeleton: ["import java.util.ArrayList;", "ArrayList<String> titles = /* populated by test */;", "", "String first = <slot:first>;", "String last = <slot:last>;", 'System.out.println(first + " ... " + last);'],
    slots: [
      { id: "first", hint: "the first", capacity: 1 },
      { id: "last", hint: "the last (size-proof!)", capacity: 1 },
    ],
    sizeProofSlot: "last", sizeProofForm: "titles.get(titles.size() - 1)",
    palette: [
      { code: "titles.get(0)", correct: true },
      { code: "titles.get(titles.size() - 1)", correct: true },
      { code: "titles.get(2)", tag: "hardcoded_last_index" },
      { code: "titles.get(titles.size())", tag: "get_at_size_valid_belief" },
      { code: "titles.get(-1)", tag: "negative_index_belief" },
    ],
    tests: [
      { initialList: ["Dune", "Emma", "Ivanhoe"], expectedOutput: "Dune ... Ivanhoe" },
      { initialList: ["Iliad", "Odyssey", "Aeneid", "Beowulf", "Utopia"], expectedOutput: "Iliad ... Utopia" },
    ],
    listName: "titles", listJavaType: "String",
    postMissionNote: "The hardcoded index worked ONCE — the trap of the passing test. size() - 1 works forever. Write the size-proof form the FIRST time, every time.",
    concept: "size_proof_last_element" },

  { mission: 3, title: "The Full Catalog",
    brief: "The catalog printout lists every title, one per line, in shelf order. For [Dune, Emma, Ivanhoe]: Dune / Emma / Ivanhoe",
    skeleton: ["import java.util.ArrayList;", "ArrayList<String> titles = /* populated by test */;", "", "for (int i = 0; <slot:cond>; i++) {", "    System.out.println(<slot:body>);", "}"],
    slots: [
      { id: "cond", hint: "the bound", capacity: 1 },
      { id: "body", hint: "what to print", capacity: 1 },
    ],
    boundSlot: "cond", boundForm: "i < titles.size()",
    palette: [
      { code: "i < titles.size()", correct: true, slotId: "cond" },
      { code: "i <= titles.size()", tag: "loop_bound_inclusive_size", slotId: "cond" },
      { code: "i < titles.size() - 1", tag: "loop_bound_short_by_one", slotId: "cond" },
      { code: "titles.get(i)", correct: true, slotId: "body" },
      { code: "titles.get(0)", tag: "loop_body_fixed_index", slotId: "body" },
      { code: "i", tag: "loop_visits_indices_belief", slotId: "body" },
    ],
    tests: [
      { initialList: ["Dune", "Emma", "Ivanhoe"], expectedOutput: "Dune⏎Emma⏎Ivanhoe" },
      { initialList: ["Solo"], expectedOutput: "Solo" },
      { initialList: [], expectedOutput: "" },
    ],
    listName: "titles", listJavaType: "String",
    postMissionNote: "The canonical traversal — you'll write this loop ten thousand times. Strictly less-than, get(i), done. The empty case costs nothing and crashes nothing: that's the mark of a correct bound.",
    concept: "traversal_payoff_production" },

  { mission: 4, title: "The Fine Ledger",
    brief: "The overdue-fines ledger totals every fine in the list and reports it. For [150, 200, 75]: Total fines: 425",
    skeleton: ["import java.util.ArrayList;", "ArrayList<Integer> fines = /* populated by test */;", "", "<slot:init>", "for (int i = 0; i < fines.size(); i++) {", "    <slot:accumulate>", "}", 'System.out.println("Total fines: " + total);'],
    slots: [
      { id: "init", hint: "start the total", capacity: 1 },
      { id: "accumulate", hint: "grow the total", capacity: 1 },
    ],
    accumSlot: "accumulate",
    palette: [
      { code: "int total = 0;", correct: true, slotId: "init" },
      { code: "int total;", tag: "accumulator_not_initialized", slotId: "init" },
      { code: "int total = fines.get(0);", tag: "accumulator_seeded_wrong", slotId: "init" },
      { code: "total = total + fines.get(i);", correct: true, slotId: "accumulate" },
      { code: "total += fines.get(i);", correct: true, slotId: "accumulate" },
      { code: "total = fines.get(i);", tag: "accumulator_last_only_belief", slotId: "accumulate" },
      { code: "total = total + i;", tag: "loop_visits_indices_belief", slotId: "accumulate" },
    ],
    tests: [
      { initialList: [150, 200, 75], expectedOutput: "Total fines: 425" },
      { initialList: [500], expectedOutput: "Total fines: 500" },
      { initialList: [], expectedOutput: "Total fines: 0" },
    ],
    listName: "fines", listJavaType: "Integer",
    postMissionNote: "Start at zero, grow by each element, report once — the accumulator, the oldest pattern in computing. Both forms of the growth line are right; += is just the short spelling. The empty test proves the zero start: no fines, total 0, no crash.",
    concept: "accumulator_production" },

  { mission: 5, title: "The Lookup Window",
    brief: "A reader asks for a shelf by NUMBER. Read the index from the window slip, fetch the title, announce it. For list [Dune, Emma, Ivanhoe] and input '2': Shelf 2 holds: Ivanhoe",
    skeleton: ["import java.util.ArrayList;", "Scanner sc = new Scanner(System.in);", "ArrayList<String> titles = /* populated by test */;", "", "int shelf = <slot:read>;", 'System.out.println("Shelf " + shelf + " holds: " + <slot:fetch>);'],
    slots: [
      { id: "read", hint: "read the number", capacity: 1 },
      { id: "fetch", hint: "fetch the title", capacity: 1 },
    ],
    crossWing: true,
    palette: [
      { code: "sc.nextInt()", correct: true, slotId: "read" },
      { code: "sc.nextLine()", tag: "wrong_scanner_method", slotId: "read" },
      { code: "titles.get(shelf)", correct: true, slotId: "fetch" },
      { code: 'titles.get("shelf")', tag: "get_by_value_belief", slotId: "fetch" },
      { code: "titles.get(0)", tag: "loop_body_fixed_index", slotId: "fetch" },
      { code: "shelf", tag: "wrong_variable_used", slotId: "fetch" },
    ],
    tests: [
      { initialList: ["Dune", "Emma", "Ivanhoe"], input: ["2"], expectedOutput: "Shelf 2 holds: Ivanhoe" },
      { initialList: ["Dune", "Emma", "Ivanhoe"], input: ["0"], expectedOutput: "Shelf 0 holds: Dune" },
      { initialList: ["Iliad", "Odyssey"], input: ["1"], expectedOutput: "Shelf 1 holds: Odyssey" },
    ],
    listName: "titles", listJavaType: "String",
    postMissionNote: "Look what changed — the index isn't in your CODE anymore, it's in the READER'S HANDS. get(shelf) reads whatever position the data names. That's the leap from scripts to services.",
    concept: "dynamic_index_lookup" },

  { mission: 6, title: "The Grade Report",
    brief: "The academy's grade service reads a student NAME, then totals the term's scores and prints a two-line report. For list [80, 90, 70] and input 'ana': Student: ANA / Total: 240",
    skeleton: ["import java.util.ArrayList;", "Scanner sc = new Scanner(System.in);", "ArrayList<Integer> scores = /* populated by test */;", "", "String name = sc.nextLine();", "", "int total = 0;", "for (int i = 0; <slot:cond>; i++) {", "    <slot:accumulate>", "}", "", 'System.out.println("Student: " + <slot:loud>);', 'System.out.println("Total: " + total);'],
    slots: [
      { id: "cond", hint: "the bound", capacity: 1 },
      { id: "accumulate", hint: "grow the total", capacity: 1 },
      { id: "loud", hint: "name (LOUD)", capacity: 1 },
    ],
    boundSlot: "cond", boundForm: "i < scores.size()", accumSlot: "accumulate", crossWing: true,
    palette: [
      { code: "i < scores.size()", correct: true, slotId: "cond" },
      { code: "i <= scores.size()", tag: "loop_bound_inclusive_size", slotId: "cond" },
      { code: "total += scores.get(i);", correct: true, slotId: "accumulate" },
      { code: "total = total + scores.get(i);", correct: true, slotId: "accumulate" },
      { code: "total = scores.get(i);", tag: "accumulator_last_only_belief", slotId: "accumulate" },
      { code: "total += i;", tag: "loop_visits_indices_belief", slotId: "accumulate" },
      { code: "name.toUpperCase()", correct: true, slotId: "loud" },
      { code: "name", tag: "no_normalization", slotId: "loud" },
      { code: "name.toUpperCase", tag: "property_vs_method_syntax", slotId: "loud" },
      { code: '"name".toUpperCase()', tag: "literal_as_variable_belief", slotId: "loud" },
    ],
    tests: [
      { initialList: [80, 90, 70], input: ["ana"], expectedOutput: "Student: ANA⏎Total: 240" },
      { initialList: [100], input: ["kai"], expectedOutput: "Student: KAI⏎Total: 100" },
      { initialList: [], input: ["OK"], expectedOutput: "Student: OK⏎Total: 0" },
    ],
    listName: "scores", listJavaType: "Integer",
    postMissionNote: "Scanner heard the name. The traversal read every score without disturbing one. The accumulator grew the truth. String made it loud, println shipped it. Four wings on one bench, Master — and the shelf never changed. That is the reader's craft, complete.",
    concept: "four_wing_read_capstone" },
];

const MISCONCEPTION_FEEDBACK = {
  loop_bound_inclusive_size: "Look at the tracker — every element printed, then the red row at i = size. The <= ran one lap too many. Strictly less-than, always.",
  loop_bound_short_by_one: "The last title never printed — the bound stopped one early. i < size() visits everything; size() − 1 as a bound skips the end.",
  loop_body_fixed_index: "The same value came back every time — the body ignored the counter (or the reader). get(i) turns each position into its element; get(shelf) obeys the reader.",
  loop_visits_indices_belief: "You printed (or summed) shelf NUMBERS, not books. The counter is a position; get() converts it into the element.",
  hardcoded_last_index: "The report shows it — test one green, test two red. get(2) IS the last of a 3-list and the MIDDLE of a 5-list. size() − 1 survives every shipment.",
  get_at_size_valid_belief: "The red scan swept past the top shelf on every test — get(size) crashes on any list, always. The last shelf is size − 1.",
  negative_index_belief: "No negative indexing in Java — get(-1) crashes; there is no 'count from the end' shortcut. size() − 1 is the way.",
  accumulator_not_initialized: "The compile stamp — Java refuses to read an uninitialized local. Start the total at 0 explicitly.",
  accumulator_seeded_wrong: "The tracker shows the first fine counted TWICE — seeded at get(0), then added again by the loop. Start at 0; let the loop do all the counting. The empty test proves it: no fines must mean total 0.",
  accumulator_last_only_belief: "The total column REPLACED instead of growing — it ended as the last element alone. total = total + ... (or +=) grows; total = ... overwrites.",
  wrong_scanner_method: "The compile stamp — nextLine() hands back a String, and the int container refused it. A number needs nextInt().",
  get_by_value_belief: "get() takes an INDEX — a position, not a title. Java refused at compile time.",
  whole_list_instead_of_element: "The console shows brackets and commas — you printed the whole shelf. get(0) extracts the single featured title.",
  variable_as_literal_belief: "The call printed as LETTERS — it was trapped inside the quotes. Close the quote, then + the live call.",
  wrong_variable_used: "The number printed where the title belonged — 'shelf' holds the index; titles.get(shelf) holds the book.",
  index_starts_at_one_belief: "Index 0 is the first — the featured title lives at get(0). Zero-based, in every wing, forever.",
  no_normalization: "The report shows lowercase — the mission asked for LOUD. Uppercase before you announce.",
  property_vs_method_syntax: "The arc's oldest trap, at the Master's bench — parentheses on String methods! toUpperCase(). Some laws outlast every promotion.",
  literal_as_variable_belief: "'\"name\".toUpperCase()' shouts the WORD 'NAME', not the student. Drop the quotes to reach the variable.",
};

const HINTS = {
  1: "Close the label's quote, then + the live retrieval: \"Featured: \" + titles.get(0). Index 0 is the featured spot.",
  2: "The first is get(0), always. The last must survive ANY length — get(titles.size() - 1), never a hardcoded number.",
  3: "The bound is strictly less-than: i < titles.size(). The body prints titles.get(i) — the counter becomes the element.",
  4: "Start at zero: int total = 0. Grow inside the loop: total += fines.get(i) (or the long form). Never seed with an element.",
  5: "A number needs sc.nextInt(). Then get(shelf) — the variable, not quotes, not a fixed index — obeys the reader.",
  6: "Bound: i < scores.size(). Growth: total += scores.get(i). And LOUD means name.toUpperCase() — parentheses included.",
};

export class Level51Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level51Scene" });
  }

  init() {
    this.currentMission = 0;
    this.score = 0;
    this.displayScore = 0;
    this.lives = 5;
    this.flawlessCount = 0;
    this.runCount = 0;
    this.failedRunCount = 0;
    this.hintCount = 0;
    this.selfCorrectionCount = 0;
    this.traversalBoundProactive = {};
    this.sizeMinusOneProactive = {};
    this.accumulatorFormChoice = {};
    this.crossWingCleanFirstRun = {};
    this.attemptLog = [];
    this.missionElements = [];
    this.slotContents = {};
    this.slotDefs = {};
    this.missionStartTime = 0;
    this.missionRunsFailed = 0;
    this.missionHintUsed = false;
    this._runCountAtMissionStart = 0;
    this.paletteBlocks = [];
    this.inputLocked = true;
    this.gameEnded = false;
    this._alive = true;
    this._bubble = null;
    this._dragHoverSlotKey = null;
    this._firstRunMetricsRecorded = {};
    this.tapeState = [];
    this.currentList = [];
    this.currentListType = null;
    this.currentListName = "titles";
    this.shelfBookSprites = [];
    this._tickerLines = [];
    this._trackerRows = [];
    this._modalLockedInput = false;
    // "Review the basics" in the Bit menu sends the player back to this
    // wing's Accretion-phase intro (which has the real tutorial) instead of
    // restarting this drag-and-drop Restructuring-phase level with nothing
    // to review.
    this.baseTutorialScene = "Level49Scene";
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

    try { GameManager.incrementAttempt(50); } catch (_) {}

    this.createParticleTexture();
    this.createBackground();
    this.createRestorationInterior();
    this.createRestorationFloor();
    this.createGluePot();
    this.createMagnifierLamp();
    this.createMastersPlaque();
    this.createAmbientParticles();
    this.createCodeCanvas();
    this.createBlockPalette();
    this.createRunButton();
    this.createRigWindow();
    this.createMiniBookshelf();
    this.createMiniListStatePanel();
    this.createMiniTraversalTracker();
    this.createMiniOutputTicker();
    this.createMiniCrossWingCameos();
    this.createManifestStrip();
    this.createTestReportPanel();
    this.createMissionBriefPanel();
    this.createHUD();
    this.createBit();
    this.setupDragEvents();

    cam.fadeIn(700, 3, 3, 5);
    this.checkTutorial();
  }

  update(time, delta) {
    // Lock inputs so the player cannot drag blocks or click RUN while an ML
    // intervention modal is open. Tracks whether WE were the one who locked
    // it (this._modalLockedInput) so resuming here never clobbers a lock the
    // scene's own logic set for an unrelated reason (e.g. mid run-outcome
    // feedback) — only undo what this branch itself did.
    if (GameManager.interventionInFlight) {
      if (!this.inputLocked) this._modalLockedInput = true;
      this.inputLocked = true;
      return;
    } else if (this._modalLockedInput) {
      this._modalLockedInput = false;
      this.inputLocked = false;
      this.updateRunButtonState();
    }

    this.updateAmbient(time, delta);
    this.updateGluePotShimmer(time);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // BACKGROUND — the restoration atelier
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l51_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l51_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x0a0704).setDepth(0);
  }

  createRestorationInterior() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x0d0906, 1);
    g.fillRect(0, 0, W, 216);
    g.lineStyle(1, 0x241a0e, 0.3);
    for (let x = 0; x < W; x += 40) g.lineBetween(x, 0, x, 216);

    // mounted tool rail with silhouettes
    g.lineStyle(2, 0x3a2618, 0.5);
    g.lineBetween(180, 90, 520, 90);
    for (let x = 200; x <= 500; x += 60) g.lineBetween(x, 90, x, 96);
    this._toolGlints = [];
    const tools = this.add.graphics().setDepth(2);
    tools.lineStyle(1.5, 0x8a6435, 0.4);
    // bone folder
    tools.strokeEllipse(210, 120, 8, 34);
    // awl
    tools.strokeTriangle(258, 104, 266, 104, 262, 136);
    tools.strokeCircle(262, 100, 4);
    // brush
    tools.strokeRect(316, 100, 6, 20);
    for (let i = 0; i < 4; i++) tools.lineBetween(313 + i * 4, 120, 314 + i * 4, 134);
    // hammer
    tools.strokeRect(372, 102, 18, 8);
    tools.lineBetween(381, 110, 381, 138);
    // thread spool
    tools.strokeCircle(440, 116, 11);
    for (let i = -1; i <= 1; i++) tools.lineBetween(432, 112 + i * 5, 448, 114 + i * 5);
    [210, 262, 318, 381, 440].forEach((x) => this._toolGlints.push({ x, y: 116 }));

    // standing book press
    const p = this.add.graphics().setDepth(2);
    p.fillStyle(0x241a0e, 1);
    p.lineStyle(1, 0x3a2618, 1);
    p.fillRect(880, 70, 120, 14);
    p.strokeRect(880, 70, 120, 14);
    p.fillRect(880, 150, 120, 14);
    p.strokeRect(880, 150, 120, 14);
    p.lineStyle(2, 0x3a2618, 0.8);
    p.lineBetween(890, 46, 890, 70);
    p.lineBetween(990, 46, 990, 70);
    p.lineBetween(882, 46, 898, 46);
    p.lineBetween(982, 46, 998, 46);
    this.pressTopPlate = p;
    this.pressBook = this.add.rectangle(940, 118, 70, 30, 0x8a6435, 0.3).setDepth(2);

    const banner = this.add.graphics().setDepth(2);
    banner.fillStyle(0x0a0704, 1);
    banner.lineStyle(1, C_BRASS, 0.5);
    banner.fillRoundedRect(230, 12, 340, 28, 5);
    banner.strokeRoundedRect(230, 12, 340, 28, 5);
    this.add.text(400, 26, "THE RESTORATION ROOM", { font: "bold 15px Georgia", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.7).setDepth(3);
  }

  createRestorationFloor() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x1a0e05, 1);
    g.fillRect(0, 635, W, 85);
    g.lineStyle(2, 0x3a2618, 1);
    g.lineBetween(0, 637, W, 637);
    g.lineStyle(1, 0x3a2618, 0.3);
    for (let x = 60; x < W; x += 120) g.lineBetween(x, 640, x, 720);
    // scraps and thread ends
    g.fillStyle(0xe0d6b8, 0.15);
    g.fillRect(300, 660, 8, 3);
    g.fillRect(700, 690, 6, 4);
    g.fillStyle(0xc8a05a, 0.15);
    g.fillRect(950, 668, 10, 2);
    g.lineStyle(1, 0xc8a05a, 0.15);
    g.lineBetween(500, 700, 512, 694);
    g.lineBetween(1100, 655, 1113, 660);
  }

  createGluePot() {
    const g = this.add.graphics().setDepth(3);
    g.lineStyle(1.5, 0x3a2618, 0.5);
    g.strokeRoundedRect(28, 596, 26, 22, 4);
    g.lineBetween(48, 596, 56, 580);
    g.strokeCircle(57, 578, 2);
    this._gluePotShimmerAt = 0;
  }

  updateGluePotShimmer(time) {
    if (time - this._gluePotShimmerAt > 5000) {
      this._gluePotShimmerAt = time;
      const s = this.add.circle(41, 590, 2, 0xffa726, 0.4).setDepth(3);
      this.tweens.add({ targets: s, y: 578, alpha: 0, duration: 900, onComplete: () => s.destroy() });
    }
  }

  createMagnifierLamp() {
    const g = this.add.graphics().setDepth(4);
    g.lineStyle(2, 0x8a6435, 0.6);
    g.lineBetween(756, 40, 738, 54);
    g.lineBetween(738, 54, 726, 62);
    const lens = this.add.circle(720, 66, 12, 0x4fc3f7, 0.04).setDepth(4).setStrokeStyle(1.5, C_BRASS, 0.6);
    this.magnifierLens = lens;
  }

  glintMagnifier() {
    const glint = this.add.rectangle(710, 60, 2, 10, 0xffffff, 0.5).setDepth(5).setAngle(45);
    this.tweens.add({ targets: glint, x: 730, y: 72, alpha: 0, duration: 600, onComplete: () => glint.destroy() });
  }

  createMastersPlaque() {
    this.plaqueBg = this.add.graphics().setDepth(4);
    this.plaqueText = this.add.text(890, 60, "AT THE BENCH", { font: "bold 12px Georgia", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.4).setDepth(5);
    this._drawPlaque(C_BRASS);
    this._plaqueState = "idle";
  }

  _drawPlaque(strokeColor) {
    this.plaqueBg.clear();
    this.plaqueBg.fillStyle(0x0a0704, 1);
    this.plaqueBg.lineStyle(1.5, strokeColor, 1);
    this.plaqueBg.fillRoundedRect(840, 48, 100, 24, 4);
    this.plaqueBg.strokeRoundedRect(840, 48, 100, 24, 4);
  }

  setPlaque(state, text) {
    this._plaqueState = state;
    this.tweens.killTweensOf(this.plaqueText);
    if (state === "session") {
      this.plaqueText.setText("AT THE BENCH").setColor(HEX_BRASS).setAlpha(0.9).setFontSize(10);
      this._drawPlaque(C_BRASS);
      this.tweens.add({ targets: this.plaqueText, alpha: 0.6, duration: 500, yoyo: true, repeat: -1 });
      this.glintMagnifier();
    } else if (state === "gold") {
      this.plaqueText.setText(text || "AT THE BENCH").setColor(HEX_GOLD).setAlpha(1).setFontSize(text && text.length > 12 ? 8 : 10);
      this._drawPlaque(C_GOLD);
    } else {
      this.plaqueText.setText("AT THE BENCH").setColor(HEX_BRASS).setAlpha(0.4).setFontSize(10);
      this._drawPlaque(C_BRASS);
    }
  }

  createAmbientParticles() {
    this.ambient = [];
    const colors = [0xc8a05a, 0x8a6435, 0xa89078];
    for (let i = 0; i < 8; i++) {
      this.ambient.push(this.add.circle(Phaser.Math.Between(0, W), Phaser.Math.Between(220, 630), 1, Phaser.Utils.Array.GetRandom(colors), Phaser.Math.FloatBetween(0.03, 0.05)).setDepth(2));
    }
  }

  updateAmbient(time, delta) {
    if (!this.ambient) return;
    const step = 0.01 * (delta / 16.7);
    this.ambient.forEach((p, i) => {
      p.y += step;
      p.x += Math.sin(time * 0.0004 + i) * 0.03;
      if (p.y > 630) { p.y = 220; p.x = Phaser.Math.Between(0, W); }
    });
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

  // ══════════════════════════════════════════════════════════════
  // CODE CANVAS (L27→L48 architecture, reused)
  // ══════════════════════════════════════════════════════════════

  createCodeCanvas() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0d1117, 1);
    g.fillRoundedRect(CX, CY, CW, CH, 12);
    g.lineStyle(2, 0x21262d, 1);
    g.strokeRoundedRect(CX, CY, CW, CH, 12);

    const tab = this.add.graphics().setDepth(11);
    tab.fillStyle(0x10151d, 1);
    tab.fillRoundedRect(CX, CY, CW, TAB_H, { tl: 12, tr: 12, bl: 0, br: 0 });
    [0xf44336, 0xffd740, 0x00e676].forEach((c, i) => {
      tab.fillStyle(c, 0.5);
      tab.fillCircle(CX + 16 + i * 16, CY + TAB_H / 2, 5);
    });
    this.tabFilename = this.add.text(CX + CW - 12, CY + TAB_H / 2, "Restore1.java", { font: "13px Courier New", color: "#546e7a" }).setOrigin(1, 0.5).setDepth(11);

    this.lineHighlight = this.add.rectangle(CX + CW / 2, 0, CW - 4, LINE_H, 0xffab00, 0.06).setDepth(19).setVisible(false);
    this.codeContainer = this.add.container(0, 0).setDepth(20);
  }

  _syntaxTokens(line) {
    const tokens = [];
    const re = /("(?:[^"\\]|\\.)*")|(\/\/.*$|\/\* populated by test \*\/)|(\bimport\b|\bfor\b|\bint\b|\bString\b|\bnew\b|\bScanner\b|\bArrayList\b)|(<\w*>)|(\bSystem\.out\b)|(\bSystem\.in\b)|([A-Za-z_]\w*(?=\())|(>=|<=|==|!=|\+\+|--|\+=|[+\-*/><])|([(){}\[\];.,=])/g;
    let last = 0, m;
    const plain = (t) => t && tokens.push({ t, c: "#e0e0e0" });
    while ((m = re.exec(line))) {
      if (m.index > last) plain(line.slice(last, m.index));
      if (m[1]) tokens.push({ t: m[1], c: HEX_CYAN });
      else if (m[2]) tokens.push({ t: m[2], c: "#546e7a" });
      else if (m[3]) tokens.push({ t: m[3], c: "#4caf50" });
      else if (m[4]) tokens.push({ t: m[4], c: HEX_GOLD });
      else if (m[5]) tokens.push({ t: m[5], c: "#ffd740" });
      else if (m[6]) tokens.push({ t: m[6], c: "#78909c" });
      else if (m[7]) tokens.push({ t: m[7], c: "#ff8a65" });
      else if (m[8]) tokens.push({ t: m[8], c: "#78909c" });
      else if (m[9]) tokens.push({ t: m[9], c: "#78909c" });
      last = m.index + m[0].length;
    }
    if (last < line.length) plain(line.slice(last));
    return tokens.length ? tokens : [{ t: line, c: "#e0e0e0" }];
  }

  _isDimmedInfrastructure(rawLine) {
    return /^import java\.util\.ArrayList;$/.test(rawLine) || /^Scanner sc = new Scanner/.test(rawLine) || /\/\/ pre-filled$/.test(rawLine.trim());
  }

  renderSkeleton(mission) {
    this.codeContainer.removeAll(true);
    this.slotDefs = {};
    mission.slots.forEach((s) => { this.slotDefs[s.id] = { ...s, rect: null }; });

    mission.skeleton.forEach((rawLine, i) => {
      const y = CODE_Y0 + i * LINE_H;
      const numT = this.add.text(CX + 8, y, String(i + 1), { font: "13px Courier New", color: "#3d4450" });
      this.codeContainer.add(numT);

      if (this._isDimmedInfrastructure(rawLine)) {
        const t = this.add.text(CODE_X, y, rawLine, { font: "14px Courier New", color: "#3d4450" }).setAlpha(0.6);
        this.codeContainer.add(t);
        return;
      }

      const parts = rawLine.split(/<slot:(\w+)>/);
      let x = CODE_X;
      parts.forEach((part, pi) => {
        if (pi % 2 === 0) {
          if (!part) return;
          this._syntaxTokens(part).forEach((tok) => {
            const t = this.add.text(x, y, tok.t, { font: "bold 14px Courier New", color: tok.c });
            this.codeContainer.add(t);
            x += t.width;
          });
        } else {
          const slotId = part;
          const def = this.slotDefs[slotId];
          const w = 220;
          def.rect = { x, y: y - 2, w, h: 17 };
          this._drawSlotPlaceholder(slotId);
          x += w + 6;
        }
      });
    });
  }

  _drawSlotPlaceholder(slotId) {
    const def = this.slotDefs[slotId];
    if (!def || !def.rect) return;
    if (def.dg) def.dg.destroy();
    if (def.hintLabel) { def.hintLabel.destroy(); def.hintLabel = null; }
    const { x, y, w, h } = def.rect;
    const dg = this.add.graphics().setDepth(21);
    const filled = (this.slotContents[slotId] || []).length > 0;
    const draw = (highlight) => {
      dg.clear();
      dg.fillStyle(0x161b22, 1);
      dg.fillRoundedRect(x, y, w, h, 5);
      if (filled) {
        dg.lineStyle(2, highlight ? 0xffab00 : 0x2a3a4a, 1);
        dg.strokeRoundedRect(x, y, w, h, 5);
      } else {
        dg.lineStyle(2, highlight ? 0xffab00 : 0x546e7a, 1);
        this._dashedRectOutline(dg, x, y, w, h, 5, 4);
      }
    };
    draw(false);
    def.dg = dg;
    def.drawDash = draw;
    this.codeContainer.add(dg);
    if (!filled) {
      const label = this.add.text(x + w / 2, y + h / 2, def.hint, { font: "italic 11px Courier New", color: "#3d4450" }).setOrigin(0.5).setDepth(22);
      def.hintLabel = label;
      this.codeContainer.add(label);
    }
  }

  _relayoutSlot(slotId) {
    const def = this.slotDefs[slotId];
    const placed = this.slotContents[slotId] || [];
    if (!def || !def.rect) return;
    const { x, y, h } = def.rect;
    if (placed[0]) {
      const block = placed[0];
      const bw = block.container.getData("w");
      this.tweens.add({ targets: block.container, x: x + bw / 2, y: y + h / 2, duration: 150, ease: "Cubic.easeOut" });
    }
    this._drawSlotPlaceholder(slotId);
  }

  highlightCodeLine(lineIndex) {
    if (lineIndex === null || lineIndex === undefined) { this.lineHighlight.setVisible(false); return; }
    const y = CODE_Y0 + lineIndex * LINE_H - 2;
    this.lineHighlight.setPosition(CX + CW / 2, y + LINE_H / 2).setVisible(true);
  }

  // ══════════════════════════════════════════════════════════════
  // BLOCK PALETTE + DRAG (reused)
  // ══════════════════════════════════════════════════════════════

  createBlockPalette() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0f0a06, 1);
    g.fillRoundedRect(PX, PY, PW, PH, 10);
    g.lineStyle(1, 0x3a2618, 1);
    g.strokeRoundedRect(PX, PY, PW, PH, 10);
    this.add.text(PX + 10, PY + 8, "MASTER'S PARTS", { font: "bold 11px Arial", color: "#3d4450" }).setDepth(11);
    this.paletteContainer = this.add.container(0, 0).setDepth(30);
  }

  populatePalette(mission) {
    this.paletteBlocks.forEach((b) => b.container.destroy());
    this.paletteBlocks = [];
    const shuffled = Phaser.Utils.Array.Shuffle(mission.palette.slice());
    const rowY = [PY + 32, PY + 66, PY + 100];
    let x = PX + 12, row = 0;
    const maxX = PX + PW - 12;

    shuffled.forEach((def) => {
      const style = { font: "bold 13px Courier New", color: HEX_CYAN };
      const label = def.label || def.code;
      const measure = this.add.text(0, 0, label, style);
      const w = measure.width + 16;
      measure.destroy();
      if (x + w > maxX) { row = Math.min(row + 1, 2); x = PX + 12; }
      const home = { x: x + w / 2, y: rowY[row] };
      x += w + 8;

      const c = this.add.container(home.x, home.y).setDepth(31);
      const bg = this.add.graphics();
      const draw = (stroke) => {
        bg.clear();
        bg.fillStyle(0x241a10, 1);
        bg.fillRoundedRect(-w / 2, -13, w, 26, 6);
        bg.lineStyle(2, stroke, 1);
        bg.strokeRoundedRect(-w / 2, -13, w, 26, 6);
      };
      draw(C_BRASS);
      const txt = this.add.text(0, 0, label, style).setOrigin(0.5);
      c.add([bg, txt]);
      c.setSize(w, 26);
      c.setData("w", w);
      c.setData("code", def.code);
      c.setData("tag", def.tag || null);
      c.setData("home", home);
      c.setData("draw", draw);
      c.setData("placedIn", null);
      c.setInteractive({ useHandCursor: true, draggable: true });
      c.on("pointerover", () => { if (!this.inputLocked) draw(0xffab00); });
      c.on("pointerout", () => { if (!this.inputLocked) draw(C_BRASS); });
      this.paletteContainer.add(c);
      this.paletteBlocks.push({ container: c, def, home });
    });
  }

  setupDragEvents() {
    this.input.on("dragstart", (pointer, obj) => {
      if (!this.paletteBlocks.find((b) => b.container === obj) || this.inputLocked) return;
      obj.setDepth(60);
      this.tweens.add({ targets: obj, scale: 1.1, duration: 100 });
      const prevSlot = obj.getData("placedIn");
      if (prevSlot) {
        this.slotContents[prevSlot] = (this.slotContents[prevSlot] || []).filter((b) => b.container !== obj);
        obj.setData("_cameFromSlot", prevSlot);
        obj.setData("placedIn", null);
        this._relayoutSlot(prevSlot);
        this.updateRunButtonState();
      } else {
        obj.setData("_cameFromSlot", null);
      }
    });
    this.input.on("drag", (pointer, obj, dragX, dragY) => {
      if (!this.paletteBlocks.find((b) => b.container === obj) || this.inputLocked) return;
      obj.x = dragX; obj.y = dragY;
      this._updateSlotHover(obj);
    });
    this.input.on("dragend", (pointer, obj) => {
      if (!this.paletteBlocks.find((b) => b.container === obj) || this.inputLocked) return;
      this._finishBlockDrag(obj);
    });
  }

  _nearestOpenSlot(x, y) {
    let best = null, bestDist = 60;
    for (const id in this.slotDefs) {
      const def = this.slotDefs[id];
      if (!def || !def.rect) continue;
      const placed = this.slotContents[id] || [];
      if (placed.length >= def.capacity) continue;
      const cx = def.rect.x + def.rect.w / 2, cy = def.rect.y + def.rect.h / 2;
      const dist = Phaser.Math.Distance.Between(x, y, cx, cy);
      const within = x >= def.rect.x - 30 && x <= def.rect.x + def.rect.w + 30 && y >= def.rect.y - 20 && y <= def.rect.y + def.rect.h + 20;
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

  _finishBlockDrag(obj) {
    obj.setDepth(31);
    this.tweens.add({ targets: obj, scale: 1, duration: 100 });
    const key = this._nearestOpenSlot(obj.x, obj.y);
    if (this._dragHoverSlotKey && this.slotDefs[this._dragHoverSlotKey]) this.slotDefs[this._dragHoverSlotKey].drawDash(false);
    this._dragHoverSlotKey = null;

    if (key) {
      this.placeBlockInSlot(obj, key);
    } else {
      const home = obj.getData("home");
      this.tweens.add({ targets: obj, x: home.x, y: home.y, duration: 250, ease: "Back.easeOut" });
      const cameFrom = obj.getData("_cameFromSlot");
      if (cameFrom && obj.getData("tag") && this.runCount === this._runCountAtMissionStart) {
        this.selfCorrectionCount++;
        this.attemptLog.push({ mission: this.currentMission + 1, selfCorrected: true, code: obj.getData("code"), misconceptionTag: obj.getData("tag"), timestamp: Date.now() });
      }
    }
  }

  placeBlockInSlot(blockObj, slotId) {
    if (!this.slotContents[slotId]) this.slotContents[slotId] = [];
    this.slotContents[slotId].push({ container: blockObj });
    blockObj.setData("placedIn", slotId);
    this._relayoutSlot(slotId);
    this.updateRunButtonState();
  }

  allSlotsFilled() {
    return Object.keys(this.slotDefs).every((id) => (this.slotContents[id] || []).length > 0);
  }

  updateRunButtonState() {
    if (this.allSlotsFilled()) this.enableRunButton(); else this.disableRunButton();
  }

  getAssembledCode() {
    const out = {};
    for (const id in this.slotDefs) {
      out[id] = (this.slotContents[id] || []).map((b) => ({ code: b.container.getData("code"), tag: b.container.getData("tag") }));
    }
    return out;
  }

  // ══════════════════════════════════════════════════════════════
  // RUN BUTTON
  // ══════════════════════════════════════════════════════════════

  createRunButton() {
    const bx = 585, by = 640;
    const glow = this.add.ellipse(bx, by, 150, 60, C_GREEN_BRIGHT, 0.06).setDepth(29);
    this.tweens.add({ targets: glow, fillAlpha: 0.12, duration: 1000, yoyo: true, repeat: -1 });
    const c = this.add.container(bx, by).setDepth(30);
    const g = this.add.graphics();
    const draw = (enabled, hover) => {
      g.clear();
      g.fillStyle(enabled ? C_GREEN_BRIGHT : 0x2a2f36, hover && enabled ? 1 : 0.95);
      g.fillRoundedRect(-67, -26, 134, 52, 10);
    };
    draw(false, false);
    const t = this.add.text(0, 0, "▶ RUN", { font: "bold 19px Arial", color: "#0a0d08" }).setOrigin(0.5);
    c.add([g, t]);
    c.setSize(134, 52);
    c.on("pointerover", () => { if (this._runReady) { draw(true, true); c.setScale(1.03); } });
    c.on("pointerout", () => { draw(this._runReady, false); c.setScale(1); });
    c.on("pointerdown", () => {
      if (!this._runReady) return;
      this.tweens.add({ targets: c, scale: 0.95, duration: 80, yoyo: true });
      this.onRunPressed();
    });
    this.runButton = { c, t, g, draw };
  }

  enableRunButton() {
    this._runReady = true;
    this.runButton.draw(true, false);
    this.runButton.t.setText("▶ RUN").setColor("#0a0d08");
    this.runButton.c.setInteractive({ useHandCursor: true });
  }

  disableRunButton() {
    this._runReady = false;
    this.runButton.draw(false, false);
    this.runButton.t.setText("▶ RUN").setColor("#546e7a");
    this.runButton.c.disableInteractive();
  }

  // ══════════════════════════════════════════════════════════════
  // RIG WINDOW — shelf + panel + tracker + ticker + cameos
  // ══════════════════════════════════════════════════════════════

  createRigWindow() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0d0805, 1);
    g.fillRoundedRect(OX, OY, OW, OH, 12);
    g.lineStyle(3, C_BRASS, 1);
    g.strokeRoundedRect(OX, OY, OW, OH, 12);
    this.add.text(OX + 10, OY + 6, "RESTORATION RIG — LIVE", { font: "bold 11px Georgia", color: HEX_BRASS }).setAlpha(0.7).setDepth(11);

    const maskShape = this.make.graphics({ x: 0, y: 0, add: false });
    maskShape.fillRoundedRect(OX + 4, OY + 20, OW - 8, OH - 24, 10);
    this.windowMask = maskShape.createGeometryMask();
    this.rigLayer = this.add.container(0, 0).setDepth(15);
    this.rigLayer.setMask(this.windowMask);

    this.verdictLamp = this.add.circle(OX + OW - 18, OY + 14, 6, C_GRAY).setDepth(20);
  }

  createMiniBookshelf() {
    const g = this.add.graphics();
    this.rigLayer.add(g);
    g.fillStyle(0x241a0e, 1);
    g.lineStyle(1, 0x3a2618, 1);
    g.fillRect(MS_X0, MS_TOP, 6, MS_BOT - MS_TOP);
    g.fillRect(MS_X1 - 6, MS_TOP, 6, MS_BOT - MS_TOP);
    g.fillRect(MS_X0, MS_TOP, MS_X1 - MS_X0, 7);
    g.fillRect(MS_X0, MS_BOT - 7, MS_X1 - MS_X0, 7);

    this.typeStampText = this.add.text(MS_CX, OY + 46, "", { font: "bold 9px Courier New", color: HEX_CYAN }).setOrigin(0.5);
    this.sizeCounterText = this.add.text(MS_CX, MS_BOT + 10, "size: 0", { font: "bold 9px Courier New", color: HEX_BRASS }).setOrigin(0.5);
    this.rigLayer.add([this.typeStampText, this.sizeCounterText]);

    this.shelfIndexPlates = [];
    for (let i = 0; i < 7; i++) {
      const y = MS_BASE_Y - i * MS_STEP;
      const ledge = this.add.graphics();
      ledge.fillStyle(0x3a2618, 0.5);
      ledge.fillRoundedRect(MS_CX - 48, y - 8, 96, 16, 2);
      const idxText = this.add.text(MS_X0 + 9, y, String(i), { font: "bold 9px Courier New", color: HEX_GRAY }).setOrigin(0.5);
      this.rigLayer.add([ledge, idxText]);
      this.shelfIndexPlates.push({ text: idxText, y });
    }
    const glow = this.add.circle(MS_X0 + 9, MS_BASE_Y, 6, C_GOLD, 0);
    this.rigLayer.add(glow);
    this.tweens.add({ targets: glow, alpha: 0.15, duration: 1200, yoyo: true, repeat: -1 });
    this.bookLayer = this.add.container(0, 0);
    this.rigLayer.add(this.bookLayer);
  }

  setShelfType(listType) {
    this.currentListType = listType;
    const colorMap = { String: HEX_CYAN, Integer: HEX_GOLD };
    this.typeStampText.setText(`ArrayList<${listType}>`).setColor(colorMap[listType] || HEX_CYAN);
  }

  _typeColorHex(type) { return type === "int" ? HEX_GOLD : HEX_CYAN; }
  _typeColorInt(type) { return type === "int" ? C_GOLD : C_CYAN; }
  _shelfY(idx) { return MS_BASE_Y - Math.min(idx, 6) * MS_STEP; }

  _makeMiniBook(entry, x, y) {
    const c = this.add.container(x, y);
    const g = this.add.graphics();
    g.fillStyle(this._typeColorInt(entry.type), 0.85);
    g.lineStyle(1, 0x1a6fa0, 1);
    g.fillRoundedRect(-15, -7, 30, 14, 2);
    g.strokeRoundedRect(-15, -7, 30, 14, 2);
    const label = String(entry.value);
    const txt = this.add.text(0, 0, label, { font: "bold 9px Georgia", color: "#0a0704" }).setOrigin(0.5);
    if (txt.width > 27) txt.setFontSize(5);
    c.add([g, txt]);
    this.bookLayer.add(c);
    return { container: c, entry };
  }

  async populateMiniShelf(initialList, listType) {
    this.clearMiniShelf();
    this.setShelfType(listType);
    const typeOf = listType === "Integer" ? "int" : "string";
    for (let i = 0; i < initialList.length; i++) {
      const entry = { value: initialList[i], type: typeOf };
      const book = this._makeMiniBook(entry, MS_CX, this._shelfY(i));
      book.container.setAlpha(0);
      this.tweens.add({ targets: book.container, alpha: 1, duration: 110, delay: i * 55 });
      const plate = this.shelfIndexPlates[Math.min(i, 6)];
      if (plate) plate.text.setColor(this._typeColorHex(typeOf));
      this.currentList.push(entry);
      this.shelfBookSprites.push(book);
    }
    this.sizeCounterText.setText(`size: ${this.currentList.length}`);
    this.updateListStatePanel();
    await this.delay(initialList.length * 55 + 120);
  }

  clearMiniShelf() {
    this.shelfBookSprites.forEach((b) => b.container.destroy());
    this.shelfBookSprites = [];
    this.currentList = [];
    this.sizeCounterText.setText("size: 0");
    this.updateListStatePanel();
    this.shelfIndexPlates.forEach((p) => { p.text.setColor(HEX_GRAY); p.text.setAlpha(1); });
  }

  /** Quick instant-ish append for pre-fill add lines (M1). */
  async quickAddBook(value) {
    const typeOf = this.currentListType === "Integer" ? "int" : "string";
    const entry = { value, type: typeOf };
    const i = this.currentList.length;
    const book = this._makeMiniBook(entry, MS_CX, this._shelfY(i));
    book.container.setAlpha(0).setScale(0.6);
    this.tweens.add({ targets: book.container, alpha: 1, scale: 1, duration: 100 });
    const plate = this.shelfIndexPlates[Math.min(i, 6)];
    if (plate) plate.text.setColor(this._typeColorHex(typeOf));
    this.currentList.push(entry);
    this.shelfBookSprites.push(book);
    this.sizeCounterText.setText(`size: ${this.currentList.length}`);
    this.updateListStatePanel();
    await this.delay(70);
  }

  createMiniListStatePanel() {
    const hdr = this.add.text(LP_X, OY + 40, "LIST STATE", { font: "bold 9px Georgia", color: HEX_BRASS }).setAlpha(0.7);
    this.bracketText = this.add.text(LP_CX, OY + 88, "[]", { font: "bold 11px Courier New", color: HEX_GRAY, wordWrap: { width: 132 }, align: "center" }).setOrigin(0.5);
    this.panelSizeText = this.add.text(LP_CX, OY + 132, "size: 0", { font: "10px Courier New", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.85);
    this.panelIndexText = this.add.text(LP_CX, OY + 146, "", { font: "bold 9px Courier New", color: "#8a6435", wordWrap: { width: 132 }, align: "center" }).setOrigin(0.5).setAlpha(0.7);
    const rl = this.add.text(LP_X, OY + 166, "retrieved:", { font: "9px Georgia", color: "#8a6435" });
    this.retrievedValueText = this.add.text(LP_X + 48, OY + 170, "—", { font: "bold 11px Courier New", color: HEX_GRAY }).setOrigin(0, 0.5);
    this.rigLayer.add([hdr, this.bracketText, this.panelSizeText, this.panelIndexText, rl, this.retrievedValueText]);
  }

  updateListStatePanel() {
    if (!this.bracketText) return;
    if (this.currentList.length === 0) {
      this.bracketText.setText("[]").setColor(HEX_GRAY);
      this.panelSizeText.setText("size: 0");
      this.panelIndexText.setText("");
      return;
    }
    this.bracketText.setText(`[${this.currentList.map((e) => String(e.value)).join(", ")}]`).setColor("#e8dfc8");
    this.panelSizeText.setText(`size: ${this.currentList.length}`);
    this.panelIndexText.setText(this.currentList.map((_, i) => `[${i}]`).join(" "));
  }

  updateRetrievedValueRow(value, type) {
    if (value === null) { this.retrievedValueText.setFontSize(9).setText("—").setColor(HEX_GRAY); return; }
    if (type === "crash") { this.retrievedValueText.setText("✗ IOOBE").setColor(HEX_RED).setFontSize(8); return; }
    this.retrievedValueText.setFontSize(9).setText(String(value)).setColor(this._typeColorHex(type));
  }

  createMiniTraversalTracker() {
    const hdr = this.add.text(TRK_X, OY + 40, "TRAVERSAL", { font: "bold 9px Georgia", color: HEX_BRASS }).setAlpha(0.7);
    this.trackerContainer = this.add.container(0, 0);
    this.trackerTotalText = this.add.text(TRK_X, OY + 196, "", { font: "bold 10px Courier New", color: HEX_GOLD });
    this.rigLayer.add([hdr, this.trackerContainer, this.trackerTotalText]);
    this._trackerRows = [];
  }

  appendTrackerRow(text, isCrash) {
    const maxRows = 9;
    if (this._trackerRows.length >= maxRows) {
      const removed = this._trackerRows.shift();
      removed.destroy();
      this._trackerRows.forEach((r) => { r.y -= 15; });
    }
    const y = OY + 56 + this._trackerRows.length * 15;
    const t = this.add.text(TRK_X, y, text, { font: "10px Courier New", color: isCrash ? HEX_RED : "#e8dfc8" }).setAlpha(0);
    if (t.width > TRK_W) t.setFontSize(6);
    this.trackerContainer.add(t);
    this._trackerRows.push(t);
    this.tweens.add({ targets: t, alpha: 1, duration: 110 });
  }

  updateTrackerTotal(text) {
    this.trackerTotalText.setText(text);
    this.tweens.add({ targets: this.trackerTotalText, scale: 1.12, duration: 90, yoyo: true });
  }

  clearTracker() {
    this.trackerContainer.removeAll(true);
    this._trackerRows = [];
    this.trackerTotalText.setText("");
  }

  createMiniOutputTicker() {
    const tg = this.add.graphics();
    tg.fillStyle(0x050914, 0.9);
    tg.fillRect(OX + 8, TICKER_Y - 8, OW - 16, 16);
    this.tickerText = this.add.text(OX + 14, TICKER_Y, "", { font: "bold 11px Courier New", color: HEX_GREEN_BRIGHT }).setOrigin(0, 0.5);
    this.rigLayer.add([tg, this.tickerText]);
    this._tickerLines = [];
  }

  async printToTicker(text) {
    this._tickerLines.push(text);
    const joined = this._tickerLines.join(" ⏎ ");
    for (let i = this.tickerText.text.length; i <= joined.length; i++) {
      if (!this._alive) return;
      this.tickerText.setText(joined.slice(0, i));
      if (this.tickerText.width > OW - 30) this.tickerText.setFontSize(7);
      await this.delay(7);
    }
  }

  clearTicker() {
    this._tickerLines = [];
    if (this.tickerText) this.tickerText.setText("").setFontSize(9);
  }

  createMiniCrossWingCameos() {
    this.tapeContainer = this.add.container(0, 0);
    this.rigLayer.add(this.tapeContainer);
    this.tapeState = [];

    this.containerObjs = {};
    this.containerLayer = this.add.container(0, 0).setVisible(false);
    this.rigLayer.add(this.containerLayer);

    this.pressLayer = this.add.container(0, 0).setVisible(false);
    const pg = this.add.graphics();
    pg.fillStyle(0x1a0e05, 1);
    pg.lineStyle(1, C_BRASS, 0.6);
    pg.fillRoundedRect(TRK_X, OY + 208, 120, 18, 3);
    pg.strokeRoundedRect(TRK_X, OY + 208, 120, 18, 3);
    this.pressText = this.add.text(TRK_X + 60, OY + 217, "", { font: "bold 9px Courier New", color: HEX_ORANGE }).setOrigin(0.5);
    this.pressLayer.add([pg, this.pressText]);
    this.rigLayer.add(this.pressLayer);
  }

  parkCameos() {
    this.containerLayer.setVisible(false);
    this.containerLayer.removeAll(true);
    this.containerObjs = {};
    this.pressLayer.setVisible(false);
    this.pressText.setText("");
  }

  miniDispenseTo(name, value, javaType) {
    this.containerLayer.setVisible(true);
    const idx = Object.keys(this.containerObjs).length;
    if (!this.containerObjs[name]) {
      const y = OY + 186 + idx * 20;
      const g = this.add.graphics();
      g.fillStyle(0x0a1520, 1);
      g.lineStyle(1, C_CYAN, 0.6);
      g.fillRoundedRect(LP_X, y, 140, 16, 3);
      g.strokeRoundedRect(LP_X, y, 140, 16, 3);
      const t = this.add.text(LP_X + 6, y + 8, "", { font: "bold 9px Courier New", color: HEX_CYAN }).setOrigin(0, 0.5);
      this.containerLayer.add([g, t]);
      this.containerObjs[name] = t;
    }
    const disp = javaType === "int" ? `int ${name} = ${value}` : `String ${name} = "${value}"`;
    this.containerObjs[name].setText(disp);
    this.tweens.add({ targets: this.containerObjs[name], scale: 1.12, duration: 100, yoyo: true });
  }

  async miniPressStamp(input, output) {
    this.pressLayer.setVisible(true);
    this.pressText.setText(`${input} → ${output}`);
    if (this.pressText.width > 112) this.pressText.setFontSize(6);
    this.tweens.add({ targets: this.pressText, scale: 1.15, duration: 100, yoyo: true });
    await this.delay(180);
  }

  // ── Mini Scanner tape ──

  _classifyChar(ch) {
    if (ch === " ") return "space";
    if (ch === "\n") return "newline";
    return "alpha";
  }

  loadMiniTape(inputLines) {
    const cells = [];
    (inputLines || []).forEach((line) => {
      line.split("").forEach((ch) => cells.push({ ch, kind: this._classifyChar(ch) }));
      cells.push({ ch: "\n", kind: "newline" });
    });
    this.tapeState = cells;
    this.renderMiniTape();
  }

  renderMiniTape() {
    this.tapeContainer.removeAll(true);
    if (this.tapeState.length === 0) return;
    const cellW = 8, x1 = OX + OW - 12;
    const totalW = Math.min(this.tapeState.length * cellW, 200);
    const startX = x1 - totalW;
    const bg = this.add.graphics();
    bg.fillStyle(0xe8f0e8, 0.85);
    bg.fillRoundedRect(startX - 4, TAPE_Y - 8, totalW + 8, 16, 3);
    this.tapeContainer.add(bg);
    this.tapeState.slice(-Math.floor(totalW / cellW)).forEach((cell, i) => {
      const x = startX + i * cellW + cellW / 2;
      const disp = cell.kind === "space" ? "␣" : cell.kind === "newline" ? "⏎" : cell.ch;
      const color = cell.kind === "space" ? "#c2185b" : cell.kind === "newline" ? "#7b1fa2" : "#2e7d32";
      const t = this.add.text(x, TAPE_Y, disp, { font: "bold 9px Courier New", color }).setOrigin(0.5);
      this.tapeContainer.add(t);
    });
  }

  evaluateNextLine(cells) {
    const consumed = [];
    let j = 0;
    while (j < cells.length && cells[j].kind !== "newline") { consumed.push(cells[j]); j++; }
    if (j < cells.length) consumed.push(cells[j]);
    const strValue = consumed.filter((c) => c.kind !== "newline").map((c) => c.ch).join("");
    return { rawValue: strValue, consumedCount: consumed.length };
  }

  evaluateNextToken(cells) {
    let j = 0;
    while (j < cells.length && (cells[j].kind === "space" || cells[j].kind === "newline")) j++;
    const tokenStart = j;
    while (j < cells.length && cells[j].kind === "alpha") j++;
    const strValue = cells.slice(tokenStart, j).map((c) => c.ch).join("");
    return { rawValue: strValue, consumedCount: j };
  }

  async tapeConsumeVisual(count) {
    this.tapeState = this.tapeState.slice(count);
    this.renderMiniTape();
    await this.delay(70);
  }

  // ── Ghost retrieval + crash (compact, quickened for loops) ──

  async retrieveGhost(index, quickened = false) {
    const entry = this.currentList[index];
    const shelfY = this._shelfY(index);
    const k = quickened ? 0.5 : 1;
    const plate = this.shelfIndexPlates[Math.min(index, 6)];
    if (plate) {
      plate.text.setColor(HEX_GOLD);
      this.time.delayedCall(700 * k, () => { if (plate.text.active && this.currentList[index]) plate.text.setColor(this._typeColorHex(this.currentList[index].type)); });
    }
    const scan = this.add.rectangle(MS_CX - 46, shelfY, 2, 14, 0xffd740, 0.7);
    this.rigLayer.add(scan);
    await new Promise((res) => { this.tweens.add({ targets: scan, x: MS_CX + 46, duration: 140 * k, onComplete: () => { scan.destroy(); res(); } }); });
    if (!this._alive) return entry;

    const ghost = this._makeMiniBook(entry, MS_CX, shelfY);
    ghost.container.setAlpha(0.45);
    this.updateRetrievedValueRow(entry.value, entry.type);
    await new Promise((res) => {
      this.tweens.add({ targets: ghost.container, x: MS_CX + 55, y: shelfY - 18, alpha: 0, duration: 260 * k, ease: "Sine.easeIn", onComplete: () => { ghost.container.destroy(); res(); } });
    });
    return entry;
  }

  async crashRetrieval(index) {
    const topIdx = this.currentList.length - 1;
    const startY = topIdx >= 0 ? this._shelfY(topIdx) : MS_BASE_Y;
    const phantomY = this._shelfY(Math.max(0, Math.min(index, 6)));
    const scan = this.add.rectangle(MS_CX, startY, 96, 2, C_RED, 0.6);
    this.rigLayer.add(scan);
    await new Promise((res) => { this.tweens.add({ targets: scan, y: phantomY - 6, duration: 260, onComplete: res }); });
    await new Promise((res) => { this.tweens.add({ targets: scan, alpha: 0, duration: 70, yoyo: true, repeat: 3, onComplete: () => { scan.destroy(); res(); } }); });
    const stamp = this.add.text(OX + OW / 2, OY + 120, "IndexOutOfBoundsException", { font: "bold 12px Courier New", color: HEX_RED }).setOrigin(0.5).setAngle(-6).setAlpha(0).setDepth(25);
    this.rigLayer.add(stamp);
    this.tweens.add({ targets: stamp, alpha: 1, duration: 130 });
    this.screenShake(0.005, 160);
    this.updateRetrievedValueRow("", "crash");
    await this.delay(750);
    if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 180, onComplete: () => stamp.destroy() });
  }

  showCompileErrorStamp() {
    const stamp = this.add.text(CX + CW / 2, CY + CH / 2, "COMPILE ERROR", { font: "bold 26px Arial", color: HEX_RED }).setOrigin(0.5).setDepth(80).setScale(1.7).setAngle(-8).setAlpha(0);
    this.missionElements.push(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 200, ease: "Cubic.easeOut" });
    this.screenShake(0.005, 170);
    this.time.delayedCall(1100, () => { if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 220, onComplete: () => stamp.destroy() }); });
  }

  screenShake(intensity = 0.004, duration = 150) {
    this.cameras.main.shake(duration, intensity);
  }

  // ══════════════════════════════════════════════════════════════
  // MANIFEST / TEST REPORT / MISSION BRIEF
  // ══════════════════════════════════════════════════════════════

  createManifestStrip() {
    const g = this.add.graphics().setDepth(14);
    g.fillStyle(0x0f0a06, 0.9);
    g.fillRect(OX, STRIP_Y - 2, OW, 20);
    this.manifestStripText = this.add.text(OX + 8, STRIP_Y + 8, "", { font: "12px Arial", color: HEX_BRASS }).setOrigin(0, 0.5).setDepth(15);
  }
  updateManifestStrip(text) { this.manifestStripText.setText(text); }

  createTestReportPanel() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0f0a06, 1);
    g.fillRoundedRect(RX, RY, RW, RH, 10);
    g.lineStyle(1, 0x3a2618, 1);
    g.strokeRoundedRect(RX, RY, RW, RH, 10);
    this.add.text(RX + 10, RY + 6, "TEST REPORT", { font: "bold 11px Arial", color: "#3d4450" }).setDepth(11);
    this.reportRows = [];
  }

  _compactTestLabel(test) {
    const listStr = `[${(test.initialList || []).join(",")}]`.slice(0, 16);
    return test.input ? `${listStr} in:${test.input.join(",")}` : listStr;
  }

  buildReportRows(mission) {
    this.reportRows.forEach((r) => r.container.destroy());
    this.reportRows = [];
    mission.tests.forEach((test, i) => {
      const y = RY + 24 + i * 24;
      const c = this.add.container(RX + 10, y).setDepth(11).setAlpha(0.35);
      const inputT = this.add.text(0, 0, this._compactTestLabel(test), { font: "11px Courier New", color: "#b0bec5" }).setOrigin(0, 0.5);
      const expT = this.add.text(160, 0, (test.expectedOutput || "").slice(0, 22), { font: "11px Courier New", color: "#78909c" }).setOrigin(0, 0.5);
      const actualT = this.add.text(310, 0, "", { font: "11px Courier New", color: HEX_RED }).setOrigin(0, 0.5);
      const statusT = this.add.text(RW - 26, 0, "…", { font: "15px Arial", color: "#78909c" }).setOrigin(0.5);
      c.add([inputT, expT, actualT, statusT]);
      this.reportRows.push({ container: c, statusT, actualT });
    });
  }

  updateReportRow(index, match, actualText) {
    const row = this.reportRows[index];
    if (!row) return;
    row.container.setAlpha(1);
    row.statusT.setText(match ? "✓" : "✗").setColor(match ? HEX_GREEN_BRIGHT : HEX_RED);
    if (!match && actualText !== undefined) row.actualT.setText(String(actualText).slice(0, 16));
    if (match) row.actualT.setText("");
    if (!match) this.tweens.add({ targets: row.container, x: row.container.x + 3, duration: 35, yoyo: true, repeat: 5 });
  }

  createMissionBriefPanel() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x1a0e05, 1);
    g.fillRoundedRect(BX, BY, BW, BH, 10);
    g.lineStyle(1, 0x3a2618, 1);
    g.strokeRoundedRect(BX, BY, BW, BH, 10);
    this.briefContainer = this.add.container(0, 0).setDepth(11);
  }

  renderMissionBrief(mission) {
    this.briefContainer.removeAll(true);
    const badge = this.add.circle(BX + 24, BY + 24, 13, C_GOLD);
    const badgeNum = this.add.text(BX + 24, BY + 24, String(mission.mission), { font: "bold 15px Arial", color: "#0a0e14" }).setOrigin(0.5);
    const title = this.add.text(BX + 46, BY + 16, mission.title, { font: "bold 16px Arial", color: "#e8dfc8" }).setOrigin(0, 0.5);
    const brief = this.add.text(BX + 14, BY + 42, mission.brief, { font: "13px Arial", color: "#90a4ae", wordWrap: { width: BW - 28 } }).setOrigin(0, 0);
    const hint = this.add.text(BX + BW - 12, BY + BH - 12, "HINT", { font: "bold 13px Arial", color: "#546e7a" }).setOrigin(1, 1).setInteractive({ useHandCursor: true });
    hint.on("pointerover", () => hint.setColor(HEX_GOLD));
    hint.on("pointerout", () => hint.setColor("#546e7a"));
    hint.on("pointerdown", () => this.onHintPressed());
    this.briefContainer.add([badge, badgeNum, title, brief, hint]);
  }

  // ══════════════════════════════════════════════════════════════
  // HUD
  // ══════════════════════════════════════════════════════════════

  createHUD() {
    const g = this.add.graphics().setDepth(50);
    g.fillStyle(0x0a0704, 0.93);
    g.fillRect(0, 0, W, 64);
    g.lineStyle(1, 0x3a2618, 1);
    g.lineBetween(0, 64, W, 64);

    this.add.text(20, 14, "THE RESTORATION ROOM", { font: "bold 15px Georgia", color: "#b0bec5" }).setDepth(51);
    this.add.text(20, 32, "Restructuring Phase — get()", { font: "12px Arial", color: "#546e7a" }).setDepth(51);

    this.missionHexes = [];
    for (let i = 0; i < 6; i++) {
      const x = 490 + i * 26;
      const hx = this.add.graphics().setDepth(51);
      this.missionHexes.push({ g: hx, x, y: 32 });
    }
    this._drawHexes();

    this.add.text(1060, 10, "SCORE", { font: "11px Arial", color: "#546e7a" }).setDepth(51);
    this.scoreText = this.add.text(1060, 22, "0", { font: "bold 19px Arial", color: "#ffffff" }).setDepth(51);

    this.lifeIcons = [];
    for (let i = 0; i < 5; i++) {
      const lg = this.add.graphics({ x: 1150 + i * 20, y: 26 }).setDepth(51);
      lg.lineStyle(2, C_BRASS, 1);
      lg.strokeRoundedRect(-5, -7, 10, 14, 1);
      lg.lineStyle(1, C_BRASS, 0.6);
      lg.lineBetween(-5, 0, 5, 0);
      this.lifeIcons.push(lg);
    }
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

  _drawHexes() {
    this.missionHexes.forEach(({ g }) => { this.tweens.killTweensOf(g); g.setAlpha(1); });
    this.missionHexes.forEach(({ g, x, y }, i) => {
      g.clear();
      if (i < this.currentMission) { g.fillStyle(C_GOLD, 1); this._drawHexPath(g, x, y, 9); g.fillPath(); }
      else if (i === this.currentMission) { g.lineStyle(2, C_GOLD, 1); this._drawHexPath(g, x, y, 9); g.strokePath(); }
      else { g.lineStyle(1, C_GRAY, 1); this._drawHexPath(g, x, y, 9); g.strokePath(); }
    });
    if (this.missionHexes[this.currentMission]) {
      const m = this.missionHexes[this.currentMission];
      m.pulse = this.tweens.add({ targets: m.g, alpha: 0.5, duration: 600, yoyo: true, repeat: -1 });
    }
  }

  // ══════════════════════════════════════════════════════════════
  // BIT — Restoration Master variant (apron, loupe headband)
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
    const specs = this.add.graphics();
    specs.lineStyle(1.5, C_BRASS, 1);
    specs.beginPath();
    specs.arc(-5, 4, 5, 0, Math.PI, false);
    specs.strokePath();
    specs.beginPath();
    specs.arc(6, 4, 5, 0, Math.PI, false);
    specs.strokePath();
    const cape = this.add.graphics();
    cape.fillStyle(0x3a2618, 0.7);
    cape.lineStyle(1, C_BRASS, 0.7);
    cape.fillTriangle(-16, -14, 16, -14, 0, 20);
    // leather work apron over the cape
    const apron = this.add.graphics();
    apron.fillStyle(0x3a2618, 0.95);
    apron.lineStyle(1, 0x8a6435, 1);
    apron.fillTriangle(-11, 18, 11, 18, 0, 0);
    apron.fillStyle(0x241a0e, 1);
    apron.fillRoundedRect(-5, 8, 10, 6, 1);
    apron.lineStyle(1, C_BRASS, 0.6);
    apron.lineBetween(-3, 8, -3, 5);
    apron.lineBetween(2, 8, 2, 4);
    // jeweler's loupe on a headband
    const loupe = this.add.graphics();
    loupe.lineStyle(1.5, C_BRASS, 0.9);
    loupe.lineBetween(-14, -14, 14, -14);
    loupe.strokeCircle(10, -20, 4);
    const gloveL = this.add.circle(-16, 10, 4, 0xe0d6b8, 0.85);
    const gloveR = this.add.circle(16, 10, 4, 0xe0d6b8, 0.85);
    c.add([g, cape, apron, eye, pupil, specs, loupe, gloveL, gloveR, tip]);
    this.tweens.add({ targets: tip, alpha: 0.3, duration: 900, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: c, y: "+=3", duration: 2000, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
    this.bit = c;
  }

  bitSay(text) {
    this.hideBubble();
    const inner = this.add.text(0, 0, text, { font: "15px Arial", color: "#e0e0e0", wordWrap: { width: 340 } });
    const bw = Math.min(inner.width, 340) + 30, bh = inner.height + 24;
    inner.setText("");
    const bx = Phaser.Math.Clamp(this.bit.x + 30, 20, W - bw - 20);
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
    this.tweens.add({ targets: b, alpha: 0, scale: 0.8, duration: 150, onComplete: () => b.destroy() });
  }

  async showBitFeedback(message) {
    await this.bitSay(message);
    if (!this._alive) return;
    await Promise.race([this.waitForClick(), this.delay(4000)]);
    this.hideBubble();
  }

  floatingAnnotation(x, y, text, colorHex) {
    const t = this.add.text(x, y, text, { font: "bold 13px Arial", color: colorHex }).setOrigin(0.5).setDepth(70).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 300 });
    return t;
  }

  createFloatingText(x, y, text, colorHex, font = "bold 16px Arial") {
    const t = this.add.text(x, y, text, { font, color: colorHex }).setOrigin(0.5).setDepth(75);
    this.tweens.add({ targets: t, y: y - 25, alpha: 0, duration: 800, ease: "Cubic.easeOut", onComplete: () => t.destroy() });
    return t;
  }

  createConfetti(x, y, count = 24) {
    const p = this.add.particles(x, y, "l51_dot", {
      speed: { min: 70, max: 220 }, angle: { min: 0, max: 360 }, scale: { start: 0.8, end: 0 }, lifespan: 450,
      tint: [C_CYAN, C_GOLD, C_GREEN_BRIGHT, C_ORANGE, 0xffffff], emitting: false,
    }).setDepth(75);
    p.explode(count);
    this.time.delayedCall(800, () => p.destroy());
  }

  createGoldConfetti(x, y, count = 40) {
    const p = this.add.particles(x, y, "l51_dot", {
      speed: { min: 100, max: 280 }, angle: { min: 0, max: 360 }, scale: { start: 1, end: 0 }, lifespan: 700,
      tint: [C_GOLD, C_CYAN, C_BRASS, 0xffffff], emitting: false,
    }).setDepth(96);
    p.explode(count);
    this.time.delayedCall(1000, () => p.destroy());
  }

  // ══════════════════════════════════════════════════════════════
  // TUTORIAL
  // ══════════════════════════════════════════════════════════════

  checkTutorial() {
    let done = false;
    try { done = localStorage.getItem(TUTORIAL_KEY) === "true"; } catch (_) {}
    if (done) this.time.delayedCall(300, () => this.showProjectBriefing(0));
    else this.runTutorial();
  }

  async runTutorial() {
    const A = () => this._alive;
    await this.delay(400); if (!A()) return;
    await this.bitSay("Welcome to the Restoration Room, Master — the finest bench in the Archive. You've consulted books one at a time and run the deep stacks at speed. Now you BUILD the reading machines themselves: reports, totals, lookups, full catalog printouts. get() is your chisel — every mission carves something real.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(5200)]); if (!A()) return;
    this.hideBubble();

    const a1 = this.floatingAnnotation(CX + CW / 2, CY - 16, "the reading machine", HEX_CYAN);
    await this.delay(400); if (!A()) return;
    const a2 = this.floatingAnnotation(PX + PW / 2, PY - 12, "blocks — one bound is a trap, watch the operator", HEX_GRAY);
    await this.delay(400); if (!A()) return;
    const a3 = this.floatingAnnotation(OX + OW / 2, OY - 12, "ghosts, tracker, and console — LIVE", HEX_GREEN_BRIGHT);
    await this.delay(400); if (!A()) return;
    const a4 = this.floatingAnnotation(890, 36, "lights when the bench is working", "#e53935");
    await this.delay(400); if (!A()) return;
    const a5 = this.floatingAnnotation(RX + RW / 2, RY - 12, "every scenario must read clean", HEX_VIOLET);
    await this.delay(400); if (!A()) return;

    await this.bitSay("Three laws for everything you build here: the bound is STRICTLY less-than size; the last element lives at size minus one; and the shelf never changes — we read, we never take. Build, run, read the tracker, repair. To the bench!");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(5000)]); if (!A()) return;
    this.hideBubble();
    [a1, a2, a3, a4, a5].forEach((a) => this.tweens.add({ targets: a, alpha: 0, duration: 250, onComplete: () => a.destroy() }));

    try { localStorage.setItem(TUTORIAL_KEY, "true"); } catch (_) {}
    this.showProjectBriefing(0);
  }

  // ══════════════════════════════════════════════════════════════
  // MISSION LIFECYCLE
  // ══════════════════════════════════════════════════════════════

  showProjectBriefing(index) {
    this.currentMission = index;
    const mission = MISSIONS[index];
    this._drawHexes();

    const card = this.add.container(W / 2, H + 200).setDepth(90);
    const g = this.add.graphics();
    g.fillStyle(0x1a0e05, 1);
    g.fillRoundedRect(-260, -105, 520, 210, 12);
    g.lineStyle(2, C_GOLD, 1);
    g.strokeRoundedRect(-260, -105, 520, 210, 12);
    g.fillStyle(C_GOLD, 1);
    g.fillRect(-260, -105, 5, 210);
    const badge = this.add.circle(-225, -75, 18, C_GOLD);
    const badgeNum = this.add.text(-225, -75, String(mission.mission), { font: "bold 18px Arial", color: "#0a0e14" }).setOrigin(0.5);
    const title = this.add.text(-195, -85, mission.title, { font: "bold 21px Arial", color: "#ffffff" }).setOrigin(0, 0.5);
    const desc = this.add.text(-225, -35, mission.brief, { font: "15px Arial", color: "#b0bec5", wordWrap: { width: 460 } }).setOrigin(0, 0);

    const startBtn = this.add.container(0, 85).setDepth(1);
    const sg = this.add.graphics();
    sg.fillStyle(C_GOLD, 1);
    sg.fillRoundedRect(-70, -20, 140, 40, 20);
    const st = this.add.text(0, 0, "START", { font: "bold 15px Arial", color: "#0a0e14" }).setOrigin(0.5);
    startBtn.add([sg, st]);
    startBtn.setSize(140, 40);
    startBtn.setInteractive({ useHandCursor: true });
    startBtn.on("pointerover", () => startBtn.setScale(1.05));
    startBtn.on("pointerout", () => startBtn.setScale(1));
    startBtn.on("pointerdown", () => {
      startBtn.disableInteractive();
      this.tweens.add({ targets: card, y: H + 200, duration: 400, ease: "Cubic.easeIn", onComplete: () => { card.destroy(); this.startMission(mission); } });
    });

    card.add([g, badge, badgeNum, title, desc, startBtn]);
    this.tweens.add({ targets: card, y: 335, duration: 400, ease: "Back.easeOut" });
  }

  startMission(mission) {
    this.slotContents = {};
    this.slotDefs = {};
    this.missionRunsFailed = 0;
    this.missionHintUsed = false;
    this.missionStartTime = this.time.now;
    this._runCountAtMissionStart = this.runCount;
    this.clearMission();

    this.tabFilename.setText(`Restore${mission.mission}.java`);
    this.renderSkeleton(mission);
    this.populatePalette(mission);
    this.buildReportRows(mission);
    this.renderMissionBrief(mission);
    this.disableRunButton();
    this.highlightCodeLine(null);
    this.verdictLamp.setFillStyle(C_GRAY);
    this.clearMiniShelf();
    this.clearTicker();
    this.clearTracker();
    this.parkCameos();
    this.currentListName = mission.listName;
    this.setShelfType(mission.listJavaType);
    this.loadMiniTape(mission.tests[0].input);
    this.updateManifestStrip("");
    this.setPlaque("idle");
    this.inputLocked = false;
  }

  clearMission() {
    this.missionElements.forEach((e) => { if (e && e.destroy) e.destroy(); });
    this.missionElements = [];
  }

  buildProgramItems(mission, assembled) {
    return mission.skeleton.map((rawLine) => {
      let text = rawLine;
      let slotId = null;
      const sm = text.match(/<slot:(\w+)>/);
      if (sm) {
        slotId = sm[1];
        const code = assembled[slotId] && assembled[slotId][0] ? assembled[slotId][0].code : "";
        text = text.replace(/<slot:\w+>/, code);
      }
      return { text, slotId };
    });
  }

  // ══════════════════════════════════════════════════════════════
  // COMPILE CHECK — the run never starts on a compile error
  // ══════════════════════════════════════════════════════════════

  compileCheckProgram(items, assembled) {
    const failFor = (slotId, fallbackTag) => {
      const blockTag = slotId && assembled[slotId] && assembled[slotId][0] ? assembled[slotId][0].tag : null;
      return { ok: false, slotId, tag: blockTag || fallbackTag };
    };

    const uninitVars = [];
    for (let idx = 0; idx < items.length; idx++) {
      const raw = items[idx].text;
      const line = raw.split("//")[0].trim();
      if (!line || line.startsWith("import") || /^Scanner sc/.test(line)) continue;

      if (/\.(toUpperCase|toLowerCase)(?!\()/.test(line)) return failFor(items[idx].slotId, "property_vs_method_syntax");
      if (/\.get\("/.test(line)) return failFor(items[idx].slotId, "get_by_value_belief");
      if (/\.charAt\(/.test(line)) return failFor(items[idx].slotId, "charat_on_list_belief");
      if (/^int\s+\w+\s*=\s*sc\.nextLine\(\);$/.test(line)) return failFor(items[idx].slotId, "wrong_scanner_method");

      // uninitialized local: `int X;` then ANY later read of X — Java's
      // definite-assignment rule (loop bodies may run zero times)
      const bareDecl = line.match(/^int\s+(\w+);$/);
      if (bareDecl) uninitVars.push({ name: bareDecl[1], slotId: items[idx].slotId, declIdx: idx });
    }
    for (const uv of uninitVars) {
      for (let j = uv.declIdx + 1; j < items.length; j++) {
        const later = items[j].text.split("//")[0];
        if (new RegExp(`\\b${uv.name}\\b`).test(later)) return failFor(uv.slotId, "accumulator_not_initialized");
      }
    }
    return { ok: true };
  }

  // ══════════════════════════════════════════════════════════════
  // GENUINE INTERPRETER — read-side semantics
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
        if (ch === "+" && depth === 0 && expr[i + 1] !== "+" && expr[i + 1] !== "=") { parts.push(cur.trim()); cur = ""; continue; }
      }
      cur += ch;
    }
    const last = cur.trim();
    if (last) parts.push(last);
    return parts;
  }

  _evalIndexArg(argExpr, vars) {
    const t = argExpr.trim();
    if (/^-?\d+$/.test(t)) return { ok: true, index: parseInt(t, 10) };
    let m = t.match(/^(\w+)\.size\(\)\s*-\s*1$/);
    if (m) {
      const size = this.currentList.length;
      this.updateManifestStrip(`size() = ${size} → ${size} - 1 = ${size - 1}`);
      return { ok: true, index: size - 1 };
    }
    m = t.match(/^(\w+)\.size\(\)$/);
    if (m) return { ok: true, index: this.currentList.length };
    if (/^[A-Za-z_]\w*$/.test(t) && vars && vars[t] !== undefined) {
      this.updateManifestStrip(`${t} = ${vars[t]} → get(${vars[t]})`);
      return { ok: true, index: vars[t] };
    }
    return { ok: false };
  }

  async evalExpr(expr, vars, quickened = false) {
    const parts = this._splitTopPlus(expr);
    if (parts.length > 1) {
      const results = [];
      for (const p of parts) {
        const r = await this.evalExpr(p, vars, quickened);
        if (!r.ok) return r;
        results.push(r);
      }
      if (results.every((r) => r.type === "int")) {
        return { ok: true, value: results.reduce((a, r) => a + r.value, 0), type: "int" };
      }
      return { ok: true, value: results.map((r) => String(r.value)).join(""), type: "string" };
    }

    const t = expr.trim();
    let m = t.match(/^"([^"]*)"\.to(Upper|Lower)Case\(\)$/);
    if (m) {
      const out = m[2] === "Upper" ? m[1].toUpperCase() : m[1].toLowerCase();
      await this.miniPressStamp(m[1], out);
      return { ok: true, value: out, type: "string" };
    }
    if (/^".*"$/.test(t)) return { ok: true, value: t.slice(1, -1), type: "string" };
    if (/^-?\d+$/.test(t)) return { ok: true, value: parseInt(t, 10), type: "int" };
    m = t.match(/^(\w+)\.to(Upper|Lower)Case\(\)$/);
    if (m) {
      const recv = vars[m[1]];
      if (recv === undefined) return { ok: false, crash: "eval" };
      const out = m[2] === "Upper" ? String(recv).toUpperCase() : String(recv).toLowerCase();
      await this.miniPressStamp(String(recv), out);
      return { ok: true, value: out, type: "string" };
    }
    const getMatch = t.match(/^(\w+)\.get\((.*)\)$/);
    if (getMatch) {
      const arg = this._evalIndexArg(getMatch[2], vars);
      if (!arg.ok) return { ok: false, crash: "eval" };
      const idx = arg.index;
      if (idx < 0 || idx >= this.currentList.length) {
        await this.crashRetrieval(idx);
        return { ok: false, crash: "ioobe", index: idx };
      }
      const entry = await this.retrieveGhost(idx, quickened);
      return { ok: true, value: entry.value, type: entry.type, fromGetIndex: idx };
    }
    if (/^[A-Za-z_]\w*$/.test(t)) {
      if (vars[t] !== undefined) return { ok: true, value: vars[t], type: typeof vars[t] === "number" ? "int" : "string" };
      if (t === this.currentListName) return { ok: true, value: `[${this.currentList.map((e) => String(e.value)).join(", ")}]`, type: "string" };
      return { ok: false, crash: "eval" };
    }
    return { ok: false, crash: "eval" };
  }

  evalCond(cond, vars) {
    const m = cond.trim().match(/^(\w+)\s*(<=|<)\s*(\w+)\.size\(\)(\s*-\s*1)?$/);
    if (!m) return false;
    const lhs = vars[m[1]] !== undefined ? vars[m[1]] : NaN;
    let rhs = this.currentList.length;
    if (m[4]) rhs -= 1;
    return m[2] === "<" ? lhs < rhs : lhs <= rhs;
  }

  async execStatement(rawLine, vars, test, opts = {}) {
    const t = rawLine.split("//")[0].trim();
    if (!t || t === "}" || t.startsWith("import") || /^Scanner sc/.test(t)) return { ok: true };

    const declPop = t.match(/^ArrayList<(\w+)>\s+(\w+)\s*=\s*\/\* populated by test \*\/;$/);
    if (declPop) {
      this.currentListName = declPop[2];
      await this.populateMiniShelf(test.initialList || [], declPop[1]);
      return { ok: true };
    }
    const declEmpty = t.match(/^ArrayList<(\w+)>\s+(\w+)\s*=\s*new ArrayList<>\(\);$/);
    if (declEmpty) {
      this.clearMiniShelf();
      this.setShelfType(declEmpty[1]);
      this.currentListName = declEmpty[2];
      return { ok: true };
    }
    const addMatch = t.match(/^(\w+)\.add\("([^"]*)"\);$/) || t.match(/^(\w+)\.add\((-?\d+)\);$/);
    if (addMatch) {
      const v = /^-?\d+$/.test(addMatch[2]) ? parseInt(addMatch[2], 10) : addMatch[2];
      await this.quickAddBook(v);
      return { ok: true };
    }
    const readInt = t.match(/^int\s+(\w+)\s*=\s*sc\.nextInt\(\);$/);
    if (readInt) {
      this.updateManifestStrip(`int ${readInt[1]} = sc.nextInt()`);
      const read = this.evaluateNextToken(this.tapeState);
      await this.tapeConsumeVisual(read.consumedCount);
      vars[readInt[1]] = parseInt(read.rawValue, 10) || 0;
      this.miniDispenseTo(readInt[1], vars[readInt[1]], "int");
      await this.delay(120);
      return { ok: true };
    }
    const readLine = t.match(/^String\s+(\w+)\s*=\s*sc\.nextLine\(\);$/);
    if (readLine) {
      this.updateManifestStrip(`String ${readLine[1]} = sc.nextLine()`);
      const read = this.evaluateNextLine(this.tapeState);
      await this.tapeConsumeVisual(read.consumedCount);
      vars[readLine[1]] = read.rawValue;
      this.miniDispenseTo(readLine[1], read.rawValue, "String");
      await this.delay(120);
      return { ok: true };
    }
    const declVar = t.match(/^(int|String)\s+(\w+)\s*=\s*(.*);$/);
    if (declVar) {
      const r = await this.evalExpr(declVar[3], vars, opts.quickened);
      if (!r.ok) return r;
      vars[declVar[2]] = r.value;
      return { ok: true };
    }
    const accum = t.match(/^(\w+)\s*(?:=\s*\1\s*\+|\+=)\s*(.*);$/);
    if (accum && vars[accum[1]] !== undefined) {
      const r = await this.evalExpr(accum[2], vars, opts.quickened);
      if (!r.ok) return r;
      vars[accum[1]] = vars[accum[1]] + r.value;
      return { ok: true, accumulated: accum[1] };
    }
    const assign = t.match(/^(\w+)\s*=\s*(.*);$/);
    if (assign && vars[assign[1]] !== undefined) {
      const r = await this.evalExpr(assign[2], vars, opts.quickened);
      if (!r.ok) return r;
      vars[assign[1]] = r.value;
      return { ok: true, accumulated: assign[1] };
    }
    const printMatch = t.match(/^System\.out\.println\((.*)\);$/);
    if (printMatch) {
      this.updateManifestStrip("System.out.println(…)");
      const r = await this.evalExpr(printMatch[1], vars, opts.quickened);
      if (!r.ok) return r;
      await this.printToTicker(String(r.value));
      return { ok: true };
    }
    return { ok: true };
  }

  async runProgram(items, test) {
    const vars = {};
    for (let li = 0; li < items.length; li++) {
      if (!this._alive) return { ok: true };
      const t = items[li].text.split("//")[0].trim();

      const forMatch = t.match(/^for \(int (\w+) = (\d+); (.*); \1\+\+\) \{$/);
      if (forMatch) {
        this.highlightCodeLine(li);
        const counter = forMatch[1];
        const cond = forMatch[3];
        const bodyItems = [];
        let j = li + 1;
        while (j < items.length && items[j].text.trim() !== "}") { bodyItems.push({ item: items[j], idx: j }); j++; }
        let iv = parseInt(forMatch[2], 10);
        let iterations = 0;
        while (iterations < 200) {
          vars[counter] = iv;
          if (!this.evalCond(cond, vars)) {
            if (iterations === 0) { this.updateManifestStrip(`${counter}=0 → 0 < ${this.currentList.length} false → loop skipped`); await this.delay(450); }
            break;
          }
          this.updateManifestStrip(`${counter} = ${iv}`);
          for (const b of bodyItems) {
            if (!this._alive) return { ok: true };
            this.highlightCodeLine(b.idx);
            const r = await this.execStatement(b.item.text, vars, test, { quickened: true });
            if (!r.ok) {
              if (r.crash === "ioobe") this.appendTrackerRow(`${counter}=${iv} → get(${r.index}) → ✗ IOOBE`, true);
              return r;
            }
            const getM = b.item.text.match(/\.get\(\s*(\w+)\s*\)/);
            if (getM && getM[1] === counter) {
              const val = this.currentList[iv] ? this.currentList[iv].value : "?";
              this.appendTrackerRow(`${counter}=${iv} → get(${iv}) → ${val}`);
            }
            if (r.accumulated) this.updateTrackerTotal(`${r.accumulated}: ${vars[r.accumulated]}`);
          }
          iv++;
          iterations++;
          await this.delay(200);
        }
        li = j;
        continue;
      }

      this.highlightCodeLine(li);
      const r = await this.execStatement(items[li].text, vars, test, {});
      if (!r.ok) return r;
    }
    return { ok: true };
  }

  // ══════════════════════════════════════════════════════════════
  // RUN PIPELINE
  // ══════════════════════════════════════════════════════════════

  _collectWrongBlocksUsed() {
    const used = [];
    for (const id in this.slotContents) {
      (this.slotContents[id] || []).forEach((b) => {
        const tag = b.container.getData("tag");
        if (tag) used.push({ code: b.container.getData("code"), tag });
      });
    }
    return used;
  }

  _slotCode(slotId) {
    const placed = this.slotContents[slotId] && this.slotContents[slotId][0];
    return placed ? placed.container.getData("code") : "";
  }

  _recordFirstRunMetrics(mission, passed) {
    if (this._firstRunMetricsRecorded[mission.mission]) return;
    this._firstRunMetricsRecorded[mission.mission] = true;
    if (mission.boundSlot) this.traversalBoundProactive[`mission${mission.mission}`] = this._slotCode(mission.boundSlot) === mission.boundForm;
    if (mission.sizeProofSlot) this.sizeMinusOneProactive[`mission${mission.mission}`] = this._slotCode(mission.sizeProofSlot) === mission.sizeProofForm;
    if (mission.crossWing) this.crossWingCleanFirstRun[`mission${mission.mission}`] = passed;
  }

  _pulseOffendingBlock(slotId) {
    const placed = slotId && this.slotContents[slotId] && this.slotContents[slotId][0];
    if (!placed) return;
    const c = placed.container;
    const draw = c.getData("draw");
    if (draw) draw(C_RED);
    this.tweens.add({ targets: c, x: c.x + 4, duration: 40, yoyo: true, repeat: 5 });
    this.time.delayedCall(1400, () => { if (c.active && draw) draw(C_BRASS); });
  }

  async onRunPressed() {
    if (this.inputLocked) return;
    this.inputLocked = true;
    this.disableRunButton();
    this.runButton.t.setText("...");
    this.runCount++;
    const mission = MISSIONS[this.currentMission];
    const isFirstRun = this.runCount === this._runCountAtMissionStart + 1;
    const assembled = this.getAssembledCode();
    const wrongBlocksUsed = this._collectWrongBlocksUsed();
    this.setPlaque("session");

    const items = this.buildProgramItems(mission, assembled);
    const compileResult = this.compileCheckProgram(items, assembled);
    if (!compileResult.ok) {
      if (isFirstRun) this._recordFirstRunMetrics(mission, false);
      this.showCompileErrorStamp();
      this._pulseOffendingBlock(compileResult.slotId);
      await this.delay(900);
      this._resolveRunOutcome(mission, "compile_fail", wrongBlocksUsed.length ? wrongBlocksUsed : [{ code: "", tag: compileResult.tag }], [], compileResult.tag);
      return;
    }

    let anyMismatch = false, anyCrash = false;
    const failedTests = [];
    for (let i = 0; i < mission.tests.length; i++) {
      if (!this._alive) return;
      const test = mission.tests[i];
      const outcome = await this.runTestCase(mission, test, i, items);
      if (!outcome.match) { anyMismatch = true; failedTests.push(this._compactTestLabel(test)); }
      if (outcome.crashed) anyCrash = true;
    }

    if (isFirstRun) this._recordFirstRunMetrics(mission, !anyMismatch);
    if (!anyMismatch && mission.accumSlot) {
      this.accumulatorFormChoice[`mission${mission.mission}`] = this._slotCode(mission.accumSlot).includes("+=") ? "plus_equals" : "long_form";
    }
    const resultKind = anyMismatch ? (anyCrash ? "runtime_crash" : "logic_fail") : "pass";
    this._resolveRunOutcome(mission, resultKind, wrongBlocksUsed, failedTests, null);
  }

  async runTestCase(mission, test, index, items) {
    this.clearMiniShelf();
    this.setShelfType(mission.listJavaType);
    this.clearTicker();
    this.clearTracker();
    this.parkCameos();
    this.updateRetrievedValueRow(null, null);
    this.loadMiniTape(test.input);

    const runResult = await this.runProgram(items, test);
    if (!this._alive) return { match: false, crashed: false };
    this.highlightCodeLine(null);

    const output = this._tickerLines.join("⏎");
    const match = runResult.ok && output === test.expectedOutput;
    const actualDisplay = runResult.ok ? (output || "(none)") : "✗ IOOBE";
    this.verdictLamp.setFillStyle(match ? C_GREEN_BRIGHT : C_RED);
    this.updateReportRow(index, match, actualDisplay);
    await this.delay(250);
    return { match, crashed: !runResult.ok };
  }

  /**
   * Computes the 4 struggle-detection features from the first 3 missions'
   * attempt history and asks the backend's Isolation Forest model whether
   * this looks like typical or struggling play. Wired into FusionEngine so
   * the existing 'fusionAction' subscription can react to it, exactly like
   * the emotion/fatigue signals. Never throws — a failed/unreachable
   * backend just means no behavioral signal for this level; face and
   * fatigue detection keep working on their own regardless.
   *
   * This level uses the MISSIONS/currentMission architecture, not
   * ROUNDS/currentRound — attemptLog entries here carry `mission` (not
   * `round`) and have no `misconceptionTag` field on the main run-outcome
   * entries. misconception_repeat_count is the structural equivalent: a
   * failed run (`result !== "pass"`) whose wrongBlocks carried a tagged
   * distractor, mirroring "a wrong attempt attributable to a specific
   * misconception" from the ROUNDS-based levels.
   */
  async runBehavioralCheck() {
    const relevant = this.attemptLog.filter((a) => a.mission <= 3);
    const attempts_count = relevant.length;
    const time_taken_seconds = relevant.reduce((sum, a) => sum + a.timeMs, 0) / 1000;
    const misconception_repeat_count = relevant.filter(
      (a) => a.result !== "pass" && (a.wrongBlocks || []).some((b) => b && b.tag)
    ).length;
    const combo_breaks = GameManager.get("comboBreaksThisLevel") || 0;

    try {
      const { prediction } = await WellbeingAPI.predictStruggle({
        attempts_count,
        time_taken_seconds,
        misconception_repeat_count,
        combo_breaks,
      });
      if (!this._alive) return;

      const features = { attempts_count, time_taken_seconds, misconception_repeat_count, combo_breaks };
      const effectivePrediction = BehavioralRules.getEffectivePrediction(features, prediction, false);
      GameManager.fusionEngine.checkBehavioral(effectivePrediction);

      // Small delay to allow the DOM/UI to render the Bit Menu if triggered,
      // before onMissionComplete()'s wait-loop starts polling for it.
      await this.delay(100);
    } catch (e) {
      console.warn("Level51Scene: /api/wellbeing/predict-struggle unreachable, skipping behavioral signal for this level:", e);
    }
  }

  _resolveRunOutcome(mission, result, wrongBlocksUsed, failedTests, compileTag) {
    const timeMs = Math.round(this.time.now - this.missionStartTime);
    this.attemptLog.push({
      mission: mission.mission, runNumber: this.runCount, result,
      blocksUsed: Object.values(this.getAssembledCode()).flat().map((b) => b.code),
      wrongBlocks: wrongBlocksUsed, failedTests, timeMs, hintUsedBefore: this.missionHintUsed,
    });

    if (result === "pass") { this.onMissionComplete(); return; }

    this.failedRunCount++;
    this.missionRunsFailed++;
    this.runButton.t.setText("▶ RUN");
    this.setPlaque("idle");

    // Every failed run costs exactly one life, matching the strictness of
    // the ROUNDS-based levels (loseLife() there fires on every wrong answer).
    const livesLostThisRun = true;
    const feedbackTag = compileTag || (wrongBlocksUsed[0] && wrongBlocksUsed[0].tag);

    (async () => {
      if (livesLostThisRun) {
        const dead = this.loseLife();
        if (dead) { this.time.delayedCall(500, () => this.gameOver()); return; }
      }

      if (this.missionRunsFailed === 3) {
        await this.runBehavioralCheck();

        let waitTime = 0;
        while (!GameManager.interventionInFlight && waitTime < 1500) {
          await this.delay(100);
          waitTime += 100;
        }
        while (GameManager.interventionInFlight) {
          await this.delay(200);
        }
      }

      if (!this._alive) return;
      await this.showBitFeedback(MISCONCEPTION_FEEDBACK[feedbackTag] || "Check the report — the rig shows exactly what your code actually does.");
      if (!this._alive) return;
      this.unlockForRepair();
    })();
  }

  unlockForRepair() {
    this.inputLocked = false;
    this.updateRunButtonState();
  }

  onHintPressed() {
    if (this.inputLocked) return;
    this.missionHintUsed = true;
    this.hintCount++;
    this.updateScore(-25);
    const mission = MISSIONS[this.currentMission];
    this.showBitFeedback(HINTS[mission.mission] || "Reread the brief carefully — the answer is in the wording.");
  }

  async onMissionComplete() {
    if (this.currentMission === 2) {
      await this.runBehavioralCheck();

      // CRITICAL FIX: the FusionEngine polling loop runs at 1Hz (every 1000ms).
      // Wait up to 1.5s to give it a chance to notice the behavioral flag and
      // open the menu before we mistakenly advance to the next mission.
      let waitTime = 0;
      while (!GameManager.interventionInFlight && waitTime < 1500) {
        await this.delay(100);
        waitTime += 100;
      }

      // If the menu DID open, wait indefinitely until the player closes it.
      while (GameManager.interventionInFlight) {
        await this.delay(200);
      }
    }

    if (!this._alive || this.gameEnded) return;
    const flawless = this.missionRunsFailed === 0 && !this.missionHintUsed;
    if (flawless) this.flawlessCount++;
    this.updateScore(250 + (flawless ? 100 : 0));
    if (flawless) this.createFloatingText(OX + OW / 2, OY - 14, "FLAWLESS +100", HEX_GOLD, "bold 16px Arial");

    this.missionFanfare().then(() => {
      if (!this._alive || this.gameEnded) return;
      const next = this.currentMission + 1;
      if (next >= MISSIONS.length) this.levelComplete();
      else this.showProjectBriefing(next);
    });
  }

  async missionFanfare() {
    this.verdictLamp.setFillStyle(C_GREEN_BRIGHT);
    this.setPlaque("gold");
    this.createConfetti(OX + OW / 2, OY + OH / 2);
    this._drawHexes();
    const hx = this.missionHexes[this.currentMission];
    if (hx) {
      hx.g.clear();
      hx.g.fillStyle(C_GOLD, 1);
      this._drawHexPath(hx.g, hx.x, hx.y, 9);
      hx.g.fillPath();
      this.tweens.add({ targets: hx.g, alpha: 0.4, duration: 150, yoyo: true, repeat: 2 });
    }
    const mission = MISSIONS[this.currentMission];
    await this.bitSay(mission.postMissionNote || "Clean read — the rig confirms it.");
    await Promise.race([this.waitForClick(), this.delay(2200)]);
    this.hideBubble();
    await this.delay(400);
  }

  updateScore(points) {
    this.score = Math.max(0, this.score + points);
    const counter = { v: this.displayScore };
    this.tweens.add({
      targets: counter, v: this.score, duration: 300,
      onUpdate: () => { this.displayScore = Math.round(counter.v); if (this.scoreText.active) this.scoreText.setText(String(this.displayScore)); },
    });
  }

  loseLife() {
    this.lives = Math.max(0, this.lives - 1);
    const icon = this.lifeIcons[this.lives];
    if (icon) this.tweens.add({ targets: icon, alpha: 0.12, duration: 400 });
    return this.lives <= 0;
  }

  addLife() {
    if (this.lives < 5) {
      const icon = this.lifeIcons[this.lives];
      if (icon) { this.tweens.add({ targets: icon, alpha: 1, duration: 400 }); }
      this.lives++;
    }
  }

  // ══════════════════════════════════════════════════════════════
  // END STATES
  // ══════════════════════════════════════════════════════════════

  gameOver() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearMission();
    this.hideBubble();
    this.verdictLamp.setFillStyle(0x333333);

    // the bench closes
    this.tweens.killTweensOf(this.plaqueText);
    this.tweens.add({ targets: this.plaqueText, alpha: 0.08, duration: 700 });
    this.tweens.add({ targets: this.pressTopPlate, y: 6, duration: 900 });
    const fog = this.add.circle(720, 66, 12, 0xb0bec5, 0).setDepth(5);
    this.tweens.add({ targets: fog, fillAlpha: 0.25, duration: 900 });
    const motes = this.ambient;
    this.ambient = null;
    (motes || []).forEach((m) => this.tweens.add({ targets: m, y: 632, alpha: 0, duration: 1500, ease: "Sine.easeIn" }));

    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
    this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });

    const title = this.add.text(640, 240, "BENCH CLOSED", { font: "bold 36px Georgia", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
    this.tweens.add({ targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut", onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }) });
    this.add.text(640, 310, `Score: ${this.score}`, { font: "21px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
    this.add.text(640, 350, `Missions Completed: ${this.currentMission} / ${MISSIONS.length}`, { font: "18px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);

    this._makeButton(525, 420, "BACK TO THE BENCH", 200, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
      this._makeButton(755, 420, "RETURN TO MENU", 200, 50, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.start("MenuScene"));
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearMission();
    this.hideBubble();

    try { GameManager.completeLevel(51, Math.round((this.flawlessCount / MISSIONS.length) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("arraylist_get_mastery"); } catch (_) {}
    try {
      localStorage.setItem("level51_results", JSON.stringify({
        level: 51, concept: "arraylist_get", phase: "restructuring",
        score: this.score, missionsCompleted: 6, flawlessMissions: this.flawlessCount,
        totalRuns: this.runCount, failedRuns: this.failedRunCount, hintsUsed: this.hintCount,
        selfCorrections: this.selfCorrectionCount, traversalBoundProactively: this.traversalBoundProactive,
        sizeMinusOneProactively: this.sizeMinusOneProactive, accumulatorFormChoice: this.accumulatorFormChoice,
        crossWingCleanFirstRun: this.crossWingCleanFirstRun,
        livesRemaining: this.lives, attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.restorationFinale().then(() => { if (this._alive) this.showScoreTally(); });
  }

  async restorationFinale() {
    this.setPlaque("gold", "MASTERWORK");
    // sequential tool glints
    for (const tg of this._toolGlints) {
      const s = this.add.circle(tg.x, tg.y, 3, 0xffffff, 0.8).setDepth(3);
      this.tweens.add({ targets: s, alpha: 0, scale: 2, duration: 400, onComplete: () => s.destroy() });
      await this.delay(150);
    }
    if (!this._alive) return;
    // the book press releases the restored book
    this.tweens.add({ targets: this.pressTopPlate, y: -10, duration: 700, ease: "Sine.easeOut" });
    const glow = this.add.circle(940, 118, 40, C_GOLD, 0.12).setDepth(2);
    this.tweens.add({ targets: [this.pressBook, glow], y: "-=34", duration: 900, ease: "Sine.easeOut" });
    this.tweens.add({ targets: glow, alpha: 0, duration: 1400, onComplete: () => glow.destroy() });
    this.glintMagnifier();
    // ghosts rise off the rig shelf in a wave
    for (let i = 0; i < this.shelfBookSprites.length; i++) {
      const b = this.shelfBookSprites[i];
      const ghost = this._makeMiniBook(b.entry, MS_CX, this._shelfY(i));
      ghost.container.setAlpha(0.45);
      this.tweens.add({ targets: ghost.container, y: this._shelfY(i) - 40, alpha: 0, duration: 600, delay: i * 90, onComplete: () => ghost.container.destroy() });
    }
    this.createGoldConfetti(OX + OW / 2, OY + OH / 2, 40);
    await this.delay(1400);
  }

  _starRating() {
    if (this.flawlessCount >= 4 && this.hintCount <= 1) return 3;
    if (this.failedRunCount <= 3) return 2;
    return 1;
  }

  showScoreTally() {
    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
    this.tweens.add({ targets: ov, fillAlpha: 0.85, duration: 500 });

    const panel = this.add.graphics().setDepth(90);
    panel.fillStyle(0x1a0e05, 1);
    panel.fillRoundedRect(350, 100, 580, 460, 16);
    panel.lineStyle(2, C_GOLD, 1);
    panel.strokeRoundedRect(350, 100, 580, 460, 16);

    const title = this.add.text(640, 138, "RESTORATION MASTER", { font: "bold 32px Georgia", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(91).setScale(0);
    this.tweens.add({ targets: title, scale: 1, duration: 350, ease: "Back.easeOut" });

    const boundCount = Object.values(this.traversalBoundProactive).filter(Boolean).length;
    const crossWingCount = Object.values(this.crossWingCleanFirstRun).filter(Boolean).length;
    const lines = [
      "MISSIONS: 6/6", `FLAWLESS: ${this.flawlessCount}`, `SELF-CORRECTIONS: ${this.selfCorrectionCount}`,
      `TRAVERSAL-PROACTIVE: ${boundCount}/2`, `CROSS-WING CLEAN: ${crossWingCount}/2`, `HINTS: ${this.hintCount}`,
    ];
    lines.forEach((s, i) => {
      const t = this.add.text(470, 178 + i * 23, s, { font: "15px Arial", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 250, delay: 300 + i * 120 });
    });
    const totalText = this.add.text(470, 178 + 6 * 23, "TOTAL: 0", { font: "bold 21px Arial", color: HEX_GOLD }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: totalText, alpha: 1, duration: 250, delay: 1050 });
    const counter = { v: 0 };
    this.tweens.add({ targets: counter, v: this.score, duration: 1000, delay: 1050, onUpdate: () => totalText.setText(`TOTAL: ${Math.round(counter.v)}`) });

    const stars = this._starRating();
    for (let i = 0; i < 3; i++) {
      const earned = i < stars;
      const s = this.add.text(640 + (i - 1) * 56, 372, "★", { font: "34px Arial", color: earned ? HEX_GOLD : "#2a3040" }).setOrigin(0.5).setDepth(91).setScale(0);
      this.tweens.add({ targets: s, scale: 1, duration: 250, delay: 1500 + i * 200, ease: earned ? "Back.easeOut" : "Cubic.easeOut" });
    }

    // TRILOGY BADGE — magnifier (L49), hourglass (L50), loupe (L51)
    const badge = this.add.container(640, 432).setDepth(91).setAlpha(0);
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillCircle(0, 0, 34);
    bg.lineStyle(3, C_GOLD, 1);
    bg.strokeCircle(0, 0, 34);
    bg.lineStyle(2, C_BRASS, 1);
    bg.strokeCircle(-16, -4, 6);
    bg.lineBetween(-12, 1, -8, 6);
    bg.fillStyle(0x8a6435, 1);
    bg.fillRect(-5, -12, 12, 2);
    bg.fillRect(-5, 8, 12, 2);
    bg.lineStyle(1, C_BRASS, 0.8);
    bg.lineBetween(-3, -10, 1, -2);
    bg.lineBetween(5, -10, 1, -2);
    bg.lineBetween(1, -2, -3, 8);
    bg.lineBetween(1, -2, 5, 8);
    bg.lineStyle(2, C_BRASS, 1);
    bg.strokeCircle(18, -2, 5);
    bg.lineBetween(18, 3, 18, 10);
    badge.add(bg);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 0 });
    const badgeLbl = this.add.text(640, 478, "get() MASTERY", { font: "bold 15px Georgia", color: HEX_GOLD }).setOrigin(0.5).setDepth(91).setAlpha(0);
    const badgeSub = this.add.text(640, 494, "Accretion ✓  Tuning ✓  Restructuring ✓", { font: "12px Arial", color: "#78909c" }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: [badgeLbl, badgeSub], alpha: 1, duration: 300, delay: 0 });

    const wingLbl = this.add.text(640, 512, "ARRAYLIST WING — 2 of 3 trilogies complete", { font: "bold 13px Georgia", color: "#8c7ae6" }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: wingLbl, alpha: 1, duration: 300, delay: 2300 });
    const bar = this.add.graphics().setDepth(91).setAlpha(0);
    bar.lineStyle(1, C_GRAY, 1);
    bar.strokeRoundedRect(450, 522, 380, 14, 7);
    bar.fillStyle(0x8c7ae6, 0.9);
    bar.fillRoundedRect(452, 524, 376 * 0.66, 10, 5);
    this.tweens.add({ targets: bar, alpha: 1, duration: 300, delay: 2400 });
    ["add ✓", "get ✓", "remove"].forEach((s, i) => {
      const t = this.add.text(513 + i * 127, 545, s, { font: "bold 11px Arial", color: i < 2 ? "#8c7ae6" : "#546e7a" }).setOrigin(0.5).setDepth(91).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 300, delay: 2450 + i * 100 });
    });

    this._makeButton(500, 585, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(770, 585, "NEXT: remove() awaits →", 250, 44, { fill: 0x00733a, stroke: C_GREEN_BRIGHT, textColor: "#ffffff" }, () => {
      this.scene.start("MenuScene");
    });
  }

  _makeButton(x, y, label, w, h, style, onClick, depth = 97) {
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
