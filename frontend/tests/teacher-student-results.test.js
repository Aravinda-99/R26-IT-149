import test from "node:test";
import assert from "node:assert/strict";
import { mergeTeacherStudents, visiblePostTestResults } from "../src/pages/teacher/TeacherStudentResults.js";

const latest = { student_id: "student-1", concept_name: "Arrays", post_test_score: 0.7,
    mastery_level: "Good Progress", learning_status: "Progressing Well", next_action: "DONE", created_at: "2026-10-20" };

test("latest submission updates an existing registered student without an email duplicate", () => {
    const result = mergeTeacherStudents([
        [{ uid: "student-1", email: "student@example.com", name: "Student" }],
        [{ studentId: "student-1", overall_state: "Enrolled", overall_mastery: 0 }],
    ], [latest, { ...latest, post_test_score: 0.1, mastery_level: "Learn Again", created_at: "2026-10-19" }]);
    assert.equal(result.length, 1);
    assert.equal(result[0].masteryLevel, "Good Progress");
    assert.equal(result[0].postTestScore, 0.7);
    assert.equal(result[0].conceptName, "Arrays");
    assert.equal(result[0].email, "student@example.com");
});

test("result-only students are visible and old attempts cannot overwrite latest", () => {
    const result = mergeTeacherStudents([], [{ ...latest, created_at: "2026-01-01", next_action: "LEARN_AGAIN" }, latest]);
    assert.equal(result.length, 1);
    assert.equal(result[0].nextAction, "DONE");
});

test("registered teacher accounts are excluded and real zero scores retained", () => {
    const result = mergeTeacherStudents([[{ uid: "teacher-1", role: "teacher" }]], [{ ...latest, post_test_score: 0 }]);
    assert.equal(result.length, 1);
    assert.equal(result[0].postTestScore, 0);
});

test("archived students cannot reappear from auth, stale cache or post-test history", () => {
    const archived = [{ student_id: "student-1", email: "student@example.com" }];
    const result = mergeTeacherStudents([
        [{ uid: "student-1", email: "student@example.com" }],
        [{ studentId: "alternate-id", email: "STUDENT@example.com" }],
    ], [latest], archived);
    assert.equal(result.length, 0);
    const restored = mergeTeacherStudents([[{ uid: "student-1" }]], [latest], []);
    assert.equal(restored.length, 1);
    assert.equal(restored[0].masteryLevel, "Good Progress");
});

test("post-test history hides archived IDs and email aliases unless explicitly included", () => {
    const records = [latest, { student_id: "alias", student_email: "LEARNER@example.com" }, { student_id: "active" }];
    const archived = [{ student_id: "student-1", email: "learner@example.com" }];
    assert.deepEqual(visiblePostTestResults(records, archived).map(r => r.student_id), ["active"]);
    assert.equal(visiblePostTestResults(records, archived, true).length, 3);
    assert.equal(records.length, 3, "Filtering must preserve the saved history");
});
