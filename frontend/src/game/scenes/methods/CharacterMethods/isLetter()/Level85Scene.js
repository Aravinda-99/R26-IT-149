/**
 * Level 85 — "The Alphabet Works" (Character Wing: Restructuring
 * Phase — Character.isLetter() trilogy finale)
 * ===========================================================================
 * The learner CONSTRUCTS complete letter-classification programs — no
 * multiple choice. Reuses the L27→L82 code-canvas/parts-bin/RUN
 * architecture. The rig hosts TWO mini instruments side by side — the
 * L80 Numeral Loupe (isDigit) and the L83 Prismatic Lens (isLetter) —
 * plus a loop tracker, Scanner tape, and output ticker, reused from
 * L82's rig with the charAt-extraction-stage column replaced by the
 * prism (charAt itself resolves silently here; no round needs to watch
 * it animate).
 *
 * Hand-verified all 6 missions' test batteries by direct tracing against
 * real Java semantics before writing any code, including the spec's own
 * claims about its "killer tests" —
 *   - M2's !isDigit distractor: confirmed it counts "Hi 5!" as 4 (H, i,
 *     space, !) against isLetter's correct 2, exactly as claimed.
 *   - M3's isUpperCase distractor (in letterCheck): confirmed it passes
 *     tests 1–3 but fails test 4 ('z', lowercase) — the spec's own
 *     stated kill-test, confirmed by trace.
 *   - M4's flagship !isDigit distractor: confirmed 5 vs 2 on "Go #1!"
 *     and 5 vs 0 on "!@#$%" — both kill it, exactly as claimed.
 *   - M5's underscore test ("_test"): confirmed !isDigit('_') = true
 *     (wrongly "Valid") while isLetter('_') = false (correctly
 *     "Invalid") — the claimed kill-test checks out.
 *   - M6's isUpperCase distractor: confirmed it undercounts to 1 (only
 *     'C') instead of 4 on "Code 42!", missing the lowercase letters.
 * No spec test-battery bugs found. ONE inconsistency caught and fixed:
 * M3's palette tags its isUpperCase-in-letterCheck distractor
 * `wrong_classification_method` — the SAME tag M1/M2/M5 use for an
 * isDigit-instead-of-isLetter swap. But isUpperCase-for-isLetter is a
 * materially different mistake (a narrower test that misses lowercase,
 * not a wrong family), and M6's palette already gives the identical
 * distractor its own dedicated tag, `uppercase_not_all_letters`. Under
 * the original tagging, a student who tried isUpperCase in M3 would
 * have been told "isDigit counts digits, use isLetter" — actively
 * wrong, since isDigit is not even involved. Fixed by retagging M3's
 * isUpperCase distractor to `uppercase_not_all_letters`, matching M6's
 * own precedent.
 *
 * New evaluator vocabulary beyond L82's cascade (all needed for this
 * level's own missions, confirmed necessary by hand-tracing before
 * writing any evaluator code):
 *  - `Character.isLetter` (the level's own subject) and
 *    `Character.isUpperCase` (M6's distractor) alongside isDigit —
 *    every prior restructuring level only ever needed ONE Character
 *    method; this is the first to need three, each driving its own
 *    (or no) rig visual.
 *  - A unary `!` (logical NOT) — M1/M2/M4/M5/M6's `!Character.isDigit`
 *    distractors. L82 never needed one (all its distractors were
 *    positive-form mistakes).
 *  - An arbitrary-length braced if/else-if/…/else BLOCK chain (ported
 *    from L83/L84) — M3 and M6 both build a genuine 3-branch
 *    digit/letter/other classifier; L82's if-handler only ever
 *    supported a single optional else.
 *  - A comma-separated multi-variable declaration on one line
 *    (`int letters = 0, digits = 0, other = 0;`, M6) — new this level;
 *    unified into the same declaration handler as the single-variable
 *    case rather than bolted on separately.
 *  - Soft-wrapped multi-line statement joining — M6's println is
 *    written across three physical lines with no semicolon until the
 *    last (`+ " | Digits: " + digits` etc. continuing the previous
 *    line). A preprocessing pass merges any line not ending in
 *    `;`, `{`, or `}` into the next line(s) before any block-structure
 *    or statement parsing runs, so every existing regex still only
 *    ever sees complete, single-line statements.
 *  - Scanner input (`Scanner sc = new Scanner(System.in);` +
 *    `sc.nextLine()`) reused verbatim from L82's tape-tokenizing
 *    mechanism for M5 — this level's inputs are single tokens with no
 *    internal whitespace, so the existing whitespace-delimited
 *    `evaluateNextToken` reads each test's full input line correctly
 *    without needing L82's chained `sc.nextLine().charAt(idx)` form
 *    (M5's skeleton reads into a variable first, then calls charAt on
 *    it separately) — that chained form was therefore not rebuilt here.
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
const TUTORIAL_KEY = "level85_tutorial_done";

// Rig internal layout — left containers, center mini loupe (isDigit),
// right mini prism (isLetter) (top row); loop tracker below; ticker
// at the bottom.
const MINI_Y0 = OY + 18, MINI_Y1 = OY + 82;
const CONT_X0 = OX + 8, CONT_X1 = OX + 148;
const LOUPE_X0 = OX + 156, LOUPE_X1 = OX + 306;
const PRISM_X0 = OX + 314, PRISM_X1 = OX + 452;
const TRACKER_Y0 = OY + 90, TRACKER_Y1 = OY + 150;
const TAPE_Y = OY + 8;
const TICKER_Y = OY + 200;

// ══════════════════════════════════════════════════════════════
// MISSION CONFIGURATION
// ══════════════════════════════════════════════════════════════
const MISSIONS = [
  // ── Mission 1: The Letter Gate ──
  { mission: 1, title: "The Letter Gate",
    brief: "Check if a character is a letter and print the result.\nFor ch = 'R': Letter: true\nFor ch = '5': Letter: false",
    skeleton: [
      "char ch = /* test value */;",
      "",
      "boolean isLtr = <slot:check>;",
      'System.out.println("Letter: " + isLtr);',
    ],
    slots: [{ id: "check", hint: "classify with the prism" }],
    palette: [
      { code: "Character.isLetter(ch)", correct: true, slotId: "check" },
      { code: "Character.isDigit(ch)", tag: "wrong_classification_method", slotId: "check" },
      { code: "character.isLetter(ch)", tag: "character_lowercase_belief", slotId: "check" },
      { code: "ch.isLetter()", tag: "isLetter_instance_call_belief", slotId: "check" },
      { code: "!Character.isDigit(ch)", tag: "not_digit_is_letter_belief", slotId: "check" },
    ],
    tests: [
      { substitutions: { ch: "'R'" }, expectedOutput: "Letter: true" },
      { substitutions: { ch: "'5'" }, expectedOutput: "Letter: false" },
      { substitutions: { ch: "'!'" }, expectedOutput: "Letter: false" },
    ],
    postMissionNote: "Bit: 'isLetter on the char, boolean in the container. And notice: the !isDigit distractor would have given TRUE for \"!\" — wrong. isLetter correctly said false. Precision from the first mission.'",
    concept: "basic_letter_check" },

  // ── Mission 2: The Letter Counter ──
  { mission: 2, title: "The Letter Counter",
    brief: 'Count the letters in a string.\nFor text = "Hi 5!": Letters: 2',
    skeleton: [
      "String text = /* test value */;",
      "int count = 0;",
      "",
      "for (int i = 0; i < <slot:bound>; i++) {",
      "    if (<slot:check>) {",
      "        count++;",
      "    }",
      "}",
      'System.out.println("Letters: " + count);',
    ],
    slots: [
      { id: "bound", hint: "the loop limit" },
      { id: "check", hint: "classify each character" },
    ],
    palette: [
      { code: "text.length()", correct: true, slotId: "bound" },
      { code: "text.length() - 1", tag: "loop_bound_wrong", slotId: "bound" },
      { code: "Character.isLetter(text.charAt(i))", correct: true, slotId: "check" },
      { code: "!Character.isDigit(text.charAt(i))", tag: "not_digit_is_letter_belief", slotId: "check" },
      { code: "Character.isDigit(text.charAt(i))", tag: "wrong_classification_method", slotId: "check" },
      { code: "Character.isLetter(text)", tag: "isLetter_takes_string_belief", slotId: "check" },
    ],
    tests: [
      { substitutions: { text: '"Hi 5!"' }, expectedOutput: "Letters: 2" },
      { substitutions: { text: '"ABCDE"' }, expectedOutput: "Letters: 5" },
      { substitutions: { text: '"12345"' }, expectedOutput: "Letters: 0" },
      { substitutions: { text: '"!@# $"' }, expectedOutput: "Letters: 0" },
    ],
    postMissionNote: "Bit: 'The prism counted 2 letters in \"Hi 5!\" — H and i. The !isDigit distractor would have counted 4 (including the space and exclamation mark). Test 4 proves it: \"!@# $\" has ZERO letters but !isDigit would count all 4 non-digit characters. Precision saves.'",
    concept: "letter_counter" },

  // ── Mission 3: The Three-Branch Classifier ──
  { mission: 3, title: "The Three-Branch Classifier",
    brief: "Classify a character as Digit, Letter, or Symbol.\nFor ch = 'A': Type: Letter\nFor ch = '7': Type: Digit\nFor ch = '#': Type: Symbol",
    skeleton: [
      "char ch = /* test value */;",
      "String type;",
      "",
      "if (<slot:digitCheck>) {",
      '    type = "Digit";',
      "} else if (<slot:letterCheck>) {",
      '    type = "Letter";',
      "} else {",
      '    type = "Symbol";',
      "}",
      'System.out.println("Type: " + type);',
    ],
    slots: [
      { id: "digitCheck", hint: "the digit test" },
      { id: "letterCheck", hint: "the letter test" },
    ],
    palette: [
      { code: "Character.isDigit(ch)", correct: true, slotId: "digitCheck" },
      { code: "Character.isLetter(ch)", correct: true, slotId: "letterCheck" },
      { code: "Character.isLetter(ch)", tag: "three_branch_swap", slotId: "digitCheck" },
      { code: "Character.isDigit(ch)", tag: "three_branch_swap", slotId: "letterCheck" },
      { code: "Character.isUpperCase(ch)", tag: "uppercase_not_all_letters", slotId: "letterCheck" },
    ],
    tests: [
      { substitutions: { ch: "'A'" }, expectedOutput: "Type: Letter" },
      { substitutions: { ch: "'7'" }, expectedOutput: "Type: Digit" },
      { substitutions: { ch: "'#'" }, expectedOutput: "Type: Symbol" },
      { substitutions: { ch: "'z'" }, expectedOutput: "Type: Letter" },
    ],
    postMissionNote: "Bit: 'The three-branch classifier — every character sorted into one of three families. isDigit first, isLetter second, else catches everything remaining. Swap the tests and digits get called letters. And isUpperCase in the letter slot MISSES lowercase — z would fall to \"Symbol\". isLetter is the complete letter test.'",
    concept: "three_branch_build" },

  // ── Mission 4: The Precise Counter (FLAGSHIP — isLetter not !isDigit) ──
  { mission: 4, title: "The Precise Counter",
    brief: 'Count ONLY the LETTER characters in a mixed string. Symbols and spaces must NOT be counted.\nFor data = "Go #1!": Letters: 2',
    skeleton: [
      "String data = /* test value */;",
      "int letters = 0;",
      "",
      "for (int i = 0; i < data.length(); i++) {",
      "    if (<slot:check>) {",
      "        letters++;",
      "    }",
      "}",
      'System.out.println("Letters: " + letters);',
    ],
    slots: [{ id: "check", hint: "PRECISELY letters only" }],
    palette: [
      { code: "Character.isLetter(data.charAt(i))", correct: true, slotId: "check" },
      { code: "!Character.isDigit(data.charAt(i))", tag: "not_digit_is_letter_belief", slotId: "check" },
      { code: "Character.isDigit(data.charAt(i))", tag: "wrong_classification_method", slotId: "check" },
      { code: "data.charAt(i) != ' '", tag: "not_space_is_letter_belief", slotId: "check" },
    ],
    tests: [
      { substitutions: { data: '"Go #1!"' }, expectedOutput: "Letters: 2" },
      { substitutions: { data: '"!@#$%"' }, expectedOutput: "Letters: 0" },
      { substitutions: { data: '"Hello"' }, expectedOutput: "Letters: 5" },
      { substitutions: { data: '" "' }, expectedOutput: "Letters: 0" },
    ],
    postMissionNote: "Bit (touching the precision reference on the wall): 'THE FLAGSHIP — isLetter counted 2 letters in \"Go #1!\". The !isDigit distractor would have counted 5 — including the space, hash, and exclamation mark. The precision reference on the wall says it plainly: !isDigit ≠ isLetter. The third zone exists; !isDigit ignores it. isLetter is the PRECISE tool.'",
    concept: "precise_counter_flagship" },

  // ── Mission 5: The Name Validator (Scanner + isLetter) ──
  { mission: 5, title: "The Name Validator",
    brief: 'Read a name from the user. Check if the FIRST character is a letter. If yes, accept; if no, reject.\nFor input "Alice": Valid name\nFor input "123": Invalid: must start with a letter',
    skeleton: [
      "Scanner sc = new Scanner(System.in);",
      "String name = sc.nextLine();",
      "",
      "if (<slot:check>) {",
      '    System.out.println("Valid name");',
      "} else {",
      '    System.out.println("Invalid: must start with a letter");',
      "}",
    ],
    slots: [{ id: "check", hint: "check the first character" }],
    isCrossWing: true,
    palette: [
      { code: "Character.isLetter(name.charAt(0))", correct: true, slotId: "check" },
      { code: "Character.isLetter(name)", tag: "isLetter_takes_string_belief", slotId: "check" },
      { code: "Character.isDigit(name.charAt(0))", tag: "wrong_classification_method", slotId: "check" },
      { code: "!Character.isDigit(name.charAt(0))", tag: "not_digit_is_letter_belief", slotId: "check" },
    ],
    tests: [
      { input: ["Alice"], expectedOutput: "Valid name" },
      { input: ["123"], expectedOutput: "Invalid: must start with a letter" },
      { input: ["_test"], expectedOutput: "Invalid: must start with a letter" },
    ],
    postMissionNote: "Bit: 'Scanner reads, charAt(0) extracts the first gem, isLetter validates. Test 3 proved the precision: \"_test\" starts with an underscore — !isDigit would have approved it (underscore is not a digit), but isLetter correctly rejected it (underscore is not a letter). Three wings collaborating on real validation.'",
    concept: "name_validation" },

  // ── Mission 6: The Full Analysis (GRAND CAPSTONE) ──
  { mission: 6, title: "The Full Analysis",
    brief: 'Analyze a string: count letters, digits, and others separately.\nFor sample = "Code 42!": Letters: 4 | Digits: 2 | Other: 2',
    skeleton: [
      "String sample = /* test value */;",
      "int letters = 0, digits = 0, other = 0;",
      "",
      "for (int i = 0; i < sample.length(); i++) {",
      "    char ch = sample.charAt(i);",
      "    if (<slot:digitTest>) {",
      "        digits++;",
      "    } else if (<slot:letterTest>) {",
      "        letters++;",
      "    } else {",
      "        other++;",
      "    }",
      "}",
      'System.out.println("Letters: " + letters',
      '    + " | Digits: " + digits',
      '    + " | Other: " + other);',
    ],
    slots: [
      { id: "digitTest", hint: "the digit branch" },
      { id: "letterTest", hint: "the letter branch" },
    ],
    palette: [
      { code: "Character.isDigit(ch)", correct: true, slotId: "digitTest" },
      { code: "Character.isLetter(ch)", correct: true, slotId: "letterTest" },
      { code: "Character.isLetter(ch)", tag: "three_branch_swap", slotId: "digitTest" },
      { code: "Character.isDigit(ch)", tag: "three_branch_swap", slotId: "letterTest" },
      { code: "!Character.isDigit(ch)", tag: "not_digit_is_letter_belief", slotId: "letterTest" },
      { code: "Character.isUpperCase(ch)", tag: "uppercase_not_all_letters", slotId: "letterTest" },
    ],
    tests: [
      { substitutions: { sample: '"Code 42!"' }, expectedOutput: "Letters: 4 | Digits: 2 | Other: 2" },
      { substitutions: { sample: '"HELLO"' }, expectedOutput: "Letters: 5 | Digits: 0 | Other: 0" },
      { substitutions: { sample: '"12345"' }, expectedOutput: "Letters: 0 | Digits: 5 | Other: 0" },
      { substitutions: { sample: '"!@# $%"' }, expectedOutput: "Letters: 0 | Digits: 0 | Other: 6" },
    ],
    postMissionNote: "Bit (closing the classification reference card, brooch glinting): 'The full analysis — every character classified into one of three families, every family counted independently. \"Code 42!\" split perfectly: 4 letters (C, o, d, e), 2 digits (4, 2), 2 other (space, !). The three-branch classifier, complete. Senior Gemologist — the prism is fully yours. One final instrument awaits: the Case Prism.'",
    concept: "full_analysis_capstone" },
];

const MISCONCEPTION_FEEDBACK = {
  not_digit_is_letter_belief: "!isDigit includes the OTHER zone — symbols, spaces, punctuation all pass !isDigit but fail isLetter. The precision reference on the wall: !isDigit ≠ isLetter. Use isLetter for letters.",
  not_space_is_letter_belief: "Excluding spaces doesn't capture letters — it still includes symbols like '#' and '!'. Only isLetter precisely identifies the letter family.",
  three_branch_swap: "Swapping isDigit and isLetter in the if/else-if puts the wrong test in each branch — digits are classified as letters and vice versa.",
  uppercase_not_all_letters: "isUpperCase only catches UPPERCASE letters — lowercase letters like 'o', 'd', 'e' would fall through to the else branch and be counted as 'other' (or, in a two-branch classifier, misclassified as \"Symbol\"). isLetter catches ALL letters, regardless of case.",
  isLetter_takes_string_belief: "isLetter takes CHAR. Extract with charAt first.",
  wrong_classification_method: "isDigit counts DIGITS. Use isLetter for letters.",
  loop_bound_wrong: "length() - 1 misses the last character.",
  character_lowercase_belief: "Character with a capital C — the wrapper class. 'character' (lowercase) doesn't exist.",
  isLetter_instance_call_belief: "Character.isLetter — static. Not ch.isLetter(). The prism belongs to Character, not to the gem.",
};

const HINTS = {
  1: "Character.isLetter(ch) — classify the gem, store the verdict.",
  2: "text.length() for the bound; Character.isLetter(text.charAt(i)) to classify each character.",
  3: "Character.isDigit(ch) guards the first branch; Character.isLetter(ch) guards the second.",
  4: "Character.isLetter(data.charAt(i)) — precisely letters, not !isDigit.",
  5: "Character.isLetter(name.charAt(0)) — validate the first character is a letter.",
  6: "Character.isDigit(ch) for digits; Character.isLetter(ch) for letters; else catches the rest.",
};

export class Level85Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level85Scene" });
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
    this.preciseProactive = {};
    this.threeBranchClean = {};
    this.nameValClean = {};
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
    this.createMiniPrism();
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
  // SETUP — THE ALPHABET WORKS INTERIOR
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l85_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l85_dot", 8, 8);
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

    // Precision reference (left wall) — !isDigit ≠ isLetter
    const rg = this.add.graphics().setDepth(2).setAlpha(0.4);
    rg.lineStyle(2, C_SILVER, 0.6);
    rg.strokeRect(60, 100, 100, 80);
    this.add.text(85, 122, "!isDigit", { font: "bold 10px Courier New", color: HEX_SILVER }).setOrigin(0.5).setDepth(3).setAlpha(0.7);
    this.add.text(110, 122, "≠", { font: "bold 14px Georgia", color: HEX_RED }).setOrigin(0.5).setDepth(3).setAlpha(0.7);
    this.add.text(135, 122, "isLetter", { font: "bold 10px Courier New", color: HEX_BLUE_LETTER }).setOrigin(0.5).setDepth(3).setAlpha(0.7);
    this.add.text(110, 150, "!isDigit includes", { font: "8px Georgia", color: HEX_GRAY }).setOrigin(0.5).setDepth(3).setAlpha(0.5);
    this.add.text(110, 162, "OTHER zone", { font: "8px Georgia", color: HEX_GRAY }).setOrigin(0.5).setDepth(3).setAlpha(0.5);
    this._precisionRefGfx = rg;

    // Completed-analyses shelf (right wall)
    const sg = this.add.graphics().setDepth(2).setAlpha(0.25);
    sg.lineStyle(1.5, C_SILVER, 0.5);
    sg.strokeRect(1140, 100, 100, 60);
    this._analysesShelf = [];
    [[1160, 130], [1190, 130], [1220, 130]].forEach(([x, y]) => {
      const gg = this.add.graphics().setDepth(3);
      const pts = [];
      for (let i = 0; i < 6; i++) { const a = (Math.PI / 3) * i; pts.push({ x: x + Math.cos(a) * 6, y: y + Math.sin(a) * 6 }); }
      gg.fillStyle(C_BLUE_LETTER, 0.3);
      gg.fillPoints(pts, true);
      const check = this.add.text(x, y, "✓", { font: "bold 9px Arial", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(4).setAlpha(0.5);
      this._analysesShelf.push({ g: gg, check, x, y });
    });

    // Banner
    const bg = this.add.graphics().setDepth(2);
    bg.fillStyle(0x0a1428, 1);
    bg.lineStyle(1, C_BLUE_LETTER, 0.5);
    bg.fillRoundedRect(440, 12, 400, 26, 3);
    bg.strokeRoundedRect(440, 12, 400, 26, 3);
    this.add.text(640, 25, "T H E   A L P H A B E T   W O R K S", { font: "bold 14px Georgia", color: HEX_BLUE_LETTER }).setOrigin(0.5).setAlpha(0.7).setDepth(3);
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
          s.g.lineStyle(2, C_BLUE_LETTER, 1);
          s.g.strokeCircle(0, 0, 18);
          s.label.setColor(HEX_BLUE_LETTER);
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
    const p = this.add.particles(x, y, "l85_dot", {
      speed: { min: 80, max: 240 }, angle: { min: 0, max: 360 }, scale: { start: 0.9, end: 0 }, lifespan: 500,
      tint: [C_BLUE_LETTER, C_GOLD, C_SILVER, 0xffffff], emitting: false,
    }).setDepth(95);
    p.explode(count);
    this.time.delayedCall(900, () => p.destroy());
  }

  createFinaleConfetti(x, y, count = 40) {
    const p = this.add.particles(x, y, "l85_dot", {
      speed: { min: 100, max: 280 }, angle: { min: 0, max: 360 }, scale: { start: 1, end: 0 }, lifespan: 700,
      tint: [C_BLUE_LETTER, C_GOLD, C_SILVER, 0xffffff], emitting: false,
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
    this.tabFilename = this.add.text(CX + CW - 12, CY + TAB_H / 2, "Alphabet1.java", { font: "13px Courier New", color: "#546e7a" }).setOrigin(1, 0.5).setDepth(11);

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
    this.add.text(PX + 10, PY + 8, "GEMOLOGIST'S LETTER PARTS", { font: "bold 11px Arial", color: "#3d4450" }).setDepth(11);
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

  // ══════════════════════════════════════════════════════════════
  // MINI NUMERAL LOUPE (isDigit) — reused from L80/L82, compacted.
  // ══════════════════════════════════════════════════════════════

  createMiniLoupe() {
    const cx = (LOUPE_X0 + LOUPE_X1) / 2;
    this._miniLoupeFrame = this.add.graphics();
    this._miniLoupeFrame.lineStyle(1.2, C_SILVER, 0.5);
    this._miniLoupeFrame.strokeRoundedRect(LOUPE_X0, MINI_Y0, LOUPE_X1 - LOUPE_X0, MINI_Y1 - MINI_Y0, 4);
    const t = this.add.text(cx, MINI_Y0 - 9, "LOUPE", { font: "bold 8px Georgia", color: HEX_SILVER }).setOrigin(0.5).setAlpha(0.5);
    this.rigLayer.add([this._miniLoupeFrame, t]);

    this.loupeDynamicLayer = this.add.container(0, 0);
    this.rigLayer.add(this.loupeDynamicLayer);

    this._loupeVerdictText = this.add.text(cx, MINI_Y1 - 10, "—", { font: "bold 10px Courier New", color: HEX_GRAY }).setOrigin(0.5);
    this.rigLayer.add(this._loupeVerdictText);
  }

  clearMiniLoupe() {
    this.loupeDynamicLayer.removeAll(true);
    this._loupeVerdictText.setText("—").setColor(HEX_GRAY);
  }

  async _dimFrame(frameGfx, dim) {
    if (!frameGfx) return;
    await new Promise((res) => { this.tweens.add({ targets: frameGfx, alpha: dim ? 0.3 : 1, duration: 90, onComplete: res }); });
  }

  async runMiniClassification(ch, code, result) {
    await this._dimFrame(this._miniPrismFrame, true);
    const cx = (LOUPE_X0 + LOUPE_X1) / 2, cy = MINI_Y0 + 28;
    const displayCh = ch !== null ? this._displayChar(ch) : `[${code}]`;
    const family = ch !== null ? this.getGemFamily(ch) : "other";
    const colors = this.getGemColor(family);

    const gem = this.add.container(cx, cy).setAlpha(0).setScale(0.6).setDepth(21);
    const gg = this.add.graphics();
    const pts = this._octPoints(11);
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
    await this._dimFrame(this._miniPrismFrame, false);
    return result;
  }

  // ══════════════════════════════════════════════════════════════
  // MINI PRISMATIC LENS (isLetter) — reused from L83/L84, compacted.
  // ══════════════════════════════════════════════════════════════

  createMiniPrism() {
    const cx = (PRISM_X0 + PRISM_X1) / 2;
    this._miniPrismFrame = this.add.graphics();
    this._miniPrismFrame.lineStyle(1.2, C_SILVER, 0.5);
    this._miniPrismFrame.strokeRoundedRect(PRISM_X0, MINI_Y0, PRISM_X1 - PRISM_X0, MINI_Y1 - MINI_Y0, 4);
    const t = this.add.text(cx, MINI_Y0 - 9, "PRISM", { font: "bold 8px Georgia", color: HEX_SILVER }).setOrigin(0.5).setAlpha(0.5);
    this.rigLayer.add([this._miniPrismFrame, t]);

    this.prismDynamicLayer = this.add.container(0, 0);
    this.rigLayer.add(this.prismDynamicLayer);

    const s = 12;
    this._miniPrismTriPts = [{ x: 0, y: -s }, { x: s * 0.87, y: s * 0.5 }, { x: -s * 0.87, y: s * 0.5 }];
    this._miniPrismContainer = this.add.container(cx, MINI_Y0 + 12);
    const pg = this.add.graphics();
    pg.fillStyle(0x0a1428, 0.35);
    pg.lineStyle(1.4, C_SILVER, 1);
    pg.fillPoints(this._miniPrismTriPts, true);
    pg.strokePoints(this._miniPrismTriPts, true);
    this._miniPrismGlow = this.add.graphics();
    this._miniPrismContainer.add([pg, this._miniPrismGlow]);
    this.rigLayer.add(this._miniPrismContainer);

    this._prismVerdictText = this.add.text(cx, MINI_Y1 - 10, "—", { font: "bold 10px Courier New", color: HEX_GRAY }).setOrigin(0.5);
    this.rigLayer.add(this._prismVerdictText);
  }

  clearMiniPrism() {
    this.prismDynamicLayer.removeAll(true);
    this._prismVerdictText.setText("—").setColor(HEX_GRAY);
    if (this._miniPrismGlow) this._miniPrismGlow.clear();
  }

  async runMiniPrismClassification(ch, result) {
    await this._dimFrame(this._miniLoupeFrame, true);
    const cx = (PRISM_X0 + PRISM_X1) / 2, cy = MINI_Y0 + 34;
    const displayCh = this._displayChar(ch);
    const family = this.getGemFamily(ch);
    const colors = this.getGemColor(family);

    const gem = this.add.container(cx, cy).setAlpha(0).setScale(0.6).setDepth(21);
    const gg = this.add.graphics();
    const pts = this._octPoints(11);
    gg.fillStyle(colors.fill, 1);
    gg.lineStyle(1.2, colors.stroke, 1);
    gg.fillPoints(pts, true);
    gg.strokePoints(pts, true);
    const txt = this.add.text(0, 0, displayCh, { font: "bold 11px Courier New", color: "#0a1428" }).setOrigin(0.5);
    if (txt.width > 18) txt.setFontSize(6);
    gem.add([gg, txt]);
    this.prismDynamicLayer.add(gem);
    this.tweens.add({ targets: gem, alpha: 1, scale: 1, duration: 100 });
    await this.delay(90);

    if (result) {
      this._miniPrismGlow.clear();
      this._miniPrismGlow.fillStyle(0x4fc3f7, 0.35);
      this._miniPrismGlow.fillPoints(this._miniPrismTriPts, true);
      gg.clear();
      gg.fillStyle(0x82d4ff, 1);
      gg.lineStyle(1.2, colors.stroke, 1);
      gg.fillPoints(pts, true);
      gg.strokePoints(pts, true);
      this._prismVerdictText.setText("TRUE").setColor(HEX_GREEN_BRIGHT);
      this.screenShake(0.0012, 50);
    } else {
      this._prismVerdictText.setText("FALSE").setColor(HEX_GRAY);
    }
    await this.delay(130);
    this._miniPrismGlow.clear();
    this.tweens.add({ targets: gem, alpha: 0, duration: 120, delay: 60, onComplete: () => gem.destroy() });
    await this.delay(90);
    await this._dimFrame(this._miniLoupeFrame, false);
    return result;
  }

  // ══════════════════════════════════════════════════════════════
  // LOOP TRACKER — per-iteration rows: char, last classify verdict,
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

  updateLoopTracker(iteration, ch, verdictResult, count) {
    const display = ch !== null ? this._displayChar(ch) : "—";
    const text = `${display} → ${verdictResult ? "true" : "false"}  (n=${count})`;
    const t = this.add.text(OX + 14, 0, text, { font: "9px Courier New", color: verdictResult ? HEX_GREEN_BRIGHT : HEX_GRAY });
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
      if (v.value === undefined) display = "(unset)";
      else if (v.type === "String") display = `"${v.value}"`;
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

    this.add.text(20, 14, "THE ALPHABET WORKS", { font: "bold 15px Georgia", color: "#b0bec5" }).setDepth(51);
    this.add.text(20, 32, "Restructuring — Character Methods: isLetter()", { font: "12px Arial", color: "#546e7a" }).setDepth(51);

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
      if (i < this.currentMission) { g.fillStyle(C_BLUE_LETTER, 1); this._drawHexPath(g, x, y, 9); g.fillPath(); }
      else if (i === this.currentMission) { g.lineStyle(2, C_BLUE_LETTER, 1); this._drawHexPath(g, x, y, 9); g.strokePath(); }
      else { g.lineStyle(1, C_GRAY, 1); this._drawHexPath(g, x, y, 9); g.strokePath(); }
    });
    if (this.missionHexes[this.currentMission]) {
      const m = this.missionHexes[this.currentMission];
      this.tweens.add({ targets: m.g, alpha: 0.5, duration: 600, yoyo: true, repeat: -1 });
    }
  }

  // ══════════════════════════════════════════════════════════════
  // BIT — SENIOR GEMOLOGIST VARIANT (vest + monocle kept, senior's
  // silver brooch, pocket classification reference card)
  // ══════════════════════════════════════════════════════════════

  createBit() {
    const c = this.add.container(90, 560).setDepth(60);
    const g = this.add.graphics();
    g.lineStyle(2, 0x78909c, 1);
    g.lineBetween(0, -17, 0, -32);
    g.fillStyle(0x37474f, 1);
    g.fillRoundedRect(-20, -17, 40, 35, 10);
    const tip = this.add.circle(0, -32, 3, C_BLUE_LETTER);
    const eye = this.add.circle(0, 0, 8, C_CYAN);
    const pupil = this.add.circle(0, 0, 3, 0xffffff);
    const vest = this.add.graphics();
    vest.fillStyle(0x0e1830, 0.9);
    vest.lineStyle(1, C_SILVER, 0.8);
    vest.fillTriangle(-15, -12, 15, -12, 0, 14);
    vest.strokeTriangle(-15, -12, 15, -12, 0, 14);

    // Senior's silver brooch — small prism with a blue gem at center
    const broochG = this.add.graphics();
    broochG.lineStyle(1, C_SILVER, 0.9);
    broochG.fillStyle(0x0e1830, 1);
    broochG.fillTriangle(-4, -6, 2, -6, -1, 1);
    broochG.strokeTriangle(-4, -6, 2, -6, -1, 1);
    broochG.fillStyle(C_BLUE_LETTER, 0.9);
    broochG.fillCircle(-1, -3.5, 1.4);

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

    // Pocket classification reference card — three-zone diagram
    const refCard = this.add.container(17, 10);
    const cardG = this.add.graphics();
    cardG.fillStyle(0x0e1830, 1);
    cardG.lineStyle(1, C_SILVER, 0.7);
    cardG.fillRoundedRect(-4, -8, 8, 13, 1);
    cardG.strokeRoundedRect(-4, -8, 8, 13, 1);
    cardG.fillStyle(C_GOLD, 0.8);
    cardG.fillRect(-3, -6, 6, 2.5);
    cardG.fillStyle(C_BLUE_LETTER, 0.8);
    cardG.fillRect(-3, -3, 6, 2.5);
    cardG.fillStyle(C_GRAY, 0.8);
    cardG.fillRect(-3, 0, 6, 2.5);
    refCard.add(cardG);

    c.add([g, vest, broochG, eye, pupil, monocle, gloveL, refCard, tip]);
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
    await this.bitSay("The Alphabet Works, Senior Gemologist — where the prism's verdicts become real programs. You've classified letters and drilled the three-zone model; tonight you BUILD the workflows that validate, count, and analyze. Every mission processes characters through the rig.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(5500)]); if (!A()) return;
    this.hideBubble();

    const a1 = this.floatingAnnotation(CX + CW / 2, CY - 16, "the validation program", HEX_CYAN);
    await this.delay(400); if (!A()) return;
    const a2 = this.floatingAnnotation(PX + PW / 2, PY - 12, "blocks — one leaks symbols, one passes a String", HEX_GRAY);
    await this.delay(400); if (!A()) return;
    const a3 = this.floatingAnnotation(OX + OW / 2, OY - 12, "loupe, prism, and loop tracker — LIVE", HEX_GREEN_BRIGHT);
    await this.delay(400); if (!A()) return;
    const a4 = this.floatingAnnotation(880, 44, "the quality seal watches", HEX_GOLD);
    await this.delay(400); if (!A()) return;
    const a5 = this.floatingAnnotation(RX + RW / 2, RY - 12, "every scenario must verify", HEX_BLUE_GRAY);
    await this.delay(400); if (!A()) return;

    await this.bitSay("The works' three laws: isLetter for letters — not !isDigit, that leaks symbols through; charAt extracts from Strings — the prism takes chars, not Strings; and the three-branch classifier covers every character: digit, letter, or other. Build, run, verify, repair.");
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

    this.tabFilename.setText(`Alphabet${mission.mission}.java`);
    this.renderSkeleton(mission);
    this.populatePalette(mission);
    this.buildReportRows(mission);
    this.renderMissionBrief(mission);
    this.disableRunButton();
    this.highlightCodeLine(null);
    this.verdictLamp.setFillStyle(C_GRAY);
    this.clearMiniLoupe();
    this.clearMiniPrism();
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

  /** Merges any line not ending in `;`, `{`, or `}` into the next
   * line(s) until a terminator is found — undoes soft-wrapping (M6's
   * three-line println) so every downstream regex only ever sees
   * complete, single-line statements. */
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

    if (mission.mission === 3) {
      this.threeBranchClean[key] = this._slotCode("digitCheck") === "Character.isDigit(ch)" && this._slotCode("letterCheck") === "Character.isLetter(ch)";
    }
    if (mission.mission === 4) {
      this.preciseProactive[key] = this._slotCode("check") === "Character.isLetter(data.charAt(i))";
    }
    if (mission.mission === 5) {
      this.nameValClean[key] = this._slotCode("check") === "Character.isLetter(name.charAt(0))";
    }
    if (mission.mission === 6) {
      this.threeBranchClean[key] = this._slotCode("digitTest") === "Character.isDigit(ch)" && this._slotCode("letterTest") === "Character.isLetter(ch)";
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
    this.clearMiniPrism();
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
      console.warn("Level85Scene: /api/wellbeing/predict-struggle unreachable, skipping behavioral signal for this level:", e);
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
      hx.g.fillStyle(C_BLUE_LETTER, 1);
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
  // UNIFIED INTERPRETER — merges L82's Scanner/reassign restructuring
  // engine with L83/L84's N-branch if/else-if/.../else chain, adds
  // Character.isLetter (driving the mini prism) and
  // Character.isUpperCase (silent) alongside isDigit, a unary `!`,
  // and a comma-separated multi-variable declaration. charAt/length
  // resolve silently — no dedicated extraction-stage animation this
  // level, since the rig's third column now hosts the prism instead.
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
      await this.runMiniClassification(argRes.value, code, result);
      this._lastClassifyResult = result;
      this.updateResultRow("boolean");
      return { ok: true, value: result, type: "boolean" };
    }

    const isLetterMatch = t.match(/^Character\.isLetter\((.+)\)$/);
    if (isLetterMatch) {
      const argRes = await this.resolveExpr(isLetterMatch[1].trim(), vars);
      if (!argRes.ok) return argRes;
      if (argRes.type !== "char") { this.showCompileErrorStamp(); return { ok: false, crash: "compile" }; }
      const result = /[A-Za-z]/.test(argRes.value);
      await this.runMiniPrismClassification(argRes.value, result);
      this._lastClassifyResult = result;
      this.updateResultRow("boolean");
      return { ok: true, value: result, type: "boolean" };
    }

    const isUpperCaseMatch = t.match(/^Character\.isUpperCase\((.+)\)$/);
    if (isUpperCaseMatch) {
      const argRes = await this.resolveExpr(isUpperCaseMatch[1].trim(), vars);
      if (!argRes.ok) return argRes;
      if (argRes.type !== "char") { this.showCompileErrorStamp(); return { ok: false, crash: "compile" }; }
      const result = /[A-Z]/.test(argRes.value);
      this._lastClassifyResult = result;
      this.updateResultRow("boolean");
      return { ok: true, value: result, type: "boolean" };
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

  /** Index-scans for:
   *   for (int i = INIT; COND; i++) { ... } — after each iteration,
   *     feeds the loop tracker from the body's last charAt/classify
   *     calls and int-typed accumulator variables.
   *   if (...) { ... } [else if (...) { ... }]* [else { ... }] — an
   *     arbitrary-length branch chain (M3/M6's three-branch classifier). */
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
          this._lastClassifyResult = undefined;
          const r = await this.runStatements(bodyLines, vars);
          if (!r.ok) return r;
          const trackedInts = Object.keys(vars).filter((k) => k !== loopVar && vars[k] && vars[k].type === "int");
          const countVal = trackedInts.length ? vars[trackedInts[trackedInts.length - 1]].value : null;
          this.updateLoopTracker(vars[loopVar].value, this._lastExtractedChar !== undefined ? this._lastExtractedChar : null, !!this._lastClassifyResult, countVal);
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
      this.clearMiniPrism();
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

    try { GameManager.completeLevel(84, Math.round((this.flawlessCount / MISSIONS.length) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("character_isLetter_mastery"); } catch (_) {}
    try {
      localStorage.setItem("level85_results", JSON.stringify({
        level: 85, concept: "character_isLetter", phase: "restructuring",
        score: this.score, missionsCompleted: 6, flawlessMissions: this.flawlessCount,
        totalRuns: this.runCount, failedRuns: this.failedRunCount, hintsUsed: this.hintCount,
        selfCorrections: this.selfCorrectionCount,
        preciseClassifierProactive: this.preciseProactive,
        threeBranchClean: this.threeBranchClean,
        nameValidationClean: this.nameValClean,
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
      fourth.fillStyle(C_BLUE_LETTER, 0.6);
      fourth.fillPoints(pts, true);
      this.tweens.add({ targets: fourth, alpha: 0.5, duration: 600, yoyo: true, repeat: 2 });
    }
    this.tweens.add({ targets: this._precisionRefGfx, alpha: 1, duration: 300, yoyo: true, repeat: 2 });

    this.createFinaleConfetti(640, 300, 40);
    await this.delay(700);

    // final rapid classification: both instruments fire together
    this.clearMiniLoupe();
    this.clearMiniPrism();
    await Promise.all([
      this.runMiniClassification("9", 57, true),
      this.runMiniPrismClassification("A", true),
    ]);
    await this.delay(80);

    const flash = this.add.rectangle(W / 2, H / 2, W, H, 0xffffff, 0).setDepth(94);
    this.tweens.add({ targets: flash, fillAlpha: 0.4, duration: 250, yoyo: true, onComplete: () => flash.destroy() });

    await this.delay(400);

    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
    this.tweens.add({ targets: ov, fillAlpha: 0.85, duration: 500 });
    this._ceremonyElements = [ov];

    const panel = this.add.graphics().setDepth(90);
    panel.fillStyle(0x0a1428, 1);
    panel.fillRoundedRect(350, 50, 580, 460, 16);
    panel.lineStyle(2, C_BLUE_LETTER, 1);
    panel.strokeRoundedRect(350, 50, 580, 460, 16);
    this._ceremonyElements.push(panel);

    const title = this.add.text(640, 90, "SENIOR GEMOLOGIST", { font: "bold 32px Georgia", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(91).setScale(0);
    this.tweens.add({ targets: title, scale: 1, duration: 350, ease: "Back.easeOut" });
    this._ceremonyElements.push(title);

    const tbPct = `${Object.values(this.threeBranchClean).filter(Boolean).length}/2`;
    const ppPct = `${Object.values(this.preciseProactive).filter(Boolean).length}/1`;
    const nvPct = `${Object.values(this.nameValClean).filter(Boolean).length}/1`;
    const lines = [
      "MISSIONS: 6/6",
      `FLAWLESS: ${this.flawlessCount}`,
      `SELF-CORRECTIONS: ${this.selfCorrectionCount}`,
      `THREE-BRANCH CLEAN: ${tbPct}`,
      `PRECISE COUNTER PROACTIVE: ${ppPct}`,
      `NAME VALIDATION CLEAN: ${nvPct}`,
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
    bg.lineStyle(3, C_BLUE_LETTER, 1);
    bg.strokeCircle(0, 0, 30);
    const prismIcon = this.add.text(-13, -5, "🔷", { font: "bold 13px Arial" }).setOrigin(0.5);
    const pendulumIcon = this.add.text(0, -5, "⏱️", { font: "bold 13px Arial" }).setOrigin(0.5);
    const broochIcon = this.add.text(13, -5, "📌", { font: "bold 12px Arial" }).setOrigin(0.5);
    badge.add([bg, prismIcon, pendulumIcon, broochIcon]);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 2050 });
    const badgeLbl = this.add.text(640, 397, "isLetter() MASTERY", { font: "bold 15px Georgia", color: HEX_BLUE_LETTER }).setOrigin(0.5).setDepth(91).setAlpha(0);
    const badgeSub = this.add.text(640, 412, "Accretion ✓  Tuning ✓  Restructuring ✓", { font: "12px Arial", color: "#78909c" }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: [badgeLbl, badgeSub], alpha: 1, duration: 300, delay: 2200 });
    this._ceremonyElements.push(badge, badgeLbl, badgeSub);

    const barY = 440;
    const barG = this.add.graphics().setDepth(91).setAlpha(0);
    barG.lineStyle(1.5, C_GRAY, 1);
    barG.strokeRoundedRect(450, barY, 380, 14, 6);
    barG.fillStyle(C_SILVER, 1);
    barG.fillRoundedRect(450, barY, (380 * 2) / 3, 14, 6);
    const progLabel = this.add.text(640, barY - 10, "CHARACTER WING — 2 of 3 trilogies complete", { font: "bold 13px Georgia", color: HEX_SILVER }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: [barG, progLabel], alpha: 1, duration: 300, delay: 2400 });
    this._ceremonyElements.push(barG, progLabel);

    await this.delay(2900);
    if (!this._alive) return;

    await new Promise((res) => { this.tweens.add({ targets: this.bit, x: 640, y: 610, duration: 500, ease: "Sine.easeInOut", onComplete: res }); });
    await this.bitSay("The full works: isLetter classifies, charAt extracts, the three-branch pattern sorts digit from letter from other, and !isDigit never substitutes for it. Six missions, the second Character Wing trilogy sealed — Accretion taught the schema, Tuning drilled the three zones, Restructuring built the production programs. Senior Gemologist — the prism is fully yours. One instrument waits in the deeper halls: isUpperCase.");
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
    this._makeButton(770, 530, "NEXT: The Case Prism →", 300, 44, { fill: 0x00733a, stroke: C_GREEN_BRIGHT, textColor: "#ffffff" }, () => {
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
