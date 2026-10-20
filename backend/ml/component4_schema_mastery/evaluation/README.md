# Component 4 Timing Ablation

Active model: time_excluded_v1, Logistic Regression pipeline.
Dataset: unchanged 24,032 records, 506 students, original future_success labels.
Validation: five student-disjoint StratifiedGroupKFold splits, seed 42;
imputation/scaling are fitted within folds. No hyperparameter search was used.

| Model | Mean accuracy | Mean macro F1 |
| --- | ---: | ---: |
| Historical deployed RF (metadata) | 98.5137% | 0.980448 |
| Refit RF with original inputs (diagnostic) | 98.7176% | 0.983078 |
| Time-excluded LR (selected) | 98.1566% | 0.975725 |
| Time-excluded RF | 97.2270% | 0.964127 |
| Score >= 0.65 baseline | 76.5022% | 0.503659 |

Historical and refit RF differ slightly; the old pickle came from another
scikit-learn runtime, and the revised experiment independently clones fold
pipelines. Do not present the historical number as a freshly reproduced metric.
Current metadata stores runtime version, dataset hash and fold metrics.

## What changed

Total MCQ time previously entered a model trained on a synthetic duration:
min(600, max(45, program_attempts*45 + compile_errors*15)). That is not a valid
per-question time budget. The candidate models exclude elapsed time entirely.
Counts are scaled to ten-answer equivalents inside the pipeline; all training
records already have ten answers, so their values and labels are unchanged.

The 14-correct/1-nearly-correct regression case (pre-score .57, error score .68,
one attempt) now returns probability about .9895 and DONE at every tested duration.
This is an uncalibrated probability, not 98.95% accuracy or verified mastery.
No probability override, label rewrite or threshold adjustment is used.

## Research limits

The target is still an engineered formula containing timing/retry assumptions,
not an independently observed outcome. Training question qualities and concept
labels are proxies. Training retries/error recovery are not the same as live
pre-test attempts/detector confidence. The ablation fixes direct timing sensitivity
but does not eliminate these limitations. High proxy-label CV accuracy must not
be presented as educational effectiveness. Real teacher-assessed CodeQuest outcomes,
an untouched student test set and probability calibration remain necessary.

Selection used mean macro F1, not the screenshot case, which is a regression
probe rather than independent validation. Selection CV is not a final held-out
test. Recommendations can still vary with pre-score, attempts and error evidence.

## Reproduce

From backend, diagnostic evaluation (does not overwrite active artifacts):

```powershell
.\venv\Scripts\python.exe -B ml/component4_schema_mastery/scripts/evaluate_timing_ablation.py
```

Train/select the active time-excluded pipeline and regenerate charts:

```powershell
.\venv\Scripts\python.exe -B ml/component4_schema_mastery/scripts/train_schema_mastery_model.py
.\venv\Scripts\python.exe -B -m unittest discover -s ml/component4_schema_mastery/tests -p test_timing_model.py -v
```

The five charts compare proxy-label metrics. feature_importance.png describes
the comparison RF, not deployed LR. timing_ablation.json retains all tested
variants and duration probes. No chart measures actual learning effectiveness.
