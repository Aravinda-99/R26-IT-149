/**
 * Level3Scene — "Integer Logic Maze" (Restructuring Phase)
 * =========================================================
 * Mechanic: Escape Room Puzzle
 * - 5 rooms with locked doors
 * - Each door has a code condition the player must evaluate
 * - Player types/selects the answer to unlock
 * - Progressively harder: comparisons → loops → nested logic
 */

import Phaser from "phaser";
import { GameManager } from "../GameManager.js";
import { BadgeSystem } from "../BadgeSystem.js";
import { ProgressTracker } from "../ProgressTracker.js";
import { ErrorFeedback } from "../ErrorFeedback.js";

const ROOMS = [
  {
    title: "Room 1: Simple Comparison",
    code: "int x = 5;\nif (x > 0) {\n  // which branch?\n}",
    question: "Does the condition (x > 0) evaluate to TRUE or FALSE?",
    hint: "x is 5. Is 5 greater than 0?",
    options: ["TRUE", "FALSE"],
    correct: "TRUE",
    explanation: "5 > 0 is TRUE, so the if-block executes.",
  },
  {
    title: "Room 2: Range Check",
    code: "int x = 7;\nif (x >= -10 && x <= 10) {\n  // does this run?\n}",
    question: "Is x=7 within the range [-10, 10]?",
    hint: "Check: is 7 >= -10 AND 7 <= 10?",
    options: ["TRUE", "FALSE"],
    correct: "TRUE",
    explanation: "7 >= -10 is TRUE and 7 <= 10 is TRUE. TRUE && TRUE = TRUE.",
  },
  {
    title: "Room 3: For-Loop Counting",
    code: "int count = 0;\nfor (int i = 0; i < 5; i++) {\n  count++;\n}",
    question: "What is the final value of 'count' after the loop?",
    hint: "The loop runs while i < 5 (i goes 0,1,2,3,4)",
    options: ["4", "5", "6", "10"],
    correct: "5",
    explanation: "The loop runs 5 times (i=0,1,2,3,4), so count increments to 5.",
  },
  {
    title: "Room 4: While-Loop Logic",
    code: "int x = 3;\nint steps = 0;\nwhile (x != 0) {\n  x--;\n  steps++;\n}",
    question: "How many iterations does the while loop execute?",
    hint: "x starts at 3, decreases by 1 each step until it hits 0",
    options: ["2", "3", "4", "0"],
    correct: "3",
    explanation: "x goes 3→2→1→0. The loop body runs 3 times before x becomes 0.",
  },
  {
    title: "Room 5: Nested Conditions",
    code: "int a = 2, b = -1;\nif (a > 0) {\n  if (b < 0) {\n    // INNER BLOCK\n  }\n}",
    question: "Does the INNER BLOCK execute?",
    hint: "Check outer: a=2 > 0? Then inner: b=-1 < 0?",
    options: ["YES", "NO"],
    correct: "YES",
    explanation: "a=2 > 0 is TRUE (outer passes). b=-1 < 0 is TRUE (inner passes). Both conditions met!",
  },
];

export class Level3Scene extends Phaser.Scene {
  constructor() {
    super({ key: "Level3Scene" });
  }

  create() {
    this.cameras.main.setBackgroundColor("#0a0a14");

    // Spark texture
    if (!this.textures.exists("spark")) {
      const g = this.add.graphics();
      g.fillStyle(0xa78bfa, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("spark", 8, 8);
      g.destroy();
    }

    this.successParticles = this.add.particles(0, 0, "spark", {
      speed: { min: 60, max: 200 },
      scale: { start: 1, end: 0 },
      lifespan: 700,
      blendMode: "ADD",
      emitting: false,
    });

    this.errorFeedback = new ErrorFeedback(this);

    // ── State ──
    this.currentRoom = 0;
    this.isComplete = false;
    this.roomElements = [];

    // UIScene label
    const uiScene = this.scene.get("UIScene");
    if (uiScene && uiScene.setLevelLabel) {
      uiScene.setLevelLabel("Level 3: Restructuring — Code Escape Room!");
    }

    this._showInstruction();
  }

  _showInstruction() {
    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.88).setDepth(200);
    const panel = this.add.rectangle(400, 280, 620, 400, 0x111827, 1).setDepth(201);
    panel.setStrokeStyle(3, 0xa78bfa);

    const title = this.add.text(400, 120, "FINAL MISSION: CODE ESCAPE", {
      fontFamily: "Inter, Arial, sans-serif", fontSize: "28px",
      color: "#a78bfa", fontStyle: "bold",
      shadow: { blur: 12, color: "#a78bfa", fill: true },
    }).setOrigin(0.5).setDepth(202);

    const desc = this.add.text(400, 210, "You are trapped in a facility with 5 locked rooms!\n\nEach door is sealed with a code-based lock.\nRead the code, evaluate the condition,\nand select the correct answer to unlock it.", {
      fontFamily: "Inter, Arial, sans-serif", fontSize: "16px",
      color: "#cbd5e1", align: "center", lineSpacing: 8,
    }).setOrigin(0.5).setDepth(202);

    const hint = this.add.text(400, 340, "Escape all 5 rooms to earn\nthe Logic Master badge! 🧠", {
      fontFamily: "Inter, Arial, sans-serif", fontSize: "14px",
      color: "#fbbf24", align: "center", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(202);

    const btn = this.add.text(400, 430, "ENTER FACILITY", {
      fontFamily: "Inter, Arial, sans-serif", fontSize: "24px",
      color: "#ffffff", backgroundColor: "#7c3aed",
      padding: { x: 30, y: 14 }, fontStyle: "bold",
    }).setOrigin(0.5).setDepth(202).setInteractive({ useHandCursor: true });

    btn.on("pointerover", () => btn.setBackgroundColor("#6d28d9"));
    btn.on("pointerout", () => btn.setBackgroundColor("#7c3aed"));
    btn.on("pointerup", () => {
      [overlay, panel, title, desc, hint, btn].forEach(e => e.destroy());
      this._showRoom();
    });
  }

  _showRoom() {
    // Clear previous room
    this.roomElements.forEach(e => { if (e && e.active) e.destroy(); });
    this.roomElements = [];

    if (this.currentRoom >= ROOMS.length) {
      this._endLevel();
      return;
    }

    const room = ROOMS[this.currentRoom];

    // ── Room background ──
    // Walls
    const wallG = this.add.graphics();
    wallG.fillStyle(0x111827, 1);
    wallG.fillRect(0, 60, 800, 540);
    wallG.lineStyle(2, 0x334155);
    wallG.strokeRect(10, 70, 780, 520);
    this.roomElements.push(wallG);

    // Room number
    const roomLabel = this.add.text(400, 85, `${room.title}`, {
      fontFamily: "Inter, Arial, sans-serif", fontSize: "18px",
      color: "#a78bfa", fontStyle: "bold",
    }).setOrigin(0.5);
    this.roomElements.push(roomLabel);

    // Progress dots
    for (let i = 0; i < ROOMS.length; i++) {
      const dx = 330 + i * 35;
      const dot = this.add.circle(dx, 108, 8, i < this.currentRoom ? 0x4ade80 : (i === this.currentRoom ? 0xa78bfa : 0x334155));
      this.roomElements.push(dot);

      if (i < this.currentRoom) {
        const check = this.add.text(dx, 108, "✓", {
          fontSize: "10px", color: "#000000", fontStyle: "bold",
        }).setOrigin(0.5);
        this.roomElements.push(check);
      }
    }

    // ── Door visual (centered, glowing) ──
    const doorG = this.add.graphics();
    doorG.fillStyle(0x1e293b, 1);
    doorG.fillRoundedRect(250, 130, 300, 100, 8);
    doorG.lineStyle(2, 0xa78bfa);
    doorG.strokeRoundedRect(250, 130, 300, 100, 8);
    this.roomElements.push(doorG);

    const doorLabel = this.add.text(400, 135, "🔒 LOCKED DOOR", {
      fontFamily: "monospace", fontSize: "12px", color: "#ef4444",
    }).setOrigin(0.5);
    this.roomElements.push(doorLabel);

    // ── Code block ──
    const codeBg = this.add.rectangle(400, 195, 280, 70, 0x0f172a);
    codeBg.setStrokeStyle(1, 0x4ade80);
    this.roomElements.push(codeBg);

    const codeText = this.add.text(270, 168, room.code, {
      fontFamily: "monospace", fontSize: "12px", color: "#4ade80",
      lineSpacing: 4,
    });
    this.roomElements.push(codeText);

    // ── Question ──
    const questionText = this.add.text(400, 280, room.question, {
      fontFamily: "Inter, Arial, sans-serif", fontSize: "18px",
      color: "#e2e8f0", fontStyle: "bold", align: "center",
      wordWrap: { width: 650 },
    }).setOrigin(0.5);
    this.roomElements.push(questionText);

    // ── Hint ──
    const hintText = this.add.text(400, 320, `💡 Hint: ${room.hint}`, {
      fontFamily: "Inter, Arial, sans-serif", fontSize: "13px",
      color: "#94a3b8", align: "center",
      wordWrap: { width: 600 },
    }).setOrigin(0.5);
    this.roomElements.push(hintText);

    // ── Answer options ──
    const optionCount = room.options.length;
    const optionWidth = 140;
    const totalWidth = optionCount * optionWidth + (optionCount - 1) * 20;
    const startX = 400 - totalWidth / 2 + optionWidth / 2;

    room.options.forEach((opt, i) => {
      const ox = startX + i * (optionWidth + 20);
      const optBtn = this.add.text(ox, 400, opt, {
        fontFamily: "monospace", fontSize: "22px", color: "#ffffff",
        backgroundColor: "#334155", padding: { x: 20, y: 12 },
        fontStyle: "bold",
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      optBtn.on("pointerover", () => optBtn.setBackgroundColor("#475569"));
      optBtn.on("pointerout", () => optBtn.setBackgroundColor("#334155"));
      optBtn.on("pointerup", () => this._submitRoomAnswer(opt, room, doorLabel));

      this.roomElements.push(optBtn);
    });
  }

  _submitRoomAnswer(answer, room, doorLabel) {
    if (this.isComplete) return;

    if (answer === room.correct) {
      // ── Correct! Door unlocks ──
      GameManager.addXP(150 * GameManager.getComboMultiplier());
      GameManager.addScore(150);
      GameManager.addCombo();

      this.successParticles.emitParticleAt(400, 180, 40);
      doorLabel.setText("🔓 UNLOCKED!");
      doorLabel.setColor("#4ade80");

      // Show explanation
      this.errorFeedback.showSuccess(`✓ ${room.explanation}`, 2000);
      this.cameras.main.flash(300, 100, 200, 100);

      this.currentRoom++;

      this.time.delayedCall(2200, () => {
        if (!this.isComplete) this._showRoom();
      });
    } else {
      // ── Wrong! ──
      const remaining = this.errorFeedback.show(
        `✗ Wrong! ${room.explanation}`
      );

      if (remaining <= 0) {
        this._gameOver();
      }
    }
  }

  _endLevel() {
    this.isComplete = true;
    const accuracy = Math.round(((ROOMS.length) / (ROOMS.length + (3 - GameManager.get("lives")))) * 100);

    GameManager.completeLevel(2, accuracy);
    BadgeSystem.unlock("logic_master");
    ProgressTracker.saveProgress(GameManager.getState());

    this.cameras.main.flash(600, 150, 100, 255);

    // ── Celebration screen ──
    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.9).setDepth(200);

    this.add.text(400, 140, "🧠", { fontSize: "64px" }).setOrigin(0.5).setDepth(201);

    this.add.text(400, 220, "MODULE COMPLETE!", {
      fontFamily: "Inter, Arial, sans-serif", fontSize: "40px",
      color: "#ffd700", fontStyle: "bold",
      shadow: { blur: 20, color: "#ffd700", fill: true },
    }).setOrigin(0.5).setDepth(201);

    this.add.text(400, 270, "MASTER OF INTEGER LOGIC", {
      fontFamily: "Inter, Arial, sans-serif", fontSize: "24px",
      color: "#a78bfa", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(201);

    this.add.text(400, 320, `Total XP: ${GameManager.get("xp")}  |  Badges: ${BadgeSystem.getUnlockedBadges().length}/3`, {
      fontFamily: "Inter, Arial, sans-serif", fontSize: "18px",
      color: "#cbd5e1",
    }).setOrigin(0.5).setDepth(201);

    const allBadges = BadgeSystem.getUnlockedBadges();
    const badgeText = allBadges.map(id => {
      const b = BadgeSystem.getBadge(id);
      return b ? `${b.emoji} ${b.name}` : id;
    }).join("   ");

    this.add.text(400, 360, badgeText, {
      fontFamily: "Inter, Arial, sans-serif", fontSize: "16px",
      color: "#fbbf24",
    }).setOrigin(0.5).setDepth(201);

    const btn = this.add.text(400, 440, "RETURN TO MENU", {
      fontFamily: "Inter, Arial, sans-serif", fontSize: "24px",
      color: "#ffffff", backgroundColor: "#7c3aed",
      padding: { x: 30, y: 14 }, fontStyle: "bold",
    }).setOrigin(0.5).setDepth(201).setInteractive({ useHandCursor: true });

    btn.on("pointerover", () => btn.setBackgroundColor("#6d28d9"));
    btn.on("pointerout", () => btn.setBackgroundColor("#7c3aed"));
    btn.on("pointerup", () => {
      this.scene.stop("UIScene");
      this.scene.start("MenuScene");
    });
  }

  _gameOver() {
    this.isComplete = true;
    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.85).setDepth(200);

    this.add.text(400, 230, "GAME OVER", {
      fontFamily: "Inter, Arial, sans-serif", fontSize: "36px",
      color: "#ef4444", fontStyle: "bold",
      shadow: { blur: 15, color: "#ef4444", fill: true },
    }).setOrigin(0.5).setDepth(201);

    this.add.text(400, 290, `Cleared ${this.currentRoom} / ${ROOMS.length} rooms`, {
      fontFamily: "Inter, Arial, sans-serif", fontSize: "20px",
      color: "#cbd5e1",
    }).setOrigin(0.5).setDepth(201);

    const btn = this.add.text(400, 380, "RETRY", {
      fontFamily: "Inter, Arial, sans-serif", fontSize: "24px",
      color: "#ffffff", backgroundColor: "#7c3aed",
      padding: { x: 30, y: 14 }, fontStyle: "bold",
    }).setOrigin(0.5).setDepth(201).setInteractive({ useHandCursor: true });

    btn.on("pointerover", () => btn.setBackgroundColor("#6d28d9"));
    btn.on("pointerout", () => btn.setBackgroundColor("#7c3aed"));
    btn.on("pointerup", () => {
      GameManager.resetLevel();
      this.scene.restart();
    });
  }

  shutdown() {
    if (this.errorFeedback) this.errorFeedback.destroy();
  }
}
