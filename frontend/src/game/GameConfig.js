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
import { Level25Scene } from "./scenes/methods/StringMethods/String.length()/Level25Scene.js";
import { Level26Scene } from "./scenes/methods/StringMethods/String.length()/Level26Scene.js";
import { Level27Scene } from "./scenes/methods/StringMethods/String.length()/Level27Scene.js";
import { Level28Scene } from "./scenes/methods/StringMethods/String.charAt()/Level28Scene.js";
import { Level29Scene } from "./scenes/methods/StringMethods/String.charAt()/Level29Scene.js";
import { Level30Scene } from "./scenes/methods/StringMethods/String.charAt()/Level30Scene.js";
import { Level31Scene } from "./scenes/methods/StringMethods/toUpperCase()...toLowerCase()/Level31Scene.js";
import { Level32Scene } from "./scenes/methods/StringMethods/toUpperCase()...toLowerCase()/Level32Scene.js";
import { Level33Scene } from "./scenes/methods/StringMethods/toUpperCase()...toLowerCase()/Level33Scene.js";
import { Level34Scene } from "./scenes/methods/scannerMethods/Level34Scene.js";
import { Level35Scene } from "./scenes/methods/scannerMethods/Level35Scene.js";
import { Level36Scene } from "./scenes/methods/scannerMethods/Level36Scene.js";
import { Level37Scene } from "./scenes/methods/outputMethods/println()/Level37Scene.js";
import { Level38Scene } from "./scenes/methods/outputMethods/println()/Level38Scene.js";
import { Level39Scene } from "./scenes/methods/outputMethods/println()/Level39Scene.js";
import { Level40Scene } from "./scenes/methods/outputMethods/print()/Level40Scene.js";
import { Level41Scene } from "./scenes/methods/outputMethods/print()/Level41Scene.js";
import { Level42Scene } from "./scenes/methods/outputMethods/print()/Level42Scene.js";
import { Level43Scene } from "./scenes/methods/outputMethods/printf()/Level43Scene.js";
import { Level44Scene } from "./scenes/methods/outputMethods/printf()/Level44Scene.js";
import { Level45Scene } from "./scenes/methods/outputMethods/printf()/Level45Scene.js";
import { Level46Scene } from "./scenes/methods/ArrayListMethods/add()/Level46Scene.js";
import { Level47Scene } from "./scenes/methods/ArrayListMethods/add()/Level47Scene.js";
import { Level48Scene } from "./scenes/methods/ArrayListMethods/add()/Level48Scene.js";
import { Level49Scene } from "./scenes/methods/ArrayListMethods/get()/Level49Scene.js";
import { Level50Scene } from "./scenes/methods/ArrayListMethods/get()/Level50Scene.js";
import { Level51Scene } from "./scenes/methods/ArrayListMethods/get()/Level51Scene.js";
import { Level52Scene } from "./scenes/methods/ArrayListMethods/remove()/Level52Scene.js";
import { Level53Scene } from "./scenes/methods/ArrayListMethods/remove()/Level53Scene.js";
import { Level54Scene } from "./scenes/methods/ArrayListMethods/remove()/Level54Scene.js";
import { Level55Scene } from "./scenes/methods/mathClassMethods/max().min()/Level55Scene.js";
import { Level56Scene } from "./scenes/methods/mathClassMethods/max().min()/Level56Scene.js";
import { Level57Scene } from "./scenes/methods/mathClassMethods/max().min()/Level57Scene.js";
import { Level58Scene } from "./scenes/methods/mathClassMethods/abs()/Level58Scene.js";
import { Level60Scene } from "./scenes/methods/mathClassMethods/abs()/Level60Scene.js";
import { Level61Scene } from "./scenes/methods/mathClassMethods/pow()/Level61Scene.js";
import { Level62Scene } from "./scenes/methods/mathClassMethods/pow()/Level62Scene.js";
import { Level63Scene } from "./scenes/methods/mathClassMethods/pow()/Level63Scene.js";
import { Level64Scene } from "./scenes/methods/ArrayMethods/toString()/Level64Scene.js";
import { Level65Scene } from "./scenes/methods/ArrayMethods/sort()/Level65Scene.js";
import { Level66Scene } from "./scenes/methods/ArrayMethods/sort()/Level66Scene.js";
import { Level67Scene } from "./scenes/methods/ArrayMethods/sort()/Level67Scene.js";
import { Level68Scene } from "./scenes/methods/ArrayMethods/copyOf()/Level68Scene.js";
import { Level69Scene } from "./scenes/methods/ArrayMethods/copyOf()/Level69Scene.js";
import { Level70Scene } from "./scenes/methods/ArrayMethods/copyOf()/Level70Scene.js";
import { Level71Scene } from "./scenes/methods/TypeConversionMethods/parseInt()/Level71Scene.js";
import { Level72Scene } from "./scenes/methods/TypeConversionMethods/parseInt()/Level72Scene.js";
import { Level73Scene } from "./scenes/methods/TypeConversionMethods/parseInt()/Level73Scene.js";
import { Level74Scene } from "./scenes/methods/TypeConversionMethods/parseDouble()/Level74Scene.js";
import { Level75Scene } from "./scenes/methods/TypeConversionMethods/parseDouble()/Level75Scene.js";
import { Level76Scene } from "./scenes/methods/TypeConversionMethods/parseDouble()/Level76Scene.js";
import { Level77Scene } from "./scenes/methods/TypeConversionMethods/valueOf()/Level77Scene.js";
import { Level78Scene } from "./scenes/methods/TypeConversionMethods/valueOf()/Level78Scene.js";
import { Level79Scene } from "./scenes/methods/TypeConversionMethods/valueOf()/Level79Scene.js";
import { Level80Scene } from "./scenes/methods/CharacterMethods/isDigit()/Level80Scene.js";
import { Level81Scene } from "./scenes/methods/CharacterMethods/isDigit()/Level81Scene.js";
import { Level82Scene } from "./scenes/methods/CharacterMethods/isDigit()/Level82Scene.js";
import { Level83Scene } from "./scenes/methods/CharacterMethods/isLetter()/Level83Scene.js";
import { Level84Scene } from "./scenes/methods/CharacterMethods/isLetter()/Level84Scene.js";
import { Level85Scene } from "./scenes/methods/CharacterMethods/isLetter()/Level85Scene.js";
import { Level86Scene } from "./scenes/methods/CharacterMethods/isUpperCase()/Level86Scene.js";
import { Level87Scene } from "./scenes/methods/CharacterMethods/isUpperCase()/Level87Scene.js";
import { Level88Scene } from "./scenes/methods/CharacterMethods/isUpperCase()/Level88Scene.js";
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
    width: 1280,
    height: 720,
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
    scene: [BootScene, MenuScene, Level1Scene, Level2Scene, Level3Scene, Level4Scene, Level5Scene, Level6Scene, Level7Scene, Level8Scene, Level9Scene, Level10Scene, Level11Scene, Level12Scene, Level13Scene, Level14Scene, Level15Scene, Level16Scene, Level17Scene, Level18Scene, Level19Scene, Level20Scene, Level21Scene, Level22Scene, Level23Scene, Level24Scene, Level25Scene, Level26Scene, Level27Scene, Level28Scene, Level29Scene, Level30Scene, Level31Scene, Level32Scene, Level33Scene, Level34Scene, Level35Scene, Level36Scene, Level37Scene, Level38Scene, Level39Scene, Level40Scene, Level41Scene, Level42Scene, Level43Scene, Level44Scene, Level45Scene, Level46Scene, Level47Scene, Level48Scene, Level49Scene, Level50Scene, Level51Scene, Level52Scene, Level53Scene, Level54Scene, Level55Scene, Level56Scene, Level57Scene, Level58Scene, Level60Scene, Level61Scene, Level62Scene, Level63Scene, Level64Scene, Level65Scene, Level66Scene, Level67Scene, Level68Scene, Level69Scene, Level70Scene, Level71Scene, Level72Scene, Level73Scene, Level74Scene, Level75Scene, Level76Scene, Level77Scene, Level78Scene, Level79Scene, Level80Scene, Level81Scene, Level82Scene, Level83Scene, Level84Scene, Level85Scene, Level86Scene, Level87Scene, Level88Scene, UIScene],
  };
}
