import test from "node:test";
import assert from "node:assert/strict";
import { SchemaMasteryAPI } from "../src/api/api.js";
import { loadProfileMastery, profileMasteryHtml, resultHref, lessonHref } from "../src/pages/student/ProfileMastery.js";

const result = (overrides = {}) => ({
    result_id: "PTR_arrays", student_id: "student_001", concept_name: "Arrays",
    post_test_score: 0.7, mastery_level: "Good Progress", mastery_probability: 0.8,
    next_action: "DONE", created_at: "2026-10-20T10:00:00Z", ...overrides,
});
const slot = () => ({ innerHTML: "", isConnected: true, querySelector: () => null });

test("latest result shows saved score, understanding and probability", () => {
    const html = profileMasteryHtml([result()]);
    assert.match(html, /Good Progress/);
    assert.match(html, /70%/);
    assert.match(html, /80%/);
    assert.match(html, /Continue Learning/);
    assert.match(html, /Attempt History \(1\)/);
});

test("review action opens the matching lesson; zero scores stay zero", () => {
    const html = profileMasteryHtml([result({ next_action: "LEARN_AGAIN", post_test_score: 0 })]);
    assert.match(html, /module=arrays/);
    assert.match(html, /<dd>0%<\/dd>/);
    assert.equal(lessonHref("Methods"), "#/student/games");
});

test("empty history has no invented result and content is escaped", () => {
    assert.match(profileMasteryHtml([]), /No completed understanding checks/);
    const html = profileMasteryHtml([result({ concept_name: '<img src=x onerror="alert(1)">' })]);
    assert.doesNotMatch(html, /<img/);
    assert.match(html, /&lt;img/);
    assert.equal(resultHref(result({ result_id: "id&other=1" })), "#/student/post-test/result?result_id=id%26other%3D1");
});

test("history filters the signed-in student and sorts newest first", async (t) => {
    const target = slot();
    t.mock.method(SchemaMasteryAPI, "getPostTestResults", async (filters) => {
        assert.deepEqual(filters, { student_id: "student_001" });
        return { success: true, results: [
            result({ result_id: "older", concept_name: "Loops", created_at: "2026-01-01" }),
            result({ student_id: "another_student", concept_name: "PRIVATE_OTHER_RESULT" }),
            result(),
        ] };
    });
    await loadProfileMastery(target, "student_001");
    assert.ok(target.innerHTML.indexOf("Arrays") < target.innerHTML.indexOf("Loops"));
    assert.doesNotMatch(target.innerHTML, /PRIVATE_OTHER_RESULT/);
    assert.match(target.innerHTML, /Attempt History \(2\)/);
});

test("gameplay hydration shares in-flight results fetch", async (t) => {
    let resolve;
    let requests = 0;
    t.mock.method(SchemaMasteryAPI, "getPostTestResults", () => {
        requests++;
        return new Promise(done => { resolve = done; });
    });
    const a = slot(), b = slot();
    const loads = [loadProfileMastery(a, "student_001"), loadProfileMastery(b, "student_001")];
    resolve({ success: true, results: [result()] });
    await Promise.all(loads);
    assert.equal(requests, 1);
    assert.match(a.innerHTML, /Good Progress/);
    assert.match(b.innerHTML, /Good Progress/);
});

test("API failures provide retry and detached pages are not updated", async (t) => {
    t.mock.method(SchemaMasteryAPI, "getPostTestResults", async () => { throw new Error("offline"); });
    const connected = slot(), detached = { ...slot(), isConnected: false };
    await loadProfileMastery(connected, "student_001");
    await loadProfileMastery(detached, "student_001");
    assert.match(connected.innerHTML, /data-retry-results/);
    assert.doesNotMatch(detached.innerHTML, /role="alert"/);
});
