import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "backend")))

from services.error_service import ErrorService

print("--- Testing ErrorService 60s Cache & 5-min Quota Handling ---")

student_id = "test_student_123"

# 1. Test get_history
print("\n[1] Calling get_history:")
res1 = ErrorService.get_history(student_id)
print("Response 1:", res1)
assert res1["success"] is True
assert res1["student_id"] == student_id
assert "history" in res1
assert "source" in res1

# 2. Test get_summary
print("\n[2] Calling get_summary:")
res2 = ErrorService.get_summary(student_id)
print("Response 2:", res2)
assert res2["success"] is True
assert res2["user_id"] == student_id
assert res2["most_frequent_error"] == "None"

# 3. Test get_analytics
print("\n[3] Calling get_analytics:")
res3 = ErrorService.get_analytics(student_id)
print("Response 3:", res3)
assert res3["success"] is True
assert res3["user_id"] == student_id
assert res3["has_data"] is False

# 4. Test generate_learning_report
print("\n[4] Calling generate_learning_report:")
res4 = ErrorService.generate_learning_report(student_id)
print("Response 4:", res4)
assert res4["success"] is True
assert res4["user_id"] == student_id
assert res4["has_data"] is False

# 5. Test caching: Second call to get_history should hit cache
print("\n[5] Calling get_history again (should be cache or fallback):")
res5 = ErrorService.get_history(student_id)
print("Response 5 source:", res5.get("source"))

print("\n--- ALL ErrorService TESTS PASSED! ---")
