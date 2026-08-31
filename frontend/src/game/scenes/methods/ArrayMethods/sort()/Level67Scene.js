/**
 * Level 67 — "The Arrangement Workshop" (Arrays Methods: Restructuring
 * Phase — sort() trilogy finale)
 * ===========================================================================
 * The learner CONSTRUCTS complete sort-and-report programs — no multiple
 * choice. Reuses the L27→L63 code-canvas/parts-bin/RUN architecture. The
 * rig hosts the mini Arrangement Engine (sort, from L65/L66), the mini
 * Display Plaque (toString, from L64), the mini Before/After Strip (the
 * mutation receipt, from L65), mini typed containers, a mini output
 * ticker, and a mini Scanner intake tape (Mission 5 cameo).
 *
 * A genuine unified mini-interpreter executes the assembled program: sort
 * (real in-place mutation, void return), toString (real scan + the cursed
 * hash for bare/instance calls), bracket access (arithmetic index
 * expressions — length-1, length/2 — real IndexOutOfBounds on overreach),
 * pre-sort String snapshots, Scanner.nextInt() intake, and println
 * concatenation/arithmetic. Wrong builds yield REAL outcomes — never
 * scripted: M1's hash-plaque for a bare/instance toString; M2's IOOBE for
 * data[data.length]; M3's wrong-position value for a hardcoded index; M4's
 * hash-as-original / compile error / reused-snapshot; M5's Scanner type
 * error; M6's negative range for a reversed subtraction.
 */

import Phaser from "phaser";
import { GameManager } from "../../../../GameManager.js";
import { WellbeingAPI } from "../../../../../api/api.js";
import { BadgeSystem } from "../../../../BadgeSystem.js";

const W = 1280, H = 720;

const C_CYAN = 0x4fc3f7, C_GOLD = 0xffd740, C_ORANGE = 0xff9800, C_BLUE_GRAY = 0x8ea6c8;
const C_GREEN_BRIGHT = 0x00e676, C_RED = 0xf44336, C_GRAY = 0x78909c, C_BRASS = 0xc8a05a;
const HEX_CYAN = "#4fc3f7", HEX_GOLD = "#ffd740", HEX_ORANGE = "#ff9800", HEX_BLUE_GRAY = "#8ea6c8";
const HEX_GREEN_BRIGHT = "#00e676", HEX_RED = "#f44336", HEX_GRAY = "#78909c", HEX_BRASS = "#c8a05a";
const C_PATINA = 0x2e7d32, HEX_PATINA = "#2e7d32";

const CX = 40, CY = 90, CW = 680, CH = 380;
const TAB_H = 34, GUTTER_W = 34, CODE_PAD = 10;
const CODE_X = CX + GUTTER_W + CODE_PAD;
const CODE_Y0 = CY + TAB_H + 14;
const LINE_H = 20;
const PX = 40, PY = 490, PW = 680, PH = 130;
const OX = 760, OY = 80, OW = 460, OH = 250;
const MANIFEST_Y = 316;
const RX = 760, RY = 345, RW = 460, RH = 125;
const BX = 760, BY = 490, BW = 460, BH = 130;
const TUTORIAL_KEY = "level67_tutorial_done";

// Rig internal layout — mini tray+engine (left), mini plaque + before/after
// strip (beneath it), mini typed containers (right), output ticker + tape.
const MINI_X0 = OX + 18, MINI_X1 = OX + 216, MINI_CX = (MINI_X0 + MINI_X1) / 2;
const MINI_GANTRY_Y = OY + 42, MINI_GANTRY_H = 5;
const MINI_TRAY_Y0 = OY + 58, MINI_TRAY_Y1 = OY + 98;
const MINI_ENTRY_Y = MINI_TRAY_Y0 + 4;
const MINI_PLAQUE_X = MINI_X0, MINI_PLAQUE_Y = OY + 128, MINI_PLAQUE_W = MINI_X1 - MINI_X0, MINI_PLAQUE_H = 22;
const MINI_STRIP_Y = MINI_PLAQUE_Y + MINI_PLAQUE_H + 8;
const CONT_X = OX + 236, CONT_Y0 = OY + 40;
const TAPE_Y = OY + 14;
const TICKER_Y = OY + 205;

// ══════════════════════════════════════════════════════════════
// MISSION CONFIGURATION
// ══════════════════════════════════════════════════════════════
const MISSIONS = [
  // ── Mission 1: The Display Order ──
  { mission: 1, title: "The Display Order",
    brief: "Sort the specimen readings and display them. For {70, 30, 50, 10}:\nDisplay: [10, 30, 50, 70]",
    skeleton: [
      "int[] readings = /* populated by test */;",
      "",
      "<slot:sort>",
      'System.out.println("Display: " + <slot:display>);',
    ],
    slots: [
      { id: "sort", hint: "sort the tray" },
      { id: "display", hint: "display it (readable!)" },
    ],
    palette: [
      { code: "Arrays.sort(readings);", correct: true, slotId: "sort" },
      { code: "readings.sort();", tag: "arrays_instance_call_belief", slotId: "sort" },
      { code: "Arrays.toString(readings)", correct: true, slotId: "display" },
      { code: "readings", tag: "array_prints_contents_belief", slotId: "display" },
      { code: "readings.toString()", tag: "arrays_instance_call_belief", slotId: "display" },
    ],
    tests: [
      { arrayName: "readings", initialArray: [70, 30, 50, 10], expectedOutput: "Display: [10, 30, 50, 70]" },
      { arrayName: "readings", initialArray: [5, 5, 5], expectedOutput: "Display: [5, 5, 5]" },
      { arrayName: "readings", initialArray: [1], expectedOutput: "Display: [1]" },
    ],
    postMissionNote: "Bit: 'Sort then toString — the workshop's two-step: engine arranges, plaque labels. Two static calls, one publication. The workflow begins here.'",
    concept: "sort_then_display" },

  // ── Mission 2: The Extremes Report ──
  { mission: 2, title: "The Extremes Report",
    brief: "Sort the readings, then publish the smallest and largest. For {60, 20, 80, 40}:\nMin: 20\nMax: 80",
    skeleton: [
      "int[] data = /* populated by test */;",
      "",
      "Arrays.sort(data);",
      'System.out.println("Min: " + <slot:min>);',
      'System.out.println("Max: " + <slot:max>);',
    ],
    slots: [
      { id: "min", hint: "the smallest (after sort)" },
      { id: "max", hint: "the largest (after sort)" },
    ],
    palette: [
      { code: "data[0]", correct: true, slotId: "min" },
      { code: "data[1]", tag: "array_bracket_off_by_one", slotId: "min" },
      { code: "data[data.length - 1]", correct: true, slotId: "max" },
      { code: "data[data.length]", tag: "length_not_minus_one_belief", slotId: "max" },
      { code: "data[3]", tag: "hardcoded_last_index", slotId: "max" },
      { code: "data[-1]", tag: "negative_index_belief", slotId: "max" },
    ],
    tests: [
      { arrayName: "data", initialArray: [60, 20, 80, 40], expectedOutput: "Min: 20⏎Max: 80" },
      { arrayName: "data", initialArray: [7, 3, 9, 1, 5], expectedOutput: "Min: 1⏎Max: 9" },
      { arrayName: "data", initialArray: [42], expectedOutput: "Min: 42⏎Max: 42" },
    ],
    postMissionNote: "Bit: 'Sort once, read the edges — [0] for the smallest, [length − 1] for the largest. The engine did the comparing; your brackets just pick the winners. And the hardcoded [3] broke on the five-element night — length minus one works for ANY tray size.'",
    concept: "extremes_pattern" },

  // ── Mission 3: The Median Finder ──
  { mission: 3, title: "The Median Finder",
    brief: "Sort the readings and publish the MEDIAN (the middle value). All test trays have an ODD number of elements. For {50, 10, 30, 20, 40}:\nMedian: 30",
    skeleton: [
      "int[] data = /* populated by test */;",
      "",
      "Arrays.sort(data);",
      "int median = <slot:middle>;",
      'System.out.println("Median: " + median);',
    ],
    slots: [
      { id: "middle", hint: "the middle element (size-proof!)" },
    ],
    palette: [
      { code: "data[data.length / 2]", correct: true, slotId: "middle" },
      { code: "data[data.length - 1]", tag: "median_is_max_belief", slotId: "middle" },
      { code: "data[2]", tag: "hardcoded_middle_index", slotId: "middle" },
      { code: "data[data.length / 2 - 1]", tag: "median_off_by_one", slotId: "middle" },
      { code: "data[(data.length - 1) / 2]", correct: true, alsoCorrect: true, slotId: "middle" },
    ],
    tests: [
      { arrayName: "data", initialArray: [50, 10, 30, 20, 40], expectedOutput: "Median: 30" },
      { arrayName: "data", initialArray: [7, 3, 1], expectedOutput: "Median: 3" },
      { arrayName: "data", initialArray: [100, 200, 300, 400, 500, 600, 700], expectedOutput: "Median: 400" },
    ],
    postMissionNote: "Bit: 'Sort, then take the middle: data[length / 2]. Integer division handles the floor — for 5 elements, 5/2 = 2 (the third position, zero-indexed). The hardcoded [2] broke on the three-element tray; length/2 survives any odd-size collection.'",
    concept: "median_pattern" },

  // ── Mission 4: The Before-and-After Ledger (FLAGSHIP) ──
  { mission: 4, title: "The Before-and-After Ledger",
    brief: "Publish the tray's ORIGINAL order, THEN its sorted order. For {30, 10, 20}:\nOriginal: [30, 10, 20]\nSorted: [10, 20, 30]",
    skeleton: [
      "int[] data = /* populated by test */;",
      "",
      "String original = <slot:capture>;",
      "<slot:sort>",
      'System.out.println("Original: " + original);',
      'System.out.println("Sorted: " + <slot:display>);',
    ],
    slots: [
      { id: "capture", hint: "snapshot the original" },
      { id: "sort", hint: "sort the tray" },
      { id: "display", hint: "display the sorted tray" },
    ],
    palette: [
      { code: "Arrays.toString(data)", correct: true, slotId: "capture" },
      { code: "data.toString()", tag: "arrays_instance_call_belief", slotId: "capture" },
      { code: "data", tag: "captures_reference_not_snapshot", slotId: "capture" },
      { code: "Arrays.sort(data);", correct: true, slotId: "sort" },
      { code: "Arrays.toString(data)", correct: true, slotId: "display" },
      { code: "original", tag: "reuses_snapshot_for_sorted", slotId: "display" },
    ],
    isPreSortFlagship: true,
    tests: [
      { arrayName: "data", initialArray: [30, 10, 20], expectedOutput: "Original: [30, 10, 20]⏎Sorted: [10, 20, 30]" },
      { arrayName: "data", initialArray: [5, 3, 8, 1], expectedOutput: "Original: [5, 3, 8, 1]⏎Sorted: [1, 3, 5, 8]" },
      { arrayName: "data", initialArray: [7], expectedOutput: "Original: [7]⏎Sorted: [7]" },
    ],
    postMissionNote: "Bit (tapping the clipboard-ruler thoughtfully): 'toString before sort — the snapshot captures the moment. toString after sort — the label reads the new order. Same call, different moments, different results. And one day you'll want a TRUE copy — an independent tray you can sort while the original stays untouched. That instrument waits in the next room.'",
    concept: "pre_sort_capture_flagship" },

  // ── Mission 5: The Visitor's Ranking (Cross-Wing — Scanner + sort) ──
  { mission: 5, title: "The Visitor's Ranking",
    brief: "Read 3 visitor scores, sort them, and publish the ranking. For inputs 75, 92, 60:\nRanking: [60, 75, 92]",
    skeleton: [
      "Scanner sc = new Scanner(System.in);",
      "",
      "int[] scores = new int[3];",
      "scores[0] = <slot:read0>;",
      "scores[1] = sc.nextInt();",
      "scores[2] = sc.nextInt();",
      "",
      "<slot:sort>",
      'System.out.println("Ranking: " + <slot:display>);',
    ],
    slots: [
      { id: "read0", hint: "read the first score" },
      { id: "sort", hint: "sort them" },
      { id: "display", hint: "display the ranking" },
    ],
    palette: [
      { code: "sc.nextInt()", correct: true, slotId: "read0" },
      { code: "sc.nextLine()", tag: "wrong_scanner_method", slotId: "read0" },
      { code: "Arrays.sort(scores);", correct: true, slotId: "sort" },
      { code: "scores.sort();", tag: "arrays_instance_call_belief", slotId: "sort" },
      { code: "Arrays.toString(scores)", correct: true, slotId: "display" },
      { code: "scores", tag: "array_prints_contents_belief", slotId: "display" },
    ],
    isCrossWing: true,
    tests: [
      { arrayName: "scores", input: ["75", "92", "60"], expectedOutput: "Ranking: [60, 75, 92]" },
      { arrayName: "scores", input: ["10", "10", "10"], expectedOutput: "Ranking: [10, 10, 10]" },
      { arrayName: "scores", input: ["100", "1", "50"], expectedOutput: "Ranking: [1, 50, 100]" },
    ],
    postMissionNote: "Bit: 'Scanner fills the tray; sort arranges it; toString labels it. Three wings in three lines — the Intake Wing's reader, the Arrays Wing's engine, and the Hall's plaque, collaborating.'",
    concept: "scanner_sort_display_pipeline" },

  // ── Mission 6: The Statistical Summary (GRAND CAPSTONE) ──
  { mission: 6, title: "The Statistical Summary",
    brief: "Sort the dataset, then publish a FULL STATISTICAL SUMMARY: the sorted display, the minimum, the maximum, and the range (max − min). For {45, 12, 78, 33}:\nSorted: [12, 33, 45, 78]\nMin: 12\nMax: 78\nRange: 66",
    skeleton: [
      "int[] data = /* populated by test */;",
      "",
      "<slot:sort>",
      'System.out.println("Sorted: " + <slot:display>);',
      "int min = <slot:min>;",
      "int max = <slot:max>;",
      'System.out.println("Min: " + min);',
      'System.out.println("Max: " + max);',
      'System.out.println("Range: " + <slot:range>);',
    ],
    slots: [
      { id: "sort", hint: "sort first" },
      { id: "display", hint: "the sorted display" },
      { id: "min", hint: "the minimum" },
      { id: "max", hint: "the maximum" },
      { id: "range", hint: "the range" },
    ],
    palette: [
      { code: "Arrays.sort(data);", correct: true, slotId: "sort" },
      { code: "Arrays.toString(data)", correct: true, slotId: "display" },
      { code: "data[0]", correct: true, slotId: "min" },
      { code: "data[1]", tag: "array_bracket_off_by_one", slotId: "min" },
      { code: "data[data.length - 1]", correct: true, slotId: "max" },
      { code: "data[data.length]", tag: "length_not_minus_one_belief", slotId: "max" },
      { code: "(max - min)", correct: true, slotId: "range" },
      { code: "(min - max)", tag: "range_reversed", slotId: "range" },
      { code: "data[data.length - 1] - data[0]", correct: true, alsoCorrect: true, slotId: "range" },
    ],
    isStatSummary: true,
    tests: [
      { arrayName: "data", initialArray: [45, 12, 78, 33], expectedOutput: "Sorted: [12, 33, 45, 78]⏎Min: 12⏎Max: 78⏎Range: 66" },
      { arrayName: "data", initialArray: [5, 100], expectedOutput: "Sorted: [5, 100]⏎Min: 5⏎Max: 100⏎Range: 95" },
      { arrayName: "data", initialArray: [42, 42, 42], expectedOutput: "Sorted: [42, 42, 42]⏎Min: 42⏎Max: 42⏎Range: 0" },
    ],
    postMissionNote: "Bit (pressing the Q.A. stamp with a final, satisfied thud): 'Sort. Display. Extract. Compute. The full statistical summary — sort did the heavy lifting; brackets and arithmetic did the rest. Five slots, one arrangement, one publication. Head Arranger — the workshop publishes under your name. The next room holds the last instrument: the Copy Bench.'",
    concept: "statistical_summary_capstone" },
];

const MISCONCEPTION_FEEDBACK = {
  arrays_instance_call_belief: "Arrays.sort(arr) and Arrays.toString(arr) — both are static, both need the class name. The tray has no built-in engine or labeller.",
  array_prints_contents_belief: "Without toString, println prints the hash — even on a sorted tray. Sort arranges; toString labels. Both needed.",
  captures_reference_not_snapshot: "The compile stamp — you tried to pour an int[] into a String variable. Arrays.toString gives you the String snapshot; the raw array is not a String.",
  reuses_snapshot_for_sorted: "Both lines printed the same thing — the 'original' captured BEFORE sort. The second println needs a FRESH toString call to read the NOW-SORTED tray.",
  array_bracket_off_by_one: "Index 1 is the SECOND element — the minimum sits at index 0 after sort. Zero-indexed, as always.",
  length_not_minus_one_belief: "The cliff: data[length] reaches past the last compartment. The last index is length − 1.",
  hardcoded_last_index: "data[3] worked for the four-element tray but broke on the five-element one. length − 1 works for ANY size.",
  negative_index_belief: "Java has no negative indexing — data[-1] is an ArrayIndexOutOfBoundsException. The last element is at data[data.length − 1].",
  hardcoded_middle_index: "data[2] worked for the five-element tray but broke on the three-element one. data[length / 2] finds the middle of ANY odd-size tray.",
  median_off_by_one: "One before the middle: length/2 − 1 misses by one position. For 5 elements, the median sits at index 2 (5/2 = 2), not index 1.",
  median_is_max_belief: "data[length − 1] is the MAXIMUM, not the median. The median is the MIDDLE: data[length / 2].",
  wrong_scanner_method: "nextLine() returns a String; the int[] compartment needs an int. nextInt().",
  range_reversed: "min − max produces a NEGATIVE range — ranges are positive (or zero). max − min is the correct order.",
  sort_preserves_original_belief: "The original order is gone after sort — the tray was rewritten in place. That's why Mission 4 captured a snapshot first.",
  sort_returns_new_array_belief: "sort returns void — nothing to assign. The tray itself changed; read it through the original name.",
  timeout: "Reread the brief carefully — the answer is in the wording.",
};

const HINTS = {
  1: "Arrays.sort(readings); then println(\"Display: \" + Arrays.toString(readings)); — sort first, label second.",
  2: "Sort first. Then data[0] is the smallest; data[data.length - 1] is the largest.",
  3: "Sort first. The middle sits at data[data.length / 2] — integer division finds the exact center of an odd-size tray.",
  4: "Capture Arrays.toString(data) BEFORE you sort — that's your original snapshot. Sort. Then call Arrays.toString(data) AGAIN to read the new order.",
  5: "sc.nextInt() reads an int from the tape — use it for all three scores. Sort the scores array, then Arrays.toString(scores) to publish it.",
  6: "Sort, then Arrays.toString for the display, data[0] for the min, data[data.length - 1] for the max, and (max - min) for the range.",
};

export class Level67Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level67Scene" });
  }

  init() {
    this.currentMission = 0;
    this.score = 0;
    this.lives = 5;
    this.flawlessCount = 0;
    this.runCount = 0;
    this.failedRunCount = 0;
    this.hintCount = 0;
    this.selfCorrectionCount = 0;
    this.preSortProactive = {};
    this.extremesClean = {};
    this.crossWingClean = {};
    this._firstRunMetricsRecorded = {};
    this.attemptLog = [];
    this.missionElements = [];
    this.slotContents = {};
    this.slotDefs = {};
    this.paletteBlocks = [];
    this.wrongBlockHistory = {};
    this.missionStartTime = 0;
    this.missionRunsFailed = 0;
    this.missionHintUsed = false;
    this._runCountAtMissionStart = 0;
    this.inputLocked = true;
    this.gameEnded = false;
    this._alive = true;
  }

  preload() {}

  create() {
    this._alive = true;
    this.createParticleTexture();
    this.createBackground();
    this.createWorkshopInterior();
    this.createQualityStamp();
    this.createWorkshopFloor();
    this.createAmbientParticles();
    this.createCodeCanvas();
    this.createBlockPalette();
    this.createRunButton();
    this.createRigWindow();
    this.createMiniTrayAndEngine();
    this.createMiniPlaque();
    this.createMiniContainers();
    this.createMiniOutputTicker();
    this.createMiniScannerCameo();
    this.createManifestStrip();
    this.createTestReportPanel();
    this.createMissionBriefPanel();
    this.createHUD();
    this.createBit();
    this.setupDragEvents();

    this.events.on("shutdown", () => { this._alive = false; });
    this.checkTutorial();
  }

  update(time, delta) {
    this.updateAmbient(time, delta);
    this.updateStampPulse(time);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // SETUP — THE ARRANGEMENT WORKSHOP INTERIOR
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l67_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l67_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x0a1208).setDepth(0);
  }

  createWorkshopInterior() {
    // Work-order board
    const board = this.add.graphics().setDepth(1);
    board.fillStyle(C_BRASS, 0.25);
    board.lineStyle(2, 0x3a2618, 1);
    board.fillRect(200, 40, 580, 120);
    board.strokeRect(200, 40, 580, 120);
    this._workOrderPins = [];
    for (let i = 0; i < 7; i++) {
      const nx = 220 + i * 78 + Phaser.Math.Between(-6, 6), ny = 60 + Phaser.Math.Between(-6, 6);
      const ang = Phaser.Math.Between(-6, 6);
      const card = this.add.rectangle(nx, ny, 40, 26, 0xf5ecd8, 0.85).setAngle(ang).setDepth(2);
      const lg = this.add.graphics().setDepth(2).setAlpha(0.4);
      lg.lineStyle(1, 0x8a6435, 1);
      for (let l = 0; l < 3; l++) lg.lineBetween(nx - 14, ny - 6 + l * 6, nx + 14, ny - 6 + l * 6);
      const pinColor = i < 5 ? 0x5d7a5d : 0xc8a05a;
      const pin = this.add.circle(nx, ny - 13, 2, pinColor, 0.9).setDepth(3);
      this._workOrderPins.push(pin);
    }

    // Tool rack (left wall)
    const rack = this.add.graphics().setDepth(2).setAlpha(0.4);
    rack.lineStyle(2, C_BRASS, 1);
    rack.strokeRect(60, 320, 60, 200);
    const toolIcons = ["⚖", "📏", "✒"];
    this._toolRackIcons = [];
    for (let i = 0; i < 3; i++) {
      const hook = this.add.circle(90, 345 + i * 55, 2, C_BRASS, 0.7).setDepth(3);
      const t = this.add.text(90, 370 + i * 55, ["÷", "═", "✓"][i], { font: "18px Georgia", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.35).setDepth(3);
      this._toolRackIcons.push(t);
    }

    // Finished-work shelf (right wall)
    const shelfG = this.add.graphics().setDepth(2).setAlpha(0.4);
    shelfG.lineStyle(2, C_BRASS, 1);
    shelfG.strokeRect(1140, 100, 100, 100);
    this._finishedShelfTrays = [];
    for (let i = 0; i < 3; i++) {
      const ty = 118 + i * 26;
      const trayW = 20 + i * 14;
      const tray = this.add.rectangle(1190, ty, trayW, 8, 0x0a1208, 0.5).setStrokeStyle(1, C_BRASS, 0.5).setDepth(3);
      for (let d = 0; d < 3; d++) this.add.circle(1190 - trayW / 2 + 4 + d * (trayW - 8) / 2, ty, 1.3, C_GOLD, 0.4).setDepth(3);
      this._finishedShelfTrays.push(tray);
    }

    // Banner
    const bg = this.add.graphics().setDepth(2);
    bg.fillStyle(0x0a1208, 1);
    bg.lineStyle(1, C_BRASS, 0.5);
    bg.fillRoundedRect(400, 12, 400, 26, 3);
    bg.strokeRoundedRect(400, 12, 400, 26, 3);
    this.add.text(600, 25, "T H E   A R R A N G E M E N T   W O R K S H O P", { font: "bold 13px Georgia", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.7).setDepth(3);
  }

  createQualityStamp() {
    const c = this.add.container(880, 56).setDepth(4);
    const g = this.add.graphics();
    g.lineStyle(2, C_BRASS, 1);
    g.strokeCircle(0, 0, 18);
    const t = this.add.text(0, 0, "Q.A.", { font: "bold 12px Georgia", color: "#5d7a5d" }).setOrigin(0.5);
    c.add([g, t]);
    c.setAlpha(0.4);
    this._qaStamp = { c, g, t, state: "idle" };
  }

  pulseStamp(state) {
    const s = this._qaStamp;
    s.state = state;
    if (state === "idle") s.c.setAlpha(0.4);
    else if (state === "session") s.c.setAlpha(0.8);
    else if (state === "gold") {
      this.tweens.add({
        targets: s.c, scaleX: 0, duration: 150,
        onComplete: () => {
          s.g.clear();
          s.g.lineStyle(2, C_GOLD, 1);
          s.g.strokeCircle(0, 0, 18);
          s.t.setColor(HEX_GOLD);
          s.c.setAlpha(1);
          this.tweens.add({ targets: s.c, scaleX: 1, duration: 150 });
        },
      });
    }
  }

  updateStampPulse(time) {
    if (!this._qaStamp || this._qaStamp.state !== "session") return;
    this._qaStamp.c.setAlpha(0.6 + Math.abs(Math.sin(time * 0.006)) * 0.4);
  }

  createWorkshopFloor() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x0a0d18, 1);
    g.fillRect(0, 635, W, 85);
    g.lineStyle(1, 0x2a3654, 1);
    g.lineBetween(0, 637, W, 637);
    g.lineStyle(1, 0x2a3654, 0.3);
    for (let x = 0; x < W; x += 100) g.lineBetween(x, 640, x, 720);
    for (let i = 0; i < 6; i++) {
      this.add.circle(Phaser.Math.Between(80, 300), Phaser.Math.Between(650, 710), 1, C_BRASS, 0.08).setDepth(2);
    }
  }

  createAmbientParticles() {
    this.ambient = [];
    const colors = [0x8ea6c8, 0xc8a05a, 0x5d7a5d];
    for (let i = 0; i < 7; i++) {
      this.ambient.push(this.add.circle(Phaser.Math.Between(0, W), Phaser.Math.Between(230, 630), 1, Phaser.Utils.Array.GetRandom(colors), Phaser.Math.FloatBetween(0.03, 0.05)).setDepth(2));
    }
  }

  updateAmbient(time, delta) {
    if (!this.ambient) return;
    const step = 0.008 * (delta / 16.7);
    this.ambient.forEach((p, i) => {
      p.y += step * (i % 2 === 0 ? 1 : -0.6);
      p.x += Math.sin(time * 0.0003 + i) * 0.02;
      if (p.y > 630) p.y = 230; if (p.y < 230) p.y = 630;
      if (p.x > W) p.x = 0; if (p.x < 0) p.x = W;
    });
  }

  screenShake(intensity = 0.004, duration = 150) {
    this.cameras.main.shake(duration, intensity);
  }

  createFloatingText(x, y, text, colorHex, font = "bold 15px Arial", hold = 1200) {
    const t = this.add.text(x, y, text, { font, color: colorHex, wordWrap: { width: 300 }, align: "center" }).setOrigin(0.5).setDepth(75).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 160 });
    this.time.delayedCall(hold, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 220, onComplete: () => t.destroy() }); });
    return t;
  }

  createAnnotation(x, y, text, colorHex) {
    const t = this.add.text(x, y, text, { font: "italic 12px Arial", color: colorHex, wordWrap: { width: 260 }, align: "center" }).setOrigin(0.5).setDepth(70).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 200 });
    return t;
  }

  createConfetti(x, y, count = 30) {
    const p = this.add.particles(x, y, "l67_dot", {
      speed: { min: 80, max: 240 }, angle: { min: 0, max: 360 }, scale: { start: 0.9, end: 0 }, lifespan: 500,
      tint: [C_BRASS, C_GOLD, C_GREEN_BRIGHT, 0x5d7a5d, 0xffffff], emitting: false,
    }).setDepth(95);
    p.explode(count);
    this.time.delayedCall(900, () => p.destroy());
  }

  // ══════════════════════════════════════════════════════════════
  // CODE CANVAS
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
    this.tabFilename = this.add.text(CX + CW - 12, CY + TAB_H / 2, "Arrange1.java", { font: "13px Courier New", color: "#546e7a" }).setOrigin(1, 0.5).setDepth(11);

    this.lineHighlight = this.add.rectangle(CX + CW / 2, 0, CW - 4, LINE_H, 0xffab00, 0.06).setDepth(19).setVisible(false);
    this.codeContainer = this.add.container(0, 0).setDepth(20);
  }

  _syntaxTokens(line) {
    const tokens = [];
    const re = /("(?:[^"\\]|\\.)*")|(\bimport\b|\bfor\b|\bint\b|\bdouble\b|\bString\b|\bnew\b|\bScanner\b)|(<\w*>)|(\bArrays\b)|(\.sort\b|\.toString\b|\.length\b|\.nextInt\b|\.nextLine\b|\.println\b)|(\bSystem\.out\b|\bSystem\.in\b)|(-?\d+\.\d+|-?\d+)|(>=|<=|==|!=|\+\+|--|[+\-*/><?:])|([(){}\[\];.,=])/g;
    let last = 0, m;
    const plain = (t) => t && tokens.push({ t, c: "#e0e0e0" });
    while ((m = re.exec(line))) {
      if (m.index > last) plain(line.slice(last, m.index));
      if (m[1]) tokens.push({ t: m[1], c: "#4caf50" });
      else if (m[2]) tokens.push({ t: m[2], c: "#6a1b9a" });
      else if (m[3]) tokens.push({ t: m[3], c: HEX_GOLD });
      else if (m[4]) tokens.push({ t: m[4], c: HEX_GOLD });
      else if (m[5]) tokens.push({ t: m[5], c: HEX_CYAN });
      else if (m[6]) tokens.push({ t: m[6], c: "#78909c" });
      else if (m[7]) tokens.push({ t: m[7], c: "#4caf50" });
      else if (m[8]) tokens.push({ t: m[8], c: "#78909c" });
      else if (m[9]) tokens.push({ t: m[9], c: "#78909c" });
      last = m.index + m[0].length;
    }
    if (last < line.length) plain(line.slice(last));
    return tokens.length ? tokens : [{ t: line, c: "#e0e0e0" }];
  }

  _isDimmedInfrastructure(rawLine) {
    const t = rawLine.trim();
    return /^Scanner sc = new Scanner/.test(rawLine)
      || /^((int|String|double)\[\]\s+\w+\s*=\s*\/\*.*\*\/;\s*)+$/.test(rawLine)
      || t === "";
  }

  renderSkeleton(mission) {
    this.codeContainer.removeAll(true);
    this.slotDefs = {};
    mission.slots.forEach((s) => { this.slotDefs[s.id] = { ...s, capacity: 1, rect: null }; });

    mission.skeleton.forEach((rawLine, i) => {
      const y = CODE_Y0 + i * LINE_H;
      const numT = this.add.text(CX + 8, y, String(i + 1), { font: "13px Courier New", color: "#3d4450" });
      this.codeContainer.add(numT);

      if (!rawLine.trim()) return;

      if (this._isDimmedInfrastructure(rawLine)) {
        const t = this.add.text(CODE_X, y, rawLine, { font: "13px Courier New", color: "#3d4450" }).setAlpha(0.6);
        this.codeContainer.add(t);
        return;
      }

      const parts = rawLine.split(/<slot:(\w+)>/);
      let x = CODE_X;
      parts.forEach((part, pi) => {
        if (pi % 2 === 0) {
          if (!part) return;
          this._syntaxTokens(part).forEach((tok) => {
            const t = this.add.text(x, y, tok.t, { font: "bold 13px Courier New", color: tok.c });
            this.codeContainer.add(t);
            x += t.width;
          });
        } else {
          const slotId = part;
          const def = this.slotDefs[slotId];
          const w = 195;
          def.rect = { x, y: y - 2, w, h: 17 };
          this._drawSlotPlaceholder(slotId);
          x += w + 6;
        }
      });
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
      const label = this.add.text(x + w / 2, y + h / 2, def.hint, { font: "italic 10px Courier New", color: "#3d4450" }).setOrigin(0.5).setDepth(22);
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
  // BLOCK PALETTE + DRAG
  // ══════════════════════════════════════════════════════════════

  createBlockPalette() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0f0a06, 1);
    g.fillRoundedRect(PX, PY, PW, PH, 10);
    g.lineStyle(1, 0x3a2618, 1);
    g.strokeRoundedRect(PX, PY, PW, PH, 10);
    this.add.text(PX + 10, PY + 8, "ARRANGER'S TOOLS", { font: "bold 11px Arial", color: "#3d4450" }).setDepth(11);
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
      const style = { font: "bold 12px Courier New", color: HEX_CYAN };
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
        bg.fillStyle(0x14200f, 1);
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
      c.setData("slotId", def.slotId || null);
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

  _nearestOpenSlot(x, y, forObj) {
    let best = null, bestDist = 60;
    const wantSlotId = forObj ? forObj.getData("slotId") : null;
    for (const id in this.slotDefs) {
      const def = this.slotDefs[id];
      if (!def || !def.rect) continue;
      if (wantSlotId && id !== wantSlotId) continue;
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
    const key = this._nearestOpenSlot(obj.x, obj.y, obj);
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
    const key = this._nearestOpenSlot(obj.x, obj.y, obj);
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

  _slotCode(slotId) {
    const placed = this.slotContents[slotId] && this.slotContents[slotId][0];
    return placed ? placed.container.getData("code") : "";
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
  // RIG WINDOW
  // ══════════════════════════════════════════════════════════════

  createRigWindow() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x04060c, 1);
    g.fillRoundedRect(OX, OY, OW, OH, 12);
    g.lineStyle(3, C_BRASS, 1);
    g.strokeRoundedRect(OX, OY, OW, OH, 12);
    this.add.text(OX + 10, OY + 6, "WORKSHOP RIG — LIVE", { font: "bold 11px Georgia", color: HEX_BRASS }).setAlpha(0.7).setDepth(11);

    const maskShape = this.make.graphics({ x: 0, y: 0, add: false });
    maskShape.fillRoundedRect(OX + 4, OY + 20, OW - 8, OH - 24, 10);
    this.windowMask = maskShape.createGeometryMask();
    this.rigLayer = this.add.container(0, 0).setDepth(15);
    this.rigLayer.setMask(this.windowMask);

    this.verdictLamp = this.add.circle(OX + OW - 18, OY + 14, 6, C_GRAY).setDepth(20);
  }

  // ══════════════════════════════════════════════════════════════
  // MINI TRAY + MINI ARRANGEMENT ENGINE (compact scale, restructuring tempo)
  // ══════════════════════════════════════════════════════════════

  createMiniTrayAndEngine() {
    const g = this.add.graphics();
    g.fillStyle(0x0d0a06, 0.8);
    g.lineStyle(1.5, C_BRASS, 1);
    g.fillRoundedRect(MINI_X0, MINI_TRAY_Y0, MINI_X1 - MINI_X0, MINI_TRAY_Y1 - MINI_TRAY_Y0, 4);
    g.strokeRoundedRect(MINI_X0, MINI_TRAY_Y0, MINI_X1 - MINI_X0, MINI_TRAY_Y1 - MINI_TRAY_Y0, 4);
    this.rigLayer.add(g);
    this.miniTrayTypeBadge = this.add.text(MINI_X1 - 4, MINI_TRAY_Y0 - 10, "int[]", { font: "bold 9px Courier New", color: HEX_BLUE_GRAY }).setOrigin(1, 0);
    this.rigLayer.add(this.miniTrayTypeBadge);

    this.miniCompartmentLayer = this.add.container(0, 0);
    this.miniSpecimenLayer = this.add.container(0, 0);
    this.rigLayer.add([this.miniCompartmentLayer, this.miniSpecimenLayer]);
    this._miniCompartments = [];

    g.fillStyle(0x1a1408, 1);
    g.lineStyle(1, C_BRASS, 1);
    g.fillRoundedRect(MINI_X0, MINI_GANTRY_Y, MINI_X1 - MINI_X0, MINI_GANTRY_H, 2);
    g.strokeRoundedRect(MINI_X0, MINI_GANTRY_Y, MINI_X1 - MINI_X0, MINI_GANTRY_H, 2);

    const plateW = 66, plateH = 12;
    const plateX = MINI_CX - plateW / 2, plateY = MINI_GANTRY_Y - plateH - 3;
    const pg = this.add.graphics();
    pg.fillStyle(0x0a1208, 1);
    pg.lineStyle(1, C_GOLD, 1);
    pg.fillRoundedRect(plateX, plateY, plateW, plateH, 2);
    pg.strokeRoundedRect(plateX, plateY, plateW, plateH, 2);
    this.rigLayer.add(pg);
    const plateLbl = this.add.text(plateX + plateW / 2, plateY + 4, "Arrays.sort", { font: "bold 6.5px Courier New", color: HEX_GOLD }).setOrigin(0.5);
    this.rigLayer.add(plateLbl);

    this.miniArmContainer = this.add.container(MINI_CX, MINI_GANTRY_Y + MINI_GANTRY_H);
    const armG = this.add.graphics();
    armG.lineStyle(1.5, C_BRASS, 1);
    armG.lineBetween(0, 0, 0, 18);
    armG.lineStyle(1, C_BRASS, 1);
    armG.lineBetween(-3, 18, 0, 22);
    armG.lineBetween(3, 18, 0, 22);
    this.miniArmContainer.add(armG);
    this.miniArmContainer.setVisible(false);
    this.rigLayer.add(this.miniArmContainer);
  }

  updateMiniTypeBadge(type) { this.miniTrayTypeBadge.setText(type || "int[]"); }

  clearMiniTray() {
    this.miniCompartmentLayer.removeAll(true);
    this.miniSpecimenLayer.removeAll(true);
    this._miniCompartments = [];
  }

  async populateMiniTray(values, type) {
    this.clearMiniTray();
    this.updateMiniTypeBadge(type);
    const n = values.length;
    const innerX0 = MINI_X0 + 4, innerX1 = MINI_X1 - 4;
    const innerW = innerX1 - innerX0;
    const cellW = n > 0 ? innerW / n : innerW;

    for (let i = 0; i < n; i++) {
      const cellX = innerX0 + i * cellW;
      if (i > 0) {
        const dg = this.add.graphics();
        dg.lineStyle(1, C_BRASS, 0.35);
        dg.lineBetween(cellX, MINI_TRAY_Y0 + 4, cellX, MINI_TRAY_Y1 - 10);
        this.miniCompartmentLayer.add(dg);
      }
      const idxPlate = this.add.text(cellX + cellW / 2, MINI_TRAY_Y1 - 6, `[${i}]`, { font: "bold 8px Courier New", color: HEX_BRASS }).setOrigin(0.5).setAlpha(i === 0 ? 0.9 : 0.55);
      this.miniCompartmentLayer.add(idxPlate);
      this._miniCompartments.push({ x: cellX, w: cellW, idxPlate });
    }

    for (let i = 0; i < n; i++) {
      const comp = this._miniCompartments[i];
      const color = type === "String[]" ? C_CYAN : C_GOLD;
      const cardW = Math.min(cellW - 5, 32), cardH = 20;
      const cx = comp.x + comp.w / 2, cy = (MINI_TRAY_Y0 + MINI_TRAY_Y1) / 2 - 3;
      const card = this.add.container(cx, cy).setAlpha(0).setScale(0.7);
      const cg = this.add.graphics();
      cg.fillStyle(color, 0.9);
      cg.lineStyle(1, Phaser.Display.Color.IntegerToColor(color).darken(30).color, 1);
      cg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 3);
      cg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 3);
      const display = String(values[i]);
      const txt = this.add.text(0, 0, display, { font: "bold 9px Courier New", color: "#0a1208" }).setOrigin(0.5);
      if (txt.width > cardW - 4) txt.setFontSize(5.5);
      card.add([cg, txt]);
      this.miniSpecimenLayer.add(card);
      comp.card = card; comp.cardGfx = cg; comp.cardText = txt; comp.cardColor = color; comp.cardW = cardW; comp.value = values[i];
      this.tweens.add({ targets: card, alpha: 1, scale: 1, duration: 100, delay: i * 45, ease: "Back.easeOut" });
      await this.delay(35);
    }
    await this.delay(60);
  }

  _updateMiniSpecimenCard(index, value) {
    const comp = this._miniCompartments[index];
    if (!comp || !comp.cardText) return;
    comp.value = value;
    const display = String(value);
    comp.cardText.setText(display);
    if (comp.cardText.width > comp.cardW - 4) comp.cardText.setFontSize(5.5);
    this.tweens.add({ targets: comp.card, scale: 1.15, duration: 70, yoyo: true });
  }

  async highlightMiniCompartment(index) {
    const comp = this._miniCompartments[index];
    if (!comp) return;
    this.tweens.add({ targets: comp.idxPlate, alpha: 1, scale: 1.3, duration: 80, yoyo: true });
    await this.delay(100);
  }

  async activateEngine() {
    this.miniArmContainer.setPosition(MINI_CX, MINI_GANTRY_Y + MINI_GANTRY_H).setVisible(true).setAlpha(0);
    await new Promise((res) => { this.tweens.add({ targets: this.miniArmContainer, alpha: 1, duration: 80, onComplete: res }); });
  }

  deactivateEngine() {
    this.tweens.add({ targets: this.miniArmContainer, alpha: 0, duration: 100, onComplete: () => { if (this.miniArmContainer.active) this.miniArmContainer.setVisible(false); } });
  }

  async haltEngine() {
    await this.activateEngine();
    await this.delay(100);
    this.tweens.add({ targets: this.miniArmContainer, alpha: 0.3, duration: 90 });
    this.showCompileErrorStamp();
    await this.delay(350);
    this.deactivateEngine();
  }

  async moveArmTo(x) {
    await new Promise((res) => { this.tweens.add({ targets: this.miniArmContainer, x, duration: 95, ease: "Sine.easeInOut", onComplete: res }); });
  }

  async armDescend() {
    await new Promise((res) => { this.tweens.add({ targets: this.miniArmContainer, y: MINI_ENTRY_Y, duration: 70, ease: "Sine.easeOut", onComplete: res }); });
  }

  async armAscend() {
    await new Promise((res) => { this.tweens.add({ targets: this.miniArmContainer, y: MINI_GANTRY_Y + MINI_GANTRY_H, duration: 70, ease: "Sine.easeIn", onComplete: res }); });
  }

  async animateSwap(indexA, indexB) {
    const compA = this._miniCompartments[indexA], compB = this._miniCompartments[indexB];
    if (!compA || !compB || !compA.card || !compB.card) return;
    const midX = (compA.x + compA.w / 2 + compB.x + compB.w / 2) / 2;
    await this.moveArmTo(midX);
    await this.armDescend();
    const cardA = compA.card, cardB = compB.card;
    const posA = { x: cardA.x, y: cardA.y }, posB = { x: cardB.x, y: cardB.y };
    await new Promise((res) => {
      this.tweens.add({ targets: cardA, y: posA.y - 10, duration: 55 });
      this.tweens.add({ targets: cardB, y: posB.y - 10, duration: 55, onComplete: res });
    });
    await new Promise((res) => {
      this.tweens.add({ targets: cardA, x: posB.x, duration: 130, ease: "Sine.easeInOut" });
      this.tweens.add({ targets: cardB, x: posA.x, duration: 130, ease: "Sine.easeInOut", onComplete: res });
    });
    await new Promise((res) => {
      this.tweens.add({ targets: cardA, y: posA.y, duration: 55 });
      this.tweens.add({ targets: cardB, y: posB.y, duration: 55, onComplete: res });
    });
    await this.armAscend();

    compA.card = cardB; compB.card = cardA;
    [compA.value, compB.value] = [compB.value, compA.value];
    [compA.cardText, compB.cardText] = [compB.cardText, compA.cardText];
    [compA.cardGfx, compB.cardGfx] = [compB.cardGfx, compA.cardGfx];
    [compA.cardColor, compB.cardColor] = [compB.cardColor, compA.cardColor];
    [compA.cardW, compB.cardW] = [compB.cardW, compA.cardW];
  }

  async settlingGlow() {
    const cards = this._miniCompartments.map((c) => c.card).filter(Boolean);
    cards.forEach((card) => {
      const flash = this.add.rectangle(card.x, card.y, 30, 22, C_GREEN_BRIGHT, 0.25);
      this.rigLayer.add(flash);
      this.tweens.add({ targets: flash, alpha: 0, duration: 220, onComplete: () => flash.destroy() });
    });
    await this.delay(150);
  }

  showVoidAnnotation() {
    const t = this.add.text(MINI_PLAQUE_X + MINI_PLAQUE_W / 2, MINI_PLAQUE_Y - 10, "void", { font: "bold 11px Courier New", color: HEX_GRAY }).setOrigin(0.5).setAlpha(0);
    this.rigLayer.add(t);
    this.tweens.add({ targets: t, alpha: 1, duration: 100 });
    this.time.delayedCall(450, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 140, onComplete: () => t.destroy() }); });
  }

  async runSortAnimation(before, after) {
    await this.activateEngine();
    const working = before.slice();
    const n = working.length;
    let swaps = 0;
    for (let i = 0; i < n && swaps < 8; i++) {
      if (!this._alive) break;
      if (working[i] === after[i]) continue;
      let j = -1;
      for (let k = i + 1; k < n; k++) { if (working[k] === after[i]) { j = k; break; } }
      if (j === -1) continue;
      await this.animateSwap(i, j);
      const tmp = working[i]; working[i] = working[j]; working[j] = tmp;
      swaps++;
    }
    await this.settlingGlow();
    this.deactivateEngine();
  }

  // ══════════════════════════════════════════════════════════════
  // MINI DISPLAY PLAQUE + BEFORE/AFTER STRIP
  // ══════════════════════════════════════════════════════════════

  createMiniPlaque() {
    const g = this.add.graphics();
    g.fillStyle(0x1a1408, 1);
    g.lineStyle(1.5, C_BRASS, 1);
    g.fillRoundedRect(MINI_PLAQUE_X, MINI_PLAQUE_Y, MINI_PLAQUE_W, MINI_PLAQUE_H, 3);
    g.strokeRoundedRect(MINI_PLAQUE_X, MINI_PLAQUE_Y, MINI_PLAQUE_W, MINI_PLAQUE_H, 3);
    this.rigLayer.add(g);
    this.plaqueText = this.add.text(MINI_PLAQUE_X + MINI_PLAQUE_W / 2, MINI_PLAQUE_Y + MINI_PLAQUE_H / 2, "", { font: "bold 11px Courier New", color: "#e8eaf6", wordWrap: { width: MINI_PLAQUE_W - 10 }, align: "center" }).setOrigin(0.5);
    this.rigLayer.add(this.plaqueText);

    this.stripBeforeText = this.add.text(MINI_X0, MINI_STRIP_Y, "", { font: "9px Courier New", color: HEX_GRAY }).setOrigin(0, 0.5);
    this.stripArrowText = this.add.text(MINI_CX, MINI_STRIP_Y, "", { font: "bold 10px Arial", color: HEX_BRASS }).setOrigin(0.5);
    this.stripAfterText = this.add.text(MINI_X1, MINI_STRIP_Y, "", { font: "bold 9px Courier New", color: "#e8eaf6" }).setOrigin(1, 0.5);
    this.rigLayer.add([this.stripBeforeText, this.stripArrowText, this.stripAfterText]);
  }

  clearPlaque() {
    this.plaqueText.setText("").setColor("#e8eaf6").setFontSize(9);
  }

  clearBeforeAfterStrip() {
    this.stripBeforeText.setText("");
    this.stripArrowText.setText("");
    this.stripAfterText.setText("");
  }

  showBeforeAfter(before, after) {
    const fmt = (arr) => `[${arr.join(", ")}]`;
    let bStr = fmt(before), aStr = fmt(after);
    this.stripBeforeText.setFontSize(7).setText(bStr);
    this.stripArrowText.setText("→");
    this.stripAfterText.setFontSize(7).setText(aStr);
    if (this.stripBeforeText.width > MINI_PLAQUE_W / 2 - 14) this.stripBeforeText.setFontSize(5.5);
    if (this.stripAfterText.width > MINI_PLAQUE_W / 2 - 14) this.stripAfterText.setFontSize(5.5);
  }

  _fakeHash(seed, type) {
    const hex = ((seed + 1) * 7919 + 12345).toString(16).padStart(8, "0");
    return type === "String[]" ? `[Ljava.lang.String;@${hex}` : `[I@${hex}`;
  }

  async runToStringScan(values, type) {
    this.clearPlaque();
    const n = values.length;
    this.plaqueText.setText("[");
    await this.delay(45);
    const parts = [];
    for (let i = 0; i < n; i++) {
      if (!this._alive) return `[${parts.join(", ")}]`;
      const comp = this._miniCompartments[i];
      if (comp && comp.card) {
        const ghost = this.add.text(comp.card.x, comp.card.y, String(values[i]), { font: "bold 9px Courier New", color: "#e8eaf6" }).setOrigin(0.5);
        this.rigLayer.add(ghost);
        await new Promise((res) => { this.tweens.add({ targets: ghost, x: MINI_PLAQUE_X + 16 + i * 8, y: MINI_PLAQUE_Y + MINI_PLAQUE_H / 2, duration: 110, ease: "Sine.easeIn", onComplete: () => { ghost.destroy(); res(); } }); });
      }
      parts.push(String(values[i]));
      this.plaqueText.setText("[" + parts.join(", "));
      await this.delay(35);
    }
    this.plaqueText.setText("[" + parts.join(", ") + "]");
    return "[" + parts.join(", ") + "]";
  }

  async showCursedLabel(type, seed) {
    this.clearPlaque();
    this.tweens.add({ targets: this.miniSpecimenLayer, x: "+=2", duration: 20, yoyo: true, repeat: 4 });
    const hash = this._fakeHash(seed !== undefined ? seed : this.currentMission, type);
    this.plaqueText.setColor(HEX_RED).setFontSize(7);
    for (let i = 0; i < hash.length; i++) {
      if (!this._alive) return hash;
      this.plaqueText.setText(hash.slice(0, i + 1));
      await this.delay(8);
    }
    await this.delay(150);
    this.plaqueText.setFontSize(9);
    return hash;
  }

  async bracketAccessGhost(index) {
    await this.highlightMiniCompartment(index);
    const comp = this._miniCompartments[index];
    if (!comp || !comp.card) return comp ? comp.value : null;
    const color = comp.cardColor === C_CYAN ? HEX_CYAN : HEX_GOLD;
    const ghost = this.add.text(comp.card.x, comp.card.y, String(comp.value), { font: "bold 10px Courier New", color }).setOrigin(0.5);
    this.rigLayer.add(ghost);
    await new Promise((res) => { this.tweens.add({ targets: ghost, y: ghost.y - 26, alpha: 0, duration: 160, ease: "Sine.easeOut", onComplete: () => { ghost.destroy(); res(); } }); });
    return comp.value;
  }

  showCompileErrorStamp() {
    const stamp = this.add.text(OX + OW / 2, OY + 100, "COMPILE ERROR", { font: "bold 15px Arial", color: HEX_RED }).setOrigin(0.5).setScale(1.3).setAngle(-6).setAlpha(0);
    this.missionElements.push(stamp);
    this.rigLayer.add(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 130 });
    this.screenShake(0.004, 110);
    this.time.delayedCall(750, () => { if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 160, onComplete: () => stamp.destroy() }); });
  }

  async crashIOOBE(idx) {
    const stamp = this.add.text(MINI_CX, MINI_TRAY_Y0 - 16, "ArrayIndexOutOfBoundsException", { font: "bold 9px Courier New", color: HEX_RED }).setOrigin(0.5).setAngle(-3).setAlpha(0);
    this.missionElements.push(stamp);
    this.rigLayer.add(stamp);
    this.tweens.add({ targets: stamp, alpha: 1, duration: 90 });
    this.screenShake(0.005, 130);
    await this.delay(400);
    if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 150, onComplete: () => stamp.destroy() });
  }

  // ══════════════════════════════════════════════════════════════
  // MINI TYPED CONTAINERS
  // ══════════════════════════════════════════════════════════════

  createMiniContainers() {
    const hdr = this.add.text(CONT_X, CONT_Y0 - 12, "VARIABLES", { font: "bold 9px Georgia", color: HEX_BRASS }).setAlpha(0.7);
    this.containerLayer = this.add.container(0, 0);
    this.rigLayer.add([hdr, this.containerLayer]);
    this.containerObjs = {};
    this._containerOrder = [];
  }

  miniDispenseTo(name, value, type) {
    if (!this.containerObjs[name]) {
      const idx = this._containerOrder.length;
      const y = CONT_Y0 + idx * 14;
      const g = this.add.graphics();
      g.fillStyle(0x0a1520, 1);
      g.lineStyle(1, C_CYAN, 0.6);
      g.fillRoundedRect(CONT_X, y, 200, 12, 3);
      g.strokeRoundedRect(CONT_X, y, 200, 12, 3);
      const t = this.add.text(CONT_X + 4, y + 6, "", { font: "bold 6.5px Courier New", color: HEX_CYAN }).setOrigin(0, 0.5);
      this.containerLayer.add([g, t]);
      this.containerObjs[name] = t;
      this._containerOrder.push(name);
    }
    const display = String(value);
    this.containerObjs[name].setText(`${name} = ${display}`.slice(0, 30));
    this.tweens.add({ targets: this.containerObjs[name], scale: 1.15, duration: 80, yoyo: true });
  }

  clearContainers() {
    this.containerLayer.removeAll(true);
    this.containerObjs = {};
    this._containerOrder = [];
  }

  // ══════════════════════════════════════════════════════════════
  // OUTPUT TICKER
  // ══════════════════════════════════════════════════════════════

  createMiniOutputTicker() {
    const tg = this.add.graphics();
    tg.fillStyle(0x050914, 0.9);
    tg.fillRect(OX + 8, TICKER_Y - 8, OW - 16, 16);
    this.tickerText = this.add.text(OX + 14, TICKER_Y, "", { font: "bold 10px Courier New", color: HEX_GREEN_BRIGHT }).setOrigin(0, 0.5);
    this.rigLayer.add([tg, this.tickerText]);
    this._tickerLines = [];
  }

  async printToTicker(text) {
    this._tickerLines.push(text);
    const joined = this._tickerLines.join(" ⏎ ");
    for (let i = this.tickerText.text.length; i <= joined.length; i++) {
      if (!this._alive) return;
      this.tickerText.setText(joined.slice(0, i));
      if (this.tickerText.width > OW - 26) this.tickerText.setFontSize(6.5);
      await this.delay(4);
    }
  }

  clearTicker() {
    this._tickerLines = [];
    if (this.tickerText) this.tickerText.setText("").setFontSize(8);
  }

  // ══════════════════════════════════════════════════════════════
  // MINI SCANNER CAMEO (Mission 5)
  // ══════════════════════════════════════════════════════════════

  createMiniScannerCameo() {
    this.tapeContainer = this.add.container(0, 0).setVisible(false);
    this.rigLayer.add(this.tapeContainer);
    this.tapeState = [];
  }

  activateScannerCameo() { this.tapeContainer.setVisible(true); }

  parkScannerCameo() {
    this.tapeContainer.setVisible(false);
    this.tapeContainer.removeAll(true);
    this.tapeState = [];
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
    const cellW = 5, x1 = OX + OW - 10;
    const totalW = Math.min(this.tapeState.length * cellW, 200);
    const startX = x1 - totalW;
    const bg = this.add.graphics();
    bg.fillStyle(0xe8f0e8, 0.85);
    bg.fillRoundedRect(startX - 3, TAPE_Y - 5, totalW + 6, 10, 3);
    this.tapeContainer.add(bg);
    this.tapeState.slice(-Math.floor(totalW / cellW)).forEach((cell, i) => {
      const x = startX + i * cellW + cellW / 2;
      const disp = cell.kind === "space" ? "␣" : cell.kind === "newline" ? "⏎" : cell.ch;
      const color = cell.kind === "space" ? "#c2185b" : cell.kind === "newline" ? "#7b1fa2" : "#2e7d32";
      const t = this.add.text(x, TAPE_Y, disp, { font: "bold 5.5px Courier New", color }).setOrigin(0.5);
      this.tapeContainer.add(t);
    });
  }

  evaluateNextToken(cells) {
    let j = 0;
    while (j < cells.length && (cells[j].kind === "space" || cells[j].kind === "newline")) j++;
    const tokenStart = j;
    while (j < cells.length && cells[j].kind !== "space" && cells[j].kind !== "newline") j++;
    const strValue = cells.slice(tokenStart, j).map((c) => c.ch).join("");
    return { rawValue: strValue, consumedCount: j };
  }

  async tapeConsumeVisual(count) {
    this.tapeState = this.tapeState.slice(count);
    this.renderMiniTape();
    await this.delay(35);
  }

  // ══════════════════════════════════════════════════════════════
  // MANIFEST STRIP / RESULT ROW
  // ══════════════════════════════════════════════════════════════

  createManifestStrip() {
    const g = this.add.graphics().setDepth(16);
    g.fillStyle(0x0f0a06, 0.92);
    g.fillRect(OX, MANIFEST_Y - 2, OW, 20);
    this.manifestStripText = this.add.text(OX + 8, MANIFEST_Y + 8, "", { font: "12px Arial", color: HEX_BRASS }).setOrigin(0, 0.5).setDepth(17);
    this.resultText = this.add.text(OX + OW - 8, MANIFEST_Y + 8, "—", { font: "bold 13px Courier New", color: HEX_GRAY }).setOrigin(1, 0.5).setDepth(17);
  }
  updateManifestStrip(text) { this.manifestStripText.setText(text); }

  updateResultRow(value, type) {
    if (!this.resultText) return;
    if (value === null) { this.resultText.setText("—").setColor(HEX_GRAY); return; }
    if (type === "crash") { this.resultText.setText("✗ ERROR").setColor(HEX_RED); return; }
    this.resultText.setText(`→ ${value}`).setColor(HEX_GOLD);
  }

  // ══════════════════════════════════════════════════════════════
  // TEST REPORT / MISSION BRIEF
  // ══════════════════════════════════════════════════════════════

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
    if (test.initialArray) return `[${test.initialArray.join(",")}]`.slice(0, 26);
    if (test.input) return `in: ${test.input.join(",")}`;
    return "";
  }

  buildReportRows(mission) {
    this.reportRows.forEach((r) => r.container.destroy());
    this.reportRows = [];
    mission.tests.forEach((test, i) => {
      const y = RY + 24 + i * 24;
      const c = this.add.container(RX + 10, y).setDepth(11).setAlpha(0.35);
      const inputT = this.add.text(0, 0, this._compactTestLabel(test), { font: "11px Courier New", color: "#b0bec5" }).setOrigin(0, 0.5);
      const expT = this.add.text(190, 0, test.expectedOutput.slice(0, 22), { font: "11px Courier New", color: "#78909c" }).setOrigin(0, 0.5);
      const statusT = this.add.text(RW - 24, 0, "…", { font: "15px Arial", color: "#78909c" }).setOrigin(0.5);
      c.add([inputT, expT, statusT]);
      this.reportRows.push({ container: c, statusT });
    });
  }

  updateReportRow(index, pass) {
    const row = this.reportRows[index];
    if (!row) return;
    row.container.setAlpha(1);
    row.statusT.setText(pass ? "✓" : "✗").setColor(pass ? HEX_GREEN_BRIGHT : HEX_RED);
    if (!pass) this.tweens.add({ targets: row.container, x: row.container.x + 3, duration: 35, yoyo: true, repeat: 5 });
  }

  createMissionBriefPanel() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0a1208, 1);
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
    const brief = this.add.text(BX + 14, BY + 42, mission.brief, { font: "10.5px Arial", color: "#90a4ae", wordWrap: { width: BW - 28 } }).setOrigin(0, 0);
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
    g.fillStyle(0x081008, 0.93);
    g.fillRect(0, 0, W, 64);
    g.lineStyle(1, 0x2a3654, 1);
    g.lineBetween(0, 64, W, 64);

    this.add.text(20, 14, "THE ARRANGEMENT WORKSHOP", { font: "bold 15px Georgia", color: "#b0bec5" }).setDepth(51);
    this.add.text(20, 32, "Restructuring Phase — Arrays Methods: sort()", { font: "12px Arial", color: "#546e7a" }).setDepth(51);

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
      const lg = this.add.graphics({ x: 1150 + i * 20, y: 24 }).setDepth(51);
      lg.lineStyle(2, C_BRASS, 1);
      lg.strokeRoundedRect(-5, -6, 10, 12, 2);
      lg.lineBetween(-6, -6, 6, -6);
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
      this.tweens.add({ targets: m.g, alpha: 0.5, duration: 600, yoyo: true, repeat: -1 });
    }
  }

  // ══════════════════════════════════════════════════════════════
  // BIT — HEAD ARRANGER VARIANT (clipboard-ruler, green armband)
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
    const armband = this.add.rectangle(-16, 6, 8, 5, C_PATINA, 0.6).setAngle(8);
    const gloveL = this.add.circle(-16, 10, 4, 0xffffff, 0).setStrokeStyle(1, 0xe8eaf6, 0.7);
    const clipboard = this.add.container(17, 4);
    const cbG = this.add.graphics();
    cbG.lineStyle(2, C_BRASS, 0.9);
    cbG.lineBetween(0, -10, 0, 12);
    cbG.fillStyle(C_BRASS, 0.8);
    cbG.fillRect(-2, -12, 4, 4);
    for (let t = -8; t <= 10; t += 4) cbG.lineBetween(0, t, 2, t);
    clipboard.add(cbG);
    c.add([g, frock, eye, pupil, armband, gloveL, clipboard, tip]);
    this.tweens.add({ targets: tip, alpha: 0.3, duration: 850, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: c, y: "+=3", duration: 1900, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
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
    await this.bitSay("The Arrangement Workshop, Arranger — where raw collections become sorted publications. You've predicted sort's behavior and drilled its traps; tonight you BUILD the workflows that sort, extract, and report. Every mission publishes a real result from a real arrangement.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(5500)]); if (!A()) return;
    this.hideBubble();

    const a1 = this.floatingAnnotation(CX + CW / 2, CY - 16, "the workflow", HEX_CYAN);
    await this.delay(400); if (!A()) return;
    const a2 = this.floatingAnnotation(PX + PW / 2, PY - 12, "blocks — one forgets the sort, one reads the wrong moment", HEX_GRAY);
    await this.delay(400); if (!A()) return;
    const a3 = this.floatingAnnotation(OX + OW / 2, OY - 12, "engine, plaque, and the receipt — LIVE", HEX_GREEN_BRIGHT);
    await this.delay(400); if (!A()) return;
    const a4 = this.floatingAnnotation(880, 36, "stamps when we publish", HEX_GOLD);
    await this.delay(400); if (!A()) return;
    const a5 = this.floatingAnnotation(RX + RW / 2, RY - 12, "every scenario must verify", HEX_BLUE_GRAY);
    await this.delay(400); if (!A()) return;

    await this.bitSay("The workshop's three laws: sort first, then read — never the reverse; sort is void — don't capture it, USE it; and the original order dies with the sort — snapshot what you need before the engine touches it. Build, run, verify, repair.");
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
    const desc = this.add.text(-225, -35, mission.brief, { font: "12.5px Arial", color: "#b0bec5", wordWrap: { width: 460 } }).setOrigin(0, 0);

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

    this.tabFilename.setText(`Arrange${mission.mission}.java`);
    this.renderSkeleton(mission);
    this.populatePalette(mission);
    this.buildReportRows(mission);
    this.renderMissionBrief(mission);
    this.disableRunButton();
    this.highlightCodeLine(null);
    this.verdictLamp.setFillStyle(C_GRAY);
    this.clearMiniTray();
    this.clearPlaque();
    this.clearBeforeAfterStrip();
    this.clearContainers();
    this.clearTicker();
    this.parkScannerCameo();
    this.updateManifestStrip("");
    this.updateResultRow(null, null);
    this.pulseStamp("idle");

    if (mission.isCrossWing) this.activateScannerCameo();

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

  /** Substitutes the "<type>[] name = /* populated by test *​/;" placeholder
   * with a real array literal (or "new type[N]" for Mission 5's Scanner
   * pattern, which needs no substitution — it's already concrete). */
  _substituteTestLine(line, test) {
    const m = line.match(/^(int|String|double)\[\]\s+(\w+)\s*=\s*\/\*\s*populated by test\s*\*\/;$/);
    if (!m) return line;
    const type = m[1], name = m[2];
    if (!test.initialArray || name !== test.arrayName) return line;
    const literal = type === "String"
      ? `{${test.initialArray.map((v) => `"${v}"`).join(", ")}}`
      : `{${test.initialArray.join(", ")}}`;
    return `${type}[] ${name} = ${literal};`;
  }

  // ══════════════════════════════════════════════════════════════
  // UNIFIED INTERPRETER — sort() (real in-place mutation, void return),
  // toString (real scan + cursed hash for bare/instance calls), bracket
  // access (arithmetic index expressions: length, length-N, length/N,
  // (length-N)/M — real IndexOutOfBounds on overreach), pre-sort String
  // snapshots, Scanner.nextInt() intake, println concatenation/
  // arithmetic. Never scripted outcomes.
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

  /** Splits a top-level " - " (whitespace-flanked, bracket/paren-depth-
   * aware) for range expressions like "max - min" or
   * "data[data.length - 1] - data[0]" — never fires INSIDE a bracket
   * (the "- 1" inside a.length - 1 sits at depth 1). MUST be checked
   * before any anchored-whole-string bracket-match regex, since a
   * greedy bracket regex would otherwise swallow a compound expression
   * that merely STARTS with a bracket read. */
  _splitTopMinus(expr) {
    let depth = 0;
    for (let i = 1; i < expr.length - 1; i++) {
      const ch = expr[i];
      if (ch === "(" || ch === "[") depth++;
      else if (ch === ")" || ch === "]") depth--;
      else if (ch === "-" && depth === 0 && expr[i - 1] === " " && expr[i + 1] === " ") {
        return [expr.slice(0, i).trim(), expr.slice(i + 1).trim()];
      }
    }
    return null;
  }

  /** Strips one layer of fully-wrapping parentheses, e.g. "(max - min)"
   * → "max - min". Only strips if the FIRST "(" is the one that closes
   * at the very LAST character (a true wrap, not "(a) - (b)"). */
  _stripOuterParens(t) {
    if (t[0] !== "(" || t[t.length - 1] !== ")") return null;
    let depth = 0;
    for (let i = 0; i < t.length; i++) {
      if (t[i] === "(") depth++;
      else if (t[i] === ")") { depth--; if (depth === 0 && i !== t.length - 1) return null; }
    }
    return t.slice(1, -1).trim();
  }

  /** Resolves a bracket index expression: a literal (possibly negative)
   * integer, arr.length, arr.length - N, arr.length / N,
   * arr.length / N - M, (arr.length - N) / M, or a plain int variable —
   * the exact vocabulary this level's median/extremes patterns need. */
  async _resolveIndexExpr(idxExpr, vars) {
    const t = idxExpr.trim();
    if (/^-?\d+$/.test(t)) return { ok: true, value: parseInt(t, 10) };

    let m = t.match(/^\((\w+)\.length\s*-\s*(\d+)\)\s*\/\s*(\d+)$/);
    if (m) {
      const arr = vars[m[1]];
      if (!arr || arr.kind !== "array") return { ok: false, crash: "eval" };
      return { ok: true, value: Math.floor((arr.values.length - parseInt(m[2], 10)) / parseInt(m[3], 10)) };
    }
    m = t.match(/^(\w+)\.length\s*\/\s*(\d+)\s*-\s*(\d+)$/);
    if (m) {
      const arr = vars[m[1]];
      if (!arr || arr.kind !== "array") return { ok: false, crash: "eval" };
      return { ok: true, value: Math.floor(arr.values.length / parseInt(m[2], 10)) - parseInt(m[3], 10) };
    }
    m = t.match(/^(\w+)\.length\s*\/\s*(\d+)$/);
    if (m) {
      const arr = vars[m[1]];
      if (!arr || arr.kind !== "array") return { ok: false, crash: "eval" };
      return { ok: true, value: Math.floor(arr.values.length / parseInt(m[2], 10)) };
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
    if (vars[t] !== undefined && vars[t].kind !== "array") return { ok: true, value: vars[t].value };
    return { ok: false, crash: "eval" };
  }

  async resolveExpr(expr, vars) {
    const t = expr.trim();

    const outer = this._stripOuterParens(t);
    if (outer !== null) return await this.resolveExpr(outer, vars);

    const atsMatch = t.match(/^Arrays\.toString\((\w+)\)$/);
    if (atsMatch) {
      const arr = vars[atsMatch[1]];
      if (!arr || arr.kind !== "array") return { ok: false, crash: "eval" };
      const result = await this.runToStringScan(arr.values, arr.type);
      this.updateManifestStrip(`Arrays.toString(${atsMatch[1]})`);
      this.updateResultRow(result, "String");
      return { ok: true, value: result, type: "String" };
    }

    const instToStringMatch = t.match(/^(\w+)\.toString\(\)$/);
    if (instToStringMatch) {
      const arr = vars[instToStringMatch[1]];
      if (arr && arr.kind === "array") {
        const hash = await this.showCursedLabel(arr.type);
        this.updateManifestStrip(`${instToStringMatch[1]}.toString()`);
        this.updateResultRow(hash, "String");
        return { ok: true, value: hash, type: "String" };
      }
    }

    // Top-level +/- splits MUST run before the bracket-access match
    // below: a bracket-match regex anchored on the WHOLE string is
    // greedy, so a compound expression that merely STARTS with a
    // bracket read (e.g. "data[data.length - 1] - data[0]") would
    // otherwise be wrongly parsed as one single bracket access.
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

    const minusParts = this._splitTopMinus(t);
    if (minusParts) {
      const l = await this.resolveExpr(minusParts[0], vars);
      if (!l.ok) return l;
      const r = await this.resolveExpr(minusParts[1], vars);
      if (!r.ok) return r;
      return { ok: true, value: Number(l.value) - Number(r.value), type: "int" };
    }

    const bracketMatch = t.match(/^(\w+)\[(.+)\]$/);
    if (bracketMatch) {
      const arr = vars[bracketMatch[1]];
      if (!arr || arr.kind !== "array") return { ok: false, crash: "eval" };
      const idxExpr = bracketMatch[2].trim();
      const idxRes = await this._resolveIndexExpr(idxExpr, vars);
      if (!idxRes.ok) return idxRes;
      const idx = idxRes.value;
      if (idx < 0 || idx >= arr.values.length) { await this.crashIOOBE(idx); return { ok: false, crash: "ioobe" }; }
      const value = await this.bracketAccessGhost(idx);
      this.updateManifestStrip(`${bracketMatch[1]}[${idxExpr}]`);
      const elemType = arr.type === "String[]" ? "String" : arr.type.replace("[]", "");
      this.updateResultRow(value, elemType);
      return { ok: true, value, type: elemType };
    }

    const lengthMatch = t.match(/^(\w+)\.length$/);
    if (lengthMatch) {
      const arr = vars[lengthMatch[1]];
      if (!arr || arr.kind !== "array") return { ok: false, crash: "eval" };
      this.updateResultRow(arr.values.length, "int");
      return { ok: true, value: arr.values.length, type: "int" };
    }

    if (/^".*"$/.test(t)) return { ok: true, value: t.slice(1, -1), type: "String" };
    if (/^-?\d+\.\d+$/.test(t)) return { ok: true, value: parseFloat(t), type: "double" };
    if (/^-?\d+$/.test(t)) return { ok: true, value: parseInt(t, 10), type: "int" };

    if (vars[t] !== undefined) {
      const v = vars[t];
      if (v.kind === "array") {
        const hash = await this.showCursedLabel(v.type);
        this.updateManifestStrip(t);
        this.updateResultRow(hash, "String");
        return { ok: true, value: hash, type: "String" };
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

  async execStatement(line, vars) {
    const arrLiteral = line.match(/^(int|String|double)\[\]\s+(\w+)\s*=\s*\{(.*)\}\s*;$/);
    if (arrLiteral) {
      const baseType = arrLiteral[1], name = arrLiteral[2];
      const type = `${baseType}[]`;
      const values = this._parseArrayInit(`{${arrLiteral[3]}}`, type);
      vars[name] = { kind: "array", values, type };
      await this.populateMiniTray(values, type);
      return { ok: true };
    }

    const arrNew = line.match(/^(int|String|double)\[\]\s+(\w+)\s*=\s*new\s+(?:int|String|double)\[(\d+)\]\s*;$/);
    if (arrNew) {
      const baseType = arrNew[1], name = arrNew[2], size = parseInt(arrNew[3], 10);
      const type = `${baseType}[]`;
      const values = new Array(size).fill(baseType === "String" ? "" : 0);
      vars[name] = { kind: "array", values, type };
      await this.populateMiniTray(values, type);
      return { ok: true };
    }

    // sort's return is void — ANY attempt to capture it is a compile error.
    if (/=\s*Arrays\.sort\(/.test(line)) {
      await this.haltEngine();
      return { ok: false, crash: "compile" };
    }

    // arr.sort() / arr.toString() as a BARE STATEMENT (not inside an
    // expression) — only .sort() is illegal (arrays have no instance
    // sort method at all); a bare .toString() statement is legal but
    // discards its own hash result, so it's handled generically below.
    const instSortStmt = line.match(/^(\w+)\.sort\(\)\s*;$/);
    if (instSortStmt && vars[instSortStmt[1]] && vars[instSortStmt[1]].kind === "array") {
      this.showCompileErrorStamp();
      await this.delay(400);
      return { ok: false, crash: "compile" };
    }

    // "String x = data;" — direct assignment of a raw array reference
    // to a String variable is a genuine compile error (incompatible
    // types), DISTINCT from "String x = data.toString();" or
    // "String x = Arrays.toString(data);", both of which are legal
    // method calls that happen to return a (possibly useless) String.
    const declVarPre = line.match(/^(int|double|String)\s+(\w+)\s*=\s*(.*);$/);
    if (declVarPre) {
      const varType = declVarPre[1], name = declVarPre[2], rhs = declVarPre[3].trim();
      if (varType === "String" && vars[rhs] && vars[rhs].kind === "array") {
        this.showCompileErrorStamp();
        await this.delay(400);
        return { ok: false, crash: "compile" };
      }
      if (rhs === "sc.nextLine()") {
        this.showCompileErrorStamp();
        await this.delay(400);
        return { ok: false, crash: "compile" };
      }
      const r = await this.resolveExpr(rhs, vars);
      if (!r.ok) return r;
      vars[name] = { value: r.value, type: varType, kind: "scalar" };
      this.miniDispenseTo(name, r.value, varType);
      return { ok: true };
    }

    const bracketAssign = line.match(/^(\w+)\[(\d+)\]\s*=\s*(.+);$/);
    if (bracketAssign) {
      const name = bracketAssign[1], idx = parseInt(bracketAssign[2], 10), rhsVal = bracketAssign[3].trim();
      const arr = vars[name];
      if (rhsVal === "sc.nextInt()") {
        this.updateManifestStrip(`${name}[${idx}] = sc.nextInt()`);
        const read = this.evaluateNextToken(this.tapeState);
        await this.tapeConsumeVisual(read.consumedCount);
        const value = parseInt(read.rawValue, 10) || 0;
        if (arr && arr.kind === "array") { arr.values[idx] = value; this._updateMiniSpecimenCard(idx, value); }
        await this.delay(50);
        return { ok: true };
      }
      if (rhsVal === "sc.nextLine()") {
        this.showCompileErrorStamp();
        await this.delay(400);
        return { ok: false, crash: "compile" };
      }
      if (arr && arr.kind === "array") {
        const newVal = /^-?\d+(\.\d+)?$/.test(rhsVal) ? parseFloat(rhsVal) : rhsVal.replace(/^"(.*)"$/, "$1");
        arr.values[idx] = newVal;
        this._updateMiniSpecimenCard(idx, newVal);
      }
      return { ok: true };
    }

    /** The bare Arrays.sort(name); statement — the ONLY legal shape for
     * sort. Sorts the array's actual values in place (numeric
     * comparator for numbers; JS's default natural-Unicode comparator
     * for Strings) and runs the honest choreography before/after. */
    const sortMatch = line.match(/^Arrays\.sort\((\w+)\)\s*;$/);
    if (sortMatch) {
      const arr = vars[sortMatch[1]];
      if (arr && arr.kind === "array") {
        const before = arr.values.slice();
        if (arr.type === "String[]") arr.values.sort();
        else arr.values.sort((a, b) => a - b);
        const after = arr.values.slice();
        await this.runSortAnimation(before, after);
        this.showVoidAnnotation();
        this.showBeforeAfter(before, after);
        this.updateManifestStrip(`Arrays.sort(${sortMatch[1]})`);
        this.updateResultRow("void", null);
      }
      return { ok: true };
    }

    const bareToStringStmt = line.match(/^(\w+)\.toString\(\)\s*;$/);
    if (bareToStringStmt) {
      const name = bareToStringStmt[1];
      if (vars[name] && vars[name].kind === "array") {
        const hash = await this.showCursedLabel(vars[name].type);
        this.updateManifestStrip(`${name}.toString()`);
        this.updateResultRow(hash, "String");
      }
      return { ok: true };
    }

    const printMatch = line.match(/^System\.out\.println\((.*)\);$/);
    if (printMatch) {
      this.updateManifestStrip("System.out.println(…)");
      const r = await this.evalPrintArg(printMatch[1].trim(), vars);
      if (!r.ok) return r;
      if (!this._printedLines) this._printedLines = [];
      this._printedLines.push(r.value);
      await this.printToTicker(r.value);
      return { ok: true };
    }

    return { ok: true };
  }

  async runProgram(lines) {
    const vars = {};
    for (let li = 0; li < lines.length; li++) {
      const tt = lines[li].trim();
      if (tt && !tt.startsWith("//") && !/^Scanner sc/.test(tt)) { this.highlightCodeLine(li); break; }
    }
    for (let i = 0; i < lines.length; i++) {
      if (!this._alive) return { ok: true };
      const raw = lines[i];
      const t = raw.trim();
      if (!t || t.startsWith("//")) continue;
      if (/^Scanner sc = new Scanner/.test(t)) continue;

      this.highlightCodeLine(i);
      const r = await this.execStatement(raw, vars);
      if (!r.ok) { this.highlightCodeLine(null); return r; }
      if (i + 1 < lines.length) this.highlightCodeLine(i + 1);
    }
    this.highlightCodeLine(null);
    return { ok: true };
  }

  // ══════════════════════════════════════════════════════════════
  // PROACTIVE-METRIC DETECTION
  // ══════════════════════════════════════════════════════════════

  _recordFirstRunMetrics(mission, passed) {
    const key = `mission${mission.mission}`;
    if (this._firstRunMetricsRecorded[key]) return;
    this._firstRunMetricsRecorded[key] = true;

    if (mission.isPreSortFlagship) {
      this.preSortProactive[key] = this._slotCode("capture") === "Arrays.toString(data)";
    }
    if (mission.mission === 2) {
      this.extremesClean[key] = this._slotCode("min") === "data[0]" && this._slotCode("max") === "data[data.length - 1]";
    }
    if (mission.isStatSummary) {
      this.extremesClean[key] = this._slotCode("min") === "data[0]" && this._slotCode("max") === "data[data.length - 1]";
    }
    if (mission.isCrossWing) this.crossWingClean[key] = passed;
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

  _pulseWrongBlocks() {
    for (const id in this.slotContents) {
      const placed = this.slotContents[id] && this.slotContents[id][0];
      if (!placed || !placed.container.getData("tag")) continue;
      const c = placed.container;
      const draw = c.getData("draw");
      if (draw) draw(C_RED);
      this.tweens.add({ targets: c, x: c.x + 4, duration: 40, yoyo: true, repeat: 5 });
      this.time.delayedCall(1400, () => { if (c.active && draw) draw(C_BRASS); });
    }
  }

  async onRunPressed() {
    if (this.inputLocked) return;
    this.inputLocked = true;
    this.disableRunButton();
    this.runButton.t.setText("...");
    this.runCount++;
    this.pulseStamp("session");
    const mission = MISSIONS[this.currentMission];
    const isFirstRun = this.runCount === this._runCountAtMissionStart + 1;
    const assembled = this.getAssembledCode();
    const wrongBlocksUsed = this._collectWrongBlocksUsed();

    const items = this.buildProgramItems(mission, assembled);

    let anyMismatch = false, anyCrash = false;
    const failedTests = [];
    for (let i = 0; i < mission.tests.length; i++) {
      if (!this._alive) return;
      const test = mission.tests[i];
      const outcome = await this.runTestCase(mission, test, i, items);
      if (!outcome.pass) { anyMismatch = true; failedTests.push(this._compactTestLabel(test)); }
      if (outcome.crashed) anyCrash = true;
    }

    if (isFirstRun) this._recordFirstRunMetrics(mission, !anyMismatch);
    const resultKind = anyMismatch ? (anyCrash ? "runtime_crash" : "logic_fail") : "pass";
    this._resolveRunOutcome(mission, resultKind, wrongBlocksUsed, failedTests);
  }

  async runTestCase(mission, test, index, items) {
    this.clearMiniTray();
    this.clearPlaque();
    this.clearBeforeAfterStrip();
    this.clearContainers();
    this.clearTicker();
    this.updateManifestStrip("");
    this.updateResultRow(null, null);

    if (mission.isCrossWing) { this.parkScannerCameo(); this.activateScannerCameo(); this.loadMiniTape(test.input); }

    this._printedLines = [];
    const execLines = items.map((it) => this._substituteTestLine(it.text, test));
    const runResult = await this.runProgram(execLines);
    if (!this._alive) return { pass: false, crashed: false };

    const output = this._printedLines.join("⏎");
    const pass = runResult.ok && output === test.expectedOutput;
    this.verdictLamp.setFillStyle(pass ? C_GREEN_BRIGHT : C_RED);
    this.updateReportRow(index, pass);
    await this.delay(200);
    return { pass, crashed: !runResult.ok };
  }

  _shouldShowPostMissionNote() { return true; }

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
      console.warn("Level67Scene: /api/wellbeing/predict-struggle unreachable, skipping behavioral signal for this level:", e);
    }
  }

  _resolveRunOutcome(mission, result, wrongBlocksUsed, failedTests) {
    const timeMs = Math.round(this.time.now - this.missionStartTime);
    this.attemptLog.push({
      mission: mission.mission, runNumber: this.runCount, result,
      blocksUsed: Object.values(this.getAssembledCode()).flat().map((b) => b.code),
      wrongBlocks: wrongBlocksUsed, failedTests, timeMs, hintUsedBefore: this.missionHintUsed,
    });

    if (result === "pass") { this.onMissionComplete(); return; }

    this.pulseStamp("idle");
    this.failedRunCount++;
    this.missionRunsFailed++;
    this.runButton.t.setText("▶ RUN");
    this._pulseWrongBlocks();

    let livesLostThisRun = false;
    const tagsThisRun = new Set(wrongBlocksUsed.map((b) => b.tag));
    tagsThisRun.forEach((tag) => {
      if (!tag) return;
      this.wrongBlockHistory[tag] = (this.wrongBlockHistory[tag] || 0) + 1;
      if (this.wrongBlockHistory[tag] >= 2) livesLostThisRun = true;
    });

    const feedbackTag = wrongBlocksUsed[0] && wrongBlocksUsed[0].tag;

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
    this.pulseStamp("gold");

    this.missionFanfare().then(() => {
      if (!this._alive || this.gameEnded) return;
      const next = this.currentMission + 1;
      if (next >= MISSIONS.length) this.levelComplete();
      else this.showProjectBriefing(next);
    });
  }

  async missionFanfare() {
    this.verdictLamp.setFillStyle(C_GREEN_BRIGHT);
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
    if (this._workOrderPins[this.currentMission]) this._workOrderPins[this.currentMission].setFillStyle(C_GREEN_BRIGHT, 0.9);
    const mission = MISSIONS[this.currentMission];
    if (this._shouldShowPostMissionNote(mission)) {
      await this.bitSay(mission.postMissionNote || "Clean certification — the rig confirms it.");
      await Promise.race([this.waitForClick(), this.delay(2400)]);
      this.hideBubble();
    }
    await this.delay(400);
  }

  // ══════════════════════════════════════════════════════════════
  // SCORING & LIVES
  // ══════════════════════════════════════════════════════════════

  updateScore(points) {
    this.score = Math.max(0, this.score + points);
    this.scoreText.setText(String(this.score));
  }

  loseLife() {
    this.lives = Math.max(0, this.lives - 1);
    const icon = this.lifeIcons[this.lives];
    if (icon) this.tweens.add({ targets: icon, alpha: 0.12, duration: 320 });
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

    (async () => {
      this.clearMiniTray();
      this.clearPlaque();
      this.clearBeforeAfterStrip();
      this.clearContainers();
      this.clearTicker();
      this.parkScannerCameo();
      this._toolRackIcons.forEach((t) => this.tweens.add({ targets: t, alpha: 0.1, duration: 500 }));
      this._qaStamp.c.setAlpha(0.1);
      const motes = this.ambient;
      this.ambient = null;
      (motes || []).forEach((m) => this.tweens.add({ targets: m, y: 632, alpha: 0, duration: 1500, ease: "Sine.easeIn" }));

      const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
      this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });
      const title = this.add.text(640, 240, "WORKSHOP CLOSED", { font: "bold 34px Georgia", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
      this.tweens.add({ targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut", onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }) });
      this.add.text(640, 310, `Score: ${this.score}`, { font: "21px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
      this.add.text(640, 350, `Missions Published: ${this.currentMission} / 6`, { font: "18px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);
      this._makeButton(525, 420, "REOPEN THE WORKSHOP", 200, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
      this._makeButton(755, 420, "RETURN TO MENU", 200, 50, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.start("MenuScene"));
    })();
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearMission();
    this.hideBubble();

    try { GameManager.completeLevel(66, Math.round((this.flawlessCount / MISSIONS.length) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("arrays_sort_restructured"); } catch (_) {}
    try {
      localStorage.setItem("level67_results", JSON.stringify({
        level: 67, concept: "arrays_sort", phase: "restructuring",
        score: this.score, missionsCompleted: 6, flawlessMissions: this.flawlessCount,
        totalRuns: this.runCount, failedRuns: this.failedRunCount, hintsUsed: this.hintCount,
        selfCorrections: this.selfCorrectionCount,
        preSortCaptureProactive: this.preSortProactive,
        extremesPatternClean: this.extremesClean,
        crossWingCleanFirstRun: this.crossWingClean,
        livesRemaining: this.lives, attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.triggerTrilogyFinale();
  }

  async triggerTrilogyFinale() {
    const stampC = this._qaStamp.c;
    await new Promise((res) => { this.tweens.add({ targets: stampC, x: 640, y: 280, scale: 2.2, duration: 700, ease: "Sine.easeInOut", onComplete: res }); });
    this.screenShake(0.006, 180);
    this._qaStamp.g.clear();
    this._qaStamp.g.lineStyle(2, C_GOLD, 1);
    this._qaStamp.g.strokeCircle(0, 0, 18);
    this._qaStamp.t.setColor(HEX_GOLD);
    this.createConfetti(640, 280, 40);
    this._workOrderPins.forEach((p) => p.setFillStyle(C_GREEN_BRIGHT, 0.95));
    if (this._finishedShelfTrays[2]) {
      const extraTray = this.add.rectangle(1190, 118 + 3 * 26, 40, 8, 0x0a1208, 0.5).setStrokeStyle(1, C_GOLD, 0.8).setDepth(3).setAlpha(0);
      this.tweens.add({ targets: extraTray, alpha: 1, duration: 400 });
    }
    this._toolRackIcons.forEach((t) => this.tweens.add({ targets: t, alpha: 0.8, duration: 400 }));
    await this.delay(500);
    if (!this._alive) return;

    await this.populateMiniTray([8, 3, 6, 1, 9, 2, 7, 4], "int[]");
    const before = [8, 3, 6, 1, 9, 2, 7, 4];
    const after = before.slice().sort((a, b) => a - b);
    await this.runSortAnimation(before, after);
    this.showVoidAnnotation();
    this.showBeforeAfter(before, after);
    this.createConfetti(MINI_CX, (MINI_TRAY_Y0 + MINI_TRAY_Y1) / 2, 26);
    await this.delay(500);
    if (!this._alive) return;

    await this.bitSay("Head Arranger — the trilogy closes. Accretion taught the mutation, Tuning drilled the reflex, Restructuring built the workflows. sort() is yours, completely.");
    await Promise.race([this.waitForClick(), this.delay(3000)]);
    this.hideBubble();
    if (!this._alive) return;

    this.showScoreTally();
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
    panel.fillStyle(0x0a1208, 1);
    panel.fillRoundedRect(350, 90, 580, 460, 16);
    panel.lineStyle(2, C_GOLD, 1);
    panel.strokeRoundedRect(350, 90, 580, 460, 16);

    const title = this.add.text(640, 122, "HEAD ARRANGER", { font: "bold 32px Georgia", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(91).setScale(0);
    this.tweens.add({ targets: title, scale: 1, duration: 350, ease: "Back.easeOut" });

    const lines = [
      "MISSIONS: 6/6",
      `FLAWLESS: ${this.flawlessCount}`,
      `SELF-CORRECTIONS: ${this.selfCorrectionCount}`,
      `PRE-SORT CAPTURE: ${this.preSortProactive.mission4 ? "✓" : "✗"}`,
      `EXTREMES CLEAN: ${[this.extremesClean.mission2, this.extremesClean.mission6].filter(Boolean).length}/2`,
      `CROSS-WING CLEAN: ${this.crossWingClean.mission5 ? "✓" : "✗"}`,
      `HINTS: ${this.hintCount}`,
    ];
    lines.forEach((s, i) => {
      const t = this.add.text(390, 168 + i * 22, s, { font: "12.5px Arial", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 250, delay: 300 + i * 120 });
    });
    const totalText = this.add.text(390, 168 + lines.length * 22, "TOTAL: 0", { font: "bold 21px Arial", color: HEX_GOLD }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: totalText, alpha: 1, duration: 250, delay: 900 });
    const counter = { v: 0 };
    this.tweens.add({ targets: counter, v: this.score, duration: 1000, delay: 900, onUpdate: () => totalText.setText(`TOTAL: ${Math.round(counter.v)}`) });

    const stars = this._starRating();
    for (let i = 0; i < 3; i++) {
      const earned = i < stars;
      const s = this.add.text(640 + (i - 1) * 50, 400, "★", { font: "34px Arial", color: earned ? HEX_GOLD : "#2a3040" }).setOrigin(0.5).setDepth(91).setScale(0);
      this.tweens.add({ targets: s, scale: 1, duration: 250, delay: 1500 + i * 200, ease: earned ? "Back.easeOut" : "Cubic.easeOut" });
    }

    // Trilogy badge — tray+plaque (toString), engine+arm (sort), clipboard (restructure)
    const badge = this.add.container(640, 450).setDepth(91).setAlpha(0);
    const bg = this.add.graphics();
    bg.lineStyle(3, C_GOLD, 1);
    bg.strokeCircle(0, 0, 34);
    const icon1 = this.add.text(-16, 0, "▭", { font: "14px Arial", color: HEX_GOLD }).setOrigin(0.5);
    const icon2 = this.add.text(0, 0, "⚙", { font: "16px Arial", color: HEX_GOLD }).setOrigin(0.5);
    const icon3 = this.add.text(16, 0, "📋", { font: "14px Arial", color: HEX_GOLD }).setOrigin(0.5);
    badge.add([bg, icon1, icon2, icon3]);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 0 });
    const badgeLbl = this.add.text(640, 492, "sort() MASTERY", { font: "bold 15px Georgia", color: HEX_GOLD }).setOrigin(0.5).setDepth(91).setAlpha(0);
    const badgeSub = this.add.text(640, 508, "Accretion ✓  Tuning ✓  Restructuring ✓", { font: "11px Georgia", color: HEX_GRAY }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: [badgeLbl, badgeSub], alpha: 1, duration: 300, delay: 0 });

    // Arrays Wing progress
    const barX = 450, barY = 500, barW = 380, barH = 14;
    const progG = this.add.graphics().setDepth(91).setAlpha(0);
    progG.lineStyle(1, C_GRAY, 1);
    progG.strokeRoundedRect(barX, barY, barW, barH, 4);
    progG.fillStyle(0x5d7a5d, 1);
    progG.fillRoundedRect(barX, barY, barW * 0.67, barH, 4);
    const progLabel = this.add.text(640, barY + barH + 14, "ARRAYS WING — 2 of 3 trilogies complete", { font: "bold 13px Georgia", color: "#5d7a5d" }).setOrigin(0.5).setDepth(91).setAlpha(0);
    const tickLbl = this.add.text(640, barY - 10, "toString ✓   sort ✓ new   copyOf", { font: "11px Courier New", color: HEX_GRAY }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: [progG, progLabel, tickLbl], alpha: 1, duration: 300, delay: 2400 });

    this._makeButton(430, 528, "RETRY", 130, 40, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart(), 95);
    this._makeButton(760, 528, "NEXT: copyOf() awaits →", 280, 40, { fill: 0x00733a, stroke: C_GREEN_BRIGHT, textColor: "#ffffff" }, () => {
      this.scene.start("MenuScene");
    }, 95);
  }

  _makeButton(x, y, label, w, h, style, onClick, depth = 95) {
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
    if (t.width > w - 16) t.setFontSize(10);
    c.add([g, t]);
    c.setSize(w, h);
    c.setInteractive({ useHandCursor: true });
    c.on("pointerover", () => { draw(true); c.setScale(1.04); });
    c.on("pointerout", () => { draw(false); c.setScale(1); });
    c.on("pointerdown", onClick);
    return c;
  }
}
