/**
 * Level1Scene — "Integer Discovery Zone" (Accretion Phase)
 * =========================================================
 * Mechanic: Number Sorting Puzzle
 * - Numbers fall from top, player clicks to select, then clicks a zone
 * - 3 zones: Positive (+), Negative (−), Zero (0)
 * - 20 numbers total, need 80% accuracy (16/20) to pass
 */

import Phaser from "phaser";
import { GameManager } from "../GameManager.js";
import { BadgeSystem } from "../BadgeSystem.js";
import { ProgressTracker } from "../ProgressTracker.js";
import { ErrorFeedback } from "../ErrorFeedback.js";

export class Level1Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level1Scene" });
  }

  create() {
    this.cameras.main.setBackgroundColor("#0f172a");

    // ── Generate spark texture ──
    if (!this.textures.exists("spark")) {
      const g = this.add.graphics();
      g.fillStyle(0x4ade80, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("spark", 8, 8);
      g.destroy();
    }

    this.successParticles = this.add.particles(0, 0, "spark", {
      speed: { min: 50, max: 200 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 800,
      blendMode: "ADD",
      emitting: false,
    });

    // ── Error Feedback ──
    this.errorFeedback = new ErrorFeedback(this);

    // ── State ──
    this.totalNumbers = 20;
    this.currentIndex = 0;
    this.correct = 0;
    this.wrong = 0;
    this.selectedNumber = null;
    this.isComplete = false;

    // Update UIScene label
    const uiScene = this.scene.get("UIScene");
    if (uiScene && uiScene.setLevelLabel) {
      uiScene.setLevelLabel("Level 1: Accretion — Sort the Integers!");
    }

    // ── Generate number pool ──
    this.numberPool = this._generateNumberPool();

    // ── Instruction overlay ──
    this._showInstruction();
  }

  _generateNumberPool() {
    const pool = [];
    // Ensure at least 4 negatives, 4 positives, 2 zeros, rest random
    for (let i = 0; i < 4; i++) pool.push(Phaser.Math.Between(-50, -1));
    for (let i = 0; i < 4; i++) pool.push(Phaser.Math.Between(1, 50));
    pool.push(0, 0);
    while (pool.length < this.totalNumbers) {
      pool.push(Phaser.Math.Between(-50, 50));
    }
    Phaser.Utils.Array.Shuffle(pool);
    return pool;
  }

  _showInstruction() {
    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.88).setDepth(200);
    const panel = this.add.rectangle(400, 280, 620, 380, 0x111827, 1).setDepth(201);
    panel.setStrokeStyle(3, 0x4ade80);

    const title = this.add.text(400, 130, "MISSION 1: INTEGER DISCOVERY", {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: "28px",
      color: "#4ade80",
      fontStyle: "bold",
      shadow: { blur: 12, color: "#4ade80", fill: true },
    }).setOrigin(0.5).setDepth(202);

    const desc = this.add.text(400, 210, "Integers are whole numbers: positive, negative, or zero.\n\nClick a falling number to select it,\nthen click the correct zone to sort it!", {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: "18px",
      color: "#cbd5e1",
      align: "center",
      lineSpacing: 8,
    }).setOrigin(0.5).setDepth(202);

    const hint = this.add.text(400, 320, "Sort 20 numbers with 80% accuracy to earn\nthe Integer Explorer badge! 🏆", {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: "16px",
      color: "#fbbf24",
      align: "center",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(202);

    const btn = this.add.text(400, 410, "START SORTING", {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: "24px",
      color: "#ffffff",
      backgroundColor: "#2563eb",
      padding: { x: 30, y: 14 },
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(202).setInteractive({ useHandCursor: true });

    btn.on("pointerover", () => btn.setBackgroundColor("#1d4ed8"));
    btn.on("pointerout", () => btn.setBackgroundColor("#2563eb"));
    btn.on("pointerup", () => {
      [overlay, panel, title, desc, hint, btn].forEach(e => e.destroy());
      this._startGame();
    });
  }

  _startGame() {
    // ── Sorting Zones ──
    this._createZones();

    // ── Progress display ──
    this.progressText = this.add.text(400, 575, "0 / 20", {
      fontFamily: "monospace",
      fontSize: "16px",
      color: "#64748b",
    }).setOrigin(0.5).setDepth(10);

    // ── Spawn first number ──
    this._spawnNumber();
  }

  _createZones() {
    const zoneY = 500;
    const zoneW = 220;
    const zoneH = 90;

    // NEGATIVE zone (left)
    this.negativeZone = this.add.rectangle(130, zoneY, zoneW, zoneH, 0x7f1d1d, 0.7);
    this.negativeZone.setStrokeStyle(2, 0xef4444);
    this.negativeZone.setInteractive({ useHandCursor: true });
    this.add.text(130, zoneY - 15, "NEGATIVE (−)", {
      fontFamily: "Inter, Arial, sans-serif", fontSize: "16px",
      color: "#fca5a5", fontStyle: "bold",
    }).setOrigin(0.5);
    this.add.text(130, zoneY + 15, "< 0", {
      fontFamily: "monospace", fontSize: "20px", color: "#f87171",
    }).setOrigin(0.5);
    this.negativeZone.on("pointerup", () => this._sortTo("negative"));

    // ZERO zone (center)
    this.zeroZone = this.add.rectangle(400, zoneY, zoneW, zoneH, 0x1e3a5f, 0.7);
    this.zeroZone.setStrokeStyle(2, 0x38bdf8);
    this.zeroZone.setInteractive({ useHandCursor: true });
    this.add.text(400, zoneY - 15, "ZERO (0)", {
      fontFamily: "Inter, Arial, sans-serif", fontSize: "16px",
      color: "#7dd3fc", fontStyle: "bold",
    }).setOrigin(0.5);
    this.add.text(400, zoneY + 15, "= 0", {
      fontFamily: "monospace", fontSize: "20px", color: "#38bdf8",
    }).setOrigin(0.5);
    this.zeroZone.on("pointerup", () => this._sortTo("zero"));

    // POSITIVE zone (right)
    this.positiveZone = this.add.rectangle(670, zoneY, zoneW, zoneH, 0x14532d, 0.7);
    this.positiveZone.setStrokeStyle(2, 0x4ade80);
    this.positiveZone.setInteractive({ useHandCursor: true });
    this.add.text(670, zoneY - 15, "POSITIVE (+)", {
      fontFamily: "Inter, Arial, sans-serif", fontSize: "16px",
      color: "#86efac", fontStyle: "bold",
    }).setOrigin(0.5);
    this.add.text(670, zoneY + 15, "> 0", {
      fontFamily: "monospace", fontSize: "20px", color: "#4ade80",
    }).setOrigin(0.5);
    this.positiveZone.on("pointerup", () => this._sortTo("positive"));
  }

  _spawnNumber() {
    if (this.currentIndex >= this.totalNumbers) {
      this._endLevel();
      return;
    }

    const val = this.numberPool[this.currentIndex];
    const x = Phaser.Math.Between(150, 650);

    // Number display (clickable)
    const bg = this.add.rectangle(x, 80, 100, 60, 0x1e293b, 0.95).setStrokeStyle(2, 0x475569);
    const txt = this.add.text(x, 80, val.toString(), {
      fontFamily: "monospace",
      fontSize: "28px",
      color: "#e2e8f0",
      fontStyle: "bold",
    }).setOrigin(0.5);

    // Selection highlight
    const highlight = this.add.rectangle(x, 80, 108, 68, 0x38bdf8, 0).setStrokeStyle(3, 0x38bdf8);
    highlight.setAlpha(0);

    bg.setInteractive({ useHandCursor: true });

    bg.on("pointerup", () => {
      this.selectedNumber = { val, bg, txt, highlight };
      highlight.setAlpha(1);

      // Pulse animation
      this.tweens.add({
        targets: highlight,
        alpha: 0.5,
        yoyo: true,
        repeat: -1,
        duration: 400,
      });
    });

    // Float down slowly
    this.tweens.add({
      targets: [bg, txt, highlight],
      y: 350,
      duration: 8000,
      ease: "Linear",
      onComplete: () => {
        // If not sorted in time, count as miss
        if (this.selectedNumber && this.selectedNumber.bg === bg) {
          this.selectedNumber = null;
        }
        if (bg.active) {
          this.wrong++;
          this._flashZoneError();
          bg.destroy();
          txt.destroy();
          highlight.destroy();
          this.currentIndex++;
          this._updateProgressDisplay();
          this._spawnNumber();
        }
      },
    });
  }

  _sortTo(zone) {
    if (!this.selectedNumber || this.isComplete) return;

    const { val, bg, txt, highlight } = this.selectedNumber;
    this.selectedNumber = null;

    // Determine correct zone
    let correctZone;
    if (val > 0) correctZone = "positive";
    else if (val < 0) correctZone = "negative";
    else correctZone = "zero";

    // Stop tweens on the number
    this.tweens.killTweensOf([bg, txt, highlight]);

    const isCorrect = zone === correctZone;

    if (isCorrect) {
      // ── Correct! ──
      this.correct++;
      GameManager.addXP(50 * GameManager.getComboMultiplier());
      GameManager.addScore(50);
      GameManager.addCombo();

      this.successParticles.emitParticleAt(bg.x, bg.y, 20);
      this.errorFeedback.showSuccess(`✓ Correct! ${val} is ${correctZone}`, 1200);

      // Fly to correct zone
      const targetX = zone === "negative" ? 130 : (zone === "zero" ? 400 : 670);
      this.tweens.add({
        targets: [bg, txt, highlight],
        x: targetX,
        y: 500,
        alpha: 0,
        scale: 0.5,
        duration: 400,
        ease: "Cubic.in",
        onComplete: () => {
          bg.destroy();
          txt.destroy();
          highlight.destroy();
        },
      });
    } else {
      // ── Wrong! ──
      this.wrong++;
      GameManager.resetCombo();
      const remaining = this.errorFeedback.show(
        `✗ Wrong! ${val} is ${correctZone}, not ${zone}!`
      );

      // Shake the number
      this.tweens.add({
        targets: [bg, txt],
        x: bg.x + 10,
        yoyo: true,
        repeat: 3,
        duration: 50,
        onComplete: () => {
          bg.destroy();
          txt.destroy();
          highlight.destroy();
        },
      });

      if (remaining <= 0) {
        this._gameOver();
        return;
      }
    }

    this.currentIndex++;
    this._updateProgressDisplay();

    // Small delay before next spawn
    this.time.delayedCall(600, () => {
      if (!this.isComplete) this._spawnNumber();
    });
  }

  _updateProgressDisplay() {
    if (this.progressText && this.progressText.active) {
      this.progressText.setText(`${this.currentIndex} / ${this.totalNumbers}  |  ✓${this.correct}  ✗${this.wrong}`);
    }
  }

  _flashZoneError() {
    this.cameras.main.flash(150, 255, 100, 0);
  }

  _endLevel() {
    this.isComplete = true;
    const accuracy = Math.round((this.correct / this.totalNumbers) * 100);
    const passed = accuracy >= 80;

    if (passed) {
      GameManager.completeLevel(0, accuracy);
      BadgeSystem.unlock("integer_explorer");
      ProgressTracker.saveProgress(GameManager.getState());

      this.cameras.main.flash(500, 100, 255, 100);

      this._showEndScreen(
        "LEVEL 1 COMPLETE!",
        `Accuracy: ${accuracy}%  (${this.correct}/${this.totalNumbers})`,
        "#4ade80",
        "CONTINUE TO LEVEL 2",
        () => {
          this.scene.stop("UIScene");
          this.scene.start("MenuScene");
        }
      );
    } else {
      this._showEndScreen(
        "NOT ENOUGH ACCURACY",
        `You got ${accuracy}% but need 80%.\n${this.correct}/${this.totalNumbers} correct.`,
        "#ef4444",
        "TRY AGAIN",
        () => {
          GameManager.resetLevel();
          this.scene.restart();
        }
      );
    }
  }

  _gameOver() {
    this.isComplete = true;
    this._showEndScreen(
      "GAME OVER",
      "You ran out of lives!",
      "#ef4444",
      "RETRY",
      () => {
        GameManager.resetLevel();
        this.scene.restart();
      }
    );
  }

  _showEndScreen(title, body, color, btnText, btnAction) {
    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.85).setDepth(200);
    const titleObj = this.add.text(400, 220, title, {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: "36px",
      color,
      fontStyle: "bold",
      align: "center",
      shadow: { blur: 15, color, fill: true },
    }).setOrigin(0.5).setDepth(201);

    const bodyObj = this.add.text(400, 300, body, {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: "20px",
      color: "#cbd5e1",
      align: "center",
      lineSpacing: 6,
    }).setOrigin(0.5).setDepth(201);

    const btn = this.add.text(400, 400, btnText, {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: "24px",
      color: "#ffffff",
      backgroundColor: "#2563eb",
      padding: { x: 30, y: 14 },
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(201).setInteractive({ useHandCursor: true });

    btn.on("pointerover", () => btn.setBackgroundColor("#1d4ed8"));
    btn.on("pointerout", () => btn.setBackgroundColor("#2563eb"));
    btn.on("pointerup", btnAction);
  }

  shutdown() {
    if (this.errorFeedback) this.errorFeedback.destroy();
  }
}
