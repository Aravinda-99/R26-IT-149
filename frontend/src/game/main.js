import Phaser from "phaser";
import { createGameConfig } from "./GameConfig.js";

let gameInstance = null;

/**
 * Mounts the Phaser game into a DOM element.
 *
 * Later, you can replace the simulated "input box" inside scenes with a real
 * HTML input and pass values via scene events or a small state store.
 */
export function mountGame({
  parent = "phaser-container",
  // Future extension: initialScene, playerProfile, conceptId, etc.
} = {}) {
  // Prevent creating multiple Phaser instances if the user navigates back/forward.
  if (gameInstance) return gameInstance;

  const config = createGameConfig({ parent });
  gameInstance = new Phaser.Game(config);
  return gameInstance;
}

/**
 * Cleanly destroys the Phaser game instance and frees GPU resources.
 * Useful if you want to hide/unmount the game when switching pages.
 */
export function destroyGame() {
  if (!gameInstance) return;
  gameInstance.destroy(true);
  gameInstance = null;
}

