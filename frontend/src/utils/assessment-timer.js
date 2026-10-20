export function createAssessmentTimer(now = () => performance.now()) {
    let startedAt = null;
    let elapsedMs = 0;
    return {
        reset() {
            startedAt = null;
            elapsedMs = 0;
        },
        resume() {
            if (startedAt === null) startedAt = now();
        },
        pause() {
            if (startedAt !== null) {
                elapsedMs += Math.max(0, now() - startedAt);
                startedAt = null;
            }
            return Math.round(elapsedMs / 1000);
        },
    };
}
