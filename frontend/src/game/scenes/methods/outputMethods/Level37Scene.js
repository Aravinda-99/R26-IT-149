/**
 * Level 37 — "The Broadcast Tower" (Output Methods: Accretion Phase)
 * ===========================================================================
 * Opens the new Output Wing. Teaches System.out.println() as the directional
 * counterpart to Scanner: Scanner PULLS data in, println PUSHES data out.
 * Every transmission (a println call) assembles its argument in the marquee,
 * launches up the tower antenna, and lands on the Broadcast Log — which is
 * the level's ground truth. The log always auto-advances a fresh cursor
 * slot after every transmission (println() included), making the invisible
 * newline visible.
 *
 * evaluatePrintln() is an honest left-to-right expression evaluator: it
 * tokenizes on top-level '+' (respecting quotes), evaluates each token as a
 * String literal / numeric literal / boolean literal / variable reference,
 * and folds left-to-right with "sticky" String context — once either side
 * of a '+' is a String, the rest concatenates; pure-numeric chains add.
 * Malformed or undefined tokens are genuine compile errors. Nothing here is
 * a lookup table — round 6's "score: " + 1 + 1 and round 9's 3 + 4 both
 * fall out of the same fold.
 */

import Phaser from "phaser";
import { GameManager } from "../../../GameManager.js";
import { BadgeSystem } from "../../../BadgeSystem.js";

const W = 1280, H = 720;

const C_CYAN = 0x00e5ff, C_GOLD = 0xffd740, C_ORANGE = 0xe65100;
const C_VIOLET = 0x7c4dff, C_PURPLE = 0x7b1fa2, C_MAGENTA = 0xff4081;
const C_GREEN = 0x4caf50, C_GREEN_BRIGHT = 0x00e676, C_RED = 0xf44336, C_GRAY = 0x78909c;
const HEX_CYAN = "#00e5ff", HEX_GOLD = "#ffd740", HEX_ORANGE = "#e65100";
const HEX_VIOLET = "#7c4dff", HEX_PURPLE = "#7b1fa2", HEX_GRAY = "#78909c";
const HEX_GREEN = "#4caf50", HEX_GREEN_BRIGHT = "#00e676", HEX_RED = "#f44336";
const HEX_MAGENTA = "#ff4081";

const TOWER_X = 260;
const MARQUEE_X = 320, MARQUEE_Y = 220, MARQUEE_W = 320, MARQUEE_H = 54;
const LAUNCH_X = 260, LAUNCH_Y = 155;
const ANTENNA_TOP_X = 260, ANTENNA_TOP_Y = 62;
const LOG_X = 640, LOG_Y = 96, LOG_W = 600, LOG_H = 470;
const LOG_CONTENT_Y0 = LOG_Y + 44;
const ROW_H = 30;
const SRC_Y = 165;
const TUTORIAL_KEY = "level37_tutorial_done";
let firstNewlineAnnotationShown = false;

// ══════════════════════════════════════════════════════════════
// ROUND CONFIGURATION
// ══════════════════════════════════════════════════════════════
const ROUNDS = [
  { round: 1, type: "predict", source: ['System.out.println("Broadcasting");'],
    question: "What appears on the log?", correct: "Broadcasting",
    options: [
      { value: "Broadcasting", tag: null },
      { value: '"Broadcasting"', tag: "quotes_print_belief" },
      { value: "broadcasting", tag: "case_change_belief" },
      { value: "Error", tag: "argument_type_doubt" },
    ], concept: "basic_string" },

  { round: 2, type: "predict", source: ["int score = 42;", "System.out.println(score);"], decls: { score: { value: 42, type: "int" } },
    question: "What appears on the log?", correct: "42",
    options: [
      { value: "42", tag: null },
      { value: "score", tag: "variable_as_literal_belief" },
      { value: '"42"', tag: "int_prints_with_quotes_belief" },
      { value: "Error", tag: "type_cannot_print_belief" },
    ],
    revealNote: "The marquee shows a GOLD int slug carrying '42', not the word 'score' — variables are labels that hold values.",
    concept: "int_variable" },

  { round: 3, type: "predict", source: ["System.out.println(true);"],
    question: "What appears on the log?", correct: "true",
    options: [
      { value: "true", tag: null },
      { value: "1", tag: "boolean_as_int_belief" },
      { value: '"true"', tag: "boolean_prints_with_quotes_belief" },
      { value: "Error", tag: "type_cannot_print_belief" },
    ],
    revealNote: "Violet boolean slug carries the keyword as-is — println knows every type.",
    concept: "boolean_literal" },

  { round: 4, type: "predict", source: ['System.out.println("Age: " + 25);'],
    question: "What appears on the log?", correct: "Age: 25",
    options: [
      { value: "Age: 25", tag: null },
      { value: "Age: 25.0", tag: "int_becomes_double_belief" },
      { value: '"Age: " + 25', tag: "plus_not_evaluated_belief" },
      { value: "Error", tag: "type_mismatch_at_plus_belief" },
    ],
    revealNote: "Cyan concatenation animation: String on the left → the 25 slug fuses into the String.",
    concept: "string_plus_int" },

  { round: 5, type: "predict", source: ["int age = 25;", 'System.out.println("age");', "System.out.println(age);"], decls: { age: { value: 25, type: "int" } },
    question: "What appears on the log across both lines?", correct: "age⏎25",
    options: [
      { value: "age⏎25", label: "age (line 1)⏎25 (line 2)", tag: null },
      { value: "25⏎25", tag: "literal_as_variable_belief" },
      { value: "age⏎age", tag: "variable_as_literal_belief" },
      { value: '"age"⏎25', tag: "quotes_print_belief" },
    ],
    revealNote: "The literal-vs-variable pair on the same name — quotes flip the meaning entirely.",
    concept: "literal_vs_variable" },

  { round: 6, type: "predict", source: ['System.out.println("score: " + 1 + 1);'],
    question: "What appears on the log?", correct: "score: 11",
    options: [
      { value: "score: 11", tag: null },
      { value: "score: 2", tag: "plus_always_adds" },
      { value: "score: 1 + 1", tag: "plus_not_evaluated_belief" },
      { value: "score: 12", tag: "off_by_one" },
    ],
    revealNote: "Left-to-right: 'score: ' + 1 fuses first (String context locks in), then + 1 fuses again → 'score: 11'.",
    concept: "left_to_right_concat" },

  { round: 7, type: "predict", source: ['System.out.println("A");', 'System.out.println("B");'],
    question: "What appears on the log?", correct: "A⏎B",
    options: [
      { value: "A⏎B", label: "A (line 1)⏎B (line 2)", tag: null },
      { value: "AB", tag: "same_line_belief" },
      { value: "A B", tag: "space_between_belief" },
      { value: "B", tag: "second_overwrites_belief" },
    ],
    revealNote: "Two transmissions, two auto-newlines, two lines.",
    concept: "stacking" },

  { round: 8, type: "predict", source: ['System.out.println("A");', "System.out.println();", 'System.out.println("B");'],
    question: "What appears on the log?", correct: "A⏎(blank)⏎B",
    options: [
      { value: "A⏎(blank)⏎B", label: "A⏎ (empty line) ⏎B", tag: null },
      { value: "A⏎B", tag: "empty_println_ignored_belief" },
      { value: "AB", tag: "same_line_belief" },
      { value: "Error", tag: "empty_println_error_belief" },
    ],
    revealNote: "Middle transmission delivers no text; the log's cursor slot drops down one row, leaving a visible blank line between A and B.",
    concept: "empty_println_blank_line" },

  { round: 9, type: "predict", source: ['System.out.println("A");', 'System.out.println("B" + 2);', "System.out.println(3 + 4);"],
    question: "What appears on the log?", correct: "A⏎B2⏎7",
    options: [
      { value: "A⏎B2⏎7", label: "A⏎B2⏎7 (three lines)", tag: null },
      { value: "A⏎B2⏎34", tag: "plus_always_concatenates" },
      { value: "A⏎B+2⏎3+4", tag: "plus_not_evaluated_belief" },
      { value: "AB27", tag: "same_line_belief" },
    ],
    revealNote: "Three lines: pure String (A), String+int concatenation (B2), pure arithmetic (7).",
    concept: "mixed_calls" },

  { round: 10, type: "command", sourceTemplate: ["System.out.println(<slot:arg>);"],
    mission: "Broadcast the exact word: WELCOME.",
    slots: [{ id: "arg" }],
    cartridges: [
      { code: '"WELCOME"', correct: true, slotId: "arg" },
      { code: "WELCOME", tag: "variable_as_literal_belief", slotId: "arg" },
      { code: '"welcome"', tag: "case_change_belief", slotId: "arg" },
      { code: '"WELCOME!"', tag: "extra_punctuation", slotId: "arg" },
    ],
    expectedLog: "WELCOME", concept: "command_string_literal" },

  { round: 11, type: "command", sourceTemplate: ["int lives = 3;", "System.out.println(<slot:arg>);"], decls: { lives: { value: 3, type: "int" } },
    mission: "Broadcast the phrase: Lives left: 3",
    slots: [{ id: "arg" }],
    cartridges: [
      { code: '"Lives left: " + lives', correct: true, slotId: "arg" },
      { code: '"Lives left: lives"', tag: "variable_as_literal_belief", slotId: "arg" },
      { code: "Lives left: + lives", tag: "missing_quotes_belief", slotId: "arg" },
      { code: '"Lives left: " + 3', correct: true, alsoCorrect: true, slotId: "arg" },
    ],
    expectedLog: "Lives left: 3",
    revealNote: "Two winning combinations exist here — the variable build AND the literal '3' build both pass. The variable version updates automatically if 'lives' ever changes; the literal doesn't.",
    concept: "command_concat_with_variable" },

  { round: 12, type: "command", sourceTemplate: ["<slot:call1>", "<slot:call2>", "<slot:call3>"],
    mission: "Produce this log EXACTLY: line 1 HEADER, line 2 (blank), line 3 --- END ---",
    slots: [{ id: "call1" }, { id: "call2" }, { id: "call3" }],
    cartridges: [
      { code: 'System.out.println("HEADER");', correct: true, slotId: "call1" },
      { code: "System.out.println();", correct: true, slotId: "call2" },
      { code: 'System.out.println("--- END ---");', correct: true, slotId: "call3" },
      { code: 'System.out.println("");', tag: "empty_string_vs_empty_call", alsoCorrect: true, slotId: "call2" },
      { code: 'System.out.Println("HEADER");', tag: "method_name_case_insensitive_belief", slotId: "call1" },
    ],
    expectedLog: "HEADER⏎⏎--- END ---",
    revealNote: "println(\"\") and println() BOTH print a blank line — either works. The Println cartridge (capital P) is a compile-error trap: on RUN, the transmission is refused at the launch bay — the beacon flares red, a COMPILE ERROR stamp lands, and the log stays completely untouched. Java is strict about method-name casing, in every wing.",
    concept: "command_multi_line_layout" },
];

const MISCONCEPTION_FEEDBACK = {
  variable_as_literal_belief: "The quotes make ALL the difference — println(age) prints the value INSIDE the age variable. Without quotes, Java looks up the variable's contents.",
  literal_as_variable_belief: 'With quotes, println("age") prints the exact letters \'age\'. Java doesn\'t hunt for a variable when it sees quotes.',
  quotes_print_belief: "The quotes are wrapping paper — they mark where the String starts and ends, but they NEVER travel to the log. Only the content prints.",
  plus_always_adds: "That + saw a String on the left and switched sides — it became concatenation glue. Once a String enters the expression, + concatenates all the way through.",
  plus_always_concatenates: "Pure numbers add! 3 + 4 in a numeric context is 7, not '34'. The String only takes over + when it's ONE OF THE OPERANDS.",
  plus_not_evaluated_belief: "The + inside println is real code — it evaluates before the transmission. What lands on the log is the RESULT, not the recipe.",
  same_line_belief: "Every println auto-appends a newline — that's the 'ln' in the name! Two calls, two lines, always.",
  space_between_belief: "println never inserts a space of its own — only what you put in the argument appears. Two calls just stack, no gap.",
  second_overwrites_belief: "The log doesn't erase — it stacks. Every transmission adds a NEW line; nothing gets overwritten.",
  empty_println_ignored_belief: "An empty println is a real transmission — it still adds a newline, so a blank line appears on the log. Silence has volume too.",
  empty_println_error_belief: "println() with nothing inside is completely legal — it's how programmers write blank lines to space out output.",
  int_prints_with_quotes_belief: "Quotes are how you write String LITERALS in code — they're never part of what prints.",
  boolean_prints_with_quotes_belief: "Quotes are how you write String LITERALS in code — they're never part of what prints.",
  case_change_belief: "println doesn't touch the letters — whatever goes in comes out unchanged. Case-conversion is a different wing entirely.",
  type_cannot_print_belief: "println is friendly with EVERY type — String, int, double, char, boolean. If it has a value, it prints.",
  int_becomes_double_belief: "Concatenation doesn't add decimals — ints stay as they are inside a String. 25 becomes '25', not '25.0'.",
  boolean_as_int_belief: "Java booleans print as the words 'true' or 'false' — not 1 or 0. Different language, different convention.",
  argument_type_doubt: 'That argument is a perfectly valid String literal — no error here.',
  type_mismatch_at_plus_belief: "String + int is completely legal — the int gets folded into the String. No mismatch, no error.",
  off_by_one: "Trace the fold again: 'score: ' + 1 → 'score: 1', then + 1 → 'score: 11'. Concatenation glues digits, it doesn't add them.",
  extra_punctuation: "Check the exact word requested — extra characters don't belong unless the mission asked for them.",
  missing_quotes_belief: "Without quotes, Java tries to read your text as code — bare words need to be valid identifiers or String literals in quotes.",
  method_name_case_insensitive_belief: "The compile-error stamp on the source display — see it? Java only knows println with a lowercase 'p'. One capital letter and the transmission never even leaves the tower. Method names are exact — always.",
};

export class Level37Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level37Scene" });
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
    this.logLines = [];
    this.logRowObjs = [];
    this._cursorOnFreshLine = true;
    this.inputLocked = true;
    this.gameEnded = false;
    this._alive = true;
    this._bubble = null;
    this.slotContents = {};
    this.slotDefs = {};
    this.cartridges = [];
    this._dragHoverSlotKey = null;
    this._commandFirstFail = true;
  }

  preload() {}

  create() {
    this._alive = true;
    this.events.once("shutdown", () => { this._alive = false; });

    const cam = this.cameras.main;
    const zoom = Math.min(this.scale.width / W, this.scale.height / H);
    cam.setZoom(zoom);
    cam.centerOn(W / 2, H / 2);
    cam.setBackgroundColor("#050914");

    try { GameManager.incrementAttempt(36); } catch (_) {}

    this.createParticleTexture();
    this.createBackground();
    this.createNightsky();
    this.createSkyline();
    this.createGround();
    this.createParticles();
    this.createTower();
    this.createAntennaColumn();
    this.createLaunchBay();
    this.createMarquee();
    this.createCartridgeCache();
    this.createSourceDisplay();
    this.createBroadcastLog();
    this.createHUD();
    this.createExpressionMonitor();
    this.createBit();
    this.setupDragEvents();

    cam.fadeIn(700, 3, 3, 5);
    this.checkTutorial();
  }

  update(time, delta) {
    this.updateParticles(time, delta);
    this.updateStarTwinkle(time);
    this.updateCloud(time, delta);
    this.updateBeacon(time);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // BACKGROUND
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l37_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l37_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x050914).setDepth(0);
  }

  createNightsky() {
    this.stars = [];
    for (let i = 0; i < 40; i++) {
      const s = this.add.circle(Phaser.Math.Between(0, W), Phaser.Math.Between(0, 380), 1, 0xe3f2fd, Phaser.Math.FloatBetween(0.15, 0.5)).setDepth(1);
      this.stars.push(s);
    }
    this.twinkleStars = Phaser.Utils.Array.Shuffle(this.stars.slice()).slice(0, 6);
    this.twinkleStars.forEach((s) => {
      this.tweens.add({ targets: s, alpha: 0.15, duration: Phaser.Math.Between(1800, 3200), yoyo: true, repeat: -1 });
    });

    const moon = this.add.circle(1140, 90, 30, 0xeceff1, 0.06).setDepth(1);
    const moonCut = this.add.circle(1132, 86, 26, 0x050914, 1).setDepth(1);
    this.moon = moon;

    this.cloud = this.add.container(-150, 190).setDepth(1);
    [[0, 0, 30], [26, -6, 40], [56, 0, 28]].forEach(([dx, dy, r]) => {
      this.cloud.add(this.add.circle(dx, dy, r, 0x0a1128, 0.5));
    });
    this._cloudProgress = 0;
  }

  updateStarTwinkle() {}

  updateCloud(time, delta) {
    this._cloudProgress += delta / 90000;
    if (this._cloudProgress > 1) this._cloudProgress = 0;
    this.cloud.x = Phaser.Math.Linear(-150, 1430, this._cloudProgress);
  }

  createSkyline() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x0a1128, 1);
    let x = 0;
    let i = 0;
    while (x < W) {
      const w = Phaser.Math.Between(60, 140);
      const h = Phaser.Math.Between(36, 72);
      g.fillRect(x, 440 - h, w, h);
      if (i % 2 === 0) {
        g.fillStyle(0xffd740, 0.15);
        g.fillRect(x + w / 2 - 1, 440 - h + 10, 2, 2);
        g.fillStyle(0x0a1128, 1);
      }
      x += w;
      i++;
    }
  }

  createGround() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x0a0d18, 1);
    g.fillRect(0, 576, W, 144);
    g.lineStyle(2, C_GOLD, 0.06);
    for (let x = 0; x < W; x += 16) { g.lineBetween(x, 610, x + 8, 610); g.lineBetween(x, 660, x + 8, 660); }
    const shed = this.add.graphics().setDepth(2);
    shed.lineStyle(1, 0x1a2135, 0.3);
    shed.strokeRect(60, 620, 90, 70);
    shed.strokeRect(90, 650, 20, 40);
    for (let i = 0; i < 3; i++) shed.lineBetween(70 + i * 10, 630, 70 + i * 10, 645);
  }

  createParticles() {
    this.ambient = [];
    for (let i = 0; i < 8; i++) {
      const p = this.add.circle(Phaser.Math.Between(0, W), Phaser.Math.Between(400, 700), 1, 0x4fc3f7, Phaser.Math.FloatBetween(0.03, 0.08)).setDepth(2);
      this.ambient.push(p);
    }
  }

  updateParticles(time, delta) {
    if (!this.ambient) return;
    const step = 0.025 * (delta / 16.7);
    this.ambient.forEach((p, i) => {
      p.y -= step;
      p.x += Math.sin(time * 0.0006 + i) * 0.04;
      if (p.y < 0) { p.y = 700; p.x = Phaser.Math.Between(0, W); }
    });
  }

  // ══════════════════════════════════════════════════════════════
  // TOWER
  // ══════════════════════════════════════════════════════════════

  createTower() {
    const g = this.add.graphics().setDepth(3);
    g.lineStyle(2, 0x3d4450, 1);
    g.lineBetween(220, 620, TOWER_X, 130);
    g.lineBetween(300, 620, TOWER_X, 130);
    for (let i = 1; i <= 6; i++) {
      const t = i / 7;
      const y = 620 - t * (620 - 130);
      const leftX = Phaser.Math.Linear(220, TOWER_X, t);
      const rightX = Phaser.Math.Linear(300, TOWER_X, t);
      g.lineStyle(1, 0x3d4450, 1);
      g.lineBetween(leftX, y, rightX, y);
    }
    for (let i = 0; i < 6; i++) {
      const t0 = i / 7, t1 = (i + 1) / 7;
      const y0 = 620 - t0 * 490, y1 = 620 - t1 * 490;
      const lx0 = Phaser.Math.Linear(220, TOWER_X, t0), rx0 = Phaser.Math.Linear(300, TOWER_X, t0);
      const lx1 = Phaser.Math.Linear(220, TOWER_X, t1), rx1 = Phaser.Math.Linear(300, TOWER_X, t1);
      g.lineBetween(lx0, y0, rx1, y1);
      g.lineBetween(rx0, y0, lx1, y1);
    }
    g.fillStyle(0x141a24, 1);
    g.fillRoundedRect(TOWER_X - 30, 124, 60, 10, 2);
    g.lineStyle(1, 0x3d4450, 1);
    g.strokeRoundedRect(TOWER_X - 30, 124, 60, 10, 2);

    this.beacon = this.add.circle(TOWER_X, 120, 5, C_RED, 0.4).setDepth(4);
    this.tweens.add({ targets: this.beacon, alpha: 0.25, duration: 1500, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
  }

  updateBeacon() {}

  flareBeacon() {
    this.tweens.killTweensOf(this.beacon);
    this.beacon.setFillStyle(C_RED, 1);
    this.tweens.add({
      targets: this.beacon, alpha: 0.3, duration: 800,
      onComplete: () => {
        this.beacon.setFillStyle(C_RED, 0.4);
        this.tweens.add({ targets: this.beacon, alpha: 0.25, duration: 1500, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
      },
    });
  }

  createAntennaColumn() {
    const g = this.add.graphics().setDepth(3);
    g.lineStyle(2, 0x546e7a, 1);
    g.lineBetween(ANTENNA_TOP_X, 130, ANTENNA_TOP_X, ANTENNA_TOP_Y);
  }

  createLaunchBay() {
    const g = this.add.graphics().setDepth(4);
    g.fillStyle(0x141a24, 1);
    g.fillRoundedRect(LAUNCH_X - 45, LAUNCH_Y - 27, 90, 54, 6);
    g.lineStyle(2, C_CYAN, 1);
    g.strokeRoundedRect(LAUNCH_X - 45, LAUNCH_Y - 27, 90, 54, 6);
    this.add.text(LAUNCH_X, LAUNCH_Y - 34, "TX", { font: "bold 9px Arial", color: HEX_CYAN }).setOrigin(0.5).setAlpha(0.6).setDepth(4);
  }

  // ══════════════════════════════════════════════════════════════
  // MARQUEE
  // ══════════════════════════════════════════════════════════════

  createMarquee() {
    const g = this.add.graphics().setDepth(4);
    g.fillStyle(0x0d1117, 1);
    g.fillRoundedRect(MARQUEE_X, MARQUEE_Y, MARQUEE_W, MARQUEE_H, 6);
    g.lineStyle(1, 0x3d4450, 1);
    g.strokeRoundedRect(MARQUEE_X, MARQUEE_Y, MARQUEE_W, MARQUEE_H, 6);
    this.marqueeBg = g;

    this.bulbs = [];
    for (let i = 0; i < 9; i++) {
      const bx = MARQUEE_X + 14 + i * ((MARQUEE_W - 28) / 8);
      const bulb = this.add.circle(bx, MARQUEE_Y, 2, 0x3d4450).setDepth(5);
      this.bulbs.push(bulb);
    }
    this._bulbChaseEvent = null;

    this.marqueeContainer = this.add.container(0, 0).setDepth(6);
  }

  startBulbChase() {
    this.stopBulbChase();
    let i = 0;
    this._bulbChaseEvent = this.time.addEvent({
      delay: 80, loop: true,
      callback: () => {
        this.bulbs.forEach((b, idx) => b.setFillStyle(idx === i % this.bulbs.length ? C_GOLD : 0x3d4450));
        i++;
      },
    });
  }

  stopBulbChase() {
    if (this._bulbChaseEvent) { this._bulbChaseEvent.remove(); this._bulbChaseEvent = null; }
    this.bulbs.forEach((b) => b.setFillStyle(0x3d4450));
  }

  clearMarquee() {
    this.marqueeContainer.removeAll(true);
  }

  _typeColor(type) {
    switch (type) {
      case "string": return HEX_CYAN;
      case "int": return HEX_GOLD;
      case "double": return HEX_ORANGE;
      case "char": return HEX_CYAN;
      case "boolean": return HEX_VIOLET;
      case "newline": return HEX_PURPLE;
      default: return "#e0e0e0";
    }
  }

  _typeColorInt(type) {
    switch (type) {
      case "string": return C_CYAN;
      case "int": return C_GOLD;
      case "double": return C_ORANGE;
      case "char": return C_CYAN;
      case "boolean": return C_VIOLET;
      case "newline": return C_PURPLE;
      default: return 0xe0e0e0;
    }
  }

  _displayForMarquee(evalResult) {
    if (evalResult.isEmpty) return "⏎";
    if (evalResult.styleType === "string") return evalResult.text;
    return evalResult.text;
  }

  async assembleArgument(evalResult) {
    this.clearMarquee();
    this.startBulbChase();
    const cx = MARQUEE_X + MARQUEE_W / 2, cy = MARQUEE_Y + MARQUEE_H / 2;

    if (evalResult.isEmpty) {
      const t = this.add.text(cx, cy, "⏎", { font: "bold 22px Arial", color: HEX_PURPLE }).setOrigin(0.5).setScale(0);
      const hint = this.add.text(cx, cy + 20, "empty line", { font: "italic 9px Arial", color: HEX_PURPLE }).setOrigin(0.5).setAlpha(0);
      this.marqueeContainer.add([t, hint]);
      this.tweens.add({ targets: t, scale: 1, duration: 200, ease: "Back.easeOut" });
      this.tweens.add({ targets: hint, alpha: 0.7, duration: 200, delay: 150 });
      await this.delay(400);
      return;
    }

    const display = evalResult.text;
    const color = this._typeColor(evalResult.styleType);
    const isString = evalResult.styleType === "string";
    const quoteL = isString ? this.add.text(0, cy, '"', { font: "bold 20px Courier New", color: HEX_GRAY }) : null;
    let x = cx - this._measureWidth(display, isString) / 2;
    if (quoteL) { quoteL.setPosition(x, cy).setOrigin(0, 0.5); this.marqueeContainer.add(quoteL); x += quoteL.width; }

    const chars = display.split("");
    for (let i = 0; i < chars.length; i++) {
      if (!this._alive) return;
      const ch = chars[i] === " " && isString ? "␣" : chars[i];
      const chColor = chars[i] === " " && isString ? HEX_MAGENTA : color;
      const t = this.add.text(x, cy, ch, { font: "bold 20px Courier New", color: chColor }).setOrigin(0, 0.5).setAlpha(0);
      this.marqueeContainer.add(t);
      x += t.width;
      this.tweens.add({ targets: t, alpha: 1, duration: 80 });
      await this.delay(30);
    }
    if (isString) {
      const quoteR = this.add.text(x, cy, '"', { font: "bold 20px Courier New", color: HEX_GRAY }).setOrigin(0, 0.5);
      this.marqueeContainer.add(quoteR);
    }
    await this.delay(300);
  }

  _measureWidth(text, isString) {
    const t = this.add.text(0, 0, (isString ? '"' + text + '"' : text), { font: "bold 20px Courier New" });
    const w = t.width;
    t.destroy();
    return w;
  }

  async animateConcatenation(tokens, evaluated) {
    this.clearMarquee();
    this.startBulbChase();
    const cy = MARQUEE_Y + MARQUEE_H / 2;
    let anyString = evaluated.some((e) => e.type === "string");
    const plusColor = anyString ? HEX_CYAN : HEX_GOLD;

    let x = MARQUEE_X + 14;
    evaluated.forEach((e, i) => {
      const disp = e.type === "string" ? `"${e.value}"` : String(e.value);
      const t = this.add.text(x, cy, disp, { font: "bold 15px Courier New", color: this._typeColor(e.type) }).setOrigin(0, 0.5).setAlpha(0);
      this.marqueeContainer.add(t);
      this.tweens.add({ targets: t, alpha: 1, duration: 150 });
      x += t.width + 6;
      if (i < evaluated.length - 1) {
        const p = this.add.text(x, cy, "+", { font: "bold 15px Courier New", color: plusColor }).setOrigin(0, 0.5).setAlpha(0);
        this.marqueeContainer.add(p);
        this.tweens.add({ targets: p, alpha: 1, duration: 150 });
        x += p.width + 6;
      }
    });
    await this.delay(500);
    if (!this._alive) return;

    const note = anyString ? "String on either side → concatenation" : "all numbers → arithmetic";
    if (!this._conceptNoted) this._conceptNoted = {};
    if (!this._conceptNoted[note]) {
      this._conceptNoted[note] = true;
      const t = this.add.text(MARQUEE_X + MARQUEE_W / 2, MARQUEE_Y - 12, note, { font: "italic 10px Arial", color: plusColor }).setOrigin(0.5).setAlpha(0);
      this.marqueeContainer.add(t);
      this.tweens.add({ targets: t, alpha: 1, duration: 200 });
      await this.delay(500);
    }
  }

  // ══════════════════════════════════════════════════════════════
  // CARTRIDGE CACHE (preview rail)
  // ══════════════════════════════════════════════════════════════

  createCartridgeCache() {
    this.cacheContainer = this.add.container(0, 0).setDepth(4);
  }

  updateCartridgeCache(types) {
    this.cacheContainer.removeAll(true);
    let x = 415;
    types.forEach((type) => {
      const label = type === "newline" ? "⏎" : type;
      const style = { font: "bold 10px Arial", color: "#0a0e14" };
      const tmp = this.add.text(0, 0, label, style);
      const w = tmp.width + 14;
      tmp.destroy();
      const g = this.add.graphics();
      g.fillStyle(this._typeColorInt(type), 1);
      g.fillRoundedRect(x, 130 - 11, w, 22, 11);
      g.lineStyle(1, 0x0d1117, 1);
      g.strokeRoundedRect(x, 130 - 11, w, 22, 11);
      const t = this.add.text(x + w / 2, 130, label, style).setOrigin(0.5);
      this.cacheContainer.add([g, t]);
      x += w + 8;
    });
  }

  // ══════════════════════════════════════════════════════════════
  // SOURCE DISPLAY / EXPRESSION MONITOR
  // ══════════════════════════════════════════════════════════════

  createSourceDisplay() {
    this.sourceContainer = this.add.container(0, 0).setDepth(15);
  }

  _syntaxTokenize(line) {
    const tokens = [];
    const re = /(\bSystem\.out\b)|(\.)|(\bprintln\b|\bprint\b)|(\bint\b|\bdouble\b|\bboolean\b)|("(?:[^"\\]|\\.)*")|(\btrue\b|\bfalse\b)|([(){};=])|(\+)/g;
    let last = 0, m;
    const plain = (t) => t && tokens.push({ t, c: "#e0e0e0" });
    while ((m = re.exec(line))) {
      if (m.index > last) plain(line.slice(last, m.index));
      if (m[1]) tokens.push({ t: m[1], c: HEX_GREEN });
      else if (m[2]) tokens.push({ t: m[2], c: HEX_GRAY });
      else if (m[3]) tokens.push({ t: m[3], c: HEX_GOLD });
      else if (m[4]) tokens.push({ t: m[4], c: "#4fc3f7" });
      else if (m[5]) tokens.push({ t: m[5], c: HEX_CYAN });
      else if (m[6]) tokens.push({ t: m[6], c: HEX_VIOLET });
      else if (m[7]) tokens.push({ t: m[7], c: HEX_MAGENTA });
      else if (m[8]) tokens.push({ t: m[8], c: "#e0e0e0" });
      last = m.index + m[0].length;
    }
    if (last < line.length) plain(line.slice(last));
    return tokens.length ? tokens : [{ t: line, c: "#e0e0e0" }];
  }

  updateSourceDisplay(lines) {
    this.sourceContainer.removeAll(true);
    const fontSize = lines.length > 2 ? 13 : 16;
    lines.forEach((line, i) => {
      const tokens = this._syntaxTokenize(line);
      const measured = tokens.map((t) => {
        const tmp = this.add.text(0, 0, t.t, { font: `${fontSize}px Courier New` });
        const w = tmp.width; tmp.destroy(); return w;
      });
      const totalW = measured.reduce((a, b) => a + b, 0);
      let x = 480 - totalW / 2;
      const y = SRC_Y + i * (fontSize + 6) - ((lines.length - 1) * (fontSize + 6)) / 2;
      tokens.forEach((tok, ti) => {
        const t = this.add.text(x, y, tok.t, { font: `${fontSize}px Courier New`, color: tok.c }).setOrigin(0, 0.5);
        this.sourceContainer.add(t);
        x += measured[ti];
      });
    });
  }

  createExpressionMonitor() {
    const g = this.add.graphics().setDepth(50);
    g.fillStyle(0x1a1a2e, 1);
    g.fillRoundedRect(W / 2 - 190, 10, 380, 44, 8);
    g.lineStyle(1, 0x2a2a4a, 1);
    g.strokeRoundedRect(W / 2 - 190, 10, 380, 44, 8);
    this.monitorText = this.add.text(W / 2, 32, "", { font: "13px Courier New", color: "#e0e0e0" }).setOrigin(0.5).setDepth(51);
  }

  updateExpressionMonitor(text) {
    this.monitorText.setText(text);
    if (this.monitorText.width > 360) this.monitorText.setFontSize(11);
    else this.monitorText.setFontSize(13);
  }

  // ══════════════════════════════════════════════════════════════
  // BROADCAST LOG
  // ══════════════════════════════════════════════════════════════

  createBroadcastLog() {
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
    header.fillRoundedRect(LOG_X, LOG_Y, LOG_W, 44, { tl: 12, tr: 12, bl: 0, br: 0 });
    this.logLed = this.add.circle(LOG_X + 20, LOG_Y + 22, 5, C_RED).setDepth(12);
    this.add.text(LOG_X + 40, LOG_Y + 22, "BROADCAST LOG — CONSOLE OUTPUT", { font: "bold 11px Arial", color: HEX_CYAN }).setOrigin(0, 0.5).setDepth(12);
    this.add.text(LOG_X + LOG_W - 15, LOG_Y + 22, "CH 01", { font: "10px Arial", color: HEX_GRAY }).setOrigin(1, 0.5).setDepth(12);

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
    const rowIndex = this.logLines.length;
    const y = LOG_CONTENT_Y0 + 16 + rowIndex * ROW_H;
    const c = this.add.container(0, 0);
    const underline = this.add.rectangle(LOG_X + 20, y + 10, LOG_W - 40, 1, C_CYAN, 0.3).setOrigin(0, 0.5);
    const cursorBlock = this.add.rectangle(LOG_X + 20, y, 2, 14, C_CYAN, 0.5).setOrigin(0, 0.5);
    this.tweens.add({ targets: cursorBlock, alpha: 0, duration: 700, yoyo: true, repeat: -1 });
    c.add([underline, cursorBlock]);
    this.logLayer.add(c);
    this.cursorRow = c;
  }

  _createLogRow(text, styleType) {
    const rowIndex = this.logLines.length;
    const y = LOG_CONTENT_Y0 + 16 + rowIndex * ROW_H;
    const stripe = this.add.rectangle(LOG_X + 4, y, LOG_W - 8, ROW_H, rowIndex % 2 === 0 ? 0x0a1830 : 0x08111c, rowIndex % 2 === 0 ? 0.15 : 0).setOrigin(0, 0.5);
    const numT = this.add.text(LOG_X + 6, y, String(rowIndex + 1).padStart(2, "0"), { font: "11px Courier New", color: "#3d4450" }).setOrigin(0, 0.5);
    const textT = this.add.text(LOG_X + 34, y, text, { font: "bold 17px Courier New", color: this._typeColor(styleType) }).setOrigin(0, 0.5).setAlpha(0).setScale(0.7);
    this.logLayer.add([stripe, numT, textT]);
    this.tweens.add({ targets: textT, alpha: 1, scale: 1, duration: 200, ease: "Back.easeOut" });
    this.logLines.push({ text, styleType });
    this.logRowObjs.push({ stripe, numT, textT });
  }

  /**
   * Cursor-state machine shared by println() and print(): whichever call
   * lands starts a new row if the cursor is on a fresh line, or appends to
   * the still-open last row if the previous call was a print() that never
   * advanced past it. `endsLine` decides whether THIS call leaves the
   * cursor on a fresh line afterward (println) or mid-row (print).
   */
  _writeToLog(text, styleType, endsLine) {
    if (this._cursorOnFreshLine === false && this.logLines.length > 0) {
      const lastIndex = this.logLines.length - 1;
      this.logLines[lastIndex].text += text;
      this.logRowObjs[lastIndex].textT.setText(this.logLines[lastIndex].text);
    } else {
      this._createLogRow(text, styleType);
    }
    this._cursorOnFreshLine = endsLine;
    this.renderCursorRow();
  }

  addLogLine(text, styleType) {
    this._writeToLog(text, styleType, true);
  }

  clearLog() {
    return new Promise((res) => {
      const wipe = this.add.rectangle(LOG_X + LOG_W / 2, LOG_CONTENT_Y0, LOG_W, 0, 0x08111c, 1).setOrigin(0.5, 0);
      this.logLayer.add(wipe);
      this.tweens.add({
        targets: wipe, height: LOG_Y + LOG_H - LOG_CONTENT_Y0, duration: 400, ease: "Cubic.easeIn",
        onComplete: () => {
          this.logLayer.removeAll(true);
          this.logLines = [];
          this.logRowObjs = [];
          this._cursorOnFreshLine = true;
          this.renderCursorRow();
          res();
        },
      });
    });
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

    this.add.text(20, 14, "THE BROADCAST TOWER", { font: "bold 15px Arial", color: "#b0bec5" }).setDepth(51);
    this.add.text(20, 32, "Accretion Phase — Output Methods: println()", { font: "11px Arial", color: "#546e7a" }).setDepth(51);

    this.add.text(1060, 8, "SCORE", { font: "9px Arial", color: "#546e7a" }).setDepth(51);
    this.scoreText = this.add.text(1060, 20, "0", { font: "bold 18px Arial", color: "#ffffff" }).setDepth(51);
    this.comboText = this.add.text(1060, 42, "×1", { font: "bold 12px Arial", color: HEX_GOLD }).setDepth(51);

    this.lifeIcons = [];
    for (let i = 0; i < 3; i++) {
      const lg = this.add.graphics({ x: 1150 + i * 26, y: 24 }).setDepth(51);
      lg.lineStyle(2, C_CYAN, 1);
      lg.lineBetween(0, -6, 0, 8);
      lg.lineBetween(-4, -2, 0, -6);
      lg.lineBetween(4, -2, 0, -6);
      lg.fillStyle(C_CYAN, 1);
      lg.fillCircle(0, -6, 1.5);
      this.lifeIcons.push(lg);
    }
  }

  // ══════════════════════════════════════════════════════════════
  // BIT — broadcast engineer variant
  // ══════════════════════════════════════════════════════════════

  createBit() {
    const c = this.add.container(1090, 520).setDepth(60);
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
    const mic = this.add.circle(10, 4, 2, 0x78909c);
    const cable = this.add.graphics();
    cable.lineStyle(1, 0x78909c, 0.25);
    for (let i = 0; i < 4; i++) cable.strokeCircle(-18 - i * 3, 12 + i * 4, 3);
    c.add([g, eye, pupil, headset, mic, tip, cable]);
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
    await Promise.race([this.waitForClick(), this.delay(4000)]);
    this.hideBubble();
  }

  createAnnotation(x, y, text, colorHex) {
    const t = this.add.text(x, y, text, { font: "bold 10px Arial", color: colorHex }).setOrigin(0.5).setDepth(70).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 200 });
    this.time.delayedCall(1800, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() }); });
    return t;
  }

  createFloatingText(x, y, text, colorHex, font = "bold 13px Arial", hold = 1400) {
    const t = this.add.text(x, y, text, { font, color: colorHex, wordWrap: { width: 300 }, align: "center" }).setOrigin(0.5).setDepth(31).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 180 });
    this.time.delayedCall(hold, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() }); });
    return t;
  }

  screenShake(intensity = 0.004, duration = 180) {
    this.cameras.main.shake(duration, intensity);
  }

  createConfetti(x, y, count = 30) {
    const p = this.add.particles(x, y, "l37_dot", {
      speed: { min: 80, max: 240 }, angle: { min: 0, max: 360 }, scale: { start: 0.9, end: 0 }, lifespan: 500,
      tint: [C_CYAN, C_GOLD, C_GREEN_BRIGHT, C_VIOLET, 0xffffff], emitting: false,
    }).setDepth(75);
    p.explode(count);
    this.time.delayedCall(900, () => p.destroy());
  }

  // ══════════════════════════════════════════════════════════════
  // EVALUATOR — honest, left-to-right, sticky-String
  // ══════════════════════════════════════════════════════════════

  _tokenizeExpr(expr) {
    const tokens = [];
    let cur = "", inQuotes = false;
    for (let i = 0; i < expr.length; i++) {
      const ch = expr[i];
      if (ch === '"') inQuotes = !inQuotes;
      if (ch === "+" && !inQuotes) { tokens.push(cur.trim()); cur = ""; }
      else cur += ch;
    }
    tokens.push(cur.trim());
    return tokens;
  }

  _evalToken(tok, decls) {
    if (/^".*"$/.test(tok)) return { value: tok.slice(1, -1), type: "string", ok: true };
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

  /** Honest evaluator: tokenize on top-level '+', fold left-to-right with
   * sticky-String semantics. Returns {ok:false} for undefined identifiers
   * or malformed tokens (compile error). */
  evaluatePrintln(argExpr, decls) {
    if (argExpr === null || argExpr === undefined || argExpr.trim() === "") {
      return { ok: true, isEmpty: true, text: "", styleType: "newline" };
    }
    const tokens = this._tokenizeExpr(argExpr);
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
    return { ok: true, isEmpty: false, text: this._displayValue(acc.value, acc.type), styleType: acc.type, tokens, evaluated };
  }

  // ══════════════════════════════════════════════════════════════
  // TRANSMISSION — the reveal, shared by all rounds
  // ══════════════════════════════════════════════════════════════

  /** Runs one println/print call end-to-end: assemble in marquee, launch,
   * land on log (or refuse at the launch bay for a compile error). */
  async fireCall(argExpr, decls, method = "println") {
    const evalResult = this.evaluatePrintln(argExpr, decls);
    if (!evalResult.ok) {
      this.clearMarquee();
      const t = this.add.text(MARQUEE_X + MARQUEE_W / 2, MARQUEE_Y + MARQUEE_H / 2, "?", { font: "bold 22px Courier New", color: HEX_RED }).setOrigin(0.5);
      this.marqueeContainer.add(t);
      this.tweens.add({ targets: this.marqueeContainer, x: 6, duration: 40, yoyo: true, repeat: 4, onComplete: () => { this.marqueeContainer.x = 0; } });
      this.flareBeacon();
      this.showCompileErrorStamp();
      await this.delay(500);
      this.clearMarquee();
      return evalResult;
    }

    if (evalResult.tokens && evalResult.tokens.length > 1) {
      await this.animateConcatenation(evalResult.tokens, evalResult.evaluated);
      await this.delay(200);
      this.clearMarquee();
      await this.assembleArgument(evalResult);
    } else {
      await this.assembleArgument(evalResult);
    }
    this.stopBulbChase();
    if (!this._alive) return evalResult;

    await this.launchAndLand(evalResult, method);
    return evalResult;
  }

  async launchAndLand(evalResult, method) {
    const cx = MARQUEE_X + MARQUEE_W / 2, cy = MARQUEE_Y + MARQUEE_H / 2;
    const color = this._typeColorInt(evalResult.styleType);
    const capsule = this.add.circle(cx, cy, 10, color, 0.9).setDepth(40);
    this.tweens.add({ targets: this.marqueeContainer, scale: 0.4, alpha: 0, duration: 200 });
    await this.delay(200);
    if (!this._alive) return;

    const trail = this.add.rectangle(cx, cy, 4, 0, color, 0.4).setOrigin(0.5, 1).setDepth(39);
    await new Promise((res) => {
      this.tweens.add({
        targets: capsule, x: ANTENNA_TOP_X, y: ANTENNA_TOP_Y, duration: 300, ease: "Cubic.easeIn",
        onUpdate: () => { trail.height = Math.abs(cy - capsule.y) * 0.6; trail.x = capsule.x; trail.y = capsule.y; },
        onComplete: res,
      });
    });
    if (!this._alive) return;
    const logEntryX = LOG_X + 40, logEntryY = LOG_CONTENT_Y0 + 10;
    await new Promise((res) => {
      this.tweens.add({ targets: capsule, x: logEntryX, y: logEntryY, duration: 300, ease: "Cubic.easeOut", onComplete: res });
    });
    this.tweens.add({ targets: trail, alpha: 0, duration: 300, onComplete: () => trail.destroy() });
    if (!this._alive) return;

    this.createConfetti(logEntryX, logEntryY, 10);
    capsule.destroy();
    this.flashLed();

    if (method === "print") {
      this.appendToLastLineNoNewline(evalResult.isEmpty ? "" : evalResult.text, evalResult.styleType);
    } else {
      this.addLogLine(evalResult.isEmpty ? "" : evalResult.text, evalResult.styleType);
      this.showFirstNewlineAnnotation();
    }
    this.marqueeContainer.setScale(1).setAlpha(1);
    await this.delay(150);
  }

  /** print() semantics: writes onto the CURRENT cursor row without
   * advancing to a new line — used only by the Level-38 preview cartridge. */
  appendToLastLineNoNewline(text, styleType) {
    this._writeToLog(text, styleType, false);
  }

  showFirstNewlineAnnotation() {
    if (firstNewlineAnnotationShown) return;
    firstNewlineAnnotationShown = true;
    const t = this.add.text(LOG_X + LOG_W / 2, LOG_Y + LOG_H + 14, "println always adds a newline", { font: "italic 11px Arial", color: HEX_PURPLE }).setOrigin(0.5).setDepth(20).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 200 });
    this.time.delayedCall(1200, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 300, onComplete: () => t.destroy() }); });
  }

  showCompileErrorStamp() {
    const stamp = this.add.text(480, SRC_Y + 40, "COMPILE ERROR", { font: "bold 22px Arial", color: HEX_RED }).setOrigin(0.5).setDepth(80).setScale(1.6).setAngle(-6).setAlpha(0);
    this.sourceContainer.add(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 200 });
    this.screenShake(0.004, 160);
    this.time.delayedCall(1200, () => { if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 220, onComplete: () => stamp.destroy() }); });
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
    await this.delay(400); if (!A()) return;
    await this.bitSay("Welcome to the Output Wing, Broadcaster! Scanner PULLED data IN from outside. Now we push it back OUT — to the world, or at least to the console. Every println is a transmission.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();

    this.updateSourceDisplay(['System.out.println("Hello!");']);
    await this.assembleArgument(this.evaluatePrintln('"Hello!"', null));
    this.stopBulbChase();
    if (!A()) return;
    await this.bitSay("The argument goes into the marquee first. Then... watch the tower.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(3500)]); if (!A()) return;
    this.hideBubble();

    await this.launchAndLand(this.evaluatePrintln('"Hello!"', null), "println");
    if (!A()) return;
    await this.bitSay("Delivered! One transmission, one visible line. But look closely — see that little cursor waiting BELOW the message? println doesn't just write 'Hello!' — it writes 'Hello!' AND an invisible newline. That cursor is the newline, made visible for you.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();

    this.updateSourceDisplay(['System.out.println("Hello!");', 'System.out.println("Line two");']);
    await this.assembleArgument(this.evaluatePrintln('"Line two"', null));
    this.stopBulbChase();
    await this.launchAndLand(this.evaluatePrintln('"Line two"', null), "println");
    if (!A()) return;
    await this.bitSay("That's why two println calls print on two lines — the first call auto-newlined for us. Stacking is automatic. Now for the tricky part...");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();

    await this.clearLog();
    this.updateSourceDisplay(["System.out.println(1 + 1);"]);
    await this.fireCall("1 + 1", null, "println");
    if (!A()) return;
    this.updateSourceDisplay(['System.out.println("1" + "1");']);
    await this.fireCall('"1" + "1"', null, "println");
    if (!A()) return;
    await this.bitSay('The same + behaves differently! With numbers, it\'s addition. With Strings, it\'s concatenation — glue. 1 + 1 becomes 2, but "1" + "1" becomes 11. Watch your quotes!');
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();

    await this.clearLog();
    this.updateSourceDisplay(["System.out.println();"]);
    await this.fireCall("", null, "println");
    if (!A()) return;
    await this.bitSay("println with NO argument is still a valid transmission — it broadcasts an empty line. Perfect for spacing out output! Now: your station's ready. Broadcast well, Engineer!");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();

    try { localStorage.setItem(TUTORIAL_KEY, "true"); } catch (_) {}
    await this.clearLog();
    this.updateSourceDisplay([]);
    this.startRound(0);
  }

  // ══════════════════════════════════════════════════════════════
  // ROUND LIFECYCLE
  // ══════════════════════════════════════════════════════════════

  async startRound(index) {
    this.currentRound = index;
    const config = ROUNDS[index];
    this.roundAttempts = 0;
    this.roundStartTime = this.time.now;
    this.clearRound();
    await this.clearLog();

    if (config.type === "predict") this.setupPredict(config);
    else if (config.type === "command") this.setupCommand(config);
  }

  clearRound() {
    this.roundElements.forEach((e) => { if (e && e.destroy) e.destroy(); });
    this.roundElements = [];
    this.slotContents = {};
    this.slotDefs = {};
    this.cartridges.forEach((c) => c.container.destroy());
    this.cartridges = [];
  }

  showQuestionCard(promptText) {
    const c = this.add.container(640, 490).setDepth(40).setAlpha(0);
    const g = this.add.graphics();
    g.fillStyle(0x0a1128, 0.95);
    g.fillRoundedRect(-260, -40, 520, 80, 10);
    g.lineStyle(1, C_CYAN, 0.5);
    g.strokeRoundedRect(-260, -40, 520, 80, 10);
    const badge = this.add.circle(-230, -10, 16, C_CYAN);
    const badgeT = this.add.text(-230, -10, String(this.currentRound + 1), { font: "bold 14px Arial", color: "#050914" }).setOrigin(0.5);
    const t = this.add.text(-200, -10, promptText, { font: "14px Arial", color: "#e0e0e0", wordWrap: { width: 420 } }).setOrigin(0, 0.5);
    c.add([g, badge, badgeT, t]);
    this.tweens.add({ targets: c, alpha: 1, y: 490, duration: 250 });
    this.roundElements.push(c);
    return c;
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE A — PREDICT
  // ══════════════════════════════════════════════════════════════

  setupPredict(config) {
    this.updateSourceDisplay(config.source);
    this.updateExpressionMonitor(config.source.join("  "));
    const types = config.source.map((s) => this._argTypeOfLine(s, config.decls)).filter(Boolean);
    this.updateCartridgeCache(types);
    this.showQuestionCard(config.question);
    this.showOptionBubbles(config.options, config);
  }

  _argTypeOfLine(line, decls) {
    const m = line.match(/println\(([^)]*)\)/);
    if (!m) return null;
    const evalResult = this.evaluatePrintln(m[1], decls);
    if (!evalResult.ok) return null;
    return evalResult.isEmpty ? "newline" : evalResult.styleType;
  }

  showOptionBubbles(options, config) {
    const shuffled = Phaser.Utils.Array.Shuffle(options.slice());
    const n = shuffled.length;
    const spacing = 280;
    const startX = 640 - ((n - 1) * spacing) / 2;
    shuffled.forEach((opt, i) => {
      const x = startX + i * spacing, y = 590;
      const c = this.add.container(x, y).setDepth(41);
      const g = this.add.graphics();
      const w = 260, h = 50;
      const draw = (stroke) => {
        g.clear();
        g.fillStyle(0x0a1128, 1);
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
        g.lineStyle(2, stroke, 1);
        g.strokeRoundedRect(-w / 2, -h / 2, w, h, 10);
      };
      draw(C_CYAN);
      const label = opt.label || opt.value;
      const txt = this.add.text(0, 0, label, { font: "bold 14px Courier New", color: "#e0e0e0" }).setOrigin(0.5);
      if (txt.width > w - 20) txt.setFontSize(11);
      c.add([g, txt]);
      c.setSize(w, h);
      c.setInteractive({ useHandCursor: true });
      c.on("pointerover", () => { if (!this.inputLocked) draw(C_GOLD); });
      c.on("pointerout", () => { if (!this.inputLocked) draw(C_CYAN); });
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
    this.roundAttempts++;
    const correct = opt.value === config.correct;
    const timeMs = Math.round(this.time.now - this.roundStartTime);
    this.logAttempt(config, correct, opt.value, opt.tag, timeMs);

    this.roundElements.filter((e) => e !== bubbleContainer).forEach((e) => e.disableInteractive && e.disableInteractive());
    const g = bubbleContainer.list[0];
    g.clear();
    g.fillStyle(0x0a1128, 1);
    g.fillRoundedRect(-130, -25, 260, 50, 10);
    g.lineStyle(2, correct ? C_GREEN_BRIGHT : C_RED, 1);
    g.strokeRoundedRect(-130, -25, 260, 50, 10);
    if (!correct) this.tweens.add({ targets: bubbleContainer, x: bubbleContainer.x + 5, duration: 40, yoyo: true, repeat: 4 });

    await this.delay(200);
    if (!this._alive) return;

    for (const line of config.source) {
      if (!this._alive) return;
      const m = line.match(/print(?:ln)?\(([^)]*)\)/);
      if (!m) continue; // declaration lines (e.g. "int score = 42;") aren't transmissions
      const method = line.includes("println") ? "println" : "print";
      this.updateSourceDisplay(config.source);
      await this.fireCall(m[1], config.decls, method);
      await this.delay(200);
    }

    if (config.revealNote) this.createFloatingText(640, LOG_Y + LOG_H + 30, config.revealNote, HEX_GRAY, "11px Arial", 2600);
    await this.delay(500);
    if (!this._alive) return;

    if (correct) {
      this.updateScore(100 * this.getComboMultiplier() + (timeMs < 6000 ? 25 : 0));
      this.updateCombo(true);
      if (this.roundAttempts === 1) this.correctFirstTry++;
      await this.delay(300);
      this.advanceRound();
    } else {
      this.loseLife();
      this.updateCombo(false);
      if (this.lives <= 0) { this.time.delayedCall(400, () => this.gameOver()); return; }
      await this.showBitFeedback(MISCONCEPTION_FEEDBACK[opt.tag] || "Not quite — watch the log and try again.");
      if (!this._alive) return;
      this.clearRound();
      await this.clearLog();
      this.setupPredict(config);
    }
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE D — COMMAND (drag cartridges)
  // ══════════════════════════════════════════════════════════════

  setupCommand(config) {
    this.updateSourceDisplay(config.sourceTemplate.map((l) => l.replace(/<slot:\w+>/g, "____")));
    this.renderCommandSlots(config);
    this.showQuestionCard(config.mission);
    this.createCartridgeTray(config);
    this._commandFirstFail = true;
  }

  renderCommandSlots(config) {
    this.slotDefs = {};
    config.slots.forEach((s, i) => {
      this.slotDefs[s.id] = { id: s.id, capacity: 1, lineIndex: this._findSlotLine(config, s.id), rect: null };
    });
    this.updateExpressionMonitor(config.mission);
  }

  _findSlotLine(config, slotId) {
    return config.sourceTemplate.findIndex((l) => l.includes(`<slot:${slotId}>`));
  }

  createCartridgeTray(config) {
    const shuffled = Phaser.Utils.Array.Shuffle(config.cartridges.slice());
    const rowY = [580, 618];
    let x = 60, row = 0;
    const maxX = 1220;

    shuffled.forEach((def) => {
      const style = { font: "bold 12px Courier New", color: HEX_CYAN };
      const measure = this.add.text(0, 0, def.code, style);
      const w = measure.width + 20;
      measure.destroy();
      if (x + w > maxX) { row = Math.min(row + 1, 1); x = 60; }
      const home = { x: x + w / 2, y: rowY[row] };
      x += w + 10;

      const c = this.add.container(home.x, home.y).setDepth(42);
      const bg = this.add.graphics();
      const draw = (stroke) => {
        bg.clear();
        bg.fillStyle(0x1e1e3a, 1);
        bg.fillRoundedRect(-w / 2, -14, w, 28, 7);
        bg.lineStyle(2, stroke, 1);
        bg.strokeRoundedRect(-w / 2, -14, w, 28, 7);
      };
      draw(C_CYAN);
      const txt = this.add.text(0, 0, def.code, style).setOrigin(0.5);
      c.add([bg, txt]);
      c.setSize(w, 28);
      c.setData("w", w);
      c.setData("code", def.code);
      c.setData("tag", def.tag || null);
      c.setData("targetSlot", def.slotId);
      c.setData("home", home);
      c.setData("draw", draw);
      c.setData("placedIn", null);
      c.setInteractive({ useHandCursor: true, draggable: true });
      c.on("pointerover", () => { if (!this.inputLocked) draw(C_GOLD); });
      c.on("pointerout", () => { if (!this.inputLocked) draw(C_CYAN); });
      this.cartridges.push({ container: c, def, home });
      this.roundElements.push(c);
    });

    const btn = this.add.container(640, 660).setDepth(42);
    const bg = this.add.graphics();
    const bdraw = (enabled, hover) => {
      bg.clear();
      bg.fillStyle(enabled ? C_GREEN_BRIGHT : 0x2a2f36, hover && enabled ? 1 : 0.95);
      bg.fillRoundedRect(-75, -22, 150, 44, 10);
    };
    bdraw(false, false);
    const bt = this.add.text(0, 0, "BROADCAST", { font: "bold 14px Arial", color: "#050914" }).setOrigin(0.5);
    btn.add([bg, bt]);
    btn.setSize(150, 44);
    btn.on("pointerover", () => { if (this._broadcastReady) { bdraw(true, true); btn.setScale(1.03); } });
    btn.on("pointerout", () => { bdraw(this._broadcastReady, false); btn.setScale(1); });
    btn.on("pointerdown", () => { if (this._broadcastReady) this.onBroadcastPressed(config); });
    this.broadcastButton = { c: btn, draw: bdraw };
    this.roundElements.push(btn);
    this.disableBroadcastButton();

    this.updateSourceDisplay(config.sourceTemplate);
  }

  enableBroadcastButton() { this._broadcastReady = true; this.broadcastButton.draw(true, false); this.broadcastButton.c.setInteractive({ useHandCursor: true }); }
  disableBroadcastButton() { this._broadcastReady = false; this.broadcastButton.draw(false, false); this.broadcastButton.c.disableInteractive(); }

  setupDragEvents() {
    this.input.on("dragstart", (pointer, obj) => {
      if (!this.cartridges.find((b) => b.container === obj) || this.inputLocked) return;
      obj.setDepth(90);
      this.tweens.add({ targets: obj, scale: 1.1, duration: 100 });
      const prevSlot = obj.getData("placedIn");
      if (prevSlot) {
        this.slotContents[prevSlot] = (this.slotContents[prevSlot] || []).filter((b) => b.container !== obj);
        obj.setData("placedIn", null);
        this.updateSlotVisual(prevSlot);
        this.updateBroadcastButtonState();
      }
    });
    this.input.on("drag", (pointer, obj, dragX, dragY) => {
      if (!this.cartridges.find((b) => b.container === obj) || this.inputLocked) return;
      obj.x = dragX; obj.y = dragY;
      this._updateSlotHover(obj);
    });
    this.input.on("dragend", (pointer, obj) => {
      if (!this.cartridges.find((b) => b.container === obj) || this.inputLocked) return;
      this._finishCartridgeDrag(obj);
    });
  }

  _slotDropZone(slotId) {
    const config = ROUNDS[this.currentRound];
    const def = this.slotDefs[slotId];
    const totalLines = config.sourceTemplate.length;
    const y = SRC_Y + def.lineIndex * 19 - ((totalLines - 1) * 19) / 2;
    return { x: 480 - 60, y: y - 12, w: 120, h: 24 };
  }

  updateSlotVisual(slotId) {
    // Slots are represented purely by the source display text + drop
    // zone; no persistent placeholder graphic is drawn (kept intentionally
    // simple — the cartridge itself, once placed, IS the visual).
  }

  _nearestOpenSlot(obj, x, y) {
    let best = null, bestDist = 70;
    const targetSlot = obj.getData("targetSlot");
    for (const id in this.slotDefs) {
      if (targetSlot && id !== targetSlot) continue;
      const placed = this.slotContents[id] || [];
      if (placed.length >= 1) continue;
      const zone = this._slotDropZone(id);
      const cx = zone.x + zone.w / 2, cy = zone.y + zone.h / 2;
      const dist = Phaser.Math.Distance.Between(x, y, cx, cy);
      const within = x >= zone.x - 40 && x <= zone.x + zone.w + 40 && y >= zone.y - 30 && y <= zone.y + zone.h + 30;
      if (within && dist < bestDist) { bestDist = dist; best = id; }
    }
    return best;
  }

  _updateSlotHover(obj) {
    const key = this._nearestOpenSlot(obj, obj.x, obj.y);
    if (key) {
      const zone = this._slotDropZone(key);
      const cx = zone.x + zone.w / 2, cy = zone.y + zone.h / 2;
      obj.x = Phaser.Math.Linear(obj.x, cx, 0.25);
      obj.y = Phaser.Math.Linear(obj.y, cy, 0.25);
    }
  }

  _finishCartridgeDrag(obj) {
    obj.setDepth(42);
    this.tweens.add({ targets: obj, scale: 1, duration: 100 });
    const key = this._nearestOpenSlot(obj, obj.x, obj.y);
    if (key) {
      if (!this.slotContents[key]) this.slotContents[key] = [];
      this.slotContents[key].push({ container: obj });
      obj.setData("placedIn", key);
      const zone = this._slotDropZone(key);
      this.tweens.add({ targets: obj, x: zone.x + zone.w / 2, y: zone.y + zone.h / 2, duration: 150, ease: "Cubic.easeOut" });
      this.updateBroadcastButtonState();
    } else {
      const home = obj.getData("home");
      this.tweens.add({ targets: obj, x: home.x, y: home.y, duration: 250, ease: "Back.easeOut" });
    }
  }

  updateBroadcastButtonState() {
    const allFilled = Object.keys(this.slotDefs).every((id) => (this.slotContents[id] || []).length > 0);
    if (allFilled) this.enableBroadcastButton(); else this.disableBroadcastButton();
  }

  async onBroadcastPressed(config) {
    this.inputLocked = true;
    this.disableBroadcastButton();
    this.roundAttempts++;
    const timeMs = Math.round(this.time.now - this.roundStartTime);

    const placed = {};
    for (const id in this.slotDefs) {
      placed[id] = this.slotContents[id][0].container;
    }

    const allCorrect = config.slots.every((s) => {
      const code = placed[s.id].getData("code");
      const def = config.cartridges.find((c) => c.slotId === s.id && c.code === code);
      return def && (def.correct || def.alsoCorrect);
    });

    await this.clearLog();
    this.updateSourceDisplay(config.sourceTemplate.map((line, i) => {
      const slotId = config.slots.find((s) => this._findSlotLine(config, s.id) === i)?.id;
      if (!slotId) return line;
      return line.replace(`<slot:${slotId}>`, placed[slotId].getData("code"));
    }));

    let anyCompileError = false;
    for (const s of config.slots) {
      if (!this._alive) return;
      const code = placed[s.id].getData("code");
      let argExpr, method;
      const callMatch = code.match(/print(?:ln)?\(([^)]*)\)/);
      if (callMatch) {
        method = code.includes("println") ? "println" : "print";
        argExpr = callMatch[1];
      } else {
        method = "println";
        argExpr = code;
      }
      const result = await this.fireCall(argExpr, config.decls, method);
      if (!result.ok) anyCompileError = true;
      await this.delay(150);
    }

    if (config.revealNote) this.createFloatingText(640, LOG_Y + LOG_H + 30, config.revealNote, HEX_GRAY, "11px Arial", 3000);
    await this.delay(500);
    if (!this._alive) return;

    const logText = this.logLines.map((l) => l.text).join("⏎");
    const success = allCorrect && !anyCompileError && logText === config.expectedLog;
    const firstWrongTag = config.slots.map((s) => {
      const code = placed[s.id].getData("code");
      const def = config.cartridges.find((c) => c.slotId === s.id && c.code === code);
      return def && !def.correct && !def.alsoCorrect ? def.tag : null;
    }).find(Boolean);

    this.logAttempt(config, success, config.slots.map((s) => placed[s.id].getData("code")).join(" | "), firstWrongTag, timeMs);

    if (success) {
      this.updateScore(100 * this.getComboMultiplier() + (timeMs < 6000 ? 25 : 0));
      this.updateCombo(true);
      if (this.roundAttempts === 1) this.correctFirstTry++;
      await this.delay(300);
      this.advanceRound();
    } else {
      const exploratory = this._commandFirstFail;
      this._commandFirstFail = false;
      if (!exploratory) {
        this.loseLife();
        if (this.lives <= 0) { this.time.delayedCall(400, () => this.gameOver()); return; }
      }
      this.updateCombo(false);
      await this.showBitFeedback(MISCONCEPTION_FEEDBACK[firstWrongTag] || "That combination doesn't broadcast what the mission needs — check the log and try another cartridge.");
      if (!this._alive) return;
      this.inputLocked = false;
      await this.clearLog();
      this.updateSourceDisplay(config.sourceTemplate.map((l) => l.replace(/<slot:\w+>/g, "____")));
      this.cartridges.forEach((cart) => {
        cart.container.setData("placedIn", null);
        const home = cart.container.getData("home");
        this.tweens.add({ targets: cart.container, x: home.x, y: home.y, duration: 200 });
      });
      this.slotContents = {};
      this.disableBroadcastButton();
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
    if (mult > 1) this.tweens.add({ targets: this.comboText, scale: 1.3, duration: 150, yoyo: true });
  }

  loseLife() {
    this.lives = Math.max(0, this.lives - 1);
    const icon = this.lifeIcons[this.lives];
    if (icon) this.tweens.add({ targets: icon, alpha: 0.12, duration: 400 });
    return this.lives <= 0;
  }

  logAttempt(config, correct, selectedAnswer, misconceptionTag, timeMs) {
    this.attemptLog.push({
      round: config.round, type: config.type, concept: config.concept,
      correct, selectedAnswer, misconceptionTag: misconceptionTag || null,
      timeMs, attemptNumber: this.roundAttempts,
    });
  }

  advanceRound() {
    this.clearRound();
    const next = this.currentRound + 1;
    if (next >= ROUNDS.length) this.levelComplete();
    else this.startRound(next);
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

    (async () => {
      this.flareBeacon();
      await this.delay(400);
      this.tweens.killTweensOf(this.beacon);
      this.tweens.add({ targets: this.beacon, alpha: 0, duration: 500 });
      this.logRowObjs.forEach((r) => { r.textT.setColor("#3d4450"); });
      this.tweens.add({ targets: this.moon, alpha: 0.02, duration: 500 });
      this.ambient.forEach((p) => this.tweens.add({ targets: p, y: 700, duration: 800 }));

      const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
      this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });
      const title = this.add.text(640, 240, "SIGNAL LOST", { font: "bold 40px Arial", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
      this.tweens.add({ targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut", onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }) });
      this.add.text(640, 310, `Score: ${this.score}`, { font: "20px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
      this.add.text(640, 350, `Rounds Completed: ${this.currentRound} / 12`, { font: "16px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);
      this._makeButton(640, 420, "RESTORE POWER", 210, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
    })();
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearRound();
    this.hideBubble();

    try { GameManager.completeLevel(36, Math.round((this.correctFirstTry / 12) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("println_schema"); } catch (_) {}
    try {
      localStorage.setItem("level37_results", JSON.stringify({
        level: 37, concept: "output_println", phase: "accretion",
        score: this.score, accuracy: this.correctFirstTry / 12, avgTime: 0,
        comboMax: this.maxCombo, stars: this._starRating(), livesRemaining: this.lives,
        attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.broadcastFinale().then(() => { if (this._alive) this.showScoreTally(); });
  }

  async broadcastFinale() {
    this.tweens.killTweensOf(this.beacon);
    this.beacon.setFillStyle(C_GREEN_BRIGHT, 1);
    this.tweens.add({ targets: this.moon, alpha: 0.18, duration: 600, yoyo: true });
    await this.clearLog();
    const words = ["WELL", "BROADCAST!"];
    for (const w of words) {
      if (!this._alive) return;
      await this.fireCall(`"${w}"`, null, "println");
      await this.delay(200);
    }
    this.ambient.forEach((p) => this.tweens.add({ targets: p, y: p.y - 200, alpha: 0, duration: 800, onComplete: () => { p.y = Phaser.Math.Between(400, 700); p.alpha = Phaser.Math.FloatBetween(0.03, 0.08); } }));
    this.createConfetti(LOG_X + LOG_W / 2, LOG_Y + LOG_H / 2, 36);
    await this.delay(600);
  }

  _starRating() {
    const acc = this.correctFirstTry / 12;
    if (acc >= 0.9) return 3;
    if (acc >= 0.7) return 2;
    return 1;
  }

  showScoreTally() {
    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
    this.tweens.add({ targets: ov, fillAlpha: 0.85, duration: 500 });

    const panel = this.add.graphics().setDepth(90);
    panel.fillStyle(0x0a1830, 1);
    panel.fillRoundedRect(360, 100, 560, 420, 16);
    panel.lineStyle(2, C_CYAN, 1);
    panel.strokeRoundedRect(360, 100, 560, 420, 16);

    const title = this.add.text(640, 140, "SIGNAL RECEIVED", { font: "bold 34px Arial", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(91).setScale(0);
    this.tweens.add({ targets: title, scale: 1, duration: 350, ease: "Back.easeOut" });

    const acc = Math.round((this.correctFirstTry / 12) * 100);
    const lines = [`ACCURACY: ${acc}%`, `BEST COMBO: ×${this.getComboMultiplierFor(this.maxCombo)}`];
    lines.forEach((s, i) => {
      const t = this.add.text(500, 195 + i * 28, s, { font: "14px Arial", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 250, delay: 300 + i * 150 });
    });
    const totalText = this.add.text(500, 195 + 2 * 28, "TOTAL: 0", { font: "bold 24px Arial", color: HEX_GOLD }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: totalText, alpha: 1, duration: 250, delay: 700 });
    const counter = { v: 0 };
    this.tweens.add({ targets: counter, v: this.score, duration: 1000, delay: 700, onUpdate: () => totalText.setText(`TOTAL: ${Math.round(counter.v)}`) });

    const stars = this._starRating();
    for (let i = 0; i < 3; i++) {
      const earned = i < stars;
      const s = this.add.text(640 + (i - 1) * 60, 320, "★", { font: "40px Arial", color: earned ? HEX_GOLD : "#2a3040" }).setOrigin(0.5).setDepth(91).setScale(0);
      this.tweens.add({ targets: s, scale: 1, duration: 250, delay: 1300 + i * 200, ease: earned ? "Back.easeOut" : "Cubic.easeOut" });
    }

    const badge = this.add.container(640, 405).setDepth(91).setAlpha(0);
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillCircle(0, 0, 30);
    bg.lineStyle(3, C_GOLD, 1);
    bg.strokeCircle(0, 0, 30);
    bg.lineStyle(1.5, C_CYAN, 1);
    bg.lineBetween(-8, 10, -8, -10);
    bg.lineBetween(8, 10, 8, -10);
    bg.lineBetween(-8, -10, 0, -16);
    bg.lineBetween(8, -10, 0, -16);
    bg.strokeCircle(0, -2, 4);
    badge.add(bg);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 1900 });
    const badgeLbl = this.add.text(640, 445, "println() SCHEMA ACQUIRED", { font: "bold 13px Arial", color: HEX_GOLD }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: badgeLbl, alpha: 1, duration: 300, delay: 2050 });

    this._makeButton(500, 480, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(760, 480, "NEXT: The Signal Room →", 260, 44, { fill: 0x00733a, stroke: C_GREEN_BRIGHT, textColor: "#ffffff" }, () => {
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
