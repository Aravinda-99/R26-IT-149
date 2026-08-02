/**
 * Level 50 — "The Stacks" (ArrayList Methods: Tuning Phase — get())
 * ===========================================================================
 * Tunes the Level 49 get() schema under time pressure. The hourglass IS
 * the timer — one drain tween drives the top bulb's falling sand surface,
 * the bottom pile's rise, the stream, the hue shifts, wobbles and the
 * critical vignette; timeout fires from its onComplete after the dramatic
 * last-grain beat. No parallel clock.
 *
 * The level's central fluency skill is the TRAVERSAL:
 *   for (int i = 0; i < list.size(); i++) { ... list.get(i) ... }
 * The evaluator extends L49's with honest for-loop semantics — init/cond/
 * step, per-iteration quickened ghost retrievals, a live Traversal
 * Tracker row per iteration, running accumulators, and honest mid-loop
 * crashes (prior iterations' console output and accumulator state remain;
 * execution halts at the crashing get — the L48 partial-trace rule).
 * The off-by-one family (i <= size()) makes its third curriculum
 * appearance here, after the charAt walkers and the add() insertions.
 */

import Phaser from "phaser";
import { GameManager } from "../../../GameManager.js";
import { BadgeSystem } from "../../../BadgeSystem.js";

const W = 1280, H = 720;

const C_CYAN = 0x4fc3f7, C_GOLD = 0xffd740, C_ORANGE = 0xff9800, C_VIOLET = 0xb39ddb;
const C_GREEN_BRIGHT = 0x00e676, C_RED = 0xf44336, C_GRAY = 0x78909c, C_BRASS = 0xc8a05a;
const HEX_CYAN = "#4fc3f7", HEX_GOLD = "#ffd740", HEX_ORANGE = "#ff9800", HEX_VIOLET = "#b39ddb";
const HEX_GREEN_BRIGHT = "#00e676", HEX_RED = "#f44336", HEX_GRAY = "#78909c", HEX_BRASS = "#c8a05a";

// Runner's station + paging slip
const DESK_X0 = 250, DESK_X1 = 760, DESK_Y0 = 100, DESK_Y1 = 460;
const SLIP_X0 = 270, SLIP_X1 = 640, SLIP_Y0 = 120, SLIP_Y1 = 400;
const SLIP_CX = (SLIP_X0 + SLIP_X1) / 2, SLIP_CY = (SLIP_Y0 + SLIP_Y1) / 2;
// Hourglass (all sand geometry local to a container at HG_X, HG_CY)
const HG_X = 700, HG_CY = 285;
const HG_BULB_TOP = -93, HG_WAIST = -2, HG_BULB_BOT = 103, HG_HALF_WIDE = 28, HG_HALF_NECK = 4;
// Compact reference bookshelf
const SHELF_X0 = 790, SHELF_X1 = 1000, SHELF_Y0 = 90, SHELF_Y1 = 560;
const SHELF_CX = (SHELF_X0 + SHELF_X1) / 2;
const SHELF_BASE_Y = 520, SHELF_STEP = 54;
// List state panel + traversal tracker
const PANEL_X = 1020, PANEL_Y = 90, PANEL_W = 220, PANEL_H = 330;
const TRK_X = 1020, TRK_Y = 435, TRK_W = 220, TRK_H = 125;
// Mini console (println output)
const CON_X = 250, CON_Y = 470, CON_W = 510;
const TUTORIAL_KEY = "level50_tutorial_done";
const WAVE_TIME = { 1: 12000, 2: 10000, 3: 9000 };

// ══════════════════════════════════════════════════════════════
// ROUND CONFIGURATION
// ══════════════════════════════════════════════════════════════
const ROUNDS = [
  // ══ WAVE 1 — Rapid Paging (12s) ══
  { round: 1, wave: 1, type: "predict",
    initialList: ["Iliad", "Odyssey", "Aeneid"], listType: "String", listName: "list",
    source: ["list.get(1)"],
    question: "What does this return?", correct: "Odyssey",
    options: [
      { value: "Odyssey", tag: null },
      { value: "Iliad", tag: "index_starts_at_one_belief" },
      { value: "1", tag: "get_returns_index_belief" },
      { value: "Aeneid", tag: "index_off_by_one_high" },
    ],
    concept: "fluent_get_middle" },

  { round: 2, wave: 1, type: "predict",
    initialList: [4, 8, 15, 16], listType: "Integer", listName: "nums",
    source: ["nums.get(0) + nums.get(3)"],
    question: "What does this evaluate to?", correct: "20",
    options: [
      { value: "20", tag: null },
      { value: "03", tag: "get_returns_index_belief" },
      { value: "416", tag: "plus_always_concatenates" },
      { value: "12", tag: "index_starts_at_one_belief" },
    ],
    concept: "fluent_get_arithmetic" },

  { round: 3, wave: 1, type: "predict",
    initialList: ["A", "B"], listType: "String", listName: "list",
    source: ["String x = list.get(0);", "String y = list.get(0);"],
    question: "What is the list state AFTER both lines?", correct: "[A, B]",
    options: [
      { value: "[A, B]", tag: null, label: "[A, B] — unchanged" },
      { value: "[B]", tag: "get_removes_element_belief", label: "[B] — A consumed" },
      { value: "[]", tag: "get_removes_element_belief_both", label: "[] — both reads consumed A" },
      { value: "[A]", tag: "get_removes_element_belief_partial", label: "[A]" },
    ],
    revealNote: "Two ghosts, zero changes — reading never consumes. Size 2 before, size 2 after.",
    concept: "fluent_non_destructive" },

  { round: 4, wave: 1, type: "predict",
    initialList: [10, 20, 30, 40, 50], listType: "Integer", listName: "nums",
    source: ["nums.get(nums.size() - 1)"],
    question: "What does this return?", correct: "50",
    options: [
      { value: "50", tag: null },
      { value: "40", tag: "size_minus_one_off_belief" },
      { value: "5", tag: "get_returns_index_belief" },
      { value: "Error", tag: "size_in_get_crashes_belief" },
    ],
    revealNote: "size() = 5 → 5 − 1 = 4 → get(4) = 50. The size-minus-one reflex, at speed.",
    concept: "fluent_last_element" },

  { round: 5, wave: 1, type: "predict",
    initialList: ["X", "Y", "Z"], listType: "String", listName: "list",
    source: ["list.get(3)"],
    question: "What happens?", correct: "runtime_crash",
    options: [
      { value: "runtime_crash", tag: null, label: "IndexOutOfBoundsException" },
      { value: "returns_Z", tag: "get_at_size_valid_belief", label: "Returns 'Z'" },
      { value: "returns_null", tag: "get_on_empty_returns_null_belief", label: "Returns null" },
      { value: "returns_X", tag: "index_wraps_belief", label: "Wraps around — returns 'X'" },
    ],
    concept: "fluent_boundary_crash" },

  // ══ WAVE 2 — The Traversal (10s) ══
  { round: 6, wave: 2, type: "predict",
    initialList: ["A", "B", "C"], listType: "String", listName: "list",
    source: ["for (int i = 0; i < list.size(); i++) {", "    System.out.println(list.get(i));", "}"],
    question: "What prints?", correct: "A⏎B⏎C",
    options: [
      { value: "A⏎B⏎C", tag: null, label: "A / B / C (three lines)" },
      { value: "B⏎C", tag: "loop_starts_at_one_belief", label: "B / C" },
      { value: "A⏎B⏎C⏎crash", tag: "loop_bound_inclusive_size", label: "A / B / C then CRASH" },
      { value: "0⏎1⏎2", tag: "loop_visits_indices_belief", label: "0 / 1 / 2" },
    ],
    revealNote: "The canonical traversal: i runs 0, 1, 2 — three quickened ghost retrievals, three tracker rows, three printed lines. i < size() stops EXACTLY in time.",
    concept: "canonical_traversal" },

  { round: 7, wave: 2, type: "predict",
    initialList: ["A", "B", "C"], listType: "String", listName: "list",
    source: ["for (int i = 0; i <= list.size(); i++) {", "    System.out.println(list.get(i));", "}"],
    question: "What happens?", correct: "prints_then_crash",
    options: [
      { value: "prints_then_crash", tag: null, label: "Prints A / B / C, then CRASHES at i=3" },
      { value: "prints_clean", tag: "loop_bound_inclusive_size", label: "Prints A / B / C cleanly" },
      { value: "crash_immediately", tag: "loop_crashes_at_start_belief", label: "Crashes before printing anything" },
      { value: "prints_four", tag: "size_padding_belief", label: "Prints A / B / C / null" },
    ],
    revealNote: "THE classic off-by-one: <= size runs i = 0, 1, 2, 3 — and get(3) on a size-3 list reaches past the top shelf. The tracker shows three clean rows then the red ✗ row. Prior work prints; then the crash.",
    concept: "inclusive_bound_crash" },

  { round: 8, wave: 2, type: "predict",
    initialList: [10, 20, 30], listType: "Integer", listName: "nums",
    source: ["int sum = 0;", "for (int i = 0; i < nums.size(); i++) {", "    sum = sum + nums.get(i);", "}"],
    question: "What is sum after the loop?", correct: "60",
    options: [
      { value: "60", tag: null },
      { value: "30", tag: "accumulator_last_only_belief" },
      { value: "3", tag: "loop_visits_indices_belief" },
      { value: "0", tag: "accumulator_never_updates_belief" },
    ],
    revealNote: "The accumulate pattern: sum grows 0 → 10 → 30 → 60, one retrieval per iteration. The tracker's running-total column shows each step. This idiom powers every total, every average, every count in real Java.",
    concept: "accumulate_pattern" },

  { round: 9, wave: 2, type: "predict",
    initialList: ["A", "B", "C", "D"], listType: "String", listName: "list",
    source: ["for (int i = 1; i < list.size(); i++) {", "    System.out.println(list.get(i));", "}"],
    question: "What prints?", correct: "B⏎C⏎D",
    options: [
      { value: "B⏎C⏎D", tag: null, label: "B / C / D (skips A)" },
      { value: "A⏎B⏎C⏎D", tag: "loop_start_ignored_belief", label: "A / B / C / D (all four)" },
      { value: "A⏎B⏎C", tag: "loop_start_shifts_end_belief", label: "A / B / C" },
      { value: "B⏎C", tag: "loop_bound_short_by_one", label: "B / C" },
    ],
    revealNote: "Starting at i = 1 skips index 0 — the loop visits 1, 2, 3. Where the counter STARTS is as important as where it stops.",
    concept: "traversal_custom_start" },

  { round: 10, wave: 2, type: "predict",
    initialList: [5, 10, 15], listType: "Integer", listName: "nums",
    source: ["for (int i = 0; i < nums.size() - 1; i++) {", "    System.out.println(nums.get(i));", "}"],
    question: "What prints?", correct: "5⏎10",
    options: [
      { value: "5⏎10", tag: null, label: "5 / 10 (stops before the last)" },
      { value: "5⏎10⏎15", tag: "loop_bound_extension_belief", label: "5 / 10 / 15" },
      { value: "5", tag: "loop_bound_short_by_one", label: "5 only" },
      { value: "crash", tag: "size_minus_one_crashes_belief", label: "CRASH" },
    ],
    revealNote: "size() − 1 as the BOUND stops one early — i runs 0, 1 only. Useful when comparing neighbors or skipping the last element. Contrast with size() − 1 as an INDEX (which targets the last element). Same expression, two roles.",
    concept: "bound_vs_index_discrimination" },

  // ══ WAVE 3 — Deep Traces & Bug Hunt ══
  { round: 11, wave: 3, type: "trace",
    initialList: ["Ada", "Grace", "Alan"], listType: "String", listName: "list",
    source: ["String first = list.get(0);", "String last = list.get(list.size() - 1);", 'System.out.println(first + " & " + last);'],
    question: "What prints?", correct: "Ada & Alan",
    options: [
      { value: "Ada & Alan", tag: null },
      { value: "Ada & Grace", tag: "size_minus_one_off_belief" },
      { value: "Grace & Alan", tag: "index_starts_at_one_belief" },
      { value: "0 & 2", tag: "get_returns_index_belief" },
    ],
    concept: "trace_first_last_concat" },

  { round: 12, wave: 3, type: "trace",
    initialList: [2, 4, 6, 8], listType: "Integer", listName: "nums",
    source: ["int total = 0;", "for (int i = 0; i < nums.size(); i++) {", "    total = total + nums.get(i);", "}", 'System.out.println("Total: " + total);'],
    question: "What prints?", correct: "Total: 20",
    options: [
      { value: "Total: 20", tag: null },
      { value: "Total: 8", tag: "accumulator_last_only_belief" },
      { value: "Total: 6", tag: "loop_visits_indices_belief" },
      { value: "Total: 2468", tag: "plus_always_concatenates" },
    ],
    revealNote: "Accumulate then announce: total climbs 0 → 2 → 6 → 12 → 20; the println concatenates the LABEL with the final int. Traversal + accumulation + output — three wings in one trace.",
    concept: "trace_accumulate_announce" },

  { round: 13, wave: 3, type: "trace",
    initialList: ["x", "y"], listType: "String", listName: "list",
    source: ["System.out.println(list.get(0));", "System.out.println(list.get(1));", "System.out.println(list.get(2));"],
    question: "What happens?", correct: "prints_two_then_crash",
    options: [
      { value: "prints_two_then_crash", tag: null, label: "Prints x / y, then CRASHES on the third line" },
      { value: "crash_nothing_prints", tag: "crash_rolls_back_belief", label: "Crashes — nothing prints" },
      { value: "prints_x_y_null", tag: "get_on_empty_returns_null_belief", label: "Prints x / y / null" },
      { value: "prints_x_y_x", tag: "index_wraps_belief", label: "Prints x / y / x (wraps)" },
    ],
    revealNote: "Honest partial trace: the first two gets succeed AND their printlns fire; the third get crashes and the program halts THERE. Java never rolls back completed work — the console keeps what already printed.",
    concept: "trace_partial_then_crash" },

  { round: 14, wave: 3, type: "bughunt",
    initialList: ["A", "B", "C"], listType: "String", listName: "list",
    lines: ["for (int i = 0; i <= list.size(); i++) {", "    System.out.println(list.get(i));", "}"],
    faultToken: "<=", faultLine: 1,
    fix: "i < list.size()",
    explanation: "The inclusive bound — i runs 0 through 3 on a size-3 list, and get(3) crashes on the final lap. The traversal law: i < size(), strictly less. Third appearance of this cliff in your training — now it's a reflex.",
    wrongTag: "loop_bound_inclusive_size",
    concept: "inclusive_bound_bug" },

  { round: 15, wave: 3, type: "bughunt",
    initialList: [3, 7, 11], listType: "Integer", listName: "nums",
    lines: ["int last = nums.get(nums.size());", 'System.out.println("Last: " + last);', '// expected: "Last: 11"'],
    faultToken: "nums.size()", faultLine: 1,
    fix: "nums.get(nums.size() - 1)",
    explanation: "size() as an index reaches past the top shelf — the last valid index is size − 1, always. get(size() - 1) fetches 11 cleanly. The exact cliff charAt(length()) taught in the Claw trials.",
    wrongTag: "get_at_size_valid_belief",
    revealNote: "One character — the minus-one — between a crash and a clean page. The buggy build's red scan sweeps past shelf 2; the fixed build's ghost lifts 11 and the console prints 'Last: 11'.",
    concept: "size_as_index_bug" },
];

const MISCONCEPTION_FEEDBACK = {
  // carried from Level 49
  get_removes_element_belief: "Watch the shelf — the original never moved! get() lifts a GHOST, not the book. Reading and removing are different tools.",
  get_removes_element_belief_both: "Watch the shelf — the original never moved! get() lifts a GHOST, not the book. Reading and removing are different tools.",
  get_removes_element_belief_partial: "Watch the shelf — the original never moved! get() lifts a GHOST, not the book. Reading and removing are different tools.",
  index_starts_at_one_belief: "Zero-based, always — the first book lives at index 0. Same law as charAt, same law as add.",
  get_returns_index_belief: "get(i) returns the ELEMENT at position i, not the number i. You hand it a position; it hands you what lives there.",
  get_at_size_valid_belief: "The last valid index is size − 1 — get(size) reaches past the top shelf every time. The exact cliff charAt(length()) taught.",
  get_on_empty_returns_null_belief: "Java never quietly hands back null or a default from get() — an invalid index CRASHES.",
  size_minus_one_off_belief: "size() − 1 IS the last index — count it on the shelf. Five books: size 5, last index 4.",
  size_in_get_crashes_belief: "size() − 1 inside get() is not just legal, it's the CANONICAL way to reach the end — the expression evaluates first, then the get runs.",
  index_off_by_one_high: "Count the shelves from zero — the index you named is one past the target.",
  plus_always_concatenates: "Two retrieved Integers under a + is pure arithmetic — no String in sight, the gold + adds.",
  hardcoded_last_index: "A hardcoded index survives exactly one list length. size() − 1 survives them all.",
  // new for the traversal
  loop_bound_inclusive_size: "The <= ran one lap too many — i reached size, and get(size) is past the top shelf. The traversal law is strict: i < size().",
  loop_bound_short_by_one: "The bound stopped the loop early — count the tracker rows against the shelf. Every element from the start index up to size − 1 should be visited.",
  loop_visits_indices_belief: "The loop counter is a POSITION, not a value — get(i) turns each position into its element. You summed shelf numbers, not books.",
  loop_starts_at_one_belief: "This loop starts at i = 0 — index 0 IS visited. Check the initializer before you skip.",
  loop_start_ignored_belief: "The initializer says i = 1 — index 0 is never visited. Where the counter starts matters as much as where it stops.",
  loop_start_shifts_end_belief: "A late start doesn't move the finish line — the bound still runs to size − 1. Only the first elements are skipped.",
  loop_bound_extension_belief: "The bound is size() − 1 — the loop stops one EARLY, skipping the last element. Read the condition, not the pattern you expected.",
  size_minus_one_crashes_belief: "size() − 1 as a bound is safe — it just stops early. Only indices AT or PAST size crash.",
  loop_crashes_at_start_belief: "The loop runs fine until the counter actually goes out of range — every valid iteration completes first. Crashes happen at the bad get, not before.",
  accumulator_last_only_belief: "sum ACCUMULATES — each iteration adds onto the running total. Watch the tracker's total column climb; it doesn't replace, it grows.",
  accumulator_never_updates_belief: "sum = sum + ... runs every iteration — the tracker shows each step. Zero is only the STARTING value.",
  crash_rolls_back_belief: "Java never un-prints — work completed before the crash stays done. The console keeps its lines; the program just stops adding more.",
  index_wraps_belief: "No wrap-around in Java lists — indices past the end crash, they don't circle back to the front.",
  size_padding_belief: "No padding, no nulls — past the last element there is only the exception.",
  timeout: "The last grain fell! Fluent runners answer while the sand is still tall — trust the traversal law and commit.",
};

export class Level50Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level50Scene" });
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
    this.currentListName = "list";
    this.shelfBookSprites = [];
    this.inputLocked = true;
    this.gameEnded = false;
    this._alive = true;
    this._bubble = null;
    this._drainTween = null;
    this._drainProgress = 0;
    this._sandFrozen = false;
    this._sandRunning = false;
    this._lastWobble = 0;
    this._lastVignette = 0;
    this._lastStreamDot = 0;
    this._waveSquares = [];
    this._trackerRows = [];
    this._consoleLines = [];
  }

  preload() {}

  create() {
    this._alive = true;
    this.events.once("shutdown", () => { this._alive = false; this._killDrainTween(); });

    const cam = this.cameras.main;
    const zoom = Math.min(this.scale.width / W, this.scale.height / H);
    cam.setZoom(zoom);
    cam.centerOn(W / 2, H / 2);
    cam.setBackgroundColor("#080503");

    try { GameManager.incrementAttempt(49); } catch (_) {}

    this.createParticleTexture();
    this.createBackground();
    this.createToweringShelves();
    this.createHangingLantern();
    this.createStacksBanner();
    this.createBookCart();
    this.createStacksFloor();
    this.createParticles();
    this.createRunnersStation();
    this.createHourglass();
    this.createMiniConsole();
    this.createReferenceBookshelf();
    this.createReferenceListStatePanel();
    this.createTraversalTracker();
    this.createHUD();
    this.createBit();

    cam.fadeIn(700, 3, 3, 5);
    this.checkTutorial();
  }

  update(time, delta) {
    this.updateParticles(time, delta);
    this.updateLanternFlame(time);
    this.updateSandVisuals(time);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // BACKGROUND — the stacks
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l50_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l50_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x080503).setDepth(0);
  }

  createToweringShelves() {
    const spineColors = [0x8a6435, 0x3a2618, 0x6d4c41];
    this.shelfColumns = [];
    [[20, 0.6], [90, 1], [160, 0.8], [1120, 0.8], [1190, 1], [1260, 0.6]].forEach(([x, mult]) => {
      const g = this.add.graphics().setDepth(1);
      g.fillStyle(0x0f0a06, 1);
      g.lineStyle(1, 0x241a0e, 0.4 * mult);
      g.fillRect(x - 25, 60, 50, 560);
      g.strokeRect(x - 25, 60, 50, 560);
      for (let y = 80; y < 600; y += 40) {
        let bx = x - 20;
        for (let b = 0; b < Phaser.Math.Between(4, 6); b++) {
          const bw = Phaser.Math.Between(4, 7);
          g.fillStyle(Phaser.Utils.Array.GetRandom(spineColors), 0.2 * mult);
          g.fillRect(bx, y, bw, Phaser.Math.Between(16, 26));
          bx += bw + 2;
        }
      }
      this.shelfColumns.push(g);
    });
  }

  createHangingLantern() {
    const g = this.add.graphics().setDepth(2);
    // chain of 3 links
    g.lineStyle(1.5, C_BRASS, 0.5);
    for (let i = 0; i < 3; i++) g.strokeEllipse(640, 12 + i * 9, 5, 8);
    // handle + glass body
    g.lineStyle(1.5, C_BRASS, 0.6);
    g.beginPath();
    g.arc(640, 40, 8, Math.PI, 0, false);
    g.strokePath();
    g.strokeRoundedRect(631, 42, 18, 24, 3);
    this.lanternFlameGfx = this.add.graphics().setDepth(3);
    this.lanternPool = this.add.ellipse(640, 100, 400, 60, 0xffa726, 0.04).setDepth(1);
    this._lanternState = "calm"; // calm | agitated | out
  }

  updateLanternFlame(time) {
    if (!this.lanternFlameGfx) return;
    this.lanternFlameGfx.clear();
    if (this._lanternState === "out") return;
    const agitated = this._lanternState === "agitated";
    const amp = agitated ? 0.3 : 0.08;
    const js = 1 + Phaser.Math.FloatBetween(-amp, amp);
    const jx = agitated ? Phaser.Math.FloatBetween(-1, 1) : 0;
    this.lanternFlameGfx.fillStyle(0xffa726, 0.85);
    this.lanternFlameGfx.fillEllipse(640 + jx, 56, 7 * js, 11 * js);
    this.lanternFlameGfx.fillStyle(0xfff9c4, 0.9);
    this.lanternFlameGfx.fillEllipse(640 + jx, 57, 4 * js, 6 * js);
  }

  createStacksBanner() {
    const g = this.add.graphics().setDepth(2);
    g.fillStyle(0x080503, 1);
    g.lineStyle(1, C_BRASS, 0.5);
    g.fillRoundedRect(230, 70, 340, 26, 3);
    g.strokeRoundedRect(230, 70, 340, 26, 3);
    this.add.text(400, 83, "T H E   S T A C K S", { font: "bold 14px Georgia", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.7).setDepth(3);
  }

  createBookCart() {
    this.cartContainer = this.add.container(60, 590).setDepth(3);
    const g = this.add.graphics();
    g.lineStyle(2, 0x8a6435, 0.5);
    g.strokeRect(-35, -20, 70, 40);
    g.lineStyle(2, C_BRASS, 0.5);
    g.strokeCircle(-22, 26, 6);
    g.strokeCircle(22, 26, 6);
    const colors = [0x8a6435, 0x3a2618, 0x6d4c41];
    this._cartBooks = [];
    for (let i = 0; i < 3; i++) {
      const b = this.add.rectangle(-18 + i * 16, 12 - i * 3, 22, 6, colors[i], 0.3);
      this.cartContainer.add(b);
      this._cartBooks.push(b);
    }
    this.cartContainer.addAt(g, 0);
  }

  createStacksFloor() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x0f0a08, 1);
    g.fillRect(0, 635, W, 85);
    g.lineStyle(1, 0x241a0e, 1);
    g.lineBetween(0, 636, W, 636);
    g.lineStyle(1, 0x241a0e, 0.4);
    for (let x = 0; x < W; x += 90) g.lineBetween(x, 636, x, 720);
    for (let y = 676; y < 720; y += 40) g.lineBetween(0, y, W, y);
  }

  createParticles() {
    this.ambient = [];
    const colors = [0xc8a05a, 0x8a6435, 0xa89078];
    for (let i = 0; i < 6; i++) {
      this.ambient.push(this.add.circle(Phaser.Math.Between(0, W), Phaser.Math.Between(150, 630), 1, Phaser.Utils.Array.GetRandom(colors), Phaser.Math.FloatBetween(0.02, 0.04)).setDepth(2));
    }
  }

  updateParticles(time, delta) {
    if (!this.ambient) return;
    const step = 0.005 * (delta / 16.7);
    this.ambient.forEach((p, i) => {
      p.y += step;
      p.x += Math.sin(time * 0.0003 + i) * 0.02;
      if (p.y > 630) { p.y = 150; p.x = Phaser.Math.Between(0, W); }
    });
  }

  // ══════════════════════════════════════════════════════════════
  // RUNNER'S STATION + PAGING SLIP
  // ══════════════════════════════════════════════════════════════

  createRunnersStation() {
    const g = this.add.graphics().setDepth(4);
    g.fillStyle(0x1a0e05, 1);
    g.lineStyle(3, 0x8a6435, 1);
    g.fillRoundedRect(DESK_X0, DESK_Y0, DESK_X1 - DESK_X0, DESK_Y1 - DESK_Y0, 8);
    g.strokeRoundedRect(DESK_X0, DESK_Y0, DESK_X1 - DESK_X0, DESK_Y1 - DESK_Y0, 8);
    g.lineStyle(1, 0x3a2618, 0.3);
    for (let y = DESK_Y0 + 10; y < DESK_Y1 - 6; y += 7) g.lineBetween(DESK_X0 + 6, y, DESK_X1 - 6, y);
    // brass corner caps
    g.lineStyle(2, C_BRASS, 0.6);
    [[DESK_X0 + 4, DESK_Y0 + 4, 1, 1], [DESK_X1 - 4, DESK_Y0 + 4, -1, 1], [DESK_X0 + 4, DESK_Y1 - 4, 1, -1], [DESK_X1 - 4, DESK_Y1 - 4, -1, -1]].forEach(([x, y, sx, sy]) => {
      g.lineBetween(x, y, x + 12 * sx, y);
      g.lineBetween(x, y, x, y + 12 * sy);
    });

    // paging slip
    const s = this.add.graphics().setDepth(5);
    s.fillStyle(0xe0d6b8, 1);
    s.lineStyle(2, 0x8a6435, 1);
    s.fillRoundedRect(SLIP_X0, SLIP_Y0, SLIP_X1 - SLIP_X0, SLIP_Y1 - SLIP_Y0, 4);
    s.strokeRoundedRect(SLIP_X0, SLIP_Y0, SLIP_X1 - SLIP_X0, SLIP_Y1 - SLIP_Y0, 4);
    s.lineStyle(1, 0x8a6435, 0.15);
    for (let y = SLIP_Y0 + 30; y < SLIP_Y1 - 10; y += 20) s.lineBetween(SLIP_X0 + 10, y, SLIP_X1 - 10, y);
    this.slipLabel = this.add.text(SLIP_X1 - 10, SLIP_Y0 + 8, "", { font: "bold 9px Courier New", color: "#8a6435" }).setOrigin(1, 0).setAlpha(0.7).setDepth(6);
    this.slipQuestionText = this.add.text(SLIP_CX, SLIP_Y1 - 16, "", { font: "12px Georgia", color: "#241a0e" }).setOrigin(0.5).setDepth(6);
    this.slipContainer = this.add.container(0, 0).setDepth(6);
  }

  clearSlip() { this.slipContainer.removeAll(true); this.slipQuestionText.setText(""); }

  /** Dark-on-cream syntax tokenizer for the paging slip. */
  _slipTokenize(line) {
    const tokens = [];
    const re = /("(?:[^"\\]|\\.)*")|(\w+\.size\(\))|(\bfor\b|\bint\b|\bString\b)|(\bSystem\.out\b)|(\.get\b|\bprintln\b)|(<=|>=|==|\+\+|<|>)|(-?\d+)|([(){};,=+\-])/g;
    let last = 0, m;
    const plain = (t) => t && tokens.push({ t, c: "#241a0e" });
    while ((m = re.exec(line))) {
      if (m.index > last) plain(line.slice(last, m.index));
      if (m[1]) tokens.push({ t: m[1], c: "#d84315" });
      else if (m[2]) tokens.push({ t: m[2], c: "#6a1b9a" });
      else if (m[3]) tokens.push({ t: m[3], c: "#1565c0" });
      else if (m[4]) tokens.push({ t: m[4], c: "#2e7d32" });
      else if (m[5]) tokens.push({ t: m[5], c: "#1565c0" });
      else if (m[6]) tokens.push({ t: m[6], c: "#b8860b" });
      else if (m[7]) tokens.push({ t: m[7], c: "#e65100" });
      else if (m[8]) tokens.push({ t: m[8], c: /[()]/.test(m[8]) ? "#c62828" : "#78909c" });
      last = m.index + m[0].length;
    }
    if (last < line.length) plain(line.slice(last));
    return tokens.length ? tokens : [{ t: line, c: "#241a0e" }];
  }

  showTrialOnSlip(lines, questionText) {
    this.clearSlip();
    const maxLen = Math.max(...lines.map((l) => l.length));
    const fontSize = maxLen > 42 ? 10 : maxLen > 34 ? 11 : 13;
    const lineH = fontSize + 10;
    const startY = SLIP_CY - 20 - ((lines.length - 1) * lineH) / 2;
    lines.forEach((line, i) => {
      const y = startY + i * lineH;
      if (line.trim().startsWith("//")) {
        const t = this.add.text(SLIP_CX, y, line, { font: `italic ${fontSize}px Courier New`, color: "#78909c" }).setOrigin(0.5).setAlpha(0);
        this.slipContainer.add(t);
        this.tweens.add({ targets: t, alpha: 1, duration: 180 });
        return;
      }
      const tokens = this._slipTokenize(line);
      const measured = tokens.map((tk) => { const tmp = this.add.text(0, 0, tk.t, { font: `bold ${fontSize}px Courier New` }); const w = tmp.width; tmp.destroy(); return w; });
      const totalW = measured.reduce((a, b) => a + b, 0);
      let x = SLIP_CX - totalW / 2;
      tokens.forEach((tok, ti) => {
        const t = this.add.text(x, y, tok.t, { font: `bold ${fontSize}px Courier New`, color: tok.c }).setOrigin(0, 0.5).setAlpha(0);
        this.slipContainer.add(t);
        this.tweens.add({ targets: t, alpha: 1, duration: 180 });
        x += measured[ti];
      });
    });
    if (questionText) this.slipQuestionText.setText(questionText);
    this.slipLabel.setText(`REQUEST ${this.currentRound + 1}/15`);
  }

  async stampSlip(kind) {
    const labels = { paged: "PAGED", mispaged: "MISPAGED", expired: "REQUEST EXPIRED" };
    const colors = { paged: HEX_GREEN_BRIGHT, mispaged: HEX_RED, expired: HEX_RED };
    const stamp = this.add.text(SLIP_CX, SLIP_CY, labels[kind], { font: "bold 22px Georgia", color: colors[kind] }).setOrigin(0.5).setDepth(30).setScale(1.4).setAngle(-8).setAlpha(0);
    this.slipContainer.add(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 180 });
    const hold = kind === "expired" ? 1800 : 700;
    await this.delay(hold);
    if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 200, onComplete: () => stamp.destroy() });
  }

  // ══════════════════════════════════════════════════════════════
  // THE HOURGLASS (THE TIMER)
  // ══════════════════════════════════════════════════════════════

  createHourglass() {
    this.hourglass = this.add.container(HG_X, HG_CY).setDepth(7);

    const frame = this.add.graphics();
    // end caps
    frame.fillStyle(0x8a6435, 1);
    frame.lineStyle(2, C_BRASS, 1);
    frame.fillRoundedRect(-32, -110, 64, 10, 3);
    frame.strokeRoundedRect(-32, -110, 64, 10, 3);
    frame.fillRoundedRect(-32, 100, 64, 10, 3);
    frame.strokeRoundedRect(-32, 100, 64, 10, 3);
    // posts (left, center-behind, right)
    frame.lineStyle(2, C_BRASS, 0.7);
    frame.lineBetween(-30, -100, -30, 100);
    frame.lineBetween(0, -100, 0, 100);
    frame.lineBetween(30, -100, 30, 100);
    this.hourglass.add(frame);

    // tick marks on the right post
    this.hgTicks = [];
    for (let q = 1; q <= 4; q++) {
      const ty = HG_BULB_TOP + ((HG_WAIST - HG_BULB_TOP) * q) / 4;
      const tick = this.add.graphics();
      tick.lineStyle(1.5, C_BRASS, 0.7);
      tick.lineBetween(31, ty, 36, ty);
      this.hourglass.add(tick);
      this.hgTicks.push({ g: tick, frac: q / 4 });
    }

    // glass bulbs
    const glass = this.add.graphics();
    glass.lineStyle(1.5, C_BRASS, 0.35);
    glass.beginPath();
    glass.moveTo(-HG_HALF_WIDE, HG_BULB_TOP);
    glass.lineTo(-HG_HALF_NECK, HG_WAIST);
    glass.moveTo(HG_HALF_WIDE, HG_BULB_TOP);
    glass.lineTo(HG_HALF_NECK, HG_WAIST);
    glass.moveTo(-HG_HALF_NECK, HG_WAIST + 4);
    glass.lineTo(-HG_HALF_WIDE, HG_BULB_BOT);
    glass.moveTo(HG_HALF_NECK, HG_WAIST + 4);
    glass.lineTo(HG_HALF_WIDE, HG_BULB_BOT);
    glass.strokePath();
    glass.lineStyle(1, 0xffffff, 0.15);
    glass.lineBetween(-HG_HALF_WIDE + 6, HG_BULB_TOP + 8, -HG_HALF_NECK - 2, HG_WAIST - 6);
    this.hourglass.add(glass);

    this.sandGfx = this.add.graphics();
    this.hourglass.add(this.sandGfx);
    this._drainProgress = 0;
    this._sandRunning = false;
    this._drawSand();

    this.vignetteGfx = this.add.graphics().setDepth(88).setAlpha(0);
    this.vignetteGfx.lineStyle(40, 0x000000, 0.5);
    this.vignetteGfx.strokeRect(20, 20, W - 40, H - 40);
  }

  _halfWTop(y) { return HG_HALF_WIDE - ((y - HG_BULB_TOP) * (HG_HALF_WIDE - HG_HALF_NECK)) / (HG_WAIST - HG_BULB_TOP); }

  _sandColor() {
    const rem = 1 - this._drainProgress;
    if (rem <= 0.15) return 0xc65838;
    if (rem <= 0.33) return 0xd4a04c;
    return 0xe0c068;
  }

  _drawSand() {
    const p = this._drainProgress;
    const g = this.sandGfx;
    g.clear();
    const color = this._sandColor();

    // top bulb sand: surface falls from HG_BULB_TOP+4 to HG_WAIST
    if (p < 1) {
      const sY = (HG_BULB_TOP + 4) + ((HG_WAIST - HG_BULB_TOP - 4) * p);
      const hw = Math.max(this._halfWTop(sY), HG_HALF_NECK);
      const dip = 3 + p * 4;
      g.fillStyle(color, 0.9);
      g.beginPath();
      g.moveTo(-hw, sY);
      g.lineTo(0, Math.min(sY + dip, HG_WAIST - 1));
      g.lineTo(hw, sY);
      g.lineTo(HG_HALF_NECK, HG_WAIST);
      g.lineTo(-HG_HALF_NECK, HG_WAIST);
      g.closePath();
      g.fillPath();
    }

    // bottom pile: peak rises with p
    if (p > 0.02) {
      const peakY = HG_BULB_BOT - (HG_BULB_BOT - (HG_WAIST + 14)) * p;
      const baseHW = HG_HALF_WIDE * Math.min(1, 0.35 + p * 0.65);
      g.fillStyle(color, 0.9);
      g.fillTriangle(-baseHW, HG_BULB_BOT, 0, peakY, baseHW, HG_BULB_BOT);
    }

    // falling stream
    if (this._sandRunning && !this._sandFrozen && p < 1) {
      const peakY = HG_BULB_BOT - (HG_BULB_BOT - (HG_WAIST + 14)) * Math.max(p, 0.02);
      g.lineStyle(2, color, 0.85);
      g.lineBetween(0, HG_WAIST + 2, 0, peakY - 2);
    }

    // ticks dim as the sand passes them
    this.hgTicks.forEach((t) => t.g.setAlpha(p >= t.frac ? 0.2 : 0.8));
  }

  /** Per-frame urgency side-effects, all derived from the drain progress. */
  updateSandVisuals(time) {
    if (!this.sandGfx) return;
    if (this._sandRunning && !this._sandFrozen) {
      this._drawSand();

      const rem = 1 - this._drainProgress;
      // stream particles
      const interval = rem <= 0.33 ? 60 : 120;
      if (this._drainProgress < 1 && time - this._lastStreamDot > interval) {
        this._lastStreamDot = time;
        const dot = this.add.circle(HG_X + Phaser.Math.Between(-1, 1), HG_CY + HG_WAIST + 6, 1, this._sandColor(), 0.9).setDepth(8);
        this.tweens.add({ targets: dot, y: dot.y + 30, alpha: 0, duration: 260, onComplete: () => dot.destroy() });
      }
      // nervous wobble
      const wobbleEvery = rem <= 0.15 ? 600 : rem <= 0.33 ? 2000 : Infinity;
      if (time - this._lastWobble > wobbleEvery) {
        this._lastWobble = time;
        this.tweens.add({ targets: this.hourglass, angle: 0.5, duration: 100, yoyo: true, repeat: 1 });
      }
      // critical states: agitated lantern + heartbeat vignette
      this._lanternState = rem <= 0.15 ? "agitated" : "calm";
      if (rem <= 0.15 && time - this._lastVignette > 900) {
        this._lastVignette = time;
        this.tweens.add({ targets: this.vignetteGfx, alpha: 0.5, duration: 110, yoyo: true, repeat: 1 });
      }
    }
  }

  startSandDrain(timeLimitMs, onTimeout) {
    this._killDrainTween();
    this.roundTimeLimit = timeLimitMs;
    this._drainProgress = 0;
    this._sandFrozen = false;
    this._sandRunning = true;
    this.hourglass.setAngle(0);
    this._lanternState = "calm";
    this._drawSand();
    const state = { v: 0 };
    this._drainTween = this.tweens.add({
      targets: state, v: 1, duration: timeLimitMs, ease: "Linear",
      onUpdate: () => { this._drainProgress = state.v; },
      onComplete: () => { if (this._alive) onTimeout(); },
    });
  }

  _killDrainTween() {
    if (this._drainTween) { this._drainTween.stop(); this._drainTween = null; }
  }

  freezeSand() {
    if (this._drainTween) this._drainTween.pause();
    this._sandFrozen = true;
    this._lanternState = "calm";
  }

  getTimePctUsed() {
    const elapsed = this.time.now - this.roundStartTime;
    return Phaser.Math.Clamp(elapsed / this.roundTimeLimit, 0, 1);
  }

  /** The dramatic timeout beat: one final grain detaches and falls. */
  async lastGrainFalls() {
    this._killDrainTween();
    this._drainProgress = 1;
    this._sandRunning = false;
    this._drawSand();
    this._lanternState = "calm";
    const grain = this.add.circle(HG_X, HG_CY + HG_WAIST + 2, 1.5, 0xe0c068, 1).setDepth(8);
    await new Promise((res) => { this.tweens.add({ targets: grain, y: HG_CY + HG_WAIST + 26, duration: 300, ease: "Sine.easeIn", onComplete: res }); });
    const p = this.add.particles(grain.x, grain.y, "l50_dot", { speed: { min: 8, max: 25 }, angle: { min: 220, max: 320 }, scale: { start: 0.25, end: 0 }, lifespan: 200, tint: [0xe0c068], emitting: false }).setDepth(8);
    p.explode(4);
    grain.destroy();
    this.time.delayedCall(280, () => p.destroy());
    // lantern dims for a beat
    this._lanternState = "out";
    this.time.delayedCall(800, () => { if (this._alive && !this.gameEnded) this._lanternState = "calm"; });
  }

  /** Correct-answer flourish: the hourglass flips to reset. */
  async flipHourglass() {
    await new Promise((res) => { this.tweens.add({ targets: this.hourglass, angle: 180, duration: 500, ease: "Sine.easeInOut", onComplete: res }); });
    this._drainProgress = 0;
    this._sandRunning = false;
    this.hourglass.setAngle(0);
    this._drawSand();
  }

  // ══════════════════════════════════════════════════════════════
  // MINI CONSOLE (println output)
  // ══════════════════════════════════════════════════════════════

  createMiniConsole() {
    const g = this.add.graphics().setDepth(5);
    g.fillStyle(0x050914, 0.95);
    g.lineStyle(1, 0x21262d, 1);
    g.fillRoundedRect(CON_X, CON_Y, CON_W, 28, 6);
    g.strokeRoundedRect(CON_X, CON_Y, CON_W, 28, 6);
    this.consoleText = this.add.text(CON_X + 10, CON_Y + 14, "", { font: "bold 12px Courier New", color: HEX_GREEN_BRIGHT }).setOrigin(0, 0.5).setDepth(6);
    this._consoleLines = [];
  }

  async printToConsole(text) {
    this._consoleLines.push(text);
    const joined = this._consoleLines.join(" ⏎ ");
    for (let i = this.consoleText.text.length; i <= joined.length; i++) {
      if (!this._alive) return;
      this.consoleText.setText(joined.slice(0, i));
      if (this.consoleText.width > CON_W - 20) this.consoleText.setFontSize(9);
      await this.delay(8);
    }
  }

  clearConsole() {
    this._consoleLines = [];
    if (this.consoleText) this.consoleText.setText("").setFontSize(12);
  }

  // ══════════════════════════════════════════════════════════════
  // COMPACT REFERENCE BOOKSHELF (L49 machinery, reduced)
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

    const stampBg = this.add.graphics().setDepth(5);
    stampBg.fillStyle(0x0a0704, 1);
    stampBg.lineStyle(1, C_BRASS, 1);
    stampBg.fillRoundedRect(SHELF_X0 + 16, 96, 118, 20, 3);
    stampBg.strokeRoundedRect(SHELF_X0 + 16, 96, 118, 20, 3);
    this.typeStampText = this.add.text(SHELF_X0 + 75, 106, "", { font: "bold 9px Courier New", color: HEX_CYAN }).setOrigin(0.5).setDepth(6);

    const sizeBg = this.add.graphics().setDepth(5);
    sizeBg.fillStyle(0x0a0704, 1);
    sizeBg.lineStyle(1, C_BRASS, 0.6);
    sizeBg.fillRoundedRect(SHELF_X1 - 76, 96, 62, 20, 10);
    sizeBg.strokeRoundedRect(SHELF_X1 - 76, 96, 62, 20, 10);
    this.sizeCounterText = this.add.text(SHELF_X1 - 45, 106, "size: 0", { font: "bold 10px Courier New", color: HEX_BRASS }).setOrigin(1 / 2, 0.5).setDepth(6);

    this.shelfIndexPlates = [];
    for (let i = 0; i < 8; i++) {
      const y = SHELF_BASE_Y - i * SHELF_STEP;
      const ledgeG = this.add.graphics().setDepth(4);
      ledgeG.fillStyle(0x3a2618, 0.6);
      ledgeG.lineStyle(1, 0x8a6435, 0.4);
      ledgeG.fillRoundedRect(SHELF_CX - 78, y - 19, 156, 38, 3);
      ledgeG.strokeRoundedRect(SHELF_CX - 78, y - 19, 156, 38, 3);

      const idxText = this.add.text(SHELF_X0 + 22, y, String(i), { font: "bold 12px Courier New", color: HEX_GRAY }).setOrigin(0.5).setDepth(7);
      this.shelfIndexPlates.push({ text: idxText, y });
    }
    const glowRing = this.add.circle(SHELF_X0 + 22, SHELF_BASE_Y, 10, C_GOLD, 0);
    this.tweens.add({ targets: glowRing, alpha: 0.15, duration: 1200, yoyo: true, repeat: -1 });
    glowRing.setDepth(5);
    this.ghostLayer = this.add.container(0, 0).setDepth(9);
  }

  setShelfType(listType) {
    this.currentListType = listType;
    const colorMap = { String: HEX_CYAN, Integer: HEX_GOLD };
    this.typeStampText.setText(`ArrayList<${listType}>`).setColor(colorMap[listType] || HEX_CYAN);
    if (this.typeEchoText) this.typeEchoText.setText(`<${listType}>`).setColor(colorMap[listType] || HEX_GRAY);
  }

  _typeColorHex(type) {
    switch (type) {
      case "string": return HEX_CYAN;
      case "int": return HEX_GOLD;
      default: return HEX_GRAY;
    }
  }
  _typeColorInt(type) {
    switch (type) {
      case "string": return C_CYAN;
      case "int": return C_GOLD;
      default: return C_GRAY;
    }
  }
  _shelfY(idx) { return SHELF_BASE_Y - Math.min(idx, 7) * SHELF_STEP; }

  _makeBookVisual(entry, x, y) {
    const color = this._typeColorInt(entry.type);
    const display = entry.type === "string" ? `"${entry.value}"` : String(entry.value);
    const c = this.add.container(x, y).setDepth(6);
    const g = this.add.graphics();
    g.fillStyle(color, 0.85);
    g.lineStyle(1.5, Phaser.Display.Color.IntegerToColor(color).darken(30).color, 1);
    g.fillRoundedRect(-24, -16, 48, 32, 2);
    g.strokeRoundedRect(-24, -16, 48, 32, 2);
    const txt = this.add.text(0, 0, display, { font: "bold 10px Georgia", color: "#0a0704" }).setOrigin(0.5);
    if (display.length > 5) { txt.setAngle(-90); if (txt.width > 28) txt.setFontSize(7); }
    c.add([g, txt]);
    return { container: c, text: txt, entry };
  }

  async populateShelf(initialList, listType) {
    this.clearShelf();
    this.setShelfType(listType);
    const typeOf = listType === "Integer" ? "int" : "string";
    for (let i = 0; i < initialList.length; i++) {
      const entry = { value: initialList[i], type: typeOf };
      const book = this._makeBookVisual(entry, SHELF_CX, this._shelfY(i));
      book.container.setAlpha(0);
      this.tweens.add({ targets: book.container, alpha: 1, duration: 140, delay: i * 70 });
      const plate = this.shelfIndexPlates[Math.min(i, 7)];
      if (plate) plate.text.setColor(this._typeColorHex(typeOf));
      this.currentList.push(entry);
      this.shelfBookSprites.push(book);
    }
    this.sizeCounterText.setText(`size: ${this.currentList.length}`);
    this.updateListStatePanel();
    await this.delay(initialList.length * 70 + 150);
  }

  clearShelf() {
    this.shelfBookSprites.forEach((b) => b.container.destroy());
    this.shelfBookSprites = [];
    this.currentList = [];
    this.sizeCounterText.setText("size: 0");
    this.updateListStatePanel();
    this.shelfIndexPlates.forEach((p) => { p.text.setColor(HEX_GRAY); p.text.setAlpha(1); });
  }

  // ══════════════════════════════════════════════════════════════
  // LIST STATE PANEL + TRAVERSAL TRACKER
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
    this.add.text(PANEL_X + 10, PANEL_Y + 15, "LIST STATE", { font: "bold 10px Georgia", color: HEX_BRASS }).setOrigin(0, 0.5).setDepth(12);
    this.syncDot = this.add.circle(PANEL_X + PANEL_W - 14, PANEL_Y + 15, 3, C_GREEN_BRIGHT, 0.7).setDepth(12);
    this.tweens.add({ targets: this.syncDot, alpha: 0.3, duration: 700, yoyo: true, repeat: -1 });

    this.typeEchoText = this.add.text(PANEL_X + PANEL_W - 10, PANEL_Y + 42, "", { font: "bold 9px Courier New", color: HEX_GRAY }).setOrigin(1, 0.5).setAlpha(0.6).setDepth(12);
    this.bracketText = this.add.text(PANEL_X + PANEL_W / 2, PANEL_Y + 110, "[]", { font: "bold 12px Courier New", color: HEX_GRAY, wordWrap: { width: PANEL_W - 24 }, align: "center" }).setOrigin(0.5).setDepth(12);
    this.panelSizeText = this.add.text(PANEL_X + PANEL_W / 2, PANEL_Y + 170, "size: 0", { font: "10px Courier New", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.85).setDepth(12);
    this.panelIndexText = this.add.text(PANEL_X + PANEL_W / 2, PANEL_Y + 192, "", { font: "bold 9px Courier New", color: "#8a6435" }).setOrigin(0.5).setAlpha(0.7).setDepth(12);

    this.add.text(PANEL_X + 14, PANEL_Y + 265, "retrieved:", { font: "10px Georgia", color: "#8a6435" }).setOrigin(0, 0.5).setDepth(12);
    this.retrievedValueText = this.add.text(PANEL_X + 82, PANEL_Y + 265, "—", { font: "bold 12px Courier New", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(12);
  }

  updateListStatePanel() {
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
    if (value === null) { this.retrievedValueText.setFontSize(12).setText("—").setColor(HEX_GRAY); return; }
    if (type === "crash") { this.retrievedValueText.setText("✗ IOOBE").setColor(HEX_RED).setFontSize(11); return; }
    this.retrievedValueText.setFontSize(12).setText(String(value)).setColor(this._typeColorHex(type));
    this.tweens.add({ targets: this.retrievedValueText, scale: 1.2, duration: 110, yoyo: true });
  }

  createTraversalTracker() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0d0805, 1);
    g.lineStyle(1, C_BRASS, 0.5);
    g.fillRoundedRect(TRK_X, TRK_Y, TRK_W, TRK_H, 8);
    g.strokeRoundedRect(TRK_X, TRK_Y, TRK_W, TRK_H, 8);
    this.add.text(TRK_X + 10, TRK_Y + 12, "TRAVERSAL", { font: "bold 10px Georgia", color: HEX_BRASS }).setOrigin(0, 0.5).setDepth(11);
    this.trackerContainer = this.add.container(0, 0).setDepth(12);
    this.trackerTotalText = this.add.text(TRK_X + 10, TRK_Y + TRK_H - 12, "", { font: "bold 9px Courier New", color: HEX_GOLD }).setOrigin(0, 0.5).setDepth(12);
    this._trackerRows = [];
    this.clearTracker();
  }

  appendTrackerRow(text, isCrash) {
    if (this._trackerDash && this._trackerDash.active) { this._trackerDash.destroy(); this._trackerDash = null; }
    const maxRows = 6;
    if (this._trackerRows.length >= maxRows) {
      const removed = this._trackerRows.shift();
      removed.destroy();
      this._trackerRows.forEach((r) => { r.y -= 13; });
    }
    const y = TRK_Y + 28 + this._trackerRows.length * 13;
    const t = this.add.text(TRK_X + 10, y, text, { font: "10px Courier New", color: isCrash ? HEX_RED : "#e8dfc8" }).setOrigin(0, 0.5).setAlpha(0);
    if (t.width > TRK_W - 18) t.setFontSize(8);
    this.trackerContainer.add(t);
    this._trackerRows.push(t);
    this.tweens.add({ targets: t, alpha: 1, duration: 130 });
  }

  updateTrackerTotal(text) {
    this.trackerTotalText.setText(text);
    this.tweens.add({ targets: this.trackerTotalText, scale: 1.15, duration: 100, yoyo: true });
  }

  clearTracker() {
    this.trackerContainer.removeAll(true);
    this._trackerRows = [];
    this.trackerTotalText.setText("");
    this._trackerDash = this.add.text(TRK_X + TRK_W / 2, TRK_Y + 66, "—", { font: "bold 14px Courier New", color: "#3a2618" }).setOrigin(0.5).setDepth(11);
  }

  // ══════════════════════════════════════════════════════════════
  // GHOST RETRIEVAL + CRASH (tuning tempo)
  // ══════════════════════════════════════════════════════════════

  async retrieveGhost(index, quickened = false) {
    const entry = this.currentList[index];
    const shelfY = this._shelfY(index);
    const k = quickened ? 0.5 : 1;

    const plate = this.shelfIndexPlates[Math.min(index, 7)];
    if (plate) {
      plate.text.setColor(HEX_GOLD);
      this.tweens.add({ targets: plate.text, scale: 1.4, duration: 110 * k, yoyo: true });
      this.time.delayedCall(900 * k, () => { if (plate.text.active && this.currentList[index]) plate.text.setColor(this._typeColorHex(this.currentList[index].type)); });
    }
    const scan = this.add.rectangle(SHELF_CX - 76, shelfY, 2, 34, 0xffd740, 0.7).setDepth(8);
    await new Promise((res) => { this.tweens.add({ targets: scan, x: SHELF_CX + 76, duration: 180 * k, ease: "Sine.easeInOut", onComplete: () => { scan.destroy(); res(); } }); });
    if (!this._alive) return entry;

    const ghost = this._makeBookVisual(entry, SHELF_CX, shelfY);
    const rim = this.add.graphics();
    rim.fillStyle(C_GOLD, 0.15);
    rim.fillRoundedRect(-27, -19, 54, 38, 3);
    ghost.container.addAt(rim, 0);
    ghost.container.setAlpha(0);
    this.ghostLayer.add(ghost.container);
    await new Promise((res) => { this.tweens.add({ targets: ghost.container, alpha: 0.45, y: shelfY - 16, duration: 160 * k, onComplete: res }); });
    if (!this._alive) return entry;

    // drift toward the panel and dissolve, delivering the value
    this.updateRetrievedValueRow(entry.value, entry.type);
    await new Promise((res) => {
      this.tweens.add({ targets: ghost.container, x: SHELF_CX + 90, y: shelfY - 34, alpha: 0, duration: 320 * k, ease: "Sine.easeIn", onComplete: () => { ghost.container.destroy(); res(); } });
    });
    return entry;
  }

  async crashRetrieval(index) {
    const topIdx = this.currentList.length - 1;
    const startY = topIdx >= 0 ? this._shelfY(topIdx) : SHELF_BASE_Y;
    const phantomY = this._shelfY(Math.max(0, Math.min(index, 7)));
    const scan = this.add.rectangle(SHELF_CX, startY, 156, 3, C_RED, 0.6).setDepth(8);
    await new Promise((res) => { this.tweens.add({ targets: scan, y: phantomY - 8, duration: 300, ease: "Sine.easeOut", onComplete: res }); });
    if (!this._alive) { scan.destroy(); return; }
    await new Promise((res) => { this.tweens.add({ targets: scan, alpha: 0, duration: 80, yoyo: true, repeat: 3, onComplete: () => { scan.destroy(); res(); } }); });

    const stamp = this.add.text(SHELF_CX, SHELF_Y0 + 46, "IndexOutOfBoundsException", { font: "bold 10px Courier New", color: HEX_RED }).setOrigin(0.5).setAngle(-6).setAlpha(0).setDepth(20);
    this.tweens.add({ targets: stamp, alpha: 1, duration: 130 });
    this.screenShake(0.005, 160);
    this.time.delayedCall(1400, () => { if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 200, onComplete: () => stamp.destroy() }); });
    this.updateRetrievedValueRow("", "crash");
    await this.delay(700);
  }

  flashLoopCounter(label) {
    const t = this.add.text(SHELF_CX, SHELF_Y0 + 68, label, { font: "bold 13px Courier New", color: HEX_GOLD }).setOrigin(0.5).setDepth(20).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 90 });
    this.time.delayedCall(420, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 120, onComplete: () => t.destroy() }); });
  }

  // ══════════════════════════════════════════════════════════════
  // HONEST EVALUATOR — statements + for-loop traversal semantics
  // ══════════════════════════════════════════════════════════════

  _evalIndexArg(argExpr, vars) {
    const t = argExpr.trim();
    if (/^-?\d+$/.test(t)) return { ok: true, index: parseInt(t, 10) };
    let m = t.match(/^(\w+)\.size\(\)\s*-\s*1$/);
    if (m) {
      const size = this.currentList.length;
      this.createAnnotation(SLIP_CX + 100, SLIP_Y0 - 12, `size() = ${size} → ${size} - 1 = ${size - 1}`, HEX_BRASS);
      return { ok: true, index: size - 1 };
    }
    m = t.match(/^(\w+)\.size\(\)$/);
    if (m) return { ok: true, index: this.currentList.length };
    if (/^[A-Za-z_]\w*$/.test(t) && vars && vars[t] !== undefined) return { ok: true, index: vars[t] };
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
        if (ch === "+" && depth === 0 && expr[i + 1] !== "+") { parts.push(cur.trim()); cur = ""; continue; }
      }
      cur += ch;
    }
    const last = cur.trim();
    if (last) parts.push(last);
    return parts;
  }

  /** Async expression evaluator — every get() plays its ghost (or crash)
   * as encountered. vars carries locals (loop counter, accumulators). */
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
    if (/^".*"$/.test(t)) return { ok: true, value: t.slice(1, -1), type: "string" };
    if (/^-?\d+$/.test(t)) return { ok: true, value: parseInt(t, 10), type: "int" };
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
      if (vars && vars[t] !== undefined) return { ok: true, value: vars[t], type: typeof vars[t] === "number" ? "int" : "string" };
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

  /** Executes one statement. Returns {ok} or {ok:false, crash}. */
  async execStatement(line, vars, opts = {}) {
    const t = line.trim();
    if (!t || t.startsWith("//") || t === "}") return { ok: true };

    const declInt = t.match(/^int\s+(\w+)\s*=\s*(.*);$/);
    if (declInt) {
      const r = await this.evalExpr(declInt[2], vars, opts.quickened);
      if (!r.ok) return r;
      vars[declInt[1]] = r.value;
      return { ok: true };
    }
    const declStr = t.match(/^String\s+(\w+)\s*=\s*(.*);$/);
    if (declStr) {
      const r = await this.evalExpr(declStr[2], vars, opts.quickened);
      if (!r.ok) return r;
      vars[declStr[1]] = r.value;
      return { ok: true };
    }
    const accum = t.match(/^(\w+)\s*(?:=\s*\1\s*\+|\+=)\s*(.*);$/);
    if (accum && vars[accum[1]] !== undefined) {
      const r = await this.evalExpr(accum[2], vars, opts.quickened);
      if (!r.ok) return r;
      vars[accum[1]] = vars[accum[1]] + r.value;
      return { ok: true, accumulated: accum[1] };
    }
    const printMatch = t.match(/^System\.out\.println\((.*)\);$/);
    if (printMatch) {
      const r = await this.evalExpr(printMatch[1], vars, opts.quickened);
      if (!r.ok) return r;
      await this.printToConsole(String(r.value));
      return { ok: true };
    }
    // bare expression — with or without a trailing semicolon (Wave 1's
    // slips show raw expressions like "nums.get(0) + nums.get(3)")
    const expr = t.endsWith(";") ? t.slice(0, -1) : t;
    if (expr) {
      const r = await this.evalExpr(expr, vars, opts.quickened);
      if (!r.ok) return r;
    }
    return { ok: true };
  }

  /** Runs the round's source honestly, including for-loops with live
   * Traversal Tracker rows and honest mid-loop crash halts. */
  async runReveal(lines) {
    const vars = {};
    for (let li = 0; li < lines.length; li++) {
      if (!this._alive) return { ok: true };
      const t = lines[li].trim();

      const forMatch = t.match(/^for \(int (\w+) = (\d+); (.*); \1\+\+\) \{$/);
      if (forMatch) {
        const counter = forMatch[1];
        const cond = forMatch[3];
        const bodyLines = [];
        let j = li + 1;
        while (j < lines.length && lines[j].trim() !== "}") { bodyLines.push(lines[j]); j++; }
        let iv = parseInt(forMatch[2], 10);
        let iterations = 0;
        while (iterations < 200) {
          vars[counter] = iv;
          if (!this.evalCond(cond, vars)) break;
          this.flashLoopCounter(`${counter} = ${iv}`);
          for (const b of bodyLines) {
            if (!this._alive) return { ok: true };
            const r = await this.execStatement(b, vars, { quickened: true });
            if (!r.ok) {
              if (r.crash === "ioobe") this.appendTrackerRow(`${counter}=${iv} → get(${r.index}) → ✗ IOOBE`, true);
              return r;
            }
            // tracker row per get-visiting body statement
            const getM = b.match(/\.get\(\s*(\w+)\s*\)/);
            if (getM && getM[1] === counter) {
              const val = this.currentList[iv] ? this.currentList[iv].value : "?";
              this.appendTrackerRow(`${counter}=${iv} → get(${iv}) → ${val}`);
            }
            if (r.accumulated) this.updateTrackerTotal(`${r.accumulated}: ${vars[r.accumulated]}`);
          }
          iv++;
          iterations++;
          await this.delay(250);
        }
        li = j;
        continue;
      }

      const r = await this.execStatement(lines[li], vars, {});
      if (!r.ok) return r;
    }
    return { ok: true };
  }

  // ══════════════════════════════════════════════════════════════
  // BIT — page runner variant (cape, gloves, satchel)
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
    const gloveL = this.add.circle(-16, 10, 4, 0xe0d6b8, 0.85);
    const gloveR = this.add.circle(16, 10, 4, 0xe0d6b8, 0.85);
    // satchel with strap + stowed magnifier handle
    const satchel = this.add.graphics();
    satchel.lineStyle(1.5, C_BRASS, 0.8);
    satchel.lineBetween(-14, -12, 14, 12);
    satchel.fillStyle(0x3a2618, 1);
    satchel.lineStyle(1, C_BRASS, 0.8);
    satchel.fillRoundedRect(8, 8, 16, 12, 3);
    satchel.strokeRoundedRect(8, 8, 16, 12, 3);
    satchel.lineStyle(1.5, C_BRASS, 0.6);
    satchel.lineBetween(20, 8, 24, 3);
    c.add([g, cape, eye, pupil, gloveL, gloveR, satchel, tip]);
    this.tweens.add({ targets: tip, alpha: 0.3, duration: 900, yoyo: true, repeat: -1 });
    // runner's ready stance: lower amplitude, faster hover
    this.tweens.add({ targets: c, y: "+=2", duration: 1600, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
    this.bit = c;
  }

  bitSay(text) {
    this.hideBubble();
    const inner = this.add.text(0, 0, text, { font: "13px Arial", color: "#e0e0e0", wordWrap: { width: 340 } });
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
    const t = this.add.text(x, y, text, { font: "italic 10px Arial", color: colorHex }).setOrigin(0.5).setDepth(70).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 200 });
    this.time.delayedCall(1600, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() }); });
    return t;
  }

  createFloatingText(x, y, text, colorHex, font = "bold 13px Arial", hold = 1400) {
    const t = this.add.text(x, y, text, { font, color: colorHex, wordWrap: { width: 320 }, align: "center" }).setOrigin(0.5).setDepth(31).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 180 });
    this.time.delayedCall(hold, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() }); });
    return t;
  }

  createConfetti(x, y, count = 30) {
    const p = this.add.particles(x, y, "l50_dot", {
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
  // HUD
  // ══════════════════════════════════════════════════════════════

  createHUD() {
    const g = this.add.graphics().setDepth(49);
    g.fillStyle(0x080503, 0.93);
    g.fillRect(0, 0, W, 64);
    g.lineStyle(1, 0x241a0e, 1);
    g.lineBetween(0, 64, W, 64);

    this.add.text(20, 14, "THE STACKS", { font: "bold 15px Georgia", color: "#b0bec5" }).setDepth(50);
    this.add.text(20, 32, "Tuning Phase — ArrayList Methods: get()", { font: "11px Arial", color: "#546e7a" }).setDepth(50);

    this.waveText = this.add.text(640, 18, "WAVE 1 / 3", { font: "bold 14px Georgia", color: HEX_GOLD }).setOrigin(0.5).setDepth(50);
    this._waveSquares = [];
    for (let i = 0; i < 5; i++) {
      const sq = this.add.rectangle(640 - 44 + i * 22, 42, 10, 10, 0x2a2f36).setDepth(50).setStrokeStyle(1, 0x546e7a);
      this._waveSquares.push(sq);
    }

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
    await this.bitSay("Welcome to the Stacks, Runner — where the paging requests never stop. Each request comes with an hourglass; answer before the last grain drops. Fluent runners see the shelf's answer while the sand is still tall.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(5000)]); if (!A()) return;
    this.hideBubble();

    this.currentListName = "list";
    await this.populateShelf(["A", "B", "C"], "String"); if (!A()) return;
    this.showTrialOnSlip(["list.get(2)"], "What does this return?");
    this.createAnnotation(SLIP_CX, SLIP_Y0 - 12, "the request", "#d84315");
    await this.delay(300); if (!A()) return;
    this.createAnnotation(HG_X, HG_CY - 125, "sand = deadline", HEX_GOLD);
    await this.delay(300); if (!A()) return;
    this.createAnnotation(SHELF_CX, SHELF_Y0 - 10, "the truth, after you answer", HEX_GREEN_BRIGHT);
    await this.delay(300); if (!A()) return;
    this.createAnnotation(TRK_X + TRK_W / 2, TRK_Y - 10, "loops log every step here", HEX_VIOLET);
    await this.delay(400); if (!A()) return;

    await this.bitSay("The ghost fetches; the original stays — the desk's first law follows us into the stacks. Run!");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4000)]); if (!A()) return;
    this.hideBubble();
    this.clearSlip();

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

    const banners = { 1: "WAVE 1 — RAPID PAGING", 2: "WAVE 2 — THE TRAVERSAL", 3: "WAVE 3 — DEEP TRACES & BUGS" };
    await this.showWaveBanner(banners[waveNumber]);
    if (!this._alive) return;

    if (waveNumber === 2) {
      await this.showBitFeedback("The traversal, Runner: for (int i = 0; i < size(); i++) visits every shelf exactly once. Read the START and the BOUND — they decide everything.", 4500);
      if (!this._alive) return;
    }
    if (waveNumber === 3) {
      await this.showBitFeedback("Deep stacks now, Runner. Long traces, real loops — and two bugs hiding in the requests. The tracker shows every step; trust it over your hunches.", 4500);
      if (!this._alive) return;
    }

    const startIndex = waveNumber === 1 ? 0 : waveNumber === 2 ? 5 : 10;
    this.startRound(startIndex);
  }

  async showWaveBanner(text) {
    const c = this.add.container((DESK_X0 + DESK_X1) / 2, -60).setDepth(85);
    const g = this.add.graphics();
    g.fillStyle(0x1a0e05, 0.95);
    g.fillRoundedRect(-230, -24, 460, 48, 8);
    g.lineStyle(2, C_GOLD, 1);
    g.strokeRoundedRect(-230, -24, 460, 48, 8);
    const t = this.add.text(0, 0, text, { font: "bold 15px Georgia", color: HEX_GOLD }).setOrigin(0.5);
    c.add([g, t]);
    // the hourglass double-flips for the new wave
    this.tweens.add({ targets: this.hourglass, angle: 360, duration: 700, ease: "Sine.easeInOut", onComplete: () => this.hourglass.setAngle(0) });
    await new Promise((res) => {
      this.tweens.add({
        targets: c, y: 260, duration: 300, ease: "Back.easeOut",
        onComplete: () => this.time.delayedCall(700, () => {
          this.tweens.add({ targets: c, y: -60, alpha: 0, duration: 250, ease: "Cubic.easeIn", onComplete: () => { c.destroy(); res(); } });
        }),
      });
    });
  }

  async startRound(index) {
    this.currentRound = index;
    const config = ROUNDS[index];
    this.roundAttempts = 0;
    this.clearRound();
    this.clearTracker();
    this.clearConsole();
    this.updateRetrievedValueRow(null, null);
    this.currentListName = config.listName;
    await this.populateShelf(config.initialList, config.listType);
    if (!this._alive || this.gameEnded) return;
    this.roundStartTime = this.time.now;

    const limit = config.type === "bughunt" ? 12000 : WAVE_TIME[config.wave];

    if (config.type === "predict" || config.type === "trace") this.setupPredict(config);
    else if (config.type === "bughunt") this.setupBugHunt(config);

    this.startSandDrain(limit, () => this.onSandTimeout(config));
  }

  clearRound() {
    this.roundElements.forEach((e) => { if (e && e.destroy) e.destroy(); });
    this.roundElements = [];
    this.clearSlip();
  }

  async onSandTimeout(config) {
    if (this.gameEnded) return;
    this.inputLocked = true;
    this.roundElements.forEach((e) => e.disableInteractive && e.disableInteractive());
    this.logAttempt(config, false, null, "timeout", this.roundTimeLimit, 1);
    await this.lastGrainFalls();
    if (!this._alive) return;
    await this.stampSlip("expired");
    if (!this._alive) return;
    // the machine never lies — the true reveal still plays
    await this.runReveal(config.source || config.lines);
    if (!this._alive) return;
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
    this.showTrialOnSlip(config.source, config.question);
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
      const txt = this.add.text(0, 0, label, { font: "bold 12px Courier New", color: "#e8dfc8", wordWrap: { width: w - 20 }, align: "center" }).setOrigin(0.5);
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
    this.freezeSand();
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

    await this.delay(200);
    if (!this._alive) return;
    await this.stampSlip(correct ? "paged" : "mispaged");
    if (correct) await this.flipHourglass();
    if (!this._alive) return;
    await this.runReveal(config.source);
    if (config.revealNote) this.createFloatingText(SLIP_CX + 50, 430, config.revealNote, HEX_GRAY, "10px Arial", 2800);
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
      await this.showBitFeedback(MISCONCEPTION_FEEDBACK[opt.tag] || "Not quite — trace the traversal again.");
      if (!this._alive) return;
      this.advanceRound();
    }
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE D — BUG HUNT
  // ══════════════════════════════════════════════════════════════

  setupBugHunt(config) {
    this.clearSlip();
    const header = this.add.text(SLIP_CX, SLIP_Y0 + 16, "CLICK THE BUG", { font: "bold 13px Georgia", color: "#c62828" }).setOrigin(0.5);
    this.slipContainer.add(header);
    this.tweens.add({ targets: header, alpha: 0.5, duration: 500, yoyo: true, repeat: -1 });
    this.slipLabel.setText(`REQUEST ${this.currentRound + 1}/15`);

    this._bugHuntTokenObjs = [];
    const maxLen = Math.max(...config.lines.map((l) => l.length));
    const fontSize = maxLen > 40 ? 10 : 12;
    const startY = SLIP_Y0 + 56;

    config.lines.forEach((line, li) => {
      const y = startY + li * 30;
      if (line.trim().startsWith("//")) {
        const t = this.add.text(SLIP_CX, y, line, { font: `italic ${fontSize}px Courier New`, color: "#78909c" }).setOrigin(0.5);
        this.slipContainer.add(t);
        return;
      }
      const tokens = this._slipTokenize(line);
      const measured = tokens.map((tk) => { const tmp = this.add.text(0, 0, tk.t, { font: `bold ${fontSize}px Courier New` }); const w = tmp.width; tmp.destroy(); return w; });
      const totalW = measured.reduce((a, b) => a + b, 0);
      let x = SLIP_CX - totalW / 2;
      tokens.forEach((tok, ti) => {
        const w = measured[ti];
        const isBug = (li + 1 === config.faultLine) && tok.t === config.faultToken;
        const t = this.add.text(x + w / 2, y, tok.t, { font: `bold ${fontSize}px Courier New`, color: tok.c }).setOrigin(0.5);
        t.setData("isBug", isBug);
        t.setData("line", li + 1);
        const hitW = Math.max(w + 6, 30), hitH = Math.max(fontSize + 8, 30);
        t.setInteractive(new Phaser.Geom.Rectangle(-hitW / 2, -hitH / 2, hitW, hitH), Phaser.Geom.Rectangle.Contains);
        this.slipContainer.add(t);
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
    this.freezeSand();
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
      this.slipContainer.add(strike);
      const fixT = this.add.text(SLIP_CX, lineY - 16, config.fix, { font: "bold 11px Courier New", color: "#2e7d32" }).setOrigin(0.5).setAlpha(0);
      this.slipContainer.add(fixT);
      this.tweens.add({ targets: fixT, alpha: 1, duration: 250 });
    } else {
      tokenObj.setColor(HEX_RED);
      this.tweens.add({ targets: tokenObj, x: tokenObj.x + 4, duration: 30, yoyo: true, repeat: 4 });
      this._bugHuntTokenObjs.filter((t) => t.getData("isBug")).forEach((t) => {
        t.setColor(HEX_RED);
        this.tweens.add({ targets: t, alpha: 0.3, duration: 180, yoyo: true, repeat: 3 });
      });
    }

    await this.stampSlip(correct ? "paged" : "mispaged");
    if (correct) await this.flipHourglass();
    if (!this._alive) return;
    await this.runBugHuntReveal(config);
    if (config.revealNote) this.createFloatingText(SLIP_CX + 50, 430, config.revealNote, HEX_GRAY, "10px Arial", 2800);
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
   * evaluator. Round 15 plays BOTH futures: buggy crash, then the fix. */
  async runBugHuntReveal(config) {
    if (config.round === 14) {
      await this.runReveal(config.lines);
      return;
    }
    if (config.round === 15) {
      await this.runReveal(config.lines);
      await this.delay(500);
      if (!this._alive) return;
      this.clearConsole();
      this.clearTracker();
      await this.populateShelf(config.initialList, config.listType);
      if (!this._alive) return;
      await this.runReveal(["int last = nums.get(nums.size() - 1);", 'System.out.println("Last: " + last);']);
      return;
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

  scoreForAttempt(timePctUsed) {
    let points = 100 * this.getComboMultiplier();
    const remaining = 1 - timePctUsed;
    if (remaining > 0.6) { points += 50; this.fastBonusCount++; this.createFloatingText(SLIP_CX, SLIP_Y0 - 20, "⚡ SWIFT PAGE +50", HEX_GOLD, "bold 13px Arial", 900); }
    else if (remaining > 0.3) { points += 25; this.fastBonusCount++; this.createFloatingText(SLIP_CX, SLIP_Y0 - 20, "⚡ +25", HEX_GOLD, "bold 12px Arial", 800); }
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

  advanceRound() {
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
    this._killDrainTween();
    this._sandRunning = false;
    this.clearRound();
    this.hideBubble();

    (async () => {
      // lost in the stacks: glass fogs, lantern gutters, shelves fade
      this._drainProgress = 1;
      this._drawSand();
      const fog = this.add.graphics().setDepth(8);
      fog.fillStyle(0xb0bec5, 0.15);
      fog.fillRect(HG_X - 30, HG_CY - 100, 60, 200);
      this._lanternState = "out";
      const puff = this.add.particles(640, 56, "l50_dot", { speed: { min: 15, max: 45 }, angle: { min: 240, max: 300 }, scale: { start: 0.5, end: 0 }, lifespan: 700, tint: [0x9e9e9e], alpha: { start: 0.5, end: 0 }, emitting: false }).setDepth(9);
      puff.explode(8);
      this.time.delayedCall(800, () => puff.destroy());
      this.shelfColumns.forEach((g) => this.tweens.add({ targets: g, alpha: 0.15, duration: 900 }));
      this._cartBooks.forEach((b, i) => this.tweens.add({ targets: b, y: b.y + 30, angle: Phaser.Math.Between(-40, 40), alpha: 0, duration: 700, delay: i * 120 }));
      const motes = this.ambient;
      this.ambient = null;
      (motes || []).forEach((m) => this.tweens.add({ targets: m, y: 632, alpha: 0, duration: 1500, ease: "Sine.easeIn" }));

      const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
      this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });
      const title = this.add.text(640, 240, "LOST IN THE STACKS", { font: "bold 34px Georgia", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
      this.tweens.add({ targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut", onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }) });
      this.add.text(640, 310, `Score: ${this.score}`, { font: "20px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
      this.add.text(640, 350, `Requests Paged: ${this.currentRound} / 15`, { font: "16px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);
      this._makeButton(640, 420, "LIGHT THE LANTERN", 230, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
    })();
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this._killDrainTween();
    this._sandRunning = false;
    this.clearRound();
    this.hideBubble();

    try { GameManager.completeLevel(49, Math.round((this.correctFirstTry / 15) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("arraylist_get_tuned"); } catch (_) {}
    try {
      localStorage.setItem("level50_results", JSON.stringify({
        level: 50, concept: "arraylist_get", phase: "tuning",
        score: this.score, accuracy: this.correctFirstTry / 15, avgTimePct: this.totalTimePctUsed / 15,
        fastBonuses: this.fastBonusCount, comboMax: this.maxCombo, stars: this._starRating(),
        livesRemaining: this.lives, attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.stacksFinale().then(() => { if (this._alive) this.showScoreTally(); });
  }

  async stacksFinale() {
    // triple-flip; sand suspended mid-glass in a golden shimmer
    await new Promise((res) => { this.tweens.add({ targets: this.hourglass, angle: 540, duration: 1400, ease: "Sine.easeInOut", onComplete: res }); });
    this.hourglass.setAngle(0);
    this._drainProgress = 0.5;
    this._sandRunning = false;
    this._drawSand();
    const shimmer = this.add.particles(HG_X, HG_CY, "l50_dot", {
      speed: { min: 5, max: 20 }, angle: { min: 0, max: 360 }, scale: { start: 0.35, end: 0 }, lifespan: 900,
      tint: [C_GOLD, 0xe0c068], alpha: { start: 0.7, end: 0 }, frequency: 90,
    }).setDepth(8);
    this.time.delayedCall(2800, () => shimmer.destroy());

    // lantern brightens; shelves catch a rising warm wave
    this._lanternState = "calm";
    this.tweens.add({ targets: this.lanternPool, alpha: 0.1, duration: 700 });
    const wave = this.add.rectangle(W / 2, 640, W, 40, 0xffd740, 0.05).setDepth(2);
    this.tweens.add({ targets: wave, y: 60, duration: 1600, ease: "Sine.easeInOut", onComplete: () => wave.destroy() });

    // the book cart rolls across the foreground
    this.tweens.add({ targets: this.cartContainer, x: W - 80, duration: 3000, ease: "Sine.easeInOut" });

    // ghosts rise off the reference shelf in a spiral
    for (let i = 0; i < this.shelfBookSprites.length; i++) {
      const b = this.shelfBookSprites[i];
      const ghost = this._makeBookVisual(b.entry, SHELF_CX, this._shelfY(i));
      ghost.container.setAlpha(0.45).setDepth(9);
      this.tweens.add({ targets: ghost.container, y: this._shelfY(i) - 70, x: SHELF_CX + Math.sin(i * 1.3) * 40, angle: 25, alpha: 0, duration: 800, delay: i * 100, ease: "Sine.easeOut", onComplete: () => ghost.container.destroy() });
    }
    this.createConfetti(SLIP_CX, SLIP_CY, 36);
    await this.delay(1400);
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

    const title = this.add.text(640, 150, "ALL REQUESTS PAGED", { font: "bold 32px Georgia", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(91).setScale(0);
    this.tweens.add({ targets: title, scale: 1, duration: 350, ease: "Back.easeOut" });

    const acc = Math.round((this.correctFirstTry / 15) * 100);
    const avgResponseSec = ((this.totalTimePctUsed / 15) * (WAVE_TIME[2] / 1000)).toFixed(1);
    const lines = [`ACCURACY: ${acc}%`, `AVG RESPONSE: ${avgResponseSec}s`, `SWIFT-PAGE BONUSES: ${this.fastBonusCount}`, `BEST COMBO: ×${this.getComboMultiplierFor(this.maxCombo)}`];
    lines.forEach((s, i) => {
      const t = this.add.text(500, 205 + i * 26, s, { font: "14px Arial", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 250, delay: 300 + i * 130 });
    });
    const totalText = this.add.text(500, 205 + 4 * 26, "TOTAL: 0", { font: "bold 22px Arial", color: HEX_GOLD }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: totalText, alpha: 1, duration: 250, delay: 900 });
    const counter = { v: 0 };
    this.tweens.add({ targets: counter, v: this.score, duration: 1000, delay: 900, onUpdate: () => totalText.setText(`TOTAL: ${Math.round(counter.v)}`) });

    const stars = this._starRating();
    for (let i = 0; i < 3; i++) {
      const earned = i < stars;
      const s = this.add.text(640 + (i - 1) * 60, 372, "★", { font: "40px Arial", color: earned ? HEX_GOLD : "#2a3040" }).setOrigin(0.5).setDepth(91).setScale(0);
      this.tweens.add({ targets: s, scale: 1, duration: 250, delay: 1500 + i * 200, ease: earned ? "Back.easeOut" : "Cubic.easeOut" });
    }

    // badge — a tiny hourglass
    const badge = this.add.container(640, 445).setDepth(91).setAlpha(0);
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillCircle(0, 0, 30);
    bg.lineStyle(3, C_GOLD, 1);
    bg.strokeCircle(0, 0, 30);
    bg.fillStyle(0x8a6435, 1);
    bg.fillRect(-10, -16, 20, 3);
    bg.fillRect(-10, 13, 20, 3);
    bg.lineStyle(1.5, C_BRASS, 0.8);
    bg.lineBetween(-8, -13, -2, 0);
    bg.lineBetween(8, -13, 2, 0);
    bg.lineBetween(-2, 0, -8, 13);
    bg.lineBetween(2, 0, 8, 13);
    bg.fillStyle(0xe0c068, 0.9);
    bg.fillTriangle(-6, 13, 0, 4, 6, 13);
    badge.add(bg);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 2000 });
    const badgeLbl = this.add.text(640, 485, "get() SCHEMA TUNED", { font: "bold 13px Georgia", color: HEX_GOLD }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: badgeLbl, alpha: 1, duration: 300, delay: 2150 });

    this._makeButton(490, 520, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(765, 520, "NEXT: The Restoration Room →", 290, 44, { fill: 0x00733a, stroke: C_GREEN_BRIGHT, textColor: "#ffffff" }, () => {
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
