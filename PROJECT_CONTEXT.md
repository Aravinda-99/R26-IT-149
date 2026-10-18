# PROJECT_CONTEXT — CodeQuest (R26-IT-149)

Snapshot of the codebase as of branch `Intelliget-mine-updated-pp2` (same commit as `All-Connected-Success`, `da1abd263`).
Everything below is taken from the code. Anything the code doesn't establish is marked **unclear from code**.

---

## 1. Project overview

CodeQuest is a web platform for teaching beginners Java programming. It has four research components plus a wellbeing/emotion add-on:

| # | Component | Backend route prefix | Main service | Main frontend |
|---|-----------|----------------------|--------------|---------------|
| 1 | Adaptive Learning Path Generator | `/api/adaptive` | `services/adaptive_service.py` | `learningPathGen/quizLab.js`, `roadmap.js`, `pages/learning-path.js` |
| 2 | **Intelligent Error Pattern Detector** | `/api/errors` | `services/error_service.py` | `pages/error-analysis.js` |
| 3 | Gamified Reinforcement (Phaser games) | `/api/gamification` | `services/gamification_service.py` | `pages/games.js`, `game/**` |
| 4 | Schema Mastery Tracker (+ LLM question bank, post-test) | `/api/mastery`, `/api/schema-mastery` | `services/mastery_service.py`, `schema_mastery_service.py`, `schema_session_service.py`, `schema_post_test_service.py`, `schema_llm_question_service.py`, `schema_question_bank_service.py` | `pages/posttest.js`, `pages/mastery.js`, `pages/teacher/*` |
| – | Wellbeing / struggle detection | `/api/wellbeing` | `services/wellbeing_service.py` | `game/ml/*` (webcam emotion and fatigue, in the browser) |
| – | Auth (local + Firebase) | `/api/auth` | `services/auth_service.py`, `user_storage_service.py` | `pages/login.js`, `register.js`, `pages/auth/*` |

### Architecture

```
Browser (Vite SPA, hash router in src/main.js, port 3000)
  │  /api/*  (proxied by vite.config.js → http://127.0.0.1:5000)
  ▼
Flask app (backend/app.py, port 5000) — 7 blueprints
  ├── services/*  (business logic + scikit-learn models loaded with joblib)
  ├── ml_models/*.pkl|.joblib  (C1, C2, wellbeing models)
  ├── ml/component4_schema_mastery/models/*.pkl  (C4 models)
  ├── data/*.json  (local fallback storage for users / C4 sessions)
  └── firebase/firebase_service.py → Cloud Firestore (optional; offline mode if no key)
       └── Gemini / OpenAI (C4 question generation only, via .env)
```

### End-to-end student flow (as wired in code)

1. **Pre-test (Component 1, `quizLab.js`).** The student answers MCQs from `learningPathGen/data.js`. Each fill-in-the-blank question has a `codeTemplate` containing `{BLANK}`.
   - On every option click, the chosen option is substituted into `{BLANK}` and the resulting snippet is sent to `POST /api/errors/analyze` ("telemetry").
   - On submit, quiz accuracy and behaviour metrics go to `POST /api/adaptive/predict`, which returns the next difficulty and topic.
   - Every wrong answer's snippet is analysed again with `/api/errors/analyze`. The full response is stored on the item in sessionStorage/localStorage.
   - `POST /api/errors/top-misconception` saves the weakest topic.
2. **Error Feedback (Component 2, `error-analysis.js`).** Shows the wrong answers, each with its stored model response. It also shows history, analytics charts (Chart.js), and the learning report.
3. **Component 2 → Component 4 handoff.** Each successful `/analyze` call saves `error_type`, `error_pattern_score`, and `error_reason` into the learner's Schema Mastery session (`component_2` block). The frontend also saves it separately through `POST /api/schema-mastery/session/component2`.
4. **Games (Component 3).** Phaser levels. `FocusArea.js` and `StudentDashboard.js` read `GET /api/errors/summary` to pick a focus concept.
5. **Understanding Check / post-test (Component 4, `posttest.js`).** Uses the saved C2 `error_type` to choose questions and `error_pattern_score` as a model feature. C4 then predicts mastery level and next action (Random Forest pipeline).

---

## 2. Tech stack

| Layer | What is actually used |
|---|---|
| Frontend | Vanilla JS ES modules, Vite 5.4, hash router (`src/main.js`), Chart.js 4.4, Phaser 3.60, Firebase Web SDK 10.12, `onnxruntime-web` 1.19 (emotion CNN in the browser), `@mediapipe/tasks-vision` 0.10 (face landmarks / fatigue) |
| Backend | Python 3.10+ (local machine runs 3.12.6), Flask 3.0.0, Flask-CORS 4.0.0, python-dotenv, `requests` |
| ML (backend) | scikit-learn **1.8.0** (pinned), pandas, joblib 1.3.0. Models: LinearSVC + TF-IDF (C2), Gradient Boosting `model.pkl` (C1, per its docstring), Random Forest / Decision Tree pipelines (C4), Isolation Forest + scaler (wellbeing) |
| ML (research notebooks) | `analytics-ml/notebooks/01–06` — FER/FER+ emotion CNN (PyTorch `.pth` → ONNX), fatigue (EAR), behavioural Isolation Forest, fusion logic |
| LLM | Google Gemini (default) or OpenAI. Used **only** by Component 4 question generation (`schema_llm_question_service.py`, configured through `LLM_PROVIDER` / `LLM_MODEL` in `.env`) |
| Database | Cloud Firestore through Firebase Admin SDK 6.2.0. Each service also has in-memory and/or local JSON fallbacks, because the Firestore free tier often returns 429 errors |
| Auth | Local hashed-password users (`data/registered_users.json`, seeded from `.env` by `scripts/seed_users.py`) plus Firebase token verification |

---

## 3. Component 2 — Intelligent Error Pattern Detector (detailed)

### 3.1 Files

| File | Role |
|---|---|
| [backend/services/error_service.py](backend/services/error_service.py) | **Core logic (1,902 lines).** Model loading, input validation, preprocessing, two-stage prediction, rule layer, confidence fusion, label consistency, XAI text, feedback templates, history persistence, summary, analytics, learning report |
| [backend/routes/error_routes.py](backend/routes/error_routes.py) | Flask blueprint `/api/errors`. Also: 60 s per-user response cache, a filter that drops repeated GET access-log lines, teacher-ID skip (`TEA*`/`TCH*`/`ADMIN*` → empty payloads), and the auto-save into C4 sessions after `/analyze` |
| [backend/ml_models/best_error_detection_model.pkl](backend/ml_models/best_error_detection_model.pkl) | Stage-1 model: broad error class (5 classes) |
| [backend/ml_models/best_reason_detection_model.pkl](backend/ml_models/best_reason_detection_model.pkl) | Stage-2 model: reason group (12 classes) |
| [backend/services/schema_session_service.py](backend/services/schema_session_service.py) | `calculate_error_pattern_score()` and `SchemaSessionService.save_component_2_data()`. Bridge from C2 to C4 |
| [backend/services/schema_post_test_service.py](backend/services/schema_post_test_service.py) | Reads the C2 `error_type` / `error_pattern_score` to select post-test questions and build C4 features |
| [frontend/src/pages/error-analysis.js](frontend/src/pages/error-analysis.js) | Error Feedback dashboard (1,235 lines): result panel, XAI bullets, history list, analytics charts, learning report tab |
| [frontend/src/api/api.js](frontend/src/api/api.js) | `ErrorAPI` wrapper (lines ~62–72) |
| [frontend/src/learningPathGen/quizLab.js](frontend/src/learningPathGen/quizLab.js) | **Where the analysed code comes from**: `buildFullCodeFromTemplate`, `sendTelemetry`, analysis of wrong answers on submit, `saveTopMisconception` |
| [frontend/src/learningPathGen/data.js](frontend/src/learningPathGen/data.js) | Question bank. 21 occurrences of `codeTemplate` with `{BLANK}` |
| `frontend/src/pages/student/FocusArea.js`, `StudentDashboard.js` | Read `/summary` → `recommended_focus` / `most_frequent_error` to pick games and the dashboard topic |
| `frontend/src/pages/teacher/TeacherDashboard.js`, `pages/posttest.js` | Read the C2 fields stored in the C4 session context |
| `backend/check_db.py` | Dumps the Firestore `error_history` collection |
| `backend/scratch/test_api_fixes.py` | Manual script for the history/summary/analytics/report cache and 429 fallback |
| `backend/test_system_confirmation.py` | Smoke check that loads both models and runs one analysis |
| `backend/ml/component4_schema_mastery/tests/test_component4_pipeline.py::test_component_2_error_analyze` | The only automated test that hits `/api/errors/analyze`. It asserts HTTP 200 only |

Not in the repo: any training script, notebook, or dataset for the two C2 models, and any C2 evaluation results. Git history shows the pickles were added in commits `2f028d2b8` ("latest changes of the error pattern detector") and `2ec629e1c` ("added a new model").

### 3.2 How errors are collected

The detector does **not** receive compiler or runtime errors. Its input is the **source code of a Java snippet**, sent as a string. In practice that snippet is built by the quiz:

- **Fill-in-the-blank questions.** `codeTemplate.replace("{BLANK}", chosenOption)`, e.g. `"int {BLANK} = 10;"`.
- **Other MCQs.** `"// <Topic> Error\n" + chosenOptionText`. This is only sent for wrong answers at submit time.

Calls happen in three places:
1. Every option click, fire-and-forget (`sendTelemetry`, quizLab.js ~L97). It uses the hard-coded `pretest_results: {variables:3, loops:3, arrays:3, methods:3}`, and the result goes to `sessionStorage.latest_error_analysis`.
2. Once per wrong answer on quiz submit (quizLab.js ~L819), with a pre-test signal built from the topic breakdown.
3. On-demand from the Error Feedback list when a row has code but no stored response (error-analysis.js ~L650).

### 3.3 Preprocessing (`ErrorService.analyze` pipeline)

1. **Validation** (`validate_java_submission`). Input is accepted if any of 9 Java regexes match: `class X`, `public static void main`, typed declaration `int x =`, `int[] a =`, `for (`, `while (`, `System.out.println(`, static method header, and so on. Otherwise the call returns `success:false, error_type:"INVALID_JAVA_INPUT"`.
2. **Cleaning for ML** (`clean_java_code`). Removes `/* */` and `//` comments, `import …;`, and `package …;`. Removes whitespace inside `[...]`. Collapses all whitespace to one space. The docstring says this "match[es] training data format". The training pipeline itself is **unclear from code**.
3. **Separate "stripped" text for rules.** Comments are removed and `[...]` whitespace is normalised, but newlines are kept.

### 3.4 Models and algorithms

**Stage 1 — broad classifier** (`best_error_detection_model.pkl`). This was confirmed by loading the pickle.
- `Pipeline([("tfidf", TfidfVectorizer(ngram_range=(1,2), max_features=5000, lowercase=True, token_pattern=r"(?u)\b\w\w+\b")), ("classifier", LinearSVC(C=1.0, random_state=42))])`
- Classes: `ARRAY_ERROR, CORRECT, LOOP_ERROR, METHOD_ERROR, VARIABLE_ERROR`

**Stage 2 — reason-group classifier** (`best_reason_detection_model.pkl`).
- Same pipeline type. TF-IDF `max_features=7000`, learned vocabulary is 5,128 terms. LinearSVC `C=1.0`.
- 12 classes: `ARRAY_BOUNDARY_INDEX_ISSUE, ARRAY_TRAVERSAL_ISSUE, CORRECT_NO_ERROR, LOOP_BOUNDARY_ISSUE, LOOP_CONDITION_ISSUE, LOOP_CONTROL_FLOW_ISSUE, LOOP_UPDATE_ISSUE, METHOD_PARAMETER_USAGE_ISSUE, METHOD_RETURN_ISSUE, METHOD_SIGNATURE_ISSUE, VARIABLE_ASSIGNMENT_ISSUE, VARIABLE_CALCULATION_ISSUE`
- Both stages run **independently on the same cleaned text**. Stage 2 is not conditioned on Stage 1.

**Features.** Bag of word unigrams and bigrams over the cleaned code. The default token pattern drops 1-character tokens and all punctuation and operators, so `<`, `<=`, `+`, `-`, `[`, `]`, `;` and variables like `i` are **not features**. No AST, compiler, or handcrafted features go into the ML stage.

**Training data and datasets.** **Unclear from code.** No C2 dataset is in the repo. `backend/data/final_dataset_ready.csv` is Component 1's dataset (ASSISTments/OULAD/UCI behaviour features), not C2's.

**Hybrid rule layer** (regex only, no LLM):
- **Confidence.** `svm_conf_pct = clamp(35..97, 50 + 22·max(decision_function))`. A `rule_validation_score` starts at 0.5 and moves ±0.2–0.4 depending on whether label-specific regexes confirm the predicted class. `final = 0.6·svm_pct + 40·rule_score`, giving High ≥80, Medium ≥50, Low <50.
- **Override 1, always applied.** `detect_method_argument_mismatch` compares declared parameter counts against call-site argument counts. A mismatch forces `METHOD_ERROR` / `METHOD_SIGNATURE_ISSUE`.
- **Override 2.** `detect_obviously_correct_java` first checks 13 error regexes, in this order: arity, `a[a.length]`, literal out-of-bounds index, `<=` in for-header, loop starting at 1, empty for-update, `while(true)` without break, while without counter update, `discount` used with `+ * /`, `add()` that subtracts, void returning a value, non-void without return, self-assignment `x = x;`.
  - If none match **and** the whole snippet fully matches one of 13 "safe" patterns, the result is forced to `CORRECT`.
  - If ML said `CORRECT` but an error regex matched, the label is remapped to that error's class.
- **Consistency.** If the Stage-2 reason doesn't belong to the final broad label (`allowed_mapping`), it is replaced with a fixed fallback (e.g. `LOOP_ERROR → LOOP_CONDITION_ISSUE`).
- **Feedback.** Static templates per reason group (`_get_reason_details`): reason, misconception, fix, a beginner analogy, a gamification payload, and an adaptive payload. XAI text (`_generate_xai_explanation`) comes from regex "signals" plus templated narrative, `why_not_correct`, and 3 debugging steps.
- **Pre-test alignment** (`_align_with_pretest`). If `pretest_results[concept] <= 2`, the message says the error "matches a weak area".

### 3.5 API endpoints (`/api/errors`)

| Method | Path | Purpose |
|---|---|---|
| POST | `/analyze` | Analyse one snippet. Persists to history and auto-saves the C2 block of the C4 session |
| GET | `/history/<user_id>` | Last 10 history entries (`total` = all entries) |
| GET | `/latest/<user_id>` | Last full response (in memory). Otherwise **re-analyses** the last stored code |
| GET | `/summary/<user_id>` | Counts per broad label, `most_frequent_error`, `recommended_focus` |
| POST | `/top-misconception` | Saves the quiz-derived top misconception (`student_misconceptions` collection, `student_behaviour/<id>` doc) |
| GET | `/analytics/<user_id>` | Feature 1: ISO-week buckets, per-category weekly counts, first-half vs second-half improvement, error-free rate |
| GET | `/learning-report/<user_id>` | Feature 3: strengths, recurring mistakes (≥25 % of submissions), recently improved, new mistakes, focus/avoid lists, summary text |

GET responses are cached for 60 s per user (`Cache-Control: private, max-age=60`). The cache is cleared on `/analyze` and `/top-misconception` for that user. Errors return HTTP 200 with a `source:"fallback"` payload.

**`POST /api/errors/analyze` — request**
```json
{
  "student_id": "stu_001",
  "code": "int[] arr = {1,2,3};\nfor (int i = 0; i <= arr.length; i++) {\n  System.out.println(arr[i]);\n}",
  "pretest_results": { "variables": 3, "loops": 1, "arrays": 2, "methods": 4 }
}
```
The route accepts `student_id | studentId | user_id | userId`, but the service reads only `student_id` (see §4).

**Response.** This is real output from a local run, with `model_trace` omitted for length:
```json
{
  "success": true,
  "student_id": "stu_001",
  "predicted_label": "ARRAY_ERROR",
  "reason_group": "ARRAY_BOUNDARY_INDEX_ISSUE",
  "confidence_score": 85,
  "rule_override_status": { "applied": false, "reason": "None", "badge": "None" },
  "explanation_steps": ["1. Locate where the array is indexed (e.g., arr[index]).", "2. ...", "3. ..."],
  "why_not_correct": "This code was not marked correct because a logic mistake was detected under the Arrays concept, specifically flagged as Array Boundary Index Issue.",
  "analysis_source": "Two-stage ML prediction",
  "model_1": "Linear SVM broad error classifier",
  "model_2": "Linear SVM reason-group classifier",
  "broad_label": "ARRAY_ERROR",
  "reason_group_original": "ARRAY_BOUNDARY_INDEX_ISSUE",
  "reason_group_adjusted": false,
  "reason_group_adjustment_reason": "None",
  "evidence": { "evidence_found": false, "matched_snippet": "", "evidence_note": "No explicit code snippet could be cleanly extracted, but the ML model detected abstract patterns supporting this reason." },
  "original_ml_label": "ARRAY_ERROR",
  "final_label": "ARRAY_ERROR",
  "override_applied": false,
  "override_reason": null,
  "hybrid_correction_badge": null,
  "pattern_hint_applied": false,
  "pattern_hint_matched": null,
  "xai_explanation": {
    "xai_label": "Array Boundary Error",
    "xai_confidence_pct": 85,
    "xai_bullet_points": [{ "icon": "🔴", "text": "Loop uses `<= array.length` — valid indices are 0 to length−1." }],
    "xai_narrative": "The model classified this as an Array Boundary Error with 85% confidence. ...",
    "xai_code_signals": ["loop boundary includes .length (off-by-one)"],
    "why_not_correct": "...",
    "explanation_steps": ["..."]
  },
  "prediction": { "label": "ARRAY_ERROR", "concept": "Arrays", "confidence_level": "High", "severity": "High" },
  "explanation": {
    "reason": "The code accesses an array index that is out of bounds (e.g. array.length).",
    "misconception": "A common mistake is thinking the highest index is equal to the array's length, when it is actually length - 1.",
    "suggested_fix": "Subtract 1 from the length when accessing the last element: array[array.length - 1].",
    "beginner_explanation": "Java arrays start counting at 0. ..."
  },
  "pretest_alignment": { "used": true, "related_score": 2, "message": "The predicted error (ARRAY_ERROR) matches a weak area identified in your pre-test for arrays." },
  "gamification_payload": { "target_concept": "Arrays", "recommended_activity": "Array Index Rescue Game", "game_type": "arcade_rescue", "difficulty": "hard", "reward_badge": "Array Guardian", "mastery_action": "reduce_array_mastery_score" },
  "adaptive_payload": { "recommended_topic": "Zero-based Indexing and Array Bounds", "next_learning_step": "Solve the Array Boundary Challenge", "priority": "High" },
  "schema_mastery_payload": { "concept": "Arrays", "schema_status": "Fragile", "evidence": "ML prediction: ARRAY_ERROR. Final label after rule validation: ARRAY_ERROR." },
  "error_pattern_score": 0.85,
  "error_pattern_score_source": "component2_confidence"
}
```
The route adds the last two fields after the service returns.

**Invalid input** (e.g. `"hello world"`):
```json
{ "success": false, "error_type": "INVALID_JAVA_INPUT",
  "error": "The submitted text does not appear to be valid Java code.",
  "message": "Please enter a valid Java class, method, variable declaration, loop, array declaration, or Java code snippet.",
  "validation_reason": "Input does not contain recognizable Java code structure." }
```

**`GET /summary/<id>`**
```json
{ "success": true, "user_id": "stu_001", "source": "firestore|cache|fallback",
  "total_analyses": 12, "counts": { "LOOP_ERROR": 5, "ARRAY_ERROR": 3 },
  "most_frequent_error": "LOOP_ERROR", "recommended_focus": "Loops" }
```

**`GET /analytics/<id>`** returns these keys: `has_data, total_submissions, weeks[], weekly_totals[{week,total_errors,total_submissions,correct}], category_weekly{CAT:[counts per week]}, improvement_scores{CAT:{pct,direction,first,second}}, overall_improvement_pct, most_improved, most_problematic, error_free_rate, total_counts`.

**`GET /learning-report/<id>`** returns these keys: `has_data, total_submissions, summary, strengths[], recurring_mistakes[{concept,count,rate_pct,message}], recently_improved[], new_mistakes[], recommended_focus[{concept,count,topics[]}], avoid_patterns[{text,concept}]`.

**`POST /top-misconception`** request: `{student_id, top_misconception, concept, total_errors, topic_breakdown, accuracy_pct, source}` → `{success, record}`.

**Persistence.** Each analysis is appended to `ErrorService._history` (in memory) and to Firestore `error_history` with the fields `student_id, code, label, original_ml_label, override_applied, concept, timestamp, activity, week_bucket, reason_group, full_response`. Reads use a 60 s cache and a 5-minute cooldown after a Firestore 429.

### 3.6 Integration with other components

| Consumer | What it uses | How |
|---|---|---|
| **Component 4 (Schema Mastery)** | `error_type` (= final `reason_group`), `error_pattern_score` (= fused confidence / 100), `error_reason` (= misconception text) | Auto-saved by `error_routes.analyze` → `SchemaSessionService.save_component_2_data`. Also saved by the frontend through `POST /api/schema-mastery/session/component2`. The post-test requires both fields for non-test users; `_error_tokens()` matches `error_type` words to questions. Both fields are features of the C4 Random Forest pipeline |
| **Component 3 (Games)** | `/summary.recommended_focus`, `most_frequent_error` | `FocusArea.js` maps the concept to a game. `gamification_payload` is only **displayed** in `error-analysis.js`. No backend game logic reads it |
| **Component 1 (Adaptive path)** | `adaptive_payload` | **Displayed only.** `adaptive_service.py` doesn't read any C2 output, and the learning path isn't regenerated from detected errors. `posttest.js` copies `adaptive_payload.next_learning_step` into the post-test context as `recommended_learning_focus` |
| Student / teacher dashboards | `/summary`, C4 session `component_2` fields | Topic label and "Error type / Error pattern score present" checklist |

### 3.7 Evaluation metrics and current results

- **No accuracy, F1, confusion matrix, or test-set results for either C2 model exist in the repo.** Their training and evaluation metrics are **unclear from code**. The response strings `"Linear SVM + TF-IDF"` and the file name `best_*` suggest a model comparison was done elsewhere.
- Automated test coverage is one HTTP-200 check (`test_component_2_error_analyze`). `test_system_confirmation.py` reads `prediction.reason_group` and `analysis["gamification"]`, and neither key exists, so it prints `None` for those lines.
- **Spot check run for this document** (7 hand-written snippets, local run, Firestore writes disabled):

| Snippet | Raw ML (stage 1 / stage 2) | Final | Conf. | Note |
|---|---|---|---|---|
| `for (i=0; i <= arr.length; i++) arr[i]` | ARRAY / ARRAY_BOUNDARY_INDEX | ARRAY_ERROR | 85 | correct |
| `int x = 10;` | **METHOD** / METHOD_PARAMETER_USAGE | CORRECT | 39 | ML wrong; rescued by safe-pattern rule |
| `add(int a,int b)` called with 3 args | METHOD / METHOD_RETURN | METHOD_ERROR / SIGNATURE | 60 | stage 2 wrong; fixed by arity rule |
| `double total = price + discount;` | VARIABLE / VARIABLE_CALCULATION | VARIABLE_ERROR | 81 | correct |
| `while (i < 5) { println(i); }` (no `i++`) | LOOP / LOOP_CONDITION | LOOP_ERROR / LOOP_CONDITION | 66 | broad label right, reason should be LOOP_UPDATE (rule match ignored, see §4) |
| `for (int i=0;i<5;i++) println(i);` | **ARRAY** / ARRAY_BOUNDARY_INDEX | CORRECT | 47 | ML wrong; rescued by rule |
| `hello world` | — | INVALID_JAVA_INPUT | — | validation works |

This is anecdotal, not an evaluation. It does suggest the raw SVMs misclassify simple correct code, and that the rule layer carries much of the correctness.

---

## 4. Component 2 — limitations, hard-coded parts, TODOs, weak areas

**Model and data**
1. No training code, dataset, or metrics for the C2 models in the repo, so the result isn't reproducible. The model can't be retrained or re-evaluated from this repo.
2. The TF-IDF token pattern drops operators and punctuation (`<`, `<=`, `+`, `-`, `[]`, `;`) and single-letter identifiers. The signals that separate most of these error classes (off-by-one, wrong operator) are invisible to the ML model. Those checks effectively happen only in the regex layer.
3. Stage 1 and Stage 2 run independently. Stage 2 often contradicts Stage 1 and is patched afterwards with a fixed fallback (e.g. any inconsistent `LOOP_ERROR` reason → `LOOP_CONDITION_ISSUE`).
4. The confidence percentage is a heuristic mapping (`50 + 22·margin`, clamped 35–97) blended with a rule score. It is not a calibrated probability, but C4 consumes it as `error_pattern_score`.
5. The pickles are pinned to scikit-learn 1.8.0. Another version may fail to unpickle or behave differently.

**Rule layer (all regex, no parser)**

6. The `{[^}]*}` patterns can't handle nested braces, so method and loop bodies with an inner block are mis-parsed.
7. Domain-specific hard-coding: the `discount` variable-name rule, the `add()` method-name rule, and the `int a = 10; int b = a++;` safe pattern. Some rules (loop start at 1, any `<=` in a for-loop) flag valid code.
8. Error-rule matches remap the label **only when ML said CORRECT**. When ML picks the right broad class but the wrong reason, a precise rule match is ignored. Example: the while-without-update case stays `LOOP_CONDITION_ISSUE`.
9. `_extract_evidence` checks only one pattern per reason. For `ARRAY_BOUNDARY_INDEX_ISSUE` it misses the `<= arr.length` loop that the XAI step does detect, so `evidence_found:false` contradicts the XAI bullets.
10. `validate_java_submission` accepts anything matching one loose regex (e.g. any text containing `for (`).
11. XAI is templated text plus regex signals. It doesn't explain the model (no SHAP/LIME/feature weights).
12. `severity` is `"High"` for every non-CORRECT result, so the C4 severity-mapping branch is effectively binary.

**Data flow and integration**

13. **Label vocabulary mismatch with C4.** The C4 dataset `error_type` values are `UNKNOWN_ERROR, TYPE_MISMATCH, SYNTAX_ERROR, METHOD_CALL_ERROR, LOOP_CONDITION_ERROR, INDEX_ERROR`. C2 sends reason groups such as `ARRAY_BOUNDARY_INDEX_ISSUE`, and none of them occur in that set. The C4 pipeline uses `OneHotEncoder(handle_unknown="ignore")`, so C2's error type most likely contributes nothing to the C4 prediction. Only the score does.
14. **Every option click** in the quiz calls `/analyze`, and every call is written to Firestore `error_history`. History, summary, analytics, and the report therefore include intermediate selections and duplicates (the same wrong answer is analysed again on submit). This inflates counts and skews "improvement".
15. `GET /latest/<id>` re-runs `analyze()` on the last stored code when the in-memory cache is empty (e.g. after a server restart). That **writes another history entry and overwrites the C4 session as a side effect of a GET**.
16. Duplicate C4 saves: the backend auto-saves after `/analyze`, and `showTelemetryResult()` in the frontend saves again. The frontend save also runs when viewing an old history item (`isHistory=true`) and defaults confidence to 80 when it's missing.
17. The route accepts `studentId/user_id/userId`, but `ErrorService.analyze` reads only `student_id`. Other aliases get stored as `"anonymous"` while the C4 session is saved under the real ID.
18. `sendTelemetry` hard-codes `pretest_results` to 3 for every concept, so pre-test alignment is meaningless for those calls.
19. Component 1 doesn't consume C2 output on the backend. `adaptive_payload` and `gamification_payload` are static per-label templates that are only displayed.
20. Analytics "improvement" compares the first half of history with the second half, not by time. With few submissions it swings to ±100 %.

**Engineering**

21. History queries stream **all** of a user's documents with no limit. Each document stores the full response (`full_response`), which grows Firestore usage and read quota. `ErrorService._history` and `_last_analysis` are unbounded in-memory structures that are lost on restart.
22. Teacher detection is by ID prefix (`TEA`, `TCH`, `ADMIN`). Analysis is skipped for those IDs, and the "analyze" skip response has no `prediction` key.
23. Errors are swallowed and returned as HTTP 200 fallbacks, which hides failures from the frontend and from tests.
24. Java only, 4 concepts (variables, loops, arrays, methods). No syntax/compile errors (e.g. a missing `;`) are modelled as a class. The smoke test's missing-semicolon sample can therefore only ever get one of the 5 logical labels.
25. Explicit TODOs: there is no `TODO` in C2 files. `gamification_service.py` is marked `TODO: Implement game data, scoring, XP…` (placeholder catalog).

---

## 5. Folder structure

Skipped: `node_modules/`, `venv/`, `__pycache__/`, `.git/`, `frontend/dist/` (124 build files, which are tracked in git despite `.gitignore`), and 117 image/audio files under `frontend/public/assets/`.

```
research_project/
├── README.md
├── .gitignore
├── gen_qs.py                         # one-off generator for Java MCQ questions (C4 seed questions)
├── analytics-ml/                     # research notebooks + artefacts for emotion / fatigue / struggle
│   ├── models/                       # behavioral_scaler, isolation_forest(_v2), face_landmarker.task
│   ├── notebooks/                    # 01_data_preprocessing … 06_ferplus_integration (.ipynb)
│   └── outputs/                      # best_model*.pth, emotion_cnn*.onnx, figures/*.png
├── backend/
│   ├── app.py                        # Flask factory, registers 7 blueprints, /api/health
│   ├── config.py                     # env config (Flask, Firebase, LLM)
│   ├── .env.example
│   ├── requirements.txt
│   ├── check_db.py                   # dumps Firestore error_history
│   ├── seed_firebase.py
│   ├── test_auth.py, test_component4.py, test_component4_context.py, test_system_confirmation.py
│   ├── data/
│   │   ├── final_dataset_ready.csv   # Component 1 training data (~94.8k rows)
│   │   ├── schema_mastery_dataset.csv
│   │   ├── mcq_questions.py, mock_students.py, registered_users.example.json
│   │   └── schema_mastery/           # local C4 session + post-test JSON stores
│   ├── firebase/firebase_service.py  # Admin SDK init → `db` (None when offline)
│   ├── middleware/error_handler.py
│   ├── models/schemas.py             # Firestore document shapes
│   ├── ml_models/
│   │   ├── best_error_detection_model.pkl    # C2 stage 1 (TF-IDF + LinearSVC, 5 classes)
│   │   ├── best_reason_detection_model.pkl   # C2 stage 2 (TF-IDF + LinearSVC, 12 classes)
│   │   ├── model.pkl                          # C1 adaptive model
│   │   ├── isolation_forest_model.joblib, isolation_forest_model_v1_backup.joblib, behavioral_scaler.joblib
│   ├── ml/component4_schema_mastery/
│   │   ├── README.md
│   │   ├── datasets/raw/*.csv, datasets/processed/schema_mastery_dataset.csv
│   │   ├── models/                   # schema_mastery_pipeline.pkl, *_model.pkl, metadata.json
│   │   ├── evaluation/               # README + comparison/confusion/feature charts
│   │   ├── legacy_rule_based/        # mastery_calculator.py (+ test)
│   │   ├── question_bank/local_storage/*.json
│   │   ├── scripts/                  # preprocess / train / predict / inspect (+ archive/)
│   │   ├── demos/, tests/, archive/
│   ├── routes/
│   │   ├── adaptive_routes.py, auth_routes.py, error_routes.py, gamification_routes.py
│   │   ├── mastery_routes.py, schema_mastery_routes.py, wellbeing.py
│   ├── services/
│   │   ├── error_service.py          # ← Component 2 core
│   │   ├── adaptive_service.py, gamification_service.py, wellbeing_service.py
│   │   ├── mastery_service.py, schema_mastery_service.py, schema_session_service.py
│   │   ├── schema_post_test_service.py, schema_post_test_result_service.py
│   │   ├── schema_question_bank_service.py, schema_llm_question_service.py
│   │   └── auth_service.py, user_storage_service.py
│   ├── scripts/                      # seed_users.py, question audit/clean/sync scripts
│   ├── scratch/test_api_fixes.py
│   └── utils/helpers.py
└── frontend/
    ├── index.html, package.json, vite.config.js
    ├── public/
    │   ├── assets/                   # game sprites/audio (117 files)
    │   └── models/                   # emotion_cnn*.onnx, face_landmarker.task (browser inference)
    ├── vite-project/                 # separate Vite template app, not referenced by main app (unclear purpose)
    └── src/
        ├── main.js                   # hash router, role-based layouts
        ├── style.css, demo-flow.css
        ├── api/api.js                # all backend calls (ErrorAPI, SchemaMasteryAPI, …)
        ├── components/               # RoleGuard, game-card, progress-bar, stat-card
        ├── config/firebase.js
        ├── layouts/                  # Public / Student / Teacher layouts
        ├── learningPathGen/          # data.js (quiz bank), quizLab.js (pre-test + C2 telemetry), roadmap.js, index.js
        ├── game/
        │   ├── GameManager.js, GameConfig.js, BadgeSystem.js, FusionEngine.js, ProgressTracker.js,
        │   │   ErrorFeedback.js (in-game error FX, unrelated to C2), BitIntervention.js, BitMenu.js, …
        │   ├── ml/                   # EmotionDetector, FatigueDetector, WebcamCapture, BehavioralRules
        │   └── scenes/               # Boot/Menu/UI + int, float, char, forloops, array, methods/* levels
        ├── pages/
        │   ├── error-analysis.js     # ← Component 2 UI
        │   ├── posttest.js, mastery.js, learning-path.js, games.js, dashboard.js,
        │   │   quiz-lab.js, quiz-results.js, quiz-summary.js, question-bank.js, demo-flow.js,
        │   │   login.js, register.js
        │   ├── student/              # StudentDashboard, FocusArea, …
        │   ├── teacher/              # TeacherDashboard, question review pages
        │   ├── auth/, public/
        └── utils/                    # auth.js, dom.js
```
