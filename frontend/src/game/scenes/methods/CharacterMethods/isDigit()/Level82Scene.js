/**
 * Level 82 — "The Classification Works" (Character Wing: Restructuring
 * Phase — Character.isDigit() trilogy finale)
 * ===========================================================================
 * The learner CONSTRUCTS complete classification-and-extraction programs —
 * no multiple choice. Reuses the L27→L79 code-canvas/parts-bin/RUN
 * architecture. The rig hosts a mini Classification Loupe (L80, 50%
 * scale) plus a charAt extraction stage and a loop tracker — the
 * evaluator routes every isDigit call through the honest loupe
 * choreography.
 *
 * Hand-verification (before any code was written, per the established
 * discipline): traced all 6 missions' test cases directly against real
 * Java semantics, including the two trickiest claims the spec makes
 * about its own distractors —
 *   - M3/M4/M5's "plain ch" and "(int) ch" distractors: confirmed they
 *     give the ASCII CODE (52 for '4', not 4), producing the exact
 *     wrong totals the spec claims (104, 154, 110).
 *   - M6's counter-swap distractor: confirmed by hand-trace it produces
 *     the SAME output as correct code on "R2D2C3" (3 digits / 3 other,
 *     symmetric — 3/3 either way) but diverges on every asymmetric test
 *     ("12345": correct gives 5/0, swapped gives 0/5) — exactly as the
 *     spec describes, and the multi-test battery catches it correctly.
 * No spec data bugs found this time — same clean result as L74/L77/L80.
 *
 * New evaluator vocabulary beyond L81's cascade (all needed for this
 * level's specific missions, confirmed necessary by hand-tracing before
 * writing any evaluator code):
 *  - A bare reassignment statement (`sum = sum + expr;`, no type
 *    keyword) — Mission 4's running total. Not needed by any L80/L81
 *    round; new here since accumulation across loop iterations requires
 *    mutating an already-declared variable.
 *  - Chained `sc.nextLine().charAt(idx)` — Mission 5's Scanner→String→
 *    char pipeline. Every prior level's charAt was called on a plain
 *    variable; this is the first call chained directly onto a Scanner
 *    read's return value rather than a variable holding it.
 *  - `(int)` cast (paralleling L81's `(char)` cast) — needed for
 *    M3/M4/M5's "(int) ch" distractor, which must honestly produce the
 *    char's code point (confirmed above).
 *  - `_splitMultiplicative` and `_stripOuterParens` (reused from
 *    L76/79/81) — needed for M3/M5's `(val * 2)` parenthesized
 *    multiplication inside a concatenation.
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
const TUTORIAL_KEY = "level82_tutorial_done";

// Rig internal layout — left containers, center mini loupe, right charAt
// extraction stage (top row); loop tracker below; ticker at the bottom.
const MINI_Y0 = OY + 18, MINI_Y1 = OY + 82;
const CONT_X0 = OX + 8, CONT_X1 = OX + 148;
const LOUPE_X0 = OX + 156, LOUPE_X1 = OX + 306;
const CHARAT_X0 = OX + 314, CHARAT_X1 = OX + 452;
const TRACKER_Y0 = OY + 90, TRACKER_Y1 = OY + 150;
const TAPE_Y = OY + 8;
const TICKER_Y = OY + 200;

// ══════════════════════════════════════════════════════════════
// MISSION CONFIGURATION
// ══════════════════════════════════════════════════════════════
const MISSIONS = [
  // ── Mission 1: The Gate Check ──
  { mission: 1, title: "The Gate Check",
    brief: "Check if a character is a digit and report the classification.\nFor ch = '3':\nDigit: true",
    skeleton: [
      "char ch = /* test value */;",
      "",
      "boolean result = <slot:check>;",
      'System.out.println("Digit: " + result);',
    ],
    slots: [{ id: "check", hint: "classify the gem" }],
    palette: [
      { code: "Character.isDigit(ch)", correct: true, slotId: "check" },
      { code: "character.isDigit(ch)", tag: "character_lowercase_belief", slotId: "check" },
      { code: "ch.isDigit()", tag: "isDigit_instance_call_belief", slotId: "check" },
      { code: "Character.isLetter(ch)", tag: "wrong_classification_method", slotId: "check" },
      { code: "Integer.parseInt(ch)", tag: "isDigit_converts_belief", slotId: "check" },
    ],
    tests: [
      { substitutions: { ch: "'3'" }, expectedOutput: "Digit: true" },
      { substitutions: { ch: "'A'" }, expectedOutput: "Digit: false" },
      { substitutions: { ch: "'.'" }, expectedOutput: "Digit: false" },
    ],
    postMissionNote: "Bit: 'isDigit on the char, boolean in the container, println publishes the verdict. The simplest pipeline: classify and report.'",
    concept: "basic_classify_report" },

  // ── Mission 2: The Digit Counter ──
  { mission: 2, title: "The Digit Counter",
    brief: 'Count the number of digit characters in a string.\nFor code = "H3LL0":\nDigits: 2',
    skeleton: [
      "String code = /* test value */;",
      "int count = 0;",
      "",
      "for (int i = 0; i < <slot:bound>; i++) {",
      "    if (<slot:check>) {",
      "        count++;",
      "    }",
      "}",
      'System.out.println("Digits: " + count);',
    ],
    slots: [
      { id: "bound", hint: "the loop boundary" },
      { id: "check", hint: "classify each character" },
    ],
    isFlagship: false,
    palette: [
      { code: "code.length()", correct: true, slotId: "bound" },
      { code: "code.length() - 1", tag: "loop_bound_wrong", slotId: "bound" },
      { code: "Character.isDigit(code.charAt(i))", correct: true, slotId: "check" },
      { code: "Character.isDigit(code)", tag: "isDigit_takes_string_belief", slotId: "check" },
      { code: "Character.isLetter(code.charAt(i))", tag: "wrong_classification_method", slotId: "check" },
      { code: "code.charAt(i) == 'digit'", tag: "digit_as_literal", slotId: "check" },
    ],
    tests: [
      { substitutions: { code: '"H3LL0"' }, expectedOutput: "Digits: 2" },
      { substitutions: { code: '"12345"' }, expectedOutput: "Digits: 5" },
      { substitutions: { code: '"HELLO"' }, expectedOutput: "Digits: 0" },
    ],
    postMissionNote: "Bit: 'The wing's signature: loop → charAt → isDigit → count. Each character extracted as a gem, classified through the loupe, counted if true. The length() bound keeps the loop in bounds; length() - 1 would miss the last character.'",
    concept: "digit_counter_pattern" },

  // ── Mission 3: The Value Extractor (FLAGSHIP — classify before extract) ──
  { mission: 3, title: "The Value Extractor",
    brief: "If a character is a digit, extract its NUMERIC VALUE and print it doubled. If not, print 'Not a digit'.\nFor ch = '4': Value x2: 8\nFor ch = 'X': Not a digit",
    skeleton: [
      "char ch = /* test value */;",
      "",
      "if (<slot:guard>) {",
      "    int val = <slot:extract>;",
      '    System.out.println("Value x2: " + (val * 2));',
      "} else {",
      '    System.out.println("Not a digit");',
      "}",
    ],
    slots: [
      { id: "guard", hint: "classify first!" },
      { id: "extract", hint: "extract the numeric value" },
    ],
    isFlagship: true,
    palette: [
      { code: "Character.isDigit(ch)", correct: true, slotId: "guard" },
      { code: "ch >= 0", tag: "char_compared_to_int_belief", slotId: "guard" },
      { code: "ch - '0'", correct: true, slotId: "extract" },
      { code: "ch", tag: "char_is_its_number_belief", slotId: "extract" },
      { code: "(int) ch", tag: "cast_gives_ascii", slotId: "extract" },
      { code: "Integer.parseInt(ch)", tag: "parseInt_takes_char_belief", slotId: "extract" },
    ],
    tests: [
      { substitutions: { ch: "'4'" }, expectedOutput: "Value x2: 8" },
      { substitutions: { ch: "'0'" }, expectedOutput: "Value x2: 0" },
      { substitutions: { ch: "'X'" }, expectedOutput: "Not a digit" },
    ],
    postMissionNote: "Bit (nodding at the extraction reference on the wall): 'Classify BEFORE you extract — isDigit guards the if, ch - \"0\" bridges from encoding to meaning. The plain ch gave 52 (ASCII), not 4 (the digit). The cast (int) ch gave the same 52. Only ch - \"0\" crosses from code to value. Guard, extract, compute — the three-step pipeline.'",
    concept: "classify_before_extract_flagship" },

  // ── Mission 4: The Digit Sum ──
  { mission: 4, title: "The Digit Sum",
    brief: 'Sum the numeric values of ALL digit characters in a string.\nFor mixed = "a2b3c5":\nDigit Sum: 10',
    skeleton: [
      "String mixed = /* test value */;",
      "int sum = 0;",
      "",
      "for (int i = 0; i < mixed.length(); i++) {",
      "    char ch = mixed.charAt(i);",
      "    if (Character.isDigit(ch)) {",
      "        sum = sum + <slot:extract>;",
      "    }",
      "}",
      'System.out.println("Digit Sum: " + sum);',
    ],
    slots: [{ id: "extract", hint: "the digit's numeric value" }],
    palette: [
      { code: "ch - '0'", correct: true, slotId: "extract" },
      { code: "ch", tag: "char_is_its_number_belief", slotId: "extract" },
      { code: "(int) ch", tag: "cast_gives_ascii", slotId: "extract" },
      { code: "1", tag: "counting_not_summing", slotId: "extract" },
      { code: "Integer.parseInt(ch)", tag: "parseInt_takes_char_belief", slotId: "extract" },
    ],
    tests: [
      { substitutions: { mixed: '"a2b3c5"' }, expectedOutput: "Digit Sum: 10" },
      { substitutions: { mixed: '"999"' }, expectedOutput: "Digit Sum: 27" },
      { substitutions: { mixed: '"HELLO"' }, expectedOutput: "Digit Sum: 0" },
      { substitutions: { mixed: '"1"' }, expectedOutput: "Digit Sum: 1" },
    ],
    postMissionNote: "Bit: 'The loop walks; charAt extracts; isDigit guards; ch - \"0\" converts; sum accumulates. The ASCII distractor would have given 154 for \"a2b3c5\" (adding codes 50+51+53). ch - \"0\" gave the VALUES (2+3+5=10). The extraction reference on the wall is there for a reason.'",
    concept: "digit_sum_pattern" },

  // ── Mission 5: The Validated Input (Scanner + isDigit guard) ──
  { mission: 5, title: "The Validated Input",
    brief: "Read a single character from the user. If it's a digit, print its value doubled. Otherwise print 'Invalid'.\nFor input \"7\": Doubled: 14\nFor input \"x\": Invalid",
    skeleton: [
      "Scanner sc = new Scanner(System.in);",
      "",
      "char input = sc.nextLine().charAt(0);",
      "",
      "if (<slot:guard>) {",
      "    int val = <slot:extract>;",
      '    System.out.println("Doubled: " + (val * 2));',
      "} else {",
      '    System.out.println("Invalid");',
      "}",
    ],
    slots: [
      { id: "guard", hint: "validate the input" },
      { id: "extract", hint: "extract the digit value" },
    ],
    isCrossWing: true,
    palette: [
      { code: "Character.isDigit(input)", correct: true, slotId: "guard" },
      { code: "input != '0'", tag: "wrong_guard_logic", slotId: "guard" },
      { code: "input - '0'", correct: true, slotId: "extract" },
      { code: "input", tag: "char_is_its_number_belief", slotId: "extract" },
      { code: "(int) input", tag: "cast_gives_ascii", slotId: "extract" },
      { code: "Integer.parseInt(input)", tag: "parseInt_takes_char_belief", slotId: "extract" },
    ],
    tests: [
      { input: ["7"], expectedOutput: "Doubled: 14" },
      { input: ["0"], expectedOutput: "Doubled: 0" },
      { input: ["x"], expectedOutput: "Invalid" },
    ],
    postMissionNote: "Bit: 'Scanner reads the line; charAt(0) extracts the first gem; isDigit guards; ch - \"0\" converts. The wrong-guard distractor (input != \"0\") would have REJECTED zero — a valid digit. isDigit accepts ALL ten digits, including zero. Three wings collaborating: Intake reads, String extracts, Character classifies.'",
    concept: "validated_input_pipeline" },

  // ── Mission 6: The Character Census (GRAND CAPSTONE) ──
  { mission: 6, title: "The Character Census",
    brief: 'Analyze a string and report the count of digits and the count of non-digits.\nFor data = "R2D2C3":\nDigits: 3\nOther: 3',
    skeleton: [
      "String data = /* test value */;",
      "int digits = 0;",
      "int other = 0;",
      "",
      "for (int i = 0; i < data.length(); i++) {",
      "    if (<slot:check>) {",
      "        <slot:incD>",
      "    } else {",
      "        <slot:incO>",
      "    }",
      "}",
      'System.out.println("Digits: " + digits);',
      'System.out.println("Other: " + other);',
    ],
    slots: [
      { id: "check", hint: "classify each character" },
      { id: "incD", hint: "count a digit" },
      { id: "incO", hint: "count a non-digit" },
    ],
    isCapstone: true,
    palette: [
      { code: "Character.isDigit(data.charAt(i))", correct: true, slotId: "check" },
      { code: "Character.isDigit(data)", tag: "isDigit_takes_string_belief", slotId: "check" },
      { code: "digits++;", correct: true, slotId: "incD" },
      { code: "other++;", correct: true, slotId: "incO" },
      { code: "digits++;", tag: "wrong_counter_swapped", slotId: "incO" },
      { code: "other++;", tag: "wrong_counter_swapped", slotId: "incD" },
    ],
    tests: [
      { substitutions: { data: '"R2D2C3"' }, expectedOutput: "Digits: 3⏎Other: 3" },
      { substitutions: { data: '"12345"' }, expectedOutput: "Digits: 5⏎Other: 0" },
      { substitutions: { data: '"HELLO"' }, expectedOutput: "Digits: 0⏎Other: 5" },
      { substitutions: { data: '"A1"' }, expectedOutput: "Digits: 1⏎Other: 1" },
    ],
    postMissionNote: "Bit (closing the classification ledger, chain glinting): 'The Character Census — every character classified, every category counted. isDigit divided the string into two families: the digits that glowed and the rest that stayed dim. The loop-extract-classify-count pattern, complete with an else branch for the other side. Master Gemologist — the loupe is fully yours. Two more instruments await in the deeper halls.'",
    concept: "character_census_capstone" },
];

const MISCONCEPTION_FEEDBACK = {
  char_is_its_number_belief: "Assigning a digit char to int gives the ASCII CODE (52 for '4'), not the value (4). Only ch - '0' extracts the meaning from the encoding.",
  cast_gives_ascii: "(int) ch gives the same ASCII code as a plain assignment — 52 for '4'. Casting is widening, not extracting. Use ch - '0'.",
  classify_after_extract: "Extract AFTER classifying, not before. isDigit must approve the gem before ch - '0' processes it — otherwise you'd subtract '0' from a letter, getting a meaningless number.",
  extract_without_guard: "Without the isDigit guard, ch - '0' runs on ANY char — letters, punctuation, spaces. The subtraction would produce garbage. Guard first, extract second.",
  counting_not_summing: "Adding 1 per digit COUNTS them (3 digits); adding ch - '0' SUMS their values (2+3+5=10). The mission wants the sum, not the count.",
  loop_bound_wrong: "code.length() - 1 misses the last character. The loop runs i from 0 up to (but not including) the bound already — length() itself is the correct bound.",
  isDigit_takes_string_belief: "isDigit takes CHAR, not String. Extract with charAt first: Character.isDigit(code.charAt(i)).",
  wrong_classification_method: "isLetter counts LETTERS, not digits. You need isDigit to count digit characters.",
  wrong_counter_swapped: "The counters are swapped — digits++ belongs in the if-true branch (when isDigit passes); other++ belongs in the else branch.",
  wrong_guard_logic: "input != '0' rejects the digit ZERO — a valid digit! isDigit accepts ALL ten digits (0-9) including zero.",
  char_compared_to_int_belief: "ch >= 0 compares the char to int 0 (code 0 — the null character), not '0' (code 48). For digit range: ch >= '0' && ch <= '9'. But isDigit is cleaner.",
  parseInt_takes_char_belief: "parseInt takes a STRING, not a char. For a single digit char, use ch - '0'. For a full numeric String, use parseInt.",
  character_lowercase_belief: "Character with a capital C — the wrapper class. 'character' (lowercase) doesn't exist.",
  isDigit_instance_call_belief: "Character.isDigit — static. Not ch.isDigit(). The loupe belongs to Character, not to the gem.",
  isDigit_converts_belief: "isDigit CLASSIFIES (returns boolean). It does NOT convert. Conversion is parseInt or ch - '0'.",
  digit_as_literal: "'digit' is multi-character — char can only hold ONE character in single quotes. This is a compile error.",
};

const HINTS = {
  1: "Character.isDigit(ch) — classify the gem, store the verdict.",
  2: "code.length() for the bound; Character.isDigit(code.charAt(i)) to classify each character.",
  3: "Character.isDigit(ch) guards the if; ch - '0' extracts the numeric value inside it.",
  4: "sum = sum + (ch - '0') — accumulate the VALUE, not the count, not the ASCII code.",
  5: "Character.isDigit(input) to validate; input - '0' to extract the value.",
  6: "Character.isDigit(data.charAt(i)) to classify; digits++ in the if-branch, other++ in the else-branch.",
};

export class Level82Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level82Scene" });
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
    this.classifyExtractProactive = {};
    this.counterClean = {};
    this.extractClean = {};
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
    this.createWorksInterior();
    this.createQualitySeal();
    this.createWorksFloor();
    this.createAmbientParticles();
    this.createCodeCanvas();
    this.createBlockPalette();
    this.createRunButton();
    this.createRigWindow();
    this.createMiniLoupe();
    this.createCharAtStage();
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
    this.updateSealPulse(time);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // SETUP — THE CLASSIFICATION WORKS INTERIOR
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l82_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l82_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x0a1428).setDepth(0);
  }

  createWorksInterior() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x0a1428, 1);
    g.fillRect(0, 0, W, 30);

    // Production manifest board
    g.fillStyle(0x081224, 0.6);
    g.lineStyle(3, C_SILVER, 0.7);
    g.fillRect(200, 30, 580, 140);
    g.strokeRect(200, 30, 580, 140);
    this._manifestCards = [];
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 4; c++) {
        const cx = 230 + c * 135, cy = 55 + r * 55;
        const cardG = this.add.graphics().setDepth(2);
        cardG.fillStyle(C_SILVER, 0.12);
        cardG.lineStyle(1, C_SILVER, 0.3);
        cardG.fillRoundedRect(cx, cy, 110, 40, 3);
        cardG.strokeRoundedRect(cx, cy, 110, 40, 3);
        const dot = this.add.circle(cx + 10, cy + 10, 3, C_SILVER, 0.5).setDepth(3);
        this._manifestCards.push({ g: cardG, dot, cx, cy });
      }
    }

    // Digit-extraction reference diagram (left wall)
    const rg = this.add.graphics().setDepth(2).setAlpha(0.4);
    rg.lineStyle(2, C_SILVER, 0.6);
    rg.strokeRect(60, 100, 100, 100);
    const gemPts = [];
    for (let i = 0; i < 6; i++) { const a = (Math.PI / 3) * i; gemPts.push({ x: 85 + Math.cos(a) * 8, y: 122 + Math.sin(a) * 8 }); }
    rg.fillStyle(C_GOLD, 0.5);
    rg.fillPoints(gemPts, true);
    this.add.text(85, 122, "7", { font: "bold 9px Courier New", color: "#0a1428" }).setOrigin(0.5).setDepth(3).setAlpha(0.7);
    this.add.text(110, 122, "→", { font: "bold 10px Georgia", color: HEX_SILVER }).setOrigin(0.5).setDepth(3).setAlpha(0.5);
    this.add.text(85, 150, "isDigit? ✓", { font: "8px Georgia", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(3).setAlpha(0.5);
    this.add.text(85, 165, "ch - '0'", { font: "8px Courier New", color: HEX_SILVER }).setOrigin(0.5).setDepth(3).setAlpha(0.5);
    this.add.text(85, 180, "→ 7", { font: "bold 9px Courier New", color: HEX_GOLD }).setOrigin(0.5).setDepth(3).setAlpha(0.5);
    this._extractionRefGfx = rg;

    // Completed-analyses shelf (right wall)
    const sg = this.add.graphics().setDepth(2).setAlpha(0.25);
    sg.lineStyle(1.5, C_SILVER, 0.5);
    sg.strokeRect(1140, 100, 100, 60);
    this._analysesShelf = [];
    [[1160, 130], [1190, 130], [1220, 130]].forEach(([x, y]) => {
      const gg = this.add.graphics().setDepth(3);
      const pts = [];
      for (let i = 0; i < 6; i++) { const a = (Math.PI / 3) * i; pts.push({ x: x + Math.cos(a) * 6, y: y + Math.sin(a) * 6 }); }
      gg.fillStyle(C_GOLD, 0.3);
      gg.fillPoints(pts, true);
      const check = this.add.text(x, y, "✓", { font: "bold 9px Arial", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(4).setAlpha(0.5);
      this._analysesShelf.push({ g: gg, check, x, y });
    });

    // Banner
    const bg = this.add.graphics().setDepth(2);
    bg.fillStyle(0x0a1428, 1);
    bg.lineStyle(1, C_SILVER, 0.5);
    bg.fillRoundedRect(440, 12, 400, 26, 3);
    bg.strokeRoundedRect(440, 12, 400, 26, 3);
    this.add.text(640, 25, "T H E   C L A S S I F I C A T I O N   W O R K S", { font: "bold 14px Georgia", color: HEX_SILVER }).setOrigin(0.5).setAlpha(0.7).setDepth(3);
  }

  createQualitySeal() {
    const c = this.add.container(880, 56).setDepth(4);
    const g = this.add.graphics();
    g.lineStyle(2, C_SILVER, 1);
    g.strokeCircle(0, 0, 18);
    const label = this.add.text(0, 0, "QA", { font: "bold 12px Georgia", color: HEX_CYAN }).setOrigin(0.5);
    c.add([g, label]);
    c.setAlpha(0.4);
    this._qaSeal = { c, g, label, state: "idle" };
  }

  pulseSeal(state) {
    const s = this._qaSeal;
    s.state = state;
    if (state === "idle") s.c.setAlpha(0.4);
    else if (state === "session") s.c.setAlpha(0.8);
    else if (state === "gold") {
      this.tweens.add({
        targets: s.c, scaleX: 0, duration: 150,
        onComplete: () => {
          s.g.lineStyle(2, C_GOLD, 1);
          s.g.strokeCircle(0, 0, 18);
          s.label.setColor(HEX_GOLD);
          s.c.setAlpha(1);
          this.tweens.add({ targets: s.c, scaleX: 1, duration: 150 });
        },
      });
    }
  }

  updateSealPulse(time) {
    if (!this._qaSeal || this._qaSeal.state !== "session") return;
    this._qaSeal.c.setAlpha(0.6 + Math.abs(Math.sin(time * 0.006)) * 0.4);
  }

  createWorksFloor() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x06101e, 1);
    g.fillRect(0, 635, W, 85);
    g.lineStyle(1, 0x0e1830, 0.5);
    g.lineBetween(0, 637, W, 637);
    g.fillStyle(C_SILVER, 0.15);
    for (let x = 0; x < W; x += 100) g.fillRect(x, 637, 3, 83);
  }

  createAmbientParticles() {
    this.ambient = [];
    const colors = [C_INDIGO, C_SILVER, C_CYAN];
    for (let i = 0; i < 7; i++) {
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
    const p = this.add.particles(x, y, "l82_dot", {
      speed: { min: 80, max: 240 }, angle: { min: 0, max: 360 }, scale: { start: 0.9, end: 0 }, lifespan: 500,
      tint: [C_GOLD, C_SILVER, C_INDIGO, 0xffffff], emitting: false,
    }).setDepth(95);
    p.explode(count);
    this.time.delayedCall(900, () => p.destroy());
  }

  createFinaleConfetti(x, y, count = 40) {
    const p = this.add.particles(x, y, "l82_dot", {
      speed: { min: 100, max: 280 }, angle: { min: 0, max: 360 }, scale: { start: 1, end: 0 }, lifespan: 700,
      tint: [C_GOLD, C_SILVER, C_INDIGO, 0xffffff], emitting: false,
    }).setDepth(96);
    p.explode(count);
    this.time.delayedCall(1100, () => p.destroy());
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
    this.tabFilename = this.add.text(CX + CW - 12, CY + TAB_H / 2, "Classify1.java", { font: "13px Courier New", color: "#546e7a" }).setOrigin(1, 0.5).setDepth(11);

    this.lineHighlight = this.add.rectangle(CX + CW / 2, 0, CW - 4, LINE_H, 0xffab00, 0.06).setDepth(19).setVisible(false);
    this.codeContainer = this.add.container(0, 0).setDepth(20);
  }

  _syntaxTokens(line) {
    const tokens = [];
    const re = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\bimport\b|\bfor\b|\bint\b|\bdouble\b|\bString\b|\bboolean\b|\bchar\b|\bnew\b|\bScanner\b|\bif\b|\belse\b)|(\bCharacter\b|\bInteger\b)|(\.isDigit\b|\.isLetter\b|\.charAt\b|\.parseInt\b|\.nextLine\b|\.length\b|\.println\b)|(\bSystem\.out\b|\bSystem\.in\b)|(-?\d+\.\d+|-?\d+)|(>=|<=|==|!=|\+\+|--|&&|[+\-*/><?:%])|([(){}\[\];.,=])/g;
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
    this.add.text(PX + 10, PY + 8, "GEMOLOGIST'S PARTS", { font: "bold 11px Arial", color: "#3d4450" }).setDepth(11);
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
    g.lineStyle(3, C_SILVER, 1);
    g.strokeRoundedRect(OX, OY, OW, OH, 12);
    this.add.text(OX + 10, OY + 6, "WORKS RIG — LIVE", { font: "bold 11px Georgia", color: HEX_SILVER }).setAlpha(0.7).setDepth(11);

    const maskShape = this.make.graphics({ x: 0, y: 0, add: false });
    maskShape.fillRoundedRect(OX + 4, OY + 20, OW - 8, OH - 24, 10);
    this.windowMask = maskShape.createGeometryMask();
    this.rigLayer = this.add.container(0, 0).setDepth(15);
    this.rigLayer.setMask(this.windowMask);

    this.verdictLamp = this.add.circle(OX + OW - 18, OY + 14, 6, C_GRAY).setDepth(20);
  }

  getGemFamily(ch) {
    if (/[0-9]/.test(ch)) return "digit";
    if (/[A-Za-z]/.test(ch)) return "letter";
    return "other";
  }

  getGemColor(family) {
    if (family === "digit") return { fill: C_GOLD, stroke: 0xb8860b };
    if (family === "letter") return { fill: C_BLUE_LETTER, stroke: 0x1565c0 };
    return { fill: C_GRAY, stroke: 0x455a64 };
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

  // ══════════════════════════════════════════════════════════════
  // MINI CLASSIFICATION LOUPE — reused from L80/L81's hero mechanic,
  // compacted to production scale. Every isDigit call runs the
  // honest inspection.
  // ══════════════════════════════════════════════════════════════

  createMiniLoupe() {
    const cx = (LOUPE_X0 + LOUPE_X1) / 2;
    const frameG = this.add.graphics();
    frameG.lineStyle(1.2, C_SILVER, 0.5);
    frameG.strokeRoundedRect(LOUPE_X0, MINI_Y0, LOUPE_X1 - LOUPE_X0, MINI_Y1 - MINI_Y0, 4);
    const t = this.add.text(cx, MINI_Y0 - 9, "LOUPE", { font: "bold 8px Georgia", color: HEX_SILVER }).setOrigin(0.5).setAlpha(0.5);
    this.rigLayer.add([frameG, t]);

    this.loupeDynamicLayer = this.add.container(0, 0);
    this.rigLayer.add(this.loupeDynamicLayer);

    this._loupeVerdictText = this.add.text(cx, MINI_Y1 - 10, "—", { font: "bold 10px Courier New", color: HEX_GRAY }).setOrigin(0.5);
    this.rigLayer.add(this._loupeVerdictText);
  }

  clearMiniLoupe() {
    this.loupeDynamicLayer.removeAll(true);
    this._loupeVerdictText.setText("—").setColor(HEX_GRAY);
  }

  async runMiniClassification(ch, code, result) {
    const cx = (LOUPE_X0 + LOUPE_X1) / 2, cy = MINI_Y0 + 28;
    const displayCh = ch !== null ? this._displayChar(ch) : `[${code}]`;
    const family = ch !== null ? this.getGemFamily(ch) : "other";
    const colors = this.getGemColor(family);

    const gem = this.add.container(cx, cy).setAlpha(0).setScale(0.6).setDepth(21);
    const gg = this.add.graphics();
    const pts = [];
    for (let i = 0; i < 8; i++) { const a = (Math.PI / 4) * i; pts.push({ x: Math.cos(a) * 11, y: Math.sin(a) * 11 }); }
    gg.fillStyle(colors.fill, 1);
    gg.lineStyle(1.2, colors.stroke, 1);
    gg.fillPoints(pts, true);
    gg.strokePoints(pts, true);
    const txt = this.add.text(0, 0, displayCh, { font: "bold 11px Courier New", color: "#0a1428" }).setOrigin(0.5);
    if (txt.width > 18) txt.setFontSize(6);
    gem.add([gg, txt]);
    this.loupeDynamicLayer.add(gem);
    this.tweens.add({ targets: gem, alpha: 1, scale: 1, duration: 100 });
    await this.delay(90);

    if (result) {
      gg.clear();
      gg.fillStyle(0xffe082, 1);
      gg.lineStyle(1.2, colors.stroke, 1);
      gg.fillPoints(pts, true);
      gg.strokePoints(pts, true);
      this._loupeVerdictText.setText("TRUE").setColor(HEX_GREEN_BRIGHT);
      this.screenShake(0.0012, 50);
    } else {
      this._loupeVerdictText.setText("FALSE").setColor(HEX_GRAY);
    }
    await this.delay(130);
    this.tweens.add({ targets: gem, alpha: 0, duration: 120, delay: 60, onComplete: () => gem.destroy() });
    await this.delay(90);
    return result;
  }

  // ══════════════════════════════════════════════════════════════
  // CHAR-AT EXTRACTION STAGE — a String strip with a pointer on the
  // current index; the extracted char-gem lifts toward the loupe.
  // ══════════════════════════════════════════════════════════════

  createCharAtStage() {
    const cx = (CHARAT_X0 + CHARAT_X1) / 2;
    const frameG = this.add.graphics();
    frameG.lineStyle(1.2, C_SILVER, 0.5);
    frameG.strokeRoundedRect(CHARAT_X0, MINI_Y0, CHARAT_X1 - CHARAT_X0, MINI_Y1 - MINI_Y0, 4);
    const t = this.add.text(cx, MINI_Y0 - 9, "EXTRACT", { font: "bold 8px Georgia", color: HEX_SILVER }).setOrigin(0.5).setAlpha(0.5);
    this.rigLayer.add([frameG, t]);
    this.charAtDynamicLayer = this.add.container(0, 0);
    this.rigLayer.add(this.charAtDynamicLayer);
  }

  clearCharAtStage() { this.charAtDynamicLayer.removeAll(true); }

  async runCharAtExtraction(str, index) {
    const cx = (CHARAT_X0 + CHARAT_X1) / 2, cy = MINI_Y0 + 22;
    const stripLen = Math.min(str.length, 8);
    const cellW = 12;
    const startX = cx - (stripLen * cellW) / 2;
    const cells = [];
    for (let i = 0; i < stripLen; i++) {
      const t = this.add.text(startX + i * cellW + cellW / 2, cy, this._displayChar(str[i]), { font: "bold 10px Courier New", color: i === index ? HEX_GOLD : "#e0e6f0" }).setOrigin(0.5);
      this.charAtDynamicLayer.add(t);
      cells.push(t);
    }
    if (index >= 0 && index < stripLen) {
      const pointer = this.add.text(startX + index * cellW + cellW / 2, cy + 12, "▲", { font: "bold 10px Arial", color: HEX_GOLD }).setOrigin(0.5).setAlpha(0);
      this.charAtDynamicLayer.add(pointer);
      this.tweens.add({ targets: pointer, alpha: 1, duration: 100 });
      await this.delay(90);

      const ch = str[index];
      const colors = this.getGemColor(this.getGemFamily(ch));
      const gem = this.add.container(startX + index * cellW + cellW / 2, cy).setScale(0.5).setAlpha(0).setDepth(22);
      const gg = this.add.graphics();
      const pts = [];
      for (let i2 = 0; i2 < 8; i2++) { const a = (Math.PI / 4) * i2; pts.push({ x: Math.cos(a) * 9, y: Math.sin(a) * 9 }); }
      gg.fillStyle(colors.fill, 1);
      gg.lineStyle(1, colors.stroke, 1);
      gg.fillPoints(pts, true);
      gg.strokePoints(pts, true);
      gem.add(gg);
      this.charAtDynamicLayer.add(gem);
      this.tweens.add({ targets: gem, alpha: 1, scale: 1, duration: 90 });
      await this.delay(70);
      await new Promise((res) => { this.tweens.add({ targets: gem, x: (LOUPE_X0 + LOUPE_X1) / 2, y: MINI_Y0 + 28, duration: 160, onComplete: res }); });
      gem.destroy();
    }
    await this.delay(50);
    this.tweens.add({ targets: cells, alpha: 0, duration: 140, delay: 130 });
  }

  // ══════════════════════════════════════════════════════════════
  // LOOP TRACKER — per-iteration rows: char, isDigit verdict,
  // running count. Scrolls to keep the most recent 5 iterations.
  // ══════════════════════════════════════════════════════════════

  createLoopTracker() {
    const g = this.add.graphics();
    g.lineStyle(1, C_INDIGO, 0.5);
    g.strokeRoundedRect(OX + 8, TRACKER_Y0, OW - 16, TRACKER_Y1 - TRACKER_Y0, 4);
    const t = this.add.text(OX + 12, TRACKER_Y0 + 2, "LOOP TRACKER", { font: "bold 8px Georgia", color: HEX_INDIGO }).setAlpha(0.6);
    this.trackerLayer = this.add.container(0, 0);
    this.rigLayer.add([g, t, this.trackerLayer]);
    this._trackerRows = [];
  }

  clearLoopTracker() {
    this.trackerLayer.removeAll(true);
    this._trackerRows = [];
  }

  updateLoopTracker(iteration, ch, isDigitResult, count) {
    const display = ch !== null ? this._displayChar(ch) : "—";
    const text = `${display} → ${isDigitResult ? "true" : "false"}  (n=${count})`;
    const t = this.add.text(OX + 14, 0, text, { font: "9px Courier New", color: isDigitResult ? HEX_GREEN_BRIGHT : HEX_GRAY });
    this.trackerLayer.add(t);
    this._trackerRows.push(t);
    if (this._trackerRows.length > 5) {
      const old = this._trackerRows.shift();
      old.destroy();
    }
    this._trackerRows.forEach((r, idx) => { r.setY(TRACKER_Y0 + 14 + idx * 10); });
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
  // VARIABLES STRIP — "mini typed containers" (left column): char
  // silver, boolean cyan, int gold, String cream.
  // ══════════════════════════════════════════════════════════════

  createVariablesStrip() {
    const hdr = this.add.text(CONT_X0 + 4, MINI_Y0 - 9, "VARIABLES", { font: "bold 8px Georgia", color: HEX_SILVER }).setAlpha(0.6);
    const frameG = this.add.graphics();
    frameG.lineStyle(1.2, C_SILVER, 0.5);
    frameG.strokeRoundedRect(CONT_X0, MINI_Y0, CONT_X1 - CONT_X0, MINI_Y1 - MINI_Y0, 4);
    this.varsContainer = this.add.container(0, 0);
    this.rigLayer.add([frameG, hdr, this.varsContainer]);
  }

  clearVariablesStrip() { this.varsContainer.removeAll(true); }

  updateVariablesStrip(vars) {
    this.varsContainer.removeAll(true);
    let idx = 0;
    for (const name in vars) {
      const v = vars[name];
      const y = MINI_Y0 + 12 + idx * 11;
      let display;
      if (v.type === "String") display = `"${v.value}"`;
      else if (v.type === "char") display = `'${this._displayChar(v.value)}'`;
      else display = String(v.value);
      const text = `${name}=${display}`.slice(0, 20);
      const color = v.type === "boolean" ? HEX_CYAN : v.type === "int" ? HEX_GOLD : v.type === "char" ? HEX_SILVER : "#e0e6f0";
      const t = this.add.text(CONT_X0 + 6, y, text, { font: "bold 6.5px Courier New", color }).setOrigin(0, 0.5);
      this.varsContainer.add(t);
      idx++;
      if (idx >= 5) break;
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
    const badge = this.add.circle(BX + 24, BY + 24, 13, C_SILVER);
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

    this.add.text(20, 14, "THE CLASSIFICATION WORKS", { font: "bold 15px Georgia", color: "#b0bec5" }).setDepth(51);
    this.add.text(20, 32, "Restructuring Phase — Character Methods: isDigit()", { font: "12px Arial", color: "#546e7a" }).setDepth(51);

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
  // BIT — MASTER GEMOLOGIST VARIANT (vest, silver chain, ledger,
  // monocle kept)
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
    const vest = this.add.graphics();
    vest.fillStyle(0x0e1830, 0.9);
    vest.lineStyle(1, C_SILVER, 0.8);
    vest.fillTriangle(-15, -12, 15, -12, 0, 14);
    vest.strokeTriangle(-15, -12, 15, -12, 0, 14);

    // Silver master's chain — linked gem-shaped links
    const chainG = this.add.graphics();
    chainG.lineStyle(1.3, C_SILVER, 0.9);
    chainG.beginPath();
    chainG.arc(0, -13, 12, Phaser.Math.DegToRad(25), Phaser.Math.DegToRad(155), false);
    chainG.strokePath();
    for (let i = 0; i < 3; i++) {
      const a = Phaser.Math.DegToRad(60 + i * 30);
      chainG.fillStyle(C_SILVER, 0.6);
      chainG.fillCircle(Math.cos(a) * 12, -13 + Math.sin(a) * 12, 1.2);
    }

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

    // Classification ledger — slim notebook, silver binding
    const ledger = this.add.container(17, 10);
    const ledgerG = this.add.graphics();
    ledgerG.fillStyle(0x0e1830, 1);
    ledgerG.lineStyle(1, C_SILVER, 0.7);
    ledgerG.fillRoundedRect(-4, -8, 8, 13, 1);
    ledgerG.strokeRoundedRect(-4, -8, 8, 13, 1);
    ledgerG.lineStyle(0.7, C_SILVER, 0.9);
    ledgerG.lineBetween(-4, -8, -4, 5);
    ledger.add(ledgerG);

    c.add([g, vest, chainG, eye, pupil, monocle, gloveL, ledger, tip]);
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
    await this.bitSay("The Classification Works, Gemologist — where the loupe's verdicts become real programs. You've classified gems and drilled char arithmetic; tonight you BUILD the workflows that validate, count, and extract. Every mission processes characters through the loupe.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(5500)]); if (!A()) return;
    this.hideBubble();

    const a1 = this.floatingAnnotation(CX + CW / 2, CY - 16, "the validation program", HEX_CYAN);
    await this.delay(400); if (!A()) return;
    const a2 = this.floatingAnnotation(PX + PW / 2, PY - 12, "blocks — one extracts without checking, one passes a String", HEX_GRAY);
    await this.delay(400); if (!A()) return;
    const a3 = this.floatingAnnotation(OX + OW / 2, OY - 12, "loupe, extractor, and loop tracker — LIVE", HEX_GREEN_BRIGHT);
    await this.delay(400); if (!A()) return;
    const a4 = this.floatingAnnotation(880, 44, "the quality seal watches", HEX_GOLD);
    await this.delay(400); if (!A()) return;
    const a5 = this.floatingAnnotation(RX + RW / 2, RY - 12, "every scenario must verify", HEX_BLUE_GRAY);
    await this.delay(400); if (!A()) return;

    await this.bitSay("The works' three laws: classify BEFORE you extract — isDigit guards, ch - '0' converts; charAt extracts from Strings — the loupe takes chars, not Strings; and loop-extract-classify is the pattern. Build, run, verify, repair.");
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
    g.fillStyle(0x0e1830, 1);
    g.fillRoundedRect(-260, -105, 520, 210, 12);
    g.lineStyle(2, C_SILVER, 1);
    g.strokeRoundedRect(-260, -105, 520, 210, 12);
    g.fillStyle(C_SILVER, 1);
    g.fillRect(-260, -105, 5, 210);
    const badge = this.add.circle(-225, -75, 18, C_SILVER);
    const badgeNum = this.add.text(-225, -75, String(mission.mission), { font: "bold 18px Arial", color: "#0a0e14" }).setOrigin(0.5);
    const title = this.add.text(-195, -85, mission.title, { font: "bold 21px Arial", color: "#ffffff" }).setOrigin(0, 0.5);
    const desc = this.add.text(-225, -35, mission.brief, { font: "12.5px Arial", color: "#b0bec5", wordWrap: { width: 460 } }).setOrigin(0, 0);

    const startBtn = this.add.container(0, 85).setDepth(1);
    const sg = this.add.graphics();
    sg.fillStyle(C_SILVER, 1);
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

    this.tabFilename.setText(`Classify${mission.mission}.java`);
    this.renderSkeleton(mission);
    this.populatePalette(mission);
    this.buildReportRows(mission);
    this.renderMissionBrief(mission);
    this.disableRunButton();
    this.highlightCodeLine(null);
    this.verdictLamp.setFillStyle(C_GRAY);
    this.clearMiniLoupe();
    this.clearCharAtStage();
    this.clearLoopTracker();
    this.clearTicker();
    this.clearVariablesStrip();
    this.parkScannerCameo();
    this.updateManifestStrip("");
    this.updateResultRow(null, null);
    this.pulseSeal("idle");

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

  // ══════════════════════════════════════════════════════════════
  // PROACTIVE-METRIC DETECTION
  // ══════════════════════════════════════════════════════════════

  _recordFirstRunMetrics(mission) {
    const key = `mission${mission.mission}`;
    if (this._firstRunMetricsRecorded[key]) return;
    this._firstRunMetricsRecorded[key] = true;

    if (mission.mission === 3) {
      this.classifyExtractProactive[key] = this._slotCode("guard") === "Character.isDigit(ch)" && this._slotCode("extract") === "ch - '0'";
      this.extractClean[key] = this._slotCode("extract") === "ch - '0'";
    }
    if (mission.mission === 5) {
      this.classifyExtractProactive[key] = this._slotCode("guard") === "Character.isDigit(input)" && this._slotCode("extract") === "input - '0'";
    }
    if (mission.mission === 4) {
      this.extractClean[key] = this._slotCode("extract") === "ch - '0'";
    }
    if (mission.mission === 2) {
      this.counterClean[key] = this._slotCode("bound") === "code.length()" && this._slotCode("check") === "Character.isDigit(code.charAt(i))";
    }
    if (mission.mission === 6) {
      this.counterClean[key] = this._slotCode("check") === "Character.isDigit(data.charAt(i))" && this._slotCode("incD") === "digits++;" && this._slotCode("incO") === "other++;";
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
    this.pulseSeal("session");
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
    this.clearMiniLoupe();
    this.clearCharAtStage();
    this.clearLoopTracker();
    this.clearTicker();
    this.clearVariablesStrip();
    this.updateManifestStrip("");
    this.updateResultRow(null, null);

    if (mission.isCrossWing) { this.parkScannerCameo(); this.activateScannerCameo(); this.loadMiniTape(test.input); }

    this._printedLines = [];
    const execLines = items.map((it) => this._substituteTestLine(it, test));
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
      console.warn("Level82Scene: /api/wellbeing/predict-struggle unreachable, skipping behavioral signal for this level:", e);
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

    this.pulseSeal("idle");
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
    const mission = MISSIONS[this.currentMission];
    this.showBitFeedback(HINTS[mission.mission] || "Reread the brief carefully — the answer is in the wording.");
  }

  onMissionComplete() {
    if (this.currentMission === 2) this.runBehavioralCheck();
    if (this.gameEnded) return;
    const flawless = this.missionRunsFailed === 0 && !this.missionHintUsed;
    if (flawless) this.flawlessCount++;
    this.updateScore(250 + (flawless ? 100 : 0));
    if (flawless) this.createFloatingText(OX + OW / 2, OY - 14, "FLAWLESS +100", HEX_GOLD, "bold 16px Arial");
    this.pulseSeal("gold");

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
    const card = this._manifestCards[this.currentMission];
    if (card) {
      card.g.clear();
      card.g.fillStyle(C_GREEN_BRIGHT, 0.25);
      card.g.lineStyle(1, C_GREEN_BRIGHT, 0.6);
      card.g.fillRoundedRect(card.cx, card.cy, 110, 40, 3);
      card.g.strokeRoundedRect(card.cx, card.cy, 110, 40, 3);
      card.dot.setFillStyle(C_GREEN_BRIGHT, 0.9);
    }
    const mission = MISSIONS[this.currentMission];
    await this.bitSay(mission.postMissionNote || "Clean certification — the rig confirms it.");
    await Promise.race([this.waitForClick(), this.delay(2400)]);
    this.hideBubble();
    await this.delay(400);
  }

  // ══════════════════════════════════════════════════════════════
  // UNIFIED INTERPRETER — merges L80/L81's isDigit/char-arithmetic
  // cascade with L79's restructuring engine (Scanner, for/if blocks,
  // reassignment). New to this level:
  //  - A bare reassignment statement (`sum = sum + expr;`) — M4's
  //    running total. No prior L80/L81 round ever mutated an already-
  //    declared variable without a fresh declaration.
  //  - Chained `sc.nextLine().charAt(idx)` — M5. Every prior charAt
  //    call was on a plain variable; this is the first call chained
  //    directly onto a Scanner read.
  //  - `(int)` cast (paralleling L81's `(char)` cast) — the M3/M4/M5
  //    "(int) ch" distractor, confirmed by hand-trace to honestly give
  //    the char's code point, matching real Java.
  //  - charAt/isDigit both drive their rig visuals (extraction stage,
  //    mini loupe) and stash their last result so the for-loop handler
  //    can feed the loop tracker after each iteration.
  // ══════════════════════════════════════════════════════════════

  _stripOuterParens(t) {
    if (t[0] !== "(" || t[t.length - 1] !== ")") return t;
    let depth = 0;
    for (let i = 0; i < t.length; i++) {
      if (t[i] === "(") depth++;
      else if (t[i] === ")") {
        depth--;
        if (depth === 0 && i < t.length - 1) return t;
      }
    }
    return t.slice(1, -1).trim();
  }

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

  _splitMultiplicative(expr) {
    const parts = [];
    let cur = "", inQuotes = false, depth = 0, curOp = null;
    for (let i = 0; i < expr.length; i++) {
      const ch = expr[i];
      if ((ch === '"' || ch === "'") && expr[i - 1] !== "\\") inQuotes = !inQuotes;
      if (!inQuotes) {
        if (ch === "(" || ch === "[") depth++;
        else if (ch === ")" || ch === "]") depth--;
        else if ((ch === "*" || ch === "/") && depth === 0) {
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

  _javaToString(value, type) {
    if (type === "double") return Number.isInteger(value) ? `${value}.0` : String(value);
    return String(value);
  }

  _toNum(value, type) { return type === "char" ? value.charCodeAt(0) : Number(value); }

  async resolveExpr(expr, vars) {
    const t = this._stripOuterParens(expr.trim());

    const charCastMatch = t.match(/^\(char\)\s*(.+)$/);
    if (charCastMatch) {
      const inner = await this.resolveExpr(charCastMatch[1].trim(), vars);
      if (!inner.ok) return inner;
      if (inner.type === "String") { this.showCompileErrorStamp(); return { ok: false, crash: "compile" }; }
      const code = this._toNum(inner.value, inner.type);
      return { ok: true, value: String.fromCharCode(Math.trunc(code)), type: "char" };
    }

    const intCastMatch = t.match(/^\(int\)\s*(.+)$/);
    if (intCastMatch) {
      const inner = await this.resolveExpr(intCastMatch[1].trim(), vars);
      if (!inner.ok) return inner;
      if (inner.type === "String") { this.showCompileErrorStamp(); return { ok: false, crash: "compile" }; }
      const code = this._toNum(inner.value, inner.type);
      return { ok: true, value: Math.trunc(code), type: "int" };
    }

    const rel = this._splitRelational(t);
    if (rel) {
      const l = await this.resolveExpr(rel.left, vars);
      if (!l.ok) return l;
      const r = await this.resolveExpr(rel.right, vars);
      if (!r.ok) return r;
      const lv = this._toNum(l.value, l.type), rv = this._toNum(r.value, r.type);
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
          const accNum = this._toNum(accValue, accType);
          const partNum = this._toNum(partVal, partType);
          const numVal = op === "-" ? -partNum : partNum;
          accValue = accNum + numVal;
          accType = (accType === "double" || partType === "double") ? "double" : "int";
        }
      }
      return { ok: true, value: accValue, type: accIsString ? "String" : accType };
    }

    const mulParts = this._splitMultiplicative(t);
    if (mulParts) {
      let accValue = null, accType = null;
      for (let i = 0; i < mulParts.length; i++) {
        const { op, text } = mulParts[i];
        const r = await this.resolveExpr(text, vars);
        if (!r.ok) return r;
        if (r.type === "String") { this.showCompileErrorStamp(); return { ok: false, crash: "compile" }; }
        const num = this._toNum(r.value, r.type);
        const numType = r.type === "char" ? "int" : r.type;
        if (i === 0) { accValue = num; accType = numType; }
        else {
          const bothInt = accType === "int" && numType === "int";
          if (op === "*") accValue = accValue * num;
          else accValue = bothInt ? Math.trunc(accValue / num) : accValue / num;
          accType = bothInt ? "int" : "double";
        }
      }
      return { ok: true, value: accValue, type: accType };
    }

    const isDigitMatch = t.match(/^Character\.isDigit\((.+)\)$/);
    if (isDigitMatch) {
      const argRes = await this.resolveExpr(isDigitMatch[1].trim(), vars);
      if (!argRes.ok) return argRes;
      let code, displayCh;
      if (argRes.type === "char") { code = argRes.value.charCodeAt(0); displayCh = argRes.value; }
      else if (argRes.type === "int") { code = argRes.value; displayCh = null; }
      else { this.showCompileErrorStamp(); return { ok: false, crash: "compile" }; }
      const result = code >= 48 && code <= 57;
      await this.runMiniClassification(displayCh, code, result);
      this._lastIsDigitResult = result;
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
      await this.runCharAtExtraction(strVal, idx);
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
      await this.runCharAtExtraction(base.value, idx);
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

    const declVar = line.match(/^(int|double|String|boolean|char)\s+(\w+)\s*=\s*(.*);$/);
    if (declVar) {
      const varType = declVar[1], name = declVar[2], rhs = declVar[3].trim();
      const r = await this.resolveExpr(rhs, vars);
      if (!r.ok) return r;
      if (varType === "int" && r.type === "char") {
        vars[name] = { value: r.value.charCodeAt(0), type: "int", kind: "scalar" };
        this.updateVariablesStrip(vars);
        return { ok: true };
      }
      if (varType !== r.type) { this.showCompileErrorStamp(); return { ok: false, crash: "compile" }; }
      vars[name] = { value: r.value, type: varType, kind: "scalar" };
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
      if (existing.type === "int" && r.type === "char") {
        vars[name] = { value: r.value.charCodeAt(0), type: "int", kind: "scalar" };
      } else if (existing.type !== r.type) {
        this.showCompileErrorStamp();
        return { ok: false, crash: "compile" };
      } else {
        vars[name] = { value: r.value, type: existing.type, kind: "scalar" };
      }
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

  /** Index-scans for if (...) { ... } [else { ... }] and
   * for (int i = INIT; COND; i++) { ... } blocks — after each loop
   * iteration, feeds the loop tracker from whatever the body's last
   * charAt/isDigit calls and int-typed accumulator variables show. */
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
          if (t === "} else {") {
            // closes one block and reopens another — depth unchanged
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
          this._lastIsDigitResult = undefined;
          const r = await this.runStatements(bodyLines, vars);
          if (!r.ok) return r;
          const trackedInts = Object.keys(vars).filter((k) => k !== loopVar && vars[k] && vars[k].type === "int");
          const countVal = trackedInts.length ? vars[trackedInts[trackedInts.length - 1]].value : null;
          this.updateLoopTracker(vars[loopVar].value, this._lastExtractedChar !== undefined ? this._lastExtractedChar : null, !!this._lastIsDigitResult, countVal);
          vars[loopVar].value = vars[loopVar].value + 1;
        }
        i = j + 1;
        continue;
      }

      const ifMatch = line.match(/^if\s*\((.+)\)\s*\{$/);
      if (ifMatch) {
        const condRes = await this.resolveExpr(ifMatch[1].trim(), vars);
        if (!condRes.ok) return condRes;
        let j = i + 1;
        const thenLines = [];
        while (j < lines.length) {
          const t = lines[j].trim();
          if (t === "}" || t === "} else {") break;
          thenLines.push(lines[j]);
          j++;
        }
        let elseLines = [];
        let end = j;
        if (lines[j] !== undefined && lines[j].trim() === "} else {") {
          let k = j + 1;
          while (k < lines.length && lines[k].trim() !== "}") { elseLines.push(lines[k]); k++; }
          end = k;
        }
        const branchLines = condRes.value ? thenLines : elseLines;
        const r = await this.runStatements(branchLines, vars);
        if (!r.ok) return r;
        i = end + 1;
        continue;
      }

      const r = await this.execStatement(line, vars);
      if (!r.ok) return r;
      i++;
    }
    return { ok: true };
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
  // END STATES
  // ══════════════════════════════════════════════════════════════

  gameOver() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearMission();
    this.hideBubble();

    (async () => {
      this.clearMiniLoupe();
      this.clearCharAtStage();
      this.clearLoopTracker();
      this.clearTicker();
      this.clearVariablesStrip();
      this.parkScannerCameo();
      this._qaSeal.c.setAlpha(0.1);
      this._manifestCards.forEach(({ g }) => this.tweens.add({ targets: g, alpha: 0.05, duration: 500 }));
      const motes = this.ambient;
      this.ambient = null;
      (motes || []).forEach((m) => this.tweens.add({ targets: m, y: 632, alpha: 0, duration: 1500, ease: "Sine.easeIn" }));

      const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
      this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });
      const title = this.add.text(640, 240, "WORKS CLOSED", { font: "bold 32px Georgia", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
      this.tweens.add({ targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut", onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }) });
      this.add.text(640, 310, `Score: ${this.score}`, { font: "21px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
      this.add.text(640, 350, `Missions Published: ${this.currentMission} / 6`, { font: "18px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);
      this._makeButton(525, 420, "REOPEN THE WORKS", 200, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
      this._makeButton(755, 420, "RETURN TO MENU", 200, 50, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.start("MenuScene"));
    })();
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearMission();
    this.hideBubble();

    try { GameManager.completeLevel(81, Math.round((this.flawlessCount / MISSIONS.length) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("character_isDigit_mastery"); } catch (_) {}
    try {
      localStorage.setItem("level82_results", JSON.stringify({
        level: 82, concept: "character_isDigit", phase: "restructuring",
        score: this.score, missionsCompleted: 6, flawlessMissions: this.flawlessCount,
        totalRuns: this.runCount, failedRuns: this.failedRunCount, hintsUsed: this.hintCount,
        selfCorrections: this.selfCorrectionCount,
        classifyBeforeExtractProactive: this.classifyExtractProactive,
        digitCounterClean: this.counterClean,
        chMinusZeroClean: this.extractClean,
        livesRemaining: this.lives, attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.triggerTrilogyFinale();
  }

  async triggerTrilogyFinale() {
    const sealC = this._qaSeal.c;
    await new Promise((res) => {
      this.tweens.add({ targets: sealC, x: 640, y: 300, scale: 2, duration: 700, ease: "Sine.easeInOut", onComplete: res });
    });
    this.pulseSeal("gold");
    this.screenShake(0.005, 180);
    const shock = this.add.circle(640, 300, 6, C_SILVER, 0.6).setDepth(89);
    this.tweens.add({ targets: shock, scale: 10, alpha: 0, duration: 500, onComplete: () => shock.destroy() });

    this._manifestCards.forEach(({ g, dot }) => {
      g.clear();
      g.fillStyle(C_GREEN_BRIGHT, 0.25);
      g.lineStyle(1, C_GREEN_BRIGHT, 0.6);
      dot.setFillStyle(C_GREEN_BRIGHT, 0.9);
    });

    if (this._analysesShelf && this._analysesShelf.length) {
      const fourth = this.add.graphics().setDepth(3);
      const x = 1250, y = 130;
      const pts = [];
      for (let i = 0; i < 6; i++) { const a = (Math.PI / 3) * i; pts.push({ x: x + Math.cos(a) * 6, y: y + Math.sin(a) * 6 }); }
      fourth.fillStyle(C_GOLD, 0.6);
      fourth.fillPoints(pts, true);
      this.tweens.add({ targets: fourth, alpha: 0.5, duration: 600, yoyo: true, repeat: 2 });
    }
    this.tweens.add({ targets: this._extractionRefGfx, alpha: 1, duration: 300, yoyo: true, repeat: 2 });

    this.createFinaleConfetti(640, 300, 40);
    await this.delay(700);

    // final rapid classification: gold, blue, gray gems
    this.clearMiniLoupe();
    for (const ch of ["9", "M", "!"]) {
      const code = ch.charCodeAt(0);
      await this.runMiniClassification(ch, code, code >= 48 && code <= 57);
      await this.delay(80);
    }

    const flash = this.add.rectangle(W / 2, H / 2, W, H, 0xffffff, 0).setDepth(94);
    this.tweens.add({ targets: flash, fillAlpha: 0.4, duration: 250, yoyo: true, onComplete: () => flash.destroy() });

    await this.delay(400);

    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
    this.tweens.add({ targets: ov, fillAlpha: 0.85, duration: 500 });
    this._ceremonyElements = [ov];

    const panel = this.add.graphics().setDepth(90);
    panel.fillStyle(0x0a1428, 1);
    panel.fillRoundedRect(350, 50, 580, 460, 16);
    panel.lineStyle(2, C_GOLD, 1);
    panel.strokeRoundedRect(350, 50, 580, 460, 16);
    this._ceremonyElements.push(panel);

    const title = this.add.text(640, 90, "MASTER GEMOLOGIST", { font: "bold 32px Georgia", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(91).setScale(0);
    this.tweens.add({ targets: title, scale: 1, duration: 350, ease: "Back.easeOut" });
    this._ceremonyElements.push(title);

    const cePct = `${Object.values(this.classifyExtractProactive).filter(Boolean).length}/2`;
    const ccPct = `${Object.values(this.counterClean).filter(Boolean).length}/2`;
    const ecPct = `${Object.values(this.extractClean).filter(Boolean).length}/2`;
    const lines = [
      "MISSIONS: 6/6",
      `FLAWLESS: ${this.flawlessCount}`,
      `SELF-CORRECTIONS: ${this.selfCorrectionCount}`,
      `CLASSIFY-BEFORE-EXTRACT: ${cePct}`,
      `DIGIT COUNTER CLEAN: ${ccPct}`,
      `ch - '0' CLEAN: ${ecPct}`,
      `HINTS: ${this.hintCount}`,
    ];
    lines.forEach((s, i) => {
      const t = this.add.text(400, 122 + i * 19, s, { font: "15px Arial", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 250, delay: 300 + i * 110 });
      this._ceremonyElements.push(t);
    });
    const totalText = this.add.text(400, 122 + 7 * 19, "TOTAL: 0", { font: "bold 21px Arial", color: HEX_GOLD }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: totalText, alpha: 1, duration: 250, delay: 1150 });
    const counter = { v: 0 };
    this.tweens.add({ targets: counter, v: this.score, duration: 900, delay: 1150, onUpdate: () => totalText.setText(`TOTAL: ${Math.round(counter.v)}`) });
    this._ceremonyElements.push(totalText);

    const stars = this._starRating();
    for (let i = 0; i < 3; i++) {
      const earned = i < stars;
      const s = this.add.text(640 + (i - 1) * 60, 300, "★", { font: "36px Arial", color: earned ? HEX_GOLD : "#2a3040" }).setOrigin(0.5).setDepth(91).setScale(0);
      this.tweens.add({ targets: s, scale: 1, duration: 250, delay: 1650 + i * 200, ease: earned ? "Back.easeOut" : "Cubic.easeOut" });
      this._ceremonyElements.push(s);
    }

    const badge = this.add.container(640, 360).setDepth(91).setAlpha(0);
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillCircle(0, 0, 30);
    bg.lineStyle(3, C_GOLD, 1);
    bg.strokeCircle(0, 0, 30);
    const loupeIcon = this.add.text(-13, -5, "🔎", { font: "bold 13px Arial" }).setOrigin(0.5);
    const gemIcon = this.add.text(0, -5, "💎", { font: "bold 13px Arial" }).setOrigin(0.5);
    const arrowIcon = this.add.text(13, -5, "➡️", { font: "bold 12px Arial" }).setOrigin(0.5);
    badge.add([bg, loupeIcon, gemIcon, arrowIcon]);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 2050 });
    const badgeLbl = this.add.text(640, 397, "isDigit() MASTERY", { font: "bold 15px Georgia", color: HEX_GOLD }).setOrigin(0.5).setDepth(91).setAlpha(0);
    const badgeSub = this.add.text(640, 412, "Accretion ✓  Tuning ✓  Restructuring ✓", { font: "12px Arial", color: "#78909c" }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: [badgeLbl, badgeSub], alpha: 1, duration: 300, delay: 2200 });
    this._ceremonyElements.push(badge, badgeLbl, badgeSub);

    const barY = 440;
    const barG = this.add.graphics().setDepth(91).setAlpha(0);
    barG.lineStyle(1.5, C_GRAY, 1);
    barG.strokeRoundedRect(450, barY, 380, 14, 6);
    barG.fillStyle(C_SILVER, 1);
    barG.fillRoundedRect(450, barY, 380 / 3, 14, 6);
    const progLabel = this.add.text(640, barY - 10, "CHARACTER WING — 1 of 3 trilogies complete", { font: "bold 13px Georgia", color: HEX_SILVER }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: [barG, progLabel], alpha: 1, duration: 300, delay: 2400 });
    this._ceremonyElements.push(barG, progLabel);

    await this.delay(2900);
    if (!this._alive) return;

    await new Promise((res) => { this.tweens.add({ targets: this.bit, x: 640, y: 610, duration: 500, ease: "Sine.easeInOut", onComplete: res }); });
    await this.bitSay("The full works: isDigit classifies, charAt extracts, ch - '0' converts, and the loop-extract-classify-count pattern processes any string. Six missions, the first Character Wing trilogy sealed — Accretion taught the schema, Tuning drilled the char/int boundary, Restructuring built the production programs. Master Gemologist — the loupe is fully yours. Two more instruments wait in the deeper halls: isLetter, then isUpperCase.");
    if (!this._alive) return;
    await Promise.race([this.waitForClick(), this.delay(7000)]);
    this.hideBubble();
    this.showScoreTally();
  }

  _starRating() {
    if (this.flawlessCount >= 4 && this.hintCount <= 1) return 3;
    if (this.failedRunCount <= 3) return 2;
    return 1;
  }

  showScoreTally() {
    this._makeButton(500, 530, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(770, 530, "NEXT: The Alphabet Lens →", 300, 44, { fill: 0x00733a, stroke: C_GREEN_BRIGHT, textColor: "#ffffff" }, () => {
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
