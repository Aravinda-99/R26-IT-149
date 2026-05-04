import Phaser from "phaser";

/**
 * BootScene
 * - Preloads shared assets with loading bar
 * - Then starts MenuScene for level selection
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload() {
    // ── Loading bar ──
    const w = 800, h = 600;
    const barW = 400, barH = 24;
    const barX = (w - barW) / 2;
    const barY = h / 2;

    // Background
    this.cameras.main.setBackgroundColor("#0a0a1a");

    // Title
    this.add.text(w / 2, barY - 60, "CODEQUEST", {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: "32px",
      color: "#38bdf8",
      fontStyle: "bold",
      shadow: { blur: 15, color: "#38bdf8", fill: true },
    }).setOrigin(0.5);

    this.add.text(w / 2, barY - 25, "Loading assets...", {
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: "14px",
      color: "#64748b",
    }).setOrigin(0.5);

    // Bar background
    const barBg = this.add.rectangle(w / 2, barY + 10, barW, barH, 0x1e293b);
    barBg.setStrokeStyle(1, 0x334155);

    // Bar fill
    const barFill = this.add.rectangle(barX, barY + 10, 0, barH, 0x4ade80).setOrigin(0, 0.5);

    // Percentage text
    const pctText = this.add.text(w / 2, barY + 45, "0%", {
      fontFamily: "monospace",
      fontSize: "14px",
      color: "#94a3b8",
    }).setOrigin(0.5);

    // Listen to load progress
    this.load.on("progress", (value) => {
      barFill.width = barW * value;
      pctText.setText(`${Math.round(value * 100)}%`);
    });

    // ── Preload all assets ──
    this.load.image("robot", "/assets/images/robot.png");
    this.load.image("crate_whole", "/assets/images/crate_whole.png");
    this.load.image("crate_broken", "/assets/images/crate_broken.png");
  }

  create() {
    // Small delay so loading bar is visible even on fast loads
    this.time.delayedCall(300, () => {
      this.scene.start("MenuScene");
    });
  }
}
