import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile(new URL("../src/utils/auth.js", import.meta.url), "utf8");
const student = { uid: "backend_student", name: "Anjana", email: "anjana@example.com", role: "student" };
const fallback = uid => ({ uid, id: uid, name: "Learner", display_name: "Learner", email: "", role: "student", auth_source: "runtime_fallback" });
const deferred = () => {
    let resolve;
    const promise = new Promise(done => { resolve = done; });
    return { promise, resolve };
};

async function setup({ cached = student, getProfile = async uid => fallback(uid), sync = async () => {} } = {}) {
    const storage = new Map(cached ? [["codequest_user", JSON.stringify(cached)]] : []);
    let listener;
    const context = vm.createContext({ console,
        localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) },
        sessionStorage: { clear() {} },
    });
    const module = new vm.SourceTextModule(source, { context });
    await module.link(specifier => {
        const exports = specifier === "firebase/auth"
            ? { getAuth: () => ({}), onAuthStateChanged: (auth, callback) => { listener = callback; }, signOut: async () => {} }
            : specifier.includes("GameManager")
                ? { GameManager: { syncWithFirebase: sync, resetAll() {} } }
                : { AuthAPI: { getProfile } };
        return new vm.SyntheticModule(Object.keys(exports), function () {
            for (const [key, value] of Object.entries(exports)) this.setExport(key, value);
        }, { context });
    });
    await module.evaluate();
    return { auth: module.namespace, emit: user => listener(user), saved: () => JSON.parse(storage.get("codequest_user") ?? "null") };
}

test("refresh preserves cached name, email and identity over a Learner fallback", async () => {
    const app = await setup();
    await app.auth.initAuthListener();
    assert.equal(app.auth.getCurrentUser().name, "Anjana");
    assert.equal(app.saved().email, student.email);
    assert.equal(app.saved().uid, student.uid);
});

test("Firebase cannot replace a cached backend session with a different account", async () => {
    const app = await setup();
    await app.auth.initAuthListener();
    await app.emit({ uid: "old_firebase_user", displayName: "Someone Else" });
    assert.equal(app.saved().uid, student.uid);
    assert.equal(app.saved().name, student.name);
});

test("same-UID Firebase callback also preserves backend profile details", async () => {
    const app = await setup();
    await app.auth.initAuthListener();
    await app.emit({ uid: student.uid, displayName: null, email: null });
    assert.equal(app.saved().name, student.name);
    assert.equal(app.saved().email, student.email);
});

test("Firebase null does not finish boot before cached profile hydration", async () => {
    const profile = deferred();
    const app = await setup({ getProfile: () => profile.promise });
    let ready = false;
    const initialization = app.auth.initAuthListener().then(() => { ready = true; });
    await app.emit(null);
    assert.equal(ready, false);
    profile.resolve({ ...student, name: "Updated Name" });
    await initialization;
    assert.equal(app.saved().name, "Updated Name");
});

test("offline backend keeps the cached login", async () => {
    const app = await setup({ getProfile: async () => { throw new Error("offline"); } });
    await app.auth.initAuthListener();
    assert.equal(app.saved().name, student.name);
});

test("teacher role survives runtime fallback hydration", async () => {
    const app = await setup({ cached: { ...student, role: "teacher" } });
    await app.auth.initAuthListener();
    assert.equal(app.auth.getUserRole(), "teacher");
});

test("legacy Firebase restoration waits and preserves Firebase details", async () => {
    const app = await setup({ cached: null });
    let ready = false;
    const initialization = app.auth.initAuthListener().then(() => { ready = true; });
    await Promise.resolve();
    assert.equal(ready, false);
    await app.emit({ uid: "firebase_student", displayName: "Real Name", email: "real@example.com" });
    await initialization;
    assert.equal(app.saved().name, "Real Name");
    assert.equal(app.saved().email, "real@example.com");
});

test("late profile response cannot restore a logged-out cached session", async () => {
    const profile = deferred();
    const app = await setup({ getProfile: () => profile.promise });
    const initialization = app.auth.initAuthListener();
    await app.auth.logout();
    profile.resolve(student);
    await initialization;
    assert.equal(app.saved(), null);
    assert.equal(app.auth.getCurrentUser(), null);
});

test("late Firebase profile cannot replace a newly signed-in backend user", async () => {
    const profile = deferred();
    const app = await setup({ cached: null, getProfile: () => profile.promise });
    const initialization = app.auth.initAuthListener();
    const restoration = app.emit({ uid: "old_firebase" });
    app.auth.setCurrentUser(student);
    profile.resolve(fallback("old_firebase"));
    await restoration;
    await initialization;
    assert.equal(app.saved().uid, student.uid);
});
