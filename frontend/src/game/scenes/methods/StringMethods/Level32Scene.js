/**
 * Level 32 — "The Press Gauntlet" (String Methods: Tuning Phase)
 * ==================================================================
 * Tunes the case-conversion + immutability schema from Level 31 through
 * rapid-fire trials. Each trial arrives as a hot billet on the anvil that
 * visibly COOLS from blazing orange to dead gray — the billet's heat is
 * the visual timer, driven by a single tween on a plain state object
 * (never a GameObject transform), so urgency vibration can safely ride on
 * the billet container's `x` without any risk of fighting the timer for
 * control of a shared property — the exact bug class fixed in Level 26.
 *
 * The full Level 31 press/case/tray apparatus is reused wholesale as the
 * permanent reference and the reveal machinery; Wave 3 adds a genuine
 * chain evaluator that welds this trilogy to charAt() (L28-29) and
 * length() (L25-27) — each call's result genuinely computed step by step,
 * never looked up.
 */

import Phaser from "phaser";
import { GameManager } from "../../../GameManager.js";
import { BadgeSystem } from "../../../BadgeSystem.js";

const W = 1280, H = 720;

const C_CYAN = 0x00e5ff, C_AMBER = 0xffd740, C_GREEN = 0x00e676;
const C_RED = 0xf44336, C_GRAY = 0x78909c, C_MAGENTA = 0xff4081;
const C_PURPLE = 0x8c7ae6, C_ORANGE = 0xff9800;
const HEX_CYAN = "#00e5ff", HEX_AMBER = "#ffd740", HEX_GREEN = "#00e676";
const HEX_RED = "#f44336", HEX_GRAY = "#78909c", HEX_MAGENTA = "#ff4081";
const HEX_PURPLE = "#8c7ae6", HEX_ORANGE = "#ff9800";

const CASE_CX = 250, CASE_CY = 370;
const TRAY_CX = 1030, TRAY_CY = 370;
const PRESS_CX = 640;
const RAM_UP_Y = 180, ANVIL_Y = 400;
const BILLET_Y = 345;
const THERMO_X = 505, THERMO_TOP = 290, THERMO_BOTTOM = 410;

const TUTORIAL_KEY = "level32_tutorial_done";

// forge palette stops for cooling interpolation (progress 1 -> 0)
const HEAT_STOPS = [
  { p: 1.0, color: 0xff9800 },
  { p: 0.66, color: 0xff6f00 },
  { p: 0.33, color: 0xd84315 },
  { p: 0.15, color: 0x6d3a2e },
  { p: 0.0, color: 0x3a3542 },
];

// ─────────────────────────────────────────────────────────────────
// Round configuration
// ─────────────────────────────────────────────────────────────────
const ROUNDS = [
  { round: 1, wave: 1, type: "predict", timeLimit: 12000,
    decl: { name: "s", value: "mint" }, billet: "s.toUpperCase()", correct: '"MINT"',
    options: [
      { value: '"MINT"', tag: null },
      { value: '"Mint"', tag: "first_letter_only_belief" },
      { value: '"mint"', tag: "no_change_belief" },
      { value: '"mINT"', tag: "method_direction_confusion" },
    ], concept: "fluent_upper" },

  { round: 2, wave: 1, type: "predict", timeLimit: 12000,
    decl: { name: "alarm", value: "LOUD" }, billet: "alarm.toLowerCase()", correct: '"loud"',
    options: [
      { value: '"loud"', tag: null },
      { value: '"LOUD"', tag: "no_change_belief" },
      { value: '"Loud"', tag: "first_letter_only_belief" },
      { value: '"lOUD"', tag: "method_direction_confusion" },
    ], concept: "fluent_lower" },

  { round: 3, wave: 1, type: "predict", timeLimit: 12000,
    decl: { name: "s", value: "OK" }, billet: "s.toUpperCase()", correct: '"OK"',
    options: [
      { value: '"OK"', tag: null },
      { value: '"ok"', tag: "method_direction_confusion" },
      { value: '"Ok"', tag: "partial_conversion_belief" },
      { value: "Error", tag: "already_upper_error_belief" },
    ], concept: "already_uppercase" },

  { round: 4, wave: 1, type: "predict", timeLimit: 12000,
    decl: { name: "id", value: "a1 b2" }, billet: "id.toUpperCase()", correct: '"A1 B2"',
    options: [
      { value: '"A1 B2"', tag: null },
      { value: '"A1B2"', tag: "spaces_dropped_belief" },
      { value: '"A! B@"', tag: "digits_symbols_converted_belief" },
      { value: '"a1 b2"', tag: "no_change_belief" },
    ], concept: "non_letters_fluent" },

  { round: 5, wave: 1, type: "predict", timeLimit: 12000,
    decl: { name: "s", value: "" }, billet: "s.toUpperCase()", correct: '""',
    options: [
      { value: '""', label: '"" (empty)', tag: null },
      { value: "Error", tag: "empty_string_error_belief" },
      { value: '" "', tag: "empty_string_confusion" },
      { value: "null", tag: "empty_returns_null_belief" },
    ], concept: "empty_string_safe" },

  { round: 6, wave: 2, type: "sealed", timeLimit: 10000,
    decl: { name: "s", value: "hot" }, billetLines: ["s.toUpperCase();", "print(s);"],
    question: "What prints?", correct: '"hot"',
    options: [
      { value: '"hot"', tag: null },
      { value: '"HOT"', tag: "in_place_mutation_belief" },
      { value: '""', tag: "discard_empties_belief" },
      { value: "Error", tag: "discard_error_belief" },
    ], reveal: "discard", concept: "immutability_discard_fluent" },

  { round: 7, wave: 2, type: "sealed", timeLimit: 10000,
    decl: { name: "s", value: "Hot" }, billetLines: ["s = s.toLowerCase();", "print(s);"],
    question: "What prints?", correct: '"hot"',
    options: [
      { value: '"hot"', tag: null },
      { value: '"Hot"', tag: "reassignment_ignored_belief" },
      { value: '"HOT"', tag: "method_direction_confusion" },
      { value: '"hOT"', tag: "first_letter_only_belief" },
    ], reveal: "reassign", concept: "immutability_reassign_fluent" },

  { round: 8, wave: 2, type: "judge", timeLimit: 10000,
    decl: { name: "s", value: "iron" }, billet: "String big = s.toUpperCase();",
    correct: "valid", resultValue: '"IRON"',
    wrongTag: "method_call_doubt", concept: "valid_call_fluent" },

  { round: 9, wave: 2, type: "judge", timeLimit: 10000,
    decl: { name: "s", value: "iron" }, billet: "String big = s.toUpperCase(true);",
    correct: "invalid", faultPart: "(true)",
    explanation: "No arguments — ever! The press has no settings. Empty parentheses only.",
    wrongTag: "needs_argument_belief", concept: "no_arguments_fluent" },

  { round: 10, wave: 2, type: "judge", timeLimit: 10000,
    decl: { name: "s", value: "iron" }, billet: "String big = s.ToUpperCase();",
    correct: "invalid", faultPart: "ToUpperCase",
    explanation: "Capital T this time! Method names start lowercase: toUpperCase. Java forgives NO casing mistakes.",
    wrongTag: "method_name_case_insensitive_belief", concept: "method_name_case_variant" },

  { round: 11, wave: 3, type: "chain", timeLimit: 9000,
    decl: { name: "s", value: "Java" }, billet: "s.toUpperCase().toLowerCase()", correct: '"java"',
    options: [
      { value: '"java"', tag: null },
      { value: '"JAVA"', tag: "chain_first_call_wins" },
      { value: '"Java"', tag: "no_change_belief" },
      { value: "Error", tag: "chaining_invalid_belief" },
    ], steps: ['s.toUpperCase() = "JAVA"', '"JAVA".toLowerCase() = "java"'], concept: "chained_calls" },

  { round: 12, wave: 3, type: "chain", timeLimit: 9000,
    decl: { name: "s", value: "bit" }, billet: "s.toUpperCase().charAt(0)", correct: "'B'",
    options: [
      { value: "'B'", tag: null },
      { value: "'b'", tag: "chain_order_ignored" },
      { value: '"B"', tag: "char_vs_string_type" },
      { value: "Error", tag: "chaining_invalid_belief" },
    ], steps: ['s.toUpperCase() = "BIT"', "\"BIT\".charAt(0) = 'B'"], concept: "chain_with_charAt" },

  { round: 13, wave: 3, type: "chain", timeLimit: 9000,
    decl: { name: "s", value: "mint" }, billet: "s.toUpperCase().length()", correct: "4",
    options: [
      { value: "4", tag: null },
      { value: "8", tag: "both_strings_counted" },
      { value: '"MINT"', tag: "expression_returns_string_belief" },
      { value: "0", tag: "chain_confusion" },
    ], steps: ['s.toUpperCase() = "MINT"', '"MINT".length() = 4'], concept: "chain_with_length" },

  { round: 14, wave: 3, type: "bughunt", timeLimit: 12000,
    decl: { name: "name", value: "gala" },
    billetLines: ["String big = name.toUppercase();"],
    faultToken: "toUppercase", fixedToken: "toUpperCase",
    explanation: "Lowercase 'c' hiding in the name! toUpperCase needs its capital C. One letter, total compile failure.",
    wrongTag: "method_name_case_insensitive_belief", concept: "method_name_bug" },

  { round: 15, wave: 3, type: "bughunt", timeLimit: 12000,
    decl: { name: "s", value: "hi" },
    billetLines: ["s.toUpperCase();", 'print(s);   // expected: "HI"'],
    faultToken: "s.toUpperCase();", fixedToken: "s = s.toUpperCase();",
    explanation: "The classic! The press ran, the result vanished into UNSAVED. Reassign — s = s.toUpperCase() — or nothing sticks.",
    wrongTag: "in_place_mutation_belief", concept: "mutation_bug_hunt" },
];

const MISCONCEPTION_FEEDBACK = {
  in_place_mutation_belief: "The case is SEALED, Builder! No method can reach inside a String. The press returns a NEW String — if nobody saves it, s never changes.",
  no_change_belief: "The press never sleeps! Every letter gets stamped — check the tray, all of them converted.",
  first_letter_only_belief: "That's a different tool. toUpperCase() converts EVERY letter, first to last.",
  method_direction_confusion: "Wrong die! A↑ makes capitals, a↓ makes small letters. Read the method name — it tells you its direction.",
  digits_symbols_converted_belief: "The press only speaks LETTERS. Digits, symbols and spaces slide through untouched.",
  needs_argument_belief: "Empty parentheses, always! toUpperCase() has no settings — it converts everything, no arguments accepted.",
  method_name_case_insensitive_belief: "Java is case-sensitive about EVERYTHING — even method names. Capital letters must match exactly.",
  discard_error_belief: "No exception here — calling toUpperCase() without saving it is perfectly legal Java. It just means the result is thrown away.",
  reassignment_ignored_belief: "Look at the case-swap in the reveal — reassignment pointed the variable at the NEW String. It sticks.",
  method_call_doubt: "That call is exactly right — a String variable, a dot, and toUpperCase() with empty parentheses. Totally valid Java!",
  already_upper_error_belief: "Stamping a capital into a capital is no crime — the press shrugs and moves on. No error, no change.",
  empty_string_error_belief: "The press handles emptiness gracefully — unlike the claw! toUpperCase on \"\" returns \"\". Know each method's temper.",
  empty_string_confusion: 'An empty String "" has ZERO characters. A space " " is a completely different, non-empty String.',
  empty_returns_null_belief: "An empty String is still a String — never null. toUpperCase() on \"\" simply returns another empty String \"\".",
  spaces_dropped_belief: "The press converts letters and PRESERVES everything else — spaces included. Nothing is ever removed.",
  discard_empties_belief: "The original was never touched, so it's not empty — the case still holds every original character.",
  partial_conversion_belief: "The press doesn't stop halfway! Every letter gets the same treatment — check the second letter too.",
  chain_first_call_wins: "Chains don't stop at the first press! Read left to right — the LAST call's result is what you're left holding.",
  chaining_invalid_belief: "Every call returns a String, so the next call latches right on. Chaining is legal, powerful, and everywhere in real code.",
  chain_order_ignored: "The press ran FIRST — by the time charAt(0) arrived, the String was already the pressed version. Order is left to right, always.",
  char_vs_string_type: "charAt() returns a char in single quotes — a String in double quotes is a different type entirely.",
  both_strings_counted: "Only ONE String reaches length() — the pressed one. The original stays sealed in its case, uncounted.",
  expression_returns_string_belief: "length() always returns a NUMBER — the count of characters, never the String itself.",
  chain_confusion: "Trace the chain one call at a time: first the case conversion, then the next call — never skip straight to the end.",
  timeout: "Cold slag! The moment the billet lands, commit. Fluency means the answer arrives before the doubt does.",
};

const WAVE_INFO = {
  1: { title: "WAVE 1 — RAPID PRESS PREDICTION", brief: "Strike fast — predict the transformation before the billet cools!" },
  2: { title: "WAVE 2 — SEALED CASE UNDER PRESSURE", brief: "Now judge the code itself, and prove the case stays sealed." },
  3: { title: "WAVE 3 — CHAINS & BUG HUNT", brief: "Final stretch — chain the calls, and hunt the bugs!" },
};

export class Level32Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level32Scene" });
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
    this.optionBubbles = [];
    this.pressMode = null;
    this.caseTiles = [];
    this.trayTiles = [];
    this.billet = null;
    this.coolingTween = null;
    this._coolState = { progress: 1 };
    this.urgencyState = "normal";
    this.roundStartTime = 0;
    this.answered = false;
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
    cam.setBackgroundColor("#0b0a0e");

    try { GameManager.incrementAttempt(31); } catch (_) {}

    this.createParticleTexture();
    this.createBackground();
    this.createHallFloor();
    this.createBeams();
    this.createMachinery();
    this.createFurnaceGlow();
    this.createParticles();
    this.createGauntletDressing();
    this.createFeedLine();
    this.createTemperatureBar();
    this.createPress();
    this.createOriginalCase();
    this.createOutputTray();
    this.createHUD();
    this.createExpressionMonitor();
    this.createTickerTape();
    this.createBit();

    cam.fadeIn(700, 5, 5, 8);
    this.checkTutorial();
  }

  update(time, delta) {
    this.updateParticles(time, delta);
    this.updateFurnace(time);
    this.updateStopwatch(time);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // SETUP — background & environment (Level 31 hall, reused)
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l32_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l32_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x0b0a0e).setDepth(0);
  }

  createHallFloor() {
    const g = this.add.graphics().setDepth(1);
    const top = 605, panelH = 23;
    for (let i = 0; i < 5; i++) {
      const y = top + i * panelH;
      g.fillStyle(i % 2 === 0 ? 0x12111a : 0x0e0d14, 1);
      g.fillRect(0, y, W, panelH);
      g.lineStyle(1, 0x221f2e, 0.25);
      g.lineBetween(0, y, W, y);
    }
  }

  createBeams() {
    const g = this.add.graphics().setDepth(3);
    [130, 1150].forEach((x) => {
      g.fillStyle(0x14121c, 1);
      g.lineStyle(1, 0x221f2e, 1);
      g.fillRect(x - 10, 40, 20, 565);
      g.strokeRect(x - 10, 40, 20, 565);
      for (let y = 60; y < 600; y += 60) g.lineBetween(x - 10, y, x + 10, y);
    });
    g.fillStyle(0x14121c, 1);
    g.lineStyle(1, 0x221f2e, 1);
    g.fillRect(130, 71, 1020, 14);
    g.strokeRect(130, 71, 1020, 14);
  }

  createMachinery() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x0d0b16, 0.4);
    g.lineStyle(1, 0x221f2e, 0.06);
    g.fillRect(40, 300, 70, 220);
    g.strokeRect(40, 300, 70, 220);
    g.fillStyle(0x0d0b16, 0.4);
    g.fillRect(1170, 300, 70, 220);
    g.strokeRect(1170, 300, 70, 220);
  }

  createFurnaceGlow() {
    this.furnaceCircles = [60, 90, 120].map((r, i) => this.add.circle(20, 700, r, 0xff6f00, [0.03, 0.018, 0.009][i]).setDepth(1));
  }

  updateFurnace(time) {
    if (!this.furnaceCircles) return;
    const pulse = 1 + Math.sin(time * 0.00024) * 0.2;
    this.furnaceCircles.forEach((c) => c.setScale(pulse));
  }

  createParticles() {
    this.dust = [];
    for (let i = 0; i < 10; i++) {
      const p = this.add.circle(Phaser.Math.Between(20, 1260), Phaser.Math.Between(0, 600), 1, 0x90a4ae, Phaser.Math.FloatBetween(0.02, 0.05)).setDepth(2);
      this.dust.push(p);
    }
  }

  updateParticles(time, delta) {
    if (!this.dust) return;
    const step = 0.04 * (delta / 16.7);
    this.dust.forEach((p, i) => {
      p.x += step;
      p.y += Math.sin(time * 0.0008 + i) * 0.03;
      if (p.x > 1280) { p.x = 0; p.y = Phaser.Math.Between(0, 600); }
    });
  }

  createGauntletDressing() {
    const g = this.add.graphics().setDepth(3);
    for (let i = 0; i < 5; i++) {
      const x = 250 + i * 190;
      const c = i % 2 === 0 ? C_AMBER : C_ORANGE;
      g.fillStyle(c, 0.15);
      g.fillTriangle(x - 9, 82, x + 9, 82, x, 96);
    }
    this.bell = this.add.container(120, 120).setDepth(4);
    const bg = this.add.graphics();
    bg.lineStyle(2, C_AMBER, 0.4);
    bg.beginPath();
    bg.arc(0, 0, 8, Math.PI, 0, false);
    bg.strokePath();
    const clapper = this.add.circle(0, 6, 1.5, C_AMBER, 0.4);
    this.bell.add([bg, clapper]);
  }

  async ringGauntletBell() {
    for (let i = 0; i < 3; i++) {
      if (!this._alive) return;
      await new Promise((res) => this.tweens.add({ targets: this.bell, angle: 20, duration: 120, yoyo: true, onComplete: () => res() }));
    }
  }

  createFeedLine() {
    const g = this.add.graphics().setDepth(3);
    g.lineStyle(1, 0x221f2e, 1);
    for (let x = 20; x < 540; x += 108) g.strokeCircle(x, ANVIL_Y + 30, 8);
    g.lineBetween(0, ANVIL_Y, 540, ANVIL_Y);
  }

  createTemperatureBar() {
    const g = this.add.graphics().setDepth(20);
    g.fillStyle(0x221f2e, 1);
    g.fillRect(THERMO_X, THERMO_TOP, 6, THERMO_BOTTOM - THERMO_TOP);
    this.add.circle(THERMO_X + 3, THERMO_BOTTOM + 6, 5, 0x221f2e).setDepth(20);
    this.thermoFill = this.add.graphics().setDepth(21);
  }

  updateTemperatureBar(progress, color) {
    const h = Math.max(0, (THERMO_BOTTOM - THERMO_TOP) * progress);
    this.thermoFill.clear();
    this.thermoFill.fillStyle(color, 1);
    this.thermoFill.fillRect(THERMO_X, THERMO_BOTTOM - h, 6, h);
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

  _charMeta(ch) {
    if (ch === " ") return { display: "␣", color: HEX_MAGENTA, isSpace: true };
    if (/[0-9]/.test(ch)) return { display: ch, color: HEX_AMBER, isSpace: false };
    if (/[a-zA-Z]/.test(ch)) return { display: ch, color: HEX_CYAN, isSpace: false };
    return { display: ch, color: HEX_ORANGE, isSpace: false };
  }

  applyCase(str, mode) {
    return mode === "upper" ? str.toUpperCase() : str.toLowerCase();
  }

  // ══════════════════════════════════════════════════════════════
  // THE PRESS (Level 31 mechanics, reused)
  // ══════════════════════════════════════════════════════════════

  createPress() {
    const g = this.add.graphics().setDepth(10);
    [540, 740].forEach((x) => {
      g.fillStyle(0x181624, 1);
      g.lineStyle(2, 0x2e2a40, 1);
      g.fillRect(x - 13, 78, 26, 392);
      g.strokeRect(x - 13, 78, 26, 392);
    });
    const anvilG = this.add.graphics().setDepth(11);
    anvilG.fillStyle(0x14121c, 1);
    anvilG.lineStyle(1, 0x2e2a40, 1);
    anvilG.fillRoundedRect(PRESS_CX - 105, ANVIL_Y - 11, 210, 22, 4);
    anvilG.strokeRoundedRect(PRESS_CX - 105, ANVIL_Y - 11, 210, 22, 4);
    this.ventPoints = [[540 + 13, 200], [740 - 13, 200]];

    this.ramContainer = this.add.container(PRESS_CX, RAM_UP_Y).setDepth(12);
    const ramBody = this.add.graphics();
    ramBody.fillStyle(0x1e1b2e, 1);
    ramBody.lineStyle(2, C_PURPLE, 1);
    ramBody.fillRoundedRect(-95, -27, 190, 54, 6);
    ramBody.strokeRoundedRect(-95, -27, 190, 54, 6);
    const dieG = this.add.graphics();
    dieG.fillStyle(0x0d0b16, 1);
    dieG.fillRoundedRect(-85, 24, 170, 16, 3);
    this.dieText = this.add.text(0, 32, "?", { font: "bold 14px Courier New", color: HEX_GRAY }).setOrigin(0.5);
    this.modeLamp = this.add.circle(0, -34, 5, C_GRAY);
    this.ramContainer.add([ramBody, dieG, this.dieText, this.modeLamp]);
  }

  setPressMode(mode) {
    this.pressMode = mode;
    if (mode === "upper") { this.dieText.setText("A↑").setColor(HEX_CYAN); this.modeLamp.setFillStyle(C_CYAN); }
    else { this.dieText.setText("a↓").setColor(HEX_ORANGE); this.modeLamp.setFillStyle(C_ORANGE); }
  }

  _steamPuff() {
    this.ventPoints.forEach(([x, y]) => {
      for (let i = 0; i < 2; i++) {
        const p = this.add.circle(x, y, 3, 0xb0bec5, 0.15).setDepth(13);
        this.tweens.add({ targets: p, y: y - 20, alpha: 0, scale: 1.8, duration: 350, delay: i * 50, onComplete: () => p.destroy() });
      }
    });
  }

  // ══════════════════════════════════════════════════════════════
  // ORIGINAL CASE (Level 31 mechanics, reused)
  // ══════════════════════════════════════════════════════════════

  createOriginalCase() {
    this.caseFrame = this.add.graphics().setDepth(10);
    this.add.text(CASE_CX, CASE_CY + 78, "ORIGINAL — SEALED", { font: "bold 9px Arial", color: HEX_CYAN }).setOrigin(0.5).setDepth(11);
    this.padlock = this.add.graphics().setDepth(11);
    this._drawPadlock(CASE_CX + 78, CASE_CY + 78);
    this.caseTileLayer = this.add.container(0, 0).setDepth(11);
    this.caseLensRing = this.add.circle(CASE_CX, CASE_CY, 26, 0x000000, 0).setStrokeStyle(2, C_AMBER, 0).setDepth(13);
  }

  _drawPadlock(x, y) {
    this.padlock.clear();
    this.padlock.lineStyle(1.5, C_CYAN, 0.6);
    this.padlock.strokeRect(x - 5, y - 2, 10, 8);
    this.padlock.beginPath();
    this.padlock.arc(x, y - 4, 4, Math.PI, 0, false);
    this.padlock.strokePath();
  }

  _drawCaseFrame(w, h) {
    this.caseFrame.clear();
    this.caseFrame.fillStyle(0x0d1420, 0.5);
    this.caseFrame.lineStyle(1, C_CYAN, 1);
    this.caseFrame.fillRoundedRect(CASE_CX - w / 2, CASE_CY - h / 2, w, h, 10);
    this.caseFrame.strokeRoundedRect(CASE_CX - w / 2, CASE_CY - h / 2, w, h, 10);
  }

  loadOriginalCase(str) {
    this.caseTileLayer.removeAll(true);
    this.caseTiles = [];
    const scale = 0.7, tw = 52 * scale, gap = 6 * scale;
    const n = str.length;
    const totalW = n * tw + Math.max(0, n - 1) * gap;
    const w = Math.max(180, totalW + 30), h = 110;
    this._drawCaseFrame(w, h);
    if (n === 0) {
      const t = this.add.text(CASE_CX, CASE_CY, "(empty)", { font: "italic 12px Arial", color: "#3d4450" }).setOrigin(0.5);
      this.caseTileLayer.add(t);
      return;
    }
    const startX = CASE_CX - totalW / 2;
    str.split("").forEach((ch, i) => {
      const x = startX + i * (tw + gap) + tw / 2;
      const tile = this._buildTile(ch, x, CASE_CY, scale);
      this.caseTileLayer.add(tile.container);
      this.caseTiles.push(tile);
    });
  }

  _buildTile(ch, x, y, scale = 1) {
    const meta = this._charMeta(ch);
    const tw = 52 * scale, th = 64 * scale;
    const container = this.add.container(x, y);
    const body = this.add.graphics();
    body.fillStyle(0x0d1117, 1);
    body.lineStyle(1.5, 0x2a3a4a, 1);
    body.fillRoundedRect(-tw / 2, -th / 2, tw, th, 5 * scale);
    body.strokeRoundedRect(-tw / 2, -th / 2, tw, th, 5 * scale);
    const txt = this.add.text(0, meta.isSpace ? -4 * scale : 0, meta.display, {
      font: `bold ${Math.round(24 * scale)}px Courier New`, color: meta.color,
    }).setOrigin(0.5);
    if (meta.isSpace) txt.setAlpha(0.85);
    container.add([body, txt]);
    return { container, body, txt, ch, tw, th, scale, x, y };
  }

  async sealCase() {
    this._drawPadlock(CASE_CX + 78, CASE_CY + 78);
    this.tweens.add({ targets: this.padlock, scale: 1.4, duration: 130, yoyo: true });
    await this.delay(150);
  }

  async inspectionSweep() {
    this.caseLensRing.setStrokeStyle(2, C_AMBER, 0.7).setPosition(CASE_CX - 70, CASE_CY);
    await new Promise((res) => this.tweens.add({ targets: this.caseLensRing, x: CASE_CX + 70, duration: 350, onComplete: () => res() }));
    this.caseLensRing.setStrokeStyle(2, C_AMBER, 0);
    this.tweens.add({ targets: this.padlock, scale: 1.3, duration: 100, yoyo: true, repeat: 1 });
    await this.delay(100);
  }

  async replaceCaseContents(newStr) {
    this.tweens.add({ targets: this.padlock, alpha: 0.3, duration: 120 });
    await this.delay(120);
    if (!this._alive) return;
    await new Promise((res) => this.tweens.add({ targets: this.caseTiles.map((t) => t.container), alpha: 0, scale: 0.7, duration: 180, onComplete: () => res() }));
    this.loadOriginalCase(newStr);
    this.caseTiles.forEach((t) => t.container.setAlpha(0).setScale(0.7));
    await new Promise((res) => this.tweens.add({ targets: this.caseTiles.map((t) => t.container), alpha: 1, scale: 1, duration: 180, onComplete: () => res() }));
    this.padlock.setAlpha(1);
    this.tweens.add({ targets: this.padlock, scale: 1.4, duration: 130, yoyo: true });
  }

  updateSourceLiteral(varName, str) {
    if (this.literalGroup) this.literalGroup.destroy();
    const c = this.add.container(0, 285).setDepth(15);
    let x = 0;
    const put = (t, color) => {
      const txt = this.add.text(x, 0, t, { font: "15px Courier New", color }).setOrigin(0, 0.5);
      c.add(txt); x += txt.width;
    };
    put("String", HEX_MAGENTA);
    put(" " + varName + " = ", HEX_GRAY);
    put('"', HEX_GRAY);
    put(str, HEX_AMBER);
    put('"', HEX_GRAY);
    put(";", HEX_GRAY);
    c.x = CASE_CX - x / 2;
    this.literalGroup = c;
  }

  // ══════════════════════════════════════════════════════════════
  // OUTPUT TRAY (Level 31 mechanics, reused)
  // ══════════════════════════════════════════════════════════════

  createOutputTray() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x12111a, 1);
    g.lineStyle(1, 0x2e2a40, 1);
    g.beginPath();
    g.moveTo(TRAY_CX - 100, TRAY_CY - 45);
    g.lineTo(TRAY_CX + 100, TRAY_CY - 45);
    g.lineTo(TRAY_CX + 80, TRAY_CY + 45);
    g.lineTo(TRAY_CX - 80, TRAY_CY + 45);
    g.closePath();
    g.fillPath(); g.strokePath();
    this.add.text(TRAY_CX, TRAY_CY - 62, "RESULT", { font: "bold 9px Arial", color: "#546e7a" }).setOrigin(0.5).setDepth(11);
    this.trayTileLayer = this.add.container(0, 0).setDepth(11);
    this.trayResultText = this.add.text(TRAY_CX, TRAY_CY - 80, "", { font: "bold 16px Courier New", color: HEX_GREEN }).setOrigin(0.5).setDepth(12);
    this.cameoPanel = this.add.container(TRAY_CX, TRAY_CY - 100).setDepth(12);
  }

  clearTray() {
    this.trayTileLayer.removeAll(true);
    this.trayTiles = [];
    this.trayResultText.setText("");
    this.cameoPanel.removeAll(true);
  }

  showTrayResult(resultStr) {
    this.trayResultText.setText(`"${resultStr}"`).setScale(0);
    this.tweens.add({ targets: this.trayResultText, scale: 1, duration: 180, ease: "Back.easeOut" });
  }

  async discardTrayToChute() {
    await new Promise((res) => {
      this.tweens.add({
        targets: this.trayTiles.map((t) => t.container), x: "+=140", y: "+=40", alpha: 0, duration: 350, ease: "Cubic.easeIn",
        onComplete: () => res(),
      });
    });
    const label = this.add.text(TRAY_CX + 140, TRAY_CY + 60, "UNSAVED", { font: "bold 10px Arial", color: HEX_RED }).setOrigin(0.5).setDepth(20).setAlpha(0);
    this.roundElements.push(label);
    this.tweens.add({ targets: label, alpha: 1, duration: 180 });
    this.time.delayedCall(600, () => this.tweens.add({ targets: label, alpha: 0, duration: 250 }));
    this.clearTray();
  }

  // ══════════════════════════════════════════════════════════════
  // TRANSFORMATION (Level 31 mechanics at 1.4x pace)
  // ══════════════════════════════════════════════════════════════

  async runTransformation(str, mode) {
    this.setPressMode(mode);
    const scale = 0.7, tw = 52 * scale, gap = 6 * scale;
    const n = str.length;
    const totalW = n * tw + Math.max(0, n - 1) * gap;
    const feedStartX = PRESS_CX - 220;

    if (n === 0) {
      // clean no-op cycle over an empty anvil
      await new Promise((res) => this.tweens.add({ targets: this.ramContainer, y: ANVIL_Y - 30, duration: 90, ease: "Quad.easeIn", onComplete: () => res() }));
      this._steamPuff();
      this.tweens.add({ targets: this.ramContainer, y: RAM_UP_Y, duration: 110 });
      await this.delay(120);
      return "";
    }

    const ghosts = str.split("").map((ch, i) => {
      const tile = this._buildTile(ch, feedStartX - i * 20, ANVIL_Y - 60, scale);
      tile.container.setAlpha(0.45);
      tile.body.lineStyle(1.5, C_CYAN, 0.6);
      this.roundElements.push(tile.container);
      return tile;
    });
    this.tweens.add({ targets: this.padlock, scale: 1.3, duration: 110, yoyo: true });
    await this.delay(140);
    if (!this._alive) return "";

    let result = "";
    for (let i = 0; i < ghosts.length; i++) {
      if (!this._alive) return result;
      const ghost = ghosts[i];
      await new Promise((res) => this.tweens.add({ targets: ghost.container, x: PRESS_CX, y: ANVIL_Y, duration: 130, onComplete: () => res() }));
      const ch = ghost.ch;
      const converted = /[a-zA-Z]/.test(ch) ? this.applyCase(ch, mode) : ch;
      result += converted;

      if (/[a-zA-Z]/.test(ch)) {
        await new Promise((res) => this.tweens.add({ targets: this.ramContainer, y: ANVIL_Y - 30, duration: 85, ease: "Quad.easeIn", onComplete: () => res() }));
        this.screenShake(0.0015, 70);
        this._steamPuff();
        const sparks = this.add.particles(ghost.container.x, ANVIL_Y, "l32_dot", {
          speed: { min: 30, max: 70 }, angle: { min: 200, max: 340 }, scale: { start: 0.5, end: 0 }, lifespan: 180,
          tint: mode === "upper" ? C_CYAN : C_ORANGE, emitting: false,
        }).setDepth(13);
        sparks.explode(4);
        this.time.delayedCall(250, () => sparks.destroy());
        await new Promise((res) => {
          this.tweens.add({
            targets: ghost.container, scaleY: 0.1, duration: 60,
            onComplete: () => {
              ghost.txt.setText(this._charMeta(converted).display).setColor(this._charMeta(converted).color);
              ghost.container.setAlpha(1);
              this.tweens.add({ targets: ghost.container, scaleY: scale, duration: 60, onComplete: () => res() });
            },
          });
        });
        this.tweens.add({ targets: this.ramContainer, y: RAM_UP_Y, duration: 110 });
        await this.delay(110);
      } else {
        await new Promise((res) => this.tweens.add({ targets: this.ramContainer, y: ANVIL_Y - 100, duration: 70, onComplete: () => res() }));
        ghost.container.setAlpha(1);
        this.tweens.add({ targets: this.ramContainer, y: RAM_UP_Y, duration: 100 });
        await this.delay(100);
      }

      const trayX = TRAY_CX - totalW / 2 + i * (tw + gap) + tw / 2;
      await new Promise((res) => this.tweens.add({ targets: ghost.container, x: trayX, y: TRAY_CY, duration: 110, onComplete: () => res() }));
      this.trayTileLayer.add(ghost.container);
      this.trayTiles.push(ghost);
    }
    return result;
  }

  // ══════════════════════════════════════════════════════════════
  // CHAIN EVALUATION (genuine, step-by-step)
  // ══════════════════════════════════════════════════════════════

  _parseChainCalls(billetExpr) {
    const calls = [];
    const re = /\.(\w+)\(([^)]*)\)/g;
    let m;
    while ((m = re.exec(billetExpr))) calls.push({ method: m[1], args: m[2] });
    return calls;
  }

  evaluateChain(initialStr, calls) {
    let current = initialStr, type = "string";
    const steps = [];
    calls.forEach((call) => {
      if (call.method === "toUpperCase") { current = current.toUpperCase(); type = "string"; }
      else if (call.method === "toLowerCase") { current = current.toLowerCase(); type = "string"; }
      else if (call.method === "charAt") { const idx = parseInt(call.args, 10); current = current.charAt(idx); type = "char"; }
      else if (call.method === "length") { current = current.length; type = "number"; }
      steps.push({ method: call.method, value: current, type });
    });
    return { finalValue: current, finalType: type, steps };
  }

  formatValue(value, type) {
    if (type === "char") return `'${value}'`;
    if (type === "string") return `"${value}"`;
    return String(value);
  }

  async runChainReveal(cfg) {
    const calls = this._parseChainCalls(cfg.billet);
    const chain = this.evaluateChain(cfg.decl.value, calls);

    let running = cfg.decl.value;
    for (let i = 0; i < calls.length; i++) {
      if (!this._alive) return chain;
      const call = calls[i];
      if (call.method === "toUpperCase" || call.method === "toLowerCase") {
        const mode = call.method === "toUpperCase" ? "upper" : "lower";
        if (i > 0) await this.hookRefeed();
        running = await this.runTransformation(running, mode);
        this.showTrayResult(running);
      } else if (call.method === "charAt") {
        await this.miniClawCameo(running, parseInt(call.args, 10));
        running = chain.steps[i].value;
      } else if (call.method === "length") {
        await this.counterPanelCameo(running.length);
        running = chain.steps[i].value;
      }
      if (cfg.steps && cfg.steps[i]) {
        await this.showEvaluationFloat([cfg.steps[i]]);
      }
      await this.delay(200);
    }
    return chain;
  }

  async hookRefeed() {
    const hook = this.add.text(TRAY_CX, TRAY_CY - 40, "⌐", { font: "bold 20px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(20);
    this.roundElements.push(hook);
    await new Promise((res) => this.tweens.add({ targets: hook, x: PRESS_CX, y: ANVIL_Y - 40, duration: 350, onComplete: () => res() }));
    hook.destroy();
    this.tweens.add({ targets: this.trayTiles.map((t) => t.container), alpha: 0, duration: 150 });
    await this.delay(150);
    this.clearTray();
  }

  async miniClawCameo(str, index) {
    const cx = TRAY_CX, cy = TRAY_CY - 40;
    const claw = this.add.container(cx, cy - 30).setDepth(20);
    const g = this.add.graphics();
    g.lineStyle(2, C_PURPLE, 1);
    g.beginPath(); g.arc(-6, 6, 8, Phaser.Math.DegToRad(-40), Phaser.Math.DegToRad(80), false); g.strokePath();
    g.beginPath(); g.arc(6, 6, 8, Phaser.Math.DegToRad(100), Phaser.Math.DegToRad(220), false); g.strokePath();
    claw.add(g);
    this.roundElements.push(claw);
    await new Promise((res) => this.tweens.add({ targets: claw, y: cy, duration: 200, onComplete: () => res() }));
    const ch = str.charAt(index);
    const resultText = this.add.text(cx, cy + 30, `'${ch}'`, { font: "bold 22px Courier New", color: HEX_MAGENTA }).setOrigin(0.5).setDepth(21).setScale(0);
    this.roundElements.push(resultText);
    this.tweens.add({ targets: resultText, scale: 1, duration: 180, ease: "Back.easeOut" });
    this.time.delayedCall(150, () => this.tweens.add({ targets: claw, alpha: 0, duration: 200 }));
    await this.delay(300);
  }

  async counterPanelCameo(len) {
    const cx = TRAY_CX, cy = TRAY_CY - 40;
    const panel = this.add.container(cx, cy).setDepth(20).setAlpha(0);
    const g = this.add.graphics();
    g.lineStyle(2, C_AMBER, 1);
    g.strokeCircle(0, 0, 20);
    const t = this.add.text(0, 0, "0", { font: "bold 16px Courier New", color: HEX_AMBER }).setOrigin(0.5);
    panel.add([g, t]);
    this.roundElements.push(panel);
    this.tweens.add({ targets: panel, alpha: 1, duration: 150 });
    let n = 0;
    while (n < len) {
      if (!this._alive) return;
      n++;
      t.setText(String(n));
      this.tweens.add({ targets: panel, scale: 1.2, duration: 60, yoyo: true });
      await this.delay(70);
    }
    await this.delay(200);
  }

  showEvaluationFloat(lines) {
    return new Promise((res) => {
      const t = this.add.text(640, 460, lines[0], { font: "bold 13px Courier New", color: HEX_AMBER }).setOrigin(0.5).setDepth(20).setAlpha(0);
      this.roundElements.push(t);
      this.tweens.add({ targets: t, alpha: 1, duration: 150, onComplete: () => res() });
    });
  }

  // ══════════════════════════════════════════════════════════════
  // HUD & DISPLAYS
  // ══════════════════════════════════════════════════════════════

  createHUD() {
    const g = this.add.graphics().setDepth(50);
    g.fillStyle(0x0c0b12, 0.93);
    g.fillRect(0, 0, W, 64);
    g.lineStyle(1, 0x221f2e, 1);
    g.lineBetween(0, 64, W, 64);

    this.add.text(20, 14, "THE PRESS GAUNTLET", { font: "bold 15px Arial", color: "#b0bec5" }).setDepth(51);
    this.add.text(20, 36, "Tuning Phase — String Methods: toUpperCase() / toLowerCase()", { font: "11px Arial", color: "#546e7a" }).setDepth(51);

    this.waveText = this.add.text(640, 12, "WAVE 1 / 3", { font: "bold 14px Arial", color: HEX_AMBER }).setOrigin(0.5).setDepth(51);
    this.waveSquares = [];
    for (let i = 0; i < 5; i++) {
      const sq = this.add.rectangle(640 - 44 + i * 22, 40, 10, 10, 0x000000, 0).setStrokeStyle(1, C_GRAY).setDepth(51);
      this.waveSquares.push(sq);
    }

    this.add.text(1050, 12, "SCORE", { font: "9px Arial", color: "#546e7a" }).setDepth(51);
    this.scoreText = this.add.text(1050, 24, "0", { font: "bold 20px Arial", color: "#ffffff" }).setDepth(51);
    this.comboText = this.add.text(1140, 30, "×1", { font: "bold 16px Arial", color: HEX_AMBER }).setDepth(51);

    this.lifeIcons = [];
    for (let i = 0; i < 3; i++) {
      const lg = this.add.graphics({ x: 1195 + i * 26, y: 30 }).setDepth(51);
      lg.lineStyle(2, C_PURPLE, 1);
      lg.lineBetween(-6, -6, 6, 6);
      lg.lineBetween(-6, 6, 6, -6);
      lg.fillStyle(C_PURPLE, 1);
      lg.fillCircle(0, 0, 1.5);
      this.lifeIcons.push(lg);
    }
  }

  updateWaveIndicator(indexInWave, result) {
    const sq = this.waveSquares[indexInWave];
    if (!sq) return;
    sq.setFillStyle(result ? C_GREEN : C_RED, 1);
    sq.setStrokeStyle(1, result ? C_GREEN : C_RED);
  }

  createExpressionMonitor() {
    this.monitorGroup = null;
  }

  _syntaxTokens(line) {
    const tokens = [];
    const re = /("(?:[^"\\]|\\.)*")|(\bString\b|\bint\b)|(toUpperCase|toLowerCase|touppercase|tolowercase|ToUpperCase|charAt|length|print)|([(){}\[\];.,=])/g;
    let last = 0, m;
    const plain = (t) => t && tokens.push({ t, c: "#e0e0e0" });
    while ((m = re.exec(line))) {
      if (m.index > last) plain(line.slice(last, m.index));
      if (m[1]) tokens.push({ t: m[1], c: HEX_AMBER });
      else if (m[2]) tokens.push({ t: m[2], c: HEX_MAGENTA });
      else if (m[3]) tokens.push({ t: m[3], c: HEX_AMBER });
      else if (m[4]) tokens.push({ t: m[4], c: HEX_GRAY });
      last = m.index + m[0].length;
    }
    if (last < line.length) plain(line.slice(last));
    return tokens.length ? tokens : [{ t: line, c: HEX_CYAN }];
  }

  updateExpressionMonitor(lines) {
    if (this.monitorGroup) { this.monitorGroup.destroy(); this.monitorGroup = null; }
    const c = this.add.container(640, 32).setDepth(52);
    const arr = Array.isArray(lines) ? lines : [lines];
    const fontSize = arr.length > 1 ? 12 : 15;
    arr.forEach((line, i) => {
      const y = (i - (arr.length - 1) / 2) * (fontSize + 4);
      let x = 0;
      const lineC = this.add.container(0, y);
      this._syntaxTokens(line).forEach((tok) => {
        const t = this.add.text(x, 0, tok.t, { font: `bold ${fontSize}px Courier New`, color: tok.c }).setOrigin(0, 0.5);
        lineC.add(t);
        x += t.width;
      });
      lineC.x = -x / 2;
      c.add(lineC);
    });
    this.monitorGroup = c;
  }

  showCompileErrorStamp() {
    const stamp = this.add.text(640, 32, "COMPILE ERROR", { font: "bold 24px Arial", color: HEX_RED }).setOrigin(0.5).setDepth(60).setScale(2).setAngle(-8).setAlpha(0);
    this.roundElements.push(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 220, ease: "Cubic.easeOut" });
    this.screenShake(0.005, 180);
  }

  createTickerTape() {
    this.tickerStrip = this.add.rectangle(1000, 68, 70, 0, 0xeceff1, 0).setOrigin(0.5, 0).setDepth(55);
    this.tickerText = this.add.text(1000, 78, "", { font: "bold 12px Courier New", color: "#263238" }).setOrigin(0.5, 0).setDepth(56).setAlpha(0);
  }

  async printTickerTape(value) {
    this.tickerStrip.setSize(70, 0).setFillStyle(0xeceff1, 1).setPosition(1000, 68);
    await new Promise((res) => this.tweens.add({ targets: this.tickerStrip, displayHeight: 30, duration: 200, onComplete: () => res() }));
    this.tickerText.setText(value).setAlpha(1);
    this.roundElements.push(this.tickerStrip, this.tickerText);
    await this.delay(400);
  }

  clearTickerTape() {
    this.tickerStrip.setSize(70, 0).setFillStyle(0xeceff1, 0);
    this.tickerText.setText("").setAlpha(0);
  }

  // ══════════════════════════════════════════════════════════════
  // BIT — gauntlet marshal variant
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
    const goggles = this.add.graphics();
    goggles.lineStyle(2, C_AMBER, 1);
    goggles.strokeCircle(-9, -2, 5);
    goggles.strokeCircle(9, -2, 5);
    goggles.lineBetween(-4, -2, 4, -2);
    const stopwatch = this.add.graphics();
    stopwatch.lineStyle(1.5, 0xb0bec5, 1);
    stopwatch.strokeCircle(20, 4, 6);
    stopwatch.fillStyle(0xb0bec5, 1);
    stopwatch.fillRect(18, -4, 4, 2);
    this.stopwatchHand = this.add.graphics();
    c.add([g, tip, eye, pupil, goggles, stopwatch, this.stopwatchHand]);
    this.tweens.add({ targets: tip, alpha: 0.3, duration: 900, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: c, y: "+=4", duration: 2000, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
    this.bit = c;
  }

  updateStopwatch(time) {
    if (!this.stopwatchHand) return;
    this.stopwatchHand.clear();
    this.stopwatchHand.lineStyle(1, C_CYAN, 1);
    const a = (time % 4000) / 4000 * Math.PI * 2 - Math.PI / 2;
    this.stopwatchHand.lineBetween(20, 4, 20 + Math.cos(a) * 4, 4 + Math.sin(a) * 4);
  }

  bitSay(text) {
    this.hideBubble();
    const inner = this.add.text(0, 0, text, { font: "13px Arial", color: "#e0e0e0", wordWrap: { width: 330 } });
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
    await Promise.race([this.waitForClick(), this.delay(2500)]);
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
    this.loadOriginalCase("");
    await this.delay(400); if (!A()) return;
    await this.bitSay("Gauntlet night, Builder! Trials arrive as red-hot billets — but hot metal COOLS. Answer while it glows; once it hardens gray, the trial is dead slag.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();

    this.updateSourceLiteral("s", "demo");
    this.loadOriginalCase("demo");
    await this.sealCase(); if (!A()) return;
    this.updateExpressionMonitor("s.toUpperCase()");
    const demoBillet = this.spawnBillet({ round: 0, billet: "s.toUpperCase()" });
    await this.slideBilletIn(demoBillet); if (!A()) return;

    const a1 = this.createAnnotation(640, BILLET_Y - 90, "the heat is your TIMER", HEX_AMBER, { x: 640, y: BILLET_Y - 55 });
    await this.delay(300); if (!A()) return;
    const a2 = this.createAnnotation(THERMO_X, THERMO_TOP - 20, "watch the temperature", HEX_ORANGE, { x: THERMO_X + 3, y: THERMO_TOP });
    await this.delay(300); if (!A()) return;
    const a3 = this.createAnnotation(CASE_CX, CASE_CY - 90, "the original — sealed as always", HEX_CYAN, { x: CASE_CX, y: CASE_CY - 60 });
    await this.delay(300); if (!A()) return;

    await this.bitSay("Everything you learned still rules here: the press copies, the case stays sealed, and only reassignment sticks. Now prove it FAST. Strike while the iron is hot!");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();
    [a1, a2, a3].forEach((a) => this.tweens.add({ targets: a, alpha: 0, duration: 250, onComplete: () => a.destroy() }));
    if (demoBillet.container.active) demoBillet.container.destroy();

    try { localStorage.setItem(TUTORIAL_KEY, "true"); } catch (_) {}
    this.startWave(1);
  }

  createAnnotation(x, y, text, colorHex, arrowTarget = null) {
    const c = this.add.container(0, 0).setDepth(70).setAlpha(0);
    const txt = this.add.text(x, y, text, { font: "bold 12px Arial", color: colorHex }).setOrigin(0.5);
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

  // ══════════════════════════════════════════════════════════════
  // WAVE MANAGEMENT
  // ══════════════════════════════════════════════════════════════

  async startWave(waveNumber) {
    if (!this._alive || this.gameEnded) return;
    this.currentWave = waveNumber;
    this.waveText.setText(`WAVE ${waveNumber} / 3`);
    this.waveSquares.forEach((sq) => sq.setFillStyle(0x000000, 0).setStrokeStyle(1, C_GRAY));

    await this.ringGauntletBell();
    if (!this._alive || this.gameEnded) return;
    await this.showWaveBanner(WAVE_INFO[waveNumber].title);
    if (!this._alive || this.gameEnded) return;
    await this.bitSay(WAVE_INFO[waveNumber].brief);
    if (!this._alive || this.gameEnded) return;
    await this.delay(400);
    this.hideBubble();

    const firstIdx = ROUNDS.findIndex((r) => r.wave === waveNumber);
    this.startRound(firstIdx);
  }

  showWaveBanner(text) {
    return new Promise((res) => {
      const banner = this.add.container(-700, BILLET_Y).setDepth(80);
      const g = this.add.graphics();
      g.fillStyle(0x0a0e0a, 0.95);
      g.fillRect(-700, -35, 1400, 70);
      const t = this.add.text(0, 0, text, { font: "bold 22px Arial", color: HEX_AMBER }).setOrigin(0.5);
      banner.add([g, t]);
      this.tweens.add({
        targets: banner, x: 640, duration: 650, ease: "Cubic.easeOut",
        onComplete: () => this.time.delayedCall(350, () => {
          this.tweens.add({ targets: banner, x: 1980, duration: 650, ease: "Cubic.easeIn", onComplete: () => { banner.destroy(); res(); } });
        }),
      });
    });
  }

  // ══════════════════════════════════════════════════════════════
  // BILLET — visual timer
  // ══════════════════════════════════════════════════════════════

  heatColorFor(progress) {
    for (let i = 0; i < HEAT_STOPS.length - 1; i++) {
      const a = HEAT_STOPS[i], b = HEAT_STOPS[i + 1];
      if (progress <= a.p && progress >= b.p) {
        const t = (a.p - progress) / (a.p - b.p || 1);
        const colA = Phaser.Display.Color.ValueToColor(a.color);
        const colB = Phaser.Display.Color.ValueToColor(b.color);
        const c = Phaser.Display.Color.Interpolate.ColorWithColor(colA, colB, 100, t * 100);
        return Phaser.Display.Color.GetColor(Math.round(c.r), Math.round(c.g), Math.round(c.b));
      }
    }
    return HEAT_STOPS[HEAT_STOPS.length - 1].color;
  }

  spawnBillet(cfg) {
    const isBug = cfg.type === "bughunt";
    const width = isBug ? 560 : 480;
    const height = isBug ? 120 : 110;
    const container = this.add.container(-320, BILLET_Y).setDepth(30);
    const body = this.add.graphics();
    body.fillStyle(C_ORANGE, 1);
    body.lineStyle(2, 0x2e2a40, 1);
    body.fillRoundedRect(-width / 2, -height / 2, width, height, 10);
    body.strokeRoundedRect(-width / 2, -height / 2, width, height, 10);
    const glow = this.add.rectangle(0, 0, width + 16, height + 16, 0xff6f00, 0.25);
    container.add([glow, body]);

    if (cfg.round) {
      const label = this.add.text(-width / 2 + 10, -height / 2 + 10, `BILLET ${cfg.round}/15`, {
        font: "bold 9px Courier New", color: "#0b0a0e",
      }).setOrigin(0, 0.5);
      container.add(label);
      container.setData("label", label);
    }

    let tokenLines = null;
    if (cfg.billetLines && cfg.type === "bughunt") {
      tokenLines = cfg.billetLines.map((line, i) => this._renderClickableTokenLine(container, 0, (i - (cfg.billetLines.length - 1) / 2) * 22, line, width - 40));
    } else {
      const text = cfg.billet || (cfg.billetLines ? cfg.billetLines.join("  ") : "");
      let fontSize = 16;
      let { container: lc, width: lw } = this._renderTokenLine(0, 0, text, fontSize, "#1a1017");
      if (lw > width - 40) { lc.destroy(); fontSize = 13; ({ container: lc, width: lw } = this._renderTokenLine(0, 0, text, fontSize, "#1a1017")); }
      lc.x = -lw / 2;
      container.add(lc);
      container.setData("textLine", lc);
    }

    return { container, body, glow, width, height, tokenLines };
  }

  _renderTokenLine(x, y, line, fontSize, baseColor) {
    const c = this.add.container(x, y);
    const t = this.add.text(0, 0, line, { font: `bold ${fontSize}px Courier New`, color: baseColor }).setOrigin(0, 0.5);
    c.add(t);
    c.setData("mainText", t);
    return { container: c, width: t.width };
  }

  _renderClickableTokenLine(parent, x, y, line, maxWidth) {
    const tokens = this._syntaxTokens(line);
    const measured = tokens.map((tok) => {
      const t = this.add.text(0, 0, tok.t, { font: "13px Courier New" });
      const w = t.width;
      t.destroy();
      return w;
    });
    const totalW = measured.reduce((a, b) => a + b, 0);
    let cx = x - totalW / 2;
    const results = [];
    tokens.forEach((tok, i) => {
      const t = this.add.text(cx, y, tok.t, { font: "13px Courier New", color: "#1a1017" }).setOrigin(0, 0.5);
      const hitW = Math.max(measured[i], 30), hitH = 30;
      t.setInteractive(new Phaser.Geom.Rectangle(-((hitW - measured[i]) / 2), -hitH / 2, hitW, hitH), Phaser.Geom.Rectangle.Contains);
      t.input.cursor = "pointer";
      parent.add(t);
      results.push({ text: t, raw: tok.t, baseColor: "#1a1017" });
      cx += measured[i];
    });
    return results;
  }

  slideBilletIn(billet) {
    return new Promise((res) => {
      this.tweens.add({ targets: billet.container, x: 640, duration: 450, ease: "Cubic.easeOut", onComplete: () => res() });
    });
  }

  _redrawBilletHeat() {
    if (!this.billet) return;
    const progress = this._coolState.progress;
    const color = this.heatColorFor(progress);
    this.billet.body.clear();
    this.billet.body.fillStyle(color, 1);
    this.billet.body.lineStyle(2, 0x2e2a40, 1);
    this.billet.body.fillRoundedRect(-this.billet.width / 2, -this.billet.height / 2, this.billet.width, this.billet.height, 10);
    this.billet.body.strokeRoundedRect(-this.billet.width / 2, -this.billet.height / 2, this.billet.width, this.billet.height, 10);
    this.billet.glow.setAlpha(0.25 * Math.max(0, progress));

    const textColor = progress > 0.5 ? "#1a1017" : "#e0e0e0";
    const label = this.billet.container.getData("label");
    if (label) label.setColor(progress > 0.5 ? "#0b0a0e" : "#546e7a");
    const mainLine = this.billet.container.getData("textLine");
    if (mainLine) { const t = mainLine.getData("mainText"); if (t) t.setColor(textColor); }
    if (this.billet.tokenLines) {
      this.billet.tokenLines.forEach((line) => line.forEach((tok) => tok.text.setColor(textColor)));
    }

    this.updateTemperatureBar(progress, color);
  }

  launchBillet(billet, timeLimitMs) {
    this._coolState.progress = 1;
    this.urgencyState = "normal";
    this.roundStartTime = this.time.now;
    this._redrawBilletHeat();
    this.coolingTween = this.tweens.add({
      targets: this._coolState, progress: 0, duration: timeLimitMs, ease: "Linear",
      onUpdate: () => this._billetUrgencyCheck(),
      onComplete: () => { if (this._alive && !this.gameEnded && this.billet) this.onBilletTimeout(); },
    });
  }

  _billetUrgencyCheck() {
    this._redrawBilletHeat();
    const progress = this._coolState.progress;
    let state = "normal";
    if (progress < 0.15) state = "danger";
    else if (progress < 0.33) state = "warn";
    if (state !== this.urgencyState) {
      this.urgencyState = state;
      if (state === "danger" && this.billet) {
        // vibration rides on x — cooling only ever tweens the plain _coolState object, never container.x
        this.tweens.add({ targets: this.billet.container, x: 641, duration: 40, yoyo: true, repeat: -1 });
      }
    }
  }

  stopCooling() {
    if (this.coolingTween) { this.coolingTween.stop(); this.coolingTween = null; }
    if (this.billet) { this.tweens.killTweensOf(this.billet.container); this.billet.container.setX(640); }
  }

  stampBillet(result) {
    if (!this.billet) return;
    const color = result === "TEMPERED" ? HEX_GREEN : HEX_RED;
    const stamp = this.add.text(0, 0, result, { font: "bold 24px Arial", color }).setOrigin(0.5).setScale(2).setAngle(-10).setAlpha(0).setDepth(2);
    this.billet.container.add(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 180, ease: "Cubic.easeOut" });
  }

  async tongDragAway() {
    if (!this.billet) return;
    await new Promise((res) => this.tweens.add({ targets: this.billet.container, x: 1400, duration: 350, ease: "Cubic.easeIn", onComplete: () => res() }));
    this.billet.container.destroy();
    this.billet = null;
  }

  async crackBillet() {
    if (!this.billet) return;
    this._redrawBilletHeat();
    const crackG = this.add.graphics().setDepth(3);
    const w = this.billet.width;
    crackG.lineStyle(2, 0x0b0a0e, 1);
    crackG.beginPath();
    crackG.moveTo(this.billet.container.x - w / 3, BILLET_Y - 20);
    crackG.lineTo(this.billet.container.x - 10, BILLET_Y);
    crackG.lineTo(this.billet.container.x + w / 4, BILLET_Y + 15);
    crackG.strokePath();
    this.roundElements.push(crackG);
    this.screenShake(0.002, 100);
    await this.delay(200);
  }

  // ══════════════════════════════════════════════════════════════
  // GAMEPLAY — round system
  // ══════════════════════════════════════════════════════════════

  async startRound(index) {
    if (!this._alive || this.gameEnded) return;
    this.currentRound = index;
    const cfg = ROUNDS[index];
    this.answered = false;
    this.inputLocked = true;
    this.clearRound();

    this.updateSourceLiteral(cfg.decl.name, cfg.decl.value);
    this.loadOriginalCase(cfg.decl.value);
    await this.sealCase();
    this.clearTray();

    if (cfg.type === "predict" || cfg.type === "chain") this.updateExpressionMonitor(cfg.billet);
    else if (cfg.type === "sealed") this.updateExpressionMonitor(cfg.billetLines);
    else if (cfg.type === "judge") this.updateExpressionMonitor(cfg.billet);
    else if (cfg.type === "bughunt") this.updateExpressionMonitor("");

    this.billet = this.spawnBillet(cfg);
    await this.slideBilletIn(this.billet);
    if (!this._alive || this.gameEnded) return;

    this.renderChallenge(cfg);
    this.launchBillet(this.billet, cfg.timeLimit);
    this.inputLocked = false;
  }

  clearRound() {
    this._teardownKeys();
    this.hideBubble();
    this.optionBubbles.forEach((b) => b.destroy());
    this.optionBubbles = [];
    this.roundElements.forEach((e) => { if (e && e.destroy) e.destroy(); });
    this.roundElements = [];
    this.stopCooling();
    if (this.billet) { this.billet.container.destroy(); this.billet = null; }
    if (this.literalGroup) { this.literalGroup.destroy(); this.literalGroup = null; }
    this.clearTickerTape();
    if (this.monitorGroup) { this.monitorGroup.destroy(); this.monitorGroup = null; }
  }

  renderChallenge(cfg) {
    switch (cfg.type) {
      case "predict": this.setupPredict(cfg); break;
      case "sealed": this.setupSealed(cfg); break;
      case "judge": this.setupJudge(cfg); break;
      case "chain": this.setupChain(cfg); break;
      case "bughunt": this.setupBugHunt(cfg); break;
    }
  }

  // ══════════════════════════════════════════════════════════════
  // OPTION BUBBLES
  // ══════════════════════════════════════════════════════════════

  showOptionBubbles(options, onSelect) {
    this.optionBubbles = [];
    const shuffled = Phaser.Utils.Array.Shuffle(options.slice());
    const style = { font: "bold 15px Courier New", color: HEX_CYAN };
    const widths = shuffled.map((o) => {
      const t = this.add.text(0, 0, o.label || String(o.value), style);
      const w = Math.max(t.width + 28, 56);
      t.destroy();
      return w;
    });
    const totalW = widths.reduce((a, b) => a + b, 0) + (shuffled.length - 1) * 12;
    let bx = 640 - totalW / 2;

    shuffled.forEach((opt, i) => {
      const w = widths[i], h = 38;
      const c = this.add.container(bx + w / 2, 560).setDepth(25);
      bx += w + 12;
      const g = this.add.graphics();
      const draw = (stroke) => {
        g.clear();
        g.fillStyle(0x1e1e3a, 1);
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 19);
        g.lineStyle(1.5, stroke, 1);
        g.strokeRoundedRect(-w / 2, -h / 2, w, h, 19);
      };
      draw(C_CYAN);
      const txt = this.add.text(0, 0, opt.label || String(opt.value), style).setOrigin(0.5);
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
      this._resolveAnswer(cfg, correct, opt.value, opt.tag, async () => {
        draw(correct ? C_GREEN : C_RED);
        if (!correct) {
          this.tweens.add({ targets: bubble, x: bubble.x + 6, duration: 45, yoyo: true, repeat: 5 });
          const correctBubble = this.optionBubbles.find((b) => b.getData("value") === cfg.correct);
          if (correctBubble) correctBubble.getData("draw")(C_GREEN);
        }
        const method = cfg.billet.includes("toUpperCase") ? "upper" : "lower";
        const result = await this.runTransformation(cfg.decl.value, method);
        if (!this._alive) return;
        this.showTrayResult(result);
        await this.inspectionSweep();
      });
    });
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE B — SEALED
  // ══════════════════════════════════════════════════════════════

  setupSealed(cfg) {
    this.showOptionBubbles(cfg.options, (opt, bubble, draw) => {
      const correct = opt.value === cfg.correct;
      this._resolveAnswer(cfg, correct, opt.value, opt.tag, async () => {
        draw(correct ? C_GREEN : C_RED);
        if (!correct) {
          this.tweens.add({ targets: bubble, x: bubble.x + 6, duration: 45, yoyo: true, repeat: 5 });
          const correctBubble = this.optionBubbles.find((b) => b.getData("value") === cfg.correct);
          if (correctBubble) correctBubble.getData("draw")(C_GREEN);
        }
        const method = cfg.billetLines.some((l) => l.includes("toUpperCase")) ? "upper" : "lower";
        const result = await this.runTransformation(cfg.decl.value, method);
        if (!this._alive) return;

        if (cfg.reveal === "discard") {
          await this.discardTrayToChute();
          await this.inspectionSweep();
          await this.printTickerTape(`"${cfg.decl.value}"`);
        } else if (cfg.reveal === "reassign") {
          this.showTrayResult(result);
          await this.delay(200);
          await this.replaceCaseContents(result);
          this.updateSourceLiteral(cfg.decl.name, result);
          this.clearTray();
          await this.printTickerTape(`"${result}"`);
        }
      });
    });
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE C — JUDGE
  // ══════════════════════════════════════════════════════════════

  showJudgmentButtons(onSelect) {
    const mk = (x, label, color, key) => {
      const c = this.add.container(x, 570).setDepth(25);
      const g = this.add.graphics();
      const draw = (fillA) => {
        g.clear();
        g.fillStyle(color, fillA);
        g.fillRoundedRect(-90, -27, 180, 54, 12);
        g.lineStyle(2, color, 1);
        g.strokeRoundedRect(-90, -27, 180, 54, 12);
      };
      draw(0);
      const hex = "#" + color.toString(16).padStart(6, "0");
      const t = this.add.text(0, -6, label, { font: "bold 15px Arial", color: hex }).setOrigin(0.5);
      const keyHint = this.add.text(0, 16, `[${key}]`, { font: "10px Arial", color: "#546e7a" }).setOrigin(0.5);
      c.add([g, t, keyHint]);
      c.setSize(180, 54);
      c.setInteractive({ useHandCursor: true });
      c.on("pointerover", () => { if (!this.inputLocked) { draw(0.08); c.setScale(1.03); } });
      c.on("pointerout", () => { draw(0); c.setScale(1); });
      c.on("pointerdown", () => { if (!this.inputLocked) { this.inputLocked = true; onSelect(key === "V" ? "valid" : "invalid"); } });
      this.roundElements.push(c);
      this.optionBubbles.push(c);
    };
    mk(480, "✓ VALID", C_GREEN, "V");
    mk(800, "✗ INVALID", C_RED, "X");

    this._keyHandler = (e) => {
      if (this.inputLocked) return;
      if (e.key.toLowerCase() === "v") { this.inputLocked = true; onSelect("valid"); }
      else if (e.key.toLowerCase() === "x") { this.inputLocked = true; onSelect("invalid"); }
    };
    this.input.keyboard.on("keydown", this._keyHandler);
  }

  _teardownKeys() {
    if (this._keyHandler) { this.input.keyboard.off("keydown", this._keyHandler); this._keyHandler = null; }
  }

  setupJudge(cfg) {
    this.showJudgmentButtons((choice) => {
      const correct = choice === cfg.correct;
      this._teardownKeys();
      this._resolveAnswer(cfg, correct, choice, correct ? null : cfg.wrongTag, async () => {
        if (cfg.correct === "invalid") {
          this.showCompileErrorStamp();
          await this.delay(250);
          if (!this._alive) return;
          const anno = this.add.text(640, 62, cfg.explanation, { font: "bold 12px Arial", color: HEX_RED, wordWrap: { width: 560 } }).setOrigin(0.5).setDepth(60).setAlpha(0);
          this.roundElements.push(anno);
          this.tweens.add({ targets: anno, alpha: 1, duration: 220 });
          await this.delay(600);
        } else {
          const method = cfg.billet.includes("toUpperCase") ? "upper" : "lower";
          const result = await this.runTransformation(cfg.decl.value, method);
          if (!this._alive) return;
          this.showTrayResult(result);
          await this.inspectionSweep();
        }
      });
    });
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE D — CHAIN
  // ══════════════════════════════════════════════════════════════

  setupChain(cfg) {
    this.showOptionBubbles(cfg.options, (opt, bubble, draw) => {
      const correct = opt.value === cfg.correct;
      this._resolveAnswer(cfg, correct, opt.value, opt.tag, async () => {
        draw(correct ? C_GREEN : C_RED);
        if (!correct) {
          this.tweens.add({ targets: bubble, x: bubble.x + 6, duration: 45, yoyo: true, repeat: 5 });
          const correctBubble = this.optionBubbles.find((b) => b.getData("value") === cfg.correct);
          if (correctBubble) correctBubble.getData("draw")(C_GREEN);
        }
        await this.runChainReveal(cfg);
      });
    });
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE E — BUG HUNT
  // ══════════════════════════════════════════════════════════════

  setupBugHunt(cfg) {
    const strip = this.add.text(640, 265, "CLICK THE BUG", { font: "bold 13px Arial", color: HEX_MAGENTA }).setOrigin(0.5).setDepth(25);
    this.roundElements.push(strip);
    this.tweens.add({ targets: strip, alpha: 0.4, duration: 700, yoyo: true, repeat: -1 });

    const lines = this.billet.tokenLines;
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
        await this.delay(130);
        if (!this._alive) return;
        token.text.setColor(HEX_GREEN);
        const strike = this.add.rectangle(token.text.x + token.text.width / 2, token.text.y, token.text.width + 4, 2, C_RED).setDepth(36);
        this.roundElements.push(strike);
        const fixed = this.add.text(token.text.x, token.text.y - 18, cfg.fixedToken, { font: "bold 12px Courier New", color: HEX_GREEN }).setOrigin(0, 0.5).setAlpha(0).setDepth(36);
        this.roundElements.push(fixed);
        this.tweens.add({ targets: fixed, alpha: 1, duration: 200 });
        await this.delay(300);
        if (!this._alive) return;
        if (cfg.round === 15) {
          // dual reveal: buggy discard, then fixed reassign
          const r1 = await this.runTransformation(cfg.decl.value, "upper");
          await this.discardTrayToChute();
          await this.printTickerTape(`"${cfg.decl.value}"`);
          await this.delay(300);
          if (!this._alive) return;
          const r2 = await this.runTransformation(cfg.decl.value, "upper");
          await this.replaceCaseContents(r2);
          this.updateSourceLiteral(cfg.decl.name, r2);
          this.clearTray();
          await this.printTickerTape(`"${r2}"`);
        } else {
          const result = await this.runTransformation(cfg.decl.value, "upper");
          if (!this._alive) return;
          this.showTrayResult(result);
          await this.inspectionSweep();
        }
      } else {
        this.tweens.add({ targets: token.text, x: token.text.x + 4, duration: 40, yoyo: true, repeat: 5 });
        const realBug = lines.flat().find((t) => t.raw === cfg.faultToken);
        if (realBug) {
          realBug.text.setColor(HEX_RED);
          this.tweens.add({ targets: realBug.text, scale: 1.3, duration: 200, yoyo: true, repeat: 2 });
        }
      }
    });
  }

  // ══════════════════════════════════════════════════════════════
  // ANSWER RESOLUTION
  // ══════════════════════════════════════════════════════════════

  async _resolveAnswer(cfg, correct, selected, tag, revealFn) {
    if (this.answered) return;
    this.answered = true;
    this.stopCooling();
    const elapsed = this.time.now - this.roundStartTime;
    const timePctUsed = Phaser.Math.Clamp(elapsed / cfg.timeLimit, 0, 1);
    this.logAttempt(cfg, correct, selected, tag, elapsed, timePctUsed);

    this.stampBillet(correct ? "TEMPERED" : "SLAG");
    if (revealFn) await revealFn();
    if (!this._alive) return;
    await this.delay(300);
    if (!this._alive) return;
    await this.tongDragAway();
    if (!this._alive) return;

    const indexInWave = (cfg.round - 1) % 5;
    this.updateWaveIndicator(indexInWave, correct);

    if (correct) this.onCorrectAnswer(cfg, timePctUsed);
    else await this.onIncorrectAnswer(cfg, tag);
  }

  async onBilletTimeout() {
    if (this.answered || !this.billet) return;
    this.answered = true;
    this.inputLocked = true;
    const cfg = ROUNDS[this.currentRound];
    this._teardownKeys();
    this.stopCooling();
    this.logAttempt(cfg, false, null, "timeout", cfg.timeLimit, 1);
    await this.crackBillet();
    if (!this._alive) return;
    this.stampBillet("SLAG");
    await this.delay(150);
    if (!this._alive) return;
    await this.tongDragAway();
    if (!this._alive) return;
    const indexInWave = (cfg.round - 1) % 5;
    this.updateWaveIndicator(indexInWave, false);
    await this.onIncorrectAnswer(cfg, "timeout");
  }

  logAttempt(cfg, correct, selected, tag, timeMs, timePctUsed) {
    this.totalTimePctUsed += timePctUsed;
    this.attemptLog.push({
      round: cfg.round, wave: cfg.wave, type: cfg.type, concept: cfg.concept, correct,
      selectedAnswer: selected, misconceptionTag: tag || null,
      timeMs: Math.round(timeMs), timePctUsed, attemptNumber: this.attemptLog.filter((a) => a.round === cfg.round).length + 1,
    });
  }

  onCorrectAnswer(cfg, timePctUsed) {
    if (this.gameEnded) return;
    this.inputLocked = true;
    this.correctFirstTry++;
    this.updateCombo(true);
    const multiplier = Math.min(this.combo, 5);
    let points = 100 * multiplier;
    const remaining = 1 - timePctUsed;
    if (remaining > 0.6) { points += 50; this.fastBonusCount++; this.createFloatingText(640, 300, "⚡ WHITE-HOT +50", HEX_AMBER, "bold 15px Arial"); }
    else if (remaining > 0.3) { points += 25; this.fastBonusCount++; this.createFloatingText(640, 300, "⚡ WHITE-HOT +25", HEX_AMBER, "bold 15px Arial"); }
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
    this.screenShake(0.003, 150);
    const dead = this.loseLife();
    if (dead) { this.time.delayedCall(500, () => this.gameOver()); return; }
    await this.showBitFeedback(MISCONCEPTION_FEEDBACK[tag] || "Inspect carefully — check the die, the case, and the tray.");
    if (!this._alive || this.gameEnded) return;
    this.time.delayedCall(500, () => {
      if (!this._alive || this.gameEnded) return;
      this.advanceRound();
    });
  }

  advanceRound() {
    const next = this.currentRound + 1;
    if (next >= ROUNDS.length) { this.levelComplete(); return; }
    if (ROUNDS[next].wave !== ROUNDS[this.currentRound].wave) this.startWave(ROUNDS[next].wave);
    else this.startRound(next);
  }

  updateScore(points) {
    this.score += points;
    const counter = { v: this.displayScore };
    this.tweens.add({
      targets: counter, v: this.score, duration: 300,
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
    const p = this.add.particles(x + 10, y + 8, "l32_dot", {
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
    const p = this.add.particles(x, y, "l32_dot", {
      speed: { min: 80, max: 260 }, angle: { min: 0, max: 360 }, scale: { start: 0.9, end: 0 }, lifespan: 500,
      tint: [C_CYAN, C_AMBER, C_GREEN, C_PURPLE, 0xffffff], emitting: false,
    }).setDepth(65);
    p.explode(count);
    this.time.delayedCall(900, () => p.destroy());
  }

  screenShake(intensity = 0.003, duration = 150) {
    this.cameras.main.shake(duration, intensity);
  }

  // ══════════════════════════════════════════════════════════════
  // END STATES
  // ══════════════════════════════════════════════════════════════

  async forgeCeremony() {
    this.furnaceCircles.forEach((c) => this.tweens.add({ targets: c, fillAlpha: c.fillAlpha * 2, duration: 400, yoyo: true }));
    for (let i = 0; i < 6; i++) {
      if (!this._alive) return;
      await new Promise((res) => this.tweens.add({ targets: this.ramContainer, y: ANVIL_Y - 30, duration: 60, onComplete: () => res() }));
      this._steamPuff();
      const sparks = this.add.particles(PRESS_CX, ANVIL_Y, "l32_dot", {
        speed: { min: 40, max: 100 }, angle: { min: 200, max: 340 }, scale: { start: 0.6, end: 0 }, lifespan: 280,
        tint: i % 2 === 0 ? C_CYAN : C_ORANGE, emitting: false,
      }).setDepth(13);
      sparks.explode(5);
      this.time.delayedCall(350, () => sparks.destroy());
      this.tweens.add({ targets: this.ramContainer, y: RAM_UP_Y, duration: 60 });
      await this.delay(90);
    }
    await this.ringGauntletBell();
    this.createConfetti(TRAY_CX, TRAY_CY);
    await this.delay(500);
  }

  gameOver() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearRound();
    this.hideBubble();
    this.modeLamp.setFillStyle(0x333333);

    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
    this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });

    const title = this.add.text(640, 240, "FORGE COLD", { font: "bold 40px Arial", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
    this.tweens.add({
      targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut",
      onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }),
    });
    this.add.text(640, 310, `Score: ${this.score}`, { font: "20px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
    this.add.text(640, 350, `Billets Tempered: ${this.currentRound} / ${ROUNDS.length}`, { font: "16px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);

    this._makeButton(640, 420, "RELIGHT THE FORGE", 220, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearRound();
    this.hideBubble();

    const accuracy = this.correctFirstTry / ROUNDS.length;
    const avgTimePct = this.totalTimePctUsed / ROUNDS.length;
    try { GameManager.completeLevel(31, Math.round(accuracy * 100)); } catch (_) {}
    try { BadgeSystem.unlock("case_methods_schema_tuned"); } catch (_) {}
    try {
      localStorage.setItem("level32_results", JSON.stringify({
        level: 32, concept: "string_case_methods", phase: "tuning",
        score: this.score, accuracy, avgTimePct, fastBonuses: this.fastBonusCount,
        comboMax: this.maxCombo, stars: this._starRating(accuracy, avgTimePct),
        livesRemaining: this.lives, attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.forgeCeremony().then(() => { if (this._alive) this.showScoreTally(accuracy, avgTimePct); });
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
    panel.fillStyle(0x131019, 1);
    panel.fillRoundedRect(360, 140, 560, 440, 16);
    panel.lineStyle(2, C_GREEN, 1);
    panel.strokeRoundedRect(360, 140, 560, 440, 16);

    const title = this.add.text(640, 190, "GAUNTLET SURVIVED", { font: "bold 34px Arial", color: HEX_GREEN }).setOrigin(0.5).setDepth(91).setScale(0);
    this.tweens.add({ targets: title, scale: 1, duration: 350, ease: "Back.easeOut" });

    const lines = [
      `ACCURACY: ${Math.round(accuracy * 100)}%`,
      `AVG RESPONSE: ${Math.round(avgTimePct * 100)}% of time limit`,
      `WHITE-HOT BONUSES: ${this.fastBonusCount}`,
      `BEST COMBO: ×${this.maxCombo}`,
    ];
    lines.forEach((s, i) => {
      const t = this.add.text(500, 250 + i * 30, s, { font: "14px Arial", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 250, delay: 300 + i * 150 });
    });
    const totalText = this.add.text(500, 250 + 4 * 30, "TOTAL: 0", { font: "bold 24px Arial", color: HEX_AMBER }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: totalText, alpha: 1, duration: 250, delay: 1050 });
    const counter = { v: 0 };
    this.tweens.add({ targets: counter, v: this.score, duration: 1000, delay: 1050, onUpdate: () => totalText.setText(`TOTAL: ${Math.round(counter.v)}`) });

    const stars = this._starRating(accuracy, avgTimePct);
    for (let i = 0; i < 3; i++) {
      const earned = i < stars;
      const s = this.add.text(640 + (i - 1) * 60, 415, "★", { font: "40px Arial", color: earned ? HEX_AMBER : "#2a3040" }).setOrigin(0.5).setDepth(91).setScale(0);
      this.tweens.add({ targets: s, scale: 1, duration: 250, delay: 1650 + i * 200, ease: earned ? "Back.easeOut" : "Cubic.easeOut" });
    }

    const badge = this.add.container(640, 495).setDepth(91).setAlpha(0);
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillCircle(0, 0, 30);
    bg.lineStyle(2, C_AMBER, 1);
    bg.strokeCircle(0, 0, 30);
    bg.fillStyle(C_ORANGE, 1);
    bg.fillRoundedRect(-14, -8, 28, 16, 3);
    bg.lineStyle(2, C_GREEN, 1);
    bg.lineBetween(-6, 0, -2, 5);
    bg.lineBetween(-2, 5, 8, -6);
    badge.add(bg);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 2100 });
    const badgeLbl = this.add.text(640, 533, "CASE METHODS SCHEMA TUNED", { font: "bold 12px Arial", color: HEX_AMBER }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: badgeLbl, alpha: 1, duration: 300, delay: 2200 });

    this._makeButton(500, 555, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(760, 555, "NEXT: The Foundry →", 220, 44, { fill: 0x00733a, stroke: C_GREEN, textColor: "#ffffff" }, () => {
      if (this.scene.get("Level33Scene")) this.scene.start("Level33Scene");
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
