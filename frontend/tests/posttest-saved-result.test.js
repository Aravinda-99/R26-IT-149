import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { createAssessmentTimer } from "../src/utils/assessment-timer.js";

const source = await readFile(new URL("../src/pages/posttest.js", import.meta.url), "utf8");

async function savedPage(records, requestedId = "arrays-old") {
    const calls = [];
    const context = vm.createContext({
        URLSearchParams,
        window: { location: { hash: `#/student/post-test/result?result_id=${requestedId}` } },
        document: { getElementById: () => null },
    });
    const mocks = {
        "../utils/assessment-timer.js": { createAssessmentTimer },
        "../api/api.js": { SchemaMasteryAPI: {
            getPostTestResults: async (filters) => { calls.push(filters); return { success: true, results: records }; },
            getCurrentContext: () => { throw new Error("Saved result must not start a new assessment"); },
        } },
        "../utils/auth.js": { getCurrentUser: () => ({ uid: "student_001" }) },
        "./student/ProfileMastery.js": { lessonHref: () => "#/student/game-player?module=arrays" },
    };
    const module = new vm.SourceTextModule(source, { context });
    await module.link((specifier) => {
        const values = mocks[specifier];
        return new vm.SyntheticModule(Object.keys(values), function () {
            for (const [key, value] of Object.entries(values)) this.setExport(key, value);
        }, { context });
    });
    await module.evaluate();
    const container = { innerHTML: "" };
    await module.namespace.renderPostTest(container);
    return { html: container.innerHTML, calls };
}

test("history opens the chosen saved attempt with its own concept and outcome", async () => {
    const { html, calls } = await savedPage([
        { result_id: "new-loops", student_id: "student_001", concept_name: "Loops", mastery_level: "Strong Understanding", next_action: "DONE", post_test_score: 1 },
        { result_id: "arrays-old", student_id: "student_001", concept_name: "Arrays", mastery_level: "Needs More Practice", next_action: "LEARN_AGAIN", post_test_score: 0.4 },
    ]);
    assert.equal(calls[0].student_id, "student_001");
    assert.match(html, /Arrays &amp; Data Structures/);
    assert.match(html, /Needs More Practice/);
    assert.match(html, /40%/);
    assert.doesNotMatch(html, /Strong Understanding/);
    assert.match(html, /module=arrays/);
    assert.doesNotMatch(html, /Start Understanding Check/);
});

test("another student's result cannot be opened through a changed URL", async () => {
    const { html } = await savedPage([{ result_id: "arrays-old", student_id: "someone_else", mastery_level: "PRIVATE_OUTCOME" }]);
    assert.match(html, /Could not load this saved result/);
    assert.doesNotMatch(html, /PRIVATE_OUTCOME/);
});

test("missing historical result shows a profile return action", async () => {
    const { html } = await savedPage([]);
    assert.match(html, /Back to Profile/);
    assert.doesNotMatch(html, /Start Understanding Check/);
});
