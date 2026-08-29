/**
 * Level 48 — "The Reading Room" (ArrayList Methods: Restructuring Phase —
 * add() trilogy finale; the ArrayList Wing's first complete trilogy)
 * ===========================================================================
 * The learner CONSTRUCTS complete list-building programs — no multiple
 * choice. Reuses the L27→L45 code-canvas/parts-bin/RUN architecture. The
 * rig window hosts a 55%-scale L46/L47 bookshelf + list-state panel, plus
 * cross-wing cameos (Scanner tape, typed containers, case press, output
 * ticker) that light up only when the player's ACTUAL code exercises them.
 *
 * A genuine generic mini-interpreter (never scripted) executes the
 * assembled program: sequential statements, variable declarations,
 * Scanner.nextLine consumption, a real for-loop (M4, iteration-by-
 * iteration with manifest beats), both add() forms with honest insertion
 * shift/IOOBE semantics, String case methods, and println with Java's
 * real ArrayList toString ("[ANA, BEN]" — no quotes). Wrong builds yield
 * their REAL outcomes on the shelf and in the report.
 *
 * DESIGN NOTE — Mission 3 palette (resolved before writing any code): the
 * spec's draft distractor waitlist.add(4, "Vip") was described as "legal
 * but wrong position", but on a size-3 list index 4 is OUT OF RANGE — real
 * Java throws IndexOutOfBoundsException, contradicting the intended
 * lesson. The distractor is therefore add(3, "Vip") — genuinely legal
 * (index == size appends, the L47 Wave-2 boundary rule) and genuinely
 * wrong-position — keeping the evaluator honest AND the pedagogy intact.
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
const MS_X0 = OX + 14, MS_X1 = OX + 154, MS_CX = OX + 84;
const MS_TOP = OY + 62, MS_BOT = OY + 210, MS_BASE_Y = OY + 196, MS_STEP = 21;
const PREP_SPOT = { x: OX + 90, y: OY + 222 };
const LP_X = OX + 180, LP_CX = OX + 310;
const TICKER_Y = OY + 236;
const STRIP_Y = OY + OH + 15;
const RX = 760, RY = 345, RW = 460, RH = 125;
const BX = 760, BY = 490, BW = 460, BH = 130;
const TUTORIAL_KEY = "level48_tutorial_done";

// ══════════════════════════════════════════════════════════════
// MISSION CONFIGURATION
// ══════════════════════════════════════════════════════════════
const MISSIONS = [
  { mission: 1, title: "The Reading List",
    brief: "The month's reading list needs three titles in order: first \"Dune\", then \"Emma\", then \"Ivanhoe\". Final shelf: [Dune, Emma, Ivanhoe]",
    skeleton: ["import java.util.ArrayList;", "ArrayList<String> reading = new ArrayList<>();", "<slot:call1>", "<slot:call2>", "<slot:call3>"],
    slots: [
      { id: "call1", hint: "first title", capacity: 1 },
      { id: "call2", hint: "second title", capacity: 1 },
      { id: "call3", hint: "third title", capacity: 1 },
    ],
    palette: [
      { code: 'reading.add("Dune");', correct: true },
      { code: 'reading.add("Emma");', correct: true },
      { code: 'reading.add("Ivanhoe");', correct: true },
      { code: 'reading.add("Emma");', tag: "add_reverses_order_belief" },
      { code: 'reading.add(42);', tag: "wrong_type_for_generic" },
      { code: "reading.add(Dune);", tag: "unquoted_string_literal" },
    ],
    tests: [{ expectedList: ["Dune", "Emma", "Ivanhoe"] }],
    postMissionNote: "First call, shelf 0. Second call, shelf 1. The list remembers your call order forever — that's the append contract.",
    concept: "ordered_appends" },

  { mission: 2, title: "The Rearranged Shelf",
    brief: "The shelf must end as [Alpha, Beta, Gamma] — but the 'Beta' volume arrives LAST in the delivery (it must be the THIRD call). Place it into position.",
    skeleton: ["import java.util.ArrayList;", "ArrayList<String> shelf = new ArrayList<>();", "<slot:call1>", "<slot:call2>", "<slot:call3>"],
    slots: [
      { id: "call1", hint: "first call", capacity: 1 },
      { id: "call2", hint: "second call", capacity: 1 },
      { id: "call3", hint: "third call (Beta arrives)", capacity: 1 },
    ],
    insertionSlot: "call3", insertionForm: 'shelf.add(1, "Beta");',
    palette: [
      { code: 'shelf.add("Alpha");', correct: true },
      { code: 'shelf.add("Gamma");', correct: true },
      { code: 'shelf.add(1, "Beta");', correct: true },
      { code: 'shelf.add("Beta");', tag: "append_instead_of_insert" },
      { code: 'shelf.add(2, "Beta");', tag: "add_index_offset_belief" },
      { code: 'shelf.add(0, "Beta");', tag: "add_index_offset_belief" },
    ],
    tests: [{ expectedList: ["Alpha", "Beta", "Gamma"] }],
    postMissionNote: "Beta arrived last but LIVES at index 1 — that's what the two-argument add is FOR. Late arrivals, correct placement. You'll use this move whenever order matters more than arrival time.",
    concept: "insertion_payoff_production" },

  { mission: 3, title: "The Priority Slot",
    brief: "The waitlist is [Ana, Ben, Cy]. A priority member, \"Vip\", must take position 0 — everyone else shifts back. Final shelf: [Vip, Ana, Ben, Cy]",
    skeleton: ["import java.util.ArrayList;", "ArrayList<String> waitlist = new ArrayList<>();", 'waitlist.add("Ana");', 'waitlist.add("Ben");', 'waitlist.add("Cy");', "<slot:priority>"],
    slots: [{ id: "priority", hint: "priority placement", capacity: 1 }],
    insertionSlot: "priority", insertionForm: 'waitlist.add(0, "Vip");',
    palette: [
      { code: 'waitlist.add(0, "Vip");', correct: true },
      { code: 'waitlist.add("Vip");', tag: "append_instead_of_insert" },
      { code: 'waitlist.add(1, "Vip");', tag: "add_index_offset_belief" },
      { code: 'waitlist.add(3, "Vip");', tag: "append_via_size_index" },
      { code: 'waitlist.add(0) = "Vip";', tag: "array_syntax_confusion" },
    ],
    tests: [{ expectedList: ["Vip", "Ana", "Ben", "Cy"] }],
    postMissionNote: "Position 0 — the front of every line. One insertion, three shifts, no evictions. The polite way to jump a queue.",
    concept: "insertion_at_front" },

  { mission: 4, title: "The Bulk Intake",
    brief: "A crate of N identical ledger volumes arrives. File all N copies of \"Ledger\" using a loop. For N=3, final shelf: [Ledger, Ledger, Ledger]",
    skeleton: ["import java.util.ArrayList;", "int n = /* test value */;", "ArrayList<String> stock = new ArrayList<>();", "for (int i = 0; <slot:cond>; i++) {", "    <slot:body>", "}"],
    slots: [
      { id: "cond", hint: "loop condition", capacity: 1 },
      { id: "body", hint: "loop body", capacity: 1 },
    ],
    loopCondSlot: "cond", loopCondCorrect: "i < n",
    palette: [
      { code: "i < n", correct: true },
      { code: 'stock.add("Ledger");', correct: true },
      { code: "i <= n", tag: "loop_bound_off_by_one" },
      { code: "i < n - 1", tag: "loop_bound_off_by_one" },
      { code: 'stock.add("Ledger" + i);', tag: "unwanted_index_suffix" },
      { code: 'stock.add(i, "Ledger");', tag: "unnecessary_insertion", alsoCorrect: true },
    ],
    tests: [
      { subs: { n: "3" }, expectedList: ["Ledger", "Ledger", "Ledger"] },
      { subs: { n: "1" }, expectedList: ["Ledger"] },
      { subs: { n: "0" }, expectedList: [] },
    ],
    postMissionNote: "Loop plus add — the pattern every collection in every Java program is built with. N items in, N books filed, size N. Remember the zero case: an empty crate files nothing.",
    concept: "loop_populate_pattern" },

  { mission: 5, title: "The Waitlist Terminal",
    brief: "The front desk reads TWO reader names (each on its own line) and files them on the waitlist in arrival order. For inputs 'Ana' then 'Ben', final shelf: [Ana, Ben]",
    skeleton: ["import java.util.ArrayList;", "Scanner sc = new Scanner(System.in);", "ArrayList<String> waitlist = new ArrayList<>();", "", "String first = sc.nextLine();", "<slot:file1>", "", "String second = sc.nextLine();", "<slot:file2>"],
    slots: [
      { id: "file1", hint: "file the first reader", capacity: 1 },
      { id: "file2", hint: "file the second reader", capacity: 1 },
    ],
    crossWing: true,
    palette: [
      { code: "waitlist.add(first);", correct: true },
      { code: "waitlist.add(second);", correct: true },
      { code: 'waitlist.add("first");', tag: "variable_as_literal_belief" },
      { code: 'waitlist.add("second");', tag: "variable_as_literal_belief" },
      { code: "waitlist.add(0, second);", tag: "unnecessary_insertion_wrong" },
    ],
    tests: [
      { input: ["Ana", "Ben"], expectedList: ["Ana", "Ben"] },
      { input: ["Kai", "Zoe"], expectedList: ["Kai", "Zoe"] },
      { input: ["A B", "C D"], expectedList: ["A B", "C D"] },
    ],
    postMissionNote: "Two wings, one pipeline — the reader speaks, Scanner listens, the shelf remembers. Every registration system ever written is this pattern, scaled up.",
    concept: "scanner_arraylist_pipeline" },

  { mission: 6, title: "The Registration Ledger",
    brief: "The grand ledger reads TWO member names, files them UPPERCASED in arrival order, then announces the register. For inputs 'ana' and 'ben' — Shelf: [ANA, BEN] · Console: Registered: [ANA, BEN]",
    skeleton: ["import java.util.ArrayList;", "Scanner sc = new Scanner(System.in);", "ArrayList<String> ledger = new ArrayList<>();", "", "String m1 = sc.nextLine();", "ledger.add(<slot:entry1>);", "", "String m2 = sc.nextLine();", "ledger.add(<slot:entry2>);", "", "System.out.println(<slot:announce>);"],
    slots: [
      { id: "entry1", hint: "first entry (LOUD)", capacity: 1 },
      { id: "entry2", hint: "second entry (LOUD)", capacity: 1 },
      { id: "announce", hint: "the announcement", capacity: 1 },
    ],
    crossWing: true,
    palette: [
      { code: "m1.toUpperCase()", correct: true },
      { code: "m2.toUpperCase()", correct: true },
      { code: '"Registered: " + ledger', correct: true },
      { code: "m1", tag: "no_normalization" },
      { code: "m2", tag: "no_normalization" },
      { code: "m1.toUpperCase", tag: "property_vs_method_syntax" },
      { code: '"m1".toUpperCase()', tag: "literal_as_variable_belief" },
      { code: '"Registered: [m1, m2]"', tag: "variable_as_literal_belief" },
      { code: "ledger", tag: "missing_label" },
    ],
    tests: [
      { input: ["ana", "ben"], expectedList: ["ANA", "BEN"], expectedOutput: "Registered: [ANA, BEN]" },
      { input: ["kai", "zoe"], expectedList: ["KAI", "ZOE"], expectedOutput: "Registered: [KAI, ZOE]" },
      { input: ["OK", "AI"], expectedList: ["OK", "AI"], expectedOutput: "Registered: [OK, AI]" },
    ],
    postMissionNote: "Scanner heard them. String made them loud. The shelf remembered them in order. println told the world. FOUR wings in one program, Curator — the widest build yet. This is what real Java looks like.",
    concept: "four_wing_capstone" },
];

const MISCONCEPTION_FEEDBACK = {
  append_instead_of_insert: "Look at the report — the new entry landed at the END, not where the mission needed it. Plain add() always appends. To PLACE an entry, reach for add(index, element).",
  add_index_offset_belief: "The insertion index is EXACT — check the report's final state against the target. add(1, x) puts x at index 1 precisely; everything from the old index 1 onward shifts up.",
  add_reverses_order_belief: "The shelf shows the books out of order — add() files in CALL order, first call to shelf 0. Match your call order to the target order.",
  wrong_type_for_generic: "The compile stamp — an Integer book bounced off the String shelf. The angle brackets are the contract.",
  unquoted_string_literal: "Dune without quotes is a VARIABLE NAME Java can't find — compile error. String literals live in quotes.",
  array_syntax_confusion: 'waitlist.add(0) = ... is array-bracket thinking. ArrayList uses METHOD calls: add(0, "Vip") — index and element both inside the parens.',
  append_via_size_index: 'add(3, "Vip") is legal — index == size is exactly the append boundary from the Card Catalog. But legal isn\'t enough: it lands Vip at the BACK. The mission needed position 0.',
  loop_bound_off_by_one: "Count the books in the report — one too many (or too few)! i < n runs exactly n times; i <= n runs n+1. The zero test would have caught it too: an empty crate files nothing.",
  unwanted_index_suffix: "The spines read 'Ledger0, Ledger1...' — the + i glued the counter onto every title. The mission wanted identical copies.",
  unnecessary_insertion: "Legal! When i equals the size, insertion IS appending. But plain add() says what you mean — keep it simple.",
  variable_as_literal_belief: "The report shows the literal text — inside quotes, variable names become plain words. Drop the quotes to reach the VALUE.",
  wrong_variable_used: "The compile stamp — 'second' doesn't exist yet at that line. Variables must be declared before use; file each reader as they arrive.",
  unnecessary_insertion_wrong: "add(0, second) pushed the second reader to the FRONT — the report shows the reversed order. Arrival order means append order.",
  no_normalization: "The ledger shows lowercase names — the mission asked for LOUD. Uppercase before you file.",
  property_vs_method_syntax: "The arc's oldest trap — parentheses on String methods! toUpperCase(). From the Scan Chamber to the Reading Room, the rule never changed.",
  literal_as_variable_belief: "'\"m1\".toUpperCase()' files the WORD 'M1', not the member's name. Drop the quotes to reach the variable.",
  missing_label: "The console printed just the bracket list — the mission wanted the 'Registered: ' label in front. Concatenate the label with the list.",
};

const HINTS = {
  1: "Three appends, in exactly the order the brief lists the titles. First call lands on shelf 0.",
  2: "Beta must be the THIRD call but live at index 1 — that's the two-argument add: shelf.add(1, \"Beta\") inserts and shifts Gamma up.",
  3: "Front of the line is index 0. waitlist.add(0, \"Vip\") inserts there and shifts everyone else back.",
  4: "i < n runs the body exactly n times (i = 0 to n-1). The body files one plain \"Ledger\" per iteration — no counter glued on.",
  5: "File the VARIABLES, not their names in quotes — waitlist.add(first) after the first read, waitlist.add(second) after the second.",
  6: "Uppercase each member with .toUpperCase() (parentheses!), and announce with \"Registered: \" + ledger — the list prints itself in brackets.",
};

export class Level48Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level48Scene" });
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
    this.insertionProactive = {};
    this.loopBoundFirstRun = {};
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
    this._modalLockedInput = false;
    // "Review the basics" in the Bit menu sends the player back to this
    // wing's Accretion-phase intro (which has the real tutorial) instead of
    // restarting this drag-and-drop Restructuring-phase level with nothing
    // to review.
    this.baseTutorialScene = "Level46Scene";
    this.currentList = [];
    this.currentListType = null;
    this.currentListName = null;
    this.shelfBookSprites = [];
    this.tickerContent = "";
    this._globeSpeed = 1;
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

    try { GameManager.incrementAttempt(47); } catch (_) {}

    this.createParticleTexture();
    this.createBackground();
    this.createReadingRoomInterior();
    this.createReadingRoomFloor();
    this.createBankersLamp();
    this.createGlobe();
    this.createQuietSign();
    this.createAmbientParticles();
    this.createCodeCanvas();
    this.createBlockPalette();
    this.createRunButton();
    this.createRigWindow();
    this.createMiniBookshelf();
    this.createMiniListStatePanel();
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
    this.updateGlobeRotation(time);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // BACKGROUND — the grand reading room
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l48_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l48_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x0a0704).setDepth(0);
  }

  createReadingRoomInterior() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x0d0906, 1);
    g.fillRect(0, 0, W, 216);

    // floor-to-ceiling bookcase silhouette: 10×3 grid of book-row cells
    const spineColors = [0x8a6435, 0x3a2618, 0xc8a05a, 0x6d4c41];
    this._spineRects = [];
    for (let row = 0; row < 3; row++) {
      const rowAlpha = 0.25 - row * 0.07; // upper rows fade into darkness
      for (let col = 0; col < 10; col++) {
        const cx = col * 128, cy = 8 + (2 - row) * 68;
        g.lineStyle(1, 0x241a0e, 0.3);
        g.strokeRect(cx + 4, cy, 120, 64);
        let x = cx + 10;
        while (x < cx + 116) {
          const bw = Phaser.Math.Between(4, 8);
          const bh = Phaser.Math.Between(20, 40);
          g.fillStyle(Phaser.Utils.Array.GetRandom(spineColors), rowAlpha);
          g.fillRect(x, cy + 62 - bh, bw, bh);
          x += bw + 3;
        }
      }
    }

    // rolling ladder
    this.ladder = this.add.graphics().setDepth(2);
    this._ladderX = 980;
    this._drawLadder();

    // two grand arched windows with moonlight
    this._windowCones = [];
    [300, 640].forEach((x) => {
      g.lineStyle(2, 0x3a2618, 0.5);
      g.strokeRoundedRect(x, 20, 100, 120, { tl: 50, tr: 50, bl: 0, br: 0 });
      g.lineBetween(x + 50, 20, x + 50, 140);
      for (let i = 1; i <= 3; i++) g.lineBetween(x, 20 + i * 30, x + 100, 20 + i * 30);
      const cone = this.add.graphics().setDepth(1);
      cone.fillStyle(0xb0bec5, 0.02);
      cone.fillTriangle(x + 50, 140, x - 20, 300, x + 120, 300);
      this._windowCones.push(cone);
    });

    // banner
    const banner = this.add.graphics().setDepth(2);
    banner.fillStyle(0x0a0704, 1);
    banner.lineStyle(1, C_BRASS, 0.5);
    banner.fillRoundedRect(230, 12, 340, 28, 5);
    banner.strokeRoundedRect(230, 12, 340, 28, 5);
    this.add.text(400, 26, "T H E   R E A D I N G   R O O M", { font: "bold 15px Georgia", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.7).setDepth(3);
  }

  _drawLadder() {
    const g = this.ladder, x = this._ladderX;
    g.clear();
    g.lineStyle(2, 0x8a6435, 0.4);
    g.lineBetween(x, 200, x + 24, 20);
    g.lineBetween(x + 26, 200, x + 50, 20);
    for (let i = 0; i < 5; i++) {
      const t = i / 4;
      g.lineBetween(x + t * 24, 200 - t * 180, x + 26 + t * 24, 200 - t * 180);
    }
    g.fillStyle(C_BRASS, 0.5);
    g.fillCircle(x, 204, 4);
    g.fillCircle(x + 26, 204, 4);
  }

  createReadingRoomFloor() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x1a0e05, 1);
    g.fillRect(0, 635, W, 85);
    g.lineStyle(2, 0x3a2618, 1);
    g.lineBetween(0, 637, W, 637);
    // herringbone hint
    g.lineStyle(1, 0x241a0e, 0.3);
    for (let x = 0; x < W; x += 24) {
      g.lineBetween(x, 650, x + 12, 662);
      g.lineBetween(x + 12, 674, x + 24, 662);
    }
    // Persian rug
    g.lineStyle(1, 0x8a6435, 0.08);
    for (let i = 1; i <= 4; i++) g.strokeRoundedRect(640 - 250 + i * 8, 668 + i * 2, 500 - i * 16, 40 - i * 6, 6);
  }

  createBankersLamp() {
    const g = this.add.graphics().setDepth(4);
    g.lineStyle(2, C_BRASS, 0.6);
    g.beginPath();
    g.arc(730, 68, 14, Math.PI, Math.PI * 1.6, false);
    g.strokePath();
    g.fillStyle(0x2e7d32, 0.5);
    g.lineStyle(1, C_BRASS, 0.7);
    g.fillRoundedRect(716, 52, 44, 14, 6);
    g.strokeRoundedRect(716, 52, 44, 14, 6);
    this.lampGlow = this.add.ellipse(738, 74, 60, 18, 0xffa726, 0.04).setDepth(3);
  }

  createGlobe() {
    this.globeGfx = this.add.graphics().setDepth(3);
    this._globePhase = 0;
    const stand = this.add.graphics().setDepth(3);
    stand.lineStyle(2, 0x8a6435, 0.5);
    stand.lineBetween(1230, 612, 1218, 634);
    stand.lineBetween(1230, 612, 1242, 634);
    stand.lineBetween(1230, 612, 1230, 634);
  }

  updateGlobeRotation(time) {
    if (!this.globeGfx) return;
    this._globePhase = (time * 0.001 * this._globeSpeed / 30) % 1;
    const g = this.globeGfx;
    g.clear();
    g.lineStyle(2, 0x8a6435, 0.5);
    g.strokeCircle(1230, 590, 22);
    g.lineStyle(1, 0x8a6435, 0.3);
    g.lineBetween(1208, 590, 1252, 590);
    for (let k = 0; k < 2; k++) {
      const ph = (this._globePhase + k * 0.5) % 1;
      const rx = Math.abs(Math.cos(ph * Math.PI * 2)) * 20 + 1;
      g.strokeEllipse(1230, 590, rx, 43);
    }
  }

  createQuietSign() {
    this.quietSignBg = this.add.graphics().setDepth(4);
    this.quietSignText = this.add.text(890, 60, "QUIET PLEASE", { font: "bold 12px Georgia", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.4).setDepth(5);
    this._drawQuietSign(C_BRASS);
    this._quietState = "quiet";
  }

  _drawQuietSign(strokeColor) {
    this.quietSignBg.clear();
    this.quietSignBg.fillStyle(0x0a0704, 1);
    this.quietSignBg.lineStyle(1.5, strokeColor, 1);
    this.quietSignBg.fillRoundedRect(842, 48, 96, 24, 4);
    this.quietSignBg.strokeRoundedRect(842, 48, 96, 24, 4);
  }

  /** Flip illusion: scale-x 1 → 0 → 1 with text swap mid-flip. */
  flipQuietSign(state) {
    if (this._quietState === state) return;
    this._quietState = state;
    this.tweens.killTweensOf(this.quietSignText);
    this.tweens.add({
      targets: this.quietSignText, scaleX: 0, duration: 120, ease: "Sine.easeIn",
      onComplete: () => {
        if (!this.quietSignText.active) return;
        if (state === "session") {
          this.quietSignText.setText("IN SESSION").setColor("#e53935").setAlpha(0.9);
          this._drawQuietSign(0xe53935);
        } else if (state === "gold") {
          this.quietSignText.setText("QUIET PLEASE").setColor(HEX_GOLD).setAlpha(1);
          this._drawQuietSign(C_GOLD);
        } else if (state === "complete") {
          this.quietSignText.setText("COLLECTION COMPLETE").setColor(HEX_GOLD).setAlpha(1).setFontSize(7);
          this._drawQuietSign(C_GOLD);
        } else {
          this.quietSignText.setText("QUIET PLEASE").setColor(HEX_BRASS).setAlpha(0.4).setFontSize(10);
          this._drawQuietSign(C_BRASS);
        }
        this.tweens.add({ targets: this.quietSignText, scaleX: 1, duration: 120, ease: "Sine.easeOut", onComplete: () => {
          if (state === "session" && this.quietSignText.active) this.tweens.add({ targets: this.quietSignText, alpha: 0.6, duration: 500, yoyo: true, repeat: -1 });
        } });
      },
    });
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
  // CODE CANVAS (L27→L45 architecture, reused)
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
    this.tabFilename = this.add.text(CX + CW - 12, CY + TAB_H / 2, "Reading1.java", { font: "13px Courier New", color: "#546e7a" }).setOrigin(1, 0.5).setDepth(11);

    this.lineHighlight = this.add.rectangle(CX + CW / 2, 0, CW - 4, LINE_H, 0xffab00, 0.06).setDepth(19).setVisible(false);
    this.codeContainer = this.add.container(0, 0).setDepth(20);
  }

  _syntaxTokens(line) {
    const tokens = [];
    const re = /("(?:[^"\\]|\\.)*")|(\bimport\b|\bif\b|\belse\b|\bfor\b|\bint\b|\bdouble\b|\bString\b|\bnew\b|\bScanner\b|\bArrayList\b)|(<\w*>)|(\bSystem\.out\b)|(\bSystem\.in\b)|([A-Za-z_]\w*(?=\())|(>=|<=|==|!=|\+\+|--|[+\-*/><])|([(){}\[\];.,=])/g;
    let last = 0, m;
    const plain = (t) => t && tokens.push({ t, c: "#e0e0e0" });
    while ((m = re.exec(line))) {
      if (m.index > last) plain(line.slice(last, m.index));
      if (m[1]) tokens.push({ t: m[1], c: HEX_CYAN });
      else if (m[2]) tokens.push({ t: m[2], c: "#4caf50" });
      else if (m[3]) tokens.push({ t: m[3], c: HEX_GOLD });
      else if (m[4]) tokens.push({ t: m[4], c: "#ffd740" });
      else if (m[5]) tokens.push({ t: m[5], c: "#78909c" });
      else if (m[6]) tokens.push({ t: m[6], c: "#ff8a65" });
      else if (m[7]) tokens.push({ t: m[7], c: "#78909c" });
      else if (m[8]) tokens.push({ t: m[8], c: "#78909c" });
      last = m.index + m[0].length;
    }
    if (last < line.length) plain(line.slice(last));
    return tokens.length ? tokens : [{ t: line, c: "#e0e0e0" }];
  }

  _isDimmedInfrastructure(rawLine) {
    return /^import java\.util\.ArrayList;$/.test(rawLine) || /^Scanner sc = new Scanner/.test(rawLine);
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
          const w = 200;
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
  // BLOCK PALETTE (drag system, reused)
  // ══════════════════════════════════════════════════════════════

  createBlockPalette() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0f0a06, 1);
    g.fillRoundedRect(PX, PY, PW, PH, 10);
    g.lineStyle(1, 0x3a2618, 1);
    g.strokeRoundedRect(PX, PY, PW, PH, 10);
    this.add.text(PX + 10, PY + 8, "CURATOR'S PARTS", { font: "bold 11px Arial", color: "#3d4450" }).setDepth(11);
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
  // RIG WINDOW — mini bookshelf + list state panel + cameos
  // ══════════════════════════════════════════════════════════════

  createRigWindow() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0d0805, 1);
    g.fillRoundedRect(OX, OY, OW, OH, 12);
    g.lineStyle(3, C_BRASS, 1);
    g.strokeRoundedRect(OX, OY, OW, OH, 12);
    this.add.text(OX + 10, OY + 6, "ARCHIVE RIG — LIVE", { font: "bold 11px Georgia", color: HEX_BRASS }).setAlpha(0.7).setDepth(11);

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
    g.fillRect(MS_X0, MS_TOP, 7, MS_BOT - MS_TOP);
    g.fillRect(MS_X1 - 7, MS_TOP, 7, MS_BOT - MS_TOP);
    g.fillRect(MS_X0, MS_TOP, MS_X1 - MS_X0, 8);
    g.fillRect(MS_X0, MS_BOT - 8, MS_X1 - MS_X0, 8);

    this.typeStampText = this.add.text(MS_CX - 20, OY + 48, "", { font: "bold 10px Courier New", color: HEX_CYAN }).setOrigin(0.5);
    this.sizeCounterText = this.add.text(MS_X1 - 4, OY + 48, "size: 0", { font: "bold 10px Courier New", color: HEX_BRASS }).setOrigin(1, 0.5);
    this.rigLayer.add([this.typeStampText, this.sizeCounterText]);

    this.shelfIndexPlates = [];
    for (let i = 0; i < 7; i++) {
      const y = MS_BASE_Y - i * MS_STEP;
      const ledge = this.add.graphics();
      ledge.fillStyle(0x3a2618, 0.5);
      ledge.fillRoundedRect(MS_CX - 55, y - 9, 110, 18, 2);
      const idxText = this.add.text(MS_X0 + 10, y, String(i), { font: "bold 10px Courier New", color: HEX_GRAY }).setOrigin(0.5);
      this.rigLayer.add([ledge, idxText]);
      this.shelfIndexPlates.push({ text: idxText, y });
    }
    // index-0 amber glow
    const glow = this.add.circle(MS_X0 + 10, MS_BASE_Y, 7, C_GOLD, 0);
    this.rigLayer.add(glow);
    this.tweens.add({ targets: glow, alpha: 0.15, duration: 1200, yoyo: true, repeat: -1 });

    this.bookLayer = this.add.container(0, 0);
    this.rigLayer.add(this.bookLayer);
  }

  createMiniListStatePanel() {
    const hdr = this.add.text(LP_X, OY + 40, "LIST STATE", { font: "bold 10px Georgia", color: HEX_BRASS }).setAlpha(0.7);
    this.bracketText = this.add.text(LP_CX, OY + 82, "[]", { font: "bold 12px Courier New", color: HEX_GRAY, wordWrap: { width: 250 }, align: "center" }).setOrigin(0.5);
    this.panelSizeText = this.add.text(LP_CX, OY + 112, "size: 0", { font: "11px Courier New", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.85);
    this.panelIndexText = this.add.text(LP_CX, OY + 128, "", { font: "bold 10px Courier New", color: "#8a6435", wordWrap: { width: 250 }, align: "center" }).setOrigin(0.5).setAlpha(0.7);
    this.rigLayer.add([hdr, this.bracketText, this.panelSizeText, this.panelIndexText]);
  }

  createMiniCrossWingCameos() {
    // Scanner tape (top strip) — dark until a mission loads input
    this.tapeContainer = this.add.container(0, 0);
    this.rigLayer.add(this.tapeContainer);
    this.tapeState = [];

    // typed containers (M5/M6)
    this.containerObjs = {};
    this.containerLayer = this.add.container(0, 0).setVisible(false);
    this.rigLayer.add(this.containerLayer);

    // mini case press (M6)
    this.pressLayer = this.add.container(0, 0).setVisible(false);
    const pg = this.add.graphics();
    pg.fillStyle(0x1a1108, 1);
    pg.lineStyle(1, C_BRASS, 0.6);
    pg.fillRoundedRect(OX + 330, OY + 202, 104, 26, 4);
    pg.strokeRoundedRect(OX + 330, OY + 202, 104, 26, 4);
    const pl = this.add.text(OX + 336, OY + 207, "PRESS", { font: "bold 8px Georgia", color: HEX_BRASS }).setAlpha(0.7);
    this.pressText = this.add.text(OX + 382, OY + 218, "", { font: "bold 10px Courier New", color: HEX_ORANGE }).setOrigin(0.5);
    this.pressLayer.add([pg, pl, this.pressText]);
    this.rigLayer.add(this.pressLayer);

    // output ticker (M6) — slim console strip along the bottom edge
    this.tickerLayer = this.add.container(0, 0).setVisible(false);
    const tg = this.add.graphics();
    tg.fillStyle(0x050914, 0.9);
    tg.fillRect(OX + 8, TICKER_Y - 8, OW - 16, 16);
    this.tickerText = this.add.text(OX + 14, TICKER_Y, "", { font: "bold 11px Courier New", color: HEX_GREEN_BRIGHT }).setOrigin(0, 0.5);
    this.tickerLayer.add([tg, this.tickerText]);
    this.rigLayer.add(this.tickerLayer);
    this.tickerContent = "";
  }

  activateCameo(kind) {
    if (kind === "containers") this.containerLayer.setVisible(true);
    if (kind === "press") this.pressLayer.setVisible(true);
    if (kind === "ticker") this.tickerLayer.setVisible(true);
  }

  parkCameos() {
    this.containerLayer.setVisible(false);
    this.pressLayer.setVisible(false);
    this.tickerLayer.setVisible(false);
    this.containerLayer.removeAll(true);
    this.containerObjs = {};
    this.pressText.setText("");
    this.clearTicker();
  }

  miniDispenseTo(name, value) {
    this.activateCameo("containers");
    const idx = Object.keys(this.containerObjs).length;
    if (!this.containerObjs[name]) {
      const y = OY + 152 + idx * 24;
      const g = this.add.graphics();
      g.fillStyle(0x0a1520, 1);
      g.lineStyle(1, C_CYAN, 0.6);
      g.fillRoundedRect(LP_X + 10, y, 210, 20, 4);
      g.strokeRoundedRect(LP_X + 10, y, 210, 20, 4);
      const t = this.add.text(LP_X + 18, y + 10, "", { font: "bold 10px Courier New", color: HEX_CYAN }).setOrigin(0, 0.5);
      this.containerLayer.add([g, t]);
      this.containerObjs[name] = t;
    }
    this.containerObjs[name].setText(`String ${name} = "${value}"`);
    this.tweens.add({ targets: this.containerObjs[name], scale: 1.15, duration: 110, yoyo: true });
  }

  async miniPressStamp(input, output) {
    this.activateCameo("press");
    this.pressText.setText(`${input} → ${output}`);
    if (this.pressText.width > 96) this.pressText.setFontSize(6);
    this.tweens.add({ targets: this.pressText, scale: 1.2, duration: 100, yoyo: true });
    const p = this.add.particles(OX + 382, OY + 215, "l48_dot", { speed: { min: 15, max: 40 }, angle: { min: 0, max: 360 }, scale: { start: 0.35, end: 0 }, lifespan: 200, tint: [C_ORANGE], emitting: false });
    this.rigLayer.add(p);
    p.explode(4);
    this.time.delayedCall(280, () => p.destroy());
    await this.delay(180);
  }

  async pushTicker(text) {
    this.activateCameo("ticker");
    for (const ch of text) {
      if (!this._alive) return;
      if (ch === "\n") { continue; }
      this.tickerContent += ch;
      this.tickerText.setText(this.tickerContent);
      if (this.tickerText.width > OW - 30) this.tickerText.setFontSize(7);
      await this.delay(9);
    }
  }

  clearTicker() {
    this.tickerContent = "";
    if (this.tickerText) this.tickerText.setText("").setFontSize(9);
  }

  // ── Mini Scanner tape (L34–36 lineage, compact) ──

  _classifyChar(ch) {
    if (ch === " ") return "space";
    if (ch === "\n") return "newline";
    return "alpha";
  }

  buildCellsFromLines(inputLines) {
    const cells = [];
    (inputLines || []).forEach((line) => {
      line.split("").forEach((ch) => cells.push({ ch, kind: this._classifyChar(ch) }));
      cells.push({ ch: "\n", kind: "newline" });
    });
    return cells;
  }

  loadMiniTape(inputLines) {
    this.tapeState = this.buildCellsFromLines(inputLines);
    this.renderMiniTape();
  }

  renderMiniTape() {
    this.tapeContainer.removeAll(true);
    if (this.tapeState.length === 0) return;
    const cellW = 8, x0 = OX + 12, x1 = OX + OW - 12;
    const totalW = Math.min(this.tapeState.length * cellW, x1 - x0);
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

  async tapeConsumeVisual(count) {
    this.tapeState = this.tapeState.slice(count);
    this.renderMiniTape();
    await this.delay(70);
  }

  // ══════════════════════════════════════════════════════════════
  // MINI BOOKS — append / insert / reject (honest, trace-driven)
  // ══════════════════════════════════════════════════════════════

  _shelfY(idx) { return MS_BASE_Y - Math.min(idx, 6) * MS_STEP; }

  _makeMiniBook(value) {
    const c = this.add.container(PREP_SPOT.x, PREP_SPOT.y);
    const g = this.add.graphics();
    g.fillStyle(C_CYAN, 0.85);
    g.lineStyle(1, 0x1a6fa0, 1);
    g.fillRoundedRect(-17, -8, 34, 16, 2);
    g.strokeRoundedRect(-17, -8, 34, 16, 2);
    const label = String(value);
    const txt = this.add.text(0, 0, label, { font: "bold 10px Georgia", color: "#0a0704" }).setOrigin(0.5);
    if (txt.width > 30) txt.setFontSize(6);
    c.add([g, txt]);
    this.bookLayer.add(c);
    return { container: c, value };
  }

  async prepareBook(value) {
    const book = this._makeMiniBook(value);
    book.container.setAlpha(0).setScale(0.5);
    await new Promise((res) => { this.tweens.add({ targets: book.container, alpha: 1, scale: 1, duration: 120, ease: "Back.easeOut", onComplete: res }); });
    return book;
  }

  async addBookToShelf(value) {
    const book = await this.prepareBook(value);
    if (!this._alive) return { ok: true };
    const idx = this.currentList.length;
    const targetY = this._shelfY(idx);
    await new Promise((res) => {
      this.tweens.add({ targets: book.container, x: MS_CX, y: targetY, duration: 220, ease: "Sine.easeInOut", onComplete: res });
    });
    this._settleMiniBook(book, idx);
    await this.delay(50);
    return { ok: true };
  }

  async insertBookAtIndex(value, index) {
    const book = await this.prepareBook(value);
    if (!this._alive) return { ok: true };
    const targetY = this._shelfY(index);

    // cyan insertion glow at the target shelf
    const glow = this.add.graphics();
    glow.fillStyle(C_CYAN, 0.3);
    glow.fillRoundedRect(MS_CX - 55, targetY - 9, 110, 18, 2);
    this.rigLayer.add(glow);
    this.tweens.add({ targets: glow, alpha: 0, duration: 400, delay: 200, onComplete: () => glow.destroy() });

    // books at >= index slide up one shelf; the new book flies in
    const shifting = this.shelfBookSprites.slice(index);
    const shiftP = new Promise((res) => {
      if (shifting.length === 0) { res(); return; }
      let done = 0;
      shifting.forEach((b, k) => {
        this.tweens.add({ targets: b.container, y: this._shelfY(index + k + 1), duration: 240, ease: "Sine.easeOut", onComplete: () => { if (++done === shifting.length) res(); } });
      });
    });
    const flightP = new Promise((res) => {
      this.tweens.add({ targets: book.container, x: MS_CX, y: targetY, duration: 260, ease: "Sine.easeInOut", onComplete: res });
    });
    await Promise.all([shiftP, flightP]);
    if (!this._alive) return { ok: true };
    this._settleMiniBook(book, index, true);
    await this.delay(50);
    return { ok: true };
  }

  _settleMiniBook(book, idx, inserted = false) {
    this.tweens.add({ targets: book.container, y: book.container.y - 2, duration: 50, yoyo: true });
    this.currentList.splice(idx, 0, { value: book.value });
    this.shelfBookSprites.splice(idx, 0, book);
    const plate = this.shelfIndexPlates[Math.min(idx, 6)];
    if (plate) { plate.text.setColor(HEX_CYAN); this.tweens.add({ targets: plate.text, scale: 1.4, duration: 110, yoyo: true }); }
    this.updateSizeCounter();
    this.updateListStatePanel();
  }

  async rejectWrongType(displayValue) {
    const book = await this.prepareBook(displayValue);
    await new Promise((res) => {
      this.tweens.add({ targets: book.container, x: MS_CX, y: this._shelfY(this.currentList.length) + 30, duration: 180, ease: "Sine.easeOut", onComplete: res });
    });
    await new Promise((res) => {
      this.tweens.add({ targets: book.container, x: book.container.x - 25, y: book.container.y + 20, angle: -20, alpha: 0, duration: 200, onComplete: res });
    });
    book.container.destroy();
    await this.showRigStamp("TYPE MISMATCH");
    return { ok: false, crash: "type_mismatch" };
  }

  async rejectInvalidIndex(value, targetIndex) {
    const book = await this.prepareBook(value);
    const plate = this.shelfIndexPlates[Math.min(targetIndex, 6)];
    if (plate) {
      plate.text.setColor(HEX_RED);
      this.tweens.add({ targets: plate.text, alpha: 0.3, duration: 90, yoyo: true, repeat: 3 });
      this.time.delayedCall(1100, () => { if (plate.text.active) { plate.text.setColor(HEX_GRAY); plate.text.setAlpha(1); } });
    }
    await this.delay(220);
    if (!this._alive) return { ok: false, crash: "ioobe" };
    await new Promise((res) => {
      this.tweens.add({ targets: book.container, x: MS_CX, y: OY + 150, duration: 160, ease: "Sine.easeOut", onComplete: res });
    });
    await new Promise((res) => {
      this.tweens.add({ targets: book.container, x: book.container.x - 25, y: book.container.y + 25, angle: -25, alpha: 0, duration: 200, onComplete: res });
    });
    book.container.destroy();
    await this.showRigStamp("IndexOutOfBoundsException");
    return { ok: false, crash: "ioobe" };
  }

  async showRigStamp(label) {
    const stamp = this.add.text(OX + OW / 2, OY + 120, label, { font: "bold 13px Courier New", color: HEX_RED }).setOrigin(0.5).setAngle(-6).setAlpha(0).setDepth(25);
    this.rigLayer.add(stamp);
    this.tweens.add({ targets: stamp, alpha: 1, duration: 130 });
    this.screenShake(0.005, 160);
    await this.delay(750);
    if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 180, onComplete: () => stamp.destroy() });
  }

  updateSizeCounter() {
    this.sizeCounterText.setText(`size: ${this.currentList.length}`);
    this.tweens.add({ targets: this.sizeCounterText, scale: 1.25, duration: 100, yoyo: true });
  }

  updateListStatePanel() {
    if (this.currentList.length === 0) {
      this.bracketText.setText("[]").setColor(HEX_GRAY);
      this.panelSizeText.setText("size: 0");
      this.panelIndexText.setText("");
      return;
    }
    this.bracketText.setText(this._listToString()).setColor("#e8dfc8");
    this.panelSizeText.setText(`size: ${this.currentList.length}`);
    this.panelIndexText.setText(this.currentList.map((_, i) => `[${i}]`).join(" "));
  }

  /** Java's real ArrayList toString: [a, b, c] — no quotes on Strings. */
  _listToString() {
    return `[${this.currentList.map((e) => String(e.value)).join(", ")}]`;
  }

  clearMiniShelf() {
    this.shelfBookSprites.forEach((b) => b.container.destroy());
    this.shelfBookSprites = [];
    this.currentList = [];
    this.shelfIndexPlates.forEach((p) => { p.text.setColor(HEX_GRAY); p.text.setAlpha(1); });
    this.sizeCounterText.setText("size: 0");
    this.updateListStatePanel();
  }

  setShelfType(listType) {
    this.currentListType = listType;
    this.typeStampText.setText(`ArrayList<${listType}>`);
    if (this.typeStampText.width > 120) this.typeStampText.setFontSize(7);
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
  // MANIFEST STRIP / TEST REPORT / MISSION BRIEF
  // ══════════════════════════════════════════════════════════════

  createManifestStrip() {
    const g = this.add.graphics().setDepth(14);
    g.fillStyle(0x0f0a06, 0.9);
    g.fillRect(OX, STRIP_Y - 2, OW, 20);
    this.manifestStripText = this.add.text(OX + 8, STRIP_Y + 8, "", { font: "12px Arial", color: HEX_BRASS }).setOrigin(0, 0.5).setDepth(15);
  }
  updateManifestStrip(text) { this.manifestStripText.setText(text); }

  loopIterationBeat(label) {
    this.updateManifestStrip(label);
    this.tweens.add({ targets: this.manifestStripText, alpha: 0.4, duration: 80, yoyo: true });
  }

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
    if (test.input) return test.input.join(" ⏎ ");
    if (test.subs) return Object.entries(test.subs).map(([k, v]) => `${k}=${v}`).join(", ");
    return "—";
  }

  buildReportRows(mission) {
    this.reportRows.forEach((r) => r.container.destroy());
    this.reportRows = [];
    mission.tests.forEach((test, i) => {
      const y = RY + 24 + i * 24;
      const c = this.add.container(RX + 10, y).setDepth(11).setAlpha(0.35);
      const label = this._compactTestLabel(test);
      const inputT = this.add.text(0, 0, label, { font: "11px Courier New", color: "#b0bec5" }).setOrigin(0, 0.5);
      const expected = `[${(test.expectedList || []).join(", ")}]`.slice(0, 26);
      const expT = this.add.text(140, 0, expected, { font: "11px Courier New", color: "#78909c" }).setOrigin(0, 0.5);
      const actualT = this.add.text(290, 0, "", { font: "11px Courier New", color: HEX_RED }).setOrigin(0, 0.5);
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
    if (!match && actualText !== undefined) row.actualT.setText(String(actualText).slice(0, 20));
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

    this.add.text(20, 14, "THE READING ROOM", { font: "bold 15px Georgia", color: "#b0bec5" }).setDepth(51);
    this.add.text(20, 32, "Restructuring Phase — add()", { font: "12px Arial", color: "#546e7a" }).setDepth(51);

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
    // Kill leftover pulse tweens first (L45 lesson — the infinite
    // alpha-yoyo would otherwise keep running on completed hexes).
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
  // BIT — Reading Room Curator variant (cape, gloves, spectacles, key)
  // ══════════════════════════════════════════════════════════════

  createBit() {
    const c = this.add.container(90, 560).setDepth(60);
    const g = this.add.graphics();
    g.lineStyle(2, 0x78909c, 1);
    g.lineBetween(0, -17, 0, -32);
    g.fillStyle(0x37474f, 1);
    g.fillRoundedRect(-20, -17, 40, 35, 10);
    const tip = this.add.circle(0, -32, 3, C_GOLD);
    const antennaPlate = this.add.graphics();
    antennaPlate.fillStyle(C_BRASS, 0.9);
    antennaPlate.fillRoundedRect(3, -36, 8, 5, 1);
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
    const gloveL = this.add.circle(-16, 10, 4, 0xe0d6b8, 0.85);
    const gloveR = this.add.circle(16, 10, 4, 0xe0d6b8, 0.85);
    // the master key on a chain
    const key = this.add.graphics();
    key.lineStyle(1, C_BRASS, 0.8);
    key.strokeCircle(0, 14, 3);
    key.lineBetween(0, 17, 0, 24);
    key.lineBetween(0, 22, 3, 22);
    key.lineBetween(0, 24, 4, 24);
    c.add([g, cape, eye, pupil, specs, gloveL, gloveR, key, tip, antennaPlate]);
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
    const p = this.add.particles(x, y, "l48_dot", {
      speed: { min: 70, max: 220 }, angle: { min: 0, max: 360 }, scale: { start: 0.8, end: 0 }, lifespan: 450,
      tint: [C_CYAN, C_GOLD, C_GREEN_BRIGHT, C_ORANGE, 0xffffff], emitting: false,
    }).setDepth(75);
    p.explode(count);
    this.time.delayedCall(800, () => p.destroy());
  }

  createGoldConfetti(x, y, count = 40) {
    const p = this.add.particles(x, y, "l48_dot", {
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
    await this.bitSay("Welcome to the Reading Room, Curator — the heart of the Archive. You've filed cards and caught the tricky insertions. Now you BUILD the collections themselves. Every mission ships a real, ordered list: reading queues, priority shelves, registers fed by living readers. Choose your add() form with intent — append to grow, insert to place.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(5200)]); if (!A()) return;
    this.hideBubble();

    const a1 = this.floatingAnnotation(CX + CW / 2, CY - 16, "the collection script", HEX_CYAN);
    await this.delay(400); if (!A()) return;
    const a2 = this.floatingAnnotation(PX + PW / 2, PY - 12, "blocks — watch the types and the indices", HEX_GRAY);
    await this.delay(400); if (!A()) return;
    const a3 = this.floatingAnnotation(OX + OW / 2, OY - 12, "your shelf builds LIVE", HEX_GREEN_BRIGHT);
    await this.delay(400); if (!A()) return;
    const a4 = this.floatingAnnotation(890, 36, "flips when we're in session", "#e53935");
    await this.delay(400); if (!A()) return;
    const a5 = this.floatingAnnotation(RX + RW / 2, RY - 12, "every scenario's final shelf must match", HEX_VIOLET);
    await this.delay(400); if (!A()) return;

    await this.bitSay("One rule above all: the list REMEMBERS order. Where a book lands is decided by WHEN you add it and WHICH form you use. Build, run, read the shelf, repair. To the stacks!");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
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

    this.tabFilename.setText(`Reading${mission.mission}.java`);
    this.renderSkeleton(mission);
    this.populatePalette(mission);
    this.buildReportRows(mission);
    this.renderMissionBrief(mission);
    this.disableRunButton();
    this.highlightCodeLine(null);
    this.verdictLamp.setFillStyle(C_GRAY);
    this.clearMiniShelf();
    this.parkCameos();
    const declLine = mission.skeleton.find((l) => /^ArrayList</.test(l));
    const dm = declLine && declLine.match(/^ArrayList<(\w+)>\s+(\w+)/);
    if (dm) { this.setShelfType(dm[1]); this.currentListName = dm[2]; }
    this.loadMiniTape(mission.tests[0].input);
    this.updateManifestStrip("");
    this.flipQuietSign("quiet");
    this.inputLocked = false;
  }

  clearMission() {
    this.missionElements.forEach((e) => { if (e && e.destroy) e.destroy(); });
    this.missionElements = [];
  }

  // ══════════════════════════════════════════════════════════════
  // PROGRAM ASSEMBLY & SUBSTITUTION
  // ══════════════════════════════════════════════════════════════

  _substitute(mission, test) {
    const decls = {};
    mission.skeleton.forEach((line) => {
      const m = line.match(/^(int|double|String)\s+(\w+)\s*=\s*\/\* test value \*\/;$/);
      if (!m) return;
      const [, type, name] = m;
      const raw = test.subs ? test.subs[name] : undefined;
      if (raw === undefined) return;
      let value;
      if (type === "int") value = parseInt(raw, 10);
      else if (type === "double") value = parseFloat(raw);
      else value = raw.replace(/^"|"$/g, "");
      decls[name] = { value, type: type === "String" ? "string" : type };
    });
    return decls;
  }

  /** Builds the substituted program: one item per skeleton line, slot
   * tokens replaced by the assembled block codes, test values inlined.
   * Item indices match the rendered skeleton lines (for highlighting). */
  buildProgramItems(mission, assembled, test) {
    return mission.skeleton.map((rawLine) => {
      let text = rawLine;
      let slotId = null;
      const sm = text.match(/<slot:(\w+)>/);
      if (sm) {
        slotId = sm[1];
        const code = assembled[slotId] && assembled[slotId][0] ? assembled[slotId][0].code : "";
        text = text.replace(/<slot:\w+>/, code);
      }
      if (test && test.subs) {
        const dm = text.match(/^(int|double|String)\s+(\w+)\s*=\s*\/\* test value \*\/;$/);
        if (dm && test.subs[dm[2]] !== undefined) text = `${dm[1]} ${dm[2]} = ${test.subs[dm[2]]};`;
      }
      return { text, slotId };
    });
  }

  _splitTopArgs(argsStr) {
    const parts = [];
    let cur = "", inQuotes = false, depth = 0;
    for (let i = 0; i < argsStr.length; i++) {
      const ch = argsStr[i];
      if (ch === '"' && argsStr[i - 1] !== "\\") inQuotes = !inQuotes;
      if (!inQuotes) {
        if (ch === "(") depth++;
        if (ch === ")") depth--;
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

  // ══════════════════════════════════════════════════════════════
  // COMPILE CHECK — run never starts on a compile error (L27 rule)
  // ══════════════════════════════════════════════════════════════

  compileCheckProgram(items, assembled, mission) {
    const declared = new Set(["sc"]);
    let listName = null;
    let inLoop = false;
    const fullText = items.map((it) => it.text).join("\n");

    const failFor = (slotId, fallbackTag) => {
      const blockTag = slotId && assembled[slotId] && assembled[slotId][0] ? assembled[slotId][0].tag : null;
      return { ok: false, slotId, tag: blockTag || fallbackTag };
    };

    const checkIdent = (id, slotId) => {
      if (declared.has(id) || id === listName || (inLoop && id === "i")) return null;
      // declared later in the program → order bug; never declared → unquoted literal
      const laterDecl = new RegExp(`String\\s+${id}\\s*=`).test(fullText);
      return failFor(slotId, laterDecl ? "wrong_variable_used" : "unquoted_string_literal");
    };

    const checkExpr = (expr, slotId, isElement) => {
      const t = expr.trim();
      if (/\.(toUpperCase|toLowerCase)$/.test(t)) return failFor(slotId, "property_vs_method_syntax");
      const plusParts = this._splitTopPlus(t);
      if (plusParts.length > 1) {
        for (const p of plusParts) { const r = checkExpr(p, slotId, false); if (r) return r; }
        return null;
      }
      if (/^".*"\.to(Upper|Lower)Case\(\)$/.test(t)) return null;
      if (/^".*"$/.test(t)) return null;
      if (/^-?\d+$/.test(t)) {
        if (isElement && this.currentListType === "String") return failFor(slotId, "wrong_type_for_generic");
        return null;
      }
      const mm = t.match(/^(\w+)\.to(Upper|Lower)Case\(\)$/);
      if (mm) return checkIdent(mm[1], slotId);
      if (/^[A-Za-z_]\w*$/.test(t)) return checkIdent(t, slotId);
      return failFor(slotId, "unquoted_string_literal");
    };

    for (const item of items) {
      const line = item.text.trim();
      if (!line || line.startsWith("//") || line.startsWith("import") || /^Scanner sc/.test(line)) continue;
      if (/\w+\.add\([^)]*\)\s*=/.test(line)) return failFor(item.slotId, "array_syntax_confusion");
      if (/\.(toUpperCase|toLowerCase)(?!\()/.test(line)) return failFor(item.slotId, "property_vs_method_syntax");

      const declList = line.match(/^ArrayList<(\w+)>\s+(\w+)\s*=/);
      if (declList) { listName = declList[2]; continue; }
      const declInt = line.match(/^int\s+(\w+)\s*=/);
      if (declInt) { declared.add(declInt[1]); continue; }
      const declRead = line.match(/^String\s+(\w+)\s*=\s*sc\.nextLine\(\);$/);
      if (declRead) { declared.add(declRead[1]); continue; }
      const forMatch = line.match(/^for \(int i = 0; (.*); i\+\+\) \{$/);
      if (forMatch) {
        inLoop = true;
        const cond = forMatch[1].trim();
        if (!/^i\s*(<=|<)\s*\w+(\s*-\s*1)?$/.test(cond)) return failFor(item.slotId, "loop_bound_off_by_one");
        continue;
      }
      if (line === "}") { inLoop = false; continue; }
      const addMatch = line.match(/^(\w+)\.add\((.*)\);$/);
      if (addMatch) {
        const args = this._splitTopArgs(addMatch[2]);
        if (args.length === 2) {
          const idxErr = checkExpr(args[0], item.slotId, false);
          if (idxErr) return idxErr;
          const elemErr = checkExpr(args[1], item.slotId, true);
          if (elemErr) return elemErr;
        } else if (args.length === 1) {
          const err = checkExpr(args[0], item.slotId, true);
          if (err) return err;
        }
        continue;
      }
      const printMatch = line.match(/^System\.out\.println\((.*)\);$/);
      if (printMatch) {
        const err = checkExpr(printMatch[1], item.slotId, false);
        if (err) return err;
      }
    }
    return { ok: true };
  }

  // ══════════════════════════════════════════════════════════════
  // GENUINE INTERPRETER — sequential, honest, trace-driven
  // ══════════════════════════════════════════════════════════════

  evalExpr(expr, decls) {
    const t = expr.trim();
    const plusParts = this._splitTopPlus(t);
    if (plusParts.length > 1) {
      let out = "";
      for (const p of plusParts) {
        const r = this.evalExpr(p, decls);
        if (!r.ok) return r;
        out += String(r.value);
      }
      return { ok: true, value: out, type: "string" };
    }
    let m = t.match(/^"([^"]*)"\.to(Upper|Lower)Case\(\)$/);
    if (m) return { ok: true, value: m[2] === "Upper" ? m[1].toUpperCase() : m[1].toLowerCase(), type: "string" };
    if (/^".*"$/.test(t)) return { ok: true, value: t.slice(1, -1), type: "string" };
    if (/^-?\d+$/.test(t)) return { ok: true, value: parseInt(t, 10), type: "int" };
    m = t.match(/^(\w+)\.to(Upper|Lower)Case\(\)$/);
    if (m) {
      const recv = decls[m[1]];
      if (!recv) return { ok: false };
      return { ok: true, value: m[2] === "Upper" ? String(recv.value).toUpperCase() : String(recv.value).toLowerCase(), type: "string", caseTransformOf: String(recv.value) };
    }
    if (/^[A-Za-z_]\w*$/.test(t)) {
      if (t === this.currentListName) return { ok: true, value: this._listToString(), type: "list" };
      const d = decls[t];
      if (d) return { ok: true, value: d.value, type: d.type };
      return { ok: false };
    }
    return { ok: false };
  }

  evalCond(cond, vars) {
    const m = cond.trim().match(/^(\w+)\s*(<=|<)\s*(\w+)(\s*-\s*1)?$/);
    if (!m) return false;
    const lhs = vars[m[1]] !== undefined ? vars[m[1]] : NaN;
    let rhs = vars[m[3]] !== undefined ? vars[m[3]] : parseInt(m[3], 10);
    if (m[4]) rhs -= 1;
    return m[2] === "<" ? lhs < rhs : lhs <= rhs;
  }

  async execAddStatement(line, decls) {
    const m = line.match(/^(\w+)\.add\((.*)\);$/);
    if (!m) return { ok: true };
    const args = this._splitTopArgs(m[2]);

    if (args.length === 2) {
      const idxEval = this.evalExpr(args[0], decls);
      const elemEval = this.evalExpr(args[1], decls);
      if (!idxEval.ok || !elemEval.ok) return { ok: false, crash: "eval" };
      if (elemEval.caseTransformOf !== undefined) await this.miniPressStamp(elemEval.caseTransformOf, elemEval.value);
      if (elemEval.type !== "string" && this.currentListType === "String") return await this.rejectWrongType(String(elemEval.value));
      const idx = idxEval.value;
      if (idx < 0 || idx > this.currentList.length) return await this.rejectInvalidIndex(elemEval.value, idx);
      return await this.insertBookAtIndex(elemEval.value, idx);
    }
    const e = this.evalExpr(args[0], decls);
    if (!e.ok) return { ok: false, crash: "eval" };
    if (e.caseTransformOf !== undefined) await this.miniPressStamp(e.caseTransformOf, e.value);
    if (e.type !== "string" && this.currentListType === "String") return await this.rejectWrongType(String(e.value));
    return await this.addBookToShelf(e.value);
  }

  async execStatement(line, decls, lineIdx) {
    const t = line.trim();
    if (!t || t.startsWith("//") || t.startsWith("import") || /^Scanner sc/.test(t) || t === "}") return { ok: true };
    if (lineIdx !== undefined) this.highlightCodeLine(lineIdx);

    const declList = t.match(/^ArrayList<(\w+)>\s+(\w+)\s*=/);
    if (declList) {
      this.setShelfType(declList[1]);
      this.currentListName = declList[2];
      this.updateManifestStrip(`ArrayList<${declList[1]}> ${declList[2]} — empty shelf ready`);
      await this.delay(120);
      return { ok: true };
    }
    const declInt = t.match(/^int\s+(\w+)\s*=\s*(-?\d+);$/);
    if (declInt) {
      decls[declInt[1]] = { value: parseInt(declInt[2], 10), type: "int" };
      this.updateManifestStrip(`int ${declInt[1]} = ${declInt[2]}`);
      await this.delay(120);
      return { ok: true };
    }
    const declRead = t.match(/^String\s+(\w+)\s*=\s*sc\.nextLine\(\);$/);
    if (declRead) {
      this.updateManifestStrip(`String ${declRead[1]} = sc.nextLine()`);
      const read = this.evaluateNextLine(this.tapeState);
      await this.tapeConsumeVisual(read.consumedCount);
      decls[declRead[1]] = { value: read.rawValue, type: "string" };
      this.miniDispenseTo(declRead[1], read.rawValue);
      await this.delay(120);
      return { ok: true };
    }
    if (/^\w+\.add\(/.test(t)) {
      this.updateManifestStrip(t.length > 52 ? t.slice(0, 52) + "…" : t);
      return await this.execAddStatement(t, decls);
    }
    const printMatch = t.match(/^System\.out\.println\((.*)\);$/);
    if (printMatch) {
      this.updateManifestStrip("System.out.println(…)");
      const e = this.evalExpr(printMatch[1], decls);
      if (!e.ok) return { ok: false, crash: "eval" };
      await this.pushTicker(String(e.value));
      return { ok: true };
    }
    return { ok: true };
  }

  async execProgram(items, decls) {
    for (let i = 0; i < items.length; i++) {
      if (!this._alive) return { ok: true };
      const t = items[i].text.trim();

      const forMatch = t.match(/^for \(int i = 0; (.*); i\+\+\) \{$/);
      if (forMatch) {
        this.highlightCodeLine(i);
        const cond = forMatch[1].trim();
        const bodyItems = [];
        let j = i + 1;
        while (j < items.length && items[j].text.trim() !== "}") { bodyItems.push({ item: items[j], idx: j }); j++; }
        let iterations = 0;
        let iv = 0;
        while (iterations < 15) {
          const vars = {};
          for (const k in decls) vars[k] = decls[k].value;
          vars.i = iv;
          if (!this.evalCond(cond, vars)) {
            if (iterations === 0) { this.loopIterationBeat("i = 0 → condition false → loop skipped"); await this.delay(500); }
            break;
          }
          this.loopIterationBeat(`i = ${iv}`);
          await this.delay(180);
          decls.i = { value: iv, type: "int" };
          for (const b of bodyItems) {
            if (!this._alive) return { ok: true };
            const r = await this.execStatement(b.item.text, decls, b.idx);
            if (!r.ok) { delete decls.i; return r; }
          }
          iv++;
          iterations++;
        }
        delete decls.i;
        i = j; // skip past the closing brace
        continue;
      }

      const r = await this.execStatement(items[i].text, decls, i);
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

  _recordFirstRunMetrics(mission, passed) {
    if (this._firstRunMetricsRecorded[mission.mission]) return;
    this._firstRunMetricsRecorded[mission.mission] = true;
    if (mission.insertionSlot) {
      const placed = this.slotContents[mission.insertionSlot] && this.slotContents[mission.insertionSlot][0];
      const code = placed ? placed.container.getData("code") : "";
      this.insertionProactive[`mission${mission.mission}`] = code === mission.insertionForm;
    }
    if (mission.loopCondSlot) {
      const placed = this.slotContents[mission.loopCondSlot] && this.slotContents[mission.loopCondSlot][0];
      const code = placed ? placed.container.getData("code") : "";
      this.loopBoundFirstRun[`mission${mission.mission}`] = code === mission.loopCondCorrect;
    }
    if (mission.crossWing) {
      this.crossWingCleanFirstRun[`mission${mission.mission}`] = passed;
    }
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
    this.flipQuietSign("session");

    // compile check — the run never starts on a compile error
    const compileItems = this.buildProgramItems(mission, assembled, mission.tests[0]);
    const compileResult = this.compileCheckProgram(compileItems, assembled, mission);
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
      const outcome = await this.runTestCase(mission, test, i, assembled);
      if (!outcome.match) { anyMismatch = true; failedTests.push(this._compactTestLabel(test)); }
      if (outcome.crashed) anyCrash = true;
    }

    if (isFirstRun) this._recordFirstRunMetrics(mission, !anyMismatch);
    const resultKind = anyMismatch ? (anyCrash ? "runtime_crash" : "logic_fail") : "pass";
    this._resolveRunOutcome(mission, resultKind, wrongBlocksUsed, failedTests, null);
  }

  async runTestCase(mission, test, index, assembled) {
    this.clearMiniShelf();
    this.parkCameos();
    this.setShelfType(this.currentListType || "String");
    this.loadMiniTape(test.input);
    const decls = this._substitute(mission, test);
    const items = this.buildProgramItems(mission, assembled, test);

    const runResult = await this.execProgram(items, decls);
    if (!this._alive) return { match: false, crashed: false };
    this.highlightCodeLine(null);

    const actualList = this.currentList.map((e) => String(e.value));
    const expected = (test.expectedList || []).map(String);
    const listMatch = actualList.length === expected.length && actualList.every((v, i) => v === expected[i]);
    const outMatch = test.expectedOutput === undefined || this.tickerContent === test.expectedOutput;
    const match = runResult.ok && listMatch && outMatch;

    const actualDisplay = runResult.ok
      ? (test.expectedOutput !== undefined && listMatch && !outMatch ? this.tickerContent || "(no output)" : this._listToString())
      : (runResult.crash === "ioobe" ? "IOOBE!" : "CRASH");
    this.verdictLamp.setFillStyle(match ? C_GREEN_BRIGHT : C_RED);
    this.updateReportRow(index, match, actualDisplay);
    await this.delay(200);
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
      console.warn("Level48Scene: /api/wellbeing/predict-struggle unreachable, skipping behavioral signal for this level:", e);
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
    this.flipQuietSign("quiet");

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
    this.flipQuietSign("gold");
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
    // legal-but-unidiomatic build (M4's add(i, "Ledger")) gets its note
    const usedAlsoCorrectInsertion = Object.values(this.getAssembledCode()).flat().some((b) => b.tag === "unnecessary_insertion");
    if (usedAlsoCorrectInsertion) {
      await this.bitSay(MISCONCEPTION_FEEDBACK.unnecessary_insertion);
      await Promise.race([this.waitForClick(), this.delay(2500)]);
      this.hideBubble();
    }
    await this.bitSay(mission.postMissionNote || "Clean build — the rig confirms it.");
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

    // the room closes: sign fades, windows darken, lamp dies, globe stops
    this.tweens.killTweensOf(this.quietSignText);
    this.tweens.add({ targets: this.quietSignText, alpha: 0.08, duration: 700 });
    this._windowCones.forEach((c) => this.tweens.add({ targets: c, alpha: 0, duration: 800 }));
    this.tweens.add({ targets: this.lampGlow, alpha: 0, duration: 800 });
    this._globeSpeed = 0;
    const motes = this.ambient;
    this.ambient = null;
    (motes || []).forEach((m) => this.tweens.add({ targets: m, y: 632, alpha: 0, duration: 1500, ease: "Sine.easeIn" }));

    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
    this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });

    const title = this.add.text(640, 240, "READING ROOM CLOSED", { font: "bold 34px Georgia", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
    this.tweens.add({ targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut", onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }) });
    this.add.text(640, 310, `Score: ${this.score}`, { font: "21px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
    this.add.text(640, 350, `Missions Completed: ${this.currentMission} / ${MISSIONS.length}`, { font: "18px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);

    this._makeButton(525, 420, "REOPEN THE ROOM", 200, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
      this._makeButton(755, 420, "RETURN TO MENU", 200, 50, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.start("MenuScene"));
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearMission();
    this.hideBubble();

    try { GameManager.completeLevel(48, Math.round((this.flawlessCount / MISSIONS.length) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("arraylist_add_mastery"); } catch (_) {}
    try {
      localStorage.setItem("level48_results", JSON.stringify({
        level: 48, concept: "arraylist_add", phase: "restructuring",
        score: this.score, missionsCompleted: 6, flawlessMissions: this.flawlessCount,
        totalRuns: this.runCount, failedRuns: this.failedRunCount, hintsUsed: this.hintCount,
        selfCorrections: this.selfCorrectionCount, insertionAppliedProactively: this.insertionProactive,
        loopBoundCorrectFirstRun: this.loopBoundFirstRun, crossWingCleanFirstRun: this.crossWingCleanFirstRun,
        livesRemaining: this.lives, attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.readingRoomFinale().then(() => { if (this._alive) this.showScoreTally(); });
  }

  async readingRoomFinale() {
    this.flipQuietSign("complete");
    // dawn light through the arched windows
    this._windowCones.forEach((cone, i) => {
      cone.clear();
      cone.fillStyle(0xffd740, 0.06);
      const x = i === 0 ? 300 : 640;
      cone.fillTriangle(x + 50, 140, x - 20, 300, x + 120, 300);
    });
    // ladder slides along the bookcase
    const slide = { x: this._ladderX };
    this.tweens.add({ targets: slide, x: this._ladderX - 200, duration: 2200, ease: "Sine.easeInOut", onUpdate: () => { this._ladderX = slide.x; this._drawLadder(); } });
    // shimmer wave across the spines
    const band = this.add.rectangle(-60, 108, 90, 216, 0xffffff, 0.04).setDepth(2);
    this.tweens.add({ targets: band, x: W + 60, duration: 1800, ease: "Sine.easeInOut", onComplete: () => band.destroy() });
    // globe spins faster briefly
    this._globeSpeed = 6;
    this.time.delayedCall(2600, () => { this._globeSpeed = 1; });

    // ceremonial run of books
    this.clearMiniShelf();
    this.parkCameos();
    this.setShelfType("String");
    for (const letter of "CURATED".split("")) {
      if (!this._alive) return;
      await this.addBookToShelf(letter);
    }
    this.createGoldConfetti(OX + OW / 2, OY + OH / 2, 40);
    await this.delay(700);
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

    const title = this.add.text(640, 138, "READING ROOM CURATOR", { font: "bold 30px Georgia", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(91).setScale(0);
    this.tweens.add({ targets: title, scale: 1, duration: 350, ease: "Back.easeOut" });

    const insertionCount = Object.values(this.insertionProactive).filter(Boolean).length;
    const crossWingCount = Object.values(this.crossWingCleanFirstRun).filter(Boolean).length;
    const lines = [
      "MISSIONS: 6/6", `FLAWLESS: ${this.flawlessCount}`, `SELF-CORRECTIONS: ${this.selfCorrectionCount}`,
      `INSERTION-PROACTIVE: ${insertionCount}/2`, `CROSS-WING CLEAN: ${crossWingCount}/2`, `HINTS: ${this.hintCount}`,
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

    // TRILOGY BADGE — bookshelf (L46), candle (L47), master key (L48)
    const badge = this.add.container(640, 432).setDepth(91).setAlpha(0);
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillCircle(0, 0, 34);
    bg.lineStyle(3, C_GOLD, 1);
    bg.strokeCircle(0, 0, 34);
    // bookshelf
    bg.fillStyle(C_CYAN, 0.9);
    for (let i = 0; i < 3; i++) bg.fillRect(-24 + i * 6, -8, 4, 16);
    // candle
    bg.fillStyle(0xe0d6b8, 1);
    bg.fillRect(-3, -6, 6, 14);
    bg.fillStyle(0xffa726, 0.9);
    bg.fillEllipse(0, -10, 5, 7);
    // master key
    bg.lineStyle(2, C_BRASS, 1);
    bg.strokeCircle(14, -4, 4);
    bg.lineBetween(14, 0, 14, 10);
    bg.lineBetween(14, 7, 18, 7);
    bg.lineBetween(14, 10, 19, 10);
    badge.add(bg);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 2000 });
    const badgeLbl = this.add.text(640, 478, "add() MASTERY", { font: "bold 15px Georgia", color: HEX_GOLD }).setOrigin(0.5).setDepth(91).setAlpha(0);
    const badgeSub = this.add.text(640, 494, "Accretion ✓  Tuning ✓  Restructuring ✓", { font: "12px Arial", color: "#78909c" }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: [badgeLbl, badgeSub], alpha: 1, duration: 300, delay: 2150 });

    // ArrayList Wing progress
    const wingLbl = this.add.text(640, 512, "ARRAYLIST WING — 1 of 3 trilogies complete", { font: "bold 13px Georgia", color: "#8c7ae6" }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: wingLbl, alpha: 1, duration: 300, delay: 2300 });
    const bar = this.add.graphics().setDepth(91).setAlpha(0);
    bar.lineStyle(1, C_GRAY, 1);
    bar.strokeRoundedRect(450, 522, 380, 14, 7);
    bar.fillStyle(0x8c7ae6, 0.9);
    bar.fillRoundedRect(452, 524, 376 * 0.33, 10, 5);
    this.tweens.add({ targets: bar, alpha: 1, duration: 300, delay: 2400 });
    ["add ✓", "get", "remove"].forEach((s, i) => {
      const t = this.add.text(513 + i * 127, 545, s, { font: `bold 9px Arial`, color: i === 0 ? "#8c7ae6" : "#546e7a" }).setOrigin(0.5).setDepth(91).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 300, delay: 2450 + i * 100 });
    });

    this._makeButton(500, 585, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(770, 585, "NEXT: get() awaits →", 250, 44, { fill: 0x00733a, stroke: C_GREEN_BRIGHT, textColor: "#ffffff" }, () => {
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
