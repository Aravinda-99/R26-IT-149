/**
 * Level 24 — "Array Forge" (Arrays: Restructuring Phase)
 * ========================================================
 * The learner constructs complete array-manipulation programs by dragging
 * code blocks (loop headers, body statements, standalone statements) into
 * an IDE-style editor with blank slots. Clicking "Forge Data" compiles and
 * runs the program: array cells update live, a console types the output,
 * and a bespoke visual animation plays for each of 8 real-world projects.
 *
 * No multiple choice — correctness is judged by exactly matching each
 * slot's canonical block. A small expression interpreter (used only on the
 * incorrect path) evaluates whatever blocks the player actually placed, so
 * wrong answers get an authentic "actual output" (including simulated
 * ArrayIndexOutOfBoundsException crashes) for the diff view.
 *
 * Authored in a 1280x720 world space; the shared game canvas is 800x600
 * (Scale.NONE), so the main camera is zoomed to letterbox-fit the forge
 * into whatever canvas size is active (same approach as Level22/23).
 */

import Phaser from "phaser";
import { GameManager } from "../../GameManager.js";
import { BadgeSystem } from "../../BadgeSystem.js";

const W = 1280, H = 720;

const C_CYAN = 0x00e5ff, C_AMBER = 0xffd740, C_GREEN = 0x00e676;
const C_RED = 0xf44336, C_GRAY = 0x78909c, C_MAGENTA = 0xff4081;
const C_ORANGE = 0xff6e00, C_EMBER = 0xff8f00;
const HEX_CYAN = "#00e5ff", HEX_AMBER = "#ffd740", HEX_GREEN = "#00e676";
const HEX_RED = "#f44336", HEX_GRAY = "#78909c", HEX_MAGENTA = "#ff4081";
const HEX_ORANGE = "#ff6e00";

const CAT_COLOR = { loop: C_MAGENTA, body: C_GRAY, statement: C_CYAN };
const CAT_HEX = { loop: HEX_MAGENTA, body: HEX_GRAY, statement: HEX_CYAN };
const CAT_LABEL = { loop: "drag loop block", body: "drag body block", statement: "drag statement" };

// Layout geometry
const EX = 18, EY = 62, EW = 615, EH = 480;
const VX = 648, VY = 62, VW = 622, VH = 480;
const TX = 18, TY = 555, TW = 1244, TH = 105;
const GUTTER_W = 36, TAB_H = 30, CODE_PAD = 10;
const CODE_X = EX + GUTTER_W + CODE_PAD;
const CODE_Y0 = EY + TAB_H + 12;
const LINE_H = 20;

// ─────────────────────────────────────────────────────────────────
// Project configuration
// ─────────────────────────────────────────────────────────────────
const PROJECTS = [
  { id: 1, title: "Print All Elements", filename: "PrintAll.java",
    briefing: "Print every element of the scores array.",
    expectedOutput: "85\n92\n78\n95\n88",
    array: { name: "scores", values: [85, 92, 78, 95, 88] },
    preCode: ["public class PrintAll {", "    public static void main(String[] args) {", "        int[] scores = {85, 92, 78, 95, 88};"],
    postCode: ["    }", "}"],
    slots: [
      { key: "loop", type: "loop", correct: "for(int i=0; i<scores.length; i++)" },
      { key: "body", type: "body", correct: "System.out.println(scores[i]);" },
    ],
    blocks: [
      { text: "for(int i=0; i<scores.length; i++)", category: "loop" },
      { text: "for(int i=0; i<=scores.length; i++)", category: "loop" },
      { text: "for(int i=1; i<scores.length; i++)", category: "loop" },
      { text: "System.out.println(scores[i]);", category: "body" },
      { text: "System.out.println(i);", category: "body" },
      { text: "System.out.println(scores.length);", category: "body" },
    ], visual: "highlight_traverse" },

  { id: 2, title: "Sum Calculator", filename: "ArraySum.java",
    briefing: "Calculate the sum of all elements.",
    expectedOutput: "Sum: 100",
    array: { name: "nums", values: [10, 25, 30, 15, 20] },
    preCode: ["public class ArraySum {", "    public static void main(String[] args) {", "        int[] nums = {10, 25, 30, 15, 20};", "        int sum = 0;"],
    postCode: ['        System.out.println("Sum: " + sum);', "    }", "}"],
    slots: [
      { key: "loop", type: "loop", correct: "for(int i=0; i<nums.length; i++)" },
      { key: "body", type: "body", correct: "sum += nums[i];" },
    ],
    blocks: [
      { text: "for(int i=0; i<nums.length; i++)", category: "loop" },
      { text: "for(int i=0; i<=nums.length; i++)", category: "loop" },
      { text: "sum += nums[i];", category: "body" },
      { text: "sum += i;", category: "body" },
      { text: "sum = nums[i];", category: "body" },
    ], visual: "crucible_pour" },

  { id: 3, title: "Find Maximum", filename: "FindMax.java",
    briefing: "Find the largest value in the temperature array.",
    expectedOutput: "Max: 41",
    array: { name: "temps", values: [28, 35, 22, 41, 33, 19] },
    preCode: ["public class FindMax {", "    public static void main(String[] args) {", "        int[] temps = {28, 35, 22, 41, 33, 19};", "        int max = temps[0];"],
    postCode: ['        System.out.println("Max: " + max);', "    }", "}"],
    slots: [
      { key: "loop", type: "loop", correct: "for(int i=1; i<temps.length; i++)" },
      { key: "body", type: "body", correct: "if(temps[i]>max) max=temps[i];" },
    ],
    blocks: [
      { text: "for(int i=1; i<temps.length; i++)", category: "loop" },
      { text: "for(int i=0; i<temps.length; i++)", category: "loop" },
      { text: "for(int i=0; i<=temps.length; i++)", category: "loop" },
      { text: "if(temps[i]>max) max=temps[i];", category: "body" },
      { text: "max = temps[i];", category: "body" },
      { text: "if(temps[i]<max) max=temps[i];", category: "body" },
    ], visual: "thermometer_bars" },

  { id: 4, title: "Count Target", filename: "CountTarget.java",
    briefing: "Count how many times the value 7 appears.",
    expectedOutput: "Count of 7: 4",
    array: { name: "data", values: [7, 3, 7, 9, 7, 2, 5, 7] },
    preCode: ["public class CountTarget {", "    public static void main(String[] args) {", "        int[] data = {7, 3, 7, 9, 7, 2, 5, 7};", "        int count = 0;"],
    postCode: ['        System.out.println("Count of 7: " + count);', "    }", "}"],
    slots: [
      { key: "loop", type: "loop", correct: "for(int i=0; i<data.length; i++)" },
      { key: "body", type: "body", correct: "if(data[i]==7) count++;" },
    ],
    blocks: [
      { text: "for(int i=0; i<data.length; i++)", category: "loop" },
      { text: "if(data[i]==7) count++;", category: "body" },
      { text: "if(data[i]==7) count=i;", category: "body" },
      { text: "count += data[i];", category: "body" },
      { text: "if(i==7) count++;", category: "body" },
    ], visual: "stamp_counter" },

  { id: 5, title: "Reverse Print", filename: "ReversePrint.java",
    briefing: "Print array elements in REVERSE order.",
    expectedOutput: "5\n4\n3\n2\n1",
    array: { name: "arr", values: [1, 2, 3, 4, 5] },
    preCode: ["public class ReversePrint {", "    public static void main(String[] args) {", "        int[] arr = {1, 2, 3, 4, 5};"],
    postCode: ["    }", "}"],
    slots: [
      { key: "loop", type: "loop", correct: "for(int i=arr.length-1; i>=0; i--)" },
      { key: "body", type: "body", correct: "System.out.println(arr[i]);" },
    ],
    blocks: [
      { text: "for(int i=arr.length-1; i>=0; i--)", category: "loop" },
      { text: "for(int i=arr.length; i>0; i--)", category: "loop" },
      { text: "for(int i=4; i>=0; i--)", category: "loop" },
      { text: "for(int i=0; i<arr.length; i++)", category: "loop" },
      { text: "System.out.println(arr[i]);", category: "body" },
      { text: "System.out.println(arr[arr.length-i]);", category: "body" },
    ], visual: "reverse_sweep" },

  { id: 6, title: "Calculate Average", filename: "Average.java",
    briefing: "Calculate the average score (integer division).",
    expectedOutput: "Average: 84",
    array: { name: "scores", values: [80, 90, 70, 85, 95] },
    preCode: ["public class Average {", "    public static void main(String[] args) {", "        int[] scores = {80, 90, 70, 85, 95};", "        int sum = 0;"],
    postCode: ["        int average = sum / scores.length;", '        System.out.println("Average: " + average);', "    }", "}"],
    slots: [
      { key: "loop", type: "loop", correct: "for(int i=0; i<scores.length; i++)" },
      { key: "body", type: "body", correct: "sum += scores[i];" },
    ],
    blocks: [
      { text: "for(int i=0; i<scores.length; i++)", category: "loop" },
      { text: "for(int i=1; i<=scores.length; i++)", category: "loop" },
      { text: "sum += scores[i];", category: "body" },
      { text: "sum += i;", category: "body" },
      { text: "sum = scores[i];", category: "body" },
      { text: "average += scores[i];", category: "body" },
    ], visual: "score_cards" },

  { id: 7, title: "Swap First and Last", filename: "SwapEnds.java",
    briefing: "Swap the first and last elements, then print all.",
    expectedOutput: "50\n20\n30\n40\n10",
    array: { name: "arr", values: [10, 20, 30, 40, 50] },
    preCode: ["public class SwapEnds {", "    public static void main(String[] args) {", "        int[] arr = {10, 20, 30, 40, 50};"],
    postCode: ["        for(int i = 0; i < arr.length; i++) {", "            System.out.println(arr[i]);", "        }", "    }", "}"],
    slots: [
      { key: "stmt1", type: "statement", correct: "int temp = arr[0];", order: 1 },
      { key: "stmt2", type: "statement", correct: "arr[0] = arr[arr.length-1];", order: 2 },
      { key: "stmt3", type: "statement", correct: "arr[arr.length-1] = temp;", order: 3 },
    ],
    blocks: [
      { text: "int temp = arr[0];", category: "statement" },
      { text: "int temp = arr[4];", category: "statement" },
      { text: "arr[0] = arr[arr.length-1];", category: "statement" },
      { text: "arr[0] = arr[arr.length];", category: "statement" },
      { text: "arr[arr.length-1] = temp;", category: "statement" },
      { text: "arr[arr.length] = temp;", category: "statement" },
      { text: "arr[0] = temp;", category: "statement" },
    ], visual: "swap_animation" },

  { id: 8, title: "Find and Report", filename: "FindValue.java",
    briefing: "Search for value 42. Print its index, or -1 if not found.",
    expectedOutput: "Found at: 2",
    array: { name: "data", values: [15, 8, 42, 23, 4, 67] },
    preCode: ["public class FindValue {", "    public static void main(String[] args) {", "        int[] data = {15, 8, 42, 23, 4, 67};", "        int result = -1;"],
    postCode: ['        System.out.println("Found at: " + result);', "    }", "}"],
    slots: [
      { key: "loop", type: "loop", correct: "for(int i=0; i<data.length; i++)" },
      { key: "body", type: "body", correct: "if(data[i]==42) result=i;" },
    ],
    blocks: [
      { text: "for(int i=0; i<data.length; i++)", category: "loop" },
      { text: "for(int i=0; i<=data.length; i++)", category: "loop" },
      { text: "if(data[i]==42) result=i;", category: "body" },
      { text: "if(data[i]==42) result=42;", category: "body" },
      { text: "if(i==42) result=data[i];", category: "body" },
      { text: "result = data[i];", category: "body" },
    ], visual: "scanner_search" },
];

const BIT_FEEDBACK = {
  wrong_loop_bound:   "Use i < arr.length to stay safe. i <= arr.length tries index [length] which is OUT OF BOUNDS!",
  index_not_value:    "arr[i] gives the VALUE at position i. Just 'i' alone gives the INDEX number. You need the value!",
  overwrite_vs_add:   "sum += arr[i] ADDS each element to sum. sum = arr[i] REPLACES sum every time — you lose all previous values!",
  wrong_start:        "Starting at i=1 SKIPS the first element at index [0]. For full traversal, start at i=0.",
  max_start_at_one:   "When finding max, start at i=1 because max is already set to arr[0]. Comparing arr[0] to itself is wasted work.",
  min_not_max:        "if(arr[i] < max) finds MINIMUM, not maximum! Use > for maximum.",
  reverse_bounds:     "Reverse: start at arr.length-1 (last index), go down to >= 0 with i--. NOT arr.length (that's out of bounds).",
  swap_oob:           "arr[arr.length] is out of bounds! The last element is arr[arr.length - 1]. Always subtract 1!",
  swap_order:         "Swap order: (1) save arr[0] in temp, (2) copy last into arr[0], (3) copy temp into last. Wrong order = data loss!",
  search_value_index: "When you find the match, store i (the INDEX), not 42 (the value you searched for). result = i, not result = 42!",
  count_vs_add:       "count++ increments by 1 each match. count += data[i] would ADD the values, not count them!",
  check_index_not_val:"if(i == 7) checks if the INDEX equals 7. You want if(data[i] == 7) to check the VALUE at that index!",
  avg_wrong_body:     "Build sum with sum += scores[i] INSIDE the loop. The division sum/length happens AFTER the loop, not inside.",
};

const WRONG_CONCEPTS = {
  1: { loop: { "for(int i=0; i<=scores.length; i++)": "wrong_loop_bound", "for(int i=1; i<scores.length; i++)": "wrong_start" },
       body: { "System.out.println(i);": "index_not_value", "System.out.println(scores.length);": "index_not_value" } },
  2: { loop: { "for(int i=0; i<=nums.length; i++)": "wrong_loop_bound" },
       body: { "sum += i;": "index_not_value", "sum = nums[i];": "overwrite_vs_add" } },
  3: { loop: { "for(int i=0; i<temps.length; i++)": "max_start_at_one", "for(int i=0; i<=temps.length; i++)": "wrong_loop_bound" },
       body: { "max = temps[i];": "overwrite_vs_add", "if(temps[i]<max) max=temps[i];": "min_not_max" } },
  4: { body: { "if(data[i]==7) count=i;": "search_value_index", "count += data[i];": "count_vs_add", "if(i==7) count++;": "check_index_not_val" } },
  5: { loop: { "for(int i=arr.length; i>0; i--)": "reverse_bounds", "for(int i=4; i>=0; i--)": "reverse_bounds", "for(int i=0; i<arr.length; i++)": "reverse_bounds" },
       body: { "System.out.println(arr[arr.length-i]);": "reverse_bounds" } },
  6: { loop: { "for(int i=1; i<=scores.length; i++)": "wrong_loop_bound" },
       body: { "sum += i;": "index_not_value", "sum = scores[i];": "overwrite_vs_add", "average += scores[i];": "avg_wrong_body" } },
  7: { stmt1: { "int temp = arr[4];": "swap_order" },
       stmt2: { "arr[0] = arr[arr.length];": "swap_oob" },
       stmt3: { "arr[arr.length] = temp;": "swap_oob", "arr[0] = temp;": "swap_order" } },
  8: { loop: { "for(int i=0; i<=data.length; i++)": "wrong_loop_bound" },
       body: { "if(data[i]==42) result=42;": "search_value_index", "if(i==42) result=data[i];": "check_index_not_val", "result = data[i];": "overwrite_vs_add" } },
};

export class Level24Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level24Scene" });
  }

  init() {
    this.currentProject = 0;
    this.totalScore = 0;
    this.displayScore = 0;
    this.firstTryCount = 0;
    this.projectResults = [];
    this.projectAttempts = 0;
    this.projectStartTime = 0;
    this.totalSeconds = 0;
    this.placedBlocks = {};
    this.slotRects = {};
    this.trayBlocks = [];
    this.editorRowObjs = [];
    this.cells = [];
    this.gameEnded = false;
    this._alive = true;
    this._bubble = null;
    this._dragHoverSlotKey = null;
    this._forgeReady = false;
    this._executing = false;
  }

  preload() {}

  create() {
    this._alive = true;
    this.events.once("shutdown", () => { this._alive = false; });

    const cam = this.cameras.main;
    const zoom = Math.min(this.scale.width / W, this.scale.height / H);
    cam.setZoom(zoom);
    cam.centerOn(W / 2, H / 2);
    cam.setBackgroundColor("#080c11");

    try { GameManager.incrementAttempt(23); } catch (_) {}

    this.createParticleTexture();
    this.createBackground();
    this.createForgeGlow();
    this.createEmberParticles();
    this.createAccentStrips();
    this.createHUD();
    this.createEditorPanel();
    this.createVisualPanel();
    this.createBlockTray();
    this.createBit();
    this.setupDragEvents();

    cam.fadeIn(700, 4, 8, 16);
    this.time.delayedCall(400, () => this.showProjectBriefing(0));
  }

  update(time, delta) {
    this.updateEmberParticles(time, delta);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // SETUP — background & environment
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l24_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l24_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x080c11).setDepth(0);
  }

  createForgeGlow() {
    this.add.rectangle(W / 2, 635 + 42.5, W, 85, C_ORANGE, 0.025).setDepth(1);
    this.add.rectangle(W / 2, 670 + 25, W, 50, C_EMBER, 0.015).setDepth(1);

    const g = this.add.graphics().setDepth(2);
    g.lineStyle(1, 0x1565c0, 0.02);
    for (let x = VX; x <= VX + VW; x += 45) g.lineBetween(x, 130, x, 530);
    for (let y = 130; y <= 530; y += 45) g.lineBetween(VX, y, VX + VW, y);
  }

  createEmberParticles() {
    this.embers = [];
    for (let i = 0; i < 15; i++) {
      const p = this.add.circle(
        Phaser.Math.Between(50, 1230), Phaser.Math.Between(500, 720),
        1, C_EMBER, Phaser.Math.FloatBetween(0.03, 0.06)
      ).setDepth(2);
      this.embers.push(p);
    }
  }

  updateEmberParticles(time, delta) {
    if (!this.embers) return;
    const step = 0.09 * (delta / 16.7);
    this.embers.forEach((p, i) => {
      p.y -= step;
      p.x += Math.sin(time * 0.001 + i * 0.5) * 0.04;
      if (p.y < 60) { p.y = Phaser.Math.Between(680, 720); p.x = Phaser.Math.Between(50, 1230); }
    });
  }

  createAccentStrips() {
    const left = this.add.rectangle(1.5, H / 2, 3, H, C_ORANGE, 0.035).setDepth(2);
    const right = this.add.rectangle(1278.5, H / 2, 3, H, C_ORANGE, 0.035).setDepth(2);
    [left, right].forEach((s) => {
      this.tweens.add({ targets: s, fillAlpha: 0.06, duration: 5000, yoyo: true, repeat: -1 });
    });
  }

  // ══════════════════════════════════════════════════════════════
  // HUD
  // ══════════════════════════════════════════════════════════════

  createHUD() {
    const g = this.add.graphics().setDepth(50);
    g.fillStyle(0x0a0e12, 0.95);
    g.fillRect(0, 0, W, 56);
    g.lineStyle(1, 0x21262d, 1);
    g.lineBetween(0, 56, W, 56);

    this.add.text(20, 10, "ARRAY FORGE", { font: "bold 13px Arial", color: "#b0bec5" }).setDepth(51);
    this.add.text(20, 28, "Restructuring Phase — Arrays", { font: "10px Arial", color: "#546e7a" }).setDepth(51);

    const pbg = this.add.graphics().setDepth(51);
    pbg.fillStyle(0x1a1a2e, 1);
    pbg.fillRoundedRect(430, 16, 420, 8, 4);
    this.progressFill = this.add.graphics().setDepth(51);
    this._drawProgressFill();

    this.projectMarkers = [];
    const n = PROJECTS.length;
    const spacing = 420 / n;
    for (let i = 0; i < n; i++) {
      const mx = 430 + spacing * i + spacing / 2;
      const mg = this.add.graphics().setDepth(51);
      this.projectMarkers.push({ g: mg, x: mx, y: 34 });
    }
    this._drawMarkers();

    this.add.text(1060, 10, "SCORE", { font: "9px Arial", color: "#546e7a" }).setDepth(51);
    this.scoreText = this.add.text(1060, 22, "0", { font: "bold 18px Arial", color: "#ffffff" }).setDepth(51);
    this.accuracyText = this.add.text(1060, 40, "Accuracy: ---%", { font: "12px Arial", color: "#78909c" }).setDepth(51);
  }

  _drawProgressFill() {
    const pct = this.currentProject / PROJECTS.length;
    this.progressFill.clear();
    this.progressFill.fillStyle(C_ORANGE, 1);
    this.progressFill.fillRoundedRect(430, 16, Math.max(0, 414 * pct), 8, 4);
  }

  _drawMarkers() {
    this.projectMarkers.forEach((m, i) => {
      m.g.clear();
      if (i < this.currentProject) {
        m.g.fillStyle(C_GREEN, 1);
        m.g.fillCircle(m.x, m.y, 8);
      } else if (i === this.currentProject) {
        m.g.lineStyle(2, C_ORANGE, 1);
        m.g.strokeCircle(m.x, m.y, 8);
        m.g.fillStyle(0x1a1a2e, 1);
        m.g.fillCircle(m.x, m.y, 7);
      } else {
        m.g.fillStyle(0x1a1a2e, 1);
        m.g.lineStyle(1, 0x2a2a4a, 1);
        m.g.fillCircle(m.x, m.y, 8);
        m.g.strokeCircle(m.x, m.y, 8);
      }
    });
    if (this.projectMarkers[this.currentProject]) {
      const m = this.projectMarkers[this.currentProject];
      if (m.pulse) m.pulse.stop();
      m.pulse = this.tweens.add({ targets: m.g, alpha: 0.5, duration: 600, yoyo: true, repeat: -1 });
    }
  }

  // ══════════════════════════════════════════════════════════════
  // EDITOR PANEL
  // ══════════════════════════════════════════════════════════════

  createEditorPanel() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0d1117, 1);
    g.fillRoundedRect(EX, EY, EW, EH, 10);
    g.lineStyle(1, 0x21262d, 1);
    g.strokeRoundedRect(EX, EY, EW, EH, 10);

    const tab = this.add.graphics().setDepth(11);
    tab.fillStyle(0x161b22, 1);
    tab.fillRoundedRect(EX, EY, EW, TAB_H, { tl: 10, tr: 10, bl: 0, br: 0 });
    tab.fillStyle(C_CYAN, 1);
    tab.fillRect(EX, EY + TAB_H - 2, 130, 2);

    const fileIcon = this.add.graphics().setDepth(12);
    fileIcon.lineStyle(1, 0x4fc3f7, 1);
    fileIcon.strokeRect(EX + 10, EY + 10, 8, 10);
    this.tabFilenameText = this.add.text(EX + 24, EY + 8, "Project.java", {
      font: "12px Courier New", color: "#8b949e",
    }).setDepth(12);

    this.editorCodeContainer = this.add.container(0, 0).setDepth(20);
    this.cursorBlink = this.add.rectangle(0, 0, 2, 17, C_CYAN).setDepth(22).setVisible(false);
    this.tweens.add({ targets: this.cursorBlink, alpha: 0, duration: 600, yoyo: true, repeat: -1 });

    this.createForgeButton();
  }

  updateTabFilename(name) {
    this.tabFilenameText.setText(name);
  }

  createForgeButton() {
    const bx = 225, by = 548;
    const glow = this.add.ellipse(bx, by, 196, 48, C_EMBER, 0.1).setDepth(19);
    this.tweens.add({ targets: glow, fillAlpha: 0.16, duration: 1000, yoyo: true, repeat: -1 });

    const c = this.add.container(bx, by).setDepth(20);
    const btnG = this.add.graphics();
    const draw = (hover) => {
      btnG.clear();
      btnG.fillStyle(C_ORANGE, hover ? 1 : 0.95);
      btnG.fillRoundedRect(-95, -21, 190, 42, 21);
    };
    draw(false);
    const t = this.add.text(0, 0, "▶ FORGE DATA", { font: "bold 13px Arial", color: "#ffffff" }).setOrigin(0.5);
    c.add([btnG, t]);
    c.setSize(190, 42);
    c.setAlpha(0.2);
    c.on("pointerover", () => { if (this._forgeReady) { draw(true); c.setScale(1.03); } });
    c.on("pointerout", () => { draw(false); c.setScale(1); });
    c.on("pointerdown", () => {
      if (!this._forgeReady) return;
      this.tweens.add({ targets: c, scale: 0.94, duration: 60, yoyo: true });
      this.onForgeData();
    });
    this.forgeButton = { c, t, draw, glow };
  }

  enableForgeButton() {
    this._forgeReady = true;
    this.forgeButton.c.setAlpha(1);
    this.forgeButton.c.setInteractive({ useHandCursor: true });
  }

  disableForgeButton() {
    this._forgeReady = false;
    this.forgeButton.c.setAlpha(0.2);
    this.forgeButton.c.disableInteractive();
  }

  // ── Editor row layout & rendering ──────────────────────────────

  _getEditorRows(project) {
    const rows = [];
    project.preCode.forEach((l) => rows.push({ text: l }));
    const hasLoop = project.slots.some((s) => s.type === "loop");
    if (hasLoop) {
      const loopSlot = project.slots.find((s) => s.type === "loop");
      const bodySlot = project.slots.find((s) => s.type === "body");
      rows.push({ slot: loopSlot, indent: "        ", suffix: " {" });
      rows.push({ slot: bodySlot, indent: "            ", suffix: "" });
      rows.push({ text: "        }" });
    } else {
      project.slots.forEach((s) => rows.push({ slot: s, indent: "        ", suffix: "" }));
    }
    project.postCode.forEach((l) => rows.push({ text: l }));
    return rows;
  }

  _syntaxTokens(line) {
    const tokens = [];
    const re = /("(?:[^"\\]|\\.)*")|(\bpublic\b|\bstatic\b|\bvoid\b|\bclass\b|\bint\b|\bString\b|\bif\b|\bfor\b)|(\bSystem\.out\.println\b|\bmain\b)|([A-Za-z_]\w*(?=\[)|[A-Za-z_]\w*(?=\.length))|(\.length)|(\b-?\d+\b)|(==|!=|<=|>=|\+\+|--|\+=|[\[\]{}();=<>+\-,])/g;
    let last = 0, m;
    const plain = (t) => t && tokens.push({ t, c: "#e0e0e0" });
    while ((m = re.exec(line))) {
      if (m.index > last) plain(line.slice(last, m.index));
      if (m[1]) tokens.push({ t: m[1], c: HEX_GREEN });
      else if (m[2]) tokens.push({ t: m[2], c: HEX_MAGENTA });
      else if (m[3]) tokens.push({ t: m[3], c: "#4fc3f7" });
      else if (m[4]) tokens.push({ t: m[4], c: HEX_CYAN });
      else if (m[5]) tokens.push({ t: m[5], c: HEX_AMBER });
      else if (m[6]) tokens.push({ t: m[6], c: HEX_AMBER });
      else if (m[7]) tokens.push({ t: m[7], c: "#ff8a65" });
      last = m.index + m[0].length;
    }
    if (last < line.length) plain(line.slice(last));
    return tokens;
  }

  renderEditorDisplay() {
    this.editorRowObjs.forEach((o) => o.destroy());
    this.editorRowObjs = [];
    this.slotRects = {};
    const rows = this._getEditorRows(this.project);
    let firstEmptySlotRect = null;

    rows.forEach((row, i) => {
      const y = CODE_Y0 + i * LINE_H;
      const numT = this.add.text(EX + 8, y, String(i + 1), {
        font: "12px Courier New", color: "#3d4450",
      }).setDepth(21);
      this.editorRowObjs.push(numT);

      if (row.text !== undefined) {
        const lc = this.add.container(CODE_X, y).setDepth(21);
        let x = 0;
        this._syntaxTokens(row.text).forEach((tok) => {
          const t = this.add.text(x, 0, tok.t, { font: "13px Courier New", color: tok.c });
          lc.add(t);
          x += t.width;
        });
        this.editorRowObjs.push(lc);
      } else {
        const slot = row.slot;
        const filled = this.placedBlocks[slot.key];
        if (filled) {
          const lc = this.add.container(CODE_X, y).setDepth(21);
          let x = 0;
          this._syntaxTokens(row.indent + filled + row.suffix).forEach((tok) => {
            const t = this.add.text(x, 0, tok.t, { font: "13px Courier New", color: tok.c });
            lc.add(t);
            x += t.width;
          });
          this.editorRowObjs.push(lc);
          // click filled slot to remove it
          const hit = this.add.rectangle(CODE_X, y, 500, LINE_H - 2, 0x000000, 0)
            .setOrigin(0, 0).setDepth(22).setInteractive({ useHandCursor: true });
          hit.on("pointerdown", () => this.removeFromSlot(slot.key));
          this.editorRowObjs.push(hit);
        } else {
          const indentPx = this._measureIndent(row.indent);
          const slotW = this._slotWidthFor(slot);
          const sx = CODE_X + indentPx;
          const dg = this.add.graphics().setDepth(21);
          const color = CAT_COLOR[slot.type];
          const drawDash = () => {
            dg.clear();
            dg.lineStyle(1.5, color, 1);
            this._dashedRectOutline(dg, sx, y - 2, slotW, 20, 5, 4);
          };
          drawDash();
          this.tweens.add({ targets: dg, alpha: 0.3, duration: 900, yoyo: true, repeat: -1 });
          this.editorRowObjs.push(dg);
          const label = this.add.text(sx + 8, y + 8, CAT_LABEL[slot.type], {
            font: "11px Arial", color: CAT_HEX[slot.type],
          }).setOrigin(0, 0.5).setAlpha(0.35).setDepth(22);
          this.editorRowObjs.push(label);

          this.slotRects[slot.key] = { x: sx, y: y - 2, w: slotW, h: 20, category: slot.type, dg, drawDash, color };
          if (!firstEmptySlotRect) firstEmptySlotRect = { x: sx - 4, y: y + LINE_H / 2 - 8.5 };
        }
      }
    });

    if (firstEmptySlotRect) {
      this.cursorBlink.setVisible(true).setPosition(firstEmptySlotRect.x, firstEmptySlotRect.y);
    } else {
      this.cursorBlink.setVisible(false);
    }
  }

  _measureIndent(indentStr) {
    const t = this.add.text(0, 0, indentStr, { font: "13px Courier New" });
    const w = t.width;
    t.destroy();
    return w;
  }

  _slotWidthFor(slot) {
    const t = this.add.text(0, 0, slot.correct, { font: "13px Courier New" });
    const w = t.width;
    t.destroy();
    return Phaser.Math.Clamp(w + 30, 120, 480);
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
    side(x, y, x + w, y);
    side(x + w, y, x + w, y + h);
    side(x + w, y + h, x, y + h);
    side(x, y + h, x, y);
  }

  // ══════════════════════════════════════════════════════════════
  // VISUAL (RIGHT) PANEL — array cells, console, result zone
  // ══════════════════════════════════════════════════════════════

  createVisualPanel() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0d1117, 1);
    g.fillRoundedRect(VX, VY, VW, VH, 10);
    g.lineStyle(1, 0x21262d, 1);
    g.strokeRoundedRect(VX, VY, VW, VH, 10);

    const cg = this.add.graphics().setDepth(11);
    cg.fillStyle(0x000000, 1);
    cg.fillRoundedRect(658, 72, 602, 48, { tl: 8, tr: 8, bl: 0, br: 0 });
    this.add.text(666, 76, "> output", { font: "10px Courier New", color: "#3d4450" }).setDepth(12);
    this.consoleText = this.add.text(666, 94, "", { font: "12px Courier New", color: HEX_GREEN }).setDepth(12);
    this.consoleCursor = this.add.rectangle(666, 94, 6, 12, C_GREEN).setOrigin(0, 0.5).setDepth(12);
    this.tweens.add({ targets: this.consoleCursor, alpha: 0, duration: 500, yoyo: true, repeat: -1 });

    this.indexPointer = this.add.triangle(0, 0, 0, 0, 14, 0, 7, 10, C_MAGENTA).setDepth(15).setVisible(false);

    this.resultZoneEmptyText = this.add.text(959, 440, "Run your code to see results", {
      font: "12px Arial", color: "#1a2535",
    }).setOrigin(0.5).setDepth(12);

    this.loopMonitor = null;
  }

  buildArrayCells(values) {
    this.clearArrayCells();
    const n = values.length;
    const cw = n > 8 ? 52 : 68, ch = 80, gap = 6;
    const totalW = n * cw + (n - 1) * gap;
    const startX = VX + VW / 2 - totalW / 2;
    const cy = 234;
    this.cells = values.map((v, i) => {
      const x = startX + i * (cw + gap) + cw / 2;
      const container = this.add.container(x, cy).setDepth(16);
      const glow = this.add.rectangle(0, 0, cw + 6, ch + 6, C_CYAN, 0);
      const body = this.add.graphics();
      this._drawCellBody(body, cw, ch, 0x2a3a4a, 1);
      const idxLabel = this.add.text(0, -ch / 2 - 16, `[${i}]`, {
        font: "bold 11px Courier New", color: HEX_AMBER,
      }).setOrigin(0.5);
      const valueText = this.add.text(0, 0, String(v), {
        font: "bold 18px Courier New", color: HEX_CYAN,
      }).setOrigin(0.5);
      container.add([glow, body, idxLabel, valueText]);
      return { container, glow, body, idxLabel, valueText, index: i, value: v, x, y: cy, cw, ch, pulse: null };
    });
    this.showLengthBracket(n);
  }

  _drawCellBody(g, w, h, stroke, lw) {
    g.clear();
    g.fillStyle(0x0a0e14, 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
    g.lineStyle(lw, stroke, 1);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);
  }

  showLengthBracket(count) {
    this.hideLengthBracket();
    const first = this.cells[0], last = this.cells[count - 1];
    const y = first.y + first.ch / 2 + 10;
    const txt = this.add.text(VX + VW / 2, y + 10, `length = ${count}`, {
      font: "12px Courier New", color: HEX_GRAY,
    }).setOrigin(0.5).setDepth(16);
    this.lengthBracketTxt = txt;
  }

  hideLengthBracket() {
    if (this.lengthBracketTxt) { this.lengthBracketTxt.destroy(); this.lengthBracketTxt = null; }
  }

  highlightCell(i, state) {
    const cell = this.cells[i];
    if (!cell) return;
    if (cell.pulse) { cell.pulse.stop(); cell.pulse = null; }
    const map = { cyan: C_CYAN, green: C_GREEN, red: C_RED, gold: C_AMBER, gray: 0x37474f, default: 0x2a3a4a };
    const color = map[state] || map.default;
    if (state === "default") { this._drawCellBody(cell.body, cell.cw, cell.ch, 0x2a3a4a, 1); cell.glow.setFillStyle(C_CYAN, 0); return; }
    this._drawCellBody(cell.body, cell.cw, cell.ch, color, 3);
    cell.glow.setFillStyle(color, 0.12);
    cell.pulse = this.tweens.add({ targets: cell.glow, fillAlpha: 0, duration: 400, yoyo: true });
  }

  updateCellValue(i, newValue) {
    const cell = this.cells[i];
    if (!cell) return;
    cell.value = newValue;
    cell.valueText.setText(String(newValue));
  }

  moveIndexPointer(toIndex) {
    const cell = this.cells[toIndex];
    if (!cell) return;
    this.indexPointer.setVisible(true);
    this.tweens.add({
      targets: this.indexPointer, x: cell.x - 7, y: cell.y - cell.ch / 2 - 26,
      duration: 200, ease: "Back.easeOut",
    });
  }

  moveIndexPointerAsync(toIndex) {
    return new Promise((res) => {
      const cell = this.cells[toIndex];
      if (!cell) return res();
      this.indexPointer.setVisible(true);
      this.tweens.add({
        targets: this.indexPointer, x: cell.x - 7, y: cell.y - cell.ch / 2 - 26,
        duration: 200, ease: "Back.easeOut", onComplete: () => res(),
      });
    });
  }

  hideIndexPointer() {
    this.indexPointer.setVisible(false);
  }

  clearArrayCells() {
    this.cells.forEach((c) => { if (c.pulse) c.pulse.stop(); c.container.destroy(); });
    this.cells = [];
    this.hideLengthBracket();
  }

  clearResultZone() {
    if (this.resultZoneObjs) this.resultZoneObjs.forEach((o) => o.destroy());
    this.resultZoneObjs = [];
    this.resultZoneEmptyText.setVisible(true);
  }

  typeConsoleLine(text) {
    this.resultZoneEmptyText.setVisible(false);
    return new Promise((res) => {
      const full = (this.consoleText.text ? this.consoleText.text + "\n" : "") + text;
      const start = this.consoleText.text;
      let i = 0;
      const target = full.slice(start.length);
      const ev = this.time.addEvent({
        delay: 28, repeat: Math.max(0, target.length - 1),
        callback: () => {
          i++;
          this.consoleText.setText(start + target.slice(0, i));
          if (i >= target.length) res();
        },
      });
      if (target.length === 0) res();
    });
  }

  clearConsole() {
    this.consoleText.setText("");
  }

  showLoopMonitor() {
    this.hideLoopMonitor();
    const c = this.add.container(620, 102).setDepth(45);
    const g = this.add.graphics();
    g.fillStyle(0x0d1117, 1);
    g.fillRoundedRect(-60, -24, 120, 48, 6);
    g.lineStyle(1, C_ORANGE, 1);
    g.strokeRoundedRect(-60, -24, 120, 48, 6);
    const iText = this.add.text(-52, -16, "i = 0", { font: "bold 12px Courier New", color: HEX_AMBER });
    const accessText = this.add.text(-52, 2, "", { font: "10px Courier New", color: "#78909c" });
    c.add([g, iText, accessText]);
    this.loopMonitor = { c, iText, accessText };
  }

  updateLoopMonitor(i, arrName, value) {
    if (!this.loopMonitor) return;
    this.loopMonitor.iText.setText(`i = ${i}`);
    this.tweens.add({ targets: this.loopMonitor.iText, scale: 1.2, duration: 100, yoyo: true });
    this.loopMonitor.accessText.setText(`${arrName}[${i}] = ${value}`);
  }

  hideLoopMonitor() {
    if (this.loopMonitor) { this.loopMonitor.c.destroy(); this.loopMonitor = null; }
  }

  // ══════════════════════════════════════════════════════════════
  // BLOCK TRAY & DRAG/DROP
  // ══════════════════════════════════════════════════════════════

  createBlockTray() {
    const g = this.add.graphics().setDepth(30);
    g.fillStyle(0x0a0e12, 1);
    g.lineStyle(1, 0x21262d, 1);
    g.fillRoundedRect(TX, TY, TW, TH, { tl: 0, tr: 0, bl: 8, br: 8 });
    g.lineBetween(TX, TY, TX + TW, TY);
    this.add.text(TX + 10, TY + 6, "CODE BLOCKS", { font: "bold 9px Arial", color: "#2d3640" }).setDepth(31);
    this.trayContainer = this.add.container(0, 0).setDepth(31);
  }

  createBlocks(blockConfigs) {
    this.trayBlocks.forEach((b) => b.container.destroy());
    this.trayBlocks = [];
    const shuffled = Phaser.Utils.Array.Shuffle(blockConfigs.slice());
    const rowY = [TY + 25, TY + 63];
    let x = TX + 12, row = 0;
    const maxX = TX + TW - 12;

    shuffled.forEach((blk) => {
      const style = { font: "bold 11px Courier New", color: CAT_HEX[blk.category] };
      const measure = this.add.text(0, 0, blk.text, style);
      const w = measure.width + 24;
      measure.destroy();
      if (x + w > maxX && row === 0) { row = 1; x = TX + 12; }

      const home = { x: x + w / 2, y: rowY[row] };
      x += w + 8;

      const c = this.add.container(home.x, home.y).setDepth(31);
      const g = this.add.graphics();
      g.fillStyle(0x1a1a2e, 1);
      g.fillRoundedRect(-w / 2, -15, w, 30, 15);
      g.lineStyle(1, 0x2a2a4a, 1);
      g.strokeRoundedRect(-w / 2, -15, w, 30, 15);
      g.fillStyle(CAT_COLOR[blk.category], 1);
      g.fillRoundedRect(-w / 2 + 3, -10, 4, 20, 2);
      const t = this.add.text(-w / 2 + 14, 0, blk.text, style).setOrigin(0, 0.5);
      c.add([g, t]);
      c.setSize(w, 30);
      c.setInteractive({ useHandCursor: true, draggable: true });
      c.setData("l24drag", true);
      c.setData("text", blk.text);
      c.setData("category", blk.category);
      c.setData("home", home);
      this.trayBlocks.push({ container: c, text: blk.text, category: blk.category, home, used: false });
    });
  }

  setupDragEvents() {
    this.input.on("dragstart", (pointer, obj) => {
      if (!obj.getData("l24drag")) return;
      obj.setDepth(60);
      this.tweens.add({ targets: obj, scale: 1.07, alpha: 0.85, duration: 100 });
    });
    this.input.on("drag", (pointer, obj, dragX, dragY) => {
      if (!obj.getData("l24drag")) return;
      obj.x = dragX;
      obj.y = dragY;
      this._updateDragHover(obj, dragX, dragY);
    });
    this.input.on("dragend", (pointer, obj) => {
      if (!obj.getData("l24drag")) return;
      this._finishDrag(obj);
    });
  }

  _findMatchingSlot(x, y, category) {
    let best = null, bestDist = Infinity;
    for (const key in this.slotRects) {
      if (this.placedBlocks[key]) continue;
      const s = this.slotRects[key];
      if (s.category !== category) continue;
      const cx = s.x + s.w / 2, cy = s.y + s.h / 2;
      const within = x >= s.x - 20 && x <= s.x + s.w + 20 && y >= s.y - 15 && y <= s.y + s.h + 15;
      const dist = Phaser.Math.Distance.Between(x, y, cx, cy);
      if (within && dist < bestDist) { bestDist = dist; best = key; }
    }
    return best;
  }

  _updateDragHover(obj, x, y) {
    const category = obj.getData("category");
    const key = this._findMatchingSlot(x, y, category);
    if (key !== this._dragHoverSlotKey) {
      if (this._dragHoverSlotKey && this.slotRects[this._dragHoverSlotKey]) {
        this.slotRects[this._dragHoverSlotKey].drawDash();
      }
      this._dragHoverSlotKey = key;
      if (key) {
        const s = this.slotRects[key];
        s.dg.clear();
        s.dg.lineStyle(2.5, s.color, 1);
        this._dashedRectOutline(s.dg, s.x, s.y, s.w, s.h, 5, 4);
      }
    }
  }

  _finishDrag(obj) {
    const category = obj.getData("category");
    const text = obj.getData("text");
    const key = this._findMatchingSlot(obj.x, obj.y, category);
    obj.setDepth(31);
    this._dragHoverSlotKey = null;

    if (key) {
      this.placedBlocks[key] = text;
      const trayEntry = this.trayBlocks.find((b) => b.container === obj);
      if (trayEntry) trayEntry.used = true;
      obj.disableInteractive();
      obj.setVisible(false);
      const s = this.slotRects[key];
      const ring = this.add.circle(s.x + s.w / 2, s.y + s.h / 2, 6).setStrokeStyle(2, s.color).setDepth(40);
      this.tweens.add({
        targets: ring, radius: 40, alpha: 0, duration: 250,
        onUpdate: () => ring.setStrokeStyle(2, s.color),
        onComplete: () => ring.destroy(),
      });
      this.renderEditorDisplay();
      this._layoutTrayAfterRemoval();
      this.checkAllSlotsFilled();
    } else {
      const wrongKey = this._findAnySlotNear(obj.x, obj.y);
      if (wrongKey) {
        const s = this.slotRects[wrongKey];
        s.dg.clear();
        s.dg.lineStyle(2, C_RED, 1);
        this._dashedRectOutline(s.dg, s.x, s.y, s.w, s.h, 5, 4);
        this.time.delayedCall(250, () => { if (s.drawDash) s.drawDash(); });
      }
      const home = obj.getData("home");
      this.tweens.add({ targets: obj, x: home.x, y: home.y, scale: 1, alpha: 1, duration: 250, ease: "Cubic.easeOut" });
    }
  }

  _findAnySlotNear(x, y) {
    for (const key in this.slotRects) {
      const s = this.slotRects[key];
      if (this.placedBlocks[key]) continue;
      if (x >= s.x - 20 && x <= s.x + s.w + 20 && y >= s.y - 15 && y <= s.y + s.h + 15) return key;
    }
    return null;
  }

  removeFromSlot(key) {
    if (!this.placedBlocks[key] || this._executing) return;
    const text = this.placedBlocks[key];
    this.placedBlocks[key] = null;
    const entry = this.trayBlocks.find((b) => b.text === text && b.used);
    if (entry) {
      entry.used = false;
      entry.container.setVisible(true);
      entry.container.setInteractive({ useHandCursor: true, draggable: true });
      entry.container.setPosition(entry.home.x, entry.home.y);
      entry.container.setAlpha(1).setScale(1);
    }
    this.renderEditorDisplay();
    this.disableForgeButton();
  }

  _layoutTrayAfterRemoval() {
    // tray positions are fixed at creation time; hidden blocks simply stay hidden.
  }

  checkAllSlotsFilled() {
    const filled = this.project.slots.every((s) => this.placedBlocks[s.key]);
    if (filled) this.enableForgeButton(); else this.disableForgeButton();
    return filled;
  }

  resetAllBlocks() {
    this.placedBlocks = {};
    this.trayBlocks.forEach((b) => {
      b.used = false;
      b.container.setVisible(true);
      b.container.setPosition(b.home.x, b.home.y);
      b.container.setAlpha(1).setScale(1);
      b.container.setInteractive({ useHandCursor: true, draggable: true });
    });
    this.disableForgeButton();
  }

  // ══════════════════════════════════════════════════════════════
  // BIT — mascot & speech
  // ══════════════════════════════════════════════════════════════

  createBit() {
    const c = this.add.container(W + 80, 400).setDepth(70);
    const g = this.add.graphics();
    g.lineStyle(2, 0x78909c, 1);
    g.lineBetween(0, -17, 0, -32);
    g.fillStyle(0x37474f, 1);
    g.fillRoundedRect(-20, -17, 40, 35, 10);
    const tip = this.add.circle(0, -32, 3, 0xffd740);
    const eye = this.add.circle(0, 0, 8, 0x00e5ff);
    const pupil = this.add.circle(0, 0, 3, 0xffffff);
    c.add([g, tip, eye, pupil]);
    this.tweens.add({ targets: tip, alpha: 0.3, duration: 900, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: c, y: "+=4", duration: 2000, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
    this.bit = c;
  }

  bitSlideTo(x, y, duration = 300) {
    return new Promise((res) => {
      this.tweens.add({ targets: this.bit, x, y, duration, ease: "Cubic.easeOut", onComplete: () => res() });
    });
  }

  bitSay(text) {
    this.hideBubble();
    const inner = this.add.text(0, 0, text, {
      font: "13px Arial", color: "#e0e0e0", wordWrap: { width: 330 },
    });
    const bw = Math.min(inner.width, 330) + 30, bh = inner.height + 24;
    inner.setText("");
    const bx = Phaser.Math.Clamp(this.bit.x - 24 - bw, 20, W - bw - 20);
    const by = Phaser.Math.Clamp(this.bit.y - bh / 2, 80, H - bh - 20);
    const c = this.add.container(bx, by).setDepth(71).setAlpha(0).setScale(0.7);
    const g = this.add.graphics();
    g.fillStyle(0x1a1a2e, 0.97);
    g.fillRoundedRect(0, 0, bw, bh, 10);
    g.lineStyle(1.5, C_CYAN, 1);
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
        delay: 25, repeat: Math.max(0, text.length - 1),
        callback: () => {
          i++;
          if (inner.active) inner.setText(text.slice(0, i));
          if (i >= text.length) finish();
        },
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
    await this.bitSlideTo(1060, 400);
    if (!this._alive) return;
    await this.bitSay(message);
    if (!this._alive) return;
    await Promise.race([this.waitForClick(), this.delay(4000)]);
    this.hideBubble();
    await this.bitSlideTo(W + 80, 400, 250);
  }

  // ══════════════════════════════════════════════════════════════
  // PROJECT LIFECYCLE
  // ══════════════════════════════════════════════════════════════

  showProjectBriefing(index) {
    this.currentProject = index;
    const project = PROJECTS[index];
    this._drawProgressFill();
    this._drawMarkers();

    const card = this.add.container(W / 2, H + 200).setDepth(90);
    const g = this.add.graphics();
    g.fillStyle(0x0d1117, 1);
    g.fillRoundedRect(-250, -100, 500, 200, 12);
    g.lineStyle(2, C_ORANGE, 1);
    g.strokeRoundedRect(-250, -100, 500, 200, 12);
    g.fillStyle(C_ORANGE, 1);
    g.fillRect(-250, -100, 5, 200);
    const badge = this.add.circle(-215, -70, 18, C_ORANGE);
    const badgeNum = this.add.text(-215, -70, String(project.id), { font: "bold 16px Arial", color: "#ffffff" }).setOrigin(0.5);
    const title = this.add.text(-185, -80, project.title, { font: "bold 20px Arial", color: "#ffffff" }).setOrigin(0, 0.5);
    const desc = this.add.text(-215, -45, project.briefing, {
      font: "13px Arial", color: "#b0bec5", wordWrap: { width: 460 },
    }).setOrigin(0, 0);
    const outBox = this.add.graphics();
    outBox.fillStyle(0x000000, 1);
    outBox.fillRoundedRect(-215, 5, 430, 40, 6);
    const outText = this.add.text(-205, 25, `Expected: ${project.expectedOutput.replace(/\n/g, "  ⏎  ")}`, {
      font: "11px Courier New", color: HEX_GREEN,
    }).setOrigin(0, 0.5);

    const startBtn = this.add.container(0, 75).setDepth(1);
    const sg = this.add.graphics();
    sg.fillStyle(C_ORANGE, 1);
    sg.fillRoundedRect(-70, -20, 140, 40, 20);
    const st = this.add.text(0, 0, "START", { font: "bold 13px Arial", color: "#ffffff" }).setOrigin(0.5);
    startBtn.add([sg, st]);
    startBtn.setSize(140, 40);
    startBtn.setInteractive({ useHandCursor: true });
    startBtn.on("pointerover", () => startBtn.setScale(1.05));
    startBtn.on("pointerout", () => startBtn.setScale(1));
    startBtn.on("pointerdown", () => {
      startBtn.disableInteractive();
      this.tweens.add({
        targets: card, y: H + 200, duration: 400, ease: "Cubic.easeIn",
        onComplete: () => { card.destroy(); this.loadProject(project); },
      });
    });

    card.add([g, badge, badgeNum, title, desc, outBox, outText, startBtn]);
    this.tweens.add({ targets: card, y: 340, duration: 400, ease: "Back.easeOut" });
  }

  loadProject(project) {
    this.project = project;
    this.placedBlocks = {};
    this.slotRects = {};
    this.projectAttempts = 0;
    this.projectStartTime = this.time.now;
    this.clearConsole();
    this.clearResultZone();
    this.hideIndexPointer();
    this.hideLoopMonitor();

    this.updateTabFilename(project.filename);
    this.buildArrayCells(project.array.values.slice());
    this.renderEditorDisplay();
    this.createBlocks(project.blocks);
    this.disableForgeButton();
  }

  clearProject() {
    this.clearArrayCells();
    this.editorRowObjs.forEach((o) => o.destroy());
    this.editorRowObjs = [];
    this.trayBlocks.forEach((b) => b.container.destroy());
    this.trayBlocks = [];
    this.clearResultZone();
  }

  nextProject() {
    this.clearProject();
    if (this.currentProject + 1 >= PROJECTS.length) this.levelComplete();
    else this.showProjectBriefing(this.currentProject + 1);
  }

  // ══════════════════════════════════════════════════════════════
  // FORGE / EXECUTION FLOW
  // ══════════════════════════════════════════════════════════════

  async onForgeData() {
    if (this._executing) return;
    this._executing = true;
    this.disableForgeButton();
    this.projectAttempts++;
    await this.showCompilationAnimation();
    if (!this._alive) return;

    const project = this.project;
    const isCorrect = project.slots.every((s) => this.placedBlocks[s.key] === s.correct);

    if (isCorrect) {
      await this.executeCorrect(project);
      if (!this._alive) return;
      this.onCorrectProject();
    } else {
      const sim = this._runProjectSim(project, this.placedBlocks);
      const actual = sim.exception
        ? (sim.output.join("\n") + (sim.output.length ? "\n" : "") + "⚠ " + sim.exception)
        : (sim.output.join("\n") || "(no output)");
      const concept = this._detectErrorType(project);
      this._executing = false;
      this.onIncorrectProject(concept, actual);
    }
  }

  showCompilationAnimation() {
    return new Promise((res) => {
      this.forgeButton.t.setText("FORGING...");
      const barY = 575;
      const bar = this.add.graphics().setDepth(20);
      const prog = { w: 0 };
      const sparkEvent = this.time.addEvent({
        delay: 120, repeat: 5,
        callback: () => {
          const p = this.add.particles(225 - 95 + prog.w, 566, "l24_dot", {
            speed: { min: 30, max: 60 }, angle: { min: 250, max: 290 },
            scale: { start: 0.5, end: 0 }, lifespan: 300, tint: C_AMBER, emitting: false,
          }).setDepth(21);
          p.explode(3);
          this.time.delayedCall(350, () => p.destroy());
        },
      });
      this.tweens.add({
        targets: prog, w: 190, duration: 700,
        onUpdate: () => {
          bar.clear();
          bar.fillStyle(C_ORANGE, 1);
          bar.fillRect(225 - 95, 570, prog.w, 3);
        },
        onComplete: () => {
          sparkEvent.remove();
          bar.destroy();
          this.forgeButton.t.setText("RUNNING...");
          res();
        },
      });
    });
  }

  async executeCorrect(project) {
    this.showLoopMonitor();
    // animate line-by-line highlight through the fixed pre-code quickly
    await this._flashCodeLines(0, project.preCode.length, 100);
    if (!this._alive) return;

    switch (project.visual) {
      case "highlight_traverse": await this.runHighlightTraverse(project); break;
      case "crucible_pour": await this.runCruciblePour(project); break;
      case "thermometer_bars": await this.runThermometerBars(project); break;
      case "stamp_counter": await this.runStampCounter(project); break;
      case "reverse_sweep": await this.runReverseSweep(project); break;
      case "score_cards": await this.runScoreCards(project); break;
      case "swap_animation": await this.runSwapAnimation(project); break;
      case "scanner_search": await this.runScannerSearch(project); break;
    }
    if (!this._alive) return;
    this.hideLoopMonitor();
    this.hideIndexPointer();
  }

  _flashCodeLines(fromRow, count, perLine) {
    return this.delay(count * (perLine / 4));
  }

  flashAllCellsGreen() {
    this.cells.forEach((c, i) => {
      this.highlightCell(i, "green");
      this.time.delayedCall(500, () => { if (this._alive && c.container.active) this.highlightCell(i, "default"); });
    });
  }

  // ══════════════════════════════════════════════════════════════
  // 8 PROJECT VISUAL ANIMATIONS (correct path only)
  // ══════════════════════════════════════════════════════════════

  async runHighlightTraverse(project) {
    const arr = project.array.values;
    this.clearConsole();
    for (let i = 0; i < arr.length; i++) {
      if (!this._alive) return;
      await this.moveIndexPointerAsync(i);
      this.highlightCell(i, "cyan");
      this.updateLoopMonitor(i, project.array.name, arr[i]);
      const cell = this.cells[i];
      this.tweens.add({ targets: cell.valueText, scale: 1.2, duration: 125, yoyo: true });
      const fly = this.add.text(cell.x, cell.y, String(arr[i]), {
        font: "bold 18px Courier New", color: HEX_CYAN,
      }).setOrigin(0.5).setDepth(40);
      this.tweens.add({ targets: fly, x: 700, y: 90, alpha: 0, duration: 300, ease: "Cubic.easeOut", onComplete: () => fly.destroy() });
      await this.typeConsoleLine(String(arr[i]));
      this.highlightCell(i, "default");
      await this.delay(120);
    }
    if (!this._alive) return;
    this.flashAllCellsGreen();
    await this.delay(300);
  }

  async runCruciblePour(project) {
    const arr = project.array.values;
    this.clearConsole();
    const zoneX = VX + VW / 2, zoneY = 440;
    const crucibleG = this.add.graphics().setDepth(20);
    crucibleG.lineStyle(2, C_EMBER, 1);
    crucibleG.fillStyle(0x0d1117, 1);
    const drawCrucible = () => {
      crucibleG.clear();
      crucibleG.lineStyle(2, C_EMBER, 1);
      crucibleG.fillStyle(0x0d1117, 1);
      crucibleG.beginPath();
      crucibleG.moveTo(zoneX - 60, zoneY - 40);
      crucibleG.lineTo(zoneX + 60, zoneY - 40);
      crucibleG.lineTo(zoneX + 30, zoneY + 40);
      crucibleG.lineTo(zoneX - 30, zoneY + 40);
      crucibleG.closePath();
      crucibleG.fillPath();
      crucibleG.strokePath();
    };
    drawCrucible();
    const fillG = this.add.graphics().setDepth(21);
    const sumText = this.add.text(zoneX, zoneY + 60, "0", { font: "bold 24px Courier New", color: HEX_AMBER }).setOrigin(0.5).setDepth(22);
    this.resultZoneObjs = [crucibleG, fillG, sumText];
    this.resultZoneEmptyText.setVisible(false);

    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
      if (!this._alive) return;
      await this.moveIndexPointerAsync(i);
      this.highlightCell(i, "cyan");
      this.updateLoopMonitor(i, project.array.name, arr[i]);
      const cell = this.cells[i];
      const drop = this.add.circle(cell.x, cell.y, 8, C_AMBER).setDepth(40);
      await new Promise((res) => {
        this.tweens.add({
          targets: drop, x: zoneX, y: zoneY, duration: 300, ease: "Quad.easeIn",
          onComplete: () => {
            drop.destroy();
            const splash = this.add.particles(zoneX, zoneY, "l24_dot", {
              speed: { min: 30, max: 70 }, angle: { min: 250, max: 290 },
              scale: { start: 0.5, end: 0 }, lifespan: 200, tint: C_AMBER, emitting: false,
            }).setDepth(40);
            splash.explode(4);
            this.time.delayedCall(300, () => splash.destroy());
            res();
          },
        });
      });
      sum += arr[i];
      const counter = { v: sum - arr[i] };
      this.tweens.add({ targets: counter, v: sum, duration: 200, onUpdate: () => sumText.setText(String(Math.round(counter.v))) });
      const fillH = Math.min(70, ((i + 1) / arr.length) * 70);
      fillG.clear();
      fillG.fillStyle(C_AMBER, 0.15);
      fillG.fillRect(zoneX - 25, zoneY + 38 - fillH, 50, fillH);
      await this.typeConsoleLine("");
      this.consoleText.setText("");
      this.highlightCell(i, "default");
      await this.delay(150);
    }
    if (!this._alive) return;
    this.hideIndexPointer();
    await this.typeConsoleLine(project.expectedOutput);
    drawCrucible();
    crucibleG.lineStyle(2, C_AMBER, 1);
    const glow = this.add.circle(zoneX, zoneY, 0, C_AMBER, 0.2).setDepth(19);
    this.resultZoneObjs.push(glow);
    this.tweens.add({ targets: glow, radius: 50, alpha: 0, duration: 600 });
    this.tweens.add({ targets: sumText, scale: 1.4, duration: 200, yoyo: true, onComplete: () => sumText.setScale(1.2) });
    sumText.setColor(HEX_AMBER);
    const total = this.add.text(zoneX, zoneY - 60, `TOTAL: ${sum}`, { font: "bold 16px Arial", color: HEX_AMBER }).setOrigin(0.5).setDepth(22).setAlpha(0);
    this.resultZoneObjs.push(total);
    this.tweens.add({ targets: total, alpha: 1, duration: 300 });
    this.flashAllCellsGreen();
    await this.delay(500);
  }

  async runThermometerBars(project) {
    const arr = project.array.values;
    this.clearConsole();
    const zoneX0 = VX + 40, zoneBottom = 500, barW = 50, gap = 8;
    const bars = arr.map((v, i) => {
      const h = v * 1.8;
      const x = zoneX0 + i * (barW + gap);
      const g = this.add.graphics().setDepth(20);
      const drawBar = (color) => {
        g.clear();
        g.fillStyle(color, 1);
        g.fillRoundedRect(x, zoneBottom - h, barW, h, { tl: 4, tr: 4, bl: 0, br: 0 });
        g.lineStyle(1, 0x2a3a4a, 1);
        g.strokeRoundedRect(x, zoneBottom - h, barW, h, { tl: 4, tr: 4, bl: 0, br: 0 });
      };
      drawBar(0x1a2a3a);
      const label = this.add.text(x + barW / 2, zoneBottom - h - 14, String(v), {
        font: "11px Courier New", color: HEX_GRAY,
      }).setOrigin(0.5).setDepth(21);
      return { g, drawBar, label, x, h, v };
    });
    const maxBox = this.add.graphics().setDepth(20);
    maxBox.fillStyle(0x0a0a1a, 1);
    maxBox.lineStyle(1, C_AMBER, 1);
    maxBox.fillRoundedRect(VX + VW - 110, 355, 90, 28, 5);
    maxBox.strokeRoundedRect(VX + VW - 110, 355, 90, 28, 5);
    const maxText = this.add.text(VX + VW - 65, 369, `max = ${arr[0]}`, { font: "bold 14px Courier New", color: HEX_AMBER }).setOrigin(0.5).setDepth(21);
    this.resultZoneObjs = [...bars.map((b) => b.g), ...bars.map((b) => b.label), maxBox, maxText];
    this.resultZoneEmptyText.setVisible(false);

    let max = arr[0];
    let crown = null;
    for (let i = 1; i < arr.length; i++) {
      if (!this._alive) return;
      await this.moveIndexPointerAsync(i);
      this.highlightCell(i, "cyan");
      this.updateLoopMonitor(i, project.array.name, arr[i]);
      bars[i].drawBar(C_CYAN);
      bars[i].label.setColor(HEX_CYAN);
      await this.delay(180);
      if (arr[i] > max) {
        max = arr[i];
        bars[i].drawBar(C_AMBER);
        if (crown) this.tweens.add({ targets: crown, alpha: 0, duration: 150, onComplete: () => crown.destroy() });
        crown = this.add.text(bars[i].x + 25, zoneBottom - bars[i].h - 30, "♛", {
          font: "20px Arial", color: HEX_AMBER,
        }).setOrigin(0.5).setDepth(22).setScale(0);
        this.resultZoneObjs.push(crown);
        this.tweens.add({ targets: crown, scale: 1, duration: 200, ease: "Back.easeOut" });
        maxText.setText(`max = ${max}`);
        this.tweens.add({ targets: maxText, scale: 1.2, duration: 150, yoyo: true });
      } else {
        bars[i].drawBar(0x37474f);
        await this.delay(150);
        bars[i].drawBar(0x1a2a3a);
        bars[i].label.setColor(HEX_GRAY);
      }
      this.highlightCell(i, "default");
      await this.delay(120);
    }
    if (!this._alive) return;
    this.hideIndexPointer();
    await this.typeConsoleLine(project.expectedOutput);
    if (crown) {
      this.tweens.add({ targets: crown, y: "+=2", duration: 1500, yoyo: true, repeat: -1 });
    }
    const banner = this.add.text(VX + VW / 2, 365, "MAXIMUM FOUND!", { font: "bold 16px Arial", color: HEX_AMBER }).setOrigin(0.5).setDepth(22).setAlpha(0);
    this.resultZoneObjs.push(banner);
    this.tweens.add({ targets: banner, alpha: 1, duration: 300 });
    this.flashAllCellsGreen();
    await this.delay(400);
  }

  async runStampCounter(project) {
    const arr = project.array.values;
    this.clearConsole();
    const zoneX = VX + VW / 2, zoneY = 420;
    const box = this.add.graphics().setDepth(20);
    box.fillStyle(0x0a0a1a, 1);
    box.lineStyle(1, C_GREEN, 1);
    box.fillRoundedRect(zoneX - 50, zoneY - 20, 100, 40, 6);
    box.strokeRoundedRect(zoneX - 50, zoneY - 20, 100, 40, 6);
    const counterText = this.add.text(zoneX, zoneY, "Count: 0", { font: "bold 18px Courier New", color: HEX_GREEN }).setOrigin(0.5).setDepth(21);
    this.resultZoneObjs = [box, counterText];
    this.resultZoneEmptyText.setVisible(false);

    let count = 0;
    for (let i = 0; i < arr.length; i++) {
      if (!this._alive) return;
      await this.moveIndexPointerAsync(i);
      this.highlightCell(i, "cyan");
      this.updateLoopMonitor(i, project.array.name, arr[i]);
      const cell = this.cells[i];
      if (arr[i] === 7) {
        this.highlightCell(i, "gold");
        const star = this.add.text(cell.x, cell.y - 40, "★", { font: "20px Arial", color: HEX_AMBER }).setOrigin(0.5).setDepth(40).setScale(2);
        this.tweens.add({
          targets: star, scale: 1, y: cell.y, duration: 150, ease: "Cubic.easeOut",
          onComplete: () => { this.tweens.add({ targets: star, alpha: 0, duration: 200, onComplete: () => star.destroy() }); },
        });
        count++;
        this.tweens.add({ targets: counterText, scale: 1.3, duration: 100, yoyo: true });
        counterText.setText(`Count: ${count}`);
        this.createFloatingText(zoneX + 60, zoneY - 20, "+1", HEX_GREEN, "bold 14px Arial");
      } else {
        cell.container.setAlpha(0.5);
        this.time.delayedCall(200, () => { if (cell.container.active) cell.container.setAlpha(1); });
      }
      await this.delay(200);
      this.highlightCell(i, "default");
      await this.delay(80);
    }
    if (!this._alive) return;
    this.hideIndexPointer();
    await this.typeConsoleLine(project.expectedOutput);
    arr.forEach((v, i) => { if (v === 7) this.highlightCell(i, "gold"); });
    counterText.setColor(HEX_AMBER).setScale(1.2);
    const banner = this.add.text(zoneX, zoneY - 60, `${count} MATCHES FOUND!`, { font: "bold 16px Arial", color: HEX_AMBER }).setOrigin(0.5).setDepth(22).setAlpha(0);
    this.resultZoneObjs.push(banner);
    this.tweens.add({ targets: banner, alpha: 1, duration: 300 });
    await this.delay(400);
  }

  async runReverseSweep(project) {
    const arr = project.array.values;
    this.clearConsole();
    const trailG = this.add.graphics().setDepth(14);
    this.resultZoneObjs = [trailG];
    for (let i = arr.length - 1; i >= 0; i--) {
      if (!this._alive) return;
      await this.moveIndexPointerAsync(i);
      this.highlightCell(i, "cyan");
      this.updateLoopMonitor(i, project.array.name, arr[i]);
      const cell = this.cells[i];
      const fly = this.add.text(cell.x, cell.y, String(arr[i]), { font: "bold 18px Courier New", color: HEX_CYAN }).setOrigin(0.5).setDepth(40);
      this.tweens.add({ targets: fly, x: 700, y: 90, alpha: 0, duration: 300, ease: "Cubic.easeOut", onComplete: () => fly.destroy() });
      if (i < arr.length - 1) {
        const nextCell = this.cells[i + 1];
        trailG.lineStyle(2, C_CYAN, 0.08);
        trailG.lineBetween(cell.x, cell.y, nextCell.x, nextCell.y);
      }
      await this.typeConsoleLine(String(arr[i]));
      this.highlightCell(i, "default");
      await this.delay(120);
    }
    if (!this._alive) return;
    this.hideIndexPointer();
    this.flashAllCellsGreen();
    await this.delay(300);
  }

  async runScoreCards(project) {
    const arr = project.array.values;
    this.clearConsole();
    const zoneX0 = VX + VW / 2 - ((arr.length * 58) / 2) + 26, zoneY = 400;
    const cards = arr.map((v, i) => {
      const x = zoneX0 + i * 58;
      const c = this.add.container(x, zoneY).setDepth(20);
      const g = this.add.graphics();
      g.fillStyle(0x1a2a3a, 1);
      g.lineStyle(1, C_AMBER, 1);
      g.fillRoundedRect(-26, -35, 52, 70, 6);
      g.strokeRoundedRect(-26, -35, 52, 70, 6);
      const t = this.add.text(0, 0, "?", { font: "bold 20px Courier New", color: "#546e7a" }).setOrigin(0.5);
      c.add([g, t]);
      return { c, g, t, v };
    });
    const sumText = this.add.text(VX + VW / 2, 470, "Sum: 0", { font: "bold 16px Courier New", color: HEX_AMBER }).setOrigin(0.5).setDepth(21);
    this.resultZoneObjs = [...cards.map((c) => c.c), sumText];
    this.resultZoneEmptyText.setVisible(false);

    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
      if (!this._alive) return;
      await this.moveIndexPointerAsync(i);
      this.highlightCell(i, "cyan");
      this.updateLoopMonitor(i, project.array.name, arr[i]);
      const card = cards[i];
      await new Promise((res) => {
        this.tweens.add({
          targets: card.c, scaleX: 0, duration: 120,
          onComplete: () => {
            card.t.setText(String(arr[i])).setColor(HEX_AMBER);
            this.tweens.add({ targets: card.c, scaleX: 1, duration: 120, onComplete: () => res() });
          },
        });
      });
      const flyVal = this.add.text(card.c.x, card.c.y, String(arr[i]), { font: "bold 16px Courier New", color: HEX_AMBER }).setOrigin(0.5).setDepth(40);
      await new Promise((res) => {
        this.tweens.add({
          targets: flyVal, x: VX + VW / 2, y: 470, duration: 350, ease: "Cubic.easeOut",
          onComplete: () => { flyVal.destroy(); res(); },
        });
      });
      sum += arr[i];
      sumText.setText(`Sum: ${sum}`);
      this.highlightCell(i, "default");
      await this.delay(100);
    }
    if (!this._alive) return;
    this.hideIndexPointer();
    const avg = Math.trunc(sum / arr.length);
    await this.typeConsoleLine(project.expectedOutput);
    const div = this.add.graphics().setDepth(21);
    div.lineStyle(1, C_GRAY, 1);
    this.resultZoneObjs.push(div);
    await new Promise((res) => {
      const p = { w: 0 };
      this.tweens.add({
        targets: p, w: 80, duration: 200,
        onUpdate: () => { div.clear(); div.lineStyle(1, C_GRAY, 1); div.lineBetween(VX + VW / 2 - p.w / 2, 490, VX + VW / 2 + p.w / 2, 490); },
        onComplete: () => res(),
      });
    });
    const divLabel = this.add.text(VX + VW / 2, 505, `÷ ${arr.length}`, { font: "13px Courier New", color: HEX_GRAY }).setOrigin(0.5).setDepth(21).setAlpha(0);
    this.resultZoneObjs.push(divLabel);
    this.tweens.add({ targets: divLabel, alpha: 1, duration: 200 });
    await this.delay(250);
    const eqText = this.add.text(VX + VW / 2, 445, `AVERAGE: ${avg}`, { font: "bold 20px Arial", color: HEX_AMBER }).setOrigin(0.5).setDepth(22).setScale(0);
    this.resultZoneObjs.push(eqText);
    this.tweens.add({ targets: eqText, scale: 1, duration: 300, ease: "Back.easeOut" });
    this.flashAllCellsGreen();
    await this.delay(400);
  }

  async runSwapAnimation(project) {
    const arr = project.array.values.slice();
    this.clearConsole();
    const last = arr.length - 1;

    // Step 1: temp = arr[0]
    this.highlightCell(0, "cyan");
    const cell0 = this.cells[0];
    this.tweens.add({ targets: cell0.valueText, y: -15, duration: 200 });
    await this.delay(220);
    const tempBoxX = VX + VW / 2, tempBoxY = 300;
    const tbG = this.add.graphics().setDepth(30);
    tbG.fillStyle(0x0d1117, 1);
    tbG.lineStyle(1.5, C_AMBER, 1);
    this._dashedRectOutline(tbG, tempBoxX - 30, tempBoxY - 17, 60, 35, 5, 4);
    tbG.fillRoundedRect(tempBoxX - 30, tempBoxY - 17, 60, 35, 6);
    const tbLabel = this.add.text(tempBoxX, tempBoxY - 26, "temp", { font: "10px Arial", color: HEX_AMBER }).setOrigin(0.5).setDepth(31);
    const tbValue = this.add.text(tempBoxX, tempBoxY, "", { font: "bold 18px Courier New", color: HEX_AMBER }).setOrigin(0.5).setDepth(31);
    this.resultZoneObjs = [tbG, tbLabel, tbValue];
    this.resultZoneEmptyText.setVisible(false);

    const firstVal = arr[0];
    const flying1 = this.add.text(cell0.x, cell0.y - 15, String(firstVal), { font: "bold 18px Courier New", color: HEX_CYAN }).setOrigin(0.5).setDepth(40);
    await new Promise((res) => {
      this.tweens.add({
        targets: flying1, x: tempBoxX, y: tempBoxY, duration: 400, ease: "Cubic.easeInOut",
        onComplete: () => { flying1.destroy(); tbValue.setText(String(firstVal)); res(); },
      });
    });
    cell0.valueText.setAlpha(0.3).setY(0);
    this.highlightCell(0, "default");
    await this.delay(400);

    // Step 2: arr[0] = arr[last]
    this.highlightCell(last, "gold");
    this.highlightCell(0, "cyan");
    const cellLast = this.cells[last];
    const lastVal = arr[last];
    const flying2 = this.add.text(cellLast.x, cellLast.y, String(lastVal), { font: "bold 18px Courier New", color: HEX_AMBER }).setOrigin(0.5).setDepth(40);
    await new Promise((res) => {
      this.tweens.add({
        targets: flying2, x: cell0.x, y: cell0.y - 30, duration: 500, ease: "Cubic.easeInOut",
        onComplete: () => {
          this.tweens.add({
            targets: flying2, y: cell0.y, duration: 150,
            onComplete: () => {
              flying2.destroy();
              cell0.valueText.setAlpha(0).setText(String(lastVal));
              this.tweens.add({ targets: cell0.valueText, alpha: 1, scale: { from: 0.8, to: 1 }, duration: 200 });
              cell0.value = lastVal;
              res();
            },
          });
        },
      });
    });
    this.highlightCell(0, "default");
    this.highlightCell(last, "default");
    await this.delay(400);

    // Step 3: arr[last] = temp
    tbG.clear();
    tbG.fillStyle(0x0d1117, 1);
    tbG.lineStyle(1.5, C_CYAN, 1);
    this._dashedRectOutline(tbG, tempBoxX - 30, tempBoxY - 17, 60, 35, 5, 4);
    tbG.fillRoundedRect(tempBoxX - 30, tempBoxY - 17, 60, 35, 6);
    this.highlightCell(last, "cyan");
    const flying3 = this.add.text(tempBoxX, tempBoxY, String(firstVal), { font: "bold 18px Courier New", color: HEX_AMBER }).setOrigin(0.5).setDepth(40);
    tbValue.setVisible(false);
    await new Promise((res) => {
      this.tweens.add({
        targets: flying3, x: cellLast.x, y: cellLast.y, duration: 500, ease: "Cubic.easeInOut",
        onComplete: () => {
          flying3.destroy();
          cellLast.valueText.setAlpha(0).setText(String(firstVal));
          this.tweens.add({ targets: cellLast.valueText, alpha: 1, scale: { from: 0.8, to: 1 }, duration: 200 });
          cellLast.value = firstVal;
          res();
        },
      });
    });
    this.tweens.add({ targets: [tbG, tbLabel], alpha: 0, duration: 300, onComplete: () => { tbG.destroy(); tbLabel.destroy(); tbValue.destroy(); } });
    this.highlightCell(last, "default");
    arr[0] = lastVal; arr[last] = firstVal;
    await this.delay(500);

    // print all values (post-code loop)
    for (let i = 0; i < arr.length; i++) {
      if (!this._alive) return;
      await this.moveIndexPointerAsync(i);
      this.highlightCell(i, "cyan");
      this.updateLoopMonitor(i, project.array.name, arr[i]);
      await this.typeConsoleLine(String(arr[i]));
      this.highlightCell(i, "default");
      await this.delay(120);
    }
    if (!this._alive) return;
    this.hideIndexPointer();
    this.flashAllCellsGreen();
    this.highlightCell(0, "gold");
    this.highlightCell(last, "gold");
    const banner = this.add.text(VX + VW / 2, 440, "SWAP COMPLETE!", { font: "bold 18px Arial", color: HEX_GREEN }).setOrigin(0.5).setDepth(22).setAlpha(0);
    this.resultZoneObjs.push(banner);
    this.tweens.add({ targets: banner, alpha: 1, duration: 300 });
    await this.delay(400);
  }

  async runScannerSearch(project) {
    const arr = project.array.values;
    const target = 42;
    this.clearConsole();
    const zoneX = VX + VW / 2, zoneY = 400;
    const box = this.add.graphics().setDepth(20);
    box.fillStyle(0x0a0a1a, 1);
    box.lineStyle(1, C_CYAN, 1);
    box.fillRoundedRect(zoneX - 60, zoneY - 18, 120, 36, 6);
    box.strokeRoundedRect(zoneX - 60, zoneY - 18, 120, 36, 6);
    const resultText = this.add.text(zoneX, zoneY, "result = -1", { font: "bold 14px Courier New", color: "#78909c" }).setOrigin(0.5).setDepth(21);
    this.resultZoneObjs = [box, resultText];
    this.resultZoneEmptyText.setVisible(false);

    const beam = this.add.rectangle(this.cells[0].x, this.cells[0].y, 2, this.cells[0].ch, C_CYAN, 0.6).setDepth(17);
    this.resultZoneObjs.push(beam);
    let foundIndex = -1;
    for (let i = 0; i < arr.length; i++) {
      if (!this._alive) return;
      const cell = this.cells[i];
      await new Promise((res) => this.tweens.add({ targets: beam, x: cell.x, duration: 200, onComplete: () => res() }));
      this.updateLoopMonitor(i, project.array.name, arr[i]);
      cell.body.clear();
      this._drawCellBody(cell.body, cell.cw, cell.ch, 0x141a24, 1);
      await this.delay(150);
      if (arr[i] === target) {
        foundIndex = i;
        this.highlightCell(i, "gold");
        for (let ring = 0; ring < 3; ring++) {
          const r = this.add.circle(cell.x, cell.y, 60 - ring * 22, 0x000000, 0).setStrokeStyle(1, C_AMBER, 0.5).setDepth(40);
          this.resultZoneObjs.push(r);
          this.tweens.add({ targets: r, radius: (60 - ring * 22) - 15, alpha: 0, duration: 400, delay: ring * 150 });
        }
        const stamp = this.add.text(cell.x, cell.y - 50, "MATCH!", { font: "bold 13px Arial", color: HEX_GREEN }).setOrigin(0.5).setDepth(40).setScale(0);
        this.tweens.add({ targets: stamp, scale: 1, duration: 200, ease: "Back.easeOut", onComplete: () => { this.tweens.add({ targets: stamp, alpha: 0, delay: 500, duration: 250, onComplete: () => stamp.destroy() }); } });
        resultText.setText(`result = ${i}`).setColor(HEX_GREEN);
        this.tweens.add({ targets: resultText, scale: 1.2, duration: 150, yoyo: true });
        await this.delay(500);
      } else {
        const miss = this.add.text(cell.x, cell.y - 40, "✗", { font: "bold 14px Arial", color: HEX_RED }).setOrigin(0.5).setDepth(40).setAlpha(0.4);
        this.tweens.add({ targets: miss, alpha: 0, duration: 300, onComplete: () => miss.destroy() });
        this._drawCellBody(cell.body, cell.cw, cell.ch, 0x2a3a4a, 1);
      }
      await this.delay(100);
    }
    if (!this._alive) return;
    await new Promise((res) => this.tweens.add({ targets: beam, x: VX + VW, alpha: 0, duration: 300, onComplete: () => { beam.destroy(); res(); } }));
    await this.typeConsoleLine(project.expectedOutput);
    if (foundIndex >= 0) {
      this.highlightCell(foundIndex, "gold");
      const cell = this.cells[foundIndex];
      cell.pulse = this.tweens.add({ targets: cell.glow, fillAlpha: 0.15, duration: 700, yoyo: true, repeat: -1 });
    }
    const banner = this.add.text(zoneX, zoneY - 60, "TARGET LOCATED!", { font: "bold 16px Arial", color: HEX_AMBER }).setOrigin(0.5).setDepth(22).setAlpha(0);
    this.resultZoneObjs.push(banner);
    this.tweens.add({ targets: banner, alpha: 1, duration: 300 });
    await this.delay(400);
  }

  // ══════════════════════════════════════════════════════════════
  // GENERIC EXPRESSION INTERPRETER (incorrect-path diff only)
  // ══════════════════════════════════════════════════════════════

  _runProjectSim(project, placedTexts) {
    try {
      const s = { arr: project.array.values.slice(), vars: {}, i: 0, output: [], exception: null };
      project.preCode.forEach((line) => { if (!s.exception) this._simLine(line, s); });
      const hasLoop = project.slots.some((sl) => sl.type === "loop");
      if (hasLoop) {
        const loopSlot = project.slots.find((sl) => sl.type === "loop");
        const bodySlot = project.slots.find((sl) => sl.type === "body");
        const loopText = placedTexts[loopSlot.key];
        const bodyText = placedTexts[bodySlot.key];
        if (loopText && bodyText) this._simForLoop(loopText, [bodyText], s);
      } else {
        project.slots.forEach((sl) => { if (!s.exception && placedTexts[sl.key]) this._simLine(placedTexts[sl.key], s); });
      }
      if (!s.exception) this._simCodeBlock(project.postCode, s);
      return { output: s.output, exception: s.exception };
    } catch (e) {
      return { output: [], exception: "RuntimeException" };
    }
  }

  _simCodeBlock(lines, s) {
    let idx = 0;
    while (idx < lines.length && !s.exception) {
      const line = lines[idx].trim();
      const forMatch = line.match(/^for\(int i\s*=\s*([^;]+);\s*i\s*(<=|>=|<|>)\s*([^;]+);\s*i(\+\+|--)\)\s*\{$/);
      if (forMatch) {
        idx++;
        const body = [];
        while (idx < lines.length && lines[idx].trim() !== "}") { body.push(lines[idx].trim()); idx++; }
        idx++;
        this._simForLoopParts(forMatch[1], forMatch[2], forMatch[3], forMatch[4], body, s);
        continue;
      }
      this._simLine(line, s);
      idx++;
    }
  }

  _simForLoop(headerText, bodyLines, s) {
    const m = headerText.match(/^for\(int i\s*=\s*([^;]+);\s*i\s*(<=|>=|<|>)\s*([^;]+);\s*i(\+\+|--)\)$/);
    if (!m) { s.exception = "ParseError"; return; }
    this._simForLoopParts(m[1], m[2], m[3], m[4], bodyLines, s);
  }

  _simForLoopParts(startExpr, op, boundExpr, dir, bodyLines, s) {
    s.i = this._simEval(startExpr, s);
    let guard = 0;
    while (!s.exception && this._simCmp(s.i, op, this._simEval(boundExpr, s)) && guard < 60) {
      bodyLines.forEach((bl) => { if (!s.exception) this._simLine(bl, s); });
      s.i += (dir === "++" ? 1 : -1);
      guard++;
    }
  }

  _simCmp(l, op, r) {
    switch (op) {
      case "==": return l === r;
      case "!=": return l !== r;
      case "<=": return l <= r;
      case ">=": return l >= r;
      case "<": return l < r;
      case ">": return l > r;
      default: return false;
    }
  }

  _simLine(rawLine, s) {
    let line = rawLine.trim();
    if (!line) return;
    if (line.startsWith("public class") || line.startsWith("public static void main") || line === "{" || line === "}") return;
    if (/int\[\]/.test(line)) return;
    line = line.replace(/;$/, "");

    const ifMatch = line.match(/^if\((.+)\)\s*(.+)$/);
    if (ifMatch) { if (this._simCond(ifMatch[1], s)) this._simLine(ifMatch[2] + ";", s); return; }

    const printMatch = line.match(/^System\.out\.println\((.+)\)$/);
    if (printMatch) { s.output.push(String(this._simEval(printMatch[1], s))); return; }

    const arrAssign = line.match(/^(\w+)\[(.+)\]\s*=\s*(.+)$/);
    if (arrAssign) {
      const idx = this._simEval(arrAssign[2], s);
      if (idx < 0 || idx >= s.arr.length) { s.exception = `ArrayIndexOutOfBoundsException: Index ${idx} out of bounds for length ${s.arr.length}`; return; }
      s.arr[idx] = this._simEval(arrAssign[3], s);
      return;
    }

    const incMatch = line.match(/^(\w+)\+\+$/);
    if (incMatch) { s.vars[incMatch[1]] = (s.vars[incMatch[1]] || 0) + 1; return; }

    const plusEq = line.match(/^(\w+)\s*\+=\s*(.+)$/);
    if (plusEq) { s.vars[plusEq[1]] = (s.vars[plusEq[1]] || 0) + this._simEval(plusEq[2], s); return; }

    const declOrAssign = line.match(/^(?:int\s+)?(\w+)\s*=\s*(.+)$/);
    if (declOrAssign) { s.vars[declOrAssign[1]] = this._simEval(declOrAssign[2], s); return; }
  }

  _simCond(cond, s) {
    const ops = ["==", "!=", "<=", ">=", "<", ">"];
    for (const op of ops) {
      const idx = cond.indexOf(op);
      if (idx !== -1) {
        const L = this._simEval(cond.slice(0, idx).trim(), s);
        const R = this._simEval(cond.slice(idx + op.length).trim(), s);
        return this._simCmp(L, op, R);
      }
    }
    return false;
  }

  _simEval(exprRaw, s) {
    const expr = exprRaw.trim();
    let m;
    if ((m = expr.match(/^"([^"]*)"\s*\+\s*(.+)$/))) return m[1] + String(this._simEval(m[2], s));
    if (/^-?\d+$/.test(expr)) return parseInt(expr, 10);
    if ((m = expr.match(/^\w+\[(.+)\]$/))) {
      const idx = this._simEval(m[1], s);
      if (idx < 0 || idx >= s.arr.length) { s.exception = `ArrayIndexOutOfBoundsException: Index ${idx} out of bounds for length ${s.arr.length}`; return 0; }
      return s.arr[idx];
    }
    if ((m = expr.match(/^\w+\.length\s*-\s*(\d+)$/))) return s.arr.length - parseInt(m[1], 10);
    if (/^\w+\.length$/.test(expr)) return s.arr.length;
    if ((m = expr.match(/^(\w+)\s*\/\s*(.+)$/))) return Math.trunc(this._simEval(m[1], s) / this._simEval(m[2], s));
    if (expr === "i") return s.i;
    if (expr in s.vars) return s.vars[expr];
    return expr;
  }

  _detectErrorType(project) {
    const map = WRONG_CONCEPTS[project.id] || {};
    for (const slot of project.slots) {
      const placed = this.placedBlocks[slot.key];
      if (placed && placed !== slot.correct) {
        const bySlot = map[slot.key] || (slot.type === "loop" ? map.loop : slot.type === "body" ? map.body : null);
        if (bySlot && bySlot[placed]) return bySlot[placed];
      }
    }
    // fallback: first available concept for this project
    for (const key in map) {
      const inner = map[key];
      for (const t in inner) return inner[t];
    }
    return "index_not_value";
  }

  // ══════════════════════════════════════════════════════════════
  // EVALUATION / FEEDBACK
  // ══════════════════════════════════════════════════════════════

  onCorrectProject() {
    if (this.gameEnded) return;
    this._executing = false;
    const firstTry = this.projectAttempts === 1;
    if (firstTry) this.firstTryCount++;
    const timeSeconds = (this.time.now - this.projectStartTime) / 1000;
    this.totalSeconds += timeSeconds;
    this.projectResults.push({ id: this.project.id, correct: true, attempts: this.projectAttempts, time: Math.round(timeSeconds) });

    const points = firstTry ? 150 : 100;
    this.updateScore(points);
    this._updateAccuracyText();

    const t = this.add.text(VX + VW / 2, 200, "✓ DATA FORGED!", {
      font: "bold 22px Arial", color: HEX_GREEN,
    }).setOrigin(0.5).setScale(0).setDepth(70);
    this.tweens.add({
      targets: t, scale: 1.1, duration: 250, ease: "Back.easeOut",
      onComplete: () => this.tweens.add({ targets: t, scale: 1, duration: 100 }),
    });
    this.time.delayedCall(1000, () => {
      this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() });
    });

    this.forgeButton.t.setText("▶ FORGE DATA");
    this.time.delayedCall(2000, () => {
      if (!this._alive || this.gameEnded) return;
      this.nextProject();
    });
  }

  onIncorrectProject(concept, actualOutput) {
    if (this.gameEnded) return;
    this.forgeButton.t.setText("▶ FORGE DATA");
    this.screenShake(0.003, 150);
    this.showDiffView(this.project.expectedOutput, actualOutput);
    this.showBitFeedback(BIT_FEEDBACK[concept] || "Check your blocks against the array bounds and logic carefully.").then(() => {
      if (!this._alive || this.gameEnded) return;
      this._clearDiffView();
      this.resetAllBlocks();
    });
  }

  showDiffView(expected, actual) {
    this._clearDiffView();
    const c = this.add.container(VX + VW / 2, 420).setDepth(80);
    const g = this.add.graphics();
    g.fillStyle(0x0d1117, 0.98);
    g.fillRoundedRect(-280, -90, 560, 180, 10);
    g.lineStyle(1, C_RED, 1);
    g.strokeRoundedRect(-280, -90, 560, 180, 10);
    c.add(g);
    c.add(this.add.text(-260, -70, "Expected:", { font: "bold 12px Arial", color: HEX_GREEN }));
    c.add(this.add.text(-260, -50, expected, { font: "12px Courier New", color: HEX_GREEN, wordWrap: { width: 520 } }));
    c.add(this.add.text(-260, 10, "Actual:", { font: "bold 12px Arial", color: HEX_RED }));
    c.add(this.add.text(-260, 30, actual, { font: "12px Courier New", color: HEX_RED, wordWrap: { width: 520 } }));
    this._diffView = c;
  }

  _clearDiffView() {
    if (this._diffView) { this._diffView.destroy(); this._diffView = null; }
  }

  updateScore(points) {
    this.totalScore += points;
    const counter = { v: this.displayScore };
    this.tweens.add({
      targets: counter, v: this.totalScore, duration: 350,
      onUpdate: () => {
        this.displayScore = Math.round(counter.v);
        if (this.scoreText.active) this.scoreText.setText(String(this.displayScore));
      },
    });
  }

  _updateAccuracyText() {
    const attempted = this.projectResults.length;
    if (attempted === 0) return;
    const pct = Math.round((this.firstTryCount / attempted) * 100);
    this.accuracyText.setText(`Accuracy: ${pct}%`);
  }

  createFloatingText(x, y, text, colorHex, font = "bold 16px Arial") {
    const t = this.add.text(x, y, text, { font, color: colorHex }).setOrigin(0.5).setDepth(65);
    this.tweens.add({
      targets: t, y: y - 30, alpha: 0, duration: 700, ease: "Cubic.easeOut",
      onComplete: () => t.destroy(),
    });
    return t;
  }

  createConfetti(x, y, count = 30) {
    const p = this.add.particles(x, y, "l24_dot", {
      speed: { min: 80, max: 260 }, angle: { min: 0, max: 360 },
      scale: { start: 0.9, end: 0 }, lifespan: 500,
      tint: [C_CYAN, C_AMBER, C_GREEN, C_ORANGE, 0xffffff], emitting: false,
    }).setDepth(65);
    p.explode(count);
    this.time.delayedCall(900, () => p.destroy());
  }

  screenShake(intensity = 0.004, duration = 200) {
    this.cameras.main.shake(duration, intensity);
  }

  // ══════════════════════════════════════════════════════════════
  // END-OF-LEVEL
  // ══════════════════════════════════════════════════════════════

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.hideBubble();

    const accuracy = this.firstTryCount / PROJECTS.length;
    try { GameManager.completeLevel(23, Math.round(accuracy * 100)); } catch (_) {}
    try { BadgeSystem.unlock("array_smith"); } catch (_) {}
    try {
      localStorage.setItem("level24_results", JSON.stringify({
        level: 24,
        score: this.totalScore,
        projects: this.projectResults.map((p) => ({ id: p.id, correct: p.correct, attempts: p.attempts, time: p.time })),
        overallAccuracy: accuracy,
        totalTime: Math.round(this.totalSeconds),
        stars: this._starRating(accuracy),
        timestamp: Date.now(),
      }));
    } catch (_) {}

    this.showArtifactDisplay().then(() => {
      if (this._alive) this.showScoreBreakdown(accuracy);
    });
  }

  _starRating(accuracy) {
    if (accuracy >= 0.9) return 3;
    if (accuracy >= 0.7) return 2;
    return 1;
  }

  showArtifactDisplay() {
    return new Promise((res) => {
      const icons = ["list", "bar", "crown", "star4", "arrow", "chart", "swap", "magnifier"];
      const zoneX0 = VX + 40, zoneY = 420, spacing = 68;
      icons.forEach((kind, i) => {
        const x = zoneX0 + i * spacing;
        const anvil = this.add.rectangle(x, zoneY + 20, 26, 8, 0x2a2a2a).setDepth(20);
        const art = this.add.container(x, zoneY + 50).setDepth(21);
        const g = this.add.graphics();
        g.fillStyle(C_AMBER, 1);
        this._drawArtifactIcon(g, kind);
        art.add(g);
        this.time.delayedCall(i * 150, () => {
          if (!this._alive) return;
          this.tweens.add({ targets: art, y: zoneY - 10, duration: 200, ease: "Back.easeOut" });
          const p = this.add.particles(x, zoneY + 10, "l24_dot", {
            speed: { min: 40, max: 100 }, angle: { min: 250, max: 290 },
            scale: { start: 0.6, end: 0 }, lifespan: 400, tint: [C_EMBER, C_AMBER], emitting: false,
          }).setDepth(22);
          p.explode(6);
          this.time.delayedCall(500, () => p.destroy());
        });
      });
      this.time.delayedCall(icons.length * 150 + 500, res);
    });
  }

  _drawArtifactIcon(g, kind) {
    switch (kind) {
      case "list":
        g.fillRect(-12, -10, 24, 4); g.fillRect(-12, -2, 24, 4); g.fillRect(-12, 6, 24, 4);
        break;
      case "bar":
        g.fillRect(-14, -10, 28, 20);
        break;
      case "crown":
        g.fillTriangle(-12, 8, -6, -10, 0, 8);
        g.fillTriangle(-6, 8, 0, -6, 6, 8);
        g.fillTriangle(0, 8, 6, -10, 12, 8);
        break;
      case "star4":
        g.fillTriangle(0, -12, 4, -2, 12, 0);
        g.fillTriangle(0, -12, -4, -2, -12, 0);
        g.fillTriangle(0, 12, 4, 2, 12, 0);
        g.fillTriangle(0, 12, -4, 2, -12, 0);
        break;
      case "arrow":
        g.fillRect(-12, -3, 18, 6);
        g.fillTriangle(-12, -8, -12, 8, -20, 0);
        break;
      case "chart":
        g.fillRect(-12, 0, 6, 10); g.fillRect(-3, -6, 6, 16); g.fillRect(6, -10, 6, 20);
        break;
      case "swap":
        g.fillRect(-10, -3, 14, 4); g.fillTriangle(4, -8, 4, 2, 12, -3);
        g.fillRect(-4, 1, 14, 4); g.fillTriangle(-8, 8, -8, -2, -16, 3);
        break;
      case "magnifier":
        g.lineStyle(3, C_AMBER, 1);
        g.strokeCircle(-2, -2, 8);
        g.lineBetween(4, 4, 12, 12);
        break;
    }
  }

  showScoreBreakdown(accuracy) {
    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
    this.tweens.add({ targets: ov, fillAlpha: 0.88, duration: 500 });

    const title = this.add.text(640, 65, "ALL DATA FORGED!", {
      font: "bold 32px Arial", color: HEX_AMBER,
    }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: title, alpha: 1, duration: 400 });
    this.tweens.add({ targets: title, alpha: 0.65, duration: 700, delay: 600, yoyo: true, repeat: -1 });

    const listY0 = 115;
    this.projectResults.forEach((p, i) => {
      const stars = p.attempts === 1 ? 3 : p.attempts === 2 ? 2 : 1;
      const line = "★".repeat(stars) + "☆".repeat(3 - stars);
      const t = this.add.text(640, listY0 + i * 24, `${i + 1}. ${PROJECTS[i].title}  —  ${line}  (${p.attempts} attempt${p.attempts > 1 ? "s" : ""})`, {
        font: "13px Arial", color: "#e0e0e0",
      }).setOrigin(0.5).setDepth(91).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 200, delay: 200 + i * 80 });
    });

    const statsY = listY0 + PROJECTS.length * 24 + 20;
    const stats = [
      `Total Score: ${this.totalScore}`,
      `Overall Accuracy: ${Math.round(accuracy * 100)}%`,
      `Total Time: ${Math.round(this.totalSeconds)}s`,
    ];
    stats.forEach((s, i) => {
      const t = this.add.text(640, statsY + i * 22, s, { font: "bold 14px Arial", color: HEX_CYAN })
        .setOrigin(0.5).setDepth(91).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 250, delay: 1400 + i * 150 });
    });

    const badgeY = statsY + 100;
    const badge = this.add.container(640, badgeY).setDepth(91).setAlpha(0);
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillCircle(0, 0, 36);
    bg.lineStyle(3, C_AMBER, 1);
    bg.strokeCircle(0, 0, 36);
    bg.fillStyle(0x78909c, 1);
    bg.fillRect(-16, 6, 32, 8);
    bg.fillTrapezoid ? null : null;
    bg.beginPath();
    bg.moveTo(-20, 6); bg.lineTo(20, 6); bg.lineTo(14, -6); bg.lineTo(-14, -6); bg.closePath();
    bg.fillPath();
    bg.fillStyle(C_AMBER, 1);
    bg.fillRect(-12, -14, 4, 10);
    bg.fillRect(8, -14, 4, 10);
    badge.add(bg);
    this.tweens.add({ targets: badge, alpha: 1, duration: 400, delay: 1900, ease: "Back.easeOut" });
    this.tweens.add({ targets: badge, angle: 4, duration: 3000, delay: 2300, yoyo: true, repeat: -1 });
    const badgeLbl = this.add.text(640, badgeY + 46, "ARRAY SMITH", { font: "bold 15px Arial", color: HEX_AMBER })
      .setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: badgeLbl, alpha: 1, duration: 300, delay: 2000 });

    this._makeButton(500, badgeY + 100, "RETRY", 160, 46, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(780, badgeY + 100, "MODULE COMPLETE →", 260, 46, { fill: C_ORANGE, stroke: C_ORANGE, textColor: "#ffffff" }, () => {
      this.scene.start("MenuScene");
    });
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
    const t = this.add.text(0, 0, label, { font: "bold 16px Arial", color: style.textColor }).setOrigin(0.5);
    c.add([g, t]);
    c.setSize(w, h);
    c.setInteractive({ useHandCursor: true });
    c.on("pointerover", () => { draw(true); c.setScale(1.04); });
    c.on("pointerout", () => { draw(false); c.setScale(1); });
    c.on("pointerdown", onClick);
    return c;
  }
}
