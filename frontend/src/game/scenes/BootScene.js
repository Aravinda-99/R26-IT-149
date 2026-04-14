import Phaser from "phaser";

/**
 * BootScene
 * - Preloads shared assets from `public/assets/images/` (Vite serves `public/` at `/`)
 * - Starts Level_Int
 *
 * Do NOT generate a placeholder texture named "robot" here — it would block
 * Level_Int from showing `robot.png` (same texture key).
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload() {
    this.load.image("robot", "/assets/images/robot.png");
    this.load.image("crate_whole", "/assets/images/crate_whole.png");
    this.load.image("crate_broken", "/assets/images/crate_broken.png");
  }

  create() {
    this.scene.start("Level_Int");
  }
}
