/**
 * Level 27 — "The Control Room" (String Methods: Restructuring Phase)
 * ======================================================================
 * The learner restructures the length() schema by CONSTRUCTING complete
 * code solutions — no multiple choice. Blocks are dragged into slots in a
 * code skeleton; RUN genuinely evaluates the assembled program against
 * live test strings inside a masked "observation window" test machine.
 *
 * Six missions integrate length() with conditionals, arithmetic, comparison
 * operators, and for-loops. A small classification + evaluation engine
 * (_classifyBlock / _evaluateSequence) actually computes results from
 * whatever blocks the player placed — wrong builds produce their real
 * wrong outcomes (reversed arithmetic, off-by-one loop crashes, genuine
 * "compile errors" for invalid syntax) rather than being looked up from a
 * correct/incorrect table.
 */

import Phaser from "phaser";
import { GameManager } from "../../../GameManager.js";
import { BadgeSystem } from "../../../BadgeSystem.js";

const W = 1280, H = 720;

const C_CYAN = 0x00e5ff, C_AMBER = 0xffd740, C_GREEN = 0x00e676;
const C_RED = 0xf44336, C_GRAY = 0x78909c, C_MAGENTA = 0xff4081;
const HEX_CYAN = "#00e5ff", HEX_AMBER = "#ffd740", HEX_GREEN = "#00e676";
const HEX_RED = "#f44336", HEX_GRAY = "#78909c", HEX_MAGENTA = "#ff4081";

// Layout geometry
const CX = 40, CY = 90, CW = 680, CH = 380;
const TAB_H = 34, GUTTER_W = 34, CODE_PAD = 10;
const CODE_X = CX + GUTTER_W + CODE_PAD;
const CODE_Y0 = CY + TAB_H + 14;
const LINE_H = 34;
const PX = 40, PY = 490, PW = 680, PH = 130;
const OX = 760, OY = 80, OW = 460, OH = 250;
const RX = 760, RY = 345, RW = 460, RH = 125;
const BX = 760, BY = 490, BW = 460, BH = 130;
const MACHINE_CX = OX + OW / 2, MACHINE_CY = OY + OH / 2 + 8;

const TUTORIAL_KEY = "level27_tutorial_done";

// ─────────────────────────────────────────────────────────────────
// Mission configuration
// ─────────────────────────────────────────────────────────────────
const MISSIONS = [
  { mission: 1, title: "The Password Gate",
    brief: "Security wants the vault door to unlock only when the password has at least 8 characters. Build the check.",
    varName: "pass", resultType: "boolean",
    skeleton: ["if (§cond) {", "    unlock();", "} else {", "    reject();", "}"],
    slots: [{ id: "cond", hint: "condition", capacity: 3 }],
    palette: [
      { code: "pass.length()", slot: "cond" },
      { code: ">=", slot: "cond" },
      { code: "8", slot: "cond" },
      { code: "pass.length", slot: "cond", tag: "property_vs_method_syntax" },
      { code: ">", slot: "cond", tag: "boundary_operator_confusion" },
      { code: "length(pass)", slot: "cond", tag: "python_len_function" },
    ],
    tests: [
      { input: "abc12", expected: "FAIL" },
      { input: "secret99", expected: "PASS" },
      { input: "supersecure1", expected: "PASS" },
    ], concept: "condition_with_length" },

  { mission: 2, title: "The Empty Field Alarm",
    brief: "The signup form must show an error when the name box is left completely empty. Note: a space is NOT empty!",
    varName: "name", resultType: "boolean",
    skeleton: ["if (name.length() §op §val) {", '    showError("Name required");', "}"],
    slots: [{ id: "op", hint: "operator", capacity: 1 }, { id: "val", hint: "value", capacity: 1 }],
    palette: [
      { code: "==", slot: "op" },
      { code: "0", slot: "val" },
      { code: "=", slot: "op", tag: "assignment_vs_comparison" },
      { code: "1", slot: "val", tag: "empty_string_confusion" },
      { code: '""', slot: "val", tag: "empty_vs_blank_check" },
    ],
    tests: [
      { input: "", expected: "PASS" },
      { input: " ", expected: "FAIL" },
      { input: "Amara", expected: "FAIL" },
    ],
    reportNote: 'PASS = "alarm fires". The " " row proves a space is a real character!',
    concept: "empty_check" },

  { mission: 3, title: "The Character Counter",
    brief: "The message app shows how many characters remain out of 140. Compute the remaining count.",
    varName: "msg", resultType: "number",
    skeleton: ["int remaining = §expr;", "display(remaining);"],
    slots: [{ id: "expr", hint: "expression", capacity: 3 }],
    palette: [
      { code: "140", slot: "expr" },
      { code: "-", slot: "expr" },
      { code: "msg.length()", slot: "expr" },
      { code: "msg.length()", slot: "expr", tag: "operand_order_reversed" },
      { code: "+", slot: "expr", tag: "wrong_operator" },
      { code: "139", slot: "expr", tag: "off_by_one_last_position" },
    ],
    tests: [
      { input: "hello", expectedValue: 135 },
      { input: "", expectedValue: 140 },
      { input: "12 chars msg", expectedValue: 128 },
    ], concept: "arithmetic_with_length" },

  { mission: 4, title: "The Last Position Finder",
    brief: "The scanner needs the POSITION of the final character (positions start at 0 — remember the array vault!). Compute it for any String.",
    varName: "s", resultType: "number",
    skeleton: ["int last = §expr;", "display(last);"],
    slots: [{ id: "expr", hint: "expression", capacity: 3 }],
    palette: [
      { code: "s.length()", slot: "expr" },
      { code: "-", slot: "expr" },
      { code: "1", slot: "expr" },
      { code: "s.length()", slot: "expr", tag: "length_is_last_index" },
      { code: "+", slot: "expr", tag: "wrong_operator" },
      { code: "0", slot: "expr", tag: "zero_based_overcorrection" },
    ],
    tests: [
      { input: "scan", expectedValue: 3 },
      { input: "x", expectedValue: 0 },
      { input: "hi bit", expectedValue: 5 },
    ], concept: "last_position" },

  { mission: 5, title: "The Character Walker",
    brief: "Program the walker-bot to visit EVERY character of the String, one by one, without stepping past the end.",
    varName: "s", resultType: "walker",
    skeleton: ["for (int i = 0; §cond; i++) {", "    visit(i);", "}"],
    slots: [{ id: "cond", hint: "loop condition", capacity: 1 }],
    palette: [
      { code: "i < s.length()", slot: "cond" },
      { code: "i <= s.length()", slot: "cond", tag: "loop_off_by_one_length" },
      { code: "i < s.length", slot: "cond", tag: "property_vs_method_syntax" },
      { code: "i < s.length() - 1", slot: "cond", tag: "undershoot_last_char" },
    ],
    tests: [
      { input: "walk", expectedVisits: 4 },
      { input: "go", expectedVisits: 2 },
      { input: "a b", expectedVisits: 3 },
    ], concept: "loop_bound_integration" },

  { mission: 6, title: "The Longer Label",
    brief: "Two label designs arrived. The printer must always choose the LONGER one. Build the full decision.",
    varName: null, resultType: "boolean",
    skeleton: ["if (§left §op §right) {", "    print(a);", "} else {", "    print(b);", "}"],
    slots: [{ id: "left", hint: "left side", capacity: 1 }, { id: "op", hint: "operator", capacity: 1 }, { id: "right", hint: "right side", capacity: 1 }],
    palette: [
      { code: "a.length()", slot: "left" },
      { code: ">", slot: "op" },
      { code: "b.length()", slot: "right" },
      { code: "a", slot: "left", tag: "compared_strings_not_lengths" },
      { code: "<", slot: "op", tag: "operand_order_reversed" },
      { code: "b.length", slot: "right", tag: "property_vs_method_syntax" },
    ],
    tests: [
      { inputA: "SALE", inputB: "MEGA SALE", expected: "MEGA SALE" },
      { inputA: "PREMIUM", inputB: "NEW", expected: "PREMIUM" },
      { inputA: "HOT", inputB: "TOP", expected: "TOP" },
    ],
    postMissionNote: "Notice the tie went to label b! In real code, YOU decide tie-breaks. > and >= are different promises.",
    concept: "capstone_comparison" },
];

const MISCONCEPTION_FEEDBACK = {
  boundary_operator_confusion: "Look at the 'secret99' row — exactly 8 characters, but your gate rejected it! > means MORE than 8. The spec said AT LEAST 8 — that's >=.",
  loop_off_by_one_length: "The walker fell off the end! Positions run 0 to length()-1, so the loop must stop BEFORE i equals length(). Use < .",
  property_vs_method_syntax: "Compile failure — length without () isn't valid on a String. The machine can't even start. Parentheses!",
  operand_order_reversed: "Check the report: it computed backwards or chose the wrong side. Order matters — read your expression left to right.",
  empty_vs_blank_check: 'length() returns a NUMBER — you can\'t compare it to "" (a String). Compare numbers with numbers: == 0.',
  compared_strings_not_lengths: "a > b doesn't compile — Java can't 'greater-than' two Strings directly. Compare their LENGTHS: a.length() > b.length().",
  length_is_last_index: "'scan' has length 4 but its last position is 3! Count vs position — the eternal off-by-one. Subtract 1.",
  python_len_function: "That's Python thinking! Java calls the method ON the object: pass.length() — dot first, then the method.",
  assignment_vs_comparison: "= puts a value IN. == checks equality. Inside an if, you almost always want ==.",
  empty_string_confusion: 'An empty String "" has ZERO characters — length 0. Comparing to 1 misses the true empty case entirely.',
  wrong_operator: "Check which operator the logic actually needs here — the sign you chose points the math the wrong way.",
  off_by_one_last_position: "That's off by one! The subtracted amount must match the real character budget exactly — recheck the number.",
  zero_based_overcorrection: "Zero-based counting applies to POSITIONS, not this subtraction. You need length() minus ONE, not minus zero.",
  undershoot_last_char: "This stops one character too early! length()-1 as the loop BOUND skips the very last character — use length() alone as the bound with <.",
};

export class Level27Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level27Scene" });
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
    this.attemptLog = [];
    this.missionElements = [];
    this.slotContents = {};
    this.slotDefs = {};
    this.wrongBlockHistory = {};
    this.missionStartTime = 0;
    this.missionRunsFailed = 0;
    this.missionHintUsed = false;
    this.missionUsedWrongTags = new Set();
    this.paletteBlocks = [];
    this.inputLocked = true;
    this.gameEnded = false;
    this._alive = true;
    this._bubble = null;
    this._dragHoverSlotKey = null;
  }

  preload() {}

  create() {
    this._alive = true;
    this.events.once("shutdown", () => { this._alive = false; });

    const cam = this.cameras.main;
    const zoom = Math.min(this.scale.width / W, this.scale.height / H);
    cam.setZoom(zoom);
    cam.centerOn(W / 2, H / 2);
    cam.setBackgroundColor("#080a10");

    try { GameManager.incrementAttempt(26); } catch (_) {}

    this.createParticleTexture();
    this.createBackground();
    this.createMonitorWall();
    this.createDeskEdge();
    this.createAmbientParticles();
    this.createCodeCanvas();
    this.createBlockPalette();
    this.createRunButton();
    this.createObservationWindow();
    this.createTestMachine();
    this.createTestReportPanel();
    this.createMissionBriefPanel();
    this.createHUD();
    this.createBit();
    this.setupDragEvents();

    cam.fadeIn(700, 3, 5, 10);
    this.checkTutorial();
  }

  update(time, delta) {
    this.updateAmbient(time, delta);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // SETUP — background & environment
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l27_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l27_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x080a10).setDepth(0);
  }

  createMonitorWall() {
    this.wallMonitors = [];
    const g = this.add.graphics().setDepth(1);
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 6; col++) {
        const x = 180 + col * 130, y = 30 + row * 82;
        g.fillStyle(0x0a0e16, 0.5);
        g.fillRect(x, y, 110, 62);
        g.lineStyle(1, 0x16202e, 0.06);
        g.strokeRect(x, y, 110, 62);
        this.wallMonitors.push({ x, y, w: 110, h: 62 });
        if (Math.random() < 0.4) {
          for (let i = 0; i < Phaser.Math.Between(2, 3); i++) {
            g.fillStyle(0x00e676, 0.04);
            g.fillRect(x + 8, y + 10 + i * 12, Phaser.Math.Between(40, 80), 2);
          }
        }
      }
    }
    const cursor = this.add.rectangle(190 + 5, 40 + 5, 4, 8, C_CYAN, 0.1).setDepth(1);
    this.tweens.add({ targets: cursor, alpha: 0, duration: 1000, yoyo: true, repeat: -1 });
  }

  createDeskEdge() {
    const g = this.add.graphics().setDepth(3);
    g.fillStyle(0x0d1117, 1);
    g.fillRect(0, 635, W, 85);
    g.lineStyle(1, 0x21262d, 1);
    g.lineBetween(0, 635, W, 635);
    g.fillStyle(0x21262d, 0.3);
    g.fillRoundedRect(48, 645, 30, 34, 4);
    g.lineStyle(2, 0x21262d, 0.3);
    g.strokeCircle(80, 660, 6);
    this.time.addEvent({
      delay: 5000, loop: true,
      callback: () => {
        for (let i = 0; i < 2; i++) {
          const p = this.add.circle(60 + Phaser.Math.Between(-3, 3), 640, 2, 0xffffff, 0.04).setDepth(3);
          this.tweens.add({ targets: p, y: p.y - 20, alpha: 0, duration: 1200, delay: i * 150, onComplete: () => p.destroy() });
        }
      },
    });
  }

  createAmbientParticles() {
    this.ambient = [];
    for (let i = 0; i < 8; i++) {
      const p = this.add.circle(Phaser.Math.Between(20, 1260), Phaser.Math.Between(0, 600), 1, 0x4fc3f7, Phaser.Math.FloatBetween(0.02, 0.05)).setDepth(2);
      this.ambient.push(p);
    }
  }

  updateAmbient(time, delta) {
    if (!this.ambient) return;
    const step = 0.04 * (delta / 16.7);
    this.ambient.forEach((p, i) => {
      p.y += step;
      p.x += Math.sin(time * 0.0007 + i) * 0.03;
      if (p.y > 630) { p.y = 0; p.x = Phaser.Math.Between(20, 1260); }
    });
  }

  // ══════════════════════════════════════════════════════════════
  // CODE CANVAS
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
    this.tabFilename = this.add.text(CX + CW - 12, CY + TAB_H / 2, "Mission1.java", {
      font: "11px Courier New", color: "#546e7a",
    }).setOrigin(1, 0.5).setDepth(11);

    this.codeContainer = this.add.container(0, 0).setDepth(20);
  }

  _syntaxTokens(line) {
    const tokens = [];
    const re = /("(?:[^"\\]|\\.)*")|(\bif\b|\belse\b|\bfor\b|\bint\b)|([A-Za-z_]\w*(?=\())|(\b-?\d+\b)|(==|!=|<=|>=|\+\+|--)|([+\-=<>!])|([(){}\[\];.,])/g;
    let last = 0, m;
    const plain = (t) => t && tokens.push({ t, c: "#e0e0e0" });
    while ((m = re.exec(line))) {
      if (m.index > last) plain(line.slice(last, m.index));
      if (m[1]) tokens.push({ t: m[1], c: HEX_GREEN });
      else if (m[2]) tokens.push({ t: m[2], c: HEX_MAGENTA });
      else if (m[3]) tokens.push({ t: m[3], c: HEX_AMBER });
      else if (m[4]) tokens.push({ t: m[4], c: HEX_GREEN });
      else if (m[5]) tokens.push({ t: m[5], c: "#ff8a65" });
      else if (m[6]) tokens.push({ t: m[6], c: "#ff8a65" });
      else if (m[7]) tokens.push({ t: m[7], c: HEX_GRAY });
      last = m.index + m[0].length;
    }
    if (last < line.length) plain(line.slice(last));
    return tokens.length ? tokens : [{ t: line, c: "#e0e0e0" }];
  }

  _slotWidth(slotDef) {
    return slotDef.capacity <= 1 ? 100 : 220;
  }

  renderSkeleton(mission) {
    this.codeContainer.removeAll(true);
    this.slotDefs = {};
    mission.slots.forEach((s) => { this.slotDefs[s.id] = { ...s, rect: null }; });

    mission.skeleton.forEach((rawLine, i) => {
      const y = CODE_Y0 + i * LINE_H;
      const numT = this.add.text(CX + 8, y, String(i + 1), { font: "12px Courier New", color: "#3d4450" });
      this.codeContainer.add(numT);

      // split the line on §slotId markers
      const parts = rawLine.split(/§(\w+)/);
      let x = CODE_X;
      parts.forEach((part, pi) => {
        if (pi % 2 === 0) {
          if (!part) return;
          const tokens = this._syntaxTokens(part);
          tokens.forEach((tok) => {
            const t = this.add.text(x, y, tok.t, { font: "bold 16px Courier New", color: tok.c });
            this.codeContainer.add(t);
            x += t.width;
          });
        } else {
          const slotId = part;
          const def = this.slotDefs[slotId];
          const w = this._slotWidth(def);
          def.rect = { x, y: y - 2, w, h: 26 };
          this._drawSlotPlaceholder(slotId);
          x += w + 6;
        }
      });
    });
  }

  _drawSlotPlaceholder(slotId) {
    const def = this.slotDefs[slotId];
    if (!def || !def.rect) return;
    if (def.dg) { def.dg.destroy(); }
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
      const label = this.add.text(x + w / 2, y + h / 2, def.hint, {
        font: "italic 12px Courier New", color: "#3d4450",
      }).setOrigin(0.5).setDepth(22);
      def.hintLabel = label;
      this.codeContainer.add(label);
    } else if (def.hintLabel) {
      def.hintLabel = null;
    }
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

  /** Re-lays out blocks currently placed in a slot, left to right. */
  _relayoutSlot(slotId) {
    const def = this.slotDefs[slotId];
    const placed = this.slotContents[slotId] || [];
    if (!def || !def.rect) return;
    const { x, y, h } = def.rect;
    let cx = x + 6;
    placed.forEach((block) => {
      const bw = block.container.getData("w");
      this.tweens.add({ targets: block.container, x: cx + bw / 2, y: y + h / 2, duration: 150, ease: "Cubic.easeOut" });
      cx += bw + 4;
    });
    this._drawSlotPlaceholder(slotId);
    this.mirrorCodeToMachineFace();
  }

  // ══════════════════════════════════════════════════════════════
  // BLOCK PALETTE
  // ══════════════════════════════════════════════════════════════

  createBlockPalette() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0a0e14, 1);
    g.fillRoundedRect(PX, PY, PW, PH, 10);
    g.lineStyle(1, 0x1a2535, 1);
    g.strokeRoundedRect(PX, PY, PW, PH, 10);
    this.add.text(PX + 10, PY + 8, "BLOCK SUPPLY", { font: "bold 9px Arial", color: "#3d4450" }).setDepth(11);
    this.paletteContainer = this.add.container(0, 0).setDepth(30);
  }

  populatePalette(mission) {
    this.paletteBlocks.forEach((b) => b.container.destroy());
    this.paletteBlocks = [];
    const shuffled = Phaser.Utils.Array.Shuffle(mission.palette.slice());
    const rowY = [PY + 45, PY + 90];
    let x = PX + 14, row = 0;
    const maxX = PX + PW - 14;

    shuffled.forEach((def) => {
      const style = { font: "bold 15px Courier New", color: def.tag ? HEX_CYAN : HEX_CYAN };
      const measure = this.add.text(0, 0, def.code, style);
      const w = measure.width + 24;
      measure.destroy();
      if (x + w > maxX && row === 0) { row = 1; x = PX + 14; }
      const home = { x: x + w / 2, y: rowY[row] };
      x += w + 8;

      const c = this.add.container(home.x, home.y).setDepth(31);
      const bg = this.add.graphics();
      const draw = (stroke) => {
        bg.clear();
        bg.fillStyle(0x1e1e3a, 1);
        bg.fillRoundedRect(-w / 2, -18, w, 36, 8);
        bg.lineStyle(2, stroke, 1);
        bg.strokeRoundedRect(-w / 2, -18, w, 36, 8);
      };
      draw(C_CYAN);
      const txt = this.add.text(0, 0, def.code, style).setOrigin(0.5);
      c.add([bg, txt]);
      c.setSize(w, 36);
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
      // if this block was already sitting in a slot, pull it out mechanically first —
      // otherwise re-dragging a placed block would leave a stale duplicate entry
      // in slotContents while the block is also placed elsewhere (or back here).
      const prevSlot = obj.getData("placedIn");
      obj.setData("_cameFromSlot", prevSlot || null);
      if (prevSlot) {
        this.slotContents[prevSlot] = (this.slotContents[prevSlot] || []).filter((b) => b.container !== obj);
        obj.setData("placedIn", null);
        this._relayoutSlot(prevSlot);
        this.updateRunButtonState();
      }
    });
    this.input.on("drag", (pointer, obj, dragX, dragY) => {
      if (!this.paletteBlocks.find((b) => b.container === obj) || this.inputLocked) return;
      obj.x = dragX;
      obj.y = dragY;
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
      if (!def.rect) continue;
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
      // self-correction: a tagged (wrong) block that came out of a slot and landed back
      // in the open palette (not into another slot) before any run this mission.
      const cameFrom = obj.getData("_cameFromSlot");
      if (cameFrom && obj.getData("tag") && this.runCount === this._runCountAtMissionStart) {
        this.selfCorrectionCount++;
        this.attemptLog.push({
          mission: this.currentMission + 1, selfCorrected: true,
          code: obj.getData("code"), misconceptionTag: obj.getData("tag"),
          timestamp: Date.now(),
        });
      }
    }
  }

  placeBlockInSlot(blockObj, slotId) {
    if (!this.slotContents[slotId]) this.slotContents[slotId] = [];
    this.slotContents[slotId].push({ container: blockObj });
    blockObj.setData("placedIn", slotId);
    blockObj.disableInteractive();
    this._makeSlotBlockRemovable(blockObj, slotId);
    this._relayoutSlot(slotId);
    this.updateRunButtonState();
  }

  _makeSlotBlockRemovable(blockObj, slotId) {
    blockObj.setInteractive({ useHandCursor: true, draggable: true });
    blockObj.off("pointerover"); blockObj.off("pointerout");
    const draw = blockObj.getData("draw");
    blockObj.on("pointerover", () => { if (!this.inputLocked) draw(C_AMBER); });
    blockObj.on("pointerout", () => { if (!this.inputLocked) draw(C_CYAN); });
  }

  /** Mechanical removal only — self-correction accounting lives in _finishBlockDrag,
   *  since only landing back in the open palette (not another slot) counts as a correction. */
  removeBlockFromSlot(blockObj) {
    const slotId = blockObj.getData("placedIn");
    if (!slotId) return;
    this.slotContents[slotId] = (this.slotContents[slotId] || []).filter((b) => b.container !== blockObj);
    blockObj.setData("placedIn", null);
    this._relayoutSlot(slotId);
    this.updateRunButtonState();
  }

  allSlotsFilled() {
    return Object.keys(this.slotDefs).every((id) => (this.slotContents[id] || []).length > 0);
  }

  updateRunButtonState() {
    if (this.allSlotsFilled()) this.enableRunButton();
    else this.disableRunButton();
  }

  getAssembledCode() {
    const out = {};
    for (const id in this.slotDefs) {
      out[id] = (this.slotContents[id] || []).map((b) => ({
        code: b.container.getData("code"), tag: b.container.getData("tag"),
      }));
    }
    return out;
  }

  mirrorCodeToMachineFace() {
    if (!this.machineFace) return;
    const mission = MISSIONS[this.currentMission];
    const assembled = this.getAssembledCode();
    let text;
    if (mission.mission === 1) text = (assembled.cond || []).map((b) => b.code).join(" ");
    else if (mission.mission === 2) text = `name.length() ${(assembled.op || []).map((b) => b.code).join("")} ${(assembled.val || []).map((b) => b.code).join("")}`;
    else if (mission.mission === 3 || mission.mission === 4) text = (assembled.expr || []).map((b) => b.code).join(" ");
    else if (mission.mission === 5) text = (assembled.cond || []).map((b) => b.code).join(" ") || "?";
    else if (mission.mission === 6) text = `${(assembled.left || []).map((b) => b.code).join("")} ${(assembled.op || []).map((b) => b.code).join("")} ${(assembled.right || []).map((b) => b.code).join("")}`;
    this.machineFace.setText(text || "...");
  }

  // ══════════════════════════════════════════════════════════════
  // RUN BUTTON
  // ══════════════════════════════════════════════════════════════

  createRunButton() {
    const c = this.add.container(585, 640).setDepth(30);
    const g = this.add.graphics();
    const draw = (enabled, hover) => {
      g.clear();
      g.fillStyle(enabled ? C_GREEN : 0x2a2f36, hover && enabled ? 1 : 0.95);
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
    this.runButton.t.setColor("#0a0d08");
    this.runButton.c.setInteractive({ useHandCursor: true });
  }

  disableRunButton() {
    this._runReady = false;
    this.runButton.draw(false, false);
    this.runButton.t.setColor("#546e7a");
    this.runButton.c.disableInteractive();
  }

  // ══════════════════════════════════════════════════════════════
  // OBSERVATION WINDOW & TEST MACHINE
  // ══════════════════════════════════════════════════════════════

  createObservationWindow() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x060810, 1);
    g.fillRoundedRect(OX, OY, OW, OH, 12);
    g.lineStyle(3, 0x21262d, 1);
    g.strokeRoundedRect(OX, OY, OW, OH, 12);
    this.add.text(OX + OW / 2, OY + OH + 12, "TEST FLOOR — LIVE FEED", {
      font: "bold 9px Arial", color: "#3d4450",
    }).setOrigin(0.5).setDepth(11);

    const maskShape = this.make.graphics({ x: 0, y: 0, add: false });
    maskShape.fillRoundedRect(OX + 4, OY + 4, OW - 8, OH - 8, 10);
    this.windowMask = maskShape.createGeometryMask();

    this.machineLayer = this.add.container(0, 0).setDepth(15);
    this.machineLayer.setMask(this.windowMask);
  }

  createTestMachine() {
    const g = this.add.graphics();
    g.fillStyle(0x10140c, 1);
    g.fillRoundedRect(MACHINE_CX - 100, MACHINE_CY - 60, 200, 120, 10);
    g.lineStyle(2, 0x4a5a3a, 1);
    g.strokeRoundedRect(MACHINE_CX - 100, MACHINE_CY - 60, 200, 120, 10);
    g.fillStyle(0x10140c, 1);
    g.fillTriangle(MACHINE_CX - 100, MACHINE_CY - 30, MACHINE_CX - 100, MACHINE_CY + 30, MACHINE_CX - 130, MACHINE_CY);
    g.lineStyle(2, C_GREEN, 0.6);
    g.strokeCircle(MACHINE_CX + 105, MACHINE_CY - 25, 10);
    g.lineStyle(2, C_RED, 0.6);
    g.strokeCircle(MACHINE_CX + 105, MACHINE_CY + 25, 10);
    this.machineLayer.add(g);
    this.machineLayer.add(this.add.text(MACHINE_CX + 105, MACHINE_CY - 25, "PASS", { font: "9px Arial", color: HEX_GREEN }).setOrigin(0.5));
    this.machineLayer.add(this.add.text(MACHINE_CX + 105, MACHINE_CY + 25, "FAIL", { font: "9px Arial", color: HEX_RED }).setOrigin(0.5));

    this.machineLamp = this.add.circle(MACHINE_CX, MACHINE_CY - 66, 6, C_GRAY);
    this.machineLayer.add(this.machineLamp);

    this.machineFace = this.add.text(MACHINE_CX, MACHINE_CY, "", {
      font: "11px Courier New", color: HEX_CYAN, wordWrap: { width: 180 },
    }).setOrigin(0.5);
    this.machineLayer.add(this.machineFace);

    this.machineTiles = null; // built per-round for Mission 5 walker
    this.capsuleQueue = [];
  }

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
      const label = test.input !== undefined ? `"${test.input === "" ? "" : test.input.replace(/ /g, "␣")}"` : `A:"${test.inputA}" B:"${test.inputB}"`;
      const inputT = this.add.text(0, 0, label, { font: "12px Courier New", color: "#b0bec5" }).setOrigin(0, 0.5);
      const arrow = this.add.text(190, 0, "→", { font: "12px Arial", color: HEX_GRAY }).setOrigin(0, 0.5);
      const expT = this.add.text(210, 0, String(test.expected ?? test.expectedValue ?? test.expectedVisits), {
        font: "12px Courier New", color: HEX_GRAY,
      }).setOrigin(0, 0.5);
      const actualT = this.add.text(300, 0, "?", { font: "12px Courier New", color: HEX_GRAY }).setOrigin(0, 0.5);
      const statusT = this.add.text(RW - 24, 0, "…", { font: "14px Arial", color: HEX_GRAY }).setOrigin(0.5);
      c.add([inputT, arrow, expT, actualT, statusT]);
      this.reportRows.push({ container: c, inputT, actualT, statusT });
    });
  }

  updateReportRow(index, actualText, match) {
    const row = this.reportRows[index];
    if (!row) return;
    row.container.setAlpha(1);
    row.actualT.setText(actualText).setColor(match ? HEX_GREEN : HEX_RED);
    row.statusT.setText(match ? "✓" : "✗").setColor(match ? HEX_GREEN : HEX_RED);
    if (!match) {
      this.tweens.add({ targets: row.container, x: row.container.x + 4, duration: 40, yoyo: true, repeat: 5 });
    }
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
    const badge = this.add.circle(BX + 24, BY + 24, 13, C_AMBER);
    const badgeNum = this.add.text(BX + 24, BY + 24, String(mission.mission), { font: "bold 13px Arial", color: "#0a0e14" }).setOrigin(0.5);
    const title = this.add.text(BX + 46, BY + 16, mission.title, { font: "bold 14px Arial", color: "#e0e0e0" }).setOrigin(0, 0.5);
    const brief = this.add.text(BX + 14, BY + 42, mission.brief, {
      font: "12px Arial", color: "#90a4ae", wordWrap: { width: BW - 28 },
    }).setOrigin(0, 0);
    const hint = this.add.text(BX + BW - 12, BY + BH - 12, "HINT", {
      font: "bold 11px Arial", color: "#546e7a",
    }).setOrigin(1, 1).setInteractive({ useHandCursor: true });
    hint.on("pointerover", () => hint.setColor(HEX_AMBER));
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
    g.lineStyle(1, 0x1a2535, 1);
    g.lineBetween(0, 64, W, 64);

    this.add.text(20, 14, "THE CONTROL ROOM", { font: "bold 15px Arial", color: "#b0bec5" }).setDepth(51);
    this.add.text(20, 36, "Restructuring Phase — String Methods: length()", { font: "11px Arial", color: "#546e7a" }).setDepth(51);

    this.missionHexes = [];
    for (let i = 0; i < 6; i++) {
      const x = 490 + i * 26;
      const hx = this.add.graphics().setDepth(51);
      this.missionHexes.push({ g: hx, x, y: 32 });
    }
    this._drawHexes();

    this.add.text(1060, 12, "SCORE", { font: "9px Arial", color: "#546e7a" }).setDepth(51);
    this.scoreText = this.add.text(1060, 24, "0", { font: "bold 20px Arial", color: "#ffffff" }).setDepth(51);

    this.lifeIcons = [];
    for (let i = 0; i < 3; i++) {
      const lg = this.add.graphics({ x: 1150 + i * 30, y: 26 }).setDepth(51);
      lg.lineStyle(2, C_CYAN, 1);
      lg.strokeRoundedRect(-8, -6, 16, 11, 2);
      lg.fillStyle(C_CYAN, 1);
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
      if (i < this.currentMission) {
        g.fillStyle(C_AMBER, 1);
        this._drawHexPath(g, x, y, 9);
        g.fillPath();
      } else if (i === this.currentMission) {
        g.lineStyle(2, C_AMBER, 1);
        this._drawHexPath(g, x, y, 9);
        g.strokePath();
      } else {
        g.lineStyle(1, C_GRAY, 1);
        this._drawHexPath(g, x, y, 9);
        g.strokePath();
      }
    });
  }

  // ══════════════════════════════════════════════════════════════
  // BIT — senior engineer variant
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
    const clip = this.add.graphics();
    clip.lineStyle(1, 0xb0bec5, 1);
    clip.strokeRoundedRect(20, -6, 12, 16, 2);
    clip.lineBetween(23, -2, 29, -2);
    clip.lineBetween(23, 2, 29, 2);
    clip.lineBetween(23, 6, 29, 6);
    c.add([g, tip, eye, pupil, clip]);
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

  // ══════════════════════════════════════════════════════════════
  // TUTORIAL
  // ══════════════════════════════════════════════════════════════

  checkTutorial() {
    let done = false;
    try { done = localStorage.getItem(TUTORIAL_KEY) === "true"; } catch (_) {}
    if (done) this.time.delayedCall(300, () => this.startMission(0));
    else this.runTutorial();
  }

  async runTutorial() {
    const A = () => this._alive;
    await this.delay(400); if (!A()) return;
    await this.bitSay("Congratulations on the promotion, Analyst — you're a Systems Programmer now! No more picking answers. Up here, WE write the code that runs the machines.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();

    const a1 = this.createAnnotation(CX + CW / 2, CY - 20, "assemble your program here", HEX_AMBER, { x: CX + CW / 2, y: CY + 4 });
    await this.delay(400); if (!A()) return;
    const a2 = this.createAnnotation(PX + PW / 2, PY - 16, "drag blocks from the supply", HEX_CYAN, { x: PX + PW / 2, y: PY + 4 });
    await this.delay(400); if (!A()) return;
    const a3 = this.createAnnotation(OX + OW / 2, OY - 16, "then RUN it against real test strings", HEX_GREEN, { x: OX + OW / 2, y: OY + 4 });
    await this.delay(400); if (!A()) return;

    await this.bitSay("Careful — the supply crate has faulty blocks mixed in, just like real code has bugs. Build it, run it, and if tests fail, read the report and repair. That's real programming!");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();
    [a1, a2, a3].forEach((a) => this.tweens.add({ targets: a, alpha: 0, duration: 250, onComplete: () => a.destroy() }));

    try { localStorage.setItem(TUTORIAL_KEY, "true"); } catch (_) {}
    this.startMission(0);
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

  // ══════════════════════════════════════════════════════════════
  // MISSION LIFECYCLE
  // ══════════════════════════════════════════════════════════════

  startMission(index) {
    if (!this._alive || this.gameEnded) return;
    this.currentMission = index;
    const mission = MISSIONS[index];
    this.missionStartTime = this.time.now;
    this.missionRunsFailed = 0;
    this.missionHintUsed = false;
    this.missionUsedWrongTags = new Set();
    this._runCountAtMissionStart = this.runCount;
    this.clearMission();

    this.tabFilename.setText(`Mission${mission.mission}.java`);
    this.renderSkeleton(mission);
    this.populatePalette(mission);
    this.buildReportRows(mission.tests);
    this.renderMissionBrief(mission);
    this._drawHexes();
    this.machineFace.setText("...");
    this.machineLamp.setFillStyle(C_GRAY);
    this.disableRunButton();
    this.inputLocked = false;
  }

  clearMission() {
    this.missionElements.forEach((e) => { if (e && e.destroy) e.destroy(); });
    this.missionElements = [];
    this.slotContents = {};
  }

  // ══════════════════════════════════════════════════════════════
  // CLASSIFICATION & EVALUATION ENGINE
  // ══════════════════════════════════════════════════════════════

  _classifyBlock(code) {
    let m;
    if ((m = code.match(/^([a-zA-Z_]\w*)\.length\(\)$/))) return { role: "lengthCall", var: m[1], code };
    if ((m = code.match(/^([a-zA-Z_]\w*)\.length$/))) return { role: "lengthProperty", var: m[1], code };
    if ((m = code.match(/^length\((\w+)\)$/))) return { role: "lengthFunction", var: m[1], code };
    if (/^-?\d+$/.test(code)) return { role: "number", value: parseInt(code, 10), code };
    if (code === '""') return { role: "stringLiteral", code };
    if (/^(==|!=|>=|<=)$/.test(code)) return { role: "compareOp", code };
    if (/^[<>]$/.test(code)) return { role: "compareOp", code };
    if (code === "=") return { role: "assignOp", code };
    if (/^[+\-]$/.test(code)) return { role: "arithOp", code };
    if (/^[a-zA-Z_]\w*$/.test(code)) return { role: "identifier", code };
    return { role: "unknown", code };
  }

  _resolveOperand(c, varResolver) {
    if (c.role === "lengthCall") return { type: "number", value: varResolver(c.var).length };
    if (c.role === "lengthProperty") return { error: `${c.var}.length isn't valid on a String — you need the method length(), with parentheses.`, tag: "property_vs_method_syntax" };
    if (c.role === "lengthFunction") return { error: `Java has no standalone length() function — call it ON the object: ${c.var}.length()`, tag: "python_len_function" };
    if (c.role === "number") return { type: "number", value: c.value };
    if (c.role === "stringLiteral") return { type: "string", value: "" };
    if (c.role === "identifier") return { type: "string", value: varResolver(c.var) };
    return { error: "Invalid operand." };
  }

  /** Evaluates a 1-3 token sequence built by the player. varResolver(name) -> string value. */
  _evaluateSequence(tokens, varResolver, resultType) {
    const classified = tokens.map((t) => this._classifyBlock(t.code));

    if (classified.length === 0) return { compileError: true, message: "Nothing built yet." };

    if (classified.length === 1) {
      const c = classified[0];
      const operand = this._resolveOperand(c, varResolver);
      if (operand.error) return { compileError: true, message: operand.error, tag: operand.tag };
      if (resultType === "boolean") return { compileError: true, message: "That's a number, not a true/false condition — the machine can't decide which path to take." };
      return { value: operand.value };
    }

    if (classified.length === 2) {
      return { compileError: true, message: "Incomplete expression — a piece is missing." };
    }

    const [c0, c1, c2] = classified;
    const opRoles = ["compareOp", "arithOp", "assignOp"];
    if (!opRoles.includes(c1.role)) return { compileError: true, message: "That combination isn't a valid expression shape." };

    const left = this._resolveOperand(c0, varResolver);
    const right = this._resolveOperand(c2, varResolver);
    if (c1.role === "assignOp") return { compileError: true, message: "A single '=' assigns a value — it can't be used as a comparison. Use '==' instead.", tag: "assignment_vs_comparison" };
    if (left.error) return { compileError: true, message: left.error, tag: left.tag };
    if (right.error) return { compileError: true, message: right.error, tag: right.tag };

    if (c1.role === "arithOp") {
      if (left.type !== "number" || right.type !== "number") return { compileError: true, message: "Arithmetic needs numbers on both sides." };
      const value = c1.code === "+" ? left.value + right.value : left.value - right.value;
      return { value };
    }

    // compareOp
    if (left.type !== right.type) return { compileError: true, message: `Type mismatch: can't compare a ${left.type} with a ${right.type} directly.`, tag: "empty_vs_blank_check" };
    if (left.type === "string") return { compileError: true, message: "Strings can't be compared with a relational operator — compare their lengths instead.", tag: "compared_strings_not_lengths" };
    if (resultType !== "boolean") return { compileError: true, message: "A comparison produces true/false, not a number." };
    let value;
    switch (c1.code) {
      case "==": value = left.value === right.value; break;
      case "!=": value = left.value !== right.value; break;
      case ">=": value = left.value >= right.value; break;
      case "<=": value = left.value <= right.value; break;
      case ">": value = left.value > right.value; break;
      case "<": value = left.value < right.value; break;
      default: return { compileError: true, message: "Unknown operator." };
    }
    return { value };
  }

  _evaluateM5Condition(conditionCode, len) {
    if (conditionCode === "i < s.length") return { compileError: true, message: "s.length without parentheses isn't valid on a String — you need s.length().", tag: "property_vs_method_syntax" };
    if (conditionCode === "i < s.length()") return { visits: len, crash: false, missedLast: false };
    if (conditionCode === "i <= s.length()") return { visits: len, crash: true, missedLast: false };
    if (conditionCode === "i < s.length() - 1") return { visits: Math.max(0, len - 1), crash: false, missedLast: true };
    return { compileError: true, message: "Unrecognized loop condition." };
  }

  /** Collects every wrong (tagged) block currently used across all slots. */
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

  // ══════════════════════════════════════════════════════════════
  // RUN SEQUENCE
  // ══════════════════════════════════════════════════════════════

  async onRunPressed() {
    if (this.inputLocked) return;
    this.inputLocked = true;
    this.disableRunButton();
    this.runButton.t.setText("...");
    this.runCount++;
    const mission = MISSIONS[this.currentMission];
    const assembled = this.getAssembledCode();
    const wrongBlocksUsed = this._collectWrongBlocksUsed();

    // universal compile check across all slots for M1-M4/M6 style missions
    let compileResult = null;
    let missionResultsPerTest = [];

    if (mission.mission === 5) {
      const condTokens = assembled.cond || [];
      const condCode = condTokens.map((b) => b.code).join(" ");
      for (const test of mission.tests) {
        const r = this._evaluateM5Condition(condCode, test.input.length);
        if (r.compileError) { compileResult = r; break; }
        missionResultsPerTest.push(r);
      }
    } else {
      for (const test of mission.tests) {
        const r = this._runMissionLogic(mission, assembled, test);
        if (r.compileError) { compileResult = r; break; }
        missionResultsPerTest.push(r);
      }
    }

    this.machineLamp.setFillStyle(C_AMBER);
    this.tweens.add({ targets: this.machineLamp, alpha: 0.3, duration: 150, yoyo: true, repeat: 3 });
    await this.delay(400);
    if (!this._alive) return;

    if (compileResult) {
      await this.showCompileError(compileResult);
      if (!this._alive) return;
      this._resolveRunOutcome(mission, "compile_fail", wrongBlocksUsed, [], compileResult);
      return;
    }

    let anyMismatch = false;
    const failedTests = [];
    for (let i = 0; i < mission.tests.length; i++) {
      if (!this._alive) return;
      const test = mission.tests[i];
      const result = missionResultsPerTest[i];
      const match = await this.runTestCase(mission, test, i, result);
      if (!match) { anyMismatch = true; failedTests.push(test.input ?? `${test.inputA}/${test.inputB}`); }
    }

    this._resolveRunOutcome(mission, anyMismatch ? "logic_fail" : "pass", wrongBlocksUsed, failedTests, null);
  }

  _runMissionLogic(mission, assembled, test) {
    const varResolver = (name) => {
      if (mission.mission === 6) return name === "a" ? test.inputA : test.inputB;
      return test.input;
    };
    if (mission.mission === 1) {
      return this._evaluateSequence(assembled.cond || [], varResolver, "boolean");
    }
    if (mission.mission === 2) {
      const fixed = { code: "name.length()" };
      const tokens = [fixed, ...(assembled.op || []), ...(assembled.val || [])];
      return this._evaluateSequence(tokens, varResolver, "boolean");
    }
    if (mission.mission === 3 || mission.mission === 4) {
      return this._evaluateSequence(assembled.expr || [], varResolver, "number");
    }
    if (mission.mission === 6) {
      const tokens = [...(assembled.left || []), ...(assembled.op || []), ...(assembled.right || [])];
      const r = this._evaluateSequence(tokens, varResolver, "boolean");
      if (r.compileError) return r;
      return { value: r.value ? test.inputA : test.inputB };
    }
    return { compileError: true, message: "Unknown mission." };
  }

  async showCompileError(err) {
    const stamp = this.add.text(CX + CW / 2, CY + CH / 2, "COMPILE ERROR", {
      font: "bold 30px Arial", color: HEX_RED,
    }).setOrigin(0.5).setDepth(80).setScale(2).setAngle(-8).setAlpha(0);
    this.missionElements.push(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 250, ease: "Cubic.easeOut" });
    this.screenShake(0.006, 200);
    await this.delay(300);
    if (!this._alive) return;
    const msg = this.add.text(CX + CW / 2, CY + CH - 30, err.message, {
      font: "bold 12px Arial", color: HEX_RED, wordWrap: { width: CW - 40 },
    }).setOrigin(0.5).setDepth(80).setAlpha(0);
    this.missionElements.push(msg);
    this.tweens.add({ targets: msg, alpha: 1, duration: 250 });
    await this.delay(600);
  }

  async runTestCase(mission, test, index, result) {
    const inputLabel = test.input !== undefined ? `"${test.input}"` : `A:"${test.inputA}" B:"${test.inputB}"`;
    const capsule = this.add.text(MACHINE_CX - 150, MACHINE_CY, inputLabel.replace(/ /g, "␣"), {
      font: "11px Courier New", color: "#e0e0e0",
    }).setOrigin(0.5).setDepth(16);
    this.machineLayer.add(capsule);
    await new Promise((res) => this.tweens.add({ targets: capsule, x: MACHINE_CX - 20, duration: 300, onComplete: () => res() }));
    if (!this._alive) return true;

    let actualDisplay, match;
    if (mission.mission === 5) {
      actualDisplay = String(result.visits);
      match = result.visits === test.expectedVisits && !result.crash && !result.missedLast;
      await this.runWalkerVisualization(test.input, result);
    } else if (test.expectedValue !== undefined) {
      actualDisplay = String(result.value);
      match = result.value === test.expectedValue;
    } else if (test.expected === "PASS" || test.expected === "FAIL") {
      actualDisplay = result.value ? "PASS" : "FAIL";
      match = actualDisplay === test.expected;
    } else {
      actualDisplay = result.value;
      match = result.value === test.expected;
    }

    this.machineLamp.setFillStyle(match ? C_GREEN : C_RED);
    if (match) {
      await new Promise((res) => {
        this.tweens.add({ targets: capsule, x: MACHINE_CX + 130, y: MACHINE_CY - 55, duration: 350, ease: "Cubic.easeOut", onComplete: () => { capsule.destroy(); res(); } });
      });
      const p = this.add.particles(MACHINE_CX + 130, MACHINE_CY - 55, "l27_dot", {
        speed: { min: 30, max: 70 }, angle: { min: 0, max: 360 }, scale: { start: 0.5, end: 0 }, lifespan: 300, tint: C_GREEN, emitting: false,
      });
      this.machineLayer.add(p);
      p.explode(6);
      this.time.delayedCall(400, () => p.destroy());
    } else {
      await new Promise((res) => {
        this.tweens.add({ targets: capsule, x: MACHINE_CX + 130, y: MACHINE_CY + 55, alpha: 0, duration: 350, ease: "Cubic.easeIn", onComplete: () => { capsule.destroy(); res(); } });
      });
    }
    this.machineLamp.setFillStyle(C_GRAY);
    this.updateReportRow(index, actualDisplay, match);
    await this.delay(150);
    return match;
  }

  async runWalkerVisualization(input, result) {
    const len = input.length;
    const tw = 20;
    const totalW = Math.max(len, 1) * tw;
    const startX = MACHINE_CX - totalW / 2;
    const tileObjs = [];
    for (let i = 0; i < len; i++) {
      const t = this.add.rectangle(startX + i * tw + tw / 2, MACHINE_CY + 40, tw - 3, 16, 0x1a2a3a).setStrokeStyle(1, 0x2a3a4a);
      this.machineLayer.add(t);
      tileObjs.push(t);
    }
    const walker = this.add.circle(startX - 10, MACHINE_CY + 40, 5, C_CYAN).setDepth(1);
    this.machineLayer.add(walker);

    const hopsToShow = result.crash ? len + 1 : result.visits;
    for (let i = 0; i < hopsToShow; i++) {
      if (!this._alive) return;
      const isCrashHop = result.crash && i === len;
      const tx = isCrashHop ? startX + len * tw + tw / 2 : startX + i * tw + tw / 2;
      await new Promise((res) => this.tweens.add({ targets: walker, x: tx, duration: 130, onComplete: () => res() }));
      if (!this._alive) return;
      if (isCrashHop) {
        const boom = this.add.particles(tx, MACHINE_CY + 40, "l27_dot", {
          speed: { min: 40, max: 100 }, angle: { min: 0, max: 360 }, scale: { start: 0.6, end: 0 }, lifespan: 300, tint: C_RED, emitting: false,
        });
        this.machineLayer.add(boom);
        boom.explode(8);
        this.time.delayedCall(400, () => boom.destroy());
        walker.setFillStyle(C_RED);
      } else {
        tileObjs[i].setStrokeStyle(1, C_CYAN);
      }
      await this.delay(50);
    }
    if (result.missedLast && tileObjs[len - 1]) {
      tileObjs[len - 1].setStrokeStyle(2, C_AMBER);
      this.tweens.add({ targets: tileObjs[len - 1], alpha: 0.4, duration: 200, yoyo: true, repeat: 2 });
    }
    await this.delay(300);
    tileObjs.forEach((t) => t.destroy());
    walker.destroy();
  }

  _resolveRunOutcome(mission, result, wrongBlocksUsed, failedTests, compileErr) {
    const timeMs = Math.round(this.time.now - this.missionStartTime);
    this.attemptLog.push({
      mission: mission.mission, runNumber: this.runCount, result,
      blocksUsed: Object.values(this.getAssembledCode()).flat().map((b) => b.code),
      wrongBlocks: wrongBlocksUsed, failedTests, timeMs, hintUsedBefore: this.missionHintUsed,
    });

    if (result === "pass") {
      this.onMissionComplete();
      return;
    }

    this.failedRunCount++;
    this.missionRunsFailed++;
    this.runButton.t.setText("▶ RUN");

    // repeated-misconception life loss — count each distinct tag once per run.
    // (compileErr.tag, when present, always belongs to one of the blocks still
    // sitting in a slot, so it's already covered by wrongBlocksUsed; the fallback
    // below only fires for the rare case where it isn't, avoiding a double-count.)
    let livesLostThisRun = false;
    const tagsThisRun = new Set(wrongBlocksUsed.map((b) => b.tag));
    if (compileErr && compileErr.tag) tagsThisRun.add(compileErr.tag);
    tagsThisRun.forEach((tag) => {
      this.wrongBlockHistory[tag] = (this.wrongBlockHistory[tag] || 0) + 1;
      if (this.wrongBlockHistory[tag] >= 2) livesLostThisRun = true;
    });

    const feedbackTag = (wrongBlocksUsed[0] && wrongBlocksUsed[0].tag) || (compileErr && compileErr.tag) || null;

    const proceed = async () => {
      if (livesLostThisRun) {
        const dead = this.loseLife();
        if (dead) { this.time.delayedCall(500, () => this.gameOver()); return; }
      }
      await this.showBitFeedback(MISCONCEPTION_FEEDBACK[feedbackTag] || "Check the report — the machine shows exactly what your code actually does.");
      if (!this._alive) return;
      this.unlockForRepair();
    };
    proceed();
  }

  unlockForRepair() {
    this.inputLocked = false;
    this.updateRunButtonState();
  }

  // ══════════════════════════════════════════════════════════════
  // FEEDBACK / SCORING
  // ══════════════════════════════════════════════════════════════

  onHintPressed() {
    if (this.inputLocked) return;
    this.missionHintUsed = true;
    this.hintCount++;
    this.updateScore(-25);
    const mission = MISSIONS[this.currentMission];
    const hints = {
      1: "Think about what 'at least' means for a boundary value — should exactly 8 pass or fail?",
      2: "length() gives you a number. What number means 'nothing typed at all'?",
      3: "You're taking the budget (140) and removing however many characters are already used.",
      4: "If there are N characters, positions go 0 up to N minus something.",
      5: "The loop should stop exactly when i reaches the count of characters — not before, not after.",
      6: "Whichever length() is bigger should decide which one prints.",
    };
    this.showBitFeedback(hints[mission.mission] || "Reread the brief carefully — the answer is in the wording.");
  }

  onMissionComplete() {
    if (this.gameEnded) return;
    const flawless = this.missionRunsFailed === 0 && !this.missionHintUsed;
    if (flawless) this.flawlessCount++;
    this.updateScore(250 + (flawless ? 100 : 0));
    if (flawless) this.createFloatingText(CX + CW / 2, CY + 40, "FLAWLESS +100", HEX_AMBER, "bold 18px Arial");

    this.missionFanfare().then(() => {
      if (!this._alive || this.gameEnded) return;
      const next = this.currentMission + 1;
      if (next >= MISSIONS.length) this.levelComplete();
      else this.startMission(next);
    });
  }

  async missionFanfare() {
    this.machineLamp.setFillStyle(C_GREEN);
    this.createConfetti(MACHINE_CX, MACHINE_CY);
    this._drawHexes();
    const hx = this.missionHexes[this.currentMission];
    if (hx) {
      hx.g.clear();
      hx.g.fillStyle(C_AMBER, 1);
      this._drawHexPath(hx.g, hx.x, hx.y, 9);
      hx.g.fillPath();
      this.tweens.add({ targets: hx.g, alpha: 0.4, duration: 150, yoyo: true, repeat: 2 });
    }
    const mission = MISSIONS[this.currentMission];
    await this.bitSay(mission.postMissionNote ? mission.postMissionNote : "Nice work — the machine confirms it's correct!");
    await Promise.race([this.waitForClick(), this.delay(2500)]);
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

  createFloatingText(x, y, text, colorHex, font = "bold 16px Arial") {
    const t = this.add.text(x, y, text, { font, color: colorHex }).setOrigin(0.5).setDepth(75);
    this.tweens.add({ targets: t, y: y - 34, alpha: 0, duration: 900, ease: "Cubic.easeOut", onComplete: () => t.destroy() });
    return t;
  }

  createConfetti(x, y, count = 26) {
    const p = this.add.particles(x, y, "l27_dot", {
      speed: { min: 80, max: 240 }, angle: { min: 0, max: 360 }, scale: { start: 0.9, end: 0 }, lifespan: 500,
      tint: [C_CYAN, C_AMBER, C_GREEN, C_MAGENTA, 0xffffff], emitting: false,
    }).setDepth(75);
    p.explode(count);
    this.time.delayedCall(900, () => p.destroy());
  }

  screenShake(intensity = 0.005, duration = 200) {
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

    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
    this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });

    const title = this.add.text(640, 240, "ACCESS REVOKED", { font: "bold 40px Arial", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
    this.tweens.add({
      targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut",
      onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }),
    });
    this.add.text(640, 310, `Score: ${this.score}`, { font: "20px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
    this.add.text(640, 350, `Missions Completed: ${this.currentMission} / ${MISSIONS.length}`, { font: "16px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);

    this._makeButton(640, 420, "REQUEST NEW KEYCARD", 230, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearMission();
    this.hideBubble();

    try { GameManager.completeLevel(26, Math.round((this.flawlessCount / MISSIONS.length) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("length_mastery"); } catch (_) {}
    try {
      localStorage.setItem("level27_results", JSON.stringify({
        level: 27, concept: "string_length", phase: "restructuring",
        score: this.score, missionsCompleted: 6, flawlessMissions: this.flawlessCount,
        totalRuns: this.runCount, failedRuns: this.failedRunCount, hintsUsed: this.hintCount,
        selfCorrections: this.selfCorrectionCount, livesRemaining: this.lives, attempts: this.attemptLog,
        timestamp: Date.now(),
      }));
    } catch (_) {}

    this.trilogyCelebration().then(() => { if (this._alive) this.showScoreTally(); });
  }

  async trilogyCelebration() {
    this.wallMonitors.forEach((m, i) => {
      this.time.delayedCall(i * 30, () => {
        if (!this._alive) return;
        const g = this.add.rectangle(m.x + m.w / 2, m.y + m.h / 2, m.w - 4, m.h - 4, C_GREEN, 0.06).setDepth(1);
        this.tweens.add({ targets: g, alpha: 0.12, duration: 300, yoyo: true });
      });
    });
    this.createConfetti(MACHINE_CX, MACHINE_CY, 40);
    await this.delay(1200);
  }

  _starRating() {
    if (this.flawlessCount >= 4 && this.hintCount <= 1) return 3;
    if (this.failedRunCount <= 3) return 2;
    return 1;
  }

  showScoreTally() {
    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
    this.tweens.add({ targets: ov, fillAlpha: 0.85, duration: 500 });

    const panel = this.add.graphics().setDepth(90);
    panel.fillStyle(0x0f1520, 1);
    panel.fillRoundedRect(350, 125, 580, 470, 16);
    panel.lineStyle(2, C_AMBER, 1);
    panel.strokeRoundedRect(350, 125, 580, 470, 16);

    const title = this.add.text(640, 175, "SYSTEMS ONLINE", { font: "bold 36px Arial", color: HEX_GREEN }).setOrigin(0.5).setDepth(91).setScale(0);
    this.tweens.add({ targets: title, scale: 1, duration: 350, ease: "Back.easeOut" });

    const lines = [
      `MISSIONS: 6/6`, `FLAWLESS: ${this.flawlessCount}`,
      `SELF-CORRECTIONS: ${this.selfCorrectionCount}`, `HINTS: ${this.hintCount}`,
    ];
    lines.forEach((s, i) => {
      const t = this.add.text(500, 230 + i * 30, s, { font: "14px Arial", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 250, delay: 300 + i * 150 });
    });
    const totalText = this.add.text(500, 230 + 4 * 30, "TOTAL: 0", { font: "bold 24px Arial", color: HEX_AMBER }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: totalText, alpha: 1, duration: 250, delay: 1050 });
    const counter = { v: 0 };
    this.tweens.add({ targets: counter, v: this.score, duration: 1000, delay: 1050, onUpdate: () => totalText.setText(`TOTAL: ${Math.round(counter.v)}`) });

    const stars = this._starRating();
    for (let i = 0; i < 3; i++) {
      const earned = i < stars;
      const s = this.add.text(640 + (i - 1) * 60, 400, "★", { font: "40px Arial", color: earned ? HEX_AMBER : "#2a3040" }).setOrigin(0.5).setDepth(91).setScale(0);
      this.tweens.add({ targets: s, scale: 1, duration: 250, delay: 1650 + i * 200, ease: earned ? "Back.easeOut" : "Cubic.easeOut" });
    }

    const badge = this.add.container(640, 480).setDepth(91).setAlpha(0);
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillCircle(0, 0, 38);
    bg.lineStyle(3, C_AMBER, 1);
    bg.strokeCircle(0, 0, 38);
    bg.lineStyle(2, C_AMBER, 1);
    bg.strokeCircle(-20, 0, 7);
    bg.lineBetween(-16, 5, -12, 9);
    bg.fillStyle(C_AMBER, 1);
    bg.fillRoundedRect(-4, -8, 8, 16, 2);
    bg.fillCircle(20, 0, 6);
    bg.lineStyle(2, C_AMBER, 1);
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i;
      bg.lineBetween(20 + Math.cos(a) * 6, Math.sin(a) * 6, 20 + Math.cos(a) * 9, Math.sin(a) * 9);
    }
    badge.add(bg);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 2200 });
    const badgeLbl = this.add.text(640, 528, "length() MASTERY", { font: "bold 14px Arial", color: HEX_AMBER }).setOrigin(0.5).setDepth(91).setAlpha(0);
    const badgeSub = this.add.text(640, 546, "Accretion ✓  Tuning ✓  Restructuring ✓", { font: "10px Arial", color: "#78909c" }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: [badgeLbl, badgeSub], alpha: 1, duration: 300, delay: 2300 });

    this._makeButton(500, 555, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(760, 555, "NEXT: charAt() →", 220, 44, { fill: 0x00733a, stroke: C_GREEN, textColor: "#ffffff" }, () => {
      if (this.scene.get("Level28Scene")) this.scene.start("Level28Scene");
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
