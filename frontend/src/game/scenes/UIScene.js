/**
 * UIScene — Persistent HUD Overlay
 * ==================================
 * Runs in parallel with gameplay scenes via `scene.launch("UIScene")`.
 * Displays: progress bar, XP/score, lives, level indicator, badge popups.
 */

import Phaser from "phaser";
import { GameManager } from "../GameManager.js";
import { BADGES } from "../BadgeSystem.js";

export class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: "UIScene" });
  }

  create() {
    // ── Top Bar Background ──
    this.add.rectangle(400, 28, 800, 56, 0x0f172a, 0.92).setDepth(900);

    // ── Progress Bar ──
    this.add.rectangle(400, 4, 800, 8, 0x1e293b).setOrigin(0.5, 0).setDepth(901);
    this.progressBar = this.add.rectangle(0, 4, 0, 8, 0x4ade80).setOrigin(0, 0).setDepth(902);

    // ── Level Label ──
    this.levelLabel = this.add.text(400, 30, "", {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: "16px",
      color: "#38bdf8",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(903);

    // ── XP Counter ──
    this.xpText = this.add.text(16, 16, "XP: 0", {
      fontFamily: "monospace",
      fontSize: "18px",
      color: "#fbbf24",
      stroke: "#92400e",
      strokeThickness: 2,
      shadow: { blur: 6, color: "#fbbf24", fill: true },
    }).setDepth(903);

    // ── Score Counter ──
    this.scoreText = this.add.text(16, 40, "Score: 0", {
      fontFamily: "monospace",
      fontSize: "14px",
      color: "#94a3b8",
    }).setDepth(903);

    // ── Lives ──
    this.livesText = this.add.text(700, 16, "♥♥♥", {
      fontFamily: "monospace",
      fontSize: "22px",
      color: "#f87171",
      shadow: { blur: 8, color: "#f87171", fill: true },
    }).setDepth(903);

    // ── Combo indicator ──
    this.comboText = this.add.text(700, 42, "", {
      fontFamily: "monospace",
      fontSize: "14px",
      color: "#a78bfa",
      fontStyle: "bold",
    }).setDepth(903);

    // ── Badge popup container (hidden) ──
    this.badgePopup = this.add.container(400, 300).setDepth(950).setAlpha(0);

    // ── Listen to GameManager events ──
    this._bindEvents();

    // Initial sync
    this._syncAll();
  }

  _bindEvents() {
    GameManager.on("stateChange", () => this._syncAll());
    GameManager.on("xpChange", () => this._syncXP());
    GameManager.on("scoreChange", () => this._syncScore());
    GameManager.on("livesChange", () => this._syncLives());
    GameManager.on("comboChange", () => this._syncCombo());
    GameManager.on("badgeUnlocked", (badge) => this._showBadgePopup(badge));
  }

  _syncAll() {
    this._syncXP();
    this._syncScore();
    this._syncLives();
    this._syncCombo();
    this._syncProgress();
  }

  _syncXP() {
    this.xpText.setText(`XP: ${GameManager.get("xp")}`);
  }

  _syncScore() {
    this.scoreText.setText(`Score: ${GameManager.get("score")}`);
  }

  _syncLives() {
    const lives = GameManager.get("lives");
    const max = GameManager.get("maxLives");
    const hearts = "♥".repeat(lives) + "♡".repeat(max - lives);
    this.livesText.setText(hearts);

    if (lives <= 1) {
      this.livesText.setColor("#ef4444");
    } else {
      this.livesText.setColor("#f87171");
    }
  }

  _syncCombo() {
    const combo = GameManager.get("combo");
    const mult = GameManager.getComboMultiplier();
    if (combo >= 2) {
      this.comboText.setText(`${combo}x COMBO! (${mult}x XP)`);
      this.comboText.setAlpha(1);
    } else {
      this.comboText.setAlpha(0);
    }
  }

  _syncProgress() {
    const completed = GameManager.get("levelsCompleted") || [false, false, false, false, false, false, false, false, false, false, false, false];
    const totalLevels = completed.length || 6;
    const pct = completed.filter(Boolean).length / totalLevels;
    const targetWidth = pct * 800;

    this.tweens.add({
      targets: this.progressBar,
      width: targetWidth,
      duration: 600,
      ease: "Cubic.out",
    });

    // Color: red→yellow→green
    if (pct <= 0.33) this.progressBar.setFillStyle(0xef4444);
    else if (pct <= 0.66) this.progressBar.setFillStyle(0xfbbf24);
    else this.progressBar.setFillStyle(0x4ade80);
  }

  /**
   * Set the level label text from the active gameplay scene.
   */
  setLevelLabel(text) {
    this.levelLabel.setText(text);
  }

  // ── Badge Popup ──

  _showBadgePopup(badge) {
    // Clear previous popup
    this.badgePopup.removeAll(true);

    const bg = this.add.rectangle(0, 0, 400, 200, 0x0f172a, 0.95);
    bg.setStrokeStyle(3, badge.color);
    this.badgePopup.add(bg);

    const glow = this.add.circle(0, -30, 40, badge.color, 0.3);
    this.badgePopup.add(glow);

    const emoji = this.add.text(0, -35, badge.emoji, {
      fontSize: "48px",
    }).setOrigin(0.5);
    this.badgePopup.add(emoji);

    const title = this.add.text(0, 20, "BADGE UNLOCKED!", {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: "20px",
      color: "#fbbf24",
      fontStyle: "bold",
    }).setOrigin(0.5);
    this.badgePopup.add(title);

    const name = this.add.text(0, 50, badge.name, {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: "16px",
      color: "#e2e8f0",
    }).setOrigin(0.5);
    this.badgePopup.add(name);

    const desc = this.add.text(0, 75, badge.description, {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: "13px",
      color: "#94a3b8",
    }).setOrigin(0.5);
    this.badgePopup.add(desc);

    // Animate in
    this.badgePopup.setAlpha(0).setScale(0.5);
    this.tweens.add({
      targets: this.badgePopup,
      alpha: 1,
      scale: 1,
      duration: 500,
      ease: "Back.out",
      onComplete: () => {
        // Auto-hide after 3 seconds
        this.time.delayedCall(3000, () => {
          this.tweens.add({
            targets: this.badgePopup,
            alpha: 0,
            scale: 0.5,
            duration: 400,
            ease: "Cubic.in",
          });
        });
      },
    });
  }
}
