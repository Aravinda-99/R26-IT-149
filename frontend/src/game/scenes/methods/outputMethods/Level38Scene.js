/**
 * Level 38 — "The Signal Room" (Output Methods: Tuning Phase)
 * ===========================================================================
 * Tunes the Level 37 println() schema under time pressure. A CRT signal
 * monitor is the hero timer: static noise creeps across the screen over the
 * round's time limit; answer before it degrades to full snow or the trial
 * is lost. The reveal always fires the true transmission on a compact
 * reference tower + log (ported from Level 37), so the "+" operator's
 * left-to-right, String-sticky behavior is always genuinely demonstrated —
 * never scripted.
 *
 * evaluatePrintln() extends the Level 37 evaluator with parenthesized
 * sub-expressions: a `(...)` group tokenizes as one unit and is evaluated
 * recursively via the same left-fold rules BEFORE folding into the outer
 * expression. This is what makes "sum: " + (1 + 2) → "sum: 3" while
 * "sum: " + 1 + 2 → "sum: 12" — both computed, not looked up.
 */

import Phaser from "phaser";
import { GameManager } from "../../../GameManager.js";
import { BadgeSystem } from "../../../BadgeSystem.js";

const W = 1280, H = 720;

const C_CYAN = 0x00e5ff, C_GOLD = 0xffd740, C_AMBER = 0xffb74d;
const C_VIOLET = 0xb39ddb, C_PURPLE = 0x7b1fa2, C_MAGENTA = 0xff4081;
const C_GREEN = 0x4caf50, C_GREEN_BRIGHT = 0x00e676, C_RED = 0xf44336, C_GRAY = 0x78909c;
const HEX_CYAN = "#00e5ff", HEX_GOLD = "#ffd740", HEX_AMBER = "#ffb74d";
const HEX_VIOLET = "#b39ddb", HEX_PURPLE = "#7b1fa2", HEX_GRAY = "#78909c";
const HEX_GREEN = "#4caf50", HEX_GREEN_BRIGHT = "#00e676", HEX_RED = "#f44336";
const HEX_MAGENTA = "#ff4081";

const CRT_X = 500, CRT_Y = 250, CRT_W = 490, CRT_H = 240;
const CRT_TOP_Y = CRT_Y - CRT_H / 2;
const TOWER_X = 115, TOWER_TOP_Y = 280, TOWER_BASE_Y = 610;
const MARQUEE_X = 175, MARQUEE_Y = 330, MARQUEE_W = 170, MARQUEE_H = 34;
const LOG_X = 800, LOG_Y = 90, LOG_W = 460, LOG_H = 490;
const LOG_CONTENT_Y0 = LOG_Y + 36;
const ROW_H = 26;
const TUTORIAL_KEY = "level38_tutorial_done";
const WAVE_TIME = { 1: 12000, 2: 10000, 3: 9000 };
let firstNewlineAnnotationShown38 = false;

// ══════════════════════════════════════════════════════════════
// ROUND CONFIGURATION
// ══════════════════════════════════════════════════════════════
const ROUNDS = [
  { round: 1, wave: 1, type: "predict", source: ['System.out.println("Signal");'],
    question: "What appears on the log?", correct: "Signal",
    options: [
      { value: "Signal", tag: null },
      { value: '"Signal"', tag: "quotes_print_belief" },
      { value: "signal", tag: "case_change_belief" },
      { value: "Error", tag: "argument_type_doubt" },
    ], concept: "fluent_string_literal" },

  { round: 2, wave: 1, type: "predict", decl: "int channel = 7;", source: ["System.out.println(channel);"],
    question: "What appears on the log?", correct: "7",
    options: [
      { value: "7", tag: null },
      { value: "channel", tag: "variable_as_literal_belief" },
      { value: '"7"', tag: "int_prints_with_quotes_belief" },
      { value: "int 7", tag: "type_prints_with_value_belief" },
    ], concept: "fluent_variable" },

  { round: 3, wave: 1, type: "predict", source: ["System.out.println(3.5 + 1.5);"],
    question: "What appears on the log?", correct: "5.0",
    options: [
      { value: "5.0", tag: null },
      { value: "5", tag: "double_truncates_belief" },
      { value: "3.51.5", tag: "plus_always_concatenates" },
      { value: "Error", tag: "double_addition_doubt" },
    ],
    revealNote: "Two orange double slugs fuse under a gold + into 5.0 — pure numeric context, arithmetic wins.",
    concept: "fluent_double_arithmetic" },

  { round: 4, wave: 1, type: "predict", decl: "char grade = 'A';", source: ["System.out.println(grade);"],
    question: "What appears on the log?", correct: "A",
    options: [
      { value: "A", tag: null },
      { value: "'A'", tag: "char_prints_with_quotes" },
      { value: "65", tag: "char_as_ascii_int" },
      { value: '"A"', tag: "char_prints_as_string" },
    ],
    revealNote: "The marquee shows the char in magenta single quotes — but the quotes are IN THE CODE, not in the output.",
    concept: "char_prints_bare" },

  { round: 5, wave: 1, type: "predict", decl: 'String name = "Bit";', source: ['System.out.println("Hi, " + name + "!");'],
    question: "What appears on the log?", correct: "Hi, Bit!",
    options: [
      { value: "Hi, Bit!", tag: null },
      { value: "Hi, name!", tag: "variable_as_literal_belief" },
      { value: '"Hi, " + "Bit" + "!"', tag: "plus_not_evaluated_belief" },
      { value: "Hi, !", tag: "variable_empty_belief" },
    ], concept: "concat_with_variable_fluent" },

  { round: 6, wave: 2, type: "predict", source: ["System.out.println(1 + 2);"],
    question: "What appears on the log?", correct: "3",
    options: [
      { value: "3", tag: null },
      { value: "12", tag: "plus_always_concatenates" },
      { value: '"3"', tag: "int_prints_with_quotes_belief" },
      { value: "1 + 2", tag: "plus_not_evaluated_belief" },
    ],
    revealNote: "No String in sight — the gold + performs pure arithmetic.",
    concept: "pure_arithmetic_fluent" },

  { round: 7, wave: 2, type: "predict", source: ['System.out.println("1" + 2);'],
    question: "What appears on the log?", correct: "12",
    options: [
      { value: "12", tag: null },
      { value: "3", tag: "plus_always_adds" },
      { value: '"12"', tag: "quotes_print_belief" },
      { value: "Error", tag: "mixed_type_confusion" },
    ],
    revealNote: "One quoted operand and the + flips to cyan — String stickiness activates.",
    concept: "string_forces_concat" },

  { round: 8, wave: 2, type: "predict", source: ['System.out.println(1 + 2 + "3");'],
    question: "What appears on the log?", correct: "33",
    options: [
      { value: "33", tag: null },
      { value: "6", tag: "plus_always_adds" },
      { value: "123", tag: "chain_left_to_right_ignored" },
      { value: '"33"', tag: "quotes_print_belief" },
    ],
    revealNote: 'Left-to-right stickiness: 1 + 2 = 3 (still pure numeric), THEN + "3" flips to cyan concat → "33".',
    concept: "left_side_arithmetic_first" },

  { round: 9, wave: 2, type: "predict", source: ['System.out.println("total: " + 1 + 2);'],
    question: "What appears on the log?", correct: "total: 12",
    options: [
      { value: "total: 12", tag: null },
      { value: "total: 3", tag: "plus_always_adds" },
      { value: "total: 1 + 2", tag: "plus_not_evaluated_belief" },
      { value: "total: 12.0", tag: "int_becomes_double_belief" },
    ],
    revealNote: '"total: " locks in String stickiness IMMEDIATELY on the first +. Every subsequent operand concatenates.',
    concept: "sticky_from_start" },

  { round: 10, wave: 2, type: "predict", source: ['System.out.println("sum: " + (1 + 2));'],
    question: "What appears on the log?", correct: "sum: 3",
    options: [
      { value: "sum: 3", tag: null },
      { value: "sum: 12", tag: "parens_ignored" },
      { value: "sum: 1 + 2", tag: "plus_not_evaluated_belief" },
      { value: "Error", tag: "parens_in_string_doubt" },
    ],
    revealNote: "Parentheses are the ESCAPE HATCH. Inside (1 + 2), pure numeric context wins → 3, THEN concatenates.",
    concept: "parens_force_arithmetic" },

  { round: 11, wave: 3, type: "trace", source: ['System.out.println("A");', 'System.out.println("B");', 'System.out.println("C");'],
    question: "What appears on the log?", correct: "A⏎B⏎C",
    options: [
      { value: "A⏎B⏎C", label: "A / B / C (three lines)", tag: null },
      { value: "ABC", tag: "same_line_belief" },
      { value: "A B C", tag: "space_between_belief" },
      { value: "C", tag: "last_overwrites_belief" },
    ], concept: "stacking_fluent" },

  { round: 12, wave: 3, type: "trace", source: ['System.out.println("open");', "System.out.println();", 'System.out.println("close");'],
    question: "What appears on the log?", correct: "open⏎⏎close",
    options: [
      { value: "open⏎⏎close", label: "open / (blank line) / close", tag: null },
      { value: "open⏎close", tag: "empty_println_ignored_belief" },
      { value: "openclose", tag: "same_line_belief" },
      { value: "Error", tag: "empty_println_error_belief" },
    ],
    revealNote: "The marquee shows the lonely purple ⏎ glyph; the log's cursor slot drops one row, leaving a blank line visible.",
    concept: "blank_line_fluent" },

  { round: 13, wave: 3, type: "trace", decl: "int x = 5;\nint y = 10;",
    source: ['System.out.println("x = " + x);', 'System.out.println("y = " + y);', 'System.out.println("sum: " + (x + y));'],
    question: "What appears on the log?", correct: "x = 5⏎y = 10⏎sum: 15",
    options: [
      { value: "x = 5⏎y = 10⏎sum: 15", label: "x = 5 / y = 10 / sum: 15", tag: null },
      { value: "x = 5⏎y = 10⏎sum: 510", tag: "parens_ignored" },
      { value: "x = 5⏎y = 10⏎sum: x + y", tag: "plus_not_evaluated_belief" },
      { value: "x = x⏎y = y⏎sum: 15", tag: "variable_as_literal_belief" },
    ],
    revealNote: "Line 3 is the payoff — (x + y) evaluates to 15 inside the parens, THEN concatenates onto 'sum: '.",
    concept: "trace_with_parens_escape" },

  { round: 14, wave: 3, type: "bughunt",
    lines: ['System.out.println("Hi");', 'println("Bye");'],
    faultLine: 2, fixedToken: "System.out.println",
    explanation: "println is a method of System.out — it has no life of its own! Line 2 forgot the prefix, and the compiler refused. Add System.out. before every println.",
    wrongTag: "bare_println_belief", concept: "missing_system_out_prefix" },

  { round: 15, wave: 3, type: "bughunt",
    lines: ['System.out.println("Sum: " + 3 + 4);'],
    faultLine: 1, faultTokens: ["3", "+", "4"], fix: '"Sum: " + (3 + 4)',
    explanation: 'Left-to-right stickiness struck! "Sum: " + 3 concatenated to "Sum: 3", then + 4 concatenated again to "Sum: 34". Wrap the arithmetic in parentheses: (3 + 4).',
    wrongTag: "parens_missing_precedence",
    revealNote: 'The reveal plays both futures: first the buggy "Sum: 34" lands on the log, then the fixed version (with parens) lands "Sum: 7" beneath it.',
    concept: "precedence_paren_bug" },
];

const MISCONCEPTION_FEEDBACK = {
  variable_as_literal_belief: "The quotes make ALL the difference — println(age) prints the value INSIDE the variable. Without quotes, Java looks up the variable's contents.",
  quotes_print_belief: "The quotes are wrapping paper — they mark where the String starts and ends, but they NEVER travel to the log. Only the content prints.",
  case_change_belief: "println doesn't touch the letters — whatever goes in comes out unchanged.",
  argument_type_doubt: "That argument is a perfectly valid String literal — no error here.",
  int_prints_with_quotes_belief: "Quotes are how you write String LITERALS in code — they're never part of what prints.",
  type_prints_with_value_belief: "println doesn't announce types — it prints values. int, double, boolean — all just their raw form.",
  double_truncates_belief: "Doubles keep every decimal! 3.5 + 1.5 is 5.0 exactly — the .0 sparkles into place to remind you the result is still a double.",
  plus_always_concatenates: "Pure numbers add! In a numeric-only context the + performs arithmetic, not gluing.",
  double_addition_doubt: "Double addition is completely legal and produces another double — no error here.",
  char_prints_with_quotes: "The single quotes are how you WRITE a char in code — they never travel to the log. println hands the console just the character.",
  char_as_ascii_int: "That's the ASCII value trick from other languages — in Java, println(char) prints the character itself, not its numeric code.",
  char_prints_as_string: "Chars print without quotes AND without becoming Strings. One character, no wrapping.",
  plus_not_evaluated_belief: "The + inside println is real code — it evaluates before the transmission. What lands on the log is the RESULT, not the recipe.",
  variable_empty_belief: "The variable had a real value in it — the log proves it. When a variable name appears without quotes inside a concat, its VALUE joins in.",
  plus_always_adds: "Read the operands again — the moment a String touches the +, everything to its right glues on as text. You added when you should have concatenated!",
  mixed_type_confusion: "Java's + operator is happy to mix types — as long as one operand is a String, the rest come along as text. No error, just glue.",
  chain_left_to_right_ignored: 'Java reads + expressions left to right, always. 1 + 2 happens before + "3" arrives — that\'s why the arithmetic ran and the concat followed. Order writes the story.',
  int_becomes_double_belief: "Concatenation doesn't add decimals — ints stay as they are inside a String.",
  parens_ignored: "The parentheses were RIGHT THERE! Inside them, no String — just numbers. Trust the parens and read the value they compute.",
  parens_in_string_doubt: "Parentheses inside a println argument are completely legal — they group a sub-expression, no error.",
  same_line_belief: "Every println auto-appends a newline — that's why the 'ln' matters! Two calls, two lines, always.",
  space_between_belief: "println never inserts a space of its own — only what you put in the argument appears.",
  last_overwrites_belief: "The log doesn't erase — it stacks. Every transmission adds a NEW line; nothing gets overwritten.",
  empty_println_ignored_belief: "An empty println is a real transmission — it still adds a newline, so a blank line appears on the log.",
  empty_println_error_belief: "println() with nothing inside is completely legal — it's how programmers write blank lines to space out output.",
  bare_println_belief: "The compile-error stamp says it all — println isn't a standalone function. It's a method of System.out. Every call needs the full prefix.",
  parens_missing_precedence: "Without parens, the + is greedy — it fuses left-to-right and the arithmetic never gets to happen. Wrap (a + b) to force the addition first.",
  timeout: "The static took it! Fluent broadcasters read the answer before the wave drops. Trust the pattern and commit.",
};

export class Level38Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level38Scene" });
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
    this.logLines = [];
    this.logRowObjs = [];
    this.inputLocked = true;
    this.gameEnded = false;
    this._alive = true;
    this._bubble = null;
    this._creepTween = null;
    this._staticPixels = [];
    this._urgencyState = "safe";
    this._waveSquares = [];
    this._conceptNoted = {};
  }

  preload() {}

  create() {
    this._alive = true;
    this.events.once("shutdown", () => { this._alive = false; this._killCreepTween(); });

    const cam = this.cameras.main;
    const zoom = Math.min(this.scale.width / W, this.scale.height / H);
    cam.setZoom(zoom);
    cam.centerOn(W / 2, H / 2);
    cam.setBackgroundColor("#050914");

    try { GameManager.incrementAttempt(37); } catch (_) {}

    this.createParticleTexture();
    this.createBackground();
    this.createRoomDecor();
    this.createReferenceTower();
    this.createCRTMonitor();
    this.createSignalWave();
    this.createReferenceLog();
    this.createHUD();
    this.createBit();

    cam.fadeIn(700, 3, 3, 5);
    this.checkTutorial();
  }

  update(time, delta) {
    this.updateAmbient(time, delta);
    this.updateServerLEDs(time);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // BACKGROUND / ROOM
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l38_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l38_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x050914).setDepth(0);
  }

  createRoomDecor() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x0a0d18, 1);
    g.fillRect(0, 0, W, 216);
    g.lineStyle(3, 0x1a2135, 1);
    g.strokeRoundedRect(330, 30, 620, 140, 8);

    [[20, 95], [1185, 1260]].forEach(([x0, x1]) => {
      for (let i = 0; i < 6; i++) {
        const y = 240 + i * 62;
        g.fillStyle(0x0a0d18, 1);
        g.lineStyle(1, 0x1a2135, 1);
        g.fillRect(x0, y, x1 - x0, 22);
        g.strokeRect(x0, y, x1 - x0, 22);
      }
    });
    this.serverLEDs = [];
    [[20, 95], [1185, 1260]].forEach(([x0, x1]) => {
      for (let i = 0; i < 6; i++) {
        const y = 240 + i * 62 + 11;
        const led = this.add.circle(x0 + 10, y, 2, C_GREEN_BRIGHT, 0.3).setDepth(2);
        this.serverLEDs.push({ led, phase: Phaser.Math.Between(0, 800) });
      }
    });

    g.fillStyle(0x080b12, 1);
    g.fillRect(0, 635, W, 85);
    g.lineStyle(1, 0x1a2135, 1);
    g.lineBetween(0, 635, W, 635);

    const board = this.add.graphics().setDepth(2);
    board.fillStyle(0x0d1117, 1);
    board.lineStyle(1, 0x1a2135, 1);
    board.fillRoundedRect(195, 240, 100, 80, 6);
    board.strokeRoundedRect(195, 240, 100, 80, 6);

    const mug = this.add.graphics().setDepth(2);
    mug.fillStyle(0x0d1117, 1);
    mug.lineStyle(1, 0x3d4450, 0.5);
    mug.strokeRoundedRect(235, 360, 22, 26, 3);
    mug.strokeCircle(261, 373, 5);
  }

  updateServerLEDs(time) {
    if (!this.serverLEDs) return;
    this.serverLEDs.forEach((s) => {
      const on = Math.floor((time + s.phase) / 800) % 2 === 0;
      s.led.setAlpha(on ? 0.3 : 0.08);
    });
  }

  createAmbient() {}

  updateAmbient(time, delta) {
    if (!this.ambient) {
      this.ambient = [];
      for (let i = 0; i < 8; i++) {
        this.ambient.push(this.add.circle(Phaser.Math.Between(0, W), Phaser.Math.Between(220, 630), 1, 0x4fc3f7, Phaser.Math.FloatBetween(0.02, 0.05)).setDepth(2));
      }
    }
    const step = 0.015 * (delta / 16.7);
    this.ambient.forEach((p, i) => {
      p.x += step;
      p.y += Math.sin(time * 0.0005 + i) * 0.03;
      if (p.x > W) { p.x = 0; p.y = Phaser.Math.Between(220, 630); }
    });
  }

  // ══════════════════════════════════════════════════════════════
  // REFERENCE TOWER (compact, ported from Level 37)
  // ══════════════════════════════════════════════════════════════

  createReferenceTower() {
    const g = this.add.graphics().setDepth(3);
    g.lineStyle(1.5, 0x3d4450, 1);
    g.lineBetween(TOWER_X - 35, TOWER_BASE_Y, TOWER_X, TOWER_TOP_Y);
    g.lineBetween(TOWER_X + 35, TOWER_BASE_Y, TOWER_X, TOWER_TOP_Y);
    for (let i = 1; i <= 4; i++) {
      const t = i / 5;
      const y = TOWER_BASE_Y - t * (TOWER_BASE_Y - TOWER_TOP_Y);
      const lx = Phaser.Math.Linear(TOWER_X - 35, TOWER_X, t), rx = Phaser.Math.Linear(TOWER_X + 35, TOWER_X, t);
      g.lineBetween(lx, y, rx, y);
    }
    g.fillStyle(0x141a24, 1);
    g.fillRoundedRect(TOWER_X - 15, TOWER_TOP_Y - 4, 30, 6, 2);
    g.lineStyle(1, 0x546e7a, 1);
    g.lineBetween(TOWER_X, TOWER_TOP_Y - 4, TOWER_X, TOWER_TOP_Y - 40);

    this.beacon = this.add.circle(TOWER_X, TOWER_TOP_Y - 42, 3, C_RED, 0.4).setDepth(4);
    this.tweens.add({ targets: this.beacon, alpha: 0.2, duration: 1500, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });

    const bayG = this.add.graphics().setDepth(4);
    bayG.fillStyle(0x141a24, 1);
    bayG.fillRoundedRect(TOWER_X - 20, TOWER_TOP_Y - 4, 40, 24, 4);
    bayG.lineStyle(1.5, C_CYAN, 1);
    bayG.strokeRoundedRect(TOWER_X - 20, TOWER_TOP_Y - 4, 40, 24, 4);

    const mg = this.add.graphics().setDepth(4);
    mg.fillStyle(0x0d1117, 1);
    mg.fillRoundedRect(MARQUEE_X - MARQUEE_W / 2, MARQUEE_Y - MARQUEE_H / 2, MARQUEE_W, MARQUEE_H, 5);
    mg.lineStyle(1, 0x3d4450, 1);
    mg.strokeRoundedRect(MARQUEE_X - MARQUEE_W / 2, MARQUEE_Y - MARQUEE_H / 2, MARQUEE_W, MARQUEE_H, 5);
    this.marqueeContainer = this.add.container(0, 0).setDepth(6);
    this.antennaTop = { x: TOWER_X, y: TOWER_TOP_Y - 44 };
  }

  flareBeacon() {
    this.tweens.killTweensOf(this.beacon);
    this.beacon.setFillStyle(C_RED, 1);
    this.tweens.add({
      targets: this.beacon, alpha: 0.2, duration: 800,
      onComplete: () => { this.beacon.setFillStyle(C_RED, 0.4); this.tweens.add({ targets: this.beacon, alpha: 0.2, duration: 1500, yoyo: true, repeat: -1, ease: "Sine.easeInOut" }); },
    });
  }

  // ══════════════════════════════════════════════════════════════
  // CRT MONITOR
  // ══════════════════════════════════════════════════════════════

  createCRTMonitor() {
    const bez = this.add.graphics().setDepth(10);
    bez.fillStyle(0x141a24, 1);
    bez.fillRoundedRect(CRT_X - (CRT_W + 50) / 2, CRT_Y - (CRT_H + 60) / 2, CRT_W + 50, CRT_H + 60, 14);
    bez.lineStyle(3, 0x3d4450, 1);
    bez.strokeRoundedRect(CRT_X - (CRT_W + 50) / 2, CRT_Y - (CRT_H + 60) / 2, CRT_W + 50, CRT_H + 60, 14);
    this.bezelGfx = bez;

    this.ledDots = [];
    [-120, -40, 40, 120].forEach((dx) => {
      const led = this.add.circle(CRT_X + dx, CRT_TOP_Y - 6, 3, C_GREEN_BRIGHT, 0.9).setDepth(11);
      this.ledDots.push(led);
    });

    this.add.text(CRT_X, CRT_Y + CRT_H / 2 + 22, "SIG-01", { font: "bold 8px Courier New", color: HEX_GRAY }).setOrigin(0.5).setDepth(11);
    this.powerLed = this.add.circle(CRT_X + CRT_W / 2 + 10, CRT_Y + CRT_H / 2 + 22, 3, C_GREEN_BRIGHT, 0.6).setDepth(11);

    const scr = this.add.graphics().setDepth(12);
    scr.fillStyle(0x0a1830, 1);
    scr.fillRoundedRect(CRT_X - CRT_W / 2, CRT_Y - CRT_H / 2, CRT_W, CRT_H, 8);
    scr.lineStyle(1, C_CYAN, 0.4);
    scr.strokeRoundedRect(CRT_X - CRT_W / 2, CRT_Y - CRT_H / 2, CRT_W, CRT_H, 8);
    for (let y = CRT_Y - CRT_H / 2; y < CRT_Y + CRT_H / 2; y += 3) {
      scr.lineStyle(1, C_CYAN, 0.04);
      scr.lineBetween(CRT_X - CRT_W / 2, y, CRT_X + CRT_W / 2, y);
    }

    const maskShape = this.make.graphics({ x: 0, y: 0, add: false });
    maskShape.fillRoundedRect(CRT_X - CRT_W / 2, CRT_Y - CRT_H / 2, CRT_W, CRT_H, 8);
    this.crtMask = maskShape.createGeometryMask();
    this.crtLayer = this.add.container(0, 0).setDepth(13);
    this.crtLayer.setMask(this.crtMask);

    this.roundLabel = this.add.text(CRT_X + CRT_W / 2 - 8, CRT_Y - CRT_H / 2 + 8, "", { font: "bold 9px Courier New", color: HEX_GRAY }).setOrigin(1, 0).setAlpha(0.7).setDepth(14);
    this.crtLayer.add(this.roundLabel);

    this.staticLayer = this.add.container(0, 0).setDepth(16);
    this.crtLayer.add(this.staticLayer);
  }

  createSignalWave() {
    this.waveGfx = this.add.graphics().setDepth(15);
    this.crtLayer.add(this.waveGfx);
    this._waveAmplitude = 8;
    this._wavePhase = 0;
  }

  drawSignalWave(color) {
    this.waveGfx.clear();
    this.waveGfx.lineStyle(1.5, color, 0.8);
    const y0 = CRT_Y - CRT_H / 2 + 14;
    const w = CRT_W - 20;
    const x0 = CRT_X - w / 2;
    const pts = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      const x = x0 + t * w;
      const y = y0 + Math.sin(t * 16 + this._wavePhase) * this._waveAmplitude;
      pts.push(x, y);
    }
    this.waveGfx.beginPath();
    this.waveGfx.moveTo(pts[0], pts[1]);
    for (let i = 2; i < pts.length; i += 2) this.waveGfx.lineTo(pts[i], pts[i + 1]);
    this.waveGfx.strokePath();
  }

  // ══════════════════════════════════════════════════════════════
  // STATIC CREEP TIMER
  // ══════════════════════════════════════════════════════════════

  startStaticCreep(timeLimitMs, onTimeout) {
    this._killCreepTween();
    this._urgencyState = "safe";
    this.roundTimeLimit = timeLimitMs;
    this.ledDots.forEach((l) => l.setAlpha(0.9).setFillStyle(C_GREEN_BRIGHT));
    this._clearStatic();
    const state = { v: 0 };
    this._creepTween = this.tweens.add({
      targets: state, v: 1, duration: timeLimitMs, ease: "Linear",
      onUpdate: () => { this._applyCreepProgress(state.v); },
      onComplete: () => { if (this._alive) onTimeout(); },
    });
  }

  _applyCreepProgress(progress) {
    const remaining = 1 - progress;
    this._wavePhase += 0.3;
    this._waveAmplitude = Phaser.Math.Linear(8, 1, progress);
    const color = remaining > 0.33 ? C_GREEN_BRIGHT : remaining > 0.15 ? C_GOLD : C_RED;
    this.drawSignalWave(color);

    const pixelCount = Math.round(Phaser.Math.Linear(0, 6, Math.min(progress / 0.85, 1)));
    for (let i = 0; i < pixelCount; i++) this._spawnStaticPixel();

    [0.75, 0.5, 0.25, 0.0].forEach((thresh, i) => {
      if (remaining <= thresh && this.ledDots[i].alpha > 0.15) {
        this.ledDots[i].setAlpha(0.1);
      }
    });

    if (remaining <= 0.15 && this._urgencyState !== "critical") {
      this._urgencyState = "critical";
      this.tweens.add({ targets: this.bezelGfx, alpha: 0.7, duration: 350, yoyo: true, repeat: -1 });
    }
  }

  _spawnStaticPixel() {
    const x = CRT_X - CRT_W / 2 + Phaser.Math.Between(0, CRT_W);
    const y = CRT_Y - CRT_H / 2 + Phaser.Math.Between(0, CRT_H);
    const color = Phaser.Utils.Array.GetRandom([0xffffff, 0xb0bec5, 0x00e5ff]);
    const px = this.add.rectangle(x, y, 2, 2, color, Phaser.Math.FloatBetween(0.4, 0.9));
    this.staticLayer.add(px);
    this._staticPixels.push(px);
    if (this._staticPixels.length > 800) { const old = this._staticPixels.shift(); if (old.active) old.destroy(); }
  }

  _clearStatic() {
    this._staticPixels.forEach((p) => { if (p.active) p.destroy(); });
    this._staticPixels = [];
    this.tweens.killTweensOf(this.bezelGfx);
    this.bezelGfx.setAlpha(1);
  }

  _killCreepTween() {
    if (this._creepTween) { this._creepTween.stop(); this._creepTween = null; }
  }

  pauseCreep() {
    if (this._creepTween) this._creepTween.pause();
    this.tweens.killTweensOf(this.bezelGfx);
    this.bezelGfx.setAlpha(1);
  }

  getTimePctUsed() {
    const elapsed = this.time.now - this.roundStartTime;
    return Phaser.Math.Clamp(elapsed / this.roundTimeLimit, 0, 1);
  }

  async signalLost() {
    this._killCreepTween();
    this.tweens.killTweensOf(this.bezelGfx);
    this.bezelGfx.setAlpha(1);
    for (let i = 0; i < 40; i++) this._spawnStaticPixel();
    this.ledDots.forEach((l) => l.setAlpha(0.1));
    this._waveAmplitude = 0;
    this.drawSignalWave(C_RED);
    this.screenShake(0.006, 200);
    const stamp = this.add.text(CRT_X, CRT_Y, "SIGNAL LOST", { font: "bold 24px Arial", color: HEX_RED }).setOrigin(0.5).setAngle(-8).setAlpha(0).setDepth(30);
    this.crtLayer.add(stamp);
    this.tweens.add({ targets: stamp, alpha: 1, duration: 200 });
    this.flareBeacon();
    await this.delay(1500);
    if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 250, onComplete: () => stamp.destroy() });
  }

  async reviveSignalLEDs() {
    for (let i = 0; i < this.ledDots.length; i++) {
      if (!this._alive) return;
      this.ledDots[i].setAlpha(0.9).setFillStyle(C_GREEN_BRIGHT);
      await this.delay(80);
    }
  }

  async stampCRT(kind) {
    const label = kind === "processed" ? "PROCESSED" : "MISREAD";
    const color = kind === "processed" ? HEX_GREEN_BRIGHT : HEX_RED;
    const stamp = this.add.text(CRT_X, CRT_Y, label, { font: "bold 20px Arial", color }).setOrigin(0.5).setAngle(-6).setScale(1.5).setAlpha(0).setDepth(30);
    this.crtLayer.add(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 180 });
    await this.delay(700);
    if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 200, onComplete: () => stamp.destroy() });
  }

  screenShake(intensity = 0.004, duration = 180) {
    this.cameras.main.shake(duration, intensity);
  }

  // ══════════════════════════════════════════════════════════════
  // CRT TRIAL CONTENT
  // ══════════════════════════════════════════════════════════════

  _syntaxTokenize(line) {
    const tokens = [];
    const re = /(\bSystem\.out\b)|(\.)|(\bprintln\b|\bprint\b)|(\bint\b|\bdouble\b|\bboolean\b|\bchar\b|\bString\b)|("(?:[^"\\]|\\.)*")|('.')|(\btrue\b|\bfalse\b)|([(){};=])|(\+)/g;
    let last = 0, m;
    const plain = (t) => t && tokens.push({ t, c: "#b0bec5" });
    while ((m = re.exec(line))) {
      if (m.index > last) plain(line.slice(last, m.index));
      if (m[1]) tokens.push({ t: m[1], c: "#81c784" });
      else if (m[2]) tokens.push({ t: m[2], c: HEX_GRAY });
      else if (m[3]) tokens.push({ t: m[3], c: HEX_AMBER });
      else if (m[4]) tokens.push({ t: m[4], c: "#4fc3f7" });
      else if (m[5]) tokens.push({ t: m[5], c: "#4fc3f7" });
      else if (m[6]) tokens.push({ t: m[6], c: "#4fc3f7" });
      else if (m[7]) tokens.push({ t: m[7], c: HEX_VIOLET });
      else if (m[8]) tokens.push({ t: m[8], c: "#ef5350" });
      else if (m[9]) tokens.push({ t: m[9], c: "#b0bec5" });
      last = m.index + m[0].length;
    }
    if (last < line.length) plain(line.slice(last));
    return tokens.length ? tokens : [{ t: line, c: "#b0bec5" }];
  }

  showTrialOnCRT(config, lines, questionText) {
    this.trialContainer && this.trialContainer.destroy();
    this.trialContainer = this.add.container(0, 0);
    this.crtLayer.add(this.trialContainer);

    const fontSize = lines.length > 2 ? 13 : 15;
    const startY = CRT_Y - 40 - ((lines.length - 1) * (fontSize + 8)) / 2;
    lines.forEach((line, i) => {
      const tokens = this._syntaxTokenize(line);
      const measured = tokens.map((t) => { const tmp = this.add.text(0, 0, t.t, { font: `bold ${fontSize}px Courier New` }); const w = tmp.width; tmp.destroy(); return w; });
      const totalW = measured.reduce((a, b) => a + b, 0);
      let x = CRT_X - totalW / 2;
      const y = startY + i * (fontSize + 8);
      tokens.forEach((tok, ti) => {
        const t = this.add.text(x, y, tok.t, { font: `bold ${fontSize}px Courier New`, color: tok.c }).setOrigin(0, 0.5).setAlpha(0);
        this.trialContainer.add(t);
        this.tweens.add({ targets: t, alpha: 1, duration: 200 });
        x += measured[ti];
      });
    });

    if (questionText) {
      const qt = this.add.text(CRT_X, CRT_Y + 60, questionText, { font: "12px Arial", color: "#b0bec5" }).setOrigin(0.5).setAlpha(0);
      this.trialContainer.add(qt);
      this.tweens.add({ targets: qt, alpha: 1, duration: 200, delay: 150 });
    }

    this.roundLabel.setText(`TRIAL ${this.currentRound + 1}/15`);

    const sweep = this.add.rectangle(CRT_X, CRT_Y - CRT_H / 2, CRT_W, 2, 0xffffff, 0.6);
    this.crtLayer.add(sweep);
    this.tweens.add({ targets: sweep, y: CRT_Y + CRT_H / 2, duration: 400, onComplete: () => sweep.destroy() });
  }

  clearCRTTrial() {
    if (this.trialContainer) { this.trialContainer.destroy(); this.trialContainer = null; }
  }

  // ══════════════════════════════════════════════════════════════
  // REFERENCE LOG (compact, ported from Level 37)
  // ══════════════════════════════════════════════════════════════

  createReferenceLog() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x08111c, 1);
    g.fillRoundedRect(LOG_X, LOG_Y, LOG_W, LOG_H, 12);
    g.lineStyle(2, C_CYAN, 1);
    g.strokeRoundedRect(LOG_X, LOG_Y, LOG_W, LOG_H, 12);
    for (let y = LOG_Y + 4; y < LOG_Y + LOG_H - 4; y += 4) {
      g.lineStyle(1, 0x0a1520, 0.3);
      g.lineBetween(LOG_X + 4, y, LOG_X + LOG_W - 4, y);
    }
    const header = this.add.graphics().setDepth(11);
    header.fillStyle(0x0a1830, 1);
    header.fillRoundedRect(LOG_X, LOG_Y, LOG_W, 36, { tl: 12, tr: 12, bl: 0, br: 0 });
    this.logLed = this.add.circle(LOG_X + 16, LOG_Y + 18, 4, C_RED).setDepth(12);
    this.add.text(LOG_X + 30, LOG_Y + 18, "BROADCAST LOG — LIVE", { font: "bold 10px Arial", color: HEX_CYAN }).setOrigin(0, 0.5).setDepth(12);

    const maskShape = this.make.graphics({ x: 0, y: 0, add: false });
    maskShape.fillRoundedRect(LOG_X + 4, LOG_CONTENT_Y0, LOG_W - 8, LOG_Y + LOG_H - LOG_CONTENT_Y0 - 6, 6);
    this.logMask = maskShape.createGeometryMask();
    this.logLayer = this.add.container(0, 0).setDepth(13);
    this.logLayer.setMask(this.logMask);

    this.logLines = [];
    this.logRowObjs = [];
    this.renderCursorRow();
  }

  flashLed() {
    this.logLed.setFillStyle(C_GREEN_BRIGHT, 1);
    this.time.delayedCall(300, () => { if (this.logLed.active) this.logLed.setFillStyle(C_RED, 1); });
  }

  renderCursorRow() {
    if (this.cursorRow) { this.cursorRow.destroy(); this.cursorRow = null; }
    const rowIndex = Math.min(this.logLines.length, 15);
    const y = LOG_CONTENT_Y0 + 14 + rowIndex * ROW_H;
    const c = this.add.container(0, 0);
    const underline = this.add.rectangle(LOG_X + 16, y + 9, LOG_W - 32, 1, C_CYAN, 0.3).setOrigin(0, 0.5);
    const cursorBlock = this.add.rectangle(LOG_X + 16, y, 2, 12, C_CYAN, 0.5).setOrigin(0, 0.5);
    this.tweens.add({ targets: cursorBlock, alpha: 0, duration: 700, yoyo: true, repeat: -1 });
    c.add([underline, cursorBlock]);
    this.logLayer.add(c);
    this.cursorRow = c;
  }

  addLogLine(text, styleType) {
    const rowIndex = this.logLines.length;
    const y = LOG_CONTENT_Y0 + 14 + rowIndex * ROW_H;
    const numT = this.add.text(LOG_X + 8, y, String(rowIndex + 1).padStart(2, "0"), { font: "10px Courier New", color: "#3d4450" }).setOrigin(0, 0.5);
    const textT = this.add.text(LOG_X + 32, y, text, { font: "bold 15px Courier New", color: this._typeColor(styleType) }).setOrigin(0, 0.5).setAlpha(0).setScale(0.7);
    this.logLayer.add([numT, textT]);
    this.tweens.add({ targets: textT, alpha: 1, scale: 1, duration: 180, ease: "Back.easeOut" });
    this.logLines.push({ text, styleType });
    this.logRowObjs.push({ numT, textT });
    this.renderCursorRow();
  }

  clearLog() {
    return new Promise((res) => {
      const wipe = this.add.rectangle(LOG_X + LOG_W / 2, LOG_CONTENT_Y0, LOG_W, 0, 0x08111c, 1).setOrigin(0.5, 0);
      this.logLayer.add(wipe);
      this.tweens.add({
        targets: wipe, height: LOG_Y + LOG_H - LOG_CONTENT_Y0, duration: 300, ease: "Cubic.easeIn",
        onComplete: () => {
          this.logLayer.removeAll(true);
          this.logLines = [];
          this.logRowObjs = [];
          this.renderCursorRow();
          res();
        },
      });
    });
  }

  _typeColor(type) {
    switch (type) {
      case "string": return "#4fc3f7";
      case "int": return HEX_AMBER;
      case "double": return "#ffa726";
      case "char": return "#4fc3f7";
      case "boolean": return HEX_VIOLET;
      case "newline": return HEX_PURPLE;
      default: return "#e0e0e0";
    }
  }

  _typeColorInt(type) {
    switch (type) {
      case "string": return C_CYAN;
      case "int": return C_AMBER;
      case "double": return 0xffa726;
      case "char": return C_CYAN;
      case "boolean": return C_VIOLET;
      case "newline": return C_PURPLE;
      default: return 0xe0e0e0;
    }
  }

  // ══════════════════════════════════════════════════════════════
  // HUD
  // ══════════════════════════════════════════════════════════════

  createHUD() {
    const g = this.add.graphics().setDepth(49);
    g.fillStyle(0x050914, 0.93);
    g.fillRect(0, 0, W, 64);
    g.lineStyle(1, 0x1a2135, 1);
    g.lineBetween(0, 64, W, 64);

    this.add.text(20, 14, "THE SIGNAL ROOM", { font: "bold 15px Arial", color: "#b0bec5" }).setDepth(50);
    this.add.text(20, 32, "Tuning Phase — Output Methods: println()", { font: "11px Arial", color: "#546e7a" }).setDepth(50);

    this.waveText = this.add.text(W / 2, 18, "WAVE 1 / 3", { font: "bold 14px Arial", color: HEX_GOLD }).setOrigin(0.5).setDepth(50);
    this._waveSquares = [];
    for (let i = 0; i < 5; i++) {
      const sq = this.add.rectangle(W / 2 - 44 + i * 22, 42, 10, 10, 0x2a2f36).setDepth(50).setStrokeStyle(1, 0x546e7a);
      this._waveSquares.push(sq);
    }

    this.add.text(1060, 8, "SCORE", { font: "9px Arial", color: "#546e7a" }).setDepth(50);
    this.scoreText = this.add.text(1060, 20, "0", { font: "bold 18px Arial", color: "#ffffff" }).setDepth(50);
    this.comboText = this.add.text(1060, 42, "×1", { font: "bold 12px Arial", color: HEX_GOLD }).setDepth(50);

    this.lifeIcons = [];
    for (let i = 0; i < 3; i++) {
      const lg = this.add.graphics({ x: 1150 + i * 26, y: 24 }).setDepth(50);
      lg.lineStyle(2, C_CYAN, 1);
      lg.lineBetween(0, -6, 0, 8);
      lg.lineBetween(-4, -2, 0, -6);
      lg.lineBetween(4, -2, 0, -6);
      lg.fillStyle(C_CYAN, 1);
      lg.fillCircle(0, -6, 1.5);
      this.lifeIcons.push(lg);
    }
  }

  updateWaveIndicator(roundInWave, correct) {
    const sq = this._waveSquares[roundInWave];
    if (!sq) return;
    sq.setFillStyle(correct ? C_GREEN_BRIGHT : C_RED);
  }

  resetWaveIndicator() {
    this._waveSquares.forEach((sq) => sq.setFillStyle(0x2a2f36));
  }

  _roundInWave() {
    if (this.currentWave === 1) return this.currentRound;
    if (this.currentWave === 2) return this.currentRound - 5;
    return this.currentRound - 10;
  }

  // ══════════════════════════════════════════════════════════════
  // BIT — signal operator variant
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
    const headset = this.add.graphics();
    headset.lineStyle(2, 0x78909c, 1);
    headset.beginPath();
    headset.arc(0, -8, 18, Phaser.Math.DegToRad(200), Phaser.Math.DegToRad(340), false);
    headset.strokePath();
    const meter = this.add.container(22, 10);
    const mg = this.add.graphics();
    mg.lineStyle(1.5, 0x78909c, 1);
    mg.strokeRoundedRect(-5, -7, 10, 14, 2);
    const mscreen = this.add.rectangle(0, -3, 2, 2, C_GREEN_BRIGHT, 0.6);
    meter.add([mg, mscreen]);
    c.add([g, eye, pupil, headset, tip, meter]);
    this.tweens.add({ targets: tip, alpha: 0.3, duration: 900, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: c, y: "+=3", duration: 2000, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
    this.bit = c;
  }

  bitSay(text) {
    this.hideBubble();
    const inner = this.add.text(0, 0, text, { font: "13px Arial", color: "#e0e0e0", wordWrap: { width: 340 } });
    const bw = Math.min(inner.width, 340) + 30, bh = inner.height + 24;
    inner.setText("");
    const bx = Phaser.Math.Clamp(this.bit.x - bw - 30, 20, W - bw - 20);
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

  createFloatingText(x, y, text, colorHex, font = "bold 13px Arial", hold = 1400) {
    const t = this.add.text(x, y, text, { font, color: colorHex, wordWrap: { width: 300 }, align: "center" }).setOrigin(0.5).setDepth(31).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 180 });
    this.time.delayedCall(hold, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() }); });
    return t;
  }

  createAnnotation(x, y, text, colorHex) {
    const t = this.add.text(x, y, text, { font: "bold 10px Arial", color: colorHex }).setOrigin(0.5).setDepth(70).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 200 });
    this.time.delayedCall(1800, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() }); });
    return t;
  }

  createConfetti(x, y, count = 24) {
    const p = this.add.particles(x, y, "l38_dot", {
      speed: { min: 70, max: 220 }, angle: { min: 0, max: 360 }, scale: { start: 0.8, end: 0 }, lifespan: 450,
      tint: [C_CYAN, C_GOLD, C_GREEN_BRIGHT, C_VIOLET, 0xffffff], emitting: false,
    }).setDepth(75);
    p.explode(count);
    this.time.delayedCall(800, () => p.destroy());
  }

  // ══════════════════════════════════════════════════════════════
  // EVALUATOR — honest, left-to-right, sticky-String, parens-aware
  // ══════════════════════════════════════════════════════════════

  _parseDecls(declSource) {
    if (!declSource) return {};
    const decls = {};
    const typeMap = { int: "int", double: "double", boolean: "boolean", char: "char", String: "string" };
    const lines = Array.isArray(declSource) ? declSource : declSource.split("\n");
    lines.forEach((line) => {
      const m = line.match(/^(int|double|boolean|char|String)\s+(\w+)\s*=\s*(.+);$/);
      if (!m) return;
      const [, type, name, rawValue] = m;
      let value;
      const rv = rawValue.trim();
      if (type === "int") value = parseInt(rv, 10);
      else if (type === "double") value = parseFloat(rv);
      else if (type === "boolean") value = rv === "true";
      else if (type === "char") value = rv.replace(/^'|'$/g, "");
      else value = rv.replace(/^"|"$/g, "");
      decls[name] = { value, type: typeMap[type] };
    });
    return decls;
  }

  _tokenizeExpr(expr) {
    const tokens = [];
    let cur = "", inQuotes = false, parenDepth = 0;
    for (let i = 0; i < expr.length; i++) {
      const ch = expr[i];
      if (ch === '"') { inQuotes = !inQuotes; cur += ch; continue; }
      if (!inQuotes && ch === "(") { parenDepth++; cur += ch; continue; }
      if (!inQuotes && ch === ")") { parenDepth--; cur += ch; continue; }
      if (ch === "+" && !inQuotes && parenDepth === 0) { tokens.push(cur.trim()); cur = ""; continue; }
      cur += ch;
    }
    tokens.push(cur.trim());
    return tokens;
  }

  _evalToken(tok, decls) {
    if (/^\(.*\)$/.test(tok)) {
      const sub = this._evalExprFold(tok.slice(1, -1), decls);
      return sub.ok ? { value: sub.value, type: sub.type, ok: true } : { ok: false };
    }
    if (/^".*"$/.test(tok)) return { value: tok.slice(1, -1), type: "string", ok: true };
    if (/^'.'$/.test(tok)) return { value: tok.slice(1, -1), type: "char", ok: true };
    if (/^-?\d+\.\d+$/.test(tok)) return { value: parseFloat(tok), type: "double", ok: true };
    if (/^-?\d+$/.test(tok)) return { value: parseInt(tok, 10), type: "int", ok: true };
    if (tok === "true" || tok === "false") return { value: tok === "true", type: "boolean", ok: true };
    if (/^[A-Za-z_]\w*$/.test(tok)) {
      if (decls && Object.prototype.hasOwnProperty.call(decls, tok)) {
        return { value: decls[tok].value, type: decls[tok].type, ok: true };
      }
      return { ok: false };
    }
    return { ok: false };
  }

  _fmtDouble(v) {
    const rounded = Math.round(v * 1e6) / 1e6;
    return Number.isInteger(rounded) ? rounded.toFixed(1) : String(rounded);
  }

  _displayValue(val, type) {
    if (type === "double") return this._fmtDouble(val);
    if (type === "boolean") return val ? "true" : "false";
    return String(val);
  }

  /** Tokenize + left-fold with sticky-String semantics. Shared by the
   * top-level evaluatePrintln() and recursive parenthesized sub-expressions. */
  _evalExprFold(expr, decls) {
    const tokens = this._tokenizeExpr(expr);
    const evaluated = tokens.map((t) => this._evalToken(t, decls));
    if (evaluated.some((e) => !e.ok)) return { ok: false };
    let acc = evaluated[0];
    for (let i = 1; i < evaluated.length; i++) {
      const next = evaluated[i];
      if (acc.type === "string" || next.type === "string") {
        const accStr = acc.type === "string" ? acc.value : this._displayValue(acc.value, acc.type);
        const nextStr = next.type === "string" ? next.value : this._displayValue(next.value, next.type);
        acc = { value: accStr + nextStr, type: "string" };
      } else {
        const resultType = acc.type === "double" || next.type === "double" ? "double" : "int";
        acc = { value: acc.value + next.value, type: resultType };
      }
    }
    return { ok: true, value: acc.value, type: acc.type, tokens, evaluated };
  }

  evaluatePrintln(argExpr, decls) {
    if (argExpr === null || argExpr === undefined || argExpr.trim() === "") {
      return { ok: true, isEmpty: true, text: "", styleType: "newline" };
    }
    const result = this._evalExprFold(argExpr, decls);
    if (!result.ok) return { ok: false };
    return { ok: true, isEmpty: false, text: this._displayValue(result.value, result.type), styleType: result.type, tokens: result.tokens, evaluated: result.evaluated };
  }

  // ══════════════════════════════════════════════════════════════
  // TRANSMISSION — reveal on the reference tower + log
  // ══════════════════════════════════════════════════════════════

  clearMarquee() { this.marqueeContainer.removeAll(true); }

  async assembleArgument(evalResult) {
    this.clearMarquee();
    const cx = MARQUEE_X, cy = MARQUEE_Y;
    if (evalResult.isEmpty) {
      const t = this.add.text(cx, cy, "⏎", { font: "bold 16px Arial", color: HEX_PURPLE }).setOrigin(0.5).setScale(0);
      this.marqueeContainer.add(t);
      this.tweens.add({ targets: t, scale: 1, duration: 150, ease: "Back.easeOut" });
      await this.delay(250);
      return;
    }
    const display = evalResult.text;
    const isString = evalResult.styleType === "string";
    const color = this._typeColor(evalResult.styleType);
    let x = cx - this._measureWidth(display, isString) / 2;
    if (isString) { const q = this.add.text(x, cy, '"', { font: "bold 14px Courier New", color: HEX_GRAY }).setOrigin(0, 0.5); this.marqueeContainer.add(q); x += q.width; }
    const chars = display.split("");
    for (let i = 0; i < chars.length; i++) {
      if (!this._alive) return;
      const ch = chars[i] === " " && isString ? "␣" : chars[i];
      const chColor = chars[i] === " " && isString ? HEX_MAGENTA : color;
      const t = this.add.text(x, cy, ch, { font: "bold 14px Courier New", color: chColor }).setOrigin(0, 0.5).setAlpha(0);
      this.marqueeContainer.add(t);
      x += t.width;
      this.tweens.add({ targets: t, alpha: 1, duration: 60 });
      await this.delay(20);
    }
    if (isString) { const q = this.add.text(x, cy, '"', { font: "bold 14px Courier New", color: HEX_GRAY }).setOrigin(0, 0.5); this.marqueeContainer.add(q); }
    await this.delay(200);
  }

  _measureWidth(text, isString) {
    const t = this.add.text(0, 0, isString ? '"' + text + '"' : text, { font: "bold 14px Courier New" });
    const w = t.width; t.destroy(); return w;
  }

  async animateConcatenation(evaluated) {
    this.clearMarquee();
    const cy = MARQUEE_Y;
    const anyString = evaluated.some((e) => e.type === "string");
    const plusColor = anyString ? HEX_CYAN : HEX_GOLD;
    let x = MARQUEE_X - MARQUEE_W / 2 + 8;
    evaluated.forEach((e, i) => {
      const disp = e.type === "string" ? `"${e.value}"` : String(e.value);
      const t = this.add.text(x, cy, disp, { font: "bold 11px Courier New", color: this._typeColor(e.type) }).setOrigin(0, 0.5).setAlpha(0);
      this.marqueeContainer.add(t);
      this.tweens.add({ targets: t, alpha: 1, duration: 120 });
      x += t.width + 4;
      if (i < evaluated.length - 1) {
        const p = this.add.text(x, cy, "+", { font: "bold 11px Courier New", color: plusColor }).setOrigin(0, 0.5).setAlpha(0);
        this.marqueeContainer.add(p);
        this.tweens.add({ targets: p, alpha: 1, duration: 120 });
        x += p.width + 4;
      }
    });
    await this.delay(400);
    if (!this._alive) return;
    const note = anyString ? "String → concatenation" : "all numbers → arithmetic";
    if (!this._conceptNoted[note]) {
      this._conceptNoted[note] = true;
      const t = this.createAnnotation(MARQUEE_X, MARQUEE_Y - MARQUEE_H / 2 - 10, note, plusColor === HEX_CYAN ? HEX_CYAN : HEX_GOLD);
      await this.delay(400);
    }
  }

  async fireCall(argExpr, decls) {
    const evalResult = this.evaluatePrintln(argExpr, decls);
    if (!evalResult.ok) {
      this.clearMarquee();
      const t = this.add.text(MARQUEE_X, MARQUEE_Y, "?", { font: "bold 16px Courier New", color: HEX_RED }).setOrigin(0.5);
      this.marqueeContainer.add(t);
      this.tweens.add({ targets: this.marqueeContainer, x: 4, duration: 35, yoyo: true, repeat: 4, onComplete: () => { this.marqueeContainer.x = 0; } });
      this.flareBeacon();
      this.showCompileErrorStamp();
      await this.delay(450);
      this.clearMarquee();
      return evalResult;
    }
    if (evalResult.tokens && evalResult.tokens.length > 1) {
      await this.animateConcatenation(evalResult.evaluated);
      await this.delay(150);
      this.clearMarquee();
      await this.assembleArgument(evalResult);
    } else {
      await this.assembleArgument(evalResult);
    }
    if (!this._alive) return evalResult;
    await this.launchAndLand(evalResult);
    return evalResult;
  }

  async launchAndLand(evalResult) {
    const color = this._typeColorInt(evalResult.styleType);
    const capsule = this.add.circle(MARQUEE_X, MARQUEE_Y, 7, color, 0.9).setDepth(40);
    this.tweens.add({ targets: this.marqueeContainer, scale: 0.4, alpha: 0, duration: 150 });
    await this.delay(150);
    if (!this._alive) return;
    const trail = this.add.rectangle(MARQUEE_X, MARQUEE_Y, 3, 0, color, 0.4).setOrigin(0.5, 1).setDepth(39);
    await new Promise((res) => {
      this.tweens.add({
        targets: capsule, x: this.antennaTop.x, y: this.antennaTop.y, duration: 220, ease: "Cubic.easeIn",
        onUpdate: () => { trail.height = Math.abs(MARQUEE_Y - capsule.y) * 0.5; trail.x = capsule.x; trail.y = capsule.y; },
        onComplete: res,
      });
    });
    if (!this._alive) return;
    const logEntryX = LOG_X + 30, logEntryY = LOG_CONTENT_Y0 + 10;
    await new Promise((res) => { this.tweens.add({ targets: capsule, x: logEntryX, y: logEntryY, duration: 220, ease: "Cubic.easeOut", onComplete: res }); });
    this.tweens.add({ targets: trail, alpha: 0, duration: 220, onComplete: () => trail.destroy() });
    if (!this._alive) return;
    this.createConfetti(logEntryX, logEntryY, 8);
    capsule.destroy();
    this.flashLed();
    this.addLogLine(evalResult.isEmpty ? "" : evalResult.text, evalResult.styleType);
    this.showFirstNewlineAnnotation();
    this.marqueeContainer.setScale(1).setAlpha(1);
    await this.delay(100);
  }

  showFirstNewlineAnnotation() {
    if (firstNewlineAnnotationShown38) return;
    firstNewlineAnnotationShown38 = true;
    this.createAnnotation(LOG_X + LOG_W / 2, LOG_Y + LOG_H + 12, "println always adds a newline", HEX_PURPLE);
  }

  showCompileErrorStamp() {
    const stamp = this.add.text(MARQUEE_X, MARQUEE_Y - MARQUEE_H / 2 - 20, "COMPILE ERROR", { font: "bold 12px Arial", color: HEX_RED }).setOrigin(0.5).setDepth(80).setScale(1.3).setAlpha(0);
    this.marqueeContainer.add(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 150 });
    this.time.delayedCall(900, () => { if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 200, onComplete: () => stamp.destroy() }); });
  }

  async runSnippetReveal(sourceLines, decls) {
    for (const line of sourceLines) {
      if (!this._alive) return;
      const m = line.match(/print(?:ln)?\(([^)]*)\)/);
      if (!m) continue;
      await this.fireCall(m[1], decls);
      await this.delay(150);
    }
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
    await this.bitSay("Welcome to the Signal Room, Operator. Every trial comes in on the monitor — but signals FADE. Watch the static creep in and answer before your screen dies. Fluent broadcasters see the answer before the wave drops.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();

    this.showTrialOnCRT({}, ['System.out.println("test");'], "What appears on the log?");
    const a1 = this.createAnnotation(CRT_X, CRT_TOP_Y - 20, "the monitor is your TIMER", HEX_GOLD);
    await this.delay(300); if (!A()) return;
    const a2 = this.createAnnotation(CRT_X, CRT_TOP_Y + 20, "strong wave, strong signal", HEX_GREEN_BRIGHT);
    await this.delay(300); if (!A()) return;
    const a3 = this.createAnnotation(CRT_X, CRT_TOP_Y - 6, "they die one by one", HEX_CYAN);
    await this.delay(400); if (!A()) return;

    await this.bitSay("The tower and log on the right show you the truth AFTER you answer. Speed earns bonus marks. Ready your channel!");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();
    this.clearCRTTrial();

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

    const banners = { 1: "WAVE 1 — RAPID PREDICTION", 2: "WAVE 2 — THE SHAPE-SHIFTING PLUS", 3: "WAVE 3 — TRACES & BUG HUNT" };
    await this.showWaveBanner(banners[waveNumber]);
    if (!this._alive) return;

    if (waveNumber === 3) {
      await this.showBitFeedback("Wave three, Operator. Real signals — the bugs every broadcaster learns to spot. Trust your eyes; the log will confirm what your brain already knows.", 4500);
      if (!this._alive) return;
    }

    const startIndex = waveNumber === 1 ? 0 : waveNumber === 2 ? 5 : 10;
    this.startRound(startIndex);
  }

  async showWaveBanner(text) {
    const c = this.add.container(CRT_X, -60).setDepth(85);
    const g = this.add.graphics();
    g.fillStyle(0x0e160e, 0.95);
    g.fillRoundedRect(-220, -24, 440, 48, 8);
    g.lineStyle(2, C_GOLD, 1);
    g.strokeRoundedRect(-220, -24, 440, 48, 8);
    const t = this.add.text(0, 0, text, { font: "bold 15px Arial", color: HEX_GOLD }).setOrigin(0.5);
    c.add([g, t]);
    await new Promise((res) => {
      this.tweens.add({
        targets: c, y: 250, duration: 300, ease: "Back.easeOut",
        onComplete: () => this.time.delayedCall(600, () => {
          this.tweens.add({ targets: c, y: -60, alpha: 0, duration: 250, ease: "Cubic.easeIn", onComplete: () => { c.destroy(); res(); } });
        }),
      });
    });
  }

  startRound(index) {
    this.currentRound = index;
    const config = ROUNDS[index];
    this.roundAttempts = 0;
    this.roundStartTime = this.time.now;
    this.clearRound();

    const limit = config.type === "bughunt" ? 12000 : WAVE_TIME[config.wave];
    const decls = this._parseDecls(config.decl);
    this._roundDecls = decls;

    if (config.type === "predict" || config.type === "trace") this.setupPredict(config, decls);
    else if (config.type === "bughunt") this.setupBugHunt(config);

    this.startStaticCreep(limit, () => this.onCRTTimeout(config));
  }

  clearRound() {
    this.roundElements.forEach((e) => { if (e && e.destroy) e.destroy(); });
    this.roundElements = [];
    this.clearCRTTrial();
  }

  async onCRTTimeout(config) {
    if (this.gameEnded) return;
    this.inputLocked = true;
    this.roundElements.forEach((e) => e.disableInteractive && e.disableInteractive());
    this.logAttempt(config, false, null, "timeout", this.roundTimeLimit, 1);
    await this.signalLost();
    if (!this._alive) return;
    this.updateWaveIndicator(this._roundInWave(), false);
    this.loseLife();
    this.updateCombo(false);
    if (this.lives <= 0) { this.time.delayedCall(400, () => this.gameOver()); return; }
    await this.showBitFeedback(MISCONCEPTION_FEEDBACK.timeout);
    if (!this._alive) return;
    this.clearRound();
    this.advanceRound();
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE A/C — PREDICT / TRACE
  // ══════════════════════════════════════════════════════════════

  setupPredict(config, decls) {
    this.showTrialOnCRT(config, config.source, config.question);
    this.showOptionBubbles(config.options, config, decls);
  }

  showOptionBubbles(options, config, decls) {
    const shuffled = Phaser.Utils.Array.Shuffle(options.slice());
    const n = shuffled.length;
    const spacing = 260;
    const startX = CRT_X - ((n - 1) * spacing) / 2;
    shuffled.forEach((opt, i) => {
      const x = startX + i * spacing, y = 590;
      const c = this.add.container(x, y).setDepth(41);
      const g = this.add.graphics();
      const w = 240, h = 48;
      const draw = (stroke) => {
        g.clear();
        g.fillStyle(0x141a24, 1);
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
        g.lineStyle(2, stroke, 1);
        g.strokeRoundedRect(-w / 2, -h / 2, w, h, 10);
      };
      draw(C_CYAN);
      const label = opt.label || opt.value;
      const txt = this.add.text(0, 0, label, { font: "bold 13px Courier New", color: "#e0e0e0" }).setOrigin(0.5);
      if (txt.width > w - 16) txt.setFontSize(10);
      c.add([g, txt]);
      c.setSize(w, h);
      c.setInteractive({ useHandCursor: true });
      c.on("pointerover", () => { if (!this.inputLocked) draw(C_GOLD); });
      c.on("pointerout", () => { if (!this.inputLocked) draw(C_CYAN); });
      c.on("pointerdown", () => {
        if (this.inputLocked) return;
        this.inputLocked = true;
        this.onBubbleSelected(opt, config, c, decls);
      });
      this.roundElements.push(c);
    });
    this.inputLocked = false;
  }

  async onBubbleSelected(opt, config, bubbleContainer, decls) {
    this.pauseCreep();
    const timePctUsed = this.getTimePctUsed();
    const timeMs = Math.round(this.time.now - this.roundStartTime);
    const correct = opt.value === config.correct;
    this.logAttempt(config, correct, opt.value, opt.tag, timeMs, timePctUsed);
    this.roundElements.forEach((e) => e.disableInteractive && e.disableInteractive());

    const g = bubbleContainer.list[0];
    g.clear();
    g.fillStyle(0x141a24, 1);
    g.fillRoundedRect(-120, -24, 240, 48, 10);
    g.lineStyle(2, correct ? C_GREEN_BRIGHT : C_RED, 1);
    g.strokeRoundedRect(-120, -24, 240, 48, 10);
    if (!correct) this.tweens.add({ targets: bubbleContainer, x: bubbleContainer.x + 5, duration: 35, yoyo: true, repeat: 4 });

    await this.stampCRT(correct ? "processed" : "misread");
    await this.delay(100);
    if (!this._alive) return;
    await this.clearLog();
    await this.runSnippetReveal(config.source, decls);
    if (config.revealNote) this.createFloatingText(LOG_X + LOG_W / 2, LOG_Y + LOG_H + 30, config.revealNote, HEX_GRAY, "11px Arial", 2600);
    if (correct) await this.reviveSignalLEDs();
    await this.delay(400);
    if (!this._alive) return;

    this.updateWaveIndicator(this._roundInWave(), correct);
    if (correct) {
      this.updateScore(this.scoreForAttempt(timePctUsed));
      this.updateCombo(true);
      if (this.roundAttempts === 0) this.correctFirstTry++;
      await this.delay(250);
      this.advanceRound();
    } else {
      this.loseLife();
      this.updateCombo(false);
      if (this.lives <= 0) { this.time.delayedCall(400, () => this.gameOver()); return; }
      await this.showBitFeedback(MISCONCEPTION_FEEDBACK[opt.tag] || "Not quite — trace the log again.");
      if (!this._alive) return;
      this.advanceRound();
    }
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE D — BUG HUNT
  // ══════════════════════════════════════════════════════════════

  setupBugHunt(config) {
    this.trialContainer && this.trialContainer.destroy();
    this.trialContainer = this.add.container(0, 0);
    this.crtLayer.add(this.trialContainer);

    const header = this.add.text(CRT_X, CRT_TOP_Y + 16, "CLICK THE BUG", { font: "bold 13px Arial", color: HEX_MAGENTA }).setOrigin(0.5);
    this.trialContainer.add(header);
    this.tweens.add({ targets: header, alpha: 0.5, duration: 500, yoyo: true, repeat: -1 });

    this.roundLabel.setText(`TRIAL ${this.currentRound + 1}/15`);
    this._bugHuntTokenObjs = [];

    config.lines.forEach((line, li) => {
      const y = CRT_Y - 30 + li * 30;
      const isBugLine = li + 1 === config.faultLine;
      const words = line.split(/(\s+)/).filter((w) => w.length);
      let x = CRT_X - this._lineWidth(line) / 2;
      words.forEach((word) => {
        const trimmed = word.trim();
        const w = this._lineWidth(word);
        if (trimmed.length === 0) { x += w; return; }
        const isFaultToken = isBugLine && (config.faultTokens ? config.faultTokens.includes(trimmed.replace(/[();]/g, "")) : true);
        const t = this.add.text(x, y, word, { font: "bold 14px Courier New", color: "#e0e0e0" }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });
        t.setData("isBug", isFaultToken);
        t.setData("line", li + 1);
        this.trialContainer.add(t);
        t.on("pointerover", () => { if (!this.inputLocked) t.setColor(HEX_GOLD); });
        t.on("pointerout", () => { if (!this.inputLocked) t.setColor("#e0e0e0"); });
        t.on("pointerdown", () => {
          if (this.inputLocked) return;
          this.inputLocked = true;
          this.onTokenClicked(t, config);
        });
        this._bugHuntTokenObjs.push(t);
        x += w;
      });
    });
    this.inputLocked = false;
  }

  _lineWidth(text) {
    const t = this.add.text(0, 0, text, { font: "bold 14px Courier New" });
    const w = t.width; t.destroy(); return w;
  }

  async onTokenClicked(tokenObj, config) {
    this.pauseCreep();
    const timePctUsed = this.getTimePctUsed();
    const timeMs = Math.round(this.time.now - this.roundStartTime);
    const correct = tokenObj.getData("isBug");
    this.logAttempt(config, correct, `line ${tokenObj.getData("line")}`, correct ? null : config.wrongTag, timeMs, timePctUsed);
    this._bugHuntTokenObjs.forEach((t) => t.disableInteractive());

    if (correct) {
      tokenObj.setColor(HEX_GREEN_BRIGHT);
      const fixed = this.add.text(tokenObj.x, tokenObj.y - 18, config.fixedToken || config.fix, { font: "bold 12px Courier New", color: HEX_GREEN_BRIGHT }).setOrigin(0, 0.5).setAlpha(0);
      this.trialContainer.add(fixed);
      this.tweens.add({ targets: fixed, alpha: 1, y: tokenObj.y - 22, duration: 200 });
      await this.stampCRT("processed");
    } else {
      tokenObj.setColor(HEX_RED);
      this.tweens.add({ targets: tokenObj, x: tokenObj.x + 4, duration: 30, yoyo: true, repeat: 4 });
      this._bugHuntTokenObjs.filter((t) => t.getData("isBug")).forEach((t) => this.tweens.add({ targets: t, alpha: 0.3, duration: 180, yoyo: true, repeat: 3 }));
      await this.stampCRT("misread");
    }

    await this.delay(150);
    if (!this._alive) return;
    await this.clearLog();
    await this.runBugHuntReveal(config);
    if (correct) await this.reviveSignalLEDs();
    await this.delay(400);
    if (!this._alive) return;

    this.updateWaveIndicator(this._roundInWave(), correct);
    if (correct) {
      this.updateScore(this.scoreForAttempt(timePctUsed));
      this.updateCombo(true);
      if (this.roundAttempts === 0) this.correctFirstTry++;
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

  /** Bug-hunt reveals genuinely execute the snippet against the tower/log
   * (not scripted): round 14's line 2 refuses at the launch bay (bare
   * println isn't a valid call — no println() unqualified in Java), and
   * round 15 plays both the buggy and fixed futures side by side. */
  async runBugHuntReveal(config) {
    if (config.round === 14) {
      await this.fireCall('"Hi"', {});
      await this.delay(150);
      if (!this._alive) return;
      // line 2 "println("Bye");" has no System.out. prefix — not a valid
      // standalone call, so it refuses at the launch bay.
      this.clearMarquee();
      const t = this.add.text(MARQUEE_X, MARQUEE_Y, "?", { font: "bold 16px Courier New", color: HEX_RED }).setOrigin(0.5);
      this.marqueeContainer.add(t);
      this.tweens.add({ targets: this.marqueeContainer, x: 4, duration: 35, yoyo: true, repeat: 4, onComplete: () => { this.marqueeContainer.x = 0; } });
      this.flareBeacon();
      this.showCompileErrorStamp();
      await this.delay(500);
      this.clearMarquee();
      return;
    }
    if (config.round === 15) {
      await this.fireCall('"Sum: " + 3 + 4', {});
      await this.delay(300);
      if (!this._alive) return;
      await this.fireCall(config.fix, {});
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
    const signalRemaining = 1 - timePctUsed;
    if (signalRemaining > 0.6) { points += 50; this.fastBonusCount++; this.createFloatingText(CRT_X, CRT_Y - CRT_H / 2 - 20, "⚡ CLEAR SIGNAL +50", HEX_GOLD, "bold 13px Arial", 900); }
    else if (signalRemaining > 0.3) { points += 25; this.fastBonusCount++; this.createFloatingText(CRT_X, CRT_Y - CRT_H / 2 - 20, "⚡ +25", HEX_GOLD, "bold 12px Arial", 800); }
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
    this._killCreepTween();
    this.clearRound();
    this.hideBubble();

    (async () => {
      this.flareBeacon();
      this.ledDots.forEach((l, i) => this.time.delayedCall(i * 150, () => this.tweens.add({ targets: l, alpha: 0, duration: 300 })));
      await this.delay(500);
      if (!this._alive) return;
      this.tweens.killTweensOf(this.beacon);
      this.tweens.add({ targets: this.beacon, alpha: 0, duration: 500 });
      this.logRowObjs.forEach((r) => r.textT.setColor("#3d4450"));
      this.serverLEDs.forEach((s) => this.tweens.killTweensOf(s.led));

      const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
      this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });
      const title = this.add.text(640, 240, "BLACKOUT", { font: "bold 40px Arial", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
      this.tweens.add({ targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut", onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }) });
      this.add.text(640, 310, `Score: ${this.score}`, { font: "20px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
      this.add.text(640, 350, `Trials Passed: ${this.currentRound} / 15`, { font: "16px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);
      this._makeButton(640, 420, "RESTORE THE FEED", 220, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
    })();
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this._killCreepTween();
    this.clearRound();
    this.hideBubble();

    try { GameManager.completeLevel(37, Math.round((this.correctFirstTry / 15) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("println_schema_tuned"); } catch (_) {}
    try {
      localStorage.setItem("level38_results", JSON.stringify({
        level: 38, concept: "output_println", phase: "tuning",
        score: this.score, accuracy: this.correctFirstTry / 15, avgTimePct: this.totalTimePctUsed / 15,
        fastBonuses: this.fastBonusCount, comboMax: this.maxCombo, stars: this._starRating(),
        livesRemaining: this.lives, attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.calibrationCelebration().then(() => { if (this._alive) this.showScoreTally(); });
  }

  async calibrationCelebration() {
    this.ledDots.forEach((l) => l.setAlpha(0.9).setFillStyle(C_GREEN_BRIGHT));
    this._waveAmplitude = 8;
    this.drawSignalWave(C_GREEN_BRIGHT);
    await this.clearLog();
    const words = ["WELL", "BROADCAST"];
    for (const w of words) {
      if (!this._alive) return;
      await this.fireCall(`"${w}"`, {});
      await this.delay(150);
    }
    this.createConfetti(LOG_X + LOG_W / 2, LOG_Y + LOG_H / 2, 32);
    await this.delay(500);
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
    panel.fillStyle(0x0a1830, 1);
    panel.fillRoundedRect(360, 90, 560, 440, 16);
    panel.lineStyle(2, C_CYAN, 1);
    panel.strokeRoundedRect(360, 90, 560, 440, 16);

    const title = this.add.text(640, 130, "SIGNAL CALIBRATED", { font: "bold 34px Arial", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(91).setScale(0);
    this.tweens.add({ targets: title, scale: 1, duration: 350, ease: "Back.easeOut" });

    const acc = Math.round((this.correctFirstTry / 15) * 100);
    const avgResponseSec = ((this.totalTimePctUsed / 15) * (WAVE_TIME[2] / 1000)).toFixed(1);
    const lines = [`ACCURACY: ${acc}%`, `AVG RESPONSE: ${avgResponseSec}s`, `CLEAR-SIGNAL BONUSES: ${this.fastBonusCount}`, `BEST COMBO: ×${this.getComboMultiplierFor(this.maxCombo)}`];
    lines.forEach((s, i) => {
      const t = this.add.text(500, 185 + i * 26, s, { font: "14px Arial", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 250, delay: 300 + i * 130 });
    });
    const totalText = this.add.text(500, 185 + 4 * 26, "TOTAL: 0", { font: "bold 22px Arial", color: HEX_GOLD }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: totalText, alpha: 1, duration: 250, delay: 900 });
    const counter = { v: 0 };
    this.tweens.add({ targets: counter, v: this.score, duration: 1000, delay: 900, onUpdate: () => totalText.setText(`TOTAL: ${Math.round(counter.v)}`) });

    const stars = this._starRating();
    for (let i = 0; i < 3; i++) {
      const earned = i < stars;
      const s = this.add.text(640 + (i - 1) * 60, 340, "★", { font: "40px Arial", color: earned ? HEX_GOLD : "#2a3040" }).setOrigin(0.5).setDepth(91).setScale(0);
      this.tweens.add({ targets: s, scale: 1, duration: 250, delay: 1500 + i * 200, ease: earned ? "Back.easeOut" : "Cubic.easeOut" });
    }

    const badge = this.add.container(640, 420).setDepth(91).setAlpha(0);
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillCircle(0, 0, 30);
    bg.lineStyle(3, C_GOLD, 1);
    bg.strokeCircle(0, 0, 30);
    bg.lineStyle(1.5, C_CYAN, 1);
    bg.strokeRoundedRect(-14, -10, 28, 16, 2);
    bg.lineBetween(-10, 0, -6, -4);
    bg.lineBetween(-6, -4, 0, 2);
    bg.lineBetween(0, 2, 10, -6);
    badge.add(bg);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 2000 });
    const badgeLbl = this.add.text(640, 458, "println() SCHEMA TUNED", { font: "bold 13px Arial", color: HEX_GOLD }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: badgeLbl, alpha: 1, duration: 300, delay: 2150 });

    this._makeButton(500, 495, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(760, 495, "NEXT: The Studio →", 260, 44, { fill: 0x00733a, stroke: C_GREEN_BRIGHT, textColor: "#ffffff" }, () => {
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
