/**
 * Level 34 — "The Intake Dock" (Scanner Methods: Accretion Phase)
 * ===========================================================================
 * Opens the new Intake Wing. Teaches Scanner.nextInt() / nextDouble() /
 * nextLine() through a receiving-dock metaphor: raw input arrives on a
 * visible BUFFER TAPE (the ground truth of buffer state — every consumption,
 * skip, and rejection is derived from it, never scripted). The Scanner
 * machine consumes tokens from the tape front and casts them into typed
 * containers; a mismatched token is rejected wholesale (InputMismatchException)
 * and the tape is left completely unchanged, exactly as real Java behaves.
 *
 * evaluateCall() is an honest tokenizer: skip leading whitespace, read the
 * maximal token, validate it against the calling method's type, and return
 * either a typed value with its consumed cells, or an error with ZERO cells
 * consumed. All visuals (tape length, machine casting, container fills,
 * compile/runtime error stamps) are derived from this single function.
 */

import Phaser from "phaser";
import { GameManager } from "../../../GameManager.js";
import { BadgeSystem } from "../../../BadgeSystem.js";

const W = 1280, H = 720;

const C_GREEN = 0x4caf50, C_GREEN_BRIGHT = 0x00e676, C_GOLD = 0xffd740;
const C_CYAN = 0x00e5ff, C_RED = 0xf44336, C_GRAY = 0x78909c;
const C_INT = 0x1565c0, C_DOUBLE = 0xe65100, C_LINE = 0x2e7d32;
const C_SPACE = 0xc2185b, C_NEWLINE = 0x7b1fa2, C_WALL_STROKE = 0x1c2e1c;
const HEX_GREEN = "#4caf50", HEX_GOLD = "#ffd740", HEX_CYAN = "#00e5ff";
const HEX_RED = "#f44336", HEX_GRAY = "#78909c", HEX_GREEN_BRIGHT = "#00e676";
const HEX_INT = "#1565c0", HEX_DOUBLE = "#e65100", HEX_LINE = "#2e7d32";
const HEX_SPACE = "#c2185b", HEX_NEWLINE = "#7b1fa2";

const TAPE_X0 = 90, TAPE_X1 = 555, TAPE_Y = 250;
const MACHINE_X = 640, MACHINE_Y = 300, MACHINE_W = 240, MACHINE_H = 200;
const CONTAINER_X = 1090, CONTAINER_W = 150, CONTAINER_H = 54;
const CONTAINER_Y = { int: 226, double: 300, string: 374 };
const NOZZLE_Y = { int: 250, double: 300, line: 350 };
const PORT_X = 35, PORT_Y = 250;
const SRC_Y = 158;
const TUTORIAL_KEY = "level34_tutorial_done";

// ══════════════════════════════════════════════════════════════
// ROUND CONFIGURATION
// ══════════════════════════════════════════════════════════════
const ROUNDS = [
  { round: 1, type: "predict", inputLine: "7", call: "sc.nextInt()", correct: "7",
    options: [
      { value: "7", tag: null },
      { value: '"7"', tag: "returns_string_belief" },
      { value: "7.0", tag: "returns_double_belief" },
      { value: "Error", tag: "mismatch_overapplied" },
    ], concept: "basic_int_read" },

  { round: 2, type: "predict", inputLine: "2.75", call: "sc.nextDouble()", correct: "2.75",
    options: [
      { value: "2.75", tag: null },
      { value: "2", tag: "decimal_truncation_belief" },
      { value: "3", tag: "rounding_belief" },
      { value: '"2.75"', tag: "returns_string_belief" },
    ], concept: "basic_double_read" },

  { round: 3, type: "predict", inputLine: "hi bit", call: "sc.nextLine()", correct: '"hi bit"',
    options: [
      { value: '"hi bit"', tag: null },
      { value: '"hi"', tag: "line_reads_one_word_belief" },
      { value: '"hibit"', tag: "line_strips_spaces_belief" },
      { value: "Error", tag: "line_needs_number_belief" },
    ],
    revealNote: "The ␣ cell rides visibly into the String bar; the ⏎ flares and vanishes at the mouth.",
    concept: "line_reads_everything" },

  { round: 4, type: "predict", inputLine: "42", call: "sc.nextDouble()", correct: "42.0",
    options: [
      { value: "42.0", tag: null },
      { value: "42", tag: "widening_unaware" },
      { value: "Error", tag: "double_needs_decimal_belief" },
      { value: "4.2", tag: "casting_confusion" },
    ],
    revealNote: "The int slug grows its .0 with the sparkle — an int token is a perfectly legal double.",
    concept: "int_token_as_double" },

  { round: 5, type: "predict", inputLine: "3.5", call: "sc.nextInt()", correct: "Error",
    options: [
      { value: "Error", tag: null },
      { value: "3", tag: "decimal_truncation_belief" },
      { value: "4", tag: "rounding_belief" },
      { value: "3.5", tag: "type_mismatch_int_from_decimal" },
    ],
    revealNote: "Full rejection sequence + 'rejected token stays on the tape!' annotation.",
    concept: "decimal_into_int_crash" },

  { round: 6, type: "predict", inputLine: "bit", call: "sc.nextInt()", correct: "Error",
    options: [
      { value: "Error", tag: null },
      { value: "0", tag: "mismatch_returns_zero_belief" },
      { value: "null", tag: "mismatch_returns_null_belief" },
      { value: '"bit"', tag: "type_mismatch_int_from_word" },
    ], concept: "word_into_int_crash" },

  { round: 7, type: "judge", inputLine: "9", snippet: "int n = sc.nextInt();",
    correct: "valid", resultValue: "9", wrongTag: "declaration_doubt", concept: "matched_declaration" },

  { round: 8, type: "judge", inputLine: "9", snippet: "int n = sc.nextDouble();",
    correct: "invalid", faultPart: "sc.nextDouble()",
    explanation: "nextDouble() returns a double — it will NOT squeeze into an int. Precision could be lost, so Java refuses at compile time.",
    wrongTag: "narrowing_assignment_error",
    revealNote: "The leak annotation: an orange double slug hovering over the too-small blue container.",
    concept: "narrowing_refused" },

  { round: 9, type: "judge", inputLine: "9", snippet: "double d = sc.nextInt();",
    correct: "valid", resultValue: "9.0",
    explanation: "The legal direction! An int always fits inside a double — widening is safe and automatic.",
    wrongTag: "widening_unaware",
    revealNote: "The int slug dispenses, grows its .0 sparkle, and settles into the orange container.",
    concept: "widening_allowed" },

  { round: 10, type: "command", inputLine: "25",
    mission: "The form needs the user's AGE — a whole number, stored correctly.",
    monitorTemplate: "int age = <slot:method>;",
    cartridges: [
      { code: "sc.nextInt()", correct: true, slotId: "method" },
      { code: "sc.nextDouble()", tag: "narrowing_assignment_error", slotId: "method" },
      { code: "sc.nextLine()", tag: "line_into_int_belief", slotId: "method" },
    ],
    expectedValue: "25", declType: "int", concept: "command_int" },

  { round: 11, type: "command", inputLine: "72.5",
    mission: "The clinic scale sent the WEIGHT. Capture every decimal.",
    monitorTemplate: "double weight = <slot:method>;",
    cartridges: [
      { code: "sc.nextDouble()", correct: true, slotId: "method" },
      { code: "sc.nextInt()", tag: "type_mismatch_int_from_decimal", slotId: "method" },
      { code: "sc.nextLine()", tag: "line_into_double_belief", slotId: "method" },
    ],
    expectedValue: "72.5", declType: "double",
    revealNote: "The nextInt() cartridge is the subtle one: double weight = sc.nextInt(); COMPILES — the reveal runs, the nozzle meets '72.5', and the runtime rejection fires. Compile-clean is not crash-proof!",
    concept: "command_double" },

  { round: 12, type: "command", inputLine: "Anjana Perera",
    mission: "Registration needs the user's FULL NAME — both words, the space included.",
    monitorTemplate: "<slot:decl> = <slot:method>;",
    cartridges: [
      { code: "String name", correct: true, slotId: "decl" },
      { code: "sc.nextLine()", correct: true, slotId: "method" },
      { code: "int name", tag: "line_into_int_belief", slotId: "decl" },
      { code: "sc.nextInt()", tag: "type_mismatch_int_from_word", slotId: "method" },
    ],
    expectedValue: '"Anjana Perera"', declType: "String",
    revealNote: "The full line — ␣ and all — fuses into one String bar. The ⏎ flares and vanishes. Registration complete.",
    concept: "command_line" },
];

const MISCONCEPTION_FEEDBACK = {
  type_mismatch_int_from_decimal: "The INT nozzle saw that decimal point and slammed shut! 3.5 can never be an int. Decimals need nextDouble().",
  type_mismatch_int_from_word: "Letters into the INT nozzle? Instant rejection — InputMismatchException, program down. Words travel by nextLine().",
  mismatch_returns_zero_belief: "Scanner never apologizes with a zero — a mismatch CRASHES the program. Loud failures, not quiet lies.",
  mismatch_returns_null_belief: "Scanner doesn't hand back null on a mismatch — it CRASHES the program with an exception. No quiet failures.",
  decimal_truncation_belief: "Scanner doesn't trim or round — it either casts the token cleanly or throws the exception. No halfway.",
  rounding_belief: "Scanner doesn't trim or round — it either casts the token cleanly or throws the exception. No halfway.",
  widening_unaware: "The int became 42.0! Small fits inside big: an int token through nextDouble() — or into a double variable — widens safely.",
  narrowing_assignment_error: "Big into small is forbidden — a double will not squeeze into an int variable. Java refuses before the program even runs.",
  line_reads_one_word_belief: "nextLine() is the greedy nozzle — it swallows the WHOLE line, first letter to the ⏎. Every word, every space.",
  line_strips_spaces_belief: "The ␣ rode straight into the String — watch the tape! nextLine() keeps spaces; nothing is stripped.",
  returns_string_belief: "Check the container it landed in — nextInt() returns a real int, ready for math. No quotes anywhere.",
  returns_double_belief: "nextInt() returns a genuine int — no decimal point ever appears. For decimals, you'd need nextDouble().",
  line_into_int_belief: "nextLine() hands you a String — and a String will never fit a number container. Match the nozzle to the variable.",
  line_into_double_belief: "nextLine() hands you a String — and a String will never fit a number container. Match the nozzle to the variable.",
  mismatch_overapplied: "7 is a perfectly valid int token — no mismatch here! Save 'Error' for when the token truly can't cast.",
  double_needs_decimal_belief: "An int token is a perfectly legal double — no decimal point required on the way in. It casts cleanly to 42.0.",
  casting_confusion: "The digits don't get rearranged — 42 becomes 42.0, not 4.2. Casting only adds the decimal; it never reshuffles digits.",
  line_needs_number_belief: "nextLine() doesn't care what's on the line — words, spaces, anything. It just reads until the ⏎.",
  declaration_doubt: "Look again — the types match perfectly here. This one compiles and runs just fine!",
};

export class Level34Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level34Scene" });
  }

  init() {
    this.currentRound = 0;
    this.score = 0;
    this.displayScore = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.lives = 3;
    this.correctFirstTry = 0;
    this.totalTimeMs = 0;
    this.attemptLog = [];
    this.roundElements = [];
    this.roundStartTime = 0;
    this.roundAttempts = 0;
    this.tapeState = [];
    this.machineOn = false;
    this.inputLocked = true;
    this.gameEnded = false;
    this._alive = true;
    this._bubble = null;
    this.slotContents = {};
    this.slotDefs = {};
    this.cartridges = [];
    this._dragHoverSlotKey = null;
    this._sparkledWidening = false;
    this._noteLeak = false;
    this._noteSkip = false;
    this._noteEnter = false;
    this._noteReject = false;
  }

  preload() {}

  create() {
    this._alive = true;
    this.events.once("shutdown", () => { this._alive = false; });

    const cam = this.cameras.main;
    const zoom = Math.min(this.scale.width / W, this.scale.height / H);
    cam.setZoom(zoom);
    cam.centerOn(W / 2, H / 2);
    cam.setBackgroundColor("#081008");

    try { GameManager.incrementAttempt(33); } catch (_) {}

    this.createParticleTexture();
    this.createBackground();
    this.createOutsideWall();
    this.createIntakePort();
    this.createDockHall();
    this.createDockSign();
    this.createParticles();
    this.createTapeRail();
    this.createScannerMachine();
    this.createContainers();
    this.createSourceDisplay();
    this.createHUD();
    this.createExpressionMonitor();
    this.createBit();
    this.setupDragEvents();

    cam.fadeIn(700, 3, 3, 5);
    this.checkTutorial();
  }

  update(time, delta) {
    this.updateParticles(time, delta);
    this.updateSignSway(time);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // SETUP — background & environment
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l34_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l34_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x081008).setDepth(0);
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
    this._drawIrisWedges(wedges, 0);
    const plate = this.add.text(0, -62, "FROM OUTSIDE", { font: "bold 9px Arial", color: HEX_GREEN }).setOrigin(0.5);
    c.add([outer, ring, wedges, plate]);
    this.port = { c, wedges, openness: 0 };
  }

  _drawIrisWedges(g, openness) {
    g.clear();
    g.lineStyle(2, C_WALL_STROKE, 1);
    const spread = openness * 14;
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i;
      const r0 = 4 + spread;
      const r1 = 40;
      g.lineBetween(Math.cos(a) * r0, Math.sin(a) * r0, Math.cos(a) * r1, Math.sin(a) * r1);
    }
  }

  openPortIris() {
    const state = { v: 0 };
    this.tweens.add({
      targets: state, v: 1, duration: 250, yoyo: true, hold: 300,
      onUpdate: () => this._drawIrisWedges(this.port.wedges, state.v),
    });
    for (let i = 0; i < 3; i++) {
      const fleck = this.add.circle(PORT_X + 40, PORT_Y + Phaser.Math.Between(-10, 10), 1.5, 0xffffff, 0.8).setDepth(3);
      this.tweens.add({ targets: fleck, x: fleck.x + 20, alpha: 0, duration: 300, delay: i * 40, onComplete: () => fleck.destroy() });
    }
  }

  createDockHall() {
    const g = this.add.graphics().setDepth(1);
    for (let row = 0; row < 2; row++) {
      const y = 40 + row * 50;
      g.lineStyle(1, C_WALL_STROKE, 0.06);
      g.lineBetween(100, y, 1180, y);
      for (let i = 0; i < 6; i++) {
        const x = 150 + i * 170;
        g.strokeRect(x, y - 18, 24, 18);
      }
    }
    g.lineStyle(1, C_WALL_STROKE, 0.06);
    g.strokeRect(1180, 250, 90, 310);
    g.lineBetween(1180, 330, 1270, 330);
    g.lineBetween(1180, 410, 1270, 410);
    g.lineBetween(1180, 490, 1270, 490);
    g.fillStyle(0x0c120c, 1);
    g.fillRect(0, 620, W, 100);
    const dash = this.add.graphics().setDepth(1);
    dash.lineStyle(2, C_GOLD, 0.05);
    for (let x = 0; x < W; x += 24) dash.lineBetween(x, 680, x + 12, 680);
  }

  createDockSign() {
    const c = this.add.container(350, 84).setDepth(2);
    const g = this.add.graphics();
    g.fillStyle(0x0c150c, 1);
    g.fillRoundedRect(-75, -15, 150, 30, 6);
    g.lineStyle(1, C_GREEN, 0.3);
    g.strokeRoundedRect(-75, -15, 150, 30, 6);
    g.lineBetween(-40, -15, -40, -34);
    g.lineBetween(40, -15, 40, -34);
    const t = this.add.text(0, 0, "INTAKE WING", { font: "bold 11px Arial", color: HEX_GREEN }).setOrigin(0.5).setAlpha(0.6);
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
      const p = this.add.circle(Phaser.Math.Between(90, 1180), Phaser.Math.Between(70, 600), 1, 0xa5d6a7, Phaser.Math.FloatBetween(0.02, 0.05)).setDepth(2);
      this.ambient.push(p);
    }
  }

  updateParticles(time, delta) {
    if (!this.ambient) return;
    const step = 0.025 * (delta / 16.7);
    this.ambient.forEach((p, i) => {
      p.x += step;
      p.y += Math.sin(time * 0.0006 + i) * 0.05;
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
    side(x, y, x + w, y);
    side(x + w, y, x + w, y + h);
    side(x + w, y + h, x, y + h);
    side(x, y + h, x, y);
  }

  // ══════════════════════════════════════════════════════════════
  // TAPE — the buffer, the ground truth
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
    g.lineStyle(1, C_WALL_STROKE, 0.4);
    g.lineBetween(TAPE_X0 - 8, TAPE_Y, TAPE_X1 + 8, TAPE_Y);
    this.tapeContainer = this.add.container(0, 0).setDepth(20);
    this.tapeCellObjs = [];
  }

  loadTape(inputLine) {
    this.tapeState = inputLine.split("").map((ch) => ({ ch, kind: this._classifyChar(ch) }));
    this.tapeState.push({ ch: "\n", kind: "newline" });
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

    const cellW = 22;
    const totalW = Math.max(this.tapeState.length * cellW, 4);
    const startX = TAPE_X1 - totalW;

    const bg = this.add.graphics();
    bg.fillStyle(0xe8f0e8, 0.92);
    bg.fillRoundedRect(Math.max(startX, TAPE_X0 - 30), TAPE_Y - 22, Math.min(totalW, TAPE_X1 - TAPE_X0 + 30), 44, 4);
    bg.lineStyle(1, C_WALL_STROKE, 1);
    bg.strokeRoundedRect(Math.max(startX, TAPE_X0 - 30), TAPE_Y - 22, Math.min(totalW, TAPE_X1 - TAPE_X0 + 30), 44, 4);
    this.tapeContainer.add(bg);

    this.tapeState.forEach((cell, i) => {
      const x = startX + i * cellW + cellW / 2;
      if (x < TAPE_X0 - 40) return;
      const t = this.add.text(x, TAPE_Y, this._cellDisplay(cell), {
        font: cell.kind === "newline" ? "bold 18px Courier New" : "bold 15px Courier New",
        color: this._cellColor(cell.kind),
      }).setOrigin(0.5);
      if (animateIn) { t.setAlpha(0); this.tweens.add({ targets: t, alpha: 1, duration: 200, delay: i * 15 }); }
      this.tapeContainer.add(t);
      this.tapeCellObjs.push(t);
    });
  }

  /** Animates the given prefix cell-objects sliding into the machine mouth, then removes them from tapeState and re-renders. */
  async tapeConsumeVisual(count, discard = false) {
    const objs = this.tapeCellObjs.slice(0, count);
    const promises = objs.map((t, i) => new Promise((res) => {
      this.tweens.add({
        targets: t, x: MACHINE_X - MACHINE_W / 2 + 10, y: discard ? t.y - 20 : MACHINE_Y,
        alpha: 0, scale: 0.4, duration: 220, delay: i * 45, ease: "Cubic.easeIn",
        onComplete: () => { t.destroy(); res(); },
      });
    }));
    await Promise.all(promises);
    this.tapeState = this.tapeState.slice(count);
    this.renderTape(false);
  }

  // ══════════════════════════════════════════════════════════════
  // SCANNER MACHINE
  // ══════════════════════════════════════════════════════════════

  createScannerMachine() {
    const c = this.add.container(MACHINE_X, MACHINE_Y).setDepth(10);
    const body = this.add.graphics();
    const strokeCol = () => (this.machineOn ? C_GREEN : C_WALL_STROKE);
    const drawBody = () => {
      body.clear();
      body.fillStyle(0x0e1810, 1);
      body.fillRoundedRect(-MACHINE_W / 2, -MACHINE_H / 2, MACHINE_W, MACHINE_H, 14);
      body.lineStyle(2, strokeCol(), 1);
      body.strokeRoundedRect(-MACHINE_W / 2, -MACHINE_H / 2, MACHINE_W, MACHINE_H, 14);
    };
    drawBody();
    const nameplate = this.add.text(0, -MACHINE_H / 2 + 16, "— OFFLINE —", { font: "bold 12px Courier New", color: HEX_GRAY }).setOrigin(0.5);

    const mouth = this.add.graphics();
    mouth.fillStyle(0x050a05, 1);
    mouth.fillRoundedRect(-MACHINE_W / 2 - 14, -12, 18, 24, 3);
    mouth.lineStyle(1, C_WALL_STROKE, 1);
    mouth.strokeCircle(-MACHINE_W / 2 - 20, -8, 3);
    mouth.strokeCircle(-MACHINE_W / 2 - 20, 8, 3);

    const porthole = this.add.circle(0, 0, 26, 0x050a05);
    const portholeRing = this.add.graphics();
    portholeRing.lineStyle(2, C_WALL_STROKE, 1);
    portholeRing.strokeCircle(0, 0, 26);

    const strobe = this.add.circle(0, -MACHINE_H / 2 + 8, 4, 0xffab00, 0).setVisible(false);

    c.add([body, nameplate, mouth, porthole, portholeRing, strobe]);

    const nozzles = {};
    const nozzleDefs = [
      { key: "int", y: NOZZLE_Y.int, ring: C_INT, label: "→ int" },
      { key: "double", y: NOZZLE_Y.double, ring: C_DOUBLE, label: "→ double" },
      { key: "line", y: NOZZLE_Y.line, ring: C_LINE, label: "→ String" },
    ];
    nozzleDefs.forEach((def) => {
      const ny = def.y - MACHINE_Y;
      const ng = this.add.graphics();
      ng.fillStyle(0x142018, 1);
      ng.fillRoundedRect(MACHINE_W / 2 - 4, ny - 10, 34, 20, 4);
      ng.lineStyle(2, def.ring, 0.5);
      ng.strokeRoundedRect(MACHINE_W / 2 - 4, ny - 10, 34, 20, 4);
      const lbl = this.add.text(MACHINE_W / 2 + 42, ny, def.label, { font: "9px Courier New", color: "#607d8b" }).setOrigin(0, 0.5);
      const glow = this.add.rectangle(MACHINE_W / 2 + 13, ny, 34, 20, def.ring, 0).setOrigin(0.5);
      c.add([ng, lbl, glow]);
      nozzles[def.key] = { g: ng, glow, ring: def.ring, y: def.y };
    });

    this.machine = { c, body, drawBody, nameplate, porthole, portholeRing, strobe, nozzles };
  }

  powerOnMachine() {
    this.machineOn = true;
    this.machine.drawBody();
    this.machine.nameplate.setText("SCANNER sc");
    this.tweens.add({ targets: this.machine.c, scaleX: 1.02, scaleY: 1.02, duration: 150, yoyo: true, repeat: 2 });
  }

  powerOffMachine() {
    this.machineOn = false;
    this.machine.drawBody();
    this.machine.nameplate.setText("— OFFLINE —");
  }

  nozzleGlow(method, on, color = null) {
    const key = method === "nextInt" ? "int" : method === "nextDouble" ? "double" : "line";
    const nz = this.machine.nozzles[key];
    this.tweens.killTweensOf(nz.glow);
    this.tweens.add({ targets: nz.glow, fillAlpha: on ? 0.35 : 0, duration: 150 });
    if (on) nz.glow.setFillStyle(color || nz.ring, nz.glow.fillAlpha || 0.35);
  }

  humMachine() {
    this.tweens.add({ targets: this.machine.c, x: MACHINE_X + 0.6, duration: 40, yoyo: true, repeat: 5 });
  }

  /** The full honest tokenizer. Pure function over cell arrays; never scripted. */
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

  /**
   * Runs a full intake call against the live tape: plays skip/consume/cast/
   * dispense or the mismatch-rejection sequence, and returns the result of
   * evaluateCall() so callers can grade against it.
   */
  async runIntake(method, targetContainerKey) {
    const result = this.evaluateCall(this.tapeState, method);
    this.nozzleGlow(method, true);
    this.humMachine();
    await this.delay(150);
    if (!this._alive) return result;

    if (result.error) {
      await this.rejectMismatch(method);
      this.nozzleGlow(method, false);
      return result;
    }

    if (result.skippedCount > 0) {
      if (!this._noteSkip) { this._noteSkip = true; this.createAnnotation(TAPE_X0 + 20, TAPE_Y - 40, "whitespace skipped", HEX_SPACE); }
      await this.tapeConsumeVisual(result.skippedCount, true);
    }
    const bodyCount = result.consumedCount - result.skippedCount;
    if (method === "nextLine" && !this._noteEnter) {
      this._noteEnter = true;
      this.createAnnotation(MACHINE_X, MACHINE_Y - MACHINE_H / 2 - 14, "⏎ consumed, not kept", HEX_NEWLINE);
    }
    await this.tapeConsumeVisual(bodyCount, false);
    await this.castAndDispense(method, result, targetContainerKey);
    this.nozzleGlow(method, false);
    return result;
  }

  async castAndDispense(method, result, targetContainerKey) {
    const swirl = this.add.circle(MACHINE_X, MACHINE_Y, 4, 0xffffff, 0.8).setDepth(11);
    this.tweens.add({ targets: swirl, scale: 5, alpha: 0, duration: 300, onComplete: () => swirl.destroy() });
    await this.delay(200);
    if (!this._alive) return;

    const key = targetContainerKey || (result.returnType === "int" ? "int" : result.returnType === "double" ? "double" : "string");
    const container = this.containers[key];
    // Widening can happen two ways: the token itself has no decimal point but
    // nextDouble() still casts it cleanly (result.widened), OR nextInt()
    // genuinely returns an int that then widens on assignment into a double
    // variable/container (key === "double" but the call was nextInt()).
    const assignmentWidened = key === "double" && result.returnType === "int";
    const widening = result.widened || assignmentWidened;
    const displayValue = assignmentWidened ? Number(result.rawValue).toFixed(1) : result.valueDisplay;
    const color = assignmentWidened ? C_DOUBLE : result.returnType === "int" ? C_INT : result.returnType === "double" ? C_DOUBLE : C_LINE;

    const slug = this.add.text(MACHINE_X, MACHINE_Y, displayValue, { font: "bold 15px Courier New", color: Phaser.Display.Color.IntegerToColor(color).rgba }).setOrigin(0.5).setDepth(12).setScale(0.5).setAlpha(0);
    this.tweens.add({ targets: slug, scale: 1, alpha: 1, duration: 150 });
    await this.delay(150);
    if (!this._alive) return;

    if (widening) await this.wideningSparkle(slug);

    await new Promise((res) => {
      this.tweens.add({
        targets: slug, x: container.x, y: container.y, scale: 0.85, duration: 350, ease: "Cubic.easeOut",
        onComplete: () => {
          slug.destroy();
          this.dispenseTo(key, displayValue);
          res();
        },
      });
    });
  }

  async wideningSparkle(slug) {
    const spark = this.add.text(slug.x + 14, slug.y, "✦", { font: "12px Arial", color: HEX_GOLD }).setDepth(13).setAlpha(0);
    this.tweens.add({ targets: spark, alpha: 1, duration: 150, yoyo: true, onComplete: () => spark.destroy() });
    await this.delay(200);
  }

  dispenseTo(key, valueDisplay) {
    const container = this.containers[key];
    container.valueText.setText(valueDisplay).setAlpha(0).setScale(1.4);
    this.tweens.add({ targets: container.valueText, alpha: 1, scale: 1, duration: 200, ease: "Back.easeOut" });
    this.tweens.add({ targets: container.pill, scaleX: 1.15, scaleY: 1.15, duration: 120, yoyo: true });
  }

  async rejectMismatch(method) {
    const key = method === "nextInt" ? "int" : "double";
    const nz = this.machine.nozzles[key];
    this.tweens.add({ targets: nz.g, x: nz.g.x - 3, duration: 40, yoyo: true, repeat: 3 });
    this.screenShake(0.004, 200);
    this.machine.strobe.setVisible(true);
    const strobeTween = this.tweens.add({ targets: this.machine.strobe, angle: 360, fillAlpha: { from: 0.8, to: 0.3 }, duration: 260, repeat: 2 });
    await this.delay(150);
    if (!this._alive) return;

    const stamp = this.add.text(MACHINE_X, MACHINE_Y - 10, "InputMismatchException", { font: "bold 14px Courier New", color: HEX_RED }).setOrigin(0.5).setDepth(30).setAlpha(0).setScale(1.3);
    this.tweens.add({ targets: stamp, alpha: 1, scale: 1, duration: 200 });
    if (!this._noteReject) {
      this._noteReject = true;
      this.createAnnotation(MACHINE_X, MACHINE_Y + 40, "rejected token stays on the tape!", HEX_RED);
    }
    await this.delay(1400);
    if (!this._alive) return;
    this.tweens.add({ targets: stamp, alpha: 0, duration: 250, onComplete: () => stamp.destroy() });
    strobeTween.stop();
    this.machine.strobe.setVisible(false);
    await this.delay(150);
  }

  // ══════════════════════════════════════════════════════════════
  // TYPED CONTAINERS
  // ══════════════════════════════════════════════════════════════

  createContainers() {
    this.containers = {};
    const defs = [
      { key: "int", label: "int", color: C_INT, y: CONTAINER_Y.int },
      { key: "double", label: "double", color: C_DOUBLE, y: CONTAINER_Y.double },
      { key: "string", label: "String", color: C_LINE, y: CONTAINER_Y.string },
    ];
    defs.forEach((def) => {
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
      const valueText = this.add.text(CONTAINER_W / 2 - 12, 4, "", { font: "bold 16px Courier New", color: Phaser.Display.Color.IntegerToColor(def.color).rgba }).setOrigin(1, 0.5);
      c.add([g, pill, varPlate, valueText]);
      this.containers[def.key] = { c, g, pill, varPlate, valueText, color: def.color, x: CONTAINER_X, y: def.y };
    });
  }

  relabelContainers(varNames) {
    Object.keys(this.containers).forEach((key) => {
      const c = this.containers[key];
      c.varPlate.setText(varNames[key] || "—");
      c.valueText.setText("");
    });
  }

  resetContainers() {
    Object.values(this.containers).forEach((c) => c.valueText.setText(""));
  }

  async flashContainerError(targetKey, sourceType, sourceColorHex) {
    const container = this.containers[targetKey];
    this.tweens.add({ targets: container.g, alpha: 0.5, duration: 100, yoyo: true, repeat: 3 });
    const ghost = this.add.text(container.x, container.y - 50, sourceType === "double" ? "3.5" : sourceType, {
      font: "bold 15px Courier New", color: sourceColorHex,
    }).setOrigin(0.5).setDepth(30).setAlpha(0);
    this.tweens.add({ targets: ghost, alpha: 0.85, y: container.y - 20, duration: 300 });
    if (!this._noteLeak) {
      this._noteLeak = true;
      this.createAnnotation(container.x - 90, container.y - 20, "doesn't fit — precision would be lost!", HEX_RED);
    }
    await this.delay(1000);
    if (!this._alive) return;
    this.tweens.add({ targets: ghost, alpha: 0, duration: 250, onComplete: () => ghost.destroy() });
  }

  // ══════════════════════════════════════════════════════════════
  // SOURCE / EXPRESSION DISPLAYS
  // ══════════════════════════════════════════════════════════════

  createSourceDisplay() {
    this.sourceText = this.add.text(MACHINE_X, SRC_Y, "", { font: "16px Courier New", color: "#e0e0e0" }).setOrigin(0.5).setDepth(15);
  }

  updateSourceDisplay(line) {
    const tokens = this._syntaxTokenize(line);
    this.sourceText.setText("");
    const parts = tokens.map((t) => `${t.t}`).join("");
    this.sourceText.setText(parts);
    // colorize via a rich-text style approximation: render as multiple text objects
    if (this._sourceParts) this._sourceParts.forEach((p) => p.destroy());
    this.sourceText.setText("");
    this._sourceParts = [];
    let totalW = 0;
    const measured = tokens.map((t) => {
      const tmp = this.add.text(0, 0, t.t, { font: "16px Courier New" });
      const w = tmp.width; tmp.destroy(); return w;
    });
    totalW = measured.reduce((a, b) => a + b, 0);
    let x = MACHINE_X - totalW / 2;
    tokens.forEach((t, i) => {
      const obj = this.add.text(x, SRC_Y, t.t, { font: "16px Courier New", color: t.c }).setOrigin(0, 0.5).setDepth(15);
      this._sourceParts.push(obj);
      x += measured[i];
    });
  }

  _syntaxTokenize(line) {
    const tokens = [];
    const re = /(\bint\b|\bdouble\b|\bString\b)|(\bsc\b)|(\bnextInt\b|\bnextDouble\b|\bnextLine\b|\bnew\b|\bScanner\b|\bSystem\.in\b)|([(){};.=])/g;
    let last = 0, m;
    const plain = (t) => t && tokens.push({ t, c: "#00e5ff" });
    while ((m = re.exec(line))) {
      if (m.index > last) plain(line.slice(last, m.index));
      if (m[1]) tokens.push({ t: m[1], c: "#4fc3f7" });
      else if (m[2]) tokens.push({ t: m[2], c: HEX_GREEN });
      else if (m[3]) tokens.push({ t: m[3], c: HEX_GOLD });
      else if (m[4]) tokens.push({ t: m[4], c: "#ff4081" });
      last = m.index + m[0].length;
    }
    if (last < line.length) plain(line.slice(last));
    return tokens.length ? tokens : [{ t: line, c: "#e0e0e0" }];
  }

  createExpressionMonitor() {
    const g = this.add.graphics().setDepth(50);
    g.fillStyle(0x1a1a2e, 1);
    g.fillRoundedRect(W / 2 - 240, 10, 480, 44, 8);
    g.lineStyle(1, 0x2a2a4a, 1);
    g.strokeRoundedRect(W / 2 - 240, 10, 480, 44, 8);
    this.monitorContainer = this.add.container(0, 0).setDepth(51);
    this.monitorSlotDefs = {};
  }

  updateExpressionMonitor(text) {
    this.monitorContainer.removeAll(true);
    const t = this.add.text(W / 2, 32, text, { font: "14px Courier New", color: "#e0e0e0" }).setOrigin(0.5);
    if (t.width > 460) t.setFontSize(12);
    this.monitorContainer.add(t);
  }

  /** Renders monitorTemplate with dashed drop-slots in place of <slot:id> tokens. */
  renderMonitorTemplate(template) {
    this.monitorContainer.removeAll(true);
    this.monitorSlotDefs = {};
    const parts = template.split(/<slot:(\w+)>/);
    let x = W / 2;
    const measured = [];
    parts.forEach((part, i) => {
      if (i % 2 === 0) {
        const tmp = this.add.text(0, 0, part, { font: "14px Courier New" });
        measured.push({ text: part, w: tmp.width, isSlot: false });
        tmp.destroy();
      } else {
        measured.push({ text: part, w: 110, isSlot: true, id: part });
      }
    });
    const totalW = measured.reduce((a, b) => a + b.w, 0);
    x = W / 2 - totalW / 2;
    measured.forEach((m) => {
      if (!m.isSlot) {
        const t = this.add.text(x, 32, m.text, { font: "14px Courier New", color: "#e0e0e0" }).setOrigin(0, 0.5);
        this.monitorContainer.add(t);
        x += m.w;
      } else {
        const rect = { x, y: 32 - 12, w: m.w, h: 24 };
        this.monitorSlotDefs[m.id] = { rect, filled: false };
        this._drawMonitorSlot(m.id);
        x += m.w;
      }
    });
  }

  _drawMonitorSlot(slotId) {
    const def = this.monitorSlotDefs[slotId];
    if (!def) return;
    if (def.dg) def.dg.destroy();
    if (def.hintLabel) { def.hintLabel.destroy(); def.hintLabel = null; }
    const { x, y, w, h } = def.rect;
    const dg = this.add.graphics().setDepth(1);
    const filled = (this.slotContents[slotId] || []).length > 0;
    const draw = (highlight) => {
      dg.clear();
      dg.fillStyle(0x161b22, 1);
      dg.fillRoundedRect(x, y, w, h, 6);
      dg.lineStyle(2, highlight ? C_GOLD : (filled ? 0x2a3a4a : C_GRAY), 1);
      if (filled) dg.strokeRoundedRect(x, y, w, h, 6);
      else this._dashedRectOutline(dg, x, y, w, h, 5, 4);
    };
    draw(false);
    def.dg = dg;
    def.drawDash = draw;
    this.monitorContainer.add(dg);
    if (!filled) {
      const label = this.add.text(x + w / 2, y + h / 2, slotId, { font: "italic 10px Courier New", color: "#3d4450" }).setOrigin(0.5).setDepth(2);
      def.hintLabel = label;
      this.monitorContainer.add(label);
    }
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

    this.add.text(16, 12, "THE INTAKE DOCK", { font: "bold 15px Arial", color: "#b0bec5" }).setDepth(50);
    this.add.text(16, 32, "Accretion Phase — Scanner Methods: nextInt() / nextDouble() / nextLine()", { font: "11px Arial", color: "#546e7a" }).setDepth(50);

    this.roundDots = [];
    for (let i = 0; i < 12; i++) {
      const x = 660 + (i - 5.5) * 0;
    }
    this.roundText = this.add.text(W / 2, 55, "ROUND 1/12", { font: "bold 10px Arial", color: "#546e7a" }).setOrigin(0.5).setDepth(50);

    this.add.text(1060, 8, "SCORE", { font: "9px Arial", color: "#546e7a" }).setDepth(50);
    this.scoreText = this.add.text(1060, 20, "0", { font: "bold 18px Arial", color: "#ffffff" }).setDepth(50);
    this.comboText = this.add.text(1060, 42, "×1", { font: "bold 12px Arial", color: HEX_GOLD }).setDepth(50);

    this.lifeIcons = [];
    for (let i = 0; i < 3; i++) {
      const lg = this.add.graphics({ x: 1150 + i * 26, y: 26 }).setDepth(50);
      lg.lineStyle(2, C_GREEN, 1);
      lg.strokeRoundedRect(-7, -5, 14, 11, 2);
      lg.lineStyle(1, C_GREEN, 0.6);
      lg.lineBetween(-4, -1, 4, -1);
      lg.lineBetween(-4, 2, 4, 2);
      this.lifeIcons.push(lg);
    }
  }

  updateRoundHUD() {
    this.roundText.setText(`ROUND ${this.currentRound + 1}/12`);
  }

  // ══════════════════════════════════════════════════════════════
  // BIT — dock keeper variant
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
    const cap = this.add.graphics();
    cap.fillStyle(C_GREEN, 0.9);
    cap.fillEllipse(0, -30, 26, 8);
    cap.fillRect(8, -33, 12, 4);
    cap.setAngle(5);
    c.add([g, eye, pupil, cap, tip]);
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
    const t = this.add.text(x, y, text, { font: "bold 10px Arial", color: colorHex }).setOrigin(0.5).setDepth(70).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 250 });
    this.time.delayedCall(2200, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 300, onComplete: () => t.destroy() }); });
    return t;
  }

  // ══════════════════════════════════════════════════════════════
  // TUTORIAL
  // ══════════════════════════════════════════════════════════════

  checkTutorial() {
    let done = false;
    try { done = localStorage.getItem(TUTORIAL_KEY) === "true"; } catch (_) {}
    if (done) {
      this.powerOnMachine();
      this.time.delayedCall(300, () => this.startRound(0));
    } else {
      this.runTutorial();
    }
  }

  async runTutorial() {
    const A = () => this._alive;
    await this.delay(400); if (!A()) return;
    await this.bitSay("New wing, Builder — the Intake Dock! Until today, every String was born inside our code. Out THERE is the user, typing at a keyboard. Their words arrive here... but first, we need the machine that reads them.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();

    this.updateSourceDisplay("Scanner sc = new Scanner(System.in);");
    this.powerOnMachine();
    await this.delay(500); if (!A()) return;
    await this.bitSay("new Scanner(System.in) — we BUILT a machine called sc, plugged into the outside world. No Scanner, no reading. Every input program starts with this line!");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();

    this.relabelContainers({});
    this.loadTape("42");
    await this.delay(600); if (!A()) return;
    await this.bitSay("The user typed 42 and pressed Enter. See the tape? EVERYTHING they type queues up here — even that purple ⏎ at the end. That's the Enter key itself, riding along. Now, let's read it.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();

    this.updateSourceDisplay("int age = sc.nextInt();");
    this.containers.int.varPlate.setText("age");
    await this.runIntake("nextInt", "int");
    if (!A()) return;
    await this.bitSay("nextInt() consumed the number token and returned an int — landed safely in an int variable. But look at the tape...");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(3500)]); if (!A()) return;
    this.hideBubble();
    this.createAnnotation(TAPE_X1 - 15, TAPE_Y - 40, "still here!", HEX_NEWLINE);
    await this.delay(300); if (!A()) return;
    await this.bitSay("...nextInt() takes the NUMBER only. That ⏎ is still waiting on the tape. Remember this moment, Builder — one day it will matter more than you can imagine.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();

    this.clearTape();
    this.resetContainers();
    this.loadTape("hi bit");
    this.updateSourceDisplay("String msg = sc.nextLine();");
    this.containers.string.varPlate.setText("msg");
    await this.delay(500); if (!A()) return;
    await this.runIntake("nextLine", "string");
    if (!A()) return;
    await this.bitSay("nextLine() is the greedy one — it swallows the ENTIRE line, spaces and all, right up to the ⏎. The ⏎ is consumed but never kept. What you get back is a String — and you already know everything Strings can do!");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();

    this.clearTape();
    this.resetContainers();
    this.loadTape("3.5");
    this.updateSourceDisplay("int n = sc.nextInt();");
    this.containers.int.varPlate.setText("n");
    await this.delay(500); if (!A()) return;
    await this.runIntake("nextInt", "int");
    if (!A()) return;
    await this.bitSay("3.5 is NOT an int — the nozzle rejected it, the program CRASHED, and look: the tape still holds the token. Mismatches are violent, Builder. Match the method to the data, always. Your shift starts now!");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();

    try { localStorage.setItem(TUTORIAL_KEY, "true"); } catch (_) {}
    this.clearTape();
    this.resetContainers();
    this.updateSourceDisplay("");
    this.startRound(0);
  }

  // ══════════════════════════════════════════════════════════════
  // ROUND LIFECYCLE
  // ══════════════════════════════════════════════════════════════

  startRound(index) {
    this.currentRound = index;
    const config = ROUNDS[index];
    this.roundAttempts = 0;
    this.roundStartTime = this.time.now;
    this.clearRound();
    this.resetContainers();
    this.updateRoundHUD();

    if (config.type === "predict") this.setupPredict(config);
    else if (config.type === "judge") this.setupJudge(config);
    else if (config.type === "command") this.setupCommand(config);
  }

  clearRound() {
    this.roundElements.forEach((e) => { if (e && e.destroy) e.destroy(); });
    this.roundElements = [];
    this.slotContents = {};
    this.monitorSlotDefs = {};
    this.cartridges.forEach((c) => c.container.destroy());
    this.cartridges = [];
  }

  showQuestionCard(promptText) {
    const c = this.add.container(W / 2, 460).setDepth(40).setAlpha(0);
    const g = this.add.graphics();
    g.fillStyle(0x0e160e, 0.95);
    g.fillRoundedRect(-260, -40, 520, 80, 10);
    g.lineStyle(1, C_GREEN, 0.5);
    g.strokeRoundedRect(-260, -40, 520, 80, 10);
    const badge = this.add.circle(-230, -10, 16, C_GREEN);
    const badgeT = this.add.text(-230, -10, String(this.currentRound + 1), { font: "bold 14px Arial", color: "#0a120a" }).setOrigin(0.5);
    const t = this.add.text(-200, -10, promptText, { font: "14px Arial", color: "#e0e0e0", wordWrap: { width: 420 } }).setOrigin(0, 0.5);
    c.add([g, badge, badgeT, t]);
    this.tweens.add({ targets: c, alpha: 1, y: 460, duration: 250 });
    this.roundElements.push(c);
    return c;
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE A/B — PREDICT
  // ══════════════════════════════════════════════════════════════

  setupPredict(config) {
    this.loadTape(config.inputLine);
    this.updateSourceDisplay(config.call + ";");
    this.updateExpressionMonitor(config.call);
    this.showQuestionCard(`What will ${config.call} return?`);
    this.showOptionBubbles(config.options, config);
  }

  showOptionBubbles(options, config) {
    const shuffled = Phaser.Utils.Array.Shuffle(options.slice());
    const n = shuffled.length;
    const spacing = 280;
    const startX = W / 2 - ((n - 1) * spacing) / 2;
    shuffled.forEach((opt, i) => {
      const x = startX + i * spacing;
      const y = 580;
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
      const isString = opt.value.startsWith('"');
      const color = opt.value === "Error" ? HEX_RED : isString ? HEX_LINE : /^-?\d+\.\d/.test(opt.value) ? HEX_DOUBLE : /^-?\d+$/.test(opt.value) ? HEX_INT : "#e0e0e0";
      const txt = this.add.text(0, 0, opt.value, { font: "bold 16px Courier New", color }).setOrigin(0.5);
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
    this.roundAttempts++;
    const correct = opt.value === config.correct;
    const timeMs = Math.round(this.time.now - this.roundStartTime);
    this.logAttempt(config, correct, opt.value, opt.tag, timeMs);

    this.roundElements.filter((e) => e !== bubbleContainer).forEach((e) => e.disableInteractive && e.disableInteractive());

    const g = bubbleContainer.list[0];
    g.clear();
    g.fillStyle(0x0e1810, 1);
    g.fillRoundedRect(-125, -25, 250, 50, 10);
    g.lineStyle(2, correct ? C_GREEN_BRIGHT : C_RED, 1);
    g.strokeRoundedRect(-125, -25, 250, 50, 10);
    if (!correct) this.tweens.add({ targets: bubbleContainer, x: bubbleContainer.x + 5, duration: 40, yoyo: true, repeat: 4 });

    const targetKey = config.call.includes("nextInt") ? "int" : config.call.includes("nextDouble") ? "double" : "string";
    this.relabelContainers({ [targetKey]: "result" });

    await this.delay(200);
    if (!this._alive) return;
    const result = await this.runIntake(
      config.call.includes("nextInt") ? "nextInt" : config.call.includes("nextDouble") ? "nextDouble" : "nextLine",
      targetKey
    );

    if (config.revealNote) this.createFloatingText(MACHINE_X, MACHINE_Y + 90, config.revealNote, HEX_GRAY, "11px Arial", 2400);

    await this.delay(600);
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
      const dead = this.lives <= 0;
      if (dead) { this.time.delayedCall(400, () => this.gameOver()); return; }
      await this.showBitFeedback(MISCONCEPTION_FEEDBACK[opt.tag] || "Not quite — watch the tape and try again.");
      if (!this._alive) return;
      this.clearRound();
      this.resetContainers();
      this.setupPredict(config);
    }
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE C — JUDGE
  // ══════════════════════════════════════════════════════════════

  _declTypeOf(snippet) {
    const m = snippet.match(/^(int|double|String)\s/);
    return m ? m[1] : null;
  }

  _methodOf(snippet) {
    const m = snippet.match(/sc\.(nextInt|nextDouble|nextLine)\(\)/);
    return m ? m[1] : null;
  }

  compileCheck(declType, method) {
    const returnType = method === "nextInt" ? "int" : method === "nextDouble" ? "double" : "String";
    if (declType === "int") {
      if (returnType === "double") return { ok: false, tag: "narrowing_assignment_error" };
      if (returnType === "String") return { ok: false, tag: "line_into_int_belief" };
      return { ok: true };
    }
    if (declType === "double") {
      if (returnType === "String") return { ok: false, tag: "line_into_double_belief" };
      return { ok: true }; // int widens into double
    }
    // String target: no compile-time block here (documented simplification) —
    // a numeric method paired with a String declaration is left to run
    // honestly against the tape, so a word-vs-number mismatch still produces
    // the real InputMismatchException rather than a scripted outcome.
    return { ok: true };
  }

  setupJudge(config) {
    this.loadTape(config.inputLine);
    this.updateSourceDisplay(config.snippet);
    this.updateExpressionMonitor(config.snippet);
    this.showQuestionCard("Does this statement compile and run correctly?");
    this.showJudgmentButtons(config);
  }

  showJudgmentButtons(config) {
    const validBtn = this._makeJudgeButton(W / 2 - 140, 580, "✓ VALID", C_GREEN_BRIGHT, () => this.onJudgmentSelected("valid", config, validBtn));
    const invalidBtn = this._makeJudgeButton(W / 2 + 140, 580, "✗ INVALID", C_RED, () => this.onJudgmentSelected("invalid", config, invalidBtn));
    this.roundElements.push(validBtn, invalidBtn);
    this.inputLocked = false;
  }

  _makeJudgeButton(x, y, label, colorHex, onClick) {
    const c = this.add.container(x, y).setDepth(41);
    const g = this.add.graphics();
    const w = 220, h = 54;
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
    c._draw = draw;
    return c;
  }

  async onJudgmentSelected(choice, config, btnContainer) {
    this.roundAttempts++;
    const correct = choice === config.correct;
    const timeMs = Math.round(this.time.now - this.roundStartTime);
    this.logAttempt(config, correct, choice, correct ? null : config.wrongTag, timeMs);
    this.roundElements.forEach((e) => e.disableInteractive && e.disableInteractive());

    const declType = this._declTypeOf(config.snippet);
    const method = this._methodOf(config.snippet);
    const varName = config.snippet.match(/\s(\w+)\s*=/)[1];
    const targetKey = declType === "int" ? "int" : declType === "double" ? "double" : "string";
    this.relabelContainers({ [targetKey]: varName });

    await this.delay(200);
    if (!this._alive) return;

    if (config.correct === "valid") {
      const nativeMethod = method === "nextInt" ? "nextInt" : method === "nextDouble" ? "nextDouble" : "nextLine";
      await this.runIntake(nativeMethod, targetKey);
    } else {
      this.showCompileErrorStamp();
      const sourceType = method === "nextDouble" ? "double" : method === "nextLine" ? "String" : "int";
      const sourceColor = method === "nextDouble" ? HEX_DOUBLE : method === "nextLine" ? HEX_LINE : HEX_INT;
      await this.flashContainerError(targetKey, sourceType, sourceColor);
    }

    if (config.revealNote) this.createFloatingText(MACHINE_X, MACHINE_Y + 90, config.revealNote, HEX_GRAY, "11px Arial", 2400);
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
      const msg = config.explanation || MISCONCEPTION_FEEDBACK[config.wrongTag] || "Not quite — check the types again.";
      await this.showBitFeedback(msg);
      if (!this._alive) return;
      this.clearRound();
      this.resetContainers();
      this.setupJudge(config);
    }
  }

  showCompileErrorStamp() {
    const stamp = this.add.text(MACHINE_X, MACHINE_Y - 40, "COMPILE ERROR", { font: "bold 20px Arial", color: HEX_RED }).setOrigin(0.5).setDepth(30).setAngle(-6).setScale(1.6).setAlpha(0);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 200 });
    this.time.delayedCall(1600, () => { if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 250, onComplete: () => stamp.destroy() }); });
    this.screenShake(0.003, 150);
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE D — COMMAND (drag cartridges)
  // ══════════════════════════════════════════════════════════════

  setupCommand(config) {
    this.loadTape(config.inputLine);
    this.updateSourceDisplay("");
    this.renderMonitorTemplate(config.monitorTemplate);
    this.showQuestionCard(config.mission);
    this.createNozzleRack(config);
    this._commandFirstFail = true;
  }

  createNozzleRack(config) {
    const shuffled = Phaser.Utils.Array.Shuffle(config.cartridges.slice());
    const rowY = 580;
    let x = W / 2 - (shuffled.length * 160) / 2 + 80;
    shuffled.forEach((def) => {
      const style = { font: "bold 13px Courier New", color: def.slotId === "decl" ? "#4fc3f7" : HEX_GOLD };
      const measure = this.add.text(0, 0, def.code, style);
      const w = measure.width + 24;
      measure.destroy();
      const home = { x, y: rowY };
      x += w + 14;

      const c = this.add.container(home.x, home.y).setDepth(42);
      const bg = this.add.graphics();
      const draw = (stroke) => {
        bg.clear();
        bg.fillStyle(0x1e1e3a, 1);
        bg.fillRoundedRect(-w / 2, -18, w, 36, 8);
        bg.lineStyle(2, stroke, 1);
        bg.strokeRoundedRect(-w / 2, -18, w, 36, 8);
      };
      draw(C_GREEN);
      const txt = this.add.text(0, 0, def.code, style).setOrigin(0.5);
      c.add([bg, txt]);
      c.setSize(w, 36);
      c.setData("w", w);
      c.setData("code", def.code);
      c.setData("tag", def.tag || null);
      c.setData("correct", !!def.correct);
      c.setData("targetSlot", def.slotId);
      c.setData("home", home);
      c.setData("draw", draw);
      c.setData("placedIn", null);
      c.setInteractive({ useHandCursor: true, draggable: true });
      c.on("pointerover", () => { if (!this.inputLocked) draw(C_GOLD); });
      c.on("pointerout", () => { if (!this.inputLocked) draw(C_GREEN); });
      this.cartridges.push({ container: c, def, home });
      this.roundElements.push(c);
    });

    const readBtn = this.add.container(W / 2, 650).setDepth(42);
    const rg = this.add.graphics();
    const rdraw = (enabled, hover) => {
      rg.clear();
      rg.fillStyle(enabled ? C_GREEN_BRIGHT : 0x2a2f36, hover && enabled ? 1 : 0.95);
      rg.fillRoundedRect(-60, -22, 120, 44, 10);
    };
    rdraw(false, false);
    const rt = this.add.text(0, 0, "READ", { font: "bold 16px Arial", color: "#0a120a" }).setOrigin(0.5);
    readBtn.add([rg, rt]);
    readBtn.setSize(120, 44);
    readBtn.on("pointerover", () => { if (this._readReady) { rdraw(true, true); readBtn.setScale(1.03); } });
    readBtn.on("pointerout", () => { rdraw(this._readReady, false); readBtn.setScale(1); });
    readBtn.on("pointerdown", () => { if (this._readReady) this.onReadPressed(config); });
    this.readButton = { c: readBtn, t: rt, draw: rdraw };
    this.roundElements.push(readBtn);
    this.disableReadButton();
  }

  enableReadButton() {
    this._readReady = true;
    this.readButton.draw(true, false);
    this.readButton.c.setInteractive({ useHandCursor: true });
  }

  disableReadButton() {
    this._readReady = false;
    this.readButton.draw(false, false);
    this.readButton.c.disableInteractive();
  }

  setupDragEvents() {
    this.input.on("dragstart", (pointer, obj) => {
      if (!this.cartridges.find((b) => b.container === obj) || this.inputLocked) return;
      obj.setDepth(90);
      this.tweens.add({ targets: obj, scale: 1.1, duration: 100 });
      const prevSlot = obj.getData("placedIn");
      if (prevSlot) {
        this.slotContents[prevSlot] = (this.slotContents[prevSlot] || []).filter((b) => b.container !== obj);
        obj.setData("placedIn", null);
        this._drawMonitorSlot(prevSlot);
        this.updateReadButtonState();
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

  _nearestOpenSlot(obj, x, y) {
    let best = null, bestDist = 60;
    const targetSlot = obj.getData("targetSlot");
    for (const id in this.monitorSlotDefs) {
      if (targetSlot && id !== targetSlot) continue;
      const def = this.monitorSlotDefs[id];
      const placed = this.slotContents[id] || [];
      if (placed.length >= 1) continue;
      const cx = def.rect.x + def.rect.w / 2, cy = def.rect.y + def.rect.h / 2;
      const dist = Phaser.Math.Distance.Between(x, y, cx, cy);
      const within = x >= def.rect.x - 40 && x <= def.rect.x + def.rect.w + 40 && y >= def.rect.y - 30 && y <= def.rect.y + def.rect.h + 30;
      if (within && dist < bestDist) { bestDist = dist; best = id; }
    }
    return best;
  }

  _updateSlotHover(obj) {
    const key = this._nearestOpenSlot(obj, obj.x, obj.y);
    if (key !== this._dragHoverSlotKey) {
      if (this._dragHoverSlotKey && this.monitorSlotDefs[this._dragHoverSlotKey]) this.monitorSlotDefs[this._dragHoverSlotKey].drawDash(false);
      this._dragHoverSlotKey = key;
      if (key) this.monitorSlotDefs[key].drawDash(true);
    }
    if (key) {
      const def = this.monitorSlotDefs[key];
      const cx = def.rect.x + def.rect.w / 2, cy = def.rect.y + def.rect.h / 2;
      obj.x = Phaser.Math.Linear(obj.x, cx, 0.25);
      obj.y = Phaser.Math.Linear(obj.y, cy, 0.25);
    }
  }

  _finishCartridgeDrag(obj) {
    obj.setDepth(42);
    this.tweens.add({ targets: obj, scale: 1, duration: 100 });
    const key = this._nearestOpenSlot(obj, obj.x, obj.y);
    if (this._dragHoverSlotKey && this.monitorSlotDefs[this._dragHoverSlotKey]) this.monitorSlotDefs[this._dragHoverSlotKey].drawDash(false);
    this._dragHoverSlotKey = null;

    if (key) {
      if (!this.slotContents[key]) this.slotContents[key] = [];
      this.slotContents[key].push({ container: obj });
      obj.setData("placedIn", key);
      const def = this.monitorSlotDefs[key];
      this.tweens.add({ targets: obj, x: def.rect.x + def.rect.w / 2, y: def.rect.y + def.rect.h / 2, duration: 150, ease: "Cubic.easeOut" });
      this._drawMonitorSlot(key);
      this.updateReadButtonState();
    } else {
      const home = obj.getData("home");
      this.tweens.add({ targets: obj, x: home.x, y: home.y, duration: 250, ease: "Back.easeOut" });
    }
  }

  updateReadButtonState() {
    const allFilled = Object.keys(this.monitorSlotDefs).every((id) => (this.slotContents[id] || []).length > 0);
    if (allFilled) this.enableReadButton(); else this.disableReadButton();
  }

  async onReadPressed(config) {
    this.inputLocked = true;
    this.disableReadButton();
    this.roundAttempts++;
    const timeMs = Math.round(this.time.now - this.roundStartTime);

    const declSlot = this.slotContents["decl"] ? this.slotContents["decl"][0].container : null;
    const methodSlot = this.slotContents["method"][0].container;
    const declType = declSlot ? declSlot.getData("code").split(" ")[0] : config.declType;
    const varName = declSlot ? declSlot.getData("code").split(" ")[1] : (config.monitorTemplate.match(/(?:int|double)\s+(\w+)/) || [])[1];
    const methodCode = methodSlot.getData("code");
    const method = methodCode.includes("nextInt") ? "nextInt" : methodCode.includes("nextDouble") ? "nextDouble" : "nextLine";

    const allCorrect = (declSlot ? declSlot.getData("correct") : true) && methodSlot.getData("correct");
    const targetKey = declType === "int" ? "int" : declType === "double" ? "double" : "string";
    this.relabelContainers({ [targetKey]: varName || "value" });

    this.updateSourceDisplay(`${declType} ${varName || "value"} = sc.${method}();`);
    await this.delay(200);
    if (!this._alive) return;

    const check = this.compileCheck(declType, method);
    let runResult = null;
    if (!check.ok) {
      this.showCompileErrorStamp();
      const sourceType = method === "nextDouble" ? "double" : method === "nextLine" ? "String" : "int";
      const sourceColor = method === "nextDouble" ? HEX_DOUBLE : method === "nextLine" ? HEX_LINE : HEX_INT;
      await this.flashContainerError(targetKey, sourceType, sourceColor);
    } else {
      runResult = await this.runIntake(method, targetKey);
    }

    if (config.revealNote) this.createFloatingText(MACHINE_X, MACHINE_Y + 90, config.revealNote, HEX_GRAY, "11px Arial", 2600);
    await this.delay(500);
    if (!this._alive) return;

    const success = allCorrect && check.ok && runResult && !runResult.error;
    const tag = (methodSlot.getData("tag")) || (declSlot && declSlot.getData("tag")) || null;
    this.logAttempt(config, success, methodCode, tag, timeMs);

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
      await this.showBitFeedback(MISCONCEPTION_FEEDBACK[tag] || "That combination doesn't do what the mission needs — try another nozzle or declaration.");
      if (!this._alive) return;
      this.inputLocked = false;
      this.resetContainers();
      this.clearTape();
      this.loadTape(config.inputLine);
      this.updateSourceDisplay("");
      // return cartridges to their homes, keep monitor slots empty for another attempt
      this.cartridges.forEach((cart) => {
        cart.container.setData("placedIn", null);
        const home = cart.container.getData("home");
        this.tweens.add({ targets: cart.container, x: home.x, y: home.y, duration: 200 });
      });
      this.slotContents = {};
      Object.keys(this.monitorSlotDefs).forEach((id) => this._drawMonitorSlot(id));
      this.disableReadButton();
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
    this.totalTimeMs += timeMs;
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
  // FLOATING TEXT / SHAKE / CONFETTI
  // ══════════════════════════════════════════════════════════════

  createFloatingText(x, y, text, colorHex, font = "bold 13px Arial", hold = 1600) {
    const t = this.add.text(x, y, text, { font, color: colorHex, wordWrap: { width: 360 }, align: "center" }).setOrigin(0.5).setDepth(31).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 200 });
    this.time.delayedCall(hold, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 300, onComplete: () => t.destroy() }); });
    return t;
  }

  screenShake(intensity = 0.004, duration = 200) {
    this.cameras.main.shake(duration, intensity);
  }

  createConfetti(x, y, count = 30) {
    const p = this.add.particles(x, y, "l34_dot", {
      speed: { min: 80, max: 240 }, angle: { min: 0, max: 360 }, scale: { start: 0.9, end: 0 }, lifespan: 500,
      tint: [C_GREEN, C_GOLD, C_CYAN, C_GREEN_BRIGHT, 0xffffff], emitting: false,
    }).setDepth(75);
    p.explode(count);
    this.time.delayedCall(900, () => p.destroy());
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
      this._drawIrisWedges(this.port.wedges, 0);
      this.clearTape();
      for (let i = 0; i < 3; i++) {
        this.machine.strobe.setVisible(true);
        this.tweens.add({ targets: this.machine.strobe, angle: 180, fillAlpha: 0.5, duration: 400, yoyo: true });
        await this.delay(450);
        if (!this._alive) return;
      }
      this.machine.strobe.setVisible(false);
      this.powerOffMachine();

      const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
      this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });

      const title = this.add.text(640, 240, "DOCK CLOSED", { font: "bold 40px Arial", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
      this.tweens.add({ targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut", onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }) });
      this.add.text(640, 310, `Score: ${this.score}`, { font: "20px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
      this.add.text(640, 350, `Rounds Completed: ${this.currentRound} / 12`, { font: "16px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);

      this._makeButton(640, 420, "REOPEN THE DOCK", 210, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
    })();
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearRound();
    this.hideBubble();

    try { GameManager.completeLevel(33, Math.round((this.correctFirstTry / 12) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("scanner_schema"); } catch (_) {}
    try {
      localStorage.setItem("level34_results", JSON.stringify({
        level: 34, concept: "scanner_input_methods", phase: "accretion",
        score: this.score, accuracy: this.correctFirstTry / 12, avgTime: this.totalTimeMs / 12,
        comboMax: this.maxCombo, stars: this._starRating(), livesRemaining: this.lives,
        attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.celebrationTape().then(() => { if (this._alive) this.showScoreTally(); });
  }

  async celebrationTape() {
    this.resetContainers();
    this.relabelContainers({ string: "done" });
    this.loadTape("WELL DONE BUILDER");
    await this.delay(400);
    if (!this._alive) return;
    [this.machine.nozzles.int, this.machine.nozzles.double, this.machine.nozzles.line].forEach((nz, i) => {
      this.time.delayedCall(i * 150, () => this.nozzleGlow(i === 0 ? "nextInt" : i === 1 ? "nextDouble" : "nextLine", true));
    });
    await this.runIntake("nextLine", "string");
    if (!this._alive) return;
    this.createConfetti(CONTAINER_X, CONTAINER_Y.string);
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
    panel.fillStyle(0x0e160e, 1);
    panel.fillRoundedRect(360, 100, 560, 420, 16);
    panel.lineStyle(2, C_GREEN, 1);
    panel.strokeRoundedRect(360, 100, 560, 420, 16);

    const title = this.add.text(640, 140, "INTAKE CLEARED", { font: "bold 34px Arial", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(91).setScale(0);
    this.tweens.add({ targets: title, scale: 1, duration: 350, ease: "Back.easeOut" });

    const acc = Math.round((this.correctFirstTry / 12) * 100);
    const avgTime = (this.totalTimeMs / 12 / 1000).toFixed(1);
    const lines = [`ACCURACY: ${acc}%`, `BEST COMBO: ×${this.getComboMultiplierFor(this.maxCombo)}`, `AVG TIME: ${avgTime}s`];
    lines.forEach((s, i) => {
      const t = this.add.text(500, 195 + i * 28, s, { font: "14px Arial", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 250, delay: 300 + i * 150 });
    });
    const totalText = this.add.text(500, 195 + 3 * 28, "TOTAL: 0", { font: "bold 24px Arial", color: HEX_GOLD }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: totalText, alpha: 1, duration: 250, delay: 900 });
    const counter = { v: 0 };
    this.tweens.add({ targets: counter, v: this.score, duration: 1000, delay: 900, onUpdate: () => totalText.setText(`TOTAL: ${Math.round(counter.v)}`) });

    const stars = this._starRating();
    for (let i = 0; i < 3; i++) {
      const earned = i < stars;
      const s = this.add.text(640 + (i - 1) * 60, 330, "★", { font: "40px Arial", color: earned ? HEX_GOLD : "#2a3040" }).setOrigin(0.5).setDepth(91).setScale(0);
      this.tweens.add({ targets: s, scale: 1, duration: 250, delay: 1500 + i * 200, ease: earned ? "Back.easeOut" : "Cubic.easeOut" });
    }

    const badge = this.add.container(640, 410).setDepth(91).setAlpha(0);
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillCircle(0, 0, 30);
    bg.lineStyle(3, C_GOLD, 1);
    bg.strokeCircle(0, 0, 30);
    bg.fillStyle(0x142018, 1);
    bg.fillRoundedRect(-14, -10, 28, 20, 3);
    bg.lineStyle(1.5, C_INT, 1);
    bg.strokeCircle(6, 0, 5);
    badge.add(bg);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 2000 });
    const badgeLbl = this.add.text(640, 448, "SCANNER SCHEMA ACQUIRED", { font: "bold 13px Arial", color: HEX_GOLD }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: badgeLbl, alpha: 1, duration: 300, delay: 2150 });

    this._makeButton(500, 490, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(760, 490, "NEXT: The Night Shift →", 260, 44, { fill: 0x00733a, stroke: C_GREEN_BRIGHT, textColor: "#ffffff" }, () => {
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
