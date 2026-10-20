import test from "node:test";
import assert from "node:assert/strict";
import { SchemaMasteryAPI } from "../src/api/api.js";
import { confirmArchiveStudent, renderArchivedStudents } from "../src/pages/teacher/TeacherRoster.js";

function dialogDocument(t) {
    const original = globalThis.document;
    const form = { addEventListener: (name, fn) => { form[name] = fn; } };
    const cancel = { addEventListener: (name, fn) => { cancel[name] = fn; }, focus() {} };
    const error = { hidden: true, textContent: "" };
    const buttons = [cancel, {}];
    const events = {};
    const dialog = {
        innerHTML: "", setAttribute() {}, addEventListener: (name, fn) => { events[name] = fn; },
        querySelector: selector => selector === "form" ? form : selector === "[data-cancel]" ? cancel : error,
        querySelectorAll: () => buttons, showModal() { this.open = true; },
        close() { this.open = false; events.close?.(); }, remove() { this.removed = true; },
    };
    globalThis.document = { createElement: () => dialog, body: { append() {} } };
    t.after(() => { if (original === undefined) delete globalThis.document; else globalThis.document = original; });
    return { dialog, form, cancel, error };
}

test("archive is only requested after confirmation; Cancel never changes a student", async t => {
    const { dialog, form, cancel } = dialogDocument(t);
    let requests = 0, refreshed = 0;
    t.mock.method(SchemaMasteryAPI, "archiveStudent", async id => { requests++; assert.equal(id, "s1"); return { success: true }; });
    const student = { studentId: "s1", studentName: "Sample Learner", email: "sample@example.com" };
    confirmArchiveStudent(student, async record => { assert.equal(record.student_id, "s1"); assert.equal(record.archived, true); refreshed++; });
    assert.match(dialog.innerHTML, /Sample Learner/);
    assert.match(dialog.innerHTML, /sample@example.com/);
    assert.equal(requests, 0);
    cancel.click();
    assert.equal(requests, 0);
    confirmArchiveStudent(student, async record => { assert.equal(record.student_id, "s1"); assert.equal(record.archived, true); refreshed++; });
    await form.submit({ preventDefault() {} });
    assert.equal(requests, 1);
    assert.equal(refreshed, 1);
    assert.equal(dialog.open, false);
});

test("failed archive keeps the dialog open and reports the failure", async t => {
    const { dialog, form, error } = dialogDocument(t);
    t.mock.method(SchemaMasteryAPI, "archiveStudent", async () => { throw new Error("Please sign in again"); });
    confirmArchiveStudent({ studentId: "s1" }, () => assert.fail("Must not refresh on failure"));
    await form.submit({ preventDefault() {} });
    assert.equal(dialog.open, true);
    assert.equal(error.hidden, false);
    assert.equal(error.textContent, "Please sign in again");
});

test("restore refreshes roster after a successful response", async t => {
    const button = { dataset: { restoreStudent: "s1" }, addEventListener: (name, fn) => { button[name] = fn; } };
    const error = { hidden: true };
    const container = { innerHTML: "", querySelectorAll: () => [button], querySelector: () => error };
    let refreshed = false;
    t.mock.method(SchemaMasteryAPI, "restoreStudent", async id => { assert.equal(id, "s1"); return { success: true }; });
    renderArchivedStudents(container, [{ student_id: "s1", name: "Learner", email: "learner@example.com" }], async record => {
        assert.equal(record.student_id, "s1"); assert.equal(record.archived, false); refreshed = true;
    });
    await button.click();
    assert.equal(refreshed, true);
});

test("archive API sends the signed teacher token and refuses an unrelated login", async t => {
    const originals = { sessionStorage: globalThis.sessionStorage, localStorage: globalThis.localStorage };
    t.after(() => { for (const [key, value] of Object.entries(originals)) { if (value === undefined) delete globalThis[key]; else globalThis[key] = value; } });
    globalThis.sessionStorage = { getItem: () => JSON.stringify({ uid: "teacher", token: "signed-session" }) };
    globalThis.localStorage = { getItem: () => JSON.stringify({ uid: "teacher" }) };
    let requests = 0;
    t.mock.method(globalThis, "fetch", async (url, options) => {
        requests++;
        assert.match(url, /roster\/s1\/archive$/);
        assert.equal(options.headers.Authorization, "Bearer signed-session");
        return { ok: true, status: 200, text: async () => '{"success":true}' };
    });
    await SchemaMasteryAPI.archiveStudent("s1");
    globalThis.localStorage = { getItem: () => JSON.stringify({ uid: "student" }) };
    await assert.rejects(SchemaMasteryAPI.archiveStudent("s1"), /sign in to the Faculty Portal/);
    assert.equal(requests, 1);
});
