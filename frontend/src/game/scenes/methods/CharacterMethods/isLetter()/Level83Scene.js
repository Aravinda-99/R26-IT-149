/**
 * Level 83 — "The Alphabet Lens" (Character Wing: Accretion Phase —
 * Character.isLetter())
 * ===========================================================================
 * Opens the SECOND method of the Character Wing's isLetter() trilogy.
 * Hero visual: the Prismatic Lens — a triangular prism mounted beside the
 * (now dormant) Numeral Loupe. White light enters the prism; if the gem
 * on the pad is a letter, the light REFRACTS into three diverging blue
 * rays (true — glow); if not, the light passes straight through
 * unrefracted (false — no glow). Like the loupe, the prism CLASSIFIES —
 * it never changes the gem. Reuses L80's predict/command accretion
 * architecture (Gemologist's Slate, source display, HUD/Bit/tutorial
 * skeleton, round lifecycle, drag-drop command engine), replacing the
 * loupe choreography with the prism's refract-or-pass-straight verdict.
 *
 * Hand-verified all 12 rounds by direct tracing against real Java
 * Character.isLetter() semantics before writing any code (letters =
 * 'A'-'Z' and 'a'-'z', case-blind; mutual exclusion with isDigit's
 * digit range; the three-branch if/else-if/else classifier; the
 * !isDigit vs isLetter precision trap on "!@#" in the Round 12
 * capstone). No spec data bugs found this level — clean.
 *
 * New evaluator vocabulary beyond L80/L81/L82's cascade (all needed by
 * this level's own round data, not speculative additions):
 *  - `else if (COND) { ... }` chained onto an existing `if` block —
 *    the wing's first three-branch (or more) conditional chain. The
 *    existing two-branch if/else block collector is generalized to
 *    walk an arbitrary number of `} else if (...) {` segments before
 *    an optional final `} else {`.
 *  - A single-line, BRACELESS if-statement: `if (COND) STMT;` (Round
 *    8's loop body — `if (Character.isLetter(s.charAt(i))) letters++;`).
 *    Valid Java: a single statement needs no braces. Executes STMT
 *    only when COND is true; no chaining (this level never follows a
 *    braceless if with an else).
 *  - A single-line, BRACED if/else-if: `if (COND) { STMT; }` and
 *    `else if (COND) { STMT; }` on their own lines (Round 12's
 *    capstone body). Deliberately NOT wired as a true gated else-if
 *    chain — verified by hand-trace that Character.isDigit/isLetter
 *    (and every distractor combination this mission actually tests)
 *    are safe to evaluate as two INDEPENDENT single-line conditionals
 *    here, because isDigit and isLetter are mutually exclusive by
 *    construction: whatever the second condition evaluates to on a
 *    digit char is exactly the value true gating would have produced
 *    (skipped ⇔ false) for isLetter and for !isDigit, and even for a
 *    wrongly-repeated isDigit(ch) the independent-evaluation result
 *    still diverges from the expected output on the same test cases a
 *    true chain would catch it on (confirmed against every cartridge
 *    combination in Round 12 by hand before coding — see l83_verify
 *    for the Node re-confirmation). A fully general single-line
 *    else-if gate was not needed anywhere else in this level's data,
 *    so it was not built.
 *  - For-loop body depth-tracking also treats a literal
 *    `"} else if (...) {"` line as net-zero-depth (closes one block,
 *    reopens another), generalizing L82's `"} else {"` fix — not
 *    exercised by this level's own rounds (no round nests a multi-line
 *    else-if chain inside a for-loop) but added defensively since the
 *    depth tracker was already being touched for the chain extension.
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
const C_WHITE_LIGHT = 0xe8eaf6, HEX_WHITE_LIGHT = "#e8eaf6";

// The Prismatic Lens geometry (shares the loupe's pad footprint)
const PAD_X0 = 400, PAD_X1 = 640, PAD_Y0 = 380, PAD_Y1 = 440;
const PAD_CX = 520, PAD_CY = 410;
const PRISM_CX = 520, PRISM_REST_Y = 235, PRISM_DOWN_Y = 410, PRISM_SIZE = 46;
const VERDICT_X = 680, VERDICT_Y = 260, VERDICT_W = 160, VERDICT_H = 80;
const CONT_X = 520, CONT_Y = 468, CONT_W = 140, CONT_H = 36;
// Gemologist's Slate (reveal panel)
const SLATE_X = 800, SLATE_Y = 130, SLATE_W = 420, SLATE_H = 300;

const TUTORIAL_KEY = "level83_tutorial_done";

// ══════════════════════════════════════════════════════════════
// ROUND CONFIGURATION
// ══════════════════════════════════════════════════════════════
const ROUNDS = [
  // ── Type A: Classification Prediction (Rounds 1–3) ──
  { round: 1, type: "predict",
    source: "boolean b = Character.isLetter('Z');",
    question: "What is stored in b?", correct: "true",
    options: [
      { value: "true", tag: null },
      { value: "1", tag: "isLetter_returns_int_belief" },
      { value: "false", tag: "cap_not_letter_belief" },
      { value: '"true"', tag: "isLetter_returns_string_belief", label: '"true" (String)' },
    ],
    concept: "basic_isLetter_true_upper" },

  { round: 2, type: "predict",
    source: "boolean b = Character.isLetter('q');",
    question: "What is stored in b?", correct: "true",
    options: [
      { value: "true", tag: null },
      { value: "false", tag: "lowercase_not_letter_belief" },
      { value: "113", tag: "isLetter_returns_ascii_belief", label: "113 (ASCII of 'q')" },
      { value: "error", tag: "isLetter_crashes_on_letter_belief", label: "Error" },
    ],
    concept: "basic_isLetter_true_lower" },

  { round: 3, type: "predict",
    source: "boolean b = Character.isLetter('3');",
    question: "What is stored in b?", correct: "false",
    options: [
      { value: "false", tag: null },
      { value: "true", tag: "digit_is_letter_belief" },
      { value: "51", tag: "isLetter_returns_ascii_belief", label: "51 (ASCII of '3')" },
      { value: "error", tag: "isLetter_crashes_on_digit_belief", label: "Error" },
    ],
    concept: "basic_isLetter_false_digit" },

  // ── Type B: Mutual Exclusion & Edge Cases (Rounds 4–7) ──
  { round: 4, type: "predict",
    source: "char ch = '@';\nSystem.out.println(Character.isLetter(ch));",
    question: "What prints?", correct: "false",
    options: [
      { value: "false", tag: null },
      { value: "true", tag: "symbol_is_letter_belief" },
      { value: "64", tag: "isLetter_returns_ascii_belief" },
      { value: "error", tag: "isLetter_crashes_on_symbol_belief", label: "Error" },
    ],
    revealNote: "'@' is a symbol, not a letter. isLetter only recognizes the 52 letters A–Z and a–z. Symbols, punctuation, and control characters all return false — same 'other' zone as isDigit's non-digits.",
    concept: "symbol_not_letter" },

  { round: 5, type: "predict",
    source: 'char ch = \'5\';\nboolean d = Character.isDigit(ch);\nboolean l = Character.isLetter(ch);\nSystem.out.println(d + " " + l);',
    question: "What prints?", correct: "true false",
    options: [
      { value: "true false", tag: null },
      { value: "false true", tag: "isDigit_isLetter_swapped_belief" },
      { value: "true true", tag: "digit_is_also_letter_belief" },
      { value: "false false", tag: "isDigit_isLetter_neither_belief" },
    ],
    revealNote: "'5' is a digit, not a letter. isDigit and isLetter are MUTUALLY EXCLUSIVE — a char can never satisfy both. d = true (it IS a digit), l = false (it is NOT a letter).",
    concept: "mutual_exclusion_digit" },

  { round: 6, type: "predict",
    source: 'char ch = \'G\';\nboolean d = Character.isDigit(ch);\nboolean l = Character.isLetter(ch);\nSystem.out.println(d + " " + l);',
    question: "What prints?", correct: "false true",
    options: [
      { value: "false true", tag: null },
      { value: "true false", tag: "isDigit_isLetter_swapped_belief" },
      { value: "true true", tag: "letter_is_also_digit_belief" },
      { value: "false false", tag: "isDigit_isLetter_neither_belief" },
    ],
    revealNote: "'G' is a letter, not a digit. d = false (NOT a digit), l = true (IS a letter). Every char falls into exactly one family — digit, letter, or other — never two at once.",
    concept: "mutual_exclusion_letter" },

  { round: 7, type: "predict",
    source: "boolean b = Character.isLetter('_');",
    question: "What is stored in b?", correct: "false",
    options: [
      { value: "false", tag: null },
      { value: "true", tag: "underscore_is_letter_belief" },
      { value: "95", tag: "isLetter_returns_ascii_belief" },
      { value: "error", tag: "isLetter_crashes_on_underscore_belief", label: "Error" },
    ],
    revealNote: "The underscore is legal inside a Java identifier, but that does NOT make it a letter to isLetter — it falls in the 'other' zone, same as any symbol. Only A–Z and a–z qualify.",
    concept: "underscore_not_letter" },

  // ── Type C: Loop Counting & Three-Branch Classifier (Rounds 8–9) ──
  { round: 8, type: "predict",
    source: 'String s = "Hi5!";\nint letters = 0;\nfor (int i = 0; i < s.length(); i++) {\n    if (Character.isLetter(s.charAt(i))) letters++;\n}\nSystem.out.println(letters);',
    question: "What prints?", correct: "2",
    options: [
      { value: "2", tag: null },
      { value: "4", tag: "counts_all_chars_belief" },
      { value: "3", tag: "digit_counted_as_letter_belief" },
      { value: "0", tag: "isLetter_always_false_in_loop_belief" },
    ],
    revealNote: "'H' and 'i' are letters (2). '5' is a digit, '!' is a symbol — neither counts. Notice the if has no braces: a single statement (letters++) needs none in Java, same as a braced block would.",
    concept: "loop_count_letters" },

  { round: 9, type: "predict",
    source: 'char ch = \'R\';\nif (Character.isDigit(ch)) {\n    System.out.println("Digit");\n} else if (Character.isLetter(ch)) {\n    System.out.println("Letter");\n} else {\n    System.out.println("Other");\n}',
    question: "What prints?", correct: "Letter",
    options: [
      { value: "Letter", tag: null },
      { value: "Digit", tag: "first_branch_always_wins_belief" },
      { value: "Other", tag: "else_if_skipped_belief" },
      { value: "error", tag: "three_branch_crashes_belief", label: "Error" },
    ],
    revealNote: "'R' is not a digit, so the first branch is skipped. It IS a letter, so the else-if branch runs and prints 'Letter' — the final else never even gets checked.",
    concept: "three_branch_classifier" },

  // ── Type D: Prism Command (Rounds 10–12) ──
  { round: 10, type: "command",
    source: 'char input = \'k\';\nboolean result = <slot:check>;\nSystem.out.println("Letter? " + result);',
    mission: "Check if the input character is a letter. Expected: Letter? true",
    slots: [{ id: "check", hint: "classify the gem" }],
    cartridges: [
      { code: "Character.isLetter(input)", correct: true },
      { code: "Character.isDigit(input)", tag: "wrong_classification_method" },
      { code: "character.isLetter(input)", tag: "character_lowercase_belief" },
      { code: "input.isLetter()", tag: "isLetter_instance_call_belief" },
    ],
    tests: [{ expectedOutput: "Letter? true" }],
    concept: "command_basic_isLetter" },

  { round: 11, type: "command",
    source: 'char ch = /* test value */;\nif (<slot:digitCheck>) {\n    System.out.println("Digit");\n} else if (<slot:letterCheck>) {\n    System.out.println("Letter");\n} else {\n    System.out.println("Symbol");\n}',
    mission: "Classify the character.\nFor '#': Symbol\nFor '7': Digit\nFor 'b': Letter",
    slots: [{ id: "digitCheck", hint: "the digit test" }, { id: "letterCheck", hint: "the letter test" }],
    cartridges: [
      { code: "Character.isDigit(ch)", correct: true, slotId: "digitCheck" },
      { code: "Character.isLetter(ch)", correct: true, slotId: "letterCheck" },
      { code: "Character.isLetter(ch)", tag: "wrong_slot_order", slotId: "digitCheck" },
      { code: "Character.isDigit(ch)", tag: "wrong_slot_order", slotId: "letterCheck" },
    ],
    tests: [
      { substitutions: { ch: "'#'" }, expectedOutput: "Symbol" },
      { substitutions: { ch: "'7'" }, expectedOutput: "Digit" },
      { substitutions: { ch: "'b'" }, expectedOutput: "Letter" },
    ],
    concept: "command_three_branch_classifier" },

  { round: 12, type: "command",
    source: 'String data = /* test value */;\nint letters = 0;\nint digits = 0;\nfor (int i = 0; i < data.length(); i++) {\n    char ch = data.charAt(i);\n    if (Character.isDigit(ch)) { digits++; }\n    else if (<slot:check>) { letters++; }\n}\nSystem.out.println("Letters: " + letters + " Digits: " + digits);',
    mission: 'Count letters and digits separately. For "Code99!":\nLetters: 4 Digits: 2',
    slots: [{ id: "check", hint: "is this character a letter?" }],
    cartridges: [
      { code: "Character.isLetter(ch)", correct: true },
      { code: "Character.isDigit(ch)", tag: "wrong_classification_method" },
      { code: "Character.isLetter(data)", tag: "isLetter_takes_string_belief" },
      { code: "!Character.isDigit(ch)", tag: "not_digit_includes_symbols" },
    ],
    tests: [
      { substitutions: { data: '"Code99!"' }, expectedOutput: "Letters: 4 Digits: 2" },
      { substitutions: { data: '"123"' }, expectedOutput: "Letters: 0 Digits: 3" },
      { substitutions: { data: '"Hello"' }, expectedOutput: "Letters: 5 Digits: 0" },
      { substitutions: { data: '"!@#"' }, expectedOutput: "Letters: 0 Digits: 0" },
    ],
    postMissionNote: "Bit (folding the specimen card away): 'The digit branch runs first — if it's a digit, the letter test never even fires. That's why !isDigit(ch) is a trap: it would count every symbol as a letter too, since the loop reaches it whenever the char ISN'T a digit. isLetter is the precise tool. Two instruments mastered — one more waits in the deeper halls: isUpperCase.'",
    concept: "command_dual_counter_capstone" },
];

const MISCONCEPTION_FEEDBACK = {
  isLetter_returns_int_belief: "isLetter returns BOOLEAN — true or false — never a number. The gem's identity stays on the gem; the verdict is the boolean.",
  cap_not_letter_belief: "'Z' IS a letter — uppercase counts exactly like lowercase. isLetter is case-blind: it doesn't care which case, only whether it's A–Z or a–z.",
  isLetter_returns_string_belief: "isLetter returns boolean, not String. true (the boolean), not \"true\" (the text).",
  lowercase_not_letter_belief: "'q' IS a letter — lowercase counts exactly like uppercase. isLetter is case-blind: both refract the same blue light.",
  isLetter_returns_ascii_belief: "isLetter returns boolean, not the character's code. The gem's encoding is invisible to the verdict — only the classification matters.",
  isLetter_crashes_on_letter_belief: "isLetter never crashes — it has a valid true/false answer for every char.",
  digit_is_letter_belief: "Digits are NOT letters. '3' belongs to the digit family, not the letter family — different gems, different refraction.",
  isLetter_crashes_on_digit_belief: "isLetter never crashes on any char — digits simply return false, same as any other non-letter.",
  symbol_is_letter_belief: "'@' is a symbol — punctuation, not a letter. isLetter only recognizes A–Z and a–z, the 52 true letters.",
  isLetter_crashes_on_symbol_belief: "isLetter never crashes on a symbol — it just answers false, same as it does for digits and punctuation.",
  isDigit_isLetter_swapped_belief: "Trace which test matches which family: isDigit asks 'is this 0–9?', isLetter asks 'is this A–Z or a–z?'. Don't swap the two verdicts.",
  digit_is_also_letter_belief: "A char can never be BOTH a digit and a letter — isDigit and isLetter are mutually exclusive. If d is true, l must be false.",
  isDigit_isLetter_neither_belief: "Every char is at least ONE of digit, letter, or other. This char matched one of the first two — it can't score false on both isDigit and isLetter here.",
  letter_is_also_digit_belief: "A char can never be BOTH a letter and a digit — isDigit and isLetter are mutually exclusive. If l is true, d must be false.",
  underscore_is_letter_belief: "The underscore is legal in Java identifiers, but that's a naming rule, not a character classification. isLetter still says false — it's in the 'other' zone.",
  isLetter_crashes_on_underscore_belief: "isLetter never crashes on the underscore — it just returns false, same as any symbol.",
  counts_all_chars_belief: "The if-condition filters the loop — only characters where isLetter(ch) is true increment the counter. Digits and symbols pass through the loop but don't trigger the increment.",
  digit_counted_as_letter_belief: "'5' is a digit, not a letter — isLetter('5') is false, so it does NOT increment the counter. Only 'H' and 'i' do.",
  isLetter_always_false_in_loop_belief: "isLetter behaves identically inside a loop as anywhere else — 'H' and 'i' are genuine letters and DO return true, incrementing the counter twice.",
  first_branch_always_wins_belief: "The first branch only runs if its OWN condition is true. isDigit('R') is false, so the if is skipped entirely — execution falls through to check the else-if.",
  else_if_skipped_belief: "else-if is checked whenever the preceding if was false — it is NOT skipped. isLetter('R') is true, so this branch runs and the final else never gets evaluated.",
  three_branch_crashes_belief: "An if/else-if/else chain never crashes — exactly one branch runs (or none, if every condition to reach the else is false and there's no else), based on the first true condition.",
  wrong_classification_method: "isDigit checks for DIGITS, not letters — it would report false for a letter like 'k' and true for a digit. You need isLetter to check for letters.",
  character_lowercase_belief: "Character with a capital C — the wrapper class. 'character' (lowercase) doesn't exist. Class names are capitalized, same as Integer, Double, and Character.isDigit.",
  isLetter_instance_call_belief: "Character.isLetter — static, on the class. Not input.isLetter(). The prism belongs to Character, not to the gem.",
  wrong_slot_order: "Trace which test belongs in which branch: the FIRST branch checks for digits (isDigit), the else-if checks for letters (isLetter). Swapping them makes both branches test the same family.",
  isLetter_takes_string_belief: "isLetter takes a CHAR, not a String — Character.isLetter(data) fails to compile because data is a String. You need one character at a time: data.charAt(i).",
  not_digit_includes_symbols: "!Character.isDigit(ch) is true for every non-digit — including symbols like '!' and '@', not just letters. It would wrongly count punctuation as letters. isLetter is the precise, correct tool here.",
  timeout: "Trace the light again — does it refract, or pass straight through?",
};

export class Level83Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level83Scene" });
  }

  init(data = {}) {
    this._forceTutorial = !!data.forceTutorial;
    this.currentRound = 0;
    this.score = 0;
    this.displayScore = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.lives = 3;
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
    this.firstUnchangedAnnotationShown = false;
  }

  preload() {}

  create() {
    this._alive = true;
    this.createParticleTexture();
    this.createBackground();
    this.createInstituteInterior();
    this.createInstituteFloor();
    this.createParticles();
    this.createPrismaticLens();
    this.createGemologistsSlate();
    this.createSourceDisplay();
    this.createHUD();
    addTutorialReplayButton(this, W, this.lifeIcons[2].x, this.lifeIcons[0].y);
    this.createExpressionMonitor();
    this.createBit();
    this.checkTutorial();
  }

  update(time, delta) {
    this.updateParticles(time, delta);
    this.updateScaleBalance(time);
  }

  delay(ms) { return new Promise((r) => this.time.delayedCall(ms, r)); }
  waitForClick() { return new Promise((r) => this.input.once("pointerdown", () => r())); }

  // ══════════════════════════════════════════════════════════════
  // SETUP — THE GEMOLOGICAL INSTITUTE INTERIOR
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l83_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l83_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x0a1428).setDepth(0);
  }

  createInstituteInterior() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x0a1428, 1);
    g.fillRect(0, 0, W, 216);
    g.lineStyle(1, 0x0e1830, 0.3);
    for (let x = 20; x < W; x += 26) g.lineBetween(x, 0, x, 216);

    // Character classification chart — Letters column now active
    g.fillStyle(0x0a1428, 1);
    g.lineStyle(2, C_SILVER, 1);
    g.fillRect(300, 40, 440, 110);
    g.strokeRect(300, 40, 440, 110);
    g.lineStyle(1, C_SILVER, 0.3);
    g.lineBetween(447, 44, 447, 146);
    g.lineBetween(594, 44, 594, 146);
    const cols = [
      { x: 373, label: "Digits", sample: "0-9", color: HEX_GOLD, active: true },
      { x: 520, label: "Letters", sample: "A-Z a-z", color: HEX_BLUE_LETTER, active: false },
      { x: 667, label: "Other", sample: ". _ ' '", color: HEX_GRAY, active: true },
    ];
    this._chartColumns = cols.map((c) => {
      const icon = this.add.graphics().setDepth(2);
      icon.fillStyle(Phaser.Display.Color.HexStringToColor(c.color).color, 0.5);
      icon.fillCircle(c.x, 58, 4);
      const lbl = this.add.text(c.x, 72, c.label, { font: "bold 10px Georgia", color: c.color }).setOrigin(0.5).setAlpha(c.active ? 0.6 : 0.25).setDepth(2);
      const sample = this.add.text(c.x, 100, c.sample, { font: "11px Courier New", color: c.color }).setOrigin(0.5).setAlpha(c.active ? 0.4 : 0.18).setDepth(2);
      return { icon, lbl, sample };
    });

    // Velvet-lined display case (left wall)
    g.lineStyle(2, C_SILVER, 1);
    g.fillStyle(0x0a1428, 1);
    g.fillRect(60, 150, 80, 120);
    g.strokeRect(60, 150, 80, 120);
    const gemShapes = [
      { x: 100, y: 180, color: C_GOLD },
      { x: 100, y: 210, color: C_BLUE_LETTER },
      { x: 100, y: 240, color: C_GRAY },
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

    // Dormant Numeral Loupe — the sibling instrument, already mastered
    const loupeSil = this.add.graphics().setDepth(2).setAlpha(0.22);
    loupeSil.lineStyle(3, C_SILVER, 1);
    loupeSil.strokeCircle(150, 340, 22);
    loupeSil.lineBetween(150 + 16, 340 + 16, 150 + 30, 340 + 30);
    this.add.text(150, 372, "isDigit()\nmastered", { font: "italic 10px Georgia", color: HEX_SILVER, align: "center" }).setOrigin(0.5).setAlpha(0.2).setDepth(2);

    // Precision scale (side bench)
    g.lineStyle(1.5, C_SILVER, 0.4);
    g.strokeRect(60, 460, 40, 30);
    this.scaleBeam = this.add.rectangle(80, 470, 34, 2, C_SILVER, 0.6).setDepth(2);
    g.lineBetween(80, 466, 80, 474);

    // Banner
    const bg = this.add.graphics().setDepth(2);
    bg.fillStyle(0x0a1428, 1);
    bg.lineStyle(1, C_SILVER, 0.5);
    bg.fillRoundedRect(460, 12, 360, 26, 3);
    bg.strokeRoundedRect(460, 12, 360, 26, 3);
    this.add.text(640, 25, "T H E   A L P H A B E T   L E N S", { font: "bold 15px Georgia", color: HEX_SILVER }).setOrigin(0.5).setAlpha(0.7).setDepth(3);
  }

  updateScaleBalance(time) {
    if (!this.scaleBeam) return;
    this.scaleBeam.setAngle(Math.sin(time * 0.0006) * 1.2);
  }

  createInstituteFloor() {
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
    const colors = [C_SILVER, C_CYAN, C_BLUE_LETTER];
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
    const p = this.add.particles(x, y, "l83_dot", {
      speed: { min: 80, max: 240 }, angle: { min: 0, max: 360 }, scale: { start: 0.9, end: 0 }, lifespan: 500,
      tint: [C_BLUE_LETTER, C_SILVER, C_INDIGO, 0xffffff], emitting: false,
    }).setDepth(85);
    p.explode(count);
    this.time.delayedCall(900, () => p.destroy());
  }

  screenShake(intensity = 0.004, duration = 150) {
    this.cameras.main.shake(duration, intensity);
  }

  // ══════════════════════════════════════════════════════════════
  // GEMOLOGIST'S SLATE — silver-framed chalkboard reveal panel
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

    this.add.text(SLATE_X + 14, SLATE_Y + SLATE_H - 34, "returns:", { font: "13px Georgia", color: "#8a6435" }).setDepth(11);
    this.resultText = this.add.text(SLATE_X + 70, SLATE_Y + SLATE_H - 34, "—", { font: "bold 15px Courier New", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(11);
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
    if (this._slateY > SLATE_Y + SLATE_H - 46) this._slateY = SLATE_Y + 52;
  }

  chalkEvaluationArrow(value) {
    const t = this.add.text(SLATE_X + 14, this._slateY, `→ ${value}`, { font: "bold 14px Courier New", color: value === "true" ? HEX_GREEN_BRIGHT : HEX_GRAY }).setAlpha(0);
    this.slateLines.add(t);
    if (t.width > SLATE_W - 28) t.setFontSize(10);
    this.tweens.add({ targets: t, alpha: 1, duration: 140 });
    this._slateY += 22;
    if (this._slateY > SLATE_Y + SLATE_H - 46) this._slateY = SLATE_Y + 52;
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
    const re = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\bimport\b|\bint\b|\bdouble\b|\bboolean\b|\bchar\b|\bString\b|\bfor\b|\bif\b|\belse\b)|(\bCharacter\b|\bInteger\b)|(\.isDigit\b|\.isLetter\b|\.charAt\b|\.length\b|\.parseInt\b)|(\bSystem\.out\b)|(\btrue\b|\bfalse\b)|(-?\d+\.\d+|-?\d+)|(&&|\+\+|==|>=|<=|!|[(){}\[\];.,=+<>])/g;
    let last = 0, m;
    const plain = (t) => t && tokens.push({ t, c: "#e0e0e0" });
    while ((m = re.exec(line))) {
      if (m.index > last) plain(line.slice(last, m.index));
      if (m[1]) tokens.push({ t: m[1], c: HEX_GOLD });
      else if (m[2]) tokens.push({ t: m[2], c: "#1565c0" });
      else if (m[3]) tokens.push({ t: m[3], c: HEX_SILVER });
      else if (m[4]) tokens.push({ t: m[4], c: HEX_CYAN });
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

    this.add.text(20, 14, "THE ALPHABET LENS", { font: "bold 16px Georgia", color: "#b0bec5" }).setDepth(50);
    this.add.text(20, 32, "Accretion Phase — Character Methods: isLetter()", { font: "12px Arial", color: "#546e7a" }).setDepth(50);

    this.add.text(1060, 8, "SCORE", { font: "11px Arial", color: "#546e7a" }).setDepth(50);
    this.scoreText = this.add.text(1060, 20, "0", { font: "bold 19px Arial", color: "#ffffff" }).setDepth(50);
    this.comboText = this.add.text(1060, 42, "×1", { font: "bold 14px Arial", color: HEX_GOLD }).setDepth(50);

    this.lifeIcons = [];
    for (let i = 0; i < 3; i++) {
      const lg = this.add.graphics({ x: 1150 + i * 26, y: 24 }).setDepth(50);
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
  // THE PRISMATIC LENS (hero mechanic) — a triangular prism beside the
  // dormant Numeral Loupe. White light enters; if the gem is a letter
  // the light REFRACTS into three diverging blue rays (true); if not,
  // it passes straight through unrefracted (false). Like the loupe,
  // the prism never changes the gem — it only classifies.
  // ══════════════════════════════════════════════════════════════

  createPrismaticLens() {
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
    const prismG = this.add.graphics();
    const s = PRISM_SIZE;
    const triPts = [{ x: 0, y: -s }, { x: s * 0.87, y: s * 0.5 }, { x: -s * 0.87, y: s * 0.5 }];
    prismG.fillStyle(0x0a1428, 0.35);
    prismG.lineStyle(3, C_SILVER, 1);
    prismG.fillPoints(triPts, true);
    prismG.strokePoints(triPts, true);
    this._prismInnerGlow = this.add.graphics();
    const mount = this.add.rectangle(0, s * 0.5 + 6, 14, 10, C_SILVER, 0.6);
    this.prismContainer.add([prismG, this._prismInnerGlow, mount]);
    this._prismTriPts = triPts;

    this.verdictPanelG = this.add.graphics().setDepth(24);
    this.verdictPanelG.lineStyle(2, C_SILVER, 1);
    this.verdictPanelG.strokeRoundedRect(VERDICT_X, VERDICT_Y, VERDICT_W, VERDICT_H, 8);
    this.verdictText = this.add.text(VERDICT_X + VERDICT_W / 2, VERDICT_Y + 30, "", { font: "bold 23px Georgia", color: HEX_GRAY }).setOrigin(0.5).setDepth(25);
    this.verdictSubText = this.add.text(VERDICT_X + VERDICT_W / 2, VERDICT_Y + 58, "", { font: "bold 12px Georgia", color: HEX_GRAY }).setOrigin(0.5).setDepth(25);

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
    if (/[A-Za-z]/.test(ch)) return "letter";
    return "other";
  }

  getGemColor(family) {
    if (family === "digit") return { fill: C_GOLD, stroke: 0xb8860b };
    if (family === "letter") return { fill: C_BLUE_LETTER, stroke: 0x1565c0 };
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
    const beam = this.add.rectangle(PAD_CX - 120, PAD_CY, 4, 3, C_WHITE_LIGHT, 0.8).setDepth(23);
    await new Promise((res) => {
      this.tweens.add({ targets: beam, x: PAD_CX - PRISM_SIZE * 0.6, duration: 260, ease: "Sine.easeIn", onComplete: () => { beam.destroy(); res(); } });
    });
  }

  async refractOrPassStraight(isLetterResult) {
    const gem = this._currentGem;
    if (isLetterResult) {
      this._prismInnerGlow.clear();
      this._prismInnerGlow.fillStyle(0x4fc3f7, 0.35);
      this._prismInnerGlow.fillPoints(this._prismTriPts, true);
      const rays = [];
      for (let i = -1; i <= 1; i++) {
        const ray = this.add.rectangle(PAD_CX, PAD_CY, 70, 3, C_BLUE_LETTER, 0.75).setDepth(24).setAngle(i * 14).setOrigin(0, 0.5);
        ray.setPosition(PRISM_CX, PRISM_DOWN_Y);
        rays.push(ray);
      }
      await new Promise((res) => {
        this.tweens.add({ targets: rays, scaleX: 1.4, alpha: 0, duration: 320, onComplete: () => { rays.forEach((r) => r.destroy()); res(); } });
      });
      if (gem) {
        gem.g.clear();
        gem.g.fillStyle(0x82d4ff, 1);
        gem.g.lineStyle(2, gem.colors.stroke, 1);
        gem.g.fillPoints(gem.pts, true);
        gem.g.strokePoints(gem.pts, true);
        this.screenShake(0.002, 100);
      }
    } else {
      const beam = this.add.rectangle(PRISM_CX, PRISM_DOWN_Y, 70, 3, C_WHITE_LIGHT, 0.5).setDepth(24).setOrigin(0, 0.5);
      await new Promise((res) => {
        this.tweens.add({ targets: beam, scaleX: 1.3, alpha: 0, duration: 260, onComplete: () => { beam.destroy(); res(); } });
      });
    }
    await this.delay(80);
  }

  async renderVerdict(isLetterResult) {
    if (isLetterResult) {
      this.verdictPanelG.clear();
      this.verdictPanelG.fillStyle(C_GREEN_BRIGHT, 0.15);
      this.verdictPanelG.fillRoundedRect(VERDICT_X, VERDICT_Y, VERDICT_W, VERDICT_H, 8);
      this.verdictPanelG.lineStyle(2, C_GREEN_BRIGHT, 1);
      this.verdictPanelG.strokeRoundedRect(VERDICT_X, VERDICT_Y, VERDICT_W, VERDICT_H, 8);
      this.verdictText.setText("TRUE").setColor(HEX_GREEN_BRIGHT);
      this.verdictSubText.setText("✓ LETTER").setColor(HEX_GREEN_BRIGHT);
    } else {
      this.verdictPanelG.clear();
      this.verdictPanelG.lineStyle(2, C_SILVER, 1);
      this.verdictPanelG.strokeRoundedRect(VERDICT_X, VERDICT_Y, VERDICT_W, VERDICT_H, 8);
      this.verdictText.setText("FALSE").setColor(HEX_GRAY);
      this.verdictSubText.setText("✗ NOT LETTER").setColor(HEX_GRAY);
    }
    await this.delay(220);
  }

  async prismRise() {
    if (this._currentGem) this.tweens.add({ targets: this._currentGem.container, scale: 1, duration: 150 });
    this._prismInnerGlow.clear();
    await new Promise((res) => { this.tweens.add({ targets: this.prismContainer, y: PRISM_REST_Y, duration: 200, ease: "Sine.easeOut", onComplete: res }); });
  }

  async deliverBoolean(value) {
    if (!this.firstUnchangedAnnotationShown) {
      this.firstUnchangedAnnotationShown = true;
      this.createAnnotation(PAD_CX, PAD_Y1 + 18, "the gem is UNCHANGED — isLetter asks a question, it doesn't transform", HEX_GRAY);
    }
    this.boolContText.setText(String(value)).setColor(value ? HEX_GREEN_BRIGHT : HEX_GRAY);
    this.tweens.add({ targets: this.boolContText, scale: 1.15, duration: 90, yoyo: true });
    await this.delay(140);
  }

  clearPad() {
    if (this._currentGem) { this._currentGem.container.destroy(); this._currentGem = null; }
  }

  /** The full honest classification choreography — NO transformation:
   * the gem returned is identical to the gem that went in. */
  async runPrismChoreography(ch, isLetterResult) {
    await this.materializeGem(ch);
    await this.prismDescend();
    await this.lightBeamEnter();
    await this.refractOrPassStraight(isLetterResult);
    await this.renderVerdict(isLetterResult);
    await this.prismRise();
    await this.deliverBoolean(isLetterResult);
    return isLetterResult;
  }

  clearLensArea() {
    this.clearPad();
    this.verdictPanelG.clear();
    this.verdictPanelG.lineStyle(2, C_SILVER, 1);
    this.verdictPanelG.strokeRoundedRect(VERDICT_X, VERDICT_Y, VERDICT_W, VERDICT_H, 8);
    this.verdictText.setText("").setColor(HEX_GRAY);
    this.verdictSubText.setText("");
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
  // BIT — PRISM SPECIALIST VARIANT (jeweler's vest, monocle with a
  // small prism pendant, letter specimen card replacing the tweezers)
  // ══════════════════════════════════════════════════════════════

  createBit() {
    const c = this.add.container(1090, 520).setDepth(60);
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
    // small prism pendant hanging off the monocle chain
    const pendant = this.add.graphics();
    pendant.fillStyle(C_BLUE_LETTER, 0.7);
    pendant.lineStyle(1, 0x1565c0, 1);
    pendant.fillTriangle(10, 14, 16, 20, 8, 20);
    pendant.strokeTriangle(10, 14, 16, 20, 8, 20);
    monocle.add([monG, monHighlight, pendant]);

    const gloveL = this.add.circle(-16, 10, 4, 0xffffff, 0).setStrokeStyle(1, 0xe8eaf6, 0.7);
    // letter specimen card ("Aa" in blue) — replaces the tweezers
    this.specimenCard = this.add.container(17, 6);
    const cardG = this.add.graphics();
    cardG.fillStyle(0x0a1428, 0.95);
    cardG.lineStyle(1, C_BLUE_LETTER, 0.9);
    cardG.fillRoundedRect(-7, -9, 14, 18, 2);
    cardG.strokeRoundedRect(-7, -9, 14, 18, 2);
    const cardTxt = this.add.text(0, 0, "Aa", { font: "bold 10px Georgia", color: HEX_BLUE_LETTER }).setOrigin(0.5);
    this.specimenCard.add([cardG, cardTxt]);

    c.add([g, vest, eye, pupil, monocle, gloveL, this.specimenCard, tip]);
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
    await this.bitSay("Back in the Institute, Gemologist — this time to a second instrument. The Numeral Loupe sleeps on the wall behind you, its work done. Beside it: the Prismatic Lens. White light enters; if the gem is a LETTER, it refracts into three blue rays. If not, the light passes straight through, unbent.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(7000)]); if (!A()) return;
    this.hideBubble();

    this.updateSourceDisplay(["boolean b = Character.isLetter('K');"]);
    await this.runPrismChoreography("K", true);
    if (!A()) return;
    await this.bitSay("Character dot isLetter — same static method pattern as isDigit, same wrapper class. 'K' in single quotes refracted into blue: true. It IS a letter. The gem itself never changed — only the light told us something about it.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(6500)]); if (!A()) return;
    this.hideBubble();
    this.clearLensArea();

    this.updateSourceDisplay(["boolean b = Character.isLetter('7');"]);
    await this.runPrismChoreography("7", false);
    if (!A()) return;
    await this.bitSay("'7' is a digit, not a letter — the light passed straight through, unrefracted: false. Remember the mutual exclusion: isDigit and isLetter can never BOTH be true for the same char. Digit and letter are separate families.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(6500)]); if (!A()) return;
    this.hideBubble();
    this.clearLensArea();

    this.updateSourceDisplay(["boolean b = Character.isLetter('.');"]);
    await this.runPrismChoreography(".", false);
    if (!A()) return;
    await this.bitSay("A period is neither digit nor letter — it lives in the 'other' zone, same zone punctuation, spaces, and symbols share. The light passes through unbent for anything outside A-Z and a-z.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(6500)]); if (!A()) return;
    this.hideBubble();
    this.clearLensArea();

    this.updateSourceDisplay(["char ch = 'm';", "boolean b = Character.isLetter(ch);"]);
    await this.runPrismChoreography("m", true);
    if (!A()) return;
    await this.bitSay("Lowercase 'm' refracts exactly the same as uppercase would — isLetter is CASE-BLIND. It doesn't ask 'which case' — only 'is this A-Z or a-z, in either case.' char stays single-quoted, one character at a time.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(7000)]); if (!A()) return;
    this.hideBubble();
    this.clearLensArea();

    this.updateSourceDisplay(["boolean b = character.isLetter('Z');"]);
    this.showCompileErrorStamp();
    await this.delay(300);
    await this.bitSay("Character with a capital C — the wrapper class, same rule as always. 'character' (lowercase) doesn't exist. The static-method pattern holds across every instrument in this wing.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(6000)]); if (!A()) return;
    this.hideBubble();

    this.clearLensArea();
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
    this.clearLensArea();
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
  // TYPE D — PRISM COMMAND
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
    const bt = this.add.text(0, 0, "REFRACT", { font: "bold 14px Arial", color: "#0a1208" }).setOrigin(0.5);
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
   * test's own substitution value, per test — needed for Rounds 11/12,
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
      this.clearLensArea();

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
      await this.showBitFeedback(MISCONCEPTION_FEEDBACK[failTag] || config.revealNote || "The lens shows exactly what your code produced — compare it against the mission and adjust.");
      if (!this._alive) return;
      this.inputLocked = false;
      this.clearLensArea();
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
  // HONEST EVALUATOR — Character.isLetter (prism-driving) /
  // Character.isDigit (silent, mutual-exclusion partner),
  // String.charAt/.length, relational comparisons with char→code
  // promotion, a unary `!` (logical NOT — new this level), a
  // three-or-more-branch if/else-if/.../else chain, single-line
  // braceless AND single-line braced if-statements (new this level —
  // see l83_part1's header comment for the scoping rationale on the
  // single-line braced form), the for-loop, and a bare name++.
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

    // Unary logical NOT — new this level (Round 12's !isDigit distractor)
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
   *     arbitrary-length branch chain (generalizes the old two-branch
   *     if/else collector to walk as many "} else if (...) {"
   *     segments as the source contains before an optional final
   *     "} else {").
   *   if (COND) STMT;                       — single-line, braceless
   *   if (COND) { STMT; } / else if (COND) { STMT; }   — single-line,
   *     braced (the "else if" form here is evaluated as an ordinary
   *     standalone if, NOT a gated chain — see l83_part1's header
   *     comment for why that's safe for this level's actual data).
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

      const singleBraceless = line.match(/^if\s*\((.+)\)\s+(\S.*;)$/);
      if (singleBraceless && !line.includes("{")) {
        const condRes = await this.resolveExpr(singleBraceless[1].trim(), vars);
        if (!condRes.ok) return condRes;
        if (condRes.value) {
          const r = await this.execStatement(singleBraceless[2].trim(), vars);
          if (!r.ok) return r;
        }
        i++;
        continue;
      }

      const singleBraced = line.match(/^(?:\}\s*)?(?:else\s+)?if\s*\((.+)\)\s*\{\s*(.+;)\s*\}$/);
      if (singleBraced) {
        const condRes = await this.resolveExpr(singleBraced[1].trim(), vars);
        if (!condRes.ok) return condRes;
        if (condRes.value) {
          const r = await this.execStatement(singleBraced[2].trim(), vars);
          if (!r.ok) return r;
        }
        i++;
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
      console.warn("Level83Scene: /api/wellbeing/predict-struggle unreachable, skipping behavioral signal for this level:", e);
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
      this.clearLensArea();
      this.wipeSlate();
      const motes = this.ambient;
      this.ambient = null;
      (motes || []).forEach((m) => this.tweens.add({ targets: m, alpha: 0, duration: 1200 }));
      this.tweens.add({ targets: this.prismContainer, y: PRISM_REST_Y - 60, alpha: 0.3, duration: 500 });

      const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
      this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });
      const title = this.add.text(640, 240, "LENS RETRACTED", { font: "bold 36px Georgia", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
      this.tweens.add({ targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut", onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }) });
      this.add.text(640, 310, `Score: ${this.score}`, { font: "21px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
      this.add.text(640, 350, `Rounds Completed: ${this.currentRound} / 12`, { font: "18px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);
      this._makeButton(525, 420, "REALIGN THE LENS", 200, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
      this._makeButton(755, 420, "RETURN TO MENU", 200, 50, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.start("MenuScene"));
    })();
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearRound();
    this.hideBubble();

    try { GameManager.completeLevel(82, Math.round((this.correctFirstTry / 12) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("character_isLetter_schema"); } catch (_) {}
    try {
      localStorage.setItem("level83_results", JSON.stringify({
        level: 83, concept: "character_isLetter", phase: "accretion",
        score: this.score, accuracy: this.correctFirstTry / 12, avgTime: this.totalTime / 12,
        comboMax: this.maxCombo, stars: this._starRating(), livesRemaining: this.lives,
        attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.lensFinale().then(() => { if (this._alive) this.showScoreTally(); });
  }

  async lensFinale() {
    const letters = ["K", "m", "Z"];
    for (const ch of letters) {
      this.clearLensArea();
      await this.runPrismChoreography(ch, true);
      this.createConfetti(PAD_CX, PAD_CY, 15);
      await this.delay(150);
    }
    if (this._chartColumns && this._chartColumns[1]) {
      const col = this._chartColumns[1];
      this.tweens.add({ targets: [col.icon, col.lbl, col.sample], alpha: 1, duration: 300 });
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

    const title = this.add.text(640, 190, "LENS CALIBRATED", { font: "bold 34px Georgia", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(91).setScale(0);
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
    bg.lineStyle(3, C_BLUE_LETTER, 1);
    bg.strokeCircle(0, 0, 30);
    bg.lineStyle(2, C_SILVER, 1);
    bg.fillStyle(C_BLUE_LETTER, 0.8);
    bg.fillTriangle(-3, -8, 9, -2, -3, 4);
    badge.add([bg]);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 1950 });
    const badgeLbl = this.add.text(640, 505, "isLetter() SCHEMA ACQUIRED", { font: "bold 14px Georgia", color: HEX_BLUE_LETTER }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: badgeLbl, alpha: 1, duration: 300, delay: 2100 });

    this._makeButton(500, 545, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(770, 545, "NEXT: The Letter Trials →", 300, 44, { fill: 0x00733a, stroke: C_GREEN_BRIGHT, textColor: "#ffffff" }, () => {
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
