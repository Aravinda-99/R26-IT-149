/**
 * Level 69 — "The Replication Trials" (Arrays Methods: Tuning Phase —
 * Arrays.copyOf())
 * ===========================================================================
 * Tunes the Level 68 copyOf() schema through rapid-fire fluency trials. A
 * verdigris-tinted sand column draining from a brass funnel through a
 * narrow neck into a lower receiver IS the timer — a linear tween drives
 * the reservoir's fill level, the receiver's pile height, and the grain
 * stream's spawn rate. No parallel clock.
 *
 * New fluency material:
 *  - THE ALIAS-VS-COPY DISCRIMINATION AT SPEED (Wave 2's event): b = a
 *    vs b = Arrays.copyOf(a, a.length) — the wing's deepest schema,
 *    drilled from every angle under time pressure.
 *  - MUTATION PROPAGATION TRACES (Wave 3): multi-statement traces
 *    tracking WHICH tray each variable references, culminating in a
 *    three-reference round (alias + alias + independent copy).
 * The evaluator reuses L68's honest cascade (genuine independent-array
 * creation, genuine reference-sharing for aliases, genuine in-place
 * sort), extended with a live container-shelf reference indicator
 * (dashed cyan for shared trays, solid brass for independent ones).
 */

import Phaser from "phaser";
import { GameManager } from "../../../GameManager.js";
import { BadgeSystem } from "../../../BadgeSystem.js";

const W = 1280, H = 720;

const C_CYAN = 0x4fc3f7, C_GOLD = 0xffd740, C_ORANGE = 0xff9800, C_BLUE_GRAY = 0x8ea6c8;
const C_GREEN_BRIGHT = 0x00e676, C_RED = 0xf44336, C_GRAY = 0x78909c, C_BRASS = 0xc8a05a;
const HEX_CYAN = "#4fc3f7", HEX_GOLD = "#ffd740", HEX_ORANGE = "#ff9800", HEX_BLUE_GRAY = "#8ea6c8";
const HEX_GREEN_BRIGHT = "#00e676", HEX_RED = "#f44336", HEX_GRAY = "#78909c", HEX_BRASS = "#c8a05a";
const C_PATINA = 0x5d7a5d, HEX_PATINA = "#5d7a5d";

// Duplication order card
const CARD_X0 = 250, CARD_X1 = 730, CARD_Y0 = 100, CARD_Y1 = 430;
const CARD_CX = (CARD_X0 + CARD_X1) / 2;
// Sand column
const FUNNEL_CX = 830, FUNNEL_Y0 = 100, FUNNEL_Y1 = 240;
const NECK_Y0 = 240, NECK_Y1 = 300, NECK_W = 20;
const RECV_Y0 = 300, RECV_Y1 = 460;
// Mini replication frame
const MINI_ORIG_X0 = 955, MINI_ORIG_X1 = 1090;
const MINI_COPY_X0 = 1100, MINI_COPY_X1 = 1235;
const MINI_TRAY_Y0 = 115, MINI_TRAY_Y1 = 215;
const MINI_GANTRY_Y = MINI_TRAY_Y0 - 22;
const MINI_BRIDGE_CY = (MINI_TRAY_Y0 + MINI_TRAY_Y1) / 2;
// Mini slate
const SLATE_X = 950, SLATE_Y = 355, SLATE_W = 290, SLATE_H = 140;
// Container shelf
const SHELF_X = 950, SHELF_Y = 510, SHELF_W = 290, SHELF_H = 90;

const TUTORIAL_KEY = "level69_tutorial_done";
const WAVE_TIME = { 1: 12000, 2: 10000, 3: 9000 };

// ══════════════════════════════════════════════════════════════
// ROUND CONFIGURATION
// ══════════════════════════════════════════════════════════════
const ROUNDS = [
  // ══ WAVE 1 — Rapid Duplications (12s) ══
  { round: 1, wave: 1, type: "predict",
    source: "int[] a = {5, 10, 15};\nint[] b = Arrays.copyOf(a, 3);\nSystem.out.println(Arrays.toString(b));",
    question: "What prints?", correct: "[5, 10, 15]",
    options: [
      { value: "[5, 10, 15]", tag: null },
      { value: "[I@...", tag: "array_prints_contents_belief" },
      { value: "[]", tag: "copyOf_empty_belief" },
      { value: "[5, 10, 15, 0]", tag: "copyOf_pads_always_belief" },
    ],
    concept: "fluent_exact_copy" },

  { round: 2, wave: 1, type: "predict",
    source: "int[] a = {1, 2, 3, 4};\nint[] b = Arrays.copyOf(a, 2);\nSystem.out.println(Arrays.toString(b));",
    question: "What prints?", correct: "[1, 2]",
    options: [
      { value: "[1, 2]", tag: null },
      { value: "[3, 4]", tag: "copyOf_takes_last_belief" },
      { value: "[1, 2, 3, 4]", tag: "copyOf_ignores_length_belief" },
      { value: "[1, 2, 0, 0]", tag: "truncation_pads_belief" },
    ],
    concept: "fluent_truncation" },

  { round: 3, wave: 1, type: "predict",
    source: "int[] a = {9};\nint[] b = Arrays.copyOf(a, 3);\nSystem.out.println(Arrays.toString(b));",
    question: "What prints?", correct: "[9, 0, 0]",
    options: [
      { value: "[9, 0, 0]", tag: null },
      { value: "[9, 9, 9]", tag: "padding_repeats_belief" },
      { value: "[9]", tag: "copyOf_ignores_length_belief" },
      { value: "[9, null, null]", tag: "int_default_null_belief" },
    ],
    concept: "fluent_int_padding" },

  { round: 4, wave: 1, type: "predict",
    source: 'String[] a = {"X", "Y"};\nString[] b = Arrays.copyOf(a, 4);\nSystem.out.println(Arrays.toString(b));',
    question: "What prints?", correct: "[X, Y, null, null]",
    options: [
      { value: "[X, Y, null, null]", tag: null },
      { value: "[X, Y, 0, 0]", tag: "string_default_zero_belief" },
      { value: '[X, Y, "", ""]', tag: "string_default_empty_belief" },
      { value: "[X, Y, X, Y]", tag: "padding_repeats_belief" },
    ],
    revealNote: "String is an object — its default is null. int → 0, double → 0.0, String (and every object) → null. Each type has its own empty.",
    concept: "fluent_string_padding" },

  { round: 5, wave: 1, type: "predict",
    source: "int[] a = {1, 2, 3};\nint[] b = Arrays.copyOf(a, 0);\nSystem.out.println(b.length);",
    question: "What prints?", correct: "0",
    options: [
      { value: "0", tag: null },
      { value: "3", tag: "copyOf_ignores_length_belief" },
      { value: "error", tag: "zero_length_error_belief", label: "Runtime error" },
      { value: "null", tag: "zero_length_null_belief" },
    ],
    concept: "fluent_zero_length" },

  // ══ WAVE 2 — The Reference Trials (10s) ══
  { round: 6, wave: 2, type: "predict",
    source: "int[] a = {1, 2, 3};\nint[] b = a;\nb[0] = 99;\nSystem.out.println(a[0]);",
    question: "What prints?", correct: "99",
    options: [
      { value: "99", tag: null },
      { value: "1", tag: "alias_is_copy_belief" },
      { value: "0", tag: "alias_returns_default_belief" },
      { value: "error", tag: "alias_error_belief", label: "Runtime error" },
    ],
    revealNote: "b = a is an ALIAS — one tray, two names. b[0] = 99 changed the tray; a[0] reads 99 because it's the SAME compartment. No bridge, no copy.",
    concept: "fluent_alias_shares" },

  { round: 7, wave: 2, type: "predict",
    source: "int[] a = {1, 2, 3};\nint[] b = Arrays.copyOf(a, 3);\nb[0] = 99;\nSystem.out.println(a[0]);",
    question: "What prints?", correct: "1",
    options: [
      { value: "1", tag: null },
      { value: "99", tag: "copyOf_shares_data_belief" },
      { value: "0", tag: "copyOf_returns_default_belief" },
      { value: "error", tag: "copyOf_modification_error_belief", label: "Runtime error" },
    ],
    revealNote: "copyOf built an INDEPENDENT tray — b[0] = 99 touched only the copy. The original's shield flashed green; a[0] is still 1.",
    concept: "fluent_copyOf_independent" },

  { round: 8, wave: 2, type: "predict",
    source: "int[] a = {5, 3, 8};\nint[] b = a;\nArrays.sort(b);\nSystem.out.println(Arrays.toString(a));",
    question: "What prints?", correct: "[3, 5, 8]",
    options: [
      { value: "[3, 5, 8]", tag: null },
      { value: "[5, 3, 8]", tag: "alias_is_copy_belief" },
      { value: "[8, 5, 3]", tag: "sort_descending_belief" },
      { value: "[3, 5, 8, null]", tag: "sort_padding_belief" },
    ],
    revealNote: "sort hit the SAME tray — a and b are aliases, one tray. Sorting b sorted a too. No copy protected the original.",
    concept: "fluent_alias_sort_hits_both" },

  { round: 9, wave: 2, type: "predict",
    source: "int[] a = {5, 3, 8};\nint[] b = Arrays.copyOf(a, a.length);\nArrays.sort(b);\nSystem.out.println(Arrays.toString(a));",
    question: "What prints?", correct: "[5, 3, 8]",
    options: [
      { value: "[5, 3, 8]", tag: null },
      { value: "[3, 5, 8]", tag: "sort_hits_both_belief" },
      { value: "[8, 5, 3]", tag: "sort_descending_belief" },
      { value: "[3, 5, 8, null]", tag: "sort_padding_belief" },
    ],
    revealNote: "copyOf built the twin; sort touched only b. a stayed at [5, 3, 8]. THE COPY-THEN-SORT PATTERN at speed: original preserved.",
    concept: "fluent_copy_then_sort" },

  { round: 10, wave: 2, type: "predict",
    source: 'int[] a = {1, 2};\nint[] b = a;\nint[] c = Arrays.copyOf(a, 2);\nb[0] = 100;\nSystem.out.println(a[0] + " " + b[0] + " " + c[0]);',
    question: "What prints?", correct: "100 100 1",
    options: [
      { value: "100 100 1", tag: null },
      { value: "100 100 100", tag: "copyOf_shares_data_belief" },
      { value: "1 100 1", tag: "alias_is_copy_belief" },
      { value: "1 1 1", tag: "modification_error_belief" },
    ],
    revealNote: "TWO references, one copy: a and b share (both change to 100); c is independent (stays at 1). Three names, TWO trays — the reference indicators tell the story.",
    concept: "fluent_two_aliases_one_copy" },

  // ══ WAVE 3 — Deep Traces & Bug Hunt ══
  { round: 11, wave: 3, type: "trace",
    source: 'int[] a = {10, 20, 30};\nint[] b = Arrays.copyOf(a, 2);\nb[0] = 99;\nSystem.out.println(Arrays.toString(a) + " " + Arrays.toString(b));',
    question: "What prints?", correct: "[10, 20, 30] [99, 20]",
    options: [
      { value: "[10, 20, 30] [99, 20]", tag: null },
      { value: "[99, 20, 30] [99, 20]", tag: "copyOf_shares_data_belief" },
      { value: "[10, 20, 30] [10, 20]", tag: "modification_didnt_stick" },
      { value: "[10, 20, 30] [99, 20, 30]", tag: "copyOf_ignores_length_belief" },
    ],
    revealNote: "Truncated AND independent: b is size 2 [10, 20], then b[0] = 99 → [99, 20]. a is untouched — its size 3 [10, 20, 30] intact. Two independent trays of different sizes.",
    concept: "trace_truncation_plus_independence" },

  { round: 12, wave: 3, type: "trace",
    source: "int[] a = {1, 2, 3};\nint[] b = Arrays.copyOf(a, 5);\nb[3] = 40;\nb[4] = 50;\nSystem.out.println(Arrays.toString(b));",
    question: "What prints?", correct: "[1, 2, 3, 40, 50]",
    options: [
      { value: "[1, 2, 3, 40, 50]", tag: null },
      { value: "[1, 2, 3, 0, 0]", tag: "modification_didnt_stick" },
      { value: "[1, 2, 3]", tag: "copyOf_ignores_length_belief" },
      { value: "error", tag: "modification_out_of_bounds_belief", label: "IOOBE" },
    ],
    revealNote: "Extended AND filled: copyOf built a 5-slot tray padded to [1, 2, 3, 0, 0]; then b[3] = 40, b[4] = 50 overwrote the defaults. The extend pattern — copyOf makes room, brackets fill it.",
    concept: "trace_extend_pattern" },

  { round: 13, wave: 3, type: "trace",
    source: 'String[] a = {"P", "Q", "R"};\nString[] b = Arrays.copyOf(a, 5);\nb[3] = "S";\nSystem.out.println(Arrays.toString(b));',
    question: "What prints?", correct: "[P, Q, R, S, null]",
    options: [
      { value: "[P, Q, R, S, null]", tag: null },
      { value: "[P, Q, R, S]", tag: "unfilled_dropped_belief" },
      { value: '[P, Q, R, S, ""]', tag: "string_default_empty_belief" },
      { value: "[P, Q, R, S, 0]", tag: "string_default_zero_belief" },
    ],
    revealNote: "Filled index 3 with 'S'; index 4 stayed null (the String default). The unfilled slot survives the print as 'null' — the compartment holds no String at all.",
    concept: "trace_partial_fill" },

  { round: 14, wave: 3, type: "bughunt",
    lines: ["int[] original = {50, 20, 80};", "int[] backup = original;", "Arrays.sort(original);", 'System.out.println("Backup: " + Arrays.toString(backup));', "// intent: preserve the original order in backup"],
    faultToken: "int[] backup = original", faultLine: 2, tokenRegion: "alias_declaration",
    fix: "Arrays.copyOf(original, original.length)",
    explanation: "The alias mistake — 'backup = original' put two labels on ONE tray. When sort ran, backup was also sorted (they're the same tray). The intended backup [50, 20, 80] became [20, 50, 80]. copyOf builds a SEPARATE tray whose bridge is cut before sort can touch it.",
    wrongTag: "alias_backup_bug",
    revealNote: "Dual-future reveal: the buggy run shows ONE tray with two labels; sort rearranges [20, 50, 80]; backup prints [20, 50, 80] — the same lie. Reset; the fixed run builds a second tray; sort touches only the original; backup prints [50, 20, 80] preserved. Bit: 'Equals aliases; copyOf duplicates. Never confuse them again.'",
    concept: "alias_backup_bug" },

  { round: 15, wave: 3, type: "bughunt",
    lines: ["int[] scores = {88, 45, 92, 71, 63};", "int[] full = Arrays.copyOf(scores, scores.length - 1);", "System.out.println(Arrays.toString(full));", "// intent: full copy of scores"],
    faultToken: "scores.length - 1", faultLine: 2, tokenRegion: "off_by_one_length",
    fix: "scores.length",
    explanation: "The off-by-one length — 'length - 1' is right for the LAST INDEX, but it's wrong for a COPY LENGTH. A full copy needs length TOTAL slots. length - 1 silently truncates the last specimen, producing [88, 45, 92, 71] and losing 63.",
    wrongTag: "copyOf_length_off_by_one",
    revealNote: "Dual-future reveal: the buggy run's copy tray materializes with 4 compartments; specimen 63 stays in the original, red-blinked as skipped; full prints [88, 45, 92, 71]. Reset; the fixed run creates a 5-compartment copy; full prints [88, 45, 92, 71, 63] complete. Bit: 'length is the TOTAL, not the last index. Copy length equals array length for a full duplicate.'",
    concept: "off_by_one_length_bug" },
];

const MISCONCEPTION_FEEDBACK = {
  alias_is_copy_belief: "At speed the assignment habit tempts you — but = is ALIAS in this wing. copyOf is the copy word. Never one for the other.",
  copyOf_shares_data_belief: "The bridge was CUT — two trays, two lives. Changing one never touches the other.",
  copyOf_ignores_length_belief: "The length parameter is EXACT — 3 means 3 slots, 5 means 5, 0 means 0. Never a hint, always a hard count.",
  copyOf_length_off_by_one: "length is TOTAL, not last-index. length − 1 leaves one specimen behind. For a full copy, use length itself.",
  padding_repeats_belief: "Extras get TYPE DEFAULTS, not repeats — 0 for int, null for objects. The tray doesn't loop back to existing specimens.",
  int_default_null_belief: "int compartments default to 0, not null. null is for object types. Primitives have numeric zeros.",
  string_default_zero_belief: "String is an object type — its default is null, not 0. A null compartment holds NO String at all.",
  string_default_empty_belief: "String is an object type — its default is null, not an empty string. A null compartment holds NO String at all — not even a blank one.",
  arrays_instance_call_belief: "Static, always — Arrays.copyOf, not arr.copyOf(). The bench lives in the class.",
  sort_hits_both_belief: "sort only touches ONE tray — the one you pass in. With a real copy (not an alias), the original stays untouched. The bridge blocks the mutation.",
  truncation_silent_bug: "The copy came out one short and nobody noticed — the compiler was fine, the program ran, one specimen quietly missing. Length parameters need the same care as indices.",
  truncation_pads_belief: "Truncation ends at the length — no padding beyond. copyOf gives you EXACTLY the size you request: 2 compartments, no defaults added.",
  copyOf_takes_last_belief: "copyOf always takes from the FRONT — index 0 onward, up to the length. Never the tail end.",
  copyOf_empty_belief: "copyOf(a, 3) with a matching length duplicates the specimens — it doesn't discard them.",
  copyOf_pads_always_belief: "Same length as the original means an EXACT duplicate — no padding needed, nothing added.",
  alias_returns_default_belief: "The values stayed as assigned — nothing reset to default. Alias shares; copy duplicates; both keep their compartments' current contents.",
  alias_error_belief: "No error — reading through an alias is exactly as legal as reading through the original name.",
  copyOf_returns_default_belief: "The values stayed as assigned — nothing reset to default. Alias shares; copy duplicates; both keep their compartments' current contents.",
  copyOf_modification_error_belief: "No error — modifying an independent copy is completely normal. The original just doesn't feel it.",
  zero_length_error_belief: "Length 0 is legal — an empty tray, .length returns 0, no null, no crash. An honest zero.",
  zero_length_null_belief: "Length 0 is legal — an empty tray, .length returns 0, no null, no crash. An honest zero.",
  sort_descending_belief: "sort is ascending, always — smallest to largest, A to Z.",
  sort_padding_belief: "sort rearranges the EXISTING compartments — it never adds or pads. The array's length never changes.",
  modification_error_belief: "No error — the bracket writes are all within bounds. Trace the trace: which name shares which tray.",
  modification_didnt_stick: "The assignment ran — the report shows it. Bracket writes work on any array, original or copy. Read the trace one line at a time.",
  unfilled_dropped_belief: "Unfilled slots stay in the copy — they hold their default (null for Strings). They don't vanish; they just hold nothing.",
  modification_out_of_bounds_belief: "Within a copy's bounds, mutation is legal — b[3] on a 5-slot tray is fine. Out of bounds is the crash, not within.",
  alias_backup_bug: "backup = original made one tray with two names — sort found both. A backup needs its own tray: Arrays.copyOf(original, original.length).",
  timeout: "The sand won! Certify faster — copyOf verdicts are reflexes now. Read the length; trust the shield.",
};

export class Level69Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level69Scene" });
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
    this._sandHalted = true;
  }

  preload() {}

  create() {
    this._alive = true;
    this.createParticleTexture();
    this.createBackground();
    this.createRoomDim();
    this.createLeaderboard();
    this.createTuningFork();
    this.createSpecimenValise();
    this.createTrialsBanner();
    this.createParticles();
    this.createDuplicationOrder();
    this.createSandColumn();
    this.createMiniReplicationFrame();
    this.createMiniSlate();
    this.createContainerShelf();
    this.createHUD();
    this.createBit();

    this.events.on("shutdown", () => { this._alive = false; this._killSandTween(); });
    this.checkTutorial();
  }

  update(time, delta) {
    this.updateParticles(time, delta);
    this.updateSandDrain(time);
    this.updateSandUrgency(time);
    this.updateGrainStream(time);
    this.updateTuningForkVibration(time);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // SETUP — TRIALS ROOM DRESSING
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l69_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l69_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x081008).setDepth(0);
  }

  createRoomDim() {
    const g = this.add.graphics().setDepth(1).setAlpha(0.4);
    g.fillStyle(0x0a0d18, 1);
    g.fillRect(0, 635, W, 85);
    g.lineStyle(1, 0x2a3654, 0.5);
    g.lineBetween(0, 637, W, 637);
  }

  createLeaderboard() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x0d1508, 0.7);
    g.lineStyle(2, 0x8a6435, 1);
    g.fillRect(200, 40, 580, 130);
    g.strokeRect(200, 40, 580, 130);
    this._leaderboardRows = [];
    for (let i = 0; i < 5; i++) {
      const y = 58 + i * 22;
      const rank = this.add.text(216, y, `${i + 1}.`, { font: "9px Courier New", color: HEX_BLUE_GRAY }).setAlpha(0.15).setDepth(2);
      const name = this.add.text(240, y, "—————", { font: "9px Courier New", color: HEX_BLUE_GRAY }).setAlpha(0.15).setDepth(2);
      const timeT = this.add.text(700, y, "--.-s", { font: "9px Courier New", color: HEX_BLUE_GRAY }).setAlpha(0.15).setDepth(2);
      this._leaderboardRows.push({ rank, name, timeT });
    }
  }

  createTuningFork() {
    const c = this.add.container(80, 260).setDepth(3);
    const g = this.add.graphics();
    g.lineStyle(2, C_BRASS, 0.6);
    g.lineBetween(-8, -30, -8, 10);
    g.lineBetween(8, -30, 8, 10);
    g.lineBetween(-8, 10, 8, 10);
    g.lineBetween(0, 10, 0, 26);
    c.add(g);
    this._tuningForkG = g;
    this._tuningForkC = c;
    this._forkPhase = 0;
  }

  updateTuningForkVibration(time) {
    if (!this._tuningForkC) return;
    const amp = this._sandUrgency === "critical" ? 2.2 : this._sandUrgency === "warning" ? 1.2 : 0.5;
    this._tuningForkC.x = 80 + Math.sin(time * 0.02) * amp;
  }

  createSpecimenValise() {
    const g = this.add.graphics().setDepth(2).setAlpha(0.4);
    g.fillStyle(0x3a2618, 0.5);
    g.lineStyle(1.5, C_BRASS, 0.5);
    g.fillRoundedRect(60, 480, 60, 40, 4);
    g.strokeRoundedRect(60, 480, 60, 40, 4);
    g.lineStyle(1, C_BRASS, 0.7);
    g.strokeRect(85, 495, 10, 6);
  }

  createTrialsBanner() {
    const g = this.add.graphics().setDepth(2);
    g.fillStyle(0x081008, 1);
    g.lineStyle(1, C_BRASS, 0.5);
    g.fillRoundedRect(460, 12, 360, 26, 3);
    g.strokeRoundedRect(460, 12, 360, 26, 3);
    this.add.text(640, 25, "T H E   R E P L I C A T I O N   T R I A L S", { font: "bold 11px Georgia", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.7).setDepth(3);
  }

  createParticles() {
    this.ambient = [];
    const colors = [0x8ea6c8, 0xc8a05a, 0x5d7a5d];
    for (let i = 0; i < 7; i++) {
      this.ambient.push(this.add.circle(Phaser.Math.Between(0, W), Phaser.Math.Between(150, 630), 1, Phaser.Utils.Array.GetRandom(colors), Phaser.Math.FloatBetween(0.02, 0.04)).setDepth(2));
    }
  }

  updateParticles(time, delta) {
    if (!this.ambient) return;
    const step = 0.006 * (delta / 16.7);
    this.ambient.forEach((p, i) => {
      p.y -= step * (i % 2 === 0 ? 1 : 0.6);
      p.x += Math.sin(time * 0.0003 + i) * 0.02;
      if (p.y < 150) p.y = 630; if (p.y > 630) p.y = 150;
      if (p.x > W) p.x = 0; if (p.x < 0) p.x = W;
    });
  }

  createAnnotation(x, y, text, colorHex) {
    const t = this.add.text(x, y, text, { font: "italic 10px Arial", color: colorHex, wordWrap: { width: 280 }, align: "center" }).setOrigin(0.5).setDepth(70).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 200 });
    this.time.delayedCall(2200, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() }); });
    return t;
  }

  createFloatingText(x, y, text, colorHex, font = "bold 13px Arial", hold = 1400) {
    const t = this.add.text(x, y, text, { font, color: colorHex, wordWrap: { width: 320 }, align: "center" }).setOrigin(0.5).setDepth(31).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 180 });
    this.time.delayedCall(hold, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() }); });
    return t;
  }

  createConfetti(x, y, count = 30) {
    const p = this.add.particles(x, y, "l69_dot", {
      speed: { min: 80, max: 240 }, angle: { min: 0, max: 360 }, scale: { start: 0.9, end: 0 }, lifespan: 500,
      tint: [C_BRASS, C_GOLD, C_GREEN_BRIGHT, 0xffffff], emitting: false,
    }).setDepth(75);
    p.explode(count);
    this.time.delayedCall(900, () => p.destroy());
  }

  screenShake(intensity = 0.004, duration = 150) {
    this.cameras.main.shake(duration, intensity);
  }

  // ══════════════════════════════════════════════════════════════
  // THE DUPLICATION ORDER
  // ══════════════════════════════════════════════════════════════

  createDuplicationOrder() {
    const g = this.add.graphics().setDepth(20);
    g.fillStyle(0xe0d6b8, 1);
    g.lineStyle(2, 0x8a6435, 1);
    g.fillRoundedRect(CARD_X0, CARD_Y0, CARD_X1 - CARD_X0, CARD_Y1 - CARD_Y0, 4);
    g.strokeRoundedRect(CARD_X0, CARD_Y0, CARD_X1 - CARD_X0, CARD_Y1 - CARD_Y0, 4);
    g.fillStyle(0x8a6435, 0.15);
    g.fillRect(CARD_X0, CARD_Y0, CARD_X1 - CARD_X0, 24);
    g.lineStyle(1, 0x8a6435, 0.15);
    for (let y = CARD_Y0 + 48; y < CARD_Y1 - 44; y += 20) g.lineBetween(CARD_X0 + 16, y, CARD_X1 - 16, y);
    [CARD_X0 + 30, CARD_X1 - 30].forEach((cx) => {
      g.fillStyle(C_BRASS, 1);
      g.lineStyle(1, 0x8a6435, 1);
      g.fillCircle(cx, CARD_Y0 - 4, 4);
      g.lineBetween(cx, CARD_Y0 - 4, cx, CARD_Y0 + 4);
    });
    g.fillStyle(C_BRASS, 1);
    g.fillCircle(CARD_CX, CARD_Y0 - 4, 4);

    this.add.text(CARD_CX, CARD_Y0 + 12, "DUPLICATION ORDER — WORK NO. 1", { font: "bold 8px Georgia", color: "#8a6435" }).setOrigin(0.5).setDepth(21);
    this.cardHeaderText = this.add.text(CARD_CX, CARD_Y0 + 12, "", { font: "bold 8px Georgia", color: "#8a6435" }).setOrigin(0.5).setDepth(21);
    this.cardRoundLabel = this.add.text(CARD_X1 - 14, CARD_Y0 + 12, "WORK 1/15", { font: "bold 9px Courier New", color: "#8a6435" }).setOrigin(1, 0.5).setDepth(21);
    this.cardContentContainer = this.add.container(0, 0).setDepth(21);
    this.cardQuestionText = this.add.text(CARD_CX, CARD_Y1 - 26, "", { font: "bold 12px Georgia", color: "#241a0e", wordWrap: { width: CARD_X1 - CARD_X0 - 40 }, align: "center" }).setOrigin(0.5).setDepth(21);
    this.cardStampLayer = this.add.container(CARD_CX, (CARD_Y0 + CARD_Y1) / 2).setDepth(35);
  }

  clearCardContent() {
    this.cardContentContainer.removeAll(true);
    this.cardQuestionText.setText("");
    this.cardStampLayer.removeAll(true);
  }

  showTrialOnOrder(lines, questionText) {
    this.clearCardContent();
    this.cardHeaderText.setText(`DUPLICATION ORDER — WORK NO. ${this.currentRound + 1}`);
    const maxLen = Math.max(...lines.map((l) => l.length));
    const fontSize = maxLen > 40 ? 10 : maxLen > 28 ? 12 : 14;
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
    this.cardRoundLabel.setText(`WORK ${this.currentRound + 1}/15`);
  }

  _codeTokenize(line) {
    const tokens = [];
    const re = /("(?:[^"\\]|\\.)*")|(\bint\b|\bString\b|\bnew\b)|(\bArrays\b)|(\.copyOf\b|\.sort\b|\.toString\b|\.length\b)|(-?\d+\.\d+|-?\d+)|([(){}\[\];.,=+])/g;
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

  async stampOrder(kind) {
    const labels = { certified: "CERTIFIED", misduplicated: "MISDUPLICATED", void: "CERTIFICATION VOID" };
    const colors = { certified: HEX_GREEN_BRIGHT, misduplicated: HEX_RED, void: HEX_RED };
    const stamp = this.add.text(0, 0, labels[kind], { font: "bold 20px Georgia", color: colors[kind] }).setOrigin(0.5).setScale(1.4).setAngle(-8).setAlpha(0);
    this.cardStampLayer.add(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 180 });
    const hold = kind === "void" ? 1800 : 700;
    await this.delay(hold);
    if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 200, onComplete: () => stamp.destroy() });
  }

  // ══════════════════════════════════════════════════════════════
  // THE SAND COLUMN (THE TIMER — hero mechanic)
  // ══════════════════════════════════════════════════════════════

  createSandColumn() {
    const frame = this.add.graphics().setDepth(10);
    frame.lineStyle(2, C_BRASS, 1);
    frame.strokeTriangle(FUNNEL_CX - 50, FUNNEL_Y0, FUNNEL_CX + 50, FUNNEL_Y0, FUNNEL_CX + 10, FUNNEL_Y1);
    frame.lineBetween(FUNNEL_CX - 50, FUNNEL_Y0, FUNNEL_CX - 10, FUNNEL_Y1);
    frame.strokeRect(FUNNEL_CX - NECK_W / 2, NECK_Y0, NECK_W, NECK_Y1 - NECK_Y0);
    frame.beginPath();
    frame.moveTo(FUNNEL_CX - NECK_W / 2, RECV_Y0);
    frame.lineTo(FUNNEL_CX - 60, RECV_Y1);
    frame.lineTo(FUNNEL_CX + 60, RECV_Y1);
    frame.lineTo(FUNNEL_CX + NECK_W / 2, RECV_Y0);
    frame.strokePath();
    this._sandFrameGfx = frame;

    this.reservoirGfx = this.add.graphics().setDepth(9);
    this.pileGfx = this.add.graphics().setDepth(9);
    this.streamGfx = this.add.graphics().setDepth(9);
    this.grainLayer = this.add.container(0, 0).setDepth(11);
    this._grains = [];

    this.criticalRing = this.add.circle(FUNNEL_CX, NECK_Y1, 14, 0xff6f60, 0).setDepth(12);

    this._sandProgress = 0;
    this._sandUrgency = "safe";
    this._lastGrainSpawn = 0;

    this.neckPlunger = this.add.rectangle(FUNNEL_CX, NECK_Y0 - 8, NECK_W + 4, 6, C_BRASS, 0).setDepth(13);
  }

  _lerpColor69(c1, c2, t) {
    const r1 = (c1 >> 16) & 0xff, g1 = (c1 >> 8) & 0xff, b1 = c1 & 0xff;
    const r2 = (c2 >> 16) & 0xff, g2 = (c2 >> 8) & 0xff, b2 = c2 & 0xff;
    const r = Math.round(r1 + (r2 - r1) * t), g = Math.round(g1 + (g2 - g1) * t), b = Math.round(b1 + (b2 - b1) * t);
    return (r << 16) | (g << 8) | b;
  }

  updateSandDrain(time) {
    if (!this.reservoirGfx) return;
    const progress = this._sandProgress || 0;
    const urgencyT = this._sandUrgency === "critical" ? 0.7 : this._sandUrgency === "warning" ? 0.4 : 0.15;
    const sandColor = this._lerpColor69(C_BRASS, C_PATINA, urgencyT);

    this.reservoirGfx.clear();
    if (progress < 1) {
      const fillY = FUNNEL_Y0 + progress * (FUNNEL_Y1 - FUNNEL_Y0);
      const widthAt = (y) => 100 - ((y - FUNNEL_Y0) / (FUNNEL_Y1 - FUNNEL_Y0)) * 80;
      const wTop = widthAt(fillY), wBot = 20;
      this.reservoirGfx.fillStyle(sandColor, 0.85);
      this.reservoirGfx.fillPoints([
        FUNNEL_CX - wTop / 2, fillY, FUNNEL_CX + wTop / 2, fillY,
        FUNNEL_CX + wBot / 2, FUNNEL_Y1, FUNNEL_CX - wBot / 2, FUNNEL_Y1,
      ], true);
    }

    this.pileGfx.clear();
    if (progress > 0) {
      const pileH = progress * (RECV_Y1 - RECV_Y0 - 16);
      const pileTopY = Math.max(RECV_Y0, RECV_Y1 - pileH);
      const wAtTop = 20 + ((pileTopY - RECV_Y0) / (RECV_Y1 - RECV_Y0)) * 100;
      this.pileGfx.fillStyle(sandColor, 0.9);
      this.pileGfx.fillPoints([
        FUNNEL_CX - wAtTop / 2, pileTopY, FUNNEL_CX + wAtTop / 2, pileTopY,
        FUNNEL_CX + 60, RECV_Y1, FUNNEL_CX - 60, RECV_Y1,
      ], true);
    }

    this.streamGfx.clear();
    if (progress < 1 && !this._sandHalted) {
      const streamW = this._sandUrgency === "critical" ? 4 : this._sandUrgency === "warning" ? 3 : 2;
      this.streamGfx.fillStyle(sandColor, 0.8);
      this.streamGfx.fillRect(FUNNEL_CX - streamW / 2, NECK_Y0, streamW, NECK_Y1 - NECK_Y0);
    }
  }

  updateSandUrgency(time) {
    if (this._sandProgress === undefined) return;
    const rem = 1 - this._sandProgress;
    const state = rem <= 0.15 ? "critical" : rem <= 0.33 ? "warning" : "safe";
    if (state === this._sandUrgency) return;
    this._sandUrgency = state;
    if (state === "critical") this._startCriticalGlow(); else this._stopCriticalGlow();
  }

  _startCriticalGlow() {
    if (this._criticalTween) return;
    this.criticalRing.setAlpha(0.4);
    this._criticalTween = this.tweens.add({ targets: this.criticalRing, alpha: 0.1, duration: 350, yoyo: true, repeat: -1 });
  }

  _stopCriticalGlow() {
    if (this._criticalTween) { this._criticalTween.stop(); this._criticalTween = null; }
    this.criticalRing.setAlpha(0);
  }

  updateGrainStream(time) {
    if (this._sandHalted || this._sandProgress >= 1) return;
    const interval = this._sandUrgency === "critical" ? 70 : this._sandUrgency === "warning" ? 130 : 220;
    if (time - this._lastGrainSpawn < interval) return;
    this._lastGrainSpawn = time;
    const pileH = (this._sandProgress || 0) * (RECV_Y1 - RECV_Y0 - 16);
    const pileTopY = Math.max(RECV_Y0, RECV_Y1 - pileH);
    const grain = this.add.circle(FUNNEL_CX + Phaser.Math.Between(-2, 2), NECK_Y1, 1.5, C_BRASS, 0.8).setDepth(11);
    this.grainLayer.add(grain);
    this.tweens.add({
      targets: grain, y: pileTopY, x: FUNNEL_CX + Phaser.Math.Between(-14, 14), duration: 260,
      onComplete: () => grain.destroy(),
    });
  }

  startSandDrain(timeLimitMs) {
    this._killSandTween();
    this.roundTimeLimit = timeLimitMs;
    this._sandProgress = 0;
    this._sandHalted = false;
    this._sandUrgency = "safe";
    this._stopCriticalGlow();
    this.neckPlunger.setAlpha(0);
    const state = { v: 0 };
    this._sandTween = this.tweens.add({
      targets: state, v: 1, duration: timeLimitMs, ease: "Linear",
      onUpdate: () => { this._sandProgress = state.v; },
      onComplete: () => { if (this._alive && !this._sandHalted) this.onSandTimeout(this._currentConfig); },
    });
  }

  _killSandTween() {
    if (this._sandTween) { this._sandTween.stop(); this._sandTween = null; }
    this._stopCriticalGlow();
  }

  async sealNeck() {
    this._sandHalted = true;
    this._killSandTween();
    await new Promise((res) => { this.tweens.add({ targets: this.neckPlunger, alpha: 1, duration: 120, ease: "Back.easeOut", onComplete: res }); });
  }

  async lastGrainCascade() {
    for (let i = 0; i < 6; i++) {
      const grain = this.add.circle(FUNNEL_CX + Phaser.Math.Between(-3, 3), NECK_Y1, 1.5, 0xff6f60, 0.9).setDepth(11);
      this.grainLayer.add(grain);
      this.tweens.add({ targets: grain, y: RECV_Y1 - 20, x: FUNNEL_CX + Phaser.Math.Between(-20, 20), duration: 150, onComplete: () => grain.destroy() });
      await this.delay(35);
    }
    const flash = this.add.circle(FUNNEL_CX, NECK_Y1, 8, 0xffffff, 0.7).setDepth(12);
    this.tweens.add({ targets: flash, radius: 20, alpha: 0, duration: 250, onComplete: () => flash.destroy() });
    await this.delay(150);
  }

  // ══════════════════════════════════════════════════════════════
  // MINI REPLICATION FRAME (compact L68 dual-tray, 55% scale, 1.3x tempo)
  // ══════════════════════════════════════════════════════════════

  createMiniReplicationFrame() {
    const drawFrame = (x0, x1) => {
      const g = this.add.graphics().setDepth(10);
      g.fillStyle(0x0d0a06, 0.8);
      g.lineStyle(1.5, C_BRASS, 1);
      g.fillRoundedRect(x0, MINI_TRAY_Y0, x1 - x0, MINI_TRAY_Y1 - MINI_TRAY_Y0, 4);
      g.strokeRoundedRect(x0, MINI_TRAY_Y0, x1 - x0, MINI_TRAY_Y1 - MINI_TRAY_Y0, 4);
      return g;
    };
    this._origFrameGfx = drawFrame(MINI_ORIG_X0, MINI_ORIG_X1);
    this._copyFrameGfx = drawFrame(MINI_COPY_X0, MINI_COPY_X1);
    this._copyGlowOutline = this.add.rectangle((MINI_COPY_X0 + MINI_COPY_X1) / 2, (MINI_TRAY_Y0 + MINI_TRAY_Y1) / 2, MINI_COPY_X1 - MINI_COPY_X0 + 4, MINI_TRAY_Y1 - MINI_TRAY_Y0 + 4, 0, 0).setStrokeStyle(1.5, C_CYAN, 0).setDepth(11);

    this.origVarLabel = this.add.text(MINI_ORIG_X1 - 4, MINI_TRAY_Y0 - 12, "", { font: "italic 8px Courier New", color: HEX_CYAN }).setOrigin(1, 0).setDepth(11);
    this.origVarLabel2 = this.add.text(MINI_ORIG_X1 - 4, MINI_TRAY_Y0 - 22, "", { font: "italic 8px Courier New", color: HEX_GREEN_BRIGHT }).setOrigin(1, 0).setDepth(11);
    this.copyVarLabel = this.add.text(MINI_COPY_X1 - 4, MINI_TRAY_Y0 - 12, "", { font: "italic 8px Courier New", color: HEX_CYAN }).setOrigin(1, 0).setDepth(11).setAlpha(0);

    this.origCompartmentLayer = this.add.container(0, 0).setDepth(11);
    this.origSpecimenLayer = this.add.container(0, 0).setDepth(12);
    this._origCompartments = [];
    this.copyCompartmentLayer = this.add.container(0, 0).setDepth(11);
    this.copySpecimenLayer = this.add.container(0, 0).setDepth(12);
    this._copyCompartments = [];

    const bridgeG = this.add.graphics().setDepth(9);
    bridgeG.lineStyle(1, C_BRASS, 0.5);
    bridgeG.lineBetween(MINI_ORIG_X1, MINI_BRIDGE_CY - 8, MINI_COPY_X0, MINI_BRIDGE_CY - 8);
    bridgeG.lineBetween(MINI_ORIG_X1, MINI_BRIDGE_CY + 8, MINI_COPY_X0, MINI_BRIDGE_CY + 8);
    this.bridgeArrow = this.add.text((MINI_ORIG_X1 + MINI_COPY_X0) / 2, MINI_BRIDGE_CY, "→", { font: "bold 12px Georgia", color: HEX_BRASS }).setOrigin(0.5).setDepth(10).setAlpha(0.6);
    this.bridgeCordLayer = this.add.container(0, 0).setDepth(13);
  }

  async populateOriginalTray(values, type, varName) {
    this.origCompartmentLayer.removeAll(true);
    this.origSpecimenLayer.removeAll(true);
    this._origCompartments = [];
    this.origVarLabel.setText(varName || "a");
    this.origVarLabel2.setText("").setAlpha(0);
    const n = values.length;
    const innerX0 = MINI_ORIG_X0 + 4, innerX1 = MINI_ORIG_X1 - 4;
    const innerW = innerX1 - innerX0;
    const cellW = n > 0 ? innerW / n : innerW;

    for (let i = 0; i < n; i++) {
      const cellX = innerX0 + i * cellW;
      if (i > 0) {
        const dg = this.add.graphics();
        dg.lineStyle(1, C_BRASS, 0.35);
        dg.lineBetween(cellX, MINI_TRAY_Y0 + 4, cellX, MINI_TRAY_Y1 - 12);
        this.origCompartmentLayer.add(dg);
      }
      const idxPlate = this.add.text(cellX + cellW / 2, MINI_TRAY_Y1 - 6, `[${i}]`, { font: "bold 6px Courier New", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.55);
      this.origCompartmentLayer.add(idxPlate);
      this._origCompartments.push({ x: cellX, w: cellW, idxPlate });
    }
    for (let i = 0; i < n; i++) {
      const card = await this._buildCard(this.origSpecimenLayer, this._origCompartments[i], values[i], type, false);
      this._origCompartments[i] = { ...this._origCompartments[i], ...card, value: values[i] };
      await this.delay(35);
    }
    await this.delay(50);
  }

  async _buildCard(layer, comp, value, type, isGhostDefault) {
    const color = isGhostDefault ? 0x3a4048 : (type === "String[]" ? C_CYAN : C_GOLD);
    const cardW = Math.min(comp.w - 6, 30), cardH = 22;
    const cx = comp.x + comp.w / 2, cy = (MINI_TRAY_Y0 + MINI_TRAY_Y1) / 2 - 3;
    const card = this.add.container(cx, cy).setAlpha(0).setScale(0.7);
    const cg = this.add.graphics();
    cg.fillStyle(color, isGhostDefault ? 0.35 : 0.9);
    cg.lineStyle(1, Phaser.Display.Color.IntegerToColor(color).darken(30).color, 1);
    cg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 3);
    cg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 3);
    const display = this._fmtVal(value);
    const txt = this.add.text(0, 0, display, isGhostDefault
      ? { font: "italic 7px Courier New", color: "#78909c" }
      : { font: "bold 8px Courier New", color: "#0a1208" }).setOrigin(0.5);
    if (txt.width > cardW - 4) txt.setFontSize(5.5);
    card.add([cg, txt]);
    layer.add(card);
    this.tweens.add({ targets: card, alpha: 1, scale: 1, duration: 110, ease: "Back.easeOut" });
    return { card, cardGfx: cg, cardText: txt, cardColor: color, cardW };
  }

  _fmtVal(v) { return v === null ? "null" : String(v); }

  clearReplicationFrame() {
    this.origCompartmentLayer.removeAll(true);
    this.origSpecimenLayer.removeAll(true);
    this._origCompartments = [];
    this.copyCompartmentLayer.removeAll(true);
    this.copySpecimenLayer.removeAll(true);
    this._copyCompartments = [];
    this.copyVarLabel.setAlpha(0);
    this.origVarLabel.setText("");
    this.origVarLabel2.setText("").setAlpha(0);
    this._copyGlowOutline.setStrokeStyle(1.5, C_CYAN, 0);
    this.bridgeCordLayer.removeAll(true);
  }

  async materializeCopyTray(length, type, varName) {
    this.copyCompartmentLayer.removeAll(true);
    this.copySpecimenLayer.removeAll(true);
    this._copyCompartments = [];
    this.copyVarLabel.setText(varName || "b").setAlpha(0);

    const n = length;
    const innerX0 = MINI_COPY_X0 + 4, innerX1 = MINI_COPY_X1 - 4;
    const innerW = innerX1 - innerX0;
    const cellW = n > 0 ? innerW / n : innerW;
    for (let i = 0; i < n; i++) {
      const cellX = innerX0 + i * cellW;
      if (i > 0) {
        const dg = this.add.graphics();
        dg.lineStyle(1, C_BRASS, 0.35);
        dg.lineBetween(cellX, MINI_TRAY_Y0 + 4, cellX, MINI_TRAY_Y1 - 12);
        this.copyCompartmentLayer.add(dg);
      }
      const idxPlate = this.add.text(cellX + cellW / 2, MINI_TRAY_Y1 - 6, `[${i}]`, { font: "bold 6px Courier New", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.55);
      this.copyCompartmentLayer.add(idxPlate);
      this._copyCompartments.push({ x: cellX, w: cellW, idxPlate });
    }
    this._copyGlowOutline.setStrokeStyle(1.5, C_CYAN, 0.5);
    this.tweens.add({ targets: this.copyVarLabel, alpha: 1, duration: 200 });
    await this.delay(200);
  }

  async runDuplicationBeam() {
    const beam = this.add.rectangle(MINI_ORIG_X0, MINI_BRIDGE_CY, 2, MINI_TRAY_Y1 - MINI_TRAY_Y0 - 8, C_CYAN, 0.9).setDepth(16);
    await new Promise((res) => {
      this.tweens.add({ targets: beam, x: MINI_ORIG_X1, duration: 160, ease: "Sine.easeInOut", onComplete: () => { beam.destroy(); res(); } });
    });
  }

  async flyGhostCopies(values, copyLength, type) {
    const crossCount = Math.min(values.length, copyLength);
    for (let i = 0; i < crossCount; i++) {
      if (!this._alive) return;
      const origComp = this._origCompartments[i];
      const copyComp = this._copyCompartments[i];
      if (!origComp || !copyComp) continue;
      const ghost = this.add.text(origComp.x + origComp.w / 2, (MINI_TRAY_Y0 + MINI_TRAY_Y1) / 2 - 3, this._fmtVal(values[i]), { font: "bold 7px Courier New", color: HEX_CYAN }).setOrigin(0.5).setDepth(17).setAlpha(0.9);
      const destX = copyComp.x + copyComp.w / 2;
      this.tweens.add({ targets: ghost, x: destX, duration: 140, ease: "Sine.easeInOut", onComplete: () => ghost.destroy() });
      await this.delay(55);
      const card = await this._buildCard(this.copySpecimenLayer, copyComp, values[i], type, false);
      this._copyCompartments[i] = { ...copyComp, ...card, value: values[i] };
      await this.delay(40);
    }
  }

  async showPadding(startIndex, endIndex, type) {
    const defaultVal = type === "String[]" ? null : 0;
    for (let i = startIndex; i < endIndex; i++) {
      if (!this._alive) return;
      const comp = this._copyCompartments[i];
      if (!comp) continue;
      const card = await this._buildCard(this.copySpecimenLayer, comp, defaultVal, type, true);
      this._copyCompartments[i] = { ...comp, ...card, value: defaultVal };
      await this.delay(35);
    }
    await this.delay(60);
  }

  async showTruncation(skippedIndices) {
    if (!skippedIndices.length) return;
    for (const idx of skippedIndices) {
      const comp = this._origCompartments[idx];
      if (!comp || !comp.card) continue;
      this.tweens.add({ targets: comp.cardGfx, alpha: 0.3, duration: 70, yoyo: true, repeat: 2 });
    }
    await this.delay(180);
  }

  async snapBridge() {
    const cordY = MINI_BRIDGE_CY;
    const cord = this.add.graphics().setDepth(13);
    cord.lineStyle(1, C_CYAN, 0.7);
    for (let x = MINI_ORIG_X1 + 3; x < MINI_COPY_X0 - 3; x += 5) cord.lineBetween(x, cordY, x + 2, cordY);
    this.bridgeCordLayer.add(cord);
    this.tweens.add({ targets: this.bridgeArrow, alpha: 1, scale: 1.3, duration: 80, yoyo: true });
    await this.delay(100);
    if (!this._alive) return;
    this.tweens.add({ targets: cord, alpha: 0, duration: 120, onComplete: () => cord.destroy() });
    this._copyGlowOutline.setStrokeStyle(1.5, C_BRASS, 0.3);
    await this.delay(80);
  }

  async showIndependenceShield(index) {
    const comp = this._origCompartments[index];
    if (!comp) return;
    const shield = this.add.rectangle(comp.x + comp.w / 2, (MINI_TRAY_Y0 + MINI_TRAY_Y1) / 2 - 3, comp.cardW ? comp.cardW + 4 : 24, 24, C_GREEN_BRIGHT, 0.3).setDepth(18);
    this.tweens.add({ targets: shield, alpha: 0, duration: 180, onComplete: () => shield.destroy() });
    await this.delay(140);
  }

  showAliasLabels(name1, name2) {
    this.origVarLabel.setText(name1);
    this.origVarLabel2.setText(name2).setAlpha(1);
  }

  modifyCompartment(trayKey, index, value, type) {
    const comp = trayKey === "copy" ? this._copyCompartments[index] : this._origCompartments[index];
    if (!comp || !comp.cardText) return;
    comp.value = value;
    const display = this._fmtVal(value);
    comp.cardText.setText(display).setColor(type === "default" ? "#78909c" : "#0a1208").setFontStyle(type === "default" ? "italic" : "bold");
    if (comp.cardText.width > (comp.cardW || 30) - 4) comp.cardText.setFontSize(5.5);
    if (comp.card) this.tweens.add({ targets: comp.card, scale: 1.15, duration: 60, yoyo: true });
  }

  async runTraySortAnimation(trayKey, before, after) {
    const comps = trayKey === "copy" ? this._copyCompartments : this._origCompartments;
    const working = before.slice();
    const n = working.length;
    let swaps = 0;
    for (let i = 0; i < n && swaps < 8; i++) {
      if (!this._alive) break;
      if (working[i] === after[i]) continue;
      let j = -1;
      for (let k = i + 1; k < n; k++) { if (working[k] === after[i]) { j = k; break; } }
      if (j === -1) continue;
      const compA = comps[i], compB = comps[j];
      if (compA && compA.card && compB && compB.card) {
        const cardA = compA.card, cardB = compB.card;
        const posA = { x: cardA.x, y: cardA.y }, posB = { x: cardB.x, y: cardB.y };
        await new Promise((res) => {
          this.tweens.add({ targets: cardA, y: posA.y - 6, duration: 45 });
          this.tweens.add({ targets: cardB, y: posB.y - 6, duration: 45, onComplete: res });
        });
        await new Promise((res) => {
          this.tweens.add({ targets: cardA, x: posB.x, duration: 100, ease: "Sine.easeInOut" });
          this.tweens.add({ targets: cardB, x: posA.x, duration: 100, ease: "Sine.easeInOut", onComplete: res });
        });
        await new Promise((res) => {
          this.tweens.add({ targets: cardA, y: posA.y, duration: 45 });
          this.tweens.add({ targets: cardB, y: posB.y, duration: 45, onComplete: res });
        });
        compA.card = cardB; compB.card = cardA;
        [compA.value, compB.value] = [compB.value, compA.value];
        [compA.cardText, compB.cardText] = [compB.cardText, compA.cardText];
        [compA.cardGfx, compB.cardGfx] = [compB.cardGfx, compA.cardGfx];
        [compA.cardColor, compB.cardColor] = [compB.cardColor, compA.cardColor];
        [compA.cardW, compB.cardW] = [compB.cardW, compA.cardW];
      }
      const tmp = working[i]; working[i] = working[j]; working[j] = tmp;
      swaps++;
    }
    await this.delay(70);
  }

  // ══════════════════════════════════════════════════════════════
  // MINI SLATE
  // ══════════════════════════════════════════════════════════════

  createMiniSlate() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0a0d18, 1);
    g.lineStyle(2, C_BRASS, 1);
    g.fillRoundedRect(SLATE_X, SLATE_Y, SLATE_W, SLATE_H, 8);
    g.strokeRoundedRect(SLATE_X, SLATE_Y, SLATE_W, SLATE_H, 8);
    this.add.text(SLATE_X + 10, SLATE_Y + 8, "MINI SLATE", { font: "bold 8px Georgia", color: HEX_BRASS }).setDepth(11);
    this.slateLines = this.add.container(0, 0).setDepth(11);
    this._slateY = SLATE_Y + 26;
    this.add.text(SLATE_X + 10, SLATE_Y + SLATE_H - 16, "returns:", { font: "9px Georgia", color: "#8a6435" }).setDepth(11);
    this.resultText = this.add.text(SLATE_X + 56, SLATE_Y + SLATE_H - 16, "—", { font: "bold 10px Courier New", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(11);
  }

  async chalkWriteLine(text, color) {
    const t = this.add.text(SLATE_X + 10, this._slateY, "", { font: "bold 9px Courier New", color: color || "#e8eaf6" }).setDepth(11);
    this.slateLines.add(t);
    for (let i = 0; i < text.length; i++) {
      if (!this._alive) return;
      t.setText(t.text + text[i]);
      if (t.width > SLATE_W - 18) t.setFontSize(7.5);
      await this.delay(6);
    }
    this._slateY += 15;
    if (this._slateY > SLATE_Y + SLATE_H - 30) this._slateY = SLATE_Y + 26;
  }

  chalkEvaluationArrow(value) {
    const t = this.add.text(SLATE_X + 10, this._slateY, `→ ${value}`, { font: "bold 9px Courier New", color: HEX_ORANGE }).setAlpha(0);
    this.slateLines.add(t);
    if (t.width > SLATE_W - 18) t.setFontSize(7.5);
    this.tweens.add({ targets: t, alpha: 1, duration: 100 });
    this._slateY += 15;
    if (this._slateY > SLATE_Y + SLATE_H - 30) this._slateY = SLATE_Y + 26;
  }

  wipeSlate() {
    this.slateLines.removeAll(true);
    this._slateY = SLATE_Y + 26;
  }

  updateResultRow(type) {
    if (type === null || type === undefined) { this.resultText.setText("—").setColor(HEX_GRAY); return; }
    if (type === "crash") { this.resultText.setText("✗ ERROR").setColor(HEX_RED); return; }
    if (type === "void") { this.resultText.setText("void").setColor(HEX_GRAY); return; }
    this.resultText.setText(type).setColor(type === "String" ? HEX_CYAN : HEX_GOLD);
  }

  // ══════════════════════════════════════════════════════════════
  // CONTAINER SHELF — reference indicators (dashed cyan = alias,
  // solid brass = independent) — the level's premium teaching visual
  // ══════════════════════════════════════════════════════════════

  createContainerShelf() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0f0a06, 1);
    g.lineStyle(1, 0x3a2618, 1);
    g.fillRoundedRect(SHELF_X, SHELF_Y, SHELF_W, SHELF_H, 8);
    g.strokeRoundedRect(SHELF_X, SHELF_Y, SHELF_W, SHELF_H, 8);
    this.add.text(SHELF_X + 10, SHELF_Y + 6, "REFERENCES", { font: "bold 8px Georgia", color: HEX_BRASS }).setDepth(11);
    this.shelfContainer = this.add.container(0, 0).setDepth(11);
  }

  clearContainerShelf() {
    this.shelfContainer.removeAll(true);
  }

  updateContainerShelfWithReferences(vars) {
    this.shelfContainer.removeAll(true);
    const seen = [];
    let idx = 0;
    for (const name in vars) {
      const v = vars[name];
      if (v.kind !== "array") continue;
      const sharedWith = seen.find((s) => s.values === v.values);
      const isAlias = !!sharedWith;
      const y = SHELF_Y + 22 + idx * 15;
      const text = `${name} = ${this._fmtArrDisplay(v.values)}`.slice(0, 34);
      const dg = this.add.graphics();
      if (isAlias) {
        dg.lineStyle(1, C_CYAN, 0.6);
        for (let x = SHELF_X + 8; x < SHELF_X + SHELF_W - 8; x += 5) dg.lineBetween(x, y + 7, x + 2, y + 7);
      } else {
        dg.lineStyle(1, C_BRASS, 0.5);
        dg.strokeRoundedRect(SHELF_X + 8, y - 6, SHELF_W - 16, 13, 2);
      }
      this.shelfContainer.add(dg);
      const t = this.add.text(SHELF_X + 12, y, text, { font: `${isAlias ? "italic " : ""}bold 8px Courier New`, color: isAlias ? HEX_CYAN : HEX_GOLD }).setOrigin(0, 0.5);
      this.shelfContainer.add(t);
      const suffix = isAlias ? ` (= ${sharedWith.name})` : "";
      if (suffix) {
        const st = this.add.text(SHELF_X + SHELF_W - 10, y, suffix, { font: "italic 7px Courier New", color: HEX_GRAY }).setOrigin(1, 0.5);
        this.shelfContainer.add(st);
      }
      if (!sharedWith) seen.push({ values: v.values, name });
      idx++;
    }
  }

  _fmtArrDisplay(values) {
    return "[" + values.map((v) => this._fmtVal(v)).join(",") + "]";
  }

  // ══════════════════════════════════════════════════════════════
  // HUD
  // ══════════════════════════════════════════════════════════════

  createHUD() {
    const g = this.add.graphics().setDepth(49);
    g.fillStyle(0x081008, 0.93);
    g.fillRect(0, 0, W, 64);
    g.lineStyle(1, 0x3a2618, 1);
    g.lineBetween(0, 64, W, 64);

    this.add.text(20, 14, "THE REPLICATION TRIALS", { font: "bold 14px Georgia", color: "#b0bec5" }).setDepth(50);
    this.add.text(20, 32, "Tuning Phase — Arrays Methods: copyOf()", { font: "10px Arial", color: "#546e7a" }).setDepth(50);

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
  // BIT — TRIALS ADJUDICATOR VARIANT (medallion, certification pen)
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
    const ribbon = this.add.graphics();
    ribbon.lineStyle(2, C_PATINA, 0.8);
    ribbon.lineBetween(-6, -14, 0, 2);
    ribbon.lineBetween(6, -14, 0, 2);
    const medallion = this.add.circle(0, 4, 4, C_BRASS, 0.9).setStrokeStyle(1, 0x8a6435, 1);
    const gloveL = this.add.circle(-16, 10, 4, 0xffffff, 0).setStrokeStyle(1, 0xe8eaf6, 0.7);
    this.pen = this.add.container(17, 4);
    const penG = this.add.graphics();
    penG.lineStyle(1.5, C_BRASS, 0.9);
    penG.lineBetween(0, 8, 6, -8);
    penG.fillStyle(0x1a0e05, 1);
    penG.fillTriangle(5, -10, 7, -6, 4, -6);
    this.pen.add(penG);
    c.add([g, frock, ribbon, medallion, eye, pupil, gloveL, this.pen, tip]);
    this.tweens.add({ targets: tip, alpha: 0.3, duration: 850, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: c, y: "+=3", duration: 1650, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
    this.bit = c;
  }

  async raisePen() {
    await new Promise((res) => { this.tweens.add({ targets: this.pen, angle: -25, y: -4, duration: 150, ease: "Sine.easeOut", onComplete: res }); });
    this.tweens.add({ targets: this.pen, angle: 0, y: 4, duration: 150, ease: "Sine.easeIn" });
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
    await this.raisePen();
    await this.bitSay("The Replication Trials, Specialist — where duplication technique is timed against the sand. Every order gets one column's drain; certify before the last grain. The bench's discipline is your reflex tonight.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(5000)]); if (!A()) return;
    this.hideBubble();

    this.showTrialOnOrder(["int[] a = {1, 2, 3};", "Arrays.copyOf(a, 3)"], "What is the copy?");
    this._currentConfig = { revealNote: null };
    this.startSandDrain(9000);
    await this.populateOriginalTray([1, 2, 3], "int[]", "a");
    await this.materializeCopyTray(3, "int[]", "b");
    await this.runDuplicationBeam();
    await this.flyGhostCopies([1, 2, 3], 3, "int[]");
    await this.snapBridge();
    const vars = { a: { kind: "array", values: [1, 2, 3], type: "int[]" }, b: { kind: "array", values: [1, 2, 3], type: "int[]" } };
    this.updateContainerShelfWithReferences(vars);
    if (!A()) return;
    const a1 = this.createAnnotation(CARD_CX, CARD_Y1 + 14, "the work", HEX_BLUE_GRAY);
    const a2 = this.createAnnotation(FUNNEL_CX, RECV_Y1 + 16, "your time, draining", HEX_BLUE_GRAY);
    const a3 = this.createAnnotation((MINI_ORIG_X0 + MINI_COPY_X1) / 2, MINI_TRAY_Y0 - 30, "the replication, honest as ever", HEX_BLUE_GRAY);
    const a4 = this.createAnnotation(SHELF_X + SHELF_W / 2, SHELF_Y - 10, "reference indicators — dashed for alias, solid for copy", HEX_BLUE_GRAY);
    await this.bitSay("Seal the neck with a verdict — early seals score. The sand starts NOW!");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();
    [a1, a2, a3, a4].forEach((a) => a.destroy());
    this._killSandTween();
    this.clearCardContent();
    this.wipeSlate();
    this.clearReplicationFrame();
    this.clearContainerShelf();
    this._sandProgress = 0;
    this.updateSandDrain();

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
      1: "WAVE 1 — RAPID DUPLICATIONS",
      2: "WAVE 2 — THE REFERENCE TRIALS",
      3: "WAVE 3 — DEEP TRACES & BUG HUNT",
    };
    await this.showWaveBanner(banners[waveNumber]);
    if (!this._alive) return;
    if (waveNumber === 2) {
      await this.showBitFeedback("The wing's hardest lesson at speed now, Specialist. Equals is not copy — never was. Every trial this wave probes whether one name or two names sits on the tray. Read the reference indicators; trust the shield.");
    } else if (waveNumber === 3) {
      await this.showBitFeedback("Final orders — traces that thread the mutation forward, and two flawed duplications the leaderboard mustn't see. The sand won't wait, and neither will the audit.");
    }
    if (!this._alive) return;

    const startIndex = waveNumber === 1 ? 0 : waveNumber === 2 ? 5 : 10;
    this.startRound(startIndex);
  }

  async showWaveBanner(text) {
    const c = this.add.container(640, -60).setDepth(85);
    const g = this.add.graphics();
    g.fillStyle(0x081008, 0.95);
    g.fillRoundedRect(-230, -24, 460, 48, 8);
    g.lineStyle(2, C_GOLD, 1);
    g.strokeRoundedRect(-230, -24, 460, 48, 8);
    const t = this.add.text(0, 0, text, { font: "bold 15px Georgia", color: HEX_GOLD }).setOrigin(0.5);
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
    this.clearReplicationFrame();
    this.clearContainerShelf();
    this.updateResultRow(null);
    this.roundStartTime = this.time.now;

    const limit = config.type === "bughunt" ? 12000 : WAVE_TIME[config.wave];
    if (config.type === "predict" || config.type === "trace") this.setupPredict(config);
    else if (config.type === "bughunt") this.setupBugHunt(config);

    this.startSandDrain(limit);
  }

  clearRound() {
    this.roundElements.forEach((e) => { if (e && e.destroy) e.destroy(); });
    this.roundElements = [];
    this._bugHuntTokenObjs = [];
    if (this._bugHeaderTween) { this._bugHeaderTween.stop(); this._bugHeaderTween = null; }
  }

  async onSandTimeout(config) {
    if (this.gameEnded) return;
    this._sandHalted = true;
    this._stopCriticalGlow();
    this.inputLocked = true;
    this.roundElements.forEach((e) => e.disableInteractive && e.disableInteractive());
    (this._bugHuntTokenObjs || []).forEach((t) => t.disableInteractive());
    this.logAttempt(config, false, null, "timeout", this.roundTimeLimit, 1);
    await this.lastGrainCascade();
    if (!this._alive) return;
    await this.stampOrder("void");
    if (!this._alive) return;
    if (config.type === "bughunt") await this.runDualFutureReveal(config);
    else await this.runReveal(config);
    if (!this._alive) return;
    if (config.revealNote) this.createFloatingText(CARD_CX, CARD_Y1 + 40, config.revealNote, HEX_GRAY, "10px Arial", 2800);
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
    const lines = this._sourceLines(config);
    this.showTrialOnOrder(lines, config.question);
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
      const txt = this.add.text(0, 0, label, { font: "bold 11px Courier New", color: "#e8eaf6", wordWrap: { width: w - 16 }, align: "center" }).setOrigin(0.5);
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
    await this.sealNeck();
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
    await this.stampOrder(correct ? "certified" : "misduplicated");
    if (!this._alive) return;
    if (config.revealNote) this.createFloatingText(CARD_CX, CARD_Y1 + 40, config.revealNote, HEX_GRAY, "10px Arial", 2800);
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
  // TYPE D — BUG HUNT
  // ══════════════════════════════════════════════════════════════

  setupBugHunt(config) {
    this.clearCardContent();
    this.cardHeaderText.setText(`DUPLICATION ORDER — WORK NO. ${this.currentRound + 1}`);
    const header = this.add.text(CARD_CX, CARD_Y0 + 36, "CLICK THE BUG", { font: "bold 12px Georgia", color: "#c62828" }).setOrigin(0.5);
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
      const isPhrase = isFaultLine && config.faultToken.includes(" ");

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
    await this.sealNeck();
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
      const fixT = this.add.text(CARD_CX, lineY - 14, config.fix, { font: "bold 10px Courier New", color: "#2e7d32", wordWrap: { width: 380 } }).setOrigin(0.5).setAlpha(0);
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
    await this.stampOrder(correct ? "certified" : "misduplicated");
    if (!this._alive) return;
    if (config.revealNote) this.createFloatingText(CARD_CX, CARD_Y1 + 40, config.revealNote, HEX_GRAY, "10px Arial", 2800);
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
   * then reset and run the fixed version. Two repair strategies:
   * "alias_declaration" (round 14) replaces the declaration's RHS
   * entirely, keeping the "TYPE[] name =" prefix; the default
   * (round 15, "off_by_one_length") replaces just the faulty
   * substring in place. */
  async runDualFutureReveal(config) {
    const honestLines = config.lines.filter((l) => !l.trim().startsWith("//"));
    await this.runReveal(honestLines);
    await this.delay(400);
    if (!this._alive) return;
    this.wipeSlate();
    this.clearReplicationFrame();
    this.clearContainerShelf();
    this.updateResultRow(null);

    let fixedLines;
    if (config.tokenRegion === "alias_declaration") {
      fixedLines = config.lines
        .map((l, i) => {
          if (i + 1 !== config.faultLine) return l;
          const eqIdx = l.indexOf("=");
          const prefix = l.slice(0, eqIdx + 1);
          return `${prefix} ${config.fix};`;
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
  // HONEST EVALUATOR — reuses/extends L68's copyOf/alias/sort
  // evaluator (genuine independent-array creation, genuine reference-
  // sharing for aliases, genuine in-place sort), extended with a live
  // container-shelf reference-identity readout after every array-
  // affecting statement.
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

  async _resolveLenExpr(expr, vars) {
    const t = expr.trim();
    if (/^\d+$/.test(t)) return { ok: true, value: parseInt(t, 10) };
    let m = t.match(/^(\w+)\.length\s*\+\s*(\d+)$/);
    if (m) {
      const arr = vars[m[1]];
      if (!arr || arr.kind !== "array") return { ok: false, crash: "eval" };
      return { ok: true, value: arr.values.length + parseInt(m[2], 10) };
    }
    m = t.match(/^(\w+)\.length\s*-\s*(\d+)$/);
    if (m) {
      const arr = vars[m[1]];
      if (!arr || arr.kind !== "array") return { ok: false, crash: "eval" };
      return { ok: true, value: arr.values.length - parseInt(m[2], 10) };
    }
    m = t.match(/^(\w+)\.length$/);
    if (m) {
      const arr = vars[m[1]];
      if (!arr || arr.kind !== "array") return { ok: false, crash: "eval" };
      return { ok: true, value: arr.values.length };
    }
    return { ok: false, crash: "eval" };
  }

  async resolveExpr(expr, vars) {
    const t = expr.trim();

    const atsMatch = t.match(/^Arrays\.toString\((\w+)\)$/);
    if (atsMatch) {
      const arr = vars[atsMatch[1]];
      if (!arr || arr.kind !== "array") return { ok: false, crash: "eval" };
      const display = "[" + arr.values.map((v) => this._fmtVal(v)).join(", ") + "]";
      await this.chalkWriteLine(`Arrays.toString(${atsMatch[1]})`, "#8ea6c8");
      this.chalkEvaluationArrow(display);
      this.updateResultRow("String");
      return { ok: true, value: display, type: "String" };
    }

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

    const bracketMatch = t.match(/^(\w+)\[(\d+)\]$/);
    if (bracketMatch) {
      const arr = vars[bracketMatch[1]];
      if (!arr || arr.kind !== "array") return { ok: false, crash: "eval" };
      const idx = parseInt(bracketMatch[2], 10);
      if (idx < 0 || idx >= arr.values.length) { await this.crashIOOBE(idx, arr.trayKey); return { ok: false, crash: "ioobe" }; }
      const value = arr.values[idx];
      const elemType = arr.type === "String[]" ? "String" : arr.type.replace("[]", "");
      await this.chalkWriteLine(`${bracketMatch[1]}[${idx}]`, "#8ea6c8");
      this.chalkEvaluationArrow(this._fmtVal(value));
      this.updateResultRow(elemType);
      return { ok: true, value, type: elemType };
    }

    const lengthMatch = t.match(/^(\w+)\.length$/);
    if (lengthMatch) {
      const arr = vars[lengthMatch[1]];
      if (!arr || arr.kind !== "array") return { ok: false, crash: "eval" };
      await this.chalkWriteLine(`${lengthMatch[1]}.length`, "#8ea6c8");
      this.chalkEvaluationArrow(arr.values.length);
      this.updateResultRow("int");
      return { ok: true, value: arr.values.length, type: "int" };
    }

    if (/^".*"$/.test(t)) return { ok: true, value: t.slice(1, -1), type: "String" };
    if (/^-?\d+\.\d+$/.test(t)) return { ok: true, value: parseFloat(t), type: "double" };
    if (/^-?\d+$/.test(t)) return { ok: true, value: parseInt(t, 10), type: "int" };

    if (vars[t] !== undefined) {
      const v = vars[t];
      if (v.kind === "array") {
        const display = "[" + v.values.map((x) => this._fmtVal(x)).join(", ") + "]";
        return { ok: true, value: display, type: "String" };
      }
      return { ok: true, value: v.value, type: v.type };
    }

    return { ok: false, crash: "eval" };
  }

  async evalPrintArg(argExpr, vars) {
    const r = await this.resolveExpr(argExpr.trim(), vars);
    if (!r.ok) return { ok: false, crash: r.crash || "eval" };
    return { ok: true, value: String(r.value) };
  }

  showCompileErrorStamp() {
    const stamp = this.add.text(CARD_CX, CARD_Y0 - 22, "COMPILE ERROR", { font: "bold 16px Arial", color: HEX_RED }).setOrigin(0.5).setDepth(30).setScale(1.3).setAngle(-6).setAlpha(0);
    this.roundElements.push(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 150 });
    this.screenShake(0.004, 120);
    this.time.delayedCall(850, () => { if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 180, onComplete: () => stamp.destroy() }); });
  }

  async crashIOOBE(idx, trayKey) {
    const cx = trayKey === "copy" ? (MINI_COPY_X0 + MINI_COPY_X1) / 2 : (MINI_ORIG_X0 + MINI_ORIG_X1) / 2;
    const stamp = this.add.text(cx, MINI_TRAY_Y0 - 12, "IOOBE", { font: "bold 8px Courier New", color: HEX_RED }).setOrigin(0.5).setAngle(-3).setAlpha(0);
    this.roundElements.push(stamp);
    this.tweens.add({ targets: stamp, alpha: 1, duration: 90 });
    this.screenShake(0.005, 130);
    await this.delay(300);
    if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 150, onComplete: () => stamp.destroy() });
  }

  async execStatement(line, vars) {
    if (/=\s*Arrays\.sort\(/.test(line)) {
      this.showCompileErrorStamp();
      await this.delay(400);
      return { ok: false, crash: "compile" };
    }

    const arrLiteral = line.match(/^(int|String|double)\[\]\s+(\w+)\s*=\s*\{(.*)\}\s*;$/);
    if (arrLiteral) {
      const baseType = arrLiteral[1], name = arrLiteral[2];
      const type = `${baseType}[]`;
      const values = this._parseArrayInit(`{${arrLiteral[3]}}`, type);
      vars[name] = { kind: "array", values, type, trayKey: "orig" };
      await this.populateOriginalTray(values, type, name);
      this.updateContainerShelfWithReferences(vars);
      return { ok: true };
    }

    const aliasDecl = line.match(/^(int|String|double)\[\]\s+(\w+)\s*=\s*(\w+)\s*;$/);
    if (aliasDecl) {
      const name = aliasDecl[2], src = aliasDecl[3];
      if (vars[src] && vars[src].kind === "array") {
        vars[name] = vars[src];
        this.showAliasLabels(src, name);
        this.updateContainerShelfWithReferences(vars);
        return { ok: true };
      }
    }

    const copyDecl = line.match(/^(int|String|double)\[\]\s+(\w+)\s*=\s*Arrays\.copyOf\((\w+),\s*(.+)\)\s*;$/);
    if (copyDecl) {
      const name = copyDecl[2], srcName = copyDecl[3], lenExprRaw = copyDecl[4].trim();
      const src = vars[srcName];
      if (!src || src.kind !== "array") return { ok: false, crash: "eval" };
      const lenRes = await this._resolveLenExpr(lenExprRaw, vars);
      if (!lenRes.ok) return lenRes;
      const newLen = lenRes.value;
      const defaultVal = src.type === "String[]" ? null : src.type === "double[]" ? 0.0 : 0;
      const newValues = [];
      for (let i = 0; i < newLen; i++) newValues.push(i < src.values.length ? src.values[i] : defaultVal);
      vars[name] = { kind: "array", values: newValues, type: src.type, trayKey: "copy" };

      await this.materializeCopyTray(newLen, src.type, name);
      await this.runDuplicationBeam();
      await this.flyGhostCopies(src.values, newLen, src.type);
      if (newLen > src.values.length) await this.showPadding(src.values.length, newLen, src.type);
      if (newLen < src.values.length) {
        const skipped = [];
        for (let i = newLen; i < src.values.length; i++) skipped.push(i);
        await this.showTruncation(skipped);
      }
      await this.snapBridge();
      this.updateContainerShelfWithReferences(vars);
      return { ok: true };
    }

    const arrDeclAny = line.match(/^(int|String|double)\[\]\s+(\w+)\s*=\s*(.*);$/);
    if (arrDeclAny) {
      this.showCompileErrorStamp();
      await this.delay(400);
      return { ok: false, crash: "compile" };
    }

    const bracketAssign = line.match(/^(\w+)\[(\d+)\]\s*=\s*(.+);$/);
    if (bracketAssign) {
      const name = bracketAssign[1], idx = parseInt(bracketAssign[2], 10), rhsVal = bracketAssign[3].trim();
      const arr = vars[name];
      if (!arr || arr.kind !== "array") return { ok: true };
      if (idx < 0 || idx >= arr.values.length) { await this.crashIOOBE(idx, arr.trayKey); return { ok: false, crash: "ioobe" }; }
      const newVal = /^-?\d+(\.\d+)?$/.test(rhsVal) ? parseFloat(rhsVal) : rhsVal.replace(/^"(.*)"$/, "$1");
      arr.values[idx] = newVal;
      this.modifyCompartment(arr.trayKey, idx, newVal, "value");
      if (arr.trayKey === "copy") await this.showIndependenceShield(idx);
      this.updateContainerShelfWithReferences(vars);
      return { ok: true };
    }

    const sortMatch = line.match(/^Arrays\.sort\((\w+)\)\s*;$/);
    if (sortMatch) {
      const arr = vars[sortMatch[1]];
      if (arr && arr.kind === "array") {
        const before = arr.values.slice();
        if (arr.type === "String[]") arr.values.sort();
        else arr.values.sort((a, b) => a - b);
        const after = arr.values.slice();
        await this.runTraySortAnimation(arr.trayKey, before, after);
        await this.chalkWriteLine(`Arrays.sort(${sortMatch[1]})`, "#8ea6c8");
        this.chalkEvaluationArrow("void");
        this.updateResultRow("void");
        this.updateContainerShelfWithReferences(vars);
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

  async runReveal(input) {
    const raw = Array.isArray(input) ? input : input.source !== undefined ? input.source : input;
    const lines = (Array.isArray(raw) ? raw : String(raw).split("\n")).map((l) => l.trim()).filter((l) => l && !l.startsWith("//"));
    this._printedLines = [];
    const vars = {};
    return await this.runStatements(lines, vars);
  }

  getTimePctUsed() {
    const elapsed = this.time.now - this.roundStartTime;
    return Phaser.Math.Clamp(elapsed / this.roundTimeLimit, 0, 1);
  }

  // ══════════════════════════════════════════════════════════════
  // SCORING, LIVES, COMBO
  // ══════════════════════════════════════════════════════════════

  getComboMultiplier() { if (this.combo >= 5) return 3; if (this.combo >= 3) return 2; return 1; }

  scoreForAttempt(timePctUsed) {
    let points = 100 * this.getComboMultiplier();
    const remaining = 1 - timePctUsed;
    if (remaining > 0.6) { points += 50; this.fastBonusCount++; this.createFloatingText(CARD_CX, CARD_Y0 - 14, "⚡ EARLY SEAL +50", HEX_GOLD, "bold 13px Arial", 900); }
    else if (remaining > 0.3) { points += 25; this.fastBonusCount++; this.createFloatingText(CARD_CX, CARD_Y0 - 14, "⚡ +25", HEX_GOLD, "bold 12px Arial", 800); }
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

  advanceRound() {
    this.clearRound();
    const next = this.currentRound + 1;
    if (next >= ROUNDS.length) { this.levelComplete(); return; }
    const nextConfig = ROUNDS[next];
    if (nextConfig.wave !== this.currentWave) {
      this._refillSandColumn().then(() => { if (this._alive && !this.gameEnded) this.startWave(nextConfig.wave); });
      return;
    }
    this.time.delayedCall(700, () => { if (this._alive && !this.gameEnded) this.startRound(next); });
  }

  async _refillSandColumn() {
    const state = { v: this._sandProgress || 0 };
    await new Promise((res) => {
      this.tweens.add({ targets: state, v: 0, duration: 450, ease: "Sine.easeInOut", onUpdate: () => { this._sandProgress = state.v; }, onComplete: res });
    });
    this.neckPlunger.setAlpha(0);
  }

  // ══════════════════════════════════════════════════════════════
  // END STATES
  // ══════════════════════════════════════════════════════════════

  gameOver() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this._killSandTween();
    this.clearRound();
    this.hideBubble();

    (async () => {
      this.wipeSlate();
      this.clearReplicationFrame();
      this.clearContainerShelf();
      this._sandProgress = 1;
      this.updateSandDrain();
      this._stopCriticalGlow();
      if (this._tuningForkG) this._tuningForkG.setAlpha(0.15);
      const motes = this.ambient;
      this.ambient = null;
      (motes || []).forEach((m) => this.tweens.add({ targets: m, y: 632, alpha: 0, duration: 1500, ease: "Sine.easeIn" }));

      const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
      this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });
      const title = this.add.text(640, 240, "CERTIFICATION LAPSED", { font: "bold 32px Georgia", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
      this.tweens.add({ targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut", onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }) });
      this.add.text(640, 310, `Score: ${this.score}`, { font: "20px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
      this.add.text(640, 350, `Certifications: ${this.currentRound} / 15`, { font: "16px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);
      this._makeButton(640, 420, "REFILL THE COLUMN", 240, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
    })();
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this._killSandTween();
    this.clearRound();
    this.hideBubble();

    try { GameManager.completeLevel(68, Math.round((this.correctFirstTry / 15) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("arrays_copyOf_tuned"); } catch (_) {}
    try {
      localStorage.setItem("level69_results", JSON.stringify({
        level: 69, concept: "arrays_copyOf", phase: "tuning",
        score: this.score, accuracy: this.correctFirstTry / 15, avgTimePct: this.totalTimePctUsed / 15,
        fastBonuses: this.fastBonusCount, comboMax: this.maxCombo, stars: this._starRating(),
        livesRemaining: this.lives, attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.trialsFinale().then(() => { if (this._alive) this.showScoreTally(); });
  }

  async trialsFinale() {
    await this._refillSandColumn();
    await this.stampOrder("certified");
    this.createConfetti(CARD_CX, (CARD_Y0 + CARD_Y1) / 2, 30);

    this._leaderboardRows.forEach((row, i) => {
      if (i === 0) {
        row.rank.setAlpha(1).setColor(HEX_GOLD);
        row.name.setText("YOU").setAlpha(1).setColor(HEX_GOLD);
        row.timeT.setText(`${(this.totalTimeMs / 15 / 1000).toFixed(1)}s`).setAlpha(1).setColor(HEX_GOLD);
      }
    });
    if (this._tuningForkG) this.tweens.add({ targets: this._tuningForkG, alpha: 1, duration: 200, yoyo: true, repeat: 3 });

    this.wipeSlate();
    this.clearReplicationFrame();
    this.clearContainerShelf();
    await this.populateOriginalTray([4, 1, 3], "int[]", "a");
    await this.materializeCopyTray(3, "int[]", "b");
    await this.runDuplicationBeam();
    await this.flyGhostCopies([4, 1, 3], 3, "int[]");
    await this.snapBridge();
    this.createConfetti((MINI_ORIG_X0 + MINI_COPY_X1) / 2, MINI_TRAY_Y0, 24);
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
    panel.fillStyle(0x0a1208, 1);
    panel.fillRoundedRect(360, 145, 560, 430, 16);
    panel.lineStyle(2, C_BRASS, 1);
    panel.strokeRoundedRect(360, 145, 560, 430, 16);

    const title = this.add.text(640, 185, "TRIALS CERTIFIED", { font: "bold 32px Georgia", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(91).setScale(0);
    this.tweens.add({ targets: title, scale: 1, duration: 350, ease: "Back.easeOut" });

    const acc = Math.round((this.correctFirstTry / 15) * 100);
    const avgSec = (this.totalTimeMs / 15 / 1000).toFixed(1);
    const lines = [
      `ACCURACY: ${acc}%`,
      `AVG RESPONSE: ${avgSec}s`,
      `EARLY-SEAL BONUSES: ${this.fastBonusCount}`,
      `BEST COMBO: ×${this.getComboMultiplierFor(this.maxCombo)}`,
    ];
    lines.forEach((s, i) => {
      const t = this.add.text(500, 240 + i * 26, s, { font: "14px Arial", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
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
    bg.lineStyle(1.2, C_BRASS, 0.9);
    bg.strokeRoundedRect(-16, -6, 12, 12, 2);
    bg.strokeRoundedRect(4, -6, 12, 12, 2);
    bg.lineStyle(1, C_CYAN, 0.9);
    bg.lineBetween(-4, 0, 4, 0);
    badge.add(bg);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 2100 });
    const badgeLbl = this.add.text(640, 520, "copyOf() SCHEMA TUNED", { font: "bold 13px Georgia", color: HEX_GOLD }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: badgeLbl, alpha: 1, duration: 300, delay: 2250 });

    this._makeButton(500, 555, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(770, 555, "NEXT: The Curator's Bureau →", 290, 44, { fill: 0x00733a, stroke: C_GREEN_BRIGHT, textColor: "#ffffff" }, () => {
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
    const t = this.add.text(0, 0, label, { font: "bold 14px Arial", color: style.textColor }).setOrigin(0.5);
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
