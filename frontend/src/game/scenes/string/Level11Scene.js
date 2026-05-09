/**
 * Level11Scene — String Operations (Tuning Phase)
 * ═══════════════════════════════════════════════════════════════════════════
 * v4 — Gamified mechanics upgrade: unique interactive mini-games per operation
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
    this.lives = 3;
    this.combo = 0;
    this._timerTween = null;

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
    this.combo = 0;
    this.totalAttempted++;
    this.lives = Math.max(0, this.lives - 1);
    this._updateHUD();
  }

  _spawnScorePopup(x, y, pts, color = COLORS.success_green) {
    const t = this.add.text(x, y, pts, {
      fontFamily: "Arial", fontSize: "22px", color, fontStyle: "bold"
    }).setOrigin(0.5).setDepth(300);
    this.tweens.add({ targets: t, y: y - 65, alpha: 0, duration: 1100, ease: "Cubic.out", onComplete: () => t.destroy() });
  }

  _startTimer(sec, onExpire) {
    this._stopTimer();
    const bg = this.add.rectangle(W / 2, 4, W - 20, 7, C.purple_border).setDepth(500).setOrigin(0.5, 0);
    const bar = this.add.rectangle(10, 4, W - 20, 7, C.success_green).setDepth(501).setOrigin(0, 0);
    this._addEl(bg, bar);
    this._timerTween = this.tweens.add({
      targets: bar, scaleX: { from: 1, to: 0 }, duration: sec * 1000, ease: "Linear",
      onUpdate: () => bar.setFillStyle(bar.scaleX > 0.5 ? C.success_green : bar.scaleX > 0.25 ? C.orange : C.error_red),
      onComplete: onExpire
    });
  }

  _stopTimer() {
    if (this._timerTween) { this._timerTween.stop(); this._timerTween = null; }
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
    /* ── RULER DRAG: Drag the notch to the correct length position, then lock ── */
    const round = OPERATIONS[0].rounds[this.roundIndex];
    const str = round.str, correctLen = parseInt(round.answer);
    const step = BOX_W + 4, x0 = W / 2 - str.length * step / 2, ry = 220;

    this._addEl(this.add.text(W / 2, 82, `📏  Drag the notch to mark the length of "${str}"`, {
      fontFamily: "Arial", fontSize: "15px", color: COLORS.purple_darker, fontStyle: "bold"
    }).setOrigin(0.5).setDepth(100));

    const boxes = this._charBoxes(str, W / 2, 155, { baseDelay: 80 });

    const rb = this.add.graphics().setDepth(95);
    rb.fillStyle(C.purple_border, 1);
    rb.fillRoundedRect(x0 - 14, ry - 5, str.length * step + 28, 10, 4);
    this._addEl(rb);

    for (let i = 0; i <= str.length; i++) {
      const tx = x0 + i * step;
      const tg = this.add.graphics().setDepth(96);
      tg.fillStyle(C.primary_purple, 1); tg.fillRect(tx - 1, ry - 11, 2, 22);
      this._addEl(tg, this.add.text(tx, ry + 18, `${i}`, {
        fontFamily: "Arial", fontSize: "10px", color: COLORS.purple_dark, fontStyle: "bold"
      }).setOrigin(0.5).setDepth(97));
    }

    let pos = 0;
    const nc = this.add.container(x0, ry - 40).setDepth(160);
    const stem = this.add.graphics();
    stem.fillStyle(C.primary_purple, 1); stem.fillRect(-1.5, 0, 3, 50);
    const flag = this.add.graphics();
    flag.fillStyle(C.primary_purple, 1); flag.fillRoundedRect(-22, -34, 44, 32, 8);
    flag.lineStyle(2, C.purple_dark, 1); flag.strokeRoundedRect(-22, -34, 44, 32, 8);
    const nt = this.add.text(0, -18, "0", {
      fontFamily: "Arial", fontSize: "16px", color: COLORS.white, fontStyle: "bold"
    }).setOrigin(0.5);
    nc.add([stem, flag, nt]);
    nc.setSize(44, 90).setInteractive({ draggable: true, useHandCursor: true });
    this.input.setDraggable(nc);
    const pulse = this.tweens.add({ targets: nc, scale: { from: 1, to: 1.07 }, duration: 700, yoyo: true, repeat: -1 });

    const cutLbl = this.add.text(W / 2, 268, "CUT AT: 0", {
      fontFamily: "Courier New", fontSize: "15px", color: COLORS.purple_dark, fontStyle: "bold"
    }).setOrigin(0.5).setDepth(100);
    this._addEl(cutLbl, nc);

    nc.on("drag", (_, dx) => {
      pulse.stop(); nc.setScale(1);
      pos = Phaser.Math.Clamp(Math.round((dx - x0) / step), 0, str.length);
      nc.x = x0 + pos * step; nt.setText(`${pos}`); cutLbl.setText(`CUT AT: ${pos}`);
      boxes.forEach((b, i) => {
        b.drawBox(i < pos ? C.purple_bg : C.white, i < pos ? C.primary_purple : C.purple_border);
        b.charTxt.setAlpha(i < pos ? 1 : 0.3);
      });
      if (Math.random() < 0.3) {
        const p = this.add.circle(nc.x, ry + 22, 3, C.primary_purple, 0.7).setDepth(200);
        this.tweens.add({ targets: p, alpha: 0, y: p.y + 18, duration: 350, onComplete: () => p.destroy() });
      }
    });

    this._startTimer(20, () => {
      this._stopTimer(); this._handleWrong();
      this._showFeedback(false, `Time's up! Length = ${correctLen}`, "Count every character!", () => this._nextRound());
    });

    this.time.delayedCall(400, () => {
      this._btn(W / 2, 335, "🔒 Lock Answer", true, () => {
        this._stopTimer();
        if (pos === correctLen) {
          flag.clear(); flag.fillStyle(C.success_green, 1); flag.fillRoundedRect(-22, -34, 44, 32, 8);
          boxes.forEach(b => b.drawBox(C.success_bg, C.success_green));
          this._spawnConfetti(nc.x, ry, 22);
          const pts = this._handleCorrect(); this._spawnScorePopup(nc.x, ry - 60, `+${pts}`);
          this._showFeedback(true, `"${str}".length() = ${correctLen} ✓  +${pts} pts`,
            str.includes(" ") ? "Spaces count too!" : null, () => this._nextRound());
        } else {
          flag.clear(); flag.fillStyle(C.error_red, 1); flag.fillRoundedRect(-22, -34, 44, 32, 8);
          this.tweens.add({ targets: nc, x: nc.x + 6, duration: 55, yoyo: true, repeat: 7 });
          this.cameras.main.shake(220, 0.004); this._handleWrong();
          this._showFeedback(false, `Picked ${pos}, actual: ${correctLen}`,
            pos < correctLen ? "Keep counting!" : "Too many — count again!", () => this._nextRound());
        }
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════════════════
   *  OPERATION 2: charAt(i) — INDEX JUMPER
   * ═══════════════════════════════════════════════════════════════════════ */


  _playCharAt() {
    /* ── FROG HOP: Hop the frog to the target index using arrow buttons or keys ── */
    const round = OPERATIONS[1].rounds[this.roundIndex];
    const str = round.str, idx = round.idx, correctChar = round.answer;

    this._addEl(this.add.text(W / 2, 82, `🐸  Hop to index ${idx}, then Grab it!  "${str}".charAt(${idx}) = ?`, {
      fontFamily: "Arial", fontSize: "13px", color: COLORS.purple_darker, fontStyle: "bold"
    }).setOrigin(0.5).setDepth(100));

    const boxes = this._charBoxes(str, W / 2, 195, { baseDelay: 80 });

    // Lily pads under each box
    boxes.forEach(b => {
      this._addEl(
        this.add.circle(b.x, b.y + 38, 22, 0x27AE60, 0.8).setDepth(94),
        this.add.circle(b.x, b.y + 38, 14, 0x2ECC71, 0.5).setDepth(95)
      );
    });

    // Target arrow
    const arr = this.add.text(boxes[idx].x, boxes[idx].y - 58, "🎯", { fontSize: "18px" }).setOrigin(0.5).setDepth(102);
    this.tweens.add({ targets: arr, y: arr.y - 8, duration: 600, yoyo: true, repeat: -1 });
    this._addEl(arr);

    let frogPos = 0, hopping = false, hopCount = 0;
    const frog = this.add.text(boxes[0].x, boxes[0].y - 42, "🐸", { fontSize: "30px" }).setOrigin(0.5).setDepth(200);
    const hopLbl = this.add.text(W / 2, 262, "Hops: 0", {
      fontFamily: "Arial", fontSize: "12px", color: COLORS.text_secondary
    }).setOrigin(0.5).setDepth(100);
    this._addEl(frog, hopLbl);

    let grabBtn;
    const hopTo = (next) => {
      if (hopping || next < 0 || next >= str.length) return;
      hopping = true; hopCount++; hopLbl.setText(`Hops: ${hopCount}`);
      this.tweens.add({
        targets: frog, x: boxes[next].x, duration: 280, ease: "Linear",
        onUpdate: (tw) => { frog.y = boxes[0].y - 42 - Math.sin(tw.progress * Math.PI) * 42; },
        onComplete: () => {
          frogPos = next; hopping = false;
          grabBtn.setAlpha(frogPos === idx ? 1 : 0.45);
          const sq = this.add.circle(boxes[next].x, boxes[next].y + 38, 24, 0x27AE60, 0.5).setDepth(94);
          this.tweens.add({ targets: sq, scaleY: 0.55, duration: 90, yoyo: true, onComplete: () => sq.destroy() });
        }
      });
    };

    this._btn(W / 2 - 130, 330, "◀  Left", false, () => hopTo(frogPos - 1));
    this._btn(W / 2 + 130, 330, "Right  ▶", false, () => hopTo(frogPos + 1));

    grabBtn = this._btn(W / 2, 378, "🤚 Grab it!", true, () => {
      this._stopTimer();
      this.input.keyboard.off("keydown-LEFT"); this.input.keyboard.off("keydown-RIGHT");
      if (frogPos === idx) {
        this.tweens.add({ targets: frog, y: frog.y - 90, alpha: 0, scale: 1.5, duration: 450 });
        boxes[idx].drawBox(C.success_bg, C.success_green);
        this._spawnConfetti(frog.x, frog.y, 18);
        const pts = this._handleCorrect(); this._spawnScorePopup(frog.x, frog.y - 20, `+${pts}`);
        this._showFeedback(true, `charAt(${idx}) = '${correctChar}' ✓  +${pts} pts`,
          `Index ${idx} = the ${this._ordinal(idx + 1)} character`, () => this._nextRound());
      } else {
        this.tweens.add({ targets: frog, x: frog.x + 8, duration: 60, yoyo: true, repeat: 5 });
        this._handleWrong();
        this._showFeedback(false, `Frog on index ${frogPos} ('${str[frogPos]}') — need index ${idx}!`,
          "Counting starts at 0!", () => this._nextRound());
      }
    });
    grabBtn.setAlpha(0.45);

    this.input.keyboard.on("keydown-LEFT", () => hopTo(frogPos - 1));
    this.input.keyboard.on("keydown-RIGHT", () => hopTo(frogPos + 1));
    this._addEl({ destroy: () => { this.input.keyboard.off("keydown-LEFT"); this.input.keyboard.off("keydown-RIGHT"); } });

    this._startTimer(22, () => {
      this._stopTimer(); this._handleWrong();
      this._showFeedback(false, `Time's up! charAt(${idx}) = '${correctChar}'`, "Index 0 is always the first character!", () => this._nextRound());
    });
  }

  /* ═══════════════════════════════════════════════════════════════════════
   *  OPERATION 3: toUpperCase / toLowerCase — CASE FLIPPER
   * ═══════════════════════════════════════════════════════════════════════ */

  _playCaseChange() {
    /* ── SWEEP LINE: Click letters to flip before the sweep line passes over them ── */
    const round = OPERATIONS[2].rounds[this.roundIndex];
    const str = round.str, isUpper = round.op === "upper", correct = round.answer;
    const method = isUpper ? "toUpperCase()" : "toLowerCase()";

    this._addEl(this.add.text(W / 2, 82, `🔄  "${str}".${method} — click letters BEFORE the sweep line!`, {
      fontFamily: "Arial", fontSize: "13px", color: COLORS.purple_darker, fontStyle: "bold"
    }).setOrigin(0.5).setDepth(100));

    // Belt background
    const bG = this.add.graphics().setDepth(90);
    bG.fillStyle(C.purple_border, 0.18); bG.fillRect(0, 180, W, 80);
    this._addEl(bG);

    // Animated stripes
    let sOff = 0;
    const sG = this.add.graphics().setDepth(91);
    const sEv = this.time.addEvent({
      delay: 25, repeat: -1, callback: () => {
        sOff = (sOff + 2) % 24; sG.clear(); sG.fillStyle(C.primary_purple, 0.07);
        for (let x = sOff; x < W; x += 24) sG.fillRect(x, 181, 12, 78);
      }
    });
    this._addEl(sG, { destroy: () => sEv.destroy() });

    const boxes = this._charBoxes(str, W / 2, 220, { baseDelay: 0, animate: false });
    const flipped = str.split("").map(c => !/[a-zA-Z]/.test(c)); // non-letters auto-pass

    // Mark non-letters green immediately
    boxes.forEach((b, i) => {
      if (flipped[i]) b.drawBox(C.success_bg, C.success_green);
    });

    // Click to flip
    boxes.forEach((b, i) => {
      if (flipped[i]) return;
      const hit = this.add.rectangle(b.x, b.y, BOX_W, BOX_H).setAlpha(0.001).setInteractive({ useHandCursor: true }).setDepth(115);
      this._addEl(hit);
      hit.on("pointerup", () => {
        if (flipped[i]) return;
        flipped[i] = true;
        b.charTxt.setText(isUpper ? str[i].toUpperCase() : str[i].toLowerCase());
        b.drawBox(C.success_bg, C.success_green);
        this.tweens.add({ targets: b.charTxt, scaleX: { from: 0, to: 1 }, duration: 200 });
        for (let p = 0; p < 5; p++) {
          const px = this.add.circle(b.x + (Math.random() - 0.5) * 30, b.y + (Math.random() - 0.5) * 20, 3, C.success_green, 0.8).setDepth(200);
          this.tweens.add({ targets: px, alpha: 0, scale: 0, duration: 500, onComplete: () => px.destroy() });
        }
      });
    });

    // Sweep line
    const step = BOX_W + 4, x0 = W / 2 - str.length * step / 2;
    const sweepLine = this.add.rectangle(x0 - 20, 220, 4, 80, C.primary_purple, 0.9).setDepth(120).setOrigin(0, 0.5);
    this._addEl(sweepLine);

    this.tweens.add({
      targets: sweepLine, x: x0 + str.length * step + 20,
      duration: Math.max(str.length * 900, 3500), ease: "Linear",
      onComplete: () => {
        this._stopTimer();
        const allGood = flipped.every(Boolean);
        if (allGood) {
          const pts = this._handleCorrect();
          this._spawnScorePopup(W / 2, 180, `+${pts}`); this._spawnConfetti(W / 2, 220, 20);
          this._showFeedback(true, `"${str}" → "${correct}" ✓  +${pts} pts`, null, () => this._nextRound());
        } else {
          boxes.forEach((b, i) => { if (!flipped[i]) { b.charTxt.setText(correct[i]); b.drawBox(C.error_bg, C.error_red); } });
          this._handleWrong();
          this._showFeedback(false, `Correct: "${correct}"`, "Click every letter before the sweep line passes!", () => this._nextRound());
        }
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════════════════
   *  OPERATION 4: concat (+) — MAGNET MERGE
   * ═══════════════════════════════════════════════════════════════════════ */

  _playConcat() {
    /* ── MAGNET MERGE: Drag the right string to snap onto the left string ── */
    const round = OPERATIONS[3].rounds[this.roundIndex];
    const a = round.a, b = round.b, correct = round.answer;
    const step = BOX_W + 4;
    const leftW = a.length * step, rightW = b.length * step;
    const leftX = W / 2 - leftW / 2 - rightW / 2 - 24;
    const rightStartX = W / 2 + leftW / 2 + rightW / 2 + 24;

    this._addEl(this.add.text(W / 2, 82, `🧲  Drag the orange string to SNAP onto the purple string!`, {
      fontFamily: "Arial", fontSize: "13px", color: COLORS.purple_darker, fontStyle: "bold"
    }).setOrigin(0.5).setDepth(100));
    this._addEl(this.add.text(W / 2, 108, `"${a}" + "${b}" = ?`, {
      fontFamily: "Courier New", fontSize: "14px", color: COLORS.text_secondary
    }).setOrigin(0.5).setDepth(100));

    const leftBoxes = this._charBoxes(a, leftX, 210, { baseDelay: 80, fill: C.purple_bg, border: C.primary_purple });
    const rightBoxes = this._charBoxes(b, rightStartX, 210, { baseDelay: 160, fill: 0xFFF4CC, border: C.orange });

    const rc = this.add.container(rightStartX, 0).setDepth(150);
    rc.setSize(rightW + 20, 80).setInteractive({ draggable: true, useHandCursor: true });
    this.input.setDraggable(rc);
    this._addEl(rc);

    const proximityLbl = this.add.text(W / 2, 290, "Drag the string closer...", {
      fontFamily: "Arial", fontSize: "13px", color: COLORS.text_secondary
    }).setOrigin(0.5).setDepth(100);
    this._addEl(proximityLbl);

    let merged = false;
    const snapTarget = leftX + leftW / 2 + rightW / 2 + step;

    rc.on("drag", (_, dx) => {
      if (merged) return;
      const delta = dx - rightStartX;
      rightBoxes.forEach(rb => {
        rb.box.x = rb.x + delta; rb.charTxt.x = rb.x + delta; rb.idxTxt.x = rb.x + delta;
      });
      const dist = Math.abs(rightBoxes[0].charTxt.x - (leftBoxes[leftBoxes.length - 1].charTxt.x + step));
      proximityLbl.setText(dist < 30 ? "⚡ SNAP!" : dist < 80 ? "Almost there!" : "Drag closer...");
      if (dist < 60 && Math.random() < 0.35) {
        const cx = leftBoxes[leftBoxes.length - 1].charTxt.x + step / 2;
        const px = this.add.circle(cx + (Math.random() - 0.5) * 30, 210 + (Math.random() - 0.5) * 30, 3, C.gold, 0.9).setDepth(200);
        this.tweens.add({ targets: px, alpha: 0, scale: 0, duration: 400, onComplete: () => px.destroy() });
      }
    });

    rc.on("dragend", () => {
      if (merged) return;
      const lastLX = leftBoxes[leftBoxes.length - 1].charTxt.x;
      const dist = Math.abs(rightBoxes[0].charTxt.x - (lastLX + step));
      if (dist < 55) {
        merged = true; rc.disableInteractive();
        rightBoxes.forEach((rb, i) => {
          const tx = lastLX + (i + 1) * step;
          this.tweens.add({ targets: [rb.charTxt, rb.idxTxt], x: tx, duration: 200, ease: "Back.out" });
          rb.drawBox(C.success_bg, C.success_green);
        });
        leftBoxes.forEach(lb => lb.drawBox(C.success_bg, C.success_green));
        this._spawnConfetti(lastLX + step, 210, 25);
        proximityLbl.setText(`"${a}" + "${b}" = "${correct}" ✓`);
        const pts = this._handleCorrect(); this._spawnScorePopup(W / 2, 170, `+${pts}`);
        this.time.delayedCall(500, () => this._showFeedback(true,
          `"${a}" + "${b}" = "${correct}" ✓  +${pts} pts`,
          "Strings join exactly — every space matters!", () => this._nextRound()));
      } else {
        rightBoxes.forEach(rb => {
          this.tweens.add({ targets: [rb.charTxt, rb.idxTxt], x: rb.x, duration: 300, ease: "Back.out" });
        });
        proximityLbl.setText("Not close enough — drag more!");
        this.cameras.main.shake(100, 0.002);
      }
    });

    this._startTimer(25, () => {
      this._stopTimer(); this._handleWrong();
      this._showFeedback(false, `"${a}" + "${b}" = "${correct}"`, "Strings join end-to-end — every space matters!", () => this._nextRound());
    });
  }


  /* ═══════════════════════════════════════════════════════════════════════
   *  OPERATION 5: substring(a,b) — SLICE CUTTER
   * ═══════════════════════════════════════════════════════════════════════ */

  _playSubstring() {
    /* ── LASER CUTTER: Drag two laser beams to slice out the correct substring ── */
    const round = OPERATIONS[4].rounds[this.roundIndex];
    const str = round.str, a = round.a, b = round.b, correct = round.answer;

    this._addEl(this.add.text(W / 2, 82, `✂️  Drag the lasers to cut  "${str}".substring(${a},${b})`, {
      fontFamily: "Arial", fontSize: "13px", color: COLORS.purple_darker, fontStyle: "bold"
    }).setOrigin(0.5).setDepth(100));

    const boxes = this._charBoxes(str, W / 2, 200, { baseDelay: 80 });
    const step = BOX_W + 4, x0 = W / 2 - str.length * step / 2;
    const bx = (i) => x0 + i * step - 2;

    const prevLbl = this.add.text(W / 2, 290, `substring(0,${str.length}) = "${str}"`, {
      fontFamily: "Courier New", fontSize: "12px", color: COLORS.text_secondary
    }).setOrigin(0.5).setDepth(100);
    this._addEl(prevLbl);

    let laserA = 0, laserB = str.length;

    const updatePreview = () => {
      const sub = laserA < laserB ? str.substring(laserA, laserB) : "";
      prevLbl.setText(`substring(${laserA},${laserB}) = "${sub}"`);
      boxes.forEach((box, i) => {
        const inside = i >= laserA && i < laserB;
        box.drawBox(inside ? C.purple_bg : C.white, inside ? C.error_red : C.purple_border);
        box.charTxt.setAlpha(inside ? 1 : 0.3);
      });
    };

    const makeLaser = (initBound, isLeft) => {
      let cur = initBound;
      const lc = this.add.container(bx(cur), 200).setDepth(155);
      const glow = this.add.graphics(); glow.fillStyle(C.error_red, 0.2); glow.fillRect(-7, -55, 14, 110);
      const beam = this.add.graphics(); beam.fillStyle(C.error_red, 0.9); beam.fillRect(-2, -55, 4, 110);
      const handle = this.add.graphics(); handle.fillStyle(C.error_red, 1); handle.fillRoundedRect(-14, isLeft ? -68 : 56, 28, 20, 4);
      const ht = this.add.text(0, isLeft ? -58 : 66, isLeft ? "A" : "B", {
        fontFamily: "Arial", fontSize: "10px", color: COLORS.white, fontStyle: "bold"
      }).setOrigin(0.5);
      lc.add([glow, beam, handle, ht]);
      lc.setSize(28, 120).setInteractive({ draggable: true, useHandCursor: true });
      this.input.setDraggable(lc);
      this._addEl(lc);
      this.tweens.add({ targets: glow, alpha: { from: 0.2, to: 0.6 }, duration: 500, yoyo: true, repeat: -1 });
      lc.on("drag", (_, dx) => {
        const rawI = Math.round((dx - x0) / step);
        if (isLeft) laserA = Phaser.Math.Clamp(rawI, 0, laserB - 1);
        else laserB = Phaser.Math.Clamp(rawI, laserA + 1, str.length);
        lc.x = bx(isLeft ? laserA : laserB);
        updatePreview();
      });
      return lc;
    };

    makeLaser(0, true);
    makeLaser(str.length, false);
    updatePreview();

    this._startTimer(25, () => {
      this._stopTimer(); this._handleWrong();
      this._showFeedback(false, `Correct: "${correct}"`, `Start at ${a}, stop BEFORE ${b}`, () => this._nextRound());
    });

    this.time.delayedCall(400, () => {
      this._btn(W / 2, 348, "✂️  Cut!", true, () => {
        this._stopTimer();
        if (laserA === a && laserB === b) {
          boxes.forEach((box, i) => {
            if (i >= a && i < b) {
              this.tweens.add({ targets: [box.box, box.charTxt, box.idxTxt], y: box.y - 30, duration: 400, ease: "Back.out" });
              box.drawBox(C.success_bg, C.success_green);
            } else {
              this.tweens.add({ targets: [box.box, box.charTxt, box.idxTxt], alpha: 0, duration: 300 });
            }
          });
          this._spawnConfetti(W / 2, 200, 22);
          const pts = this._handleCorrect(); this._spawnScorePopup(W / 2, 160, `+${pts}`);
          this._showFeedback(true, `substring(${a},${b}) = "${correct}" ✓  +${pts} pts`,
            `Indices ${a} through ${b - 1} extracted`, () => this._nextRound());
        } else {
          this.cameras.main.shake(200, 0.004); this._handleWrong();
          this._showFeedback(false, `Got "${str.substring(laserA, laserB)}", need "${correct}"`,
            `substring(${a},${b}): start at ${a}, stop BEFORE ${b}`, () => this._nextRound());
        }
      });
    });
  }


  /* ═══════════════════════════════════════════════════════════════════════
   *  OPERATION 6: trim() — SPACE SWEEPER
   * ═══════════════════════════════════════════════════════════════════════ */

  _playTrim() {
    /* ── BROOM SWEEP: Move pointer over spaces to sweep them off the edges ── */
    const round = OPERATIONS[5].rounds[this.roundIndex];
    const str = round.str, correct = round.answer;

    this._addEl(this.add.text(W / 2, 82, `🧹  "${str.replace(/ /g, '·')}".trim() — move broom over edge spaces to sweep!`, {
      fontFamily: "Arial", fontSize: "12px", color: COLORS.purple_darker, fontStyle: "bold"
    }).setOrigin(0.5).setDepth(100));

    const boxes = this._charBoxes(str, W / 2, 200, { baseDelay: 80 });
    const shouldSweep = new Array(str.length).fill(false);
    let s = 0, e = str.length - 1;
    while (s < str.length && str[s] === " ") { shouldSweep[s] = true; s++; }
    while (e >= 0 && str[e] === " ") { shouldSweep[e] = true; e--; }
    const swept = new Array(str.length).fill(false);

    boxes.forEach((b, i) => {
      if (str[i] === " ") {
        const dg = this.add.graphics().setDepth(102);
        dg.fillStyle(0x888780, 0.35); dg.fillCircle(b.x, b.y, 20);
        this._addEl(dg);
      }
    });

    const infoLbl = this.add.text(W / 2, 268, "Move broom over spaces — only sweep the ones at the START and END", {
      fontFamily: "Arial", fontSize: "11px", color: COLORS.text_secondary
    }).setOrigin(0.5).setDepth(100);
    this._addEl(infoLbl);

    const broom = this.add.text(30, 200, "🧹", { fontSize: "30px" }).setOrigin(0.5).setDepth(210);
    this._addEl(broom);

    const sweepZone = this.add.rectangle(W / 2, 200, W - 40, 70).setAlpha(0.001).setInteractive({ useHandCursor: true }).setDepth(200);
    this._addEl(sweepZone);

    sweepZone.on("pointermove", (ptr) => {
      broom.x = Phaser.Math.Clamp(ptr.x, 20, W - 20);
      broom.y = Phaser.Math.Clamp(ptr.y, 170, 235);
      boxes.forEach((b, i) => {
        if (swept[i]) return;
        if (Math.abs(broom.x - b.x) < BOX_W / 2 + 8 && Math.abs(broom.y - b.y) < 40 && str[i] === " ") {
          swept[i] = true;
          if (shouldSweep[i]) {
            b.drawBox(C.success_bg, C.success_green); b.charTxt.setAlpha(0.2);
            for (let p = 0; p < 6; p++) {
              const px = this.add.circle(b.x + (Math.random()-0.5)*30, b.y + (Math.random()-0.5)*20, 3, 0x888780, 0.8).setDepth(220);
              this.tweens.add({ targets: px, alpha: 0, scale: 0, duration: 400, onComplete: () => px.destroy() });
            }
          } else {
            b.drawBox(0xFFF4CC, C.orange);
            this.tweens.add({ targets: broom, x: broom.x - 25, duration: 80, yoyo: true });
            infoLbl.setText("⚠️ Middle spaces stay! trim() only removes edge spaces.");
          }
        }
      });
    });

    this._startTimer(20, () => {
      this._stopTimer(); this._handleWrong();
      this._showFeedback(false, `Correct: "${correct}"`, "Sweep edge spaces only — middle ones stay!", () => this._nextRound());
    });

    this.time.delayedCall(400, () => {
      this._btn(W / 2, 345, "🧹 Done Sweeping!", true, () => {
        this._stopTimer();
        const ok = shouldSweep.every((should, i) => swept[i] === should);
        if (ok) {
          boxes.forEach((b, i) => {
            if (shouldSweep[i]) this.tweens.add({ targets: [b.box, b.charTxt, b.idxTxt, b.shadow], alpha: 0, scale: 0.5, duration: 400, delay: i * 50, ease: "Back.in" });
            else b.drawBox(C.success_bg, C.success_green);
          });
          this._spawnConfetti(W / 2, 200, 22);
          const pts = this._handleCorrect(); this._spawnScorePopup(W / 2, 160, `+${pts}`);
          this._showFeedback(true, `trim() → "${correct}" ✓  +${pts} pts`, "Only edge spaces removed!", () => this._nextRound());
        } else {
          boxes.forEach((b, i) => { if (shouldSweep[i] && !swept[i]) { b.drawBox(0xFFE0E0, C.error_red); b.charTxt.setText("✕"); } });
          this._handleWrong();
          this._showFeedback(false, `Correct: "${correct}"`, "trim() removes START and END spaces only!", () => this._nextRound());
        }
      });
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
