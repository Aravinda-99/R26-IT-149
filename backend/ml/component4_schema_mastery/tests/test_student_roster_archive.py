import os
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..")))

from flask import Flask
from routes.schema_mastery_routes import schema_mastery_bp
from routes.auth_routes import auth_bp
from services.student_roster_service import StudentRosterService
from services.schema_post_test_result_service import SchemaPostTestResultService


class TestStudentArchive(unittest.TestCase):
    def setUp(self):
        directory = tempfile.TemporaryDirectory(dir=os.path.dirname(__file__), prefix="archive-test-")
        self.addCleanup(directory.cleanup)
        for target, filename in [("services.student_roster_service.ARCHIVES_FILE", "archives.json"),
                                 ("services.schema_post_test_result_service.RESULTS_FILE", "results.json")]:
            patcher = patch(target, os.path.join(directory.name, filename))
            patcher.start()
            self.addCleanup(patcher.stop)
        self.users = {
            "teacher": {"uid": "teacher", "role": "teacher"},
            "student": {"uid": "student", "name": "Student", "email": "student@example.com", "role": "student"},
        }
        patcher = patch("services.student_roster_service.UserStorageService.get_user", side_effect=lambda uid: self.users.get(uid))
        patcher.start()
        self.addCleanup(patcher.stop)
        app = Flask(__name__)
        app.register_blueprint(schema_mastery_bp, url_prefix="/api/schema-mastery")
        app.register_blueprint(auth_bp, url_prefix="/api/auth")
        self.client = app.test_client()
        self.headers = {"Authorization": "Bearer " + StudentRosterService.issue_token(self.users["teacher"])}

    def test_archive_restore_preserves_account_and_saved_results(self):
        saved = SchemaPostTestResultService.save_local_result({"student_id": "student", "session_id": "post", "post_test_score": 0.7})
        before = dict(self.users["student"])
        response = self.client.post("/api/schema-mastery/roster/student/archive", headers=self.headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(StudentRosterService.active_students([{"studentId": "student"}]), [])
        self.assertEqual(self.client.get("/api/schema-mastery/roster/archived", headers=self.headers).get_json()["count"], 1)
        self.assertEqual(self.users["student"], before)
        self.assertEqual(SchemaPostTestResultService.get_latest_for_student("student")["result_id"], saved["result_id"])
        self.assertEqual(self.client.post("/api/schema-mastery/roster/student/restore", headers=self.headers).status_code, 200)
        self.assertEqual(StudentRosterService.archived_students(), [])
        self.assertEqual(len(StudentRosterService.active_students([{"studentId": "student"}])), 1)
        self.assertEqual(SchemaPostTestResultService.get_latest_for_student("student")["post_test_score"], 0.7)

    def test_rejects_unauthenticated_student_and_forged_tokens(self):
        path = "/api/schema-mastery/roster/student/archive"
        self.assertEqual(self.client.post(path).status_code, 401)
        for token in ("cq_token_teacher", StudentRosterService.issue_token(self.users["student"])):
            self.assertEqual(self.client.post(path, headers={"Authorization": "Bearer " + token}).status_code, 403)
        self.assertEqual(StudentRosterService.archived_students(), [])

    def test_cannot_archive_teacher_or_unknown_student(self):
        self.assertEqual(self.client.post("/api/schema-mastery/roster/teacher/archive", headers=self.headers).status_code, 400)
        self.assertEqual(self.client.post("/api/schema-mastery/roster/missing/archive", headers=self.headers).status_code, 404)

    def test_result_only_student_can_be_archived_and_new_results_do_not_restore(self):
        SchemaPostTestResultService.save_local_result({"student_id": "old-test", "session_id": "post", "student_name": "Test", "student_email": "test@example.com"})
        self.assertEqual(self.client.post("/api/schema-mastery/roster/old-test/archive", headers=self.headers).status_code, 200)
        SchemaPostTestResultService.save_local_result({"student_id": "old-test", "session_id": "new-post"})
        self.assertEqual(StudentRosterService.active_students([{"studentId": "old-test"}]), [])

    def test_login_issues_signed_roster_session_after_authentication(self):
        with patch("routes.auth_routes.AuthService.authenticate_user", return_value=(self.users["teacher"], None)):
            response = self.client.post("/api/auth/login", json={"email": "teacher@example.com", "password": "test"})
        token = response.get_json()["roster_token"]
        self.assertEqual(StudentRosterService.verify_teacher(token)["uid"], "teacher")


if __name__ == "__main__":
    unittest.main()
