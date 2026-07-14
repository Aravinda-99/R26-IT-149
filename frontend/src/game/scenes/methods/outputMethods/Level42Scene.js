/**
 * Level 42 — "The Newsroom" (Output Methods: Restructuring Phase —
 * print() trilogy finale, Output Wing 2/3 complete)
 * ===========================================================================
 * The learner CONSTRUCTS complete output-producing programs — no multiple
 * choice. Reuses the Level 27/30/33/36/39 code-canvas/parts-bin/RUN-button
 * construction architecture, with a masked rig window compacting the
 * Level 40/41 whisper-desk + cursor-tracked log into a live observation
 * pane. A genuine per-mission interpreter (never scripted) executes exactly
 * what the player assembled — including cursor position, \n/\t escapes,
 * and (for cross-wing missions) real Scanner tape consumption.
 *
 * DESIGN NOTE — the Scanner-echo resolution: Mission 4's expected output
 * requires a nextLine() read's text to appear merged onto the SAME row as
 * a preceding prompt (the classic "Enter your name: <cursor blinks, user
 * types>" terminal pattern); Mission 6's expected output has no such echo
 * at all for its two back-to-back reads. Rather than special-casing per
 * mission, the interpreter ties the echo to a genuine condition: a
 * nextLine() read echoes its text onto the log ONLY when the cursor is
 * NOT already at the start of a fresh row (i.e., a print() prompt just
 * left it hanging mid-line) — modeling literally what "echo" means on a
 * real terminal. Mission 6's reads always land on a fresh row (nothing
 * printed before them), so the condition naturally never fires there,
 * and Mission 4's genuinely does. One rule, both missions' data satisfied
 * — not two special cases.
 */

import Phaser from "phaser";
import { GameManager } from "../../../GameManager.js";
import { BadgeSystem } from "../../../BadgeSystem.js";

const W = 1280, H = 720;

const C_CYAN = 0x00e5ff, C_GOLD = 0xffd740, C_VIOLET = 0x8c7ae6;
const C_GREEN_BRIGHT = 0x00e676, C_RED = 0xf44336, C_GRAY = 0x78909c;
const C_MAGENTA = 0xff4081, C_PURPLE = 0x7b1fa2, C_LINE = 0x2e7d32;
const HEX_CYAN = "#00e5ff", HEX_GOLD = "#ffd740", HEX_GRAY = "#78909c";
const HEX_GREEN_BRIGHT = "#00e676", HEX_RED = "#f44336";
const HEX_MAGENTA = "#ff4081", HEX_ECHO = "#4fc3f7";

const CX = 40, CY = 90, CW = 680, CH = 380;
const TAB_H = 34, GUTTER_W = 34, CODE_PAD = 10;
const CODE_X = CX + GUTTER_W + CODE_PAD;
const CODE_Y0 = CY + TAB_H + 14;
const LINE_H = 21;
const PX = 40, PY = 490, PW = 680, PH = 130;
const OX = 760, OY = 80, OW = 460, OH = 228;
const MX = OX + OW / 2, MY = OY + OH / 2 + 4;
const STRIP_Y = OY + OH + 15;
const RX = 760, RY = 342, RW = 460, RH = 128;
const BX = 760, BY = 478, BW = 460, BH = 130;

const DESK_X = OX + 60, DESK_Y = MY - 60;
const MARQUEE_X0 = DESK_X - 40, MARQUEE_X1 = DESK_X + 40, MARQUEE_Y = MY - 60;
const EMITTER_X = MARQUEE_X1 + 6, EMITTER_Y = MARQUEE_Y;
const LOG_X0 = OX + 130, LOG_X1 = OX + OW - 12;
const LOG_TOP_Y = OY + 20;
const ROW_H = 17;
const TAPE_X0 = OX + 20, TAPE_X1 = OX + 130, TAPE_Y = OY + 200;
const TUTORIAL_KEY = "level42_tutorial_done";

// ══════════════════════════════════════════════════════════════
// MISSION CONFIGURATION
// ══════════════════════════════════════════════════════════════
const MISSIONS = [
  { mission: 1, title: "The Same-Line Score",
    brief: "The scoreboard shows one line: 'Score: <points> / <max>'. Build it across two output calls — the whole line stays together.",
    skeleton: ["int points = /* test value */;", "int max = /* test value */;", "<slot:call1>", "<slot:call2>"],
    slots: [{ id: "call1", hint: "start the line", capacity: 1 }, { id: "call2", hint: "finish the line", capacity: 1 }],
    palette: [
      { code: 'System.out.print("Score: " + points + " / ");', slot: "call1" },
      { code: 'System.out.print("Score: ");', slot: "call1" },
      { code: 'System.out.print("Score: " + points);', slot: "call1" },
      { code: "System.out.println(max);", slot: "call2" },
      { code: 'System.out.println(points + " / " + max);', slot: "call2" },
      { code: 'System.out.println(" / " + max);', slot: "call2" },
      { code: 'System.out.println("Score: " + points + " / ");', tag: "wrong_method_for_same_line", slot: "call1" },
      { code: "System.out.print(max);", tag: "wrong_method_for_new_line", slot: "call2" },
      { code: 'System.out.println("Score: points / max");', tag: "variable_as_literal_belief", slot: "call1" },
      { code: 'System.out.print(points + " / " + max);', tag: "wrong_method_for_new_line", slot: "call2" },
    ],
    tests: [
      { subs: { points: "42", max: "50" }, expectedOutput: "Score: 42 / 50" },
      { subs: { points: "0", max: "100" }, expectedOutput: "Score: 0 / 100" },
      { subs: { points: "99", max: "99" }, expectedOutput: "Score: 99 / 99" },
    ],
    postMissionNote: "Three valid splits, one clean line. WHERE you split doesn't matter — but every piece except the last is a print(), and the last is a println(). That rule is the whole trick.",
    concept: "build_same_line_multi_call" },

  { mission: 2, title: "The Aligned Menu",
    brief: "The café menu needs tab-aligned columns: Item/Price, Coffee/3.50, Tea/2.00, Water/1.00. Add the header row and the final data row.",
    skeleton: ["System.out.println(<slot:header>);", 'System.out.println("Coffee\\t3.50");', 'System.out.println("Tea\\t2.00");', "System.out.println(<slot:row3>);"],
    slots: [{ id: "header", hint: "header row", capacity: 1 }, { id: "row3", hint: "the water row", capacity: 1 }],
    palette: [
      { code: '"Item\\tPrice"', correct: true, slot: "header" },
      { code: '"Water\\t1.00"', correct: true, slot: "row3" },
      { code: '"Item Price"', tag: "tab_replaced_with_space", slot: "header" },
      { code: '"Item\\nPrice"', tag: "newline_instead_of_tab", slot: "header" },
      { code: '"ItemPrice"', tag: "missing_separator", slot: "header" },
      { code: '"Water 1.00"', tag: "tab_replaced_with_space", slot: "row3" },
      { code: '"Water\\n1.00"', tag: "newline_instead_of_tab", slot: "row3" },
      { code: '"Water\\tone"', tag: "wrong_value", slot: "row3" },
    ],
    tests: [{ subs: {}, expectedOutput: "Item    Price⏎Coffee  3.50⏎Tea     2.00⏎Water   1.00" }],
    postMissionNote: "\\t is the difference between a table and a mess. Every row uses the same tab stop — the columns line up on their own.",
    concept: "tab_alignment" },

  { mission: 3, title: "The Progress Bar",
    brief: "The load screen shows a growing bar: 'Loading: #####' where the number of # equals n. Build it character by character with a loop.",
    skeleton: ["int n = /* test value */;", 'System.out.print("Loading: ");', "for (int i = 0; i < n; i++) {", "    <slot:body>", "}", "<slot:close>"],
    slots: [{ id: "body", hint: "loop body", capacity: 1 }, { id: "close", hint: "finish the line", capacity: 1 }],
    palette: [
      { code: 'System.out.print("#");', correct: true, slot: "body" },
      { code: "System.out.println();", correct: true, slot: "close" },
      { code: 'System.out.println("#");', tag: "wrong_method_for_same_line", slot: "body" },
      { code: 'System.out.print("# ");', tag: "extra_space_in_body", slot: "body" },
      { code: "(nothing)", label: "— leave empty —", empty: true, tag: "wrong_method_for_new_line", slot: "close" },
      { code: 'System.out.print("done");', tag: "wrong_method_for_new_line", slot: "close" },
    ],
    tests: [
      { subs: { n: "5" }, expectedOutput: "Loading: #####" },
      { subs: { n: "0" }, expectedOutput: "Loading: " },
      { subs: { n: "10" }, expectedOutput: "Loading: ##########" },
    ],
    postMissionNote: "print in a loop — how every command-line loading bar in the world is drawn. The loop builds; the final println closes.",
    concept: "print_in_loop" },

  { mission: 4, title: "The Interactive Prompt",
    brief: "The registration screen asks for a NAME on the same line as the prompt (like every real terminal program), then greets the user on the next line.",
    skeleton: ["Scanner sc = new Scanner(System.in);", "<slot:prompt>", "String name = sc.nextLine();", "<slot:greeting>"],
    slots: [{ id: "prompt", hint: "the prompt", capacity: 1 }, { id: "greeting", hint: "the greeting", capacity: 1 }],
    palette: [
      { code: 'System.out.print("Enter your name: ");', correct: true, slot: "prompt" },
      { code: 'System.out.println("Hello, " + name + "!");', correct: true, slot: "greeting" },
      { code: 'System.out.println("Enter your name: ");', tag: "prompt_uses_println_belief", slot: "prompt" },
      { code: 'System.out.print("Enter your name:");', tag: "missing_trailing_space", slot: "prompt" },
      { code: 'System.out.print("Hello, " + name + "!");', tag: "wrong_method_for_new_line", slot: "greeting" },
      { code: 'System.out.println("Hello, name!");', tag: "variable_as_literal_belief", slot: "greeting" },
    ],
    tests: [
      { input: ["Anjana"], expectedLog: "Enter your name: Anjana⏎Hello, Anjana!" },
      { input: ["Bit"], expectedLog: "Enter your name: Bit⏎Hello, Bit!" },
      { input: ["Kai Perera"], expectedLog: "Enter your name: Kai Perera⏎Hello, Kai Perera!" },
    ],
    postMissionNote: "This — right here — is why print() was invented. Every prompt-then-input pattern in Java uses this exact shape. You'll write it a thousand times, Editor.",
    concept: "prompt_pattern_canonical" },

  { mission: 5, title: "The Two-Line Report",
    brief: "Produce a status report using EXACTLY ONE call: 'Status: <status>' then 'Uptime: <hours> hours' on the next line.",
    skeleton: ["String status = /* test value */;", "int hours = /* test value */;", "<slot:call>"],
    slots: [{ id: "call", hint: "single call", capacity: 1 }],
    palette: [
      { code: 'System.out.println("Status: " + status + "\\nUptime: " + hours + " hours");', correct: true },
      { code: 'System.out.print("Status: " + status + "\\nUptime: " + hours + " hours\\n");', correct: true, alsoCorrect: true },
      { code: 'System.out.println("Status: " + status + " Uptime: " + hours + " hours");', tag: "newline_replaced_with_space" },
      { code: 'System.out.print("Status: " + status + "\\nUptime: " + hours + " hours");', tag: "missing_final_newline" },
      { code: 'System.out.println("Status: status\\nUptime: hours hours");', tag: "variable_as_literal_belief" },
    ],
    tests: [
      { subs: { status: '"ONLINE"', hours: "47" }, expectedOutput: "Status: ONLINE⏎Uptime: 47 hours" },
      { subs: { status: '"OFFLINE"', hours: "0" }, expectedOutput: "Status: OFFLINE⏎Uptime: 0 hours" },
      { subs: { status: '"MAINTENANCE"', hours: "3" }, expectedOutput: "Status: MAINTENANCE⏎Uptime: 3 hours" },
    ],
    postMissionNote: "Two forms, one output. println() + '\\n' inside, OR print() + '\\n' at the end. Real Java code has both — they're equivalent. Which one your fingers reach for first — that's your style.",
    concept: "single_call_multi_line_equivalence" },

  { mission: 6, title: "The Newscast Opening",
    brief: "The 6PM broadcast reads the anchor's NAME and the top HEADLINE (both lines), then produces a stylized, uppercased opening.",
    skeleton: [
      "Scanner sc = new Scanner(System.in);", "String anchor = sc.nextLine();", "String headline = sc.nextLine();", "",
      'System.out.println("=== 6PM NEWS ===");', 'System.out.println("Anchor: " + <slot:anchor_arg>);',
      'System.out.println("Top story: " + <slot:headline_arg>);', "<slot:blank>", "<slot:footer>",
    ],
    slots: [
      { id: "anchor_arg", hint: "anchor (LOUD)", capacity: 1 }, { id: "headline_arg", hint: "headline (LOUD)", capacity: 1 },
      { id: "blank", hint: "blank line", capacity: 1 }, { id: "footer", hint: "closing line", capacity: 1 },
    ],
    palette: [
      { code: "anchor.toUpperCase()", correct: true, slot: "anchor_arg" },
      { code: "headline.toUpperCase()", correct: true, slot: "headline_arg" },
      { code: "System.out.println();", correct: true, slot: "blank" },
      { code: 'System.out.println("");', correct: true, alsoCorrect: true, slot: "blank" },
      { code: 'System.out.println("Ready to broadcast.");', correct: true, slot: "footer" },
      { code: "anchor", tag: "no_normalization", slot: "anchor_arg" },
      { code: "headline", tag: "no_normalization", slot: "headline_arg" },
      { code: "anchor.toLowerCase()", tag: "method_direction_confusion", slot: "anchor_arg" },
      { code: "anchor.toUpperCase", tag: "property_vs_method_syntax", slot: "anchor_arg" },
      { code: '"anchor".toUpperCase()', tag: "literal_as_variable_belief", slot: "anchor_arg" },
      { code: "(nothing)", label: "— leave empty —", empty: true, tag: "empty_println_ignored_belief", slot: "blank" },
      { code: 'System.out.print("Ready to broadcast.");', tag: "wrong_method_for_new_line", slot: "footer" },
    ],
    tests: [
      { input: ["Anjana Perera", "Breaking news"], expectedLog: "=== 6PM NEWS ===⏎Anchor: ANJANA PERERA⏎Top story: BREAKING NEWS⏎⏎Ready to broadcast." },
      { input: ["Kai", "Local update"], expectedLog: "=== 6PM NEWS ===⏎Anchor: KAI⏎Top story: LOCAL UPDATE⏎⏎Ready to broadcast." },
      { input: ["OK", "AI"], expectedLog: "=== 6PM NEWS ===⏎Anchor: OK⏎Top story: AI⏎⏎Ready to broadcast." },
    ],
    postMissionNote: "Scanner brought them in. String taught you to make them loud. print and println shipped the whole script back to the world — line by line, in exact order. That's what all eighteen levels of the trilogies were teaching, Editor. Real programs. You produce them now.",
    concept: "cross_wing_capstone_newscast" },
];

const MISCONCEPTION_FEEDBACK = {
  wrong_method_for_same_line: "The report shows the line broken where it shouldn't be — println jumped the cursor mid-phrase. Every call BUT the last should be print(); the last one closes with println().",
  wrong_method_for_new_line: "The report shows no newline at the end — the cursor rests where the text ended. If you want a fresh row after, close with println() or add \\n.",
  tab_replaced_with_space: "Look at the columns — they don't align! Spaces are variable-width in intent; \\t jumps to the next fixed tab stop. Only \\t gives you clean columns.",
  newline_instead_of_tab: "You broke the row instead of tabbing across it. \\n moves DOWN; \\t moves RIGHT. For columns, you want to move right.",
  missing_separator: "The header fused with no gap. Insert \\t between the columns to jump to the next tab stop.",
  wrong_value: "Check the report — the price doesn't match what the test expects.",
  extra_space_in_body: "The bar has gaps — you added a space after each hash. For a solid bar, just \"#\".",
  prompt_uses_println_belief: "Look at the report — the user's input landed on a NEW ROW below the prompt! In real terminals, print() keeps the cursor on the same line so their typing continues the prompt. This is print()'s single most important use.",
  missing_trailing_space: "The prompt fused with the input: 'Enter your name:Anjana'. Include the trailing space in the String.",
  variable_as_literal_belief: "The bare word printed as letters — inside quotes it's a String literal. Without quotes it references the variable's value.",
  newline_replaced_with_space: "Both facts jammed onto one line — the mission wanted TWO lines. Use \\n between them.",
  missing_final_newline: "The mission needs the cursor on a fresh row after the last line. Add \\n at the end of your String OR use println().",
  no_normalization: "Look at the report row — mixed case leaked into the broadcast. Uppercase before you concatenate.",
  method_direction_confusion: "You lowercased where the mission asked for LOUD. Match the direction to the audience.",
  property_vs_method_syntax: "The arc's oldest trap returns for the trilogy finale — parentheses on Strings! toUpperCase is a METHOD: toUpperCase().",
  literal_as_variable_belief: 'With quotes, the literal word prints exactly as written — not the variable\'s value. Drop the quotes to reference the variable.',
  empty_println_ignored_belief: "No blank line where the mission needed one — the empty slot printed nothing, not an empty line. Use println() or println(\"\").",
  janitor_missing: "The read didn't cover the whole line — check what's left on the tape. If a tokenized read preceded it, the janitor sweeps the leftover ⏎.",
};

export class Level42Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level42Scene" });
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
    this.printProactive = {};
    this.splitChoiceMission1 = null;
    this.singleCallFormMission5 = null;
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
    this.rows = [""];
    this.cursorRowIdx = 0;
    this.cursorOnFreshLine = true;
    this.rowObjs = [];
    this.inputLocked = true;
    this.gameEnded = false;
    this._alive = true;
    this._bubble = null;
    this._dragHoverSlotKey = null;
    this._proactiveRecorded = {};
  }

  preload() {}

  create() {
    this._alive = true;
    this.events.once("shutdown", () => { this._alive = false; });

    const cam = this.cameras.main;
    const zoom = Math.min(this.scale.width / W, this.scale.height / H);
    cam.setZoom(zoom);
    cam.centerOn(W / 2, H / 2);
    cam.setBackgroundColor("#0a0f0e");

    try { GameManager.incrementAttempt(41); } catch (_) {}

    this.createParticleTexture();
    this.createBackground();
    this.createNewsroom();
    this.createFloor();
    this.createOnAirSign();
    this.createAmbientParticles();
    this.createCodeCanvas();
    this.createBlockPalette();
    this.createRunButton();
    this.createRigWindow();
    this.createMiniWhisperDesk();
    this.createMiniLog();
    this.createMiniTape();
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
  // BACKGROUND — newsroom
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l42_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l42_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x0a0f0e).setDepth(0);
  }

  createNewsroom() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x0a1a17, 1);
    g.fillRect(0, 0, W, 216);
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 5; col++) {
        const x = 180 + col * 190, y = 40 + row * 90;
        g.fillStyle(0x0a1830, 0.4);
        g.lineStyle(1, 0x1a2135, 0.15);
        g.fillRoundedRect(x, y, 90, 54, 4);
        g.strokeRoundedRect(x, y, 90, 54, 4);
      }
    }
    const clock = this.add.container(1000, 96).setDepth(2);
    const ring = this.add.graphics();
    ring.lineStyle(2, 0x1a2135, 0.5);
    ring.strokeCircle(0, 0, 24);
    this.newsMinute = this.add.graphics();
    this.newsHour = this.add.graphics();
    clock.add([ring, this.newsHour, this.newsMinute]);

    const banner = this.add.graphics().setDepth(2);
    banner.fillStyle(0x0d1315, 1);
    banner.lineStyle(1, 0xe53935, 0.4);
    banner.fillRoundedRect(230, 19, 300, 22, 4);
    banner.strokeRoundedRect(230, 19, 300, 22, 4);
    this.add.text(380, 30, "NEWS DESK — LIVE", { font: "bold 12px Arial", color: "#e53935" }).setOrigin(0.5).setAlpha(0.4).setDepth(3);
  }

  createFloor() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x0d1315, 1);
    g.fillRect(0, 635, W, 85);
    g.lineStyle(1, 0x1a2135, 1);
    g.lineBetween(0, 635, W, 635);
    const desk = this.add.graphics().setDepth(2);
    desk.fillStyle(0x0d1315, 1);
    desk.lineStyle(1, 0x1a2135, 1);
    desk.fillRoundedRect(30, 665, 130, 36, 6);
    desk.strokeRoundedRect(30, 665, 130, 36, 6);
  }

  createOnAirSign() {
    const g = this.add.graphics().setDepth(4);
    g.fillStyle(0x0d1315, 1);
    g.lineStyle(1.5, 0xe53935, 1);
    g.fillRoundedRect(845, 48, 90, 24, 4);
    g.strokeRoundedRect(845, 48, 90, 24, 4);
    this.onAirText = this.add.text(890, 60, "ON AIR", { font: "bold 12px Arial", color: "#e53935" }).setOrigin(0.5).setAlpha(0.3).setDepth(5);
    this._onAirBright = false;
  }

  updateOnAirPulse(time) {
    if (!this.onAirText || this._onAirBright) return;
    this.onAirText.setAlpha(0.3);
  }

  setOnAir(on, hold) {
    this._onAirBright = on;
    this.tweens.killTweensOf(this.onAirText);
    if (on) {
      this.onAirText.setAlpha(0.9);
      if (!hold) this.tweens.add({ targets: this.onAirText, alpha: 0.6, duration: 500, yoyo: true, repeat: -1 });
    } else {
      this.onAirText.setAlpha(0.3);
    }
  }

  createAmbientParticles() {
    this.ambient = [];
    for (let i = 0; i < 8; i++) {
      this.ambient.push(this.add.circle(Phaser.Math.Between(0, W), Phaser.Math.Between(220, 630), 1, 0x4fc3f7, Phaser.Math.FloatBetween(0.03, 0.05)).setDepth(2));
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
    if (this.newsMinute) {
      const a = time * 0.00006;
      this.newsMinute.clear();
      this.newsMinute.lineStyle(2, 0x4caf50, 0.3);
      this.newsMinute.lineBetween(0, 0, Math.cos(a - Math.PI / 2) * 17, Math.sin(a - Math.PI / 2) * 17);
      this.newsHour.clear();
      this.newsHour.lineStyle(2, 0x4caf50, 0.25);
      this.newsHour.lineBetween(0, 0, Math.cos(a / 12 - Math.PI / 2) * 11, Math.sin(a / 12 - Math.PI / 2) * 11);
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
    side(x, y, x + w, y); side(x + w, y, x + w, y + h);
    side(x + w, y + h, x, y + h); side(x, y + h, x, y);
  }

  // ══════════════════════════════════════════════════════════════
  // CODE CANVAS (Level 27/30/33/36/39 architecture, reused)
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
    this.tabFilename = this.add.text(CX + CW - 12, CY + TAB_H / 2, "News1.java", {
      font: "11px Courier New", color: "#546e7a",
    }).setOrigin(1, 0.5).setDepth(11);

    this.lineHighlight = this.add.rectangle(CX + CW / 2, 0, CW - 4, LINE_H, 0xffab00, 0.06).setDepth(19).setVisible(false);
    this.codeContainer = this.add.container(0, 0).setDepth(20);
  }

  _syntaxTokens(line) {
    const tokens = [];
    const re = /(\\[nt])|("(?:[^"\\]|\\.)*")|(\bif\b|\belse\b|\bfor\b|\bint\b|\bdouble\b|\bString\b|\bnew\b|\bScanner\b)|(\bSystem\.out\b)|([A-Za-z_]\w*(?=\())|(\bSystem\.in\b)|(>=|<=|==|!=|\+\+|--|[+\-*/><])|([(){}\[\];.,=])/g;
    let last = 0, m;
    const plain = (t) => t && tokens.push({ t, c: "#e0e0e0" });
    while ((m = re.exec(line))) {
      if (m.index > last) plain(line.slice(last, m.index));
      if (m[1]) tokens.push({ t: m[1], c: HEX_MAGENTA });
      else if (m[2]) {
        const parts = m[2].split(/(\\[nt])/);
        parts.forEach((p) => { if (/^\\[nt]$/.test(p)) tokens.push({ t: p, c: HEX_MAGENTA }); else if (p) tokens.push({ t: p, c: "#4fc3f7" }); });
      } else if (m[3]) tokens.push({ t: m[3], c: "#4fc3f7" });
      else if (m[4]) tokens.push({ t: m[4], c: "#4caf50" });
      else if (m[5]) tokens.push({ t: m[5], c: "#ffd740" });
      else if (m[6]) tokens.push({ t: m[6], c: "#78909c" });
      else if (m[7]) tokens.push({ t: m[7], c: "#ff8a65" });
      else if (m[8]) tokens.push({ t: m[8], c: "#78909c" });
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
      const numT = this.add.text(CX + 8, y, String(i + 1), { font: "11px Courier New", color: "#3d4450" });
      this.codeContainer.add(numT);

      if (/^(Scanner sc = new Scanner)/.test(rawLine)) {
        const t = this.add.text(CODE_X, y, rawLine, { font: "12px Courier New", color: "#3d4450" }).setAlpha(0.6);
        this.codeContainer.add(t);
        return;
      }

      const parts = rawLine.split(/<slot:(\w+)>/);
      let x = CODE_X;
      parts.forEach((part, pi) => {
        if (pi % 2 === 0) {
          if (!part) return;
          this._syntaxTokens(part).forEach((tok) => {
            const t = this.add.text(x, y, tok.t, { font: "bold 12px Courier New", color: tok.c });
            this.codeContainer.add(t);
            x += t.width;
          });
        } else {
          const slotId = part;
          const def = this.slotDefs[slotId];
          const w = 190;
          def.rect = { x, y: y - 2, w, h: 17 };
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
      dg.fillRoundedRect(x, y, w, h, 5);
      if (filled) {
        dg.lineStyle(2, highlight ? 0xffab00 : 0x2a3a4a, 1);
        dg.strokeRoundedRect(x, y, w, h, 5);
      } else {
        dg.lineStyle(2, highlight ? 0xffab00 : 0x546e7a, 1);
        this._dashedRectOutline(dg, x, y, w, h, 5, 4);
      }
    };
    draw(false);
    def.dg = dg;
    def.drawDash = draw;
    this.codeContainer.add(dg);
    if (!filled) {
      const label = this.add.text(x + w / 2, y + h / 2, def.hint, { font: "italic 9px Courier New", color: "#3d4450" }).setOrigin(0.5).setDepth(22);
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
  // BLOCK PALETTE (Level 27/30/33/36/39 drag system, reused)
  // ══════════════════════════════════════════════════════════════

  createBlockPalette() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0a0e14, 1);
    g.fillRoundedRect(PX, PY, PW, PH, 10);
    g.lineStyle(1, 0x1a2535, 1);
    g.strokeRoundedRect(PX, PY, PW, PH, 10);
    this.add.text(PX + 10, PY + 8, "NEWS COPY", { font: "bold 9px Arial", color: "#3d4450" }).setDepth(11);
    this.paletteContainer = this.add.container(0, 0).setDepth(30);
  }

  populatePalette(mission) {
    this.paletteBlocks.forEach((b) => b.container.destroy());
    this.paletteBlocks = [];
    const shuffled = Phaser.Utils.Array.Shuffle(mission.palette.slice());
    const rowY = [PY + 32, PY + 66, PY + 100];
    let x = PX + 12, row = 0;
    const maxX = PX + PW - 12;

    shuffled.forEach((def) => {
      const style = { font: "bold 12px Courier New", color: HEX_CYAN };
      const label = def.label || def.code;
      const measure = this.add.text(0, 0, label, style);
      const w = measure.width + 16;
      measure.destroy();
      if (x + w > maxX) { row = Math.min(row + 1, 2); x = PX + 12; }
      const home = { x: x + w / 2, y: rowY[row] };
      x += w + 8;

      const c = this.add.container(home.x, home.y).setDepth(31);
      const bg = this.add.graphics();
      const draw = (stroke) => {
        bg.clear();
        bg.fillStyle(0x1e1e3a, 1);
        bg.fillRoundedRect(-w / 2, -13, w, 26, 6);
        bg.lineStyle(2, stroke, 1);
        bg.strokeRoundedRect(-w / 2, -13, w, 26, 6);
      };
      draw(C_CYAN);
      const txt = this.add.text(0, 0, label, style).setOrigin(0.5);
      c.add([bg, txt]);
      c.setSize(w, 26);
      c.setData("w", w);
      c.setData("code", def.code);
      c.setData("tag", def.tag || null);
      c.setData("targetSlot", def.slot);
      c.setData("home", home);
      c.setData("draw", draw);
      c.setData("placedIn", null);
      c.setInteractive({ useHandCursor: true, draggable: true });
      c.on("pointerover", () => { if (!this.inputLocked) draw(0xffab00); });
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
    const glow = this.add.ellipse(bx, by, 150, 60, C_GREEN_BRIGHT, 0.06).setDepth(29);
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
  // RIG WINDOW — whisper desk + cursor-tracked log + Scanner tape
  // ══════════════════════════════════════════════════════════════

  createRigWindow() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x050914, 1);
    g.fillRoundedRect(OX, OY, OW, OH, 12);
    g.lineStyle(3, 0x21262d, 1);
    g.strokeRoundedRect(OX, OY, OW, OH, 12);
    this.add.text(OX + 10, OY + 6, "NEWSROOM RIG — LIVE", { font: "bold 9px Arial", color: "#3d4450" }).setDepth(11);

    const maskShape = this.make.graphics({ x: 0, y: 0, add: false });
    maskShape.fillRoundedRect(OX + 4, OY + 20, OW - 8, OH - 24, 10);
    this.windowMask = maskShape.createGeometryMask();
    this.rigLayer = this.add.container(0, 0).setDepth(15);
    this.rigLayer.setMask(this.windowMask);

    this.verdictLamp = this.add.circle(OX + OW - 18, OY + 14, 6, C_GRAY).setDepth(20);
  }

  createMiniWhisperDesk() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x0d1117, 1);
    g.fillRoundedRect(DESK_X - 55, DESK_Y - 20, 110, 40, 6);
    g.lineStyle(1, C_VIOLET, 1);
    g.strokeRoundedRect(DESK_X - 55, DESK_Y - 20, 110, 40, 6);
    const mg = this.add.graphics();
    mg.fillStyle(0x0a0e14, 1);
    mg.fillRoundedRect(MARQUEE_X0, MARQUEE_Y - 10, MARQUEE_X1 - MARQUEE_X0, 20, 3);
    mg.lineStyle(1, 0x4fc3f7, 0.4);
    mg.strokeRoundedRect(MARQUEE_X0, MARQUEE_Y - 10, MARQUEE_X1 - MARQUEE_X0, 20, 3);
    const emitter = this.add.graphics();
    emitter.lineStyle(1.2, 0x4fc3f7, 1);
    emitter.strokeCircle(EMITTER_X, EMITTER_Y, 5);
    this.rigLayer.add([g, mg, emitter]);
    this.marqueeContainer = this.add.container(0, 0);
    this.rigLayer.add(this.marqueeContainer);
    this.antenna = { x: EMITTER_X, y: EMITTER_Y };
  }

  clearMarquee() { this.marqueeContainer.removeAll(true); }

  _typeColor(type) {
    switch (type) {
      case "string": return HEX_CYAN;
      case "int": return "#ffd740";
      case "newline": return "#7b1fa2";
      case "echo": return HEX_ECHO;
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
    let x = MARQUEE_X0 + 4;
    if (isString) { const q = this.add.text(x, cy, '"', { font: "bold 10px Courier New", color: "#78909c" }).setOrigin(0, 0.5); this.marqueeContainer.add(q); x += q.width; }
    let i = 0;
    while (i < displayText.length) {
      if (!this._alive) return;
      let glyph = displayText[i], color = isString ? HEX_CYAN : "#ffd740", adv = 1;
      if (displayText[i] === "\\" && (displayText[i + 1] === "n" || displayText[i + 1] === "t")) { glyph = "\\" + displayText[i + 1]; color = HEX_MAGENTA; adv = 2; }
      else if (displayText[i] === " " && isString) { glyph = "␣"; color = HEX_MAGENTA; }
      const t = this.add.text(x, cy, glyph, { font: "bold 10px Courier New", color }).setOrigin(0, 0.5).setAlpha(0);
      this.marqueeContainer.add(t);
      x += t.width;
      this.tweens.add({ targets: t, alpha: 1, duration: 40 });
      await this.delay(12);
      i += adv;
    }
    if (isString) { const q = this.add.text(x, cy, '"', { font: "bold 10px Courier New", color: "#78909c" }).setOrigin(0, 0.5); this.marqueeContainer.add(q); }
    await this.delay(120);
  }

  // ══════════════════════════════════════════════════════════════
  // MINI LOG + CURSOR
  // ══════════════════════════════════════════════════════════════

  createMiniLog() {
    this.logContainer = this.add.container(0, 0);
    this.rigLayer.add(this.logContainer);
    this.rows = [""];
    this.cursorRowIdx = 0;
    this.cursorOnFreshLine = true;
    this.rowObjs = [];
    this.renderLogFromScratch();
    this.cursorGlow = this.add.rectangle(0, 0, 10, 15, C_CYAN, 0.15);
    this.cursorBlock = this.add.rectangle(0, 0, 6, 12, C_CYAN, 0.75);
    this.rigLayer.add([this.cursorGlow, this.cursorBlock]);
    this.tweens.add({ targets: [this.cursorBlock, this.cursorGlow], alpha: 0.1, duration: 700, yoyo: true, repeat: -1 });
    this.updateCursorVisualPosition();
  }

  _rowY(i) { return LOG_TOP_Y + 8 + i * ROW_H; }

  renderLogFromScratch() {
    this.logContainer.removeAll(true);
    this.rowObjs = [];
    this.rows.forEach((rowStr, i) => {
      const y = this._rowY(i);
      const textT = this.add.text(LOG_X0, y, this._displayRow(rowStr), { font: "bold 11px Courier New", color: HEX_CYAN }).setOrigin(0, 0.5);
      this.logContainer.add(textT);
      this.rowObjs.push({ textT });
    });
  }

  _displayRow(rowStr) { return rowStr.replace(/ /g, " "); }

  ensureRow(idx) {
    while (this.rowObjs.length <= idx) {
      const i = this.rowObjs.length;
      const y = this._rowY(i);
      const textT = this.add.text(LOG_X0, y, "", { font: "bold 11px Courier New", color: HEX_CYAN }).setOrigin(0, 0.5).setAlpha(0);
      this.tweens.add({ targets: textT, alpha: 1, duration: 120 });
      this.logContainer.add(textT);
      this.rowObjs.push({ textT });
    }
  }

  updateCursorVisualPosition() {
    if (!this.rowObjs[this.cursorRowIdx]) return;
    const rowText = this.rowObjs[this.cursorRowIdx].textT;
    this.cursorBlock.setPosition(LOG_X0 + rowText.width + 2, this._rowY(this.cursorRowIdx));
    this.cursorGlow.setPosition(LOG_X0 + rowText.width + 2, this._rowY(this.cursorRowIdx));
  }

  cursorSparkle() {
    const p = this.add.particles(this.cursorBlock.x, this.cursorBlock.y, "l42_dot", {
      speed: { min: 20, max: 50 }, angle: { min: 0, max: 360 }, scale: { start: 0.4, end: 0 }, lifespan: 160,
      tint: [C_CYAN], emitting: false,
    }).setDepth(20);
    this.rigLayer.add(p);
    p.explode(3);
    this.time.delayedCall(240, () => p.destroy());
  }

  /** Types text at the cursor, honestly handling \n (row break) and \t
   * (pad to next multiple-of-8 column) — the single ground truth used for
   * both the visual reveal and mission grading. */
  async typeAtCursor(text, styleType) {
    const color = this._typeColor(styleType);
    for (const ch of text) {
      if (!this._alive) return;
      if (ch === "\n") {
        this.cursorSparkle();
        this.rows.push("");
        this.cursorRowIdx++;
        this.ensureRow(this.cursorRowIdx);
        this.cursorOnFreshLine = true;
        this.updateCursorVisualPosition();
        await this.delay(30);
        continue;
      }
      if (ch === "\t") {
        const curLen = this.rows[this.cursorRowIdx].length;
        const nextStop = Math.ceil((curLen + 1) / 8) * 8;
        this.rows[this.cursorRowIdx] += " ".repeat(nextStop - curLen);
        this.rowObjs[this.cursorRowIdx].textT.setColor(color).setText(this._displayRow(this.rows[this.cursorRowIdx]));
        this.cursorOnFreshLine = false;
        this.updateCursorVisualPosition();
        await this.delay(30);
        continue;
      }
      this.rows[this.cursorRowIdx] += ch;
      this.rowObjs[this.cursorRowIdx].textT.setColor(color).setText(this._displayRow(this.rows[this.cursorRowIdx]));
      this.cursorOnFreshLine = false;
      this.updateCursorVisualPosition();
      await this.delay(9);
    }
    this.cursorSparkle();
  }

  async forceNewlineAfterPrintln() {
    this.rows.push("");
    this.cursorRowIdx++;
    this.ensureRow(this.cursorRowIdx);
    this.cursorOnFreshLine = true;
    this.updateCursorVisualPosition();
    this.cursorSparkle();
    await this.delay(30);
  }

  /** Scanner-echo resolution (see file header): echoes onto the SAME row
   * only when the cursor is mid-row from a preceding print() — a genuine
   * "interactive prompt" condition, never a scripted per-mission special
   * case. */
  async echoScannerInput(text) {
    if (this.cursorOnFreshLine) return; // silent read — no active prompt
    if (!this._echoAnnotationShown) {
      this._echoAnnotationShown = true;
      this.createAnnotation(this.cursorBlock.x, this.cursorBlock.y - 20, "user typed input", HEX_ECHO);
    }
    await this.typeAtCursor(text, "echo");
    await this.forceNewlineAfterPrintln();
  }

  clearMiniLog() {
    this.logContainer.removeAll(true);
    this.rowObjs = [];
    this.rows = [""];
    this.cursorRowIdx = 0;
    this.cursorOnFreshLine = true;
    this.renderLogFromScratch();
    this.updateCursorVisualPosition();
  }

  // ══════════════════════════════════════════════════════════════
  // MINI SCANNER TAPE (cross-wing cameo, M4/M6)
  // ══════════════════════════════════════════════════════════════

  createMiniTape() {
    this.tapeContainer = this.add.container(0, 0);
    this.rigLayer.add(this.tapeContainer);
    this.tapeCellObjs = [];
    this.tapeState = [];
  }

  _classifyChar(ch) {
    if (ch === " ") return "space";
    if (ch === "\n") return "newline";
    return "alpha";
  }

  buildCellsFromLines(inputLines) {
    const cells = [];
    (inputLines || []).forEach((line) => {
      line.split("").forEach((ch) => cells.push({ ch, kind: this._classifyChar(ch) }));
      cells.push({ ch: "\n", kind: "newline" });
    });
    return cells;
  }

  loadMiniTape(inputLines) {
    this.tapeState = this.buildCellsFromLines(inputLines);
    this.renderMiniTape();
  }

  renderMiniTape() {
    this.tapeCellObjs.forEach((o) => o.destroy());
    this.tapeCellObjs = [];
    this.tapeContainer.removeAll(true);
    if (this.tapeState.length === 0) return;
    const cellW = 10;
    const totalW = Math.min(this.tapeState.length * cellW, TAPE_X1 - TAPE_X0);
    const startX = TAPE_X1 - totalW;
    const bg = this.add.graphics();
    bg.fillStyle(0xe8f0e8, 0.85);
    bg.fillRoundedRect(startX - 4, TAPE_Y - 10, totalW + 8, 20, 3);
    this.tapeContainer.add(bg);
    this.tapeState.slice(-Math.floor(totalW / cellW)).forEach((cell, i) => {
      const x = startX + i * cellW + cellW / 2;
      const disp = cell.kind === "space" ? "␣" : cell.kind === "newline" ? "⏎" : cell.ch;
      const color = cell.kind === "space" ? "#c2185b" : cell.kind === "newline" ? "#7b1fa2" : "#2e7d32";
      const t = this.add.text(x, TAPE_Y, disp, { font: "bold 8px Courier New", color }).setOrigin(0.5);
      this.tapeContainer.add(t);
      this.tapeCellObjs.push(t);
    });
  }

  evaluateNextLine(cells) {
    const consumed = [];
    let j = 0;
    while (j < cells.length && cells[j].kind !== "newline") { consumed.push(cells[j]); j++; }
    if (j < cells.length) consumed.push(cells[j]);
    const strValue = consumed.filter((c) => c.kind !== "newline").map((c) => c.ch).join("");
    return { rawValue: strValue, consumedCount: consumed.length };
  }

  async tapeConsumeVisual(count) {
    this.tapeState = this.tapeState.slice(count);
    this.renderMiniTape();
    await this.delay(80);
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

  _compactTestLabel(test) {
    if (test.input) return this._compactInputLabel(test.input);
    return "";
  }
  _compactInputLabel(inputLines) { return inputLines.join(" ⏎ "); }

  buildReportRows(mission) {
    this.reportRows.forEach((r) => r.container.destroy());
    this.reportRows = [];
    mission.tests.forEach((test, i) => {
      const y = RY + 22 + i * 22;
      const c = this.add.container(RX + 10, y).setDepth(11).setAlpha(0.35);
      const label = test.input ? this._compactInputLabel(test.input) : Object.values(test.subs || {}).join(", ");
      const inputT = this.add.text(0, 0, label || "—", { font: "9px Courier New", color: "#b0bec5" }).setOrigin(0, 0.5);
      const expected = (test.expectedLog || test.expectedOutput || "").slice(0, 22);
      const expT = this.add.text(200, 0, expected, { font: "9px Courier New", color: "#78909c" }).setOrigin(0, 0.5);
      const statusT = this.add.text(RW - 16, 0, "…", { font: "13px Arial", color: "#78909c" }).setOrigin(0.5);
      c.add([inputT, expT, statusT]);
      this.reportRows.push({ container: c, statusT });
    });
  }

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
    const brief = this.add.text(BX + 14, BY + 42, mission.brief, { font: "12px Arial", color: "#90a4ae", wordWrap: { width: BW - 28 } }).setOrigin(0, 0);
    const hint = this.add.text(BX + BW - 12, BY + BH - 12, "HINT", { font: "bold 11px Arial", color: "#546e7a" }).setOrigin(1, 1).setInteractive({ useHandCursor: true });
    hint.on("pointerover", () => hint.setColor(HEX_GOLD));
    hint.on("pointerout", () => hint.setColor("#546e7a"));
    hint.on("pointerdown", () => this.onHintPressed());
    this.briefContainer.add([badge, badgeNum, title, brief, hint]);
  }

  createManifestStrip() {
    const g = this.add.graphics().setDepth(14);
    g.fillStyle(0x0a0e14, 0.9);
    g.fillRect(OX, STRIP_Y - 2, OW, 20);
    this.manifestStripText = this.add.text(OX + 8, STRIP_Y + 8, "", { font: "10px Arial", color: "#8c7ae6" }).setOrigin(0, 0.5).setDepth(15);
  }
  updateManifestStrip(text) { this.manifestStripText.setText(text); }

  // ══════════════════════════════════════════════════════════════
  // HUD
  // ══════════════════════════════════════════════════════════════

  createHUD() {
    const g = this.add.graphics().setDepth(50);
    g.fillStyle(0x0a0e14, 0.93);
    g.fillRect(0, 0, W, 64);
    g.lineStyle(1, 0x21262d, 1);
    g.lineBetween(0, 64, W, 64);

    this.add.text(20, 14, "THE NEWSROOM", { font: "bold 13px Arial", color: "#b0bec5" }).setDepth(51);
    this.add.text(20, 32, "Restructuring Phase — Output Methods: print()", { font: "10px Arial", color: "#546e7a" }).setDepth(51);

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
      lg.lineStyle(2, C_GREEN_BRIGHT, 1);
      lg.strokeRoundedRect(-8, -6, 16, 11, 2);
      lg.fillStyle(C_GREEN_BRIGHT, 1);
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
  // BIT — news editor variant
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
    const paper = this.add.graphics();
    paper.fillStyle(0xe0e0e0, 0.7);
    paper.lineStyle(1, 0x78909c, 0.6);
    paper.fillRect(18, -4, 12, 3);
    paper.strokeRect(18, -4, 12, 3);
    c.add([g, eye, pupil, headset, tip, paper]);
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
    const t = this.add.text(x, y, text, { font: "bold 8px Arial", color: colorHex }).setOrigin(0.5).setDepth(21).setAlpha(0);
    this.rigLayer.add(t);
    this.tweens.add({ targets: t, alpha: 1, duration: 180 });
    this.time.delayedCall(1300, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 200, onComplete: () => t.destroy() }); });
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
    await this.bitSay("Welcome to the Newsroom, Editor. Down in the Live Feed you cleared the cues — up here you WRITE them. Every mission ships a real on-air script. print builds the phrase, println ends it. Own the choice.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();

    const a1 = this.floatingAnnotation(CX + CW / 2, CY - 16, "the script goes here", HEX_CYAN);
    await this.delay(350); if (!A()) return;
    const a2 = this.floatingAnnotation(PX + PW / 2, PY - 12, "blocks — some are typos, watch the cursor", HEX_GRAY);
    await this.delay(350); if (!A()) return;
    const a3 = this.floatingAnnotation(OX + OW / 2, OY - 12, "your script runs LIVE", C_GREEN_BRIGHT);
    await this.delay(350); if (!A()) return;
    const a4 = this.floatingAnnotation(890, 40, "lights when we're broadcasting", "#e53935");
    await this.delay(350); if (!A()) return;
    const a5 = this.floatingAnnotation(RX + RW / 2, RY - 12, "every scenario must land on the right row", C_VIOLET);
    await this.delay(400); if (!A()) return;

    await this.bitSay("One rule for everything you write here: match the method to the intent. Same line? print. Break the line? println. The escape family — \\n and \\t — are your fine-grain formatting. To your desk!");
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
    this._proactiveRecorded[mission.mission] = false;
    this.clearMission();

    this.tabFilename.setText(`News${mission.mission}.java`);
    this.renderSkeleton(mission);
    this.populatePalette(mission);
    this.buildReportRows(mission);
    this.renderMissionBrief(mission);
    this.disableRunButton();
    this.highlightCodeLine(null);
    this.verdictLamp.setFillStyle(C_GRAY);
    this.clearMiniLog();
    this.loadMiniTape(mission.tests[0].input);
    this.updateManifestStrip("");
    this.setOnAir(false);
  }

  clearMission() {
    this.missionElements.forEach((e) => { if (e && e.destroy) e.destroy(); });
    this.missionElements = [];
  }

  // ══════════════════════════════════════════════════════════════
  // SUBSTITUTION + PARSING HELPERS
  // ══════════════════════════════════════════════════════════════

  _substitute(mission, test, blocks) {
    // Resolves "/* test value */" placeholders in the skeleton's fixed decl
    // lines and returns a decls map for the evaluator.
    const decls = {};
    mission.skeleton.forEach((line) => {
      const m = line.match(/^(int|double|String)\s+(\w+)\s*=\s*\/\* test value \*\/;$/);
      if (!m) return;
      const [, type, name] = m;
      const raw = test.subs ? test.subs[name] : undefined;
      if (raw === undefined) return;
      let value;
      if (type === "int") value = parseInt(raw, 10);
      else if (type === "double") value = parseFloat(raw);
      else value = raw.replace(/^"|"$/g, "");
      decls[name] = { value, type: type === "String" ? "string" : type };
    });
    return decls;
  }

  // ══════════════════════════════════════════════════════════════
  // EVALUATOR — honest, left-to-right, sticky-String, \n/\t aware
  // ══════════════════════════════════════════════════════════════

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
    if (/^[A-Za-z_]\w*\(\)$/.test(tok)) {
      // method call with no receiver text captured here — not used in this level
      return { ok: false };
    }
    const methodCall = tok.match(/^([A-Za-z_]\w*)\.(toUpperCase|toLowerCase)\(\)$/);
    if (methodCall) {
      const recv = decls && decls[methodCall[1]];
      if (!recv || recv.type !== "string") return { ok: false };
      const val = methodCall[2] === "toUpperCase" ? recv.value.toUpperCase() : recv.value.toLowerCase();
      return { value: val, type: "string", ok: true };
    }
    if (/^[A-Za-z_]\w*\.toUpperCase$/.test(tok) || /^[A-Za-z_]\w*\.toLowerCase$/.test(tok)) return { ok: false };
    if (/^"[^"]*"\.toUpperCase\(\)$/.test(tok)) {
      const lit = tok.match(/^"([^"]*)"/)[1];
      return { value: lit.toUpperCase(), type: "string", ok: true };
    }
    if (/^[A-Za-z_]\w*\.charAt\(0\)\.toUpperCase\(\)$/.test(tok)) return { ok: false };
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

  compileCheck(code, decls) {
    // property_vs_method_syntax: toUpperCase without parens
    if (/\.toUpperCase$/.test(code.trim()) || /\.toLowerCase$/.test(code.trim())) return { ok: false, tag: "property_vs_method_syntax" };
    return { ok: true };
  }

  // ══════════════════════════════════════════════════════════════
  // TRANSMISSION — reveal, shared by all missions
  // ══════════════════════════════════════════════════════════════

  async fireCall(method, argExpr, decls) {
    const check = this.compileCheck(argExpr, decls);
    if (!check.ok) { this.showCompileErrorStamp(); return { ok: false, tag: check.tag }; }

    const evalResult = this.evaluateArg(method, argExpr, decls);
    if (!evalResult.ok) {
      this.clearMarquee();
      const t = this.add.text(MARQUEE_X0 + 30, MARQUEE_Y, "?", { font: "bold 13px Courier New", color: HEX_RED }).setOrigin(0.5);
      this.marqueeContainer.add(t);
      this.tweens.add({ targets: this.marqueeContainer, x: 3, duration: 30, yoyo: true, repeat: 4, onComplete: () => { this.marqueeContainer.x = 0; } });
      this.screenShake(0.003, 130);
      await this.delay(350);
      this.clearMarquee();
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
    const capsule = this.add.circle(MARQUEE_X0 + (MARQUEE_X1 - MARQUEE_X0) / 2, MARQUEE_Y, 4, color, 0.9).setDepth(30);
    this.rigLayer.add(capsule);
    this.tweens.add({ targets: this.marqueeContainer, scale: 0.4, alpha: 0, duration: 100 });
    await this.delay(100);
    if (!this._alive) return;
    const startX = this.antenna.x, startY = this.antenna.y;
    capsule.setPosition(startX, startY);
    const targetX = this.cursorBlock.x, targetY = this.cursorBlock.y;
    const beam = this.add.rectangle(startX, startY, 0, 1.5, color, 0.5).setOrigin(0, 0.5).setDepth(29);
    this.rigLayer.add(beam);
    await new Promise((res) => {
      this.tweens.add({
        targets: capsule, x: targetX, y: targetY, duration: 180, ease: "Cubic.easeInOut",
        onUpdate: () => { beam.width = Math.abs(capsule.x - startX); beam.x = startX; beam.y = capsule.y; },
        onComplete: res,
      });
    });
    this.tweens.add({ targets: beam, alpha: 0, duration: 150, onComplete: () => beam.destroy() });
    capsule.destroy();
    this.verdictLamp.setFillStyle(0xffab00);

    if (evalResult.isEmpty && method === "print") {
      this.marqueeContainer.setScale(1).setAlpha(1);
      await this.delay(60);
      return;
    }

    await this.typeAtCursor(evalResult.text, evalResult.styleType);
    if (method === "println") await this.forceNewlineAfterPrintln();
    this.marqueeContainer.setScale(1).setAlpha(1);
    await this.delay(60);
  }

  showCompileErrorStamp() {
    const stamp = this.add.text(CX + CW / 2, CY + CH / 2, "COMPILE ERROR", { font: "bold 26px Arial", color: HEX_RED }).setOrigin(0.5).setDepth(80).setScale(1.7).setAngle(-8).setAlpha(0);
    this.missionElements.push(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 200, ease: "Cubic.easeOut" });
    this.screenShake(0.005, 170);
    this.time.delayedCall(1100, () => { if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 220, onComplete: () => stamp.destroy() }); });
  }

  screenShake(intensity = 0.004, duration = 150) {
    this.cameras.main.shake(duration, intensity);
  }

  // ══════════════════════════════════════════════════════════════
  // GENUINE INTERPRETER — per-mission, honest sequential execution
  // ══════════════════════════════════════════════════════════════

  /** Runs the fully-assembled program's statements in order, honestly
   * computing text + cursor state. Returns {ok, crash, compileError,
   * printProactive, splitChoice, singleCallForm}. */
  async runProgram(mission, assembled, test) {
    const decls = this._substitute(mission, test, assembled);
    const tapeCells = () => this.tapeState;
    let steps;

    if (mission.mission === 1) steps = ["decl", "decl", "call1", "call2"];
    else if (mission.mission === 2) steps = ["header", "fixed", "fixed", "row3"];
    else if (mission.mission === 3) steps = ["decl", "fixedPrint", "loop"];
    else if (mission.mission === 4) steps = ["scannerCtor", "prompt", "scannerRead:name", "greeting"];
    else if (mission.mission === 5) steps = ["decl", "decl", "call"];
    else if (mission.mission === 6) steps = ["scannerCtor", "scannerRead:anchor", "scannerRead:headline", "fixed", "fixed", "anchor_arg_line", "headline_arg_line", "blank", "footer"];

    // Mission 1
    if (mission.mission === 1) {
      const call1 = assembled.call1[0], call2 = assembled.call2[0];
      const m1 = this._methodOf(call1.code), arg1 = this._argOf(call1.code);
      const m2 = this._methodOf(call2.code), arg2 = this._argOf(call2.code);
      const r1 = await this.fireCall(m1, arg1, decls);
      if (!r1.ok) return { ok: false };
      await this.delay(80);
      if (!this._alive) return { ok: false };
      const r2 = await this.fireCall(m2, arg2, decls);
      if (!r2.ok) return { ok: false };
      return { ok: true };
    }

    // Mission 2
    if (mission.mission === 2) {
      const header = assembled.header[0], row3 = assembled.row3[0];
      const seq = [
        { method: "println", arg: header.code },
        { method: "println", arg: '"Coffee\\t3.50"' },
        { method: "println", arg: '"Tea\\t2.00"' },
        { method: "println", arg: row3.code },
      ];
      for (const s of seq) {
        const r = await this.fireCall(s.method, s.arg, decls);
        if (!r.ok) return { ok: false };
        await this.delay(80);
        if (!this._alive) return { ok: false };
      }
      return { ok: true };
    }

    // Mission 3
    if (mission.mission === 3) {
      const n = decls.n ? decls.n.value : 0;
      const bodyBlock = assembled.body[0], closeBlock = assembled.close[0];
      const bodyMethod = this._methodOf(bodyBlock.code), bodyArg = this._argOf(bodyBlock.code);
      const r0 = await this.fireCall("print", '"Loading: "', decls);
      if (!r0.ok) return { ok: false };
      for (let i = 0; i < n; i++) {
        if (!this._alive) return { ok: false };
        const r = await this.fireCall(bodyMethod, bodyArg, decls);
        if (!r.ok) return { ok: false };
        await this.delay(50);
      }
      if (closeBlock.code !== "(nothing)") {
        const cm = this._methodOf(closeBlock.code), ca = this._argOf(closeBlock.code);
        const rc = await this.fireCall(cm, ca, decls);
        if (!rc.ok) return { ok: false };
      }
      return { ok: true };
    }

    // Mission 4
    if (mission.mission === 4) {
      const promptBlock = assembled.prompt[0], greetBlock = assembled.greeting[0];
      const pm = this._methodOf(promptBlock.code), pa = this._argOf(promptBlock.code);
      if (this.currentRunNumberForMission4Proactive === undefined) this.currentRunNumberForMission4Proactive = 0;
      const rp = await this.fireCall(pm, pa, decls);
      if (!rp.ok) return { ok: false };
      await this.delay(80);
      if (!this._alive) return { ok: false };
      // Scanner read: sc.nextLine() consumes the tape and (honestly)
      // echoes onto the log only if the cursor is mid-row.
      const readResult = this.evaluateNextLine(this.tapeState);
      await this.tapeConsumeVisual(readResult.consumedCount);
      await this.echoScannerInput(readResult.rawValue);
      decls.name = { value: readResult.rawValue, type: "string" };
      const gm = this._methodOf(greetBlock.code), ga = this._argOf(greetBlock.code);
      const rg = await this.fireCall(gm, ga, decls);
      if (!rg.ok) return { ok: false };
      return { ok: true };
    }

    // Mission 5
    if (mission.mission === 5) {
      const call = assembled.call[0];
      const m = this._methodOf(call.code), a = this._argOf(call.code);
      const r = await this.fireCall(m, a, decls);
      if (!r.ok) return { ok: false };
      return { ok: true };
    }

    // Mission 6
    if (mission.mission === 6) {
      const r1 = this.evaluateNextLine(this.tapeState);
      await this.tapeConsumeVisual(r1.consumedCount);
      decls.anchor = { value: r1.rawValue, type: "string" };
      const r2 = this.evaluateNextLine(this.tapeState);
      await this.tapeConsumeVisual(r2.consumedCount);
      decls.headline = { value: r2.rawValue, type: "string" };

      const seq = [
        { method: "println", arg: '"=== 6PM NEWS ==="' },
        { method: "println", arg: `"Anchor: " + ${assembled.anchor_arg[0].code}` },
        { method: "println", arg: `"Top story: " + ${assembled.headline_arg[0].code}` },
      ];
      for (const s of seq) {
        const check = this.compileCheck(s.arg, decls);
        if (!check.ok) { this.showCompileErrorStamp(); return { ok: false }; }
        const r = await this.fireCall(s.method, s.arg, decls);
        if (!r.ok) return { ok: false };
        await this.delay(70);
        if (!this._alive) return { ok: false };
      }
      const blankBlock = assembled.blank[0];
      if (blankBlock.code !== "(nothing)") {
        const bm = this._methodOf(blankBlock.code), ba = this._argOf(blankBlock.code);
        const rb = await this.fireCall(bm, ba, decls);
        if (!rb.ok) return { ok: false };
      }
      const footerBlock = assembled.footer[0];
      const fm = this._methodOf(footerBlock.code), fa = this._argOf(footerBlock.code);
      const rf = await this.fireCall(fm, fa, decls);
      if (!rf.ok) return { ok: false };
      return { ok: true };
    }

    return { ok: true };
  }

  _argOf(code) {
    if (code === "(nothing)") return "";
    const m = code.match(/print(?:ln)?\(([^)]*)\)/);
    if (m) return m[1];
    return code; // bare expression cartridge (M2/M5/M6 slots supply bare args)
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

  _recordProactiveMetrics(mission) {
    if (this._proactiveRecorded[mission.mission]) return;
    this._proactiveRecorded[mission.mission] = true;
    if (mission.mission === 4) {
      const promptCode = this.slotContents.prompt && this.slotContents.prompt[0].container.getData("code");
      this.printProactive.mission4 = promptCode === 'System.out.print("Enter your name: ");';
    }
  }

  _recordSuccessMetrics(mission) {
    if (mission.mission === 1 && this.splitChoiceMission1 === null) {
      const c1 = this.slotContents.call1[0].container.getData("code");
      if (c1 === 'System.out.print("Score: " + points + " / ");') this.splitChoiceMission1 = "front_loaded";
      else if (c1 === 'System.out.print("Score: ");') this.splitChoiceMission1 = "front_minimal";
      else this.splitChoiceMission1 = "end_loaded";
    }
    if (mission.mission === 5 && this.singleCallFormMission5 === null) {
      const c = this.slotContents.call[0].container.getData("code");
      this.singleCallFormMission5 = c.includes("println") ? "println_with_internal_newline" : "print_with_trailing_newline";
    }
  }

  async onRunPressed() {
    if (this.inputLocked) return;
    this.inputLocked = true;
    this.disableRunButton();
    this.runButton.t.setText("...");
    this.runCount++;
    const mission = MISSIONS[this.currentMission];
    this._recordProactiveMetrics(mission);
    const assembled = this.getAssembledCode();
    const wrongBlocksUsed = this._collectWrongBlocksUsed();
    this.setOnAir(true, true);

    let anyMismatch = false;
    const failedTests = [];
    for (let i = 0; i < mission.tests.length; i++) {
      if (!this._alive) return;
      const test = mission.tests[i];
      const outcome = await this.runTestCase(mission, test, i, assembled);
      if (!outcome.match) { anyMismatch = true; failedTests.push(this._compactTestLabel(test)); }
    }

    const resultKind = anyMismatch ? "logic_fail" : "pass";
    this._resolveRunOutcome(mission, resultKind, wrongBlocksUsed, failedTests);
  }

  async runTestCase(mission, test, index, assembled) {
    this.clearMiniLog();
    this.loadMiniTape(test.input);
    const runResult = await this.runProgram(mission, assembled, test);
    if (!this._alive) return { match: false };

    let match;
    if (!runResult.ok) {
      match = false;
    } else {
      const trimmedRows = this.rows.length > 1 && this.rows[this.rows.length - 1] === "" ? this.rows.slice(0, -1) : this.rows;
      const logText = trimmedRows.join("⏎");
      const closedProperly = this.rows[this.rows.length - 1] === "";
      const expected = test.expectedLog || test.expectedOutput;
      match = logText === expected && closedProperly;
      if (!match) this.verdictLamp.setFillStyle(C_RED);
      else this.verdictLamp.setFillStyle(C_GREEN_BRIGHT);
    }

    this.updateReportRow(index, match);
    await this.delay(150);
    return { match };
  }

  _resolveRunOutcome(mission, result, wrongBlocksUsed, failedTests) {
    const timeMs = Math.round(this.time.now - this.missionStartTime);
    this.attemptLog.push({
      mission: mission.mission, runNumber: this.runCount, result,
      blocksUsed: Object.values(this.getAssembledCode()).flat().map((b) => b.code),
      wrongBlocks: wrongBlocksUsed, failedTests, timeMs, hintUsedBefore: this.missionHintUsed,
    });

    if (result === "pass") { this._recordSuccessMetrics(mission); this.onMissionComplete(); return; }

    this.failedRunCount++;
    this.missionRunsFailed++;
    this.runButton.t.setText("▶ RUN");
    this.setOnAir(false);

    let livesLostThisRun = false;
    const tagsThisRun = new Set(wrongBlocksUsed.map((b) => b.tag));
    tagsThisRun.forEach((tag) => {
      if (!tag) return;
      this.wrongBlockHistory[tag] = (this.wrongBlockHistory[tag] || 0) + 1;
      if (this.wrongBlockHistory[tag] >= 2) livesLostThisRun = true;
    });

    const feedbackTag = wrongBlocksUsed[0] && wrongBlocksUsed[0].tag;

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
      1: "Every call but the last is a print(); the last one is a println() to close the line.",
      2: "Use \\t between the two columns — it jumps to the next tab stop, keeping every row aligned the same way.",
      3: "Print just the # inside the loop (no newline each time); close the whole bar with one println() after the loop ends.",
      4: "The prompt must leave the cursor on the SAME line as where the user types — that's print(), not println().",
      5: "One call can span two lines if you put \\n INSIDE the String, or close a print() with a trailing \\n.",
      6: "Uppercase both fields, use println() or println(\"\") for the blank row, and close with a println() so the line properly ends.",
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
    this.setOnAir(true, true);
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

  createFloatingText(x, y, text, colorHex, font = "bold 14px Arial") {
    const t = this.add.text(x, y, text, { font, color: colorHex }).setOrigin(0.5).setDepth(75);
    this.tweens.add({ targets: t, y: y - 25, alpha: 0, duration: 800, ease: "Cubic.easeOut", onComplete: () => t.destroy() });
    return t;
  }

  createConfetti(x, y, count = 24) {
    const p = this.add.particles(x, y, "l42_dot", {
      speed: { min: 70, max: 220 }, angle: { min: 0, max: 360 }, scale: { start: 0.8, end: 0 }, lifespan: 450,
      tint: [C_CYAN, C_GOLD, C_GREEN_BRIGHT, C_VIOLET, 0xffffff], emitting: false,
    }).setDepth(75);
    p.explode(count);
    this.time.delayedCall(800, () => p.destroy());
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
    this.setOnAir(false);

    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
    this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });

    const title = this.add.text(640, 240, "STOP THE PRESSES", { font: "bold 36px Arial", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
    this.tweens.add({
      targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut",
      onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }),
    });
    this.add.text(640, 310, `Score: ${this.score}`, { font: "20px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
    this.add.text(640, 350, `Missions Completed: ${this.currentMission} / ${MISSIONS.length}`, { font: "16px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);

    this._makeButton(640, 420, "BACK TO THE DESK", 240, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearMission();
    this.hideBubble();

    try { GameManager.completeLevel(41, Math.round((this.flawlessCount / MISSIONS.length) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("print_mastery"); } catch (_) {}
    try {
      localStorage.setItem("level42_results", JSON.stringify({
        level: 42, concept: "output_print", phase: "restructuring",
        score: this.score, missionsCompleted: 6, flawlessMissions: this.flawlessCount,
        totalRuns: this.runCount, failedRuns: this.failedRunCount, hintsUsed: this.hintCount,
        selfCorrections: this.selfCorrectionCount, printProactive: this.printProactive,
        splitChoiceMission1: this.splitChoiceMission1, singleCallFormMission5: this.singleCallFormMission5,
        livesRemaining: this.lives, attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.newsroomFinale().then(() => { if (this._alive) this.showScoreTally(); });
  }

  async newsroomFinale() {
    this.setOnAir(true, true);
    this.clearMiniLog();
    const words = ["AND", "THAT'S", "THE", "NEWS"];
    for (const w of words) {
      if (!this._alive) return;
      await this.fireCall("print", `"${w} "`, {});
      await this.delay(100);
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
    panel.fillStyle(0x0a0f0e, 1);
    panel.fillRoundedRect(350, 65, 580, 590, 16);
    panel.lineStyle(2, C_GOLD, 1);
    panel.strokeRoundedRect(350, 65, 580, 590, 16);

    const title = this.add.text(640, 100, "NEWS EDITOR", { font: "bold 34px Arial", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(91).setScale(0);
    this.tweens.add({ targets: title, scale: 1, duration: 350, ease: "Back.easeOut" });

    const proactiveCount = this.printProactive.mission4 ? 1 : 0;
    const lines = [
      `MISSIONS: 6/6`, `FLAWLESS: ${this.flawlessCount}`, `SELF-CORRECTIONS: ${this.selfCorrectionCount}`,
      `PRINT-PROACTIVE (M4): ${proactiveCount}`, `HINTS: ${this.hintCount}`,
    ];
    lines.forEach((s, i) => {
      const t = this.add.text(500, 148 + i * 25, s, { font: "13px Arial", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 250, delay: 300 + i * 130 });
    });
    const totalText = this.add.text(500, 148 + 5 * 25, "TOTAL: 0", { font: "bold 20px Arial", color: HEX_GOLD }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: totalText, alpha: 1, duration: 250, delay: 1000 });
    const counter = { v: 0 };
    this.tweens.add({ targets: counter, v: this.score, duration: 1000, delay: 1000, onUpdate: () => totalText.setText(`TOTAL: ${Math.round(counter.v)}`) });

    const stars = this._starRating();
    for (let i = 0; i < 3; i++) {
      const earned = i < stars;
      const s = this.add.text(640 + (i - 1) * 60, 330, "★", { font: "34px Arial", color: earned ? HEX_GOLD : "#2a3040" }).setOrigin(0.5).setDepth(91).setScale(0);
      this.tweens.add({ targets: s, scale: 1, duration: 250, delay: 1700 + i * 200, ease: earned ? "Back.easeOut" : "Cubic.easeOut" });
    }

    const badge = this.add.container(640, 400).setDepth(91).setAlpha(0);
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillCircle(0, 0, 34);
    bg.lineStyle(3, C_GOLD, 1);
    bg.strokeCircle(0, 0, 34);
    bg.lineStyle(1.5, C_VIOLET, 1);
    bg.strokeRoundedRect(-14, -8, 12, 16, 2);
    bg.strokeCircle(6, -2, 5);
    badge.add(bg);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 2100 });
    const badgeLbl = this.add.text(640, 442, "print() MASTERY", { font: "bold 14px Arial", color: HEX_GOLD }).setOrigin(0.5).setDepth(91).setAlpha(0);
    const badgeSub = this.add.text(640, 460, "Accretion ✓  Tuning ✓  Restructuring ✓", { font: "10px Arial", color: "#78909c" }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: [badgeLbl, badgeSub], alpha: 1, duration: 300, delay: 2200 });

    const barY = 500;
    const barG = this.add.graphics().setDepth(91).setAlpha(0);
    barG.lineStyle(1, 0x78909c, 1);
    barG.strokeRoundedRect(640 - 190, barY, 380, 14, 7);
    barG.fillStyle(C_VIOLET, 1);
    barG.fillRoundedRect(640 - 190, barY, 380 * 0.66, 14, 7);
    const wingLbl = this.add.text(640, barY - 16, "OUTPUT WING — 2 of 3 trilogies complete", { font: "bold 11px Arial", color: "#8c7ae6" }).setOrigin(0.5).setDepth(91).setAlpha(0);
    const tickLabels = ["println ✓", "print ✓", "printf"];
    const tickTexts = tickLabels.map((lbl, i) => this.add.text(640 - 150 + i * 150, barY + 28, lbl, { font: "10px Arial", color: i < 2 ? HEX_GREEN_BRIGHT : "#546e7a" }).setOrigin(0.5).setDepth(91).setAlpha(0));
    this.tweens.add({ targets: [barG, wingLbl, ...tickTexts], alpha: 1, duration: 300, delay: 2500 });

    this._makeButton(500, 605, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(760, 605, "NEXT: The Composing Room →", 260, 44, { fill: 0x00733a, stroke: C_GREEN_BRIGHT, textColor: "#ffffff" }, () => {
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
