/**
 * Level 40 — "The Whisper Booth" (Output Methods: Accretion Phase —
 * print() joins println() in the Output Wing)
 * ===========================================================================
 * Teaches System.out.print(): the non-newline-appending sibling of
 * println(). Everything from the println() trilogy (L37-39) carries over —
 * the Broadcast Log, the type-honest marquee, the honest left-to-right
 * String-sticky '+' evaluator — except the log is now a genuine row/column
 * text buffer (not "one println = one line"), and a prominent cursor block
 * makes print()'s "rests at end of text" behavior impossible to miss
 * against println()'s "jumps to a fresh row" behavior.
 *
 * The evaluator extends L37-39's with: (a) '\n' escape-sequence processing
 * inside String literals (a literal backslash-n becomes one real newline
 * character), and (b) the genuine Java asymmetry that print() has NO
 * zero-argument overload (a compile error) while println() does.
 */

import Phaser from "phaser";
import { GameManager } from "../../../GameManager.js";
import { BadgeSystem } from "../../../BadgeSystem.js";

const W = 1280, H = 720;

const C_CYAN = 0x00e5ff, C_GOLD = 0xffd740, C_VIOLET = 0x8c7ae6;
const C_GREEN_BRIGHT = 0x00e676, C_RED = 0xf44336, C_GRAY = 0x78909c;
const C_MAGENTA = 0xff4081, C_PURPLE = 0x7b1fa2;
const HEX_CYAN = "#00e5ff", HEX_GOLD = "#ffd740", HEX_VIOLET = "#8c7ae6";
const HEX_GREEN_BRIGHT = "#00e676", HEX_RED = "#f44336", HEX_GRAY = "#78909c";
const HEX_MAGENTA = "#ff4081", HEX_PURPLE = "#7b1fa2";

const DESK_X0 = 285, DESK_X1 = 560, DESK_Y0 = 250, DESK_Y1 = 380;
const MARQUEE_X0 = 305, MARQUEE_X1 = 540, MARQUEE_Y = 305;
const EMITTER_X = 545, EMITTER_Y = 305;
const SRC_Y = 195;
const LOG_X = 590, LOG_Y = 96, LOG_W = 640, LOG_H = 500;
const LOG_CONTENT_Y0 = LOG_Y + 44;
const ROW_H = 32;
const LOG_TEXT_X = LOG_X + 40;
const TUTORIAL_KEY = "level40_tutorial_done";

// ══════════════════════════════════════════════════════════════
// ROUND CONFIGURATION
// ══════════════════════════════════════════════════════════════
const ROUNDS = [
  { round: 1, type: "predict", source: ['System.out.print("hello");'],
    question: "What appears on the log?", correct: "hello",
    options: [
      { value: "hello", label: "hello  (cursor after o)", tag: null },
      { value: "hello⏎(new line)", tag: "print_adds_newline_belief" },
      { value: '"hello"', tag: "quotes_print_belief" },
      { value: "Error", tag: "print_requires_special_type_belief" },
    ],
    revealNote: "Whisper lands 'hello' on row 01, cursor rests at end.", concept: "basic_print_no_newline" },

  { round: 2, type: "predict", source: ['System.out.print("A");', 'System.out.print("B");'],
    question: "What appears on the log?", correct: "AB",
    options: [
      { value: "AB", label: "AB on ONE line", tag: null },
      { value: "A⏎B", label: "A / B (two lines)", tag: "print_stacks_on_new_lines_belief" },
      { value: "A B", tag: "print_prepends_space_belief" },
      { value: "B", tag: "second_overwrites_belief" },
    ],
    revealNote: "Two whispers, one line. B lands RIGHT after A. The cursor rests at end of B.",
    concept: "consecutive_prints_same_line" },

  { round: 3, type: "predict", decl: "int score = 42;", source: ['System.out.print("score: ");', "System.out.print(score);"],
    question: "What appears on the log?", correct: "score: 42",
    options: [
      { value: "score: 42", tag: null },
      { value: "score: score", tag: "variable_as_literal_belief" },
      { value: "score:42", tag: "print_prepends_space_belief" },
      { value: "score: ⏎42", tag: "print_adds_newline_belief" },
    ],
    revealNote: "First whisper lands 'score: ' (magenta ␣). Second whisper lands 42 in gold RIGHT AFTER.",
    concept: "print_with_variable" },

  { round: 4, type: "cursor", source: ['System.out.print("go");'],
    question: "Where is the cursor AFTER this call?", correct: "end_of_row_01",
    options: [
      { value: "end_of_row_01", label: "end of row 01, right after 'go'", tag: null },
      { value: "start_of_row_02", label: "start of row 02 (new line below)", tag: "print_adds_newline_belief" },
      { value: "start_of_row_01", label: "start of row 01 (back to the beginning)", tag: "cursor_resets_belief" },
      { value: "invisible", label: "hidden (cursor disappears)", tag: "cursor_hidden_after_print_belief" },
    ],
    revealNote: "Log fills 'go' on row 01, cursor rests at end.", concept: "cursor_rests_at_end" },

  { round: 5, type: "cursor", source: ['System.out.println("go");'],
    question: "Where is the cursor AFTER this call?", correct: "start_of_row_02",
    options: [
      { value: "start_of_row_02", label: "start of row 02 (new line below)", tag: null },
      { value: "end_of_row_01", label: "end of row 01, right after 'go'", tag: "println_no_newline_belief" },
      { value: "start_of_row_01", label: "start of row 01", tag: "cursor_resets_belief" },
      { value: "invisible", label: "hidden", tag: "cursor_hidden_after_println_belief" },
    ],
    revealNote: "'go' lands on row 01, cursor JUMPS to row 02 col 0 with a fresh cursor slot.",
    concept: "cursor_jumps_after_println" },

  { round: 6, type: "cursor", source: ['System.out.print("A");', 'System.out.println("B");', 'System.out.print("C");'],
    question: "Where is the cursor AFTER all three calls?", correct: "end_of_row_02_after_C",
    options: [
      { value: "end_of_row_02_after_C", label: "end of row 02, right after 'C'", tag: null },
      { value: "start_of_row_03", label: "start of row 03 (new line below)", tag: "print_adds_newline_belief" },
      { value: "end_of_row_01_after_C", label: "end of row 01, after 'C' concatenated with 'AB'", tag: "println_no_newline_belief" },
      { value: "start_of_row_01", label: "start of row 01", tag: "cursor_resets_belief" },
    ],
    revealNote: "Row 01: 'AB' (print then println extends the line, then jumps). Row 02: 'C', cursor resting at its end.",
    concept: "mixed_calls_cursor_trace" },

  { round: 7, type: "predict", source: ['System.out.print("A\\nB");'],
    question: "What appears on the log?", correct: "A⏎B",
    options: [
      { value: "A⏎B", label: "A on row 01, B on row 02", tag: null },
      { value: "A\\nB", label: "A\\nB (literal backslash n)", tag: "newline_prints_literal_slash_n_belief" },
      { value: "AB", tag: "escape_newline_confusion" },
      { value: "AB⏎", tag: "print_adds_newline_belief" },
    ],
    revealNote: "The marquee shows '\\n' in magenta between A and B. A on row 01, cursor jumps, B on row 02.",
    concept: "newline_char_in_string" },

  { round: 8, type: "predict", source: ["System.out.print();"],
    question: "What appears on the log?", correct: "Error",
    options: [
      { value: "Error", label: "Compile error (no such method)", tag: null },
      { value: "(blank line)", label: "blank line (like println())", tag: "print_no_arg_legal_belief" },
      { value: "(nothing at all)", label: "nothing happens", tag: "print_no_arg_legal_belief" },
      { value: "null", tag: "returns_null_belief" },
    ],
    revealNote: "The whisper desk shakes, marquee shows 'NO ARGUMENT', COMPILE ERROR stamp lands. The log stays untouched.",
    concept: "print_requires_argument" },

  { round: 9, type: "predict", source: ['System.out.print("A");', 'System.out.println("B");', 'System.out.print("C");', 'System.out.print("D");'],
    question: "What appears on the log?", correct: "AB⏎CD",
    options: [
      { value: "AB⏎CD", label: "AB (row 01) / CD (row 02)", tag: null },
      { value: "A⏎B⏎C⏎D", label: "A / B / C / D (four lines)", tag: "print_adds_newline_belief" },
      { value: "ABCD", label: "ABCD (one line)", tag: "println_no_newline_belief" },
      { value: "A⏎BCD", label: "A / BCD", tag: "mixed_calls_confusion" },
    ],
    revealNote: "Row 01 builds 'A' then 'B', println jumps the cursor to row 02, then 'C' then 'D' extend row 02.",
    concept: "mixed_prints_trace_fluent" },

  { round: 10, type: "command", sourceTemplate: ["<slot:call1>", "<slot:call2>"],
    mission: "Produce EXACTLY: Hello, world!  on ONE line.",
    slots: [{ id: "call1" }, { id: "call2" }],
    cartridges: [
      { code: 'System.out.print("Hello, ");', correct: true, slotId: "call1" },
      { code: 'System.out.print("world!");', correct: true, slotId: "call2" },
      { code: 'System.out.println("Hello, ");', tag: "print_adds_newline_belief", slotId: "call1" },
      { code: 'System.out.println("world!");', tag: "print_adds_newline_belief", slotId: "call2" },
    ],
    expectedLog: "Hello, world!",
    revealNote: "Two whispers on one line — a conversation building a sentence character by character.",
    concept: "command_multi_print_one_line" },

  { round: 11, type: "command", sourceTemplate: ["<slot:call1>"],
    mission: "Produce TWO lines from ONE print call: hi (row 01) / bit (row 02).",
    slots: [{ id: "call1" }],
    cartridges: [
      { code: 'System.out.print("hi\\nbit");', correct: true },
      { code: 'System.out.print("hi bit");', tag: "no_newline_used" },
      { code: 'System.out.println("hi bit");', tag: "println_instead_of_newline_char" },
      { code: 'System.out.print("hibit");', tag: "no_separator" },
    ],
    expectedLog: "hi⏎bit",
    revealNote: "The single whisper carries a \\n mid-string; the cursor breaks at the \\n and 'bit' completes on row 02.",
    concept: "command_escape_newline" },

  { round: 12, type: "command", decl: "int count = 3;", sourceTemplate: ["<slot:arg1_call>", "<slot:arg2_call>"],
    mission: "Produce EXACTLY: You have 3 messages.  on ONE line (cursor jumps to row 02 after).",
    slots: [{ id: "arg1_call" }, { id: "arg2_call" }],
    cartridges: [
      { code: 'System.out.print("You have ");', slotId: "arg1_call", correct: true },
      { code: 'System.out.println(count + " messages.");', slotId: "arg2_call", correct: true },
      { code: 'System.out.print("You have " + count);', slotId: "arg1_call", correct: true, alsoCorrect: true },
      { code: 'System.out.println(" messages.");', slotId: "arg2_call", correct: true, alsoCorrect: true },
      { code: 'System.out.print("You have count messages.");', slotId: "arg1_call", tag: "variable_as_literal_belief" },
      { code: 'System.out.println("count messages.");', slotId: "arg2_call", tag: "variable_as_literal_belief" },
      { code: "System.out.print(count);", slotId: "arg1_call", tag: "missing_string_context" },
      { code: "System.out.println(count);", slotId: "arg2_call", tag: "missing_string_context" },
    ],
    expectedLog: "You have 3 messages.",
    revealNote: "Two whispers on ONE line, then a println jumps the cursor down. Either fragment may carry the variable.",
    postMissionNote: "print, then println — a phrase, then a newline. The classic pattern for building formatted output line by line. You'll use this every day.",
    concept: "command_print_then_println" },
];

const MISCONCEPTION_FEEDBACK = {
  print_adds_newline_belief: "The log tells the tale — the cursor DIDN'T jump! print() writes and stops. Only println() breaks the line. That 'ln' at the end of println is the whole difference.",
  print_stacks_on_new_lines_belief: "Two prints, one line — always. Consecutive print() calls build a single row from left to right. If you want lines, mix in println() where you want the break.",
  print_no_arg_legal_belief: "The compile-error stamp is the proof — print() has NO overload for zero arguments. That asymmetry is Java's, not yours. For blank lines, reach for println().",
  escape_newline_confusion: "'\\n' inside a String IS a newline character — print() didn't add one, the String CONTAINS one. Watch it break the line the moment the cursor reaches it.",
  newline_prints_literal_slash_n_belief: "The backslash is Java's escape signal — it tells the compiler 'the next character has a special meaning.' \\n means 'newline character.' It never prints as a literal backslash-n.",
  print_prepends_space_belief: "print() adds NOTHING extra — not spaces, not newlines, not anything. What you pass is exactly what lands. If you want a space, put one in the String.",
  println_no_newline_belief: "Trust the pattern — println() always jumps the cursor. Only print() rests the cursor at end-of-text.",
  cursor_hidden_after_print_belief: "The cursor is never hidden — it's the visible block that lives at end-of-text after print(), waiting for the next call.",
  cursor_hidden_after_println_belief: "The cursor is never hidden — it moves to the fresh row and keeps blinking there.",
  cursor_resets_belief: "The cursor NEVER goes backward. Each call adds forward — no rewinding, no jumping back to row 01.",
  mixed_calls_confusion: "Trace it slowly, call by call: print adds to the current row, println adds to the current row THEN jumps down.",
  variable_as_literal_belief: "Inside quotes, a variable's name is just letters. Without quotes, it becomes the value the variable holds. This trap is the same in print as in println.",
  quotes_print_belief: "The quotes are wrapping paper — they mark where the String starts and ends, but they NEVER travel to the log.",
  second_overwrites_belief: "The log doesn't erase — it extends. Every print() call adds MORE text; nothing gets overwritten.",
  print_requires_special_type_belief: "That argument is a perfectly valid String literal — no error here.",
  returns_null_belief: "print() with no argument isn't a null return — it's a compile error. The call doesn't even run.",
  no_newline_used: "One call, one line — no \\n in your String. To break inside a single call, insert the newline character yourself.",
  println_instead_of_newline_char: "Close — but println pushes the cursor DOWN AFTER the text, not IN THE MIDDLE. To split 'hi' and 'bit' inside one call, use \\n.",
  no_separator: "The characters ran together with nothing between them — check the String content against the mission's expected text.",
  missing_string_context: "The whisper delivered just the number, not the phrase. Wrap the value in a String context so it becomes part of the sentence.",
  method_name_case_insensitive_belief: "Method names are exact — always. A capitalized print/println is a different (nonexistent) method. Java refuses at compile time.",
  timeout: "Trust the pattern and commit.",
};

export class Level40Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level40Scene" });
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
    this.rows = [""];
    this.cursorRowIdx = 0;
    this.logRowObjs = [];
    this.inputLocked = true;
    this.gameEnded = false;
    this._alive = true;
    this._bubble = null;
    this.slotContents = {};
    this.slotDefs = {};
    this.cartridges = [];
    this._dragHoverSlotKey = null;
    this._commandFirstFail = true;
    this._firstNewlineAnnotationShown = false;
    this._firstEscapeAnnotationShown = false;
    this._firstCursorAnnotationShown = false;
  }

  preload() {}

  create() {
    this._alive = true;
    this.events.once("shutdown", () => { this._alive = false; });

    const cam = this.cameras.main;
    const zoom = Math.min(this.scale.width / W, this.scale.height / H);
    cam.setZoom(zoom);
    cam.centerOn(W / 2, H / 2);
    cam.setBackgroundColor("#0a0817");

    try { GameManager.incrementAttempt(39); } catch (_) {}

    this.createParticleTexture();
    this.createBackground();
    this.createStudioFloor();
    this.createWhisperBooth();
    this.createWhisperDesk();
    this.createBroadcastLog();
    this.createSourceDisplay();
    this.createHUD();
    this.createExpressionMonitor();
    this.createParticles();
    this.createBit();
    this.setupDragEvents();

    cam.fadeIn(700, 3, 3, 5);
    this.checkTutorial();
  }

  update(time, delta) {
    this.updateParticles(time, delta);
    this.updateMicLED(time);
    this.updateRecDot(time);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // BACKGROUND / BOOTH
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l40_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l40_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x0a0817).setDepth(0);
  }

  createStudioFloor() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x0a0812, 1);
    g.fillRect(0, 635, W, 85);
    g.lineStyle(1, 0x2e2440, 1);
    g.lineBetween(0, 635, W, 635);
    const cam = this.add.graphics().setDepth(2);
    cam.lineStyle(1, 0x3d4450, 0.35);
    cam.strokeRoundedRect(1163, 655, 34, 22, 3);
    cam.strokeCircle(1163, 666, 8);
    this.recDot = this.add.circle(1190, 653, 2, 0xe53935, 0.5).setDepth(3);
  }

  updateRecDot(time) {
    if (!this.recDot) return;
    this.recDot.setAlpha(Math.floor(time / 900) % 2 === 0 ? 0.5 : 0.1);
  }

  createWhisperBooth() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x0d0a1a, 1);
    g.lineStyle(2, 0x2e2440, 1);
    g.fillRoundedRect(20, 190, 240, 390, 14);
    g.strokeRoundedRect(20, 190, 240, 390, 14);

    g.lineStyle(1, 0x2e2440, 0.35);
    g.fillStyle(0x1a1428, 0.5);
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 3; col++) {
        const x = 55 + col * 68 + (row % 2 === 1 ? 34 : 0);
        const y = 220 + row * 62;
        this._drawHex(g, x, y, 24);
      }
    }

    const mic = this.add.graphics().setDepth(2);
    mic.fillStyle(0x12101c, 1);
    mic.lineStyle(1.5, 0x546e7a, 1);
    mic.fillRoundedRect(123, 237, 34, 46, 6);
    mic.strokeRoundedRect(123, 237, 34, 46, 6);
    mic.lineStyle(1, C_VIOLET, 0.5);
    mic.strokeEllipse(140, 255, 40, 26);
    mic.lineBetween(140, 283, 140, 300);
    this.micLed = this.add.circle(140, 295, 3, 0xe53935, 0.4).setDepth(3);

    const lamp = this.add.graphics().setDepth(2);
    lamp.lineStyle(2, 0x546e7a, 0.6);
    lamp.lineBetween(220, 400, 220, 360);
    lamp.lineBetween(220, 360, 235, 350);
    lamp.fillStyle(HEX_GOLD ? 0xffd740 : 0xffd740, 0.03);
    lamp.fillEllipse(235, 380, 60, 60);

    const plaque = this.add.graphics().setDepth(2);
    plaque.fillStyle(0x0d0a1a, 1);
    plaque.lineStyle(1, 0xe53935, 1);
    plaque.fillRoundedRect(50, 157, 100, 22, 4);
    plaque.strokeRoundedRect(50, 157, 100, 22, 4);
    this.add.text(100, 168, "RECORDING", { font: "bold 10px Arial", color: "#e53935" }).setOrigin(0.5).setAlpha(0.35).setDepth(3);
  }

  _drawHex(g, x, y, r) {
    g.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i;
      const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
      if (i === 0) g.moveTo(px, py); else g.lineTo(px, py);
    }
    g.closePath();
    g.fillPath();
    g.strokePath();
  }

  updateMicLED(time) {
    if (!this.micLed) return;
    if (this._micFlared) return;
    this.micLed.setAlpha(0.3 + Math.sin(time * 0.002) * 0.15);
  }

  flareMicLED() {
    this._micFlared = true;
    this.micLed.setFillStyle(C_RED, 1);
    this.time.delayedCall(800, () => { this._micFlared = false; this.micLed.setFillStyle(0xe53935, 0.4); });
  }

  createParticles() {
    this.ambient = [];
    for (let i = 0; i < 8; i++) {
      const p = this.add.circle(Phaser.Math.Between(0, W), Phaser.Math.Between(150, 630), 1, C_GOLD, Phaser.Math.FloatBetween(0.03, 0.06)).setDepth(2);
      this.ambient.push(p);
    }
  }

  updateParticles(time, delta) {
    if (!this.ambient) return;
    const step = 0.018 * (delta / 16.7);
    this.ambient.forEach((p, i) => {
      p.y -= step;
      p.x += Math.sin(time * 0.0006 + i) * 0.03;
      if (p.y < 150) { p.y = 630; p.x = Phaser.Math.Between(0, W); }
    });
  }

  // ══════════════════════════════════════════════════════════════
  // WHISPER DESK
  // ══════════════════════════════════════════════════════════════

  createWhisperDesk() {
    const g = this.add.graphics().setDepth(4);
    g.fillStyle(0x0d1117, 1);
    g.fillRoundedRect(DESK_X0, DESK_Y0, DESK_X1 - DESK_X0, DESK_Y1 - DESK_Y0, 10);
    g.lineStyle(2, C_VIOLET, 1);
    g.strokeRoundedRect(DESK_X0, DESK_Y0, DESK_X1 - DESK_X0, DESK_Y1 - DESK_Y0, 10);
    this.add.text(DESK_X0 + 10, DESK_Y0 + 8, "WHISPER TX", { font: "bold 10px Courier New", color: HEX_VIOLET }).setDepth(5);

    const mg = this.add.graphics().setDepth(4);
    mg.fillStyle(0x0a0e14, 1);
    mg.fillRoundedRect(MARQUEE_X0, MARQUEE_Y - 30, MARQUEE_X1 - MARQUEE_X0, 60, 6);
    mg.lineStyle(1, 0x4fc3f7, 0.4);
    mg.strokeRoundedRect(MARQUEE_X0, MARQUEE_Y - 30, MARQUEE_X1 - MARQUEE_X0, 60, 6);

    this.bulbs = [];
    for (let i = 0; i < 4; i++) {
      const bulb = this.add.circle(MARQUEE_X0 + 20 + i * 60, MARQUEE_Y - 34, 2, 0x3d4450).setDepth(5);
      this.bulbs.push(bulb);
    }

    const emitter = this.add.graphics().setDepth(4);
    emitter.lineStyle(1.5, 0x4fc3f7, 1);
    emitter.strokeCircle(EMITTER_X, EMITTER_Y, 12);
    emitter.fillStyle(0x0a0e14, 1);
    emitter.fillCircle(EMITTER_X, EMITTER_Y, 8);

    this.marqueeContainer = this.add.container(0, 0).setDepth(6);
    this.antenna = { x: EMITTER_X, y: EMITTER_Y };
  }

  startBulbChase() {
    this.stopBulbChase();
    let i = 0;
    this._bulbEvent = this.time.addEvent({ delay: 100, loop: true, callback: () => { this.bulbs.forEach((b, idx) => b.setFillStyle(idx === i % this.bulbs.length ? C_GOLD : 0x3d4450)); i++; } });
  }
  stopBulbChase() {
    if (this._bulbEvent) { this._bulbEvent.remove(); this._bulbEvent = null; }
    this.bulbs.forEach((b) => b.setFillStyle(0x3d4450));
  }

  clearMarquee() { this.marqueeContainer.removeAll(true); }

  _typeColor(type) {
    switch (type) {
      case "string": return HEX_CYAN;
      case "int": return HEX_GOLD;
      case "newline": return HEX_PURPLE;
      default: return "#e0e0e0";
    }
  }
  _typeColorInt(type) {
    switch (type) {
      case "string": return C_CYAN;
      case "int": return C_GOLD;
      case "newline": return C_PURPLE;
      default: return 0xe0e0e0;
    }
  }

  /** Renders text into the marquee char by char, rendering the literal
   * two-char sequence backslash-n as one atomic magenta glyph (visual only
   * — the underlying evaluated value already holds a real newline char). */
  async assembleArgumentDisplay(displayText, isString) {
    this.clearMarquee();
    this.startBulbChase();
    const cy = MARQUEE_Y;
    let x = MARQUEE_X0 + 10;
    if (isString) { const q = this.add.text(x, cy, '"', { font: "bold 16px Courier New", color: HEX_GRAY }).setOrigin(0, 0.5); this.marqueeContainer.add(q); x += q.width; }
    let i = 0;
    while (i < displayText.length) {
      if (!this._alive) return;
      let glyph = displayText[i], color = isString ? HEX_CYAN : HEX_GOLD, adv = 1;
      if (displayText[i] === "\\" && displayText[i + 1] === "n") { glyph = "\\n"; color = HEX_MAGENTA; adv = 2; }
      else if (displayText[i] === " " && isString) { glyph = "␣"; color = HEX_MAGENTA; }
      const t = this.add.text(x, cy, glyph, { font: "bold 17px Courier New", color }).setOrigin(0, 0.5).setAlpha(0);
      this.marqueeContainer.add(t);
      x += t.width;
      this.tweens.add({ targets: t, alpha: 1, duration: 70 });
      if (glyph === "\\n" && !this._firstEscapeAnnotationShown) {
        this._firstEscapeAnnotationShown = true;
        this.createAnnotation(x, MARQUEE_Y - 40, "newline", HEX_MAGENTA);
      }
      await this.delay(28);
      i += adv;
    }
    if (isString) { const q = this.add.text(x, cy, '"', { font: "bold 16px Courier New", color: HEX_GRAY }).setOrigin(0, 0.5); this.marqueeContainer.add(q); }
    await this.delay(250);
  }

  async showNoArgumentError() {
    this.clearMarquee();
    const t = this.add.text(MARQUEE_X0 + (MARQUEE_X1 - MARQUEE_X0) / 2, MARQUEE_Y, "NO ARGUMENT", { font: "bold 14px Arial", color: HEX_RED }).setOrigin(0.5).setAlpha(0);
    this.marqueeContainer.add(t);
    this.tweens.add({ targets: t, alpha: 1, duration: 150 });
    this.tweens.add({ targets: this.marqueeContainer, x: 5, duration: 35, yoyo: true, repeat: 4, onComplete: () => { this.marqueeContainer.x = 0; } });
    this.screenShake(0.004, 150);
    this.flareMicLED();
    await this.delay(500);
    this.clearMarquee();
  }

  // ══════════════════════════════════════════════════════════════
  // BROADCAST LOG + CURSOR
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

    this.rows = [""];
    this.cursorRowIdx = 0;
    this.logRowObjs = [];
    this.renderLogFromScratch();
    this.createCursorBlock();
  }

  flashLed() {
    this.logLed.setFillStyle(C_GREEN_BRIGHT, 1);
    this.time.delayedCall(300, () => { if (this.logLed.active) this.logLed.setFillStyle(C_RED, 1); });
  }

  createCursorBlock() {
    this.cursorGlow = this.add.rectangle(0, 0, 16, 26, C_CYAN, 0.15);
    this.cursorBlock = this.add.rectangle(0, 0, 12, 22, C_CYAN, 0.75);
    this.logLayer.add([this.cursorGlow, this.cursorBlock]);
    this.tweens.add({ targets: [this.cursorBlock, this.cursorGlow], alpha: 0.1, duration: 700, yoyo: true, repeat: -1 });
    this.updateCursorVisualPosition();
  }

  _rowY(rowIdx) { return LOG_CONTENT_Y0 + 18 + rowIdx * ROW_H; }

  updateCursorVisualPosition() {
    if (!this.logRowObjs[this.cursorRowIdx]) return;
    const rowText = this.logRowObjs[this.cursorRowIdx].textT;
    const x = LOG_TEXT_X + rowText.width + 2;
    const y = this._rowY(this.cursorRowIdx);
    this.cursorBlock.setPosition(x, y);
    this.cursorGlow.setPosition(x, y);
  }

  cursorSparkle() {
    const p = this.add.particles(this.cursorBlock.x, this.cursorBlock.y, "l40_dot", {
      speed: { min: 30, max: 70 }, angle: { min: 0, max: 360 }, scale: { start: 0.5, end: 0 }, lifespan: 200,
      tint: [C_CYAN], emitting: false,
    }).setDepth(20);
    this.logLayer.add(p);
    p.explode(4);
    this.time.delayedCall(300, () => p.destroy());
  }

  renderLogFromScratch() {
    this.logRowObjs.forEach((r) => { r.numT.destroy(); r.textT.destroy(); });
    this.logRowObjs = [];
    this.rows.forEach((rowStr, i) => {
      const y = this._rowY(i);
      const numT = this.add.text(LOG_X + 12, y, String(i + 1).padStart(2, "0"), { font: "11px Courier New", color: "#3d4450" }).setOrigin(0, 0.5);
      const textT = this.add.text(LOG_TEXT_X, y, this._displayRow(rowStr), { font: "bold 17px Courier New", color: HEX_CYAN }).setOrigin(0, 0.5);
      this.logLayer.add([numT, textT]);
      this.logRowObjs.push({ numT, textT });
    });
  }

  _displayRow(rowStr) {
    return rowStr.replace(/ /g, "␣");
  }

  ensureRow(idx) {
    while (this.logRowObjs.length <= idx) {
      const i = this.logRowObjs.length;
      const y = this._rowY(i);
      const numT = this.add.text(LOG_X + 12, y, String(i + 1).padStart(2, "0"), { font: "11px Courier New", color: "#3d4450" }).setOrigin(0, 0.5);
      const textT = this.add.text(LOG_TEXT_X, y, "", { font: "bold 17px Courier New", color: HEX_CYAN }).setOrigin(0, 0.5).setAlpha(0);
      this.tweens.add({ targets: textT, alpha: 1, duration: 150 });
      this.logLayer.add([numT, textT]);
      this.logRowObjs.push({ numT, textT });
    }
  }

  /** Types `text` onto the log starting at the current cursor position,
   * breaking rows at any real newline character. Ground truth: this.rows. */
  async typeAtCursor(text, styleType) {
    const color = this._typeColor(styleType);
    for (const ch of text) {
      if (!this._alive) return;
      if (ch === "\n") {
        if (!this._firstEscapeAnnotationShown) {
          this._firstEscapeAnnotationShown = true;
          this.createAnnotation(this.cursorBlock.x, this.cursorBlock.y - 30, "the \\n is the newline", HEX_MAGENTA);
        }
        this.cursorSparkle();
        this.rows.push("");
        this.cursorRowIdx++;
        this.ensureRow(this.cursorRowIdx);
        this.updateCursorVisualPosition();
        await this.delay(60);
        continue;
      }
      this.rows[this.cursorRowIdx] += ch;
      this.logRowObjs[this.cursorRowIdx].textT.setColor(color).setText(this._displayRow(this.rows[this.cursorRowIdx]));
      this.updateCursorVisualPosition();
      await this.delay(22);
    }
    this.cursorSparkle();
  }

  async forceNewlineAfterPrintln() {
    this.rows.push("");
    this.cursorRowIdx++;
    this.ensureRow(this.cursorRowIdx);
    this.updateCursorVisualPosition();
    this.cursorSparkle();
    if (!this._firstNewlineAnnotationShown) {
      this._firstNewlineAnnotationShown = true;
      this.createAnnotation(LOG_X + LOG_W / 2, LOG_Y + LOG_H + 12, "println always adds a newline", HEX_PURPLE);
    }
    await this.delay(80);
  }

  showCursorAnnotation() {
    if (this._firstCursorAnnotationShown) return;
    this._firstCursorAnnotationShown = true;
    this.createAnnotation(this.cursorBlock.x, this.cursorBlock.y - 34, "cursor rests HERE", HEX_CYAN);
  }

  clearLog() {
    return new Promise((res) => {
      const wipe = this.add.rectangle(LOG_X + LOG_W / 2, LOG_CONTENT_Y0, LOG_W, 0, 0x08111c, 1).setOrigin(0.5, 0);
      this.logLayer.add(wipe);
      this.tweens.add({
        targets: wipe, height: LOG_Y + LOG_H - LOG_CONTENT_Y0, duration: 400, ease: "Cubic.easeIn",
        onComplete: () => {
          this.logRowObjs.forEach((r) => { r.numT.destroy(); r.textT.destroy(); });
          this.logRowObjs = [];
          wipe.destroy();
          this.rows = [""];
          this.cursorRowIdx = 0;
          this.renderLogFromScratch();
          this.updateCursorVisualPosition();
          res();
        },
      });
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
    const re = /(\\n)|(\bSystem\.out\b)|(\.)|(\bprintln\b|\bprint\b)|("(?:[^"\\]|\\.)*")|([(){};=+])/g;
    let last = 0, m;
    const plain = (t) => t && tokens.push({ t, c: "#e0e0e0" });
    while ((m = re.exec(line))) {
      if (m.index > last) plain(line.slice(last, m.index));
      if (m[1]) tokens.push({ t: m[1], c: HEX_MAGENTA });
      else if (m[2]) tokens.push({ t: m[2], c: "#4caf50" });
      else if (m[3]) tokens.push({ t: m[3], c: HEX_GRAY });
      else if (m[4]) tokens.push({ t: m[4], c: HEX_GOLD });
      else if (m[5]) {
        const inner = m[5];
        const parts = inner.split(/(\\n)/);
        parts.forEach((p) => { if (p === "\\n") tokens.push({ t: p, c: HEX_MAGENTA }); else if (p) tokens.push({ t: p, c: HEX_CYAN }); });
      } else if (m[6]) tokens.push({ t: m[6], c: HEX_MAGENTA });
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
      const measured = tokens.map((t) => { const tmp = this.add.text(0, 0, t.t, { font: `${fontSize}px Courier New` }); const w = tmp.width; tmp.destroy(); return w; });
      const totalW = measured.reduce((a, b) => a + b, 0);
      let x = 420 - totalW / 2;
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
    g.fillRoundedRect(W / 2 - 200, 10, 400, 44, 8);
    g.lineStyle(1, 0x2a2a4a, 1);
    g.strokeRoundedRect(W / 2 - 200, 10, 400, 44, 8);
    this.monitorText = this.add.text(W / 2, 32, "", { font: "13px Courier New", color: "#e0e0e0" }).setOrigin(0.5).setDepth(51);
  }

  updateExpressionMonitor(text) {
    this.monitorText.setText(text);
    this.monitorText.setFontSize(this.monitorText.width > 380 ? 11 : 13);
  }

  showCompileErrorStamp() {
    const stamp = this.add.text(420, SRC_Y + 40, "COMPILE ERROR", { font: "bold 22px Arial", color: HEX_RED }).setOrigin(0.5).setDepth(80).setScale(1.6).setAngle(-6).setAlpha(0);
    this.sourceContainer.add(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 200 });
    this.screenShake(0.004, 160);
    this.time.delayedCall(1200, () => { if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 220, onComplete: () => stamp.destroy() }); });
  }

  // ══════════════════════════════════════════════════════════════
  // HUD
  // ══════════════════════════════════════════════════════════════

  createHUD() {
    const g = this.add.graphics().setDepth(49);
    g.fillStyle(0x0a0817, 0.93);
    g.fillRect(0, 0, W, 64);
    g.lineStyle(1, 0x2e2440, 1);
    g.lineBetween(0, 64, W, 64);

    this.add.text(20, 14, "THE WHISPER BOOTH", { font: "bold 15px Arial", color: "#b0bec5" }).setDepth(50);
    this.add.text(20, 32, "Accretion Phase — Output Methods: print()", { font: "11px Arial", color: "#546e7a" }).setDepth(50);

    this.add.text(1060, 8, "SCORE", { font: "9px Arial", color: "#546e7a" }).setDepth(50);
    this.scoreText = this.add.text(1060, 20, "0", { font: "bold 18px Arial", color: "#ffffff" }).setDepth(50);
    this.comboText = this.add.text(1060, 42, "×1", { font: "bold 12px Arial", color: HEX_GOLD }).setDepth(50);

    this.lifeIcons = [];
    for (let i = 0; i < 3; i++) {
      const lg = this.add.graphics({ x: 1150 + i * 26, y: 24 }).setDepth(50);
      lg.lineStyle(2, C_VIOLET, 1);
      lg.strokeRoundedRect(-4, -6, 8, 12, 2);
      lg.lineBetween(0, 6, 0, 9);
      this.lifeIcons.push(lg);
    }
  }

  // ══════════════════════════════════════════════════════════════
  // BIT — whisper voice variant
  // ══════════════════════════════════════════════════════════════

  createBit() {
    const c = this.add.container(140, 440).setDepth(60);
    const g = this.add.graphics();
    g.lineStyle(2, 0x78909c, 1);
    g.lineBetween(0, -14, 0, -26);
    g.fillStyle(0x37474f, 1);
    g.fillRoundedRect(-18, -14, 36, 30, 9);
    const tip = this.add.circle(0, -26, 3, C_GOLD);
    const eye = this.add.circle(0, -2, 7, C_CYAN);
    const pupil = this.add.circle(0, -2, 2.5, 0xffffff);
    const headset = this.add.graphics();
    headset.lineStyle(2, 0x78909c, 1);
    headset.beginPath();
    headset.arc(0, -8, 16, Phaser.Math.DegToRad(200), Phaser.Math.DegToRad(340), false);
    headset.strokePath();
    const rim = this.add.graphics();
    rim.lineStyle(1, C_GOLD, 0.2);
    rim.lineBetween(16, -14, 16, 12);
    c.add([g, eye, pupil, headset, tip, rim]);
    this.tweens.add({ targets: tip, alpha: 0.3, duration: 900, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: c, y: "+=2", duration: 2000, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
    this.bit = c;
  }

  bitSay(text) {
    this.hideBubble();
    const inner = this.add.text(0, 0, text, { font: "13px Arial", color: "#e0e0e0", wordWrap: { width: 340 } });
    const bw = Math.min(inner.width, 340) + 30, bh = inner.height + 24;
    inner.setText("");
    const bx = Phaser.Math.Clamp(560, 20, W - bw - 20);
    const by = Phaser.Math.Clamp(this.bit.y - bh - 40, 80, H - bh - 20);
    const c = this.add.container(bx, by).setDepth(61).setAlpha(0).setScale(0.7);
    const g = this.add.graphics();
    g.fillStyle(0x1a1a2e, 0.97);
    g.fillRoundedRect(0, 0, bw, bh, 10);
    g.lineStyle(1.5, C_VIOLET, 1);
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
    const t = this.add.text(x, y, text, { font: "italic 11px Arial", color: colorHex }).setOrigin(0.5).setDepth(70).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 200 });
    this.time.delayedCall(1200, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() }); });
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
    const p = this.add.particles(x, y, "l40_dot", {
      speed: { min: 80, max: 240 }, angle: { min: 0, max: 360 }, scale: { start: 0.9, end: 0 }, lifespan: 500,
      tint: [C_CYAN, C_GOLD, C_GREEN_BRIGHT, C_VIOLET, 0xffffff], emitting: false,
    }).setDepth(75);
    p.explode(count);
    this.time.delayedCall(900, () => p.destroy());
  }

  // ══════════════════════════════════════════════════════════════
  // EVALUATOR — honest, extends L37-39 with \n escape + print()-no-arg
  // ══════════════════════════════════════════════════════════════

  _parseDecls(declSource) {
    if (!declSource) return {};
    const decls = {};
    const lines = Array.isArray(declSource) ? declSource : declSource.split("\n");
    lines.forEach((line) => {
      const m = line.match(/^(int|double|boolean|String)\s+(\w+)\s*=\s*(.+);$/);
      if (!m) return;
      const [, type, name, rawValue] = m;
      let value;
      const rv = rawValue.trim();
      if (type === "int") value = parseInt(rv, 10);
      else if (type === "double") value = parseFloat(rv);
      else if (type === "boolean") value = rv === "true";
      else value = rv.replace(/^"|"$/g, "");
      decls[name] = { value, type: type === "String" ? "string" : type };
    });
    return decls;
  }

  _tokenizeExpr(expr) {
    const tokens = [];
    let cur = "", inQuotes = false, parenDepth = 0;
    for (let i = 0; i < expr.length; i++) {
      const ch = expr[i];
      if (ch === '"' && expr[i - 1] !== "\\") { inQuotes = !inQuotes; cur += ch; continue; }
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
    if (/^".*"$/.test(tok)) return { value: tok.slice(1, -1).replace(/\\n/g, "\n"), type: "string", ok: true };
    if (/^-?\d+\.\d+$/.test(tok)) return { value: parseFloat(tok), type: "double", ok: true };
    if (/^-?\d+$/.test(tok)) return { value: parseInt(tok, 10), type: "int", ok: true };
    if (tok === "true" || tok === "false") return { value: tok === "true", type: "boolean", ok: true };
    if (/^[A-Za-z_]\w*$/.test(tok)) {
      if (decls && Object.prototype.hasOwnProperty.call(decls, tok)) return { value: decls[tok].value, type: decls[tok].type, ok: true };
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
    return { ok: true, value: acc.value, type: acc.type };
  }

  /** Evaluates one print/println call's argument. Returns {ok, isEmpty,
   * text, styleType, displayText} — displayText preserves the literal
   * backslash-n (for marquee typing animation); text has it converted to
   * a real newline character (ground truth for the log). */
  evaluateArg(method, argExpr, decls) {
    const trimmed = (argExpr || "").trim();
    if (trimmed === "") {
      if (method === "print") return { ok: false, noArgPrint: true };
      return { ok: true, isEmpty: true, text: "", styleType: "newline", displayText: "" };
    }
    const result = this._evalExprFold(trimmed, decls);
    if (!result.ok) return { ok: false };
    const text = this._displayValue(result.value, result.type);
    const displayText = result.type === "string" ? this._rawDisplayFor(trimmed, decls) : text;
    return { ok: true, isEmpty: false, text, styleType: result.type, displayText };
  }

  /** For the marquee's visual typing, we want to show the literal \n
   * glyph rather than an actual line break inside the marquee widget —
   * recompute a display-only version preserving the escape sequence. */
  _rawDisplayFor(expr, decls) {
    const tokens = this._tokenizeExpr(expr);
    const parts = tokens.map((tok) => {
      if (/^".*"$/.test(tok)) return tok.slice(1, -1);
      const ev = this._evalToken(tok, decls);
      return ev.ok ? this._displayValue(ev.value, ev.type) : tok;
    });
    return parts.join("");
  }

  _methodOf(code) {
    if (code.includes("println")) return "println";
    if (code.includes("print")) return "print";
    return null;
  }

  // ══════════════════════════════════════════════════════════════
  // WHISPER TRANSMISSION — reveal, shared by all rounds
  // ══════════════════════════════════════════════════════════════

  async fireCall(method, argExpr, decls) {
    const evalResult = this.evaluateArg(method, argExpr, decls);
    if (!evalResult.ok) {
      if (evalResult.noArgPrint) await this.showNoArgumentError();
      else {
        this.clearMarquee();
        const t = this.add.text(MARQUEE_X0 + 100, MARQUEE_Y, "?", { font: "bold 18px Courier New", color: HEX_RED }).setOrigin(0.5);
        this.marqueeContainer.add(t);
        this.screenShake(0.004, 150);
        this.flareMicLED();
        await this.delay(400);
        this.clearMarquee();
      }
      this.showCompileErrorStamp();
      return evalResult;
    }

    const isString = evalResult.styleType === "string" || evalResult.styleType === "newline";
    await this.assembleArgumentDisplay(evalResult.isEmpty ? "" : evalResult.displayText, isString);
    if (!this._alive) return evalResult;
    await this.launchAndLand(evalResult, method);
    return evalResult;
  }

  async launchAndLand(evalResult, method) {
    const color = this._typeColorInt(evalResult.styleType);
    const capsule = this.add.circle(MARQUEE_X0 + (MARQUEE_X1 - MARQUEE_X0) / 2, MARQUEE_Y, 7, color, 0.9).setDepth(40);
    this.tweens.add({ targets: this.marqueeContainer, scale: 0.4, alpha: 0, duration: 140 });
    await this.delay(140);
    if (!this._alive) return;
    const startX = this.antenna.x, startY = this.antenna.y;
    capsule.setPosition(startX, startY);
    const targetX = this.cursorBlock.x, targetY = this.cursorBlock.y;
    const beam = this.add.rectangle(startX, startY, 0, 2, color, 0.5).setOrigin(0, 0.5).setDepth(39);
    await new Promise((res) => {
      this.tweens.add({
        targets: capsule, x: targetX, y: targetY, duration: 300, ease: "Cubic.easeInOut",
        onUpdate: () => { beam.width = Math.abs(capsule.x - startX); beam.x = startX; beam.y = capsule.y; },
        onComplete: res,
      });
    });
    this.tweens.add({ targets: beam, alpha: 0, duration: 200, onComplete: () => beam.destroy() });
    capsule.destroy();
    this.flashLed();

    if (evalResult.isEmpty && method === "print") {
      // print("") — nothing types, cursor doesn't move
      this.marqueeContainer.setScale(1).setAlpha(1);
      await this.delay(100);
      return;
    }

    await this.typeAtCursor(evalResult.text, evalResult.styleType);
    if (method === "println") await this.forceNewlineAfterPrintln();
    this.marqueeContainer.setScale(1).setAlpha(1);
    await this.delay(100);
  }

  async runSnippetReveal(sourceLines, decls) {
    for (const line of sourceLines) {
      if (!this._alive) return;
      const method = this._methodOf(line);
      if (!method) continue;
      const m = line.match(/print(?:ln)?\(([^)]*)\)/);
      const argExpr = m ? m[1] : "";
      const result = await this.fireCall(method, argExpr, decls);
      if (!result.ok) return result;
      await this.delay(100);
    }
    return { ok: true };
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
    await this.bitSay("Welcome to the Whisper Booth, Broadcaster. Up in the tower, you SHOUTED — every println was its own line, its own moment. Down here, we speak quietly. Words land where the cursor is. No auto-newline. Same conversation, same line.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();

    this.updateSourceDisplay(['System.out.print("hello ");']);
    await this.fireCall("print", '"hello "', {});
    if (!A()) return;
    this.showCursorAnnotation();
    await this.bitSay("See the cursor? It stopped RIGHT where 'hello ' ended. No newline. No jump. It's just... waiting. Watch what happens next.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();

    this.updateSourceDisplay(['System.out.print("hello ");', 'System.out.print("world!");']);
    await this.fireCall("print", '"world!"', {});
    if (!A()) return;
    await this.bitSay("Two calls — one line. print() extends whatever's already there. The cursor is the connective tissue. This is the whole idea, Broadcaster.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();

    await this.clearLog();
    this.updateSourceDisplay(['System.out.print("goodbye");']);
    await this.fireCall("print", '"goodbye"', {});
    if (!A()) return;
    this.updateSourceDisplay(['System.out.print("goodbye");', "System.out.println();"]);
    await this.fireCall("println", "", {});
    if (!A()) return;
    await this.bitSay("There it is — println() flipped the cursor to the NEXT line. Anything you print AFTER this will start there. Mixing print and println is how programmers control exactly what stays on one line and what breaks to the next. Now for a tricky one...");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();

    await this.clearLog();
    this.updateSourceDisplay(['System.out.print("A\\nB");']);
    await this.fireCall("print", '"A\\nB"', {});
    if (!A()) return;
    await this.bitSay("The \\n character IS a newline — it lives INSIDE the String. print() doesn't add newlines, but if the String CONTAINS a \\n, the cursor obeys it. \\n is your escape hatch for making print() break lines from inside the argument.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();

    await this.clearLog();
    this.updateSourceDisplay(["System.out.print();"]);
    await this.fireCall("print", "", {});
    if (!A()) return;
    await this.bitSay("One last thing — print() DEMANDS an argument. Unlike println(), you can't call print() with empty parentheses. No overload, no forgiveness, straight compile error. If you want a blank line, that's what println() is for. Your microphone's live, Broadcaster — begin!");
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
    const decls = this._parseDecls(config.decl);
    this._roundDecls = decls;

    if (config.type === "predict" || config.type === "cursor") this.setupPredict(config, decls);
    else if (config.type === "command") this.setupCommand(config, decls);
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
    g.fillStyle(0x0d0a1a, 0.95);
    g.fillRoundedRect(-260, -40, 520, 80, 10);
    g.lineStyle(1, C_VIOLET, 0.5);
    g.strokeRoundedRect(-260, -40, 520, 80, 10);
    const badge = this.add.circle(-230, -10, 16, C_VIOLET);
    const badgeT = this.add.text(-230, -10, String(this.currentRound + 1), { font: "bold 14px Arial", color: "#0a0817" }).setOrigin(0.5);
    const t = this.add.text(-200, -10, promptText, { font: "14px Arial", color: "#e0e0e0", wordWrap: { width: 420 } }).setOrigin(0, 0.5);
    c.add([g, badge, badgeT, t]);
    this.tweens.add({ targets: c, alpha: 1, y: 490, duration: 250 });
    this.roundElements.push(c);
    return c;
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE A/B — PREDICT / CURSOR
  // ══════════════════════════════════════════════════════════════

  setupPredict(config, decls) {
    this.updateSourceDisplay(config.source);
    this.updateExpressionMonitor(config.source.join("  "));
    this.showQuestionCard(config.question);
    this.showOptionBubbles(config.options, config, decls);
  }

  showOptionBubbles(options, config, decls) {
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
        g.fillStyle(0x0d0a1a, 1);
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
        g.lineStyle(2, stroke, 1);
        g.strokeRoundedRect(-w / 2, -h / 2, w, h, 10);
      };
      draw(C_VIOLET);
      const label = opt.label || opt.value;
      const txt = this.add.text(0, 0, label, { font: "bold 13px Courier New", color: "#e0e0e0" }).setOrigin(0.5);
      if (txt.width > w - 16) txt.setFontSize(10);
      c.add([g, txt]);
      c.setSize(w, h);
      c.setInteractive({ useHandCursor: true });
      c.on("pointerover", () => { if (!this.inputLocked) draw(C_GOLD); });
      c.on("pointerout", () => { if (!this.inputLocked) draw(C_VIOLET); });
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
    this.roundAttempts++;
    const correct = opt.value === config.correct;
    const timeMs = Math.round(this.time.now - this.roundStartTime);
    this.logAttempt(config, correct, opt.value, opt.tag, timeMs);

    this.roundElements.filter((e) => e !== bubbleContainer).forEach((e) => e.disableInteractive && e.disableInteractive());
    const g = bubbleContainer.list[0];
    g.clear();
    g.fillStyle(0x0d0a1a, 1);
    g.fillRoundedRect(-130, -25, 260, 50, 10);
    g.lineStyle(2, correct ? C_GREEN_BRIGHT : C_RED, 1);
    g.strokeRoundedRect(-130, -25, 260, 50, 10);
    if (!correct) this.tweens.add({ targets: bubbleContainer, x: bubbleContainer.x + 5, duration: 40, yoyo: true, repeat: 4 });

    await this.delay(200);
    if (!this._alive) return;
    await this.runSnippetReveal(config.source, decls);

    if (config.type === "cursor") this.showCursorAnnotation();
    if (config.revealNote) this.createFloatingText(LOG_X + LOG_W / 2, LOG_Y + LOG_H + 30, config.revealNote, HEX_GRAY, "11px Arial", 2600);
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
      this.setupPredict(config, decls);
    }
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE D — COMMAND (drag cartridges)
  // ══════════════════════════════════════════════════════════════

  setupCommand(config, decls) {
    this.updateSourceDisplay(config.sourceTemplate.map((l) => l.replace(/<slot:\w+>/g, "____")));
    this.slotDefs = {};
    config.slots.forEach((s) => { this.slotDefs[s.id] = { id: s.id, capacity: 1, lineIndex: config.sourceTemplate.findIndex((l) => l.includes(`<slot:${s.id}>`)) }; });
    this.updateExpressionMonitor(config.mission);
    this.showQuestionCard(config.mission);
    this.createCartridgeTray(config);
    this._commandFirstFail = true;
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
      draw(C_VIOLET);
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
      c.on("pointerout", () => { if (!this.inputLocked) draw(C_VIOLET); });
      this.cartridges.push({ container: c, def, home });
      this.roundElements.push(c);
    });

    const btn = this.add.container(640, 660).setDepth(42);
    const bg = this.add.graphics();
    const bdraw = (enabled, hover) => {
      bg.clear();
      bg.fillStyle(enabled ? C_GREEN_BRIGHT : 0x2a2f36, hover && enabled ? 1 : 0.95);
      bg.fillRoundedRect(-70, -22, 140, 44, 10);
    };
    bdraw(false, false);
    const bt = this.add.text(0, 0, "WHISPER", { font: "bold 14px Arial", color: "#0a0817" }).setOrigin(0.5);
    btn.add([bg, bt]);
    btn.setSize(140, 44);
    btn.on("pointerover", () => { if (this._whisperReady) { bdraw(true, true); btn.setScale(1.03); } });
    btn.on("pointerout", () => { bdraw(this._whisperReady, false); btn.setScale(1); });
    btn.on("pointerdown", () => { if (this._whisperReady) this.onWhisperPressed(config); });
    this.whisperButton = { c: btn, draw: bdraw };
    this.roundElements.push(btn);
    this.disableWhisperButton();
  }

  enableWhisperButton() { this._whisperReady = true; this.whisperButton.draw(true, false); this.whisperButton.c.setInteractive({ useHandCursor: true }); }
  disableWhisperButton() { this._whisperReady = false; this.whisperButton.draw(false, false); this.whisperButton.c.disableInteractive(); }

  setupDragEvents() {
    this.input.on("dragstart", (pointer, obj) => {
      if (!this.cartridges.find((b) => b.container === obj) || this.inputLocked) return;
      obj.setDepth(90);
      this.tweens.add({ targets: obj, scale: 1.1, duration: 100 });
      const prevSlot = obj.getData("placedIn");
      if (prevSlot) {
        this.slotContents[prevSlot] = (this.slotContents[prevSlot] || []).filter((b) => b.container !== obj);
        obj.setData("placedIn", null);
        this.updateWhisperButtonState();
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
    return { x: 420 - 60, y: y - 12, w: 120, h: 24 };
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
      this.updateWhisperButtonState();
    } else {
      const home = obj.getData("home");
      this.tweens.add({ targets: obj, x: home.x, y: home.y, duration: 250, ease: "Back.easeOut" });
    }
  }

  updateWhisperButtonState() {
    const allFilled = Object.keys(this.slotDefs).every((id) => (this.slotContents[id] || []).length > 0);
    if (allFilled) this.enableWhisperButton(); else this.disableWhisperButton();
  }

  async onWhisperPressed(config) {
    this.inputLocked = true;
    this.disableWhisperButton();
    this.roundAttempts++;
    const timeMs = Math.round(this.time.now - this.roundStartTime);
    const decls = this._roundDecls;

    const placed = {};
    for (const id in this.slotDefs) placed[id] = this.slotContents[id][0].container;

    const allCorrect = config.slots.every((s) => {
      const code = placed[s.id].getData("code");
      const def = config.cartridges.find((c) => (c.slotId ? c.slotId === s.id : true) && c.code === code);
      return def && (def.correct || def.alsoCorrect);
    });

    await this.clearLog();
    const finalLines = config.sourceTemplate.map((line, i) => {
      const slotId = config.slots.find((s) => this.slotDefs[s.id].lineIndex === i)?.id;
      if (!slotId) return line;
      return line.replace(`<slot:${slotId}>`, placed[slotId].getData("code"));
    });
    this.updateSourceDisplay(finalLines);

    const revealResult = await this.runSnippetReveal(finalLines, decls);
    if (config.revealNote) this.createFloatingText(LOG_X + LOG_W / 2, LOG_Y + LOG_H + 30, config.revealNote, HEX_GRAY, "11px Arial", 3000);
    await this.delay(500);
    if (!this._alive) return;

    const displayRows = this.rows.length > 1 && this.rows[this.rows.length - 1] === "" ? this.rows.slice(0, -1) : this.rows;
    const logText = displayRows.join("⏎");
    const success = allCorrect && revealResult.ok && logText === config.expectedLog;
    const firstWrongTag = config.slots.map((s) => {
      const code = placed[s.id].getData("code");
      const def = config.cartridges.find((c) => (c.slotId ? c.slotId === s.id : true) && c.code === code);
      return def && !def.correct && !def.alsoCorrect ? def.tag : null;
    }).find(Boolean);

    this.logAttempt(config, success, config.slots.map((s) => placed[s.id].getData("code")).join(" | "), firstWrongTag, timeMs);

    if (success) {
      this.updateScore(100 * this.getComboMultiplier() + (timeMs < 6000 ? 25 : 0));
      this.updateCombo(true);
      if (this.roundAttempts === 1) this.correctFirstTry++;
      if (config.postMissionNote) await this.showBitFeedback(config.postMissionNote);
      if (!this._alive) return;
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
      await this.showBitFeedback(MISCONCEPTION_FEEDBACK[firstWrongTag] || "That combination doesn't whisper what the mission needs — check the log and try another cartridge.");
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
      this.disableWhisperButton();
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
      this.flareMicLED();
      await this.delay(400);
      this.logRowObjs.forEach((r) => r.textT.setColor("#3d4450"));

      const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
      this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });
      const title = this.add.text(640, 240, "MIC OFF", { font: "bold 40px Arial", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
      this.tweens.add({ targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut", onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }) });
      this.add.text(640, 310, `Score: ${this.score}`, { font: "20px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
      this.add.text(640, 350, `Rounds Completed: ${this.currentRound} / 12`, { font: "16px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);
      this._makeButton(640, 420, "MIC CHECK", 200, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
    })();
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearRound();
    this.hideBubble();

    try { GameManager.completeLevel(39, Math.round((this.correctFirstTry / 12) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("print_schema"); } catch (_) {}
    try {
      localStorage.setItem("level40_results", JSON.stringify({
        level: 40, concept: "output_print", phase: "accretion",
        score: this.score, accuracy: this.correctFirstTry / 12, avgTime: 0,
        comboMax: this.maxCombo, stars: this._starRating(), livesRemaining: this.lives,
        attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.whisperFinale().then(() => { if (this._alive) this.showScoreTally(); });
  }

  async whisperFinale() {
    await this.clearLog();
    await this.fireCall("print", '"WHISPERS HEARD"', {});
    this.createConfetti(LOG_X + LOG_W / 2, LOG_Y + LOG_H / 2, 36);
    await this.delay(500);
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
    panel.fillStyle(0x0a0817, 1);
    panel.fillRoundedRect(360, 100, 560, 420, 16);
    panel.lineStyle(2, C_VIOLET, 1);
    panel.strokeRoundedRect(360, 100, 560, 420, 16);

    const title = this.add.text(640, 140, "WHISPERS RECEIVED", { font: "bold 34px Arial", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(91).setScale(0);
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
    bg.fillStyle(0x12101c, 1);
    bg.lineStyle(1.5, C_VIOLET, 1);
    bg.fillRoundedRect(-8, -14, 12, 16, 3);
    bg.strokeRoundedRect(-8, -14, 12, 16, 3);
    bg.fillStyle(C_CYAN, 1);
    bg.fillRect(8, 0, 4, 8);
    badge.add(bg);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 1900 });
    const badgeLbl = this.add.text(640, 445, "print() SCHEMA ACQUIRED", { font: "bold 13px Arial", color: HEX_GOLD }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: badgeLbl, alpha: 1, duration: 300, delay: 2050 });

    this._makeButton(500, 480, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(760, 480, "NEXT: The Live Feed →", 260, 44, { fill: 0x00733a, stroke: C_GREEN_BRIGHT, textColor: "#ffffff" }, () => {
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
