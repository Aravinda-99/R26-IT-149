export class BehavioralRules {
    /**
     * Evaluates rules to override the ML struggle prediction if necessary.
     * @param {Object} features - The behavioral features (attempts_count, time_taken_seconds, misconception_repeat_count, combo_breaks).
     * @param {string} mlPrediction - The raw prediction from the Isolation Forest model ("struggling" | "typical").
     * @param {boolean} isRapidFire - Whether the current level is a rapid-fire/tuning level.
     * @returns {string} The effective final prediction.
     */
    static getEffectivePrediction(features, mlPrediction, isRapidFire = false) {
        // Rule 1: In rapid-fire levels, 3 or more errors/timeouts indicate a definitive struggle, 
        // regardless of how quickly the player failed.
        if (isRapidFire && features.misconception_repeat_count >= 3) {
            return "struggling";
        }
        
        // Return the original ML prediction if no rules were triggered
        return mlPrediction;
    }
}
