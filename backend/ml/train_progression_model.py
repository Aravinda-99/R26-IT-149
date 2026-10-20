

#Component 1 — Model B (progression) training & evaluation


import argparse
import json
import os
import sys
from datetime import datetime, timezone

import joblib
import numpy as np
import pandas as pd
import sklearn
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.inspection import permutation_importance
from sklearn.metrics import (accuracy_score, confusion_matrix, f1_score,
                             precision_recall_fscore_support)
from sklearn.model_selection import StratifiedGroupKFold
from sklearn.utils.class_weight import compute_sample_weight

BACKEND_DIR  = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DATA_PATH    = os.path.join(BACKEND_DIR, 'data', 'progression_dataset.csv')
MODEL_PATH   = os.path.join(BACKEND_DIR, 'ml_models', 'model_b.pkl')
RESULTS_PATH = os.path.join(BACKEND_DIR, 'ml', 'progression_results.json')

FEATURES          = ['accuracy', 'avg_attempts', 'avg_time_sec']
FEATURES_ABLATION = FEATURES + ['difficulty']
LABELS            = ['demote', 'maintain', 'promote']

# Same thresholds that generated the labels (applied to window t+1)
PROMOTE_MIN = 0.80
DEMOTE_MAX  = 0.40

N_SPLITS     = 5
RANDOM_STATE = 42
GB_PARAMS = dict(n_estimators=200, learning_rate=0.05, max_depth=3,
                 subsample=0.8, random_state=RANDOM_STATE)


# ── Predictors: each returns predicted labels for the test fold ──────────
def gb_predictor(features, balanced):
    def predict(train, test):
        model = GradientBoostingClassifier(**GB_PARAMS)
        weights = compute_sample_weight('balanced', train['label']) if balanced else None
        model.fit(train[features], train['label'], sample_weight=weights)
        return model.predict(test[features])
    return predict


def persistence_predictor(train, test):
    acc = test['accuracy'].to_numpy()
    return np.where(acc >= PROMOTE_MIN, 'promote',
                    np.where(acc < DEMOTE_MAX, 'demote', 'maintain'))


def majority_predictor(train, test):
    return np.full(len(test), train['label'].mode()[0])


MODELS = {
    'gb':                     ('Gradient Boosting',                   gb_predictor(FEATURES, False)),
    'gb_balanced':            ('Gradient Boosting, balanced weights', gb_predictor(FEATURES, True)),
    'gb_difficulty':          ('Ablation: GB + difficulty',           gb_predictor(FEATURES_ABLATION, False)),
    'gb_difficulty_balanced': ('Ablation: GB + difficulty, balanced', gb_predictor(FEATURES_ABLATION, True)),
    'persistence':            ('Baseline: persistence',               persistence_predictor),
    'majority':               ('Baseline: majority class',            majority_predictor),
}


# ── Metrics ──────────────────────────────────────────────────────────────
def fold_metrics(y_true, y_pred):
    p, r, f, s = precision_recall_fscore_support(y_true, y_pred, labels=LABELS, zero_division=0)
    return {
        'macro_f1':  float(f1_score(y_true, y_pred, labels=LABELS, average='macro', zero_division=0)),
        'accuracy':  float(accuracy_score(y_true, y_pred)),
        'per_class': {lbl: {'precision': float(p[i]), 'recall': float(r[i]),
                            'f1': float(f[i]), 'support': int(s[i])}
                      for i, lbl in enumerate(LABELS)},
        'confusion_matrix': confusion_matrix(y_true, y_pred, labels=LABELS).tolist(),
    }


def mean_std(values):
    return {'mean': float(np.mean(values)), 'std': float(np.std(values))}


def summarise(folds):
    summary = {
        'macro_f1': mean_std([f['macro_f1'] for f in folds]),
        'accuracy': mean_std([f['accuracy'] for f in folds]),
        'per_class': {
            lbl: {m: mean_std([f['per_class'][lbl][m] for f in folds])
                  for m in ('precision', 'recall', 'f1')}
            for lbl in LABELS
        },
        'confusion_matrix_total': np.sum([f['confusion_matrix'] for f in folds], axis=0).tolist(),
    }
    summary['demote_recall'] = summary['per_class']['demote']['recall']
    return summary


def fmt(ms):
    return f"{ms['mean']:.3f} +/- {ms['std']:.3f}"


# ── Main ─────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description='Train and evaluate Model B (progression).')
    parser.add_argument('--data', default=DATA_PATH)
    parser.add_argument('--model-out', default=MODEL_PATH)
    parser.add_argument('--results-out', default=RESULTS_PATH)
    args = parser.parse_args()

    if os.path.abspath(args.model_out) == os.path.abspath(os.path.join(BACKEND_DIR, 'ml_models', 'model.pkl')):
        sys.exit('Refusing to overwrite ml_models/model.pkl')

    data = pd.read_csv(args.data)
    print(f'data: {len(data):,} rows, {data.user_id.nunique():,} users')
    print('labels:', data['label'].value_counts().reindex(LABELS).to_dict())

    cv = StratifiedGroupKFold(n_splits=N_SPLITS, shuffle=True, random_state=RANDOM_STATE)
    splits = list(cv.split(data, data['label'], groups=data['user_id']))

    fold_info = []
    for k, (tr, te) in enumerate(splits):
        assert not set(data.user_id.iloc[tr]) & set(data.user_id.iloc[te]), 'user leak across folds'
        fold_info.append({
            'fold': k, 'train_rows': len(tr), 'test_rows': len(te),
            'test_users': int(data.user_id.iloc[te].nunique()),
            'test_labels': data.label.iloc[te].value_counts().reindex(LABELS).astype(int).to_dict(),
        })

    # ── Cross-validation ────────────────────────────────────────────────
    results = {}
    for key, (name, predict) in MODELS.items():
        folds = []
        for tr, te in splits:
            train, test = data.iloc[tr], data.iloc[te]
            folds.append(fold_metrics(test['label'], predict(train, test)))
        results[key] = {'name': name, 'folds': folds, 'summary': summarise(folds)}

    # ── Report ──────────────────────────────────────────────────────────
    print(f'\n5-fold StratifiedGroupKFold by user_id  (test rows per fold: '
          f"{', '.join(str(f['test_rows']) for f in fold_info)})")

    print('\nper-fold macro-F1:')
    print(f"  {'model':38s}" + ''.join(f'  fold{k}' for k in range(N_SPLITS)))
    for key, res in results.items():
        print(f"  {res['name']:38s}" + ''.join(f"  {f['macro_f1']:.3f}" for f in res['folds']))

    print('\nsummary (mean +/- std over folds):')
    print(f"  {'model':38s}  {'macro-F1':>15s}  {'accuracy':>15s}  {'demote recall':>15s}")
    for key, res in results.items():
        s = res['summary']
        print(f"  {res['name']:38s}  {fmt(s['macro_f1']):>15s}  {fmt(s['accuracy']):>15s}  {fmt(s['demote_recall']):>15s}")

    for key, res in results.items():
        s = res['summary']
        print(f"\n{res['name']}")
        print(f"  {'class':9s}  {'precision':>15s}  {'recall':>15s}  {'f1':>15s}")
        for lbl in LABELS:
            pc = s['per_class'][lbl]
            print(f"  {lbl:9s}  {fmt(pc['precision']):>15s}  {fmt(pc['recall']):>15s}  {fmt(pc['f1']):>15s}")
        print('  confusion matrix, summed over folds (rows = true, cols = predicted):')
        print(f"  {'':9s}" + ''.join(f'{lbl:>10s}' for lbl in LABELS))
        for lbl, row in zip(LABELS, s['confusion_matrix_total']):
            print(f'  {lbl:9s}' + ''.join(f'{v:>10,}' for v in row))

    # ── Final model: 3 features, weighting chosen by CV macro-F1 ────────
    balanced = (results['gb_balanced']['summary']['macro_f1']['mean']
                > results['gb']['summary']['macro_f1']['mean'])
    chosen = 'gb_balanced' if balanced else 'gb'

    final = GradientBoostingClassifier(**GB_PARAMS)
    weights = compute_sample_weight('balanced', data['label']) if balanced else None
    final.fit(data[FEATURES], data['label'], sample_weight=weights)
    os.makedirs(os.path.dirname(args.model_out), exist_ok=True)
    joblib.dump(final, args.model_out)

    # Impurity importance (final model) + permutation importance on held-out
    # folds (drop in macro-F1 when a feature is shuffled; more trustworthy).
    impurity = dict(zip(FEATURES, map(float, final.feature_importances_)))
    perm_folds = []
    for tr, te in splits:
        train, test = data.iloc[tr], data.iloc[te]
        m = GradientBoostingClassifier(**GB_PARAMS)
        w = compute_sample_weight('balanced', train['label']) if balanced else None
        m.fit(train[FEATURES], train['label'], sample_weight=w)
        pi = permutation_importance(m, test[FEATURES], test['label'], scoring='f1_macro',
                                    n_repeats=10, random_state=RANDOM_STATE)
        perm_folds.append(pi.importances_mean)
    permutation = {f: mean_std(np.array(perm_folds)[:, i]) for i, f in enumerate(FEATURES)}

    print(f"\nfinal model: {results[chosen]['name']} (higher mean CV macro-F1), "
          f'refit on all {len(data):,} rows -> {args.model_out}')
    print(f'  classes_: {list(final.classes_)}   features: {list(final.feature_names_in_)}')
    print('\nfeature importance:')
    print(f"  {'feature':14s}  {'impurity (final)':>16s}  {'permutation, macro-F1 drop (CV)':>32s}")
    for f in FEATURES:
        print(f'  {f:14s}  {impurity[f]:>16.3f}  {fmt(permutation[f]):>32s}')

    # ── Save results ────────────────────────────────────────────────────
    out = {
        'created_at': datetime.now(timezone.utc).isoformat(timespec='seconds'),
        'data': {'path': os.path.relpath(args.data, BACKEND_DIR), 'rows': len(data),
                 'users': int(data.user_id.nunique()),
                 'labels': data['label'].value_counts().reindex(LABELS).astype(int).to_dict()},
        'features': FEATURES,
        'ablation_features': FEATURES_ABLATION,
        'labels': LABELS,
        'label_thresholds': {'promote_min': PROMOTE_MIN, 'demote_max': DEMOTE_MAX},
        'cv': {'method': 'StratifiedGroupKFold', 'n_splits': N_SPLITS, 'groups': 'user_id',
               'shuffle': True, 'random_state': RANDOM_STATE, 'folds': fold_info},
        'gb_params': GB_PARAMS,
        'results': results,
        'final_model': {
            'path': os.path.relpath(args.model_out, BACKEND_DIR),
            'config': chosen, 'balanced_weights': balanced,
            'selection': 'higher mean CV macro-F1 of gb vs gb_balanced',
            'classes': list(final.classes_), 'features': list(final.feature_names_in_),
            'feature_importance': {'impurity': impurity, 'permutation_macro_f1_drop': permutation},
        },
        'versions': {'sklearn': sklearn.__version__, 'numpy': np.__version__,
                     'pandas': pd.__version__, 'python': sys.version.split()[0]},
    }
    with open(args.results_out, 'w', encoding='utf-8') as fh:
        json.dump(out, fh, indent=2)
    print(f'\nresults -> {args.results_out}')


if __name__ == '__main__':
    main()
