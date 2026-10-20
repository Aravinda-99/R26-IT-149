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
    this.add.rectangle(640, 28, 1280, 56, 0x0f172a, 0.92).setDepth(900);

    // ── Progress Bar ──
    this.add.rectangle(640, 4, 1280, 8, 0x1e293b).setOrigin(0.5, 0).setDepth(901);
    this.progressBar = this.add.rectangle(0, 4, 0, 8, 0x4ade80).setOrigin(0, 0).setDepth(902);

    // ── Level Label ──
    this.levelLabel = this.add.text(640, 30, "", {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: "18px",
      color: "#38bdf8",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(903);

    // ── XP Counter ──
    this.xpText = this.add.text(16, 16, "XP: 0", {
      fontFamily: "monospace",
      fontSize: "20px",
      color: "#fbbf24",
      stroke: "#92400e",
      strokeThickness: 2,
      shadow: { blur: 6, color: "#fbbf24", fill: true },
    }).setDepth(903);

    // ── Lives (numeric, no heart icons) ──
    this.livesText = this.add.text(1264, 16, "Lives: 0", {
      fontFamily: "monospace",
      fontSize: "18px",
      color: "#f87171",
      shadow: { blur: 8, color: "#f87171", fill: true },
    }).setOrigin(1, 0).setDepth(903);

    // ── Combo indicator (removed) ──
    // Combo UI removed per request; update logic retained but disabled in _syncCombo().

    // ── Badge popup container (hidden) ──
    this.badgePopup = this.add.container(1132, 66).setDepth(950).setAlpha(0);

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
    // Score display removed from the HUD.
    return;
  }

  _syncLives() {
    const lives = GameManager.get("lives");
    this.livesText.setText(`Lives: ${lives}`);

    if (lives <= 1) {
      this.livesText.setColor("#ef4444");
    } else {
      this.livesText.setColor("#f87171");
    }
  }

  _syncCombo() {
    // Combo UI hidden — no-op to avoid null references.
    return;
  }

  _syncProgress() {
    const completed = GameManager.get("levelsCompleted") || [false, false, false, false, false, false, false, false, false, false, false, false];
    const totalLevels = completed.length || 6;
    const pct = completed.filter(Boolean).length / totalLevels;
    const targetWidth = pct * 1280;

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

  /**
   * Toggle visibility of the lives display.
   * Used by gameplay scenes that replace lives with alternate mechanics (e.g., Oxygen).
   */
  setLivesVisible(isVisible) {
    if (this.livesText) {
      this.livesText.setVisible(isVisible);
    }
  }

  // ── Badge Popup ──

  _showBadgePopup(badge) {
    // Clear previous popup
    this.badgePopup.removeAll(true);

    // Compact toast pinned to the right-hand margin (below the HUD bar) so it
    // never covers the centred result panels; content is stacked from the
    // measured text heights so a long description just makes it taller.
    const POP_W = 270, PAD = 16, INNER = POP_W - 2 * PAD;
    const wrap = { width: INNER, useAdvancedWrap: true };
    const fam = "Inter, Arial, sans-serif";

    const emoji = this.add.text(0, PAD, badge.emoji, { fontSize: "44px" }).setOrigin(0.5, 0);
    let y = PAD + emoji.height + 8;
    const title = this.add.text(0, y, "BADGE UNLOCKED!", {
      fontFamily: fam, fontSize: "22px", color: "#fbbf24", fontStyle: "bold",
    }).setOrigin(0.5, 0);
    y += title.height + 6;
    const name = this.add.text(0, y, badge.name, {
      fontFamily: fam, fontSize: "20px", color: "#e2e8f0", align: "center", wordWrap: wrap,
    }).setOrigin(0.5, 0);
    y += name.height + 8;
    const desc = this.add.text(0, y, badge.description, {
      fontFamily: fam, fontSize: "18px", color: "#94a3b8", align: "center", wordWrap: wrap,
    }).setOrigin(0.5, 0);
    y += desc.height + PAD;

    const bg = this.add.rectangle(0, 0, POP_W, y, 0x0f172a, 0.95).setOrigin(0.5, 0);
    bg.setStrokeStyle(3, badge.color);
    const glow = this.add.circle(0, PAD + emoji.height / 2, 36, badge.color, 0.3);
    this.badgePopup.add([bg, glow, emoji, title, name, desc]);
    this.badgePopup.setPosition(1280 - 12 - POP_W / 2, 66);

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
