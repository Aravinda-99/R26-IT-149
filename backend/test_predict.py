import requests

url = "http://127.0.0.1:5000/api/adaptive/predict"

data = {
    "avg_attempts":       1.2,
    "avg_time_sec":       18.5,
    "engagement_score":   0.98,
    "current_difficulty": "beginner",
    "topic_scores": {
        "variables":  0.9,
        "operators":  0.5,
        "loops":      0.8,
        "arrays":     0.7,
        "methods":    0.6
    }
}

response = requests.post(url, json=data)

print("Status code:", response.status_code)
print("Response:")
print(response.json())