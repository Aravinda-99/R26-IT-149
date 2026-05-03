/**
 * Level11Scene — String Operations (Tuning Phase)
 * ═══════════════════════════════════════════════════════════════════════════
 * v3 — All 6 operations in one scene with unique mini-game per operation
 *
 * Operations & Mechanics:
 * 1. length()           → Ruler Measure (drag notch to cut point)
 * 2. charAt(i)          → Index Jumper (click correct character at index)
 * 3. toUpperCase/Lower  → Case Flipper (click letters to flip case)
 * 4. concat (+)         → Magnet Merge (drag two halves together)
 * 5. substring(a,b)     → Slice Cutter (drag two blades to mark range)
 * 6. trim()             → Space Sweeper (swipe to sweep leading/trailing spaces)
 *
 * Schema Theory: TUNING — mastery through guided repetitive practice
 */

import Phaser from "phaser";

/* ═══════════════════════════════════════════════════════════════════════════
 *  COLORS & CONSTANTS
 * ═══════════════════════════════════════════════════════════════════════════ */

const COLORS = {
  primary_purple: "#7F77DD", purple_light: "#9B92E8", purple_dark: "#534AB7",
  purple_darker: "#26215C", purple_bg: "#EEEDFE", purple_pale: "#F4F2FE",
  purple_border: "#D5D0E8", purple_tinted_gray: "#9B92C8",
  success_green: "#1D9E75", success_green_dark: "#0F6E56",
  success_bg: "#EAF3DE", success_bg_dark: "#D5EBC0",
  error_red: "#E24B4A", error_red_dark: "#A32D2D",
  error_bg: "#FCEBEB", error_bg_dark: "#F8DBDA",
  text_primary: "#1F1E1D", text_secondary: "#888780",
  white: "#FFFFFF", gold: "#FFD700", pink: "#ED93B1",
  cyan: "#00C9DB", orange: "#F5A623"
};

const C = {
  primary_purple: 0x7F77DD, purple_light: 0x9B92E8, purple_dark: 0x534AB7,
  purple_darker: 0x26215C, purple_bg: 0xEEEDFE, purple_pale: 0xF4F2FE,
  purple_border: 0xD5D0E8, purple_tinted_gray: 0x9B92C8,
  success_green: 0x1D9E75, success_green_dark: 0x0F6E56,
  success_bg: 0xEAF3DE, success_bg_dark: 0xD5EBC0,
  error_red: 0xE24B4A, error_red_dark: 0xA32D2D,
  error_bg: 0xFCEBEB, error_bg_dark: 0xF8DBDA,
  text_primary: 0x1F1E1D, text_secondary: 0x888780,
  bg_top: 0xF4F2FE, bg_bottom: 0xFAF9F5, white: 0xFFFFFF,
  gold: 0xFFD700, pink: 0xED93B1, cyan: 0x00C9DB, orange: 0xF5A623,
  confetti_purple: 0xB7AFEE, confetti_green: 0x7FCFA3, confetti_pink: 0xF5B9CC
};

const W = 800, H = 600;
const BOX_W = 46, BOX_H = 56;

/* ═══════════════════════════════════════════════════════════════════════════
 *  OPERATIONS DATA — Each has tutorial + rounds
 * ═══════════════════════════════════════════════════════════════════════════ */

const OPERATIONS = [
  {
    id: "length", name: ".length()", emoji: "📏",
    desc: "Count how many characters are in a String",
    tutorial: {
      code: 'String s = "Hello";',
      demo_str: "Hello",
      steps: [
        "length() counts EVERY character in the string",
        "This includes letters, numbers, spaces and symbols",
        '"Hello" has 5 characters → length() returns 5'
      ],
      extras: [
        { str: "a b c", length: 5, note: "Spaces count! Length = 5" },
        { str: "", length: 0, note: 'Empty string "" → Length = 0' }
      ]
    },
    rounds: [
      { str: "Java", answer: "4" },
      { str: "Hi", answer: "2" },
      { str: "World!", answer: "6" },
      { str: "a b c", answer: "5" },
      { str: "Hello", answer: "5" }
    ]
  },
  {
    id: "charAt", name: ".charAt(i)", emoji: "👆",
    desc: "Get the character at a specific index position",
    tutorial: {
      code: '"Hello".charAt(1)',
      demo_str: "Hello",
      steps: [
        "charAt(i) returns the single character at index i",
        "Strings are zero-indexed: first char is index 0",
        '"Hello".charAt(1) → \'e\' (not \'H\'!)'
      ],
      extras: [
        { str: "Code", idx: 0, answer: "C", note: "charAt(0) → always the FIRST character" },
        { str: "Java!", idx: 4, answer: "!", note: "charAt(4) → symbols have indices too" }
      ]
    },
    rounds: [
      { str: "Hello", idx: 0, answer: "H" },
      { str: "World", idx: 4, answer: "d" },
      { str: "Java!", idx: 2, answer: "v" },
      { str: "a b c", idx: 2, answer: "b" },
      { str: "Code", idx: 3, answer: "e" }
    ]
  },
  {
    id: "caseChange", name: "toUpperCase() / toLowerCase()", emoji: "🔄",
    desc: "Convert all letters to UPPERCASE or lowercase",
    tutorial: {
      code: '"Hello".toUpperCase()',
      demo_str: "Hello",
      steps: [
        "toUpperCase() converts every letter to CAPITALS",
        "toLowerCase() converts every letter to small",
        "Numbers and symbols stay unchanged"
      ],
      extras: [
        { str: "Hello", op: "upper", answer: "HELLO", note: "All letters become capitals" },
        { str: "JAVA", op: "lower", answer: "java", note: "All letters become lowercase" }
      ]
    },
    rounds: [
      { str: "hello", op: "upper", answer: "HELLO" },
      { str: "WORLD", op: "lower", answer: "world" },
      { str: "Java", op: "upper", answer: "JAVA" },
      { str: "HeLLo", op: "lower", answer: "hello" },
      { str: "Code!", op: "upper", answer: "CODE!" }
    ]
  },
  {
    id: "concat", name: "concat / +", emoji: "🧲",
    desc: "Join two strings together end-to-end",
    tutorial: {
      code: '"Hello" + " World"',
      demo_str: "Hello",
      steps: [
        "concat() or + joins two strings into one",
        "The second string attaches at the END of the first",
        '"Hello" + " World" → "Hello World"'
      ],
      extras: [
        { a: "Hi", b: "!", answer: "Hi!", note: "Strings merge exactly as-is" },
        { a: "Java", b: " is fun", answer: "Java is fun", note: "Don't forget the space!" }
      ]
    },
    rounds: [
      { a: "Hello", b: " World", answer: "Hello World" },
      { a: "Good", b: "bye", answer: "Goodbye" },
      { a: "Hi", b: "!", answer: "Hi!" },
      { a: "Java", b: " ", answer: "Java " },
      { a: "a", b: "b", answer: "ab" }
    ]
  },
  {
    id: "substring", name: ".substring(a,b)", emoji: "✂️",
    desc: "Extract a part of the string from index a to b (exclusive)",
    tutorial: {
      code: '"Hello".substring(1, 4)',
      demo_str: "Hello",
      steps: [
        "substring(a, b) extracts characters from index a up to (NOT including) b",
        "Think of it as: start at a, stop BEFORE b",
        '"Hello".substring(1,4) → "ell" (indices 1,2,3)'
      ],
      extras: [
        { str: "Welcome", a: 0, b: 3, answer: "Wel", note: "substring(0,3) = first 3 characters" },
        { str: "Hello", a: 2, b: 5, answer: "llo", note: "substring(2,5) = index 2,3,4" }
      ]
    },
    rounds: [
      { str: "Hello", a: 1, b: 3, answer: "el" },
      { str: "World!", a: 0, b: 5, answer: "World" },
      { str: "Java", a: 1, b: 4, answer: "ava" },
      { str: "Coding", a: 2, b: 4, answer: "di" },
      { str: "String", a: 0, b: 3, answer: "Str" }
    ]
  },
  {
    id: "trim", name: ".trim()", emoji: "🧹",
    desc: "Remove whitespace from both ends of the string",
    tutorial: {
      code: '"  Hello  ".trim()',
      demo_str: "  Hello  ",
      steps: [
        "trim() removes spaces from the START and END only",
        "Spaces in the MIDDLE are NOT removed",
        '"  Hello  ".trim() → "Hello"'
      ],
      extras: [
        { str: "  Hi  ", answer: "Hi", note: "Both ends cleaned" },
        { str: " a b ", answer: "a b", note: "Middle space stays!" }
      ]
    },
    rounds: [
      { str: "  Java  ", answer: "Java" },
      { str: "   Hi", answer: "Hi" },
      { str: "World!   ", answer: "World!" },
      { str: " a b c ", answer: "a b c" },
      { str: "  Hello World  ", answer: "Hello World" }
    ]
  }
];

/* ═══════════════════════════════════════════════════════════════════════════
 *  SCENE CLASS
 * ═══════════════════════════════════════════════════════════════════════════ */

export class Level11Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level11Scene" });
  }

  create() {
    this.opIndex = 0;
    this.roundIndex = 0;
    this.score = 0;
    this.streak = 0;
    this.bestStreak = 0;
    this.totalCorrect = 0;
    this.totalAttempted = 0;
    this.elements = [];

    this._createBackground();
    this._createParticleTextures();
    this._startOperation();
  }

  /* ═══════════════════════════════════════════════════════════════════════
   *  BACKGROUND (persistent)
   * ═══════════════════════════════════════════════════════════════════════ */

  _createBackground() {
    const bg = this.add.graphics().setDepth(0);
    bg.fillGradientStyle(C.bg_top, C.bg_top, C.bg_bottom, C.bg_bottom, 1);
    bg.fillRect(0, 0, W, H);

    this.add.circle(100, 80, 180, C.primary_purple, 0.07).setDepth(1);
    this.add.circle(700, 520, 220, C.success_green, 0.05).setDepth(1);

    for (let i = 0; i < 25; i++) {
      const star = this.add.circle(
        Math.random() * W, Math.random() * H,
        1 + Math.random() * 2, 0xC8C0F5, 0.3
      ).setDepth(2);
      this.tweens.add({
        targets: star, alpha: { from: 0.2, to: 0.6 },
        duration: 2000 + Math.random() * 2000,
        yoyo: true, repeat: -1, delay: Math.random() * 2000
      });
    }
  }

  _createParticleTextures() {
    const g = this.add.graphics();
    g.fillStyle(0xFFFFFF, 1);
    g.fillCircle(4, 4, 4);
    g.generateTexture("pt_circle", 8, 8);
    g.destroy();
  }

  /* ═══════════════════════════════════════════════════════════════════════
   *  CLEAR & UTILITY
   * ═══════════════════════════════════════════════════════════════════════ */

  _clear() {
    this.elements.forEach(el => { if (el && el.destroy) el.destroy(); });
    this.elements = [];
  }

  _addEl(...els) {
    els.forEach(e => this.elements.push(e));
  }

  _drawRoundedBox(x, y, w, h, r, fillColor, borderColor) {
    const g = this.add.graphics().setDepth(100);
    // Shadow
    g.fillStyle(C.purple_dark, 0.15);
    g.fillRoundedRect(x - w/2 + 3, y - h/2 + 4, w, h, r);
    // Fill
    g.fillStyle(fillColor, 1);
    g.fillRoundedRect(x - w/2, y - h/2, w, h, r);
    // Border
    g.lineStyle(2, borderColor, 1);
    g.strokeRoundedRect(x - w/2, y - h/2, w, h, r);
    return g;
  }

  _charBoxes(str, cx, cy, opts = {}) {
    const totalW = str.length * (BOX_W + 4);
    const startX = cx - totalW / 2 + BOX_W / 2;
    const boxes = [];

    str.split("").forEach((char, i) => {
      const bx = startX + i * (BOX_W + 4);
      const display = char === " " ? "␣" : char;

      const shadow = this.add.graphics().setDepth(99);
      shadow.fillStyle(C.purple_dark, 0.15);
      shadow.fillRoundedRect(bx - BOX_W/2 + 2, cy - BOX_H/2 + 3, BOX_W, BOX_H, 8);

      const box = this.add.graphics().setDepth(100);
      const drawBox = (fill, border) => {
        box.clear();
        box.fillStyle(fill, 1);
        box.fillRoundedRect(bx - BOX_W/2, cy - BOX_H/2, BOX_W, BOX_H, 8);
        box.lineStyle(2, border, 1);
        box.strokeRoundedRect(bx - BOX_W/2, cy - BOX_H/2, BOX_W, BOX_H, 8);
      };
      drawBox(opts.fill || C.white, opts.border || C.purple_border);

      const charTxt = this.add.text(bx, cy - 5, display, {
        fontFamily: "Courier New", fontSize: "20px",
        color: char === " " ? COLORS.purple_dark : COLORS.text_primary,
        fontStyle: "bold"
      }).setOrigin(0.5).setDepth(101);

      const idxTxt = this.add.text(bx, cy + 20, i.toString(), {
        fontFamily: "Arial", fontSize: "10px",
        color: COLORS.purple_tinted_gray, fontStyle: "bold"
      }).setOrigin(0.5).setDepth(101);

      if (opts.animate !== false) {
        [shadow, box, charTxt, idxTxt].forEach(t => { t.setAlpha(0); t.setScale(0); });
        this.tweens.add({
          targets: [shadow, box, charTxt, idxTxt],
          alpha: 1, scale: 1, duration: 300,
          delay: (opts.baseDelay || 0) + i * 80, ease: "Back.out"
        });
      }

      boxes.push({ shadow, box, charTxt, idxTxt, x: bx, y: cy, drawBox, char, i });
      this._addEl(shadow, box, charTxt, idxTxt);
    });

    return boxes;
  }

  _btn(x, y, label, isPrimary, onClick) {
    const container = this.add.container(x, y).setDepth(200);
    const w = isPrimary ? 180 : 110;
    const h = 44;

    if (isPrimary) {
      const shadow = this.add.graphics();
      shadow.fillStyle(C.purple_dark, 0.35);
      shadow.fillRoundedRect(-w/2, -h/2 + 4, w, h, 22);
      container.add(shadow);

      const bg = this.add.graphics();
      bg.fillStyle(C.purple_light, 1);
      bg.fillRoundedRect(-w/2, -h/2, w, h, 22);
      bg.fillStyle(C.primary_purple, 0.6);
      bg.fillRoundedRect(-w/2, 0, w, h/2, { tl: 0, tr: 0, bl: 22, br: 22 });
      bg.lineStyle(2, C.purple_dark, 1);
      bg.strokeRoundedRect(-w/2, -h/2, w, h, 22);
      container.add(bg);
    } else {
      const bg = this.add.graphics();
      bg.fillStyle(C.white, 1);
      bg.fillRoundedRect(-w/2, -h/2, w, h, 22);
      bg.lineStyle(1.5, C.purple_border, 1);
      bg.strokeRoundedRect(-w/2, -h/2, w, h, 22);
      container.add(bg);
    }

    const txt = this.add.text(0, 0, label, {
      fontFamily: "Arial", fontSize: "14px",
      color: isPrimary ? COLORS.white : COLORS.text_secondary, fontStyle: "bold"
    }).setOrigin(0.5);
    container.add(txt);

    container.setSize(w, h).setInteractive({ useHandCursor: true });
    container.on("pointerover", () => this.tweens.add({ targets: container, scale: 1.06, duration: 120 }));
    container.on("pointerout", () => this.tweens.add({ targets: container, scale: 1, duration: 120 }));
    container.on("pointerup", () => {
      this.tweens.add({ targets: container, scale: 0.94, duration: 60, yoyo: true });
      this.time.delayedCall(100, onClick);
    });

    this._addEl(container);
    return container;
  }

  _spawnConfetti(x, y, count = 20) {
    const cols = [C.gold, C.primary_purple, C.success_green, C.confetti_pink, C.confetti_purple];
    for (let i = 0; i < count; i++) {
      const c = this.add.rectangle(
        x + (Math.random() - 0.5) * 80, y,
        5, 8, cols[Math.floor(Math.random() * cols.length)]
      ).setDepth(300).setRotation(Math.random() * Math.PI * 2);

      this.tweens.add({
        targets: c,
        y: y + 350 + Math.random() * 200,
        x: c.x + (Math.random() - 0.5) * 180,
        rotation: c.rotation + Math.PI * 4,
        alpha: { from: 1, to: 0 },
        duration: 1800 + Math.random() * 1200,
        ease: "Cubic.in",
        onComplete: () => c.destroy()
      });
    }
  }

  _showFeedback(isCorrect, mainMsg, subMsg, callback) {
    const container = this.add.container(W / 2, 440).setDepth(250);
    const pw = 480, ph = 120;

    const bg = this.add.graphics();
    bg.fillStyle(C.purple_dark, 0.2);
    bg.fillRoundedRect(-pw/2 + 3, -ph/2 + 4, pw, ph, 14);
    bg.fillStyle(isCorrect ? C.success_bg : C.error_bg, 1);
    bg.fillRoundedRect(-pw/2, -ph/2, pw, ph, 14);
    bg.lineStyle(2, isCorrect ? C.success_green : C.error_red, 1);
    bg.strokeRoundedRect(-pw/2, -ph/2, pw, ph, 14);
    container.add(bg);

    const title = this.add.text(0, -30, isCorrect ? "🎉 Correct!" : "💭 Not quite", {
      fontFamily: "Arial", fontSize: "22px",
      color: isCorrect ? COLORS.success_green : COLORS.error_red, fontStyle: "bold"
    }).setOrigin(0.5);
    container.add(title);

    const msg = this.add.text(0, 5, mainMsg, {
      fontFamily: "Arial", fontSize: "13px", color: COLORS.text_primary
    }).setOrigin(0.5);
    container.add(msg);

    if (subMsg) {
      const sub = this.add.text(0, 30, subMsg, {
        fontFamily: "Arial", fontSize: "12px", color: COLORS.text_secondary, fontStyle: "italic",
        wordWrap: { width: pw - 40 }
      }).setOrigin(0.5);
      container.add(sub);
    }

    container.setAlpha(0).setScale(0.8);
    this.tweens.add({
      targets: container, alpha: 1, scale: 1,
      duration: 400, ease: isCorrect ? "Back.out" : "Cubic.out"
    });

    if (isCorrect) {
      this._spawnConfetti(W / 2, 350, 20);
    } else {
      this.cameras.main.shake(200, 0.003);
    }

    this._addEl(container);

    this.time.delayedCall(800, () => {
      this._btn(W / 2, H - 40, "Continue →", true, callback);
    });
  }

  /* ═══════════════════════════════════════════════════════════════════════
   *  HUD (persistent across rounds, rebuilt per operation)
   * ═══════════════════════════════════════════════════════════════════════ */

  _createHUD(op) {
    const pill = this.add.graphics().setDepth(50);
    pill.fillStyle(C.white, 0.9);
    pill.fillRoundedRect(15, 8, W - 30, 42, 21);
    pill.lineStyle(1, C.purple_border, 1);
    pill.strokeRoundedRect(15, 8, W - 30, 42, 21);
    this._addEl(pill);

    const items = [
      { x: 65, icon: op.emoji, label: op.name },
      { x: 290, icon: "📊", label: `Round ${this.roundIndex + 1}/5` },
      { x: 490, icon: "⭐", label: `${this.score} pts` },
      { x: 680, icon: "🔥", label: `×${this.streak}` }
    ];

    this.hudRefs = {};
    items.forEach((it, idx) => {
      const icon = this.add.text(it.x - 30, 29, it.icon, { fontSize: "16px" }).setOrigin(0.5).setDepth(51);
      const txt = this.add.text(it.x, 29, it.label, {
        fontFamily: "Arial", fontSize: "12px", color: COLORS.text_primary, fontStyle: "bold"
      }).setOrigin(0, 0.5).setDepth(51);
      if (idx === 1) this.hudRefs.round = txt;
      if (idx === 2) this.hudRefs.score = txt;
      if (idx === 3) this.hudRefs.streak = txt;
      this._addEl(icon, txt);
    });
  }

  _updateHUD() {
    if (this.hudRefs.round) this.hudRefs.round.setText(`Round ${this.roundIndex + 1}/5`);
    if (this.hudRefs.score) {
      this.hudRefs.score.setText(`${this.score} pts`);
      this.tweens.add({ targets: this.hudRefs.score, scale: { from: 1.3, to: 1 }, duration: 300, ease: "Back.out" });
    }
    if (this.hudRefs.streak) this.hudRefs.streak.setText(`×${this.streak}`);
  }

  _handleCorrect() {
    this.streak++;
    if (this.streak > this.bestStreak) this.bestStreak = this.streak;
    const pts = 100 + (this.streak >= 3 ? 50 : 0);
    this.score += pts;
    this.totalCorrect++;
    this.totalAttempted++;
    this._updateHUD();
    return pts;
  }

  _handleWrong() {
    this.streak = 0;
    this.totalAttempted++;
    this._updateHUD();
  }

  /* ═══════════════════════════════════════════════════════════════════════
   *  OPERATION FLOW: Tutorial → Rounds → Next Operation
   * ═══════════════════════════════════════════════════════════════════════ */

  _startOperation() {
    if (this.opIndex >= OPERATIONS.length) {
      this._showFinalResults();
      return;
    }
    this.roundIndex = 0;
    this._clear();
    this._showTutorial();
  }

  _startRound() {
    const op = OPERATIONS[this.opIndex];
    if (this.roundIndex >= op.rounds.length) {
      // Operation complete — transition screen
      this._showOperationComplete();
      return;
    }
    this._clear();
    this._createHUD(op);

    switch (op.id) {
      case "length": this._playLength(); break;
      case "charAt": this._playCharAt(); break;
      case "caseChange": this._playCaseChange(); break;
      case "concat": this._playConcat(); break;
      case "substring": this._playSubstring(); break;
      case "trim": this._playTrim(); break;
    }
  }

  _nextRound() {
    this.roundIndex++;
    this._startRound();
  }

  _showOperationComplete() {
    this._clear();
    const op = OPERATIONS[this.opIndex];

    const title = this.add.text(W / 2, 180, `${op.emoji}  ${op.name}  Mastered!`, {
      fontFamily: "Arial", fontSize: "28px", color: COLORS.purple_dark, fontStyle: "bold"
    }).setOrigin(0.5).setDepth(100);

    const nextOp = OPERATIONS[this.opIndex + 1];
    const nextLabel = nextOp
      ? `Next: ${nextOp.emoji} ${nextOp.name}`
      : "🏆 See Final Results";

    const sub = this.add.text(W / 2, 240, nextLabel, {
      fontFamily: "Arial", fontSize: "16px", color: COLORS.text_secondary
    }).setOrigin(0.5).setDepth(100);

    this._addEl(title, sub);
    this._spawnConfetti(W / 2, 150, 30);

    this._btn(W / 2, 340, "Continue →", true, () => {
      this.opIndex++;
      this._startOperation();
    });
  }

  /* ═══════════════════════════════════════════════════════════════════════
   *  TUTORIAL (generic for all operations)
   * ═══════════════════════════════════════════════════════════════════════ */

  _showTutorial() {
    const op = OPERATIONS[this.opIndex];
    const tut = op.tutorial;

    // Title
    const title = this.add.text(W / 2, 50, `${op.emoji}  Learn: ${op.name}`, {
      fontFamily: "Arial", fontSize: "24px", color: COLORS.purple_dark, fontStyle: "bold"
    }).setOrigin(0.5).setAlpha(0).setDepth(100);
    this.tweens.add({ targets: title, alpha: 1, y: { from: 30, to: 50 }, duration: 500 });
    this._addEl(title);

    // Code display
    const codeBg = this.add.graphics().setDepth(99);
    codeBg.fillStyle(C.purple_light, 1);
    codeBg.fillRoundedRect(W / 2 - 160, 85, 320, 38, 12);
    codeBg.fillStyle(C.primary_purple, 0.5);
    codeBg.fillRoundedRect(W / 2 - 160, 104, 320, 19, { tl: 0, tr: 0, bl: 12, br: 12 });
    codeBg.lineStyle(2, C.purple_dark, 1);
    codeBg.strokeRoundedRect(W / 2 - 160, 85, 320, 38, 12);

    const codeTxt = this.add.text(W / 2, 104, tut.code, {
      fontFamily: "Courier New", fontSize: "16px", color: COLORS.white, fontStyle: "bold"
    }).setOrigin(0.5).setDepth(100).setAlpha(0);

    this.tweens.add({ targets: [codeBg, codeTxt], alpha: 1, duration: 500, delay: 300 });
    this._addEl(codeBg, codeTxt);

    // Demo string
    const boxes = this._charBoxes(tut.demo_str, W / 2, 190, { baseDelay: 500 });

    // Steps text
    let stepY = 260;
    tut.steps.forEach((step, i) => {
      const st = this.add.text(W / 2, stepY + i * 32, `• ${step}`, {
        fontFamily: "Arial", fontSize: "13px", color: COLORS.text_primary,
        wordWrap: { width: 600 }
      }).setOrigin(0.5).setDepth(100).setAlpha(0);

      this.tweens.add({ targets: st, alpha: 1, x: { from: W / 2 - 20, to: W / 2 }, duration: 400, delay: 800 + i * 300 });
      this._addEl(st);
    });

    // Extra examples
    if (tut.extras && tut.extras.length > 0) {
      const extrasY = stepY + tut.steps.length * 32 + 20;
      tut.extras.forEach((ex, i) => {
        const note = this.add.text(W / 2, extrasY + i * 28, `✦ ${ex.note}`, {
          fontFamily: "Arial", fontSize: "12px", color: COLORS.success_green, fontStyle: "italic"
        }).setOrigin(0.5).setDepth(100).setAlpha(0);
        this.tweens.add({ targets: note, alpha: 1, duration: 400, delay: 1600 + i * 250 });
        this._addEl(note);
      });
    }

    // Skip & Got it buttons
    const skipBtn = this._btn(W - 70, 50, "Skip →", false, () => {
      this._clear();
      this._startRound();
    });

    this.time.delayedCall(2500, () => {
      this._btn(W / 2, H - 50, "Got it — let me play! →", true, () => {
        this._clear();
        this._startRound();
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════════════════
   *  OPERATION 1: length() — RULER MEASURE
   * ═══════════════════════════════════════════════════════════════════════ */

  _playLength() {
    const round = OPERATIONS[0].rounds[this.roundIndex];
    const str = round.str;
    const correctLen = parseInt(round.answer);

    // Task bar
    const taskTxt = this.add.text(W / 2, 75, `📏  "${str}".length() = ?`, {
      fontFamily: "Courier New", fontSize: "18px", color: COLORS.purple_darker, fontStyle: "bold"
    }).setOrigin(0.5).setDepth(100);
    this._addEl(taskTxt);

    // Character boxes
    const boxes = this._charBoxes(str, W / 2, 160, { baseDelay: 100 });

    // Ruler
    const rulerY = 220;
    const totalW = str.length * (BOX_W + 4);
    const startX = W / 2 - totalW / 2;

    const ruler = this.add.graphics().setDepth(98);
    ruler.fillStyle(C.purple_border, 1);
    ruler.fillRoundedRect(startX - 10, rulerY - 6, totalW + 20, 12, 4);
    this._addEl(ruler);

    // Tick labels
    for (let i = 0; i <= str.length; i++) {
      const tx = startX + i * (BOX_W + 4) - 2;
      const tick = this.add.graphics().setDepth(99);
      tick.fillStyle(C.primary_purple, 1);
      tick.fillRect(tx, rulerY - 8, 2, 16);

      const lbl = this.add.text(tx + 1, rulerY + 15, i.toString(), {
        fontFamily: "Arial", fontSize: "11px", color: COLORS.purple_dark, fontStyle: "bold"
      }).setOrigin(0.5).setDepth(100);
      this._addEl(tick, lbl);
    }

    // Answer input: clickable number selector
    const selectorY = 300;

    const prompt = this.add.text(W / 2, selectorY - 30, "What is the length? Click the correct number:", {
      fontFamily: "Arial", fontSize: "14px", color: COLORS.text_secondary
    }).setOrigin(0.5).setDepth(100);
    this._addEl(prompt);

    // Generate options (correct + 3 wrong)
    const options = this._generateOptions(correctLen, 0, str.length + 2);

    options.forEach((opt, i) => {
      const ox = W / 2 - ((options.length - 1) * 60) / 2 + i * 60;
      const optBg = this.add.graphics().setDepth(100);
      optBg.fillStyle(C.white, 1);
      optBg.fillRoundedRect(ox - 24, selectorY - 20, 48, 44, 10);
      optBg.lineStyle(2, C.purple_border, 1);
      optBg.strokeRoundedRect(ox - 24, selectorY - 20, 48, 44, 10);

      const optTxt = this.add.text(ox, selectorY, opt.toString(), {
        fontFamily: "Courier New", fontSize: "20px", color: COLORS.text_primary, fontStyle: "bold"
      }).setOrigin(0.5).setDepth(101);

      const hitArea = this.add.rectangle(ox, selectorY, 48, 44).setAlpha(0.001)
        .setInteractive({ useHandCursor: true }).setDepth(102);

      hitArea.on("pointerover", () => {
        optBg.clear();
        optBg.fillStyle(C.purple_bg, 1);
        optBg.fillRoundedRect(ox - 24, selectorY - 20, 48, 44, 10);
        optBg.lineStyle(2, C.primary_purple, 1);
        optBg.strokeRoundedRect(ox - 24, selectorY - 20, 48, 44, 10);
      });

      hitArea.on("pointerout", () => {
        optBg.clear();
        optBg.fillStyle(C.white, 1);
        optBg.fillRoundedRect(ox - 24, selectorY - 20, 48, 44, 10);
        optBg.lineStyle(2, C.purple_border, 1);
        optBg.strokeRoundedRect(ox - 24, selectorY - 20, 48, 44, 10);
      });

      hitArea.on("pointerup", () => {
        // Disable all options
        this.elements.filter(e => e.input && e.input.enabled).forEach(e => e.disableInteractive());

        if (opt === correctLen) {
          // Correct
          optBg.clear();
          optBg.fillStyle(C.success_bg, 1);
          optBg.fillRoundedRect(ox - 24, selectorY - 20, 48, 44, 10);
          optBg.lineStyle(2, C.success_green, 1);
          optBg.strokeRoundedRect(ox - 24, selectorY - 20, 48, 44, 10);
          optTxt.setColor(COLORS.success_green);

          // Highlight all boxes
          boxes.forEach(b => b.drawBox(C.success_bg, C.success_green));

          const pts = this._handleCorrect();
          let sub = str.includes(" ") ? "Spaces count as characters too!" : null;
          this._showFeedback(true, `"${str}" has ${correctLen} characters. +${pts} pts`, sub, () => this._nextRound());
        } else {
          // Wrong
          optBg.clear();
          optBg.fillStyle(C.error_bg, 1);
          optBg.fillRoundedRect(ox - 24, selectorY - 20, 48, 44, 10);
          optBg.lineStyle(2, C.error_red, 1);
          optBg.strokeRoundedRect(ox - 24, selectorY - 20, 48, 44, 10);
          optTxt.setColor(COLORS.error_red);

          this._handleWrong();
          let hint = "";
          if (opt === correctLen - 1) hint = "Remember: length counts the total, not the last index";
          else if (opt === correctLen + 1) hint = "One too many — count again";
          else if (str.includes(" ")) hint = "Spaces count as characters too!";
          this._showFeedback(false, `Actual length: ${correctLen} (you picked ${opt})`, hint, () => this._nextRound());
        }
      });

      this._addEl(optBg, optTxt, hitArea);
    });
  }

  /* ═══════════════════════════════════════════════════════════════════════
   *  OPERATION 2: charAt(i) — INDEX JUMPER
   * ═══════════════════════════════════════════════════════════════════════ */

  _playCharAt() {
    const round = OPERATIONS[1].rounds[this.roundIndex];
    const str = round.str;
    const idx = round.idx;
    const correctChar = round.answer;

    const taskTxt = this.add.text(W / 2, 75, `👆  "${str}".charAt(${idx}) = ?`, {
      fontFamily: "Courier New", fontSize: "18px", color: COLORS.purple_darker, fontStyle: "bold"
    }).setOrigin(0.5).setDepth(100);
    this._addEl(taskTxt);

    const instruction = this.add.text(W / 2, 110, "Click the character at the highlighted index", {
      fontFamily: "Arial", fontSize: "13px", color: COLORS.text_secondary
    }).setOrigin(0.5).setDepth(100);
    this._addEl(instruction);

    const boxes = this._charBoxes(str, W / 2, 200, { baseDelay: 100 });

    // Highlight target index
    this.time.delayedCall(300 + str.length * 80, () => {
      boxes[idx].drawBox(C.purple_bg, C.primary_purple);

      // Pulse animation on target index
      this.tweens.add({
        targets: boxes[idx].idxTxt,
        scale: { from: 1, to: 1.5 }, yoyo: true,
        duration: 500, repeat: -1, ease: "Sine.inOut"
      });

      // Arrow pointing to target
      const arrow = this.add.text(boxes[idx].x, 145, "⬇", {
        fontSize: "22px", color: COLORS.primary_purple
      }).setOrigin(0.5).setDepth(102);

      this.tweens.add({
        targets: arrow, y: { from: 140, to: 150 },
        duration: 600, yoyo: true, repeat: -1, ease: "Sine.inOut"
      });

      this._addEl(arrow);
    });

    // Make each box clickable
    boxes.forEach((b, i) => {
      const hitArea = this.add.rectangle(b.x, b.y, BOX_W, BOX_H)
        .setAlpha(0.001).setInteractive({ useHandCursor: true }).setDepth(102);

      hitArea.on("pointerover", () => {
        if (i !== idx) b.drawBox(C.purple_pale, C.purple_border);
      });
      hitArea.on("pointerout", () => {
        if (i !== idx) b.drawBox(C.white, C.purple_border);
      });

      hitArea.on("pointerup", () => {
        this.elements.filter(e => e.input && e.input.enabled).forEach(e => e.disableInteractive());

        const clickedChar = str[i];
        if (clickedChar === correctChar) {
          b.drawBox(C.success_bg, C.success_green);
          this.tweens.add({ targets: b.charTxt, scale: { from: 1, to: 1.4 }, yoyo: true, duration: 300, ease: "Back.out" });
          const pts = this._handleCorrect();
          this._showFeedback(true,
            `charAt(${idx}) → '${correctChar}' ✓  +${pts} pts`,
            `Index ${idx} = the ${this._ordinal(idx + 1)} character`, () => this._nextRound());
        } else {
          b.drawBox(C.error_bg, C.error_red);
          boxes[idx].drawBox(C.success_bg, C.success_green);
          this._handleWrong();
          this._showFeedback(false,
            `You clicked '${clickedChar}' (index ${i}). Correct: '${correctChar}' at index ${idx}`,
            "Remember: counting starts from 0, not 1!", () => this._nextRound());
        }
      });

      this._addEl(hitArea);
    });
  }

  /* ═══════════════════════════════════════════════════════════════════════
   *  OPERATION 3: toUpperCase / toLowerCase — CASE FLIPPER
   * ═══════════════════════════════════════════════════════════════════════ */

  _playCaseChange() {
    const round = OPERATIONS[2].rounds[this.roundIndex];
    const str = round.str;
    const isUpper = round.op === "upper";
    const correctAnswer = round.answer;
    const methodName = isUpper ? "toUpperCase()" : "toLowerCase()";

    const taskTxt = this.add.text(W / 2, 75, `🔄  "${str}".${methodName} = ?`, {
      fontFamily: "Courier New", fontSize: "16px", color: COLORS.purple_darker, fontStyle: "bold"
    }).setOrigin(0.5).setDepth(100);
    this._addEl(taskTxt);

    const instruction = this.add.text(W / 2, 108, `Click each letter to flip it ${isUpper ? "UPPERCASE" : "lowercase"}. Then submit!`, {
      fontFamily: "Arial", fontSize: "13px", color: COLORS.text_secondary
    }).setOrigin(0.5).setDepth(100);
    this._addEl(instruction);

    // Create mutable character boxes
    const boxes = this._charBoxes(str, W / 2, 200, { baseDelay: 100 });
    const userChars = str.split("");

    boxes.forEach((b, i) => {
      if (!/[a-zA-Z]/.test(str[i])) return; // Only letters are flippable

      const hitArea = this.add.rectangle(b.x, b.y, BOX_W, BOX_H)
        .setAlpha(0.001).setInteractive({ useHandCursor: true }).setDepth(102);

      hitArea.on("pointerup", () => {
        // Toggle case
        const current = userChars[i];
        if (current === current.toUpperCase()) {
          userChars[i] = current.toLowerCase();
        } else {
          userChars[i] = current.toUpperCase();
        }

        b.charTxt.setText(userChars[i]);

        // Flash feedback
        const isFlippedCorrect = userChars[i] === correctAnswer[i];
        b.drawBox(isFlippedCorrect ? C.success_bg : C.purple_bg,
                   isFlippedCorrect ? C.success_green : C.primary_purple);

        this.tweens.add({
          targets: b.charTxt, scale: { from: 1.3, to: 1 },
          duration: 200, ease: "Back.out"
        });
      });

      this._addEl(hitArea);
    });

    // Submit button
    this._btn(W / 2, 310, "Submit →", true, () => {
      this.elements.filter(e => e.input && e.input.enabled).forEach(e => e.disableInteractive());
      const userAnswer = userChars.join("");

      if (userAnswer === correctAnswer) {
        boxes.forEach(b => b.drawBox(C.success_bg, C.success_green));
        const pts = this._handleCorrect();
        this._showFeedback(true, `"${str}" → "${correctAnswer}" ✓  +${pts} pts`, null, () => this._nextRound());
      } else {
        // Show which chars were wrong
        boxes.forEach((b, i) => {
          if (userChars[i] !== correctAnswer[i]) {
            b.drawBox(C.error_bg, C.error_red);
          }
        });
        this._handleWrong();
        this._showFeedback(false,
          `Your answer: "${userAnswer}" → Correct: "${correctAnswer}"`,
          "Every letter must be flipped. Symbols and numbers stay the same!",
          () => this._nextRound());
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════════════════
   *  OPERATION 4: concat (+) — MAGNET MERGE
   * ═══════════════════════════════════════════════════════════════════════ */

  _playConcat() {
    const round = OPERATIONS[3].rounds[this.roundIndex];
    const a = round.a, b = round.b, correct = round.answer;

    const taskTxt = this.add.text(W / 2, 75, `🧲  "${a}" + "${b}" = ?`, {
      fontFamily: "Courier New", fontSize: "18px", color: COLORS.purple_darker, fontStyle: "bold"
    }).setOrigin(0.5).setDepth(100);
    this._addEl(taskTxt);

    const instruction = this.add.text(W / 2, 108, "Drag the right string to connect it to the left string", {
      fontFamily: "Arial", fontSize: "13px", color: COLORS.text_secondary
    }).setOrigin(0.5).setDepth(100);
    this._addEl(instruction);

    // Left string (fixed)
    const leftBoxes = this._charBoxes(a, W / 2 - 120, 200, { baseDelay: 100, fill: C.purple_bg, border: C.primary_purple });

    // Right string (draggable group)
    const rightStartX = W / 2 + 120;
    const rightBoxes = this._charBoxes(b, rightStartX, 200, { baseDelay: 200, fill: 0xFFF4CC, border: C.orange });

    // Make right group draggable via a container
    const rightContainer = this.add.container(0, 0).setDepth(110);
    rightContainer.setSize(b.length * (BOX_W + 4), BOX_H + 20);
    rightContainer.setPosition(rightStartX, 200);
    rightContainer.setInteractive({ draggable: true, useHandCursor: true });

    let merged = false;

    rightContainer.on("drag", (pointer, dragX) => {
      if (merged) return;
      const dx = dragX - rightStartX;
      rightBoxes.forEach(rb => {
        rb.shadow.setX(rb.shadow.x !== undefined ? rb.x + dx - BOX_W/2 + 2 : rb.shadow.x);
        rb.box.setPosition(rb.x + dx, rb.y);
        rb.charTxt.setX(rb.x + dx);
        rb.idxTxt.setX(rb.x + dx);
      });
    });

    rightContainer.on("dragend", () => {
      if (merged) return;

      // Check if close enough to merge
      const lastLeft = leftBoxes[leftBoxes.length - 1];
      const firstRight = rightBoxes[0];
      const distance = Math.abs(firstRight.charTxt.x - (lastLeft.x + BOX_W + 4));

      if (distance < 40) {
        merged = true;
        rightContainer.disableInteractive();

        // Snap into place
        rightBoxes.forEach((rb, i) => {
          const targetX = lastLeft.x + (i + 1) * (BOX_W + 4);
          this.tweens.add({
            targets: [rb.charTxt, rb.idxTxt],
            x: targetX, duration: 200, ease: "Back.out"
          });
          rb.drawBox(C.success_bg, C.success_green);
        });
        leftBoxes.forEach(lb => lb.drawBox(C.success_bg, C.success_green));

        // Burst effect at connection point
        this._spawnConfetti(lastLeft.x + BOX_W / 2, 200, 15);

        const pts = this._handleCorrect();
        this._showFeedback(true,
          `"${a}" + "${b}" = "${correct}" ✓  +${pts} pts`,
          "Strings join exactly as they are — including spaces!", () => this._nextRound());
      } else {
        // Spring back
        rightBoxes.forEach(rb => {
          this.tweens.add({
            targets: [rb.charTxt, rb.idxTxt],
            x: rb.x, duration: 300, ease: "Back.out"
          });
        });
      }
    });

    this._addEl(rightContainer);

    // Also provide type-in fallback
    const orText = this.add.text(W / 2, 280, "— or type the result —", {
      fontFamily: "Arial", fontSize: "12px", color: COLORS.text_secondary
    }).setOrigin(0.5).setDepth(100);
    this._addEl(orText);

    // Generate options
    const options = [correct];
    // Add wrong options
    if (b.startsWith(" ")) options.push(a + b.trim());
    else options.push(a + " " + b);
    options.push(b + a);
    if (options.length < 4) options.push(a);

    const unique = [...new Set(options)].slice(0, 4).sort(() => Math.random() - 0.5);

    unique.forEach((opt, i) => {
      const ox = W / 2 - ((unique.length - 1) * 140) / 2 + i * 140;

      const optBtn = this.add.container(ox, 330).setDepth(100);
      const bg = this.add.graphics();
      bg.fillStyle(C.white, 1);
      bg.fillRoundedRect(-60, -18, 120, 36, 8);
      bg.lineStyle(1.5, C.purple_border, 1);
      bg.strokeRoundedRect(-60, -18, 120, 36, 8);
      optBtn.add(bg);

      const display = opt.replace(/ /g, "·");
      const txt = this.add.text(0, 0, `"${display}"`, {
        fontFamily: "Courier New", fontSize: "12px", color: COLORS.text_primary
      }).setOrigin(0.5);
      optBtn.add(txt);

      optBtn.setSize(120, 36).setInteractive({ useHandCursor: true });

      optBtn.on("pointerover", () => {
        bg.clear();
        bg.fillStyle(C.purple_bg, 1);
        bg.fillRoundedRect(-60, -18, 120, 36, 8);
        bg.lineStyle(1.5, C.primary_purple, 1);
        bg.strokeRoundedRect(-60, -18, 120, 36, 8);
      });
      optBtn.on("pointerout", () => {
        bg.clear();
        bg.fillStyle(C.white, 1);
        bg.fillRoundedRect(-60, -18, 120, 36, 8);
        bg.lineStyle(1.5, C.purple_border, 1);
        bg.strokeRoundedRect(-60, -18, 120, 36, 8);
      });

      optBtn.on("pointerup", () => {
        if (merged) return;
        merged = true;
        this.elements.filter(e => e.input && e.input.enabled).forEach(e => e.disableInteractive());

        if (opt === correct) {
          leftBoxes.forEach(lb => lb.drawBox(C.success_bg, C.success_green));
          rightBoxes.forEach(rb => rb.drawBox(C.success_bg, C.success_green));
          const pts = this._handleCorrect();
          this._showFeedback(true, `"${a}" + "${b}" = "${correct}" ✓  +${pts} pts`, null, () => this._nextRound());
        } else {
          this._handleWrong();
          this._showFeedback(false,
            `You picked "${opt}" → Correct: "${correct}"`,
            'Strings concatenate exactly — every space and character matters!',
            () => this._nextRound());
        }
      });

      this._addEl(optBtn);
    });
  }

  /* ═══════════════════════════════════════════════════════════════════════
   *  OPERATION 5: substring(a,b) — SLICE CUTTER
   * ═══════════════════════════════════════════════════════════════════════ */

  _playSubstring() {
    const round = OPERATIONS[4].rounds[this.roundIndex];
    const str = round.str;
    const a = round.a, b = round.b;
    const correct = round.answer;

    const taskTxt = this.add.text(W / 2, 75, `✂️  "${str}".substring(${a}, ${b}) = ?`, {
      fontFamily: "Courier New", fontSize: "16px", color: COLORS.purple_darker, fontStyle: "bold"
    }).setOrigin(0.5).setDepth(100);
    this._addEl(taskTxt);

    const instruction = this.add.text(W / 2, 108, `Click the characters from index ${a} to ${b - 1} (highlighted range)`, {
      fontFamily: "Arial", fontSize: "13px", color: COLORS.text_secondary
    }).setOrigin(0.5).setDepth(100);
    this._addEl(instruction);

    const boxes = this._charBoxes(str, W / 2, 200, { baseDelay: 100 });

    // Highlight the range
    this.time.delayedCall(300 + str.length * 80, () => {
      boxes.forEach((bx, i) => {
        if (i >= a && i < b) {
          bx.drawBox(C.purple_bg, C.primary_purple);
          this.tweens.add({
            targets: bx.charTxt, scale: { from: 1, to: 1.1 },
            yoyo: true, duration: 500, repeat: 2, ease: "Sine.inOut"
          });
        } else {
          bx.drawBox(C.white, C.purple_border);
          bx.charTxt.setAlpha(0.4);
          bx.idxTxt.setAlpha(0.4);
        }
      });

      // Range markers
      const leftBlade = this.add.text(boxes[a].x - BOX_W / 2 - 2, 160, "✂", {
        fontSize: "20px"
      }).setOrigin(0.5).setDepth(102);
      const rightBlade = this.add.text(boxes[b - 1].x + BOX_W / 2 + 2, 160, "✂", {
        fontSize: "20px"
      }).setOrigin(0.5).setDepth(102).setFlipX(true);

      this._addEl(leftBlade, rightBlade);
    });

    // Answer options
    const selectorY = 300;
    const prompt = this.add.text(W / 2, selectorY - 30, "What string does substring extract?", {
      fontFamily: "Arial", fontSize: "14px", color: COLORS.text_secondary
    }).setOrigin(0.5).setDepth(100);
    this._addEl(prompt);

    // Generate options
    const wrongOptions = [];
    if (a > 0) wrongOptions.push(str.substring(a - 1, b));
    if (b < str.length) wrongOptions.push(str.substring(a, b + 1));
    wrongOptions.push(str.substring(a + 1, b));
    if (wrongOptions.length < 3) wrongOptions.push(str.substring(0, b));

    const allOpts = [correct, ...wrongOptions.filter(w => w !== correct)].slice(0, 4);
    const shuffled = allOpts.sort(() => Math.random() - 0.5);

    shuffled.forEach((opt, i) => {
      const ox = W / 2 - ((shuffled.length - 1) * 120) / 2 + i * 120;

      const optContainer = this.add.container(ox, selectorY).setDepth(100);
      const bg = this.add.graphics();
      bg.fillStyle(C.white, 1);
      bg.fillRoundedRect(-50, -20, 100, 40, 10);
      bg.lineStyle(2, C.purple_border, 1);
      bg.strokeRoundedRect(-50, -20, 100, 40, 10);
      optContainer.add(bg);

      const txt = this.add.text(0, 0, `"${opt}"`, {
        fontFamily: "Courier New", fontSize: "14px", color: COLORS.text_primary, fontStyle: "bold"
      }).setOrigin(0.5);
      optContainer.add(txt);

      optContainer.setSize(100, 40).setInteractive({ useHandCursor: true });
      optContainer.on("pointerover", () => {
        bg.clear();
        bg.fillStyle(C.purple_bg, 1);
        bg.fillRoundedRect(-50, -20, 100, 40, 10);
        bg.lineStyle(2, C.primary_purple, 1);
        bg.strokeRoundedRect(-50, -20, 100, 40, 10);
      });
      optContainer.on("pointerout", () => {
        bg.clear();
        bg.fillStyle(C.white, 1);
        bg.fillRoundedRect(-50, -20, 100, 40, 10);
        bg.lineStyle(2, C.purple_border, 1);
        bg.strokeRoundedRect(-50, -20, 100, 40, 10);
      });

      optContainer.on("pointerup", () => {
        this.elements.filter(e => e.input && e.input.enabled).forEach(e => e.disableInteractive());

        if (opt === correct) {
          boxes.forEach((bx, j) => {
            if (j >= a && j < b) bx.drawBox(C.success_bg, C.success_green);
          });
          const pts = this._handleCorrect();
          this._showFeedback(true,
            `substring(${a},${b}) → "${correct}" ✓  +${pts} pts`,
            `Characters at indices ${a} through ${b - 1} were extracted`,
            () => this._nextRound());
        } else {
          this._handleWrong();
          this._showFeedback(false,
            `You picked "${opt}" → Correct: "${correct}"`,
            `substring(${a},${b}) starts at index ${a}, stops BEFORE index ${b}`,
            () => this._nextRound());
        }
      });

      this._addEl(optContainer);
    });
  }

  /* ═══════════════════════════════════════════════════════════════════════
   *  OPERATION 6: trim() — SPACE SWEEPER
   * ═══════════════════════════════════════════════════════════════════════ */

  _playTrim() {
    const round = OPERATIONS[5].rounds[this.roundIndex];
    const str = round.str;
    const correct = round.answer;

    const taskTxt = this.add.text(W / 2, 75, `🧹  "${str.replace(/ /g, "·")}".trim() = ?`, {
      fontFamily: "Courier New", fontSize: "16px", color: COLORS.purple_darker, fontStyle: "bold"
    }).setOrigin(0.5).setDepth(100);
    this._addEl(taskTxt);

    const instruction = this.add.text(W / 2, 108, "Click the space characters that trim() would REMOVE (start & end only)", {
      fontFamily: "Arial", fontSize: "13px", color: COLORS.text_secondary
    }).setOrigin(0.5).setDepth(100);
    this._addEl(instruction);

    const boxes = this._charBoxes(str, W / 2, 200, { baseDelay: 100 });

    // Track which spaces user has "swept"
    const swept = new Array(str.length).fill(false);

    // Determine which indices SHOULD be swept (leading + trailing spaces)
    const shouldSweep = new Array(str.length).fill(false);
    let start = 0, end = str.length - 1;
    while (start < str.length && str[start] === " ") { shouldSweep[start] = true; start++; }
    while (end >= 0 && str[end] === " ") { shouldSweep[end] = true; end--; }

    boxes.forEach((b, i) => {
      if (str[i] !== " ") return; // Only spaces are clickable

      const hitArea = this.add.rectangle(b.x, b.y, BOX_W, BOX_H)
        .setAlpha(0.001).setInteractive({ useHandCursor: true }).setDepth(102);

      hitArea.on("pointerup", () => {
        swept[i] = !swept[i];
        if (swept[i]) {
          // "Swept" — dim and cross out
          b.drawBox(C.error_bg, C.error_red);
          b.charTxt.setAlpha(0.3);

          // Sweep particles
          this.add.particles(b.x, b.y, "pt_circle", {
            speed: { min: 40, max: 100 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.4, end: 0 },
            alpha: { start: 0.8, end: 0 },
            lifespan: 500,
            tint: C.purple_tinted_gray,
            quantity: 6
          }).setDepth(110).explode(6);

          this.tweens.add({
            targets: b.charTxt, scale: { from: 1.2, to: 1 },
            duration: 200, ease: "Back.out"
          });
        } else {
          // Un-swept
          b.drawBox(C.white, C.purple_border);
          b.charTxt.setAlpha(1);
        }
      });

      this._addEl(hitArea);
    });

    // Submit button
    this._btn(W / 2, 310, "Submit →", true, () => {
      this.elements.filter(e => e.input && e.input.enabled).forEach(e => e.disableInteractive());

      // Check if user swept the correct spaces
      const isCorrect = swept.every((s, i) => s === shouldSweep[i]);

      if (isCorrect) {
        // Animate removal
        boxes.forEach((b, i) => {
          if (shouldSweep[i]) {
            this.tweens.add({
              targets: [b.box, b.charTxt, b.idxTxt, b.shadow],
              alpha: 0, scale: 0.5, duration: 400, delay: i * 50, ease: "Back.in"
            });
          } else {
            b.drawBox(C.success_bg, C.success_green);
          }
        });

        const pts = this._handleCorrect();
        this._showFeedback(true,
          `trim() → "${correct}" ✓  +${pts} pts`,
          "Only leading and trailing spaces are removed. Middle spaces stay!",
          () => this._nextRound());
      } else {
        // Show correct answer
        boxes.forEach((b, i) => {
          if (shouldSweep[i]) {
            b.drawBox(0xFFE0E0, C.error_red);
            b.charTxt.setText("✕");
          } else if (str[i] === " " && swept[i]) {
            // User incorrectly swept a middle space
            b.drawBox(0xFFF4CC, C.orange);
          }
        });

        this._handleWrong();
        let hint = "trim() only removes spaces from the START and END — middle spaces stay";
        this._showFeedback(false,
          `Correct result: "${correct}"`,
          hint,
          () => this._nextRound());
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════════════════
   *  FINAL RESULTS
   * ═══════════════════════════════════════════════════════════════════════ */

  _showFinalResults() {
    this._clear();

    // Dark overlay with stars
    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x1a1a3e, 0.65).setDepth(200);
    this._addEl(overlay);

    for (let i = 0; i < 40; i++) {
      const star = this.add.circle(
        Math.random() * W, Math.random() * H,
        Math.random() * 2 + 1, 0xFFFFFF, 0.5
      ).setDepth(201);
      this.tweens.add({
        targets: star, alpha: { from: 0.2, to: 0.8 },
        duration: 1500 + Math.random() * 1500, yoyo: true, repeat: -1
      });
      this._addEl(star);
    }

    // Panel
    const panel = this.add.container(W / 2, H / 2).setDepth(202);

    const bg = this.add.graphics();
    bg.fillStyle(C.bg_bottom, 1);
    bg.fillRoundedRect(-280, -220, 560, 440, 20);
    bg.fillStyle(C.bg_top, 0.7);
    bg.fillRoundedRect(-280, 0, 560, 220, { tl: 0, tr: 0, bl: 20, br: 20 });
    bg.lineStyle(2, C.primary_purple, 1);
    bg.strokeRoundedRect(-280, -220, 560, 440, 20);
    panel.add(bg);

    const title = this.add.text(0, -180, "🏆  Level 11 Complete!  🏆", {
      fontFamily: "Arial", fontSize: "28px", color: COLORS.purple_dark, fontStyle: "bold"
    }).setOrigin(0.5);
    panel.add(title);

    const badgeTxt = this.add.text(0, -140, "Badge Unlocked: Assembly Master 🏭", {
      fontFamily: "Arial", fontSize: "14px", color: COLORS.success_green, fontStyle: "bold"
    }).setOrigin(0.5);
    panel.add(badgeTxt);

    const accuracy = this.totalAttempted > 0
      ? Math.round((this.totalCorrect / this.totalAttempted) * 100) : 0;

    const stats = [
      { icon: "⭐", label: "Total Score", value: `${this.score}` },
      { icon: "🎯", label: "Accuracy", value: `${accuracy}%` },
      { icon: "🔥", label: "Best Streak", value: `${this.bestStreak}×` },
      { icon: "📊", label: "Operations Mastered", value: "6/6" }
    ];

    stats.forEach((stat, i) => {
      const row = this.add.container(0, -80 + i * 50);
      const icon = this.add.text(-180, 0, stat.icon, { fontSize: "22px" }).setOrigin(0.5);
      const label = this.add.text(-140, 0, stat.label, {
        fontFamily: "Arial", fontSize: "14px", color: COLORS.text_secondary
      }).setOrigin(0, 0.5);
      const value = this.add.text(180, 0, stat.value, {
        fontFamily: "Arial", fontSize: "22px", color: COLORS.purple_dark, fontStyle: "bold"
      }).setOrigin(1, 0.5);

      row.add([icon, label, value]);
      row.setAlpha(0).setX(-40);
      this.tweens.add({
        targets: row, alpha: 1, x: 0,
        duration: 400, delay: 600 + i * 150, ease: "Cubic.out"
      });
      panel.add(row);
    });

    // Play again
    const playBtn = this.add.container(0, 170);
    const pBg = this.add.graphics();
    pBg.fillStyle(C.purple_light, 1);
    pBg.fillRoundedRect(-100, -24, 200, 48, 24);
    pBg.fillStyle(C.primary_purple, 0.6);
    pBg.fillRoundedRect(-100, 0, 200, 24, { tl: 0, tr: 0, bl: 24, br: 24 });
    pBg.lineStyle(2, C.purple_dark, 1);
    pBg.strokeRoundedRect(-100, -24, 200, 48, 24);
    playBtn.add(pBg);

    const pTxt = this.add.text(0, 0, "↻  Play Again", {
      fontFamily: "Arial", fontSize: "15px", color: COLORS.white, fontStyle: "bold"
    }).setOrigin(0.5);
    playBtn.add(pTxt);

    playBtn.setSize(200, 48).setInteractive({ useHandCursor: true });
    playBtn.on("pointerover", () => this.tweens.add({ targets: playBtn, scale: 1.06, duration: 120 }));
    playBtn.on("pointerout", () => this.tweens.add({ targets: playBtn, scale: 1, duration: 120 }));
    playBtn.on("pointerup", () => this.scene.restart());

    playBtn.setAlpha(0);
    this.tweens.add({ targets: playBtn, alpha: 1, duration: 400, delay: 1400 });
    panel.add(playBtn);

    panel.setAlpha(0).setScale(0.7);
    this.tweens.add({
      targets: panel, alpha: 1, scale: 1, duration: 600, ease: "Back.out"
    });
    this._addEl(panel);

    // Continuous confetti
    this.time.addEvent({
      delay: 400,
      callback: () => this._spawnConfetti(Math.random() * W, -10, 4),
      repeat: 20
    });
  }

  /* ═══════════════════════════════════════════════════════════════════════
   *  UTILITIES
   * ═══════════════════════════════════════════════════════════════════════ */

  _generateOptions(correct, min, max) {
    const opts = new Set([correct]);
    while (opts.size < 4) {
      let wrong = Math.floor(Math.random() * (max - min)) + min;
      if (wrong !== correct) opts.add(wrong);
    }
    return [...opts].sort(() => Math.random() - 0.5);
  }

  _ordinal(n) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }
}