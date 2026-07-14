/**
 * Level 33 — "The Foundry" (String Methods: Restructuring Phase — Trilogy
 * + Nine-Level Arc Finale)
 * ===========================================================================
 * The learner restructures the case-conversion + immutability schema by
 * CONSTRUCTING complete programs — no multiple choice. The Foundry unifies
 * three trilogy machines (scanner/counter from L25-27, claw from L28-30,
 * press from L31-32) on one production line, driven entirely by the
 * player's code. Missions 1, 5, and 6 deliberately REOPEN and REBUILD
 * earlier Level 30 missions — restructuring made literal: old solutions
 * are revisited and upgraded, not just superseded.
 *
 * A genuine per-mission interpreter (_interpretMissionN) tracks TYPE
 * through method chains (String -> String for case methods, String -> char
 * for charAt, and a method call on a char is a compile error) and computes
 * real results from whatever blocks were placed — never a lookup table.
 * Wrong builds produce their authentic wrong outcomes: an unsaved case
 * conversion really does leave the original untouched; normalizing the
 * wrong direction really does zero out every match; a fixed loop index
 * really does repeat the same character.
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

// Layout geometry (matches Level 27/30's construction layout)
const CX = 40, CY = 90, CW = 680, CH = 380;
const TAB_H = 34, GUTTER_W = 34, CODE_PAD = 10;
const CODE_X = CX + GUTTER_W + CODE_PAD;
const CODE_Y0 = CY + TAB_H + 14;
const LINE_H = 24;
const PX = 40, PY = 490, PW = 680, PH = 130;
const OX = 760, OY = 80, OW = 460, OH = 250;
const RX = 760, RY = 345, RW = 460, RH = 125;
const BX = 760, BY = 490, BW = 460, BH = 130;

const STATION_CASE_X = OX + 75, STATION_PRESS_X = OX + 230, STATION_CLAW_X = OX + 385;
const STATION_Y = OY + 55;
const TILE_ROW_Y = OY + 130;
const TICKER_Y = OY + OH - 18;

const TUTORIAL_KEY = "level33_tutorial_done";

// ─────────────────────────────────────────────────────────────────
// Mission configuration
// ─────────────────────────────────────────────────────────────────
const MISSIONS = [
  { mission: 1, title: "The Open-Door Gate", blueprint: true,
    brief: 'Remember the Gatekeeper? It rejected "x42" — a valid worker with a lowercase badge! Rebuild it so \'X\' and \'x\' BOTH open the door.',
    skeleton: ["if (code§norm.charAt(0) == §ch) {", "    open();", "} else {", "    deny();", "}"],
    slots: [{ id: "norm", hint: "normalize", capacity: 1 }, { id: "ch", hint: "character", capacity: 1 }],
    palette: [
      { code: ".toLowerCase()", slot: "norm" },
      { code: ".toUpperCase()", slot: "norm" },
      { code: "'x'", slot: "ch" },
      { code: "'X'", slot: "ch" },
      { code: "(nothing)", slot: "norm", empty: true, tag: "no_normalization" },
      { code: '"x"', slot: "ch", tag: "char_vs_string_type" },
    ],
    tests: [
      { input: "X99", expected: "open" },
      { input: "x42", expected: "open" },
      { input: "A11", expected: "deny" },
    ],
    postMissionNote: "The same door that turned \"x42\" away now opens for it. THAT is restructuring, Builder — the old build wasn't wrong, it just hadn't learned enough yet.",
    concept: "case_insensitive_condition" },

  { mission: 2, title: "The Label Normalizer",
    brief: "Foundry inventory stores every label in lowercase — permanently. Make the change STICK to the variable label.",
    skeleton: ["§lhs label.toLowerCase();", "store(label);"],
    slots: [{ id: "lhs", hint: "save to?", capacity: 1 }],
    palette: [
      { code: "label =", slot: "lhs", correct: true },
      { code: "(nothing)", slot: "lhs", empty: true, tag: "in_place_mutation_belief" },
      { code: "String tmp =", slot: "lhs", tag: "result_discarded_confusion" },
    ],
    tests: [
      { input: "BOLT-A", expectedStored: "bolt-a" },
      { input: "Gear9", expectedStored: "gear9" },
      { input: "mint", expectedStored: "mint" },
    ], concept: "permanent_normalization" },

  { mission: 3, title: "The Initial Stamper",
    brief: "Every worker badge shows one capital initial. From any name — whatever its case — produce the first letter, uppercased, as a char.",
    skeleton: ["char initial = name§chain;", "display(initial);"],
    slots: [{ id: "chain", hint: "the chain", capacity: 1 }],
    palette: [
      { code: ".toUpperCase().charAt(0)", slot: "chain", correct: true },
      { code: ".charAt(0).toUpperCase()", slot: "chain", tag: "chain_order_type_error" },
      { code: ".toUpperCase()", slot: "chain", tag: "char_vs_string_type" },
      { code: ".charAt(0)", slot: "chain", tag: "no_normalization" },
    ],
    tests: [
      { input: "anjana", expectedValue: "'A'" },
      { input: "bit", expectedValue: "'B'" },
      { input: "Kai", expectedValue: "'K'" },
    ], concept: "chain_order_types" },

  { mission: 4, title: "The Uppercase Crier",
    brief: "The announcement horn prints every message in capitals, one character at a time. Build the crier loop.",
    skeleton: ["for (int i = 0; i < s.length(); i++) {", "    print(§expr);", "}"],
    slots: [{ id: "expr", hint: "character to print", capacity: 1 }],
    palette: [
      { code: "s.toUpperCase().charAt(i)", slot: "expr", correct: true },
      { code: "s.toUpperCase().charAt(0)", slot: "expr", tag: "fixed_index_in_loop" },
      { code: "s.charAt(i)", slot: "expr", tag: "no_normalization" },
      { code: "s.toUpperCase().charAt(i + 1)", slot: "expr", tag: "off_by_one_plus" },
    ],
    tests: [
      { input: "gala", expectedOutput: "GALA" },
      { input: "Ok!", expectedOutput: "OK!" },
      { input: "x", expectedOutput: "X" },
    ], concept: "loop_with_chain" },

  { mission: 5, title: "The Case-Blind Counter", blueprint: true,
    brief: "The Matcher counted 't' — but capital letters slipped past its net. Rebuild it to count every 'a', ANY case.",
    skeleton: ["int count = 0;", "§norm", "for (int i = 0; i < s.length(); i++) {", "    if (s.charAt(i) == 'a') {", "        count = count + 1;", "    }", "}", "display(count);"],
    slots: [{ id: "norm", hint: "normalize first", capacity: 1 }],
    palette: [
      { code: "s = s.toLowerCase();", slot: "norm", correct: true },
      { code: "s.toLowerCase();", slot: "norm", tag: "in_place_mutation_belief" },
      { code: "s = s.toUpperCase();", slot: "norm", tag: "normalized_wrong_direction_for_target" },
      { code: "(nothing)", slot: "norm", empty: true, tag: "no_normalization" },
    ],
    tests: [
      { input: "Banana", expectedValue: 3 },
      { input: "AVATAR", expectedValue: 3 },
      { input: "bit", expectedValue: 0 },
    ], concept: "normalize_before_processing" },

  { mission: 6, title: "The Mirror Test II", blueprint: true,
    brief: 'Your palindrome verifier called "Noon" a fake — one capital letter broke the mirror. Rebuild it case-blind. This is the final casting, Builder.',
    skeleton: ["s = §norm;", "boolean mirror = true;", "for (int i = 0; i < s.length(); i++) {", "    if (s.charAt(i) != s.charAt(s.length() - 1 - i)) {", "        mirror = false;", "    }", "}", "display(mirror);"],
    slots: [{ id: "norm", hint: "normalize", capacity: 1 }],
    palette: [
      { code: "s.toLowerCase()", slot: "norm" },
      { code: "s.toUpperCase()", slot: "norm" },
      { code: "s", slot: "norm", tag: "no_normalization" },
      { code: "s.toLowerCase", slot: "norm", tag: "property_vs_method_syntax", compileError: true },
    ],
    tests: [
      { input: "Noon", expectedValue: "true" },
      { input: "Level", expectedValue: "true" },
      { input: "Claw", expectedValue: "false" },
    ],
    postMissionNote: "Scanner taught you to COUNT. Claw taught you to REACH. Press taught you to TRANSFORM. Today you made them one machine. The mirror that failed \"Noon\" now sees clearly — and so do you, Builder.",
    concept: "normalized_palindrome_capstone" },
];

const MISCONCEPTION_FEEDBACK = {
  no_normalization: "The press never ran! Without normalizing, the case is whatever the input gave you. Press first, THEN work with the result.",
  inconsistent_normalization: "You normalized one direction... then targeted the other. It can never match! Normalize and target must AGREE — both low, or both HIGH.",
  chain_order_type_error: "charAt() hands you a char — a primitive, with no methods to call. The chain died at the dot. Press the STRING first, extract the char LAST.",
  char_vs_string_type: "charAt() returns a char — assigning a plain String result to a char variable won't compile. Extract with charAt() to get the char.",
  in_place_mutation_belief: "The UNSAVED puff — see it? The press worked, nobody saved it. Reassign the result back into the variable, or it never sticks.",
  result_discarded_confusion: "tmp holds a beautiful new value... and the mission asked you to save it into a DIFFERENT name. Save it where you were told to.",
  normalized_wrong_direction_for_target: "Zero, everywhere. You normalized one direction, then searched for the OTHER. You normalized AWAY from your own target.",
  fixed_index_in_loop: "Check the report — the same character over and over. charAt(0) inspects the same tile every pass. The moving part is i.",
  off_by_one_plus: "It printed the wrong slice and then crashed — i + 1 skips the first character AND overshoots the last. The loop variable is already correct: charAt(i).",
  property_vs_method_syntax: "After nine levels, the oldest trap of all — the missing parentheses. toLowerCase() is a METHOD. Some lessons guard the door forever.",
  method_direction_confusion: "Wrong direction — read the method name, it tells you which way the press stamps.",
};

export class Level33Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level33Scene" });
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
    this.normalizationChoices = {};
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
    this.miniTiles = [];
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
    cam.setBackgroundColor("#0d0a08");

    try { GameManager.incrementAttempt(32); } catch (_) {}

    this.createParticleTexture();
    this.createBackground();
    this.createGrandHall();
    this.createFoundryFloor();
    this.createCrucibleGlow();
    this.createAmbientParticles();
    this.createCodeCanvas();
    this.createBlockPalette();
    this.createRunButton();
    this.createRigWindow();
    this.createStations();
    this.createOutputTicker();
    this.createCounterDial();
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
    this.updateCrucible(time);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // SETUP — background & environment
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l33_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l33_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x0d0a08).setDepth(0);
  }

  createGrandHall() {
    const g = this.add.graphics().setDepth(1);
    [220, 460, 700, 940].forEach((x) => {
      g.lineStyle(2, 0x2a2016, 0.06);
      g.strokeRect(x - 45, 66, 90, 150);
      g.beginPath();
      g.arc(x, 66, 45, Math.PI, 0, false);
      g.strokePath();
      g.fillStyle(0xff9800, 0.012);
      g.fillRect(x - 45, 66, 90, 150);
    });
    [340, 820].forEach((x) => {
      g.fillStyle(0x141008, 1);
      g.lineStyle(1, C_AMBER, 0.1);
      g.fillRect(x - 13, 40, 26, 110);
      g.strokeRect(x - 13, 40, 26, 110);
    });
  }

  createFoundryFloor() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x12100b, 1);
    g.fillRect(0, 635, W, 85);
    g.lineStyle(1, 0x241d12, 0.3);
    g.strokeRect(150, 660, 120, 40);
    g.strokeRect(900, 660, 120, 40);
  }

  createCrucibleGlow() {
    this.crucibleCircles = [70, 110, 150].map((r, i) => this.add.circle(1260, 700, r, 0xff6f00, [0.025, 0.015, 0.008][i]).setDepth(1));
  }

  updateCrucible(time) {
    if (!this.crucibleCircles) return;
    const pulse = 1 + Math.sin(time * 0.0002) * 0.2;
    this.crucibleCircles.forEach((c) => c.setScale(pulse));
  }

  createAmbientParticles() {
    this.ambient = [];
    for (let i = 0; i < 10; i++) {
      const p = this.add.circle(Phaser.Math.Between(20, 1260), Phaser.Math.Between(0, 600), 1, C_AMBER, Phaser.Math.FloatBetween(0.02, 0.05)).setDepth(2);
      this.ambient.push(p);
    }
  }

  updateAmbient(time, delta) {
    if (!this.ambient) return;
    const step = 0.03 * (delta / 16.7);
    this.ambient.forEach((p, i) => {
      p.x += step; p.y -= step * 0.6;
      p.x += Math.sin(time * 0.0007 + i) * 0.03;
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

  // ══════════════════════════════════════════════════════════════
  // CODE CANVAS (Level 27/30 construction, reused verbatim)
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
    this.tabFilename = this.add.text(CX + CW - 12, CY + TAB_H / 2, "Foundry1.java", {
      font: "11px Courier New", color: "#546e7a",
    }).setOrigin(1, 0.5).setDepth(11);

    this.lineHighlight = this.add.rectangle(CX + CW / 2, 0, CW - 4, LINE_H, C_AMBER, 0.06).setDepth(19).setVisible(false);
    this.codeContainer = this.add.container(0, 0).setDepth(20);
  }

  _syntaxTokens(line) {
    const tokens = [];
    const re = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\bif\b|\belse\b|\bfor\b|\bint\b|\bchar\b|\bboolean\b|\bString\b)|([A-Za-z_]\w*(?=\())|(\.length\b)|(\b-?\d+\b)|(==|!=|<=|>=|\+=|\+\+|--)|([+\-=<>!])|([(){}\[\];.,])/g;
    let last = 0, m;
    const plain = (t) => t && tokens.push({ t, c: "#e0e0e0" });
    while ((m = re.exec(line))) {
      if (m.index > last) plain(line.slice(last, m.index));
      if (m[1]) tokens.push({ t: m[1], c: HEX_GREEN });
      else if (m[2]) tokens.push({ t: m[2], c: HEX_MAGENTA });
      else if (m[3]) tokens.push({ t: m[3], c: HEX_AMBER });
      else if (m[4]) tokens.push({ t: m[4], c: HEX_AMBER });
      else if (m[5]) tokens.push({ t: m[5], c: HEX_AMBER });
      else if (m[6]) tokens.push({ t: m[6], c: "#ff8a65" });
      else if (m[7]) tokens.push({ t: m[7], c: "#ff8a65" });
      else if (m[8]) tokens.push({ t: m[8], c: HEX_GRAY });
      last = m.index + m[0].length;
    }
    if (last < line.length) plain(line.slice(last));
    return tokens.length ? tokens : [{ t: line, c: "#e0e0e0" }];
  }

  renderSkeleton(mission) {
    this.codeContainer.removeAll(true);
    this.slotDefs = {};
    mission.slots.forEach((s) => { this.slotDefs[s.id] = { ...s, rect: null }; });

    mission.skeleton.forEach((rawLine, i) => {
      const y = CODE_Y0 + i * LINE_H;
      const numT = this.add.text(CX + 8, y, String(i + 1), { font: "12px Courier New", color: "#3d4450" });
      this.codeContainer.add(numT);

      const parts = rawLine.split(/§(\w+)/);
      let x = CODE_X;
      parts.forEach((part, pi) => {
        if (pi % 2 === 0) {
          if (!part) return;
          this._syntaxTokens(part).forEach((tok) => {
            const t = this.add.text(x, y, tok.t, { font: "bold 14px Courier New", color: tok.c });
            this.codeContainer.add(t);
            x += t.width;
          });
        } else {
          const slotId = part;
          const def = this.slotDefs[slotId];
          const w = 130;
          def.rect = { x, y: y - 2, w, h: 20 };
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
      const label = this.add.text(x + w / 2, y + h / 2, def.hint, { font: "italic 11px Courier New", color: "#3d4450" }).setOrigin(0.5).setDepth(22);
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
  // BLOCK PALETTE (Level 27/30 drag system, reused verbatim — including
  // the drag-lifecycle fix: a block is removed from its slot at
  // dragstart, before it can be dropped anywhere else, so re-dragging a
  // placed block never leaves a stale duplicate slotContents entry.)
  // ══════════════════════════════════════════════════════════════

  createBlockPalette() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0a0e14, 1);
    g.fillRoundedRect(PX, PY, PW, PH, 10);
    g.lineStyle(1, 0x1a2535, 1);
    g.strokeRoundedRect(PX, PY, PW, PH, 10);
    this.add.text(PX + 10, PY + 8, "CASTING BIN", { font: "bold 9px Arial", color: "#3d4450" }).setDepth(11);
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
      const style = { font: "bold 14px Courier New", color: HEX_CYAN };
      const measure = this.add.text(0, 0, def.code, style);
      const w = measure.width + 22;
      measure.destroy();
      if (x + w > maxX && row === 0) { row = 1; x = PX + 14; }
      const home = { x: x + w / 2, y: rowY[row] };
      x += w + 8;

      const c = this.add.container(home.x, home.y).setDepth(31);
      const bg = this.add.graphics();
      const draw = (stroke) => {
        bg.clear();
        bg.fillStyle(0x1e1e3a, 1);
        bg.fillRoundedRect(-w / 2, -16, w, 32, 8);
        bg.lineStyle(2, stroke, 1);
        bg.strokeRoundedRect(-w / 2, -16, w, 32, 8);
      };
      draw(C_CYAN);
      const txt = this.add.text(0, 0, def.code, style).setOrigin(0.5);
      c.add([bg, txt]);
      c.setSize(w, 32);
      c.setData("w", w);
      c.setData("code", def.code);
      c.setData("tag", def.tag || null);
      c.setData("compileError", !!def.compileError);
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
      out[id] = (this.slotContents[id] || []).map((b) => ({ code: b.container.getData("code"), tag: b.container.getData("tag"), compileError: b.container.getData("compileError") }));
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
  // RIG WINDOW + PRODUCTION LINE STATIONS
  // ══════════════════════════════════════════════════════════════

  createRigWindow() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x080a10, 1);
    g.fillRoundedRect(OX, OY, OW, OH, 12);
    g.lineStyle(3, 0x21262d, 1);
    g.strokeRoundedRect(OX, OY, OW, OH, 12);
    this.add.text(OX + OW / 2, OY + OH + 12, "PRODUCTION LINE — LIVE", { font: "bold 9px Arial", color: "#3d4450" }).setOrigin(0.5).setDepth(11);

    const maskShape = this.make.graphics({ x: 0, y: 0, add: false });
    maskShape.fillRoundedRect(OX + 4, OY + 4, OW - 8, OH - 8, 10);
    this.windowMask = maskShape.createGeometryMask();
    this.rigLayer = this.add.container(0, 0).setDepth(15);
    this.rigLayer.setMask(this.windowMask);

    this.verdictLamp = this.add.circle(OX + OW - 18, OY + 14, 6, C_GRAY).setDepth(20);
  }

  createStations() {
    // three small station icons; each glows when its machine is active
    this.stationCase = this._buildStationIcon(STATION_CASE_X, STATION_Y, "case");
    this.stationPress = this._buildStationIcon(STATION_PRESS_X, STATION_Y, "press");
    this.stationClaw = this._buildStationIcon(STATION_CLAW_X, STATION_Y, "claw");

    // shared tile row — represents whichever string is currently "in play"
    this.tileRowContainer = this.add.container(0, 0);
    this.rigLayer.add([this.stationCase.c, this.stationPress.c, this.stationClaw.c, this.tileRowContainer]);
  }

  _buildStationIcon(x, y, kind) {
    const c = this.add.container(x, y).setDepth(1);
    const glow = this.add.circle(0, 0, 22, C_CYAN, 0);
    const g = this.add.graphics();
    g.lineStyle(1.5, 0x4a4468, 1);
    if (kind === "case") {
      g.strokeRoundedRect(-16, -12, 32, 24, 4);
      g.lineStyle(1, C_CYAN, 0.5);
      g.strokeRect(-6, -4, 6, 6);
    } else if (kind === "press") {
      g.strokeRect(-14, -14, 6, 28);
      g.strokeRect(8, -14, 6, 28);
      g.fillStyle(0x4a4468, 1);
      g.fillRect(-10, -18, 20, 6);
    } else {
      g.beginPath(); g.arc(-4, 4, 8, Phaser.Math.DegToRad(-40), Phaser.Math.DegToRad(80), false); g.strokePath();
      g.beginPath(); g.arc(4, 4, 8, Phaser.Math.DegToRad(100), Phaser.Math.DegToRad(220), false); g.strokePath();
    }
    const label = this.add.text(0, 22, kind.toUpperCase(), { font: "8px Arial", color: "#546e7a" }).setOrigin(0.5);
    c.add([glow, g, label]);
    return { c, glow, g, active: false };
  }

  _setStationActive(station, active, color = C_CYAN) {
    station.active = active;
    this.tweens.killTweensOf(station.glow);
    if (active) station.glow.setFillStyle(color, station.glow.fillAlpha);
    this.tweens.add({ targets: station.glow, fillAlpha: active ? 0.25 : 0, duration: 150 });
  }

  buildMiniTileRow(str, indexPlates = false) {
    this.tileRowContainer.removeAll(true);
    this.miniTiles = [];
    const n = Math.max(str.length, 1);
    const tw = Math.min(28, Math.max(14, Math.floor((OW - 40) / n) - 3));
    const totalW = str.length * (tw + 3) - 3;
    const startX = OX + OW / 2 - totalW / 2;
    str.split("").forEach((ch, i) => {
      const x = startX + i * (tw + 3) + tw / 2;
      const container = this.add.container(x, TILE_ROW_Y);
      const meta = this._charMeta(ch);
      const body = this.add.graphics();
      const drawBody = (stroke) => { body.clear(); body.fillStyle(0x0d1117, 1); body.fillRoundedRect(-tw / 2, -17, tw, 34, 3); body.lineStyle(1.5, stroke, 1); body.strokeRoundedRect(-tw / 2, -17, tw, 34, 3); };
      drawBody(0x2a3a4a);
      const charText = this.add.text(0, -3, meta.display, { font: "bold 11px Courier New", color: meta.color }).setOrigin(0.5);
      container.add([body, charText]);
      if (indexPlates) {
        const plateText = this.add.text(0, 12, String(i), { font: "bold 8px Courier New", color: HEX_AMBER }).setOrigin(0.5);
        container.add(plateText);
      }
      this.tileRowContainer.add(container);
      this.miniTiles.push({ container, body, drawBody, charText, x, index: i, ch, tw });
    });
  }

  flashTilePair(i, j, match) {
    [i, j].forEach((idx) => {
      const t = this.miniTiles[idx];
      if (!t) return;
      t.drawBody(match ? C_CYAN : C_RED);
      this.time.delayedCall(180, () => { if (t.container.active) t.drawBody(0x2a3a4a); });
    });
  }

  miniClawCrash(x) {
    this.verdictLamp.setFillStyle(C_RED);
    const dust = this.add.particles(x, TILE_ROW_Y, "l33_dot", {
      speed: { min: 15, max: 35 }, angle: { min: 0, max: 360 }, scale: { start: 0.3, end: 0 }, lifespan: 220, tint: 0x78909c, emitting: false,
    }).setDepth(1);
    this.rigLayer.add(dust);
    dust.explode(2);
    this.time.delayedCall(300, () => dust.destroy());
    this.screenShake(0.003, 130);
  }

  miniUnsavedPuff() {
    const puff = this.add.text(STATION_PRESS_X, STATION_Y - 30, "UNSAVED", { font: "bold 8px Arial", color: HEX_RED }).setOrigin(0.5).setAlpha(0);
    this.rigLayer.add(puff);
    this.tweens.add({ targets: puff, alpha: 1, y: STATION_Y - 40, duration: 300 });
    this.time.delayedCall(500, () => this.tweens.add({ targets: puff, alpha: 0, duration: 300, onComplete: () => puff.destroy() }));
  }

  createOutputTicker() {
    const g = this.add.graphics().setDepth(16);
    g.fillStyle(0x0a0e14, 1);
    g.fillRect(OX + 10, TICKER_Y - 13, OW - 20, 26);
    this.rigLayer.add(g);
    this.tickerText = this.add.text(OX + 18, TICKER_Y, "", { font: "bold 13px Courier New", color: HEX_GREEN }).setOrigin(0, 0.5).setDepth(17);
    this.rigLayer.add(this.tickerText);
    this.tickerCursor = this.add.rectangle(OX + 18, TICKER_Y, 6, 14, C_GREEN).setOrigin(0, 0.5).setDepth(17);
    this.rigLayer.add(this.tickerCursor);
    this.tweens.add({ targets: this.tickerCursor, alpha: 0, duration: 500, yoyo: true, repeat: -1 });
  }

  pushTicker(ch) {
    this.tickerText.setText(this.tickerText.text + ch);
    this.tickerCursor.setX(OX + 18 + this.tickerText.width + 2);
  }

  clearTicker() {
    this.tickerText.setText("");
    this.tickerCursor.setX(OX + 18);
  }

  createCounterDial() {
    const c = this.add.container(OX + OW / 2, TICKER_Y).setDepth(16).setVisible(false);
    const g = this.add.graphics();
    g.lineStyle(2, C_AMBER, 1);
    g.strokeCircle(0, 0, 14);
    c.add(g);
    const t = this.add.text(0, 0, "0", { font: "bold 13px Courier New", color: HEX_AMBER }).setOrigin(0.5);
    c.add(t);
    this.rigLayer.add(c);
    this.counterDial = { c, t, g };
  }

  showCounterDial(show) {
    this.counterDial.c.setVisible(show);
    this.tickerText.setVisible(!show);
    this.tickerCursor.setVisible(!show);
  }

  tickCounterDial(value) {
    this.counterDial.t.setText(String(value));
    this.tweens.add({ targets: this.counterDial.c, scale: 1.2, duration: 100, yoyo: true });
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

  buildReportRows(tests) {
    this.reportRows.forEach((r) => r.container.destroy());
    this.reportRows = [];
    tests.forEach((test, i) => {
      const y = RY + 24 + i * 24;
      const c = this.add.container(RX + 10, y).setDepth(11).setAlpha(0.35);
      const inputT = this.add.text(0, 0, `"${test.input}"`, { font: "12px Courier New", color: "#b0bec5" }).setOrigin(0, 0.5);
      const arrow = this.add.text(150, 0, "→", { font: "12px Arial", color: HEX_GRAY }).setOrigin(0, 0.5);
      const expected = test.expected ?? test.expectedValue ?? test.expectedOutput ?? test.expectedStored;
      const expT = this.add.text(170, 0, String(expected), { font: "12px Courier New", color: HEX_GRAY }).setOrigin(0, 0.5);
      const actualT = this.add.text(300, 0, "?", { font: "12px Courier New", color: HEX_GRAY }).setOrigin(0, 0.5);
      const statusT = this.add.text(RW - 24, 0, "…", { font: "14px Arial", color: HEX_GRAY }).setOrigin(0.5);
      c.add([inputT, arrow, expT, actualT, statusT]);
      this.reportRows.push({ container: c, actualT, statusT });
    });
  }

  updateReportRow(index, actualText, match) {
    const row = this.reportRows[index];
    if (!row) return;
    row.container.setAlpha(1);
    row.actualT.setText(actualText).setColor(match ? HEX_GREEN : HEX_RED);
    row.statusT.setText(match ? "✓" : "✗").setColor(match ? HEX_GREEN : HEX_RED);
    if (!match) this.tweens.add({ targets: row.container, x: row.container.x + 4, duration: 40, yoyo: true, repeat: 5 });
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
    const brief = this.add.text(BX + 14, BY + 42, mission.brief, { font: "12px Arial", color: "#90a4ae", wordWrap: { width: BW - 28 } }).setOrigin(0, 0);
    const hint = this.add.text(BX + BW - 12, BY + BH - 12, "HINT", { font: "bold 11px Arial", color: "#546e7a" }).setOrigin(1, 1).setInteractive({ useHandCursor: true });
    hint.on("pointerover", () => hint.setColor(HEX_AMBER));
    hint.on("pointerout", () => hint.setColor("#546e7a"));
    hint.on("pointerdown", () => this.onHintPressed());
    this.briefContainer.add([badge, badgeNum, title, brief, hint]);
    if (mission.blueprint) {
      const scroll = this.add.text(BX + BW - 14, BY + 14, "📜", { font: "16px Arial" }).setOrigin(1, 0.5).setAlpha(0.8);
      this.briefContainer.add(scroll);
    }
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

    this.add.text(20, 14, "THE FOUNDRY", { font: "bold 13px Arial", color: "#b0bec5" }).setDepth(51);
    this.add.text(20, 32, "Restructuring Phase — String Methods: toUpperCase() / toLowerCase()", { font: "10px Arial", color: "#546e7a" }).setDepth(51);

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
      if (i < this.currentMission) { g.fillStyle(C_AMBER, 1); this._drawHexPath(g, x, y, 9); g.fillPath(); }
      else if (i === this.currentMission) { g.lineStyle(2, C_AMBER, 1); this._drawHexPath(g, x, y, 9); g.strokePath(); }
      else { g.lineStyle(1, C_GRAY, 1); this._drawHexPath(g, x, y, 9); g.strokePath(); }
    });
    if (this.missionHexes[this.currentMission]) {
      const m = this.missionHexes[this.currentMission];
      if (m.pulse) m.pulse.stop();
      m.pulse = this.tweens.add({ targets: m.g, alpha: 0.5, duration: 600, yoyo: true, repeat: -1 });
    }
  }

  // ══════════════════════════════════════════════════════════════
  // BIT — foundry master variant
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
    goggles.strokeCircle(-9, -26, 4);
    goggles.strokeCircle(9, -26, 4);
    goggles.lineBetween(-5, -26, 5, -26);
    const clip = this.add.graphics();
    clip.lineStyle(1, 0xb0bec5, 1);
    clip.strokeRoundedRect(20, -6, 12, 16, 2);
    clip.lineBetween(23, -2, 29, -2);
    clip.lineBetween(23, 2, 29, 2);
    c.add([g, goggles, tip, eye, pupil, clip]);
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
    if (done) this.time.delayedCall(300, () => this.showProjectBriefing(0));
    else this.runTutorial();
  }

  async runTutorial() {
    const A = () => this._alive;
    await this.delay(400); if (!A()) return;
    await this.bitSay("The Foundry, Builder. Scanner, claw, and press — one line, YOUR code at the controls. Today we don't just build new machines... we REBUILD old ones, better.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();

    const a1 = this.createAnnotation(STATION_CASE_X, STATION_Y - 40, "the original — sealed, as ever", HEX_CYAN, { x: STATION_CASE_X, y: STATION_Y - 22 });
    await this.delay(350); if (!A()) return;
    const a2 = this.createAnnotation(STATION_PRESS_X, STATION_Y - 40, "case calls run here", HEX_ORANGE, { x: STATION_PRESS_X, y: STATION_Y - 22 });
    await this.delay(350); if (!A()) return;
    const a3 = this.createAnnotation(STATION_CLAW_X, STATION_Y - 40, "charAt calls run here", HEX_PURPLE, { x: STATION_CLAW_X, y: STATION_Y - 22 });
    await this.delay(350); if (!A()) return;
    const a4 = this.createAnnotation(OX + OW / 2, TICKER_Y - 24, "output lands here", HEX_GREEN, { x: OX + OW / 2, y: TICKER_Y - 14 });
    await this.delay(350); if (!A()) return;

    await this.bitSay("The pro secret you're about to learn: NORMALIZE first, then work. Lowercase everything — or uppercase everything — and case can never betray you again. Build!");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();
    [a1, a2, a3, a4].forEach((a) => this.tweens.add({ targets: a, alpha: 0, duration: 250, onComplete: () => a.destroy() }));

    try { localStorage.setItem(TUTORIAL_KEY, "true"); } catch (_) {}
    this.showProjectBriefing(0);
  }

  createAnnotation(x, y, text, colorHex, arrowTarget = null) {
    const c = this.add.container(0, 0).setDepth(70).setAlpha(0);
    const txt = this.add.text(x, y, text, { font: "bold 11px Arial", color: colorHex }).setOrigin(0.5);
    c.add(txt);
    if (arrowTarget) {
      const g = this.add.graphics();
      const color = Phaser.Display.Color.HexStringToColor(colorHex).color;
      g.lineStyle(2, color, 1);
      g.lineBetween(arrowTarget.x, y + 8, arrowTarget.x, arrowTarget.y - 6);
      g.fillStyle(color, 1);
      g.fillTriangle(arrowTarget.x, arrowTarget.y, arrowTarget.x - 4, arrowTarget.y - 7, arrowTarget.x + 4, arrowTarget.y - 7);
      c.add(g);
    }
    this.tweens.add({ targets: c, alpha: 1, duration: 300 });
    return c;
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
    g.lineStyle(2, C_AMBER, 1);
    g.strokeRoundedRect(-260, -105, 520, 210, 12);
    g.fillStyle(C_AMBER, 1);
    g.fillRect(-260, -105, 5, 210);
    const badge = this.add.circle(-225, -75, 18, C_AMBER);
    const badgeNum = this.add.text(-225, -75, String(mission.mission), { font: "bold 16px Arial", color: "#0a0e14" }).setOrigin(0.5);
    const title = this.add.text(-195, -85, mission.title, { font: "bold 20px Arial", color: "#ffffff" }).setOrigin(0, 0.5);
    const blueprintTag = mission.blueprint
      ? this.add.text(-195, -60, "📜 BLUEPRINT REOPENED", { font: "bold 10px Arial", color: HEX_AMBER }).setOrigin(0, 0.5)
      : null;
    const desc = this.add.text(-225, -35, mission.brief, { font: "13px Arial", color: "#b0bec5", wordWrap: { width: 460 } }).setOrigin(0, 0);

    const startBtn = this.add.container(0, 85).setDepth(1);
    const sg = this.add.graphics();
    sg.fillStyle(C_AMBER, 1);
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

    const children = [g, badge, badgeNum, title, desc, startBtn];
    if (blueprintTag) children.splice(4, 0, blueprintTag);
    card.add(children);
    this.tweens.add({ targets: card, y: 335, duration: 400, ease: "Back.easeOut" });
  }

  startMission(mission) {
    this.slotContents = {};
    this.slotDefs = {};
    this.missionRunsFailed = 0;
    this.missionHintUsed = false;
    this.missionStartTime = this.time.now;
    this._runCountAtMissionStart = this.runCount;
    this.clearMission();

    this.tabFilename.setText(`Foundry${mission.mission}.java`);
    this.renderSkeleton(mission);
    this.populatePalette(mission);
    this.buildReportRows(mission.tests);
    this.renderMissionBrief(mission);
    this.showCounterDial(mission.mission === 5);
    this.disableRunButton();
    this.highlightCodeLine(null);
    this.verdictLamp.setFillStyle(C_GRAY);
    this.clearTicker();
    this.buildMiniTileRow(mission.tests[0].input || "", true);
    [this.stationCase, this.stationPress, this.stationClaw].forEach((s) => this._setStationActive(s, false));
  }

  clearMission() {
    this.missionElements.forEach((e) => { if (e && e.destroy) e.destroy(); });
    this.missionElements = [];
  }

  // ══════════════════════════════════════════════════════════════
  // GENUINE INTERPRETER — per-mission, type-tracking through chains
  // ══════════════════════════════════════════════════════════════

  _evalIndexExpr(expr, i, len) {
    expr = expr.trim();
    if (/^-?\d+$/.test(expr)) return parseInt(expr, 10);
    if (expr === "i") return i;
    if ((expr.match(/^s\.length\(\)\s*-\s*1\s*-\s*i$/))) return len - 1 - i;
    if ((expr.match(/^\w+\.length\(\)\s*-\s*(\d+)$/))) { const m = expr.match(/^\w+\.length\(\)\s*-\s*(\d+)$/); return len - parseInt(m[1], 10); }
    if (/^\w+\.length\(\)$/.test(expr)) return len;
    return NaN;
  }

  _charAtSafe(str, idx) {
    if (idx < 0 || idx >= str.length || Number.isNaN(idx)) return { crash: true, index: idx };
    return { crash: false, ch: str[idx] };
  }

  /** Resolves a normalization/chain block into {mode:'upper'|'lower'|null, empty, compileError, tag}. */
  _classifyNormBlock(code) {
    if (code === ".toLowerCase()" || code === "s.toLowerCase()" || code === "label.toLowerCase()") return { mode: "lower" };
    if (code === ".toUpperCase()" || code === "s.toUpperCase()") return { mode: "upper" };
    if (code === "(nothing)") return { empty: true };
    if (code === "s") return { mode: null };
    if (code === "s.toLowerCase") return { compileError: true, message: "toLowerCase without parentheses isn't a method call — it's not valid Java." };
    return { mode: null };
  }

  _interpretMission1(blocks, input) {
    const normBlock = blocks.norm[0];
    const chBlock = blocks.ch[0];
    if (chBlock.code.startsWith('"')) return { compileError: true, message: "charAt() returns a char — it can't == a String. Use single quotes." };
    const norm = this._classifyNormBlock(normBlock.code);
    const normalized = norm.mode ? (norm.mode === "upper" ? input.toUpperCase() : input.toLowerCase()) : input;
    const r = this._charAtSafe(normalized, 0);
    if (r.crash) return { crash: true, index: 0 };
    const chVal = chBlock.code.replace(/'/g, "");
    const branch = r.ch === chVal ? "open" : "deny";
    return { value: branch, normMode: norm.mode, chVal, trace: { normalized } };
  }

  _interpretMission2(blocks, input) {
    const lhsBlock = blocks.lhs[0];
    const result = input.toLowerCase();
    if (lhsBlock.code === "label =") return { value: result, stored: result, saved: true };
    if (lhsBlock.code === "(nothing)") return { value: result, stored: input, saved: false, discarded: true };
    return { value: result, stored: input, saved: false, captured: "tmp" }; // String tmp =
  }

  _interpretMission3(blocks, input) {
    const chainCode = blocks.chain[0].code;
    const calls = [...chainCode.matchAll(/\.(\w+)\(([^)]*)\)/g)].map((m) => ({ method: m[1], args: m[2] }));
    let type = "string", value = input;
    for (const call of calls) {
      if (call.method === "toUpperCase" || call.method === "toLowerCase") {
        if (type !== "string") return { compileError: true, message: "charAt() hands you a char — a char has no methods. The chain died here.", tagOverride: "chain_order_type_error" };
        value = call.method === "toUpperCase" ? value.toUpperCase() : value.toLowerCase();
        type = "string";
      } else if (call.method === "charAt") {
        if (type !== "string") return { compileError: true, message: "You can't call charAt() on a char — only Strings have that method." };
        const idx = parseInt(call.args, 10);
        const r = this._charAtSafe(value, idx);
        if (r.crash) return { crash: true, index: idx };
        value = r.ch; type = "char";
      }
    }
    if (type !== "char") return { compileError: true, message: "char initial = ... requires a char on the right — this expression is still a String." };
    return { value: `'${value}'` };
  }

  _interpretMission4(blocks, input) {
    const exprCode = blocks.expr[0].code;
    const len = input.length;
    const upper = input.toUpperCase();
    let output = "";
    for (let i = 0; i < len; i++) {
      let idx;
      if (exprCode === "s.toUpperCase().charAt(i)") idx = i;
      else if (exprCode === "s.toUpperCase().charAt(0)") idx = 0;
      else if (exprCode === "s.charAt(i)") { const r = this._charAtSafe(input, i); if (r.crash) return { crash: true, index: i, output }; output += r.ch; continue; }
      else if (exprCode === "s.toUpperCase().charAt(i + 1)") idx = i + 1;
      else idx = i;
      const r = this._charAtSafe(upper, idx);
      if (r.crash) return { crash: true, index: idx, output };
      output += r.ch;
    }
    return { value: output };
  }

  _interpretMission5(blocks, input) {
    const normBlock = blocks.norm[0];
    const norm = this._classifyNormBlock(normBlock.code);
    let working = input;
    let pressRan = false, discarded = false;
    if (normBlock.code === "s.toLowerCase();") { pressRan = true; discarded = true; /* result thrown away, working unchanged */ }
    else if (norm.empty) { /* skipped entirely */ }
    else if (norm.mode) { pressRan = true; working = norm.mode === "upper" ? input.toUpperCase() : input.toLowerCase(); }
    let count = 0;
    for (let i = 0; i < working.length; i++) if (working[i] === "a") count++;
    return { value: count, pressRan, discarded, working };
  }

  _interpretMission6(blocks, input) {
    const normBlock = blocks.norm[0];
    const norm = this._classifyNormBlock(normBlock.code);
    if (norm.compileError) return { compileError: true, message: norm.message };
    const s = norm.mode ? (norm.mode === "upper" ? input.toUpperCase() : input.toLowerCase()) : input;
    let mirror = true;
    for (let i = 0; i < s.length; i++) {
      const twinIdx = s.length - 1 - i;
      const r1 = this._charAtSafe(s, i), r2 = this._charAtSafe(s, twinIdx);
      if (r1.crash || r2.crash) return { crash: true, index: r1.crash ? i : twinIdx };
      if (r1.ch !== r2.ch) mirror = false;
    }
    return { value: mirror ? "true" : "false", normMode: norm.mode, normalized: s };
  }

  interpretForTest(mission, blocks, input) {
    switch (mission.mission) {
      case 1: return this._interpretMission1(blocks, input);
      case 2: return this._interpretMission2(blocks, input);
      case 3: return this._interpretMission3(blocks, input);
      case 4: return this._interpretMission4(blocks, input);
      case 5: return this._interpretMission5(blocks, input);
      case 6: return this._interpretMission6(blocks, input);
      default: return { compileError: true, message: "Unknown mission." };
    }
  }

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
  // RUN
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

    const probe = this.interpretForTest(mission, assembled, mission.tests[0].input);
    if (probe.compileError) {
      const tag = probe.tagOverride || (wrongBlocksUsed[0] && wrongBlocksUsed[0].tag);
      await this.showCompileError(probe);
      if (!this._alive) return;
      this._resolveRunOutcome(mission, "compile_fail", wrongBlocksUsed, [], { tag });
      return;
    }

    let anyMismatch = false, anyCrash = false;
    const failedTests = [];
    for (let i = 0; i < mission.tests.length; i++) {
      if (!this._alive) return;
      const test = mission.tests[i];
      const result = this.interpretForTest(mission, assembled, test.input);
      const outcome = await this.runTestCase(mission, test, i, result);
      if (!outcome.match) { anyMismatch = true; failedTests.push(test.input); }
      if (result.crash) anyCrash = true;
    }

    let resultKind = "pass";
    if (anyCrash) resultKind = "runtime_crash";
    else if (anyMismatch) resultKind = "logic_fail";

    if (resultKind === "pass") {
      // record normalization convention choice for dual-solution missions
      if (mission.mission === 1) {
        const norm = assembled.norm[0].code;
        this.normalizationChoices.mission1 = norm.includes("Lower") ? "lower" : "upper";
      } else if (mission.mission === 6) {
        const norm = assembled.norm[0].code;
        this.normalizationChoices.mission6 = norm.includes("Lower") ? "lower" : "upper";
      }
    }
    this._resolveRunOutcome(mission, resultKind, wrongBlocksUsed, failedTests, null);
  }

  async showCompileError(err) {
    const stamp = this.add.text(CX + CW / 2, CY + CH / 2, "COMPILE ERROR", { font: "bold 30px Arial", color: HEX_RED }).setOrigin(0.5).setDepth(80).setScale(2).setAngle(-8).setAlpha(0);
    this.missionElements.push(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 250, ease: "Cubic.easeOut" });
    this.screenShake(0.006, 200);
    await this.delay(300);
    if (!this._alive) return;
    const msg = this.add.text(CX + CW / 2, CY + CH - 30, err.message, { font: "bold 12px Arial", color: HEX_RED, wordWrap: { width: CW - 40 } }).setOrigin(0.5).setDepth(80).setAlpha(0);
    this.missionElements.push(msg);
    this.tweens.add({ targets: msg, alpha: 1, duration: 250 });
    await this.delay(700);
  }

  async runTestCase(mission, test, index, result) {
    const indexPlates = mission.mission === 4 || mission.mission === 6;
    this.buildMiniTileRow(test.input, indexPlates);
    this.clearTicker();
    this.verdictLamp.setFillStyle(C_AMBER);
    [this.stationCase, this.stationPress, this.stationClaw].forEach((s) => this._setStationActive(s, false));
    this._setStationActive(this.stationCase, true, C_CYAN);
    await this.delay(150);
    if (!this._alive) return { match: false };

    if (result.compileError) return { match: false };

    let actualDisplay, match;
    const lineForMission = { 1: 0, 2: 0, 3: 0, 4: 1, 5: 3, 6: 3 }[mission.mission];
    this.highlightCodeLine(lineForMission);

    if (result.crash) {
      this._setStationActive(this.stationClaw, true, C_RED);
      const tile = this.miniTiles[Math.min(result.index, this.miniTiles.length - 1)];
      this.miniClawCrash(tile ? tile.x : OX + OW / 2);
      actualDisplay = `IndexOutOfBounds(${result.index})`;
      match = false;
    } else {
      await this.playVisual(mission, test, result);
      if (test.expectedOutput !== undefined) { actualDisplay = this.tickerText.text; match = actualDisplay === test.expectedOutput; }
      else if (test.expectedStored !== undefined) { actualDisplay = result.stored; match = result.stored === test.expectedStored; }
      else if (test.expectedValue !== undefined) { actualDisplay = String(result.value); match = String(result.value) === String(test.expectedValue); }
      else { actualDisplay = result.value; match = result.value === test.expected; }
      this.verdictLamp.setFillStyle(match ? C_GREEN : C_RED);
    }

    this.highlightCodeLine(null);
    this.updateReportRow(index, actualDisplay, match);
    await this.delay(200);
    return { match };
  }

  async playVisual(mission, test, result) {
    const input = test.input;
    if (mission.mission === 1) {
      if (result.normMode) { this._setStationActive(this.stationPress, true, result.normMode === "upper" ? C_CYAN : C_ORANGE); await this.delay(150); }
      this._setStationActive(this.stationClaw, true, C_PURPLE);
      if (this.miniTiles[0]) this.miniTiles[0].drawBody(C_CYAN);
      await this.delay(150);
    } else if (mission.mission === 2) {
      if (result.saved || result.captured) { this._setStationActive(this.stationPress, true, C_ORANGE); await this.delay(150); }
      if (!result.saved) this.miniUnsavedPuff();
      await this.delay(150);
    } else if (mission.mission === 3) {
      this._setStationActive(this.stationPress, true, C_CYAN);
      await this.delay(150);
      this._setStationActive(this.stationClaw, true, C_PURPLE);
      if (this.miniTiles[0]) this.miniTiles[0].drawBody(C_MAGENTA);
      await this.delay(150);
    } else if (mission.mission === 4) {
      this._setStationActive(this.stationPress, true, C_CYAN);
      await this.delay(100);
      this._setStationActive(this.stationClaw, true, C_PURPLE);
      for (let i = 0; i < result.output.length; i++) {
        if (!this._alive) return;
        const tile = this.miniTiles[i];
        if (tile) tile.drawBody(C_CYAN);
        this.pushTicker(result.output[i]);
        await this.delay(60);
      }
    } else if (mission.mission === 5) {
      if (result.pressRan) { this._setStationActive(this.stationPress, true, result.discarded ? C_RED : C_ORANGE); await this.delay(150); if (result.discarded) this.miniUnsavedPuff(); }
      this._setStationActive(this.stationClaw, true, C_PURPLE);
      let count = 0;
      this.counterDial.t.setText("0");
      for (let i = 0; i < result.working.length; i++) {
        if (!this._alive) return;
        const tile = this.miniTiles[i];
        const isMatch = result.working[i] === "a";
        if (tile) tile.drawBody(isMatch ? C_GREEN : 0x2a3a4a);
        if (isMatch) { count++; this.tickCounterDial(count); }
        await this.delay(45);
      }
    } else if (mission.mission === 6) {
      this._setStationActive(this.stationPress, true, result.normMode === "upper" ? C_CYAN : C_ORANGE);
      await this.delay(150);
      this._setStationActive(this.stationClaw, true, C_PURPLE);
      const s = result.normalized || input;
      for (let i = 0; i < s.length; i++) {
        if (!this._alive) return;
        const twinIdx = s.length - 1 - i;
        const match = s[i] === s[twinIdx];
        this.flashTilePair(i, twinIdx, match);
        await this.delay(70);
      }
    }
  }

  // ══════════════════════════════════════════════════════════════
  // EVALUATION / FEEDBACK
  // ══════════════════════════════════════════════════════════════

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

    const feedbackTag = (wrongBlocksUsed[0] && wrongBlocksUsed[0].tag) || (compileErr && compileErr.tag) || null;

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
      1: "Normalize the badge, then compare against a character in the SAME case you normalized to.",
      2: "The mission says to make the change stick to the variable named in the mission — save it there.",
      3: "Press the whole String first, THEN extract the single character. Order decides the type.",
      4: "The loop variable i should be the moving part of your index — inside the parentheses that follow the case conversion.",
      5: "Whatever case you convert to, that's the case you must search for.",
      6: "Reassign s to its normalized form BEFORE the mirror check begins.",
    };
    this.showBitFeedback(hints[mission.mission] || "Reread the brief carefully — the answer is in the wording.");
  }

  onMissionComplete() {
    if (this.gameEnded) return;
    const flawless = this.missionRunsFailed === 0 && !this.missionHintUsed;
    if (flawless) this.flawlessCount++;
    this.updateScore(250 + (flawless ? 100 : 0));
    if (flawless) this.createFloatingText(OX + OW / 2, OY + 30, "FLAWLESS +100", HEX_AMBER, "bold 16px Arial");

    this.missionFanfare().then(() => {
      if (!this._alive || this.gameEnded) return;
      const next = this.currentMission + 1;
      if (next >= MISSIONS.length) this.levelComplete();
      else this.showProjectBriefing(next);
    });
  }

  async missionFanfare() {
    this.verdictLamp.setFillStyle(C_GREEN);
    this.createConfetti(OX + OW / 2, OY + OH / 2);
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
    if (mission.blueprint) await this.blueprintUpgradeStamp();
    await this.bitSay(mission.postMissionNote || "Nice work — the rig confirms it's correct!");
    await Promise.race([this.waitForClick(), this.delay(2500)]);
    this.hideBubble();
    await this.delay(400);
  }

  async blueprintUpgradeStamp() {
    const stamp = this.add.text(BX + BW - 40, BY + 14, "UPGRADED", {
      font: "bold 11px Arial", color: HEX_AMBER,
    }).setOrigin(0.5).setScale(2).setAngle(-8).setAlpha(0).setDepth(15);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 250, ease: "Cubic.easeOut" });
    await this.delay(500);
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
    this.tweens.add({ targets: t, y: y - 30, alpha: 0, duration: 900, ease: "Cubic.easeOut", onComplete: () => t.destroy() });
    return t;
  }

  createConfetti(x, y, count = 26) {
    const p = this.add.particles(x, y, "l33_dot", {
      speed: { min: 80, max: 240 }, angle: { min: 0, max: 360 }, scale: { start: 0.9, end: 0 }, lifespan: 500,
      tint: [C_CYAN, C_AMBER, C_GREEN, C_PURPLE, 0xffffff], emitting: false,
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
    this.verdictLamp.setFillStyle(0x333333);
    [this.stationCase, this.stationPress, this.stationClaw].forEach((s) => this._setStationActive(s, false));

    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
    this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });

    const title = this.add.text(640, 240, "CASTING FAILED", { font: "bold 40px Arial", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
    this.tweens.add({
      targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut",
      onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }),
    });
    this.add.text(640, 310, `Score: ${this.score}`, { font: "20px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
    this.add.text(640, 350, `Missions Completed: ${this.currentMission} / ${MISSIONS.length}`, { font: "16px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);

    this._makeButton(640, 420, "RELIGHT THE CRUCIBLE", 240, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearMission();
    this.hideBubble();

    try { GameManager.completeLevel(32, Math.round((this.flawlessCount / MISSIONS.length) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("case_methods_mastery"); } catch (_) {}
    try {
      localStorage.setItem("level33_results", JSON.stringify({
        level: 33, concept: "string_case_methods", phase: "restructuring",
        score: this.score, missionsCompleted: 6, flawlessMissions: this.flawlessCount,
        totalRuns: this.runCount, failedRuns: this.failedRunCount, hintsUsed: this.hintCount,
        selfCorrections: this.selfCorrectionCount, normalizationChoices: this.normalizationChoices,
        livesRemaining: this.lives, attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.wingSealCeremony().then(() => { if (this._alive) this.showScoreTally(); });
  }

  async wingSealCeremony() {
    for (let i = 0; i < 6; i++) {
      if (!this._alive) return;
      const stations = [this.stationCase, this.stationPress, this.stationClaw];
      this._setStationActive(stations[i % 3], true, i % 2 === 0 ? C_CYAN : C_ORANGE);
      await this.delay(90);
    }
    this.createConfetti(OX + OW / 2, OY + OH / 2, 40);
    await this.delay(600);
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
    panel.fillStyle(0x141008, 1);
    panel.fillRoundedRect(340, 100, 600, 520, 16);
    panel.lineStyle(2, C_AMBER, 1);
    panel.strokeRoundedRect(340, 100, 600, 520, 16);

    const title = this.add.text(640, 145, "FOUNDRY MASTER", { font: "bold 36px Arial", color: HEX_GREEN }).setOrigin(0.5).setDepth(91).setScale(0);
    this.tweens.add({ targets: title, scale: 1, duration: 350, ease: "Back.easeOut" });

    const lines = [`MISSIONS: 6/6`, `FLAWLESS: ${this.flawlessCount}`, `SELF-CORRECTIONS: ${this.selfCorrectionCount}`, `HINTS: ${this.hintCount}`];
    lines.forEach((s, i) => {
      const t = this.add.text(500, 195 + i * 28, s, { font: "14px Arial", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 250, delay: 300 + i * 150 });
    });
    const totalText = this.add.text(500, 195 + 4 * 28, "TOTAL: 0", { font: "bold 24px Arial", color: HEX_AMBER }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: totalText, alpha: 1, duration: 250, delay: 1050 });
    const counter = { v: 0 };
    this.tweens.add({ targets: counter, v: this.score, duration: 1000, delay: 1050, onUpdate: () => totalText.setText(`TOTAL: ${Math.round(counter.v)}`) });

    const stars = this._starRating();
    for (let i = 0; i < 3; i++) {
      const earned = i < stars;
      const s = this.add.text(640 + (i - 1) * 60, 345, "★", { font: "40px Arial", color: earned ? HEX_AMBER : "#2a3040" }).setOrigin(0.5).setDepth(91).setScale(0);
      this.tweens.add({ targets: s, scale: 1, duration: 250, delay: 1650 + i * 200, ease: earned ? "Back.easeOut" : "Cubic.easeOut" });
    }

    const badge = this.add.container(640, 425).setDepth(91).setAlpha(0);
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillCircle(0, 0, 34);
    bg.lineStyle(3, C_AMBER, 1);
    bg.strokeCircle(0, 0, 34);
    bg.fillStyle(C_ORANGE, 1);
    bg.fillRoundedRect(-16, -8, 32, 16, 3);
    bg.lineStyle(2, C_GREEN, 1);
    bg.lineBetween(-6, 0, -2, 5);
    bg.lineBetween(-2, 5, 8, -6);
    badge.add(bg);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 2100 });
    const badgeLbl = this.add.text(640, 465, "CASE METHODS MASTERY", { font: "bold 13px Arial", color: HEX_AMBER }).setOrigin(0.5).setDepth(91).setAlpha(0);
    const badgeSub = this.add.text(640, 482, "Accretion ✓  Tuning ✓  Restructuring ✓", { font: "10px Arial", color: "#78909c" }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: [badgeLbl, badgeSub], alpha: 1, duration: 300, delay: 2200 });

    const ribbon = this.add.graphics().setDepth(91).setAlpha(0);
    ribbon.fillStyle(0x1a1a2e, 1);
    ribbon.lineStyle(2, C_AMBER, 1);
    ribbon.fillRoundedRect(640 - 210, 505, 420, 60, 8);
    ribbon.strokeRoundedRect(640 - 210, 505, 420, 60, 8);
    const ribbonText = this.add.text(640, 522, "STRING FOUNDATIONS WING — COMPLETE", { font: "bold 12px Arial", color: HEX_AMBER }).setOrigin(0.5).setDepth(92).setAlpha(0);
    const ribbonSub = this.add.text(640, 542, "length() ✓   charAt() ✓   toUpperCase()/toLowerCase() ✓", { font: "10px Courier New", color: HEX_PURPLE }).setOrigin(0.5).setDepth(92).setAlpha(0);
    this.tweens.add({ targets: ribbon, alpha: 1, duration: 300, delay: 2500 });
    this.tweens.add({ targets: [ribbonText, ribbonSub], alpha: 1, duration: 300, delay: 2700 });

    this._makeButton(500, 590, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(760, 590, "NEXT WING →", 200, 44, { fill: 0x00733a, stroke: C_GREEN, textColor: "#ffffff" }, () => {
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
