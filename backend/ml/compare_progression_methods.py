//Component 1 — Model B (progression): final method comparison


import json
import os
import sys
from datetime import datetime, timezone

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier, GradientBoostingRegressor
from sklearn.metrics import (accuracy_score, cohen_kappa_score, f1_score,
                             mean_absolute_error, recall_score)
from sklearn.model_selection import StratifiedGroupKFold
from sklearn.utils.class_weight import compute_sample_weight

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from train_progression_model import (DATA_PATH, DEMOTE_MAX, FEATURES, GB_PARAMS,  # noqa: E402
                                     LABELS, MODEL_PATH, N_SPLITS, PROMOTE_MIN,
                                     RANDOM_STATE, RESULTS_PATH)

INNER_SPLITS = 5
WEIGHT_GRID  = np.geomspace(0.25, 8.0, 41)   # multipliers for demote / promote


def to_label(values):
    values = np.asarray(values)
    return np.where(values >= PROMOTE_MIN, 'promote',
                    np.where(values < DEMOTE_MAX, 'demote', 'maintain'))


def make_cv():
    return StratifiedGroupKFold(n_splits=N_SPLITS, shuffle=True, random_state=RANDOM_STATE)


# ── Method A helpers ─────────────────────────────────────────────────────
def apply_class_weights(proba, w):
    """proba columns in LABELS order; w = (w_demote, w_maintain, w_promote)."""
    return np.asarray(LABELS)[np.argmax(proba * np.asarray(w), axis=1)]


def tune_class_weights(train, features=FEATURES):
    """Inner group CV on the outer training fold → OOF probabilities → grid search."""
    inner = StratifiedGroupKFold(n_splits=INNER_SPLITS, shuffle=True, random_state=RANDOM_STATE)
    oof = np.zeros((len(train), len(LABELS)))
    for itr, ite in inner.split(train, train['label'], groups=train['user_id']):
        m = GradientBoostingClassifier(**GB_PARAMS)
        m.fit(train.iloc[itr][features], train.iloc[itr]['label'])
        assert list(m.classes_) == LABELS
        oof[ite] = m.predict_proba(train.iloc[ite][features])

    y = train['label'].to_numpy()
    best_w, best_f1 = (1.0, 1.0, 1.0), -1.0
    for wd in WEIGHT_GRID:
        for wp in WEIGHT_GRID:
            w = (wd, 1.0, wp)
            f1 = f1_score(y, apply_class_weights(oof, w), labels=LABELS, average='macro')
            if f1 > best_f1:
                best_w, best_f1 = w, f1
    return best_w, best_f1


# ── Methods: each returns (predicted labels, extras dict) ────────────────
def method_gb(train, test, balanced=False):
    m = GradientBoostingClassifier(**GB_PARAMS)
    w = compute_sample_weight('balanced', train['label']) if balanced else None
    m.fit(train[FEATURES], train['label'], sample_weight=w)
    return m.predict(test[FEATURES]), {}


def method_threshold(train, test):
    w, inner_f1 = tune_class_weights(train)
    m = GradientBoostingClassifier(**GB_PARAMS)
    m.fit(train[FEATURES], train['label'])
    pred = apply_class_weights(m.predict_proba(test[FEATURES]), w)
    return pred, {'class_weights': dict(zip(LABELS, map(float, w))), 'inner_macro_f1': float(inner_f1)}


def method_regressor(train, test):
    m = GradientBoostingRegressor(**GB_PARAMS)
    m.fit(train[FEATURES], train['next_accuracy'])
    pred_acc = np.clip(m.predict(test[FEATURES]), 0.0, 1.0)
    return to_label(pred_acc), {
        'next_accuracy_mae': float(mean_absolute_error(test['next_accuracy'], pred_acc))}


def method_persistence(train, test):
    return to_label(test['accuracy']), {
        'next_accuracy_mae': float(mean_absolute_error(test['next_accuracy'], test['accuracy']))}


def method_majority(train, test):
    return np.full(len(test), train['label'].mode()[0]), {}


METHODS = {
    'gb':          ('GB classifier',                 lambda tr, te: method_gb(tr, te, False), True),
    'gb_balanced': ('GB classifier, balanced',       lambda tr, te: method_gb(tr, te, True),  True),
    'gb_threshold':('A: GB + tuned thresholds',      method_threshold,                       True),
    'gb_regressor':('C: GB regressor + thresholds',  method_regressor,                       True),
    'persistence': ('Baseline: persistence',         method_persistence,                     False),
    'majority':    ('Baseline: majority class',      method_majority,                        False),
}


def metrics(y_true, y_pred):
    rec = recall_score(y_true, y_pred, labels=LABELS, average=None, zero_division=0)
    return {
        'macro_f1': float(f1_score(y_true, y_pred, labels=LABELS, average='macro', zero_division=0)),
        'accuracy': float(accuracy_score(y_true, y_pred)),
        'recall':   dict(zip(LABELS, map(float, rec))),
        'qwk':      float(cohen_kappa_score(y_true, y_pred, labels=LABELS, weights='quadratic')),
    }


def ms(values):
    return {'mean': float(np.mean(values)), 'std': float(np.std(values))}


def main():
    data = pd.read_csv(DATA_PATH)
    splits = list(make_cv().split(data, data['label'], groups=data['user_id']))

    results = {}
    for key, (name, fn, is_ml) in METHODS.items():
        folds = []
        for tr, te in splits:
            train, test = data.iloc[tr], data.iloc[te]
            pred, extras = fn(train, test)
            folds.append({**metrics(test['label'], pred), **extras})
        summary = {
            'macro_f1': ms([f['macro_f1'] for f in folds]),
            'accuracy': ms([f['accuracy'] for f in folds]),
            'recall':   {lbl: ms([f['recall'][lbl] for f in folds]) for lbl in LABELS},
            'qwk':      ms([f['qwk'] for f in folds]),
        }
        if 'next_accuracy_mae' in folds[0]:
            summary['next_accuracy_mae'] = ms([f['next_accuracy_mae'] for f in folds])
        results[key] = {'name': name, 'is_ml': is_ml, 'folds': folds, 'summary': summary}
        print(f'done: {name}', flush=True)

    # ── Table ───────────────────────────────────────────────────────────
    def f(m):
        return f"{m['mean']:.3f} +/- {m['std']:.3f}"

    print(f"\n{'method':32s} {'macro-F1':>15s} {'accuracy':>7s} {'QWK':>15s}"
          f" {'rec demote':>10s} {'rec maint':>9s} {'rec promo':>9s}")
    for key, r in results.items():
        s = r['summary']
        print(f"{r['name']:32s} {f(s['macro_f1']):>15s} {s['accuracy']['mean']:>7.3f} {f(s['qwk']):>15s}"
              f" {s['recall']['demote']['mean']:>10.3f} {s['recall']['maintain']['mean']:>9.3f}"
              f" {s['recall']['promote']['mean']:>9.3f}")

    print('\nper-fold macro-F1:')
    for key, r in results.items():
        print(f"  {r['name']:32s}" + ''.join(f"  {x['macro_f1']:.3f}" for x in r['folds']))

    print('\nnext_accuracy MAE (C vs persistence):')
    for key in ('gb_regressor', 'persistence'):
        print(f"  {results[key]['name']:32s} {f(results[key]['summary']['next_accuracy_mae'])}")

    print('\nA: tuned class multipliers per outer fold (w_maintain = 1):')
    for k, x in enumerate(results['gb_threshold']['folds']):
        w = x['class_weights']
        print(f"  fold{k}: w_demote={w['demote']:.2f}  w_promote={w['promote']:.2f}"
              f"  inner macro-F1={x['inner_macro_f1']:.3f}  outer macro-F1={x['macro_f1']:.3f}")

    # ── Decision rule ───────────────────────────────────────────────────
    p = results['persistence']['summary']['macro_f1']
    decisions, passing = {}, []
    print('\ndecision rule: replace persistence iff mean_F1 - mean_F1(persistence) > max(std, std_persistence)')
    for key, r in results.items():
        if not r['is_ml']:
            continue
        m = r['summary']['macro_f1']
        diff, margin = m['mean'] - p['mean'], max(m['std'], p['std'])
        passes = diff > margin
        decisions[key] = {'diff': diff, 'required_margin': margin, 'passes': passes}
        if passes:
            passing.append(key)
        print(f"  {r['name']:32s} diff = {diff:+.3f}   required > {margin:.3f}   -> {'PASS' if passes else 'fail'}")

    winner = max(passing, key=lambda k: results[k]['summary']['macro_f1']['mean']) if passing else 'persistence'
    print(f"\nWINNER (live decision rule): {results[winner]['name']}")

    # ── Save winning model (only A or C can replace model_b.pkl) ────────
    saved = None
    if winner == 'gb_regressor':
        model = GradientBoostingRegressor(**GB_PARAMS).fit(data[FEATURES], data['next_accuracy'])
        joblib.dump(model, MODEL_PATH)
        saved = MODEL_PATH
    elif winner == 'gb_threshold':
        w, _ = tune_class_weights(data)
        model = GradientBoostingClassifier(**GB_PARAMS).fit(data[FEATURES], data['label'])
        joblib.dump({'type': 'gb_threshold', 'model': model,
                     'class_weights': dict(zip(LABELS, map(float, w)))}, MODEL_PATH)
        saved = MODEL_PATH
    print(f"model_b.pkl: {'replaced -> ' + saved if saved else 'unchanged (no ML method passed the rule)'}")

    # ── Append to results JSON ──────────────────────────────────────────
    with open(RESULTS_PATH, encoding='utf-8') as fh:
        out = json.load(fh)
    out['method_comparison'] = {
        'created_at': datetime.now(timezone.utc).isoformat(timespec='seconds'),
        'script': 'ml/compare_progression_methods.py',
        'folds': 'same 5 StratifiedGroupKFold folds as "cv" (by user_id, random_state=42)',
        'method_a': {'description': 'argmax(w_c * p_c), w_maintain = 1; w_demote, w_promote '
                                    'grid-searched on inner out-of-fold probabilities (nested)',
                     'inner_splits': INNER_SPLITS,
                     'weight_grid': [float(WEIGHT_GRID.min()), float(WEIGHT_GRID.max()), len(WEIGHT_GRID)]},
        'method_c': {'description': 'GradientBoostingRegressor on next_accuracy, clipped to [0, 1], '
                                    'then label thresholds'},
        'results': results,
        'decision_rule': 'ML replaces persistence iff mean macro-F1 - persistence mean macro-F1 '
                         '> max(method std, persistence std); fixed before results were seen',
        'decisions': decisions,
        'winner': winner,
        'model_b_replaced': bool(saved),
    }
    with open(RESULTS_PATH, 'w', encoding='utf-8') as fh:
        json.dump(out, fh, indent=2)
    print(f'results appended -> {RESULTS_PATH} ["method_comparison"]')


if __name__ == '__main__':
    main()
