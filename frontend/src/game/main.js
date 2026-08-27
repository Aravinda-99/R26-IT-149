import Phaser from "phaser";
import { createGameConfig } from "./GameConfig.js";
import { GameManager } from "./GameManager.js";
import { WebcamCapture } from "./ml/WebcamCapture.js";
import { EmotionDetector } from "./ml/EmotionDetector.js";
import { FatigueDetector } from "./ml/FatigueDetector.js";
import { showBreakSuggestion } from "./BitIntervention.js";
import { showBitMenu } from "./BitMenu.js";

let gameInstance = null;
let fusionLoopHandle = null;
// Bumped by stopFusionLoop() so an in-flight startFusionLoop() (still
// awaiting webcam permission / model loads) can tell it was torn down
// in the meantime and bail out instead of starting a loop on a dead camera.
let fusionSession = 0;

const FUSION_LOOP_INTERVAL_MS = 1000; // matches the interval used during manual testing

// ── Bit intervention de-duplication ──────────────────────────────────
// fusionAction fires every ~1s for as long as its triggering condition
// holds (e.g. holding a frustrated expression fires the same action
// repeatedly), so a raw subscriber would spam Bit popups. Two rules:
//   1. Never stack a second popup while one is already open.
//   2. After a popup is dismissed, stay quiet for a cooldown window
//      before showing anything again, even if a *different* action fires.
let lastDismissedAt = 0;
const INTERVENTION_COOLDOWN_MS = 25000; // 25s, within the requested 20-30s range

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

  startFusionLoop();

  return gameInstance;
}

/**
 * Cleanly destroys the Phaser game instance and frees GPU resources.
 * Useful if you want to hide/unmount the game when switching pages.
 */
export function destroyGame() {
  if (gameInstance) {
    gameInstance.destroy(true);
    gameInstance = null;
  }

  stopFusionLoop();
}

/**
 * Starts the webcam + emotion/fatigue detectors and polls them once a
 * second, feeding results into GameManager.fusionEngine and broadcasting
 * a "fusionAction" event whenever it decides something other than 'NONE'.
 */
function startFusionLoop() {
  if (fusionLoopHandle) return; // already running

  const session = ++fusionSession;
  GameManager.on("fusionAction", handleFusionAction);

  (async () => {
    try {
      await WebcamCapture.start();
      await Promise.all([EmotionDetector.load(), FatigueDetector.load()]);
    } catch (e) {
      console.error("FusionEngine: failed to start webcam/ML detectors:", e);
      return;
    }

    // Torn down (destroyGame/another mountGame) while we were awaiting above.
    if (session !== fusionSession) return;

    fusionLoopHandle = setInterval(async () => {
      const emotion = await EmotionDetector.detect();
      const ear = await FatigueDetector.detect();

      const faceTriggered = GameManager.fusionEngine.updateFaceFrame(emotion);
      const fatigueTriggered = GameManager.fusionEngine.updateFatigueFrame(ear);

      const decision = GameManager.fusionEngine.decideAction(faceTriggered, fatigueTriggered);
      if (decision.action !== "NONE") {
        GameManager._emit("fusionAction", decision);
      }
    }, FUSION_LOOP_INTERVAL_MS);
  })();
}

/** Stops the fusion polling loop and releases the webcam. */
function stopFusionLoop() {
  fusionSession++; // invalidate any in-flight startFusionLoop()
  GameManager.off("fusionAction", handleFusionAction);

  if (fusionLoopHandle) {
    clearInterval(fusionLoopHandle);
    fusionLoopHandle = null;
  }

  WebcamCapture.stop();
}

/** Finds whichever LevelNScene is currently active, or null (e.g. on the menu). */
function getActiveLevelScene() {
  if (!gameInstance) return null;
  return gameInstance.scene.getScenes(true).find((s) => /^Level\d+Scene$/.test(s.scene.key)) || null;
}

/**
 * Reacts to a fusionAction event, applying the de-dup/cooldown rules above
 * before showing anything via Bit.
 */
async function handleFusionAction({ action, message }) {
  if (GameManager.interventionInFlight) return; // something is already showing — never stack a second one
  if (Date.now() - lastDismissedAt < INTERVENTION_COOLDOWN_MS) return; // still cooling down

  const scene = getActiveLevelScene();
  if (!scene) return; // no level currently running (e.g. browsing the menu) — nothing to intervene in

  GameManager.interventionInFlight = true;
  try {
    if (action === "BREAK_SUGGESTION_FATIGUE" || action === "BREAK_SUGGESTION_EMOTION") {
      await showBreakSuggestion(scene, message);
    } else if (action === "BIT_MENU" || action === "BIT_MENU_URGENT") {
      const choice = await showBitMenu(scene, { urgent: action === "BIT_MENU_URGENT" });
      console.log("fusionAction resolved:", action, "-> player chose:", choice);
    }
  } finally {
    GameManager.interventionInFlight = false;
    lastDismissedAt = Date.now();
  }
}
