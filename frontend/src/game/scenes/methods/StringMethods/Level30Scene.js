/**
 * Level 30 — "The Workshop" (String Methods: Restructuring Phase — Finale)
 * ===========================================================================
 * The learner restructures the charAt() schema by CONSTRUCTING complete
 * programs that automate the claw — no multiple choice. Blocks are dragged
 * into slots in a code skeleton; RUN genuinely interprets the assembled
 * program (loops, conditionals, counters, boolean flags) against live test
 * strings inside a masked "automation rig" window, where a mini claw rig
 * physically executes it: hopping tile to tile, printing to an output
 * ticker, ticking a counter dial, or crashing/looping forever exactly as
 * the player's actual code dictates.
 *
 * This closes the charAt() trilogy (Accretion L28 → Tuning L29 →
 * Restructuring L30) the same way Level 27 closed the length() trilogy:
 * a small hand-written interpreter (_interpretMissionN) computes genuine
 * results from whatever blocks were placed — never a correct/incorrect
 * lookup — so wrong builds produce their real wrong outcomes (reverse
 * traversal starting at length() crashes on hop one, a missing assignment
 * spins the watchdog, comparing a char to itself always "passes").
 */

import Phaser from "phaser";
import { GameManager } from "../../../GameManager.js";
import { BadgeSystem } from "../../../BadgeSystem.js";

const W = 1280, H = 720;

const C_CYAN = 0x00e5ff, C_AMBER = 0xffd740, C_GREEN = 0x00e676;
const C_RED = 0xf44336, C_GRAY = 0x78909c, C_MAGENTA = 0xff4081;
const C_PURPLE = 0x8c7ae6;
const HEX_CYAN = "#00e5ff", HEX_AMBER = "#ffd740", HEX_GREEN = "#00e676";
const HEX_RED = "#f44336", HEX_GRAY = "#78909c", HEX_MAGENTA = "#ff4081";
const HEX_PURPLE = "#8c7ae6";

// Layout geometry (matches Level 27's construction layout)
const CX = 40, CY = 90, CW = 680, CH = 380;
const TAB_H = 34, GUTTER_W = 34, CODE_PAD = 10;
const CODE_X = CX + GUTTER_W + CODE_PAD;
const CODE_Y0 = CY + TAB_H + 14;
const LINE_H = 26;
const PX = 40, PY = 490, PW = 680, PH = 130;
const OX = 760, OY = 80, OW = 460, OH = 250;
const RX = 760, RY = 345, RW = 460, RH = 125;
const BX = 760, BY = 490, BW = 460, BH = 130;
const MINI_RAIL_Y = OY + 90, MINI_TILE_Y = OY + 150, TICKER_Y = OY + OH - 15;

const TUTORIAL_KEY = "level30_tutorial_done";

// ─────────────────────────────────────────────────────────────────
// Mission configuration
// ─────────────────────────────────────────────────────────────────
const MISSIONS = [
  { mission: 1, title: "The Gatekeeper",
    brief: "Workshop access codes must begin with the letter 'X' — capital only! Build the door check.",
    varName: "code",
    skeleton: ["if (code.charAt(§idx) == §ch) {", "    open();", "} else {", "    deny();", "}"],
    slots: [{ id: "idx", hint: "index", capacity: 1 }, { id: "ch", hint: "character", capacity: 1 }],
    palette: [
      { code: "0", slot: "idx" },
      { code: "'X'", slot: "ch" },
      { code: "1", slot: "idx", tag: "one_based_indexing" },
      { code: '"X"', slot: "ch", tag: "char_vs_string_type" },
      { code: "'x'", slot: "ch", tag: "case_sensitivity_ignored" },
    ],
    tests: [
      { input: "X99", expected: "open" },
      { input: "AX9", expected: "deny" },
      { input: "x42", expected: "deny" },
    ], concept: "first_char_condition" },

  { mission: 2, title: "The Tail Light",
    brief: "Every part label must end with a status character. Fetch the LAST character of any label — without crashing the rig.",
    varName: "s",
    skeleton: ["char status = §expr;", "display(status);"],
    slots: [{ id: "expr", hint: "expression", capacity: 1 }],
    palette: [
      { code: "s.charAt(s.length() - 1)", slot: "expr" },
      { code: "s.charAt(s.length())", slot: "expr", tag: "length_as_valid_index" },
      { code: "s[s.length() - 1]", slot: "expr", tag: "bracket_notation_on_string" },
      { code: "s.charAt(-1)", slot: "expr", tag: "negative_index_python" },
    ],
    tests: [
      { input: "BOLT-A", expectedValue: "'A'" },
      { input: "x", expectedValue: "'x'" },
      { input: "GEAR-9", expectedValue: "'9'" },
    ], concept: "safe_last_char" },

  { mission: 3, title: "The Matcher",
    brief: "Inventory needs to know how many times the letter 't' appears in a part name. Build the counting machine.",
    varName: "s",
    skeleton: ["int count = 0;", "for (int i = 0; §cond; i++) {", "    if (§check) {", "        count = count + 1;", "    }", "}", "display(count);"],
    slots: [{ id: "cond", hint: "loop condition", capacity: 1 }, { id: "check", hint: "comparison", capacity: 1 }],
    palette: [
      { code: "i < s.length()", slot: "cond" },
      { code: "s.charAt(i) == 't'", slot: "check" },
      { code: "i <= s.length()", slot: "cond", tag: "loop_off_by_one_length" },
      { code: "s.charAt(0) == 't'", slot: "check", tag: "only_first_checked" },
      { code: 's.charAt(i) == "t"', slot: "check", tag: "char_vs_string_type" },
    ],
    tests: [
      { input: "trust", expectedValue: 2 },
      { input: "robot", expectedValue: 1 },
      { input: "java", expectedValue: 0 },
    ], useCounterDial: true, concept: "occurrence_counting" },

  { mission: 4, title: "The Reverse Printer",
    brief: "The engraving rig prints labels MIRRORED — it needs each name fed in backwards. Walk the String from the end to the start.",
    varName: "s",
    skeleton: ["for (int i = §init; i >= 0; i--) {", "    print(s.charAt(i));", "}"],
    slots: [{ id: "init", hint: "start value", capacity: 1 }],
    palette: [
      { code: "s.length() - 1", slot: "init" },
      { code: "s.length()", slot: "init", tag: "reverse_start_at_length" },
      { code: "0", slot: "init", tag: "reverse_start_at_zero" },
      { code: "s.length() - 2", slot: "init", tag: "off_by_one_last_position" },
    ],
    tests: [
      { input: "GEAR", expectedOutput: "RAEG" },
      { input: "bolt", expectedOutput: "tlob" },
      { input: "x", expectedOutput: "x" },
    ], concept: "reverse_traversal" },

  { mission: 5, title: "The Secret Decoder",
    brief: "Supplier messages hide the real word in the EVEN positions: 0, 2, 4... Build the decoder that reads every second character.",
    varName: "s",
    skeleton: ["for (int i = 0; i < s.length(); §step) {", "    print(s.charAt(i));", "}"],
    slots: [{ id: "step", hint: "step", capacity: 1 }],
    palette: [
      { code: "i += 2", slot: "step" },
      { code: "i = i + 2", slot: "step" },
      { code: "i++", slot: "step", tag: "step_size_ignored" },
      { code: "i + 2", slot: "step", tag: "missing_assignment_infinite_loop" },
    ],
    tests: [
      { input: "jxaxvxa", expectedOutput: "java" },
      { input: "cxoxdxe", expectedOutput: "code" },
      { input: "ok", expectedOutput: "o" },
    ], concept: "stepped_traversal" },

  { mission: 6, title: "The Mirror Test",
    brief: "Premium labels must read the same forwards and backwards. Build the palindrome verifier — compare each character with its mirror twin.",
    varName: "s",
    skeleton: ["boolean mirror = true;", "for (int i = 0; i < s.length(); i++) {", "    if (s.charAt(i) != §twin) {", "        mirror = false;", "    }", "}", "display(mirror);"],
    slots: [{ id: "twin", hint: "the mirror character", capacity: 1 }],
    palette: [
      { code: "s.charAt(s.length() - 1 - i)", slot: "twin" },
      { code: "s.charAt(s.length() - i)", slot: "twin", tag: "mirror_index_off_by_one" },
      { code: "s.charAt(s.length() - 1)", slot: "twin", tag: "compared_to_last_only" },
      { code: "s.charAt(i)", slot: "twin", tag: "compared_to_self" },
    ],
    tests: [
      { input: "level", expectedValue: "true" },
      { input: "claw", expectedValue: "false" },
      { input: "noon", expectedValue: "true" },
    ],
    postMissionNote: "You tested first-vs-last in the Trials. Today you built the WHOLE mirror. That's growth.",
    concept: "palindrome_capstone" },
];

const MISCONCEPTION_FEEDBACK = {
  case_sensitivity_ignored: "Check the 'x42' row — your gate let it in! 'x' and 'X' are DIFFERENT chars to Java. Case always matters.",
  length_as_valid_index: "First hop, instant crash — see the report. length() is one past the last address. Start (and stop) at length() - 1.",
  reverse_start_at_length: "First hop, instant crash — see the report. length() is one past the last address. Start (and stop) at length() - 1.",
  bracket_notation_on_string: "Brackets never compile on a String — only charAt() gets a character out.",
  negative_index_python: "charAt(-1) crashed immediately — Java has no backwards indexing! The last character is charAt(s.length() - 1), earned honestly.",
  only_first_checked: "Look at the report — charAt(0) inspects the SAME tile every loop. The moving part is i: charAt(i).",
  missing_assignment_infinite_loop: "The watchdog saved us! i + 2 calculates a value and throws it away — i never changes, the loop never ends. i += 2 STORES it.",
  step_size_ignored: "The report shows the junk characters printed too. i++ visits every tile. The secret lives at every SECOND one: i += 2.",
  mirror_index_off_by_one: "Crash at the very first comparison! When i = 0, s.length() - i IS s.length() — the void. The mirror twin needs the -1: length() - 1 - i.",
  compared_to_self: "Every label passed — even the ones that shouldn't! charAt(i) != charAt(i) can never be true. A mirror needs TWO different positions.",
  compared_to_last_only: "Some passed that shouldn't have — your check compares every character to the last one only. The twin must MOVE as i moves: length() - 1 - i.",
  char_vs_string_type: "char and String live in different worlds — single quotes for one, double for the other. == between them won't even compile.",
  one_based_indexing: "The plates start at ZERO! Index 0 is the first character, not index 1.",
  reverse_start_at_zero: "That only visits ONE tile — i=0, then i-- makes i=-1 and the loop stops immediately. Start at the LAST index, not the first.",
  off_by_one_last_position: "One tile short! Starting one early silently drops the true last character of the original string.",
};

export class Level30Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level30Scene" });
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
    this._runCountAtMissionStart = 0;
    this.paletteBlocks = [];
    this.inputLocked = true;
    this.gameEnded = false;
    this._alive = true;
    this._bubble = null;
    this._dragHoverSlotKey = null;
    this.miniTiles = [];
  }

  preload() {}

  create() {
    this._alive = true;
    this.events.once("shutdown", () => { this._alive = false; });

    const cam = this.cameras.main;
    const zoom = Math.min(this.scale.width / W, this.scale.height / H);
    cam.setZoom(zoom);
    cam.centerOn(W / 2, H / 2);
    cam.setBackgroundColor("#0c0a08");

    try { GameManager.incrementAttempt(29); } catch (_) {}

    this.createParticleTexture();
    this.createBackground();
    this.createPegboard();
    this.createWorkbench();
    this.createWorkLamp();
    this.createAmbientParticles();
    this.createCodeCanvas();
    this.createBlockPalette();
    this.createRunButton();
    this.createRigWindow();
    this.createMiniClaw();
    this.createOutputTicker();
    this.createCounterDial();
    this.createTestReportPanel();
    this.createMissionBriefPanel();
    this.createHUD();
    this.createBit();
    this.setupDragEvents();

    cam.fadeIn(700, 3, 3, 6);
    this.checkTutorial();
  }

  update(time, delta) {
    this.updateAmbient(time, delta);
    this.updateLampSwing(time);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // SETUP — background & environment
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l30_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l30_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x0c0a08).setDepth(0);
  }

  createPegboard() {
    const g = this.add.graphics().setDepth(1);
    for (let x = 160; x < 1120; x += 26) {
      for (let y = 20; y < 216; y += 26) {
        g.fillStyle(0x241f1a, 0.25);
        g.fillCircle(x, y, 1);
      }
    }
    g.lineStyle(2, 0x241f1a, 0.08);
    // wrench silhouette
    g.strokeCircle(240, 60, 8);
    g.lineBetween(246, 66, 260, 90);
    // screwdriver
    g.lineBetween(330, 40, 330, 90);
    g.strokeRect(324, 30, 12, 12);
    // coiled cable
    [0, 1, 2].forEach((i) => g.strokeCircle(980, 70 + i * 10, 10 - i * 2));
    // spare pincers
    g.beginPath(); g.arc(1050, 70, 14, Phaser.Math.DegToRad(-40), Phaser.Math.DegToRad(80), false); g.strokePath();
    g.beginPath(); g.arc(1070, 70, 14, Phaser.Math.DegToRad(100), Phaser.Math.DegToRad(220), false); g.strokePath();
  }

  createWorkbench() {
    const g = this.add.graphics().setDepth(3);
    g.fillStyle(0x14100b, 1);
    g.fillRect(0, 635, W, 85);
    g.lineStyle(1, 0x2a2218, 1);
    g.lineBetween(0, 635, W, 635);
    for (let i = 0; i < 3; i++) {
      g.lineStyle(1, 0x1d1710, 0.4);
      g.lineBetween(0, 660 + i * 18, W, 660 + i * 18);
    }
    g.fillStyle(0x14100b, 1);
    g.lineStyle(1, 0x2a2218, 0.3);
    g.fillRoundedRect(40, 650, 60, 26, 4);
    g.strokeRoundedRect(40, 650, 60, 26, 4);
    [0, 1, 2].forEach((i) => { g.fillStyle(0x4a4468, 0.2); g.fillCircle(55 + i * 15, 663, 3); });
  }

  createWorkLamp() {
    const c = this.add.container(900, 0).setDepth(2);
    const g = this.add.graphics();
    g.lineStyle(2, 0x2a2218, 1);
    g.lineBetween(0, 0, 0, 38);
    g.fillStyle(0x1d1710, 1);
    g.lineStyle(1, 0x2a2218, 1);
    g.fillTriangle(-7, 38, 7, 38, 0, 60);
    g.fillTriangle(-7, 38, -23, 60, 0, 60);
    g.fillTriangle(7, 38, 23, 60, 0, 60);
    c.add(g);
    const cone = this.add.triangle(0, 60, -90, 140, 90, 140, 0, 0, C_AMBER, 0.02).setDepth(2);
    this.lampCone = cone;
    this.lampContainer = c;
    this.tweens.add({ targets: c, angle: 1, duration: 3000, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
  }

  updateLampSwing() {}

  createAmbientParticles() {
    this.ambient = [];
    for (let i = 0; i < 8; i++) {
      const p = this.add.circle(Phaser.Math.Between(20, 1260), Phaser.Math.Between(0, 600), 1, C_AMBER, Phaser.Math.FloatBetween(0.02, 0.04)).setDepth(2);
      this.ambient.push(p);
    }
  }

  updateAmbient(time, delta) {
    if (!this.ambient) return;
    const step = 0.04 * (delta / 16.7);
    this.ambient.forEach((p, i) => {
      p.y += step;
      p.x -= 0.01 * (delta / 16.7);
      p.x += Math.sin(time * 0.0007 + i) * 0.03;
      if (p.y > 630 || p.x < 0) { p.y = 0; p.x = Phaser.Math.Between(20, 1260); }
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
  // CODE CANVAS (Level 27 construction, reused)
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
    this.tabFilename = this.add.text(CX + CW - 12, CY + TAB_H / 2, "Auto1.java", {
      font: "11px Courier New", color: "#546e7a",
    }).setOrigin(1, 0.5).setDepth(11);

    this.lineHighlight = this.add.rectangle(CX + CW / 2, 0, CW - 4, LINE_H, C_AMBER, 0.06).setDepth(19).setVisible(false);
    this.codeContainer = this.add.container(0, 0).setDepth(20);
  }

  _syntaxTokens(line) {
    const tokens = [];
    const re = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\bif\b|\belse\b|\bfor\b|\bint\b|\bchar\b|\bboolean\b)|([A-Za-z_]\w*(?=\())|(\.length\b)|(\b-?\d+\b)|(==|!=|<=|>=|\+=|\+\+|--)|([+\-=<>!])|([(){}\[\];.,])/g;
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

  _slotWidth(slotDef) {
    return 90;
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
          const w = this._slotWidth(def);
          def.rect = { x, y: y - 2, w, h: 22, lineIndex: i };
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
  // BLOCK PALETTE
  // ══════════════════════════════════════════════════════════════

  createBlockPalette() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0a0e14, 1);
    g.fillRoundedRect(PX, PY, PW, PH, 10);
    g.lineStyle(1, 0x1a2535, 1);
    g.strokeRoundedRect(PX, PY, PW, PH, 10);
    this.add.text(PX + 10, PY + 8, "PARTS BIN", { font: "bold 9px Arial", color: "#3d4450" }).setDepth(11);
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
    return Object.keys(this.slotDefs).filter((k) => k !== "_lineCount").every((id) => (this.slotContents[id] || []).length > 0);
  }

  updateRunButtonState() {
    if (this.allSlotsFilled()) this.enableRunButton(); else this.disableRunButton();
  }

  getAssembledCode() {
    const out = {};
    for (const id in this.slotDefs) {
      if (id === "_lineCount") continue;
      out[id] = (this.slotContents[id] || []).map((b) => ({ code: b.container.getData("code"), tag: b.container.getData("tag") }));
    }
    return out;
  }

  resetAllBlocks() {
    this.slotContents = {};
    this.paletteBlocks.forEach((b) => {
      b.container.setData("placedIn", null);
      b.container.setPosition(b.home.x, b.home.y).setScale(1);
      b.container.setInteractive({ useHandCursor: true, draggable: true });
    });
    Object.keys(this.slotDefs).forEach((id) => { if (id !== "_lineCount") this._drawSlotPlaceholder(id); });
    this.disableRunButton();
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
  // RIG WINDOW (masked) + MINI CLAW + TICKER + DIAL
  // ══════════════════════════════════════════════════════════════

  createRigWindow() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x080a10, 1);
    g.fillRoundedRect(OX, OY, OW, OH, 12);
    g.lineStyle(3, 0x21262d, 1);
    g.strokeRoundedRect(OX, OY, OW, OH, 12);
    this.add.text(OX + OW / 2, OY + OH + 12, "AUTOMATION RIG — LIVE", { font: "bold 9px Arial", color: "#3d4450" }).setOrigin(0.5).setDepth(11);

    const maskShape = this.make.graphics({ x: 0, y: 0, add: false });
    maskShape.fillRoundedRect(OX + 4, OY + 4, OW - 8, OH - 8, 10);
    this.windowMask = maskShape.createGeometryMask();
    this.rigLayer = this.add.container(0, 0).setDepth(15);
    this.rigLayer.setMask(this.windowMask);

    this.rigLamp = this.add.circle(OX + OW - 18, OY + 14, 6, C_GRAY).setDepth(20);
    this.watchdogText = this.add.text(OX + OW / 2, MINI_TILE_Y, "", {
      font: "bold 13px Arial", color: HEX_RED, wordWrap: { width: OW - 30 }, align: "center",
    }).setOrigin(0.5).setDepth(25).setAlpha(0);
  }

  createMiniClaw() {
    const railG = this.add.graphics();
    railG.fillStyle(0x241f36, 1);
    railG.fillRoundedRect(OX + 20, MINI_RAIL_Y - 3, OW - 40, 6, 3);
    this.rigLayer.add(railG);

    this._miniClawState = { x: OX + 30 };
    this.miniCable = this.add.graphics();
    this.miniClawHead = this.add.container(OX + 30, MINI_RAIL_Y + 20);
    const hub = this.add.circle(0, 0, 4, 0x1c1730).setStrokeStyle(1.5, C_PURPLE);
    this.miniPincerL = this.add.graphics();
    this.miniPincerR = this.add.graphics();
    this.miniClawHead.add([this.miniPincerL, this.miniPincerR, hub]);
    this._drawMiniPincers(16);
    this.rigLayer.add([this.miniCable, this.miniClawHead]);

    // ghost claw for Mission 6 two-pointer choreography
    this._ghostClawState = { x: OX + OW - 30, visible: false };
    this.ghostCable = this.add.graphics();
    this.ghostClawHead = this.add.container(OX + OW - 30, MINI_RAIL_Y + 20).setAlpha(0.5).setVisible(false);
    const ghub = this.add.circle(0, 0, 4, 0x1c1730).setStrokeStyle(1.5, C_MAGENTA);
    this.ghostPincerL = this.add.graphics();
    this.ghostPincerR = this.add.graphics();
    this.ghostClawHead.add([this.ghostPincerL, this.ghostPincerR, ghub]);
    this._drawGhostPincers(16);
    this.rigLayer.add([this.ghostCable, this.ghostClawHead]);

    this._redrawMiniClaw();
  }

  _drawMiniPincers(gap) {
    this.miniPincerL.clear(); this.miniPincerR.clear();
    this.miniPincerL.lineStyle(2.5, C_PURPLE, 1);
    this.miniPincerR.lineStyle(2.5, C_PURPLE, 1);
    const half = gap / 2;
    this.miniPincerL.beginPath(); this.miniPincerL.arc(-half - 5, 6, 10, Phaser.Math.DegToRad(-40), Phaser.Math.DegToRad(80), false); this.miniPincerL.strokePath();
    this.miniPincerR.beginPath(); this.miniPincerR.arc(half + 5, 6, 10, Phaser.Math.DegToRad(100), Phaser.Math.DegToRad(220), false); this.miniPincerR.strokePath();
  }

  _drawGhostPincers(gap) {
    this.ghostPincerL.clear(); this.ghostPincerR.clear();
    this.ghostPincerL.lineStyle(2.5, C_MAGENTA, 1);
    this.ghostPincerR.lineStyle(2.5, C_MAGENTA, 1);
    const half = gap / 2;
    this.ghostPincerL.beginPath(); this.ghostPincerL.arc(-half - 5, 6, 10, Phaser.Math.DegToRad(-40), Phaser.Math.DegToRad(80), false); this.ghostPincerL.strokePath();
    this.ghostPincerR.beginPath(); this.ghostPincerR.arc(half + 5, 6, 10, Phaser.Math.DegToRad(100), Phaser.Math.DegToRad(220), false); this.ghostPincerR.strokePath();
  }

  _redrawMiniClaw() {
    this.miniClawHead.setPosition(this._miniClawState.x, MINI_RAIL_Y + 20);
    this.miniCable.clear();
    this.miniCable.lineStyle(2, 0x4a4468, 1);
    this.miniCable.lineBetween(this._miniClawState.x, MINI_RAIL_Y, this._miniClawState.x, MINI_RAIL_Y + 20);
    if (this._ghostClawState.visible) {
      this.ghostClawHead.setPosition(this._ghostClawState.x, MINI_RAIL_Y + 20).setVisible(true);
      this.ghostCable.clear();
      this.ghostCable.lineStyle(2, 0x8a4468, 0.5);
      this.ghostCable.lineBetween(this._ghostClawState.x, MINI_RAIL_Y, this._ghostClawState.x, MINI_RAIL_Y + 20);
    } else {
      this.ghostClawHead.setVisible(false);
    }
  }

  hopClawTo(x, duration = 140) {
    return new Promise((res) => {
      this.tweens.add({ targets: this._miniClawState, x, duration, ease: "Sine.easeInOut", onUpdate: () => this._redrawMiniClaw(), onComplete: () => res() });
    });
  }

  ghostHopTo(x, duration = 140) {
    this._ghostClawState.visible = true;
    return new Promise((res) => {
      this.tweens.add({ targets: this._ghostClawState, x, duration, ease: "Sine.easeInOut", onUpdate: () => this._redrawMiniClaw(), onComplete: () => res() });
    });
  }

  createOutputTicker() {
    const g = this.add.graphics().setDepth(16);
    g.fillStyle(0x0a0e14, 1);
    g.fillRect(OX + 10, TICKER_Y - 13, OW - 20, 26);
    this.rigLayer.add(g);
    this.tickerText = this.add.text(OX + 18, TICKER_Y, "", { font: "bold 14px Courier New", color: HEX_GREEN }).setOrigin(0, 0.5).setDepth(17);
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
    g.strokeCircle(0, 0, 16);
    c.add(g);
    const t = this.add.text(0, 0, "0", { font: "bold 15px Courier New", color: HEX_AMBER }).setOrigin(0.5);
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
    this.tweens.add({ targets: this.counterDial.c, scale: 1.25, duration: 120, yoyo: true });
  }

  buildMiniTileRow(str) {
    this.miniTiles.forEach((t) => t.container.destroy());
    this.miniTiles = [];
    const n = Math.max(str.length, 1);
    const tw = Math.min(34, Math.max(16, Math.floor((OW - 60) / n) - 4));
    const totalW = str.length * (tw + 4) - 4;
    const startX = OX + OW / 2 - totalW / 2;
    str.split("").forEach((ch, i) => {
      const x = startX + i * (tw + 4) + tw / 2;
      const y = MINI_TILE_Y;
      const container = this.add.container(x, y);
      const meta = this._charMeta(ch);
      const body = this.add.graphics();
      const drawBody = (stroke) => { body.clear(); body.fillStyle(0x0d1117, 1); body.fillRoundedRect(-tw / 2, -21, tw, 42, 4); body.lineStyle(1.5, stroke, 1); body.strokeRoundedRect(-tw / 2, -21, tw, 42, 4); };
      drawBody(0x2a3a4a);
      const charText = this.add.text(0, -6, meta.display, { font: "bold 13px Courier New", color: meta.color }).setOrigin(0.5);
      const plateG = this.add.graphics();
      plateG.fillStyle(0x141019, 1);
      plateG.fillRoundedRect(-12, 12, 24, 14, 3);
      plateG.lineStyle(1, C_AMBER, i === 0 ? 0.5 : 0.25);
      plateG.strokeRoundedRect(-12, 12, 24, 14, 3);
      const plateText = this.add.text(0, 19, String(i), { font: "bold 9px Courier New", color: HEX_AMBER }).setOrigin(0.5);
      container.add([body, charText, plateG, plateText]);
      this.rigLayer.add(container);
      this.miniTiles.push({ container, body, drawBody, charText, plateG, plateText, x, y, index: i, ch, tw });
    });
  }

  _charMeta(ch) {
    if (ch === " ") return { display: "␣", color: HEX_MAGENTA };
    if (/[0-9]/.test(ch)) return { display: ch, color: HEX_AMBER };
    if (/[a-zA-Z]/.test(ch)) return { display: ch, color: HEX_CYAN };
    return { display: ch, color: "#ff9800" };
  }

  flashTilePair(i, j, match) {
    [i, j].forEach((idx) => {
      const t = this.miniTiles[idx];
      if (!t) return;
      t.drawBody(match ? C_CYAN : C_RED);
      this.time.delayedCall(200, () => { if (t.container.active) t.drawBody(0x2a3a4a); });
    });
    const midX = (this.miniTiles[i] ? this.miniTiles[i].x : 0);
    const glyph = this.add.text(midX, MINI_TILE_Y - 30, match ? "=" : "✗", { font: "bold 14px Arial", color: match ? HEX_GREEN : HEX_RED }).setOrigin(0.5).setDepth(1);
    this.rigLayer.add(glyph);
    this.time.delayedCall(300, () => glyph.destroy());
  }

  miniClawCrash(x) {
    this.rigLamp.setFillStyle(C_RED);
    const dust = this.add.particles(x, MINI_TILE_Y, "l30_dot", {
      speed: { min: 15, max: 35 }, angle: { min: 0, max: 360 }, scale: { start: 0.3, end: 0 }, lifespan: 250, tint: 0x78909c, emitting: false,
    }).setDepth(1);
    this.rigLayer.add(dust);
    dust.explode(2);
    this.time.delayedCall(350, () => dust.destroy());
    this.screenShake(0.003, 150);
    const stamp = this.add.text(OX + OW / 2, MINI_TILE_Y, "IndexOutOfBounds!", { font: "bold 11px Courier New", color: HEX_RED }).setOrigin(0.5).setDepth(2);
    this.rigLayer.add(stamp);
    this.time.delayedCall(900, () => stamp.destroy());
  }

  async watchdogKill() {
    this.rigLamp.setFillStyle(C_RED);
    let speed = 200;
    for (let i = 0; i < 8; i++) {
      if (!this._alive) return;
      const t0 = this.miniTiles[0];
      await new Promise((res) => this.tweens.add({ targets: t0 ? t0.container : {}, scaleX: 1.15, duration: speed / 2, yoyo: true, onComplete: () => res() }));
      speed = Math.max(40, speed * 0.75);
    }
    this.watchdogText.setText("∞ WATCHDOG: INFINITE LOOP").setAlpha(0);
    let flashes = 0;
    await new Promise((res) => {
      const ev = this.time.addEvent({
        delay: 100, repeat: 9,
        callback: () => { flashes++; this.watchdogText.setAlpha(flashes % 2 === 0 ? 0 : 1); if (flashes >= 9) res(); },
      });
    });
    await this.delay(400);
    this.watchdogText.setAlpha(0);
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
      const expected = test.expected ?? test.expectedValue ?? test.expectedOutput;
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

    this.add.text(20, 14, "THE WORKSHOP", { font: "bold 13px Arial", color: "#b0bec5" }).setDepth(51);
    this.add.text(20, 32, "Restructuring Phase — String Methods: charAt()", { font: "10px Arial", color: "#546e7a" }).setDepth(51);

    const pbg = this.add.graphics().setDepth(51);
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
  // BIT — master builder variant
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
    const headset = this.add.graphics();
    headset.lineStyle(2, 0x78909c, 1);
    headset.beginPath(); headset.arc(0, -8, 14, Phaser.Math.DegToRad(200), Phaser.Math.DegToRad(340), false); headset.strokePath();
    const wrench = this.add.graphics();
    wrench.lineStyle(2, 0xb0bec5, 1);
    wrench.lineBetween(20, 8, 30, -2);
    wrench.strokeCircle(19, 9, 3);
    wrench.strokeCircle(31, -3, 3);
    c.add([g, headset, tip, eye, pupil, wrench]);
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
    await this.bitSay("Welcome to the Workshop, Builder! In the Trials you drove the claw by hand — one index at a time. In here, your CODE drives it. Write the program, and the claw obeys every line.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();

    const a1 = this.createAnnotation(CX + CW / 2, CY - 20, "assemble the program", HEX_AMBER, { x: CX + CW / 2, y: CY + 4 });
    await this.delay(350); if (!A()) return;
    const a2 = this.createAnnotation(PX + PW / 2, PY - 16, "parts — some are faulty!", HEX_CYAN, { x: PX + PW / 2, y: PY + 4 });
    await this.delay(350); if (!A()) return;
    const a3 = this.createAnnotation(OX + OW / 2, OY - 16, "your code runs the claw LIVE", HEX_GREEN, { x: OX + OW / 2, y: OY + 4 });
    await this.delay(350); if (!A()) return;
    const a4 = this.createAnnotation(OX + OW / 2, TICKER_Y - 24, "whatever it prints appears here", HEX_PURPLE, { x: OX + OW / 2, y: TICKER_Y - 14 });
    await this.delay(350); if (!A()) return;

    await this.bitSay("Watch the highlight follow your code while the claw works — if the claw crashes or loops forever, the fault is in YOUR lines. Build, run, read the report, repair. Let's build!");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();
    [a1, a2, a3, a4].forEach((a) => this.tweens.add({ targets: a, alpha: 0, duration: 250, onComplete: () => a.destroy() }));

    try { localStorage.setItem(TUTORIAL_KEY, "true"); } catch (_) {}
    this.showProjectBriefing(0);
  }

  createAnnotation(x, y, text, colorHex, arrowTarget = null) {
    const c = this.add.container(0, 0).setDepth(70).setAlpha(0);
    const txt = this.add.text(x, y, text, { font: "bold 12px Arial", color: colorHex }).setOrigin(0.5);
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

  showProjectBriefing(index) {
    this.currentMission = index;
    const mission = MISSIONS[index];
    this._drawHexes();

    const card = this.add.container(W / 2, H + 200).setDepth(90);
    const g = this.add.graphics();
    g.fillStyle(0x0d1117, 1);
    g.fillRoundedRect(-250, -100, 500, 200, 12);
    g.lineStyle(2, C_AMBER, 1);
    g.strokeRoundedRect(-250, -100, 500, 200, 12);
    g.fillStyle(C_AMBER, 1);
    g.fillRect(-250, -100, 5, 200);
    const badge = this.add.circle(-215, -70, 18, C_AMBER);
    const badgeNum = this.add.text(-215, -70, String(mission.mission), { font: "bold 16px Arial", color: "#0a0e14" }).setOrigin(0.5);
    const title = this.add.text(-185, -80, mission.title, { font: "bold 20px Arial", color: "#ffffff" }).setOrigin(0, 0.5);
    const desc = this.add.text(-215, -45, mission.brief, { font: "13px Arial", color: "#b0bec5", wordWrap: { width: 460 } }).setOrigin(0, 0);

    const startBtn = this.add.container(0, 75).setDepth(1);
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

    card.add([g, badge, badgeNum, title, desc, startBtn]);
    this.tweens.add({ targets: card, y: 340, duration: 400, ease: "Back.easeOut" });
  }

  startMission(mission) {
    this.slotContents = {};
    this.slotDefs = {};
    this.missionRunsFailed = 0;
    this.missionHintUsed = false;
    this.missionStartTime = this.time.now;
    this._runCountAtMissionStart = this.runCount;
    this.clearMission();

    this.tabFilename.setText(`Auto${mission.mission}.java`);
    this.renderSkeleton(mission);
    this.populatePalette(mission);
    this.buildReportRows(mission.tests);
    this.renderMissionBrief(mission);
    this.showCounterDial(!!mission.useCounterDial);
    this.disableRunButton();
    this.highlightCodeLine(null);
    this._ghostClawState.visible = false;
    this._redrawMiniClaw();
    this.rigLamp.setFillStyle(C_GRAY);
    this.clearTicker();
    this.buildMiniTileRow(mission.tests[0].input || "");
  }

  clearMission() {
    this.missionElements.forEach((e) => { if (e && e.destroy) e.destroy(); });
    this.missionElements = [];
  }

  // ══════════════════════════════════════════════════════════════
  // GENUINE INTERPRETER — per-mission (reused arithmetic helpers)
  // ══════════════════════════════════════════════════════════════

  _evalIndexExpr(expr, i, len) {
    expr = expr.trim();
    if (/^-?\d+$/.test(expr)) return parseInt(expr, 10);
    if (expr === "i") return i;
    if (expr === "s.length()") return len;
    let m;
    if ((m = expr.match(/^s\.length\(\)\s*-\s*1\s*-\s*i$/))) return len - 1 - i;
    if ((m = expr.match(/^s\.length\(\)\s*-\s*i$/))) return len - i;
    if ((m = expr.match(/^s\.length\(\)\s*-\s*(\d+)$/))) return len - parseInt(m[1], 10);
    return NaN;
  }

  _charAtSafe(str, idx) {
    if (idx < 0 || idx >= str.length || Number.isNaN(idx)) return { crash: true, index: idx };
    return { crash: false, ch: str[idx] };
  }

  _interpretMission1(blocks, input) {
    const idxCode = blocks.idx[0].code;
    const chCode = blocks.ch[0].code;
    if (chCode.startsWith('"')) return { compileError: true, message: "charAt() returns a char — it can't == a String. Use single quotes: 'X'." };
    const idx = this._evalIndexExpr(idxCode, 0, input.length);
    const chVal = chCode.replace(/'/g, "");
    const r = this._charAtSafe(input, idx);
    if (r.crash) return { crash: true, index: idx };
    const branch = r.ch === chVal ? "open" : "deny";
    return { value: branch, idx, ch: r.ch };
  }

  _interpretMission2(blocks, input) {
    const expr = blocks.expr[0].code;
    if (expr.includes("[")) return { compileError: true, message: "Square brackets never compile on a String — only charAt() reaches inside." };
    const m = expr.match(/charAt\((.+)\)/);
    const argStr = m[1];
    let idx;
    if (argStr === "-1") idx = -1;
    else idx = this._evalIndexExpr(argStr, 0, input.length);
    const r = this._charAtSafe(input, idx);
    if (r.crash) return { crash: true, index: idx };
    return { value: `'${r.ch}'`, idx, ch: r.ch };
  }

  _interpretMission3(blocks, input) {
    const condCode = blocks.cond[0].code;
    const checkCode = blocks.check[0].code;
    if (checkCode.includes('"t"')) return { compileError: true, message: "charAt() returns a char — comparing it to \"t\" (a String) won't compile. Use 't'." };
    const boundOp = condCode.includes("<=") ? "<=" : "<";
    const fixedZero = checkCode.includes("charAt(0)");
    const len = input.length;
    let i = 0, count = 0, guard = 0;
    while ((boundOp === "<=" ? i <= len : i < len) && guard < 200) {
      const charIdx = fixedZero ? 0 : i;
      const r = this._charAtSafe(input, charIdx);
      if (r.crash) return { crash: true, index: charIdx, count };
      if (r.ch === "t") count++;
      i++; guard++;
    }
    return { value: count };
  }

  _interpretMission4(blocks, input) {
    const initCode = blocks.init[0].code;
    const len = input.length;
    let start;
    if (initCode === "s.length() - 1") start = len - 1;
    else if (initCode === "s.length()") start = len;
    else if (initCode === "0") start = 0;
    else if (initCode === "s.length() - 2") start = len - 2;
    else start = this._evalIndexExpr(initCode, 0, len);

    let i = start, output = "", guard = 0;
    while (i >= 0 && guard < 200) {
      const r = this._charAtSafe(input, i);
      if (r.crash) return { crash: true, index: i, output };
      output += r.ch;
      i--; guard++;
    }
    return { value: output };
  }

  _interpretMission5(blocks, input) {
    const stepCode = blocks.step[0].code;
    const len = input.length;
    const noAssign = stepCode === "i + 2";
    const stepAmt = stepCode === "i++" ? 1 : 2;
    let i = 0, output = "", guard = 0;
    while (i < len && guard < 200) {
      const r = this._charAtSafe(input, i);
      if (r.crash) return { crash: true, index: i, output };
      output += r.ch;
      if (noAssign) { /* i never changes */ } else { i += stepAmt; }
      guard++;
    }
    if (guard >= 200) return { infinite: true };
    return { value: output };
  }

  _interpretMission6(blocks, input) {
    const twinCode = blocks.twin[0].code;
    const len = input.length;
    let i = 0, mirror = true, guard = 0;
    while (i < len && guard < 200) {
      let twinExpr;
      if (twinCode === "s.charAt(s.length() - 1 - i)") twinExpr = "s.length() - 1 - i";
      else if (twinCode === "s.charAt(s.length() - i)") twinExpr = "s.length() - i";
      else if (twinCode === "s.charAt(s.length() - 1)") twinExpr = "s.length() - 1";
      else if (twinCode === "s.charAt(i)") twinExpr = "i";
      const twinIdx = this._evalIndexExpr(twinExpr, i, len);
      const rTwin = this._charAtSafe(input, twinIdx);
      if (rTwin.crash) return { crash: true, index: twinIdx };
      const rSelf = this._charAtSafe(input, i);
      if (rSelf.ch !== rTwin.ch) mirror = false;
      i++; guard++;
    }
    return { value: mirror ? "true" : "false" };
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

    // compile check using the FIRST test's input (compile validity doesn't depend on data)
    const probe = this.interpretForTest(mission, assembled, mission.tests[0].input);
    if (probe.compileError) {
      await this.showCompileError(probe);
      if (!this._alive) return;
      this._resolveRunOutcome(mission, "compile_fail", wrongBlocksUsed, [], probe);
      return;
    }

    let anyMismatch = false, anyInfinite = false, anyCrash = false;
    const failedTests = [];
    for (let i = 0; i < mission.tests.length; i++) {
      if (!this._alive) return;
      const test = mission.tests[i];
      const result = this.interpretForTest(mission, assembled, test.input);
      const outcome = await this.runTestCase(mission, test, i, result);
      if (!outcome.match) { anyMismatch = true; failedTests.push(test.input); }
      if (result.infinite) anyInfinite = true;
      if (result.crash) anyCrash = true;
    }

    let resultKind = "pass";
    if (anyInfinite) resultKind = "infinite_loop";
    else if (anyCrash) resultKind = "runtime_crash";
    else if (anyMismatch) resultKind = "logic_fail";
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
    this.buildMiniTileRow(test.input);
    this.clearTicker();
    this.rigLamp.setFillStyle(C_AMBER);
    this._ghostClawState.visible = false;
    this._miniClawState.x = OX + 30;
    this._redrawMiniClaw();
    await this.delay(150);
    if (!this._alive) return { match: false };

    if (result.compileError) return { match: false };

    let actualDisplay, match;
    const lineForMission = { 1: 0, 2: 0, 3: 1, 4: 0, 5: 0, 6: 1 }[mission.mission];
    this.highlightCodeLine(lineForMission);

    if (result.infinite) {
      await this.watchdogKill();
      actualDisplay = "(infinite loop)";
      match = false;
    } else if (result.crash) {
      const tileX = this.miniTiles[result.index] ? this.miniTiles[result.index].x : OX + OW - 30;
      await this.hopClawTo(Phaser.Math.Clamp(tileX, OX + 20, OX + OW - 20));
      this.miniClawCrash(this._miniClawState.x);
      actualDisplay = `StringIndexOutOfBounds(${result.index})`;
      match = false;
    } else {
      await this.playVisual(mission, test, result);
      if (test.expectedOutput !== undefined) { actualDisplay = this.tickerText.text; match = actualDisplay === test.expectedOutput; }
      else if (test.expectedValue !== undefined) { actualDisplay = String(result.value); match = String(result.value) === String(test.expectedValue); }
      else { actualDisplay = result.value; match = result.value === test.expected; }
      this.rigLamp.setFillStyle(match ? C_GREEN : C_RED);
    }

    this.highlightCodeLine(null);
    this.updateReportRow(index, actualDisplay, match);
    await this.delay(200);
    return { match };
  }

  async playVisual(mission, test, result) {
    const input = test.input;
    const len = input.length;
    if (mission.mission === 1) {
      const idxTile = this.miniTiles[result.idx];
      if (idxTile) { await this.hopClawTo(idxTile.x); idxTile.drawBody(C_CYAN); }
      await this.delay(150);
    } else if (mission.mission === 2) {
      const idxTile = this.miniTiles[result.idx];
      if (idxTile) { await this.hopClawTo(idxTile.x); idxTile.drawBody(C_GREEN); this.pushTicker(`'${result.ch}'`); }
      await this.delay(150);
    } else if (mission.mission === 3) {
      // mirror _interpretMission3's exact loop bound + check logic so the dial
      // always matches the computed result, including the fixedZero+"<=" edge
      // case where the wrong-bound loop still runs one extra safe iteration.
      let count = 0;
      const checkCode = this.slotContents.check[0].container.getData("code");
      const condCode = this.slotContents.cond[0].container.getData("code");
      const fixedZero = checkCode.includes("charAt(0)");
      const upper = condCode.includes("<=") ? len : len - 1;
      for (let i = 0; i <= upper; i++) {
        if (!this._alive) return;
        const charIdx = fixedZero ? 0 : i;
        if (charIdx < 0 || charIdx >= len) break;
        const tile = this.miniTiles[charIdx];
        if (tile) await this.hopClawTo(tile.x);
        const ch = input[charIdx];
        const isMatch = ch === "t";
        if (tile) tile.drawBody(isMatch ? C_GREEN : 0x2a3a4a);
        if (isMatch) { count++; this.tickCounterDial(count); }
        await this.delay(70);
      }
    } else if (mission.mission === 4) {
      for (let i = len - 1; i >= 0; i--) {
        if (!this._alive) return;
        const tile = this.miniTiles[i];
        if (tile) { await this.hopClawTo(tile.x); tile.drawBody(C_CYAN); }
        this.pushTicker(input[i]);
        await this.delay(60);
      }
    } else if (mission.mission === 5) {
      for (let i = 0; i < len; i += 2) {
        if (!this._alive) return;
        const tile = this.miniTiles[i];
        if (tile) { await this.hopClawTo(tile.x); tile.drawBody(C_CYAN); }
        this.pushTicker(input[i]);
        await this.delay(70);
      }
      this.miniTiles.forEach((t, i) => { if (i % 2 !== 0) t.container.setAlpha(0.3); });
    } else if (mission.mission === 6) {
      // derive the ghost claw's position from whatever twin expression the
      // player actually built — never assume the correct mirror pattern.
      const twinCode = this.slotContents.twin[0].container.getData("code");
      const twinExprStr = this._twinExprString(twinCode);
      for (let i = 0; i < len; i++) {
        if (!this._alive) return;
        const twinIdx = this._evalIndexExpr(twinExprStr, i, len);
        const tile = this.miniTiles[i];
        if (tile) await this.hopClawTo(tile.x);
        if (twinIdx < 0 || twinIdx >= len || Number.isNaN(twinIdx)) break; // already filtered by result.crash upstream, guarded here defensively
        await this.ghostHopTo(this.miniTiles[twinIdx] ? this.miniTiles[twinIdx].x : OX + OW - 30);
        const match = input[i] === input[twinIdx];
        this.flashTilePair(i, twinIdx, match);
        await this.delay(90);
      }
    }
  }

  _twinExprString(twinCode) {
    if (twinCode === "s.charAt(s.length() - 1 - i)") return "s.length() - 1 - i";
    if (twinCode === "s.charAt(s.length() - i)") return "s.length() - i";
    if (twinCode === "s.charAt(s.length() - 1)") return "s.length() - 1";
    if (twinCode === "s.charAt(i)") return "i";
    return "s.length() - 1 - i";
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
      1: "Index 0 is the FIRST character. And Java cares about upper vs lower case.",
      2: "The last valid position is always one less than the count of characters.",
      3: "The moving part of your check should be the loop variable i, not a fixed number.",
      4: "To walk backwards, start at the LAST valid index, not the count itself.",
      5: "Skipping every other character means the loop variable needs to increase by 2 — and that change must be STORED.",
      6: "The character mirroring position i is always (length - 1 - i).",
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
    this.rigLamp.setFillStyle(C_GREEN);
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
    await this.bitSay(mission.postMissionNote || "Nice work — the rig confirms it's correct!");
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
    this.tweens.add({ targets: t, y: y - 30, alpha: 0, duration: 900, ease: "Cubic.easeOut", onComplete: () => t.destroy() });
    return t;
  }

  createConfetti(x, y, count = 26) {
    const p = this.add.particles(x, y, "l30_dot", {
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
    this.rigLamp.setFillStyle(0x333333);
    if (this.lampCone) this.tweens.add({ targets: this.lampCone, fillAlpha: 0, duration: 600 });

    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
    this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });

    const title = this.add.text(640, 240, "WORKSHOP CLOSED", { font: "bold 40px Arial", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
    this.tweens.add({
      targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut",
      onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }),
    });
    this.add.text(640, 310, `Score: ${this.score}`, { font: "20px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
    this.add.text(640, 350, `Missions Completed: ${this.currentMission} / ${MISSIONS.length}`, { font: "16px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);

    this._makeButton(640, 420, "REOPEN WORKSHOP", 220, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearMission();
    this.hideBubble();

    try { GameManager.completeLevel(29, Math.round((this.flawlessCount / MISSIONS.length) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("charAt_mastery"); } catch (_) {}
    try {
      localStorage.setItem("level30_results", JSON.stringify({
        level: 30, concept: "string_charAt", phase: "restructuring",
        score: this.score, missionsCompleted: 6, flawlessMissions: this.flawlessCount,
        totalRuns: this.runCount, failedRuns: this.failedRunCount, hintsUsed: this.hintCount,
        selfCorrections: this.selfCorrectionCount, livesRemaining: this.lives, attempts: this.attemptLog,
        timestamp: Date.now(),
      }));
    } catch (_) {}

    this.trilogyCelebration().then(() => { if (this._alive) this.showScoreTally(); });
  }

  async trilogyCelebration() {
    this.tweens.add({ targets: this.lampContainer, angle: 8, duration: 400, yoyo: true });
    this.buildMiniTileRow("BUILDER");
    this.clearTicker();
    for (let i = 0; i < 7; i++) {
      if (!this._alive) return;
      const tile = this.miniTiles[i];
      if (tile) { await this.hopClawTo(tile.x); tile.drawBody(C_GREEN); }
      this.pushTicker("BUILDER"[i]);
      await this.delay(90);
    }
    this.createConfetti(OX + OW / 2, OY + OH / 2, 40);
    await this.delay(700);
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
    panel.fillRoundedRect(350, 120, 580, 480, 16);
    panel.lineStyle(2, C_AMBER, 1);
    panel.strokeRoundedRect(350, 120, 580, 480, 16);

    const title = this.add.text(640, 168, "MASTER BUILDER", { font: "bold 36px Arial", color: HEX_GREEN }).setOrigin(0.5).setDepth(91).setScale(0);
    this.tweens.add({ targets: title, scale: 1, duration: 350, ease: "Back.easeOut" });

    const lines = [`MISSIONS: 6/6`, `FLAWLESS: ${this.flawlessCount}`, `SELF-CORRECTIONS: ${this.selfCorrectionCount}`, `HINTS: ${this.hintCount}`];
    lines.forEach((s, i) => {
      const t = this.add.text(500, 220 + i * 28, s, { font: "14px Arial", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 250, delay: 300 + i * 150 });
    });
    const totalText = this.add.text(500, 220 + 4 * 28, "TOTAL: 0", { font: "bold 24px Arial", color: HEX_AMBER }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: totalText, alpha: 1, duration: 250, delay: 1050 });
    const counter = { v: 0 };
    this.tweens.add({ targets: counter, v: this.score, duration: 1000, delay: 1050, onUpdate: () => totalText.setText(`TOTAL: ${Math.round(counter.v)}`) });

    const stars = this._starRating();
    for (let i = 0; i < 3; i++) {
      const earned = i < stars;
      const s = this.add.text(640 + (i - 1) * 60, 380, "★", { font: "40px Arial", color: earned ? HEX_AMBER : "#2a3040" }).setOrigin(0.5).setDepth(91).setScale(0);
      this.tweens.add({ targets: s, scale: 1, duration: 250, delay: 1650 + i * 200, ease: earned ? "Back.easeOut" : "Cubic.easeOut" });
    }

    const badge = this.add.container(640, 460).setDepth(91).setAlpha(0);
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillCircle(0, 0, 38);
    bg.lineStyle(3, C_AMBER, 1);
    bg.strokeCircle(0, 0, 38);
    bg.lineStyle(2, C_PURPLE, 1);
    bg.beginPath(); bg.arc(-24, 0, 8, Phaser.Math.DegToRad(-40), Phaser.Math.DegToRad(80), false); bg.strokePath();
    bg.beginPath(); bg.arc(-14, 0, 8, Phaser.Math.DegToRad(100), Phaser.Math.DegToRad(220), false); bg.strokePath();
    bg.lineStyle(2, C_GREEN, 1);
    bg.strokeCircle(0, 0, 7);
    bg.fillStyle(C_GREEN, 1);
    bg.fillCircle(0, -3, 2);
    bg.lineStyle(2, C_AMBER, 1);
    bg.lineBetween(16, 8, 26, -2);
    bg.strokeCircle(15, 9, 3);
    bg.strokeCircle(27, -3, 3);
    badge.add(bg);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 2200 });
    const badgeLbl = this.add.text(640, 505, "charAt() MASTERY", { font: "bold 14px Arial", color: HEX_AMBER }).setOrigin(0.5).setDepth(91).setAlpha(0);
    const badgeSub = this.add.text(640, 523, "Accretion ✓  Tuning ✓  Restructuring ✓", { font: "10px Arial", color: "#78909c" }).setOrigin(0.5).setDepth(91).setAlpha(0);
    const wingSub = this.add.text(640, 540, "STRING ACCESS WING COMPLETE — length() ✓ charAt() ✓", { font: "bold 11px Arial", color: HEX_PURPLE }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: [badgeLbl, badgeSub, wingSub], alpha: 1, duration: 300, delay: 2300 });

    this._makeButton(500, 575, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(760, 575, "NEXT METHOD →", 220, 44, { fill: 0x00733a, stroke: C_GREEN, textColor: "#ffffff" }, () => {
      if (this.scene.get("Level31Scene")) this.scene.start("Level31Scene");
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
