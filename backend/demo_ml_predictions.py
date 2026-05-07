"""
Adaptive Learning Path Generator
==================================
ML Model Live Demo — Viva Presentation
"""

import requests

URL = "http://127.0.0.1:5000/api/adaptive/predict"

students = [
    {
        "name":               "Student A — Fast Learner",
        "avg_attempts":       1.0,
        "avg_time_sec":       15.0,
        "engagement_score":   1.0,
        "current_difficulty": "beginner",
        "topic_scores": {"variables":0.95,"operators":0.90,"loops":0.92,"arrays":0.88,"methods":0.85}
    },
    {
        "name":               "Student B — Average Learner",
        "avg_attempts":       1.5,
        "avg_time_sec":       45.0,
        "engagement_score":   0.93,
        "current_difficulty": "beginner",
        "topic_scores": {"variables":0.75,"operators":0.60,"loops":0.70,"arrays":0.55,"methods":0.65}
    },
    {
        "name":               "Student C — Struggling Learner",
        "avg_attempts":       4.5,
        "avg_time_sec":       110.0,
        "engagement_score":   0.72,
        "current_difficulty": "intermediate",
        "topic_scores": {"variables":0.40,"operators":0.30,"loops":0.25,"arrays":0.35,"methods":0.20}
    },
    {
        "name":               "Student D — Advanced Student",
        "avg_attempts":       1.0,
        "avg_time_sec":       19.0,
        "engagement_score":   1.0,
        "current_difficulty": "intermediate",
        "topic_scores": {"variables":0.98,"operators":0.95,"loops":0.92,"arrays":0.88,"methods":0.85}
    },
    {
        "name":               "Student E — Needs More Practice",
        "avg_attempts":       3.2,
        "avg_time_sec":       95.0,
        "engagement_score":   0.80,
        "current_difficulty": "advanced",
        "topic_scores": {"variables":0.60,"operators":0.45,"loops":0.38,"arrays":0.50,"methods":0.42}
    },
    {
        "name":               "Student F — Steady Performer",
        "avg_attempts":       1.8,
        "avg_time_sec":       55.0,
        "engagement_score":   0.93,
        "current_difficulty": "intermediate",
        "topic_scores": {"variables":0.80,"operators":0.72,"loops":0.68,"arrays":0.75,"methods":0.70}
    },
]

GREEN  = '\033[92m'
YELLOW = '\033[93m'
RED    = '\033[91m'
BOLD   = '\033[1m'
RESET  = '\033[0m'
CYAN   = '\033[96m'

action_colors  = {'promote': GREEN,  'maintain': YELLOW, 'demote': RED}
action_icons   = {'promote': 'PROMOTE', 'maintain': 'MAINTAIN', 'demote': 'DEMOTE'}
action_arrows  = {'promote': 'MOVE UP', 'maintain': 'STAY', 'demote': 'MOVE DOWN'}

print()
print(f"{BOLD}{'='*65}{RESET}")
print(f"{BOLD}   ADAPTIVE LEARNING PATH GENERATOR — ML MODEL LIVE DEMO{RESET}")
print(f"{BOLD}{'='*65}{RESET}")
print(f"{CYAN}   Model     : Gradient Boosting Classifier{RESET}")
print(f"{CYAN}   Dataset   : ASSISTments + OULAD + UCI (94,818 sessions){RESET}")
print(f"{CYAN}   Accuracy  : 83%  |  5-Fold CV: 82.4% +/- 0.12%{RESET}")
print(f"{BOLD}{'='*65}{RESET}")

all_results = []

for i, student in enumerate(students, 1):
    payload = {k: v for k, v in student.items() if k != 'name'}
    try:
        response = requests.post(URL, json=payload, timeout=5)
        result   = response.json()
    except Exception as e:
        print(f"{RED}Error: {e}{RESET}")
        break

    action     = result.get('action', 'unknown')
    color      = action_colors.get(action, RESET)
    icon       = action_icons.get(action, action.upper())
    arrow      = action_arrows.get(action, '')
    confidence = result.get('confidence', 0)
    next_diff  = result.get('next_difficulty', '-')
    next_topic = result.get('next_topic', '-')
    curr_diff  = student['current_difficulty']
    topic_scores  = student['topic_scores']
    weakest       = min(topic_scores, key=topic_scores.get)
    weakest_score = topic_scores[weakest]

    all_results.append({
        'name': student['name'], 'action': action, 'color': color,
        'icon': icon, 'confidence': confidence,
        'next_diff': next_diff, 'next_topic': next_topic,
    })

    print()
    print(f"{BOLD}  [{i}] {student['name']}{RESET}")
    print(f"  {'-'*55}")
    print(f"  INPUT:")
    print(f"    Current difficulty : {BOLD}{curr_diff.upper()}{RESET}")
    print(f"    Avg attempts       : {student['avg_attempts']}")
    print(f"    Avg time/question  : {student['avg_time_sec']}s")
    print(f"    Engagement score   : {student['engagement_score']}")
    print(f"    Weakest topic      : {weakest} ({weakest_score*100:.0f}%)")
    print(f"  ML MODEL OUTPUT:")
    print(f"    Recommendation     : {color}{BOLD}{icon} [{arrow}]{RESET}")
    print(f"    Confidence         : {BOLD}{confidence}%{RESET}")
    print(f"    Next level         : {BOLD}{next_diff.upper()}{RESET}")
    print(f"    Next topic         : {BOLD}{next_topic.upper()}{RESET}")

print()
print(f"{BOLD}{'='*65}{RESET}")
print(f"{BOLD}   SUMMARY{RESET}")
print(f"{BOLD}{'='*65}{RESET}")
print(f"  {'Student':<32} {'Action':<12} {'Next Level':<15} {'Next Topic'}")
print(f"  {'-'*65}")

for r in all_results:
    print(f"  {r['name']:<32} "
          f"{r['color']}{r['icon']:<12}{RESET} "
          f"{r['next_diff']:<15} "
          f"{r['next_topic']}")

print(f"{BOLD}{'='*65}{RESET}")

promotes  = sum(1 for r in all_results if r['action'] == 'promote')
maintains = sum(1 for r in all_results if r['action'] == 'maintain')
demotes   = sum(1 for r in all_results if r['action'] == 'demote')

print()
print(f"  {GREEN}PROMOTE  : {promotes} student(s){RESET}")
print(f"  {YELLOW}MAINTAIN : {maintains} student(s){RESET}")
print(f"  {RED}DEMOTE   : {demotes} student(s){RESET}")
print()