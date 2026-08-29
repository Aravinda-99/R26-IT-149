import os
import sys

# Ensure we can import from the current directory
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from firebase.firebase_service import db

if not db:
    print("[ERROR] Firebase is offline or not initialized.")
    sys.exit(1)

print("[INFO] Connected to Firestore successfully!")
print("Checking 'error_history' collection...\n")

try:
    docs = list(db.collection("error_history").stream())
    print(f"Total documents found in 'error_history': {len(docs)}")
    if docs:
        print("\nLast 3 entries:")
        # Sort by timestamp
        docs_sorted = sorted(docs, key=lambda x: x.to_dict().get("timestamp", ""), reverse=True)
        for doc in docs_sorted[:3]:
            data = doc.to_dict()
            print(f"- Document ID: {doc.id}")
            print(f"  Student ID:  {data.get('student_id')}")
            print(f"  Timestamp:   {data.get('timestamp')}")
            print(f"  Concept:     {data.get('concept')}")
            print(f"  Label:       {data.get('label')}")
            print(f"  Reason Grp:  {data.get('reason_group')}")
            print(f"  Code:        {data.get('code')}")
            print("-" * 40)
    else:
        print("\n[!] No documents found yet.")
        print("    Go to the frontend Quiz Lab (http://localhost:3000/student/quiz), select a few wrong answers,")
        print("    and verify that telemetry requests are successfully sent to the backend.")
except Exception as e:
    print(f"[ERROR] Failed to query Firestore: {e}")
