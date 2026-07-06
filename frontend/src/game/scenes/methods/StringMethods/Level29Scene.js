/**
 * Level 29 — "The Claw Trials" (String Methods: Tuning Phase)
 * ==============================================================
 * Tunes the charAt() schema from Level 28 through rapid-fire certification
 * trials. Trial pods descend from a ceiling hatch on a cable, hold briefly,
 * then retract straight back up — the pod's height IS the visual timer.
 * The Level 28 extraction bay (claw, rail, character tiles with always-
 * visible index plates, Result Display) is reused as the permanent
 * reference and the reveal stage: every trial resolves with a REAL claw
 * action (extraction, boundary crash, or compile refusal), never a looked-
 * up verdict.
 *
 * 15 rounds in 3 waves of 5:
 *  Wave 1 — Rapid Extraction (predict)
 *  Wave 2 — Safe or Crash (judge, including the empty-string trap and the
 *           charAt(length()) vs charAt(length()-1) side-by-side crash/safe
 *           discrimination)
 *  Wave 3 — Expression Evaluation + Bug Hunt (clickable tokens)
 *
 * The pod's retraction tween's `progress` is the single source of truth
 * for the timer bar, urgency states, and timeout — mirroring Level 26's
 * conveyor-belt design (and its lesson: never let a second tween fight the
 * timer tween over the same property — urgency vibration here rides on
 * `x`/an independent sway amplitude, never on the `y` the timer owns).
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

const HATCH_Y = 53, POD_HOLD_Y = 150, POD_RETRACT_END_Y = 40;
const RAIL_Y = 285, TILE_Y = 430;
const RESULT_CX = 1150, RESULT_CY = 400;
const TIMER_X = 885, TIMER_TOP = 60, TIMER_BOTTOM = 210;

const TUTORIAL_KEY = "level29_tutorial_done";

// ─────────────────────────────────────────────────────────────────
// Round configuration
// ─────────────────────────────────────────────────────────────────
const ROUNDS = [
  { round: 1, wave: 1, type: "predict", timeLimit: 12000,
    decl: [{ name: "s", value: "trial" }], pod: "s.charAt(1)", correct: "'r'",
    options: [
      { value: "'r'", tag: null },
      { value: "'t'", tag: "one_based_indexing" },
      { value: "'i'", tag: "index_confusion" },
      { value: "'a'", tag: "counted_from_end" },
    ], concept: "fluent_extraction" },

  { round: 2, wave: 1, type: "predict", timeLimit: 12000,
    decl: [{ name: "msg", value: "go bit" }], pod: "msg.charAt(2)", correct: "' '",
    options: [
      { value: "' '", label: "'␣' (space)", tag: null },
      { value: "'b'", tag: "spaces_skipped_in_index" },
      { value: "'o'", tag: "one_based_indexing" },
      { value: "Error", tag: "space_not_char_belief" },
    ], concept: "space_extraction" },

  { round: 3, wave: 1, type: "predict", timeLimit: 12000,
    decl: [{ name: "s", value: "banana" }], pod: "s.charAt(3)", correct: "'a'",
    options: [
      { value: "'a'", tag: null },
      { value: "'n'", tag: "one_based_indexing" },
      { value: "'b'", tag: "index_confusion" },
      { value: "'a','a','a'", label: "all three 'a's", tag: "all_occurrences_belief" },
    ], concept: "duplicates_by_index" },

  { round: 4, wave: 1, type: "predict", timeLimit: 12000,
    decl: [{ name: "s", value: "x" }], pod: "s.charAt(0)", correct: "'x'",
    options: [
      { value: "'x'", tag: null },
      { value: "Error", tag: "zero_index_invalid_belief" },
      { value: "''", label: "'' (nothing)", tag: "index_confusion" },
      { value: '"x"', tag: "char_vs_string_type" },
    ], concept: "single_char_string" },

  { round: 5, wave: 1, type: "predict", timeLimit: 12000,
    decl: [{ name: "s", value: "prime" }], pod: "s.charAt(s.length() - 1)", correct: "'e'",
    options: [
      { value: "'e'", tag: null },
      { value: "'m'", tag: "off_by_one_last_position" },
      { value: "Error", tag: "length_as_valid_index" },
      { value: "'p'", tag: "index_confusion" },
    ], steps: ["s.length() = 5", "5 - 1 = 4", "s.charAt(4)"], concept: "last_char_expression_fluent" },

  { round: 6, wave: 2, type: "judge", timeLimit: 10000,
    decl: [{ name: "s", value: "gear" }], pod: "char c = s.charAt(3);",
    correct: "safe", resultChar: "r", wrongTag: "boundary_doubt", concept: "valid_boundary" },

  { round: 7, wave: 2, type: "judge", timeLimit: 10000,
    decl: [{ name: "s", value: "gear" }], pod: "char c = s.charAt(4);",
    correct: "crash", crashType: "runtime", crashIndex: 4,
    explanation: "Length 4 — indices 0-3. Index 4 is the void!",
    wrongTag: "length_as_valid_index", concept: "out_of_bounds_fluent" },

  { round: 8, wave: 2, type: "judge", timeLimit: 10000,
    decl: [{ name: "s", value: "gear" }], pod: "char c = s.charAt(s.length());",
    correct: "crash", crashType: "runtime",
    steps: ["s.length() = 4", "s.charAt(4) → CRASH"],
    explanation: "charAt(s.length()) ALWAYS crashes — on every string, every time. Only length() - 1 is safe for the end.",
    wrongTag: "length_as_valid_index", concept: "length_expression_crash" },

  { round: 9, wave: 2, type: "judge", timeLimit: 10000,
    decl: [{ name: "s", value: "gear" }], pod: "char c = s[2];",
    correct: "crash", crashType: "compile",
    explanation: "Brackets are for arrays! Strings only answer to charAt(). This never compiles.",
    wrongTag: "bracket_notation_on_string", concept: "bracket_discrimination_fluent" },

  { round: 10, wave: 2, type: "judge", timeLimit: 10000,
    decl: [{ name: "s", value: "" }], pod: "char c = s.charAt(0);",
    correct: "crash", crashType: "runtime", crashIndex: 0,
    explanation: "The empty string has NO characters — not even index 0 exists! length 0 means zero valid addresses.",
    wrongTag: "empty_string_charAt", concept: "empty_string_trap" },

  { round: 11, wave: 3, type: "expression", timeLimit: 9000,
    decl: [{ name: "s", value: "robot" }], pod: "s.charAt(0) == 'r'", correct: "true",
    options: [
      { value: "true", tag: null },
      { value: "false", tag: "comparison_confusion" },
      { value: "'r'", tag: "expression_returns_char_belief" },
      { value: "Error", tag: "char_comparison_doubt" },
    ], steps: ["s.charAt(0) = 'r'", "'r' == 'r' → true"], concept: "char_comparison" },

  { round: 12, wave: 3, type: "expression", timeLimit: 9000,
    decl: [{ name: "a", value: "level" }], pod: "a.charAt(0) == a.charAt(4)", correct: "true",
    options: [
      { value: "true", tag: null },
      { value: "false", tag: "comparison_confusion" },
      { value: "Error", tag: "double_charAt_doubt" },
      { value: "'l'", tag: "expression_returns_char_belief" },
    ], steps: ["a.charAt(0) = 'l'", "a.charAt(4) = 'l'", "'l' == 'l' → true"],
    twoExtraction: true, concept: "two_extraction_comparison" },

  { round: 13, wave: 3, type: "expression", timeLimit: 9000,
    decl: [{ name: "s", value: "trial" }], pod: "s.charAt(2 + 1)", correct: "'a'",
    options: [
      { value: "'a'", tag: null },
      { value: "'i'", tag: "ignored_arithmetic_in_index" },
      { value: "'l'", tag: "off_by_one_plus" },
      { value: "Error", tag: "arithmetic_in_argument_doubt" },
    ], steps: ["2 + 1 = 3", "s.charAt(3)"], concept: "arithmetic_index_argument" },

  { round: 14, wave: 3, type: "bughunt", timeLimit: 12000,
    decl: [{ name: "s", value: "scan" }],
    podLines: ['if (s.charAt(0) == "s") {', "    activate();  }"],
    faultToken: '"s"', fixedToken: "'s'",
    explanation: "charAt() returns a char — it can never == a String! Single quotes: 's'. This won't even compile.",
    wrongTag: "char_vs_string_type", concept: "char_string_comparison_bug" },

  { round: 15, wave: 3, type: "bughunt", timeLimit: 12000,
    decl: [{ name: "s", value: "claw" }],
    podLines: ["for (int i = 1; i < s.length(); i++) {", "    print(s.charAt(i));  }"],
    faultToken: "1", fixedToken: "0",
    explanation: "Starting at 1 skips the first character forever! 'claw' would print 'law'. Every walk starts at index 0.",
    wrongTag: "loop_skips_first_char", concept: "loop_start_bug" },
];

const MISCONCEPTION_FEEDBACK = {
  one_based_indexing: "The plates start at ZERO, Operator! charAt reads the amber plates, not your fingers.",
  length_as_valid_index: "length() counts the characters — but addresses stop at length() - 1! charAt(length()) always sends the claw off the rails.",
  bracket_notation_on_string: "Brackets [ ] belong to the Vault (arrays)! Strings only answer to charAt().",
  char_vs_string_type: "char and String live in different worlds — single quotes for one character, double quotes for a String. == between them won't even compile.",
  spaces_skipped_in_index: "The space holds a real address! Skip it and every character after shifts by one.",
  off_by_one_last_position: "One plate short! The last character's index is always length() - 1, not length().",
  empty_string_charAt: 'The cruelest trap! "" has length 0 — so there are ZERO valid indices. Even charAt(0) crashes on emptiness.',
  ignored_arithmetic_in_index: "Java computes the argument FIRST. charAt(2 + 1) is just charAt(3). Resolve the math, then read the plate.",
  loop_skips_first_char: "int i = 1 abandons index 0! The first character never prints. Loops over Strings start at 0.",
  timeout: "The trial escaped through the hatch! Trust the plates and commit faster — hesitation fails certifications.",
  index_confusion: "That's not the right address at all — recount the plates carefully from 0 up to the target.",
  counted_from_end: "You counted from the END, not the start! Indices always count from index 0 on the LEFT.",
  zero_index_invalid_belief: "Index 0 is the most important address — it's where everything begins. charAt(0) always works on a non-empty String.",
  space_not_char_belief: "A space is a full citizen of the String! charAt() happily returns ' ' — one char, invisible but real.",
  all_occurrences_belief: "charAt() with ONE index returns exactly ONE character — not every matching character. Each position has its own single answer.",
  boundary_doubt: "This one's actually SAFE — the index sits right at the last valid position. Trust the math: it's within bounds.",
  comparison_confusion: "Recheck the comparison — read both characters carefully before deciding true or false.",
  double_charAt_doubt: "Two charAt() calls in one line compile just fine — Java evaluates each one, then compares the results.",
  char_comparison_doubt: "Comparing a char to a char with == is completely valid Java — it checks if they're the same character.",
  arithmetic_in_argument_doubt: "Arithmetic inside charAt()'s parentheses is totally legal — Java computes it first, then uses the result as the index.",
  expression_returns_char_belief: "The == comparison happens AFTER the extraction — the whole expression is a boolean: true or false.",
  off_by_one_plus: "Recheck the arithmetic — the argument resolves to a specific index before charAt() ever runs.",
};

const WAVE_INFO = {
  1: { title: "WAVE 1 — RAPID EXTRACTION", brief: "Quick reads first — predict the extraction before the pod escapes!" },
  2: { title: "WAVE 2 — BOUNDARY CERTIFICATION", brief: "Now judge the code itself — will it run safely, or crash?" },
  3: { title: "WAVE 3 — EXPRESSIONS & BUG HUNT", brief: "Final stretch — evaluate, compare, and hunt bugs!" },
};

export class Level29Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level29Scene" });
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
    this.tiles = [];
    this.optionBubbles = [];
    this.podTween = null;
    this.pod = null;
    this.urgencyState = "normal";
    this.roundStartTime = 0;
    this.answered = false;
    this.inputLocked = true;
    this.gameEnded = false;
    this._alive = true;
    this._bubble = null;
    this._keyHandler = null;
  }

  preload() {}

  create() {
    this._alive = true;
    this.events.once("shutdown", () => { this._alive = false; this._teardownKeys(); });

    const cam = this.cameras.main;
    const zoom = Math.min(this.scale.width / W, this.scale.height / H);
    cam.setZoom(zoom);
    cam.centerOn(W / 2, H / 2);
    cam.setBackgroundColor("#0a0812");

    try { GameManager.incrementAttempt(28); } catch (_) {}

    this.createParticleTexture();
    this.createBackground();
    this.createBayFloor();
    this.createGantry();
    this.createMachinery();
    this.createWarningBeacon();
    this.createParticles();
    this.createTrialBanners();
    this.createJudgeDrones();
    this.createPodTrack();
    this.createTimerBar();
    this.createRail();
    this.createClaw();
    this.createResultDisplay();
    this.createHUD();
    this.createBit();

    cam.fadeIn(700, 4, 4, 9);
    this.checkTutorial();
  }

  update(time, delta) {
    this.updateParticles(time, delta);
    this.updateClawVisual(time);
    this.updateDroneHover(time);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // SETUP — background & environment (Level 28 bay, reused)
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l29_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l29_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x0a0812).setDepth(0);
  }

  createBayFloor() {
    const g = this.add.graphics().setDepth(1);
    const top = 605, panelH = 23;
    for (let i = 0; i < 5; i++) {
      const y = top + i * panelH;
      g.fillStyle(i % 2 === 0 ? 0x120f1c : 0x0d0b16, 1);
      g.fillRect(0, y, W, panelH);
      g.lineStyle(1, 0x241f36, 0.25);
      g.lineBetween(0, y, W, y);
    }
  }

  createGantry() {
    const g = this.add.graphics().setDepth(3);
    [150, 1130].forEach((x) => {
      g.fillStyle(0x151122, 1);
      g.lineStyle(1, 0x241f36, 1);
      g.fillRect(x - 9, 220, 18, 190);
      g.strokeRect(x - 9, 220, 18, 190);
      g.lineStyle(1, 0x241f36, 0.4);
      for (let y = 230; y < 400; y += 40) {
        g.lineBetween(x - 9, y, x + 9, y + 30);
        g.lineBetween(x + 9, y, x - 9, y + 30);
      }
    });
  }

  createMachinery() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x0d0b16, 0.4);
    g.lineStyle(1, 0x241f36, 0.06);
    g.fillRect(20, 470, 100, 130);
    g.strokeRect(20, 470, 100, 130);
    for (let i = 0; i < 3; i++) { g.fillStyle(C_GREEN, 0.05); g.fillCircle(70, 495 + i * 35, 2); }
    g.fillStyle(0x0d0b16, 0.4);
    g.lineStyle(1, 0x241f36, 0.06);
    g.fillRect(1160, 470, 100, 130);
    g.strokeRect(1160, 470, 100, 130);
    for (let i = 0; i < 3; i++) { g.fillStyle(C_AMBER, 0.05); g.fillCircle(1210, 495 + i * 35, 2); }
  }

  createWarningBeacon() {
    const g = this.add.graphics().setDepth(40);
    g.fillStyle(0x1a0a0a, 1);
    g.fillRect(1225, 100, 20, 6);
    g.fillStyle(C_RED, 0.08);
    g.slice(1235, 95, 10, Math.PI, 0, false);
    g.fillPath();
    this.beaconWedge = this.add.graphics().setDepth(41).setAlpha(0);
  }

  activateBeacon() {
    this.beaconWedge.setAlpha(1);
    let angle = 0;
    const ev = this.time.addEvent({
      delay: 30, repeat: 49,
      callback: () => {
        angle += 0.3;
        this.beaconWedge.clear();
        this.beaconWedge.fillStyle(C_RED, 0.3);
        this.beaconWedge.slice(1235, 95, 12, angle, angle + 0.8, false);
        this.beaconWedge.fillPath();
      },
    });
    this.time.delayedCall(1500, () => { ev.remove(); this.beaconWedge.setAlpha(0); });
  }

  createParticles() {
    this.dust = [];
    for (let i = 0; i < 10; i++) {
      const p = this.add.circle(Phaser.Math.Between(20, 1260), Phaser.Math.Between(0, 600), 1, 0xb388ff, Phaser.Math.FloatBetween(0.02, 0.06)).setDepth(2);
      this.dust.push(p);
    }
  }

  updateParticles(time, delta) {
    if (!this.dust) return;
    const step = 0.05 * (delta / 16.7);
    this.dust.forEach((p, i) => {
      p.y -= step;
      p.x += Math.sin(time * 0.0008 + i) * 0.04;
      if (p.y < 0) { p.y = 600; p.x = Phaser.Math.Between(20, 1260); }
    });
  }

  createTrialBanners() {
    [200, 1080].forEach((x) => {
      const g = this.add.graphics().setDepth(3);
      g.fillStyle(0x141019, 1);
      g.lineStyle(1, C_AMBER, 0.15);
      g.fillRect(x - 17, 60, 34, 130);
      g.strokeRect(x - 17, 60, 34, 130);
      "TRIAL".split("").forEach((ch, i) => {
        this.add.text(x, 75 + i * 20, ch, { font: "bold 11px Arial", color: HEX_AMBER }).setOrigin(0.5).setAlpha(0.25).setDepth(4);
      });
    });
  }

  createJudgeDrones() {
    this.drones = [];
    const positions = [[70, 110], [95, 125], [120, 105]];
    positions.forEach(([x, y], i) => {
      const c = this.add.container(x, y).setDepth(5);
      const body = this.add.graphics();
      body.fillStyle(0x1c1730, 1);
      body.lineStyle(1, 0x4a4468, 1);
      body.fillRoundedRect(-8, -6, 16, 12, 3);
      body.strokeRoundedRect(-8, -6, 16, 12, 3);
      const eye = this.add.circle(0, 0, 2, C_CYAN, 0.4);
      c.add([body, eye]);
      this.drones.push({ c, eye, baseY: y, phase: i * 2.1 });
    });
  }

  updateDroneHover(time) {
    if (!this.drones) return;
    this.drones.forEach((d) => {
      d.c.y = d.baseY + Math.sin(time * 0.0012 + d.phase) * 3;
    });
  }

  droneReact(correct) {
    this.drones.forEach((d) => {
      d.eye.setFillStyle(correct ? C_GREEN : C_RED);
      this.tweens.add({ targets: d.eye, alpha: 1, duration: 150, yoyo: true, onComplete: () => d.eye.setFillStyle(C_CYAN) });
    });
    if (!correct) {
      const d = this.drones[0];
      this.tweens.add({ targets: d.c, angle: 10, duration: 150, yoyo: true });
    }
  }

  createPodTrack() {
    const g = this.add.graphics().setDepth(3);
    g.fillStyle(0x141019, 1);
    g.lineStyle(1, 0x241f36, 1);
    g.fillRoundedRect(380, HATCH_Y - 5, 520, 10, 4);
    g.strokeRoundedRect(380, HATCH_Y - 5, 520, 10, 4);
    this.hatchMark = this.add.rectangle(640, HATCH_Y, 40, 2, C_AMBER, 0.3).setDepth(4);
  }

  createTimerBar() {
    const g = this.add.graphics().setDepth(20);
    g.fillStyle(0x241f36, 0.5);
    g.fillRect(TIMER_X, TIMER_TOP, 5, TIMER_BOTTOM - TIMER_TOP);
    this.timerFill = this.add.graphics().setDepth(21);
  }

  updateTimerBar(remaining) {
    const h = Math.max(0, (TIMER_BOTTOM - TIMER_TOP) * remaining);
    const color = remaining > 0.33 ? C_GREEN : remaining > 0.15 ? C_AMBER : C_RED;
    this.timerFill.clear();
    this.timerFill.fillStyle(color, 1);
    this.timerFill.fillRect(TIMER_X, TIMER_BOTTOM - h, 5, h);
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
  // THE CLAW (rail at y=285, identical mechanics to Level 28)
  // ══════════════════════════════════════════════════════════════

  createRail() {
    const g = this.add.graphics().setDepth(4);
    g.fillStyle(0x241f36, 1);
    g.lineStyle(1, 0x2f2a45, 1);
    g.fillRoundedRect(168, RAIL_Y - 4, 944, 8, 4);
    g.strokeRoundedRect(168, RAIL_Y - 4, 944, 8, 4);
    g.lineStyle(2, 0x0a0812, 1);
    g.lineBetween(168, RAIL_Y, 1112, RAIL_Y);
    [162, 1106].forEach((x) => {
      g.fillStyle(0x151122, 1);
      g.lineStyle(1, C_AMBER, 0.3);
      g.fillRoundedRect(x, RAIL_Y - 10, 12, 20, 3);
      g.strokeRoundedRect(x, RAIL_Y - 10, 12, 20, 3);
    });
  }

  createClaw() {
    this._clawState = { trolleyX: 168 + 20, cableLength: 40 };
    this.trolleyContainer = this.add.container(this._clawState.trolleyX, RAIL_Y).setDepth(19);
    const body = this.add.graphics();
    body.fillStyle(0x1c1730, 1);
    body.lineStyle(2, 0x4a4468, 1);
    body.fillRoundedRect(-23, -11, 46, 22, 5);
    body.strokeRoundedRect(-23, -11, 46, 22, 5);
    body.fillStyle(0x0a0812, 1);
    body.lineStyle(1, 0x4a4468, 1);
    body.fillCircle(-14, 10, 4); body.strokeCircle(-14, 10, 4);
    body.fillCircle(14, 10, 4); body.strokeCircle(14, 10, 4);
    this.clawStatusLight = this.add.circle(0, -14, 3, C_GRAY);
    this.trolleyContainer.add([body, this.clawStatusLight]);

    this.cableGraphics = this.add.graphics().setDepth(18);
    this.clawHeadContainer = this.add.container(this._clawState.trolleyX, RAIL_Y + 11 + this._clawState.cableLength).setDepth(19);
    const hub = this.add.circle(0, 0, 6, 0x1c1730).setStrokeStyle(2, C_PURPLE);
    this.pincerLeft = this.add.graphics();
    this.pincerRight = this.add.graphics();
    this.clawHeadContainer.add([this.pincerLeft, this.pincerRight, hub]);
    this._drawPincers(26);
    this.updateClawVisual(0);
  }

  _drawPincers(gap) {
    this.pincerLeft.clear();
    this.pincerRight.clear();
    this.pincerLeft.lineStyle(4, C_PURPLE, 1);
    this.pincerRight.lineStyle(4, C_PURPLE, 1);
    const half = gap / 2;
    this.pincerLeft.beginPath();
    this.pincerLeft.arc(-half - 8, 10, 16, Phaser.Math.DegToRad(-40), Phaser.Math.DegToRad(80), false);
    this.pincerLeft.strokePath();
    this.pincerRight.beginPath();
    this.pincerRight.arc(half + 8, 10, 16, Phaser.Math.DegToRad(100), Phaser.Math.DegToRad(220), false);
    this.pincerRight.strokePath();
  }

  clawGrip(closed) { this._drawPincers(closed ? 10 : 26); }

  updateClawVisual(time) {
    if (!this.trolleyContainer) return;
    this.trolleyContainer.x = this._clawState.trolleyX;
    const sway = Math.sin(time * 0.0026) * 2;
    this.clawHeadContainer.x = this._clawState.trolleyX + sway;
    this.clawHeadContainer.y = RAIL_Y + 11 + this._clawState.cableLength;
    this.cableGraphics.clear();
    this.cableGraphics.lineStyle(3, 0x4a4468, 1);
    this.cableGraphics.lineBetween(this._clawState.trolleyX, RAIL_Y + 11, this.clawHeadContainer.x, this.clawHeadContainer.y);
  }

  moveClawTo(targetX) {
    const dist = Math.abs(targetX - this._clawState.trolleyX);
    const duration = Math.min(1000, Math.max(150, (dist / 360) * 1000));
    return new Promise((res) => {
      this.tweens.add({ targets: this._clawState, trolleyX: targetX, duration, ease: "Sine.easeInOut", onComplete: () => res() });
    });
  }

  extendCable(toLength, duration = 260, ease = "Quad.easeIn") {
    return new Promise((res) => {
      this.tweens.add({ targets: this._clawState, cableLength: toLength, duration, ease, onComplete: () => res() });
    });
  }

  parkClaw() {
    this.clawStatusLight.setFillStyle(C_GRAY);
    this.clawGrip(false);
    return this.moveClawTo(168 + 20);
  }

  // ══════════════════════════════════════════════════════════════
  // CHARACTER TILES + INDEX PLATES (Level 28 mechanics)
  // ══════════════════════════════════════════════════════════════

  _charMeta(ch) {
    if (ch === " ") return { display: "␣", color: HEX_MAGENTA, isSpace: true };
    if (/[0-9]/.test(ch)) return { display: ch, color: HEX_AMBER, isSpace: false };
    if (/[a-zA-Z]/.test(ch)) return { display: ch, color: HEX_CYAN, isSpace: false };
    return { display: ch, color: "#ff9800", isSpace: false };
  }

  _tileWidth(n, maxW = 900) {
    return n <= 12 ? 52 : Math.max(30, Math.floor((maxW - (n - 1) * 6) / n));
  }

  buildTileRow(decls) {
    this.clearTileRow();
    this.emptyLabel && this.emptyLabel.destroy();
    this.emptyLabel = null;

    if (decls.length === 1 && decls[0].value === "") {
      const t = this.add.text(640, TILE_Y, "(empty)", { font: "italic 14px Arial", color: "#3d4450" }).setOrigin(0.5).setDepth(12);
      this.emptyLabel = t;
      return;
    }

    if (decls.length === 1) {
      const str = decls[0].value;
      const n = str.length;
      const tw = this._tileWidth(n);
      const totalW = n * tw + (n - 1) * 6;
      const startX = 640 - totalW / 2;
      this.tiles = str.split("").map((ch, i) => this.createTile(ch, i, startX + i * (tw + 6) + tw / 2, TILE_Y, tw));
    } else {
      // split layout for two-string comparison rounds
      const gap = 60;
      const halfW = (900 - gap) / 2;
      let cursorX = 640 - halfW - gap / 2;
      decls.forEach((d, di) => {
        const str = d.value;
        const n = str.length;
        const tw = this._tileWidth(n, halfW);
        const totalW = n * tw + (n - 1) * 6;
        const startX = cursorX + (halfW - totalW) / 2;
        const label = this.add.text(cursorX + halfW / 2, TILE_Y - 70, d.name, { font: "bold 11px Courier New", color: HEX_CYAN }).setOrigin(0.5).setDepth(12);
        this.roundElements.push(label);
        str.split("").forEach((ch, i) => {
          this.tiles.push(this.createTile(ch, i, startX + i * (tw + 6) + tw / 2, TILE_Y, tw, di));
        });
        cursorX += halfW + gap;
      });
    }
  }

  createTile(ch, index, x, y, tw = 52, groupId = 0) {
    const meta = this._charMeta(ch);
    const container = this.add.container(x, y).setDepth(12);
    const glow = this.add.rectangle(0, 0, tw + 6, 64 + 6, C_CYAN, 0);
    const body = this.add.graphics();
    this._drawTileBody(body, tw, 0x2a3a4a, 2);
    const charText = this.add.text(0, meta.isSpace ? -6 : 0, meta.display, { font: "bold 22px Courier New", color: meta.color }).setOrigin(0.5);
    if (meta.isSpace) charText.setAlpha(0.85);
    container.add([glow, body, charText]);

    const plateY = 64 / 2 + 18;
    const plateG = this.add.graphics();
    plateG.fillStyle(0x141019, 1);
    plateG.fillRoundedRect(-17, plateY - 9, 34, 18, 4);
    plateG.lineStyle(1, C_AMBER, index === 0 ? 0.5 : 0.25);
    plateG.strokeRoundedRect(-17, plateY - 9, 34, 18, 4);
    const plateText = this.add.text(0, plateY, String(index), { font: "bold 12px Courier New", color: HEX_AMBER }).setOrigin(0.5);
    container.add([plateG, plateText]);

    return { container, glow, body, charText, plateG, plateText, index, ch, tw, x, y, groupId, pulse: null };
  }

  _drawTileBody(g, tw, stroke, lw, dashed = false) {
    g.clear();
    g.fillStyle(0x0d1117, 1);
    g.fillRoundedRect(-tw / 2, -32, tw, 64, 6);
    g.lineStyle(lw, stroke, 1);
    if (dashed) this._dashedRectOutline(g, -tw / 2, -32, tw, 64, 5, 4);
    else g.strokeRoundedRect(-tw / 2, -32, tw, 64, 6);
  }

  setTileState(i, state, groupId = 0) {
    const tile = this.tiles.filter((t) => t.groupId === groupId)[i];
    if (!tile || !tile.container.active) return;
    if (tile.pulse) { tile.pulse.stop(); tile.pulse = null; }
    const map = { scanned: C_CYAN, correct: C_GREEN, error: C_RED, default: 0x2a3a4a };
    const color = map[state] || map.default;
    if (state === "default") { this._drawTileBody(tile.body, tile.tw, 0x2a3a4a, 2); tile.glow.setFillStyle(C_CYAN, 0); return; }
    this._drawTileBody(tile.body, tile.tw, color, 2);
    tile.glow.setFillStyle(color, 0.12);
    this.tweens.add({ targets: tile.glow, fillAlpha: 0, duration: 300 });
  }

  clearTileRow() {
    this.tiles.forEach((t) => { if (t.pulse) t.pulse.stop(); t.container.destroy(); });
    this.tiles = [];
  }

  getTile(index, groupId = 0) {
    return this.tiles.filter((t) => t.groupId === groupId)[index];
  }

  // ══════════════════════════════════════════════════════════════
  // RESULT DISPLAY & DECLARATIONS
  // ══════════════════════════════════════════════════════════════

  createResultDisplay() {
    const g = this.add.graphics().setDepth(14);
    g.fillStyle(0x0d0b16, 1);
    g.lineStyle(1, C_PURPLE, 1);
    g.fillRoundedRect(RESULT_CX - 55, RESULT_CY - 55, 110, 110, 10);
    g.strokeRoundedRect(RESULT_CX - 55, RESULT_CY - 55, 110, 110, 10);
    this.add.text(RESULT_CX, RESULT_CY - 68, "EXTRACTED", { font: "bold 9px Arial", color: "#546e7a" }).setOrigin(0.5).setDepth(15);
    this.resultCharText = this.add.text(RESULT_CX, RESULT_CY - 8, "", { font: "bold 36px Courier New", color: HEX_CYAN }).setOrigin(0.5).setDepth(15);
    this.resultTypeTag = this.add.text(RESULT_CX, RESULT_CY + 26, "", { font: "bold 11px Courier New", color: "#4fc3f7" }).setOrigin(0.5).setDepth(15).setAlpha(0);
  }

  showResultChar(ch) {
    this.resultTypeTag.setAlpha(0);
    const isSpace = ch === " ";
    this.resultCharText.setText(isSpace ? "' '" : `'${ch}'`).setColor(HEX_CYAN).setScale(0);
    this.tweens.add({ targets: this.resultCharText, scale: 1, duration: 220, ease: "Back.easeOut" });
    this.time.delayedCall(120, () => { if (this._alive) this.resultTypeTag.setText("char").setAlpha(1); });
  }

  clearResultChar() {
    this.resultCharText.setText("");
    this.resultTypeTag.setAlpha(0);
  }

  updateDeclarations(decls) {
    if (this.declGroup) this.declGroup.destroy();
    const c = this.add.container(0, 350).setDepth(15);
    decls.forEach((d, i) => {
      let x = 0;
      const y = i * 20 - (decls.length - 1) * 10;
      const put = (t, color) => {
        const txt = this.add.text(x, y, t, { font: "14px Courier New", color }).setOrigin(0, 0.5);
        c.add(txt);
        x += txt.width;
      };
      put("String", HEX_MAGENTA);
      put(" " + d.name + " = ", HEX_GRAY);
      put('"', HEX_GRAY);
      put(d.value, HEX_AMBER);
      put('"', HEX_GRAY);
      put(";", HEX_GRAY);
    });
    let totalW = 0;
    c.list.forEach((t) => { totalW = Math.max(totalW, t.x + t.width); });
    c.x = 640 - totalW / 2;
    this.declGroup = c;
  }

  // ══════════════════════════════════════════════════════════════
  // HUD
  // ══════════════════════════════════════════════════════════════

  createHUD() {
    const g = this.add.graphics().setDepth(50);
    g.fillStyle(0x0c0916, 0.93);
    g.fillRect(0, 0, W, 64);
    g.lineStyle(1, 0x241f36, 1);
    g.lineBetween(0, 64, W, 64);

    this.add.text(20, 14, "THE CLAW TRIALS", { font: "bold 15px Arial", color: "#b0bec5" }).setDepth(51);
    this.add.text(20, 36, "Tuning Phase — String Methods: charAt()", { font: "11px Arial", color: "#546e7a" }).setDepth(51);

    this.waveText = this.add.text(640, 12, "WAVE 1 / 3", { font: "bold 14px Arial", color: HEX_AMBER }).setOrigin(0.5).setDepth(51);
    this.waveSquares = [];
    for (let i = 0; i < 5; i++) {
      const sq = this.add.rectangle(640 - 44 + i * 22, 40, 10, 10, 0x000000, 0).setStrokeStyle(1, C_GRAY).setDepth(51);
      this.waveSquares.push(sq);
    }

    this.add.text(1060, 12, "SCORE", { font: "9px Arial", color: "#546e7a" }).setDepth(51);
    this.scoreText = this.add.text(1060, 24, "0", { font: "bold 20px Arial", color: "#ffffff" }).setDepth(51);
    this.comboText = this.add.text(1150, 30, "×1", { font: "bold 16px Arial", color: HEX_AMBER }).setDepth(51);

    this.lifeIcons = [];
    for (let i = 0; i < 3; i++) {
      const lg = this.add.graphics({ x: 1195 + i * 26, y: 30 }).setDepth(51);
      lg.lineStyle(2, C_PURPLE, 1);
      lg.strokeCircle(0, 0, 7);
      lg.fillStyle(C_PURPLE, 1);
      lg.fillCircle(0, 0, 2);
      this.lifeIcons.push(lg);
    }
  }

  updateWaveIndicator(indexInWave, result) {
    const sq = this.waveSquares[indexInWave];
    if (!sq) return;
    sq.setFillStyle(result ? C_GREEN : C_RED, 1);
    sq.setStrokeStyle(1, result ? C_GREEN : C_RED);
  }

  // ══════════════════════════════════════════════════════════════
  // BIT — examiner variant (headset + clipboard)
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
    headset.beginPath();
    headset.arc(0, -8, 14, Phaser.Math.DegToRad(200), Phaser.Math.DegToRad(340), false);
    headset.strokePath();
    const mic = this.add.circle(9, 4, 2, 0x78909c);
    const clip = this.add.graphics();
    clip.lineStyle(1, 0xb0bec5, 1);
    clip.strokeRoundedRect(20, -6, 12, 16, 2);
    clip.lineBetween(23, -2, 29, -2);
    clip.lineBetween(23, 2, 29, 2);
    clip.lineBetween(23, 6, 29, 6);
    c.add([g, headset, mic, tip, eye, pupil, clip]);
    this.tweens.add({ targets: tip, alpha: 0.3, duration: 900, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: c, y: "+=3", duration: 2000, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
    this.bit = c;
  }

  bitSay(text) {
    this.hideBubble();
    const inner = this.add.text(0, 0, text, { font: "13px Arial", color: "#e0e0e0", wordWrap: { width: 330 } });
    const bw = Math.min(inner.width, 330) + 30, bh = inner.height + 24;
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
    await Promise.race([this.waitForClick(), this.delay(2500)]);
    this.hideBubble();
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
    this.buildTileRow([{ name: "s", value: "demo" }]);
    await this.delay(400); if (!A()) return;
    await this.bitSay("Certification day, Operator! The examiners send trials down on cables — and pull them back UP while you think. Answer before a trial escapes through the hatch!");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();

    this.updateDeclarations([{ name: "s", value: "demo" }]);
    const demoPod = this.spawnPod({ pod: "s.charAt(1)", crateWidth: 460 });
    await this.descendPod(demoPod, 900); if (!A()) return;

    const a1 = this.createAnnotation(demoPod.container.x + 260, POD_HOLD_Y, "the pod retracts — it's your TIMER", HEX_AMBER, { x: 750, y: POD_HOLD_Y + 60 });
    await this.delay(300); if (!A()) return;
    const a2 = this.createAnnotation(640, HATCH_Y - 20, "gone means FAILED", HEX_RED, { x: 640, y: HATCH_Y + 8 });
    await this.delay(300); if (!A()) return;
    const a3 = this.createAnnotation(640, TILE_Y - 90, "your reference — plates never lie", HEX_CYAN, { x: 640, y: TILE_Y - 60 });
    await this.delay(300); if (!A()) return;

    await this.bitSay("The plates are always down here if you need them — but champions read indices at a glance. Speed earns bonus marks. Begin!");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4000)]); if (!A()) return;
    this.hideBubble();
    [a1, a2, a3].forEach((a) => this.tweens.add({ targets: a, alpha: 0, duration: 250, onComplete: () => a.destroy() }));
    demoPod.container.destroy();

    try { localStorage.setItem(TUTORIAL_KEY, "true"); } catch (_) {}
    this.startWave(1);
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
  // WAVE MANAGEMENT
  // ══════════════════════════════════════════════════════════════

  async startWave(waveNumber) {
    if (!this._alive || this.gameEnded) return;
    this.currentWave = waveNumber;
    this.waveText.setText(`WAVE ${waveNumber} / 3`);
    this.waveSquares.forEach((sq) => sq.setFillStyle(0x000000, 0).setStrokeStyle(1, C_GRAY));

    await this.showWaveBanner(WAVE_INFO[waveNumber].title);
    if (!this._alive || this.gameEnded) return;
    await this.bitSay(WAVE_INFO[waveNumber].brief);
    if (!this._alive || this.gameEnded) return;
    await this.delay(500);
    this.hideBubble();

    const firstIdx = ROUNDS.findIndex((r) => r.wave === waveNumber);
    this.startRound(firstIdx);
  }

  showWaveBanner(text) {
    return new Promise((res) => {
      const banner = this.add.container(-700, POD_HOLD_Y).setDepth(80);
      const g = this.add.graphics();
      g.fillStyle(0x0a0e0a, 0.95);
      g.fillRect(-700, -35, 1400, 70);
      const t = this.add.text(0, 0, text, { font: "bold 24px Arial", color: HEX_AMBER }).setOrigin(0.5);
      banner.add([g, t]);
      this.tweens.add({
        targets: banner, x: 640, duration: 700, ease: "Cubic.easeOut",
        onComplete: () => this.time.delayedCall(400, () => {
          this.tweens.add({ targets: banner, x: 1980, duration: 700, ease: "Cubic.easeIn", onComplete: () => { banner.destroy(); res(); } });
        }),
      });
    });
  }

  // ══════════════════════════════════════════════════════════════
  // POD — visual timer
  // ══════════════════════════════════════════════════════════════

  spawnPod(cfg) {
    const width = cfg.type === "bughunt" ? 560 : 460;
    const height = 130;
    const container = this.add.container(640, HATCH_Y).setDepth(30);
    const cable = this.add.graphics();
    cable.lineStyle(3, 0x4a4468, 1);
    cable.lineBetween(0, -(HATCH_Y - 0), 0, 0);
    const body = this.add.graphics();
    const drawBody = (stroke) => {
      body.clear();
      body.fillStyle(0x10121e, 1);
      body.fillRoundedRect(-width / 2, -height / 2, width, height, 12);
      body.lineStyle(2, stroke, 1);
      body.strokeRoundedRect(-width / 2, -height / 2, width, height, 12);
    };
    drawBody(C_PURPLE);
    const glow = this.add.rectangle(0, 0, width + 16, height + 16, C_AMBER, 0);
    container.add([cable, glow, body]);

    if (cfg.round !== undefined) {
      const label = this.add.text(-width / 2 + 10, -height / 2 + 10, `TRIAL ${cfg.round}/15`, {
        font: "bold 9px Courier New", color: "#546e7a",
      }).setOrigin(0, 0.5);
      container.add(label);
    }

    let tokenLines = null;
    if (cfg.podLines) {
      tokenLines = cfg.podLines.map((line, i) => this._renderClickableTokenLine(container, 0, (i - (cfg.podLines.length - 1) / 2) * 22, line, width - 40));
    } else {
      const text = cfg.pod;
      let fontSize = 16;
      let { container: lc, width: lw } = this._renderTokenLine(0, 0, text, fontSize);
      if (lw > width - 40) { lc.destroy(); fontSize = 13; ({ container: lc, width: lw } = this._renderTokenLine(0, 0, text, fontSize)); }
      lc.x = -lw / 2;
      container.add(lc);
    }

    const sway = this.tweens.add({ targets: container, angle: 0.8, duration: 2000, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
    return { container, glow, body, drawBody, width, height, tokenLines, swayTween: sway };
  }

  _syntaxTokens(line) {
    const tokens = [];
    const re = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\bif\b|\bfor\b|\bint\b|\bchar\b)|(\bcharAt\b|\blength\b)|(==|!=|<=|>=|\+\+|--)|(\b-?\d+\b)|([+\-=<>!])|([(){}\[\];.,])/g;
    let last = 0, m;
    const plain = (t) => t && tokens.push({ t, c: "#e0e0e0" });
    while ((m = re.exec(line))) {
      if (m.index > last) plain(line.slice(last, m.index));
      if (m[1]) tokens.push({ t: m[1], c: HEX_GREEN });
      else if (m[2]) tokens.push({ t: m[2], c: HEX_MAGENTA });
      else if (m[3]) tokens.push({ t: m[3], c: HEX_AMBER });
      else if (m[4]) tokens.push({ t: m[4], c: "#ff8a65" });
      else if (m[5]) tokens.push({ t: m[5], c: HEX_AMBER });
      else if (m[6]) tokens.push({ t: m[6], c: "#ff8a65" });
      else if (m[7]) tokens.push({ t: m[7], c: HEX_GRAY });
      last = m.index + m[0].length;
    }
    if (last < line.length) plain(line.slice(last));
    return tokens.length ? tokens : [{ t: line, c: "#e0e0e0" }];
  }

  _renderTokenLine(x, y, line, fontSize = 16) {
    const c = this.add.container(x, y);
    let cx = 0;
    this._syntaxTokens(line).forEach((tok) => {
      const t = this.add.text(cx, 0, tok.t, { font: `bold ${fontSize}px Courier New`, color: tok.c }).setOrigin(0, 0.5);
      c.add(t);
      cx += t.width;
    });
    return { container: c, width: cx };
  }

  _renderClickableTokenLine(parent, x, y, line, maxWidth) {
    const tokens = this._syntaxTokens(line);
    const measured = tokens.map((tok) => {
      const t = this.add.text(0, 0, tok.t, { font: "13px Courier New", color: tok.c });
      const w = t.width;
      t.destroy();
      return w;
    });
    const totalW = measured.reduce((a, b) => a + b, 0);
    let cx = x - totalW / 2;
    const results = [];
    tokens.forEach((tok, i) => {
      const t = this.add.text(cx, y, tok.t, { font: "13px Courier New", color: tok.c }).setOrigin(0, 0.5);
      const hitW = Math.max(measured[i], 30), hitH = 30;
      t.setInteractive(new Phaser.Geom.Rectangle(-((hitW - measured[i]) / 2), -hitH / 2, hitW, hitH), Phaser.Geom.Rectangle.Contains);
      t.input.cursor = "pointer";
      parent.add(t);
      results.push({ text: t, raw: tok.t, baseColor: tok.c });
      cx += measured[i];
    });
    return results;
  }

  descendPod(pod, duration = 450) {
    return new Promise((res) => {
      this.tweens.add({ targets: pod.container, y: POD_HOLD_Y, duration, ease: "Bounce.easeOut", onComplete: () => res() });
    });
  }

  launchPod(pod, timeLimitMs) {
    this.urgencyState = "normal";
    this.roundStartTime = this.time.now;
    this.podTween = this.tweens.add({
      targets: pod.container, y: POD_RETRACT_END_Y, duration: timeLimitMs, ease: "Linear",
      onUpdate: () => this.podUrgencyCheck(),
      onComplete: () => { if (this._alive && !this.gameEnded && this.pod) this.onPodTimeout(); },
    });
  }

  podUrgencyCheck() {
    if (!this.podTween || !this.pod) return;
    const progress = this.podTween.progress;
    const remaining = 1 - progress;
    this.updateTimerBar(remaining);

    let state = "normal";
    if (remaining < 0.15) state = "danger";
    else if (remaining < 0.33) state = "warn";
    if (state !== this.urgencyState) {
      this.urgencyState = state;
      if (state === "warn") {
        this.pod.drawBody(C_AMBER);
        this.pod.glow.setFillStyle(C_AMBER, 0);
        this.tweens.add({ targets: this.pod.glow, fillAlpha: 0.1, duration: 400, yoyo: true, repeat: -1 });
      } else if (state === "danger") {
        this.pod.drawBody(C_RED);
        this.pod.glow.setFillStyle(C_RED, 0);
        this.tweens.add({ targets: this.pod.glow, fillAlpha: 0.15, duration: 250, yoyo: true, repeat: -1 });
        // vibration rides on x (untouched by the retraction tween, which owns y only)
        this.tweens.add({ targets: this.pod.container, x: 640 + 1, duration: 40, yoyo: true, repeat: -1 });
      }
    }
  }

  stopPod() {
    if (this.podTween) { this.podTween.stop(); this.podTween = null; }
    if (this.pod) {
      this.pod.swayTween.stop();
      this.tweens.killTweensOf(this.pod.container);
      this.tweens.killTweensOf(this.pod.glow);
      this.pod.container.setAngle(0).setX(640);
    }
  }

  stampPod(result) {
    if (!this.pod) return;
    const color = result === "CERTIFIED" ? HEX_GREEN : HEX_RED;
    const stamp = this.add.text(0, 0, result, { font: "bold 26px Arial", color }).setOrigin(0.5).setScale(2).setAngle(-10).setAlpha(0).setDepth(2);
    this.pod.container.add(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 200, ease: "Cubic.easeOut" });
    if (result === "CERTIFIED") this.pod.drawBody(C_GREEN);
    else this.tweens.add({ targets: this.pod.container, y: this.pod.container.y + 20, duration: 150, yoyo: true });
  }

  async yankPodAway() {
    if (!this.pod) return;
    this.hatchMark.setFillStyle(C_RED, 0.7);
    await new Promise((res) => {
      this.tweens.add({ targets: this.pod.container, y: HATCH_Y, duration: 150, ease: "Cubic.easeIn", onComplete: () => res() });
    });
    const debris = this.add.particles(640, HATCH_Y, "l29_dot", {
      speed: { min: 20, max: 50 }, angle: { min: 60, max: 120 }, scale: { start: 0.5, end: 0 }, lifespan: 300, tint: 0x4a4468, emitting: false,
    }).setDepth(20);
    debris.explode(4);
    this.time.delayedCall(400, () => debris.destroy());
    this.pod.container.destroy();
    this.pod = null;
    this.time.delayedCall(300, () => { if (this.hatchMark.active) this.hatchMark.setFillStyle(C_AMBER, 0.3); });
  }

  async retractPodAway(color) {
    if (!this.pod) return;
    await new Promise((res) => {
      this.tweens.add({ targets: this.pod.container, y: HATCH_Y, alpha: 0, duration: 350, ease: "Cubic.easeIn", onComplete: () => res() });
    });
    this.pod.container.destroy();
    this.pod = null;
  }

  // ══════════════════════════════════════════════════════════════
  // CLAW REVEAL (Level 28 mechanics, 1.4x pace)
  // ══════════════════════════════════════════════════════════════

  async clawExtract(index, groupId = 0) {
    const tile = this.getTile(index, groupId);
    if (!tile) return this.clawOutOfBounds(index);
    this.clawStatusLight.setFillStyle(C_CYAN);
    await this.moveClawTo(tile.x);
    if (!this._alive) return;

    const beam = this.add.line(0, 0, this.clawHeadContainer.x, this.clawHeadContainer.y, tile.x, TILE_Y - 32, C_CYAN, 0.4).setOrigin(0, 0).setDepth(17).setLineWidth(1);
    this.tweens.add({ targets: tile.plateG, scale: 1.3, duration: 110, yoyo: true });
    this.tweens.add({ targets: tile.plateText, scale: 1.3, duration: 110, yoyo: true });
    await this.delay(140);
    beam.destroy();
    if (!this._alive) return;

    this.clawGrip(false);
    await this.extendCable(TILE_Y - RAIL_Y - 11, 260, "Quad.easeIn");
    if (!this._alive) return;
    this.clawGrip(true);
    this.clawStatusLight.setFillStyle(C_AMBER);
    const sparks = this.add.particles(tile.x, TILE_Y, "l29_dot", {
      speed: { min: 30, max: 70 }, angle: { min: 0, max: 360 }, scale: { start: 0.5, end: 0 }, lifespan: 220, tint: C_AMBER, emitting: false,
    }).setDepth(20);
    sparks.explode(3);
    this.time.delayedCall(280, () => sparks.destroy());

    this._drawTileBody(tile.body, tile.tw, 0x2a3a4a, 1, true);
    tile.charText.setAlpha(0.15);
    const flyChar = this.add.text(tile.x, TILE_Y, tile.ch === " " ? "␣" : tile.ch, {
      font: "bold 22px Courier New", color: tile.ch === " " ? HEX_MAGENTA : this._charMeta(tile.ch).color,
    }).setOrigin(0.5).setDepth(30);
    this.roundElements.push(flyChar);
    await this.delay(60);
    if (!this._alive) return;

    await this.extendCable(40, 260);
    if (!this._alive) return;
    this.tweens.add({ targets: flyChar, x: RESULT_CX, y: RAIL_Y, duration: 260 });
    await this.moveClawTo(RESULT_CX);
    if (!this._alive) return;
    await new Promise((res) => this.tweens.add({ targets: flyChar, y: RESULT_CY - 8, duration: 200, ease: "Bounce.easeOut", onComplete: () => res() }));
    flyChar.destroy();
    this.showResultChar(tile.ch);
    this.clawStatusLight.setFillStyle(C_GRAY);
    return tile.ch;
  }

  async clawDoubleExtract(i1, i2, groupId = 0) {
    const ch1 = await this.clawExtract(i1, groupId);
    if (!this._alive) return;
    await this.delay(150);
    const pos1 = this.add.text(RESULT_CX - 45, RESULT_CY - 8, `'${ch1}'`, { font: "bold 24px Courier New", color: HEX_CYAN }).setOrigin(0.5).setDepth(16);
    this.roundElements.push(pos1);
    this.clearResultChar();
    const ch2 = await this.clawExtract(i2, groupId);
    if (!this._alive) return;
    this.resultCharText.setPosition(RESULT_CX + 45, RESULT_CY - 8);
    const eq = this.add.text(RESULT_CX, RESULT_CY - 8, "==", { font: "bold 20px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(16);
    this.roundElements.push(eq);
    return [ch1, ch2];
  }

  async clawOutOfBounds(index) {
    this.clawStatusLight.setFillStyle(C_CYAN);
    const n = this.tiles.length;
    let targetX;
    if (index < 0 || n === 0) targetX = 640;
    else {
      const last = this.tiles[n - 1];
      targetX = last.x + last.tw + 6 + last.tw / 2;
    }
    await this.moveClawTo(targetX);
    if (!this._alive) return;

    this.clawGrip(false);
    await this.extendCable(TILE_Y - RAIL_Y - 11, 260, "Quad.easeIn");
    if (!this._alive) return;
    this.clawGrip(true);
    this.clawStatusLight.setFillStyle(C_RED);
    const dust = this.add.particles(targetX, TILE_Y, "l29_dot", {
      speed: { min: 15, max: 35 }, angle: { min: 0, max: 360 }, scale: { start: 0.4, end: 0 }, lifespan: 300, tint: 0x78909c, emitting: false,
    }).setDepth(20);
    dust.explode(2);
    this.time.delayedCall(350, () => dust.destroy());

    this.activateBeacon();
    this.screenShake(0.004, 220);
    this.showExceptionStamp(index);
    await this.delay(280);
    if (!this._alive) return;
    await this.extendCable(40, 250);
    if (!this._alive) return;
    this.clawStatusLight.setFillStyle(C_GRAY);
    await this.parkClaw();
  }

  showExceptionStamp(index) {
    const t = this.add.text(1280, 250, `StringIndexOutOfBoundsException: index ${index}`, {
      font: "bold 13px Courier New", color: HEX_RED,
    }).setOrigin(0, 0.5).setDepth(60);
    this.roundElements.push(t);
    this.tweens.add({ targets: t, x: 640 - t.width / 2, duration: 300, ease: "Cubic.easeOut" });
    this.time.delayedCall(1500, () => this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() }));
  }

  showCompileErrorStamp() {
    const stamp = this.add.text(640, 400, "COMPILE ERROR", { font: "bold 28px Arial", color: HEX_RED }).setOrigin(0.5).setDepth(60).setScale(2).setAngle(-8).setAlpha(0);
    this.roundElements.push(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 220, ease: "Cubic.easeOut" });
    this.screenShake(0.005, 180);
  }

  showBracketContrastCard() {
    const c = this.add.container(640, 490).setDepth(20);
    const g = this.add.graphics();
    g.fillStyle(0x0d1117, 1);
    g.fillRoundedRect(-140, -43, 280, 86, 8);
    g.lineStyle(1, 0x2a3a4a, 1);
    g.strokeRoundedRect(-140, -43, 280, 86, 8);
    const l1 = this.add.text(0, -26, "array  → arr[0] ✓", { font: "bold 12px Courier New", color: HEX_AMBER }).setOrigin(0.5);
    const l2 = this.add.text(0, 0, "String → s.charAt(0) ✓", { font: "bold 12px Courier New", color: HEX_CYAN }).setOrigin(0.5);
    const l3 = this.add.text(0, 26, "String → s[0] ✗", { font: "bold 12px Courier New", color: HEX_RED }).setOrigin(0.5);
    c.add([g, l1, l2, l3]);
    c.setAlpha(0);
    this.tweens.add({ targets: c, alpha: 1, duration: 250 });
    this.roundElements.push(c);
    this.time.delayedCall(2000, () => this.tweens.add({ targets: c, alpha: 0, duration: 250, onComplete: () => c.destroy() }));
  }

  async showEvaluationFloat(lines) {
    for (let i = 0; i < lines.length; i++) {
      if (!this._alive) return;
      const t = this.add.text(640, 490 - i * 22, lines[i], { font: "bold 13px Courier New", color: HEX_AMBER }).setOrigin(0.5).setDepth(20).setAlpha(0);
      this.roundElements.push(t);
      this.tweens.add({ targets: t, alpha: 1, duration: 180 });
      await this.delay(320);
    }
  }

  showBooleanVerdict(value) {
    const t = this.add.text(RESULT_CX, RESULT_CY + 45, String(value), {
      font: "bold 18px Arial", color: value ? HEX_GREEN : HEX_RED,
    }).setOrigin(0.5).setDepth(16).setScale(0);
    this.roundElements.push(t);
    this.tweens.add({ targets: t, scale: 1, duration: 200, ease: "Back.easeOut" });
  }

  async runWalkerReveal(startIndex, str) {
    const tw = 18;
    const totalW = str.length * tw;
    const startX = 640 - totalW / 2;
    const tileObjs = [];
    for (let i = 0; i < str.length; i++) {
      const t = this.add.rectangle(startX + i * tw + tw / 2, TILE_Y + 60, tw - 3, 14, 0x1a2a3a).setStrokeStyle(1, 0x2a3a4a).setDepth(16);
      this.roundElements.push(t);
      tileObjs.push(t);
    }
    const walker = this.add.circle(startX + startIndex * tw + tw / 2, TILE_Y + 60, 4, C_CYAN).setDepth(17);
    this.roundElements.push(walker);
    if (startIndex > 0) {
      tileObjs[0].setStrokeStyle(2, C_AMBER);
      this.tweens.add({ targets: tileObjs[0], alpha: 0.4, duration: 200, yoyo: true, repeat: 2 });
      const skip = this.add.text(startX, TILE_Y + 40, "skipped!", { font: "10px Arial", color: HEX_AMBER }).setOrigin(0, 0.5).setDepth(17);
      this.roundElements.push(skip);
    }
    for (let i = startIndex; i < str.length; i++) {
      if (!this._alive) return;
      await new Promise((res) => this.tweens.add({ targets: walker, x: startX + i * tw + tw / 2, duration: 90, onComplete: () => res() }));
      tileObjs[i].setStrokeStyle(1, C_CYAN);
      await this.delay(40);
    }
    await this.delay(300);
    if (startIndex > 0) {
      // re-run correctly from 0
      await new Promise((res) => this.tweens.add({ targets: walker, x: startX + tw / 2, duration: 150, onComplete: () => res() }));
      for (let i = 0; i < str.length; i++) {
        if (!this._alive) return;
        await new Promise((res) => this.tweens.add({ targets: walker, x: startX + i * tw + tw / 2, duration: 90, onComplete: () => res() }));
        tileObjs[i].setStrokeStyle(1, C_GREEN);
        await this.delay(40);
      }
    }
  }

  // ══════════════════════════════════════════════════════════════
  // GAMEPLAY — round system
  // ══════════════════════════════════════════════════════════════

  async startRound(index) {
    if (!this._alive || this.gameEnded) return;
    this.currentRound = index;
    const cfg = ROUNDS[index];
    this.answered = false;
    this.inputLocked = true;
    this.clearRound();

    this.updateDeclarations(cfg.decl);
    this.buildTileRow(cfg.decl);
    this.clearResultChar();

    this.pod = this.spawnPod(cfg);
    await this.descendPod(this.pod);
    if (!this._alive || this.gameEnded) return;
    await this.delay(300);
    if (!this._alive || this.gameEnded) return;

    this.renderChallenge(cfg);
    this.launchPod(this.pod, cfg.timeLimit);
    this.inputLocked = false;
  }

  clearRound() {
    this._teardownKeys();
    this.hideBubble();
    this.optionBubbles.forEach((b) => b.destroy());
    this.optionBubbles = [];
    this.roundElements.forEach((e) => { if (e && e.destroy) e.destroy(); });
    this.roundElements = [];
    this.stopPod();
    if (this.pod) { this.pod.container.destroy(); this.pod = null; }
    if (this.declGroup) { this.declGroup.destroy(); this.declGroup = null; }
  }

  renderChallenge(cfg) {
    switch (cfg.type) {
      case "predict": this.setupPredict(cfg); break;
      case "judge": this.setupJudge(cfg); break;
      case "expression": this.setupExpression(cfg); break;
      case "bughunt": this.setupBugHunt(cfg); break;
    }
  }

  // ══════════════════════════════════════════════════════════════
  // OPTION BUBBLES
  // ══════════════════════════════════════════════════════════════

  showOptionBubbles(options, onSelect) {
    this.optionBubbles = [];
    const shuffled = Phaser.Utils.Array.Shuffle(options.slice());
    const style = { font: "bold 15px Courier New", color: HEX_CYAN };
    const widths = shuffled.map((o) => {
      const t = this.add.text(0, 0, o.label || String(o.value), style);
      const w = Math.max(t.width + 28, 56);
      t.destroy();
      return w;
    });
    const totalW = widths.reduce((a, b) => a + b, 0) + (shuffled.length - 1) * 12;
    let bx = 640 - totalW / 2;

    shuffled.forEach((opt, i) => {
      const w = widths[i], h = 38;
      const c = this.add.container(bx + w / 2, 560).setDepth(25);
      bx += w + 12;
      const g = this.add.graphics();
      const draw = (stroke) => {
        g.clear();
        g.fillStyle(0x1e1e3a, 1);
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 19);
        g.lineStyle(1.5, stroke, 1);
        g.strokeRoundedRect(-w / 2, -h / 2, w, h, 19);
      };
      draw(C_CYAN);
      const txt = this.add.text(0, 0, opt.label || String(opt.value), style).setOrigin(0.5);
      c.add([g, txt]);
      c.setSize(w, h);
      c.setData("value", opt.value);
      c.setData("draw", draw);
      c.setInteractive({ useHandCursor: true });
      c.on("pointerover", () => { if (!this.inputLocked) draw(0xffffff); });
      c.on("pointerout", () => { if (c.getData("state") !== "locked") draw(C_CYAN); });
      c.on("pointerdown", () => {
        if (this.inputLocked) return;
        this.inputLocked = true;
        c.setData("state", "locked");
        onSelect(opt, c, draw);
      });
      this.roundElements.push(c);
      this.optionBubbles.push(c);
    });
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE A — PREDICT
  // ══════════════════════════════════════════════════════════════

  setupPredict(cfg) {
    this.showOptionBubbles(cfg.options, (opt, bubble, draw) => {
      const correct = opt.value === cfg.correct;
      this._resolveAnswer(cfg, correct, opt.value, opt.tag, async () => {
        draw(correct ? C_GREEN : C_RED);
        if (!correct) {
          this.tweens.add({ targets: bubble, x: bubble.x + 6, duration: 45, yoyo: true, repeat: 5 });
          const correctBubble = this.optionBubbles.find((b) => b.getData("value") === cfg.correct);
          if (correctBubble) correctBubble.getData("draw")(C_GREEN);
        }
        if (cfg.steps) await this.showEvaluationFloat(cfg.steps);
        if (!this._alive) return;
        const idx = this._resolveIndexFromStr(cfg.str || cfg.decl[0].value, cfg);
        await this.clawExtract(idx);
      });
    });
  }

  _resolveIndexFromStr(str, cfg) {
    // extract the numeric index actually named/derivable from cfg.pod, defaulting to declared index
    if (cfg.pod.includes("length() - 1")) return str.length - 1;
    const m = cfg.pod.match(/charAt\((\d+)\)/);
    return m ? parseInt(m[1], 10) : 0;
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE B — JUDGE
  // ══════════════════════════════════════════════════════════════

  showJudgmentButtons(onSelect) {
    const mk = (x, label, color, key) => {
      const c = this.add.container(x, 570).setDepth(25);
      const g = this.add.graphics();
      const draw = (fillA) => {
        g.clear();
        g.fillStyle(color, fillA);
        g.fillRoundedRect(-90, -27, 180, 54, 12);
        g.lineStyle(2, color, 1);
        g.strokeRoundedRect(-90, -27, 180, 54, 12);
      };
      draw(0);
      const hex = "#" + color.toString(16).padStart(6, "0");
      const t = this.add.text(0, -6, label, { font: "bold 15px Arial", color: hex }).setOrigin(0.5);
      const keyHint = this.add.text(0, 16, `[${key}]`, { font: "10px Arial", color: "#546e7a" }).setOrigin(0.5);
      c.add([g, t, keyHint]);
      c.setSize(180, 54);
      c.setInteractive({ useHandCursor: true });
      c.on("pointerover", () => { if (!this.inputLocked) { draw(0.08); c.setScale(1.03); } });
      c.on("pointerout", () => { draw(0); c.setScale(1); });
      c.on("pointerdown", () => { if (!this.inputLocked) { this.inputLocked = true; onSelect(key === "S" ? "safe" : "crash"); } });
      this.roundElements.push(c);
      this.optionBubbles.push(c);
    };
    mk(480, "✓ SAFE", C_GREEN, "S");
    mk(800, "✗ CRASH", C_RED, "C");

    this._keyHandler = (e) => {
      if (this.inputLocked) return;
      if (e.key.toLowerCase() === "s") { this.inputLocked = true; onSelect("safe"); }
      else if (e.key.toLowerCase() === "c") { this.inputLocked = true; onSelect("crash"); }
    };
    this.input.keyboard.on("keydown", this._keyHandler);
  }

  _teardownKeys() {
    if (this._keyHandler) { this.input.keyboard.off("keydown", this._keyHandler); this._keyHandler = null; }
  }

  setupJudge(cfg) {
    this.showJudgmentButtons((choice) => {
      const correct = choice === cfg.correct;
      this._teardownKeys();
      this._resolveAnswer(cfg, correct, choice, correct ? null : cfg.wrongTag, async () => {
        if (cfg.crashType === "compile") {
          this.showCompileErrorStamp();
          await this.delay(300);
          if (!this._alive) return;
          const anno = this.add.text(640, 62, cfg.explanation, { font: "bold 12px Arial", color: HEX_RED, wordWrap: { width: 560 } }).setOrigin(0.5).setDepth(60).setAlpha(0);
          this.roundElements.push(anno);
          this.tweens.add({ targets: anno, alpha: 1, duration: 250 });
          await this.delay(600);
          if (!this._alive) return;
          this.showBracketContrastCard();
          await this.delay(500);
        } else if (cfg.correct === "crash") {
          if (cfg.steps) await this.showEvaluationFloat(cfg.steps);
          if (!this._alive) return;
          const crashIndex = cfg.crashIndex !== undefined ? cfg.crashIndex : cfg.decl[0].value.length;
          await this.clawOutOfBounds(crashIndex);
          if (!this._alive) return;
          const anno = this.add.text(640, 490, cfg.explanation, { font: "bold 12px Arial", color: HEX_RED, wordWrap: { width: 560 } }).setOrigin(0.5).setDepth(20).setAlpha(0);
          this.roundElements.push(anno);
          this.tweens.add({ targets: anno, alpha: 1, duration: 250 });
          await this.delay(500);
        } else {
          const m = cfg.pod.match(/charAt\((\d+)\)/);
          const idx = m ? parseInt(m[1], 10) : 0;
          await this.clawExtract(idx);
        }
      });
    });
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE C — EXPRESSION
  // ══════════════════════════════════════════════════════════════

  setupExpression(cfg) {
    this.showOptionBubbles(cfg.options, (opt, bubble, draw) => {
      const correct = opt.value === cfg.correct;
      this._resolveAnswer(cfg, correct, opt.value, opt.tag, async () => {
        draw(correct ? C_GREEN : C_RED);
        if (!correct) {
          this.tweens.add({ targets: bubble, x: bubble.x + 6, duration: 45, yoyo: true, repeat: 5 });
          const correctBubble = this.optionBubbles.find((b) => b.getData("value") === cfg.correct);
          if (correctBubble) correctBubble.getData("draw")(C_GREEN);
        }
        if (cfg.steps) await this.showEvaluationFloat(cfg.steps);
        if (!this._alive) return;

        // genuinely resolve every charAt(...) argument in the expression — never hardcode the index
        const indices = [...cfg.pod.matchAll(/charAt\((.+?)\)/g)].map((m) => {
          try { return Function(`"use strict"; return (${m[1]});`)(); } catch (_) { return 0; }
        });

        if (cfg.twoExtraction && indices.length >= 2) {
          await this.clawDoubleExtract(indices[0], indices[1]);
          if (!this._alive) return;
          this.showBooleanVerdict(cfg.correct === "true");
        } else if (cfg.pod.includes("==")) {
          await this.clawExtract(indices[0] || 0);
          if (!this._alive) return;
          this.showBooleanVerdict(cfg.correct === "true");
        } else {
          await this.clawExtract(indices[0] || 0);
        }
      });
    });
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE D — BUG HUNT
  // ══════════════════════════════════════════════════════════════

  setupBugHunt(cfg) {
    const strip = this.add.text(640, 265, "CLICK THE BUG", { font: "bold 13px Arial", color: HEX_MAGENTA }).setOrigin(0.5).setDepth(25);
    this.roundElements.push(strip);
    this.tweens.add({ targets: strip, alpha: 0.4, duration: 700, yoyo: true, repeat: -1 });

    const lines = this.pod.tokenLines;
    lines.forEach((line) => {
      line.forEach((tok) => {
        tok.text.on("pointerdown", () => {
          if (this.inputLocked) return;
          this.inputLocked = true;
          this.onTokenClicked(tok, lines, cfg);
        });
      });
    });
  }

  onTokenClicked(token, lines, cfg) {
    const correct = token.raw === cfg.faultToken;
    this._teardownKeys();
    this._resolveAnswer(cfg, correct, token.raw, correct ? null : cfg.wrongTag, async () => {
      if (correct) {
        token.text.setColor(HEX_RED);
        await this.delay(140);
        if (!this._alive) return;
        token.text.setColor(HEX_GREEN);
        const strike = this.add.rectangle(token.text.x + token.text.width / 2, token.text.y, token.text.width + 4, 2, C_RED).setDepth(36);
        this.roundElements.push(strike);
        const fixed = this.add.text(token.text.x, token.text.y - 18, cfg.fixedToken, { font: "bold 13px Courier New", color: HEX_GREEN }).setOrigin(0, 0.5).setAlpha(0).setDepth(36);
        this.roundElements.push(fixed);
        this.tweens.add({ targets: fixed, alpha: 1, duration: 220 });
        await this.delay(300);
        if (!this._alive) return;
        if (cfg.round === 15) {
          await this.runWalkerReveal(0, cfg.decl[0].value);
        } else {
          await this.clawExtract(0);
        }
      } else {
        this.tweens.add({ targets: token.text, x: token.text.x + 4, duration: 40, yoyo: true, repeat: 5 });
        const realBug = lines.flat().find((t) => t.raw === cfg.faultToken);
        if (realBug) {
          realBug.text.setColor(HEX_RED);
          this.tweens.add({ targets: realBug.text, scale: 1.3, duration: 200, yoyo: true, repeat: 2 });
        }
        if (cfg.round === 15) await this.runWalkerReveal(1, cfg.decl[0].value);
      }
    });
  }

  // ══════════════════════════════════════════════════════════════
  // ANSWER RESOLUTION
  // ══════════════════════════════════════════════════════════════

  async _resolveAnswer(cfg, correct, selected, tag, revealFn) {
    if (this.answered) return;
    this.answered = true;
    this.stopPod();
    const elapsed = this.time.now - this.roundStartTime;
    const timePctUsed = Phaser.Math.Clamp(elapsed / cfg.timeLimit, 0, 1);
    this.logAttempt(cfg, correct, selected, tag, elapsed, timePctUsed);

    this.stampPod(correct ? "CERTIFIED" : "FAILED");
    this.droneReact(correct);
    if (revealFn) await revealFn();
    if (!this._alive) return;
    await this.delay(350);
    if (!this._alive) return;

    await this.retractPodAway();
    if (!this._alive) return;

    const indexInWave = (cfg.round - 1) % 5;
    this.updateWaveIndicator(indexInWave, correct);

    if (correct) this.onCorrectAnswer(cfg, timePctUsed);
    else await this.onIncorrectAnswer(cfg, tag);
  }

  async onPodTimeout() {
    if (this.answered || !this.pod) return;
    this.answered = true;
    this.inputLocked = true;
    const cfg = ROUNDS[this.currentRound];
    this._teardownKeys();
    this.stopPod();
    this.logAttempt(cfg, false, null, "timeout", cfg.timeLimit, 1);
    this.stampPod("FAILED");
    this.droneReact(false);
    await this.delay(150);
    if (!this._alive) return;
    await this.yankPodAway();
    if (!this._alive) return;
    const indexInWave = (cfg.round - 1) % 5;
    this.updateWaveIndicator(indexInWave, false);
    await this.onIncorrectAnswer(cfg, "timeout");
  }

  logAttempt(cfg, correct, selected, tag, timeMs, timePctUsed) {
    this.totalTimePctUsed += timePctUsed;
    this.attemptLog.push({
      round: cfg.round, wave: cfg.wave, type: cfg.type, concept: cfg.concept, correct,
      selectedAnswer: selected, misconceptionTag: tag || null,
      timeMs: Math.round(timeMs), timePctUsed, attemptNumber: this.attemptLog.filter((a) => a.round === cfg.round).length + 1,
    });
  }

  onCorrectAnswer(cfg, timePctUsed) {
    if (this.gameEnded) return;
    this.inputLocked = true;
    this.correctFirstTry++;
    this.updateCombo(true);
    const multiplier = Math.min(this.combo, 5);
    let points = 100 * multiplier;
    const remaining = 1 - timePctUsed;
    if (remaining > 0.6) { points += 50; this.fastBonusCount++; this.createFloatingText(640, 300, "⚡ FAST +50", HEX_AMBER, "bold 15px Arial"); }
    else if (remaining > 0.3) { points += 25; this.fastBonusCount++; this.createFloatingText(640, 300, "⚡ FAST +25", HEX_AMBER, "bold 15px Arial"); }
    this.updateScore(points);

    this.time.delayedCall(700, () => {
      if (!this._alive || this.gameEnded) return;
      this.advanceRound();
    });
  }

  async onIncorrectAnswer(cfg, tag) {
    if (this.gameEnded) return;
    this.inputLocked = true;
    this.updateCombo(false);
    this.screenShake(0.004, 180);
    const dead = this.loseLife();
    if (dead) { this.time.delayedCall(500, () => this.gameOver()); return; }
    await this.showBitFeedback(MISCONCEPTION_FEEDBACK[tag] || "Inspect carefully — check the index, the syntax, and the boundaries.");
    if (!this._alive || this.gameEnded) return;
    this.time.delayedCall(500, () => {
      if (!this._alive || this.gameEnded) return;
      this.advanceRound();
    });
  }

  advanceRound() {
    const next = this.currentRound + 1;
    if (next >= ROUNDS.length) { this.levelComplete(); return; }
    if (ROUNDS[next].wave !== ROUNDS[this.currentRound].wave) this.startWave(ROUNDS[next].wave);
    else this.startRound(next);
  }

  updateScore(points) {
    this.score += points;
    const counter = { v: this.displayScore };
    this.tweens.add({
      targets: counter, v: this.score, duration: 300,
      onUpdate: () => { this.displayScore = Math.round(counter.v); if (this.scoreText.active) this.scoreText.setText(String(this.displayScore)); },
    });
  }

  updateCombo(correct) {
    if (correct) {
      this.combo++;
      this.maxCombo = Math.max(this.maxCombo, this.combo);
      this.comboText.setText(`×${this.combo}`);
      if (this.combo >= 2) this.tweens.add({ targets: this.comboText, scale: 1.4, duration: 150, yoyo: true });
    } else {
      if (this.combo >= 2) this.comboShatterEffect();
      this.combo = 0;
      this.comboText.setText("×1");
    }
  }

  comboShatterEffect() {
    const { x, y } = this.comboText;
    const p = this.add.particles(x + 10, y + 8, "l29_dot", {
      speed: { min: 40, max: 140 }, angle: { min: 0, max: 360 }, scale: { start: 0.5, end: 0 }, lifespan: 400, tint: 0xffd740, emitting: false,
    }).setDepth(55);
    p.explode(12);
    this.time.delayedCall(600, () => p.destroy());
  }

  loseLife() {
    this.lives = Math.max(0, this.lives - 1);
    const icon = this.lifeIcons[this.lives];
    if (icon) this.tweens.add({ targets: icon, alpha: 0.12, duration: 400 });
    return this.lives <= 0;
  }

  createFloatingText(x, y, text, colorHex, font = "bold 16px Arial") {
    const t = this.add.text(x, y, text, { font, color: colorHex }).setOrigin(0.5).setDepth(65);
    this.tweens.add({ targets: t, y: y - 34, alpha: 0, duration: 900, ease: "Cubic.easeOut", onComplete: () => t.destroy() });
    return t;
  }

  createConfetti(x, y, count = 30) {
    const p = this.add.particles(x, y, "l29_dot", {
      speed: { min: 80, max: 260 }, angle: { min: 0, max: 360 }, scale: { start: 0.9, end: 0 }, lifespan: 500,
      tint: [C_CYAN, C_AMBER, C_GREEN, C_PURPLE, 0xffffff], emitting: false,
    }).setDepth(65);
    p.explode(count);
    this.time.delayedCall(900, () => p.destroy());
  }

  screenShake(intensity = 0.004, duration = 200) {
    this.cameras.main.shake(duration, intensity);
  }

  // ══════════════════════════════════════════════════════════════
  // END STATES
  // ══════════════════════════════════════════════════════════════

  async certificationCeremony() {
    this.drones.forEach((d, i) => {
      this.tweens.add({ targets: d.c, x: 640 + (i - 1) * 30, y: 250, duration: 500, delay: i * 100 });
    });
    await this.delay(700);
    for (let i = 0; i < 3; i++) {
      this.clawGrip(true);
      await this.delay(120);
      this.clawGrip(false);
      await this.delay(120);
    }
    this.createConfetti(RESULT_CX, RESULT_CY, 36);
    await this.delay(600);
  }

  gameOver() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearRound();
    this.hideBubble();

    this.hatchMark.setFillStyle(C_RED, 0.7);
    this.drones.forEach((d) => { this.tweens.add({ targets: d.c, scaleX: -1, duration: 300 }); d.eye.setAlpha(0.1); });
    this.clawStatusLight.setFillStyle(0x333333);

    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
    this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });

    const title = this.add.text(640, 240, "CERTIFICATION DENIED", { font: "bold 38px Arial", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
    this.tweens.add({
      targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut",
      onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }),
    });
    this.add.text(640, 310, `Score: ${this.score}`, { font: "20px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
    this.add.text(640, 350, `Trials Passed: ${this.currentRound} / ${ROUNDS.length}`, { font: "16px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);

    this._makeButton(640, 420, "RETAKE TRIALS", 200, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearRound();
    this.hideBubble();

    const accuracy = this.correctFirstTry / ROUNDS.length;
    const avgTimePct = this.totalTimePctUsed / ROUNDS.length;
    try { GameManager.completeLevel(28, Math.round(accuracy * 100)); } catch (_) {}
    try { BadgeSystem.unlock("charAt_schema_tuned"); } catch (_) {}
    try {
      localStorage.setItem("level29_results", JSON.stringify({
        level: 29, concept: "string_charAt", phase: "tuning",
        score: this.score, accuracy, avgTimePct, fastBonuses: this.fastBonusCount,
        comboMax: this.maxCombo, stars: this._starRating(accuracy, avgTimePct),
        livesRemaining: this.lives, attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.certificationCeremony().then(() => { if (this._alive) this.showScoreTally(accuracy, avgTimePct); });
  }

  _starRating(accuracy, avgTimePct) {
    if (accuracy >= 0.9 && avgTimePct <= 0.55) return 3;
    if (accuracy >= 0.75) return 2;
    return 1;
  }

  showScoreTally(accuracy, avgTimePct) {
    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
    this.tweens.add({ targets: ov, fillAlpha: 0.85, duration: 500 });

    const panel = this.add.graphics().setDepth(90);
    panel.fillStyle(0x141020, 1);
    panel.fillRoundedRect(360, 140, 560, 440, 16);
    panel.lineStyle(2, C_GREEN, 1);
    panel.strokeRoundedRect(360, 140, 560, 440, 16);

    const title = this.add.text(640, 190, "OPERATOR CERTIFIED", { font: "bold 34px Arial", color: HEX_GREEN }).setOrigin(0.5).setDepth(91).setScale(0);
    this.tweens.add({ targets: title, scale: 1, duration: 350, ease: "Back.easeOut" });

    const lines = [
      `ACCURACY: ${Math.round(accuracy * 100)}%`,
      `AVG RESPONSE: ${Math.round(avgTimePct * 100)}% of time limit`,
      `FAST BONUSES: ${this.fastBonusCount}`,
      `BEST COMBO: ×${this.maxCombo}`,
    ];
    lines.forEach((s, i) => {
      const t = this.add.text(500, 250 + i * 30, s, { font: "14px Arial", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 250, delay: 300 + i * 150 });
    });
    const totalText = this.add.text(500, 250 + 4 * 30, "TOTAL: 0", { font: "bold 24px Arial", color: HEX_AMBER }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: totalText, alpha: 1, duration: 250, delay: 1050 });
    const counter = { v: 0 };
    this.tweens.add({ targets: counter, v: this.score, duration: 1000, delay: 1050, onUpdate: () => totalText.setText(`TOTAL: ${Math.round(counter.v)}`) });

    const stars = this._starRating(accuracy, avgTimePct);
    for (let i = 0; i < 3; i++) {
      const earned = i < stars;
      const s = this.add.text(640 + (i - 1) * 60, 415, "★", { font: "40px Arial", color: earned ? HEX_AMBER : "#2a3040" }).setOrigin(0.5).setDepth(91).setScale(0);
      this.tweens.add({ targets: s, scale: 1, duration: 250, delay: 1650 + i * 200, ease: earned ? "Back.easeOut" : "Cubic.easeOut" });
    }

    const badge = this.add.container(640, 495).setDepth(91).setAlpha(0);
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillCircle(0, 0, 30);
    bg.lineStyle(2, C_AMBER, 1);
    bg.strokeCircle(0, 0, 30);
    bg.lineStyle(2, C_PURPLE, 1);
    bg.beginPath(); bg.arc(-8, 4, 8, Phaser.Math.DegToRad(-40), Phaser.Math.DegToRad(80), false); bg.strokePath();
    bg.beginPath(); bg.arc(2, 4, 8, Phaser.Math.DegToRad(100), Phaser.Math.DegToRad(220), false); bg.strokePath();
    bg.lineStyle(2, C_AMBER, 1);
    bg.strokeCircle(6, -10, 6);
    bg.fillStyle(C_AMBER, 1);
    bg.fillCircle(6, -10, 2);
    badge.add(bg);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 2100 });
    const badgeLbl = this.add.text(640, 533, "charAt() SCHEMA TUNED", { font: "bold 13px Arial", color: HEX_AMBER }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: badgeLbl, alpha: 1, duration: 300, delay: 2200 });

    this._makeButton(500, 555, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(760, 555, "NEXT: The Workshop →", 220, 44, { fill: 0x00733a, stroke: C_GREEN, textColor: "#ffffff" }, () => {
      if (this.scene.get("Level30Scene")) this.scene.start("Level30Scene");
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
