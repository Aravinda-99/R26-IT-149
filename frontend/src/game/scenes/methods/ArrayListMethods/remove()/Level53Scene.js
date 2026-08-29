/**
 * Level 53 — "The Clearing Sale" (ArrayList Methods: Tuning Phase —
 * remove())
 * ===========================================================================
 * Tunes the Level 52 remove() schema under time pressure. The pocket
 * watch IS the timer — one sweep tween drives the stepped hand, the
 * mainspring's loosening spiral, and the subdial gauge; timeout fires
 * from the tween's onComplete after a final loud tick + gavel strike.
 * No parallel clock.
 *
 * The level's two central fluency events:
 *  - THE INTEGER OVERLOAD AMBIGUITY: on ArrayList<Integer>, a bare int
 *    argument resolves to remove(int index) — always, silently, even
 *    when the value is sitting right there. A BOXED argument
 *    (Integer.valueOf(n)) resolves to remove(Object) — by-value search.
 *    The two overloads never fall back to each other. String lists have
 *    no such ambiguity (String args are always by-value).
 *  - THE REMOVE-IN-LOOP SKIP: `for (i=0; i<list.size(); i++) { ...
 *    remove(i) ... }` genuinely skips the element that slides into the
 *    just-visited index, because i++ advances past it. This must EMERGE
 *    from honest splice + live size() re-evaluation each iteration, not
 *    be scripted.
 * The evaluator reuses L52's withdrawal/sweep/crash machinery plus L50's
 * loop engine, extended with overload resolution and a size column in
 * the Mutation Tracker (the L50 Traversal Tracker's tuning-level name
 * here, since it now also logs mutations).
 */

import Phaser from "phaser";
import { GameManager } from "../../../../GameManager.js";
import { WellbeingAPI } from "../../../../../api/api.js";
import { BadgeSystem } from "../../../../BadgeSystem.js";
import { BehavioralRules } from "../../../../ml/BehavioralRules.js";

const W = 1280, H = 720;

const C_CYAN = 0x4fc3f7, C_GOLD = 0xffd740, C_ORANGE = 0xff9800, C_VIOLET = 0xb39ddb;
const C_GREEN_BRIGHT = 0x00e676, C_RED = 0xf44336, C_GRAY = 0x78909c, C_BRASS = 0xc8a05a;
const C_STAMP_RED = 0xc62828;
const HEX_CYAN = "#4fc3f7", HEX_GOLD = "#ffd740", HEX_ORANGE = "#ff9800", HEX_VIOLET = "#b39ddb";
const HEX_GREEN_BRIGHT = "#00e676", HEX_RED = "#f44336", HEX_GRAY = "#78909c", HEX_BRASS = "#c8a05a";
const HEX_STAMP_RED = "#c62828";

// Clearing desk + lot ticket
const DESK_X0 = 250, DESK_X1 = 760, DESK_Y0 = 100, DESK_Y1 = 460;
const TICKET_X0 = 270, TICKET_X1 = 640, TICKET_Y0 = 120, TICKET_Y1 = 400;
const TICKET_CX = (TICKET_X0 + TICKET_X1) / 2, TICKET_CY = (TICKET_Y0 + TICKET_Y1) / 2;
// Pocket watch
const WATCH_X = 700, WATCH_Y = 280, WATCH_R = 62, DIAL_R = 54;
// Compact reference shelf + crate
const SHELF_X0 = 790, SHELF_X1 = 990, SHELF_Y0 = 90, SHELF_Y1 = 470;
const SHELF_CX = (SHELF_X0 + SHELF_X1) / 2;
const SHELF_BASE_Y = 440, SHELF_STEP = 46;
const CRATE = { x0: 790, y0: 500, x1: 990, y1: 570 };
const CRATE_CX = (CRATE.x0 + CRATE.x1) / 2;
// List state panel + mutation tracker
const PANEL_X = 1010, PANEL_Y = 90, PANEL_W = 230, PANEL_H = 250;
const TRK_X = 1010, TRK_Y = 355, TRK_W = 230, TRK_H = 205;
const TUTORIAL_KEY = "level53_tutorial_done";
const WAVE_TIME = { 1: 12000, 2: 10000, 3: 9000 };

// ══════════════════════════════════════════════════════════════
// ROUND CONFIGURATION
// ══════════════════════════════════════════════════════════════
const ROUNDS = [
  // ══ WAVE 1 — Rapid Clearances (12s) ══
  { round: 1, wave: 1, type: "predict",
    initialList: ["A", "B", "C", "D"], listType: "String", listName: "list",
    source: ["list.remove(2);"],
    question: "What is the list state?", correct: "[A, B, D]",
    options: [
      { value: "[A, B, D]", tag: null },
      { value: "[A, B, null, D]", tag: "remove_leaves_null_belief" },
      { value: "[A, D]", tag: "remove_takes_two_belief" },
      { value: "[A, B, C]", tag: "remove_from_end_belief" },
    ],
    concept: "fluent_remove_middle" },

  { round: 2, wave: 1, type: "predict",
    initialList: ["A", "B", "C"], listType: "String", listName: "list",
    source: ["list.remove(0);"],
    question: "AFTER this line, what is at index 0?", correct: "B",
    options: [
      { value: "B", tag: null },
      { value: "A", tag: "get_removes_element_belief" },
      { value: "(empty)", tag: "remove_leaves_gap_belief" },
      { value: "C", tag: "remove_shifts_two_belief" },
    ],
    concept: "fluent_shift_after_front_remove" },

  { round: 3, wave: 1, type: "predict",
    initialList: [10, 20, 30, 40], listType: "Integer", listName: "nums",
    source: ["nums.remove(1);", "nums.remove(1);"],
    question: "What is the list state?", correct: "[10, 40]",
    options: [
      { value: "[10, 40]", tag: null, label: "[10, 40]" },
      { value: "[10, 30]", tag: "indices_stable_after_remove_belief", label: "[10, 30]" },
      { value: "[30, 40]", tag: "remove_from_front_belief", label: "[30, 40]" },
      { value: "[10]", tag: "remove_takes_two_belief", label: "[10]" },
    ],
    revealNote: "Twice at the SAME index: the first takes 20 (30 and 40 slide down); the second remove(1) takes 30 — the new tenant of index 1. Two removals at one index eat consecutive elements.",
    concept: "fluent_repeated_same_index" },

  { round: 4, wave: 1, type: "predict",
    initialList: ["draft", "final", "draft"], listType: "String", listName: "list",
    source: ['list.remove("draft");'],
    question: "What is the list state?", correct: "[final, draft]",
    options: [
      { value: "[final, draft]", tag: null, label: "[final, draft] — first match" },
      { value: "[final]", tag: "remove_by_value_removes_all_belief", label: "[final] — all drafts" },
      { value: "[draft, final]", tag: "remove_by_value_from_end_belief", label: "[draft, final] — last match" },
      { value: "crash", tag: "remove_by_value_invalid_belief", label: "Exception" },
    ],
    concept: "fluent_by_value_first_match" },

  { round: 5, wave: 1, type: "predict",
    initialList: ["A", "B"], listType: "String", listName: "list",
    source: ["String x = list.remove(1);"],
    question: "What is stored in x, and the size after?", correct: "B_size1",
    options: [
      { value: "B_size1", tag: null, label: "x = 'B', size 1" },
      { value: "true_size1", tag: "remove_returns_boolean_belief", label: "x = true, size 1" },
      { value: "B_size2", tag: "size_unchanged_after_remove_belief", label: "x = 'B', size 2" },
      { value: "A_size1", tag: "remove_returns_survivor_belief", label: "x = 'A', size 1" },
    ],
    concept: "fluent_return_and_size" },

  // ══ WAVE 2 — The Overload Auction (10s) ══
  { round: 6, wave: 2, type: "predict",
    initialList: [10, 20, 30], listType: "Integer", listName: "nums",
    source: ["nums.remove(2);"],
    question: "What is the list state?", correct: "[10, 20]",
    options: [
      { value: "[10, 20]", tag: null, label: "[10, 20] — removed INDEX 2 (the 30)" },
      { value: "[10, 30]", tag: "integer_remove_by_value_belief", label: "[10, 30] — removed the value 20?" },
      { value: "[10, 20, 30]", tag: "value_2_not_found_belief", label: "unchanged — no value 2 found" },
      { value: "crash", tag: "overload_ambiguity_crashes_belief", label: "Compile error — ambiguous call" },
    ],
    revealNote: "THE TRAP, sprung: on a number list, a bare int is an INDEX — always. The order slip's '2' flags gold as 'index'; shelf 2's book (the 30) departs. Java never guesses 'maybe they meant the value' — the int overload wins, silently.",
    concept: "integer_bare_int_is_index" },

  { round: 7, wave: 2, type: "predict",
    initialList: [10, 20, 30], listType: "Integer", listName: "nums",
    source: ["nums.remove(Integer.valueOf(20));"],
    question: "What is the list state?", correct: "[10, 30]",
    options: [
      { value: "[10, 30]", tag: null, label: "[10, 30] — removed the VALUE 20" },
      { value: "[10, 20]", tag: "boxed_remove_by_index_belief", label: "[10, 20] — removed index... 20?" },
      { value: "crash", tag: "boxed_index_out_of_bounds_belief", label: "IndexOutOfBoundsException (index 20)" },
      { value: "[10, 20, 30]", tag: "boxed_not_found_belief", label: "unchanged" },
    ],
    revealNote: "The BOXED argument — Integer.valueOf(20) — selects the by-VALUE overload: the search sweep hunts the value 20, finds it at shelf 1, withdraws it. Boxing is how you say 'the value, not the position' on a number list.",
    concept: "boxed_int_is_value" },

  { round: 8, wave: 2, type: "predict",
    initialList: [5, 3, 1], listType: "Integer", listName: "nums",
    source: ["nums.remove(1);"],
    question: "What is REMOVED?", correct: "the_3",
    options: [
      { value: "the_3", tag: null, label: "The 3 (element at index 1)" },
      { value: "the_1", tag: "integer_remove_by_value_belief", label: "The 1 (the value 1)" },
      { value: "the_5", tag: "remove_from_front_belief", label: "The 5" },
      { value: "nothing", tag: "value_not_found_no_change_belief", label: "Nothing" },
    ],
    revealNote: "The cruelest form of the trap — the list CONTAINS a 1, and remove(1) STILL takes index 1 (the 3). The value's presence changes nothing: bare int = index, every time. This exact line has broken real production systems.",
    concept: "integer_trap_value_present" },

  { round: 9, wave: 2, type: "predict",
    initialList: ["red", "blue"], listType: "String", listName: "colors",
    source: ['colors.remove("blue");', "colors.remove(0);"],
    question: "What is the list state?", correct: "[]",
    options: [
      { value: "[]", tag: null, label: "[] — empty" },
      { value: "[red]", tag: "remove_by_value_not_removing_belief", label: "[red]" },
      { value: "[blue]", tag: "remove_order_confusion", label: "[blue]" },
      { value: "crash", tag: "remove_on_size_one_crashes_belief", label: "Exception on the second call" },
    ],
    revealNote: "String lists have NO ambiguity — a String argument can only be by-value, an int only by-index. 'blue' is swept out by value; then remove(0) takes 'red'. Empty shelf, size 0. The trap lives only where the element type IS a number.",
    concept: "string_list_no_ambiguity" },

  { round: 10, wave: 2, type: "predict",
    initialList: [7, 8, 9], listType: "Integer", listName: "nums",
    source: ["nums.remove(Integer.valueOf(3));"],
    question: "What happens?", correct: "no_change_false",
    options: [
      { value: "no_change_false", tag: null, label: "Nothing removed — returns false" },
      { value: "removes_index_3", tag: "boxed_remove_by_index_belief", label: "IndexOutOfBoundsException (index 3)" },
      { value: "removes_9", tag: "boxed_falls_back_to_index_belief", label: "Removes the 9 (falls back to index)" },
      { value: "crash_not_found", tag: "remove_by_value_not_found_crashes_belief", label: "Exception — value not found" },
    ],
    revealNote: "Boxed = by-value, and by-value is the gentle overload: no 3 on the shelf, the sweep fizzles, returns false, no crash, no fallback. The two overloads never trade places — the argument's TYPE decides, permanently.",
    concept: "boxed_not_found_gentle" },

  // ══ WAVE 3 — Deep Lots & Bug Hunt ══
  { round: 11, wave: 3, type: "trace",
    initialList: ["A", "B", "C"], listType: "String", listName: "list",
    source: ["String x = list.remove(0);", "list.remove(x);"],
    question: "What is the list state?", correct: "[B, C]",
    options: [
      { value: "[B, C]", tag: null, label: "[B, C] — second call found no 'A'" },
      { value: "[C]", tag: "remove_chains_belief", label: "[C] — two removed" },
      { value: "[B]", tag: "remove_order_confusion", label: "[B]" },
      { value: "crash", tag: "remove_by_value_not_found_crashes_belief", label: "Exception" },
    ],
    revealNote: "Trace it: remove(0) takes 'A' and hands it to x; then remove(x) sweeps for the VALUE 'A' — already gone! The sweep fizzles, returns false, no change. [B, C] survives. Removed things stay removed.",
    concept: "trace_remove_then_hunt_removed" },

  { round: 12, wave: 3, type: "trace",
    initialList: ["A", "B", "C", "D"], listType: "String", listName: "list",
    source: ["for (int i = 0; i < list.size(); i++) {", "    list.remove(0);", "}"],
    question: "What is the list state after the loop?", correct: "[C, D]",
    options: [
      { value: "[C, D]", tag: null, label: "[C, D] — the loop stopped early!" },
      { value: "[]", tag: "loop_visits_all_after_remove_belief", label: "[] — all removed" },
      { value: "[D]", tag: "off_by_one_guess", label: "[D]" },
      { value: "crash", tag: "remove_in_loop_crashes_belief", label: "Exception mid-loop" },
    ],
    revealNote: "The size column tells it: i=0, size=4 → remove (size 3); i=1, size=3 → remove (size 2); i=2, size=2 → 2 < 2 FALSE, loop ends. Each removal shrinks the horizon the condition re-reads — the loop and the list meet in the middle. TWO removed, not four.",
    concept: "trace_shrinking_horizon" },

  { round: 13, wave: 3, type: "trace",
    initialList: [1, 2, 3], listType: "Integer", listName: "nums",
    source: ["nums.remove(2);", "nums.remove(Integer.valueOf(2));"],
    question: "What is the list state?", correct: "[1]",
    options: [
      { value: "[1]", tag: null, label: "[1]" },
      { value: "[1, 3]", tag: "boxed_remove_by_index_belief", label: "[1, 3]" },
      { value: "[3]", tag: "integer_remove_by_value_belief", label: "[3]" },
      { value: "[1, 2]", tag: "remove_overload_confusion", label: "[1, 2]" },
    ],
    revealNote: "Both overloads, back to back: the bare 2 takes INDEX 2 (the 3) → [1, 2]; the boxed 2 hunts the VALUE 2 → [1]. One number, two meanings, one character's difference — Integer.valueOf is the whole distinction.",
    concept: "trace_both_overloads" },

  { round: 14, wave: 3, type: "bughunt", listType: "Integer", listName: "nums",
    initialList: [10, 2, 30],
    lines: ["ArrayList<Integer> nums = /* [10, 2, 30] */;", "nums.remove(2);", "// intent: remove the VALUE 2"],
    faultLine: 2, faultToken: "2",
    fix: "nums.remove(Integer.valueOf(2));",
    explanation: "The bare 2 is an INDEX — it withdrew the 30 (shelf 2), not the value 2. On number lists, boxing is the only way to say 'the value': Integer.valueOf(2). The most famous remove() bug in Java — now it's yours to spot forever.",
    wrongTag: "integer_remove_by_value_belief",
    revealNote: "Dual-future reveal: the buggy run's order slip flags '2' gold as 'index' and the 30 departs — the report shows [10, 2], the intended target still sitting there. Shelf resets; the fixed run's boxed token sweeps for the value 2 and withdraws it — [10, 30]. One wrapper between you and the wrong lot.",
    concept: "integer_ambiguity_bug" },

  { round: 15, wave: 3, type: "bughunt", listType: "String", listName: "list",
    initialList: ["ad", "ad", "news"],
    lines: ["for (int i = 0; i < list.size(); i++) {", '    if (list.get(i).equals("ad")) {', "        list.remove(i);", "    }", "}", '// intent: remove ALL "ad" entries'],
    faultLine: 1, faultToken: "i++",
    fix: "i--;  after each removal (or iterate backward)",
    explanation: "The remove-in-loop skip: removing at i slides the NEXT element INTO i — then i++ steps past it, unexamined. The second 'ad' slid into index 0 and was never checked. The classic fixes: decrement i after a removal, or walk the list backward.",
    wrongTag: "remove_in_loop_skips_belief",
    revealNote: "Dual-future reveal: the buggy run — i=0 removes the first 'ad', the second 'ad' slides into index 0 with the 'skipped!' ghost-flag as i++ jumps to 1; the loop ends with ['ad', 'news'] — one ad SURVIVED. Shelf resets; the fixed run (with i-- after removal) re-examines index 0, catches the second 'ad', ends clean: ['news'].",
    concept: "remove_in_loop_bug" },
];

const MISCONCEPTION_FEEDBACK = {
  remove_leaves_null_belief: "No holes in an ArrayList — the gap closes the instant the book departs. Everything above slides down one; the list is always packed tight.",
  remove_takes_two_belief: "One order, one book. remove() takes exactly the element you named — the rest slide down and stay.",
  remove_from_end_belief: "The index names the shelf exactly — no defaults, no ends. remove(1) is shelf 1, nothing else.",
  get_removes_element_belief: "The office lesson holds at auction speed — get looks, remove takes. Only one of them fills the crate.",
  remove_leaves_gap_belief: "No holes in an ArrayList — the gap closes the instant the book departs. Everything above slides down one; the list is always packed tight.",
  remove_shifts_two_belief: "Each book above the gap slides down exactly ONE shelf — the order is preserved, only the numbers change.",
  indices_stable_after_remove_belief: "The renumbering is the removal's second act — the book that lived at index 2 lives at index 1 now. Old index maps lie after a removal; re-read the shelf.",
  remove_from_front_belief: "remove(index) targets an exact shelf number, not the front or back. Read the index precisely.",
  remove_by_value_removes_all_belief: "The sweep stops at the FIRST match — one order, one withdrawal. To take every copy, file the order again.",
  remove_by_value_from_end_belief: "The sweep climbs from shelf 0 — the LOWEST match goes first, always.",
  remove_by_value_invalid_belief: "Removing by value is perfectly legal Java for Strings — the sweep hunts the first equal element. No compile error here.",
  remove_returns_boolean_belief: "remove(INDEX) returns the ELEMENT it took. (The by-VALUE overload is the one that returns true/false.) Know which order you filed.",
  size_unchanged_after_remove_belief: "The counter ticked down before your eyes — every removal shrinks the size by exactly one.",
  remove_returns_survivor_belief: "The return is the book that DEPARTED — the survivors stay on the shelf, unreturned.",
  integer_remove_by_value_belief: "On a number list, a bare int is an INDEX — always, even when the value sits right there on the shelf. To hunt a VALUE, box it: Integer.valueOf(n).",
  value_2_not_found_belief: "The bare int never went hunting — it read '2' as a shelf number and took what lived there.",
  overload_ambiguity_crashes_belief: "No compile error — Java resolves the ambiguity SILENTLY in favor of the int overload. That silence is exactly why this trap bites.",
  boxed_remove_by_index_belief: "Boxed means by-VALUE — Integer.valueOf(20) sweeps for the value 20, never shelf 20. The argument's TYPE picks the overload, permanently.",
  boxed_index_out_of_bounds_belief: "The overloads never trade places or fall back — boxed stays by-value even when no match exists (returns false, no crash).",
  boxed_not_found_belief: "Boxed = by-value; the sweep genuinely ran and found nothing, so nothing changed. It never silently falls back to being an index.",
  value_not_found_no_change_belief: "The bare int is never a value search — it named shelf 1, and shelf 1 held the 3. Nothing about 'not found' applies to bare-int removal.",
  remove_by_value_not_removing_belief: "The sweep genuinely ran and found the value — trace both lines; 'blue' really does leave, then 'red' follows.",
  remove_order_confusion: "Trace one line at a time — each removal changes what the next line sees.",
  remove_on_size_one_crashes_belief: "remove(0) on a one-element list is perfectly legal — index 0 exists whenever size ≥ 1.",
  boxed_falls_back_to_index_belief: "The overloads never trade places or fall back — boxed stays by-value even when no match exists (returns false, no crash).",
  remove_by_value_not_found_crashes_belief: "By-value is the gentle overload — no match, no harm, returns false. Only the INDEX overload crashes on bad input.",
  remove_chains_belief: "remove(x) hunts x's VALUE — and that value already left in line one. The sweep fizzles; nothing more departs.",
  loop_visits_all_after_remove_belief: "The condition re-reads size() EVERY lap — each removal shrinks the horizon. Watch the tracker's size column: the loop and the list meet in the middle.",
  off_by_one_guess: "Trace the size column lap by lap — the loop doesn't just stop one early or late, it stops exactly where i meets the shrinking size.",
  remove_in_loop_crashes_belief: "No crash here — i stays under the live size the whole way. The failure is quieter: elements skipped, not exceptions thrown.",
  remove_overload_confusion: "Two overloads, one rule: bare int → index; boxed Integer (or any object) → value. Read the argument's type before you predict the lot.",
  remove_in_loop_skips_belief: "The bug isn't the removal — it's the step AFTER it. The gap-close slides the next element into the visited index, and i++ walks past it unexamined.",
  timeout: "The hand struck twelve — lot passed! Fluent clerks call it inside one sweep. Read the argument's type first; the rest follows.",
};

export class Level53Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level53Scene" });
  }

  init() {
    this.currentRound = 0;
    this.currentWave = 1;
    this.score = 0;
    this.displayScore = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.lives = 5;
    this.correctFirstTry = 0;
    this.fastBonusCount = 0;
    this.totalTimePctUsed = 0;
    this.attemptLog = [];
    this.roundElements = [];
    this.roundStartTime = 0;
    this.roundTimeLimit = 12000;
    this.currentList = [];
    this.currentListType = null;
    this.currentListName = "list";
    this.shelfBookSprites = [];
    this.crateContents = [];
    this.inputLocked = true;
    this.gameEnded = false;
    this._alive = true;
    this._bubble = null;
    this._sweepTween = null;
    this._sweepProgress = 0;
    this._watchFrozen = false;
    this._watchRunning = false;
    this._lastTick = 0;
    this._handStep = 0;
    this._waveSquares = [];
    this._trackerRows = [];
    // "Review the basics" in the Bit menu sends the player back to this
    // wing's Accretion-phase intro (which has the real tutorial) instead of
    // restarting this rapid-fire Tuning-phase level with nothing to review.
    this.baseTutorialScene = "Level52Scene";
  }

  preload() {}

  create() {
    this._alive = true;
    this.events.once("shutdown", () => { this._alive = false; this._killSweepTween(); });

    const cam = this.cameras.main;
    const zoom = Math.min(this.scale.width / W, this.scale.height / H);
    cam.setZoom(zoom);
    cam.centerOn(W / 2, H / 2);
    cam.setBackgroundColor("#0a0704");

    try { GameManager.incrementAttempt(52); } catch (_) {}

    this.createParticleTexture();
    this.createBackground();
    this.createBackWall();
    this.createBunting();
    this.createAuctioneersPodium();
    this.createSoldLotShelf();
    this.createClearingSaleBanner();
    this.createArchiveFloor();
    this.createParticles();
    this.createClearingDesk();
    this.createPocketWatch();
    this.createReferenceBookshelf();
    this.createReferenceCrate();
    this.createReferenceListStatePanel();
    this.createMutationTracker();
    this.createHUD();
    this.createBit();

    cam.fadeIn(700, 3, 3, 5);
    this.checkTutorial();
  }

  update(time, delta) {
    // Pause dynamic game elements if an ML intervention menu is currently on screen
    if (GameManager.interventionInFlight) {
      if (this._sweepTween && this._sweepTween.isPlaying()) {
        this._sweepTween.pause();
        this._watchFrozen = true;
      }
      return; // Return early to stop particles and the watch from animating
    } else {
      // Resume the pocket watch timer tween if the menu was just dismissed
      if (this._sweepTween && this._sweepTween.isPaused()) {
        this._sweepTween.resume();
        this._watchFrozen = false;
        this._watchRunning = true;
      }
    }

    this.updateParticles(time, delta);
    this.updateWatch(time);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // BACKGROUND — the clearing sale hall
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l53_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l53_dot", 8, 8);
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

  createBunting() {
    this._pennants = [];
    const g = this.add.graphics().setDepth(2);
    g.lineStyle(1, C_BRASS, 0.3);
    const x0 = 120, x1 = 1160, sag = 30;
    const n = 14;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const x = x0 + (x1 - x0) * t;
      const y = 70 + Math.sin(t * Math.PI) * sag;
      if (i > 0) {
        const pt = (i - 1) / n;
        const px = x0 + (x1 - x0) * pt, py = 70 + Math.sin(pt * Math.PI) * sag;
        g.lineBetween(px, py, x, y);
      }
    }
    const pennantLayer = this.add.container(0, 0).setDepth(2);
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      const x = x0 + (x1 - x0) * t;
      const y = 70 + Math.sin(t * Math.PI) * sag;
      const pg = this.add.graphics();
      const color = i % 2 === 0 ? C_BRASS : C_STAMP_RED;
      const alpha = i % 2 === 0 ? 0.25 : 0.2;
      pg.fillStyle(color, alpha);
      pg.fillTriangle(-6, 0, 6, 0, 0, 16);
      pg.setPosition(x, y);
      pennantLayer.add(pg);
      this._pennants.push(pg);
    }
  }

  createAuctioneersPodium() {
    const g = this.add.graphics().setDepth(3);
    g.fillStyle(0x241a0e, 1);
    g.lineStyle(2, 0x8a6435, 1);
    g.beginPath();
    g.moveTo(50, 620);
    g.lineTo(170, 620);
    g.lineTo(155, 420);
    g.lineTo(65, 420);
    g.closePath();
    g.fillPath(); g.strokePath();
    this.add.text(110, 460, "LOT SALE", { font: "bold 11px Georgia", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.6).setDepth(4);

    this.gavelContainer = this.add.container(110, 415).setDepth(4);
    const gv = this.add.graphics();
    gv.lineStyle(2, C_BRASS, 0.7);
    gv.lineBetween(-14, 6, 8, -10);
    gv.fillStyle(0x3a2618, 1);
    gv.fillRoundedRect(6, -16, 16, 10, 2);
    this.gavelContainer.add(gv);
  }

  async gavelStrike() {
    await new Promise((res) => { this.tweens.add({ targets: this.gavelContainer, angle: -18, duration: 90, onComplete: res }); });
    await new Promise((res) => { this.tweens.add({ targets: this.gavelContainer, angle: 0, duration: 70, ease: "Cubic.easeIn", onComplete: res }); });
    const ring = this.add.circle(110, 415, 4, C_BRASS, 0.6).setDepth(4);
    this.tweens.add({ targets: ring, radius: 18, alpha: 0, duration: 300, onUpdate: () => ring.setRadius ? null : null, onComplete: () => ring.destroy() });
    this.tweens.add({ targets: ring, scale: 4, alpha: 0, duration: 300, onComplete: () => ring.destroy() });
    this.cameras.main.shake(60, 0.001);
  }

  createSoldLotShelf() {
    const g = this.add.graphics().setDepth(2);
    g.lineStyle(2, 0x3a2618, 0.6);
    g.lineBetween(880, 150, 1150, 150);
    this._soldParcels = [];
    for (let i = 0; i < 5; i++) {
      const x = 895 + i * 55;
      const p = this.add.graphics();
      p.fillStyle(0x3a2618, 1);
      p.fillRoundedRect(x, 110, 40, 34, 2);
      p.lineStyle(1, C_BRASS, 0.4);
      p.lineBetween(x, 127, x + 40, 127);
      p.lineBetween(x + 20, 110, x + 20, 144);
      const tag = this.add.text(x + 20, 150, "SOLD", { font: "bold 9px Georgia", color: HEX_GRAY }).setOrigin(0.5).setDepth(3);
      p.setDepth(2);
      this._soldParcels.push({ g: p, tag });
    }
  }

  createClearingSaleBanner() {
    const g = this.add.graphics().setDepth(2);
    g.fillStyle(0x0a0704, 1);
    g.lineStyle(1, C_BRASS, 0.5);
    g.fillRoundedRect(220, 30, 360, 26, 3);
    g.strokeRoundedRect(220, 30, 360, 26, 3);
    this.add.text(400, 43, "T H E   C L E A R I N G   S A L E", { font: "bold 15px Georgia", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.7).setDepth(3);
  }

  createArchiveFloor() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x1a0e05, 1);
    g.fillRect(0, 635, W, 85);
    g.lineStyle(2, 0x3a2618, 1);
    g.lineBetween(0, 637, W, 637);
    g.lineStyle(1, C_BRASS, 0.15);
    g.lineBetween(300, 660, 320, 655);
    g.lineBetween(600, 670, 618, 663);
    g.lineBetween(950, 662, 970, 658);
  }

  createParticles() {
    this.ambient = [];
    const colors = [0xc8a05a, 0x8a6435, 0xa89078];
    for (let i = 0; i < 8; i++) {
      this.ambient.push(this.add.circle(Phaser.Math.Between(0, W), Phaser.Math.Between(150, 630), 1, Phaser.Utils.Array.GetRandom(colors), Phaser.Math.FloatBetween(0.03, 0.05)).setDepth(2));
    }
  }

  updateParticles(time, delta) {
    if (!this.ambient) return;
    const step = 0.014 * (delta / 16.7);
    this.ambient.forEach((p, i) => {
      p.y += step;
      p.x += Math.sin(time * 0.0006 + i) * 0.045;
      if (p.y > 630) { p.y = 150; p.x = Phaser.Math.Between(0, W); }
    });
  }

  // ══════════════════════════════════════════════════════════════
  // THE CLEARING DESK + LOT TICKET
  // ══════════════════════════════════════════════════════════════

  createClearingDesk() {
    const g = this.add.graphics().setDepth(4);
    g.fillStyle(0x1a0e05, 1);
    g.lineStyle(3, 0x8a6435, 1);
    g.fillRoundedRect(DESK_X0, DESK_Y0, DESK_X1 - DESK_X0, DESK_Y1 - DESK_Y0, 8);
    g.strokeRoundedRect(DESK_X0, DESK_Y0, DESK_X1 - DESK_X0, DESK_Y1 - DESK_Y0, 8);
    g.lineStyle(1, 0x3a2618, 0.3);
    for (let y = DESK_Y0 + 10; y < DESK_Y1 - 6; y += 7) g.lineBetween(DESK_X0 + 6, y, DESK_X1 - 6, y);
    g.lineStyle(2, C_BRASS, 0.6);
    [[DESK_X0 + 4, DESK_Y0 + 4, 1, 1], [DESK_X1 - 4, DESK_Y0 + 4, -1, 1], [DESK_X0 + 4, DESK_Y1 - 4, 1, -1], [DESK_X1 - 4, DESK_Y1 - 4, -1, -1]].forEach(([x, y, sx, sy]) => {
      g.lineBetween(x, y, x + 12 * sx, y);
      g.lineBetween(x, y, x, y + 12 * sy);
    });

    const t = this.add.graphics().setDepth(5);
    t.fillStyle(0xe0d6b8, 1);
    t.lineStyle(2, 0x8a6435, 1);
    t.fillRoundedRect(TICKET_X0, TICKET_Y0, TICKET_X1 - TICKET_X0, TICKET_Y1 - TICKET_Y0, 4);
    t.strokeRoundedRect(TICKET_X0, TICKET_Y0, TICKET_X1 - TICKET_X0, TICKET_Y1 - TICKET_Y0, 4);
    t.lineStyle(1, 0x8a6435, 0.3);
    for (let y = TICKET_Y0 + 8; y < TICKET_Y1 - 8; y += 7) t.fillCircle(TICKET_X0 + 4, y, 1);
    this.ticketLabel = this.add.text(TICKET_X1 - 10, TICKET_Y0 + 8, "", { font: "bold 11px Courier New", color: "#8a6435" }).setOrigin(1, 0).setAlpha(0.7).setDepth(6);
    this.ticketQuestionText = this.add.text(TICKET_CX, TICKET_Y1 - 16, "", { font: "14px Georgia", color: "#241a0e" }).setOrigin(0.5).setDepth(6);
    this.ticketContainer = this.add.container(0, 0).setDepth(6);
  }

  clearTicket() { this.ticketContainer.removeAll(true); this.ticketQuestionText.setText(""); }

  /** Dark-on-cream syntax tokenizer for the lot ticket. */
  _ticketTokenize(line) {
    const tokens = [];
    const re = /("(?:[^"\\]|\\.)*")|(\bArrayList\b|\bnew\b|\bfor\b|\bint\b|\bif\b)|(<\w*>)|(Integer\.valueOf)|(\.remove\b|\.get\b|\.size\b|\.equals\b)|(-?\d+)|([(){};,=+\-!])/g;
    let last = 0, m;
    const plain = (t) => t && tokens.push({ t, c: "#241a0e" });
    while ((m = re.exec(line))) {
      if (m.index > last) plain(line.slice(last, m.index));
      if (m[1]) tokens.push({ t: m[1], c: "#d84315" });
      else if (m[2]) tokens.push({ t: m[2], c: "#1565c0" });
      else if (m[3]) tokens.push({ t: m[3], c: "#e65100" });
      else if (m[4]) tokens.push({ t: m[4], c: "#6a1b9a" });
      else if (m[5]) tokens.push({ t: m[5], c: m[5] === ".remove" ? "#c62828" : "#1565c0" });
      else if (m[6]) tokens.push({ t: m[6], c: "#e65100" });
      else if (m[7]) tokens.push({ t: m[7], c: /[()]/.test(m[7]) ? "#c62828" : "#78909c" });
      last = m.index + m[0].length;
    }
    if (last < line.length) plain(line.slice(last));
    return tokens.length ? tokens : [{ t: line, c: "#241a0e" }];
  }

  showTrialOnTicket(lines, questionText) {
    this.clearTicket();
    const maxLen = Math.max(...lines.map((l) => l.length));
    const fontSize = maxLen > 42 ? 10 : maxLen > 34 ? 11 : 13;
    const lineH = fontSize + 10;
    const startY = TICKET_CY - 20 - ((lines.length - 1) * lineH) / 2;
    lines.forEach((line, i) => {
      const y = startY + i * lineH;
      if (line.trim().startsWith("//")) {
        const t = this.add.text(TICKET_CX, y, line, { font: `italic ${fontSize}px Courier New`, color: "#78909c" }).setOrigin(0.5).setAlpha(0);
        this.ticketContainer.add(t);
        this.tweens.add({ targets: t, alpha: 1, duration: 180 });
        return;
      }
      const tokens = this._ticketTokenize(line);
      const measured = tokens.map((tk) => { const tmp = this.add.text(0, 0, tk.t, { font: `bold ${fontSize}px Courier New` }); const w = tmp.width; tmp.destroy(); return w; });
      const totalW = measured.reduce((a, b) => a + b, 0);
      let x = TICKET_CX - totalW / 2;
      tokens.forEach((tok, ti) => {
        const t = this.add.text(x, y, tok.t, { font: `bold ${fontSize}px Courier New`, color: tok.c }).setOrigin(0, 0.5).setAlpha(0);
        this.ticketContainer.add(t);
        this.tweens.add({ targets: t, alpha: 1, duration: 180 });
        x += measured[ti];
      });
    });
    if (questionText) this.ticketQuestionText.setText(questionText);
    this.ticketLabel.setText(`LOT ${this.currentRound + 1}/15`);
  }

  async stampTicket(kind) {
    const labels = { cleared: "CLEARED", disputed: "DISPUTED", unsold: "PASSED — UNSOLD" };
    const colors = { cleared: HEX_GREEN_BRIGHT, disputed: HEX_RED, unsold: HEX_RED };
    const stamp = this.add.text(TICKET_CX, TICKET_CY, labels[kind], { font: "bold 21px Georgia", color: colors[kind] }).setOrigin(0.5).setDepth(30).setScale(1.4).setAngle(-8).setAlpha(0);
    this.ticketContainer.add(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 180 });
    const hold = kind === "unsold" ? 1800 : 700;
    await this.delay(hold);
    if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 200, onComplete: () => stamp.destroy() });
  }

  async tearTicket() {
    if (this.ticketContainer.list.length === 0) return;
    const stub = this.add.rectangle(TICKET_X0 + 6, TICKET_CY, 8, TICKET_Y1 - TICKET_Y0, 0xe0d6b8, 0.5).setDepth(7);
    this.tweens.add({ targets: this.ticketContainer, x: 30, alpha: 0, duration: 220, ease: "Cubic.easeIn" });
    await this.delay(250);
    this.clearTicket();
    this.ticketContainer.setPosition(0, 0).setAlpha(1);
    this.tweens.add({ targets: stub, alpha: 0, duration: 300, delay: 150, onComplete: () => stub.destroy() });
  }

  // ══════════════════════════════════════════════════════════════
  // THE POCKET WATCH (THE TIMER)
  // ══════════════════════════════════════════════════════════════

  createPocketWatch() {
    this.watch = this.add.container(WATCH_X, WATCH_Y).setDepth(7);

    // chain
    const chain = this.add.graphics().setDepth(6);
    chain.lineStyle(1, C_BRASS, 0.5);
    for (let i = 0; i < 9; i++) {
      const t = i / 8;
      chain.strokeCircle(WATCH_X - 10 - t * 90, WATCH_Y - WATCH_R - 6 - Math.sin(t * Math.PI) * 20, 2.5);
    }

    // case
    const caseG = this.add.graphics();
    caseG.fillStyle(0x0d0805, 1);
    caseG.lineStyle(3, C_BRASS, 1);
    caseG.fillCircle(0, 0, WATCH_R);
    caseG.strokeCircle(0, 0, WATCH_R);
    // crown + bow
    this.crownG = this.add.graphics();
    this.crownG.fillStyle(C_BRASS, 1);
    this.crownG.fillRoundedRect(-5, -WATCH_R - 14, 10, 8, 2);
    this.crownG.lineStyle(1, C_BRASS, 1);
    this.crownG.lineBetween(-3, -WATCH_R - 14, -3, -WATCH_R - 8);
    this.crownG.lineBetween(0, -WATCH_R - 14, 0, -WATCH_R - 8);
    this.crownG.lineBetween(3, -WATCH_R - 14, 3, -WATCH_R - 8);
    this.crownG.strokeCircle(0, -WATCH_R - 20, 5);

    // dial
    const dial = this.add.graphics();
    dial.fillStyle(0xe0d6b8, 0.9);
    dial.fillCircle(0, 0, DIAL_R);
    this.dialRimG = this.add.graphics();
    this._drawDialRim(HEX_BRASS === "gold" ? C_BRASS : 0x241a0e, 0.6);
    ["12", "3", "6", "9"].forEach((label, i) => {
      const a = (Math.PI / 2) * i - Math.PI / 2;
      const tx = Math.cos(a) * (DIAL_R - 12), ty = Math.sin(a) * (DIAL_R - 12);
      const t = this.add.text(tx, ty, label, { font: "bold 11px Georgia", color: "#241a0e" }).setOrigin(0.5).setAlpha(0.7);
      this.watch.add(t);
    });

    // mainspring aperture (12 o'clock inner)
    this.springG = this.add.graphics();
    const apertureRing = this.add.graphics();
    apertureRing.lineStyle(1, 0x8a6435, 0.6);
    apertureRing.strokeCircle(0, -22, 10);

    // subdial (mainspring gauge) at 6 o'clock
    const subRing = this.add.graphics();
    subRing.lineStyle(1, 0x8a6435, 0.5);
    subRing.strokeCircle(0, 26, 12);
    this.subNeedleG = this.add.graphics();

    // critical-state red wedge (behind the hand)
    this.wedgeG = this.add.graphics();

    // sweep hand + hub
    this.handG = this.add.graphics();
    const hub = this.add.circle(0, 0, 3, C_BRASS);

    this.watch.add([caseG, dial, this.dialRimG, this.wedgeG, apertureRing, this.springG, subRing, this.subNeedleG, this.handG, hub, this.crownG]);

    this.vignetteGfx = this.add.graphics().setDepth(88).setAlpha(0);
    this.vignetteGfx.lineStyle(40, 0x000000, 0.5);
    this.vignetteGfx.strokeRect(20, 20, W - 40, H - 40);

    this._sweepProgress = 0;
    this._watchRunning = false;
    this._drawHand(0);
    this._drawMainspring(0);
    this._drawSubdial(0);
  }

  _drawDialRim(color, alpha) {
    this.dialRimG.clear();
    this.dialRimG.lineStyle(1, color, alpha);
    for (let i = 0; i < 12; i++) {
      const a = (Math.PI / 6) * i - Math.PI / 2;
      const long = i % 3 === 0;
      const r0 = DIAL_R - (long ? 8 : 5), r1 = DIAL_R - 2;
      this.dialRimG.lineBetween(Math.cos(a) * r0, Math.sin(a) * r0, Math.cos(a) * r1, Math.sin(a) * r1);
    }
  }

  _drawHand(progress) {
    const a = progress * Math.PI * 2 - Math.PI / 2;
    this.handG.clear();
    this.handG.fillStyle(0x241a0e, 1);
    const len = 46, w = 3;
    const tipX = Math.cos(a) * len, tipY = Math.sin(a) * len;
    const perpX = -Math.sin(a) * w, perpY = Math.cos(a) * w;
    this.handG.fillTriangle(perpX, perpY, -perpX, -perpY, tipX, tipY);
  }

  _drawMainspring(progress) {
    const g = this.springG;
    g.clear();
    g.lineStyle(1.3, 0x241a0e, 0.7);
    const turns = 3.5;
    const maxR = 8.5, minR = 1.5;
    const spread = 1 + progress * 1.4;
    let prevX = null, prevY = null;
    const steps = 28;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const ang = t * turns * Math.PI * 2;
      const r = (minR + (maxR - minR) * t) * spread * (maxR / (maxR * spread) > 1 ? 1 : 1);
      const rr = Math.min(r, 9.5);
      const x = Math.cos(ang) * rr, y = -22 + Math.sin(ang) * rr;
      if (prevX !== null) g.lineBetween(prevX, prevY, x, y);
      prevX = x; prevY = y;
    }
  }

  _drawSubdial(progress) {
    const g = this.subNeedleG;
    g.clear();
    // FULL to EMPTY across a 120deg arc, pointing down-ish at 6 o'clock subdial
    const startA = -Math.PI / 2 - Math.PI / 3, endA = -Math.PI / 2 + Math.PI / 3;
    const a = startA + (endA - startA) * progress;
    g.lineStyle(1.5, C_STAMP_RED, 0.8);
    g.lineBetween(0, 26, Math.cos(a) * 9, 26 + Math.sin(a) * 9);
  }

  _watchColor() {
    const rem = 1 - this._sweepProgress;
    if (rem <= 0.15) return 0xe65100;
    if (rem <= 0.33) return 0xb8860b;
    return 0x241a0e;
  }

  updateWatch(time) {
    if (!this._watchRunning || this._watchFrozen) return;
    const rem = 1 - this._sweepProgress;

    // stepped hand: quantize to 60 steps per revolution
    const step = Math.floor(this._sweepProgress * 60);
    if (step !== this._handStep) {
      this._handStep = step;
      this._drawHand(step / 60);
      this.tweens.add({ targets: this.watch, scale: 1.01, duration: 30, yoyo: true });
    }
    this._drawSubdial(this._sweepProgress);
    if (time - (this._lastSpringDraw || 0) > 100) { this._lastSpringDraw = time; this._drawMainspring(this._sweepProgress); }
    this._drawDialRim(rem <= 0.33 ? C_STAMP_RED : 0x241a0e, rem <= 0.33 ? 0.5 : 0.6);

    // per-second tick wobble
    const tickInterval = rem <= 0.15 ? 500 : 1000;
    if (time - this._lastTick > tickInterval) {
      this._lastTick = time;
      const amp = rem <= 0.15 ? 1 : rem <= 0.33 ? 0.6 : 0.3;
      this.tweens.add({ targets: this.watch, angle: amp, duration: 60, yoyo: true });
      if (rem <= 0.15) this.tweens.add({ targets: this.crownG, y: -2, duration: 60, yoyo: true });
    }

    // critical red wedge (grows as hand closes on 12)
    this.wedgeG.clear();
    if (rem <= 0.15) {
      this.wedgeG.fillStyle(C_RED, 0.12);
      const startA = -Math.PI / 2;
      const endA = this._sweepProgress * Math.PI * 2 - Math.PI / 2;
      this.wedgeG.slice(0, 0, DIAL_R - 4, startA, endA, false);
      this.wedgeG.fillPath();
      if (time - (this._lastVignette || 0) > 900) {
        this._lastVignette = time;
        this.tweens.add({ targets: this.vignetteGfx, alpha: 0.5, duration: 110, yoyo: true, repeat: 1 });
      }
    }
  }

  startWatchSweep(timeLimitMs, onTimeout) {
    this._killSweepTween();
    this.roundTimeLimit = timeLimitMs;
    this._sweepProgress = 0;
    this._watchFrozen = false;
    this._watchRunning = true;
    this._handStep = -1;
    this.watch.setAngle(0);
    this._drawHand(0);
    this._drawSubdial(0);
    this._drawMainspring(0);
    this._drawDialRim(0x241a0e, 0.6);
    this.wedgeG.clear();
    const state = { v: 0 };
    this._sweepTween = this.tweens.add({
      targets: state, v: 1, duration: timeLimitMs, ease: "Linear",
      onUpdate: () => { this._sweepProgress = state.v; },
      onComplete: () => { if (this._alive) onTimeout(); },
    });
  }

  _killSweepTween() {
    if (this._sweepTween) { this._sweepTween.stop(); this._sweepTween = null; }
  }

  stopWatch() {
    if (this._sweepTween) this._sweepTween.pause();
    this._watchFrozen = true;
    this.tweens.add({ targets: this.crownG, y: 2, duration: 100 });
    this.time.delayedCall(100, () => { if (this.crownG.active) this.crownG.setY(0); });
  }

  getTimePctUsed() {
    const elapsed = this.time.now - this.roundStartTime;
    return Phaser.Math.Clamp(elapsed / this.roundTimeLimit, 0, 1);
  }

  /** Timeout: final loud tick + gavel strike, THEN the stamp. */
  async handStrikesTwelve() {
    this._killSweepTween();
    this._sweepProgress = 1;
    this._watchRunning = false;
    this._drawHand(1);
    this._drawSubdial(1);
    this._drawMainspring(1);
    this.tweens.add({ targets: this.watch, angle: 2, duration: 150, yoyo: true });
    this.cameras.main.shake(150, 0.003);
    await this.delay(200);
    await this.gavelStrike();
  }

  async rewindWatch() {
    await new Promise((res) => {
      const state = { v: this._sweepProgress };
      this.tweens.add({ targets: state, v: 0, duration: 400, ease: "Sine.easeOut", onUpdate: () => { this._sweepProgress = state.v; this._drawHand(state.v); this._drawSubdial(state.v); this._drawMainspring(state.v); }, onComplete: res });
    });
    this._watchRunning = false;
    this.wedgeG.clear();
    this._drawDialRim(0x241a0e, 0.6);
  }

  // ══════════════════════════════════════════════════════════════
  // COMPACT REFERENCE BOOKSHELF + CRATE
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

    const stampBg = this.add.graphics().setDepth(5);
    stampBg.fillStyle(0x0a0704, 1);
    stampBg.lineStyle(1, C_BRASS, 1);
    stampBg.fillRoundedRect(SHELF_X0 + 16, 96, 110, 20, 3);
    stampBg.strokeRoundedRect(SHELF_X0 + 16, 96, 110, 20, 3);
    this.typeStampText = this.add.text(SHELF_X0 + 71, 106, "", { font: "bold 11px Courier New", color: HEX_CYAN }).setOrigin(0.5).setDepth(6);

    const sizeBg = this.add.graphics().setDepth(5);
    sizeBg.fillStyle(0x0a0704, 1);
    sizeBg.lineStyle(1, C_BRASS, 0.6);
    sizeBg.fillRoundedRect(SHELF_X1 - 70, 96, 58, 20, 10);
    sizeBg.strokeRoundedRect(SHELF_X1 - 70, 96, 58, 20, 10);
    this.sizeCounterText = this.add.text(SHELF_X1 - 41, 106, "size: 0", { font: "bold 11px Courier New", color: HEX_BRASS }).setOrigin(0.5).setDepth(6);

    this.shelfIndexPlates = [];
    for (let i = 0; i < 7; i++) {
      const y = SHELF_BASE_Y - i * SHELF_STEP;
      const ledge = this.add.graphics();
      ledge.fillStyle(0x3a2618, 0.6);
      ledge.lineStyle(1, 0x8a6435, 0.4);
      ledge.fillRoundedRect(SHELF_CX - 88, y - 19, 176, 38, 3);
      const idxText = this.add.text(SHELF_X0 + 20, y, String(i), { font: "bold 13px Courier New", color: HEX_GRAY }).setOrigin(0.5).setDepth(7);
      this.add.existing ? null : null;
      ledge.setDepth(4);
      this.shelfIndexPlates.push({ text: idxText, y });
    }
    this.topDashGfx = this.add.graphics().setDepth(5);
    this.ghostLayer = this.add.container(0, 0).setDepth(9);
  }

  _drawTopDash() {
    this.topDashGfx.clear();
    const idx = this.currentList.length;
    if (idx >= 7) return;
    const y = this._shelfY(idx);
    this.topDashGfx.lineStyle(1.5, C_BRASS, 0.35);
    for (let x = SHELF_CX - 34; x < SHELF_CX + 34; x += 9) this.topDashGfx.lineBetween(x, y + 15, x + 4, y + 15);
  }

  setShelfType(listType) {
    this.currentListType = listType;
    const colorMap = { String: HEX_CYAN, Integer: HEX_GOLD };
    this.typeStampText.setText(`ArrayList<${listType}>`).setColor(colorMap[listType] || HEX_CYAN);
  }

  _typeColorHex(type) { return type === "int" ? HEX_GOLD : HEX_CYAN; }
  _typeColorInt(type) { return type === "int" ? C_GOLD : C_CYAN; }
  _shelfY(idx) { return SHELF_BASE_Y - Math.min(idx, 6) * SHELF_STEP; }
  _displayValueOnSpine(entry) { return entry.type === "string" ? `"${entry.value}"` : String(entry.value); }

  _makeBookVisual(entry, x, y) {
    const color = this._typeColorInt(entry.type);
    const display = this._displayValueOnSpine(entry);
    const c = this.add.container(x, y).setDepth(6);
    const g = this.add.graphics();
    g.fillStyle(color, 0.85);
    g.lineStyle(1.5, Phaser.Display.Color.IntegerToColor(color).darken(30).color, 1);
    g.fillRoundedRect(-22, -15, 44, 30, 2);
    g.strokeRoundedRect(-22, -15, 44, 30, 2);
    const txt = this.add.text(0, 0, display, { font: "bold 11px Georgia", color: "#0a0704" }).setOrigin(0.5);
    if (display.length > 5) { txt.setAngle(-90); if (txt.width > 26) txt.setFontSize(7); }
    const label = this.add.text(0, 19, "", { font: "bold 9px Courier New", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.6);
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
      this.tweens.add({ targets: book.container, alpha: 1, duration: 120, delay: i * 60 });
      const plate = this.shelfIndexPlates[Math.min(i, 6)];
      if (plate) plate.text.setColor(this._typeColorHex(typeOf));
      this.currentList.push(entry);
      this.shelfBookSprites.push(book);
    }
    this.sizeCounterText.setText(`size: ${this.currentList.length}`);
    this.updateListStatePanel();
    this._drawTopDash();
    await this.delay(initialList.length * 60 + 150);
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

  createReferenceCrate() {
    this.crateLayer = this.add.container(0, 0).setDepth(7);
    const g = this.add.graphics().setDepth(8);
    g.fillStyle(0x241a0e, 1);
    g.lineStyle(2, 0x8a6435, 1);
    g.fillRoundedRect(CRATE.x0, CRATE.y0 + 12, CRATE.x1 - CRATE.x0, CRATE.y1 - CRATE.y0 - 12, 3);
    g.strokeRoundedRect(CRATE.x0, CRATE.y0 + 12, CRATE.x1 - CRATE.x0, CRATE.y1 - CRATE.y0 - 12, 3);
    this.crateFrontGfx = g;
    this.crateLabel = this.add.text(CRATE_CX, CRATE.y0 + 12, "WITHDRAWN", { font: "bold 11px Georgia", color: HEX_STAMP_RED }).setOrigin(0.5).setAlpha(0.5).setAngle(-2).setDepth(9);
  }

  clearCrate() {
    this.crateContents.forEach((c) => { if (c.active) this.tweens.add({ targets: c, alpha: 0, duration: 200, onComplete: () => c.destroy() }); });
    this.crateContents = [];
  }

  async landInCrate(book) {
    this.crateContents.forEach((c) => { if (c.active) this.tweens.add({ targets: c, y: c.y + 3, duration: 100 }); });
    if (this.crateContents.length >= 3) {
      const oldest = this.crateContents.shift();
      if (oldest.active) oldest.destroy();
    }
    await new Promise((res) => {
      this.tweens.add({ targets: book.container, x: CRATE_CX + Phaser.Math.Between(-20, 20), y: CRATE.y0 + 24, angle: 90, scale: 0.75, duration: 250, ease: "Sine.easeIn", onComplete: res });
    });
    this.tweens.add({ targets: this.crateFrontGfx, y: 1, duration: 50, yoyo: true });
    book.container.setDepth(7);
    this.crateContents.push(book.container);
  }

  // ══════════════════════════════════════════════════════════════
  // LIST STATE PANEL
  // ══════════════════════════════════════════════════════════════

  createReferenceListStatePanel() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0d0805, 1);
    g.lineStyle(2, C_BRASS, 1);
    g.fillRoundedRect(PANEL_X, PANEL_Y, PANEL_W, PANEL_H, 8);
    g.strokeRoundedRect(PANEL_X, PANEL_Y, PANEL_W, PANEL_H, 8);
    const header = this.add.graphics().setDepth(11);
    header.fillStyle(0x1a0e05, 1);
    header.fillRoundedRect(PANEL_X, PANEL_Y, PANEL_W, 28, { tl: 8, tr: 8, bl: 0, br: 0 });
    this.add.text(PANEL_X + 10, PANEL_Y + 14, "LIST STATE", { font: "bold 12px Georgia", color: HEX_BRASS }).setOrigin(0, 0.5).setDepth(12);
    this.syncDot = this.add.circle(PANEL_X + PANEL_W - 14, PANEL_Y + 14, 3, C_GREEN_BRIGHT, 0.7).setDepth(12);
    this.tweens.add({ targets: this.syncDot, alpha: 0.3, duration: 700, yoyo: true, repeat: -1 });

    this.bracketText = this.add.text(PANEL_X + PANEL_W / 2, PANEL_Y + 74, "[]", { font: "bold 15px Courier New", color: HEX_GRAY, wordWrap: { width: PANEL_W - 24 }, align: "center" }).setOrigin(0.5).setDepth(12);
    this.panelSizeText = this.add.text(PANEL_X + PANEL_W / 2, PANEL_Y + 108, "size: 0", { font: "12px Courier New", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.85).setDepth(12);
    this.panelIndexText = this.add.text(PANEL_X + PANEL_W / 2, PANEL_Y + 126, "", { font: "bold 11px Courier New", color: "#8a6435", wordWrap: { width: PANEL_W - 24 }, align: "center" }).setOrigin(0.5).setAlpha(0.7).setDepth(12);

    this.add.text(PANEL_X + 14, PANEL_Y + 150, "removed:", { font: "12px Georgia", color: "#8a6435" }).setOrigin(0, 0.5).setDepth(12);
    this.removedValueText = this.add.text(PANEL_X + 76, PANEL_Y + 150, "—", { font: "bold 13px Courier New", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(12);

    this.add.text(PANEL_X + 14, PANEL_Y + 174, "before:", { font: "11px Courier New", color: "#8a6435" }).setOrigin(0, 0.5).setDepth(12);
    this.beforeRowText = this.add.text(PANEL_X + 66, PANEL_Y + 174, "", { font: "bold 11px Courier New", color: "#b0bec5" }).setOrigin(0, 0.5).setDepth(12);
    this.add.text(PANEL_X + 14, PANEL_Y + 192, "after:", { font: "11px Courier New", color: "#8a6435" }).setOrigin(0, 0.5).setDepth(12);
    this.afterRowText = this.add.text(PANEL_X + 66, PANEL_Y + 192, "", { font: "bold 11px Courier New", color: HEX_GREEN_BRIGHT }).setOrigin(0, 0.5).setDepth(12);

    this.add.text(PANEL_X + 14, PANEL_Y + 214, "returned:", { font: "11px Georgia", color: "#8a6435" }).setOrigin(0, 0.5).setDepth(12);
    this.returnedFlagText = this.add.text(PANEL_X + 80, PANEL_Y + 214, "", { font: "bold 12px Courier New", color: HEX_VIOLET }).setOrigin(0, 0.5).setDepth(12);
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

  updateRemovedRow(value, type) {
    if (value === null) { this.removedValueText.setFontSize(11).setText("—").setColor(HEX_GRAY); this.returnedFlagText.setText(""); return; }
    if (type === "crash") { this.removedValueText.setText("✗ IOOBE").setColor(HEX_RED).setFontSize(9); return; }
    if (type === "boolean") { this.removedValueText.setFontSize(11).setText(String(value)).setColor(HEX_VIOLET); this.returnedFlagText.setText(`returned: ${value}`); return; }
    this.removedValueText.setFontSize(11).setText(String(value)).setColor(this._typeColorHex(type));
    this.returnedFlagText.setText("");
  }

  fillBeforeRow() {
    const s = `[${this.currentList.map((e) => String(e.value)).join(", ")}] (${this.currentList.length})`;
    this.beforeRowText.setText(s.length > 30 ? s.slice(0, 30) : s);
    this.afterRowText.setText("");
  }

  fillAfterRow() {
    const s = `[${this.currentList.map((e) => String(e.value)).join(", ")}] (${this.currentList.length})`;
    this.afterRowText.setText(s.length > 30 ? s.slice(0, 30) : s);
  }

  // ══════════════════════════════════════════════════════════════
  // MUTATION TRACKER (L50 tracker + size column)
  // ══════════════════════════════════════════════════════════════

  createMutationTracker() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0d0805, 1);
    g.lineStyle(1, C_BRASS, 0.5);
    g.fillRoundedRect(TRK_X, TRK_Y, TRK_W, TRK_H, 8);
    g.strokeRoundedRect(TRK_X, TRK_Y, TRK_W, TRK_H, 8);
    this.add.text(TRK_X + 10, TRK_Y + 12, "MUTATION TRACKER", { font: "bold 12px Georgia", color: HEX_BRASS }).setOrigin(0, 0.5).setDepth(11);
    this.trackerContainer = this.add.container(0, 0).setDepth(12);
    this._trackerRows = [];
    this._trackerDash = this.add.text(TRK_X + TRK_W / 2, TRK_Y + TRK_H / 2 + 6, "—", { font: "bold 16px Courier New", color: "#3a2618" }).setOrigin(0.5).setDepth(11);
  }

  appendTrackerRow(text, isCrash) {
    if (this._trackerDash && this._trackerDash.active) { this._trackerDash.destroy(); this._trackerDash = null; }
    const maxRows = 8;
    if (this._trackerRows.length >= maxRows) {
      const removed = this._trackerRows.shift();
      removed.destroy();
      this._trackerRows.forEach((r) => { r.y -= 22; });
    }
    const y = TRK_Y + 28 + this._trackerRows.length * 22;
    const t = this.add.text(TRK_X + 10, y, text, { font: "11px Courier New", color: isCrash ? HEX_RED : "#e8dfc8" }).setAlpha(0);
    if (t.width > TRK_W - 18) t.setFontSize(8);
    this.trackerContainer.add(t);
    this._trackerRows.push(t);
    this.tweens.add({ targets: t, alpha: 1, duration: 110 });
    return t;
  }

  clearTracker() {
    this.trackerContainer.removeAll(true);
    this._trackerRows = [];
    if (!this._trackerDash) this._trackerDash = this.add.text(TRK_X + TRK_W / 2, TRK_Y + TRK_H / 2 + 6, "—", { font: "bold 16px Courier New", color: "#3a2618" }).setOrigin(0.5).setDepth(11);
  }

  // ══════════════════════════════════════════════════════════════
  // THE WITHDRAWAL (L52-faithful, 1.4× tempo) + OVERLOAD VISUALS
  // ══════════════════════════════════════════════════════════════

  async markBook(index) {
    const book = this.shelfBookSprites[index];
    if (!book) return;
    const tag = this.add.graphics();
    tag.fillStyle(C_STAMP_RED, 0.8);
    tag.fillTriangle(22, -15, 13, -15, 22, -6);
    book.container.add(tag);
    await this.delay(280);
  }

  async withdrawBook(index, opts = {}) {
    const entry = this.currentList[index];
    const book = this.shelfBookSprites[index];
    const shelfY = this._shelfY(index);

    if (!opts.skipLocate) {
      const plate = this.shelfIndexPlates[Math.min(index, 6)];
      if (plate) { plate.text.setColor(HEX_GOLD); this.tweens.add({ targets: plate.text, scale: 1.4, duration: 110, yoyo: true }); }
      const scan = this.add.rectangle(SHELF_CX - 84, shelfY, 2, 32, 0xffd740, 0.7).setDepth(8);
      await new Promise((res) => { this.tweens.add({ targets: scan, x: SHELF_CX + 84, duration: 180, ease: "Sine.easeInOut", onComplete: () => { scan.destroy(); res(); } }); });
      if (!this._alive) return entry;
    }

    await this.markBook(index);
    if (!this._alive) return entry;

    book.container.setDepth(10);
    await new Promise((res) => { this.tweens.add({ targets: book.container, y: shelfY - 18, duration: 180, ease: "Sine.easeOut", onComplete: res }); });
    if (!this._alive) return entry;

    this.cameras.main.shake(60, 0.0015);
    const mark = this.add.text(0, 0, "X", { font: "bold 14px Georgia", color: HEX_STAMP_RED }).setOrigin(0.5).setAngle(-20).setAlpha(0);
    book.container.add(mark);
    this.tweens.add({ targets: mark, alpha: 0.95, duration: 90 });
    if (opts.capture) this._popReturnValue(entry, book.container.x, book.container.y);
    await this.delay(150);
    if (!this._alive) return entry;

    await this.landInCrate(book);
    if (!this._alive) return entry;

    this.currentList.splice(index, 1);
    this.shelfBookSprites.splice(index, 1);
    await this.delay(220);
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
          targets: b.container, y: this._shelfY(newIdx), duration: 260, ease: "Sine.easeInOut",
          onComplete: () => { b.label.setText(`[${newIdx}]`); if (++done === shifting.length) res(); },
        });
      });
    });
    this.sizeCounterText.setText(`size: ${this.currentList.length}`).setColor(HEX_RED);
    this.tweens.add({ targets: this.sizeCounterText, scale: 1.3, duration: 110, yoyo: true });
    this.time.delayedCall(500, () => { if (this.sizeCounterText.active) this.sizeCounterText.setColor(HEX_BRASS); });
    this.shelfIndexPlates.forEach((p, i) => { p.text.setColor(i < this.currentList.length ? this._typeColorHex(this.currentList[i].type) : HEX_GRAY); });
    this._drawTopDash();
    this.updateListStatePanel();
  }

  _popReturnValue(entry, fromX, fromY) {
    const valText = this.add.text(fromX, fromY, String(entry.value), { font: "bold 16px Courier New", color: this._typeColorHex(entry.type) }).setOrigin(0.5).setDepth(30);
    this.roundElements.push(valText);
    this.tweens.add({ targets: valText, alpha: 0, y: fromY - 20, duration: 500, delay: 300 });
  }

  async searchSweep(value) {
    for (let i = 0; i < this.currentList.length; i++) {
      if (!this._alive) return -1;
      const hl = this.add.rectangle(SHELF_CX, this._shelfY(i), 50, 34, C_GOLD, 0.18).setDepth(8);
      await this.delay(80);
      hl.destroy();
      if (String(this.currentList[i].value) === String(value)) return i;
    }
    return -1;
  }

  async notFoundFizzle() {
    const topY = this.currentList.length > 0 ? this._shelfY(this.currentList.length - 1) - 30 : SHELF_BASE_Y - 30;
    const p = this.add.particles(SHELF_CX, topY, "l53_dot", { speed: { min: 12, max: 35 }, angle: { min: 240, max: 300 }, scale: { start: 0.4, end: 0 }, lifespan: 350, tint: [0x9e9e9e], alpha: { start: 0.5, end: 0 }, emitting: false }).setDepth(9);
    p.explode(6);
    this.time.delayedCall(400, () => p.destroy());
    this.updateRemovedRow(false, "boolean");
    await this.delay(600);
  }

  /** Golden "index" flag pop for bare-int args on Integer lists. */
  flagArgumentAsIndex(value) {
    const t = this.add.text(TICKET_CX + 30, TICKET_CY - 40, `index`, { font: "bold 10px Courier New", color: HEX_GOLD }).setOrigin(0.5).setDepth(20).setAlpha(0);
    this.roundElements.push(t);
    this.tweens.add({ targets: t, alpha: 1, y: TICKET_CY - 48, duration: 200 });
    this.time.delayedCall(900, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 200, onComplete: () => t.destroy() }); });
  }

  /** Boxed argument visual: cyan-boxed gold token + "Integer" flag. */
  renderBoxedArgument(value) {
    const c = this.add.container(TICKET_CX + 30, TICKET_CY - 40).setDepth(20).setAlpha(0);
    const g = this.add.graphics();
    g.lineStyle(1.5, C_CYAN, 0.9);
    g.strokeRoundedRect(-22, -10, 44, 20, 4);
    const t = this.add.text(0, 0, String(value), { font: "bold 13px Courier New", color: HEX_GOLD }).setOrigin(0.5);
    const flag = this.add.text(0, -18, "Integer", { font: "bold 9px Courier New", color: HEX_CYAN }).setOrigin(0.5);
    c.add([g, t, flag]);
    this.roundElements.push(c);
    this.tweens.add({ targets: c, alpha: 1, duration: 200 });
    this.time.delayedCall(1000, () => { if (c.active) this.tweens.add({ targets: c, alpha: 0, duration: 200, onComplete: () => c.destroy() }); });
  }

  async crashWithdrawal(index) {
    const topIdx = this.currentList.length - 1;
    const startY = topIdx >= 0 ? this._shelfY(topIdx) : SHELF_BASE_Y;
    const phantomY = this._shelfY(Math.max(0, Math.min(index, 6)));
    const scan = this.add.rectangle(SHELF_CX, startY, 176, 3, C_RED, 0.6).setDepth(8);
    await new Promise((res) => { this.tweens.add({ targets: scan, y: phantomY - 8, duration: 280, ease: "Sine.easeOut", onComplete: res }); });
    if (!this._alive) { scan.destroy(); return; }
    await new Promise((res) => { this.tweens.add({ targets: scan, alpha: 0, duration: 70, yoyo: true, repeat: 3, onComplete: () => { scan.destroy(); res(); } }); });
    const stamp = this.add.text(SHELF_CX, SHELF_Y0 + 40, "IndexOutOfBoundsException", { font: "bold 11px Courier New", color: HEX_RED }).setOrigin(0.5).setAngle(-6).setAlpha(0).setDepth(25);
    this.add.existing ? null : null;
    this.roundElements.push(stamp);
    this.tweens.add({ targets: stamp, alpha: 1, duration: 120 });
    this.screenShake(0.005, 150);
    this.updateRemovedRow("", "crash");
    await this.delay(650);
    if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 180, onComplete: () => stamp.destroy() });
  }

  /** Fleeting "skipped!" ghost-flag when a loop's step advances past an
   * index that just received a slid-down element (the remove-in-loop bug). */
  showSkippedFlag(index) {
    const y = this._shelfY(index);
    const t = this.add.text(SHELF_CX + 100, y, "skipped!", { font: "italic 11px Georgia", color: HEX_RED }).setOrigin(0.5).setDepth(20).setAlpha(0);
    this.roundElements.push(t);
    this.tweens.add({ targets: t, alpha: 1, duration: 100 });
    this.time.delayedCall(400, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 150, onComplete: () => t.destroy() }); });
  }

  screenShake(intensity = 0.004, duration = 150) {
    this.cameras.main.shake(duration, intensity);
  }

  // ══════════════════════════════════════════════════════════════
  // BIT — auctioneer's clerk (visor, ticket book)
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
    const cape = this.add.graphics();
    cape.fillStyle(0x3a2618, 0.7);
    cape.lineStyle(1, C_BRASS, 0.7);
    cape.fillTriangle(-16, -14, 16, -14, 0, 20);
    const visor = this.add.graphics();
    visor.fillStyle(0x2e7d32, 0.5);
    visor.lineStyle(1, C_BRASS, 0.7);
    visor.beginPath();
    visor.arc(0, -3, 9, Math.PI * 1.1, Math.PI * 1.9, false);
    visor.strokePath();
    const gloveL = this.add.circle(-16, 10, 4, 0xe0d6b8, 0.85);
    const gloveR = this.add.circle(16, 10, 4, 0xe0d6b8, 0.85);
    const ticketBook = this.add.graphics();
    ticketBook.fillStyle(0xe0d6b8, 0.6);
    ticketBook.lineStyle(1, 0x8a6435, 0.6);
    ticketBook.fillRoundedRect(20, 4, 10, 14, 1);
    ticketBook.strokeRoundedRect(20, 4, 10, 14, 1);
    ticketBook.fillStyle(0xe0d6b8, 0.9);
    ticketBook.fillRoundedRect(22, 0, 8, 6, 1);
    c.add([g, cape, eye, pupil, visor, gloveL, gloveR, ticketBook, tip]);
    this.tweens.add({ targets: tip, alpha: 0.3, duration: 900, yoyo: true, repeat: -1 });
    // brisk, busy hover
    this.tweens.add({ targets: c, y: "+=3", duration: 1700, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
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
    this.time.delayedCall(1600, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() }); });
    return t;
  }

  createFloatingText(x, y, text, colorHex, font = "bold 15px Arial", hold = 1400) {
    const t = this.add.text(x, y, text, { font, color: colorHex, wordWrap: { width: 320 }, align: "center" }).setOrigin(0.5).setDepth(31).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 180 });
    this.time.delayedCall(hold, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() }); });
    return t;
  }

  createConfetti(x, y, count = 30) {
    const p = this.add.particles(x, y, "l53_dot", {
      speed: { min: 80, max: 240 }, angle: { min: 0, max: 360 }, scale: { start: 0.9, end: 0 }, lifespan: 500,
      tint: [C_BRASS, C_GOLD, C_STAMP_RED, C_CYAN, 0xffffff], emitting: false,
    }).setDepth(75);
    p.explode(count);
    this.time.delayedCall(900, () => p.destroy());
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

    this.add.text(20, 14, "THE CLEARING SALE", { font: "bold 17px Georgia", color: "#b0bec5" }).setDepth(50);
    this.add.text(20, 32, "Tuning Phase — remove()", { font: "13px Arial", color: "#546e7a" }).setDepth(50);

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
    for (let i = 0; i < 5; i++) {
      const lg = this.add.graphics({ x: 1150 + i * 20, y: 24 }).setDepth(50);
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
    await this.bitSay("Welcome to the Clearing Sale, Clerk — fastest day in the archive's year. Every lot ticket gets one sweep of the watch; call it before the hand strikes twelve. You know remove() from the office — today it moves at auction speed.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(5000)]); if (!A()) return;
    this.hideBubble();

    this.currentListName = "list";
    await this.populateShelf(["A", "B"], "String"); if (!A()) return;
    this.showTrialOnTicket(["list.remove(0)"], "What is the list state?");
    this.createAnnotation(TICKET_CX, TICKET_Y0 - 12, "the lot to call", "#d84315");
    await this.delay(300); if (!A()) return;
    this.createAnnotation(WATCH_X, WATCH_Y - WATCH_R - 30, "one sweep = your window", HEX_GOLD);
    await this.delay(300); if (!A()) return;
    this.createAnnotation(SHELF_CX, SHELF_Y0 - 10, "the truth, stamped and shifted", HEX_GREEN_BRIGHT);
    await this.delay(300); if (!A()) return;
    this.createAnnotation(TRK_X + TRK_W / 2, TRK_Y - 10, "every removal logged, size and all", HEX_VIOLET);
    await this.delay(400); if (!A()) return;

    await this.bitSay("The crate takes what leaves; the gap always closes. Eyes sharp — the sale begins!");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4000)]); if (!A()) return;
    this.hideBubble();
    this.clearTicket();

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

    const banners = { 1: "WAVE 1 — RAPID CLEARANCES", 2: "WAVE 2 — THE OVERLOAD AUCTION", 3: "WAVE 3 — DEEP LOTS & BUG HUNT" };
    await this.showWaveBanner(banners[waveNumber]);
    if (!this._alive) return;

    if (waveNumber === 2) {
      await this.showBitFeedback("Careful bidding now, Clerk — number lists play by a trick rule. A bare number is an INDEX. Always. The boxed ones hunt values. Misread it and the wrong lot leaves the shelf.", 4500);
      if (!this._alive) return;
    }
    if (waveNumber === 3) {
      await this.showBitFeedback("Final lots — long traces and loops that clear as they walk. Watch the size column; the shelf shrinks UNDER the loop's feet.", 4500);
      if (!this._alive) return;
    }

    const startIndex = waveNumber === 1 ? 0 : waveNumber === 2 ? 5 : 10;
    this.startRound(startIndex);
  }

  async showWaveBanner(text) {
    await this.tearTicket();
    const c = this.add.container((DESK_X0 + DESK_X1) / 2, -60).setDepth(85);
    const g = this.add.graphics();
    g.fillStyle(0x1a0e05, 0.95);
    g.fillRoundedRect(-230, -24, 460, 48, 8);
    g.lineStyle(2, C_GOLD, 1);
    g.strokeRoundedRect(-230, -24, 460, 48, 8);
    const t = this.add.text(0, 0, text, { font: "bold 17px Georgia", color: HEX_GOLD }).setOrigin(0.5);
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

  startRound(index) {
    this.currentRound = index;
    const config = ROUNDS[index];
    this.roundAttempts = 0;
    this.clearRound();
    this.clearTracker();
    this.clearCrate();
    this.updateRemovedRow(null, null);
    this.currentListName = config.listName;

    (async () => {
      await this.populateShelf(config.initialList, config.listType);
      if (!this._alive || this.gameEnded) return;
      this.fillBeforeRow();
      this.roundStartTime = this.time.now;

      const limit = config.type === "bughunt" ? 12000 : WAVE_TIME[config.wave];
      if (config.type === "predict" || config.type === "trace") this.setupPredict(config);
      else if (config.type === "bughunt") this.setupBugHunt(config);

      this.startWatchSweep(limit, () => this.onWatchTimeout(config));
    })();
  }

  clearRound() {
    this.roundElements.forEach((e) => { if (e && e.destroy) e.destroy(); });
    this.roundElements = [];
    this.clearTicket();
  }

  async onWatchTimeout(config) {
    if (this.gameEnded) return;
    this.inputLocked = true;
    this.roundElements.forEach((e) => e.disableInteractive && e.disableInteractive());
    this.logAttempt(config, false, null, "timeout", this.roundTimeLimit, 1);
    await this.handStrikesTwelve();
    if (!this._alive) return;
    await this.stampTicket("unsold");
    if (!this._alive) return;
    await this.runReveal(config.source || config.lines);
    if (!this._alive) return;
    this.fillAfterRow();
    this.updateWaveIndicator(this._roundInWave(), false);
    this.loseLife();
    this.updateCombo(false);
    if (this.lives <= 0) { this.time.delayedCall(400, () => this.gameOver()); return; }
    await this.showBitFeedback(MISCONCEPTION_FEEDBACK.timeout);
    if (!this._alive) return;
    this.advanceRound();
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE A/B/C — PREDICT / TRACE
  // ══════════════════════════════════════════════════════════════

  setupPredict(config) {
    this.showTrialOnTicket(config.source, config.question);
    this.showOptionBubbles(config.options, config);
  }

  showOptionBubbles(options, config) {
    const shuffled = Phaser.Utils.Array.Shuffle(options.slice());
    const positions = [[280, 520], [620, 520], [280, 580], [620, 580]];
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
    this.stopWatch();
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

    await this.stampTicket(correct ? "cleared" : "disputed");
    if (correct) await this.rewindWatch();
    if (!this._alive) return;
    await this.runReveal(config.source);
    this.fillAfterRow();
    if (config.revealNote) this.createFloatingText(TICKET_CX + 60, 430, config.revealNote, HEX_GRAY, "12px Arial", 2800);
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
      await this.showBitFeedback(MISCONCEPTION_FEEDBACK[opt.tag] || "Not quite — trace the tracker again.");
      if (!this._alive) return;
      this.advanceRound();
    }
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE D — BUG HUNT
  // ══════════════════════════════════════════════════════════════

  setupBugHunt(config) {
    this.clearTicket();
    const header = this.add.text(TICKET_CX, TICKET_Y0 + 16, "CLICK THE BUG", { font: "bold 15px Georgia", color: "#c62828" }).setOrigin(0.5);
    this.ticketContainer.add(header);
    this.tweens.add({ targets: header, alpha: 0.5, duration: 500, yoyo: true, repeat: -1 });
    this.ticketLabel.setText(`LOT ${this.currentRound + 1}/15`);

    this._bugHuntTokenObjs = [];
    const maxLen = Math.max(...config.lines.map((l) => l.length));
    const fontSize = maxLen > 40 ? 9 : 11;
    const startY = TICKET_Y0 + 54;

    config.lines.forEach((line, li) => {
      const y = startY + li * 26;
      if (line.trim().startsWith("//")) {
        const t = this.add.text(TICKET_CX, y, line, { font: `italic ${fontSize}px Courier New`, color: "#78909c" }).setOrigin(0.5);
        this.ticketContainer.add(t);
        return;
      }
      const tokens = this._ticketTokenize(line);
      const measured = tokens.map((tk) => { const tmp = this.add.text(0, 0, tk.t, { font: `bold ${fontSize}px Courier New` }); const w = tmp.width; tmp.destroy(); return w; });
      const totalW = measured.reduce((a, b) => a + b, 0);
      let x = TICKET_CX - totalW / 2;
      tokens.forEach((tok, ti) => {
        const w = measured[ti];
        const isBug = (li + 1 === config.faultLine) && tok.t === config.faultToken;
        const t = this.add.text(x + w / 2, y, tok.t, { font: `bold ${fontSize}px Courier New`, color: tok.c }).setOrigin(0.5);
        t.setData("isBug", isBug);
        t.setData("line", li + 1);
        const hitW = Math.max(w + 6, 30), hitH = Math.max(fontSize + 8, 30);
        t.setInteractive(new Phaser.Geom.Rectangle(-hitW / 2, -hitH / 2, hitW, hitH), Phaser.Geom.Rectangle.Contains);
        this.ticketContainer.add(t);
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
    this.stopWatch();
    const timePctUsed = this.getTimePctUsed();
    const timeMs = Math.round(this.time.now - this.roundStartTime);
    const correct = tokenObj.getData("isBug");
    this.logAttempt(config, correct, `line ${tokenObj.getData("line")}`, correct ? null : config.wrongTag, timeMs, timePctUsed);
    this._bugHuntTokenObjs.forEach((t) => t.disableInteractive());

    if (correct) {
      tokenObj.setColor("#2e7d32");
      const strike = this.add.graphics();
      strike.lineStyle(2, 0xc62828, 0.9);
      strike.lineBetween(tokenObj.x - tokenObj.width / 2 - 2, lineY, tokenObj.x + tokenObj.width / 2 + 2, lineY);
      this.ticketContainer.add(strike);
      const fixT = this.add.text(TICKET_CX, lineY - 14, config.fix, { font: "bold 12px Courier New", color: "#2e7d32", wordWrap: { width: 340 } }).setOrigin(0.5).setAlpha(0);
      this.ticketContainer.add(fixT);
      this.tweens.add({ targets: fixT, alpha: 1, duration: 250 });
    } else {
      tokenObj.setColor(HEX_RED);
      this.tweens.add({ targets: tokenObj, x: tokenObj.x + 4, duration: 30, yoyo: true, repeat: 4 });
      this._bugHuntTokenObjs.filter((t) => t.getData("isBug")).forEach((t) => {
        t.setColor(HEX_RED);
        this.tweens.add({ targets: t, alpha: 0.3, duration: 180, yoyo: true, repeat: 3 });
      });
    }

    await this.stampTicket(correct ? "cleared" : "disputed");
    if (correct) await this.rewindWatch();
    if (!this._alive) return;
    await this.runBugHuntReveal(config);
    if (config.revealNote) this.createFloatingText(TICKET_CX + 60, 430, config.revealNote, HEX_GRAY, "12px Arial", 2800);
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

  /** Bug-hunt reveals run the ACTUAL buggy code through the real
   * evaluator, then the fixed version — both honestly derived. */
  async runBugHuntReveal(config) {
    this.clearTracker();
    await this.runReveal(config.lines);
    this.fillAfterRow();
    if (config.round === 15 || config.round === 14) {
      await this.delay(500);
      if (!this._alive) return;
      this.clearCrate();
      this.clearTracker();
      await this.populateShelf(config.initialList, config.listType);
      if (!this._alive) return;
      this.fillBeforeRow();
      const fixedLines = config.round === 14
        ? ["nums.remove(Integer.valueOf(2));"]
        : ["for (int i = 0; i < list.size(); i++) {", '    if (list.get(i).equals("ad")) {', "        list.remove(i);", "        i--;", "    }", "}"];
      await this.runReveal(fixedLines);
      this.fillAfterRow();
    }
  }

  // ══════════════════════════════════════════════════════════════
  // HONEST EVALUATOR — overload resolution + loop/skip semantics
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

  /** Async expression evaluator. `ctx` (optional) collects loop-skip
   * detection state; `capture` requests the return-value pop visual. */
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

    if (/^[A-Za-z_]\w*$/.test(t)) {
      if (vars && vars[t] !== undefined) return { ok: true, value: vars[t], type: typeof vars[t] === "number" ? "int" : "string" };
      if (t === this.currentListName) return { ok: true, value: `[${this.currentList.map((e) => String(e.value)).join(", ")}]`, type: "string" };
      return { ok: false, crash: "eval" };
    }
    return { ok: false, crash: "eval" };
  }

  evalLoopCond(condExpr, vars) {
    const m = condExpr.trim().match(/^(\w+)\s*(<=|<)\s*(\w+)\.size\(\)$/);
    if (!m) return false;
    const lhs = vars[m[1]] !== undefined ? vars[m[1]] : NaN;
    return m[2] === "<" ? lhs < this.currentList.length : lhs <= this.currentList.length;
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
      const r = await this.evalExpr(declVar[3], vars, ctx, true);
      if (!r.ok) return r;
      vars[declVar[2]] = r.value;
      return { ok: true };
    }

    const printMatch = t.match(/^System\.out\.println\((.*)\);$/);
    if (printMatch) {
      const r = await this.evalExpr(printMatch[1], vars, ctx, false);
      if (!r.ok) return r;
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
    let iv = parseInt(forMatch[2], 10);
    let iterations = 0;
    while (iterations < 200) {
      if (!this._alive) return { ok: true };
      vars[counter] = iv;
      if (!this.evalLoopCond(condExpr, vars)) {
        if (iterations === 0) {
          this.appendTrackerRow(`${counter}=${iv} | size=${this.currentList.length} → condition false, skipped`);
          await this.delay(400);
        }
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

      // honest next-index computation — the body may have mutated the
      // counter (e.g. i--, the fix); the loop's own ++ applies on top.
      const postBody = vars[counter];
      const nextIv = postBody + 1;
      if (ctx.removedAtIndex === iv && this.currentList.length > iv && nextIv !== iv) {
        this.showSkippedFlag(iv);
      }
      iv = nextIv;
      iterations++;
      await this.delay(280);
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

      const forMatch = t.match(/^for \(int (\w+) = (\d+); (.*); \1\+\+\) \{$/);
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

  async runReveal(lines) {
    return await this.runBlock(lines, 0, lines.length, {}, null);
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
    if (remaining > 0.6) { points += 50; this.fastBonusCount++; this.createFloatingText(TICKET_CX, TICKET_Y0 - 20, "⚡ SWIFT GAVEL +50", HEX_GOLD, "bold 15px Arial", 900); }
    else if (remaining > 0.3) { points += 25; this.fastBonusCount++; this.createFloatingText(TICKET_CX, TICKET_Y0 - 20, "⚡ +25", HEX_GOLD, "bold 14px Arial", 800); }
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

  addLife() {
    if (this.lives < 5) {
      const icon = this.lifeIcons[this.lives];
      if (icon) { this.tweens.add({ targets: icon, alpha: 1, duration: 350 }); }
      this.lives++;
    }
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

      const features = { attempts_count, time_taken_seconds, misconception_repeat_count, combo_breaks };
      const effectivePrediction = BehavioralRules.getEffectivePrediction(features, prediction, true);
      GameManager.fusionEngine.checkBehavioral(effectivePrediction);

      // Small delay to allow the DOM/UI to render the Bit Menu if triggered
      await this.delay(100);
    } catch (e) {
      console.warn("Level53Scene: /api/wellbeing/predict-struggle unreachable, skipping behavioral signal for this level:", e);
    }
  }

  async advanceRound() {
    if (this.currentRound === 2) {
      await this.runBehavioralCheck();

      // CRITICAL FIX: the FusionEngine polling loop runs at 1Hz (every 1000ms).
      // Wait up to 1.5s to give it a chance to notice the behavioral flag and
      // open the menu before we mistakenly advance to the next round.
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
    this._killSweepTween();
    this._watchRunning = false;
    this.clearRound();
    this.hideBubble();

    (async () => {
      this._pennants.forEach((p) => this.tweens.add({ targets: p, angle: 25, duration: 700 }));
      this.tweens.add({ targets: this.gavelContainer, angle: -90, duration: 600, ease: "Sine.easeOut" });
      this._soldParcels.forEach((s) => this.tweens.add({ targets: s.tag, alpha: 0.1, duration: 700 }));
      const motes = this.ambient;
      this.ambient = null;
      (motes || []).forEach((m) => this.tweens.add({ targets: m, y: 632, alpha: 0, duration: 1500, ease: "Sine.easeIn" }));

      const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
      this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });
      const title = this.add.text(640, 240, "SALE SUSPENDED", { font: "bold 36px Georgia", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
      this.tweens.add({ targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut", onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }) });
      this.add.text(640, 310, `Score: ${this.score}`, { font: "21px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
      this.add.text(640, 350, `Lots Cleared: ${this.currentRound} / 15`, { font: "18px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);
      this._makeButton(525, 420, "WIND THE WATCH", 200, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
      this._makeButton(755, 420, "RETURN TO MENU", 200, 50, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.start("MenuScene"));
    })();
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this._killSweepTween();
    this._watchRunning = false;
    this.clearRound();
    this.hideBubble();

    try { GameManager.completeLevel(53, Math.round((this.correctFirstTry / 15) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("arraylist_remove_tuned"); } catch (_) {}
    try {
      localStorage.setItem("level53_results", JSON.stringify({
        level: 53, concept: "arraylist_remove", phase: "tuning",
        score: this.score, accuracy: this.correctFirstTry / 15, avgTimePct: this.totalTimePctUsed / 15,
        fastBonuses: this.fastBonusCount, comboMax: this.maxCombo, stars: this._starRating(),
        livesRemaining: this.lives, attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.clearingSaleFinale().then(() => { if (this._alive) this.showScoreTally(); });
  }

  async clearingSaleFinale() {
    for (let i = 0; i < 3; i++) { await this.gavelStrike(); await this.delay(150); }
    this._pennants.forEach((p, i) => this.tweens.add({ targets: p, angle: 15, duration: 250, delay: i * 40, yoyo: true }));
    await this.rewindWatch();
    this._soldParcels.forEach((s) => { s.tag.setColor(HEX_GOLD); this.tweens.add({ targets: s.tag, scaleX: 0, duration: 120, yoyo: true }); });
    this.clearCrate();
    this.clearTracker();
    await this.populateShelf("ALL LOTS CLEARED".replace(/ /g, "").split("").slice(0, 8), "String");
    this.createConfetti(SHELF_CX, SHELF_Y0 + 30, 36);
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
    panel.fillStyle(0x1a0e05, 1);
    panel.fillRoundedRect(360, 110, 560, 430, 16);
    panel.lineStyle(2, C_BRASS, 1);
    panel.strokeRoundedRect(360, 110, 560, 430, 16);

    const title = this.add.text(640, 150, "SALE CONCLUDED", { font: "bold 32px Georgia", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(91).setScale(0);
    this.tweens.add({ targets: title, scale: 1, duration: 350, ease: "Back.easeOut" });

    const acc = Math.round((this.correctFirstTry / 15) * 100);
    const avgResponseSec = ((this.totalTimePctUsed / 15) * (WAVE_TIME[2] / 1000)).toFixed(1);
    const lines = [`ACCURACY: ${acc}%`, `AVG RESPONSE: ${avgResponseSec}s`, `SWIFT-GAVEL BONUSES: ${this.fastBonusCount}`, `BEST COMBO: ×${this.getComboMultiplierFor(this.maxCombo)}`];
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
      const s = this.add.text(640 + (i - 1) * 60, 372, "★", { font: "40px Arial", color: earned ? HEX_GOLD : "#2a3040" }).setOrigin(0.5).setDepth(91).setScale(0);
      this.tweens.add({ targets: s, scale: 1, duration: 250, delay: 1500 + i * 200, ease: earned ? "Back.easeOut" : "Cubic.easeOut" });
    }

    // badge — a tiny pocket watch
    const badge = this.add.container(640, 445).setDepth(91).setAlpha(0);
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillCircle(0, 0, 30);
    bg.lineStyle(3, C_GOLD, 1);
    bg.strokeCircle(0, 0, 30);
    bg.lineStyle(2, C_BRASS, 1);
    bg.strokeCircle(0, 2, 14);
    bg.fillStyle(C_BRASS, 1);
    bg.fillRect(-2, -16, 4, 4);
    bg.lineStyle(1.5, 0x0a0704, 1);
    bg.lineBetween(0, 2, 0, -6);
    bg.lineBetween(0, 2, 7, 2);
    badge.add(bg);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 1950 });
    const badgeLbl = this.add.text(640, 485, "remove() SCHEMA TUNED", { font: "bold 15px Georgia", color: HEX_GOLD }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: badgeLbl, alpha: 1, duration: 300, delay: 2100 });

    this._makeButton(490, 520, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(765, 520, "NEXT: The Grand Reshelving →", 285, 44, { fill: 0x00733a, stroke: C_GREEN_BRIGHT, textColor: "#ffffff" }, () => {
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
