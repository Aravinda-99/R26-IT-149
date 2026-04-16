/**
 * MenuScene — Level Selection Menu
 * ==================================
 * Animated starfield background with 3 level cards.
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
    this.stars = []; // Initialize before async operations to prevent update loop crash

    // Load saved progress
    try {
      const saved = await ProgressTracker.loadProgress();
      if (saved && saved.levelsCompleted) {
        GameManager.set("levelsCompleted", saved.levelsCompleted);
        GameManager.set("xp", saved.xp || 0);
        GameManager.set("badges", saved.badges || []);
      }
      await BadgeSystem.loadBadges();
    } catch { /* first time — no saved data */ }

    // ── Starfield ──
    this.stars = [];
    for (let i = 0; i < 120; i++) {
      const x = Phaser.Math.Between(0, 800);
      const y = Phaser.Math.Between(0, 600);
      const size = Phaser.Math.FloatBetween(0.5, 2.5);
      const alpha = Phaser.Math.FloatBetween(0.3, 1);
      const star = this.add.circle(x, y, size, 0xffffff, alpha);
      this.stars.push({ obj: star, speed: Phaser.Math.FloatBetween(0.1, 0.6) });
    }

    // ── Title ──
    this.add.text(400, 60, "INTEGER MASTERY MODULE", {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: "36px",
      color: "#38bdf8",
      fontStyle: "bold",
      shadow: { blur: 20, color: "#38bdf8", fill: true },
    }).setOrigin(0.5);

    this.add.text(400, 100, "Schema Theory Based Learning", {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: "16px",
      color: "#64748b",
    }).setOrigin(0.5);

    // ── Level Cards ──
    const levels = [
      {
        title: "Level 1: Integer Discovery",
        phase: "ACCRETION PHASE",
        desc: "Catch falling integers on the number line — avoid decimals & fractions!",
        mechanic: "Number Line Adventure",
        badge: BADGES.integer_explorer,
        scene: "Level1Scene",
        index: 0,
      },
      {
        title: "Level 2: Operations Arena",
        phase: "TUNING PHASE",
        desc: "Defeat enemy robots with integer math operations",
        mechanic: "Math Combat System",
        badge: BADGES.math_warrior,
        scene: "Level2Scene",
        index: 1,
      },
      {
        title: "Level 3: Logic Maze",
        phase: "RESTRUCTURING PHASE",
        desc: "Solve code puzzles to escape the facility",
        mechanic: "Escape Room Puzzle",
        badge: BADGES.logic_master,
        scene: "Level3Scene",
        index: 2,
      },
    ];

    levels.forEach((lvl, i) => {
      const y = 190 + i * 130;
      const unlocked = GameManager.isLevelUnlocked(lvl.index);
      const completed = GameManager.get("levelsCompleted")[lvl.index];
      const badgeUnlocked = BadgeSystem.isUnlocked(lvl.badge.id);

      this._createLevelCard(lvl, y, unlocked, completed, badgeUnlocked);
    });

    // ── XP display at bottom ──
    const xp = GameManager.get("xp");
    this.add.text(400, 565, `Total XP: ${xp}`, {
      fontFamily: "monospace",
      fontSize: "16px",
      color: "#fbbf24",
    }).setOrigin(0.5);

    // ── Reset button (small, bottom-right) ──
    const resetBtn = this.add.text(760, 580, "Reset", {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: "12px",
      color: "#475569",
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    resetBtn.on("pointerover", () => resetBtn.setColor("#ef4444"));
    resetBtn.on("pointerout", () => resetBtn.setColor("#475569"));
    resetBtn.on("pointerup", () => {
      GameManager.resetAll();
      BadgeSystem.resetAll();
      ProgressTracker.clearProgress();
      this.scene.restart();
    });
  }

  update() {
    // Animate starfield
    this.stars.forEach(s => {
      s.obj.y += s.speed;
      if (s.obj.y > 610) {
        s.obj.y = -5;
        s.obj.x = Phaser.Math.Between(0, 800);
      }
    });
  }

  _createLevelCard(lvl, y, unlocked, completed, badgeUnlocked) {
    const cardColor = unlocked ? 0x1e293b : 0x111827;
    const borderColor = completed ? 0x4ade80 : (unlocked ? 0x334155 : 0x1f2937);

    // Card background
    const card = this.add.rectangle(400, y, 680, 110, cardColor, 0.95);
    card.setStrokeStyle(2, borderColor);

    // Status indicator
    const statusColor = completed ? 0x4ade80 : (unlocked ? 0x38bdf8 : 0x475569);
    this.add.circle(80, y, 8, statusColor);

    if (completed) {
      this.add.text(80, y, "✓", {
        fontSize: "12px", color: "#000000", fontStyle: "bold",
      }).setOrigin(0.5);
    } else if (!unlocked) {
      this.add.text(80, y, "🔒", { fontSize: "14px" }).setOrigin(0.5);
    }

    // Title
    const titleColor = unlocked ? "#e2e8f0" : "#475569";
    this.add.text(110, y - 28, lvl.title, {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: "18px",
      color: titleColor,
      fontStyle: "bold",
    });

    // Phase label
    this.add.text(110, y - 4, lvl.phase, {
      fontFamily: "monospace",
      fontSize: "11px",
      color: completed ? "#4ade80" : "#64748b",
      fontStyle: "bold",
    });

    // Description
    this.add.text(110, y + 16, lvl.desc, {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: "13px",
      color: "#94a3b8",
    });

    // Badge
    if (badgeUnlocked) {
      this.add.text(680, y - 15, lvl.badge.emoji, {
        fontSize: "28px",
      }).setOrigin(0.5);

      this.add.text(680, y + 15, lvl.badge.name, {
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: "10px",
        color: "#fbbf24",
      }).setOrigin(0.5);
    }

    // ── Click to Launch ──
    if (unlocked) {
      card.setInteractive({ useHandCursor: true });

      card.on("pointerover", () => {
        card.setStrokeStyle(2, 0x38bdf8);
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

        // Stop UIScene if already running, then relaunch
        if (this.scene.isActive("UIScene")) this.scene.stop("UIScene");
        this.scene.launch("UIScene");

        this.scene.start(lvl.scene);
      });
    }
  }
}
