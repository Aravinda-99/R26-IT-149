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
import { Level16Scene } from "./scenes/forloops/Level16Scene.js";
import { Level17Scene } from "./scenes/forloops/Level17Scene.js";
import { Level18Scene } from "./scenes/forloops/Level18Scene.js";
import { Level19Scene } from "./scenes/whileloop/Level19Scene.js";
import { Level20Scene } from "./scenes/whileloop/Level20Scene.js";
import { Level21Scene } from "./scenes/whileloop/Level21Scene.js";
import { Level22Scene } from "./scenes/array/Level22Scene.js";
import { Level23Scene } from "./scenes/array/Level23Scene.js";
import { Level24Scene } from "./scenes/array/Level24Scene.js";
import { Level25Scene } from "./scenes/methods/StringMethods/Level25Scene.js";
import { Level26Scene } from "./scenes/methods/StringMethods/Level26Scene.js";
import { Level27Scene } from "./scenes/methods/StringMethods/Level27Scene.js";
import { Level28Scene } from "./scenes/methods/StringMethods/Level28Scene.js";
import { Level29Scene } from "./scenes/methods/StringMethods/Level29Scene.js";
import { Level30Scene } from "./scenes/methods/StringMethods/Level30Scene.js";
import { Level31Scene } from "./scenes/methods/StringMethods/Level31Scene.js";
import { Level32Scene } from "./scenes/methods/StringMethods/Level32Scene.js";
import { Level33Scene } from "./scenes/methods/StringMethods/Level33Scene.js";
import { Level34Scene } from "./scenes/methods/scannerMethods/Level34Scene.js";
import { Level35Scene } from "./scenes/methods/scannerMethods/Level35Scene.js";
import { Level36Scene } from "./scenes/methods/scannerMethods/Level36Scene.js";
import { Level37Scene } from "./scenes/methods/outputMethods/Level37Scene.js";
import { Level38Scene } from "./scenes/methods/outputMethods/Level38Scene.js";
import { Level39Scene } from "./scenes/methods/outputMethods/Level39Scene.js";
import { Level40Scene } from "./scenes/methods/outputMethods/Level40Scene.js";
import { Level41Scene } from "./scenes/methods/outputMethods/Level41Scene.js";
import { Level42Scene } from "./scenes/methods/outputMethods/Level42Scene.js";
import { Level43Scene } from "./scenes/methods/outputMethods/Level43Scene.js";
import { Level44Scene } from "./scenes/methods/outputMethods/Level44Scene.js";
import { Level45Scene } from "./scenes/methods/outputMethods/Level45Scene.js";
import { Level46Scene } from "./scenes/methods/ArrayListMethods/Level46Scene.js";
import { Level47Scene } from "./scenes/methods/ArrayListMethods/Level47Scene.js";
import { Level48Scene } from "./scenes/methods/ArrayListMethods/Level48Scene.js";
import { Level49Scene } from "./scenes/methods/ArrayListMethods/Level49Scene.js";
import { Level50Scene } from "./scenes/methods/ArrayListMethods/Level50Scene.js";
import { Level51Scene } from "./scenes/methods/ArrayListMethods/Level51Scene.js";
import { Level52Scene } from "./scenes/methods/ArrayListMethods/Level52Scene.js";
import { Level53Scene } from "./scenes/methods/ArrayListMethods/Level53Scene.js";
import { Level54Scene } from "./scenes/methods/ArrayListMethods/Level54Scene.js";
import { Level55Scene } from "./scenes/methods/ArrayListMethods/Level55Scene.js";
import { Level56Scene } from "./scenes/methods/ArrayListMethods/Level56Scene.js";
import { Level57Scene } from "./scenes/methods/ArrayListMethods/Level57Scene.js";
import { Level58Scene } from "./scenes/methods/ArrayListMethods/Level58Scene.js";
import { Level60Scene } from "./scenes/methods/ArrayListMethods/Level60Scene.js";
import { Level61Scene } from "./scenes/methods/ArrayListMethods/Level61Scene.js";
import { Level62Scene } from "./scenes/methods/ArrayListMethods/Level62Scene.js";
import { Level63Scene } from "./scenes/methods/ArrayListMethods/Level63Scene.js";
import { Level64Scene } from "./scenes/methods/ArrayListMethods/Level64Scene.js";
import { Level65Scene } from "./scenes/methods/ArrayListMethods/Level65Scene.js";
import { Level66Scene } from "./scenes/methods/ArrayListMethods/Level66Scene.js";
import { Level67Scene } from "./scenes/methods/ArrayListMethods/Level67Scene.js";
import { Level68Scene } from "./scenes/methods/ArrayListMethods/Level68Scene.js";
import { Level69Scene } from "./scenes/methods/ArrayListMethods/Level69Scene.js";
import { Level70Scene } from "./scenes/methods/ArrayListMethods/Level70Scene.js";
import { Level71Scene } from "./scenes/methods/ArrayListMethods/Level71Scene.js";
import { Level72Scene } from "./scenes/methods/ArrayListMethods/Level72Scene.js";
import { Level73Scene } from "./scenes/methods/ArrayListMethods/Level73Scene.js";
import { Level74Scene } from "./scenes/methods/ArrayListMethods/Level74Scene.js";
import { Level75Scene } from "./scenes/methods/ArrayListMethods/Level75Scene.js";
import { Level76Scene } from "./scenes/methods/ArrayListMethods/Level76Scene.js";
import { Level77Scene } from "./scenes/methods/ArrayListMethods/Level77Scene.js";
import { Level78Scene } from "./scenes/methods/ArrayListMethods/Level78Scene.js";
import { Level79Scene } from "./scenes/methods/ArrayListMethods/Level79Scene.js";
import { Level80Scene } from "./scenes/methods/ArrayListMethods/Level80Scene.js";
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
    scene: [BootScene, MenuScene, Level1Scene, Level2Scene, Level3Scene, Level4Scene, Level5Scene, Level6Scene, Level7Scene, Level8Scene, Level9Scene, Level10Scene, Level11Scene, Level12Scene, Level13Scene, Level14Scene, Level15Scene, Level16Scene, Level17Scene, Level18Scene, Level19Scene, Level20Scene, Level21Scene, Level22Scene, Level23Scene, Level24Scene, Level25Scene, Level26Scene, Level27Scene, Level28Scene, Level29Scene, Level30Scene, Level31Scene, Level32Scene, Level33Scene, Level34Scene, Level35Scene, Level36Scene, Level37Scene, Level38Scene, Level39Scene, Level40Scene, Level41Scene, Level42Scene, Level43Scene, Level44Scene, Level45Scene, Level46Scene, Level47Scene, Level48Scene, Level49Scene, Level50Scene, Level51Scene, Level52Scene, Level53Scene, Level54Scene, Level55Scene, Level56Scene, Level57Scene, Level58Scene, Level60Scene, Level61Scene, Level62Scene, Level63Scene, Level64Scene, Level65Scene, Level66Scene, Level67Scene, Level68Scene, Level69Scene, Level70Scene, Level71Scene, Level72Scene, Level73Scene, Level74Scene, Level75Scene, Level76Scene, Level77Scene, Level78Scene, Level79Scene, Level80Scene, UIScene],
  };
}
