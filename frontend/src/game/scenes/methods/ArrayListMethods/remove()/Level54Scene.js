/**
 * Level 54 — "The Grand Reshelving" (ArrayList Methods: Restructuring
 * Phase — remove() trilogy finale; the ARRAYLIST WING SEAL)
 * ===========================================================================
 * The learner CONSTRUCTS complete list-curation programs — no multiple
 * choice. Reuses the L27→L51 code-canvas/parts-bin/RUN architecture. The
 * rig hosts the wing's COMPLETE apparatus: the L46 bookshelf (add), the
 * L49 ghost retrieval (get, for distractor reveals), the L52 withdrawal
 * + gap-close (remove by index), the L53 search-sweep + overload flags
 * (remove by value, the Integer.valueOf discrimination), and the L50/L53
 * Mutation Tracker with its size column and skip ghost-flags.
 *
 * A genuine unified mini-interpreter (never scripted) executes the
 * assembled program: add() files honestly, get() reads via ghost (never
 * mutating), remove() resolves its overload from the argument's syntactic
 * form (bare int → index; Integer.valueOf(n) or a String/variable → by-
 * value) exactly as L53 taught, for-loops re-evaluate size() live every
 * iteration with an honest emergent remove-in-loop skip (Mission 4's
 * flagship trap — backward loops, or i-- compensation, or by-value sweeps
 * all genuinely survive it), Scanner feeds dynamic values, and println
 * concatenates Java's real quote-less list toString().
 *
 * Mission 6 is the wing's grand capstone — add + get-era guarding +
 * remove + Scanner + String + println, all on one rig — and its success
 * triggers the ArrayList Wing Seal: the curriculum's fourth wing-finale
 * ceremony (after String L33, Intake L36, Output L45), following the
 * L45 five-phase pattern with add()/get()/remove() checkmarks.
 */

import Phaser from "phaser";
import { GameManager } from "../../../../GameManager.js";
import { WellbeingAPI } from "../../../../../api/api.js";
import { BadgeSystem } from "../../../../BadgeSystem.js";

const W = 1280, H = 720;

const C_CYAN = 0x4fc3f7, C_GOLD = 0xffd740, C_ORANGE = 0xff9800, C_VIOLET = 0xb39ddb;
const C_GREEN_BRIGHT = 0x00e676, C_RED = 0xf44336, C_GRAY = 0x78909c, C_BRASS = 0xc8a05a;
const C_STAMP_RED = 0xc62828;
const HEX_CYAN = "#4fc3f7", HEX_GOLD = "#ffd740", HEX_ORANGE = "#ff9800", HEX_VIOLET = "#b39ddb";
const HEX_GREEN_BRIGHT = "#00e676", HEX_RED = "#f44336", HEX_GRAY = "#78909c", HEX_BRASS = "#c8a05a";
const HEX_STAMP_RED = "#c62828";

const CX = 40, CY = 90, CW = 680, CH = 380;
const TAB_H = 34, GUTTER_W = 34, CODE_PAD = 10;
const CODE_X = CX + GUTTER_W + CODE_PAD;
const CODE_Y0 = CY + TAB_H + 14;
const LINE_H = 21;
const PX = 40, PY = 490, PW = 680, PH = 130;
const OX = 760, OY = 80, OW = 460, OH = 250;
const TAPE_Y = OY + 28;
const MS_X0 = OX + 12, MS_X1 = OX + 122, MS_CX = OX + 67;
const MS_TOP = OY + 56, MS_BASE_Y = OY + 168, MS_STEP = 17;
const CRATE_Y0 = OY + 182, CRATE_Y1 = OY + 214;
const LP_X = OX + 136, LP_CX = OX + 200;
const TRK_X = OX + 280, TRK_W = 168;
const TICKER_Y = OY + 236;
const STRIP_Y = OY + OH + 15;
const RX = 760, RY = 345, RW = 460, RH = 125;
const BX = 760, BY = 490, BW = 460, BH = 130;
const TUTORIAL_KEY = "level54_tutorial_done";

// ══════════════════════════════════════════════════════════════
// MISSION CONFIGURATION
// ══════════════════════════════════════════════════════════════
const MISSIONS = [
  { mission: 1, title: "The Withdrawal Notice",
    brief: "The notice board announces each withdrawal. Withdraw the title at index 1 and announce it. For [Dune, Emma, Ivanhoe]: Withdrawn: Emma",
    skeleton: ["import java.util.ArrayList;", "ArrayList<String> titles = /* populated by test */;", "", "String gone = <slot:take>;", 'System.out.println("Withdrawn: " + gone);'],
    slots: [{ id: "take", hint: "the withdrawal", capacity: 1 }],
    palette: [
      { code: "titles.remove(1)", correct: true },
      { code: "titles.get(1)", tag: "get_removes_element_belief" },
      { code: "titles.remove(0)", tag: "index_starts_at_one_belief_inverse" },
      { code: 'titles.remove("1")', tag: "index_as_string_belief" },
    ],
    tests: [
      { initialList: ["Dune", "Emma", "Ivanhoe"], expectedOutput: "Withdrawn: Emma", expectedList: ["Dune", "Ivanhoe"] },
      { initialList: ["Iliad", "Odyssey"], expectedOutput: "Withdrawn: Odyssey", expectedList: ["Iliad"] },
    ],
    listName: "titles", listJavaType: "String",
    postMissionNote: "remove BY INDEX hands you the element — perfect for announcing. (By value hands you true or false — a different tool for a different question.) And the get() build's report tells its own story: right words on the console, wrong truth on the shelf.",
    concept: "remove_returns_into_println" },

  { mission: 2, title: "The Trim",
    brief: "Every shipment arrives one volume too long — trim the LAST entry. The length VARIES. Final list: all but the last.",
    skeleton: ["import java.util.ArrayList;", "ArrayList<String> stock = /* populated by test */;", "", "<slot:trim>"],
    slots: [{ id: "trim", hint: "trim the last (size-proof)", capacity: 1 }],
    boundSlot: "trim", boundForm: "stock.remove(stock.size() - 1);",
    palette: [
      { code: "stock.remove(stock.size() - 1);", correct: true },
      { code: "stock.remove(2);", tag: "hardcoded_last_index" },
      { code: "stock.remove(stock.size());", tag: "remove_at_size_valid_belief" },
      { code: "stock.remove(stock.size() - 1)", tag: "missing_semicolon" },
      { code: "stock.get(stock.size() - 1);", tag: "get_removes_element_belief" },
    ],
    tests: [
      { initialList: ["A", "B", "C"], expectedList: ["A", "B"] },
      { initialList: ["V", "W", "X", "Y", "Z"], expectedList: ["V", "W", "X", "Y"] },
    ],
    listName: "stock", listJavaType: "String",
    postMissionNote: "The size-proof reflex, third method running — get taught it, remove inherits it. One green, one red for the hardcoded build: the passing test is the sweetest trap in software.",
    concept: "sizeproof_trim" },

  { mission: 3, title: "The Boxed Order",
    brief: "The ledger of catalogue numbers must lose the VALUE 7 — wherever it sits. For [3, 7, 11]: final list [3, 11]. For [7, 5]: final list [5].",
    skeleton: ["import java.util.ArrayList;", "ArrayList<Integer> ledger = /* populated by test */;", "", "<slot:order>"],
    slots: [{ id: "order", hint: "remove the VALUE 7", capacity: 1 }],
    boxedSlot: "order", boxedForm: "ledger.remove(Integer.valueOf(7));",
    palette: [
      { code: "ledger.remove(Integer.valueOf(7));", correct: true },
      { code: "ledger.remove(7);", tag: "integer_remove_by_value_belief" },
      { code: 'ledger.remove("7");', tag: "wrong_type_for_generic" },
      { code: "ledger.remove(Integer.valueOf(1));", tag: "wrong_target_value" },
    ],
    tests: [
      { initialList: [3, 7, 11], expectedList: [3, 11] },
      { initialList: [7, 5], expectedList: [5] },
    ],
    listName: "ledger", listJavaType: "Integer",
    postMissionNote: "The Clearing Sale's lesson, in production ink — box the number to hunt the VALUE. The bare 7 didn't even take a wrong lot today; it fell off the shelf entirely. Integer.valueOf: one wrapper, zero ambiguity.",
    concept: "boxed_removal_production" },

  { mission: 4, title: "The Purge",
    brief: 'Every "damaged" entry must go — ALL of them, however many, wherever they sit. For [ok, damaged, damaged, ok]: final list [ok, ok].',
    skeleton: ["import java.util.ArrayList;", "ArrayList<String> stock = /* populated by test */;", "", "for (<slot:header>) {", '    if (stock.get(i).equals("damaged")) {', "        <slot:body>", "    }", "}"],
    slots: [
      { id: "header", hint: "the loop header (direction matters!)", capacity: 1 },
      { id: "body", hint: "the removal", capacity: 1 },
    ],
    flagshipSlot: true,
    palette: [
      { code: "int i = stock.size() - 1; i >= 0; i--", correct: true, slotId: "header" },
      { code: "int i = 0; i < stock.size(); i++", tag: "forward_purge_chosen", slotId: "header" },
      { code: "int i = 0; i <= stock.size(); i++", tag: "loop_bound_inclusive_size", slotId: "header" },
      { code: "stock.remove(i);", correct: true, slotId: "body" },
      { code: "stock.remove(i);\n        i--;", correct: true, slotId: "body" },
      { code: 'stock.remove("damaged");', tag: "redundant_by_value_in_loop", slotId: "body" },
    ],
    tests: [
      { initialList: ["ok", "damaged", "damaged", "ok"], expectedList: ["ok", "ok"] },
      { initialList: ["damaged", "damaged", "damaged"], expectedList: [] },
      { initialList: ["ok", "ok"], expectedList: ["ok", "ok"] },
    ],
    listName: "stock", listJavaType: "String",
    postMissionNote: "Purge BACKWARD — removals behind you can't move shelves you haven't reached. The forward walker needs the step-back compensation; the backward walker needs nothing. The adjacent pair was the trap: two damaged, side by side, and the naive loop saved one. Not on your shift.",
    concept: "safe_purge_flagship" },

  { mission: 5, title: "The Return Window",
    brief: "A reader returns a borrowed title BY NAME. Read the title, withdraw it from the loans list, and confirm. For loans [Dune, Emma] and input 'Emma': Returned: Emma",
    skeleton: ["import java.util.ArrayList;", "Scanner sc = new Scanner(System.in);", "ArrayList<String> loans = /* populated by test */;", "", "String title = <slot:read>;", "<slot:withdraw>", 'System.out.println("Returned: " + title);'],
    slots: [
      { id: "read", hint: "read the title", capacity: 1 },
      { id: "withdraw", hint: "withdraw it", capacity: 1 },
    ],
    crossWing: true,
    palette: [
      { code: "sc.nextLine()", correct: true, slotId: "read" },
      { code: "sc.nextInt()", tag: "wrong_scanner_method", slotId: "read" },
      { code: "loans.remove(title);", correct: true, slotId: "withdraw" },
      { code: 'loans.remove("title");', tag: "variable_as_literal_belief", slotId: "withdraw" },
      { code: "loans.remove(0);", tag: "hardcoded_first_index", slotId: "withdraw" },
      { code: "loans.get(title);", tag: "get_by_value_belief", slotId: "withdraw" },
    ],
    tests: [
      { initialList: ["Dune", "Emma"], input: ["Emma"], expectedOutput: "Returned: Emma", expectedList: ["Dune"] },
      { initialList: ["Dune", "Emma"], input: ["Dune"], expectedOutput: "Returned: Dune", expectedList: ["Emma"] },
      { initialList: ["Iliad", "Odyssey", "Aeneid"], input: ["Odyssey"], expectedOutput: "Returned: Odyssey", expectedList: ["Iliad", "Aeneid"] },
    ],
    listName: "loans", listJavaType: "String",
    postMissionNote: "Last trilogy it was the reader's shelf NUMBER; today it's the reader's TITLE — dynamic index, dynamic value, the pair complete. The sweep does the finding; your code just hands it the name.",
    concept: "dynamic_value_removal" },

  { mission: 6, title: "The Final Inventory",
    brief: "The year's closing ritual: register a NEW acquisition (read its name, file it LOUD), retire the OLDEST volume (the first), and announce the collection. For list [alpha, beta] and input 'gamma': Retired: alpha / Collection: [beta, GAMMA]",
    skeleton: ["import java.util.ArrayList;", "Scanner sc = new Scanner(System.in);", "ArrayList<String> shelf = /* populated by test */;", "", "String neu = sc.nextLine();", "shelf.add(<slot:file>);", "", "String old = <slot:retire>;", "", 'System.out.println("Retired: " + old);', 'System.out.println("Collection: " + shelf);'],
    slots: [
      { id: "file", hint: "file it (LOUD)", capacity: 1 },
      { id: "retire", hint: "retire the oldest", capacity: 1 },
    ],
    crossWing: true,
    palette: [
      { code: "neu.toUpperCase()", correct: true, slotId: "file" },
      { code: "neu", tag: "no_normalization", slotId: "file" },
      { code: "neu.toUpperCase", tag: "property_vs_method_syntax", slotId: "file" },
      { code: '"neu".toUpperCase()', tag: "literal_as_variable_belief", slotId: "file" },
      { code: "shelf.remove(0)", correct: true, slotId: "retire" },
      { code: "shelf.get(0)", tag: "get_removes_element_belief", slotId: "retire" },
      { code: "shelf.remove(shelf.size() - 1)", tag: "wrong_end_removed", slotId: "retire" },
    ],
    tests: [
      { initialList: ["alpha", "beta"], input: ["gamma"], expectedOutput: "Retired: alpha⏎Collection: [beta, GAMMA]", expectedList: ["beta", "GAMMA"] },
      { initialList: ["solo"], input: ["duo"], expectedOutput: "Retired: solo⏎Collection: [DUO]", expectedList: ["DUO"] },
      { initialList: ["a", "b", "c"], input: ["OK"], expectedOutput: "Retired: a⏎Collection: [b, c, OK]", expectedList: ["b", "c", "OK"] },
    ],
    listName: "shelf", listJavaType: "String",
    postMissionNote: "Filed with add. Guarded by everything get taught you. Retired with remove. The reader spoke, the press made it loud, the console told the year's story. Nine levels, Reshelver — the wing is yours. Ring the bell.",
    concept: "wing_capstone_all_methods" },
];

const MISCONCEPTION_FEEDBACK = {
  forward_purge_chosen: "The report shows the survivor — two damaged side by side, and your loop saved the second. Removal at i slides the next entry INTO i; i++ walks past it. Purge backward, or step back after each taking.",
  loop_bound_inclusive_size: "The tracker's last row is red — i reached size on a shelf that ends at size − 1. Strictly less-than (or start from the top and count down).",
  redundant_by_value_in_loop: 'It passed — remove("damaged") hunts by value and can\'t skip. But each call re-sweeps from shelf 0; remove(i) takes what you already found. Both correct; one walks twice.',
  integer_remove_by_value_belief: "The gold 'index' flag told the story — the bare 7 aimed at SHELF 7 and fell off a three-shelf list. IndexOutOfBoundsException, both tests. Box it: Integer.valueOf(7).",
  wrong_type_for_generic: "The compile stamp — a String argument on an Integer list matches the shelf's contract nowhere; the compiler refused it.",
  get_removes_element_belief: "The console said the right words; the shelf kept the book. get LOOKS, remove TAKES — the report's list-check is where the difference lives. The wing's first lesson, and its last.",
  hardcoded_last_index: "One green, one red — the passing test is the sweetest trap. size() − 1 survives every shipment.",
  remove_at_size_valid_belief: "remove(size) reaches past the top on every list — the last shelf is size − 1, in all three methods, forever.",
  missing_semicolon: "A statement needs its semicolon — the compiler stopped at the line's end, still waiting.",
  index_as_string_belief: 'The compile stamp — remove("1") is the by-VALUE overload, and by-value returns a BOOLEAN. You can\'t pour true into a String. By-index returns the element; by-value returns whether it found one. Different tools, different answers.',
  index_starts_at_one_belief_inverse: "remove(0) took the FIRST title — the notice named index 1, the second shelf. Read the index, then count from zero.",
  wrong_scanner_method: "The compile stamp — one of the Scanner methods returns the wrong type for where you put it. A title needs nextLine(); a number needs nextInt().",
  variable_as_literal_belief: "The sweep hunted the WORD 'title' — quotes freeze a name into text. Drop them to hunt the reader's actual value.",
  hardcoded_first_index: "Dune left no matter what the reader said — the report shows input 'Emma', withdrawal 'Dune'. The reader names the target; pass their word to the sweep.",
  get_by_value_belief: "get() takes an INDEX — the compile stamp says so. To act on a VALUE, remove(value) is the tool with the sweep built in.",
  no_normalization: "The collection shows lowercase — the ritual files LOUD. Uppercase before you add.",
  property_vs_method_syntax: "At the wing's last gate, the oldest trap of all — parentheses on String methods! toUpperCase(). From the Scan Chamber to the Grand Reshelving: some laws never age.",
  literal_as_variable_belief: "'\"neu\".toUpperCase()' files the WORD 'NEU' — the report shows it sitting where the reader's title belonged. Drop the quotes.",
  wrong_end_removed: "The report shows the NEW acquisition in the crate — remove(size − 1) took the freshest book, filed seconds ago. The OLDEST lives at index 0; retire from the front.",
  remove_by_value_removes_all_belief: "One sweep, one taking — the first match only. The loop (or a second order) handles the rest.",
  wrong_target_value: "You withdrew the wrong lot — read the order twice before you stamp.",
};

const HINTS = {
  1: "String gone = titles.remove(1); — by-INDEX removal hands you the element it took, ready to announce.",
  2: "stock.remove(stock.size() - 1); — the size-proof form. A hardcoded number only survives one shipment.",
  3: "ledger.remove(Integer.valueOf(7)); — box the number to hunt the VALUE, not shelf 7.",
  4: "Walk backward: for (int i = stock.size() - 1; i >= 0; i--) — removals behind the cursor never move shelves ahead of it.",
  5: "String title = sc.nextLine(); then loans.remove(title); — the sweep hunts whatever the reader typed.",
  6: "shelf.add(neu.toUpperCase()); files it loud. String old = shelf.remove(0); retires the OLDEST (index 0), not the newest.",
};

export class Level54Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level54Scene" });
  }

  init() {
    this.currentMission = 0;
    this.score = 0;
    this.displayScore = 0;
    this.lives = 3;
    this.flawlessCount = 0;
    this.runCount = 0;
    this.failedRunCount = 0;
    this.hintCount = 0;
    this.selfCorrectionCount = 0;
    this.safeLoopProactive = {};
    this.safeLoopFormChoice = {};
    this.boxedRemoveProactive = {};
    this.crossWingCleanFirstRun = {};
    this.attemptLog = [];
    this.missionElements = [];
    this.slotContents = {};
    this.slotDefs = {};
    this.wrongBlockHistory = {};
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
    this.currentListName = "list";
    this.shelfBookSprites = [];
    this.crateContents = [];
    this._tickerLines = [];
    this._trackerRows = [];
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

    try { GameManager.incrementAttempt(53); } catch (_) {}

    this.createParticleTexture();
    this.createBackground();
    this.createGrandHallInterior();
    this.createHallFloor();
    this.createArchivistsBell();
    this.createWingCrest();
    this.createAmbientParticles();
    this.createCodeCanvas();
    this.createBlockPalette();
    this.createRunButton();
    this.createRigWindow();
    this.createMiniBookshelf();
    this.createMiniCrate();
    this.createMiniListStatePanel();
    this.createMiniMutationTracker();
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
    this.updateAmbient(time, delta);
    this.updateCrestPulse(time);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // BACKGROUND — the grand hall
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l54_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l54_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x0a0704).setDepth(0);
  }

  createGrandHallInterior() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x0d0906, 1);
    g.fillRect(0, 0, W, 216);

    // floor-to-ceiling bookcase with scattered reshelving gaps
    const spineColors = [0x8a6435, 0x3a2618, 0xc8a05a, 0x6d4c41];
    const gapCells = new Set();
    while (gapCells.size < 7) gapCells.add(Phaser.Math.Between(0, 29));
    let cellIdx = 0;
    this._gapCells = [];
    for (let row = 0; row < 3; row++) {
      const rowAlpha = 0.25 - row * 0.07;
      for (let col = 0; col < 10; col++) {
        const cx = col * 128, cy = 8 + (2 - row) * 68;
        g.lineStyle(1, 0x241a0e, 0.3);
        g.strokeRect(cx + 4, cy, 120, 64);
        const isGap = gapCells.has(cellIdx);
        cellIdx++;
        if (isGap) {
          this._gapCells.push({ cx, cy });
          g.lineStyle(1, C_BRASS, 0.15);
          g.strokeRect(cx + 14, cy + 10, 40, 44);
        } else {
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
    }
    this._gapFillGfx = this.add.graphics().setDepth(1);

    // two rolling ladders
    this._ladders = [];
    [350, 1000].forEach((x) => {
      const lg = this.add.graphics().setDepth(2);
      lg.lineStyle(2, 0x8a6435, 0.4);
      lg.lineBetween(x, 200, x + 24, 20);
      lg.lineBetween(x + 26, 200, x + 50, 20);
      for (let i = 0; i < 5; i++) {
        const t = i / 4;
        lg.lineBetween(x + t * 24, 200 - t * 180, x + 26 + t * 24, 200 - t * 180);
      }
      lg.fillStyle(C_BRASS, 0.5);
      lg.fillCircle(x, 204, 4);
      lg.fillCircle(x + 26, 204, 4);
      this._ladders.push(lg);
    });

    // trolleys
    this._trolleyBooks = [];
    [60, 1180].forEach((x) => {
      const tg = this.add.container(x, 585).setDepth(3);
      const frame = this.add.graphics();
      frame.lineStyle(1.5, 0x8a6435, 0.5);
      frame.strokeRect(-30, -14, 60, 30);
      frame.lineBetween(-30, 2, 30, 2);
      frame.lineStyle(1.5, C_BRASS, 0.5);
      frame.strokeCircle(-20, 20, 5);
      frame.strokeCircle(20, 20, 5);
      tg.add(frame);
      const colors = [0x8a6435, 0x3a2618, 0x6d4c41, 0xc8a05a];
      for (let i = 0; i < 4; i++) {
        const b = this.add.rectangle(-24 + i * 15, -6, 12, 5, colors[i], 0.3);
        tg.add(b);
        this._trolleyBooks.push(b);
      }
    });

    const banner = this.add.graphics().setDepth(2);
    banner.fillStyle(0x0a0704, 1);
    banner.lineStyle(1, C_GOLD, 0.5);
    banner.fillRoundedRect(210, 12, 380, 28, 5);
    banner.strokeRoundedRect(210, 12, 380, 28, 5);
    this.add.text(400, 26, "THE GRAND RESHELVING", { font: "bold 15px Georgia", color: HEX_GOLD }).setOrigin(0.5).setAlpha(0.8).setDepth(3);
  }

  createHallFloor() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x1a0e05, 1);
    g.fillRect(0, 635, W, 85);
    g.lineStyle(2, 0x3a2618, 1);
    g.lineBetween(0, 637, W, 637);
    g.lineStyle(1, 0x241a0e, 0.3);
    for (let x = 0; x < W; x += 24) {
      g.lineBetween(x, 650, x + 12, 662);
      g.lineBetween(x + 12, 674, x + 24, 662);
    }
    g.lineStyle(1, 0x8a6435, 0.08);
    for (let i = 1; i <= 4; i++) g.strokeRoundedRect(640 - 250 + i * 8, 668 + i * 2, 500 - i * 16, 40 - i * 6, 6);
    [[400, 690], [880, 700]].forEach(([x, y]) => {
      for (let i = 0; i < 2; i++) g.fillRect(x + i * 3, y - i * 4, 22, 3);
    });
  }

  createArchivistsBell() {
    this.bellContainer = this.add.container(730, 62).setDepth(6);
    const stand = this.add.graphics();
    stand.lineStyle(1.5, 0x8a6435, 0.5);
    stand.lineBetween(0, 14, 0, 24);
    stand.lineBetween(-8, 24, 8, 24);
    const bell = this.add.graphics();
    bell.fillStyle(C_BRASS, 0.85);
    bell.lineStyle(1, 0x8a6435, 1);
    bell.beginPath();
    bell.arc(0, 0, 12, Math.PI, 0, false);
    bell.closePath();
    bell.fillPath(); bell.strokePath();
    bell.fillStyle(C_BRASS, 1);
    bell.fillCircle(0, -13, 2.5);
    bell.fillStyle(0x8a6435, 1);
    bell.fillRect(-16, 0, 32, 2.5);
    this.bellContainer.add([stand, bell]);
  }

  async ringBell(times = 1) {
    for (let i = 0; i < times; i++) {
      this.tweens.add({ targets: this.bellContainer, scale: 1.18, duration: 80, yoyo: true });
      for (let j = 0; j < 3; j++) {
        const arc = this.add.graphics().setDepth(6);
        arc.lineStyle(1, C_BRASS, 0.7);
        arc.beginPath();
        arc.arc(730, 58, 16 + j * 6, -Math.PI * 0.8, -Math.PI * 0.2, false);
        arc.strokePath();
        arc.setAlpha(0);
        this.tweens.add({ targets: arc, alpha: 0.6, duration: 100, delay: j * 60, yoyo: true, onComplete: () => arc.destroy() });
      }
      if (times > 1) await this.delay(300);
    }
  }

  createWingCrest() {
    this.crestContainer = this.add.container(880, 56).setDepth(6);
    const g = this.add.graphics();
    g.lineStyle(2, C_BRASS, 0.5);
    g.beginPath();
    g.moveTo(-20, -24); g.lineTo(20, -24); g.lineTo(20, 8); g.lineTo(0, 24); g.lineTo(-20, 8);
    g.closePath();
    g.strokePath();
    // book (add), magnifier (get), stamp (remove) stacked
    g.lineStyle(1, C_CYAN, 0.6);
    g.strokeRect(-8, -18, 16, 6);
    g.lineStyle(1, C_GOLD, 0.6);
    g.strokeCircle(0, -2, 5);
    g.lineBetween(3, 1, 7, 5);
    g.lineStyle(1, C_STAMP_RED, 0.6);
    g.strokeRect(-6, 10, 12, 6);
    this.crestGfx = g;
    this.crestContainer.add(g);
    this._crestState = "idle";
  }

  updateCrestPulse(time) {
    if (!this.crestGfx) return;
    if (this._crestState === "session") {
      this.crestGfx.setAlpha(0.6 + Math.sin(time * 0.006) * 0.3);
    } else if (this._crestState === "gold") {
      this.crestGfx.setAlpha(1);
    } else {
      this.crestGfx.setAlpha(0.4);
    }
  }

  pulseCrest(state) { this._crestState = state; }

  createAmbientParticles() {
    this.ambient = [];
    const colors = [0xc8a05a, 0x8a6435, 0xa89078];
    for (let i = 0; i < 9; i++) {
      this.ambient.push(this.add.circle(Phaser.Math.Between(0, W), Phaser.Math.Between(220, 630), 1, Phaser.Utils.Array.GetRandom(colors), Phaser.Math.FloatBetween(0.03, 0.06)).setDepth(2));
    }
  }

  updateAmbient(time, delta) {
    if (!this.ambient) return;
    const step = 0.013 * (delta / 16.7);
    this.ambient.forEach((p, i) => {
      p.y += step;
      p.x += Math.sin(time * 0.0005 + i) * 0.04;
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
  // CODE CANVAS (L27→L51 architecture, reused)
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
    this.tabFilename = this.add.text(CX + CW - 12, CY + TAB_H / 2, "Reshelve1.java", { font: "13px Courier New", color: "#546e7a" }).setOrigin(1, 0.5).setDepth(11);

    this.lineHighlight = this.add.rectangle(CX + CW / 2, 0, CW - 4, LINE_H, 0xffab00, 0.06).setDepth(19).setVisible(false);
    this.codeContainer = this.add.container(0, 0).setDepth(20);
  }

  _syntaxTokens(line) {
    const tokens = [];
    const re = /("(?:[^"\\]|\\.)*")|(\/\/.*$|\/\* populated by test \*\/)|(\bimport\b|\bfor\b|\bif\b|\bint\b|\bString\b|\bnew\b|\bScanner\b|\bArrayList\b)|(<\w*>)|(Integer\.valueOf)|(\bSystem\.out\b)|(\bSystem\.in\b)|([A-Za-z_]\w*(?=\())|(>=|<=|==|!=|\+\+|--|[+\-*/><])|([(){}\[\];.,=])/g;
    let last = 0, m;
    const plain = (t) => t && tokens.push({ t, c: "#e0e0e0" });
    while ((m = re.exec(line))) {
      if (m.index > last) plain(line.slice(last, m.index));
      if (m[1]) tokens.push({ t: m[1], c: HEX_CYAN });
      else if (m[2]) tokens.push({ t: m[2], c: "#546e7a" });
      else if (m[3]) tokens.push({ t: m[3], c: "#4caf50" });
      else if (m[4]) tokens.push({ t: m[4], c: HEX_GOLD });
      else if (m[5]) tokens.push({ t: m[5], c: "#6a1b9a" });
      else if (m[6]) tokens.push({ t: m[6], c: "#ffd740" });
      else if (m[7]) tokens.push({ t: m[7], c: "#78909c" });
      else if (m[8]) tokens.push({ t: m[8], c: m[8] === ".remove" ? HEX_STAMP_RED : "#ff8a65" });
      else if (m[9]) tokens.push({ t: m[9], c: "#78909c" });
      else if (m[10]) tokens.push({ t: m[10], c: "#78909c" });
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
          const w = 210;
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
    this.add.text(PX + 10, PY + 8, "RESHELVER'S PARTS", { font: "bold 11px Arial", color: "#3d4450" }).setDepth(11);
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
      const label = def.label || def.code.replace(/\n\s*/g, "  ");
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
  // RIG WINDOW — shelf + crate + panel + tracker + ticker + cameos
  // ══════════════════════════════════════════════════════════════

  createRigWindow() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0d0805, 1);
    g.fillRoundedRect(OX, OY, OW, OH, 12);
    g.lineStyle(3, C_BRASS, 1);
    g.strokeRoundedRect(OX, OY, OW, OH, 12);
    this.add.text(OX + 10, OY + 6, "RESHELVING RIG — LIVE", { font: "bold 11px Georgia", color: HEX_BRASS }).setAlpha(0.7).setDepth(11);

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
    g.fillRect(MS_X0, MS_TOP, 6, MS_BASE_Y - MS_TOP + 8);
    g.fillRect(MS_X1 - 6, MS_TOP, 6, MS_BASE_Y - MS_TOP + 8);
    g.fillRect(MS_X0, MS_TOP, MS_X1 - MS_X0, 6);

    this.typeStampText = this.add.text(MS_CX, OY + 42, "", { font: "bold 9px Courier New", color: HEX_CYAN }).setOrigin(0.5);
    this.sizeCounterText = this.add.text(MS_CX, MS_BASE_Y + 22, "size: 0", { font: "bold 9px Courier New", color: HEX_BRASS }).setOrigin(0.5);
    this.rigLayer.add([this.typeStampText, this.sizeCounterText]);

    this.shelfIndexPlates = [];
    for (let i = 0; i < 6; i++) {
      const y = MS_BASE_Y - i * MS_STEP;
      const ledge = this.add.graphics();
      ledge.fillStyle(0x3a2618, 0.5);
      ledge.fillRoundedRect(MS_CX - 50, y - 7, 100, 14, 2);
      const idxText = this.add.text(MS_X0 + 9, y, String(i), { font: "bold 9px Courier New", color: HEX_GRAY }).setOrigin(0.5);
      this.rigLayer.add([ledge, idxText]);
      this.shelfIndexPlates.push({ text: idxText, y });
    }
    this.topDashGfx = this.add.graphics();
    this.rigLayer.add(this.topDashGfx);
    this.bookLayer = this.add.container(0, 0);
    this.rigLayer.add(this.bookLayer);
  }

  _drawTopDash() {
    this.topDashGfx.clear();
    const idx = this.currentList.length;
    if (idx >= 6) return;
    const y = this._shelfY(idx);
    this.topDashGfx.lineStyle(1, C_BRASS, 0.35);
    for (let x = MS_CX - 34; x < MS_CX + 34; x += 8) this.topDashGfx.lineBetween(x, y + 12, x + 4, y + 12);
  }

  createMiniCrate() {
    const g = this.add.graphics();
    g.fillStyle(0x241a0e, 1);
    g.lineStyle(1.5, 0x8a6435, 1);
    g.fillRoundedRect(MS_X0, CRATE_Y0, MS_X1 - MS_X0, CRATE_Y1 - CRATE_Y0, 3);
    g.strokeRoundedRect(MS_X0, CRATE_Y0, MS_X1 - MS_X0, CRATE_Y1 - CRATE_Y0, 3);
    this.crateFrontGfx = g;
    this.rigLayer.add(g);
    this.crateLabel = this.add.text(MS_CX, CRATE_Y0 + 4, "WITHDRAWN", { font: "bold 8px Georgia", color: HEX_STAMP_RED }).setOrigin(0.5).setAlpha(0.5).setAngle(-2);
    this.rigLayer.add(this.crateLabel);
  }

  clearCrate() {
    this.crateContents.forEach((c) => { if (c.active) this.tweens.add({ targets: c, alpha: 0, duration: 200, onComplete: () => c.destroy() }); });
    this.crateContents = [];
  }

  setShelfType(listType) {
    this.currentListType = listType;
    const colorMap = { String: HEX_CYAN, Integer: HEX_GOLD };
    this.typeStampText.setText(`ArrayList<${listType}>`).setColor(colorMap[listType] || HEX_CYAN);
  }

  _typeColorHex(type) { return type === "int" ? HEX_GOLD : HEX_CYAN; }
  _typeColorInt(type) { return type === "int" ? C_GOLD : C_CYAN; }
  _shelfY(idx) { return MS_BASE_Y - Math.min(idx, 5) * MS_STEP; }
  _displayValueOnSpine(entry) { return entry.type === "string" ? `"${entry.value}"` : String(entry.value); }

  _makeBookVisual(entry, x, y) {
    const color = this._typeColorInt(entry.type);
    const display = this._displayValueOnSpine(entry);
    const c = this.add.container(x, y);
    const g = this.add.graphics();
    g.fillStyle(color, 0.85);
    g.lineStyle(1, Phaser.Display.Color.IntegerToColor(color).darken(30).color, 1);
    g.fillRoundedRect(-19, -13, 38, 26, 2);
    g.strokeRoundedRect(-19, -13, 38, 26, 2);
    const txt = this.add.text(0, 0, display, { font: "bold 10px Georgia", color: "#0a0704" }).setOrigin(0.5);
    if (display.length > 5) { txt.setAngle(-90); if (txt.width > 22) txt.setFontSize(6); }
    const label = this.add.text(0, 16, "", { font: "bold 8px Courier New", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.6);
    c.add([g, txt, label]);
    return { container: c, text: txt, label, entry };
  }

  async populateShelf(initialList, listType) {
    this.clearShelf();
    this.setShelfType(listType);
    const typeOf = listType === "Integer" ? "int" : "string";
    for (let i = 0; i < initialList.length; i++) {
      const entry = { value: initialList[i], type: typeOf };
      const book = this._makeBookVisual(entry, MS_CX, this._shelfY(i));
      book.container.setAlpha(0);
      book.label.setText(`[${i}]`);
      this.bookLayer.add(book.container);
      this.tweens.add({ targets: book.container, alpha: 1, duration: 100, delay: i * 50 });
      const plate = this.shelfIndexPlates[Math.min(i, 5)];
      if (plate) plate.text.setColor(this._typeColorHex(typeOf));
      this.currentList.push(entry);
      this.shelfBookSprites.push(book);
    }
    this.sizeCounterText.setText(`size: ${this.currentList.length}`);
    this.updateListStatePanel();
    this._drawTopDash();
    await this.delay(initialList.length * 50 + 130);
  }

  clearShelf() {
    this.shelfBookSprites.forEach((b) => b.container.destroy());
    this.shelfBookSprites = [];
    this.currentList = [];
    this.sizeCounterText.setText("size: 0");
    this.updateListStatePanel();
    this.shelfIndexPlates.forEach((p) => { p.text.setColor(HEX_GRAY); p.text.setAlpha(1); });
    if (this.topDashGfx) this._drawTopDash();
  }

  // ── addBookToShelf — the L46 filing, compact ──

  async addBookToShelf(value, type) {
    const entry = { value, type };
    const idx = this.currentList.length;
    const targetY = this._shelfY(idx);
    const book = this._makeBookVisual(entry, MS_CX, CRATE_Y0 - 16);
    book.container.setAlpha(0).setScale(0.5);
    this.bookLayer.add(book.container);
    await new Promise((res) => { this.tweens.add({ targets: book.container, alpha: 1, scale: 1, duration: 100, ease: "Back.easeOut", onComplete: res }); });
    await new Promise((res) => { this.tweens.add({ targets: book.container, y: targetY, duration: 180, ease: "Sine.easeOut", onComplete: res }); });
    book.label.setText(`[${idx}]`);
    const plate = this.shelfIndexPlates[Math.min(idx, 5)];
    if (plate) { plate.text.setColor(this._typeColorHex(type)); this.tweens.add({ targets: plate.text, scale: 1.4, duration: 100, yoyo: true }); }
    const p = this.add.particles(MS_CX, targetY, "l54_dot", { speed: { min: 15, max: 35 }, angle: { min: 200, max: 340 }, scale: { start: 0.35, end: 0 }, lifespan: 180, tint: [this._typeColorInt(type)], emitting: false });
    this.rigLayer.add(p);
    p.explode(3);
    this.time.delayedCall(240, () => p.destroy());
    this.currentList.push(entry);
    this.shelfBookSprites.push(book);
    this.sizeCounterText.setText(`size: ${this.currentList.length}`);
    this.updateListStatePanel();
    this._drawTopDash();
    await this.delay(60);
  }

  // ── ghost retrieval (L49-faithful, for get()-distractor reveals) ──

  async retrieveGhost(index) {
    const entry = this.currentList[index];
    const shelfY = this._shelfY(index);
    const plate = this.shelfIndexPlates[Math.min(index, 5)];
    if (plate) { plate.text.setColor(HEX_GOLD); this.tweens.add({ targets: plate.text, scale: 1.4, duration: 100, yoyo: true }); this.time.delayedCall(900, () => { if (plate.text.active && this.currentList[index]) plate.text.setColor(this._typeColorHex(this.currentList[index].type)); }); }
    const scan = this.add.rectangle(MS_CX - 40, shelfY, 2, 26, 0xffd740, 0.7);
    this.rigLayer.add(scan);
    await new Promise((res) => { this.tweens.add({ targets: scan, x: MS_CX + 40, duration: 150, onComplete: () => { scan.destroy(); res(); } }); });
    if (!this._alive) return entry;

    const ghost = this._makeBookVisual(entry, MS_CX, shelfY);
    ghost.container.setAlpha(0);
    this.bookLayer.add(ghost.container);
    this.updateRemovedRow(entry.value, entry.type, "get");
    await new Promise((res) => { this.tweens.add({ targets: ghost.container, alpha: 0.45, y: shelfY - 14, duration: 150, onComplete: res }); });
    await new Promise((res) => { this.tweens.add({ targets: ghost.container, x: MS_CX + 50, y: shelfY - 26, alpha: 0, duration: 280, ease: "Sine.easeIn", onComplete: () => { ghost.container.destroy(); res(); } }); });
    return entry;
  }

  // ── the withdrawal (L52/L53-faithful) + overload visuals ──

  async markBook(index) {
    const book = this.shelfBookSprites[index];
    if (!book) return;
    const tag = this.add.graphics();
    tag.fillStyle(C_STAMP_RED, 0.8);
    tag.fillTriangle(18, -12, 11, -12, 18, -5);
    book.container.add(tag);
    await this.delay(220);
  }

  async landInCrate(book) {
    this.crateContents.forEach((c) => { if (c.active) this.tweens.add({ targets: c, y: c.y + 3, duration: 90 }); });
    if (this.crateContents.length >= 3) {
      const oldest = this.crateContents.shift();
      if (oldest.active) oldest.destroy();
    }
    await new Promise((res) => { this.tweens.add({ targets: book.container, x: MS_CX + Phaser.Math.Between(-16, 16), y: CRATE_Y0 + 16, angle: 90, scale: 0.7, duration: 200, ease: "Sine.easeIn", onComplete: res }); });
    this.tweens.add({ targets: this.crateFrontGfx, y: 1, duration: 50, yoyo: true });
    book.container.setDepth(1);
    this.crateContents.push(book.container);
  }

  async withdrawBook(index, opts = {}) {
    const entry = this.currentList[index];
    const book = this.shelfBookSprites[index];
    const shelfY = this._shelfY(index);

    if (!opts.skipLocate) {
      const plate = this.shelfIndexPlates[Math.min(index, 5)];
      if (plate) { plate.text.setColor(HEX_GOLD); this.tweens.add({ targets: plate.text, scale: 1.4, duration: 100, yoyo: true }); }
      const scan = this.add.rectangle(MS_CX - 40, shelfY, 2, 26, 0xffd740, 0.7);
      this.rigLayer.add(scan);
      await new Promise((res) => { this.tweens.add({ targets: scan, x: MS_CX + 40, duration: 150, onComplete: () => { scan.destroy(); res(); } }); });
      if (!this._alive) return entry;
    }

    await this.markBook(index);
    if (!this._alive) return entry;

    book.container.setDepth(10);
    await new Promise((res) => { this.tweens.add({ targets: book.container, y: shelfY - 14, duration: 140, ease: "Sine.easeOut", onComplete: res }); });
    if (!this._alive) return entry;

    this.cameras.main.shake(50, 0.0012);
    const mark = this.add.text(0, 0, "X", { font: "bold 12px Georgia", color: HEX_STAMP_RED }).setOrigin(0.5).setAngle(-20).setAlpha(0);
    book.container.add(mark);
    this.tweens.add({ targets: mark, alpha: 0.95, duration: 80 });
    if (opts.capture) this._popReturnValue(entry, book.container.x, book.container.y);
    await this.delay(120);
    if (!this._alive) return entry;

    await this.landInCrate(book);
    if (!this._alive) return entry;

    this.currentList.splice(index, 1);
    this.shelfBookSprites.splice(index, 1);
    await this.delay(180);
    await this.closeGap(index);
    this.updateRemovedRow(entry.value, entry.type, "remove");
    return entry;
  }

  async closeGap(vacatedIndex) {
    const shifting = this.shelfBookSprites.slice(vacatedIndex);
    await new Promise((res) => {
      if (shifting.length === 0) { res(); return; }
      let done = 0;
      shifting.forEach((b, k) => {
        const newIdx = vacatedIndex + k;
        this.tweens.add({
          targets: b.container, y: this._shelfY(newIdx), duration: 220, ease: "Sine.easeInOut",
          onComplete: () => { b.label.setText(`[${newIdx}]`); if (++done === shifting.length) res(); },
        });
      });
    });
    this.sizeCounterText.setText(`size: ${this.currentList.length}`).setColor(HEX_RED);
    this.tweens.add({ targets: this.sizeCounterText, scale: 1.3, duration: 100, yoyo: true });
    this.time.delayedCall(450, () => { if (this.sizeCounterText.active) this.sizeCounterText.setColor(HEX_BRASS); });
    this.shelfIndexPlates.forEach((p, i) => { p.text.setColor(i < this.currentList.length ? this._typeColorHex(this.currentList[i].type) : HEX_GRAY); });
    this._drawTopDash();
    this.updateListStatePanel();
  }

  _popReturnValue(entry, fromX, fromY) {
    const valText = this.add.text(fromX, fromY, String(entry.value), { font: "bold 13px Courier New", color: this._typeColorHex(entry.type) }).setOrigin(0.5).setDepth(30);
    this.missionElements.push(valText);
    this.tweens.add({ targets: valText, alpha: 0, y: fromY - 16, duration: 400, delay: 250, onComplete: () => valText.destroy() });
  }

  async searchSweep(value) {
    for (let i = 0; i < this.currentList.length; i++) {
      if (!this._alive) return -1;
      const hl = this.add.rectangle(MS_CX, this._shelfY(i), 96, 14, C_GOLD, 0.18);
      this.rigLayer.add(hl);
      await this.delay(60);
      hl.destroy();
      if (String(this.currentList[i].value) === String(value)) return i;
    }
    return -1;
  }

  async notFoundFizzle() {
    const topY = this.currentList.length > 0 ? this._shelfY(this.currentList.length - 1) - 20 : MS_BASE_Y - 20;
    const p = this.add.particles(MS_CX, topY, "l54_dot", { speed: { min: 10, max: 30 }, angle: { min: 240, max: 300 }, scale: { start: 0.35, end: 0 }, lifespan: 300, tint: [0x9e9e9e], alpha: { start: 0.5, end: 0 }, emitting: false });
    this.rigLayer.add(p);
    p.explode(5);
    this.time.delayedCall(350, () => p.destroy());
    this.updateRemovedRow(false, "boolean", "remove");
    await this.delay(500);
  }

  flagArgumentAsIndex(value) {
    const t = this.add.text(OX + OW / 2, STRIP_Y - 30, "index", { font: "bold 10px Courier New", color: HEX_GOLD }).setOrigin(0.5).setDepth(20).setAlpha(0);
    this.missionElements.push(t);
    this.tweens.add({ targets: t, alpha: 1, y: STRIP_Y - 38, duration: 180 });
    this.time.delayedCall(800, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 180, onComplete: () => t.destroy() }); });
  }

  renderBoxedArgument(value) {
    const c = this.add.container(OX + OW / 2, STRIP_Y - 30).setDepth(20).setAlpha(0);
    const g = this.add.graphics();
    g.lineStyle(1.5, C_CYAN, 0.9);
    g.strokeRoundedRect(-20, -9, 40, 18, 4);
    const t = this.add.text(0, 0, String(value), { font: "bold 12px Courier New", color: HEX_GOLD }).setOrigin(0.5);
    const flag = this.add.text(0, -16, "Integer", { font: "bold 8px Courier New", color: HEX_CYAN }).setOrigin(0.5);
    c.add([g, t, flag]);
    this.missionElements.push(c);
    this.tweens.add({ targets: c, alpha: 1, duration: 180 });
    this.time.delayedCall(900, () => { if (c.active) this.tweens.add({ targets: c, alpha: 0, duration: 180, onComplete: () => c.destroy() }); });
  }

  async crashWithdrawal(index) {
    const topIdx = this.currentList.length - 1;
    const startY = topIdx >= 0 ? this._shelfY(topIdx) : MS_BASE_Y;
    const phantomY = this._shelfY(Math.max(0, Math.min(index, 5)));
    const scan = this.add.rectangle(MS_CX, startY, 100, 3, C_RED, 0.6);
    this.rigLayer.add(scan);
    await new Promise((res) => { this.tweens.add({ targets: scan, y: phantomY - 6, duration: 220, ease: "Sine.easeOut", onComplete: res }); });
    if (!this._alive) { scan.destroy(); return; }
    await new Promise((res) => { this.tweens.add({ targets: scan, alpha: 0, duration: 60, yoyo: true, repeat: 3, onComplete: () => { scan.destroy(); res(); } }); });
    const stamp = this.add.text(OX + OW / 2, OY + 120, "IndexOutOfBoundsException", { font: "bold 11px Courier New", color: HEX_RED }).setOrigin(0.5).setAngle(-6).setAlpha(0).setDepth(25);
    this.rigLayer.add(stamp);
    this.tweens.add({ targets: stamp, alpha: 1, duration: 110 });
    this.screenShake(0.005, 140);
    this.updateRemovedRow("", "crash", "remove");
    await this.delay(600);
    if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 160, onComplete: () => stamp.destroy() });
  }

  showSkippedFlag(index) {
    const y = this._shelfY(index);
    const t = this.add.text(MS_X1 + 40, y, "skipped!", { font: "italic 10px Georgia", color: HEX_RED }).setOrigin(0.5).setDepth(20).setAlpha(0);
    this.missionElements.push(t);
    this.tweens.add({ targets: t, alpha: 1, duration: 90 });
    this.time.delayedCall(380, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 140, onComplete: () => t.destroy() }); });
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
  // LIST STATE PANEL
  // ══════════════════════════════════════════════════════════════

  createMiniListStatePanel() {
    const hdr = this.add.text(LP_X, OY + 40, "LIST STATE", { font: "bold 9px Georgia", color: HEX_BRASS }).setAlpha(0.7);
    this.bracketText = this.add.text(LP_CX, OY + 78, "[]", { font: "bold 11px Courier New", color: HEX_GRAY, wordWrap: { width: 130 }, align: "center" }).setOrigin(0.5);
    this.panelSizeText = this.add.text(LP_CX, OY + 110, "size: 0", { font: "10px Courier New", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.85);
    this.panelIndexText = this.add.text(LP_CX, OY + 124, "", { font: "bold 9px Courier New", color: "#8a6435", wordWrap: { width: 130 }, align: "center" }).setOrigin(0.5).setAlpha(0.7);
    this.add.text(LP_X, OY + 148, "removed:", { font: "9px Georgia", color: "#8a6435" });
    this.removedValueText = this.add.text(LP_X + 46, OY + 148, "—", { font: "bold 11px Courier New", color: HEX_GRAY }).setOrigin(0, 0.5);
    this.add.text(LP_X, OY + 166, "before:", { font: "8px Courier New", color: "#8a6435" });
    this.beforeRowText = this.add.text(LP_X + 38, OY + 166, "", { font: "bold 8px Courier New", color: "#b0bec5" });
    this.add.text(LP_X, OY + 178, "after:", { font: "8px Courier New", color: "#8a6435" });
    this.afterRowText = this.add.text(LP_X + 38, OY + 178, "", { font: "bold 8px Courier New", color: HEX_GREEN_BRIGHT });
    this.rigLayer.add([hdr, this.bracketText, this.panelSizeText, this.panelIndexText, this.removedValueText, this.beforeRowText, this.afterRowText]);
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

  updateRemovedRow(value, type, kind) {
    if (value === null) { this.removedValueText.setFontSize(9).setText("—").setColor(HEX_GRAY); return; }
    if (type === "crash") { this.removedValueText.setText("✗ IOOBE").setColor(HEX_RED).setFontSize(8); return; }
    if (type === "boolean") { this.removedValueText.setFontSize(9).setText(String(value)).setColor(HEX_VIOLET); return; }
    this.removedValueText.setFontSize(9).setText(String(value)).setColor(kind === "get" ? HEX_GOLD : this._typeColorHex(type));
  }

  fillBeforeRow() {
    const s = `[${this.currentList.map((e) => String(e.value)).join(", ")}] (${this.currentList.length})`;
    this.beforeRowText.setText(s.length > 26 ? s.slice(0, 26) : s);
    this.afterRowText.setText("");
  }

  fillAfterRow() {
    const s = `[${this.currentList.map((e) => String(e.value)).join(", ")}] (${this.currentList.length})`;
    this.afterRowText.setText(s.length > 26 ? s.slice(0, 26) : s);
  }

  // ══════════════════════════════════════════════════════════════
  // MUTATION TRACKER (L53 extended)
  // ══════════════════════════════════════════════════════════════

  createMiniMutationTracker() {
    const hdr = this.add.text(TRK_X, OY + 40, "MUTATION TRACKER", { font: "bold 9px Georgia", color: HEX_BRASS }).setAlpha(0.7);
    this.trackerContainer = this.add.container(0, 0);
    this.rigLayer.add([hdr, this.trackerContainer]);
    this._trackerRows = [];
    this._trackerDash = this.add.text(TRK_X + TRK_W / 2, OY + 110, "—", { font: "bold 14px Courier New", color: "#3a2618" }).setOrigin(0.5);
    this.rigLayer.add(this._trackerDash);
  }

  appendTrackerRow(text, isCrash) {
    if (this._trackerDash && this._trackerDash.active) { this._trackerDash.destroy(); this._trackerDash = null; }
    const maxRows = 8;
    if (this._trackerRows.length >= maxRows) {
      const removed = this._trackerRows.shift();
      removed.destroy();
      this._trackerRows.forEach((r) => { r.y -= 17; });
    }
    const y = OY + 56 + this._trackerRows.length * 17;
    const t = this.add.text(TRK_X, y, text, { font: "10px Courier New", color: isCrash ? HEX_RED : "#e8dfc8" }).setAlpha(0);
    if (t.width > TRK_W - 4) t.setFontSize(7);
    this.trackerContainer.add(t);
    this._trackerRows.push(t);
    this.tweens.add({ targets: t, alpha: 1, duration: 100 });
  }

  clearTracker() {
    this.trackerContainer.removeAll(true);
    this._trackerRows = [];
    if (!this._trackerDash) { this._trackerDash = this.add.text(TRK_X + TRK_W / 2, OY + 110, "—", { font: "bold 14px Courier New", color: "#3a2618" }).setOrigin(0.5); this.rigLayer.add(this._trackerDash); }
  }

  // ══════════════════════════════════════════════════════════════
  // OUTPUT TICKER + CROSS-WING CAMEOS
  // ══════════════════════════════════════════════════════════════

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
    pg.fillRoundedRect(TRK_X, OY + 195, TRK_W - 20, 16, 3);
    pg.strokeRoundedRect(TRK_X, OY + 195, TRK_W - 20, 16, 3);
    this.pressText = this.add.text(TRK_X + (TRK_W - 20) / 2, OY + 203, "", { font: "bold 9px Courier New", color: HEX_ORANGE }).setOrigin(0.5);
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
      const y = OY + 148 + idx * 18;
      const g = this.add.graphics();
      g.fillStyle(0x0a1520, 1);
      g.lineStyle(1, C_CYAN, 0.6);
      g.fillRoundedRect(LP_X, y, 130, 14, 3);
      g.strokeRoundedRect(LP_X, y, 130, 14, 3);
      const t = this.add.text(LP_X + 5, y + 7, "", { font: "bold 8px Courier New", color: HEX_CYAN }).setOrigin(0, 0.5);
      this.containerLayer.add([g, t]);
      this.containerObjs[name] = t;
    }
    const disp = javaType === "int" ? `int ${name} = ${value}` : `String ${name} = "${value}"`;
    this.containerObjs[name].setText(disp);
    this.tweens.add({ targets: this.containerObjs[name], scale: 1.1, duration: 90, yoyo: true });
  }

  async miniPressStamp(input, output) {
    this.pressLayer.setVisible(true);
    this.pressText.setText(`${input} → ${output}`);
    if (this.pressText.width > TRK_W - 24) this.pressText.setFontSize(6);
    this.tweens.add({ targets: this.pressText, scale: 1.15, duration: 90, yoyo: true });
    await this.delay(160);
  }

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
    const cellW = 7, x1 = OX + OW - 10;
    const totalW = Math.min(this.tapeState.length * cellW, 180);
    const startX = x1 - totalW;
    const bg = this.add.graphics();
    bg.fillStyle(0xe8f0e8, 0.85);
    bg.fillRoundedRect(startX - 3, TAPE_Y - 7, totalW + 6, 14, 3);
    this.tapeContainer.add(bg);
    this.tapeState.slice(-Math.floor(totalW / cellW)).forEach((cell, i) => {
      const x = startX + i * cellW + cellW / 2;
      const disp = cell.kind === "space" ? "␣" : cell.kind === "newline" ? "⏎" : cell.ch;
      const color = cell.kind === "space" ? "#c2185b" : cell.kind === "newline" ? "#7b1fa2" : "#2e7d32";
      const t = this.add.text(x, TAPE_Y, disp, { font: "bold 8px Courier New", color }).setOrigin(0.5);
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
    await this.delay(60);
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
    const listStr = `[${(test.initialList || []).join(",")}]`.slice(0, 14);
    return test.input ? `${listStr} in:${test.input.join(",")}` : listStr;
  }

  buildReportRows(mission) {
    this.reportRows.forEach((r) => r.container.destroy());
    this.reportRows = [];
    mission.tests.forEach((test, i) => {
      const y = RY + 24 + i * 24;
      const c = this.add.container(RX + 10, y).setDepth(11).setAlpha(0.35);
      const inputT = this.add.text(0, 0, this._compactTestLabel(test), { font: "11px Courier New", color: "#b0bec5" }).setOrigin(0, 0.5);
      const expT = this.add.text(150, 0, `[${(test.expectedList || []).join(",")}]`.slice(0, 20), { font: "11px Courier New", color: "#78909c" }).setOrigin(0, 0.5);
      const outStatusT = this.add.text(RW - 44, 0, "", { font: "11px Arial", color: "#78909c" }).setOrigin(0.5);
      const listStatusT = this.add.text(RW - 20, 0, "…", { font: "15px Arial", color: "#78909c" }).setOrigin(0.5);
      c.add([inputT, expT, outStatusT, listStatusT]);
      this.reportRows.push({ container: c, outStatusT, listStatusT });
    });
  }

  updateReportRow(index, outMatch, listMatch, hasOutput) {
    const row = this.reportRows[index];
    if (!row) return;
    row.container.setAlpha(1);
    if (hasOutput) row.outStatusT.setText(outMatch ? "out✓" : "out✗").setColor(outMatch ? HEX_GREEN_BRIGHT : HEX_RED);
    row.listStatusT.setText(listMatch ? "✓" : "✗").setColor(listMatch ? HEX_GREEN_BRIGHT : HEX_RED);
    if (!listMatch || (hasOutput && !outMatch)) this.tweens.add({ targets: row.container, x: row.container.x + 3, duration: 35, yoyo: true, repeat: 5 });
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

    this.add.text(20, 14, "THE GRAND RESHELVING", { font: "bold 15px Georgia", color: "#b0bec5" }).setDepth(51);
    this.add.text(20, 32, "Restructuring Phase — ArrayList Methods: remove()", { font: "12px Arial", color: "#546e7a" }).setDepth(51);

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
    for (let i = 0; i < 3; i++) {
      const lg = this.add.graphics({ x: 1150 + i * 26, y: 26 }).setDepth(51);
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
  // BIT — Grand Reshelver variant (gold sash, shelf keys)
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
    specs.beginPath(); specs.arc(-5, 4, 5, 0, Math.PI, false); specs.strokePath();
    specs.beginPath(); specs.arc(6, 4, 5, 0, Math.PI, false); specs.strokePath();
    const cape = this.add.graphics();
    cape.fillStyle(0x3a2618, 0.7);
    cape.lineStyle(1, C_BRASS, 0.7);
    cape.fillTriangle(-16, -14, 16, -14, 0, 20);
    // gold-trimmed sash with three pips
    const sash = this.add.graphics();
    sash.lineStyle(4, 0x3a2618, 0.9);
    sash.lineBetween(-14, -12, 12, 16);
    sash.lineStyle(1.5, C_GOLD, 0.7);
    sash.lineBetween(-14, -12, 12, 16);
    [[-8, -4], [-1, 2], [6, 9]].forEach(([px, py]) => { sash.fillStyle(C_GOLD, 0.9); sash.fillCircle(px, py, 1.5); });
    const gloveL = this.add.circle(-16, 10, 4, 0xe0d6b8, 0.85);
    const gloveR = this.add.circle(16, 10, 4, 0xe0d6b8, 0.85);
    // ring of shelf keys at the hip
    const keys = this.add.graphics();
    keys.lineStyle(1, C_BRASS, 0.8);
    keys.strokeCircle(14, 14, 3);
    [0, 1, 2].forEach((i) => {
      const a = (Math.PI * 2 * i) / 3;
      keys.lineBetween(14 + Math.cos(a) * 3, 14 + Math.sin(a) * 3, 14 + Math.cos(a) * 6, 14 + Math.sin(a) * 6);
    });
    c.add([g, cape, sash, eye, pupil, specs, gloveL, gloveR, keys, tip]);
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
    const p = this.add.particles(x, y, "l54_dot", {
      speed: { min: 70, max: 220 }, angle: { min: 0, max: 360 }, scale: { start: 0.8, end: 0 }, lifespan: 450,
      tint: [C_CYAN, C_GOLD, C_GREEN_BRIGHT, C_STAMP_RED, 0xffffff], emitting: false,
    }).setDepth(75);
    p.explode(count);
    this.time.delayedCall(800, () => p.destroy());
  }

  createGoldCyanRedConfetti(x, y, count = 40) {
    const p = this.add.particles(x, y, "l54_dot", {
      speed: { min: 100, max: 280 }, angle: { min: 0, max: 360 }, scale: { start: 1, end: 0 }, lifespan: 700,
      tint: [C_GOLD, C_CYAN, C_STAMP_RED, 0xffffff], emitting: false,
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
    await this.bitSay("The Grand Reshelving, Reshelver — the day the whole Archive turns over. You've filed, consulted, and withdrawn. Today you write the programs that CURATE: trims, purges, corrections, and the year's final pipeline. Every method you own rides on this rig.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(5200)]); if (!A()) return;
    this.hideBubble();

    const a1 = this.floatingAnnotation(CX + CW / 2, CY - 16, "the curation script", HEX_CYAN);
    await this.delay(400); if (!A()) return;
    const a2 = this.floatingAnnotation(PX + PW / 2, PY - 12, "blocks — one loop direction is a trap", HEX_GRAY);
    await this.delay(400); if (!A()) return;
    const a3 = this.floatingAnnotation(OX + OW / 2, OY - 12, "stamps, shifts, and the tracker — LIVE", HEX_GREEN_BRIGHT);
    await this.delay(400); if (!A()) return;
    const a4 = this.floatingAnnotation(880, 36, "the wing watches", HEX_GOLD);
    await this.delay(400); if (!A()) return;
    const a5 = this.floatingAnnotation(RX + RW / 2, RY - 12, "list AND console must both match", HEX_VIOLET);
    await this.delay(400); if (!A()) return;

    await this.bitSay("Three laws for the day: a bare number on a number list is an INDEX — box it to hunt values; the shelf shifts under every removal — purge BACKWARD; and the last shelf is size minus one, today and forever. Build, run, read, repair. The Archive turns over at dusk — begin!");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(5500)]); if (!A()) return;
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

    this.tabFilename.setText(`Reshelve${mission.mission}.java`);
    this.renderSkeleton(mission);
    this.populatePalette(mission);
    this.buildReportRows(mission);
    this.renderMissionBrief(mission);
    this.disableRunButton();
    this.highlightCodeLine(null);
    this.verdictLamp.setFillStyle(C_GRAY);
    this.clearShelf();
    this.clearCrate();
    this.clearTicker();
    this.clearTracker();
    this.parkCameos();
    this.currentListName = mission.listName;
    this.setShelfType(mission.listJavaType);
    this.loadMiniTape(mission.tests[0].input);
    this.updateManifestStrip("");
    this.pulseCrest("idle");
    this.inputLocked = false;
  }

  clearMission() {
    this.missionElements.forEach((e) => { if (e && e.destroy) e.destroy(); });
    this.missionElements = [];
  }

  buildProgramItems(mission, assembled) {
    const out = [];
    mission.skeleton.forEach((rawLine) => {
      const sm = rawLine.match(/<slot:(\w+)>/);
      if (sm) {
        const slotId = sm[1];
        const code = assembled[slotId] && assembled[slotId][0] ? assembled[slotId][0].code : "";
        const codeLines = code.split("\n");
        out.push({ text: rawLine.replace(/<slot:\w+>/, codeLines[0]), slotId });
        for (let k = 1; k < codeLines.length; k++) out.push({ text: codeLines[k], slotId });
      } else {
        out.push({ text: rawLine, slotId: null });
      }
    });
    return out;
  }

  // ══════════════════════════════════════════════════════════════
  // COMPILE CHECK — the run never starts on a compile error
  // ══════════════════════════════════════════════════════════════

  _buildSlotExpectedTypes(mission) {
    const map = {};
    mission.skeleton.forEach((line) => {
      const m = line.match(/^(String|int)\s+\w+\s*=\s*<slot:(\w+)>;$/);
      if (m) map[m[2]] = m[1];
    });
    return map;
  }

  compileCheckProgram(mission, items, assembled) {
    const failFor = (slotId, fallbackTag) => {
      const blockTag = slotId && assembled[slotId] && assembled[slotId][0] ? assembled[slotId][0].tag : null;
      return { ok: false, slotId, tag: blockTag || fallbackTag };
    };

    // standalone-statement slots must supply their own trailing ';'
    for (const slotId in this.slotDefs) {
      const skelLine = mission.skeleton.find((l) => l.trim() === `<slot:${slotId}>`);
      if (!skelLine) continue;
      const code = assembled[slotId] && assembled[slotId][0] ? assembled[slotId][0].code : "";
      const lastLine = code.split("\n").pop().trim();
      if (lastLine && !lastLine.endsWith(";") && !lastLine.endsWith("{") && !lastLine.endsWith("}")) {
        return failFor(slotId, "missing_semicolon");
      }
    }

    // declared-type mismatches (boolean-into-String, wrong Scanner method)
    const slotExpected = this._buildSlotExpectedTypes(mission);
    for (const slotId in slotExpected) {
      const code = (assembled[slotId] && assembled[slotId][0] ? assembled[slotId][0].code : "").trim();
      const expected = slotExpected[slotId];
      if (expected === "String") {
        if (code === "sc.nextInt()") return failFor(slotId, "wrong_scanner_method");
        const rm = code.match(/^(\w+)\.remove\((.*)\)$/);
        if (rm) {
          const mode = this._resolveRemoveMode(rm[2], {});
          if (mode.mode === "value") return failFor(slotId, "index_as_string_belief");
        }
      } else if (expected === "int") {
        if (code === "sc.nextLine()") return failFor(slotId, "wrong_scanner_method");
      }
    }

    const fullText = items.map((i) => i.text).join("\n");

    if (/\.(toUpperCase|toLowerCase)(?!\()/.test(fullText)) {
      const badLine = items.find((i) => /\.(toUpperCase|toLowerCase)(?!\()/.test(i.text));
      return failFor(badLine && badLine.slotId, "property_vs_method_syntax");
    }

    // get() only accepts an int — quoted strings or declared-String variables fail
    const declaredStringVars = new Set();
    mission.skeleton.forEach((line) => { const m = line.match(/^String\s+(\w+)\s*=/); if (m) declaredStringVars.add(m[1]); });
    const getMatches = [...fullText.matchAll(/\.get\(([^)]*)\)/g)];
    for (const gm of getMatches) {
      const arg = gm[1].trim();
      if (/^".*"$/.test(arg) || declaredStringVars.has(arg)) {
        const badLine = items.find((i) => i.text.includes(gm[0]));
        return failFor(badLine && badLine.slotId, "get_by_value_belief");
      }
    }

    // wrong_type_for_generic: quoted string arg to add()/remove() on an Integer list
    if (mission.listJavaType === "Integer" && /\.(add|remove)\("[^"]*"\)/.test(fullText)) {
      const badLine = items.find((i) => /\.(add|remove)\("[^"]*"\)/.test(i.text));
      return failFor(badLine && badLine.slotId, "wrong_type_for_generic");
    }

    return { ok: true };
  }

  // ══════════════════════════════════════════════════════════════
  // UNIFIED INTERPRETER — add + get + remove(both overloads) + loops
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

  _resolveRemoveMode(argExpr, vars) {
    const t = argExpr.trim();
    let m = t.match(/^Integer\.valueOf\((-?\d+)\)$/);
    if (m) return { mode: "value", value: parseInt(m[1], 10), wasLiteral: false };
    if (/^".*"$/.test(t)) return { mode: "value", value: t.slice(1, -1), wasLiteral: false };
    if (/^-?\d+$/.test(t)) return { mode: "index", index: parseInt(t, 10), wasLiteral: true };
    if (/^[A-Za-z_]\w*$/.test(t) && vars && vars[t] !== undefined) {
      const v = vars[t];
      if (typeof v === "number") return { mode: "index", index: v, wasLiteral: false };
      return { mode: "value", value: v, wasLiteral: false };
    }
    return { mode: "index", index: NaN, wasLiteral: true };
  }

  _evalIndexArg(argExpr, vars) {
    const t = argExpr.trim();
    if (/^-?\d+$/.test(t)) return { ok: true, index: parseInt(t, 10) };
    let m = t.match(/^(\w+)\.size\(\)\s*-\s*1$/);
    if (m) { const s = this.currentList.length; return { ok: true, index: s - 1 }; }
    m = t.match(/^(\w+)\.size\(\)$/);
    if (m) return { ok: true, index: this.currentList.length };
    if (/^[A-Za-z_]\w*$/.test(t) && vars && vars[t] !== undefined) return { ok: true, index: vars[t] };
    return { ok: false };
  }

  async evalExpr(expr, vars, ctx, capture = false) {
    const parts = this._splitTopPlus(expr);
    if (parts.length > 1) {
      const results = [];
      for (const p of parts) {
        const r = await this.evalExpr(p, vars, ctx, false);
        if (!r.ok) return r;
        results.push(r);
      }
      if (results.every((r) => r.type === "int")) return { ok: true, value: results.reduce((a, r) => a + r.value, 0), type: "int" };
      return { ok: true, value: results.map((r) => String(r.value)).join(""), type: "string" };
    }

    const t = expr.trim();
    if (/^".*"$/.test(t)) return { ok: true, value: t.slice(1, -1), type: "string" };
    if (/^-?\d+$/.test(t)) return { ok: true, value: parseInt(t, 10), type: "int" };

    let m = t.match(/^"([^"]*)"\.to(Upper|Lower)Case\(\)$/);
    if (m) {
      const out = m[2] === "Upper" ? m[1].toUpperCase() : m[1].toLowerCase();
      await this.miniPressStamp(m[1], out);
      return { ok: true, value: out, type: "string" };
    }
    m = t.match(/^(\w+)\.to(Upper|Lower)Case\(\)$/);
    if (m) {
      const recv = vars[m[1]];
      if (recv === undefined) return { ok: false, crash: "eval" };
      const out = m[2] === "Upper" ? String(recv).toUpperCase() : String(recv).toLowerCase();
      await this.miniPressStamp(String(recv), out);
      return { ok: true, value: out, type: "string" };
    }

    const removeMatch = t.match(/^(\w+)\.remove\((.*)\)$/);
    if (removeMatch) {
      const mode = this._resolveRemoveMode(removeMatch[2], vars);
      if (mode.mode === "value") {
        if (this.currentListType === "Integer") this.renderBoxedArgument(mode.value);
        const idx = await this.searchSweep(mode.value);
        if (idx === -1) {
          await this.notFoundFizzle();
          if (ctx) { ctx.removedAtIndex = null; ctx.removedThisIter = null; }
          return { ok: true, value: false, type: "boolean" };
        }
        const entry = await this.withdrawBook(idx, { skipLocate: true, capture });
        if (ctx) { ctx.removedAtIndex = null; ctx.removedThisIter = entry.value; }
        return { ok: true, value: entry.value, type: entry.type };
      }
      const idx = mode.index;
      if (mode.wasLiteral && this.currentListType === "Integer") this.flagArgumentAsIndex(idx);
      if (idx < 0 || idx >= this.currentList.length) {
        await this.crashWithdrawal(idx);
        return { ok: false, crash: "ioobe", index: idx };
      }
      const entry = await this.withdrawBook(idx, { capture });
      if (ctx) { ctx.removedThisIter = entry.value; ctx.removedAtIndex = mode.wasLiteral ? null : idx; }
      return { ok: true, value: entry.value, type: entry.type };
    }

    const getMatch = t.match(/^(\w+)\.get\((.*)\)$/);
    if (getMatch) {
      const arg = this._evalIndexArg(getMatch[2], vars);
      if (!arg.ok) return { ok: false, crash: "eval" };
      const idx = arg.index;
      if (idx < 0 || idx >= this.currentList.length) { await this.crashWithdrawal(idx); return { ok: false, crash: "ioobe", index: idx }; }
      const entry = await this.retrieveGhost(idx);
      return { ok: true, value: entry.value, type: entry.type };
    }

    const addMatch = t.match(/^(\w+)\.add\((.*)\)$/);
    if (addMatch) {
      const r = await this.evalExpr(addMatch[2], vars, ctx, false);
      if (!r.ok) return r;
      await this.addBookToShelf(r.value, r.type);
      return { ok: true, value: true, type: "boolean" };
    }

    if (/^[A-Za-z_]\w*$/.test(t)) {
      if (vars && vars[t] !== undefined) return { ok: true, value: vars[t], type: typeof vars[t] === "number" ? "int" : "string" };
      if (t === this.currentListName) return { ok: true, value: `[${this.currentList.map((e) => String(e.value)).join(", ")}]`, type: "string" };
      return { ok: false, crash: "eval" };
    }
    return { ok: false, crash: "eval" };
  }

  evalLoopCond(condExpr, vars) {
    const m = condExpr.trim().match(/^(\w+)\s*(<=|>=|<|>)\s*(\w+)(\.size\(\))?$/);
    if (!m) return false;
    const lhs = vars[m[1]] !== undefined ? vars[m[1]] : NaN;
    const rhs = m[4] ? this.currentList.length : (vars[m[3]] !== undefined ? vars[m[3]] : parseInt(m[3], 10));
    switch (m[2]) {
      case "<": return lhs < rhs;
      case "<=": return lhs <= rhs;
      case ">": return lhs > rhs;
      case ">=": return lhs >= rhs;
    }
    return false;
  }

  evalBooleanExpr(expr, vars) {
    const m = expr.trim().match(/^(\w+)\.get\((\w+)\)\.equals\("([^"]*)"\)$/);
    if (!m) return false;
    const idx = vars[m[2]] !== undefined ? vars[m[2]] : parseInt(m[2], 10);
    const entry = this.currentList[idx];
    return !!entry && String(entry.value) === m[3];
  }

  async execStatement(rawLine, vars, ctx) {
    const t = rawLine.trim();
    if (!t || t.startsWith("//") || t === "}") return { ok: true };

    const declPop = t.match(/^ArrayList<(\w+)>\s+(\w+)\s*=\s*\/\*.*\*\/;$/);
    if (declPop) { this.currentListName = declPop[2]; return { ok: true }; }

    const decrement = t.match(/^(\w+)--;$/);
    if (decrement) { vars[decrement[1]] = (vars[decrement[1]] || 0) - 1; return { ok: true }; }

    const declVar = t.match(/^(String|int)\s+(\w+)\s*=\s*(.*);$/);
    if (declVar) {
      if (declVar[3].trim() === "sc.nextLine()") {
        this.updateManifestStrip(`String ${declVar[2]} = sc.nextLine()`);
        const read = this.evaluateNextLine(this.tapeState);
        await this.tapeConsumeVisual(read.consumedCount);
        vars[declVar[2]] = read.rawValue;
        this.miniDispenseTo(declVar[2], read.rawValue, "string");
        await this.delay(90);
        return { ok: true };
      }
      if (declVar[3].trim() === "sc.nextInt()") {
        this.updateManifestStrip(`int ${declVar[2]} = sc.nextInt()`);
        const read = this.evaluateNextToken(this.tapeState);
        await this.tapeConsumeVisual(read.consumedCount);
        vars[declVar[2]] = parseInt(read.rawValue, 10) || 0;
        this.miniDispenseTo(declVar[2], vars[declVar[2]], "int");
        await this.delay(90);
        return { ok: true };
      }
      const r = await this.evalExpr(declVar[3], vars, ctx, true);
      if (!r.ok) return r;
      vars[declVar[2]] = r.value;
      return { ok: true };
    }

    const bareAdd = t.match(/^(\w+)\.add\(/);
    if (bareAdd) {
      const bm = t.match(/^(.*);$/);
      const r = await this.evalExpr(bm ? bm[1] : t, vars, ctx, false);
      if (!r.ok) return r;
      return { ok: true };
    }

    const printMatch = t.match(/^System\.out\.println\((.*)\);$/);
    if (printMatch) {
      this.updateManifestStrip("System.out.println(…)");
      const r = await this.evalExpr(printMatch[1], vars, ctx, false);
      if (!r.ok) return r;
      await this.printToTicker(String(r.value));
      return { ok: true };
    }

    const bare = t.match(/^(.*);$/);
    if (bare) {
      const r = await this.evalExpr(bare[1], vars, ctx, false);
      if (!r.ok) return r;
      return { ok: true };
    }
    return { ok: true };
  }

  _findBlockEnd(lines, openIdx) {
    let depth = 1;
    for (let j = openIdx + 1; j < lines.length; j++) {
      const t = lines[j].trim();
      if (t.endsWith("{")) depth++;
      else if (t === "}") { depth--; if (depth === 0) return j; }
    }
    return lines.length - 1;
  }

  async execForLoop(forMatch, lines, bodyStart, bodyEnd, vars) {
    const counter = forMatch[1];
    const condExpr = forMatch[3];
    const step = forMatch[4]; // '++' or '--'
    let iv = /size\(\)/.test(forMatch[2]) ? this.currentList.length - 1 : parseInt(forMatch[2], 10);
    let iterations = 0;
    while (iterations < 200) {
      if (!this._alive) return { ok: true };
      vars[counter] = iv;
      if (!this.evalLoopCond(condExpr, vars)) {
        if (iterations === 0) { this.appendTrackerRow(`${counter}=${iv} | size=${this.currentList.length} → condition false`); await this.delay(350); }
        break;
      }
      const sizeBefore = this.currentList.length;
      const ctx = { removedAtIndex: null, removedThisIter: null };
      const r = await this.runBlock(lines, bodyStart, bodyEnd, vars, ctx);
      if (!r.ok) {
        this.appendTrackerRow(`${counter}=${iv} | size=${sizeBefore} → ✗ crash`, true);
        return r;
      }
      if (ctx.removedThisIter !== null) this.appendTrackerRow(`${counter}=${iv} | size=${sizeBefore} → removed '${ctx.removedThisIter}'`);
      else this.appendTrackerRow(`${counter}=${iv} | size=${sizeBefore} → kept`);

      const postBody = vars[counter];
      const nextIv = step === "--" ? postBody - 1 : postBody + 1;
      if (step === "++" && ctx.removedAtIndex === iv && this.currentList.length > iv && nextIv !== iv) {
        this.showSkippedFlag(iv);
      }
      iv = nextIv;
      iterations++;
      await this.delay(220);
    }
    return { ok: true };
  }

  async runBlock(lines, i0, i1, vars, ctx) {
    let i = i0;
    while (i < i1) {
      if (!this._alive) return { ok: true };
      const raw = lines[i];
      const t = raw.trim();
      if (!t || t.startsWith("//") || t === "}") { i++; continue; }

      const forMatch = t.match(/^for \(int (\w+) = ([\w.()]+(?:\s*-\s*1)?); (.*); \1(\+\+|--)\) \{$/);
      if (forMatch) {
        const end = this._findBlockEnd(lines, i);
        const r = await this.execForLoop(forMatch, lines, i + 1, end, vars);
        if (!r.ok) return r;
        i = end + 1;
        continue;
      }
      const ifMatch = t.match(/^if \((.*)\) \{$/);
      if (ifMatch) {
        const end = this._findBlockEnd(lines, i);
        if (this.evalBooleanExpr(ifMatch[1], vars)) {
          const r = await this.runBlock(lines, i + 1, end, vars, ctx);
          if (!r.ok) return r;
        }
        i = end + 1;
        continue;
      }
      const r = await this.execStatement(raw, vars, ctx);
      if (!r.ok) return r;
      i++;
    }
    return { ok: true };
  }

  async runProgram(items) {
    const lines = items.map((it) => it.text);
    for (let li = 0; li < lines.length; li++) if (lines[li].trim() && !lines[li].trim().startsWith("//") && !/^import/.test(lines[li].trim()) && !/^Scanner sc/.test(lines[li].trim())) { this.highlightCodeLine(li); break; }
    const result = await this.runBlock(lines, 0, lines.length, {}, null);
    this.highlightCodeLine(null);
    return result;
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

    if (mission.boxedSlot) {
      this.boxedRemoveProactive[`mission${mission.mission}`] = this._slotCode(mission.boxedSlot) === mission.boxedForm;
    }
    if (mission.flagshipSlot) {
      const headerCode = this._slotCode("header");
      const bodyCode = this._slotCode("body");
      const isBackward = headerCode === "int i = stock.size() - 1; i >= 0; i--";
      const isForwardCompensated = bodyCode.includes("i--");
      const isByValue = bodyCode.trim() === 'stock.remove("damaged");';
      this.safeLoopProactive.mission4 = isBackward || isForwardCompensated || isByValue;
      this.safeLoopFormChoice.mission4 = isBackward ? "backward" : isForwardCompensated ? "forward_compensated" : isByValue ? "by_value" : "unsafe";
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
    this.pulseCrest("session");

    const items = this.buildProgramItems(mission, assembled);
    const compileResult = this.compileCheckProgram(mission, items, assembled);
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
    const resultKind = anyMismatch ? (anyCrash ? "runtime_crash" : "logic_fail") : "pass";
    this._resolveRunOutcome(mission, resultKind, wrongBlocksUsed, failedTests, null);
  }

  async runTestCase(mission, test, index, items) {
    this.clearShelf();
    this.setShelfType(mission.listJavaType);
    this.clearCrate();
    this.clearTicker();
    this.clearTracker();
    this.parkCameos();
    this.updateRemovedRow(null, null);
    this.loadMiniTape(test.input);
    await this.populateShelf(test.initialList || [], mission.listJavaType);
    if (!this._alive) return { match: false, crashed: false };
    this.fillBeforeRow();

    const runResult = await this.runProgram(items);
    if (!this._alive) return { match: false, crashed: false };
    this.fillAfterRow();

    const output = this._tickerLines.join("⏎");
    const hasOutput = test.expectedOutput !== undefined;
    const outMatch = !hasOutput || output === test.expectedOutput;

    let listMatch = true;
    if (test.expectedList) {
      const actual = this.currentList.map((e) => String(e.value));
      const expected = test.expectedList.map(String);
      listMatch = actual.length === expected.length && actual.every((v, i) => v === expected[i]);
    }
    const match = runResult.ok && outMatch && listMatch;
    this.verdictLamp.setFillStyle(match ? C_GREEN_BRIGHT : C_RED);
    this.updateReportRow(index, outMatch, runResult.ok ? listMatch : false, hasOutput);
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
      GameManager.fusionEngine.checkBehavioral(prediction);
    } catch (e) {
      console.warn("Level54Scene: /api/wellbeing/predict-struggle unreachable, skipping behavioral signal for this level:", e);
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
    this.pulseCrest("idle");

    let livesLostThisRun = false;
    const tagsThisRun = new Set(wrongBlocksUsed.map((b) => b.tag));
    tagsThisRun.forEach((tag) => {
      if (!tag) return;
      this.wrongBlockHistory[tag] = (this.wrongBlockHistory[tag] || 0) + 1;
      if (this.wrongBlockHistory[tag] >= 2) livesLostThisRun = true;
    });

    const feedbackTag = compileTag || (wrongBlocksUsed[0] && wrongBlocksUsed[0].tag);

    (async () => {
      if (livesLostThisRun) {
        const dead = this.loseLife();
        if (dead) { this.time.delayedCall(500, () => this.gameOver()); return; }
      }
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

  onMissionComplete() {
    if (this.currentMission === 2) this.runBehavioralCheck();
    if (this.gameEnded) return;
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
    this.pulseCrest("gold");
    await this.ringBell(1);
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
    await this.bitSay(mission.postMissionNote || "Clean curation — the rig confirms it.");
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

    (async () => {
      this.tweens.add({ targets: this.bellContainer, alpha: 0.3, duration: 700 });
      this.pulseCrest("idle");
      this._ladders.forEach((l) => this.tweens.add({ targets: l, alpha: 0.15, duration: 700 }));
      this._trolleyBooks.forEach((b) => this.tweens.add({ targets: b, alpha: 0.05, duration: 700 }));
      const motes = this.ambient;
      this.ambient = null;
      (motes || []).forEach((m) => this.tweens.add({ targets: m, y: 632, alpha: 0, duration: 1500, ease: "Sine.easeIn" }));

      const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
      this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });
      const title = this.add.text(640, 240, "RESHELVING HALTED", { font: "bold 34px Georgia", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
      this.tweens.add({ targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut", onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }) });
      this.add.text(640, 310, `Score: ${this.score}`, { font: "21px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
      this.add.text(640, 350, `Missions Completed: ${this.currentMission} / ${MISSIONS.length}`, { font: "18px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);
      this._makeButton(525, 420, "RESUME THE RESHELVING", 200, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
      this._makeButton(755, 420, "RETURN TO MENU", 200, 50, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.start("MenuScene"));
    })();
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearMission();
    this.hideBubble();

    try { GameManager.completeLevel(53, Math.round((this.flawlessCount / MISSIONS.length) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("arraylist_remove_mastery"); } catch (_) {}
    try { BadgeSystem.unlock("arraylist_wing_seal"); } catch (_) {}
    try {
      localStorage.setItem("level54_results", JSON.stringify({
        level: 54, concept: "arraylist_remove", phase: "restructuring",
        score: this.score, missionsCompleted: 6, flawlessMissions: this.flawlessCount,
        totalRuns: this.runCount, failedRuns: this.failedRunCount, hintsUsed: this.hintCount,
        selfCorrections: this.selfCorrectionCount, safeLoopRemovalProactively: this.safeLoopProactive,
        safeLoopFormChoice: this.safeLoopFormChoice, boxedRemoveProactively: this.boxedRemoveProactive,
        crossWingCleanFirstRun: this.crossWingCleanFirstRun,
        livesRemaining: this.lives, attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.triggerWingFinaleCeremony();
  }

  // ══════════════════════════════════════════════════════════════
  // THE ARRAYLIST WING SEAL CEREMONY (5 phases, the L45 pattern)
  // ══════════════════════════════════════════════════════════════

  async triggerWingFinaleCeremony() {
    await this.ceremonyPhase1_Fanfare();
    if (!this._alive) return;
    await this.ceremonyPhase2_StationsAssemble();
    if (!this._alive) return;
    await this.ceremonyPhase3_CentralPanel();
    if (!this._alive) return;
    await this.ceremonyPhase4_WingSeal();
    if (!this._alive) return;
    await this.ceremonyPhase5_BitClosingAddress();
  }

  async ceremonyPhase1_Fanfare() {
    await this.ringBell(3);
    // the crest detaches and floats toward center stage, growing
    this._crestFloating = this.add.container(880, 56).setDepth(88);
    this.tweens.add({ targets: this.crestContainer, alpha: 0, duration: 400 });
    const cg = this.add.graphics();
    cg.lineStyle(3, C_GOLD, 0.9);
    cg.beginPath();
    cg.moveTo(-20, -24); cg.lineTo(20, -24); cg.lineTo(20, 8); cg.lineTo(0, 24); cg.lineTo(-20, 8);
    cg.closePath();
    cg.strokePath();
    cg.lineStyle(1.3, C_CYAN, 0.8);
    cg.strokeRect(-8, -18, 16, 6);
    cg.lineStyle(1.3, C_GOLD, 0.8);
    cg.strokeCircle(0, -2, 5);
    cg.lineBetween(3, 1, 7, 5);
    cg.lineStyle(1.3, C_STAMP_RED, 0.8);
    cg.strokeRect(-6, 10, 12, 6);
    this._crestFloating.add(cg);
    this.tweens.add({ targets: this._crestFloating, x: 640, y: 220, scale: 1.6, duration: 900, ease: "Sine.easeInOut" });

    // the back bookcase's gaps fill
    const spineColors = [0x8a6435, 0x3a2618, 0xc8a05a, 0x6d4c41];
    (this._gapCells || []).forEach(({ cx, cy }, i) => {
      this.time.delayedCall(i * 90, () => {
        if (!this._gapFillGfx) return;
        let x = cx + 14;
        while (x < cx + 54) {
          const bw = Phaser.Math.Between(4, 7);
          this._gapFillGfx.fillStyle(Phaser.Utils.Array.GetRandom(spineColors), 0);
          this._gapFillGfx.fillRect(x, cy + 54 - Phaser.Math.Between(18, 34), bw, Phaser.Math.Between(18, 34));
          x += bw + 3;
        }
      });
    });
    this._gapFillGfx.setAlpha(0);
    this.tweens.add({ targets: this._gapFillGfx, alpha: 0.22, duration: 900, delay: 400 });

    this._trolleyBooks.forEach((b, i) => this.tweens.add({ targets: b, alpha: 0.6, duration: 200, delay: i * 40, yoyo: true }));
    const motes = this.ambient;
    if (motes) motes.forEach((m) => this.tweens.add({ targets: m, y: m.y - 150, alpha: 0.1, duration: 900, ease: "Sine.easeOut" }));
    await this.delay(1200);
  }

  async ceremonyPhase2_StationsAssemble() {
    this._trilogyStations = this.add.container(0, 0).setDepth(88);
    const positions = [[420, 420], [860, 420], [640, 560]];
    const drawers = [
      (g) => { // L46 bookshelf
        g.lineStyle(1.5, C_CYAN, 0.9);
        g.strokeRect(-20, -22, 40, 44);
        for (let i = 0; i < 3; i++) g.lineBetween(-20, -22 + (i + 1) * 11, 20, -22 + (i + 1) * 11);
      },
      (g) => { // L49 consultation desk — ghost mid-lift
        g.lineStyle(1.5, C_GOLD, 0.9);
        g.strokeRoundedRect(-22, 0, 44, 20, 3);
        g.fillStyle(C_GOLD, 0.35);
        g.fillRoundedRect(-12, -22, 24, 18, 2);
      },
      (g) => { // L52 crate + stamp
        g.lineStyle(1.5, C_STAMP_RED, 0.9);
        g.strokeRoundedRect(-22, -6, 44, 26, 3);
        g.fillStyle(C_STAMP_RED, 0.5);
        g.fillRect(-4, -22, 8, 14);
      },
    ];
    for (let i = 0; i < 3; i++) {
      const [tx, ty] = positions[i];
      const c = this.add.container(tx, -60);
      const bg = this.add.graphics();
      bg.fillStyle(0x1a1108, 0.92);
      bg.lineStyle(2, C_GOLD, 0.8);
      bg.fillCircle(0, 0, 34);
      bg.strokeCircle(0, 0, 34);
      const icon = this.add.graphics();
      drawers[i](icon);
      c.add([bg, icon]);
      this._trilogyStations.add(c);
      this.tweens.add({ targets: c, y: ty, duration: 500, delay: i * 300, ease: "Back.easeOut" });
    }
    await this.delay(1900);
  }

  async ceremonyPhase3_CentralPanel() {
    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
    this.tweens.add({ targets: ov, fillAlpha: 0.85, duration: 500 });
    this._ceremonyOverlay = ov;

    const panel = this.add.graphics().setDepth(90);
    panel.fillStyle(0x1a0e05, 1);
    panel.fillRoundedRect(320, 65, 640, 540, 16);
    panel.lineStyle(2, C_GOLD, 1);
    panel.strokeRoundedRect(320, 65, 640, 540, 16);
    this._ceremonyPanel = panel;
    this._ceremonyElements = [panel];

    const title = this.add.text(640, 100, "GRAND RESHELVER", { font: "bold 34px Georgia", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(91).setScale(0);
    this.tweens.add({ targets: title, scale: 1, duration: 350, ease: "Back.easeOut" });
    this._ceremonyElements.push(title);

    const safeLoopStr = this.safeLoopProactive.mission4 ? "✓" : "✗";
    const boxedStr = this.boxedRemoveProactive.mission3 ? "✓" : "✗";
    const crossWingCount = Object.values(this.crossWingCleanFirstRun).filter(Boolean).length;
    const lines = [
      "MISSIONS: 6/6", `FLAWLESS: ${this.flawlessCount}`, `SELF-CORRECTIONS: ${this.selfCorrectionCount}`,
      `SAFE-PURGE PROACTIVE: ${safeLoopStr}`, `BOXED-ORDER PROACTIVE: ${boxedStr}`,
      `CROSS-WING CLEAN: ${crossWingCount}/2`, `HINTS: ${this.hintCount}`,
    ];
    lines.forEach((s, i) => {
      const t = this.add.text(480, 148 + i * 24, s, { font: "15px Arial", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 250, delay: 300 + i * 130 });
      this._ceremonyElements.push(t);
    });
    const totalText = this.add.text(480, 148 + 7 * 24, "TOTAL: 0", { font: "bold 21px Arial", color: HEX_GOLD }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: totalText, alpha: 1, duration: 250, delay: 1200 });
    const counter = { v: 0 };
    this.tweens.add({ targets: counter, v: this.score, duration: 1000, delay: 1200, onUpdate: () => totalText.setText(`TOTAL: ${Math.round(counter.v)}`) });
    this._ceremonyElements.push(totalText);

    const stars = this._starRating();
    for (let i = 0; i < 3; i++) {
      const earned = i < stars;
      const s = this.add.text(640 + (i - 1) * 60, 372, "★", { font: "34px Arial", color: earned ? HEX_GOLD : "#2a3040" }).setOrigin(0.5).setDepth(91).setScale(0);
      this.tweens.add({ targets: s, scale: 1, duration: 250, delay: 1700 + i * 200, ease: earned ? "Back.easeOut" : "Cubic.easeOut" });
      this._ceremonyElements.push(s);
    }

    // trilogy badge — stamp (L52), pocket watch (L53), shelf keys (L54)
    const badge = this.add.container(640, 445).setDepth(91).setAlpha(0);
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillCircle(0, 0, 34);
    bg.lineStyle(3, C_GOLD, 1);
    bg.strokeCircle(0, 0, 34);
    bg.fillStyle(0x241a0e, 1);
    bg.lineStyle(1, C_BRASS, 0.8);
    bg.fillRect(-16, -14, 6, 10);
    bg.fillRoundedRect(-19, -4, 12, 6, 1);
    bg.lineStyle(2, C_BRASS, 1);
    bg.strokeCircle(2, -2, 12);
    bg.lineStyle(2, C_BRASS, 1);
    bg.strokeCircle(16, 4, 5);
    bg.lineBetween(16, 9, 16, 16);
    badge.add(bg);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 2100 });
    const badgeLbl = this.add.text(640, 488, "remove() MASTERY", { font: "bold 15px Georgia", color: HEX_GOLD }).setOrigin(0.5).setDepth(91).setAlpha(0);
    const badgeSub = this.add.text(640, 504, "Accretion ✓  Tuning ✓  Restructuring ✓", { font: "12px Arial", color: "#78909c" }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: [badgeLbl, badgeSub], alpha: 1, duration: 300, delay: 2200 });
    this._ceremonyElements.push(badge, badgeLbl, badgeSub);

    await this.delay(2600);
  }

  async ceremonyPhase4_WingSeal() {
    const ribbon = this.add.container(640 - 500, 545).setDepth(92);
    const rg = this.add.graphics();
    rg.fillStyle(0x1a1a2e, 1);
    rg.lineStyle(3, C_GOLD, 1);
    rg.fillRoundedRect(-225, -35, 450, 70, 6);
    rg.strokeRoundedRect(-225, -35, 450, 70, 6);
    const wingTitle = this.add.text(0, -20, "ARRAYLIST WING — COMPLETE", { font: "bold 18px Georgia", color: HEX_GOLD }).setOrigin(0.5);
    ribbon.add([rg, wingTitle]);
    this._ceremonyElements.push(ribbon);

    await new Promise((res) => { this.tweens.add({ targets: ribbon, x: 640, duration: 500, ease: "Back.easeOut", onComplete: res }); });

    const methods = [
      { label: "add() ✓" },
      { label: "get() ✓" },
      { label: "remove() ✓" },
    ];
    for (let i = 0; i < methods.length; i++) {
      if (!this._alive) return;
      const t = this.add.text(ribbon.x - 150 + i * 150, ribbon.y + 8, methods[i].label, { font: "bold 15px Arial", color: "#2a3040" }).setOrigin(0.5).setDepth(93);
      this._ceremonyElements.push(t);
      await this.delay(400);
      t.setColor(HEX_GREEN_BRIGHT);
      this.createConfetti(t.x, t.y, 8);
      this.tweens.add({ targets: t, scale: 1.2, duration: 150, yoyo: true });
    }

    const caption = this.add.text(640, 600, "9 levels · 3 methods · 1 living collection", { font: "italic 13px Georgia", color: HEX_BRASS }).setOrigin(0.5).setDepth(93).setAlpha(0);
    this.tweens.add({ targets: caption, alpha: 0.85, duration: 300 });
    this._ceremonyElements.push(caption);

    // the floating crest locks into the banner's center
    if (this._crestFloating) {
      await new Promise((res) => { this.tweens.add({ targets: this._crestFloating, x: 640, y: 545, scale: 0.7, duration: 500, ease: "Sine.easeIn", onComplete: res }); });
      this.tweens.add({ targets: this._crestFloating, scale: 0.5, duration: 90, yoyo: true });
      const ring = this.add.circle(640, 545, 10, C_GOLD, 0.6).setDepth(94);
      this.tweens.add({ targets: ring, scale: 8, alpha: 0, duration: 400, onComplete: () => ring.destroy() });
      this.cameras.main.shake(120, 0.003);
    }

    this.createGoldCyanRedConfetti(640, 300, 50);
    if (this._trilogyStations) {
      this.tweens.add({ targets: this._trilogyStations.list, scale: 0.85, duration: 500, ease: "Sine.easeInOut" });
    }
    await this.delay(1200);
  }

  async ceremonyPhase5_BitClosingAddress() {
    this.bit.setPosition(W + 100, 500);
    this.bit.setVisible(true);
    await new Promise((res) => { this.tweens.add({ targets: this.bit, x: 640, duration: 500, ease: "Cubic.easeOut", onComplete: res }); });
    await this.bitSay("Nine levels of the ArrayList Wing — add() filed them, get() read them without ever disturbing one, remove() let them go with the gap closed behind. You can build a collection, walk it, guard its edges, and curate it — that's not three methods, Reshelver. That's a LIVING LIST, and it answers to you. The Archive stands reshelved. The next wing waits past those doors.");
    if (!this._alive) return;
    await Promise.race([this.waitForClick(), this.delay(6500)]);
    this.hideBubble();

    this._makeButton(500, 610, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(780, 610, "NEXT WING →", 240, 44, { fill: 0x00733a, stroke: C_GOLD, textColor: "#ffffff" }, () => {
      this.scene.start("MenuScene");
    });
  }

  _starRating() {
    if (this.flawlessCount >= 4 && this.hintCount <= 1) return 3;
    if (this.failedRunCount <= 3) return 2;
    return 1;
  }

  showScoreTally() {}

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
