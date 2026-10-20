# Component 2 — Execution-Verified Synthetic Java Error Dataset (v2)

> **Folder notes (this repo)**
> - `dataset_v1/` = the logic-only v1 dataset (3,966 rows, 27 families), and `results_v1/` = its ablation. Both are kept for the v1-vs-v2 comparison. `dataset_v1/generator_v1/` holds the v1 `families.py` / `generate.py` (v2's `families.py` adds the blank families on top of them).
> - `results/` = the v2 ablation re-run with the project's pinned scikit-learn 1.8.0 (`generator/train_eval.py`). `results_v2_reference/` = the original 1.9.1 run shipped with the dataset. `results_sklearn180/` = the v1 ablation re-run with 1.8.0.
> - `generator/generate.py` is **Linux/macOS/WSL only** (it shells out to `bash` and `timeout`). Training and evaluation work on any OS.
> - Production models are trained by `backend/scripts/train_final_c2.py`; the real pre-test evaluation is `eval/eval_pretest.py`.
> - `research_models/` (git-ignored) holds the research-only Model 3 variants (uncalibrated, `with_runner`) written by the same script. Only the calibrated `no_runner` model ships in `backend/ml_models/c2_model3_meta.pkl`.

Dataset, generator and evaluation scripts for the Intelligent Error Pattern Detector (CodeQuest, R26-IT-149).

**What changed from v1:** v1 had only *logic-error* programs, such as `i <= arr.length`, a missing `i++`, or `return a - b`. On the real pre-test, v1 + Model 3 got only about 0.29–0.31 reason accuracy, because the pre-test is made of *fill-in-the-blank* questions with a different kind of error: wrong keyword, invalid identifier, `=` vs `==`, `length()` vs `length`, `do` vs `while`, `"4"` vs `4`, recursion base case. v2 adds **17 pre-test-style fill-in-the-blank families**.

## Contents

| Path | What it is |
|---|---|
| `dataset/c2_synthetic_dataset.csv` | 5,976 labelled Java samples (4,264 logic + 1,712 fill-in-the-blank), each checked by compiling and running it |
| `dataset/dataset_stats.json` | Class, form, outcome and source counts, plus the dropped mutants and why |
| `generator/families.py` | 27 logic task families plus the fine-reason → reason-group map |
| `generator/families_blank.py` | 17 pre-test-style fill-in-the-blank families (v2) |
| `generator/generate.py` | Builds, styles, compiles and runs every sample, keeps only verified ones (**Linux/macOS/WSL only**: it uses `bash` and `timeout`) |
| `generator/train_eval.py` | Ablation E1–E4 over three split strategies |
| `generator/approx_pretest.py`, `check_pretest.py` | Quick check on a reconstruction of the 20 pre-test questions (80 rows) |
| `results/ablation_results.json` | Full metrics and per-class reports |

## How the dataset was built

1. **Task families (44).**
   - **Logic families (27):** small beginner programs across Variables, Loops, Arrays and Methods.
   - **Fill-in-the-blank families (17):** one line of a short template is blanked, then filled with the correct option or a distractor. The question types are type keyword, identifier, comparison operator, compound assignment, loop-condition variable, `do` keyword, loop update, `break`/`continue`, array declaration, first/last index, traversal operator, `.length` syntax, `return` keyword, `void`, argument type, recursion base case, and recursive argument.
2. **Mutation operators and distractors.** Each one injects one known novice error and has a *fine reason*. That fine reason maps to the **same 12 reason groups and 5 broad labels used by the production models**.
3. **Randomisation.** Each family was instantiated 80 times with random identifiers, values, contexts and code style. Exact duplicate texts were removed.
4. **Forms.**
   - `minimal`: only the template or core lines, which is what the quiz sends.
   - `body`: the statements without the class wrapper.
   - `full`: a complete `public class Main`.
   - Fill-in-the-blank samples are 65% `minimal`.
5. **Execution verification** with JDK 21: compile, then run with a 2 s timeout.
   - Correct samples must print the reference output.
   - Mutants expected to fail must be rejected by `javac`.
   - Other mutants must behave differently (output, exception or non-termination).
   - **589 equivalent or unexpected mutants were dropped.** For example, `Double price = 12.5` and `Boolean isActive = true` compile and run, so they are *not* errors.
6. **Balancing.** Each reason group is capped at 480 and CORRECT at 720. `LOOP_BOUNDARY_ISSUE` has 456 samples.

Columns: `sample_id, instance_id, family, source_type, concept, form, code, label, reason_group, fine_reason, verified_outcome, compile_error, runtime_exception, expected_output, actual_output`. Use `instance_id` or `family` for grouped splits.

## Results

### A. Pre-test-style inputs (approximate reconstruction of the 20 pre-test questions, 80 rows)

| Training data | Model | Broad acc | Reason acc | Reason macro-F1 | Correct recall | Error recall |
|---|---|---|---|---|---|---|
| v1 (logic only) | E2 code-aware SVM | 0.613 | 0.225 | 0.138 | 0.18 | 0.95 |
| v1 (logic only) | E3 Model 3 | 0.625 | 0.287 | 0.163 | 0.32 | 0.88 |
| **v2 (+ fill-in-the-blank)** | E2 code-aware SVM | 0.850 | 0.850 | 0.882 | 0.59 | 0.98 |
| **v2 (+ fill-in-the-blank)** | **E3 Model 3** | **0.887** | **0.875** | **0.922** | 0.68 | 0.97 |

The v1 numbers on this reconstruction match the real-pre-test numbers from `eval_pretest.py` (about 0.61–0.65 broad and 0.26–0.31 reason), so the reconstruction looks faithful. **The final numbers must still come from `eval_pretest.py` on the real `data.js`.**

### B. Ablation on the v2 dataset (Stage 2 reason macro-F1, accuracy in brackets)

| Experiment | Random split | Instance split | Family split (unseen task types) |
|---|---|---|---|
| E1 original setup | 0.613 (0.617) | 0.667 (0.677) | 0.289 (0.322) |
| E2 code-aware tokenizer | 0.932 (0.926) | 0.936 (0.931) | 0.341 (0.344) |
| E3 + Model 3 | 0.979 (0.976) | 0.981 (0.979) | 0.311 (0.320) |
| E4 + Code Runner evidence | **0.990 (0.988)** | **0.982 (0.981)** | **0.355 (0.372)** |

### What this shows

1. **Matching the training data to the input distribution matters most.** Adding pre-test-style families raised reason accuracy on pre-test-style inputs from about 0.29 to 0.875.
2. **Model 3 corrects the base models** when the input type is familiar: instance split 0.936 → 0.981, and the pre-test reconstruction 0.850 → 0.875.
3. **On completely unseen task types, every ML variant stays around 0.29–0.37.** The models do not generalise to new kinds of programs. This is the motivation for the **Code Runner** (largest gain on unseen code) and the **LLM layer**.
4. **Correct answers are still misflagged** (correct recall 0.68). For pre-test answers, the system already knows the answer key, so the pipeline should use it as a gate (see below). ML is then needed only to classify *which* error a wrong answer contains, and to classify free-form sandbox code.

### Limitations (state these in the thesis)

- The data is synthetic and the families were written by the researcher. Random/instance-split scores are optimistic; the family split is the honest generalisation estimate.
- **The fill-in-the-blank families were designed to match the pre-test's question types**, and several distractor words overlap with pre-test options (e.g. `Int`, `void`, `2count`, `sleep`). The exact pre-test rows are not in the training data, but the gain partly reflects this domain matching.
- Some code is valid Java but marked wrong by the quiz key (e.g. `Boolean`, or `return n` when `n == 1`). Execution shows these are not errors.
- The 12-group taxonomy has no exact group for comparison operators, array-declaration syntax or invalid keywords. They are mapped to the closest group (see `BLANK_REASON_GROUP` in `families_blank.py`).
- Model 3's raw probabilities are over-confident and should be calibrated before being used as `error_pattern_score`.
- Results were produced with scikit-learn 1.9.1. Retrain with the project's pinned 1.8.0.

## LLM explanation layer (pre-test, EN / Sinhala / Singlish)

Per-question explanations for every pre-test answer, grounded by retrieval and tied to the C2 label.

| Path | What it is |
|---|---|
| `rag/concept_notes.py` | 40 beginner Java notes, one per fine error type in `families.py` / `families_blank.py` |
| `rag/build_kb.py` → `rag/knowledge_base.json` | 77 chunks: 25 pre-test questions (data.js), 12 reason groups (`_get_reason_details`), 40 concept notes. Reviewed eval labels are **not** included |
| `rag/retriever.py` | TF-IDF cosine retrieval (case-sensitive, Java operators kept as tokens), top-4, filtered by concept |
| `backend/services/explanation_service.py` | Prompt + LLM call (Component 4 settings) + strict JSON validation + template fallback + circuit breaker + verification policy |
| `backend/services/explanation_templates.py` | Sinhala / Singlish template text per reason group (plus correct-answer and text-question cases), so the fallback is trilingual |
| `backend/scripts/build_explanation_cache.py` → `backend/data/c2_explanations_cache.json` | Offline explanations for all 100 (question, option) pairs (20 fill-in-the-blank + 5 text-only Operators questions); JSON retry, 429/503 backoff, throttled, resumable |
| `eval/eval_llm.py` | LLM-alone vs Model 3 + gate vs verification policy on the 80 reviewed rows; exports `eval/results/explanation_review_sheet.csv` for manual rating |

`POST /api/errors/explain` serves the cache, else ONE live LLM attempt (15 s, no retries), else the template (EN / SI / Singlish). After a 429 / quota / 503 the LLM is skipped for 10 minutes (circuit breaker), and any internal error also ends in the template, so the endpoint always returns an explanation. `source` in the response says which (`cache` | `llm` | `template`). `EXPLANATION_USE_LLM=false` disables live calls.
**Verification policy:** for a wrong answer with Model 3 calibrated confidence < 0.5 where the LLM says the label does not fit, the LLM's `llm_suggested_reason_group` becomes the explanation label (`label_source: "llm_verified"`); correct answers are labelled by the answer key (`"answer_key"`), everything else keeps Model 3 (`"model3"`).
The LLM sees the C2 label in its prompt, so "LLM alone" accuracy is anchored on Model 3 and is not an independent classifier.

```bash
# from backend/
python ml/component2_error_detection/rag/build_kb.py           # needs node
python scripts/build_explanation_cache.py --model gemini-3.5-flash
python ml/component2_error_detection/eval/eval_llm.py
python -m unittest test_c2_explanations -v
```

## Java sandbox (Code Runner + validated test cases)

| Path | What it is |
|---|---|
| `backend/services/code_runner_service.py` | Wraps snippets into `Main` (statements → `main`, methods → static methods), compiles (10 s) and runs (5 s, `-Xmx64m`, stdin, 10 KB output cap, whole process tree killed on timeout). Compiler errors and stack traces are mapped to the student's line numbers and simple categories |
| `backend/services/sandbox_tests_service.py` | Runs a question's test cases against the student's code (harness with a `{STUDENT_CODE}` slot, compiled once, tests in parallel) |
| `backend/scripts/build_sandbox_tests.py` → `backend/data/c2_sandbox_tests.json` | LLM-written harness + tests per pre-test question, **validated by execution**: the correct option passes every test, every wrong option fails one or does not compile (reviewed-equivalent options exempt), each test must still fail when the student's code is removed (ablation), tests must use different stdin and expect ≥ 2 different outputs. Text-only Operators questions use an LLM starter program and wrong variants instead |

Routes: `POST /api/errors/run` `{code, stdin}`, `POST /api/errors/run-tests` `{question_id, code}`, `GET /api/errors/sandbox-tests/<id>`.
`eval/eval_pretest.py --fresh-runner` re-executes all 80 rows with the Code Runner instead of reading the CSV evidence: on JDK 24 all 80 rows match the stored javac/java evidence, and `v2_model3_runner` makes the same predictions as `v2_model3` (reason acc 0.8625). Every remaining Model 3 error is code that compiles and runs, which compile/exception evidence cannot separate; behaviour tests can.

```bash
# from backend/ (needs a JDK; set C2_JAVA_HOME to pick one)
python scripts/build_sandbox_tests.py
python ml/component2_error_detection/eval/eval_pretest.py --fresh-runner
python -m unittest test_c2_sandbox -v
```

## Reproduce (Linux/WSL for generation; training works on any OS)

```bash
python generator/generate.py out --instances 80 --cap 480 --cap_correct 720 --seed 42
python generator/train_eval.py out/c2_synthetic_dataset.csv out/results
python generator/approx_pretest.py approx_pretest.csv
python generator/check_pretest.py out/c2_synthetic_dataset.csv approx_pretest.csv
```
