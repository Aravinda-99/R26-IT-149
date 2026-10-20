

#Component 1 — Model B (progression): evaluate + fit the deployed model



import json
import os
import sys
from datetime import datetime, timezone

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier

ML_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ML_DIR)
sys.path.insert(0, os.path.dirname(ML_DIR))   # backend/, for models.*

from compare_progression_methods import (apply_class_weights, make_cv, metrics,  # noqa: E402
                                         ms, to_label, tune_class_weights)
from train_progression_model import (DATA_PATH, GB_PARAMS, LABELS, MODEL_PATH,   # noqa: E402
                                     RESULTS_PATH)
from models.progression_model import ThresholdedGBClassifier                     # noqa: E402

FEATURES        = ['accuracy', 'avg_time_sec']
TIME_FLOOR_PCT  = 0.05
DROPPED_REASON  = ('avg_attempts is measured differently in the quiz (answer changes) than in '
                   'ASSISTments (tries until correct); found by the validity grid check on '
                   'quiz-like inputs BEFORE the reduced model was evaluated.')


def with_time_floor(df, floor):
    return df.assign(avg_time_sec=np.maximum(df['avg_time_sec'], floor))


def evaluate(data, splits):
    reduced, persistence = [], []
    for tr, te in splits:
        floor = float(data.iloc[tr]['avg_time_sec'].quantile(TIME_FLOOR_PCT))
        train = with_time_floor(data.iloc[tr], floor)
        test  = with_time_floor(data.iloc[te], floor)

        w, inner_f1 = tune_class_weights(train, FEATURES)
        gb = GradientBoostingClassifier(**GB_PARAMS).fit(train[FEATURES], train['label'])
        pred = apply_class_weights(gb.predict_proba(test[FEATURES]), w)
        reduced.append({**metrics(test['label'], pred),
                        'class_weights': dict(zip(LABELS, map(float, w))),
                        'inner_macro_f1': float(inner_f1), 'time_floor': floor})

        persistence.append(metrics(data.iloc[te]['label'], to_label(data.iloc[te]['accuracy'])))
    return reduced, persistence


def summarise(folds):
    return {
        'macro_f1': ms([f['macro_f1'] for f in folds]),
        'accuracy': ms([f['accuracy'] for f in folds]),
        'qwk':      ms([f['qwk'] for f in folds]),
        'recall':   {lbl: ms([f['recall'][lbl] for f in folds]) for lbl in LABELS},
    }


def main():
    data = pd.read_csv(DATA_PATH)
    splits = list(make_cv().split(data, data['label'], groups=data['user_id']))

    # ── 1. Evaluate ─────────────────────────────────────────────────────
    folds_b, folds_p = evaluate(data, splits)
    sb, sp = summarise(folds_b), summarise(folds_p)

    def f(m):
        return f"{m['mean']:.3f} +/- {m['std']:.3f}"

    print(f"{'method':34s} {'macro-F1':>15s} {'QWK':>15s} {'accuracy':>8s}"
          f" {'rec demote':>10s} {'rec maint':>9s} {'rec promo':>9s}")
    for name, s in (('B: GB(acc, time) + thresholds', sb), ('Baseline: persistence', sp)):
        print(f"{name:34s} {f(s['macro_f1']):>15s} {f(s['qwk']):>15s} {s['accuracy']['mean']:>8.3f}"
              f" {s['recall']['demote']['mean']:>10.3f} {s['recall']['maintain']['mean']:>9.3f}"
              f" {s['recall']['promote']['mean']:>9.3f}")
    print('\nper fold:')
    for k, (b, p) in enumerate(zip(folds_b, folds_p)):
        w = b['class_weights']
        print(f"  fold{k}: B macro-F1 {b['macro_f1']:.3f}  persistence {p['macro_f1']:.3f}"
              f"  | floor {b['time_floor']:.2f}s  w_demote {w['demote']:.2f}  w_promote {w['promote']:.2f}")

    # ── 2. Decision rule (non-inferiority) ──────────────────────────────
    diff   = sb['macro_f1']['mean'] - sp['macro_f1']['mean']
    margin = max(sb['macro_f1']['std'], sp['macro_f1']['std'])
    deploy = diff >= -margin
    print(f"\nnon-inferiority: diff = {diff:+.3f}, must be >= -{margin:.3f}  ->  "
          f"{'PASS: deploy B' if deploy else 'FAIL: not deployed'}")

    with open(RESULTS_PATH, encoding='utf-8') as fh:
        out = json.load(fh)
    if 'deployed_model' in out and 'deployed_model_3feature_superseded' not in out:
        out['deployed_model_3feature_superseded'] = out.pop('deployed_model')

    out['reduced_model_evaluation'] = {
        'created_at': datetime.now(timezone.utc).isoformat(timespec='seconds'),
        'script': 'ml/fit_final_progression_model.py',
        'method': 'A on reduced features: unweighted GB + nested tuned class multipliers',
        'features': FEATURES,
        'dropped_feature': 'avg_attempts',
        'dropped_reason': DROPPED_REASON,
        'time_floor': f'avg_time_sec raised to the training fold\'s {TIME_FLOOR_PCT:.0%} quantile '
                      '(train and test)',
        'folds': 'same 5 StratifiedGroupKFold folds as "cv" (by user_id, random_state=42)',
        'results': {'reduced_method_a': {'folds': folds_b, 'summary': sb},
                    'persistence': {'folds': folds_p, 'summary': sp}},
        'decision_rule': 'non-inferiority, fixed before results were seen: deploy if mean macro-F1 '
                         '>= persistence mean macro-F1 - max(std_B, std_persistence)',
        'diff': diff, 'margin': margin, 'deploy': deploy,
    }

    if not deploy:
        with open(RESULTS_PATH, 'w', encoding='utf-8') as fh:
            json.dump(out, fh, indent=2)
        print('model_b.pkl NOT changed. Results recorded.')
        sys.exit(1)

    # ── 3. Fit on all data ──────────────────────────────────────────────
    floor = float(data['avg_time_sec'].quantile(TIME_FLOOR_PCT))
    full = with_time_floor(data, floor)
    w, oof_f1 = tune_class_weights(full, FEATURES)
    weights = dict(zip(LABELS, map(float, w)))
    gb = GradientBoostingClassifier(**GB_PARAMS).fit(full[FEATURES], full['label'])
    joblib.dump(ThresholdedGBClassifier(gb, weights, {'avg_time_sec': floor}), MODEL_PATH)

    reloaded = joblib.load(MODEL_PATH)
    print(f'\nsaved -> {MODEL_PATH}')
    print(f'  features: {list(reloaded.feature_names_in_)}  classes: {list(reloaded.classes_)}')
    print(f'  multipliers: { {k: round(v, 3) for k, v in weights.items()} }  (OOF macro-F1 {oof_f1:.3f})')
    print(f'  time floor: {floor:.2f} s (5th percentile of training avg_time_sec)')

    out['deployed_model'] = {
        'created_at': datetime.now(timezone.utc).isoformat(timespec='seconds'),
        'script': 'ml/fit_final_progression_model.py',
        'method': 'A: unweighted GB classifier + tuned class multipliers (reduced features)',
        'class': 'models.progression_model.ThresholdedGBClassifier',
        'path': 'ml_models/model_b.pkl',
        'features': FEATURES,
        'dropped_feature': 'avg_attempts',
        'dropped_reason': DROPPED_REASON,
        'classes': list(reloaded.classes_),
        'class_multipliers': weights,
        'multiplier_tuning_oof_macro_f1': oof_f1,
        'input_floors': {'avg_time_sec': floor},
        'input_floor_rule': f'{TIME_FLOOR_PCT:.0%} quantile of training avg_time_sec, stored in the model',
        'rationale': 'Panel requires an ML model in the live analysis. Non-inferior to the '
                     'persistence baseline under the pre-registered rule; deployed with persistence '
                     'reported as the baseline. No claim is made that ML beats the baseline.',
    }
    with open(RESULTS_PATH, 'w', encoding='utf-8') as fh:
        json.dump(out, fh, indent=2)
    print(f'recorded -> {RESULTS_PATH} ["reduced_model_evaluation", "deployed_model"]')


if __name__ == '__main__':
    main()
