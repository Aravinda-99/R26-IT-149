/**
 * MenuScene — Level Selection Menu
 * ==================================
 * Animated starfield background with 12 level cards in 4 modules.
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

    // Load saved progress
    try {
      const saved = await ProgressTracker.loadProgress();
      if (saved && saved.levelsCompleted) {
        while (saved.levelsCompleted.length < 12) saved.levelsCompleted.push(false);
        while ((saved.levelAccuracy || []).length < 12) (saved.levelAccuracy = saved.levelAccuracy || []).push(0);
        while ((saved.levelAttempts || []).length < 12) (saved.levelAttempts = saved.levelAttempts || []).push(0);

        GameManager.set("levelsCompleted", saved.levelsCompleted);
        GameManager.set("xp", saved.xp || 0);
        GameManager.set("badges", saved.badges || []);
        if (saved.levelAccuracy) GameManager.set("levelAccuracy", saved.levelAccuracy);
        if (saved.levelAttempts) GameManager.set("levelAttempts", saved.levelAttempts);
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
    this.add.text(400, 22, "CODEQUEST", {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: "26px",
      color: "#38bdf8",
      fontStyle: "bold",
      shadow: { blur: 20, color: "#38bdf8", fill: true },
    }).setOrigin(0.5);

    this.add.text(400, 40, "Schema Theory Based Learning", {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: "11px",
      color: "#64748b",
    }).setOrigin(0.5);

    // ── INTEGER MODULE HEADER ──
    this.add.text(400, 54, "── INTEGER MODULE ──", {
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
      const y = 66 + i * 32;
      const unlocked = GameManager.isLevelUnlocked(lvl.index);
      const completed = GameManager.get("levelsCompleted")[lvl.index];
      const badgeUnlocked = BadgeSystem.isUnlocked(lvl.badge.id);
      this._createLevelCard(lvl, y, unlocked, completed, badgeUnlocked, 0x38bdf8);
    });

    // ── FLOAT MODULE HEADER ──
    this.add.text(400, 160, "── FLOAT MODULE ──", {
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
      const y = 176 + i * 32;
      const unlocked = GameManager.isLevelUnlocked(lvl.index);
      const completed = GameManager.get("levelsCompleted")[lvl.index];
      const badgeUnlocked = BadgeSystem.isUnlocked(lvl.badge.id);
      this._createLevelCard(lvl, y, unlocked, completed, badgeUnlocked, 0x4ade80);
    });

    // ── CHAR MODULE HEADER ──
    this.add.text(400, 268, "── CHAR MODULE ──", {
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
      const y = 284 + i * 32;
      const unlocked = GameManager.isLevelUnlocked(lvl.index);
      const completed = GameManager.get("levelsCompleted")[lvl.index];
      const badgeUnlocked = BadgeSystem.isUnlocked(lvl.badge.id);
      this._createLevelCard(lvl, y, unlocked, completed, badgeUnlocked, 0xc084fc);
    });

    // ── STRING MODULE HEADER ──
    this.add.text(400, 378, "── STRING MODULE ──", {
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
        title: "Level 11: String Lab Master",
        phase: "TUNING",
        desc: "Lab challenges: concat, length, charAt, substring & more!",
        badge: BADGES.string_master,
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
      const y = 394 + i * 32;
      const unlocked = GameManager.isLevelUnlocked(lvl.index);
      const completed = GameManager.get("levelsCompleted")[lvl.index];
      const badgeUnlocked = BadgeSystem.isUnlocked(lvl.badge.id);
      this._createLevelCard(lvl, y, unlocked, completed, badgeUnlocked, 0xf59e0b);
    });

    // ── XP display ──
    const xp = GameManager.get("xp");
    this.add.text(400, 502, `Total XP: ${xp}`, {
      fontFamily: "monospace",
      fontSize: "13px",
      color: "#fbbf24",
    }).setOrigin(0.5);

    // ── Completion badge ──
    const allDone = GameManager.get("levelsCompleted").every(Boolean);
    if (allDone) {
      this.add.text(400, 486, "🏅 ALL MODULES COMPLETE!", {
        fontFamily: "Arial",
        fontSize: "12px",
        color: "#fbbf24",
        fontStyle: "bold",
      }).setOrigin(0.5);
    }

    // ── Reset button ──
    const resetBtn = this.add.text(760, 516, "Reset", {
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
      this.scene.restart();
    });

    // Scroll to module launched from Learning Games page (see games.js)
    try {
      const focus = sessionStorage.getItem("codequest_menu_focus");
      if (focus) sessionStorage.removeItem("codequest_menu_focus");
      if (focus === "float") this.cameras.main.setScroll(0, 90);
      else if (focus === "char") this.cameras.main.setScroll(0, 175);
      else if (focus === "string") this.cameras.main.setScroll(0, 265);
    } catch { /* ignore */ }
  }

  update() {
    this.stars.forEach(s => {
      s.obj.y += s.speed;
      if (s.obj.y > 610) {
        s.obj.y = -5;
        s.obj.x = Phaser.Math.Between(0, 800);
      }
    });
  }

  _createLevelCard(lvl, y, unlocked, completed, badgeUnlocked, accentColor) {
    const cardColor = unlocked ? 0x1e293b : 0x111827;
    const borderColor = completed ? 0x4ade80 : (unlocked ? 0x334155 : 0x1f2937);

    const card = this.add.rectangle(400, y, 680, 44, cardColor, 0.95);
    card.setStrokeStyle(2, borderColor);

    // Status indicator
    const statusColor = completed ? 0x4ade80 : (unlocked ? accentColor : 0x475569);
    this.add.circle(80, y, 6, statusColor);

    if (completed) {
      this.add.text(80, y, "✓", {
        fontSize: "10px", color: "#000000", fontStyle: "bold",
      }).setOrigin(0.5);
    } else if (!unlocked) {
      this.add.text(80, y, "🔒", { fontSize: "11px" }).setOrigin(0.5);
    }

    // Title
    const titleColor = unlocked ? "#e2e8f0" : "#475569";
    this.add.text(100, y - 12, lvl.title, {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: "12px",
      color: titleColor,
      fontStyle: "bold",
    });

    this.add.text(100, y + 4, `${lvl.phase}  ·  ${lvl.desc}`, {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: "10px",
      color: "#94a3b8",
    });

    // Badge
    if (badgeUnlocked) {
      this.add.text(690, y - 8, lvl.badge.emoji, {
        fontSize: "20px",
      }).setOrigin(0.5);

      this.add.text(690, y + 12, lvl.badge.name, {
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: "8px",
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
        this.scene.launch("UIScene");

        this.scene.start(lvl.scene);
      });
    }
  }
}
