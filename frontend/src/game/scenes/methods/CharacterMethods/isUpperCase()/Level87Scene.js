/**
 * Level 87 — "The Case Trials" (Character Wing: Tuning Phase —
 * Character.isUpperCase())
 * ===========================================================================
 * Tunes the L86 isUpperCase() schema through rapid-fire fluency trials. A
 * crystal formation growing upward and inward from a pedestal, gradually
 * encasing the display gem, IS the timer — the 21st and final unique timer
 * lineage in the curriculum, distinct from L81/L84's damped/linear sweeps.
 * The reveal stage hosts THREE mini instruments — the L80 Numeral Loupe
 * (isDigit), L83 Prismatic Lens (isLetter), and L86 Case Prism
 * (isUpperCase) — the complete classification toolkit, each firing in
 * program order with the idle two dimming.
 *
 * Hand-verified all 15 rounds by direct tracing against real Java
 * semantics before writing any code. No spec data bugs found — every
 * worked trace (Round 10's technically-correct-but-logically-flawed
 * ordering, Round 12's independent (non-chained) double-if password
 * check, Round 14/15's bug hunts) checks out exactly as the spec
 * describes.
 *
 * New evaluator vocabulary beyond L86's cascade (all needed for this
 * level's own round data):
 *  - All THREE Character methods (isDigit, isLetter, isUpperCase) now
 *    each drive their OWN mini instrument — L86 kept isDigit/isLetter
 *    silent since isUpperCase was the sole subject there; this level's
 *    own spec calls for the complete triple rig, so all three stage.
 *  - A comma-separated multi-variable declaration on one line
 *    (`int up = 0, low = 0;`, Round 11) — ported forward from L85,
 *    unified into the same declaration handler as the single-variable
 *    case.
 *  - A bare reassignment generalized to any type (`hasUpper = true;`,
 *    Round 12, boolean-typed) — ported forward from L84/L85.
 *  - A genuinely GATED braceless if/else-if/else chain (Rounds 9, 10,
 *    11) — ported forward from L84/L85/L86's design (each branch a
 *    single inline statement, no braces, only one ever executes).
 *  - Round 12's back-to-back INDEPENDENT (non-chained) braceless ifs
 *    (`if (isUpperCase) hasUpper = true;` immediately followed by a
 *    SEPARATE `if (isDigit) hasDigit = true;`, not an else-if) — the
 *    gated-chain lookahead must correctly recognize that the second
 *    line does NOT continue the first chain (it starts with a bare
 *    `if`, not `else if`), leaving it for the next top-level
 *    statement dispatch. Confirmed by hand-trace before coding: both
 *    ifs must independently fire across different loop iterations.
 *  - The arbitrary-length BRACED if/else-if/…/else block chain
 *    (Round 15's bug-hunt fix) — ported forward unchanged from
 *    L83/L84/L85/L86.
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

// Classification ticket (trial content area)
const TICKET_X0 = 220, TICKET_X1 = 680, TICKET_Y0 = 100, TICKET_Y1 = 420;
const TICKET_CX = (TICKET_X0 + TICKET_X1) / 2;
// Crystal encasement (hero timer)
const GEM_CX = 820, GEM_CY = 265, PEDESTAL_Y = 320, R_BASE = 46, MAX_HEIGHT = 130, NUM_SHARDS = 9;
// Mini triple instruments (reveal stage)
const MINI_X0 = 930, MINI_X1 = 1240;
const LOUPE_X0 = 935, LOUPE_X1 = 1080, LENS_X0 = 1090, LENS_X1 = 1235;
const TOP_Y0 = 95, TOP_Y1 = 172;
const CASE_X0 = 985, CASE_X1 = 1185, BOT_Y0 = 180, BOT_Y1 = 305;
// Trial slate / container shelf
const SLATE_X = 930, SLATE_Y = 335, SLATE_W = 310, SLATE_H = 130;
const SHELF_X = 930, SHELF_Y = 480, SHELF_W = 310, SHELF_H = 100;

const TUTORIAL_KEY = "level87_tutorial_done";
const WAVE_TIME = { 1: 12000, 2: 10000, 3: 9000 };

// ══════════════════════════════════════════════════════════════
// ROUND CONFIGURATION
// ══════════════════════════════════════════════════════════════
const ROUNDS = [
  // ══ WAVE 1 — Rapid Classifications (12s) ══
  { round: 1, wave: 1, type: "predict",
    source: "boolean b = Character.isUpperCase('T');",
    question: "What is stored in b?", correct: "true",
    options: [
      { value: "true", tag: null },
      { value: "false", tag: "T_not_uppercase_belief" },
      { value: "error", tag: "isUpperCase_crashes_belief", label: "Error" },
      { value: "84", tag: "isUpperCase_returns_ascii_belief" },
    ],
    concept: "fluent_uppercase_true" },

  { round: 2, wave: 1, type: "predict",
    source: "boolean b = Character.isUpperCase('t');",
    question: "What is stored in b?", correct: "false",
    options: [
      { value: "false", tag: null },
      { value: "true", tag: "lowercase_is_uppercase_belief" },
      { value: "error", tag: "lowercase_crashes_belief", label: "Error" },
      { value: '"T"', tag: "isUpperCase_converts_belief", label: '"T" (converted)' },
    ],
    concept: "fluent_lowercase_false" },

  { round: 3, wave: 1, type: "predict",
    source: "boolean b = Character.isUpperCase('.');",
    question: "What is stored in b?", correct: "false",
    options: [
      { value: "false", tag: null },
      { value: "true", tag: "dot_is_uppercase_belief" },
      { value: "error", tag: "symbol_crashes_belief", label: "Error" },
      { value: "46", tag: "isUpperCase_returns_ascii_belief" },
    ],
    concept: "fluent_symbol_false" },

  { round: 4, wave: 1, type: "predict",
    source: 'String s = "rUn";\nSystem.out.println(Character.isUpperCase(s.charAt(1)));',
    question: "What prints?", correct: "true",
    options: [
      { value: "true", tag: null },
      { value: "false", tag: "charAt_wrong_index_belief" },
      { value: "U", tag: "isUpperCase_returns_char_belief" },
      { value: "error", tag: "charAt_crashes_belief", label: "Error" },
    ],
    revealNote: "s.charAt(1) → 'U' (index 1, the second character). isUpperCase('U') → true. The uppercase letter was hiding in the middle of the word.",
    concept: "fluent_charAt_uppercase" },

  { round: 5, wave: 1, type: "predict",
    source: "System.out.println(Character.isUpperCase('3'));",
    question: "What prints?", correct: "false",
    options: [
      { value: "false", tag: null },
      { value: "true", tag: "digit_is_uppercase_belief" },
      { value: "3", tag: "isUpperCase_returns_value_belief" },
      { value: "error", tag: "digit_crashes_belief", label: "Error" },
    ],
    concept: "fluent_digit_false" },

  // ══ WAVE 2 — The Subset Relationship (10s) ══
  { round: 6, wave: 2, type: "predict",
    source: 'char ch = \'R\';\nSystem.out.println(Character.isUpperCase(ch) + " " + Character.isLetter(ch));',
    question: "What prints?", correct: "true true",
    options: [
      { value: "true true", tag: null },
      { value: "true false", tag: "uppercase_isLetter_exclusive_belief" },
      { value: "false true", tag: "R_not_uppercase_belief" },
      { value: "false false", tag: "R_is_neither_belief" },
    ],
    revealNote: "BOTH true — the subset relationship. 'R' is uppercase AND a letter. isUpperCase ⊂ isLetter: every uppercase letter passes both tests.",
    concept: "fluent_subset_both_true" },

  { round: 7, wave: 2, type: "predict",
    source: 'char ch = \'r\';\nSystem.out.println(Character.isUpperCase(ch) + " " + Character.isLetter(ch));',
    question: "What prints?", correct: "false true",
    options: [
      { value: "false true", tag: null },
      { value: "true true", tag: "lowercase_is_uppercase_belief" },
      { value: "false false", tag: "lowercase_not_letter_belief" },
      { value: "true false", tag: "r_uppercase_not_letter_belief" },
    ],
    revealNote: "The asymmetry: 'r' is a letter but NOT uppercase. isLetter = true (broad family); isUpperCase = false (narrow sub-family). The subset boundary: lowercase letters are IN the letter circle but OUTSIDE the uppercase circle.",
    concept: "fluent_subset_asymmetry" },

  { round: 8, wave: 2, type: "predict",
    source: 'char ch = \'!\';\nSystem.out.println(Character.isUpperCase(ch) + " " + Character.isLetter(ch) + " " + Character.isDigit(ch));',
    question: "What prints?", correct: "false false false",
    options: [
      { value: "false false false", tag: null },
      { value: "true false false", tag: "excl_is_uppercase_belief" },
      { value: "false false true", tag: "excl_is_digit_belief" },
      { value: "false true false", tag: "excl_is_letter_belief" },
    ],
    revealNote: "ALL THREE false — '!' is in the fourth zone: neither uppercase, nor letter, nor digit. The complete classification toolkit reports comprehensively: three instruments, three negatives, one clear answer.",
    concept: "fluent_all_three_false" },

  { round: 9, wave: 2, type: "predict",
    source: 'char ch = \'J\';\nString label;\nif (Character.isUpperCase(ch)) label = "UPPER";\nelse if (Character.isLetter(ch)) label = "lower";\nelse label = "other";\nSystem.out.println(label);',
    question: "What prints?", correct: "UPPER",
    options: [
      { value: "UPPER", tag: null },
      { value: "lower", tag: "isLetter_catches_first_belief" },
      { value: "other", tag: "J_is_other_belief" },
      { value: "error", tag: "ordering_crashes_belief", label: "Error" },
    ],
    revealNote: "isUpperCase('J') → true → 'UPPER' prints. The NARROW test fired first and caught it. If isLetter had been first, 'J' would have matched there (it IS a letter) and printed 'lower' — wrong! Narrow before broad saves the classification.",
    concept: "fluent_ordering_correct" },

  { round: 10, wave: 2, type: "predict",
    source: 'char ch = \'j\';\nString label;\nif (Character.isLetter(ch)) label = "letter";\nelse if (Character.isUpperCase(ch)) label = "upper";\nelse label = "other";\nSystem.out.println(label);',
    question: "What prints?", correct: "letter",
    options: [
      { value: "letter", tag: null },
      { value: "upper", tag: "order_doesnt_matter_belief" },
      { value: "other", tag: "j_is_other_belief" },
      { value: "error", tag: "ordering_crashes_belief", label: "Error" },
    ],
    revealNote: "isLetter('j') → true → 'letter' prints. But this is the WRONG order: if ch were 'J' (uppercase), isLetter('J') would ALSO be true → 'letter' would print → the uppercase branch is UNREACHABLE. The broad test caught everything first. This code works for 'j' but FAILS to distinguish uppercase from lowercase. The ordering is flawed even though this specific test passes.",
    concept: "fluent_ordering_wrong" },

  // ══ WAVE 3 — Deep Traces & Bug Hunt ══
  { round: 11, wave: 3, type: "trace",
    source: 'String s = "HeLLo";\nint up = 0, low = 0;\nfor (int i = 0; i < s.length(); i++) {\n    char ch = s.charAt(i);\n    if (Character.isUpperCase(ch)) up++;\n    else if (Character.isLetter(ch)) low++;\n}\nSystem.out.println(up + " " + low);',
    question: "What prints?", correct: "3 2",
    options: [
      { value: "3 2", tag: null },
      { value: "5 0", tag: "isLetter_catches_all_belief" },
      { value: "2 3", tag: "counts_swapped_belief" },
      { value: "3 5", tag: "both_count_all_belief" },
    ],
    revealNote: "H(↑up=1) e(↓low=1) L(↑up=2) L(↑up=3) o(↓low=2). Three uppercase, two lowercase. The ordering worked: isUpperCase caught the capitals first; isLetter's else-if caught only the remaining lowercase.",
    concept: "trace_case_counter" },

  { round: 12, wave: 3, type: "trace",
    source: 'String pw = "Pass1";\nboolean hasUpper = false;\nboolean hasDigit = false;\nfor (int i = 0; i < pw.length(); i++) {\n    char ch = pw.charAt(i);\n    if (Character.isUpperCase(ch)) hasUpper = true;\n    if (Character.isDigit(ch)) hasDigit = true;\n}\nSystem.out.println(hasUpper + " " + hasDigit);',
    question: "What prints?", correct: "true true",
    options: [
      { value: "true true", tag: null },
      { value: "true false", tag: "digit_not_detected_belief" },
      { value: "false true", tag: "uppercase_not_detected_belief" },
      { value: "false false", tag: "neither_detected_belief" },
    ],
    revealNote: "Password validation: 'P' sets hasUpper=true; '1' sets hasDigit=true. Two independent if-checks (not if/else-if — both can fire on different iterations). This is a real password-strength check pattern.",
    concept: "trace_password_validation" },

  { round: 13, wave: 3, type: "trace",
    source: "char ch = 'g';\nboolean a = Character.isUpperCase(ch);\nboolean b = Character.isLetter(ch);\nboolean c = Character.isDigit(ch);\nSystem.out.println(a + \" \" + b + \" \" + c);",
    question: "What prints?", correct: "false true false",
    options: [
      { value: "false true false", tag: null },
      { value: "true true false", tag: "lowercase_is_uppercase_belief" },
      { value: "false false false", tag: "g_is_nothing_belief" },
      { value: "false true true", tag: "letter_is_digit_belief" },
    ],
    revealNote: "The complete profile: 'g' is NOT uppercase (false), IS a letter (true), is NOT a digit (false). Three instruments, three verdicts, one complete classification. The full toolkit at work.",
    concept: "trace_complete_profile" },

  { round: 14, wave: 3, type: "bughunt",
    lines: ['String s = "Hello World";', "int upperCount = 0;", "for (int i = 0; i < s.length(); i++) {", "    if (Character.isLetter(s.charAt(i))) {", "        upperCount++;", "    }", "}", 'System.out.println("Uppercase: " + upperCount);', "// intent: count ONLY uppercase letters"],
    faultToken: "Character.isLetter(s.charAt(i))", faultLine: 4, tokenRegion: "wrong_method",
    fix: "Character.isUpperCase(s.charAt(i))",
    explanation: "isLetter catches ALL letters — both uppercase AND lowercase. 'Hello World' has 10 letters but only 2 uppercase (H, W). isLetter gives 10; isUpperCase gives 2. The broad test was used where the narrow test was needed.",
    wrongTag: "isLetter_not_isUpperCase",
    revealNote: "Dual-future reveal: the buggy run counts H✓ e✓ l✓ l✓ o✓ W✓ o✓ r✓ l✓ d✓ → 'Uppercase: 10' (wrong — counted ALL letters). The fixed run with isUpperCase: H✓ e✗ l✗ l✗ o✗ W✓ o✗ r✗ l✗ d✗ → 'Uppercase: 2' (correct).",
    concept: "wrong_method_bug" },

  { round: 15, wave: 3, type: "bughunt",
    lines: ["char ch = 'A';", "String label;", "if (Character.isLetter(ch)) {", '    label = "lower";', "} else if (Character.isUpperCase(ch)) {", '    label = "UPPER";', "} else {", '    label = "other";', "}", "System.out.println(label);", '// intent: print "UPPER" for uppercase letters'],
    faultToken: "if (Character.isLetter(ch))", faultLine: 3, tokenRegion: "order_reversed",
    fix: 'if (Character.isUpperCase(ch)) { label = "UPPER"; } else if (Character.isLetter(ch)) { label = "lower"; }',
    explanation: "The reversed order — isLetter comes FIRST and catches ALL letters (including uppercase 'A'). The isUpperCase branch is UNREACHABLE because any char that passes isUpperCase also passes isLetter, and isLetter is tested first. Fix: put isUpperCase (narrow) before isLetter (broad).",
    wrongTag: "order_reversed_belief",
    revealNote: "Dual-future reveal: the buggy run tests isLetter('A') → true → 'lower' prints (WRONG — 'A' is uppercase, but the broad test caught it first). The isUpperCase branch never fires. Reset; the fixed run tests isUpperCase('A') → true → 'UPPER' prints (correct).",
    concept: "order_reversed_bug" },
];

const MISCONCEPTION_FEEDBACK = {
  T_not_uppercase_belief: "'T' IS uppercase — one of the 26 capital letters A-Z.",
  isUpperCase_crashes_belief: "isUpperCase never crashes — it has a valid true/false answer for every char.",
  isUpperCase_returns_ascii_belief: "isUpperCase returns boolean, not the character's code. Only the classification matters.",
  lowercase_is_uppercase_belief: "Lowercase 't' is a letter but NOT uppercase — isUpperCase returns false.",
  lowercase_crashes_belief: "isUpperCase never crashes on a lowercase letter — it simply returns false.",
  isUpperCase_converts_belief: "isUpperCase CLASSIFIES — it doesn't convert. 't' stays 't'; the method reports false. Conversion (toUpperCase) is a different method.",
  dot_is_uppercase_belief: "A period is punctuation, not a letter at all — isUpperCase returns false.",
  symbol_crashes_belief: "isUpperCase never crashes on a symbol — it simply returns false.",
  charAt_wrong_index_belief: "s.charAt(1) counts from ZERO — index 1 is the SECOND character. Recount carefully.",
  isUpperCase_returns_char_belief: "isUpperCase returns boolean, not the char that was tested.",
  charAt_crashes_belief: "charAt on a valid in-range index never crashes.",
  digit_is_uppercase_belief: "Digits are not letters at all — isUpperCase returns false for the same reason isLetter returns false.",
  isUpperCase_returns_value_belief: "isUpperCase returns BOOLEAN — true or false — never the digit's value.",
  digit_crashes_belief: "isUpperCase never crashes on a digit — it simply returns false.",
  uppercase_isLetter_exclusive_belief: "isUpperCase and isLetter are NOT exclusive — they're NESTED. Every uppercase letter passes BOTH tests.",
  R_not_uppercase_belief: "'R' IS uppercase — isUpperCase('R') is true.",
  R_is_neither_belief: "'R' is both uppercase AND a letter — it fails neither test.",
  lowercase_not_letter_belief: "'r' IS a letter — isLetter('r') is true. It's just not uppercase.",
  r_uppercase_not_letter_belief: "'r' is NOT uppercase (isUpperCase is false) but IS a letter (isLetter is true) — you have the verdicts backwards.",
  excl_is_uppercase_belief: "'!' is a symbol, not a letter at all — isUpperCase('!') is false.",
  excl_is_digit_belief: "'!' is a symbol, not a digit — isDigit('!') is false.",
  excl_is_letter_belief: "'!' is a symbol, not a letter — isLetter('!') is false.",
  isLetter_catches_first_belief: "isLetter('J') IS true — 'J' is a letter. If isLetter is tested first, it matches, and 'lower' prints — wrong for an uppercase letter.",
  J_is_other_belief: "'J' is a letter (and an uppercase one) — it never reaches the final else branch.",
  ordering_crashes_belief: "An if/else-if/else chain never crashes — exactly one branch runs, chosen by the first true condition.",
  order_doesnt_matter_belief: "Order DOES matter in if/else-if chains. The first matching condition wins. Broad tests absorb narrow tests' candidates if placed first.",
  j_is_other_belief: "'j' is a letter — isLetter('j') is true, so the first branch matches and 'letter' prints; it never reaches 'other'.",
  isLetter_catches_all_belief: "That count includes ALL letters — uppercase AND lowercase. For uppercase only, use isUpperCase.",
  counts_swapped_belief: "H, L, L are uppercase (3); e, o are lowercase (2). The order is up first, low second — matching the if/else-if structure.",
  both_count_all_belief: "The else-if means low only counts characters that DIDN'T match the first if. It's exclusive branching, not independent counting.",
  digit_not_detected_belief: "'1' IS a digit — isDigit('1') is true, so hasDigit becomes true during the loop.",
  uppercase_not_detected_belief: "'P' IS uppercase — isUpperCase('P') is true, so hasUpper becomes true during the loop.",
  neither_detected_belief: "\"Pass1\" contains BOTH an uppercase letter ('P') and a digit ('1') — both flags end up true.",
  g_is_nothing_belief: "'g' IS a letter — isLetter('g') is true, even though isUpperCase and isDigit are both false.",
  letter_is_digit_belief: "Letters are never digits — isDigit('g') is false regardless of isLetter's result.",
  isLetter_not_isUpperCase: "isLetter catches ALL letters — H, e, l, l, o, W, o, r, l, d — all 10. isUpperCase catches only H and W — the 2 capitals. The broad instrument counted too many; the narrow instrument counted precisely.",
  order_reversed_belief: "Narrow before broad: isUpperCase FIRST, then isLetter. If isLetter comes first, it catches ALL letters (both cases), and the isUpperCase branch is UNREACHABLE — dead code. The broad test must wait for the narrow test to have first pick.",
  narrow_broad_order: "Narrow before broad: isUpperCase FIRST, then isLetter. If isLetter comes first, it catches ALL letters (both cases), and the isUpperCase branch is UNREACHABLE — dead code.",
  subset_confusion: "isUpperCase ⊂ isLetter — every uppercase letter is also a letter, but not every letter is uppercase. They're nested, not exclusive.",
  timeout: "The crystal sealed the gem! Pulse faster — case verdicts are reflexes now.",
};

export class Level87Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level87Scene" });
  }

  init() {
    this.currentRound = 0;
    this.currentWave = 1;
    this.score = 0;
    this.displayScore = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.lives = 5;
    this.correctFirstTry = 0;
    this.fastBonusCount = 0;
    this.totalTimePctUsed = 0;
    this.totalTimeMs = 0;
    this.attemptLog = [];
    this.roundElements = [];
    this.roundStartTime = 0;
    this.roundAttempts = 0;
    this.inputLocked = true;
    this.gameEnded = false;
    this._alive = true;
    this._crystalHalted = true;
  }

  preload() {}

  create() {
    this._alive = true;
    this.createParticleTexture();
    this.createBackground();
    this.createTrialsRoomDressing();
    this.createParticles();
    this.createClassificationTicket();
    this.createCrystalEncasement();
    this.createMiniLoupe();
    this.createMiniLens();
    this.createMiniCasePrism();
    this.createTrialSlate();
    this.createContainerShelf();
    this.createHUD();
    this.createBit();

    this.events.on("shutdown", () => { this._alive = false; this._killCrystalTween(); });
    this.checkTutorial();
  }

  update(time, delta) {
    this.updateParticles(time, delta);
    this.updateCrystalGrowth(time);
    this.updateCrystalUrgency(time);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // SETUP — CASE TRIALS ROOM DRESSING
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l87_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l87_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x081224).setDepth(0);
  }

  createTrialsRoomDressing() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x081224, 1);
    g.fillRect(0, 0, W, 216);
    g.lineStyle(1, 0x0e1830, 0.3);
    for (let x = 20; x < W; x += 26) g.lineBetween(x, 0, x, 216);

    // Grading bench with pinned classification tickets
    g.fillStyle(0x0a1428, 0.5);
    g.lineStyle(2, C_SILVER, 0.6);
    g.fillRect(200, 50, 580, 120);
    g.strokeRect(200, 50, 580, 120);
    for (let i = 0; i < 6; i++) {
      const cx = 230 + i * 92, cy = 80 + (i % 2) * 40;
      const cardG = this.add.graphics().setDepth(2).setAlpha(0.25);
      cardG.fillStyle(0x0e1830, 1);
      cardG.lineStyle(1, C_SILVER, 0.6);
      cardG.fillRoundedRect(cx, cy, 70, 30, 2);
      cardG.strokeRoundedRect(cx, cy, 70, 30, 2);
    }

    // Subset reference diagram (left wall) — UPPERCASE inside LETTERS
    const rg = this.add.graphics().setDepth(2).setAlpha(0.5);
    rg.lineStyle(1.3, HEX_BLUE_LETTER ? C_BLUE_LETTER : C_CYAN, 0.9);
    rg.strokeCircle(105, 175, 30);
    rg.lineStyle(1.3, C_WHITE_BLUE, 1);
    rg.strokeCircle(98, 180, 13);
    this.add.text(105, 138, "LETTERS", { font: "bold 9px Georgia", color: HEX_BLUE_LETTER }).setOrigin(0.5).setDepth(2).setAlpha(0.7);
    this.add.text(98, 180, "UPPER", { font: "bold 8px Georgia", color: HEX_WHITE_BLUE }).setOrigin(0.5).setDepth(2);

    // Ordering reference (right wall)
    const og = this.add.graphics().setDepth(2).setAlpha(0.45);
    og.lineStyle(1.5, C_SILVER, 0.6);
    og.strokeRoundedRect(1140, 90, 100, 70, 4);
    this.add.text(1190, 100, "if(isUpper)", { font: "bold 6.5px Courier New", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(3);
    this.add.text(1190, 112, "→ if(isLetter)", { font: "6.5px Courier New", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(3);
    this.add.text(1190, 122, "✓", { font: "bold 12px Arial", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(3);
    this.add.text(1190, 138, "if(isLetter)", { font: "bold 6.5px Courier New", color: HEX_RED }).setOrigin(0.5).setDepth(3);
    this.add.text(1190, 150, "→ if(isUpper)", { font: "6.5px Courier New", color: HEX_RED }).setOrigin(0.5).setDepth(3);
    this.add.text(1190, 152, "✗", { font: "bold 12px Arial", color: HEX_RED }).setOrigin(0.5).setDepth(3).setY(151);

    this.createTrialsBanner();
  }

  createTrialsBanner() {
    const g = this.add.graphics().setDepth(2);
    g.fillStyle(0x081224, 1);
    g.lineStyle(1, C_WHITE_BLUE, 0.5);
    g.fillRoundedRect(460, 12, 360, 26, 3);
    g.strokeRoundedRect(460, 12, 360, 26, 3);
    this.add.text(640, 25, "T H E   C A S E   T R I A L S", { font: "bold 14px Georgia", color: HEX_WHITE_BLUE }).setOrigin(0.5).setAlpha(0.7).setDepth(3);
  }

  createParticles() {
    this.ambient = [];
    const colors = [C_INDIGO, C_SILVER, C_WHITE_BLUE];
    for (let i = 0; i < 7; i++) {
      this.ambient.push(this.add.circle(Phaser.Math.Between(0, W), Phaser.Math.Between(150, 630), 1, Phaser.Utils.Array.GetRandom(colors), Phaser.Math.FloatBetween(0.02, 0.04)).setDepth(2));
    }
  }

  updateParticles(time, delta) {
    if (!this.ambient) return;
    const step = 0.006 * (delta / 16.7);
    this.ambient.forEach((p, i) => {
      p.y -= step * (i % 2 === 0 ? 1 : 0.6);
      p.x += Math.sin(time * 0.0003 + i) * 0.02;
      if (p.y < 150) p.y = 630; if (p.y > 630) p.y = 150;
      if (p.x > W) p.x = 0; if (p.x < 0) p.x = W;
    });
  }

  createAnnotation(x, y, text, colorHex) {
    const t = this.add.text(x, y, text, { font: "italic 12px Arial", color: colorHex, wordWrap: { width: 280 }, align: "center" }).setOrigin(0.5).setDepth(70).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 200 });
    this.time.delayedCall(2200, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() }); });
    return t;
  }

  createFloatingText(x, y, text, colorHex, font = "bold 15px Arial", hold = 1400) {
    const t = this.add.text(x, y, text, { font, color: colorHex, wordWrap: { width: 320 }, align: "center" }).setOrigin(0.5).setDepth(31).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 180 });
    this.time.delayedCall(hold, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() }); });
    return t;
  }

  createConfetti(x, y, count = 30) {
    const p = this.add.particles(x, y, "l87_dot", {
      speed: { min: 80, max: 240 }, angle: { min: 0, max: 360 }, scale: { start: 0.9, end: 0 }, lifespan: 500,
      tint: [C_WHITE_BLUE, C_DEEP_BLUE, C_GOLD, C_SILVER], emitting: false,
    }).setDepth(75);
    p.explode(count);
    this.time.delayedCall(900, () => p.destroy());
  }

  screenShake(intensity = 0.004, duration = 150) {
    this.cameras.main.shake(duration, intensity);
  }

  // ══════════════════════════════════════════════════════════════
  // THE CLASSIFICATION TICKET (trial content area)
  // ══════════════════════════════════════════════════════════════

  createClassificationTicket() {
    const g = this.add.graphics().setDepth(20);
    g.fillStyle(0x0e1830, 1);
    g.lineStyle(2, C_SILVER, 1);
    g.fillRoundedRect(TICKET_X0, TICKET_Y0, TICKET_X1 - TICKET_X0, TICKET_Y1 - TICKET_Y0, 4);
    g.strokeRoundedRect(TICKET_X0, TICKET_Y0, TICKET_X1 - TICKET_X0, TICKET_Y1 - TICKET_Y0, 4);
    g.fillStyle(C_SILVER, 0.08);
    g.fillRect(TICKET_X0, TICKET_Y0, TICKET_X1 - TICKET_X0, 24);
    g.lineStyle(1, C_SILVER, 0.1);
    for (let y = TICKET_Y0 + 48; y < TICKET_Y1 - 44; y += 20) g.lineBetween(TICKET_X0 + 16, y, TICKET_X1 - 16, y);

    this.ticketHeaderText = this.add.text(TICKET_CX, TICKET_Y0 + 12, "", { font: "bold 10px Georgia", color: HEX_SILVER }).setOrigin(0.5).setDepth(21);
    this.ticketRoundLabel = this.add.text(TICKET_X1 - 14, TICKET_Y0 + 12, "GEM 1/15", { font: "bold 11px Courier New", color: HEX_SILVER }).setOrigin(1, 0.5).setDepth(21);
    this.ticketContentContainer = this.add.container(0, 0).setDepth(21);
    this.ticketQuestionText = this.add.text(TICKET_CX, TICKET_Y1 - 26, "", { font: "bold 14px Georgia", color: "#e0e6f0", wordWrap: { width: TICKET_X1 - TICKET_X0 - 40 }, align: "center" }).setOrigin(0.5).setDepth(21);
    this.ticketStampLayer = this.add.container(TICKET_CX, (TICKET_Y0 + TICKET_Y1) / 2).setDepth(35);
  }

  clearTicketContent() {
    this.ticketContentContainer.removeAll(true);
    this.ticketQuestionText.setText("");
    this.ticketStampLayer.removeAll(true);
  }

  showTrialOnTicket(lines, questionText) {
    this.clearTicketContent();
    this.ticketHeaderText.setText(`CASE TRIAL — GEM ${this.currentRound + 1}`);
    const maxLen = Math.max(...lines.map((l) => l.length));
    const fontSize = maxLen > 40 ? 10 : maxLen > 28 ? 12 : 14;
    const lineH = fontSize + 10;
    const startY = TICKET_Y0 + 56 + Math.max(0, 4 - lines.length) * (lineH / 2);
    lines.forEach((line, i) => {
      const y = startY + i * lineH;
      if (line.trim().startsWith("//")) {
        const t = this.add.text(TICKET_CX, y, line, { font: `italic ${fontSize}px Courier New`, color: HEX_SILVER }).setOrigin(0.5).setAlpha(0);
        this.ticketContentContainer.add(t);
        this.tweens.add({ targets: t, alpha: 1, duration: 180 });
        return;
      }
      const tokens = this._codeTokenize(line);
      const measured = tokens.map((tk) => { const tmp = this.add.text(0, 0, tk.t, { font: `bold ${fontSize}px Courier New` }); const w = tmp.width; tmp.destroy(); return w; });
      const totalW = measured.reduce((a, b) => a + b, 0);
      let x = TICKET_CX - totalW / 2;
      tokens.forEach((tok, ti) => {
        const t = this.add.text(x, y, tok.t, { font: `bold ${fontSize}px Courier New`, color: tok.c }).setOrigin(0, 0.5).setAlpha(0);
        this.ticketContentContainer.add(t);
        this.tweens.add({ targets: t, alpha: 1, duration: 180 });
        x += measured[ti];
      });
    });
    if (questionText) this.ticketQuestionText.setText(questionText);
    this.ticketRoundLabel.setText(`GEM ${this.currentRound + 1}/15`);
  }

  _codeTokenize(line) {
    const tokens = [];
    const re = /("(?:[^"\\]|\\.)*")|('(?:[^'\\]|\\.)*')|(\bint\b|\bdouble\b|\bString\b|\bboolean\b|\bchar\b|\bif\b|\belse\b|\bfor\b)|(\bCharacter\b|\bInteger\b)|(\.isDigit\b|\.isLetter\b|\.isUpperCase\b|\.charAt\b|\.length\b|\.println\b)|(\bSystem\.out\b)|(-?\d+\.?\d*)|(&&|\+\+|==|>=|<=|!|[(){}\[\];.,=+*/<>-])/g;
    let last = 0, m;
    const plain = (t) => t && tokens.push({ t, c: "#e0e6f0" });
    while ((m = re.exec(line))) {
      if (m.index > last) plain(line.slice(last, m.index));
      if (m[1]) tokens.push({ t: m[1], c: "#8bc34a" });
      else if (m[2]) tokens.push({ t: m[2], c: "#ffd740" });
      else if (m[3]) tokens.push({ t: m[3], c: "#4fc3f7" });
      else if (m[4]) tokens.push({ t: m[4], c: HEX_SILVER });
      else if (m[5]) tokens.push({ t: m[5], c: "#42a5f5" });
      else if (m[6]) tokens.push({ t: m[6], c: HEX_GRAY });
      else if (m[7]) tokens.push({ t: m[7], c: "#4dd0c4" });
      else if (m[8]) tokens.push({ t: m[8], c: /[()]/.test(m[8]) ? "#e57373" : HEX_GRAY });
      last = m.index + m[0].length;
    }
    if (last < line.length) plain(line.slice(last));
    return tokens.length ? tokens : [{ t: line, c: "#e0e6f0" }];
  }

  async stampTicket(kind) {
    const labels = { certified: "CLASSIFIED", misjudged: "MISCLASSIFIED", void: "GEM ENCASED" };
    const colors = { certified: HEX_GREEN_BRIGHT, misjudged: HEX_RED, void: HEX_RED };
    const stamp = this.add.text(0, 0, labels[kind], { font: "bold 21px Georgia", color: colors[kind] }).setOrigin(0.5).setScale(1.4).setAngle(-8).setAlpha(0);
    this.ticketStampLayer.add(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 180 });
    const hold = kind === "void" ? 1800 : 700;
    await this.delay(hold);
    if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 200, onComplete: () => stamp.destroy() });
  }

  // ══════════════════════════════════════════════════════════════
  // THE CRYSTAL ENCASEMENT (THE TIMER — hero mechanic): crystal
  // shards grow radially inward from a ring around the display gem,
  // converging toward its center. Full encasement (shards meeting at
  // the gem) fires the timeout; answering freezes the growth with an
  // outward sonic pulse.
  // ══════════════════════════════════════════════════════════════

  _octPoints(r) {
    const pts = [];
    for (let i = 0; i < 8; i++) { const a = (Math.PI / 4) * i; pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r }); }
    return pts;
  }

  createCrystalEncasement() {
    const standG = this.add.graphics().setDepth(9);
    standG.fillStyle(C_SILVER, 0.3);
    standG.fillRect(GEM_CX - 25, PEDESTAL_Y, 50, 16);

    this.gemContainer = this.add.container(GEM_CX, GEM_CY).setDepth(12);
    const gemG = this.add.graphics();
    this._gemPts = this._octPoints(20);
    gemG.fillStyle(0x1565c0, 1);
    gemG.fillPoints(this._gemPts, true);
    gemG.fillStyle(0x4fc3f7, 0.3);
    gemG.fillPoints(this._gemPts.map((p) => ({ x: p.x * 0.55, y: p.y * 0.55 - 4 })), true);
    gemG.lineStyle(3, C_SILVER, 1);
    gemG.strokePoints(this._gemPts, true);
    this.gemContainer.add(gemG);
    this._gemGfx = gemG;

    this.shardsGfx = this.add.graphics().setDepth(13);
    this._shardData = [];
    for (let i = 0; i < NUM_SHARDS; i++) {
      const angle = ((2 * Math.PI) / NUM_SHARDS) * i + Phaser.Math.FloatBetween(-0.15, 0.15);
      this._shardData.push({ angle, heightJitter: Phaser.Math.FloatBetween(0.85, 1.1) });
    }

    this._crystalProgress = 0;
    this._crystalUrgency = "safe";
    this._crystalHalted = true;
    this._crystalStandstillDone = false;
  }

  updateCrystalGrowth(time) {
    if (!this.shardsGfx) return;
    this.shardsGfx.clear();
    if (this._crystalStandstillDone) return;
    const progress = this._crystalProgress || 0;
    const alpha = 0.15 + 0.25 * progress;
    const jittering = !this._crystalHalted && this._crystalUrgency === "critical";
    this._shardData.forEach((s) => {
      const bx = GEM_CX + Math.cos(s.angle) * R_BASE;
      const by = GEM_CY + Math.sin(s.angle) * R_BASE;
      const dx = GEM_CX - bx, dy = GEM_CY - by;
      const dist = Math.hypot(dx, dy);
      const dirX = dx / dist, dirY = dy / dist;
      const height = Math.min(progress * MAX_HEIGHT * s.heightJitter, dist - 4);
      const jx = jittering ? Phaser.Math.Between(-1, 1) : 0;
      const jy = jittering ? Phaser.Math.Between(-1, 1) : 0;
      const tipX = bx + dirX * height + jx, tipY = by + dirY * height + jy;
      const perpX = -dirY, perpY = dirX;
      const halfW = 5;
      const p1x = bx + perpX * halfW, p1y = by + perpY * halfW;
      const p2x = bx - perpX * halfW, p2y = by - perpY * halfW;
      this.shardsGfx.fillStyle(C_WHITE_BLUE, alpha);
      this.shardsGfx.fillTriangle(p1x, p1y, p2x, p2y, tipX, tipY);
      this.shardsGfx.lineStyle(1, C_WHITE_BLUE, Math.min(alpha + 0.15, 0.7));
      this.shardsGfx.lineBetween(p1x, p1y, tipX, tipY);
    });
    this.shardsGfx.setDepth(progress > 0.45 ? 14 : 11);
  }

  updateCrystalUrgency(time) {
    if (this._crystalProgress === undefined) return;
    const rem = 1 - this._crystalProgress;
    const state = rem <= 0.15 ? "critical" : rem <= 0.33 ? "warning" : "safe";
    this._crystalUrgency = state;
    if (!this._crystalHalted && !this._crystalStandstillDone && this.gemContainer) {
      if (state === "critical") { const flick = 0.6 + 0.4 * Math.abs(Math.sin(time * 0.01)); this.gemContainer.setAlpha(flick); }
      else this.gemContainer.setAlpha(1);
    }
  }

  startCrystalGrowth(timeLimitMs) {
    this._killCrystalTween();
    this.roundTimeLimit = timeLimitMs;
    this._crystalStartTime = this.time.now;
    this._crystalHalted = false;
    this._crystalStandstillDone = false;
    this._crystalUrgency = "safe";
    if (this.gemContainer) this.gemContainer.setAlpha(1);
    const state = { v: 0 };
    this._crystalProgress = 0;
    this._crystalTween = this.tweens.add({
      targets: state, v: 1, duration: timeLimitMs, ease: "Linear",
      onUpdate: () => { this._crystalProgress = state.v; },
      onComplete: () => { if (this._alive && !this._crystalHalted) this.onCrystalTimeout(this._currentConfig); },
    });
  }

  _killCrystalTween() {
    if (this._crystalTween) { this._crystalTween.stop(); this._crystalTween = null; }
  }

  /** Answer path: an outward sonic pulse ring, then the growth freezes. */
  async sonicPulse() {
    this._crystalHalted = true;
    this._killCrystalTween();
    const ring = this.add.circle(GEM_CX, GEM_CY, 4, 0x000000, 0).setStrokeStyle(2, C_DEEP_BLUE, 1).setDepth(15);
    await new Promise((res) => {
      this.tweens.add({ targets: ring, radius: 100, alpha: 0, duration: 200, onComplete: () => { ring.destroy(); res(); } });
    });
    await this.delay(90);
  }

  async relievedSparkle() {
    for (let i = 0; i < 4; i++) {
      const spark = this.add.circle(GEM_CX + Phaser.Math.Between(-14, 14), GEM_CY + Phaser.Math.Between(-14, 14), 1.5, 0xe8eaf6, 0.8).setDepth(13);
      this.tweens.add({ targets: spark, alpha: 0, duration: 260, onComplete: () => spark.destroy() });
    }
    await this.delay(80);
  }

  /** Timeout path: shards meet the gem — full encasement. */
  async fullEncasement() {
    this._crystalHalted = true;
    this._crystalStandstillDone = true;
    this._killCrystalTween();
    this._crystalProgress = 1;
    this.updateCrystalGrowth(this.time.now);
    this.screenShake(0.005, 180);
    const flash = this.add.circle(GEM_CX, GEM_CY, 8, 0xffffff, 0.9).setDepth(16);
    this.tweens.add({ targets: flash, scale: 6, alpha: 0, duration: 350, onComplete: () => flash.destroy() });
    this.tweens.add({ targets: this.gemContainer, alpha: 0.15, duration: 300 });
    await this.delay(400);
  }

  /** Light reset between rounds WITHIN the same wave (no fanfare). */
  resetGemForRound() {
    this._killCrystalTween();
    this._crystalHalted = true;
    this._crystalStandstillDone = false;
    this._crystalProgress = 0;
    if (this.gemContainer) this.gemContainer.setAlpha(1);
    this.updateCrystalGrowth(this.time.now);
  }

  /** Full shatter-and-regrow with fanfare — used on WAVE transitions. */
  async regenerateCrystal() {
    for (let i = 0; i < 10; i++) {
      const a = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const frag = this.add.triangle(GEM_CX, GEM_CY, 0, 0, 6, 0, 3, 10, C_WHITE_BLUE, 0.6).setDepth(17);
      this.tweens.add({ targets: frag, x: GEM_CX + Math.cos(a) * 80, y: GEM_CY + Math.sin(a) * 80, alpha: 0, duration: 350, onComplete: () => frag.destroy() });
    }
    this.screenShake(0.004, 150);
    await this.delay(350);
    this.resetGemForRound();
    await this.delay(150);
  }

  // ══════════════════════════════════════════════════════════════
  // THE MINI TRIPLE INSTRUMENTS (reveal apparatus) — the L80 Numeral
  // Loupe (isDigit), L83 Prismatic Lens (isLetter), and L86 Case
  // Prism (isUpperCase): the complete classification toolkit.
  // Whichever method(s) a round's calls actually invoke fire their
  // own instrument, in program order; the idle two dim while their
  // sibling runs.
  // ══════════════════════════════════════════════════════════════

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

  _displayChar(ch) {
    if (ch === " ") return "␣";
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

  createMiniLoupe() {
    const cx = (LOUPE_X0 + LOUPE_X1) / 2;
    this._miniLoupeFrame = this.add.graphics();
    this._miniLoupeFrame.lineStyle(1.2, C_SILVER, 0.5);
    this._miniLoupeFrame.strokeRoundedRect(LOUPE_X0, TOP_Y0, LOUPE_X1 - LOUPE_X0, TOP_Y1 - TOP_Y0, 4);
    this.add.text(cx, TOP_Y0 - 9, "LOUPE", { font: "bold 8px Georgia", color: HEX_SILVER }).setOrigin(0.5).setAlpha(0.5);

    this.loupeDynamicLayer = this.add.container(0, 0);
    this._miniLoupePadY = TOP_Y0 + 40;
    this._miniLoupeRestY = TOP_Y0 + 14;
    this._miniLoupeContainer = this.add.container(cx, this._miniLoupeRestY);
    const lg = this.add.graphics();
    lg.lineStyle(1.6, C_SILVER, 1);
    lg.fillStyle(0x0a1428, 0.5);
    lg.fillCircle(0, 0, 16);
    lg.strokeCircle(0, 0, 16);
    this._miniLoupeContainer.add(lg);

    this._loupeVerdictText = this.add.text(cx, TOP_Y1 - 8, "—", { font: "bold 10px Courier New", color: HEX_GRAY }).setOrigin(0.5);
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
    const pts = this._octPoints(9);
    gg.fillStyle(colors.fill, 1);
    gg.lineStyle(1.1, colors.stroke, 1);
    gg.fillPoints(pts, true);
    gg.strokePoints(pts, true);
    const txt = this.add.text(0, 0, displayCh, { font: "bold 10px Courier New", color: "#0a1428" }).setOrigin(0.5);
    if (txt.width > 15) txt.setFontSize(5.5);
    gem.add([gg, txt]);
    this.loupeDynamicLayer.add(gem);
    this.tweens.add({ targets: gem, alpha: 1, scale: 1, duration: 100 });
    await this.delay(80);

    await new Promise((res) => { this.tweens.add({ targets: this._miniLoupeContainer, y: this._miniLoupePadY - 4, duration: 120, onComplete: res }); });

    if (result) {
      gg.clear();
      gg.fillStyle(0xffe082, 1);
      gg.lineStyle(1.1, colors.stroke, 1);
      gg.fillPoints(pts, true);
      gg.strokePoints(pts, true);
      this._loupeVerdictText.setText("TRUE").setColor(HEX_GREEN_BRIGHT);
    } else {
      this._loupeVerdictText.setText("FALSE").setColor(HEX_GRAY);
    }
    await this.delay(110);

    await new Promise((res) => { this.tweens.add({ targets: this._miniLoupeContainer, y: this._miniLoupeRestY, duration: 100, onComplete: res }); });
    this.tweens.add({ targets: gem, alpha: 0, duration: 110, delay: 50, onComplete: () => gem.destroy() });
    await this.delay(80);
    await this._undimOthers("loupe");
    return result;
  }

  createMiniLens() {
    const cx = (LENS_X0 + LENS_X1) / 2;
    this._miniLensFrame = this.add.graphics();
    this._miniLensFrame.lineStyle(1.2, C_SILVER, 0.5);
    this._miniLensFrame.strokeRoundedRect(LENS_X0, TOP_Y0, LENS_X1 - LENS_X0, TOP_Y1 - TOP_Y0, 4);
    this.add.text(cx, TOP_Y0 - 9, "LENS", { font: "bold 8px Georgia", color: HEX_SILVER }).setOrigin(0.5).setAlpha(0.5);

    this.lensDynamicLayer = this.add.container(0, 0);
    this._miniLensPadY = TOP_Y0 + 40;
    this._miniLensRestY = TOP_Y0 + 14;
    const s = 11;
    this._lensTriPts = [{ x: 0, y: -s }, { x: s * 0.87, y: s * 0.5 }, { x: -s * 0.87, y: s * 0.5 }];
    this._miniLensContainer = this.add.container(cx, this._miniLensRestY);
    const pg = this.add.graphics();
    pg.fillStyle(0x0a1428, 0.35);
    pg.lineStyle(1.4, C_SILVER, 1);
    pg.fillPoints(this._lensTriPts, true);
    pg.strokePoints(this._lensTriPts, true);
    this._lensGlow = this.add.graphics();
    this._miniLensContainer.add([pg, this._lensGlow]);

    this._lensVerdictText = this.add.text(cx, TOP_Y1 - 8, "—", { font: "bold 10px Courier New", color: HEX_GRAY }).setOrigin(0.5);
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
    const pts = this._octPoints(9);
    gg.fillStyle(colors.fill, 1);
    gg.lineStyle(1.1, colors.stroke, 1);
    gg.fillPoints(pts, true);
    gg.strokePoints(pts, true);
    const txt = this.add.text(0, 0, this._displayChar(ch), { font: "bold 10px Courier New", color: "#0a1428" }).setOrigin(0.5);
    if (txt.width > 15) txt.setFontSize(5.5);
    gem.add([gg, txt]);
    this.lensDynamicLayer.add(gem);
    this.tweens.add({ targets: gem, alpha: 1, scale: 1, duration: 100 });
    await this.delay(80);

    await new Promise((res) => { this.tweens.add({ targets: this._miniLensContainer, y: this._miniLensPadY - 4, duration: 120, onComplete: res }); });
    await this.delay(50);

    if (result) {
      this._lensGlow.clear();
      this._lensGlow.fillStyle(C_BLUE_LETTER, 0.35);
      this._lensGlow.fillPoints(this._lensTriPts, true);
      gg.clear();
      gg.fillStyle(0x82d4ff, 1);
      gg.lineStyle(1.1, colors.stroke, 1);
      gg.fillPoints(pts, true);
      gg.strokePoints(pts, true);
      this._lensVerdictText.setText("TRUE").setColor(HEX_GREEN_BRIGHT);
    } else {
      this._lensVerdictText.setText("FALSE").setColor(HEX_GRAY);
    }
    await this.delay(110);

    this._lensGlow.clear();
    await new Promise((res) => { this.tweens.add({ targets: this._miniLensContainer, y: this._miniLensRestY, duration: 100, onComplete: res }); });
    this.tweens.add({ targets: gem, alpha: 0, duration: 110, delay: 50, onComplete: () => gem.destroy() });
    await this.delay(80);
    await this._undimOthers("lens");
    return result;
  }

  createMiniCasePrism() {
    const cx = (CASE_X0 + CASE_X1) / 2, midY = (BOT_Y0 + BOT_Y1) / 2;
    this._miniCaseFrame = this.add.graphics();
    this._miniCaseFrame.lineStyle(1.2, C_SILVER, 0.5);
    this._miniCaseFrame.strokeRoundedRect(CASE_X0, BOT_Y0, CASE_X1 - CASE_X0, BOT_Y1 - BOT_Y0, 4);
    this.add.text(cx, BOT_Y0 - 9, "CASE PRISM", { font: "bold 8px Georgia", color: HEX_SILVER }).setOrigin(0.5).setAlpha(0.5);

    this.caseDynamicLayer = this.add.container(0, 0);
    this._miniCaseGemY = midY + 34;
    this._miniCaseRestY = midY - 18;
    const s = 15;
    this._caseDiamondPts = [{ x: 0, y: -s }, { x: s * 0.62, y: 0 }, { x: 0, y: s }, { x: -s * 0.62, y: 0 }];
    this._miniCaseContainer = this.add.container(cx, this._miniCaseRestY);
    const pg = this.add.graphics();
    pg.fillStyle(0x0a1428, 0.3);
    pg.lineStyle(1.4, C_WHITE_BLUE, 1);
    pg.fillPoints(this._caseDiamondPts, true);
    pg.strokePoints(this._caseDiamondPts, true);
    this._caseGlow = this.add.graphics();
    this._miniCaseContainer.add([pg, this._caseGlow]);

    this._caseVerdictText = this.add.text(cx, BOT_Y1 - 10, "—", { font: "bold 10px Courier New", color: HEX_GRAY }).setOrigin(0.5);
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
    const pts = this._octPoints(9);
    gg.fillStyle(colors.fill, 1);
    gg.lineStyle(1.1, colors.stroke, 1);
    gg.fillPoints(pts, true);
    gg.strokePoints(pts, true);
    const txt = this.add.text(0, 0, this._displayChar(ch), { font: "bold 10px Courier New", color: "#0a1428" }).setOrigin(0.5);
    if (txt.width > 15) txt.setFontSize(5.5);
    gem.add([gg, txt]);
    this.caseDynamicLayer.add(gem);
    this.tweens.add({ targets: gem, alpha: 1, scale: 1, duration: 100 });
    await this.delay(80);

    if (family === "upper" || family === "lower") {
      const up = family === "upper";
      const color = up ? C_WHITE_BLUE : C_DEEP_BLUE;
      this._caseGlow.clear();
      this._caseGlow.fillStyle(color, up ? 0.35 : 0.25);
      this._caseGlow.fillPoints(this._caseDiamondPts, true);
      await new Promise((res) => { this.tweens.add({ targets: gem, y: this._miniCaseGemY - (up ? 16 : -6), duration: 120, onComplete: res }); });
      gg.clear();
      gg.fillStyle(up ? 0xf5f7ff : 0x82d4ff, 1);
      gg.lineStyle(1.1, colors.stroke, 1);
      gg.fillPoints(pts, true);
      gg.strokePoints(pts, true);
      this._caseVerdictText.setText(up ? "UPPER ↑" : "lower ↓").setColor(up ? HEX_WHITE_BLUE : HEX_DEEP_BLUE);
    } else {
      this._caseVerdictText.setText("other").setColor(HEX_GRAY);
    }
    await this.delay(120);

    this._caseGlow.clear();
    this.tweens.add({ targets: gem, alpha: 0, duration: 120, delay: 60, onComplete: () => gem.destroy() });
    await this.delay(90);
    await this._undimOthers("casePrism");
    return result;
  }

  clearMiniInstruments() {
    this.clearMiniLoupe();
    this.clearMiniLens();
    this.clearMiniCasePrism();
  }

  // ══════════════════════════════════════════════════════════════
  // TRIAL SLATE
  // ══════════════════════════════════════════════════════════════

  createTrialSlate() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0a0d18, 1);
    g.lineStyle(2, C_SILVER, 1);
    g.fillRoundedRect(SLATE_X, SLATE_Y, SLATE_W, SLATE_H, 8);
    g.strokeRoundedRect(SLATE_X, SLATE_Y, SLATE_W, SLATE_H, 8);
    this.add.text(SLATE_X + 10, SLATE_Y + 8, "TRIAL SLATE", { font: "bold 10px Georgia", color: HEX_SILVER }).setDepth(11);
    this.slateLines = this.add.container(0, 0).setDepth(11);
    this._slateY = SLATE_Y + 26;
    this.add.text(SLATE_X + 10, SLATE_Y + SLATE_H - 16, "returns:", { font: "11px Georgia", color: "#8a6435" }).setDepth(11);
    this.resultText = this.add.text(SLATE_X + 56, SLATE_Y + SLATE_H - 16, "—", { font: "bold 12px Courier New", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(11);
  }

  async chalkWriteLine(text, color) {
    const t = this.add.text(SLATE_X + 10, this._slateY, "", { font: "bold 11px Courier New", color: color || "#e8eaf6" }).setDepth(11);
    this.slateLines.add(t);
    for (let i = 0; i < text.length; i++) {
      if (!this._alive) return;
      t.setText(t.text + text[i]);
      if (t.width > SLATE_W - 18) t.setFontSize(7.5);
      await this.delay(5);
    }
    this._slateY += 15;
    if (this._slateY > SLATE_Y + SLATE_H - 30) this._slateY = SLATE_Y + 26;
  }

  wipeSlate() {
    this.slateLines.removeAll(true);
    this._slateY = SLATE_Y + 26;
  }

  updateResultRow(type) {
    if (type === null || type === undefined) { this.resultText.setText("—").setColor(HEX_GRAY); return; }
    if (type === "crash") { this.resultText.setText("✗ ERROR").setColor(HEX_RED); return; }
    if (type === "compile") { this.resultText.setText("✗ COMPILE").setColor(HEX_RED); return; }
    const color = type === "boolean" ? HEX_CYAN : type === "int" ? HEX_GOLD : type === "char" ? HEX_SILVER : "#e0e6f0";
    this.resultText.setText(type).setColor(color);
  }

  // ══════════════════════════════════════════════════════════════
  // CONTAINER SHELF — typed-variable readout (silver=char, cyan=
  // boolean, gold=int, cream=String)
  // ══════════════════════════════════════════════════════════════

  createContainerShelf() {
    const g = this.add.graphics().setDepth(10);
    g.fillStyle(0x0f0a06, 1);
    g.lineStyle(1, 0x2a3654, 1);
    g.fillRoundedRect(SHELF_X, SHELF_Y, SHELF_W, SHELF_H, 8);
    g.strokeRoundedRect(SHELF_X, SHELF_Y, SHELF_W, SHELF_H, 8);
    this.add.text(SHELF_X + 10, SHELF_Y + 6, "VARIABLES", { font: "bold 10px Georgia", color: HEX_SILVER }).setDepth(11);
    this.shelfContainer = this.add.container(0, 0).setDepth(11);
  }

  clearContainerShelf() { this.shelfContainer.removeAll(true); }

  updateContainerShelf(vars) {
    this.shelfContainer.removeAll(true);
    let idx = 0;
    for (const name in vars) {
      const v = vars[name];
      const y = SHELF_Y + 20 + idx * 13;
      let display;
      if (v.value === undefined) display = "(unset)";
      else if (v.type === "String") display = `"${v.value}"`;
      else if (v.type === "char") display = `'${this._displayChar(v.value)}'`;
      else display = String(v.value);
      const text = `${v.type} ${name}=${display}`.slice(0, 34);
      const color = v.type === "boolean" ? HEX_CYAN : v.type === "int" ? HEX_GOLD : v.type === "char" ? HEX_SILVER : "#e0e6f0";
      const t = this.add.text(SHELF_X + 10, y, text, { font: "bold 7.5px Courier New", color }).setOrigin(0, 0.5);
      this.shelfContainer.add(t);
      idx++;
      if (idx >= 5) break;
    }
  }

  // ══════════════════════════════════════════════════════════════
  // HUD
  // ══════════════════════════════════════════════════════════════

  createHUD() {
    const g = this.add.graphics().setDepth(49);
    g.fillStyle(0x081224, 0.93);
    g.fillRect(0, 0, W, 64);
    g.lineStyle(1, 0x0e1830, 1);
    g.lineBetween(0, 64, W, 64);

    this.add.text(20, 14, "THE CASE TRIALS", { font: "bold 16px Georgia", color: "#b0bec5" }).setDepth(50);
    this.add.text(20, 32, "Tuning Phase — Character Methods: isUpperCase()", { font: "12px Arial", color: "#546e7a" }).setDepth(50);

    this.waveText = this.add.text(640, 18, "WAVE 1 / 3", { font: "bold 16px Georgia", color: HEX_WHITE_BLUE }).setOrigin(0.5).setDepth(50);
    this._waveSquares = [];
    for (let i = 0; i < 5; i++) {
      const sq = this.add.rectangle(640 - 44 + i * 22, 42, 10, 10, 0x2a2f36).setDepth(50).setStrokeStyle(1, 0x546e7a);
      this._waveSquares.push(sq);
    }

    this.add.text(1060, 8, "SCORE", { font: "11px Arial", color: "#546e7a" }).setDepth(50);
    this.scoreText = this.add.text(1060, 20, "0", { font: "bold 19px Arial", color: "#ffffff" }).setDepth(50);
    this.comboText = this.add.text(1060, 42, "×1", { font: "bold 14px Arial", color: HEX_GOLD }).setDepth(50);

    this.lifeIcons = [];
    for (let i = 0; i < 5; i++) {
      const lg = this.add.graphics({ x: 1150 + i * 20, y: 24 }).setDepth(50);
      const pts = [];
      for (let a = 0; a < 6; a++) { const ang = (Math.PI / 3) * a; pts.push({ x: Math.cos(ang) * 7, y: Math.sin(ang) * 7 }); }
      lg.fillStyle(C_SILVER, 0.85);
      lg.lineStyle(1, 0x8a6435, 1);
      lg.fillPoints(pts, true);
      lg.strokePoints(pts, true);
      this.lifeIcons.push(lg);
    }
  }

  updateWaveIndicator(roundInWave, correct) {
    const sq = this._waveSquares[roundInWave];
    if (sq) sq.setFillStyle(correct ? C_GREEN_BRIGHT : C_RED);
  }

  resetWaveIndicator() { this._waveSquares.forEach((sq) => sq.setFillStyle(0x2a2f36)); }

  _roundInWave() {
    if (this.currentWave === 1) return this.currentRound;
    if (this.currentWave === 2) return this.currentRound - 5;
    return this.currentRound - 10;
  }

  // ══════════════════════════════════════════════════════════════
  // BIT — CASE INSPECTOR VARIANT (vest, monocle, dual-gem earring
  // kept; crystal-tipped inspection wand; case-grading checklist)
  // ══════════════════════════════════════════════════════════════

  createBit() {
    const c = this.add.container(90, 560).setDepth(60);
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

    // Dual-gem earring — kept from L86
    const earring = this.add.container(-11, -18);
    const earG = this.add.graphics();
    earG.lineStyle(0.8, C_SILVER, 0.7);
    earG.lineBetween(0, 0, 0, 6);
    earG.fillStyle(C_WHITE_BLUE, 0.9);
    earG.fillCircle(0, 3, 2);
    earG.fillStyle(C_DEEP_BLUE, 0.8);
    earG.fillCircle(0, 8, 1.6);
    earring.add(earG);

    // Crystal-tipped inspection wand
    const wand = this.add.container(17, 8);
    const wandG = this.add.graphics();
    wandG.lineStyle(1.3, C_SILVER, 0.9);
    wandG.lineBetween(-2, 9, 2, -6);
    wandG.fillStyle(C_WHITE_BLUE, 0.9);
    wandG.fillTriangle(2, -6, 5, -2, -1, -3);
    wandG.fillTriangle(2, -6, -1, -3, -2, -8);
    wand.add(wandG);

    const gloveL = this.add.circle(-16, 10, 4, 0xffffff, 0).setStrokeStyle(1, 0xe8eaf6, 0.7);
    // Case-grading checklist card
    this.checklistCard = this.add.container(17, -6);
    const cardG = this.add.graphics();
    cardG.fillStyle(0x0a1428, 0.95);
    cardG.lineStyle(1, C_SILVER, 0.9);
    cardG.fillRoundedRect(-10, -7, 20, 14, 2);
    cardG.strokeRoundedRect(-10, -7, 20, 14, 2);
    const cardTxt = this.add.text(0, 0, "□U □l □o", { font: "bold 4.5px Courier New", color: HEX_SILVER }).setOrigin(0.5);
    this.checklistCard.add([cardG, cardTxt]);

    c.add([g, vest, eye, pupil, monocle, earring, gloveL, wand, this.checklistCard, tip]);
    this.tweens.add({ targets: tip, alpha: 0.3, duration: 850, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: c, y: "+=3", duration: 1500, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
    this.bit = c;
  }

  bitSay(text) {
    this.hideBubble();
    const inner = this.add.text(0, 0, text, { font: "15px Arial", color: "#e0e0e0", wordWrap: { width: 340 } });
    const bw = Math.min(inner.width, 340) + 30, bh = inner.height + 24;
    inner.setText("");
    const bx = Phaser.Math.Clamp(this.bit.x + 40, 20, W - bw - 20);
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
        delay: 18, repeat: Math.max(0, text.length - 1),
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
    if (done) this.time.delayedCall(300, () => this.startWave(1));
    else this.runTutorial();
  }

  async runTutorial() {
    const A = () => this._alive;
    await this.delay(400); if (!A()) return;
    await this.bitSay("The Case Trials, Inspector — every classification timed against the crystal. It grows inward, encasing the gem. Pulse a verdict before the crystal seals. The final instrument is live — loupe, lens, and case prism, all three at once.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(5000)]); if (!A()) return;
    this.hideBubble();

    this.showTrialOnTicket(["boolean b = Character.isUpperCase('N');"], "What is stored in b?");
    this._currentConfig = { revealNote: null };
    this.startCrystalGrowth(7000);
    await this.runMiniCasePrism("N", true);
    if (!A()) return;
    const a1 = this.createAnnotation(TICKET_CX, TICKET_Y1 + 14, "the classification", HEX_BLUE_GRAY);
    const a2 = this.createAnnotation(GEM_CX, PEDESTAL_Y + 24, "your time, crystallizing", HEX_BLUE_GRAY);
    const a3 = this.createAnnotation((CASE_X0 + CASE_X1) / 2, BOT_Y0 - 24, "the verdict, honest", HEX_BLUE_GRAY);
    await this.bitSay("Pulse the gem with a verdict. The first trial is set!");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();
    [a1, a2, a3].forEach((a) => a.destroy());
    this._killCrystalTween();
    this.clearTicketContent();
    this.wipeSlate();
    this.clearMiniInstruments();
    this.clearContainerShelf();
    this.resetGemForRound();

    try { localStorage.setItem(TUTORIAL_KEY, "true"); } catch (_) {}
    this.startWave(1);
  }

  // ══════════════════════════════════════════════════════════════
  // WAVE SYSTEM
  // ══════════════════════════════════════════════════════════════

  async startWave(waveNumber) {
    this.currentWave = waveNumber;
    this.resetWaveIndicator();
    this.waveText.setText(`WAVE ${waveNumber} / 3`);
    const banners = {
      1: "WAVE 1 — RAPID CLASSIFICATIONS",
      2: "WAVE 2 — THE SUBSET RELATIONSHIP",
      3: "WAVE 3 — DEEP TRACES & BUG HUNT",
    };
    await this.showWaveBanner(banners[waveNumber]);
    if (!this._alive) return;
    if (waveNumber === 2) {
      await this.showBitFeedback("The subset at speed now, Inspector. isUpperCase lives INSIDE isLetter — they can both be true. Every trial this wave tests the nesting. The crystal won't slow for logic.");
    } else if (waveNumber === 3) {
      await this.showBitFeedback("Final encasements — traces through ordering puzzles and two programs where the wrong instrument or the wrong order slipped through. Narrow before broad — the last law.");
    }
    if (!this._alive) return;

    const startIndex = waveNumber === 1 ? 0 : waveNumber === 2 ? 5 : 10;
    this.startRound(startIndex);
  }

  async showWaveBanner(text) {
    const c = this.add.container(640, -60).setDepth(85);
    const g = this.add.graphics();
    g.fillStyle(0x081224, 0.95);
    g.fillRoundedRect(-230, -24, 460, 48, 8);
    g.lineStyle(2, C_WHITE_BLUE, 1);
    g.strokeRoundedRect(-230, -24, 460, 48, 8);
    const t = this.add.text(0, 0, text, { font: "bold 17px Georgia", color: HEX_WHITE_BLUE }).setOrigin(0.5);
    if (t.width > 420) t.setFontSize(12);
    c.add([g, t]);
    await new Promise((res) => {
      this.tweens.add({
        targets: c, y: 260, duration: 300, ease: "Back.easeOut",
        onComplete: () => this.time.delayedCall(700, () => {
          this.tweens.add({ targets: c, y: -60, alpha: 0, duration: 250, ease: "Cubic.easeIn", onComplete: () => { c.destroy(); res(); } });
        }),
      });
    });
  }

  // ══════════════════════════════════════════════════════════════
  // ROUND LIFECYCLE
  // ══════════════════════════════════════════════════════════════

  _sourceLines(config) {
    if (Array.isArray(config.source)) return config.source;
    return String(config.source || "").split("\n");
  }

  startRound(index) {
    this.currentRound = index;
    const config = ROUNDS[index];
    this._currentConfig = config;
    this.roundAttempts = 0;
    this.clearRound();
    this.wipeSlate();
    this.clearMiniInstruments();
    this.clearContainerShelf();
    this.updateResultRow(null);
    this.resetGemForRound();
    this.roundStartTime = this.time.now;

    const limit = config.type === "bughunt" ? 12000 : WAVE_TIME[config.wave];
    if (config.type === "predict" || config.type === "trace") this.setupPredict(config);
    else if (config.type === "bughunt") this.setupBugHunt(config);

    this.startCrystalGrowth(limit);
  }

  clearRound() {
    this.roundElements.forEach((e) => { if (e && e.destroy) e.destroy(); });
    this.roundElements = [];
    this._bugHuntTokenObjs = [];
    if (this._bugHeaderTween) { this._bugHeaderTween.stop(); this._bugHeaderTween = null; }
  }

  async onCrystalTimeout(config) {
    if (this.gameEnded) return;
    this._crystalHalted = true;
    this.inputLocked = true;
    this.roundElements.forEach((e) => e.disableInteractive && e.disableInteractive());
    (this._bugHuntTokenObjs || []).forEach((t) => t.disableInteractive());
    this.logAttempt(config, false, null, "timeout", this.roundTimeLimit, 1);
    await this.fullEncasement();
    if (!this._alive) return;
    await this.stampTicket("void");
    if (!this._alive) return;
    if (config.type === "bughunt") await this.runDualFutureReveal(config);
    else await this.runReveal(config);
    if (!this._alive) return;
    if (config.revealNote) this.createFloatingText(TICKET_CX, TICKET_Y1 + 40, config.revealNote, HEX_GRAY, "12px Arial", 2800);
    this.updateWaveIndicator(this._roundInWave(), false);
    this.loseLife();
    this.updateCombo(false);
    if (this.lives <= 0) { this.time.delayedCall(400, () => this.gameOver()); return; }
    await this.showBitFeedback(MISCONCEPTION_FEEDBACK.timeout);
    if (!this._alive) return;
    this.advanceRound();
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE A/B/C — PREDICT / TRACE
  // ══════════════════════════════════════════════════════════════

  setupPredict(config) {
    const lines = this._sourceLines(config);
    this.showTrialOnTicket(lines, config.question);
    this.showOptionBubbles(config.options, config);
  }

  showOptionBubbles(options, config) {
    const shuffled = Phaser.Utils.Array.Shuffle(options.slice());
    const positions = [[350, 568], [590, 568], [350, 624], [590, 624]];
    shuffled.forEach((opt, i) => {
      const [x, y] = positions[i];
      const c = this.add.container(x, y).setDepth(41);
      const g = this.add.graphics();
      const w = 220, h = 44;
      const draw = (stroke) => {
        g.clear();
        g.fillStyle(0x0a0d18, 1);
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
        g.lineStyle(2, stroke, 1);
        g.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);
      };
      draw(C_SILVER);
      const label = opt.label || opt.value;
      const txt = this.add.text(0, 0, label, { font: "bold 13px Courier New", color: "#e8eaf6", wordWrap: { width: w - 16 }, align: "center" }).setOrigin(0.5);
      if (txt.height > h - 8) txt.setFontSize(9);
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
    await this.sonicPulse();
    const timePctUsed = this.getTimePctUsed();
    const timeMs = Math.round(this.time.now - this.roundStartTime);
    const correct = opt.value === config.correct;
    this.logAttempt(config, correct, opt.value, opt.tag, timeMs, timePctUsed);
    this.roundElements.forEach((e) => e.disableInteractive && e.disableInteractive());

    const g = bubbleContainer.list[0];
    g.clear();
    g.fillStyle(0x0a0d18, 1);
    g.fillRoundedRect(-110, -22, 220, 44, 8);
    g.lineStyle(2, correct ? C_GREEN_BRIGHT : C_RED, 1);
    g.strokeRoundedRect(-110, -22, 220, 44, 8);
    if (!correct) this.tweens.add({ targets: bubbleContainer, x: bubbleContainer.x + 5, duration: 35, yoyo: true, repeat: 4 });

    if (correct) await this.relievedSparkle();
    await this.runReveal(config);
    if (!this._alive) return;
    await this.stampTicket(correct ? "certified" : "misjudged");
    if (!this._alive) return;
    if (config.revealNote) this.createFloatingText(TICKET_CX, TICKET_Y1 + 40, config.revealNote, HEX_GRAY, "12px Arial", 2800);
    await this.delay(300);
    if (!this._alive) return;

    this.updateWaveIndicator(this._roundInWave(), correct);
    if (correct) {
      this.updateScore(this.scoreForAttempt(timePctUsed));
      this.updateCombo(true);
      if (this.roundAttempts === 1) this.correctFirstTry++;
      await this.delay(250);
      this.advanceRound();
    } else {
      this.loseLife();
      this.updateCombo(false);
      if (this.lives <= 0) { this.time.delayedCall(400, () => this.gameOver()); return; }
      await this.showBitFeedback(MISCONCEPTION_FEEDBACK[opt.tag] || "Not quite — trace the slate again.");
      if (!this._alive) return;
      this.advanceRound();
    }
  }

  // ══════════════════════════════════════════════════════════════
  // TYPE D — BUG HUNT
  // ══════════════════════════════════════════════════════════════

  setupBugHunt(config) {
    this.clearTicketContent();
    this.ticketHeaderText.setText(`CASE TRIAL — GEM ${this.currentRound + 1}`);
    const header = this.add.text(TICKET_CX, TICKET_Y0 + 36, "CLICK THE BUG", { font: "bold 14px Georgia", color: "#c62828" }).setOrigin(0.5);
    this.ticketContentContainer.add(header);
    this._bugHeaderTween = this.tweens.add({ targets: header, alpha: 0.5, duration: 450, yoyo: true, repeat: -1 });

    this._bugHuntTokenObjs = [];
    const maxLen = Math.max(...config.lines.map((l) => l.length));
    const fontSize = maxLen > 36 ? 9 : 11;
    const startY = TICKET_Y0 + 62;
    const measure = (t, fs) => { const tmp = this.add.text(0, 0, t, { font: `bold ${fs}px Courier New` }); const w = tmp.width; tmp.destroy(); return w; };

    config.lines.forEach((line, li) => {
      const y = startY + li * (fontSize + 9);
      if (line.trim().startsWith("//")) {
        const t = this.add.text(TICKET_CX, y, line, { font: `italic ${fontSize}px Courier New`, color: HEX_SILVER }).setOrigin(0.5);
        this.ticketContentContainer.add(t);
        return;
      }
      const isFaultLine = li + 1 === config.faultLine;
      const isPhrase = isFaultLine && (config.faultToken.includes(" ") || config.faultToken.includes("("));

      if (isPhrase) {
        const idx = line.indexOf(config.faultToken);
        const pre = line.slice(0, idx), phrase = line.slice(idx, idx + config.faultToken.length), post = line.slice(idx + config.faultToken.length);
        const preTokens = pre ? this._codeTokenize(pre) : [];
        const postTokens = post ? this._codeTokenize(post) : [];
        const preW = preTokens.reduce((a, tk) => a + measure(tk.t, fontSize), 0);
        const phraseW = measure(phrase, fontSize);
        const postW = postTokens.reduce((a, tk) => a + measure(tk.t, fontSize), 0);
        let x = TICKET_CX - (preW + phraseW + postW) / 2;
        preTokens.forEach((tok) => { const w = measure(tok.t, fontSize); const t = this.add.text(x, y, tok.t, { font: `bold ${fontSize}px Courier New`, color: tok.c }).setOrigin(0, 0.5); this.ticketContentContainer.add(t); x += w; });
        const bugT = this.add.text(x, y, phrase, { font: `bold ${fontSize}px Courier New`, color: "#e0a35a" }).setOrigin(0, 0.5);
        bugT.setData("isBug", true);
        bugT.setData("line", li + 1);
        const hitW = Math.max(phraseW + 6, 30), hitH = Math.max(fontSize + 8, 30);
        bugT.setInteractive(new Phaser.Geom.Rectangle(0, -hitH / 2, hitW, hitH), Phaser.Geom.Rectangle.Contains);
        this.ticketContentContainer.add(bugT);
        bugT.on("pointerover", () => { if (!this.inputLocked) bugT.setColor(HEX_SILVER); });
        bugT.on("pointerout", () => { if (!this.inputLocked) bugT.setColor("#e0a35a"); });
        bugT.on("pointerdown", () => { if (this.inputLocked) return; this.inputLocked = true; this.onTokenClicked(bugT, config, y); });
        this._bugHuntTokenObjs.push(bugT);
        x += phraseW;
        postTokens.forEach((tok) => { const w = measure(tok.t, fontSize); const t = this.add.text(x, y, tok.t, { font: `bold ${fontSize}px Courier New`, color: tok.c }).setOrigin(0, 0.5); this.ticketContentContainer.add(t); x += w; });
        return;
      }

      const tokens = this._codeTokenize(line);
      const measured = tokens.map((tk) => measure(tk.t, fontSize));
      const totalW = measured.reduce((a, b) => a + b, 0);
      let x = TICKET_CX - totalW / 2;
      tokens.forEach((tok, ti) => {
        const w = measured[ti];
        const isBug = isFaultLine && tok.t === config.faultToken;
        const t = this.add.text(x + w / 2, y, tok.t, { font: `bold ${fontSize}px Courier New`, color: tok.c }).setOrigin(0.5);
        t.setData("isBug", isBug);
        t.setData("line", li + 1);
        const hitW = Math.max(w + 6, 30), hitH = Math.max(fontSize + 8, 30);
        t.setInteractive(new Phaser.Geom.Rectangle(-hitW / 2, -hitH / 2, hitW, hitH), Phaser.Geom.Rectangle.Contains);
        this.ticketContentContainer.add(t);
        t.on("pointerover", () => { if (!this.inputLocked) t.setColor(HEX_SILVER); });
        t.on("pointerout", () => { if (!this.inputLocked) t.setColor(tok.c); });
        t.on("pointerdown", () => { if (this.inputLocked) return; this.inputLocked = true; this.onTokenClicked(t, config, y); });
        this._bugHuntTokenObjs.push(t);
        x += w;
      });
    });
    this.inputLocked = false;
  }

  async onTokenClicked(tokenObj, config, lineY) {
    await this.sonicPulse();
    const timePctUsed = this.getTimePctUsed();
    const timeMs = Math.round(this.time.now - this.roundStartTime);
    const correct = tokenObj.getData("isBug");
    this.logAttempt(config, correct, `line ${tokenObj.getData("line")}`, correct ? null : config.wrongTag, timeMs, timePctUsed);
    this._bugHuntTokenObjs.forEach((t) => t.disableInteractive());

    if (correct) {
      tokenObj.setColor("#2e7d32");
      const leftX = tokenObj.originX === 0 ? tokenObj.x : tokenObj.x - tokenObj.width / 2;
      const rightX = leftX + tokenObj.width;
      const strike = this.add.graphics();
      strike.lineStyle(2, 0xc62828, 0.9);
      strike.lineBetween(leftX - 2, lineY, rightX + 2, lineY);
      this.ticketContentContainer.add(strike);
      if (config.fix) {
        const fixT = this.add.text(TICKET_CX, lineY - 14, config.fix, { font: "bold 12px Courier New", color: "#2e7d32", wordWrap: { width: 380 } }).setOrigin(0.5).setAlpha(0);
        this.ticketContentContainer.add(fixT);
        this.tweens.add({ targets: fixT, alpha: 1, duration: 220 });
      }
      await this.relievedSparkle();
    } else {
      tokenObj.setColor(HEX_RED);
      this.tweens.add({ targets: tokenObj, x: tokenObj.x + 4, duration: 30, yoyo: true, repeat: 4 });
      this._bugHuntTokenObjs.filter((t) => t.getData("isBug")).forEach((t) => {
        t.setColor(HEX_RED);
        this.tweens.add({ targets: t, alpha: 0.3, duration: 160, yoyo: true, repeat: 3 });
      });
    }

    await this.runDualFutureReveal(config);
    if (!this._alive) return;
    await this.stampTicket(correct ? "certified" : "misjudged");
    if (!this._alive) return;
    if (config.revealNote) this.createFloatingText(TICKET_CX, TICKET_Y1 + 40, config.revealNote, HEX_GRAY, "12px Arial", 2800);
    await this.delay(300);
    if (!this._alive) return;

    this.updateWaveIndicator(this._roundInWave(), correct);
    if (correct) {
      this.updateScore(this.scoreForAttempt(timePctUsed));
      this.updateCombo(true);
      if (this.roundAttempts === 1) this.correctFirstTry++;
      await this.delay(250);
      this.advanceRound();
    } else {
      this.loseLife();
      this.updateCombo(false);
      if (this.lives <= 0) { this.time.delayedCall(400, () => this.gameOver()); return; }
      await this.showBitFeedback(config.explanation || MISCONCEPTION_FEEDBACK[config.wrongTag] || "Not that one — look again.");
      if (!this._alive) return;
      this.advanceRound();
    }
  }

  /** Dual-future reveal for this level's two bug shapes. "wrong_method"
   * (R14): the buggy future OVER-counts because isLetter admits both
   * cases; the fixed future with isUpperCase counts precisely.
   * "order_reversed" (R15): the buggy future's broad-first ordering
   * mislabels an uppercase letter; the fixed future's narrow-first
   * ordering classifies it correctly. */
  async runDualFutureReveal(config) {
    if (config.tokenRegion === "wrong_method") {
      await this.chalkWriteLine("isLetter(ch) — true for BOTH cases", HEX_RED);
      await this.chalkWriteLine('"Hello World" → 10 letters pass', "#e8eaf6");
      await this.chalkWriteLine("prints: Uppercase: 10", HEX_RED);
      await this.delay(600);
      if (!this._alive) return;
      this.wipeSlate();
      this.clearMiniInstruments();
      this.clearContainerShelf();
      this.updateResultRow(null);
      await this.chalkWriteLine("isUpperCase(ch) — true for CAPITALS only", HEX_GREEN_BRIGHT);
      await this.chalkWriteLine('"Hello World" → 2 capitals pass', "#e8eaf6");
      await this.chalkWriteLine("prints: Uppercase: 2", HEX_GREEN_BRIGHT);
      return;
    }

    if (config.tokenRegion === "order_reversed") {
      await this.chalkWriteLine("isLetter('A') tested FIRST", HEX_RED);
      await this.chalkWriteLine("→ true → \"lower\" (WRONG)", "#e8eaf6");
      await this.chalkWriteLine("prints: lower", HEX_RED);
      await this.delay(600);
      if (!this._alive) return;
      this.wipeSlate();
      this.clearMiniInstruments();
      this.clearContainerShelf();
      this.updateResultRow(null);
      await this.chalkWriteLine("isUpperCase('A') tested FIRST", HEX_GREEN_BRIGHT);
      const result = await this.runMiniCasePrism("A", true);
      if (!this._alive) return;
      if (result) await this.chalkWriteLine("prints: UPPER", HEX_GREEN_BRIGHT);
      return;
    }

    await this.runReveal(config.lines.filter((l) => !l.trim().startsWith("//")));
  }

  // ══════════════════════════════════════════════════════════════
  // UNIFIED INTERPRETER — merges L86's isUpperCase cascade (now with
  // isDigit/isLetter ALSO driving their own mini instruments, since
  // this level's rig is the complete triple rig) with L85's comma-
  // separated multi-variable declaration and L84's generalized bare
  // reassignment, plus the gated braceless if/else-if/else chain and
  // the N-branch braced block chain (both ported forward unchanged).
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
      await this.runMiniLoupe(argRes.value, code, result);
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
      this.updateVariablesStripSafe(vars);
      return { ok: true };
    }

    const incrMatch = line.match(/^(\w+)\+\+;$/);
    if (incrMatch) {
      const v = vars[incrMatch[1]];
      if (v) v.value = v.value + 1;
      this.updateVariablesStripSafe(vars);
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
      this.updateVariablesStripSafe(vars);
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

  updateVariablesStripSafe(vars) {
    if (this.updateContainerShelf) this.updateContainerShelf(vars);
  }

  /** Index-scans:
   *   for (int i = INIT; COND; i++) { ... }
   *   if (...) { ... } [else if (...) { ... }]* [else { ... }]  — an
   *     arbitrary-length BRACED block chain.
   *   if (COND) STMT; [else if (COND) STMT;]* [else STMT;]  — braceless,
   *     GATED (only one branch runs). Critically, a bare `if` line that
   *     immediately follows (NOT `else if`) is left untouched for the
   *     next top-level dispatch — Round 12's back-to-back independent
   *     ifs rely on this: the lookahead only continues the chain on an
   *     actual `else if`/`else`, never a fresh `if`. */
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

      const r = await this.execStatement(line, vars);
      if (!r.ok) return r;
      i++;
    }
    return { ok: true };
  }

  async runReveal(input) {
    const raw = Array.isArray(input) ? input : input.source !== undefined ? input.source : input;
    const lines = Array.isArray(raw) ? raw : String(raw).split("\n");
    this._printedLines = [];
    const vars = {};
    return await this.runStatements(lines, vars);
  }

  showCompileErrorStamp() {
    const stamp = this.add.text(TICKET_CX, TICKET_Y0 - 22, "COMPILE ERROR", { font: "bold 18px Arial", color: HEX_RED }).setOrigin(0.5).setDepth(30).setScale(1.3).setAngle(-6).setAlpha(0);
    this.roundElements.push(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 150 });
    this.screenShake(0.004, 120);
    this.time.delayedCall(850, () => { if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 200, onComplete: () => stamp.destroy() }); });
  }

  showRuntimeHaltStamp() {
    const stamp = this.add.text(TICKET_CX, TICKET_Y0 - 22, "BUILD HALTED", { font: "bold 17px Arial", color: HEX_RED }).setOrigin(0.5).setDepth(30).setScale(1.2).setAngle(-4).setAlpha(0);
    this.roundElements.push(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 150 });
    this.screenShake(0.004, 120);
    this.time.delayedCall(850, () => { if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 200, onComplete: () => stamp.destroy() }); });
  }

  getTimePctUsed() {
    const elapsed = this.time.now - this.roundStartTime;
    return Phaser.Math.Clamp(elapsed / this.roundTimeLimit, 0, 1);
  }

  // ══════════════════════════════════════════════════════════════
  // SCORING, LIVES, COMBO
  // ══════════════════════════════════════════════════════════════

  getComboMultiplier() { if (this.combo >= 5) return 3; if (this.combo >= 3) return 2; return 1; }

  scoreForAttempt(timePctUsed) {
    let points = 100 * this.getComboMultiplier();
    const remaining = 1 - timePctUsed;
    if (remaining > 0.6) { points += 50; this.fastBonusCount++; this.createFloatingText(TICKET_CX, TICKET_Y0 - 14, "⚡ GEM FREE +50", HEX_GOLD, "bold 15px Arial", 900); }
    else if (remaining > 0.3) { points += 25; this.fastBonusCount++; this.createFloatingText(TICKET_CX, TICKET_Y0 - 14, "⚡ +25", HEX_GOLD, "bold 14px Arial", 800); }
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

  logAttempt(config, correct, selectedAnswer, misconceptionTag, timeMs, timePctUsed) {
    this.roundAttempts = (this.roundAttempts || 0) + 1;
    this.totalTimePctUsed += timePctUsed !== undefined ? timePctUsed : 1;
    this.totalTimeMs += timeMs || 0;
    this.attemptLog.push({
      round: config.round, wave: config.wave, type: config.type, concept: config.concept,
      correct, selectedAnswer, misconceptionTag: misconceptionTag || null,
      timeMs, timePctUsed: timePctUsed !== undefined ? timePctUsed : 1, attemptNumber: this.roundAttempts,
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
      const effectivePrediction = (prediction === "typical" && misconception_repeat_count === 3)
        ? "struggling" : prediction;
      GameManager.fusionEngine.checkBehavioral(effectivePrediction);
    } catch (e) {
      console.warn("Level87Scene: /api/wellbeing/predict-struggle unreachable, skipping behavioral signal for this level:", e);
    }
  }

  advanceRound() {
    if (this.currentRound === 2) this.runBehavioralCheck();
    this.clearRound();
    const next = this.currentRound + 1;
    if (next >= ROUNDS.length) { this.levelComplete(); return; }
    const nextConfig = ROUNDS[next];
    if (nextConfig.wave !== this.currentWave) {
      this.regenerateCrystal().then(() => { if (this._alive && !this.gameEnded) this.startWave(nextConfig.wave); });
      return;
    }
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
      this.wipeSlate();
      this.clearMiniInstruments();
      this.clearContainerShelf();
      this._crystalHalted = true;
      this._crystalStandstillDone = true;
      this.updateCrystalGrowth(this.time.now);
      const motes = this.ambient;
      this.ambient = null;
      (motes || []).forEach((m) => this.tweens.add({ targets: m, y: 632, alpha: 0, duration: 1500, ease: "Sine.easeIn" }));

      this.tweens.add({ targets: this.gemContainer, alpha: 0.1, duration: 500 });
      this.screenShake(0.006, 250);

      const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
      this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });
      const title = this.add.text(640, 240, "GEM ENCASED", { font: "bold 36px Georgia", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
      this.tweens.add({ targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut", onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }) });
      this.add.text(640, 310, `Score: ${this.score}`, { font: "21px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
      this.add.text(640, 350, `Trials Graded: ${this.currentRound} / 15`, { font: "18px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);
      this._makeButton(525, 420, "SHATTER THE CRYSTAL", 200, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
      this._makeButton(755, 420, "RETURN TO MENU", 200, 50, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.start("MenuScene"));
    })();
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearRound();
    this.hideBubble();

    try { GameManager.completeLevel(87, Math.round((this.correctFirstTry / 15) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("character_isUpperCase_tuned"); } catch (_) {}
    try {
      localStorage.setItem("level87_results", JSON.stringify({
        level: 87, concept: "character_isUpperCase", phase: "tuning",
        score: this.score, accuracy: this.correctFirstTry / 15, avgTimePct: this.totalTimePctUsed / 15,
        fastBonuses: this.fastBonusCount, comboMax: this.maxCombo, stars: this._starRating(),
        livesRemaining: this.lives, attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.trialsFinale().then(() => { if (this._alive) this.showScoreTally(); });
  }

  async trialsFinale() {
    this.resetGemForRound();
    // the crystal shatters outward completely
    for (let i = 0; i < 16; i++) {
      const a = (Math.PI * 2 * i) / 16;
      const frag = this.add.triangle(GEM_CX, GEM_CY, 0, 0, 6, 0, 3, 12, C_WHITE_BLUE, 0.7).setDepth(17);
      this.tweens.add({ targets: frag, x: GEM_CX + Math.cos(a) * 140, y: GEM_CY + Math.sin(a) * 140, alpha: 0, rotation: Phaser.Math.FloatBetween(-2, 2), duration: 600, ease: "Cubic.easeOut", onComplete: () => frag.destroy() });
    }
    this.screenShake(0.005, 250);
    await this.delay(300);

    // the freed gem blazes with the full classification spectrum
    this._gemGfx.clear();
    this._gemGfx.fillStyle(C_GOLD, 0.5);
    this._gemGfx.fillPoints(this._gemPts, true);
    this._gemGfx.fillStyle(C_BLUE_LETTER, 0.5);
    this._gemGfx.fillPoints(this._gemPts.map((p) => ({ x: p.x * 0.7, y: p.y * 0.7 })), true);
    this._gemGfx.fillStyle(C_WHITE_BLUE, 0.8);
    this._gemGfx.fillPoints(this._gemPts.map((p) => ({ x: p.x * 0.4, y: p.y * 0.4 })), true);
    this._gemGfx.lineStyle(3, C_WHITE_BLUE, 1);
    this._gemGfx.strokePoints(this._gemPts, true);
    for (let i = 0; i < 4; i++) {
      const ang = i * 90;
      const ray = this.add.rectangle(GEM_CX, GEM_CY, 3, 40, C_WHITE_BLUE, 0.6).setDepth(13).setAngle(ang);
      this.tweens.add({ targets: ray, alpha: 0, scaleY: 1.6, duration: 350, onComplete: () => ray.destroy() });
    }

    // all three instruments fire together in celebration
    await Promise.all([
      this.runMiniLoupe("7", 55, true),
      this.runMiniLens("K", true),
      this.runMiniCasePrism("K", true),
    ]);

    this.screenShake(0.003, 150);
    this.createConfetti(GEM_CX, GEM_CY, 45);
    await this.delay(700);
  }

  _starRating() {
    const acc = this.correctFirstTry / 15;
    const avgPct = this.totalTimePctUsed / 15;
    if (acc >= 0.9 && avgPct <= 0.55) return 3;
    if (acc >= 0.75) return 2;
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

    const title = this.add.text(640, 190, "CASES CERTIFIED", { font: "bold 32px Georgia", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(91).setScale(0);
    this.tweens.add({ targets: title, scale: 1, duration: 350, ease: "Back.easeOut" });

    const acc = Math.round((this.correctFirstTry / 15) * 100);
    const avgSec = (this.totalTimeMs / 15 / 1000).toFixed(1);
    const lines = [
      `ACCURACY: ${acc}%`,
      `AVG RESPONSE: ${avgSec}s`,
      `GEM-FREE BONUSES: ${this.fastBonusCount}`,
      `BEST COMBO: ×${this.getComboMultiplierFor(this.maxCombo)}`,
    ];
    lines.forEach((s, i) => {
      const t = this.add.text(500, 240 + i * 26, s, { font: "16px Arial", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 250, delay: 300 + i * 150 });
    });
    const totalText = this.add.text(500, 240 + 4 * 26, "TOTAL: 0", { font: "bold 24px Arial", color: HEX_GOLD }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: totalText, alpha: 1, duration: 250, delay: 900 });
    const counter = { v: 0 };
    this.tweens.add({ targets: counter, v: this.score, duration: 1000, delay: 900, onUpdate: () => totalText.setText(`TOTAL: ${Math.round(counter.v)}`) });

    const stars = this._starRating();
    for (let i = 0; i < 3; i++) {
      const earned = i < stars;
      const s = this.add.text(640 + (i - 1) * 60, 400, "★", { font: "40px Arial", color: earned ? HEX_GOLD : "#2a3040" }).setOrigin(0.5).setDepth(91).setScale(0);
      this.tweens.add({ targets: s, scale: 1, duration: 250, delay: 1500 + i * 200, ease: earned ? "Back.easeOut" : "Cubic.easeOut" });
    }

    const badge = this.add.container(640, 480).setDepth(91).setAlpha(0);
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillCircle(0, 0, 30);
    bg.lineStyle(3, C_WHITE_BLUE, 1);
    bg.strokeCircle(0, 0, 30);
    bg.lineStyle(1.3, C_SILVER, 0.7);
    bg.strokeCircle(0, 0, 16);
    const diaPts = [{ x: 0, y: -8 }, { x: 6, y: 0 }, { x: 0, y: 8 }, { x: -6, y: 0 }];
    bg.fillStyle(C_WHITE_BLUE, 0.85);
    bg.fillPoints(diaPts, true);
    badge.add([bg]);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 0 });
    const badgeLbl = this.add.text(640, 520, "isUpperCase() SCHEMA TUNED", { font: "bold 14px Georgia", color: HEX_WHITE_BLUE }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: badgeLbl, alpha: 1, duration: 300, delay: 0 });

    this._makeButton(500, 560, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(770, 560, "NEXT: The Grand Classification →", 320, 44, { fill: 0x00733a, stroke: C_GREEN_BRIGHT, textColor: "#ffffff" }, () => {
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
