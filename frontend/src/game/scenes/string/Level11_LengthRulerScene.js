/**
 * Level11_LengthRulerScene — String.length() tuning through interactive ruler
 * ═══════════════════════════════════════════════════════════════════════════
 * v2 — visual polish pass (gradients, shadows, particles, glow, animations)
 *
 * Educational mechanic: Students learn that String.length() returns the count
 * of characters (including spaces and symbols), and that it represents the
 * "cut position" AFTER the last character (explaining off-by-one indexing).
 *
 * Two-phase flow:
 * 1. TUTORIAL (auto-play animated demo showing length() concept)
 * 2. PLAYABLE GAME (5 rounds: drag notch to measure string length)
 *
 * Schema Theory: TUNING — deepening understanding through guided discovery.
 */

import Phaser from "phaser";

/* ═══════════════════════════════════════════════════════════════════════════
 *  COLOR PALETTE & CONSTANTS
 * ═══════════════════════════════════════════════════════════════════════════ */

const COLORS = {
  primary_purple: "#7F77DD",
  purple_light: "#9B92E8",
  purple_dark: "#534AB7",
  purple_darker: "#26215C",
  purple_bg: "#EEEDFE",
  purple_pale: "#F4F2FE",
  purple_border: "#D5D0E8",
  purple_tinted_gray: "#9B92C8",
  success_green: "#1D9E75",
  success_green_dark: "#0F6E56",
  success_bg: "#EAF3DE",
  success_bg_dark: "#D5EBC0",
  error_red: "#E24B4A",
  error_red_dark: "#A32D2D",
  error_bg: "#FCEBEB",
  error_bg_dark: "#F8DBDA",
  text_primary: "#1F1E1D",
  text_secondary: "#888780",
  bg_top: "#F4F2FE",
  bg_bottom: "#FAF9F5",
  white: "#FFFFFF",
  gold: "#FFD700",
  pink: "#ED93B1"
};

const C = {
  primary_purple: 0x7F77DD,
  purple_light: 0x9B92E8,
  purple_dark: 0x534AB7,
  purple_darker: 0x26215C,
  purple_bg: 0xEEEDFE,
  purple_pale: 0xF4F2FE,
  purple_border: 0xD5D0E8,
  purple_tinted_gray: 0x9B92C8,
  success_green: 0x1D9E75,
  success_green_dark: 0x0F6E56,
  success_bg: 0xEAF3DE,
  success_bg_dark: 0xD5EBC0,
  error_red: 0xE24B4A,
  error_red_dark: 0xA32D2D,
  error_bg: 0xFCEBEB,
  error_bg_dark: 0xF8DBDA,
  text_primary: 0x1F1E1D,
  text_secondary: 0x888780,
  bg_top: 0xF4F2FE,
  bg_bottom: 0xFAF9F5,
  white: 0xFFFFFF,
  gold: 0xFFD700,
  pink: 0xED93B1,
  confetti_purple: 0xB7AFEE,
  confetti_green: 0x7FCFA3,
  confetti_pink: 0xF5B9CC
};

const CANVAS = { W: 800, H: 600 };
const BOX_WIDTH = 50;
const BOX_HEIGHT = 60;
const BOX_GAP = 4;

const ROUNDS = [
  { str: "Java", length: 4 },
  { str: "Hi", length: 2 },
  { str: "World!", length: 6 },
  { str: "a b c", length: 5 },
  { str: "Hello", length: 5 }
];

/* ═══════════════════════════════════════════════════════════════════════════
 *  SCENE
 * ═══════════════════════════════════════════════════════════════════════════ */

export class Level11_LengthRulerScene extends Phaser.Scene {
  constructor() {
    super({ key: "Level11_LengthRulerScene" });
  }

  create() {
    // State
    this.phase = "tutorial";
    this.currentRound = 0;
    this.score = 0;
    this.streak = 0;
    this.bestStreak = 0;
    this.correctRounds = 0;
    this.userAnswer = null;
    this.feedbackShown = false;
    this.tutorialElements = [];
    this.gameplayElements = [];
    this.persistentBgElements = [];

    // Background (persists across phases)
    this._createBackground();

    // Generate particle textures we'll reuse
    this._createParticleTextures();

    // Start tutorial
    this._startTutorial();
  }

  /* ═════════════════════════════════════════════════════════════════════════
   *  BACKGROUND & TEXTURES
   * ═════════════════════════════════════════════════════════════════════════ */

  _createBackground() {
    // Gradient backdrop
    const bg = this.add.graphics();
    bg.fillGradientStyle(C.bg_top, C.bg_top, C.bg_bottom, C.bg_bottom, 1);
    bg.fillRect(0, 0, CANVAS.W, CANVAS.H);
    bg.setDepth(0);
    this.persistentBgElements.push(bg);

    // Atmospheric blobs
    const blob1 = this.add.circle(120, 100, 200, C.primary_purple, 0.08).setDepth(1);
    const blob2 = this.add.circle(680, 500, 250, C.success_green, 0.06).setDepth(1);
    this.persistentBgElements.push(blob1, blob2);

    // Floating stars (twinkling)
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * CANVAS.W;
      const y = Math.random() * CANVAS.H;
      const size = 1 + Math.random() * 3;
      const star = this.add.circle(x, y, size, 0xC8C0F5, 0.3 + Math.random() * 0.3).setDepth(2);
      this.tweens.add({
        targets: star,
        alpha: { from: 0.2, to: 0.7 },
        duration: 2000 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
        delay: Math.random() * 2000
      });
      this.persistentBgElements.push(star);
    }
  }

  _createParticleTextures() {
    // Small filled circle for particles (white, will be tinted)
    const g = this.add.graphics();
    g.fillStyle(0xFFFFFF, 1);
    g.fillCircle(4, 4, 4);
    g.generateTexture("particle_circle", 8, 8);
    g.destroy();

    // Confetti rectangle
    const g2 = this.add.graphics();
    g2.fillStyle(0xFFFFFF, 1);
    g2.fillRect(0, 0, 6, 10);
    g2.generateTexture("confetti_rect", 6, 10);
    g2.destroy();

    // Sparkle (small star-like)
    const g3 = this.add.graphics();
    g3.fillStyle(0xFFFFFF, 1);
    g3.fillCircle(3, 3, 3);
    g3.generateTexture("particle_small", 6, 6);
    g3.destroy();
  }

  /* ═════════════════════════════════════════════════════════════════════════
   *  HELPER: Rounded rectangle with gradient (Phaser doesn't natively support
   *  gradient fill on rounded rects, so we layer two graphics)
   * ═════════════════════════════════════════════════════════════════════════ */

  _drawShadowedRoundedBox(x, y, w, h, radius, fillTop, fillBottom, borderColor, borderWidth = 2) {
    const container = this.add.container(x, y);

    // Drop shadow (offset duplicate)
    const shadow = this.add.graphics();
    shadow.fillStyle(C.purple_dark, 0.18);
    shadow.fillRoundedRect(-w / 2 + 3, -h / 2 + 4, w, h, radius);
    container.add(shadow);

    // Main fill (gradient via two halves)
    const main = this.add.graphics();
    main.fillStyle(fillTop, 1);
    main.fillRoundedRect(-w / 2, -h / 2, w, h, radius);
    container.add(main);

    // Bottom-half overlay for gradient effect
    const overlay = this.add.graphics();
    overlay.fillStyle(fillBottom, 0.6);
    // Subtle bottom half overlay
    overlay.fillRoundedRect(-w / 2, 0, w, h / 2, { tl: 0, tr: 0, bl: radius, br: radius });
    container.add(overlay);

    // Border
    if (borderColor !== null) {
      const border = this.add.graphics();
      border.lineStyle(borderWidth, borderColor, 1);
      border.strokeRoundedRect(-w / 2, -h / 2, w, h, radius);
      container.add(border);
    }

    return container;
  }

  /* ═════════════════════════════════════════════════════════════════════════
   *  PHASE 1: TUTORIAL
   * ═════════════════════════════════════════════════════════════════════════ */

  _startTutorial() {
    this._createSkipButton();
    this.tutorialElements = [];
    this._runTutorialSteps();
  }

  _createSkipButton() {
    const skipContainer = this.add.container(CANVAS.W - 75, 30).setDepth(500);

    const bg = this.add.graphics();
    bg.fillStyle(C.white, 0.85);
    bg.fillRoundedRect(-55, -16, 110, 32, 16);
    bg.lineStyle(1, C.purple_border, 1);
    bg.strokeRoundedRect(-55, -16, 110, 32, 16);
    skipContainer.add(bg);

    const txt = this.add.text(0, 0, "Skip tutorial →", {
      fontFamily: "Arial", fontSize: "12px", color: COLORS.text_secondary, fontStyle: "bold"
    }).setOrigin(0.5);
    skipContainer.add(txt);

    skipContainer.setSize(110, 32);
    skipContainer.setInteractive({ useHandCursor: true });
    skipContainer.on("pointerover", () => {
      txt.setColor(COLORS.purple_dark);
    });
    skipContainer.on("pointerout", () => {
      txt.setColor(COLORS.text_secondary);
    });
    skipContainer.on("pointerup", () => {
      this._clearTutorials();
      this._transitionToGameplay();
    });

    this.skipButton = skipContainer;
  }

  _runTutorialSteps() {
    let delay = 400;
    delay += this._tutorialStep(() => this._step1_ShowCode(), 2200, delay, false);
    delay += this._tutorialStep(() => this._step2_ShowBoxes(), 2600, delay, false);
    delay += this._tutorialStep(() => this._step3_ShowRuler(), 1800, delay, false);
    delay += this._tutorialStep(() => this._step4_ShowNotchStart(), 2200, delay, false);
    delay += this._tutorialStep(() => this._step5_AnimateNotchSlide(), 4200, delay, false);
    delay += this._tutorialStep(() => this._step6_SuccessMessage(), 2800, delay, false);
    delay += this._tutorialStep(() => this._step7_ExamplesSpaces(), 2600, delay, true);
    delay += this._tutorialStep(() => this._step8_ExamplesEmpty(), 2400, delay, true);

    this.time.delayedCall(delay, () => {
      this._clearTutorials();
      this._step9_FinalTutorialScreen();
    });
  }

  _tutorialStep(callback, duration, delay, clear = false) {
    this.time.delayedCall(delay, () => {
      if (clear) this._clearTutorials();
      callback();
    });
    return duration;
  }

  // STEP 1: Code line with typewriter effect
  _step1_ShowCode() {
    const codeFinal = 'String s = "Hello";';

    const card = this.add.container(CANVAS.W / 2, 80).setDepth(100);

    // Shadow
    const shadow = this.add.graphics();
    shadow.fillStyle(C.purple_dark, 0.25);
    shadow.fillRoundedRect(-130, -20, 260, 44, 12);
    shadow.y = 4;
    card.add(shadow);

    // Background gradient
    const bg = this.add.graphics();
    bg.fillStyle(C.purple_light, 1);
    bg.fillRoundedRect(-130, -22, 260, 44, 12);
    const bgOverlay = this.add.graphics();
    bgOverlay.fillStyle(C.primary_purple, 0.7);
    bgOverlay.fillRoundedRect(-130, 0, 260, 22, { tl: 0, tr: 0, bl: 12, br: 12 });
    card.add(bg);
    card.add(bgOverlay);

    const txt = this.add.text(0, 0, "", {
      fontFamily: "Courier New", fontSize: "18px", color: COLORS.white, fontStyle: "bold"
    }).setOrigin(0.5);
    card.add(txt);

    card.setAlpha(0);
    this.tweens.add({
      targets: card,
      alpha: 1,
      y: { from: 60, to: 80 },
      duration: 500,
      ease: "Cubic.out"
    });

    // Typewriter effect
    let i = 0;
    const interval = this.time.addEvent({
      delay: 50,
      repeat: codeFinal.length - 1,
      callback: () => {
        i++;
        txt.setText(codeFinal.substring(0, i));
      }
    });

    this.tutorialElements.push(card);
  }

  // STEP 2: Character boxes with bounce-in
  _step2_ShowBoxes() {
    const str = "Hello";
    const totalWidth = str.length * BOX_WIDTH + (str.length - 1) * BOX_GAP;
    const startX = CANVAS.W / 2 - totalWidth / 2 + BOX_WIDTH / 2;
    const y = 200;

    this.tutorialBoxRefs = [];
    this.tutorialStartX = startX - BOX_WIDTH / 2;
    this.tutorialBoxY = y;

    str.split("").forEach((char, i) => {
      const x = startX + i * (BOX_WIDTH + BOX_GAP);

      // Shadow
      const shadow = this.add.graphics().setDepth(99);
      shadow.fillStyle(C.purple_dark, 0.18);
      shadow.fillRoundedRect(x - BOX_WIDTH / 2 + 3, y - BOX_HEIGHT / 2 + 4, BOX_WIDTH, BOX_HEIGHT, 8);

      // Main box
      const box = this.add.graphics().setDepth(100);
      const drawBox = (fillTop, fillBottom, border) => {
        box.clear();
        box.fillStyle(fillTop, 1);
        box.fillRoundedRect(x - BOX_WIDTH / 2, y - BOX_HEIGHT / 2, BOX_WIDTH, BOX_HEIGHT, 8);
        box.fillStyle(fillBottom, 0.5);
        box.fillRoundedRect(x - BOX_WIDTH / 2, y, BOX_WIDTH, BOX_HEIGHT / 2, { tl: 0, tr: 0, bl: 8, br: 8 });
        box.lineStyle(2, border, 1);
        box.strokeRoundedRect(x - BOX_WIDTH / 2, y - BOX_HEIGHT / 2, BOX_WIDTH, BOX_HEIGHT, 8);
      };
      drawBox(C.white, C.purple_pale, C.purple_border);

      // Char text
      const charTxt = this.add.text(x, y - 6, char, {
        fontFamily: "Courier New", fontSize: "22px", color: COLORS.text_primary, fontStyle: "bold"
      }).setOrigin(0.5).setDepth(101);

      // Index label
      const idxTxt = this.add.text(x, y + 22, i.toString(), {
        fontFamily: "Arial", fontSize: "11px", color: COLORS.purple_tinted_gray, fontStyle: "bold"
      }).setOrigin(0.5).setDepth(101);

      // Bounce-in
      const targets = [shadow, box, charTxt, idxTxt];
      targets.forEach(t => { t.setAlpha(0); t.setScale(0); });

      this.tweens.add({
        targets,
        alpha: 1,
        scale: 1,
        duration: 450,
        ease: "Back.out",
        delay: i * 150
      });

      this.tutorialBoxRefs.push({ shadow, box, charTxt, idxTxt, x, y, drawBox, char });
      this.tutorialElements.push(shadow, box, charTxt, idxTxt);
    });
  }

  // STEP 3: Ruler with proper measuring tool look
  _step3_ShowRuler() {
    const str = "Hello";
    const totalWidth = (str.length + 1) * BOX_WIDTH + str.length * BOX_GAP;
    const startX = this.tutorialStartX;
    const rulerY = this.tutorialBoxY + BOX_HEIGHT / 2 + 20;

    // Ruler bar (layered)
    const rulerBg = this.add.graphics().setDepth(98);
    rulerBg.fillStyle(C.purple_border, 1);
    rulerBg.fillRoundedRect(startX, rulerY - 7, totalWidth, 14, 4);

    const rulerGroove = this.add.graphics().setDepth(98);
    rulerGroove.fillStyle(C.primary_purple, 0.3);
    rulerGroove.fillRoundedRect(startX + 4, rulerY - 2, totalWidth - 8, 4, 2);

    rulerBg.setAlpha(0);
    rulerGroove.setAlpha(0);
    this.tweens.add({
      targets: [rulerBg, rulerGroove],
      alpha: 1,
      duration: 600,
      ease: "Power2.out"
    });

    this.tutorialElements.push(rulerBg, rulerGroove);
    this.tutorialRulerY = rulerY;

    // Tick marks and labels
    for (let i = 0; i <= str.length; i++) {
      const tickX = startX + i * (BOX_WIDTH + BOX_GAP) - (i > 0 ? BOX_GAP / 2 : 0);

      const tick = this.add.graphics().setDepth(99);
      tick.fillStyle(C.primary_purple, 1);
      tick.fillRect(tickX - 1, rulerY - 9, 2, 14);
      tick.setAlpha(0);

      // Label pill
      const labelBg = this.add.graphics().setDepth(99);
      labelBg.fillStyle(C.white, 0.9);
      labelBg.fillRoundedRect(tickX - 9, rulerY + 12, 18, 16, 8);
      labelBg.setAlpha(0);

      const label = this.add.text(tickX, rulerY + 20, i.toString(), {
        fontFamily: "Arial", fontSize: "11px", color: COLORS.purple_dark, fontStyle: "bold"
      }).setOrigin(0.5).setDepth(100).setAlpha(0);

      this.tweens.add({
        targets: [tick, labelBg, label],
        alpha: 1,
        duration: 300,
        delay: 200 + i * 80,
        ease: "Cubic.out"
      });

      this.tutorialElements.push(tick, labelBg, label);
    }
  }

  // STEP 4: Notch at start position with instruction
  _step4_ShowNotchStart() {
    const startX = this.tutorialStartX;
    const rulerY = this.tutorialRulerY;

    this._createTutorialNotch(startX, rulerY, 0);

    const instruct = this.add.text(CANVAS.W / 2, 360, "Drag the notch to where the string ENDS", {
      fontFamily: "Arial", fontSize: "16px", color: COLORS.purple_dark, fontStyle: "bold"
    }).setOrigin(0.5).setAlpha(0).setDepth(100);

    this.tweens.add({
      targets: instruct,
      alpha: 1,
      y: { from: 380, to: 360 },
      duration: 500
    });

    this.tutorialElements.push(instruct);
  }

  _createTutorialNotch(x, y, value) {
    const container = this.add.container(x, y).setDepth(150);

    // Glow ring (behind everything)
    const glow = this.add.circle(0, 0, 30, C.primary_purple, 0.3);
    container.add(glow);

    // Stem (going up through chars)
    const stem = this.add.graphics();
    stem.fillStyle(C.purple_dark, 1);
    stem.fillRect(-1.5, -65, 3, 65);
    stem.fillStyle(C.primary_purple, 1);
    stem.fillRect(-1.5, -65, 3, 32);
    container.add(stem);

    // Pivot circle at base
    const pivot = this.add.circle(0, 0, 6, C.purple_dark);
    container.add(pivot);

    // Flag shadow
    const flagShadow = this.add.graphics();
    flagShadow.fillStyle(C.purple_dark, 0.4);
    flagShadow.fillRoundedRect(-22, -45, 44, 36, { tl: 8, tr: 8, bl: 2, br: 8 });
    flagShadow.y = 3;
    container.add(flagShadow);

    // Flag main (gradient via two layers)
    const flag = this.add.graphics();
    flag.fillStyle(C.purple_light, 1);
    flag.fillRoundedRect(-22, -48, 44, 36, { tl: 8, tr: 8, bl: 2, br: 8 });
    flag.fillStyle(C.primary_purple, 0.7);
    flag.fillRoundedRect(-22, -30, 44, 18, { tl: 0, tr: 0, bl: 2, br: 8 });
    flag.lineStyle(2, C.purple_dark, 1);
    flag.strokeRoundedRect(-22, -48, 44, 36, { tl: 8, tr: 8, bl: 2, br: 8 });
    container.add(flag);

    // Flag text
    const flagText = this.add.text(0, -30, value.toString(), {
      fontFamily: "Arial", fontSize: "18px", color: COLORS.white, fontStyle: "bold"
    }).setOrigin(0.5);
    container.add(flagText);

    container.setAlpha(0);
    this.tweens.add({
      targets: container,
      alpha: 1,
      scale: { from: 0.5, to: 1 },
      duration: 500,
      ease: "Back.out"
    });

    // Idle pulse on flag
    this.tweens.add({
      targets: [flag, flagText, flagShadow],
      scale: { from: 1, to: 1.06 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut"
    });

    // Glow ring pulse
    this.tweens.add({
      targets: glow,
      scale: { from: 1, to: 1.5 },
      alpha: { from: 0.4, to: 0 },
      duration: 1200,
      repeat: -1,
      ease: "Sine.out"
    });

    this.tutorialNotchContainer = container;
    this.tutorialNotchFlagText = flagText;
    this.tutorialNotchGlow = glow;
    this.tutorialElements.push(container);
  }

  // STEP 5: Animate notch slide with trail
  _step5_AnimateNotchSlide() {
    const str = "Hello";
    const startX = this.tutorialStartX;
    const targetX = startX + str.length * (BOX_WIDTH + BOX_GAP) - BOX_GAP;

    if (!this.tutorialNotchContainer) return;

    // Slide animation
    this.tweens.add({
      targets: this.tutorialNotchContainer,
      x: targetX,
      duration: 3500,
      ease: "Sine.inOut"
    });

    // Trail effect
    const trailEvent = this.time.addEvent({
      delay: 80,
      callback: () => {
        if (!this.tutorialNotchContainer || !this.tutorialNotchContainer.active) return;
        const trail = this.add.circle(
          this.tutorialNotchContainer.x,
          this.tutorialNotchContainer.y - 10,
          4,
          C.primary_purple,
          0.5
        ).setDepth(140);
        this.tweens.add({
          targets: trail,
          alpha: 0,
          scale: { from: 1, to: 2 },
          duration: 600,
          onComplete: () => trail.destroy()
        });
      },
      repeat: 40
    });

    // Equation text
    const eqnTxt = this.add.text(CANVAS.W / 2, 410, 's.length() = 0', {
      fontFamily: "Courier New", fontSize: "22px", color: COLORS.purple_dark, fontStyle: "bold"
    }).setOrigin(0.5).setDepth(100);

    this.tutorialElements.push(eqnTxt);
    this.tutorialEqnTxt = eqnTxt;

    // Update box colors and counter as notch moves
    let lastValue = 0;
    const updateInterval = this.time.addEvent({
      delay: 50,
      callback: () => {
        if (!this.tutorialNotchContainer || !this.tutorialNotchContainer.active || this.phase !== "tutorial") {
          updateInterval.remove();
          return;
        }

        const progress = (this.tutorialNotchContainer.x - startX) / (targetX - startX);
        const newValue = Math.max(0, Math.min(str.length, Math.round(progress * str.length)));

        if (newValue !== lastValue) {
          lastValue = newValue;
          if (this.tutorialNotchFlagText) this.tutorialNotchFlagText.setText(newValue.toString());
          if (eqnTxt && eqnTxt.active) eqnTxt.setText(`s.length() = ${newValue}`);

          // Update box highlights
          this.tutorialBoxRefs.forEach((ref, i) => {
            if (i < newValue) {
              ref.drawBox(C.purple_pale, C.purple_bg, C.primary_purple);
              this.tweens.add({
                targets: [ref.charTxt],
                scale: { from: 1, to: 1.15 },
                yoyo: true,
                duration: 200,
                ease: "Back.out"
              });
            } else {
              ref.drawBox(C.white, C.purple_pale, C.purple_border);
            }
          });
        }
      },
      loop: true
    });

    this.tutorialUpdateEvent = updateInterval;
  }

  // STEP 6: Big celebration
  _step6_SuccessMessage() {
    if (this.tutorialUpdateEvent) this.tutorialUpdateEvent.remove();

    if (this.tutorialEqnTxt && this.tutorialEqnTxt.active) {
      this.tutorialEqnTxt.destroy();
    }

    // Turn boxes green
    this.tutorialBoxRefs.forEach((ref, i) => {
      ref.drawBox(C.success_bg, C.success_bg_dark, C.success_green);
      this.tweens.add({
        targets: [ref.box, ref.charTxt, ref.idxTxt, ref.shadow],
        scale: { from: 1, to: 1.15 },
        y: ref.y - 8,
        yoyo: true,
        duration: 400,
        delay: i * 80,
        ease: "Back.out"
      });
    });

    // Confetti burst
    this._spawnConfetti(CANVAS.W / 2, 200, 40);

    // Final message
    const finalMsg = this.add.text(CANVAS.W / 2, 410, '"Hello".length() = 5', {
      fontFamily: "Courier New", fontSize: "30px", color: COLORS.success_green, fontStyle: "bold"
    }).setOrigin(0.5).setAlpha(0).setDepth(100);

    this.tweens.add({
      targets: finalMsg,
      alpha: 1,
      scale: { from: 0.6, to: 1 },
      duration: 700,
      ease: "Back.out"
    });

    const detail = this.add.text(CANVAS.W / 2, 460, "5 characters total — count INCLUDES every character", {
      fontFamily: "Arial", fontSize: "13px", color: COLORS.text_secondary, fontStyle: "italic"
    }).setOrigin(0.5).setAlpha(0).setDepth(100);

    this.tweens.add({
      targets: detail,
      alpha: 1,
      duration: 600,
      delay: 400
    });

    this.tutorialElements.push(finalMsg, detail);
  }

  // STEP 7: Spaces example with yellow flash
  _step7_ExamplesSpaces() {
    const title = this.add.text(CANVAS.W / 2, 130, 'What about "a b c"?', {
      fontFamily: "Arial", fontSize: "20px", color: COLORS.text_primary, fontStyle: "bold"
    }).setOrigin(0.5).setAlpha(0).setDepth(100);

    this.tweens.add({ targets: title, alpha: 1, y: { from: 110, to: 130 }, duration: 500 });

    const str = "a b c";
    const totalWidth = str.length * 50 + (str.length - 1) * 4;
    const startX = CANVAS.W / 2 - totalWidth / 2 + 25;

    str.split("").forEach((char, i) => {
      const x = startX + i * 54;
      const isSpace = char === " ";
      const display = isSpace ? "␣" : char;

      // Shadow
      const shadow = this.add.graphics().setDepth(99);
      shadow.fillStyle(C.purple_dark, 0.15);
      shadow.fillRoundedRect(x - 22 + 3, 230 + 4, 44, 50, 8);

      const box = this.add.graphics().setDepth(100);
      const drawBox = (fillTop, fillBottom, border) => {
        box.clear();
        box.fillStyle(fillTop, 1);
        box.fillRoundedRect(x - 22, 230, 44, 50, 8);
        box.fillStyle(fillBottom, 0.5);
        box.fillRoundedRect(x - 22, 255, 44, 25, { tl: 0, tr: 0, bl: 8, br: 8 });
        box.lineStyle(2, border, 1);
        box.strokeRoundedRect(x - 22, 230, 44, 50, 8);
      };
      drawBox(C.white, C.purple_pale, C.purple_border);

      const txt = this.add.text(x, 250, display, {
        fontFamily: "Courier New", fontSize: "20px",
        color: isSpace ? COLORS.purple_dark : COLORS.text_primary,
        fontStyle: "bold"
      }).setOrigin(0.5).setDepth(101);

      [shadow, box, txt].forEach(t => { t.setAlpha(0); t.setScale(0); });

      this.tweens.add({
        targets: [shadow, box, txt],
        alpha: 1,
        scale: 1,
        duration: 350,
        delay: 300 + i * 120,
        ease: "Back.out",
        onComplete: () => {
          // Yellow flash for spaces
          if (isSpace) {
            drawBox(0xFFF4CC, C.gold, C.gold);
            this.time.delayedCall(450, () => {
              drawBox(C.white, C.purple_pale, C.purple_border);
            });
          }
        }
      });

      this.tutorialElements.push(shadow, box, txt);
    });

    const answer = this.add.text(CANVAS.W / 2, 360, '"a b c".length() = 5', {
      fontFamily: "Courier New", fontSize: "22px", color: COLORS.success_green, fontStyle: "bold"
    }).setOrigin(0.5).setAlpha(0).setDepth(100);

    const subtitle = this.add.text(CANVAS.W / 2, 395, "Spaces count too! ✨", {
      fontFamily: "Arial", fontSize: "14px", color: COLORS.purple_dark, fontStyle: "italic"
    }).setOrigin(0.5).setAlpha(0).setDepth(100);

    this.tweens.add({
      targets: [answer, subtitle],
      alpha: 1,
      scale: { from: 0.8, to: 1 },
      duration: 500,
      delay: 1200
    });

    this.tutorialElements.push(title, answer, subtitle);
  }

  // STEP 8: Empty string
  _step8_ExamplesEmpty() {
    const title = this.add.text(CANVAS.W / 2, 180, 'And empty string ""?', {
      fontFamily: "Arial", fontSize: "20px", color: COLORS.text_primary, fontStyle: "bold"
    }).setOrigin(0.5).setAlpha(0).setDepth(100);

    this.tweens.add({ targets: title, alpha: 1, y: { from: 160, to: 180 }, duration: 500 });

    const answer = this.add.text(CANVAS.W / 2, 290, '"".length() = 0', {
      fontFamily: "Courier New", fontSize: "32px", color: COLORS.success_green, fontStyle: "bold"
    }).setOrigin(0.5).setAlpha(0).setDepth(100);

    this.tweens.add({
      targets: answer,
      alpha: 1,
      scale: { from: 0.5, to: 1 },
      duration: 700,
      delay: 200,
      ease: "Back.out"
    });

    const detail = this.add.text(CANVAS.W / 2, 350, "No characters → length is 0", {
      fontFamily: "Arial", fontSize: "14px", color: COLORS.text_secondary, fontStyle: "italic"
    }).setOrigin(0.5).setAlpha(0).setDepth(100);

    this.tweens.add({
      targets: detail,
      alpha: 1,
      duration: 600,
      delay: 600
    });

    this.tutorialElements.push(title, answer, detail);
  }

  // STEP 9: Final ready screen with floating button
  _step9_FinalTutorialScreen() {
    const title = this.add.text(CANVAS.W / 2, 200, "Now it's your turn!", {
      fontFamily: "Arial", fontSize: "32px", color: COLORS.purple_dark, fontStyle: "bold"
    }).setOrigin(0.5).setAlpha(0).setDepth(100);

    this.tweens.add({
      targets: title,
      alpha: 1,
      y: { from: 180, to: 200 },
      duration: 600,
      ease: "Back.out"
    });

    const subtitle = this.add.text(CANVAS.W / 2, 270, "Drag the notch to measure each string", {
      fontFamily: "Arial", fontSize: "16px", color: COLORS.text_secondary
    }).setOrigin(0.5).setAlpha(0).setDepth(100);

    this.tweens.add({
      targets: subtitle,
      alpha: 1,
      duration: 500,
      delay: 250
    });

    // Premium "Got it" button
    const btnContainer = this.add.container(CANVAS.W / 2, 380).setDepth(100);

    // Glow ring
    const glow = this.add.circle(0, 0, 130, C.primary_purple, 0.3);
    btnContainer.add(glow);

    this.tweens.add({
      targets: glow,
      scale: { from: 1, to: 1.2 },
      alpha: { from: 0.4, to: 0 },
      duration: 1500,
      repeat: -1
    });

    // Shadow
    const btnShadow = this.add.graphics();
    btnShadow.fillStyle(C.purple_dark, 0.4);
    btnShadow.fillRoundedRect(-130, -22, 260, 56, 28);
    btnShadow.y = 5;
    btnContainer.add(btnShadow);

    // Button bg gradient
    const btnBg = this.add.graphics();
    btnBg.fillStyle(C.purple_light, 1);
    btnBg.fillRoundedRect(-130, -26, 260, 56, 28);
    btnBg.fillStyle(C.primary_purple, 0.7);
    btnBg.fillRoundedRect(-130, 2, 260, 28, { tl: 0, tr: 0, bl: 28, br: 28 });
    btnBg.lineStyle(2, C.purple_dark, 1);
    btnBg.strokeRoundedRect(-130, -26, 260, 56, 28);
    btnContainer.add(btnBg);

    const btnTxt = this.add.text(0, 2, "Got it — let me try! →", {
      fontFamily: "Arial", fontSize: "16px", color: COLORS.white, fontStyle: "bold"
    }).setOrigin(0.5);
    btnContainer.add(btnTxt);

    btnContainer.setSize(260, 56);
    btnContainer.setInteractive({ useHandCursor: true });

    btnContainer.setAlpha(0);
    this.tweens.add({
      targets: btnContainer,
      alpha: 1,
      scale: { from: 0.7, to: 1 },
      duration: 600,
      delay: 500,
      ease: "Back.out"
    });

    // Floating idle motion
    this.tweens.add({
      targets: btnContainer,
      y: { from: 380, to: 372 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut"
    });

    btnContainer.on("pointerover", () => {
      this.tweens.add({ targets: btnContainer, scale: 1.06, duration: 150 });
    });
    btnContainer.on("pointerout", () => {
      this.tweens.add({ targets: btnContainer, scale: 1, duration: 150 });
    });
    btnContainer.on("pointerup", () => {
      this.tweens.add({ targets: btnContainer, scale: 0.95, duration: 80, yoyo: true });
      this.time.delayedCall(160, () => {
        this._clearTutorials();
        this._transitionToGameplay();
      });
    });

    this.tutorialElements.push(title, subtitle, btnContainer);
  }

  _clearTutorials() {
    if (this.tutorialUpdateEvent) {
      this.tutorialUpdateEvent.remove();
      this.tutorialUpdateEvent = null;
    }
    if (this.tutorialElements) {
      this.tutorialElements.forEach(el => {
        if (el && typeof el.destroy === "function") {
          el.destroy();
        }
      });
    }
    this.tutorialElements = [];
    this.tutorialBoxRefs = [];
    if (this.skipButton && this.skipButton.destroy) {
      this.skipButton.destroy();
      this.skipButton = null;
    }
  }

  _transitionToGameplay() {
    this.phase = "gameplay";
    this.currentRound = 0;
    this._setupGameplayRound();
  }

  /* ═════════════════════════════════════════════════════════════════════════
   *  PHASE 2: GAMEPLAY
   * ═════════════════════════════════════════════════════════════════════════ */

  _setupGameplayRound() {
    if (this.currentRound >= ROUNDS.length) {
      this._showResults();
      return;
    }

    this._clearGameplay();

    this.round = ROUNDS[this.currentRound];
    this.userAnswer = null;
    this.feedbackShown = false;

    this._createHUDBar();
    this._createTaskBar();
    this._createGameplayArea();
    this._createGameplayButtons();
  }

  _clearGameplay() {
    if (this.gameplayElements) {
      this.gameplayElements.forEach(el => {
        if (el && typeof el.destroy === "function") {
          el.destroy();
        }
      });
    }
    this.gameplayElements = [];
    this.gameplayBoxRefs = [];
  }

  _createHUDBar() {
    const hudY = 32;

    // Pill shadow
    const shadow = this.add.graphics().setDepth(49);
    shadow.fillStyle(C.purple_dark, 0.15);
    shadow.fillRoundedRect(20, hudY - 18 + 3, CANVAS.W - 40, 44, 22);

    // Main pill
    const pill = this.add.graphics().setDepth(50);
    pill.fillStyle(C.white, 0.92);
    pill.fillRoundedRect(20, hudY - 22, CANVAS.W - 40, 44, 22);
    pill.lineStyle(1, C.purple_border, 1);
    pill.strokeRoundedRect(20, hudY - 22, CANVAS.W - 40, 44, 22);

    // Three stat cards
    const cardW = (CANVAS.W - 80) / 3;
    const cards = [
      { icon: "🎯", label: "ROUND", value: `${this.currentRound + 1}/${ROUNDS.length}` },
      { icon: "⭐", label: "SCORE", value: `${this.score}` },
      { icon: "🔥", label: "STREAK", value: `${this.streak}  ·  Best ${this.bestStreak}` }
    ];

    this.hudTextRefs = {};

    cards.forEach((c, i) => {
      const x = 40 + cardW / 2 + i * cardW;

      const icon = this.add.text(x - 50, hudY, c.icon, {
        fontSize: "18px"
      }).setOrigin(0.5).setDepth(51);

      const label = this.add.text(x - 5, hudY - 8, c.label, {
        fontFamily: "Arial", fontSize: "9px", color: COLORS.text_secondary, fontStyle: "bold"
      }).setOrigin(0, 0.5).setDepth(51);

      const value = this.add.text(x - 5, hudY + 6, c.value, {
        fontFamily: "Arial", fontSize: "13px", color: COLORS.text_primary, fontStyle: "bold"
      }).setOrigin(0, 0.5).setDepth(51);

      this.hudTextRefs[c.label] = { value, icon };
      this.gameplayElements.push(icon, label, value);
    });

    this.gameplayElements.push(shadow, pill);
  }

  _createTaskBar() {
    const y = 95;
    const w = CANVAS.W - 60;

    // Shadow
    const shadow = this.add.graphics().setDepth(49);
    shadow.fillStyle(C.purple_dark, 0.18);
    shadow.fillRoundedRect(30 + 3, y - 25 + 4, w, 50, 12);

    // Background gradient
    const bg = this.add.graphics().setDepth(50);
    bg.fillStyle(C.purple_bg, 1);
    bg.fillRoundedRect(30, y - 25, w, 50, 12);
    bg.fillStyle(C.purple_pale, 0.7);
    bg.fillRoundedRect(30 + w / 2, y - 25, w / 2, 50, { tl: 0, tr: 12, bl: 0, br: 12 });
    bg.lineStyle(1.5, C.primary_purple, 0.8);
    bg.strokeRoundedRect(30, y - 25, w, 50, 12);

    // Left side: MEASURE label + code
    const measureLabel = this.add.text(50, y - 12, "MEASURE", {
      fontFamily: "Arial", fontSize: "9px", color: COLORS.purple_dark, fontStyle: "bold"
    }).setOrigin(0, 0.5).setDepth(51);

    const codeStr = `"${this.round.str}".length()`;
    const codeBg = this.add.graphics().setDepth(50);
    const codeWidth = codeStr.length * 9 + 16;
    codeBg.fillStyle(C.white, 0.7);
    codeBg.fillRoundedRect(46, y + 1, codeWidth, 22, 6);

    const codeTxt = this.add.text(54, y + 12, codeStr, {
      fontFamily: "Courier New", fontSize: "14px", color: COLORS.purple_darker, fontStyle: "bold"
    }).setOrigin(0, 0.5).setDepth(51);

    // Right side: CUT AT
    const cutLabel = this.add.text(CANVAS.W - 50, y - 12, "CUT AT", {
      fontFamily: "Arial", fontSize: "9px", color: COLORS.purple_dark, fontStyle: "bold"
    }).setOrigin(1, 0.5).setDepth(51);

    const cutValue = this.add.text(CANVAS.W - 50, y + 8, "0", {
      fontFamily: "Courier New", fontSize: "26px", color: COLORS.primary_purple, fontStyle: "bold"
    }).setOrigin(1, 0.5).setDepth(51);

    this.cutValueText = cutValue;
    this.gameplayElements.push(shadow, bg, measureLabel, codeBg, codeTxt, cutLabel, cutValue);
  }

  _createGameplayArea() {
    const str = this.round.str;
    const totalWidth = str.length * BOX_WIDTH + (str.length - 1) * BOX_GAP;
    const startX = CANVAS.W / 2 - totalWidth / 2;
    const y = 230;

    this.gameplayBoxRefs = [];
    this.gameplayStartX = startX;
    this.gameplayBoxY = y;

    str.split("").forEach((char, i) => {
      const cx = startX + i * (BOX_WIDTH + BOX_GAP) + BOX_WIDTH / 2;
      const display = char === " " ? "␣" : char;

      const shadow = this.add.graphics().setDepth(99);
      shadow.fillStyle(C.purple_dark, 0.18);
      shadow.fillRoundedRect(cx - BOX_WIDTH / 2 + 3, y - BOX_HEIGHT / 2 + 4, BOX_WIDTH, BOX_HEIGHT, 8);

      const box = this.add.graphics().setDepth(100);
      const drawBox = (fillTop, fillBottom, border) => {
        box.clear();
        box.fillStyle(fillTop, 1);
        box.fillRoundedRect(cx - BOX_WIDTH / 2, y - BOX_HEIGHT / 2, BOX_WIDTH, BOX_HEIGHT, 8);
        box.fillStyle(fillBottom, 0.5);
        box.fillRoundedRect(cx - BOX_WIDTH / 2, y, BOX_WIDTH, BOX_HEIGHT / 2, { tl: 0, tr: 0, bl: 8, br: 8 });
        box.lineStyle(2, border, 1);
        box.strokeRoundedRect(cx - BOX_WIDTH / 2, y - BOX_HEIGHT / 2, BOX_WIDTH, BOX_HEIGHT, 8);
      };
      drawBox(C.white, C.purple_pale, C.purple_border);

      const charTxt = this.add.text(cx, y - 6, display, {
        fontFamily: "Courier New", fontSize: "22px", color: COLORS.text_primary, fontStyle: "bold"
      }).setOrigin(0.5).setDepth(101);

      const idxTxt = this.add.text(cx, y + 22, i.toString(), {
        fontFamily: "Arial", fontSize: "11px", color: COLORS.purple_tinted_gray, fontStyle: "bold"
      }).setOrigin(0.5).setDepth(101);

      // Bounce-in
      [shadow, box, charTxt, idxTxt].forEach(t => { t.setAlpha(0); t.setScale(0); });
      this.tweens.add({
        targets: [shadow, box, charTxt, idxTxt],
        alpha: 1,
        scale: 1,
        duration: 350,
        delay: 100 + i * 80,
        ease: "Back.out"
      });

      this.gameplayBoxRefs.push({ shadow, box, charTxt, idxTxt, x: cx, y, drawBox, char, inRange: false });
      this.gameplayElements.push(shadow, box, charTxt, idxTxt);
    });

    // Ruler
    const rulerY = y + BOX_HEIGHT / 2 + 20;
    const rulerW = (str.length + 1) * BOX_WIDTH + str.length * BOX_GAP;

    const rulerBg = this.add.graphics().setDepth(98);
    rulerBg.fillStyle(C.purple_border, 1);
    rulerBg.fillRoundedRect(startX - BOX_WIDTH / 2, rulerY - 7, rulerW, 14, 4);

    const rulerGroove = this.add.graphics().setDepth(98);
    rulerGroove.fillStyle(C.primary_purple, 0.3);
    rulerGroove.fillRoundedRect(startX - BOX_WIDTH / 2 + 4, rulerY - 2, rulerW - 8, 4, 2);

    rulerBg.setAlpha(0); rulerGroove.setAlpha(0);
    this.tweens.add({
      targets: [rulerBg, rulerGroove],
      alpha: 1,
      duration: 400,
      delay: 100 + str.length * 80
    });

    this.gameplayElements.push(rulerBg, rulerGroove);

    // Ticks and labels
    for (let i = 0; i <= str.length; i++) {
      const tickX = startX + i * (BOX_WIDTH + BOX_GAP) - (i > 0 ? BOX_GAP / 2 : 0) - (i === 0 ? 0 : 0);

      const tick = this.add.graphics().setDepth(99);
      tick.fillStyle(C.primary_purple, 1);
      tick.fillRect(tickX - 1, rulerY - 9, 2, 14);

      const labelBg = this.add.graphics().setDepth(99);
      labelBg.fillStyle(C.white, 0.9);
      labelBg.fillRoundedRect(tickX - 9, rulerY + 12, 18, 16, 8);

      const label = this.add.text(tickX, rulerY + 20, i.toString(), {
        fontFamily: "Arial", fontSize: "11px", color: COLORS.purple_dark, fontStyle: "bold"
      }).setOrigin(0.5).setDepth(100);

      [tick, labelBg, label].forEach(t => t.setAlpha(0));
      this.tweens.add({
        targets: [tick, labelBg, label],
        alpha: 1,
        duration: 250,
        delay: 200 + str.length * 80 + i * 60
      });

      this.gameplayElements.push(tick, labelBg, label);
    }

    // Setup notch positioning
    this.notchMinX = startX - BOX_WIDTH / 2;
    this.notchSlotWidth = BOX_WIDTH + BOX_GAP;
    this.notchMaxX = startX + str.length * (BOX_WIDTH + BOX_GAP) - BOX_GAP - BOX_WIDTH / 2;
    this.notchRulerY = rulerY;

    this._createGameplayNotch();
  }

  _createGameplayNotch() {
    const x = this.notchMinX;
    const y = this.notchRulerY;

    const container = this.add.container(x, y).setDepth(150);

    // Glow ring
    const glow = this.add.circle(0, 0, 32, C.primary_purple, 0.4);
    container.add(glow);

    // Stem
    const stem = this.add.graphics();
    stem.fillStyle(C.purple_dark, 1);
    stem.fillRect(-1.5, -75, 3, 75);
    stem.fillStyle(C.primary_purple, 1);
    stem.fillRect(-1.5, -75, 3, 38);
    container.add(stem);

    // Pivot
    const pivot = this.add.circle(0, 0, 7, C.purple_dark);
    container.add(pivot);
    const pivotInner = this.add.circle(0, 0, 4, C.primary_purple);
    container.add(pivotInner);

    // Flag shadow
    const flagShadow = this.add.graphics();
    flagShadow.fillStyle(C.purple_dark, 0.4);
    flagShadow.fillRoundedRect(-24, -50, 48, 38, { tl: 8, tr: 8, bl: 2, br: 8 });
    flagShadow.y = 4;
    container.add(flagShadow);

    // Flag main
    const flag = this.add.graphics();
    const drawFlag = (topColor, bottomColor, borderColor) => {
      flag.clear();
      flag.fillStyle(topColor, 1);
      flag.fillRoundedRect(-24, -54, 48, 38, { tl: 8, tr: 8, bl: 2, br: 8 });
      flag.fillStyle(bottomColor, 0.7);
      flag.fillRoundedRect(-24, -35, 48, 19, { tl: 0, tr: 0, bl: 2, br: 8 });
      flag.lineStyle(2, borderColor, 1);
      flag.strokeRoundedRect(-24, -54, 48, 38, { tl: 8, tr: 8, bl: 2, br: 8 });
    };
    drawFlag(C.purple_light, C.primary_purple, C.purple_dark);
    container.add(flag);

    // Number text
    const numText = this.add.text(0, -35, "0", {
      fontFamily: "Arial", fontSize: "20px", color: COLORS.white, fontStyle: "bold"
    }).setOrigin(0.5);
    container.add(numText);

    // Make whole notch interactive
    container.setSize(60, 100);
    container.setInteractive({ draggable: true, useHandCursor: true });

    // Idle pulse
    const idlePulse = this.tweens.add({
      targets: [flag, flagShadow, numText],
      scale: { from: 1, to: 1.06 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut"
    });

    // Glow pulse
    const glowPulse = this.tweens.add({
      targets: glow,
      scale: { from: 1, to: 1.5 },
      alpha: { from: 0.5, to: 0 },
      duration: 1200,
      repeat: -1
    });

    // Particle emitter (bottom of notch, when dragging)
    let particleEmitter = null;

    container.on("dragstart", () => {
      idlePulse.pause();
      glowPulse.pause();
      glow.setAlpha(0.6).setScale(1.5);

      // Tilt the flag
      this.tweens.add({
        targets: flag,
        angle: -3,
        duration: 100
      });
      this.tweens.add({
        targets: numText,
        angle: -3,
        duration: 100
      });

      // Start particle emission
      particleEmitter = this.add.particles(0, 0, "particle_circle", {
        x: container.x,
        y: container.y + 5,
        speed: { min: 30, max: 80 },
        angle: { min: 70, max: 110 },
        scale: { start: 0.6, end: 0 },
        alpha: { start: 0.8, end: 0 },
        lifespan: 600,
        gravityY: 100,
        tint: C.primary_purple,
        frequency: 80
      }).setDepth(140);
    });

    container.on("drag", (pointer, dragX) => {
      // Snap to integer position
      const slot = Math.round((dragX - this.notchMinX) / this.notchSlotWidth);
      const clampedSlot = Math.max(0, Math.min(this.round.str.length, slot));
      const newX = this.notchMinX + clampedSlot * this.notchSlotWidth - (clampedSlot > 0 ? BOX_GAP / 2 : 0);

      container.setPosition(newX, this.notchRulerY);

      const value = clampedSlot;

      if (value !== this.userAnswer) {
        // Pop animation on number change
        this.tweens.add({
          targets: numText,
          scale: { from: 1.3, to: 1 },
          duration: 200,
          ease: "Back.out"
        });

        // Pop animation on cut value text
        this.tweens.add({
          targets: this.cutValueText,
          scale: { from: 1.2, to: 1 },
          duration: 200,
          ease: "Back.out"
        });
      }

      this.userAnswer = value;
      numText.setText(value.toString());
      this.cutValueText.setText(value.toString());

      // Update particle emitter position
      if (particleEmitter) {
        particleEmitter.setPosition(newX, this.notchRulerY + 5);
      }

      this._updateBoxColors(value);
    });

    container.on("dragend", () => {
      // Reset tilt
      this.tweens.add({
        targets: [flag, numText],
        angle: 0,
        duration: 150
      });

      // Stop particles
      if (particleEmitter) {
        particleEmitter.stop();
        this.time.delayedCall(700, () => {
          if (particleEmitter) particleEmitter.destroy();
        });
      }

      // Don't restart idle if locked
      if (!this.feedbackShown) {
        glow.setAlpha(0.4);
      }
    });

    this.notchContainer = container;
    this.notchFlag = flag;
    this.notchNumText = numText;
    this.notchGlow = glow;
    this.notchFlagShadow = flagShadow;
    this.notchDrawFlag = drawFlag;
    this.notchIdlePulse = idlePulse;
    this.notchGlowPulse = glowPulse;

    this.gameplayElements.push(container);
  }

  _updateBoxColors(cutValue) {
    this.gameplayBoxRefs.forEach((ref, i) => {
      const shouldBeInRange = i < cutValue;
      if (shouldBeInRange && !ref.inRange) {
        ref.drawBox(C.purple_pale, C.purple_bg, C.primary_purple);
        ref.inRange = true;
        // Pop animation
        this.tweens.add({
          targets: [ref.charTxt],
          scale: { from: 1, to: 1.15 },
          yoyo: true,
          duration: 200,
          ease: "Back.out"
        });
      } else if (!shouldBeInRange && ref.inRange) {
        ref.drawBox(C.white, C.purple_pale, C.purple_border);
        ref.inRange = false;
      }
    });
  }

  _createGameplayButtons() {
    const btnY = CANVAS.H - 60;

    // Reset button (ghost pill)
    const resetContainer = this.add.container(80, btnY).setDepth(100);
    const resetBg = this.add.graphics();
    const drawResetBg = (borderColor, fillAlpha) => {
      resetBg.clear();
      resetBg.fillStyle(C.white, fillAlpha);
      resetBg.fillRoundedRect(-50, -21, 100, 42, 21);
      resetBg.lineStyle(1.5, borderColor, 1);
      resetBg.strokeRoundedRect(-50, -21, 100, 42, 21);
    };
    drawResetBg(C.purple_border, 1);
    resetContainer.add(resetBg);

    const resetTxt = this.add.text(0, 0, "↺ Reset", {
      fontFamily: "Arial", fontSize: "13px", color: COLORS.text_secondary, fontStyle: "bold"
    }).setOrigin(0.5);
    resetContainer.add(resetTxt);

    resetContainer.setSize(100, 42);
    resetContainer.setInteractive({ useHandCursor: true });
    resetContainer.on("pointerover", () => {
      drawResetBg(C.primary_purple, 1);
      resetTxt.setColor(COLORS.purple_dark);
    });
    resetContainer.on("pointerout", () => {
      drawResetBg(C.purple_border, 1);
      resetTxt.setColor(COLORS.text_secondary);
    });
    resetContainer.on("pointerup", () => {
      if (this.feedbackShown) return;
      this.tweens.add({
        targets: resetContainer,
        scale: { from: 0.95, to: 1 },
        duration: 150,
        ease: "Back.out"
      });
      this._resetNotch();
    });

    // Lock button (primary)
    const lockContainer = this.add.container(CANVAS.W - 100, btnY).setDepth(100);

    const lockShadow = this.add.graphics();
    lockShadow.fillStyle(C.purple_dark, 0.4);
    lockShadow.fillRoundedRect(-80, -22, 160, 48, 24);
    lockShadow.y = 4;
    lockContainer.add(lockShadow);

    const lockBg = this.add.graphics();
    const drawLockBg = (a) => {
      lockBg.clear();
      lockBg.fillStyle(C.purple_light, a);
      lockBg.fillRoundedRect(-80, -24, 160, 48, 24);
      lockBg.fillStyle(C.primary_purple, 0.7 * a);
      lockBg.fillRoundedRect(-80, 0, 160, 24, { tl: 0, tr: 0, bl: 24, br: 24 });
      lockBg.lineStyle(2, C.purple_dark, a);
      lockBg.strokeRoundedRect(-80, -24, 160, 48, 24);
    };
    drawLockBg(1);
    lockContainer.add(lockBg);

    const lockTxt = this.add.text(0, 0, "🔒 Lock answer", {
      fontFamily: "Arial", fontSize: "14px", color: COLORS.white, fontStyle: "bold"
    }).setOrigin(0.5);
    lockContainer.add(lockTxt);

    lockContainer.setSize(160, 48);
    lockContainer.setInteractive({ useHandCursor: true });

    lockContainer.on("pointerover", () => {
      this.tweens.add({ targets: lockContainer, scale: 1.05, duration: 150 });
    });
    lockContainer.on("pointerout", () => {
      this.tweens.add({ targets: lockContainer, scale: 1, duration: 150 });
    });
    lockContainer.on("pointerup", () => {
      if (this.feedbackShown || this.userAnswer === null) return;

      // Click squash
      this.tweens.add({
        targets: lockContainer,
        scaleX: 1.05, scaleY: 0.95,
        duration: 80,
        yoyo: true
      });

      // Sparkle burst
      this.add.particles(lockContainer.x, lockContainer.y, "particle_small", {
        speed: { min: 80, max: 150 },
        angle: { min: 240, max: 300 },
        scale: { start: 0.6, end: 0 },
        alpha: { start: 1, end: 0 },
        lifespan: 500,
        tint: [C.gold, C.primary_purple],
        quantity: 8
      }).setDepth(105).explode(8);

      this.time.delayedCall(150, () => this._handleAnswer());
    });

    this.gameplayElements.push(resetContainer, lockContainer);
  }

  _resetNotch() {
    if (this.notchContainer) {
      this.notchContainer.setPosition(this.notchMinX, this.notchRulerY);
      this.notchNumText.setText("0");
      this.cutValueText.setText("0");
      this.userAnswer = 0;
      this.gameplayBoxRefs.forEach(ref => {
        ref.drawBox(C.white, C.purple_pale, C.purple_border);
        ref.inRange = false;
      });
    }
  }

  _handleAnswer() {
    if (this.feedbackShown) return;
    this.feedbackShown = true;

    // Stop notch idle animations
    if (this.notchIdlePulse) this.notchIdlePulse.pause();
    if (this.notchGlowPulse) this.notchGlowPulse.pause();
    if (this.notchGlow) this.notchGlow.setAlpha(0);

    // Disable notch dragging
    if (this.notchContainer) this.notchContainer.disableInteractive();

    const isCorrect = this.userAnswer === this.round.length;

    if (isCorrect) {
      this._showCorrectFeedback();
    } else {
      this._showWrongFeedback();
    }
  }

  _showCorrectFeedback() {
    this.correctRounds++;
    this.streak++;
    if (this.streak > this.bestStreak) this.bestStreak = this.streak;

    const points = 100 + (this.streak >= 3 ? 50 : 0);
    this.score += points;

    // Animate HUD updates
    this._updateHUD();

    // Turn boxes green with celebration tween
    this.gameplayBoxRefs.forEach((ref, i) => {
      this.time.delayedCall(i * 80, () => {
        ref.drawBox(C.success_bg, C.success_bg_dark, C.success_green);
        this.tweens.add({
          targets: [ref.charTxt, ref.idxTxt],
          scale: { from: 1, to: 1.2 },
          y: ref.y - 8,
          yoyo: true,
          duration: 350,
          ease: "Back.out"
        });
      });
    });

    // Turn notch green
    this.notchDrawFlag(0x4CC994, C.success_green, C.success_green_dark);
    this.notchFlagShadow.clear();
    this.notchFlagShadow.fillStyle(C.success_green_dark, 0.4);
    this.notchFlagShadow.fillRoundedRect(-24, -50, 48, 38, { tl: 8, tr: 8, bl: 2, br: 8 });

    // Notch celebration scale
    this.tweens.add({
      targets: this.notchContainer,
      scale: { from: 1, to: 1.3 },
      yoyo: true,
      duration: 400,
      ease: "Back.out"
    });

    // Celebration ring
    const ring = this.add.circle(this.notchContainer.x, this.notchContainer.y, 20, C.success_green, 0.6).setDepth(140);
    this.tweens.add({
      targets: ring,
      scale: 4,
      alpha: 0,
      duration: 700,
      ease: "Cubic.out",
      onComplete: () => ring.destroy()
    });

    // Particle burst
    this.add.particles(this.notchContainer.x, this.notchContainer.y, "particle_circle", {
      speed: { min: 100, max: 250 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 1000,
      gravityY: 40,
      tint: [C.success_green, 0x7FCFA3, C.gold],
      quantity: 25
    }).setDepth(160).explode(25);

    // Confetti rain from top
    this._spawnConfetti(CANVAS.W / 2, 0, 30);

    // Feedback panel
    this.time.delayedCall(400, () => this._showFeedbackPanel(true, points));
  }

  _showWrongFeedback() {
    this.streak = 0;
    this._updateHUD();

    // Turn notch red
    this.notchDrawFlag(0xF07A78, C.error_red, C.error_red_dark);
    this.notchFlagShadow.clear();
    this.notchFlagShadow.fillStyle(C.error_red_dark, 0.4);
    this.notchFlagShadow.fillRoundedRect(-24, -50, 48, 38, { tl: 8, tr: 8, bl: 2, br: 8 });

    // Shake notch
    const origX = this.notchContainer.x;
    this.tweens.add({
      targets: this.notchContainer,
      x: origX + 6,
      duration: 60,
      yoyo: true,
      repeat: 3,
      onComplete: () => this.notchContainer.setX(origX)
    });

    // Camera shake (subtle)
    this.cameras.main.shake(250, 0.004);

    // Red dust particles
    this.add.particles(this.notchContainer.x, this.notchContainer.y, "particle_circle", {
      speed: { min: 30, max: 80 },
      angle: { min: 70, max: 110 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 800,
      gravityY: 80,
      tint: C.error_red,
      quantity: 8
    }).setDepth(160).explode(8);

    // Feedback panel
    this.time.delayedCall(300, () => this._showFeedbackPanel(false));
  }

  _showFeedbackPanel(isCorrect, points = 0) {
    const panelY = 430;
    const container = this.add.container(CANVAS.W / 2, panelY).setDepth(200);

    const w = 500;
    const h = 130;

    // Shadow
    const shadow = this.add.graphics();
    shadow.fillStyle(C.purple_dark, 0.3);
    shadow.fillRoundedRect(-w / 2 + 3, -h / 2 + 5, w, h, 16);
    container.add(shadow);

    // Background gradient
    const bg = this.add.graphics();
    if (isCorrect) {
      bg.fillStyle(C.success_bg, 1);
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, 16);
      bg.fillStyle(C.success_bg_dark, 0.6);
      bg.fillRoundedRect(-w / 2, 0, w, h / 2, { tl: 0, tr: 0, bl: 16, br: 16 });
      bg.lineStyle(2, C.success_green, 1);
    } else {
      bg.fillStyle(C.error_bg, 1);
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, 16);
      bg.fillStyle(C.error_bg_dark, 0.6);
      bg.fillRoundedRect(-w / 2, 0, w, h / 2, { tl: 0, tr: 0, bl: 16, br: 16 });
      bg.lineStyle(2, C.error_red, 1);
    }
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 16);
    container.add(bg);

    if (isCorrect) {
      const title = this.add.text(0, -40, "🎉 Correct!", {
        fontFamily: "Arial", fontSize: "26px", color: COLORS.success_green, fontStyle: "bold"
      }).setOrigin(0.5);
      container.add(title);

      const msg = this.add.text(0, 0, `"${this.round.str}" has ${this.round.length} characters`, {
        fontFamily: "Arial", fontSize: "14px", color: COLORS.text_primary
      }).setOrigin(0.5);
      container.add(msg);

      const points_text = this.add.text(0, 25, `+${points} points${this.streak >= 3 ? " (streak bonus!)" : ""}`, {
        fontFamily: "Arial", fontSize: "13px", color: COLORS.success_green, fontStyle: "bold"
      }).setOrigin(0.5);
      container.add(points_text);

      if (this.round.str.includes(" ")) {
        const hint = this.add.text(0, 48, "Notice: spaces count too! ✨", {
          fontFamily: "Arial", fontSize: "12px", color: COLORS.text_secondary, fontStyle: "italic"
        }).setOrigin(0.5);
        container.add(hint);
      }
    } else {
      const title = this.add.text(0, -40, "💭 Off the mark!", {
        fontFamily: "Arial", fontSize: "24px", color: COLORS.error_red_dark, fontStyle: "bold"
      }).setOrigin(0.5);
      container.add(title);

      const msg = this.add.text(0, -5, `Real length: ${this.round.length}  ·  You measured: ${this.userAnswer}`, {
        fontFamily: "Courier New", fontSize: "14px", color: COLORS.text_primary, fontStyle: "bold"
      }).setOrigin(0.5);
      container.add(msg);

      let hint = "";
      if (this.userAnswer === this.round.length - 1) {
        hint = "So close — length counts the total, not the last index";
      } else if (this.userAnswer === this.round.length + 1) {
        hint = "One too many — count again carefully";
      } else if (this.round.str.includes(" ")) {
        hint = "Tip: don't skip the spaces — they count too!";
      } else {
        hint = "Take another look — count each character one by one";
      }

      const hintTxt = this.add.text(0, 30, hint, {
        fontFamily: "Arial", fontSize: "12px", color: COLORS.text_secondary, fontStyle: "italic",
        wordWrap: { width: w - 40 }
      }).setOrigin(0.5);
      container.add(hintTxt);
    }

    container.setAlpha(0).setScale(isCorrect ? 0.7 : 0.9);
    this.tweens.add({
      targets: container,
      alpha: 1,
      scale: 1,
      duration: isCorrect ? 600 : 400,
      ease: isCorrect ? "Back.out" : "Cubic.out"
    });

    this.feedbackPanel = container;
    this.gameplayElements.push(container);

    // Show next button
    this.time.delayedCall(700, () => this._createNextButton());
  }

  _createNextButton() {
    const isLast = this.currentRound >= ROUNDS.length - 1;
    const btnY = CANVAS.H - 130;

    const container = this.add.container(CANVAS.W / 2, btnY).setDepth(105);

    // Glow ring
    const glow = this.add.circle(0, 0, 110, C.primary_purple, 0.3);
    container.add(glow);
    this.tweens.add({
      targets: glow,
      scale: { from: 1, to: 1.2 },
      alpha: { from: 0.4, to: 0 },
      duration: 1500,
      repeat: -1
    });

    // Shadow
    const shadow = this.add.graphics();
    shadow.fillStyle(C.purple_dark, 0.4);
    shadow.fillRoundedRect(-100, -24, 200, 52, 26);
    shadow.y = 5;
    container.add(shadow);

    // Bg gradient
    const bg = this.add.graphics();
    bg.fillStyle(C.purple_light, 1);
    bg.fillRoundedRect(-100, -26, 200, 52, 26);
    bg.fillStyle(C.primary_purple, 0.7);
    bg.fillRoundedRect(-100, 0, 200, 26, { tl: 0, tr: 0, bl: 26, br: 26 });
    bg.lineStyle(2, C.purple_dark, 1);
    bg.strokeRoundedRect(-100, -26, 200, 52, 26);
    container.add(bg);

    const txt = this.add.text(-10, 0, isLast ? "See results" : "Next round", {
      fontFamily: "Arial", fontSize: "15px", color: COLORS.white, fontStyle: "bold"
    }).setOrigin(0.5);
    container.add(txt);

    const arrow = this.add.text(60, 0, "→", {
      fontFamily: "Arial", fontSize: "18px", color: COLORS.white, fontStyle: "bold"
    }).setOrigin(0.5);
    container.add(arrow);

    // Arrow slide animation
    this.tweens.add({
      targets: arrow,
      x: { from: 60, to: 66 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut"
    });

    container.setSize(200, 52);
    container.setInteractive({ useHandCursor: true });

    container.setAlpha(0).setScale(0.7);
    this.tweens.add({
      targets: container,
      alpha: 1,
      scale: 1,
      duration: 500,
      ease: "Back.out"
    });

    container.on("pointerover", () => {
      this.tweens.add({ targets: container, scale: 1.06, duration: 150 });
    });
    container.on("pointerout", () => {
      this.tweens.add({ targets: container, scale: 1, duration: 150 });
    });
    container.on("pointerup", () => {
      this.tweens.add({
        targets: container,
        scale: 0.95,
        duration: 80,
        yoyo: true,
        onComplete: () => {
          this.currentRound++;
          this._setupGameplayRound();
        }
      });
    });

    this.gameplayElements.push(container);
  }

  _updateHUD() {
    if (!this.hudTextRefs) return;

    if (this.hudTextRefs.SCORE) {
      this.hudTextRefs.SCORE.value.setText(`${this.score}`);
      this.tweens.add({
        targets: this.hudTextRefs.SCORE.value,
        scale: { from: 1.3, to: 1 },
        duration: 400,
        ease: "Back.out"
      });
      // Golden flash
      this.hudTextRefs.SCORE.value.setColor("#FFD700");
      this.time.delayedCall(400, () => {
        this.hudTextRefs.SCORE.value.setColor(COLORS.text_primary);
      });
    }

    if (this.hudTextRefs.STREAK) {
      this.hudTextRefs.STREAK.value.setText(`${this.streak}  ·  Best ${this.bestStreak}`);
      // Flame bounce
      this.tweens.add({
        targets: this.hudTextRefs.STREAK.icon,
        angle: { from: -15, to: 15 },
        duration: 200,
        yoyo: true,
        ease: "Sine.inOut"
      });
    }
  }

  _spawnConfetti(x, y, count = 20) {
    const colors = [C.gold, C.primary_purple, C.success_green, C.confetti_pink, C.confetti_purple];
    for (let i = 0; i < count; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const px = x + (Math.random() - 0.5) * 100;
      const py = y;

      const confetti = this.add.rectangle(px, py, 6, 10, color).setDepth(170);
      confetti.setRotation(Math.random() * Math.PI * 2);

      this.tweens.add({
        targets: confetti,
        y: py + 400 + Math.random() * 200,
        x: px + (Math.random() - 0.5) * 200,
        rotation: confetti.rotation + Math.PI * 4,
        alpha: { from: 1, to: 0 },
        duration: 2000 + Math.random() * 1500,
        ease: "Cubic.in",
        onComplete: () => confetti.destroy()
      });
    }
  }

  /* ═════════════════════════════════════════════════════════════════════════
   *  RESULTS SCREEN
   * ═════════════════════════════════════════════════════════════════════════ */

  _showResults() {
    this._clearGameplay();

    // Dark overlay
    const overlay = this.add.rectangle(CANVAS.W / 2, CANVAS.H / 2, CANVAS.W, CANVAS.H, 0x1a1a3e, 0.6).setDepth(200);

    // Starry effect
    for (let i = 0; i < 50; i++) {
      const star = this.add.circle(
        Math.random() * CANVAS.W,
        Math.random() * CANVAS.H,
        Math.random() * 2 + 1,
        0xFFFFFF,
        0.6
      ).setDepth(201);
      this.tweens.add({
        targets: star,
        alpha: { from: 0.3, to: 0.9 },
        duration: 1500 + Math.random() * 1500,
        yoyo: true,
        repeat: -1
      });
      this.gameplayElements.push(star);
    }

    // Results panel
    const panelContainer = this.add.container(CANVAS.W / 2, CANVAS.H / 2).setDepth(202);

    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.5);
    shadow.fillRoundedRect(-300 + 5, -240 + 8, 600, 480, 20);
    panelContainer.add(shadow);

    const bg = this.add.graphics();
    bg.fillStyle(C.bg_bottom, 1);
    bg.fillRoundedRect(-300, -240, 600, 480, 20);
    bg.fillStyle(C.bg_top, 0.8);
    bg.fillRoundedRect(-300, 0, 600, 240, { tl: 0, tr: 0, bl: 20, br: 20 });
    bg.lineStyle(2, C.primary_purple, 1);
    bg.strokeRoundedRect(-300, -240, 600, 480, 20);
    panelContainer.add(bg);

    // Title
    const title = this.add.text(0, -180, "🏆  Level Complete!  🏆", {
      fontFamily: "Arial", fontSize: "32px", color: COLORS.purple_dark, fontStyle: "bold"
    }).setOrigin(0.5);
    panelContainer.add(title);

    panelContainer.setAlpha(0).setScale(0.7);
    this.tweens.add({
      targets: panelContainer,
      alpha: 1,
      scale: 1,
      duration: 700,
      ease: "Back.out"
    });

    const accuracy = Math.round((this.correctRounds / ROUNDS.length) * 100);
    const stats = [
      { icon: "⭐", label: "Score", value: this.score, animated: true },
      { icon: "🎯", label: "Accuracy", value: `${accuracy}%`, animated: false },
      { icon: "🔥", label: "Best Streak", value: `${this.bestStreak}×`, animated: false }
    ];

    stats.forEach((stat, i) => {
      const yOffset = -90 + i * 60;
      const row = this.add.container(0, yOffset);

      const icon = this.add.text(-180, 0, stat.icon, { fontSize: "28px" }).setOrigin(0.5);
      const label = this.add.text(-130, 0, stat.label, {
        fontFamily: "Arial", fontSize: "16px", color: COLORS.text_secondary
      }).setOrigin(0, 0.5);
      const value = this.add.text(180, 0, stat.animated ? "0" : `${stat.value}`, {
        fontFamily: "Arial", fontSize: "28px", color: COLORS.purple_dark, fontStyle: "bold"
      }).setOrigin(1, 0.5);

      row.add(icon);
      row.add(label);
      row.add(value);

      row.setAlpha(0).setX(-100);
      this.tweens.add({
        targets: row,
        alpha: 1,
        x: 0,
        duration: 500,
        delay: 800 + i * 200,
        ease: "Cubic.out"
      });

      // Animated count up for score
      if (stat.animated) {
        this.time.delayedCall(800 + i * 200, () => {
          this.tweens.addCounter({
            from: 0,
            to: stat.value,
            duration: 1500,
            ease: "Cubic.out",
            onUpdate: tween => {
              value.setText(Math.floor(tween.getValue()).toString());
            }
          });
        });
      }

      panelContainer.add(row);
    });

    // Play again button
    const playAgainContainer = this.add.container(0, 170).setDepth(203);

    const paShadow = this.add.graphics();
    paShadow.fillStyle(C.purple_dark, 0.4);
    paShadow.fillRoundedRect(-110, -22, 220, 52, 26);
    paShadow.y = 4;
    playAgainContainer.add(paShadow);

    const paBg = this.add.graphics();
    paBg.fillStyle(C.purple_light, 1);
    paBg.fillRoundedRect(-110, -26, 220, 52, 26);
    paBg.fillStyle(C.primary_purple, 0.7);
    paBg.fillRoundedRect(-110, 0, 220, 26, { tl: 0, tr: 0, bl: 26, br: 26 });
    paBg.lineStyle(2, C.purple_dark, 1);
    paBg.strokeRoundedRect(-110, -26, 220, 52, 26);
    playAgainContainer.add(paBg);

    const paTxt = this.add.text(0, 0, "↻  Play Again", {
      fontFamily: "Arial", fontSize: "16px", color: COLORS.white, fontStyle: "bold"
    }).setOrigin(0.5);
    playAgainContainer.add(paTxt);

    playAgainContainer.setSize(220, 52);
    playAgainContainer.setInteractive({ useHandCursor: true });

    playAgainContainer.setAlpha(0).setScale(0.7);
    this.tweens.add({
      targets: playAgainContainer,
      alpha: 1,
      scale: 1,
      duration: 500,
      delay: 1500,
      ease: "Back.out"
    });

    playAgainContainer.on("pointerover", () => {
      this.tweens.add({ targets: playAgainContainer, scale: 1.06, duration: 150 });
    });
    playAgainContainer.on("pointerout", () => {
      this.tweens.add({ targets: playAgainContainer, scale: 1, duration: 150 });
    });
    playAgainContainer.on("pointerup", () => {
      this.scene.restart();
    });

    panelContainer.add(playAgainContainer);

    // Continuous confetti
    this.confettiInterval = this.time.addEvent({
      delay: 300,
      callback: () => this._spawnConfetti(Math.random() * CANVAS.W, -10, 5),
      loop: true
    });

    this.gameplayElements.push(overlay, panelContainer);
  }
}