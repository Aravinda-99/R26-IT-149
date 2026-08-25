/**
 * BitIntervention — Shared "Bit Speaks Up" Helper
 * ==================================================
 * A single reusable entry point for showing a Bit message from OUTSIDE a
 * level scene (e.g. from the fusion-signal handler in main.js), without
 * needing to know which of the two per-scene Bit conventions the current
 * level happens to use:
 *   - newer "methods" wing levels: scene.showBitFeedback(message)
 *   - older levels:                scene._showBit(message) / scene._hideBit()
 *
 * There is no scene.pause() anywhere in this codebase — "pausing" is done
 * by setting scene.inputLocked = true, which the level's own pointer
 * handlers check before responding to clicks. We follow that same
 * convention here rather than inventing a new one.
 */

const FALLBACK_DISPLAY_MS = 4000;

/**
 * Locks input on the scene, shows Bit saying `message` (using whichever
 * convention the scene supports), then unlocks input again.
 * @param {Phaser.Scene} scene — the currently active level scene
 * @param {string} message
 * @returns {Promise<void>} resolves once the message has been shown and dismissed
 */
export async function showBreakSuggestion(scene, message) {
  if (!scene) return;

  scene.inputLocked = true;
  try {
    if (typeof scene.showBitFeedback === "function") {
      await scene.showBitFeedback(message);
    } else if (typeof scene._showBit === "function") {
      await scene._showBit(message);
      await new Promise((resolve) => scene.time.delayedCall(FALLBACK_DISPLAY_MS, resolve));
      if (typeof scene._hideBit === "function") scene._hideBit();
    } else {
      console.warn("showBreakSuggestion: scene has neither showBitFeedback nor _showBit", scene);
    }
  } finally {
    scene.inputLocked = false;
  }
}
