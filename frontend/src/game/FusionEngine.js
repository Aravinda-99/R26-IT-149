/**
 * FusionEngine — Combines Emotion, Fatigue, and Behavioral Signals
 * ===================================================================
 * Tracks short-term streaks of negative emotion (EmotionDetector) and low
 * eye-aspect-ratio (FatigueDetector) frames, plus a behavioral "struggling"
 * flag (from the backend wellbeing model), and decides what — if anything —
 * the game should do about it.
 */

// Per-class precision on the retrained (class-weighted) model:
//   fear=0.43, frustrated=0.80, sad=0.57, neutral=0.91
// Only frustrated clears a bar worth naming out loud -- fear is worse than
// a coin flip (more wrong than right) and sad is still too unreliable, so
// both stay on the same generic, emotion-agnostic wording rather than
// risking a confidently wrong "you seem sad"/"you seem afraid" callout.
const GENERIC_EMOTION_MESSAGE = "Looks like this one's tricky — want a short break?";
const EMOTION_MESSAGES = {
  frustrated: "This one's frustrating, huh? Want a short break?",
  fear: GENERIC_EMOTION_MESSAGE,
  sad: GENERIC_EMOTION_MESSAGE,
};

export class FusionEngine {
  constructor() {
    // Rolling buffer of the last up to 3 raw negative-eligible emotion
    // labels (fear/frustrated/sad), so the specific label survives long
    // enough to reach decideAction() instead of collapsing into a bare
    // streak count. Length reaching 3 is the trigger condition -- same
    // "3 consecutive negative frames" threshold as before.
    this.faceEmotionBuffer = [];
    this.detectedEmotion = null;
    this.fatigueLowEarStreak = 0;
    this.behavioralFlag = false;
  }

  updateFaceFrame(emotionLabel) {
    const negative = new Set(['frustrated', 'sad', 'fear']);
    if (negative.has(emotionLabel)) {
      this.faceEmotionBuffer.push(emotionLabel);
      if (this.faceEmotionBuffer.length > 3) this.faceEmotionBuffer.shift();
    } else {
      this.faceEmotionBuffer = [];
    }

    const triggered = this.faceEmotionBuffer.length >= 3;
    if (triggered) this.detectedEmotion = this._majorityEmotion();
    return triggered;
  }

  /**
   * Majority label among the buffered frames. Ties (e.g. one fear, one
   * frustrated, one sad across 3 frames -- no repeats at all) fall back to
   * the most recent frame, since that's still the most defensible single
   * guess at "what's happening right now."
   */
  _majorityEmotion() {
    const counts = {};
    this.faceEmotionBuffer.forEach((label) => { counts[label] = (counts[label] || 0) + 1; });

    let maxCount = 0;
    let winners = [];
    Object.entries(counts).forEach(([label, count]) => {
      if (count > maxCount) { maxCount = count; winners = [label]; }
      else if (count === maxCount) { winners.push(label); }
    });

    return winners.length === 1
      ? winners[0]
      : this.faceEmotionBuffer[this.faceEmotionBuffer.length - 1];
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
    if (faceTriggered) {
      return {
        action: 'BREAK_SUGGESTION_EMOTION',
        message: EMOTION_MESSAGES[this.detectedEmotion] || "Player appears frustrated — suggest a short break",
        detectedEmotion: this.detectedEmotion,
      };
    }
    if (this.behavioralFlag) return { action: 'BIT_MENU', message: "Struggling with content — show Bit's menu (Easier / Review Basics / Continue)" };
    return { action: 'NONE', message: "Continue normal gameplay" };
  }
}
