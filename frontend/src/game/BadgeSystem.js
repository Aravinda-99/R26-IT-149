/**
 * BadgeSystem — Badge Unlock & Storage
 * =====================================
 * Manages the 3 achievement badges earned per level.
 * Persists to Firestore and provides unlock animation triggers.
 */

import { db, auth } from "../config/firebase.js";
import { GameManager } from "./GameManager.js";

// Badge definitions
export const BADGES = {
  integer_explorer: {
    id: "integer_explorer",
    name: "Integer Explorer",
    emoji: "🏆",
    description: "Completed Level 1 — Accretion Phase",
    level: 1,
    color: 0x4ade80,
  },
  math_warrior: {
    id: "math_warrior",
    name: "Math Warrior",
    emoji: "⚔️",
    description: "Completed Level 2 — Tuning Phase",
    level: 2,
    color: 0xf59e0b,
  },
  logic_master: {
    id: "logic_master",
    name: "Logic Master",
    emoji: "🧠",
    description: "Completed Level 3 — Restructuring Phase",
    level: 3,
    color: 0xa78bfa,
  },
  float_explorer: {
    id: "float_explorer",
    name: "Float Explorer",
    emoji: "🌊",
    description: "Completed Level 4 — Float Accretion Phase",
    level: 4,
    color: 0x00d4ff,
  },
  precision_master: {
    id: "precision_master",
    name: "Precision Master",
    emoji: "🔬",
    description: "Completed Level 5 — Float Tuning Phase",
    level: 5,
    color: 0x00bcd4,
  },
  calculation_wizard: {
    id: "calculation_wizard",
    name: "Calculation Wizard",
    emoji: "🧮",
    description: "Completed Level 6 — Float Restructuring Phase",
    level: 6,
    color: 0x4ade80,
  },
  char_explorer: {
    id: "char_explorer",
    name: "Char Explorer",
    emoji: "🌌",
    description: "Completed Level 7 — Char Accretion Phase",
    level: 7,
    color: 0xc084fc,
  },
  ascii_master: {
    id: "ascii_master",
    name: "ASCII Master",
    emoji: "🔤",
    description: "Completed Level 8 — Char Tuning Phase",
    level: 8,
    color: 0xf472b6,
  },
  char_wizard: {
    id: "char_wizard",
    name: "Char Champion",
    emoji: "⚔️",
    description: "Completed Level 9 — Char Quest (Restructuring)",
    level: 9,
    color: 0x818cf8,
  },
  garden_keeper: {
    id: "garden_keeper",
    name: "Garden Keeper",
    emoji: "🌸",
    description: "Completed Level 10 — String Accretion (Message Garden)",
    level: 10,
    color: 0xf472b6,
  },
  assembly_master: {
    id: "assembly_master",
    name: "Assembly Master",
    emoji: "🏭",
    description: "Completed Level 11 — String Tuning (String.length() Ruler)",
    level: 11,
    color: 0x34d399,
  },
  string_master: {
    id: "string_master",
    name: "String Master",
    emoji: "🧪",
    description: "Completed Level 11 — String Tuning (String Lab)",
    level: 11,
    color: 0x34d399,
  },
  string_genius: {
    id: "string_genius",
    name: "String Genius",
    emoji: "🎓",
    description: "Completed Level 12 — String Restructuring (Advanced String Master)",
    level: 12,
    color: 0xfbbf24,
  },
  math_wizard: {
    id: "math_wizard",
    name: "Math Wizard",
    emoji: "🧙",
    description: "Completed Level 13 — Operators Accretion (Math Magic Academy)",
    level: 13,
    color: 0xff6b6b,
  },
  combat_calculator: {
    id: "combat_calculator",
    name: "Combat Calculator",
    emoji: "⚔️",
    description: "Completed Level 14 — Operators Tuning (Calculation Arena)",
    level: 14,
    color: 0xffa500,
  },
  code_master: {
    id: "code_master",
    name: "Code Master",
    emoji: "👑",
    description: "Completed Level 15 — Operators Restructuring (Code Builder Pro)",
    level: 15,
    color: 0xffd700,
  },
  loop_engineer: {
    id: "loop_engineer",
    name: "Loop Engineer",
    emoji: "🔄",
    description: "Completed Level 16 — For Loop Accretion (Loop Train Express)",
    level: 16,
    color: 0x14b8a6,
  },
  loop_detective: {
    id: "loop_detective",
    name: "Loop Detective",
    emoji: "🔁",
    description: "Completed Level 17 — For Loop Tuning (Iteration Arena)",
    level: 17,
    color: 0x0891b2,
  },
  loop_architect: {
    id: "loop_architect",
    name: "Loop Architect",
    emoji: "⚙",
    description: "Completed Level 18 — For Loop Restructuring (Loop Architect)",
    level: 18,
    color: 0x0891b2,
  },
  while_schema: {
    id: "while_schema",
    name: "While Schema",
    emoji: "∞",
    description: "Completed Level 19 — While Loop Accretion (Power Core Charger)",
    level: 19,
    color: 0x14b8a6,
  },
  loop_debugger: {
    id: "loop_debugger",
    name: "Loop Debugger",
    emoji: "⚡",
    description: "Completed Level 20 — While Loop Tuning (Debug Dimension)",
    level: 20,
    color: 0xff00ff,
  },
  stream_architect: {
    id: "stream_architect",
    name: "Stream Architect",
    emoji: "🌊",
    description: "Completed Level 21 — While Loop Restructuring (Data Stream Processor)",
    level: 21,
    color: 0x00e5ff,
  },
  array_schema: {
    id: "array_schema",
    name: "Array Schema",
    emoji: "🗃️",
    description: "Completed Level 22 — Array Accretion (Memory Vault)",
    level: 22,
    color: 0x06b6d4,
  },
  index_expert: {
    id: "index_expert",
    name: "Index Expert",
    emoji: "🎯",
    description: "Completed Level 23 — Array Tuning (Index Interceptor)",
    level: 23,
    color: 0x00e5ff,
  },
  array_smith: {
    id: "array_smith",
    name: "Array Smith",
    emoji: "⚒️",
    description: "Completed Level 24 — Array Restructuring (Array Forge)",
    level: 24,
    color: 0xff6e00,
  },
  length_schema: {
    id: "length_schema",
    name: "length() Schema",
    emoji: "🔍",
    description: "Completed Level 25 — String Methods Accretion (The Scan Chamber)",
    level: 25,
    color: 0x00e5ff,
  },
  length_schema_tuned: {
    id: "length_schema_tuned",
    name: "length() Schema Tuned",
    emoji: "🏭",
    description: "Completed Level 26 — String Methods Tuning (The Inspection Line)",
    level: 26,
    color: 0xffd740,
  },
  length_mastery: {
    id: "length_mastery",
    name: "length() Mastery",
    emoji: "⚙️",
    description: "Completed Level 27 — String Methods Restructuring (The Control Room). length() trilogy complete!",
    level: 27,
    color: 0xffd740,
  },
  charAt_schema: {
    id: "charAt_schema",
    name: "charAt() Schema",
    emoji: "🦾",
    description: "Completed Level 28 — String Methods Accretion (The Retrieval Claw)",
    level: 28,
    color: 0x8c7ae6,
  },
  charAt_schema_tuned: {
    id: "charAt_schema_tuned",
    name: "charAt() Schema Tuned",
    emoji: "🎖️",
    description: "Completed Level 29 — String Methods Tuning (The Claw Trials)",
    level: 29,
    color: 0x00e676,
  },
  charAt_mastery: {
    id: "charAt_mastery",
    name: "charAt() Mastery",
    emoji: "🔧",
    description: "Completed Level 30 — String Methods Restructuring (The Workshop). charAt() trilogy complete! String Access Wing complete.",
    level: 30,
    color: 0xffd740,
  },
  case_methods_schema: {
    id: "case_methods_schema",
    name: "Case Methods Schema",
    emoji: "🏭",
    description: "Completed Level 31 — String Methods Accretion (The Case Press)",
    level: 31,
    color: 0x8c7ae6,
  },
  case_methods_schema_tuned: {
    id: "case_methods_schema_tuned",
    name: "Case Methods Schema Tuned",
    emoji: "🔥",
    description: "Completed Level 32 — String Methods Tuning (The Press Gauntlet)",
    level: 32,
    color: 0xff6f00,
  },
  case_methods_mastery: {
    id: "case_methods_mastery",
    name: "Case Methods Mastery",
    emoji: "⚒️",
    description: "Completed Level 33 — String Methods Restructuring (The Foundry). Case methods trilogy complete! String Foundations Wing complete.",
    level: 33,
    color: 0xffd740,
  },
  scanner_schema: {
    id: "scanner_schema",
    name: "Scanner Schema",
    emoji: "📥",
    description: "Completed Level 34 — Scanner Methods Accretion (The Intake Dock). Opens the Intake Wing!",
    level: 34,
    color: 0x4caf50,
  },
  scanner_schema_tuned: {
    id: "scanner_schema_tuned",
    name: "Scanner Schema Tuned",
    emoji: "⏎",
    description: "Completed Level 35 — Scanner Methods Tuning (The Night Shift). Survived the nextInt()/nextLine() skip bug!",
    level: 35,
    color: 0x00e676,
  },
  scanner_mastery: {
    id: "scanner_mastery",
    name: "Scanner Mastery",
    emoji: "🏅",
    description: "Completed Level 36 — Scanner Methods Restructuring (The Front Desk). Scanner trilogy complete! Intake Wing complete.",
    level: 36,
    color: 0xffd740,
  },
  println_schema: {
    id: "println_schema",
    name: "println() Schema",
    emoji: "📡",
    description: "Completed Level 37 — Output Methods Accretion (The Broadcast Tower). Opens the Output Wing!",
    level: 37,
    color: 0x00e5ff,
  },
  println_schema_tuned: {
    id: "println_schema_tuned",
    name: "println() Schema Tuned",
    emoji: "📺",
    description: "Completed Level 38 — Output Methods Tuning (The Signal Room). Mastered the + operator's dual identity!",
    level: 38,
    color: 0x00e676,
  },
  println_mastery: {
    id: "println_mastery",
    name: "println() Mastery",
    emoji: "🎬",
    description: "Completed Level 39 — Output Methods Restructuring (The Studio). println() trilogy complete!",
    level: 39,
    color: 0xffd740,
  },
  print_schema: {
    id: "print_schema",
    name: "print() Schema",
    emoji: "🎙️",
    description: "Completed Level 40 — Output Methods Accretion (The Whisper Booth). Learned print()'s cursor-resting behavior!",
    level: 40,
    color: 0x8c7ae6,
  },
  print_schema_tuned: {
    id: "print_schema_tuned",
    name: "print() Schema Tuned",
    emoji: "📺",
    description: "Completed Level 41 — Output Methods Tuning (The Live Feed). Mastered the print()/println() cursor discrimination!",
    level: 41,
    color: 0x00e676,
  },
  print_mastery: {
    id: "print_mastery",
    name: "print() Mastery",
    emoji: "📰",
    description: "Completed Level 42 — Output Methods Restructuring (The Newsroom). print() trilogy complete! Output Wing 2/3 complete.",
    level: 42,
    color: 0xffd740,
  },
  printf_schema: {
    id: "printf_schema",
    name: "printf() Schema",
    emoji: "🖨️",
    description: "Completed Level 43 — Output Methods Accretion (The Composing Room). Learned printf()'s format-string slots — the third and final Output Wing method opens!",
    level: 43,
    color: 0x4fc3f7,
  },
  printf_schema_tuned: {
    id: "printf_schema_tuned",
    name: "printf() Schema Tuned",
    emoji: "🗞️",
    description: "Completed Level 44 — Output Methods Tuning (The Presses). Mastered printf()'s specifier fluency, precision rounding, and the format-string runtime exceptions under pressure!",
    level: 44,
    color: 0xffd740,
  },
  printf_mastery: {
    id: "printf_mastery",
    name: "printf() Mastery",
    emoji: "🖨️",
    description: "Completed Level 45 — Output Methods Restructuring (The Print Floor). printf() trilogy complete AND the Output Wing sealed — 9 levels, 3 methods, one production-ready output schema!",
    level: 45,
    color: 0xffd740,
  },
  arraylist_add_schema: {
    id: "arraylist_add_schema",
    name: "add() Schema Acquired",
    emoji: "📚",
    description: "Completed Level 46 — ArrayList Methods Accretion (The Archive). Learned ArrayList<T> and add() — the growing, typed, 0-indexed shelf that opens the ArrayList Wing!",
    level: 46,
    color: 0x4fc3f7,
  },
  arraylist_add_tuned: {
    id: "arraylist_add_tuned",
    name: "add() Schema Tuned",
    emoji: "🕯️",
    description: "Completed Level 47 — ArrayList Methods Tuning (The Card Catalog). Fluent add() under candle-light time pressure, including the two-argument add(index, element) insertion overload!",
    level: 47,
    color: 0x4fc3f7,
  },
  arraylist_add_mastery: {
    id: "arraylist_add_mastery",
    name: "add() Mastery",
    emoji: "🔑",
    description: "Completed Level 48 — ArrayList Methods Restructuring (The Reading Room). The add() trilogy complete: appends, insertions, loop-populate, and the curriculum's first FOUR-wing program!",
    level: 48,
    color: 0xffd740,
  },
  arraylist_get_schema: {
    id: "arraylist_get_schema",
    name: "get() Schema Acquired",
    emoji: "🔍",
    description: "Completed Level 49 — ArrayList Methods Accretion (The Consultation Desk). Learned get(index): the non-destructive read — the ghost copy floats to the desk while the original never leaves the shelf!",
    level: 49,
    color: 0x4fc3f7,
  },
  arraylist_get_tuned: {
    id: "arraylist_get_tuned",
    name: "get() Schema Tuned",
    emoji: "⏳",
    description: "Completed Level 50 — ArrayList Methods Tuning (The Stacks). Fluent get() under hourglass pressure, including the traversal loop — i < size(), strictly less, every time!",
    level: 50,
    color: 0x4fc3f7,
  },
  arraylist_get_mastery: {
    id: "arraylist_get_mastery",
    name: "get() Mastery",
    emoji: "🔎",
    description: "Completed Level 51 — ArrayList Methods Restructuring (The Restoration Room). The get() trilogy complete: size-proof reads, the canonical traversal, the accumulator, and the curriculum's first dynamic index!",
    level: 51,
    color: 0xffd740,
  },
  arraylist_remove_schema: {
    id: "arraylist_remove_schema",
    name: "remove() Schema Acquired",
    emoji: "📤",
    description: "Completed Level 52 — ArrayList Methods Accretion (The Deaccession Office). Learned remove(): the method that TAKES — the gap closes, indices shift down, and the get-vs-remove discrimination resolves!",
    level: 52,
    color: 0x4fc3f7,
  },
  arraylist_remove_tuned: {
    id: "arraylist_remove_tuned",
    name: "remove() Schema Tuned",
    emoji: "⌚",
    description: "Completed Level 53 — ArrayList Methods Tuning (The Clearing Sale). Fluent remove() under pocket-watch pressure, including the Integer overload ambiguity and the remove-in-loop skip!",
    level: 53,
    color: 0x4fc3f7,
  },
  arraylist_remove_mastery: {
    id: "arraylist_remove_mastery",
    name: "remove() Mastery",
    emoji: "🗝️",
    description: "Completed Level 54 — ArrayList Methods Restructuring (The Grand Reshelving). The remove() trilogy complete: size-proof trims, boxed removals, and the safe backward purge!",
    level: 54,
    color: 0xffd740,
  },
  arraylist_wing_seal: {
    id: "arraylist_wing_seal",
    name: "ArrayList Wing — Complete",
    emoji: "🏛️",
    description: "Sealed the ArrayList Wing — 9 levels, 3 methods (add, get, remove), one living collection schema. The curriculum's fourth wing seal.",
    level: 54,
    color: 0xffd740,
  },
  math_max_min_schema: {
    id: "math_max_min_schema",
    name: "max()/min() Schema Acquired",
    emoji: "🔭",
    description: "Completed Level 55 — Math Methods Accretion (The Observatory), opening the Math Wing. Learned the curriculum's first STATIC methods — Math.max()/Math.min() — called on the CLASS itself, never an object!",
    level: 55,
    color: 0x4fc3f7,
  },
  math_max_min_tuned: {
    id: "math_max_min_tuned",
    name: "max()/min() Schema Tuned",
    emoji: "🔱",
    description: "Completed Level 56 — Math Methods Tuning (The Meridian Trials). Drilled the max/min direction verdict to fluency, including the negative-number rail (max is rightmost, not biggest-looking) and the cap/floor discrimination.",
    level: 56,
    color: 0xffd740,
  },
  math_max_min_mastery: {
    id: "math_max_min_mastery",
    name: "max()/min() Mastery",
    emoji: "🏆",
    description: "Completed Level 57 — Math Methods Restructuring (The Calculation Chamber), closing the max()/min() trilogy. Built the cap, the clamp, and the running-max survey — the wing's first complete production toolkit.",
    level: 57,
    color: 0xffd740,
  },
  math_abs_schema: {
    id: "math_abs_schema",
    name: "abs() Schema Acquired",
    emoji: "📏",
    description: "Completed Level 58 — Math Methods Accretion (The Distance Hall), opening the abs() trilogy. Learned that Math.abs(x) measures the DISTANCE of x from zero — never negative, positives untouched — and that Math.abs(a - b) measures the gap between two values.",
    level: 58,
    color: 0x4fc3f7,
  },
  math_abs_mastery: {
    id: "math_abs_mastery",
    name: "abs() Mastery",
    emoji: "🏛️",
    description: "Completed Level 60 — Math Methods Restructuring (The Standards Office), closing the abs() trilogy. Built error measurements, tolerance gates, and the deviation-survey capstone — the Math Wing's second complete production toolkit.",
    level: 60,
    color: 0xffd740,
  },
  math_pow_schema: {
    id: "math_pow_schema",
    name: "pow() Schema",
    emoji: "🗼",
    description: "Completed Level 61 — Math Methods Accretion (The Power Tower), opening the pow() trilogy. Built the Cascade Engine's genuine repeated-multiplication stack, mastering zero/one-exponent identities, the always-double return type, negative bases, and the fractional-exponent root teaser.",
    level: 61,
    color: 0xc8a05a,
  },
  math_pow_tuned: {
    id: "math_pow_tuned",
    name: "pow() Tuned",
    emoji: "⚖️",
    description: "Completed Level 62 — Math Methods Tuning (The Exponent Trials). Drilled pow() to reflex speed: fractional exponents, the integer-division trap, the always-double return type, and the two everyday pow() bugs — the missing cast and the base-exponent swap.",
    level: 62,
    color: 0xc8a05a,
  },
  math_pow_mastery: {
    id: "math_pow_mastery",
    name: "pow() Mastery",
    emoji: "🏗️",
    description: "Completed Level 63 — Math Methods Restructuring (The Formula Works), closing the pow() trilogy. Built circle/cube formulas, compound growth, Euclidean distance, and the standard-deviation capstone — the Math Wing's third complete production toolkit.",
    level: 63,
    color: 0xc8a05a,
  },
  math_wing_seal: {
    id: "math_wing_seal",
    name: "Math Wing — Complete",
    emoji: "🏛️",
    description: "Sealed the Math Wing — 9 levels, 3 methods (max/min, abs, pow), three instruments beneath one dome. The curriculum's fifth wing seal.",
    level: 63,
    color: 0xffd740,
  },
  arrays_toString_schema: {
    id: "arrays_toString_schema",
    name: "toString() Schema",
    emoji: "🏺",
    description: "Completed Level 64 — Arrays Methods Accretion (The Specimen Hall), opening the Arrays Wing. Learned the fixed-size array schema, lifted the cursed hash label with Arrays.toString(), and mastered bracket access and the .length property.",
    level: 64,
    color: 0xc8a05a,
  },
  arrays_sort_schema: {
    id: "arrays_sort_schema",
    name: "sort() Schema",
    emoji: "⚙️",
    description: "Completed Level 65 — Arrays Methods Accretion (The Sorting Room). Learned the wing's first in-place mutation: Arrays.sort() rearranges the array itself and returns void — no copy, no undo, read the result through the original reference.",
    level: 65,
    color: 0xc8a05a,
  },
  arrays_sort_tuned: {
    id: "arrays_sort_tuned",
    name: "sort() Reflex",
    emoji: "🧪",
    description: "Completed Level 66 — Arrays Methods Tuning (The Classification Trials). Sorted at speed: lexicographic ordering (uppercase before lowercase, numeric strings by character), the mutation-blind read, and the void-capture trap, all reflexes now.",
    level: 66,
    color: 0x5d7a5d,
  },
  arrays_sort_restructured: {
    id: "arrays_sort_restructured",
    name: "Head Arranger",
    emoji: "🗂️",
    description: "Completed Level 67 — Arrays Methods Restructuring (The Arrangement Workshop). Built complete sort-and-report programs: sort-then-extremes, the median pattern, the pre-sort capture, and a full statistical summary. Closes the sort() trilogy — Accretion, Tuning, Restructuring.",
    level: 67,
    color: 0xffd740,
  },
  arrays_copyOf_schema: {
    id: "arrays_copyOf_schema",
    name: "copyOf() Schema",
    emoji: "🧬",
    description: "Completed Level 68 — Arrays Methods Accretion (The Copy Bench). Learned the wing's third instrument: Arrays.copyOf() builds a genuinely independent twin array — truncated or padded with the type's default — distinct from aliasing, which shares the same array.",
    level: 68,
    color: 0x4fc3f7,
  },
  arrays_copyOf_tuned: {
    id: "arrays_copyOf_tuned",
    name: "copyOf() Reflex",
    emoji: "⏳",
    description: "Completed Level 69 — Arrays Methods Tuning (The Replication Trials). Certified duplication technique at speed: the length parameter, truncation and padding, and above all the alias-vs-copy discrimination — the wing's deepest schema, now reflex.",
    level: 69,
    color: 0x5d7a5d,
  },
  arrays_copyOf_mastery: {
    id: "arrays_copyOf_mastery",
    name: "Chief Curator",
    emoji: "🗝️",
    description: "Completed Level 70 — Arrays Methods Restructuring (The Curator's Bureau). Built complete duplication-and-report programs: backup-before-sort, extend-then-fill, subset-split, and a full curation manifest exercising copyOf, sort, and toString together. Closes the copyOf() trilogy — Accretion, Tuning, Restructuring.",
    level: 70,
    color: 0xffd740,
  },
  arrays_wing_seal: {
    id: "arrays_wing_seal",
    name: "Arrays Wing Sealed",
    emoji: "🏛️",
    description: "Sealed the Arrays Wing — 7 levels, 3 methods (toString, sort, copyOf), three instruments (the Display Plaque, the Arrangement Engine, the Replication Frame) mastered from first prediction to final production workflow.",
    level: 70,
    color: 0xffd740,
  },
  integer_parseInt_schema: {
    id: "integer_parseInt_schema",
    name: "parseInt() Schema",
    emoji: "🔥",
    description: "Completed Level 71 — Type Conversion Accretion (The Integer Furnace). Opened the Type Conversion Wing: Integer.parseInt() smelts a valid digit String into a primitive int, and throws NumberFormatException — a runtime crash, never a compile error — on anything else.",
    level: 71,
    color: 0xb87333,
  },
  integer_parseInt_tuned: {
    id: "integer_parseInt_tuned",
    name: "parseInt() Tuned",
    emoji: "⚖️",
    description: "Completed Level 72 — Type Conversion Tuning (The Smelting Trials). Drilled parseInt() to reflex speed: the leading-plus rule, empty/space/trailing-sign NFEs, overflow-as-NFE despite all-valid digits, and +/* precedence under the pressure gauge.",
    level: 72,
    color: 0xb87333,
  },
  integer_parseInt_mastery: {
    id: "integer_parseInt_mastery",
    name: "Master Assayer",
    emoji: "⚒️",
    description: "Completed Level 73 — Type Conversion Restructuring (The Conversion Works). Built complete conversion-and-computation programs: convert-before-arithmetic, the trim-before-parse idiom, the Scanner-to-int pipeline, and a full inventory-calculator capstone. Closes the parseInt() trilogy — Accretion, Tuning, Restructuring.",
    level: 73,
    color: 0xffd740,
  },
  double_parseDouble_schema: {
    id: "double_parseDouble_schema",
    name: "parseDouble() Schema",
    emoji: "🧪",
    description: "Completed Level 74 — Type Conversion Accretion (The Decimal Crucible). Learned Double.parseDouble(): the furnace's precision sibling, dissolving decimal text into liquid double values, accepting the decimal point that Integer.parseInt() always rejects.",
    level: 74,
    color: 0xff9800,
  },
  double_parseDouble_tuned: {
    id: "double_parseDouble_tuned",
    name: "parseDouble() Tuned",
    emoji: "⚗️",
    description: "Completed Level 75 — Type Conversion Tuning (The Precision Trials). Drilled parseDouble() to reflex speed: the parseInt/parseDouble discrimination, decimal edge cases (trailing dots, scientific notation, whitespace tolerance, NaN), and the two everyday bugs — the wrong parser and the double-to-int type mismatch.",
    level: 75,
    color: 0xff9800,
  },
  double_parseDouble_mastery: {
    id: "double_parseDouble_mastery",
    name: "Chief Assayer",
    emoji: "⚖️",
    description: "Completed Level 76 — Type Conversion Restructuring (The Decimal Works). Built complete measurement-processing programs: parser discrimination across mixed int/double records, the dissolve-then-cast pattern, and a full assay-report capstone exercising both parseInt and parseDouble together. Closes the parseDouble() trilogy — Accretion, Tuning, Restructuring.",
    level: 76,
    color: 0xffd740,
  },
  string_valueOf_schema: {
    id: "string_valueOf_schema",
    name: "valueOf() Schema",
    emoji: "🖨️",
    description: "Completed Level 77 — Type Conversion Accretion (The Inscription Press). Opened the wing's third instrument: String.valueOf() stamps ANY value — int, double, boolean, char — onto a String, running the reverse direction from parseInt/parseDouble and never throwing an exception.",
    level: 77,
    color: 0xe0d6b8,
  },
  string_valueOf_tuned: {
    id: "string_valueOf_tuned",
    name: "valueOf() Schema Tuned",
    emoji: "🕯️",
    description: "Completed Level 78 — Type Conversion Tuning (The Inscription Trials). Drilled the full conversion triangle at speed against a cooling wax seal: direction verdicts, round trips through String↔int↔String and String↔double↔String, nested conversions, and the two everyday valueOf() bugs — direction confusion and concat-as-arithmetic.",
    level: 78,
    color: 0xffd740,
  },
  string_valueOf_mastery: {
    id: "string_valueOf_mastery",
    name: "Grand Assayer",
    emoji: "⛓️",
    description: "Completed Level 79 — Type Conversion Restructuring (The Assay Bureau), closing the valueOf() trilogy. Built complete conversion-and-display programs: composite labels from mixed types, the full parse-compute-inscribe triangle, the compute-then-convert pattern, and a grand capstone firing all three wing instruments — parseInt, parseDouble, and valueOf — on one rig.",
    level: 79,
    color: 0xffd740,
  },
  type_conversion_wing_seal: {
    id: "type_conversion_wing_seal",
    name: "Type Conversion Wing — Complete",
    emoji: "🏛️",
    description: "Sealed the Type Conversion Wing — 9 levels, 3 methods (parseInt, parseDouble, valueOf), three instruments (the Integer Furnace, the Decimal Crucible, the Inscription Press) mastered from first prediction to final production workflow. The curriculum's seventh wing seal.",
    level: 79,
    color: 0xffd740,
  },
  character_isDigit_schema: {
    id: "character_isDigit_schema",
    name: "isDigit() Schema",
    emoji: "🔎",
    description: "Completed Level 80 — Character Methods Accretion (The Numeral Loupe), opening the curriculum's eighth and final wing. Learned the classification-not-conversion distinction: Character.isDigit(char) INSPECTS a single character and returns boolean — true or false — without ever changing it, unlike every prior conversion instrument.",
    level: 80,
    color: 0x4fc3f7,
  },
  character_isDigit_tuned: {
    id: "character_isDigit_tuned",
    name: "isDigit() Schema Tuned",
    emoji: "💎",
    description: "Completed Level 81 — Character Methods Tuning (The Numeral Trials). Drilled isDigit() to reflex speed against a diamond-scoring line: char arithmetic (ch - '0' and '0' + n), the ASCII-code trap of assigning a char to an int, the isDigit(int) code-point edge case, and the two everyday isDigit() bugs — the String-argument mismatch and mistaking a char's code for its value.",
    level: 81,
    color: 0xffd740,
  },
  character_isDigit_mastery: {
    id: "character_isDigit_mastery",
    name: "Master Gemologist",
    emoji: "🔎",
    description: "Completed Level 82 — Character Methods Restructuring (The Classification Works), closing the isDigit() trilogy. Built complete classification-and-extraction programs: the digit-counter loop, the classify-before-extract flagship pattern, a digit-summing accumulator, a validated Scanner input pipeline, and a grand character census splitting a string into digit and non-digit counts.",
    level: 82,
    color: 0xffd740,
  },
  character_isLetter_schema: {
    id: "character_isLetter_schema",
    name: "Prism Attuned",
    emoji: "🔷",
    description: "Completed Level 83 — Character Methods Accretion (The Alphabet Lens), opening the isLetter() trilogy. Learned the Prismatic Lens: white light refracts into three blue rays for letter-gems, passes straight through for everything else — case-blind across A–Z and a–z, mutually exclusive with isDigit().",
    level: 83,
    color: 0x4fc3f7,
  },
  character_isLetter_tuned: {
    id: "character_isLetter_tuned",
    name: "Pendulum Inspector",
    emoji: "🔷",
    description: "Completed Level 84 — Character Methods Tuning (The Letter Trials). Drilled isLetter() to fluency across 15 timed trials against a damped pendulum gem: rapid classifications, the three-zone digit/letter/other model at speed, the !isDigit-vs-isLetter discrimination, and two bug hunts — the !isDigit trap and the String-argument mismatch.",
    level: 84,
    color: 0x4fc3f7,
  },
  character_isLetter_mastery: {
    id: "character_isLetter_mastery",
    name: "Senior Gemologist",
    emoji: "🔷",
    description: "Completed Level 85 — Character Methods Restructuring (The Alphabet Works), closing the isLetter() trilogy. Built complete letter-classification programs: the letter gate, letter counter, three-branch digit/letter/other classifier, a precision-tested letter counter that resists the !isDigit trap, a Scanner-validated name checker, and a grand character analysis splitting a string into letters, digits, and other.",
    level: 85,
    color: 0x4fc3f7,
  },
  character_isUpperCase_schema: {
    id: "character_isUpperCase_schema",
    name: "Case Specialist",
    emoji: "💠",
    description: "Completed Level 86 — Character Methods Accretion (The Case Prism), opening the isUpperCase() schema — the Character Wing's third and final method. Learned the Case Prism: uppercase letters refract white-blue beams UPWARD, lowercase letters refract deeper blue beams DOWNWARD, non-letters pass straight through. isUpperCase is NESTED inside isLetter (every uppercase letter is also a letter) rather than mutually exclusive, unlike isDigit and isLetter.",
    level: 86,
    color: 0xe8eaf6,
  },
  character_isUpperCase_tuned: {
    id: "character_isUpperCase_tuned",
    name: "Crystal Inspector",
    emoji: "💠",
    description: "Completed Level 87 — Character Methods Tuning (The Case Trials). Drilled isUpperCase() to fluency across 15 timed trials against a growing crystal encasement: rapid classifications, the subset relationship (isUpperCase ⊂ isLetter) at speed, the narrow-before-broad ordering principle, and two bug hunts — using isLetter where isUpperCase was needed, and reversing the if/else-if order.",
    level: 87,
    color: 0xe8eaf6,
  },
  character_isUpperCase_mastery: {
    id: "character_isUpperCase_mastery",
    name: "Grand Gemologist",
    emoji: "👑",
    description: "Completed Level 88 — Character Methods Restructuring (The Grand Classification), closing the isUpperCase() trilogy. Built complete character-analysis programs combining all three Character methods: the case gate, uppercase counter, four-zone classifier, password validator, Scanner-driven input analyzer, and the grand census splitting a string into uppercase, lowercase, digit, and other counts.",
    level: 88,
    color: 0xffd740,
  },
  character_wing_complete: {
    id: "character_wing_complete",
    name: "Character Wing Sealed",
    emoji: "🏛️",
    description: "Sealed the Character Wing — the curriculum's eighth and final wing. Three methods mastered end to end: Character.isDigit(), Character.isLetter(), Character.isUpperCase() — each through Accretion, Tuning, and Restructuring. Nine levels, three instruments, one complete classification toolkit.",
    level: 88,
    color: 0xffd740,
  },
};

// In-memory cache of unlocked badges
let unlockedBadges = new Set();

export const BadgeSystem = {

  /**
   * Check if a badge is already unlocked.
   */
  isUnlocked(badgeId) {
    return unlockedBadges.has(badgeId);
  },

  /**
   * Get all unlocked badge IDs.
   */
  getUnlockedBadges() {
    return [...unlockedBadges];
  },

  /**
   * Get badge definition by ID.
   */
  getBadge(badgeId) {
    return BADGES[badgeId] || null;
  },

  /**
   * Unlock a badge — saves to Firestore and emits event.
   * Returns true if newly unlocked, false if already had it.
   */
  async unlock(badgeId) {
    if (unlockedBadges.has(badgeId)) return false;

    const badge = BADGES[badgeId];
    if (!badge) return false;

    unlockedBadges.add(badgeId);

    // Update GameManager state
    const current = GameManager.get("badges") || [];
    if (!current.includes(badgeId)) {
      GameManager.set("badges", [...current, badgeId]);
    }

    // Emit event for UIScene to display notification
    GameManager._emit("badgeUnlocked", badge);

    // Persist immediately via ProgressTracker
    const { ProgressTracker } = await import("./ProgressTracker.js");
    ProgressTracker.saveProgress(GameManager.getState());

    return true;
  },

  async loadBadges() {
    unlockedBadges.clear();
    const current = GameManager.get("badges") || [];
    current.forEach(id => unlockedBadges.add(id));
  },

  /**
   * Reset all badges (for testing).
   */
  resetAll() {
    unlockedBadges.clear();
  },
};
