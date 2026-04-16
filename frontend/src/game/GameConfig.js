import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene.js";
import { MenuScene } from "./scenes/MenuScene.js";
import { Level1Scene } from "./scenes/Level1Scene.js";
import { Level2Scene } from "./scenes/Level2Scene.js";
import { Level3Scene } from "./scenes/Level3Scene.js";
import { UIScene } from "./scenes/UIScene.js";
import { Level_Int } from "./scenes/Level_Int.js";

/**
 * Creates a Phaser configuration object for CodeQuest learning games.
 *
 * Registers all scenes: Boot → Menu → Level1/2/3 + UIScene overlay.
 * The legacy Level_Int scene is also included for backward compatibility.
 */
export function createGameConfig({ parent } = {}) {
  return {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scale: {
      mode: Phaser.Scale.NONE,
      autoCenter: Phaser.Scale.NO_CENTER,
    },
    parent,
    backgroundColor: "#0a0a1a",
    dom: {
      createContainer: true,
    },
    physics: {
      default: "arcade",
      arcade: {
        gravity: { x: 0, y: 300 },
        debug: false,
      },
    },
    scene: [BootScene, MenuScene, Level1Scene, Level2Scene, Level3Scene, UIScene, Level_Int],
  };
}
