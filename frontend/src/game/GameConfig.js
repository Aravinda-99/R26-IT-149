import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene.js";
import { Level_Int } from "./scenes/Level_Int.js";

/**
 * Creates a Phaser configuration object for CodeQuest learning games.
 *
 * Keep this config factory small and "pure" so it’s easy to mount the game
 * inside any DOM container (e.g., the `#phaser-container` div in `index.html`).
 */
export function createGameConfig({ parent } = {}) {
  return {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent,
    backgroundColor: "#1a1a2e",
    dom: {
      // Required for `this.add.dom()` HTML overlay code editors.
      createContainer: true,
    },
    physics: {
      default: "arcade",
      arcade: {
        gravity: { x: 0, y: 300 },
        debug: false,
      },
    },
    scene: [BootScene, Level_Int],
  };
}

