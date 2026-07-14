/**
 * Level 35 — "The Night Shift" (Scanner Methods: Tuning Phase)
 * ===========================================================================
 * Tunes the Level 34 Scanner schema under time pressure. The Intake Port's
 * iris shutter IS the visual timer — it closes linearly over the round's
 * time limit; answer before it seals or the delivery is refused. Fifteen
 * rounds across three waves push the learner from single-call reasoning to
 * BUFFER-STATE reasoning: what does the SECOND call return? What is left on
 * the tape between calls?
 *
 * Wave 3's rounds 11-13 are the level's set piece: the classic nextInt() +
 * nextLine() "skip bug" — planted as an unexplained seed in Level 34's
 * tutorial ("remember this moment") — is now paid off. A genuine sequential
 * tokenizer (runSequence/evaluateCall, ported from Level 34) drives both
 * grading and the reveal animation, so the empty-string result in round 11
 * and the leading-space result in round 13 are COMPUTED, never scripted.
 */

import Phaser from "phaser";
import { GameManager } from "../../../GameManager.js";
import { BadgeSystem } from "../../../BadgeSystem.js";

const W = 1280, H = 720;

const C_GREEN = 0x4caf50, C_GREEN_BRIGHT = 0x00e676, C_GOLD = 0xffd740;
const C_CYAN = 0x00e5ff, C_RED = 0xf44336, C_GRAY = 0x78909c;
const C_INT = 0x1565c0, C_DOUBLE = 0xe65100, C_LINE = 0x2e7d32;
const C_NEWLINE = 0x7b1fa2, C_WALL_STROKE = 0x1c2e1c, C_PURPLE = 0x8c7ae6;
const HEX_GREEN = "#4caf50", HEX_GOLD = "#ffd740", HEX_CYAN = "#00e5ff";
const HEX_RED = "#f44336", HEX_GRAY = "#78909c", HEX_GREEN_BRIGHT = "#00e676";
const HEX_INT = "#1565c0", HEX_DOUBLE = "#e65100", HEX_LINE = "#2e7d32";
const HEX_SPACE = "#c2185b", HEX_NEWLINE = "#7b1fa2", HEX_PURPLE = "#8c7ae6";
const HEX_MAGENTA = "#ff4081";

const TAPE_X0 = 90, TAPE_X1 = 555, TAPE_Y = 260;
const MACHINE_X = 640, MACHINE_Y = 310, MACHINE_W = 240, MACHINE_H = 190;
const CONTAINER_X = 1090, CONTAINER_W = 150, CONTAINER_H = 54;
const CONTAINER_Y = { int: 236, double: 306, string: 376 };
const NOZZLE_Y = { int: 260, double: 310, line: 358 };
const PORT_X = 35, PORT_Y = 260;
const MANIFEST_X = 640, MANIFEST_Y = 138;
const TUTORIAL_KEY = "level35_tutorial_done";
const WAVE_TIME = { 1: 12000, 2: 10000, 3: 9000 };

// ══════════════════════════════════════════════════════════════
// ROUND CONFIGURATION
// ══════════════════════════════════════════════════════════════
const ROUNDS = [
  { round: 1, wave: 1, type: "reads", inputLines: ["5 9"],
    snippet: ["int a = sc.nextInt();", "int b = sc.nextInt();"],
    question: "What lands in b?", correct: "9",
    options: [
      { value: "9", tag: null },
      { value: "5", tag: "second_read_rereads_belief" },
      { value: "59", tag: "tokens_concatenated_belief" },
      { value: "Error", tag: "one_number_per_line_belief" },
    ],
    revealNote: "Statement 1 consumes '5'; the ␣ flutter-skips on statement 2; '9' dispenses into b. Two tokens, one line — perfectly legal.",
    concept: "sequential_tokens" },

  { round: 2, wave: 1, type: "reads", inputLines: ["7.25"],
    snippet: ["double d = sc.nextDouble();"],
    question: "What lands in d?", correct: "7.25",
    options: [
      { value: "7.25", tag: null },
      { value: "7", tag: "decimal_truncation_belief" },
      { value: "7.3", tag: "rounding_belief" },
      { value: "Error", tag: "mismatch_overapplied" },
    ], concept: "fluent_double" },

  { round: 3, wave: 1, type: "reads", inputLines: ["12 kg"],
    snippet: ["int w = sc.nextInt();"],
    question: "What lands in w?", correct: "12",
    options: [
      { value: "12", tag: null },
      { value: "Error", tag: "trailing_word_crash_belief" },
      { value: '"12 kg"', tag: "int_reads_whole_line_belief" },
      { value: "0", tag: "mismatch_returns_zero_belief" },
    ],
    revealNote: "nextInt() takes its token and STOPS — '␣kg⏎' stays on the tape, glowing softly in the buffer-beat. The nozzle never even looked at it.",
    concept: "token_stops_at_boundary" },

  { round: 4, wave: 1, type: "reads", inputLines: ["3 4"],
    snippet: ["int a = sc.nextInt();", "int b = sc.nextInt();", "print(a + b);"],
    question: "What prints?", correct: "7",
    options: [
      { value: "7", tag: null },
      { value: "34", tag: "tokens_concatenated_belief" },
      { value: "3", tag: "second_read_rereads_belief" },
      { value: "Error", tag: "mismatch_overapplied" },
    ],
    revealNote: "Real ints do real math — the ticker-style print shows 3 + 4 resolving to 7 above the containers.",
    concept: "reads_feed_arithmetic" },

  { round: 5, wave: 1, type: "reads", inputLines: ["10"],
    snippet: ["double d = sc.nextDouble();", "print(d);"],
    question: "What prints?", correct: "10.0",
    options: [
      { value: "10.0", tag: null },
      { value: "10", tag: "widening_unaware" },
      { value: "Error", tag: "double_needs_decimal_belief" },
      { value: "1.0", tag: "casting_confusion" },
    ], concept: "widening_fluent" },

  { round: 6, wave: 2, type: "judge", inputLines: ["8"],
    snippet: ["int n = sc.nextInt();"],
    correct: "safe", resultValue: "8", wrongTag: "declaration_doubt", concept: "clean_read" },

  { round: 7, wave: 2, type: "judge", inputLines: ["eight"],
    snippet: ["int n = sc.nextInt();"],
    correct: "crash", crashType: "runtime",
    explanation: "Words never fit the INT nozzle — InputMismatchException, and 'eight' still sits on the tape.",
    wrongTag: "type_mismatch_int_from_word", concept: "word_crash_fluent" },

  { round: 8, wave: 2, type: "judge", inputLines: ["5.0"],
    snippet: ["int n = sc.nextInt();"],
    correct: "crash", crashType: "runtime",
    explanation: "Even 5.0! The moment a decimal point appears, the token is a double — nextInt() rejects it, no matter how round the number looks.",
    wrongTag: "type_mismatch_int_from_decimal", concept: "innocent_decimal_trap" },

  { round: 9, wave: 2, type: "judge", inputLines: ["5"],
    snippet: ["String s = sc.nextInt();"],
    correct: "crash", crashType: "compile",
    explanation: "nextInt() returns an int — an int can never live in a String variable. Refused before the program breathes.",
    wrongTag: "int_into_string_belief", concept: "type_container_discipline" },

  { round: 10, wave: 2, type: "judge", inputLines: [""],
    snippet: ["String s = sc.nextLine();"],
    correct: "safe", resultValue: '""',
    explanation: 'An empty line is still a line! nextLine() returns "" — graceful, no crash.',
    wrongTag: "empty_line_error_belief",
    revealNote: "The tape arrives carrying only a lonely ⏎; the LINE nozzle consumes it and dispenses an empty String bar. Three temperaments, one dock: the claw crashes on emptiness, the press shrugs, and the Scanner hands it to you politely.",
    concept: "empty_line_safe" },

  { round: 11, wave: 3, type: "leftover", inputLines: ["25", "Anjana"],
    snippet: ["int age = sc.nextInt();", "String name = sc.nextLine();"],
    question: "What lands in name?", correct: '""',
    options: [
      { value: '""', tag: null, label: '"" (empty)' },
      { value: '"Anjana"', tag: "skip_bug_unaware" },
      { value: '"25"', tag: "buffer_confusion" },
      { value: "Error", tag: "mismatch_overapplied" },
    ],
    revealNote: "THE PAYOFF. nextInt() took the number and left the ⏎ on the tape. nextLine() lunged for the nearest ⏎ — and devoured it INSTANTLY. Empty. Every Java beginner meets this bug. You just saw it happen.",
    concept: "skip_bug_reveal" },

  { round: 12, wave: 3, type: "leftover", inputLines: ["25", "Anjana"],
    snippet: ["int age = sc.nextInt();", "sc.nextLine();", "String name = sc.nextLine();"],
    question: "What lands in name?", correct: '"Anjana"',
    options: [
      { value: '"Anjana"', tag: null },
      { value: '""', tag: "fix_misunderstood" },
      { value: '"25"', tag: "buffer_confusion" },
      { value: "Error", tag: "extra_call_crash_belief" },
    ],
    revealNote: "The canonical fix: a bare, unassigned sc.nextLine() sacrifices itself to the leftover ⏎. The SECOND nextLine() then receives 'Anjana' whole — the janitor call sweeps the tape so the real read gets the real line.",
    concept: "skip_bug_fix" },

  { round: 13, wave: 3, type: "leftover", inputLines: ["7 up"],
    snippet: ["int n = sc.nextInt();", "String rest = sc.nextLine();"],
    question: "What lands in rest?", correct: '" up"',
    options: [
      { value: '" up"', tag: null, label: '"␣up" (space + up)' },
      { value: '"up"', tag: "leftover_space_stripped_belief" },
      { value: '""', tag: "fix_misunderstood" },
      { value: '"7 up"', tag: "buffer_confusion" },
    ],
    revealNote: "The subtle cousin: nextInt() takes '7' and stops. nextLine() takes THE REST OF THE LINE — leading ␣ included — up to the ⏎. Spaces and all, exactly as they lie.",
    concept: "rest_of_line_with_space" },

  { round: 14, wave: 3, type: "bughunt", inputLines: ["9"],
    manifestLines: ["Scanner sc = new Scanner(System.in);", "int n = sc.nextint();"],
    faultLine: 2, faultToken: "nextint", fixedToken: "nextInt",
    explanation: "The casing curse crosses wings! Java only knows nextInt — capital I. One lowercase letter, zero compilation.",
    wrongTag: "method_name_case_insensitive_belief", concept: "method_name_bug_scanner" },

  { round: 15, wave: 3, type: "bughunt", inputLines: ["9"],
    manifestLines: ["double price = sc.nextDouble();", "int qty = sc.nextDouble();"],
    faultLine: 2, faultToken: "sc.nextDouble();", fixedToken: "sc.nextInt();",
    explanation: "Line two smuggles a double into an int variable — the compiler refuses. Quantities are whole: nextInt() for int containers.",
    wrongTag: "narrowing_assignment_error", concept: "narrowing_bug_scanner" },
];

const MISCONCEPTION_FEEDBACK = {
  type_mismatch_int_from_decimal: "The INT nozzle saw that decimal point and slammed shut! Even 5.0 — a decimal token can never be an int.",
  type_mismatch_int_from_word: "Letters into the INT nozzle? Instant rejection — InputMismatchException, and the word still sits on the tape.",
  mismatch_returns_zero_belief: "Scanner never apologizes with a zero — a mismatch CRASHES the program. Loud failures, not quiet lies.",
  decimal_truncation_belief: "Scanner doesn't trim or round — it either casts the token cleanly or throws the exception. No halfway.",
  rounding_belief: "Scanner doesn't trim or round — it either casts the token cleanly or throws the exception. No halfway.",
  widening_unaware: "It became 10.0! Small fits inside big: an int token through nextDouble(), or into a double variable, widens safely.",
  narrowing_assignment_error: "Big into small is forbidden — a double can't squeeze into an int variable. Java refuses before the program even runs.",
  line_reads_one_word_belief: "nextLine() is the greedy nozzle — it swallows the WHOLE line, first letter to the ⏎. Every word, every space.",
  mismatch_overapplied: "That token is perfectly valid — no mismatch here! Save 'Error' for a token that truly can't cast.",
  trailing_word_crash_belief: "No crash — nextInt() never even glanced at what follows. It reads its token and stops; the rest just waits on the tape.",
  int_reads_whole_line_belief: "nextInt() stops at the first whitespace — it never reads a whole line. That's nextLine()'s job.",
  one_number_per_line_belief: "One line can hold many tokens — nextInt() just needs whitespace between them, not a new line each time.",
  tokens_concatenated_belief: "Two calls, two tokens, two ints — Scanner never glues numbers together. The ␣ between them is a fence, not a bridge.",
  second_read_rereads_belief: "The tape only moves FORWARD. Once a token is consumed, it's gone — the next call meets the NEXT token, never the old one.",
  declaration_doubt: "Look again — the types match perfectly here. This one compiles and runs just fine!",
  int_into_string_belief: "Containers are strict: an int can never live in a String variable. Refused before the program even runs.",
  empty_line_error_belief: "An empty line is a valid line. nextLine() hands you \"\" and moves on — the politest method on the dock.",
  skip_bug_unaware: "The leftover ⏎! nextInt() took the number and abandoned the Enter key on the tape — and nextLine() always eats the nearest ⏎ first. The name never had a chance.",
  buffer_confusion: "Trace the tape cell by cell — each read consumes from the FRONT of whatever remains, never from further back.",
  fix_misunderstood: "Count the reads on the tape: the first nextLine() cleared the leftover ⏎, so the SECOND one received the real line. The janitor call changes everything.",
  extra_call_crash_belief: "A bare sc.nextLine(); doesn't crash anything — it just reads a line and quietly discards it. Perfectly legal, no assignment required.",
  leftover_space_stripped_belief: "Watch the magenta ␣ ride into the String — nextLine() keeps every character it finds, leading spaces included. No trimming, ever.",
  method_name_case_insensitive_belief: "Java method names are case-sensitive — nextint and nextInt are two different identifiers. Only one of them exists.",
  timeout: "The iris sealed! On the night shift, the tape tells you the answer before you finish reading the question. Trust it and commit.",
};

export class Level35Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level35Scene" });
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
    this.waveElements = [];
    this.roundStartTime = 0;
    this.roundTimeLimit = 12000;
    this.tapeState = [];
    this.inputLocked = true;
    this.gameEnded = false;
    this._alive = true;
    this._bubble = null;
    this._irisProgress = 0;
    this._irisTween = null;
    this._urgencyState = "safe";
    this._noteLeak = false;
    this._waveSquares = [];
  }

  preload() {}

  create() {
    this._alive = true;
    this.events.once("shutdown", () => { this._alive = false; this._killIrisTween(); });

    const cam = this.cameras.main;
    const zoom = Math.min(this.scale.width / W, this.scale.height / H);
    cam.setZoom(zoom);
    cam.centerOn(W / 2, H / 2);
    cam.setBackgroundColor("#060b06");

    try { GameManager.incrementAttempt(34); } catch (_) {}

    this.createParticleTexture();
    this.createBackground();
    this.createOutsideWall();
    this.createIntakePort();
    this.createIrisTimerRing();
    this.createDockHall();
    this.createNightDressing();
    this.createDockSign();
    this.createParticles();
    this.createTapeRail();
    this.createScannerMachine();
    this.createContainers();
    this.createSourcePlate();
    this.createManifest();
    this.createHUD();
    this.createBit();

    cam.fadeIn(700, 3, 3, 5);
    this.checkTutorial();
  }

  update(time, delta) {
    this.updateParticles(time, delta);
    this.updateSignSway(time);
    this.updateShiftClock(time);
    this.updateLampFlicker(time);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // BACKGROUND (adapted from Level 34, darker night palette)
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l35_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l35_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x060b06).setDepth(0);
  }

  createOutsideWall() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x0c150c, 1);
    g.fillRect(0, 64, 70, H - 64);
    g.lineStyle(2, C_WALL_STROKE, 1);
    g.lineBetween(70, 64, 70, H);
    for (let i = 0; i < 3; i++) {
      const y = 140 + i * 180;
      g.fillStyle(0x1c2e1c, 0.5);
      g.fillCircle(20, y, 3);
      g.fillCircle(50, y, 3);
    }
  }

  createIntakePort() {
    const c = this.add.container(PORT_X, PORT_Y).setDepth(2);
    const outer = this.add.circle(0, 0, 46, 0x050a05);
    const ring = this.add.graphics();
    ring.lineStyle(3, C_GREEN, 1);
    ring.strokeCircle(0, 0, 46);
    const wedges = this.add.graphics();
    this._drawIrisWedges(wedges, 1);
    const plate = this.add.text(0, -62, "FROM OUTSIDE", { font: "bold 9px Arial", color: HEX_GREEN }).setOrigin(0.5);
    c.add([outer, ring, wedges, plate]);
    this.portRing = ring;
    this.port = { c, wedges, outer };
  }

  _drawIrisWedges(g, openness) {
    g.clear();
    g.lineStyle(2, C_WALL_STROKE, 1);
    const spread = openness * 36;
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i;
      const r0 = 4 + spread;
      const r1 = 40;
      g.lineBetween(Math.cos(a) * r0, Math.sin(a) * r0, Math.cos(a) * r1, Math.sin(a) * r1);
    }
  }

  createIrisTimerRing() {
    this.timerRingGfx = this.add.graphics().setDepth(3);
    this.updateTimerRing(1);
  }

  updateTimerRing(progress) {
    this.timerRingGfx.clear();
    const color = progress > 0.33 ? C_GREEN_BRIGHT : progress > 0.15 ? C_GOLD : C_RED;
    this.timerRingGfx.lineStyle(4, color, 1);
    const start = -Math.PI / 2;
    const end = start + Math.PI * 2 * progress;
    this.timerRingGfx.beginPath();
    this.timerRingGfx.arc(PORT_X, PORT_Y, 56, start, end, false);
    this.timerRingGfx.strokePath();
  }

  createDockHall() {
    const g = this.add.graphics().setDepth(1);
    for (let row = 0; row < 2; row++) {
      const y = 40 + row * 50;
      g.lineStyle(1, C_WALL_STROKE, 0.05);
      g.lineBetween(100, y, 1180, y);
      for (let i = 0; i < 6; i++) g.strokeRect(150 + i * 170, y - 18, 24, 18);
    }
    g.lineStyle(1, C_WALL_STROKE, 0.05);
    g.strokeRect(1180, 250, 90, 310);
    g.fillStyle(0x0a0f0a, 1);
    g.fillRect(0, 620, W, 100);
    const dash = this.add.graphics().setDepth(1);
    dash.lineStyle(2, C_GOLD, 0.04);
    for (let x = 0; x < W; x += 24) dash.lineBetween(x, 680, x + 12, 680);
  }

  createNightDressing() {
    const beam = this.add.rectangle(1000, 200, 500, 700, 0xb3e5fc, 0.015).setDepth(1).setAngle(25);
    this.moonBeam = beam;

    this.lamps = [];
    [300, 520].forEach((x, i) => {
      const cone = this.add.triangle(x, 210, -40, 0, 40, 0, 0, 90, C_GOLD, 0.02).setDepth(1);
      this.lamps.push({ cone, flickerAt: 7000 + i * 1500, lastFlicker: 0 });
    });

    const clock = this.add.container(900, 110).setDepth(2);
    const ring = this.add.graphics();
    ring.lineStyle(2, C_WALL_STROKE, 0.4);
    ring.strokeCircle(0, 0, 22);
    this.clockMinuteHand = this.add.graphics();
    this.clockHourHand = this.add.graphics();
    const label = this.add.text(0, 36, "NIGHT SHIFT", { font: "bold 9px Arial", color: HEX_GREEN }).setOrigin(0.5).setAlpha(0.4);
    clock.add([ring, this.clockHourHand, this.clockMinuteHand, label]);
    this.shiftClock = clock;

    const fork = this.add.graphics().setDepth(1);
    fork.lineStyle(1.5, C_WALL_STROKE, 0.06);
    fork.strokeRect(1120, 615, 60, 30);
    fork.lineBetween(1120, 615, 1120, 580);
    fork.lineBetween(1130, 615, 1130, 580);
    fork.strokeCircle(1130, 650, 8);
    fork.strokeCircle(1170, 650, 8);
  }

  updateShiftClock(time) {
    const minuteAngle = (time * 0.00006) % (Math.PI * 2);
    this.clockMinuteHand.clear();
    this.clockMinuteHand.lineStyle(2, C_GREEN, 0.35);
    this.clockMinuteHand.lineBetween(0, 0, Math.cos(minuteAngle - Math.PI / 2) * 16, Math.sin(minuteAngle - Math.PI / 2) * 16);
    this.clockHourHand.clear();
    this.clockHourHand.lineStyle(2, C_GREEN, 0.3);
    const hourAngle = minuteAngle / 12;
    this.clockHourHand.lineBetween(0, 0, Math.cos(hourAngle - Math.PI / 2) * 10, Math.sin(hourAngle - Math.PI / 2) * 10);
  }

  updateLampFlicker(time) {
    if (!this.lamps) return;
    this.lamps.forEach((l) => {
      if (time - l.lastFlicker > l.flickerAt) {
        l.lastFlicker = time;
        this.tweens.add({ targets: l.cone, fillAlpha: 0.005, duration: 90, yoyo: true, repeat: 1 });
      }
    });
  }

  chimeShiftClock() {
    this.tweens.add({ targets: this.shiftClock, angle: 8, duration: 100, yoyo: true, repeat: 3 });
  }

  createDockSign() {
    const c = this.add.container(350, 84).setDepth(2);
    const g = this.add.graphics();
    g.fillStyle(0x0c150c, 1);
    g.fillRoundedRect(-75, -15, 150, 30, 6);
    g.lineStyle(1, C_GREEN, 0.25);
    g.strokeRoundedRect(-75, -15, 150, 30, 6);
    const t = this.add.text(0, 0, "INTAKE WING", { font: "bold 11px Arial", color: HEX_GREEN }).setOrigin(0.5).setAlpha(0.5);
    c.add([g, t]);
    this.dockSign = c;
  }

  updateSignSway(time) {
    if (!this.dockSign) return;
    this.dockSign.setAngle(Math.sin(time * 0.00224) * 1.5);
  }

  createParticles() {
    this.ambient = [];
    for (let i = 0; i < 9; i++) {
      const p = this.add.circle(Phaser.Math.Between(90, 1180), Phaser.Math.Between(70, 600), 1, 0xa5d6a7, Phaser.Math.FloatBetween(0.015, 0.035)).setDepth(2);
      this.ambient.push(p);
    }
  }

  updateParticles(time, delta) {
    if (!this.ambient) return;
    const step = 0.015 * (delta / 16.7);
    this.ambient.forEach((p, i) => {
      p.x += step;
      p.y += Math.sin(time * 0.0005 + i) * 0.04;
      if (p.x > 1190) { p.x = 90; p.y = Phaser.Math.Between(70, 600); }
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

  // ══════════════════════════════════════════════════════════════
  // TAPE (ported from Level 34)
  // ══════════════════════════════════════════════════════════════

  _classifyChar(ch) {
    if (ch === " ") return "space";
    if (ch === "\n") return "newline";
    if (/[0-9]/.test(ch)) return "digit";
    if (ch === ".") return "dot";
    if (ch === "-") return "minus";
    return "alpha";
  }

  _cellColor(kind) {
    switch (kind) {
      case "digit": return HEX_INT;
      case "dot": case "minus": return HEX_DOUBLE;
      case "alpha": return HEX_LINE;
      case "space": return HEX_SPACE;
      case "newline": return HEX_NEWLINE;
      default: return "#1b3a1b";
    }
  }

  _cellDisplay(cell) {
    if (cell.kind === "space") return "␣";
    if (cell.kind === "newline") return "⏎";
    return cell.ch;
  }

  createTapeRail() {
    const g = this.add.graphics().setDepth(3);
    g.lineStyle(1, C_WALL_STROKE, 0.35);
    g.lineBetween(TAPE_X0 - 8, TAPE_Y, TAPE_X1 + 8, TAPE_Y);
    this.tapeContainer = this.add.container(0, 0).setDepth(20);
    this.tapeCellObjs = [];
  }

  buildCellsFromLines(inputLines) {
    const cells = [];
    inputLines.forEach((line) => {
      line.split("").forEach((ch) => cells.push({ ch, kind: this._classifyChar(ch) }));
      cells.push({ ch: "\n", kind: "newline" });
    });
    return cells;
  }

  loadTape(inputLines) {
    this.tapeState = this.buildCellsFromLines(inputLines);
    this.openPortIris();
    this.renderTape(true);
  }

  clearTape() {
    this.tapeState = [];
    this.renderTape(false);
  }

  renderTape(animateIn) {
    this.tapeCellObjs.forEach((o) => o.destroy());
    this.tapeCellObjs = [];
    this.tapeContainer.removeAll(true);

    const cellW = 20;
    const totalW = Math.max(this.tapeState.length * cellW, 4);
    const startX = TAPE_X1 - totalW;

    const bg = this.add.graphics();
    bg.fillStyle(0xe8f0e8, 0.9);
    bg.fillRoundedRect(Math.max(startX, TAPE_X0 - 30), TAPE_Y - 20, Math.min(totalW, TAPE_X1 - TAPE_X0 + 30), 40, 4);
    bg.lineStyle(1, C_WALL_STROKE, 1);
    bg.strokeRoundedRect(Math.max(startX, TAPE_X0 - 30), TAPE_Y - 20, Math.min(totalW, TAPE_X1 - TAPE_X0 + 30), 40, 4);
    this.tapeContainer.add(bg);

    this.tapeState.forEach((cell, i) => {
      const x = startX + i * cellW + cellW / 2;
      const t = this.add.text(x, TAPE_Y, this._cellDisplay(cell), {
        font: cell.kind === "newline" ? "bold 16px Courier New" : "bold 13px Courier New",
        color: this._cellColor(cell.kind),
      }).setOrigin(0.5);
      if (animateIn) { t.setAlpha(0); this.tweens.add({ targets: t, alpha: 1, duration: 180, delay: i * 12 }); }
      this.tapeContainer.add(t);
      this.tapeCellObjs.push(t);
    });
  }

  async tapeConsumeVisual(count, discard = false) {
    if (count <= 0) return;
    const objs = this.tapeCellObjs.slice(0, count);
    const promises = objs.map((t, i) => new Promise((res) => {
      this.tweens.add({
        targets: t, x: MACHINE_X - MACHINE_W / 2 + 10, y: discard ? t.y - 18 : MACHINE_Y,
        alpha: 0, scale: 0.4, duration: 160, delay: i * 30, ease: "Cubic.easeIn",
        onComplete: () => { t.destroy(); res(); },
      });
    }));
    await Promise.all(promises);
    this.tapeState = this.tapeState.slice(count);
    this.renderTape(false);
  }

  async bufferBeat(ms = 500) {
    const spot = this.add.rectangle((TAPE_X0 + TAPE_X1) / 2, TAPE_Y, TAPE_X1 - TAPE_X0 + 40, 46, 0xffffff, 0).setDepth(19);
    this.tweens.add({ targets: spot, fillAlpha: 0.05, duration: 140, yoyo: true, hold: Math.max(0, ms - 280) });
    await this.delay(ms);
    if (spot.active) spot.destroy();
  }

  // ══════════════════════════════════════════════════════════════
  // SCANNER MACHINE (ported from Level 34)
  // ══════════════════════════════════════════════════════════════

  createScannerMachine() {
    const c = this.add.container(MACHINE_X, MACHINE_Y).setDepth(10);
    const body = this.add.graphics();
    body.fillStyle(0x0e1810, 1);
    body.fillRoundedRect(-MACHINE_W / 2, -MACHINE_H / 2, MACHINE_W, MACHINE_H, 14);
    body.lineStyle(2, C_GREEN, 1);
    body.strokeRoundedRect(-MACHINE_W / 2, -MACHINE_H / 2, MACHINE_W, MACHINE_H, 14);
    const nameplate = this.add.text(0, -MACHINE_H / 2 + 14, "SCANNER sc", { font: "bold 11px Courier New", color: HEX_GREEN }).setOrigin(0.5);

    const mouth = this.add.graphics();
    mouth.fillStyle(0x050a05, 1);
    mouth.fillRoundedRect(-MACHINE_W / 2 - 14, -12, 18, 24, 3);
    mouth.lineStyle(1, C_WALL_STROKE, 1);
    mouth.strokeCircle(-MACHINE_W / 2 - 20, -8, 3);
    mouth.strokeCircle(-MACHINE_W / 2 - 20, 8, 3);

    const porthole = this.add.circle(0, 0, 24, 0x050a05);
    const portholeRing = this.add.graphics();
    portholeRing.lineStyle(2, C_WALL_STROKE, 1);
    portholeRing.strokeCircle(0, 0, 24);
    const strobe = this.add.circle(0, -MACHINE_H / 2 + 8, 4, 0xffab00, 0).setVisible(false);
    c.add([body, nameplate, mouth, porthole, portholeRing, strobe]);

    const nozzles = {};
    [{ key: "int", y: NOZZLE_Y.int, ring: C_INT, label: "→ int" },
     { key: "double", y: NOZZLE_Y.double, ring: C_DOUBLE, label: "→ double" },
     { key: "line", y: NOZZLE_Y.line, ring: C_LINE, label: "→ String" }].forEach((def) => {
      const ny = def.y - MACHINE_Y;
      const ng = this.add.graphics();
      ng.fillStyle(0x142018, 1);
      ng.fillRoundedRect(MACHINE_W / 2 - 4, ny - 9, 32, 18, 4);
      ng.lineStyle(2, def.ring, 0.5);
      ng.strokeRoundedRect(MACHINE_W / 2 - 4, ny - 9, 32, 18, 4);
      const lbl = this.add.text(MACHINE_W / 2 + 40, ny, def.label, { font: "8px Courier New", color: "#607d8b" }).setOrigin(0, 0.5);
      const glow = this.add.rectangle(MACHINE_W / 2 + 12, ny, 32, 18, def.ring, 0).setOrigin(0.5);
      c.add([ng, lbl, glow]);
      nozzles[def.key] = { g: ng, glow, ring: def.ring, y: def.y };
    });

    this.machine = { c, body, nameplate, porthole, portholeRing, strobe, nozzles };
  }

  nozzleGlow(method, on, color = null) {
    const key = method === "nextInt" ? "int" : method === "nextDouble" ? "double" : "line";
    const nz = this.machine.nozzles[key];
    this.tweens.killTweensOf(nz.glow);
    this.tweens.add({ targets: nz.glow, fillAlpha: on ? 0.35 : 0, duration: 120 });
    if (on) nz.glow.setFillStyle(color || nz.ring, 0.35);
  }

  humMachine() {
    this.tweens.add({ targets: this.machine.c, x: MACHINE_X + 0.6, duration: 35, yoyo: true, repeat: 4 });
  }

  /** Honest tokenizer — identical rules to Level 34. Pure over a cell array. */
  evaluateCall(cells, method) {
    let i = 0;
    const skipped = [];
    if (method !== "nextLine") {
      while (i < cells.length && cells[i].kind === "space") { skipped.push(cells[i]); i++; }
    }
    if (method === "nextLine") {
      const consumed = [];
      let j = i;
      while (j < cells.length && cells[j].kind !== "newline") { consumed.push(cells[j]); j++; }
      if (j < cells.length) consumed.push(cells[j]);
      const strValue = consumed.filter((c) => c.kind !== "newline").map((c) => c.ch).join("");
      return { error: false, rawValue: strValue, valueDisplay: `"${strValue}"`, consumedCount: consumed.length, skippedCount: 0, returnType: "String" };
    }
    const tokenCells = [];
    let j = i;
    while (j < cells.length && cells[j].kind !== "space" && cells[j].kind !== "newline") { tokenCells.push(cells[j]); j++; }
    const tokenStr = tokenCells.map((c) => c.ch).join("");
    if (tokenCells.length === 0) return { error: true, message: "No token available.", consumedCount: 0, skippedCount: 0 };
    if (method === "nextInt") {
      if (/^-?\d+$/.test(tokenStr)) {
        const v = parseInt(tokenStr, 10);
        return { error: false, rawValue: v, valueDisplay: String(v), consumedCount: skipped.length + tokenCells.length, skippedCount: skipped.length, returnType: "int" };
      }
      return { error: true, badToken: tokenStr, consumedCount: 0, skippedCount: 0, returnType: "int" };
    }
    if (method === "nextDouble") {
      if (/^-?\d+(\.\d+)?$/.test(tokenStr)) {
        const v = parseFloat(tokenStr);
        const display = Number.isInteger(v) ? v.toFixed(1) : String(v);
        return { error: false, rawValue: v, valueDisplay: display, consumedCount: skipped.length + tokenCells.length, skippedCount: skipped.length, returnType: "double", widened: Number.isInteger(v) };
      }
      return { error: true, badToken: tokenStr, consumedCount: 0, skippedCount: 0, returnType: "double" };
    }
    return { error: true, message: "Unknown method." };
  }

  _containerKeyForType(returnType) {
    return returnType === "int" ? "int" : returnType === "double" ? "double" : "string";
  }

  /** Single-call reveal (Level 34 style) — used by judge rounds. */
  async runIntake(method, targetContainerKey) {
    const result = this.evaluateCall(this.tapeState, method);
    this.nozzleGlow(method, true);
    this.humMachine();
    await this.delay(120);
    if (!this._alive) return result;

    if (result.error) {
      await this.rejectMismatch(method);
      this.nozzleGlow(method, false);
      return result;
    }
    if (result.skippedCount > 0) await this.tapeConsumeVisual(result.skippedCount, true);
    const bodyCount = result.consumedCount - result.skippedCount;
    await this.tapeConsumeVisual(bodyCount, false);
    await this.castAndDispense(method, result, targetContainerKey);
    this.nozzleGlow(method, false);
    return result;
  }

  async castAndDispense(method, result, targetContainerKey) {
    const swirl = this.add.circle(MACHINE_X, MACHINE_Y, 4, 0xffffff, 0.8).setDepth(11);
    this.tweens.add({ targets: swirl, scale: 5, alpha: 0, duration: 220, onComplete: () => swirl.destroy() });
    await this.delay(140);
    if (!this._alive) return;

    const key = targetContainerKey || this._containerKeyForType(result.returnType);
    const container = this.containers[key];
    const assignmentWidened = key === "double" && result.returnType === "int";
    const widening = result.widened || assignmentWidened;
    const displayValue = assignmentWidened ? Number(result.rawValue).toFixed(1) : result.valueDisplay;
    const color = assignmentWidened ? C_DOUBLE : result.returnType === "int" ? C_INT : result.returnType === "double" ? C_DOUBLE : C_LINE;

    const slug = this.add.text(MACHINE_X, MACHINE_Y, displayValue, { font: "bold 14px Courier New", color: Phaser.Display.Color.IntegerToColor(color).rgba }).setOrigin(0.5).setDepth(12).setScale(0.5).setAlpha(0);
    this.tweens.add({ targets: slug, scale: 1, alpha: 1, duration: 130 });
    await this.delay(130);
    if (!this._alive) return;

    if (widening) await this.wideningSparkle(slug);

    await new Promise((res) => {
      this.tweens.add({
        targets: slug, x: container.x, y: container.y, scale: 0.85, duration: 280, ease: "Cubic.easeOut",
        onComplete: () => { slug.destroy(); this.dispenseTo(key, displayValue); res(); },
      });
    });
  }

  async wideningSparkle(slug) {
    const spark = this.add.text(slug.x + 14, slug.y, "✦", { font: "12px Arial", color: HEX_GOLD }).setDepth(13).setAlpha(0);
    this.tweens.add({ targets: spark, alpha: 1, duration: 130, yoyo: true, onComplete: () => spark.destroy() });
    await this.delay(160);
  }

  dispenseTo(key, valueDisplay) {
    const container = this.containers[key];
    container.valueText.setText(valueDisplay).setAlpha(0).setScale(1.4);
    this.tweens.add({ targets: container.valueText, alpha: 1, scale: 1, duration: 180, ease: "Back.easeOut" });
    this.tweens.add({ targets: container.pill, scaleX: 1.15, scaleY: 1.15, duration: 100, yoyo: true });
  }

  async rejectMismatch(method) {
    const key = method === "nextInt" ? "int" : "double";
    const nz = this.machine.nozzles[key];
    this.tweens.add({ targets: nz.g, x: nz.g.x - 3, duration: 35, yoyo: true, repeat: 3 });
    this.screenShake(0.004, 180);
    this.machine.strobe.setVisible(true);
    const strobeTween = this.tweens.add({ targets: this.machine.strobe, angle: 360, fillAlpha: { from: 0.8, to: 0.3 }, duration: 220, repeat: 2 });
    await this.delay(120);
    if (!this._alive) return;
    const stamp = this.add.text(MACHINE_X, MACHINE_Y - 10, "InputMismatchException", { font: "bold 13px Courier New", color: HEX_RED }).setOrigin(0.5).setDepth(30).setAlpha(0).setScale(1.3);
    this.tweens.add({ targets: stamp, alpha: 1, scale: 1, duration: 180 });
    await this.delay(1100);
    if (!this._alive) return;
    this.tweens.add({ targets: stamp, alpha: 0, duration: 220, onComplete: () => stamp.destroy() });
    strobeTween.stop();
    this.machine.strobe.setVisible(false);
    await this.delay(120);
  }

  showCompileErrorStamp() {
    const stamp = this.add.text(MACHINE_X, MACHINE_Y - 40, "COMPILE ERROR", { font: "bold 18px Arial", color: HEX_RED }).setOrigin(0.5).setDepth(30).setAngle(-6).setScale(1.6).setAlpha(0);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 180 });
    this.time.delayedCall(1300, () => { if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 220, onComplete: () => stamp.destroy() }); });
    this.screenShake(0.003, 140);
  }

  // ══════════════════════════════════════════════════════════════
  // TYPED CONTAINERS (ported from Level 34)
  // ══════════════════════════════════════════════════════════════

  createContainers() {
    this.containers = {};
    [{ key: "int", label: "int", color: C_INT, y: CONTAINER_Y.int },
     { key: "double", label: "double", color: C_DOUBLE, y: CONTAINER_Y.double },
     { key: "string", label: "String", color: C_LINE, y: CONTAINER_Y.string }].forEach((def) => {
      const c = this.add.container(CONTAINER_X, def.y).setDepth(10);
      const g = this.add.graphics();
      g.fillStyle(0x0a120c, 1);
      g.fillRoundedRect(-CONTAINER_W / 2, -CONTAINER_H / 2, CONTAINER_W, CONTAINER_H, 8);
      g.lineStyle(2, def.color, 1);
      g.strokeRoundedRect(-CONTAINER_W / 2, -CONTAINER_H / 2, CONTAINER_W, CONTAINER_H, 8);
      const pill = this.add.container(-CONTAINER_W / 2 + 26, -CONTAINER_H / 2 - 8);
      const pillBg = this.add.graphics();
      pillBg.fillStyle(def.color, 1);
      pillBg.fillRoundedRect(-22, -8, 44, 16, 8);
      const pillText = this.add.text(0, 0, def.label, { font: "bold 9px Arial", color: "#0a120c" }).setOrigin(0.5);
      pill.add([pillBg, pillText]);
      const varPlate = this.add.text(-CONTAINER_W / 2 + 10, 4, "—", { font: "10px Arial", color: "#607d8b" }).setOrigin(0, 0.5);
      const valueText = this.add.text(CONTAINER_W / 2 - 12, 4, "", { font: "bold 15px Courier New", color: Phaser.Display.Color.IntegerToColor(def.color).rgba }).setOrigin(1, 0.5);
      c.add([g, pill, varPlate, valueText]);
      this.containers[def.key] = { c, g, pill, varPlate, valueText, color: def.color, x: CONTAINER_X, y: def.y };
    });
  }

  relabelContainers(varNames) {
    Object.keys(this.containers).forEach((key) => {
      this.containers[key].varPlate.setText(varNames[key] || "—");
      this.containers[key].valueText.setText("");
    });
  }

  resetContainers() {
    Object.values(this.containers).forEach((c) => c.valueText.setText(""));
  }

  async flashContainerError(targetKey, sourceType, sourceColorHex) {
    const container = this.containers[targetKey];
    this.tweens.add({ targets: container.g, alpha: 0.5, duration: 90, yoyo: true, repeat: 3 });
    const ghost = this.add.text(container.x, container.y - 50, sourceType, { font: "bold 14px Courier New", color: sourceColorHex }).setOrigin(0.5).setDepth(30).setAlpha(0);
    this.tweens.add({ targets: ghost, alpha: 0.85, y: container.y - 20, duration: 260 });
    if (!this._noteLeak) {
      this._noteLeak = true;
      this.createAnnotation(container.x - 90, container.y - 20, "doesn't fit — refused!", HEX_RED);
    }
    await this.delay(900);
    if (!this._alive) return;
    this.tweens.add({ targets: ghost, alpha: 0, duration: 220, onComplete: () => ghost.destroy() });
  }

  createSourcePlate() {
    this.add.text(80, 700, "Scanner sc = new Scanner(System.in);", { font: "10px Courier New", color: "#2e4a2e" }).setDepth(15);
  }

  // ══════════════════════════════════════════════════════════════
  // MANIFEST CARD
  // ══════════════════════════════════════════════════════════════

  createManifest() {
    this.manifestContainer = this.add.container(MANIFEST_X, MANIFEST_Y).setDepth(25).setAlpha(0);
    this.manifestLineTexts = [];
  }

  _syntaxColorize(line) {
    const tokens = [];
    const re = /(\bint\b|\bdouble\b|\bString\b)|(\bsc\b)|(\bnextInt\b|\bnextint\b|\bnextInt\(\)|\bnextDouble\b|\bnextLine\b|\bnew\b|\bScanner\b|\bSystem\.in\b|\bprint\b)|([(){};.=+])/g;
    let last = 0, m;
    const plain = (t) => t && tokens.push({ t, c: "#e0e0e0" });
    while ((m = re.exec(line))) {
      if (m.index > last) plain(line.slice(last, m.index));
      if (m[1]) tokens.push({ t: m[1], c: "#4fc3f7" });
      else if (m[2]) tokens.push({ t: m[2], c: HEX_GREEN });
      else if (m[3]) tokens.push({ t: m[3], c: HEX_GOLD });
      else if (m[4]) tokens.push({ t: m[4], c: HEX_MAGENTA });
      last = m.index + m[0].length;
    }
    if (last < line.length) plain(line.slice(last));
    return tokens.length ? tokens : [{ t: line, c: "#e0e0e0" }];
  }

  async clipManifest(config, questionText) {
    this.manifestContainer.removeAll(true);
    this.manifestLineTexts = [];
    const w = 500, h = config.snippet.length > 2 ? 110 : 96;
    const g = this.add.graphics();
    g.fillStyle(0x10161e, 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
    g.lineStyle(2, C_PURPLE, 1);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 10);
    this.manifestContainer.add(g);

    const lines = config.snippet || [];
    const fontSize = lines.length > 2 ? 12 : 15;
    lines.forEach((line, i) => {
      const tokens = this._syntaxColorize(line);
      let x = -w / 2 + 16;
      const y = -h / 2 + 16 + i * (fontSize + 6);
      const rowContainer = this.add.container(0, 0);
      tokens.forEach((tok) => {
        const t = this.add.text(x, y, tok.t, { font: `bold ${fontSize}px Courier New`, color: tok.c }).setOrigin(0, 0.5);
        rowContainer.add(t);
        x += t.width;
      });
      this.manifestContainer.add(rowContainer);
      this.manifestLineTexts.push(rowContainer);
    });

    const qy = h / 2 - 16;
    const qt = this.add.text(0, qy, questionText, { font: "13px Arial", color: "#e0e0e0" }).setOrigin(0.5);
    this.manifestContainer.add(qt);

    this.manifestContainer.y = MANIFEST_Y - 40;
    this.manifestContainer.setAlpha(0);
    await new Promise((res) => {
      this.tweens.add({ targets: this.manifestContainer, y: MANIFEST_Y, alpha: 1, duration: 220, onComplete: res });
    });
  }

  highlightManifestLine(index) {
    this.manifestLineTexts.forEach((row, i) => {
      row.list.forEach((t) => t.setAlpha(i === index ? 1 : 0.4));
    });
  }

  async stampManifest(kind) {
    const label = kind === "processed" ? "PROCESSED" : kind === "misread" ? "MISREAD" : "DELIVERY REFUSED";
    const color = kind === "processed" ? HEX_GREEN_BRIGHT : HEX_RED;
    const stamp = this.add.text(0, 0, label, { font: "bold 20px Arial", color }).setOrigin(0.5).setAngle(-8).setScale(1.6).setAlpha(0).setDepth(30);
    this.manifestContainer.add(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 200 });
    await this.delay(200);
  }

  async unclipManifest(dimmed) {
    if (dimmed) this.manifestContainer.list.forEach((o) => o.setAlpha && o.setAlpha(0.5));
    await new Promise((res) => {
      this.tweens.add({ targets: this.manifestContainer, y: MANIFEST_Y - 60, alpha: 0, duration: 250, onComplete: res });
    });
  }

  // ══════════════════════════════════════════════════════════════
  // HUD
  // ══════════════════════════════════════════════════════════════

  createHUD() {
    const g = this.add.graphics().setDepth(49);
    g.fillStyle(0x0a120a, 0.93);
    g.fillRect(0, 0, W, 64);
    g.lineStyle(1, C_WALL_STROKE, 1);
    g.lineBetween(0, 64, W, 64);

    this.add.text(16, 12, "THE NIGHT SHIFT", { font: "bold 15px Arial", color: "#b0bec5" }).setDepth(50);
    this.add.text(16, 32, "Tuning Phase — Scanner Methods: nextInt() / nextDouble() / nextLine()", { font: "11px Arial", color: "#546e7a" }).setDepth(50);

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
      const lg = this.add.graphics({ x: 1150 + i * 26, y: 26 }).setDepth(50);
      lg.lineStyle(2, C_GREEN, 1);
      lg.strokeCircle(0, 0, 7);
      lg.lineStyle(1.5, C_GREEN, 0.8);
      lg.lineBetween(-3, 0, -1, 3);
      lg.lineBetween(-1, 3, 4, -3);
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

  // ══════════════════════════════════════════════════════════════
  // BIT — night watch variant
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
    const cap = this.add.graphics();
    cap.fillStyle(C_GREEN, 0.9);
    cap.fillEllipse(0, -30, 26, 8);
    cap.fillRect(8, -33, 12, 4);
    cap.setAngle(5);
    const lantern = this.add.container(24, 8);
    const lg = this.add.graphics();
    lg.lineStyle(1.5, 0x78909c, 1);
    lg.strokeRoundedRect(-4, -5, 8, 10, 2);
    const lcore = this.add.circle(0, 0, 3, C_GOLD, 0.5);
    const lglow = this.add.circle(0, 0, 30, C_GOLD, 0.02);
    lantern.add([lglow, lg, lcore]);
    c.add([lglow, g, eye, pupil, cap, tip, lantern]);
    this.tweens.add({ targets: [tip, lcore], alpha: 0.3, duration: 900, yoyo: true, repeat: -1 });
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
    g.lineStyle(1.5, C_GREEN, 1);
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

  createAnnotation(x, y, text, colorHex) {
    const t = this.add.text(x, y, text, { font: "bold 10px Arial", color: colorHex }).setOrigin(0.5).setDepth(70).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 200 });
    this.time.delayedCall(1800, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() }); });
    return t;
  }

  createFloatingText(x, y, text, colorHex, font = "bold 13px Arial", hold = 1400) {
    const t = this.add.text(x, y, text, { font, color: colorHex, wordWrap: { width: 360 }, align: "center" }).setOrigin(0.5).setDepth(31).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 180 });
    this.time.delayedCall(hold, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() }); });
    return t;
  }

  screenShake(intensity = 0.004, duration = 180) {
    this.cameras.main.shake(duration, intensity);
  }

  createConfetti(x, y, count = 30) {
    const p = this.add.particles(x, y, "l35_dot", {
      speed: { min: 80, max: 240 }, angle: { min: 0, max: 360 }, scale: { start: 0.9, end: 0 }, lifespan: 500,
      tint: [C_GREEN, C_GOLD, C_CYAN, C_GREEN_BRIGHT, 0xffffff], emitting: false,
    }).setDepth(75);
    p.explode(count);
    this.time.delayedCall(900, () => p.destroy());
  }

  openPortIris() {
    if (this._irisTween) { this._irisTween.stop(); this._irisTween = null; }
    const state = { v: this._irisProgress };
    this._irisProgress = 1;
    this.tweens.add({
      targets: state, v: 1, duration: 200, ease: "Cubic.easeOut",
      onUpdate: () => { this._drawIrisWedges(this.port.wedges, state.v); this.updateTimerRing(state.v); },
    });
    for (let i = 0; i < 3; i++) {
      const fleck = this.add.circle(PORT_X + 40, PORT_Y + Phaser.Math.Between(-10, 10), 1.5, 0xffffff, 0.8).setDepth(3);
      this.tweens.add({ targets: fleck, x: fleck.x + 20, alpha: 0, duration: 300, delay: i * 40, onComplete: () => fleck.destroy() });
    }
  }

  // ══════════════════════════════════════════════════════════════
  // IRIS TIMER (the closing shutter — the level's hero timer)
  // ══════════════════════════════════════════════════════════════

  startClosing(timeLimitMs, onTimeout) {
    this._killIrisTween();
    this._urgencyState = "safe";
    const state = { v: 1 };
    this.roundTimeLimit = timeLimitMs;
    this._irisTween = this.tweens.add({
      targets: state, v: 0, duration: timeLimitMs, delay: 400, ease: "Linear",
      onUpdate: () => {
        this._irisProgress = state.v;
        this._drawIrisWedges(this.port.wedges, state.v);
        this.updateTimerRing(state.v);
        this._checkUrgency(state.v);
      },
      onComplete: () => { if (this._alive) onTimeout(); },
    });
  }

  _checkUrgency(progress) {
    if (progress <= 0.15 && this._urgencyState !== "critical") {
      this._urgencyState = "critical";
      this.tweens.add({ targets: this.port.wedges, angle: 1, duration: 60, yoyo: true, repeat: -1 });
    } else if (progress <= 0.33 && this._urgencyState === "safe") {
      this._urgencyState = "warning";
    }
  }

  _killIrisTween() {
    if (this._irisTween) { this._irisTween.stop(); this._irisTween = null; }
    this.tweens.killTweensOf(this.port.wedges);
    this.port.wedges.setAngle(0);
  }

  pauseClosing() {
    if (this._irisTween) this._irisTween.pause();
    this.tweens.killTweensOf(this.port.wedges);
    this.port.wedges.setAngle(0);
  }

  getTimePctUsed() {
    const elapsed = this.time.now - this.roundStartTime;
    return Phaser.Math.Clamp(elapsed / this.roundTimeLimit, 0, 1);
  }

  async sealAndRefuse() {
    this._killIrisTween();
    this._drawIrisWedges(this.port.wedges, 0);
    this.updateTimerRing(0);
    this.screenShake(0.006, 150);
    await this.yankTapeToPort();
    await this.stampManifest("refused");
  }

  /** A refused delivery never reaches the machine — it's pulled back OUT
   * through the port (leftward), unlike a normal consume (rightward, into
   * the mouth). Distinct from tapeConsumeVisual for exactly that reason. */
  async yankTapeToPort() {
    const objs = this.tapeCellObjs.slice();
    if (objs.length === 0) return;
    const promises = objs.map((t, i) => new Promise((res) => {
      this.tweens.add({
        targets: t, x: PORT_X, scale: 0.3, alpha: 0, duration: 220, delay: i * 12, ease: "Cubic.easeIn",
        onComplete: () => { t.destroy(); res(); },
      });
    }));
    await Promise.all(promises);
    this.tapeState = [];
    this.renderTape(false);
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
    await this.bitSay("Night shift, Builder — deliveries pour in and the port won't wait. The iris closes on every trial; answer before it seals or the delivery is refused!");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();

    this.loadTape(["5 9"]);
    await this.clipManifest({ snippet: ["int a = sc.nextInt();", "int b = sc.nextInt();"] }, "the port and its timer ring, watching...");
    await this.delay(400); if (!A()) return;
    this.createAnnotation(PORT_X, PORT_Y - 74, "the aperture is your TIMER", HEX_GOLD);
    await this.delay(300); if (!A()) return;
    this.createAnnotation(PORT_X + 70, PORT_Y - 20, "watch it drain", HEX_GREEN_BRIGHT);
    await this.delay(300); if (!A()) return;
    this.createAnnotation((TAPE_X0 + TAPE_X1) / 2, TAPE_Y - 34, "the buffer never lies — READ it", HEX_CYAN);
    await this.delay(400); if (!A()) return;

    await this.bitSay("New skill tonight: think in SEQUENCES. What does the second call get? The tape between calls tells you everything. Eyes on the tape, Builder!");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();
    await this.unclipManifest(false);
    this.clearTape();

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
    this.chimeShiftClock();

    const banners = {
      1: "WAVE 1 — RAPID READS", 2: "WAVE 2 — SAFE OR CRASH", 3: "WAVE 3 — THE LEFTOVER NEWLINE",
    };
    await this.showWaveBanner(banners[waveNumber]);
    if (!this._alive) return;

    if (waveNumber === 3) {
      await this.showBitFeedback("Wave three, Builder. Back in training I told you to remember a moment — a lonely ⏎ left on the tape. Tonight, it collects its debt.", 4500);
      if (!this._alive) return;
    }

    const startIndex = waveNumber === 1 ? 0 : waveNumber === 2 ? 5 : 10;
    this.startRound(startIndex);
  }

  async showWaveBanner(text) {
    const c = this.add.container(-400, 200).setDepth(85);
    const g = this.add.graphics();
    g.fillStyle(0x0e160e, 0.95);
    g.fillRoundedRect(-260, -30, 520, 60, 10);
    g.lineStyle(2, C_GOLD, 1);
    g.strokeRoundedRect(-260, -30, 520, 60, 10);
    const t = this.add.text(0, 0, text, { font: "bold 20px Arial", color: HEX_GOLD }).setOrigin(0.5);
    c.add([g, t]);
    await new Promise((res) => {
      this.tweens.add({
        targets: c, x: 640, duration: 350, ease: "Back.easeOut",
        onComplete: () => this.time.delayedCall(700, () => {
          this.tweens.add({ targets: c, x: 1700, duration: 300, ease: "Cubic.easeIn", onComplete: () => { c.destroy(); res(); } });
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
    this.resetContainers();

    const limit = config.type === "bughunt" ? 12000 : WAVE_TIME[config.wave];
    this.loadTape(config.inputLines);

    if (config.type === "reads" || config.type === "leftover") this.setupPredict(config);
    else if (config.type === "judge") this.setupJudge(config);
    else if (config.type === "bughunt") this.setupBugHunt(config);

    this.startClosing(limit, () => this.onIrisTimeout(config));
  }

  clearRound() {
    this.roundElements.forEach((e) => { if (e && e.destroy) e.destroy(); });
    this.roundElements = [];
  }

  async onIrisTimeout(config) {
    if (this.gameEnded) return;
    this.inputLocked = true;
    this.roundElements.forEach((e) => e.disableInteractive && e.disableInteractive());
    const timeMs = this.roundTimeLimit;
    this.logAttempt(config, false, null, "timeout", timeMs, 1);
    await this.sealAndRefuse();
    if (!this._alive) return;
    this.updateWaveIndicator(this._roundInWave(), false);
    this.loseLife();
    this.updateCombo(false);
    if (this.lives <= 0) { this.time.delayedCall(400, () => this.gameOver()); return; }
    await this.showBitFeedback(MISCONCEPTION_FEEDBACK.timeout);
    if (!this._alive) return;
    this.clearRound();
    await this.unclipManifest(true);
    this.advanceRound();
  }

  _roundInWave() {
    if (this.currentWave === 1) return this.currentRound;
    if (this.currentWave === 2) return this.currentRound - 5;
    return this.currentRound - 10;
  }

  // ══════════════════════════════════════════════════════════════
  // SEQUENTIAL SNIPPET ENGINE (the honest interpreter)
  // ══════════════════════════════════════════════════════════════

  parseStatement(line) {
    let m = line.match(/^(int|double|String)\s+(\w+)\s*=\s*sc\.(nextInt|nextDouble|nextLine)\(\);$/);
    if (m) return { type: "read", declType: m[1], varName: m[2], method: m[3] };
    m = line.match(/^sc\.(nextInt|nextDouble|nextLine)\(\);$/);
    if (m) return { type: "read", declType: null, varName: null, method: m[1] };
    m = line.match(/^print\(([^)]+)\);$/);
    if (m) return { type: "print", expr: m[1] };
    return { type: "unknown", raw: line };
  }

  evaluatePrintExpr(expr, vars) {
    const m = expr.match(/^(\w+)\s*\+\s*(\w+)$/);
    if (m) {
      const va = vars[m[1]], vb = vars[m[2]];
      if (!va || !vb) return "";
      const sum = va.rawValue + vb.rawValue;
      const bothInt = va.returnType === "int" && vb.returnType === "int";
      return bothInt ? String(sum) : Number.isInteger(sum) ? sum.toFixed(1) : String(sum);
    }
    const v = vars[expr.trim()];
    return v ? v.valueDisplay : "";
  }

  runSequence(inputLines, snippetLines) {
    let cells = this.buildCellsFromLines(inputLines);
    const vars = {};
    const steps = [];
    for (let i = 0; i < snippetLines.length; i++) {
      const stmt = this.parseStatement(snippetLines[i]);
      if (stmt.type === "read") {
        const result = this.evaluateCall(cells, stmt.method);
        steps.push({ stmtIndex: i, type: "read", stmt, result });
        if (result.error) { steps.push({ stmtIndex: i, type: "crash" }); break; }
        cells = cells.slice(result.consumedCount);
        if (stmt.varName) vars[stmt.varName] = result;
      } else if (stmt.type === "print") {
        steps.push({ stmtIndex: i, type: "print", text: this.evaluatePrintExpr(stmt.expr, vars) });
      }
    }
    return { steps, vars, remainingCells: cells };
  }

  async runSnippetReveal(config) {
    const { steps } = this.runSequence(config.inputLines, config.snippet);
    for (const step of steps) {
      if (!this._alive) return;
      if (step.type === "crash") break;
      this.highlightManifestLine(step.stmtIndex);
      if (step.type === "read") {
        const method = step.stmt.method;
        this.nozzleGlow(method, true);
        this.humMachine();
        await this.delay(110);
        if (!this._alive) return;
        const result = step.result;
        if (result.error) {
          await this.rejectMismatch(method);
          this.nozzleGlow(method, false);
          break;
        }
        if (result.skippedCount > 0) await this.tapeConsumeVisual(result.skippedCount, true);
        const bodyCount = result.consumedCount - result.skippedCount;

        // ROUND 11 SET-PIECE: spotlight the leftover ⏎ before the next
        // statement devours it — the payoff of Level 34's planted seed.
        if (config.round === 11 && step.stmtIndex === 0) {
          await this.tapeConsumeVisual(bodyCount, false);
          await this.castAndDispenseNamed(method, result, step.stmt);
          this.nozzleGlow(method, false);
          await this.delay(150);
          this.createAnnotation(TAPE_X1 - 12, TAPE_Y - 32, "left on the tape...", HEX_NEWLINE);
          await this.bufferBeat(800);
          continue;
        }

        if (step.stmt.varName) {
          await this.tapeConsumeVisual(bodyCount, false);
          await this.castAndDispenseNamed(method, result, step.stmt);
        } else {
          this.createAnnotation(MACHINE_X, MACHINE_Y - MACHINE_H / 2 - 12, "cleared!", HEX_NEWLINE);
          await this.tapeConsumeVisual(bodyCount, true);
        }
        this.nozzleGlow(method, false);
        await this.bufferBeat(450);
      } else if (step.type === "print") {
        this.createFloatingText(MACHINE_X, MACHINE_Y + 100, `→ ${step.text}`, HEX_GOLD, "bold 15px Courier New", 1000);
        await this.delay(350);
      }
    }
  }

  async castAndDispenseNamed(method, result, stmt) {
    const key = this._containerKeyForType(result.returnType);
    this.containers[key].varPlate.setText(stmt.varName || "—");
    await this.castAndDispense(method, result, key);
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE A/C — PREDICT (reads / leftover)
  // ══════════════════════════════════════════════════════════════

  async setupPredict(config) {
    await this.clipManifest(config, config.question);
    this.highlightManifestLine(null);
    this.showOptionBubbles(config.options, config);
  }

  showOptionBubbles(options, config) {
    const shuffled = Phaser.Utils.Array.Shuffle(options.slice());
    const n = shuffled.length;
    const spacing = 280;
    const startX = W / 2 - ((n - 1) * spacing) / 2;
    shuffled.forEach((opt, i) => {
      const x = startX + i * spacing, y = 580;
      const c = this.add.container(x, y).setDepth(41);
      const g = this.add.graphics();
      const w = 250, h = 50;
      const draw = (stroke) => {
        g.clear();
        g.fillStyle(0x0e1810, 1);
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
        g.lineStyle(2, stroke, 1);
        g.strokeRoundedRect(-w / 2, -h / 2, w, h, 10);
      };
      draw(C_GREEN);
      const label = opt.label || opt.value;
      const isString = opt.value.startsWith('"');
      const color = opt.value === "Error" ? HEX_RED : isString ? HEX_LINE : /^-?\d+\.\d/.test(opt.value) ? HEX_DOUBLE : /^-?\d+$/.test(opt.value) ? HEX_INT : "#e0e0e0";
      const txt = this.add.text(0, 0, label, { font: "bold 15px Courier New", color }).setOrigin(0.5);
      c.add([g, txt]);
      c.setSize(w, h);
      c.setInteractive({ useHandCursor: true });
      c.on("pointerover", () => { if (!this.inputLocked) draw(C_GOLD); });
      c.on("pointerout", () => { if (!this.inputLocked) draw(C_GREEN); });
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
    this.pauseClosing();
    const timePctUsed = this.getTimePctUsed();
    const timeMs = Math.round(this.time.now - this.roundStartTime);
    const correct = opt.value === config.correct;
    this.logAttempt(config, correct, opt.value, opt.tag, timeMs, timePctUsed);
    this.roundElements.forEach((e) => e.disableInteractive && e.disableInteractive());

    const g = bubbleContainer.list[0];
    g.clear();
    g.fillStyle(0x0e1810, 1);
    g.fillRoundedRect(-125, -25, 250, 50, 10);
    g.lineStyle(2, correct ? C_GREEN_BRIGHT : C_RED, 1);
    g.strokeRoundedRect(-125, -25, 250, 50, 10);
    if (!correct) this.tweens.add({ targets: bubbleContainer, x: bubbleContainer.x + 5, duration: 35, yoyo: true, repeat: 4 });

    await this.stampManifest(correct ? "processed" : "misread");
    await this.delay(150);
    if (!this._alive) return;
    await this.runSnippetReveal(config);
    if (config.revealNote) this.createFloatingText(MACHINE_X, MACHINE_Y + 100, config.revealNote, HEX_GRAY, "11px Arial", 2600);
    await this.delay(500);
    if (!this._alive) return;

    this.updateWaveIndicator(this._roundInWave(), correct);
    if (correct) {
      this.updateScore(this.scoreForAttempt(timePctUsed));
      this.updateCombo(true);
      if (this.roundAttempts === 0) this.correctFirstTry++;
      await this.delay(250);
      await this.unclipManifest(false);
      this.advanceRound();
    } else {
      this.loseLife();
      this.updateCombo(false);
      if (this.lives <= 0) { this.time.delayedCall(400, () => this.gameOver()); return; }
      await this.showBitFeedback(MISCONCEPTION_FEEDBACK[opt.tag] || "Not quite — trace the tape again.");
      if (!this._alive) return;
      await this.unclipManifest(true);
      this.advanceRound();
    }
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE B — JUDGE (safe or crash)
  // ══════════════════════════════════════════════════════════════

  _declTypeOf(snippet) { const m = snippet.match(/^(int|double|String)\s/); return m ? m[1] : null; }
  _methodOf(snippet) { const m = snippet.match(/sc\.(nextInt|nextDouble|nextLine)\(\)/); return m ? m[1] : null; }

  compileCheck(declType, method) {
    const returnType = method === "nextInt" ? "int" : method === "nextDouble" ? "double" : "String";
    if (declType === returnType) return { ok: true };
    if (declType === "double" && returnType === "int") return { ok: true };
    if (declType === "int" && returnType === "double") return { ok: false, tag: "narrowing_assignment_error" };
    if (declType === "String") return { ok: false, tag: "int_into_string_belief" };
    return { ok: false, tag: declType === "int" ? "line_into_int_belief" : "line_into_double_belief" };
  }

  async setupJudge(config) {
    await this.clipManifest({ snippet: config.snippet }, "Does this statement compile and run correctly?");
    this.highlightManifestLine(0);
    this.showJudgmentButtons(config);
    this.setupKeyboardShortcuts(config);
  }

  showJudgmentButtons(config) {
    const safeBtn = this._makeJudgeButton(W / 2 - 140, 580, "✓ SAFE", C_GREEN_BRIGHT, () => this.onJudgmentSelected("safe", config, safeBtn));
    const crashBtn = this._makeJudgeButton(W / 2 + 140, 580, "✗ CRASH", C_RED, () => this.onJudgmentSelected("crash", config, crashBtn));
    this.roundElements.push(safeBtn, crashBtn);
    this.inputLocked = false;
  }

  _makeJudgeButton(x, y, label, colorHex, onClick) {
    const c = this.add.container(x, y).setDepth(41);
    const g = this.add.graphics();
    const w = 200, h = 54;
    const draw = (hover) => {
      g.clear();
      g.fillStyle(0x0e1810, 1);
      g.fillRoundedRect(-w / 2, -h / 2, w, h, 12);
      g.lineStyle(hover ? 3 : 2, colorHex, 1);
      g.strokeRoundedRect(-w / 2, -h / 2, w, h, 12);
    };
    draw(false);
    const t = this.add.text(0, 0, label, { font: "bold 17px Arial", color: Phaser.Display.Color.IntegerToColor(colorHex).rgba }).setOrigin(0.5);
    c.add([g, t]);
    c.setSize(w, h);
    c.setInteractive({ useHandCursor: true });
    c.on("pointerover", () => { if (!this.inputLocked) draw(true); });
    c.on("pointerout", () => { if (!this.inputLocked) draw(false); });
    c.on("pointerdown", () => { if (!this.inputLocked) { this.inputLocked = true; onClick(); } });
    return c;
  }

  setupKeyboardShortcuts(config) {
    this._judgeKeyHandler = (e) => {
      if (this.inputLocked) return;
      const key = e.key.toLowerCase();
      if (key === "s") this.roundElements[0] && this.roundElements[0].emit("pointerdown");
      else if (key === "c") this.roundElements[1] && this.roundElements[1].emit("pointerdown");
    };
    this.input.keyboard.on("keydown", this._judgeKeyHandler);
  }

  teardownKeyboardShortcuts() {
    if (this._judgeKeyHandler) { this.input.keyboard.off("keydown", this._judgeKeyHandler); this._judgeKeyHandler = null; }
  }

  async onJudgmentSelected(choice, config, btnContainer) {
    this.teardownKeyboardShortcuts();
    this.pauseClosing();
    const timePctUsed = this.getTimePctUsed();
    const timeMs = Math.round(this.time.now - this.roundStartTime);
    const correct = choice === config.correct;
    this.logAttempt(config, correct, choice, correct ? null : config.wrongTag, timeMs, timePctUsed);
    this.roundElements.forEach((e) => e.disableInteractive && e.disableInteractive());

    const declType = this._declTypeOf(config.snippet[0]);
    const method = this._methodOf(config.snippet[0]);
    const varName = (config.snippet[0].match(/\s(\w+)\s*=/) || [])[1];
    const targetKey = this._containerKeyForType(declType === "int" ? "int" : declType === "double" ? "double" : "String");
    this.relabelContainers({ [targetKey]: varName });

    await this.stampManifest(correct ? "processed" : "misread");
    await this.delay(150);
    if (!this._alive) return;

    const check = this.compileCheck(declType, method);
    if (!check.ok) {
      this.showCompileErrorStamp();
      const sourceType = method === "nextDouble" ? "double" : method === "nextLine" ? "String" : "int";
      const sourceColor = method === "nextDouble" ? HEX_DOUBLE : method === "nextLine" ? HEX_LINE : HEX_INT;
      await this.flashContainerError(targetKey, sourceType, sourceColor);
    } else {
      await this.runIntake(method, targetKey);
    }
    if (config.revealNote) this.createFloatingText(MACHINE_X, MACHINE_Y + 100, config.revealNote, HEX_GRAY, "11px Arial", 2600);
    await this.delay(450);
    if (!this._alive) return;

    this.updateWaveIndicator(this._roundInWave(), correct);
    if (correct) {
      this.updateScore(this.scoreForAttempt(timePctUsed));
      this.updateCombo(true);
      if (this.roundAttempts === 0) this.correctFirstTry++;
      await this.delay(250);
      await this.unclipManifest(false);
      this.advanceRound();
    } else {
      this.loseLife();
      this.updateCombo(false);
      if (this.lives <= 0) { this.time.delayedCall(400, () => this.gameOver()); return; }
      const msg = config.explanation || MISCONCEPTION_FEEDBACK[config.wrongTag] || "Not quite — check the types again.";
      await this.showBitFeedback(msg);
      if (!this._alive) return;
      await this.unclipManifest(true);
      this.advanceRound();
    }
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE D — BUG HUNT
  // ══════════════════════════════════════════════════════════════

  async setupBugHunt(config) {
    this.manifestContainer.removeAll(true);
    const w = 560, h = 110;
    const g = this.add.graphics();
    g.fillStyle(0x10161e, 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
    g.lineStyle(2, HEX_MAGENTA === "#ff4081" ? 0xff4081 : C_PURPLE, 1);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 10);
    const header = this.add.text(0, -h / 2 + 14, "CLICK THE BUG", { font: "bold 13px Arial", color: HEX_MAGENTA }).setOrigin(0.5);
    this.tweens.add({ targets: header, alpha: 0.5, duration: 500, yoyo: true, repeat: -1 });
    this.manifestContainer.add([g, header]);
    this.manifestLineTexts = [];

    config.manifestLines.forEach((line, i) => {
      const y = -h / 2 + 40 + i * 26;
      const lineIsBug = config.faultLine ? i + 1 === config.faultLine : line.includes(config.faultToken);
      const t = this.add.text(0, y, line, { font: "bold 14px Courier New", color: "#e0e0e0" }).setOrigin(0.5);
      t.setInteractive({ useHandCursor: true });
      t.on("pointerover", () => { if (!this.inputLocked) t.setColor(HEX_GOLD); });
      t.on("pointerout", () => { if (!this.inputLocked) t.setColor("#e0e0e0"); });
      t.on("pointerdown", () => {
        if (this.inputLocked) return;
        this.inputLocked = true;
        this.onTokenClicked(t, lineIsBug, config, i);
      });
      this.manifestContainer.add(t);
      this.manifestLineTexts.push(t);
    });

    this.manifestContainer.y = MANIFEST_Y - 40;
    this.manifestContainer.setAlpha(0);
    await new Promise((res) => this.tweens.add({ targets: this.manifestContainer, y: MANIFEST_Y, alpha: 1, duration: 220, onComplete: res }));
    this.inputLocked = false;
  }

  async onTokenClicked(lineText, lineIsBug, config, lineIndex) {
    this.pauseClosing();
    const timePctUsed = this.getTimePctUsed();
    const timeMs = Math.round(this.time.now - this.roundStartTime);
    const correct = lineIsBug;
    this.logAttempt(config, correct, `line ${lineIndex + 1}`, correct ? null : config.wrongTag, timeMs, timePctUsed);
    this.manifestLineTexts.forEach((t) => t.disableInteractive());

    if (correct) {
      lineText.setColor(HEX_GREEN_BRIGHT);
      const fixed = this.add.text(lineText.x, lineText.y - 20, config.fixedToken, { font: "bold 13px Courier New", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setAlpha(0);
      this.manifestContainer.add(fixed);
      this.tweens.add({ targets: fixed, alpha: 1, y: lineText.y - 24, duration: 250 });
      await this.stampManifest("processed");
    } else {
      lineText.setColor(HEX_RED);
      this.tweens.add({ targets: lineText, x: lineText.x + 5, duration: 35, yoyo: true, repeat: 4 });
      const bugLineObj = this.manifestLineTexts.find((_, i) => (config.faultLine ? i + 1 === config.faultLine : false));
      if (bugLineObj) this.tweens.add({ targets: bugLineObj, alpha: 0.3, duration: 200, yoyo: true, repeat: 3 });
      await this.stampManifest("misread");
    }
    await this.delay(500);
    if (!this._alive) return;

    this.updateWaveIndicator(this._roundInWave(), correct);
    if (correct) {
      this.updateScore(this.scoreForAttempt(timePctUsed));
      this.updateCombo(true);
      if (this.roundAttempts === 0) this.correctFirstTry++;
      await this.delay(250);
      await this.unclipManifest(false);
      this.advanceRound();
    } else {
      this.loseLife();
      this.updateCombo(false);
      if (this.lives <= 0) { this.time.delayedCall(400, () => this.gameOver()); return; }
      await this.showBitFeedback(config.explanation || MISCONCEPTION_FEEDBACK[config.wrongTag] || "Not that one — look again.");
      if (!this._alive) return;
      await this.unclipManifest(true);
      this.advanceRound();
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
    const apertureRemaining = 1 - timePctUsed;
    if (apertureRemaining > 0.6) { points += 50; this.fastBonusCount++; this.createFloatingText(MACHINE_X, MACHINE_Y - 110, "⚡ EXPRESS +50", HEX_GOLD, "bold 14px Arial", 1000); }
    else if (apertureRemaining > 0.3) { points += 25; this.fastBonusCount++; this.createFloatingText(MACHINE_X, MACHINE_Y - 110, "⚡ +25", HEX_GOLD, "bold 13px Arial", 900); }
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
    this.totalTimePctUsed += timePctUsed;
    this.attemptLog.push({
      round: config.round, wave: config.wave, type: config.type, concept: config.concept,
      correct, selectedAnswer, misconceptionTag: misconceptionTag || null,
      timeMs, timePctUsed, attemptNumber: this.roundAttempts,
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
    this.teardownKeyboardShortcuts();
    this._killIrisTween();
    this.clearRound();
    this.hideBubble();

    (async () => {
      this._drawIrisWedges(this.port.wedges, 0);
      this.updateTimerRing(0);
      this.clearTape();
      this.lamps.forEach((l, i) => this.time.delayedCall(i * 300, () => this.tweens.add({ targets: l.cone, fillAlpha: 0, duration: 400 })));
      const tag = this.add.text(PORT_X, PORT_Y + 70, "CLOSED — NEXT SHIFT 06:00", { font: "bold 9px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(30).setAlpha(0);
      this.tweens.add({ targets: tag, alpha: 1, duration: 300 });
      this.tweens.add({ targets: tag, angle: 3, duration: 1200, yoyo: true, repeat: -1 });
      await this.delay(600);
      if (!this._alive) return;

      const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
      this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });
      const title = this.add.text(640, 240, "SHIFT ABANDONED", { font: "bold 40px Arial", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
      this.tweens.add({ targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut", onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }) });
      this.add.text(640, 310, `Score: ${this.score}`, { font: "20px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
      this.add.text(640, 350, `Deliveries Processed: ${this.currentRound} / 15`, { font: "16px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);
      this._makeButton(640, 420, "CLOCK BACK IN", 200, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
    })();
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.teardownKeyboardShortcuts();
    this._killIrisTween();
    this.clearRound();
    this.hideBubble();

    try { GameManager.completeLevel(34, Math.round((this.correctFirstTry / 15) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("scanner_schema_tuned"); } catch (_) {}
    try {
      localStorage.setItem("level35_results", JSON.stringify({
        level: 35, concept: "scanner_input_methods", phase: "tuning",
        score: this.score, accuracy: this.correctFirstTry / 15, avgTimePct: this.totalTimePctUsed / 15,
        fastBonuses: this.fastBonusCount, comboMax: this.maxCombo, stars: this._starRating(),
        livesRemaining: this.lives, attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.dawnCeremony().then(() => { if (this._alive) this.showScoreTally(); });
  }

  async dawnCeremony() {
    this.tweens.add({ targets: this.moonBeam, fillColor: 0xffd740, duration: 1200 });
    this.resetContainers();
    this.relabelContainers({ string: "done" });
    this.loadTape(["SHIFT COMPLETE"]);
    this._drawIrisWedges(this.port.wedges, 1);
    this.updateTimerRing(1);
    await this.delay(400);
    if (!this._alive) return;
    await this.runIntake("nextLine", "string");
    if (!this._alive) return;
    this.createConfetti(CONTAINER_X, CONTAINER_Y.string);
    await this.delay(600);
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
    panel.fillStyle(0x0e160e, 1);
    panel.fillRoundedRect(360, 90, 560, 440, 16);
    panel.lineStyle(2, C_GREEN_BRIGHT, 1);
    panel.strokeRoundedRect(360, 90, 560, 440, 16);

    const title = this.add.text(640, 130, "SHIFT SURVIVED", { font: "bold 34px Arial", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(91).setScale(0);
    this.tweens.add({ targets: title, scale: 1, duration: 350, ease: "Back.easeOut" });

    const acc = Math.round((this.correctFirstTry / 15) * 100);
    const avgResponseSec = ((this.totalTimePctUsed / 15) * (WAVE_TIME[2] / 1000)).toFixed(1);
    const lines = [`ACCURACY: ${acc}%`, `AVG RESPONSE: ${avgResponseSec}s`, `EXPRESS BONUSES: ${this.fastBonusCount}`, `BEST COMBO: ×${this.getComboMultiplierFor(this.maxCombo)}`];
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
    bg.lineStyle(1.5, C_GREEN, 1);
    bg.strokeCircle(0, 0, 14);
    const enter = this.add.text(0, 0, "⏎", { font: "bold 13px Arial", color: HEX_NEWLINE }).setOrigin(0.5);
    badge.add([bg, enter]);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 2000 });
    const badgeLbl = this.add.text(640, 458, "SCANNER SCHEMA TUNED", { font: "bold 13px Arial", color: HEX_GOLD }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: badgeLbl, alpha: 1, duration: 300, delay: 2150 });

    this._makeButton(500, 500, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(760, 500, "NEXT: The Front Desk →", 260, 44, { fill: 0x00733a, stroke: C_GREEN_BRIGHT, textColor: "#ffffff" }, () => {
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
