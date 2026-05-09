import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene.js";
import { MenuScene } from "./scenes/MenuScene.js";
import { Level1Scene } from "./scenes/int/Level1Scene.js";
import { Level2Scene } from "./scenes/int/Level2Scene.js";
import { Level3Scene } from "./scenes/int/Level3Scene.js";
import { Level4Scene } from "./scenes/float/Level4Scene.js";
import { Level5Scene } from "./scenes/float/Level5Scene.js";
import { Level6Scene } from "./scenes/float/Level6Scene.js";
import { Level7Scene } from "./scenes/char/Level7Scene.js";
import { Level8Scene } from "./scenes/char/Level8Scene.js";
import { Level9Scene } from "./scenes/char/Level9Scene.js";
import { Level10Scene } from "./scenes/string/Level10Scene.js";
import { Level11Scene } from "./scenes/string/Level11Scene.js";
import { Level12Scene } from "./scenes/string/Level12Scene.js";
import { Level13Scene } from "./scenes/operators/Level13Scene.js";
import { Level14Scene } from "./scenes/operators/Level14Scene.js";
import { Level15Scene } from "./scenes/operators/Level15Scene.js";
import { UIScene } from "./scenes/UIScene.js";

/**
 * Creates a Phaser configuration object for CodeQuest learning games.
 *
 * Registers all scenes: Boot → Menu → Level1-15 + UIScene overlay.
 * Level1 uses arcade physics with per-body gravity overrides.
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
    scene: [BootScene, MenuScene, Level1Scene, Level2Scene, Level3Scene, Level4Scene, Level5Scene, Level6Scene, Level7Scene, Level8Scene, Level9Scene, Level10Scene, Level11Scene, Level12Scene, Level13Scene, Level14Scene, Level15Scene, UIScene],
  };
}
