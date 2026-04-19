/**
 * Level8Scene — "Character Workshop: Char Refinement" (Tuning Phase)
 * ===================================================================
 * Mechanic: Factory assembly line — validate, categorize, pattern-match
 *
 *  WAVE STRUCTURE (progressive difficulty):
 *   Waves  1-10: Basic Validation (valid/invalid, 4s timer)
 *   Waves 11-20: Category Sorting + Pattern challenges (3s)
 *   Waves 21-30: Special / Escape chars + Pattern challenges (3s)
 *   Waves 31-40: Rapid-fire categorisation (2s)
 *   Waves 41-50: Master mode — everything combined (1.5s)
 *
 *  MECHANICS:
 *   1. Validation Scanner — is this a valid char?  ✓/✗
 *   2. Category Sorting   — drag/click to correct bin
 *   3. Pattern Matching    — sequence / case / type / quote challenges
 *   4. Rapid Fire          — triggered after 10 consecutive correct
 *   5. Escape Detective    — identify escape-sequence meanings
 *
 * Schema Theory: Tuning — deepening char understanding through repetition
 */

import Phaser from "phaser";
import { GameManager } from "../../GameManager.js";
import { BadgeSystem } from "../../BadgeSystem.js";
import { ProgressTracker } from "../../ProgressTracker.js";

/* ───────── Constants ───────── */
const W = 800;
const H = 600;
const ACCURACY_THRESHOLD = 85;
const MAX_LIVES = 3;
const TARGET_PROCESSED = 50;

/* ───────── Char pools ───────── */
const VALID_UPPERCASE = ["'A'","'B'","'C'","'D'","'E'","'F'","'G'","'H'","'K'","'M'","'N'","'P'","'R'","'S'","'T'","'W'","'X'","'Z'"];
const VALID_LOWERCASE = ["'a'","'b'","'c'","'d'","'e'","'f'","'g'","'h'","'k'","'m'","'n'","'p'","'r'","'s'","'t'","'w'","'x'","'z'"];
const VALID_DIGITS    = ["'0'","'1'","'2'","'3'","'4'","'5'","'6'","'7'","'8'","'9'"];
const VALID_SYMBOLS   = ["'@'","'#'","'!'","'?'","'*'","'+'","'-'","'='","'%'","'&'"];
const VALID_SPECIAL   = ["'\\n'","'\\t'","'\\\\'","'\\''"];
const VALID_SPACES    = ["' '"];

const INVALID_CHARS = [
  { value: '"A"',    reason: "Double quotes → that's a string!" },
  { value: '"Hello"',reason: "Double quotes → that's a string!" },
  { value: "'AB'",   reason: "Multiple characters → a char holds exactly ONE!" },
  { value: "'XY'",   reason: "Multiple characters → a char holds exactly ONE!" },
  { value: "''",     reason: "Empty quotes → a char needs exactly ONE character!" },
  { value: "A",      reason: "No quotes → must use single quotes for char!" },
  { value: "z",      reason: "No quotes → must use single quotes for char!" },
  { value: "123",    reason: "Number without quotes → that's an integer!" },
  { value: "45",     reason: "Number without quotes → that's an integer!" },
  { value: '"BC"',   reason: "Double quotes → that's a string!" },
  { value: "'abc'",  reason: "Multiple characters → a char holds exactly ONE!" },
];

/* Category metadata */
const CATEGORIES = {
  UPPERCASE: { color: 0xff6b6b, icon: "A",   label: "UPPERCASE" },
  LOWERCASE: { color: 0x4ecdc4, icon: "a",   label: "LOWERCASE" },
  DIGITS:    { color: 0xffd93d, icon: "0",    label: "DIGITS" },
  SYMBOLS:   { color: 0xc56cf0, icon: "@",    label: "SYMBOLS" },
  SPECIAL:   { color: 0xff9ff3, icon: "\\n",  label: "SPECIAL" },
  SPACES:    { color: 0xaaaaaa, icon: "□",    label: "SPACES" },
};

/* Pattern challenge banks */
const PATTERN_SEQUENCE = [
  { seq: ["'A'","'B'","'C'"], answer: "'D'", options: ["'D'","'a'","'4'","\"D\""], explanation: "Next in alphabetical sequence: A→B→C→D" },
  { seq: ["'x'","'y'"], answer: "'z'", options: ["'z'","'Z'","'a'","'w'"], explanation: "Next lowercase letter: x→y→z" },
  { seq: ["'1'","'2'","'3'"], answer: "'4'", options: ["'4'","'5'","4","\"4\""], explanation: "Next digit char: '1'→'2'→'3'→'4'" },
  { seq: ["'P'","'Q'","'R'"], answer: "'S'", options: ["'S'","'s'","'T'","\"S\""], explanation: "Next uppercase: P→Q→R→S" },
];

const PATTERN_CASE = [
  { given: "'a'", answer: "'z'", options: ["'A'","'z'","'5'","'@'"], explanation: "Both 'a' and 'z' are lowercase letters" },
  { given: "'B'", answer: "'M'", options: ["'b'","'M'","'3'","'!'"], explanation: "Both 'B' and 'M' are uppercase letters" },
  { given: "'3'", answer: "'7'", options: ["'A'","'a'","'7'","'#'"], explanation: "Both '3' and '7' are digit characters" },
];

const PATTERN_ODDONE = [
  { group: ["'A'","'B'","'5'","'C'"], oddIndex: 2, explanation: "'5' is a digit among uppercase letters" },
  { group: ["'a'","'z'","'@'","'m'"], oddIndex: 2, explanation: "'@' is a symbol among lowercase letters" },
  { group: ["'1'","'2'","'a'","'3'"], oddIndex: 2, explanation: "'a' is a letter among digit chars" },
  { group: ["'#'","'!'","'K'","'*'"], oddIndex: 2, explanation: "'K' is an uppercase letter among symbols" },
];

const PATTERN_QUOTE = [
  { options: ['"A"',"'A'","'AB'","A"], correctIndex: 1, explanation: "'A' uses single quotes with ONE character — valid char!" },
  { options: ["'XY'","\"z\"","'z'","z"], correctIndex: 2, explanation: "'z' is a single character in single quotes!" },
  { options: ["''","\"5\"","5","'5'"], correctIndex: 3, explanation: "'5' is a single digit character in single quotes!" },
];

const ESCAPE_CHALLENGES = [
  { char: "'\\n'", answer: "Newline", options: ["Tab","Newline","Backslash","Nothing"], preview: "Line 1\n↓\nLine 2", explanation: "\\n creates a new line break" },
  { char: "'\\t'", answer: "Tab", options: ["Newline","Tab","Backspace","Space"], preview: "Col1\t→\tCol2", explanation: "\\t inserts a horizontal tab space" },
  { char: "'\\\\'", answer: "Backslash", options: ["Forward Slash","Backslash","Newline","Null"], preview: "Path: C:\\\\folder", explanation: "\\\\ produces a single backslash \\" },
  { char: "'\\''", answer: "Single Quote", options: ["Double Quote","Single Quote","Tab","Backslash"], preview: "It\\'s valid!", explanation: "\\' lets you store a literal single quote" },
];

/* ───────── Helper ───────── */
function lerpColor(a, b, t) {
  const ar = (a >> 16) & 0xff, ag = (a >> 8) & 0xff, ab = a & 0xff;
  const br = (b >> 16) & 0xff, bg = (b >> 8) & 0xff, bb = b & 0xff;
  return (Math.round(ar + (br - ar) * t) << 16) |
         (Math.round(ag + (bg - ag) * t) << 8) |
          Math.round(ab + (bb - ab) * t);
}

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function getCategory(val) {
  if (VALID_UPPERCASE.includes(val)) return "UPPERCASE";
  if (VALID_LOWERCASE.includes(val)) return "LOWERCASE";
  if (VALID_DIGITS.includes(val))    return "DIGITS";
  if (VALID_SYMBOLS.includes(val))   return "SYMBOLS";
  if (VALID_SPECIAL.includes(val))   return "SPECIAL";
  if (VALID_SPACES.includes(val))    return "SPACES";
  return null;
}

/* ═══════════════════════════════════════════════════════════════
 *  LEVEL 8 SCENE — Character Workshop Factory
 * ═══════════════════════════════════════════════════════════════ */
export class Level8Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level8Scene" });
  }

  create() {
    this.physics.world.gravity.y = 0;

    /* ── State ── */
    this.score = 0;
    this.lives = MAX_LIVES;
    this.combo = 0;
    this.maxCombo = 0;
    this.totalProcessed = 0;
    this.correctAnswers = 0;
    this.wrongAnswers = 0;
    this.waveNumber = 0;
    this.isComplete = false;
    this.gameStarted = false;
    this.startTime = 0;
    this.currentElements = [];
    this.consecutiveCorrect = 0;
    this.rapidFireActive = false;
    this.rapidFireTimer = null;
    this.rapidFireScore = 0;
    this.patternChallengesDone = 0;
    this.timerEvent = null;
    this.timerBarTween = null;
    this.binCounts = { UPPERCASE: 0, LOWERCASE: 0, DIGITS: 0, SYMBOLS: 0, SPECIAL: 0, SPACES: 0 };
    this.scrapCount = 0;
    this.phase = "validate";

    this._drawFactoryBackground();
    this._generateTextures();
    this._createParticles();
    this._createConveyorBelt();
    this._createInspectionZone();
    this._createSortingBins();
    this._createHUD();

    const uiScene = this.scene.get("UIScene");
    if (uiScene && uiScene.setLevelLabel) {
      uiScene.setLevelLabel("Level 8: Tuning — Character Workshop!");
    }

    this._showInstruction();
  }

  /* ═══════════════════════════════════════════════════════════════
   *  FACTORY BACKGROUND
   * ═══════════════════════════════════════════════════════════════ */
  _drawFactoryBackground() {
    const gfx = this.add.graphics().setDepth(0);
    const top = 0x1a1a2e;
    const bot = 0x0d0d1a;
    for (let i = 0; i < 60; i++) {
      const t = i / 60;
      gfx.fillStyle(lerpColor(top, bot, t), 1);
      gfx.fillRect(0, Math.floor((H * i) / 60), W, Math.ceil(H / 60) + 1);
    }

    /* Metal grid on floor */
    const gridGfx = this.add.graphics().setDepth(1).setAlpha(0.04);
    gridGfx.lineStyle(1, 0x00ffff, 1);
    for (let x = 0; x < W; x += 40) {
      gridGfx.beginPath(); gridGfx.moveTo(x, 0); gridGfx.lineTo(x, H); gridGfx.strokePath();
    }
    for (let y = 0; y < H; y += 40) {
      gridGfx.beginPath(); gridGfx.moveTo(0, y); gridGfx.lineTo(W, y); gridGfx.strokePath();
    }

    /* Hazard stripes at top */
    const stripGfx = this.add.graphics().setDepth(2);
    for (let x = 0; x < W; x += 30) {
      stripGfx.fillStyle(x % 60 === 0 ? 0xffd93d : 0x1a1a2e, 0.15);
      stripGfx.fillRect(x, 0, 15, 6);
    }

    /* Ambient sparks */
    this.ambientSparks = [];
    for (let i = 0; i < 15; i++) {
      const s = this.add.circle(
        Phaser.Math.Between(10, W - 10),
        Phaser.Math.Between(10, H - 10),
        Phaser.Math.FloatBetween(0.5, 2),
        0xffd93d,
        Phaser.Math.FloatBetween(0.05, 0.2)
      ).setDepth(3);
      this.ambientSparks.push({
        obj: s,
        speed: Phaser.Math.FloatBetween(0.1, 0.4),
        wobbleOff: Math.random() * Math.PI * 2,
      });
    }
  }

  /* ═══════════════════════════════════════════════════════════════
   *  TEXTURES
   * ═══════════════════════════════════════════════════════════════ */
  _generateTextures() {
    const make = (name, color, r) => {
      if (this.textures.exists(name)) return;
      const g = this.add.graphics();
      g.fillStyle(color, 1);
      g.fillCircle(r, r, r);
      g.generateTexture(name, r * 2, r * 2);
      g.destroy();
    };
    make("greenSpark", 0x00ff88, 4);
    make("redSpark", 0xe74c3c, 4);
    make("cyanSpark", 0x00ffff, 4);
    make("goldSpark", 0xffd700, 4);
    make("confettiSpark", 0xffd700, 4);
    make("factorySpark", 0xffa500, 3);
  }

  /* ═══════════════════════════════════════════════════════════════
   *  PARTICLES
   * ═══════════════════════════════════════════════════════════════ */
  _createParticles() {
    this.correctPart = this.add.particles(0, 0, "greenSpark", {
      speed: { min: 80, max: 250 }, scale: { start: 1.2, end: 0 },
      alpha: { start: 1, end: 0 }, lifespan: 700, blendMode: "ADD", emitting: false,
    }).setDepth(160);

    this.wrongPart = this.add.particles(0, 0, "redSpark", {
      speed: { min: 60, max: 180 }, scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 }, lifespan: 500, blendMode: "ADD", emitting: false,
    }).setDepth(160);

    this.cyanPart = this.add.particles(0, 0, "cyanSpark", {
      speed: { min: 40, max: 120 }, scale: { start: 0.8, end: 0 },
      alpha: { start: 0.7, end: 0 }, lifespan: 900, blendMode: "ADD", emitting: false,
    }).setDepth(160);

    this.confettiPart = this.add.particles(0, 0, "confettiSpark", {
      speed: { min: 40, max: 180 }, angle: { min: 230, max: 310 },
      scale: { start: 1, end: 0.3 }, alpha: { start: 1, end: 0 },
      lifespan: 2500, gravityY: 120, emitting: false,
    }).setDepth(160);

    this.binPart = this.add.particles(0, 0, "factorySpark", {
      speed: { min: 60, max: 160 }, scale: { start: 0.8, end: 0 },
      alpha: { start: 1, end: 0 }, lifespan: 500, blendMode: "ADD", emitting: false,
    }).setDepth(160);
  }

  /* ═══════════════════════════════════════════════════════════════
   *  CONVEYOR BELT (animated tile sprite drawn programmatically)
   * ═══════════════════════════════════════════════════════════════ */
  _createConveyorBelt() {
    if (!this.textures.exists("beltTile")) {
      const g = this.add.graphics();
      g.fillStyle(0x2a2a3a, 1);
      g.fillRect(0, 0, 64, 30);
      g.fillStyle(0x3a3a4a, 1);
      g.fillRect(0, 0, 32, 30);
      g.lineStyle(1, 0x555566, 0.5);
      g.strokeRect(0, 0, 32, 30);
      g.strokeRect(32, 0, 32, 30);
      g.generateTexture("beltTile", 64, 30);
      g.destroy();
    }

    this.belt = this.add.tileSprite(W / 2, 280, W - 40, 30, "beltTile").setDepth(5);

    /* Metal rails */
    const railGfx = this.add.graphics().setDepth(6);
    railGfx.fillStyle(0x555566, 1);
    railGfx.fillRect(20, 265, W - 40, 3);
    railGfx.fillRect(20, 293, W - 40, 3);

    /* Conveyor arrows */
    this.conveyorArrows = [];
    for (let i = 0; i < 6; i++) {
      const arrow = this.add.text(80 + i * 120, 280, "→", {
        fontFamily: "Arial",
        fontSize: "18px",
        color: "#ffd93d",
      }).setOrigin(0.5).setAlpha(0.15).setDepth(7);
      this.conveyorArrows.push(arrow);
    }

    /* Belt shine effect */
    this.beltShine = this.add.rectangle(0, 280, 100, 30, 0xffffff, 0.03).setDepth(8);
    this.tweens.add({
      targets: this.beltShine,
      x: W,
      duration: 3000,
      repeat: -1,
      ease: "Linear",
    });
  }

  /* ═══════════════════════════════════════════════════════════════
   *  INSPECTION ZONE (center circle with scanning beams)
   * ═══════════════════════════════════════════════════════════════ */
  _createInspectionZone() {
    this.inspectionGfx = this.add.graphics().setDepth(10);

    /* Outer glow rings */
    for (let i = 3; i > 0; i--) {
      const ring = this.add.circle(W / 2, 280, 70 + i * 12, 0x00ffff, 0.02 / i).setDepth(9);
      this.tweens.add({
        targets: ring,
        scale: { from: 1, to: 1.08 },
        alpha: { from: 0.04, to: 0.01 },
        duration: 1500 + i * 300,
        yoyo: true,
        repeat: -1,
      });
    }

    /* Scanning laser beams */
    this.scanBeams = [];
    for (let i = 0; i < 4; i++) {
      const beam = this.add.rectangle(W / 2, 280, 2, 100, 0x00ffff, 0.15).setDepth(11);
      beam.setAngle(i * 45);
      this.tweens.add({
        targets: beam,
        angle: beam.angle + 360,
        duration: 5000 + i * 600,
        repeat: -1,
      });
      this.scanBeams.push(beam);
    }

    /* Platform circle */
    this.inspectionPlatform = this.add.circle(W / 2, 280, 65, 0x00ffff, 0.06).setDepth(10);
    this.inspectionPlatform.setStrokeStyle(3, 0x00ffff, 0.5);
    this.tweens.add({
      targets: this.inspectionPlatform,
      alpha: { from: 0.06, to: 0.12 },
      scale: { from: 1, to: 1.03 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
    });

    /* "INSPECTION ZONE" label */
    this.add.text(W / 2, 215, "INSPECTION ZONE", {
      fontFamily: "Courier New, monospace",
      fontSize: "10px",
      color: "#00ffff",
      fontStyle: "bold",
    }).setOrigin(0.5).setAlpha(0.4).setDepth(12);
  }

  /* ═══════════════════════════════════════════════════════════════
   *  SORTING BINS (bottom row) + SCRAP chute for rejects
   * ═══════════════════════════════════════════════════════════════ */
  _createSortingBins() {
    this.bins = {};
    const catKeys = Object.keys(CATEGORIES);
    const binW = 100;
    const binH = 72;
    const gap = 6;
    const scrapW = 68;
    const totalCatsW = catKeys.length * binW + (catKeys.length - 1) * gap;
    const totalRowW = scrapW + gap + totalCatsW;
    const leftEdge = (W - totalRowW) / 2;
    const binY = H - 55;
    const maxFillVis = 18;

    /* ── SCRAP / REJECT chute (invalid items correctly rejected) ── */
    const scrapX = leftEdge + scrapW / 2;
    const scrapContainer = this.add.container(scrapX, binY).setDepth(50);
    const scrapBody = this.add.rectangle(0, 0, scrapW, binH, 0x991b1b, 0.35);
    scrapBody.setStrokeStyle(2, 0xff4444, 0.7);
    const scrapLabel = this.add.text(0, -binH / 2 - 10, "SCRAP", {
      fontFamily: "Courier New, monospace",
      fontSize: "8px",
      color: "#ff8888",
      fontStyle: "bold",
    }).setOrigin(0.5);
    const scrapIcon = this.add.text(0, -4, "✗", {
      fontFamily: "Arial",
      fontSize: "26px",
      color: "#ff6666",
      fontStyle: "bold",
    }).setOrigin(0.5).setAlpha(0.7);
    const scrapFill = this.add.rectangle(0, binH / 2 - 4, scrapW - 10, 1, 0xff4444, 0.55).setOrigin(0.5, 1);
    const scrapCounter = this.add.text(0, 24, "0", {
      fontFamily: "Courier New, monospace",
      fontSize: "13px",
      color: "#ffffff",
      fontStyle: "bold",
    }).setOrigin(0.5);
    scrapContainer.add([scrapBody, scrapFill, scrapLabel, scrapIcon, scrapCounter]);
    this.scrapBin = {
      container: scrapContainer,
      body: scrapBody,
      fill: scrapFill,
      counter: scrapCounter,
      count: 0,
      binH,
      scrapW,
      maxFillVis,
    };

    const startX = leftEdge + scrapW + gap + binW / 2;

    catKeys.forEach((key, i) => {
      const cat = CATEGORIES[key];
      const bx = startX + i * (binW + gap);
      const container = this.add.container(bx, binY).setDepth(50);

      const body = this.add.rectangle(0, 0, binW, binH, cat.color, 0.12);
      body.setStrokeStyle(2, cat.color, 0.6);

      const fillBar = this.add.rectangle(0, binH / 2 - 4, binW - 10, 1, cat.color, 0.45).setOrigin(0.5, 1);

      const label = this.add.text(0, -binH / 2 - 10, cat.label, {
        fontFamily: "Courier New, monospace",
        fontSize: "8px",
        color: Phaser.Display.Color.IntegerToColor(cat.color).rgba,
        fontStyle: "bold",
      }).setOrigin(0.5);

      const icon = this.add.text(0, -6, cat.icon, {
        fontFamily: "Courier New, monospace",
        fontSize: "20px",
        color: "#ffffff",
        fontStyle: "bold",
      }).setOrigin(0.5).setAlpha(0.55);

      const counter = this.add.text(0, 22, "0", {
        fontFamily: "Courier New, monospace",
        fontSize: "13px",
        color: "#ffffff",
        fontStyle: "bold",
      }).setOrigin(0.5);

      container.add([body, fillBar, label, icon, counter]);

      body.setInteractive({ useHandCursor: true });
      body.on("pointerover", () => {
        if (!this._isSortingPhase()) return;
        this.tweens.add({ targets: container, scaleY: 1.08, scaleX: 1.04, duration: 120 });
        body.setStrokeStyle(3, cat.color, 1);
      });
      body.on("pointerout", () => {
        this.tweens.add({ targets: container, scaleY: 1, scaleX: 1, duration: 120 });
        body.setStrokeStyle(2, cat.color, 0.6);
      });
      body.on("pointerup", () => {
        if (!this._isSortingPhase() || !this._currentSortChar) return;
        this._handleCategoryChoice(key);
      });

      this.bins[key] = {
        container,
        body,
        fillBar,
        counter,
        count: 0,
        color: cat.color,
        binH,
        binW,
        maxFillVis,
      };
    });

    this.binRowHint = this.add.text(W / 2, H - 118, "↑ Valid/Reject තෝරන්න — පසුව bins පිරෙනවා ↑", {
      fontFamily: "Arial",
      fontSize: "10px",
      color: "#64748b",
      fontStyle: "italic",
    }).setOrigin(0.5).setDepth(48).setAlpha(0.85);
  }

  _updateBinFillBar(binData) {
    if (!binData?.fillBar) return;
    const innerH = binData.binH - 18;
    const h = Math.min(innerH * Math.min(binData.count / binData.maxFillVis, 1), innerH);
    binData.fillBar.height = Math.max(1, h);
  }

  _updateScrapFill() {
    const s = this.scrapBin;
    if (!s?.fill) return;
    const innerH = s.binH - 18;
    const h = Math.min(innerH * Math.min(s.count / s.maxFillVis, 1), innerH);
    s.fill.height = Math.max(1, h);
  }

  _setBinsDimmedForValidation(dim) {
    const alphaBody = dim ? 0.06 : 0.12;
    const alphaFill = dim ? 0.15 : 0.45;
    Object.keys(this.bins).forEach(k => {
      const b = this.bins[k];
      if (!b?.body) return;
      this.tweens.add({
        targets: b.body,
        alpha: alphaBody,
        duration: 200,
      });
      if (b.fillBar) this.tweens.add({ targets: b.fillBar, alpha: alphaFill, duration: 200 });
    });
    if (this.scrapBin?.body) {
      this.tweens.add({
        targets: [this.scrapBin.body, this.scrapBin.fill],
        alpha: dim ? 0.25 : 0.55,
        duration: 200,
      });
    }
  }

  _flashBinsReadyForSort() {
    Object.keys(this.bins).forEach(k => {
      const b = this.bins[k];
      if (!b?.body) return;
      b.body.setAlpha(0.12);
      if (b.fillBar) b.fillBar.setAlpha(0.45);
      this.tweens.add({
        targets: b.body,
        alpha: { from: 0.08, to: 0.22 },
        duration: 350,
        yoyo: true,
        repeat: 2,
        onComplete: () => {
          if (b.body?.active) b.body.setAlpha(0.18);
        },
      });
    });
    if (this.scrapBin?.body) {
      this.tweens.add({ targets: this.scrapBin.body, alpha: 0.12, duration: 200 });
      this.tweens.add({ targets: this.scrapBin.fill, alpha: 0.2, duration: 200 });
    }
  }

  _animateScrapFeed() {
    const s = this.scrapBin;
    if (!s?.container) return;
    this.binPart.emitParticleAt(s.container.x, s.container.y - 25, 18);
    this.tweens.add({
      targets: s.container,
      scaleX: 1.12,
      scaleY: 1.15,
      duration: 120,
      yoyo: true,
    });
    this.tweens.add({
      targets: s.counter,
      scale: { from: 1.6, to: 1 },
      duration: 280,
    });
  }

  _isSortingPhase() {
    return this.phase === "sort" || this.phase === "rapidfire";
  }

  /* ═══════════════════════════════════════════════════════════════
   *  HUD
   * ═══════════════════════════════════════════════════════════════ */
  _createHUD() {
    const dp = 100;

    /* Top bar bg */
    this.add.rectangle(W / 2, 28, W, 48, 0x0a0a1a, 0.88).setDepth(dp - 1);
    this.add.rectangle(W / 2, 52, W, 1, 0xffd93d, 0.15).setDepth(dp - 1);

    /* Score */
    this.scoreText = this.add.text(16, 12, "SCORE: 0", {
      fontFamily: "Courier New, monospace", fontSize: "15px",
      color: "#ffd93d", fontStyle: "bold",
    }).setDepth(dp);

    /* Wave */
    this.waveText = this.add.text(16, 32, "WAVE: 0 / 50", {
      fontFamily: "Courier New, monospace", fontSize: "11px", color: "#888888",
    }).setDepth(dp);

    /* Progress bar */
    this.progBg = this.add.rectangle(W / 2, 16, 240, 12, 0x1a1a2e, 0.8).setDepth(dp);
    this.progBg.setStrokeStyle(1, 0xffd93d, 0.3);
    this.progFill = this.add.rectangle(W / 2 - 120, 16, 0, 10, 0xffd93d, 0.7)
      .setOrigin(0, 0.5).setDepth(dp + 1);
    this.progText = this.add.text(W / 2, 16, "0 / 50", {
      fontFamily: "Courier New, monospace", fontSize: "9px",
      color: "#ffffff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(dp + 2);

    /* Combo */
    this.comboText = this.add.text(W / 2, 38, "", {
      fontFamily: "Courier New, monospace", fontSize: "11px",
      color: "#ffd93d", fontStyle: "bold",
    }).setOrigin(0.5).setAlpha(0).setDepth(dp);

    /* Lives */
    this.livesText = this.add.text(W - 16, 12, "♥♥♥", {
      fontFamily: "Arial", fontSize: "20px",
      color: "#ff4444", fontStyle: "bold",
    }).setOrigin(1, 0).setDepth(dp);

    /* Accuracy */
    this.accText = this.add.text(W - 16, 36, "ACC: 100%", {
      fontFamily: "Courier New, monospace", fontSize: "10px", color: "#888888",
    }).setOrigin(1, 0).setDepth(dp);

    /* Timer bar (shown per character) */
    this.timerBarBg = this.add.rectangle(W / 2, 188, 200, 8, 0x1a1a2e, 0.6).setDepth(dp);
    this.timerBarBg.setStrokeStyle(1, 0x00ffff, 0.2);
    this.timerBarFill = this.add.rectangle(W / 2 - 100, 188, 200, 6, 0x00ffff, 0.7)
      .setOrigin(0, 0.5).setDepth(dp + 1);
    this.timerBarBg.setAlpha(0);
    this.timerBarFill.setAlpha(0);

    /* Tooltip */
    this.tooltip = this.add.text(W / 2, 360, "", {
      fontFamily: "Courier New, monospace", fontSize: "13px",
      color: "#ffffff",
      backgroundColor: "rgba(10, 10, 26, 0.9)",
      padding: { x: 14, y: 6 },
      align: "center",
      wordWrap: { width: 500 },
    }).setOrigin(0.5).setAlpha(0).setDepth(dp + 10);

    /* Rapid fire banner (hidden) */
    this.rapidBanner = this.add.text(W / 2, 170, "⚡ RAPID FIRE! DOUBLE POINTS! ⚡", {
      fontFamily: "Courier New, monospace", fontSize: "16px",
      color: "#ffd93d", fontStyle: "bold",
      stroke: "#ff6b00", strokeThickness: 2,
    }).setOrigin(0.5).setAlpha(0).setDepth(dp + 5);
  }

  _updateHUD() {
    if (this.scoreText?.active) this.scoreText.setText(`SCORE: ${this.score}`);
    if (this.waveText?.active) this.waveText.setText(`WAVE: ${Math.min(this.waveNumber, 50)} / 50`);

    const pct = Math.min(this.totalProcessed / TARGET_PROCESSED, 1);
    if (this.progFill?.active) {
      this.tweens.add({ targets: this.progFill, width: 240 * pct, duration: 200, ease: "Cubic.out" });
    }
    if (this.progText?.active) this.progText.setText(`${this.totalProcessed} / ${TARGET_PROCESSED}`);

    if (this.livesText?.active) {
      let h = "";
      for (let i = 0; i < MAX_LIVES; i++) h += i < this.lives ? "♥" : "♡";
      this.livesText.setText(h);
    }

    const total = this.correctAnswers + this.wrongAnswers;
    const acc = total > 0 ? Math.round((this.correctAnswers / total) * 100) : 100;
    if (this.accText?.active) this.accText.setText(`ACC: ${acc}%`);

    if (this.comboText?.active) {
      if (this.combo >= 2) {
        const mult = this.combo >= 20 ? "x5" : this.combo >= 10 ? "x3" : this.combo >= 5 ? "x2" : "";
        this.comboText.setText(`COMBO: ${this.combo} ${mult}`);
        this.comboText.setAlpha(1);
      } else {
        this.comboText.setAlpha(0);
      }
    }
  }

  /* ═══════════════════════════════════════════════════════════════
   *  INSTRUCTION OVERLAY
   * ═══════════════════════════════════════════════════════════════ */
  _showInstruction() {
    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.88).setDepth(200);

    const panelG = this.add.graphics().setDepth(201);
    panelG.fillStyle(0x0d1b2a, 0.98);
    panelG.fillRoundedRect(W / 2 - 320, 30, 640, 530, 16);
    panelG.lineStyle(3, 0xffd93d);
    panelG.strokeRoundedRect(W / 2 - 320, 30, 640, 530, 16);

    const title = this.add.text(W / 2, 68, "🏭 MISSION 8: CHARACTER WORKSHOP", {
      fontFamily: "Arial Black, Arial, sans-serif",
      fontSize: "23px", color: "#ffd93d", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(202);

    const sub = this.add.text(W / 2, 98, "Quality Control Engineer Reporting for Duty", {
      fontFamily: "Arial", fontSize: "15px",
      color: "#4ecdc4", fontStyle: "italic",
    }).setOrigin(0.5).setDepth(202);

    const desc = this.add.text(W / 2, 215,
      "Process incoming characters on the factory line!\n\n" +
      "STEP 1: VALIDATE — Is it a valid char?\n" +
      "   ✓ Valid:  'A'  'z'  '5'  '@'  ' '  '\\n'\n" +
      "   ✗ Invalid: \"AB\"  123  ''  'XY'  A\n\n" +
      "STEP 2: CATEGORIZE — Sort into the right bin\n" +
      "   Uppercase · Lowercase · Digits\n" +
      "   Symbols · Special · Spaces\n\n" +
      "BONUS: Pattern challenges & rapid-fire rounds!\n" +
      "Combo streaks multiply your score!",
      {
        fontFamily: "Courier New, monospace",
        fontSize: "12px", color: "#bdc3c7",
        align: "center", lineSpacing: 5,
      }
    ).setOrigin(0.5).setDepth(202);

    const goal = this.add.text(W / 2, 415, "Process 50 characters with 85%+ accuracy\nto earn the ASCII Master badge! 🔤", {
      fontFamily: "Arial", fontSize: "13px",
      color: "#f1c40f", align: "center", fontStyle: "bold", lineSpacing: 5,
    }).setOrigin(0.5).setDepth(202);

    const warn = this.add.text(W / 2, 460, "⚠ 3 lives — wrong answers cost lives!", {
      fontFamily: "Arial", fontSize: "11px", color: "#e74c3c",
    }).setOrigin(0.5).setDepth(202);

    const btnBg = this.add.rectangle(W / 2, 505, 280, 48, 0x8B6914, 1).setDepth(202);
    btnBg.setStrokeStyle(2, 0xffd93d);
    const btnTxt = this.add.text(W / 2, 505, "START SHIFT", {
      fontFamily: "Courier New, monospace",
      fontSize: "20px", color: "#ffd93d", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(203);

    btnBg.setInteractive({ useHandCursor: true });
    btnBg.on("pointerover", () => {
      btnBg.setFillStyle(0xa67c00);
      this.tweens.add({ targets: [btnBg, btnTxt], scaleX: 1.08, scaleY: 1.08, duration: 120 });
    });
    btnBg.on("pointerout", () => {
      btnBg.setFillStyle(0x8B6914);
      this.tweens.add({ targets: [btnBg, btnTxt], scaleX: 1, scaleY: 1, duration: 120 });
    });
    btnBg.on("pointerup", () => {
      [overlay, panelG, title, sub, desc, goal, warn, btnBg, btnTxt].forEach(e => e.destroy());
      this._startGame();
    });
  }

  /* ═══════════════════════════════════════════════════════════════
   *  START GAME
   * ═══════════════════════════════════════════════════════════════ */
  _startGame() {
    this.gameStarted = true;
    this.startTime = this.time.now;
    GameManager.set("lives", MAX_LIVES);
    this._nextWave();
  }

  /* ═══════════════════════════════════════════════════════════════
   *  WAVE SYSTEM
   * ═══════════════════════════════════════════════════════════════ */
  _getTimerDuration() {
    if (this.waveNumber <= 10) return 4000;
    if (this.waveNumber <= 20) return 3000;
    if (this.waveNumber <= 30) return 3000;
    if (this.waveNumber <= 40) return 2000;
    return 1500;
  }

  _nextWave() {
    if (this.isComplete) return;

    if (this.totalProcessed >= TARGET_PROCESSED) {
      this._levelComplete();
      return;
    }

    this.waveNumber++;
    this._updateHUD();

    /* Check for rapid-fire trigger */
    if (this.consecutiveCorrect >= 10 && !this.rapidFireActive) {
      this._startRapidFire();
      return;
    }

    /* Every 5 waves (from wave 11+), insert a pattern challenge */
    if (this.waveNumber > 10 && this.waveNumber % 5 === 0) {
      this._showPatternChallenge();
      return;
    }

    /* Determine wave type based on wave number */
    if (this.waveNumber <= 10) {
      this._spawnValidationChar();
    } else if (this.waveNumber <= 30) {
      this._spawnValidationThenSort();
    } else {
      this._spawnValidationThenSort();
    }
  }

  /* ═══════════════════════════════════════════════════════════════
   *  SPAWN CHARACTER for Validation
   * ═══════════════════════════════════════════════════════════════ */
  _pickCharForWave() {
    const validPools = [VALID_UPPERCASE, VALID_LOWERCASE, VALID_DIGITS, VALID_SYMBOLS];
    if (this.waveNumber > 20) validPools.push(VALID_SPECIAL, VALID_SPACES);
    else if (this.waveNumber > 5) validPools.push(VALID_SPACES);

    const isValid = Math.random() < 0.65;
    if (isValid) {
      const pool = pickRandom(validPools);
      const val = pickRandom(pool);
      return { value: val, isValid: true, category: getCategory(val) };
    } else {
      const inv = pickRandom(INVALID_CHARS);
      return { value: inv.value, isValid: false, reason: inv.reason, category: null };
    }
  }

  _spawnValidationChar() {
    this._clearCurrentElements();
    this.phase = "validate";
    const char = this._pickCharForWave();
    this._currentChar = char;

    /* Character display in inspection zone */
    const charText = this.add.text(W / 2, 270, char.value, {
      fontFamily: "Courier New, monospace",
      fontSize: char.value.length > 4 ? "28px" : "38px",
      color: "#ffffff", fontStyle: "bold",
      stroke: "#0d1b2a", strokeThickness: 3,
    }).setOrigin(0.5).setDepth(60);

    /* Scale-in animation */
    charText.setScale(0);
    this.tweens.add({
      targets: charText,
      scaleX: 1, scaleY: 1,
      duration: 250,
      ease: "Back.out",
    });

    /* Pulsing glow */
    this.tweens.add({
      targets: charText,
      scaleX: 1.06, scaleY: 1.06,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });

    this.currentElements.push(charText);

    this._needsSort = char.isValid;

    /* Validation buttons */
    const validBtn = this._makeActionButton(W / 2 - 100, 370, "✓ VALID", 0x00aa55, () => {
      this._handleValidation(true);
    });
    const rejectBtn = this._makeActionButton(W / 2 + 100, 370, "✗ REJECT", 0xcc3333, () => {
      this._handleValidation(false);
    });
    this.currentElements.push(...validBtn, ...rejectBtn);

    this._setBinsDimmedForValidation(true);
    if (this.binRowHint) {
      this.binRowHint.setText("↑ Tap VALID or REJECT — scrap / bins fill when correct ↑");
    }

    /* Timer */
    this._startTimer(this._getTimerDuration(), () => {
      this._onTimerExpired();
    });
  }

  _spawnValidationThenSort() {
    this._clearCurrentElements();
    this.phase = "validate";
    const char = this._pickCharForWave();
    this._currentChar = char;
    this._needsSort = char.isValid;

    const charText = this.add.text(W / 2, 270, char.value, {
      fontFamily: "Courier New, monospace",
      fontSize: char.value.length > 4 ? "28px" : "38px",
      color: "#ffffff", fontStyle: "bold",
      stroke: "#0d1b2a", strokeThickness: 3,
    }).setOrigin(0.5).setDepth(60);

    charText.setScale(0);
    this.tweens.add({
      targets: charText,
      scaleX: 1, scaleY: 1,
      duration: 250,
      ease: "Back.out",
    });
    this.tweens.add({
      targets: charText,
      scaleX: 1.06, scaleY: 1.06,
      duration: 800, yoyo: true, repeat: -1, ease: "Sine.inOut",
    });

    this.currentElements.push(charText);

    const validBtn = this._makeActionButton(W / 2 - 100, 370, "✓ VALID", 0x00aa55, () => {
      this._handleValidation(true);
    });
    const rejectBtn = this._makeActionButton(W / 2 + 100, 370, "✗ REJECT", 0xcc3333, () => {
      this._handleValidation(false);
    });
    this.currentElements.push(...validBtn, ...rejectBtn);

    this._setBinsDimmedForValidation(true);
    if (this.binRowHint) {
      this.binRowHint.setText("↑ Tap VALID or REJECT — scrap / bins fill when correct ↑");
    }

    this._startTimer(this._getTimerDuration(), () => this._onTimerExpired());
  }

  /* ═══════════════════════════════════════════════════════════════
   *  VALIDATION HANDLER
   * ═══════════════════════════════════════════════════════════════ */
  _handleValidation(playerSaidValid) {
    this._stopTimer();
    const char = this._currentChar;
    const correct = playerSaidValid === char.isValid;

    if (correct) {
      this._onCorrect(char.isValid
        ? `✓ '${char.value}' is a valid char!`
        : `✓ Correct! ${char.value} is NOT a valid char.`);

      /* Correct REJECT → scrap chute fills */
      if (!char.isValid) {
        this.scrapCount++;
        if (this.scrapBin) {
          this.scrapBin.count = this.scrapCount;
          this.scrapBin.counter.setText(String(this.scrapCount));
          this._updateScrapFill();
          this._animateScrapFeed();
        }
      }

      /* Correct VALID → pulse category bins, then sort */
      if (char.isValid && this._needsSort) {
        this._flashBinsReadyForSort();
        this.time.delayedCall(600, () => this._enterSortPhase(char));
        return;
      }
    } else {
      const msg = char.isValid
        ? `✗ Wrong! ${char.value} IS a valid char — single character in single quotes!`
        : `✗ Wrong! ${char.value} is NOT a valid char — ${char.reason}`;
      this._onWrong(msg);
      if (this.lives <= 0) return;
    }

    this.totalProcessed++;
    this._updateHUD();
    this.time.delayedCall(correct ? 600 : 1200, () => this._nextWave());
  }

  /* ═══════════════════════════════════════════════════════════════
   *  SORT PHASE — categorize the validated char
   * ═══════════════════════════════════════════════════════════════ */
  _enterSortPhase(char) {
    this._clearCurrentElements();
    this.phase = "sort";
    this._currentSortChar = char;

    this._setBinsDimmedForValidation(false);
    if (this.binRowHint) {
      this.binRowHint.setText("↓ Click the correct category bin — watch it fill ↓");
    }

    /* Show the char and instruction */
    const label = this.add.text(W / 2, 210, "SORT INTO CATEGORY:", {
      fontFamily: "Courier New, monospace", fontSize: "12px",
      color: "#ffd93d", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(60);

    const charText = this.add.text(W / 2, 260, char.value, {
      fontFamily: "Courier New, monospace", fontSize: "34px",
      color: "#00ffff", fontStyle: "bold",
      stroke: "#0d1b2a", strokeThickness: 3,
    }).setOrigin(0.5).setDepth(60);

    this.tweens.add({
      targets: charText,
      scaleX: 1.05, scaleY: 1.05,
      duration: 700, yoyo: true, repeat: -1, ease: "Sine.inOut",
    });

    /* Arrow pointing to bins */
    const arrow = this.add.text(W / 2, 320, "↓ Click a bin below ↓", {
      fontFamily: "Courier New, monospace", fontSize: "11px",
      color: "#888888",
    }).setOrigin(0.5).setDepth(60);
    this.tweens.add({
      targets: arrow, alpha: { from: 0.4, to: 1 },
      duration: 600, yoyo: true, repeat: -1,
    });

    this.currentElements.push(label, charText, arrow);
    this._startTimer(this._getTimerDuration(), () => this._onTimerExpired());
  }

  _handleCategoryChoice(chosenCategory) {
    this._stopTimer();
    const char = this._currentSortChar;
    if (!char) return;

    const correctCat = char.category;
    const correct = chosenCategory === correctCat;

    if (correct) {
      this._onCorrect(`✓ '${char.value}' sorted into ${correctCat}!`);
      this.binCounts[correctCat]++;
      this.bins[correctCat].count++;
      this.bins[correctCat].counter.setText(String(this.bins[correctCat].count));
      this._updateBinFillBar(this.bins[correctCat]);

      /* Animate bin */
      this.binPart.emitParticleAt(this.bins[correctCat].container.x, this.bins[correctCat].container.y - 20, 12);
      this.tweens.add({
        targets: this.bins[correctCat].container,
        scaleY: 1.15, scaleX: 1.08,
        duration: 150, yoyo: true,
      });
      this.tweens.add({
        targets: this.bins[correctCat].counter,
        scale: { from: 1.5, to: 1 }, duration: 300,
      });
    } else {
      this._onWrong(`✗ Wrong bin! '${char.value}' belongs in ${correctCat}, not ${chosenCategory}!`);
      if (this.lives <= 0) return;
    }

    this._currentSortChar = null;
    this.totalProcessed++;
    this._updateHUD();

    if (this.rapidFireActive) {
      this.time.delayedCall(correct ? 300 : 600, () => this._rapidFireNext());
    } else {
      this.time.delayedCall(correct ? 500 : 1000, () => this._nextWave());
    }
  }

  /* ═══════════════════════════════════════════════════════════════
   *  PATTERN CHALLENGE
   * ═══════════════════════════════════════════════════════════════ */
  _showPatternChallenge() {
    this._clearCurrentElements();
    this.phase = "pattern";
    this._setBinsDimmedForValidation(true);
    if (this.binRowHint) {
      this.binRowHint.setText("Pattern challenge — bins idle");
    }

    /* Pick random challenge type */
    const types = ["sequence", "case", "oddone", "quote"];
    if (this.waveNumber > 20) types.push("escape");
    const type = pickRandom(types);

    switch (type) {
      case "sequence": this._patternSequence(); break;
      case "case":     this._patternCase(); break;
      case "oddone":   this._patternOddOne(); break;
      case "quote":    this._patternQuote(); break;
      case "escape":   this._patternEscape(); break;
    }
  }

  _patternSequence() {
    const q = pickRandom(PATTERN_SEQUENCE);

    const panelLabel = this.add.text(W / 2, 120, "🧩 PATTERN CHALLENGE: Complete the Sequence", {
      fontFamily: "Courier New, monospace", fontSize: "13px",
      color: "#ffd93d", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(110);

    /* Display sequence */
    const seqStr = q.seq.join("  →  ") + "  →  [?]";
    const seqText = this.add.text(W / 2, 180, seqStr, {
      fontFamily: "Courier New, monospace", fontSize: "24px",
      color: "#00ffff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(110);

    this.currentElements.push(panelLabel, seqText);

    /* Answer buttons */
    this._createPatternButtons(q.options, q.options.indexOf(q.answer), q.explanation, 260);
  }

  _patternCase() {
    const q = pickRandom(PATTERN_CASE);

    const panelLabel = this.add.text(W / 2, 120, "🧩 CASE MATCHING: Find the Same Type", {
      fontFamily: "Courier New, monospace", fontSize: "13px",
      color: "#ffd93d", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(110);

    const givenText = this.add.text(W / 2, 180, `Given:  ${q.given}     Which matches?`, {
      fontFamily: "Courier New, monospace", fontSize: "20px",
      color: "#00ffff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(110);

    this.currentElements.push(panelLabel, givenText);
    this._createPatternButtons(q.options, q.options.indexOf(q.answer), q.explanation, 250);
  }

  _patternOddOne() {
    const q = pickRandom(PATTERN_ODDONE);

    const panelLabel = this.add.text(W / 2, 120, "🧩 ODD ONE OUT: Which Doesn't Belong?", {
      fontFamily: "Courier New, monospace", fontSize: "13px",
      color: "#ffd93d", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(110);

    const groupStr = q.group.join("    ");
    const groupText = this.add.text(W / 2, 180, groupStr, {
      fontFamily: "Courier New, monospace", fontSize: "24px",
      color: "#ffffff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(110);

    this.currentElements.push(panelLabel, groupText);
    this._createPatternButtons(q.group, q.oddIndex, q.explanation, 250);
  }

  _patternQuote() {
    const q = pickRandom(PATTERN_QUOTE);

    const panelLabel = this.add.text(W / 2, 120, "🧩 QUOTE CHECK: Which is a VALID Char?", {
      fontFamily: "Courier New, monospace", fontSize: "13px",
      color: "#ffd93d", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(110);

    this.currentElements.push(panelLabel);
    this._createPatternButtons(q.options, q.correctIndex, q.explanation, 200);
  }

  _patternEscape() {
    const q = pickRandom(ESCAPE_CHALLENGES);

    const panelLabel = this.add.text(W / 2, 110, "🔍 ESCAPE DETECTIVE: What Does This Do?", {
      fontFamily: "Courier New, monospace", fontSize: "13px",
      color: "#ff9ff3", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(110);

    const charDisplay = this.add.text(W / 2, 165, q.char, {
      fontFamily: "Courier New, monospace", fontSize: "36px",
      color: "#ff9ff3", fontStyle: "bold",
      stroke: "#0d1b2a", strokeThickness: 3,
    }).setOrigin(0.5).setDepth(110);
    this.tweens.add({
      targets: charDisplay, scaleX: 1.08, scaleY: 1.08,
      duration: 700, yoyo: true, repeat: -1, ease: "Sine.inOut",
    });

    /* Preview */
    const previewBg = this.add.rectangle(W / 2, 220, 300, 40, 0x0d1b2a, 0.9).setDepth(109);
    previewBg.setStrokeStyle(1, 0xff9ff3, 0.3);
    const previewText = this.add.text(W / 2, 220, q.preview, {
      fontFamily: "Courier New, monospace", fontSize: "11px",
      color: "#aaaaaa", align: "center",
    }).setOrigin(0.5).setDepth(110);

    this.currentElements.push(panelLabel, charDisplay, previewBg, previewText);
    this._createPatternButtons(q.options, q.options.indexOf(q.answer), q.explanation, 270);
  }

  _createPatternButtons(options, correctIndex, explanation, yStart) {
    const btnW = 160;
    const btnH = 44;
    const cols = options.length <= 2 ? options.length : 2;
    const gapX = 16;
    const gapY = 12;
    const totalW = cols * btnW + (cols - 1) * gapX;
    const startX = W / 2 - totalW / 2 + btnW / 2;

    const buttons = [];

    options.forEach((opt, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const bx = startX + col * (btnW + gapX);
      const by = yStart + row * (btnH + gapY);

      const bg = this.add.rectangle(bx, by, btnW, btnH, 0x1a2332, 0.9).setDepth(120);
      bg.setStrokeStyle(2, 0x00ffff, 0.4);

      const fontSize = opt.length > 12 ? "12px" : opt.length > 6 ? "14px" : "18px";
      const txt = this.add.text(bx, by, opt, {
        fontFamily: "Courier New, monospace", fontSize,
        color: "#ffffff", fontStyle: "bold",
        wordWrap: { width: btnW - 14 }, align: "center",
      }).setOrigin(0.5).setDepth(121);

      bg.setInteractive({ useHandCursor: true });
      bg.on("pointerover", () => {
        bg.setStrokeStyle(2, 0x00ffff, 1);
        this.tweens.add({ targets: [bg, txt], scaleX: 1.05, scaleY: 1.05, duration: 80 });
      });
      bg.on("pointerout", () => {
        bg.setStrokeStyle(2, 0x00ffff, 0.4);
        this.tweens.add({ targets: [bg, txt], scaleX: 1, scaleY: 1, duration: 80 });
      });
      bg.on("pointerup", () => {
        if (this.phase !== "pattern") return;
        this._handlePatternAnswer(i, correctIndex, explanation, bg, buttons);
      });

      this.currentElements.push(bg, txt);
      buttons.push({ bg, txt, index: i });
    });
  }

  _handlePatternAnswer(selected, correctIndex, explanation, selectedBg, allButtons) {
    this.phase = "pattern_answered";
    const correct = selected === correctIndex;

    if (correct) {
      this.patternChallengesDone++;
      const points = 50;
      this._onCorrect(explanation, points);
    } else {
      this._onWrong(explanation);
      if (this.lives <= 0) return;

      /* Highlight correct */
      const correctBtn = allButtons.find(b => b.index === correctIndex);
      if (correctBtn) {
        correctBtn.bg.setFillStyle(0x004d40, 1);
        correctBtn.bg.setStrokeStyle(3, 0x00ff88, 1);
        this.tweens.add({
          targets: [correctBtn.bg, correctBtn.txt],
          scaleX: 1.1, scaleY: 1.1, duration: 200, yoyo: true, repeat: 1,
        });
      }
    }

    this._updateHUD();
    this.time.delayedCall(correct ? 800 : 1500, () => this._nextWave());
  }

  /* ═══════════════════════════════════════════════════════════════
   *  RAPID FIRE MODE
   * ═══════════════════════════════════════════════════════════════ */
  _startRapidFire() {
    this._clearCurrentElements();
    this.rapidFireActive = true;
    this.rapidFireScore = 0;
    this.consecutiveCorrect = 0;
    this.phase = "rapidfire";

    /* Announcement */
    this.rapidBanner.setAlpha(1);
    this.tweens.add({
      targets: this.rapidBanner,
      scaleX: 1.1, scaleY: 1.1,
      duration: 300, yoyo: true, repeat: 2,
    });
    this.cameras.main.flash(300, 255, 215, 0);

    /* Flash bins */
    Object.values(this.bins).forEach(bin => {
      this.tweens.add({
        targets: bin.body,
        alpha: { from: 0.3, to: 1 },
        duration: 200, yoyo: true, repeat: 2,
      });
    });

    this._rapidFireCount = 0;
    this._rapidFireMax = 10;

    this.time.delayedCall(1200, () => this._rapidFireNext());
  }

  _rapidFireNext() {
    if (this._rapidFireCount >= this._rapidFireMax || this.isComplete) {
      this._endRapidFire();
      return;
    }

    this._clearCurrentElements();
    this.phase = "rapidfire";
    this._rapidFireCount++;

    this._setBinsDimmedForValidation(false);
    if (this.binRowHint) {
      this.binRowHint.setText("⚡ RAPID FIRE — tap the correct bin! ⚡");
    }

    /* Pick a valid char only for rapid fire */
    const allValid = [...VALID_UPPERCASE, ...VALID_LOWERCASE, ...VALID_DIGITS, ...VALID_SYMBOLS];
    if (this.waveNumber > 20) allValid.push(...VALID_SPECIAL, ...VALID_SPACES);
    const val = pickRandom(allValid);
    const cat = getCategory(val);
    this._currentSortChar = { value: val, category: cat, isValid: true };

    /* Rapid counter */
    const counterText = this.add.text(W / 2, 200, `${this._rapidFireCount} / ${this._rapidFireMax}`, {
      fontFamily: "Courier New, monospace", fontSize: "11px", color: "#ffd93d",
    }).setOrigin(0.5).setDepth(60);

    const charText = this.add.text(W / 2, 260, val, {
      fontFamily: "Courier New, monospace", fontSize: "36px",
      color: "#ffd93d", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(60);
    charText.setScale(0);
    this.tweens.add({
      targets: charText, scaleX: 1, scaleY: 1,
      duration: 150, ease: "Back.out",
    });

    const arrow = this.add.text(W / 2, 310, "↓ SORT! ↓", {
      fontFamily: "Courier New, monospace", fontSize: "12px", color: "#ffd93d",
    }).setOrigin(0.5).setDepth(60);
    this.tweens.add({
      targets: arrow, alpha: { from: 0.4, to: 1 },
      duration: 300, yoyo: true, repeat: -1,
    });

    this.currentElements.push(counterText, charText, arrow);
    this._startTimer(2000, () => {
      this._onTimerExpired();
      this.time.delayedCall(500, () => this._rapidFireNext());
    });
  }

  _endRapidFire() {
    this.rapidFireActive = false;
    this.rapidBanner.setAlpha(0);
    this._clearCurrentElements();

    const bonusText = this.add.text(W / 2, H / 2, `⚡ RAPID FIRE COMPLETE! +${this.rapidFireScore}`, {
      fontFamily: "Courier New, monospace", fontSize: "18px",
      color: "#ffd93d", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(150);

    this.cyanPart.emitParticleAt(W / 2, H / 2, 25);

    this.tweens.add({
      targets: bonusText, alpha: 0, y: H / 2 - 60,
      duration: 1500, delay: 800,
      onComplete: () => { bonusText.destroy(); this._nextWave(); },
    });
  }

  /* ═══════════════════════════════════════════════════════════════
   *  CORRECT / WRONG HANDLERS
   * ═══════════════════════════════════════════════════════════════ */
  _onCorrect(message, basePoints) {
    this.correctAnswers++;
    this.combo++;
    this.consecutiveCorrect++;
    if (this.combo > this.maxCombo) this.maxCombo = this.combo;

    const mult = this.combo >= 20 ? 5 : this.combo >= 10 ? 3 : this.combo >= 5 ? 2 : 1;
    const rapidMult = this.rapidFireActive ? 2 : 1;
    const points = (basePoints || 20) * mult * rapidMult;
    this.score += points;
    if (this.rapidFireActive) this.rapidFireScore += points;

    GameManager.addXP(points);
    GameManager.addScore(points);
    GameManager.addCombo();

    this.correctPart.emitParticleAt(W / 2, 270, 15);
    this._showPopup(W / 2, 240, `+${points}`, "#00ff88");
    this._showTooltip(message, "#00ff88");

    if (this.combo === 5 || this.combo === 10 || this.combo === 20) {
      this._showComboFlash();
    }

    this._updateHUD();
  }

  _onWrong(message) {
    this.wrongAnswers++;
    this.combo = 0;
    this.consecutiveCorrect = 0;
    this.lives--;

    GameManager.resetCombo();
    GameManager.loseLife();

    this.wrongPart.emitParticleAt(W / 2, 270, 12);
    this.cameras.main.shake(200, 0.012);
    this.cameras.main.flash(150, 255, 50, 0);

    this._showPopup(W / 2, 240, "WRONG!", "#ff4444");
    this._showTooltip(message, "#ff4444");

    this._updateHUD();

    if (this.lives <= 0) {
      this.time.delayedCall(800, () => this._gameOver());
    }
  }

  _onTimerExpired() {
    this._stopTimer();
    this._onWrong("⏰ Time's up! Too slow!");
    if (this.lives <= 0) return;
    this.totalProcessed++;
    this._updateHUD();
  }

  /* ═══════════════════════════════════════════════════════════════
   *  TIMER
   * ═══════════════════════════════════════════════════════════════ */
  _startTimer(duration, onExpire) {
    this.timerBarBg.setAlpha(1);
    this.timerBarFill.setAlpha(1);
    this.timerBarFill.width = 200;
    this.timerBarFill.setFillStyle(0x00ffff, 0.7);

    if (this.timerBarTween) this.timerBarTween.destroy();
    this.timerBarTween = this.tweens.add({
      targets: this.timerBarFill,
      width: 0,
      duration,
      ease: "Linear",
      onUpdate: () => {
        const pct = this.timerBarFill.width / 200;
        if (pct < 0.25) this.timerBarFill.setFillStyle(0xff4444, 0.8);
        else if (pct < 0.5) this.timerBarFill.setFillStyle(0xffd93d, 0.7);
      },
    });

    if (this.timerEvent) this.timerEvent.destroy();
    this.timerEvent = this.time.delayedCall(duration, onExpire);
  }

  _stopTimer() {
    if (this.timerBarTween) { this.timerBarTween.destroy(); this.timerBarTween = null; }
    if (this.timerEvent) { this.timerEvent.destroy(); this.timerEvent = null; }
    this.timerBarBg.setAlpha(0);
    this.timerBarFill.setAlpha(0);
  }

  /* ═══════════════════════════════════════════════════════════════
   *  UI HELPERS
   * ═══════════════════════════════════════════════════════════════ */
  _makeActionButton(x, y, label, color, callback) {
    const bg = this.add.rectangle(x, y, 160, 48, color, 0.85).setDepth(70);
    bg.setStrokeStyle(2, Phaser.Display.Color.IntegerToColor(color).brighten(30).color, 0.8);

    const txt = this.add.text(x, y, label, {
      fontFamily: "Courier New, monospace", fontSize: "18px",
      color: "#ffffff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(71);

    bg.setInteractive({ useHandCursor: true });
    bg.on("pointerover", () => {
      this.tweens.add({ targets: [bg, txt], scaleX: 1.08, scaleY: 1.08, duration: 100 });
    });
    bg.on("pointerout", () => {
      this.tweens.add({ targets: [bg, txt], scaleX: 1, scaleY: 1, duration: 100 });
    });
    bg.on("pointerup", callback);

    return [bg, txt];
  }

  _showPopup(x, y, text, color) {
    const popup = this.add.text(x, y, text, {
      fontFamily: "Courier New, monospace", fontSize: "22px",
      color, fontStyle: "bold",
      stroke: "#0a0a1a", strokeThickness: 3,
    }).setOrigin(0.5).setDepth(170);

    this.tweens.add({
      targets: popup, y: y - 60, alpha: 0,
      scaleX: 1.3, scaleY: 1.3, duration: 800, ease: "Cubic.out",
      onComplete: () => popup.destroy(),
    });
  }

  _showTooltip(text, color) {
    if (!this.tooltip?.active) return;
    this.tooltip.setText(text);
    this.tooltip.setColor(color || "#ffffff");
    this.tooltip.setAlpha(1);
    this.tweens.killTweensOf(this.tooltip);
    this.tweens.add({
      targets: this.tooltip, alpha: 0, delay: 2000, duration: 500,
    });
  }

  _showComboFlash() {
    const mult = this.combo >= 20 ? "x5" : this.combo >= 10 ? "x3" : "x2";
    const comboPopup = this.add.text(W / 2, 150, `🔥 COMBO ${mult}!`, {
      fontFamily: "Arial Black, Arial, sans-serif", fontSize: "28px",
      color: "#ffd93d", fontStyle: "bold",
      stroke: "#ff6b00", strokeThickness: 4,
    }).setOrigin(0.5).setDepth(175);

    this.tweens.add({
      targets: comboPopup,
      scaleX: { from: 0.5, to: 1.4 },
      scaleY: { from: 0.5, to: 1.4 },
      alpha: { from: 1, to: 0 },
      y: 100, duration: 1200,
      onComplete: () => comboPopup.destroy(),
    });

    if (this.combo >= 10) {
      this.cameras.main.flash(200, 255, 215, 0);
    }
  }

  _clearCurrentElements() {
    this.currentElements.forEach(el => {
      if (el?.active) { this.tweens.killTweensOf(el); el.destroy(); }
    });
    this.currentElements = [];
  }

  /* ═══════════════════════════════════════════════════════════════
   *  LEVEL COMPLETE
   * ═══════════════════════════════════════════════════════════════ */
  _levelComplete() {
    this.isComplete = true;
    this._stopTimer();
    this._clearCurrentElements();

    const total = this.correctAnswers + this.wrongAnswers;
    const accuracy = total > 0 ? Math.round((this.correctAnswers / total) * 100) : 100;
    const passed = accuracy >= ACCURACY_THRESHOLD;

    const elapsed = Math.round((this.time.now - this.startTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    const timeStr = `${mins}:${secs.toString().padStart(2, "0")}`;

    if (passed) {
      GameManager.completeLevel(7, accuracy);
      BadgeSystem.unlock("ascii_master");
      ProgressTracker.saveProgress(GameManager.getState());
      this.cameras.main.flash(600, 255, 215, 0);

      for (let i = 0; i < 8; i++) {
        this.time.delayedCall(i * 200, () => {
          this.confettiPart.emitParticleAt(
            Phaser.Math.Between(100, W - 100),
            Phaser.Math.Between(0, 50), 15
          );
        });
      }
    }

    this.time.delayedCall(passed ? 600 : 300, () => {
      this._showEndScreen(passed, accuracy, timeStr);
    });
  }

  _showEndScreen(passed, accuracy, timeStr) {
    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.9).setDepth(200);

    const panelG = this.add.graphics().setDepth(201);
    const panelColor = passed ? 0x0d1b2a : 0x4a1e1e;
    const borderColor = passed ? 0xffd93d : 0xe74c3c;
    panelG.fillStyle(panelColor, 0.97);
    panelG.fillRoundedRect(W / 2 - 300, 20, 600, 555, 16);
    panelG.lineStyle(3, borderColor);
    panelG.strokeRoundedRect(W / 2 - 300, 20, 600, 555, 16);

    const titleText = passed ? "🏭 WORKSHOP SHIFT COMPLETE!" : "❌ ACCURACY TOO LOW";
    const titleColor = passed ? "#ffd93d" : "#e74c3c";

    this.add.text(W / 2, 55, titleText, {
      fontFamily: "Arial Black, Arial, sans-serif", fontSize: "24px",
      color: titleColor, fontStyle: "bold",
    }).setOrigin(0.5).setDepth(202);

    let sy = 90;
    const stats = [
      `Characters Processed: ${this.totalProcessed} / ${TARGET_PROCESSED}`,
      `Accuracy: ${accuracy}%`,
      `Score: ${this.score}`,
      `Time: ${timeStr}`,
      `Max Combo: ${this.maxCombo}x`,
      `Pattern Challenges: ${this.patternChallengesDone}`,
      `Scrap (correct rejects): ${this.scrapCount}`,
      `Lives Remaining: ${this.lives} / ${MAX_LIVES}`,
    ];
    stats.forEach((s, i) => {
      this.add.text(W / 2, sy + i * 24, s, {
        fontFamily: "Courier New, monospace", fontSize: "13px", color: "#ecf0f1",
      }).setOrigin(0.5).setDepth(202);
    });

    /* Category breakdown */
    sy += stats.length * 24 + 15;
    this.add.text(W / 2, sy, "Sorted By Category:", {
      fontFamily: "Courier New, monospace", fontSize: "12px",
      color: "#ffd93d", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(202);
    sy += 18;

    Object.keys(CATEGORIES).forEach((key, i) => {
      const cat = CATEGORIES[key];
      const cnt = this.binCounts[key] || 0;
      const colorStr = Phaser.Display.Color.IntegerToColor(cat.color).rgba;
      this.add.text(W / 2, sy + i * 18, `${cat.label}: ${cnt}`, {
        fontFamily: "Courier New, monospace", fontSize: "11px", color: colorStr,
      }).setOrigin(0.5).setDepth(202);
    });

    sy += Object.keys(CATEGORIES).length * 18 + 10;

    if (passed) {
      this.add.text(W / 2, sy, "🔤 Badge Unlocked: ASCII Master!", {
        fontFamily: "Arial", fontSize: "15px",
        color: "#f1c40f", fontStyle: "bold",
      }).setOrigin(0.5).setDepth(202);
      sy += 25;

      const bullets = [
        "✅ Valid char format: single char in single quotes",
        "✅ Categories: A-Z, a-z, 0-9, symbols, special, space",
        "✅ Escape sequences: \\n, \\t, \\\\, \\'",
        "✅ Pattern recognition across char types",
      ];
      bullets.forEach((b, i) => {
        this.add.text(W / 2, sy + i * 18, b, {
          fontFamily: "Arial", fontSize: "10px", color: "#bdc3c7",
        }).setOrigin(0.5).setDepth(202);
      });
      sy += bullets.length * 18 + 12;

      this._createEndButton(W / 2 - 130, sy, "NEXT LEVEL →", 0x8B6914, () => {
        this.scene.stop("UIScene");
        this.scene.start("MenuScene");
      });
      this._createEndButton(W / 2 + 130, sy, "REPLAY", 0x1a3a4a, () => {
        GameManager.resetLevel();
        this.scene.restart();
      });
    } else {
      this.add.text(W / 2, sy, `Need ${ACCURACY_THRESHOLD}%+ accuracy to pass!`, {
        fontFamily: "Arial", fontSize: "14px",
        color: "#ff8888", fontStyle: "bold",
      }).setOrigin(0.5).setDepth(202);
      sy += 25;

      this.add.text(W / 2, sy, "Practice recognizing valid chars and try again.", {
        fontFamily: "Arial", fontSize: "12px", color: "#aaaaaa",
      }).setOrigin(0.5).setDepth(202);
      sy += 35;

      this._createEndButton(W / 2 - 100, sy, "TRY AGAIN", 0xe74c3c, () => {
        GameManager.resetLevel();
        this.scene.restart();
      });
      this._createEndButton(W / 2 + 100, sy, "MENU", 0x34495e, () => {
        this.scene.stop("UIScene");
        this.scene.start("MenuScene");
      });
    }
  }

  /* ═══════════════════════════════════════════════════════════════
   *  GAME OVER
   * ═══════════════════════════════════════════════════════════════ */
  _gameOver() {
    this.isComplete = true;
    this._stopTimer();
    this._clearCurrentElements();

    this.cameras.main.shake(500, 0.02);
    this.cameras.main.flash(300, 255, 0, 0);

    this.time.delayedCall(600, () => {
      const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.9).setDepth(200);

      const panelG = this.add.graphics().setDepth(201);
      panelG.fillStyle(0x3a0000, 0.95);
      panelG.fillRoundedRect(W / 2 - 260, H / 2 - 170, 520, 340, 16);
      panelG.lineStyle(3, 0xe74c3c);
      panelG.strokeRoundedRect(W / 2 - 260, H / 2 - 170, 520, 340, 16);

      this.add.text(W / 2, H / 2 - 120, "💀 FACTORY SHUTDOWN", {
        fontFamily: "Courier New, monospace", fontSize: "28px",
        color: "#e74c3c", fontStyle: "bold",
      }).setOrigin(0.5).setDepth(202);

      this.add.text(W / 2, H / 2 - 70, "All lives lost — quality control failed!", {
        fontFamily: "Courier New, monospace", fontSize: "13px", color: "#ff8888",
      }).setOrigin(0.5).setDepth(202);

      const total = this.correctAnswers + this.wrongAnswers;
      const acc = total > 0 ? Math.round((this.correctAnswers / total) * 100) : 0;

      this.add.text(W / 2, H / 2 - 20, [
        `Processed: ${this.totalProcessed} / ${TARGET_PROCESSED}`,
        `Correct: ${this.correctAnswers}  |  Wrong: ${this.wrongAnswers}`,
        `Accuracy: ${acc}%  |  Score: ${this.score}`,
      ].join("\n"), {
        fontFamily: "Courier New, monospace", fontSize: "12px",
        color: "#aaaaaa", align: "center", lineSpacing: 6,
      }).setOrigin(0.5).setDepth(202);

      /* Glitch effect */
      const glitchText = this.add.text(W / 2, H / 2 - 120, "💀 FACTORY SHUTDOWN", {
        fontFamily: "Courier New, monospace", fontSize: "28px",
        color: "#ff0000", fontStyle: "bold",
      }).setOrigin(0.5).setDepth(203).setAlpha(0);

      this.time.addEvent({
        delay: 300, repeat: 5,
        callback: () => {
          if (glitchText?.active) {
            glitchText.setAlpha(0.5);
            glitchText.setX(W / 2 + Phaser.Math.Between(-3, 3));
            this.time.delayedCall(60, () => {
              if (glitchText?.active) { glitchText.setAlpha(0); glitchText.setX(W / 2); }
            });
          }
        },
      });

      this._createEndButton(W / 2 - 100, H / 2 + 100, "TRY AGAIN", 0xe74c3c, () => {
        GameManager.resetLevel();
        this.scene.restart();
      });
      this._createEndButton(W / 2 + 100, H / 2 + 100, "MENU", 0x34495e, () => {
        this.scene.stop("UIScene");
        this.scene.start("MenuScene");
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════════
   *  END BUTTON FACTORY
   * ═══════════════════════════════════════════════════════════════ */
  _createEndButton(x, y, text, color, callback) {
    const bg = this.add.rectangle(x, y, 200, 44, color, 1).setDepth(202);
    bg.setStrokeStyle(2, Phaser.Display.Color.IntegerToColor(color).brighten(30).color);
    const txt = this.add.text(x, y, text, {
      fontFamily: "Courier New, monospace", fontSize: "14px",
      color: "#ffffff", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(203);

    bg.setInteractive({ useHandCursor: true });
    bg.on("pointerover", () => {
      this.tweens.add({ targets: [bg, txt], scaleX: 1.08, scaleY: 1.08, duration: 100 });
    });
    bg.on("pointerout", () => {
      this.tweens.add({ targets: [bg, txt], scaleX: 1, scaleY: 1, duration: 100 });
    });
    bg.on("pointerup", callback);
  }

  /* ═══════════════════════════════════════════════════════════════
   *  UPDATE LOOP
   * ═══════════════════════════════════════════════════════════════ */
  update(time, delta) {
    /* Conveyor belt scroll */
    if (this.belt?.active) {
      this.belt.tilePositionX += delta * 0.04;
    }

    /* Conveyor arrows float */
    if (this.conveyorArrows) {
      this.conveyorArrows.forEach((a, i) => {
        a.setAlpha(0.1 + Math.sin(time * 0.003 + i) * 0.08);
      });
    }

    /* Ambient sparks drift */
    if (this.ambientSparks) {
      this.ambientSparks.forEach(s => {
        s.obj.y -= s.speed;
        s.obj.x += Math.sin(time * 0.001 + s.wobbleOff) * 0.2;
        if (s.obj.y < -5) {
          s.obj.y = H + 5;
          s.obj.x = Phaser.Math.Between(10, W - 10);
        }
      });
    }
  }

  /* ═══════════════════════════════════════════════════════════════
   *  SHUTDOWN
   * ═══════════════════════════════════════════════════════════════ */
  shutdown() {
    this._stopTimer();
    this._clearCurrentElements();
    this.ambientSparks = [];
    this.conveyorArrows = [];
  }
}
