/**
 * Level 41 — "The Live Feed" (Output Methods: Tuning Phase — print())
 * ===========================================================================
 * Tunes the Level 40 print() schema under time pressure. The Air Time Bar
 * IS the timer — it drains linearly over the round's time limit; answer
 * before it hits zero or the item goes to DEAD AIR. The reveal always
 * fires the true transmission on a compact reference whisper desk + log
 * (ported from Level 40), so cursor position and newline/tab escape
 * behavior are always genuinely demonstrated — never scripted.
 *
 * evaluateCall() extends the Level 40 evaluator with '\t' (tab): a tab
 * character pads the current row out to the next multiple-of-8 column,
 * mirroring Java's console tab-stop convention. The print/println + '\n'
 * discrimination (round 7's central lesson) falls straight out of the
 * L40 model unmodified: a '\n' inside the argument breaks rows mid-type,
 * and THEN — only for println — the auto-newline fires once more at the
 * very end, landing the cursor a full row further down.
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

const MON_X = 500, MON_Y = 300, MON_W = 500, MON_H = 220;
const BAR_X0 = 230, BAR_X1 = 770, BAR_Y = 166;
const DESK_X0 = 40, DESK_X1 = 300, DESK_Y = 470, DESK_H = 90;
const MARQUEE_X0 = 55, MARQUEE_X1 = 285, MARQUEE_Y = DESK_Y + 20;
const EMITTER_X = 290, EMITTER_Y = MARQUEE_Y;
const LOG_X = 800, LOG_Y = 100, LOG_W = 460, LOG_H = 490;
const LOG_CONTENT_Y0 = LOG_Y + 36;
const ROW_H = 26;
const LOG_TEXT_X = LOG_X + 32;
const TUTORIAL_KEY = "level41_tutorial_done";
const WAVE_TIME = { 1: 12000, 2: 10000, 3: 9000 };

// ══════════════════════════════════════════════════════════════
// ROUND CONFIGURATION
// ══════════════════════════════════════════════════════════════
const ROUNDS = [
  { round: 1, wave: 1, type: "predict", source: ['System.out.print("signal");'],
    question: "What appears on the log?", correct: "signal",
    options: [
      { value: "signal", label: "signal  (cursor at end)", tag: null },
      { value: "signal⏎(new line)", tag: "print_adds_newline_belief" },
      { value: '"signal"', tag: "quotes_print_belief" },
      { value: "Error", tag: "print_requires_special_type_belief" },
    ], concept: "fluent_print_no_newline" },

  { round: 2, wave: 1, type: "predict", source: ['System.out.print("A");', 'System.out.print("B");', 'System.out.print("C");'],
    question: "What appears on the log?", correct: "ABC",
    options: [
      { value: "ABC", label: "ABC on ONE line", tag: null },
      { value: "A⏎B⏎C", label: "A / B / C (three lines)", tag: "print_stacks_on_new_lines_belief" },
      { value: "A B C", tag: "print_prepends_space_belief" },
      { value: "C", tag: "last_overwrites_belief" },
    ], concept: "consecutive_prints_fluent" },

  { round: 3, wave: 1, type: "predict", source: ["System.out.print(3 + 4);"],
    question: "What appears on the log?", correct: "7",
    options: [
      { value: "7", tag: null },
      { value: "34", tag: "plus_always_concatenates" },
      { value: "3 + 4", tag: "plus_not_evaluated_belief" },
      { value: '"7"', tag: "int_prints_with_quotes_belief" },
    ],
    revealNote: "Gold + performs pure arithmetic — the whisper delivers just '7', no newline.",
    concept: "arithmetic_through_print" },

  { round: 4, wave: 1, type: "predict", decl: "int count = 42;", source: ['System.out.print("total: " + count);'],
    question: "What appears on the log?", correct: "total: 42",
    options: [
      { value: "total: 42", tag: null },
      { value: "total: count", tag: "variable_as_literal_belief" },
      { value: "total:42", tag: "print_strips_space_belief" },
      { value: "total: 42⏎", tag: "print_adds_newline_belief" },
    ], concept: "concat_through_print" },

  { round: 5, wave: 1, type: "cursor", source: ['System.out.print("A");', 'System.out.println("B");'],
    question: "Where is the cursor after both calls?", correct: "start_of_row_02",
    options: [
      { value: "start_of_row_02", label: "start of row 02 (new fresh row below)", tag: null },
      { value: "end_of_row_01_after_AB", label: "end of row 01, after 'AB'", tag: "println_no_newline_belief" },
      { value: "start_of_row_03", label: "start of row 03", tag: "print_adds_newline_belief" },
      { value: "start_of_row_01", label: "start of row 01", tag: "cursor_resets_belief" },
    ],
    revealNote: "print puts A on row 01. println puts B after A → 'AB', THEN println's own newline jumps the cursor to row 02.",
    concept: "mixed_call_cursor_fluent" },

  { round: 6, wave: 2, type: "predict", source: ['System.out.print("A\\nB");'],
    question: "What appears on the log AND where is the cursor?", correct: "A⏎B_cursor_end_of_B",
    options: [
      { value: "A⏎B_cursor_end_of_B", label: "A / B  (cursor at end of B on row 02)", tag: null },
      { value: "A⏎B⏎_cursor_row_03", label: "A / B / (cursor on row 03)", tag: "print_adds_newline_belief" },
      { value: "A\\nB_literal", label: "A\\nB (backslash-n visible)", tag: "newline_prints_literal_slash_n_belief" },
      { value: "AB_one_line", label: "AB on one line", tag: "escape_newline_confusion" },
    ],
    revealNote: "The \\n breaks A from B; cursor rests at end of B — no auto-newline from print.",
    concept: "print_with_newline_escape" },

  { round: 7, wave: 2, type: "predict", source: ['System.out.println("A\\nB");'],
    question: "What appears on the log AND where is the cursor?", correct: "A_row01_B_row02_cursor_row03",
    options: [
      { value: "A_row01_B_row02_cursor_row03", label: "A (row 01) / B (row 02) / cursor on row 03", tag: null },
      { value: "A_row01_B_row02_cursor_end_B", label: "A / B, cursor at end of B", tag: "println_no_final_newline_belief" },
      { value: "A\\nB_row01", label: "A\\nB literal on row 01", tag: "newline_prints_literal_slash_n_belief" },
      { value: "AB_row01_cursor_row02", label: "AB on row 01, cursor on row 02", tag: "escape_newline_confusion" },
    ],
    revealNote: "The sharpest discrimination in the trilogy: \\n breaks A from B, THEN println's OWN newline pushes the cursor down once more, to row 03. Two newlines total.",
    concept: "println_with_newline_escape" },

  { round: 8, wave: 2, type: "predict", source: ['System.out.print("hi\\n");'],
    question: "What appears on the log AND where is the cursor?", correct: "hi_row01_cursor_row02",
    options: [
      { value: "hi_row01_cursor_row02", label: "'hi' on row 01, cursor on row 02", tag: null },
      { value: "hi_cursor_end", label: "'hi' on row 01, cursor at end of 'hi'", tag: "trailing_newline_ignored_belief" },
      { value: "hi_backslash_n_row01", label: "'hi\\n' literal on row 01", tag: "newline_prints_literal_slash_n_belief" },
      { value: "cursor_row02_hi_row02", label: "cursor first, then 'hi' on row 02", tag: "leading_newline_confusion" },
    ],
    revealNote: "The trailing \\n IS a real newline character. It fires as the last thing typed, jumping the cursor to row 02.",
    concept: "trailing_newline_escape" },

  { round: 9, wave: 2, type: "predict", source: ['System.out.print("A");', "System.out.println();", 'System.out.print("B");'],
    question: "What appears on the log AND where is the cursor?", correct: "A_row01_B_row02_cursor_end_B",
    options: [
      { value: "A_row01_B_row02_cursor_end_B", label: "'A' on row 01, 'B' on row 02, cursor at end of B", tag: null },
      { value: "A_row01_blank_row02_B_row03", label: "'A' / (blank) / 'B' (three rows)", tag: "empty_println_extra_blank_belief" },
      { value: "AB_row01", label: "'AB' on row 01", tag: "empty_println_ignored_belief" },
      { value: "Error_empty_println", tag: "empty_println_error_belief" },
    ],
    revealNote: "Empty println() is legal and does ONE thing: jumps the cursor to a new row — a newline injector between prints.",
    concept: "empty_println_as_newline_injector" },

  { round: 10, wave: 2, type: "predict", source: ['System.out.print("col1\\tcol2");'],
    question: "What appears on the log?", correct: "col1_TAB_col2",
    options: [
      { value: "col1_TAB_col2", label: "col1[tab]col2 (aligned across a tab stop)", tag: null },
      { value: "col1_col2_no_tab", label: "col1col2 (no gap)", tag: "tab_char_ignored_belief" },
      { value: "col1_backslash_t_col2", label: "col1\\tcol2 literal", tag: "newline_prints_literal_slash_n_belief" },
      { value: "col1_row02_col2", label: "col1 on row 01, col2 on row 02", tag: "tab_becomes_newline_belief" },
    ],
    revealNote: "First taste of \\t. On the log it renders as a horizontal jump to the next tab stop — not a newline.",
    concept: "tab_escape_introduction" },

  { round: 11, wave: 3, type: "trace", source: ['System.out.print("A");', 'System.out.print("B\\nC");', 'System.out.println("D");', 'System.out.print("E");'],
    question: "What appears on the log AND where is the cursor?", correct: "AB_CD_E_cursor_end_E",
    options: [
      { value: "AB_CD_E_cursor_end_E", label: "AB / CD / E (cursor at end of E on row 03)", tag: null },
      { value: "A_BC_D_E_four_rows", label: "A / BC / D / E (four rows)", tag: "print_adds_newline_belief" },
      { value: "ABCDE_one_row", label: "ABCDE (one row)", tag: "println_no_newline_belief" },
      { value: "AB_CD_E_cursor_row04", label: "AB / CD / E (cursor on row 04)", tag: "print_adds_final_newline_belief" },
    ],
    revealNote: "print A → row01 'A'; print 'B\\nC' → 'AB' completes row01, \\n jumps to row02, 'C' types; println 'D' → 'CD' completes row02, jumps to row03; print E → 'E' on row03.",
    concept: "complex_trace_fluent" },

  { round: 12, wave: 3, type: "trace", decl: "int x = 5;", source: ['System.out.print("x = " + x + "!\\n");', 'System.out.print("done");'],
    question: "What appears on the log?", correct: "x_5_bang_row01_done_row02",
    options: [
      { value: "x_5_bang_row01_done_row02", label: "'x = 5!' (row 01) / 'done' (row 02)", tag: null },
      { value: "x_x_bang_row01_done_row02", label: "'x = x!' / 'done'", tag: "variable_as_literal_belief" },
      { value: "x_5_backslash_n_done_row01", label: "'x = 5!\\ndone' (one row, literal)", tag: "newline_prints_literal_slash_n_belief" },
      { value: "x_5_bang_done_row01", label: "'x = 5!done' (one row)", tag: "escape_newline_confusion" },
    ],
    revealNote: "Concat resolves: 'x = ' + 5 → 'x = 5'; + '!\\n' → 'x = 5!\\n'. Print delivers, \\n jumps cursor to row02, 'done' lands there.",
    concept: "trace_with_concat_and_escape" },

  { round: 13, wave: 3, type: "trace", source: ['System.out.print("A");', 'System.out.println("B");', 'System.out.print("C");', 'System.out.println("D");'],
    question: "What appears on the log AND where is the cursor?", correct: "AB_CD_cursor_row03",
    options: [
      { value: "AB_CD_cursor_row03", label: "AB (row 01) / CD (row 02) / cursor on row 03", tag: null },
      { value: "A_B_C_D_cursor_row05", label: "A/B/C/D (four rows) / cursor row 05", tag: "print_adds_newline_belief" },
      { value: "ABCD_cursor_row02", label: "ABCD (one row) / cursor row 02", tag: "println_no_newline_belief" },
      { value: "AB_CD_cursor_end_D", label: "AB / CD / cursor at end of D", tag: "println_no_final_newline_belief" },
    ],
    revealNote: "Alternating print/println builds neat pairs per row. After the last println, cursor sits fresh on row 03.",
    concept: "alternating_print_println_fluent" },

  { round: 14, wave: 3, type: "bughunt",
    lines: ['System.out.print("Ready?");', "System.out.print();"],
    faultLine: 2, fixedToken: 'System.out.print(" go!");',
    explanation: "print() with no arguments is a COMPILE ERROR — Java's print() has no zero-argument overload (unlike println()). Either give it something to print, or use println() if you wanted just a newline.",
    wrongTag: "print_no_arg_legal_belief", concept: "no_arg_print_bug_fluent" },

  { round: 15, wave: 3, type: "bughunt",
    lines: ['System.out.println("Name: ");', 'System.out.println("Anjana");'],
    faultLine: 1, fixedToken: 'System.out.print("Name: ");',
    fix: 'System.out.print("Name: ");',
    explanation: "The first println jumped the cursor to a new row BEFORE 'Anjana' landed — that's why you got two rows instead of one. To build a phrase across multiple calls, use print() for everything BUT the last call.",
    wrongTag: "wrong_method_for_same_line",
    revealNote: "The reveal plays both futures: first the buggy two-row 'Name: ' / 'Anjana' lands, the log clears, then the fixed print()+println() lands 'Name: Anjana' on one row.",
    concept: "print_vs_println_choice_bug" },
];

const MISCONCEPTION_FEEDBACK = {
  print_adds_newline_belief: "The log tells the tale — the cursor DIDN'T jump! print() writes and stops. Only println() breaks the line.",
  print_stacks_on_new_lines_belief: "Consecutive print() calls build a single row from left to right, always.",
  print_prepends_space_belief: "print() adds nothing extra — not spaces, not newlines. What you pass is exactly what lands.",
  print_strips_space_belief: "print() adds nothing and strips nothing — what you passed lands exactly. The space rode along with the String.",
  last_overwrites_belief: "The log doesn't erase — it extends. Every print() call adds MORE text; nothing gets overwritten.",
  print_requires_special_type_belief: "That argument is a perfectly valid String literal — no error here.",
  plus_always_concatenates: "Pure numbers add! In a numeric-only context the + performs arithmetic, not gluing.",
  plus_not_evaluated_belief: "The + inside the call is real code — it evaluates before the transmission. What lands is the RESULT, not the recipe.",
  int_prints_with_quotes_belief: "Quotes are how you write String LITERALS in code — they're never part of what prints.",
  variable_as_literal_belief: "Inside quotes, a variable's name is just letters. Without quotes, it becomes the value the variable holds.",
  quotes_print_belief: "The quotes are wrapping paper — they mark where the String starts and ends, but they NEVER travel to the log.",
  println_no_newline_belief: "Trust the pattern — println() always jumps the cursor. Only print() rests the cursor at end-of-text.",
  cursor_resets_belief: "The cursor NEVER goes backward. Each call adds forward — no rewinding.",
  newline_prints_literal_slash_n_belief: "The backslash is Java's escape signal — \\n means 'newline character.' It never prints as literal backslash-n.",
  escape_newline_confusion: "The backslash + n isn't two characters, it's ONE — the newline character. It behaves EXACTLY like a real newline, wherever it appears.",
  println_no_final_newline_belief: "Trust the pattern: println ALWAYS jumps the cursor after its text. The \\n inside the String and the \\n from println are TWO separate newlines. Both fire, both count.",
  trailing_newline_ignored_belief: "The \\n at the end is a real character — the last thing that typed. It jumped the cursor before anyone else could.",
  leading_newline_confusion: "A leading \\n fires FIRST — the cursor jumps before any letters type. Look at the string's leftmost character.",
  empty_println_ignored_belief: "Empty println() is a real transmission — it prints just a newline. Between two prints, it splits them onto different rows.",
  empty_println_extra_blank_belief: "Only ONE newline fires from println() with no args — enough to jump the cursor once. It doesn't create a blank row unless a println comes BEFORE it too.",
  empty_println_error_belief: "println() with nothing inside is completely legal — it's how programmers write blank lines.",
  tab_char_ignored_belief: "\\t is a tab character — it renders as a horizontal jump on the log, not as nothing. Escape sequences never vanish.",
  tab_becomes_newline_belief: "\\t is a tab (horizontal), not a newline (vertical). \\n is for row breaks; \\t is for column alignment.",
  print_adds_final_newline_belief: "The last print didn't newline — no method call ever adds an extra newline unless it was PRINTLN.",
  wrong_method_for_same_line: "To build a phrase across calls, EVERY call but the last should be print(). println breaks the line.",
  wrong_method_for_new_line: "If you want a new line at the end, the LAST call is println(). The pieces before are prints.",
  print_no_arg_legal_belief: "The compile-error stamp is the proof — print() has NO overload for zero arguments. That asymmetry is Java's, not yours.",
  timeout: "The cue expired! Fluent producers see the cursor's next home before the bar turns yellow. Trust the pattern and commit.",
};

export class Level41Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level41Scene" });
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
    this.rows = [""];
    this.cursorRowIdx = 0;
    this.logRowObjs = [];
    this.inputLocked = true;
    this.gameEnded = false;
    this._alive = true;
    this._bubble = null;
    this._drainTween = null;
    this._urgencyState = "safe";
    this._waveSquares = [];
    this._firstEscapeAnnotationShown = false;
  }

  preload() {}

  create() {
    this._alive = true;
    this.events.once("shutdown", () => { this._alive = false; this._killDrainTween(); });

    const cam = this.cameras.main;
    const zoom = Math.min(this.scale.width / W, this.scale.height / H);
    cam.setZoom(zoom);
    cam.centerOn(W / 2, H / 2);
    cam.setBackgroundColor("#080810");

    try { GameManager.incrementAttempt(40); } catch (_) {}

    this.createParticleTexture();
    this.createBackground();
    this.createRoomDecor();
    this.createTallyLight();
    this.createParticles();
    this.createPreviewMonitor();
    this.createAirTimeBar();
    this.createReferenceWhisperDesk();
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
    if (!this.textures.exists("l41_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l41_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x080810).setDepth(0);
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
    [[20, 95], [1185, 1260]].forEach(([x0]) => {
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

    const hook = this.add.graphics().setDepth(2);
    hook.lineStyle(2, 0x546e7a, 0.4);
    hook.strokeCircle(45, 232, 22);
    hook.strokeCircle(30, 232, 6);
    hook.strokeCircle(60, 232, 6);

    const clip = this.add.graphics().setDepth(2);
    clip.fillStyle(0x0d1117, 1);
    clip.lineStyle(1, 0x78909c, 0.5);
    clip.fillRoundedRect(203, 377, 34, 46, 3);
    clip.strokeRoundedRect(203, 377, 34, 46, 3);
    clip.fillStyle(0xe0e0e0, 0.35);
    for (let i = 0; i < 3; i++) clip.fillRect(209, 386 + i * 8, 22, 2);
  }

  updateServerLEDs(time) {
    if (!this.serverLEDs) return;
    this.serverLEDs.forEach((s) => { s.led.setAlpha(Math.floor((time + s.phase) / 800) % 2 === 0 ? 0.3 : 0.08); });
  }

  createTallyLight() {
    const g = this.add.graphics().setDepth(3);
    g.fillStyle(0xe53935, 0.15);
    g.slice(380, 90, 10, Math.PI, 0, false);
    g.fillPath();
    this.tallyLight = g;
    this._tallyBright = false;
  }

  flareTallyLight() {
    this._tallyBright = true;
    this.tallyLight.clear();
    this.tallyLight.fillStyle(0xe53935, 0.85);
    this.tallyLight.slice(380, 90, 10, Math.PI, 0, false);
    this.tallyLight.fillPath();
    this.time.delayedCall(400, () => {
      this._tallyBright = false;
      this.tallyLight.clear();
      this.tallyLight.fillStyle(0xe53935, 0.15);
      this.tallyLight.slice(380, 90, 10, Math.PI, 0, false);
      this.tallyLight.fillPath();
    });
  }

  createParticles() {
    this.ambient = [];
    for (let i = 0; i < 8; i++) {
      this.ambient.push(this.add.circle(Phaser.Math.Between(0, W), Phaser.Math.Between(220, 630), 1, 0x4fc3f7, Phaser.Math.FloatBetween(0.02, 0.05)).setDepth(2));
    }
  }

  updateAmbient(time, delta) {
    if (!this.ambient) return;
    const step = 0.015 * (delta / 16.7);
    this.ambient.forEach((p, i) => {
      p.x += step;
      p.y += Math.sin(time * 0.0005 + i) * 0.03;
      if (p.x > W) { p.x = 0; p.y = Phaser.Math.Between(220, 630); }
    });
  }

  // ══════════════════════════════════════════════════════════════
  // PREVIEW MONITOR
  // ══════════════════════════════════════════════════════════════

  createPreviewMonitor() {
    const bez = this.add.graphics().setDepth(10);
    bez.fillStyle(0x141a24, 1);
    bez.fillRoundedRect(MON_X - MON_W / 2 - 20, MON_Y - MON_H / 2 - 20, MON_W + 40, MON_H + 40, 10);
    bez.lineStyle(3, 0x3d4450, 1);
    bez.strokeRoundedRect(MON_X - MON_W / 2 - 20, MON_Y - MON_H / 2 - 20, MON_W + 40, MON_H + 40, 10);
    this.bezelGfx = bez;

    this.add.text(MON_X, MON_Y + MON_H / 2 + 32, "BCAST-A", { font: "bold 8px Courier New", color: HEX_GRAY }).setOrigin(0.5).setDepth(11);
    this.add.circle(MON_X + MON_W / 2 + 4, MON_Y + MON_H / 2 + 24, 3, C_GREEN_BRIGHT, 0.7).setDepth(11);

    const scr = this.add.graphics().setDepth(12);
    scr.fillStyle(0x0a1120, 1);
    scr.fillRoundedRect(MON_X - MON_W / 2, MON_Y - MON_H / 2, MON_W, MON_H, 6);
    scr.lineStyle(1, C_CYAN, 0.4);
    scr.strokeRoundedRect(MON_X - MON_W / 2, MON_Y - MON_H / 2, MON_W, MON_H, 6);
    for (let y = MON_Y - MON_H / 2; y < MON_Y + MON_H / 2; y += 4) {
      scr.lineStyle(1, C_CYAN, 0.03);
      scr.lineBetween(MON_X - MON_W / 2, y, MON_X + MON_W / 2, y);
    }

    const maskShape = this.make.graphics({ x: 0, y: 0, add: false });
    maskShape.fillRoundedRect(MON_X - MON_W / 2, MON_Y - MON_H / 2, MON_W, MON_H, 6);
    this.monMask = maskShape.createGeometryMask();
    this.monLayer = this.add.container(0, 0).setDepth(13);
    this.monLayer.setMask(this.monMask);

    this.roundLabel = this.add.text(MON_X + MON_W / 2 - 8, MON_Y - MON_H / 2 + 8, "", { font: "bold 9px Courier New", color: HEX_GRAY }).setOrigin(1, 0).setAlpha(0.7).setDepth(14);
    this.monLayer.add(this.roundLabel);
  }

  createAirTimeBar() {
    this.add.text(BAR_X0, 138, "AIR TIME", { font: "bold 10px Arial", color: HEX_GRAY }).setDepth(10);
    this.airTimeReadout = this.add.text(700, 138, "", { font: "bold 11px Courier New", color: "#e0e0e0" }).setDepth(10);

    const track = this.add.graphics().setDepth(10);
    track.fillStyle(0x141a24, 1);
    track.lineStyle(1, 0x3d4450, 1);
    track.fillRoundedRect(BAR_X0, BAR_Y, BAR_X1 - BAR_X0, 16, 4);
    track.strokeRoundedRect(BAR_X0, BAR_Y, BAR_X1 - BAR_X0, 16, 4);

    this.barFillGfx = this.add.graphics().setDepth(11);
    this.tickGfx = this.add.graphics().setDepth(12);
  }

  drawAirTimeBar(progress, tickCount) {
    const remaining = 1 - progress;
    const w = Math.max(0, (BAR_X1 - BAR_X0 - 4) * remaining);
    const color = remaining > 0.33 ? C_GREEN_BRIGHT : remaining > 0.15 ? C_GOLD : C_RED;
    this.barFillGfx.clear();
    this.barFillGfx.fillStyle(color, 1);
    this.barFillGfx.fillRoundedRect(BAR_X0 + 2, BAR_Y + 2, w, 12, 3);

    this.tickGfx.clear();
    const total = tickCount;
    const passed = Math.floor(progress * total);
    for (let i = 0; i < total; i++) {
      const x = BAR_X0 + ((i + 0.5) / total) * (BAR_X1 - BAR_X0);
      this.tickGfx.lineStyle(1, i < passed ? 0x3d4450 : 0xffffff, i < passed ? 0.5 : 0.4);
      this.tickGfx.lineBetween(x, BAR_Y - 4, x, BAR_Y);
    }

    const secsLeft = Math.max(0, (this.roundTimeLimit * remaining) / 1000);
    this.airTimeReadout.setText(remaining <= 0 ? "LIVE" : `0:${secsLeft.toFixed(0).padStart(2, "0")} → LIVE`);
    this.airTimeReadout.setColor(remaining <= 0 ? HEX_RED : "#e0e0e0");
  }

  // ══════════════════════════════════════════════════════════════
  // AIR TIME DRAIN TIMER
  // ══════════════════════════════════════════════════════════════

  startAirTimeDrain(timeLimitMs, tickCount, onTimeout) {
    this._killDrainTween();
    this._urgencyState = "safe";
    this.roundTimeLimit = timeLimitMs;
    const state = { v: 0 };
    this._drainTween = this.tweens.add({
      targets: state, v: 1, duration: timeLimitMs, ease: "Linear",
      onUpdate: () => { this.drawAirTimeBar(state.v, tickCount); this._checkUrgency(1 - state.v); },
      onComplete: () => { if (this._alive) onTimeout(); },
    });
  }

  _checkUrgency(remaining) {
    if (remaining <= 0.15 && this._urgencyState !== "critical") {
      this._urgencyState = "critical";
      this.tweens.add({ targets: this.bezelGfx, alpha: 0.7, duration: 350, yoyo: true, repeat: -1 });
    }
  }

  _killDrainTween() {
    if (this._drainTween) { this._drainTween.stop(); this._drainTween = null; }
  }

  pauseDrain() {
    if (this._drainTween) this._drainTween.pause();
    this.tweens.killTweensOf(this.bezelGfx);
    this.bezelGfx.setAlpha(1);
  }

  getTimePctUsed() {
    const elapsed = this.time.now - this.roundStartTime;
    return Phaser.Math.Clamp(elapsed / this.roundTimeLimit, 0, 1);
  }

  async deadAir() {
    this._killDrainTween();
    this.tweens.killTweensOf(this.bezelGfx);
    this.bezelGfx.setAlpha(1);
    this.drawAirTimeBar(1, 12);
    this.screenShake(0.006, 200);
    const stamp = this.add.text(MON_X, MON_Y, "DEAD AIR", { font: "bold 26px Arial", color: HEX_RED }).setOrigin(0.5).setAngle(-8).setAlpha(0).setDepth(30);
    this.monLayer.add(stamp);
    this.tweens.add({ targets: stamp, alpha: 1, duration: 200 });
    this.flareTallyLight();
    await this.delay(1500);
    if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 250, onComplete: () => stamp.destroy() });
  }

  async stampMonitor(kind) {
    const label = kind === "processed" ? "CLEARED" : "MISSED CUE";
    const color = kind === "processed" ? HEX_GREEN_BRIGHT : HEX_RED;
    const stamp = this.add.text(MON_X, MON_Y, label, { font: "bold 20px Arial", color }).setOrigin(0.5).setAngle(-6).setScale(1.5).setAlpha(0).setDepth(30);
    this.monLayer.add(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 180 });
    await this.delay(700);
    if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 200, onComplete: () => stamp.destroy() });
  }

  screenShake(intensity = 0.004, duration = 180) {
    this.cameras.main.shake(duration, intensity);
  }

  // ══════════════════════════════════════════════════════════════
  // MONITOR TRIAL CONTENT
  // ══════════════════════════════════════════════════════════════

  _syntaxTokenize(line) {
    const tokens = [];
    const re = /(\\[nt])|(\bSystem\.out\b)|(\.)|(\bprintln\b|\bprint\b)|("(?:[^"\\]|\\.)*")|([(){};=+])/g;
    let last = 0, m;
    const plain = (t) => t && tokens.push({ t, c: "#b0bec5" });
    while ((m = re.exec(line))) {
      if (m.index > last) plain(line.slice(last, m.index));
      if (m[1]) tokens.push({ t: m[1], c: HEX_MAGENTA });
      else if (m[2]) tokens.push({ t: m[2], c: "#81c784" });
      else if (m[3]) tokens.push({ t: m[3], c: HEX_GRAY });
      else if (m[4]) tokens.push({ t: m[4], c: "#ffb74d" });
      else if (m[5]) {
        const parts = m[5].split(/(\\[nt])/);
        parts.forEach((p) => { if (/^\\[nt]$/.test(p)) tokens.push({ t: p, c: HEX_MAGENTA }); else if (p) tokens.push({ t: p, c: "#4fc3f7" }); });
      } else if (m[6]) tokens.push({ t: m[6], c: "#ef5350" });
      last = m.index + m[0].length;
    }
    if (last < line.length) plain(line.slice(last));
    return tokens.length ? tokens : [{ t: line, c: "#b0bec5" }];
  }

  showTrialOnMonitor(lines, questionText) {
    this.trialContainer && this.trialContainer.destroy();
    this.trialContainer = this.add.container(0, 0);
    this.monLayer.add(this.trialContainer);

    const fontSize = lines.length > 2 ? 13 : 15;
    const startY = MON_Y - 40 - ((lines.length - 1) * (fontSize + 8)) / 2;
    lines.forEach((line, i) => {
      const tokens = this._syntaxTokenize(line);
      const measured = tokens.map((t) => { const tmp = this.add.text(0, 0, t.t, { font: `bold ${fontSize}px Courier New` }); const w = tmp.width; tmp.destroy(); return w; });
      const totalW = measured.reduce((a, b) => a + b, 0);
      let x = MON_X - totalW / 2;
      const y = startY + i * (fontSize + 8);
      tokens.forEach((tok, ti) => {
        const t = this.add.text(x, y, tok.t, { font: `bold ${fontSize}px Courier New`, color: tok.c }).setOrigin(0, 0.5).setAlpha(0);
        this.trialContainer.add(t);
        this.tweens.add({ targets: t, alpha: 1, duration: 200 });
        x += measured[ti];
      });
    });

    if (questionText) {
      const qt = this.add.text(MON_X, MON_Y + 55, questionText, { font: "12px Arial", color: "#b0bec5" }).setOrigin(0.5).setAlpha(0);
      this.trialContainer.add(qt);
      this.tweens.add({ targets: qt, alpha: 1, duration: 200, delay: 150 });
    }
    this.roundLabel.setText(`ITEM ${this.currentRound + 1}/15`);

    const sweep = this.add.rectangle(MON_X, MON_Y - MON_H / 2, MON_W, 2, 0xffffff, 0.6);
    this.monLayer.add(sweep);
    this.tweens.add({ targets: sweep, y: MON_Y + MON_H / 2, duration: 400, onComplete: () => sweep.destroy() });
  }

  clearMonitorTrial() {
    if (this.trialContainer) { this.trialContainer.destroy(); this.trialContainer = null; }
  }

  // ══════════════════════════════════════════════════════════════
  // REFERENCE WHISPER DESK (compact, ported from L40)
  // ══════════════════════════════════════════════════════════════

  createReferenceWhisperDesk() {
    const g = this.add.graphics().setDepth(4);
    g.fillStyle(0x0d1117, 1);
    g.fillRoundedRect(DESK_X0, DESK_Y, DESK_X1 - DESK_X0, DESK_H, 8);
    g.lineStyle(1.5, C_VIOLET, 1);
    g.strokeRoundedRect(DESK_X0, DESK_Y, DESK_X1 - DESK_X0, DESK_H, 8);

    const mg = this.add.graphics().setDepth(4);
    mg.fillStyle(0x0a0e14, 1);
    mg.fillRoundedRect(MARQUEE_X0, MARQUEE_Y - 15, MARQUEE_X1 - MARQUEE_X0, 30, 4);
    mg.lineStyle(1, 0x4fc3f7, 0.4);
    mg.strokeRoundedRect(MARQUEE_X0, MARQUEE_Y - 15, MARQUEE_X1 - MARQUEE_X0, 30, 4);

    const emitter = this.add.graphics().setDepth(4);
    emitter.lineStyle(1.5, 0x4fc3f7, 1);
    emitter.strokeCircle(EMITTER_X, EMITTER_Y, 8);

    this.marqueeContainer = this.add.container(0, 0).setDepth(6);
    this.antenna = { x: EMITTER_X, y: EMITTER_Y };
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

  async assembleArgumentDisplay(displayText, isString) {
    this.clearMarquee();
    const cy = MARQUEE_Y;
    let x = MARQUEE_X0 + 6;
    if (isString) { const q = this.add.text(x, cy, '"', { font: "bold 13px Courier New", color: HEX_GRAY }).setOrigin(0, 0.5); this.marqueeContainer.add(q); x += q.width; }
    let i = 0;
    while (i < displayText.length) {
      if (!this._alive) return;
      let glyph = displayText[i], color = isString ? HEX_CYAN : HEX_GOLD, adv = 1;
      if (displayText[i] === "\\" && (displayText[i + 1] === "n" || displayText[i + 1] === "t")) { glyph = "\\" + displayText[i + 1]; color = HEX_MAGENTA; adv = 2; }
      else if (displayText[i] === " " && isString) { glyph = "␣"; color = HEX_MAGENTA; }
      const t = this.add.text(x, cy, glyph, { font: "bold 13px Courier New", color }).setOrigin(0, 0.5).setAlpha(0);
      this.marqueeContainer.add(t);
      x += t.width;
      this.tweens.add({ targets: t, alpha: 1, duration: 60 });
      await this.delay(18);
      i += adv;
    }
    if (isString) { const q = this.add.text(x, cy, '"', { font: "bold 13px Courier New", color: HEX_GRAY }).setOrigin(0, 0.5); this.marqueeContainer.add(q); }
    await this.delay(180);
  }

  async showNoArgumentError() {
    this.clearMarquee();
    const t = this.add.text(MARQUEE_X0 + (MARQUEE_X1 - MARQUEE_X0) / 2, MARQUEE_Y, "NO ARG", { font: "bold 11px Arial", color: HEX_RED }).setOrigin(0.5).setAlpha(0);
    this.marqueeContainer.add(t);
    this.tweens.add({ targets: t, alpha: 1, duration: 150 });
    this.tweens.add({ targets: this.marqueeContainer, x: 4, duration: 30, yoyo: true, repeat: 4, onComplete: () => { this.marqueeContainer.x = 0; } });
    this.screenShake(0.004, 150);
    this.flareTallyLight();
    await this.delay(400);
    this.clearMarquee();
  }

  // ══════════════════════════════════════════════════════════════
  // REFERENCE LOG + CURSOR (compact, ported from L40)
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
    this.cursorGlow = this.add.rectangle(0, 0, 14, 22, C_CYAN, 0.15);
    this.cursorBlock = this.add.rectangle(0, 0, 10, 18, C_CYAN, 0.75);
    this.logLayer.add([this.cursorGlow, this.cursorBlock]);
    this.tweens.add({ targets: [this.cursorBlock, this.cursorGlow], alpha: 0.1, duration: 700, yoyo: true, repeat: -1 });
    this.updateCursorVisualPosition();
  }

  _rowY(rowIdx) { return LOG_CONTENT_Y0 + 15 + rowIdx * ROW_H; }

  updateCursorVisualPosition() {
    if (!this.logRowObjs[this.cursorRowIdx]) return;
    const rowText = this.logRowObjs[this.cursorRowIdx].textT;
    this.cursorBlock.setPosition(LOG_TEXT_X + rowText.width + 2, this._rowY(this.cursorRowIdx));
    this.cursorGlow.setPosition(LOG_TEXT_X + rowText.width + 2, this._rowY(this.cursorRowIdx));
  }

  cursorSparkle() {
    const p = this.add.particles(this.cursorBlock.x, this.cursorBlock.y, "l41_dot", {
      speed: { min: 25, max: 60 }, angle: { min: 0, max: 360 }, scale: { start: 0.45, end: 0 }, lifespan: 180,
      tint: [C_CYAN], emitting: false,
    }).setDepth(20);
    this.logLayer.add(p);
    p.explode(4);
    this.time.delayedCall(280, () => p.destroy());
  }

  renderLogFromScratch() {
    this.logRowObjs.forEach((r) => { r.numT.destroy(); r.textT.destroy(); });
    this.logRowObjs = [];
    this.rows.forEach((rowStr, i) => {
      const y = this._rowY(i);
      const numT = this.add.text(LOG_X + 10, y, String(i + 1).padStart(2, "0"), { font: "10px Courier New", color: "#3d4450" }).setOrigin(0, 0.5);
      const textT = this.add.text(LOG_TEXT_X, y, this._displayRow(rowStr), { font: "bold 15px Courier New", color: HEX_CYAN }).setOrigin(0, 0.5);
      this.logLayer.add([numT, textT]);
      this.logRowObjs.push({ numT, textT });
    });
  }

  _displayRow(rowStr) { return rowStr.replace(/ /g, "␣"); }

  ensureRow(idx) {
    while (this.logRowObjs.length <= idx) {
      const i = this.logRowObjs.length;
      const y = this._rowY(i);
      const numT = this.add.text(LOG_X + 10, y, String(i + 1).padStart(2, "0"), { font: "10px Courier New", color: "#3d4450" }).setOrigin(0, 0.5);
      const textT = this.add.text(LOG_TEXT_X, y, "", { font: "bold 15px Courier New", color: HEX_CYAN }).setOrigin(0, 0.5).setAlpha(0);
      this.tweens.add({ targets: textT, alpha: 1, duration: 150 });
      this.logLayer.add([numT, textT]);
      this.logRowObjs.push({ numT, textT });
    }
  }

  /** Types `text` onto the log at the current cursor, breaking rows at
   * real newline chars and padding to the next tab stop (multiple of 8)
   * at real tab chars. Ground truth: this.rows. */
  async typeAtCursor(text, styleType) {
    const color = this._typeColor(styleType);
    for (const ch of text) {
      if (!this._alive) return;
      if (ch === "\n") {
        if (!this._firstEscapeAnnotationShown) {
          this._firstEscapeAnnotationShown = true;
          this.createAnnotation(this.cursorBlock.x, this.cursorBlock.y - 26, "the \\n is the newline", HEX_MAGENTA);
        }
        this.cursorSparkle();
        this.rows.push("");
        this.cursorRowIdx++;
        this.ensureRow(this.cursorRowIdx);
        this.updateCursorVisualPosition();
        await this.delay(50);
        continue;
      }
      if (ch === "\t") {
        const curLen = this.rows[this.cursorRowIdx].length;
        const nextStop = Math.ceil((curLen + 1) / 8) * 8;
        this.rows[this.cursorRowIdx] += " ".repeat(nextStop - curLen);
        this.logRowObjs[this.cursorRowIdx].textT.setColor(color).setText(this._displayRow(this.rows[this.cursorRowIdx]));
        this.updateCursorVisualPosition();
        await this.delay(50);
        continue;
      }
      this.rows[this.cursorRowIdx] += ch;
      this.logRowObjs[this.cursorRowIdx].textT.setColor(color).setText(this._displayRow(this.rows[this.cursorRowIdx]));
      this.updateCursorVisualPosition();
      await this.delay(16);
    }
    this.cursorSparkle();
  }

  async forceNewlineAfterPrintln() {
    this.rows.push("");
    this.cursorRowIdx++;
    this.ensureRow(this.cursorRowIdx);
    this.updateCursorVisualPosition();
    this.cursorSparkle();
    await this.delay(60);
  }

  clearLog() {
    return new Promise((res) => {
      const wipe = this.add.rectangle(LOG_X + LOG_W / 2, LOG_CONTENT_Y0, LOG_W, 0, 0x08111c, 1).setOrigin(0.5, 0);
      this.logLayer.add(wipe);
      this.tweens.add({
        targets: wipe, height: LOG_Y + LOG_H - LOG_CONTENT_Y0, duration: 300, ease: "Cubic.easeIn",
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
  // HUD
  // ══════════════════════════════════════════════════════════════

  createHUD() {
    const g = this.add.graphics().setDepth(49);
    g.fillStyle(0x080810, 0.93);
    g.fillRect(0, 0, W, 64);
    g.lineStyle(1, 0x1a2135, 1);
    g.lineBetween(0, 64, W, 64);

    this.add.text(20, 14, "THE LIVE FEED", { font: "bold 15px Arial", color: "#b0bec5" }).setDepth(50);
    this.add.text(20, 32, "Tuning Phase — Output Methods: print()", { font: "11px Arial", color: "#546e7a" }).setDepth(50);

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
      lg.lineStyle(2, 0xe53935, 1);
      lg.beginPath();
      lg.arc(0, 2, 5, Math.PI, 0, false);
      lg.strokePath();
      lg.lineBetween(-5, 6, 5, 6);
      this.lifeIcons.push(lg);
    }
  }

  updateWaveIndicator(roundInWave, correct) {
    const sq = this._waveSquares[roundInWave];
    if (!sq) return;
    sq.setFillStyle(correct ? C_GREEN_BRIGHT : C_RED);
  }

  resetWaveIndicator() { this._waveSquares.forEach((sq) => sq.setFillStyle(0x2a2f36)); }

  _roundInWave() {
    if (this.currentWave === 1) return this.currentRound;
    if (this.currentWave === 2) return this.currentRound - 5;
    return this.currentRound - 10;
  }

  // ══════════════════════════════════════════════════════════════
  // BIT — line producer variant
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
    headset.lineBetween(16, 10, 8, 4);
    headset.strokeCircle(8, 4, 2);
    const clip = this.add.container(20, 6);
    const cg = this.add.graphics();
    cg.fillStyle(0x0d1117, 1);
    cg.lineStyle(1, 0x78909c, 1);
    cg.fillRoundedRect(-6, -8, 12, 16, 2);
    cg.strokeRoundedRect(-6, -8, 12, 16, 2);
    clip.add(cg);
    c.add([g, eye, pupil, headset, tip, clip]);
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
    g.lineStyle(1.5, C_VIOLET, 1);
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
    const t = this.add.text(x, y, text, { font: "italic 10px Arial", color: colorHex }).setOrigin(0.5).setDepth(70).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 200 });
    this.time.delayedCall(1600, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() }); });
    return t;
  }

  createFloatingText(x, y, text, colorHex, font = "bold 13px Arial", hold = 1400) {
    const t = this.add.text(x, y, text, { font, color: colorHex, wordWrap: { width: 300 }, align: "center" }).setOrigin(0.5).setDepth(31).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 180 });
    this.time.delayedCall(hold, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() }); });
    return t;
  }

  createConfetti(x, y, count = 24) {
    const p = this.add.particles(x, y, "l41_dot", {
      speed: { min: 70, max: 220 }, angle: { min: 0, max: 360 }, scale: { start: 0.8, end: 0 }, lifespan: 450,
      tint: [C_CYAN, C_GOLD, C_GREEN_BRIGHT, C_VIOLET, 0xffffff], emitting: false,
    }).setDepth(75);
    p.explode(count);
    this.time.delayedCall(800, () => p.destroy());
  }

  // ══════════════════════════════════════════════════════════════
  // EVALUATOR — L40's evaluator extended with \t
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
    if (/^".*"$/.test(tok)) return { value: tok.slice(1, -1).replace(/\\n/g, "\n").replace(/\\t/g, "\t"), type: "string", ok: true };
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
        const t = this.add.text(MARQUEE_X0 + 80, MARQUEE_Y, "?", { font: "bold 16px Courier New", color: HEX_RED }).setOrigin(0.5);
        this.marqueeContainer.add(t);
        this.screenShake(0.004, 150);
        this.flareTallyLight();
        await this.delay(350);
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
    const capsule = this.add.circle(MARQUEE_X0 + (MARQUEE_X1 - MARQUEE_X0) / 2, MARQUEE_Y, 6, color, 0.9).setDepth(40);
    this.tweens.add({ targets: this.marqueeContainer, scale: 0.4, alpha: 0, duration: 120 });
    await this.delay(120);
    if (!this._alive) return;
    const startX = this.antenna.x, startY = this.antenna.y;
    capsule.setPosition(startX, startY);
    const targetX = this.cursorBlock.x, targetY = this.cursorBlock.y;
    const beam = this.add.rectangle(startX, startY, 0, 2, color, 0.5).setOrigin(0, 0.5).setDepth(39);
    await new Promise((res) => {
      this.tweens.add({
        targets: capsule, x: targetX, y: targetY, duration: 260, ease: "Cubic.easeInOut",
        onUpdate: () => { beam.width = Math.abs(capsule.x - startX); beam.x = startX; beam.y = capsule.y; },
        onComplete: res,
      });
    });
    this.tweens.add({ targets: beam, alpha: 0, duration: 180, onComplete: () => beam.destroy() });
    capsule.destroy();
    this.flashLed();

    if (evalResult.isEmpty && method === "print") {
      this.marqueeContainer.setScale(1).setAlpha(1);
      await this.delay(80);
      return;
    }

    await this.typeAtCursor(evalResult.text, evalResult.styleType);
    if (method === "println") await this.forceNewlineAfterPrintln();
    this.marqueeContainer.setScale(1).setAlpha(1);
    await this.delay(80);
  }

  showCompileErrorStamp() {
    const stamp = this.add.text(MON_X, MON_Y - MON_H / 2 - 26, "COMPILE ERROR", { font: "bold 16px Arial", color: HEX_RED }).setOrigin(0.5).setDepth(80).setScale(1.3).setAngle(-6).setAlpha(0);
    this.monLayer.add(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 180 });
    this.time.delayedCall(900, () => { if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 200, onComplete: () => stamp.destroy() }); });
  }

  async runSnippetReveal(sourceLines, decls) {
    for (const line of sourceLines) {
      if (!this._alive) return { ok: true };
      const method = this._methodOf(line);
      if (!method) continue;
      const m = line.match(/print(?:ln)?\(([^)]*)\)/);
      const argExpr = m ? m[1] : "";
      const result = await this.fireCall(method, argExpr, decls);
      if (!result.ok) return result;
      await this.delay(90);
    }
    return { ok: true };
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
    await this.bitSay("Welcome to the Live Feed, Producer. Every trial goes to air on a countdown. Watch the Air Time Bar drain and answer before you get DEAD AIR. Fluent producers see the cursor's next home before the bar turns yellow.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();

    this.showTrialOnMonitor(['System.out.print("cue");'], "What appears on the log?");
    const a1 = this.createAnnotation(MON_X, MON_Y - MON_H / 2 - 20, "the trial is your item to clear", HEX_CYAN);
    await this.delay(300); if (!A()) return;
    const a2 = this.createAnnotation((BAR_X0 + BAR_X1) / 2, BAR_Y - 14, "drain = deadline", HEX_GOLD);
    await this.delay(300); if (!A()) return;
    const a3 = this.createAnnotation(LOG_X + LOG_W / 2, LOG_Y - 10, "the truth lands here after you answer", HEX_GREEN_BRIGHT);
    await this.delay(400); if (!A()) return;

    await this.bitSay("The whisper desk fires your reveal onto the log — trust the cursor's position. Ready your rundown!");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();
    this.clearMonitorTrial();

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

    const banners = { 1: "WAVE 1 — RAPID CURSOR TRACKING", 2: "WAVE 2 — ESCAPE SEQUENCES", 3: "WAVE 3 — TRACES & BUGS" };
    await this.showWaveBanner(banners[waveNumber]);
    if (!this._alive) return;

    if (waveNumber === 3) {
      await this.showBitFeedback("Wave three, Producer. Real programs — traces to trust and bugs to spot. The cursor tells you everything if you read it. Trust the log.", 4500);
      if (!this._alive) return;
    }

    const startIndex = waveNumber === 1 ? 0 : waveNumber === 2 ? 5 : 10;
    this.startRound(startIndex);
  }

  async showWaveBanner(text) {
    const c = this.add.container(MON_X, -60).setDepth(85);
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
    const tickCount = config.type === "bughunt" ? 12 : (config.wave === 1 ? 12 : config.wave === 2 ? 10 : 9);

    if (config.type === "predict" || config.type === "cursor" || config.type === "trace") this.setupPredict(config, decls);
    else if (config.type === "bughunt") this.setupBugHunt(config);

    this.startAirTimeDrain(limit, tickCount, () => this.onAirTimeExpired(config));
  }

  clearRound() {
    this.roundElements.forEach((e) => { if (e && e.destroy) e.destroy(); });
    this.roundElements = [];
    this.clearMonitorTrial();
  }

  async onAirTimeExpired(config) {
    if (this.gameEnded) return;
    this.inputLocked = true;
    this.roundElements.forEach((e) => e.disableInteractive && e.disableInteractive());
    this.logAttempt(config, false, null, "timeout", this.roundTimeLimit, 1);
    await this.deadAir();
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
  // TYPE A/B/C — PREDICT / CURSOR / TRACE
  // ══════════════════════════════════════════════════════════════

  setupPredict(config, decls) {
    this.showTrialOnMonitor(config.source, config.question);
    this.showOptionBubbles(config.options, config, decls);
  }

  showOptionBubbles(options, config, decls) {
    const shuffled = Phaser.Utils.Array.Shuffle(options.slice());
    const n = shuffled.length;
    const spacing = 260;
    const startX = MON_X - ((n - 1) * spacing) / 2;
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
      const txt = this.add.text(0, 0, label, { font: "bold 12px Courier New", color: "#e0e0e0" }).setOrigin(0.5);
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
    this.pauseDrain();
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

    await this.stampMonitor(correct ? "processed" : "misread");
    await this.delay(100);
    if (!this._alive) return;
    await this.clearLog();
    await this.runSnippetReveal(config.source, decls);
    if (config.revealNote) this.createFloatingText(LOG_X + LOG_W / 2, LOG_Y + LOG_H + 30, config.revealNote, HEX_GRAY, "11px Arial", 2600);
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
    this.monLayer.add(this.trialContainer);

    const header = this.add.text(MON_X, MON_Y - MON_H / 2 + 14, "CLICK THE BUG", { font: "bold 13px Arial", color: HEX_MAGENTA }).setOrigin(0.5);
    this.trialContainer.add(header);
    this.tweens.add({ targets: header, alpha: 0.5, duration: 500, yoyo: true, repeat: -1 });

    this.roundLabel.setText(`ITEM ${this.currentRound + 1}/15`);
    this._bugHuntTokenObjs = [];

    config.lines.forEach((line, li) => {
      const y = MON_Y - 20 + li * 30;
      const isBugLine = li + 1 === config.faultLine;
      const t = this.add.text(MON_X, y, line, { font: "bold 14px Courier New", color: "#e0e0e0" }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });
      t.setData("isBug", isBugLine);
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
    });
    this.inputLocked = false;
  }

  async onTokenClicked(tokenObj, config) {
    this.pauseDrain();
    const timePctUsed = this.getTimePctUsed();
    const timeMs = Math.round(this.time.now - this.roundStartTime);
    const correct = tokenObj.getData("isBug");
    this.logAttempt(config, correct, `line ${tokenObj.getData("line")}`, correct ? null : config.wrongTag, timeMs, timePctUsed);
    this._bugHuntTokenObjs.forEach((t) => t.disableInteractive());

    if (correct) {
      tokenObj.setColor(HEX_GREEN_BRIGHT);
      const fixed = this.add.text(tokenObj.x, tokenObj.y - 20, config.fixedToken, { font: "bold 12px Courier New", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setAlpha(0);
      this.trialContainer.add(fixed);
      this.tweens.add({ targets: fixed, alpha: 1, y: tokenObj.y - 24, duration: 200 });
      await this.stampMonitor("processed");
    } else {
      tokenObj.setColor(HEX_RED);
      this.tweens.add({ targets: tokenObj, x: tokenObj.x + 4, duration: 30, yoyo: true, repeat: 4 });
      this._bugHuntTokenObjs.filter((t) => t.getData("isBug")).forEach((t) => this.tweens.add({ targets: t, alpha: 0.3, duration: 180, yoyo: true, repeat: 3 }));
      await this.stampMonitor("misread");
    }

    await this.delay(150);
    if (!this._alive) return;
    await this.clearLog();
    await this.runBugHuntReveal(config);
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

  /** Bug-hunt reveals genuinely execute the real (or fixed) sequence
   * against the whisper desk/log — never scripted. */
  async runBugHuntReveal(config) {
    if (config.round === 14) {
      await this.fireCall("print", '"Ready?"', {});
      await this.delay(120);
      if (!this._alive) return;
      // line 2 "print();" has no argument — genuine compile error.
      const r = await this.fireCall("print", "", {});
      return r;
    }
    if (config.round === 15) {
      // buggy: two println() calls
      await this.fireCall("println", '"Name: "', {});
      await this.delay(120);
      if (!this._alive) return;
      await this.fireCall("println", '"Anjana"', {});
      await this.delay(400);
      if (!this._alive) return;
      await this.clearLog();
      // fixed: print() then println()
      await this.fireCall("print", '"Name: "', {});
      await this.delay(120);
      if (!this._alive) return;
      await this.fireCall("println", '"Anjana"', {});
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
    const remaining = 1 - timePctUsed;
    if (remaining > 0.6) { points += 50; this.fastBonusCount++; this.createFloatingText(MON_X, MON_Y - MON_H / 2 - 20, "⚡ CLEAN CLEAR +50", HEX_GOLD, "bold 13px Arial", 900); }
    else if (remaining > 0.3) { points += 25; this.fastBonusCount++; this.createFloatingText(MON_X, MON_Y - MON_H / 2 - 20, "⚡ +25", HEX_GOLD, "bold 12px Arial", 800); }
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
    this._killDrainTween();
    this.clearRound();
    this.hideBubble();

    (async () => {
      this.flareTallyLight();
      await this.delay(500);
      if (!this._alive) return;
      this.logRowObjs.forEach((r) => r.textT.setColor("#3d4450"));
      this.serverLEDs.forEach((s) => this.tweens.killTweensOf(s.led));

      const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
      this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });
      const title = this.add.text(640, 240, "OFF AIR", { font: "bold 40px Arial", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
      this.tweens.add({ targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut", onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }) });
      this.add.text(640, 310, `Score: ${this.score}`, { font: "20px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
      this.add.text(640, 350, `Items Cleared: ${this.currentRound} / 15`, { font: "16px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);
      this._makeButton(640, 420, "BACK TO PRODUCTION", 220, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
    })();
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this._killDrainTween();
    this.clearRound();
    this.hideBubble();

    try { GameManager.completeLevel(40, Math.round((this.correctFirstTry / 15) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("print_schema_tuned"); } catch (_) {}
    try {
      localStorage.setItem("level41_results", JSON.stringify({
        level: 41, concept: "output_print", phase: "tuning",
        score: this.score, accuracy: this.correctFirstTry / 15, avgTimePct: this.totalTimePctUsed / 15,
        fastBonuses: this.fastBonusCount, comboMax: this.maxCombo, stars: this._starRating(),
        livesRemaining: this.lives, attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.liveFeedFinale().then(() => { if (this._alive) this.showScoreTally(); });
  }

  async liveFeedFinale() {
    await this.clearLog();
    await this.fireCall("print", '"LIVE FEED CLEARED"', {});
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

    const title = this.add.text(640, 130, "CLEAN FEED", { font: "bold 34px Arial", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(91).setScale(0);
    this.tweens.add({ targets: title, scale: 1, duration: 350, ease: "Back.easeOut" });

    const acc = Math.round((this.correctFirstTry / 15) * 100);
    const avgResponseSec = ((this.totalTimePctUsed / 15) * (WAVE_TIME[2] / 1000)).toFixed(1);
    const lines = [`ACCURACY: ${acc}%`, `AVG RESPONSE: ${avgResponseSec}s`, `CLEAN-CLEAR BONUSES: ${this.fastBonusCount}`, `BEST COMBO: ×${this.getComboMultiplierFor(this.maxCombo)}`];
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
    bg.strokeRoundedRect(-12, -9, 24, 14, 2);
    const nl = this.add.text(0, 1, "\\n", { font: "bold 8px Courier New", color: HEX_MAGENTA }).setOrigin(0.5);
    badge.add([bg, nl]);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 2000 });
    const badgeLbl = this.add.text(640, 458, "print() SCHEMA TUNED", { font: "bold 13px Arial", color: HEX_GOLD }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: badgeLbl, alpha: 1, duration: 300, delay: 2150 });

    this._makeButton(500, 495, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(760, 495, "NEXT: The Newsroom →", 260, 44, { fill: 0x00733a, stroke: C_GREEN_BRIGHT, textColor: "#ffffff" }, () => {
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
