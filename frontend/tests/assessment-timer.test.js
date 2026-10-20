import test from "node:test";
import assert from "node:assert/strict";
import { createAssessmentTimer } from "../src/utils/assessment-timer.js";

test("instructions, loading, failed submission and retry wait are excluded", () => {
    let now = 0;
    const timer = createAssessmentTimer(() => now);
    now = 60000;
    timer.resume();
    now += 437000;
    assert.equal(timer.pause(), 437);
    now += 120000;
    assert.equal(timer.pause(), 437);
    timer.resume();
    now += 10000;
    assert.equal(timer.pause(), 447);
});

test("new assessment resets elapsed duration and does not invent a minimum", () => {
    let now = 0;
    const timer = createAssessmentTimer(() => now);
    timer.resume();
    now = 90000;
    timer.pause();
    timer.reset();
    now += 30000;
    timer.resume();
    now += 2000;
    assert.equal(timer.pause(), 2);
});
