/**
 * Level 57 — "The Calculation Chamber" (Math Methods: Restructuring
 * Phase — max()/min() trilogy finale)
 * ===========================================================================
 * The learner CONSTRUCTS complete comparison programs — no multiple
 * choice. Reuses the L27→L54 code-canvas/parts-bin/RUN architecture. The
 * rig hosts a 50%-scale Great Comparator (L55), the number-line rail
 * (L56) extended with a clamp-range bracket, a compact Survey Tracker
 * (L50/L53 lineage) for Mission 6's running-max loop, a Scanner intake
 * tape (L34/L54 lineage) for Mission 5, and a 40%-scale bookshelf (L46
 * lineage, read-only ghost retrievals) for Mission 6.
 *
 * A genuine unified mini-interpreter (never scripted) executes the
 * assembled program: Math.max/min resolve honestly with inner-first
 * nesting and int/double widening (the L55/L56 evaluator), Scanner
 * consumes real tokens from the tape, ArrayList.get() reads via ghost
 * (never mutating), for-loops re-evaluate size() live, and println
 * concatenates real values. Wrong builds must yield their REAL
 * outcomes — the cap-swap fails both directions, the broken clamp
 * crushes every input to one edge, the zero-seed publishes a false
 * record on all-negative data, never a scripted "you are wrong".
 */

import Phaser from "phaser";
import { GameManager } from "../../../../GameManager.js";
import { WellbeingAPI } from "../../../../../api/api.js";
import { BadgeSystem } from "../../../../BadgeSystem.js";
import { BehavioralRules } from "../../../../ml/BehavioralRules.js";

const W = 1280, H = 720;

const C_CYAN = 0x4fc3f7, C_GOLD = 0xffd740, C_ORANGE = 0xff9800, C_BLUE_GRAY = 0x8ea6c8;
const C_GREEN_BRIGHT = 0x00e676, C_RED = 0xf44336, C_GRAY = 0x78909c, C_BRASS = 0xc8a05a;
const HEX_CYAN = "#4fc3f7", HEX_GOLD = "#ffd740", HEX_ORANGE = "#ff9800", HEX_BLUE_GRAY = "#8ea6c8";
const HEX_GREEN_BRIGHT = "#00e676", HEX_RED = "#f44336", HEX_GRAY = "#78909c", HEX_BRASS = "#c8a05a";

const CX = 40, CY = 90, CW = 680, CH = 380;
const TAB_H = 34, GUTTER_W = 34, CODE_PAD = 10;
const CODE_X = CX + GUTTER_W + CODE_PAD;
const CODE_Y0 = CY + TAB_H + 14;
const LINE_H = 21;
const PX = 40, PY = 490, PW = 680, PH = 130;
const OX = 760, OY = 80, OW = 460, OH = 250;
const MANIFEST_Y = 316;
const RX = 760, RY = 345, RW = 460, RH = 125;
const BX = 760, BY = 490, BW = 460, BH = 130;
const TUTORIAL_KEY = "level57_tutorial_done";

// Rig internal layout
const MC_BEAM_CX = OX + 225, MC_BEAM_Y = OY + 56;
const MC_CRADLE_A = { x: MC_BEAM_CX - 48, y: MC_BEAM_Y + 40 };
const MC_CRADLE_B = { x: MC_BEAM_CX + 48, y: MC_BEAM_Y + 40 };
const MC_PLINTH = { x: MC_BEAM_CX, y: MC_BEAM_Y + 82 };
const RAIL_X0 = OX + 145, RAIL_X1 = OX + 305, RAIL_Y = OY + 172;
const TAPE_Y = OY + 24;
const CONT_X = OX + 12, CONT_Y0 = OY + 44;
const TRK_X = OX + 345, TRK_W = 105, TRK_Y0 = OY + 44;
const TICKER_Y = OY + 236;
const SHELF_X = CONT_X + 8, SHELF_Y = OY + 205;

// ══════════════════════════════════════════════════════════════
// MISSION CONFIGURATION
// ══════════════════════════════════════════════════════════════
const MISSIONS = [
  { mission: 1, title: "The Brightness Verdict",
    brief: "Two stars, one headline. Publish the brighter magnitude. For s1=62, s2=88:\nBrighter: 88",
    skeleton: [
      'int s1 = /* test value */;',
      'int s2 = /* test value */;',
      'System.out.println("Brighter: " + <slot:verdict>);'
    ],
    slots: [{ id: "verdict", hint: "the verdict" }],
    palette: [
      { code: 'Math.max(s1, s2)', correct: true },
      { code: 'Math.max(s2, s1)', correct: true, alsoCorrect: true },
      { code: 'Math.min(s1, s2)', tag: "max_min_direction_confusion" },
      { code: 's1.max(s2)', tag: "instance_call_on_number_belief" },
      { code: '"Math.max(s1, s2)"', tag: "variable_as_literal_belief" },
    ],
    tests: [
      { substitutions: { s1: '62', s2: '88' }, expectedOutput: "Brighter: 88" },
      { substitutions: { s1: '91', s2: '45' }, expectedOutput: "Brighter: 91" },
    ],
    postMissionNote: "Bit: 'Argument order never matters to the Comparator — both cradles are equal citizens. The METHOD name carries all the meaning.'",
    concept: "verdict_into_println" },

  { mission: 2, title: "The Three-Way Peak",
    brief: "Three stations report; publish the highest reading. For 45, 71, 88:\nPeak: 88",
    skeleton: [
      'int m1 = /* test value */;',
      'int m2 = /* test value */;',
      'int m3 = /* test value */;',
      'int peak = <slot:judge>;',
      'System.out.println("Peak: " + peak);'
    ],
    slots: [{ id: "judge", hint: "judge all three (nest!)" }],
    palette: [
      { code: 'Math.max(m1, Math.max(m2, m3))', correct: true },
      { code: 'Math.max(Math.max(m1, m2), m3)', correct: true, alsoCorrect: true },
      { code: 'Math.max(m1, m2, m3)', tag: "max_three_args_belief" },
      { code: 'Math.max(m1, m2)', tag: "third_value_ignored" },
      { code: 'Math.min(m1, Math.min(m2, m3))', tag: "max_min_direction_confusion" },
    ],
    tests: [
      { substitutions: { m1: '45', m2: '71', m3: '88' }, expectedOutput: "Peak: 88" },
      { substitutions: { m1: '93', m2: '12', m3: '77' }, expectedOutput: "Peak: 93" },
      { substitutions: { m1: '30', m2: '95', m3: '41' }, expectedOutput: "Peak: 95" },
    ],
    postMissionNote: "Bit: 'Two cradles, three candidates — nesting is the bridge. The tests rotated the peak through every station; only a complete judgment survives all three nights.'",
    concept: "nested_peak_production" },

  { mission: 3, title: "The Instrument Cap",
    brief: "The photometer saturates at 100 — publish readings capped at 100. For 137: 'Reading: 100'. For 82: 'Reading: 82'.",
    skeleton: [
      'int raw = /* test value */;',
      'int reading = <slot:cap>;',
      'System.out.println("Reading: " + reading);'
    ],
    slots: [{ id: "cap", hint: "the cap" }],
    palette: [
      { code: 'Math.min(raw, 100)', correct: true },
      { code: 'Math.min(100, raw)', correct: true, alsoCorrect: true },
      { code: 'Math.max(raw, 100)', tag: "cap_floor_swap" },
      { code: '100', tag: "constant_ignores_reading" },
      { code: 'Math.min(raw, raw)', tag: "limit_missing" },
    ],
    tests: [
      { substitutions: { raw: '137' }, expectedOutput: "Reading: 100" },
      { substitutions: { raw: '82' }, expectedOutput: "Reading: 82" },
      { substitutions: { raw: '100' }, expectedOutput: "Reading: 100" },
    ],
    postMissionNote: "Bit: 'min against a limit — the ceiling. The max build failed both nights in opposite directions: it let 137 through AND raised 82. One method name, the whole meaning.'",
    concept: "cap_production" },

  { mission: 4, title: "The Range Pin",
    brief: "Dome-motor power must live in [0, 100] — below 0 pins to 0, above 100 pins to 100, in-range passes through. For -20: 'Power: 0'. For 250: 'Power: 100'. For 45: 'Power: 45'.",
    skeleton: [
      'int input = /* test value */;',
      'int power = <slot:clamp>;',
      'System.out.println("Power: " + power);'
    ],
    slots: [{ id: "clamp", hint: "the full clamp" }],
    isClamp: true,
    palette: [
      { code: 'Math.max(0, Math.min(input, 100))', correct: true, clampShape: "max_outside" },
      { code: 'Math.min(100, Math.max(input, 0))', correct: true, alsoCorrect: true, clampShape: "min_outside" },
      { code: 'Math.min(0, Math.max(input, 100))', tag: "clamp_shape_broken" },
      { code: 'Math.max(100, Math.min(input, 0))', tag: "clamp_shape_broken" },
      { code: 'Math.min(input, 100)', tag: "half_clamp_ceiling_only" },
      { code: 'Math.max(input, 0)', tag: "half_clamp_floor_only" },
    ],
    tests: [
      { substitutions: { input: '-20' }, expectedOutput: "Power: 0" },
      { substitutions: { input: '250' }, expectedOutput: "Power: 100" },
      { substitutions: { input: '45' }, expectedOutput: "Power: 45" },
    ],
    railBracket: [0, 100],
    postMissionNote: "Bit: 'THE CLAMP — the wing's signature line. Ceiling inside, floor outside — or floor inside, ceiling outside; both shapes hold. But swap the limits onto the wrong methods and the pin becomes a crusher. Three tests, three regions, no holes: that's a published clamp.'",
    concept: "clamp_flagship" },

  { mission: 5, title: "The Visitor's Dial",
    brief: "Visitors set the projector brightness by typing a number — but the lamp only accepts [10, 90]. Read the request, pin it, publish. For input '150': 'Brightness set: 90'. For '50': 'Brightness set: 50'. For '-5': 'Brightness set: 10'.",
    skeleton: [
      'Scanner sc = new Scanner(System.in);',
      '',
      'int request = <slot:read>;',
      'int level = <slot:pin>;',
      'System.out.println("Brightness set: " + level);'
    ],
    slots: [{ id: "read", hint: "read the request" }, { id: "pin", hint: "pin to [10, 90]" }],
    isClamp: true, crossWing: true,
    palette: [
      { code: 'sc.nextInt()', correct: true, slotId: "read" },
      { code: 'sc.nextLine()', tag: "wrong_scanner_method", slotId: "read" },
      { code: 'Math.max(10, Math.min(request, 90))', correct: true, slotId: "pin", clampShape: "max_outside" },
      { code: 'Math.min(90, Math.max(request, 10))', correct: true, alsoCorrect: true, slotId: "pin", clampShape: "min_outside" },
      { code: 'Math.min(10, Math.max(request, 90))', tag: "clamp_shape_broken", slotId: "pin" },
      { code: 'Math.min(request, 90)', tag: "half_clamp_ceiling_only", slotId: "pin" },
    ],
    tests: [
      { input: ["150"], expectedOutput: "Brightness set: 90" },
      { input: ["50"], expectedOutput: "Brightness set: 50" },
      { input: ["-5"], expectedOutput: "Brightness set: 10" },
    ],
    railBracket: [10, 90],
    postMissionNote: "Bit: 'A stranger's number, pinned safe in one line — this is why the clamp exists. Every slider, every dial, every volume knob in every program you'll ever write: this exact shape.'",
    concept: "scanner_clamp_pipeline" },

  { mission: 6, title: "The Night Survey",
    brief: "The night's magnitude readings sit in a list. Survey them all and publish the RECORD (the maximum). For [-2, -8, -1, -5]:\nRecord: -1\n(Winter skies — every reading may be negative!)",
    skeleton: [
      'ArrayList<Integer> readings = /* populated by test */;',
      '',
      'int best = <slot:seed>;',
      'for (int i = 1; <slot:cond>; i++) {',
      '    <slot:update>',
      '}',
      'System.out.println("Record: " + best);'
    ],
    slots: [{ id: "seed", hint: "seed the record" }, { id: "cond", hint: "the bound" }, { id: "update", hint: "challenge the record" }],
    crossWing: true,
    palette: [
      { code: 'readings.get(0)', correct: true, slotId: "seed" },
      { code: '0', tag: "zero_seed_negative_bug", slotId: "seed" },
      { code: 'readings.get(1)', tag: "seed_skips_first", slotId: "seed" },
      { code: 'i < readings.size()', correct: true, slotId: "cond" },
      { code: 'i <= readings.size()', tag: "loop_bound_inclusive_size", slotId: "cond" },
      { code: 'best = Math.max(best, readings.get(i));', correct: true, slotId: "update" },
      { code: 'best = readings.get(i);', tag: "running_record_not_updated", slotId: "update" },
      { code: 'best = Math.min(best, readings.get(i));', tag: "max_min_direction_confusion", slotId: "update" },
      { code: 'Math.max(best, readings.get(i));', tag: "bare_call_stores_result_belief", slotId: "update" },
    ],
    tests: [
      { initialList: [-2, -8, -1, -5], expectedOutput: "Record: -1" },
      { initialList: [45, 71, 88, 12], expectedOutput: "Record: 88" },
      { initialList: [7], expectedOutput: "Record: 7" },
    ],
    postMissionNote: "Bit (visor raised, quiet): 'Seed from the DATA, bound with strict less-than, challenge the record every lap — the running max. Tonight it found the brightest star; tomorrow it finds your highest score, your longest streak, your best time. Four wings in one loop, Calculator. The trilogy is yours — and the Comparator will be waiting when the next instrument arrives.'",
    concept: "running_max_capstone" },
];

const MISCONCEPTION_FEEDBACK = {
  clamp_shape_broken: "The rail tells it — every marker crushed to the same edge, all three tests. The limits sat on the WRONG methods: min guards the ceiling (high limit), max guards the floor (low limit). Swap them back.",
  half_clamp_ceiling_only: "Two tests passed, one leaked — the below-range input walked straight through. A ceiling alone is half a pin; add the floor: max against the low limit.",
  half_clamp_floor_only: "The above-range input leaked — a floor alone can't cap. Add the ceiling: min against the high limit.",
  cap_floor_swap: "max against a limit RAISES — the report shows 82 lifted to 100 and 137 untouched. A cap is min; a floor is max. The method name is the whole behavior.",
  constant_ignores_reading: "100 forever — the raw value never mattered. The cap must consult it: min(raw, limit).",
  limit_missing: "min(raw, raw) compares the reading with itself — no limit, no cap. The ceiling must be IN the call.",
  zero_seed_negative_bug: "THE published lie: 'Record: 0' — a magnitude no star ever had. Zero sat in the cradle beating every negative reading; the tracker's best column never moved. Seed from the DATA — readings.get(0) — and no sky can fool you.",
  seed_skips_first: "The seed took index 1 and the loop started at 1 — index 0 was never a candidate. Seed with get(0); the loop's start of 1 is then exactly right.",
  running_record_not_updated: "best = get(i) REPLACES — the tracker shows the record bouncing to whatever came last. The record must be DEFENDED: best = Math.max(best, challenger).",
  bare_call_stores_result_belief: "The verdict star faded on the plinth every lap — computed, never caught. Assign it back: best = Math.max(best, ...). Java keeps no lost-and-found.",
  max_min_direction_confusion: "Check the needle's swing in the rig — it chose the smaller. Max for records and peaks; min for caps and faintest. The question picks the method.",
  third_value_ignored: "The rotating tests caught it — one night's peak sat in the unmeasured station, ringed red on the canvas. Nest to judge all three.",
  max_three_args_belief: "Two cradles — no three-argument edition exists. The compile stamp says so. Nest: the inner verdict faces the third.",
  instance_call_on_number_belief: "The chamber's oldest reflex — numbers carry no instruments. Math.max(s1, s2); the class name is the address.",
  loop_bound_inclusive_size: "The tracker's last row is red — i reached size and get(size) fell off the shelf. Strictly less-than; three wings have taught this cliff.",
  wrong_scanner_method: "The compile stamp — nextLine() hands back a String and the int container refused it. A number needs nextInt().",
  variable_as_literal_belief: "The call printed as LETTERS — trapped in the quotes. Close the quote, then + the live verdict.",
};

const HINTS = {
  1: "Math.max(s1, s2) — publish the greater magnitude straight into the println.",
  2: "One call only judges two. Nest: Math.max(m1, Math.max(m2, m3)) reaches all three.",
  3: "Math.min(raw, 100) — whichever is smaller passes through, capping anything above 100.",
  4: "The clamp is two calls: an inner min against the ceiling, an outer max against the floor (or the mirror order).",
  5: "sc.nextInt() reads the number; then pin it with the same clamp shape as Mission 4.",
  6: "Seed with readings.get(0), loop while i < readings.size(), and inside: best = Math.max(best, readings.get(i));",
};

export class Level57Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level57Scene" });
  }

  init() {
    this.currentMission = 0;
    this.score = 0;
    this.displayScore = 0;
    this.lives = 5;
    this.flawlessCount = 0;
    this.runCount = 0;
    this.failedRunCount = 0;
    this.hintCount = 0;
    this.selfCorrectionCount = 0;
    this.clampProactive = {};
    this.clampShapeChoice = {};
    this.seedChoiceFirstRun = {};
    this.crossWingCleanFirstRun = {};
    this.attemptLog = [];
    this.missionElements = [];
    this.slotContents = {};
    this.slotDefs = {};
    this.paletteBlocks = [];
    this.missionStartTime = 0;
    this.missionRunsFailed = 0;
    this.missionHintUsed = false;
    this.currentList = [];
    this._firstRunMetricsRecorded = {};
    this._runCountAtMissionStart = 0;
    this.inputLocked = true;
    this.gameEnded = false;
    this._alive = true;
    this._modalLockedInput = false;
    this.baseTutorialScene = "Level55Scene";
  }

  preload() {}

  create() {
    this._alive = true;
    this.createParticleTexture();
    this.createBackground();
    this.createChamberInterior();
    this.createCalculatingEngine();
    this.createChamberFloor();
    this.createResultsBoard();
    this.createAmbientParticles();
    this.createCodeCanvas();
    this.createBlockPalette();
    this.createRunButton();
    this.createRigWindow();
    this.createMiniComparator();
    this.createMiniNumberRail();
    this.createMiniContainers();
    this.createMiniSurveyTracker();
    this.createMiniOutputTicker();
    this.createMiniCrossWingCameos();
    this.createManifestStrip();
    this.createTestReportPanel();
    this.createMissionBriefPanel();
    this.createHUD();
    this.createBit();
    this.setupDragEvents();

    this.events.on("shutdown", () => { this._alive = false; });
    this.checkTutorial();
  }

  update(time, delta) {
    if (GameManager.interventionInFlight) {
      if (!this.inputLocked) this._modalLockedInput = true;
      this.inputLocked = true;
      return;
    } else if (this._modalLockedInput) {
      this._modalLockedInput = false;
      this.inputLocked = false;
      this.updateRunButtonState();
    }
    this.updateAmbient(time, delta);
    this.updateResultsBoardPulse(time);
    this.updateEngineCrank(time, delta);
    this.updateNeedleIdle(time);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // SETUP — CHAMBER INTERIOR
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l57_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l57_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x060810).setDepth(0);
  }

  createChamberInterior() {
    const g = this.add.graphics().setDepth(1);
    g.lineStyle(1, 0x141a2c, 0.4);
    for (let x = 0; x < W; x += 24) g.lineBetween(x, 108, x, 216);
    g.fillStyle(0x0a0f0c, 1);
    g.lineStyle(3, 0x8a6435, 1);
    g.fillRoundedRect(200, 30, 580, 140, 4);
    g.strokeRoundedRect(200, 30, 580, 140, 4);
    g.lineStyle(1, 0xe8eaf6, 0.12);
    g.lineBetween(230, 60, 340, 60);
    g.lineBetween(230, 63, 300, 63);
    g.strokeCircle(560, 100, 3);
    for (let i = 0; i < 14; i++) g.lineBetween(420 + i * 8, 130, 424 + i * 8, 134);
    for (let i = 0; i < 6; i++) g.strokeCircle(Phaser.Math.Between(230, 750), Phaser.Math.Between(45, 150), 1);

    const shelfG = this.add.graphics().setDepth(2);
    shelfG.lineStyle(2, 0x8a6435, 0.4);
    shelfG.lineBetween(880, 60, 1160, 60);
    const spineColors = [0x2a3654, 0x8ea6c8, 0xc8a05a];
    let sx = 890;
    while (sx < 1150) {
      const w = Phaser.Math.Between(8, 16), h = Phaser.Math.Between(30, 46);
      shelfG.fillStyle(Phaser.Utils.Array.GetRandom(spineColors), 0.3);
      shelfG.fillRect(sx, 60 - h, w, h);
      sx += w + 2;
    }

    const bg = this.add.graphics().setDepth(2);
    bg.fillStyle(0x04060c, 1);
    bg.lineStyle(1, C_BRASS, 0.5);
    bg.fillRoundedRect(400, 12, 380, 26, 3);
    bg.strokeRoundedRect(400, 12, 380, 26, 3);
    this.add.text(590, 25, "T H E   C A L C U L A T I O N   C H A M B E R", { font: "bold 14px Georgia", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.7).setDepth(3);
  }

  createCalculatingEngine() {
    const c = this.add.container(90, 480).setDepth(3);
    const g = this.add.graphics();
    g.fillStyle(0x141a2c, 1);
    g.lineStyle(2, C_BRASS, 1);
    g.fillRoundedRect(-30, -20, 60, 40, 4);
    g.strokeRoundedRect(-30, -20, 60, 40, 4);
    const wheels = [];
    for (let i = 0; i < 4; i++) {
      const wx = -20 + i * 13;
      const wg = this.add.graphics();
      wg.lineStyle(1, C_GOLD, 0.8);
      wg.strokeCircle(wx, -2, 5);
      wg.lineBetween(wx, -6, wx, -2);
      c.add(wg);
      wheels.push({ g: wg, x: wx });
    }
    const crank = this.add.container(34, 0);
    const ck = this.add.graphics();
    ck.lineStyle(2, C_BRASS, 1);
    ck.lineBetween(0, 0, 10, 0);
    ck.lineBetween(10, 0, 10, -10);
    ck.fillStyle(0x8a6435, 1);
    ck.fillCircle(10, -10, 2.5);
    crank.add(ck);
    c.add(crank);
    this._engineCrank = crank;
    this._engineWheels = wheels;
  }

  updateEngineCrank(time, delta) {
    if (!this._engineCrank) return;
    const speed = this._runInProgress ? 720 : 0;
    this._engineCrank.angle = (this._engineCrank.angle + speed * (delta / 1000)) % 360;
  }

  createChamberFloor() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x0a0d18, 1);
    g.fillRect(0, 635, W, 85);
    g.lineStyle(1, 0x2a3654, 1);
    g.lineBetween(0, 637, W, 637);
    g.lineStyle(1, 0x2a3654, 0.3);
    for (let x = 0; x < W; x += 100) g.lineBetween(x, 640, x, 720);
    g.lineStyle(1, C_BRASS, 0.06);
    for (let r = 8; r <= 32; r += 8) g.strokeRoundedRect(90 - r, 480 + 60 - r, r * 2, r * 2, 4);
  }

  createResultsBoard() {
    const c = this.add.container(928, 69).setDepth(4);
    const g = this.add.graphics();
    g.fillStyle(0x060810, 1);
    g.lineStyle(1.5, C_BRASS, 1);
    g.fillRoundedRect(-48, -13, 96, 26, 4);
    g.strokeRoundedRect(-48, -13, 96, 26, 4);
    const t = this.add.text(0, 0, "IN COMPUTATION", { font: "bold 11px Georgia", color: HEX_BLUE_GRAY }).setOrigin(0.5);
    c.add([g, t]);
    c.setAlpha(0.4);
    this._resultsBoard = { c, g, t, state: "idle" };
  }

  setResultsBoard(state) {
    const b = this._resultsBoard;
    b.state = state;
    if (state === "idle") {
      b.t.setText("IN COMPUTATION").setColor(HEX_BLUE_GRAY);
      b.c.setAlpha(0.4);
    } else if (state === "computation") {
      b.t.setText("IN COMPUTATION").setColor(HEX_BLUE_GRAY);
      b.c.setAlpha(0.8);
    } else if (state === "published") {
      this.tweens.add({
        targets: b.c, scaleX: 0, duration: 150,
        onComplete: () => {
          b.t.setText("PUBLISHED").setColor(HEX_GOLD);
          b.c.setAlpha(1);
          this.tweens.add({ targets: b.c, scaleX: 1, duration: 150 });
        },
      });
    }
  }

  updateResultsBoardPulse(time) {
    if (!this._resultsBoard || this._resultsBoard.state !== "computation") return;
    this._resultsBoard.c.setAlpha(0.6 + Math.abs(Math.sin(time * 0.006)) * 0.4);
  }

  createAmbientParticles() {
    this.ambient = [];
    const colors = [0x8ea6c8, 0xc8a05a, 0xe8eaf6];
    for (let i = 0; i < 8; i++) {
      this.ambient.push(this.add.circle(Phaser.Math.Between(0, W), Phaser.Math.Between(230, 630), 1, Phaser.Utils.Array.GetRandom(colors), Phaser.Math.FloatBetween(0.03, 0.05)).setDepth(2));
    }
  }

  updateAmbient(time, delta) {
    if (!this.ambient) return;
    const step = 0.008 * (delta / 16.7);
    this.ambient.forEach((p, i) => {
      p.y += step * (i % 2 === 0 ? 1 : -0.6);
      p.x += Math.sin(time * 0.0003 + i) * 0.02;
      if (p.y > 630) p.y = 230; if (p.y < 230) p.y = 630;
      if (p.x > W) p.x = 0; if (p.x < 0) p.x = W;
    });
  }

  screenShake(intensity = 0.004, duration = 150) {
    this.cameras.main.shake(duration, intensity);
  }

  createFloatingText(x, y, text, colorHex, font = "bold 15px Arial", hold = 1200) {
    const t = this.add.text(x, y, text, { font, color: colorHex, wordWrap: { width: 300 }, align: "center" }).setOrigin(0.5).setDepth(75).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 160 });
    this.time.delayedCall(hold, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 220, onComplete: () => t.destroy() }); });
    return t;
  }

  createAnnotation(x, y, text, colorHex) {
    const t = this.add.text(x, y, text, { font: "italic 12px Arial", color: colorHex, wordWrap: { width: 260 }, align: "center" }).setOrigin(0.5).setDepth(70).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 200 });
    return t;
  }

  createConfetti(x, y, count = 30) {
    const p = this.add.particles(x, y, "l57_dot", {
      speed: { min: 80, max: 240 }, angle: { min: 0, max: 360 }, scale: { start: 0.9, end: 0 }, lifespan: 500,
      tint: [C_BRASS, C_GOLD, C_RED, C_CYAN, 0xffffff], emitting: false,
    }).setDepth(95);
    p.explode(count);
    this.time.delayedCall(900, () => p.destroy());
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
    this.tabFilename = this.add.text(CX + CW - 12, CY + TAB_H / 2, "Calc1.java", { font: "13px Courier New", color: "#546e7a" }).setOrigin(1, 0.5).setDepth(11);

    this.lineHighlight = this.add.rectangle(CX + CW / 2, 0, CW - 4, LINE_H, 0xffab00, 0.06).setDepth(19).setVisible(false);
    this.codeContainer = this.add.container(0, 0).setDepth(20);
  }

  _syntaxTokens(line) {
    const tokens = [];
    const re = /("(?:[^"\\]|\\.)*")|(\/\*.*\*\/)|(\bimport\b|\bfor\b|\bint\b|\bnew\b|\bScanner\b|\bArrayList\b)|(<\w*>)|(\bMath\b)|(\.max\b|\.min\b|\.get\b|\.size\b|\.nextInt\b|\.nextLine\b)|(\bSystem\.out\b|\bSystem\.in\b)|(-?\d+\.\d+|-?\d+)|(>=|<=|==|!=|\+\+|--|[+\-*/><])|([(){}\[\];.,=])/g;
    let last = 0, m;
    const plain = (t) => t && tokens.push({ t, c: "#e0e0e0" });
    while ((m = re.exec(line))) {
      if (m.index > last) plain(line.slice(last, m.index));
      if (m[1]) tokens.push({ t: m[1], c: "#4caf50" });
      else if (m[2]) tokens.push({ t: m[2], c: "#546e7a" });
      else if (m[3]) tokens.push({ t: m[3], c: HEX_CYAN });
      else if (m[4]) tokens.push({ t: m[4], c: "#6a1b9a" });
      else if (m[5]) tokens.push({ t: m[5], c: HEX_GOLD });
      else if (m[6]) tokens.push({ t: m[6], c: "#ff8a65" });
      else if (m[7]) tokens.push({ t: m[7], c: "#78909c" });
      else if (m[8]) tokens.push({ t: m[8], c: HEX_ORANGE });
      else if (m[9]) tokens.push({ t: m[9], c: "#78909c" });
      else if (m[10]) tokens.push({ t: m[10], c: "#78909c" });
      last = m.index + m[0].length;
    }
    if (last < line.length) plain(line.slice(last));
    return tokens.length ? tokens : [{ t: line, c: "#e0e0e0" }];
  }

  _isDimmedInfrastructure(rawLine) {
    return /^Scanner sc = new Scanner/.test(rawLine)
      || /^ArrayList<\w+>\s+\w+\s*=\s*\/\*.*\*\/;$/.test(rawLine)
      || /^(int|double)\s+\w+\s*=\s*\/\*\s*test value\s*\*\/;$/.test(rawLine);
  }

  renderSkeleton(mission) {
    this.codeContainer.removeAll(true);
    this.slotDefs = {};
    mission.slots.forEach((s) => { this.slotDefs[s.id] = { ...s, capacity: 1, rect: null }; });

    mission.skeleton.forEach((rawLine, i) => {
      const y = CODE_Y0 + i * LINE_H;
      const numT = this.add.text(CX + 8, y, String(i + 1), { font: "13px Courier New", color: "#3d4450" });
      this.codeContainer.add(numT);

      if (!rawLine.trim()) return;

      if (this._isDimmedInfrastructure(rawLine)) {
        const t = this.add.text(CODE_X, y, rawLine, { font: "14px Courier New", color: "#3d4450" }).setAlpha(0.6);
        this.codeContainer.add(t);
        return;
      }

      const parts = rawLine.split(/<slot:(\w+)>/);
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
          const w = 220;
          def.rect = { x, y: y - 2, w, h: 17 };
          this._drawSlotPlaceholder(slotId);
          x += w + 6;
        }
      });
    });
  }

  _dashedRectOutline(g, x, y, w, h, radius, dash) {
    g.beginPath();
    const perimeter = 2 * (w + h);
    let drawn = 0, on = true;
    const pts = [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]];
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
      const segLen = Phaser.Math.Distance.Between(x0, y0, x1, y1);
      let t = 0;
      while (t < segLen) {
        const seg = Math.min(dash, segLen - t);
        const sx = x0 + ((x1 - x0) * t) / segLen, sy = y0 + ((y1 - y0) * t) / segLen;
        const ex = x0 + ((x1 - x0) * (t + seg)) / segLen, ey = y0 + ((y1 - y0) * (t + seg)) / segLen;
        if (on) g.lineBetween(sx, sy, ex, ey);
        on = !on;
        t += dash;
      }
    }
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
  // BLOCK PALETTE + DRAG
  // ══════════════════════════════════════════════════════════════

  createBlockPalette() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0f0a06, 1);
    g.fillRoundedRect(PX, PY, PW, PH, 10);
    g.lineStyle(1, 0x3a2618, 1);
    g.strokeRoundedRect(PX, PY, PW, PH, 10);
    this.add.text(PX + 10, PY + 8, "CALCULATOR'S PARTS", { font: "bold 11px Arial", color: "#3d4450" }).setDepth(11);
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
      const style = { font: "bold 13px Courier New", color: HEX_CYAN };
      const label = def.label || def.code.replace(/\n\s*/g, "  ");
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
        bg.fillStyle(0x241a10, 1);
        bg.fillRoundedRect(-w / 2, -13, w, 26, 6);
        bg.lineStyle(2, stroke, 1);
        bg.strokeRoundedRect(-w / 2, -13, w, 26, 6);
      };
      draw(C_BRASS);
      const txt = this.add.text(0, 0, label, style).setOrigin(0.5);
      c.add([bg, txt]);
      c.setSize(w, 26);
      c.setData("w", w);
      c.setData("code", def.code);
      c.setData("tag", def.tag || null);
      c.setData("slotId", def.slotId || null);
      c.setData("clampShape", def.clampShape || null);
      c.setData("home", home);
      c.setData("draw", draw);
      c.setData("placedIn", null);
      c.setInteractive({ useHandCursor: true, draggable: true });
      c.on("pointerover", () => { if (!this.inputLocked) draw(0xffab00); });
      c.on("pointerout", () => { if (!this.inputLocked) draw(C_BRASS); });
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

  _nearestOpenSlot(x, y, forObj) {
    let best = null, bestDist = 60;
    const wantSlotId = forObj ? forObj.getData("slotId") : null;
    for (const id in this.slotDefs) {
      const def = this.slotDefs[id];
      if (!def || !def.rect) continue;
      if (wantSlotId && id !== wantSlotId) continue;
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
    const key = this._nearestOpenSlot(obj.x, obj.y, obj);
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
    const key = this._nearestOpenSlot(obj.x, obj.y, obj);
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
        this.attemptLog.push({ mission: this.currentMission + 1, selfCorrected: true, code: obj.getData("code"), misconceptionTag: obj.getData("tag"), timestamp: Date.now() });
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
      out[id] = (this.slotContents[id] || []).map((b) => ({ code: b.container.getData("code"), tag: b.container.getData("tag"), clampShape: b.container.getData("clampShape") }));
    }
    return out;
  }

  _slotCode(slotId) {
    const placed = this.slotContents[slotId] && this.slotContents[slotId][0];
    return placed ? placed.container.getData("code") : "";
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
    const t = this.add.text(0, 0, "▶ RUN", { font: "bold 19px Arial", color: "#0a0d08" }).setOrigin(0.5);
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
  // RIG WINDOW
  // ══════════════════════════════════════════════════════════════

  createRigWindow() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x04060c, 1);
    g.fillRoundedRect(OX, OY, OW, OH, 12);
    g.lineStyle(3, C_BRASS, 1);
    g.strokeRoundedRect(OX, OY, OW, OH, 12);
    this.add.text(OX + 10, OY + 6, "CALCULATION RIG — LIVE", { font: "bold 11px Georgia", color: HEX_BRASS }).setAlpha(0.7).setDepth(11);

    const maskShape = this.make.graphics({ x: 0, y: 0, add: false });
    maskShape.fillRoundedRect(OX + 4, OY + 20, OW - 8, OH - 24, 10);
    this.windowMask = maskShape.createGeometryMask();
    this.rigLayer = this.add.container(0, 0).setDepth(15);
    this.rigLayer.setMask(this.windowMask);

    this.verdictLamp = this.add.circle(OX + OW - 18, OY + 14, 6, C_GRAY).setDepth(20);
  }

  // ══════════════════════════════════════════════════════════════
  // MINI COMPARATOR (50%-scale Great Comparator, L55/L56 lineage)
  // ══════════════════════════════════════════════════════════════

  createMiniComparator() {
    const g = this.add.graphics().setDepth(4);
    g.fillStyle(0x1a1408, 1);
    g.lineStyle(1.5, C_BRASS, 1);
    g.fillRoundedRect(MC_BEAM_CX - 62, MC_BEAM_Y - 5, 124, 10, 4);
    g.strokeRoundedRect(MC_BEAM_CX - 62, MC_BEAM_Y - 5, 124, 10, 4);
    this.rigLayer.add(g);

    const npBg = this.add.graphics();
    npBg.fillStyle(0x060810, 1);
    npBg.lineStyle(1.5, C_GOLD, 1);
    npBg.fillRoundedRect(MC_BEAM_CX - 30, MC_BEAM_Y - 24, 60, 16, 3);
    npBg.strokeRoundedRect(MC_BEAM_CX - 30, MC_BEAM_Y - 24, 60, 16, 3);
    const npT = this.add.text(MC_BEAM_CX, MC_BEAM_Y - 16, "Math", { font: "bold 11px Courier New", color: HEX_GOLD }).setOrigin(0.5);
    this.rigLayer.add([npBg, npT]);

    const modeBg = this.add.graphics();
    modeBg.fillStyle(0x0a0d18, 1);
    modeBg.lineStyle(1, C_CYAN, 0.7);
    modeBg.fillRoundedRect(MC_BEAM_CX - 19, MC_BEAM_Y + 4, 38, 11, 2);
    modeBg.strokeRoundedRect(MC_BEAM_CX - 19, MC_BEAM_Y + 4, 38, 11, 2);
    this.mcModeText = this.add.text(MC_BEAM_CX, MC_BEAM_Y + 9, ".max", { font: "bold 10px Courier New", color: HEX_CYAN }).setOrigin(0.5);
    this.rigLayer.add([modeBg, this.mcModeText]);

    [MC_CRADLE_A, MC_CRADLE_B].forEach((c) => {
      g.lineStyle(1, C_BRASS, 0.5);
      g.lineBetween(c.x, MC_BEAM_Y + 5, c.x, c.y - 10);
    });

    this.mcCradleGfx = { a: this.add.graphics(), b: this.add.graphics() };
    [["a", MC_CRADLE_A], ["b", MC_CRADLE_B]].forEach(([key, pos]) => {
      const cg = this.mcCradleGfx[key];
      cg.fillStyle(0x141a2c, 1);
      cg.lineStyle(1.5, C_BRASS, 1);
      cg.fillEllipse(pos.x, pos.y, 42, 16);
      cg.strokeEllipse(pos.x, pos.y, 42, 16);
      this.rigLayer.add(cg);
    });

    this.mcNeedle = this.add.container(MC_BEAM_CX, MC_BEAM_Y + 5);
    const ng = this.add.graphics();
    ng.fillStyle(0x1a1408, 1);
    ng.lineStyle(1, C_BRASS, 1);
    ng.fillTriangle(-2, 0, 2, 0, 0, 20);
    ng.fillStyle(C_BRASS, 1);
    ng.fillCircle(0, 0, 2);
    this.mcNeedle.add(ng);
    this.rigLayer.add(this.mcNeedle);

    const chute = this.add.graphics();
    chute.lineStyle(1.5, C_BRASS, 0.6);
    chute.beginPath();
    chute.moveTo(MC_BEAM_CX - 4, MC_BEAM_Y + 5);
    chute.lineTo(MC_BEAM_CX - 4, MC_PLINTH.y - 10);
    chute.lineTo(MC_PLINTH.x, MC_PLINTH.y - 10);
    chute.strokePath();
    const plinthG = this.add.graphics();
    plinthG.fillStyle(0x0a0d18, 1);
    plinthG.lineStyle(1.5, C_BRASS, 1);
    plinthG.fillCircle(MC_PLINTH.x, MC_PLINTH.y, 11);
    plinthG.strokeCircle(MC_PLINTH.x, MC_PLINTH.y, 11);
    this.rigLayer.add([chute, plinthG]);

    this.mcStarLayer = this.add.container(0, 0);
    this.rigLayer.add(this.mcStarLayer);
    this._mcCurrentMode = null;
  }

  mcSetModePlate(method) {
    if (this._mcCurrentMode === method) return;
    this._mcCurrentMode = method;
    this.tweens.add({
      targets: this.mcModeText, scaleY: 0, duration: 70,
      onComplete: () => { this.mcModeText.setText(`.${method}`); this.tweens.add({ targets: this.mcModeText, scaleY: 1, duration: 70 }); },
    });
  }

  _mcTypeColorInt(type) { return type === "double" ? C_ORANGE : C_GOLD; }
  _mcTypeColorHex(type) { return type === "double" ? HEX_ORANGE : HEX_GOLD; }

  _mcMakeStar(value, type, x, y) {
    const c = this.add.container(x, y);
    const g = this.add.graphics();
    const color = this._mcTypeColorInt(type);
    g.fillStyle(color, 0.9);
    g.lineStyle(1, Phaser.Display.Color.IntegerToColor(color).darken(30).color, 1);
    const pts = [];
    for (let i = 0; i < 8; i++) { const r = i % 2 === 0 ? 10 : 4.5; const a = (Math.PI / 4) * i - Math.PI / 2; pts.push(Math.cos(a) * r, Math.sin(a) * r); }
    g.fillPoints(pts, true);
    g.strokePoints(pts, true);
    const display = type === "double" ? Number(value).toFixed(1) : String(value);
    const txt = this.add.text(0, 0, display, { font: "bold 10px Courier New", color: "#060810" }).setOrigin(0.5);
    if (txt.width > 20) txt.setFontSize(6);
    c.add([g, txt]);
    return { container: c, gfx: g, text: txt, value, type };
  }

  async mcSpawnStar(value, type, cradleKey) {
    const pos = cradleKey === "a" ? MC_CRADLE_A : MC_CRADLE_B;
    const star = this._mcMakeStar(value, type, pos.x, pos.y);
    star.container.setAlpha(0).setScale(0);
    this.mcStarLayer.add(star.container);
    await new Promise((res) => { this.tweens.add({ targets: star.container, alpha: 1, scale: 1.1, duration: 100, ease: "Back.easeOut", onComplete: () => { this.tweens.add({ targets: star.container, scale: 1, duration: 70 }); res(); } }); });
    if (cradleKey === "a") this._mcStarsA = star; else this._mcStarsB = star;
    return star;
  }

  mcResetCradles() {
    if (this._mcStarsA) { this._mcStarsA.container.destroy(); this._mcStarsA = null; }
    if (this._mcStarsB) { this._mcStarsB.container.destroy(); this._mcStarsB = null; }
    if (this._mcPlinthStar) { this._mcPlinthStar.container.destroy(); this._mcPlinthStar = null; }
  }

  async mcCarryStar(starObj, cradleKey) {
    const pos = cradleKey === "a" ? MC_CRADLE_A : MC_CRADLE_B;
    await new Promise((res) => { this.tweens.add({ targets: starObj.container, x: pos.x, y: pos.y - 14, duration: 130, ease: "Sine.easeInOut", onComplete: res }); });
    await new Promise((res) => { this.tweens.add({ targets: starObj.container, y: pos.y, duration: 80, ease: "Sine.easeOut", onComplete: res }); });
    if (cradleKey === "a") this._mcStarsA = starObj; else this._mcStarsB = starObj;
  }

  _mcWarmStarToDouble(star) {
    star.type = "double";
    star.gfx.clear();
    star.gfx.fillStyle(C_ORANGE, 0.9);
    star.gfx.lineStyle(1, Phaser.Display.Color.IntegerToColor(C_ORANGE).darken(30).color, 1);
    const pts = [];
    for (let i = 0; i < 8; i++) { const r = i % 2 === 0 ? 10 : 4.5; const a = (Math.PI / 4) * i - Math.PI / 2; pts.push(Math.cos(a) * r, Math.sin(a) * r); }
    star.gfx.fillPoints(pts, true);
    star.gfx.strokePoints(pts, true);
    star.text.setText(Number(star.value).toFixed(1));
  }

  async mcNeedleOscillate() {
    const angles = [-24, 20, -14];
    for (const a of angles) {
      await new Promise((res) => { this.tweens.add({ targets: this.mcNeedle, angle: a, duration: 65, ease: "Sine.easeInOut", onComplete: res }); });
    }
  }

  async mcNeedleLock(side) {
    const angle = side === "a" ? -30 : 30;
    await new Promise((res) => { this.tweens.add({ targets: this.mcNeedle, angle, duration: 70, ease: "Back.easeOut", onComplete: res }); });
    const chime = this.add.circle(MC_BEAM_CX, MC_BEAM_Y + 5, 3, C_GOLD, 0.5);
    this.rigLayer.add(chime);
    this.tweens.add({ targets: chime, scale: 3, alpha: 0, duration: 200, onComplete: () => chime.destroy() });
  }

  mcResetNeedle() {
    this._mcNeedleBusy = false;
    this.mcNeedle.setAngle(0);
  }

  updateNeedleIdle(time) {
    if (!this.mcNeedle || this._mcNeedleBusy) return;
    this.mcNeedle.setAngle(Math.sin(time * 0.0015) * 1);
  }

  async mcDescendReturnStar(value, type, sourceStar) {
    if (this._mcPlinthStar) { this._mcPlinthStar.container.destroy(); this._mcPlinthStar = null; }
    const from = sourceStar ? { x: sourceStar.container.x, y: sourceStar.container.y } : { x: MC_BEAM_CX, y: MC_BEAM_Y };
    const copy = this._mcMakeStar(value, type, from.x, from.y - 6);
    copy.container.setScale(0.6);
    this.mcStarLayer.add(copy.container);
    await new Promise((res) => { this.tweens.add({ targets: copy.container, x: MC_BEAM_CX - 4, y: MC_PLINTH.y - 10, duration: 120, ease: "Sine.easeIn", onComplete: res }); });
    if (!this._alive) return;
    await new Promise((res) => { this.tweens.add({ targets: copy.container, x: MC_PLINTH.x, y: MC_PLINTH.y, duration: 120, ease: "Sine.easeIn", onComplete: res }); });
    this._mcPlinthStar = copy;
  }

  async mcDiscardFade() {
    if (!this._mcPlinthStar) return;
    const star = this._mcPlinthStar;
    this._mcPlinthStar = null;
    await this.delay(250);
    await new Promise((res) => { this.tweens.add({ targets: star.container, alpha: 0, scale: 0.6, duration: 220, onComplete: () => { star.container.destroy(); res(); } }); });
  }

  async mcInstanceCallShudder(value, type) {
    const star = await this.mcSpawnStar(value, type, "a");
    await this.delay(100);
    this.tweens.add({ targets: star.container, x: star.container.x + 2, duration: 30, yoyo: true, repeat: 5 });
    const q = this.add.text(star.container.x, star.container.y - 18, "?", { font: "bold 14px Georgia", color: HEX_RED }).setOrigin(0.5);
    this.rigLayer.add(q);
    this.missionElements.push(q);
    this.tweens.add({ targets: q, alpha: 0.2, duration: 80, yoyo: true, repeat: 3 });
    await this.delay(350);
  }

  showCompileErrorStamp() {
    const stamp = this.add.text(CX + CW / 2, CY + CH / 2, "COMPILE ERROR", { font: "bold 26px Arial", color: HEX_RED }).setOrigin(0.5).setDepth(80).setScale(1.7).setAngle(-8).setAlpha(0);
    this.missionElements.push(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 200, ease: "Cubic.easeOut" });
    this.screenShake(0.005, 170);
    this.time.delayedCall(1100, () => { if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 220, onComplete: () => stamp.destroy() }); });
  }

  // ══════════════════════════════════════════════════════════════
  // NUMBER-LINE RAIL (L56 lineage + clamp-range bracket)
  // ══════════════════════════════════════════════════════════════

  createMiniNumberRail() {
    this.railGfx = this.add.graphics();
    this.railLabels = this.add.container(0, 0);
    this.railMarkers = this.add.container(0, 0);
    this.rigLayer.add([this.railGfx, this.railLabels, this.railMarkers]);
    this.railGfx.lineStyle(1.5, C_BRASS, 0.6);
    this.railGfx.lineBetween(RAIL_X0, RAIL_Y, RAIL_X1, RAIL_Y);
  }

  _niceStep(raw) {
    const pow = Math.pow(10, Math.floor(Math.log10(Math.max(raw, 0.0001))));
    const n = raw / pow;
    const step = n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10;
    return step * pow;
  }

  clearRail() {
    this.railMarkers.removeAll(true);
    this.railLabels.removeAll(true);
    this.railGfx.clear();
    this.railGfx.lineStyle(1.5, C_BRASS, 0.6);
    this.railGfx.lineBetween(RAIL_X0, RAIL_Y, RAIL_X1, RAIL_Y);
    this._railEntries = null;
  }

  async placeOnRail(entries, bracket) {
    this.clearRail();
    const vals = entries.map((e) => Number(e.value));
    if (bracket) { vals.push(bracket[0], bracket[1]); }
    let lo = Math.min(...vals, 0), hi = Math.max(...vals, 0);
    const pad = Math.max(1, hi - lo) * 0.15;
    lo -= pad; hi += pad;
    const toX = (v) => RAIL_X0 + ((v - lo) / (hi - lo)) * (RAIL_X1 - RAIL_X0);
    this._railToX = toX;

    if (bracket) {
      const bx0 = toX(bracket[0]), bx1 = toX(bracket[1]);
      this.railGfx.lineStyle(2, C_CYAN, 0.5);
      this.railGfx.lineBetween(bx0, RAIL_Y - 9, bx0, RAIL_Y + 9);
      this.railGfx.lineBetween(bx1, RAIL_Y - 9, bx1, RAIL_Y + 9);
      this.railGfx.lineBetween(bx0, RAIL_Y - 9, bx1, RAIL_Y - 9);
    }

    const span = hi - lo;
    const tickStep = this._niceStep(span / 5);
    for (let v = Math.ceil(lo / tickStep) * tickStep; v <= hi; v += tickStep) {
      const x = toX(v);
      const isZero = Math.abs(v) < 1e-9;
      this.railGfx.lineStyle(isZero ? 1.5 : 1, C_BRASS, isZero ? 0.8 : 0.35);
      this.railGfx.lineBetween(x, RAIL_Y - (isZero ? 6 : 4), x, RAIL_Y + (isZero ? 6 : 4));
    }

    for (const e of entries) {
      const x = toX(Number(e.value));
      const m = this.add.container(x, RAIL_Y - 26).setAlpha(0);
      const dot = this.add.circle(0, 0, 3, e.type === "double" ? C_ORANGE : C_GOLD, 1);
      const lbl = this.add.text(0, -9, e.type === "double" ? Number(e.value).toFixed(1) : String(e.value), { font: "bold 9px Courier New", color: e.type === "double" ? HEX_ORANGE : HEX_GOLD }).setOrigin(0.5);
      m.add([dot, lbl]);
      this.railMarkers.add(m);
      await new Promise((res) => { this.tweens.add({ targets: m, y: RAIL_Y, alpha: 1, duration: 130, ease: "Bounce.easeOut", onComplete: res }); });
      e._railMarker = m;
    }
    this._railEntries = entries;
  }

  async railSweep(method, winSide, pinned) {
    const entries = this._railEntries;
    if (!entries) return;
    const winner = winSide === "a" ? entries[0] : entries[1];
    if (!winner || !winner._railMarker) return;
    const color = method === "max" ? C_GOLD : C_CYAN;
    const fromX = method === "max" ? RAIL_X0 : RAIL_X1;
    const toX = winner._railMarker.x;
    const sweepLine = this.add.rectangle(fromX, RAIL_Y, 3, 9, color, 0.7);
    this.railMarkers.add(sweepLine);
    await new Promise((res) => { this.tweens.add({ targets: sweepLine, x: toX, duration: 220, ease: "Cubic.easeOut", onComplete: res }); });
    sweepLine.destroy();
    this.tweens.add({ targets: winner._railMarker, scale: 1.5, duration: 120, yoyo: true });
    const glow = this.add.circle(winner._railMarker.x, RAIL_Y, 7, color, 0.3);
    this.railMarkers.add(glow);
    this.tweens.add({ targets: glow, alpha: 0, scale: 2, duration: 300, onComplete: () => glow.destroy() });
  }

  // ══════════════════════════════════════════════════════════════
  // MINI TYPED CONTAINERS
  // ══════════════════════════════════════════════════════════════

  createMiniContainers() {
    const hdr = this.add.text(CONT_X, CONT_Y0 - 14, "VARIABLES", { font: "bold 9px Georgia", color: HEX_BRASS }).setAlpha(0.7);
    this.containerLayer = this.add.container(0, 0);
    this.rigLayer.add([hdr, this.containerLayer]);
    this.containerObjs = {};
    this._containerOrder = [];
  }

  miniDispenseTo(name, value, type) {
    if (!this.containerObjs[name]) {
      const idx = this._containerOrder.length;
      const y = CONT_Y0 + idx * 16;
      const g = this.add.graphics();
      g.fillStyle(0x0a1520, 1);
      g.lineStyle(1, C_CYAN, 0.6);
      g.fillRoundedRect(CONT_X, y, 118, 13, 3);
      g.strokeRoundedRect(CONT_X, y, 118, 13, 3);
      const t = this.add.text(CONT_X + 5, y + 6.5, "", { font: "bold 9px Courier New", color: HEX_CYAN }).setOrigin(0, 0.5);
      this.containerLayer.add([g, t]);
      this.containerObjs[name] = t;
      this._containerOrder.push(name);
    }
    const display = type === "double" ? Number(value).toFixed(1) : String(value);
    this.containerObjs[name].setText(`${name} = ${display}`);
    this.tweens.add({ targets: this.containerObjs[name], scale: 1.15, duration: 80, yoyo: true });
  }

  clearContainers() {
    this.containerLayer.removeAll(true);
    this.containerObjs = {};
    this._containerOrder = [];
  }

  // ══════════════════════════════════════════════════════════════
  // SURVEY TRACKER (L50/L53 lineage, Mission 6)
  // ══════════════════════════════════════════════════════════════

  createMiniSurveyTracker() {
    const hdr = this.add.text(TRK_X, TRK_Y0 - 14, "SURVEY TRACKER", { font: "bold 9px Georgia", color: HEX_BRASS }).setAlpha(0.7);
    this.trackerContainer = this.add.container(0, 0);
    this.rigLayer.add([hdr, this.trackerContainer]);
    this._trackerRows = [];
    this._trackerDash = this.add.text(TRK_X + TRK_W / 2, TRK_Y0 + 60, "—", { font: "bold 13px Courier New", color: "#3a2618" }).setOrigin(0.5);
    this.rigLayer.add(this._trackerDash);
  }

  appendTrackerRow(text, isCrash, bold) {
    if (this._trackerDash && this._trackerDash.active) { this._trackerDash.destroy(); this._trackerDash = null; }
    const maxRows = 6;
    if (this._trackerRows.length >= maxRows) {
      const removed = this._trackerRows.shift();
      removed.destroy();
      this._trackerRows.forEach((r) => { r.y -= 15; });
    }
    const y = TRK_Y0 + this._trackerRows.length * 15;
    const t = this.add.text(TRK_X, y, text, { font: "9px Courier New", color: isCrash ? HEX_RED : (bold ? HEX_GOLD : "#e8dfc8") }).setAlpha(0);
    if (t.width > TRK_W - 4) t.setFontSize(6);
    this.trackerContainer.add(t);
    this._trackerRows.push(t);
    this.tweens.add({ targets: t, alpha: 1, duration: 90 });
  }

  clearTracker() {
    this.trackerContainer.removeAll(true);
    this._trackerRows = [];
    if (!this._trackerDash) { this._trackerDash = this.add.text(TRK_X + TRK_W / 2, TRK_Y0 + 60, "—", { font: "bold 13px Courier New", color: "#3a2618" }).setOrigin(0.5); this.rigLayer.add(this._trackerDash); }
  }

  // ══════════════════════════════════════════════════════════════
  // OUTPUT TICKER
  // ══════════════════════════════════════════════════════════════

  createMiniOutputTicker() {
    const tg = this.add.graphics();
    tg.fillStyle(0x050914, 0.9);
    tg.fillRect(OX + 8, TICKER_Y - 8, OW - 16, 16);
    this.tickerText = this.add.text(OX + 14, TICKER_Y, "", { font: "bold 11px Courier New", color: HEX_GREEN_BRIGHT }).setOrigin(0, 0.5);
    this.rigLayer.add([tg, this.tickerText]);
    this._tickerLines = [];
  }

  async printToTicker(text) {
    this._tickerLines.push(text);
    const joined = this._tickerLines.join(" ⏎ ");
    for (let i = this.tickerText.text.length; i <= joined.length; i++) {
      if (!this._alive) return;
      this.tickerText.setText(joined.slice(0, i));
      if (this.tickerText.width > OW - 30) this.tickerText.setFontSize(7);
      await this.delay(6);
    }
  }

  clearTicker() {
    this._tickerLines = [];
    if (this.tickerText) this.tickerText.setText("").setFontSize(9);
  }

  // ══════════════════════════════════════════════════════════════
  // CROSS-WING CAMEOS — Scanner tape (M5) + mini bookshelf (M6)
  // ══════════════════════════════════════════════════════════════

  createMiniCrossWingCameos() {
    this.tapeContainer = this.add.container(0, 0).setVisible(false);
    this.rigLayer.add(this.tapeContainer);
    this.tapeState = [];

    this.shelfContainer = this.add.container(0, 0).setVisible(false);
    this.rigLayer.add(this.shelfContainer);
    this.shelfBookSprites = [];
    this.shelfIndexLabels = [];
  }

  activateCameo(kind) {
    if (kind === "tape") this.tapeContainer.setVisible(true);
    if (kind === "shelf") this.shelfContainer.setVisible(true);
  }

  parkCameos() {
    this.tapeContainer.setVisible(false);
    this.tapeContainer.removeAll(true);
    this.tapeState = [];
    this.shelfContainer.setVisible(false);
    this.shelfContainer.removeAll(true);
    this.shelfBookSprites = [];
  }

  _classifyChar(ch) {
    if (ch === " ") return "space";
    if (ch === "\n") return "newline";
    return "alpha";
  }

  loadMiniTape(inputLines) {
    const cells = [];
    (inputLines || []).forEach((line) => {
      line.split("").forEach((ch) => cells.push({ ch, kind: this._classifyChar(ch) }));
      cells.push({ ch: "\n", kind: "newline" });
    });
    this.tapeState = cells;
    this.renderMiniTape();
  }

  renderMiniTape() {
    this.tapeContainer.removeAll(true);
    if (this.tapeState.length === 0) return;
    const cellW = 7, x1 = OX + OW - 10;
    const totalW = Math.min(this.tapeState.length * cellW, 170);
    const startX = x1 - totalW;
    const bg = this.add.graphics();
    bg.fillStyle(0xe8f0e8, 0.85);
    bg.fillRoundedRect(startX - 3, TAPE_Y - 7, totalW + 6, 14, 3);
    this.tapeContainer.add(bg);
    this.tapeState.slice(-Math.floor(totalW / cellW)).forEach((cell, i) => {
      const x = startX + i * cellW + cellW / 2;
      const disp = cell.kind === "space" ? "␣" : cell.kind === "newline" ? "⏎" : cell.ch;
      const color = cell.kind === "space" ? "#c2185b" : cell.kind === "newline" ? "#7b1fa2" : "#2e7d32";
      const t = this.add.text(x, TAPE_Y, disp, { font: "bold 8px Courier New", color }).setOrigin(0.5);
      this.tapeContainer.add(t);
    });
  }

  evaluateNextToken(cells) {
    let j = 0;
    while (j < cells.length && (cells[j].kind === "space" || cells[j].kind === "newline")) j++;
    const tokenStart = j;
    while (j < cells.length && cells[j].kind !== "space" && cells[j].kind !== "newline") j++;
    const strValue = cells.slice(tokenStart, j).map((c) => c.ch).join("");
    return { rawValue: strValue, consumedCount: j };
  }

  async tapeConsumeVisual(count) {
    this.tapeState = this.tapeState.slice(count);
    this.renderMiniTape();
    await this.delay(60);
  }

  // ── mini bookshelf (read-only ghost retrievals, Mission 6) ──

  populateMiniShelf(initialList) {
    this.shelfContainer.removeAll(true);
    this.shelfBookSprites = [];
    this.currentList = initialList.map((v) => ({ value: v, type: "int" }));
    const hdr = this.add.text(CONT_X, SHELF_Y - 14, "readings", { font: "bold 9px Georgia", color: HEX_BRASS }).setAlpha(0.7);
    this.shelfContainer.add(hdr);
    this.currentList.forEach((entry, i) => {
      const x = CONT_X + 8 + i * 28;
      const c = this.add.container(x, SHELF_Y);
      const g = this.add.graphics();
      g.fillStyle(C_GOLD, 0.85);
      g.lineStyle(1, 0xb8860b, 1);
      g.fillRoundedRect(-12, -9, 24, 18, 2);
      g.strokeRoundedRect(-12, -9, 24, 18, 2);
      const t = this.add.text(0, -1, String(entry.value), { font: "bold 9px Courier New", color: "#0a0704" }).setOrigin(0.5);
      if (t.width > 20) t.setFontSize(5.5);
      const lbl = this.add.text(0, 12, `[${i}]`, { font: "bold 8px Courier New", color: HEX_GRAY }).setOrigin(0.5);
      c.add([g, t, lbl]);
      this.shelfContainer.add(c);
      this.shelfBookSprites.push({ container: c, entry });
    });
  }

  async retrieveGhost(index) {
    const entry = this.currentList[index];
    if (!entry) return null;
    const book = this.shelfBookSprites[index];
    if (book) this.tweens.add({ targets: book.container, scale: 1.25, duration: 90, yoyo: true });
    const ghostX = book ? book.container.x : SHELF_X;
    const ghost = this.add.container(ghostX, SHELF_Y).setAlpha(0);
    const g = this.add.graphics();
    g.fillStyle(C_GOLD, 0.5);
    g.fillRoundedRect(-11, -8, 22, 16, 2);
    const t = this.add.text(0, 0, String(entry.value), { font: "bold 9px Courier New", color: "#0a0704" }).setOrigin(0.5);
    ghost.add([g, t]);
    this.shelfContainer.add(ghost);
    await new Promise((res) => { this.tweens.add({ targets: ghost, alpha: 0.8, y: SHELF_Y - 10, duration: 100, onComplete: res }); });
    await new Promise((res) => { this.tweens.add({ targets: ghost, x: MC_CRADLE_B.x, y: MC_CRADLE_B.y - 20, alpha: 0, duration: 160, ease: "Sine.easeIn", onComplete: () => { ghost.destroy(); res(); } }); });
    return entry;
  }

  // ══════════════════════════════════════════════════════════════
  // MANIFEST STRIP / TEST REPORT / MISSION BRIEF
  // ══════════════════════════════════════════════════════════════

  createManifestStrip() {
    const g = this.add.graphics().setDepth(16);
    g.fillStyle(0x0f0a06, 0.92);
    g.fillRect(OX, MANIFEST_Y - 2, OW, 20);
    this.manifestStripText = this.add.text(OX + 8, MANIFEST_Y + 8, "", { font: "12px Arial", color: HEX_BRASS }).setOrigin(0, 0.5).setDepth(17);
  }
  updateManifestStrip(text) { this.manifestStripText.setText(text); }

  createTestReportPanel() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0f0a06, 1);
    g.fillRoundedRect(RX, RY, RW, RH, 10);
    g.lineStyle(1, 0x3a2618, 1);
    g.strokeRoundedRect(RX, RY, RW, RH, 10);
    this.add.text(RX + 10, RY + 6, "TEST REPORT", { font: "bold 11px Arial", color: "#3d4450" }).setDepth(11);
    this.reportRows = [];
  }

  _compactTestLabel(test) {
    if (test.initialList) return `[${test.initialList.join(",")}]`.slice(0, 26);
    if (test.input) return `in: ${test.input.join(",")}`;
    const subs = test.substitutions || {};
    return Object.entries(subs).map(([k, v]) => `${k}=${v}`).join(" ").slice(0, 26);
  }

  buildReportRows(mission) {
    this.reportRows.forEach((r) => r.container.destroy());
    this.reportRows = [];
    mission.tests.forEach((test, i) => {
      const y = RY + 24 + i * 24;
      const c = this.add.container(RX + 10, y).setDepth(11).setAlpha(0.35);
      const inputT = this.add.text(0, 0, this._compactTestLabel(test), { font: "11px Courier New", color: "#b0bec5" }).setOrigin(0, 0.5);
      const expT = this.add.text(190, 0, test.expectedOutput.slice(0, 22), { font: "11px Courier New", color: "#78909c" }).setOrigin(0, 0.5);
      const statusT = this.add.text(RW - 24, 0, "…", { font: "15px Arial", color: "#78909c" }).setOrigin(0.5);
      c.add([inputT, expT, statusT]);
      this.reportRows.push({ container: c, statusT });
    });
  }

  updateReportRow(index, pass) {
    const row = this.reportRows[index];
    if (!row) return;
    row.container.setAlpha(1);
    row.statusT.setText(pass ? "✓" : "✗").setColor(pass ? HEX_GREEN_BRIGHT : HEX_RED);
    if (!pass) this.tweens.add({ targets: row.container, x: row.container.x + 3, duration: 35, yoyo: true, repeat: 5 });
  }

  createMissionBriefPanel() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x1a0e05, 1);
    g.fillRoundedRect(BX, BY, BW, BH, 10);
    g.lineStyle(1, 0x3a2618, 1);
    g.strokeRoundedRect(BX, BY, BW, BH, 10);
    this.briefContainer = this.add.container(0, 0).setDepth(11);
  }

  renderMissionBrief(mission) {
    this.briefContainer.removeAll(true);
    const badge = this.add.circle(BX + 24, BY + 24, 13, C_GOLD);
    const badgeNum = this.add.text(BX + 24, BY + 24, String(mission.mission), { font: "bold 15px Arial", color: "#0a0e14" }).setOrigin(0.5);
    const title = this.add.text(BX + 46, BY + 16, mission.title, { font: "bold 16px Arial", color: "#e8dfc8" }).setOrigin(0, 0.5);
    const brief = this.add.text(BX + 14, BY + 42, mission.brief, { font: "13px Arial", color: "#90a4ae", wordWrap: { width: BW - 28 } }).setOrigin(0, 0);
    const hint = this.add.text(BX + BW - 12, BY + BH - 12, "HINT", { font: "bold 13px Arial", color: "#546e7a" }).setOrigin(1, 1).setInteractive({ useHandCursor: true });
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
    g.fillStyle(0x0a0704, 0.93);
    g.fillRect(0, 0, W, 64);
    g.lineStyle(1, 0x2a3654, 1);
    g.lineBetween(0, 64, W, 64);

    this.add.text(20, 14, "THE CALCULATION CHAMBER", { font: "bold 15px Georgia", color: "#b0bec5" }).setDepth(51);
    this.add.text(20, 32, "Restructuring Phase — max() & min()", { font: "12px Arial", color: "#546e7a" }).setDepth(51);

    this.missionHexes = [];
    for (let i = 0; i < 6; i++) {
      const x = 490 + i * 26;
      const hx = this.add.graphics().setDepth(51);
      this.missionHexes.push({ g: hx, x, y: 32 });
    }
    this._drawHexes();

    this.add.text(1060, 10, "SCORE", { font: "11px Arial", color: "#546e7a" }).setDepth(51);
    this.scoreText = this.add.text(1060, 22, "0", { font: "bold 19px Arial", color: "#ffffff" }).setDepth(51);

    this.lifeIcons = [];
    for (let i = 0; i < 5; i++) {
      const lg = this.add.graphics({ x: 1150 + i * 20, y: 26 }).setDepth(51);
      lg.lineStyle(2, C_BRASS, 1);
      lg.strokeCircle(0, 0, 6);
      lg.lineBetween(4, -4, 9, -9);
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
    this.missionHexes.forEach(({ g }) => { this.tweens.killTweensOf(g); g.setAlpha(1); });
    this.missionHexes.forEach(({ g, x, y }, i) => {
      g.clear();
      if (i < this.currentMission) { g.fillStyle(C_GOLD, 1); this._drawHexPath(g, x, y, 9); g.fillPath(); }
      else if (i === this.currentMission) { g.lineStyle(2, C_GOLD, 1); this._drawHexPath(g, x, y, 9); g.strokePath(); }
      else { g.lineStyle(1, C_GRAY, 1); this._drawHexPath(g, x, y, 9); g.strokePath(); }
    });
    if (this.missionHexes[this.currentMission]) {
      const m = this.missionHexes[this.currentMission];
      this.tweens.add({ targets: m.g, alpha: 0.5, duration: 600, yoyo: true, repeat: -1 });
    }
  }

  // ══════════════════════════════════════════════════════════════
  // BIT — Chief Calculator variant (green eyeshade visor, slide rule)
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
    const cloak = this.add.graphics();
    cloak.fillStyle(0x141a2c, 0.85);
    cloak.lineStyle(1, C_BLUE_GRAY, 0.6);
    cloak.fillTriangle(-16, -14, 16, -14, 0, 20);
    const visor = this.add.graphics();
    visor.fillStyle(0x2e7d32, 0.5);
    visor.lineStyle(1, C_BRASS, 0.7);
    visor.beginPath();
    visor.arc(0, -3, 9, Math.PI * 1.1, Math.PI * 1.9, false);
    visor.strokePath();
    const gloveL = this.add.circle(-16, 10, 4, 0xe0d6b8, 0.85);
    const gloveR = this.add.circle(16, 10, 4, 0xe0d6b8, 0.85);
    const rule = this.add.graphics();
    rule.fillStyle(0xe0d6b8, 0.7);
    rule.lineStyle(1, C_BRASS, 0.7);
    rule.fillRoundedRect(18, 2, 12, 5, 1);
    rule.strokeRoundedRect(18, 2, 12, 5, 1);
    rule.fillStyle(0xc8a05a, 0.6);
    rule.fillRect(20, 3.5, 8, 2);
    c.add([g, cloak, eye, pupil, visor, gloveL, gloveR, rule, tip]);
    this.tweens.add({ targets: tip, alpha: 0.3, duration: 900, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: c, y: "+=3", duration: 2000, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
    this.bit = c;
  }

  bitSay(text) {
    this.hideBubble();
    const inner = this.add.text(0, 0, text, { font: "15px Arial", color: "#e0e0e0", wordWrap: { width: 340 } });
    const bw = Math.min(inner.width, 340) + 30, bh = inner.height + 24;
    inner.setText("");
    const bx = Phaser.Math.Clamp(this.bit.x + 30, 20, W - bw - 20);
    const by = Phaser.Math.Clamp(this.bit.y - bh - 20, 80, H - bh - 20);
    const c = this.add.container(bx, by).setDepth(61).setAlpha(0).setScale(0.7);
    const g = this.add.graphics();
    g.fillStyle(0x1a1a2e, 0.97);
    g.fillRoundedRect(0, 0, bw, bh, 10);
    g.lineStyle(1.5, C_BRASS, 1);
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
    this.tweens.add({ targets: b, alpha: 0, scale: 0.8, duration: 150, onComplete: () => b.destroy() });
  }

  async showBitFeedback(message) {
    await this.bitSay(message);
    if (!this._alive) return;
    await Promise.race([this.waitForClick(), this.delay(4000)]);
    this.hideBubble();
  }

  floatingAnnotation(x, y, text, colorHex) {
    const t = this.add.text(x, y, text, { font: "bold 13px Arial", color: colorHex }).setOrigin(0.5).setDepth(70).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 300 });
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
    await this.bitSay("The Calculation Chamber, Calculator — where raw readings become published truth. You can predict any verdict the Comparator gives; tonight you WRITE the judgments themselves. Caps, clamps, peaks, surveys — every mission publishes a real result.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(5200)]); if (!A()) return;
    this.hideBubble();

    const a1 = this.floatingAnnotation(CX + CW / 2, CY - 16, "the computation", HEX_CYAN);
    await this.delay(400); if (!A()) return;
    const a2 = this.floatingAnnotation(PX + PW / 2, PY - 12, "blocks — one clamp shape is broken, one seed is poisoned", HEX_GRAY);
    await this.delay(400); if (!A()) return;
    const a3 = this.floatingAnnotation(OX + OW / 2, OY - 12, "needle, rail, tracker — LIVE", HEX_GREEN_BRIGHT);
    await this.delay(400); if (!A()) return;
    const a4 = this.floatingAnnotation(928, 40, "flips when we publish", HEX_GOLD);
    await this.delay(400); if (!A()) return;
    const a5 = this.floatingAnnotation(RX + RW / 2, RY - 12, "every scenario must verify", HEX_BLUE_GRAY);
    await this.delay(400); if (!A()) return;

    await this.bitSay("The chamber's three laws: min caps, max floors — never swap them; the clamp reads inside-out — ceiling first, floor second; and a running record starts from the DATA, never from zero. Build, run, verify, repair. The night's readings await!");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(5500)]); if (!A()) return;
    this.hideBubble();
    [a1, a2, a3, a4, a5].forEach((a) => this.tweens.add({ targets: a, alpha: 0, duration: 250, onComplete: () => a.destroy() }));

    try { localStorage.setItem(TUTORIAL_KEY, "true"); } catch (_) {}
    this.showProjectBriefing(0);
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
    g.fillStyle(0x1a0e05, 1);
    g.fillRoundedRect(-260, -105, 520, 210, 12);
    g.lineStyle(2, C_GOLD, 1);
    g.strokeRoundedRect(-260, -105, 520, 210, 12);
    g.fillStyle(C_GOLD, 1);
    g.fillRect(-260, -105, 5, 210);
    const badge = this.add.circle(-225, -75, 18, C_GOLD);
    const badgeNum = this.add.text(-225, -75, String(mission.mission), { font: "bold 18px Arial", color: "#0a0e14" }).setOrigin(0.5);
    const title = this.add.text(-195, -85, mission.title, { font: "bold 21px Arial", color: "#ffffff" }).setOrigin(0, 0.5);
    const desc = this.add.text(-225, -35, mission.brief, { font: "15px Arial", color: "#b0bec5", wordWrap: { width: 460 } }).setOrigin(0, 0);

    const startBtn = this.add.container(0, 85).setDepth(1);
    const sg = this.add.graphics();
    sg.fillStyle(C_GOLD, 1);
    sg.fillRoundedRect(-70, -20, 140, 40, 20);
    const st = this.add.text(0, 0, "START", { font: "bold 15px Arial", color: "#0a0e14" }).setOrigin(0.5);
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
    this.clearMission();

    this.tabFilename.setText(`Calc${mission.mission}.java`);
    this.renderSkeleton(mission);
    this.populatePalette(mission);
    this.buildReportRows(mission);
    this.renderMissionBrief(mission);
    this.disableRunButton();
    this.highlightCodeLine(null);
    this.verdictLamp.setFillStyle(C_GRAY);
    this.clearContainers();
    this.clearTracker();
    this.clearTicker();
    this.clearRail();
    this.mcResetCradles();
    this.mcResetNeedle();
    this.parkCameos();
    this.updateManifestStrip("");
    this.setResultsBoard("idle");

    const firstTest = mission.tests[0];
    if (mission.mission === 5) { this.activateCameo("tape"); this.loadMiniTape(firstTest.input); }
    if (mission.mission === 6) { this.activateCameo("shelf"); this.populateMiniShelf(firstTest.initialList); }

    this.inputLocked = false;
  }

  clearMission() {
    this.missionElements.forEach((e) => { if (e && e.destroy) e.destroy(); });
    this.missionElements = [];
  }

  buildProgramItems(mission, assembled) {
    const out = [];
    mission.skeleton.forEach((rawLine) => {
      const sm = rawLine.match(/<slot:(\w+)>/);
      if (sm) {
        const slotId = sm[1];
        const code = assembled[slotId] && assembled[slotId][0] ? assembled[slotId][0].code : "";
        const codeLines = code.split("\n");
        out.push({ text: rawLine.replace(/<slot:\w+>/, codeLines[0]), slotId });
        for (let k = 1; k < codeLines.length; k++) out.push({ text: codeLines[k], slotId });
      } else {
        out.push({ text: rawLine, slotId: null });
      }
    });
    return out;
  }

  _substituteTestLine(line, test) {
    const m = line.match(/^(int|double)\s+(\w+)\s*=\s*\/\*\s*test value\s*\*\/;$/);
    if (m && test.substitutions && test.substitutions[m[2]] !== undefined) {
      return `${m[1]} ${m[2]} = ${test.substitutions[m[2]]};`;
    }
    if (/^ArrayList<\w+>\s+\w+\s*=\s*\/\*.*\*\/;$/.test(line)) return line;
    return line;
  }

  // ══════════════════════════════════════════════════════════════
  // COMPILE CHECK
  // ══════════════════════════════════════════════════════════════

  compileCheckProgram(mission, items, assembled) {
    const failFor = (slotId, fallbackTag) => {
      const blockTag = slotId && assembled[slotId] && assembled[slotId][0] ? assembled[slotId][0].tag : null;
      return { ok: false, slotId, tag: blockTag || fallbackTag };
    };
    const fullText = items.map((i) => i.text).join("\n");

    const instanceMatch = fullText.match(/(\w+)\.(max|min)\(/);
    if (instanceMatch && instanceMatch[1] !== "Math") {
      const badItem = items.find((i) => i.text.includes(instanceMatch[0]));
      return failFor(badItem && badItem.slotId, "instance_call_on_number_belief");
    }

    for (const m of fullText.matchAll(/Math\.(max|min)\(/g)) {
      let depth = 1, j = m.index + m[0].length;
      while (j < fullText.length && depth > 0) { if (fullText[j] === "(") depth++; else if (fullText[j] === ")") depth--; j++; }
      const argsStr = fullText.slice(m.index + m[0].length, j - 1);
      if (this._splitTopArgs(argsStr).length > 2) {
        const badItem = items.find((i) => i.text.includes(`Math.${m[1]}(`));
        return failFor(badItem && badItem.slotId, "max_three_args_belief");
      }
    }

    for (const slotId in this.slotDefs) {
      const skelLine = mission.skeleton.find((l) => l.includes(`<slot:${slotId}>`));
      if (!skelLine) continue;
      const code = (assembled[slotId] && assembled[slotId][0] ? assembled[slotId][0].code : "").trim();
      if (/^int\s+\w+\s*=\s*<slot:\w+>;$/.test(skelLine) && code === "sc.nextLine()") {
        return failFor(slotId, "wrong_scanner_method");
      }
    }

    return { ok: true };
  }

  // ══════════════════════════════════════════════════════════════
  // PROACTIVE-METRIC DETECTION (clamp, seed, cross-wing)
  // ══════════════════════════════════════════════════════════════

  _recordFirstRunMetrics(mission, passed) {
    const key = `mission${mission.mission}`;
    if (this._firstRunMetricsRecorded[key]) return;
    this._firstRunMetricsRecorded[key] = true;

    if (mission.isClamp) {
      const slotId = mission.mission === 5 ? "pin" : "clamp";
      const block = this.slotContents[slotId] && this.slotContents[slotId][0];
      const tag = block ? block.container.getData("tag") : null;
      const shape = block ? block.container.getData("clampShape") : null;
      this.clampProactive[key] = !tag;
      if (shape) this.clampShapeChoice[key] = shape;
    }
    if (mission.mission === 6) {
      const seedBlock = this.slotContents.seed && this.slotContents.seed[0];
      this.seedChoiceFirstRun.mission6 = !!seedBlock && seedBlock.container.getData("code") === "readings.get(0)";
    }
    if (mission.crossWing) {
      this.crossWingCleanFirstRun[key] = passed;
    }
  }

  // ══════════════════════════════════════════════════════════════
  // UNIFIED INTERPRETER — Math.max/min + Scanner + ArrayList.get +
  // for-loop + println (never scripted; genuine outcomes only)
  // ══════════════════════════════════════════════════════════════

  _splitTopArgs(argsStr) {
    const parts = [];
    let cur = "", depth = 0;
    for (let i = 0; i < argsStr.length; i++) {
      const ch = argsStr[i];
      if (ch === "(") depth++;
      if (ch === ")") depth--;
      if (ch === "," && depth === 0) { parts.push(cur.trim()); cur = ""; continue; }
      cur += ch;
    }
    const last = cur.trim();
    if (last || parts.length) parts.push(last);
    return parts.filter((p) => p !== "");
  }

  _splitTopPlus(expr) {
    const parts = [];
    let cur = "", inQuotes = false, depth = 0;
    for (let i = 0; i < expr.length; i++) {
      const ch = expr[i];
      if (ch === '"' && expr[i - 1] !== "\\") inQuotes = !inQuotes;
      if (!inQuotes) {
        if (ch === "(") depth++;
        if (ch === ")") depth--;
        if (ch === "+" && depth === 0) { parts.push(cur.trim()); cur = ""; continue; }
      }
      cur += ch;
    }
    if (cur.trim() || parts.length) parts.push(cur.trim());
    return parts;
  }

  _evalSimpleValue(expr, vars) {
    const t = expr.trim();
    if (/^-?\d+\.\d+$/.test(t)) return { ok: true, value: parseFloat(t), type: "double" };
    if (/^-?\d+$/.test(t)) return { ok: true, value: parseInt(t, 10), type: "int" };
    if (/^[A-Za-z_]\w*$/.test(t) && vars && vars[t] !== undefined) return { ok: true, value: vars[t].value, type: vars[t].type };
    return { ok: false, crash: "eval" };
  }

  async crashGet(index) {
    const stamp = this.add.text(OX + OW / 2, OY + 120, "IndexOutOfBoundsException", { font: "bold 11px Courier New", color: HEX_RED }).setOrigin(0.5).setAngle(-6).setAlpha(0);
    this.rigLayer.add(stamp);
    this.missionElements.push(stamp);
    this.tweens.add({ targets: stamp, alpha: 1, duration: 100 });
    this.screenShake(0.005, 140);
    await this.delay(500);
    if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 160, onComplete: () => stamp.destroy() });
  }

  /** Resolves a value that is NOT itself a Math.max/min call: a
   * readings.get(i) ghost retrieval, a variable, or a literal. */
  async _resolveValueOnly(expr, vars) {
    const t = expr.trim();
    const getMatch = t.match(/^(\w+)\.get\((.*)\)$/);
    if (getMatch) {
      const idxArg = this._evalSimpleValue(getMatch[2], vars);
      if (!idxArg.ok) return { ok: false, crash: "eval" };
      const idx = idxArg.value;
      if (idx < 0 || idx >= this.currentList.length) { await this.crashGet(idx); return { ok: false, crash: "ioobe", index: idx }; }
      const entry = await this.retrieveGhost(idx);
      return { ok: true, value: entry.value, type: "int" };
    }
    return this._evalSimpleValue(t, vars);
  }

  /** Top-level value resolution — used for declaration RHS, reassignment
   * RHS, and println's non-quoted parts. A Math.max/min call here runs
   * the FULL comparator choreography (descend to plinth). */
  async _evalTopLevelValue(expr, vars) {
    const t = expr.trim();
    if (/^Math\.(max|min)\(/.test(t)) return await this.evalMathCall(t, vars, true);
    return await this._resolveValueOnly(t, vars);
  }

  /** Resolves an argument INSIDE a Math.max/min call — a nested call
   * recurses fully (isolated cradle cycle) before the outer call ever
   * touches its own cradles. */
  async _resolveArgValue(argExpr, vars) {
    const t = argExpr.trim();
    if (/^Math\.(max|min)\(/.test(t)) {
      const inner = await this.evalMathCall(t, vars, false);
      if (!inner.ok) return inner;
      return { ok: true, kind: "nested", value: inner.value, type: inner.type, starObj: inner.winnerStarObj };
    }
    const r = await this._resolveValueOnly(t, vars);
    if (!r.ok) return r;
    return { ok: true, kind: "literal", value: r.value, type: r.type };
  }

  async _placeIntoCradle(resolved, cradleKey) {
    if (resolved.kind === "nested") await this.mcCarryStar(resolved.starObj, cradleKey);
    else await this.mcSpawnStar(resolved.value, resolved.type, cradleKey);
  }

  async evalMathCall(callText, vars, isTopLevel) {
    const m = callText.trim().match(/^Math\.(max|min)\((.*)\)$/);
    if (!m) return { ok: false, crash: "eval" };
    const method = m[1];
    const args = this._splitTopArgs(m[2]);
    if (args.length !== 2) return { ok: false, crash: "wrong_arity" };
    if (isTopLevel) this.mcResetCradles();
    this.mcSetModePlate(method);
    this._mcNeedleBusy = true;

    const aRes = await this._resolveArgValue(args[0], vars);
    if (!aRes.ok) return aRes;
    const bRes = await this._resolveArgValue(args[1], vars);
    if (!bRes.ok) return bRes;

    await this._placeIntoCradle(aRes, "a");
    await this._placeIntoCradle(bRes, "b");

    this.mcSetModePlate(method);

    const widened = aRes.type === "double" || bRes.type === "double";
    if (widened) {
      if (this._mcStarsA && this._mcStarsA.type !== "double") this._mcWarmStarToDouble(this._mcStarsA);
      if (this._mcStarsB && this._mcStarsB.type !== "double") this._mcWarmStarToDouble(this._mcStarsB);
      await this.delay(80);
      if (!this._alive) return { ok: true, value: aRes.value, type: aRes.type };
    }

    if (this._railEnabled) {
      await this.placeOnRail([
        { value: aRes.value, type: widened ? "double" : aRes.type },
        { value: bRes.value, type: widened ? "double" : bRes.type },
      ], this._currentRailBracket);
      if (!this._alive) return { ok: true, value: aRes.value, type: aRes.type };
    }

    await this.delay(60);
    if (!this._alive) return { ok: true, value: aRes.value, type: aRes.type };
    await this.mcNeedleOscillate();
    if (!this._alive) return { ok: true, value: aRes.value, type: aRes.type };

    const av = widened ? Number(aRes.value) : aRes.value;
    const bv = widened ? Number(bRes.value) : bRes.value;
    let winSide, winner, winnerType;
    if (av === bv) {
      winSide = "a"; winner = av; winnerType = widened ? "double" : aRes.type;
    } else {
      const aWins = method === "min" ? av < bv : av > bv;
      winSide = aWins ? "a" : "b";
      winner = aWins ? av : bv;
      winnerType = widened ? "double" : (aWins ? aRes.type : bRes.type);
    }
    await this.mcNeedleLock(winSide);
    if (!this._alive) return { ok: true, value: winner, type: winnerType };

    if (this._railEnabled) await this.railSweep(method, winSide);

    const winStar = winSide === "a" ? this._mcStarsA : this._mcStarsB;
    const loseStar = winSide === "a" ? this._mcStarsB : this._mcStarsA;
    if (winStar) this.tweens.add({ targets: winStar.container, scale: 1.2, duration: 100, yoyo: true });
    if (loseStar) this.tweens.add({ targets: loseStar.container, alpha: 0.6, duration: 150 });

    if (isTopLevel) {
      this._mcNeedleBusy = false;
      await this.mcDescendReturnStar(winner, winnerType, winStar);
      return { ok: true, value: winner, type: winnerType };
    }
    this._mcStarsA = null; this._mcStarsB = null;
    if (loseStar) {
      this.time.delayedCall(180, () => { if (loseStar.container.active) this.tweens.add({ targets: loseStar.container, alpha: 0, duration: 150, onComplete: () => loseStar.container.destroy() }); });
    }
    return { ok: true, value: winner, type: winnerType, winnerStarObj: winStar };
  }

  async execStatement(rawLine, vars) {
    const t = rawLine.trim();
    if (!t || t.startsWith("//") || t === "}") return { ok: true };
    if (/^ArrayList<\w+>\s+\w+\s*=\s*\/\*.*\*\/;$/.test(t)) return { ok: true };

    const declVar = t.match(/^(int|double)\s+(\w+)\s*=\s*(.*);$/);
    if (declVar) {
      const varType = declVar[1], name = declVar[2], rhs = declVar[3].trim();
      if (rhs === "sc.nextInt()") {
        this.updateManifestStrip(`int ${name} = sc.nextInt()`);
        const read = this.evaluateNextToken(this.tapeState);
        await this.tapeConsumeVisual(read.consumedCount);
        const value = parseInt(read.rawValue, 10) || 0;
        vars[name] = { value, type: "int" };
        this.miniDispenseTo(name, value, "int");
        await this.delay(80);
        return { ok: true };
      }
      if (rhs === "sc.nextLine()") return { ok: false, crash: "compile" };
      const r = await this._evalTopLevelValue(rhs, vars);
      if (!r.ok) return r;
      vars[name] = { value: r.value, type: varType === "double" ? "double" : r.type };
      this.miniDispenseTo(name, vars[name].value, vars[name].type);
      return { ok: true };
    }

    const reassign = t.match(/^(\w+)\s*=\s*(.*);$/);
    if (reassign) {
      const name = reassign[1], rhs = reassign[2].trim();
      const r = await this._evalTopLevelValue(rhs, vars);
      if (!r.ok) return r;
      vars[name] = { value: r.value, type: vars[name] ? vars[name].type : r.type };
      this.miniDispenseTo(name, vars[name].value, vars[name].type);
      return { ok: true };
    }

    const bareMath = t.match(/^(Math\.(max|min)\(.*\));$/);
    if (bareMath) {
      const r = await this.evalMathCall(bareMath[1], vars, true);
      if (!r.ok) return r;
      await this.mcDiscardFade();
      return { ok: true };
    }

    const printMatch = t.match(/^System\.out\.println\((.*)\);$/);
    if (printMatch) {
      this.updateManifestStrip("System.out.println(…)");
      const parts = this._splitTopPlus(printMatch[1]);
      let out = "";
      for (const p of parts) {
        const pt = p.trim();
        if (/^".*"$/.test(pt)) { out += pt.slice(1, -1); continue; }
        const r = await this._evalTopLevelValue(pt, vars);
        if (!r.ok) return r;
        out += r.type === "double" ? Number(r.value).toFixed(1) : String(r.value);
      }
      this._lastPrintedLine = out;
      await this.printToTicker(out);
      return { ok: true };
    }

    return { ok: true };
  }

  evalLoopCond(condExpr, vars) {
    const m = condExpr.trim().match(/^(\w+)\s*(<=|>=|<|>)\s*(\w+)\.size\(\)$/);
    if (!m) return false;
    const lhs = vars[m[1]] !== undefined ? vars[m[1]].value : NaN;
    const rhs = this.currentList.length;
    switch (m[2]) {
      case "<": return lhs < rhs;
      case "<=": return lhs <= rhs;
      case ">": return lhs > rhs;
      case ">=": return lhs >= rhs;
    }
    return false;
  }

  async execForLoop(condExpr, updateStatement, vars) {
    let iv = 1;
    let iterations = 0;
    while (iterations < 200) {
      if (!this._alive) return { ok: true };
      vars.i = { value: iv, type: "int" };
      if (!this.evalLoopCond(condExpr, vars)) {
        if (iterations === 0) { this.appendTrackerRow(`i=${iv} | size=${this.currentList.length} → loop skipped`); await this.delay(280); }
        break;
      }
      const bestBefore = vars.best ? vars.best.value : undefined;
      const r = await this.execStatement(updateStatement, vars);
      if (!r.ok) {
        this.appendTrackerRow(`i=${iv} → ✗ crash`, true);
        return r;
      }
      const bestAfter = vars.best ? vars.best.value : undefined;
      const challenger = this.currentList[iv] ? this.currentList[iv].value : "?";
      const changed = bestAfter !== bestBefore;
      this.appendTrackerRow(`i=${iv} | get(${iv})=${challenger} | best: ${bestAfter}`, false, changed);
      iv++;
      iterations++;
      await this.delay(240);
    }
    return { ok: true };
  }

  _findBlockEnd(lines, openIdx) {
    let depth = 1;
    for (let j = openIdx + 1; j < lines.length; j++) {
      const t = lines[j].trim();
      if (t.endsWith("{")) depth++;
      else if (t === "}") { depth--; if (depth === 0) return j; }
    }
    return lines.length - 1;
  }

  async runProgram(lines) {
    const vars = {};
    let i = 0;
    for (let li = 0; li < lines.length; li++) {
      const tt = lines[li].trim();
      if (tt && !tt.startsWith("//") && !/^Scanner sc/.test(tt) && !/^ArrayList</.test(tt)) { this.highlightCodeLine(li); break; }
    }
    while (i < lines.length) {
      if (!this._alive) return { ok: true };
      const raw = lines[i];
      const t = raw.trim();
      if (!t || t.startsWith("//") || t === "}") { i++; continue; }
      if (/^Scanner sc = new Scanner/.test(t) || /^ArrayList<\w+>\s+\w+\s*=\s*\/\*.*\*\/;$/.test(t)) { i++; continue; }

      const forMatch = t.match(/^for \(int (\w+) = (\d+); (.*); \1\+\+\) \{$/);
      if (forMatch) {
        const end = this._findBlockEnd(lines, i);
        const bodyLine = lines.slice(i + 1, end).find((l) => l.trim() && !l.trim().startsWith("//"));
        const r = await this.execForLoop(forMatch[3], bodyLine ? bodyLine.trim() : "", vars);
        if (!r.ok) { this.highlightCodeLine(null); return r; }
        i = end + 1;
        if (i < lines.length) this.highlightCodeLine(i);
        continue;
      }

      this.highlightCodeLine(i);
      const r = await this.execStatement(raw, vars);
      if (!r.ok) { this.highlightCodeLine(null); return r; }
      i++;
      if (i < lines.length) this.highlightCodeLine(i);
    }
    this.highlightCodeLine(null);
    return { ok: true };
  }

  // ══════════════════════════════════════════════════════════════
  // RUN PIPELINE
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

  _pulseOffendingBlock(slotId) {
    const placed = slotId && this.slotContents[slotId] && this.slotContents[slotId][0];
    if (!placed) return;
    const c = placed.container;
    const draw = c.getData("draw");
    if (draw) draw(C_RED);
    this.tweens.add({ targets: c, x: c.x + 4, duration: 40, yoyo: true, repeat: 5 });
    this.time.delayedCall(1400, () => { if (c.active && draw) draw(C_BRASS); });
  }

  async onRunPressed() {
    if (this.inputLocked) return;
    this.inputLocked = true;
    this.disableRunButton();
    this.runButton.t.setText("...");
    this.runCount++;
    this._runInProgress = true;
    this.setResultsBoard("computation");
    const mission = MISSIONS[this.currentMission];
    const isFirstRun = this.runCount === this._runCountAtMissionStart + 1;
    const assembled = this.getAssembledCode();
    const wrongBlocksUsed = this._collectWrongBlocksUsed();

    const items = this.buildProgramItems(mission, assembled);
    const compileResult = this.compileCheckProgram(mission, items, assembled);
    if (!compileResult.ok) {
      if (isFirstRun) this._recordFirstRunMetrics(mission, false);
      this.showCompileErrorStamp();
      this._pulseOffendingBlock(compileResult.slotId);
      this._runInProgress = false;
      this.setResultsBoard("idle");
      await this.delay(900);
      this._resolveRunOutcome(mission, "compile_fail", wrongBlocksUsed.length ? wrongBlocksUsed : [{ code: "", tag: compileResult.tag }], [], compileResult.tag);
      return;
    }

    let anyMismatch = false, anyCrash = false;
    const failedTests = [];
    for (let i = 0; i < mission.tests.length; i++) {
      if (!this._alive) return;
      const test = mission.tests[i];
      const outcome = await this.runTestCase(mission, test, i, items);
      if (!outcome.pass) { anyMismatch = true; failedTests.push(this._compactTestLabel(test)); }
      if (outcome.crashed) anyCrash = true;
    }
    this._runInProgress = false;

    if (isFirstRun) this._recordFirstRunMetrics(mission, !anyMismatch);
    const resultKind = anyMismatch ? (anyCrash ? "runtime_crash" : "logic_fail") : "pass";
    this._resolveRunOutcome(mission, resultKind, wrongBlocksUsed, failedTests, null);
  }

  async runTestCase(mission, test, index, items) {
    this.clearContainers();
    this.clearTracker();
    this.clearTicker();
    this.clearRail();
    this.mcResetCradles();
    this.mcResetNeedle();
    this.parkCameos();
    this.updateManifestStrip("");
    this._currentRailBracket = mission.railBracket || null;
    this._railEnabled = true;

    if (mission.mission === 5) { this.activateCameo("tape"); this.loadMiniTape(test.input); }
    if (mission.mission === 6) { this.activateCameo("shelf"); this.populateMiniShelf(test.initialList); }

    this._lastPrintedLine = null;
    const execLines = items.map((it) => this._substituteTestLine(it.text, test));
    const runResult = await this.runProgram(execLines);
    if (!this._alive) return { pass: false, crashed: false };

    const output = this._lastPrintedLine || "";
    const pass = runResult.ok && output === test.expectedOutput;
    this.verdictLamp.setFillStyle(pass ? C_GREEN_BRIGHT : C_RED);
    this.updateReportRow(index, pass);
    await this.delay(250);
    return { pass, crashed: !runResult.ok };
  }

  /**
   * Computes the 4 struggle-detection features from the first 3 missions'
   * attempt history and asks the backend's Isolation Forest model whether
   * this looks like typical or struggling play. Wired into FusionEngine so
   * the existing 'fusionAction' subscription can react to it, exactly like
   * the emotion/fatigue signals. Never throws — a failed/unreachable
   * backend just means no behavioral signal for this level; face and
   * fatigue detection keep working on their own regardless.
   *
   * This level uses the MISSIONS/currentMission architecture, not
   * ROUNDS/currentRound — attemptLog entries here carry `mission` (not
   * `round`) and have no `misconceptionTag` field on the main run-outcome
   * entries. misconception_repeat_count is the structural equivalent: a
   * failed run (`result !== "pass"`) whose wrongBlocks carried a tagged
   * distractor, mirroring "a wrong attempt attributable to a specific
   * misconception" from the ROUNDS-based levels.
   */
  async runBehavioralCheck() {
    const relevant = this.attemptLog.filter((a) => a.mission <= 3);
    const attempts_count = relevant.length;
    const time_taken_seconds = relevant.reduce((sum, a) => sum + a.timeMs, 0) / 1000;
    const misconception_repeat_count = relevant.filter(
      (a) => a.result !== "pass" && (a.wrongBlocks || []).some((b) => b && b.tag)
    ).length;
    const combo_breaks = GameManager.get("comboBreaksThisLevel") || 0;

    try {
      const { prediction } = await WellbeingAPI.predictStruggle({
        attempts_count,
        time_taken_seconds,
        misconception_repeat_count,
        combo_breaks,
      });
      if (!this._alive) return;
      const features = { attempts_count, time_taken_seconds, misconception_repeat_count, combo_breaks };
      const effectivePrediction = BehavioralRules.getEffectivePrediction(features, prediction, false);
      GameManager.fusionEngine.checkBehavioral(effectivePrediction);
    } catch (e) {
      console.warn("Level57Scene: /api/wellbeing/predict-struggle unreachable, skipping behavioral signal for this level:", e);
    }
  }

  _resolveRunOutcome(mission, result, wrongBlocksUsed, failedTests, compileTag) {
    const timeMs = Math.round(this.time.now - this.missionStartTime);
    this.attemptLog.push({
      mission: mission.mission, runNumber: this.runCount, result,
      blocksUsed: Object.values(this.getAssembledCode()).flat().map((b) => b.code),
      wrongBlocks: wrongBlocksUsed, failedTests, timeMs, hintUsedBefore: this.missionHintUsed,
    });

    if (result === "pass") { this.onMissionComplete(); return; }

    this.setResultsBoard("idle");
    this.failedRunCount++;
    this.missionRunsFailed++;
    this.runButton.t.setText("▶ RUN");

    // Every failed run costs exactly one life, matching the strictness of
    // the ROUNDS-based levels (loseLife() there fires on every wrong answer).
    const livesLostThisRun = true;
    const feedbackTag = compileTag || (wrongBlocksUsed[0] && wrongBlocksUsed[0].tag);

    (async () => {
      if (livesLostThisRun) {
        const dead = this.loseLife();
        if (dead) { this.time.delayedCall(500, () => this.gameOver()); return; }
      }

      if (this.missionRunsFailed === 3) {
        await this.runBehavioralCheck();

        let waitTime = 0;
        while (!GameManager.interventionInFlight && waitTime < 1500) {
          await this.delay(100);
          waitTime += 100;
        }
        while (GameManager.interventionInFlight) {
          await this.delay(200);
        }
      }

      if (!this._alive) return;
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
    this.showBitFeedback(HINTS[mission.mission] || "Reread the brief carefully — the answer is in the wording.");
  }

  async onMissionComplete() {
    if (this.currentMission === 2) {
      await this.runBehavioralCheck();

      let waitTime = 0;
      while (!GameManager.interventionInFlight && waitTime < 1500) {
        await this.delay(100);
        waitTime += 100;
      }
      while (GameManager.interventionInFlight) {
        await this.delay(200);
      }
    }
    if (this.gameEnded) return;
    const flawless = this.missionRunsFailed === 0 && !this.missionHintUsed;
    if (flawless) this.flawlessCount++;
    this.updateScore(250 + (flawless ? 100 : 0));
    if (flawless) this.createFloatingText(OX + OW / 2, OY - 14, "FLAWLESS +100", HEX_GOLD, "bold 16px Arial");
    this.setResultsBoard("published");

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
    await this.bitSay(mission.postMissionNote || "Clean computation — the rig confirms it.");
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
    if (icon) this.tweens.add({ targets: icon, alpha: 0.12, duration: 350 });
    return this.lives <= 0;
  }

  addLife() {
    if (this.lives < 5) {
      const icon = this.lifeIcons[this.lives];
      if (icon) { this.tweens.add({ targets: icon, alpha: 1, duration: 350 }); }
      this.lives++;
    }
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

    (async () => {
      this._runInProgress = false;
      this.setResultsBoard("idle");
      const motes = this.ambient;
      this.ambient = null;
      (motes || []).forEach((m) => this.tweens.add({ targets: m, y: 632, alpha: 0, duration: 1500, ease: "Sine.easeIn" }));

      const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
      this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });
      const title = this.add.text(640, 240, "COMPUTATION SUSPENDED", { font: "bold 32px Georgia", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
      this.tweens.add({ targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut", onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }) });
      this.add.text(640, 310, `Score: ${this.score}`, { font: "21px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
      this.add.text(640, 350, `Missions Completed: ${this.currentMission} / ${MISSIONS.length}`, { font: "18px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);
      this._makeButton(525, 420, "RESUME THE NIGHT'S WORK", 200, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
      this._makeButton(755, 420, "RETURN TO MENU", 200, 50, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.start("MenuScene"));
    })();
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearMission();
    this.hideBubble();

    try { GameManager.completeLevel(57, Math.round((this.flawlessCount / MISSIONS.length) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("math_max_min_mastery"); } catch (_) {}
    try {
      localStorage.setItem("level57_results", JSON.stringify({
        level: 57, concept: "math_max_min", phase: "restructuring",
        score: this.score, missionsCompleted: 6, flawlessMissions: this.flawlessCount,
        totalRuns: this.runCount, failedRuns: this.failedRunCount, hintsUsed: this.hintCount,
        selfCorrections: this.selfCorrectionCount,
        clampAssembledProactively: this.clampProactive, clampShapeChoice: this.clampShapeChoice,
        seedChoiceCorrectFirstRun: this.seedChoiceFirstRun, crossWingCleanFirstRun: this.crossWingCleanFirstRun,
        livesRemaining: this.lives, attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.chamberFinale().then(() => { if (this._alive) this.showScoreTally(); });
  }

  async chamberFinale() {
    this.setResultsBoard("published");
    this.time.delayedCall(200, () => { if (this._resultsBoard && this._resultsBoard.t.active) this._resultsBoard.t.setText("NIGHT PUBLISHED"); });

    const chalk = this.add.graphics().setDepth(3).setAlpha(0);
    chalk.lineStyle(2, 0xe8eaf6, 0.7);
    chalk.lineBetween(260, 100, 460, 100);
    chalk.lineBetween(280, 90, 280, 110);
    chalk.lineBetween(440, 90, 440, 110);
    chalk.fillStyle(C_GOLD, 0.8);
    chalk.fillCircle(360, 100, 4);
    this.tweens.add({ targets: chalk, alpha: 1, duration: 600 });

    this._engineWheels.forEach((w, i) => {
      this.tweens.add({ targets: w.g, alpha: 0.3, duration: 100, delay: i * 80, yoyo: true, repeat: 2 });
    });

    this._mcNeedleBusy = true;
    await new Promise((res) => { this.tweens.add({ targets: this.mcNeedle, angle: 360, duration: 700, ease: "Cubic.easeInOut", onComplete: res }); });
    this.mcNeedle.setAngle(0);
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
    panel.fillStyle(0x0a0d18, 1);
    panel.fillRoundedRect(350, 90, 580, 560, 16);
    panel.lineStyle(2, C_GOLD, 1);
    panel.strokeRoundedRect(350, 90, 580, 560, 16);

    const title = this.add.text(640, 130, "CHIEF CALCULATOR", { font: "bold 32px Georgia", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(91).setScale(0);
    this.tweens.add({ targets: title, scale: 1, duration: 350, ease: "Back.easeOut" });

    const clampCount = Object.values(this.clampProactive).filter(Boolean).length;
    const crossWingCount = Object.values(this.crossWingCleanFirstRun).filter(Boolean).length;
    const seedStr = this.seedChoiceFirstRun.mission6 ? "✓" : "✗";
    const lines = [
      "MISSIONS: 6/6",
      `FLAWLESS: ${this.flawlessCount}`,
      `SELF-CORRECTIONS: ${this.selfCorrectionCount}`,
      `CLAMP-PROACTIVE: ${clampCount}/2`,
      `DATA-SEED FIRST RUN: ${seedStr}`,
      `CROSS-WING CLEAN: ${crossWingCount}/2`,
      `HINTS: ${this.hintCount}`,
    ];
    lines.forEach((s, i) => {
      const t = this.add.text(410, 170 + i * 22, s, { font: "15px Arial", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 250, delay: 300 + i * 130 });
    });
    const totalText = this.add.text(410, 170 + 7 * 22, "TOTAL: 0", { font: "bold 21px Arial", color: HEX_GOLD }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: totalText, alpha: 1, duration: 250, delay: 1200 });
    const counter = { v: 0 };
    this.tweens.add({ targets: counter, v: this.score, duration: 1000, delay: 1200, onUpdate: () => totalText.setText(`TOTAL: ${Math.round(counter.v)}`) });

    const stars = this._starRating();
    for (let i = 0; i < 3; i++) {
      const earned = i < stars;
      const s = this.add.text(640 + (i - 1) * 60, 358, "★", { font: "34px Arial", color: earned ? HEX_GOLD : "#2a3040" }).setOrigin(0.5).setDepth(91).setScale(0);
      this.tweens.add({ targets: s, scale: 1, duration: 250, delay: 1700 + i * 200, ease: earned ? "Back.easeOut" : "Cubic.easeOut" });
    }

    const badge = this.add.container(640, 420).setDepth(91).setAlpha(0);
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillCircle(0, 0, 34);
    bg.lineStyle(3, C_GOLD, 1);
    bg.strokeCircle(0, 0, 34);
    bg.lineStyle(1.5, C_BRASS, 0.8);
    bg.strokeEllipse(-12, -9, 14, 6);
    bg.strokeEllipse(12, -9, 14, 6);
    bg.lineStyle(1.5, C_CYAN, 0.8);
    bg.strokeCircle(0, 6, 9);
    bg.lineStyle(2, 0x2e7d32, 0.8);
    bg.beginPath();
    bg.arc(0, 18, 8, Math.PI * 1.1, Math.PI * 1.9, false);
    bg.strokePath();
    badge.add(bg);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 0 });
    const badgeLbl = this.add.text(640, 462, "max()/min() MASTERY", { font: "bold 15px Georgia", color: HEX_GOLD }).setOrigin(0.5).setDepth(91).setAlpha(0);
    const badgeSub = this.add.text(640, 478, "Accretion ✓  Tuning ✓  Restructuring ✓", { font: "12px Arial", color: "#78909c" }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: [badgeLbl, badgeSub], alpha: 1, duration: 300, delay: 0 });

    const barY = 505;
    const barG = this.add.graphics().setDepth(91).setAlpha(0);
    barG.lineStyle(1.5, 0x78909c, 1);
    barG.strokeRoundedRect(450, barY, 380, 14, 7);
    barG.fillStyle(C_CYAN, 1);
    barG.fillRoundedRect(450, barY, 380 * 0.33, 14, 7);
    this.tweens.add({ targets: barG, alpha: 1, duration: 300, delay: 2300 });
    const progressLbl = this.add.text(640, barY + 26, "MATH WING — 1 of 3 trilogies complete", { font: "bold 13px Georgia", color: HEX_CYAN }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: progressLbl, alpha: 1, duration: 300, delay: 2400 });

    this._makeButton(470, 605, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(760, 605, "NEXT: abs() awaits →", 260, 44, { fill: 0x00733a, stroke: C_GREEN_BRIGHT, textColor: "#ffffff" }, () => {
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
    const t = this.add.text(0, 0, label, { font: "bold 16px Arial", color: style.textColor }).setOrigin(0.5);
    if (t.width > w - 16) t.setFontSize(11);
    c.add([g, t]);
    c.setSize(w, h);
    c.setInteractive({ useHandCursor: true });
    c.on("pointerover", () => { draw(true); c.setScale(1.04); });
    c.on("pointerout", () => { draw(false); c.setScale(1); });
    c.on("pointerdown", onClick);
    return c;
  }
}
