/**
 * Level 52 — "The Deaccession Office" (ArrayList Methods: Accretion Phase
 * — remove(), opening the wing's final trilogy)
 * ===========================================================================
 * Teaches ArrayList.remove(): the method that TAKES. A withdrawal order
 * names an index; the book itself — fully opaque, no ghost — lifts off
 * the shelf, receives the red WITHDRAWN stamp, and lands in the
 * deaccession crate. Then THE GAP CLOSES: every book above slides DOWN
 * one shelf (the exact mirror of L47's insertion shift-up), the index
 * labels renumber on landing, and the size ticks down.
 *
 * The level's crowning event is the get-vs-remove discrimination — the
 * three-level payoff of the get_removes_element_belief tag seeded at the
 * Consultation Desk (L49): the tutorial plays the L49 ghost retrieval
 * and the first withdrawal back to back on the same index, and rounds
 * 5/9/10/11 keep both behaviors honestly coexisting in one evaluator
 * (get() reads and never mutates; remove() splices and returns).
 * Remove-by-value sweeps from index 0 for the FIRST match and returns
 * false (no crash) when nothing matches; invalid indices crash with the
 * same IOOBE choreography get() taught. The Integer remove(2) overload
 * ambiguity is deliberately reserved for L53.
 */

import Phaser from "phaser";
import { GameManager } from "../../../GameManager.js";
import { BadgeSystem } from "../../../BadgeSystem.js";

const W = 1280, H = 720;

const C_CYAN = 0x4fc3f7, C_GOLD = 0xffd740, C_ORANGE = 0xff9800, C_VIOLET = 0xb39ddb;
const C_GREEN_BRIGHT = 0x00e676, C_RED = 0xf44336, C_GRAY = 0x78909c, C_BRASS = 0xc8a05a;
const C_STAMP_RED = 0xc62828;
const HEX_CYAN = "#4fc3f7", HEX_GOLD = "#ffd740", HEX_ORANGE = "#ff9800", HEX_VIOLET = "#b39ddb";
const HEX_GREEN_BRIGHT = "#00e676", HEX_RED = "#f44336", HEX_GRAY = "#78909c", HEX_BRASS = "#c8a05a";
const HEX_STAMP_RED = "#c62828";

const SHELF_X0 = 60, SHELF_X1 = 440, SHELF_Y0 = 130, SHELF_Y1 = 610;
const SHELF_CX = (SHELF_X0 + SHELF_X1) / 2;
const SHELF_BASE_Y = 550, SHELF_STEP = 50;
const CRATE = { x0: 490, y0: 360, x1: 740, y1: 470 };
const CRATE_CX = (CRATE.x0 + CRATE.x1) / 2;
const CHUTE = { x: 740, y: 335 };
const STAMP_HOME = { x: 775, y: 440 };
const ORDER_POS = { x: 620, y: 293 };
const CONSOLE_POS = { x: 492, y: 341 };
const PANEL_X = 810, PANEL_Y = 130, PANEL_W = 420, PANEL_H = 250;
const TUTORIAL_KEY = "level52_tutorial_done";

// ══════════════════════════════════════════════════════════════
// ROUND CONFIGURATION
// ══════════════════════════════════════════════════════════════
const ROUNDS = [
  // ── Type A: Withdrawal Prediction ──
  { round: 1, type: "predict",
    initialList: ["Dune", "Emma", "Ivanhoe"], listType: "String", listName: "list",
    source: ["list.remove(1);"],
    question: "What is the list state AFTER this line?", correct: "[Dune, Ivanhoe]",
    options: [
      { value: "[Dune, Ivanhoe]", tag: null, label: "[Dune, Ivanhoe] — gap closed" },
      { value: "[Dune, null, Ivanhoe]", tag: "remove_leaves_null_belief", label: "[Dune, null, Ivanhoe]" },
      { value: "[Dune, Emma, Ivanhoe]", tag: "get_removes_element_belief", label: "unchanged — remove only reads" },
      { value: "[Emma]", tag: "remove_keeps_only_removed_belief", label: "[Emma]" },
    ],
    revealNote: "The book leaves, the stamp thumps, Ivanhoe slides down. Size 3 → 2. This is the taking method — the contrast with get()'s ghost is the whole lesson.",
    concept: "basic_remove_by_index" },

  { round: 2, type: "predict",
    initialList: [10, 20, 30], listType: "Integer", listName: "nums",
    source: ["nums.remove(0);"],
    question: "What is the SIZE after this line?", correct: "2",
    options: [
      { value: "2", tag: null },
      { value: "3", tag: "size_unchanged_after_remove_belief" },
      { value: "0", tag: "remove_clears_list_belief" },
      { value: "1", tag: "remove_takes_two_belief" },
    ],
    concept: "size_after_remove" },

  { round: 3, type: "predict",
    initialList: ["Ada", "Grace"], listType: "String", listName: "list",
    source: ["String taken = list.remove(0);"],
    question: "What is stored in taken?", correct: "Ada",
    options: [
      { value: "Ada", tag: null },
      { value: "true", tag: "remove_returns_boolean_belief" },
      { value: "0", tag: "remove_returns_index_belief" },
      { value: "Grace", tag: "remove_returns_survivor_belief" },
    ],
    revealNote: "The value pops off the departing book and lands in the chute — remove() returns WHAT IT TOOK. The list is [Grace]; taken is 'Ada'.",
    concept: "remove_returns_element" },

  // ── Type B: The Gap Close & Shifting Indices ──
  { round: 4, type: "predict",
    initialList: ["A", "B", "C", "D"], listType: "String", listName: "list",
    source: ["list.remove(1);"],
    question: "AFTER this line, what is at index 1?", correct: "C",
    options: [
      { value: "C", tag: null },
      { value: "B", tag: "get_removes_element_belief" },
      { value: "(empty)", tag: "remove_leaves_gap_belief" },
      { value: "D", tag: "remove_shifts_two_belief" },
    ],
    revealNote: "B departs; C slides DOWN from index 2 into index 1; D follows into 2. The renumbering is the removal's second act — never forget it.",
    concept: "index_shift_after_remove" },

  { round: 5, type: "predict",
    initialList: ["A", "B", "C"], listType: "String", listName: "list",
    source: ["list.remove(1);", "System.out.println(list.get(1));"],
    question: "What prints?", correct: "C",
    options: [
      { value: "C", tag: null },
      { value: "B", tag: "indices_stable_after_remove_belief" },
      { value: "crash", tag: "gap_crashes_get_belief", label: "IndexOutOfBoundsException" },
      { value: "null", tag: "remove_leaves_null_belief" },
    ],
    revealNote: "The two-step probe: remove(1) takes B and C slides into index 1 — so get(1) fetches C. Code that remembers the OLD indices after a removal reads the wrong books. This is the most practical removal lesson in real Java.",
    concept: "get_after_remove" },

  { round: 6, type: "predict",
    initialList: ["A", "B", "C", "D"], listType: "String", listName: "list",
    source: ["list.remove(0);", "list.remove(0);"],
    question: "What is the list state after BOTH lines?", correct: "[C, D]",
    options: [
      { value: "[C, D]", tag: null, label: "[C, D]" },
      { value: "[B, D]", tag: "indices_stable_after_remove_belief", label: "[B, D] — removed A then C?" },
      { value: "[C]", tag: "remove_takes_two_belief", label: "[C]" },
      { value: "[A, B]", tag: "remove_from_end_belief", label: "[A, B]" },
    ],
    revealNote: "Two withdrawals at the SAME index: the first takes A (B, C, D slide down); the second remove(0) takes... B, who just arrived at index 0! The gap-close means repeated remove(0) eats the list front-to-back.",
    concept: "repeated_remove_same_index" },

  // ── Type C: By-Value & Boundaries ──
  { round: 7, type: "predict",
    initialList: ["Ada", "Grace", "Ada"], listType: "String", listName: "list",
    source: ['list.remove("Ada");'],
    question: "What is the list state after this line?", correct: "[Grace, Ada]",
    options: [
      { value: "[Grace, Ada]", tag: null, label: "[Grace, Ada] — first match only" },
      { value: "[Grace]", tag: "remove_by_value_removes_all_belief", label: "[Grace] — all Adas removed" },
      { value: "[Ada, Grace]", tag: "remove_by_value_from_end_belief", label: "[Ada, Grace] — last match removed" },
      { value: "crash", tag: "remove_by_value_invalid_belief", label: "COMPILE ERROR" },
    ],
    revealNote: "The sweep climbs from shelf 0 and stops at the FIRST Ada. One order, one book. The second Ada survives at what is now index 1.",
    concept: "remove_by_value_first_match" },

  { round: 8, type: "predict",
    initialList: ["Dune", "Emma"], listType: "String", listName: "list",
    source: ['list.remove("Hamlet");'],
    question: "What happens?", correct: "no_change_returns_false",
    options: [
      { value: "no_change_returns_false", tag: null, label: "Nothing removed — returns false, list unchanged" },
      { value: "crash", tag: "remove_by_value_not_found_crashes_belief", label: "Runtime exception" },
      { value: "removes_first", tag: "remove_fallback_first_belief", label: "Removes 'Dune' as a fallback" },
      { value: "compile_error", tag: "runtime_vs_compile_confusion", label: "COMPILE ERROR" },
    ],
    revealNote: "The sweep climbs the whole shelf and fizzles at the top — NOT FOUND, no change, returns false. By-value removal is the gentle overload: no match, no harm. (By-INDEX is the strict one — wrong index, crash.)",
    concept: "remove_by_value_not_found" },

  { round: 9, type: "predict",
    initialList: ["A", "B", "C"], listType: "String", listName: "list",
    source: ["String x = list.get(0);", "String y = list.remove(0);"],
    question: "What is the list state after BOTH lines?", correct: "[B, C]",
    options: [
      { value: "[B, C]", tag: null, label: "[B, C] — get read, remove took" },
      { value: "[C]", tag: "get_removes_element_belief", label: "[C] — both calls removed" },
      { value: "[A, B, C]", tag: "remove_only_reads_belief", label: "unchanged — both only read" },
      { value: "[B]", tag: "remove_takes_two_belief", label: "[B]" },
    ],
    revealNote: "THE DISCRIMINATION ROUND — the wing's arc resolves here. The ghost lifts for get (A stays); the solid book leaves for remove (A departs, B and C slide down). Both x and y hold 'A' — but only ONE of the calls changed the shelf. Look, then take: two different verbs.",
    concept: "get_vs_remove_discrimination" },

  // ── Type D: Deaccession Command ──
  { round: 10, type: "command",
    initialList: ["Iliad", "Odyssey", "Aeneid"], listType: "String", listName: "list",
    skeleton: ["<slot:call>"],
    mission: 'Withdraw "Odyssey" — by INDEX. Final shelf: [Iliad, Aeneid]',
    slots: [{ id: "call", hint: "the withdrawal" }],
    cartridges: [
      { code: "list.remove(1);", correct: true },
      { code: "list.remove(2);", tag: "index_starts_at_one_belief" },
      { code: "list.get(1);", tag: "get_removes_element_belief" },
      { code: 'list.remove("1");', tag: "index_as_string_belief" },
    ],
    tests: [
      { expectedList: ["Iliad", "Aeneid"] },
    ],
    revealNote: "The get() distractor plays its honest ghost — and the report shows the shelf UNCHANGED: reading never withdraws. The final proof of the wing's discrimination.",
    concept: "command_remove_by_index" },

  { round: 11, type: "command",
    initialList: [5, 10, 15, 20], listType: "Integer", listName: "nums",
    skeleton: ["int taken = <slot:call>;", 'System.out.println("Removed: " + taken);'],
    mission: "Withdraw the LAST element (size-proof!) and announce it. For [5, 10, 15, 20]:  Removed: 20",
    slots: [{ id: "call", hint: "the withdrawal (size-proof)" }],
    cartridges: [
      { code: "nums.remove(nums.size() - 1)", correct: true },
      { code: "nums.remove(3)", tag: "hardcoded_last_index" },
      { code: "nums.remove(nums.size())", tag: "remove_at_size_valid_belief" },
      { code: "nums.get(nums.size() - 1)", tag: "get_removes_element_belief" },
    ],
    tests: [
      { initialList: [5, 10, 15, 20], expectedOutput: "Removed: 20", expectedList: [5, 10, 15] },
      { initialList: [7, 9], expectedOutput: "Removed: 9", expectedList: [7] },
    ],
    revealNote: "size() − 1 — the same size-proof reflex from the get() trilogy, now armed with a stamp. The get() distractor prints the right VALUE but leaves the shelf untouched — the list check catches the difference between looking and taking.",
    concept: "command_remove_last_sizeproof" },

  { round: 12, type: "command",
    initialList: ["draft", "final", "draft"], listType: "String", listName: "list",
    skeleton: ["<slot:call1>", "<slot:call2>"],
    mission: 'Withdraw BOTH "draft" copies by VALUE. Final shelf: [final]',
    slots: [
      { id: "call1", hint: "first withdrawal" },
      { id: "call2", hint: "second withdrawal" },
    ],
    cartridges: [
      { code: 'list.remove("draft");', correct: true },
      { code: 'list.remove("draft");', correct: true },
      { code: 'list.remove("final");', tag: "wrong_target_value" },
      // Tagged per the spec's inline correction: after the first by-value
      // removal the list is ["final","draft"], so remove(0) takes "final"
      // — a failing, demonstrated outcome. NOT alsoCorrect.
      { code: "list.remove(0);", tag: "index_after_shift_unplanned" },
    ],
    tests: [
      { expectedList: ["final"] },
    ],
    revealNote: "Two sweeps: the first takes the draft at index 0 (the others slide down); the second sweep finds the remaining draft — now at index 1 — and takes it. By-value removal doesn't care that the indices shifted; it hunts the VALUE.",
    postMissionNote: "Same order, twice — each sweep takes the first match it finds, wherever the shifts have moved it. When you're hunting VALUES, let the sweep do the finding.",
    concept: "command_remove_all_matches_by_value" },
];

const MISCONCEPTION_FEEDBACK = {
  get_removes_element_belief: "You watched both animations — the ghost lifts and the original STAYS for get; the book itself LEAVES for remove. Look, then take: two verbs, two methods. The shelf only changes when you stamp.",
  remove_leaves_null_belief: "No holes in an ArrayList — the gap closes the instant the book departs. Everything above slides down one; the list is always packed tight.",
  remove_leaves_gap_belief: "No holes in an ArrayList — the gap closes the instant the book departs. Everything above slides down one; the list is always packed tight.",
  remove_shifts_up_belief: "The shift goes DOWN — toward the gap. Insertion pushed books up to make room; removal pulls them down to close it. Mirror images.",
  remove_shifts_two_belief: "Each book above the gap slides down exactly ONE shelf — the order is preserved, only the numbers change.",
  indices_stable_after_remove_belief: "The renumbering is the removal's second act — the book that lived at index 2 lives at index 1 now. Old index maps lie after a removal; re-read the shelf.",
  gap_crashes_get_belief: "The gap is gone before your next line runs — the shelf re-packs instantly. get(1) on the shrunken list reads whatever slid into index 1.",
  remove_returns_boolean_belief: "remove(INDEX) returns the ELEMENT it took. (The by-VALUE overload is the one that returns true/false.) Know which order you filed.",
  remove_returns_index_belief: "The return is the book, not the shelf number — remove(0) on [Ada, Grace] hands you 'Ada'.",
  remove_returns_survivor_belief: "The return is the book that DEPARTED — the survivors stay on the shelf, unreturned.",
  remove_at_size_valid_belief: "The same cliff as get and charAt — size is one PAST the last shelf. remove(size) crashes on every list, every time.",
  size_unchanged_after_remove_belief: "The counter ticked down before your eyes — every removal shrinks the size by exactly one.",
  remove_clears_list_belief: "One order, one book. remove() takes exactly the element you named — the rest slide down and stay.",
  remove_takes_two_belief: "One order, one book. remove() takes exactly the element you named — the rest slide down and stay.",
  remove_keeps_only_removed_belief: "The removed book goes to the CRATE — the shelf keeps everything else. You named what leaves, not what stays.",
  remove_by_value_removes_all_belief: "The sweep stops at the FIRST match — one order, one withdrawal. To take every copy, file the order again.",
  remove_by_value_from_end_belief: "The sweep climbs from shelf 0 — the LOWEST match goes first, always.",
  remove_by_value_invalid_belief: "Removing by value is perfectly legal Java for Strings — the sweep hunts the first equal element. No compile error here.",
  remove_by_value_not_found_crashes_belief: "By-value is the gentle overload — no match, no harm, returns false. Only the INDEX overload crashes on bad input.",
  remove_fallback_first_belief: "No fallbacks — if the value isn't there, nothing leaves. The shelf keeps what it has.",
  remove_only_reads_belief: "get reads; remove TAKES. The withdrawal you watched put a book in the crate — the shelf is genuinely smaller.",
  index_as_string_belief: "remove(\"1\") hunts the VALUE 'one'-as-text, not shelf 1 — quotes change the overload. For an index, pass the bare number.",
  index_after_shift_unplanned: "The report shows the wrong book in the crate — after the first withdrawal, the shifts moved everything. A hardcoded index after a removal aims at yesterday's shelf.",
  wrong_target_value: "You withdrew the keeper — read the order twice before you stamp.",
  hardcoded_last_index: "Worked once, betrayed you on the next list — size() − 1 survives every length. The get() trilogy's reflex, now with a stamp.",
  remove_from_end_belief: "remove(0) takes from the FRONT — index 0 is the bottom shelf, always.",
  index_starts_at_one_belief: "Zero-based to the very end — the first book lives at index 0, in every method of every wing.",
  runtime_vs_compile_confusion: "A missing value is a RUNTIME non-event (returns false); a bad index is a RUNTIME crash; only malformed code is a COMPILE error. Three different failures, three different moments.",
};

export class Level52Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level52Scene" });
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
    this.crateContents = [];
    this.inputLocked = true;
    this.gameEnded = false;
    this._alive = true;
    this._bubble = null;
    this.slotContents = {};
    this.slotDefs = {};
    this.cartridges = [];
    this._commandFirstFail = true;
    this._dragHoverSlotKey = null;
    this.firstGapCloseAnnotationShown = false;
    this._varContainers = [];
    this._activeOrder = null;
    this._consoleText = null;
    this._consoleLines = [];
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

    try { GameManager.incrementAttempt(51); } catch (_) {}

    this.createParticleTexture();
    this.createBackground();
    this.createBackWall();
    this.createRecordsCabinet();
    this.createWithdrawalLedger();
    this.createDeaccessionBanner();
    this.createWallClock();
    this.createArchiveFloor();
    this.createParticles();
    this.createBookshelf();
    this.createDeaccessionCrate();
    this.createStampAndPad();
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
  // BACKGROUND / OFFICE DRESSING
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l52_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l52_dot", 8, 8);
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
  }

  createRecordsCabinet() {
    const g = this.add.graphics().setDepth(2);
    g.fillStyle(0x1a0e05, 1);
    g.lineStyle(1, 0x3a2618, 0.8);
    g.fillRoundedRect(900, 58, 170, 66, 3);
    g.strokeRoundedRect(900, 58, 170, 66, 3);
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 3; col++) {
        const dx = 906 + col * 55, dy = 63 + row * 30;
        g.fillStyle(0x241a0e, 1);
        g.lineStyle(1, 0x3a2618, 0.6);
        g.fillRect(dx, dy, 50, 26);
        g.strokeRect(dx, dy, 50, 26);
        g.lineStyle(1, C_BRASS, 0.5);
        g.strokeRect(dx + 14, dy + 7, 22, 8);
        g.fillStyle(C_BRASS, 0.6);
        g.fillCircle(dx + 25, dy + 20, 1.5);
      }
    }
  }

  createWithdrawalLedger() {
    // small lectern with the open ledger, tucked on the floor line
    const g = this.add.graphics().setDepth(3);
    g.fillStyle(0x241a0e, 1);
    g.lineStyle(1, C_BRASS, 0.5);
    g.fillRoundedRect(455, 600, 50, 66, 3);
    g.strokeRoundedRect(455, 600, 50, 66, 3);
    this.ledgerPages = this.add.graphics().setDepth(4);
    this._drawLedgerPages(0);
  }

  _drawLedgerPages(flip) {
    const g = this.ledgerPages;
    g.clear();
    g.fillStyle(0xe0d6b8, 0.3);
    g.lineStyle(1, 0x8a6435, 0.4);
    g.fillRoundedRect(448 - flip, 588, 30, 12, 1);
    g.fillRoundedRect(482 + flip, 588, 30, 12, 1);
    g.strokeRoundedRect(448 - flip, 588, 30, 12, 1);
    g.strokeRoundedRect(482 + flip, 588, 30, 12, 1);
    g.lineStyle(1, C_STAMP_RED, 0.4);
    g.lineBetween(480, 586, 480, 604);
  }

  createDeaccessionBanner() {
    const g = this.add.graphics().setDepth(2);
    g.fillStyle(0x0a0704, 1);
    g.lineStyle(1, C_BRASS, 0.5);
    g.fillRoundedRect(220, 30, 360, 26, 3);
    g.strokeRoundedRect(220, 30, 360, 26, 3);
    this.add.text(400, 43, "D E A C C E S S I O N   O F F I C E", { font: "bold 13px Georgia", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.7).setDepth(3);
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
  // BOOKSHELF (L46/L49 construction + waiting-dash)
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

      this.shelfIndexPlates.push({ g: plateG, text: idxText, y });
    }
    const glowRing = this.add.circle(90, SHELF_BASE_Y, 14, C_GOLD, 0);
    this.tweens.add({ targets: glowRing, alpha: 0.15, duration: 1200, yoyo: true, repeat: -1 });
    glowRing.setDepth(5);

    this.topDashGfx = this.add.graphics().setDepth(5);
    this.ghostLayer = this.add.container(0, 0).setDepth(9);
  }

  _drawTopDash() {
    this.topDashGfx.clear();
    const idx = this.currentList.length;
    if (idx >= 8) return;
    const y = this._shelfY(idx);
    this.topDashGfx.lineStyle(2, C_BRASS, 0.35);
    for (let x = SHELF_CX - 40; x < SHELF_CX + 40; x += 10) this.topDashGfx.lineBetween(x, y + 18, x + 5, y + 18);
  }

  setShelfType(listType) {
    this.currentListType = listType;
    const colorMap = { String: HEX_CYAN, Integer: HEX_GOLD };
    this.typeStampText.setText(`ArrayList<${listType}>`).setColor(colorMap[listType] || HEX_CYAN);
    if (this.typeEchoText) this.typeEchoText.setText(`<${listType}>`).setColor(colorMap[listType] || HEX_GRAY);
  }

  _typeColorHex(type) { return type === "int" ? HEX_GOLD : HEX_CYAN; }
  _typeColorInt(type) { return type === "int" ? C_GOLD : C_CYAN; }
  _shelfY(idx) { return SHELF_BASE_Y - Math.min(idx, 7) * SHELF_STEP; }
  _displayValueOnSpine(entry) { return entry.type === "string" ? `"${entry.value}"` : String(entry.value); }

  _makeBookVisual(entry, x, y) {
    const color = this._typeColorInt(entry.type);
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
    const label = this.add.text(0, 26, "", { font: "bold 8px Courier New", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.6);
    c.add([g, txt, label]);
    return { container: c, text: txt, label, entry };
  }

  async populateShelf(initialList, listType) {
    this.clearShelf();
    this.setShelfType(listType);
    const typeOf = listType === "Integer" ? "int" : "string";
    for (let i = 0; i < initialList.length; i++) {
      const entry = { value: initialList[i], type: typeOf };
      const book = this._makeBookVisual(entry, SHELF_CX, this._shelfY(i));
      book.container.setAlpha(0);
      book.label.setText(`[${i}]`);
      this.tweens.add({ targets: book.container, alpha: 1, duration: 160, delay: i * 80 });
      const plate = this.shelfIndexPlates[Math.min(i, 7)];
      if (plate) plate.text.setColor(this._typeColorHex(typeOf));
      this.currentList.push(entry);
      this.shelfBookSprites.push(book);
    }
    this.sizeCounterText.setText(`size: ${this.currentList.length}`);
    this.updateListStatePanel();
    this._drawTopDash();
    await this.delay(initialList.length * 80 + 200);
  }

  clearShelf() {
    this.shelfBookSprites.forEach((b) => b.container.destroy());
    this.shelfBookSprites = [];
    this.currentList = [];
    this.sizeCounterText.setText("size: 0");
    this.updateListStatePanel();
    this.shelfIndexPlates.forEach((p) => { p.text.setColor(HEX_GRAY); p.text.setAlpha(1); p.g.setAlpha(1); });
    if (this.topDashGfx) this._drawTopDash();
  }

  // ══════════════════════════════════════════════════════════════
  // DEACCESSION CRATE + CHUTE + STAMP + ORDER + CONSOLE
  // ══════════════════════════════════════════════════════════════

  createDeaccessionCrate() {
    this.crateLayer = this.add.container(0, 0).setDepth(7);
    const g = this.add.graphics().setDepth(8);
    g.fillStyle(0x241a0e, 1);
    g.lineStyle(3, 0x8a6435, 1);
    g.fillRoundedRect(CRATE.x0, CRATE.y0 + 20, CRATE.x1 - CRATE.x0, CRATE.y1 - CRATE.y0 - 20, 4);
    g.strokeRoundedRect(CRATE.x0, CRATE.y0 + 20, CRATE.x1 - CRATE.x0, CRATE.y1 - CRATE.y0 - 20, 4);
    g.lineStyle(1, 0x3a2618, 0.8);
    for (let x = CRATE.x0 + 30; x < CRATE.x1; x += 40) g.lineBetween(x, CRATE.y0 + 24, x, CRATE.y1 - 4);
    this.crateFrontGfx = g;
    this.crateLabel = this.add.text(CRATE_CX, (CRATE.y0 + CRATE.y1) / 2 + 12, "WITHDRAWN", { font: "bold 14px Georgia", color: HEX_STAMP_RED }).setOrigin(0.5).setAlpha(0.5).setAngle(-2).setDepth(9);

    // return chute
    const ch = this.add.graphics().setDepth(6);
    ch.lineStyle(1.5, C_BRASS, 0.6);
    ch.strokeRoundedRect(CHUTE.x - 45, CHUTE.y - 12, 90, 24, 5);
    this.add.text(CHUTE.x, CHUTE.y - 20, "RETURNED VALUE", { font: "bold 8px Georgia", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.7).setDepth(6);
  }

  createStampAndPad() {
    const g = this.add.graphics().setDepth(6);
    g.fillStyle(C_STAMP_RED, 0.35);
    g.fillRoundedRect(STAMP_HOME.x - 13, STAMP_HOME.y + 14, 26, 8, 3);
    this.stampSprite = this.add.container(STAMP_HOME.x, STAMP_HOME.y).setDepth(20);
    const sg = this.add.graphics();
    sg.fillStyle(0x241a0e, 1);
    sg.lineStyle(1, 0x3a2618, 1);
    sg.fillRect(-4, -18, 8, 12);
    sg.fillRoundedRect(-11, -6, 22, 10, 2);
    sg.strokeRoundedRect(-11, -6, 22, 10, 2);
    this.stampSprite.add(sg);
  }

  async slideInWithdrawalOrder(callText) {
    this.clearOrder();
    const c = this.add.container(W + 120, ORDER_POS.y).setDepth(12);
    const g = this.add.graphics();
    g.fillStyle(0xe0d6b8, 1);
    g.lineStyle(1.5, C_STAMP_RED, 1);
    g.fillRoundedRect(-65, -29, 130, 58, 3);
    g.strokeRoundedRect(-65, -29, 130, 58, 3);
    g.fillStyle(C_STAMP_RED, 0.5);
    g.fillCircle(50, -18, 4);
    const t = this.add.text(0, 0, callText, { font: "bold 12px Courier New", color: "#241a0e", wordWrap: { width: 120 }, align: "center" }).setOrigin(0.5);
    if (t.width > 120) t.setFontSize(9);
    c.add([g, t]);
    this._activeOrder = { container: c, text: t };
    await new Promise((res) => { this.tweens.add({ targets: c, x: ORDER_POS.x, duration: 300, ease: "Sine.easeOut", onComplete: res }); });
    await this.delay(120);
  }

  clearOrder() {
    if (this._activeOrder) { this._activeOrder.container.destroy(); this._activeOrder = null; }
  }

  async printToConsole(text) {
    this._consoleLines.push(text);
    if (this._consoleText && this._consoleText.active) this._consoleText.destroy();
    const t = this.add.text(CONSOLE_POS.x, CONSOLE_POS.y, "> ", { font: "bold 13px Courier New", color: HEX_GREEN_BRIGHT }).setOrigin(0, 0.5).setDepth(12);
    this.roundElements.push(t);
    this._consoleText = t;
    const full = "> " + this._consoleLines.join(" ⏎ ");
    for (let i = 2; i <= full.length; i++) {
      if (!this._alive) return;
      t.setText(full.slice(0, i));
      if (t.width > 230) t.setFontSize(10);
      await this.delay(12);
    }
  }

  clearConsole() {
    this._consoleLines = [];
    if (this._consoleText && this._consoleText.active) this._consoleText.destroy();
    this._consoleText = null;
  }

  // ══════════════════════════════════════════════════════════════
  // THE WITHDRAWAL (signature choreography — the ANTI-ghost)
  // ══════════════════════════════════════════════════════════════

  async markBook(index) {
    const book = this.shelfBookSprites[index];
    if (!book) return;
    const tag = this.add.graphics();
    tag.fillStyle(C_STAMP_RED, 0.8);
    tag.fillTriangle(30, -20, 18, -20, 30, -8);
    book.container.add(tag);
    book.markTag = tag;
    await this.delay(400);
  }

  async stampThump(bookContainer) {
    const bx = bookContainer.x, by = bookContainer.y;
    await new Promise((res) => { this.tweens.add({ targets: this.stampSprite, x: bx, y: by - 44, duration: 200, ease: "Sine.easeOut", onComplete: res }); });
    await new Promise((res) => { this.tweens.add({ targets: this.stampSprite, y: by - 26, duration: 80, ease: "Cubic.easeIn", onComplete: res }); });
    this.cameras.main.shake(80, 0.002);
    const mark = this.add.text(0, 0, "WITHDRAWN", { font: "bold 10px Georgia", color: HEX_STAMP_RED }).setOrigin(0.5).setAngle(-20).setAlpha(0);
    bookContainer.add(mark);
    this.tweens.add({ targets: mark, alpha: 0.95, duration: 100 });
    await new Promise((res) => { this.tweens.add({ targets: this.stampSprite, x: STAMP_HOME.x, y: STAMP_HOME.y, duration: 250, ease: "Sine.easeIn", onComplete: res }); });
  }

  async landInCrate(book) {
    // nudge the existing stack down; cap 4 visible
    this.crateContents.forEach((c) => { if (c.active) this.tweens.add({ targets: c, y: c.y + 4, duration: 150 }); });
    if (this.crateContents.length >= 4) {
      const oldest = this.crateContents.shift();
      if (oldest.active) oldest.destroy();
    }
    await new Promise((res) => {
      this.tweens.add({ targets: book.container, x: CRATE_CX + Phaser.Math.Between(-30, 30), y: CRATE.y0 + 12, angle: 90, scale: 0.85, duration: 400, ease: "Sine.easeIn", onComplete: res });
    });
    this.tweens.add({ targets: this.crateFrontGfx, y: 2, duration: 60, yoyo: true });
    book.container.setDepth(7);
    this.crateContents.push(book.container);
  }

  /** Full §3.3 withdrawal for a VALID remove(index). Splices ground truth
   * and returns the removed entry. */
  async withdrawBook(index, opts = {}) {
    const entry = this.currentList[index];
    const book = this.shelfBookSprites[index];
    const shelfY = this._shelfY(index);

    if (!opts.skipLocate) {
      const plate = this.shelfIndexPlates[Math.min(index, 7)];
      if (plate) {
        plate.text.setColor(HEX_GOLD);
        this.tweens.add({ targets: plate.text, scale: 1.5, duration: 150, yoyo: true });
      }
      const scan = this.add.rectangle(SHELF_CX - 168, shelfY, 2, 42, 0xffd740, 0.7).setDepth(8);
      await new Promise((res) => { this.tweens.add({ targets: scan, x: SHELF_CX + 168, duration: 250, ease: "Sine.easeInOut", onComplete: () => { scan.destroy(); res(); } }); });
      if (!this._alive) return entry;
    }

    // the mark — where the choreography diverges from get's
    await this.markBook(index);
    if (!this._alive) return entry;

    // the taking: the SOLID book lifts; the vacated shelf shows its dash
    book.container.setDepth(10);
    await new Promise((res) => { this.tweens.add({ targets: book.container, y: shelfY - 24, duration: 250, ease: "Sine.easeOut", onComplete: res }); });
    const tempDash = this.add.graphics().setDepth(5);
    tempDash.lineStyle(2, C_BRASS, 0.35);
    for (let x = SHELF_CX - 40; x < SHELF_CX + 40; x += 10) tempDash.lineBetween(x, shelfY + 18, x + 5, shelfY + 18);
    if (!this._alive) return entry;

    // the stamp thump (+ value capture pops off at this moment)
    await this.stampThump(book.container);
    if (opts.capture) this._popReturnValue(entry, book.container.x, book.container.y);
    if (!this._alive) return entry;

    // into the crate
    await this.landInCrate(book);
    if (!this._alive) return entry;

    // splice ground truth
    this.currentList.splice(index, 1);
    this.shelfBookSprites.splice(index, 1);

    // THE GAP CLOSES — 300ms conspicuous beat, then the mirror of L47
    await this.delay(300);
    tempDash.destroy();
    await this.closeGap(index);
    this.updateRemovedRow(entry.value, entry.type);
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
          targets: b.container, y: this._shelfY(newIdx), duration: 350, ease: "Sine.easeInOut",
          onComplete: () => { b.label.setText(`[${newIdx}]`); if (++done === shifting.length) res(); },
        });
      });
    });
    // the count ticks down with a red flash
    this.sizeCounterText.setText(`size: ${this.currentList.length}`).setColor(HEX_RED);
    this.tweens.add({ targets: this.sizeCounterText, scale: 1.35, duration: 130, yoyo: true });
    this.time.delayedCall(600, () => { if (this.sizeCounterText.active) this.sizeCounterText.setColor(HEX_BRASS); });
    this.shelfIndexPlates.forEach((p, i) => {
      p.text.setColor(i < this.currentList.length ? this._typeColorHex(this.currentList[i].type) : HEX_GRAY);
    });
    this._drawTopDash();
    this.updateListStatePanel();

    if (!this.firstGapCloseAnnotationShown) {
      this.firstGapCloseAnnotationShown = true;
      this.createAnnotation(SHELF_CX + 120, this._shelfY(vacatedIndex) - 30, "the gap closes — indices shift down ↓", HEX_STAMP_RED);
    }
  }

  _popReturnValue(entry, fromX, fromY) {
    const valText = this.add.text(fromX, fromY, String(entry.value), { font: "bold 18px Courier New", color: this._typeColorHex(entry.type) }).setOrigin(0.5).setDepth(30);
    this.roundElements.push(valText);
    this.tweens.add({ targets: valText, x: CHUTE.x, y: CHUTE.y, duration: 450, ease: "Sine.easeInOut" });
    this._lastValueLabel = valText;
  }

  async deliverToVariable(name, value, type) {
    const idx = this._varContainers.length;
    const x = 555 + (idx % 2) * 96, y = 250 - Math.floor(idx / 2) * 30;
    const c = this.add.container(x, y).setDepth(12).setAlpha(0);
    const g = this.add.graphics();
    g.fillStyle(0x0a1520, 1);
    g.lineStyle(1.5, this._typeColorInt(type), 0.8);
    g.fillRoundedRect(-44, -13, 88, 26, 5);
    g.strokeRoundedRect(-44, -13, 88, 26, 5);
    const nameT = this.add.text(0, -20, name, { font: "bold 9px Courier New", color: HEX_BRASS }).setOrigin(0.5);
    const valT = this.add.text(0, 0, String(value), { font: "bold 12px Courier New", color: this._typeColorHex(type) }).setOrigin(0.5);
    if (valT.width > 80) valT.setFontSize(9);
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

  clearCrate() {
    this.crateContents.forEach((c) => { if (c.active) this.tweens.add({ targets: c, alpha: 0, duration: 250, onComplete: () => c.destroy() }); });
    this.crateContents = [];
  }

  // ══════════════════════════════════════════════════════════════
  // REMOVE-BY-VALUE — search sweep + not-found fizzle
  // ══════════════════════════════════════════════════════════════

  async searchSweep(value) {
    for (let i = 0; i < this.currentList.length; i++) {
      if (!this._alive) return -1;
      const book = this.shelfBookSprites[i];
      const hl = this.add.rectangle(SHELF_CX, this._shelfY(i), 66, 44, C_GOLD, 0.18).setDepth(8);
      await this.delay(100);
      hl.destroy();
      if (String(this.currentList[i].value) === String(value)) return i;
    }
    return -1;
  }

  async notFoundFizzle() {
    const topY = this.currentList.length > 0 ? this._shelfY(this.currentList.length - 1) - 40 : SHELF_BASE_Y - 40;
    const p = this.add.particles(SHELF_CX, topY, "l52_dot", {
      speed: { min: 15, max: 45 }, angle: { min: 240, max: 300 }, scale: { start: 0.5, end: 0 }, lifespan: 400,
      tint: [0x9e9e9e], alpha: { start: 0.5, end: 0 }, emitting: false,
    }).setDepth(9);
    p.explode(8);
    this.time.delayedCall(500, () => p.destroy());

    if (this._activeOrder && this._activeOrder.container.active) {
      const stamp = this.add.text(0, 8, "NOT FOUND — no change", { font: "bold 9px Courier New", color: "#78909c" }).setOrigin(0.5).setAngle(-6).setAlpha(0);
      this._activeOrder.container.add(stamp);
      this.tweens.add({ targets: stamp, alpha: 1, duration: 150 });
    }
    this.updateRemovedRow("false", "boolean");
    await this.delay(1100);
  }

  // ══════════════════════════════════════════════════════════════
  // GHOST RETRIEVAL (L49-faithful — for the contrast rounds)
  // ══════════════════════════════════════════════════════════════

  async retrieveGhost(index) {
    const entry = this.currentList[index];
    const shelfY = this._shelfY(index);

    const plate = this.shelfIndexPlates[Math.min(index, 7)];
    if (plate) {
      plate.text.setColor(HEX_GOLD);
      this.tweens.add({ targets: plate.text, scale: 1.5, duration: 150, yoyo: true });
      this.time.delayedCall(1200, () => { if (plate.text.active && this.currentList[index]) plate.text.setColor(this._typeColorHex(this.currentList[index].type)); });
    }
    const scan = this.add.rectangle(SHELF_CX - 168, shelfY, 2, 42, 0xffd740, 0.7).setDepth(8);
    await new Promise((res) => { this.tweens.add({ targets: scan, x: SHELF_CX + 168, duration: 250, ease: "Sine.easeInOut", onComplete: () => { scan.destroy(); res(); } }); });
    if (!this._alive) return entry;

    const halo = this.add.graphics().setDepth(7);
    halo.lineStyle(3, C_GOLD, 0.5);
    halo.strokeRoundedRect(SHELF_CX - 33, shelfY - 23, 66, 46, 4);
    const haloTween = this.tweens.add({ targets: halo, alpha: 0.2, duration: 350, yoyo: true, repeat: -1 });

    const ghost = this._makeBookVisual(entry, SHELF_CX, shelfY);
    const rim = this.add.graphics();
    rim.fillStyle(C_GOLD, 0.15);
    rim.fillRoundedRect(-34, -24, 68, 48, 4);
    ghost.container.addAt(rim, 0);
    ghost.container.setAlpha(0);
    this.ghostLayer.add(ghost.container);
    await new Promise((res) => { this.tweens.add({ targets: ghost.container, alpha: 0.45, y: shelfY - 20, duration: 250, onComplete: res }); });
    if (!this._alive) return entry;

    this.updateRemovedRow(entry.value, entry.type);
    const valText = this.add.text(SHELF_CX + 130, shelfY - 45, String(entry.value), { font: "bold 18px Courier New", color: this._typeColorHex(entry.type) }).setOrigin(0.5).setDepth(30).setAlpha(0);
    this.roundElements.push(valText);
    this.tweens.add({ targets: valText, alpha: 1, duration: 200 });
    this._lastValueLabel = valText;

    await new Promise((res) => {
      this.tweens.add({ targets: ghost.container, x: SHELF_CX + 130, y: shelfY - 40, alpha: 0, duration: 550, ease: "Sine.easeInOut", onComplete: () => { ghost.container.destroy(); res(); } });
    });
    haloTween.stop();
    halo.destroy();
    return entry;
  }

  // ══════════════════════════════════════════════════════════════
  // CRASH REJECTION
  // ══════════════════════════════════════════════════════════════

  async crashWithdrawal(index) {
    const topIdx = this.currentList.length - 1;
    const startY = topIdx >= 0 ? this._shelfY(topIdx) : SHELF_BASE_Y;
    const phantomY = this._shelfY(Math.max(0, Math.min(index, 7)));
    const scan = this.add.rectangle(SHELF_CX, startY, 340, 3, C_RED, 0.6).setDepth(8);
    await new Promise((res) => { this.tweens.add({ targets: scan, y: phantomY - 10, duration: 400, ease: "Sine.easeOut", onComplete: res }); });
    if (!this._alive) { scan.destroy(); return; }
    await new Promise((res) => { this.tweens.add({ targets: scan, alpha: 0, duration: 90, yoyo: true, repeat: 3, onComplete: () => { scan.destroy(); res(); } }); });

    if (this._activeOrder && this._activeOrder.container.active) {
      const order = this._activeOrder.container;
      const stamp = this.add.text(0, 6, "IndexOutOfBounds\nException", { font: "bold 10px Courier New", color: HEX_RED, align: "center" }).setOrigin(0.5).setAngle(-8).setScale(1.5).setAlpha(0);
      order.add(stamp);
      this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 150, ease: "Cubic.easeIn" });
      [[-56, -22], [56, 22], [-52, 24]].forEach(([dx, dy]) => order.add(this.add.circle(dx, dy, 5, 0x241a0e, 0.5)));
    }
    this.screenShake(0.005, 180);
    this.updateRemovedRow("", "crash");
    await this.delay(1200);
  }

  // ══════════════════════════════════════════════════════════════
  // LIST STATE PANEL (+ removed row + before/after strip)
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
    this.bracketText = this.add.text(PANEL_X + PANEL_W / 2, PANEL_Y + 88, "[]", { font: "bold 15px Courier New", color: HEX_GRAY, wordWrap: { width: PANEL_W - 30 }, align: "center" }).setOrigin(0.5).setDepth(12);
    this.panelSizeText = this.add.text(PANEL_X + PANEL_W / 2, PANEL_Y + 124, "size: 0", { font: "11px Courier New", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.85).setDepth(12);
    this.panelIndexText = this.add.text(PANEL_X + PANEL_W / 2, PANEL_Y + 145, "", { font: "bold 10px Courier New", color: "#8a6435" }).setOrigin(0.5).setAlpha(0.7).setDepth(12);

    this.add.text(PANEL_X + 16, PANEL_Y + 172, "removed:", { font: "11px Georgia", color: "#8a6435" }).setOrigin(0, 0.5).setDepth(12);
    this.removedValueText = this.add.text(PANEL_X + 84, PANEL_Y + 172, "—", { font: "bold 13px Courier New", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(12);

    // before/after strip
    this.add.text(PANEL_X + 16, PANEL_Y + 200, "before:", { font: "11px Courier New", color: "#8a6435" }).setOrigin(0, 0.5).setDepth(12);
    this.beforeRowText = this.add.text(PANEL_X + 78, PANEL_Y + 200, "", { font: "bold 11px Courier New", color: "#b0bec5" }).setOrigin(0, 0.5).setDepth(12);
    this.add.text(PANEL_X + 16, PANEL_Y + 224, "after:", { font: "11px Courier New", color: "#8a6435" }).setOrigin(0, 0.5).setDepth(12);
    this.afterRowText = this.add.text(PANEL_X + 78, PANEL_Y + 224, "", { font: "bold 11px Courier New", color: HEX_GREEN_BRIGHT }).setOrigin(0, 0.5).setDepth(12);
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
    this.panelIndexText.setText(this.currentList.map((_, i) => `[${i}]`).join("  "));
    this.tweens.add({ targets: this.bracketText, scale: 1.06, duration: 110, yoyo: true });
  }

  updateRemovedRow(value, type) {
    if (value === null) { this.removedValueText.setFontSize(13).setText("—").setColor(HEX_GRAY); return; }
    if (type === "crash") { this.removedValueText.setText("✗ IndexOutOfBoundsException").setColor(HEX_RED).setFontSize(10); return; }
    if (type === "boolean") { this.removedValueText.setFontSize(13).setText(String(value)).setColor(HEX_VIOLET); return; }
    this.removedValueText.setFontSize(13).setText(String(value)).setColor(this._typeColorHex(type));
    this.tweens.add({ targets: this.removedValueText, scale: 1.2, duration: 120, yoyo: true });
  }

  fillBeforeRow() {
    const s = `[${this.currentList.map((e) => String(e.value)).join(", ")}]  (size ${this.currentList.length})`;
    this.beforeRowText.setText(s.length > 40 ? s.slice(0, 40) : s);
    this.afterRowText.setText("");
  }

  fillAfterRow() {
    const s = `[${this.currentList.map((e) => String(e.value)).join(", ")}]  (size ${this.currentList.length})`;
    this.afterRowText.setText(s.length > 40 ? s.slice(0, 40) : s);
    this.tweens.add({ targets: this.afterRowText, scale: 1.08, duration: 120, yoyo: true });
  }

  // ══════════════════════════════════════════════════════════════
  // SOURCE DISPLAY / EXPRESSION MONITOR
  // ══════════════════════════════════════════════════════════════

  createSourceDisplay() {
    this.sourceContainer = this.add.container(0, 0).setDepth(15);
  }

  _syntaxTokenize(line) {
    const tokens = [];
    const re = /("(?:[^"\\]|\\.)*")|(\bArrayList\b|\bnew\b|\bString\b|\bint\b)|(<\w*>)|(\bSystem\.out\b)|(\.get\b|\.remove\b|\.size\b|\bprintln\b)|(-?\d+)|([(){};.,=+\-])/g;
    let last = 0, m;
    const plain = (t) => t && tokens.push({ t, c: "#e0e0e0" });
    while ((m = re.exec(line))) {
      if (m.index > last) plain(line.slice(last, m.index));
      if (m[1]) tokens.push({ t: m[1], c: HEX_CYAN });
      else if (m[2]) tokens.push({ t: m[2], c: "#66bb6a" });
      else if (m[3]) tokens.push({ t: m[3], c: HEX_GOLD });
      else if (m[4]) tokens.push({ t: m[4], c: "#66bb6a" });
      else if (m[5]) tokens.push({ t: m[5], c: m[5] === ".remove" ? HEX_STAMP_RED : "#ffd740" });
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
  // HONEST EVALUATOR — remove (both overloads) + get + println
  // ══════════════════════════════════════════════════════════════

  _evalIndexArg(argExpr) {
    const t = argExpr.trim();
    if (/^-?\d+$/.test(t)) return { ok: true, index: parseInt(t, 10) };
    let m = t.match(/^(\w+)\.size\(\)\s*-\s*1$/);
    if (m) {
      const size = this.currentList.length;
      this.createAnnotation(ORDER_POS.x, ORDER_POS.y - 44, `size() = ${size} → ${size} - 1 = ${size - 1}`, HEX_BRASS);
      return { ok: true, index: size - 1 };
    }
    m = t.match(/^(\w+)\.size\(\)$/);
    if (m) return { ok: true, index: this.currentList.length };
    return { ok: false };
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

  /** Async expression evaluator — remove() plays the withdrawal, get()
   * plays the ghost, both mutating (or not) honestly. */
  async evalExpr(expr, vars, opts = {}) {
    const parts = this._splitTopPlus(expr);
    if (parts.length > 1) {
      const results = [];
      for (const p of parts) {
        const r = await this.evalExpr(p, vars, opts);
        if (!r.ok) return r;
        results.push(r);
      }
      if (results.every((r) => r.type === "int")) {
        return { ok: true, value: results.reduce((a, r) => a + r.value, 0), type: "int" };
      }
      return { ok: true, value: results.map((r) => String(r.value)).join(""), type: "string" };
    }

    const t = expr.trim();
    if (/^".*"$/.test(t)) return { ok: true, value: t.slice(1, -1), type: "string" };
    if (/^-?\d+$/.test(t)) return { ok: true, value: parseInt(t, 10), type: "int" };

    const removeMatch = t.match(/^(\w+)\.remove\((.*)\)$/);
    if (removeMatch) {
      const arg = removeMatch[2].trim();
      if (/^".*"$/.test(arg)) {
        // by-value: sweep, first match or false
        const value = arg.slice(1, -1);
        const idx = await this.searchSweep(value);
        if (idx === -1) {
          await this.notFoundFizzle();
          return { ok: true, value: false, type: "boolean", removedNothing: true };
        }
        const entry = await this.withdrawBook(idx, { skipLocate: true, capture: opts.capture });
        return { ok: true, value: entry.value, type: entry.type, byValue: true };
      }
      const idxArg = this._evalIndexArg(arg);
      if (!idxArg.ok) return { ok: false, crash: "eval" };
      const idx = idxArg.index;
      if (idx < 0 || idx >= this.currentList.length) {
        await this.crashWithdrawal(idx);
        return { ok: false, crash: "ioobe", index: idx };
      }
      const entry = await this.withdrawBook(idx, { capture: opts.capture });
      return { ok: true, value: entry.value, type: entry.type };
    }

    const getMatch = t.match(/^(\w+)\.get\((.*)\)$/);
    if (getMatch) {
      const idxArg = this._evalIndexArg(getMatch[2]);
      if (!idxArg.ok) return { ok: false, crash: "eval" };
      const idx = idxArg.index;
      if (idx < 0 || idx >= this.currentList.length) {
        await this.crashWithdrawal(idx);
        return { ok: false, crash: "ioobe", index: idx };
      }
      const entry = await this.retrieveGhost(idx);
      return { ok: true, value: entry.value, type: entry.type };
    }

    if (/^[A-Za-z_]\w*$/.test(t)) {
      if (vars && vars[t] !== undefined) return { ok: true, value: vars[t], type: typeof vars[t] === "number" ? "int" : "string" };
      if (t === this.currentListName) return { ok: true, value: `[${this.currentList.map((e) => String(e.value)).join(", ")}]`, type: "string" };
      return { ok: false, crash: "eval" };
    }
    return { ok: false, crash: "eval" };
  }

  /** Runs statements honestly — one withdrawal order slip per statement;
   * crashes halt (later statements never run). */
  async runStatements(lines) {
    const vars = this.lastVars || {};
    this.lastVars = vars;
    for (const raw of lines) {
      if (!this._alive) return { ok: true };
      const line = raw.trim();
      if (!line) continue;

      const assignMatch = line.match(/^(String|int)\s+(\w+)\s*=\s*(.*);$/);
      if (assignMatch) {
        await this.slideInWithdrawalOrder(assignMatch[3].length > 24 ? assignMatch[3].slice(0, 24) + "…" : assignMatch[3]);
        const r = await this.evalExpr(assignMatch[3], vars, { capture: true });
        if (!r.ok) return r;
        vars[assignMatch[2]] = r.value;
        await this.deliverToVariable(assignMatch[2], r.value, r.type);
        continue;
      }
      const printMatch = line.match(/^System\.out\.println\((.*)\);$/);
      if (printMatch) {
        await this.slideInWithdrawalOrder("println(…)");
        const r = await this.evalExpr(printMatch[1], vars, {});
        if (!r.ok) return r;
        await this.printToConsole(String(r.value));
        continue;
      }
      const bareMatch = line.match(/^(.*);$/);
      if (bareMatch) {
        await this.slideInWithdrawalOrder(bareMatch[1].length > 24 ? bareMatch[1].slice(0, 24) + "…" : bareMatch[1]);
        const r = await this.evalExpr(bareMatch[1], vars, {});
        if (!r.ok) return r;
        continue;
      }
    }
    return { ok: true };
  }

  // ══════════════════════════════════════════════════════════════
  // BIT — deaccession officer (monocle, stamp, formal hover)
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
    // red-ribboned monocle
    const monocle = this.add.graphics();
    monocle.lineStyle(1.5, C_BRASS, 1);
    monocle.strokeCircle(6, 3, 5);
    monocle.lineStyle(1, C_STAMP_RED, 0.5);
    monocle.lineBetween(10, 6, 16, 14);
    const gloveL = this.add.circle(-16, 10, 4, 0xe0d6b8, 0.85);
    const gloveR = this.add.circle(16, 10, 4, 0xe0d6b8, 0.85);
    // handheld withdrawal stamp
    const stamp = this.add.graphics();
    stamp.fillStyle(0x241a0e, 1);
    stamp.lineStyle(1, 0x3a2618, 1);
    stamp.fillRect(20, 2, 5, 8);
    stamp.fillRoundedRect(16, 9, 13, 6, 1);
    stamp.strokeRoundedRect(16, 9, 13, 6, 1);
    c.add([g, cape, eye, pupil, monocle, gloveL, gloveR, stamp, tip]);
    this.tweens.add({ targets: tip, alpha: 0.3, duration: 900, yoyo: true, repeat: -1 });
    // formal, solemn hover — reduced amplitude
    this.tweens.add({ targets: c, y: "+=2", duration: 2400, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
    this.bit = c;
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
    const p = this.add.particles(x, y, "l52_dot", {
      speed: { min: 80, max: 240 }, angle: { min: 0, max: 360 }, scale: { start: 0.9, end: 0 }, lifespan: 500,
      tint: [C_BRASS, C_GOLD, C_STAMP_RED, C_CYAN, 0xffffff], emitting: false,
    }).setDepth(75);
    p.explode(count);
    this.time.delayedCall(900, () => p.destroy());
  }

  screenShake(intensity = 0.004, duration = 150) {
    this.cameras.main.shake(duration, intensity);
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

    this.add.text(20, 14, "THE DEACCESSION OFFICE", { font: "bold 13px Georgia", color: "#b0bec5" }).setDepth(50);
    this.add.text(20, 32, "Accretion Phase — ArrayList Methods: remove()", { font: "11px Arial", color: "#546e7a" }).setDepth(50);

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
  // TUTORIAL (the 6-step contrast arc)
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

    await this.bitSay("Welcome to the Deaccession Office, Officer. Every archive must sometimes let a volume go — formally, precisely, and on the record. Here we learn remove(): the method that TAKES. And to understand taking, first remember LOOKING...");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(5200)]); if (!A()) return;
    this.hideBubble();

    // THE CONTRAST, part one — the get replay
    this.updateSourceDisplay(["list.get(1);"]);
    await this.retrieveGhost(1); if (!A()) return;
    await this.bitSay("get(1) — the ghost lifts, the original stays. You know this law. Size three before, size three after. Now watch the SAME index... with the other method.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(5000)]); if (!A()) return;
    this.hideBubble();

    // THE CONTRAST, part two — the first withdrawal
    this.updateSourceDisplay(["list.remove(1);"]);
    await this.slideInWithdrawalOrder("list.remove(1)"); if (!A()) return;
    await this.withdrawBook(1, {}); if (!A()) return;
    await this.bitSay("remove(1) — the book ITSELF leaves. No ghost, no copy: Emma is in the crate, stamped and gone. And look at the shelf — Ivanhoe slid DOWN to fill the gap. It lived at index 2; it lives at index 1 now. Removal doesn't just shrink the list — it RENUMBERS everything above the wound.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(6000)]); if (!A()) return;
    this.hideBubble();

    // the return value
    this.updateSourceDisplay(["String taken = list.remove(0);"]);
    await this.runStatements(["String taken = list.remove(0);"]); if (!A()) return;
    await this.bitSay("remove() doesn't just take — it HANDS you what it took. The return value is the removed element, ready to store or print. A withdrawal is also a delivery.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4800)]); if (!A()) return;
    this.hideBubble();
    this.clearOrder();
    this.clearVarContainers();
    this.lastVars = {};

    // by-value: first match only
    this.clearCrate();
    await this.populateShelf(["Ada", "Grace", "Ada"], "String"); if (!A()) return;
    this.updateSourceDisplay(['list.remove("Ada");']);
    await this.runStatements(['list.remove("Ada");']); if (!A()) return;
    await this.bitSay("Removing by VALUE — the sweep starts at shelf 0 and takes the FIRST match only. The second Ada survives. One order, one book, always.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4800)]); if (!A()) return;
    this.hideBubble();

    // the crash boundary
    this.updateSourceDisplay(["list.remove(5);"]);
    await this.runStatements(["list.remove(5);"]); if (!A()) return;
    await this.bitSay("And the old law holds — remove(5) on a two-book shelf reaches past the top. IndexOutOfBoundsException, same as get, same as charAt before it. Three methods, one law: the last valid index is size minus one. Your stamp awaits, Officer — the orders are queued!");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(5500)]); if (!A()) return;
    this.hideBubble();

    try { localStorage.setItem(TUTORIAL_KEY, "true"); } catch (_) {}
    this.clearOrder();
    this.clearCrate();
    this.roundElements.forEach((e) => { if (e && e.destroy) e.destroy(); });
    this.roundElements = [];
    this.updateSourceDisplay([]);
    this.updateRemovedRow(null, null);
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
    this.clearOrder();
    this.clearCrate();
    this.clearConsole();
    this.lastVars = {};
    this.updateRemovedRow(null, null);
    this.currentListName = config.listName;
    await this.populateShelf(config.initialList, config.listType);
    if (!this._alive || this.gameEnded) return;
    this.fillBeforeRow();

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

    // the universal reveal: withdrawals, ghosts, sweeps, crashes — honest
    await this.runStatements(config.source);
    this.fillAfterRow();
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
      await this.showBitFeedback(MISCONCEPTION_FEEDBACK[opt.tag] || "Not quite — watch the shelf and try again.");
      if (!this._alive) return;
      this.clearRound();
      this.clearVarContainers();
      this.clearOrder();
      this.clearCrate();
      this.clearConsole();
      this.lastVars = {};
      this.updateRemovedRow(null, null);
      await this.populateShelf(config.initialList, config.listType);
      if (!this._alive) return;
      this.fillBeforeRow();
      this.setupPredict(config);
    }
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE D — DEACCESSION COMMAND
  // ══════════════════════════════════════════════════════════════

  setupCommand(config) {
    this.renderCommandSkeleton(config);
    this.updateExpressionMonitor(config.mission);
    this.showQuestionCard(config.mission);
    this.createCartridgeTray(config);
    this._commandFirstFail = true;
    // unlock — input is still locked from the previous round's answer
    // click (the L30–L49 soft-lock bug class).
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
        } else { measured.push(220); totalW += 226; }
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
          const w = 220, h = fontSize + 8;
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
      bg.fillStyle(enabled ? 0x2a1010 : 0x2a2f36, 0.95);
      bg.fillRoundedRect(-70, -22, 140, 44, 22);
      bg.lineStyle(2, enabled ? C_STAMP_RED : 0x546e7a, hover && enabled ? 1 : 0.8);
      bg.strokeRoundedRect(-70, -22, 140, 44, 22);
    };
    bdraw(false, false);
    const bt = this.add.text(0, 0, "WITHDRAW", { font: "bold 14px Arial", color: HEX_STAMP_RED }).setOrigin(0.5);
    btn.add([bg, bt]);
    btn.setSize(140, 44);
    btn.on("pointerover", () => { if (this._withdrawReady) { bdraw(true, true); btn.setScale(1.03); } });
    btn.on("pointerout", () => { bdraw(this._withdrawReady, false); btn.setScale(1); });
    btn.on("pointerdown", () => { if (this._withdrawReady) this.onWithdrawPressed(config); });
    this.withdrawButton = { c: btn, draw: bdraw };
    this.roundElements.push(btn);
    this.disableWithdrawButton();
  }

  enableWithdrawButton() { this._withdrawReady = true; this.withdrawButton.draw(true, false); this.withdrawButton.c.setInteractive({ useHandCursor: true }); }
  disableWithdrawButton() { this._withdrawReady = false; this.withdrawButton.draw(false, false); this.withdrawButton.c.disableInteractive(); }

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
        this.updateWithdrawButtonState();
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
      obj.x = Phaser.Math.Linear(obj.x, def.rect.x + def.rect.w / 2, 0.25);
      obj.y = Phaser.Math.Linear(obj.y, def.rect.y + def.rect.h / 2, 0.25);
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
      this.updateWithdrawButtonState();
    } else {
      const home = obj.getData("home");
      this.tweens.add({ targets: obj, x: home.x, y: home.y, duration: 250, ease: "Back.easeOut" });
    }
  }

  updateWithdrawButtonState() {
    const allFilled = Object.keys(this.slotDefs).every((id) => (this.slotContents[id] || []).length > 0);
    if (allFilled) this.enableWithdrawButton(); else this.disableWithdrawButton();
  }

  async onWithdrawPressed(config) {
    this.inputLocked = true;
    this.disableWithdrawButton();
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
    let anyCrash = false;
    for (let ti = 0; ti < tests.length; ti++) {
      if (!this._alive) return;
      const test = tests[ti];
      const listForTest = test.initialList || config.initialList;
      this.clearVarContainers();
      this.clearOrder();
      this.clearCrate();
      this.clearConsole();
      this.lastVars = {};
      this.updateRemovedRow(null, null);
      await this.populateShelf(listForTest, config.listType);
      if (!this._alive) return;
      this.fillBeforeRow();
      if (tests.length > 1) this.createFloatingText(SHELF_CX, SHELF_Y0 - 14, `TEST ${ti + 1}: [${listForTest.join(", ")}]`, HEX_BRASS, "bold 12px Courier New", 1400);

      const runResult = await this.runStatements(statements);
      if (!this._alive) return;
      this.fillAfterRow();

      let pass = runResult.ok;
      if (pass && test.expectedList) {
        const actual = this.currentList.map((e) => String(e.value));
        const expected = test.expectedList.map(String);
        if (actual.length !== expected.length || !actual.every((v, i) => v === expected[i])) pass = false;
      }
      if (pass && test.expectedOutput !== undefined) {
        if (this._consoleLines.join("⏎") !== test.expectedOutput) pass = false;
      }
      if (!runResult.ok) anyCrash = true;
      this.createFloatingText(CRATE_CX, CRATE.y0 - 24, pass ? "✓" : "✗", pass ? HEX_GREEN_BRIGHT : HEX_RED, "bold 24px Arial", 900);
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
      await this.showBitFeedback(MISCONCEPTION_FEEDBACK[firstFailTag] || "The office executed exactly what you filed — compare the crate and the shelf against the order.");
      if (!this._alive) return;
      this.inputLocked = false;
      this.clearVarContainers();
      this.clearOrder();
      this.clearCrate();
      this.clearConsole();
      this.lastVars = {};
      await this.populateShelf(config.initialList, config.listType);
      if (!this._alive) return;
      this.fillBeforeRow();
      this.slotContents = {};
      this.renderCommandSkeleton(config);
      this.cartridges.forEach((cart) => {
        cart.container.setData("placedIn", null);
        const home = cart.container.getData("home");
        this.tweens.add({ targets: cart.container, x: home.x, y: home.y, duration: 200 });
      });
      this.disableWithdrawButton();
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
      this._drawLedgerPages(6);
      this.tweens.add({ targets: this.stampSprite, y: STAMP_HOME.y + 8, angle: 90, duration: 700 });
      this.tweens.add({ targets: this.crateLabel, alpha: 0.15, duration: 800 });
      this.tweens.add({ targets: this.typeStampText, alpha: 0.15, duration: 800 });
      this._clockStopped = true;
      const motes = this.ambient;
      this.ambient = null;
      (motes || []).forEach((m) => this.tweens.add({ targets: m, y: 632, alpha: 0, duration: 1500, ease: "Sine.easeIn" }));

      const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
      this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });
      const title = this.add.text(640, 240, "OFFICE CLOSED", { font: "bold 38px Georgia", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
      this.tweens.add({ targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut", onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }) });
      this.add.text(640, 310, `Score: ${this.score}`, { font: "20px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
      this.add.text(640, 350, `Orders Executed: ${this.currentRound} / 12`, { font: "16px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);
      this._makeButton(640, 420, "REOPEN THE LEDGER", 230, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
    })();
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearRound();
    this.hideBubble();

    try { GameManager.completeLevel(51, Math.round((this.correctFirstTry / 12) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("arraylist_remove_schema"); } catch (_) {}
    try {
      localStorage.setItem("level52_results", JSON.stringify({
        level: 52, concept: "arraylist_remove", phase: "accretion",
        score: this.score, accuracy: this.correctFirstTry / 12, avgTime: this.totalTime / 12,
        comboMax: this.maxCombo, stars: this._starRating(), livesRemaining: this.lives,
        attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.deaccessionFinale().then(() => { if (this._alive) this.showScoreTally(); });
  }

  async deaccessionFinale() {
    // the ledger riffles
    for (let i = 0; i < 4; i++) { this._drawLedgerPages(i % 2 === 0 ? 4 : 0); await this.delay(120); }
    this._drawLedgerPages(0);
    // three ceremonial stamp thumps in midair
    for (let i = 0; i < 3; i++) {
      await new Promise((res) => { this.tweens.add({ targets: this.stampSprite, y: STAMP_HOME.y - 30, duration: 150, onComplete: res }); });
      await new Promise((res) => { this.tweens.add({ targets: this.stampSprite, y: STAMP_HOME.y, duration: 90, ease: "Cubic.easeIn", onComplete: res }); });
      this.cameras.main.shake(50, 0.0015);
    }
    // the crate label glows gold
    this.crateLabel.setColor(HEX_GOLD).setAlpha(1);
    this.time.delayedCall(1600, () => { if (this.crateLabel.active) this.crateLabel.setColor(HEX_STAMP_RED).setAlpha(0.5); });
    // the office's paradoxical toast — books file BACK onto the shelf
    this.clearCrate();
    await this.populateShelf("APPROVED".split(""), "String");
    this.createConfetti(SHELF_CX, SHELF_Y0 + 40, 36);
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

    const title = this.add.text(640, 190, "ORDERS EXECUTED", { font: "bold 32px Georgia", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(91).setScale(0);
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

    // badge — a stamp over a departing book
    const badge = this.add.container(640, 465).setDepth(91).setAlpha(0);
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillCircle(0, 0, 30);
    bg.lineStyle(3, C_GOLD, 1);
    bg.strokeCircle(0, 0, 30);
    bg.fillStyle(C_CYAN, 0.85);
    bg.fillRoundedRect(-14, 0, 24, 13, 2);
    bg.fillStyle(0x241a0e, 1);
    bg.lineStyle(1, C_BRASS, 0.8);
    bg.fillRect(2, -14, 4, 7);
    bg.fillRoundedRect(-2, -8, 12, 5, 1);
    bg.lineStyle(1.5, C_STAMP_RED, 0.9);
    bg.lineBetween(-12, 3, 8, 10);
    badge.add(bg);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 1950 });
    const badgeLbl = this.add.text(640, 505, "remove() SCHEMA ACQUIRED", { font: "bold 13px Georgia", color: HEX_GOLD }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: badgeLbl, alpha: 1, duration: 300, delay: 2100 });

    this._makeButton(500, 545, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(765, 545, "NEXT: The Clearing Sale →", 265, 44, { fill: 0x00733a, stroke: C_GREEN_BRIGHT, textColor: "#ffffff" }, () => {
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
