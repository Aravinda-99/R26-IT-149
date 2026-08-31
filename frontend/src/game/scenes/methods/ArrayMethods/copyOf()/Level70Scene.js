/**
 * Level 70 — "The Curator's Bureau" (Arrays Methods: Restructuring Phase —
 * copyOf() trilogy finale + ARRAYS WING SEAL)
 * ===========================================================================
 * The learner CONSTRUCTS complete duplication-and-report programs — no
 * multiple choice. Reuses the L27→L67 code-canvas/parts-bin/RUN
 * architecture. The rig hosts the mini Replication Frame (copyOf, from
 * L68/69), the mini Arrangement Engine (sort, from L65-67, sharing the
 * Replication Frame's trays), and dual mini Display Plaques (toString,
 * from L64) — cross-wired so any combination of copyOf/sort/toString
 * resolves honestly.
 *
 * A genuine unified mini-interpreter executes the assembled program:
 * copyOf (independent-array creation, truncation, padding by type),
 * alias (bare-variable assignment shares the SAME backing array —
 * reference identity, not a deep copy), sort (in-place, on whichever
 * array the call targets), toString, bracket access/assignment (general
 * index expressions: literal, length, length±N — bounds-checked),
 * Scanner, and println concatenation. Wrong builds yield REAL outcomes —
 * never scripted: M1's alias build shows both trays mutated; M3's
 * alias-backup shows both lines sorted; M4's alias-split shows full
 * length; M5's index-0 build overwrites the first specimen; M6's split-
 * wrong-source produces an unsorted "humblest" subset.
 */

import Phaser from "phaser";
import { GameManager } from "../../../../GameManager.js";
import { WellbeingAPI } from "../../../../../api/api.js";
import { BadgeSystem } from "../../../../BadgeSystem.js";

const W = 1280, H = 720;

const C_CYAN = 0x4fc3f7, C_GOLD = 0xffd740, C_ORANGE = 0xff9800, C_BLUE_GRAY = 0x8ea6c8;
const C_GREEN_BRIGHT = 0x00e676, C_RED = 0xf44336, C_GRAY = 0x78909c, C_BRASS = 0xc8a05a;
const HEX_CYAN = "#4fc3f7", HEX_GOLD = "#ffd740", HEX_ORANGE = "#ff9800", HEX_BLUE_GRAY = "#8ea6c8";
const HEX_GREEN_BRIGHT = "#00e676", HEX_RED = "#f44336", HEX_GRAY = "#78909c", HEX_BRASS = "#c8a05a";

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
const TUTORIAL_KEY = "level70_tutorial_done";

// Rig internal layout — mini Replication Frame (orig top-left, copy1
// top-right, bridge between), a second copy tray (copy2, bottom, for
// Mission 6's split-from-sorted-data), typed containers with reference
// indicators, output ticker, Scanner tape.
const MINI_ORIG_X0 = OX + 14, MINI_ORIG_X1 = OX + 150;
const MINI_COPY1_X0 = OX + 162, MINI_COPY1_X1 = OX + 298;
const MINI_TRAY_Y0 = OY + 34, MINI_TRAY_Y1 = OY + 84;
const MINI_COPY2_X0 = OX + 14, MINI_COPY2_X1 = OX + 298;
const MINI_TRAY2_Y0 = OY + 96, MINI_TRAY2_Y1 = OY + 134;
const MINI_BRIDGE_CY = (MINI_TRAY_Y0 + MINI_TRAY_Y1) / 2;
const CONT_X = OX + 310, CONT_Y0 = OY + 30;
const TAPE_Y = OY + 14;
const TICKER_Y = OY + 205;

// ══════════════════════════════════════════════════════════════
// MISSION CONFIGURATION
// ══════════════════════════════════════════════════════════════
const MISSIONS = [
  // ── Mission 1: The Twin Trays ──
  { mission: 1, title: "The Twin Trays",
    brief: "Create an INDEPENDENT copy of the specimen tray, modify only the copy, and prove the original is untouched. For {10, 20, 30}:\nOriginal: [10, 20, 30]\nCopy: [99, 20, 30]",
    skeleton: [
      "int[] data = /* populated by test */;",
      "",
      "int[] twin = <slot:copy>;",
      "twin[0] = 99;",
      "",
      'System.out.println("Original: " + <slot:showA>);',
      'System.out.println("Copy: " + <slot:showB>);',
    ],
    slots: [
      { id: "copy", hint: "the independent copy" },
      { id: "showA", hint: "display the original" },
      { id: "showB", hint: "display the copy" },
    ],
    palette: [
      { code: "Arrays.copyOf(data, data.length)", correct: true, slotId: "copy" },
      { code: "data", tag: "alias_is_copy_belief", slotId: "copy" },
      { code: "Arrays.copyOf(data, data.length - 1)", tag: "copyOf_length_off_by_one", slotId: "copy" },
      { code: "Arrays.toString(data)", correct: true, slotId: "showA" },
      { code: "Arrays.toString(twin)", correct: true, slotId: "showB" },
      { code: "data", tag: "array_prints_contents_belief", slotId: "showA" },
      { code: "twin", tag: "array_prints_contents_belief", slotId: "showB" },
    ],
    tests: [
      { arrayName: "data", initialArray: [10, 20, 30], expectedOutput: "Original: [10, 20, 30]⏎Copy: [99, 20, 30]" },
      { arrayName: "data", initialArray: [5, 5], expectedOutput: "Original: [5, 5]⏎Copy: [99, 5]" },
      { arrayName: "data", initialArray: [7], expectedOutput: "Original: [7]⏎Copy: [99]" },
    ],
    postMissionNote: "Bit: 'Two trays, two lives — copyOf built the twin, toString labelled both. The alias build would have shown the mutation twice; the truncated build loses a slot. Length matters; the tests find the holes.'",
    concept: "copy_and_prove" },

  // ── Mission 2: The Extended Roster ──
  { mission: 2, title: "The Extended Roster",
    brief: 'The museum acquires 2 new specimens. Extend the collection to fit them, then fill the new slots. For {"Amber", "Jade"} + "Opal", "Ruby":\nRoster: [Amber, Jade, Opal, Ruby]',
    skeleton: [
      "String[] roster = /* populated by test */;",
      "",
      "String[] extended = <slot:extend>;",
      'extended[<slot:idx3>] = "Opal";',
      'extended[<slot:idx4>] = "Ruby";',
      "",
      'System.out.println("Roster: " + Arrays.toString(extended));',
    ],
    slots: [
      { id: "extend", hint: "the extended copy" },
      { id: "idx3", hint: "index for Opal" },
      { id: "idx4", hint: "index for Ruby" },
    ],
    palette: [
      { code: "Arrays.copyOf(roster, 4)", correct: true, slotId: "extend" },
      { code: "Arrays.copyOf(roster, roster.length + 2)", correct: true, alsoCorrect: true, slotId: "extend" },
      { code: "Arrays.copyOf(roster, 2)", tag: "no_room_for_extension", slotId: "extend" },
      { code: "Arrays.copyOf(roster, roster.length)", tag: "no_room_for_extension", slotId: "extend" },
      { code: "2", correct: true, slotId: "idx3" },
      { code: "3", tag: "index_off_by_one_position", slotId: "idx3" },
      { code: "3", correct: true, slotId: "idx4" },
      { code: "4", tag: "length_not_minus_one_belief", slotId: "idx4" },
    ],
    tests: [
      { arrayName: "roster", initialArray: ["Amber", "Jade"], expectedOutput: "Roster: [Amber, Jade, Opal, Ruby]" },
    ],
    postMissionNote: "Bit: 'copyOf makes room; brackets fill it. length + 2 gives you the future space; the new indices sit right where the old array ended: length, length+1. The closest an array gets to add().'",
    concept: "extend_pattern" },

  // ── Mission 3: The Preserved Original (THE BACKUP — FLAGSHIP) ──
  { mission: 3, title: "The Preserved Original",
    brief: "Sort the data for display, but PRESERVE the original order for the archive. For {30, 10, 20}:\nOriginal: [30, 10, 20]\nSorted: [10, 20, 30]",
    skeleton: [
      "int[] data = /* populated by test */;",
      "",
      "int[] archive = <slot:backup>;",
      "Arrays.sort(<slot:sortTarget>);",
      "",
      'System.out.println("Original: " + Arrays.toString(archive));',
      'System.out.println("Sorted: " + Arrays.toString(data));',
    ],
    slots: [
      { id: "backup", hint: "the archive backup" },
      { id: "sortTarget", hint: "sort THIS one" },
    ],
    isBackupFlagship: true,
    palette: [
      { code: "Arrays.copyOf(data, data.length)", correct: true, slotId: "backup" },
      { code: "data", tag: "alias_backup_bug", slotId: "backup" },
      { code: "Arrays.toString(data)", tag: "toString_is_copy_belief", slotId: "backup" },
      { code: "Arrays.copyOf(data, 0)", tag: "empty_backup_belief", slotId: "backup" },
      { code: "data", correct: true, slotId: "sortTarget" },
      { code: "archive", tag: "sort_wrong_target", slotId: "sortTarget" },
    ],
    tests: [
      { arrayName: "data", initialArray: [30, 10, 20], expectedOutput: "Original: [30, 10, 20]⏎Sorted: [10, 20, 30]" },
      { arrayName: "data", initialArray: [5, 3, 8, 1], expectedOutput: "Original: [5, 3, 8, 1]⏎Sorted: [1, 3, 5, 8]" },
      { arrayName: "data", initialArray: [42], expectedOutput: "Original: [42]⏎Sorted: [42]" },
    ],
    postMissionNote: "Bit (nodding, pressing a key against the sash): 'THE BACKUP-BEFORE-SORT — every serious catalogue in every real museum. copyOf makes the archive; sort touches only the working copy. The alias build would have destroyed the original silently; only copyOf builds a bridge that mutation can't cross.'",
    concept: "backup_flagship" },

  // ── Mission 4: The Subset Split ──
  { mission: 4, title: "The Subset Split",
    brief: "The collection has been ranked. Publish the TOP 3 (first 3 elements of the sorted array). For sorted {12, 33, 45, 78, 91}:\nTop 3: [12, 33, 45]",
    skeleton: [
      "int[] ranked = /* pre-sorted, populated by test */;",
      "",
      "int[] top = <slot:split>;",
      "",
      'System.out.println("Top 3: " + Arrays.toString(top));',
    ],
    slots: [{ id: "split", hint: "the top-3 subset" }],
    palette: [
      { code: "Arrays.copyOf(ranked, 3)", correct: true, slotId: "split" },
      { code: "Arrays.copyOf(ranked, ranked.length)", tag: "no_split_belief", slotId: "split" },
      { code: "ranked", tag: "alias_is_split_belief", slotId: "split" },
      { code: "Arrays.copyOf(ranked, ranked.length - 3)", tag: "copyOf_length_off_by_one", slotId: "split" },
      { code: "Arrays.toString(ranked)", tag: "toString_is_split_belief", slotId: "split" },
    ],
    tests: [
      { arrayName: "ranked", initialArray: [12, 33, 45, 78, 91], expectedOutput: "Top 3: [12, 33, 45]" },
      { arrayName: "ranked", initialArray: [1, 2, 3, 4, 5, 6, 7], expectedOutput: "Top 3: [1, 2, 3]" },
      { arrayName: "ranked", initialArray: [100, 200, 300], expectedOutput: "Top 3: [100, 200, 300]" },
    ],
    postMissionNote: "Bit: 'copyOf as a SPLITTER: length 3 gives you the first three. Perfect for top-N lists, page-1 subsets, prefix extractions — anywhere you want the head of a collection. The length parameter IS the split point.'",
    concept: "subset_split_pattern" },

  // ── Mission 5: The Donation Register (Cross-Wing — Scanner + copyOf + extend) ──
  { mission: 5, title: "The Donation Register",
    brief: 'A donor adds ONE specimen to the museum\'s collection. Read the donor\'s specimen name, extend the collection by 1, place the new specimen, and publish the updated register.\nFor collection {"Amber", "Jade"} and input "Opal":\nRegister: [Amber, Jade, Opal]',
    skeleton: [
      "Scanner sc = new Scanner(System.in);",
      "String[] collection = /* populated by test */;",
      "",
      "String donation = <slot:read>;",
      "String[] updated = <slot:extend>;",
      "updated[<slot:idx>] = donation;",
      "",
      'System.out.println("Register: " + Arrays.toString(updated));',
    ],
    slots: [
      { id: "read", hint: "read the donation" },
      { id: "extend", hint: "extend by 1" },
      { id: "idx", hint: "index for the donation" },
    ],
    isCrossWing: true,
    palette: [
      { code: "sc.nextLine()", correct: true, slotId: "read" },
      { code: "sc.nextInt()", tag: "wrong_scanner_method", slotId: "read" },
      { code: "Arrays.copyOf(collection, collection.length + 1)", correct: true, slotId: "extend" },
      { code: "Arrays.copyOf(collection, collection.length)", tag: "no_room_for_donation", slotId: "extend" },
      { code: "collection.length", correct: true, slotId: "idx" },
      { code: "updated.length - 1", correct: true, alsoCorrect: true, slotId: "idx" },
      { code: "collection.length + 1", tag: "index_past_end", slotId: "idx" },
      { code: "0", tag: "hardcoded_index_overwrite", slotId: "idx" },
    ],
    tests: [
      { arrayName: "collection", initialArray: ["Amber", "Jade"], input: ["Opal"], expectedOutput: "Register: [Amber, Jade, Opal]" },
      { arrayName: "collection", initialArray: ["Quartz"], input: ["Beryl"], expectedOutput: "Register: [Quartz, Beryl]" },
      { arrayName: "collection", initialArray: [], input: ["First"], expectedOutput: "Register: [First]" },
    ],
    postMissionNote: "Bit: 'Scanner delivers the donation; copyOf makes room; brackets place it at the new end. collection.length is the index of the FIRST NEW SLOT — because indices go 0 to length-1, so length itself is the vacant space at the end. Three wings collaborating on one register.'",
    concept: "scanner_extend_pipeline" },

  // ── Mission 6: The Curator's Manifest (GRAND CAPSTONE) ──
  { mission: 6, title: "The Curator's Manifest",
    brief: "The annual manifest: publish the original acquisition order (untouched), the sorted display order, and the LOWEST 3 (the humblest specimens). For {45, 12, 78, 33, 91}:\nAcquired: [45, 12, 78, 33, 91]\nSorted: [12, 33, 45, 78, 91]\nHumblest 3: [12, 33, 45]",
    skeleton: [
      "int[] data = /* populated by test */;",
      "",
      "int[] archive = <slot:backup>;",
      "<slot:sort>",
      "int[] humblest = <slot:split>;",
      "",
      'System.out.println("Acquired: " + Arrays.toString(archive));',
      'System.out.println("Sorted: " + Arrays.toString(data));',
      'System.out.println("Humblest 3: " + Arrays.toString(humblest));',
    ],
    slots: [
      { id: "backup", hint: "preserve the original" },
      { id: "sort", hint: "sort the working copy" },
      { id: "split", hint: "the humblest 3" },
    ],
    isCapstone: true,
    palette: [
      { code: "Arrays.copyOf(data, data.length)", correct: true, slotId: "backup" },
      { code: "data", tag: "alias_backup_bug", slotId: "backup" },
      { code: "Arrays.sort(data);", correct: true, slotId: "sort" },
      { code: "Arrays.sort(archive);", tag: "sort_wrong_target", slotId: "sort" },
      { code: "archive = Arrays.sort(data);", tag: "sort_returns_new_array_belief", slotId: "sort" },
      { code: "Arrays.copyOf(data, 3)", correct: true, slotId: "split" },
      { code: "Arrays.copyOf(archive, 3)", tag: "split_wrong_source", slotId: "split" },
      { code: "Arrays.copyOf(data, data.length)", tag: "no_split_belief", slotId: "split" },
    ],
    tests: [
      { arrayName: "data", initialArray: [45, 12, 78, 33, 91], expectedOutput: "Acquired: [45, 12, 78, 33, 91]⏎Sorted: [12, 33, 45, 78, 91]⏎Humblest 3: [12, 33, 45]" },
      { arrayName: "data", initialArray: [100, 50, 75, 25, 90, 60, 40], expectedOutput: "Acquired: [100, 50, 75, 25, 90, 60, 40]⏎Sorted: [25, 40, 50, 60, 75, 90, 100]⏎Humblest 3: [25, 40, 50]" },
      { arrayName: "data", initialArray: [5, 5, 5, 5], expectedOutput: "Acquired: [5, 5, 5, 5]⏎Sorted: [5, 5, 5, 5]⏎Humblest 3: [5, 5, 5]" },
    ],
    postMissionNote: "Bit (quiet, master keys catching the light): 'The full manifest — three arrays, three toStrings, one workflow. Preserve, arrange, subset. Backup with copyOf, sort the working copy, subset with copyOf again. Three uses of the bench in one program. Chief Curator — the wing is yours. Ring the bell.'",
    concept: "curator_manifest_capstone" },
];

const MISCONCEPTION_FEEDBACK = {
  alias_backup_bug: "The backup was destroyed alongside the sort — one tray with two labels can't be preserved by wishing. copyOf builds a separate tray; the reference indicator shows a SOLID boundary. The alias's dashed line is the warning.",
  alias_is_copy_belief: "equals aliases; only copyOf duplicates. Change one label, both labels see the change — because they point to the same tray.",
  alias_is_split_belief: "collection = ranked doesn't extract a subset — it just gives the same tray a second name. A true split needs a NEW tray with the chosen elements.",
  copyOf_length_off_by_one: "length is TOTAL, not last-index. For a full copy: length. For 3 elements: 3. For a subset: the count you want. Never length - 1 (that leaves one behind) or the reverse.",
  no_room_for_extension: "The copy needs to be BIGGER than the original to hold new specimens. length + n adds n empty slots for you to fill; length alone gives no room.",
  no_room_for_donation: "collection.length copies exactly — no space for the donation. length + 1 makes one new slot at index length.",
  no_split_belief: "A subset needs a length smaller than the source — copyOf(arr, N) with N < length. Copying with length gives you the whole thing, not a subset.",
  index_off_by_one_position: "roster.length is 2 — indices 0 and 1 are filled, index 2 is the first NEW slot. Not 3.",
  length_not_minus_one_belief: "For the 4-slot extended array, indices are 0, 1, 2, 3 — the LAST valid index is 3, not 4.",
  sort_wrong_target: "sort() sorted the BACKUP and left the working copy alone — swapped. The archive should stay preserved; sort the working data.",
  split_wrong_source: "You copied from ARCHIVE (unsorted) — the humblest 3 needs the SORTED data. Split from the sorted working copy, not the untouched backup.",
  hardcoded_index_overwrite: "Index 0 overwrites the first specimen — the donation replaces the original entry. The new specimen goes at the END, at index collection.length.",
  index_past_end: "collection.length + 1 is one slot past the extended array's last index. The vacant space sits AT collection.length, not beyond.",
  empty_backup_belief: "copyOf(data, 0) creates an empty array — an archive with nothing to archive. Copy the full length: data.length.",
  sort_returns_new_array_belief: "sort returns void — you can't assign it. The compile stamp said so. Call sort as a statement; read the array afterward.",
  toString_is_copy_belief: "toString returns a STRING — text, not an int[]. The compile refused it. A copy needs copyOf.",
  toString_is_split_belief: "Same lesson at the wing's last mission gates — toString gives text, copyOf gives an independent array.",
  array_prints_contents_belief: "The plaque assembly needs Arrays.toString — plain println gives the hash. Sort matters, toString matters, both are needed.",
  wrong_scanner_method: "String needs nextLine(); nextInt() returns an int and refuses to assign to a String variable.",
  sort_hits_both_belief: "One tray, one sort. If both changed, they were the same tray — check for aliases.",
  truncation_silent_bug: "The copy came out short and quiet — length matters. Match the source's length for a full duplicate.",
  int_default_null_belief: "int compartments default to 0, not null. Objects (like String) default to null.",
  padding_repeats_belief: "Extras fill with the TYPE'S DEFAULT, never repeats of existing values. Empty compartments are empty.",
  arrays_instance_call_belief: "Arrays.copyOf, Arrays.sort, Arrays.toString — all static, always. The bench lives in the class.",
};

const HINTS = {
  1: "Arrays.copyOf(data, data.length) for the copy; Arrays.toString for both displays.",
  2: "Arrays.copyOf(roster, 4) or roster.length + 2 for the extend; index 2 for Opal, index 3 for Ruby.",
  3: "Arrays.copyOf(data, data.length) for the archive BEFORE sorting; Arrays.sort(data) — sort the working copy, not the archive.",
  4: "Arrays.copyOf(ranked, 3) — a length smaller than the source gives you the first N elements.",
  5: "sc.nextLine() for the donation; Arrays.copyOf(collection, collection.length + 1) to make room; collection.length for the new index.",
  6: "Backup first: Arrays.copyOf(data, data.length). Then Arrays.sort(data). Then split the SORTED data: Arrays.copyOf(data, 3).",
};

export class Level70Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level70Scene" });
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
    this.backupProactive = {};
    this.extendClean = {};
    this.splitClean = {};
    this.crossWingClean = {};
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
    this.createBureauInterior();
    this.createInstrumentSilhouettes();
    this.createWingCrest();
    this.createChandelier();
    this.createBureauFloor();
    this.createAmbientParticles();
    this.createCodeCanvas();
    this.createBlockPalette();
    this.createRunButton();
    this.createRigWindow();
    this.createMiniReplicationFrame();
    this.createMiniPlaquesDual();
    this.createMiniContainersWithRefs();
    this.createMiniOutputTicker();
    this.createMiniScannerCameo();
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
  // SETUP — THE CURATOR'S BUREAU INTERIOR
  // ══════════════════════════════════════════════════════════════

  createParticleTexture() {
    if (!this.textures.exists("l70_dot")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("l70_dot", 8, 8);
      g.destroy();
    }
  }

  createBackground() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x0a1208).setDepth(0);
  }

  createBureauInterior() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x0d0a06, 0.7);
    g.lineStyle(3, 0x8a6435, 1);
    g.fillRect(200, 30, 580, 140);
    g.strokeRect(200, 30, 580, 140);
    this._ledgerLines = [];
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 2; c++) {
        const lx = 220 + c * 290, ly = 50 + r * 22;
        const t = this.add.text(lx, ly, "· · · · · · · · · ·", { font: "10px Georgia", color: "#e8eaf6" }).setAlpha(0.12).setDepth(2);
        this._ledgerLines.push(t);
      }
    }
    this._ledgerFrame = g;

    const bg = this.add.graphics().setDepth(2);
    bg.fillStyle(0x0a1208, 1);
    bg.lineStyle(1, C_GOLD, 0.5);
    bg.fillRoundedRect(450, 12, 380, 26, 3);
    bg.strokeRoundedRect(450, 12, 380, 26, 3);
    this.add.text(640, 25, "T H E   C U R A T O R ' S   B U R E A U", { font: "bold 15px Georgia", color: HEX_GOLD }).setOrigin(0.5).setAlpha(0.8).setDepth(3);
  }

  createInstrumentSilhouettes() {
    this.silhouettes = {};
    const drawTray = (g, x, y) => {
      g.lineStyle(1.5, C_BLUE_GRAY, 1);
      g.strokeRect(x - 16, y - 6, 32, 12);
      g.lineBetween(x, y - 6, x, y + 6);
      g.strokeRect(x - 10, y + 10, 20, 6);
    };
    const drawEngine = (g, x, y) => {
      g.lineStyle(1.5, C_BLUE_GRAY, 1);
      g.lineBetween(x - 16, y, x + 16, y);
      g.lineBetween(x, y, x, y - 14);
      g.strokeRect(x - 4, y - 18, 8, 6);
    };
    const drawTwinTrays = (g, x, y) => {
      g.lineStyle(1.5, C_BLUE_GRAY, 1);
      g.strokeRect(x - 18, y - 6, 14, 12);
      g.strokeRect(x + 4, y - 6, 14, 12);
      g.lineBetween(x - 4, y, x + 4, y);
    };
    const specs = [
      { key: "toString", x: 1120, y: 120, draw: drawTray },
      { key: "sort", x: 1150, y: 160, draw: drawEngine },
      { key: "copyOf", x: 1120, y: 200, draw: drawTwinTrays },
    ];
    specs.forEach(({ key, x, y, draw }) => {
      const g = this.add.graphics().setDepth(3).setAlpha(0.25);
      draw(g, x, y);
      this.silhouettes[key] = { g, x, y, draw };
    });
  }

  brightenSilhouettes(alpha = 1) {
    Object.values(this.silhouettes).forEach(({ g }) => this.tweens.add({ targets: g, alpha, duration: 500 }));
  }

  createWingCrest() {
    const c = this.add.container(880, 56).setDepth(4);
    const g = this.add.graphics();
    g.lineStyle(2, C_BRASS, 1);
    g.beginPath();
    g.moveTo(0, -18); g.lineTo(14, -12); g.lineTo(14, 6); g.lineTo(0, 20); g.lineTo(-14, 6); g.lineTo(-14, -12);
    g.closePath();
    g.strokePath();
    const plaque = this.add.text(0, -8, "▭", { font: "9px Arial", color: HEX_BLUE_GRAY }).setOrigin(0.5).setAlpha(0.7);
    const sort = this.add.text(0, 0, "⚙", { font: "9px Arial", color: HEX_CYAN }).setOrigin(0.5).setAlpha(0.7);
    const dual = this.add.text(0, 9, "⧉", { font: "9px Arial", color: HEX_GOLD }).setOrigin(0.5).setAlpha(0.7);
    c.add([g, plaque, sort, dual]);
    c.setAlpha(0.4);
    this._crest = { c, g, state: "idle" };
  }

  pulseCrest(state) {
    const s = this._crest;
    s.state = state;
    if (state === "idle") s.c.setAlpha(0.4);
    else if (state === "session") s.c.setAlpha(0.8);
    else if (state === "gold") {
      this.tweens.add({
        targets: s.c, scaleX: 0, duration: 150,
        onComplete: () => {
          s.g.lineStyle(2, C_GOLD, 1);
          s.g.beginPath();
          s.g.moveTo(0, -18); s.g.lineTo(14, -12); s.g.lineTo(14, 6); s.g.lineTo(0, 20); s.g.lineTo(-14, 6); s.g.lineTo(-14, -12);
          s.g.closePath();
          s.g.strokePath();
          s.c.setAlpha(1);
          this.tweens.add({ targets: s.c, scaleX: 1, duration: 150 });
        },
      });
    }
  }

  updateCrestPulse(time) {
    if (!this._crest || this._crest.state !== "session") return;
    this._crest.c.setAlpha(0.6 + Math.abs(Math.sin(time * 0.006)) * 0.4);
  }

  createChandelier() {
    const c = this.add.container(640, 90).setDepth(4);
    const g = this.add.graphics();
    g.fillStyle(C_BRASS, 0.6);
    g.fillCircle(0, 0, 4);
    for (let i = 0; i < 4; i++) {
      const a = (Math.PI / 2) * i;
      g.lineStyle(1, C_BRASS, 0.5);
      g.lineBetween(0, 0, Math.cos(a) * 12, Math.sin(a) * 12);
    }
    c.add(g);
    this._chandelierG = g;
    this._chandelierPool = this.add.ellipse(640, 130, 200, 40, 0xffa726, 0.03).setDepth(2);
    this._chandelierC = c;
  }

  updateChandelierSparkle(time) {
    if (!this._chandelierPool) return;
    this._chandelierPool.setAlpha(0.02 + Math.abs(Math.sin(time * 0.0007)) * 0.02);
  }

  createBureauFloor() {
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x0a0d18, 1);
    g.fillRect(0, 635, W, 85);
    g.lineStyle(1, 0x2a3654, 1);
    g.lineBetween(0, 637, W, 637);
    g.lineStyle(1, 0x2a3654, 0.3);
    for (let x = 0; x < W; x += 100) g.lineBetween(x, 640, x, 720);
  }

  createAmbientParticles() {
    this.ambient = [];
    const colors = [0x8ea6c8, 0xc8a05a, 0xffd740];
    for (let i = 0; i < 8; i++) {
      this.ambient.push(this.add.circle(Phaser.Math.Between(0, W), Phaser.Math.Between(230, 630), 1, Phaser.Utils.Array.GetRandom(colors), Phaser.Math.FloatBetween(0.03, 0.06)).setDepth(2));
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
    const p = this.add.particles(x, y, "l70_dot", {
      speed: { min: 80, max: 240 }, angle: { min: 0, max: 360 }, scale: { start: 0.9, end: 0 }, lifespan: 500,
      tint: [C_BRASS, C_GOLD, C_RED, C_CYAN, 0xffffff], emitting: false,
    }).setDepth(95);
    p.explode(count);
    this.time.delayedCall(900, () => p.destroy());
  }

  createGoldCyanMidnightConfetti(x, y, count = 40) {
    const p = this.add.particles(x, y, "l70_dot", {
      speed: { min: 100, max: 280 }, angle: { min: 0, max: 360 }, scale: { start: 1, end: 0 }, lifespan: 700,
      tint: [C_GOLD, C_CYAN, 0x141a2c, 0xffffff], emitting: false,
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
    this.tabFilename = this.add.text(CX + CW - 12, CY + TAB_H / 2, "Bureau1.java", { font: "13px Courier New", color: "#546e7a" }).setOrigin(1, 0.5).setDepth(11);

    this.lineHighlight = this.add.rectangle(CX + CW / 2, 0, CW - 4, LINE_H, 0xffab00, 0.06).setDepth(19).setVisible(false);
    this.codeContainer = this.add.container(0, 0).setDepth(20);
  }

  _syntaxTokens(line) {
    const tokens = [];
    const re = /("(?:[^"\\]|\\.)*")|(\bimport\b|\bfor\b|\bint\b|\bdouble\b|\bString\b|\bnew\b|\bScanner\b)|(<\w*>)|(\bMath\b|\bArrays\b)|(\.copyOf\b|\.sort\b|\.toString\b|\.length\b|\.get\b|\.size\b|\.nextInt\b|\.nextLine\b|\.println\b)|(\bSystem\.out\b|\bSystem\.in\b)|(-?\d+\.\d+|-?\d+)|(>=|<=|==|!=|\+\+|--|[+\-*/><?:])|([(){}\[\];.,=])/g;
    let last = 0, m;
    const plain = (t) => t && tokens.push({ t, c: "#e0e0e0" });
    while ((m = re.exec(line))) {
      if (m.index > last) plain(line.slice(last, m.index));
      if (m[1]) tokens.push({ t: m[1], c: "#4caf50" });
      else if (m[2]) tokens.push({ t: m[2], c: "#6a1b9a" });
      else if (m[3]) tokens.push({ t: m[3], c: "#1565c0" });
      else if (m[4]) tokens.push({ t: m[4], c: HEX_GOLD });
      else if (m[5]) tokens.push({ t: m[5], c: HEX_CYAN });
      else if (m[6]) tokens.push({ t: m[6], c: "#78909c" });
      else if (m[7]) tokens.push({ t: m[7], c: HEX_ORANGE });
      else if (m[8]) tokens.push({ t: m[8], c: "#4caf50" });
      else if (m[9]) tokens.push({ t: m[9], c: "#78909c" });
      last = m.index + m[0].length;
    }
    if (last < line.length) plain(line.slice(last));
    return tokens.length ? tokens : [{ t: line, c: "#e0e0e0" }];
  }

  _isDimmedInfrastructure(rawLine) {
    const t = rawLine.trim();
    return /^Scanner sc = new Scanner/.test(rawLine)
      || /^((int|String|double)\[\]\s+\w+\s*=\s*\/\*.*\*\/;\s*)+$/.test(rawLine)
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
          const w = 175;
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
    this.add.text(PX + 10, PY + 8, "CURATOR'S PARTS", { font: "bold 11px Arial", color: "#3d4450" }).setDepth(11);
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
      draw(C_BRASS);
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
      c.on("pointerout", () => { if (!this.inputLocked) draw(C_BRASS); });
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
    g.lineStyle(3, C_BRASS, 1);
    g.strokeRoundedRect(OX, OY, OW, OH, 12);
    this.add.text(OX + 10, OY + 6, "BUREAU RIG — LIVE", { font: "bold 11px Georgia", color: HEX_BRASS }).setAlpha(0.7).setDepth(11);

    const maskShape = this.make.graphics({ x: 0, y: 0, add: false });
    maskShape.fillRoundedRect(OX + 4, OY + 20, OW - 8, OH - 24, 10);
    this.windowMask = maskShape.createGeometryMask();
    this.rigLayer = this.add.container(0, 0).setDepth(15);
    this.rigLayer.setMask(this.windowMask);

    this.verdictLamp = this.add.circle(OX + OW - 18, OY + 14, 6, C_GRAY).setDepth(20);
  }

  // ══════════════════════════════════════════════════════════════
  // MINI REPLICATION FRAME (multi-tray: orig + copy1 [+ copy2 for M6])
  // ══════════════════════════════════════════════════════════════

  _trayBounds(trayKey) {
    if (trayKey === "orig") return { x0: MINI_ORIG_X0, x1: MINI_ORIG_X1, y0: MINI_TRAY_Y0, y1: MINI_TRAY_Y1 };
    if (trayKey === "copy1") return { x0: MINI_COPY1_X0, x1: MINI_COPY1_X1, y0: MINI_TRAY_Y0, y1: MINI_TRAY_Y1 };
    return { x0: MINI_COPY2_X0, x1: MINI_COPY2_X1, y0: MINI_TRAY2_Y0, y1: MINI_TRAY2_Y1 };
  }

  createMiniReplicationFrame() {
    const drawFrame = (x0, x1, y0, y1) => {
      const g = this.add.graphics();
      g.fillStyle(0x0d0a06, 0.8);
      g.lineStyle(1.2, C_BRASS, 1);
      g.fillRoundedRect(x0, y0, x1 - x0, y1 - y0, 3);
      g.strokeRoundedRect(x0, y0, x1 - x0, y1 - y0, 3);
      this.rigLayer.add(g);
      return g;
    };
    this._origFrameGfx = drawFrame(MINI_ORIG_X0, MINI_ORIG_X1, MINI_TRAY_Y0, MINI_TRAY_Y1);
    this._copy1FrameGfx = drawFrame(MINI_COPY1_X0, MINI_COPY1_X1, MINI_TRAY_Y0, MINI_TRAY_Y1);
    this._copy2FrameGfx = null;

    this._copyGlow = {};
    this._copyGlow.copy1 = this.add.rectangle((MINI_COPY1_X0 + MINI_COPY1_X1) / 2, (MINI_TRAY_Y0 + MINI_TRAY_Y1) / 2, MINI_COPY1_X1 - MINI_COPY1_X0 + 3, MINI_TRAY_Y1 - MINI_TRAY_Y0 + 3, 0, 0).setStrokeStyle(1, C_CYAN, 0);
    this.rigLayer.add(this._copyGlow.copy1);

    this.varLabels = {};
    this.varLabels.orig = this.add.text(MINI_ORIG_X1 - 3, MINI_TRAY_Y0 - 10, "", { font: "italic 9px Courier New", color: HEX_CYAN }).setOrigin(1, 0);
    this.varLabels.orig2 = this.add.text(MINI_ORIG_X1 - 3, MINI_TRAY_Y0 - 19, "", { font: "italic 9px Courier New", color: HEX_GREEN_BRIGHT }).setOrigin(1, 0);
    this.varLabels.copy1 = this.add.text(MINI_COPY1_X1 - 3, MINI_TRAY_Y0 - 10, "", { font: "italic 9px Courier New", color: HEX_CYAN }).setOrigin(1, 0).setAlpha(0);
    this.varLabels.copy2 = this.add.text(MINI_COPY2_X1 - 3, MINI_TRAY2_Y0 - 10, "", { font: "italic 9px Courier New", color: HEX_CYAN }).setOrigin(1, 0).setAlpha(0);
    this.rigLayer.add([this.varLabels.orig, this.varLabels.orig2, this.varLabels.copy1, this.varLabels.copy2]);

    this._compartmentLayers = {
      orig: { comp: this.add.container(0, 0), spec: this.add.container(0, 0) },
      copy1: { comp: this.add.container(0, 0), spec: this.add.container(0, 0) },
      copy2: { comp: this.add.container(0, 0), spec: this.add.container(0, 0) },
    };
    Object.values(this._compartmentLayers).forEach(({ comp, spec }) => this.rigLayer.add([comp, spec]));
    this._trays = { orig: [], copy1: [], copy2: [] };

    const bridgeG = this.add.graphics();
    bridgeG.lineStyle(1, C_BRASS, 0.4);
    bridgeG.lineBetween(MINI_ORIG_X1, MINI_BRIDGE_CY - 6, MINI_COPY1_X0, MINI_BRIDGE_CY - 6);
    bridgeG.lineBetween(MINI_ORIG_X1, MINI_BRIDGE_CY + 6, MINI_COPY1_X0, MINI_BRIDGE_CY + 6);
    this.rigLayer.add(bridgeG);
    this.bridgeArrow = this.add.text((MINI_ORIG_X1 + MINI_COPY1_X0) / 2, MINI_BRIDGE_CY, "→", { font: "bold 12px Georgia", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.6);
    this.rigLayer.add(this.bridgeArrow);
    this.bridgeCordLayer = this.add.container(0, 0);
    this.rigLayer.add(this.bridgeCordLayer);

    this._nextCopySlot = 0;
  }

  async populateOriginalTray(values, type, varName) {
    const { comp, spec } = this._compartmentLayers.orig;
    comp.removeAll(true); spec.removeAll(true);
    this._trays.orig = [];
    this.varLabels.orig.setText(varName || "a");
    this.varLabels.orig2.setText("").setAlpha(0);
    await this._populateTrayGeneric("orig", values, type);
  }

  async _populateTrayGeneric(trayKey, values, type) {
    const { comp, spec } = this._compartmentLayers[trayKey];
    const bounds = this._trayBounds(trayKey);
    const n = values.length;
    const innerX0 = bounds.x0 + 3, innerX1 = bounds.x1 - 3;
    const innerW = innerX1 - innerX0;
    const cellW = n > 0 ? innerW / n : innerW;
    const compartments = [];
    for (let i = 0; i < n; i++) {
      const cellX = innerX0 + i * cellW;
      if (i > 0) {
        const dg = this.add.graphics();
        dg.lineStyle(1, C_BRASS, 0.3);
        dg.lineBetween(cellX, bounds.y0 + 3, cellX, bounds.y1 - 9);
        comp.add(dg);
      }
      const idxPlate = this.add.text(cellX + cellW / 2, bounds.y1 - 5, `${i}`, { font: "bold 7px Courier New", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.5);
      comp.add(idxPlate);
      compartments.push({ x: cellX, w: cellW, idxPlate, trayKey, bounds });
    }
    this._trays[trayKey] = compartments;
    for (let i = 0; i < n; i++) {
      const card = await this._buildCard(spec, compartments[i], values[i], type, false);
      this._trays[trayKey][i] = { ...compartments[i], ...card, value: values[i] };
      await this.delay(28);
    }
    await this.delay(40);
  }

  async _buildCard(layer, comp, value, type, isGhostDefault) {
    const color = isGhostDefault ? 0x3a4048 : (type === "String[]" ? C_CYAN : C_GOLD);
    const cardW = Math.min(comp.w - 4, 24), cardH = 17;
    const cy = (comp.bounds.y0 + comp.bounds.y1) / 2 - 2;
    const cx = comp.x + comp.w / 2;
    const card = this.add.container(cx, cy).setAlpha(0).setScale(0.7);
    const cg = this.add.graphics();
    cg.fillStyle(color, isGhostDefault ? 0.35 : 0.9);
    cg.lineStyle(1, Phaser.Display.Color.IntegerToColor(color).darken(30).color, 1);
    cg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 2);
    cg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 2);
    const display = this._fmtVal(value);
    const txt = this.add.text(0, 0, display, isGhostDefault
      ? { font: "italic 8px Courier New", color: "#78909c" }
      : { font: "bold 9px Courier New", color: "#0a1208" }).setOrigin(0.5);
    if (txt.width > cardW - 3) txt.setFontSize(4.5);
    card.add([cg, txt]);
    layer.add(card);
    this.tweens.add({ targets: card, alpha: 1, scale: 1, duration: 90, ease: "Back.easeOut" });
    return { card, cardGfx: cg, cardText: txt, cardColor: color, cardW };
  }

  _fmtVal(v) { return v === null ? "null" : String(v); }

  clearReplicationFrame() {
    Object.keys(this._compartmentLayers).forEach((k) => {
      this._compartmentLayers[k].comp.removeAll(true);
      this._compartmentLayers[k].spec.removeAll(true);
      this._trays[k] = [];
    });
    if (this._copy2FrameGfx) { this._copy2FrameGfx.destroy(); this._copy2FrameGfx = null; }
    this.varLabels.orig.setText(""); this.varLabels.orig2.setText("").setAlpha(0);
    this.varLabels.copy1.setAlpha(0); this.varLabels.copy2.setAlpha(0);
    this._copyGlow.copy1.setStrokeStyle(1, C_CYAN, 0);
    this.bridgeCordLayer.removeAll(true);
    this._nextCopySlot = 0;
  }

  async materializeCopyTray(trayKey, length, type, varName) {
    const { comp, spec } = this._compartmentLayers[trayKey];
    comp.removeAll(true); spec.removeAll(true);
    this._trays[trayKey] = [];
    if (trayKey === "copy2" && !this._copy2FrameGfx) {
      const g = this.add.graphics();
      g.fillStyle(0x0d0a06, 0.8);
      g.lineStyle(1.2, C_BRASS, 1);
      g.fillRoundedRect(MINI_COPY2_X0, MINI_TRAY2_Y0, MINI_COPY2_X1 - MINI_COPY2_X0, MINI_TRAY2_Y1 - MINI_TRAY2_Y0, 3);
      g.strokeRoundedRect(MINI_COPY2_X0, MINI_TRAY2_Y0, MINI_COPY2_X1 - MINI_COPY2_X0, MINI_TRAY2_Y1 - MINI_TRAY2_Y0, 3);
      this.rigLayer.add(g);
      this._copy2FrameGfx = g;
    }
    this.varLabels[trayKey].setText(varName || "b").setAlpha(0);

    const bounds = this._trayBounds(trayKey);
    const innerX0 = bounds.x0 + 3, innerX1 = bounds.x1 - 3;
    const innerW = innerX1 - innerX0;
    const cellW = length > 0 ? innerW / length : innerW;
    const compartments = [];
    for (let i = 0; i < length; i++) {
      const cellX = innerX0 + i * cellW;
      if (i > 0) {
        const dg = this.add.graphics();
        dg.lineStyle(1, C_BRASS, 0.3);
        dg.lineBetween(cellX, bounds.y0 + 3, cellX, bounds.y1 - 9);
        comp.add(dg);
      }
      const idxPlate = this.add.text(cellX + cellW / 2, bounds.y1 - 5, `${i}`, { font: "bold 7px Courier New", color: HEX_BRASS }).setOrigin(0.5).setAlpha(0.5);
      comp.add(idxPlate);
      compartments.push({ x: cellX, w: cellW, idxPlate, trayKey, bounds });
    }
    this._trays[trayKey] = compartments;
    if (trayKey === "copy1") this._copyGlow.copy1.setStrokeStyle(1, C_CYAN, 0.5);
    this.tweens.add({ targets: this.varLabels[trayKey], alpha: 1, duration: 150 });
    await this.delay(trayKey === "copy2" ? 100 : 150);
  }

  async runDuplicationBeam(trayKey) {
    if (trayKey === "copy2") return; // quick materialize — no beam for the second simultaneous copy
    const beam = this.add.rectangle(MINI_ORIG_X0, MINI_BRIDGE_CY, 2, MINI_TRAY_Y1 - MINI_TRAY_Y0 - 6, C_CYAN, 0.9).setDepth(17);
    this.rigLayer.add(beam);
    await new Promise((res) => {
      this.tweens.add({ targets: beam, x: MINI_ORIG_X1, duration: 130, ease: "Sine.easeInOut", onComplete: () => { beam.destroy(); res(); } });
    });
  }

  async flyGhostCopies(sourceTrayKey, values, copyLength, type, destTrayKey) {
    const srcComps = this._trays[sourceTrayKey];
    const destComps = this._trays[destTrayKey];
    const crossCount = Math.min(values.length, copyLength);
    const fast = destTrayKey === "copy2";
    for (let i = 0; i < crossCount; i++) {
      if (!this._alive) return;
      const srcComp = srcComps[i], destComp = destComps[i];
      if (!srcComp || !destComp) continue;
      if (!fast) {
        const ghost = this.add.text(srcComp.x + srcComp.w / 2, (srcComp.bounds.y0 + srcComp.bounds.y1) / 2 - 2, this._fmtVal(values[i]), { font: "bold 8px Courier New", color: HEX_CYAN }).setOrigin(0.5).setDepth(18).setAlpha(0.9);
        this.rigLayer.add(ghost);
        const destX = destComp.x + destComp.w / 2;
        this.tweens.add({ targets: ghost, x: destX, y: (destComp.bounds.y0 + destComp.bounds.y1) / 2 - 2, duration: 100, ease: "Sine.easeInOut", onComplete: () => ghost.destroy() });
        await this.delay(40);
      }
      const card = await this._buildCard(this._compartmentLayers[destTrayKey].spec, destComp, values[i], type, false);
      this._trays[destTrayKey][i] = { ...destComp, ...card, value: values[i] };
      await this.delay(fast ? 15 : 30);
    }
  }

  async showPadding(destTrayKey, startIndex, endIndex, type) {
    const defaultVal = type === "String[]" ? null : 0;
    for (let i = startIndex; i < endIndex; i++) {
      if (!this._alive) return;
      const comp = this._trays[destTrayKey][i];
      if (!comp) continue;
      const card = await this._buildCard(this._compartmentLayers[destTrayKey].spec, comp, defaultVal, type, true);
      this._trays[destTrayKey][i] = { ...comp, ...card, value: defaultVal };
      await this.delay(25);
    }
    await this.delay(40);
  }

  async showTruncation(sourceTrayKey, skippedIndices) {
    if (!skippedIndices.length) return;
    for (const idx of skippedIndices) {
      const comp = this._trays[sourceTrayKey][idx];
      if (!comp || !comp.card) continue;
      this.tweens.add({ targets: comp.cardGfx, alpha: 0.3, duration: 60, yoyo: true, repeat: 2 });
    }
    await this.delay(140);
  }

  async snapBridge(destTrayKey) {
    if (destTrayKey === "copy2") { await this.delay(60); return; }
    const cordY = MINI_BRIDGE_CY;
    const cord = this.add.graphics();
    cord.lineStyle(1, C_CYAN, 0.7);
    for (let x = MINI_ORIG_X1 + 2; x < MINI_COPY1_X0 - 2; x += 4) cord.lineBetween(x, cordY, x + 2, cordY);
    this.bridgeCordLayer.add(cord);
    this.tweens.add({ targets: this.bridgeArrow, alpha: 1, scale: 1.3, duration: 70, yoyo: true });
    await this.delay(80);
    if (!this._alive) return;
    this.tweens.add({ targets: cord, alpha: 0, duration: 100, onComplete: () => cord.destroy() });
    if (this._copyGlow[destTrayKey]) this._copyGlow[destTrayKey].setStrokeStyle(1, C_BRASS, 0.3);
    await this.delay(60);
  }

  async showIndependenceShield(trayKey, index) {
    const comp = this._trays[trayKey][index];
    if (!comp) return;
    const shield = this.add.rectangle(comp.x + comp.w / 2, (comp.bounds.y0 + comp.bounds.y1) / 2 - 2, comp.cardW ? comp.cardW + 3 : 18, 18, C_GREEN_BRIGHT, 0.3).setDepth(19);
    this.rigLayer.add(shield);
    this.tweens.add({ targets: shield, alpha: 0, duration: 150, onComplete: () => shield.destroy() });
    await this.delay(110);
  }

  showAliasLabels(name1, name2) {
    this.varLabels.orig.setText(name1);
    this.varLabels.orig2.setText(name2).setAlpha(1);
  }

  modifyCompartment(trayKey, index, value, type) {
    const comp = this._trays[trayKey] && this._trays[trayKey][index];
    if (!comp || !comp.cardText) return;
    comp.value = value;
    const display = this._fmtVal(value);
    comp.cardText.setText(display).setColor(type === "default" ? "#78909c" : "#0a1208").setFontStyle(type === "default" ? "italic" : "bold");
    if (comp.cardText.width > (comp.cardW || 20) - 3) comp.cardText.setFontSize(4.5);
    if (comp.card) this.tweens.add({ targets: comp.card, scale: 1.15, duration: 50, yoyo: true });
  }

  async runTraySortAnimation(trayKey, before, after) {
    const comps = this._trays[trayKey];
    const working = before.slice();
    const n = working.length;
    let swaps = 0;
    for (let i = 0; i < n && swaps < 8; i++) {
      if (!this._alive) break;
      if (working[i] === after[i]) continue;
      let j = -1;
      for (let k = i + 1; k < n; k++) { if (working[k] === after[i]) { j = k; break; } }
      if (j === -1) continue;
      const compA = comps[i], compB = comps[j];
      if (compA && compA.card && compB && compB.card) {
        const cardA = compA.card, cardB = compB.card;
        const posA = { x: cardA.x, y: cardA.y }, posB = { x: cardB.x, y: cardB.y };
        await new Promise((res) => {
          this.tweens.add({ targets: cardA, y: posA.y - 5, duration: 40 });
          this.tweens.add({ targets: cardB, y: posB.y - 5, duration: 40, onComplete: res });
        });
        await new Promise((res) => {
          this.tweens.add({ targets: cardA, x: posB.x, duration: 90, ease: "Sine.easeInOut" });
          this.tweens.add({ targets: cardB, x: posA.x, duration: 90, ease: "Sine.easeInOut", onComplete: res });
        });
        await new Promise((res) => {
          this.tweens.add({ targets: cardA, y: posA.y, duration: 40 });
          this.tweens.add({ targets: cardB, y: posB.y, duration: 40, onComplete: res });
        });
        compA.card = cardB; compB.card = cardA;
        [compA.value, compB.value] = [compB.value, compA.value];
        [compA.cardText, compB.cardText] = [compB.cardText, compA.cardText];
        [compA.cardGfx, compB.cardGfx] = [compB.cardGfx, compA.cardGfx];
        [compA.cardColor, compB.cardColor] = [compB.cardColor, compA.cardColor];
        [compA.cardW, compB.cardW] = [compB.cardW, compA.cardW];
      }
      const tmp = working[i]; working[i] = working[j]; working[j] = tmp;
      swaps++;
    }
    await this.delay(60);
  }

  // ══════════════════════════════════════════════════════════════
  // MINI DISPLAY PLAQUES (dual, cycling) — toString assembly
  // ══════════════════════════════════════════════════════════════

  createMiniPlaquesDual() {
    const px = OX + 14, pw = OW - 28, ph = 16;
    const py0 = OY + 145, py1 = OY + 165;
    this.plaqueTexts = [py0, py1].map((py) => {
      const g = this.add.graphics();
      g.fillStyle(0x1a1408, 1);
      g.lineStyle(1, C_BRASS, 0.8);
      g.fillRoundedRect(px, py, pw, ph, 2);
      g.strokeRoundedRect(px, py, pw, ph, 2);
      this.rigLayer.add(g);
      const t = this.add.text(px + pw / 2, py + ph / 2, "", { font: "bold 7.5px Courier New", color: "#e8eaf6" }).setOrigin(0.5);
      this.rigLayer.add(t);
      return t;
    });
    this._plaqueCursor = 0;
  }

  clearPlaques() {
    this.plaqueTexts.forEach((t) => t.setText("").setColor("#e8eaf6"));
    this._plaqueCursor = 0;
  }

  _fakeHash(seed, type) {
    const hex = ((seed + 1) * 7919 + 12345).toString(16).padStart(8, "0");
    return type === "String[]" ? `[Ljava.lang.String;@${hex}` : `[I@${hex}`;
  }

  async runToStringScan(trayKey, values, type) {
    const plaque = this.plaqueTexts[this._plaqueCursor % 2];
    this._plaqueCursor++;
    plaque.setColor("#e8eaf6");
    plaque.setText("[");
    await this.delay(30);
    const parts = [];
    for (let i = 0; i < values.length; i++) {
      if (!this._alive) return `[${parts.join(", ")}]`;
      parts.push(this._fmtVal(values[i]));
      plaque.setText("[" + parts.join(", "));
      await this.delay(22);
    }
    plaque.setText("[" + parts.join(", ") + "]");
    return "[" + parts.join(", ") + "]";
  }

  async showCursedLabel(type, seed) {
    const plaque = this.plaqueTexts[this._plaqueCursor % 2];
    this._plaqueCursor++;
    const hash = this._fakeHash(seed !== undefined ? seed : this.currentMission, type);
    plaque.setColor(HEX_RED);
    for (let i = 0; i < hash.length; i++) {
      if (!this._alive) return hash;
      plaque.setText(hash.slice(0, i + 1));
      await this.delay(6);
    }
    await this.delay(120);
    return hash;
  }

  // ══════════════════════════════════════════════════════════════
  // MINI TYPED CONTAINERS — reference indicators (dashed cyan = alias,
  // solid brass = independent)
  // ══════════════════════════════════════════════════════════════

  createMiniContainersWithRefs() {
    const hdr = this.add.text(CONT_X, CONT_Y0 - 12, "REFERENCES", { font: "bold 9px Georgia", color: HEX_BRASS }).setAlpha(0.7);
    this.containerLayer = this.add.container(0, 0);
    this.rigLayer.add([hdr, this.containerLayer]);
  }

  clearContainers() {
    this.containerLayer.removeAll(true);
  }

  updateContainerShelfWithReferences(vars) {
    this.containerLayer.removeAll(true);
    const seen = [];
    let idx = 0;
    for (const name in vars) {
      const v = vars[name];
      if (v.kind !== "array") continue;
      const sharedWith = seen.find((s) => s.values === v.values);
      const isAlias = !!sharedWith;
      const y = CONT_Y0 + idx * 13;
      const text = `${name}=${this._fmtArrDisplay(v.values)}`.slice(0, 24);
      const dg = this.add.graphics();
      if (isAlias) {
        dg.lineStyle(1, C_CYAN, 0.6);
        for (let x = CONT_X; x < CONT_X + 140; x += 4) dg.lineBetween(x, y + 6, x + 2, y + 6);
      } else {
        dg.lineStyle(1, C_BRASS, 0.5);
        dg.strokeRoundedRect(CONT_X, y, 140, 11, 2);
      }
      this.containerLayer.add(dg);
      const t = this.add.text(CONT_X + 3, y + 5, text, { font: `${isAlias ? "italic " : ""}bold 6.5px Courier New`, color: isAlias ? HEX_CYAN : HEX_GOLD }).setOrigin(0, 0.5);
      this.containerLayer.add(t);
      if (!sharedWith) seen.push({ values: v.values, name });
      idx++;
    }
  }

  _fmtArrDisplay(values) {
    return "[" + values.map((v) => this._fmtVal(v)).join(",") + "]";
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
  // MINI SCANNER CAMEO (Mission 5)
  // ══════════════════════════════════════════════════════════════

  createMiniScannerCameo() {
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
    const cellW = 5, x1 = OX + OW - 10;
    const totalW = Math.min(this.tapeState.length * cellW, 200);
    const startX = x1 - totalW;
    const bg = this.add.graphics();
    bg.fillStyle(0xe8f0e8, 0.85);
    bg.fillRoundedRect(startX - 3, TAPE_Y - 5, totalW + 6, 10, 3);
    this.tapeContainer.add(bg);
    this.tapeState.slice(-Math.floor(totalW / cellW)).forEach((cell, i) => {
      const x = startX + i * cellW + cellW / 2;
      const disp = cell.kind === "space" ? "␣" : cell.kind === "newline" ? "⏎" : cell.ch;
      const color = cell.kind === "space" ? "#c2185b" : cell.kind === "newline" ? "#7b1fa2" : "#2e7d32";
      const t = this.add.text(x, TAPE_Y, disp, { font: "bold 5.5px Courier New", color }).setOrigin(0.5);
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
    await this.delay(35);
  }

  // ══════════════════════════════════════════════════════════════
  // MANIFEST STRIP / RESULT ROW
  // ══════════════════════════════════════════════════════════════

  createManifestStrip() {
    const g = this.add.graphics().setDepth(16);
    g.fillStyle(0x0f0a06, 0.92);
    g.fillRect(OX, MANIFEST_Y - 2, OW, 20);
    this.manifestStripText = this.add.text(OX + 8, MANIFEST_Y + 8, "", { font: "12px Arial", color: HEX_BRASS }).setOrigin(0, 0.5).setDepth(17);
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
    if (test.initialArray) return `[${test.initialArray.join(",")}]`.slice(0, 26);
    if (test.input) return `in: ${test.input.join(",")}`;
    return "";
  }

  buildReportRows(mission) {
    this.reportRows.forEach((r) => r.container.destroy());
    this.reportRows = [];
    mission.tests.forEach((test, i) => {
      const y = RY + 24 + i * 24;
      const c = this.add.container(RX + 10, y).setDepth(11).setAlpha(0.35);
      const inputT = this.add.text(0, 0, this._compactTestLabel(test), { font: "11px Courier New", color: "#b0bec5" }).setOrigin(0, 0.5);
      const expT = this.add.text(190, 0, test.expectedOutput.slice(0, 22), { font: "11px Courier New", color: "#78909c" }).setOrigin(0, 0.5);
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
    g.fillStyle(0x0a1208, 1);
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

    this.add.text(20, 14, "THE CURATOR'S BUREAU", { font: "bold 15px Georgia", color: "#b0bec5" }).setDepth(51);
    this.add.text(20, 32, "Restructuring Phase — Arrays Methods: copyOf()", { font: "12px Arial", color: "#546e7a" }).setDepth(51);

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
      lg.lineStyle(2, C_BRASS, 1);
      lg.strokeCircle(0, 0, 6);
      lg.lineBetween(4, -4, 9, -9);
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
  // BIT — CHIEF CURATOR VARIANT (sash, master keys)
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
    const frock = this.add.graphics();
    frock.fillStyle(0x1a0e05, 0.9);
    frock.lineStyle(1, 0x3a2618, 0.7);
    frock.fillTriangle(-17, -12, 17, -12, 0, 22);
    const sash = this.add.graphics();
    sash.fillStyle(0x3a2618, 0.9);
    sash.lineStyle(1.5, C_GOLD, 0.8);
    sash.fillTriangle(-14, -12, -6, -12, 10, 20);
    sash.lineBetween(-14, -12, 10, 20);
    [-6, 0, 6].forEach((dy) => {
      sash.fillStyle(C_BRASS, 0.8);
      sash.fillCircle(-2 + dy * 0.3, 2 + dy, 1.2);
    });
    const gloveL = this.add.circle(-16, 10, 4, 0xffffff, 0).setStrokeStyle(1, 0xe8eaf6, 0.7);
    const keyRing = this.add.container(17, 10);
    const ringG = this.add.graphics();
    ringG.lineStyle(1, C_BRASS, 0.8);
    ringG.strokeCircle(0, 0, 3);
    for (let i = 0; i < 3; i++) {
      const a = (Math.PI * 2 / 3) * i;
      ringG.lineStyle(1, C_BRASS, 0.7);
      ringG.lineBetween(0, 0, Math.cos(a) * 6, Math.sin(a) * 6 + 3);
    }
    keyRing.add(ringG);
    c.add([g, frock, sash, eye, pupil, gloveL, keyRing, tip]);
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
    g.lineStyle(1.5, C_BRASS, 1);
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
    await this.bitSay("The Curator's Bureau, Curator — the museum's highest office, where every specimen's fate is decided. You've labelled with toString, arranged with sort, and duplicated with copyOf. Tonight you BUILD the workflows that preserve, extend, and publish. Every mission produces a real catalogue entry.");
    if (!A()) return;
    await Promise.race([this.waitForClick(), this.delay(5500)]); if (!A()) return;
    this.hideBubble();

    const a1 = this.floatingAnnotation(CX + CW / 2, CY - 16, "the workflow", HEX_CYAN);
    await this.delay(400); if (!A()) return;
    const a2 = this.floatingAnnotation(PX + PW / 2, PY - 12, "blocks — one aliases where you meant to copy, one truncates by mistake", HEX_GRAY);
    await this.delay(400); if (!A()) return;
    const a3 = this.floatingAnnotation(OX + OW / 2, OY - 12, "replication, engine, plaques — ALL THREE live", HEX_GREEN_BRIGHT);
    await this.delay(400); if (!A()) return;
    const a4 = this.floatingAnnotation(880, 36, "the wing watches", HEX_GOLD);
    await this.delay(400); if (!A()) return;
    const a5 = this.floatingAnnotation(RX + RW / 2, RY - 12, "every scenario must verify", HEX_BLUE_GRAY);
    await this.delay(400); if (!A()) return;

    await this.bitSay("The bureau's three laws: preserve before you mutate — copy first, sort the copy; length is TOTAL, never last-index; and equals aliases, only copyOf duplicates. Build, run, verify, repair. The wing seals at dawn.");
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
    g.fillStyle(0x1a0e05, 1);
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

    this.tabFilename.setText(`Bureau${mission.mission}.java`);
    this.renderSkeleton(mission);
    this.populatePalette(mission);
    this.buildReportRows(mission);
    this.renderMissionBrief(mission);
    this.disableRunButton();
    this.highlightCodeLine(null);
    this.verdictLamp.setFillStyle(C_GRAY);
    this.clearReplicationFrame();
    this.clearPlaques();
    this.clearContainers();
    this.clearTicker();
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
      const sm = rawLine.match(/<slot:(\w+)>/);
      if (sm) {
        const slotId = sm[1];
        const code = assembled[slotId] && assembled[slotId][0] ? assembled[slotId][0].code : "";
        const codeLines = code.split("\n");
        out.push({ text: rawLine.replace(/<slot:\w+>/, codeLines[0]), slotId });
        for (let k = 1; k < codeLines.length; k++) out.push({ text: codeLines[k], slotId });
      } else {
        out.push({ text: rawLine, slotId: null });
      }
    });
    return out;
  }

  _substituteTestLine(line, test) {
    const m = line.match(/^(int|String|double)\[\]\s+(\w+)\s*=\s*\/\*[^*]*\*\/;$/);
    if (!m) return line;
    const type = m[1], name = m[2];
    if (!test.initialArray || name !== test.arrayName) return line;
    const literal = type === "String"
      ? `{${test.initialArray.map((v) => `"${v}"`).join(", ")}}`
      : `{${test.initialArray.join(", ")}}`;
    return `${type}[] ${name} = ${literal};`;
  }

  // ══════════════════════════════════════════════════════════════
  // UNIFIED INTERPRETER — the wing's full evaluator: copyOf (genuinely
  // NEW independent backing arrays, truncation/padding by type, up to
  // TWO simultaneous copy trays), alias (bare-variable RHS shares the
  // SAME backing array — reference identity, not a deep copy), sort
  // (in-place, on whichever array the call targets, honestly animated
  // on that array's own tray), toString (real scan; the cursed hash
  // for a bare array reference), general index expressions (literal,
  // length, length±N) for both copyOf's length arg and bracket
  // access/assignment, Scanner, and println concatenation.
  // ══════════════════════════════════════════════════════════════

  _splitTopArgs(argsStr) {
    const parts = [];
    let cur = "", depth = 0, inQuotes = false;
    for (let i = 0; i < argsStr.length; i++) {
      const ch = argsStr[i];
      if (ch === '"' && argsStr[i - 1] !== "\\") inQuotes = !inQuotes;
      if (!inQuotes) {
        if (ch === "(" || ch === "{" || ch === "[") depth++;
        if (ch === ")" || ch === "}" || ch === "]") depth--;
        if (ch === "," && depth === 0) { parts.push(cur.trim()); cur = ""; continue; }
      }
      cur += ch;
    }
    const last = cur.trim();
    if (last || parts.length) parts.push(last);
    return parts.filter((p) => p !== "");
  }

  _splitTopPlus(expr) {
    const parts = [];
    let cur = "", inQuotes = false, depth = 0;
    for (let i = 0; i < expr.length; i++) {
      const ch = expr[i];
      if (ch === '"' && expr[i - 1] !== "\\") inQuotes = !inQuotes;
      if (!inQuotes) {
        if (ch === "(" || ch === "[") depth++;
        if (ch === ")" || ch === "]") depth--;
        if (ch === "+" && depth === 0) { parts.push(cur.trim()); cur = ""; continue; }
      }
      cur += ch;
    }
    if (cur.trim() || parts.length) parts.push(cur.trim());
    return parts;
  }

  _parseArrayInit(initStr, type) {
    const inner = initStr.trim().replace(/^\{/, "").replace(/\}$/, "").trim();
    if (!inner) return [];
    const parts = this._splitTopArgs(inner);
    if (type === "String[]") return parts.map((p) => p.trim().replace(/^"(.*)"$/, "$1"));
    return parts.map((p) => parseFloat(p.trim()));
  }

  /** Resolves an index/length expression: a literal integer, arr.length,
   * arr.length + N, or arr.length - N — the exact vocabulary this
   * level's extend/split/backup patterns need, reused for BOTH
   * copyOf's length argument and bracket index expressions. */
  async _resolveIndexExpr(expr, vars) {
    const t = expr.trim();
    if (/^\d+$/.test(t)) return { ok: true, value: parseInt(t, 10) };
    let m = t.match(/^(\w+)\.length\s*\+\s*(\d+)$/);
    if (m) {
      const arr = vars[m[1]];
      if (!arr || arr.kind !== "array") return { ok: false, crash: "eval" };
      return { ok: true, value: arr.values.length + parseInt(m[2], 10) };
    }
    m = t.match(/^(\w+)\.length\s*-\s*(\d+)$/);
    if (m) {
      const arr = vars[m[1]];
      if (!arr || arr.kind !== "array") return { ok: false, crash: "eval" };
      return { ok: true, value: arr.values.length - parseInt(m[2], 10) };
    }
    m = t.match(/^(\w+)\.length$/);
    if (m) {
      const arr = vars[m[1]];
      if (!arr || arr.kind !== "array") return { ok: false, crash: "eval" };
      return { ok: true, value: arr.values.length };
    }
    if (vars[t] !== undefined && vars[t].kind !== "array") return { ok: true, value: vars[t].value };
    return { ok: false, crash: "eval" };
  }

  async resolveExpr(expr, vars) {
    const t = expr.trim();

    const atsMatch = t.match(/^Arrays\.toString\((\w+)\)$/);
    if (atsMatch) {
      const arr = vars[atsMatch[1]];
      if (!arr || arr.kind !== "array") return { ok: false, crash: "eval" };
      const display = await this.runToStringScan(arr.trayKey, arr.values, arr.type);
      this.updateManifestStrip(`Arrays.toString(${atsMatch[1]})`);
      this.updateResultRow(display, "String");
      return { ok: true, value: display, type: "String" };
    }

    const plusParts = this._splitTopPlus(t);
    if (plusParts.length > 1) {
      let out = "";
      for (const p of plusParts) {
        const pt = p.trim();
        if (/^".*"$/.test(pt)) { out += pt.slice(1, -1); continue; }
        const r = await this.resolveExpr(pt, vars);
        if (!r.ok) return r;
        out += String(r.value);
      }
      return { ok: true, value: out, type: "String" };
    }

    const bracketMatch = t.match(/^(\w+)\[(.+)\]$/);
    if (bracketMatch) {
      const arr = vars[bracketMatch[1]];
      if (!arr || arr.kind !== "array") return { ok: false, crash: "eval" };
      const idxRes = await this._resolveIndexExpr(bracketMatch[2].trim(), vars);
      if (!idxRes.ok) return idxRes;
      const idx = idxRes.value;
      if (idx < 0 || idx >= arr.values.length) { await this.crashIOOBE(idx, arr.trayKey); return { ok: false, crash: "ioobe" }; }
      const value = arr.values[idx];
      const elemType = arr.type === "String[]" ? "String" : arr.type.replace("[]", "");
      return { ok: true, value, type: elemType };
    }

    const lengthMatch = t.match(/^(\w+)\.length$/);
    if (lengthMatch) {
      const arr = vars[lengthMatch[1]];
      if (!arr || arr.kind !== "array") return { ok: false, crash: "eval" };
      return { ok: true, value: arr.values.length, type: "int" };
    }

    if (/^".*"$/.test(t)) return { ok: true, value: t.slice(1, -1), type: "String" };
    if (/^-?\d+\.\d+$/.test(t)) return { ok: true, value: parseFloat(t), type: "double" };
    if (/^-?\d+$/.test(t)) return { ok: true, value: parseInt(t, 10), type: "int" };

    if (vars[t] !== undefined) {
      const v = vars[t];
      if (v.kind === "array") {
        const hash = await this.showCursedLabel(v.type, this.currentMission);
        return { ok: true, value: hash, type: "String" };
      }
      return { ok: true, value: v.value, type: v.type };
    }

    return { ok: false, crash: "eval" };
  }

  async evalPrintArg(argExpr, vars) {
    const r = await this.resolveExpr(argExpr.trim(), vars);
    if (!r.ok) return { ok: false, crash: r.crash || "eval" };
    return { ok: true, value: String(r.value) };
  }

  showCompileErrorStamp() {
    const stamp = this.add.text(OX + OW / 2, OY + 100, "COMPILE ERROR", { font: "bold 15px Arial", color: HEX_RED }).setOrigin(0.5).setDepth(30).setScale(1.3).setAngle(-6).setAlpha(0);
    this.missionElements.push(stamp);
    this.rigLayer.add(stamp);
    this.tweens.add({ targets: stamp, scale: 1, alpha: 1, duration: 130 });
    this.screenShake(0.004, 110);
    this.time.delayedCall(750, () => { if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 160, onComplete: () => stamp.destroy() }); });
  }

  async crashIOOBE(idx, trayKey) {
    const bounds = this._trayBounds(trayKey || "orig");
    const cx = (bounds.x0 + bounds.x1) / 2;
    const stamp = this.add.text(cx, bounds.y0 - 8, "IOOBE", { font: "bold 9px Courier New", color: HEX_RED }).setOrigin(0.5).setAngle(-3).setAlpha(0);
    this.missionElements.push(stamp);
    this.rigLayer.add(stamp);
    this.tweens.add({ targets: stamp, alpha: 1, duration: 90 });
    this.screenShake(0.005, 130);
    await this.delay(300);
    if (stamp.active) this.tweens.add({ targets: stamp, alpha: 0, duration: 150, onComplete: () => stamp.destroy() });
  }

  async execStatement(line, vars) {
    if (/=\s*Arrays\.sort\(/.test(line)) {
      this.showCompileErrorStamp();
      await this.delay(400);
      return { ok: false, crash: "compile" };
    }

    const arrLiteral = line.match(/^(int|String|double)\[\]\s+(\w+)\s*=\s*\{(.*)\}\s*;$/);
    if (arrLiteral) {
      const baseType = arrLiteral[1], name = arrLiteral[2];
      const type = `${baseType}[]`;
      const values = this._parseArrayInit(`{${arrLiteral[3]}}`, type);
      vars[name] = { kind: "array", values, type, trayKey: "orig" };
      await this.populateOriginalTray(values, type, name);
      this.updateContainerShelfWithReferences(vars);
      return { ok: true };
    }

    const aliasDecl = line.match(/^(int|String|double)\[\]\s+(\w+)\s*=\s*(\w+)\s*;$/);
    if (aliasDecl) {
      const name = aliasDecl[2], src = aliasDecl[3];
      if (vars[src] && vars[src].kind === "array") {
        vars[name] = vars[src];
        this.showAliasLabels(src, name);
        this.updateContainerShelfWithReferences(vars);
        return { ok: true };
      }
    }

    const copyDecl = line.match(/^(int|String|double)\[\]\s+(\w+)\s*=\s*Arrays\.copyOf\((\w+),\s*(.+)\)\s*;$/);
    if (copyDecl) {
      const name = copyDecl[2], srcName = copyDecl[3], lenExprRaw = copyDecl[4].trim();
      const src = vars[srcName];
      if (!src || src.kind !== "array") return { ok: false, crash: "eval" };
      const lenRes = await this._resolveIndexExpr(lenExprRaw, vars);
      if (!lenRes.ok) return lenRes;
      const newLen = lenRes.value;
      const defaultVal = src.type === "String[]" ? null : src.type === "double[]" ? 0.0 : 0;
      const newValues = [];
      for (let i = 0; i < newLen; i++) newValues.push(i < src.values.length ? src.values[i] : defaultVal);
      this._nextCopySlot = (this._nextCopySlot || 0) + 1;
      const trayKey = this._nextCopySlot === 1 ? "copy1" : "copy2";
      vars[name] = { kind: "array", values: newValues, type: src.type, trayKey };

      await this.materializeCopyTray(trayKey, newLen, src.type, name);
      await this.runDuplicationBeam(trayKey);
      await this.flyGhostCopies(src.trayKey, src.values, newLen, src.type, trayKey);
      if (newLen > src.values.length) await this.showPadding(trayKey, src.values.length, newLen, src.type);
      if (newLen < src.values.length) {
        const skipped = [];
        for (let i = newLen; i < src.values.length; i++) skipped.push(i);
        await this.showTruncation(src.trayKey, skipped);
      }
      await this.snapBridge(trayKey);
      this.updateContainerShelfWithReferences(vars);
      return { ok: true };
    }

    const arrDeclAny = line.match(/^(int|String|double)\[\]\s+(\w+)\s*=\s*(.*);$/);
    if (arrDeclAny) {
      this.showCompileErrorStamp();
      await this.delay(400);
      return { ok: false, crash: "compile" };
    }

    const declVarPre = line.match(/^(int|double|String)\s+(\w+)\s*=\s*(.*);$/);
    if (declVarPre) {
      const varType = declVarPre[1], name = declVarPre[2], rhs = declVarPre[3].trim();
      if (varType === "String" && rhs === "sc.nextInt()") {
        this.showCompileErrorStamp();
        await this.delay(400);
        return { ok: false, crash: "compile" };
      }
      if (rhs === "sc.nextLine()" || rhs === "sc.nextInt()") {
        this.updateManifestStrip(`${varType} ${name} = ${rhs}`);
        const read = this.evaluateNextToken(this.tapeState);
        await this.tapeConsumeVisual(read.consumedCount);
        const value = rhs === "sc.nextInt()" ? (parseInt(read.rawValue, 10) || 0) : read.rawValue;
        vars[name] = { value, type: varType, kind: "scalar" };
        return { ok: true };
      }
      const r = await this.resolveExpr(rhs, vars);
      if (!r.ok) return r;
      vars[name] = { value: r.value, type: varType, kind: "scalar" };
      return { ok: true };
    }

    const bracketAssign = line.match(/^(\w+)\[(.+?)\]\s*=\s*(.+);$/);
    if (bracketAssign) {
      const name = bracketAssign[1], idxExprRaw = bracketAssign[2].trim(), rhsVal = bracketAssign[3].trim();
      const arr = vars[name];
      if (!arr || arr.kind !== "array") return { ok: true };
      const idxRes = await this._resolveIndexExpr(idxExprRaw, vars);
      if (!idxRes.ok) return idxRes;
      const idx = idxRes.value;
      if (idx < 0 || idx >= arr.values.length) { await this.crashIOOBE(idx, arr.trayKey); return { ok: false, crash: "ioobe" }; }
      const rhsRes = await this.resolveExpr(rhsVal, vars);
      if (!rhsRes.ok) return rhsRes;
      arr.values[idx] = rhsRes.value;
      this.modifyCompartment(arr.trayKey, idx, rhsRes.value, "value");
      if (arr.trayKey !== "orig") await this.showIndependenceShield("orig", idx);
      this.updateContainerShelfWithReferences(vars);
      return { ok: true };
    }

    const sortMatch = line.match(/^Arrays\.sort\((\w+)\)\s*;$/);
    if (sortMatch) {
      const arr = vars[sortMatch[1]];
      if (arr && arr.kind === "array") {
        const before = arr.values.slice();
        if (arr.type === "String[]") arr.values.sort();
        else arr.values.sort((a, b) => a - b);
        const after = arr.values.slice();
        await this.runTraySortAnimation(arr.trayKey, before, after);
        this.updateManifestStrip(`Arrays.sort(${sortMatch[1]})`);
        this.updateResultRow(null, "void");
        this.updateContainerShelfWithReferences(vars);
      }
      return { ok: true };
    }

    const printMatch = line.match(/^System\.out\.println\((.*)\);$/);
    if (printMatch) {
      this.updateManifestStrip("System.out.println(…)");
      const r = await this.evalPrintArg(printMatch[1].trim(), vars);
      if (!r.ok) return r;
      if (!this._printedLines) this._printedLines = [];
      this._printedLines.push(r.value);
      await this.printToTicker(r.value);
      return { ok: true };
    }

    return { ok: true };
  }

  async runStatements(lines, vars) {
    this._nextCopySlot = 0;
    for (const raw of lines) {
      if (!this._alive) return { ok: true };
      const line = raw.trim();
      if (!line) continue;
      if (/^Scanner sc = new Scanner/.test(line)) continue;
      const r = await this.execStatement(line, vars);
      if (!r.ok) return r;
    }
    return { ok: true };
  }

  // ══════════════════════════════════════════════════════════════
  // PROACTIVE-METRIC DETECTION
  // ══════════════════════════════════════════════════════════════

  _recordFirstRunMetrics(mission, passed) {
    const key = `mission${mission.mission}`;
    if (this._firstRunMetricsRecorded[key]) return;
    this._firstRunMetricsRecorded[key] = true;

    if (mission.isBackupFlagship || mission.isCapstone) {
      this.backupProactive[key] = this._slotCode("backup") === "Arrays.copyOf(data, data.length)";
    }
    if (mission.mission === 2) {
      this.extendClean[key] = ["Arrays.copyOf(roster, 4)", "Arrays.copyOf(roster, roster.length + 2)"].includes(this._slotCode("extend"))
        && this._slotCode("idx3") === "2" && this._slotCode("idx4") === "3";
    }
    if (mission.mission === 5) {
      this.extendClean[key] = this._slotCode("extend") === "Arrays.copyOf(collection, collection.length + 1)"
        && ["collection.length", "updated.length - 1"].includes(this._slotCode("idx"));
    }
    if (mission.mission === 4) {
      this.splitClean[key] = this._slotCode("split") === "Arrays.copyOf(ranked, 3)";
    }
    if (mission.isCapstone) {
      this.splitClean[key] = this._slotCode("split") === "Arrays.copyOf(data, 3)";
    }
    if (mission.isCrossWing) this.crossWingClean[key] = passed;
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
      this.time.delayedCall(1400, () => { if (c.active && draw) draw(C_BRASS); });
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

    if (isFirstRun) this._recordFirstRunMetrics(mission, !anyMismatch);
    const resultKind = anyMismatch ? (anyCrash ? "runtime_crash" : "logic_fail") : "pass";
    this._resolveRunOutcome(mission, resultKind, wrongBlocksUsed, failedTests);
  }

  async runTestCase(mission, test, index, items) {
    this.clearReplicationFrame();
    this.clearPlaques();
    this.clearContainers();
    this.clearTicker();
    this.updateManifestStrip("");
    this.updateResultRow(null, null);

    if (mission.isCrossWing) { this.parkScannerCameo(); this.activateScannerCameo(); this.loadMiniTape(test.input); }

    this._printedLines = [];
    const execLines = items.map((it) => this._substituteTestLine(it.text, test));
    const runResult = await this.runStatements(execLines, {});
    if (!this._alive) return { pass: false, crashed: false };

    const output = this._printedLines.join("⏎");
    const pass = runResult.ok && output === test.expectedOutput;
    this.verdictLamp.setFillStyle(pass ? C_GREEN_BRIGHT : C_RED);
    this.updateReportRow(index, pass);
    await this.delay(200);
    return { pass, crashed: !runResult.ok };
  }

  _shouldShowPostMissionNote() { return true; }

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
      console.warn("Level70Scene: /api/wellbeing/predict-struggle unreachable, skipping behavioral signal for this level:", e);
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
    this.pulseCrest("gold");

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
    if (this._chandelierG) this.tweens.add({ targets: this._chandelierG, alpha: 0.3, duration: 150, yoyo: true, repeat: 2 });
    const mission = MISSIONS[this.currentMission];
    if (this._shouldShowPostMissionNote(mission)) {
      await this.bitSay(mission.postMissionNote || "Clean certification — the rig confirms it.");
      await Promise.race([this.waitForClick(), this.delay(2400)]);
      this.hideBubble();
    }
    await this.delay(400);
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
      this.clearReplicationFrame();
      this.clearPlaques();
      this.clearContainers();
      this.clearTicker();
      this.parkScannerCameo();
      Object.values(this.silhouettes).forEach(({ g }) => this.tweens.add({ targets: g, alpha: 0.1, duration: 500 }));
      this._crest.c.setAlpha(0.1);
      if (this._chandelierPool) this.tweens.add({ targets: this._chandelierPool, alpha: 0, duration: 500 });
      this._ledgerLines.forEach((t) => this.tweens.add({ targets: t, alpha: 0.03, duration: 500 }));
      const motes = this.ambient;
      this.ambient = null;
      (motes || []).forEach((m) => this.tweens.add({ targets: m, y: 632, alpha: 0, duration: 1500, ease: "Sine.easeIn" }));

      const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
      this.tweens.add({ targets: ov, fillAlpha: 0.87, duration: 500 });
      const title = this.add.text(640, 240, "BUREAU CLOSED", { font: "bold 32px Georgia", color: HEX_RED }).setOrigin(0.5).setScale(0).setDepth(91);
      this.tweens.add({ targets: title, scale: 1.1, duration: 400, ease: "Back.easeOut", onComplete: () => this.tweens.add({ targets: title, scale: 1, duration: 120 }) });
      this.add.text(640, 310, `Score: ${this.score}`, { font: "21px Arial", color: "#ffffff" }).setOrigin(0.5).setDepth(91);
      this.add.text(640, 350, `Missions Catalogued: ${this.currentMission} / 6`, { font: "18px Arial", color: HEX_GRAY }).setOrigin(0.5).setDepth(91);
      this._makeButton(525, 420, "REOPEN THE BUREAU", 200, 50, { stroke: C_RED, textColor: HEX_RED }, () => this.scene.restart());
      this._makeButton(755, 420, "RETURN TO MENU", 200, 50, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.start("MenuScene"));
    })();
  }

  levelComplete() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.inputLocked = true;
    this.clearMission();
    this.hideBubble();

    try { GameManager.completeLevel(69, Math.round((this.flawlessCount / MISSIONS.length) * 100)); } catch (_) {}
    try { BadgeSystem.unlock("arrays_copyOf_mastery"); } catch (_) {}
    try { BadgeSystem.unlock("arrays_wing_seal"); } catch (_) {}
    try {
      localStorage.setItem("level70_results", JSON.stringify({
        level: 70, concept: "arrays_copyOf", phase: "restructuring",
        score: this.score, missionsCompleted: 6, flawlessMissions: this.flawlessCount,
        totalRuns: this.runCount, failedRuns: this.failedRunCount, hintsUsed: this.hintCount,
        selfCorrections: this.selfCorrectionCount,
        backupProactivelyCorrect: this.backupProactive,
        extendPatternClean: this.extendClean,
        splitPatternClean: this.splitClean,
        crossWingCleanFirstRun: this.crossWingClean,
        livesRemaining: this.lives, attempts: this.attemptLog, timestamp: Date.now(),
      }));
    } catch (_) {}

    this.triggerWingFinaleCeremony();
  }

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
  }

  async ceremonyPhase1_Fanfare() {
    if (this._chandelierPool) this.tweens.add({ targets: this._chandelierPool, alpha: 0.12, duration: 400, yoyo: true, hold: 300 });
    this.brightenSilhouettes(1);
    this._ledgerLines.forEach((t, i) => {
      this.time.delayedCall(i * 20, () => { if (t.active) this.tweens.add({ targets: t, alpha: 0.4, duration: 250, yoyo: true, hold: 200 }); });
    });
    const motes = this.ambient;
    (motes || []).forEach((m) => this.tweens.add({ targets: m, y: m.y - 80, duration: 900, ease: "Sine.easeOut" }));
    this._ceremonyCrest = this._crest.c;
    await new Promise((res) => {
      this.tweens.add({ targets: this._ceremonyCrest, x: 640, y: 300, scale: 2.2, duration: 800, ease: "Sine.easeInOut", onComplete: res });
    });
  }

  async ceremonyPhase2_InstrumentsAssemble() {
    const targets = {
      toString: { x: 520, y: 340 },
      sort: { x: 760, y: 340 },
      copyOf: { x: 640, y: 400 },
    };
    const moves = Object.entries(this.silhouettes).map(([key, s]) => {
      return new Promise((res) => {
        this.tweens.add({ targets: s.g, x: targets[key].x, y: targets[key].y, scale: 1.8, duration: 700, ease: "Sine.easeInOut", onComplete: res });
      });
    });
    await Promise.all(moves);
    await this.delay(400);
  }

  async ceremonyPhase3_CentralPanel() {
    const ov = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(90).setInteractive();
    this.tweens.add({ targets: ov, fillAlpha: 0.85, duration: 500 });
    this._ceremonyElements = [ov];

    const panel = this.add.graphics().setDepth(90);
    panel.fillStyle(0x0a0d18, 1);
    panel.fillRoundedRect(320, 70, 640, 560, 16);
    panel.lineStyle(2, C_GOLD, 1);
    panel.strokeRoundedRect(320, 70, 640, 560, 16);
    this._ceremonyElements.push(panel);

    const title = this.add.text(640, 108, "CHIEF CURATOR", { font: "bold 34px Georgia", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setDepth(91).setScale(0);
    this.tweens.add({ targets: title, scale: 1, duration: 350, ease: "Back.easeOut" });
    this._ceremonyElements.push(title);

    const backupPct = `${Object.values(this.backupProactive).filter(Boolean).length}/2`;
    const extendPct = `${Object.values(this.extendClean).filter(Boolean).length}/2`;
    const splitPct = `${Object.values(this.splitClean).filter(Boolean).length}/2`;
    const crossWing = Object.values(this.crossWingClean).some(Boolean) ? "✓" : "✗";
    const lines = [
      "MISSIONS: 6/6",
      `FLAWLESS: ${this.flawlessCount}`,
      `SELF-CORRECTIONS: ${this.selfCorrectionCount}`,
      `BACKUP-PROACTIVE: ${backupPct}`,
      `EXTEND-CLEAN: ${extendPct}`,
      `SPLIT-CLEAN: ${splitPct}`,
      `CROSS-WING CLEAN: ${crossWing}`,
      `HINTS: ${this.hintCount}`,
    ];
    lines.forEach((s, i) => {
      const t = this.add.text(380, 150 + i * 22, s, { font: "15px Arial", color: HEX_GRAY }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 250, delay: 300 + i * 120 });
      this._ceremonyElements.push(t);
    });
    const totalText = this.add.text(380, 150 + 8 * 22, "TOTAL: 0", { font: "bold 21px Arial", color: HEX_GOLD }).setOrigin(0, 0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: totalText, alpha: 1, duration: 250, delay: 1300 });
    const counter = { v: 0 };
    this.tweens.add({ targets: counter, v: this.score, duration: 1000, delay: 1300, onUpdate: () => totalText.setText(`TOTAL: ${Math.round(counter.v)}`) });
    this._ceremonyElements.push(totalText);

    const stars = this._starRating();
    for (let i = 0; i < 3; i++) {
      const earned = i < stars;
      const s = this.add.text(640 + (i - 1) * 60, 420, "★", { font: "40px Arial", color: earned ? HEX_GOLD : "#2a3040" }).setOrigin(0.5).setDepth(91).setScale(0);
      this.tweens.add({ targets: s, scale: 1, duration: 250, delay: 1900 + i * 200, ease: earned ? "Back.easeOut" : "Cubic.easeOut" });
      this._ceremonyElements.push(s);
    }

    const badge = this.add.container(640, 490).setDepth(91).setAlpha(0);
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillCircle(0, 0, 34);
    bg.lineStyle(3, C_GOLD, 1);
    bg.strokeCircle(0, 0, 34);
    const dual = this.add.text(-14, -6, "⧉", { font: "bold 14px Arial", color: HEX_CYAN }).setOrigin(0.5);
    const sand = this.add.text(0, -6, "⏳", { font: "bold 14px Arial", color: HEX_GOLD }).setOrigin(0.5);
    const keys = this.add.text(14, -6, "🔑", { font: "bold 13px Arial", color: HEX_BRASS }).setOrigin(0.5);
    badge.add([bg, dual, sand, keys]);
    this.tweens.add({ targets: badge, alpha: 1, duration: 300, delay: 0 });
    const badgeLbl = this.add.text(640, 532, "copyOf() MASTERY", { font: "bold 15px Georgia", color: HEX_GOLD }).setOrigin(0.5).setDepth(91).setAlpha(0);
    const badgeSub = this.add.text(640, 548, "Accretion ✓  Tuning ✓  Restructuring ✓", { font: "12px Arial", color: "#78909c" }).setOrigin(0.5).setDepth(91).setAlpha(0);
    this.tweens.add({ targets: [badgeLbl, badgeSub], alpha: 1, duration: 300, delay: 0 });
    this._ceremonyElements.push(badge, badgeLbl, badgeSub);

    await this.delay(3200);
  }

  async ceremonyPhase4_WingSeal() {
    const banner = this.add.container(-260, 590).setDepth(92);
    const bg = this.add.graphics();
    bg.fillStyle(0x0a0d18, 1);
    bg.lineStyle(3, C_GOLD, 1);
    bg.fillRoundedRect(-240, -40, 480, 80, 6);
    bg.strokeRoundedRect(-240, -40, 480, 80, 6);
    [-220, 220].forEach((sx) => {
      const s = this.add.text(sx, 0, "◆", { font: "14px Arial", color: HEX_GOLD }).setOrigin(0.5).setAlpha(0.7);
      banner.add(s);
    });
    const title = this.add.text(0, -18, "ARRAYS WING — COMPLETE", { font: "bold 19px Georgia", color: HEX_GOLD }).setOrigin(0.5);
    const caption = this.add.text(0, 30, "7 levels · 3 methods · one museum of order", { font: "italic 13px Georgia", color: HEX_BLUE_GRAY }).setOrigin(0.5).setAlpha(0.85);
    banner.add([bg, title, caption]);

    const cols = [
      { x: -140, label: "toString() ✓" },
      { x: 0, label: "sort() ✓" },
      { x: 140, label: "copyOf() ✓" },
    ];
    const colTexts = cols.map((c) => {
      const t = this.add.text(c.x, 4, c.label, { font: "bold 15px Georgia", color: HEX_GREEN_BRIGHT }).setOrigin(0.5).setAlpha(0);
      banner.add(t);
      return t;
    });

    await new Promise((res) => { this.tweens.add({ targets: banner, x: 640, duration: 500, ease: "Back.easeOut", onComplete: res }); });

    for (const t of colTexts) {
      this.tweens.add({ targets: t, alpha: 1, duration: 200 });
      const chime = this.add.circle(banner.x + t.x, banner.y, 3, C_GOLD, 0.6).setDepth(93);
      this.tweens.add({ targets: chime, scale: 4, alpha: 0, duration: 300, onComplete: () => chime.destroy() });
      await this.delay(400);
    }

    if (this._ceremonyCrest) {
      await new Promise((res) => {
        this.tweens.add({ targets: this._ceremonyCrest, x: banner.x, y: banner.y - 60, scale: 1, duration: 500, ease: "Cubic.easeIn", onComplete: res });
      });
      this.tweens.add({ targets: this._ceremonyCrest, scale: 1.3, duration: 90, yoyo: true });
      this.screenShake(0.006, 160);
      const shock = this.add.circle(banner.x, banner.y - 60, 6, C_GOLD, 0.6).setDepth(93);
      this.tweens.add({ targets: shock, scale: 10, alpha: 0, duration: 500, onComplete: () => shock.destroy() });
    }

    Object.values(this.silhouettes).forEach(({ g }) => this.tweens.add({ targets: g, angle: 6, duration: 200, yoyo: true }));
    this.createGoldCyanMidnightConfetti(640, 300, 50);

    const flash = this.add.rectangle(W / 2, H / 2, W, H, 0xffffff, 0).setDepth(94);
    this.tweens.add({ targets: flash, fillAlpha: 0.5, duration: 250, yoyo: true, onComplete: () => flash.destroy() });

    await this.delay(1000);
  }

  async ceremonyPhase5_BitClosingAddress() {
    await new Promise((res) => { this.tweens.add({ targets: this.bit, x: 640, y: 610, duration: 500, ease: "Sine.easeInOut", onComplete: res }); });
    await this.bitSay("Seven levels of the Arrays Wing — toString LABELLED collections that would otherwise print as hashes, sort ARRANGED them in place with mutation as its signature, copyOf DUPLICATED them with independence as its promise. Three static methods, one fixed-size collection, one museum of order. You can display, arrange, preserve, extend, and split — arrays are no longer the rigid strangers of the ArrayList wing's aftermath. They are your instruments now. Six wings sealed, Curator. Two remain beyond the museum's back doors.");
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
    this._makeButton(500, 640, "RETRY", 150, 44, { stroke: 0x546e7a, textColor: "#b0bec5" }, () => this.scene.restart());
    this._makeButton(770, 640, "NEXT WING →", 260, 44, { fill: 0x00733a, stroke: C_GOLD, textColor: "#ffffff" }, () => {
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
