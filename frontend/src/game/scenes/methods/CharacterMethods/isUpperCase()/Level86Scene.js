/**
 * Level 86 — "The Case Prism" (Character Wing: Accretion Phase —
 * Character.isUpperCase())
 * ===========================================================================
 * Opens the THIRD and FINAL method of the Character Wing (the curriculum's
 * last new method overall). Hero visual: the Case Prism — a dual-faceted
 * (rhombus) crystal beside the dormant Numeral Loupe and Prismatic Lens.
 * White light entering it refracts UPWARD in brilliant white-blue for
 * uppercase letters, DOWNWARD in deeper blue for lowercase letters, and
 * passes straight through for non-letters. Unlike isDigit/isLetter (which
 * were MUTUALLY EXCLUSIVE), isUpperCase is NESTED inside isLetter — every
 * uppercase letter satisfies both. Reuses L83's predict/command accretion
 * architecture (Gemologist's Slate, source display, HUD/Bit/tutorial
 * skeleton, round lifecycle).
 *
 * Hand-verified all 12 rounds by direct tracing against real Java
 * semantics before writing any code. TWO real issues caught in the
 * spec's own round data:
 *
 *  1. Round 10 (SPEC BUG): the skeleton hardcoded `char ch = 'P';` with
 *     only ONE test (`expectedOutput: "Uppercase? true"`). Direct trace
 *     against every cartridge: `Character.isLetter(ch)` on 'P' is ALSO
 *     true ("Uppercase? true" — matches!), and `ch == 'P'` on 'P' is
 *     ALSO true ("Uppercase? true" — matches!). Both wrong cartridges
 *     produce the SAME output as the correct one on the only test the
 *     round runs — neither would ever be caught. Fixed by converting
 *     `ch` to a substitutable `/* test value *\/` and expanding to four
 *     tests: 'P' (true), 'p' (false — kills the isLetter distractor,
 *     which is true for both cases), 'X' (true — kills `ch=='P'`, which
 *     only coincidentally agreed with isUpperCase because 'P' is both
 *     uppercase AND literally the letter P), and '5' (false, digit).
 *
 *  2. Round 12 (EVALUATOR DESIGN ISSUE, caught before writing any code):
 *     the mission's `if (<slot:upperTest>) { upper++; }` / `else if
 *     (Character.isLetter(ch)) { lower++; }` is the same single-line
 *     BRACED if/else-if shape L83 Round 12 used — but L83 deliberately
 *     evaluated that shape as two INDEPENDENT conditionals rather than a
 *     true gate, a simplification justified there specifically because
 *     isDigit and isLetter are mutually exclusive (whatever the second
 *     condition evaluates to on a char the first already matched is
 *     exactly what true gating would have produced). That justification
 *     does NOT hold here: isUpperCase and isLetter are NESTED, not
 *     exclusive — every uppercase char also satisfies isLetter. Hand-
 *     tracing the CORRECT combo against Round 12's own first test
 *     ("HeLLo") under L83's independent-evaluation shortcut gives
 *     upper=3, lower=5 (every letter re-counted by the independently-
 *     true isLetter check) instead of the mission's own expected
 *     upper=3, lower=2 — the correct combo would have failed its own
 *     test battery had L83's shortcut been reused unmodified. Fixed by
 *     implementing a genuinely GATED single-line-braced if/else-if
 *     chain for this level (only one branch ever executes, exactly like
 *     the multi-line block form) — verified by hand-trace against all
 *     four of Round 12's tests and all three of its distractors before
 *     writing the evaluator, then re-confirmed by the Node-sim pass.
 *
 * New evaluator vocabulary beyond L83's cascade:
 *  - `Character.isUpperCase(char)` — this level's own subject, driving
 *    the Case Prism choreography (true for 'A'-'Z' only).
 *  - A genuinely GATED single-line braced if/else-if chain (see issue 2
 *    above) — a stricter capability than L83's scoped shortcut for the
 *    identical surface syntax.
 *  - isDigit and isLetter are both used in comparison/refinement rounds
 *    but resolve SILENTLY here (no dedicated instrument fires) — this
 *    level's hero visual belongs to isUpperCase alone, matching L83's
 *    own precedent of keeping isDigit silent while isLetter got the
 *    stage.
 */

import Phaser from "phaser";
import { GameManager } from "../../../../GameManager.js";
import { addTutorialReplayButton } from "../../../../TutorialReplayButton.js";
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

// The Case Prism geometry (shares the loupe/lens pad footprint)
const PAD_X0 = 400, PAD_X1 = 640, PAD_Y0 = 380, PAD_Y1 = 440;
const PAD_CX = 520, PAD_CY = 410;
const PRISM_CX = 520, PRISM_REST_Y = 235, PRISM_DOWN_Y = 410, PRISM_SIZE = 46;
const VERDICT_X = 680, VERDICT_Y = 220, VERDICT_W = 160, VERDICT_H = 110;
const CONT_X = 520, CONT_Y = 468, CONT_W = 140, CONT_H = 36;
// Gemologist's Slate (reveal panel)
const SLATE_X = 800, SLATE_Y = 130, SLATE_W = 420, SLATE_H = 300;

const TUTORIAL_KEY = "level86_tutorial_done";

// ══════════════════════════════════════════════════════════════
// ROUND CONFIGURATION
// ══════════════════════════════════════════════════════════════
const ROUNDS = [
  // ── Type A: Classification Prediction (Rounds 1–3) ──
  { round: 1, type: "predict",
    source: "boolean b = Character.isUpperCase('K');",
    question: "What is stored in b?", correct: "true",
    options: [
      { value: "true", tag: null },
      { value: "false", tag: "K_not_uppercase_belief" },
      { value: "75", tag: "isUpperCase_returns_ascii_belief" },
      { value: "error", tag: "isUpperCase_crashes_belief", label: "Error" },
    ],
    concept: "basic_isUpperCase_true" },

  { round: 2, type: "predict",
    source: "boolean b = Character.isUpperCase('k');",
    question: "What is stored in b?", correct: "false",
    options: [
      { value: "false", tag: null },
      { value: "true", tag: "lowercase_is_uppercase_belief" },
      { value: "error", tag: "lowercase_crashes_belief", label: "Error" },
      { value: '"K"', tag: "isUpperCase_changes_case_belief", label: '"K" (converts to upper)' },
    ],
    revealNote: "Lowercase 'k' is a letter but NOT uppercase — isUpperCase returns false. The prism saw a letter (beam present) but the beam went DOWN (lower tier). isLetter('k') = true; isUpperCase('k') = false. The sub-classification distinguished.",
    concept: "basic_lowercase_false" },

  { round: 3, type: "predict",
    source: "boolean b = Character.isUpperCase('9');",
    question: "What is stored in b?", correct: "false",
    options: [
      { value: "false", tag: null },
      { value: "true", tag: "digit_is_uppercase_belief" },
      { value: "9", tag: "isUpperCase_returns_value_belief" },
      { value: "error", tag: "digit_crashes_uppercase_belief", label: "Error" },
    ],
    concept: "basic_digit_false" },

  // ── Type B: Subset Relationship & Probes (Rounds 4–7) ──
  { round: 4, type: "predict",
    source: 'char ch = \'Z\';\nboolean u = Character.isUpperCase(ch);\nboolean l = Character.isLetter(ch);\nSystem.out.println(u + " " + l);',
    question: "What prints?", correct: "true true",
    options: [
      { value: "true true", tag: null },
      { value: "true false", tag: "uppercase_isLetter_exclusive_belief" },
      { value: "false true", tag: "Z_not_uppercase_belief" },
      { value: "false false", tag: "Z_is_neither_belief" },
    ],
    revealNote: "BOTH true: isUpperCase('Z') = true AND isLetter('Z') = true. The SUBSET relationship — every uppercase letter IS a letter. Both tests can be true simultaneously, unlike isDigit/isLetter which were mutually exclusive.",
    concept: "subset_both_true" },

  { round: 5, type: "predict",
    source: 'char ch = \'m\';\nboolean u = Character.isUpperCase(ch);\nboolean l = Character.isLetter(ch);\nSystem.out.println(u + " " + l);',
    question: "What prints?", correct: "false true",
    options: [
      { value: "false true", tag: null },
      { value: "true true", tag: "lowercase_is_uppercase_belief" },
      { value: "false false", tag: "lowercase_not_letter_belief" },
      { value: "true false", tag: "isUpperCase_checks_all_letters_belief" },
    ],
    revealNote: "The ASYMMETRY: 'm' is a letter (isLetter=true) but NOT uppercase (isUpperCase=false). isLetter is the broad family; isUpperCase is the narrow sub-family. Lowercase letters pass the family test but fail the sub-family test.",
    concept: "subset_asymmetry" },

  { round: 6, type: "predict",
    source: "boolean b = Character.isUpperCase(' ');",
    question: "What is stored in b?", correct: "false",
    options: [
      { value: "false", tag: null },
      { value: "true", tag: "space_is_uppercase_belief" },
      { value: "error", tag: "space_crashes_belief", label: "Error" },
      { value: "32", tag: "isUpperCase_returns_ascii_belief" },
    ],
    concept: "space_not_uppercase" },

  { round: 7, type: "predict",
    source: 'boolean b = Character.isUpperCase("A");',
    question: "What happens?", correct: "compile_error",
    options: [
      { value: "compile_error", tag: null, label: "COMPILE ERROR — takes char, not String" },
      { value: "true", tag: "isUpperCase_takes_string_belief" },
      { value: "false", tag: "string_A_not_uppercase_belief" },
      { value: "error", tag: "runtime_vs_compile_confusion", label: "Runtime error" },
    ],
    concept: "char_not_string" },

  // ── Type C: Expressions with isUpperCase (Rounds 8–9) ──
  { round: 8, type: "predict",
    source: 'String s = "Hello";\nint uppers = 0;\nfor (int i = 0; i < s.length(); i++) {\n    if (Character.isUpperCase(s.charAt(i))) uppers++;\n}\nSystem.out.println(uppers);',
    question: "What prints?", correct: "1",
    options: [
      { value: "1", tag: null },
      { value: "5", tag: "isUpperCase_checks_all_letters_belief" },
      { value: "0", tag: "no_uppercase_belief" },
      { value: "4", tag: "counts_lowercase_belief" },
    ],
    revealNote: "'H' is uppercase (count); 'e', 'l', 'l', 'o' are lowercase (skip). One uppercase letter in 'Hello'. isUpperCase is PRECISE — only the capital H passed.",
    concept: "uppercase_counter" },

  { round: 9, type: "predict",
    source: 'char ch = \'F\';\nif (Character.isUpperCase(ch)) {\n    System.out.println("Upper: " + ch);\n} else if (Character.isLetter(ch)) {\n    System.out.println("Lower: " + ch);\n} else {\n    System.out.println("Other: " + ch);\n}',
    question: "What prints?", correct: "Upper: F",
    options: [
      { value: "Upper: F", tag: null },
      { value: "Lower: F", tag: "F_is_lowercase_belief" },
      { value: "Other: F", tag: "F_is_other_belief" },
      { value: "error", tag: "nested_if_crashes_belief", label: "Error" },
    ],
    revealNote: "THE REFINED THREE-BRANCH: isUpperCase first (catches uppercase letters), then isLetter (catches remaining lowercase letters), then else (catches non-letters). The ORDERING matters: isUpperCase is tested BEFORE isLetter because uppercase IS a letter — testing isLetter first would catch ALL letters, and the uppercase branch would never fire.",
    concept: "refined_three_branch" },

  // ── Type D: Gemologist Command (Rounds 10–12) ──
  { round: 10, type: "command",
    source: 'char ch = /* test value */;\nboolean result = <slot:check>;\nSystem.out.println("Uppercase? " + result);',
    mission: "Check if the character is uppercase.\nFor 'P': Uppercase? true\nFor 'p': Uppercase? false\nFor 'X': Uppercase? true\nFor '5': Uppercase? false",
    slots: [{ id: "check", hint: "the case test" }],
    cartridges: [
      { code: "Character.isUpperCase(ch)", correct: true },
      { code: "Character.isLetter(ch)", tag: "isLetter_not_isUpperCase" },
      { code: "character.isUpperCase(ch)", tag: "character_lowercase_belief" },
      { code: "ch == 'P'", tag: "hardcoded_comparison" },
    ],
    tests: [
      { substitutions: { ch: "'P'" }, expectedOutput: "Uppercase? true" },
      { substitutions: { ch: "'p'" }, expectedOutput: "Uppercase? false" },
      { substitutions: { ch: "'X'" }, expectedOutput: "Uppercase? true" },
      { substitutions: { ch: "'5'" }, expectedOutput: "Uppercase? false" },
    ],
    postMissionNote: "Bit: 'isUpperCase on the char, boolean in the container. The isLetter distractor would have said true for lowercase \"p\" too — it doesn't test case. And ch == \\'P\\' only ever works for the letter P itself — \"X\" proved that wrong. isUpperCase works for EVERY uppercase letter.'",
    concept: "command_basic_isUpperCase" },

  { round: 11, type: "command",
    source: 'char ch = /* test value */;\nif (<slot:upper>) {\n    System.out.println("UPPER");\n} else if (<slot:letter>) {\n    System.out.println("lower");\n} else {\n    System.out.println("other");\n}',
    mission: "Classify: uppercase, lowercase, or other.\nFor 'd': lower\nFor 'D': UPPER\nFor '5': other",
    slots: [
      { id: "upper", hint: "the uppercase test (first!)" },
      { id: "letter", hint: "the remaining-letter test" },
    ],
    cartridges: [
      { code: "Character.isUpperCase(ch)", correct: true, slotId: "upper" },
      { code: "Character.isLetter(ch)", correct: true, slotId: "letter" },
      { code: "Character.isLetter(ch)", tag: "order_wrong", slotId: "upper" },
      { code: "Character.isUpperCase(ch)", tag: "order_wrong", slotId: "letter" },
      { code: "Character.isDigit(ch)", tag: "wrong_classification_method", slotId: "letter" },
    ],
    tests: [
      { substitutions: { ch: "'d'" }, expectedOutput: "lower" },
      { substitutions: { ch: "'D'" }, expectedOutput: "UPPER" },
      { substitutions: { ch: "'5'" }, expectedOutput: "other" },
    ],
    postMissionNote: "Bit: 'The ORDER matters: isUpperCase FIRST (narrow test), then isLetter (broad test catches the rest — which at this point can only be lowercase letters). If you put isLetter first, ALL letters match the first branch, and the uppercase test never fires. Narrow before broad.'",
    concept: "command_refined_classifier" },

  { round: 12, type: "command",
    source: 'String word = /* test value */;\nint upper = 0;\nint lower = 0;\nfor (int i = 0; i < word.length(); i++) {\n    char ch = word.charAt(i);\n    if (<slot:upperTest>) { upper++; }\n    else if (Character.isLetter(ch)) { lower++; }\n}\nSystem.out.println("Upper: " + upper + " Lower: " + lower);',
    mission: 'Count uppercase and lowercase letters separately.\nFor "HeLLo": Upper: 3 Lower: 2',
    slots: [{ id: "upperTest", hint: "the uppercase test (in the if)" }],
    cartridges: [
      { code: "Character.isUpperCase(ch)", correct: true },
      { code: "Character.isLetter(ch)", tag: "isLetter_not_isUpperCase" },
      { code: "Character.isDigit(ch)", tag: "wrong_classification_method" },
      { code: "!Character.isLetter(ch)", tag: "negation_wrong" },
    ],
    tests: [
      { substitutions: { word: '"HeLLo"' }, expectedOutput: "Upper: 3 Lower: 2" },
      { substitutions: { word: '"hello"' }, expectedOutput: "Upper: 0 Lower: 5" },
      { substitutions: { word: '"HELLO"' }, expectedOutput: "Upper: 5 Lower: 0" },
      { substitutions: { word: '"H1e2"' }, expectedOutput: "Upper: 1 Lower: 1" },
    ],
    postMissionNote: "Bit (touching the dual-gem earring): 'isUpperCase in the if, isLetter in the else-if — the uppercase letters match first, the remaining letters (only lowercase at that point) match second. \"HeLLo\": H(↑) e(↓) L(↑) L(↑) o(↓) — 3 upper, 2 lower. The isLetter distractor would have caught ALL 5 as \"upper\" — wrong. The narrow test MUST come first. This is the final instrument, Specialist. Three prisms, one wing, one complete toolkit.'",
    concept: "command_case_counter" },
];

const MISCONCEPTION_FEEDBACK = {
  K_not_uppercase_belief: "'K' IS uppercase — one of the 26 capital letters A-Z. The beam goes UP.",
  isUpperCase_returns_ascii_belief: "isUpperCase returns boolean, not the character's code. Only the classification matters.",
  isUpperCase_crashes_belief: "isUpperCase never crashes — it has a valid true/false answer for every char.",
  lowercase_is_uppercase_belief: "Lowercase 'k' is a letter but NOT uppercase — isUpperCase returns false. The prism saw a letter but classified its TIER as lower.",
  lowercase_crashes_belief: "isUpperCase never crashes on a lowercase letter — it simply returns false.",
  isUpperCase_changes_case_belief: "isUpperCase CLASSIFIES — it does NOT convert. 'k' stays 'k'; the method just reports false. Conversion (toUpperCase) is a different method entirely.",
  digit_is_uppercase_belief: "Digits are not letters at all — isUpperCase returns false for the same reason isLetter returns false.",
  isUpperCase_returns_value_belief: "isUpperCase returns BOOLEAN — true or false — never the digit's value or the character itself.",
  digit_crashes_uppercase_belief: "isUpperCase never crashes on a digit — it simply returns false, same as any non-letter.",
  uppercase_isLetter_exclusive_belief: "isUpperCase and isLetter are NOT exclusive — they're NESTED. Every uppercase letter passes BOTH tests. 'Z' is uppercase AND a letter.",
  Z_not_uppercase_belief: "'Z' IS uppercase — isUpperCase('Z') is true. It's the last letter of the uppercase alphabet.",
  Z_is_neither_belief: "'Z' is both a letter AND uppercase — it fails neither test. Both isUpperCase and isLetter return true for it.",
  lowercase_not_letter_belief: "'m' IS a letter — isLetter('m') is true. It's just not UPPERCASE.",
  isUpperCase_checks_all_letters_belief: "isUpperCase checks for UPPERCASE only — lowercase letters like 'm' FAIL isUpperCase even though they pass isLetter. Use isLetter for all letters regardless of case.",
  space_is_uppercase_belief: "Space is whitespace — not a letter, certainly not uppercase.",
  space_crashes_belief: "isUpperCase never crashes on whitespace — it simply returns false.",
  isUpperCase_takes_string_belief: "isUpperCase takes a CHAR (single quotes), not a String — same rule as isDigit and isLetter.",
  string_A_not_uppercase_belief: "This isn't a false-vs-true question — passing a String where isUpperCase expects a char is a COMPILE ERROR, caught before the program ever runs.",
  runtime_vs_compile_confusion: "A type mismatch (String where char is expected) is caught at COMPILE time, before the program runs — not a runtime error.",
  no_uppercase_belief: "'H' in \"Hello\" IS uppercase — isUpperCase('H') is true, so uppers increments at least once.",
  counts_lowercase_belief: "isUpperCase counts UPPERCASE letters, not lowercase ones. Only 'H' passes in \"Hello\" — the four lowercase letters ('e','l','l','o') all fail isUpperCase.",
  F_is_lowercase_belief: "'F' IS uppercase — isUpperCase('F') is true, so the first branch runs and prints \"Upper: F\".",
  F_is_other_belief: "'F' is a letter (and an uppercase one) — it never reaches the final else branch.",
  nested_if_crashes_belief: "An if/else-if/else chain never crashes — exactly one branch runs, chosen by the first true condition.",
  isLetter_not_isUpperCase: "isLetter catches ALL letters — both upper and lowercase. For ONLY uppercase, use isUpperCase. The broad test doesn't distinguish case.",
  character_lowercase_belief: "Character with a capital C — the wrapper class. 'character' (lowercase) doesn't exist.",
  hardcoded_comparison: "ch == 'P' works only for the exact letter P — it's not a classification method. isUpperCase works for ALL uppercase letters, which 'X' proved: ch == 'P' says false for 'X', but isUpperCase correctly says true.",
  order_wrong: "isUpperCase FIRST (narrow), then isLetter (broad). If isLetter comes first, it catches ALL letters and the uppercase branch never fires. Narrow before broad — the ordering principle.",
  wrong_classification_method: "isDigit classifies digits; isLetter classifies letters; isUpperCase classifies uppercase letters. Choose the right instrument.",
  negation_wrong: "!isLetter is true for NON-letters, not for lowercase letters — this catches everything backwards from what the mission needs.",
  timeout: "Trace the prism again — did the beam go up, down, or nowhere at all?",
};

export class Level86Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level86Scene" });
  }

  init(data = {}) {
    this._forceTutorial = !!data.forceTutorial;
    this.currentRound = 0;
    this.score = 0;
    this.displayScore = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.lives = 5;
    this.correctFirstTry = 0;
    this.totalTime = 0;
    this.attemptLog = [];
    this.roundElements = [];
    this.roundStartTime = 0;
    this.roundAttempts = 0;
    this.slotContents = {};
    this.slotDefs = {};
    this.cartridges = [];
    this.inputLocked = true;
    this.gameEnded = false;
    this._alive = true;
    this.firstUpperAnnotationShown = false;
  }

  preload() {}

  create() {
    this._alive = true;
    this.createParticleTexture();
    this.createBackground();
    this.createChamberInterior();
    this.createChamberFloor();
    this.createParticles();
    this.createCasePrism();
    this.createGemologistsSlate();
    this.createSourceDisplay();
    this.createHUD();
    addTutorialReplayButton(this, W, this.lifeIcons[4].x, this.lifeIcons[0].y);
    this.createExpressionMonitor();
    this.createBit();
    this.checkTutorial();
  }

  update(time, delta) {
    this.updateParticles(time, delta);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // SETUP — THE CASE CHAMBER INTERIOR
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l86_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l86_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x0a1428).setDepth(0);
  }

  createChamberInterior() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x0a1428, 1);
    g.fillRect(0, 0, W, 216);
    g.lineStyle(1, 0x0e1830, 0.3);
    for (let x = 20; x < W; x += 26) g.lineBetween(x, 0, x, 216);

    // Character classification chart — full taxonomy, Upper/lower sub-row
    g.fillStyle(0x0a1428, 1);
    g.lineStyle(2, C_SILVER, 1);
    g.fillRect(280, 40, 480, 130);
    g.strokeRect(280, 40, 480, 130);
    g.lineStyle(1, C_SILVER, 0.3);
    g.lineBetween(427, 44, 427, 166);
    g.lineBetween(574, 44, 574, 166);
    this.add.text(353, 52, "Digits", { font: "bold 10px Georgia", color: HEX_GOLD }).setOrigin(0.5).setAlpha(0.6).setDepth(2);
    this.add.text(353, 80, "0-9", { font: "11px Courier New", color: HEX_GOLD }).setOrigin(0.5).setAlpha(0.4).setDepth(2);
    this.add.text(500, 52, "Letters", { font: "bold 10px Georgia", color: HEX_BLUE_LETTER }).setOrigin(0.5).setAlpha(0.6).setDepth(2);
    this.add.text(500, 80, "A-Z a-z", { font: "11px Courier New", color: HEX_BLUE_LETTER }).setOrigin(0.5).setAlpha(0.4).setDepth(2);
    this.add.text(500, 100, "UPPER A-Z", { font: "bold 9px Courier New", color: HEX_WHITE_BLUE }).setOrigin(0.5).setAlpha(0.6).setDepth(2);
    this.add.text(500, 112, "lower a-z", { font: "9px Courier New", color: HEX_DEEP_BLUE }).setOrigin(0.5).setAlpha(0.5).setDepth(2);
    this.add.text(647, 52, "Other", { font: "bold 10px Georgia", color: HEX_GRAY }).setOrigin(0.5).setAlpha(0.6).setDepth(2);
    this.add.text(647, 80, ". _ ' '", { font: "11px Courier New", color: HEX_GRAY }).setOrigin(0.5).setAlpha(0.4).setDepth(2);
    this._upperChartLabel = this.add.text(500, 100, "UPPER A-Z", { font: "bold 9px Courier New", color: HEX_WHITE_BLUE }).setOrigin(0.5).setAlpha(0.6).setDepth(2);
    this._lowerChartLabel = this.add.text(500, 112, "lower a-z", { font: "9px Courier New", color: HEX_DEEP_BLUE }).setOrigin(0.5).setAlpha(0.5).setDepth(2);

    // Velvet-lined display case (left wall)
    g.lineStyle(2, C_SILVER, 1);
    g.fillStyle(0x0a1428, 1);
    g.fillRect(60, 150, 80, 120);
    g.strokeRect(60, 150, 80, 120);
    const gemShapes = [
      { x: 100, y: 180, color: C_GOLD },
      { x: 100, y: 210, color: C_WHITE_BLUE },
      { x: 100, y: 240, color: C_DEEP_BLUE },
    ];
    gemShapes.forEach((s) => {
      const pts = [];
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i;
        pts.push({ x: s.x + Math.cos(a) * 10, y: s.y + Math.sin(a) * 10 });
      }
      g.fillStyle(s.color, 0.3);
      g.fillPoints(pts, true);
    });

    // Dormant sibling instruments — Numeral Loupe and Prismatic Lens
    const loupeSil = this.add.graphics().setDepth(2).setAlpha(0.2);
    loupeSil.lineStyle(3, C_SILVER, 1);
    loupeSil.strokeCircle(150, 300, 20);
    loupeSil.lineBetween(150 + 14, 300 + 14, 150 + 27, 300 + 27);
    this.add.text(150, 330, "isDigit()\nmastered", { font: "italic 10px Georgia", color: HEX_SILVER, align: "center" }).setOrigin(0.5).setAlpha(0.2).setDepth(2);

    const lensSil = this.add.graphics().setDepth(2).setAlpha(0.2);
    lensSil.lineStyle(3, C_SILVER, 1);
    const s2 = 16;
    lensSil.strokeTriangle(150, 380 - s2, 150 + s2 * 0.87, 380 + s2 * 0.5, 150 - s2 * 0.87, 380 + s2 * 0.5);
    this.add.text(150, 408, "isLetter()\nmastered", { font: "italic 10px Georgia", color: HEX_SILVER, align: "center" }).setOrigin(0.5).setAlpha(0.2).setDepth(2);

    // Case-specimen display (right wall) — upper/lower gem rows
    const csG = this.add.graphics().setDepth(2);
    csG.lineStyle(1.5, C_SILVER, 0.4);
    csG.strokeRoundedRect(1030, 40, 140, 120, 6);
    this.add.text(1100, 50, "CASE SPECIMENS", { font: "bold 9px Georgia", color: HEX_SILVER }).setOrigin(0.5).setAlpha(0.5).setDepth(3);
    this._caseSpecimens = [];
    ["A", "B", "C", "D", "E"].forEach((ch, i) => {
      const x = 1050 + i * 18, y = 75;
      const gg = this.add.graphics().setDepth(3);
      const pts = [];
      for (let k = 0; k < 8; k++) { const a = (Math.PI / 4) * k; pts.push({ x: x + Math.cos(a) * 7, y: y + Math.sin(a) * 7 }); }
      gg.fillStyle(C_WHITE_BLUE, 0.4);
      gg.lineStyle(1, 0x90caf9, 1);
      gg.fillPoints(pts, true);
      gg.strokePoints(pts, true);
      const lbl = this.add.text(x, y, ch, { font: "bold 9px Courier New", color: "#0a1428" }).setOrigin(0.5).setDepth(4);
      this._caseSpecimens.push({ gg, lbl });
    });
    ["a", "b", "c", "d", "e"].forEach((ch, i) => {
      const x = 1050 + i * 18, y = 130;
      const gg = this.add.graphics().setDepth(3);
      const pts = [];
      for (let k = 0; k < 8; k++) { const a = (Math.PI / 4) * k; pts.push({ x: x + Math.cos(a) * 7, y: y + Math.sin(a) * 7 }); }
      gg.fillStyle(C_DEEP_BLUE, 0.35);
      gg.lineStyle(1, 0x1565c0, 1);
      gg.fillPoints(pts, true);
      gg.strokePoints(pts, true);
      const lbl = this.add.text(x, y, ch, { font: "bold 9px Courier New", color: "#0a1428" }).setOrigin(0.5).setDepth(4);
      this._caseSpecimens.push({ gg, lbl });
    });

    // Precision scale (side bench)
    g.lineStyle(1.5, C_SILVER, 0.4);
    g.strokeRect(60, 460, 40, 30);
    this.scaleBeam = this.add.rectangle(80, 470, 34, 2, C_SILVER, 0.6).setDepth(2);
    g.lineBetween(80, 466, 80, 474);

    // Banner
    const bg = this.add.graphics().setDepth(2);
    bg.fillStyle(0x0a1428, 1);
    bg.lineStyle(1, C_WHITE_BLUE, 0.5);
    bg.fillRoundedRect(480, 12, 320, 26, 3);
    bg.strokeRoundedRect(480, 12, 320, 26, 3);
    this.add.text(640, 25, "T H E   C A S E   P R I S M", { font: "bold 16px Georgia", color: HEX_WHITE_BLUE }).setOrigin(0.5).setAlpha(0.7).setDepth(3);
  }

  updateScaleBalance(time) {
    if (!this.scaleBeam) return;
    this.scaleBeam.setAngle(Math.sin(time * 0.0006) * 1.2);
  }

  createChamberFloor() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x06101e, 1);
    g.fillRect(0, 635, W, 85);
    g.lineStyle(1, 0x0e1830, 0.2);
    for (let i = 0; i < 10; i++) {
      const x1 = Phaser.Math.Between(0, W), x2 = x1 + Phaser.Math.Between(-60, 60);
      g.lineBetween(x1, 635, x2, 720);
    }
    g.fillStyle(C_SILVER, 0.15);
    g.fillRect(0, 636, W, 2);
  }

  createParticles() {
    this.ambient = [];
    const colors = [0x0a1428, C_WHITE_BLUE, C_DEEP_BLUE];
    for (let i = 0; i < 6; i++) {
      this.ambient.push(this.add.circle(Phaser.Math.Between(0, W), Phaser.Math.Between(230, 630), 1, Phaser.Utils.Array.GetRandom(colors), Phaser.Math.FloatBetween(0.03, 0.05)).setDepth(2));
    }
  }

  updateParticles(time, delta) {
    if (!this.ambient) return;
    const step = 0.004 * (delta / 16.7);
    this.ambient.forEach((p, i) => {
      p.y -= step * (i % 2 === 0 ? 1 : 0.6);
      p.x += Math.sin(time * 0.0002 + i) * 0.015;
      if (p.y < 230) p.y = 630; if (p.y > 630) p.y = 230;
      if (p.x > W) p.x = 0; if (p.x < 0) p.x = W;
    });
    this.updateScaleBalance(time);
  }

  createAnnotation(x, y, text, colorHex) {
    const t = this.add.text(x, y, text, { font: "italic 12px Arial", color: colorHex, wordWrap: { width: 280 }, align: "center" }).setOrigin(0.5).setDepth(70).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 200 });
    this.time.delayedCall(2600, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() }); });
    return t;
  }

  createFloatingText(x, y, text, colorHex, font = "bold 15px Arial", hold = 1400) {
    const t = this.add.text(x, y, text, { font, color: colorHex, wordWrap: { width: 320 }, align: "center" }).setOrigin(0.5).setDepth(31).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 180 });
    this.time.delayedCall(hold, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() }); });
    return t;
  }

  createConfetti(x, y, count = 30) {
    const p = this.add.particles(x, y, "l86_dot", {
      speed: { min: 80, max: 240 }, angle: { min: 0, max: 360 }, scale: { start: 0.9, end: 0 }, lifespan: 500,
      tint: [C_WHITE_BLUE, C_DEEP_BLUE, C_SILVER, 0xffffff], emitting: false,
    }).setDepth(85);
    p.explode(count);
    this.time.delayedCall(900, () => p.destroy());
  }

  screenShake(intensity = 0.004, duration = 150) {
    this.cameras.main.shake(duration, intensity);
  }

  // ══════════════════════════════════════════════════════════════
  // GEMOLOGIST'S SLATE — silver-framed chalkboard reveal panel, with
  // a small subset Euler diagram: UPPERCASE nested inside LETTERS,
  // both separate from DIGITS.
  // ══════════════════════════════════════════════════════════════

  createGemologistsSlate() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0a0d18, 1);
    g.lineStyle(2, C_SILVER, 1);
    g.fillRoundedRect(SLATE_X, SLATE_Y, SLATE_W, SLATE_H, 8);
    g.strokeRoundedRect(SLATE_X, SLATE_Y, SLATE_W, SLATE_H, 8);
    this.add.text(SLATE_X + 14, SLATE_Y + 12, "GEMOLOGIST'S SLATE", { font: "bold 12px Georgia", color: HEX_SILVER }).setDepth(11);

    const pillG = this.add.graphics().setDepth(11);
    pillG.lineStyle(1.2, C_SILVER, 0.7);
    pillG.strokeRoundedRect(SLATE_X + SLATE_W - 190, SLATE_Y + 8, 178, 16, 8);
    this.add.text(SLATE_X + SLATE_W - 101, SLATE_Y + 16, "Character (wrapper class)", { font: "bold 9px Courier New", color: HEX_SILVER }).setOrigin(0.5).setDepth(12);

    this.add.text(SLATE_X + 14, SLATE_Y + 30, "char — single quotes, one character", { font: "italic 11px Georgia", color: HEX_SILVER }).setDepth(11);

    this.slateLines = this.add.container(0, 0).setDepth(11);
    this._slateY = SLATE_Y + 52;
    this._slateYMax = SLATE_Y + SLATE_H - 96;

    this.add.text(SLATE_X + 14, SLATE_Y + SLATE_H - 78, "returns:", { font: "13px Georgia", color: "#8a6435" }).setDepth(11);
    this.resultText = this.add.text(SLATE_X + 70, SLATE_Y + SLATE_H - 78, "—", { font: "bold 15px Courier New", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(11);

    this.createSubsetDiagram();
  }

  createSubsetDiagram() {
    const cx = SLATE_X + SLATE_W / 2, cy = SLATE_Y + SLATE_H - 40;
    const g = this.add.graphics().setDepth(11).setAlpha(0.7);
    g.lineStyle(1.3, HEX_BLUE_LETTER ? C_BLUE_LETTER : C_CYAN, 0.8);
    g.strokeCircle(cx - 55, cy, 32);
    g.lineStyle(1.3, C_WHITE_BLUE, 1);
    g.strokeCircle(cx - 62, cy + 4, 14);
    g.lineStyle(1.3, HEX_GOLD ? C_GOLD : C_GOLD, 0.8);
    g.strokeCircle(cx + 45, cy, 22);
    this.add.text(cx - 55, cy - 46, "LETTERS", { font: "bold 9px Georgia", color: HEX_BLUE_LETTER }).setOrigin(0.5).setDepth(12).setAlpha(0.7);
    this.add.text(cx - 62, cy + 4, "UPPER", { font: "bold 8px Georgia", color: HEX_WHITE_BLUE }).setOrigin(0.5).setDepth(12);
    this.add.text(cx + 45, cy - 32, "DIGITS", { font: "bold 9px Georgia", color: HEX_GOLD }).setOrigin(0.5).setDepth(12).setAlpha(0.7);
    this._subsetDiagramGfx = g;
  }

  async chalkWriteLine(text, color) {
    const t = this.add.text(SLATE_X + 14, this._slateY, "", { font: "bold 14px Courier New", color: color || "#e8eaf6" }).setDepth(11);
    this.slateLines.add(t);
    for (let i = 0; i < text.length; i++) {
      if (!this._alive) return;
      t.setText(t.text + text[i]);
      if (t.width > SLATE_W - 28) t.setFontSize(10);
      await this.delay(14);
    }
    this._slateY += 22;
    if (this._slateY > this._slateYMax) this._slateY = SLATE_Y + 52;
  }

  chalkEvaluationArrow(value) {
    const t = this.add.text(SLATE_X + 14, this._slateY, `→ ${value}`, { font: "bold 14px Courier New", color: value === "true" ? HEX_GREEN_BRIGHT : HEX_GRAY }).setAlpha(0);
    this.slateLines.add(t);
    if (t.width > SLATE_W - 28) t.setFontSize(10);
    this.tweens.add({ targets: t, alpha: 1, duration: 140 });
    this._slateY += 22;
    if (this._slateY > this._slateYMax) this._slateY = SLATE_Y + 52;
  }

  wipeSlate() {
    this.slateLines.removeAll(true);
    this._slateY = SLATE_Y + 52;
  }

  updateResultRow(type) {
    if (type === null || type === undefined) { this.resultText.setText("—").setColor(HEX_GRAY); return; }
    if (type === "crash") { this.resultText.setText("✗ ERROR").setColor(HEX_RED); return; }
    if (type === "compile") { this.resultText.setText("✗ COMPILE").setColor(HEX_RED); return; }
    this.resultText.setText(type).setColor(HEX_CYAN);
  }

  // ══════════════════════════════════════════════════════════════
  // SOURCE DISPLAY & EXPRESSION MONITOR
  // ══════════════════════════════════════════════════════════════

  createSourceDisplay() {
    this.sourceContainer = this.add.container(0, 0).setDepth(15);
  }

  _syntaxTokenize(line) {
    const tokens = [];
    const re = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\bimport\b|\bint\b|\bdouble\b|\bboolean\b|\bchar\b|\bString\b|\bfor\b|\bif\b|\belse\b)|(\bCharacter\b|\bInteger\b)|(\.isDigit\b|\.isLetter\b|\.isUpperCase\b|\.charAt\b|\.length\b|\.parseInt\b)|(\bSystem\.out\b)|(\btrue\b|\bfalse\b)|(-?\d+\.\d+|-?\d+)|(&&|\+\+|==|>=|<=|!|[(){}\[\];.,=+<>])/g;
    let last = 0, m;
    const plain = (t) => t && tokens.push({ t, c: "#e0e0e0" });
    while ((m = re.exec(line))) {
      if (m.index > last) plain(line.slice(last, m.index));
      if (m[1]) tokens.push({ t: m[1], c: HEX_GOLD });
      else if (m[2]) tokens.push({ t: m[2], c: "#1565c0" });
      else if (m[3]) tokens.push({ t: m[3], c: HEX_SILVER });
      else if (m[4]) tokens.push({ t: m[4], c: HEX_WHITE_BLUE });
      else if (m[5]) tokens.push({ t: m[5], c: "#78909c" });
      else if (m[6]) tokens.push({ t: m[6], c: HEX_CYAN });
      else if (m[7]) tokens.push({ t: m[7], c: "#78909c" });
      else if (m[8]) tokens.push({ t: m[8], c: "#78909c" });
      last = m.index + m[0].length;
    }
    if (last < line.length) plain(line.slice(last));
    return tokens.length ? tokens : [{ t: line, c: "#e0e0e0" }];
  }

  updateSourceDisplay(lines) {
    this.sourceContainer.removeAll(true);
    if (!lines || !lines.length) return;
    const fontSize = lines.length > 2 ? 12 : 15;
    const lineH = fontSize + 8;
    const startY = 120 - ((lines.length - 1) * lineH) / 2;
    lines.forEach((line, i) => {
      const y = startY + i * lineH;
      const tokens = this._syntaxTokenize(line);
      const measured = tokens.map((tok) => { const tmp = this.add.text(0, 0, tok.t, { font: `bold ${fontSize}px Courier New` }); const w = tmp.width; tmp.destroy(); return w; });
      const totalW = measured.reduce((a, b) => a + b, 0);
      let x = 470 - totalW / 2;
      tokens.forEach((tok, ti) => {
        const t = this.add.text(x, y, tok.t, { font: `bold ${fontSize}px Courier New`, color: tok.c }).setOrigin(0, 0.5).setAlpha(0);
        this.sourceContainer.add(t);
        this.tweens.add({ targets: t, alpha: 1, duration: 150 });
        x += measured[ti];
      });
    });
  }

  createExpressionMonitor() {
    const g = this.add.graphics().setDepth(50);
    g.fillStyle(0x0a1428, 0.9);
    g.fillRoundedRect(230, 155, 480, 18, 4);
    this.exprMonitorText = this.add.text(470, 164, "", { font: "12px Courier New", color: HEX_GRAY }).setOrigin(0.5).setDepth(51);
  }

  updateExpressionMonitor(text) { this.exprMonitorText.setText(text); }

  // ══════════════════════════════════════════════════════════════
  // HUD
  // ══════════════════════════════════════════════════════════════

  createHUD() {
    const g = this.add.graphics().setDepth(49);
    g.fillStyle(0x0a1428, 0.93);
    g.fillRect(0, 0, W, 64);
    g.lineStyle(1, 0x0e1830, 1);
    g.lineBetween(0, 64, W, 64);

    this.add.text(20, 14, "THE CASE PRISM", { font: "bold 16px Georgia", color: "#b0bec5" }).setDepth(50);
    this.add.text(20, 32, "Accretion Phase — Character Methods: isUpperCase()", { font: "12px Arial", color: "#546e7a" }).setDepth(50);

    this.add.text(1060, 8, "SCORE", { font: "11px Arial", color: "#546e7a" }).setDepth(50);
    this.scoreText = this.add.text(1060, 20, "0", { font: "bold 19px Arial", color: "#ffffff" }).setDepth(50);
    this.comboText = this.add.text(1060, 42, "×1", { font: "bold 14px Arial", color: HEX_GOLD }).setDepth(50);

    this.lifeIcons = [];
    for (let i = 0; i < 5; i++) {
      const lg = this.add.graphics({ x: 1150 + i * 20, y: 24 }).setDepth(50);
      const pts = [];
      for (let a = 0; a < 6; a++) {
        const ang = (Math.PI / 3) * a;
        pts.push({ x: Math.cos(ang) * 7, y: Math.sin(ang) * 7 });
      }
      lg.fillStyle(C_SILVER, 0.85);
      lg.lineStyle(1, 0x8a6435, 1);
      lg.fillPoints(pts, true);
      lg.strokePoints(pts, true);
      this.lifeIcons.push(lg);
    }
  }

  // ══════════════════════════════════════════════════════════════
  // THE CASE PRISM (hero mechanic) — a dual-faceted (rhombus) crystal.
  // Uppercase letters refract UPWARD in brilliant white-blue; lowercase
  // letters refract DOWNWARD in deeper blue; non-letters pass straight
  // through with no refraction at all. Like every prior instrument,
  // the prism never changes the gem — it only classifies.
  // ══════════════════════════════════════════════════════════════

  createCasePrism() {
    const padG = this.add.graphics().setDepth(10);
    padG.fillStyle(0x1a0e28, 1);
    padG.lineStyle(2, C_SILVER, 1);
    padG.fillRoundedRect(PAD_X0, PAD_Y0, PAD_X1 - PAD_X0, PAD_Y1 - PAD_Y0, 6);
    padG.strokeRoundedRect(PAD_X0, PAD_Y0, PAD_X1 - PAD_X0, PAD_Y1 - PAD_Y0, 6);
    padG.lineStyle(1, 0x1e1232, 0.4);
    for (let i = -4; i <= 4; i++) padG.lineBetween(PAD_CX - 110 + i * 26, PAD_Y0 + 5, PAD_CX - 84 + i * 26, PAD_Y1 - 5);
    padG.lineStyle(1, C_SILVER, 0.6);
    const settingPts = [];
    for (let i = 0; i < 8; i++) {
      const a = (Math.PI / 4) * i + Math.PI / 8;
      settingPts.push({ x: PAD_CX + Math.cos(a) * 22, y: PAD_CY + Math.sin(a) * 22 });
    }
    padG.strokePoints(settingPts, true);

    this.gemLayer = this.add.container(0, 0).setDepth(20);

    this.prismContainer = this.add.container(PRISM_CX, PRISM_REST_Y).setDepth(25);
    const s = PRISM_SIZE;
    this._prismDiamondPts = [{ x: 0, y: -s }, { x: s * 0.62, y: 0 }, { x: 0, y: s }, { x: -s * 0.62, y: 0 }];
    const prismG = this.add.graphics();
    prismG.fillStyle(0x0a1428, 0.3);
    prismG.lineStyle(3, C_WHITE_BLUE, 1);
    prismG.fillPoints(this._prismDiamondPts, true);
    prismG.strokePoints(this._prismDiamondPts, true);
    prismG.lineStyle(1, C_WHITE_BLUE, 0.08);
    prismG.lineBetween(0, -s, 0, s);
    prismG.lineBetween(-s * 0.62, 0, s * 0.62, 0);
    this._prismInnerGlow = this.add.graphics();
    const mount = this.add.rectangle(0, s + 6, 14, 10, C_SILVER, 0.6);
    this.prismContainer.add([prismG, this._prismInnerGlow, mount]);

    this.verdictPanelG = this.add.graphics().setDepth(24);
    this.verdictPanelG.lineStyle(2, C_SILVER, 1);
    this.verdictPanelG.strokeRoundedRect(VERDICT_X, VERDICT_Y, VERDICT_W, VERDICT_H, 8);
    this.verdictText = this.add.text(VERDICT_X + VERDICT_W / 2, VERDICT_Y + 32, "", { font: "bold 23px Georgia", color: HEX_GRAY }).setOrigin(0.5).setDepth(25);
    this.verdictSubText = this.add.text(VERDICT_X + VERDICT_W / 2, VERDICT_Y + 62, "", { font: "bold 11px Georgia", color: HEX_GRAY, wordWrap: { width: VERDICT_W - 16 }, align: "center" }).setOrigin(0.5).setDepth(25);
    this.verdictArrowText = this.add.text(VERDICT_X + VERDICT_W / 2, VERDICT_Y + 90, "", { font: "bold 19px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(25);

    const bcG = this.add.graphics().setDepth(10);
    bcG.fillStyle(0x0a1428, 0.9);
    bcG.lineStyle(2, C_CYAN, 1);
    bcG.fillRoundedRect(CONT_X - CONT_W / 2, CONT_Y, CONT_W, CONT_H, 5);
    bcG.strokeRoundedRect(CONT_X - CONT_W / 2, CONT_Y, CONT_W, CONT_H, 5);
    this.add.text(CONT_X, CONT_Y - 9, "boolean", { font: "bold 10px Courier New", color: HEX_CYAN }).setOrigin(0.5).setDepth(11);
    this.boolContText = this.add.text(CONT_X, CONT_Y + CONT_H / 2, "—", { font: "bold 15px Courier New", color: HEX_GRAY }).setOrigin(0.5).setDepth(11);
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

  async materializeGem(ch) {
    this.clearPad();
    const family = this.getGemFamily(ch);
    const colors = this.getGemColor(family);
    const c = this.add.container(PAD_CX, PAD_CY).setAlpha(0).setScale(0.5).setDepth(21);
    const g = this.add.graphics();
    const pts = [];
    for (let i = 0; i < 8; i++) {
      const a = (Math.PI / 4) * i;
      pts.push({ x: Math.cos(a) * 18, y: Math.sin(a) * 18 });
    }
    g.fillStyle(colors.fill, 1);
    g.lineStyle(2, colors.stroke, 1);
    g.fillPoints(pts, true);
    g.strokePoints(pts, true);
    const displayCh = ch === " " ? "␣" : ch;
    const txt = this.add.text(0, 0, displayCh, { font: "bold 18px Courier New", color: "#0a1428" }).setOrigin(0.5);
    c.add([g, txt]);
    this.gemLayer.add(c);
    this._currentGem = { container: c, family, ch, g, colors, pts };
    this.tweens.add({ targets: c, alpha: 1, scale: 1, duration: 200, ease: "Back.easeOut" });
    for (let i = 0; i < 4; i++) {
      const spark = this.add.text(PAD_CX + Phaser.Math.Between(-16, 16), PAD_CY + Phaser.Math.Between(-16, 16), "✦", { font: "10px Arial", color: HEX_SILVER }).setOrigin(0.5).setDepth(22).setAlpha(0);
      this.tweens.add({ targets: spark, alpha: 1, duration: 90, yoyo: true, onComplete: () => spark.destroy() });
    }
    await this.delay(220);
    return this._currentGem;
  }

  async prismDescend() {
    await new Promise((res) => { this.tweens.add({ targets: this.prismContainer, y: PRISM_DOWN_Y, duration: 300, ease: "Sine.easeIn", onComplete: res }); });
    if (this._currentGem) this.tweens.add({ targets: this._currentGem.container, scale: 1.2, duration: 150 });
  }

  async lightBeamEnter() {
    const beam = this.add.rectangle(PAD_CX, PAD_CY - 130, 3, 4, C_WHITE_BLUE, 0.8).setDepth(23);
    await new Promise((res) => {
      this.tweens.add({ targets: beam, y: PAD_CY - PRISM_SIZE * 0.5, duration: 220, ease: "Sine.easeIn", onComplete: () => { beam.destroy(); res(); } });
    });
  }

  /** family: 'upper' → refract UP (white-blue); 'lower' → refract DOWN
   * (deep blue); 'digit'/'other' → pass straight through, unrefracted. */
  async refractByFamily(family) {
    const gem = this._currentGem;
    if (family === "upper" || family === "lower") {
      const up = family === "upper";
      const color = up ? C_WHITE_BLUE : C_DEEP_BLUE;
      this._prismInnerGlow.clear();
      this._prismInnerGlow.fillStyle(color, up ? 0.35 : 0.25);
      this._prismInnerGlow.fillPoints(this._prismDiamondPts, true);
      const rays = [];
      for (let i = -1; i <= 1; i++) {
        const ray = this.add.rectangle(PRISM_CX, PRISM_DOWN_Y, 60, 3, color, up ? 0.75 : 0.55).setDepth(24).setAngle((up ? -90 : 90) + i * 15).setOrigin(0, 0.5);
        rays.push(ray);
      }
      await new Promise((res) => {
        this.tweens.add({ targets: rays, scaleX: 1.4, alpha: 0, duration: 320, onComplete: () => { rays.forEach((r) => r.destroy()); res(); } });
      });
      if (gem) {
        gem.g.clear();
        gem.g.fillStyle(up ? 0xf5f7ff : 0x82d4ff, 1);
        gem.g.lineStyle(2, gem.colors.stroke, 1);
        gem.g.fillPoints(gem.pts, true);
        gem.g.strokePoints(gem.pts, true);
        if (up) this.screenShake(0.002, 100);
      }
    } else {
      const beam = this.add.rectangle(PRISM_CX, PRISM_DOWN_Y, 60, 3, C_WHITE_BLUE, 0.4).setDepth(24).setOrigin(0, 0.5);
      await new Promise((res) => {
        this.tweens.add({ targets: beam, scaleX: 1.3, alpha: 0, duration: 260, onComplete: () => { beam.destroy(); res(); } });
      });
    }
    await this.delay(80);
  }

  /** THREE-state verdict: TRUE (uppercase), FALSE-but-letter (lowercase,
   * shown in blue), FALSE-not-a-letter (digit/other, shown in gray). */
  async renderThreeVerdict(family) {
    this.verdictPanelG.clear();
    if (family === "upper") {
      this.verdictPanelG.fillStyle(C_WHITE_BLUE, 0.15);
      this.verdictPanelG.fillRoundedRect(VERDICT_X, VERDICT_Y, VERDICT_W, VERDICT_H, 8);
      this.verdictPanelG.lineStyle(2, C_WHITE_BLUE, 1);
      this.verdictPanelG.strokeRoundedRect(VERDICT_X, VERDICT_Y, VERDICT_W, VERDICT_H, 8);
      this.verdictText.setText("TRUE").setColor(HEX_WHITE_BLUE);
      this.verdictSubText.setText("✓ UPPERCASE LETTER").setColor(HEX_WHITE_BLUE);
      this.verdictArrowText.setText("↑").setColor(HEX_WHITE_BLUE);
    } else if (family === "lower") {
      this.verdictPanelG.lineStyle(2, C_DEEP_BLUE, 1);
      this.verdictPanelG.strokeRoundedRect(VERDICT_X, VERDICT_Y, VERDICT_W, VERDICT_H, 8);
      this.verdictText.setText("FALSE").setColor(HEX_DEEP_BLUE);
      this.verdictSubText.setText("✗ lowercase (but still a letter)").setColor(HEX_DEEP_BLUE);
      this.verdictArrowText.setText("↓").setColor(HEX_DEEP_BLUE);
    } else {
      this.verdictPanelG.lineStyle(2, C_SILVER, 1);
      this.verdictPanelG.strokeRoundedRect(VERDICT_X, VERDICT_Y, VERDICT_W, VERDICT_H, 8);
      this.verdictText.setText("FALSE").setColor(HEX_GRAY);
      this.verdictSubText.setText("✗ NOT A LETTER").setColor(HEX_GRAY);
      this.verdictArrowText.setText("").setColor(HEX_GRAY);
    }
    await this.delay(220);
  }

  async prismRise() {
    if (this._currentGem) this.tweens.add({ targets: this._currentGem.container, scale: 1, duration: 150 });
    this._prismInnerGlow.clear();
    await new Promise((res) => { this.tweens.add({ targets: this.prismContainer, y: PRISM_REST_Y, duration: 200, ease: "Sine.easeOut", onComplete: res }); });
  }

  async deliverBoolean(value, family) {
    if (family === "upper" && !this.firstUpperAnnotationShown) {
      this.firstUpperAnnotationShown = true;
      this.createAnnotation(PAD_CX, PAD_Y1 + 18, "isUpperCase is a SUB-TEST of isLetter — every uppercase letter is also a letter, but not every letter is uppercase", HEX_WHITE_BLUE);
    }
    this.boolContText.setText(String(value)).setColor(value ? HEX_WHITE_BLUE : HEX_GRAY);
    this.tweens.add({ targets: this.boolContText, scale: 1.15, duration: 90, yoyo: true });
    await this.delay(140);
  }

  clearPad() {
    if (this._currentGem) { this._currentGem.container.destroy(); this._currentGem = null; }
  }

  /** The full honest classification choreography — NO transformation:
   * the gem returned is identical to the gem that went in. `ch` alone
   * determines the family (and hence the refraction direction/color);
   * `isUpperResult` is the evaluator's own computed boolean, used only
   * for the delivered container value (it always agrees with
   * family === "upper" by construction). */
  async runPrismChoreography(ch, isUpperResult) {
    const family = this.getGemFamily(ch);
    await this.materializeGem(ch);
    await this.prismDescend();
    await this.lightBeamEnter();
    await this.refractByFamily(family);
    await this.renderThreeVerdict(family);
    await this.prismRise();
    await this.deliverBoolean(isUpperResult, family);
    return isUpperResult;
  }

  clearPrismArea() {
    this.clearPad();
    this.verdictPanelG.clear();
    this.verdictPanelG.lineStyle(2, C_SILVER, 1);
    this.verdictPanelG.strokeRoundedRect(VERDICT_X, VERDICT_Y, VERDICT_W, VERDICT_H, 8);
    this.verdictText.setText("").setColor(HEX_GRAY);
    this.verdictSubText.setText("");
    this.verdictArrowText.setText("");
    this.boolContText.setText("—").setColor(HEX_GRAY);
    if (this._prismInnerGlow) this._prismInnerGlow.clear();
    this.prismContainer.setY(PRISM_REST_Y);
  }

  showCompileErrorStamp() {
    const stamp = this.add.text(PAD_CX, 150, "COMPILE ERROR", { font: "bold 18px Arial", color: HEX_RED }).setOrigin(0.5).setDepth(30).setScale(1.3).setAngle(-6).setAlpha(0);
    this.roundElements.push(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 150 });
    this.screenShake(0.004, 120);
    this.time.delayedCall(850, () => { if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 200, onComplete: () => stamp.destroy() }); });
  }

  showRuntimeHaltStamp() {
    const stamp = this.add.text(PAD_CX, 150, "BUILD HALTED", { font: "bold 17px Arial", color: HEX_RED }).setOrigin(0.5).setDepth(30).setScale(1.2).setAngle(-4).setAlpha(0);
    this.roundElements.push(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 150 });
    this.screenShake(0.004, 120);
    this.time.delayedCall(850, () => { if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 200, onComplete: () => stamp.destroy() }); });
  }

  // ══════════════════════════════════════════════════════════════
  // BIT — CASE SPECIALIST VARIANT (jeweler's vest, monocle kept, dual-
  // gem earring, case reference card)
  // ══════════════════════════════════════════════════════════════

  createBit() {
    const c = this.add.container(1090, 520).setDepth(60);
    const g = this.add.graphics();
    g.lineStyle(2, 0x78909c, 1);
    g.lineBetween(0, -17, 0, -32);
    g.fillStyle(0x37474f, 1);
    g.fillRoundedRect(-20, -17, 40, 35, 10);
    const tip = this.add.circle(0, -32, 3, C_WHITE_BLUE);
    const eye = this.add.circle(0, 0, 8, C_CYAN);
    const pupil = this.add.circle(0, 0, 3, 0xffffff);
    const vest = this.add.graphics();
    vest.fillStyle(0x0e1830, 0.9);
    vest.lineStyle(1, C_SILVER, 0.8);
    vest.fillTriangle(-15, -12, 15, -12, 0, 14);
    vest.strokeTriangle(-15, -12, 15, -12, 0, 14);
    vest.fillStyle(C_SILVER, 0.5);
    vest.fillTriangle(-4, -8, 2, -8, -1, -4);

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

    // Dual-gem earring — white-blue over deep blue, the case hierarchy
    const earring = this.add.container(-11, -18);
    const earG = this.add.graphics();
    earG.lineStyle(0.8, C_SILVER, 0.7);
    earG.lineBetween(0, 0, 0, 6);
    earG.fillStyle(C_WHITE_BLUE, 0.9);
    earG.fillCircle(0, 3, 2);
    earG.fillStyle(C_DEEP_BLUE, 0.8);
    earG.fillCircle(0, 8, 1.6);
    earring.add(earG);

    const gloveL = this.add.circle(-16, 10, 4, 0xffffff, 0).setStrokeStyle(1, 0xe8eaf6, 0.7);
    // case reference card — "A → ↑" / "a → ↓"
    this.refCard = this.add.container(17, 6);
    const cardG = this.add.graphics();
    cardG.fillStyle(0x0a1428, 0.95);
    cardG.lineStyle(1, C_WHITE_BLUE, 0.9);
    cardG.fillRoundedRect(-9, -10, 18, 20, 2);
    cardG.strokeRoundedRect(-9, -10, 18, 20, 2);
    const cardTxt1 = this.add.text(0, -4, "A ↑", { font: "bold 8px Georgia", color: HEX_WHITE_BLUE }).setOrigin(0.5);
    const cardTxt2 = this.add.text(0, 4, "a ↓", { font: "bold 8px Georgia", color: HEX_DEEP_BLUE }).setOrigin(0.5);
    this.refCard.add([cardG, cardTxt1, cardTxt2]);

    c.add([g, vest, eye, pupil, monocle, earring, gloveL, this.refCard, tip]);
    this.tweens.add({ targets: tip, alpha: 0.3, duration: 900, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: c, y: "+=3", duration: 2000, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
    this.bit = c;
  }

  bitSay(text) {
    this.hideBubble();
    const inner = this.add.text(0, 0, text, { font: "15px Arial", color: "#e0e0e0", wordWrap: { width: 340 } });
    const bw = Math.min(inner.width, 340) + 30, bh = inner.height + 24;
    inner.setText("");
    const bx = Phaser.Math.Clamp(this.bit.x - bw - 30, 20, W - bw - 20);
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
    this.tweens.add({ targets: c, alpha: 1, scale: 1, duration: 160, ease: "Back.easeOut" });

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
    this.tweens.add({ targets: b, alpha: 0, scale: 0.8, duration: 130, onComplete: () => b.destroy() });
  }

  async showBitFeedback(message, maxMs = 2500) {
    await this.bitSay(message);
    if (!this._alive) return;
    await Promise.race([this.waitForClick(), this.delay(maxMs)]);
    this.hideBubble();
  }

  // ══════════════════════════════════════════════════════════════
  // TUTORIAL
  // ══════════════════════════════════════════════════════════════

  checkTutorial() {
    let done = false;
    try { done = localStorage.getItem(TUTORIAL_KEY) === "true"; } catch (_) {}
    if (done && !this._forceTutorial) this.time.delayedCall(300, () => this.startRound(0));
    else this.runTutorial();
  }

  async runTutorial() {
    const A = () => this._alive;
    await this.delay(500); if (!A()) return;
    await this.bitSay("The Case Prism, Specialist — the institute's THIRD and FINAL instrument. The Numeral Loupe classified digits. The Alphabet Lens classified letters. This prism goes DEEPER into the letter family: is this letter UPPERCASE or lowercase? A sub-classification — a test WITHIN a test.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(7000)]); if (!A()) return;
    this.hideBubble();

    this.updateSourceDisplay(["boolean b = Character.isUpperCase('A');"]);
    await this.runPrismChoreography("A", true);
    if (!A()) return;
    await this.bitSay("Uppercase A — the beam went UP. The prism confirmed: this gem is not just a letter, it's an UPPERCASE letter. isUpperCase returned true. And isLetter would ALSO return true — because every uppercase letter IS a letter. They're not exclusive; they're NESTED.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(7000)]); if (!A()) return;
    this.hideBubble();
    this.clearPrismArea();

    this.updateSourceDisplay(["boolean b = Character.isUpperCase('a');"]);
    await this.runPrismChoreography("a", false);
    if (!A()) return;
    await this.bitSay("Lowercase a — the beam went DOWN. isUpperCase returned FALSE. But this is NOT the same false as for digits — this gem IS a letter, just not an uppercase one. The prism saw a letter and classified its TIER. isLetter('a') would return true; isUpperCase('a') returns false. Letter, not upper.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(7000)]); if (!A()) return;
    this.hideBubble();
    this.clearPrismArea();

    this.updateSourceDisplay(["boolean b = Character.isUpperCase('7');"]);
    await this.runPrismChoreography("7", false);
    if (!A()) return;
    await this.bitSay("The digit '7' — no refraction at all. isUpperCase returned false, but for a DIFFERENT reason than lowercase 'a': '7' isn't even a LETTER. isUpperCase asks 'is this an uppercase letter?' — '7' fails at the LETTER part. Three shades of false: uppercase-no (but letter), letter-no (so certainly not uppercase), and neither.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(7500)]); if (!A()) return;
    this.hideBubble();
    this.clearPrismArea();

    this.updateSourceDisplay(["char ch = 'B';", "boolean upper = Character.isUpperCase(ch);", "boolean letter = Character.isLetter(ch);", 'System.out.println(upper + " " + letter);']);
    const vars0 = {}; this._printedLines = [];
    await this.runStatements(["char ch = 'B';", "boolean upper = Character.isUpperCase(ch);", "boolean letter = Character.isLetter(ch);", 'System.out.println(upper + " " + letter);'], vars0);
    if (!A()) return;
    await this.bitSay("BOTH true — isUpperCase AND isLetter agree on 'B'. This is the SUBSET relationship: uppercase is INSIDE letters. Every uppercase letter passes both tests. Compare with isDigit and isLetter, which were MUTUALLY EXCLUSIVE — never both true. isUpperCase and isLetter are NESTED — often both true.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(7500)]); if (!A()) return;
    this.hideBubble();
    this.clearPrismArea();
    this.wipeSlate();

    this.updateSourceDisplay(["boolean b = character.isUpperCase('X');"]);
    this.showCompileErrorStamp();
    await this.delay(300);
    await this.bitSay("Same rule, final time: Character with a capital C. The wrapper class pattern — Integer, Double, String, Character — all capitalized. The method lives on the class, static, one char in, one boolean out. The wing's three instruments share the same grammar.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(6500)]); if (!A()) return;
    this.hideBubble();

    this.clearPrismArea();
    this.wipeSlate();
    this.updateResultRow(null);
    this.updateSourceDisplay([]);
    this.updateExpressionMonitor("");

    try { localStorage.setItem(TUTORIAL_KEY, "true"); } catch (_) {}
    this.startRound(0);
  }

  // ══════════════════════════════════════════════════════════════
  // ROUND LIFECYCLE
  // ══════════════════════════════════════════════════════════════

  startRound(index) {
    this.currentRound = index;
    const config = ROUNDS[index];
    this.roundAttempts = 0;
    this.clearRound();
    this.wipeSlate();
    this.updateResultRow(null);
    this.clearPrismArea();
    this.roundStartTime = this.time.now;

    if (config.type === "predict" || config.type === "trace") this.setupPredict(config);
    else if (config.type === "command") this.setupCommand(config);
  }

  clearRound() {
    this.roundElements.forEach((e) => { if (e && e.destroy) e.destroy(); });
    this.roundElements = [];
    this.slotContents = {};
    this.slotDefs = {};
    this.cartridges.forEach((c) => c.container.destroy());
    this.cartridges = [];
  }

  showQuestionCard(promptText) {
    const c = this.add.container(470, 600).setDepth(40).setAlpha(0);
    const g = this.add.graphics();
    g.fillStyle(0x0a0d18, 0.95);
    g.fillRoundedRect(-260, -30, 520, 60, 10);
    g.lineStyle(1, C_SILVER, 0.5);
    g.strokeRoundedRect(-260, -30, 520, 60, 10);
    const badge = this.add.circle(-230, 0, 15, C_SILVER);
    const badgeT = this.add.text(-230, 0, String(this.currentRound + 1), { font: "bold 15px Arial", color: "#0a1208" }).setOrigin(0.5);
    const t = this.add.text(-205, 0, promptText, { font: "16px Arial", color: "#e8eaf6", wordWrap: { width: 440 } }).setOrigin(0, 0.5);
    c.add([g, badge, badgeT, t]);
    this.tweens.add({ targets: c, alpha: 1, duration: 250 });
    this.roundElements.push(c);
    return c;
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE A/B/C — PREDICT
  // ══════════════════════════════════════════════════════════════

  setupPredict(config) {
    const lines = config.source.split("\n");
    this.updateSourceDisplay(lines);
    this.updateExpressionMonitor(lines.join("  "));
    this.showQuestionCard(config.question);
    this.showOptionBubbles(config.options, config);
  }

  showOptionBubbles(options, config) {
    const shuffled = Phaser.Utils.Array.Shuffle(options.slice());
    const n = shuffled.length;
    const spacing = 280;
    const startX = 470 - ((n - 1) * spacing) / 2;
    shuffled.forEach((opt, i) => {
      const x = startX + i * spacing, y = 670;
      const c = this.add.container(x, y).setDepth(41);
      const g = this.add.graphics();
      const w = 260, h = 40;
      const draw = (stroke) => {
        g.clear();
        g.fillStyle(0x0a0d18, 1);
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
        g.lineStyle(2, stroke, 1);
        g.strokeRoundedRect(-w / 2, -h / 2, w, h, 10);
      };
      draw(C_SILVER);
      const label = opt.label || opt.value;
      const txt = this.add.text(0, 0, label, { font: "bold 13px Courier New", color: "#e8eaf6", wordWrap: { width: w - 20 }, align: "center" }).setOrigin(0.5);
      if (txt.height > h - 6) txt.setFontSize(9);
      c.add([g, txt]);
      c.setSize(w, h);
      c.setInteractive({ useHandCursor: true });
      c.on("pointerover", () => { if (!this.inputLocked) draw(C_GOLD); });
      c.on("pointerout", () => { if (!this.inputLocked) draw(C_SILVER); });
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
    const timeMs = Math.round(this.time.now - this.roundStartTime);
    const correct = opt.value === config.correct;
    this.logAttempt(config, correct, opt.value, opt.tag, timeMs);
    this.roundElements.forEach((e) => e.disableInteractive && e.disableInteractive());

    const g = bubbleContainer.list[0];
    g.clear();
    g.fillStyle(0x0a0d18, 1);
    g.fillRoundedRect(-130, -20, 260, 40, 10);
    g.lineStyle(2, correct ? C_GREEN_BRIGHT : C_RED, 1);
    g.strokeRoundedRect(-130, -20, 260, 40, 10);
    if (!correct) this.tweens.add({ targets: bubbleContainer, x: bubbleContainer.x + 5, duration: 35, yoyo: true, repeat: 4 });

    const vars = {};
    this._printedLines = [];
    await this.runStatements(config.source.split("\n"), vars);
    if (!this._alive) return;
    if (config.revealNote) this.createFloatingText(470, 155, config.revealNote, HEX_GRAY, "13px Arial", 3000);
    await this.delay(350);
    if (!this._alive) return;

    if (correct) {
      this.updateScore(this.scoreForAttempt(timeMs));
      this.updateCombo(true);
      if (this.roundAttempts === 1) this.correctFirstTry++;
      this.totalTime += timeMs;
      await this.delay(250);
      this.advanceRound();
    } else {
      this.loseLife();
      this.updateCombo(false);
      this.totalTime += timeMs;
      if (this.lives <= 0) { this.time.delayedCall(400, () => this.gameOver()); return; }
      await this.showBitFeedback(MISCONCEPTION_FEEDBACK[opt.tag] || "Not quite — trace the slate again.");
      if (!this._alive) return;
      this.advanceRound();
    }
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE D — GEMOLOGIST COMMAND
  // ══════════════════════════════════════════════════════════════

  setupCommand(config) {
    this.renderCommandSkeleton(config);
    this.updateExpressionMonitor(config.mission);
    this.showQuestionCard(config.mission);
    this.createCartridgeTray(config);
    this._commandFirstFail = true;
    this.inputLocked = false;
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

  renderCommandSkeleton(config) {
    this.sourceContainer.removeAll(true);
    this.slotDefs = {};
    const lines = config.source.split("\n");
    const fontSize = lines.length > 2 ? 12 : 14;
    const lineH = fontSize + 8;
    const startY = 120 - ((lines.length - 1) * lineH) / 2;
    lines.forEach((rawLine, i) => {
      const y = startY + i * lineH;
      const parts = rawLine.split(/<slot:(\w+)>/);
      const measured = [];
      let totalW = 0;
      parts.forEach((part, pi) => {
        if (pi % 2 === 0) {
          const tmp = this.add.text(0, 0, part, { font: `bold ${fontSize}px Courier New` });
          measured.push(tmp.width); totalW += tmp.width; tmp.destroy();
        } else { measured.push(150); totalW += 156; }
      });
      let x = 470 - totalW / 2;
      parts.forEach((part, pi) => {
        if (pi % 2 === 0) {
          if (part) {
            this._syntaxTokenize(part).forEach((tok) => {
              const t = this.add.text(x, y, tok.t, { font: `bold ${fontSize}px Courier New`, color: tok.c }).setOrigin(0, 0.5);
              this.sourceContainer.add(t);
              x += t.width;
            });
          }
        } else {
          const slotId = part;
          const w = 150, h = fontSize + 8;
          this.slotDefs[slotId] = { id: slotId, rect: { x, y: y - h / 2, w, h } };
          this._drawSlotPlaceholder(slotId, config);
          x += w + 6;
        }
      });
    });
  }

  _drawSlotPlaceholder(slotId, config) {
    const def = this.slotDefs[slotId];
    if (!def || !def.rect) return;
    if (def.dg) def.dg.destroy();
    if (def.hintLabel) { def.hintLabel.destroy(); def.hintLabel = null; }
    const { x, y, w, h } = def.rect;
    const dg = this.add.graphics().setDepth(16);
    const filled = (this.slotContents[slotId] || []).length > 0;
    const draw = (highlight) => {
      dg.clear();
      dg.fillStyle(0x0a0d18, 1);
      dg.fillRoundedRect(x, y, w, h, 4);
      if (filled) {
        dg.lineStyle(2, highlight ? 0xffab00 : 0x2a3654, 1);
        dg.strokeRoundedRect(x, y, w, h, 4);
      } else {
        dg.lineStyle(2, highlight ? 0xffab00 : C_SILVER, 0.6);
        this._dashedRectOutline(dg, x, y, w, h, 4, 3);
      }
    };
    draw(false);
    def.dg = dg;
    def.drawDash = draw;
    this.sourceContainer.add(dg);
    if (!filled) {
      const hintDef = (config || ROUNDS[this.currentRound]).slots.find((s) => s.id === slotId);
      const label = this.add.text(x + w / 2, y + h / 2, hintDef ? hintDef.hint : "", { font: "italic 11px Courier New", color: "#3d4450" }).setOrigin(0.5).setDepth(17);
      def.hintLabel = label;
      this.sourceContainer.add(label);
    }
  }

  createCartridgeTray(config) {
    const shuffled = Phaser.Utils.Array.Shuffle(config.cartridges.slice());
    let x = 60;
    const rowY = 640;
    shuffled.forEach((def) => {
      const style = { font: "bold 14px Courier New", color: HEX_CYAN };
      const label = def.label || def.code;
      const measure = this.add.text(0, 0, label, style);
      const w = measure.width + 18;
      measure.destroy();
      const home = { x: x + w / 2, y: rowY };
      x += w + 12;

      const c = this.add.container(home.x, home.y).setDepth(42);
      const bg = this.add.graphics();
      const draw = (stroke) => {
        bg.clear();
        bg.fillStyle(0x1a0e05, 1);
        bg.fillRoundedRect(-w / 2, -14, w, 28, 7);
        bg.lineStyle(2, stroke, 1);
        bg.strokeRoundedRect(-w / 2, -14, w, 28, 7);
      };
      draw(C_SILVER);
      const txt = this.add.text(0, 0, label, style).setOrigin(0.5);
      c.add([bg, txt]);
      c.setSize(w, 28);
      c.setData("w", w);
      c.setData("code", def.code);
      c.setData("tag", def.tag || null);
      c.setData("slotId", def.slotId || null);
      c.setData("home", home);
      c.setData("draw", draw);
      c.setData("placedIn", null);
      c.setInteractive({ useHandCursor: true, draggable: true });
      c.on("pointerover", () => { if (!this.inputLocked) draw(C_GOLD); });
      c.on("pointerout", () => { if (!this.inputLocked) draw(C_SILVER); });
      this.cartridges.push({ container: c, def, home });
      this.roundElements.push(c);
    });

    const btn = this.add.container(470, 600).setDepth(42);
    const bg = this.add.graphics();
    const bdraw = (enabled, hover) => {
      bg.clear();
      bg.fillStyle(enabled ? C_SILVER : 0x2a2f36, hover && enabled ? 1 : 0.95);
      bg.fillRoundedRect(-65, -22, 130, 44, 22);
    };
    bdraw(false, false);
    const bt = this.add.text(0, 0, "CLASSIFY", { font: "bold 14px Arial", color: "#0a1208" }).setOrigin(0.5);
    btn.add([bg, bt]);
    btn.setSize(130, 44);
    btn.on("pointerover", () => { if (this._arrangeReady) { bdraw(true, true); btn.setScale(1.03); } });
    btn.on("pointerout", () => { bdraw(this._arrangeReady, false); btn.setScale(1); });
    btn.on("pointerdown", () => { if (this._arrangeReady) this.onArrangePressed(config); });
    this.arrangeButton = { c: btn, draw: bdraw };
    this.roundElements.push(btn);
    this.disableArrangeButton();
    this.setupDragEvents();
  }

  enableArrangeButton() { this._arrangeReady = true; this.arrangeButton.draw(true, false); this.arrangeButton.c.setInteractive({ useHandCursor: true }); }
  disableArrangeButton() { this._arrangeReady = false; this.arrangeButton.draw(false, false); this.arrangeButton.c.disableInteractive(); }

  setupDragEvents() {
    if (this._dragEventsBound) return;
    this._dragEventsBound = true;
    this.input.on("dragstart", (pointer, obj) => {
      if (!this.cartridges.find((b) => b.container === obj) || this.inputLocked) return;
      obj.setDepth(90);
      this.tweens.add({ targets: obj, scale: 1.1, duration: 100 });
      const prevSlot = obj.getData("placedIn");
      if (prevSlot) {
        this.slotContents[prevSlot] = (this.slotContents[prevSlot] || []).filter((b) => b.container !== obj);
        obj.setData("placedIn", null);
        this._drawSlotPlaceholder(prevSlot);
        this.updateArrangeButtonState();
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

  _nearestOpenSlot(x, y, forObj) {
    let best = null, bestDist = 80;
    const wantSlotId = forObj ? forObj.getData("slotId") : null;
    for (const id in this.slotDefs) {
      const def = this.slotDefs[id];
      if (!def || !def.rect) continue;
      if (wantSlotId && id !== wantSlotId) continue;
      const placed = this.slotContents[id] || [];
      if (placed.length >= 1) continue;
      const cx = def.rect.x + def.rect.w / 2, cy = def.rect.y + def.rect.h / 2;
      const dist = Phaser.Math.Distance.Between(x, y, cx, cy);
      const within = x >= def.rect.x - 50 && x <= def.rect.x + def.rect.w + 50 && y >= def.rect.y - 35 && y <= def.rect.y + def.rect.h + 35;
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
      obj.x = Phaser.Math.Linear(obj.x, def.rect.x + def.rect.w / 2, 0.25);
      obj.y = Phaser.Math.Linear(obj.y, def.rect.y + def.rect.h / 2, 0.25);
    }
  }

  _finishCartridgeDrag(obj) {
    obj.setDepth(42);
    this.tweens.add({ targets: obj, scale: 1, duration: 100 });
    const key = this._nearestOpenSlot(obj.x, obj.y, obj);
    if (this._dragHoverSlotKey && this.slotDefs[this._dragHoverSlotKey]) this.slotDefs[this._dragHoverSlotKey].drawDash(false);
    this._dragHoverSlotKey = null;

    if (key) {
      if (!this.slotContents[key]) this.slotContents[key] = [];
      this.slotContents[key].push({ container: obj });
      obj.setData("placedIn", key);
      const def = this.slotDefs[key];
      this.tweens.add({ targets: obj, x: def.rect.x + def.rect.w / 2, y: def.rect.y + def.rect.h / 2, duration: 150, ease: "Cubic.easeOut" });
      this._drawSlotPlaceholder(key);
      this.updateArrangeButtonState();
    } else {
      const home = obj.getData("home");
      this.tweens.add({ targets: obj, x: home.x, y: home.y, duration: 250, ease: "Back.easeOut" });
    }
  }

  updateArrangeButtonState() {
    const allFilled = Object.keys(this.slotDefs).every((id) => (this.slotContents[id] || []).length > 0);
    if (allFilled) this.enableArrangeButton(); else this.disableArrangeButton();
  }

  /** Fills in the drag-placed cartridge code for each <slot:>, leaving
   * any "/* test value *\/" placeholder untouched — that is filled
   * per-test by _applyTestSubstitution below. */
  _substituteSkeleton(config) {
    return config.source.split("\n").map((line) => {
      const slotM = line.match(/<slot:(\w+)>/);
      if (slotM) {
        const code = this.slotContents[slotM[1]] && this.slotContents[slotM[1]][0] ? this.slotContents[slotM[1]][0].container.getData("code") : "";
        return line.replace(/<slot:\w+>/, code);
      }
      return line;
    });
  }

  /** Replaces "TYPE NAME = /* test value *\/;" declarations with the
   * test's own substitution value, per test — needed for Rounds 10-12,
   * which verify against MULTIPLE test cases rather than one fixed
   * scenario. */
  _applyTestSubstitution(lines, test) {
    if (!test.substitutions) return lines;
    return lines.map((line) => {
      const m = line.match(/^(int|double|String|char|boolean)\s+(\w+)\s*=\s*\/\*[^*]*\*\/;$/);
      if (!m) return line;
      const type = m[1], name = m[2];
      if (!(name in test.substitutions)) return line;
      return `${type} ${name} = ${test.substitutions[name]};`;
    });
  }

  _shouldShowPostMissionNote() { return true; }

  async onArrangePressed(config) {
    this.inputLocked = true;
    this.disableArrangeButton();
    this.roundAttempts++;
    const timeMs0 = this.time.now;

    const usedCodes = Object.keys(this.slotDefs).map((id) => this.slotContents[id][0].container.getData("code"));
    const usedTags = Object.keys(this.slotDefs).map((id) => this.slotContents[id][0].container.getData("tag"));

    const baseStatements = this._substituteSkeleton(config);
    let allPass = true;
    for (const test of config.tests) {
      if (!this._alive) return;
      this.wipeSlate();
      this.updateResultRow(null);
      this.clearPrismArea();

      const statements = this._applyTestSubstitution(baseStatements, test);
      const vars = {};
      this._printedLines = [];
      const runResult = await this.runStatements(statements, vars);
      if (!this._alive) return;

      let pass = runResult.ok;
      if (pass && test.expectedOutput !== undefined) {
        const output = this._printedLines.join("⏎");
        pass = output === test.expectedOutput;
      }
      this.createFloatingText(470, 155, pass ? "✓" : "✗", pass ? HEX_GREEN_BRIGHT : HEX_RED, "bold 23px Arial", 700);
      await this.delay(200);
      if (!pass) { allPass = false; break; }
    }

    const timeMs = Math.round(this.time.now - timeMs0);
    const failTag = usedTags.find((t) => t);
    this.logAttempt(config, allPass, usedCodes.join(" | "), allPass ? null : failTag, timeMs);

    if (allPass) {
      this.updateScore(this.scoreForAttempt(timeMs));
      this.updateCombo(true);
      if (this.roundAttempts === 1) this.correctFirstTry++;
      this.totalTime += timeMs;
      if (config.postMissionNote && this._shouldShowPostMissionNote(config)) await this.showBitFeedback(config.postMissionNote);
      if (!this._alive) return;
      await this.delay(300);
      this.advanceRound();
    } else {
      const exploratory = this._commandFirstFail;
      this._commandFirstFail = false;
      this.totalTime += timeMs;
      if (!exploratory) {
        this.loseLife();
        if (this.lives <= 0) { this.time.delayedCall(400, () => this.gameOver()); return; }
      }
      this.updateCombo(false);
      await this.showBitFeedback(MISCONCEPTION_FEEDBACK[failTag] || config.revealNote || "The prism shows exactly what your code produced — compare it against the mission and adjust.");
      if (!this._alive) return;
      this.inputLocked = false;
      this.clearPrismArea();
      this.wipeSlate();
      this.updateResultRow(null);
      this.slotContents = {};
      this.renderCommandSkeleton(config);
      this.cartridges.forEach((cart) => {
        cart.container.setData("placedIn", null);
        const home = cart.container.getData("home");
        this.tweens.add({ targets: cart.container, x: home.x, y: home.y, duration: 200 });
      });
      this.disableArrangeButton();
    }
  }

  // ══════════════════════════════════════════════════════════════
  // HONEST EVALUATOR — Character.isUpperCase (prism-driving, this
  // level's own subject) / Character.isDigit + Character.isLetter
  // (both silent, resolved but not staged — matching L83's precedent
  // of keeping non-subject methods silent), String.charAt/.length,
  // relational comparisons with char→code promotion, a unary `!`, a
  // three-branch if/else-if/.../else BLOCK chain (Rounds 9, 11), a
  // braceless single-statement if (Round 8), the for-loop, a bare
  // name++, and a genuinely GATED single-line braced if/else-if chain
  // (Round 12 — see l86_part1's header comment for why this must be a
  // true gate here, unlike L83's scoped independent-evaluation
  // shortcut for the identical surface syntax).
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
      this.updateResultRow("boolean");
      return { ok: true, value: result, type: "boolean" };
    }

    const isLetterMatch = t.match(/^Character\.isLetter\((.+)\)$/);
    if (isLetterMatch) {
      const argRes = await this.resolveExpr(isLetterMatch[1].trim(), vars);
      if (!argRes.ok) return argRes;
      if (argRes.type !== "char") { this.showCompileErrorStamp(); return { ok: false, crash: "compile" }; }
      const result = /[A-Za-z]/.test(argRes.value);
      this.updateResultRow("boolean");
      return { ok: true, value: result, type: "boolean" };
    }

    const isUpperCaseMatch = t.match(/^Character\.isUpperCase\((.+)\)$/);
    if (isUpperCaseMatch) {
      const argRes = await this.resolveExpr(isUpperCaseMatch[1].trim(), vars);
      if (!argRes.ok) return argRes;
      if (argRes.type !== "char") { this.showCompileErrorStamp(); return { ok: false, crash: "compile" }; }
      const result = /[A-Z]/.test(argRes.value);
      await this.runPrismChoreography(argRes.value, result);
      this.updateResultRow("boolean");
      return { ok: true, value: result, type: "boolean" };
    }

    const charAtMatch = t.match(/^(\w+)\.charAt\((.+)\)$/);
    if (charAtMatch) {
      const base = vars[charAtMatch[1]];
      if (!base || base.type !== "String") { this.showCompileErrorStamp(); return { ok: false, crash: "compile" }; }
      const idxRes = await this.resolveExpr(charAtMatch[2].trim(), vars);
      if (!idxRes.ok) return idxRes;
      const idx = Number(idxRes.value);
      if (idx < 0 || idx >= base.value.length) { this.showRuntimeHaltStamp(); return { ok: false, crash: "eval" }; }
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
    const declVar = line.match(/^(int|double|String|boolean|char)\s+(\w+)\s*=\s*(.*);$/);
    if (declVar) {
      const varType = declVar[1], name = declVar[2], rhs = declVar[3].trim();
      const r = await this.resolveExpr(rhs, vars);
      if (!r.ok) return r;
      if (varType !== r.type) { this.showCompileErrorStamp(); return { ok: false, crash: "compile" }; }
      vars[name] = { value: r.value, type: varType, kind: "scalar" };
      return { ok: true };
    }

    const incrMatch = line.match(/^(\w+)\+\+;$/);
    if (incrMatch) {
      const v = vars[incrMatch[1]];
      if (v) v.value = v.value + 1;
      return { ok: true };
    }

    const printMatch = line.match(/^System\.out\.println\((.*)\);$/);
    if (printMatch) {
      const r = await this.resolveExpr(printMatch[1].trim(), vars);
      if (!r.ok) return r;
      if (!this._printedLines) this._printedLines = [];
      this._printedLines.push(this._javaToString(r.value, r.type));
      return { ok: true };
    }

    return { ok: true };
  }

  /** Index-scans four statement shapes:
   *   for (int i = INIT; COND; i++) { ... }
   *   if (...) { ... } [else if (...) { ... }]* [else { ... }]   — an
   *     arbitrary-length BRACED block chain.
   *   if (COND) STMT;   [else if (COND) STMT;]* [else STMT;]   —
   *     braceless, single statement per branch, gated the same way
   *     (only Round 8 uses the length-1 case: no else at all).
   *   if (COND) { STMT; }  [else if (COND) { STMT; }]* [else { STMT; }]
   *     — single-line BRACED, gated (Round 12). This is a TRUE gate,
   *     unlike L83's identical-looking surface syntax, because
   *     isUpperCase and isLetter are NESTED rather than mutually
   *     exclusive (see l86_part1's header comment).
   * Everything else runs as a flat statement via execStatement. */
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
          const r = await this.runStatements(bodyLines, vars);
          if (!r.ok) return r;
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

      /** GATED single-line braced chain (Round 12) — only one branch
       * ever executes, unlike L83's scoped independent-evaluation
       * shortcut for this identical surface syntax. */
      const bracedInline = line.match(/^if\s*\((.+)\)\s*\{\s*(.+;)\s*\}$/);
      if (bracedInline) {
        const branches = [{ cond: bracedInline[1].trim(), stmt: bracedInline[2].trim() }];
        let j = i + 1;
        while (j < lines.length) {
          const t = lines[j].trim();
          const elseIfM = t.match(/^else if\s*\((.+)\)\s*\{\s*(.+;)\s*\}$/);
          if (elseIfM) {
            branches.push({ cond: elseIfM[1].trim(), stmt: elseIfM[2].trim() });
            j++;
            continue;
          }
          const elseM = t.match(/^else\s*\{\s*(.+;)\s*\}$/);
          if (elseM) {
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

  // ══════════════════════════════════════════════════════════════
  // SCORING, LIVES, COMBO
  // ══════════════════════════════════════════════════════════════

  getComboMultiplier() { if (this.combo >= 5) return 3; if (this.combo >= 3) return 2; return 1; }

  scoreForAttempt(timeMs) {
    let points = 100 * this.getComboMultiplier();
    if (timeMs < 6000) points += 25;
    return points;
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
    if (mult > 1) this.tweens.add({ targets: this.comboText, scale: 1.3, duration: 120, yoyo: true });
  }

  loseLife() {
    this.lives = Math.max(0, this.lives - 1);
    const icon = this.lifeIcons[this.lives];
    if (icon) this.tweens.add({ targets: icon, alpha: 0.12, duration: 320 });
    return this.lives <= 0;
  }

  logAttempt(config, correct, selectedAnswer, misconceptionTag, timeMs) {
    this.roundAttempts = (this.roundAttempts || 0) + 1;
    this.attemptLog.push({
      round: config.round, type: config.type, concept: config.concept,
      correct, selectedAnswer, misconceptionTag: misconceptionTag || null,
      timeMs, attemptNumber: this.roundAttempts,
    });
  }

  /**
   * Computes the 4 struggle-detection features from the first 3 rounds'
   * attempt history and asks the backend's Isolation Forest model whether
   * this looks like typical or struggling play. Wired into FusionEngine so
   * the existing 'fusionAction' subscription can react to it, exactly like
   * the emotion/fatigue signals. Never throws — a failed/unreachable
   * backend just means no behavioral signal for this level; face and
   * fatigue detection keep working on their own regardless.
   */
  async runBehavioralCheck() {
    const relevant = this.attemptLog.filter((a) => a.round <= 3);
    const attempts_count = relevant.length;
    const time_taken_seconds = relevant.reduce((sum, a) => sum + a.timeMs, 0) / 1000;
    const misconception_repeat_count = relevant.filter((a) => a.misconceptionTag !== null).length;
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
      console.warn("Level86Scene: /api/wellbeing/predict-struggle unreachable, skipping behavioral signal for this level:", e);
    }
  }

  advanceRound() {
    if (this.currentRound === 2) this.runBehavioralCheck();
    this.clearRound();
    const next = this.currentRound + 1;
    if (next >= ROUNDS.length) { this.levelComplete(); return; }
    this.time.delayedCall(700, () => { if (this._alive && !this.gameEnded) this.startRound(next); });
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
      this.clearPrismArea();
      this.wipeSlate();
      const motes = this.ambient;
      this.ambient = null;
      (motes || []).forEach((m) => this.tweens.add({ targets: m, alpha: 0, duration: 1200 }));
      this.tweens.add({ targets: this.prismContainer, y: PRISM_REST_Y - 60, alpha: 0.3, duration: 500 });

      const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
      this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });
      const title = this.add.text(640, 240, "PRISM MISALIGNED", { font: "bold 34px Georgia", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
      this.tweens.add({ targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut", onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }) });
      this.add.text(640, 310, `Score: ${this.score}`, { font: "21px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
      this.add.text(640, 350, `Rounds Completed: ${this.currentRound} / 12`, { font: "18px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);
      this._makeButton(525, 420, "REALIGN THE PRISM", 200, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
      this._makeButton(755, 420, "RETURN TO MENU", 200, 50, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.start("MenuScene"));
    })();
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearRound();
    this.hideBubble();

    try { GameManager.completeLevel(85, Math.round((this.correctFirstTry / 12) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("character_isUpperCase_schema"); } catch (_) {}
    try {
      localStorage.setItem("level86_results", JSON.stringify({
        level: 86, concept: "character_isUpperCase", phase: "accretion",
        score: this.score, accuracy: this.correctFirstTry / 12, avgTime: this.totalTime / 12,
        comboMax: this.maxCombo, stars: this._starRating(), livesRemaining: this.lives,
        attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.prismFinale().then(() => { if (this._alive) this.showScoreTally(); });
  }

  async prismFinale() {
    const demo = [["A", true], ["a", false], ["5", false]];
    for (const [ch] of demo) {
      this.clearPrismArea();
      const isUpper = /[A-Z]/.test(ch);
      await this.runPrismChoreography(ch, isUpper);
      this.createConfetti(PAD_CX, PAD_CY, 15);
      await this.delay(150);
    }
    if (this._upperChartLabel) this.tweens.add({ targets: [this._upperChartLabel, this._lowerChartLabel], alpha: 1, duration: 300 });
    if (this._caseSpecimens) {
      this._caseSpecimens.forEach((s, idx) => {
        this.time.delayedCall(idx * 40, () => { if (s.gg.active) this.tweens.add({ targets: s.gg, alpha: 0.5, duration: 200, yoyo: true }); });
      });
    }
    this.tweens.add({ targets: this.scaleBeam, angle: 0, duration: 300 });
    this.createConfetti(PAD_CX, PAD_CY, 40);
    await this.delay(700);
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
    panel.fillStyle(0x0a1428, 1);
    panel.fillRoundedRect(360, 150, 560, 420, 16);
    panel.lineStyle(2, C_SILVER, 1);
    panel.strokeRoundedRect(360, 150, 560, 420, 16);

    const title = this.add.text(640, 190, "PRISM ALIGNED", { font: "bold 34px Georgia", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(91).setScale(0);
    this.tweens.add({ targets: title, scale: 1, duration: 350, ease: "Back.easeOut" });

    const acc = Math.round((this.correctFirstTry / 12) * 100);
    const avgSec = (this.totalTime / 12 / 1000).toFixed(1);
    const lines = [`ACCURACY: ${acc}%`, `BEST COMBO: ×${this.getComboMultiplierFor(this.maxCombo)}`, `AVG TIME: ${avgSec}s`];
    lines.forEach((s, i) => {
      const t = this.add.text(500, 245 + i * 28, s, { font: "16px Arial", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 250, delay: 300 + i * 150 });
    });
    const totalText = this.add.text(500, 245 + 3 * 28, "TOTAL: 0", { font: "bold 24px Arial", color: HEX_GOLD }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: totalText, alpha: 1, duration: 250, delay: 750 });
    const counter = { v: 0 };
    this.tweens.add({ targets: counter, v: this.score, duration: 1000, delay: 750, onUpdate: () => totalText.setText(`TOTAL: ${Math.round(counter.v)}`) });

    const stars = this._starRating();
    for (let i = 0; i < 3; i++) {
      const earned = i < stars;
      const s = this.add.text(640 + (i - 1) * 60, 380, "★", { font: "40px Arial", color: earned ? HEX_GOLD : "#2a3040" }).setOrigin(0.5).setDepth(91).setScale(0);
      this.tweens.add({ targets: s, scale: 1, duration: 250, delay: 1350 + i * 200, ease: earned ? "Back.easeOut" : "Cubic.easeOut" });
    }

    const badge = this.add.container(640, 465).setDepth(91).setAlpha(0);
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillCircle(0, 0, 30);
    bg.lineStyle(3, C_WHITE_BLUE, 1);
    bg.strokeCircle(0, 0, 30);
    const diaPts = [{ x: 0, y: -10 }, { x: 7, y: 0 }, { x: 0, y: 10 }, { x: -7, y: 0 }];
    bg.fillStyle(C_WHITE_BLUE, 0.85);
    bg.fillPoints(diaPts.map((p) => ({ x: p.x, y: p.y - 2 })), true);
    bg.lineStyle(1, C_DEEP_BLUE, 0.8);
    bg.lineBetween(-6, -8, -10, -14);
    bg.lineBetween(6, -8, 10, -14);
    bg.lineBetween(-6, 6, -10, 12);
    bg.lineBetween(6, 6, 10, 12);
    badge.add([bg]);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 1950 });
    const badgeLbl = this.add.text(640, 505, "isUpperCase() SCHEMA ACQUIRED", { font: "bold 14px Georgia", color: HEX_WHITE_BLUE }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: badgeLbl, alpha: 1, duration: 300, delay: 2100 });

    this._makeButton(500, 545, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(770, 545, "NEXT: The Case Trials →", 300, 44, { fill: 0x00733a, stroke: C_GREEN_BRIGHT, textColor: "#ffffff" }, () => {
      this.scene.start("MenuScene");
    });
  }

  getComboMultiplierFor(combo) { if (combo >= 5) return 3; if (combo >= 3) return 2; return 1; }

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
