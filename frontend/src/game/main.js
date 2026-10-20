import Phaser from "phaser";
import { createGameConfig } from "./GameConfig.js";
import { GameManager } from "./GameManager.js";
import { WebcamCapture } from "./ml/WebcamCapture.js";
import { EmotionDetector } from "./ml/EmotionDetector.js";
import { showBreakSuggestion } from "./BitIntervention.js";
import { showBitMenu } from "./BitMenu.js";

window.addEventListener('error', e => console.error('UNCAUGHT:', e.message, e.filename, e.lineno));

let gameInstance = null;
let fusionLoopHandle = null;
let fusionSession = 0;

const FUSION_LOOP_INTERVAL_MS = 1000;

window.addEventListener("resize", () => {
  if (gameInstance) gameInstance.scale.refresh();
});

let lastDismissedAt = 0;
const INTERVENTION_COOLDOWN_MS = 25000;

export function mountGame({
  parent = "phaser-container",
} = {}) {
  if (gameInstance) return gameInstance;

  const config = createGameConfig({ parent });
  gameInstance = new Phaser.Game(config);

  startFusionLoop();

  return gameInstance;
}

export function destroyGame() {
  if (gameInstance) {
    gameInstance.destroy(true);
    gameInstance = null;
  }

  stopFusionLoop();
}

function startFusionLoop() {
  if (fusionLoopHandle) return;

  const session = ++fusionSession;
  GameManager.on("fusionAction", handleFusionAction);

  (async () => {
    try {
      await WebcamCapture.start();
      await EmotionDetector.load();
    } catch (e) {
      console.error("FusionEngine: failed to start webcam/ML detectors:", e);
      return;
    }

    if (session !== fusionSession) return;

    fusionLoopHandle = setInterval(async () => {
      const emotion = await EmotionDetector.detect();

      const faceTriggered = GameManager.fusionEngine.updateFaceFrame(emotion);

      const decision = GameManager.fusionEngine.decideAction(faceTriggered);
      if (decision.action !== "NONE") {
        GameManager._emit("fusionAction", decision);
      }
    }, FUSION_LOOP_INTERVAL_MS);
  })();
}

function stopFusionLoop() {
  fusionSession++;
  GameManager.off("fusionAction", handleFusionAction);

  if (fusionLoopHandle) {
    clearInterval(fusionLoopHandle);
    fusionLoopHandle = null;
  }

  WebcamCapture.stop();
}

function getActiveLevelScene() {
  if (!gameInstance) return null;
  return gameInstance.scene.getScenes(true).find((s) => /^Level\d+Scene$/.test(s.scene.key)) || null;
}

async function handleFusionAction({ action, message }) {
  if (GameManager.interventionInFlight) return;
  if (Date.now() - lastDismissedAt < INTERVENTION_COOLDOWN_MS) return;

  const scene = getActiveLevelScene();
  if (!scene) return;

  GameManager.interventionInFlight = true;
  try {
    if (action === "BREAK_SUGGESTION_EMOTION") {
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