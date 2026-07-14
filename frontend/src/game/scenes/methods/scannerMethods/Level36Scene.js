/**
 * Level 36 — "The Front Desk" (Scanner Methods: Restructuring Phase —
 * Trilogy Finale, closes the Intake Wing)
 * ===========================================================================
 * The learner CONSTRUCTS complete input-driven programs — no multiple
 * choice. Reuses the Level 27/30/33 code-canvas/parts-bin/RUN-button
 * construction architecture, with a masked rig window compacting the
 * Level 34/35 tape + Scanner machine + typed containers into a live
 * observation pane. A genuine per-mission interpreter (never scripted)
 * executes exactly what the player assembled against real tape state.
 *
 * IMPORTANT SEMANTIC FIX: nextInt()/nextDouble()/next() must skip BOTH
 * spaces and leftover newlines while hunting for their next token (real
 * Java's delimiter pattern is any whitespace, not just spaces). Levels 34
 * and 35 never chained two tokenized reads across a line boundary, so this
 * never surfaced there — but Mission 5 here does exactly that (int age,
 * then double height, on separate lines), so the tokenizer is corrected
 * here to skip newlines for nextInt/nextDouble/next (nextLine's own
 * "consume to the next newline" rule is unaffected).
 */

import Phaser from "phaser";
import { GameManager } from "../../../GameManager.js";
import { BadgeSystem } from "../../../BadgeSystem.js";

const W = 1280, H = 720;

const C_GREEN = 0x4caf50, C_GREEN_BRIGHT = 0x00e676, C_GOLD = 0xffd740;
const C_CYAN = 0x00e5ff, C_RED = 0xf44336, C_GRAY = 0x78909c;
const C_INT = 0x1565c0, C_DOUBLE = 0xe65100, C_LINE = 0x2e7d32;
const C_NEWLINE = 0x7b1fa2, C_AMBER = 0xffab00, C_PURPLE = 0x8c7ae6;
const HEX_GREEN = "#4caf50", HEX_GOLD = "#ffd740", HEX_CYAN = "#00e5ff";
const HEX_RED = "#f44336", HEX_GRAY = "#78909c", HEX_GREEN_BRIGHT = "#00e676";
const HEX_INT = "#1565c0", HEX_DOUBLE = "#e65100", HEX_LINE = "#2e7d32";
const HEX_SPACE = "#c2185b", HEX_NEWLINE = "#7b1fa2";

const CX = 40, CY = 90, CW = 680, CH = 380;
const TAB_H = 34, GUTTER_W = 34, CODE_PAD = 10;
const CODE_X = CX + GUTTER_W + CODE_PAD;
const CODE_Y0 = CY + TAB_H + 14;
const LINE_H = 22;
const PX = 40, PY = 490, PW = 680, PH = 130;
const OX = 760, OY = 80, OW = 460, OH = 228;
const MX = OX + OW / 2, MY = OY + OH / 2 + 6;
const STRIP_Y = OY + OH + 15;
const RX = 760, RY = 340, RW = 460, RH = 130;
const BX = 760, BY = 478, BW = 460, BH = 130;

const PORT_X = OX + 26, PORT_Y = MY;
const TAPE_X0 = OX + 48, TAPE_X1 = OX + 208, TAPE_Y = MY;
const MACHINE_X = OX + 275, MACHINE_Y = MY, MACHINE_W = 90, MACHINE_H = 68;
const CONT_X = OX + 400;
const CONT_Y = { int: MY - 42, double: MY, string: MY + 42 };
const TICKER_Y = OY + OH - 12;
const TUTORIAL_KEY = "level36_tutorial_done";

// ══════════════════════════════════════════════════════════════
// MISSION CONFIGURATION
// ══════════════════════════════════════════════════════════════
const MISSIONS = [
  { mission: 1, title: "The Age Gate",
    brief: "The venue's age gate needs to check every guest. Read their AGE and print 'ENTRY' if it's 18 or older, else 'DENIED'.",
    skeleton: ["<slot:decl> = <slot:read>;", "if (<slot:cond>) {", '    print("ENTRY");', "} else {", '    print("DENIED");', "}"],
    slots: [{ id: "decl", hint: "declaration", capacity: 1 }, { id: "read", hint: "read", capacity: 1 }, { id: "cond", hint: "condition", capacity: 1 }],
    palette: [
      { code: "int age", slot: "decl", correct: true },
      { code: "sc.nextInt()", slot: "read", correct: true },
      { code: "age >= 18", slot: "cond", correct: true },
      { code: "double age", slot: "decl", tag: "widening_unaware" },
      { code: "String age", slot: "decl", tag: "wrong_method_for_type" },
      { code: "sc.nextDouble()", slot: "read", tag: "narrowing_assignment_error" },
      { code: "sc.nextLine()", slot: "read", tag: "line_reads_one_word_belief" },
      { code: "age > 18", slot: "cond", tag: "boundary_operator_confusion" },
    ],
    tests: [
      { input: ["17"], expectedOutput: "DENIED" },
      { input: ["18"], expectedOutput: "ENTRY" },
      { input: ["42"], expectedOutput: "ENTRY" },
    ], concept: "single_int_pipeline" },

  { mission: 2, title: "The Ticket Booth",
    brief: "Print the total for tickets: read the PRICE per ticket (may have decimals) and the QUANTITY (whole number), then print price × quantity.",
    skeleton: ["<slot:decl1> = <slot:read1>;", "<slot:decl2> = <slot:read2>;", "print(<slot:expr>);"],
    slots: [
      { id: "decl1", hint: "price declaration", capacity: 1 }, { id: "read1", hint: "price read", capacity: 1 },
      { id: "decl2", hint: "quantity declaration", capacity: 1 }, { id: "read2", hint: "quantity read", capacity: 1 },
      { id: "expr", hint: "total", capacity: 1 },
    ],
    palette: [
      { code: "double price", slot: "decl1", correct: true },
      { code: "sc.nextDouble()", slot: "read1", correct: true },
      { code: "int qty", slot: "decl2", correct: true },
      { code: "sc.nextInt()", slot: "read2", correct: true },
      { code: "price * qty", slot: "expr", correct: true },
      { code: "int price", slot: "decl1", tag: "type_mismatch_int_from_decimal" },
      { code: "sc.nextInt()", slot: "read1", tag: "type_mismatch_int_from_decimal" },
      { code: "sc.nextDouble()", slot: "read2", tag: "narrowing_assignment_error" },
      { code: "qty * qty", slot: "expr", tag: "wrong_variable_used" },
    ],
    tests: [
      { input: ["12.50 3"], expectedOutput: "37.5" },
      { input: ["5.0 4"], expectedOutput: "20.0" },
      { input: ["0.99 100"], expectedOutput: "99.0" },
    ], concept: "mixed_types_arithmetic" },

  { mission: 3, title: "The Greeter",
    brief: "Ask for the guest's AGE first, then their FULL NAME. Print: 'Hello, <name>!' Watch out — the tape will test you.",
    skeleton: ["int age = sc.nextInt();", "<slot:janitor>", "String name = <slot:read>;", 'print("Hello, " + name + "!");'],
    slots: [{ id: "janitor", hint: "clear the leftover?", capacity: 1 }, { id: "read", hint: "read the name", capacity: 1 }],
    palette: [
      { code: "sc.nextLine();", slot: "janitor", correct: true },
      { code: "sc.nextLine()", slot: "read", correct: true },
      { code: "(nothing)", slot: "janitor", empty: true, tag: "janitor_missing" },
      { code: "sc.nextInt();", slot: "janitor", tag: "janitor_wrong_type" },
      { code: "sc.next()", slot: "read", tag: "line_reads_one_word_belief" },
    ],
    tests: [
      { input: ["25", "Anjana Perera"], expectedOutput: "Hello, Anjana Perera!" },
      { input: ["7", "Kai"], expectedOutput: "Hello, Kai!" },
      { input: ["100", "Old Timer"], expectedOutput: "Hello, Old Timer!" },
    ],
    postMissionNote: "That bare sc.nextLine() is the most valuable line in beginner Java. Any time you follow an int/double read with a line read — reach for the janitor.",
    concept: "skip_bug_fix_applied" },

  { mission: 4, title: "The Thermometer",
    brief: "Read a temperature in FAHRENHEIT (may have decimals). Print the CELSIUS reading, computed as (F - 32) * 5.0 / 9.0.",
    skeleton: ["<slot:decl> = <slot:read>;", "double c = <slot:formula>;", "print(c);"],
    slots: [{ id: "decl", hint: "fahrenheit declaration", capacity: 1 }, { id: "read", hint: "read the temp", capacity: 1 }, { id: "formula", hint: "the conversion", capacity: 1 }],
    palette: [
      { code: "double f", slot: "decl", correct: true },
      { code: "sc.nextDouble()", slot: "read", correct: true },
      { code: "(f - 32) * 5.0 / 9.0", slot: "formula", correct: true },
      { code: "int f", slot: "decl", tag: "type_mismatch_int_from_decimal" },
      { code: "sc.nextInt()", slot: "read", tag: "type_mismatch_int_from_decimal" },
      { code: "(int)(f - 32) * 5 / 9", slot: "formula", tag: "integer_division_belief" },
      { code: "f - 32 * 5.0 / 9.0", slot: "formula", tag: "precedence_no_parens" },
    ],
    tests: [
      { input: ["32.0"], expectedOutput: "0.0" },
      { input: ["212.0"], expectedOutput: "100.0" },
      { input: ["98.6"], expectedOutput: "37.0" },
    ], concept: "double_pipeline_with_math" },

  { mission: 5, title: "The Registration Form",
    brief: "Full intake — three fields in ORDER: age (int), height in metres (double), full name (line). Then print a badge line: '<name>, <age>y, <height>m'. Buffer discipline is EVERYTHING.",
    skeleton: ["int age = sc.nextInt();", "double height = sc.nextDouble();", "<slot:janitor>", "String name = sc.nextLine();", 'print(name + ", " + age + "y, " + height + "m");'],
    slots: [{ id: "janitor", hint: "clear the leftover?", capacity: 1 }],
    palette: [
      { code: "sc.nextLine();", slot: "janitor", correct: true },
      { code: "(nothing)", slot: "janitor", empty: true, tag: "janitor_missing" },
      { code: "sc.nextInt();", slot: "janitor", tag: "janitor_wrong_type" },
      { code: "sc.nextDouble();", slot: "janitor", tag: "janitor_wrong_type" },
    ],
    tests: [
      { input: ["25", "1.75", "Anjana Perera"], expectedOutput: "Anjana Perera, 25y, 1.75m" },
      { input: ["30", "1.68", "Kai"], expectedOutput: "Kai, 30y, 1.68m" },
    ], concept: "multi_field_form_with_janitor" },

  { mission: 6, title: "The Loud Greeter",
    brief: "Read the guest's FULL NAME and greet them in style — all capitals, like a stage announcement. Print: 'WELCOME, <NAME>!' where <NAME> is the name UPPERCASED.",
    skeleton: ["String name = <slot:read>;", 'print("WELCOME, " + <slot:transform> + "!");'],
    slots: [{ id: "read", hint: "read the name", capacity: 1 }, { id: "transform", hint: "make it loud", capacity: 1 }],
    palette: [
      { code: "sc.nextLine()", slot: "read", correct: true },
      { code: "name.toUpperCase()", slot: "transform", correct: true },
      { code: "sc.next()", slot: "read", tag: "line_reads_one_word_belief" },
      { code: "sc.nextInt()", slot: "read", tag: "wrong_method_for_type" },
      { code: "name", slot: "transform", tag: "no_normalization" },
      { code: "name.toUpperCase", slot: "transform", tag: "property_vs_method_syntax" },
      { code: "name.charAt(0).toUpperCase()", slot: "transform", tag: "chain_order_type_error" },
    ],
    tests: [
      { input: ["Anjana Perera"], expectedOutput: "WELCOME, ANJANA PERERA!" },
      { input: ["kai"], expectedOutput: "WELCOME, KAI!" },
      { input: ["OK"], expectedOutput: "WELCOME, OK!" },
    ],
    postMissionNote: "Scanner brought the name in from outside. String taught you how to shape it. Look what you built — a REAL program, using every wing you've earned. That's the whole point, Clerk.",
    concept: "cross_wing_capstone" },
];

const MISCONCEPTION_FEEDBACK = {
  janitor_missing: "Look at the test row — the greeting printed with NO name! The leftover ⏎ from nextInt() was eaten by nextLine() before the real line arrived. The bare sc.nextLine() is the janitor that keeps this from happening.",
  janitor_wrong_type: "The runtime rejection stamp on the reveal — see it? A janitor call is supposed to SWEEP whatever's left, but your call demanded a number and met a name. The leftover after a tokenized read is a ⏎ and maybe a space — always use nextLine().",
  type_mismatch_int_from_decimal: "The InputMismatchException stamp fell on the decimal token — the moment a decimal point appears, it's a double. Match the nozzle AND the container.",
  integer_division_belief: "The reveal shows it: on '98.6' the cast truncates 66.6 down to 66 before the division ever runs, and 330/9 as INTEGER division floors to 36 — not 37. Keep the whole formula in doubles.",
  precedence_no_parens: "Java multiplied before it subtracted — that's operator precedence. Wrap what should happen FIRST in parentheses: (f - 32) * ...",
  line_reads_one_word_belief: "The name printed short — the space betrayed you. sc.next() stops at whitespace; only sc.nextLine() takes the whole line.",
  wrong_variable_used: "The total came out squared, not multiplied by quantity. Variables are labels — reach for the RIGHT one.",
  no_normalization: "Look at the lowercase row — the badge printed without a shout. The mission asked for CAPITALS; normalize before you print.",
  property_vs_method_syntax: "The oldest trap in the arc returns for the finale — parentheses on Strings! toUpperCase is a METHOD: toUpperCase().",
  chain_order_type_error: "charAt(0) hands you a char, and a char has no methods — the chain dies at the dot. Uppercase the whole String first, THEN reach in.",
  narrowing_assignment_error: "Big into small is forbidden — a double can't squeeze into an int variable. Java refuses before the program even runs.",
  wrong_method_for_type: "Containers are strict: that method's return type doesn't match the variable's type. Refused before the program breathes.",
  widening_unaware: "This one actually compiles and runs fine — an int widens safely into a double.",
  boundary_operator_confusion: "Check the exact-18 test — '>' excludes 18 itself, but the mission says 18 or older. You need '>='.",
};

export class Level36Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level36Scene" });
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
    this.janitorProactive = {};
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
    this.tapeState = [];
    this.tapeCellObjs = [];
    this.inputLocked = true;
    this.gameEnded = false;
    this._alive = true;
    this._bubble = null;
    this._dragHoverSlotKey = null;
    this._janitorRecorded = false;
  }

  preload() {}

  create() {
    this._alive = true;
    this.events.once("shutdown", () => { this._alive = false; });

    const cam = this.cameras.main;
    const zoom = Math.min(this.scale.width / W, this.scale.height / H);
    cam.setZoom(zoom);
    cam.centerOn(W / 2, H / 2);
    cam.setBackgroundColor("#080f0a");

    try { GameManager.incrementAttempt(35); } catch (_) {}

    this.createParticleTexture();
    this.createBackground();
    this.createLobby();
    this.createLobbyFloor();
    this.createDawnWindow();
    this.createAmbientParticles();
    this.createCodeCanvas();
    this.createBlockPalette();
    this.createRunButton();
    this.createRigWindow();
    this.createMiniIntakePort();
    this.createMiniTapeRail();
    this.createMiniScannerMachine();
    this.createMiniContainers();
    this.createOutputTicker();
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
    this.updateWallClock(time);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // BACKGROUND — front desk lobby
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l36_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l36_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x080f0a).setDepth(0);
  }

  createLobby() {
    const g = this.add.graphics().setDepth(1);
    [220, 400, 580, 760, 940].forEach((x) => {
      g.fillStyle(0x0c150c, 1);
      g.lineStyle(1, 0x1c2e1c, 0.08);
      g.fillRect(x - 7, 36, 14, 180);
      g.strokeRect(x - 7, 36, 14, 180);
    });
    [280, 640].forEach((x) => {
      g.lineStyle(1, 0x1c2e1c, 0.06);
      g.strokeRect(x - 45, 60, 90, 70);
      for (let i = 0; i < 3; i++) g.fillRect(x - 30, 78 + i * 14, 60, 2);
    });
    const clock = this.add.container(1130, 96).setDepth(2);
    const ring = this.add.graphics();
    ring.lineStyle(2, 0x1c2e1c, 0.5);
    ring.strokeCircle(0, 0, 18);
    const minute = this.add.graphics();
    minute.lineStyle(2, C_GREEN, 0.35);
    minute.lineBetween(0, 0, 0, -13);
    const hour = this.add.graphics();
    hour.lineStyle(2, C_GREEN, 0.3);
    hour.lineBetween(0, 0, 6, -8);
    clock.add([ring, hour, minute]);
    this.wallClockMinute = minute;
  }

  updateWallClock(time) {
    if (!this.wallClockMinute) return;
    this.wallClockMinute.setAngle(time * 0.0006);
  }

  createLobbyFloor() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x0d130d, 1);
    g.fillRect(0, 635, W, 85);
    g.lineStyle(1, 0x1c2e1c, 1);
    g.lineBetween(0, 635, W, 635);
    g.fillStyle(0x4caf50, 0.02);
    g.fillEllipse(900, 660, 200, 12);
    const pot = this.add.graphics().setDepth(2);
    pot.lineStyle(1, 0x1c2e1c, 0.3);
    pot.strokeRoundedRect(48, 660, 26, 20, 3);
    pot.fillStyle(0x2e7d32, 0.15);
    [0, 1, 2].forEach((i) => pot.fillEllipse(61 + (i - 1) * 8, 650, 10, 20));
  }

  createDawnWindow() {
    const g = this.add.graphics().setDepth(1);
    for (let y = 0; y < 180; y += 6) {
      const a = 0.03 * (1 - y / 180);
      g.fillStyle(0xffd740, a);
      g.fillRect(1000, y, 280, 6);
    }
    this.dawnGfx = g;
  }

  createAmbientParticles() {
    this.ambient = [];
    for (let i = 0; i < 8; i++) {
      const p = this.add.circle(Phaser.Math.Between(20, 1260), Phaser.Math.Between(0, 600), 1, 0xa5d6a7, Phaser.Math.FloatBetween(0.02, 0.05)).setDepth(2);
      this.ambient.push(p);
    }
  }

  updateAmbient(time, delta) {
    if (!this.ambient) return;
    const step = 0.02 * (delta / 16.7);
    this.ambient.forEach((p, i) => {
      p.x += step; p.y -= step * 0.5;
      p.x += Math.sin(time * 0.0006 + i) * 0.03;
      if (p.x > 1280 || p.y < 0) { p.x = 0; p.y = Phaser.Math.Between(200, 600); }
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
  // CODE CANVAS (Level 27/30/33 architecture, reused)
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
    this.tabFilename = this.add.text(CX + CW - 12, CY + TAB_H / 2, "Desk1.java", {
      font: "11px Courier New", color: "#546e7a",
    }).setOrigin(1, 0.5).setDepth(11);

    this.lineHighlight = this.add.rectangle(CX + CW / 2, 0, CW - 4, LINE_H, C_AMBER, 0.06).setDepth(19).setVisible(false);
    this.codeContainer = this.add.container(0, 0).setDepth(20);
  }

  _syntaxTokens(line) {
    const tokens = [];
    const re = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\bif\b|\belse\b|\bint\b|\bdouble\b|\bString\b|\bnew\b|\bScanner\b)|(\bsc\b)|([A-Za-z_]\w*(?=\())|(\bSystem\.in\b)|(>=|<=|==|!=|[+\-*/><])|([(){};.,=])/g;
    let last = 0, m;
    const plain = (t) => t && tokens.push({ t, c: "#e0e0e0" });
    while ((m = re.exec(line))) {
      if (m.index > last) plain(line.slice(last, m.index));
      if (m[1]) tokens.push({ t: m[1], c: HEX_GREEN });
      else if (m[2]) tokens.push({ t: m[2], c: "#4fc3f7" });
      else if (m[3]) tokens.push({ t: m[3], c: HEX_GREEN });
      else if (m[4]) tokens.push({ t: m[4], c: HEX_GOLD });
      else if (m[5]) tokens.push({ t: m[5], c: HEX_GOLD });
      else if (m[6]) tokens.push({ t: m[6], c: "#ff8a65" });
      else if (m[7]) tokens.push({ t: m[7], c: HEX_GRAY });
      last = m.index + m[0].length;
    }
    if (last < line.length) plain(line.slice(last));
    return tokens.length ? tokens : [{ t: line, c: "#e0e0e0" }];
  }

  renderSkeleton(mission) {
    this.codeContainer.removeAll(true);
    this.slotDefs = {};
    mission.slots.forEach((s) => { this.slotDefs[s.id] = { ...s, rect: null }; });

    const allLines = ["Scanner sc = new Scanner(System.in);", ...mission.skeleton];
    allLines.forEach((rawLine, i) => {
      const y = CODE_Y0 + i * LINE_H;
      const numT = this.add.text(CX + 8, y, String(i + 1), { font: "12px Courier New", color: "#3d4450" });
      this.codeContainer.add(numT);

      if (i === 0) {
        const t = this.add.text(CODE_X, y, rawLine, { font: "13px Courier New", color: "#3d4450" }).setAlpha(0.6);
        this.codeContainer.add(t);
        return;
      }

      const parts = rawLine.split(/§?<slot:(\w+)>/);
      let x = CODE_X;
      parts.forEach((part, pi) => {
        if (pi % 2 === 0) {
          if (!part) return;
          this._syntaxTokens(part).forEach((tok) => {
            const t = this.add.text(x, y, tok.t, { font: "bold 13px Courier New", color: tok.c });
            this.codeContainer.add(t);
            x += t.width;
          });
        } else {
          const slotId = part;
          const def = this.slotDefs[slotId];
          const w = 130;
          def.rect = { x, y: y - 2, w, h: 18 };
          this._drawSlotPlaceholder(slotId);
          x += w + 6;
        }
      });
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
        dg.lineStyle(2, highlight ? C_AMBER : 0x2a3a4a, 1);
        dg.strokeRoundedRect(x, y, w, h, 6);
      } else {
        dg.lineStyle(2, highlight ? C_AMBER : 0x546e7a, 1);
        this._dashedRectOutline(dg, x, y, w, h, 5, 4);
      }
    };
    draw(false);
    def.dg = dg;
    def.drawDash = draw;
    this.codeContainer.add(dg);
    if (!filled) {
      const label = this.add.text(x + w / 2, y + h / 2, def.hint, { font: "italic 10px Courier New", color: "#3d4450" }).setOrigin(0.5).setDepth(22);
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
    const y = CODE_Y0 + (lineIndex + 1) * LINE_H - 2;
    this.lineHighlight.setPosition(CX + CW / 2, y + LINE_H / 2).setVisible(true);
  }

  // ══════════════════════════════════════════════════════════════
  // BLOCK PALETTE (Level 27/30/33 drag system, reused verbatim)
  // ══════════════════════════════════════════════════════════════

  createBlockPalette() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0a0e14, 1);
    g.fillRoundedRect(PX, PY, PW, PH, 10);
    g.lineStyle(1, 0x1a2535, 1);
    g.strokeRoundedRect(PX, PY, PW, PH, 10);
    this.add.text(PX + 10, PY + 8, "FORM SUPPLIES", { font: "bold 9px Arial", color: "#3d4450" }).setDepth(11);
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
      const style = { font: "bold 13px Courier New", color: HEX_CYAN };
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
      c.on("pointerover", () => { if (!this.inputLocked) draw(C_AMBER); });
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
  // RIG WINDOW — compact Level 34/35 intake apparatus
  // ══════════════════════════════════════════════════════════════

  createRigWindow() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x060b06, 1);
    g.fillRoundedRect(OX, OY, OW, OH, 12);
    g.lineStyle(3, 0x21262d, 1);
    g.strokeRoundedRect(OX, OY, OW, OH, 12);
    this.add.text(OX + 10, OY + 6, "INTAKE PIPELINE — LIVE", { font: "bold 9px Arial", color: "#3d4450" }).setDepth(11);

    const maskShape = this.make.graphics({ x: 0, y: 0, add: false });
    maskShape.fillRoundedRect(OX + 4, OY + 20, OW - 8, OH - 24, 10);
    this.windowMask = maskShape.createGeometryMask();
    this.rigLayer = this.add.container(0, 0).setDepth(15);
    this.rigLayer.setMask(this.windowMask);

    this.verdictLamp = this.add.circle(OX + OW - 18, OY + 14, 6, C_GRAY).setDepth(20);
  }

  createMiniIntakePort() {
    const c = this.add.container(PORT_X, PORT_Y).setDepth(1);
    const outer = this.add.circle(0, 0, 22, 0x030603);
    const ring = this.add.graphics();
    ring.lineStyle(2, C_GREEN, 1);
    ring.strokeCircle(0, 0, 22);
    const wedges = this.add.graphics();
    this._drawMiniIrisWedges(wedges, 1);
    c.add([outer, ring, wedges]);
    this.rigLayer.add(c);
    this.miniPort = { c, wedges };
  }

  _drawMiniIrisWedges(g, openness) {
    g.clear();
    g.lineStyle(1.5, 0x1c2e1c, 1);
    const spread = openness * 17;
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i;
      const r0 = 2 + spread, r1 = 19;
      g.lineBetween(Math.cos(a) * r0, Math.sin(a) * r0, Math.cos(a) * r1, Math.sin(a) * r1);
    }
  }

  // ══════════════════════════════════════════════════════════════
  // MINI TAPE
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

  createMiniTapeRail() {
    const g = this.add.graphics().setDepth(1);
    g.lineStyle(1, 0x1c2e1c, 0.4);
    g.lineBetween(TAPE_X0 - 6, TAPE_Y, TAPE_X1 + 6, TAPE_Y);
    this.rigLayer.add(g);
    this.tapeContainer = this.add.container(0, 0);
    this.rigLayer.add(this.tapeContainer);
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

  loadMiniTape(inputLines) {
    this.tapeState = this.buildCellsFromLines(inputLines);
    this.renderMiniTape(true);
  }

  clearMiniTape() {
    this.tapeState = [];
    this.renderMiniTape(false);
  }

  renderMiniTape(animateIn) {
    this.tapeCellObjs.forEach((o) => o.destroy());
    this.tapeCellObjs = [];
    this.tapeContainer.removeAll(true);

    const cellW = 13;
    const totalW = Math.max(this.tapeState.length * cellW, 4);
    const startX = TAPE_X1 - totalW;

    const bg = this.add.graphics();
    bg.fillStyle(0xe8f0e8, 0.88);
    bg.fillRoundedRect(Math.max(startX, TAPE_X0 - 20), TAPE_Y - 12, Math.min(totalW, TAPE_X1 - TAPE_X0 + 20), 24, 3);
    this.tapeContainer.add(bg);

    this.tapeState.forEach((cell, i) => {
      const x = startX + i * cellW + cellW / 2;
      const t = this.add.text(x, TAPE_Y, this._cellDisplay(cell), {
        font: cell.kind === "newline" ? "bold 11px Courier New" : "bold 9px Courier New",
        color: this._cellColor(cell.kind),
      }).setOrigin(0.5);
      if (animateIn) { t.setAlpha(0); this.tweens.add({ targets: t, alpha: 1, duration: 150, delay: i * 8 }); }
      this.tapeContainer.add(t);
      this.tapeCellObjs.push(t);
    });
  }

  async miniTapeConsume(count, discard = false) {
    if (count <= 0) return;
    const objs = this.tapeCellObjs.slice(0, count);
    const promises = objs.map((t, i) => new Promise((res) => {
      this.tweens.add({
        targets: t, x: MACHINE_X - MACHINE_W / 2 + 6, y: discard ? t.y - 12 : MACHINE_Y,
        alpha: 0, scale: 0.4, duration: 140, delay: i * 25, ease: "Cubic.easeIn",
        onComplete: () => { t.destroy(); res(); },
      });
    }));
    await Promise.all(promises);
    this.tapeState = this.tapeState.slice(count);
    this.renderMiniTape(false);
  }

  async bufferBeat(ms = 300) {
    const spot = this.add.rectangle((TAPE_X0 + TAPE_X1) / 2, TAPE_Y, TAPE_X1 - TAPE_X0 + 30, 26, 0xffffff, 0);
    this.rigLayer.add(spot);
    this.tweens.add({ targets: spot, fillAlpha: 0.05, duration: 100, yoyo: true, hold: Math.max(0, ms - 200) });
    await this.delay(ms);
    if (spot.active) spot.destroy();
  }

  // ══════════════════════════════════════════════════════════════
  // MINI SCANNER MACHINE
  // ══════════════════════════════════════════════════════════════

  createMiniScannerMachine() {
    const c = this.add.container(MACHINE_X, MACHINE_Y).setDepth(2);
    const body = this.add.graphics();
    body.fillStyle(0x0e1810, 1);
    body.fillRoundedRect(-MACHINE_W / 2, -MACHINE_H / 2, MACHINE_W, MACHINE_H, 8);
    body.lineStyle(1.5, C_GREEN, 1);
    body.strokeRoundedRect(-MACHINE_W / 2, -MACHINE_H / 2, MACHINE_W, MACHINE_H, 8);
    const porthole = this.add.circle(0, 0, 14, 0x030603);
    const strobe = this.add.circle(0, -MACHINE_H / 2 + 6, 3, C_AMBER, 0).setVisible(false);
    c.add([body, porthole, strobe]);

    const nozzles = {};
    [{ key: "int", y: -16, ring: C_INT }, { key: "double", y: 0, ring: C_DOUBLE }, { key: "line", y: 16, ring: C_LINE }].forEach((def) => {
      const ng = this.add.graphics();
      ng.fillStyle(0x142018, 1);
      ng.fillRoundedRect(MACHINE_W / 2 - 2, def.y - 5, 14, 10, 2);
      ng.lineStyle(1.5, def.ring, 0.5);
      ng.strokeRoundedRect(MACHINE_W / 2 - 2, def.y - 5, 14, 10, 2);
      const glow = this.add.rectangle(MACHINE_W / 2 + 5, def.y, 14, 10, def.ring, 0);
      c.add([ng, glow]);
      nozzles[def.key] = { g: ng, glow, ring: def.ring };
    });

    this.rigLayer.add(c);
    this.miniMachine = { c, body, porthole, strobe, nozzles };
  }

  nozzleGlow(method, on, color = null) {
    const key = method === "nextInt" ? "int" : method === "nextDouble" ? "double" : "line";
    const nz = this.miniMachine.nozzles[key];
    this.tweens.killTweensOf(nz.glow);
    this.tweens.add({ targets: nz.glow, fillAlpha: on ? 0.4 : 0, duration: 100 });
    if (on) nz.glow.setFillStyle(color || nz.ring, 0.4);
  }

  humMachine() {
    this.tweens.add({ targets: this.miniMachine.c, x: MACHINE_X + 0.5, duration: 30, yoyo: true, repeat: 3 });
  }

  /**
   * The honest tokenizer, extended from Level 34/35: nextInt()/nextDouble()/
   * next() skip BOTH spaces and leftover newlines when hunting for their
   * token (real Java's whitespace delimiter includes newlines) — Mission 5
   * chains two tokenized reads across a line boundary and genuinely needs
   * this. nextLine() keeps its own distinct "consume to next newline" rule.
   */
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
      return { error: false, rawValue: strValue, valueDisplay: `"${strValue}"`, consumedCount: consumed.length, skippedCount: 0, returnType: "String" };
    }
    const tokenCells = [];
    let j = i;
    while (j < cells.length && cells[j].kind !== "space" && cells[j].kind !== "newline") { tokenCells.push(cells[j]); j++; }
    const tokenStr = tokenCells.map((c) => c.ch).join("");
    if (method === "next") {
      if (tokenCells.length === 0) return { error: true, consumedCount: 0, skippedCount: 0, returnType: "String" };
      return { error: false, rawValue: tokenStr, valueDisplay: `"${tokenStr}"`, consumedCount: skipped.length + tokenCells.length, skippedCount: skipped.length, returnType: "String" };
    }
    if (tokenCells.length === 0) return { error: true, consumedCount: 0, skippedCount: 0 };
    if (method === "nextInt") {
      if (/^-?\d+$/.test(tokenStr)) {
        const v = parseInt(tokenStr, 10);
        return { error: false, rawValue: v, valueDisplay: String(v), consumedCount: skipped.length + tokenCells.length, skippedCount: skipped.length, returnType: "int" };
      }
      return { error: true, consumedCount: 0, skippedCount: 0, returnType: "int" };
    }
    if (method === "nextDouble") {
      if (/^-?\d+(\.\d+)?$/.test(tokenStr)) {
        const v = parseFloat(tokenStr);
        return { error: false, rawValue: v, valueDisplay: this._fmtDouble(v), consumedCount: skipped.length + tokenCells.length, skippedCount: skipped.length, returnType: "double" };
      }
      return { error: true, consumedCount: 0, skippedCount: 0, returnType: "double" };
    }
    return { error: true };
  }

  _fmtDouble(v) {
    const rounded = Math.round(v * 1e6) / 1e6;
    return Number.isInteger(rounded) ? rounded.toFixed(1) : String(rounded);
  }

  _methodOf(code) {
    if (code.includes("nextInt")) return "nextInt";
    if (code.includes("nextDouble")) return "nextDouble";
    if (code.includes("nextLine")) return "nextLine";
    if (code.includes("next()")) return "next";
    return null;
  }

  compileCheck(declType, method) {
    const returnType = method === "nextInt" ? "int" : method === "nextDouble" ? "double" : "String";
    if (declType === returnType) return { ok: true };
    if (declType === "double" && returnType === "int") return { ok: true };
    if (declType === "int" && returnType === "double") return { ok: false, tag: "narrowing_assignment_error" };
    if (declType === "String") return { ok: false, tag: "wrong_method_for_type" };
    return { ok: false, tag: "line_reads_one_word_belief" };
  }

  async castAndDispense(method, result, containerKey, varName) {
    const swirl = this.add.circle(MACHINE_X, MACHINE_Y, 3, 0xffffff, 0.8);
    this.rigLayer.add(swirl);
    this.tweens.add({ targets: swirl, scale: 4, alpha: 0, duration: 180, onComplete: () => swirl.destroy() });
    await this.delay(110);
    if (!this._alive) return;

    const container = this.miniContainers[containerKey];
    container.varPlate.setText(varName || "—");
    const color = result.returnType === "int" ? C_INT : result.returnType === "double" ? C_DOUBLE : C_LINE;
    const slug = this.add.text(MACHINE_X, MACHINE_Y, result.valueDisplay.replace(/^"|"$/g, ""), { font: "bold 10px Courier New", color: Phaser.Display.Color.IntegerToColor(color).rgba }).setOrigin(0.5).setScale(0.5).setAlpha(0);
    this.rigLayer.add(slug);
    this.tweens.add({ targets: slug, scale: 1, alpha: 1, duration: 100 });
    await this.delay(100);
    if (!this._alive) return;

    await new Promise((res) => {
      this.tweens.add({
        targets: slug, x: container.x, y: container.y, scale: 0.7, duration: 220, ease: "Cubic.easeOut",
        onComplete: () => { slug.destroy(); this.dispenseTo(containerKey, result.valueDisplay); res(); },
      });
    });
  }

  dispenseTo(key, valueDisplay) {
    const container = this.miniContainers[key];
    container.valueText.setText(valueDisplay).setAlpha(0).setScale(1.3);
    this.tweens.add({ targets: container.valueText, alpha: 1, scale: 1, duration: 150, ease: "Back.easeOut" });
    this.tweens.add({ targets: container.pill, scaleX: 1.1, scaleY: 1.1, duration: 90, yoyo: true });
  }

  async miniRejection(method) {
    const key = method === "nextInt" ? "int" : "double";
    const nz = this.miniMachine.nozzles[key || "int"];
    this.tweens.add({ targets: nz.g, x: nz.g.x - 2, duration: 30, yoyo: true, repeat: 3 });
    this.screenShake(0.003, 130);
    this.miniMachine.strobe.setVisible(true);
    const strobeTween = this.tweens.add({ targets: this.miniMachine.strobe, angle: 360, fillAlpha: { from: 0.7, to: 0.3 }, duration: 180, repeat: 2 });
    await this.delay(100);
    if (!this._alive) return;
    const stamp = this.add.text(OX + OW / 2, MACHINE_Y - 30, "InputMismatchException", { font: "bold 10px Courier New", color: HEX_RED }).setOrigin(0.5).setAlpha(0).setScale(1.2);
    this.rigLayer.add(stamp);
    this.tweens.add({ targets: stamp, alpha: 1, scale: 1, duration: 150 });
    await this.delay(900);
    if (!this._alive) return;
    this.tweens.add({ targets: stamp, alpha: 0, duration: 180, onComplete: () => stamp.destroy() });
    strobeTween.stop();
    this.miniMachine.strobe.setVisible(false);
    await this.delay(100);
  }

  // ══════════════════════════════════════════════════════════════
  // MINI CONTAINERS + TICKER + MANIFEST STRIP
  // ══════════════════════════════════════════════════════════════

  createMiniContainers() {
    this.miniContainers = {};
    [{ key: "int", label: "int", color: C_INT, y: CONT_Y.int }, { key: "double", label: "double", color: C_DOUBLE, y: CONT_Y.double }, { key: "string", label: "String", color: C_LINE, y: CONT_Y.string }].forEach((def) => {
      const c = this.add.container(CONT_X, def.y);
      const w = 90, h = 24;
      const g = this.add.graphics();
      g.fillStyle(0x0a120c, 1);
      g.fillRoundedRect(-w / 2, -h / 2, w, h, 5);
      g.lineStyle(1.5, def.color, 1);
      g.strokeRoundedRect(-w / 2, -h / 2, w, h, 5);
      const pill = this.add.container(-w / 2 + 14, -h / 2 - 5);
      const pillBg = this.add.graphics();
      pillBg.fillStyle(def.color, 1);
      pillBg.fillRoundedRect(-13, -5, 26, 10, 5);
      const pillText = this.add.text(0, 0, def.label[0].toUpperCase(), { font: "bold 7px Arial", color: "#0a120c" }).setOrigin(0.5);
      pill.add([pillBg, pillText]);
      const varPlate = this.add.text(-w / 2 + 6, 2, "—", { font: "7px Arial", color: "#607d8b" }).setOrigin(0, 0.5);
      const valueText = this.add.text(w / 2 - 6, 2, "", { font: "bold 9px Courier New", color: Phaser.Display.Color.IntegerToColor(def.color).rgba }).setOrigin(1, 0.5);
      c.add([g, pill, varPlate, valueText]);
      this.rigLayer.add(c);
      this.miniContainers[def.key] = { c, g, pill, varPlate, valueText, color: def.color, x: CONT_X, y: def.y };
    });
  }

  resetMiniContainers() {
    Object.values(this.miniContainers).forEach((c) => { c.valueText.setText(""); c.varPlate.setText("—"); });
  }

  createOutputTicker() {
    const g = this.add.graphics();
    g.fillStyle(0x0a0e14, 1);
    g.fillRect(OX + 8, TICKER_Y - 9, OW - 16, 18);
    this.rigLayer.add(g);
    this.tickerText = this.add.text(OX + 14, TICKER_Y, "", { font: "bold 10px Courier New", color: HEX_GREEN_BRIGHT }).setOrigin(0, 0.5);
    this.rigLayer.add(this.tickerText);
    this.tickerCursor = this.add.rectangle(OX + 14, TICKER_Y, 5, 11, C_GREEN_BRIGHT).setOrigin(0, 0.5);
    this.rigLayer.add(this.tickerCursor);
    this.tweens.add({ targets: this.tickerCursor, alpha: 0, duration: 450, yoyo: true, repeat: -1 });
  }

  clearTicker() {
    this.tickerText.setText("");
    this.tickerCursor.setX(OX + 14);
  }

  pushTicker(ch) {
    this.tickerText.setText(this.tickerText.text + ch);
    this.tickerCursor.setX(OX + 14 + this.tickerText.width + 2);
  }

  createManifestStrip() {
    const g = this.add.graphics().setDepth(14);
    g.fillStyle(0x0a0e14, 0.9);
    g.fillRect(OX, STRIP_Y - 2, OW, 20);
    this.manifestStripText = this.add.text(OX + 8, STRIP_Y + 8, "", { font: "10px Arial", color: "#8c7ae6" }).setOrigin(0, 0.5).setDepth(15);
  }

  updateManifestStrip(text) {
    this.manifestStripText.setText(text);
  }

  // ══════════════════════════════════════════════════════════════
  // TEST REPORT & MISSION BRIEF
  // ══════════════════════════════════════════════════════════════

  createTestReportPanel() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0a0e14, 1);
    g.fillRoundedRect(RX, RY, RW, RH, 10);
    g.lineStyle(1, 0x1a2535, 1);
    g.strokeRoundedRect(RX, RY, RW, RH, 10);
    this.add.text(RX + 10, RY + 6, "TEST REPORT", { font: "bold 9px Arial", color: "#3d4450" }).setDepth(11);
    this.reportRows = [];
  }

  _compactInputLabel(inputLines) {
    return inputLines.join(" ⏎ ");
  }

  buildReportRows(tests) {
    this.reportRows.forEach((r) => r.container.destroy());
    this.reportRows = [];
    tests.forEach((test, i) => {
      const y = RY + 24 + i * 24;
      const c = this.add.container(RX + 10, y).setDepth(11).setAlpha(0.35);
      const inputT = this.add.text(0, 0, this._compactInputLabel(test.input), { font: "10px Courier New", color: "#b0bec5" }).setOrigin(0, 0.5);
      const arrow = this.add.text(220, 0, "→", { font: "12px Arial", color: HEX_GRAY }).setOrigin(0, 0.5);
      const expT = this.add.text(238, 0, test.expectedOutput, { font: "10px Courier New", color: HEX_GRAY }).setOrigin(0, 0.5);
      const actualT = this.add.text(RW - 60, 0, "?", { font: "10px Courier New", color: HEX_GRAY }).setOrigin(0, 0.5);
      const statusT = this.add.text(RW - 16, 0, "…", { font: "13px Arial", color: HEX_GRAY }).setOrigin(0.5);
      c.add([inputT, arrow, expT, actualT, statusT]);
      this.reportRows.push({ container: c, actualT, statusT });
    });
  }

  updateReportRow(index, actualText, match) {
    const row = this.reportRows[index];
    if (!row) return;
    row.container.setAlpha(1);
    row.actualT.setText(actualText).setColor(match ? HEX_GREEN_BRIGHT : HEX_RED);
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
    const brief = this.add.text(BX + 14, BY + 42, mission.brief, { font: "12px Arial", color: "#90a4ae", wordWrap: { width: BW - 28 } }).setOrigin(0, 0);
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

    this.add.text(20, 14, "THE FRONT DESK", { font: "bold 13px Arial", color: "#b0bec5" }).setDepth(51);
    this.add.text(20, 32, "Restructuring Phase — Scanner Methods: nextInt() / nextDouble() / nextLine()", { font: "10px Arial", color: "#546e7a" }).setDepth(51);

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
      lg.lineStyle(2, C_GREEN, 1);
      lg.strokeRoundedRect(-8, -6, 16, 11, 2);
      lg.fillStyle(C_GREEN, 1);
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
  // BIT — head clerk variant
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
    const badge = this.add.graphics();
    badge.fillStyle(0xe0e0e0, 1);
    badge.lineStyle(1, 0x78909c, 1);
    badge.fillRoundedRect(10, 4, 14, 10, 2);
    badge.strokeRoundedRect(10, 4, 14, 10, 2);
    badge.fillStyle(0x78909c, 0.5);
    badge.fillRect(12, 7, 10, 1);
    badge.fillRect(12, 10, 6, 1);
    const sparkle = this.add.text(24, 4, "✦", { font: "8px Arial", color: HEX_GOLD }).setOrigin(0.5).setAlpha(0);
    c.add([g, eye, pupil, badge, tip, sparkle]);
    this.tweens.add({ targets: tip, alpha: 0.3, duration: 900, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: c, y: "+=3", duration: 2000, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
    this.time.addEvent({ delay: 4000, loop: true, callback: () => this.tweens.add({ targets: sparkle, alpha: 1, duration: 200, yoyo: true }) });
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
    g.lineStyle(1.5, C_GREEN, 1);
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
    await this.bitSay("Morning shift, Clerk — walk-ins are lining up! Every mission is a real form: read what they type, do the work, print the answer. Same tape, same nozzles — YOU write the programs now.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();

    const a1 = this.floatingAnnotation(CX + CW / 2, CY - 20, "assemble the intake program", HEX_CYAN);
    await this.delay(350); if (!A()) return;
    const a2 = this.floatingAnnotation(CX + 200, CY + 20, "already built for you — carry on", HEX_GRAY);
    await this.delay(350); if (!A()) return;
    const a3 = this.floatingAnnotation(OX + OW / 2, OY - 20, "your program runs LIVE against the tape", HEX_GREEN_BRIGHT);
    await this.delay(350); if (!A()) return;
    const a4 = this.floatingAnnotation(OX + OW / 2, TICKER_Y - 20, "whatever you print appears here", HEX_GOLD);
    await this.delay(350); if (!A()) return;
    const a5 = this.floatingAnnotation(RX + RW / 2, RY - 12, "expected vs actual — the mismatches teach you", HEX_PURPLE);
    await this.delay(400); if (!A()) return;

    await this.bitSay("One promise from me: the tape never lies. If your build reads the wrong token or leaves crumbs behind, you'll SEE it happen. Build, run, read the report, repair. To your station!");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();
    [a1, a2, a3, a4, a5].forEach((a) => this.tweens.add({ targets: a, alpha: 0, duration: 250, onComplete: () => a.destroy() }));

    try { localStorage.setItem(TUTORIAL_KEY, "true"); } catch (_) {}
    this.showProjectBriefing(0);
  }

  floatingAnnotation(x, y, text, colorHex) {
    const t = this.add.text(x, y, text, { font: "bold 11px Arial", color: colorHex }).setOrigin(0.5).setDepth(70).setAlpha(0);
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
    this._janitorRecorded = false;
    this.clearMission();

    this.tabFilename.setText(`Desk${mission.mission}.java`);
    this.renderSkeleton(mission);
    this.populatePalette(mission);
    this.buildReportRows(mission.tests);
    this.renderMissionBrief(mission);
    this.disableRunButton();
    this.highlightCodeLine(null);
    this.verdictLamp.setFillStyle(C_GRAY);
    this.clearTicker();
    this.resetMiniContainers();
    this.loadMiniTape(mission.tests[0].input);
    [this.miniMachine.nozzles.int, this.miniMachine.nozzles.double, this.miniMachine.nozzles.line].forEach((n) => this.tweens.killTweensOf(n.glow));
    this.updateManifestStrip("");
  }

  clearMission() {
    this.missionElements.forEach((e) => { if (e && e.destroy) e.destroy(); });
    this.missionElements = [];
  }

  // ══════════════════════════════════════════════════════════════
  // GENUINE INTERPRETER — per-mission, honest sequential execution
  // ══════════════════════════════════════════════════════════════

  interpretMission(mission, blocks, inputLines) {
    switch (mission.mission) {
      case 1: return this._interpretMission1(blocks, inputLines);
      case 2: return this._interpretMission2(blocks, inputLines);
      case 3: return this._interpretMission3(blocks, inputLines);
      case 4: return this._interpretMission4(blocks, inputLines);
      case 5: return this._interpretMission5(blocks, inputLines);
      case 6: return this._interpretMission6(blocks, inputLines);
      default: return { compileError: true, tag: null };
    }
  }

  _interpretMission1(blocks, inputLines) {
    const steps = [];
    const declCode = blocks.decl[0].code;
    const readCode = blocks.read[0].code;
    const condCode = blocks.cond[0].code;
    const declType = declCode.split(" ")[0];
    const varName = declCode.split(" ")[1];
    const method = this._methodOf(readCode);
    const check = this.compileCheck(declType, method);
    if (!check.ok) return { compileError: true, tag: check.tag, steps };

    let cells = this.buildCellsFromLines(inputLines);
    const result = this.evaluateCall(cells, method);
    if (result.error) return { crash: true, steps, crashMethod: method };
    steps.push({ method, varName, result });

    const ageVal = result.rawValue;
    const passed = condCode === "age >= 18" ? ageVal >= 18 : ageVal > 18;
    return { value: passed ? "ENTRY" : "DENIED", steps };
  }

  _interpretMission2(blocks, inputLines) {
    const steps = [];
    const decl1Type = blocks.decl1[0].code.split(" ")[0];
    const var1 = blocks.decl1[0].code.split(" ")[1];
    const method1 = this._methodOf(blocks.read1[0].code);
    const decl2Type = blocks.decl2[0].code.split(" ")[0];
    const var2 = blocks.decl2[0].code.split(" ")[1];
    const method2 = this._methodOf(blocks.read2[0].code);
    const exprCode = blocks.expr[0].code;

    const check1 = this.compileCheck(decl1Type, method1);
    if (!check1.ok) return { compileError: true, tag: check1.tag, steps };
    const check2 = this.compileCheck(decl2Type, method2);
    if (!check2.ok) return { compileError: true, tag: check2.tag, steps };

    let cells = this.buildCellsFromLines(inputLines);
    const r1 = this.evaluateCall(cells, method1);
    if (r1.error) return { crash: true, steps, crashMethod: method1 };
    steps.push({ method: method1, varName: var1, result: r1 });
    cells = cells.slice(r1.consumedCount);

    const r2 = this.evaluateCall(cells, method2);
    if (r2.error) return { crash: true, steps, crashMethod: method2 };
    steps.push({ method: method2, varName: var2, result: r2 });

    const priceVal = r1.rawValue, qtyVal = r2.rawValue;
    let output;
    if (exprCode === "price * qty") output = this._fmtDouble(priceVal * qtyVal);
    else output = String(qtyVal * qtyVal);
    return { value: output, steps };
  }

  _interpretMission3(blocks, inputLines) {
    const steps = [];
    const janitorCode = blocks.janitor[0].code;
    const readCode = blocks.read[0].code;
    const readMethod = this._methodOf(readCode);

    let cells = this.buildCellsFromLines(inputLines);
    const r1 = this.evaluateCall(cells, "nextInt");
    if (r1.error) return { crash: true, steps, crashMethod: "nextInt" };
    steps.push({ method: "nextInt", varName: "age", result: r1 });
    cells = cells.slice(r1.consumedCount);

    if (janitorCode !== "(nothing)") {
      const jMethod = this._methodOf(janitorCode);
      const jr = this.evaluateCall(cells, jMethod);
      if (jr.error) return { crash: true, steps, crashMethod: jMethod };
      steps.push({ method: jMethod, varName: null, result: jr });
      cells = cells.slice(jr.consumedCount);
    }

    const r3 = this.evaluateCall(cells, readMethod);
    if (r3.error) return { crash: true, steps, crashMethod: readMethod };
    steps.push({ method: readMethod, varName: "name", result: r3 });

    return { value: `Hello, ${r3.rawValue}!`, steps };
  }

  _interpretMission4(blocks, inputLines) {
    const steps = [];
    const declType = blocks.decl[0].code.split(" ")[0];
    const varName = blocks.decl[0].code.split(" ")[1];
    const method = this._methodOf(blocks.read[0].code);
    const formulaCode = blocks.formula[0].code;

    const check = this.compileCheck(declType, method);
    if (!check.ok) return { compileError: true, tag: check.tag, steps };

    const cells = this.buildCellsFromLines(inputLines);
    const result = this.evaluateCall(cells, method);
    if (result.error) return { crash: true, steps, crashMethod: method };
    steps.push({ method, varName, result });

    const f = result.rawValue;
    let c;
    if (formulaCode === "(f - 32) * 5.0 / 9.0") c = (f - 32) * 5.0 / 9.0;
    else if (formulaCode === "(int)(f - 32) * 5 / 9") c = Math.trunc((Math.trunc(f - 32) * 5) / 9);
    else c = f - (32 * 5.0) / 9.0;
    return { value: this._fmtDouble(c), steps };
  }

  _interpretMission5(blocks, inputLines) {
    const steps = [];
    const janitorCode = blocks.janitor[0].code;

    let cells = this.buildCellsFromLines(inputLines);
    const r1 = this.evaluateCall(cells, "nextInt");
    if (r1.error) return { crash: true, steps, crashMethod: "nextInt" };
    steps.push({ method: "nextInt", varName: "age", result: r1 });
    cells = cells.slice(r1.consumedCount);

    const r2 = this.evaluateCall(cells, "nextDouble");
    if (r2.error) return { crash: true, steps, crashMethod: "nextDouble" };
    steps.push({ method: "nextDouble", varName: "height", result: r2 });
    cells = cells.slice(r2.consumedCount);

    if (janitorCode !== "(nothing)") {
      const jMethod = this._methodOf(janitorCode);
      const jr = this.evaluateCall(cells, jMethod);
      if (jr.error) return { crash: true, steps, crashMethod: jMethod };
      steps.push({ method: jMethod, varName: null, result: jr });
      cells = cells.slice(jr.consumedCount);
    }

    const r3 = this.evaluateCall(cells, "nextLine");
    if (r3.error) return { crash: true, steps, crashMethod: "nextLine" };
    steps.push({ method: "nextLine", varName: "name", result: r3 });

    return { value: `${r3.rawValue}, ${r1.rawValue}y, ${this._fmtDouble(r2.rawValue)}m`, steps };
  }

  _interpretMission6(blocks, inputLines) {
    const steps = [];
    const readCode = blocks.read[0].code;
    const transformCode = blocks.transform[0].code;

    if (readCode === "sc.nextInt()") return { compileError: true, tag: "wrong_method_for_type", steps };
    if (transformCode === "name.toUpperCase") return { compileError: true, tag: "property_vs_method_syntax", steps };
    if (transformCode === "name.charAt(0).toUpperCase()") return { compileError: true, tag: "chain_order_type_error", steps };

    const readMethod = this._methodOf(readCode);
    const cells = this.buildCellsFromLines(inputLines);
    const r = this.evaluateCall(cells, readMethod);
    if (r.error) return { crash: true, steps, crashMethod: readMethod };
    steps.push({ method: readMethod, varName: "name", result: r });

    const nameVal = r.rawValue;
    const transformed = transformCode === "name.toUpperCase()" ? nameVal.toUpperCase() : nameVal;
    return { value: `WELCOME, ${transformed}!`, steps };
  }

  // ══════════════════════════════════════════════════════════════
  // REVEAL — trace-driven, shared by all six missions
  // ══════════════════════════════════════════════════════════════

  async playReveal(mission, testInputLines, interpretResult) {
    this.loadMiniTape(testInputLines);
    this.verdictLamp.setFillStyle(C_AMBER);
    this.clearTicker();

    if (interpretResult.compileError) {
      await this.delay(150);
      this.showCompileErrorStamp();
      this.verdictLamp.setFillStyle(C_RED);
      return;
    }

    for (const step of interpretResult.steps) {
      if (!this._alive) return;
      this.updateManifestStrip(`${step.method}() →`);
      this.nozzleGlow(step.method, true);
      this.humMachine();
      await this.delay(90);
      if (!this._alive) return;
      const r = step.result;
      if (r.skippedCount > 0) await this.miniTapeConsume(r.skippedCount, true);
      const bodyCount = r.consumedCount - r.skippedCount;
      if (step.varName) {
        await this.miniTapeConsume(bodyCount, false);
        const key = r.returnType === "int" ? "int" : r.returnType === "double" ? "double" : "string";
        await this.castAndDispense(step.method, r, key, step.varName);
      } else {
        this.createAnnotation(MACHINE_X, MACHINE_Y - MACHINE_H / 2 - 8, "cleared!", HEX_NEWLINE);
        await this.miniTapeConsume(bodyCount, true);
      }
      this.nozzleGlow(step.method, false);
      await this.bufferBeat(300);
    }

    if (interpretResult.crash) {
      await this.miniRejection(interpretResult.crashMethod);
      this.verdictLamp.setFillStyle(C_RED);
      return;
    }

    this.updateManifestStrip("print() →");
    for (const ch of interpretResult.value) {
      if (!this._alive) return;
      this.pushTicker(ch);
      await this.delay(18);
    }
    this.verdictLamp.setFillStyle(C_GREEN_BRIGHT);
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

  _recordJanitorProactive(mission) {
    if (this._janitorRecorded) return;
    if (!mission.slots.find((s) => s.id === "janitor")) return;
    this._janitorRecorded = true;
    const assembled = this.getAssembledCode();
    const janitorBlock = assembled.janitor && assembled.janitor[0];
    const key = `mission${mission.mission}`;
    this.janitorProactive[key] = !!(janitorBlock && janitorBlock.code === "sc.nextLine();");
  }

  async onRunPressed() {
    if (this.inputLocked) return;
    this.inputLocked = true;
    this.disableRunButton();
    this.runButton.t.setText("...");
    this.runCount++;
    const mission = MISSIONS[this.currentMission];
    this._recordJanitorProactive(mission);
    const assembled = this.getAssembledCode();
    const wrongBlocksUsed = this._collectWrongBlocksUsed();

    const probe = this.interpretMission(mission, assembled, mission.tests[0].input);
    if (probe.compileError) {
      await this.playReveal(mission, mission.tests[0].input, probe);
      if (!this._alive) return;
      this._resolveRunOutcome(mission, "compile_fail", wrongBlocksUsed, [], { tag: probe.tag });
      return;
    }

    let anyMismatch = false, anyCrash = false;
    const failedTests = [];
    for (let i = 0; i < mission.tests.length; i++) {
      if (!this._alive) return;
      const test = mission.tests[i];
      const result = this.interpretMission(mission, assembled, test.input);
      const outcome = await this.runTestCase(mission, test, i, result);
      if (!outcome.match) { anyMismatch = true; failedTests.push(this._compactInputLabel(test.input)); }
      if (result.crash) anyCrash = true;
    }

    let resultKind = "pass";
    if (anyCrash) resultKind = "runtime_crash";
    else if (anyMismatch) resultKind = "logic_fail";

    this._resolveRunOutcome(mission, resultKind, wrongBlocksUsed, failedTests, null);
  }

  async runTestCase(mission, test, index, result) {
    await this.playReveal(mission, test.input, result);
    if (!this._alive) return { match: false };

    let actualDisplay, match;
    if (result.compileError) { actualDisplay = "COMPILE ERROR"; match = false; }
    else if (result.crash) { actualDisplay = "CRASHED"; match = false; }
    else { actualDisplay = this.tickerText.text; match = actualDisplay === test.expectedOutput; }

    this.updateReportRow(index, actualDisplay, match);
    await this.delay(150);
    return { match };
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

    // compileErr.tag is authoritative (computed directly from the actual
    // cause) — several slots can each hold a distractor simultaneously, so
    // wrongBlocksUsed[0] (picked by slot insertion order, not causation)
    // must not outrank it or the feedback can cite an unrelated block.
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
      1: "Read into a matching int variable, then compare with >= so 18 itself counts as entry.",
      2: "Whichever type you multiply by, the result should keep its decimal — price is a double for a reason.",
      3: "After a number read, a lone ⏎ waits on the tape. A bare, unassigned sc.nextLine(); sweeps it before the real line read.",
      4: "Keep every number in the formula a double — mixing in bare ints risks truncation.",
      5: "The leftover ⏎ sits after whichever tokenized read runs LAST — that's where the janitor call belongs.",
      6: "Read the whole line first, then transform the WHOLE String — case conversion needs the full name, not just a character.",
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
    this.verdictLamp.setFillStyle(C_GREEN_BRIGHT);
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
    const p = this.add.particles(x, y, "l36_dot", {
      speed: { min: 70, max: 220 }, angle: { min: 0, max: 360 }, scale: { start: 0.8, end: 0 }, lifespan: 450,
      tint: [C_GREEN, C_GOLD, C_GREEN_BRIGHT, C_PURPLE, 0xffffff], emitting: false,
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

    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
    this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });

    const title = this.add.text(640, 240, "DESK CLOSED", { font: "bold 40px Arial", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
    this.tweens.add({
      targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut",
      onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }),
    });
    this.add.text(640, 310, `Score: ${this.score}`, { font: "20px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
    this.add.text(640, 350, `Missions Completed: ${this.currentMission} / ${MISSIONS.length}`, { font: "16px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);

    this._makeButton(640, 420, "REOPEN THE DESK", 220, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearMission();
    this.hideBubble();

    try { GameManager.completeLevel(35, Math.round((this.flawlessCount / MISSIONS.length) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("scanner_mastery"); } catch (_) {}
    try {
      localStorage.setItem("level36_results", JSON.stringify({
        level: 36, concept: "scanner_input_methods", phase: "restructuring",
        score: this.score, missionsCompleted: 6, flawlessMissions: this.flawlessCount,
        totalRuns: this.runCount, failedRuns: this.failedRunCount, hintsUsed: this.hintCount,
        selfCorrections: this.selfCorrectionCount, janitorAppliedProactively: this.janitorProactive,
        livesRemaining: this.lives, attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.ghostQueueCeremony().then(() => { if (this._alive) this.wingSealAndTally(); });
  }

  async ghostQueueCeremony() {
    this.tweens.add({ targets: this.dawnGfx, alpha: 4, duration: 1200 });
    for (let i = 0; i < 6; i++) {
      if (!this._alive) return;
      const ghost = this.add.rectangle(220 + i * 150, 660, 16, 40, 0xffffff, 0.08).setDepth(3);
      this.tweens.add({ targets: ghost, x: ghost.x + 60, alpha: 0, duration: 900, ease: "Sine.easeInOut", onComplete: () => ghost.destroy() });
      await this.delay(220);
    }
    this.createConfetti(OX + OW / 2, OY + OH / 2, 36);
    await this.delay(500);
  }

  async wingSealAndTally() {
    this.showScoreTally();
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
    panel.fillStyle(0x0e160e, 1);
    panel.fillRoundedRect(350, 70, 580, 580, 16);
    panel.lineStyle(2, C_GOLD, 1);
    panel.strokeRoundedRect(350, 70, 580, 580, 16);

    const title = this.add.text(640, 108, "HEAD CLERK", { font: "bold 36px Arial", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(91).setScale(0);
    this.tweens.add({ targets: title, scale: 1, duration: 350, ease: "Back.easeOut" });

    const janitorCount = Object.values(this.janitorProactive).filter(Boolean).length;
    const janitorTotal = Object.keys(this.janitorProactive).length || 2;
    const lines = [
      `MISSIONS: 6/6`, `FLAWLESS: ${this.flawlessCount}`, `SELF-CORRECTIONS: ${this.selfCorrectionCount}`,
      `JANITOR-PROACTIVE: ${janitorCount}/${janitorTotal}`, `HINTS: ${this.hintCount}`,
    ];
    lines.forEach((s, i) => {
      const t = this.add.text(500, 155 + i * 26, s, { font: "14px Arial", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 250, delay: 300 + i * 130 });
    });
    const totalText = this.add.text(500, 155 + 5 * 26, "TOTAL: 0", { font: "bold 22px Arial", color: HEX_GOLD }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: totalText, alpha: 1, duration: 250, delay: 1000 });
    const counter = { v: 0 };
    this.tweens.add({ targets: counter, v: this.score, duration: 1000, delay: 1000, onUpdate: () => totalText.setText(`TOTAL: ${Math.round(counter.v)}`) });

    const stars = this._starRating();
    for (let i = 0; i < 3; i++) {
      const earned = i < stars;
      const s = this.add.text(640 + (i - 1) * 60, 340, "★", { font: "36px Arial", color: earned ? HEX_GOLD : "#2a3040" }).setOrigin(0.5).setDepth(91).setScale(0);
      this.tweens.add({ targets: s, scale: 1, duration: 250, delay: 1700 + i * 200, ease: earned ? "Back.easeOut" : "Cubic.easeOut" });
    }

    const badge = this.add.container(640, 415).setDepth(91).setAlpha(0);
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillCircle(0, 0, 34);
    bg.lineStyle(3, C_GOLD, 1);
    bg.strokeCircle(0, 0, 34);
    bg.fillStyle(0x142018, 1);
    bg.fillRoundedRect(-20, -8, 16, 16, 2);
    bg.lineStyle(1.5, C_NEWLINE, 1);
    bg.strokeCircle(2, 6, 8);
    bg.fillStyle(0xe0e0e0, 1);
    bg.fillRoundedRect(6, -10, 12, 8, 2);
    badge.add(bg);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 2100 });
    const badgeLbl = this.add.text(640, 458, "SCANNER MASTERY", { font: "bold 14px Arial", color: HEX_GOLD }).setOrigin(0.5).setDepth(91).setAlpha(0);
    const badgeSub = this.add.text(640, 476, "Accretion ✓  Tuning ✓  Restructuring ✓", { font: "10px Arial", color: "#78909c" }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: [badgeLbl, badgeSub], alpha: 1, duration: 300, delay: 2200 });

    const ribbon = this.add.graphics().setDepth(91).setAlpha(0);
    ribbon.fillStyle(0x1a1a2e, 1);
    ribbon.lineStyle(2, C_GOLD, 1);
    ribbon.fillRoundedRect(640 - 190, 498, 380, 50, 8);
    ribbon.strokeRoundedRect(640 - 190, 498, 380, 50, 8);
    const ribbonText = this.add.text(640, 514, "INTAKE WING — COMPLETE", { font: "bold 12px Arial", color: HEX_GOLD }).setOrigin(0.5).setDepth(92).setAlpha(0);
    const seals = ["nextInt()", "nextDouble()", "nextLine()"].map((label, i) => {
      const t = this.add.text(560 + i * 80, 536, `${label}`, { font: "10px Courier New", color: "#3d4450" }).setOrigin(0.5).setDepth(92);
      return t;
    });
    this.tweens.add({ targets: ribbon, alpha: 1, duration: 300, delay: 2500 });
    this.tweens.add({ targets: ribbonText, alpha: 1, duration: 300, delay: 2700 });
    seals.forEach((t, i) => {
      this.time.delayedCall(2900 + i * 300, () => { t.setColor(HEX_PURPLE); this.tweens.add({ targets: t, scale: 1.2, duration: 150, yoyo: true }); });
    });

    this._makeButton(500, 590, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(760, 590, "NEXT WING →", 200, 44, { fill: 0x00733a, stroke: C_GREEN_BRIGHT, textColor: "#ffffff" }, () => {
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
