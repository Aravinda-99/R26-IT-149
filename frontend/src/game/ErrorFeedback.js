/**
 * ErrorFeedback — Reusable Error Display Component
 * =================================================
 * Provides consistent error feedback across all game scenes:
 * screen shake, red flash, error message overlay, life deduction.
 */

import { GameManager } from "./GameManager.js";

export class ErrorFeedback {
  /**
   * @param {Phaser.Scene} scene — the active Phaser scene
   */
  constructor(scene) {
    this.scene = scene;
    this.errorText = null;
    this._create();
  }

  _create() {
    this.errorText = this.scene.add.text(400, 480, "", {
      fontFamily: "monospace",
      fontSize: "22px",
      color: "#ffffff",
      backgroundColor: "#dc2626",
      padding: { x: 16, y: 8 },
      shadow: { blur: 10, color: "#dc2626", fill: true },
      wordWrap: { width: 700 },
      align: "center",
    }).setOrigin(0.5).setAlpha(0).setDepth(500);
  }

  /**
   * Display an error with full feedback.
   * @param {string} message — error text
   * @param {object} [options]
   * @param {boolean} [options.deductLife=true] — whether to deduct a life
   * @param {number} [options.duration=2500] — how long the message shows
   * @returns {number} remaining lives
   */
  show(message, { deductLife = true, duration = 2500 } = {}) {
    // Camera effects
    this.scene.cameras.main.shake(250, 0.015);
    this.scene.cameras.main.flash(200, 255, 0, 0);

    // Show message
    this.errorText.setText(message);
    this.errorText.setAlpha(1);
    this.scene.tweens.add({
      targets: this.errorText,
      alpha: 0,
      duration,
      delay: 600,
    });

    // Sound effect placeholder (can add later)
    // this.scene.sound.play("error_sfx");

    let remaining = GameManager.get("lives");

    if (deductLife) {
      remaining = GameManager.loseLife();
      // Reset combo on error
      GameManager.resetCombo();
    }

    return remaining;
  }

  /**
   * Show a success flash (green).
   */
  showSuccess(message, duration = 1500) {
    this.errorText.setBackgroundColor("#16a34a");
    this.errorText.setText(message);
    this.errorText.setAlpha(1);
    this.scene.tweens.add({
      targets: this.errorText,
      alpha: 0,
      duration,
      delay: 400,
      onComplete: () => {
        this.errorText.setBackgroundColor("#dc2626");
      },
    });
  }

  /**
   * Clean up.
   */
  destroy() {
    if (this.errorText) this.errorText.destroy();
  }
}
