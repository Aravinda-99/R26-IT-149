/**
 * MenuScene — Level Selection Menu
 * ==================================
 * Animated starfield background with 15 level cards in 5 modules.
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

    // Load badges from memory
    await BadgeSystem.loadBadges();

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

    // Get active module filter (if any)
    const activeModule = GameManager.get("activeModule");

    // Only render the selected module's levels, or all if no active module set
    const shouldShowInteger = !activeModule || activeModule === "integer";
    const shouldShowFloat = !activeModule || activeModule === "float";
    const shouldShowChar = !activeModule || activeModule === "char";
    const shouldShowString = !activeModule || activeModule === "string";
    const shouldShowOperators = !activeModule || activeModule === "operators";
    const shouldShowLoops = !activeModule || activeModule === "loops";
    const shouldShowWhileLoops = !activeModule || activeModule === "whileloops";

    if (shouldShowInteger) {
      // ── INTEGER MODULE HEADER ──
      this.add.text(400, 80, "── INTEGER MODULE ──", {
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
        const y = 100 + i * 60;
        const unlocked = GameManager.isLevelUnlocked(lvl.index);
        const completed = GameManager.get("levelsCompleted")[lvl.index];
        const badgeUnlocked = BadgeSystem.isUnlocked(lvl.badge.id);
        this._createLevelCard(lvl, y, unlocked, completed, badgeUnlocked, 0x38bdf8);
      });
    }

    if (shouldShowFloat) {
      // ── FLOAT MODULE HEADER ──
      const floatHeaderY = shouldShowInteger ? 200 : 80;
      this.add.text(400, floatHeaderY, "── FLOAT MODULE ──", {
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
        const floatBaseY = shouldShowInteger ? 220 : 100;
        const y = floatBaseY + i * 60;
        const unlocked = GameManager.isLevelUnlocked(lvl.index);
        const completed = GameManager.get("levelsCompleted")[lvl.index];
        const badgeUnlocked = BadgeSystem.isUnlocked(lvl.badge.id);
        this._createLevelCard(lvl, y, unlocked, completed, badgeUnlocked, 0x4ade80);
      });
    }

    if (shouldShowChar) {
      // ── CHAR MODULE HEADER ──
      let charHeaderY = 320;
      if (!shouldShowInteger && !shouldShowFloat) charHeaderY = 80;
      else if (!shouldShowInteger) charHeaderY = 200;
      else if (!shouldShowFloat) charHeaderY = 200;

      this.add.text(400, charHeaderY, "── CHAR MODULE ──", {
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
        let charBaseY = 340;
        if (!shouldShowInteger && !shouldShowFloat) charBaseY = 100;
        else if (!shouldShowInteger) charBaseY = 220;
        else if (!shouldShowFloat) charBaseY = 220;

        const y = charBaseY + i * 60;
        const unlocked = GameManager.isLevelUnlocked(lvl.index);
        const completed = GameManager.get("levelsCompleted")[lvl.index];
        const badgeUnlocked = BadgeSystem.isUnlocked(lvl.badge.id);
        this._createLevelCard(lvl, y, unlocked, completed, badgeUnlocked, 0xc084fc);
      });
    }

    if (shouldShowString) {
      // ── STRING MODULE HEADER ──
      let stringHeaderY = 440;
      let modulesBeforeString = (shouldShowInteger ? 1 : 0) + (shouldShowFloat ? 1 : 0) + (shouldShowChar ? 1 : 0);
      stringHeaderY = 80 + modulesBeforeString * 120;

      this.add.text(400, stringHeaderY, "── STRING MODULE ──", {
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
          title: "Level 11: String Operations Lab",
          phase: "TUNING",
          desc: "Master 6 essential string methods: length, charAt, case, concat, substring, and trim!",
          badge: BADGES.assembly_master,
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
        const stringBaseY = stringHeaderY + 16;
        const y = stringBaseY + i * 60;
        const unlocked = GameManager.isLevelUnlocked(lvl.index);
        const completed = GameManager.get("levelsCompleted")[lvl.index];
        const badgeUnlocked = BadgeSystem.isUnlocked(lvl.badge.id);
        this._createLevelCard(lvl, y, unlocked, completed, badgeUnlocked, 0xf59e0b);
      });
    }

    if (shouldShowOperators) {
      // ── OPERATORS MODULE HEADER ──
      let opsHeaderY = 560;
      let modulesBeforeOps = (shouldShowInteger ? 1 : 0) + (shouldShowFloat ? 1 : 0) + (shouldShowChar ? 1 : 0) + (shouldShowString ? 1 : 0);
      opsHeaderY = 80 + modulesBeforeOps * 120;

      this.add.text(400, opsHeaderY, "── OPERATORS MODULE ──", {
        fontFamily: "monospace",
        fontSize: "10px",
        color: "#ff6b6b",
        fontStyle: "bold",
      }).setOrigin(0.5);

      const operatorLevels = [
        {
          title: "Level 13: Math Magic Academy",
          phase: "ACCRETION",
          desc: "Learn operator spells — arithmetic, comparison, logical & more!",
          badge: BADGES.math_wizard,
          scene: "Level13Scene",
          index: 12,
        },
        {
          title: "Level 14: Calculation Arena",
          phase: "TUNING",
          desc: "Battle enemies with math — speed and accuracy are your weapons!",
          badge: BADGES.combat_calculator,
          scene: "Level14Scene",
          index: 13,
        },
        {
          title: "Level 15: Code Builder Pro",
          phase: "RESTRUCTURING",
          desc: "Build real Java programs using operators — professional IDE coding!",
          badge: BADGES.code_master,
          scene: "Level15Scene",
          index: 14,
        },
      ];

      operatorLevels.forEach((lvl, i) => {
        const opsBaseY = opsHeaderY + 16;
        const y = opsBaseY + i * 60;
        const unlocked = GameManager.isLevelUnlocked(lvl.index);
        const completed = GameManager.get("levelsCompleted")[lvl.index];
        const badgeUnlocked = BadgeSystem.isUnlocked(lvl.badge.id);
        this._createLevelCard(lvl, y, unlocked, completed, badgeUnlocked, 0xff6b6b);
      });
    }

    if (shouldShowLoops) {
      // ── LOOPS MODULE HEADER ──
      const loopsModulesBefore = (shouldShowInteger ? 1 : 0) + (shouldShowFloat ? 1 : 0) + (shouldShowChar ? 1 : 0) + (shouldShowString ? 1 : 0) + (shouldShowOperators ? 1 : 0);
      const loopsHeaderY = 80 + loopsModulesBefore * 120;

      this.add.text(400, loopsHeaderY, "── FOR LOOPS MODULE ──", {
        fontFamily: "monospace",
        fontSize: "10px",
        color: "#14b8a6",
        fontStyle: "bold",
      }).setOrigin(0.5);

      const loopLevels = [
        {
          title: "Level 16: Loop Train Express",
          phase: "ACCRETION",
          desc: "Configure for loops to drive a cyberpunk train through stations!",
          badge: BADGES.loop_engineer,
          scene: "Level16Scene",
          index: 15,
        },
        {
          title: "Level 17: Iteration Arena",
          phase: "TUNING",
          desc: "Rapid-fire for-loop challenges in a neon combat arena — defeat the Bug Drone!",
          badge: BADGES.loop_detective,
          scene: "Level17Scene",
          index: 16,
        },
        {
          title: "Level 18: Loop Architect",
          phase: "RESTRUCTURING",
          desc: "Build for-loops from scratch with drag-and-drop blocks to solve 8 real projects!",
          badge: BADGES.loop_architect,
          scene: "Level18Scene",
          index: 17,
        },
      ];

      loopLevels.forEach((lvl, i) => {
        const loopsBaseY = loopsHeaderY + 16;
        const y = loopsBaseY + i * 60;
        const unlocked = GameManager.isLevelUnlocked(lvl.index);
        const completed = GameManager.get("levelsCompleted")[lvl.index];
        const badgeUnlocked = BadgeSystem.isUnlocked(lvl.badge.id);
        this._createLevelCard(lvl, y, unlocked, completed, badgeUnlocked, 0x14b8a6);
      });
    }

    if (shouldShowWhileLoops) {
      // ── WHILE LOOPS MODULE HEADER ──
      const whileModulesBefore = (shouldShowInteger ? 1 : 0) + (shouldShowFloat ? 1 : 0) + (shouldShowChar ? 1 : 0) + (shouldShowString ? 1 : 0) + (shouldShowOperators ? 1 : 0) + (shouldShowLoops ? 1 : 0);
      const whileHeaderY = 80 + whileModulesBefore * 120;

      this.add.text(400, whileHeaderY, "── WHILE LOOPS MODULE ──", {
        fontFamily: "monospace",
        fontSize: "10px",
        color: "#14b8a6",
        fontStyle: "bold",
      }).setOrigin(0.5);

      const whileLevels = [
        {
          title: "Level 19: Power Core Charger",
          phase: "ACCRETION",
          desc: "Charge power cores using while loops — 10 rounds of condition-driven iteration!",
          badge: BADGES.while_schema,
          scene: "Level19Scene",
          index: 18,
        },
        {
          title: "Level 20: Debug Dimension",
          phase: "TUNING",
          desc: "15 rapid-fire while-loop challenges — predict, fix, trace, and debug before the Glitch Anomaly strikes!",
          badge: BADGES.loop_debugger,
          scene: "Level20Scene",
          index: 19,
        },
        {
          title: "Level 21: Data Stream Processor",
          phase: "RESTRUCTURING",
          desc: "Build while loops from scratch with drag-and-drop blocks to solve 8 real-world data processing projects!",
          badge: BADGES.stream_architect,
          scene: "Level21Scene",
          index: 20,
        },
      ];

      whileLevels.forEach((lvl, i) => {
        const whileBaseY = whileHeaderY + 16;
        const y = whileBaseY + i * 60;
        const unlocked = GameManager.isLevelUnlocked(lvl.index);
        const completed = GameManager.get("levelsCompleted")[lvl.index];
        const badgeUnlocked = BadgeSystem.isUnlocked(lvl.badge.id);
        this._createLevelCard(lvl, y, unlocked, completed, badgeUnlocked, 0x14b8a6);
      });
    }

    // ── XP display ──
    const xp = GameManager.get("xp");
    this.add.text(400, 612, `Total XP: ${xp}`, {
      fontFamily: "monospace",
      fontSize: "13px",
      color: "#fbbf24",
    }).setOrigin(0.5);

    // ── Completion badge ──
    const allDone = GameManager.get("levelsCompleted").every(Boolean);
    if (allDone) {
      this.add.text(400, 596, "🏅 ALL MODULES COMPLETE!", {
        fontFamily: "Arial",
        fontSize: "12px",
        color: "#fbbf24",
        fontStyle: "bold",
      }).setOrigin(0.5);
    }

    // ── Reset button ──
    const resetBtn = this.add.text(760, 628, "Reset", {
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
      GameManager.set("activeModule", null);
      this.scene.restart();
    });

    // Scroll to module launched from Learning Games page (see games.js)
    try {
      const focus = sessionStorage.getItem("codequest_menu_focus");
      if (focus) sessionStorage.removeItem("codequest_menu_focus");

      // If activeModule is set, scroll to top to show the filtered module
      if (activeModule) {
        this.cameras.main.setScroll(0, 0);
      } else {
        // Original scroll behavior when viewing all modules
        if (focus === "float") this.cameras.main.setScroll(0, 140);
        else if (focus === "char") this.cameras.main.setScroll(0, 260);
        else if (focus === "string") this.cameras.main.setScroll(0, 380);
        else if (focus === "operators") this.cameras.main.setScroll(0, 500);
      }
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

    const card = this.add.rectangle(400, y, 680, 48, cardColor, 0.95);
    card.setStrokeStyle(2, borderColor);

    // Status indicator
    const statusColor = completed ? 0x4ade80 : (unlocked ? accentColor : 0x475569);
    this.add.circle(80, y, 6, statusColor);

    if (completed) {
      this.add.text(80, y, "✓", {
        fontSize: "11px", color: "#000000", fontStyle: "bold",
      }).setOrigin(0.5);
    } else if (!unlocked) {
      this.add.text(80, y, "🔒", { fontSize: "12px" }).setOrigin(0.5);
    }

    // Title
    const titleColor = unlocked ? "#e2e8f0" : "#475569";
    this.add.text(100, y - 8, lvl.title, {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: "14px",
      color: titleColor,
      fontStyle: "bold",
    }).setOrigin(0, 0.5);

    this.add.text(100, y + 8, `${lvl.phase}  ·  ${lvl.desc}`, {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: "11px",
      color: "#94a3b8",
    }).setOrigin(0, 0.5);

    // Badge
    if (badgeUnlocked) {
      this.add.text(690, y - 7, lvl.badge.emoji, {
        fontSize: "21px",
      }).setOrigin(0.5);

      this.add.text(690, y + 10, lvl.badge.name, {
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: "9px",
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
