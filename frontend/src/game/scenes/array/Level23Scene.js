/**
 * Level 23 — "Index Interceptor" (Arrays: Tuning Phase)
 * ========================================================
 * Rapid-fire cybersecurity command-center challenges that tune and correct
 * the learner's array understanding. Data Packets descend as visual timers;
 * the player must judge/predict/fix/interpret array operations before the
 * packet reaches the console desk.
 *
 * 15 waves across 5 challenge types:
 *  A. Valid or Invalid?     — judge whether an access is legal
 *  B. What's the Output?    — predict println() output
 *  C. Spot the Bug          — pick the correct fix for buggy code
 *  D. Index or Value?       — discriminate the meaning of a highlighted number
 *  E. Match the Expression  — do two expressions produce the same result?
 *
 * Authored in a 1280x720 world space; the shared game canvas is 800x600
 * (Scale.NONE), so the main camera is zoomed to letterbox-fit the command
 * center into whatever canvas size is active (same approach as Level22).
 */

import Phaser from "phaser";
import { GameManager } from "../../GameManager.js";
import { BadgeSystem } from "../../BadgeSystem.js";

const W = 1280, H = 720;

// Mini cell geometry (array reference display)
const MC_W = 72, MC_H = 60, MC_GAP = 6;
const MC_Y = 165;             // vertical center of the mini cell row

// Colors
const C_CYAN = 0x00e5ff, C_AMBER = 0xffd740, C_GREEN = 0x00e676;
const C_RED = 0xf44336, C_GRAY = 0x78909c, C_MAGENTA = 0xff4081;
const HEX_CYAN = "#00e5ff", HEX_AMBER = "#ffd740", HEX_GREEN = "#00e676";
const HEX_RED = "#f44336", HEX_GRAY = "#78909c", HEX_MAGENTA = "#ff4081";

// ─────────────────────────────────────────────────────────────────
// Wave configuration
// ─────────────────────────────────────────────────────────────────
const WAVES = [
  { wave: 1, type: "valid_invalid", timeLimit: 12000,
    array: { name: "arr", type: "int[]", values: [10, 20, 30, 40, 50] },
    expression: "arr[2]", isValid: true, targetIndex: 2, concept: "basic_valid" },

  { wave: 2, type: "valid_invalid", timeLimit: 12000,
    array: { name: "arr", type: "int[]", values: [10, 20, 30, 40, 50] },
    expression: "arr[5]", isValid: false, errorType: "oob", concept: "out_of_bounds" },

  { wave: 3, type: "predict_output", timeLimit: 11000,
    array: { name: "nums", type: "int[]", values: [5, 10, 15, 20] },
    code: ["int[] nums = {5, 10, 15, 20};", "System.out.println(nums[2]);"],
    accessIndex: 2, options: ["10", "15", "20", "2"], correctIndex: 1, concept: "basic_access" },

  { wave: 4, type: "index_vs_value", timeLimit: 11000,
    array: { name: "arr", type: "int[]", values: [42, 17, 88] },
    expression: "arr[1] = 17", highlightPart: "1", highlightIsIndex: true, concept: "identify_index" },

  { wave: 5, type: "valid_invalid", timeLimit: 10000,
    array: { name: "arr", type: "int[]", values: [3, 6, 9] },
    expression: "arr[arr.length]", isValid: false, errorType: "length_equals_oob", concept: "length_is_oob" },

  { wave: 6, type: "predict_output", timeLimit: 10000,
    array: { name: "data", type: "int[]", values: [3, 6, 9] },
    code: ["int[] data = {3, 6, 9};", "System.out.println(data[data.length - 1]);"],
    accessIndex: 2, options: ["3", "9", "6", "Error!"], correctIndex: 1, concept: "length_minus_one" },

  { wave: 7, type: "spot_bug", timeLimit: 10000,
    array: { name: "scores", type: "int[]", values: [88, 92, 75, 95] },
    code: ["int[] scores = {88, 92, 75, 95};", "int last = scores[scores.length];"],
    bugLine: 1, intendedBehavior: "Get the last element (95)",
    fixes: [
      "Change scores[scores.length] to scores[scores.length - 1]",
      "Change scores[scores.length] to scores[0]",
      "Change scores[scores.length] to scores[scores.length + 1]",
    ], correctFixIndex: 0, concept: "length_oob_fix" },

  { wave: 8, type: "match_expression", timeLimit: 9000,
    array: { name: "a", type: "int[]", values: [10, 20, 30, 40, 50] },
    exprA: "a[0]", exprB: "a[a.length - 5]", resultA: "10", resultB: "10",
    idxA: 0, idxB: 0, isSame: true, concept: "equivalent_expressions" },

  { wave: 9, type: "valid_invalid", timeLimit: 9000,
    array: { name: "arr", type: "int[]", values: [1, 2, 3, 4] },
    expression: "arr[-1]", isValid: false, errorType: "negative", concept: "negative_index" },

  { wave: 10, type: "predict_output", timeLimit: 9000,
    array: { name: "x", type: "int[]", values: [1, 2, 3, 4, 5] },
    code: ["int[] x = {1, 2, 3, 4, 5};", "x[2] = 99;", "System.out.println(x[2]);"],
    accessIndex: 2, modifyIndex: 2, modifyValue: 99,
    options: ["3", "99", "2", "Error!"], correctIndex: 1, concept: "modification" },

  { wave: 11, type: "index_vs_value", timeLimit: 8000,
    array: { name: "arr", type: "int[]", values: [7, 14, 21] },
    expression: "arr.length == 3", highlightPart: "3", highlightIsIndex: false,
    concept: "length_is_count",
    customQuestion: "The '3' in arr.length == 3 represents:",
    customOptions: ["A valid array INDEX", "The ELEMENT COUNT (not an index)"],
    correctOptionIndex: 1 },

  { wave: 12, type: "spot_bug", timeLimit: 8000,
    array: { name: "arr", type: "int[]", values: [1, 2, 3, 4, 5] },
    code: ["int[] arr = {1, 2, 3, 4, 5};", "for (int i = 0; i <= arr.length; i++) {", '    System.out.print(arr[i] + " ");', "}"],
    bugLine: 1, intendedBehavior: "Print all elements: 1 2 3 4 5",
    fixes: [
      "Change i <= arr.length to i < arr.length",
      "Change i = 0 to i = 1",
      "Change arr[i] to arr[i - 1]",
    ], correctFixIndex: 0, concept: "loop_bounds_fix" },

  { wave: 13, type: "match_expression", timeLimit: 8000,
    array: { name: "a", type: "int[]", values: [10, 20, 30, 40, 50] },
    exprA: "a[4]", exprB: "a[a.length]", resultA: "50", resultB: "Error!",
    idxA: 4, idxB: 5, isSame: false, concept: "valid_vs_oob" },

  { wave: 14, type: "valid_invalid", timeLimit: 7000,
    array: { name: "arr", type: "int[]", values: [5, 10, 15] },
    expression: "arr[arr.length - 1]", isValid: true, targetIndex: 2, concept: "length_minus_one_valid" },

  { wave: 15, type: "predict_output", timeLimit: 7000,
    array: { name: "arr", type: "int[]", values: [2, 4, 6, 8] },
    code: ["int[] arr = {2, 4, 6, 8};", "int result = arr[0] + arr[3];", "System.out.println(result);"],
    accessIndices: [0, 3],
    options: ["6", "10", "12", "Error!"], correctIndex: 1, concept: "multi_access_expression" },
];

const BIT_FEEDBACK = {
  basic_valid:          "arr[2] on a 5-element array is perfectly valid! Index 2 exists — indices go 0, 1, 2, 3, 4.",
  out_of_bounds:        "arr[5] is OUT OF BOUNDS! A 5-element array has indices 0–4. Index 5 doesn't exist!",
  basic_access:         "Count from [0]: nums[0]=5, nums[1]=10, nums[2]=15. The answer is 15, not 10!",
  identify_index:       "In arr[1], the number 1 inside the brackets is the INDEX — the position. The VALUE at that position is 17.",
  length_is_oob:        "arr[arr.length] is ALWAYS out of bounds! length=3 means arr[3], but indices only go 0, 1, 2.",
  length_minus_one:     "arr[length - 1] gives the last element. length=3, so [3-1] = [2]. data[2] = 9.",
  length_oob_fix:       "scores[scores.length] crashes because length=4 but max index is 3. Use scores[scores.length - 1]!",
  equivalent_expressions: "a[0] = 10. a[a.length-5] = a[5-5] = a[0] = 10. Same result through different paths!",
  negative_index:       "Java does NOT support negative indices! arr[-1] always throws an error. No Python-style wraparound.",
  modification:         "x[2] = 99 replaces the value at index 2. After that, x[2] is 99, not the original 3.",
  length_is_count:      "arr.length gives the COUNT of elements (3), not the last index (2). The count is NOT a valid index!",
  loop_bounds_fix:      "i <= arr.length tries i=5 on a 5-element array — out of bounds! Use i < arr.length to stop at i=4.",
  valid_vs_oob:         "a[4] = 50 (valid — last index). But a[a.length] = a[5] = ERROR! length is 5, max index is 4.",
  length_minus_one_valid: "arr[arr.length-1] is always the LAST element and always VALID. length=3, so [3-1] = [2] ✓",
  multi_access_expression: "arr[0]=2 and arr[3]=8. So arr[0]+arr[3] = 2+8 = 10. Each access evaluates independently.",
};

const RAIN_CHARS = ["0", "1", "{", "}", "[", "]", ";", "=", "+", "i"];
const RAIN_X = [80, 180, 300, 420, 530, 670, 780, 900, 1020, 1150];

export class Level23Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level23Scene" });
  }

  init() {
    this.currentWave = 0;
    this.score = 0;
    this.displayScore = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.integrity = 100;
    this.correctFirstTry = 0;
    this.totalAnswerTime = 0;
    this.challengeBreakdown = {
      valid_invalid: { correct: 0, total: 0 },
      predict_output: { correct: 0, total: 0 },
      spot_bug: { correct: 0, total: 0 },
      index_vs_value: { correct: 0, total: 0 },
      match_expression: { correct: 0, total: 0 },
    };
    this.waveElements = [];
    this.miniCells = [];
    this.answered = false;
    this.gameEnded = false;
    this._alive = true;
    this._bubble = null;
    this.packet = null;
    this.packetTween = null;
    this.timerTween = null;
    this.waveStart = 0;
  }

  preload() {}

  create() {
    this._alive = true;
    this.events.once("shutdown", () => { this._alive = false; });

    const cam = this.cameras.main;
    const zoom = Math.min(this.scale.width / W, this.scale.height / H);
    cam.setZoom(zoom);
    cam.centerOn(W / 2, H / 2);
    cam.setBackgroundColor("#040810");

    try { GameManager.incrementAttempt(22); } catch (_) {}

    this.createParticleTexture();
    this.createBackground();
    this.createMonitorOutlines();
    this.createConsoleDeskSurface();
    this.createDataRain();
    this.createStatusLEDs();
    this.createHUD();
    this.createArrayReferenceDisplay();
    this.createIntegrityBar();
    this.createBit();

    cam.fadeIn(700, 4, 8, 16);
    this.time.delayedCall(400, () => this.startWave(0));
  }

  update(time, delta) {
    this.updateDataRain(delta);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // SETUP — background & environment
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l23_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l23_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x040810).setDepth(0);
  }

  createMonitorOutlines() {
    const specs = [
      [30, 50, 280, 180], [970, 50, 280, 180],
      [30, 260, 200, 130], [1050, 260, 200, 130],
    ];
    this.monitorGraphics = [];
    specs.forEach(([x, y, w, h]) => {
      const g = this.add.graphics().setDepth(1);
      g.fillStyle(0x080c14, 1);
      g.fillRoundedRect(x, y, w, h, 6);
      g.lineStyle(1, 0x1a2535, 0.05);
      g.strokeRoundedRect(x, y, w, h, 6);
      this.monitorGraphics.push({ g, x, y, w, h });

      const led = this.add.circle(x + w - 10, y + h - 10, 2, 0x00e676, 0.06).setDepth(1);
      const blink = () => {
        if (!led.active) return;
        this.tweens.add({
          targets: led, alpha: 0.08, duration: Phaser.Math.Between(600, 900), yoyo: true,
          onComplete: () => this.time.delayedCall(Phaser.Math.Between(2000, 5000), blink),
        });
      };
      this.time.delayedCall(Phaser.Math.Between(0, 3000), blink);
    });
  }

  createConsoleDeskSurface() {
    const g = this.add.graphics().setDepth(3);
    g.fillStyle(0x0c1018, 1);
    g.fillRect(0, 548, W, 172);
    g.lineStyle(1, 0x1a2535, 0.35);
    g.lineBetween(0, 548, W, 548);
    this.deskTopLine = g;
    this.deskTopY = 548;

    const decor = this.add.graphics().setDepth(3);
    const spots = [[150, 590], [560, 610], [980, 595]];
    spots.forEach(([x, y]) => {
      decor.lineStyle(1, 0x1a2535, 0.04);
      decor.fillStyle(0x0a0e16, 1);
      decor.fillRect(x, y, 40, 20);
      decor.strokeRect(x, y, 40, 20);
      decor.fillStyle(0xffd740, 0.03);
      decor.fillCircle(x + 10, y + 10, 2);
      decor.fillCircle(x + 28, y + 10, 2);
    });
  }

  createDataRain() {
    this.rainColumns = RAIN_X.map((x) => {
      const count = Phaser.Math.Between(8, 12);
      const chars = [];
      for (let i = 0; i < count; i++) {
        const t = this.add.text(x, -20 + i * 22, Phaser.Utils.Array.GetRandom(RAIN_CHARS), {
          font: "10px Courier New", color: "#00e676",
        }).setOrigin(0.5).setAlpha(0.025).setDepth(2);
        chars.push(t);
      }
      return chars;
    });
    // periodic character randomization
    this.rainRandomEvent = this.time.addEvent({
      delay: 3000, loop: true,
      callback: () => {
        this.rainColumns.forEach((col) => {
          col.forEach((t) => { if (t.active) t.setText(Phaser.Utils.Array.GetRandom(RAIN_CHARS)); });
        });
      },
    });
  }

  updateDataRain(delta) {
    if (!this.rainColumns) return;
    const step = 0.25 * (delta / 16.7);
    this.rainColumns.forEach((col) => {
      col.forEach((t) => {
        t.y += step;
        if (t.y > 540) t.y = -20;
      });
    });
  }

  createStatusLEDs() {
    const colors = [0x00e676, 0xffd740, 0xf44336, 0x00e5ff];
    this.statusLEDs = [];
    [12, 1266].forEach((x) => {
      colors.forEach((color, i) => {
        const led = this.add.circle(x, 400 + i * 18, 2, color, 0).setDepth(2);
        const tween = this.tweens.add({
          targets: led, alpha: 0.4, duration: Phaser.Math.Between(1500, 4000),
          delay: Phaser.Math.Between(0, 1500), yoyo: true, repeat: -1,
        });
        this.statusLEDs.push({ led, tween, color });
      });
    });
  }

  // ══════════════════════════════════════════════════════════════
  // HUD
  // ══════════════════════════════════════════════════════════════

  createHUD() {
    const g = this.add.graphics().setDepth(50);
    g.fillStyle(0x0a0a14, 0.94);
    g.fillRect(0, 0, W, 68);
    g.lineStyle(1, 0x1a1a3a, 1);
    g.lineBetween(0, 68, W, 68);

    this.add.text(20, 12, "INDEX INTERCEPTOR", { font: "bold 14px Arial", color: "#b0bec5" }).setDepth(51);
    this.add.text(20, 30, "Tuning Phase — Arrays", { font: "11px Arial", color: "#546e7a" }).setDepth(51);
    this.waveText = this.add.text(20, 47, `WAVE 1 / ${WAVES.length}`, {
      font: "bold 13px Arial", color: HEX_AMBER,
    }).setDepth(51);

    // Timer bar (center)
    this.add.text(640, 8, "TIME", { font: "9px Arial", color: "#546e7a" }).setOrigin(0.5, 0).setDepth(51);
    const tbg = this.add.graphics().setDepth(51);
    tbg.fillStyle(0x1a1a2e, 1);
    tbg.fillRoundedRect(490, 22, 300, 14, 7);
    this.timerBarBg = tbg;
    this.timerFill = this.add.graphics().setDepth(51);
    this._drawTimerFill(1, C_CYAN);

    // Right section
    this.add.text(1060, 10, "SCORE", { font: "9px Arial", color: "#546e7a" }).setDepth(51);
    this.scoreText = this.add.text(1060, 22, "0", { font: "bold 20px Arial", color: "#ffffff" }).setDepth(51);
    this.comboText = this.add.text(1150, 26, "×1", { font: "bold 16px Arial", color: HEX_AMBER }).setDepth(51);
    this.sysMiniText = this.add.text(1060, 48, "SYS: 100%", {
      font: "bold 11px Courier New", color: HEX_CYAN,
    }).setDepth(51);
  }

  _drawTimerFill(pct, color) {
    this.timerFill.clear();
    const w = Math.max(0, 296 * pct);
    this.timerFill.fillStyle(color, 1);
    this.timerFill.fillRoundedRect(492, 24, w, 10, 5);
  }

  // ══════════════════════════════════════════════════════════════
  // ARRAY REFERENCE DISPLAY
  // ══════════════════════════════════════════════════════════════

  createArrayReferenceDisplay() {
    const g = this.add.graphics().setDepth(15);
    g.fillStyle(0x0d1117, 1);
    g.fillRoundedRect(140, 85, 1000, 135, 10);
    g.lineStyle(1, 0x21262d, 1);
    g.strokeRoundedRect(140, 85, 1000, 135, 10);

    this.add.text(152, 95, "ACTIVE ARRAY", {
      font: "bold 10px Arial", color: "#3d4450",
    }).setDepth(16);

    this.declGroup = null;
    this.declValueTexts = [];
  }

  async updateArrayReference(config) {
    await this._rebuildDeclaration(config);
    await this._rebuildMiniCells(config.values);
  }

  _rebuildDeclaration(config) {
    return new Promise((res) => {
      const old = this.declGroup;
      const build = () => {
        const c = this.add.container(0, 105).setDepth(16);
        let x = 155;
        const font = "14px Courier New", fontB = "bold 14px Courier New";
        this.declValueTexts = [];
        const put = (t, color, bold) => {
          const txt = this.add.text(x, 0, t, { font: bold ? fontB : font, color }).setOrigin(0, 0.5);
          c.add(txt);
          x += txt.width;
          return txt;
        };
        put(config.type, "#ff4081", true);
        put(" " + config.name, HEX_CYAN);
        put(" = {", HEX_GRAY);
        config.values.forEach((v, i) => {
          this.declValueTexts.push(put(String(v), HEX_AMBER));
          if (i < config.values.length - 1) put(", ", HEX_GRAY);
        });
        put("};", HEX_GRAY);
        c.setAlpha(0);
        this.tweens.add({ targets: c, alpha: 1, duration: 150, onComplete: () => res() });
        this.declGroup = c;
      };
      if (old) this.tweens.add({ targets: old, alpha: 0, duration: 150, onComplete: () => { old.destroy(); build(); } });
      else build();
    });
  }

  _rebuildMiniCells(values) {
    return new Promise((res) => {
      const old = this.miniCells;
      this.miniCells = [];
      const buildNew = () => {
        old.forEach((c) => c.container.destroy());
        this.hideMiniOOB(false);
        const n = values.length;
        const totalW = n * MC_W + (n - 1) * MC_GAP;
        const startX = 640 - totalW / 2;
        values.forEach((v, i) => {
          const x = startX + i * (MC_W + MC_GAP) + MC_W / 2;
          this.miniCells.push(this._createMiniCell(i, v, x, MC_Y));
        });
        const targets = this.miniCells.map((c) => c.container);
        targets.forEach((t) => t.setAlpha(0));
        this._drawMiniBracket(n);
        this.tweens.add({ targets, alpha: 1, duration: 150, onComplete: () => res() });
      };
      if (old.length) {
        this.tweens.add({
          targets: old.map((c) => c.container), alpha: 0, duration: 150,
          onComplete: buildNew,
        });
      } else buildNew();
    });
  }

  _createMiniCell(index, value, x, y) {
    const container = this.add.container(x, y).setDepth(16);
    const glow = this.add.rectangle(0, 0, MC_W + 6, MC_H + 6, C_CYAN, 0);
    const body = this.add.graphics();
    this._drawMiniBody(body, 0x2a3a4a, 1);
    const indexLabel = this.add.text(0, -MC_H / 2 - 16, `[${index}]`, {
      font: "bold 12px Courier New", color: HEX_AMBER,
    }).setOrigin(0.5);
    const valueText = this.add.text(0, 0, String(value), {
      font: "bold 18px Courier New", color: HEX_CYAN,
    }).setOrigin(0.5);
    container.add([glow, body, indexLabel, valueText]);
    return { container, glow, body, indexLabel, valueText, index, value, x, y, pulse: null };
  }

  _drawMiniBody(g, strokeColor, lineWidth, dashed = false) {
    g.clear();
    g.fillStyle(0x0a0e14, 1);
    g.fillRoundedRect(-MC_W / 2, -MC_H / 2, MC_W, MC_H, 6);
    g.lineStyle(lineWidth, strokeColor, 1);
    if (dashed) this._dashedRectOutline(g, -MC_W / 2, -MC_H / 2, MC_W, MC_H, 5, 4);
    else g.strokeRoundedRect(-MC_W / 2, -MC_H / 2, MC_W, MC_H, 6);
  }

  _dashedRectOutline(g, x, y, w, h, dash, gap) {
    const side = (x1, y1, x2, y2) => {
      const len = Phaser.Math.Distance.Between(x1, y1, x2, y2);
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

  _drawMiniBracket(count) {
    if (this.miniBracket) { this.miniBracket.g.destroy(); this.miniBracket.txt.destroy(); }
    const totalW = count * MC_W + (count - 1) * MC_GAP;
    const startX = 640 - totalW / 2;
    const y = MC_Y + MC_H / 2 + 10;
    const g = this.add.graphics().setDepth(16);
    g.lineStyle(1, 0x546e7a, 1);
    g.lineBetween(startX, y - 4, startX + totalW, y - 4);
    const txt = this.add.text(640, y + 3, `length = ${count}`, {
      font: "12px Courier New", color: HEX_GRAY,
    }).setOrigin(0.5).setDepth(16);
    this.miniBracket = { g, txt };
  }

  /** state: 'cyan' | 'green' | 'red' | 'default' */
  highlightMiniCell(index, state) {
    const cell = this.miniCells[index];
    if (!cell) return;
    if (cell.pulse) { cell.pulse.stop(); cell.pulse = null; }
    cell.glow.setFillStyle(C_CYAN, 0);
    const map = { cyan: [C_CYAN, "highlighted"], green: [C_GREEN, "correct"], red: [C_RED, "error"], default: [0x2a3a4a, "default"] };
    const [color] = map[state] || map.default;
    if (state === "default") { this._drawMiniBody(cell.body, 0x2a3a4a, 1); return; }
    this._drawMiniBody(cell.body, color, 2);
    cell.glow.setFillStyle(color, 0.1);
    cell.pulse = this.tweens.add({ targets: cell.glow, fillAlpha: 0.2, duration: 500, yoyo: true, repeat: -1 });
  }

  resetMiniCells() {
    this.miniCells.forEach((c) => {
      if (c.pulse) { c.pulse.stop(); c.pulse = null; }
      this._drawMiniBody(c.body, 0x2a3a4a, 1);
      c.glow.setFillStyle(C_CYAN, 0);
    });
    this.hideMiniOOB();
  }

  /** Ghost cell for OOB reference: side='right' beyond last cell, side='left' before [0]. */
  showMiniOOB(side, index) {
    this.hideMiniOOB(false);
    const n = this.miniCells.length;
    const pos = side === "left"
      ? { x: this.miniCells[0].x - (MC_W + MC_GAP), y: MC_Y }
      : { x: this.miniCells[n - 1].x + (MC_W + MC_GAP), y: MC_Y };
    const c = this.add.container(pos.x, pos.y).setDepth(16).setAlpha(0);
    const body = this.add.graphics();
    body.fillStyle(0x0a0e14, 0.3);
    body.fillRoundedRect(-MC_W / 2, -MC_H / 2, MC_W, MC_H, 6);
    body.lineStyle(2, C_RED, 1);
    this._dashedRectOutline(body, -MC_W / 2, -MC_H / 2, MC_W, MC_H, 5, 4);
    const idx = this.add.text(0, -MC_H / 2 - 16, `[${index}]`, {
      font: "bold 12px Courier New", color: HEX_RED,
    }).setOrigin(0.5);
    const val = this.add.text(0, 0, "❌", { font: "18px Arial", color: HEX_RED }).setOrigin(0.5);
    c.add([body, idx, val]);
    this.tweens.add({ targets: c, alpha: 1, duration: 250 });
    this.miniOOB = c;
    return c;
  }

  hideMiniOOB(fade = true) {
    if (!this.miniOOB) return;
    const c = this.miniOOB;
    this.miniOOB = null;
    if (fade) this.tweens.add({ targets: c, alpha: 0, duration: 200, onComplete: () => c.destroy() });
    else c.destroy();
  }

  // ══════════════════════════════════════════════════════════════
  // SYSTEM INTEGRITY BAR
  // ══════════════════════════════════════════════════════════════

  createIntegrityBar() {
    const g = this.add.graphics().setDepth(50);
    g.fillStyle(0x1a1a2e, 1);
    g.lineStyle(1, 0x2a2a4a, 1);
    g.fillRoundedRect(430, 685, 420, 18, 9);
    g.strokeRoundedRect(430, 685, 420, 18, 9);
    this.integrityBarBg = g;
    this.integrityFill = this.add.graphics().setDepth(51);
    this.integrityPct = this.add.text(850, 668, "100%", {
      font: "bold 12px Courier New", color: HEX_CYAN,
    }).setOrigin(1, 0.5).setDepth(51);
    this.add.text(640, 707, "SYSTEM INTEGRITY", {
      font: "bold 10px Arial", color: "#546e7a",
    }).setOrigin(0.5).setDepth(51);
    this._drawIntegrityFill();
  }

  _integrityColor() {
    if (this.integrity > 59) return C_CYAN;
    if (this.integrity > 29) return C_AMBER;
    return C_RED;
  }

  _drawIntegrityFill() {
    if (this.integrityPulse) { this.integrityPulse.stop(); this.integrityPulse = null; }
    const color = this._integrityColor();
    const w = Math.max(0, 414 * (this.integrity / 100));
    this.integrityFill.clear();
    this.integrityFill.fillStyle(color, 1);
    this.integrityFill.fillRoundedRect(433, 688, w, 12, 6);
    const hex = "#" + color.toString(16).padStart(6, "0");
    this.integrityPct.setText(`${this.integrity}%`).setColor(hex);
    if (this.sysMiniText) this.sysMiniText.setText(`SYS: ${this.integrity}%`).setColor(hex);
    if (this.integrity <= 29) {
      this.integrityPulse = this.tweens.add({
        targets: this.integrityFill, alpha: 0.6, duration: 350, yoyo: true, repeat: -1,
      });
    } else {
      this.integrityFill.setAlpha(1);
    }
  }

  damageIntegrity() {
    this.integrity = Math.max(0, this.integrity - 20);
    const from = { w: 0 };
    this.tweens.add({ targets: from, w: 1, duration: 400, onUpdate: () => this._drawIntegrityFill() });
    // spark burst at fill's right edge
    const edgeX = 433 + Math.max(0, 414 * (this.integrity / 100));
    const p = this.add.particles(edgeX, 694, "l23_dot", {
      speed: { min: 40, max: 120 }, angle: { min: 200, max: 340 },
      scale: { start: 0.6, end: 0 }, lifespan: 400,
      tint: [0xf44336, 0xff8a65], emitting: false,
    }).setDepth(55);
    p.explode(8);
    this.time.delayedCall(500, () => p.destroy());
    this.tweens.add({ targets: this.integrityPct, x: this.integrityPct.x + 3, duration: 33, yoyo: true, repeat: 5 });
  }

  // ══════════════════════════════════════════════════════════════
  // BIT — mascot & speech (same pattern as Level22)
  // ══════════════════════════════════════════════════════════════

  createBit() {
    const c = this.add.container(W + 80, 620).setDepth(60);
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
    const c = this.add.container(bx, by).setDepth(61).setAlpha(0).setScale(0.7);
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
    await this.bitSlideTo(1060, 620);
    if (!this._alive) return;
    await this.bitSay(message);
    if (!this._alive) return;
    await Promise.race([this.waitForClick(), this.delay(3200)]);
    this.hideBubble();
    await this.bitSlideTo(W + 80, 620, 250);
  }

  // ══════════════════════════════════════════════════════════════
  // WAVE MANAGEMENT
  // ══════════════════════════════════════════════════════════════

  async startWave(index) {
    if (!this._alive || this.gameEnded) return;
    this.currentWave = index;
    const cfg = WAVES[index];
    this.answered = false;
    this.waveStart = this.time.now;
    this.clearWave();

    this.waveText.setText(`WAVE ${cfg.wave} / ${WAVES.length}`);
    this.tweens.add({ targets: this.waveText, scale: 1.3, duration: 150, yoyo: true });

    await this.showWaveTransition(cfg.wave);
    if (!this._alive || this.gameEnded) return;

    await this.updateArrayReference(cfg.array);
    if (!this._alive || this.gameEnded) return;

    this.renderChallenge(cfg);
    this.spawnPacket(cfg);
  }

  showWaveTransition(num) {
    return new Promise((res) => {
      const t = this.add.text(640, 360, `WAVE ${num}`, {
        font: "bold 38px Arial", color: HEX_AMBER,
      }).setOrigin(0.5).setScale(0).setDepth(70);
      this.tweens.add({
        targets: t, scale: 1.2, duration: 220, ease: "Back.easeOut",
        onComplete: () => this.tweens.add({
          targets: t, scale: 1, duration: 120,
          onComplete: () => this.time.delayedCall(280, () => {
            this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => { t.destroy(); res(); } });
          }),
        }),
      });
    });
  }

  clearWave() {
    if (this.packetTween) { this.packetTween.stop(); this.packetTween = null; }
    if (this.timerTween) { this.timerTween.stop(); this.timerTween = null; }
    if (this.packet) { this.packet.container.destroy(); this.packet = null; }
    this.hideBubble();
    this.resetMiniCells();
    this.waveElements.forEach((e) => { if (e && e.destroy) e.destroy(); });
    this.waveElements = [];
  }

  // ══════════════════════════════════════════════════════════════
  // DATA PACKET
  // ══════════════════════════════════════════════════════════════

  spawnPacket(cfg) {
    const expr = cfg.expression || (cfg.exprA ? `${cfg.exprA}  vs  ${cfg.exprB}` : cfg.code ? cfg.code[cfg.code.length - 1].trim() : "arr[?]");
    this.packet = this.createPacket(expr, cfg.timeLimit);
    this.startTimerBar(cfg.timeLimit);
  }

  createPacket(expression, timeLimit) {
    const x = Phaser.Math.Between(250, 1030);
    const y = 235;
    const container = this.add.container(x, y).setDepth(25);
    const header = this.add.rectangle(0, -18, 130, 6, C_AMBER).setOrigin(0.5, 0);
    const body = this.add.graphics();
    body.fillStyle(0x1a1a2e, 1);
    body.fillRoundedRect(-65, -21, 130, 42, 8);
    body.lineStyle(1, 0x3a4a5a, 1);
    body.strokeRoundedRect(-65, -21, 130, 42, 8);
    const label = expression.length > 20 ? expression.slice(0, 19) + "…" : expression;
    const text = this.add.text(0, 2, label, {
      font: "bold 12px Courier New", color: "#e0e0e0",
    }).setOrigin(0.5);
    const bin1 = this.add.text(0, -19, "01101", { font: "7px Courier New", color: "#3d4450" }).setOrigin(0.5).setAlpha(0.3);
    const bin2 = this.add.text(0, 19, "10010", { font: "7px Courier New", color: "#3d4450" }).setOrigin(0.5).setAlpha(0.3);
    const dot = this.add.circle(60, 0, 3, C_AMBER, 0.8);
    this.tweens.add({ targets: dot, alpha: 0.3, duration: 400, yoyo: true, repeat: -1 });
    container.add([body, header, text, bin1, bin2, dot]);

    const swayTween = this.tweens.add({
      targets: container, x: x + 12, duration: 2500, ease: "Sine.easeInOut", yoyo: true, repeat: -1,
    });

    const descentTween = this.tweens.add({
      targets: container, y: 540, duration: timeLimit, ease: "Linear",
      onComplete: () => { if (this._alive && !this.answered) this.onPacketReachesDesk(); },
    });
    this.packetTween = descentTween;

    return { container, header, text, dot, swayTween, descentTween, x0: x };
  }

  startTimerBar(duration) {
    const prog = { p: 1 };
    this._drawTimerFill(1, C_CYAN);
    this.timerTween = this.tweens.add({
      targets: prog, p: 0, duration, ease: "Linear",
      onUpdate: () => {
        const color = prog.p > 0.5 ? C_CYAN : prog.p > 0.25 ? C_AMBER : C_RED;
        this._drawTimerFill(prog.p, color);
      },
    });
  }

  onPacketReachesDesk() {
    if (this.answered || this.gameEnded) return;
    this.answered = true;
    const cfg = WAVES[this.currentWave];
    this.packetImpact();
    const msg = cfg.type === "valid_invalid"
      ? (cfg.isValid ? "That was VALID" : "That was INVALID")
      : "Time's up!";
    this.createFloatingText(this.packet ? this.packet.container.x : 640, 480, msg, HEX_AMBER, "bold 18px Arial");
    this.onWrongAnswer(cfg.concept, true);
  }

  packetAccepted() {
    if (!this.packet) return;
    const p = this.packet;
    p.swayTween.stop();
    p.header.setFillStyle(C_GREEN);
    const stamp = this.add.text(p.container.x, p.container.y, "✓ ACCEPTED", {
      font: "bold 12px Arial", color: HEX_GREEN,
    }).setOrigin(0.5).setScale(0).setDepth(26);
    this.tweens.add({ targets: stamp, scale: 1, duration: 200, ease: "Back.easeOut" });
    this.tweens.add({
      targets: [p.container, stamp], x: 1300, y: 100, alpha: 0, duration: 400, ease: "Cubic.easeIn",
      onComplete: () => { p.container.destroy(); stamp.destroy(); },
    });
    this.packet = null;
  }

  packetIntercepted() {
    if (!this.packet) return;
    const p = this.packet;
    p.swayTween.stop();
    p.header.setFillStyle(C_RED);
    const cx = p.container.x, cy = p.container.y;
    const stamp = this.add.text(cx, cy - 12, "⊘ INTERCEPTED", {
      font: "bold 12px Arial", color: HEX_RED,
    }).setOrigin(0.5).setScale(0).setDepth(26);
    this.tweens.add({ targets: stamp, scale: 1, duration: 200, ease: "Back.easeOut" });
    this.time.delayedCall(150, () => {
      // crack the packet into two halves
      const rightHalf = this.add.container(cx, cy).setDepth(25);
      const rg = this.add.graphics();
      rg.fillStyle(0x1a1a2e, 1);
      rg.fillRoundedRect(0, -21, 65, 42, 8);
      rg.lineStyle(1, C_RED, 1);
      rg.strokeRoundedRect(0, -21, 65, 42, 8);
      rightHalf.add(rg);
      this.tweens.add({ targets: p.container, x: cx - 60, angle: -15, alpha: 0, duration: 300 });
      this.tweens.add({
        targets: rightHalf, x: cx + 60, angle: 15, alpha: 0, duration: 300,
        onComplete: () => { p.container.destroy(); rightHalf.destroy(); stamp.destroy(); },
      });
      const sparks = this.add.particles(cx, cy, "l23_dot", {
        speed: { min: 60, max: 150 }, angle: { min: 0, max: 360 },
        scale: { start: 0.7, end: 0 }, lifespan: 400,
        tint: [C_RED, 0xff8a65], emitting: false,
      }).setDepth(26);
      sparks.explode(12);
      this.time.delayedCall(500, () => sparks.destroy());
    });
    this.packet = null;
  }

  packetImpact() {
    if (!this.packet) return;
    const p = this.packet;
    p.swayTween.stop();
    const cx = p.container.x, cy = 540;
    p.header.setFillStyle(C_RED);
    this.tweens.add({ targets: p.container, tint: C_RED, duration: 200 });
    this.tweens.add({
      targets: p.container, alpha: 0, y: cy + 10, duration: 250,
      onComplete: () => p.container.destroy(),
    });
    const sparks = this.add.particles(cx, this.deskTopY, "l23_dot", {
      speed: { min: 60, max: 160 }, angle: { min: 200, max: 340 },
      scale: { start: 0.7, end: 0 }, lifespan: 400,
      tint: [0xff5722, 0xf44336], emitting: false,
    }).setDepth(26);
    sparks.explode(15);
    this.time.delayedCall(500, () => sparks.destroy());
    this.screenShake(0.005, 250);
    this.deskTopLine.clear();
    this.deskTopLine.fillStyle(0x0c1018, 1);
    this.deskTopLine.fillRect(0, 548, W, 172);
    this.deskTopLine.lineStyle(2, C_RED, 0.5);
    this.deskTopLine.lineBetween(0, 548, W, 548);
    this.time.delayedCall(300, () => {
      if (!this.deskTopLine.active) return;
      this.deskTopLine.clear();
      this.deskTopLine.fillStyle(0x0c1018, 1);
      this.deskTopLine.fillRect(0, 548, W, 172);
      this.deskTopLine.lineStyle(1, 0x1a2535, 0.35);
      this.deskTopLine.lineBetween(0, 548, W, 548);
    });
    this.packet = null;
  }

  // ══════════════════════════════════════════════════════════════
  // CODE PANEL (Types B, C)
  // ══════════════════════════════════════════════════════════════

  _syntaxTokens(line) {
    // Simple tokenizer: strings, keywords, numbers, array access, punctuation
    const tokens = [];
    const re = /("(?:[^"\\]|\\.)*")|(\bint\b|\bString\b|\bfor\b|\bpublic\b|\bclass\b|\bstatic\b|\bvoid\b)|([A-Za-z_]\w*(?=\[))|(\.length)|(\b\d+\b)|([\[\]{}();=<>+\-])/g;
    let last = 0, m;
    const plain = (t) => t && tokens.push({ t, c: "#e0e0e0" });
    while ((m = re.exec(line))) {
      if (m.index > last) plain(line.slice(last, m.index));
      if (m[1]) tokens.push({ t: m[1], c: "#ce9178" });
      else if (m[2]) tokens.push({ t: m[2], c: "#569cd6" });
      else if (m[3]) tokens.push({ t: m[3], c: HEX_CYAN });
      else if (m[4]) tokens.push({ t: m[4], c: HEX_AMBER });
      else if (m[5]) tokens.push({ t: m[5], c: HEX_AMBER });
      else if (m[6]) tokens.push({ t: m[6], c: HEX_GRAY });
      last = m.index + m[0].length;
    }
    if (last < line.length) plain(line.slice(last));
    return tokens;
  }

  createCodePanel(lines, bugLine = -1) {
    const els = [];
    const px = 60, py = 245, pw = 520, ph = 200;
    const g = this.add.graphics().setDepth(20);
    g.fillStyle(0x0d1117, 1);
    g.fillRoundedRect(px, py, pw, ph, 10);
    g.lineStyle(1, 0x30363d, 1);
    g.strokeRoundedRect(px, py, pw, ph, 10);
    els.push(g);

    const tabG = this.add.graphics().setDepth(21);
    tabG.fillStyle(0x161b22, 1);
    tabG.fillRoundedRect(px, py, pw, 26, { tl: 10, tr: 10, bl: 0, br: 0 });
    tabG.fillStyle(C_CYAN, 1);
    tabG.fillRect(px, py + 24, 110, 2);
    els.push(tabG);
    els.push(this.add.text(px + 12, py + 6, "Challenge.java", {
      font: "11px Courier New", color: "#8b949e",
    }).setDepth(22));

    const lineTexts = [];
    lines.forEach((line, i) => {
      const ly = py + 34 + i * 20;
      els.push(this.add.text(px + 8, ly, String(i + 1), {
        font: "11px Courier New", color: "#3d4450",
      }).setDepth(22));
      const lineContainer = this.add.container(px + 38, ly).setDepth(22);
      let x = 0;
      this._syntaxTokens(line).forEach((tok) => {
        const t = this.add.text(x, 0, tok.t, { font: "13px Courier New", color: tok.c });
        lineContainer.add(t);
        x += t.width;
      });
      els.push(lineContainer);
      lineTexts.push(lineContainer);

      if (i === bugLine) {
        const uw = this.add.graphics().setDepth(23);
        uw.lineStyle(1.5, C_RED, 1);
        let wx = px + 38;
        for (let d = 0; d < x; d += 6) {
          const yy = ly + 15 + Math.sin(d * 0.8) * 2;
          uw.lineBetween(wx + d, yy, wx + Math.min(d + 6, x), ly + 15 + Math.sin((d + 6) * 0.8) * 2);
        }
        els.push(uw);
        els.push(this.add.text(px + 38 + x + 8, ly, "🐛", { font: "13px Arial" }).setDepth(23));
      }
    });

    this.waveElements.push(...els);
    return { els, lineTexts, px, py, pw, ph };
  }

  animateCodeExecution(panel, activeLines, onEach) {
    return new Promise(async (res) => {
      for (let i = 0; i < activeLines.length; i++) {
        if (!this._alive) return res();
        const idx = activeLines[i];
        const lc = panel.lineTexts[idx];
        if (lc) {
          const hl = this.add.rectangle(panel.px + 260, panel.py + 44 + idx * 20, 500, 20, C_CYAN, 0.08).setDepth(21);
          this.waveElements.push(hl);
          this.tweens.add({ targets: hl, alpha: 0, duration: 250, delay: 200 });
        }
        if (onEach) onEach(idx);
        await this.delay(250);
      }
      res();
    });
  }

  showConsoleOutput(text, color = HEX_GREEN) {
    const g = this.add.graphics().setDepth(20);
    g.fillStyle(0x000000, 1);
    g.fillRoundedRect(60, 460, 520, 30, 5);
    const t = this.add.text(72, 475, "", { font: "12px Courier New", color }).setOrigin(0, 0.5).setDepth(21);
    this.waveElements.push(g, t);
    return new Promise((res) => {
      let i = 0;
      const ev = this.time.addEvent({
        delay: 20, repeat: Math.max(0, text.length - 1),
        callback: () => { i++; if (t.active) t.setText(text.slice(0, i)); if (i >= text.length) res(); },
      });
      this.waveElements.push({ destroy: () => ev.remove() });
    });
  }

  // ══════════════════════════════════════════════════════════════
  // CHALLENGE RENDERING
  // ══════════════════════════════════════════════════════════════

  renderChallenge(cfg) {
    switch (cfg.type) {
      case "valid_invalid": this.renderValidInvalid(cfg); break;
      case "predict_output": this.renderPredictOutput(cfg); break;
      case "spot_bug": this.renderSpotBug(cfg); break;
      case "index_vs_value": this.renderIndexVsValue(cfg); break;
      case "match_expression": this.renderMatchExpression(cfg); break;
    }
  }

  _makeBigButton(x, y, w, h, strokeColor, iconDraw, label, onClick) {
    const c = this.add.container(x, y).setDepth(20);
    const g = this.add.graphics();
    const draw = (hoverA) => {
      g.clear();
      g.fillStyle(strokeColor, hoverA);
      g.fillRoundedRect(-w / 2, -h / 2, w, h, 12);
      g.lineStyle(2, strokeColor, 1);
      g.strokeRoundedRect(-w / 2, -h / 2, w, h, 12);
    };
    draw(0);
    c.add(g);
    if (iconDraw) iconDraw(c);
    const t = this.add.text(iconDraw ? -w / 2 + 56 : 0, 0, label, {
      font: "bold 14px Arial", color: "#e0e0e0", wordWrap: { width: w - 70 },
    }).setOrigin(iconDraw ? 0 : 0.5, 0.5);
    c.add(t);
    c.setSize(w, h);
    c.setInteractive({ useHandCursor: true });
    c.on("pointerover", () => { if (!this.answered) { draw(0.06); c.setScale(1.03); } });
    c.on("pointerout", () => { draw(0); c.setScale(1); });
    c.on("pointerdown", () => {
      if (this.answered) return;
      draw(0.1);
      onClick(c, draw);
    });
    this.waveElements.push(c);
    return c;
  }

  renderValidInvalid(cfg) {
    this._makeBigButton(320, 400, 240, 65, C_GREEN, (c) => {
      const ic = this.add.circle(-84, 0, 12).setStrokeStyle(2, C_GREEN);
      const ck = this.add.graphics();
      ck.lineStyle(2, C_GREEN, 1);
      ck.lineBetween(-89, 0, -85, 4);
      ck.lineBetween(-85, 4, -79, -5);
      c.add([ic, ck]);
    }, "VALID — No Error", () => {
      this.onValidInvalidAnswer(true, cfg);
    });
    this._makeBigButton(720, 400, 240, 65, C_RED, (c) => {
      const ic = this.add.circle(-84, 0, 12).setStrokeStyle(2, C_RED);
      const x1 = this.add.graphics();
      x1.lineStyle(2, C_RED, 1);
      x1.lineBetween(-89, -5, -79, 5);
      x1.lineBetween(-89, 5, -79, -5);
      c.add([ic, x1]);
    }, "INVALID — Error!", () => {
      this.onValidInvalidAnswer(false, cfg);
    });
  }

  renderPredictOutput(cfg) {
    const panel = this.createCodePanel(cfg.code);
    this._codePanel = panel;
    const positions = [[660, 260], [890, 260], [660, 335], [890, 335]];
    this._predictButtons = cfg.options.map((opt, i) => {
      const [x, y] = positions[i];
      const c = this.add.container(x, y).setDepth(20);
      const g = this.add.graphics();
      const draw = (stroke) => {
        g.clear();
        g.fillStyle(0x1a1a2e, 1);
        g.fillRoundedRect(-105, -29, 210, 58, 10);
        g.lineStyle(1.5, stroke, 1);
        g.strokeRoundedRect(-105, -29, 210, 58, 10);
      };
      draw(0x30363d);
      const t = this.add.text(0, 0, opt, { font: "bold 15px Courier New", color: "#e0e0e0" }).setOrigin(0.5);
      c.add([g, t]);
      c.setSize(210, 58);
      c.setInteractive({ useHandCursor: true });
      c.on("pointerover", () => { if (!this.answered) { draw(C_CYAN); c.setScale(1.03); } });
      c.on("pointerout", () => { draw(0x30363d); c.setScale(1); });
      c.on("pointerdown", () => { if (!this.answered) this.onPredictAnswer(i, cfg); });
      this.waveElements.push(c);
      return { c, g, draw, t };
    });
  }

  renderSpotBug(cfg) {
    const panel = this.createCodePanel(cfg.code, cfg.bugLine);
    this._codePanel = panel;

    const box = this.add.graphics().setDepth(20);
    box.fillStyle(0x0d2818, 1);
    box.lineStyle(1, C_GREEN, 1);
    box.fillRoundedRect(60, 452, 520, 30, 6);
    box.strokeRoundedRect(60, 452, 520, 30, 6);
    this.waveElements.push(box);
    this.waveElements.push(this.add.text(72, 467, `Intended: ${cfg.intendedBehavior}`, {
      font: "12px Arial", color: HEX_GREEN,
    }).setOrigin(0, 0.5).setDepth(21));

    this._fixButtons = cfg.fixes.map((fix, i) => {
      const y = 260 + i * 68;
      const c = this.add.container(840, y).setDepth(20);
      const g = this.add.graphics();
      const draw = (stroke) => {
        g.clear();
        g.fillStyle(0x1a1a2e, 1);
        g.fillRoundedRect(-240, -26, 480, 52, 10);
        g.lineStyle(1.5, stroke, 1);
        g.strokeRoundedRect(-240, -26, 480, 52, 10);
      };
      draw(0x30363d);
      const t = this.add.text(-210, 0, `🔧 ${fix}`, {
        font: "13px Arial", color: "#e0e0e0", wordWrap: { width: 420 },
      }).setOrigin(0, 0.5);
      c.add([g, t]);
      c.setSize(480, 52);
      c.setInteractive({ useHandCursor: true });
      c.on("pointerover", () => { if (!this.answered) { draw(C_AMBER); c.setScale(1.02); } });
      c.on("pointerout", () => { draw(0x30363d); c.setScale(1); });
      c.on("pointerdown", () => { if (!this.answered) this.onBugFixAnswer(i, cfg); });
      this.waveElements.push(c);
      return { c, g, draw, t };
    });
  }

  renderIndexVsValue(cfg) {
    const isCustom = !!cfg.customQuestion;
    // big expression display
    const tokens = this._syntaxTokens(cfg.expression);
    const exprContainer = this.add.container(0, 300).setDepth(20);
    let x = 0;
    let highlightX = 0, highlightW = 0;
    tokens.forEach((tok) => {
      const t = this.add.text(x, 0, tok.t, { font: "bold 22px Courier New", color: tok.c }).setOrigin(0, 0.5);
      exprContainer.add(t);
      if (tok.t.trim() === cfg.highlightPart) { highlightX = x; highlightW = t.width; }
      x += t.width;
    });
    exprContainer.x = 640 - x / 2;
    this.waveElements.push(exprContainer);

    if (highlightW > 0) {
      const hg = this.add.graphics().setDepth(21);
      const drawBox = () => {
        hg.clear();
        hg.lineStyle(2, C_AMBER, 1);
        this._dashedRectOutline(hg, exprContainer.x + highlightX - 4, 300 - 16, highlightW + 8, 32, 6, 4);
      };
      drawBox();
      this.tweens.add({ targets: hg, alpha: 0.5, duration: 500, yoyo: true, repeat: -1 });
      this.waveElements.push(hg);
    }

    const question = isCustom ? cfg.customQuestion : `The highlighted '${cfg.highlightPart}' is:`;
    this.waveElements.push(this.add.text(640, 345, question, {
      font: "16px Arial", color: "#e0e0e0", wordWrap: { width: 700 },
    }).setOrigin(0.5).setDepth(20));

    if (isCustom) {
      const positions = [[380, 420], [900, 420]];
      cfg.customOptions.forEach((opt, i) => {
        const [bx, by] = positions[i];
        this._makeBigButton(bx, by, 400, 58, i === cfg.correctOptionIndex ? C_CYAN : C_AMBER, null, opt, () => {
          this.onIndexValueAnswer(i, cfg);
        });
      });
    } else {
      this._makeBigButton(310, 420, 260, 58, C_AMBER, (c) => {
        c.add(this.add.text(-95, 0, "[i]", { font: "bold 16px Courier New", color: HEX_AMBER }).setOrigin(0.5));
      }, "The INDEX — a position", () => this.onIndexValueAnswer("index", cfg));
      this._makeBigButton(720, 420, 260, 58, C_CYAN, (c) => {
        c.add(this.add.text(-95, 0, "42", { font: "bold 16px Courier New", color: HEX_CYAN }).setOrigin(0.5));
      }, "The VALUE — actual data", () => this.onIndexValueAnswer("value", cfg));
    }
  }

  renderMatchExpression(cfg) {
    const mkCard = (x, label, expr, color) => {
      const c = this.add.container(x, 285).setDepth(20);
      const g = this.add.graphics();
      g.fillStyle(0x0d1117, 1);
      g.fillRoundedRect(-140, -32, 280, 65, 10);
      g.lineStyle(1.5, color, 1);
      g.strokeRoundedRect(-140, -32, 280, 65, 10);
      const badge = this.add.circle(-115, -12, 13, color);
      const badgeT = this.add.text(-115, -12, label, { font: "bold 13px Arial", color: "#0a0e14" }).setOrigin(0.5);
      const exprT = this.add.text(0, 8, expr, { font: "bold 16px Courier New", color: "#e0e0e0" }).setOrigin(0.5);
      c.add([g, badge, badgeT, exprT]);
      this.waveElements.push(c);
      return c;
    };
    mkCard(250, "A", cfg.exprA, C_CYAN);
    mkCard(750, "B", cfg.exprB, C_MAGENTA);

    this.waveElements.push(this.add.text(640, 375, "Do these produce the SAME result?", {
      font: "bold 15px Arial", color: "#e0e0e0",
    }).setOrigin(0.5).setDepth(20));

    this._makeBigButton(380, 445, 200, 55, C_GREEN, null, "SAME", () => this.onMatchAnswer(true, cfg));
    this._makeBigButton(700, 445, 200, 55, C_RED, null, "DIFFERENT", () => this.onMatchAnswer(false, cfg));
  }

  // ══════════════════════════════════════════════════════════════
  // ANSWER HANDLING
  // ══════════════════════════════════════════════════════════════

  _timePercentRemaining() {
    const cfg = WAVES[this.currentWave];
    const elapsed = this.time.now - this.waveStart;
    return Phaser.Math.Clamp(1 - elapsed / cfg.timeLimit, 0, 1);
  }

  _stopPacketAndTimer() {
    if (this.packetTween) { this.packetTween.stop(); this.packetTween = null; }
    if (this.timerTween) { this.timerTween.stop(); this.timerTween = null; }
  }

  async onValidInvalidAnswer(playerSaysValid, cfg) {
    if (this.answered) return;
    this.answered = true;
    this._stopPacketAndTimer();
    const correct = playerSaysValid === cfg.isValid;
    const timePct = this._timePercentRemaining();

    if (cfg.isValid) this.packetAccepted(); else this.packetIntercepted();

    if (cfg.isValid) {
      await this.showValidAccessAnimation(cfg.targetIndex);
    } else if (cfg.errorType === "negative") {
      await this.showNegativeIndexAnimation();
    } else {
      const idx = cfg.array.values.length;
      await this.showOutOfBoundsAnimation(idx);
    }
    if (!this._alive) return;

    if (correct) this.onCorrectAnswer(timePct, cfg.concept, "valid_invalid");
    else this.onWrongAnswer(cfg.concept, false, "valid_invalid");
  }

  async onPredictAnswer(selectedIndex, cfg) {
    if (this.answered) return;
    this.answered = true;
    this._stopPacketAndTimer();
    const correct = selectedIndex === cfg.correctIndex;
    const timePct = this._timePercentRemaining();

    const btn = this._predictButtons[selectedIndex];
    const correctBtn = this._predictButtons[cfg.correctIndex];
    if (correct) {
      btn.draw(C_GREEN);
      this.packetAccepted();
    } else {
      btn.draw(C_RED);
      this.tweens.add({ targets: btn.c, x: btn.c.x + 6, duration: 40, yoyo: true, repeat: 5 });
      correctBtn.draw(C_GREEN);
      this.packetIntercepted();
    }

    const accessLines = cfg.code.map((_, i) => i);
    await this.animateCodeExecution(this._codePanel, accessLines, (idx) => {
      if (idx === cfg.code.length - 1) {
        const indices = cfg.accessIndices || (cfg.accessIndex !== undefined ? [cfg.accessIndex] : []);
        indices.forEach((ai) => this.highlightMiniCell(ai, "cyan"));
        if (cfg.modifyIndex !== undefined) this.highlightMiniCell(cfg.modifyIndex, "cyan");
      }
    });
    if (!this._alive) return;
    await this.showConsoleOutput(cfg.options[cfg.correctIndex]);
    if (!this._alive) return;
    await this.delay(400);
    if (!this._alive) return;

    if (correct) this.onCorrectAnswer(timePct, cfg.concept, "predict_output");
    else this.onWrongAnswer(cfg.concept, false, "predict_output");
  }

  async onBugFixAnswer(selectedIndex, cfg) {
    if (this.answered) return;
    this.answered = true;
    this._stopPacketAndTimer();
    const correct = selectedIndex === cfg.correctFixIndex;
    const timePct = this._timePercentRemaining();

    const btn = this._fixButtons[selectedIndex];
    const correctBtn = this._fixButtons[cfg.correctFixIndex];
    if (correct) {
      btn.draw(C_GREEN);
      this.packetAccepted();
      await this.animateFixTransition(cfg);
    } else {
      btn.draw(C_RED);
      this.tweens.add({ targets: btn.c, x: btn.c.x + 6, duration: 40, yoyo: true, repeat: 5 });
      correctBtn.draw(C_GREEN);
      this.packetIntercepted();
      await this.delay(400);
    }
    if (!this._alive) return;

    if (correct) this.onCorrectAnswer(timePct, cfg.concept, "spot_bug");
    else this.onWrongAnswer(cfg.concept, false, "spot_bug");
  }

  onIndexValueAnswer(selected, cfg) {
    if (this.answered) return;
    this.answered = true;
    this._stopPacketAndTimer();
    const isCustom = !!cfg.customQuestion;
    const correct = isCustom ? selected === cfg.correctOptionIndex : selected === (cfg.highlightIsIndex ? "index" : "value");
    const timePct = this._timePercentRemaining();

    if (correct) this.packetAccepted(); else this.packetIntercepted();

    const color = cfg.highlightIsIndex ? HEX_AMBER : HEX_CYAN;
    const msg = correct
      ? (cfg.highlightIsIndex
          ? `Correct! ${cfg.highlightPart} is the INDEX — the cell number`
          : `Correct! ${cfg.highlightPart} is the VALUE — the data stored`)
      : (cfg.highlightIsIndex
          ? `Actually, ${cfg.highlightPart} is the INDEX — the cell number`
          : `Actually, ${cfg.highlightPart} is the VALUE — the data stored`);
    this.createFloatingText(640, 500, msg, color, "bold 15px Arial");

    // demonstrate on the array reference (best-effort — highlight index part directly for standard waves)
    if (!isCustom) {
      const idx = parseInt(cfg.highlightPart, 10);
      if (Number.isFinite(idx) && idx >= 0 && idx < this.miniCells.length) {
        this.highlightMiniCell(idx, cfg.highlightIsIndex ? "cyan" : "green");
      }
    }

    this.time.delayedCall(900, () => {
      if (!this._alive) return;
      if (correct) this.onCorrectAnswer(timePct, cfg.concept, "index_vs_value");
      else this.onWrongAnswer(cfg.concept, false, "index_vs_value");
    });
  }

  async onMatchAnswer(playerSaysSame, cfg) {
    if (this.answered) return;
    this.answered = true;
    this._stopPacketAndTimer();
    const correct = playerSaysSame === cfg.isSame;
    const timePct = this._timePercentRemaining();

    if (correct) this.packetAccepted(); else this.packetIntercepted();

    await this.showExpressionEvaluation(cfg);
    if (!this._alive) return;

    if (correct) this.onCorrectAnswer(timePct, cfg.concept, "match_expression");
    else this.onWrongAnswer(cfg.concept, false, "match_expression");
  }

  // ══════════════════════════════════════════════════════════════
  // POST-ANSWER ANIMATIONS
  // ══════════════════════════════════════════════════════════════

  async showValidAccessAnimation(index) {
    this.highlightMiniCell(index, "cyan");
    const cell = this.miniCells[index];
    if (cell) {
      const val = cell.value;
      this.createFloatingText(cell.x, cell.y - MC_H / 2 - 30, `= ${val}`, HEX_GREEN);
    }
    await this.delay(700);
  }

  async showOutOfBoundsAnimation(index) {
    this.showMiniOOB("right", index);
    this.createFloatingText(640, 500, "ArrayIndexOutOfBoundsException!", HEX_RED, "bold 15px Arial");
    await this.delay(900);
  }

  async showNegativeIndexAnimation() {
    this.showMiniOOB("left", -1);
    this.createFloatingText(640, 500, "ArrayIndexOutOfBoundsException! (negative index)", HEX_RED, "bold 14px Arial");
    await this.delay(900);
  }

  async showExpressionEvaluation(cfg) {
    const resA = this.add.text(250, 330, `= ${cfg.resultA}`, {
      font: "bold 16px Courier New", color: cfg.resultA === "Error!" ? HEX_RED : HEX_GREEN,
    }).setOrigin(0.5).setDepth(20).setAlpha(0);
    const resB = this.add.text(750, 330, `= ${cfg.resultB}`, {
      font: "bold 16px Courier New", color: cfg.resultB === "Error!" ? HEX_RED : HEX_GREEN,
    }).setOrigin(0.5).setDepth(20).setAlpha(0);
    this.waveElements.push(resA, resB);
    this.tweens.add({ targets: [resA, resB], alpha: 1, duration: 250 });

    if (Number.isFinite(cfg.idxA) && cfg.idxA < this.miniCells.length) this.highlightMiniCell(cfg.idxA, "cyan");
    if (Number.isFinite(cfg.idxB) && cfg.idxB < this.miniCells.length) this.highlightMiniCell(cfg.idxB, "cyan");
    else if (Number.isFinite(cfg.idxB)) this.showMiniOOB("right", cfg.idxB);

    await this.delay(400);
    if (!this._alive) return;

    const sign = this.add.text(500, 330, cfg.isSame ? "=" : "≠", {
      font: "bold 28px Arial", color: cfg.isSame ? HEX_GREEN : HEX_RED,
    }).setOrigin(0.5).setDepth(20).setScale(0);
    this.waveElements.push(sign);
    this.tweens.add({ targets: sign, scale: 1, duration: 250, ease: "Back.easeOut" });
    await this.delay(700);
  }

  async animateFixTransition(cfg) {
    const panel = this._codePanel;
    const bugLc = panel.lineTexts[cfg.bugLine];
    if (bugLc) {
      this.tweens.add({ targets: bugLc, alpha: 0, duration: 300 });
    }
    await this.delay(320);
    if (!this._alive) return;
    if (bugLc) { bugLc.setAlpha(1); bugLc.list.forEach((t) => t.setColor(HEX_GREEN)); }
    const accessLines = cfg.code.map((_, i) => i);
    await this.animateCodeExecution(panel, accessLines, (idx) => {
      if (idx === cfg.code.length - 1) {
        const lastIdx = cfg.array.values.length - 1;
        this.highlightMiniCell(lastIdx, "cyan");
      }
    });
    if (!this._alive) return;
    const outVal = cfg.array.values[cfg.array.values.length - 1];
    await this.showConsoleOutput(String(outVal));
  }

  // ══════════════════════════════════════════════════════════════
  // SCORING
  // ══════════════════════════════════════════════════════════════

  onCorrectAnswer(timePercent, concept, challengeType) {
    if (this.gameEnded) return;
    this.correctFirstTry++;
    this.totalAnswerTime += this.time.now - this.waveStart;
    if (challengeType && this.challengeBreakdown[challengeType]) {
      this.challengeBreakdown[challengeType].correct++;
      this.challengeBreakdown[challengeType].total++;
    }
    this.updateCombo(true);
    let multiplier = 1.0;
    if (this.combo >= 8) multiplier = 3.0;
    else if (this.combo >= 6) multiplier = 2.5;
    else if (this.combo >= 4) multiplier = 2.0;
    else if (this.combo >= 2) multiplier = 1.5;
    const base = 100;
    const speedBonus = timePercent > 0.7 ? 50 : 0;
    const points = Math.floor((base + speedBonus) * multiplier);
    this.updateScore(points);
    if (speedBonus > 0) this.showSpeedBonus();

    this.time.delayedCall(700, () => {
      if (!this._alive || this.gameEnded) return;
      if (this.currentWave + 1 >= WAVES.length) this.levelComplete();
      else this.startWave(this.currentWave + 1);
    });
  }

  async onWrongAnswer(concept, isTimeout = false, challengeType = null) {
    if (this.gameEnded) return;
    if (challengeType && this.challengeBreakdown[challengeType]) {
      this.challengeBreakdown[challengeType].total++;
    }
    this.damageIntegrity();
    this.updateCombo(false);
    if (!isTimeout) this.screenShake(0.005, 200);

    if (this.integrity <= 0) {
      this.time.delayedCall(500, () => this.gameOver());
      return;
    }

    await this.showBitFeedback(BIT_FEEDBACK[concept] || "Not quite — check the array bounds carefully!");
    if (!this._alive || this.gameEnded) return;

    this.time.delayedCall(300, () => {
      if (!this._alive || this.gameEnded) return;
      if (this.currentWave + 1 >= WAVES.length) this.levelComplete();
      else this.startWave(this.currentWave + 1);
    });
  }

  updateScore(points) {
    this.score += points;
    const counter = { v: this.displayScore };
    this.tweens.add({
      targets: counter, v: this.score, duration: 350,
      onUpdate: () => {
        this.displayScore = Math.round(counter.v);
        if (this.scoreText.active) this.scoreText.setText(String(this.displayScore));
      },
    });
  }

  updateCombo(correct) {
    if (correct) {
      this.combo++;
      this.maxCombo = Math.max(this.maxCombo, this.combo);
      this.comboText.setText(`×${this.combo}`);
      if (this.combo >= 2) this.tweens.add({ targets: this.comboText, scale: 1.4, duration: 150, yoyo: true });
      if (this.combo >= 3) this.comboText.setColor(HEX_MAGENTA); else this.comboText.setColor(HEX_AMBER);
    } else {
      if (this.combo >= 2) this.comboShatterEffect();
      this.combo = 0;
      this.comboText.setText("×1").setColor(HEX_AMBER);
    }
  }

  comboShatterEffect() {
    const { x, y } = this.comboText;
    const p = this.add.particles(x + 10, y + 8, "l23_dot", {
      speed: { min: 40, max: 140 }, angle: { min: 0, max: 360 },
      scale: { start: 0.5, end: 0 }, lifespan: 400, tint: 0xffd740, emitting: false,
    }).setDepth(55);
    p.explode(12);
    this.time.delayedCall(600, () => p.destroy());
  }

  showSpeedBonus() {
    this.createFloatingText(640, 44, "QUICK!", HEX_AMBER, "bold 14px Arial");
  }

  // ══════════════════════════════════════════════════════════════
  // UTILITIES
  // ══════════════════════════════════════════════════════════════

  createFloatingText(x, y, text, colorHex, font = "bold 16px Arial") {
    const t = this.add.text(x, y, text, { font, color: colorHex, wordWrap: { width: 700 } })
      .setOrigin(0.5).setDepth(65);
    this.tweens.add({
      targets: t, y: y - 34, alpha: 0, duration: 900, ease: "Cubic.easeOut",
      onComplete: () => t.destroy(),
    });
    return t;
  }

  createConfetti(x, y, count = 30) {
    const p = this.add.particles(x, y, "l23_dot", {
      speed: { min: 80, max: 260 }, angle: { min: 0, max: 360 },
      scale: { start: 0.9, end: 0 }, lifespan: 500,
      tint: [C_CYAN, C_AMBER, C_GREEN, C_MAGENTA, 0xffffff], emitting: false,
    }).setDepth(65);
    p.explode(count);
    this.time.delayedCall(900, () => p.destroy());
  }

  screenShake(intensity = 0.005, duration = 250) {
    this.cameras.main.shake(duration, intensity);
  }

  // ══════════════════════════════════════════════════════════════
  // END STATES
  // ══════════════════════════════════════════════════════════════

  gameOver() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.answered = true;
    this.clearWave();
    this.hideBubble();

    this.monitorGraphics.forEach(({ g, x, y, w, h }) => {
      g.clear();
      g.fillStyle(0x2a0808, 1);
      g.fillRoundedRect(x, y, w, h, 6);
      g.lineStyle(1, C_RED, 0.15);
      g.strokeRoundedRect(x, y, w, h, 6);
    });
    this.miniCells.forEach((c) => {
      this.highlightMiniCell(c.index, "red");
      this.tweens.add({ targets: c.valueText, alpha: 0.15, duration: 500 });
    });
    if (this.rainRandomEvent) this.rainRandomEvent.remove();
    this.rainColumns.forEach((col) => col.forEach((t) => t.setColor("#f44336")));

    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
    this.tweens.add({ targets: ov, fillAlpha: 0.88, duration: 500 });

    const title = this.add.text(640, 240, "SYSTEM COMPROMISED", {
      font: "bold 40px Arial", color: HEX_RED,
    }).setOrigin(0.5).setScale(0).setDepth(91);
    this.tweens.add({
      targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut",
      onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }),
    });

    this.add.text(640, 310, `Score: ${this.score}`, { font: "20px Arial", color: "#ffffff" })
      .setOrigin(0.5).setDepth(91);
    this.add.text(640, 350, `Waves Survived: ${this.currentWave} / ${WAVES.length}`, {
      font: "16px Arial", color: HEX_GRAY,
    }).setOrigin(0.5).setDepth(91);

    this._makeButton(640, 420, "RETRY", 180, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.answered = true;
    this.clearWave();
    this.hideBubble();

    const accuracy = this.correctFirstTry / WAVES.length;
    try { GameManager.completeLevel(22, Math.round(accuracy * 100)); } catch (_) {}
    try { BadgeSystem.unlock("index_expert"); } catch (_) {}
    try {
      localStorage.setItem("level23_results", JSON.stringify({
        level: 23,
        score: this.score,
        accuracy,
        avgTime: Math.round(this.totalAnswerTime / WAVES.length),
        comboMax: this.maxCombo,
        integrityRemaining: this.integrity,
        challengeBreakdown: this.challengeBreakdown,
        stars: this._starRating(accuracy),
        timestamp: Date.now(),
      }));
    } catch (_) {}

    this.systemSecuredAnimation().then(() => {
      if (this._alive) this.showScoreBreakdown(accuracy);
    });
  }

  _starRating(accuracy) {
    if (accuracy >= 0.9) return 3;
    if (accuracy >= 0.7) return 2;
    return 1;
  }

  systemSecuredAnimation() {
    return new Promise((res) => {
      this.monitorGraphics.forEach(({ g, x, y, w, h }) => {
        const step = { a: 0.03 };
        this.tweens.add({
          targets: step, a: 0.08, duration: 400, yoyo: true,
          onUpdate: () => {
            g.clear();
            g.fillStyle(C_GREEN, step.a);
            g.fillRoundedRect(x, y, w, h, 6);
            g.lineStyle(1, C_GREEN, 0.2);
            g.strokeRoundedRect(x, y, w, h, 6);
          },
        });
      });
      this.miniCells.forEach((c) => this.highlightMiniCell(c.index, "green"));
      this.rainColumns.forEach((col) => col.forEach((t) => t.setColor(HEX_CYAN)));
      this.statusLEDs.forEach(({ led, tween }) => {
        tween.stop();
        led.setFillStyle(C_GREEN);
        this.tweens.add({ targets: led, alpha: 1, duration: 500, yoyo: true, repeat: 2 });
      });

      const secured = this.add.text(640, 400, "SYSTEM SECURED", {
        font: "bold 30px Arial", color: HEX_GREEN,
      }).setOrigin(0.5).setScale(0).setDepth(70);
      this.tweens.add({
        targets: secured, scale: 1, duration: 400, ease: "Back.easeOut",
        onComplete: () => {
          this.tweens.add({ targets: secured, alpha: 0.7, duration: 500, yoyo: true, repeat: 1 });
        },
      });

      this.time.delayedCall(1400, () => {
        this.tweens.add({ targets: secured, alpha: 0, duration: 300, onComplete: () => secured.destroy() });
        res();
      });
    });
  }

  showScoreBreakdown(accuracy) {
    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
    this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });

    const title = this.add.text(640, 75, "ALL THREATS NEUTRALIZED!", {
      font: "bold 34px Arial", color: HEX_AMBER,
    }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: title, alpha: 1, duration: 400 });
    this.tweens.add({ targets: title, alpha: 0.65, duration: 700, delay: 600, yoyo: true, repeat: -1 });

    const lines = [
      { t: `Total Score: ${this.score}`, c: "#ffffff" },
      { t: `Accuracy: ${Math.round(accuracy * 100)}%`, c: HEX_CYAN },
      { t: `Best Combo: ×${this.maxCombo}`, c: HEX_AMBER },
      { t: `System Integrity: ${this.integrity}%`, c: this.integrity > 59 ? HEX_CYAN : this.integrity > 29 ? HEX_AMBER : HEX_RED },
    ];
    lines.forEach((ln, i) => {
      const t = this.add.text(640, 145 + i * 32, ln.t, { font: "18px Arial", color: ln.c })
        .setOrigin(0.5).setAlpha(0).setDepth(91);
      this.tweens.add({ targets: t, alpha: 1, duration: 250, delay: 300 * (i + 1) });
    });

    const stars = this._starRating(accuracy);
    for (let i = 0; i < 3; i++) {
      const earned = i < stars;
      const s = this.add.text(640 + (i - 1) * 64, 335, "★", {
        font: "44px Arial", color: earned ? HEX_AMBER : "#2a3040",
      }).setOrigin(0.5).setDepth(91).setScale(0);
      this.tweens.add({
        targets: s, scale: 1, duration: 260, delay: 1600 + i * 220,
        ease: earned ? "Back.easeOut" : "Cubic.easeOut",
      });
    }

    // badge: circle with [ ] brackets + magnifying glass
    const badge = this.add.container(640, 440).setDepth(91).setAlpha(0);
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillCircle(0, 0, 32);
    bg.lineStyle(2, C_AMBER, 1);
    bg.strokeCircle(0, 0, 32);
    bg.lineStyle(3, C_AMBER, 1);
    bg.lineBetween(-16, -14, -20, -14); bg.lineBetween(-20, -14, -20, 14); bg.lineBetween(-20, 14, -16, 14);
    bg.lineBetween(16, -14, 20, -14); bg.lineBetween(20, -14, 20, 14); bg.lineBetween(20, 14, 16, 14);
    bg.lineStyle(2, C_AMBER, 1);
    bg.strokeCircle(2, -2, 8);
    bg.lineBetween(8, 4, 13, 9);
    badge.add(bg);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 2200 });
    const badgeLbl = this.add.text(640, 485, "INDEX EXPERT", {
      font: "bold 14px Arial", color: HEX_AMBER,
    }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: badgeLbl, alpha: 1, duration: 300, delay: 2300 });

    this._makeButton(500, 570, "RETRY", 160, 46, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(760, 570, "NEXT: Array Forge →", 260, 46, { fill: 0x00733a, stroke: C_GREEN, textColor: "#ffffff" }, () => {
      if (this.scene.get("Level24Scene")) this.scene.start("Level24Scene");
      else this.scene.start("MenuScene");
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
