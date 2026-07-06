/**
 * Level 22 — "Memory Vault" (Arrays: Accretion Phase)
 * ====================================================
 * Teaches Java array fundamentals through a high-security data vault metaphor:
 *  - zero-based indexing, element access with [index]
 *  - the .length property, last valid index = length - 1
 *  - out-of-bounds awareness, building/modifying arrays
 *
 * 12 rounds across 4 challenge types:
 *  A. Find the Value  (rounds 1-3)  — option bubbles OR click the cell
 *  B. Find the Index  (rounds 4-6)  — click the correct storage cell
 *  C. Array Properties (rounds 7-9) — length / last index / arr[length-1]
 *  D. Build the Array (rounds 10-12) — drag values into cells
 *
 * The scene is authored in a 1280x720 world space (per design spec). The
 * shared game canvas is 800x600 (Scale.NONE), so the main camera is zoomed
 * to letterbox-fit the vault into whatever canvas size is active.
 */

import Phaser from "phaser";
import { GameManager } from "../../GameManager.js";
import { BadgeSystem } from "../../BadgeSystem.js";

const W = 1280, H = 720;

// Storage cell geometry
const CELL_W = 88, CELL_H = 108, CELL_GAP = 8;
const CELL_Y = 330;                    // vertical center of the cell row

// Colors
const C_CYAN = 0x00e5ff, C_AMBER = 0xffd740, C_GREEN = 0x00e676;
const C_RED = 0xf44336, C_STROKE = 0x2a3a4a, C_GRAY = 0x78909c;
const HEX_CYAN = "#00e5ff", HEX_AMBER = "#ffd740", HEX_GREEN = "#00e676";
const HEX_RED = "#f44336", HEX_GRAY = "#78909c";

const TUTORIAL_KEY = "level22_tutorial_done";

// ─────────────────────────────────────────────────────────────────
// Round configuration
// ─────────────────────────────────────────────────────────────────
const ROUNDS = [
  // ── Type A: Find the Value ──
  { round: 1, type: "find_value", arrayName: "arr", arrayType: "int[]",
    values: [10, 20, 30, 40, 50], question: "What is arr[0]?",
    targetIndex: 0, correctValue: 10, options: [10, 20, 50, 0], concept: "first_element" },
  { round: 2, type: "find_value", arrayName: "arr", arrayType: "int[]",
    values: [10, 20, 30, 40, 50], question: "What is arr[4]?",
    targetIndex: 4, correctValue: 50, options: [40, 50, 30, 5], concept: "last_element" },
  { round: 3, type: "find_value", arrayName: "arr", arrayType: "int[]",
    values: [5, 15, 25, 35], question: "What is arr[2]?",
    targetIndex: 2, correctValue: 25, options: [15, 25, 35, 2], concept: "middle_access" },

  // ── Type B: Find the Index ──
  { round: 4, type: "find_index", arrayName: "arr", arrayType: "int[]",
    values: [42, 17, 88, 63, 31], question: "At which index is the value 88?",
    targetValue: 88, correctIndex: 2, concept: "value_to_index" },
  { round: 5, type: "find_index", arrayName: "arr", arrayType: "int[]",
    values: [42, 17, 88, 63, 31], question: "At which index is the FIRST element?",
    targetValue: 42, correctIndex: 0, concept: "first_is_zero" },
  { round: 6, type: "find_index", arrayName: "arr", arrayType: "int[]",
    values: [7, 3, 9, 1, 5, 8], question: "At which index is the LAST element?",
    targetValue: 8, correctIndex: 5, concept: "last_is_length_minus_1" },

  // ── Type C: Array Properties ──
  { round: 7, type: "property", arrayName: "scores", arrayType: "int[]",
    values: [85, 92, 78, 95, 88], question: "What is scores.length?",
    options: [4, 5, 6], correctAnswer: 5, concept: "length_property",
    feedbackAnimation: "highlight_bracket" },
  { round: 8, type: "property", arrayName: "scores", arrayType: "int[]",
    values: [85, 92, 78, 95, 88], question: "What is the LAST valid index?",
    options: [3, 4, 5], correctAnswer: 4, concept: "last_valid_index",
    feedbackAnimation: "highlight_last_and_oob" },
  { round: 9, type: "property", arrayName: "arr", arrayType: "int[]",
    values: [10, 20, 30], question: "What is arr[arr.length - 1]?",
    options: [10, 20, 30], correctAnswer: 30, concept: "dynamic_last_element",
    feedbackAnimation: "show_evaluation_steps" },

  // ── Type D: Build the Array ──
  { round: 10, type: "build", arrayName: "x", arrayType: "int[]",
    targetValues: [3, 7, 1, 9], question: "Build the array: int[] x = {3, 7, 1, 9};",
    availableValues: [3, 7, 1, 9, 4, 0], concept: "array_construction" },
  { round: 11, type: "modify", arrayName: "arr", arrayType: "int[]",
    initialValues: [10, 20, 30, 40], question: "Execute: arr[2] = 99;",
    targetIndex: 2, newValue: 99, concept: "element_modification" },
  { round: 12, type: "build", arrayName: "fib", arrayType: "int[]",
    targetValues: [0, 1, 1, 2, 3], question: "Build the array: int[] fib = {0, 1, 1, 2, 3};",
    availableValues: [0, 1, 1, 2, 3, 4, 5], concept: "full_construction" },
];

// ─────────────────────────────────────────────────────────────────
// Bit's feedback messages, keyed by round concept
// ─────────────────────────────────────────────────────────────────
const FEEDBACK = {
  first_element:          "The first element is at index [0], not [1]! Arrays always start counting from zero.",
  last_element:           "The last element is at index [length - 1]. For a 5-element array, that's index [4], not [5].",
  middle_access:          "Count from 0: [0], [1], [2]... arr[2] is the THIRD element, not the second!",
  value_to_index:         "To find which index holds a value, count from [0] left to right until you find it.",
  first_is_zero:          "The first element is ALWAYS at index [0]. That's the golden rule of arrays!",
  last_is_length_minus_1: "The last index is length - 1. For 6 elements, indices go [0] through [5].",
  length_property:        ".length counts how many elements are in the array. 5 elements → length is 5.",
  last_valid_index:       "The last VALID index is length - 1. Index [length] is out of bounds — it doesn't exist!",
  dynamic_last_element:   "arr[arr.length - 1] always gets the last element. For length 3: [3-1] = [2], and arr[2] = 30.",
  array_construction:     "Values go in order: first value → [0], second → [1], third → [2]. Match the declaration!",
  element_modification:   "arr[2] = 99 means 'put 99 into cell [2]'. Count: [0], [1], [2] — the third cell.",
  full_construction:      "Place each value in its correct position. The declaration order matches the index order: first value = [0].",
};

export class Level22Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level22Scene" });
  }

  init() {
    this.currentRound = 0;
    this.score = 0;
    this.displayScore = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.lives = 3;
    this.correctFirstTry = 0;
    this.roundResults = [];
    this.totalTime = 0;
    this.roundEls = [];        // round-scoped objects, destroyed in clearRound()
    this.cells = [];
    this.optionBubbles = [];
    this.dragItems = [];
    this.roundAttempts = 0;
    this.roundStart = 0;
    this.inputLocked = true;
    this.gameEnded = false;
    this._alive = true;
    this._bubble = null;
    this._dragGhost = null;
    this._dropCandidate = -1;
  }

  preload() {}

  create() {
    this._alive = true;
    this.events.once("shutdown", () => { this._alive = false; });

    // The vault is authored at 1280x720; letterbox-fit into the real canvas.
    const cam = this.cameras.main;
    const zoom = Math.min(this.scale.width / W, this.scale.height / H);
    cam.setZoom(zoom);
    cam.centerOn(W / 2, H / 2);
    cam.setBackgroundColor("#060a10");

    try { GameManager.incrementAttempt(21); } catch (_) {}

    this.createParticleTexture();
    this.createBackground();
    this.createVaultFloor();
    this.createVaultCeiling();
    this.createSideWalls();
    this.createAmbientDust();
    this.createBackgroundDetail();
    this.createHUD();
    this.createArrayMonitor();
    this.createBit();
    this.setupDragEvents();

    cam.fadeIn(800, 6, 10, 16);
    this.checkTutorial();
  }

  update(time, delta) {
    this.updateDustParticles(time, delta);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }

  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // SETUP — background & environment
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l22_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l22_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x060a10).setDepth(0);
  }

  createVaultFloor() {
    const g = this.add.graphics().setDepth(1);
    const top = 576, panelH = 18;
    for (let i = 0; i < 8; i++) {
      const y = top + i * panelH;
      g.fillStyle(i % 2 === 0 ? 0x10141c : 0x0c1018, 1);
      g.fillRect(0, y, W, panelH);
      g.lineStyle(1, 0x1a2535, 0.25);
      g.lineBetween(0, y, W, y);
    }
  }

  createVaultCeiling() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x141a24, 1);
    g.lineStyle(1, 0x1a2535, 1);
    g.fillRoundedRect(0, 8, W, 14, 3);
    g.strokeRoundedRect(0, 8, W, 14, 3);
    g.fillRoundedRect(0, 36, W, 14, 3);
    g.strokeRoundedRect(0, 36, W, 14, 3);

    // Recessed lights between the beams
    this.ceilingLights = [];
    for (let x = 65; x < W; x += 130) {
      const light = this.add.circle(x, 28, 3, 0xffd740, 0.06).setDepth(1);
      this.ceilingLights.push(light);
      this.tweens.add({
        targets: light, fillAlpha: 0.1,
        duration: Phaser.Math.Between(3000, 5000),
        delay: Phaser.Math.Between(0, 2000),
        yoyo: true, repeat: -1,
      });
    }
  }

  createSideWalls() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x0a1018, 1);
    g.fillRect(0, 58, 28, 518);
    g.fillRect(1252, 58, 28, 518);
    g.lineStyle(1, 0x1565c0, 0.05);
    [10, 20, 1262, 1272].forEach((x) => g.lineBetween(x, 58, x, 576));
  }

  createAmbientDust() {
    this.dust = [];
    for (let i = 0; i < 12; i++) {
      const p = this.add.circle(
        Phaser.Math.Between(40, W - 40), Phaser.Math.Between(60, 570),
        1, 0x4fc3f7, Phaser.Math.FloatBetween(0.03, 0.06)
      ).setDepth(2);
      this.dust.push(p);
    }
  }

  updateDustParticles(time, delta) {
    if (!this.dust) return;
    const step = 0.08 * (delta / 16.7);
    this.dust.forEach((p, i) => {
      p.y += step;
      p.x += Math.sin(time * 0.0008 + i) * 0.04;
      if (p.y > 576) { p.y = 60; p.x = Phaser.Math.Between(40, W - 40); }
    });
  }

  createBackgroundDetail() {
    // Faded safety-deposit-box outlines on the back wall
    const g = this.add.graphics().setDepth(1);
    const spots = [[140, 150], [340, 210], [560, 135], [760, 225], [960, 160], [1130, 200]];
    spots.forEach(([x, y]) => {
      g.lineStyle(1, 0x1a2535, 0.04);
      g.strokeRect(x, y, 40, 30);
      g.fillStyle(0x1a2535, 0.06);
      g.fillCircle(x + 20, y + 15, 2);
    });
  }

  // ══════════════════════════════════════════════════════════════
  // HUD
  // ══════════════════════════════════════════════════════════════

  createHUD() {
    const g = this.add.graphics().setDepth(50);
    g.fillStyle(0x0a0e14, 0.93);
    g.fillRect(0, 0, W, 68);
    g.lineStyle(1, 0x1a2535, 1);
    g.lineBetween(0, 68, W, 68);

    this.add.text(20, 14, "MEMORY VAULT", { font: "bold 15px Arial", color: "#b0bec5" }).setDepth(51);
    this.add.text(20, 36, "Accretion Phase — Arrays", { font: "11px Arial", color: "#546e7a" }).setDepth(51);

    // Score
    this.add.text(1050, 12, "SCORE", { font: "9px Arial", color: "#546e7a" }).setDepth(51);
    this.scoreText = this.add.text(1050, 24, "0", { font: "bold 20px Arial", color: "#ffffff" }).setDepth(51);

    // Combo
    this.comboText = this.add.text(1140, 30, "×1", { font: "bold 16px Arial", color: HEX_AMBER })
      .setOrigin(0, 0).setDepth(51);

    // Lives — 3 vault keys
    this.lifeIcons = [];
    for (let i = 0; i < 3; i++) {
      const kg = this.add.graphics({ x: 1195 + i * 28, y: 30 }).setDepth(51);
      kg.fillStyle(0x00e5ff, 1);
      kg.fillCircle(0, -6, 5);        // head
      kg.fillStyle(0x0a0e14, 1);
      kg.fillCircle(0, -6, 2);        // head hole
      kg.fillStyle(0x00e5ff, 1);
      kg.fillRect(-1.5, -2, 3, 12);   // shaft
      kg.fillRect(1.5, 4, 4, 2);      // tooth 1
      kg.fillRect(1.5, 8, 4, 2);      // tooth 2
      this.lifeIcons.push(kg);
    }
  }

  createArrayMonitor() {
    const g = this.add.graphics().setDepth(51);
    g.fillStyle(0x1a1a2e, 1);
    g.fillRoundedRect(360, 10, 560, 48, 8);
    g.lineStyle(1, 0x2a2a4a, 1);
    g.strokeRoundedRect(360, 10, 560, 48, 8);
    this.monitorGroup = null;
    this.monitorValueTexts = [];
  }

  /** Rebuild the syntax-highlighted declaration display in the HUD monitor. */
  updateArrayMonitor(type, name, values) {
    if (this.monitorGroup) { this.monitorGroup.destroy(); this.monitorGroup = null; }
    this.monitorValueTexts = [];
    const c = this.add.container(0, 34).setDepth(52);
    const font = "14px Courier New", fontB = "bold 14px Courier New";
    let x = 0;
    const put = (t, color, bold) => {
      const txt = this.add.text(x, 0, t, { font: bold ? fontB : font, color }).setOrigin(0, 0.5);
      c.add(txt);
      x += txt.width;
      return txt;
    };
    put(type, "#ff4081", true);
    put(" " + name, HEX_CYAN);
    put(" = {", HEX_GRAY);
    values.forEach((v, i) => {
      this.monitorValueTexts.push(put(String(v), HEX_AMBER));
      if (i < values.length - 1) put(", ", HEX_GRAY);
    });
    put("};", HEX_GRAY);
    c.x = 640 - x / 2;
    this.monitorGroup = c;
  }

  /** Flash a value inside the monitor (used when a value is placed in Build rounds). */
  flashMonitorValue(i) {
    const t = this.monitorValueTexts[i];
    if (!t) return;
    t.setColor("#ffffff");
    this.tweens.add({
      targets: t, scale: 1.35, duration: 140, yoyo: true,
      onComplete: () => { if (t.active) { t.setScale(1); t.setColor(HEX_AMBER); } },
    });
  }

  // ══════════════════════════════════════════════════════════════
  // STORAGE CELLS — the array representation
  // ══════════════════════════════════════════════════════════════

  getCellPosition(index) {
    const n = this.cellCount || 1;
    const totalW = n * CELL_W + (n - 1) * CELL_GAP;
    const startX = 640 - totalW / 2;
    return { x: startX + index * (CELL_W + CELL_GAP) + CELL_W / 2, y: CELL_Y };
  }

  /** Create/replace the whole cell row. `values` may contain null for empty cells. */
  buildCellRow(values) {
    this.clearCellRow();
    this.cellCount = values.length;
    this.cells = values.map((v, i) => {
      const { x, y } = this.getCellPosition(i);
      return this.createCell(i, v, x, y);
    });
    this.showLengthBracket(values.length);
  }

  createCell(index, value, x, y) {
    const container = this.add.container(x, y).setDepth(10);
    const glow = this.add.rectangle(0, 0, 94, 114, C_CYAN, 0);
    const body = this.add.graphics();
    this._drawCellBody(body, C_STROKE, 2);
    const indexLabel = this.add.text(0, -CELL_H / 2 - 22, `[${index}]`, {
      font: "bold 16px Courier New", color: HEX_AMBER,
    }).setOrigin(0.5);
    const valueText = this.add.text(0, 0, value === null ? "—" : String(value), {
      font: "bold 26px Courier New", color: value === null ? "#3d4450" : HEX_CYAN,
    }).setOrigin(0.5);
    container.add([glow, body, indexLabel, valueText]);
    return { container, glow, body, indexLabel, valueText, index, value, x, y, pulse: null };
  }

  _drawCellBody(g, strokeColor, lineWidth, dashed = false) {
    g.clear();
    g.fillStyle(0x0d1117, 1);
    g.fillRoundedRect(-CELL_W / 2, -CELL_H / 2, CELL_W, CELL_H, 8);
    g.lineStyle(lineWidth, strokeColor, 1);
    if (dashed) this._dashedRectOutline(g, -CELL_W / 2, -CELL_H / 2, CELL_W, CELL_H, 5, 4);
    else g.strokeRoundedRect(-CELL_W / 2, -CELL_H / 2, CELL_W, CELL_H, 8);
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

  /** state: 'default' | 'highlighted' | 'correct' | 'error' | 'drop_target' */
  setCellState(i, state) {
    const cell = this.cells[i];
    if (!cell || !cell.container.active) return;
    if (cell.pulse) { cell.pulse.stop(); cell.pulse = null; }
    cell.glow.setFillStyle(C_CYAN, 0);
    cell.indexLabel.setColor(HEX_AMBER);

    switch (state) {
      case "highlighted":
        this._drawCellBody(cell.body, C_CYAN, 3);
        cell.glow.setFillStyle(C_CYAN, 0.05);
        cell.indexLabel.setColor("#ffffff");
        cell.pulse = this.tweens.add({
          targets: cell.glow, fillAlpha: 0.12, duration: 700, yoyo: true, repeat: -1,
        });
        break;
      case "correct":
        this._drawCellBody(cell.body, C_GREEN, 3);
        break;
      case "error":
        this._drawCellBody(cell.body, C_RED, 3);
        break;
      case "drop_target":
        this._drawCellBody(cell.body, C_AMBER, 2, true);
        cell.glow.setFillStyle(C_AMBER, 0.05);
        break;
      default:
        this._drawCellBody(cell.body, C_STROKE, 2);
        break;
    }
  }

  updateCellValue(i, newValue, animate = false) {
    const cell = this.cells[i];
    if (!cell) return;
    cell.value = newValue;
    const apply = () => {
      cell.valueText.setText(newValue === null ? "—" : String(newValue));
      cell.valueText.setColor(newValue === null ? "#3d4450" : HEX_CYAN);
      cell.valueText.setAlpha(1).setScale(1);
    };
    if (!animate) { apply(); return Promise.resolve(); }

    // Drop-in animation: value appears above the cell, bounces into place
    return new Promise((res) => {
      const drop = this.add.text(cell.x, cell.y - CELL_H / 2 - 40, String(newValue), {
        font: "bold 26px Courier New", color: HEX_CYAN,
      }).setOrigin(0.5).setDepth(30);
      this.tweens.add({
        targets: drop, y: cell.y, duration: 300, ease: "Bounce.easeOut",
        onComplete: () => {
          drop.destroy();
          apply();
          cell.glow.setFillStyle(C_CYAN, 0);
          this.tweens.add({ targets: cell.glow, fillAlpha: 0.15, duration: 150, yoyo: true });
          const lbl = cell.indexLabel;
          lbl.setColor("#ffffff");
          this.time.delayedCall(300, () => { if (lbl.active) lbl.setColor(HEX_AMBER); });
          res();
        },
      });
    });
  }

  /** One-shot success effect on a cell (green flash, scale, ✓ pop). */
  flashCellCorrect(i) {
    const cell = this.cells[i];
    if (!cell) return;
    this.setCellState(i, "correct");
    cell.glow.setFillStyle(C_GREEN, 0);
    this.tweens.add({ targets: cell.glow, fillAlpha: 0.15, duration: 300, yoyo: true });
    this.tweens.add({ targets: cell.valueText, scale: 1.25, duration: 150, yoyo: true });
    const check = this.add.text(cell.x, cell.y - CELL_H / 2 - 44, "✓", {
      font: "bold 22px Arial", color: HEX_GREEN,
    }).setOrigin(0.5).setScale(0).setDepth(30);
    this.tweens.add({ targets: check, scale: 1, duration: 200, ease: "Back.easeOut" });
    this.time.delayedCall(800, () => {
      this.tweens.add({ targets: check, alpha: 0, duration: 250, onComplete: () => check.destroy() });
    });
  }

  /** One-shot error effect on a cell (red flash, shake, ✗ pop). */
  flashCellError(i) {
    const cell = this.cells[i];
    if (!cell) return;
    this.setCellState(i, "error");
    cell.glow.setFillStyle(C_RED, 0);
    this.tweens.add({ targets: cell.glow, fillAlpha: 0.12, duration: 200, yoyo: true });
    this.tweens.add({
      targets: cell.container, x: cell.x + 5, duration: 42, yoyo: true, repeat: 5,
      onComplete: () => { if (cell.container.active) cell.container.x = cell.x; },
    });
    const x = this.add.text(cell.x, cell.y - CELL_H / 2 - 44, "✗", {
      font: "bold 22px Arial", color: HEX_RED,
    }).setOrigin(0.5).setScale(0).setDepth(30);
    this.tweens.add({ targets: x, scale: 1, duration: 200, ease: "Back.easeOut" });
    this.time.delayedCall(800, () => {
      this.tweens.add({ targets: x, alpha: 0, duration: 250, onComplete: () => x.destroy() });
    });
  }

  showLengthBracket(count) {
    this.hideLengthBracket();
    const left = this.getCellPosition(0).x - CELL_W / 2;
    const right = this.getCellPosition(count - 1).x + CELL_W / 2;
    const yTop = CELL_Y + CELL_H / 2 + 4, yBot = CELL_Y + CELL_H / 2 + 12;
    const g = this.add.graphics().setDepth(10);
    g.lineStyle(1, C_GRAY, 1);
    g.lineBetween(left, yTop, left, yBot);
    g.lineBetween(right, yTop, right, yBot);
    g.lineBetween(left, yBot, right, yBot);
    const txt = this.add.text(640, yBot + 14, `length = ${count}`, {
      font: "bold 14px Courier New", color: HEX_GRAY,
    }).setOrigin(0.5).setDepth(10);
    this.lengthBracket = { g, txt };
  }

  hideLengthBracket() {
    if (this.lengthBracket) {
      this.lengthBracket.g.destroy();
      this.lengthBracket.txt.destroy();
      this.lengthBracket = null;
    }
  }

  /** Bracket pulse feedback (Round 7). */
  pulseBracket(colorHex) {
    if (!this.lengthBracket) return;
    const { g, txt } = this.lengthBracket;
    txt.setColor(colorHex);
    this.tweens.add({ targets: txt, scale: 1.3, duration: 250, yoyo: true, repeat: 1 });
    this.tweens.add({
      targets: [g, txt], alpha: 0.5, duration: 500, yoyo: true, repeat: 2,
      onComplete: () => {
        if (txt.active) { txt.setColor(HEX_GRAY).setAlpha(1).setScale(1); g.setAlpha(1); }
      },
    });
  }

  /** Ghost cell at [length] — visually teaches ArrayIndexOutOfBounds. */
  showOutOfBounds() {
    this.hideOutOfBounds();
    const n = this.cellCount;
    const pos = this.getCellPosition(n);
    const c = this.add.container(pos.x, pos.y).setDepth(10).setAlpha(0);
    const body = this.add.graphics();
    body.fillStyle(0x0d1117, 0.3);
    body.fillRoundedRect(-CELL_W / 2, -CELL_H / 2, CELL_W, CELL_H, 8);
    body.lineStyle(2, C_RED, 1);
    this._dashedRectOutline(body, -CELL_W / 2, -CELL_H / 2, CELL_W, CELL_H, 5, 4);
    const idx = this.add.text(0, -CELL_H / 2 - 22, `[${n}]`, {
      font: "bold 16px Courier New", color: HEX_RED,
    }).setOrigin(0.5);
    const val = this.add.text(0, 0, "❌", { font: "24px Arial", color: HEX_RED }).setOrigin(0.5);
    const warn = this.add.text(0, -CELL_H / 2 - 46, "OUT OF BOUNDS!", {
      font: "bold 11px Arial", color: HEX_RED,
    }).setOrigin(0.5);
    c.add([body, idx, val, warn]);
    this.tweens.add({ targets: c, alpha: 1, duration: 250 });
    this.tweens.add({ targets: warn, alpha: 0.5, duration: 800, yoyo: true, repeat: -1 });
    this.oobCell = c;
    return c;
  }

  hideOutOfBounds(fade = true) {
    if (!this.oobCell) return;
    const c = this.oobCell;
    this.oobCell = null;
    if (fade) this.tweens.add({ targets: c, alpha: 0, duration: 250, onComplete: () => c.destroy() });
    else c.destroy();
  }

  clearCellRow() {
    this.hideOutOfBounds(false);
    this.hideLengthBracket();
    this.cells.forEach((c) => { if (c.pulse) c.pulse.stop(); c.container.destroy(); });
    this.cells = [];
  }

  /** Fade out old cells, fade in a new row. */
  rebuildCells(values) {
    return new Promise((res) => {
      const old = this.cells.map((c) => c.container);
      this.cells = [];
      this.hideOutOfBounds(false);
      this.hideLengthBracket();
      const buildNew = () => {
        old.forEach((c) => c.destroy());
        this.buildCellRow(values);
        this.cells.forEach((c) => c.container.setAlpha(0));
        if (this.lengthBracket) { this.lengthBracket.g.setAlpha(0); this.lengthBracket.txt.setAlpha(0); }
        const targets = this.cells.map((c) => c.container);
        if (this.lengthBracket) targets.push(this.lengthBracket.g, this.lengthBracket.txt);
        this.tweens.add({ targets, alpha: 1, duration: 200, onComplete: () => res() });
      };
      if (old.length) this.tweens.add({ targets: old, alpha: 0, duration: 200, onComplete: buildNew });
      else buildNew();
    });
  }

  // ══════════════════════════════════════════════════════════════
  // BIT — robot mascot & speech
  // ══════════════════════════════════════════════════════════════

  createBit() {
    const c = this.add.container(W + 80, 340).setDepth(60);
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

  /** Show speech bubble + typewrite text. Resolves after typing finishes. Bubble stays until hideBubble(). */
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
      this.input.once("pointerdown", finish); // click skips the typewriter
    });
  }

  hideBubble() {
    if (!this._bubble) return;
    const b = this._bubble;
    this._bubble = null;
    this.tweens.add({ targets: b, alpha: 0, scale: 0.8, duration: 150, onComplete: () => b.destroy() });
  }

  /** Bit slides in from the right, delivers a message, waits for click (or 3.5s), slides out. */
  async showBitFeedback(message) {
    await this.bitSlideTo(1060, 520);
    if (!this._alive) return;
    await this.bitSay(message);
    if (!this._alive) return;
    await Promise.race([this.waitForClick(), this.delay(3500)]);
    this.hideBubble();
    await this.bitSlideTo(W + 80, 520, 250);
  }

  // ══════════════════════════════════════════════════════════════
  // TUTORIAL
  // ══════════════════════════════════════════════════════════════

  checkTutorial() {
    let done = false;
    try { done = localStorage.getItem(TUTORIAL_KEY) === "true"; } catch (_) {}
    if (done) {
      this.buildCellRow(ROUNDS[0].values.slice());
      this.updateArrayMonitor(ROUNDS[0].arrayType, ROUNDS[0].arrayName, ROUNDS[0].values);
      this.time.delayedCall(400, () => this.startRound(0));
    } else {
      this.runTutorial();
    }
  }

  _clickHint() {
    const t = this.add.text(1200, 660, "▸ click to continue", {
      font: "11px Arial", color: "#546e7a",
    }).setOrigin(1, 0.5).setDepth(61);
    this.tweens.add({ targets: t, alpha: 0.35, duration: 600, yoyo: true, repeat: -1 });
    return t;
  }

  async _tutorialWait() {
    const hint = this._clickHint();
    await this.waitForClick();
    hint.destroy();
  }

  async runTutorial() {
    const A = () => this._alive; // shutdown guard between awaits

    // Step 1 — empty vault, Bit arrives
    this.buildCellRow([null, null, null, null, null]);
    await this.delay(500); if (!A()) return;
    await this.bitSlideTo(1060, 340); if (!A()) return;
    await this.bitSay("Welcome to the Memory Vault, Keeper! This vault stores data in numbered cells — we call this an Array. Let me show you how it works!");
    if (!A()) return;
    await this._tutorialWait(); if (!A()) return;

    // Step 2 — declaration + values load in
    this.updateArrayMonitor("int[]", "scores", [85, 92, 78, 95, 88]);
    this.monitorGroup.setAlpha(0);
    this.tweens.add({ targets: this.monitorGroup, alpha: 1, duration: 400 });
    await this.bitSay("This creates an array called 'scores' with 5 values. Watch as the values load into the vault!");
    if (!A()) return;
    await this.tutorialLoadValues([85, 92, 78, 95, 88]); if (!A()) return;
    await this._tutorialWait(); if (!A()) return;

    // Step 3 — zero-based indexing
    await this.bitSay("Notice something important: the FIRST cell is [0], NOT [1]! Arrays ALWAYS start counting from zero.");
    if (!A()) return;
    const anno0 = await this.tutorialShowZeroBased(); if (!A()) return;
    await this._tutorialWait(); if (!A()) return;
    this.tweens.add({ targets: anno0, alpha: 0, duration: 250, onComplete: () => anno0.destroy() });

    // Step 4 — element access
    await this.bitSay("To access a value, use the array name and index. scores[2] gets the value at index 2.");
    if (!A()) return;
    const accessEls = await this.tutorialShowAccess(); if (!A()) return;
    await this._tutorialWait(); if (!A()) return;
    this.tweens.add({
      targets: accessEls, alpha: 0, duration: 250,
      onComplete: () => accessEls.forEach((e) => e.destroy()),
    });
    this.setCellState(2, "default");

    // Step 5 — length & out of bounds
    await this.bitSay("The array has 5 elements, so scores.length equals 5. But the LAST index is 4, not 5! It's always length minus 1.");
    if (!A()) return;
    const lenEls = await this.tutorialShowLength(); if (!A()) return;
    await this._tutorialWait(); if (!A()) return;
    this.tweens.add({
      targets: lenEls, alpha: 0, duration: 250,
      onComplete: () => lenEls.forEach((e) => e.destroy()),
    });
    this.hideOutOfBounds();
    this.setCellState(4, "default");

    // Step 6 — go!
    await this.bitSay("Your turn! I'll ask you to find values, identify indices, and build arrays. Good luck, Keeper!");
    if (!A()) return;
    await this._tutorialWait(); if (!A()) return;
    this.hideBubble();
    this.bitSlideTo(W + 80, 340, 250);
    try { localStorage.setItem(TUTORIAL_KEY, "true"); } catch (_) {}
    this.startRound(0);
  }

  async tutorialLoadValues(values) {
    for (let i = 0; i < values.length; i++) {
      if (!this._alive) return;
      this.updateCellValue(i, values[i], true);
      await this.delay(400);
    }
    if (!this._alive) return;
    this.showLengthBracket(values.length);
    this.lengthBracket.g.setAlpha(0);
    this.lengthBracket.txt.setAlpha(0);
    this.tweens.add({ targets: [this.lengthBracket.g, this.lengthBracket.txt], alpha: 1, duration: 300 });
    await this.delay(300);
  }

  async tutorialShowZeroBased() {
    const cell0 = this.cells[0];
    this.tweens.add({ targets: cell0.indexLabel, scale: 1.6, duration: 300, yoyo: true });
    cell0.indexLabel.setColor("#ffffff");
    const anno = this.createAnnotation(cell0.x, cell0.y - CELL_H / 2 - 66, "Index 0 = FIRST element!", HEX_AMBER, { x: cell0.x, y: cell0.y - CELL_H / 2 - 30 });
    await this.delay(600);
    if (cell0.indexLabel.active) cell0.indexLabel.setColor(HEX_AMBER);
    return anno;
  }

  async tutorialShowAccess() {
    const cell2 = this.cells[2];
    const els = [];
    // code snippet: scores[2]
    const snippet = this.add.container(640, 460).setDepth(20);
    let sx = 0;
    const putPart = (t, color) => {
      const txt = this.add.text(sx, 0, t, { font: "bold 18px Courier New", color }).setOrigin(0, 0.5);
      snippet.add(txt);
      sx += txt.width;
      return txt;
    };
    putPart("scores", HEX_CYAN);
    putPart("[", HEX_GRAY);
    putPart("2", HEX_AMBER);
    putPart("]", HEX_GRAY);
    snippet.x = 640 - sx / 2 - 20;
    els.push(snippet);

    // arrow extending from snippet up to cell [2]
    const arrow = this.add.graphics().setDepth(20);
    els.push(arrow);
    const from = { x: 640 - 20, y: 444 };
    const to = { x: cell2.x, y: cell2.y + CELL_H / 2 + 24 };
    await new Promise((res) => {
      const prog = { t: 0 };
      this.tweens.add({
        targets: prog, t: 1, duration: 400,
        onUpdate: () => {
          const ex = from.x + (to.x - from.x) * prog.t;
          const ey = from.y + (to.y - from.y) * prog.t;
          arrow.clear();
          arrow.lineStyle(2, C_CYAN, 1);
          arrow.lineBetween(from.x, from.y, ex, ey);
          const ang = Math.atan2(to.y - from.y, to.x - from.x);
          arrow.fillStyle(C_CYAN, 1);
          arrow.fillTriangle(
            ex + Math.cos(ang) * 8, ey + Math.sin(ang) * 8,
            ex + Math.cos(ang + 2.5) * 7, ey + Math.sin(ang + 2.5) * 7,
            ex + Math.cos(ang - 2.5) * 7, ey + Math.sin(ang - 2.5) * 7
          );
        },
        onComplete: () => res(),
      });
    });
    if (!this._alive) return els;

    this.setCellState(2, "highlighted");
    this.tweens.add({ targets: cell2.valueText, scale: 1.3, duration: 200, yoyo: true });
    const result = this.add.text(640 + sx / 2 - 14, 460, " = 78", {
      font: "bold 18px Courier New", color: HEX_GREEN,
    }).setOrigin(0, 0.5).setScale(0).setDepth(20);
    this.tweens.add({ targets: result, scale: 1, duration: 200, ease: "Back.easeOut" });
    els.push(result);
    return els;
  }

  async tutorialShowLength() {
    const els = [];
    this.pulseBracket("#ffffff");

    // last cell highlight in amber
    const cell4 = this.cells[4];
    this._drawCellBody(cell4.body, C_AMBER, 3);
    cell4.glow.setFillStyle(C_AMBER, 0.08);
    this.tweens.add({ targets: cell4.indexLabel, scale: 1.4, duration: 250, yoyo: true });

    const anno = this.createAnnotation(cell4.x - 30, cell4.y - CELL_H / 2 - 66, "Last index = length - 1 = 4", HEX_AMBER);
    els.push(anno);

    // out-of-bounds ghost + shake
    const ghost = this.showOutOfBounds();
    this.tweens.add({ targets: ghost, x: ghost.x + 4, duration: 50, yoyo: true, repeat: 5, delay: 300 });

    // struck-through scores[5] snippet
    const snipC = this.add.container(560, 470).setDepth(20);
    const bad = this.add.text(0, 0, "scores[5]", { font: "bold 18px Courier New", color: "#b0bec5" }).setOrigin(0, 0.5);
    const strike = this.add.graphics();
    strike.lineStyle(2, C_RED, 1);
    strike.lineBetween(-4, 0, bad.width + 4, 0);
    const exc = this.add.text(bad.width + 12, 0, "→ ArrayIndexOutOfBoundsException!", {
      font: "bold 13px Courier New", color: HEX_RED,
    }).setOrigin(0, 0.5);
    snipC.add([bad, strike, exc]);
    snipC.x = 640 - (bad.width + 12 + exc.width) / 2;
    els.push(snipC);

    await this.delay(700);
    if (this._alive) cell4.glow.setFillStyle(C_AMBER, 0);
    return els;
  }

  // ══════════════════════════════════════════════════════════════
  // ANNOTATIONS / FLOATING TEXT / EFFECTS
  // ══════════════════════════════════════════════════════════════

  /** Text label with optional downward arrow pointing at arrowTarget {x,y}. */
  createAnnotation(x, y, text, colorHex, arrowTarget = null) {
    const c = this.add.container(0, 0).setDepth(25).setAlpha(0);
    const txt = this.add.text(x, y, text, { font: "bold 14px Arial", color: colorHex }).setOrigin(0.5);
    c.add(txt);
    if (arrowTarget) {
      const g = this.add.graphics();
      const color = Phaser.Display.Color.HexStringToColor(colorHex).color;
      g.lineStyle(2, color, 1);
      g.lineBetween(arrowTarget.x, y + 12, arrowTarget.x, arrowTarget.y - 8);
      g.fillStyle(color, 1);
      g.fillTriangle(arrowTarget.x, arrowTarget.y, arrowTarget.x - 5, arrowTarget.y - 9, arrowTarget.x + 5, arrowTarget.y - 9);
      c.add(g);
    }
    this.tweens.add({ targets: c, alpha: 1, duration: 300 });
    return c;
  }

  createFloatingText(x, y, text, colorHex, font = "bold 16px Arial") {
    const t = this.add.text(x, y, text, { font, color: colorHex }).setOrigin(0.5).setDepth(65);
    this.tweens.add({
      targets: t, y: y - 34, alpha: 0, duration: 900, ease: "Cubic.easeOut",
      onComplete: () => t.destroy(),
    });
    return t;
  }

  createConfetti(x, y, count = 30) {
    const p = this.add.particles(x, y, "l22_dot", {
      speed: { min: 80, max: 260 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.9, end: 0 },
      lifespan: 500,
      tint: [0x00e5ff, 0xffd740, 0x00e676, 0xff4081, 0xffffff],
      emitting: false,
    }).setDepth(65);
    p.explode(count);
    this.time.delayedCall(900, () => p.destroy());
  }

  screenShake(intensity = 0.004, duration = 150) {
    this.cameras.main.shake(duration, intensity);
  }

  // ══════════════════════════════════════════════════════════════
  // GAMEPLAY — round system
  // ══════════════════════════════════════════════════════════════

  async startRound(index) {
    if (!this._alive || this.gameEnded) return;
    this.currentRound = index;
    const cfg = ROUNDS[index];
    this.roundAttempts = 0;
    this.roundStart = this.time.now;
    this.inputLocked = true;
    this.clearRound();

    const cellValues =
      cfg.type === "build" ? cfg.targetValues.map(() => null) :
      cfg.type === "modify" ? cfg.initialValues.slice() :
      cfg.values.slice();
    const monitorValues =
      cfg.type === "build" ? cfg.targetValues :
      cfg.type === "modify" ? cfg.initialValues :
      cfg.values;

    this.updateArrayMonitor(cfg.arrayType, cfg.arrayName, monitorValues);
    await this.rebuildCells(cellValues);
    if (!this._alive) return;

    this.showQuestionCard(cfg);
    switch (cfg.type) {
      case "find_value": this.setupFindValue(cfg); break;
      case "find_index": this.setupFindIndex(cfg); break;
      case "property":   this.setupProperty(cfg); break;
      case "build":      this.setupBuild(cfg); break;
      case "modify":     this.setupModify(cfg); break;
    }
    this.inputLocked = false;
  }

  clearRound() {
    this.disableCellClicking();
    this.hideBubble();
    this._clearDragGhost();
    this._dropCandidate = -1;
    this.optionBubbles.forEach((b) => b.destroy());
    this.optionBubbles = [];
    this.dragItems.forEach((d) => d.destroy());
    this.dragItems = [];
    this.roundEls.forEach((e) => { if (e && e.destroy) e.destroy(); });
    this.roundEls = [];
  }

  // ── Question card ────────────────────────────────────────────

  /** Tokenize question text so code fragments get monospace syntax coloring. */
  _parseQuestion(q) {
    const tokens = [];
    const re = /([A-Za-z_]\w*\.length(?:\s*-\s*1)?|[A-Za-z_]\w*\[[^\]]*\]|\{[^}]*\}|\b\d+\b)/g;
    let last = 0, m;
    const plain = (t) => tokens.push({ t, c: "#e0e0e0", f: "16px Arial" });
    while ((m = re.exec(q))) {
      if (m.index > last) plain(q.slice(last, m.index));
      const s = m[0];
      const code = "bold 15px Courier New";
      if (s.includes(".length")) {
        tokens.push({ t: s.slice(0, s.indexOf(".")), c: HEX_CYAN, f: code });
        tokens.push({ t: s.slice(s.indexOf(".")), c: HEX_AMBER, f: code });
      } else if (s.includes("[")) {
        const nm = s.slice(0, s.indexOf("["));
        if (nm) tokens.push({ t: nm, c: HEX_CYAN, f: code });
        tokens.push({ t: s.slice(s.indexOf("[")), c: HEX_AMBER, f: code });
      } else {
        tokens.push({ t: s, c: HEX_CYAN, f: code });
      }
      last = m.index + s.length;
    }
    if (last < q.length) plain(q.slice(last));
    return tokens;
  }

  showQuestionCard(cfg) {
    const card = this.add.container(640, 80).setDepth(20).setAlpha(0);
    const g = this.add.graphics();
    g.fillStyle(0x1a1a2e, 1);
    g.fillRoundedRect(-250, -40, 500, 80, 10);
    g.lineStyle(1, 0x2a2a4a, 1);
    g.strokeRoundedRect(-250, -40, 500, 80, 10);
    const badge = this.add.circle(-218, 0, 13, C_AMBER);
    const badgeNum = this.add.text(-218, 0, String(cfg.round), {
      font: "bold 14px Arial", color: "#0a0e14",
    }).setOrigin(0.5);
    card.add([g, badge, badgeNum]);

    // Rich question line, left-aligned after the badge, auto-shrunk if wide
    const line = this.add.container(0, 0);
    let x = 0;
    this._parseQuestion(cfg.question).forEach((tok) => {
      const t = this.add.text(x, 0, tok.t, { font: tok.f, color: tok.c }).setOrigin(0, 0.5);
      line.add(t);
      x += t.width;
    });
    const maxW = 430;
    if (x > maxW) line.setScale(maxW / x);
    line.x = -192;
    card.add(line);

    this.tweens.add({ targets: card, y: 140, alpha: 1, duration: 300, ease: "Back.easeOut" });
    this.roundEls.push(card);
    this.questionCard = card;
  }

  // ── Option bubbles (Types A & C) ─────────────────────────────

  showOptionBubbles(options, onSelect) {
    const opts = Phaser.Utils.Array.Shuffle(options.slice());
    const style = { font: "bold 16px Courier New", color: HEX_CYAN };
    // pre-measure widths for centering
    const widths = opts.map((v) => {
      const t = this.add.text(0, 0, String(v), style);
      const w = t.width + 30;
      t.destroy();
      return Math.max(w, 56);
    });
    const totalW = widths.reduce((a, b) => a + b, 0) + (opts.length - 1) * 14;
    let bx = 640 - totalW / 2;

    opts.forEach((value, i) => {
      const w = widths[i], h = 38;
      const c = this.add.container(bx + w / 2, 490).setDepth(20);
      bx += w + 14;
      const g = this.add.graphics();
      const draw = (stroke) => {
        g.clear();
        g.fillStyle(0x1e1e3a, 1);
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 19);
        g.lineStyle(1.5, stroke, 1);
        g.strokeRoundedRect(-w / 2, -h / 2, w, h, 19);
      };
      draw(C_CYAN);
      const txt = this.add.text(0, 0, String(value), style).setOrigin(0.5);
      c.add([g, txt]);
      c.setSize(w, h);
      c.setInteractive({ useHandCursor: true });
      c.setData("value", value);
      c.setData("redraw", draw);

      const float = this.tweens.add({
        targets: c, y: "+=3", duration: 2300, ease: "Sine.easeInOut",
        yoyo: true, repeat: -1, delay: i * 150,
      });
      c.setData("float", float);

      c.on("pointerover", () => {
        if (this.inputLocked) return;
        draw(0xffffff);
        this.tweens.add({ targets: c, scale: 1.08, duration: 120 });
      });
      c.on("pointerout", () => {
        draw(C_CYAN);
        this.tweens.add({ targets: c, scale: 1, duration: 120 });
      });
      c.on("pointerdown", () => {
        if (this.inputLocked) return;
        this.inputLocked = true;
        float.stop();
        this.optionBubbles.forEach((b) => b.disableInteractive());
        onSelect(value, c);
      });
      this.optionBubbles.push(c);
    });
  }

  // ── Cell clicking (Types A & B) ──────────────────────────────

  enableCellClicking(handler) {
    this.cells.forEach((cell, i) => {
      cell.container.setSize(CELL_W, CELL_H);
      cell.container.setInteractive({ useHandCursor: true });
      cell.container.on("pointerover", () => {
        if (this.inputLocked) return;
        this._drawCellBody(cell.body, 0x4a6a8a, 3);
        this.tweens.add({ targets: cell.container, scale: 1.02, duration: 100 });
      });
      cell.container.on("pointerout", () => {
        this._drawCellBody(cell.body, C_STROKE, 2);
        this.tweens.add({ targets: cell.container, scale: 1, duration: 100 });
      });
      cell.container.on("pointerdown", () => {
        if (this.inputLocked) return;
        this.inputLocked = true;
        cell.container.setScale(1);
        handler(i);
      });
    });
  }

  disableCellClicking() {
    this.cells.forEach((cell) => {
      if (!cell.container.active) return;
      cell.container.removeAllListeners();
      cell.container.disableInteractive();
      cell.container.setScale(1);
    });
  }

  // ══════════════════════════════════════════════════════════════
  // CHALLENGE TYPE SETUPS
  // ══════════════════════════════════════════════════════════════

  setupFindValue(cfg) {
    // Both interaction modes: option bubbles AND clickable cells
    this.showOptionBubbles(cfg.options, (value, bubble) => {
      if (value === cfg.correctValue) {
        // bubble flies to the target cell to confirm the connection
        const pos = this.getCellPosition(cfg.targetIndex);
        this.disableCellClicking();
        this.tweens.add({
          targets: bubble, x: pos.x, y: pos.y, scale: 0.6, alpha: 0,
          duration: 300, ease: "Cubic.easeIn",
        });
        this.flashCellCorrect(cfg.targetIndex);
        this.onCorrectAnswer(cfg);
      } else {
        this.tweens.add({ targets: bubble, x: bubble.x + 6, duration: 45, yoyo: true, repeat: 5 });
        const redraw = bubble.getData("redraw");
        if (redraw) redraw(C_RED);
        this.flashCellCorrect(cfg.targetIndex); // reveal the right answer
        this.onIncorrectAnswer(cfg);
      }
    });
    this.enableCellClicking((i) => {
      this.optionBubbles.forEach((b) => b.disableInteractive());
      if (i === cfg.targetIndex) {
        this.disableCellClicking();
        this.flashCellCorrect(i);
        this.onCorrectAnswer(cfg);
      } else {
        this.disableCellClicking();
        this.flashCellError(i);
        this.flashCellCorrect(cfg.targetIndex);
        this.onIncorrectAnswer(cfg);
      }
    });
  }

  setupFindIndex(cfg) {
    this.enableCellClicking((i) => {
      this.disableCellClicking();
      if (i === cfg.correctIndex) {
        this.flashCellCorrect(i);
        const cell = this.cells[i];
        cell.indexLabel.setColor(HEX_GREEN);
        this.tweens.add({ targets: cell.indexLabel, scale: 1.5, duration: 250, yoyo: true });
        this.createFloatingText(cell.x, cell.y - CELL_H / 2 - 60, `Found at index [${i}]!`, HEX_GREEN, "bold 14px Arial");
        this.onCorrectAnswer(cfg);
      } else {
        this.flashCellError(i);
        this.flashCellCorrect(cfg.correctIndex);
        const msg = `That's index [${i}] with value ${this.cells[i].value}. The value ${cfg.targetValue} is at index [${cfg.correctIndex}].`;
        this.onIncorrectAnswer(cfg, msg);
      }
    });
  }

  setupProperty(cfg) {
    this.showOptionBubbles(cfg.options, async (value) => {
      if (value === cfg.correctAnswer) {
        await this.showPropertyFeedbackAnimation(cfg.feedbackAnimation, cfg);
        if (!this._alive) return;
        this.onCorrectAnswer(cfg, { skipDelayBonusMs: 0 });
      } else {
        // reveal the correct answer visually
        if (cfg.feedbackAnimation === "highlight_bracket") this.pulseBracket(HEX_RED);
        this.onIncorrectAnswer(cfg);
      }
    });
  }

  setupBuild(cfg) {
    this.buildExpected = cfg.targetValues.slice();
    this.createDraggableValues(cfg.availableValues, cfg);
  }

  setupModify(cfg) {
    this.buildExpected = null;
    this.createDraggableValues([cfg.newValue], cfg);
  }

  // ══════════════════════════════════════════════════════════════
  // PROPERTY FEEDBACK ANIMATIONS (Type C)
  // ══════════════════════════════════════════════════════════════

  async showPropertyFeedbackAnimation(kind, cfg) {
    if (kind === "highlight_bracket") {
      this.pulseBracket(HEX_GREEN);
      await this.delay(800);
    } else if (kind === "highlight_last_and_oob") {
      const last = this.cellCount - 1;
      this.flashCellCorrect(last);
      this.tweens.add({ targets: this.cells[last].indexLabel, scale: 1.5, duration: 250, yoyo: true });
      this.showOutOfBounds();
      await this.delay(1400);
      if (this._alive) this.hideOutOfBounds();
    } else if (kind === "show_evaluation_steps") {
      const steps = [
        { t: "arr.length = 3", c: HEX_AMBER },
        { t: "3 - 1 = 2", c: HEX_AMBER },
        { t: "arr[2] = 30", c: HEX_CYAN },
        { t: "= 30 ✓", c: HEX_GREEN },
      ];
      const texts = [];
      for (let i = 0; i < steps.length; i++) {
        if (!this._alive) return;
        const t = this.add.text(950, 260 + i * 30, steps[i].t, {
          font: "bold 16px Courier New", color: steps[i].c,
        }).setOrigin(0.5).setAlpha(0).setDepth(25);
        this.tweens.add({ targets: t, alpha: 1, duration: 200 });
        texts.push(t);
        this.roundEls.push(t);
        if (i === 2) this.setCellState(2, "highlighted");
        await this.delay(400);
      }
      await this.delay(500);
    }
  }

  // ══════════════════════════════════════════════════════════════
  // DRAG & DROP (Type D)
  // ══════════════════════════════════════════════════════════════

  setupDragEvents() {
    this.input.on("dragstart", (pointer, obj) => {
      if (!obj.getData("l22drag") || this.inputLocked) return;
      obj.setDepth(35);
      this.tweens.add({ targets: obj, scale: 1.08, alpha: 0.85, duration: 100 });
    });
    this.input.on("drag", (pointer, obj, dragX, dragY) => {
      if (!obj.getData("l22drag") || this.inputLocked) return;
      obj.x = dragX;
      obj.y = dragY;
      this.onValueDrag(obj);
    });
    this.input.on("dragend", (pointer, obj) => {
      if (!obj.getData("l22drag") || this.inputLocked) return;
      this.onValueDragEnd(obj);
    });
  }

  createDraggableValues(values, cfg) {
    const style = { font: "bold 18px Courier New", color: HEX_AMBER };
    const widths = values.map((v) => {
      const t = this.add.text(0, 0, String(v), style);
      const w = Math.max(t.width + 26, 50);
      t.destroy();
      return w;
    });
    const totalW = widths.reduce((a, b) => a + b, 0) + (values.length - 1) * 12;
    let bx = 640 - totalW / 2;

    values.forEach((value, i) => {
      const w = widths[i], h = 36;
      const home = { x: bx + w / 2, y: 490 };
      bx += w + 12;
      const c = this.add.container(home.x, home.y).setDepth(22);
      const g = this.add.graphics();
      g.fillStyle(0x1a1a2e, 1);
      g.fillRoundedRect(-w / 2, -h / 2, w, h, 18);
      g.lineStyle(1, C_AMBER, 1);
      g.strokeRoundedRect(-w / 2, -h / 2, w, h, 18);
      const txt = this.add.text(0, 0, String(value), style).setOrigin(0.5);
      c.add([g, txt]);
      c.setSize(w, h);
      c.setInteractive({ useHandCursor: true, draggable: true });
      c.setData("l22drag", true);
      c.setData("value", value);
      c.setData("home", home);
      c.setData("cfg", cfg);
      this.dragItems.push(c);
    });
  }

  /** During drag: highlight the nearest valid (empty) cell within 50px. */
  onValueDrag(obj) {
    let best = -1, bestDist = 50;
    this.cells.forEach((cell, i) => {
      if (cell.value !== null && obj.getData("cfg").type !== "modify") return;
      const d = Phaser.Math.Distance.Between(obj.x, obj.y, cell.x, cell.y);
      if (d < bestDist) { bestDist = d; best = i; }
    });
    if (best !== this._dropCandidate) {
      if (this._dropCandidate >= 0) this.setCellState(this._dropCandidate, "default");
      this._clearDragGhost();
      this._dropCandidate = best;
      if (best >= 0) {
        this.setCellState(best, "drop_target");
        const cell = this.cells[best];
        this._dragGhost = this.add.text(cell.x, cell.y, String(obj.getData("value")), {
          font: "bold 26px Courier New", color: HEX_AMBER,
        }).setOrigin(0.5).setAlpha(0.15).setDepth(11);
      }
    }
  }

  _clearDragGhost() {
    if (this._dragGhost) { this._dragGhost.destroy(); this._dragGhost = null; }
  }

  onValueDragEnd(obj) {
    const target = this._dropCandidate;
    if (this._dropCandidate >= 0) this.setCellState(this._dropCandidate, "default");
    this._clearDragGhost();
    this._dropCandidate = -1;
    obj.setDepth(22);
    if (target >= 0) {
      this.onValueDroppedOnCell(obj, target);
    } else {
      this._returnToPool(obj, 250);
    }
  }

  _returnToPool(obj, duration) {
    const home = obj.getData("home");
    this.tweens.add({
      targets: obj, x: home.x, y: home.y, scale: 1, alpha: 1,
      duration, ease: "Cubic.easeOut",
    });
  }

  onValueDroppedOnCell(obj, cellIndex) {
    const cfg = obj.getData("cfg");
    const value = obj.getData("value");
    const cell = this.cells[cellIndex];

    const isCorrect = cfg.type === "modify"
      ? cellIndex === cfg.targetIndex
      : cell.value === null && this.buildExpected[cellIndex] === value;

    if (!isCorrect) {
      // bounce back + brief red flash + ✗
      this._returnToPool(obj, 280);
      this.flashCellError(cellIndex);
      this.time.delayedCall(600, () => {
        if (this._alive && this.cells[cellIndex] && this.cells[cellIndex].value === null) {
          this.setCellState(cellIndex, "default");
        } else if (this._alive && this.cells[cellIndex]) {
          this.setCellState(cellIndex, "default");
        }
      });
      const firstMiss = this.roundAttempts === 0;
      this.roundAttempts++;
      this.updateCombo(false);
      if (firstMiss) this.showBitFeedback(FEEDBACK[cfg.concept]);
      return;
    }

    // Correct drop — snap into the cell
    obj.disableInteractive();
    this.tweens.add({
      targets: obj, x: cell.x, y: cell.y, scale: 1, alpha: 1,
      duration: 200, ease: "Back.easeOut",
      onComplete: () => {
        // snap ring effect
        const ring = this.add.circle(cell.x, cell.y, 12).setStrokeStyle(2, C_AMBER).setDepth(30);
        this.tweens.add({
          targets: ring, radius: 52, alpha: 0, duration: 250,
          onUpdate: () => ring.setStrokeStyle(2, C_AMBER),
          onComplete: () => ring.destroy(),
        });
        obj.destroy();
        const idx = this.dragItems.indexOf(obj);
        if (idx >= 0) this.dragItems.splice(idx, 1);

        if (cfg.type === "modify") {
          this._applyModify(cfg, cellIndex);
        } else {
          this.updateCellValue(cellIndex, value, true);
          this._drawCellBody(cell.body, C_CYAN, 2);
          this.flashMonitorValue(cellIndex);
          this.checkBuildComplete(cfg);
        }
      },
    });
  }

  _applyModify(cfg, cellIndex) {
    const cell = this.cells[cellIndex];
    // old value fades out red, new value drops in green-flashed
    const oldText = this.add.text(cell.x, cell.y, String(cell.value), {
      font: "bold 26px Courier New", color: HEX_RED,
    }).setOrigin(0.5).setDepth(12);
    cell.valueText.setAlpha(0);
    this.tweens.add({ targets: oldText, alpha: 0, y: cell.y + 16, duration: 220, onComplete: () => oldText.destroy() });
    this.time.delayedCall(120, async () => {
      if (!this._alive) return;
      await this.updateCellValue(cellIndex, cfg.newValue, true);
      if (!this._alive) return;
      this.flashCellCorrect(cellIndex);
      this.createFloatingText(cell.x, cell.y - CELL_H / 2 - 60, "✓ MODIFIED!", HEX_GREEN, "bold 18px Arial");
      this.updateArrayMonitor(cfg.arrayType, cfg.arrayName, this.cells.map((c) => c.value));
      this.flashMonitorValue(cellIndex);
      this.onCorrectAnswer(cfg, { skipCenterText: true });
    });
  }

  checkBuildComplete(cfg) {
    if (this.cells.some((c) => c.value === null)) return;
    this.inputLocked = true;
    this.dragItems.forEach((d) => d.disableInteractive());

    const banner = this.add.text(640, 250, "✓ ARRAY BUILT!", {
      font: "bold 28px Arial", color: HEX_GREEN,
    }).setOrigin(0.5).setScale(0).setDepth(70);
    this.roundEls.push(banner);
    this.tweens.add({ targets: banner, scale: 1, duration: 250, ease: "Back.easeOut" });
    this.cells.forEach((c, i) => this.flashCellCorrect(i));
    this.onCorrectAnswer(cfg, { skipCenterText: true });
  }

  // ══════════════════════════════════════════════════════════════
  // EVALUATION
  // ══════════════════════════════════════════════════════════════

  onCorrectAnswer(cfg, opts = {}) {
    if (this.gameEnded) return;
    this.inputLocked = true;
    const firstTry = this.roundAttempts === 0;
    if (firstTry) this.correctFirstTry++;
    this.updateCombo(true);
    const multiplier = Math.min(this.combo, 4);
    this.updateScore(100 * multiplier);

    const roundTime = this.time.now - this.roundStart;
    this.totalTime += roundTime;
    this.roundResults.push({
      round: cfg.round, type: cfg.type, correct: firstTry,
      attempts: this.roundAttempts + 1, time: Math.round(roundTime),
    });

    const targetCell = cfg.targetIndex !== undefined ? cfg.targetIndex
      : cfg.correctIndex !== undefined ? cfg.correctIndex : Math.floor(this.cellCount / 2);
    const pos = this.getCellPosition(Math.min(targetCell, this.cellCount - 1));
    this.createConfetti(pos.x, pos.y);

    if (!opts.skipCenterText) {
      const t = this.add.text(640, 360, "✓ CORRECT", {
        font: "bold 28px Arial", color: HEX_GREEN,
      }).setOrigin(0.5).setScale(0).setDepth(70);
      this.tweens.add({
        targets: t, scale: 1.15, duration: 200, ease: "Back.easeOut",
        onComplete: () => this.tweens.add({ targets: t, scale: 1, duration: 100 }),
      });
      this.time.delayedCall(900, () => {
        this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() });
      });
    }

    this.time.delayedCall(1200, () => {
      if (!this._alive || this.gameEnded) return;
      if (this.currentRound + 1 >= ROUNDS.length) this.levelComplete();
      else this.startRound(this.currentRound + 1);
    });
  }

  async onIncorrectAnswer(cfg, customMessage = null) {
    if (this.gameEnded) return;
    this.inputLocked = true;
    this.roundAttempts++;
    this.updateCombo(false);
    this.screenShake();
    const dead = this.loseLife();
    if (dead) {
      this.time.delayedCall(700, () => this.gameOver());
      return;
    }
    await this.showBitFeedback(customMessage || FEEDBACK[cfg.concept]);
    if (!this._alive || this.gameEnded) return;
    this._retryRound(cfg);
  }

  /** Reset states and re-arm the same question for another attempt. */
  _retryRound(cfg) {
    this.cells.forEach((c, i) => {
      this.setCellState(i, "default");
      c.indexLabel.setColor(HEX_AMBER);
    });
    this.optionBubbles.forEach((b) => b.destroy());
    this.optionBubbles = [];
    this.disableCellClicking();

    switch (cfg.type) {
      case "find_value": this.setupFindValue(cfg); break;
      case "find_index": this.setupFindIndex(cfg); break;
      case "property":   this.setupProperty(cfg); break;
    }
    this.inputLocked = false;
  }

  // ══════════════════════════════════════════════════════════════
  // SCORE / COMBO / LIVES
  // ══════════════════════════════════════════════════════════════

  updateScore(points) {
    this.score += points;
    const counter = { v: this.displayScore };
    this.tweens.add({
      targets: counter, v: this.score, duration: 400,
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
      if (this.combo >= 2) {
        this.tweens.add({ targets: this.comboText, scale: 1.4, duration: 150, yoyo: true });
      }
    } else {
      if (this.combo >= 2) this.comboShatterEffect();
      this.combo = 0;
      this.comboText.setText("×1");
    }
  }

  comboShatterEffect() {
    const { x, y } = this.comboText;
    const p = this.add.particles(x + 10, y + 8, "l22_dot", {
      speed: { min: 40, max: 140 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.5, end: 0 },
      lifespan: 400,
      tint: 0xffd740,
      emitting: false,
    }).setDepth(55);
    p.explode(12);
    this.time.delayedCall(600, () => p.destroy());
  }

  /** Returns true when out of lives. */
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
    this.clearRound();
    this.hideBubble();

    // vault goes dark
    this.cells.forEach((c) => {
      if (c.pulse) c.pulse.stop();
      this._drawCellBody(c.body, 0x1a1a2a, 2);
      this.tweens.add({ targets: [c.valueText, c.indexLabel], alpha: 0.15, duration: 500 });
    });
    this.ceilingLights.forEach((l) => l.setFillStyle(0xf44336, 0.08));

    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
    this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });

    const title = this.add.text(640, 240, "SECURITY BREACH", {
      font: "bold 40px Arial", color: HEX_RED,
    }).setOrigin(0.5).setScale(0).setDepth(91);
    this.tweens.add({
      targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut",
      onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }),
    });

    this.add.text(640, 310, `Score: ${this.score}`, { font: "20px Arial", color: "#ffffff" })
      .setOrigin(0.5).setDepth(91);
    this.add.text(640, 350, `Rounds Completed: ${this.currentRound} / ${ROUNDS.length}`, {
      font: "16px Arial", color: HEX_GRAY,
    }).setOrigin(0.5).setDepth(91);

    this._makeButton(640, 420, "RETRY", 180, 50, {
      stroke: C_RED, textColor: HEX_RED,
    }, () => this.scene.restart());
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearRound();
    this.hideBubble();

    // persist progress
    const accuracy = this.correctFirstTry / ROUNDS.length;
    try { GameManager.completeLevel(21, Math.round(accuracy * 100)); } catch (_) {}
    try { BadgeSystem.unlock("array_schema"); } catch (_) {}
    try {
      localStorage.setItem("level22_results", JSON.stringify({
        level: 22,
        score: this.score + this.lives * 200,
        accuracy,
        avgTime: Math.round(this.totalTime / ROUNDS.length),
        comboMax: this.maxCombo,
        stars: this._starRating(),
        livesRemaining: this.lives,
        roundDetails: this.roundResults,
        timestamp: Date.now(),
      }));
    } catch (_) {}

    this.vaultDoorAnimation().then(() => {
      if (this._alive) this.showScoreTally();
    });
  }

  _starRating() {
    const pct = this.correctFirstTry / ROUNDS.length;
    if (pct >= 0.9) return 3;
    if (pct >= 0.7) return 2;
    return 1;
  }

  vaultDoorAnimation() {
    return new Promise((res) => {
      // all cells glow gold
      this.cells.forEach((c) => {
        if (c.pulse) c.pulse.stop();
        c.glow.setFillStyle(C_AMBER, 0.2);
        c.pulse = this.tweens.add({ targets: c.glow, fillAlpha: 0.08, duration: 600, yoyo: true, repeat: -1 });
      });

      // golden light behind the doors
      const light = this.add.rectangle(640, H / 2, 4, H, 0xffd740, 0.06).setDepth(80);
      // two vault door panels sliding apart
      const leftDoor = this.add.rectangle(490, H / 2, 300, H, 0x0a1018)
        .setStrokeStyle(2, 0x1a2535).setDepth(81);
      const rightDoor = this.add.rectangle(790, H / 2, 300, H, 0x0a1018)
        .setStrokeStyle(2, 0x1a2535).setDepth(81);

      this.tweens.add({ targets: leftDoor, x: 190, duration: 800, ease: "Cubic.easeInOut" });
      this.tweens.add({ targets: rightDoor, x: 1090, duration: 800, ease: "Cubic.easeInOut" });
      this.tweens.add({ targets: light, width: 600, fillAlpha: 0.15, duration: 800, ease: "Cubic.easeInOut" });

      const p = this.add.particles(640, H / 2, "l22_dot", {
        speed: { min: 20, max: 60 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.6, end: 0 },
        lifespan: 1500,
        tint: 0xffd740,
        quantity: 1,
        frequency: 60,
      }).setDepth(82);

      this.time.delayedCall(1300, () => {
        p.stop();
        this.time.delayedCall(1500, () => p.destroy());
        this.tweens.add({ targets: [leftDoor, rightDoor, light], alpha: 0, duration: 400 });
        res();
      });
    });
  }

  showScoreTally() {
    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
    this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });

    const title = this.add.text(640, 95, "LEVEL COMPLETE!", {
      font: "bold 36px Arial", color: HEX_AMBER,
    }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: title, alpha: 1, duration: 400 });
    // shimmer sweep
    this.tweens.add({ targets: title, alpha: 0.65, duration: 700, delay: 600, yoyo: true, repeat: -1 });

    const base = this.roundResults.length * 100;
    const comboBonus = this.score - base;
    const livesBonus = this.lives * 200;
    const total = this.score + livesBonus;

    const lines = [
      { t: `Base Score: ${base}`, c: "#ffffff", f: "18px Arial" },
      { t: `Combo Bonus: +${comboBonus}`, c: HEX_AMBER, f: "18px Arial" },
      { t: `Lives Bonus: +${livesBonus}`, c: HEX_CYAN, f: "18px Arial" },
    ];
    lines.forEach((ln, i) => {
      const t = this.add.text(640, 170 + i * 34, ln.t, { font: ln.f, color: ln.c })
        .setOrigin(0.5).setAlpha(0).setDepth(91);
      this.tweens.add({ targets: t, alpha: 1, duration: 250, delay: 300 * (i + 1) });
    });

    const sep = this.add.graphics().setDepth(91).setAlpha(0);
    sep.lineStyle(1, 0x2a3a4a, 1);
    sep.lineBetween(500, 282, 780, 282);
    this.tweens.add({ targets: sep, alpha: 1, duration: 250, delay: 1200 });

    const totalText = this.add.text(640, 312, "TOTAL: 0", {
      font: "bold 24px Arial", color: HEX_AMBER,
    }).setOrigin(0.5).setAlpha(0).setDepth(91);
    this.tweens.add({ targets: totalText, alpha: 1, duration: 200, delay: 1400 });
    const counter = { v: 0 };
    this.tweens.add({
      targets: counter, v: total, duration: 1000, delay: 1400,
      onUpdate: () => { if (totalText.active) totalText.setText(`TOTAL: ${Math.round(counter.v)}`); },
    });

    // stars
    const stars = this._starRating();
    for (let i = 0; i < 3; i++) {
      const earned = i < stars;
      const s = this.add.text(640 + (i - 1) * 64, 375, "★", {
        font: "44px Arial", color: earned ? HEX_AMBER : "#2a3040",
      }).setOrigin(0.5).setDepth(91).setScale(0);
      this.tweens.add({
        targets: s, scale: 1, duration: 260, delay: 1800 + i * 220,
        ease: earned ? "Back.easeOut" : "Cubic.easeOut",
      });
    }

    // badge — circle with a row of 5 tiny "array cell" squares
    const badge = this.add.container(640, 460).setDepth(91).setAlpha(0);
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillCircle(0, 0, 30);
    bg.lineStyle(2, C_AMBER, 1);
    bg.strokeCircle(0, 0, 30);
    bg.fillStyle(C_AMBER, 1);
    for (let i = 0; i < 5; i++) bg.fillRect(-19 + i * 8, -3, 6, 6);
    badge.add(bg);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 2400 });
    const badgeLbl = this.add.text(640, 505, "ARRAY SCHEMA ACQUIRED", {
      font: "bold 13px Arial", color: HEX_AMBER,
    }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: badgeLbl, alpha: 1, duration: 300, delay: 2500 });

    // buttons
    this._makeButton(520, 590, "RETRY", 160, 46, {
      stroke: 0x546e7a, textColor: "#b0bec5",
    }, () => this.scene.restart());
    this._makeButton(750, 590, "NEXT: Index Interceptor →", 260, 46, {
      fill: 0x00733a, stroke: C_GREEN, textColor: "#ffffff",
    }, () => {
      // Level 23 isn't built yet — return to the menu
      if (this.scene.get("Level23Scene")) this.scene.start("Level23Scene");
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
