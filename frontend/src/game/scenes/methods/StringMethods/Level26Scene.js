/**
 * Level 26 — "The Inspection Line" (String Methods: Tuning Phase)
 * ==================================================================
 * Tunes and corrects the length() schema acquired in Level 25 through
 * rapid-fire quality-control challenges in an industrial string-processing
 * factory. String specimens arrive in crates on a moving conveyor belt —
 * the crate's position on the belt IS the visual timer. The player must
 * inspect each crate before it reaches the rejection pit.
 *
 * 15 rounds in 3 waves of 5:
 *  Wave 1 (1-5)   — Rapid Prediction
 *  Wave 2 (6-10)  — Syntax Judgment (method vs property discrimination)
 *  Wave 3 (11-15) — Expression Evaluation + Bug Hunt (clickable tokens)
 *
 * The crate's tween progress is the single source of truth for the timer
 * bar, urgency states, and timeout — never a separate clock.
 */

import Phaser from "phaser";
import { GameManager } from "../../../GameManager.js";
import { BadgeSystem } from "../../../BadgeSystem.js";

const W = 1280, H = 720;

const C_CYAN = 0x00e5ff, C_AMBER = 0xffd740, C_GREEN = 0x00e676;
const C_RED = 0xf44336, C_GRAY = 0x78909c, C_MAGENTA = 0xff4081;
const HEX_CYAN = "#00e5ff", HEX_AMBER = "#ffd740", HEX_GREEN = "#00e676";
const HEX_RED = "#f44336", HEX_GRAY = "#78909c", HEX_MAGENTA = "#ff4081";

const BELT_Y = 430, BELT_H = 34;
const CRATE_Y = 355;
const CRATE_START_X = -160, CRATE_ONBELT_X = 180, CRATE_END_X = 1180;
const TIMER_Y = 396;

const TUTORIAL_KEY = "level26_tutorial_done";

// ─────────────────────────────────────────────────────────────────
// Round configuration
// ─────────────────────────────────────────────────────────────────
const ROUNDS = [
  { round: 1, wave: 1, type: "predict", timeLimit: 12000,
    decl: [{ kind: "string", name: "s", value: "sensor" }],
    crate: "s.length()", correct: 6,
    options: [
      { value: 6, tag: null },
      { value: 5, tag: "off_by_one_index_as_length" },
      { value: 7, tag: "off_by_one_plus" },
      { value: 0, tag: "method_returns_nothing" },
    ], concept: "fluent_count" },

  { round: 2, wave: 1, type: "predict", timeLimit: 12000,
    decl: [{ kind: "string", name: "id", value: "QC 9" }],
    crate: "id.length()", correct: 4,
    options: [
      { value: 4, tag: null },
      { value: 3, tag: "spaces_not_counted" },
      { value: 2, tag: "word_count_vs_char_count" },
      { value: 5, tag: "off_by_one_plus" },
    ], concept: "space_counts" },

  { round: 3, wave: 1, type: "predict", timeLimit: 12000,
    decl: [{ kind: "string", name: "s", value: "" }],
    crate: "s.length()", correct: 0,
    options: [
      { value: 0, tag: null },
      { value: 1, tag: "empty_string_confusion" },
      { value: "Error", tag: "empty_string_error_belief" },
      { value: -1, tag: "empty_returns_negative" },
    ], concept: "empty_string_fluent" },

  { round: 4, wave: 1, type: "predict", timeLimit: 12000,
    decl: [{ kind: "string", name: "s", value: " " }],
    crate: "s.length()", correct: 1,
    options: [
      { value: 1, tag: null },
      { value: 0, tag: "empty_string_confusion" },
      { value: "Error", tag: "empty_string_error_belief" },
      { value: 2, tag: "off_by_one_plus" },
    ], concept: "space_vs_empty" },

  { round: 5, wave: 1, type: "predict", timeLimit: 12000, hideTiles: true,
    decl: [{ kind: "string", name: "s", value: "don't" }],
    crate: "s.length()", correct: 5,
    options: [
      { value: 5, tag: null },
      { value: 4, tag: "symbols_not_counted" },
      { value: 6, tag: "quotes_counted" },
      { value: 3, tag: "letters_only_counted" },
    ], concept: "symbol_counts_fluent" },

  { round: 6, wave: 2, type: "judge", timeLimit: 10000,
    decl: [{ kind: "string", name: "s", value: "belt" }],
    crate: "int n = s.length();",
    correct: "valid", resultValue: 4, wrongTag: "method_call_doubt",
    concept: "valid_call" },

  { round: 7, wave: 2, type: "judge", timeLimit: 10000,
    decl: [{ kind: "string", name: "s", value: "belt" }],
    crate: "int n = s.length;",
    correct: "invalid", faultToken: "length",
    explanation: "Strings need parentheses: s.length()",
    wrongTag: "property_vs_method_syntax", concept: "missing_parens" },

  { round: 8, wave: 2, type: "judge", timeLimit: 10000,
    decl: [{ kind: "string", name: "s", value: "belt" }],
    crate: "int n = length(s);",
    correct: "invalid", faultToken: "length(s)",
    explanation: "Java has no standalone length() function — call it ON the String: s.length()",
    wrongTag: "python_len_function", concept: "dot_notation_required" },

  { round: 9, wave: 2, type: "judge", timeLimit: 10000,
    decl: [{ kind: "array", name: "arr", value: "{3, 1, 4}" }],
    crate: "int n = arr.length;",
    correct: "valid", resultValue: 3,
    wrongTag: "property_vs_method_syntax", concept: "array_property_contrast" },

  { round: 10, wave: 2, type: "judge", timeLimit: 10000,
    decl: [{ kind: "array", name: "arr", value: "{3, 1, 4}" }],
    crate: "int n = arr.length();",
    correct: "invalid", faultToken: "()",
    explanation: "Reverse trap! Arrays use .length WITHOUT parentheses. Only Strings use length().",
    wrongTag: "array_method_reverse", concept: "reverse_discrimination" },

  { round: 11, wave: 3, type: "expression", timeLimit: 9000,
    decl: [{ kind: "string", name: "s", value: "robot" }],
    crate: "s.length() - 1", correct: 4,
    options: [
      { value: 4, tag: null },
      { value: 5, tag: "ignored_arithmetic" },
      { value: 3, tag: "double_subtraction" },
      { value: "Error", tag: "method_in_expression_doubt" },
    ], steps: ["s.length() = 5", "5 - 1 = 4"], concept: "last_position_expression" },

  { round: 12, wave: 3, type: "expression", timeLimit: 9000,
    decl: [],
    crate: '"ab".length() + "cd".length()', correct: 4,
    options: [
      { value: 4, tag: null },
      { value: "22", tag: "string_concat_of_numbers" },
      { value: "abcd", tag: "concat_instead_of_add" },
      { value: 2, tag: "only_first_counted" },
    ], steps: ['"ab".length() = 2', '"cd".length() = 2', "2 + 2 = 4"], concept: "int_addition_of_lengths" },

  { round: 13, wave: 3, type: "expression", timeLimit: 9000,
    decl: [],
    crate: '("hi " + "bit").length()', correct: 6,
    options: [
      { value: 6, tag: null },
      { value: 5, tag: "spaces_not_counted" },
      { value: "2 + 3", tag: "length_before_concat" },
      { value: 7, tag: "off_by_one_plus" },
    ], steps: ['"hi " + "bit" = "hi bit"', '"hi bit".length() = 6'], concept: "concat_before_length" },

  { round: 14, wave: 3, type: "bughunt", timeLimit: 12000,
    decl: [{ kind: "string", name: "s", value: "scan" }],
    crateLines: ["for (int i = 0; i <= s.length(); i++) {", "    print(i);  }"],
    faultToken: "<=", fixedToken: "<",
    explanation: "i <= s.length() runs one step too far! Use i < s.length() — positions go 0 to length-1.",
    wrongTag: "loop_off_by_one_length", concept: "loop_bound_bug" },

  { round: 15, wave: 3, type: "bughunt", timeLimit: 12000,
    decl: [{ kind: "string", name: "pass", value: "abc12" }],
    crateLines: ["if (pass.length() = 5) {", "    unlock();  }"],
    faultToken: "=", fixedToken: "==",
    explanation: "Single = assigns. Comparison needs == . The compiler rejects this!",
    wrongTag: "assignment_vs_comparison", concept: "comparison_bug" },
];

const MISCONCEPTION_FEEDBACK = {
  off_by_one_index_as_length: "Careful! You counted like indices (0,1,2...). length() is a simple COUNT starting from 1.",
  off_by_one_plus: "That's one too many! Recount — don't add an extra for a phantom character.",
  quotes_counted: "The quotes are just wrapping paper — they are NOT inside the String!",
  word_count_vs_char_count: "length() counts CHARACTERS, not words! Every letter, space, and symbol adds one.",
  letters_only_counted: "Digits and symbols count too! length() doesn't care what KIND of character it is.",
  spaces_not_counted: "The space is invisible but REAL! Every space is one character.",
  symbols_not_counted: "Punctuation counts too! An apostrophe, a comma — every symbol is one character.",
  empty_string_confusion: 'An empty String "" has ZERO characters — length 0. But " " with a space has length 1!',
  empty_returns_negative: "length() can never be negative! The smallest possible length is 0.",
  empty_string_error_belief: "Calling length() on an empty String is perfectly legal — it just returns 0, no error!",
  method_call_doubt: "That call is exactly right — a variable, a dot, and length() with parentheses. Totally valid Java!",
  property_vs_method_syntax: "Tricky Java rule: Strings need length() with parentheses. Only ARRAYS use .length without them!",
  method_returns_nothing: "length() always returns a number — never zero by default! It genuinely counts the characters, so trust the count.",
  python_len_function: "That's Python thinking! Java calls the method ON the object: s.length() — dot first, then the method.",
  array_method_reverse: "Flip it! Strings: length() WITH parentheses. Arrays: .length WITHOUT. Two schemas — keep them separate!",
  ignored_arithmetic: "Don't forget the rest of the expression! length() is just the first part — apply the arithmetic after it.",
  double_subtraction: "Check your math — you subtracted twice somewhere. Only ONE operation follows the method call.",
  method_in_expression_doubt: "length() can absolutely be used inside a bigger expression — Java evaluates the method call first, then does the arithmetic.",
  string_concat_of_numbers: "length() returns an int — int + int is normal math, not gluing digits together!",
  concat_instead_of_add: '+ between two Strings GLUES them together (concatenation). But length() + length() is int + int — that\'s normal addition!',
  only_first_counted: "Both lengths matter! Add BOTH .length() calls together, not just the first one.",
  concat_before_length: "Parentheses first! The Strings join into one, THEN length() counts the result.",
  length_before_concat: "Parentheses first! The Strings join into one, THEN length() counts the result.",
  loop_off_by_one_length: "Classic off-by-one! length() is the COUNT, but positions stop at length - 1. Use < not <=.",
  assignment_vs_comparison: "= puts a value IN. == checks equality. Inside an if, you almost always want ==.",
  timeout: "Too slow — the crate fell! Trust your count and commit. Speed comes from confidence.",
};

const WAVE_INFO = {
  1: { title: "WAVE 1 — RAPID PREDICTION", brief: "Let's start simple — predict the count, fast!" },
  2: { title: "WAVE 2 — SYNTAX INSPECTION", brief: "Now judge the code itself — valid or invalid?" },
  3: { title: "WAVE 3 — EXPRESSIONS & BUG HUNT", brief: "Final stretch — combine, calculate, and hunt bugs!" },
};

export class Level26Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level26Scene" });
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
    this.beltOffset = 0;
    this.rollerAngle = 0;
    this.beltSpeed = 30;
    this.crateTween = null;
    this.roundStartTime = 0;
    this.roundAttempts = 0;
    this.crate = null;
    this.urgencyState = "normal";
    this.inputLocked = true;
    this.gameEnded = false;
    this._alive = true;
    this._bubble = null;
    this._keyHandler = null;
  }

  preload() {}

  create() {
    this._alive = true;
    this.events.once("shutdown", () => { this._alive = false; this._teardownKeys(); });

    const cam = this.cameras.main;
    const zoom = Math.min(this.scale.width / W, this.scale.height / H);
    cam.setZoom(zoom);
    cam.centerOn(W / 2, H / 2);
    cam.setBackgroundColor("#0a0d08");

    try { GameManager.incrementAttempt(25); } catch (_) {}

    this.createParticleTexture();
    this.createBackground();
    this.createFactoryWall();
    this.createOverheadPipes();
    this.createStatusBoard();
    this.createDust();
    this.createConveyor();
    this.createRejectionPit();
    this.createTimerBar();
    this.createReferencePanel();
    this.createHUD();
    this.createBit();

    cam.fadeIn(700, 4, 6, 8);
    this.checkTutorial();
  }

  update(time, delta) {
    this.updateBeltTexture(delta);
    this.updateRollers(delta);
    this.updateDust(time, delta);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // SETUP — background & environment
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l26_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l26_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x0a0d08).setDepth(0);
  }

  createFactoryWall() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x0d110b, 1);
    g.fillRect(0, 0, W, 290);
    [120, 550, 980].forEach((x) => {
      g.fillStyle(0x4fc3f7, 0.015);
      g.fillRect(x - 90, 60, 180, 110);
      g.lineStyle(2, 0x1f2a1a, 0.06);
      g.strokeRect(x - 90, 60, 180, 110);
      g.lineBetween(x, 60, x, 170);
      g.lineBetween(x - 90, 115, x + 90, 115);
    });
  }

  createOverheadPipes() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x141a10, 1);
    g.lineStyle(1, 0x1f2a1a, 0.3);
    g.fillRoundedRect(0, 30, W, 10, 3);
    g.strokeRoundedRect(0, 30, W, 10, 3);
    g.fillStyle(0x10150d, 1);
    g.fillRoundedRect(0, 52, W, 7, 3);
    g.strokeRoundedRect(0, 52, W, 7, 3);
    [300, 700, 1050].forEach((x) => {
      g.fillStyle(0x141a10, 1);
      g.fillRect(x - 7, 30, 14, 16);
    });
    this._steamJoint = { x: 700, y: 30 };
    this.time.addEvent({ delay: 6000, loop: true, callback: () => this._emitSteam() });
  }

  _emitSteam() {
    if (!this._alive) return;
    for (let i = 0; i < 3; i++) {
      const p = this.add.circle(this._steamJoint.x + Phaser.Math.Between(-6, 6), this._steamJoint.y, Phaser.Math.Between(3, 5), 0xb0bec5, 0.05).setDepth(2);
      this.tweens.add({ targets: p, y: p.y - 30, alpha: 0, duration: 1500, delay: i * 120, onComplete: () => p.destroy() });
    }
  }

  createStatusBoard() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x0d110b, 1);
    g.fillRect(1060, 90, 180, 90);
    g.lineStyle(1, 0x1f2a1a, 0.06);
    g.strokeRect(1060, 90, 180, 90);
    for (let i = 0; i < 3; i++) {
      g.fillStyle(0x3d4450, 0.05);
      g.fillRect(1075, 105 + i * 20, Phaser.Math.Between(60, 120), 2);
    }
    const led = this.add.circle(1225, 100, 2, 0x00e676, 0.15).setDepth(1);
    this.tweens.add({ targets: led, alpha: 0.3, duration: 2000, yoyo: true, repeat: -1 });
  }

  createDust() {
    this.dust = [];
    for (let i = 0; i < 8; i++) {
      const p = this.add.circle(Phaser.Math.Between(20, 1260), Phaser.Math.Between(0, 600), 1, C_AMBER, Phaser.Math.FloatBetween(0.02, 0.05)).setDepth(2);
      this.dust.push(p);
    }
  }

  updateDust(time, delta) {
    if (!this.dust) return;
    const step = 0.05 * (delta / 16.7);
    this.dust.forEach((p, i) => {
      p.y += step;
      p.x += Math.sin(time * 0.0007 + i) * 0.03;
      if (p.y > 600) { p.y = 0; p.x = Phaser.Math.Between(20, 1260); }
    });
  }

  // ══════════════════════════════════════════════════════════════
  // CONVEYOR BELT
  // ══════════════════════════════════════════════════════════════

  createConveyor() {
    const g = this.add.graphics().setDepth(5);
    g.fillStyle(0x12160e, 1);
    g.fillRect(0, BELT_Y, 1180, BELT_H);
    g.lineStyle(1, 0x1f2a1a, 1);
    g.strokeRect(0, BELT_Y, 1180, BELT_H);
    this.beltTickGraphics = this.add.graphics().setDepth(6);

    this.rollerGraphics = [];
    const rollerCount = 8;
    for (let i = 0; i < rollerCount; i++) {
      const x = 40 + i * ((1140) / (rollerCount - 1));
      const g2 = this.add.graphics().setDepth(6);
      this.rollerGraphics.push({ g: g2, x, y: 476 });
    }

    // hazard stripes near the pit
    const hz = this.add.graphics().setDepth(4);
    for (let x = 1150; x < 1290; x += 20) {
      hz.fillStyle(0xffd740, 0.06);
      hz.fillRect(x, 400, 10, 70);
    }
  }

  updateBeltTexture(delta) {
    this.beltOffset += this.beltSpeed * (delta / 1000);
    this.beltOffset %= 36;
    const g = this.beltTickGraphics;
    g.clear();
    g.lineStyle(1, 0x1f2a1a, 0.5);
    for (let x = -36 + this.beltOffset; x < 1180; x += 36) {
      g.lineBetween(x, BELT_Y, x, BELT_Y + BELT_H);
    }
  }

  updateRollers(delta) {
    this.rollerAngle += (this.beltSpeed / 13) * (delta / 1000);
    this.rollerGraphics.forEach(({ g, x, y }, i) => {
      g.clear();
      g.fillStyle(0x0d110b, 1);
      g.lineStyle(2, 0x1f2a1a, 1);
      g.fillCircle(x, y, 13);
      g.strokeCircle(x, y, 13);
      const a = this.rollerAngle + i * 0.7;
      g.fillStyle(0x1f2a1a, 1);
      g.fillCircle(x + Math.cos(a) * 6, y + Math.sin(a) * 6, 2);
    });
  }

  createRejectionPit() {
    const g = this.add.graphics().setDepth(4);
    g.fillStyle(0x000000, 0.55);
    g.fillRect(1180, BELT_Y - 20, 100, 90);

    this.rejectSignBg = this.add.graphics().setDepth(20);
    this.rejectSignBg.lineStyle(1, C_RED, 0.5);
    this.rejectSignBg.strokeRoundedRect(1160, 367, 110, 26, 5);
    this.rejectSignText = this.add.text(1215, 380, "REJECT", {
      font: "bold 11px Arial", color: HEX_RED,
    }).setOrigin(0.5).setAlpha(0.7).setDepth(20);
  }

  createTimerBar() {
    const g = this.add.graphics().setDepth(20);
    g.fillStyle(0x1f2a1a, 0.5);
    g.fillRect(CRATE_ONBELT_X, TIMER_Y, CRATE_END_X - CRATE_ONBELT_X, 5);
    this.timerBg = g;
    this.timerFill = this.add.graphics().setDepth(21);
  }

  updateTimerBar(remaining) {
    const w = Math.max(0, (CRATE_END_X - CRATE_ONBELT_X) * remaining);
    const color = remaining > 0.33 ? C_GREEN : remaining > 0.15 ? C_AMBER : C_RED;
    this.timerFill.clear();
    this.timerFill.fillStyle(color, 1);
    this.timerFill.fillRect(CRATE_ONBELT_X, TIMER_Y, w, 5);
  }

  // ══════════════════════════════════════════════════════════════
  // REFERENCE PANEL
  // ══════════════════════════════════════════════════════════════

  createReferencePanel() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0d1117, 1);
    g.fillRoundedRect(190, 130, 900, 120, 10);
    g.lineStyle(1, 0x21262d, 1);
    g.strokeRoundedRect(190, 130, 900, 120, 10);
    this.add.text(202, 140, "ACTIVE SPECIMENS", { font: "bold 10px Arial", color: "#3d4450" }).setDepth(11);
    this.refGroup = null;
  }

  _charMeta(ch) {
    if (ch === " ") return { display: "␣", color: HEX_MAGENTA, isSpace: true };
    if (/[0-9]/.test(ch)) return { display: ch, color: HEX_AMBER, isSpace: false };
    if (/[a-zA-Z]/.test(ch)) return { display: ch, color: HEX_CYAN, isSpace: false };
    return { display: ch, color: "#ff9800", isSpace: false };
  }

  buildMiniTileStrip(str, x, y) {
    const c = this.add.container(x, y).setDepth(12);
    const tw = 22, th = 26, gap = 3;
    str.split("").forEach((ch, i) => {
      const meta = this._charMeta(ch);
      const tc = this.add.container(i * (tw + gap), 0);
      const bg = this.add.graphics();
      bg.fillStyle(0x0a0e14, 1);
      bg.lineStyle(1, 0x2a3a4a, 1);
      bg.fillRoundedRect(-tw / 2, -th / 2, tw, th, 3);
      bg.strokeRoundedRect(-tw / 2, -th / 2, tw, th, 3);
      const txt = this.add.text(0, 0, meta.display, { font: "bold 12px Courier New", color: meta.color }).setOrigin(0.5);
      if (meta.isSpace) txt.setAlpha(0.85).setFontSize(10);
      tc.add([bg, txt]);
      c.add(tc);
    });
    return c;
  }

  _syntaxTokens(line) {
    const tokens = [];
    const re = /("(?:[^"\\]|\\.)*")|(\bint\b|\bif\b|\bfor\b|\bString\b)|(\blength\b)|([A-Za-z_]\w*(?=\())|(\b-?\d+\b)|(==|!=|<=|>=|\+\+|--)|([+\-=<>!])|([(){}\[\];.,])/g;
    let last = 0, m;
    const plain = (t) => t && tokens.push({ t, c: "#e0e0e0" });
    while ((m = re.exec(line))) {
      if (m.index > last) plain(line.slice(last, m.index));
      if (m[1]) tokens.push({ t: m[1], c: HEX_GREEN });
      else if (m[2]) tokens.push({ t: m[2], c: HEX_MAGENTA });
      else if (m[3]) tokens.push({ t: m[3], c: HEX_AMBER });
      else if (m[4]) tokens.push({ t: m[4], c: "#4fc3f7" });
      else if (m[5]) tokens.push({ t: m[5], c: HEX_AMBER });
      else if (m[6]) tokens.push({ t: m[6], c: "#ff8a65" });
      else if (m[7]) tokens.push({ t: m[7], c: "#ff8a65" });
      else if (m[8]) tokens.push({ t: m[8], c: HEX_GRAY });
      last = m.index + m[0].length;
    }
    if (last < line.length) plain(line.slice(last));
    return tokens.length ? tokens : [{ t: line, c: HEX_CYAN }];
  }

  _renderTokenLine(x, y, line, fontSize = 14) {
    const c = this.add.container(x, y);
    let cx = 0;
    this._syntaxTokens(line).forEach((tok) => {
      const t = this.add.text(cx, 0, tok.t, { font: `${fontSize}px Courier New`, color: tok.c }).setOrigin(0, 0.5);
      c.add(t);
      cx += t.width;
    });
    return { container: c, width: cx };
  }

  updateReferencePanel(decls, hideTiles) {
    if (this.refGroup) { this.refGroup.forEach((o) => o.destroy()); }
    this.refGroup = [];
    if (!decls || decls.length === 0) {
      const t = this.add.text(640, 190, "(literals used directly — no declarations)", {
        font: "italic 13px Arial", color: "#3d4450",
      }).setOrigin(0.5).setDepth(11);
      this.refGroup.push(t);
      return;
    }
    decls.forEach((d, i) => {
      const y = 172 + i * 42;
      let declLine;
      if (d.kind === "string") declLine = `String ${d.name} = "${d.value}";`;
      else declLine = `int[] ${d.name} = ${d.value};`;
      const { container } = this._renderTokenLine(210, y, declLine, 14);
      container.setDepth(11).setAlpha(0);
      this.tweens.add({ targets: container, alpha: 1, duration: 150 });
      this.refGroup.push(container);

      if (d.kind === "string" && !hideTiles) {
        const strip = this.buildMiniTileStrip(d.value, 210, y + 24);
        strip.setAlpha(0);
        this.tweens.add({ targets: strip, alpha: 1, duration: 150, delay: 60 });
        this.refGroup.push(strip);
      } else if (d.kind === "string" && hideTiles) {
        const hint = this.add.text(210, y + 22, "(count mentally — no tiles shown)", {
          font: "italic 10px Arial", color: "#3d4450",
        }).setDepth(11).setAlpha(0);
        this.tweens.add({ targets: hint, alpha: 1, duration: 150, delay: 60 });
        this.refGroup.push(hint);
      }
    });
  }

  // ══════════════════════════════════════════════════════════════
  // HUD
  // ══════════════════════════════════════════════════════════════

  createHUD() {
    const g = this.add.graphics().setDepth(50);
    g.fillStyle(0x0a0e0a, 0.93);
    g.fillRect(0, 0, W, 64);
    g.lineStyle(1, 0x1f2a1a, 1);
    g.lineBetween(0, 64, W, 64);

    this.add.text(20, 14, "THE INSPECTION LINE", { font: "bold 15px Arial", color: "#b0bec5" }).setDepth(51);
    this.add.text(20, 36, "Tuning Phase — String Methods: length()", { font: "11px Arial", color: "#546e7a" }).setDepth(51);

    this.waveText = this.add.text(640, 12, "WAVE 1 / 3", { font: "bold 14px Arial", color: HEX_AMBER }).setOrigin(0.5).setDepth(51);
    this.waveSquares = [];
    for (let i = 0; i < 5; i++) {
      const sq = this.add.rectangle(640 - 44 + i * 22, 40, 10, 10, 0x000000, 0).setStrokeStyle(1, C_GRAY).setDepth(51);
      this.waveSquares.push(sq);
    }

    this.add.text(1060, 12, "SCORE", { font: "9px Arial", color: "#546e7a" }).setDepth(51);
    this.scoreText = this.add.text(1060, 24, "0", { font: "bold 20px Arial", color: "#ffffff" }).setDepth(51);
    this.comboText = this.add.text(1150, 30, "×1", { font: "bold 16px Arial", color: HEX_AMBER }).setDepth(51);

    this.lifeIcons = [];
    for (let i = 0; i < 3; i++) {
      const lg = this.add.graphics({ x: 1195 + i * 26, y: 30 }).setDepth(51);
      lg.lineStyle(2, C_CYAN, 1);
      lg.strokeRoundedRect(-7, -7, 14, 14, 2);
      lg.lineBetween(-4, 0, -1, 3);
      lg.lineBetween(-1, 3, 4, -4);
      this.lifeIcons.push(lg);
    }
  }

  updateWaveIndicator(indexInWave, result) {
    const sq = this.waveSquares[indexInWave];
    if (!sq) return;
    sq.setFillStyle(result ? C_GREEN : C_RED, 1);
    sq.setStrokeStyle(1, result ? C_GREEN : C_RED);
  }

  // ══════════════════════════════════════════════════════════════
  // BIT — mascot (foreman variant, fixed position)
  // ══════════════════════════════════════════════════════════════

  createBit() {
    const c = this.add.container(90, 560).setDepth(60);
    const g = this.add.graphics();
    g.lineStyle(2, 0x78909c, 1);
    g.lineBetween(0, -17, 0, -32);
    g.fillStyle(0x37474f, 1);
    g.fillRoundedRect(-20, -17, 40, 35, 10);
    const tip = this.add.circle(0, -32, 3, 0xffd740);
    const eye = this.add.circle(0, 0, 8, 0x00e5ff);
    const pupil = this.add.circle(0, 0, 3, 0xffffff);
    // hard hat
    const hat = this.add.graphics();
    hat.fillStyle(C_AMBER, 0.9);
    hat.slice(0, -17, 14, Math.PI, 0, false);
    hat.fillPath();
    hat.fillRect(-11, -19, 22, 3);
    c.add([g, hat, tip, eye, pupil]);
    this.tweens.add({ targets: tip, alpha: 0.3, duration: 900, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: c, y: "+=3", duration: 2000, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
    this.bit = c;
  }

  bitSay(text) {
    this.hideBubble();
    const inner = this.add.text(0, 0, text, {
      font: "13px Arial", color: "#e0e0e0", wordWrap: { width: 330 },
    });
    const bw = Math.min(inner.width, 330) + 30, bh = inner.height + 24;
    inner.setText("");
    const bx = Phaser.Math.Clamp(this.bit.x + 30, 20, W - bw - 20);
    const by = Phaser.Math.Clamp(this.bit.y - bh - 20, 80, H - bh - 20);
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
        delay: 22, repeat: Math.max(0, text.length - 1),
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
    await this.bitSay(message);
    if (!this._alive) return;
    await Promise.race([this.waitForClick(), this.delay(2500)]);
    this.hideBubble();
  }

  // ══════════════════════════════════════════════════════════════
  // TUTORIAL
  // ══════════════════════════════════════════════════════════════

  checkTutorial() {
    let done = false;
    try { done = localStorage.getItem(TUTORIAL_KEY) === "true"; } catch (_) {}
    if (done) {
      this.time.delayedCall(300, () => this.startWave(1));
    } else {
      this.runTutorial();
    }
  }

  async runTutorial() {
    const A = () => this._alive;
    this.updateReferencePanel([{ kind: "string", name: "s", value: "demo" }], false);
    await this.delay(400); if (!A()) return;
    await this.bitSay("Back on duty, Analyst! This is the Inspection Line. Crates of Strings roll toward the reject pit — inspect each one BEFORE it falls. Speed matters now!");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4000)]); if (!A()) return;
    this.hideBubble();

    // demo crate rolling in slowly
    const demoCrate = this._buildCrateVisual(300, "s.length()", null);
    demoCrate.container.setPosition(CRATE_START_X, CRATE_Y);
    await new Promise((res) => {
      this.tweens.add({ targets: demoCrate.container, x: CRATE_ONBELT_X, duration: 900, ease: "Cubic.easeOut", onComplete: () => res() });
    });
    if (!A()) return;

    const arrow1 = this.createAnnotation(CRATE_ONBELT_X + 60, CRATE_Y - 100, "the crate is your TIMER", HEX_AMBER, { x: CRATE_ONBELT_X + 60, y: CRATE_Y - 76 });
    const arrow2 = this.createAnnotation(1215, 330, "answer before it falls!", HEX_RED, { x: 1215, y: 366 });
    await this.bitSay("Answer while the crate is still on the belt. The faster you inspect, the bigger the bonus. Ready?");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4000)]); if (!A()) return;
    this.hideBubble();
    [arrow1, arrow2].forEach((a) => this.tweens.add({ targets: a, alpha: 0, duration: 250, onComplete: () => a.destroy() }));
    demoCrate.container.destroy();

    try { localStorage.setItem(TUTORIAL_KEY, "true"); } catch (_) {}
    this.startWave(1);
  }

  // ══════════════════════════════════════════════════════════════
  // WAVE MANAGEMENT
  // ══════════════════════════════════════════════════════════════

  async startWave(waveNumber) {
    if (!this._alive || this.gameEnded) return;
    this.currentWave = waveNumber;
    this.beltSpeed = 25 + waveNumber * 8;
    this.waveText.setText(`WAVE ${waveNumber} / 3`);
    this.waveSquares.forEach((sq) => sq.setFillStyle(0x000000, 0).setStrokeStyle(1, C_GRAY));

    await this.showWaveBanner(WAVE_INFO[waveNumber].title);
    if (!this._alive || this.gameEnded) return;
    await this.bitSay(WAVE_INFO[waveNumber].brief);
    if (!this._alive || this.gameEnded) return;
    await this.delay(600);
    this.hideBubble();

    const firstRoundIdx = ROUNDS.findIndex((r) => r.wave === waveNumber);
    this.startRound(firstRoundIdx);
  }

  showWaveBanner(text) {
    return new Promise((res) => {
      const banner = this.add.container(-700, 355).setDepth(80);
      const g = this.add.graphics();
      g.fillStyle(0x0a0e0a, 0.95);
      g.fillRect(-700, -35, 1400, 70);
      const t = this.add.text(0, 0, text, { font: "bold 24px Arial", color: HEX_AMBER }).setOrigin(0.5);
      banner.add([g, t]);
      this.tweens.add({
        targets: banner, x: 640, duration: 700, ease: "Cubic.easeOut",
        onComplete: () => {
          this.time.delayedCall(400, () => {
            this.tweens.add({ targets: banner, x: 1980, duration: 700, ease: "Cubic.easeIn", onComplete: () => { banner.destroy(); res(); } });
          });
        },
      });
    });
  }

  // ══════════════════════════════════════════════════════════════
  // CRATE — visual & timer
  // ══════════════════════════════════════════════════════════════

  _buildCrateVisual(width, contentLine, roundNum, contentLines = null) {
    const height = 150;
    const container = this.add.container(CRATE_START_X, CRATE_Y).setDepth(30);
    const body = this.add.graphics();
    const drawBody = (stroke) => {
      body.clear();
      body.fillStyle(0x10140c, 1);
      body.fillRoundedRect(-width / 2, -height / 2, width, height, 8);
      body.lineStyle(2, stroke, 1);
      body.strokeRoundedRect(-width / 2, -height / 2, width, height, 8);
    };
    drawBody(0x4a5a3a);
    const glow = this.add.rectangle(0, 0, width + 16, height + 16, C_AMBER, 0);
    container.add([glow, body]);

    // rivets
    [-width / 2 + 10, width / 2 - 10].forEach((rx) => {
      const r = this.add.circle(rx, -height / 2 + 10, 2, 0x4a5a3a);
      container.add(r);
    });
    // barcode decoration
    for (let i = 0; i < 8; i++) {
      const bw = Phaser.Math.Between(1, 3);
      const bl = this.add.rectangle(-width / 2 + 14 + i * 4, -height / 2 + 24, bw, 14, 0x4a5a3a, 0.4).setOrigin(0, 0.5);
      container.add(bl);
    }
    if (roundNum !== null) {
      const label = this.add.text(width / 2 - 10, -height / 2 + 10, `SPEC-${roundNum}`, {
        font: "bold 9px Courier New", color: "#546e7a",
      }).setOrigin(1, 0.5);
      container.add(label);
    }

    let tokenLines = null;
    if (contentLines) {
      tokenLines = contentLines.map((line, i) => {
        const y = (i - (contentLines.length - 1) / 2) * 22;
        return this._renderClickableTokenLine(container, 0, y, line, width - 40);
      });
    } else {
      let fontSize = 15;
      let { container: lc, width: lw } = this._renderTokenLine(0, 0, contentLine, fontSize);
      if (lw > width - 40) {
        lc.destroy();
        fontSize = 13;
        ({ container: lc, width: lw } = this._renderTokenLine(0, 0, contentLine, fontSize));
      }
      lc.x = -lw / 2;
      container.add(lc);
    }

    return { container, glow, body, drawBody, width, height, tokenLines };
  }

  _renderClickableTokenLine(parent, x, y, line, maxWidth) {
    const tokens = this._syntaxTokens(line);
    let totalW = 0;
    const measured = tokens.map((tok) => {
      const t = this.add.text(0, 0, tok.t, { font: "13px Courier New", color: tok.c });
      const w = t.width;
      t.destroy();
      totalW += w;
      return w;
    });
    let cx = x - totalW / 2;
    const results = [];
    tokens.forEach((tok, i) => {
      const t = this.add.text(cx, y, tok.t, { font: "13px Courier New", color: tok.c }).setOrigin(0, 0.5);
      const hitW = Math.max(measured[i], 30), hitH = 30;
      t.setInteractive(new Phaser.Geom.Rectangle(-((hitW - measured[i]) / 2), -hitH / 2, hitW, hitH), Phaser.Geom.Rectangle.Contains);
      t.input.cursor = "pointer";
      parent.add(t);
      results.push({ text: t, raw: tok.t, baseColor: tok.c });
      cx += measured[i];
    });
    return results;
  }

  async spawnCrate(config) {
    const isBug = config.type === "bughunt";
    const width = isBug ? 420 : 300;
    const crate = isBug
      ? this._buildCrateVisual(width, null, config.round, config.crateLines)
      : this._buildCrateVisual(width, config.crate, config.round);
    this.crate = crate;
    this.roundElements.push(crate.container);

    await new Promise((res) => {
      this.tweens.add({ targets: crate.container, x: CRATE_ONBELT_X, duration: 500, ease: "Cubic.easeOut", onComplete: () => res() });
    });
  }

  launchCrate(timeLimitMs) {
    this.urgencyState = "normal";
    this.roundStartTime = this.time.now;
    this.crateTween = this.tweens.add({
      targets: this.crate.container, x: CRATE_END_X, duration: timeLimitMs, ease: "Linear",
      onUpdate: () => this.crateUrgencyCheck(),
      onComplete: () => {
        if (this._alive && !this.gameEnded && this.crate) this.onCrateTimeout();
      },
    });
  }

  crateUrgencyCheck() {
    if (!this.crateTween || !this.crate) return;
    const progress = this.crateTween.progress;
    const remaining = 1 - progress;
    this.updateTimerBar(remaining);

    let state = "normal";
    if (remaining < 0.15) state = "danger";
    else if (remaining < 0.33) state = "warn";

    if (state !== this.urgencyState) {
      this.urgencyState = state;
      if (state === "warn") {
        this.crate.drawBody(C_AMBER);
        this.tweens.add({ targets: this.crate.glow, fillAlpha: 0.1, duration: 400, yoyo: true, repeat: -1 });
        this.crate.glow.setFillStyle(C_AMBER, 0);
      } else if (state === "danger") {
        this.crate.drawBody(C_RED);
        this.crate.glow.setFillStyle(C_RED, 0);
        this.tweens.add({ targets: this.crate.glow, fillAlpha: 0.15, duration: 250, yoyo: true, repeat: -1 });
        // vibrate via rotation, not x — x is already driven by the main position tween
        this.tweens.add({ targets: this.crate.container, angle: 1.2, duration: 40, yoyo: true, repeat: -1 });
      }
    }

    if (this.crate.container.x > 980) {
      this.rejectSignBg.setAlpha(0.4 + 0.4 * Math.sin(this.time.now * 0.006));
      this.rejectSignText.setAlpha(0.4 + 0.4 * Math.sin(this.time.now * 0.006));
    }
  }

  stopCrate() {
    if (this.crateTween) { this.crateTween.stop(); this.crateTween = null; }
    this.tweens.killTweensOf(this.crate?.container);
    this.tweens.killTweensOf(this.crate?.glow);
    if (this.crate) this.crate.container.setAngle(0);
  }

  stampCrate(result) {
    if (!this.crate) return;
    const color = result === "PASS" ? HEX_GREEN : HEX_RED;
    const stamp = this.add.text(0, 0, result, {
      font: "bold 30px Arial", color,
    }).setOrigin(0.5).setScale(2).setAngle(-10).setAlpha(0).setDepth(2);
    this.crate.container.add(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 200, ease: "Cubic.easeOut" });
  }

  async cratePassOff() {
    if (!this.crate) return;
    const rail = this.add.rectangle(1230, BELT_Y + BELT_H / 2, 100, 4, C_GREEN, 0.3).setDepth(19);
    this.roundElements.push(rail);
    await new Promise((res) => {
      this.tweens.add({
        targets: this.crate.container, x: 1400, duration: 500, ease: "Cubic.easeIn",
        onComplete: () => res(),
      });
    });
  }

  async crateFallIntoPit() {
    if (!this.crate) return;
    const cx = this.crate.container.x, cy = this.crate.container.y;
    await new Promise((res) => {
      this.tweens.add({
        targets: this.crate.container, angle: 35, y: cy + 200, alpha: 0, duration: 400, ease: "Cubic.easeIn",
        onComplete: () => res(),
      });
    });
    const debris = this.add.particles(cx, cy + 60, "l26_dot", {
      speed: { min: 40, max: 120 }, angle: { min: 60, max: 120 },
      scale: { start: 0.6, end: 0 }, lifespan: 400, tint: 0x4a5a3a, emitting: false,
    }).setDepth(20);
    debris.explode(6);
    this.time.delayedCall(500, () => debris.destroy());
  }

  // ══════════════════════════════════════════════════════════════
  // GAMEPLAY — round system
  // ══════════════════════════════════════════════════════════════

  async startRound(index) {
    if (!this._alive || this.gameEnded) return;
    this.currentRound = index;
    const cfg = ROUNDS[index];
    this.roundAttempts = 0;
    this.inputLocked = true;
    this.clearRound();

    this.updateReferencePanel(cfg.decl, !!cfg.hideTiles);
    await this.spawnCrate(cfg);
    if (!this._alive || this.gameEnded) return;

    this.renderChallenge(cfg);
    this.launchCrate(cfg.timeLimit);
    this.inputLocked = false;
  }

  clearRound() {
    this._teardownKeys();
    this.hideBubble();
    this.optionBubbles?.forEach((b) => b.destroy());
    this.optionBubbles = [];
    this.roundElements.forEach((e) => { if (e && e.destroy) e.destroy(); });
    this.roundElements = [];
    this.crate = null;
    this.stopCrate();
    this.rejectSignBg.setAlpha(0.5);
    this.rejectSignText.setAlpha(0.7);
  }

  renderChallenge(cfg) {
    switch (cfg.type) {
      case "predict": this.setupPredict(cfg); break;
      case "judge": this.setupJudge(cfg); break;
      case "expression": this.setupExpression(cfg); break;
      case "bughunt": this.setupBugHunt(cfg); break;
    }
  }

  // ══════════════════════════════════════════════════════════════
  // OPTION BUBBLES (predict / expression)
  // ══════════════════════════════════════════════════════════════

  showOptionBubbles(options, onSelect) {
    this.optionBubbles = [];
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
      const c = this.add.container(bx + w / 2, 560).setDepth(25);
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
      c.on("pointerover", () => { if (!this.inputLocked) draw(0xffffff); });
      c.on("pointerout", () => { if (c.getData("state") !== "locked") draw(C_CYAN); });
      c.on("pointerdown", () => {
        if (this.inputLocked) return;
        this.inputLocked = true;
        c.setData("state", "locked");
        onSelect(opt, c, draw);
      });
      this.roundElements.push(c);
      this.optionBubbles.push(c);
    });
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE A — PREDICT
  // ══════════════════════════════════════════════════════════════

  setupPredict(cfg) {
    this.showOptionBubbles(cfg.options, (opt, bubble, draw) => {
      const correct = opt.value === cfg.correct;
      this._resolveAnswer(cfg, correct, opt.value, opt.tag, () => {
        draw(correct ? C_GREEN : C_RED);
        if (!correct) {
          this.tweens.add({ targets: bubble, x: bubble.x + 6, duration: 45, yoyo: true, repeat: 5 });
          const correctBubble = this.optionBubbles.find((b) => b.getData("value") === cfg.correct);
          if (correctBubble) correctBubble.getData("draw")(C_GREEN);
        }
      });
    });
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE B — JUDGE
  // ══════════════════════════════════════════════════════════════

  showJudgmentButtons(onSelect) {
    const mk = (x, label, color, key) => {
      const c = this.add.container(x, 570).setDepth(25);
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
      const t = this.add.text(0, -6, label, { font: "bold 15px Arial", color: hex }).setOrigin(0.5);
      const keyHint = this.add.text(0, 16, `[${key}]`, { font: "10px Arial", color: "#546e7a" }).setOrigin(0.5);
      c.add([g, t, keyHint]);
      c.setSize(190, 54);
      c.setInteractive({ useHandCursor: true });
      c.on("pointerover", () => { if (!this.inputLocked) { draw(0.08); c.setScale(1.03); } });
      c.on("pointerout", () => { draw(0); c.setScale(1); });
      c.on("pointerdown", () => {
        if (this.inputLocked) return;
        this.inputLocked = true;
        onSelect(key === "V" ? "valid" : "invalid");
      });
      this.roundElements.push(c);
      this.optionBubbles.push(c);
      return c;
    };
    mk(480, "✓ SHIP IT", C_GREEN, "V");
    mk(800, "✗ REJECT", C_RED, "X");

    this._keyHandler = (e) => {
      if (this.inputLocked) return;
      if (e.key.toLowerCase() === "v") { this.inputLocked = true; onSelect("valid"); }
      else if (e.key.toLowerCase() === "x") { this.inputLocked = true; onSelect("invalid"); }
    };
    this.input.keyboard.on("keydown", this._keyHandler);
  }

  _teardownKeys() {
    if (this._keyHandler) {
      this.input.keyboard.off("keydown", this._keyHandler);
      this._keyHandler = null;
    }
  }

  setupJudge(cfg) {
    this.showJudgmentButtons((choice) => {
      const correct = choice === cfg.correct;
      this._teardownKeys();
      this._resolveAnswer(cfg, correct, choice, correct ? null : cfg.wrongTag, async () => {
        if (cfg.correct === "valid") {
          const val = this.add.text(this.crate.container.x, CRATE_Y - 100, `= ${cfg.resultValue}`, {
            font: "bold 18px Courier New", color: HEX_GREEN,
          }).setOrigin(0.5).setDepth(35).setAlpha(0);
          this.roundElements.push(val);
          this.tweens.add({ targets: val, alpha: 1, y: CRATE_Y - 120, duration: 400 });
        } else {
          this.revealFaultToken(cfg);
        }
      });
    });
  }

  revealFaultToken(cfg) {
    if (!cfg.faultToken) return;
    const anno = this.add.text(640, 300, cfg.explanation, {
      font: "bold 12px Arial", color: HEX_RED, wordWrap: { width: 700 },
    }).setOrigin(0.5).setDepth(35).setAlpha(0);
    this.roundElements.push(anno);
    this.tweens.add({ targets: anno, alpha: 1, duration: 250 });
    const line = this.add.rectangle(this.crate.container.x, CRATE_Y + 30, 60, 2, C_RED).setDepth(35).setAlpha(0);
    this.roundElements.push(line);
    this.tweens.add({ targets: line, alpha: 1, duration: 200 });
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE C — EXPRESSION
  // ══════════════════════════════════════════════════════════════

  setupExpression(cfg) {
    this.showOptionBubbles(cfg.options, (opt, bubble, draw) => {
      const correct = opt.value === cfg.correct;
      this._resolveAnswer(cfg, correct, opt.value, opt.tag, async () => {
        draw(correct ? C_GREEN : C_RED);
        if (!correct) {
          this.tweens.add({ targets: bubble, x: bubble.x + 6, duration: 45, yoyo: true, repeat: 5 });
          const correctBubble = this.optionBubbles.find((b) => b.getData("value") === cfg.correct);
          if (correctBubble) correctBubble.getData("draw")(C_GREEN);
        }
        await this.showEvaluationSteps(cfg.steps);
      });
    });
  }

  async showEvaluationSteps(steps) {
    if (!steps) return;
    for (let i = 0; i < steps.length; i++) {
      if (!this._alive) return;
      const t = this.add.text(this.crate.container.x, CRATE_Y - 90 - i * 26, steps[i], {
        font: "bold 14px Courier New", color: HEX_AMBER,
      }).setOrigin(0.5).setDepth(35).setAlpha(0);
      this.roundElements.push(t);
      this.tweens.add({ targets: t, alpha: 1, duration: 200 });
      await this.delay(400);
    }
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE D — BUG HUNT
  // ══════════════════════════════════════════════════════════════

  setupBugHunt(cfg) {
    const strip = this.add.text(640, 265, "CLICK THE BUG", {
      font: "bold 13px Arial", color: HEX_MAGENTA,
    }).setOrigin(0.5).setDepth(25);
    this.roundElements.push(strip);
    this.tweens.add({ targets: strip, alpha: 0.4, duration: 700, yoyo: true, repeat: -1 });

    const lines = this.crate.tokenLines;
    lines.forEach((line) => {
      line.forEach((tok) => {
        tok.text.on("pointerdown", () => {
          if (this.inputLocked) return;
          this.inputLocked = true;
          this.onTokenClicked(tok, lines, cfg);
        });
      });
    });
  }

  onTokenClicked(token, lines, cfg) {
    const correct = token.raw === cfg.faultToken;
    this._teardownKeys();
    this._resolveAnswer(cfg, correct, token.raw, correct ? null : cfg.wrongTag, async () => {
      if (correct) {
        token.text.setColor(HEX_RED);
        await this.delay(150);
        if (!this._alive) return;
        token.text.setColor(HEX_GREEN);
        const strike = this.add.rectangle(token.text.x + token.text.width / 2, token.text.y, token.text.width + 4, 2, C_RED).setDepth(36);
        this.roundElements.push(strike);
        const fixed = this.add.text(token.text.x, token.text.y - 20, cfg.fixedToken, {
          font: "bold 13px Courier New", color: HEX_GREEN,
        }).setOrigin(0, 0.5).setAlpha(0).setDepth(36);
        this.roundElements.push(fixed);
        this.tweens.add({ targets: fixed, alpha: 1, duration: 250 });
      } else {
        this.tweens.add({ targets: token.text, x: token.text.x + 4, duration: 40, yoyo: true, repeat: 5 });
        const realBug = lines.flat().find((t) => t.raw === cfg.faultToken);
        if (realBug) {
          realBug.text.setColor(HEX_RED);
          this.tweens.add({ targets: realBug.text, scale: 1.3, duration: 200, yoyo: true, repeat: 2 });
        }
        this.revealFaultToken(cfg);
      }
    });
  }

  // ══════════════════════════════════════════════════════════════
  // ANSWER RESOLUTION
  // ══════════════════════════════════════════════════════════════

  async _resolveAnswer(cfg, correct, selected, tag, revealFn) {
    this.stopCrate();
    const elapsed = this.time.now - this.roundStartTime;
    const timePctUsed = Phaser.Math.Clamp(elapsed / cfg.timeLimit, 0, 1);
    this.logAttempt(cfg, correct, selected, tag, elapsed, timePctUsed);

    this.stampCrate(correct ? "PASS" : "FAIL");
    if (revealFn) await revealFn();
    if (!this._alive) return;
    await this.delay(400);
    if (!this._alive) return;

    if (correct) await this.cratePassOff();
    else await this.crateFallIntoPit();
    if (!this._alive) return;

    const indexInWave = (cfg.round - 1) % 5;
    this.updateWaveIndicator(indexInWave, correct);

    if (correct) this.onCorrectAnswer(cfg, timePctUsed);
    else await this.onIncorrectAnswer(cfg, tag);
  }

  async onCrateTimeout() {
    if (!this.crate || this.gameEnded) return;
    this.inputLocked = true;
    const cfg = ROUNDS[this.currentRound];
    this._teardownKeys();
    this.stopCrate();
    this.logAttempt(cfg, false, null, "timeout", cfg.timeLimit, 1);
    this.stampCrate("FAIL");
    await this.delay(200);
    if (!this._alive) return;
    await this.crateFallIntoPit();
    if (!this._alive) return;
    const indexInWave = (cfg.round - 1) % 5;
    this.updateWaveIndicator(indexInWave, false);
    await this.onIncorrectAnswer(cfg, "timeout");
  }

  logAttempt(cfg, correct, selected, tag, timeMs, timePctUsed) {
    this.roundAttempts++;
    this.totalTimePctUsed += timePctUsed;
    this.attemptLog.push({
      round: cfg.round, wave: cfg.wave, type: cfg.type, concept: cfg.concept, correct,
      selectedAnswer: selected, misconceptionTag: tag || null,
      timeMs: Math.round(timeMs), timePctUsed, attemptNumber: this.roundAttempts,
    });
  }

  onCorrectAnswer(cfg, timePctUsed) {
    if (this.gameEnded) return;
    this.inputLocked = true;
    if (this.roundAttempts === 1) this.correctFirstTry++;
    this.updateCombo(true);
    const multiplier = Math.min(this.combo, 5);
    let points = 100 * multiplier;
    const remaining = 1 - timePctUsed;
    if (remaining > 0.6) { points += 50; this.fastBonusCount++; this.createFloatingText(640, 300, "⚡ FAST +50", HEX_AMBER, "bold 15px Arial"); }
    else if (remaining > 0.3) { points += 25; this.fastBonusCount++; this.createFloatingText(640, 300, "⚡ FAST +25", HEX_AMBER, "bold 15px Arial"); }
    this.updateScore(points);

    this.time.delayedCall(700, () => {
      if (!this._alive || this.gameEnded) return;
      this.advanceRound();
    });
  }

  async onIncorrectAnswer(cfg, tag) {
    if (this.gameEnded) return;
    this.inputLocked = true;
    this.updateCombo(false);
    this.screenShake(0.004, 180);
    const dead = this.loseLife();
    if (dead) {
      this.time.delayedCall(500, () => this.gameOver());
      return;
    }
    await this.showBitFeedback(MISCONCEPTION_FEEDBACK[tag] || "Inspect carefully — check the count, the syntax, and the logic.");
    if (!this._alive || this.gameEnded) return;
    this.time.delayedCall(500, () => {
      if (!this._alive || this.gameEnded) return;
      this.advanceRound();
    });
  }

  advanceRound() {
    const next = this.currentRound + 1;
    if (next >= ROUNDS.length) { this.levelComplete(); return; }
    if (ROUNDS[next].wave !== ROUNDS[this.currentRound].wave) {
      this.startWave(ROUNDS[next].wave);
    } else {
      this.startRound(next);
    }
  }

  updateScore(points) {
    this.score += points;
    const counter = { v: this.displayScore };
    this.tweens.add({
      targets: counter, v: this.score, duration: 300,
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
    const p = this.add.particles(x + 10, y + 8, "l26_dot", {
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
    this.tweens.add({ targets: t, y: y - 34, alpha: 0, duration: 900, ease: "Cubic.easeOut", onComplete: () => t.destroy() });
    return t;
  }

  createAnnotation(x, y, text, colorHex, arrowTarget = null) {
    const c = this.add.container(0, 0).setDepth(70).setAlpha(0);
    const txt = this.add.text(x, y, text, { font: "bold 13px Arial", color: colorHex }).setOrigin(0.5);
    c.add(txt);
    if (arrowTarget) {
      const g = this.add.graphics();
      const color = Phaser.Display.Color.HexStringToColor(colorHex).color;
      g.lineStyle(2, color, 1);
      g.lineBetween(arrowTarget.x, y + 10, arrowTarget.x, arrowTarget.y - 8);
      g.fillStyle(color, 1);
      g.fillTriangle(arrowTarget.x, arrowTarget.y, arrowTarget.x - 5, arrowTarget.y - 9, arrowTarget.x + 5, arrowTarget.y - 9);
      c.add(g);
    }
    this.tweens.add({ targets: c, alpha: 1, duration: 300 });
    return c;
  }

  createConfetti(x, y, count = 30) {
    const p = this.add.particles(x, y, "l26_dot", {
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

  async lineCelebration() {
    this.beltSpeed = 120;
    this.rejectSignText.setText("CLEAR!").setColor(HEX_GREEN);
    this.rejectSignBg.clear();
    this.rejectSignBg.lineStyle(1, C_GREEN, 0.7);
    this.rejectSignBg.strokeRoundedRect(1160, 367, 110, 26, 5);
    for (let i = 0; i < 3; i++) {
      const crate = this._buildCrateVisual(120, "PASS", null);
      crate.container.setPosition(-100, CRATE_Y);
      crate.drawBody(C_GREEN);
      this.time.delayedCall(i * 250, () => {
        if (!this._alive) return;
        this.tweens.add({ targets: crate.container, x: 1400, duration: 900, ease: "Linear", onComplete: () => crate.container.destroy() });
      });
    }
    this.createConfetti(1215, 380);
    await this.delay(1200);
  }

  gameOver() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearRound();
    this.hideBubble();
    this.beltSpeed = 0;

    const warn = this.add.circle(1215, 350, 20, C_RED, 0.15).setDepth(20);
    this.tweens.add({ targets: warn, angle: 360, duration: 1200, repeat: -1 });

    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
    this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });

    const title = this.add.text(640, 240, "LINE SHUTDOWN", {
      font: "bold 40px Arial", color: HEX_RED,
    }).setOrigin(0.5).setScale(0).setDepth(91);
    this.tweens.add({
      targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut",
      onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }),
    });

    this.add.text(640, 310, `Score: ${this.score}`, { font: "20px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
    this.add.text(640, 350, `Crates Inspected: ${this.currentRound} / ${ROUNDS.length}`, {
      font: "16px Arial", color: HEX_GRAY,
    }).setOrigin(0.5).setDepth(91);

    this._makeButton(640, 420, "RESTART SHIFT", 200, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearRound();
    this.hideBubble();

    const accuracy = this.correctFirstTry / ROUNDS.length;
    const avgTimePct = this.totalTimePctUsed / ROUNDS.length;
    try { GameManager.completeLevel(25, Math.round(accuracy * 100)); } catch (_) {}
    try { BadgeSystem.unlock("length_schema_tuned"); } catch (_) {}
    try {
      localStorage.setItem("level26_results", JSON.stringify({
        level: 26, concept: "string_length", phase: "tuning",
        score: this.score, accuracy, avgTimePct,
        fastBonuses: this.fastBonusCount, comboMax: this.maxCombo,
        stars: this._starRating(accuracy, avgTimePct),
        livesRemaining: this.lives, attempts: this.attemptLog,
        timestamp: Date.now(),
      }));
    } catch (_) {}

    this.lineCelebration().then(() => {
      if (this._alive) this.showScoreTally(accuracy, avgTimePct);
    });
  }

  _starRating(accuracy, avgTimePct) {
    if (accuracy >= 0.9 && avgTimePct <= 0.55) return 3;
    if (accuracy >= 0.75) return 2;
    return 1;
  }

  showScoreTally(accuracy, avgTimePct) {
    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
    this.tweens.add({ targets: ov, fillAlpha: 0.85, duration: 500 });

    const panel = this.add.graphics().setDepth(90);
    panel.fillStyle(0x12170f, 1);
    panel.fillRoundedRect(360, 140, 560, 440, 16);
    panel.lineStyle(2, C_GREEN, 1);
    panel.strokeRoundedRect(360, 140, 560, 440, 16);

    const title = this.add.text(640, 190, "SHIFT COMPLETE", {
      font: "bold 36px Arial", color: HEX_GREEN,
    }).setOrigin(0.5).setDepth(91).setScale(0);
    this.tweens.add({ targets: title, scale: 1, duration: 350, ease: "Back.easeOut" });

    const avgResponseSec = ((this.totalTimePctUsed / ROUNDS.length) * (10)).toFixed(1);
    const lines = [
      `ACCURACY: ${Math.round(accuracy * 100)}%`,
      `AVG RESPONSE: ${Math.round(avgTimePct * 100)}% of time limit`,
      `FAST BONUSES: ${this.fastBonusCount}`,
      `BEST COMBO: ×${this.maxCombo}`,
    ];
    lines.forEach((s, i) => {
      const t = this.add.text(500, 250 + i * 30, s, { font: "14px Arial", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 250, delay: 300 + i * 150 });
    });
    const totalText = this.add.text(500, 250 + 4 * 30, "TOTAL: 0", {
      font: "bold 24px Arial", color: HEX_AMBER,
    }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: totalText, alpha: 1, duration: 250, delay: 1050 });
    const counter = { v: 0 };
    this.tweens.add({
      targets: counter, v: this.score, duration: 1000, delay: 1050,
      onUpdate: () => totalText.setText(`TOTAL: ${Math.round(counter.v)}`),
    });

    const stars = this._starRating(accuracy, avgTimePct);
    for (let i = 0; i < 3; i++) {
      const earned = i < stars;
      const s = this.add.text(640 + (i - 1) * 60, 415, "★", {
        font: "40px Arial", color: earned ? HEX_AMBER : "#2a3040",
      }).setOrigin(0.5).setDepth(91).setScale(0);
      this.tweens.add({ targets: s, scale: 1, duration: 250, delay: 1650 + i * 200, ease: earned ? "Back.easeOut" : "Cubic.easeOut" });
    }

    const badge = this.add.container(640, 495).setDepth(91).setAlpha(0);
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillCircle(0, 0, 30);
    bg.lineStyle(2, C_AMBER, 1);
    bg.strokeCircle(0, 0, 30);
    bg.lineStyle(3, C_AMBER, 1);
    bg.strokeRoundedRect(-14, -14, 28, 28, 4);
    bg.lineBetween(-7, 0, -3, 6);
    bg.lineBetween(-3, 6, 8, -6);
    badge.add(bg);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 2250 });
    const badgeLbl = this.add.text(640, 533, "length() SCHEMA TUNED", {
      font: "bold 13px Arial", color: HEX_AMBER,
    }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: badgeLbl, alpha: 1, duration: 300, delay: 2350 });

    this._makeButton(500, 555, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(760, 555, "NEXT: The Forge →", 220, 44, { fill: 0x00733a, stroke: C_GREEN, textColor: "#ffffff" }, () => {
      if (this.scene.get("Level27Scene")) this.scene.start("Level27Scene");
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
