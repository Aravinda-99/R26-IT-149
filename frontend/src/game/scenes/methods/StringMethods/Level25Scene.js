/**
 * Level 25 — "The Scan Chamber" (String Methods: Accretion Phase)
 * ==================================================================
 * Teaches the Java String method `length()` through a forensic string
 * analysis lab metaphor: strings are "specimens" placed under a scanning
 * beam that counts characters one by one.
 *
 * Core teaching points:
 *  - length() returns a total CHARACTER COUNT (1-based counting, not indices)
 *  - EVERY character counts — spaces, digits, symbols included
 *  - an empty string has length 0 (not an error, not undefined)
 *  - length() is a METHOD (parentheses required) — unlike array .length
 *    (a property, no parentheses), which the learner already knows from
 *    Levels 22-24. This deliberate reuse of the "indexed slot" visual
 *    language anchors the new String schema onto the existing array schema.
 *
 * 12 rounds across 4 challenge types:
 *  A. Scan Prediction   (rounds 1-3)  — predict length() of a simple string
 *  B. Hidden Characters (rounds 4-6)  — spaces/symbols/empty-string traps
 *  C. Syntax Judgment   (rounds 7-9)  — valid/invalid code, method vs property
 *  D. Feed the Scanner  (rounds 10-12) — drag the specimen with the right length
 *
 * Every answer (right or wrong) is followed by the scan animation — the
 * machine always shows the true count. Misconception tags on wrong answers
 * feed Bit's targeted feedback and are logged for the research framework's
 * error-pattern detector.
 */

import Phaser from "phaser";
import { GameManager } from "../../../GameManager.js";
import { BadgeSystem } from "../../../BadgeSystem.js";

const W = 1280, H = 720;

const C_CYAN = 0x00e5ff, C_AMBER = 0xffd740, C_GREEN = 0x00e676;
const C_RED = 0xf44336, C_GRAY = 0x78909c, C_MAGENTA = 0xff4081;
const C_ORANGE = 0xff9800;
const HEX_CYAN = "#00e5ff", HEX_AMBER = "#ffd740", HEX_GREEN = "#00e676";
const HEX_RED = "#f44336", HEX_GRAY = "#78909c", HEX_MAGENTA = "#ff4081";
const HEX_ORANGE = "#ff9800";

const CHAMBER_X = 640, CHAMBER_Y = 330, CHAMBER_W = 820, CHAMBER_H = 190;
const TILE_H = 64;
const COUNTER_X = 1075, COUNTER_Y = 330;

const TUTORIAL_KEY = "level25_tutorial_done";

// ─────────────────────────────────────────────────────────────────
// Round configuration
// ─────────────────────────────────────────────────────────────────
const ROUNDS = [
  { round: 1, type: "predict", varName: "word", str: "java",
    question: "What will word.length() return?", correct: 4,
    options: [
      { value: 4, tag: null },
      { value: 3, tag: "off_by_one_index_as_length" },
      { value: 5, tag: "off_by_one_plus" },
      { value: 6, tag: "quotes_counted" },
    ], concept: "basic_count" },

  { round: 2, type: "predict", varName: "name", str: "Colombo",
    question: "What will name.length() return?", correct: 7,
    options: [
      { value: 7, tag: null },
      { value: 6, tag: "off_by_one_index_as_length" },
      { value: 8, tag: "off_by_one_plus" },
      { value: 1, tag: "word_count_vs_char_count" },
    ], concept: "basic_count" },

  { round: 3, type: "predict", varName: "code", str: "AB12",
    question: "What will code.length() return?", correct: 4,
    options: [
      { value: 4, tag: null },
      { value: 2, tag: "letters_only_counted" },
      { value: 3, tag: "off_by_one_index_as_length" },
      { value: 5, tag: "off_by_one_plus" },
    ], concept: "digits_count" },

  { round: 4, type: "predict", varName: "msg", str: "hi there",
    question: "What will msg.length() return?", correct: 8,
    options: [
      { value: 8, tag: null },
      { value: 7, tag: "spaces_not_counted" },
      { value: 2, tag: "word_count_vs_char_count" },
      { value: 9, tag: "off_by_one_plus" },
    ], concept: "space_counts" },

  { round: 5, type: "predict", varName: "greet", str: "Hi, Bit!",
    question: "What will greet.length() return?", correct: 8,
    options: [
      { value: 8, tag: null },
      { value: 6, tag: "symbols_not_counted" },
      { value: 7, tag: "spaces_not_counted" },
      { value: 5, tag: "letters_only_counted" },
    ], concept: "symbols_count" },

  { round: 6, type: "predict", varName: "s", str: "",
    question: "What will s.length() return?", correct: 0,
    options: [
      { value: 0, tag: null },
      { value: 1, tag: "empty_string_confusion" },
      { value: -1, tag: "empty_returns_negative" },
      { value: "Error", tag: "empty_string_error_belief" },
    ], concept: "empty_string" },

  { round: 7, type: "judge", snippet: 'String word = "scan";\nint n = word.length();',
    correct: "valid", resultValue: 4, wrongTag: "method_call_doubt",
    concept: "method_syntax_valid" },

  { round: 8, type: "judge", snippet: 'String word = "scan";\nint n = word.length;',
    correct: "invalid",
    explanation: "length() is a METHOD on Strings — parentheses required!",
    fix: "word.length()", wrongTag: "property_vs_method_syntax",
    concept: "missing_parentheses" },

  { round: 9, type: "judge", snippet: "int[] data = {3, 1, 4};\nint n = data.length;",
    correct: "valid", resultValue: 3,
    explanation: "Arrays use .length (property). Strings use .length() (method).",
    wrongTag: "property_vs_method_syntax", concept: "array_property_contrast" },

  { round: 10, type: "feed", target: 6,
    pool: [
      { str: "coffee", correct: true },
      { str: "tea", tag: "misjudged_count" },
      { str: "planet!", tag: "misjudged_count" },
      { str: "cup", tag: "misjudged_count" },
    ], concept: "apply_length" },

  { round: 11, type: "feed", target: 8,
    pool: [
      { str: "hi there", correct: true },
      { str: "hithere", tag: "spaces_not_counted" },
      { str: "greetings", tag: "misjudged_count" },
      { str: "morning", tag: "misjudged_count" },
    ], concept: "apply_space_counts" },

  { round: 12, type: "feed", target: 0,
    pool: [
      { str: "", correct: true, label: '"" (empty)' },
      { str: " ", tag: "empty_string_confusion", label: '" " (one space)' },
      { str: "0", tag: "zero_char_confusion" },
      { str: "null", tag: "null_vs_empty_confusion" },
    ], concept: "empty_vs_space" },
];

const MISCONCEPTION_FEEDBACK = {
  off_by_one_index_as_length: "Careful! You counted like indices (0,1,2...). length() is a simple COUNT starting from 1. Count the tiles: 1, 2, 3...",
  off_by_one_plus: "That's one too many! Count the tiles carefully — don't add an extra for a phantom character.",
  quotes_counted: "The quotes are just wrapping paper — they are NOT inside the String!",
  word_count_vs_char_count: "length() counts CHARACTERS, not words! Every letter, space, and symbol adds one.",
  letters_only_counted: "Digits and symbols count too! length() doesn't care what KIND of character it is — every one counts.",
  spaces_not_counted: "The space is invisible but REAL! Every space is one character. Watch the magenta ␣ tile in the scan.",
  symbols_not_counted: "Punctuation counts too! A comma, an exclamation mark — every symbol is one character.",
  empty_string_confusion: 'An empty String "" has ZERO characters — length 0, no error. But " " with a space has length 1!',
  empty_returns_negative: "length() can never be negative! The smallest possible length is 0, for an empty String.",
  empty_string_error_belief: "Calling length() on an empty String is perfectly legal — it just returns 0, no error!",
  method_call_doubt: "word.length() is exactly right — a String variable, a dot, and length() with parentheses. Totally valid Java!",
  property_vs_method_syntax: "Tricky Java rule: Strings need length() with parentheses. Only ARRAYS use .length without them!",
  misjudged_count: "Recount those tiles! Every character — letters, spaces, symbols — adds exactly one to the length.",
  zero_char_confusion: '"0" is the character zero, not the number zero — it still counts as ONE character, so length is 1, not 0.',
  null_vs_empty_confusion: '"null" is just 4 letters (n-u-l-l) here — as a String literal it has length 4, not 0!',
};

export class Level25Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level25Scene" });
  }

  init() {
    this.currentRound = 0;
    this.score = 0;
    this.displayScore = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.lives = 3;
    this.correctFirstTry = 0;
    this.attemptLog = [];
    this.totalTime = 0;
    this.roundElements = [];
    this.roundStartTime = 0;
    this.roundAttempts = 0;
    this.feedMissCount = 0;
    this.tiles = [];
    this.optionBubbles = [];
    this.capsules = [];
    this.inputLocked = true;
    this.gameEnded = false;
    this._alive = true;
    this._bubble = null;
    this._dragOverChamber = false;
  }

  preload() {}

  create() {
    this._alive = true;
    this.events.once("shutdown", () => { this._alive = false; });

    const cam = this.cameras.main;
    const zoom = Math.min(this.scale.width / W, this.scale.height / H);
    cam.setZoom(zoom);
    cam.centerOn(W / 2, H / 2);
    cam.setBackgroundColor("#070b12");

    try { GameManager.incrementAttempt(24); } catch (_) {}

    this.createParticleTexture();
    this.createBackground();
    this.createLabFloor();
    this.createCeilingRail();
    this.createLabEquipment();
    this.createDataMotes();
    this.createScanGrid();
    this.createChamber();
    this.createCounterDisplay();
    this.createHUD();
    this.createExpressionMonitor();
    this.createBit();
    this.setupDragEvents();

    cam.fadeIn(700, 5, 8, 18);
    this.checkTutorial();
  }

  update(time, delta) {
    this.updateDataMotes(time, delta);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // SETUP — background & environment
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l25_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l25_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x070b12).setDepth(0);
  }

  createLabFloor() {
    const g = this.add.graphics().setDepth(1);
    const top = 590, panelH = 22;
    for (let i = 0; i < 6; i++) {
      const y = top + i * panelH;
      g.fillStyle(i % 2 === 0 ? 0x0e131b : 0x0a0f16, 1);
      g.fillRect(0, y, W, panelH);
      g.lineStyle(1, 0x1a2535, 0.22);
      g.lineBetween(0, y, W, y);
    }
    [200, 640, 1080].forEach((x) => {
      g.lineStyle(1, 0x1a2535, 0.05);
      g.strokeCircle(x, 640, 40);
    });
  }

  createCeilingRail() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x141a24, 1);
    g.lineStyle(1, 0x1a2535, 1);
    g.fillRoundedRect(0, 14, W, 12, 3);
    g.strokeRoundedRect(0, 14, W, 12, 3);
    for (let x = 110; x < W; x += 210) {
      const bright = Math.abs(x - 640) < 20;
      g.fillStyle(0x4fc3f7, bright ? 0.03 : 0.015);
      g.fillTriangle(x - 4, 26, x + 4, 26, x + 30, 110);
      g.fillTriangle(x - 4, 26, x + 4, 26, x - 30, 110);
    }
  }

  createLabEquipment() {
    const g = this.add.graphics().setDepth(1);
    [[40, 300], [150, 300]].forEach(([x, y]) => {
      g.fillStyle(0x0a0f16, 0.4);
      g.fillRect(x, y, 90, 180);
      g.lineStyle(1, 0x1a2535, 0.05);
      g.strokeRect(x, y, 90, 180);
      g.fillStyle(0xffd740, 0.04);
      g.fillCircle(x + 45, y + 40, 3);
      g.fillCircle(x + 45, y + 90, 3);
    });
    [[1030, 300], [1140, 300]].forEach(([x, y]) => {
      g.fillStyle(0x0a0f16, 0.4);
      g.fillRect(x, y, 90, 180);
      g.lineStyle(1, 0x1a2535, 0.05);
      g.strokeRect(x, y, 90, 180);
      g.fillStyle(0xffd740, 0.04);
      g.fillCircle(x + 45, y + 40, 3);
      g.fillCircle(x + 45, y + 90, 3);
    });
  }

  createDataMotes() {
    this.motes = [];
    for (let i = 0; i < 10; i++) {
      const p = this.add.circle(
        Phaser.Math.Between(60, 1220), Phaser.Math.Between(80, 600),
        1, C_CYAN, Phaser.Math.FloatBetween(0.03, 0.06)
      ).setDepth(2);
      this.motes.push(p);
    }
  }

  updateDataMotes(time, delta) {
    if (!this.motes) return;
    const step = 0.06 * (delta / 16.7);
    this.motes.forEach((p, i) => {
      p.y -= step;
      p.x += Math.sin(time * 0.0009 + i) * 0.05;
      if (p.y < 50) { p.y = 600; p.x = Phaser.Math.Between(60, 1220); }
    });
  }

  createScanGrid() {
    const g = this.add.graphics().setDepth(2);
    g.lineStyle(1, 0x1565c0, 0.02);
    for (let x = 240; x <= 1040; x += 40) g.lineBetween(x, 240, x, 430);
    for (let y = 240; y <= 430; y += 40) g.lineBetween(240, y, 1040, y);
  }

  // ══════════════════════════════════════════════════════════════
  // CHAMBER
  // ══════════════════════════════════════════════════════════════

  createChamber() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0b0f16, 1);
    g.fillRoundedRect(CHAMBER_X - CHAMBER_W / 2, CHAMBER_Y - CHAMBER_H / 2, CHAMBER_W, CHAMBER_H, 14);
    g.lineStyle(2, 0x21262d, 1);
    g.strokeRoundedRect(CHAMBER_X - CHAMBER_W / 2, CHAMBER_Y - CHAMBER_H / 2, CHAMBER_W, CHAMBER_H, 14);
    this.chamberDropTarget = g;

    this.add.text(CHAMBER_X - CHAMBER_W / 2 + 14, CHAMBER_Y - CHAMBER_H / 2 + 10, "SPECIMEN SCANNER", {
      font: "bold 10px Arial", color: "#3d4450",
    }).setDepth(11);

    const clampG = this.add.graphics().setDepth(11);
    clampG.fillStyle(0x141a24, 1);
    clampG.lineStyle(1, 0x1a2535, 1);
    [CHAMBER_X - CHAMBER_W / 2 + 12, CHAMBER_X + CHAMBER_W / 2 - 22].forEach((x) => {
      clampG.fillRoundedRect(x, CHAMBER_Y - 25, 10, 50, 3);
      clampG.strokeRoundedRect(x, CHAMBER_Y - 25, 10, 50, 3);
    });

    this.emptyPlaceholder = this.add.container(CHAMBER_X, CHAMBER_Y).setDepth(12).setVisible(false);
    const dash = this.add.graphics();
    dash.lineStyle(1, 0x3d4450, 0.3);
    this._dashedRectOutline(dash, -100, -40, 200, 80, 4, 4);
    const emptyTxt = this.add.text(0, 0, "(empty)", { font: "italic 13px Arial", color: "#3d4450" }).setOrigin(0.5);
    this.emptyPlaceholder.add([dash, emptyTxt]);

    // scanner beam
    this.beam = this.add.container(0, CHAMBER_Y).setDepth(18).setVisible(false);
    const glow = this.add.rectangle(0, 0, 14, 110, C_CYAN, 0.1);
    const core = this.add.rectangle(0, 0, 4, 110, C_CYAN, 0.7);
    const tip = this.add.triangle(0, -60, -6, 0, 6, 0, 0, 10, C_CYAN);
    this.beam.add([glow, core, tip]);

    // literal display above chamber
    this.literalGroup = null;

    // question card container placeholder
    this.questionCard = null;
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

  updateLiteralDisplay(varName, str) {
    if (this.literalGroup) { this.literalGroup.destroy(); this.literalGroup = null; }
    const c = this.add.container(0, 215).setDepth(15);
    let x = 0;
    const font = "16px Courier New";
    const put = (t, color) => {
      const txt = this.add.text(x, 0, t, { font, color }).setOrigin(0, 0.5);
      c.add(txt);
      x += txt.width;
      return txt;
    };
    put("String", HEX_MAGENTA);
    put(" " + varName + " = ", HEX_GRAY);
    const q1 = put('"', HEX_GRAY);
    put(str, HEX_AMBER);
    const q2 = put('"', HEX_GRAY);
    put(";", HEX_GRAY);
    c.x = 640 - x / 2;
    this.literalGroup = c;
    this.literalQuotes = [q1, q2];
    return c;
  }

  // ══════════════════════════════════════════════════════════════
  // CHARACTER TILES
  // ══════════════════════════════════════════════════════════════

  _charMeta(ch) {
    if (ch === " ") return { display: "␣", color: HEX_MAGENTA, isSpace: true };
    if (/[0-9]/.test(ch)) return { display: ch, color: HEX_AMBER, isSpace: false };
    if (/[a-zA-Z]/.test(ch)) return { display: ch, color: HEX_CYAN, isSpace: false };
    return { display: ch, color: HEX_ORANGE, isSpace: false };
  }

  getTilePosition(index) {
    const n = this.tiles.length || 1;
    const tw = this._tileWidth(n);
    const totalW = n * tw + (n - 1) * 6;
    const startX = CHAMBER_X - totalW / 2;
    return { x: startX + index * (tw + 6) + tw / 2, y: CHAMBER_Y, w: tw };
  }

  _tileWidth(n) {
    if (n <= 12) return 52;
    return Math.max(38, Math.floor((CHAMBER_W - 40 - (n - 1) * 6) / n));
  }

  buildTileRow(str) {
    this.clearTileRow();
    if (str.length === 0) {
      this.emptyPlaceholder.setVisible(true);
      return;
    }
    this.emptyPlaceholder.setVisible(false);
    const n = str.length;
    const tw = this._tileWidth(n);
    const totalW = n * tw + (n - 1) * 6;
    const startX = CHAMBER_X - totalW / 2;
    this.tiles = str.split("").map((ch, i) => {
      const x = startX + i * (tw + 6) + tw / 2;
      return this.createTile(ch, i, x, CHAMBER_Y, tw);
    });
  }

  createTile(ch, index, x, y, tw = 52) {
    const meta = this._charMeta(ch);
    const container = this.add.container(x, y).setDepth(12);
    const glow = this.add.rectangle(0, 0, tw + 6, TILE_H + 6, C_CYAN, 0);
    const body = this.add.graphics();
    this._drawTileBody(body, tw, 0x2a3a4a, 2);
    const charText = this.add.text(0, meta.isSpace ? -6 : 0, meta.display, {
      font: "bold 24px Courier New", color: meta.color,
    }).setOrigin(0.5);
    if (meta.isSpace) charText.setAlpha(0.85);
    const spaceLabel = meta.isSpace
      ? this.add.text(0, 16, "space", { font: "8px Arial", color: HEX_MAGENTA }).setOrigin(0.5).setAlpha(0.6)
      : null;
    const countLabel = this.add.text(0, TILE_H / 2 + 14, String(index + 1), {
      font: "10px Courier New", color: "#546e7a",
    }).setOrigin(0.5).setAlpha(0).setScale(0);
    container.add([glow, body, charText]);
    if (spaceLabel) container.add(spaceLabel);
    container.add(countLabel);
    return { container, glow, body, charText, countLabel, index, ch, tw, x, y, pulse: null };
  }

  _drawTileBody(g, tw, stroke, lw) {
    g.clear();
    g.fillStyle(0x0d1117, 1);
    g.fillRoundedRect(-tw / 2, -TILE_H / 2, tw, TILE_H, 6);
    g.lineStyle(lw, stroke, 1);
    g.strokeRoundedRect(-tw / 2, -TILE_H / 2, tw, TILE_H, 6);
  }

  setTileState(i, state) {
    const tile = this.tiles[i];
    if (!tile || !tile.container.active) return;
    if (tile.pulse) { tile.pulse.stop(); tile.pulse = null; }
    const map = { scanned: C_CYAN, correct: C_GREEN, error: C_RED, default: 0x2a3a4a };
    const color = map[state] || map.default;
    if (state === "default") {
      this._drawTileBody(tile.body, tile.tw, 0x2a3a4a, 2);
      tile.glow.setFillStyle(C_CYAN, 0);
      return;
    }
    this._drawTileBody(tile.body, tile.tw, color, 2);
    tile.glow.setFillStyle(color, 0.12);
    this.tweens.add({ targets: tile.glow, fillAlpha: state === "scanned" ? 0.04 : 0, duration: 250 });
    if (state === "correct") {
      this.tweens.add({ targets: tile.charText, scale: 1.2, duration: 150, yoyo: true });
    } else if (state === "error") {
      this.tweens.add({
        targets: tile.container, x: tile.x + 4, duration: 42, yoyo: true, repeat: 5,
        onComplete: () => { if (tile.container.active) tile.container.x = tile.x; },
      });
    }
  }

  clearTileRow() {
    this.tiles.forEach((t) => { if (t.pulse) t.pulse.stop(); t.container.destroy(); });
    this.tiles = [];
    this.emptyPlaceholder.setVisible(false);
  }

  // ══════════════════════════════════════════════════════════════
  // SCANNER ANIMATION
  // ══════════════════════════════════════════════════════════════

  resetCounter() {
    this.counterValue = 0;
    this.counterText.setText("0").setColor(HEX_CYAN).setScale(1);
    this.counterMethodLabel.setAlpha(0);
    this.tiles.forEach((t, i) => {
      this.setTileState(i, "default");
      t.countLabel.setAlpha(0).setScale(0);
    });
  }

  setCounterTarget(text) {
    this.counterText.setText(text).setColor(HEX_AMBER).setScale(1);
    this.counterFontSmall(true);
    this.counterMethodLabel.setAlpha(0);
  }

  counterFontSmall(small) {
    this.counterText.setFontSize(small ? 15 : 34);
  }

  async runScanAnimation({ flashColor = HEX_GREEN, emptyFlashColor = HEX_AMBER } = {}) {
    this.counterFontSmall(false);
    this.resetCounter();
    const n = this.tiles.length;

    if (n === 0) {
      const left = CHAMBER_X - 100, right = CHAMBER_X + 100;
      this.beam.setPosition(left, CHAMBER_Y).setVisible(true).setAlpha(0);
      this.tweens.add({ targets: this.beam, alpha: 1, duration: 80 });
      await new Promise((res) => {
        this.tweens.add({ targets: this.beam, x: right, duration: 400, ease: "Linear", onComplete: () => res() });
      });
      if (!this._alive) return;
      this.tweens.add({ targets: this.beam, alpha: 0, duration: 120, onComplete: () => this.beam.setVisible(false) });
      this.flashCounter(emptyFlashColor);
      return;
    }

    const first = this.tiles[0], last = this.tiles[n - 1];
    this.beam.setPosition(first.x - first.tw / 2 - 2, CHAMBER_Y).setVisible(true).setAlpha(1);

    for (let i = 0; i < n; i++) {
      if (!this._alive) return;
      const tile = this.tiles[i];
      await new Promise((res) => {
        this.tweens.add({ targets: this.beam, x: tile.x, duration: 140, ease: "Linear", onComplete: () => res() });
      });
      if (!this._alive) return;
      this.setTileState(i, "scanned");
      tile.countLabel.setAlpha(1).setColor("#ffffff");
      this.tweens.add({ targets: tile.countLabel, scale: 1, duration: 150, ease: "Back.easeOut" });
      this.counterValue++;
      this.counterText.setText(String(this.counterValue));
      this.tweens.add({ targets: this.counterText, scale: 1.15, duration: 100, yoyo: true });
      const sparks = this.add.particles(tile.x, tile.y, "l25_dot", {
        speed: { min: 30, max: 70 }, angle: { min: 0, max: 360 },
        scale: { start: 0.5, end: 0 }, lifespan: 250, tint: C_CYAN, emitting: false,
      }).setDepth(19);
      sparks.explode(3);
      this.time.delayedCall(300, () => sparks.destroy());
    }

    if (!this._alive) return;
    this.tweens.add({ targets: this.beam, alpha: 0, duration: 200, onComplete: () => this.beam.setVisible(false) });
    this.flashCounter(flashColor);
    this.counterMethodLabel.setAlpha(0);
    this.tweens.add({ targets: this.counterMethodLabel, alpha: 1, duration: 300, delay: 150 });
  }

  flashCounter(colorHex) {
    const colorNum = Phaser.Display.Color.HexStringToColor(colorHex).color;
    this.tweens.add({ targets: this.counterText, scale: 1.3, duration: 150, yoyo: true });
    this.counterText.setColor(colorHex);
    this.tweens.add({
      targets: this.counterPanelGlow, fillAlpha: 0.25, duration: 200, yoyo: true, repeat: 1,
      onStart: () => this.counterPanelGlow.setFillStyle(colorNum, 0),
    });
  }

  // ══════════════════════════════════════════════════════════════
  // COUNTER DISPLAY
  // ══════════════════════════════════════════════════════════════

  createCounterDisplay() {
    const g = this.add.graphics().setDepth(14);
    g.fillStyle(0x0a0e14, 1);
    g.fillRoundedRect(COUNTER_X - 65, COUNTER_Y - 40, 130, 80, 8);
    g.lineStyle(1, C_CYAN, 1);
    g.strokeRoundedRect(COUNTER_X - 65, COUNTER_Y - 40, 130, 80, 8);
    this.counterPanelGlow = this.add.rectangle(COUNTER_X, COUNTER_Y, 130, 80, C_GREEN, 0).setDepth(14);

    this.add.text(COUNTER_X, COUNTER_Y - 30, "CHAR COUNT", {
      font: "bold 9px Arial", color: "#546e7a",
    }).setOrigin(0.5).setDepth(15);
    this.counterText = this.add.text(COUNTER_X, COUNTER_Y - 2, "0", {
      font: "bold 34px Courier New", color: HEX_CYAN,
    }).setOrigin(0.5).setDepth(15);
    this.counterMethodLabel = this.add.text(COUNTER_X, COUNTER_Y + 28, ".length()", {
      font: "bold 12px Courier New", color: HEX_AMBER,
    }).setOrigin(0.5).setDepth(15).setAlpha(0);
  }

  // ══════════════════════════════════════════════════════════════
  // HUD
  // ══════════════════════════════════════════════════════════════

  createHUD() {
    const g = this.add.graphics().setDepth(50);
    g.fillStyle(0x0a0e14, 0.93);
    g.fillRect(0, 0, W, 64);
    g.lineStyle(1, 0x1a2535, 1);
    g.lineBetween(0, 64, W, 64);

    this.add.text(20, 14, "THE SCAN CHAMBER", { font: "bold 15px Arial", color: "#b0bec5" }).setDepth(51);
    this.add.text(20, 36, "Accretion Phase — String Methods: length()", { font: "11px Arial", color: "#546e7a" }).setDepth(51);

    const mg = this.add.graphics().setDepth(51);
    mg.fillStyle(0x1a1a2e, 1);
    mg.fillRoundedRect(400, 10, 480, 44, 8);
    mg.lineStyle(1, 0x2a2a4a, 1);
    mg.strokeRoundedRect(400, 10, 480, 44, 8);
    this.monitorGroup = null;

    this.add.text(1050, 12, "SCORE", { font: "9px Arial", color: "#546e7a" }).setDepth(51);
    this.scoreText = this.add.text(1050, 24, "0", { font: "bold 20px Arial", color: "#ffffff" }).setDepth(51);
    this.comboText = this.add.text(1140, 30, "×1", { font: "bold 16px Arial", color: HEX_AMBER }).setDepth(51);

    this.lifeIcons = [];
    for (let i = 0; i < 3; i++) {
      const lg = this.add.graphics({ x: 1195 + i * 28, y: 30 }).setDepth(51);
      lg.lineStyle(2, C_CYAN, 1);
      lg.strokeCircle(-2, -2, 6);
      lg.lineBetween(2, 2, 8, 8);
      this.lifeIcons.push(lg);
    }
  }

  createExpressionMonitor() {
    // container populated per round via updateExpressionMonitor()
  }

  /** mode: 'predict' | 'judge' | 'feed' */
  updateExpressionMonitor(mode, data) {
    if (this.monitorGroup) { this.monitorGroup.destroy(); this.monitorGroup = null; }
    const c = this.add.container(0, 32).setDepth(52);
    if (mode === "predict") {
      let x = 0;
      const put = (t, color, font) => {
        const txt = this.add.text(x, 0, t, { font: font || "bold 15px Courier New", color }).setOrigin(0, 0.5);
        c.add(txt);
        x += txt.width;
      };
      put(data.varName, HEX_CYAN);
      put(".", HEX_GRAY);
      put("length", HEX_AMBER);
      put("()", HEX_MAGENTA);
      c.x = 640 - x / 2;
    } else if (mode === "judge") {
      const lines = data.snippet.split("\n");
      lines.forEach((line, i) => {
        const t = this.add.text(0, (i - (lines.length - 1) / 2) * 16, line, {
          font: "12px Courier New", color: "#e0e0e0",
        }).setOrigin(0.5);
        c.add(t);
      });
      c.x = 640;
    } else if (mode === "feed") {
      let x = 0;
      const put = (t, color) => {
        const txt = this.add.text(x, 0, t, { font: "bold 15px Courier New", color }).setOrigin(0, 0.5);
        c.add(txt);
        x += txt.width;
      };
      put("length", HEX_AMBER);
      put("()", HEX_MAGENTA);
      put(" == ", HEX_GRAY);
      put(String(data.target), HEX_CYAN);
      c.x = 640 - x / 2;
    }
    this.monitorGroup = c;
  }

  showCompileErrorStamp() {
    const stamp = this.add.text(640, 32, "COMPILE ERROR", {
      font: "bold 26px Arial", color: HEX_RED,
    }).setOrigin(0.5).setDepth(60).setScale(2).setAngle(-8).setAlpha(0);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 250, ease: "Cubic.easeOut" });
    this.screenShake(0.006, 200);
    this.roundElements.push(stamp);
    return stamp;
  }

  showComparisonCard() {
    const c = this.add.container(640, 460).setDepth(20);
    const g = this.add.graphics();
    g.fillStyle(0x0d1117, 1);
    g.fillRoundedRect(-130, -35, 260, 70, 8);
    g.lineStyle(1, 0x2a3a4a, 1);
    g.strokeRoundedRect(-130, -35, 260, 70, 8);
    const l1 = this.add.text(0, -15, "String → .length()", { font: "bold 13px Courier New", color: HEX_CYAN }).setOrigin(0.5);
    const l2 = this.add.text(0, 15, "array  → .length", { font: "bold 13px Courier New", color: HEX_AMBER }).setOrigin(0.5);
    c.add([g, l1, l2]);
    c.setAlpha(0);
    this.tweens.add({ targets: c, alpha: 1, duration: 300 });
    this.roundElements.push(c);
    return c;
  }

  // ══════════════════════════════════════════════════════════════
  // BIT — mascot & speech
  // ══════════════════════════════════════════════════════════════

  createBit() {
    const c = this.add.container(W + 80, 500).setDepth(60);
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
    await this.bitSlideTo(1090, 500);
    if (!this._alive) return;
    await this.bitSay(message);
    if (!this._alive) return;
    await Promise.race([this.waitForClick(), this.delay(3500)]);
    this.hideBubble();
    await this.bitSlideTo(W + 80, 500, 250);
  }

  // ══════════════════════════════════════════════════════════════
  // TUTORIAL
  // ══════════════════════════════════════════════════════════════

  checkTutorial() {
    let done = false;
    try { done = localStorage.getItem(TUTORIAL_KEY) === "true"; } catch (_) {}
    if (done) {
      this.time.delayedCall(300, () => this.startRound(0));
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
    const A = () => this._alive;

    this.buildTileRow("");
    this.resetCounter();
    await this.delay(500); if (!A()) return;
    await this.bitSlideTo(1090, 500); if (!A()) return;
    await this.bitSay("Welcome to the Scan Chamber, Analyst! Here we measure Strings. Every String is made of characters — and length() tells us exactly how many. Watch!");
    if (!A()) return;
    await this._tutorialWait(); if (!A()) return;

    // Step 2 — literal display + tiles drop in
    this.updateLiteralDisplay("word", "hello");
    await this.tutorialDropTiles("hello"); if (!A()) return;
    await this.bitSay("This String holds 5 characters. Notice the quotes are just wrapping — they are NOT characters inside the String!");
    if (!A()) return;
    await this.tutorialQuoteWarning(); if (!A()) return;
    await this._tutorialWait(); if (!A()) return;

    // Step 3 — expression monitor
    this.updateExpressionMonitor("predict", { varName: "word" });
    const parenText = this.monitorGroup.list[this.monitorGroup.list.length - 1];
    await this.bitSay("Calling word.length() makes the scanner count every character. See those parentheses ( )? length() is a METHOD — it must be CALLED. Never forget the parentheses!");
    if (!A()) return;
    this.tweens.add({ targets: parenText, scale: 1.5, duration: 250, yoyo: true, repeat: 1 });
    await this._tutorialWait(); if (!A()) return;

    // Step 4 — first scan
    await this.runScanAnimation(); if (!A()) return;
    const result = await this.tutorialFirstScan(5); if (!A()) return;
    await this.bitSay("word.length() returned 5! The counter counts 1, 2, 3, 4, 5 — simple counting, starting from ONE. length() gives the COUNT of characters.");
    if (!A()) return;
    await this._tutorialWait(); if (!A()) return;
    this.tweens.add({ targets: result, alpha: 0, duration: 250, onComplete: () => result.destroy() });

    // Step 5 — space demo
    this.updateLiteralDisplay("word", "hi there");
    await this.tutorialDropTiles("hi there"); if (!A()) return;
    this.updateExpressionMonitor("predict", { varName: "word" });
    await this.runScanAnimation(); if (!A()) return;
    await this.bitSay("Careful, Analyst — the SPACE is a character too! 'hi there' has length 8, not 7. Spaces, digits, symbols — the scanner counts them ALL.");
    if (!A()) return;
    await this.tutorialSpaceDemo(); if (!A()) return;
    await this._tutorialWait(); if (!A()) return;

    // Step 6 — go
    await this.bitSay("Your turn! Predict the counts, spot the traps, and remember those parentheses. Good luck!");
    if (!A()) return;
    await this._tutorialWait(); if (!A()) return;
    this.hideBubble();
    this.bitSlideTo(W + 80, 500, 250);
    try { localStorage.setItem(TUTORIAL_KEY, "true"); } catch (_) {}
    this.startRound(0);
  }

  async tutorialDropTiles(str) {
    this.clearTileRow();
    this.emptyPlaceholder.setVisible(false);
    const n = str.length;
    const tw = this._tileWidth(n);
    const totalW = n * tw + (n - 1) * 6;
    const startX = CHAMBER_X - totalW / 2;
    for (let i = 0; i < n; i++) {
      if (!this._alive) return;
      const x = startX + i * (tw + 6) + tw / 2;
      const tile = this.createTile(str[i], i, x, CHAMBER_Y, tw);
      tile.container.y = CHAMBER_Y - 50;
      tile.container.setAlpha(0);
      this.tiles.push(tile);
      this.tweens.add({ targets: tile.container, y: CHAMBER_Y, alpha: 1, duration: 250, ease: "Bounce.easeOut" });
      await this.delay(150);
    }
  }

  async tutorialQuoteWarning() {
    if (!this.literalQuotes) return;
    const anno = this.add.text(this.literalGroup.x + (this.literalQuotes[0].x + this.literalQuotes[1].x) / 2, 190, "quotes not counted!", {
      font: "bold 11px Arial", color: HEX_RED,
    }).setOrigin(0.5).setDepth(20).setAlpha(0);
    this.tweens.add({ targets: anno, alpha: 1, duration: 250 });
    this.literalQuotes.forEach((q) => {
      this.tweens.add({ targets: q, tint: 0xf44336, duration: 200, yoyo: true, repeat: 3 });
      q.setColor(HEX_RED);
      this.time.delayedCall(900, () => { if (q.active) q.setColor(HEX_GRAY); });
    });
    await this.delay(1000);
    this.tweens.add({ targets: anno, alpha: 0, duration: 250, onComplete: () => anno.destroy() });
  }

  tutorialFirstScan(value) {
    const t = this.add.container(640, 470).setDepth(20).setAlpha(0);
    let x = 0;
    const put = (str, color, bold) => {
      const txt = this.add.text(x, 0, str, { font: bold ? "bold 16px Courier New" : "16px Courier New", color }).setOrigin(0, 0.5);
      t.add(txt);
      x += txt.width;
    };
    put("word.length() ", HEX_CYAN);
    put(`= ${value}`, HEX_GREEN, true);
    t.x = 640 - x / 2;
    this.tweens.add({ targets: t, alpha: 1, duration: 300 });
    return t;
  }

  async tutorialSpaceDemo() {
    const spaceIdx = this.tiles.findIndex((t) => t.ch === " ");
    if (spaceIdx < 0) return;
    const tile = this.tiles[spaceIdx];
    this.tweens.add({ targets: tile.charText, scale: 1.2, duration: 250, yoyo: true, repeat: 1 });
    const anno = this.add.text(tile.x, tile.y - 60, "space counts!", {
      font: "bold 11px Arial", color: HEX_MAGENTA,
    }).setOrigin(0.5).setDepth(20).setAlpha(0);
    this.tweens.add({ targets: anno, alpha: 1, duration: 250 });
    await this.delay(1200);
    this.tweens.add({ targets: anno, alpha: 0, duration: 250, onComplete: () => anno.destroy() });
  }

  // ══════════════════════════════════════════════════════════════
  // GAMEPLAY — round system
  // ══════════════════════════════════════════════════════════════

  async startRound(index) {
    if (!this._alive || this.gameEnded) return;
    this.currentRound = index;
    const cfg = ROUNDS[index];
    this.roundAttempts = 0;
    this.feedMissCount = 0;
    this.roundStartTime = this.time.now;
    this.inputLocked = true;
    this.clearRound();

    if (cfg.type === "predict") {
      this.updateLiteralDisplay(cfg.varName, cfg.str);
      this.buildTileRow(cfg.str);
      this.updateExpressionMonitor("predict", { varName: cfg.varName });
      this.resetCounter();
    } else if (cfg.type === "judge") {
      this.clearTileRow();
      this.emptyPlaceholder.setVisible(false);
      this.updateExpressionMonitor("judge", { snippet: cfg.snippet });
      this.resetCounter();
      this.counterText.setText("?");
    } else if (cfg.type === "feed") {
      this.clearTileRow();
      this.emptyPlaceholder.setVisible(true);
      this.updateExpressionMonitor("feed", { target: cfg.target });
      this.setCounterTarget(`NEED: ${cfg.target}`);
    }

    this.showQuestionCard(cfg);
    switch (cfg.type) {
      case "predict": this.setupPredict(cfg); break;
      case "judge": this.setupJudge(cfg); break;
      case "feed": this.setupFeed(cfg); break;
    }
    this.inputLocked = false;
  }

  clearRound() {
    this.hideBubble();
    this.optionBubbles.forEach((b) => b.destroy());
    this.optionBubbles = [];
    this.capsules.forEach((c) => c.container.destroy());
    this.capsules = [];
    this.roundElements.forEach((e) => { if (e && e.destroy) e.destroy(); });
    this.roundElements = [];
    if (this.questionCard) { this.questionCard.destroy(); this.questionCard = null; }
  }

  _defaultQuestionText(cfg) {
    if (cfg.question) return cfg.question;
    if (cfg.type === "judge") return "Is this code VALID or INVALID Java?";
    if (cfg.type === "feed") return `Drag the specimen where length() == ${cfg.target}`;
    return "";
  }

  showQuestionCard(cfg) {
    const card = this.add.container(640, 540).setDepth(20).setAlpha(0);
    const g = this.add.graphics();
    g.fillStyle(0x1a1a2e, 1);
    g.fillRoundedRect(-260, -40, 520, 80, 10);
    g.lineStyle(1, 0x2a2a4a, 1);
    g.strokeRoundedRect(-260, -40, 520, 80, 10);
    const badge = this.add.circle(-228, 0, 13, C_AMBER);
    const badgeNum = this.add.text(-228, 0, String(cfg.round), {
      font: "bold 14px Arial", color: "#0a0e14",
    }).setOrigin(0.5);
    const text = this.add.text(-200, 0, this._defaultQuestionText(cfg), {
      font: "16px Arial", color: "#e0e0e0", wordWrap: { width: 440 },
    }).setOrigin(0, 0.5);
    card.add([g, badge, badgeNum, text]);
    this.tweens.add({ targets: card, y: 480, alpha: 1, duration: 300, ease: "Back.easeOut" });
    this.questionCard = card;
  }

  // ══════════════════════════════════════════════════════════════
  // OPTION BUBBLES (predict rounds)
  // ══════════════════════════════════════════════════════════════

  showOptionBubbles(options, onSelect) {
    const shuffled = Phaser.Utils.Array.Shuffle(options.slice());
    const style = { font: "bold 16px Courier New", color: HEX_CYAN };
    const widths = shuffled.map((o) => {
      const t = this.add.text(0, 0, String(o.value), style);
      const w = Math.max(t.width + 30, 56);
      t.destroy();
      return w;
    });
    const totalW = widths.reduce((a, b) => a + b, 0) + (shuffled.length - 1) * 14;
    let bx = 640 - totalW / 2;

    shuffled.forEach((opt, i) => {
      const w = widths[i], h = 38;
      const c = this.add.container(bx + w / 2, 580).setDepth(20);
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
      const txt = this.add.text(0, 0, String(opt.value), style).setOrigin(0.5);
      c.add([g, txt]);
      c.setSize(w, h);
      c.setData("value", opt.value);
      c.setData("draw", draw);
      c.setInteractive({ useHandCursor: true });
      const float = this.tweens.add({
        targets: c, y: "+=3", duration: 2300, ease: "Sine.easeInOut", yoyo: true, repeat: -1, delay: i * 150,
      });
      c.on("pointerover", () => { if (!this.inputLocked) { draw(0xffffff); this.tweens.add({ targets: c, scale: 1.08, duration: 100 }); } });
      c.on("pointerout", () => { draw(C_CYAN); this.tweens.add({ targets: c, scale: 1, duration: 100 }); });
      c.on("pointerdown", () => {
        if (this.inputLocked) return;
        this.inputLocked = true;
        float.stop();
        this.optionBubbles.forEach((b) => b.disableInteractive());
        onSelect(opt, c, draw);
      });
      this.optionBubbles.push(c);
    });
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE A/B — PREDICT
  // ══════════════════════════════════════════════════════════════

  setupPredict(cfg) {
    this.showOptionBubbles(cfg.options, async (opt, bubble, draw) => {
      const correct = opt.value === cfg.correct;
      this.logAttempt(cfg, correct, opt.value, opt.tag);
      if (correct) {
        draw(C_GREEN);
        this.tweens.add({
          targets: bubble, x: COUNTER_X, y: COUNTER_Y, scale: 0.6, alpha: 0, duration: 400, ease: "Cubic.easeIn",
        });
      } else {
        draw(C_RED);
        this.tweens.add({ targets: bubble, x: bubble.x + 6, duration: 45, yoyo: true, repeat: 5 });
      }
      await this.runScanAnimation();
      if (!this._alive) return;
      if (!correct) {
        const correctBubble = this.optionBubbles.find((b) => b.getData("value") === cfg.correct);
        if (correctBubble) correctBubble.getData("draw")(C_GREEN);
      }
      if (correct) this.onCorrectAnswer(cfg);
      else this.onIncorrectAnswer(cfg, opt.tag);
    });
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE C — JUDGE
  // ══════════════════════════════════════════════════════════════

  showJudgmentButtons(onSelect) {
    const mk = (x, label, color) => {
      const c = this.add.container(x, 580).setDepth(20);
      const g = this.add.graphics();
      const draw = (fillA) => {
        g.clear();
        g.fillStyle(color, fillA);
        g.fillRoundedRect(-85, -26, 170, 52, 12);
        g.lineStyle(2, color, 1);
        g.strokeRoundedRect(-85, -26, 170, 52, 12);
      };
      draw(0);
      const t = this.add.text(0, 0, label, { font: "bold 15px Arial", color: "#" + color.toString(16).padStart(6, "0") }).setOrigin(0.5);
      c.add([g, t]);
      c.setSize(170, 52);
      c.setInteractive({ useHandCursor: true });
      c.on("pointerover", () => { if (!this.inputLocked) { draw(0.08); c.setScale(1.03); } });
      c.on("pointerout", () => { draw(0); c.setScale(1); });
      c.on("pointerdown", () => {
        if (this.inputLocked) return;
        this.inputLocked = true;
        onSelect(label.includes("VALID") && !label.includes("IN") ? "valid" : "invalid", c, draw);
      });
      this.optionBubbles.push(c);
      return { c, draw };
    };
    mk(320, "✓ VALID", C_GREEN);
    mk(720, "✗ INVALID", C_RED);
  }

  _parseFirstStringLiteral(snippet) {
    const m = snippet.match(/"([^"]*)"/);
    return m ? m[1] : "";
  }

  setupJudge(cfg) {
    this.showJudgmentButtons(async (choice, btn, draw) => {
      const correct = choice === cfg.correct;
      this.logAttempt(cfg, correct, choice, correct ? null : cfg.wrongTag);
      draw(correct ? 0.15 : 0.05);
      if (!correct) this.tweens.add({ targets: btn, x: btn.x + 6, duration: 45, yoyo: true, repeat: 5 });

      if (cfg.round === 9) {
        // array .length property contrast — no character tiles to scan
        this.resetCounter();
        this.counterText.setText("data.length").setColor(HEX_AMBER).setFontSize(13);
        await this.delay(200);
        this.counterText.setFontSize(34).setText(String(cfg.resultValue)).setColor(HEX_CYAN);
        this.flashCounter(HEX_GREEN);
        this.showComparisonCard();
        await this.delay(600);
      } else if (cfg.correct === "valid") {
        const str = this._parseFirstStringLiteral(cfg.snippet);
        this.buildTileRow(str);
        await this.runScanAnimation();
      } else {
        // invalid snippet (missing parentheses) — show compile error, explain, then scan the FIXED version
        this.showCompileErrorStamp();
        await this.delay(300);
        if (!this._alive) return;
        const anno = this.add.text(640, 62, cfg.explanation, {
          font: "bold 12px Arial", color: HEX_RED, wordWrap: { width: 560 },
        }).setOrigin(0.5).setDepth(60).setAlpha(0);
        this.roundElements.push(anno);
        this.tweens.add({ targets: anno, alpha: 1, duration: 250 });
        if (cfg.fix) {
          const fixT = this.add.text(640, 470, `Fix: ${cfg.fix}`, {
            font: "bold 14px Courier New", color: HEX_MAGENTA,
          }).setOrigin(0.5).setDepth(20).setAlpha(0);
          this.roundElements.push(fixT);
          this.tweens.add({ targets: fixT, alpha: 1, duration: 250, delay: 200 });
          this.tweens.add({ targets: fixT, scale: 1.15, duration: 300, delay: 500, yoyo: true, repeat: 1 });
        }
        await this.delay(700);
        if (!this._alive) return;
        const str = this._parseFirstStringLiteral(cfg.snippet);
        this.buildTileRow(str);
        await this.runScanAnimation();
      }
      if (!this._alive) return;
      if (correct) this.onCorrectAnswer(cfg);
      else this.onIncorrectAnswer(cfg, cfg.wrongTag);
    });
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE D — FEED THE SCANNER
  // ══════════════════════════════════════════════════════════════

  createSpecimenPool(pool) {
    const style = { font: "bold 15px Courier New", color: HEX_CYAN };
    const widths = pool.map((item) => {
      const label = item.label || `"${item.str}"`;
      const t = this.add.text(0, 0, label, style);
      const w = Math.max(t.width + 28, 60);
      t.destroy();
      return w;
    });
    const totalW = widths.reduce((a, b) => a + b, 0) + (pool.length - 1) * 14;
    let bx = 640 - totalW / 2;

    pool.forEach((item, i) => {
      const w = widths[i], h = 40;
      const home = { x: bx + w / 2, y: 610 };
      bx += w + 14;
      const label = item.label || `"${item.str}"`;
      const c = this.add.container(home.x, home.y).setDepth(22);
      const g = this.add.graphics();
      g.fillStyle(0x1a1a2e, 1);
      g.fillRoundedRect(-w / 2, -h / 2, w, h, 20);
      g.lineStyle(1, C_CYAN, 1);
      g.strokeRoundedRect(-w / 2, -h / 2, w, h, 20);
      const txt = this.add.text(0, 0, label, style).setOrigin(0.5);
      c.add([g, txt]);
      c.setSize(w, h);
      c.setInteractive({ useHandCursor: true, draggable: true });
      c.setData("l25drag", true);
      c.setData("item", item);
      c.setData("home", home);
      this.capsules.push({ container: c, item, home });
    });
  }

  setupDragEvents() {
    this.input.on("dragstart", (pointer, obj) => {
      if (!obj.getData("l25drag")) return;
      obj.setDepth(40);
      this.tweens.add({ targets: obj, scale: 1.08, alpha: 0.85, duration: 100 });
    });
    this.input.on("drag", (pointer, obj, dragX, dragY) => {
      if (!obj.getData("l25drag")) return;
      obj.x = dragX;
      obj.y = dragY;
      const over = this._pointInChamber(dragX, dragY);
      if (over !== this._dragOverChamber) {
        this._dragOverChamber = over;
        this._drawChamberDrop(over);
      }
    });
    this.input.on("dragend", (pointer, obj) => {
      if (!obj.getData("l25drag")) return;
      this._finishCapsuleDrag(obj);
    });
  }

  _pointInChamber(x, y) {
    return x >= CHAMBER_X - CHAMBER_W / 2 && x <= CHAMBER_X + CHAMBER_W / 2 &&
      y >= CHAMBER_Y - CHAMBER_H / 2 && y <= CHAMBER_Y + CHAMBER_H / 2;
  }

  _drawChamberDrop(active) {
    this.chamberDropTarget.clear();
    this.chamberDropTarget.fillStyle(0x0b0f16, 1);
    this.chamberDropTarget.fillRoundedRect(CHAMBER_X - CHAMBER_W / 2, CHAMBER_Y - CHAMBER_H / 2, CHAMBER_W, CHAMBER_H, 14);
    if (active) {
      this.chamberDropTarget.lineStyle(2, C_AMBER, 1);
      this._dashedRectOutline(this.chamberDropTarget, CHAMBER_X - CHAMBER_W / 2, CHAMBER_Y - CHAMBER_H / 2, CHAMBER_W, CHAMBER_H, 8, 5);
    } else {
      this.chamberDropTarget.lineStyle(2, 0x21262d, 1);
      this.chamberDropTarget.strokeRoundedRect(CHAMBER_X - CHAMBER_W / 2, CHAMBER_Y - CHAMBER_H / 2, CHAMBER_W, CHAMBER_H, 14);
    }
  }

  _finishCapsuleDrag(obj) {
    obj.setDepth(22);
    const over = this._pointInChamber(obj.x, obj.y);
    this._dragOverChamber = false;
    this._drawChamberDrop(false);
    const home = obj.getData("home");
    if (over) {
      this.onCapsuleDroppedInChamber(obj);
    } else {
      this.tweens.add({ targets: obj, x: home.x, y: home.y, scale: 1, alpha: 1, duration: 250, ease: "Cubic.easeOut" });
    }
  }

  setupFeed(cfg) {
    this.createSpecimenPool(cfg.pool);
  }

  async onCapsuleDroppedInChamber(obj) {
    if (this.inputLocked) {
      const home = obj.getData("home");
      this.tweens.add({ targets: obj, x: home.x, y: home.y, scale: 1, alpha: 1, duration: 250 });
      return;
    }
    this.inputLocked = true;
    const cfg = ROUNDS[this.currentRound];
    const item = obj.getData("item");
    obj.setVisible(false).disableInteractive();
    this.tweens.add({ targets: obj, alpha: 1, scale: 1 }); // reset transient drag styling for potential restore

    this.emptyPlaceholder.setVisible(false);
    await this.tutorialDropTiles(item.str);
    if (!this._alive) return;
    await this.runScanAnimation();
    if (!this._alive) return;

    const correct = this.counterValue === cfg.target;
    this.logAttempt(cfg, correct, item.str, correct ? null : item.tag);

    if (correct) {
      this.tiles.forEach((t, i) => this.setTileState(i, "correct"));
      const banner = this.add.text(CHAMBER_X, CHAMBER_Y - CHAMBER_H / 2 - 20, "✓ SPECIMEN ACCEPTED", {
        font: "bold 16px Arial", color: HEX_GREEN,
      }).setOrigin(0.5).setDepth(20).setScale(0);
      this.roundElements.push(banner);
      this.tweens.add({ targets: banner, scale: 1, duration: 250, ease: "Back.easeOut" });
      this.createConfetti(COUNTER_X, COUNTER_Y);
      this.onCorrectAnswer(cfg);
    } else {
      this.tiles.forEach((t, i) => this.setTileState(i, "error"));
      const banner = this.add.text(CHAMBER_X, CHAMBER_Y - CHAMBER_H / 2 - 20, "✗ WRONG SPECIMEN", {
        font: "bold 16px Arial", color: HEX_RED,
      }).setOrigin(0.5).setDepth(20).setScale(0);
      this.tweens.add({ targets: banner, scale: 1, duration: 200, ease: "Back.easeOut" });
      await this.delay(500);
      if (!this._alive) return;
      banner.destroy();
      this.clearTileRow();
      this.emptyPlaceholder.setVisible(true);
      this.setCounterTarget(`NEED: ${cfg.target}`);
      // restore capsule to pool
      obj.setVisible(true);
      obj.setInteractive({ useHandCursor: true, draggable: true });
      const home = obj.getData("home");
      obj.setPosition(home.x, home.y).setScale(1).setAlpha(1);

      this.feedMissCount++;
      this.updateCombo(false);
      if (this.feedMissCount >= 2) {
        const dead = this.loseLife();
        if (dead) { this.time.delayedCall(500, () => this.gameOver()); return; }
      }
      await this.showBitFeedback(MISCONCEPTION_FEEDBACK[item.tag] || "Recount carefully and try another specimen.");
      if (!this._alive) return;
      this.inputLocked = false;
    }
  }

  // ══════════════════════════════════════════════════════════════
  // EVALUATION
  // ══════════════════════════════════════════════════════════════

  logAttempt(cfg, correct, selected, tag) {
    this.roundAttempts++;
    this.attemptLog.push({
      round: cfg.round, type: cfg.type, concept: cfg.concept, correct,
      selectedAnswer: selected, misconceptionTag: tag || null,
      timeMs: Math.round(this.time.now - this.roundStartTime),
      attemptNumber: this.roundAttempts,
    });
  }

  onCorrectAnswer(cfg) {
    if (this.gameEnded) return;
    this.inputLocked = true;
    const firstTry = this.roundAttempts === 1;
    if (firstTry) this.correctFirstTry++;
    this.updateCombo(true);
    const multiplier = Math.min(this.combo, 5);
    const timeMs = this.time.now - this.roundStartTime;
    this.totalTime += timeMs;
    let points = 100 * multiplier;
    if (timeMs <= 6000) { points += 25; this.createFloatingText(COUNTER_X, COUNTER_Y - 60, "+25 QUICK!", HEX_AMBER, "bold 13px Arial"); }
    this.updateScore(points);

    const t = this.add.text(640, 200, "✓ CORRECT", {
      font: "bold 28px Arial", color: HEX_GREEN,
    }).setOrigin(0.5).setScale(0).setDepth(70);
    this.tweens.add({
      targets: t, scale: 1.15, duration: 200, ease: "Back.easeOut",
      onComplete: () => this.tweens.add({ targets: t, scale: 1, duration: 100 }),
    });
    this.time.delayedCall(900, () => {
      this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() });
    });

    this.time.delayedCall(1300, () => {
      if (!this._alive || this.gameEnded) return;
      if (this.currentRound + 1 >= ROUNDS.length) this.levelComplete();
      else this.startRound(this.currentRound + 1);
    });
  }

  async onIncorrectAnswer(cfg, tag) {
    if (this.gameEnded) return;
    this.inputLocked = true;
    this.updateCombo(false);
    this.screenShake(0.004, 180);
    const dead = this.loseLife();
    if (dead) {
      this.time.delayedCall(600, () => this.gameOver());
      return;
    }
    await this.showBitFeedback(MISCONCEPTION_FEEDBACK[tag] || "Recount carefully — every character matters!");
    if (!this._alive || this.gameEnded) return;
    this.time.delayedCall(300, () => {
      if (!this._alive || this.gameEnded) return;
      if (this.currentRound + 1 >= ROUNDS.length) this.levelComplete();
      else this.startRound(this.currentRound + 1);
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
    } else {
      if (this.combo >= 2) this.comboShatterEffect();
      this.combo = 0;
      this.comboText.setText("×1");
    }
  }

  comboShatterEffect() {
    const { x, y } = this.comboText;
    const p = this.add.particles(x + 10, y + 8, "l25_dot", {
      speed: { min: 40, max: 140 }, angle: { min: 0, max: 360 },
      scale: { start: 0.5, end: 0 }, lifespan: 400, tint: 0xffd740, emitting: false,
    }).setDepth(55);
    p.explode(12);
    this.time.delayedCall(600, () => p.destroy());
  }

  loseLife() {
    this.lives = Math.max(0, this.lives - 1);
    const icon = this.lifeIcons[this.lives];
    if (icon) this.tweens.add({ targets: icon, alpha: 0.12, duration: 400 });
    return this.lives <= 0;
  }

  // ══════════════════════════════════════════════════════════════
  // UTILITIES
  // ══════════════════════════════════════════════════════════════

  createFloatingText(x, y, text, colorHex, font = "bold 16px Arial") {
    const t = this.add.text(x, y, text, { font, color: colorHex }).setOrigin(0.5).setDepth(65);
    this.tweens.add({
      targets: t, y: y - 34, alpha: 0, duration: 900, ease: "Cubic.easeOut",
      onComplete: () => t.destroy(),
    });
    return t;
  }

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

  createConfetti(x, y, count = 30) {
    const p = this.add.particles(x, y, "l25_dot", {
      speed: { min: 80, max: 260 }, angle: { min: 0, max: 360 },
      scale: { start: 0.9, end: 0 }, lifespan: 500,
      tint: [C_CYAN, C_AMBER, C_GREEN, C_MAGENTA, 0xffffff], emitting: false,
    }).setDepth(65);
    p.explode(count);
    this.time.delayedCall(900, () => p.destroy());
  }

  screenShake(intensity = 0.004, duration = 200) {
    this.cameras.main.shake(duration, intensity);
  }

  // ══════════════════════════════════════════════════════════════
  // END STATES
  // ══════════════════════════════════════════════════════════════

  async celebrationSweep() {
    for (let s = 0; s < 3; s++) {
      if (!this._alive) return;
      const first = this.tiles[0], last = this.tiles[this.tiles.length - 1];
      if (!first || !last) break;
      this.beam.setVisible(true).setAlpha(1).setPosition(first.x - first.tw / 2, CHAMBER_Y);
      await new Promise((res) => this.tweens.add({ targets: this.beam, x: last.x + last.tw / 2, duration: 220, ease: "Linear", onComplete: () => res() }));
      if (!this._alive) return;
      await new Promise((res) => this.tweens.add({ targets: this.beam, x: first.x - first.tw / 2, duration: 220, ease: "Linear", onComplete: () => res() }));
    }
    if (!this._alive) return;
    this.beam.setVisible(false);
    this.tiles.forEach((t, i) => this.setTileState(i, "correct"));
    this.createConfetti(COUNTER_X, COUNTER_Y);
    await this.delay(400);
  }

  gameOver() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearRound();
    this.hideBubble();

    this.tiles.forEach((t, i) => {
      if (t.pulse) t.pulse.stop();
      this._drawTileBody(t.body, t.tw, 0x1a1a2a, 2);
      this.tweens.add({ targets: t.charText, alpha: 0.2, duration: 400 });
    });
    let flick = 0;
    const flickEvent = this.time.addEvent({
      delay: 150, repeat: 7,
      callback: () => {
        flick++;
        this.beam.setVisible(true).setAlpha(flick % 2 === 0 ? 0.5 : 0.2);
        this.beam.list.forEach((c) => { if (c.fillColor !== undefined) c.setFillStyle(C_RED, c.fillAlpha); });
      },
    });
    this.time.delayedCall(1300, () => { this.beam.setVisible(false); });

    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
    this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });

    const title = this.add.text(640, 240, "SCANNER OFFLINE", {
      font: "bold 40px Arial", color: HEX_RED,
    }).setOrigin(0.5).setScale(0).setDepth(91);
    this.tweens.add({
      targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut",
      onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }),
    });

    this.add.text(640, 310, `Score: ${this.score}`, { font: "20px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
    this.add.text(640, 350, `Rounds Completed: ${this.currentRound} / ${ROUNDS.length}`, {
      font: "16px Arial", color: HEX_GRAY,
    }).setOrigin(0.5).setDepth(91);

    this._makeButton(640, 420, "RETRY", 180, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearRound();
    this.hideBubble();

    const accuracy = this.correctFirstTry / ROUNDS.length;
    try { GameManager.completeLevel(24, Math.round(accuracy * 100)); } catch (_) {}
    try { BadgeSystem.unlock("length_schema"); } catch (_) {}
    try {
      localStorage.setItem("level25_results", JSON.stringify({
        level: 25, concept: "string_length", phase: "accretion",
        score: this.score, accuracy,
        avgTime: Math.round(this.totalTime / ROUNDS.length),
        comboMax: this.maxCombo, stars: this._starRating(accuracy),
        livesRemaining: this.lives, attempts: this.attemptLog,
        timestamp: Date.now(),
      }));
    } catch (_) {}

    this.celebrationSweep().then(() => {
      if (this._alive) this.showScoreTally(accuracy);
    });
  }

  _starRating(accuracy) {
    if (accuracy >= 0.9) return 3;
    if (accuracy >= 0.7) return 2;
    return 1;
  }

  showScoreTally(accuracy) {
    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
    this.tweens.add({ targets: ov, fillAlpha: 0.85, duration: 500 });

    const panel = this.add.graphics().setDepth(90);
    panel.fillStyle(0x12121f, 1);
    panel.fillRoundedRect(360, 150, 560, 420, 16);
    panel.lineStyle(2, C_CYAN, 1);
    panel.strokeRoundedRect(360, 150, 560, 420, 16);

    const title = this.add.text(640, 200, "SCAN COMPLETE", {
      font: "bold 36px Arial", color: HEX_GREEN,
    }).setOrigin(0.5).setDepth(91).setScale(0);
    this.tweens.add({ targets: title, scale: 1, duration: 350, ease: "Back.easeOut" });

    const avgTime = (this.totalTime / ROUNDS.length / 1000).toFixed(1);
    const lines = [
      `ACCURACY: ${Math.round(accuracy * 100)}%`,
      `BEST COMBO: ×${this.maxCombo}`,
      `AVG TIME: ${avgTime}s`,
    ];
    lines.forEach((s, i) => {
      const t = this.add.text(500, 260 + i * 30, s, { font: "14px Arial", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 250, delay: 300 + i * 150 });
    });
    const totalText = this.add.text(500, 260 + 3 * 30, "TOTAL: 0", {
      font: "bold 24px Arial", color: HEX_AMBER,
    }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: totalText, alpha: 1, duration: 250, delay: 900 });
    const counter = { v: 0 };
    this.tweens.add({
      targets: counter, v: this.score, duration: 1000, delay: 900,
      onUpdate: () => totalText.setText(`TOTAL: ${Math.round(counter.v)}`),
    });

    const stars = this._starRating(accuracy);
    for (let i = 0; i < 3; i++) {
      const earned = i < stars;
      const s = this.add.text(640 + (i - 1) * 60, 385, "★", {
        font: "40px Arial", color: earned ? HEX_AMBER : "#2a3040",
      }).setOrigin(0.5).setDepth(91).setScale(0);
      this.tweens.add({ targets: s, scale: 1, duration: 250, delay: 1500 + i * 200, ease: earned ? "Back.easeOut" : "Cubic.easeOut" });
    }

    const badge = this.add.container(640, 470).setDepth(91).setAlpha(0);
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillCircle(0, 0, 30);
    bg.lineStyle(2, C_AMBER, 1);
    bg.strokeCircle(0, 0, 30);
    bg.fillStyle(C_AMBER, 1);
    bg.fillRect(-14, 2, 6, 6); bg.fillRect(-4, 2, 6, 6); bg.fillRect(6, 2, 6, 6);
    bg.lineStyle(2, C_AMBER, 1);
    bg.strokeCircle(-2, -8, 6);
    bg.lineBetween(2, -4, 8, 2);
    badge.add(bg);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 2100 });
    const badgeLbl = this.add.text(640, 508, "length() SCHEMA ACQUIRED", {
      font: "bold 13px Arial", color: HEX_AMBER,
    }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: badgeLbl, alpha: 1, duration: 300, delay: 2200 });

    this._makeButton(500, 540, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(760, 540, "NEXT: charAt() →", 220, 44, { fill: 0x00733a, stroke: C_GREEN, textColor: "#ffffff" }, () => {
      if (this.scene.get("Level26Scene")) this.scene.start("Level26Scene");
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
