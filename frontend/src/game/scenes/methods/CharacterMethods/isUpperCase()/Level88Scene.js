/**
 * Level 88 — "The Grand Classification" (Character Wing: Restructuring
 * Phase — Character.isUpperCase() trilogy finale — CURRICULUM FINALE)
 * ===========================================================================
 * The curriculum's FINAL level. The learner CONSTRUCTS complete case-
 * classification programs combining ALL THREE Character methods — no
 * multiple choice. Reuses the L27→L85 code-canvas/parts-bin/RUN
 * architecture. The rig hosts the COMPLETE triple apparatus — L80 Numeral
 * Loupe (isDigit), L83 Prismatic Lens (isLetter), L86 Case Prism
 * (isUpperCase) — side by side, each firing in program order. Mission 6's
 * success triggers the Character Wing Seal (the curriculum's eighth and
 * final wing) followed by the Curriculum Completion ceremony.
 *
 * Hand-verified all 6 missions' test batteries by direct tracing against
 * real Java semantics before writing any code. ONE spec bug caught:
 *
 *  - Mission 2's first test claims `text = "HeLLo WoRLd"` produces
 *    `Uppercase: 5`. Direct character-by-character count: H(▲) e(▽)
 *    L(▲) L(▲) o(▽) ' ' W(▲) o(▽) R(▲) L(▲) d(▽) — six uppercase
 *    letters (H, L, L, W, R, L), not five. Under the ORIGINAL expected
 *    value, the CORRECT combo itself would have failed its own first
 *    test — the exact self-defeating class of bug caught in L82 Round 6
 *    and elsewhere. Fixed by correcting the expected output (and the
 *    mission brief's matching claim) to `Uppercase: 6`, re-verified by
 *    hand-trace and by the Node-sim harness.
 *
 * All five other missions' test batteries — including Mission 3's and
 * Mission 6's four-zone ordering distractors, Mission 4's password
 * validator's two independent (non-chained) per-iteration checks, and
 * Mission 5's Scanner+chained-charAt four-zone classifier — check out
 * exactly as specified.
 *
 * New evaluator vocabulary beyond L85/L87's cascade (all needed for
 * this level's own missions, confirmed necessary by hand-tracing before
 * writing any evaluator code):
 *  - Chained `sc.nextLine().charAt(idx)` (Mission 5) — reintroduced
 *    from L82 (L85's own Scanner mission split the read and the charAt
 *    into two statements, so it didn't need the chained form; this
 *    level's Mission 5 skeleton chains them directly).
 *  - A comma-separated declaration with FOUR variables in one line
 *    (`int upper = 0, lower = 0, digits = 0, other = 0;`, Mission 6) —
 *    the existing top-level-comma declaration handler (built for two
 *    variables in L85) is already fully general in the number of
 *    variables, so no new capability was needed here, only hand-
 *    verification that it scales.
 *  - ALL THREE Character methods now drive their own rig instrument
 *    (L86 kept isDigit/isLetter silent since isUpperCase was the sole
 *    subject there; L87 already staged all three for its tuning rig —
 *    this level reuses that same three-instrument choreography).
 *  - Two independent (non-chained) braceless `if` statements against
 *    the SAME loop iteration (Mission 4's `if (upperCheck) hasUpper =
 *    true;` immediately followed by a separate `if (digitCheck)
 *    hasDigit = true;`) — the gated-chain lookahead (built in L84,
 *    reused since) already correctly leaves a bare `if` untouched
 *    since it only continues a chain on `else if`/`else`.
 *  - Soft-wrapped multi-line statement joining (Mission 6's println
 *    split across two physical lines) — ported forward from L85.
 */

import Phaser from "phaser";
import { GameManager } from "../../../../GameManager.js";
import { WellbeingAPI } from "../../../../../api/api.js";
import { BadgeSystem } from "../../../../BadgeSystem.js";

const W = 1280, H = 720;

const C_CYAN = 0x4fc3f7, C_GOLD = 0xffd740, C_ORANGE = 0xff9800, C_BLUE_GRAY = 0x8ea6c8;
const C_GREEN_BRIGHT = 0x00e676, C_RED = 0xf44336, C_GRAY = 0x78909c, C_SILVER = 0xc0c0c0;
const HEX_CYAN = "#4fc3f7", HEX_GOLD = "#ffd740", HEX_ORANGE = "#ff9800", HEX_BLUE_GRAY = "#8ea6c8";
const HEX_GREEN_BRIGHT = "#00e676", HEX_RED = "#f44336", HEX_GRAY = "#78909c", HEX_SILVER = "#c0c0c0";
const C_INDIGO = 0x3949ab, HEX_INDIGO = "#3949ab";
const C_BLUE_LETTER = 0x4fc3f7, HEX_BLUE_LETTER = "#4fc3f7";
const C_WHITE_BLUE = 0xe8eaf6, HEX_WHITE_BLUE = "#e8eaf6";
const C_DEEP_BLUE = 0x4fc3f7, HEX_DEEP_BLUE = "#4fc3f7";

const CX = 40, CY = 90, CW = 680, CH = 380;
const TAB_H = 34, GUTTER_W = 34, CODE_PAD = 10;
const CODE_X = CX + GUTTER_W + CODE_PAD;
const CODE_Y0 = CY + TAB_H + 14;
const LINE_H = 20;
const PX = 40, PY = 490, PW = 680, PH = 130;
const OX = 760, OY = 80, OW = 460, OH = 250;
const MANIFEST_Y = 316;
const RX = 760, RY = 345, RW = 460, RH = 125;
const BX = 760, BY = 490, BW = 460, BH = 130;
const TUTORIAL_KEY = "level88_tutorial_done";

// Rig internal layout — top row: three instruments; below: containers,
// loop tracker, Scanner tape marker, output ticker.
const TOP_Y0 = OY + 18, TOP_Y1 = OY + 86;
const LOUPE_X0 = OX + 8, LOUPE_X1 = OX + 156;
const LENS_X0 = OX + 162, LENS_X1 = OX + 302;
const CASE_X0 = OX + 308, CASE_X1 = OX + 452;
const CONT_Y0 = OY + 92, CONT_Y1 = OY + 118;
const TRACKER_Y0 = OY + 122, TRACKER_Y1 = OY + 182;
const TAPE_Y = OY + 8;
const TICKER_Y = OY + 200;

// ══════════════════════════════════════════════════════════════
// MISSION CONFIGURATION
// ══════════════════════════════════════════════════════════════
const MISSIONS = [
  // ── Mission 1: The Case Gate ──
  { mission: 1, title: "The Case Gate",
    brief: "Check if a character is uppercase and print the classification.\nFor ch = 'G': Case: UPPER\nFor ch = 'g': Case: lower\nFor ch = '5': Case: not a letter",
    skeleton: [
      "char ch = /* test value */;",
      "",
      "if (<slot:upper>) {",
      '    System.out.println("Case: UPPER");',
      "} else if (<slot:letter>) {",
      '    System.out.println("Case: lower");',
      "} else {",
      '    System.out.println("Case: not a letter");',
      "}",
    ],
    slots: [
      { id: "upper", hint: "narrow test first!" },
      { id: "letter", hint: "broad test second" },
    ],
    palette: [
      { code: "Character.isUpperCase(ch)", correct: true, slotId: "upper" },
      { code: "Character.isLetter(ch)", correct: true, slotId: "letter" },
      { code: "Character.isLetter(ch)", tag: "order_reversed_belief", slotId: "upper" },
      { code: "Character.isUpperCase(ch)", tag: "order_reversed_belief", slotId: "letter" },
      { code: "Character.isDigit(ch)", tag: "wrong_classification_method", slotId: "upper" },
    ],
    tests: [
      { substitutions: { ch: "'G'" }, expectedOutput: "Case: UPPER" },
      { substitutions: { ch: "'g'" }, expectedOutput: "Case: lower" },
      { substitutions: { ch: "'5'" }, expectedOutput: "Case: not a letter" },
    ],
    postMissionNote: "Bit: 'isUpperCase FIRST (narrow), isLetter SECOND (broad catches the rest — only lowercase remains). The reversed order would label ALL letters as \"UPPER\" — uppercase letters match isLetter too. Narrow before broad, the ordering law.'",
    concept: "case_gate_ordering" },

  // ── Mission 2: The Uppercase Counter ──
  { mission: 2, title: "The Uppercase Counter",
    brief: 'Count the uppercase letters in a string.\nFor text = "HeLLo WoRLd": Uppercase: 6',
    skeleton: [
      "String text = /* test value */;",
      "int count = 0;",
      "",
      "for (int i = 0; i < text.length(); i++) {",
      "    if (<slot:check>) {",
      "        count++;",
      "    }",
      "}",
      'System.out.println("Uppercase: " + count);',
    ],
    slots: [{ id: "check", hint: "ONLY uppercase letters" }],
    palette: [
      { code: "Character.isUpperCase(text.charAt(i))", correct: true },
      { code: "Character.isLetter(text.charAt(i))", tag: "isLetter_not_isUpperCase" },
      { code: "Character.isDigit(text.charAt(i))", tag: "wrong_classification_method" },
      { code: "Character.isUpperCase(text)", tag: "isUpperCase_takes_string_belief" },
    ],
    tests: [
      { substitutions: { text: '"HeLLo WoRLd"' }, expectedOutput: "Uppercase: 6" },
      { substitutions: { text: '"hello"' }, expectedOutput: "Uppercase: 0" },
      { substitutions: { text: '"HELLO"' }, expectedOutput: "Uppercase: 5" },
      { substitutions: { text: '"123!@"' }, expectedOutput: "Uppercase: 0" },
    ],
    postMissionNote: "Bit: 'isUpperCase counted 6 capitals in \"HeLLo WoRLd\": H, L, L, W, R, L. The isLetter distractor would have counted ALL 10 letters (capitals AND lowercase). The narrow instrument for the narrow question.'",
    concept: "uppercase_counter" },

  // ── Mission 3: The Four-Zone Classifier (FLAGSHIP — ordering + complete classification) ──
  { mission: 3, title: "The Four-Zone Classifier",
    brief: "Classify a character into EXACTLY one of four zones: Digit, Uppercase, Lowercase, or Symbol.\nFor ch = 'A': Zone: Uppercase\nFor ch = 'a': Zone: Lowercase\nFor ch = '7': Zone: Digit\nFor ch = '#': Zone: Symbol",
    skeleton: [
      "char ch = /* test value */;",
      "String zone;",
      "",
      "if (<slot:z1>) {",
      '    zone = "Digit";',
      "} else if (<slot:z2>) {",
      '    zone = "Uppercase";',
      "} else if (<slot:z3>) {",
      '    zone = "Lowercase";',
      "} else {",
      '    zone = "Symbol";',
      "}",
      'System.out.println("Zone: " + zone);',
    ],
    slots: [
      { id: "z1", hint: "the digit family (separate)" },
      { id: "z2", hint: "uppercase (narrow — before broad!)" },
      { id: "z3", hint: "remaining letters = lowercase" },
    ],
    palette: [
      { code: "Character.isDigit(ch)", correct: true, slotId: "z1" },
      { code: "Character.isUpperCase(ch)", correct: true, slotId: "z2" },
      { code: "Character.isLetter(ch)", correct: true, slotId: "z3" },
      { code: "Character.isLetter(ch)", tag: "four_zone_ordering_wrong", slotId: "z2" },
      { code: "Character.isUpperCase(ch)", tag: "four_zone_ordering_wrong", slotId: "z3" },
      { code: "!Character.isDigit(ch)", tag: "not_digit_is_letter_belief", slotId: "z2" },
    ],
    tests: [
      { substitutions: { ch: "'A'" }, expectedOutput: "Zone: Uppercase" },
      { substitutions: { ch: "'a'" }, expectedOutput: "Zone: Lowercase" },
      { substitutions: { ch: "'7'" }, expectedOutput: "Zone: Digit" },
      { substitutions: { ch: "'#'" }, expectedOutput: "Zone: Symbol" },
      { substitutions: { ch: "' '" }, expectedOutput: "Zone: Symbol" },
    ],
    postMissionNote: "Bit (raising the scepter): 'THE FOUR-ZONE CLASSIFIER — the curriculum's most complete character analysis. isDigit first (the separate family). isUpperCase second (the narrow sub-family). isLetter third (at this point, only lowercase letters remain — uppercase already matched above). The ORDER is the architecture: separate family → narrow → broad → everything else. Four zones, three instruments, one program.'",
    concept: "four_zone_flagship" },

  // ── Mission 4: The Password Validator ──
  { mission: 4, title: "The Password Validator",
    brief: 'Check if a password has at least one uppercase letter AND at least one digit.\nFor pw = "Hello1": Valid password\nFor pw = "hello1": Needs uppercase\nFor pw = "Hello": Needs digit',
    skeleton: [
      "String pw = /* test value */;",
      "boolean hasUpper = false;",
      "boolean hasDigit = false;",
      "",
      "for (int i = 0; i < pw.length(); i++) {",
      "    char ch = pw.charAt(i);",
      "    if (<slot:upperCheck>) hasUpper = true;",
      "    if (<slot:digitCheck>) hasDigit = true;",
      "}",
      "",
      "if (hasUpper && hasDigit) {",
      '    System.out.println("Valid password");',
      "} else if (!hasUpper) {",
      '    System.out.println("Needs uppercase");',
      "} else {",
      '    System.out.println("Needs digit");',
      "}",
    ],
    slots: [
      { id: "upperCheck", hint: "detect uppercase" },
      { id: "digitCheck", hint: "detect digit" },
    ],
    palette: [
      { code: "Character.isUpperCase(ch)", correct: true, slotId: "upperCheck" },
      { code: "Character.isLetter(ch)", tag: "isLetter_not_isUpperCase", slotId: "upperCheck" },
      { code: "Character.isDigit(ch)", correct: true, slotId: "digitCheck" },
      { code: "Character.isLetter(ch)", tag: "wrong_classification_method", slotId: "digitCheck" },
      { code: "Character.isUpperCase(ch)", tag: "wrong_slot_method", slotId: "digitCheck" },
    ],
    tests: [
      { substitutions: { pw: '"Hello1"' }, expectedOutput: "Valid password" },
      { substitutions: { pw: '"hello1"' }, expectedOutput: "Needs uppercase" },
      { substitutions: { pw: '"Hello"' }, expectedOutput: "Needs digit" },
      { substitutions: { pw: '"H1"' }, expectedOutput: "Valid password" },
    ],
    postMissionNote: "Bit: 'Two independent checks — isUpperCase for the uppercase requirement, isDigit for the digit requirement. Both flags must be true for validation. Notice: these are separate if-statements (not else-if) — both can fire on different characters in the same loop. Real password validation, real instruments.'",
    concept: "password_validator" },

  // ── Mission 5: The Input Analyzer (Scanner + all three methods) ──
  { mission: 5, title: "The Input Analyzer",
    brief: 'Read a single character from the user and classify it into one of four zones.\nFor input "A": Zone: Uppercase\nFor input "3": Zone: Digit\nFor input "z": Zone: Lowercase\nFor input "!": Zone: Symbol',
    skeleton: [
      "Scanner sc = new Scanner(System.in);",
      "char input = sc.nextLine().charAt(0);",
      "",
      "if (Character.isDigit(input)) {",
      '    System.out.println("Zone: Digit");',
      "} else if (<slot:upper>) {",
      '    System.out.println("Zone: Uppercase");',
      "} else if (<slot:letter>) {",
      '    System.out.println("Zone: Lowercase");',
      "} else {",
      '    System.out.println("Zone: Symbol");',
      "}",
    ],
    slots: [
      { id: "upper", hint: "the uppercase test (narrow!)" },
      { id: "letter", hint: "the remaining-letters test (broad)" },
    ],
    isCrossWing: true,
    palette: [
      { code: "Character.isUpperCase(input)", correct: true, slotId: "upper" },
      { code: "Character.isLetter(input)", correct: true, slotId: "letter" },
      { code: "Character.isLetter(input)", tag: "order_reversed_belief", slotId: "upper" },
      { code: "Character.isUpperCase(input)", tag: "order_reversed_belief", slotId: "letter" },
      { code: "!Character.isDigit(input)", tag: "not_digit_is_letter_belief", slotId: "upper" },
    ],
    tests: [
      { input: ["A"], expectedOutput: "Zone: Uppercase" },
      { input: ["3"], expectedOutput: "Zone: Digit" },
      { input: ["z"], expectedOutput: "Zone: Lowercase" },
      { input: ["!"], expectedOutput: "Zone: Symbol" },
    ],
    postMissionNote: "Bit: 'Scanner reads, charAt(0) extracts, the four-zone classifier categorizes. isDigit was already placed (the separate family); you placed isUpperCase (narrow) then isLetter (broad). The ordering held — even with live user input. Four wings collaborating on the final analysis.'",
    concept: "input_four_zone" },

  // ── Mission 6: The Grand Census (GRAND CAPSTONE — ALL THREE instruments) ──
  { mission: 6, title: "The Grand Census",
    brief: 'Analyze a string completely: count uppercase letters, lowercase letters, digits, and other characters.\nFor data = "Hello World 2024!": Upper: 2 | Lower: 8 | Digits: 4 | Other: 3',
    skeleton: [
      "String data = /* test value */;",
      "int upper = 0, lower = 0, digits = 0, other = 0;",
      "",
      "for (int i = 0; i < data.length(); i++) {",
      "    char ch = data.charAt(i);",
      "    if (<slot:z1>) {",
      "        digits++;",
      "    } else if (<slot:z2>) {",
      "        upper++;",
      "    } else if (<slot:z3>) {",
      "        lower++;",
      "    } else {",
      "        other++;",
      "    }",
      "}",
      'System.out.println("Upper: " + upper + " | Lower: " + lower',
      '    + " | Digits: " + digits + " | Other: " + other);',
    ],
    slots: [
      { id: "z1", hint: "digits (separate family)" },
      { id: "z2", hint: "uppercase (narrow — before broad!)" },
      { id: "z3", hint: "remaining letters = lowercase" },
    ],
    palette: [
      { code: "Character.isDigit(ch)", correct: true, slotId: "z1" },
      { code: "Character.isUpperCase(ch)", correct: true, slotId: "z2" },
      { code: "Character.isLetter(ch)", correct: true, slotId: "z3" },
      { code: "Character.isLetter(ch)", tag: "four_zone_ordering_wrong", slotId: "z2" },
      { code: "Character.isUpperCase(ch)", tag: "four_zone_ordering_wrong", slotId: "z3" },
      { code: "!Character.isDigit(ch)", tag: "not_digit_is_letter_belief", slotId: "z2" },
    ],
    tests: [
      { substitutions: { data: '"Hello World 2024!"' }, expectedOutput: "Upper: 2 | Lower: 8 | Digits: 4 | Other: 3" },
      { substitutions: { data: '"ABCDE"' }, expectedOutput: "Upper: 5 | Lower: 0 | Digits: 0 | Other: 0" },
      { substitutions: { data: '"12345"' }, expectedOutput: "Upper: 0 | Lower: 0 | Digits: 5 | Other: 0" },
      { substitutions: { data: '"!@# $"' }, expectedOutput: "Upper: 0 | Lower: 0 | Digits: 0 | Other: 5" },
    ],
    isGrandCapstone: true,
    postMissionNote: "Bit (holding the scepter high, crown catching the chandelier light): 'The Grand Census — every character classified, every zone counted, every instrument invoked. isDigit caught the four digits. isUpperCase caught H and W. isLetter caught the eight remaining lowercase letters. The else caught the two spaces and the exclamation mark. Four zones, three instruments, seventeen characters, one complete analysis. Grand Gemologist — the curriculum's final mission is published. Ring the final bell.'",
    concept: "grand_census_capstone" },
];

const MISCONCEPTION_FEEDBACK = {
  four_zone_ordering_wrong: "isLetter in the uppercase slot catches ALL letters — both upper and lowercase. isUpperCase must come BEFORE isLetter. Narrow before broad: the four-zone law.",
  order_reversed_belief: "isUpperCase FIRST, isLetter SECOND. The narrow test must fire before the broad test — otherwise uppercase letters match isLetter and never reach isUpperCase.",
  isLetter_not_isUpperCase: "isLetter counts ALL letters; isUpperCase counts ONLY uppercase. Choose the instrument that matches the question.",
  not_digit_is_letter_belief: "!isDigit includes symbols and spaces. Use isUpperCase for the uppercase test, not a negation of another test.",
  wrong_classification_method: "Each instrument answers ONE question. Don't substitute isDigit for isLetter or isLetter for isUpperCase.",
  isUpperCase_takes_string_belief: "isUpperCase takes CHAR. Extract with charAt.",
  wrong_slot_method: "isUpperCase detects uppercase, isDigit detects digits — don't swap them.",
};


export class Level88Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level88Scene" });
  }

  init() {
    this.currentMission = 0;
    this.score = 0;
    this.lives = 5;
    this.flawlessCount = 0;
    this.runCount = 0;
    this.failedRunCount = 0;
    this.hintCount = 0;
    this.selfCorrectionCount = 0;
    this.orderingProactive = {};
    this.pwClean = {};
    this.inputClean = {};
    this._firstRunMetricsRecorded = {};
    this.attemptLog = [];
    this.missionElements = [];
    this.slotContents = {};
    this.slotDefs = {};
    this.paletteBlocks = [];
    this.wrongBlockHistory = {};
    this.missionStartTime = 0;
    this.missionRunsFailed = 0;
    this.missionHintUsed = false;
    this._runCountAtMissionStart = 0;
    this.inputLocked = true;
    this.gameEnded = false;
    this._alive = true;
  }

  preload() {}

  create() {
    this._alive = true;
    this.createParticleTexture();
    this.createBackground();
    this.createGrandHallInterior();
    this.createWingCrest();
    this.createGrandHallFloor();
    this.createAmbientParticles();
    this.createCodeCanvas();
    this.createBlockPalette();
    this.createRunButton();
    this.createRigWindow();
    this.createMiniLoupe();
    this.createMiniLens();
    this.createMiniCasePrism();
    this.createLoopTracker();
    this.createVariablesStrip();
    this.createMiniScannerTape();
    this.createMiniOutputTicker();
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
    this.updateAmbient(time, delta);
    this.updateCrestPulse(time);
    this.updateChandelierSparkle(time);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // SETUP — THE GRAND HALL INTERIOR
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l88_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l88_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x0a1428).setDepth(0);
  }

  createGrandHallInterior() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x0a1428, 1);
    g.fillRect(0, 0, W, 30);

    // Master classification ledger — gold frame, the finale signal
    g.fillStyle(0x0a1428, 0.6);
    g.lineStyle(3, C_GOLD, 1);
    g.fillRoundedRect(200, 30, 580, 140, 6);
    g.strokeRoundedRect(200, 30, 580, 140, 6);
    g.lineStyle(1, C_GOLD, 0.4);
    g.lineBetween(490, 34, 490, 166);
    this._ledgerEntries = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 6; c++) {
        const ex = 214 + c * 94, ey = 44 + r * 42;
        const color = [C_GOLD, 0xe8dfc8, C_BLUE_LETTER][(r + c) % 3];
        const entry = this.add.rectangle(ex, ey, 78, 8, color, 0.12).setDepth(2);
        this._ledgerEntries.push(entry);
      }
    }

    // Three instrument silhouettes (right wall) — the wing's own toolkit
    this._instrumentSilhouettes = {};
    const loupeSil = this.add.graphics().setDepth(2).setAlpha(0.25);
    loupeSil.lineStyle(2.5, C_GOLD, 1);
    loupeSil.strokeCircle(1130, 120, 18);
    loupeSil.lineBetween(1130 + 13, 120 + 13, 1130 + 24, 120 + 24);
    this._instrumentSilhouettes.loupe = loupeSil;

    const lensSil = this.add.graphics().setDepth(2).setAlpha(0.25);
    lensSil.lineStyle(2.5, C_BLUE_LETTER, 1);
    const s = 16;
    lensSil.strokeTriangle(1170, 165 - s, 1170 + s * 0.87, 165 + s * 0.5, 1170 - s * 0.87, 165 + s * 0.5);
    this._instrumentSilhouettes.lens = lensSil;

    const caseSil = this.add.graphics().setDepth(2).setAlpha(0.25);
    caseSil.lineStyle(2.5, C_WHITE_BLUE, 1);
    const s2 = 15;
    caseSil.strokePoints([{ x: 1130, y: 210 - s2 }, { x: 1130 + s2 * 0.62, y: 210 }, { x: 1130, y: 210 + s2 }, { x: 1130 - s2 * 0.62, y: 210 }], true);
    this._instrumentSilhouettes.case = caseSil;

    // Grand chandelier
    this._chandelierCrystals = [];
    const chG = this.add.graphics().setDepth(3);
    chG.lineStyle(1, C_WHITE_BLUE, 0.4);
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i;
      chG.lineBetween(640, 80, 640 + Math.cos(a) * 30, 80 + Math.sin(a) * 30 + 10);
    }
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i;
      const cx = 640 + Math.cos(a) * 30, cy = 80 + Math.sin(a) * 30 + 10;
      const drop = this.add.circle(cx, cy, 3, C_WHITE_BLUE, 0.5).setDepth(4);
      this._chandelierCrystals.push(drop);
    }
    const centerGem = this.add.circle(640, 80, 6, C_WHITE_BLUE, 0.6).setDepth(4);
    this._chandelierCrystals.push(centerGem);

    // Banner
    const bg = this.add.graphics().setDepth(2);
    bg.fillStyle(0x0a1428, 1);
    bg.lineStyle(1, C_GOLD, 0.6);
    bg.fillRoundedRect(410, 12, 420, 26, 3);
    bg.strokeRoundedRect(410, 12, 420, 26, 3);
    this.add.text(640, 25, "T H E   G R A N D   C L A S S I F I C A T I O N", { font: "bold 15px Georgia", color: HEX_GOLD }).setOrigin(0.5).setAlpha(0.8).setDepth(3);
  }

  updateChandelierSparkle(time) {
    if (!this._chandelierCrystals) return;
    this._chandelierCrystals.forEach((c, i) => {
      c.setAlpha(0.4 + 0.3 * Math.abs(Math.sin(time * 0.0012 + i)));
    });
  }

  createWingCrest() {
    const c = this.add.container(880, 56).setDepth(4);
    const g = this.add.graphics();
    g.lineStyle(1.5, C_SILVER, 1);
    g.fillStyle(0x0e1830, 1);
    g.fillTriangle(-12, -14, 12, -14, 0, 16);
    g.strokeTriangle(-12, -14, 12, -14, 0, 16);
    const loupeIcon = this.add.circle(0, -7, 3, C_GOLD, 0.8);
    const lensIcon = this.add.circle(0, 0, 3, C_BLUE_LETTER, 0.8);
    const caseIcon = this.add.circle(0, 7, 3, C_WHITE_BLUE, 0.8);
    c.add([g, loupeIcon, lensIcon, caseIcon]);
    c.setAlpha(0.4);
    this._wingCrest = { c, g, state: "idle" };
  }

  pulseCrest(state) {
    const s = this._wingCrest;
    s.state = state;
    if (state === "idle") s.c.setAlpha(0.4);
    else if (state === "session") s.c.setAlpha(0.8);
    else if (state === "gold") {
      this.tweens.add({
        targets: s.c, scaleX: 0, duration: 150,
        onComplete: () => {
          s.g.clear();
          s.g.lineStyle(2, C_GOLD, 1);
          s.g.fillStyle(0x1a1a0e, 1);
          s.g.fillTriangle(-12, -14, 12, -14, 0, 16);
          s.g.strokeTriangle(-12, -14, 12, -14, 0, 16);
          s.c.setAlpha(1);
          this.tweens.add({ targets: s.c, scaleX: 1, duration: 150 });
        },
      });
    }
  }

  updateCrestPulse(time) {
    if (!this._wingCrest || this._wingCrest.state !== "session") return;
    this._wingCrest.c.setAlpha(0.6 + Math.abs(Math.sin(time * 0.006)) * 0.4);
  }

  createGrandHallFloor() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x06101e, 1);
    g.fillRect(0, 635, W, 85);
    g.lineStyle(1, 0x0e1830, 0.5);
    g.lineBetween(0, 637, W, 637);
    g.lineStyle(1, C_SILVER, 0.1);
    const fx = 640, fy = 678;
    for (let i = 0; i < 4; i++) {
      const a = (Math.PI / 2) * i + Math.PI / 4;
      g.lineBetween(fx, fy, fx + Math.cos(a) * 60, fy + Math.sin(a) * 20);
    }
    g.strokeCircle(fx, fy, 40);
  }

  createAmbientParticles() {
    this.ambient = [];
    const colors = [C_GOLD, C_SILVER, C_BLUE_LETTER, C_WHITE_BLUE];
    for (let i = 0; i < 10; i++) {
      this.ambient.push(this.add.circle(Phaser.Math.Between(0, W), Phaser.Math.Between(230, 630), 1, Phaser.Utils.Array.GetRandom(colors), Phaser.Math.FloatBetween(0.04, 0.07)).setDepth(2));
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
    const p = this.add.particles(x, y, "l88_dot", {
      speed: { min: 80, max: 240 }, angle: { min: 0, max: 360 }, scale: { start: 0.9, end: 0 }, lifespan: 500,
      tint: [C_GOLD, C_BLUE_LETTER, C_WHITE_BLUE, C_SILVER], emitting: false,
    }).setDepth(95);
    p.explode(count);
    this.time.delayedCall(900, () => p.destroy());
  }

  createFinaleConfetti(x, y, count = 40) {
    const p = this.add.particles(x, y, "l88_dot", {
      speed: { min: 100, max: 280 }, angle: { min: 0, max: 360 }, scale: { start: 1, end: 0 }, lifespan: 700,
      tint: [C_GOLD, C_BLUE_LETTER, C_WHITE_BLUE, C_SILVER], emitting: false,
    }).setDepth(96);
    p.explode(count);
    this.time.delayedCall(1100, () => p.destroy());
  }

  createFireworks(x, y, color) {
    const p = this.add.particles(x, y, "l88_dot", {
      speed: { min: 60, max: 200 }, angle: { min: 0, max: 360 }, scale: { start: 1.1, end: 0 }, lifespan: 1000,
      gravityY: 120, tint: [color], emitting: false,
    }).setDepth(97);
    p.explode(Phaser.Math.Between(20, 30));
    this.time.delayedCall(1200, () => p.destroy());
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
    this.tabFilename = this.add.text(CX + CW - 12, CY + TAB_H / 2, "Grand1.java", { font: "13px Courier New", color: "#546e7a" }).setOrigin(1, 0.5).setDepth(11);

    this.lineHighlight = this.add.rectangle(CX + CW / 2, 0, CW - 4, LINE_H, 0xffab00, 0.06).setDepth(19).setVisible(false);
    this.codeContainer = this.add.container(0, 0).setDepth(20);
  }

  _syntaxTokens(line) {
    const tokens = [];
    const re = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\bimport\b|\bfor\b|\bint\b|\bdouble\b|\bString\b|\bboolean\b|\bchar\b|\bnew\b|\bScanner\b|\bif\b|\belse\b)|(\bCharacter\b|\bInteger\b)|(\.isDigit\b|\.isLetter\b|\.isUpperCase\b|\.charAt\b|\.parseInt\b|\.nextLine\b|\.length\b|\.println\b)|(\bSystem\.out\b|\bSystem\.in\b)|(-?\d+\.\d+|-?\d+)|(>=|<=|==|!=|\+\+|--|&&|!|[+\-*/><?:%])|([(){}\[\];.,=])/g;
    let last = 0, m;
    const plain = (t) => t && tokens.push({ t, c: "#e0e0e0" });
    while ((m = re.exec(line))) {
      if (m.index > last) plain(line.slice(last, m.index));
      if (m[1]) tokens.push({ t: m[1], c: m[1][0] === "'" ? HEX_GOLD : "#4caf50" });
      else if (m[2]) tokens.push({ t: m[2], c: "#6a1b9a" });
      else if (m[3]) tokens.push({ t: m[3], c: HEX_SILVER });
      else if (m[4]) tokens.push({ t: m[4], c: HEX_CYAN });
      else if (m[5]) tokens.push({ t: m[5], c: "#78909c" });
      else if (m[6]) tokens.push({ t: m[6], c: HEX_ORANGE });
      else if (m[7]) tokens.push({ t: m[7], c: "#4caf50" });
      else if (m[8]) tokens.push({ t: m[8], c: "#78909c" });
      last = m.index + m[0].length;
    }
    if (last < line.length) plain(line.slice(last));
    return tokens.length ? tokens : [{ t: line, c: "#e0e0e0" }];
  }

  _isDimmedInfrastructure(rawLine) {
    const t = rawLine.trim();
    return /^Scanner sc = new Scanner/.test(rawLine)
      || /^(int|double|String|char|boolean)\s+\w+\s*=\s*\/\*.*\*\/;\s*$/.test(rawLine)
      || t === "";
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
        const t = this.add.text(CODE_X, y, rawLine, { font: "13px Courier New", color: "#3d4450" }).setAlpha(0.6);
        this.codeContainer.add(t);
        return;
      }

      const parts = rawLine.split(/<slot:(\w+)>/);
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
          const w = 200;
          def.rect = { x, y: y - 2, w, h: 17 };
          this._drawSlotPlaceholder(slotId);
          x += w + 6;
        }
      });
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
    this.add.text(PX + 10, PY + 8, "GRAND GEMOLOGIST'S PARTS", { font: "bold 11px Arial", color: "#3d4450" }).setDepth(11);
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
      draw(C_SILVER);
      const txt = this.add.text(0, 0, label, style).setOrigin(0.5);
      c.add([bg, txt]);
      c.setSize(w, 26);
      c.setData("w", w);
      c.setData("code", def.code);
      c.setData("tag", def.tag || null);
      c.setData("slotId", def.slotId || null);
      c.setData("home", home);
      c.setData("draw", draw);
      c.setData("placedIn", null);
      c.setInteractive({ useHandCursor: true, draggable: true });
      c.on("pointerover", () => { if (!this.inputLocked) draw(0xffab00); });
      c.on("pointerout", () => { if (!this.inputLocked) draw(C_SILVER); });
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
      out[id] = (this.slotContents[id] || []).map((b) => ({ code: b.container.getData("code"), tag: b.container.getData("tag") }));
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
    g.lineStyle(3, C_GOLD, 1);
    g.strokeRoundedRect(OX, OY, OW, OH, 12);
    this.add.text(OX + 10, OY + 6, "GRAND HALL RIG — LIVE", { font: "bold 11px Georgia", color: HEX_GOLD }).setAlpha(0.8).setDepth(11);

    const maskShape = this.make.graphics({ x: 0, y: 0, add: false });
    maskShape.fillRoundedRect(OX + 4, OY + 20, OW - 8, OH - 24, 10);
    this.windowMask = maskShape.createGeometryMask();
    this.rigLayer = this.add.container(0, 0).setDepth(15);
    this.rigLayer.setMask(this.windowMask);

    this.verdictLamp = this.add.circle(OX + OW - 18, OY + 14, 6, C_GRAY).setDepth(20);
  }

  getGemFamily(ch) {
    if (/[0-9]/.test(ch)) return "digit";
    if (/[A-Z]/.test(ch)) return "upper";
    if (/[a-z]/.test(ch)) return "lower";
    return "other";
  }

  getGemColor(family) {
    if (family === "digit") return { fill: C_GOLD, stroke: 0xb8860b };
    if (family === "upper") return { fill: C_WHITE_BLUE, stroke: 0x90caf9 };
    if (family === "lower") return { fill: C_DEEP_BLUE, stroke: 0x1565c0 };
    return { fill: C_GRAY, stroke: 0x455a64 };
  }

  _octPoints(r) {
    const pts = [];
    for (let i = 0; i < 8; i++) { const a = (Math.PI / 4) * i; pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r }); }
    return pts;
  }

  _displayChar(ch) {
    if (ch === " ") return "␣";
    if (ch === "\n") return "⏎";
    if (ch === "\t") return "⇥";
    if (ch === "\0") return "∅";
    const code = ch.charCodeAt(0);
    if (code < 32) return `[${code}]`;
    return ch;
  }

  async _dimOthers(active) {
    const frames = { loupe: this._miniLoupeFrame, lens: this._miniLensFrame, casePrism: this._miniCaseFrame };
    const others = Object.keys(frames).filter((k) => k !== active).map((k) => frames[k]);
    await new Promise((res) => { this.tweens.add({ targets: others, alpha: 0.3, duration: 90, onComplete: res }); });
  }

  async _undimOthers(active) {
    const frames = { loupe: this._miniLoupeFrame, lens: this._miniLensFrame, casePrism: this._miniCaseFrame };
    const others = Object.keys(frames).filter((k) => k !== active).map((k) => frames[k]);
    await new Promise((res) => { this.tweens.add({ targets: others, alpha: 1, duration: 90, onComplete: res }); });
  }

  // ══════════════════════════════════════════════════════════════
  // MINI NUMERAL LOUPE (isDigit)
  // ══════════════════════════════════════════════════════════════

  createMiniLoupe() {
    const cx = (LOUPE_X0 + LOUPE_X1) / 2;
    this._miniLoupeFrame = this.add.graphics();
    this._miniLoupeFrame.lineStyle(1.2, C_SILVER, 0.5);
    this._miniLoupeFrame.strokeRoundedRect(LOUPE_X0, TOP_Y0, LOUPE_X1 - LOUPE_X0, TOP_Y1 - TOP_Y0, 4);
    const t = this.add.text(cx, TOP_Y0 - 9, "LOUPE", { font: "bold 8px Georgia", color: HEX_SILVER }).setOrigin(0.5).setAlpha(0.5);
    this.rigLayer.add([this._miniLoupeFrame, t]);

    this.loupeDynamicLayer = this.add.container(0, 0);
    this.rigLayer.add(this.loupeDynamicLayer);
    this._miniLoupePadY = TOP_Y0 + 32;
    this._miniLoupeRestY = TOP_Y0 + 12;
    this._miniLoupeContainer = this.add.container(cx, this._miniLoupeRestY);
    const lg = this.add.graphics();
    lg.lineStyle(1.4, C_SILVER, 1);
    lg.fillStyle(0x0a1428, 0.5);
    lg.fillCircle(0, 0, 13);
    lg.strokeCircle(0, 0, 13);
    this._miniLoupeContainer.add(lg);
    this.rigLayer.add(this._miniLoupeContainer);

    this._loupeVerdictText = this.add.text(cx, TOP_Y1 - 7, "—", { font: "bold 9px Courier New", color: HEX_GRAY }).setOrigin(0.5);
    this.rigLayer.add(this._loupeVerdictText);
  }

  clearMiniLoupe() {
    this.loupeDynamicLayer.removeAll(true);
    this._loupeVerdictText.setText("—").setColor(HEX_GRAY);
    this._miniLoupeContainer.setY(this._miniLoupeRestY);
  }

  async runMiniLoupe(ch, code, result) {
    await this._dimOthers("loupe");
    const cx = (LOUPE_X0 + LOUPE_X1) / 2;
    const displayCh = ch !== null ? this._displayChar(ch) : `[${code}]`;
    const family = ch !== null ? this.getGemFamily(ch) : "other";
    const colors = this.getGemColor(family);

    const gem = this.add.container(cx, this._miniLoupePadY).setAlpha(0).setScale(0.6).setDepth(21);
    const gg = this.add.graphics();
    const pts = this._octPoints(8);
    gg.fillStyle(colors.fill, 1);
    gg.lineStyle(1, colors.stroke, 1);
    gg.fillPoints(pts, true);
    gg.strokePoints(pts, true);
    const txt = this.add.text(0, 0, displayCh, { font: "bold 9px Courier New", color: "#0a1428" }).setOrigin(0.5);
    if (txt.width > 13) txt.setFontSize(5);
    gem.add([gg, txt]);
    this.loupeDynamicLayer.add(gem);
    this.tweens.add({ targets: gem, alpha: 1, scale: 1, duration: 90 });
    await this.delay(70);

    if (result) {
      gg.clear();
      gg.fillStyle(0xffe082, 1);
      gg.lineStyle(1, colors.stroke, 1);
      gg.fillPoints(pts, true);
      gg.strokePoints(pts, true);
      this._loupeVerdictText.setText("TRUE").setColor(HEX_GREEN_BRIGHT);
    } else {
      this._loupeVerdictText.setText("FALSE").setColor(HEX_GRAY);
    }
    await this.delay(90);
    this.tweens.add({ targets: gem, alpha: 0, duration: 100, delay: 40, onComplete: () => gem.destroy() });
    await this.delay(70);
    await this._undimOthers("loupe");
    return result;
  }

  // ══════════════════════════════════════════════════════════════
  // MINI PRISMATIC LENS (isLetter)
  // ══════════════════════════════════════════════════════════════

  createMiniLens() {
    const cx = (LENS_X0 + LENS_X1) / 2;
    this._miniLensFrame = this.add.graphics();
    this._miniLensFrame.lineStyle(1.2, C_SILVER, 0.5);
    this._miniLensFrame.strokeRoundedRect(LENS_X0, TOP_Y0, LENS_X1 - LENS_X0, TOP_Y1 - TOP_Y0, 4);
    const t = this.add.text(cx, TOP_Y0 - 9, "LENS", { font: "bold 8px Georgia", color: HEX_SILVER }).setOrigin(0.5).setAlpha(0.5);
    this.rigLayer.add([this._miniLensFrame, t]);

    this.lensDynamicLayer = this.add.container(0, 0);
    this.rigLayer.add(this.lensDynamicLayer);
    this._miniLensPadY = TOP_Y0 + 32;
    this._miniLensRestY = TOP_Y0 + 12;
    const s = 9;
    this._lensTriPts = [{ x: 0, y: -s }, { x: s * 0.87, y: s * 0.5 }, { x: -s * 0.87, y: s * 0.5 }];
    this._miniLensContainer = this.add.container(cx, this._miniLensRestY);
    const pg = this.add.graphics();
    pg.fillStyle(0x0a1428, 0.35);
    pg.lineStyle(1.2, C_SILVER, 1);
    pg.fillPoints(this._lensTriPts, true);
    pg.strokePoints(this._lensTriPts, true);
    this._lensGlow = this.add.graphics();
    this._miniLensContainer.add([pg, this._lensGlow]);
    this.rigLayer.add(this._miniLensContainer);

    this._lensVerdictText = this.add.text(cx, TOP_Y1 - 7, "—", { font: "bold 9px Courier New", color: HEX_GRAY }).setOrigin(0.5);
    this.rigLayer.add(this._lensVerdictText);
  }

  clearMiniLens() {
    this.lensDynamicLayer.removeAll(true);
    this._lensVerdictText.setText("—").setColor(HEX_GRAY);
    this._miniLensContainer.setY(this._miniLensRestY);
    if (this._lensGlow) this._lensGlow.clear();
  }

  async runMiniLens(ch, result) {
    await this._dimOthers("lens");
    const cx = (LENS_X0 + LENS_X1) / 2;
    const family = this.getGemFamily(ch);
    const colors = this.getGemColor(family);

    const gem = this.add.container(cx, this._miniLensPadY).setAlpha(0).setScale(0.6).setDepth(21);
    const gg = this.add.graphics();
    const pts = this._octPoints(8);
    gg.fillStyle(colors.fill, 1);
    gg.lineStyle(1, colors.stroke, 1);
    gg.fillPoints(pts, true);
    gg.strokePoints(pts, true);
    const txt = this.add.text(0, 0, this._displayChar(ch), { font: "bold 9px Courier New", color: "#0a1428" }).setOrigin(0.5);
    if (txt.width > 13) txt.setFontSize(5);
    gem.add([gg, txt]);
    this.lensDynamicLayer.add(gem);
    this.tweens.add({ targets: gem, alpha: 1, scale: 1, duration: 90 });
    await this.delay(70);

    if (result) {
      this._lensGlow.clear();
      this._lensGlow.fillStyle(C_BLUE_LETTER, 0.35);
      this._lensGlow.fillPoints(this._lensTriPts, true);
      gg.clear();
      gg.fillStyle(0x82d4ff, 1);
      gg.lineStyle(1, colors.stroke, 1);
      gg.fillPoints(pts, true);
      gg.strokePoints(pts, true);
      this._lensVerdictText.setText("TRUE").setColor(HEX_GREEN_BRIGHT);
    } else {
      this._lensVerdictText.setText("FALSE").setColor(HEX_GRAY);
    }
    await this.delay(90);
    this._lensGlow.clear();
    this.tweens.add({ targets: gem, alpha: 0, duration: 100, delay: 40, onComplete: () => gem.destroy() });
    await this.delay(70);
    await this._undimOthers("lens");
    return result;
  }

  // ══════════════════════════════════════════════════════════════
  // MINI CASE PRISM (isUpperCase)
  // ══════════════════════════════════════════════════════════════

  createMiniCasePrism() {
    const cx = (CASE_X0 + CASE_X1) / 2;
    this._miniCaseFrame = this.add.graphics();
    this._miniCaseFrame.lineStyle(1.2, C_SILVER, 0.5);
    this._miniCaseFrame.strokeRoundedRect(CASE_X0, TOP_Y0, CASE_X1 - CASE_X0, TOP_Y1 - TOP_Y0, 4);
    const t = this.add.text(cx, TOP_Y0 - 9, "CASE PRISM", { font: "bold 8px Georgia", color: HEX_SILVER }).setOrigin(0.5).setAlpha(0.5);
    this.rigLayer.add([this._miniCaseFrame, t]);

    this.caseDynamicLayer = this.add.container(0, 0);
    this.rigLayer.add(this.caseDynamicLayer);
    this._miniCaseGemY = TOP_Y0 + 40;
    this._miniCaseRestY = TOP_Y0 + 16;
    const s = 10;
    this._caseDiamondPts = [{ x: 0, y: -s }, { x: s * 0.62, y: 0 }, { x: 0, y: s }, { x: -s * 0.62, y: 0 }];
    this._miniCaseContainer = this.add.container(cx, this._miniCaseRestY);
    const pg = this.add.graphics();
    pg.fillStyle(0x0a1428, 0.3);
    pg.lineStyle(1.2, C_WHITE_BLUE, 1);
    pg.fillPoints(this._caseDiamondPts, true);
    pg.strokePoints(this._caseDiamondPts, true);
    this._caseGlow = this.add.graphics();
    this._miniCaseContainer.add([pg, this._caseGlow]);
    this.rigLayer.add(this._miniCaseContainer);

    this._caseVerdictText = this.add.text(cx, TOP_Y1 - 7, "—", { font: "bold 9px Courier New", color: HEX_GRAY }).setOrigin(0.5);
    this.rigLayer.add(this._caseVerdictText);
  }

  clearMiniCasePrism() {
    this.caseDynamicLayer.removeAll(true);
    this._caseVerdictText.setText("—").setColor(HEX_GRAY);
    this._miniCaseContainer.setY(this._miniCaseRestY);
    if (this._caseGlow) this._caseGlow.clear();
  }

  async runMiniCasePrism(ch, result) {
    await this._dimOthers("casePrism");
    const cx = (CASE_X0 + CASE_X1) / 2;
    const family = this.getGemFamily(ch);
    const colors = this.getGemColor(family);

    const gem = this.add.container(cx, this._miniCaseGemY).setAlpha(0).setScale(0.6).setDepth(21);
    const gg = this.add.graphics();
    const pts = this._octPoints(8);
    gg.fillStyle(colors.fill, 1);
    gg.lineStyle(1, colors.stroke, 1);
    gg.fillPoints(pts, true);
    gg.strokePoints(pts, true);
    const txt = this.add.text(0, 0, this._displayChar(ch), { font: "bold 9px Courier New", color: "#0a1428" }).setOrigin(0.5);
    if (txt.width > 13) txt.setFontSize(5);
    gem.add([gg, txt]);
    this.caseDynamicLayer.add(gem);
    this.tweens.add({ targets: gem, alpha: 1, scale: 1, duration: 90 });
    await this.delay(70);

    if (family === "upper" || family === "lower") {
      const up = family === "upper";
      const color = up ? C_WHITE_BLUE : C_DEEP_BLUE;
      this._caseGlow.clear();
      this._caseGlow.fillStyle(color, up ? 0.35 : 0.25);
      this._caseGlow.fillPoints(this._caseDiamondPts, true);
      await new Promise((res) => { this.tweens.add({ targets: gem, y: this._miniCaseGemY - (up ? 14 : -5), duration: 100, onComplete: res }); });
      gg.clear();
      gg.fillStyle(up ? 0xf5f7ff : 0x82d4ff, 1);
      gg.lineStyle(1, colors.stroke, 1);
      gg.fillPoints(pts, true);
      gg.strokePoints(pts, true);
      this._caseVerdictText.setText(up ? "UP ↑" : "lo ↓").setColor(up ? HEX_WHITE_BLUE : HEX_DEEP_BLUE);
    } else {
      this._caseVerdictText.setText("other").setColor(HEX_GRAY);
    }
    await this.delay(100);
    this._caseGlow.clear();
    this.tweens.add({ targets: gem, alpha: 0, duration: 100, delay: 40, onComplete: () => gem.destroy() });
    await this.delay(70);
    await this._undimOthers("casePrism");
    return result;
  }

  clearMiniInstruments() {
    this.clearMiniLoupe();
    this.clearMiniLens();
    this.clearMiniCasePrism();
  }

  // ══════════════════════════════════════════════════════════════
  // LOOP TRACKER — 4 columns: char | isDigit | isLetter | isUpperCase
  // ══════════════════════════════════════════════════════════════

  createLoopTracker() {
    const g = this.add.graphics();
    g.lineStyle(1, C_INDIGO, 0.5);
    g.strokeRoundedRect(OX + 8, TRACKER_Y0, OW - 16, TRACKER_Y1 - TRACKER_Y0, 4);
    const t = this.add.text(OX + 12, TRACKER_Y0 + 2, "LOOP TRACKER (ch | dig | let | up)", { font: "bold 8px Georgia", color: HEX_INDIGO }).setAlpha(0.6);
    this.trackerLayer = this.add.container(0, 0);
    this.rigLayer.add([g, t, this.trackerLayer]);
    this._trackerRows = [];
  }

  clearLoopTracker() {
    this.trackerLayer.removeAll(true);
    this._trackerRows = [];
  }

  updateLoopTracker(iteration, ch, isDigitR, isLetterR, isUpperR) {
    const display = ch !== null ? this._displayChar(ch) : "—";
    const b = (v) => (v === undefined ? "·" : v ? "T" : "F");
    const text = `${display} → d:${b(isDigitR)} l:${b(isLetterR)} u:${b(isUpperR)}`;
    const color = isUpperR ? HEX_WHITE_BLUE : isLetterR ? HEX_GREEN_BRIGHT : isDigitR ? HEX_GOLD : HEX_GRAY;
    const t = this.add.text(OX + 14, 0, text, { font: "9px Courier New", color });
    this.trackerLayer.add(t);
    this._trackerRows.push(t);
    if (this._trackerRows.length > 4) {
      const old = this._trackerRows.shift();
      old.destroy();
    }
    this._trackerRows.forEach((r, idx) => { r.setY(TRACKER_Y0 + 12 + idx * 11); });
  }

  // ══════════════════════════════════════════════════════════════
  // MINI SCANNER TAPE
  // ══════════════════════════════════════════════════════════════

  createMiniScannerTape() {
    this.tapeContainer = this.add.container(0, 0).setVisible(false);
    this.rigLayer.add(this.tapeContainer);
    this.tapeState = [];
  }

  activateScannerCameo() { this.tapeContainer.setVisible(true); }

  parkScannerCameo() {
    this.tapeContainer.setVisible(false);
    this.tapeContainer.removeAll(true);
    this.tapeState = [];
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
    const cellW = 4.5, x1 = OX + OW - 10;
    const totalW = Math.min(this.tapeState.length * cellW, 150);
    const startX = x1 - totalW;
    const bg = this.add.graphics();
    bg.fillStyle(0xe8f0e8, 0.85);
    bg.fillRoundedRect(startX - 3, TAPE_Y - 4, totalW + 6, 8, 3);
    this.tapeContainer.add(bg);
    this.tapeState.slice(-Math.floor(totalW / cellW)).forEach((cell, i) => {
      const x = startX + i * cellW + cellW / 2;
      const disp = cell.kind === "space" ? "␣" : cell.kind === "newline" ? "⏎" : cell.ch;
      const color = cell.kind === "space" ? "#c2185b" : cell.kind === "newline" ? "#7b1fa2" : "#2e7d32";
      const t = this.add.text(x, TAPE_Y, disp, { font: "bold 7px Courier New", color }).setOrigin(0.5);
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
    await this.delay(30);
  }

  // ══════════════════════════════════════════════════════════════
  // OUTPUT TICKER
  // ══════════════════════════════════════════════════════════════

  createMiniOutputTicker() {
    const tg = this.add.graphics();
    tg.fillStyle(0x050914, 0.9);
    tg.fillRect(OX + 8, TICKER_Y - 8, OW - 16, 16);
    this.tickerText = this.add.text(OX + 14, TICKER_Y, "", { font: "bold 10px Courier New", color: HEX_GREEN_BRIGHT }).setOrigin(0, 0.5);
    this.rigLayer.add([tg, this.tickerText]);
    this._tickerLines = [];
  }

  async printToTicker(text) {
    this._tickerLines.push(text);
    const joined = this._tickerLines.join(" ⏎ ");
    for (let i = this.tickerText.text.length; i <= joined.length; i++) {
      if (!this._alive) return;
      this.tickerText.setText(joined.slice(0, i));
      if (this.tickerText.width > OW - 26) this.tickerText.setFontSize(6.5);
      await this.delay(4);
    }
  }

  clearTicker() {
    this._tickerLines = [];
    if (this.tickerText) this.tickerText.setText("").setFontSize(8);
  }

  // ══════════════════════════════════════════════════════════════
  // VARIABLES STRIP — horizontal readout (char silver, boolean cyan,
  // int gold, String cream)
  // ══════════════════════════════════════════════════════════════

  createVariablesStrip() {
    const hdr = this.add.text(OX + 12, CONT_Y0 - 9, "VARIABLES", { font: "bold 8px Georgia", color: HEX_SILVER }).setAlpha(0.6);
    const frameG = this.add.graphics();
    frameG.lineStyle(1.2, C_SILVER, 0.5);
    frameG.strokeRoundedRect(OX + 8, CONT_Y0, OW - 16, CONT_Y1 - CONT_Y0, 4);
    this.varsContainer = this.add.container(0, 0);
    this.rigLayer.add([frameG, hdr, this.varsContainer]);
  }

  clearVariablesStrip() { this.varsContainer.removeAll(true); }

  updateVariablesStrip(vars) {
    this.varsContainer.removeAll(true);
    let idx = 0, x = OX + 14;
    for (const name in vars) {
      const v = vars[name];
      if (v.type === "Scanner") continue;
      let display;
      if (v.value === undefined) display = "?";
      else if (v.type === "String") display = `"${v.value}"`;
      else if (v.type === "char") display = `'${this._displayChar(v.value)}'`;
      else display = String(v.value);
      const text = `${name}=${display}`.slice(0, 14);
      const color = v.type === "boolean" ? HEX_CYAN : v.type === "int" ? HEX_GOLD : v.type === "char" ? HEX_SILVER : "#e0e6f0";
      const t = this.add.text(x, CONT_Y0 + (CONT_Y1 - CONT_Y0) / 2, text, { font: "bold 6.5px Courier New", color }).setOrigin(0, 0.5);
      this.varsContainer.add(t);
      x += t.width + 10;
      idx++;
      if (idx >= 7 || x > OX + OW - 20) break;
    }
  }

  // ══════════════════════════════════════════════════════════════
  // MANIFEST STRIP / RESULT ROW
  // ══════════════════════════════════════════════════════════════

  createManifestStrip() {
    const g = this.add.graphics().setDepth(16);
    g.fillStyle(0x0f0a06, 0.92);
    g.fillRect(OX, MANIFEST_Y - 2, OW, 20);
    this.manifestStripText = this.add.text(OX + 8, MANIFEST_Y + 8, "", { font: "12px Arial", color: HEX_SILVER }).setOrigin(0, 0.5).setDepth(17);
    this.resultText = this.add.text(OX + OW - 8, MANIFEST_Y + 8, "—", { font: "bold 13px Courier New", color: HEX_GRAY }).setOrigin(1, 0.5).setDepth(17);
  }
  updateManifestStrip(text) { this.manifestStripText.setText(text); }

  updateResultRow(value, type) {
    if (!this.resultText) return;
    if (value === null) { this.resultText.setText("—").setColor(HEX_GRAY); return; }
    if (type === "crash") { this.resultText.setText("✗ ERROR").setColor(HEX_RED); return; }
    if (type === "void") { this.resultText.setText("void").setColor(HEX_GRAY); return; }
    this.resultText.setText(`→ ${value}`).setColor(HEX_GOLD);
  }

  // ══════════════════════════════════════════════════════════════
  // TEST REPORT / MISSION BRIEF
  // ══════════════════════════════════════════════════════════════

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
    if (test.input) return `in: ${test.input.join(",")}`;
    if (test.substitutions) return Object.entries(test.substitutions).map(([k, v]) => `${k}=${v}`).join(", ").slice(0, 26);
    return "";
  }

  buildReportRows(mission) {
    this.reportRows.forEach((r) => r.container.destroy());
    this.reportRows = [];
    mission.tests.forEach((test, i) => {
      const y = RY + 24 + i * 24;
      const c = this.add.container(RX + 10, y).setDepth(11).setAlpha(0.35);
      const inputT = this.add.text(0, 0, this._compactTestLabel(test), { font: "11px Courier New", color: "#b0bec5" }).setOrigin(0, 0.5);
      const expT = this.add.text(190, 0, test.expectedOutput.replace(/⏎/g, " / ").slice(0, 22), { font: "11px Courier New", color: "#78909c" }).setOrigin(0, 0.5);
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
    g.fillStyle(0x0a0d18, 1);
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
    const brief = this.add.text(BX + 14, BY + 42, mission.brief, { font: "10.5px Arial", color: "#90a4ae", wordWrap: { width: BW - 28 } }).setOrigin(0, 0);
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

    this.add.text(20, 14, "THE GRAND CLASSIFICATION", { font: "bold 15px Georgia", color: "#b0bec5" }).setDepth(51);
    this.add.text(20, 32, "Restructuring Phase — Character Methods: isUpperCase()", { font: "12px Arial", color: "#546e7a" }).setDepth(51);

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
      const pts = [];
      for (let a = 0; a < 6; a++) { const ang = (Math.PI / 3) * a; pts.push({ x: Math.cos(ang) * 7, y: Math.sin(ang) * 7 }); }
      lg.fillStyle(C_SILVER, 0.85);
      lg.lineStyle(1, 0x8a6435, 1);
      lg.fillPoints(pts, true);
      lg.strokePoints(pts, true);
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
  // BIT — GRAND GEMOLOGIST VARIANT (vest + monocle kept, grand
  // gemologist's crown with three gems, classification scepter)
  // ══════════════════════════════════════════════════════════════

  createBit() {
    const c = this.add.container(90, 560).setDepth(60);
    const g = this.add.graphics();
    g.lineStyle(2, 0x78909c, 1);
    g.lineBetween(0, -17, 0, -32);
    g.fillStyle(0x37474f, 1);
    g.fillRoundedRect(-20, -17, 40, 35, 10);
    const eye = this.add.circle(0, 0, 8, C_CYAN);
    const pupil = this.add.circle(0, 0, 3, 0xffffff);
    const vest = this.add.graphics();
    vest.fillStyle(0x0e1830, 0.9);
    vest.lineStyle(1, C_SILVER, 0.8);
    vest.fillTriangle(-15, -12, 15, -12, 0, 14);
    vest.strokeTriangle(-15, -12, 15, -12, 0, 14);

    // Grand gemologist's crown — a tiara with three gems (gold/blue/white-blue)
    const crownG = this.add.graphics();
    crownG.lineStyle(1.3, C_GOLD, 1);
    crownG.beginPath();
    crownG.moveTo(-13, -30);
    crownG.lineTo(-13, -36);
    crownG.lineTo(-7, -32);
    crownG.lineTo(0, -38);
    crownG.lineTo(7, -32);
    crownG.lineTo(13, -36);
    crownG.lineTo(13, -30);
    crownG.strokePath();
    this._crownGemGold = this.add.circle(-7, -33, 1.6, C_GOLD, 0.9);
    this._crownGemBlue = this.add.circle(0, -36, 1.8, C_BLUE_LETTER, 0.9);
    this._crownGemWhite = this.add.circle(7, -33, 1.6, C_WHITE_BLUE, 0.9);

    const monocle = this.add.container(6, -26);
    const monG = this.add.graphics();
    monG.lineStyle(1.3, C_SILVER, 0.8);
    monG.strokeCircle(0, 0, 5.5);
    monG.lineStyle(1, C_SILVER, 0.5);
    monG.lineBetween(4, 4, 10, 14);
    monG.fillStyle(0xe8eaf6, 0.15);
    monG.fillCircle(0, 0, 5);
    const monHighlight = this.add.circle(-2, -2, 1.2, 0xffffff, 0.6);
    monocle.add([monG, monHighlight]);

    const gloveL = this.add.circle(-16, 10, 4, 0xffffff, 0).setStrokeStyle(1, 0xe8eaf6, 0.7);

    // Classification scepter — silver rod, fused three-instrument tip
    const scepter = this.add.container(17, 10);
    const scG = this.add.graphics();
    scG.lineStyle(1.4, C_SILVER, 1);
    scG.lineBetween(-2, 12, 3, -10);
    scG.fillStyle(C_GOLD, 0.9);
    scG.fillCircle(3, -12, 1.6);
    scG.fillStyle(C_BLUE_LETTER, 0.9);
    scG.fillCircle(5, -9, 1.4);
    scG.fillStyle(C_WHITE_BLUE, 0.9);
    scG.fillCircle(1, -9, 1.4);
    scepter.add(scG);

    c.add([g, vest, crownG, this._crownGemGold, this._crownGemBlue, this._crownGemWhite, eye, pupil, monocle, gloveL, scepter]);
    this.tweens.add({ targets: [this._crownGemGold, this._crownGemBlue, this._crownGemWhite], alpha: 0.4, duration: 900, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: c, y: "+=3", duration: 1500, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
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
    g.lineStyle(1.5, C_SILVER, 1);
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
    await this.bitSay("The Grand Classification, Gemologist — the curriculum's final hall. Three instruments, three trilogies, one complete toolkit. Tonight you BUILD the programs that classify EVERY character into its exact zone: digit, uppercase letter, lowercase letter, or other. No ambiguity, no imprecision, no missed category. The wing — and the curriculum — seal at dawn.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(6000)]); if (!A()) return;
    this.hideBubble();

    const a1 = this.floatingAnnotation(CX + CW / 2, CY - 16, "the complete analysis program", HEX_CYAN);
    await this.delay(400); if (!A()) return;
    const a2 = this.floatingAnnotation(PX + PW / 2, PY - 12, "blocks — one orders broad before narrow, one uses the wrong instrument", HEX_GRAY);
    await this.delay(400); if (!A()) return;
    const a3 = this.floatingAnnotation(OX + OW / 2, OY - 12, "ALL THREE instruments live — the full toolkit", HEX_GREEN_BRIGHT);
    await this.delay(400); if (!A()) return;
    const a4 = this.floatingAnnotation(880, 44, "the final crest watches", HEX_GOLD);
    await this.delay(400); if (!A()) return;
    const a5 = this.floatingAnnotation(RX + RW / 2, RY - 12, "every scenario must verify", HEX_BLUE_GRAY);
    await this.delay(400); if (!A()) return;

    await this.bitSay("The grand hall's three laws: narrow before broad — isUpperCase before isLetter, always; each instrument answers ONE question — don't substitute; and the four-zone classifier covers every character. Build, run, verify, repair. The final seal awaits.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(6000)]); if (!A()) return;
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
    g.fillStyle(0x0e1830, 1);
    g.fillRoundedRect(-260, -105, 520, 210, 12);
    g.lineStyle(2, C_GOLD, 1);
    g.strokeRoundedRect(-260, -105, 520, 210, 12);
    g.fillStyle(C_GOLD, 1);
    g.fillRect(-260, -105, 5, 210);
    const badge = this.add.circle(-225, -75, 18, C_GOLD);
    const badgeNum = this.add.text(-225, -75, String(mission.mission), { font: "bold 18px Arial", color: "#0a0e14" }).setOrigin(0.5);
    const title = this.add.text(-195, -85, mission.title, { font: "bold 21px Arial", color: "#ffffff" }).setOrigin(0, 0.5);
    const desc = this.add.text(-225, -35, mission.brief, { font: "12.5px Arial", color: "#b0bec5", wordWrap: { width: 460 } }).setOrigin(0, 0);

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

    this.tabFilename.setText(`Grand${mission.mission}.java`);
    this.renderSkeleton(mission);
    this.populatePalette(mission);
    this.buildReportRows(mission);
    this.renderMissionBrief(mission);
    this.disableRunButton();
    this.highlightCodeLine(null);
    this.verdictLamp.setFillStyle(C_GRAY);
    this.clearMiniInstruments();
    this.clearLoopTracker();
    this.clearTicker();
    this.clearVariablesStrip();
    this.parkScannerCameo();
    this.updateManifestStrip("");
    this.updateResultRow(null, null);
    this.pulseCrest("idle");

    if (mission.isCrossWing) this.activateScannerCameo();

    this.inputLocked = false;
  }

  clearMission() {
    this.missionElements.forEach((e) => { if (e && e.destroy) e.destroy(); });
    this.missionElements = [];
  }

  buildProgramItems(mission, assembled) {
    const out = [];
    mission.skeleton.forEach((rawLine) => {
      const slotMatches = [...rawLine.matchAll(/<slot:(\w+)>/g)];
      if (slotMatches.length > 0) {
        let text = rawLine;
        slotMatches.forEach((sm) => {
          const slotId = sm[1];
          const code = assembled[slotId] && assembled[slotId][0] ? assembled[slotId][0].code : "";
          text = text.split(`<slot:${slotId}>`).join(code);
        });
        out.push(text);
      } else {
        out.push(rawLine);
      }
    });
    return out;
  }

  _substituteTestLine(line, test) {
    const m = line.match(/^(int|double|String|char|boolean)\s+(\w+)\s*=\s*\/\*[^*]*\*\/;$/);
    if (!m) return line;
    const type = m[1], name = m[2];
    if (!test.substitutions || !(name in test.substitutions)) return line;
    return `${type} ${name} = ${test.substitutions[name]};`;
  }

  /** Merges any line not ending in `;`, `{`, or `}` into the next
   * line(s) until a terminator is found — undoes soft-wrapping (M6's
   * three-line println). */
  _joinWrappedLines(lines) {
    const out = [];
    let buffer = null;
    for (const raw of lines) {
      const trimmed = raw.trim();
      if (buffer !== null) {
        buffer += " " + trimmed;
        if (/[;{}]$/.test(trimmed) || trimmed === "") { out.push(buffer); buffer = null; }
        continue;
      }
      if (trimmed === "" || /[;{}]$/.test(trimmed) || trimmed.startsWith("//")) {
        out.push(raw);
      } else {
        buffer = trimmed;
      }
    }
    if (buffer !== null) out.push(buffer);
    return out;
  }

  // ══════════════════════════════════════════════════════════════
  // PROACTIVE-METRIC DETECTION
  // ══════════════════════════════════════════════════════════════

  _recordFirstRunMetrics(mission) {
    const key = `mission${mission.mission}`;
    if (this._firstRunMetricsRecorded[key]) return;
    this._firstRunMetricsRecorded[key] = true;

    if (mission.mission === 3 || mission.mission === 6) {
      this.orderingProactive[key] = this._slotCode("z1") === "Character.isDigit(ch)" && this._slotCode("z2") === "Character.isUpperCase(ch)" && this._slotCode("z3") === "Character.isLetter(ch)";
    }
    if (mission.mission === 4) {
      this.pwClean[key] = this._slotCode("upperCheck") === "Character.isUpperCase(ch)" && this._slotCode("digitCheck") === "Character.isDigit(ch)";
    }
    if (mission.mission === 5) {
      this.inputClean[key] = this._slotCode("upper") === "Character.isUpperCase(input)" && this._slotCode("letter") === "Character.isLetter(input)";
    }
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

  _pulseWrongBlocks() {
    for (const id in this.slotContents) {
      const placed = this.slotContents[id] && this.slotContents[id][0];
      if (!placed || !placed.container.getData("tag")) continue;
      const c = placed.container;
      const draw = c.getData("draw");
      if (draw) draw(C_RED);
      this.tweens.add({ targets: c, x: c.x + 4, duration: 40, yoyo: true, repeat: 5 });
      this.time.delayedCall(1400, () => { if (c.active && draw) draw(C_SILVER); });
    }
  }

  async onRunPressed() {
    if (this.inputLocked) return;
    this.inputLocked = true;
    this.disableRunButton();
    this.runButton.t.setText("...");
    this.runCount++;
    this.pulseCrest("session");
    const mission = MISSIONS[this.currentMission];
    const isFirstRun = this.runCount === this._runCountAtMissionStart + 1;
    const assembled = this.getAssembledCode();
    const wrongBlocksUsed = this._collectWrongBlocksUsed();

    const items = this.buildProgramItems(mission, assembled);

    let anyMismatch = false, anyCrash = false;
    const failedTests = [];
    for (let i = 0; i < mission.tests.length; i++) {
      if (!this._alive) return;
      const test = mission.tests[i];
      const outcome = await this.runTestCase(mission, test, i, items);
      if (!outcome.pass) { anyMismatch = true; failedTests.push(this._compactTestLabel(test)); }
      if (outcome.crashed) anyCrash = true;
    }

    if (isFirstRun) this._recordFirstRunMetrics(mission);
    const resultKind = anyMismatch ? (anyCrash ? "runtime_crash" : "logic_fail") : "pass";
    this._resolveRunOutcome(mission, resultKind, wrongBlocksUsed, failedTests);
  }

  async runTestCase(mission, test, index, items) {
    this.clearMiniInstruments();
    this.clearLoopTracker();
    this.clearTicker();
    this.clearVariablesStrip();
    this.updateManifestStrip("");
    this.updateResultRow(null, null);

    if (mission.isCrossWing) { this.parkScannerCameo(); this.activateScannerCameo(); this.loadMiniTape(test.input); }

    this._printedLines = [];
    const substituted = items.map((it) => this._substituteTestLine(it, test));
    const execLines = this._joinWrappedLines(substituted);
    const runResult = await this.runStatements(execLines, {});
    if (!this._alive) return { pass: false, crashed: false };

    const output = this._printedLines.join("⏎");
    const pass = runResult.ok && output === test.expectedOutput;
    this.verdictLamp.setFillStyle(pass ? C_GREEN_BRIGHT : C_RED);
    this.updateReportRow(index, pass);
    await this.delay(180);
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
      GameManager.fusionEngine.checkBehavioral(prediction);
    } catch (e) {
      console.warn("Level88Scene: /api/wellbeing/predict-struggle unreachable, skipping behavioral signal for this level:", e);
    }
  }

  _resolveRunOutcome(mission, result, wrongBlocksUsed, failedTests) {
    const timeMs = Math.round(this.time.now - this.missionStartTime);
    this.attemptLog.push({
      mission: mission.mission, runNumber: this.runCount, result,
      blocksUsed: Object.values(this.getAssembledCode()).flat().map((b) => b.code),
      wrongBlocks: wrongBlocksUsed, failedTests, timeMs, hintUsedBefore: this.missionHintUsed,
    });

    if (result === "pass") { this.onMissionComplete(); return; }

    this.pulseCrest("idle");
    this.failedRunCount++;
    this.missionRunsFailed++;
    this.runButton.t.setText("▶ RUN");
    this._pulseWrongBlocks();

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
    this.showBitFeedback("Reread the brief carefully — narrow before broad, and match each instrument to its own question.");
  }

  onMissionComplete() {
    if (this.currentMission === 2) this.runBehavioralCheck();
    if (this.gameEnded) return;
    const mission = MISSIONS[this.currentMission];
    const flawless = this.missionRunsFailed === 0 && !this.missionHintUsed;
    if (flawless) this.flawlessCount++;
    this.updateScore(250 + (flawless ? 100 : 0));
    if (flawless) this.createFloatingText(OX + OW / 2, OY - 14, "FLAWLESS +100", HEX_GOLD, "bold 16px Arial");
    this.pulseCrest("gold");

    this.missionFanfare().then(() => {
      if (!this._alive || this.gameEnded) return;
      if (mission.isGrandCapstone) {
        this.gameEnded = true;
        this.inputLocked = true;
        this.clearMission();
        this.hideBubble();
        this.saveGrandResults();
        this.triggerWingFinaleCeremony();
        return;
      }
      const next = this.currentMission + 1;
      this.showProjectBriefing(next);
    });
  }

  saveGrandResults() {
    try {
      localStorage.setItem("level88_results", JSON.stringify({
        level: 88, concept: "character_isUpperCase", phase: "restructuring",
        score: this.score, missionsCompleted: 6, flawlessMissions: this.flawlessCount,
        totalRuns: this.runCount, failedRuns: this.failedRunCount, hintsUsed: this.hintCount,
        selfCorrections: this.selfCorrectionCount,
        fourZoneOrderingProactive: this.orderingProactive,
        passwordValidatorClean: this.pwClean,
        inputAnalyzerClean: this.inputClean,
        livesRemaining: this.lives, attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}
    try { GameManager.completeLevel(87, Math.round((this.flawlessCount / MISSIONS.length) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("character_isUpperCase_mastery"); } catch (_) {}
    try { BadgeSystem.unlock("character_wing_complete"); } catch (_) {}
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
    this._ledgerEntries.forEach((e, idx) => {
      if (idx % 6 === this.currentMission) this.tweens.add({ targets: e, fillAlpha: 0.4, duration: 200, yoyo: true, repeat: 1 });
    });
    const mission = MISSIONS[this.currentMission];
    await this.bitSay(mission.postMissionNote || "Clean certification — the rig confirms it.");
    await Promise.race([this.waitForClick(), this.delay(2400)]);
    this.hideBubble();
    await this.delay(400);
  }

  // ══════════════════════════════════════════════════════════════
  // UNIFIED INTERPRETER — the curriculum's final evaluator. ALL THREE
  // Character methods (isDigit, isLetter, isUpperCase) each drive
  // their own rig instrument. Reintroduces L82's chained
  // `sc.nextLine().charAt(idx)` (Mission 5) alongside L85's comma-
  // separated multi-variable declaration (now exercised with FOUR
  // variables, Mission 6), L84's generalized bare reassignment, the
  // gated braceless if/else-if/else chain, the N-branch braced block
  // chain, and L85's soft-wrapped multi-line statement joining.
  // ══════════════════════════════════════════════════════════════

  _splitRelational(expr) {
    let depth = 0, inQuotes = false;
    for (let i = 0; i < expr.length; i++) {
      const ch = expr[i];
      if ((ch === '"' || ch === "'") && expr[i - 1] !== "\\") inQuotes = !inQuotes;
      if (inQuotes) continue;
      if (ch === "(" || ch === "[") depth++;
      else if (ch === ")" || ch === "]") depth--;
      else if (depth === 0) {
        const two = expr.slice(i, i + 2);
        if (two === ">=" || two === "<=" || two === "==" || two === "!=") {
          return { left: expr.slice(0, i).trim(), op: two, right: expr.slice(i + 2).trim() };
        }
        if (ch === ">" || ch === "<") {
          return { left: expr.slice(0, i).trim(), op: ch, right: expr.slice(i + 1).trim() };
        }
      }
    }
    return null;
  }

  _splitLogicalAnd(expr) {
    const parts = [];
    let cur = "", depth = 0, inQuotes = false;
    for (let i = 0; i < expr.length; i++) {
      const ch = expr[i];
      if ((ch === '"' || ch === "'") && expr[i - 1] !== "\\") inQuotes = !inQuotes;
      if (!inQuotes) {
        if (ch === "(" || ch === "[") depth++;
        else if (ch === ")" || ch === "]") depth--;
        else if (depth === 0 && expr.slice(i, i + 2) === "&&") {
          parts.push(cur.trim());
          cur = "";
          i++;
          continue;
        }
      }
      cur += ch;
    }
    parts.push(cur.trim());
    return parts.length > 1 ? parts : null;
  }

  _splitAdditive(expr) {
    const parts = [];
    let cur = "", inQuotes = false, depth = 0, curOp = null;
    for (let i = 0; i < expr.length; i++) {
      const ch = expr[i];
      if ((ch === '"' || ch === "'") && expr[i - 1] !== "\\") inQuotes = !inQuotes;
      if (!inQuotes) {
        if (ch === "(" || ch === "[") depth++;
        else if (ch === ")" || ch === "]") depth--;
        else if ((ch === "+" || ch === "-") && depth === 0 && i > 0) {
          parts.push({ op: curOp, text: cur.trim() });
          cur = ""; curOp = ch;
          continue;
        }
      }
      cur += ch;
    }
    parts.push({ op: curOp, text: cur.trim() });
    return parts.length > 1 ? parts : null;
  }

  _splitTopLevelComma(s) {
    const parts = [];
    let cur = "", depth = 0, inQuotes = false;
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if ((ch === '"' || ch === "'") && s[i - 1] !== "\\") inQuotes = !inQuotes;
      if (!inQuotes) {
        if (ch === "(" || ch === "[") depth++;
        else if (ch === ")" || ch === "]") depth--;
        else if (ch === "," && depth === 0) { parts.push(cur); cur = ""; continue; }
      }
      cur += ch;
    }
    parts.push(cur);
    return parts;
  }

  _javaToString(value, type) {
    if (type === "double") return Number.isInteger(value) ? `${value}.0` : String(value);
    return String(value);
  }

  async resolveExpr(expr, vars) {
    const t = expr.trim();

    const andParts = this._splitLogicalAnd(t);
    if (andParts) {
      for (const part of andParts) {
        const r = await this.resolveExpr(part, vars);
        if (!r.ok) return r;
        if (r.type !== "boolean") { this.showCompileErrorStamp(); return { ok: false, crash: "compile" }; }
        if (!r.value) return { ok: true, value: false, type: "boolean" };
      }
      return { ok: true, value: true, type: "boolean" };
    }

    const rel = this._splitRelational(t);
    if (rel) {
      const l = await this.resolveExpr(rel.left, vars);
      if (!l.ok) return l;
      const r = await this.resolveExpr(rel.right, vars);
      if (!r.ok) return r;
      const toNum = (res) => (res.type === "char" ? res.value.charCodeAt(0) : Number(res.value));
      const lv = toNum(l), rv = toNum(r);
      let result;
      if (rel.op === ">") result = lv > rv;
      else if (rel.op === "<") result = lv < rv;
      else if (rel.op === ">=") result = lv >= rv;
      else if (rel.op === "<=") result = lv <= rv;
      else if (rel.op === "==") result = lv === rv;
      else result = lv !== rv;
      return { ok: true, value: result, type: "boolean" };
    }

    const addParts = this._splitAdditive(t);
    if (addParts) {
      let accValue = null, accIsString = false, accType = null;
      for (let i = 0; i < addParts.length; i++) {
        const { op, text } = addParts[i];
        let partVal, partType;
        if (/^".*"$/.test(text)) { partVal = text.slice(1, -1); partType = "String"; }
        else {
          const r = await this.resolveExpr(text, vars);
          if (!r.ok) return r;
          partVal = r.value; partType = r.type;
        }
        if (i === 0) {
          accValue = partVal; accIsString = partType === "String"; accType = partType;
        } else if (accIsString || partType === "String") {
          const accStr = accIsString ? String(accValue) : this._javaToString(accValue, accType);
          const partStr = partType === "String" ? String(partVal) : this._javaToString(partVal, partType);
          accValue = accStr + partStr;
          accIsString = true;
        } else {
          const numVal = op === "-" ? -Number(partVal) : Number(partVal);
          accValue = Number(accValue) + numVal;
          accType = (accType === "double" || partType === "double") ? "double" : "int";
        }
      }
      return { ok: true, value: accValue, type: accIsString ? "String" : accType };
    }

    if (t[0] === "!" && t[1] !== "=") {
      const inner = await this.resolveExpr(t.slice(1).trim(), vars);
      if (!inner.ok) return inner;
      if (inner.type !== "boolean") { this.showCompileErrorStamp(); return { ok: false, crash: "compile" }; }
      return { ok: true, value: !inner.value, type: "boolean" };
    }

    const isDigitMatch = t.match(/^Character\.isDigit\((.+)\)$/);
    if (isDigitMatch) {
      const argRes = await this.resolveExpr(isDigitMatch[1].trim(), vars);
      if (!argRes.ok) return argRes;
      if (argRes.type !== "char") { this.showCompileErrorStamp(); return { ok: false, crash: "compile" }; }
      const code = argRes.value.charCodeAt(0);
      const result = code >= 48 && code <= 57;
      await this.runMiniLoupe(argRes.value, code, result);
      this._lastDigitResult = result;
      this.updateResultRow("boolean");
      return { ok: true, value: result, type: "boolean" };
    }

    const isLetterMatch = t.match(/^Character\.isLetter\((.+)\)$/);
    if (isLetterMatch) {
      const argRes = await this.resolveExpr(isLetterMatch[1].trim(), vars);
      if (!argRes.ok) return argRes;
      if (argRes.type !== "char") { this.showCompileErrorStamp(); return { ok: false, crash: "compile" }; }
      const result = /[A-Za-z]/.test(argRes.value);
      await this.runMiniLens(argRes.value, result);
      this._lastLetterResult = result;
      this.updateResultRow("boolean");
      return { ok: true, value: result, type: "boolean" };
    }

    const isUpperCaseMatch = t.match(/^Character\.isUpperCase\((.+)\)$/);
    if (isUpperCaseMatch) {
      const argRes = await this.resolveExpr(isUpperCaseMatch[1].trim(), vars);
      if (!argRes.ok) return argRes;
      if (argRes.type !== "char") { this.showCompileErrorStamp(); return { ok: false, crash: "compile" }; }
      const result = /[A-Z]/.test(argRes.value);
      await this.runMiniCasePrism(argRes.value, result);
      this._lastUpperResult = result;
      this.updateResultRow("boolean");
      return { ok: true, value: result, type: "boolean" };
    }

    const scanCharAtMatch = t.match(/^sc\.nextLine\(\)\.charAt\((.+)\)$/);
    if (scanCharAtMatch) {
      const read = this.evaluateNextToken(this.tapeState);
      await this.tapeConsumeVisual(read.consumedCount);
      const strVal = read.rawValue;
      const idxRes = await this.resolveExpr(scanCharAtMatch[1].trim(), vars);
      if (!idxRes.ok) return idxRes;
      const idx = Number(idxRes.value);
      if (idx < 0 || idx >= strVal.length) { this.showRuntimeHaltStamp(); return { ok: false, crash: "eval" }; }
      this._lastExtractedChar = strVal[idx];
      return { ok: true, value: strVal[idx], type: "char" };
    }

    if (t === "sc.nextLine()") {
      const read = this.evaluateNextToken(this.tapeState);
      await this.tapeConsumeVisual(read.consumedCount);
      return { ok: true, value: read.rawValue, type: "String" };
    }

    const charAtMatch = t.match(/^(\w+)\.charAt\((.+)\)$/);
    if (charAtMatch) {
      const base = vars[charAtMatch[1]];
      if (!base || base.type !== "String") { this.showCompileErrorStamp(); return { ok: false, crash: "compile" }; }
      const idxRes = await this.resolveExpr(charAtMatch[2].trim(), vars);
      if (!idxRes.ok) return idxRes;
      const idx = Number(idxRes.value);
      if (idx < 0 || idx >= base.value.length) { this.showRuntimeHaltStamp(); return { ok: false, crash: "eval" }; }
      this._lastExtractedChar = base.value[idx];
      return { ok: true, value: base.value[idx], type: "char" };
    }

    const lengthMatch = t.match(/^(\w+)\.length\(\)$/);
    if (lengthMatch) {
      const base = vars[lengthMatch[1]];
      if (!base || base.type !== "String") { this.showCompileErrorStamp(); return { ok: false, crash: "compile" }; }
      return { ok: true, value: base.value.length, type: "int" };
    }

    const staticCallMatch = t.match(/^(\w+)\.(\w+)\(/);
    if (staticCallMatch) { this.showCompileErrorStamp(); return { ok: false, crash: "compile" }; }

    if (t === "true" || t === "false") return { ok: true, value: t === "true", type: "boolean" };
    if (/^'.'$/.test(t)) return { ok: true, value: t[1], type: "char" };
    if (/^'.*'$/.test(t)) { this.showCompileErrorStamp(); return { ok: false, crash: "compile" }; }
    if (/^".*"$/.test(t)) return { ok: true, value: t.slice(1, -1), type: "String" };
    if (/^[+-]?\d+\.\d+$/.test(t)) return { ok: true, value: parseFloat(t), type: "double" };
    if (/^[+-]?\d+$/.test(t)) return { ok: true, value: parseInt(t, 10), type: "int" };

    if (vars[t] !== undefined) return { ok: true, value: vars[t].value, type: vars[t].type };

    this.showRuntimeHaltStamp();
    return { ok: false, crash: "eval" };
  }

  async execStatement(line, vars) {
    if (/^Scanner\s+\w+\s*=\s*new\s+Scanner\(System\.in\)\s*;$/.test(line)) return { ok: true };

    const declLine = line.match(/^(int|double|String|boolean|char)\s+(.+);$/);
    if (declLine) {
      const type = declLine[1];
      const parts = this._splitTopLevelComma(declLine[2]);
      for (const rawPart of parts) {
        const part = rawPart.trim();
        const eqIdx = part.indexOf("=");
        if (eqIdx === -1) {
          vars[part] = { value: undefined, type, kind: "scalar" };
          continue;
        }
        const name = part.slice(0, eqIdx).trim();
        const rhs = part.slice(eqIdx + 1).trim();
        const r = await this.resolveExpr(rhs, vars);
        if (!r.ok) return r;
        if (type !== r.type) { this.showCompileErrorStamp(); return { ok: false, crash: "compile" }; }
        vars[name] = { value: r.value, type, kind: "scalar" };
      }
      this.updateVariablesStrip(vars);
      return { ok: true };
    }

    const incrMatch = line.match(/^(\w+)\+\+;$/);
    if (incrMatch) {
      const v = vars[incrMatch[1]];
      if (v) v.value = v.value + 1;
      this.updateVariablesStrip(vars);
      return { ok: true };
    }

    const reassign = line.match(/^(\w+)\s*=\s*(.*);$/);
    if (reassign) {
      const name = reassign[1], rhs = reassign[2].trim();
      const existing = vars[name];
      if (!existing) { this.showCompileErrorStamp(); return { ok: false, crash: "compile" }; }
      const r = await this.resolveExpr(rhs, vars);
      if (!r.ok) return r;
      if (existing.type !== r.type) { this.showCompileErrorStamp(); return { ok: false, crash: "compile" }; }
      vars[name] = { value: r.value, type: existing.type, kind: "scalar" };
      this.updateVariablesStrip(vars);
      return { ok: true };
    }

    const printMatch = line.match(/^System\.out\.println\((.*)\);$/);
    if (printMatch) {
      this.updateManifestStrip("System.out.println(…)");
      const r = await this.resolveExpr(printMatch[1].trim(), vars);
      if (!r.ok) return r;
      if (!this._printedLines) this._printedLines = [];
      const s = this._javaToString(r.value, r.type);
      this._printedLines.push(s);
      await this.printToTicker(s);
      return { ok: true };
    }

    return { ok: true };
  }

  /** Index-scans:
   *   for (int i = INIT; COND; i++) { ... } — after each iteration,
   *     feeds the 4-column loop tracker (char, isDigit, isLetter,
   *     isUpperCase) from whichever calls fired that iteration.
   *   if (...) { ... } [else if (...) { ... }]* [else { ... }]  — an
   *     arbitrary-length BRACED block chain.
   *   if (COND) STMT; [else if (COND) STMT;]* [else STMT;]  — braceless,
   *     GATED. A bare `if` immediately following (not `else if`) is
   *     left untouched for the next top-level dispatch — Mission 4's
   *     two independent per-iteration checks rely on this. */
  async runStatements(lines, vars) {
    let i = 0;
    while (i < lines.length) {
      if (!this._alive) return { ok: true };
      const raw = lines[i];
      const line = raw.trim();
      if (!line) { i++; continue; }

      const forMatch = line.match(/^for\s*\(\s*int\s+(\w+)\s*=\s*(.+?);\s*(.+?);\s*(\w+)\+\+\s*\)\s*\{$/);
      if (forMatch) {
        const loopVar = forMatch[1], initExpr = forMatch[2], condExpr = forMatch[3];
        let j = i + 1, depth = 1;
        const bodyLines = [];
        while (j < lines.length && depth > 0) {
          const t = lines[j].trim();
          if (t === "} else {" || /^\}\s*else if\s*\(.+\)\s*\{$/.test(t)) {
            // closes one branch, reopens another — depth unchanged
          } else if (t === "}") {
            depth--;
            if (depth === 0) break;
          } else if (t.endsWith("{")) {
            depth++;
          }
          bodyLines.push(lines[j]);
          j++;
        }
        const initRes = await this.resolveExpr(initExpr.trim(), vars);
        if (!initRes.ok) return initRes;
        vars[loopVar] = { value: initRes.value, type: "int", kind: "scalar" };
        let guard = 0;
        while (guard++ < 1000) {
          if (!this._alive) return { ok: true };
          const condRes = await this.resolveExpr(condExpr.trim(), vars);
          if (!condRes.ok) return condRes;
          if (!condRes.value) break;
          this._lastExtractedChar = undefined;
          this._lastDigitResult = undefined;
          this._lastLetterResult = undefined;
          this._lastUpperResult = undefined;
          const r = await this.runStatements(bodyLines, vars);
          if (!r.ok) return r;
          this.updateLoopTracker(vars[loopVar].value, this._lastExtractedChar !== undefined ? this._lastExtractedChar : null, this._lastDigitResult, this._lastLetterResult, this._lastUpperResult);
          vars[loopVar].value = vars[loopVar].value + 1;
        }
        i = j + 1;
        continue;
      }

      const ifMatch = line.match(/^if\s*\((.+)\)\s*\{$/);
      if (ifMatch) {
        const branches = [{ cond: ifMatch[1].trim(), lines: [] }];
        let j = i + 1;
        let elseLines = null;
        while (j < lines.length) {
          const t = lines[j].trim();
          if (t === "}") { break; }
          const elseIfMatch = t.match(/^\}\s*else if\s*\((.+)\)\s*\{$/);
          if (elseIfMatch) {
            branches.push({ cond: elseIfMatch[1].trim(), lines: [] });
            j++;
            continue;
          }
          if (t === "} else {") {
            elseLines = [];
            let k = j + 1;
            while (k < lines.length && lines[k].trim() !== "}") { elseLines.push(lines[k]); k++; }
            j = k;
            break;
          }
          branches[branches.length - 1].lines.push(lines[j]);
          j++;
        }
        let ran = false;
        for (const br of branches) {
          const condRes = await this.resolveExpr(br.cond, vars);
          if (!condRes.ok) return condRes;
          if (condRes.value) {
            const r = await this.runStatements(br.lines, vars);
            if (!r.ok) return r;
            ran = true;
            break;
          }
        }
        if (!ran && elseLines) {
          const r = await this.runStatements(elseLines, vars);
          if (!r.ok) return r;
        }
        i = j + 1;
        continue;
      }

      const braceless = line.match(/^if\s*\((.+)\)\s+(\S.*;)$/);
      if (braceless && !line.includes("{")) {
        const branches = [{ cond: braceless[1].trim(), stmt: braceless[2].trim() }];
        let j = i + 1;
        while (j < lines.length) {
          const t = lines[j].trim();
          const elseIfM = t.match(/^else if\s*\((.+)\)\s+(\S.*;)$/);
          if (elseIfM && !t.includes("{")) {
            branches.push({ cond: elseIfM[1].trim(), stmt: elseIfM[2].trim() });
            j++;
            continue;
          }
          const elseM = t.match(/^else\s+(\S.*;)$/);
          if (elseM && !t.includes("{")) {
            branches.push({ cond: null, stmt: elseM[1].trim() });
            j++;
            break;
          }
          break;
        }
        let ran = false;
        for (const br of branches) {
          if (br.cond === null) {
            if (!ran) { const r = await this.execStatement(br.stmt, vars); if (!r.ok) return r; }
            break;
          }
          const condRes = await this.resolveExpr(br.cond, vars);
          if (!condRes.ok) return condRes;
          if (condRes.value) {
            const r = await this.execStatement(br.stmt, vars);
            if (!r.ok) return r;
            ran = true;
            break;
          }
        }
        i = j;
        continue;
      }

      const r = await this.execStatement(line, vars);
      if (!r.ok) return r;
      i++;
    }
    return { ok: true };
  }

  showCompileErrorStamp() {
    const stamp = this.add.text(CX + CW / 2, CY + CH / 2, "COMPILE ERROR", { font: "bold 18px Arial", color: HEX_RED }).setOrigin(0.5).setDepth(70).setScale(1.3).setAngle(-6).setAlpha(0);
    this.missionElements.push(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 130 });
    this.screenShake(0.004, 110);
    this.time.delayedCall(750, () => { if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 160, onComplete: () => stamp.destroy() }); });
  }

  showRuntimeHaltStamp() {
    const stamp = this.add.text(CX + CW / 2, CY + CH / 2, "BUILD HALTED", { font: "bold 17px Arial", color: HEX_RED }).setOrigin(0.5).setDepth(70).setScale(1.2).setAngle(-4).setAlpha(0);
    this.missionElements.push(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 130 });
    this.screenShake(0.004, 110);
    this.time.delayedCall(750, () => { if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 160, onComplete: () => stamp.destroy() }); });
  }

  // ══════════════════════════════════════════════════════════════
  // SCORING & LIVES
  // ══════════════════════════════════════════════════════════════

  updateScore(points) {
    this.score = Math.max(0, this.score + points);
    this.scoreText.setText(String(this.score));
  }

  loseLife() {
    this.lives = Math.max(0, this.lives - 1);
    const icon = this.lifeIcons[this.lives];
    if (icon) this.tweens.add({ targets: icon, alpha: 0.12, duration: 320 });
    return this.lives <= 0;
  }

  // ══════════════════════════════════════════════════════════════
  // GAME OVER
  // ══════════════════════════════════════════════════════════════

  gameOver() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearMission();
    this.hideBubble();

    (async () => {
      this.clearMiniInstruments();
      this.clearLoopTracker();
      this.clearTicker();
      this.clearVariablesStrip();
      this.parkScannerCameo();
      this._wingCrest.c.setAlpha(0.1);
      this.tweens.add({ targets: this._chandelierCrystals, alpha: 0.15, duration: 600 });
      this.tweens.add({ targets: [this._crownGemGold, this._crownGemBlue, this._crownGemWhite], alpha: 0.1, duration: 500 });
      const motes = this.ambient;
      this.ambient = null;
      (motes || []).forEach((m) => this.tweens.add({ targets: m, y: 632, alpha: 0, duration: 1500, ease: "Sine.easeIn" }));

      const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
      this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });
      const title = this.add.text(640, 240, "GRAND HALL CLOSED", { font: "bold 32px Georgia", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
      this.tweens.add({ targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut", onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }) });
      this.add.text(640, 310, `Score: ${this.score}`, { font: "21px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
      this.add.text(640, 350, `Missions Published: ${this.currentMission} / 6`, { font: "18px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);
      this._makeButton(525, 420, "REOPEN THE HALL", 200, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
      this._makeButton(755, 420, "RETURN TO MENU", 200, 50, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.start("MenuScene"));
    })();
  }

  _starRating() {
    if (this.flawlessCount >= 4 && this.hintCount <= 1) return 3;
    if (this.failedRunCount <= 3) return 2;
    return 1;
  }

  // ══════════════════════════════════════════════════════════════
  // THE CHARACTER WING SEAL (5 phases)
  // ══════════════════════════════════════════════════════════════

  async triggerWingFinaleCeremony() {
    await this.ceremonyPhase1_Fanfare();
    if (!this._alive) return;
    await this.ceremonyPhase2_InstrumentsAssemble();
    if (!this._alive) return;
    await this.ceremonyPhase3_CentralPanel();
    if (!this._alive) return;
    await this.ceremonyPhase4_WingSeal();
    if (!this._alive) return;
    await this.ceremonyPhase5_BitClosingAddress();
    if (!this._alive) return;
    this.triggerCurriculumCompletion();
  }

  async ceremonyPhase1_Fanfare() {
    this.tweens.add({ targets: this._chandelierCrystals, alpha: 1, scale: 1.4, duration: 400, yoyo: true, repeat: 2 });
    this._ledgerEntries.forEach((e, i) => {
      this.time.delayedCall(i * 15, () => { if (e.active) this.tweens.add({ targets: e, fillAlpha: 0.5, duration: 150, yoyo: true }); });
    });
    this.tweens.add({ targets: [this._instrumentSilhouettes.loupe, this._instrumentSilhouettes.lens, this._instrumentSilhouettes.case], alpha: 1, duration: 500 });
    await new Promise((res) => { this.tweens.add({ targets: this._wingCrest.c, x: 640, y: 300, scale: 1.6, duration: 700, ease: "Sine.easeInOut", onComplete: res }); });
    this.pulseCrest("gold");
    [this._crownGemGold, this._crownGemBlue, this._crownGemWhite].forEach((gem, i) => {
      this.time.delayedCall(i * 200, () => { if (gem.active) this.tweens.add({ targets: gem, scale: 1.8, duration: 200, yoyo: true }); });
    });
    this.screenShake(0.004, 200);
    await this.delay(600);
  }

  async ceremonyPhase2_InstrumentsAssemble() {
    const loupeC = this.add.container(500, 300).setDepth(89).setAlpha(0).setScale(0.5);
    const lg = this.add.graphics();
    lg.lineStyle(3, C_GOLD, 1);
    lg.strokeCircle(0, 0, 26);
    lg.lineBetween(18, 18, 30, 30);
    loupeC.add(lg);

    const lensC = this.add.container(780, 300).setDepth(89).setAlpha(0).setScale(0.5);
    const lensG = this.add.graphics();
    const s = 22;
    lensG.lineStyle(3, C_BLUE_LETTER, 1);
    lensG.strokeTriangle(0, -s, s * 0.87, s * 0.5, -s * 0.87, s * 0.5);
    lensC.add(lensG);

    const caseC = this.add.container(640, 380).setDepth(89).setAlpha(0).setScale(0.5);
    const caseG = this.add.graphics();
    const s2 = 20;
    caseG.lineStyle(3, C_WHITE_BLUE, 1);
    caseG.strokePoints([{ x: 0, y: -s2 }, { x: s2 * 0.62, y: 0 }, { x: 0, y: s2 }, { x: -s2 * 0.62, y: 0 }], true);
    caseC.add(caseG);

    this._ceremonyInstruments = [loupeC, lensC, caseC];
    await new Promise((res) => {
      this.tweens.add({ targets: [loupeC, lensC, caseC], alpha: 1, scale: 1, duration: 600, ease: "Back.easeOut", onComplete: res });
    });
    this.createConfetti(640, 340, 30);
    await this.delay(1200);
  }

  async ceremonyPhase3_CentralPanel() {
    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
    this.tweens.add({ targets: ov, fillAlpha: 0.85, duration: 500 });
    this._ceremonyElements = [ov];
    (this._ceremonyInstruments || []).forEach((c) => { c.setDepth(90); this._ceremonyElements.push(c); });

    const panel = this.add.graphics().setDepth(90);
    panel.fillStyle(0x0a1428, 1);
    panel.fillRoundedRect(320, 80, 640, 560, 16);
    panel.lineStyle(2, C_GOLD, 1);
    panel.strokeRoundedRect(320, 80, 640, 560, 16);
    this._ceremonyElements.push(panel);

    const title = this.add.text(640, 120, "GRAND GEMOLOGIST", { font: "bold 34px Georgia", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(91).setScale(0);
    this.tweens.add({ targets: title, scale: 1, duration: 350, ease: "Back.easeOut" });
    this._ceremonyElements.push(title);

    const opCount = Object.values(this.orderingProactive).filter(Boolean).length;
    const opTotal = Object.keys(this.orderingProactive).length;
    const lines = [
      "MISSIONS: 6/6",
      `FLAWLESS: ${this.flawlessCount}`,
      `SELF-CORRECTIONS: ${this.selfCorrectionCount}`,
      `FOUR-ZONE ORDERING: ${opCount}/${opTotal}`,
      `PASSWORD VALIDATOR: ${Object.values(this.pwClean).some(Boolean) ? "✓" : "✗"}`,
      `INPUT ANALYZER: ${Object.values(this.inputClean).some(Boolean) ? "✓" : "✗"}`,
      `HINTS: ${this.hintCount}`,
    ];
    lines.forEach((s, i) => {
      const t = this.add.text(380, 170 + i * 24, s, { font: "16px Arial", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 250, delay: 300 + i * 110 });
      this._ceremonyElements.push(t);
    });
    const totalText = this.add.text(380, 170 + 7 * 24, "TOTAL: 0", { font: "bold 23px Arial", color: HEX_GOLD }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: totalText, alpha: 1, duration: 250, delay: 1150 });
    const counter = { v: 0 };
    this.tweens.add({ targets: counter, v: this.score, duration: 900, delay: 1150, onUpdate: () => totalText.setText(`TOTAL: ${Math.round(counter.v)}`) });
    this._ceremonyElements.push(totalText);

    const stars = this._starRating();
    for (let i = 0; i < 3; i++) {
      const earned = i < stars;
      const s = this.add.text(640 + (i - 1) * 60, 410, "★", { font: "40px Arial", color: earned ? HEX_GOLD : "#2a3040" }).setOrigin(0.5).setDepth(91).setScale(0);
      this.tweens.add({ targets: s, scale: 1, duration: 250, delay: 1650 + i * 200, ease: earned ? "Back.easeOut" : "Cubic.easeOut" });
      this._ceremonyElements.push(s);
    }

    const badge = this.add.container(640, 480).setDepth(91).setAlpha(0);
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillCircle(0, 0, 34);
    bg.lineStyle(3, C_GOLD, 1);
    bg.strokeCircle(0, 0, 34);
    const caseIcon = this.add.text(-14, -2, "💠", { font: "bold 14px Arial" }).setOrigin(0.5);
    const crystalIcon = this.add.text(0, -2, "🔷", { font: "bold 14px Arial" }).setOrigin(0.5);
    const crownIcon = this.add.text(14, -2, "👑", { font: "bold 14px Arial" }).setOrigin(0.5);
    badge.add([bg, caseIcon, crystalIcon, crownIcon]);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 2050 });
    const badgeLbl = this.add.text(640, 522, "isUpperCase() MASTERY", { font: "bold 15px Georgia", color: HEX_WHITE_BLUE }).setOrigin(0.5).setDepth(91).setAlpha(0);
    const badgeSub = this.add.text(640, 538, "Accretion ✓  Tuning ✓  Restructuring ✓", { font: "12px Arial", color: "#78909c" }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: [badgeLbl, badgeSub], alpha: 1, duration: 300, delay: 2200 });
    this._ceremonyElements.push(badge, badgeLbl, badgeSub);

    await this.delay(2900);
  }

  async ceremonyPhase4_WingSeal() {
    const ribbon = this.add.container(640, -40).setDepth(92);
    const rg = this.add.graphics();
    rg.fillStyle(0x0a1428, 0.97);
    rg.lineStyle(2, C_SILVER, 1);
    rg.fillRoundedRect(-280, -70, 560, 140, 10);
    rg.strokeRoundedRect(-280, -70, 560, 140, 10);
    const rTitle = this.add.text(0, -46, "CHARACTER WING — COMPLETE", { font: "bold 19px Georgia", color: HEX_GOLD }).setOrigin(0.5);
    ribbon.add([rg, rTitle]);
    this._ceremonyElements.push(ribbon);

    await new Promise((res) => { this.tweens.add({ targets: ribbon, y: 150, duration: 500, ease: "Back.easeOut", onComplete: res }); });

    const checks = [
      { label: "isDigit() ✓", color: HEX_GOLD, x: -160 },
      { label: "isLetter() ✓", color: HEX_BLUE_LETTER, x: 0 },
      { label: "isUpperCase() ✓", color: HEX_WHITE_BLUE, x: 160 },
    ];
    for (const chk of checks) {
      if (!this._alive) return;
      const t = this.add.text(chk.x, 0, chk.label, { font: "bold 14px Courier New", color: chk.color }).setOrigin(0.5).setAlpha(0);
      ribbon.add(t);
      this._ceremonyElements.push(t);
      this.tweens.add({ targets: t, alpha: 1, duration: 200 });
      this.screenShake(0.002, 80);
      await this.delay(400);
    }
    const caption = this.add.text(0, 30, "9 levels · 3 methods · one institute of classification", { font: "italic 13px Georgia", color: HEX_CYAN }).setOrigin(0.5).setAlpha(0);
    ribbon.add(caption);
    this._ceremonyElements.push(caption);
    this.tweens.add({ targets: caption, alpha: 1, duration: 300 });

    const shock = this.add.circle(880, 56, 6, C_SILVER, 0.6).setDepth(93);
    this.tweens.add({ targets: shock, scale: 12, alpha: 0, duration: 600, onComplete: () => shock.destroy() });
    this.createFinaleConfetti(640, 300, 50);
    await this.delay(1900);
  }

  async ceremonyPhase5_BitClosingAddress() {
    await new Promise((res) => { this.tweens.add({ targets: this.bit, x: 640, y: 610, duration: 500, ease: "Sine.easeInOut", onComplete: res }); });
    await this.bitSay("Nine levels of the Character Wing — isDigit IDENTIFIED the ten digit characters, isLetter CLASSIFIED the fifty-two letters regardless of case, isUpperCase DISTINGUISHED the twenty-six capitals from their lowercase siblings. Three boolean instruments, one char at a time, one classification per call. You can identify, classify, and distinguish — characters hold no mysteries now.");
    if (!this._alive) return;
    await Promise.race([this.waitForClick(), this.delay(9000)]);
    this.hideBubble();
    (this._ceremonyElements || []).forEach((e) => { if (e && e.destroy) e.destroy(); });
    this._ceremonyElements = [];
    (this._ceremonyInstruments || []).forEach((e) => { if (e && e.destroy) e.destroy(); });
    this._ceremonyInstruments = [];
  }

  // ══════════════════════════════════════════════════════════════
  // THE CURRICULUM COMPLETION CEREMONY (5 phases)
  // ══════════════════════════════════════════════════════════════

  async triggerCurriculumCompletion() {
    await this.completionPhaseA_EightWings();
    if (!this._alive) return;
    await this.completionPhaseB_GrandBanner();
    if (!this._alive) return;
    await this.completionPhaseC_FinalStats();
    if (!this._alive) return;
    await this.completionPhaseD_BitFinalAddress();
    if (!this._alive) return;
    this.completionPhaseE_FinalButtons();
  }

  async completionPhaseA_EightWings() {
    const WING_DATA = [
      { name: "String", color: 0xff9800, icon: "🔨" },
      { name: "Intake", color: 0xff9800, icon: "🌪️" },
      { name: "Output", color: 0x00e676, icon: "📢" },
      { name: "ArrayList", color: 0x8d6e63, icon: "📚" },
      { name: "Math", color: 0x3949ab, icon: "🔭" },
      { name: "Arrays", color: 0x2e7d32, icon: "🗃️" },
      { name: "Type Conversion", color: 0x5c6bc0, icon: "🔥" },
      { name: "Character", color: 0x4fc3f7, icon: "🔎" },
    ];
    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
    this.tweens.add({ targets: ov, fillAlpha: 0.9, duration: 500 });
    this._completionElements = [ov];

    const startX = 640 - (7 * 130) / 2;
    this._wingBadges = [];
    for (let i = 0; i < WING_DATA.length; i++) {
      if (!this._alive) return;
      const wd = WING_DATA[i];
      const x = startX + i * 130, y = 200;
      const c = this.add.container(x, y).setDepth(91).setAlpha(0).setScale(0.5);
      const bg = this.add.graphics();
      bg.fillStyle(0x1a1a2e, 1);
      bg.fillCircle(0, 0, 26);
      bg.lineStyle(2, wd.color, 1);
      bg.strokeCircle(0, 0, 26);
      const icon = this.add.text(0, -4, wd.icon, { font: "18px Arial" }).setOrigin(0.5);
      const lbl = this.add.text(0, 36, wd.name, { font: "bold 10px Georgia", color: "#e8eaf6" }).setOrigin(0.5);
      c.add([bg, icon, lbl]);
      this._wingBadges.push(c);
      this._completionElements.push(c);
      this.tweens.add({ targets: c, alpha: 1, scale: 1, duration: 300, ease: "Back.easeOut" });
      this.screenShake(0.0015, 60);
      await this.delay(500);
    }
    this.tweens.add({ targets: this._wingBadges, scale: 1.1, duration: 300, yoyo: true, repeat: 1 });
    await this.delay(700);
  }

  async completionPhaseB_GrandBanner() {
    const banner = this.add.container(640, 300).setDepth(92).setAlpha(0).setScale(0.5);
    const bg = this.add.graphics();
    bg.fillStyle(0x0a0a0a, 1);
    bg.lineStyle(4, C_GOLD, 1);
    bg.fillRoundedRect(-300, -50, 600, 100, 8);
    bg.strokeRoundedRect(-300, -50, 600, 100, 8);
    const title = this.add.text(0, -18, "CURRICULUM COMPLETE", { font: "bold 28px Georgia", color: HEX_GOLD }).setOrigin(0.5);
    const sub = this.add.text(0, 18, "64 levels · 8 wings · 24 methods · one gamified framework", { font: "italic 15px Georgia", color: HEX_WHITE_BLUE }).setOrigin(0.5).setAlpha(0.85);
    banner.add([bg, title, sub]);
    this._completionElements.push(banner);
    await new Promise((res) => { this.tweens.add({ targets: banner, alpha: 1, scale: 1, duration: 500, ease: "Back.easeOut", onComplete: res }); });

    const fireworkColors = [0xff9800, 0x00e676, 0x4fc3f7, 0x5c6bc0, 0xffffff];
    for (let i = 0; i < 5; i++) {
      if (!this._alive) return;
      const fx = Phaser.Math.Between(300, 980), fy = Phaser.Math.Between(100, 160);
      this.createFireworks(fx, fy, fireworkColors[i]);
      await this.delay(200);
    }
    await this.delay(800);
  }

  async completionPhaseC_FinalStats() {
    const statsY = 420;
    const lines = [
      { text: `TOTAL SCORE: ${this.score}`, color: HEX_GOLD, size: 18 },
      { text: "WINGS SEALED: 8/8", color: HEX_GREEN_BRIGHT, size: 14 },
      { text: "TRILOGIES MASTERED: 8", color: HEX_BLUE_LETTER, size: 14 },
      { text: "UNIQUE TIMERS EXPERIENCED: 21", color: HEX_SILVER, size: 14 },
    ];
    for (let i = 0; i < lines.length; i++) {
      if (!this._alive) return;
      const l = lines[i];
      const t = this.add.text(640, statsY + i * 26, l.text, { font: `bold ${l.size}px Arial`, color: l.color }).setOrigin(0.5).setDepth(92).setAlpha(0);
      this._completionElements.push(t);
      this.tweens.add({ targets: t, alpha: 1, duration: 300 });
      await this.delay(300);
    }
    await this.delay(700);
  }

  async completionPhaseD_BitFinalAddress() {
    await new Promise((res) => { this.tweens.add({ targets: this.bit, x: 640, y: 600, duration: 500, ease: "Sine.easeInOut", onComplete: res }); });
    await this.bitSay("Sixty-four levels. Eight wings. Twenty-four Java methods — from String.length() to Character.isUpperCase(). You've smelted text into numbers, sorted arrays in place, traversed collections, computed distances, validated characters, and classified every gem that crossed your bench. The framework asked you to play; you chose to master. The schemas you built tonight — accretion, tuning, restructuring, three phases per method, honest interpreters throughout — these are yours to keep. Every program you write from here carries the tools of eight wings. Grand Gemologist, Master Assayer, Chief Curator, Grand Formulist, Head Arranger, Master Scribe, Chief Archivist, and Forge Master — all one learner, all one journey. The institute's doors close behind you, but the methods never leave. Build boldly.");
    if (!this._alive) return;
    await Promise.race([this.waitForClick(), this.delay(12000)]);
    this.hideBubble();
  }

  completionPhaseE_FinalButtons() {
    this._makeButton(460, 600, "REVIEW CURRICULUM", 260, 46, { stroke: C_SILVER, textColor: HEX_SILVER }, () => {
      this.scene.start("MenuScene");
    });
    this._makeButton(760, 600, "PLAY AGAIN", 220, 46, { fill: 0x7a5c00, stroke: C_GOLD, textColor: "#ffffff" }, () => {
      this.scene.start("MenuScene");
    });
  }

  _makeButton(x, y, label, w, h, style, onClick, depth = 95) {
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
