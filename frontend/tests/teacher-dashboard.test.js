import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

test("teacher dashboard renders saved outcomes and refresh sees the new attempt", async () => {
    const elements = new Map();
    for (const id of ["tea-stat-pending", "tea-stat-approved", "tea-stat-students", "tea-students-container", "tea-posttest-results-container", "tea-archived-students", "tea-archived-count"]) {
        elements.set(id, { innerHTML: "", textContent: "", querySelectorAll: () => [] });
    }
    const handlers = {};
    const includeArchived = { checked: false, addEventListener: (name, callback) => { handlers[name] = callback; } };
    let onRosterChanged;
    let deferRoster = false;
    let releaseRoster;
    let requests = 0;
    const button = { disabled: false, addEventListener: (name, handler) => { handlers[name] = handler; } };
    const container = { innerHTML: "", querySelector: selector => selector === ".teacher-dashboard" ? { isConnected: true }
        : selector === "#tea-refresh-results" ? button : selector === "#tea-show-archived-results" ? includeArchived : elements.get(selector.slice(1)) };
    let results = [{ student_id: "s1", concept_name: "Arrays", post_test_score: 0.2,
        mastery_level: "Learn Again", learning_status: "Needs Support", next_action: "LEARN_AGAIN", created_at: "2026-10-19" }];
    const context = vm.createContext({
        AbortController, console, window: { addEventListener() {} },
        document: { getElementById: id => elements.get(id) },
        localStorage: { getItem: () => "[]" },
        fetch: async () => ({ json: async () => ({ students: [] }) }),
    });
    const source = await readFile(new URL("../src/pages/teacher/TeacherDashboard.js", import.meta.url), "utf8");
    const helperSource = await readFile(new URL("../src/pages/teacher/TeacherStudentResults.js", import.meta.url), "utf8");
    const module = new vm.SourceTextModule(source, { context });
    await module.link(specifier => {
        if (specifier === "./TeacherStudentResults.js") return new vm.SourceTextModule(helperSource, { context });
        if (specifier === "./TeacherRoster.js") return new vm.SyntheticModule(["wireArchiveButtons", "renderArchivedStudents"], function () {
            this.setExport("wireArchiveButtons", (container, students, callback) => { onRosterChanged = callback; });
            this.setExport("renderArchivedStudents", () => {});
        }, { context });
        const exports = specifier.includes("auth.js") ? { getCurrentUser: () => ({ role: "teacher", name: "Teacher" }) } : {
            SchemaMasteryAPI: { getQuestionStats: async () => { requests++; return {}; }, getPostTestResults: async () => ({ success: true, results }), getArchivedStudents: async () => ({ success: true, students: [] }) },
            MasteryAPI: { getStudents: async () => deferRoster ? new Promise(resolve => { releaseRoster = resolve; }) : ({ students: [{ studentId: "s1", studentName: "Learner", email: "learner@example.com" }] }) },
        };
        return new vm.SyntheticModule(Object.keys(exports), function () {
            for (const [name, value] of Object.entries(exports)) this.setExport(name, value);
        }, { context });
    });
    await module.evaluate();
    await module.namespace.renderTeacherDashboard(container);
    assert.match(elements.get("tea-students-container").innerHTML, /Learn Again/);
    results = [{ ...results[0], post_test_score: 0.7, mastery_level: "Good Progress", next_action: "DONE", created_at: "2026-10-20" }, ...results];
    await handlers.click();
    const roster = elements.get("tea-students-container").innerHTML;
    assert.match(roster, /Good Progress/);
    assert.match(roster, /70%/);
    assert.doesNotMatch(roster, /Learn Again/);
    assert.match(elements.get("tea-posttest-results-container").innerHTML, /Learn Again/);
    assert.equal(elements.get("tea-stat-students").textContent, 1);
    assert.equal(button.disabled, false);

    const callsBeforeArchive = requests;
    onRosterChanged({ student_id: "s1", name: "Learner", email: "learner@example.com", archived: true });
    assert.equal(elements.get("tea-stat-students").textContent, 0);
    assert.equal(elements.get("tea-archived-count").textContent, "(1)");
    assert.doesNotMatch(elements.get("tea-students-container").innerHTML, /Good Progress/);
    assert.doesNotMatch(elements.get("tea-posttest-results-container").innerHTML, /Good Progress/);
    assert.doesNotMatch(elements.get("tea-posttest-results-container").innerHTML, /Learn Again/);
    includeArchived.checked = true;
    handlers.change();
    assert.match(elements.get("tea-posttest-results-container").innerHTML, /Good Progress/);
    assert.match(elements.get("tea-posttest-results-container").innerHTML, /Learn Again/);
    includeArchived.checked = false;
    handlers.change();
    assert.doesNotMatch(elements.get("tea-posttest-results-container").innerHTML, /Good Progress/);
    assert.equal(requests, callsBeforeArchive, "Archive must not wait for unrelated dashboard requests");
    onRosterChanged({ student_id: "s1", archived: false });
    assert.equal(elements.get("tea-stat-students").textContent, 1);
    assert.match(elements.get("tea-students-container").innerHTML, /Good Progress/);
    assert.match(elements.get("tea-posttest-results-container").innerHTML, /Good Progress/);

    deferRoster = true;
    const slowRefresh = handlers.click();
    onRosterChanged({ student_id: "s1", name: "Learner", archived: true });
    assert.equal(elements.get("tea-stat-students").textContent, 0, "Archive updates even while refresh is pending");
    releaseRoster({ students: [{ studentId: "s1", studentName: "Learner" }] });
    await slowRefresh;
    assert.equal(elements.get("tea-stat-students").textContent, 0, "A stale refresh must not resurrect the archived row");
    assert.equal(elements.get("tea-archived-count").textContent, "(1)");
    assert.doesNotMatch(elements.get("tea-posttest-results-container").innerHTML, /Good Progress/);
    onRosterChanged({ student_id: "s1", archived: false });
    assert.equal(elements.get("tea-stat-students").textContent, 1);
    assert.equal(elements.get("tea-archived-count").textContent, "(0)");
});
