/**
 * Level2Scene — "Integer Operations Arena" (Tuning Phase)
 * ========================================================
 * Mechanic: Math Combat System
 * - Enemy robots appear with two integer operands
 * - Player selects operation (+, −, ×) then picks correct answer
 * - 15 rounds, combo multiplier, time bonus
 * - Code simulation panel shows real-time int expressions
 */

import Phaser from "phaser";
import { GameManager } from "../GameManager.js";
import { BadgeSystem } from "../BadgeSystem.js";
import { ProgressTracker } from "../ProgressTracker.js";
import { ErrorFeedback } from "../ErrorFeedback.js";

export class Level2Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level2Scene" });
  }

  create() {
    this.cameras.main.setBackgroundColor("#0f172a");

    // Spark texture
    if (!this.textures.exists("spark")) {
      const g = this.add.graphics();
      g.fillStyle(0xf59e0b, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("spark", 8, 8);
      g.destroy();
    }

    this.successParticles = this.add.particles(0, 0, "spark", {
      speed: { min: 80, max: 250 },
      scale: { start: 1.2, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 600,
      blendMode: "ADD",
      emitting: false,
    });

    this.errorFeedback = new ErrorFeedback(this);

    // ── State ──
    this.totalRounds = 15;
    this.currentRound = 0;
    this.correctCount = 0;
    this.isComplete = false;
    this.roundActive = false;
    this.roundStartTime = 0;

    // ── UI elements that get recreated each round ──
    this.roundElements = [];

    // UIScene label
    const uiScene = this.scene.get("UIScene");
    if (uiScene && uiScene.setLevelLabel) {
      uiScene.setLevelLabel("Level 2: Tuning — Math Combat!");
    }

    // ── Show instruction ──
    this._showInstruction();
  }

  _showInstruction() {
    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.88).setDepth(200);
    const panel = this.add.rectangle(400, 280, 620, 400, 0x111827, 1).setDepth(201);
    panel.setStrokeStyle(3, 0xf59e0b);

    const title = this.add.text(400, 120, "MISSION 2: MATH COMBAT", {
      fontFamily: "Inter, Arial, sans-serif", fontSize: "28px",
      color: "#f59e0b", fontStyle: "bold",
      shadow: { blur: 12, color: "#f59e0b", fill: true },
    }).setOrigin(0.5).setDepth(202);

    const desc = this.add.text(400, 210, "Enemy robots challenge you with integer math!\n\n1. See two numbers on the enemy\n2. Choose the operation: + , − , or ×\n3. Pick the correct result to defeat them!", {
      fontFamily: "Inter, Arial, sans-serif", fontSize: "16px",
      color: "#cbd5e1", align: "center", lineSpacing: 8,
    }).setOrigin(0.5).setDepth(202);

    const hint = this.add.text(400, 340, "Defeat 15 enemies to earn\nthe Math Warrior badge! ⚔️\n\nBonus: Combo multiplier for streaks!", {
      fontFamily: "Inter, Arial, sans-serif", fontSize: "14px",
      color: "#fbbf24", align: "center", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(202);

    const btn = this.add.text(400, 430, "BEGIN COMBAT", {
      fontFamily: "Inter, Arial, sans-serif", fontSize: "24px",
      color: "#ffffff", backgroundColor: "#d97706",
      padding: { x: 30, y: 14 }, fontStyle: "bold",
    }).setOrigin(0.5).setDepth(202).setInteractive({ useHandCursor: true });

    btn.on("pointerover", () => btn.setBackgroundColor("#b45309"));
    btn.on("pointerout", () => btn.setBackgroundColor("#d97706"));
    btn.on("pointerup", () => {
      [overlay, panel, title, desc, hint, btn].forEach(e => e.destroy());
      this._startCombat();
    });
  }

  _startCombat() {
    // ── Round counter ──
    this.roundText = this.add.text(400, 575, "", {
      fontFamily: "monospace", fontSize: "14px", color: "#64748b",
    }).setOrigin(0.5).setDepth(10);

    // ── Code simulation panel at bottom ──
    this.codePanelBg = this.add.rectangle(400, 530, 780, 50, 0x0f172a, 0.9).setStrokeStyle(1, 0x334155).setDepth(9);
    this.codeText = this.add.text(30, 520, "", {
      fontFamily: "monospace", fontSize: "16px", color: "#4ade80",
    }).setDepth(10);

    this._nextRound();
  }

  _nextRound() {
    // Clear previous round
    this.roundElements.forEach(e => { if (e && e.active) e.destroy(); });
    this.roundElements = [];

    if (this.currentRound >= this.totalRounds) {
      this._endLevel();
      return;
    }

    this.roundActive = true;
    this.currentRound++;
    this.roundStartTime = this.time.now;

    if (this.roundText) {
      this.roundText.setText(`Round ${this.currentRound} / ${this.totalRounds}`);
    }

    // Generate problem
    const ops = ["+", "−", "×"];
    this.num1 = Phaser.Math.Between(-15, 15);
    this.num2 = Phaser.Math.Between(-15, 15);

    // Compute all three results
    this.results = {
      "+": this.num1 + this.num2,
      "−": this.num1 - this.num2,
      "×": this.num1 * this.num2,
    };

    // Pick correct operation randomly
    this.correctOp = Phaser.Utils.Array.GetRandom(ops);
    this.correctAnswer = this.results[this.correctOp];

    // ── Draw enemy robot ──
    const enemyBg = this.add.rectangle(400, 180, 280, 160, 0x1e293b, 0.9);
    enemyBg.setStrokeStyle(2, 0xef4444);
    this.roundElements.push(enemyBg);

    // Enemy label
    const enemyLabel = this.add.text(400, 110, `⚡ ENEMY #${this.currentRound}`, {
      fontFamily: "monospace", fontSize: "14px", color: "#ef4444", fontStyle: "bold",
    }).setOrigin(0.5);
    this.roundElements.push(enemyLabel);

    // Two operands
    const operandText = this.add.text(400, 175, `${this.num1}   ?   ${this.num2}`, {
      fontFamily: "monospace", fontSize: "32px", color: "#e2e8f0", fontStyle: "bold",
    }).setOrigin(0.5);
    this.roundElements.push(operandText);

    const helpText = this.add.text(400, 220, "Choose the correct operation ↓", {
      fontFamily: "Inter, Arial, sans-serif", fontSize: "13px", color: "#94a3b8",
    }).setOrigin(0.5);
    this.roundElements.push(helpText);

    // ── Operation buttons ──
    this.selectedOp = null;
    const opBtns = [];
    ops.forEach((op, i) => {
      const bx = 280 + i * 120;
      const btn = this.add.text(bx, 300, op, {
        fontFamily: "monospace", fontSize: "36px", color: "#e2e8f0",
        backgroundColor: "#334155", padding: { x: 20, y: 10 },
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      btn.on("pointerover", () => { if (!this.selectedOp) btn.setBackgroundColor("#475569"); });
      btn.on("pointerout", () => { if (!this.selectedOp) btn.setBackgroundColor("#334155"); });
      btn.on("pointerup", () => this._selectOperation(op, operandText, opBtns));

      opBtns.push(btn);
      this.roundElements.push(btn);
    });
    this.opButtons = opBtns;
  }

  _selectOperation(op, operandText, opBtns) {
    if (this.selectedOp || !this.roundActive) return;
    this.selectedOp = op;

    // Highlight selected button
    opBtns.forEach(b => {
      b.disableInteractive();
      b.setBackgroundColor("#1e293b");
    });

    // Update operand display
    operandText.setText(`${this.num1}   ${op}   ${this.num2}`);

    // Update code panel
    const opMap = { "+": "+", "−": "-", "×": "*" };
    this.codeText.setText(`int result = ${this.num1} ${opMap[op]} ${this.num2};  // result = ?`);

    // Generate 4 answer options (1 correct + 3 wrong)
    const correctResult = this.results[op];
    const options = [correctResult];

    while (options.length < 4) {
      const wrong = correctResult + Phaser.Math.Between(-10, 10);
      if (wrong !== correctResult && !options.includes(wrong)) {
        options.push(wrong);
      }
    }
    Phaser.Utils.Array.Shuffle(options);

    // Display answer buttons
    options.forEach((ans, i) => {
      const ax = 170 + i * 160;
      const aBtn = this.add.text(ax, 400, ans.toString(), {
        fontFamily: "monospace", fontSize: "24px", color: "#ffffff",
        backgroundColor: "#1e40af", padding: { x: 20, y: 10 },
        fontStyle: "bold",
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      aBtn.on("pointerover", () => aBtn.setBackgroundColor("#1d4ed8"));
      aBtn.on("pointerout", () => aBtn.setBackgroundColor("#1e40af"));
      aBtn.on("pointerup", () => this._submitAnswer(ans, correctResult, op));

      this.roundElements.push(aBtn);
    });
  }

  _submitAnswer(chosen, correct, op) {
    if (!this.roundActive) return;
    this.roundActive = false;

    const elapsed = this.time.now - this.roundStartTime;
    const timeBonus = elapsed < 5000 ? 20 : 0;
    const opMap = { "+": "+", "−": "-", "×": "*" };

    if (chosen === correct) {
      // ── Correct! ──
      this.correctCount++;
      const mult = GameManager.getComboMultiplier();
      const xp = (100 + timeBonus) * mult;
      GameManager.addXP(xp);
      GameManager.addScore(100);
      GameManager.addCombo();

      this.successParticles.emitParticleAt(400, 180, 30);
      this.codeText.setText(`int result = ${this.num1} ${opMap[op]} ${this.num2};  // result = ${correct} ✓`);
      this.errorFeedback.showSuccess(`✓ Correct! +${xp} XP ${timeBonus > 0 ? "(TIME BONUS!)" : ""}${mult > 1 ? ` (${mult}x COMBO!)` : ""}`, 1200);
    } else {
      // ── Wrong! ──
      this.codeText.setText(`int result = ${this.num1} ${opMap[op]} ${this.num2};  // result = ${correct} ✗ (you said ${chosen})`);
      const remaining = this.errorFeedback.show(`✗ Wrong! ${this.num1} ${opMap[op]} ${this.num2} = ${correct}, not ${chosen}`);

      if (remaining <= 0) {
        this._gameOver();
        return;
      }
    }

    this.time.delayedCall(1200, () => {
      if (!this.isComplete) this._nextRound();
    });
  }

  _endLevel() {
    this.isComplete = true;
    const accuracy = Math.round((this.correctCount / this.totalRounds) * 100);

    GameManager.completeLevel(1, accuracy);
    BadgeSystem.unlock("math_warrior");
    ProgressTracker.saveProgress(GameManager.getState());

    this.cameras.main.flash(500, 255, 200, 0);

    this._showEndScreen(
      "LEVEL 2 COMPLETE!",
      `You defeated all ${this.totalRounds} enemies!\nAccuracy: ${accuracy}%`,
      "#f59e0b",
      "CONTINUE TO LEVEL 3",
      () => {
        this.scene.stop("UIScene");
        this.scene.start("MenuScene");
      }
    );
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
    this.add.text(400, 220, title, {
      fontFamily: "Inter, Arial, sans-serif", fontSize: "36px",
      color, fontStyle: "bold", align: "center",
      shadow: { blur: 15, color, fill: true },
    }).setOrigin(0.5).setDepth(201);

    this.add.text(400, 300, body, {
      fontFamily: "Inter, Arial, sans-serif", fontSize: "20px",
      color: "#cbd5e1", align: "center", lineSpacing: 6,
    }).setOrigin(0.5).setDepth(201);

    const btn = this.add.text(400, 400, btnText, {
      fontFamily: "Inter, Arial, sans-serif", fontSize: "24px",
      color: "#ffffff", backgroundColor: "#d97706",
      padding: { x: 30, y: 14 }, fontStyle: "bold",
    }).setOrigin(0.5).setDepth(201).setInteractive({ useHandCursor: true });

    btn.on("pointerover", () => btn.setBackgroundColor("#b45309"));
    btn.on("pointerout", () => btn.setBackgroundColor("#d97706"));
    btn.on("pointerup", btnAction);
  }

  shutdown() {
    if (this.errorFeedback) this.errorFeedback.destroy();
  }
}
