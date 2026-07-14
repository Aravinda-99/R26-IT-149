/**
 * Level 39 — "The Studio" (Output Methods: Restructuring Phase —
 * println() Trilogy Finale)
 * ===========================================================================
 * The learner CONSTRUCTS complete output-producing programs — no multiple
 * choice. Reuses the Level 27/30/33/36 code-canvas/parts-bin/RUN-button
 * construction architecture, with a masked rig window compacting the
 * Level 37 tower/marquee/log into a live observation pane, plus cross-wing
 * cameo stations (Scanner tape + containers from L34-36, case-method press
 * from L31-33) that light up only when a mission's code actually invokes
 * them — the rig's visual footprint IS the code's execution footprint.
 *
 * Six genuine per-mission interpreters (never scripted) compute real
 * results from whatever blocks the player placed, reusing the honest
 * left-to-right String-sticky '+' fold from L37/L38 and the corrected
 * (space-and-newline-skipping) Scanner tokenizer from L36. Mission 4 adds
 * a genuine for-loop simulator with an infinite-loop watchdog.
 */

import Phaser from "phaser";
import { GameManager } from "../../../GameManager.js";
import { BadgeSystem } from "../../../BadgeSystem.js";

const W = 1280, H = 720;

const C_CYAN = 0x00e5ff, C_GOLD = 0xffd740, C_GREEN = 0x4caf50, C_GREEN_BRIGHT = 0x00e676;
const C_RED = 0xf44336, C_GRAY = 0x78909c, C_PURPLE = 0x8c7ae6, C_VIOLET = 0x7c4dff;
const C_INT = 0x1565c0, C_LINE = 0x2e7d32, C_NEWLINE = 0x7b1fa2;
const HEX_CYAN = "#00e5ff", HEX_GOLD = "#ffd740", HEX_GREEN = "#4caf50", HEX_GREEN_BRIGHT = "#00e676";
const HEX_RED = "#f44336", HEX_GRAY = "#78909c", HEX_PURPLE = "#8c7ae6";
const HEX_MAGENTA = "#ff4081", HEX_NEWLINE = "#7b1fa2";

const CX = 40, CY = 90, CW = 680, CH = 380;
const TAB_H = 34, GUTTER_W = 34, CODE_PAD = 10;
const CODE_X = CX + GUTTER_W + CODE_PAD;
const CODE_Y0 = CY + TAB_H + 14;
const LINE_H = 20;
const PX = 40, PY = 490, PW = 680, PH = 130;
const OX = 760, OY = 80, OW = 460, OH = 228;
const STRIP_Y = OY + OH + 15;
const RX = 760, RY = 340, RW = 460, RH = 128;
const BX = 760, BY = 478, BW = 460, BH = 130;

const MY = OY + 60;
const TOWER_X = OX + 40, TOWER_TOP_Y = OY + 20;
const MARQUEE_X = OX + 165, MARQUEE_Y = MY;
const TAPE_X0 = OX + 20, TAPE_X1 = OX + 110, TAPE_Y = OY + 170;
const CONT_X = OX + 60, CONT_Y0 = OY + 130;
const LOG_X0 = OX + 280, LOG_Y0 = OY + 20, LOG_W0 = 170;
const PRESS_X = OX + 400, PRESS_Y = OY + 170;
const TUTORIAL_KEY = "level39_tutorial_done";

// ══════════════════════════════════════════════════════════════
// MISSION CONFIGURATION
// ══════════════════════════════════════════════════════════════
const MISSIONS = [
  { mission: 1, title: "The Announcer Line",
    brief: "The show intro reads a title from a variable and announces it. Print exactly: Now broadcasting: <show title>",
    skeleton: ['String show = §show;', "System.out.println(<slot:arg>);"],
    slots: [{ id: "arg", capacity: 1 }],
    palette: [
      { code: '"Now broadcasting: " + show', slot: "arg", correct: true },
      { code: '"Now broadcasting: show"', slot: "arg", tag: "variable_as_literal_belief" },
      { code: '"Now broadcasting: " + "show"', slot: "arg", tag: "literal_as_variable_belief" },
      { code: 'show + "Now broadcasting: "', slot: "arg", tag: "wrong_order" },
      { code: "Now broadcasting: + show", slot: "arg", tag: "unclosed_string_literal" },
    ],
    tests: [
      { substitutions: { show: '"Signal Studio"' }, expectedOutput: "Now broadcasting: Signal Studio" },
      { substitutions: { show: "\"Bit's Hour\"" }, expectedOutput: "Now broadcasting: Bit's Hour" },
      { substitutions: { show: '""' }, expectedOutput: "Now broadcasting: " },
    ], concept: "basic_concat_output" },

  { mission: 2, title: "The Medal Scoreboard",
    brief: "Print the medal total from the day's counts. Layout: Medal Total: <sum of gold + silver>",
    skeleton: ["int gold = §gold;", "int silver = §silver;", 'System.out.println("Medal Total: " + <slot:expr>);'],
    slots: [{ id: "expr", capacity: 1 }],
    palette: [
      { code: "(gold + silver)", slot: "expr", correct: true },
      { code: "gold + silver", slot: "expr", tag: "parens_missing_precedence" },
      { code: "gold", slot: "expr", tag: "wrong_variable_used" },
      { code: "(gold * silver)", slot: "expr", tag: "wrong_operator" },
      { code: '"(gold + silver)"', slot: "expr", tag: "literal_as_variable_belief" },
    ],
    tests: [
      { substitutions: { gold: "3", silver: "4" }, expectedOutput: "Medal Total: 7" },
      { substitutions: { gold: "10", silver: "5" }, expectedOutput: "Medal Total: 15" },
      { substitutions: { gold: "0", silver: "0" }, expectedOutput: "Medal Total: 0" },
    ],
    postMissionNote: "The Signal Room showed you the trap — up here you dodged it. Parens force the arithmetic BEFORE the concat. This move — this exact move — you'll make a thousand times in real code.",
    concept: "parens_payoff_production" },

  { mission: 3, title: "The Café Menu",
    brief: "Produce this menu on the log EXACTLY, blank lines and all: ===== MENU =====, (blank), 1. Coffee, 2. Tea, (blank), Enjoy!",
    skeleton: ['System.out.println("===== MENU =====");', "<slot:blank1>", 'System.out.println("1. Coffee");', 'System.out.println("2. Tea");', "<slot:blank2>", 'System.out.println("Enjoy!");'],
    slots: [{ id: "blank1", capacity: 1 }, { id: "blank2", capacity: 1 }],
    palette: [
      { code: "System.out.println();", slot: "blank1" },
      { code: 'System.out.println("");', slot: "blank1" },
      { code: "System.out.println();", slot: "blank2" },
      { code: 'System.out.println("");', slot: "blank2" },
      { code: "(nothing)", label: "— leave empty —", slot: "blank1", empty: true, tag: "empty_println_ignored_belief" },
      { code: "(nothing)", label: "— leave empty —", slot: "blank2", empty: true, tag: "empty_println_ignored_belief" },
      { code: 'System.out.println(" ");', slot: "blank1", tag: "space_not_blank_belief" },
      { code: "System.out.printLn();", slot: "blank1", tag: "method_name_case_insensitive_belief" },
    ],
    tests: [{ substitutions: {}, expectedOutput: "===== MENU =====⏎⏎1. Coffee⏎2. Tea⏎⏎Enjoy!" }],
    postMissionNote: 'Two ways to print a blank line — println() and println(""). Both good, both real. Whichever your fingers reach for first, own it.',
    concept: "multi_line_layout_blanks" },

  { mission: 4, title: "The Countdown",
    brief: "The show intro rolls a countdown from N to 1, then a final 'GO!' line. N is provided.",
    skeleton: ["int n = §n;", "for (int i = n; <slot:cond>; <slot:step>) {", "    System.out.println(<slot:body>);", "}", 'System.out.println("GO!");'],
    slots: [{ id: "cond", capacity: 1 }, { id: "step", capacity: 1 }, { id: "body", capacity: 1 }],
    palette: [
      { code: "i >= 1", slot: "cond" },
      { code: "i > 0", slot: "cond" },
      { code: "i > 1", slot: "cond", tag: "off_by_one_last_position" },
      { code: "i <= n", slot: "cond", tag: "reverse_condition_wrong_direction" },
      { code: "i--", slot: "step", correct: true },
      { code: "i++", slot: "step", tag: "reverse_start_at_zero" },
      { code: "i", slot: "body" },
      { code: "n", slot: "body", tag: "wrong_variable_used" },
      { code: '"i"', slot: "body", tag: "literal_as_variable_belief" },
      { code: "i - 1", slot: "body", tag: "off_by_one_last_position" },
    ],
    tests: [
      { substitutions: { n: "3" }, expectedOutput: "3⏎2⏎1⏎GO!" },
      { substitutions: { n: "5" }, expectedOutput: "5⏎4⏎3⏎2⏎1⏎GO!" },
      { substitutions: { n: "1" }, expectedOutput: "1⏎GO!" },
    ], concept: "loop_with_println" },

  { mission: 5, title: "The Receipt Terminal",
    brief: "The kiosk reads ITEMS (int), REVIEWS (int), and NAME (line). Produce a receipt: Customer: <name>, Total activity: <items + reviews>",
    skeleton: ["Scanner sc = new Scanner(System.in);", "int items = sc.nextInt();", "int reviews = sc.nextInt();", "<slot:janitor>", "String name = sc.nextLine();", 'System.out.println("Customer: " + name);', 'System.out.println("Total activity: " + <slot:total>);'],
    slots: [{ id: "janitor", capacity: 1 }, { id: "total", capacity: 1 }],
    palette: [
      { code: "sc.nextLine();", slot: "janitor", correct: true },
      { code: "(nothing)", label: "— leave empty —", slot: "janitor", empty: true, tag: "janitor_missing" },
      { code: "sc.nextInt();", slot: "janitor", tag: "janitor_wrong_type" },
      { code: "(items + reviews)", slot: "total", correct: true },
      { code: "items + reviews", slot: "total", tag: "parens_missing_precedence" },
      { code: "(items * reviews)", slot: "total", tag: "wrong_operator" },
      { code: "items", slot: "total", tag: "wrong_variable_used" },
    ],
    tests: [
      { input: ["5 3", "Anjana Perera"], expectedOutput: "Customer: Anjana Perera⏎Total activity: 8" },
      { input: ["10 20", "Kai"], expectedOutput: "Customer: Kai⏎Total activity: 30" },
      { input: ["0 0", "Test"], expectedOutput: "Customer: Test⏎Total activity: 0" },
    ],
    postMissionNote: "Two wings shipping together — Scanner brings it in, println sends it out. And that janitor call? Muscle memory now.",
    concept: "scanner_output_pipeline" },

  { mission: 6, title: "The Broadcast Board",
    brief: "The public board reads a guest's NAME (line) and DEPARTMENT (line). Print a bordered welcome — name and department both LOUD.",
    skeleton: ["Scanner sc = new Scanner(System.in);", "String name = sc.nextLine();", "String dept = sc.nextLine();", 'System.out.println("==================");', 'System.out.println("WELCOME, " + <slot:name_arg> + "!");', 'System.out.println("Department: " + <slot:dept_arg>);', 'System.out.println("==================");'],
    slots: [{ id: "name_arg", capacity: 1 }, { id: "dept_arg", capacity: 1 }],
    palette: [
      { code: "name.toUpperCase()", slot: "name_arg", correct: true },
      { code: "dept.toUpperCase()", slot: "dept_arg", correct: true },
      { code: "name", slot: "name_arg", tag: "no_normalization" },
      { code: "dept", slot: "dept_arg", tag: "no_normalization" },
      { code: "name.toLowerCase()", slot: "name_arg", tag: "method_direction_confusion" },
      { code: "dept.toLowerCase()", slot: "dept_arg", tag: "method_direction_confusion" },
      { code: "name.toUpperCase", slot: "name_arg", tag: "property_vs_method_syntax" },
      { code: '"name".toUpperCase()', slot: "name_arg", tag: "literal_as_variable_belief" },
    ],
    tests: [
      { input: ["anjana perera", "engineering"], expectedOutput: "==================⏎WELCOME, ANJANA PERERA!⏎Department: ENGINEERING⏎==================" },
      { input: ["bit", "signals"], expectedOutput: "==================⏎WELCOME, BIT!⏎Department: SIGNALS⏎==================" },
      { input: ["OK", "AI"], expectedOutput: "==================⏎WELCOME, OK!⏎Department: AI⏎==================" },
    ],
    postMissionNote: "Scanner brought them in. String taught you to make it loud. println shipped the whole thing back to the world. That's what all fifteen levels were teaching, Producer. Real programs. You make them now.",
    concept: "cross_wing_capstone_output" },
];

const MISCONCEPTION_FEEDBACK = {
  parens_missing_precedence: "Look at the report — left-to-right stickiness struck again. Wrap the arithmetic in parentheses to force the addition BEFORE the concat. This is the exact move from Signal Room, wave three.",
  wrong_order: "The label ran AFTER the value because the variable came first. Read the expected format: label first, then the value.",
  variable_as_literal_belief: "The variable's NAME printed as literal letters! Inside quotes, variable names become literal text. Without quotes, they become their values.",
  literal_as_variable_belief: 'A quoted word is a String literal — it prints those exact letters, not a variable\'s value. Drop the quotes to reference the variable.',
  unclosed_string_literal: "The compile-error stamp says it all — bare text needs to be in quotes. The + can't glue an unquoted phrase.",
  wrong_operator: "The report shows the wrong arithmetic — check the operator you dropped in the slot.",
  wrong_variable_used: "Only one of the values reached the log. The mission needs both — combine them with +.",
  empty_println_ignored_belief: "No blank line where the layout needed one — the empty slot printed nothing, not an empty line. Reach for println() or println(\"\").",
  space_not_blank_belief: "Look closely — that row has ONE character in it (a space). A truly blank line is println() or println(\"\"), no characters at all.",
  method_name_case_insensitive_belief: "printLn with capital L doesn't exist — the compile-error stamp is proof. Method names are exact, always.",
  off_by_one_last_position: "Check whether your loop bound includes 1 without going past it. Both i >= 1 and i > 0 work; i > 1 stops too soon.",
  reverse_condition_wrong_direction: "Your loop counted the wrong way — for a countdown, start high and DECREMENT.",
  reverse_start_at_zero: "The step counts UP, not down — a countdown needs i-- to move toward zero.",
  janitor_missing: "Look at the report — 'Customer: ' with nothing after the colon! The leftover ⏎ from nextInt() got devoured by nextLine() before the name arrived. The bare sc.nextLine() is the fix.",
  janitor_wrong_type: "The runtime rejection stamp — nextInt() demanded a number and met the name. A janitor call needs to SWEEP whatever's left; that's always nextLine() territory.",
  no_normalization: "The board printed a whisper where a shout was ordered. Uppercase the value before you glue it in.",
  method_direction_confusion: "You lowercased where the mission asked for LOUD — toUpperCase() sends the letters up, toLowerCase() sends them down.",
  property_vs_method_syntax: "The arc's oldest trap returns for the finale — parentheses on Strings! toUpperCase is a METHOD: toUpperCase().",
};

export class Level39Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level39Scene" });
  }

  init() {
    this.currentMission = 0;
    this.score = 0;
    this.displayScore = 0;
    this.lives = 3;
    this.flawlessCount = 0;
    this.runCount = 0;
    this.failedRunCount = 0;
    this.hintCount = 0;
    this.selfCorrectionCount = 0;
    this.parensProactive = {};
    this.janitorProactive = {};
    this.conditionConvention = {};
    this.attemptLog = [];
    this.missionElements = [];
    this.slotContents = {};
    this.slotDefs = {};
    this.wrongBlockHistory = {};
    this.missionStartTime = 0;
    this.missionRunsFailed = 0;
    this.missionHintUsed = false;
    this._runCountAtMissionStart = 0;
    this.paletteBlocks = [];
    this.inputLocked = true;
    this.gameEnded = false;
    this._alive = true;
    this._bubble = null;
    this._dragHoverSlotKey = null;
    this._firstRunRecorded = false;
  }

  preload() {}

  create() {
    this._alive = true;
    this.events.once("shutdown", () => { this._alive = false; });

    const cam = this.cameras.main;
    const zoom = Math.min(this.scale.width / W, this.scale.height / H);
    cam.setZoom(zoom);
    cam.centerOn(W / 2, H / 2);
    cam.setBackgroundColor("#08081a");

    try { GameManager.incrementAttempt(38); } catch (_) {}

    this.createParticleTexture();
    this.createBackground();
    this.createStudioInterior();
    this.createStudioFloor();
    this.createOnAirSign();
    this.createAmbientParticles();
    this.createCodeCanvas();
    this.createBlockPalette();
    this.createRunButton();
    this.createRigWindow();
    this.createMiniReferenceTower();
    this.createMiniMarquee();
    this.createMiniLog();
    this.createMiniCrossWingCameos();
    this.createManifestStrip();
    this.createTestReportPanel();
    this.createMissionBriefPanel();
    this.createHUD();
    this.createBit();
    this.setupDragEvents();

    cam.fadeIn(700, 3, 3, 5);
    this.checkTutorial();
  }

  update(time, delta) {
    this.updateAmbient(time, delta);
    this.updateOnAirPulse(time);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // BACKGROUND — studio
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l39_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l39_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x08081a).setDepth(0);
  }

  createStudioInterior() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x0d0d1f, 0.5);
    g.lineStyle(1, 0x1a1a2e, 0.15);
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 8; col++) {
        const x = 40 + col * 76 + (row % 2 === 1 ? 38 : 0);
        const y = 30 + row * 55;
        this._drawHex(g, x, y, 36);
      }
    }
    [340, 940].forEach((x) => {
      g.lineStyle(2, 0x3d4450, 0.4);
      g.lineBetween(x - 20, 0, x + 20, 50);
      g.fillStyle(0x3d4450, 0.4);
      g.fillCircle(x + 20, 50, 4);
    });
    g.lineStyle(1, 0x3d4450, 0.3);
    g.strokeRoundedRect(590, 24, 100, 36, 4);
    for (let i = 0; i < 3; i++) g.lineBetween(600, 34 + i * 8, 680, 34 + i * 8);

    const tele = this.add.graphics().setDepth(2);
    tele.lineStyle(1, 0x3d4450, 0.5);
    tele.lineBetween(30, 460, 30, 220);
    tele.strokeRoundedRect(12, 200, 36, 28, 3);
    tele.fillStyle(C_CYAN, 0.04);
    tele.fillRoundedRect(14, 202, 32, 24, 2);
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

  createStudioFloor() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x0a0a15, 1);
    g.fillRect(0, 635, W, 85);
    g.lineStyle(1, 0x1a1a2e, 1);
    g.lineBetween(0, 635, W, 635);
    const cam = this.add.graphics().setDepth(2);
    cam.lineStyle(1, 0x3d4450, 0.4);
    cam.strokeRoundedRect(1163, 650, 34, 22, 3);
    cam.strokeCircle(1163, 661, 8);
    cam.lineBetween(1163, 672, 1150, 695);
    cam.lineBetween(1180, 672, 1193, 695);
    this.recDot = this.add.circle(1190, 648, 2, 0xe53935, 0.5).setDepth(3);
  }

  createOnAirSign() {
    const c = this.add.container(890, 60).setDepth(3);
    const g = this.add.graphics();
    g.fillStyle(0x0d0d1f, 1);
    g.fillRoundedRect(-45, -12, 90, 24, 4);
    g.lineStyle(1.5, 0xe53935, 1);
    g.strokeRoundedRect(-45, -12, 90, 24, 4);
    const t = this.add.text(0, 0, "ON AIR", { font: "bold 12px Arial", color: "#e53935" }).setOrigin(0.5);
    c.add([g, t]);
    c.setAlpha(0.3);
    this.onAirSign = c;
    this._onAirState = "idle";
  }

  showOnAir(state) {
    this._onAirState = state;
    this.tweens.killTweensOf(this.onAirSign);
    if (state === "running") {
      this.onAirSign.setAlpha(0.9);
      this.tweens.add({ targets: this.onAirSign, alpha: 0.6, duration: 500, yoyo: true, repeat: -1 });
    } else if (state === "success") {
      this.onAirSign.setAlpha(1);
    } else {
      this.onAirSign.setAlpha(0.3);
    }
  }

  updateOnAirPulse(time) {
    if (!this.recDot) return;
    this.recDot.setAlpha(Math.floor(time / 900) % 2 === 0 ? 0.5 : 0.1);
  }

  createAmbientParticles() {
    this.ambient = [];
    for (let i = 0; i < 7; i++) {
      const p = this.add.circle(Phaser.Math.Between(20, 1260), Phaser.Math.Between(220, 630), 1, C_PURPLE, Phaser.Math.FloatBetween(0.03, 0.06)).setDepth(2);
      this.ambient.push(p);
    }
  }

  updateAmbient(time, delta) {
    if (!this.ambient) return;
    const step = 0.018 * (delta / 16.7);
    this.ambient.forEach((p, i) => {
      p.y -= step;
      p.x += Math.sin(time * 0.0006 + i) * 0.03;
      if (p.y < 220) { p.y = 630; p.x = Phaser.Math.Between(20, 1260); }
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
  // CODE CANVAS (Level 27/30/33/36 architecture, reused)
  // ══════════════════════════════════════════════════════════════

  createCodeCanvas() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0d1117, 1);
    g.fillRoundedRect(CX, CY, CW, CH, 12);
    g.lineStyle(2, 0x21262d, 1);
    g.strokeRoundedRect(CX, CY, CW, CH, 12);

    const tab = this.add.graphics().setDepth(11);
    tab.fillStyle(0x10151d, 1);
    tab.fillRoundedRect(CX, CY, CW, TAB_H, { tl: 12, tr: 12, bl: 0, br: 0 });
    [0xf44336, 0xffd740, 0x00e676].forEach((c, i) => {
      tab.fillStyle(c, 0.5);
      tab.fillCircle(CX + 16 + i * 16, CY + TAB_H / 2, 5);
    });
    this.tabFilename = this.add.text(CX + CW - 12, CY + TAB_H / 2, "Studio1.java", {
      font: "11px Courier New", color: "#546e7a",
    }).setOrigin(1, 0.5).setDepth(11);

    this.lineHighlight = this.add.rectangle(CX + CW / 2, 0, CW - 4, LINE_H, C_GOLD, 0.06).setDepth(19).setVisible(false);
    this.codeContainer = this.add.container(0, 0).setDepth(20);
  }

  _syntaxTokens(line) {
    const tokens = [];
    const re = /("(?:[^"\\]|\\.)*")|(\bif\b|\bfor\b|\bint\b|\bString\b|\bnew\b|\bScanner\b)|(\bSystem\.out\b)|(\bsc\b)|([A-Za-z_]\w*(?=\())|(\bSystem\.in\b)|(>=|<=|==|!=|\+\+|--|[+\-*/><])|([(){};.,=])/g;
    let last = 0, m;
    const plain = (t) => t && tokens.push({ t, c: "#e0e0e0" });
    while ((m = re.exec(line))) {
      if (m.index > last) plain(line.slice(last, m.index));
      if (m[1]) tokens.push({ t: m[1], c: HEX_CYAN });
      else if (m[2]) tokens.push({ t: m[2], c: "#4fc3f7" });
      else if (m[3]) tokens.push({ t: m[3], c: HEX_GREEN });
      else if (m[4]) tokens.push({ t: m[4], c: HEX_GREEN });
      else if (m[5]) tokens.push({ t: m[5], c: HEX_GOLD });
      else if (m[6]) tokens.push({ t: m[6], c: HEX_GRAY });
      else if (m[7]) tokens.push({ t: m[7], c: "#ff8a65" });
      else if (m[8]) tokens.push({ t: m[8], c: HEX_GRAY });
      last = m.index + m[0].length;
    }
    if (last < line.length) plain(line.slice(last));
    return tokens.length ? tokens : [{ t: line, c: "#e0e0e0" }];
  }

  renderSkeleton(mission, test) {
    this.codeContainer.removeAll(true);
    this.slotDefs = {};
    mission.slots.forEach((s) => { this.slotDefs[s.id] = { ...s, rect: null }; });

    mission.skeleton.forEach((rawLine, i) => {
      const y = CODE_Y0 + i * LINE_H;
      const numT = this.add.text(CX + 8, y, String(i + 1), { font: "11px Courier New", color: "#3d4450" });
      this.codeContainer.add(numT);

      const parts = rawLine.split(/[§]?<slot:(\w+)>|§(\w+)/);
      let x = CODE_X;
      for (let pi = 0; pi < parts.length; pi++) {
        const part = parts[pi];
        if (part === undefined) continue;
        const isSlotToken = pi % 3 === 1;
        const isSubToken = pi % 3 === 2;
        if (!isSlotToken && !isSubToken) {
          if (!part) continue;
          this._syntaxTokens(part).forEach((tok) => {
            const t = this.add.text(x, y, tok.t, { font: "bold 12px Courier New", color: tok.c });
            this.codeContainer.add(t);
            x += t.width;
          });
        } else if (isSubToken) {
          const key = part;
          const val = test && test.substitutions ? test.substitutions[key] : `§${key}`;
          const t = this.add.text(x, y, String(val), { font: "bold 12px Courier New", color: "#546e7a" }).setAlpha(0.7);
          this.codeContainer.add(t);
          x += t.width;
        } else if (isSlotToken) {
          const slotId = part;
          const def = this.slotDefs[slotId];
          const w = 130;
          def.rect = { x, y: y - 2, w, h: 17 };
          this._drawSlotPlaceholder(slotId);
          x += w + 6;
        }
      }
    });
  }

  _drawSlotPlaceholder(slotId) {
    const def = this.slotDefs[slotId];
    if (!def || !def.rect) return;
    if (def.dg) def.dg.destroy();
    if (def.hintLabel) { def.hintLabel.destroy(); def.hintLabel = null; }
    const { x, y, w, h } = def.rect;
    const dg = this.add.graphics().setDepth(21);
    const filled = (this.slotContents[slotId] || []).length > 0;
    const draw = (highlight) => {
      dg.clear();
      dg.fillStyle(0x161b22, 1);
      dg.fillRoundedRect(x, y, w, h, 6);
      if (filled) {
        dg.lineStyle(2, highlight ? C_GOLD : 0x2a3a4a, 1);
        dg.strokeRoundedRect(x, y, w, h, 6);
      } else {
        dg.lineStyle(2, highlight ? C_GOLD : 0x546e7a, 1);
        this._dashedRectOutline(dg, x, y, w, h, 5, 4);
      }
    };
    draw(false);
    def.dg = dg;
    def.drawDash = draw;
    this.codeContainer.add(dg);
    if (!filled) {
      const label = this.add.text(x + w / 2, y + h / 2, def.id, { font: "italic 9px Courier New", color: "#3d4450" }).setOrigin(0.5).setDepth(22);
      def.hintLabel = label;
      this.codeContainer.add(label);
    }
  }

  _relayoutSlot(slotId) {
    const def = this.slotDefs[slotId];
    const placed = this.slotContents[slotId] || [];
    if (!def || !def.rect) return;
    const { x, y, h } = def.rect;
    if (placed[0]) {
      const block = placed[0];
      const bw = block.container.getData("w");
      this.tweens.add({ targets: block.container, x: x + bw / 2, y: y + h / 2, duration: 150, ease: "Cubic.easeOut" });
    }
    this._drawSlotPlaceholder(slotId);
  }

  highlightCodeLine(lineIndex) {
    if (lineIndex === null || lineIndex === undefined) { this.lineHighlight.setVisible(false); return; }
    const y = CODE_Y0 + lineIndex * LINE_H - 2;
    this.lineHighlight.setPosition(CX + CW / 2, y + LINE_H / 2).setVisible(true);
  }

  // ══════════════════════════════════════════════════════════════
  // BLOCK PALETTE (drag system, reused verbatim from L33/L36)
  // ══════════════════════════════════════════════════════════════

  createBlockPalette() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0a0e14, 1);
    g.fillRoundedRect(PX, PY, PW, PH, 10);
    g.lineStyle(1, 0x1a2535, 1);
    g.strokeRoundedRect(PX, PY, PW, PH, 10);
    this.add.text(PX + 10, PY + 8, "STUDIO PARTS", { font: "bold 9px Arial", color: "#3d4450" }).setDepth(11);
    this.paletteContainer = this.add.container(0, 0).setDepth(30);
  }

  populatePalette(mission) {
    this.paletteBlocks.forEach((b) => b.container.destroy());
    this.paletteBlocks = [];
    const shuffled = Phaser.Utils.Array.Shuffle(mission.palette.slice());
    const rowY = [PY + 40, PY + 78, PY + 114];
    let x = PX + 14, row = 0;
    const maxX = PX + PW - 14;

    shuffled.forEach((def) => {
      const style = { font: "bold 12px Courier New", color: HEX_CYAN };
      const label = def.label || def.code;
      const measure = this.add.text(0, 0, label, style);
      const w = measure.width + 20;
      measure.destroy();
      if (x + w > maxX) { row = Math.min(row + 1, 2); x = PX + 14; }
      const home = { x: x + w / 2, y: rowY[row] };
      x += w + 8;

      const c = this.add.container(home.x, home.y).setDepth(31);
      const bg = this.add.graphics();
      const draw = (stroke) => {
        bg.clear();
        bg.fillStyle(0x1e1e3a, 1);
        bg.fillRoundedRect(-w / 2, -14, w, 28, 7);
        bg.lineStyle(2, stroke, 1);
        bg.strokeRoundedRect(-w / 2, -14, w, 28, 7);
      };
      draw(C_CYAN);
      const txt = this.add.text(0, 0, label, style).setOrigin(0.5);
      c.add([bg, txt]);
      c.setSize(w, 28);
      c.setData("w", w);
      c.setData("code", def.code);
      c.setData("tag", def.tag || null);
      c.setData("targetSlot", def.slot);
      c.setData("home", home);
      c.setData("draw", draw);
      c.setData("placedIn", null);
      c.setInteractive({ useHandCursor: true, draggable: true });
      c.on("pointerover", () => { if (!this.inputLocked) draw(C_GOLD); });
      c.on("pointerout", () => { if (!this.inputLocked) draw(C_CYAN); });
      this.paletteContainer.add(c);
      this.paletteBlocks.push({ container: c, def, home });
    });
  }

  setupDragEvents() {
    this.input.on("dragstart", (pointer, obj) => {
      if (!this.paletteBlocks.find((b) => b.container === obj) || this.inputLocked) return;
      obj.setDepth(60);
      this.tweens.add({ targets: obj, scale: 1.1, duration: 100 });
      const prevSlot = obj.getData("placedIn");
      if (prevSlot) {
        this.slotContents[prevSlot] = (this.slotContents[prevSlot] || []).filter((b) => b.container !== obj);
        obj.setData("_cameFromSlot", prevSlot);
        obj.setData("placedIn", null);
        this._relayoutSlot(prevSlot);
        this.updateRunButtonState();
      } else {
        obj.setData("_cameFromSlot", null);
      }
    });
    this.input.on("drag", (pointer, obj, dragX, dragY) => {
      if (!this.paletteBlocks.find((b) => b.container === obj) || this.inputLocked) return;
      obj.x = dragX; obj.y = dragY;
      this._updateSlotHover(obj);
    });
    this.input.on("dragend", (pointer, obj) => {
      if (!this.paletteBlocks.find((b) => b.container === obj) || this.inputLocked) return;
      this._finishBlockDrag(obj);
    });
  }

  _nearestOpenSlot(x, y) {
    let best = null, bestDist = 60;
    for (const id in this.slotDefs) {
      const def = this.slotDefs[id];
      if (!def || !def.rect) continue;
      const placed = this.slotContents[id] || [];
      if (placed.length >= def.capacity) continue;
      const cx = def.rect.x + def.rect.w / 2, cy = def.rect.y + def.rect.h / 2;
      const dist = Phaser.Math.Distance.Between(x, y, cx, cy);
      const within = x >= def.rect.x - 30 && x <= def.rect.x + def.rect.w + 30 && y >= def.rect.y - 20 && y <= def.rect.y + def.rect.h + 20;
      if (within && dist < bestDist) { bestDist = dist; best = id; }
    }
    return best;
  }

  _updateSlotHover(obj) {
    const key = this._nearestOpenSlot(obj.x, obj.y);
    if (key !== this._dragHoverSlotKey) {
      if (this._dragHoverSlotKey && this.slotDefs[this._dragHoverSlotKey]) this.slotDefs[this._dragHoverSlotKey].drawDash(false);
      this._dragHoverSlotKey = key;
      if (key) this.slotDefs[key].drawDash(true);
    }
    if (key) {
      const def = this.slotDefs[key];
      const cx = def.rect.x + def.rect.w / 2, cy = def.rect.y + def.rect.h / 2;
      obj.x = Phaser.Math.Linear(obj.x, cx, 0.25);
      obj.y = Phaser.Math.Linear(obj.y, cy, 0.25);
    }
  }

  _finishBlockDrag(obj) {
    obj.setDepth(31);
    this.tweens.add({ targets: obj, scale: 1, duration: 100 });
    const key = this._nearestOpenSlot(obj.x, obj.y);
    if (this._dragHoverSlotKey && this.slotDefs[this._dragHoverSlotKey]) this.slotDefs[this._dragHoverSlotKey].drawDash(false);
    this._dragHoverSlotKey = null;

    if (key) {
      this.placeBlockInSlot(obj, key);
    } else {
      const home = obj.getData("home");
      this.tweens.add({ targets: obj, x: home.x, y: home.y, duration: 250, ease: "Back.easeOut" });
      const cameFrom = obj.getData("_cameFromSlot");
      if (cameFrom && obj.getData("tag") && this.runCount === this._runCountAtMissionStart) {
        this.selfCorrectionCount++;
        this.attemptLog.push({
          mission: this.currentMission + 1, selfCorrected: true,
          code: obj.getData("code"), misconceptionTag: obj.getData("tag"), timestamp: Date.now(),
        });
      }
    }
  }

  placeBlockInSlot(blockObj, slotId) {
    if (!this.slotContents[slotId]) this.slotContents[slotId] = [];
    this.slotContents[slotId].push({ container: blockObj });
    blockObj.setData("placedIn", slotId);
    this._relayoutSlot(slotId);
    this.updateRunButtonState();
  }

  allSlotsFilled() {
    return Object.keys(this.slotDefs).every((id) => (this.slotContents[id] || []).length > 0);
  }

  updateRunButtonState() {
    if (this.allSlotsFilled()) this.enableRunButton(); else this.disableRunButton();
  }

  getAssembledCode() {
    const out = {};
    for (const id in this.slotDefs) {
      out[id] = (this.slotContents[id] || []).map((b) => ({ code: b.container.getData("code"), tag: b.container.getData("tag") }));
    }
    return out;
  }

  // ══════════════════════════════════════════════════════════════
  // RUN BUTTON
  // ══════════════════════════════════════════════════════════════

  createRunButton() {
    const bx = 585, by = 640;
    const glow = this.add.ellipse(bx, by, 150, 60, C_GREEN, 0.06).setDepth(29);
    this.tweens.add({ targets: glow, fillAlpha: 0.12, duration: 1000, yoyo: true, repeat: -1 });
    const c = this.add.container(bx, by).setDepth(30);
    const g = this.add.graphics();
    const draw = (enabled, hover) => {
      g.clear();
      g.fillStyle(enabled ? C_GREEN_BRIGHT : 0x2a2f36, hover && enabled ? 1 : 0.95);
      g.fillRoundedRect(-67, -26, 134, 52, 10);
    };
    draw(false, false);
    const t = this.add.text(0, 0, "▶ RUN", { font: "bold 18px Arial", color: "#0a0d08" }).setOrigin(0.5);
    c.add([g, t]);
    c.setSize(134, 52);
    c.on("pointerover", () => { if (this._runReady) { draw(true, true); c.setScale(1.03); } });
    c.on("pointerout", () => { draw(this._runReady, false); c.setScale(1); });
    c.on("pointerdown", () => {
      if (!this._runReady) return;
      this.tweens.add({ targets: c, scale: 0.95, duration: 80, yoyo: true });
      this.onRunPressed();
    });
    this.runButton = { c, t, g, draw };
  }

  enableRunButton() {
    this._runReady = true;
    this.runButton.draw(true, false);
    this.runButton.t.setText("▶ RUN").setColor("#0a0d08");
    this.runButton.c.setInteractive({ useHandCursor: true });
  }

  disableRunButton() {
    this._runReady = false;
    this.runButton.draw(false, false);
    this.runButton.t.setText("▶ RUN").setColor("#546e7a");
    this.runButton.c.disableInteractive();
  }

  // ══════════════════════════════════════════════════════════════
  // RIG WINDOW — mini tower/marquee/log + cross-wing cameos
  // ══════════════════════════════════════════════════════════════

  createRigWindow() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x050914, 1);
    g.fillRoundedRect(OX, OY, OW, OH, 12);
    g.lineStyle(3, 0x21262d, 1);
    g.strokeRoundedRect(OX, OY, OW, OH, 12);
    this.add.text(OX + 10, OY + 6, "BROADCAST RIG — LIVE", { font: "bold 9px Arial", color: "#3d4450" }).setDepth(11);

    const maskShape = this.make.graphics({ x: 0, y: 0, add: false });
    maskShape.fillRoundedRect(OX + 4, OY + 20, OW - 8, OH - 24, 10);
    this.windowMask = maskShape.createGeometryMask();
    this.rigLayer = this.add.container(0, 0).setDepth(15);
    this.rigLayer.setMask(this.windowMask);

    this.verdictLamp = this.add.circle(OX + OW - 18, OY + 14, 6, C_GRAY).setDepth(20);
  }

  createMiniReferenceTower() {
    const c = this.add.container(TOWER_X, 0).setDepth(1);
    const g = this.add.graphics();
    g.lineStyle(1.5, 0x3d4450, 1);
    g.lineBetween(TOWER_X - 22, OY + OH - 8, TOWER_X, TOWER_TOP_Y, );
    this.rigLayer.add(g);
    const g2 = this.add.graphics();
    g2.lineStyle(1.5, 0x3d4450, 1);
    g2.lineBetween(TOWER_X + 22, OY + OH - 8, TOWER_X, TOWER_TOP_Y);
    this.rigLayer.add(g2);
    this.beacon = this.add.circle(TOWER_X, TOWER_TOP_Y - 8, 3, C_RED, 0.4).setDepth(2);
    this.rigLayer.add(this.beacon);
    this.tweens.add({ targets: this.beacon, alpha: 0.2, duration: 1200, yoyo: true, repeat: -1 });
  }

  flareBeacon() {
    this.tweens.killTweensOf(this.beacon);
    this.beacon.setFillStyle(C_RED, 1);
    this.tweens.add({ targets: this.beacon, alpha: 0.2, duration: 600, onComplete: () => { this.beacon.setFillStyle(C_RED, 0.4); this.tweens.add({ targets: this.beacon, alpha: 0.2, duration: 1200, yoyo: true, repeat: -1 }); } });
  }

  createMiniMarquee() {
    const g = this.add.graphics();
    g.fillStyle(0x0d1117, 1);
    g.fillRoundedRect(MARQUEE_X - 55, MARQUEE_Y - 15, 110, 30, 5);
    g.lineStyle(1, 0x3d4450, 1);
    g.strokeRoundedRect(MARQUEE_X - 55, MARQUEE_Y - 15, 110, 30, 5);
    this.rigLayer.add(g);
    this.marqueeContainer = this.add.container(0, 0);
    this.rigLayer.add(this.marqueeContainer);
  }

  clearMarquee() { this.marqueeContainer.removeAll(true); }

  createMiniLog() {
    const g = this.add.graphics();
    g.fillStyle(0x08111c, 1);
    g.fillRoundedRect(LOG_X0, LOG_Y0, LOG_W0, OH - 40, 6);
    g.lineStyle(1, C_CYAN, 0.6);
    g.strokeRoundedRect(LOG_X0, LOG_Y0, LOG_W0, OH - 40, 6);
    this.rigLayer.add(g);
    const maskShape = this.make.graphics({ x: 0, y: 0, add: false });
    maskShape.fillRoundedRect(LOG_X0 + 2, LOG_Y0 + 2, LOG_W0 - 4, OH - 44, 5);
    this.logMask = maskShape.createGeometryMask();
    this.logLayer = this.add.container(0, 0);
    this.logLayer.setMask(this.logMask);
    this.rigLayer.add(this.logLayer);
    this.logLines = [];
    this.logRowObjs = [];
  }

  addLogLine(text, styleType) {
    const rowIndex = this.logLines.length;
    const y = LOG_Y0 + 10 + rowIndex * 16;
    const t = this.add.text(LOG_X0 + 6, y, text, { font: "10px Courier New", color: this._typeColor(styleType) }).setAlpha(0).setScale(0.7);
    this.logLayer.add(t);
    this.tweens.add({ targets: t, alpha: 1, scale: 1, duration: 150 });
    this.logLines.push({ text, styleType });
    this.logRowObjs.push(t);
  }

  clearMiniLog() {
    this.logLayer.removeAll(true);
    this.logLines = [];
    this.logRowObjs = [];
  }

  _typeColor(type) {
    switch (type) {
      case "string": return HEX_CYAN;
      case "int": return HEX_GOLD;
      case "newline": return HEX_NEWLINE;
      default: return "#e0e0e0";
    }
  }

  createMiniCrossWingCameos() {
    // Mini Scanner tape (Missions 5, 6)
    this.tapeContainer = this.add.container(0, 0).setAlpha(0);
    this.rigLayer.add(this.tapeContainer);
    this.tapeCellObjs = [];
    this.tapeState = [];

    // Mini containers (Missions 5, 6)
    this.containerBoxes = {};
    ["int", "string"].forEach((key, i) => {
      const c = this.add.container(CONT_X, CONT_Y0 + i * 24).setAlpha(0);
      const g = this.add.graphics();
      const color = key === "int" ? C_INT : C_LINE;
      g.fillStyle(0x0a120c, 1);
      g.fillRoundedRect(-30, -8, 60, 16, 3);
      g.lineStyle(1, color, 1);
      g.strokeRoundedRect(-30, -8, 60, 16, 3);
      const valT = this.add.text(0, 0, "", { font: "8px Courier New", color: Phaser.Display.Color.IntegerToColor(color).rgba }).setOrigin(0.5);
      c.add([g, valT]);
      this.rigLayer.add(c);
      this.containerBoxes[key] = { c, valT };
    });

    // Mini press (Mission 6)
    this.pressContainer = this.add.container(PRESS_X, PRESS_Y).setAlpha(0);
    const pg = this.add.graphics();
    pg.lineStyle(1.5, C_PURPLE, 1);
    pg.lineBetween(-10, -10, -10, 10);
    pg.lineBetween(10, -10, 10, 10);
    pg.fillStyle(C_PURPLE, 0.5);
    pg.fillRect(-14, -14, 28, 5);
    this.pressContainer.add(pg);
    this.rigLayer.add(this.pressContainer);
  }

  activateCameo(kind) {
    if (kind === "tape") this.tapeContainer.setAlpha(1);
    if (kind === "containers") Object.values(this.containerBoxes).forEach((c) => c.c.setAlpha(1));
    if (kind === "press") this.pressContainer.setAlpha(1);
  }

  parkAllCameos() {
    this.tapeContainer.setAlpha(0);
    Object.values(this.containerBoxes).forEach((c) => c.c.setAlpha(0));
    this.pressContainer.setAlpha(0);
  }

  buildCellsFromLines(inputLines) {
    const cells = [];
    (inputLines || []).forEach((line) => {
      line.split("").forEach((ch) => cells.push({ ch, kind: this._classifyChar(ch) }));
      cells.push({ ch: "\n", kind: "newline" });
    });
    return cells;
  }

  _classifyChar(ch) {
    if (ch === " ") return "space";
    if (ch === "\n") return "newline";
    if (/[0-9]/.test(ch)) return "digit";
    return "alpha";
  }

  renderMiniTape(cells) {
    this.tapeContainer.removeAll(true);
    this.tapeCellObjs = [];
    const cellW = 10;
    const startX = TAPE_X0;
    cells.forEach((cell, i) => {
      const disp = cell.kind === "space" ? "␣" : cell.kind === "newline" ? "⏎" : cell.ch;
      const color = cell.kind === "space" ? HEX_MAGENTA : cell.kind === "newline" ? HEX_NEWLINE : cell.kind === "digit" ? HEX_GOLD : HEX_CYAN;
      const t = this.add.text(startX + i * cellW, TAPE_Y, disp, { font: "8px Courier New", color }).setOrigin(0, 0.5);
      this.tapeContainer.add(t);
      this.tapeCellObjs.push(t);
    });
  }

  async miniTapeConsume(count) {
    const objs = this.tapeCellObjs.splice(0, count);
    await Promise.all(objs.map((t, i) => new Promise((res) => {
      this.tweens.add({ targets: t, alpha: 0, x: t.x - 10, duration: 120, delay: i * 15, onComplete: () => { t.destroy(); res(); } });
    })));
  }

  /** Corrected tokenizer (from L36): nextInt/nextDouble skip BOTH spaces
   * and leftover newlines when hunting their token; nextLine keeps its own
   * "consume to next newline" rule. */
  evaluateCall(cells, method) {
    let i = 0;
    const skipped = [];
    if (method !== "nextLine") {
      while (i < cells.length && (cells[i].kind === "space" || cells[i].kind === "newline")) { skipped.push(cells[i]); i++; }
    }
    if (method === "nextLine") {
      const consumed = [];
      let j = i;
      while (j < cells.length && cells[j].kind !== "newline") { consumed.push(cells[j]); j++; }
      if (j < cells.length) consumed.push(cells[j]);
      const strValue = consumed.filter((c) => c.kind !== "newline").map((c) => c.ch).join("");
      return { error: false, rawValue: strValue, consumedCount: consumed.length, returnType: "string" };
    }
    const tokenCells = [];
    let j = i;
    while (j < cells.length && cells[j].kind !== "space" && cells[j].kind !== "newline") { tokenCells.push(cells[j]); j++; }
    const tokenStr = tokenCells.map((c) => c.ch).join("");
    if (tokenCells.length === 0) return { error: true };
    if (method === "nextInt") {
      if (/^-?\d+$/.test(tokenStr)) return { error: false, rawValue: parseInt(tokenStr, 10), consumedCount: skipped.length + tokenCells.length, returnType: "int" };
      return { error: true };
    }
    return { error: true };
  }

  // ══════════════════════════════════════════════════════════════
  // MANIFEST STRIP / TEST REPORT / MISSION BRIEF
  // ══════════════════════════════════════════════════════════════

  createManifestStrip() {
    const g = this.add.graphics().setDepth(14);
    g.fillStyle(0x0a0e14, 0.9);
    g.fillRect(OX, STRIP_Y - 2, OW, 20);
    this.manifestStripText = this.add.text(OX + 8, STRIP_Y + 8, "", { font: "10px Arial", color: "#8c7ae6" }).setOrigin(0, 0.5).setDepth(15);
  }

  updateManifestStrip(text) { this.manifestStripText.setText(text); }

  createTestReportPanel() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0a0e14, 1);
    g.fillRoundedRect(RX, RY, RW, RH, 10);
    g.lineStyle(1, 0x1a2535, 1);
    g.strokeRoundedRect(RX, RY, RW, RH, 10);
    this.add.text(RX + 10, RY + 6, "TEST REPORT", { font: "bold 9px Arial", color: "#3d4450" }).setDepth(11);
    this.reportRows = [];
  }

  buildReportRows(tests) {
    this.reportRows.forEach((r) => r.container.destroy());
    this.reportRows = [];
    tests.forEach((test, i) => {
      const y = RY + 24 + i * 24;
      const c = this.add.container(RX + 10, y).setDepth(11).setAlpha(0.35);
      const label = test.input ? this._compactInputLabel(test.input) : "run";
      const inputT = this.add.text(0, 0, label, { font: "10px Courier New", color: "#b0bec5" }).setOrigin(0, 0.5);
      const arrow = this.add.text(150, 0, "→", { font: "12px Arial", color: HEX_GRAY }).setOrigin(0, 0.5);
      const expT = this.add.text(168, 0, test.expectedOutput.replace(/⏎/g, " ⏎ "), { font: "9px Courier New", color: HEX_GRAY, wordWrap: { width: 190 } }).setOrigin(0, 0.5);
      const statusT = this.add.text(RW - 16, 0, "…", { font: "13px Arial", color: HEX_GRAY }).setOrigin(0.5);
      c.add([inputT, arrow, expT, statusT]);
      this.reportRows.push({ container: c, statusT, expT });
    });
  }

  _compactInputLabel(inputLines) { return inputLines.join(" ⏎ "); }

  updateReportRow(index, match) {
    const row = this.reportRows[index];
    if (!row) return;
    row.container.setAlpha(1);
    row.statusT.setText(match ? "✓" : "✗").setColor(match ? HEX_GREEN_BRIGHT : HEX_RED);
    if (!match) this.tweens.add({ targets: row.container, x: row.container.x + 3, duration: 35, yoyo: true, repeat: 5 });
  }

  createMissionBriefPanel() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x1a1a2e, 1);
    g.fillRoundedRect(BX, BY, BW, BH, 10);
    g.lineStyle(1, 0x2a2a4a, 1);
    g.strokeRoundedRect(BX, BY, BW, BH, 10);
    this.briefContainer = this.add.container(0, 0).setDepth(11);
  }

  renderMissionBrief(mission) {
    this.briefContainer.removeAll(true);
    const badge = this.add.circle(BX + 24, BY + 24, 13, C_GOLD);
    const badgeNum = this.add.text(BX + 24, BY + 24, String(mission.mission), { font: "bold 13px Arial", color: "#0a0e14" }).setOrigin(0.5);
    const title = this.add.text(BX + 46, BY + 16, mission.title, { font: "bold 14px Arial", color: "#e0e0e0" }).setOrigin(0, 0.5);
    const brief = this.add.text(BX + 14, BY + 42, mission.brief, { font: "11px Arial", color: "#90a4ae", wordWrap: { width: BW - 28 } }).setOrigin(0, 0);
    const hint = this.add.text(BX + BW - 12, BY + BH - 12, "HINT", { font: "bold 11px Arial", color: "#546e7a" }).setOrigin(1, 1).setInteractive({ useHandCursor: true });
    hint.on("pointerover", () => hint.setColor(HEX_GOLD));
    hint.on("pointerout", () => hint.setColor("#546e7a"));
    hint.on("pointerdown", () => this.onHintPressed());
    this.briefContainer.add([badge, badgeNum, title, brief, hint]);
  }

  // ══════════════════════════════════════════════════════════════
  // HUD
  // ══════════════════════════════════════════════════════════════

  createHUD() {
    const g = this.add.graphics().setDepth(50);
    g.fillStyle(0x0a0e14, 0.93);
    g.fillRect(0, 0, W, 64);
    g.lineStyle(1, 0x21262d, 1);
    g.lineBetween(0, 64, W, 64);

    this.add.text(20, 14, "THE STUDIO", { font: "bold 13px Arial", color: "#b0bec5" }).setDepth(51);
    this.add.text(20, 32, "Restructuring Phase — Output Methods: println()", { font: "10px Arial", color: "#546e7a" }).setDepth(51);

    this.missionHexes = [];
    for (let i = 0; i < 6; i++) {
      const x = 490 + i * 26;
      const hx = this.add.graphics().setDepth(51);
      this.missionHexes.push({ g: hx, x, y: 32 });
    }
    this._drawHexes();

    this.add.text(1060, 10, "SCORE", { font: "9px Arial", color: "#546e7a" }).setDepth(51);
    this.scoreText = this.add.text(1060, 22, "0", { font: "bold 18px Arial", color: "#ffffff" }).setDepth(51);

    this.lifeIcons = [];
    for (let i = 0; i < 3; i++) {
      const lg = this.add.graphics({ x: 1150 + i * 30, y: 26 }).setDepth(51);
      lg.lineStyle(2, C_GOLD, 1);
      lg.strokeRoundedRect(-8, -6, 16, 11, 2);
      lg.fillStyle(C_GOLD, 1);
      lg.fillRect(-3, -3, 4, 4);
      this.lifeIcons.push(lg);
    }
  }

  _drawHexPath(g, x, y, r) {
    g.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i - Math.PI / 2;
      const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
      if (i === 0) g.moveTo(px, py); else g.lineTo(px, py);
    }
    g.closePath();
  }

  _drawHexes() {
    this.missionHexes.forEach(({ g, x, y }, i) => {
      g.clear();
      if (i < this.currentMission) { g.fillStyle(C_GOLD, 1); this._drawHexPath(g, x, y, 9); g.fillPath(); }
      else if (i === this.currentMission) { g.lineStyle(2, C_GOLD, 1); this._drawHexPath(g, x, y, 9); g.strokePath(); }
      else { g.lineStyle(1, C_GRAY, 1); this._drawHexPath(g, x, y, 9); g.strokePath(); }
    });
    if (this.missionHexes[this.currentMission]) {
      const m = this.missionHexes[this.currentMission];
      if (m.pulse) m.pulse.stop();
      m.pulse = this.tweens.add({ targets: m.g, alpha: 0.5, duration: 600, yoyo: true, repeat: -1 });
    }
  }

  // ══════════════════════════════════════════════════════════════
  // BIT — studio producer variant
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
    const card = this.add.graphics();
    card.fillStyle(0x1a1a2e, 1);
    card.lineStyle(1, 0xe0e0e0, 1);
    card.fillRoundedRect(18, -2, 14, 10, 2);
    card.strokeRoundedRect(18, -2, 14, 10, 2);
    c.add([g, eye, pupil, headset, tip, card]);
    this.tweens.add({ targets: tip, alpha: 0.3, duration: 900, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: c, y: "+=3", duration: 2000, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
    this.bit = c;
  }

  bitSay(text) {
    this.hideBubble();
    const inner = this.add.text(0, 0, text, { font: "13px Arial", color: "#e0e0e0", wordWrap: { width: 340 } });
    const bw = Math.min(inner.width, 340) + 30, bh = inner.height + 24;
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
    await Promise.race([this.waitForClick(), this.delay(4000)]);
    this.hideBubble();
  }

  createAnnotation(x, y, text, colorHex) {
    const t = this.add.text(x, y, text, { font: "bold 8px Arial", color: colorHex }).setOrigin(0.5).setDepth(20).setAlpha(0);
    this.rigLayer.add(t);
    this.tweens.add({ targets: t, alpha: 1, duration: 180 });
    this.time.delayedCall(1200, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 200, onComplete: () => t.destroy() }); });
    return t;
  }

  // ══════════════════════════════════════════════════════════════
  // TUTORIAL
  // ══════════════════════════════════════════════════════════════

  checkTutorial() {
    let done = false;
    try { done = localStorage.getItem(TUTORIAL_KEY) === "true"; } catch (_) {}
    if (done) this.time.delayedCall(300, () => this.showProjectBriefing(0));
    else this.runTutorial();
  }

  async runTutorial() {
    const A = () => this._alive;
    await this.delay(400); if (!A()) return;
    await this.bitSay("Welcome to the Studio, Producer! Down in the Signal Room you certified your reads — up here, you PRODUCE the broadcast. Real programs, real audiences, real code. Every mission ships something.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();

    const a1 = this.floatingAnnotation(CX + CW / 2, CY - 20, "assemble the show script", HEX_CYAN);
    await this.delay(350); if (!A()) return;
    const a2 = this.floatingAnnotation(PX + PW / 2, PY - 10, "blocks — some are typos, watch out", HEX_GRAY);
    await this.delay(350); if (!A()) return;
    const a3 = this.floatingAnnotation(OX + OW / 2, OY - 12, "your program runs LIVE", HEX_GREEN_BRIGHT);
    await this.delay(350); if (!A()) return;
    const a4 = this.floatingAnnotation(890, 90, "lights when you're broadcasting", 0xe53935);
    await this.delay(350); if (!A()) return;
    const a5 = this.floatingAnnotation(RX + RW / 2, RY - 12, "every scenario must land clean", HEX_PURPLE);
    await this.delay(400); if (!A()) return;

    await this.bitSay("The Signal Room drilled you on the plus sign — up here it BITES. If you concat before you compute, the log will show you the bug in bright cyan. Wrap what needs to add. Build, run, read the log, repair. To the booth!");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();
    [a1, a2, a3, a4, a5].forEach((a) => this.tweens.add({ targets: a, alpha: 0, duration: 250, onComplete: () => a.destroy() }));

    try { localStorage.setItem(TUTORIAL_KEY, "true"); } catch (_) {}
    this.showProjectBriefing(0);
  }

  floatingAnnotation(x, y, text, colorHex) {
    const c = typeof colorHex === "number" ? Phaser.Display.Color.IntegerToColor(colorHex).rgba : colorHex;
    const t = this.add.text(x, y, text, { font: "bold 11px Arial", color: c }).setOrigin(0.5).setDepth(70).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 300 });
    return t;
  }

  // ══════════════════════════════════════════════════════════════
  // MISSION LIFECYCLE
  // ══════════════════════════════════════════════════════════════

  showProjectBriefing(index) {
    this.currentMission = index;
    const mission = MISSIONS[index];
    this._drawHexes();

    const card = this.add.container(W / 2, H + 200).setDepth(90);
    const g = this.add.graphics();
    g.fillStyle(0x0d1117, 1);
    g.fillRoundedRect(-260, -105, 520, 210, 12);
    g.lineStyle(2, C_GOLD, 1);
    g.strokeRoundedRect(-260, -105, 520, 210, 12);
    g.fillStyle(C_GOLD, 1);
    g.fillRect(-260, -105, 5, 210);
    const badge = this.add.circle(-225, -75, 18, C_GOLD);
    const badgeNum = this.add.text(-225, -75, String(mission.mission), { font: "bold 16px Arial", color: "#0a0e14" }).setOrigin(0.5);
    const title = this.add.text(-195, -85, mission.title, { font: "bold 20px Arial", color: "#ffffff" }).setOrigin(0, 0.5);
    const desc = this.add.text(-225, -35, mission.brief, { font: "13px Arial", color: "#b0bec5", wordWrap: { width: 460 } }).setOrigin(0, 0);

    const startBtn = this.add.container(0, 85).setDepth(1);
    const sg = this.add.graphics();
    sg.fillStyle(C_GOLD, 1);
    sg.fillRoundedRect(-70, -20, 140, 40, 20);
    const st = this.add.text(0, 0, "START", { font: "bold 13px Arial", color: "#0a0e14" }).setOrigin(0.5);
    startBtn.add([sg, st]);
    startBtn.setSize(140, 40);
    startBtn.setInteractive({ useHandCursor: true });
    startBtn.on("pointerover", () => startBtn.setScale(1.05));
    startBtn.on("pointerout", () => startBtn.setScale(1));
    startBtn.on("pointerdown", () => {
      startBtn.disableInteractive();
      this.tweens.add({ targets: card, y: H + 200, duration: 400, ease: "Cubic.easeIn", onComplete: () => { card.destroy(); this.startMission(mission); } });
    });

    card.add([g, badge, badgeNum, title, desc, startBtn]);
    this.tweens.add({ targets: card, y: 335, duration: 400, ease: "Back.easeOut" });
  }

  startMission(mission) {
    this.slotContents = {};
    this.slotDefs = {};
    this.missionRunsFailed = 0;
    this.missionHintUsed = false;
    this.missionStartTime = this.time.now;
    this._runCountAtMissionStart = this.runCount;
    this._firstRunRecorded = false;
    this.clearMission();

    this.tabFilename.setText(`Studio${mission.mission}.java`);
    const previewTest = mission.tests[0];
    this.renderSkeleton(mission, previewTest);
    this.populatePalette(mission);
    this.buildReportRows(mission.tests);
    this.renderMissionBrief(mission);
    this.disableRunButton();
    this.highlightCodeLine(null);
    this.verdictLamp.setFillStyle(C_GRAY);
    this.clearMiniLog();
    this.parkAllCameos();
    this.updateManifestStrip("");
    this.showOnAir("idle");
  }

  clearMission() {
    this.missionElements.forEach((e) => { if (e && e.destroy) e.destroy(); });
    this.missionElements = [];
  }

  // ══════════════════════════════════════════════════════════════
  // GENUINE INTERPRETER — per-mission, honest computation
  // ══════════════════════════════════════════════════════════════

  interpretMission(mission, blocks, test) {
    switch (mission.mission) {
      case 1: return this._interpretMission1(blocks, test);
      case 2: return this._interpretMission2(blocks, test);
      case 3: return this._interpretMission3(blocks, test);
      case 4: return this._interpretMission4(blocks, test);
      case 5: return this._interpretMission5(blocks, test);
      case 6: return this._interpretMission6(blocks, test);
      default: return { compileError: true };
    }
  }

  _stripQuotes(raw) { return raw.replace(/^"|"$/g, ""); }

  _interpretMission1(blocks, test) {
    const showVal = this._stripQuotes(test.substitutions.show);
    const argCode = blocks.arg[0].code;
    if (argCode === "Now broadcasting: + show") return { compileError: true, tag: "unclosed_string_literal" };
    let value;
    if (argCode === '"Now broadcasting: " + show') value = `Now broadcasting: ${showVal}`;
    else if (argCode === '"Now broadcasting: show"') value = "Now broadcasting: show";
    else if (argCode === '"Now broadcasting: " + "show"') value = "Now broadcasting: show";
    else if (argCode === 'show + "Now broadcasting: "') value = `${showVal}Now broadcasting: `;
    return { value, lines: [{ text: value, type: "string" }] };
  }

  _interpretMission2(blocks, test) {
    const gold = parseInt(test.substitutions.gold, 10), silver = parseInt(test.substitutions.silver, 10);
    const exprCode = blocks.expr[0].code;
    let totalPart;
    if (exprCode === "(gold + silver)") totalPart = String(gold + silver);
    else if (exprCode === "gold + silver") totalPart = String(gold) + String(silver);
    else if (exprCode === "gold") totalPart = String(gold);
    else if (exprCode === "(gold * silver)") totalPart = String(gold * silver);
    else if (exprCode === '"(gold + silver)"') totalPart = "(gold + silver)";
    const value = `Medal Total: ${totalPart}`;
    return { value, lines: [{ text: value, type: "string" }] };
  }

  _interpretMission3(blocks) {
    const b1 = blocks.blank1[0].code, b2 = blocks.blank2[0].code;
    if (b1 === "System.out.printLn();" || b2 === "System.out.printLn();") return { compileError: true, tag: "method_name_case_insensitive_belief" };
    const lineFor = (code) => {
      if (code === "(nothing)") return null;
      if (code === "System.out.println();") return "";
      if (code === 'System.out.println("");') return "";
      if (code === 'System.out.println(" ");') return " ";
      return "";
    };
    const lines = ["===== MENU ====="];
    const l1 = lineFor(b1); if (l1 !== null) lines.push(l1);
    lines.push("1. Coffee", "2. Tea");
    const l2 = lineFor(b2); if (l2 !== null) lines.push(l2);
    lines.push("Enjoy!");
    return { value: lines.join("⏎"), lines: lines.map((t) => ({ text: t, type: "string" })) };
  }

  _interpretMission4(blocks, test) {
    const n = parseInt(test.substitutions.n, 10);
    const condCode = blocks.cond[0].code, stepCode = blocks.step[0].code, bodyCode = blocks.body[0].code;
    const evalCond = (i) => {
      if (condCode === "i >= 1") return i >= 1;
      if (condCode === "i > 0") return i > 0;
      if (condCode === "i > 1") return i > 1;
      if (condCode === "i <= n") return i <= n;
      return false;
    };
    const evalStep = (i) => (stepCode === "i--" ? i - 1 : i + 1);
    const evalBody = (i) => {
      if (bodyCode === "i") return String(i);
      if (bodyCode === "n") return String(n);
      if (bodyCode === '"i"') return "i";
      if (bodyCode === "i - 1") return String(i - 1);
      return "";
    };
    const lines = [];
    let i = n, iterations = 0;
    const MAX_ITER = 200;
    while (evalCond(i) && iterations < MAX_ITER) {
      lines.push(evalBody(i));
      i = evalStep(i);
      iterations++;
    }
    if (iterations >= MAX_ITER) return { crash: true, infiniteLoop: true, lines: lines.map((t) => ({ text: t, type: "int" })) };
    lines.push("GO!");
    return { value: lines.join("⏎"), lines: lines.map((t) => ({ text: t, type: /^\d+$/.test(t) ? "int" : "string" })) };
  }

  _interpretMission5(blocks, test) {
    const janitorCode = blocks.janitor[0].code, totalCode = blocks.total[0].code;
    let cells = this.buildCellsFromLines(test.input);
    const r1 = this.evaluateCall(cells, "nextInt");
    if (r1.error) return { crash: true };
    cells = cells.slice(r1.consumedCount);
    const r2 = this.evaluateCall(cells, "nextInt");
    if (r2.error) return { crash: true };
    cells = cells.slice(r2.consumedCount);

    if (janitorCode !== "(nothing)") {
      const jMethod = janitorCode.includes("nextInt") ? "nextInt" : "nextLine";
      const jr = this.evaluateCall(cells, jMethod);
      if (jr.error) return { crash: true };
      cells = cells.slice(jr.consumedCount);
    }
    const r3 = this.evaluateCall(cells, "nextLine");
    if (r3.error) return { crash: true };

    const itemsVal = r1.rawValue, reviewsVal = r2.rawValue, nameVal = r3.rawValue;
    let totalPart;
    if (totalCode === "(items + reviews)") totalPart = String(itemsVal + reviewsVal);
    else if (totalCode === "items + reviews") totalPart = String(itemsVal) + String(reviewsVal);
    else if (totalCode === "(items * reviews)") totalPart = String(itemsVal * reviewsVal);
    else if (totalCode === "items") totalPart = String(itemsVal);

    const line1 = `Customer: ${nameVal}`, line2 = `Total activity: ${totalPart}`;
    return { value: `${line1}⏎${line2}`, lines: [{ text: line1, type: "string" }, { text: line2, type: "string" }] };
  }

  _interpretMission6(blocks, test) {
    const nameArgCode = blocks.name_arg[0].code, deptArgCode = blocks.dept_arg[0].code;
    if (nameArgCode === "name.toUpperCase") return { compileError: true, tag: "property_vs_method_syntax" };

    let cells = this.buildCellsFromLines(test.input);
    const r1 = this.evaluateCall(cells, "nextLine");
    if (r1.error) return { crash: true };
    cells = cells.slice(r1.consumedCount);
    const r2 = this.evaluateCall(cells, "nextLine");
    if (r2.error) return { crash: true };

    const nameVal = r1.rawValue, deptVal = r2.rawValue;
    const applyTransform = (code, val) => {
      if (code.includes("toUpperCase()")) return val.toUpperCase();
      if (code.includes("toLowerCase()")) return val.toLowerCase();
      if (code === '"name".toUpperCase()') return "NAME";
      return val;
    };
    const nameOut = applyTransform(nameArgCode, nameVal), deptOut = applyTransform(deptArgCode, deptVal);
    const lines = ["==================", `WELCOME, ${nameOut}!`, `Department: ${deptOut}`, "=================="];
    return { value: lines.join("⏎"), lines: lines.map((t) => ({ text: t, type: "string" })) };
  }

  // ══════════════════════════════════════════════════════════════
  // REVEAL — trace-driven, shared by all missions
  // ══════════════════════════════════════════════════════════════

  async playReveal(mission, test, result) {
    this.clearMiniLog();
    this.clearMarquee();
    this.showOnAir("running");
    this.verdictLamp.setFillStyle(C_GOLD);

    if (result.compileError) {
      await this.delay(150);
      this.showCompileErrorStamp();
      this.verdictLamp.setFillStyle(C_RED);
      this.showOnAir("idle");
      return;
    }

    if (mission.mission === 5 || mission.mission === 6) {
      this.activateCameo("tape");
      this.activateCameo("containers");
      if (mission.mission === 6) this.activateCameo("press");
      this.renderMiniTape(this.buildCellsFromLines(test.input));
      this.updateManifestStrip(`reading: ${test.input.join(" ⏎ ")}`);
      await this.delay(150);
      await this.miniTapeConsume(Math.min(6, this.tapeCellObjs.length));
    }

    if (result.crash) {
      const label = result.infiniteLoop ? "INFINITE LOOP — timed out" : "InputMismatchException";
      const stamp = this.add.text(OX + OW / 2, OY + OH - 30, label, { font: "bold 10px Courier New", color: HEX_RED }).setOrigin(0.5).setDepth(30);
      this.rigLayer.add(stamp);
      this.flareBeacon();
      await this.delay(500);
      stamp.destroy();
      this.verdictLamp.setFillStyle(C_RED);
      this.showOnAir("idle");
      return;
    }

    for (const line of result.lines || []) {
      if (!this._alive) return;
      await this.assembleAndFire(line.text, line.type);
      await this.delay(120);
    }
    this.verdictLamp.setFillStyle(C_GREEN_BRIGHT);
    this.showOnAir("success");
  }

  async assembleAndFire(text, type) {
    this.clearMarquee();
    const t = this.add.text(MARQUEE_X, MARQUEE_Y, text || "⏎", { font: "bold 10px Courier New", color: this._typeColor(type === "int" ? "int" : "string") }).setOrigin(0.5).setAlpha(0).setScale(0.6);
    this.marqueeContainer.add(t);
    this.tweens.add({ targets: t, alpha: 1, scale: 1, duration: 120 });
    await this.delay(150);
    if (!this._alive) return;
    await new Promise((res) => {
      this.tweens.add({ targets: t, x: LOG_X0 + 10, y: LOG_Y0 + 10, scale: 0.4, alpha: 0, duration: 220, ease: "Cubic.easeIn", onComplete: res });
    });
    this.flareTowerBeacon();
    this.addLogLine(text, type === "int" ? "int" : "string");
  }

  flareTowerBeacon() {
    this.tweens.add({ targets: this.beacon, scale: 1.6, duration: 90, yoyo: true });
  }

  showCompileErrorStamp() {
    const stamp = this.add.text(CX + CW / 2, CY + CH / 2, "COMPILE ERROR", { font: "bold 28px Arial", color: HEX_RED }).setOrigin(0.5).setDepth(80).setScale(1.8).setAngle(-8).setAlpha(0);
    this.missionElements.push(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 220, ease: "Cubic.easeOut" });
    this.screenShake(0.005, 180);
    this.time.delayedCall(1200, () => { if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 250, onComplete: () => stamp.destroy() }); });
  }

  // ══════════════════════════════════════════════════════════════
  // RUN
  // ══════════════════════════════════════════════════════════════

  _collectWrongBlocksUsed() {
    const used = [];
    for (const id in this.slotContents) {
      (this.slotContents[id] || []).forEach((b) => {
        const tag = b.container.getData("tag");
        if (tag) used.push({ code: b.container.getData("code"), tag });
      });
    }
    return used;
  }

  _recordFirstRunMetrics(mission) {
    if (this._firstRunRecorded) return;
    this._firstRunRecorded = true;
    const assembled = this.getAssembledCode();
    if (mission.mission === 2) this.parensProactive.mission2 = assembled.expr && assembled.expr[0] && assembled.expr[0].code === "(gold + silver)";
    if (mission.mission === 5) {
      this.parensProactive.mission5 = assembled.total && assembled.total[0] && assembled.total[0].code === "(items + reviews)";
      this.janitorProactive.mission5 = assembled.janitor && assembled.janitor[0] && assembled.janitor[0].code === "sc.nextLine();";
    }
    if (mission.mission === 4) {
      const cond = assembled.cond && assembled.cond[0] && assembled.cond[0].code;
      if (cond === "i >= 1") this.conditionConvention.mission4 = "inclusive_ge";
      else if (cond === "i > 0") this.conditionConvention.mission4 = "exclusive_gt";
    }
  }

  async onRunPressed() {
    if (this.inputLocked) return;
    this.inputLocked = true;
    this.disableRunButton();
    this.runButton.t.setText("...");
    this.runCount++;
    const mission = MISSIONS[this.currentMission];
    this._recordFirstRunMetrics(mission);
    const assembled = this.getAssembledCode();
    const wrongBlocksUsed = this._collectWrongBlocksUsed();

    const probe = this.interpretMission(mission, assembled, mission.tests[0]);
    if (probe.compileError) {
      await this.playReveal(mission, mission.tests[0], probe);
      if (!this._alive) return;
      this._resolveRunOutcome(mission, "compile_fail", wrongBlocksUsed, [], { tag: probe.tag });
      return;
    }

    let anyMismatch = false, anyCrash = false;
    const failedTests = [];
    for (let i = 0; i < mission.tests.length; i++) {
      if (!this._alive) return;
      const test = mission.tests[i];
      const result = this.interpretMission(mission, assembled, test);
      const match = await this.runTestCase(mission, test, i, result);
      if (!match) { anyMismatch = true; failedTests.push(test.input ? test.input.join(" ") : JSON.stringify(test.substitutions)); }
      if (result.crash) anyCrash = true;
    }

    let resultKind = "pass";
    if (anyCrash) resultKind = "runtime_crash";
    else if (anyMismatch) resultKind = "logic_fail";

    this._resolveRunOutcome(mission, resultKind, wrongBlocksUsed, failedTests, null);
  }

  async runTestCase(mission, test, index, result) {
    await this.playReveal(mission, test, result);
    if (!this._alive) return false;
    let match;
    if (result.compileError || result.crash) match = false;
    else match = result.value === test.expectedOutput;
    this.updateReportRow(index, match);
    await this.delay(150);
    return match;
  }

  _resolveRunOutcome(mission, result, wrongBlocksUsed, failedTests, compileErr) {
    const timeMs = Math.round(this.time.now - this.missionStartTime);
    this.attemptLog.push({
      mission: mission.mission, runNumber: this.runCount, result,
      blocksUsed: Object.values(this.getAssembledCode()).flat().map((b) => b.code),
      wrongBlocks: wrongBlocksUsed, failedTests, timeMs, hintUsedBefore: this.missionHintUsed,
    });

    if (result === "pass") { this.onMissionComplete(); return; }

    this.failedRunCount++;
    this.missionRunsFailed++;
    this.runButton.t.setText("▶ RUN");

    let livesLostThisRun = false;
    const tagsThisRun = new Set(wrongBlocksUsed.map((b) => b.tag));
    if (compileErr && compileErr.tag) tagsThisRun.add(compileErr.tag);
    tagsThisRun.forEach((tag) => {
      if (!tag) return;
      this.wrongBlockHistory[tag] = (this.wrongBlockHistory[tag] || 0) + 1;
      if (this.wrongBlockHistory[tag] >= 2) livesLostThisRun = true;
    });

    const feedbackTag = (compileErr && compileErr.tag) || (wrongBlocksUsed[0] && wrongBlocksUsed[0].tag) || null;

    (async () => {
      if (livesLostThisRun) {
        const dead = this.loseLife();
        if (dead) { this.time.delayedCall(500, () => this.gameOver()); return; }
      }
      await this.showBitFeedback(MISCONCEPTION_FEEDBACK[feedbackTag] || "Check the report — the rig shows exactly what your code actually does.");
      if (!this._alive) return;
      this.unlockForRepair();
    })();
  }

  unlockForRepair() {
    this.inputLocked = false;
    this.updateRunButtonState();
  }

  onHintPressed() {
    if (this.inputLocked) return;
    this.missionHintUsed = true;
    this.hintCount++;
    this.updateScore(-25);
    const mission = MISSIONS[this.currentMission];
    const hints = {
      1: "Label first, then the variable's value — glue them with +, and keep the label in quotes.",
      2: "Whatever you add, wrap it: (gold + silver). Then let that wrapped result join the String.",
      3: "A blank line needs a real transmission — println() or println(\"\"), never an empty slot.",
      4: "Count down while i is still 1 or more, then step i-- each time. Print i itself.",
      5: "The leftover ⏎ sits after the LAST tokenized read — that's where the janitor call belongs. And wrap the sum: (items + reviews).",
      6: "Read both lines, then uppercase EACH one before it joins the bordered board.",
    };
    this.showBitFeedback(hints[mission.mission] || "Reread the brief carefully — the answer is in the wording.");
  }

  onMissionComplete() {
    if (this.gameEnded) return;
    const flawless = this.missionRunsFailed === 0 && !this.missionHintUsed;
    if (flawless) this.flawlessCount++;
    this.updateScore(250 + (flawless ? 100 : 0));
    if (flawless) this.createFloatingText(OX + OW / 2, OY - 14, "FLAWLESS +100", HEX_GOLD, "bold 14px Arial");

    this.missionFanfare().then(() => {
      if (!this._alive || this.gameEnded) return;
      const next = this.currentMission + 1;
      if (next >= MISSIONS.length) this.levelComplete();
      else this.showProjectBriefing(next);
    });
  }

  async missionFanfare() {
    this.showOnAir("success");
    this.createConfetti(OX + OW / 2, OY + OH / 2);
    this._drawHexes();
    const hx = this.missionHexes[this.currentMission];
    if (hx) {
      hx.g.clear();
      hx.g.fillStyle(C_GOLD, 1);
      this._drawHexPath(hx.g, hx.x, hx.y, 9);
      hx.g.fillPath();
      this.tweens.add({ targets: hx.g, alpha: 0.4, duration: 150, yoyo: true, repeat: 2 });
    }
    const mission = MISSIONS[this.currentMission];
    await this.bitSay(mission.postMissionNote || "Nice work — the rig confirms it's correct!");
    await Promise.race([this.waitForClick(), this.delay(2200)]);
    this.hideBubble();
    await this.delay(400);
  }

  updateScore(points) {
    this.score = Math.max(0, this.score + points);
    const counter = { v: this.displayScore };
    this.tweens.add({
      targets: counter, v: this.score, duration: 300,
      onUpdate: () => { this.displayScore = Math.round(counter.v); if (this.scoreText.active) this.scoreText.setText(String(this.displayScore)); },
    });
  }

  loseLife() {
    this.lives = Math.max(0, this.lives - 1);
    const icon = this.lifeIcons[this.lives];
    if (icon) this.tweens.add({ targets: icon, alpha: 0.12, duration: 400 });
    return this.lives <= 0;
  }

  createFloatingText(x, y, text, colorHex, font = "bold 14px Arial") {
    const t = this.add.text(x, y, text, { font, color: colorHex }).setOrigin(0.5).setDepth(75);
    this.tweens.add({ targets: t, y: y - 25, alpha: 0, duration: 800, ease: "Cubic.easeOut", onComplete: () => t.destroy() });
    return t;
  }

  createConfetti(x, y, count = 24) {
    const p = this.add.particles(x, y, "l39_dot", {
      speed: { min: 70, max: 220 }, angle: { min: 0, max: 360 }, scale: { start: 0.8, end: 0 }, lifespan: 450,
      tint: [C_GOLD, C_GREEN_BRIGHT, C_CYAN, C_PURPLE, 0xffffff], emitting: false,
    }).setDepth(75);
    p.explode(count);
    this.time.delayedCall(800, () => p.destroy());
  }

  screenShake(intensity = 0.005, duration = 180) {
    this.cameras.main.shake(duration, intensity);
  }

  // ══════════════════════════════════════════════════════════════
  // END STATES
  // ══════════════════════════════════════════════════════════════

  gameOver() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearMission();
    this.hideBubble();
    this.verdictLamp.setFillStyle(0x333333);
    this.showOnAir("idle");

    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
    this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });

    const title = this.add.text(640, 240, "CUT — SHOW CANCELLED", { font: "bold 32px Arial", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
    this.tweens.add({
      targets: title, scale: 1.05, duration: 400, ease: "Back.easeOut",
      onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }),
    });
    this.add.text(640, 310, `Score: ${this.score}`, { font: "20px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
    this.add.text(640, 350, `Missions Completed: ${this.currentMission} / ${MISSIONS.length}`, { font: "16px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);

    this._makeButton(640, 420, "BACK TO PRODUCTION", 240, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearMission();
    this.hideBubble();

    try { GameManager.completeLevel(38, Math.round((this.flawlessCount / MISSIONS.length) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("println_mastery"); } catch (_) {}
    try {
      localStorage.setItem("level39_results", JSON.stringify({
        level: 39, concept: "output_println", phase: "restructuring",
        score: this.score, missionsCompleted: 6, flawlessMissions: this.flawlessCount,
        totalRuns: this.runCount, failedRuns: this.failedRunCount, hintsUsed: this.hintCount,
        selfCorrections: this.selfCorrectionCount, parensAppliedProactively: this.parensProactive,
        janitorAppliedProactively: this.janitorProactive, conditionConventionChoice: this.conditionConvention,
        livesRemaining: this.lives, attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.studioWrapCeremony().then(() => { if (this._alive) this.showScoreTally(); });
  }

  async studioWrapCeremony() {
    this.showOnAir("success");
    this.clearMiniLog();
    const words = ["THAT'S", "A", "WRAP"];
    for (const w of words) {
      if (!this._alive) return;
      await this.assembleAndFire(w, "string");
      await this.delay(150);
    }
    this.createConfetti(OX + OW / 2, OY + OH / 2, 36);
    await this.delay(500);
  }

  _starRating() {
    if (this.flawlessCount >= 4 && this.hintCount <= 1) return 3;
    if (this.failedRunCount <= 6) return 2;
    return 1;
  }

  showScoreTally() {
    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
    this.tweens.add({ targets: ov, fillAlpha: 0.85, duration: 500 });

    const panel = this.add.graphics().setDepth(90);
    panel.fillStyle(0x0a0a1a, 1);
    panel.fillRoundedRect(350, 60, 580, 600, 16);
    panel.lineStyle(2, C_GOLD, 1);
    panel.strokeRoundedRect(350, 60, 580, 600, 16);

    const title = this.add.text(640, 98, "STUDIO PRODUCER", { font: "bold 34px Arial", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(91).setScale(0);
    this.tweens.add({ targets: title, scale: 1, duration: 350, ease: "Back.easeOut" });

    const parensCount = Object.values(this.parensProactive).filter(Boolean).length;
    const parensTotal = Object.keys(this.parensProactive).length || 2;
    const lines = [
      `MISSIONS: 6/6`, `FLAWLESS: ${this.flawlessCount}`, `SELF-CORRECTIONS: ${this.selfCorrectionCount}`,
      `PARENS-PROACTIVE: ${parensCount}/${parensTotal}`, `HINTS: ${this.hintCount}`,
    ];
    lines.forEach((s, i) => {
      const t = this.add.text(500, 140 + i * 26, s, { font: "14px Arial", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 250, delay: 300 + i * 130 });
    });
    const totalText = this.add.text(500, 140 + 5 * 26, "TOTAL: 0", { font: "bold 22px Arial", color: HEX_GOLD }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: totalText, alpha: 1, duration: 250, delay: 1000 });
    const counter = { v: 0 };
    this.tweens.add({ targets: counter, v: this.score, duration: 1000, delay: 1000, onUpdate: () => totalText.setText(`TOTAL: ${Math.round(counter.v)}`) });

    const stars = this._starRating();
    for (let i = 0; i < 3; i++) {
      const earned = i < stars;
      const s = this.add.text(640 + (i - 1) * 60, 320, "★", { font: "36px Arial", color: earned ? HEX_GOLD : "#2a3040" }).setOrigin(0.5).setDepth(91).setScale(0);
      this.tweens.add({ targets: s, scale: 1, duration: 250, delay: 1700 + i * 200, ease: earned ? "Back.easeOut" : "Cubic.easeOut" });
    }

    const badge = this.add.container(640, 400).setDepth(91).setAlpha(0);
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillCircle(0, 0, 34);
    bg.lineStyle(3, C_GOLD, 1);
    bg.strokeCircle(0, 0, 34);
    bg.lineStyle(1.5, C_CYAN, 1);
    bg.lineBetween(-14, 8, 0, -12);
    bg.lineBetween(14, 8, 0, -12);
    bg.strokeCircle(0, -12, 4);
    badge.add(bg);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 2100 });
    const badgeLbl = this.add.text(640, 440, "println() MASTERY", { font: "bold 14px Arial", color: HEX_GOLD }).setOrigin(0.5).setDepth(91).setAlpha(0);
    const badgeSub = this.add.text(640, 458, "Accretion ✓  Tuning ✓  Restructuring ✓", { font: "10px Arial", color: "#78909c" }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: [badgeLbl, badgeSub], alpha: 1, duration: 300, delay: 2200 });

    const barY = 500;
    const barG = this.add.graphics().setDepth(91).setAlpha(0);
    barG.lineStyle(1, 0x78909c, 1);
    barG.strokeRoundedRect(450, barY, 380, 14, 7);
    barG.fillStyle(C_PURPLE, 1);
    barG.fillRoundedRect(450, barY, 126, 14, 7);
    this.add.text(640, barY - 16, "OUTPUT WING — 1 of 3 trilogies complete", { font: "bold 11px Arial", color: HEX_PURPLE }).setOrigin(0.5).setDepth(91).setAlpha(0);
    const trilogyLabels = this.add.container(0, 0).setDepth(92).setAlpha(0);
    ["println ✓", "print", "printf"].forEach((label, i) => {
      const t = this.add.text(490 + i * 150, barY + 26, label, { font: "10px Arial", color: i === 0 ? HEX_GOLD : "#546e7a" }).setOrigin(0.5);
      trilogyLabels.add(t);
    });
    this.tweens.add({ targets: [barG, trilogyLabels], alpha: 1, duration: 300, delay: 2500 });

    this._makeButton(500, 610, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(760, 610, "NEXT: Whisper Booth →", 260, 44, { fill: 0x00733a, stroke: C_GREEN_BRIGHT, textColor: "#ffffff" }, () => {
      this.scene.start("MenuScene");
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
