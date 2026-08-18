/**
 * Level 84 — "The Letter Trials" (Character Wing: Tuning Phase —
 * Character.isLetter())
 * ===========================================================================
 * Tunes the L83 isLetter() schema through rapid-fire fluency trials. A
 * damped PENDULUM GEM swinging from a silver chain IS the timer — a new
 * lineage distinct from L78/L81's linear-tween sweep: the swing's ARC
 * WIDTH decays linearly from ±80px to 0 over the round's time limit while
 * its period stays constant (~1.2s), so the gem visibly slows toward a
 * standstill rather than a line sweeping to an edge. The reveal stage
 * hosts TWO mini instruments side by side — the L80 Numeral Loupe and the
 * L83 Prismatic Lens, both at reduced scale — since this level drills
 * isDigit/isLetter COMBINED, firing whichever instrument(s) a round's
 * calls actually invoke, in program order.
 *
 * Hand-verified all 15 rounds by direct tracing against real Java
 * semantics before writing any code. No spec data bugs found — the
 * spec's own worked traces (Round 8/9's !isDigit vs isLetter contrast,
 * Round 14's buggy-6-vs-fixed-5 bug hunt) all check out exactly as
 * written. One authoring simplification made during verification:
 * Round 12 asks for a TWO-LINE printed output; rather than inventing a
 * new symbolic-value convention for the option list, its option values
 * use the same "⏎"-joined-lines convention this codebase already uses
 * for multi-line output comparison (see command-round grading in
 * L80/L82/L83), with human-readable `label`s for display.
 *
 * New evaluator vocabulary beyond L83's cascade (all needed for this
 * level's own round data):
 *  - `&&` (logical AND) — reintroduced from L80 (unused in L83, needed
 *    again for Round 4's `isLetter('e') && isLetter('E')`).
 *  - `Character.isUpperCase(char)` — Round 13's preview of L86, silent
 *    (no dedicated instrument yet): true for 'A'-'Z', false otherwise.
 *  - An uninitialized declaration `String zone;` (Round 7) — a new
 *    no-initializer form of declVar, storing an undefined placeholder
 *    until a later bare reassignment fills it in.
 *  - A bare reassignment `zone = "Digit";` (Rounds 7, 11) — requires the
 *    variable already exist in `vars` (else compile error), type-checked
 *    against its DECLARED type, generalizing L82's int-only accumulator
 *    reassignment to any type.
 *  - A fully CHAINED braceless if/else-if/else, each branch a single
 *    inline statement with no braces at all (Round 7):
 *      `if (COND) STMT;` / `else if (COND) STMT;` / `else STMT;`
 *    This is a genuine gated chain (only ONE branch executes), unlike
 *    L83's single-line-braced form which was deliberately left
 *    ungated because L83's own data made that safe — Round 7 assigns
 *    the SAME variable in every branch, so gating is not optional here.
 *    Implemented as a lookahead from the initial braceless `if` line
 *    that collects zero-or-more `else if` continuations and an optional
 *    final `else`, then evaluates branches in order and runs at most one.
 *  - The multi-line BRACED if/else-if/.../else block collector is
 *    generalized (ported from L83) to walk an arbitrary number of
 *    `} else if (...) {` segments before an optional final `} else {`
 *    — Round 12 is a 2-branch if/else-if chain with NO final else,
 *    the first time a chain ends without one.
 */

import Phaser from "phaser";
import { GameManager } from "../../../../GameManager.js";
import { BadgeSystem } from "../../../../BadgeSystem.js";

const W = 1280, H = 720;

const C_CYAN = 0x4fc3f7, C_GOLD = 0xffd740, C_ORANGE = 0xff9800, C_BLUE_GRAY = 0x8ea6c8;
const C_GREEN_BRIGHT = 0x00e676, C_RED = 0xf44336, C_GRAY = 0x78909c, C_SILVER = 0xc0c0c0;
const HEX_CYAN = "#4fc3f7", HEX_GOLD = "#ffd740", HEX_ORANGE = "#ff9800", HEX_BLUE_GRAY = "#8ea6c8";
const HEX_GREEN_BRIGHT = "#00e676", HEX_RED = "#f44336", HEX_GRAY = "#78909c", HEX_SILVER = "#c0c0c0";
const C_INDIGO = 0x3949ab, HEX_INDIGO = "#3949ab";
const C_BLUE_LETTER = 0x4fc3f7, HEX_BLUE_LETTER = "#4fc3f7";

// Classification ticket (trial content area)
const TICKET_X0 = 220, TICKET_X1 = 680, TICKET_Y0 = 100, TICKET_Y1 = 420;
const TICKET_CX = (TICKET_X0 + TICKET_X1) / 2;
// Pendulum gem (hero timer)
const PIVOT_X = 800, PIVOT_Y = 100, CHAIN_LEN = 250, MAX_AMP_PX = 80, SWING_PERIOD_S = 1.2;
// Dual mini instruments (reveal stage)
const MINI_X0 = 920, MINI_X1 = 1230, MINI_Y0 = 80, MINI_Y1 = 320;
const MINI_LOUPE_X0 = MINI_X0 + 5, MINI_LOUPE_X1 = 920 + 150;
const MINI_PRISM_X0 = 1080, MINI_PRISM_X1 = MINI_X1 - 5;
// Trial slate / container shelf
const SLATE_X = 920, SLATE_Y = 335, SLATE_W = 310, SLATE_H = 130;
const SHELF_X = 920, SHELF_Y = 480, SHELF_W = 310, SHELF_H = 100;

const TUTORIAL_KEY = "level84_tutorial_done";
const WAVE_TIME = { 1: 12000, 2: 10000, 3: 9000 };

// ══════════════════════════════════════════════════════════════
// ROUND CONFIGURATION
// ══════════════════════════════════════════════════════════════
const ROUNDS = [
  // ══ WAVE 1 — Rapid Classifications (12s) ══
  { round: 1, wave: 1, type: "predict",
    source: "boolean b = Character.isLetter('W');",
    question: "What is stored in b?", correct: "true",
    options: [
      { value: "true", tag: null },
      { value: "false", tag: "W_not_letter_belief" },
      { value: "87", tag: "isLetter_returns_ascii_belief" },
      { value: "error", tag: "isLetter_crashes_belief", label: "Error" },
    ],
    concept: "fluent_letter_true" },

  { round: 2, wave: 1, type: "predict",
    source: "boolean b = Character.isLetter('4');",
    question: "What is stored in b?", correct: "false",
    options: [
      { value: "false", tag: null },
      { value: "true", tag: "digit_is_letter_belief" },
      { value: "4", tag: "isLetter_returns_value_belief" },
      { value: "error", tag: "isLetter_crashes_belief", label: "Error" },
    ],
    concept: "fluent_digit_not_letter" },

  { round: 3, wave: 1, type: "predict",
    source: "boolean b = Character.isLetter('?');",
    question: "What is stored in b?", correct: "false",
    options: [
      { value: "false", tag: null },
      { value: "true", tag: "punctuation_is_letter_belief" },
      { value: "error", tag: "isLetter_crashes_belief", label: "Error" },
      { value: "63", tag: "isLetter_returns_ascii_belief" },
    ],
    concept: "fluent_punct_not_letter" },

  { round: 4, wave: 1, type: "predict",
    source: "System.out.println(Character.isLetter('e') && Character.isLetter('E'));",
    question: "What prints?", correct: "true",
    options: [
      { value: "true", tag: null },
      { value: "false", tag: "isLetter_case_mismatch_belief" },
      { value: "error", tag: "boolean_and_crashes_belief", label: "Error" },
      { value: "eE", tag: "boolean_concats_belief" },
    ],
    revealNote: "Both 'e' AND 'E' are letters — isLetter is case-blind. true && true = true. The prism refracts for both cases identically.",
    concept: "fluent_both_cases" },

  { round: 5, wave: 1, type: "predict",
    source: 'String s = "2fast";\nSystem.out.println(Character.isLetter(s.charAt(0)));',
    question: "What prints?", correct: "false",
    options: [
      { value: "false", tag: null },
      { value: "true", tag: "first_char_always_letter_belief" },
      { value: "error", tag: "charAt_isLetter_crashes_belief", label: "Error" },
      { value: "2", tag: "isLetter_returns_char_belief" },
    ],
    revealNote: "s.charAt(0) → '2' (the first character). isLetter('2') → false. The string STARTS with a digit — charAt extracts it faithfully, and the prism rejects it.",
    concept: "fluent_charAt_digit_start" },

  // ══ WAVE 2 — The Three Zones (10s) ══
  { round: 6, wave: 2, type: "predict",
    source: 'char ch = \'$\';\nboolean d = Character.isDigit(ch);\nboolean l = Character.isLetter(ch);\nSystem.out.println(d + " " + l);',
    question: "What prints?", correct: "false false",
    options: [
      { value: "false false", tag: null },
      { value: "true false", tag: "dollar_is_digit_belief" },
      { value: "false true", tag: "dollar_is_letter_belief" },
      { value: "true true", tag: "isDigit_isLetter_both_true_belief" },
    ],
    revealNote: "THE THIRD ZONE: '$' is neither a digit nor a letter — both instruments return false. Symbols live in the 'other' zone.",
    concept: "three_zone_other" },

  { round: 7, wave: 2, type: "predict",
    source: 'char ch = \'n\';\nString zone;\nif (Character.isDigit(ch)) zone = "Digit";\nelse if (Character.isLetter(ch)) zone = "Letter";\nelse zone = "Other";\nSystem.out.println(zone);',
    question: "What prints?", correct: "Letter",
    options: [
      { value: "Letter", tag: null },
      { value: "Digit", tag: "letter_is_digit_belief" },
      { value: "Other", tag: "n_is_other_belief" },
      { value: "error", tag: "three_branch_error_belief", label: "Error" },
    ],
    concept: "fluent_three_branch" },

  { round: 8, wave: 2, type: "predict",
    source: "char ch = '7';\nboolean notDigit = !Character.isDigit(ch);\nboolean letter = Character.isLetter(ch);\nSystem.out.println(notDigit + \" \" + letter);",
    question: "What prints?", correct: "false false",
    options: [
      { value: "false false", tag: null },
      { value: "false true", tag: "not_digit_is_letter_belief" },
      { value: "true false", tag: "seven_not_digit_belief" },
      { value: "true true", tag: "not_digit_equals_letter_belief" },
    ],
    revealNote: "'7' IS a digit → !isDigit = false. '7' is NOT a letter → isLetter = false. Both false — because '7' is a digit, and negating isDigit doesn't make it a letter. !isDigit ≠ isLetter.",
    concept: "not_digit_vs_isLetter_digit" },

  { round: 9, wave: 2, type: "predict",
    source: "char ch = '!';\nboolean notDigit = !Character.isDigit(ch);\nboolean letter = Character.isLetter(ch);\nSystem.out.println(notDigit + \" \" + letter);",
    question: "What prints?", correct: "true false",
    options: [
      { value: "true false", tag: null },
      { value: "true true", tag: "not_digit_is_letter_belief" },
      { value: "false false", tag: "excl_is_digit_belief" },
      { value: "false true", tag: "excl_is_letter_belief" },
    ],
    revealNote: "THE KEY DISTINCTION: '!' is NOT a digit → !isDigit = true. But '!' is NOT a letter either → isLetter = false. !isDigit is TRUE but isLetter is FALSE — because '!' lives in the third zone. NOT digit does NOT mean letter. The three zones don't reduce to two.",
    concept: "not_digit_vs_isLetter_symbol" },

  { round: 10, wave: 2, type: "predict",
    source: 'String s = "A1 B";\nint count = 0;\nfor (int i = 0; i < s.length(); i++) {\n    if (Character.isLetter(s.charAt(i))) count++;\n}\nSystem.out.println(count);',
    question: "What prints?", correct: "2",
    options: [
      { value: "2", tag: null },
      { value: "3", tag: "space_is_letter_belief" },
      { value: "4", tag: "all_chars_are_letters_belief" },
      { value: "1", tag: "only_uppercase_counted_belief" },
    ],
    revealNote: "'A' letter, '1' digit, ' ' space, 'B' letter. Two letters: A and B. The space and digit didn't pass. isLetter counts both cases but ignores whitespace and digits.",
    concept: "fluent_letter_count_with_space" },

  // ══ WAVE 3 — Deep Traces & Bug Hunt (9s / 12s) ══
  { round: 11, wave: 3, type: "trace",
    source: 'String pw = "Go4It!";\nboolean allLetters = true;\nfor (int i = 0; i < pw.length(); i++) {\n    if (!Character.isLetter(pw.charAt(i))) {\n        allLetters = false;\n    }\n}\nSystem.out.println(allLetters);',
    question: "What prints?", correct: "false",
    options: [
      { value: "false", tag: null },
      { value: "true", tag: "Go4It_all_letters_belief" },
      { value: "error", tag: "negation_in_loop_crashes_belief", label: "Error" },
      { value: "4", tag: "prints_non_letter_count_belief" },
    ],
    revealNote: "The loop checks: if ANY character is NOT a letter, set allLetters=false. 'G' ✓, 'o' ✓, '4' ✗ — allLetters becomes false and stays false. '!' would also trigger it. The string is NOT all letters — it contains a digit and a symbol.",
    concept: "trace_all_letters_check" },

  { round: 12, wave: 3, type: "trace",
    source: 'String code = "X9";\nfor (int i = 0; i < code.length(); i++) {\n    char ch = code.charAt(i);\n    if (Character.isLetter(ch)) {\n        System.out.println(ch + " is a letter");\n    } else if (Character.isDigit(ch)) {\n        System.out.println(ch + " is a digit");\n    }\n}',
    question: "What prints (two lines)?", correct: "X is a letter⏎9 is a digit",
    options: [
      { value: "X is a letter⏎9 is a digit", tag: null, label: "X is a letter / 9 is a digit" },
      { value: "X is a digit⏎9 is a letter", tag: "classifiers_swapped_belief", label: "X is a digit / 9 is a letter" },
      { value: "X is a letter", tag: "only_first_printed_belief", label: "X is a letter (only)" },
      { value: "error", tag: "dual_classifier_crashes_belief", label: "Error" },
    ],
    concept: "trace_dual_classifier_loop" },

  { round: 13, wave: 3, type: "trace",
    source: "char ch = 'Z';\nboolean upper = Character.isUpperCase(ch);\nboolean letter = Character.isLetter(ch);\nSystem.out.println(upper + \" \" + letter);",
    question: "What prints?", correct: "true true",
    options: [
      { value: "true true", tag: null },
      { value: "true false", tag: "uppercase_not_letter_belief" },
      { value: "false true", tag: "Z_not_uppercase_belief" },
      { value: "error", tag: "isUpperCase_not_learned_belief", label: "Error" },
    ],
    revealNote: "'Z' is BOTH an uppercase letter AND a letter. isUpperCase is a SUB-CLASSIFICATION of isLetter — every uppercase letter is also a letter. isUpperCase checks the specific case; isLetter checks the broad family. Both can be true for the same character — unlike isDigit and isLetter, which are mutually exclusive.",
    concept: "trace_isUpperCase_preview" },

  { round: 14, wave: 3, type: "bughunt",
    lines: ['String input = "Hello!";', "int letterCount = 0;", "for (int i = 0; i < input.length(); i++) {", "    if (!Character.isDigit(input.charAt(i))) {", "        letterCount++;", "    }", "}", 'System.out.println("Letters: " + letterCount);', "// intent: count only letters"],
    faultToken: "!Character.isDigit(input.charAt(i))", faultLine: 4, tokenRegion: "wrong_test",
    fix: "Character.isLetter(input.charAt(i))",
    explanation: "The !isDigit trap — !isDigit('!') is TRUE (exclamation mark is not a digit), so the count includes symbols and spaces as 'letters'. The fix: use isLetter, which only counts actual letters. !isDigit catches everything in the OTHER zone; isLetter is precise.",
    wrongTag: "not_digit_is_letter_belief",
    revealNote: "Dual-future reveal: the buggy run counts 'H'✓ 'e'✓ 'l'✓ 'l'✓ 'o'✓ '!'✓ (!isDigit is true for '!') → 'Letters: 6' (wrong — '!' is not a letter). The fixed run with isLetter: 'H'✓ 'e'✓ 'l'✓ 'l'✓ 'o'✓ '!'✗ → 'Letters: 5' (correct).",
    concept: "not_digit_trap_bug" },

  { round: 15, wave: 3, type: "bughunt",
    lines: ['String name = "Alice";', "if (Character.isLetter(name)) {", '    System.out.println("Valid name");', "}", "// intent: check if the name starts with a letter"],
    faultToken: "Character.isLetter(name)", faultLine: 2, tokenRegion: "string_argument",
    fix: "Character.isLetter(name.charAt(0))",
    explanation: "The String argument — isLetter takes a CHAR, not a String. 'name' is a String variable. The fix: name.charAt(0) extracts the first char for classification. The prism examines one gem; charAt extracts it from the strip.",
    wrongTag: "isLetter_takes_string_belief",
    revealNote: "Dual-future reveal: the buggy run stamps COMPILE ERROR — 'incompatible types: String cannot be converted to char'. Reset; the fixed run extracts charAt(0) → 'A', passes to isLetter → true, prints 'Valid name'.",
    concept: "string_argument_bug" },
];

const MISCONCEPTION_FEEDBACK = {
  W_not_letter_belief: "'W' IS a letter — uppercase counts exactly like lowercase. isLetter is case-blind.",
  isLetter_returns_ascii_belief: "isLetter returns boolean, not the character's code. Only the classification matters.",
  isLetter_crashes_belief: "isLetter never crashes — it has a valid true/false answer for every char.",
  digit_is_letter_belief: "Digits are NOT letters — different family, different refraction.",
  isLetter_returns_value_belief: "isLetter returns BOOLEAN — true or false — never the character or its value.",
  punctuation_is_letter_belief: "'?' is punctuation, not a letter. Only A–Z and a–z pass the letter test.",
  isLetter_case_mismatch_belief: "isLetter('e') AND isLetter('E') — both true, so true && true = true. The prism is case-blind; both cases refract.",
  boolean_and_crashes_belief: "&& (logical AND) between two booleans never crashes — it's an ordinary combination, true only when BOTH sides are true.",
  boolean_concats_belief: "&& combines two booleans into one boolean — it doesn't concatenate characters. This isn't a String operation.",
  first_char_always_letter_belief: "Strings can START with anything — digits, symbols, spaces. charAt(0) extracts whatever's first, and the prism classifies it honestly.",
  charAt_isLetter_crashes_belief: "charAt on a valid index never crashes, and isLetter never crashes on any char it receives — both are safe, total operations.",
  isLetter_returns_char_belief: "isLetter returns boolean, not the char that was tested.",
  dollar_is_digit_belief: "'$' is a symbol, not a digit. isDigit only recognizes '0'-'9'.",
  dollar_is_letter_belief: "'$' is a symbol, not a letter. isLetter only recognizes A–Z and a–z.",
  isDigit_isLetter_both_true_belief: "A char can never be BOTH a digit and a letter — isDigit and isLetter are mutually exclusive. '$' is neither, so both are false.",
  letter_is_digit_belief: "'n' is a letter, not a digit — the first branch (isDigit) is false, so it's skipped.",
  n_is_other_belief: "'n' IS a letter — isLetter('n') is true. The else-if branch catches it before the final else is ever reached.",
  three_branch_error_belief: "An if/else-if/else chain never crashes — exactly one branch runs, chosen by the first true condition.",
  not_digit_is_letter_belief: "!isDigit is NOT the same as isLetter. !isDigit is true for EVERYTHING that's not a digit — letters, symbols, spaces. isLetter is true for LETTERS ONLY. The third zone (other) exists; !isDigit includes it.",
  not_digit_equals_letter_belief: "!isDigit is NOT the same as isLetter — see above. For a digit char, both !isDigit and isLetter happen to be false, but not for the same reason.",
  seven_not_digit_belief: "'7' IS a digit — isDigit('7') is true, so !isDigit('7') is false, not true.",
  excl_is_digit_belief: "'!' is not a digit — isDigit('!') is false, so !isDigit('!') is true, not false.",
  excl_is_letter_belief: "'!' is a symbol, not a letter — isLetter('!') is false. !isDigit being true does NOT make isLetter true; they test different things.",
  space_is_letter_belief: "Space is whitespace — not a letter, not a digit. Both instruments return false for spaces.",
  all_chars_are_letters_belief: "The if-condition filters the loop — only characters where isLetter(ch) is true increment count. The digit and the space don't count.",
  only_uppercase_counted_belief: "isLetter counts BOTH cases — 'A' and 'B' are both uppercase here, but lowercase would count identically. The count is 2 because there are two letters, not because of case.",
  Go4It_all_letters_belief: "'Go4It!' contains '4' (digit) and '!' (symbol) — not all letters. The allLetters check catches the first non-letter and stays false for the rest of the loop.",
  negation_in_loop_crashes_belief: "!isLetter inside a loop condition is completely ordinary — it never crashes. It's boolean negation applied once per character.",
  prints_non_letter_count_belief: "allLetters is a boolean flag, not a counter — it prints true or false, never a count of non-letters.",
  classifiers_swapped_belief: "The if checks isLetter first, else-if checks isDigit. 'X' → isLetter=true → 'X is a letter'. '9' → isLetter=false, isDigit=true → '9 is a digit'. The order matches the code, not the reverse.",
  only_first_printed_belief: "The loop runs for EVERY character in the string — it doesn't stop after the first match. Both 'X' and '9' get their own println.",
  dual_classifier_crashes_belief: "A loop with if/else-if over two classification methods never crashes — one println fires per character, based on whichever branch matches.",
  uppercase_not_letter_belief: "Uppercase letters ARE letters — isUpperCase is a SUB-classification of isLetter. Every uppercase letter passes BOTH tests.",
  Z_not_uppercase_belief: "'Z' IS uppercase — isUpperCase('Z') is true. It's the last letter of the uppercase alphabet.",
  isUpperCase_not_learned_belief: "isUpperCase works like every other Character method: static, boolean, char argument, no transformation. It classifies case, not the letter family.",
  isLetter_takes_string_belief: "isLetter takes a CHAR, not a String — Character.isLetter(name) fails to compile because name is a String. Extract one character first: name.charAt(0).",
  three_zone_confusion: "Three zones: digit, letter, other. !isDigit covers TWO zones (letter + other). isLetter covers ONE zone (letter). The precision difference is the symbol zone.",
  timeout: "The pendulum stopped! Clamp faster — letter verdicts are reflexes now.",
};

export class Level84Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level84Scene" });
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
    this.totalTimeMs = 0;
    this.attemptLog = [];
    this.roundElements = [];
    this.roundStartTime = 0;
    this.roundAttempts = 0;
    this.inputLocked = true;
    this.gameEnded = false;
    this._alive = true;
    this._pendulumHalted = true;
  }

  preload() {}

  create() {
    this._alive = true;
    this.createParticleTexture();
    this.createBackground();
    this.createTrialsRoomDressing();
    this.createParticles();
    this.createClassificationTicket();
    this.createPendulumGem();
    this.createMiniLoupe();
    this.createMiniPrism();
    this.createTrialSlate();
    this.createContainerShelf();
    this.createHUD();
    this.createBit();

    this.events.on("shutdown", () => { this._alive = false; this._killPendulumTween(); });
    this.checkTutorial();
  }

  update(time, delta) {
    this.updateParticles(time, delta);
    this.updatePendulumSwing(time);
    this.updatePendulumUrgency(time);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // SETUP — LETTER TRIALS ROOM DRESSING
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l84_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l84_dot", 8, 8);
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

    // Three-zone reference chart (left wall) — Venn-style, no overlap
    const chartG = this.add.graphics().setDepth(2).setAlpha(0.4);
    chartG.lineStyle(2, C_SILVER, 1);
    chartG.strokeRect(60, 150, 100, 100);
    chartG.lineStyle(1, C_SILVER, 0.5);
    chartG.lineBetween(60, 183, 160, 183);
    chartG.lineBetween(60, 217, 160, 217);
    const zoneLabels = [
      { y: 166, text: "DIGIT", color: HEX_GOLD },
      { y: 200, text: "LETTER", color: HEX_BLUE_LETTER },
      { y: 234, text: "OTHER", color: HEX_GRAY },
    ];
    this._zoneChartLabels = zoneLabels.map((z) => this.add.text(110, z.y, z.text, { font: "bold 11px Georgia", color: z.color }).setOrigin(0.5).setDepth(2).setAlpha(0.4));

    // Pendulum mount bracket (right wall, decorative)
    const bracketG = this.add.graphics().setDepth(2).setAlpha(0.5);
    bracketG.fillStyle(0x8a6435, 0.6);
    bracketG.fillRect(1130, 82, 24, 12);
    bracketG.lineStyle(1, C_SILVER, 0.6);
    bracketG.strokeRect(1130, 82, 24, 12);

    this.createTrialsBanner();
  }

  createTrialsBanner() {
    const g = this.add.graphics().setDepth(2);
    g.fillStyle(0x081224, 1);
    g.lineStyle(1, C_BLUE_LETTER, 0.5);
    g.fillRoundedRect(460, 12, 360, 26, 3);
    g.strokeRoundedRect(460, 12, 360, 26, 3);
    this.add.text(640, 25, "T H E   L E T T E R   T R I A L S", { font: "bold 14px Georgia", color: HEX_BLUE_LETTER }).setOrigin(0.5).setAlpha(0.7).setDepth(3);
  }

  createParticles() {
    this.ambient = [];
    const colors = [C_INDIGO, C_SILVER, C_BLUE_LETTER];
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
    const p = this.add.particles(x, y, "l84_dot", {
      speed: { min: 80, max: 240 }, angle: { min: 0, max: 360 }, scale: { start: 0.9, end: 0 }, lifespan: 500,
      tint: [C_BLUE_LETTER, C_GOLD, C_SILVER, 0xffffff], emitting: false,
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
    this.ticketHeaderText.setText(`LETTER TRIAL — GEM ${this.currentRound + 1}`);
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
    const labels = { certified: "CLASSIFIED", misjudged: "MISCLASSIFIED", void: "MOTION CEASED" };
    const colors = { certified: HEX_GREEN_BRIGHT, misjudged: HEX_RED, void: HEX_RED };
    const stamp = this.add.text(0, 0, labels[kind], { font: "bold 21px Georgia", color: colors[kind] }).setOrigin(0.5).setScale(1.4).setAngle(-8).setAlpha(0);
    this.ticketStampLayer.add(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 180 });
    const hold = kind === "void" ? 1800 : 700;
    await this.delay(hold);
    if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 200, onComplete: () => stamp.destroy() });
  }

  // ══════════════════════════════════════════════════════════════
  // THE PENDULUM GEM (THE TIMER — hero mechanic): a faceted gem hangs
  // from a fixed pivot on a silver chain, swinging in a damped arc.
  // The arc's horizontal excursion decays LINEARLY from ±80px to 0
  // over the round's time limit while the period stays constant
  // (~1.2s) — the chain length itself stays fixed, so the gem
  // traces a real circular arc as the swing narrows toward a
  // standstill at dead-center.
  // ══════════════════════════════════════════════════════════════

  _octPoints(r) {
    const pts = [];
    for (let i = 0; i < 8; i++) { const a = (Math.PI / 4) * i; pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r }); }
    return pts;
  }

  createPendulumGem() {
    this.pivotIcon = this.add.circle(PIVOT_X, PIVOT_Y, 4, C_SILVER, 1).setDepth(9);
    this.chainGfx = this.add.graphics().setDepth(9);

    this._gemPts = this._octPoints(15);
    this._pendulumX = PIVOT_X;
    this._pendulumY = PIVOT_Y + CHAIN_LEN;
    this.gemContainer = this.add.container(this._pendulumX, this._pendulumY).setDepth(10);
    const gemG = this.add.graphics();
    gemG.fillStyle(0x4fc3f7, 1);
    gemG.fillPoints(this._gemPts, true);
    gemG.lineStyle(2, 0x1565c0, 1);
    gemG.strokePoints(this._gemPts, true);
    this._gemGfx = gemG;
    this._gemHighlight = this.add.circle(-5, -5, 2.5, 0xffffff, 0.8);
    this.gemContainer.add([gemG, this._gemHighlight]);

    this.chainGfx.lineStyle(1.5, C_SILVER, 1);
    this.chainGfx.lineBetween(PIVOT_X, PIVOT_Y, this._pendulumX, this._pendulumY);

    this._pendulumAmpFrac = 0;
    this._pendulumUrgency = "safe";
    this._pendulumHalted = true;
    this._pendulumStandstillDone = false;
  }

  _applyUrgencyVisual(state) {
    if (!this.pivotIcon) return;
    if (state === "critical") this.pivotIcon.setFillStyle(C_RED, 1);
    else if (state === "warning") this.pivotIcon.setFillStyle(0xffab40, 1);
    else this.pivotIcon.setFillStyle(C_SILVER, 1);
  }

  updatePendulumSwing(time) {
    if (!this.gemContainer || this._pendulumHalted || this._pendulumStandstillDone) return;
    const elapsedSec = (time - (this._pendulumStartTime || time)) / 1000;
    const swingPhase = Math.sin(((2 * Math.PI) / SWING_PERIOD_S) * elapsedSec);
    const ampPx = (this._pendulumAmpFrac || 0) * MAX_AMP_PX;
    const xOffset = ampPx * swingPhase;
    const yOffset = Math.sqrt(Math.max(0, CHAIN_LEN * CHAIN_LEN - xOffset * xOffset));
    this._pendulumX = PIVOT_X + xOffset;
    this._pendulumY = PIVOT_Y + yOffset;
    this.chainGfx.clear();
    const warm = this._pendulumUrgency === "warning" || this._pendulumUrgency === "critical";
    this.chainGfx.lineStyle(1.5, warm ? 0xffab40 : C_SILVER, 1);
    this.chainGfx.lineBetween(PIVOT_X, PIVOT_Y, this._pendulumX, this._pendulumY);
    this.gemContainer.setPosition(this._pendulumX, this._pendulumY);
    if (this._gemHighlight) this._gemHighlight.setPosition(Phaser.Math.Clamp(xOffset * 0.1, -6, 6), -5);
  }

  updatePendulumUrgency(time) {
    if (this._pendulumAmpFrac === undefined) return;
    const rem = this._pendulumAmpFrac;
    const state = rem <= 0.15 ? "critical" : rem <= 0.33 ? "warning" : "safe";
    if (state !== this._pendulumUrgency) { this._pendulumUrgency = state; this._applyUrgencyVisual(state); }
    if (!this._pendulumHalted && !this._pendulumStandstillDone && this.gemContainer) {
      if (state === "critical") { const flick = 0.7 + 0.3 * Math.abs(Math.sin(time * 0.01)); this.gemContainer.setAlpha(flick); }
      else this.gemContainer.setAlpha(1);
    }
  }

  startPendulumSwing(timeLimitMs) {
    this._killPendulumTween();
    this.roundTimeLimit = timeLimitMs;
    this._pendulumStartTime = this.time.now;
    this._pendulumHalted = false;
    this._pendulumStandstillDone = false;
    this._pendulumUrgency = "safe";
    this._applyUrgencyVisual("safe");
    if (this.gemContainer) this.gemContainer.setAlpha(1);
    const state = { v: 1 };
    this._pendulumAmpFrac = 1;
    this._pendulumTween = this.tweens.add({
      targets: state, v: 0, duration: timeLimitMs, ease: "Linear",
      onUpdate: () => { this._pendulumAmpFrac = state.v; },
      onComplete: () => { if (this._alive && !this._pendulumHalted) this.onPendulumTimeout(this._currentConfig); },
    });
  }

  _killPendulumTween() {
    if (this._pendulumTween) { this._pendulumTween.stop(); this._pendulumTween = null; }
  }

  /** Answer path: a silver C-clamp snaps around the chain at its
   * current position and the gem freezes mid-swing. */
  async clampChain() {
    this._pendulumHalted = true;
    this._killPendulumTween();
    const midX = (PIVOT_X + this._pendulumX) / 2, midY = (PIVOT_Y + this._pendulumY) / 2;
    const clampG = this.add.graphics().setDepth(14).setAlpha(0);
    clampG.lineStyle(3, C_SILVER, 1);
    clampG.beginPath();
    clampG.arc(midX, midY, 8, Phaser.Math.DegToRad(30), Phaser.Math.DegToRad(330), false);
    clampG.strokePath();
    this.roundElements.push(clampG);
    this._clampGfx = clampG;
    await new Promise((res) => { this.tweens.add({ targets: clampG, alpha: 1, duration: 120, onComplete: res }); });
  }

  async relievedSparkle() {
    for (let i = 0; i < 4; i++) {
      const spark = this.add.circle(this._pendulumX + Phaser.Math.Between(-14, 14), this._pendulumY + Phaser.Math.Between(-14, 14), 1.5, 0xe8eaf6, 0.8).setDepth(13);
      this.tweens.add({ targets: spark, alpha: 0, duration: 260, onComplete: () => spark.destroy() });
    }
    await this.delay(80);
  }

  /** Timeout path: the amplitude reaches zero and the gem comes to a
   * dead-center standstill — chain taut, gem fading blue → gray. */
  async pendulumStandstill() {
    this._pendulumHalted = true;
    this._pendulumStandstillDone = true;
    this._killPendulumTween();
    this.screenShake(0.004, 150);
    const restX = PIVOT_X, restY = PIVOT_Y + CHAIN_LEN;
    await new Promise((res) => { this.tweens.add({ targets: this.gemContainer, x: restX, y: restY, duration: 200, ease: "Sine.easeOut", onComplete: res }); });
    this._pendulumX = restX; this._pendulumY = restY;
    this.chainGfx.clear();
    this.chainGfx.lineStyle(1.5, C_SILVER, 1);
    this.chainGfx.lineBetween(PIVOT_X, PIVOT_Y, restX, restY);
    this._gemGfx.clear();
    this._gemGfx.fillStyle(C_GRAY, 1);
    this._gemGfx.fillPoints(this._gemPts, true);
    this._gemGfx.lineStyle(2, 0x455a64, 1);
    this._gemGfx.strokePoints(this._gemPts, true);
    if (this._gemHighlight) this._gemHighlight.setVisible(false);
    await this.delay(350);
  }

  /** Light reset between rounds WITHIN the same wave (no fanfare). */
  resetGemForRound() {
    this._killPendulumTween();
    this._pendulumHalted = true;
    this._pendulumStandstillDone = false;
    this._pendulumAmpFrac = 0;
    this._pendulumX = PIVOT_X;
    this._pendulumY = PIVOT_Y + CHAIN_LEN;
    if (this.gemContainer) this.gemContainer.setPosition(this._pendulumX, this._pendulumY).setAlpha(1).setScale(1);
    this._gemGfx.clear();
    this._gemGfx.fillStyle(0x4fc3f7, 1);
    this._gemGfx.fillPoints(this._gemPts, true);
    this._gemGfx.lineStyle(2, 0x1565c0, 1);
    this._gemGfx.strokePoints(this._gemPts, true);
    if (this._gemHighlight) this._gemHighlight.setVisible(true).setPosition(-5, -5);
    if (this.chainGfx) { this.chainGfx.clear(); this.chainGfx.lineStyle(1.5, C_SILVER, 1); this.chainGfx.lineBetween(PIVOT_X, PIVOT_Y, this._pendulumX, this._pendulumY); }
    if (this._clampGfx) { this._clampGfx.destroy(); this._clampGfx = null; }
    this._applyUrgencyVisual("safe");
  }

  /** Full regenerate with fanfare — used on WAVE transitions: the
   * clamp releases and a gentle push sends it swinging wide again. */
  async regeneratePendulum() {
    this.resetGemForRound();
    await new Promise((res) => { this.tweens.add({ targets: this.gemContainer, x: PIVOT_X + 40, duration: 200, ease: "Sine.easeOut", yoyo: true, onComplete: res }); });
    await this.delay(120);
  }

  // ══════════════════════════════════════════════════════════════
  // THE DUAL MINI INSTRUMENTS (reveal apparatus) — the L80 Numeral
  // Loupe and L83 Prismatic Lens, side by side at reduced scale.
  // Whichever method(s) a round's calls actually invoke fire their
  // own instrument, in program order; the OTHER instrument's frame
  // dims briefly while its sibling runs.
  // ══════════════════════════════════════════════════════════════

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
    const code = ch.charCodeAt(0);
    if (code < 32) return `[${code}]`;
    return ch;
  }

  async _dimInstrument(frameGfx, dim) {
    if (!frameGfx) return;
    await new Promise((res) => { this.tweens.add({ targets: frameGfx, alpha: dim ? 0.3 : 1, duration: 100, onComplete: res }); });
  }

  createMiniLoupe() {
    const cx = (MINI_LOUPE_X0 + MINI_LOUPE_X1) / 2;
    this._miniLoupeFrame = this.add.graphics().setDepth(10);
    this._miniLoupeFrame.lineStyle(1.5, C_SILVER, 0.5);
    this._miniLoupeFrame.strokeRoundedRect(MINI_LOUPE_X0, MINI_Y0, MINI_LOUPE_X1 - MINI_LOUPE_X0, MINI_Y1 - MINI_Y0, 6);
    this.add.text(cx, MINI_Y0 - 10, "LOUPE", { font: "bold 10px Georgia", color: HEX_SILVER }).setOrigin(0.5).setDepth(11).setAlpha(0.6);

    this.miniLoupeDynamicLayer = this.add.container(0, 0).setDepth(20);
    this._miniLoupePadY = MINI_Y0 + 55;
    this._miniLoupeRestY = MINI_Y0 + 22;
    this._miniLoupeDownY = this._miniLoupePadY;

    this._miniLoupeContainer = this.add.container(cx, this._miniLoupeRestY).setDepth(25);
    const lg = this.add.graphics();
    lg.lineStyle(2, C_SILVER, 1);
    lg.fillStyle(0x0a1428, 0.5);
    lg.fillCircle(0, 0, 22);
    lg.strokeCircle(0, 0, 22);
    this._miniLoupeContainer.add(lg);

    this._miniLoupeVerdictText = this.add.text(cx, MINI_Y0 + 115, "", { font: "bold 14px Georgia", color: HEX_GRAY }).setOrigin(0.5).setDepth(24);
    this._miniLoupeContText = this.add.text(cx, MINI_Y1 - 30, "boolean —", { font: "bold 10px Courier New", color: HEX_GRAY }).setOrigin(0.5).setDepth(24);
  }

  createMiniPrism() {
    const cx = (MINI_PRISM_X0 + MINI_PRISM_X1) / 2;
    this._miniPrismFrame = this.add.graphics().setDepth(10);
    this._miniPrismFrame.lineStyle(1.5, C_SILVER, 0.5);
    this._miniPrismFrame.strokeRoundedRect(MINI_PRISM_X0, MINI_Y0, MINI_PRISM_X1 - MINI_PRISM_X0, MINI_Y1 - MINI_Y0, 6);
    this.add.text(cx, MINI_Y0 - 10, "PRISM", { font: "bold 10px Georgia", color: HEX_SILVER }).setOrigin(0.5).setDepth(11).setAlpha(0.6);

    this.miniPrismDynamicLayer = this.add.container(0, 0).setDepth(20);
    this._miniPrismPadY = MINI_Y0 + 55;
    this._miniPrismRestY = MINI_Y0 + 22;
    this._miniPrismDownY = this._miniPrismPadY;

    this._miniPrismContainer = this.add.container(cx, this._miniPrismRestY).setDepth(25);
    const pg = this.add.graphics();
    const s = 16;
    const triPts = [{ x: 0, y: -s }, { x: s * 0.87, y: s * 0.5 }, { x: -s * 0.87, y: s * 0.5 }];
    pg.fillStyle(0x0a1428, 0.35);
    pg.lineStyle(2, C_SILVER, 1);
    pg.fillPoints(triPts, true);
    pg.strokePoints(triPts, true);
    this._miniPrismGlow = this.add.graphics();
    this._miniPrismContainer.add([pg, this._miniPrismGlow]);
    this._miniPrismTriPts = triPts;

    this._miniPrismVerdictText = this.add.text(cx, MINI_Y0 + 115, "", { font: "bold 14px Georgia", color: HEX_GRAY }).setOrigin(0.5).setDepth(24);
    this._miniPrismContText = this.add.text(cx, MINI_Y1 - 30, "boolean —", { font: "bold 10px Courier New", color: HEX_GRAY }).setOrigin(0.5).setDepth(24);
  }

  clearMiniInstruments() {
    this.miniLoupeDynamicLayer.removeAll(true);
    this._miniLoupeVerdictText.setText("").setColor(HEX_GRAY);
    this._miniLoupeContText.setText("boolean —").setColor(HEX_GRAY);
    this._miniLoupeContainer.setY(this._miniLoupeRestY);
    this.miniPrismDynamicLayer.removeAll(true);
    this._miniPrismVerdictText.setText("").setColor(HEX_GRAY);
    this._miniPrismContText.setText("boolean —").setColor(HEX_GRAY);
    this._miniPrismContainer.setY(this._miniPrismRestY);
    if (this._miniPrismGlow) this._miniPrismGlow.clear();
    if (this._miniLoupeFrame) this._miniLoupeFrame.setAlpha(1);
    if (this._miniPrismFrame) this._miniPrismFrame.setAlpha(1);
  }

  /** Runs the honest mini isDigit classification (left instrument). */
  async runMiniLoupe(ch, code, result) {
    await this._dimInstrument(this._miniPrismFrame, true);
    const cx = (MINI_LOUPE_X0 + MINI_LOUPE_X1) / 2;
    const displayCh = ch !== null ? this._displayChar(ch) : `[${code}]`;
    const family = ch !== null ? this.getGemFamily(ch) : "other";
    const colors = this.getGemColor(family);

    const gem = this.add.container(cx, this._miniLoupePadY).setAlpha(0).setScale(0.6).setDepth(21);
    const gg = this.add.graphics();
    const pts = this._octPoints(11);
    gg.fillStyle(colors.fill, 1);
    gg.lineStyle(1.5, colors.stroke, 1);
    gg.fillPoints(pts, true);
    gg.strokePoints(pts, true);
    const txt = this.add.text(0, 0, displayCh, { font: "bold 11px Courier New", color: "#0a1428" }).setOrigin(0.5);
    if (txt.width > 18) txt.setFontSize(6);
    gem.add([gg, txt]);
    this.miniLoupeDynamicLayer.add(gem);
    this.tweens.add({ targets: gem, alpha: 1, scale: 1, duration: 120 });
    await this.delay(90);

    await new Promise((res) => { this.tweens.add({ targets: this._miniLoupeContainer, y: this._miniLoupeDownY, duration: 140, onComplete: res }); });
    this.tweens.add({ targets: gem, scale: 1.15, duration: 70 });
    await this.delay(80);

    if (result) {
      gg.clear();
      gg.fillStyle(0xffe082, 1);
      gg.lineStyle(1.5, colors.stroke, 1);
      gg.fillPoints(pts, true);
      gg.strokePoints(pts, true);
      this._miniLoupeVerdictText.setText("TRUE").setColor(HEX_GREEN_BRIGHT);
      this._miniLoupeContText.setText("boolean true").setColor(HEX_GREEN_BRIGHT);
    } else {
      this._miniLoupeVerdictText.setText("FALSE").setColor(HEX_GRAY);
      this._miniLoupeContText.setText("boolean false").setColor(HEX_GRAY);
    }
    await this.delay(120);

    await new Promise((res) => { this.tweens.add({ targets: this._miniLoupeContainer, y: this._miniLoupeRestY, duration: 110, onComplete: res }); });
    this.tweens.add({ targets: gem, alpha: 0, duration: 120, delay: 50, onComplete: () => gem.destroy() });
    await this.delay(90);
    await this._dimInstrument(this._miniPrismFrame, false);
    return result;
  }

  /** Runs the honest mini isLetter classification (right instrument). */
  async runMiniPrism(ch, result) {
    await this._dimInstrument(this._miniLoupeFrame, true);
    const cx = (MINI_PRISM_X0 + MINI_PRISM_X1) / 2;
    const displayCh = this._displayChar(ch);
    const family = this.getGemFamily(ch);
    const colors = this.getGemColor(family);

    const gem = this.add.container(cx, this._miniPrismPadY).setAlpha(0).setScale(0.6).setDepth(21);
    const gg = this.add.graphics();
    const pts = this._octPoints(11);
    gg.fillStyle(colors.fill, 1);
    gg.lineStyle(1.5, colors.stroke, 1);
    gg.fillPoints(pts, true);
    gg.strokePoints(pts, true);
    const txt = this.add.text(0, 0, displayCh, { font: "bold 11px Courier New", color: "#0a1428" }).setOrigin(0.5);
    if (txt.width > 18) txt.setFontSize(6);
    gem.add([gg, txt]);
    this.miniPrismDynamicLayer.add(gem);
    this.tweens.add({ targets: gem, alpha: 1, scale: 1, duration: 120 });
    await this.delay(90);

    await new Promise((res) => { this.tweens.add({ targets: this._miniPrismContainer, y: this._miniPrismDownY, duration: 140, onComplete: res }); });
    await this.delay(60);

    if (result) {
      this._miniPrismGlow.clear();
      this._miniPrismGlow.fillStyle(0x4fc3f7, 0.35);
      this._miniPrismGlow.fillPoints(this._miniPrismTriPts, true);
      gg.clear();
      gg.fillStyle(0x82d4ff, 1);
      gg.lineStyle(1.5, colors.stroke, 1);
      gg.fillPoints(pts, true);
      gg.strokePoints(pts, true);
      this._miniPrismVerdictText.setText("TRUE").setColor(HEX_GREEN_BRIGHT);
      this._miniPrismContText.setText("boolean true").setColor(HEX_GREEN_BRIGHT);
    } else {
      this._miniPrismVerdictText.setText("FALSE").setColor(HEX_GRAY);
      this._miniPrismContText.setText("boolean false").setColor(HEX_GRAY);
    }
    await this.delay(120);

    this._miniPrismGlow.clear();
    await new Promise((res) => { this.tweens.add({ targets: this._miniPrismContainer, y: this._miniPrismRestY, duration: 110, onComplete: res }); });
    this.tweens.add({ targets: gem, alpha: 0, duration: 120, delay: 50, onComplete: () => gem.destroy() });
    await this.delay(90);
    await this._dimInstrument(this._miniLoupeFrame, false);
    return result;
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
      const text = `${v.type} ${name}=${display}`.slice(0, 36);
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

    this.add.text(20, 14, "THE LETTER TRIALS", { font: "bold 16px Georgia", color: "#b0bec5" }).setDepth(50);
    this.add.text(20, 32, "Tuning Phase — Character Methods: isLetter()", { font: "12px Arial", color: "#546e7a" }).setDepth(50);

    this.waveText = this.add.text(640, 18, "WAVE 1 / 3", { font: "bold 16px Georgia", color: HEX_BLUE_LETTER }).setOrigin(0.5).setDepth(50);
    this._waveSquares = [];
    for (let i = 0; i < 5; i++) {
      const sq = this.add.rectangle(640 - 44 + i * 22, 42, 10, 10, 0x2a2f36).setDepth(50).setStrokeStyle(1, 0x546e7a);
      this._waveSquares.push(sq);
    }

    this.add.text(1060, 8, "SCORE", { font: "11px Arial", color: "#546e7a" }).setDepth(50);
    this.scoreText = this.add.text(1060, 20, "0", { font: "bold 19px Arial", color: "#ffffff" }).setDepth(50);
    this.comboText = this.add.text(1060, 42, "×1", { font: "bold 14px Arial", color: HEX_GOLD }).setDepth(50);

    this.lifeIcons = [];
    for (let i = 0; i < 3; i++) {
      const lg = this.add.graphics({ x: 1150 + i * 26, y: 24 }).setDepth(50);
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
  // BIT — LETTER INSPECTOR VARIANT (vest + monocle kept, three-zone
  // pin on the lapel, silver classification wand)
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

    // Three-zone classification pin — gold/blue/gray sectors
    const pinG = this.add.graphics();
    const pinCx = -3, pinCy = -9, pinR = 3.2;
    pinG.fillStyle(C_GOLD, 0.9);
    pinG.slice(pinCx, pinCy, pinR, Phaser.Math.DegToRad(-90), Phaser.Math.DegToRad(30), false);
    pinG.fillPath();
    pinG.fillStyle(C_BLUE_LETTER, 0.9);
    pinG.slice(pinCx, pinCy, pinR, Phaser.Math.DegToRad(30), Phaser.Math.DegToRad(150), false);
    pinG.fillPath();
    pinG.fillStyle(C_GRAY, 0.9);
    pinG.slice(pinCx, pinCy, pinR, Phaser.Math.DegToRad(150), Phaser.Math.DegToRad(270), false);
    pinG.fillPath();
    pinG.lineStyle(0.6, 0x0e1830, 1);
    pinG.strokeCircle(pinCx, pinCy, pinR);

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

    // Silver classification wand — slim rod with a prismatic tip
    const wand = this.add.container(17, 8);
    const wandG = this.add.graphics();
    wandG.lineStyle(1.3, C_SILVER, 0.9);
    wandG.lineBetween(-2, 9, 2, -8);
    wandG.fillStyle(C_BLUE_LETTER, 0.9);
    wandG.fillTriangle(2, -8, 5, -5, -1, -5);
    wand.add(wandG);

    c.add([g, vest, pinG, eye, pupil, monocle, wand, tip]);
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
    await this.bitSay("The Letter Trials, Inspector — every classification timed against the pendulum. The gem swings wide, then narrower, then narrower still. Clamp the chain with a verdict before it stops dead. Letter or not? The prism never lies.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(5000)]); if (!A()) return;
    this.hideBubble();

    this.showTrialOnTicket(["boolean b = Character.isLetter('Q');"], "What is stored in b?");
    this._currentConfig = { revealNote: null };
    this.startPendulumSwing(7000);
    await this.runMiniPrism("Q", true);
    if (!A()) return;
    const a1 = this.createAnnotation(TICKET_CX, TICKET_Y1 + 14, "the classification", HEX_BLUE_GRAY);
    const a2 = this.createAnnotation(PIVOT_X, PIVOT_Y + CHAIN_LEN + 30, "your time, swinging", HEX_BLUE_GRAY);
    const a3 = this.createAnnotation((MINI_PRISM_X0 + MINI_PRISM_X1) / 2, MINI_Y0 - 24, "the verdict, honest", HEX_BLUE_GRAY);
    await this.bitSay("Clamp the chain with a verdict. The first gem is set!");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();
    [a1, a2, a3].forEach((a) => a.destroy());
    this._killPendulumTween();
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
      2: "WAVE 2 — THE THREE ZONES",
      3: "WAVE 3 — DEEP TRACES & BUG HUNT",
    };
    await this.showWaveBanner(banners[waveNumber]);
    if (!this._alive) return;
    if (waveNumber === 2) {
      await this.showBitFeedback("Three zones at speed now, Inspector. Digit, letter, or other — every character falls into one and only one. The combined classifiers fire together this wave.");
    } else if (waveNumber === 3) {
      await this.showBitFeedback("Final swings — traces through loops and two programs where the wrong test snuck through. One trusted !isDigit instead of isLetter; one passed a String where a char was needed.");
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
    g.lineStyle(2, C_BLUE_LETTER, 1);
    g.strokeRoundedRect(-230, -24, 460, 48, 8);
    const t = this.add.text(0, 0, text, { font: "bold 17px Georgia", color: HEX_BLUE_LETTER }).setOrigin(0.5);
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

    this.startPendulumSwing(limit);
  }

  clearRound() {
    this.roundElements.forEach((e) => { if (e && e.destroy) e.destroy(); });
    this.roundElements = [];
    this._bugHuntTokenObjs = [];
    if (this._bugHeaderTween) { this._bugHeaderTween.stop(); this._bugHeaderTween = null; }
  }

  async onPendulumTimeout(config) {
    if (this.gameEnded) return;
    this._pendulumHalted = true;
    this.inputLocked = true;
    this.roundElements.forEach((e) => e.disableInteractive && e.disableInteractive());
    (this._bugHuntTokenObjs || []).forEach((t) => t.disableInteractive());
    this.logAttempt(config, false, null, "timeout", this.roundTimeLimit, 1);
    await this.pendulumStandstill();
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
    await this.clampChain();
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
    this.ticketHeaderText.setText(`LETTER TRIAL — GEM ${this.currentRound + 1}`);
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
    await this.clampChain();
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

  /** Dual-future reveal for this level's two bug shapes. "wrong_test"
   * (R14): the buggy future OVER-counts because !isDigit admits every
   * non-digit, symbols included; the fixed future with isLetter counts
   * precisely. "string_argument" (R15): the buggy future is a straight
   * compile error — isLetter never even runs; the fixed future
   * extracts charAt(0) then classifies honestly. */
  async runDualFutureReveal(config) {
    if (config.tokenRegion === "wrong_test") {
      await this.chalkWriteLine("!isDigit(ch) — true for ALL non-digits", HEX_RED);
      await this.chalkWriteLine('"Hello!" → 6 chars pass', "#e8eaf6");
      await this.chalkWriteLine("prints: Letters: 6", HEX_RED);
      await this.delay(600);
      if (!this._alive) return;
      this.wipeSlate();
      this.clearMiniInstruments();
      this.clearContainerShelf();
      this.updateResultRow(null);
      await this.chalkWriteLine("isLetter(ch) — true for LETTERS only", HEX_GREEN_BRIGHT);
      await this.chalkWriteLine('"Hello!" → 5 letters pass', "#e8eaf6");
      await this.chalkWriteLine("prints: Letters: 5", HEX_GREEN_BRIGHT);
      return;
    }

    if (config.tokenRegion === "string_argument") {
      this.showCompileErrorStamp();
      await this.chalkWriteLine("isLetter(String) ✗", HEX_RED);
      await this.delay(500);
      if (!this._alive) return;
      this.wipeSlate();
      this.clearMiniInstruments();
      this.clearContainerShelf();
      this.updateResultRow(null);
      await this.chalkWriteLine("String → char", HEX_SILVER);
      const result = await this.runMiniPrism("A", true);
      if (!this._alive) return;
      if (result) await this.chalkWriteLine("prints: Valid name", HEX_GREEN_BRIGHT);
      return;
    }

    await this.runReveal(config.lines.filter((l) => !l.trim().startsWith("//")));
  }

  // ══════════════════════════════════════════════════════════════
  // HONEST EVALUATOR — extends L83's cascade with: `&&` (logical AND,
  // reintroduced from L80), Character.isUpperCase (silent preview),
  // an uninitialized declaration (`String zone;`), a bare reassignment
  // generalized to any type, a fully CHAINED braceless if/else-if/else
  // (Round 7), and the N-branch braced if/else-if/.../else block
  // collector (ported from L83, extended to allow a chain with no
  // final else — Round 12).
  // ══════════════════════════════════════════════════════════════

  _splitLogicalAnd(expr) {
    let depth = 0, inQuotes = false;
    for (let i = 0; i < expr.length - 1; i++) {
      const ch = expr[i];
      if ((ch === '"' || ch === "'") && expr[i - 1] !== "\\") inQuotes = !inQuotes;
      if (inQuotes) continue;
      if (ch === "(" || ch === "[") depth++;
      else if (ch === ")" || ch === "]") depth--;
      else if (depth === 0 && ch === "&" && expr[i + 1] === "&") {
        return { left: expr.slice(0, i).trim(), right: expr.slice(i + 2).trim() };
      }
    }
    return null;
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

  _javaToString(value, type) {
    if (type === "double") return Number.isInteger(value) ? `${value}.0` : String(value);
    return String(value);
  }

  async resolveExpr(expr, vars) {
    const t = expr.trim();

    const andSplit = this._splitLogicalAnd(t);
    if (andSplit) {
      const l = await this.resolveExpr(andSplit.left, vars);
      if (!l.ok) return l;
      const r = await this.resolveExpr(andSplit.right, vars);
      if (!r.ok) return r;
      return { ok: true, value: Boolean(l.value) && Boolean(r.value), type: "boolean" };
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
      this.updateResultRow("boolean");
      return { ok: true, value: result, type: "boolean" };
    }

    const isLetterMatch = t.match(/^Character\.isLetter\((.+)\)$/);
    if (isLetterMatch) {
      const argRes = await this.resolveExpr(isLetterMatch[1].trim(), vars);
      if (!argRes.ok) return argRes;
      if (argRes.type !== "char") { this.showCompileErrorStamp(); return { ok: false, crash: "compile" }; }
      const result = /[A-Za-z]/.test(argRes.value);
      await this.runMiniPrism(argRes.value, result);
      this.updateResultRow("boolean");
      return { ok: true, value: result, type: "boolean" };
    }

    const isUpperCaseMatch = t.match(/^Character\.isUpperCase\((.+)\)$/);
    if (isUpperCaseMatch) {
      const argRes = await this.resolveExpr(isUpperCaseMatch[1].trim(), vars);
      if (!argRes.ok) return argRes;
      if (argRes.type !== "char") { this.showCompileErrorStamp(); return { ok: false, crash: "compile" }; }
      const result = /[A-Z]/.test(argRes.value);
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

    const declVarNoInit = line.match(/^(int|double|String|boolean|char)\s+(\w+);$/);
    if (declVarNoInit) {
      vars[declVarNoInit[2]] = { value: undefined, type: declVarNoInit[1], kind: "scalar" };
      return { ok: true };
    }

    const incrMatch = line.match(/^(\w+)\+\+;$/);
    if (incrMatch) {
      const v = vars[incrMatch[1]];
      if (v) v.value = v.value + 1;
      return { ok: true };
    }

    const reassign = line.match(/^(\w+)\s*=\s*(.*);$/);
    if (reassign) {
      const name = reassign[1], rhs = reassign[2].trim();
      if (!(name in vars)) { this.showCompileErrorStamp(); return { ok: false, crash: "compile" }; }
      const r = await this.resolveExpr(rhs, vars);
      if (!r.ok) return r;
      if (vars[name].type !== r.type) { this.showCompileErrorStamp(); return { ok: false, crash: "compile" }; }
      vars[name].value = r.value;
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

  /** Index-scans for:
   *   for (int i = INIT; COND; i++) { ... }
   *   if (...) { ... } [else if (...) { ... }]* [else { ... }]  — an
   *     arbitrary-length branch chain, with or without a final else.
   *   if (COND) STMT; [else if (COND) STMT;]* [else STMT;]  — a fully
   *     CHAINED braceless form, gated the same way (only one branch
   *     runs), needed because Round 7 assigns the same variable in
   *     every branch.
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

      const braceStart = line.match(/^if\s*\((.+)\)\s+(\S.*;)$/);
      if (braceStart && !line.includes("{")) {
        const branches = [{ cond: braceStart[1].trim(), stmt: braceStart[2].trim() }];
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
    if (remaining > 0.6) { points += 50; this.fastBonusCount++; this.createFloatingText(TICKET_CX, TICKET_Y0 - 14, "⚡ CAUGHT SWINGING +50", HEX_GOLD, "bold 15px Arial", 900); }
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

  advanceRound() {
    this.clearRound();
    const next = this.currentRound + 1;
    if (next >= ROUNDS.length) { this.levelComplete(); return; }
    const nextConfig = ROUNDS[next];
    if (nextConfig.wave !== this.currentWave) {
      this.regeneratePendulum().then(() => { if (this._alive && !this.gameEnded) this.startWave(nextConfig.wave); });
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
      this._pendulumHalted = true;
      this._pendulumStandstillDone = true;
      this.chainGfx.clear();
      const motes = this.ambient;
      this.ambient = null;
      (motes || []).forEach((m) => this.tweens.add({ targets: m, y: 632, alpha: 0, duration: 1500, ease: "Sine.easeIn" }));

      // Chain snaps — gem drops and shatters
      this.gemContainer.setVisible(false);
      for (let i = 0; i < 12; i++) {
        const frag = this.add.circle(this._pendulumX, this._pendulumY, Phaser.Math.Between(2, 4), C_SILVER, 0.7).setDepth(16);
        this.tweens.add({ targets: frag, y: frag.y + Phaser.Math.Between(60, 120), x: frag.x + Phaser.Math.Between(-40, 40), alpha: 0, duration: 700, ease: "Cubic.easeIn" });
      }
      this.screenShake(0.006, 250);

      const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
      this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });
      const title = this.add.text(640, 240, "SWING HALTED", { font: "bold 36px Georgia", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
      this.tweens.add({ targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut", onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }) });
      this.add.text(640, 310, `Score: ${this.score}`, { font: "21px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
      this.add.text(640, 350, `Trials Graded: ${this.currentRound} / 15`, { font: "18px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);
      this._makeButton(525, 420, "RESTART THE PENDULUM", 200, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
      this._makeButton(755, 420, "RETURN TO MENU", 200, 50, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.start("MenuScene"));
    })();
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearRound();
    this.hideBubble();

    try { GameManager.completeLevel(83, Math.round((this.correctFirstTry / 15) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("character_isLetter_tuned"); } catch (_) {}
    try {
      localStorage.setItem("level84_results", JSON.stringify({
        level: 84, concept: "character_isLetter", phase: "tuning",
        score: this.score, accuracy: this.correctFirstTry / 15, avgTimePct: this.totalTimePctUsed / 15,
        fastBonuses: this.fastBonusCount, comboMax: this.maxCombo, stars: this._starRating(),
        livesRemaining: this.lives, attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.trialsFinale().then(() => { if (this._alive) this.showScoreTally(); });
  }

  async trialsFinale() {
    this.resetGemForRound();
    // the pendulum surges into a wide, luminous swing
    const state = { v: 0 };
    this._pendulumHalted = false;
    this._pendulumStandstillDone = false;
    this._pendulumStartTime = this.time.now;
    await new Promise((res) => {
      this.tweens.add({
        targets: state, v: 1, duration: 500, ease: "Sine.easeOut",
        onUpdate: () => { this._pendulumAmpFrac = state.v; this.updatePendulumSwing(this.time.now); },
        onComplete: res,
      });
    });
    this._pendulumHalted = true;

    // triumphant full-body glow with a comet trail
    this._gemGfx.clear();
    this._gemGfx.fillStyle(0x82d4ff, 1);
    this._gemGfx.fillPoints(this._gemPts, true);
    this._gemGfx.lineStyle(3, C_BLUE_LETTER, 1);
    this._gemGfx.strokePoints(this._gemPts, true);
    for (let i = 0; i < 4; i++) {
      const ang = i * 90;
      const ray = this.add.rectangle(this._pendulumX, this._pendulumY, 3, 40, C_BLUE_LETTER, 0.6).setDepth(13).setAngle(ang);
      this.tweens.add({ targets: ray, alpha: 0, scaleY: 1.6, duration: 350, onComplete: () => ray.destroy() });
    }
    this.chainGfx.clear();
    this.chainGfx.lineStyle(2, C_GOLD, 1);
    this.chainGfx.lineBetween(PIVOT_X, PIVOT_Y, this._pendulumX, this._pendulumY);

    // three-zone chart illuminates fully
    if (this._zoneChartLabels) this.tweens.add({ targets: this._zoneChartLabels, alpha: 1, duration: 400 });

    // both instruments fire together in celebration
    await Promise.all([this.runMiniLoupe("9", 57, true), this.runMiniPrism("A", true)]);

    this.screenShake(0.003, 150);
    this.createConfetti(this._pendulumX, this._pendulumY, 40);
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

    const title = this.add.text(640, 190, "LETTERS GRADED", { font: "bold 32px Georgia", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(91).setScale(0);
    this.tweens.add({ targets: title, scale: 1, duration: 350, ease: "Back.easeOut" });

    const acc = Math.round((this.correctFirstTry / 15) * 100);
    const avgSec = (this.totalTimeMs / 15 / 1000).toFixed(1);
    const lines = [
      `ACCURACY: ${acc}%`,
      `AVG RESPONSE: ${avgSec}s`,
      `CAUGHT-SWINGING BONUSES: ${this.fastBonusCount}`,
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
    bg.lineStyle(3, C_BLUE_LETTER, 1);
    bg.strokeCircle(0, 0, 30);
    const bgpts = [];
    for (let a = 0; a < 8; a++) { const ang = (Math.PI / 4) * a; bgpts.push({ x: Math.cos(ang) * 8, y: -4 + Math.sin(ang) * 8 }); }
    bg.fillStyle(C_BLUE_LETTER, 0.85);
    bg.fillPoints(bgpts, true);
    badge.add(bg);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 2100 });
    const badgeLbl = this.add.text(640, 520, "isLetter() SCHEMA TUNED", { font: "bold 15px Georgia", color: HEX_BLUE_LETTER }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: badgeLbl, alpha: 1, duration: 300, delay: 2250 });

    this._makeButton(500, 555, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(770, 555, "NEXT: The Alphabet Works →", 300, 44, { fill: 0x00733a, stroke: C_GREEN_BRIGHT, textColor: "#ffffff" }, () => {
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
