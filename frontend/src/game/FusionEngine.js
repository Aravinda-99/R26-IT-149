/**
 * FusionEngine — Combines Emotion, Fatigue, and Behavioral Signals
 * ===================================================================
 * Tracks short-term streaks of negative emotion (EmotionDetector) and low
 * eye-aspect-ratio (FatigueDetector) frames, plus a behavioral "struggling"
 * flag (from the backend wellbeing model), and decides what — if anything —
 * the game should do about it.
 */

export class FusionEngine {
  constructor() {
    this.faceNegativeStreak = 0;
    this.fatigueLowEarStreak = 0;
    this.behavioralFlag = false;
  }

  updateFaceFrame(emotionLabel) {
    const negative = new Set(['frustrated', 'sad', 'fear']);
    this.faceNegativeStreak = negative.has(emotionLabel) ? this.faceNegativeStreak + 1 : 0;
    return this.faceNegativeStreak >= 3;
  }

  updateFatigueFrame(avgEar) {
    if (avgEar === null) return false;
    this.fatigueLowEarStreak = avgEar < 0.20 ? this.fatigueLowEarStreak + 1 : 0;
    return this.fatigueLowEarStreak >= 3;
  }

  checkBehavioral(prediction) {
    this.behavioralFlag = prediction === 'struggling';
    return this.behavioralFlag;
  }

  resetForNewLevel() {
    this.behavioralFlag = false;
  }

  decideAction(faceTriggered, fatigueTriggered) {
    if (fatigueTriggered) return { action: 'BREAK_SUGGESTION_FATIGUE', message: "Player appears fatigued — suggest a short break + bonus life" };
    if (faceTriggered && this.behavioralFlag) return { action: 'BIT_MENU_URGENT', message: "Frustrated AND struggling — show Bit's menu, emphasize 'Review Basics'" };
    if (faceTriggered) return { action: 'BREAK_SUGGESTION_EMOTION', message: "Player appears frustrated — suggest a short break" };
    if (this.behavioralFlag) return { action: 'BIT_MENU', message: "Struggling with content — show Bit's menu (Easier / Review Basics / Continue)" };
    return { action: 'NONE', message: "Continue normal gameplay" };
  }
}
