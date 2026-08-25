/**
 * Level 81 — "The Numeral Trials" (Character Wing: Tuning Phase —
 * Character.isDigit())
 * ===========================================================================
 * Tunes the L80 isDigit() schema through rapid-fire fluency trials. A
 * scoring line advancing across a display gem IS the timer — reused from
 * L69/L72/L75/L78's linear-tween-driven visual-timer lineage, re-skinned
 * as a diamond-scoring cut. The reveal stage hosts a compact L80
 * Classification Loupe at 55% scale, running the honest verdict for
 * every isDigit call.
 *
 * SPEC BUGS caught by hand-tracing every round before any code was
 * written, per the established discipline:
 *
 *  1. Round 10 (`Character.isDigit(5)`): the spec marked
 *     `correct: "true_but_surprising"` — a vague option whose label
 *     ("Compiles — but isDigit checks the CHAR with code 5, not '5'")
 *     never actually states the boolean value — while marking the
 *     literal `"false"` option WRONG (tag `int_5_not_digit_belief`).
 *     But the round's OWN revealNote text states plainly: "isDigit(5)
 *     returns FALSE because code-5 is not a digit character." Direct
 *     trace confirms this: Java's Character.isDigit accepts an int code
 *     point directly (an overload added for Unicode supplementary
 *     characters) — passing 5 checks code point 5 (the ENQ control
 *     character), which is not in the digit range 48–57, so the call
 *     compiles and evaluates to false. The spec's own explanation and
 *     its own "correct" answer contradicted each other. Fixed by making
 *     the literal `"false"` option correct (with a label that states
 *     the mechanism), and reclassifying the vague option out.
 *
 *  2. Round 6's fourth option (`{ value: "true", tag:
 *     "isDigit_returns_belief" }`) referenced a misconception tag never
 *     defined in the feedback map, AND is thematically incoherent —
 *     the round's source (`int n = ch; println(n);`) never calls
 *     isDigit at all, so a boolean "true" distractor has no plausible
 *     origin. Replaced with a distractor that actually belongs to this
 *     round's real confusion: printing the character face instead of
 *     its stored code.
 *
 *  3. Roughly a dozen misconception tags were referenced by rounds'
 *     options/bug hunts but never defined in the feedback map (would
 *     have silently fallen back to a generic "Not quite" message,
 *     losing the level's whole point — specific per-misconception
 *     feedback). Added entries for all of them. Also generalized three
 *     entries reused from L80's own map that named L80-specific
 *     variables/strings ("Hi5", "code") which would have been
 *     confusingly wrong when shown against THIS level's different
 *     examples ("R2D2", "input") — reworded to be example-agnostic.
 *
 * New evaluator vocabulary beyond L80's cascade (all needed for char
 * arithmetic, first introduced this level):
 *  - `_stripOuterParens` (reused from L76/79) — needed for Round 9's
 *    `(char)('0' + 5)`, whose argument is itself parenthesized.
 *  - A `(char)` cast, paralleling L76's `(int)` cast.
 *  - CRITICAL FIX caught by hand-tracing Round 7 and Round 9 before
 *    writing the evaluator: char operands in +/- arithmetic must
 *    promote through their CODE POINT (`charCodeAt(0)`), never through
 *    `Number(charAsString)`. The two coincidentally agree for
 *    digit-minus-digit (`'7' - '0'`: both methods give 7) but diverge
 *    everywhere else — `'0' + 5` under the naive Number() approach
 *    gives 0+5=5, then `(char)5` is the ENQ control character, not
 *    '5' (which needs code 48+5=53). Fixed by converting BOTH operands
 *    through a `toNum(value, type)` helper that reads `charCodeAt(0)`
 *    for char operands before adding — matching Java's real promotion
 *    rule (char + int → int, computed on code points). This was
 *    caught in design, before any evaluator code was written, exactly
 *    the class of bug this session's hand-tracing discipline exists
 *    to prevent.
 *  - `int n = ch;` (implicit char→int widening in a declaration) —
 *    new special case in declVar, storing the char's code point.
 *  - `Character.isDigit(int)` — Round 10's edge case: the gate now
 *    accepts either a char (via charCodeAt) or an already-int code
 *    point, matching Java's real overload/auto-widening.
 *  - Escape character literals `'\n'`, `'\t'`, `'\0'` — parsed to
 *    their real single-character values before the generic single-char
 *    literal check (which would otherwise reject the two-character
 *    `\n` token as an "invalid multi-character literal").
 *  - `_splitMultiplicative` (reused from L76/79) — Round 12's
 *    `num * 2`, the first multiplication in the Character Wing.
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

// Classification ticket (trial content area)
const TICKET_X0 = 230, TICKET_X1 = 690, TICKET_Y0 = 100, TICKET_Y1 = 420;
const TICKET_CX = (TICKET_X0 + TICKET_X1) / 2;
// Display gem + scoring line (hero timer)
const GEM_CX = 820, GEM_CY = 260, GEM_W = 100, GEM_H = 120;
const GEM_X0 = GEM_CX - GEM_W / 2, GEM_X1 = GEM_CX + GEM_W / 2;
// Mini classification loupe (reveal stage, 55% scale)
const MINI_X0 = 940, MINI_X1 = 1220, MINI_Y0 = 90, MINI_Y1 = 320;
// Trial slate / container shelf
const SLATE_X = 940, SLATE_Y = 335, SLATE_W = 280, SLATE_H = 130;
const SHELF_X = 940, SHELF_Y = 480, SHELF_W = 280, SHELF_H = 100;

const TUTORIAL_KEY = "level81_tutorial_done";
const WAVE_TIME = { 1: 12000, 2: 10000, 3: 9000 };

// ══════════════════════════════════════════════════════════════
// ROUND CONFIGURATION
// ══════════════════════════════════════════════════════════════
const ROUNDS = [
  // ══ WAVE 1 — Rapid Classifications (12s) ══
  { round: 1, wave: 1, type: "predict",
    source: "boolean b = Character.isDigit('4');",
    question: "What is stored in b?", correct: "true",
    options: [
      { value: "true", tag: null },
      { value: "false", tag: "digit_not_recognized" },
      { value: "4", tag: "isDigit_returns_int_belief" },
      { value: "error", tag: "isDigit_crashes_belief", label: "Error" },
    ],
    concept: "fluent_digit_true" },

  { round: 2, wave: 1, type: "predict",
    source: "boolean b = Character.isDigit('M');",
    question: "What is stored in b?", correct: "false",
    options: [
      { value: "false", tag: null },
      { value: "true", tag: "letter_is_digit_belief" },
      { value: "error", tag: "isDigit_crashes_on_letter_belief", label: "Error" },
      { value: "77", tag: "isDigit_returns_ascii_belief" },
    ],
    concept: "fluent_letter_false" },

  { round: 3, wave: 1, type: "predict",
    source: "boolean b = Character.isDigit('!');",
    question: "What is stored in b?", correct: "false",
    options: [
      { value: "false", tag: null },
      { value: "true", tag: "punctuation_is_digit_belief" },
      { value: "33", tag: "isDigit_returns_ascii_belief" },
      { value: "error", tag: "isDigit_crashes_belief", label: "Error" },
    ],
    concept: "fluent_punct_false" },

  { round: 4, wave: 1, type: "predict",
    source: "char ch = '0';\nSystem.out.println(Character.isDigit(ch));",
    question: "What prints?", correct: "true",
    options: [
      { value: "true", tag: null },
      { value: "false", tag: "zero_not_digit_belief" },
      { value: "0", tag: "isDigit_returns_char_belief" },
      { value: "48", tag: "isDigit_returns_ascii_belief" },
    ],
    concept: "fluent_zero_digit" },

  { round: 5, wave: 1, type: "predict",
    source: 'String s = "R2D2";\nSystem.out.println(Character.isDigit(s.charAt(1)));',
    question: "What prints?", correct: "true",
    options: [
      { value: "true", tag: null },
      { value: "false", tag: "charAt_wrong_index_belief" },
      { value: "2", tag: "isDigit_returns_char_belief" },
      { value: "error", tag: "charAt_isDigit_crashes_belief", label: "Error" },
    ],
    revealNote: "s.charAt(1) → '2' (the second character, index 1). isDigit('2') → true. The loop-extract-classify pattern at speed: charAt extracts the gem, isDigit classifies it.",
    concept: "fluent_charAt_isDigit" },

  // ══ WAVE 2 — The Char Edge (10s) ══
  { round: 6, wave: 2, type: "predict",
    source: "char ch = '5';\nint n = ch;\nSystem.out.println(n);",
    question: "What prints?", correct: "53",
    options: [
      { value: "53", tag: null, label: "53 (ASCII code of '5')" },
      { value: "5", tag: "char_is_its_number_belief" },
      { value: "error", tag: "char_to_int_crashes_belief", label: "Error" },
      { value: "'5'", tag: "int_prints_as_char_belief", label: "'5' (the character)" },
    ],
    revealNote: "THE TRAP: assigning a char to an int gives the ASCII CODE, not the numeric value. '5' has code 53 (not 5). To get the numeric value from a digit char: ch - '0' (53 - 48 = 5). The gem's ENCODING is not its LABEL.",
    concept: "char_ascii_code" },

  { round: 7, wave: 2, type: "predict",
    source: "char ch = '7';\nint val = ch - '0';\nSystem.out.println(val);",
    question: "What prints?", correct: "7",
    options: [
      { value: "7", tag: null },
      { value: "55", tag: "subtraction_gives_ascii_belief" },
      { value: "0", tag: "char_subtraction_zero_belief" },
      { value: "error", tag: "char_arithmetic_crashes_belief", label: "Error" },
    ],
    revealNote: "The TRICK: ch - '0' extracts the numeric value from a digit char. '7' has code 55; '0' has code 48; 55 - 48 = 7. This is how you convert a SINGLE digit char to its int value — not parseInt (which takes Strings), not casting (which gives ASCII).",
    concept: "char_minus_zero" },

  { round: 8, wave: 2, type: "predict",
    source: "boolean b = Character.isDigit('\\n');",
    question: "What is stored in b?", correct: "false",
    options: [
      { value: "false", tag: null },
      { value: "true", tag: "newline_is_digit_belief" },
      { value: "error", tag: "escape_char_crashes_belief", label: "Error" },
      { value: "10", tag: "isDigit_returns_ascii_belief" },
    ],
    revealNote: "The newline character '\\n' is whitespace, not a digit. It's invisible — code 10 — but isDigit sees it clearly: not a digit. Control characters never pass the digit test.",
    concept: "edge_newline" },

  { round: 9, wave: 2, type: "predict",
    source: "char ch = (char)('0' + 5);\nSystem.out.println(ch);",
    question: "What prints?", correct: "5",
    options: [
      { value: "5", tag: null, label: "5 (the character '5')" },
      { value: "53", tag: "char_prints_code_belief" },
      { value: "48", tag: "char_ignores_addition_belief" },
      { value: "error", tag: "char_arithmetic_crashes_belief", label: "Error" },
    ],
    revealNote: "Char arithmetic in reverse: '0' (code 48) + 5 = 53, then (char) 53 = '5'. You can BUILD a digit char from an int: (char)('0' + n). This is the reverse of ch - '0'. Char ↔ int is a two-way bridge through the '0' offset.",
    concept: "char_plus_zero" },

  { round: 10, wave: 2, type: "predict",
    source: "boolean b = Character.isDigit(5);",
    question: "What is stored in b?", correct: "false",
    options: [
      { value: "false", tag: null, label: "false — int 5 is code point 5 (ENQ), not the digit '5'" },
      { value: "true", tag: "int_5_is_digit_5_belief", label: "true — 5 is a digit" },
      { value: "compile_error", tag: "isDigit_rejects_int_belief", label: "COMPILE ERROR" },
      { value: "5", tag: "isDigit_returns_int_belief" },
    ],
    revealNote: "SUBTLE: Character.isDigit accepts an int code point directly (Java auto-widens char to int, and also has a direct int-codePoint overload). The int 5 is treated as Unicode code point 5 — the ENQ control character — which is NOT '5' (code point 53). isDigit(5) returns FALSE because code point 5 is a control character, not the digit five. The int 5 ≠ the char '5'. This is the deepest char/int confusion.",
    concept: "edge_int_as_char" },

  // ══ WAVE 3 — Deep Traces & Bug Hunt ══
  { round: 11, wave: 3, type: "trace",
    source: 'String pin = "1A3B";\nint count = 0;\nfor (int i = 0; i < pin.length(); i++) {\n    if (Character.isDigit(pin.charAt(i))) {\n        count++;\n    }\n}\nSystem.out.println(count);',
    question: "What prints?", correct: "2",
    options: [
      { value: "2", tag: null },
      { value: "4", tag: "all_chars_are_digits_belief" },
      { value: "0", tag: "loop_doesnt_count_belief" },
      { value: "error", tag: "loop_crashes_belief", label: "Error" },
    ],
    revealNote: "The loop walks '1', 'A', '3', 'B': isDigit true, false, true, false. Two digits counted. The wing's signature pattern: loop, extract with charAt, classify with isDigit, count with if.",
    concept: "trace_digit_counter" },

  { round: 12, wave: 3, type: "trace",
    source: "char ch = '8';\nif (Character.isDigit(ch)) {\n    int num = ch - '0';\n    System.out.println(num * 2);\n}",
    question: "What prints?", correct: "16",
    options: [
      { value: "16", tag: null },
      { value: "106", tag: "ascii_times_two_belief", label: "106 (53 × 2)" },
      { value: "8", tag: "no_doubling_belief" },
      { value: "error", tag: "char_minus_zero_crashes_belief", label: "Error" },
    ],
    revealNote: "Classify THEN extract: isDigit('8') → true (guard). ch - '0' = 56 - 48 = 8 (extract numeric value). 8 × 2 = 16. The pattern: guard with isDigit, convert with ch - '0', compute with the int. Three steps, one pipeline.",
    concept: "trace_classify_then_extract" },

  { round: 13, wave: 3, type: "trace",
    source: 'String s = "X";\nchar ch = s.charAt(0);\nboolean d = Character.isDigit(ch);\nboolean l = Character.isLetter(ch);\nSystem.out.println(d + " " + l);',
    question: "What prints?", correct: "false true",
    options: [
      { value: "false true", tag: null },
      { value: "true false", tag: "letter_is_digit_belief" },
      { value: "false false", tag: "X_is_neither_belief" },
      { value: "error", tag: "isLetter_not_learned_belief", label: "Error — isLetter unknown" },
    ],
    revealNote: "'X' is a letter, not a digit. isDigit → false; isLetter → true. Two loupes, two verdicts — classification methods can be combined. isLetter is the NEXT room's instrument, but it works the same way: static, boolean, char argument, no transformation.",
    concept: "trace_dual_classification" },

  { round: 14, wave: 3, type: "bughunt",
    lines: ['String input = "7";', "if (Character.isDigit(input)) {", '    System.out.println("Valid digit");', "}", "// intent: check if the input is a digit"],
    faultToken: "Character.isDigit(input)", faultLine: 2, tokenRegion: "string_argument",
    fix: "Character.isDigit(input.charAt(0))",
    explanation: "The String argument — isDigit takes a CHAR, not a String. \"7\" is a String (double quotes); input.charAt(0) extracts the char '7' from the String. The loupe examines one gem at a time; you must extract it from the strip first.",
    wrongTag: "isDigit_takes_string_belief",
    revealNote: "Dual-future reveal: the buggy run stamps COMPILE ERROR — 'incompatible types: String cannot be converted to char'. Reset; the fixed run extracts charAt(0) → '7', passes to isDigit → true, prints 'Valid digit'. Bit: 'The loupe takes one gem — charAt extracts it from the strip. String is a strip; char is a gem. Different types, different instruments.'",
    concept: "string_argument_bug" },

  { round: 15, wave: 3, type: "bughunt",
    lines: ["char ch = '5';", "if (Character.isDigit(ch)) {", "    int value = ch;", '    System.out.println("Value: " + value);', "}", "// intent: print \"Value: 5\""],
    faultToken: "int value = ch", faultLine: 3, tokenRegion: "ascii_assignment",
    fix: "int value = ch - '0';",
    explanation: "The ASCII assignment — assigning a char to an int gives the CHARACTER CODE (53 for '5'), not the numeric value (5). The fix: ch - '0' subtracts the code of '0' (48), extracting the actual digit value. 53 - 48 = 5. The gem's encoding is not its label.",
    wrongTag: "char_is_its_number_belief",
    revealNote: "Dual-future reveal: the buggy run prints 'Value: 53' (the ASCII code) — Bit highlights: '53 is the character CODE, not the digit five.' Reset; the fixed run with ch - '0' prints 'Value: 5'. The container shelf shows ch (char '5', code 53) and value (int 5, the subtraction result). Bit: 'The gem wears its label (5) but is encoded with its code (53). Subtract '0' to cross from encoding to meaning.'",
    concept: "ascii_assignment_bug" },
];

const MISCONCEPTION_FEEDBACK = {
  // Reused from L80 (generalized where L80's original text named
  // L80-specific examples that would confuse against this level's
  // different sources).
  isDigit_returns_int_belief: "isDigit returns BOOLEAN — true or false — not the digit's numeric value. The gem's number stays on the gem; the verdict is in the boolean.",
  isDigit_crashes_belief: "isDigit is TOTAL — every char has a valid answer, true or false. No exceptions, ever.",
  letter_is_digit_belief: "Letters are NOT digits — they belong to a different character family entirely. Different family, no glow.",
  isDigit_crashes_on_letter_belief: "isDigit never crashes — it has a valid true/false answer for every char. Letters simply return false.",
  isDigit_returns_ascii_belief: "isDigit returns boolean, not the ASCII code. The gem's encoding is invisible to the verdict — only the classification matters.",
  zero_not_digit_belief: "'0' IS a digit — the first of the ten (0–9). Zero is as valid a digit as nine.",
  isDigit_returns_char_belief: "isDigit returns boolean, not the char that was tested.",
  charAt_wrong_index_belief: "charAt(index) counts from ZERO — the first character is index 0. Recount carefully: which character actually sits at that index?",
  charAt_isDigit_crashes_belief: "charAt on a valid in-range index never crashes, and isDigit never crashes on any char it receives — both are safe, total operations.",
  isDigit_takes_string_belief: "isDigit takes a CHAR, not a String — passing a String argument fails to compile. Extract one character first with charAt(index), then classify it.",

  // New to this level.
  digit_not_recognized: "'4' IS a digit — one of the ten members (0–9). The gem should glow true, not stay dim.",
  punctuation_is_digit_belief: "'!' is punctuation, not a digit. Only '0' through '9' pass the digit test — symbols, no matter how number-adjacent they look, don't count.",
  char_is_its_number_belief: "The digit char '5' has ASCII code 53, not value 5. Assigning char to int gives the CODE. To get the value: ch - '0' (53 - 48 = 5). The gem's label and its encoding are different things.",
  char_to_int_crashes_belief: "Assigning char to int is legal — Java widens char to int automatically. The result is the ASCII code, not a crash.",
  int_prints_as_char_belief: "n is declared int, not char — println shows the NUMBER 53, not the character '5' in quotes. Once a char is assigned into an int variable, only the numeric code remains for printing.",
  subtraction_gives_ascii_belief: "ch - '0' already CANCELS the encoding — it subtracts two codes (55 - 48), leaving the digit's plain numeric value (7), not a raw ASCII code.",
  char_subtraction_zero_belief: "ch - '0' does NOT always give zero — it subtracts the CODE of '0' (48) from ch's own code, extracting the digit's value. For '7' (code 55): 55 - 48 = 7, not 0.",
  char_arithmetic_crashes_belief: "Char arithmetic (+ and - between chars and ints) never crashes — it's ordinary integer math performed on the character codes.",
  newline_is_digit_belief: "'\\n' is a control character (code 10) — invisible whitespace. Not a digit, not a letter, not visible.",
  escape_char_crashes_belief: "Escape characters ('\\n', '\\t', '\\0') are valid chars — isDigit handles them without error. They're just not digits.",
  char_prints_code_belief: "println on a char prints the CHARACTER, not the code. '5' prints as 5, not 53. To see the code, assign it to an int first.",
  char_ignores_addition_belief: "The addition isn't ignored — '0' + 5 computes 48 + 5 = 53 first, then the (char) cast turns 53 back into the character '5'.",
  int_5_is_digit_5_belief: "int 5 is treated as code point 5 (a control character), NOT '5' (code point 53). isDigit(5) is FALSE because code point 5 is not a digit character.",
  isDigit_rejects_int_belief: "isDigit doesn't reject an int argument — it accepts a code point directly. The int 5 compiles fine; it just isn't the digit '5'.",
  all_chars_are_digits_belief: "Only '0'-'9' are digits. Letters, punctuation, whitespace — all false under isDigit.",
  loop_doesnt_count_belief: "The loop DOES count — count++ runs inside the if, once for each char where isDigit is true. Two digits in \"1A3B\" means count reaches 2, not 0.",
  loop_crashes_belief: "The loop is a completely ordinary for-loop over a String's characters — it never crashes. charAt and isDigit both handle every character safely.",
  ascii_times_two_belief: "ch - '0' already extracted the numeric value (8), not the ASCII code (56). The multiplication runs on 8, not 56.",
  no_doubling_belief: "The doubling DOES happen — num * 2 runs after num is extracted (8), giving 16. The multiplication isn't skipped.",
  char_minus_zero_crashes_belief: "ch - '0' never crashes — it's ordinary integer subtraction on two character codes, always producing a valid int.",
  X_is_neither_belief: "'X' IS a letter — isLetter('X') returns true. It's just not a DIGIT.",
  isLetter_not_learned_belief: "isLetter works identically to isDigit — same pattern: static, boolean, char. It classifies letters instead of digits. The next room's instrument, but already functional.",
  timeout: "The gem cleaved! Lift the tool faster — digit verdicts are reflexes now.",
};

export class Level81Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level81Scene" });
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
    this._scoringHalted = true;
  }

  preload() {}

  create() {
    this._alive = true;
    this.createParticleTexture();
    this.createBackground();
    this.createTrialsRoomDressing();
    this.createTrialsBanner();
    this.createParticles();
    this.createClassificationTicket();
    this.createDisplayGem();
    this.createMiniLoupe();
    this.createTrialSlate();
    this.createContainerShelf();
    this.createHUD();
    this.createBit();

    this.events.on("shutdown", () => { this._alive = false; this._killScoringTween(); });
    this.checkTutorial();
  }

  update(time, delta) {
    this.updateParticles(time, delta);
    this.updateScoringLine(time);
    this.updateScoringUrgency(time);
    this.updateGemVibration(time);
    this.updateFractures(time);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // SETUP — NUMERAL TRIALS ROOM DRESSING
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l81_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l81_dot", 8, 8);
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

    // Char specimen case (left wall)
    g.lineStyle(2, C_SILVER, 1);
    g.fillStyle(0x081224, 1);
    g.fillRect(60, 150, 80, 160);
    g.strokeRect(60, 150, 80, 160);
    const rows = [{ y: 185, color: C_GOLD }, { y: 230, color: C_BLUE_LETTER }, { y: 275, color: C_GRAY }];
    rows.forEach((row) => {
      for (let i = 0; i < 3; i++) {
        const cx = 80 + i * 20;
        const pts = [];
        for (let a = 0; a < 6; a++) {
          const ang = (Math.PI / 3) * a;
          pts.push({ x: cx + Math.cos(ang) * 7, y: row.y + Math.sin(ang) * 7 });
        }
        g.fillStyle(row.color, 0.3);
        g.fillPoints(pts, true);
      }
    });

    // Scoring tool display (right wall)
    g.lineStyle(1.5, C_SILVER, 0.5);
    g.strokeCircle(1180, 130, 26);
    g.lineStyle(2, C_SILVER, 0.7);
    g.lineBetween(1170, 140, 1190, 118);
    g.fillStyle(C_SILVER, 0.8);
    g.fillCircle(1190, 118, 2);

    this.createTrialsBanner();
  }

  createTrialsBanner() {
    const g = this.add.graphics().setDepth(2);
    g.fillStyle(0x081224, 1);
    g.lineStyle(1, C_SILVER, 0.5);
    g.fillRoundedRect(460, 12, 360, 26, 3);
    g.strokeRoundedRect(460, 12, 360, 26, 3);
    this.add.text(640, 25, "T H E   N U M E R A L   T R I A L S", { font: "bold 14px Georgia", color: HEX_SILVER }).setOrigin(0.5).setAlpha(0.7).setDepth(3);
  }

  createParticles() {
    this.ambient = [];
    const colors = [C_INDIGO, C_SILVER, C_CYAN];
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
    const p = this.add.particles(x, y, "l81_dot", {
      speed: { min: 80, max: 240 }, angle: { min: 0, max: 360 }, scale: { start: 0.9, end: 0 }, lifespan: 500,
      tint: [C_GOLD, C_SILVER, C_INDIGO, 0xffffff], emitting: false,
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
    this.ticketHeaderText.setText(`NUMERAL TRIAL — GEM ${this.currentRound + 1}`);
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
    const re = /("(?:[^"\\]|\\.)*")|('(?:[^'\\]|\\.)*')|(\bint\b|\bdouble\b|\bString\b|\bboolean\b|\bchar\b|\bif\b|\belse\b|\bfor\b)|(\bCharacter\b|\bInteger\b)|(\.isDigit\b|\.isLetter\b|\.charAt\b|\.length\b|\.println\b)|(\bSystem\.out\b)|(-?\d+\.?\d*)|(&&|\+\+|==|>=|<=|[(){}\[\];.,=+*/<>-])/g;
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
    const labels = { certified: "CLASSIFIED", misjudged: "MISCLASSIFIED", void: "GEM CLEAVED" };
    const colors = { certified: HEX_GREEN_BRIGHT, misjudged: HEX_RED, void: HEX_RED };
    const stamp = this.add.text(0, 0, labels[kind], { font: "bold 21px Georgia", color: colors[kind] }).setOrigin(0.5).setScale(1.4).setAngle(-8).setAlpha(0);
    this.ticketStampLayer.add(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 180 });
    const hold = kind === "void" ? 1800 : 700;
    await this.delay(hold);
    if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 200, onComplete: () => stamp.destroy() });
  }

  // ══════════════════════════════════════════════════════════════
  // THE DISPLAY GEM + SCORING LINE (THE TIMER — hero mechanic): a
  // linear tween drives a scoring line's x-position from the gem's
  // left edge to its right edge, exactly like L69's sand column /
  // L72's pressure gauge / L75's burette / L78's wax seal, re-skinned
  // as a diamond-scoring cut advancing toward cleave.
  // ══════════════════════════════════════════════════════════════

  createDisplayGem() {
    const standG = this.add.graphics().setDepth(9);
    standG.fillStyle(C_SILVER, 0.3);
    standG.fillRect(GEM_CX - 20, GEM_CY + GEM_H / 2, 40, 8);

    this._gemPts = this._hexPoints(GEM_W / 2, GEM_H / 2);
    this.gemContainer = this.add.container(GEM_CX, GEM_CY).setDepth(10);
    const gemG = this.add.graphics();
    gemG.fillStyle(0x1565c0, 1);
    gemG.fillPoints(this._gemPts, true);
    gemG.fillStyle(0x4fc3f7, 0.25);
    gemG.fillPoints(this._gemPts.map((p) => ({ x: p.x * 0.55, y: p.y * 0.55 - 8 })), true);
    gemG.lineStyle(3, C_SILVER, 1);
    gemG.strokePoints(this._gemPts, true);
    gemG.lineStyle(1, 0xe8eaf6, 0.12);
    gemG.lineBetween(-GEM_W / 4, -GEM_H / 2, GEM_W / 4, GEM_H / 2);
    gemG.lineBetween(GEM_W / 4, -GEM_H / 2, -GEM_W / 4, GEM_H / 2);
    gemG.lineBetween(0, -GEM_H / 2, 0, GEM_H / 2);
    this.gemContainer.add(gemG);
    this._gemGfx = gemG;

    this.scoringLineGfx = this.add.graphics().setDepth(12);

    this._scoringProgress = 0;
    this._scoringUrgency = "safe";
    this._toolLiftOffset = 0;
    this._cleaved = false;
    this._lastFractureSpawn = 0;
  }

  _hexPoints(rx, ry) {
    return [
      { x: -rx, y: 0 }, { x: -rx / 2, y: -ry }, { x: rx / 2, y: -ry },
      { x: rx, y: 0 }, { x: rx / 2, y: ry }, { x: -rx / 2, y: ry },
    ];
  }

  updateScoringLine(time) {
    if (!this.scoringLineGfx || this._cleaved) { if (this.scoringLineGfx) this.scoringLineGfx.clear(); return; }
    const progress = this._scoringProgress || 0;
    this.scoringLineGfx.clear();
    const lineX = GEM_X0 + (GEM_X1 - GEM_X0) * progress;
    const jitter = this._scoringUrgency === "critical" && !this._scoringHalted ? Phaser.Math.Between(-1, 1) : 0;
    this.scoringLineGfx.lineStyle(6, C_RED, 0.15);
    this.scoringLineGfx.lineBetween(lineX + jitter, GEM_CY - GEM_H / 2, lineX + jitter, GEM_CY + GEM_H / 2);
    this.scoringLineGfx.lineStyle(2, C_RED, 1);
    this.scoringLineGfx.lineBetween(lineX + jitter, GEM_CY - GEM_H / 2, lineX + jitter, GEM_CY + GEM_H / 2);
    const tipColor = this._scoringUrgency === "critical" ? 0xffffff : C_RED;
    this.scoringLineGfx.fillStyle(tipColor, 0.95);
    this.scoringLineGfx.fillCircle(lineX + jitter, GEM_CY - GEM_H / 2 + (this._toolLiftOffset || 0), 4);
  }

  updateScoringUrgency(time) {
    if (this._scoringProgress === undefined) return;
    const rem = 1 - this._scoringProgress;
    const state = rem <= 0.15 ? "critical" : rem <= 0.33 ? "warning" : "safe";
    this._scoringUrgency = state;
  }

  updateGemVibration(time) {
    if (!this.gemContainer) return;
    if (this._scoringUrgency === "critical" && !this._scoringHalted && !this._cleaved) {
      this.gemContainer.x = GEM_CX + Phaser.Math.Between(-1, 1);
      this.gemContainer.y = GEM_CY + Phaser.Math.Between(-1, 1);
    } else if (!this._cleaved) {
      this.gemContainer.x = GEM_CX;
      this.gemContainer.y = GEM_CY;
    }
  }

  updateFractures(time) {
    if (this._scoringHalted || this._scoringUrgency === "safe" || this._cleaved) return;
    const interval = this._scoringUrgency === "critical" ? 150 : 320;
    if (time - this._lastFractureSpawn < interval) return;
    this._lastFractureSpawn = time;
    this.spawnFractureLine();
  }

  spawnFractureLine() {
    const progress = this._scoringProgress || 0;
    const lineX = GEM_X0 + (GEM_X1 - GEM_X0) * progress;
    const y = GEM_CY + Phaser.Math.Between(-GEM_H / 2 + 12, GEM_H / 2 - 12);
    const len = Phaser.Math.Between(8, 14);
    const frac = this.add.graphics().setDepth(11).setAlpha(0);
    frac.lineStyle(1, C_RED, 0.3);
    const bx = lineX - Phaser.Math.Between(0, 22);
    frac.lineBetween(bx, y, bx + len, y + Phaser.Math.Between(-5, 5));
    this.roundElements.push(frac);
    this.tweens.add({ targets: frac, alpha: 1, duration: 100 });
  }

  startScoringLine(timeLimitMs) {
    this._killScoringTween();
    this.roundTimeLimit = timeLimitMs;
    this._scoringProgress = 0;
    this._scoringHalted = false;
    this._scoringUrgency = "safe";
    this._toolLiftOffset = 0;
    const state = { v: 0 };
    this._scoringTween = this.tweens.add({
      targets: state, v: 1, duration: timeLimitMs, ease: "Linear",
      onUpdate: () => { this._scoringProgress = state.v; },
      onComplete: () => { if (this._alive && !this._scoringHalted) this.onScoringTimeout(this._currentConfig); },
    });
  }

  _killScoringTween() {
    if (this._scoringTween) { this._scoringTween.stop(); this._scoringTween = null; }
  }

  async liftScoringTool() {
    this._scoringHalted = true;
    this._killScoringTween();
    const obj = { v: this._toolLiftOffset || 0 };
    await new Promise((res) => {
      this.tweens.add({ targets: obj, v: -8, duration: 120, onUpdate: () => { this._toolLiftOffset = obj.v; }, onComplete: res });
    });
  }

  async relievedSparkle() {
    for (let i = 0; i < 4; i++) {
      const spark = this.add.circle(GEM_CX + Phaser.Math.Between(-24, 24), GEM_CY + Phaser.Math.Between(-30, 30), 1.5, 0xe8eaf6, 0.8).setDepth(13);
      this.tweens.add({ targets: spark, alpha: 0, duration: 260, onComplete: () => spark.destroy() });
    }
    await this.delay(80);
  }

  /** Timeout path: the scoring line reaches the gem's far edge and it
   * cleaves — split into two halves that separate laterally. */
  async gemCleaves() {
    this._cleaved = true;
    this.screenShake(0.006, 200);
    const flash = this.add.circle(GEM_X1 - 2, GEM_CY, 8, 0xffffff, 0.9).setDepth(15);
    this.roundElements.push(flash);
    this.tweens.add({ targets: flash, scale: 5, alpha: 0, duration: 300, onComplete: () => flash.destroy() });

    const halfPtsL = this._gemPts.map((p) => ({ x: Math.min(p.x, 0), y: p.y }));
    const halfPtsR = this._gemPts.map((p) => ({ x: Math.max(p.x, 0), y: p.y }));
    const leftG = this.add.graphics();
    leftG.fillStyle(0x1565c0, 0.7);
    leftG.fillPoints(halfPtsL, true);
    leftG.lineStyle(2, C_SILVER, 0.7);
    leftG.strokePoints(halfPtsL, true);
    const rightG = this.add.graphics();
    rightG.fillStyle(0x1565c0, 0.7);
    rightG.fillPoints(halfPtsR, true);
    rightG.lineStyle(2, C_SILVER, 0.7);
    rightG.strokePoints(halfPtsR, true);
    const leftC = this.add.container(GEM_CX, GEM_CY).setDepth(10);
    leftC.add(leftG);
    const rightC = this.add.container(GEM_CX, GEM_CY).setDepth(10);
    rightC.add(rightG);
    this.roundElements.push(leftC, rightC);
    this.gemContainer.setVisible(false);
    this.scoringLineGfx.clear();

    this.tweens.add({ targets: leftC, x: GEM_CX - 10, alpha: 0.4, duration: 300 });
    this.tweens.add({ targets: rightC, x: GEM_CX + 10, alpha: 0.4, duration: 300 });

    for (let i = 0; i < 7; i++) {
      const frag = this.add.circle(GEM_CX, GEM_CY, 2, C_SILVER, 0.7).setDepth(16);
      this.roundElements.push(frag);
      this.tweens.add({ targets: frag, x: GEM_CX + Phaser.Math.Between(-40, 40), y: GEM_CY + Phaser.Math.Between(-40, 40), alpha: 0, duration: 400 });
    }
    const stamp = this.add.text(GEM_CX, GEM_CY + GEM_H / 2 + 20, "GEM CLEAVED", { font: "bold 12px Courier New", color: HEX_RED }).setOrigin(0.5).setDepth(17).setAlpha(0);
    this.roundElements.push(stamp);
    this.tweens.add({ targets: stamp, alpha: 0.8, duration: 200 });
    await this.delay(350);
  }

  /** Light reset between rounds WITHIN the same wave (no fanfare). */
  resetGemForRound() {
    this.gemContainer.setVisible(true).setAlpha(1).setScale(1).setPosition(GEM_CX, GEM_CY);
    this._cleaved = false;
    this._scoringUrgency = "safe";
    this._toolLiftOffset = 0;
    if (this.scoringLineGfx) this.scoringLineGfx.clear();
  }

  /** Full regenerate with fanfare — used on WAVE transitions. */
  async regenerateGem() {
    this.resetGemForRound();
    this.gemContainer.setAlpha(0).setScale(0.5);
    await new Promise((res) => { this.tweens.add({ targets: this.gemContainer, alpha: 1, scale: 1, duration: 300, ease: "Back.easeOut", onComplete: res }); });
    for (let i = 0; i < 4; i++) {
      const spark = this.add.circle(GEM_CX + Phaser.Math.Between(-20, 20), GEM_CY + Phaser.Math.Between(-20, 20), 1.5, 0xe8eaf6, 0.7).setDepth(13);
      this.tweens.add({ targets: spark, alpha: 0, duration: 250, onComplete: () => spark.destroy() });
    }
    await this.delay(150);
  }

  // ══════════════════════════════════════════════════════════════
  // THE MINI CLASSIFICATION LOUPE (reveal apparatus, ~55% scale) —
  // reused from L80's hero mechanic, compacted. Every isDigit call
  // runs the honest inspection: gem materializes, loupe descends,
  // verdict glows or stays dim, loupe rises. No gate, no shortcuts.
  // ══════════════════════════════════════════════════════════════

  createMiniLoupe() {
    const cx = (MINI_X0 + MINI_X1) / 2;
    const frameG = this.add.graphics().setDepth(10);
    frameG.lineStyle(1.5, C_SILVER, 0.5);
    frameG.strokeRoundedRect(MINI_X0, MINI_Y0, MINI_X1 - MINI_X0, MINI_Y1 - MINI_Y0, 6);
    this.add.text(cx, MINI_Y0 - 10, "CLASSIFICATION LOUPE", { font: "bold 10px Georgia", color: HEX_SILVER }).setOrigin(0.5).setDepth(11).setAlpha(0.6);

    this.miniDynamicLayer = this.add.container(0, 0).setDepth(20);
    this._miniPadY = MINI_Y0 + 55;
    this._miniLoupeRestY = MINI_Y0 + 22;
    this._miniLoupeDownY = this._miniPadY;

    this._miniLoupeContainer = this.add.container(cx, this._miniLoupeRestY).setDepth(25);
    const lg = this.add.graphics();
    lg.lineStyle(2, C_SILVER, 1);
    lg.fillStyle(0x0a1428, 0.5);
    lg.fillCircle(0, 0, 26);
    lg.strokeCircle(0, 0, 26);
    this._miniLoupeContainer.add(lg);

    this._miniVerdictText = this.add.text(cx, MINI_Y0 + 115, "", { font: "bold 16px Georgia", color: HEX_GRAY }).setOrigin(0.5).setDepth(24);
    this._miniContText = this.add.text(cx, MINI_Y1 - 30, "boolean —", { font: "bold 11px Courier New", color: HEX_GRAY }).setOrigin(0.5).setDepth(24);
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

  /** Maps a real char value to a displayable glyph — space and the
   * common escapes render as visible symbols instead of invisible
   * (or literally broken) whitespace. */
  _displayChar(ch) {
    if (ch === " ") return "␣";
    if (ch === "\n") return "⏎";
    if (ch === "\t") return "⇥";
    if (ch === "\0") return "∅";
    const code = ch.charCodeAt(0);
    if (code < 32) return `[${code}]`;
    return ch;
  }

  clearMiniLoupe() {
    this.miniDynamicLayer.removeAll(true);
    this._miniVerdictText.setText("").setColor(HEX_GRAY);
    this._miniContText.setText("boolean —").setColor(HEX_GRAY);
    this._miniLoupeContainer.setY(this._miniLoupeRestY);
  }

  /** Runs the honest mini classification. `ch` is the real char value
   * to classify (or null if the call was on a raw int code point);
   * `code` is the numeric code point actually tested; `result` is the
   * honest true/false the evaluator already computed. */
  async runMiniClassification(ch, code, result) {
    const cx = (MINI_X0 + MINI_X1) / 2;
    const displayCh = ch !== null ? this._displayChar(ch) : `[${code}]`;
    const family = ch !== null ? this.getGemFamily(ch) : "other";
    const colors = this.getGemColor(family);

    const gem = this.add.container(cx, this._miniPadY).setAlpha(0).setScale(0.6).setDepth(21);
    const gg = this.add.graphics();
    const pts = [];
    for (let i = 0; i < 8; i++) { const a = (Math.PI / 4) * i; pts.push({ x: Math.cos(a) * 13, y: Math.sin(a) * 13 }); }
    gg.fillStyle(colors.fill, 1);
    gg.lineStyle(1.5, colors.stroke, 1);
    gg.fillPoints(pts, true);
    gg.strokePoints(pts, true);
    const txt = this.add.text(0, 0, displayCh, { font: "bold 12px Courier New", color: "#0a1428" }).setOrigin(0.5);
    if (txt.width > 22) txt.setFontSize(7);
    gem.add([gg, txt]);
    this.miniDynamicLayer.add(gem);
    this.tweens.add({ targets: gem, alpha: 1, scale: 1, duration: 120 });
    await this.delay(100);

    await new Promise((res) => { this.tweens.add({ targets: this._miniLoupeContainer, y: this._miniLoupeDownY, duration: 150, onComplete: res }); });
    this.tweens.add({ targets: gem, scale: 1.15, duration: 80 });
    await this.delay(90);

    if (result) {
      gg.clear();
      gg.fillStyle(0xffe082, 1);
      gg.lineStyle(1.5, colors.stroke, 1);
      gg.fillPoints(pts, true);
      gg.strokePoints(pts, true);
      this._miniVerdictText.setText("TRUE").setColor(HEX_GREEN_BRIGHT);
      this._miniContText.setText("boolean true").setColor(HEX_GREEN_BRIGHT);
      this.screenShake(0.0015, 60);
    } else {
      this._miniVerdictText.setText("FALSE").setColor(HEX_GRAY);
      this._miniContText.setText("boolean false").setColor(HEX_GRAY);
    }
    await this.delay(150);

    await new Promise((res) => { this.tweens.add({ targets: this._miniLoupeContainer, y: this._miniLoupeRestY, duration: 130, onComplete: res }); });
    this.tweens.add({ targets: gem, alpha: 0, duration: 140, delay: 60, onComplete: () => gem.destroy() });
    await this.delay(110);
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
      if (v.type === "String") display = `"${v.value}"`;
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

    this.add.text(20, 14, "THE NUMERAL TRIALS", { font: "bold 16px Georgia", color: "#b0bec5" }).setDepth(50);
    this.add.text(20, 32, "Tuning Phase — Character Methods: isDigit()", { font: "12px Arial", color: "#546e7a" }).setDepth(50);

    this.waveText = this.add.text(640, 18, "WAVE 1 / 3", { font: "bold 16px Georgia", color: HEX_GOLD }).setOrigin(0.5).setDepth(50);
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
  // BIT — GEM INSPECTOR VARIANT (badge, grading chart, monocle kept)
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

    // Silver inspector's badge — shield with tiny loupe icon
    const badgeG = this.add.graphics();
    badgeG.fillStyle(C_SILVER, 0.7);
    badgeG.fillTriangle(-5, -8, 1, -8, -2, -1);
    badgeG.lineStyle(0.8, 0x0e1830, 1);
    badgeG.strokeCircle(-3, -9, 1.6);

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

    // Gem-grading chart card — 3-row color grid
    this.gradingChart = this.add.container(17, 8);
    const chartG = this.add.graphics();
    chartG.fillStyle(0x0e1830, 1);
    chartG.lineStyle(0.8, C_SILVER, 0.8);
    chartG.fillRoundedRect(-4, -9, 8, 14, 1);
    chartG.strokeRoundedRect(-4, -9, 8, 14, 1);
    chartG.fillStyle(C_GOLD, 0.8);
    chartG.fillRect(-3, -7, 6, 3);
    chartG.fillStyle(C_BLUE_LETTER, 0.8);
    chartG.fillRect(-3, -3, 6, 3);
    chartG.fillStyle(C_GRAY, 0.8);
    chartG.fillRect(-3, 1, 6, 3);
    this.gradingChart.add(chartG);

    c.add([g, vest, badgeG, eye, pupil, monocle, gloveL, this.gradingChart, tip]);
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
    await this.bitSay("The Numeral Trials, Inspector — every classification timed against the scoring line. The line advances across the gem; answer before it cleaves. Digit or not? The loupe never lies.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(5000)]); if (!A()) return;
    this.hideBubble();

    this.showTrialOnTicket(["boolean b = Character.isDigit('9');"], "What is stored in b?");
    this._currentConfig = { revealNote: null };
    this.startScoringLine(7000);
    await this.runMiniClassification("9", 57, true);
    if (!A()) return;
    const a1 = this.createAnnotation(TICKET_CX, TICKET_Y1 + 14, "the classification", HEX_BLUE_GRAY);
    const a2 = this.createAnnotation(GEM_CX, GEM_CY + GEM_H / 2 + 40, "your time, scoring", HEX_BLUE_GRAY);
    const a3 = this.createAnnotation((MINI_X0 + MINI_X1) / 2, MINI_Y0 - 24, "the verdict, honest", HEX_BLUE_GRAY);
    await this.bitSay("Lift the tool with a verdict. The first gem is set!");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(4500)]); if (!A()) return;
    this.hideBubble();
    [a1, a2, a3].forEach((a) => a.destroy());
    this._killScoringTween();
    this.clearTicketContent();
    this.wipeSlate();
    this.clearMiniLoupe();
    this.clearContainerShelf();
    this.resetGemForRound();
    this._scoringProgress = 0;

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
      2: "WAVE 2 — THE CHAR EDGE",
      3: "WAVE 3 — DEEP TRACES & BUG HUNT",
    };
    await this.showWaveBanner(banners[waveNumber]);
    if (!this._alive) return;
    if (waveNumber === 2) {
      await this.showBitFeedback("Deeper cuts now, Inspector. Char arithmetic, ASCII codes, and the characters you can't see — newlines, tabs, the null character. Each trial tests one edge of the digit family's boundary. The scoring line won't slow for edge cases.");
    } else if (waveNumber === 3) {
      await this.showBitFeedback("Final scores — traces through loops and two programs where the classification went wrong. One passed a String where a char was needed; one thought a digit char WAS its number. The gem won't wait.");
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
    g.lineStyle(2, C_GOLD, 1);
    g.strokeRoundedRect(-230, -24, 460, 48, 8);
    const t = this.add.text(0, 0, text, { font: "bold 17px Georgia", color: HEX_GOLD }).setOrigin(0.5);
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
    this.clearMiniLoupe();
    this.clearContainerShelf();
    this.updateResultRow(null);
    this.resetGemForRound();
    this.roundStartTime = this.time.now;

    const limit = config.type === "bughunt" ? 12000 : WAVE_TIME[config.wave];
    if (config.type === "predict" || config.type === "trace") this.setupPredict(config);
    else if (config.type === "bughunt") this.setupBugHunt(config);

    this.startScoringLine(limit);
  }

  clearRound() {
    this.roundElements.forEach((e) => { if (e && e.destroy) e.destroy(); });
    this.roundElements = [];
    this._bugHuntTokenObjs = [];
    if (this._bugHeaderTween) { this._bugHeaderTween.stop(); this._bugHeaderTween = null; }
  }

  async onScoringTimeout(config) {
    if (this.gameEnded) return;
    this._scoringHalted = true;
    this.inputLocked = true;
    this.roundElements.forEach((e) => e.disableInteractive && e.disableInteractive());
    (this._bugHuntTokenObjs || []).forEach((t) => t.disableInteractive());
    this.logAttempt(config, false, null, "timeout", this.roundTimeLimit, 1);
    await this.gemCleaves();
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
    const positions = [[365, 568], [605, 568], [365, 624], [605, 624]];
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
    await this.liftScoringTool();
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
    this.ticketHeaderText.setText(`NUMERAL TRIAL — GEM ${this.currentRound + 1}`);
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
    await this.liftScoringTool();
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

  /** Dual-future reveal for this level's two bug shapes. "string_
   * argument" (R14): the buggy future is a straight compile error —
   * isDigit never even runs; the fixed future extracts charAt(0) then
   * classifies honestly. "ascii_assignment" (R15): the buggy future
   * IS legal Java (char widens to int) — it just gives the code, not
   * the value; the fixed future subtracts '0' to get the real digit. */
  async runDualFutureReveal(config) {
    if (config.tokenRegion === "string_argument") {
      this.showCompileErrorStamp();
      await this.chalkWriteLine('isDigit(String) ✗', HEX_RED);
      await this.delay(500);
      if (!this._alive) return;
      this.wipeSlate();
      this.clearMiniLoupe();
      this.clearContainerShelf();
      this.updateResultRow(null);
      await this.chalkWriteLine("String → char", HEX_SILVER);
      const result = await this.runMiniClassification("7", 55, true);
      if (!this._alive) return;
      if (result) await this.chalkWriteLine("prints: Valid digit", HEX_GREEN_BRIGHT);
      return;
    }

    if (config.tokenRegion === "ascii_assignment") {
      await this.chalkWriteLine("char → int (widens to code)", HEX_SILVER);
      await this.chalkWriteLine("value = 53", "#e8eaf6");
      await this.chalkWriteLine("prints: Value: 53", HEX_RED);
      await this.delay(600);
      if (!this._alive) return;
      this.wipeSlate();
      this.clearMiniLoupe();
      this.clearContainerShelf();
      this.updateResultRow(null);
      await this.chalkWriteLine("ch - '0' = 5", "#e8eaf6");
      await this.chalkWriteLine("prints: Value: 5", HEX_GREEN_BRIGHT);
      return;
    }

    await this.runReveal(config.lines.filter((l) => !l.trim().startsWith("//")));
  }

  // ══════════════════════════════════════════════════════════════
  // HONEST EVALUATOR — extends L80's cascade with char arithmetic
  // (the level's whole point): a (char) cast, +/- promoting char
  // operands through their CODE POINT rather than treating the
  // character glyph as a number, isDigit accepting either a char or
  // a raw int code point, escape-character literals, and the wing's
  // first multiplication (Round 12's num * 2).
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

  /** Converts a resolved {value,type} to a plain number for
   * arithmetic — chars promote through their CODE POINT, never
   * through parsing the glyph as a decimal number (see header note:
   * this is the fix caught by hand-tracing Rounds 7/9). */
  _toNum(value, type) {
    return type === "char" ? value.charCodeAt(0) : Number(value);
  }

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
          // char promotes to int in arithmetic, same as Java.
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
        if (i === 0) {
          accValue = num; accType = numType;
        } else {
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

    const escapeMatch = t.match(/^'\\(n|t|0|\\|')'$/);
    if (escapeMatch) {
      const escMap = { n: "\n", t: "\t", "0": "\0", "\\": "\\", "'": "'" };
      return { ok: true, value: escMap[escapeMatch[1]], type: "char" };
    }

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
      if (varType === "int" && r.type === "char") {
        // implicit char → int widening (the ASCII-assignment trap)
        vars[name] = { value: r.value.charCodeAt(0), type: "int", kind: "scalar" };
        return { ok: true };
      }
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

  /** Index-scans for if (...) { ... } [else { ... }] and
   * for (int i = INIT; COND; i++) { ... } blocks. */
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
          if (t.endsWith("{")) depth++;
          if (t === "}") { depth--; if (depth === 0) break; }
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
    if (remaining > 0.6) { points += 50; this.fastBonusCount++; this.createFloatingText(TICKET_CX, TICKET_Y0 - 14, "⚡ CLEAN CUT +50", HEX_GOLD, "bold 15px Arial", 900); }
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
      GameManager.fusionEngine.checkBehavioral(prediction);
    } catch (e) {
      console.warn("Level81Scene: /api/wellbeing/predict-struggle unreachable, skipping behavioral signal for this level:", e);
    }
  }

  advanceRound() {
    if (this.currentRound === 2) this.runBehavioralCheck();
    this.clearRound();
    const next = this.currentRound + 1;
    if (next >= ROUNDS.length) { this.levelComplete(); return; }
    const nextConfig = ROUNDS[next];
    if (nextConfig.wave !== this.currentWave) {
      this.regenerateGem().then(() => { if (this._alive && !this.gameEnded) this.startWave(nextConfig.wave); });
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
      this.clearMiniLoupe();
      this.clearContainerShelf();
      this._cleaved = true;
      this.scoringLineGfx.clear();
      const motes = this.ambient;
      this.ambient = null;
      (motes || []).forEach((m) => this.tweens.add({ targets: m, y: 632, alpha: 0, duration: 1500, ease: "Sine.easeIn" }));

      // Gem shatters completely — fragments scatter outward
      this.gemContainer.setVisible(false);
      for (let i = 0; i < 12; i++) {
        const frag = this.add.circle(GEM_CX, GEM_CY, Phaser.Math.Between(2, 4), C_SILVER, 0.7).setDepth(16);
        this.tweens.add({ targets: frag, x: GEM_CX + Phaser.Math.Between(-90, 90), y: GEM_CY + Phaser.Math.Between(-90, 90), alpha: 0, duration: 700, ease: "Cubic.easeOut" });
      }
      this.screenShake(0.006, 250);

      const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
      this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });
      const title = this.add.text(640, 240, "GEM SHATTERED", { font: "bold 36px Georgia", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
      this.tweens.add({ targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut", onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }) });
      this.add.text(640, 310, `Score: ${this.score}`, { font: "21px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
      this.add.text(640, 350, `Trials Graded: ${this.currentRound} / 15`, { font: "18px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);
      this._makeButton(525, 420, "SET A NEW GEM", 200, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
      this._makeButton(755, 420, "RETURN TO MENU", 200, 50, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.start("MenuScene"));
    })();
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearRound();
    this.hideBubble();

    try { GameManager.completeLevel(80, Math.round((this.correctFirstTry / 15) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("character_isDigit_tuned"); } catch (_) {}
    try {
      localStorage.setItem("level81_results", JSON.stringify({
        level: 81, concept: "character_isDigit", phase: "tuning",
        score: this.score, accuracy: this.correctFirstTry / 15, avgTimePct: this.totalTimePctUsed / 15,
        fastBonuses: this.fastBonusCount, comboMax: this.maxCombo, stars: this._starRating(),
        livesRemaining: this.lives, attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.trialsFinale().then(() => { if (this._alive) this.showScoreTally(); });
  }

  async trialsFinale() {
    this.resetGemForRound();
    // the score heals — a golden light traces the line backward, erasing it
    const state = { v: 1 };
    await new Promise((res) => {
      this.tweens.add({
        targets: state, v: 0, duration: 400, ease: "Sine.easeOut",
        onUpdate: () => {
          this.scoringLineGfx.clear();
          const lineX = GEM_X0 + (GEM_X1 - GEM_X0) * state.v;
          this.scoringLineGfx.lineStyle(3, C_GOLD, 0.8);
          this.scoringLineGfx.lineBetween(lineX, GEM_CY - GEM_H / 2, lineX, GEM_CY + GEM_H / 2);
        },
        onComplete: res,
      });
    });
    this.scoringLineGfx.clear();

    // triumphant full-body glow
    this._gemGfx.clear();
    this._gemGfx.fillStyle(0xffe082, 1);
    this._gemGfx.fillPoints(this._gemPts, true);
    this._gemGfx.lineStyle(3, C_GOLD, 1);
    this._gemGfx.strokePoints(this._gemPts, true);
    for (let i = 0; i < 4; i++) {
      const ang = i * 90;
      const ray = this.add.rectangle(GEM_CX, GEM_CY, 3, GEM_H + 20, C_GOLD, 0.6).setDepth(13).setAngle(ang);
      this.tweens.add({ targets: ray, alpha: 0, scaleY: 1.6, duration: 350, onComplete: () => ray.destroy() });
    }
    this.screenShake(0.003, 150);
    this.createConfetti(GEM_CX, GEM_CY, 40);
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

    const title = this.add.text(640, 190, "GEMS GRADED", { font: "bold 32px Georgia", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(91).setScale(0);
    this.tweens.add({ targets: title, scale: 1, duration: 350, ease: "Back.easeOut" });

    const acc = Math.round((this.correctFirstTry / 15) * 100);
    const avgSec = (this.totalTimeMs / 15 / 1000).toFixed(1);
    const lines = [
      `ACCURACY: ${acc}%`,
      `AVG RESPONSE: ${avgSec}s`,
      `CLEAN-CUT BONUSES: ${this.fastBonusCount}`,
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
    bg.lineStyle(3, C_GOLD, 1);
    bg.strokeCircle(0, 0, 30);
    const bgpts = [];
    for (let a = 0; a < 6; a++) { const ang = (Math.PI / 3) * a; bgpts.push({ x: Math.cos(ang) * 9, y: -4 + Math.sin(ang) * 9 }); }
    bg.fillStyle(C_GOLD, 0.8);
    bg.fillPoints(bgpts, true);
    bg.lineStyle(1.2, C_RED, 0.7);
    bg.lineBetween(-9, 8, 9, 8);
    badge.add(bg);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 2100 });
    const badgeLbl = this.add.text(640, 520, "isDigit() SCHEMA TUNED", { font: "bold 15px Georgia", color: HEX_GOLD }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: badgeLbl, alpha: 1, duration: 300, delay: 2250 });

    this._makeButton(500, 555, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(770, 555, "NEXT: The Classification Works →", 300, 44, { fill: 0x00733a, stroke: C_GREEN_BRIGHT, textColor: "#ffffff" }, () => {
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
