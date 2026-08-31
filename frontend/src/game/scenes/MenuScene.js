/**
 * MenuScene — Level Selection Menu
 * ==================================
 * Animated starfield background with 15 level cards in 5 modules.
 * Locked/unlocked state based on GameManager progress.
 */

import Phaser from "phaser";
import { GameManager } from "../GameManager.js";
import { BadgeSystem, BADGES } from "../BadgeSystem.js";
import { ProgressTracker } from "../ProgressTracker.js";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MenuScene" });
  }

  async create() {
    this.cameras.main.setBackgroundColor("#0a0a1a");
    this.stars = [];

    // Load badges from memory
    await BadgeSystem.loadBadges();

    // ── Starfield ──
    this.stars = [];
    for (let i = 0; i < 120; i++) {
      const x = Phaser.Math.Between(0, 1280);
      const y = Phaser.Math.Between(0, 720);
      const size = Phaser.Math.FloatBetween(0.5, 2.5);
      const alpha = Phaser.Math.FloatBetween(0.3, 1);
      const star = this.add.circle(x, y, size, 0xffffff, alpha);
      this.stars.push({ obj: star, speed: Phaser.Math.FloatBetween(0.1, 0.6) });
    }

    // ── Title ──
    this.add.text(640, 22, "CODEQUEST", {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: "26px",
      color: "#38bdf8",
      fontStyle: "bold",
      shadow: { blur: 20, color: "#38bdf8", fill: true },
    }).setOrigin(0.5);

    this.add.text(640, 40, "Schema Theory Based Learning", {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: "11px",
      color: "#64748b",
    }).setOrigin(0.5);

    // Get active module filter (if any)
    const activeModule = GameManager.get("activeModule");

    // Only render the selected module's levels, or all if no active module set
    const shouldShowInteger = !activeModule || activeModule === "integer";
    const shouldShowFloat = !activeModule || activeModule === "float";
    const shouldShowChar = !activeModule || activeModule === "char";
    const shouldShowString = !activeModule || activeModule === "string";
    const shouldShowOperators = !activeModule || activeModule === "operators";
    const shouldShowLoops = !activeModule || activeModule === "loops";
    const shouldShowWhileLoops = !activeModule || activeModule === "whileloops";
    const shouldShowArrays = !activeModule || activeModule === "arrays";

    // Methods world — 8 wings, Levels 25–88
    const METHOD_WINGS = [
      {
        key: "stringmethods", label: "STRING METHODS WING", color: 0xf59e0b,
        groups: [
          { key: "stringmethods_length", label: "STRING.LENGTH()", levels: [
            { title: "Level 25: The Scan Chamber", phase: "ACCRETION", desc: "Learn String.length() — measure a string's character count!", badge: BADGES.length_schema, scene: "Level25Scene", index: 24 },
            { title: "Level 26: The Inspection Line", phase: "TUNING", desc: "Fluent length() checks under a factory conveyor's time pressure!", badge: BADGES.length_schema_tuned, scene: "Level26Scene", index: 25 },
            { title: "Level 27: The Control Room", phase: "RESTRUCTURING", desc: "Build length()-driven programs — the length() trilogy complete!", badge: BADGES.length_mastery, scene: "Level27Scene", index: 26 },
          ] },
          { key: "stringmethods_charat", label: "STRING.CHARAT()", levels: [
            { title: "Level 28: The Retrieval Claw", phase: "ACCRETION", desc: "Learn charAt() — grab a single character by its index position!", badge: BADGES.charAt_schema, scene: "Level28Scene", index: 27 },
            { title: "Level 29: The Claw Trials", phase: "TUNING", desc: "Fluent charAt() index drills under time pressure!", badge: BADGES.charAt_schema_tuned, scene: "Level29Scene", index: 28 },
            { title: "Level 30: The Workshop", phase: "RESTRUCTURING", desc: "Build charAt()-driven programs — String Access Wing complete!", badge: BADGES.charAt_mastery, scene: "Level30Scene", index: 29 },
          ] },
          { key: "stringmethods_case", label: "TOUPPERCASE() / TOLOWERCASE()", levels: [
            { title: "Level 31: The Case Press", phase: "ACCRETION", desc: "Learn toUpperCase()/toLowerCase() — stamp case-converted strings!", badge: BADGES.case_methods_schema, scene: "Level31Scene", index: 30 },
            { title: "Level 32: The Press Gauntlet", phase: "TUNING", desc: "Fluent case-conversion drills under the gauntlet's pressure!", badge: BADGES.case_methods_schema_tuned, scene: "Level32Scene", index: 31 },
            { title: "Level 33: The Foundry", phase: "RESTRUCTURING", desc: "Build case-conversion programs — String Foundations Wing complete!", badge: BADGES.case_methods_mastery, scene: "Level33Scene", index: 32 },
          ] },
        ],
      },
      {
        key: "scannermethods", label: "SCANNER METHODS WING", color: 0x38bdf8,
        groups: [
          { key: "scannermethods", label: "SCANNER", levels: [
            { title: "Level 34: The Intake Dock", phase: "ACCRETION", desc: "Learn Scanner — read user input with nextInt(), nextLine() & more!", badge: BADGES.scanner_schema, scene: "Level34Scene", index: 33 },
            { title: "Level 35: The Night Shift", phase: "TUNING", desc: "Survive the nextInt()/nextLine() buffer-skip bug under pressure!", badge: BADGES.scanner_schema_tuned, scene: "Level35Scene", index: 34 },
            { title: "Level 36: The Front Desk", phase: "RESTRUCTURING", desc: "Build Scanner-driven input programs — Intake Wing complete!", badge: BADGES.scanner_mastery, scene: "Level36Scene", index: 35 },
          ] },
        ],
      },
      {
        key: "outputmethods", label: "OUTPUT METHODS WING", color: 0xfb7185,
        groups: [
          { key: "outputmethods_println", label: "PRINTLN()", levels: [
            { title: "Level 37: The Broadcast Tower", phase: "ACCRETION", desc: "Learn println() — broadcast a line, then move to the next!", badge: BADGES.println_schema, scene: "Level37Scene", index: 36 },
            { title: "Level 38: The Signal Room", phase: "TUNING", desc: "Master the + operator's dual identity — concatenation vs. addition!", badge: BADGES.println_schema_tuned, scene: "Level38Scene", index: 37 },
            { title: "Level 39: The Studio", phase: "RESTRUCTURING", desc: "Build println()-driven programs — println() trilogy complete!", badge: BADGES.println_mastery, scene: "Level39Scene", index: 38 },
          ] },
          { key: "outputmethods_print", label: "PRINT()", levels: [
            { title: "Level 40: The Whisper Booth", phase: "ACCRETION", desc: "Learn print() — the cursor stays put, no new line!", badge: BADGES.print_schema, scene: "Level40Scene", index: 39 },
            { title: "Level 41: The Live Feed", phase: "TUNING", desc: "Master the print()/println() cursor discrimination live!", badge: BADGES.print_schema_tuned, scene: "Level41Scene", index: 40 },
            { title: "Level 42: The Newsroom", phase: "RESTRUCTURING", desc: "Build print()-driven programs — print() trilogy complete!", badge: BADGES.print_mastery, scene: "Level42Scene", index: 41 },
          ] },
          { key: "outputmethods_printf", label: "PRINTF()", levels: [
            { title: "Level 43: The Composing Room", phase: "ACCRETION", desc: "Learn printf() — format-string slots for precision output!", badge: BADGES.printf_schema, scene: "Level43Scene", index: 42 },
            { title: "Level 44: The Presses", phase: "TUNING", desc: "Master printf() specifiers and precision rounding under pressure!", badge: BADGES.printf_schema_tuned, scene: "Level44Scene", index: 43 },
            { title: "Level 45: The Print Floor", phase: "RESTRUCTURING", desc: "Build printf()-driven programs — Output Wing sealed!", badge: BADGES.printf_mastery, scene: "Level45Scene", index: 44 },
          ] },
        ],
      },
      {
        key: "arraylistmethods", label: "ARRAYLIST METHODS WING", color: 0xa78bfa,
        groups: [
          { key: "arraylistmethods_add", label: "ADD()", levels: [
            { title: "Level 46: The Archive", phase: "ACCRETION", desc: "Learn ArrayList<T> and add() — the growing, typed, 0-indexed shelf!", badge: BADGES.arraylist_add_schema, scene: "Level46Scene", index: 45 },
            { title: "Level 47: The Card Catalog", phase: "TUNING", desc: "Fluent add() under candle-light — including add(index, element)!", badge: BADGES.arraylist_add_tuned, scene: "Level47Scene", index: 46 },
            { title: "Level 48: The Reading Room", phase: "RESTRUCTURING", desc: "Build add()-driven programs — the add() trilogy complete!", badge: BADGES.arraylist_add_mastery, scene: "Level48Scene", index: 47 },
          ] },
          { key: "arraylistmethods_get", label: "GET()", levels: [
            { title: "Level 49: The Consultation Desk", phase: "ACCRETION", desc: "Learn get(index) — a non-destructive read, the shelf never empties!", badge: BADGES.arraylist_get_schema, scene: "Level49Scene", index: 48 },
            { title: "Level 50: The Stacks", phase: "TUNING", desc: "Fluent get() under an hourglass — including the traversal loop!", badge: BADGES.arraylist_get_tuned, scene: "Level50Scene", index: 49 },
            { title: "Level 51: The Restoration Room", phase: "RESTRUCTURING", desc: "Build get()-driven programs — the get() trilogy complete!", badge: BADGES.arraylist_get_mastery, scene: "Level51Scene", index: 50 },
          ] },
          { key: "arraylistmethods_remove", label: "REMOVE()", levels: [
            { title: "Level 52: The Deaccession Office", phase: "ACCRETION", desc: "Learn remove() — the method that TAKES, indices shift down!", badge: BADGES.arraylist_remove_schema, scene: "Level52Scene", index: 51 },
            { title: "Level 53: The Clearing Sale", phase: "TUNING", desc: "Fluent remove() under pocket-watch pressure — mind the loop skip!", badge: BADGES.arraylist_remove_tuned, scene: "Level53Scene", index: 52 },
            { title: "Level 54: The Grand Reshelving", phase: "RESTRUCTURING", desc: "Build remove()-driven programs — ArrayList Wing sealed!", badge: BADGES.arraylist_remove_mastery, scene: "Level54Scene", index: 53 },
          ] },
        ],
      },
      {
        key: "mathclassmethods", label: "MATH CLASS METHODS WING", color: 0x60a5fa,
        groups: [
          { key: "mathclassmethods_maxmin", label: "MAX() / MIN()", levels: [
            { title: "Level 55: The Observatory", phase: "ACCRETION", desc: "Learn Math.max()/Math.min() — the curriculum's first STATIC methods!", badge: BADGES.math_max_min_schema, scene: "Level55Scene", index: 54 },
            { title: "Level 56: The Meridian Trials", phase: "TUNING", desc: "Drill the max/min direction verdict — including negative numbers!", badge: BADGES.math_max_min_tuned, scene: "Level56Scene", index: 55 },
            { title: "Level 57: The Calculation Chamber", phase: "RESTRUCTURING", desc: "Build max()/min()-driven programs — trilogy complete!", badge: BADGES.math_max_min_mastery, scene: "Level57Scene", index: 56 },
          ] },
          { key: "mathclassmethods_abs", label: "ABS()", levels: [
            { title: "Level 58: The Distance Hall", phase: "ACCRETION", desc: "Learn Math.abs() — the distance of a value from zero!", badge: BADGES.math_abs_schema, scene: "Level58Scene", index: 57 },
            { title: "Level 60: The Standards Office", phase: "RESTRUCTURING", desc: "Build abs()-driven tolerance gates and deviation surveys!", badge: BADGES.math_abs_mastery, scene: "Level60Scene", index: 59 },
          ] },
          { key: "mathclassmethods_pow", label: "POW()", levels: [
            { title: "Level 61: The Power Tower", phase: "ACCRETION", desc: "Learn Math.pow() — genuine repeated-multiplication, always double!", badge: BADGES.math_pow_schema, scene: "Level61Scene", index: 60 },
            { title: "Level 62: The Exponent Trials", phase: "TUNING", desc: "Drill pow() to reflex speed — mind the integer-division trap!", badge: BADGES.math_pow_tuned, scene: "Level62Scene", index: 61 },
            { title: "Level 63: The Formula Works", phase: "RESTRUCTURING", desc: "Build pow()-driven formulas — Math Wing sealed!", badge: BADGES.math_pow_mastery, scene: "Level63Scene", index: 62 },
          ] },
        ],
      },
      {
        key: "arraymethods", label: "ARRAY METHODS WING", color: 0xc8a05a,
        groups: [
          { key: "arraymethods_tostring", label: "TOSTRING()", levels: [
            { title: "Level 64: The Specimen Hall", phase: "ACCRETION", desc: "Learn the fixed-size array and Arrays.toString() — lift the hash label!", badge: BADGES.arrays_toString_schema, scene: "Level64Scene", index: 63 },
          ] },
          { key: "arraymethods_sort", label: "SORT()", levels: [
            { title: "Level 65: The Sorting Room", phase: "ACCRETION", desc: "Learn Arrays.sort() — the wing's first in-place mutation!", badge: BADGES.arrays_sort_schema, scene: "Level65Scene", index: 64 },
            { title: "Level 66: The Classification Trials", phase: "TUNING", desc: "Sort at speed — lexicographic order and the void-capture trap!", badge: BADGES.arrays_sort_tuned, scene: "Level66Scene", index: 65 },
            { title: "Level 67: The Arrangement Workshop", phase: "RESTRUCTURING", desc: "Build sort-and-report programs — sort() trilogy complete!", badge: BADGES.arrays_sort_restructured, scene: "Level67Scene", index: 66 },
          ] },
          { key: "arraymethods_copyof", label: "COPYOF()", levels: [
            { title: "Level 68: The Copy Bench", phase: "ACCRETION", desc: "Learn Arrays.copyOf() — a genuinely independent twin array!", badge: BADGES.arrays_copyOf_schema, scene: "Level68Scene", index: 67 },
            { title: "Level 69: The Replication Trials", phase: "TUNING", desc: "Drill the alias-vs-copy discrimination to reflex speed!", badge: BADGES.arrays_copyOf_tuned, scene: "Level69Scene", index: 68 },
            { title: "Level 70: The Curator's Bureau", phase: "RESTRUCTURING", desc: "Build duplication-and-report programs — Arrays Wing sealed!", badge: BADGES.arrays_copyOf_mastery, scene: "Level70Scene", index: 69 },
          ] },
        ],
      },
      {
        key: "typeconversionmethods", label: "TYPE CONVERSION METHODS WING", color: 0xb87333,
        groups: [
          { key: "typeconversionmethods_parseint", label: "PARSEINT()", levels: [
            { title: "Level 71: The Integer Furnace", phase: "ACCRETION", desc: "Learn Integer.parseInt() — smelt a digit String into a primitive int!", badge: BADGES.integer_parseInt_schema, scene: "Level71Scene", index: 70 },
            { title: "Level 72: The Smelting Trials", phase: "TUNING", desc: "Drill parseInt() — leading-plus, NFEs, and the overflow trap!", badge: BADGES.integer_parseInt_tuned, scene: "Level72Scene", index: 71 },
            { title: "Level 73: The Conversion Works", phase: "RESTRUCTURING", desc: "Build parseInt()-driven programs — trilogy complete!", badge: BADGES.integer_parseInt_mastery, scene: "Level73Scene", index: 72 },
          ] },
          { key: "typeconversionmethods_parsedouble", label: "PARSEDOUBLE()", levels: [
            { title: "Level 74: The Decimal Crucible", phase: "ACCRETION", desc: "Learn Double.parseDouble() — dissolve decimal text into doubles!", badge: BADGES.double_parseDouble_schema, scene: "Level74Scene", index: 73 },
            { title: "Level 75: The Precision Trials", phase: "TUNING", desc: "Drill parseDouble() — decimal edge cases and the wrong-parser bug!", badge: BADGES.double_parseDouble_tuned, scene: "Level75Scene", index: 74 },
            { title: "Level 76: The Decimal Works", phase: "RESTRUCTURING", desc: "Build parseDouble()-driven programs — trilogy complete!", badge: BADGES.double_parseDouble_mastery, scene: "Level76Scene", index: 75 },
          ] },
          { key: "typeconversionmethods_valueof", label: "VALUEOF()", levels: [
            { title: "Level 77: The Inscription Press", phase: "ACCRETION", desc: "Learn String.valueOf() — stamp ANY value onto a String!", badge: BADGES.string_valueOf_schema, scene: "Level77Scene", index: 76 },
            { title: "Level 78: The Inscription Trials", phase: "TUNING", desc: "Drill the full conversion triangle against a cooling wax seal!", badge: BADGES.string_valueOf_tuned, scene: "Level78Scene", index: 77 },
            { title: "Level 79: The Assay Bureau", phase: "RESTRUCTURING", desc: "Build valueOf()-driven programs — Type Conversion Wing sealed!", badge: BADGES.string_valueOf_mastery, scene: "Level79Scene", index: 78 },
          ] },
        ],
      },
      {
        key: "charactermethods", label: "CHARACTER METHODS WING", color: 0x4fc3f7,
        groups: [
          { key: "charactermethods_isdigit", label: "ISDIGIT()", levels: [
            { title: "Level 80: The Numeral Loupe", phase: "ACCRETION", desc: "Learn Character.isDigit() — inspect a char without changing it!", badge: BADGES.character_isDigit_schema, scene: "Level80Scene", index: 79 },
            { title: "Level 81: The Numeral Trials", phase: "TUNING", desc: "Drill isDigit() — char arithmetic and the ASCII-code trap!", badge: BADGES.character_isDigit_tuned, scene: "Level81Scene", index: 80 },
            { title: "Level 82: The Classification Works", phase: "RESTRUCTURING", desc: "Build isDigit()-driven programs — isDigit() trilogy complete!", badge: BADGES.character_isDigit_mastery, scene: "Level82Scene", index: 81 },
          ] },
          { key: "charactermethods_isletter", label: "ISLETTER()", levels: [
            { title: "Level 83: The Alphabet Lens", phase: "ACCRETION", desc: "Learn Character.isLetter() — case-blind across A–Z and a–z!", badge: BADGES.character_isLetter_schema, scene: "Level83Scene", index: 82 },
            { title: "Level 84: The Letter Trials", phase: "TUNING", desc: "Drill isLetter() — the !isDigit-vs-isLetter discrimination!", badge: BADGES.character_isLetter_tuned, scene: "Level84Scene", index: 83 },
            { title: "Level 85: The Alphabet Works", phase: "RESTRUCTURING", desc: "Build isLetter()-driven programs — isLetter() trilogy complete!", badge: BADGES.character_isLetter_mastery, scene: "Level85Scene", index: 84 },
          ] },
          { key: "charactermethods_isuppercase", label: "ISUPPERCASE()", levels: [
            { title: "Level 86: The Case Prism", phase: "ACCRETION", desc: "Learn Character.isUpperCase() — nested inside isLetter(), not exclusive!", badge: BADGES.character_isUpperCase_schema, scene: "Level86Scene", index: 85 },
            { title: "Level 87: The Case Trials", phase: "TUNING", desc: "Drill isUpperCase() — the narrow-before-broad ordering principle!", badge: BADGES.character_isUpperCase_tuned, scene: "Level87Scene", index: 86 },
            { title: "Level 88: The Grand Classification", phase: "RESTRUCTURING", desc: "Build the grand census — Character Wing sealed, curriculum complete!", badge: BADGES.character_isUpperCase_mastery, scene: "Level88Scene", index: 87 },
          ] },
        ],
      },
    ];

    if (shouldShowInteger) {
      // ── INTEGER MODULE HEADER ──
      this.add.text(640, 80, "── INTEGER MODULE ──", {
        fontFamily: "monospace",
        fontSize: "10px",
        color: "#38bdf8",
        fontStyle: "bold",
      }).setOrigin(0.5);

      const intLevels = [
        {
          title: "Level 1: Integer Discovery",
          phase: "ACCRETION",
          desc: "Catch falling integers — avoid decimals & fractions!",
          badge: BADGES.integer_explorer,
          scene: "Level1Scene",
          index: 0,
        },
        {
          title: "Level 2: Cyber Variable Arena",
          phase: "TUNING",
          desc: "Validate incoming data — ASSIGN valid ints, REJECT errors!",
          badge: BADGES.math_warrior,
          scene: "Level2Scene",
          index: 1,
        },
        {
          title: "Level 3: Integer Escape Facility",
          phase: "RESTRUCTURING",
          desc: "Hack terminals and solve int puzzles to escape!",
          badge: BADGES.logic_master,
          scene: "Level3Scene",
          index: 2,
        },
      ];

      intLevels.forEach((lvl, i) => {
        const y = 100 + i * 70;
        const unlocked = GameManager.isLevelUnlocked(lvl.index);
        const completed = GameManager.get("levelsCompleted")[lvl.index];
        const badgeUnlocked = BadgeSystem.isUnlocked(lvl.badge.id);
        this._createLevelCard(lvl, y, unlocked, completed, badgeUnlocked, 0x38bdf8);
      });
    }

    if (shouldShowFloat) {
      // ── FLOAT MODULE HEADER ──
      const floatHeaderY = shouldShowInteger ? 200 : 80;
      this.add.text(640, floatHeaderY, "── FLOAT MODULE ──", {
        fontFamily: "monospace",
        fontSize: "10px",
        color: "#4ade80",
        fontStyle: "bold",
      }).setOrigin(0.5);

      const floatLevels = [
        {
          title: "Level 4: Decimal Ocean Dive",
          phase: "ACCRETION",
          desc: "Pilot a submarine — collect floats, avoid integers!",
          badge: BADGES.float_explorer,
          scene: "Level4Scene",
          index: 3,
        },
        {
          title: "Level 5: Rocket Launch Sequence",
          phase: "TUNING",
          desc: "Complete 5 precision systems to launch the rocket!",
          badge: BADGES.precision_master,
          scene: "Level5Scene",
          index: 4,
        },
        {
          title: "Level 6: Mission Control Calculator",
          phase: "RESTRUCTURING",
          desc: "Solve float arithmetic and real-world problems!",
          badge: BADGES.calculation_wizard,
          scene: "Level6Scene",
          index: 5,
        },
      ];

      floatLevels.forEach((lvl, i) => {
        const floatBaseY = shouldShowInteger ? 220 : 100;
        const y = floatBaseY + i * 70;
        const unlocked = GameManager.isLevelUnlocked(lvl.index);
        const completed = GameManager.get("levelsCompleted")[lvl.index];
        const badgeUnlocked = BadgeSystem.isUnlocked(lvl.badge.id);
        this._createLevelCard(lvl, y, unlocked, completed, badgeUnlocked, 0x4ade80);
      });
    }

    if (shouldShowChar) {
      // ── CHAR MODULE HEADER ──
      let charHeaderY = 320;
      if (!shouldShowInteger && !shouldShowFloat) charHeaderY = 80;
      else if (!shouldShowInteger) charHeaderY = 200;
      else if (!shouldShowFloat) charHeaderY = 200;

      this.add.text(640, charHeaderY, "── CHAR MODULE ──", {
        fontFamily: "monospace",
        fontSize: "10px",
        color: "#c084fc",
        fontStyle: "bold",
      }).setOrigin(0.5);

      const charLevels = [
        {
          title: "Level 7: Alphabet Nebula Explorer",
          phase: "ACCRETION",
          desc: "Fly through space — collect valid char particles!",
          badge: BADGES.char_explorer,
          scene: "Level7Scene",
          index: 6,
        },
        {
          title: "Level 8: Character Workshop",
          phase: "TUNING",
          desc: "Validate, sort & refine chars on the factory line!",
          badge: BADGES.ascii_master,
          scene: "Level8Scene",
          index: 7,
        },
        {
          title: "Level 9: Char Quest — Typing Adventure",
          phase: "RESTRUCTURING",
          desc: "Type char code through 8 rooms (2 per realm) — rescue the Kingdom!",
          badge: BADGES.char_wizard,
          scene: "Level9Scene",
          index: 8,
        },
      ];

      charLevels.forEach((lvl, i) => {
        let charBaseY = 340;
        if (!shouldShowInteger && !shouldShowFloat) charBaseY = 100;
        else if (!shouldShowInteger) charBaseY = 220;
        else if (!shouldShowFloat) charBaseY = 220;

        const y = charBaseY + i * 70;
        const unlocked = GameManager.isLevelUnlocked(lvl.index);
        const completed = GameManager.get("levelsCompleted")[lvl.index];
        const badgeUnlocked = BadgeSystem.isUnlocked(lvl.badge.id);
        this._createLevelCard(lvl, y, unlocked, completed, badgeUnlocked, 0xc084fc);
      });
    }

    if (shouldShowString) {
      // ── STRING MODULE HEADER ──
      let stringHeaderY = 440;
      let modulesBeforeString = (shouldShowInteger ? 1 : 0) + (shouldShowFloat ? 1 : 0) + (shouldShowChar ? 1 : 0);
      stringHeaderY = 80 + modulesBeforeString * 120;

      this.add.text(640, stringHeaderY, "── STRING MODULE ──", {
        fontFamily: "monospace",
        fontSize: "10px",
        color: "#f59e0b",
        fontStyle: "bold",
      }).setOrigin(0.5);

      const stringLevels = [
        {
          title: "Level 10: Message Garden Collector",
          phase: "ACCRETION",
          desc: "Collect valid double-quoted strings in the message garden!",
          badge: BADGES.garden_keeper,
          scene: "Level10Scene",
          index: 9,
        },
        {
          title: "Level 11: String Operations Lab",
          phase: "TUNING",
          desc: "Master 6 essential string methods: length, charAt, case, concat, substring, and trim!",
          badge: BADGES.assembly_master,
          scene: "Level11Scene",
          index: 10,
        },
        {
          title: "Level 12: Advanced String Master",
          phase: "RESTRUCTURING",
          desc: "Expert split, trim, slice, includes, repeat, indexOf!",
          badge: BADGES.string_genius,
          scene: "Level12Scene",
          index: 11,
        },
      ];

      stringLevels.forEach((lvl, i) => {
        const stringBaseY = stringHeaderY + 16;
        const y = stringBaseY + i * 70;
        const unlocked = GameManager.isLevelUnlocked(lvl.index);
        const completed = GameManager.get("levelsCompleted")[lvl.index];
        const badgeUnlocked = BadgeSystem.isUnlocked(lvl.badge.id);
        this._createLevelCard(lvl, y, unlocked, completed, badgeUnlocked, 0xf59e0b);
      });
    }

    if (shouldShowOperators) {
      // ── OPERATORS MODULE HEADER ──
      let opsHeaderY = 560;
      let modulesBeforeOps = (shouldShowInteger ? 1 : 0) + (shouldShowFloat ? 1 : 0) + (shouldShowChar ? 1 : 0) + (shouldShowString ? 1 : 0);
      opsHeaderY = 80 + modulesBeforeOps * 120;

      this.add.text(640, opsHeaderY, "── OPERATORS MODULE ──", {
        fontFamily: "monospace",
        fontSize: "10px",
        color: "#ff6b6b",
        fontStyle: "bold",
      }).setOrigin(0.5);

      const operatorLevels = [
        {
          title: "Level 13: Math Magic Academy",
          phase: "ACCRETION",
          desc: "Learn operator spells — arithmetic, comparison, logical & more!",
          badge: BADGES.math_wizard,
          scene: "Level13Scene",
          index: 12,
        },
        {
          title: "Level 14: Calculation Arena",
          phase: "TUNING",
          desc: "Battle enemies with math — speed and accuracy are your weapons!",
          badge: BADGES.combat_calculator,
          scene: "Level14Scene",
          index: 13,
        },
        {
          title: "Level 15: Code Builder Pro",
          phase: "RESTRUCTURING",
          desc: "Build real Java programs using operators — professional IDE coding!",
          badge: BADGES.code_master,
          scene: "Level15Scene",
          index: 14,
        },
      ];

      operatorLevels.forEach((lvl, i) => {
        const opsBaseY = opsHeaderY + 16;
        const y = opsBaseY + i * 70;
        const unlocked = GameManager.isLevelUnlocked(lvl.index);
        const completed = GameManager.get("levelsCompleted")[lvl.index];
        const badgeUnlocked = BadgeSystem.isUnlocked(lvl.badge.id);
        this._createLevelCard(lvl, y, unlocked, completed, badgeUnlocked, 0xff6b6b);
      });
    }

    if (shouldShowLoops) {
      // ── LOOPS MODULE HEADER ──
      const loopsModulesBefore = (shouldShowInteger ? 1 : 0) + (shouldShowFloat ? 1 : 0) + (shouldShowChar ? 1 : 0) + (shouldShowString ? 1 : 0) + (shouldShowOperators ? 1 : 0);
      const loopsHeaderY = 80 + loopsModulesBefore * 120;

      this.add.text(640, loopsHeaderY, "── FOR LOOPS MODULE ──", {
        fontFamily: "monospace",
        fontSize: "10px",
        color: "#14b8a6",
        fontStyle: "bold",
      }).setOrigin(0.5);

      const loopLevels = [
        {
          title: "Level 16: Loop Train Express",
          phase: "ACCRETION",
          desc: "Configure for loops to drive a cyberpunk train through stations!",
          badge: BADGES.loop_engineer,
          scene: "Level16Scene",
          index: 15,
        },
        {
          title: "Level 17: Iteration Arena",
          phase: "TUNING",
          desc: "Rapid-fire for-loop challenges in a neon combat arena — defeat the Bug Drone!",
          badge: BADGES.loop_detective,
          scene: "Level17Scene",
          index: 16,
        },
        {
          title: "Level 18: Loop Architect",
          phase: "RESTRUCTURING",
          desc: "Build for-loops from scratch with drag-and-drop blocks to solve 8 real projects!",
          badge: BADGES.loop_architect,
          scene: "Level18Scene",
          index: 17,
        },
      ];

      loopLevels.forEach((lvl, i) => {
        const loopsBaseY = loopsHeaderY + 16;
        const y = loopsBaseY + i * 70;
        const unlocked = GameManager.isLevelUnlocked(lvl.index);
        const completed = GameManager.get("levelsCompleted")[lvl.index];
        const badgeUnlocked = BadgeSystem.isUnlocked(lvl.badge.id);
        this._createLevelCard(lvl, y, unlocked, completed, badgeUnlocked, 0x14b8a6);
      });
    }

    if (shouldShowWhileLoops) {
      // ── WHILE LOOPS MODULE HEADER ──
      const whileModulesBefore = (shouldShowInteger ? 1 : 0) + (shouldShowFloat ? 1 : 0) + (shouldShowChar ? 1 : 0) + (shouldShowString ? 1 : 0) + (shouldShowOperators ? 1 : 0) + (shouldShowLoops ? 1 : 0);
      const whileHeaderY = 80 + whileModulesBefore * 120;

      this.add.text(640, whileHeaderY, "── WHILE LOOPS MODULE ──", {
        fontFamily: "monospace",
        fontSize: "10px",
        color: "#14b8a6",
        fontStyle: "bold",
      }).setOrigin(0.5);

      const whileLevels = [
        {
          title: "Level 19: Power Core Charger",
          phase: "ACCRETION",
          desc: "Charge power cores using while loops — 10 rounds of condition-driven iteration!",
          badge: BADGES.while_schema,
          scene: "Level19Scene",
          index: 18,
        },
        {
          title: "Level 20: Debug Dimension",
          phase: "TUNING",
          desc: "15 rapid-fire while-loop challenges — predict, fix, trace, and debug before the Glitch Anomaly strikes!",
          badge: BADGES.loop_debugger,
          scene: "Level20Scene",
          index: 19,
        },
        {
          title: "Level 21: Data Stream Processor",
          phase: "RESTRUCTURING",
          desc: "Build while loops from scratch with drag-and-drop blocks to solve 8 real-world data processing projects!",
          badge: BADGES.stream_architect,
          scene: "Level21Scene",
          index: 20,
        },
      ];

      whileLevels.forEach((lvl, i) => {
        const whileBaseY = whileHeaderY + 16;
        const y = whileBaseY + i * 70;
        const unlocked = GameManager.isLevelUnlocked(lvl.index);
        const completed = GameManager.get("levelsCompleted")[lvl.index];
        const badgeUnlocked = BadgeSystem.isUnlocked(lvl.badge.id);
        this._createLevelCard(lvl, y, unlocked, completed, badgeUnlocked, 0x14b8a6);
      });
    }

    if (shouldShowArrays) {
      // ── ARRAYS MODULE HEADER ──
      const arraysModulesBefore = (shouldShowInteger ? 1 : 0) + (shouldShowFloat ? 1 : 0) + (shouldShowChar ? 1 : 0) + (shouldShowString ? 1 : 0) + (shouldShowOperators ? 1 : 0) + (shouldShowLoops ? 1 : 0) + (shouldShowWhileLoops ? 1 : 0);
      const arraysHeaderY = 80 + arraysModulesBefore * 120;

      this.add.text(640, arraysHeaderY, "── ARRAYS MODULE ──", {
        fontFamily: "monospace",
        fontSize: "10px",
        color: "#06b6d4",
        fontStyle: "bold",
      }).setOrigin(0.5);

      const arrayLevels = [
        {
          title: "Level 22: Memory Vault",
          phase: "ACCRETION",
          desc: "Store and access data in a high-security vault — learn zero-based indexing and .length!",
          badge: BADGES.array_schema,
          scene: "Level22Scene",
          index: 21,
        },
        {
          title: "Level 23: Index Interceptor",
          phase: "TUNING",
          desc: "15 rapid-fire challenges — judge, predict, fix, and interpret array operations before the packet lands!",
          badge: BADGES.index_expert,
          scene: "Level23Scene",
          index: 22,
        },
        {
          title: "Level 24: Array Forge",
          phase: "RESTRUCTURING",
          desc: "Build array-processing programs from scratch with drag-and-drop blocks to solve 8 real-world projects!",
          badge: BADGES.array_smith,
          scene: "Level24Scene",
          index: 23,
        },
      ];

      arrayLevels.forEach((lvl, i) => {
        const arraysBaseY = arraysHeaderY + 16;
        const y = arraysBaseY + i * 70;
        const unlocked = GameManager.isLevelUnlocked(lvl.index);
        const completed = GameManager.get("levelsCompleted")[lvl.index];
        const badgeUnlocked = BadgeSystem.isUnlocked(lvl.badge.id);
        this._createLevelCard(lvl, y, unlocked, completed, badgeUnlocked, 0x06b6d4);
      });
    }

    // ── METHODS WORLD (8 wings, Levels 25–88) ──
    const oldModulesShownCount = [
      shouldShowInteger, shouldShowFloat, shouldShowChar, shouldShowString,
      shouldShowOperators, shouldShowLoops, shouldShowWhileLoops, shouldShowArrays,
    ].filter(Boolean).length;
    let methodsCursorY = 80 + oldModulesShownCount * 120;

    METHOD_WINGS.forEach((wing) => {
      const hexColor = "#" + wing.color.toString(16).padStart(6, "0");

      wing.groups.forEach((group) => {
        const shouldShowGroup = !activeModule || activeModule === group.key || activeModule === wing.key;
        if (!shouldShowGroup) return;

        const headerY = methodsCursorY;
        const headerText = group.key === wing.key ? `── ${wing.label} ──` : `── ${wing.label}: ${group.label} ──`;
        this.add.text(640, headerY, headerText, {
          fontFamily: "monospace",
          fontSize: "10px",
          color: hexColor,
          fontStyle: "bold",
        }).setOrigin(0.5);

        group.levels.forEach((lvl, i) => {
          const y = headerY + 20 + i * 70;
          const unlocked = GameManager.isLevelUnlocked(lvl.index);
          const completed = GameManager.get("levelsCompleted")[lvl.index];
          const badgeUnlocked = lvl.badge ? BadgeSystem.isUnlocked(lvl.badge.id) : false;
          this._createLevelCard(lvl, y, unlocked, completed, badgeUnlocked, wing.color);
        });

        methodsCursorY = headerY + 20 + group.levels.length * 70 + 20;
      });
    });

    // ── Completion badge ──
    const allDone = GameManager.get("levelsCompleted").every(Boolean);
    if (allDone) {
      this.add.text(640, 596, "🏅 ALL MODULES COMPLETE!", {
        fontFamily: "Arial",
        fontSize: "12px",
        color: "#fbbf24",
        fontStyle: "bold",
      }).setOrigin(0.5);
    }

    // ── Reset button ──
    const resetBtn = this.add.text(1240, 628, "Reset", {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: "11px",
      color: "#475569",
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    resetBtn.on("pointerover", () => resetBtn.setColor("#ef4444"));
    resetBtn.on("pointerout", () => resetBtn.setColor("#475569"));
    resetBtn.on("pointerup", () => {
      GameManager.resetAll();
      BadgeSystem.resetAll();
      ProgressTracker.clearProgress();
      GameManager.set("activeModule", null);
      this.scene.restart();
    });

    // Scroll to module launched from Learning Games page (see games.js)
    try {
      const focus = sessionStorage.getItem("codequest_menu_focus");
      if (focus) sessionStorage.removeItem("codequest_menu_focus");

      // If activeModule is set, scroll to top to show the filtered module
      if (activeModule) {
        this.cameras.main.setScroll(0, 0);
      } else {
        // Original scroll behavior when viewing all modules
        if (focus === "float") this.cameras.main.setScroll(0, 140);
        else if (focus === "char") this.cameras.main.setScroll(0, 260);
        else if (focus === "string") this.cameras.main.setScroll(0, 380);
        else if (focus === "operators") this.cameras.main.setScroll(0, 500);
      }
    } catch { /* ignore */ }
  }

  update() {
    this.stars.forEach(s => {
      s.obj.y += s.speed;
      if (s.obj.y > 730) {
        s.obj.y = -5;
        s.obj.x = Phaser.Math.Between(0, 1280);
      }
    });
  }

  _createLevelCard(lvl, y, unlocked, completed, badgeUnlocked, accentColor) {
    const cardColor = unlocked ? 0x1e293b : 0x111827;
    const borderColor = completed ? 0x4ade80 : (unlocked ? 0x334155 : 0x1f2937);

    const card = this.add.rectangle(640, y, 1100, 54, cardColor, 0.95);
    card.setStrokeStyle(2, borderColor);

    // Status indicator
    const statusColor = completed ? 0x4ade80 : (unlocked ? accentColor : 0x475569);
    this.add.circle(110, y, 7, statusColor);

    if (completed) {
      this.add.text(110, y, "✓", {
        fontSize: "13px", color: "#000000", fontStyle: "bold",
      }).setOrigin(0.5);
    } else if (!unlocked) {
      this.add.text(110, y, "🔒", { fontSize: "14px" }).setOrigin(0.5);
    }

    // Title
    const titleColor = unlocked ? "#e2e8f0" : "#475569";
    this.add.text(130, y - 9, lvl.title, {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: "17px",
      color: titleColor,
      fontStyle: "bold",
    }).setOrigin(0, 0.5);

    this.add.text(130, y + 10, `${lvl.phase}  ·  ${lvl.desc}`, {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: "13px",
      color: "#94a3b8",
    }).setOrigin(0, 0.5);

    // Badge
    if (badgeUnlocked) {
      this.add.text(1130, y - 8, lvl.badge.emoji, {
        fontSize: "24px",
      }).setOrigin(0.5);

      this.add.text(1130, y + 11, lvl.badge.name, {
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: "10px",
        color: "#fbbf24",
      }).setOrigin(0.5);
    }

    // ── Click to Launch ──
    if (unlocked) {
      card.setInteractive({ useHandCursor: true });

      card.on("pointerover", () => {
        card.setStrokeStyle(2, accentColor);
        this.tweens.add({ targets: card, scaleX: 1.01, scaleY: 1.02, duration: 150 });
      });

      card.on("pointerout", () => {
        card.setStrokeStyle(2, borderColor);
        this.tweens.add({ targets: card, scaleX: 1, scaleY: 1, duration: 150 });
      });

      card.on("pointerup", () => {
        GameManager.set("currentLevel", lvl.index + 1);
        GameManager.resetLevel();
        GameManager.incrementAttempt(lvl.index);

        if (this.scene.isActive("UIScene")) this.scene.stop("UIScene");
        // Levels 22+ (Arrays and every Methods wing) have their own complete
        // in-scene HUD (score, lives, etc.) — the global XP/Lives overlay
        // bar is only needed by the older Levels 1–21.
        if (lvl.index < 21) this.scene.launch("UIScene");

        this.scene.start(lvl.scene);
      });
    }
  }
}
