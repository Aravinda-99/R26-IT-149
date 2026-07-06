/**
 * Level 28 — "The Retrieval Claw" (String Methods: Accretion Phase)
 * ====================================================================
 * Teaches Java's charAt(index) through a robotic-claw extraction bay.
 * Character tiles sit above ALWAYS-VISIBLE 0-based index plates (a
 * deliberate visual echo of the Level 22 Memory Vault); an overhead claw
 * travels along a rail to a commanded index, descends, and physically
 * extracts the character into a Result Display that shows it wrapped in
 * single quotes with a `char` type tag — hammering home char vs String.
 *
 * Every round resolves with a REAL claw action: a true extraction, a
 * boundary crash (StringIndexOutOfBoundsException), or — for the bracket-
 * syntax round — the claw refusing to move while a compile-error stamp
 * lands on the monitor. The claw never lies about what's actually there.
 *
 * 12 rounds across 4 challenge types:
 *  A. Extraction Prediction (1-3)  — predict charAt(i)
 *  B. Address Lookup        (4-6)  — reverse: find the index of a char
 *  C. Safety & Syntax Judge  (7-9)  — safe/crash/compile-error judgment
 *  D. Claw Command          (10-12) — drag index capsules, EXECUTE for real
 */

import Phaser from "phaser";
import { GameManager } from "../../../GameManager.js";
import { BadgeSystem } from "../../../BadgeSystem.js";

const W = 1280, H = 720;

const C_CYAN = 0x00e5ff, C_AMBER = 0xffd740, C_GREEN = 0x00e676;
const C_RED = 0xf44336, C_GRAY = 0x78909c, C_MAGENTA = 0xff4081;
const C_PURPLE = 0x8c7ae6;
const HEX_CYAN = "#00e5ff", HEX_AMBER = "#ffd740", HEX_GREEN = "#00e676";
const HEX_RED = "#f44336", HEX_GRAY = "#78909c", HEX_MAGENTA = "#ff4081";
const HEX_PURPLE = "#8c7ae6";

const RAIL_Y = 165, RAIL_X_START = 168, RAIL_X_END = 1112;
const TILE_Y = 330, TILE_H = 64;
const RESULT_CX = 1205, RESULT_CY = 355;

const TUTORIAL_KEY = "level28_tutorial_done";

// ─────────────────────────────────────────────────────────────────
// Round configuration
// ─────────────────────────────────────────────────────────────────
const ROUNDS = [
  { round: 1, type: "predict", varName: "s", str: "robot",
    question: "What will s.charAt(2) return?", index: 2, correct: "'b'",
    options: [
      { value: "'b'", tag: null },
      { value: "'o'", tag: "one_based_indexing" },
      { value: "'r'", tag: "index_confusion" },
      { value: "'t'", tag: "counted_from_end" },
    ], concept: "basic_extraction" },

  { round: 2, type: "predict", varName: "word", str: "java",
    question: "What will word.charAt(0) return?", index: 0, correct: "'j'",
    options: [
      { value: "'j'", tag: null },
      { value: "'a'", tag: "one_based_indexing" },
      { value: "Error", tag: "zero_index_invalid_belief" },
      { value: "'v'", tag: "index_confusion" },
    ], concept: "zero_index" },

  { round: 3, type: "predict", varName: "s", str: "claw",
    question: "What will s.charAt(3) return?", index: 3, correct: "'w'",
    options: [
      { value: "'w'", tag: null },
      { value: '"w"', tag: "char_vs_string_type" },
      { value: "'a'", tag: "one_based_indexing" },
      { value: "Error", tag: "length_as_valid_index" },
    ], concept: "char_type_discrimination" },

  { round: 4, type: "lookup", varName: "s", str: "signal",
    question: "At which index does 'g' live?", targetChar: "g", correct: 2,
    options: [
      { value: 2, tag: null },
      { value: 3, tag: "one_based_indexing" },
      { value: 1, tag: "index_confusion" },
      { value: 4, tag: "counted_from_end" },
    ], concept: "reverse_lookup" },

  { round: 5, type: "lookup", varName: "msg", str: "hi bit",
    question: "At which index does 'b' live?", targetChar: "b", correct: 3,
    options: [
      { value: 3, tag: null },
      { value: 2, tag: "spaces_skipped_in_index" },
      { value: 4, tag: "one_based_indexing" },
      { value: 1, tag: "index_confusion" },
    ], concept: "space_has_index" },

  { round: 6, type: "lookup", varName: "s", str: "level",
    question: "At which index does the FIRST 'l' live?", targetChar: "l", correct: 0,
    options: [
      { value: 0, tag: null },
      { value: 1, tag: "one_based_indexing" },
      { value: 4, tag: "found_last_occurrence" },
      { value: 2, tag: "index_confusion" },
    ], concept: "duplicates_first_occurrence" },

  { round: 7, type: "judge", varName: "s", str: "scan",
    snippet: "char c = s.charAt(4);", correct: "crash", crashType: "runtime", crashIndex: 4,
    explanation: '"scan" has length 4 — valid indices are 0 to 3. Index 4 is past the end!',
    wrongTag: "length_as_valid_index", concept: "out_of_bounds" },

  { round: 8, type: "judge", varName: "s", str: "scan",
    snippet: "char c = s.charAt(s.length() - 1);", correct: "safe", resolvedIndex: 3,
    wrongTag: "safe_pattern_doubt", concept: "last_index_pattern" },

  { round: 9, type: "judge", varName: "s", str: "scan",
    snippet: "char c = s[0];", correct: "crash", crashType: "compile",
    explanation: "Square brackets work on ARRAYS only. Strings need s.charAt(0). Java is strict about this!",
    wrongTag: "bracket_notation_on_string", concept: "bracket_syntax_contrast" },

  { round: 10, type: "command", varName: "s", str: "coder",
    mission: "Command the claw to extract 'd'.", slots: 1,
    capsules: [
      { label: "0", value: 0 }, { label: "1", value: 1 },
      { label: "2", value: 2, correct: true }, { label: "3", value: 3 }, { label: "4", value: 4 },
    ], wrongTagDefault: "index_confusion", concept: "command_basic" },

  { round: 11, type: "command", varName: "s", str: "signal",
    mission: "Extract the LAST character — and don't crash the claw!", slots: 1,
    capsules: [
      { label: "s.length() - 1", value: "len-1", correct: true },
      { label: "s.length()", value: "len", tag: "length_as_valid_index" },
      { label: "5", value: 5, correct: true },
      { label: "6", value: 6, tag: "length_as_valid_index" },
      { label: "4", value: 4, tag: "off_by_one_last_position" },
    ], concept: "last_char_command" },

  { round: 12, type: "command", varName: "s", str: "computer",
    mission: 'Spell "cut" — extract 3 characters in order!', slots: 3,
    capsules: [
      { label: "0", value: 0 }, { label: "1", value: 1 }, { label: "2", value: 2 },
      { label: "4", value: 4 }, { label: "5", value: 5 }, { label: "6", value: 6 }, { label: "7", value: 7 },
    ], answer: [0, 4, 5], concept: "multi_extraction_spelling" },
];

const MISCONCEPTION_FEEDBACK = {
  one_based_indexing: "The plates start at ZERO, Operator! charAt(2) is the THIRD character. Read the amber plates, not your fingers.",
  length_as_valid_index: "length() counts the characters — but addresses stop at length() - 1! Commanding charAt(length()) sends the claw off the rails.",
  bracket_notation_on_string: "Brackets [ ] belong to the Vault (arrays)! Strings guard their characters — only charAt() gets them out.",
  char_vs_string_type: "So close — right character, wrong wrapper! charAt() returns a char in SINGLE quotes: 'w'. Double quotes make a String.",
  spaces_skipped_in_index: "The space holds a real address! Skip it and every character after shifts by one. Count the ␣ plate too.",
  zero_index_invalid_belief: "Index 0 is the most important address in programming — it's where everything begins. charAt(0) = first character, always.",
  found_last_occurrence: "Good eyes — but the question asked for the FIRST one. When characters repeat, every copy has its own address.",
  off_by_one_last_position: "One plate short! Count: length 6 means indices 0-5. The last character waits at 5.",
  index_confusion: "That's not the right address at all — recount the plates carefully from 0 up to the target.",
  counted_from_end: "You counted from the END, not the start! Indices always count from index 0 on the LEFT.",
  safe_pattern_doubt: "s.charAt(s.length() - 1) is completely safe — length()-1 is ALWAYS a valid index, for any non-empty String.",
};

export class Level28Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level28Scene" });
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
    this.roundElements = [];
    this.roundStartTime = 0;
    this.roundAttempts = 0;
    this.commandMissCount = 0;
    this.tiles = [];
    this.optionBubbles = [];
    this.capsules = [];
    this.consoleSlots = [];
    this.inputLocked = true;
    this.gameEnded = false;
    this._alive = true;
    this._bubble = null;
    this._dragOverSlotKey = null;
    this._clawState = { trolleyX: RAIL_X_START, cableLength: 40 };
  }

  preload() {}

  create() {
    this._alive = true;
    this.events.once("shutdown", () => { this._alive = false; });

    const cam = this.cameras.main;
    const zoom = Math.min(this.scale.width / W, this.scale.height / H);
    cam.setZoom(zoom);
    cam.centerOn(W / 2, H / 2);
    cam.setBackgroundColor("#0a0812");

    try { GameManager.incrementAttempt(27); } catch (_) {}

    this.createParticleTexture();
    this.createBackground();
    this.createBayFloor();
    this.createGantry();
    this.createMachinery();
    this.createWarningBeacon();
    this.createParticles();
    this.createRail();
    this.createClaw();
    this.createResultDisplay();
    this.createHUD();
    this.createBit();
    this.setupDragEvents();

    cam.fadeIn(700, 4, 4, 9);
    this.checkTutorial();
  }

  update(time, delta) {
    this.updateParticles(time, delta);
    this.updateClawVisual(time);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // SETUP — background & environment
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l28_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l28_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x0a0812).setDepth(0);
  }

  createBayFloor() {
    const g = this.add.graphics().setDepth(1);
    const top = 605, panelH = 23;
    for (let i = 0; i < 5; i++) {
      const y = top + i * panelH;
      g.fillStyle(i % 2 === 0 ? 0x120f1c : 0x0d0b16, 1);
      g.fillRect(0, y, W, panelH);
      g.lineStyle(1, 0x241f36, 0.25);
      g.lineBetween(0, y, W, y);
    }
    [180, 960].forEach((x) => {
      g.lineStyle(1, C_AMBER, 0.04);
      this._dashedRectOutline(g, x - 70, 550, 140, 60, 6, 5);
    });
  }

  createGantry() {
    const g = this.add.graphics().setDepth(3);
    [150, 1130].forEach((x) => {
      g.fillStyle(0x151122, 1);
      g.lineStyle(1, 0x241f36, 1);
      g.fillRect(x - 9, 70, 18, 190);
      g.strokeRect(x - 9, 70, 18, 190);
      g.lineStyle(1, 0x241f36, 0.4);
      for (let y = 80; y < 250; y += 40) {
        g.lineBetween(x - 9, y, x + 9, y + 30);
        g.lineBetween(x + 9, y, x - 9, y + 30);
      }
    });
  }

  createMachinery() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x0d0b16, 0.4);
    g.lineStyle(1, 0x241f36, 0.06);
    g.fillRect(20, 320, 100, 230);
    g.strokeRect(20, 320, 100, 230);
    for (let i = 0; i < 4; i++) { g.fillStyle(C_GREEN, 0.05); g.fillCircle(70, 350 + i * 45, 2); }
    g.fillStyle(0x0d0b16, 0.4);
    g.lineStyle(1, 0x241f36, 0.06);
    g.fillRect(1160, 320, 100, 230);
    g.strokeRect(1160, 320, 100, 230);
    for (let i = 0; i < 4; i++) { g.fillStyle(C_AMBER, 0.05); g.fillCircle(1210, 350 + i * 45, 2); }
  }

  createWarningBeacon() {
    const g = this.add.graphics().setDepth(40);
    g.fillStyle(0x1a0a0a, 1);
    g.fillRect(1225, 100, 20, 6);
    g.fillStyle(C_RED, 0.08);
    g.slice(1235, 95, 10, Math.PI, 0, false);
    g.fillPath();
    this.beaconGraphic = g;
    this.beaconWedge = this.add.graphics().setDepth(41).setAlpha(0);
  }

  activateBeacon() {
    this.beaconWedge.setAlpha(1);
    let angle = 0;
    const ev = this.time.addEvent({
      delay: 30, repeat: 49,
      callback: () => {
        angle += 0.3;
        this.beaconWedge.clear();
        this.beaconWedge.fillStyle(C_RED, 0.3);
        this.beaconWedge.slice(1235, 95, 12, angle, angle + 0.8, false);
        this.beaconWedge.fillPath();
      },
      callbackScope: this,
    });
    this.time.delayedCall(1500, () => { ev.remove(); this.beaconWedge.setAlpha(0); });
  }

  createParticles() {
    this.dust = [];
    for (let i = 0; i < 10; i++) {
      const p = this.add.circle(Phaser.Math.Between(20, 1260), Phaser.Math.Between(0, 600), 1, 0xb388ff, Phaser.Math.FloatBetween(0.02, 0.06)).setDepth(2);
      this.dust.push(p);
    }
  }

  updateParticles(time, delta) {
    if (!this.dust) return;
    const step = 0.05 * (delta / 16.7);
    this.dust.forEach((p, i) => {
      p.y -= step;
      p.x += Math.sin(time * 0.0008 + i) * 0.04;
      if (p.y < 0) { p.y = 600; p.x = Phaser.Math.Between(20, 1260); }
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
    side(x, y, x + w, y);
    side(x + w, y, x + w, y + h);
    side(x + w, y + h, x, y + h);
    side(x, y + h, x, y);
  }

  // ══════════════════════════════════════════════════════════════
  // THE CLAW
  // ══════════════════════════════════════════════════════════════

  createRail() {
    const g = this.add.graphics().setDepth(4);
    g.fillStyle(0x241f36, 1);
    g.lineStyle(1, 0x2f2a45, 1);
    g.fillRoundedRect(RAIL_X_START, RAIL_Y - 4, RAIL_X_END - RAIL_X_START, 8, 4);
    g.strokeRoundedRect(RAIL_X_START, RAIL_Y - 4, RAIL_X_END - RAIL_X_START, 8, 4);
    g.lineStyle(2, 0x0a0812, 1);
    g.lineBetween(RAIL_X_START, RAIL_Y, RAIL_X_END, RAIL_Y);
    [RAIL_X_START - 6, RAIL_X_END - 6].forEach((x) => {
      g.fillStyle(0x151122, 1);
      g.lineStyle(1, C_AMBER, 0.3);
      g.fillRoundedRect(x, RAIL_Y - 10, 12, 20, 3);
      g.strokeRoundedRect(x, RAIL_Y - 10, 12, 20, 3);
    });
  }

  createClaw() {
    this.trolleyContainer = this.add.container(RAIL_X_START, RAIL_Y).setDepth(19);
    const body = this.add.graphics();
    body.fillStyle(0x1c1730, 1);
    body.lineStyle(2, 0x4a4468, 1);
    body.fillRoundedRect(-23, -11, 46, 22, 5);
    body.strokeRoundedRect(-23, -11, 46, 22, 5);
    body.fillStyle(0x0a0812, 1);
    body.lineStyle(1, 0x4a4468, 1);
    body.fillCircle(-14, 10, 4); body.strokeCircle(-14, 10, 4);
    body.fillCircle(14, 10, 4); body.strokeCircle(14, 10, 4);
    this.clawStatusLight = this.add.circle(0, -14, 3, C_GRAY);
    this.trolleyContainer.add([body, this.clawStatusLight]);

    this.cableGraphics = this.add.graphics().setDepth(18);

    this.clawHeadContainer = this.add.container(RAIL_X_START, RAIL_Y + 11 + this._clawState.cableLength).setDepth(19);
    const hub = this.add.circle(0, 0, 6, 0x1c1730).setStrokeStyle(2, C_PURPLE);
    this.pincerLeft = this.add.graphics();
    this.pincerRight = this.add.graphics();
    this.clawHeadContainer.add([this.pincerLeft, this.pincerRight, hub]);
    this._drawPincers(26);

    this.updateClawVisual(0);
  }

  _drawPincers(gap) {
    this.pincerLeft.clear();
    this.pincerRight.clear();
    this.pincerLeft.lineStyle(4, C_PURPLE, 1);
    this.pincerRight.lineStyle(4, C_PURPLE, 1);
    const half = gap / 2;
    this.pincerLeft.beginPath();
    this.pincerLeft.arc(-half - 8, 10, 16, Phaser.Math.DegToRad(-40), Phaser.Math.DegToRad(80), false);
    this.pincerLeft.strokePath();
    this.pincerRight.beginPath();
    this.pincerRight.arc(half + 8, 10, 16, Phaser.Math.DegToRad(100), Phaser.Math.DegToRad(220), false);
    this.pincerRight.strokePath();
  }

  clawGrip(closed) {
    this._drawPincers(closed ? 10 : 26);
  }

  updateClawVisual(time) {
    if (!this.trolleyContainer) return;
    this.trolleyContainer.x = this._clawState.trolleyX;
    const sway = Math.sin(time * 0.0026) * 2;
    this.clawHeadContainer.x = this._clawState.trolleyX + sway;
    this.clawHeadContainer.y = RAIL_Y + 11 + this._clawState.cableLength;
    this.cableGraphics.clear();
    this.cableGraphics.lineStyle(3, 0x4a4468, 1);
    this.cableGraphics.lineBetween(this._clawState.trolleyX, RAIL_Y + 11, this.clawHeadContainer.x, this.clawHeadContainer.y);
  }

  moveClawTo(targetX) {
    const dist = Math.abs(targetX - this._clawState.trolleyX);
    const duration = Math.min(1400, Math.max(200, (dist / 260) * 1000));
    return new Promise((res) => {
      this.tweens.add({ targets: this._clawState, trolleyX: targetX, duration, ease: "Sine.easeInOut", onComplete: () => res() });
    });
  }

  extendCable(toLength, duration = 350, ease = "Quad.easeIn") {
    return new Promise((res) => {
      this.tweens.add({ targets: this._clawState, cableLength: toLength, duration, ease, onComplete: () => res() });
    });
  }

  parkClaw() {
    this.clawStatusLight.setFillStyle(C_GRAY);
    this.clawGrip(false);
    return this.moveClawTo(RAIL_X_START);
  }

  // ══════════════════════════════════════════════════════════════
  // CHARACTER TILES + INDEX PLATES
  // ══════════════════════════════════════════════════════════════

  _charMeta(ch) {
    if (ch === " ") return { display: "␣", color: HEX_MAGENTA, isSpace: true };
    if (/[0-9]/.test(ch)) return { display: ch, color: HEX_AMBER, isSpace: false };
    if (/[a-zA-Z]/.test(ch)) return { display: ch, color: HEX_CYAN, isSpace: false };
    return { display: ch, color: "#ff9800", isSpace: false };
  }

  _tileWidth(n) {
    return n <= 12 ? 52 : Math.max(38, Math.floor((900 - (n - 1) * 6) / n));
  }

  getTileX(index) {
    const t = this.tiles[index];
    return t ? t.x : 640;
  }

  buildTileRow(str) {
    this.clearTileRow();
    const n = str.length;
    const tw = this._tileWidth(n);
    const totalW = n * tw + (n - 1) * 6;
    const startX = 640 - totalW / 2;
    this.tiles = str.split("").map((ch, i) => {
      const x = startX + i * (tw + 6) + tw / 2;
      return this.createTile(ch, i, x, TILE_Y, tw);
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
    container.add([glow, body, charText]);
    if (spaceLabel) container.add(spaceLabel);

    // index plate (always visible)
    const plateY = TILE_H / 2 + 20;
    const plateG = this.add.graphics();
    const bright = index === 0 ? 0.5 : 1;
    plateG.fillStyle(0x141019, 1);
    plateG.lineStyle(1, 0x3d2f1f, index === 0 ? 1 : 1);
    plateG.fillRoundedRect(-17, plateY - 10, 34, 20, 4);
    plateG.lineStyle(1, C_AMBER, index === 0 ? 0.5 : 0.25);
    plateG.strokeRoundedRect(-17, plateY - 10, 34, 20, 4);
    const plateText = this.add.text(0, plateY, String(index), { font: "bold 13px Courier New", color: HEX_AMBER }).setOrigin(0.5);
    container.add([plateG, plateText]);

    return { container, glow, body, charText, plateG, plateText, index, ch, tw, x, y, pulse: null, extracted: false };
  }

  _drawTileBody(g, tw, stroke, lw, dashed = false) {
    g.clear();
    g.fillStyle(0x0d1117, 1);
    g.fillRoundedRect(-tw / 2, -TILE_H / 2, tw, TILE_H, 6);
    g.lineStyle(lw, stroke, 1);
    if (dashed) this._dashedRectOutline(g, -tw / 2, -TILE_H / 2, tw, TILE_H, 5, 4);
    else g.strokeRoundedRect(-tw / 2, -TILE_H / 2, tw, TILE_H, 6);
  }

  setTileState(i, state) {
    const tile = this.tiles[i];
    if (!tile || !tile.container.active) return;
    if (tile.pulse) { tile.pulse.stop(); tile.pulse = null; }
    const map = { scanned: C_CYAN, correct: C_GREEN, error: C_RED, default: 0x2a3a4a };
    const color = map[state] || map.default;
    if (state === "default") { this._drawTileBody(tile.body, tile.tw, 0x2a3a4a, 2); tile.glow.setFillStyle(C_CYAN, 0); return; }
    this._drawTileBody(tile.body, tile.tw, color, 2);
    tile.glow.setFillStyle(color, 0.12);
    this.tweens.add({ targets: tile.glow, fillAlpha: 0, duration: 300 });
  }

  clearTileRow() {
    this.tiles.forEach((t) => { if (t.pulse) t.pulse.stop(); t.container.destroy(); });
    this.tiles = [];
  }

  // ══════════════════════════════════════════════════════════════
  // RESULT DISPLAY & LITERAL / MONITOR
  // ══════════════════════════════════════════════════════════════

  createResultDisplay() {
    const g = this.add.graphics().setDepth(14);
    g.fillStyle(0x0d0b16, 1);
    g.lineStyle(1, C_PURPLE, 1);
    g.fillRoundedRect(RESULT_CX - 55, RESULT_CY - 55, 110, 110, 10);
    g.strokeRoundedRect(RESULT_CX - 55, RESULT_CY - 55, 110, 110, 10);
    this.add.text(RESULT_CX, RESULT_CY - 68, "EXTRACTED", { font: "bold 9px Arial", color: "#546e7a" }).setOrigin(0.5).setDepth(15);
    this.resultCharText = this.add.text(RESULT_CX, RESULT_CY - 8, "", { font: "bold 40px Courier New", color: HEX_CYAN }).setOrigin(0.5).setDepth(15);
    this.resultTypeTag = this.add.text(RESULT_CX, RESULT_CY + 26, "", { font: "bold 12px Courier New", color: "#4fc3f7" }).setOrigin(0.5).setDepth(15).setAlpha(0);
    this.resultSpaceNote = this.add.text(RESULT_CX, RESULT_CY + 42, "", { font: "10px Arial", color: HEX_MAGENTA }).setOrigin(0.5).setDepth(15).setAlpha(0);
  }

  showResultChar(ch) {
    this.resultTypeTag.setAlpha(0);
    this.resultSpaceNote.setAlpha(0);
    const isSpace = ch === " ";
    const display = isSpace ? "' '" : `'${ch}'`;
    this.resultCharText.setText(display).setColor(HEX_CYAN);
    this.resultCharText.setScale(0);
    this.tweens.add({ targets: this.resultCharText, scale: 1, duration: 250, ease: "Back.easeOut" });
    this.time.delayedCall(150, () => {
      if (!this._alive) return;
      this.resultTypeTag.setText("char").setAlpha(1);
      if (isSpace) this.resultSpaceNote.setText("a space IS a char!").setAlpha(1);
    });
  }

  clearResultChar() {
    this.resultCharText.setText("");
    this.resultTypeTag.setAlpha(0);
    this.resultSpaceNote.setAlpha(0);
  }

  updateLiteralDisplay(varName, str) {
    if (this.literalGroup) { this.literalGroup.destroy(); }
    const c = this.add.container(0, 215).setDepth(15);
    let x = 0;
    const put = (t, color) => {
      const txt = this.add.text(x, 0, t, { font: "16px Courier New", color }).setOrigin(0, 0.5);
      c.add(txt);
      x += txt.width;
    };
    put("String", HEX_MAGENTA);
    put(" " + varName + " = ", HEX_GRAY);
    put('"', HEX_GRAY);
    put(str, HEX_AMBER);
    put('"', HEX_GRAY);
    put(";", HEX_GRAY);
    c.x = 640 - x / 2;
    this.literalGroup = c;
  }

  // ══════════════════════════════════════════════════════════════
  // HUD
  // ══════════════════════════════════════════════════════════════

  createHUD() {
    const g = this.add.graphics().setDepth(50);
    g.fillStyle(0x0c0916, 0.93);
    g.fillRect(0, 0, W, 64);
    g.lineStyle(1, 0x241f36, 1);
    g.lineBetween(0, 64, W, 64);

    this.add.text(20, 14, "THE RETRIEVAL CLAW", { font: "bold 15px Arial", color: "#b0bec5" }).setDepth(51);
    this.add.text(20, 36, "Accretion Phase — String Methods: charAt()", { font: "11px Arial", color: "#546e7a" }).setDepth(51);

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
      lg.lineStyle(2, C_PURPLE, 1);
      lg.beginPath(); lg.arc(-4, 0, 6, Phaser.Math.DegToRad(-40), Phaser.Math.DegToRad(80), false); lg.strokePath();
      lg.beginPath(); lg.arc(4, 0, 6, Phaser.Math.DegToRad(100), Phaser.Math.DegToRad(220), false); lg.strokePath();
      this.lifeIcons.push(lg);
    }
  }

  updateCommandMonitor(mode, data) {
    if (this.monitorGroup) { this.monitorGroup.destroy(); this.monitorGroup = null; }
    const c = this.add.container(0, 32).setDepth(52);
    let x = 0;
    const put = (t, color, font) => {
      const txt = this.add.text(x, 0, t, { font: font || "bold 15px Courier New", color }).setOrigin(0, 0.5);
      c.add(txt);
      x += txt.width;
    };
    if (mode === "call") {
      put(data.varName, HEX_CYAN);
      put(".", HEX_GRAY);
      put("charAt", HEX_AMBER);
      put("(", HEX_MAGENTA);
      put(String(data.index), HEX_AMBER, "bold 16px Courier New");
      put(")", HEX_MAGENTA);
      c.x = 640 - x / 2;
    } else if (mode === "snippet") {
      const t = this.add.text(0, 0, data.snippet, { font: "13px Courier New", color: "#e0e0e0" }).setOrigin(0.5);
      c.add(t);
      c.x = 640;
    } else if (mode === "mission") {
      const t = this.add.text(0, 0, data.text, { font: "13px Arial", color: HEX_AMBER, wordWrap: { width: 460 } }).setOrigin(0.5);
      c.add(t);
      c.x = 640;
    }
    this.monitorGroup = c;
  }

  showCompileErrorStamp() {
    const stamp = this.add.text(640, 32, "COMPILE ERROR", { font: "bold 26px Arial", color: HEX_RED }).setOrigin(0.5).setDepth(60).setScale(2).setAngle(-8).setAlpha(0);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 250, ease: "Cubic.easeOut" });
    this.screenShake(0.006, 200);
    this.roundElements.push(stamp);
    return stamp;
  }

  showBracketContrastCard() {
    const c = this.add.container(640, 462).setDepth(20);
    const g = this.add.graphics();
    g.fillStyle(0x0d1117, 1);
    g.fillRoundedRect(-140, -43, 280, 86, 8);
    g.lineStyle(1, 0x2a3a4a, 1);
    g.strokeRoundedRect(-140, -43, 280, 86, 8);
    const l1 = this.add.text(0, -26, "array  → arr[0] ✓", { font: "bold 12px Courier New", color: HEX_AMBER }).setOrigin(0.5);
    const l2 = this.add.text(0, 0, "String → s.charAt(0) ✓", { font: "bold 12px Courier New", color: HEX_CYAN }).setOrigin(0.5);
    const l3 = this.add.text(0, 26, "String → s[0] ✗", { font: "bold 12px Courier New", color: HEX_RED }).setOrigin(0.5);
    c.add([g, l1, l2, l3]);
    c.setAlpha(0);
    this.tweens.add({ targets: c, alpha: 1, duration: 300 });
    this.roundElements.push(c);
    return c;
  }

  showCharStringCard() {
    const c = this.add.container(RESULT_CX, RESULT_CY - 100).setDepth(20);
    const g = this.add.graphics();
    g.fillStyle(0x0d1117, 1);
    g.fillRoundedRect(-85, -32, 170, 64, 8);
    g.lineStyle(1, 0x2a3a4a, 1);
    g.strokeRoundedRect(-85, -32, 170, 64, 8);
    const l1 = this.add.text(0, -14, "char   → 'b'", { font: "bold 12px Courier New", color: HEX_CYAN }).setOrigin(0.5);
    const l2 = this.add.text(0, 14, 'String → "b"', { font: "bold 12px Courier New", color: HEX_GRAY }).setOrigin(0.5);
    c.add([g, l1, l2]);
    c.setAlpha(0);
    this.tweens.add({ targets: c, alpha: 1, duration: 300 });
    this.roundElements.push(c);
    return c;
  }

  showExceptionStamp(index) {
    const t = this.add.text(1280, 250, `StringIndexOutOfBoundsException: index ${index}`, {
      font: "bold 14px Courier New", color: HEX_RED,
    }).setOrigin(0, 0.5).setDepth(60);
    this.roundElements.push(t);
    this.tweens.add({ targets: t, x: 640 - t.width / 2, duration: 350, ease: "Cubic.easeOut" });
    this.time.delayedCall(1800, () => {
      this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() });
    });
  }

  // ══════════════════════════════════════════════════════════════
  // BIT — crane operator variant
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
    const headset = this.add.graphics();
    headset.lineStyle(2, 0x78909c, 1);
    headset.beginPath();
    headset.arc(0, -8, 14, Phaser.Math.DegToRad(200), Phaser.Math.DegToRad(340), false);
    headset.strokePath();
    const mic = this.add.circle(9, 4, 2, 0x78909c);
    c.add([g, tip, eye, pupil, headset, mic]);
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
    const inner = this.add.text(0, 0, text, { font: "13px Arial", color: "#e0e0e0", wordWrap: { width: 330 } });
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
    if (done) this.time.delayedCall(300, () => this.startRound(0));
    else this.runTutorial();
  }

  async runTutorial() {
    const A = () => this._alive;
    this.clearTileRow();
    await this.delay(500); if (!A()) return;
    await this.bitSlideTo(1090, 500); if (!A()) return;
    await this.bitSay("Welcome to the Retrieval Bay, Analyst! The scanner counted characters — but the CLAW can grab any single one. First, every character needs an ADDRESS.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4000)]); if (!A()) return;

    this.updateLiteralDisplay("s", "robot");
    await this.tutorialDropTiles("robot"); if (!A()) return;
    await this.bitSay("Index plates! Just like the Memory Vault, addresses start at ZERO. 'r' lives at 0, 'o' at 1... so a String of length 5 ends at index 4 — always length minus one!");
    if (!A()) return;
    const anno = this.add.text(640, 420, "length() = 5, last index = 4", { font: "bold 11px Arial", color: HEX_AMBER }).setOrigin(0.5).setDepth(20).setAlpha(0);
    this.tweens.add({ targets: anno, alpha: 1, duration: 250 });
    await Promise.race([this.waitForClick(), this.delay(4000)]); if (!A()) return;
    this.tweens.add({ targets: anno, alpha: 0, duration: 250, onComplete: () => anno.destroy() });

    this.updateCommandMonitor("call", { varName: "s", index: 2 });
    await this.bitSay("charAt(2) commands the claw: 'fetch whatever lives at index 2.' Watch it work!");
    if (!A()) return;
    await this.clawExtract(2); if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(3000)]); if (!A()) return;

    await this.bitSay("See the SINGLE quotes? charAt() returns a char — one character, type char. 'b' is a char. \"b\" with double quotes would be a String. Java treats them differently!");
    if (!A()) return;
    const card = this.showCharStringCard();
    await Promise.race([this.waitForClick(), this.delay(4000)]); if (!A()) return;
    this.tweens.add({ targets: card, alpha: 0, duration: 250, onComplete: () => card.destroy() });

    this.updateCommandMonitor("call", { varName: "s", index: 5 });
    await this.bitSay("Uh oh — index 5? Count the plates: 0,1,2,3,4. There IS no 5! Watch what happens...");
    if (!A()) return;
    await this.clawOutOfBounds(5); if (!A()) return;
    await this.bitSay("StringIndexOutOfBoundsException — the claw crashed! length() is 5, but 5 is NOT a valid index. The last safe address is always length() - 1. Never forget it!");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4000)]); if (!A()) return;

    await this.bitSay("Your turn at the controls, Operator. Predict extractions, find addresses, and keep the claw on the rails!");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(3500)]); if (!A()) return;
    this.hideBubble();
    await this.bitSlideTo(W + 80, 500, 250);

    try { localStorage.setItem(TUTORIAL_KEY, "true"); } catch (_) {}
    this.startRound(0);
  }

  async tutorialDropTiles(str) {
    this.clearTileRow();
    const n = str.length;
    const tw = this._tileWidth(n);
    const totalW = n * tw + (n - 1) * 6;
    const startX = 640 - totalW / 2;
    for (let i = 0; i < n; i++) {
      if (!this._alive) return;
      const x = startX + i * (tw + 6) + tw / 2;
      const tile = this.createTile(str[i], i, x, TILE_Y, tw);
      tile.container.y = TILE_Y - 50;
      tile.container.setAlpha(0);
      tile.plateG.setAlpha(0); tile.plateText.setAlpha(0);
      this.tiles.push(tile);
      this.tweens.add({ targets: tile.container, y: TILE_Y, alpha: 1, duration: 250, ease: "Bounce.easeOut" });
      await this.delay(150);
    }
    for (let i = 0; i < n; i++) {
      if (!this._alive) return;
      const tile = this.tiles[i];
      this.tweens.add({ targets: [tile.plateG, tile.plateText], alpha: 1, duration: 150 });
      await this.delay(150);
    }
  }

  // ══════════════════════════════════════════════════════════════
  // THE EXTRACTION ANIMATION
  // ══════════════════════════════════════════════════════════════

  async clawExtract(index) {
    const tile = this.tiles[index];
    if (!tile) return this.clawOutOfBounds(index);
    this.clawStatusLight.setFillStyle(C_CYAN);
    await this.moveClawTo(tile.x);
    if (!this._alive) return;

    const beam = this.add.line(0, 0, this.clawHeadContainer.x, this.clawHeadContainer.y, tile.x, TILE_Y - TILE_H / 2, C_CYAN, 0.4).setOrigin(0, 0).setDepth(17).setLineWidth(1);
    this.tweens.add({ targets: tile.plateG, scale: 1.3, duration: 125, yoyo: true });
    this.tweens.add({ targets: tile.plateText, scale: 1.3, duration: 125, yoyo: true });
    await this.delay(200);
    beam.destroy();
    if (!this._alive) return;

    this.clawGrip(false);
    await this.extendCable(TILE_Y - RAIL_Y - 11, 350, "Quad.easeIn");
    if (!this._alive) return;
    this.clawGrip(true);
    this.clawStatusLight.setFillStyle(C_AMBER);
    const sparks = this.add.particles(tile.x, TILE_Y, "l28_dot", {
      speed: { min: 30, max: 70 }, angle: { min: 0, max: 360 }, scale: { start: 0.5, end: 0 }, lifespan: 250, tint: C_AMBER, emitting: false,
    }).setDepth(20);
    sparks.explode(3);
    this.time.delayedCall(300, () => sparks.destroy());

    // lift character out
    tile.extracted = true;
    this._drawTileBody(tile.body, tile.tw, 0x2a3a4a, 1, true);
    tile.charText.setAlpha(0.15);
    const flyChar = this.add.text(tile.x, TILE_Y, tile.ch === " " ? "␣" : tile.ch, {
      font: "bold 24px Courier New", color: tile.ch === " " ? HEX_MAGENTA : this._charMeta(tile.ch).color,
    }).setOrigin(0.5).setDepth(30);
    this.roundElements.push(flyChar);
    await this.delay(80);
    if (!this._alive) return;

    await this.extendCable(40, 350);
    if (!this._alive) return;
    this.tweens.add({ targets: flyChar, x: RESULT_CX, y: RAIL_Y, duration: 350 });
    await this.moveClawTo(RESULT_CX);
    if (!this._alive) return;
    await new Promise((res) => {
      this.tweens.add({ targets: flyChar, y: RESULT_CY - 8, duration: 250, ease: "Bounce.easeOut", onComplete: () => res() });
    });
    flyChar.destroy();
    this.showResultChar(tile.ch);
    this.clawStatusLight.setFillStyle(C_GRAY);

    await this.delay(700);
    if (!this._alive) return;
    // return character
    if (tile.container.active) {
      tile.charText.setAlpha(1);
      this._drawTileBody(tile.body, tile.tw, 0x2a3a4a, 2, false);
      tile.extracted = false;
    }
    await this.parkClaw();
  }

  async clawOutOfBounds(index) {
    this.clawStatusLight.setFillStyle(C_CYAN);
    const n = this.tiles.length;
    let targetX;
    if (index < 0) targetX = RAIL_X_START + 20;
    else {
      const last = this.tiles[n - 1];
      const tw = last ? last.tw : 52;
      targetX = last ? last.x + tw + 6 + tw / 2 : 640;
    }
    await this.moveClawTo(targetX);
    if (!this._alive) return;

    this.clawGrip(false);
    await this.extendCable(TILE_Y - RAIL_Y - 11, 350, "Quad.easeIn");
    if (!this._alive) return;
    this.clawGrip(true);
    this.clawStatusLight.setFillStyle(C_RED);
    const dust = this.add.particles(targetX, TILE_Y, "l28_dot", {
      speed: { min: 15, max: 35 }, angle: { min: 0, max: 360 }, scale: { start: 0.4, end: 0 }, lifespan: 300, tint: 0x78909c, emitting: false,
    }).setDepth(20);
    dust.explode(2);
    this.time.delayedCall(400, () => dust.destroy());

    this.activateBeacon();
    this.screenShake(0.004, 250);
    this.showExceptionStamp(index);
    await this.delay(300);
    if (!this._alive) return;
    await this.extendCable(40, 300);
    if (!this._alive) return;
    this.clawStatusLight.setFillStyle(C_GRAY);
    await this.parkClaw();
  }

  // ══════════════════════════════════════════════════════════════
  // GAMEPLAY — round system
  // ══════════════════════════════════════════════════════════════

  async startRound(index) {
    if (!this._alive || this.gameEnded) return;
    this.currentRound = index;
    const cfg = ROUNDS[index];
    this.roundAttempts = 0;
    this.commandMissCount = 0;
    this.roundStartTime = this.time.now;
    this.inputLocked = true;
    this.clearRound();

    this.updateLiteralDisplay(cfg.varName, cfg.str);
    this.buildTileRow(cfg.str);
    this.clearResultChar();

    if (cfg.type === "predict" || cfg.type === "lookup") {
      this.updateCommandMonitor("call", { varName: cfg.varName, index: cfg.index !== undefined ? cfg.index : "?" });
    } else if (cfg.type === "judge") {
      this.updateCommandMonitor("snippet", { snippet: cfg.snippet });
    } else if (cfg.type === "command") {
      this.updateCommandMonitor("mission", { text: cfg.mission });
    }

    this.showQuestionCard(cfg);
    switch (cfg.type) {
      case "predict": this.setupPredict(cfg); break;
      case "lookup": this.setupLookup(cfg); break;
      case "judge": this.setupJudge(cfg); break;
      case "command": this.setupCommand(cfg); break;
    }
    this.inputLocked = false;
  }

  clearRound() {
    this.hideBubble();
    this.optionBubbles.forEach((b) => b.destroy());
    this.optionBubbles = [];
    this.capsules.forEach((c) => c.container.destroy());
    this.capsules = [];
    this.consoleSlots = [];
    this.roundElements.forEach((e) => { if (e && e.destroy) e.destroy(); });
    this.roundElements = [];
    if (this.questionCard) { this.questionCard.destroy(); this.questionCard = null; }
  }

  _defaultQuestionText(cfg) {
    if (cfg.question) return cfg.question;
    if (cfg.type === "judge") return "Will this code run SAFELY, or CRASH?";
    if (cfg.type === "command") return cfg.mission;
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
    const badgeNum = this.add.text(-228, 0, String(cfg.round), { font: "bold 14px Arial", color: "#0a0e14" }).setOrigin(0.5);
    const text = this.add.text(-200, 0, this._defaultQuestionText(cfg), {
      font: "16px Arial", color: "#e0e0e0", wordWrap: { width: 440 },
    }).setOrigin(0, 0.5);
    card.add([g, badge, badgeNum, text]);
    this.tweens.add({ targets: card, y: 480, alpha: 1, duration: 300, ease: "Back.easeOut" });
    this.questionCard = card;
  }

  // ══════════════════════════════════════════════════════════════
  // OPTION BUBBLES
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
      const float = this.tweens.add({ targets: c, y: "+=3", duration: 2300, ease: "Sine.easeInOut", yoyo: true, repeat: -1, delay: i * 150 });
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
  // TYPE A — PREDICT
  // ══════════════════════════════════════════════════════════════

  setupPredict(cfg) {
    this.showOptionBubbles(cfg.options, async (opt, bubble, draw) => {
      const correct = opt.value === cfg.correct;
      this.logAttempt(cfg, correct, opt.value, opt.tag);
      draw(correct ? C_GREEN : C_RED);
      if (!correct) {
        this.tweens.add({ targets: bubble, x: bubble.x + 6, duration: 45, yoyo: true, repeat: 5 });
        const correctBubble = this.optionBubbles.find((b) => b.getData("value") === cfg.correct);
        if (correctBubble) correctBubble.getData("draw")(C_GREEN);
      }
      await this.clawExtract(cfg.index);
      if (!this._alive) return;
      if (cfg.concept === "char_type_discrimination") this.showCharStringCard();
      if (correct) this.onCorrectAnswer(cfg);
      else this.onIncorrectAnswer(cfg, opt.tag);
    });
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE B — LOOKUP
  // ══════════════════════════════════════════════════════════════

  setupLookup(cfg) {
    this.showOptionBubbles(cfg.options, async (opt, bubble, draw) => {
      const correct = opt.value === cfg.correct;
      this.logAttempt(cfg, correct, opt.value, opt.tag);
      draw(correct ? C_GREEN : C_RED);
      if (!correct) {
        this.tweens.add({ targets: bubble, x: bubble.x + 6, duration: 45, yoyo: true, repeat: 5 });
        const correctBubble = this.optionBubbles.find((b) => b.getData("value") === cfg.correct);
        if (correctBubble) correctBubble.getData("draw")(C_GREEN);

        const wrongTile = this.tiles[opt.value];
        if (wrongTile) {
          const actualCh = wrongTile.ch === " " ? "␣" : wrongTile.ch;
          const anno = this.add.text(wrongTile.x, TILE_Y - 60, `that's '${actualCh}'!`, {
            font: "bold 12px Arial", color: HEX_RED,
          }).setOrigin(0.5).setDepth(20).setAlpha(0);
          this.roundElements.push(anno);
          this.tweens.add({ targets: anno, alpha: 1, duration: 200 });
          this.tweens.add({ targets: wrongTile.plateG, scale: 1.2, duration: 150, yoyo: true });
          await this.delay(700);
        }
      }
      await this.clawExtract(cfg.correct);
      if (!this._alive) return;
      if (correct) this.onCorrectAnswer(cfg);
      else this.onIncorrectAnswer(cfg, opt.tag);
    });
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE C — JUDGE
  // ══════════════════════════════════════════════════════════════

  showJudgmentButtons(onSelect) {
    const mk = (x, label, color) => {
      const c = this.add.container(x, 570).setDepth(20);
      const g = this.add.graphics();
      const draw = (fillA) => {
        g.clear();
        g.fillStyle(color, fillA);
        g.fillRoundedRect(-95, -27, 190, 54, 12);
        g.lineStyle(2, color, 1);
        g.strokeRoundedRect(-95, -27, 190, 54, 12);
      };
      draw(0);
      const hex = "#" + color.toString(16).padStart(6, "0");
      const t = this.add.text(0, 0, label, { font: "bold 15px Arial", color: hex }).setOrigin(0.5);
      c.add([g, t]);
      c.setSize(190, 54);
      c.setInteractive({ useHandCursor: true });
      c.on("pointerover", () => { if (!this.inputLocked) { draw(0.08); c.setScale(1.03); } });
      c.on("pointerout", () => { draw(0); c.setScale(1); });
      c.on("pointerdown", () => {
        if (this.inputLocked) return;
        this.inputLocked = true;
        onSelect(label.includes("SAFE") ? "safe" : "crash");
      });
      this.optionBubbles.push(c);
    };
    mk(480, "✓ SAFE", C_GREEN);
    mk(800, "✗ CRASH", C_RED);
  }

  setupJudge(cfg) {
    this.showJudgmentButtons(async (choice) => {
      const correct = choice === cfg.correct;
      this.logAttempt(cfg, correct, choice, correct ? null : cfg.wrongTag);

      if (cfg.crashType === "compile") {
        this.showCompileErrorStamp();
        await this.delay(300);
        if (!this._alive) return;
        const anno = this.add.text(640, 62, cfg.explanation, {
          font: "bold 12px Arial", color: HEX_RED, wordWrap: { width: 560 },
        }).setOrigin(0.5).setDepth(60).setAlpha(0);
        this.roundElements.push(anno);
        this.tweens.add({ targets: anno, alpha: 1, duration: 250 });
        await this.delay(700);
        if (!this._alive) return;
        this.showBracketContrastCard();
        await this.delay(600);
      } else if (cfg.correct === "crash") {
        await this.clawOutOfBounds(cfg.crashIndex);
        if (!this._alive) return;
        const anno = this.add.text(640, 460, cfg.explanation, {
          font: "bold 12px Arial", color: HEX_RED, wordWrap: { width: 560 },
        }).setOrigin(0.5).setDepth(20).setAlpha(0);
        this.roundElements.push(anno);
        this.tweens.add({ targets: anno, alpha: 1, duration: 250 });
        await this.delay(600);
      } else {
        // safe: evaluate s.length()-1 pattern genuinely
        const resolvedIndex = cfg.str.length - 1;
        await this.showEvaluationFloat([`s.length() = ${cfg.str.length}`, `${cfg.str.length} - 1 = ${resolvedIndex}`]);
        if (!this._alive) return;
        await this.clawExtract(resolvedIndex);
      }
      if (!this._alive) return;
      if (correct) this.onCorrectAnswer(cfg);
      else this.onIncorrectAnswer(cfg, cfg.wrongTag);
    });
  }

  async showEvaluationFloat(lines) {
    for (let i = 0; i < lines.length; i++) {
      if (!this._alive) return;
      const t = this.add.text(640, 440 - i * 24, lines[i], { font: "bold 13px Courier New", color: HEX_AMBER }).setOrigin(0.5).setDepth(20).setAlpha(0);
      this.roundElements.push(t);
      this.tweens.add({ targets: t, alpha: 1, duration: 200 });
      await this.delay(400);
    }
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE D — CLAW COMMAND
  // ══════════════════════════════════════════════════════════════

  resolveCapsuleValue(capsule, str) {
    if (capsule.value === "len") return str.length;
    if (capsule.value === "len-1") return str.length - 1;
    return capsule.value;
  }

  setupCommand(cfg) {
    this.consoleSlots = [];
    const slotW = 90, slotGap = 12;
    const totalSlotW = cfg.slots * slotW + (cfg.slots - 1) * slotGap;
    const slotStartX = 640 - totalSlotW / 2;
    for (let i = 0; i < cfg.slots; i++) {
      const x = slotStartX + i * (slotW + slotGap) + slotW / 2;
      const y = 570;
      const dg = this.add.graphics().setDepth(20);
      const drawDash = () => {
        dg.clear();
        dg.lineStyle(2, C_AMBER, 1);
        this._dashedRectOutline(dg, x - slotW / 2, y - 20, slotW, 40, 5, 4);
      };
      drawDash();
      this.tweens.add({ targets: dg, alpha: 0.4, duration: 900, yoyo: true, repeat: -1 });
      this.roundElements.push(dg);
      this.consoleSlots.push({ x, y, w: slotW, h: 40, dg, capsule: null, index: i });
    }

    const trayY = 630;
    const tw = cfg.capsules.map((c) => {
      const t = this.add.text(0, 0, c.label, { font: "bold 14px Courier New", color: HEX_CYAN });
      const w = Math.max(t.width + 24, 50);
      t.destroy();
      return w;
    });
    const totalTrayW = tw.reduce((a, b) => a + b, 0) + (cfg.capsules.length - 1) * 10;
    let cx = 640 - totalTrayW / 2;
    cfg.capsules.forEach((cap, i) => {
      const w = tw[i], h = 34;
      const home = { x: cx + w / 2, y: trayY };
      cx += w + 10;
      const c = this.add.container(home.x, home.y).setDepth(21);
      const g = this.add.graphics();
      g.fillStyle(0x1a1a2e, 1);
      g.fillRoundedRect(-w / 2, -h / 2, w, h, 17);
      g.lineStyle(1, C_AMBER, 1);
      g.strokeRoundedRect(-w / 2, -h / 2, w, h, 17);
      const t = this.add.text(0, 0, cap.label, { font: "bold 14px Courier New", color: HEX_AMBER }).setOrigin(0.5);
      c.add([g, t]);
      c.setSize(w, h);
      c.setData("w", w);
      c.setData("cap", cap);
      c.setData("home", home);
      c.setData("placedIn", null);
      c.setInteractive({ useHandCursor: true, draggable: true });
      this.capsules.push({ container: c, cap, home });
    });

    const exec = this.add.container(1000, 570).setDepth(22);
    const eg = this.add.graphics();
    const drawExec = (enabled, hover) => {
      eg.clear();
      eg.fillStyle(enabled ? C_GREEN : 0x2a2f36, hover && enabled ? 1 : 0.95);
      eg.fillRoundedRect(-60, -20, 120, 40, 8);
    };
    drawExec(false, false);
    const et = this.add.text(0, 0, "EXECUTE", { font: "bold 13px Arial", color: "#0a0e14" }).setOrigin(0.5);
    exec.add([eg, et]);
    exec.setSize(120, 40);
    exec.on("pointerover", () => { if (this._execReady) { drawExec(true, true); exec.setScale(1.03); } });
    exec.on("pointerout", () => { drawExec(this._execReady, false); exec.setScale(1); });
    exec.on("pointerdown", () => { if (this._execReady) this.onExecutePressed(cfg); });
    this.execButton = { c: exec, draw: drawExec };
    this.roundElements.push(exec);
    this._updateExecReady();
  }

  _updateExecReady() {
    const filled = this.consoleSlots.every((s) => s.capsule);
    this._execReady = filled;
    if (this.execButton) {
      this.execButton.draw(filled, false);
      if (filled) this.execButton.c.setInteractive({ useHandCursor: true });
      else this.execButton.c.disableInteractive();
    }
  }

  setupDragEvents() {
    this.input.on("dragstart", (pointer, obj) => {
      if (!this.capsules.find((c) => c.container === obj) || this.inputLocked) return;
      obj.setDepth(60);
      this.tweens.add({ targets: obj, scale: 1.08, alpha: 0.85, duration: 100 });
      const prevSlot = obj.getData("placedIn");
      if (prevSlot !== null && prevSlot !== undefined) {
        const slot = this.consoleSlots[prevSlot];
        if (slot) slot.capsule = null;
        obj.setData("placedIn", null);
        this._updateExecReady();
      }
    });
    this.input.on("drag", (pointer, obj, dragX, dragY) => {
      if (!this.capsules.find((c) => c.container === obj) || this.inputLocked) return;
      obj.x = dragX;
      obj.y = dragY;
      this._updateConsoleHover(obj);
    });
    this.input.on("dragend", (pointer, obj) => {
      if (!this.capsules.find((c) => c.container === obj) || this.inputLocked) return;
      this._finishCapsuleDrag(obj);
    });
  }

  _nearestOpenConsoleSlot(x, y) {
    let best = null, bestDist = 60;
    this.consoleSlots.forEach((s) => {
      if (s.capsule) return;
      const dist = Phaser.Math.Distance.Between(x, y, s.x, s.y);
      const within = x >= s.x - s.w / 2 - 20 && x <= s.x + s.w / 2 + 20 && y >= s.y - s.h / 2 - 15 && y <= s.y + s.h / 2 + 15;
      if (within && dist < bestDist) { bestDist = dist; best = s; }
    });
    return best;
  }

  _updateConsoleHover(obj) {
    const slot = this._nearestOpenConsoleSlot(obj.x, obj.y);
    const key = slot ? slot.index : null;
    if (key !== this._dragOverSlotKey) {
      this._dragOverSlotKey = key;
    }
    if (slot) {
      obj.x = Phaser.Math.Linear(obj.x, slot.x, 0.25);
      obj.y = Phaser.Math.Linear(obj.y, slot.y, 0.25);
    }
  }

  _finishCapsuleDrag(obj) {
    obj.setDepth(21);
    this.tweens.add({ targets: obj, scale: 1, alpha: 1, duration: 100 });
    const slot = this._nearestOpenConsoleSlot(obj.x, obj.y);
    this._dragOverSlotKey = null;
    if (slot) {
      slot.capsule = obj;
      obj.setData("placedIn", slot.index);
      this.tweens.add({ targets: obj, x: slot.x, y: slot.y, duration: 150, ease: "Cubic.easeOut" });
      this._updateExecReady();
    } else {
      const home = obj.getData("home");
      this.tweens.add({ targets: obj, x: home.x, y: home.y, duration: 250, ease: "Cubic.easeOut" });
    }
  }

  async onExecutePressed(cfg) {
    if (!this._execReady) return;
    this.inputLocked = true;
    this.execButton.draw(false, false);
    this.execButton.c.disableInteractive();

    const chosenCaps = this.consoleSlots.map((s) => s.capsule.getData("cap"));
    const resolvedIndices = chosenCaps.map((cap) => this.resolveCapsuleValue(cap, cfg.str));
    let allCorrect;
    if (cfg.answer) {
      allCorrect = JSON.stringify(resolvedIndices) === JSON.stringify(cfg.answer);
    } else {
      allCorrect = chosenCaps.every((cap) => cap.correct === true);
    }
    const primaryTag = chosenCaps.map((c) => c.tag).find(Boolean) || cfg.wrongTagDefault || null;
    this.logAttempt(cfg, allCorrect, chosenCaps.map((c) => c.label), allCorrect ? null : primaryTag);

    let spelled = "";
    for (let i = 0; i < resolvedIndices.length; i++) {
      if (!this._alive) return;
      const idx = resolvedIndices[i];
      if (idx < 0 || idx >= cfg.str.length) {
        await this.clawOutOfBounds(idx);
        spelled += "?";
      } else {
        await this.clawExtract(idx);
        spelled += cfg.str[idx];
      }
      if (!this._alive) return;
      await this.delay(200);
    }

    if (allCorrect) {
      this.onCorrectAnswer(cfg);
    } else {
      this.commandMissCount++;
      const costLife = this.commandMissCount >= 2;
      await this.onCommandIncorrect(cfg, primaryTag, costLife, spelled);
    }
  }

  async onCommandIncorrect(cfg, tag, costLife, spelled) {
    if (this.gameEnded) return;
    this.updateCombo(false);
    if (costLife) {
      const dead = this.loseLife();
      if (dead) { this.time.delayedCall(500, () => this.gameOver()); return; }
    }
    const msg = cfg.slots > 1
      ? `The claw actually spelled "${spelled}" — not quite the target. ${MISCONCEPTION_FEEDBACK[tag] || "Recheck each address."}`
      : (MISCONCEPTION_FEEDBACK[tag] || "Recheck the address and try again.");
    await this.showBitFeedback(msg);
    if (!this._alive || this.gameEnded) return;
    // reset console for retry
    this.consoleSlots.forEach((s) => {
      if (s.capsule) {
        const cap = s.capsule;
        const home = cap.getData("home");
        cap.setData("placedIn", null);
        this.tweens.add({ targets: cap, x: home.x, y: home.y, duration: 250 });
        s.capsule = null;
      }
    });
    this._updateExecReady();
    this.inputLocked = false;
  }

  // ══════════════════════════════════════════════════════════════
  // EVALUATION
  // ══════════════════════════════════════════════════════════════

  logAttempt(cfg, correct, selected, tag) {
    this.roundAttempts++;
    this.attemptLog.push({
      round: cfg.round, type: cfg.type, concept: cfg.concept, correct,
      selectedAnswer: selected, misconceptionTag: tag || null,
      timeMs: Math.round(this.time.now - this.roundStartTime), attemptNumber: this.roundAttempts,
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
    this.totalTime = (this.totalTime || 0) + timeMs;
    let points = 100 * multiplier;
    if (timeMs <= 6000) { points += 25; this.createFloatingText(RESULT_CX, RESULT_CY - 90, "+25 QUICK!", HEX_AMBER, "bold 13px Arial"); }
    this.updateScore(points);

    const t = this.add.text(640, 200, "✓ CORRECT", { font: "bold 28px Arial", color: HEX_GREEN }).setOrigin(0.5).setScale(0).setDepth(70);
    this.tweens.add({
      targets: t, scale: 1.15, duration: 200, ease: "Back.easeOut",
      onComplete: () => this.tweens.add({ targets: t, scale: 1, duration: 100 }),
    });
    this.time.delayedCall(900, () => this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() }));

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
    this.screenShake(0.003, 150);
    const dead = this.loseLife();
    if (dead) { this.time.delayedCall(600, () => this.gameOver()); return; }
    await this.showBitFeedback(MISCONCEPTION_FEEDBACK[tag] || "Recount the plates carefully — the claw never lies!");
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
      onUpdate: () => { this.displayScore = Math.round(counter.v); if (this.scoreText.active) this.scoreText.setText(String(this.displayScore)); },
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
    const p = this.add.particles(x + 10, y + 8, "l28_dot", {
      speed: { min: 40, max: 140 }, angle: { min: 0, max: 360 }, scale: { start: 0.5, end: 0 }, lifespan: 400, tint: 0xffd740, emitting: false,
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

  createFloatingText(x, y, text, colorHex, font = "bold 16px Arial") {
    const t = this.add.text(x, y, text, { font, color: colorHex }).setOrigin(0.5).setDepth(65);
    this.tweens.add({ targets: t, y: y - 34, alpha: 0, duration: 900, ease: "Cubic.easeOut", onComplete: () => t.destroy() });
    return t;
  }

  createConfetti(x, y, count = 30) {
    const p = this.add.particles(x, y, "l28_dot", {
      speed: { min: 80, max: 260 }, angle: { min: 0, max: 360 }, scale: { start: 0.9, end: 0 }, lifespan: 500,
      tint: [C_CYAN, C_AMBER, C_GREEN, C_PURPLE, 0xffffff], emitting: false,
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

  async celebrationJuggle() {
    for (let sweep = 0; sweep < 2; sweep++) {
      if (!this._alive) return;
      await this.moveClawTo(RAIL_X_END - 20);
      if (!this._alive) return;
      await this.moveClawTo(RAIL_X_START + 20);
    }
    const cfg = ROUNDS[ROUNDS.length - 1];
    const str = cfg.str;
    for (let i = 0; i < str.length; i++) {
      if (!this._alive) return;
      const tile = this.tiles[i];
      if (!tile) continue;
      const flyChar = this.add.text(tile.x, TILE_Y, str[i] === " " ? "␣" : str[i], {
        font: "bold 20px Courier New", color: this._charMeta(str[i]).color,
      }).setOrigin(0.5).setDepth(30);
      this.tweens.add({ targets: flyChar, y: TILE_Y - 60, duration: 150, yoyo: true, onComplete: () => flyChar.destroy() });
      await this.delay(100);
    }
    this.createConfetti(RESULT_CX, RESULT_CY);
    await this.delay(400);
  }

  gameOver() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearRound();
    this.hideBubble();

    this.tiles.forEach((t) => {
      if (t.pulse) t.pulse.stop();
      this._drawTileBody(t.body, t.tw, 0x1a1a2a, 2);
      t.plateText.setColor("#3d2f1f");
    });
    this.clawStatusLight.setFillStyle(0x333333);
    this.extendCable(120, 500);

    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
    this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });

    const title = this.add.text(640, 240, "CLAW OFFLINE", { font: "bold 40px Arial", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
    this.tweens.add({
      targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut",
      onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }),
    });
    this.add.text(640, 310, `Score: ${this.score}`, { font: "20px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
    this.add.text(640, 350, `Rounds Completed: ${this.currentRound} / ${ROUNDS.length}`, { font: "16px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);

    this._makeButton(640, 420, "RESET SYSTEMS", 190, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearRound();
    this.hideBubble();

    const accuracy = this.correctFirstTry / ROUNDS.length;
    try { GameManager.completeLevel(27, Math.round(accuracy * 100)); } catch (_) {}
    try { BadgeSystem.unlock("charAt_schema"); } catch (_) {}
    try {
      localStorage.setItem("level28_results", JSON.stringify({
        level: 28, concept: "string_charAt", phase: "accretion",
        score: this.score, accuracy, avgTime: Math.round((this.totalTime || 0) / ROUNDS.length),
        comboMax: this.maxCombo, stars: this._starRating(accuracy),
        livesRemaining: this.lives, attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.celebrationJuggle().then(() => { if (this._alive) this.showScoreTally(accuracy); });
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
    panel.fillStyle(0x141020, 1);
    panel.fillRoundedRect(360, 150, 560, 420, 16);
    panel.lineStyle(2, C_PURPLE, 1);
    panel.strokeRoundedRect(360, 150, 560, 420, 16);

    const title = this.add.text(640, 200, "EXTRACTION COMPLETE", { font: "bold 34px Arial", color: HEX_GREEN }).setOrigin(0.5).setDepth(91).setScale(0);
    this.tweens.add({ targets: title, scale: 1, duration: 350, ease: "Back.easeOut" });

    const avgTime = ((this.totalTime || 0) / ROUNDS.length / 1000).toFixed(1);
    const lines = [`ACCURACY: ${Math.round(accuracy * 100)}%`, `BEST COMBO: ×${this.maxCombo}`, `AVG TIME: ${avgTime}s`];
    lines.forEach((s, i) => {
      const t = this.add.text(500, 260 + i * 30, s, { font: "14px Arial", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 250, delay: 300 + i * 150 });
    });
    const totalText = this.add.text(500, 260 + 3 * 30, "TOTAL: 0", { font: "bold 24px Arial", color: HEX_AMBER }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: totalText, alpha: 1, duration: 250, delay: 900 });
    const counter = { v: 0 };
    this.tweens.add({ targets: counter, v: this.score, duration: 1000, delay: 900, onUpdate: () => totalText.setText(`TOTAL: ${Math.round(counter.v)}`) });

    const stars = this._starRating(accuracy);
    for (let i = 0; i < 3; i++) {
      const earned = i < stars;
      const s = this.add.text(640 + (i - 1) * 60, 385, "★", { font: "40px Arial", color: earned ? HEX_AMBER : "#2a3040" }).setOrigin(0.5).setDepth(91).setScale(0);
      this.tweens.add({ targets: s, scale: 1, duration: 250, delay: 1500 + i * 200, ease: earned ? "Back.easeOut" : "Cubic.easeOut" });
    }

    const badge = this.add.container(640, 470).setDepth(91).setAlpha(0);
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillCircle(0, 0, 30);
    bg.lineStyle(2, C_AMBER, 1);
    bg.strokeCircle(0, 0, 30);
    bg.lineStyle(3, C_PURPLE, 1);
    bg.beginPath(); bg.arc(-6, 2, 8, Phaser.Math.DegToRad(-40), Phaser.Math.DegToRad(80), false); bg.strokePath();
    bg.beginPath(); bg.arc(6, 2, 8, Phaser.Math.DegToRad(100), Phaser.Math.DegToRad(220), false); bg.strokePath();
    bg.fillStyle(C_AMBER, 1);
    bg.fillCircle(0, 4, 3);
    badge.add(bg);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 2100 });
    const badgeLbl = this.add.text(640, 508, "charAt() SCHEMA ACQUIRED", { font: "bold 13px Arial", color: HEX_AMBER }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: badgeLbl, alpha: 1, duration: 300, delay: 2200 });

    this._makeButton(500, 540, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(760, 540, "NEXT: Claw Trials →", 220, 44, { fill: 0x00733a, stroke: C_GREEN, textColor: "#ffffff" }, () => {
      if (this.scene.get("Level29Scene")) this.scene.start("Level29Scene");
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
