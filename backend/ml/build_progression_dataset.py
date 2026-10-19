"""
Component 1 — Model B (progression) dataset builder
====================================================
Builds a supervised dataset of REAL future outcomes from the raw
ASSISTments 2009-2010 skill-builder data (original release).

For each student, problems are sorted by order_id and cut into
non-overlapping windows of WINDOW problems. Every window t that has a
following window t+1 yields one row:

    features  ← window t   (what the quiz can observe now)
    label     ← window t+1 (what actually happened next)

so the label is never computed from the features' own data (no leakage),
and accuracy can be kept as a feature.

FEATURES (only what the Java quiz can compute identically):
    accuracy       fraction correct (first attempt) in window t
    avg_attempts   mean attempt_count in window t, each capped at 10
    avg_time_sec   mean ms_first_response / 1000, each capped at 600 s

ABLATION-ONLY COLUMN (not a Model B feature):
    difficulty     0 beginner / 1 intermediate / 2 advanced — window t's
                   placement level, computed with the SAME Rasch EAP and
                   RP50 cut-offs as Model A (services/placement_service.py).
                   ASSISTments items carry no beginner/intermediate/advanced
                   tag, so every item is treated as b = 0 ('intermediate').
                   This makes it binned accuracy, with different item
                   difficulties than the live quiz — hence excluded.

LABEL from window t+1 accuracy:
    >= 0.80        promote
    0.40 – 0.80    maintain
    <  0.40        demote

user_id is kept for GroupKFold (no student in both train and test).

CLEANING (in this order):
    1. drop duplicate order_id (multi-skill problems are repeated per skill)
    2. keep original == 1 (drop scaffolding sub-problems)
    3. drop ms_first_response <= 0 and attempt_count == 0
    4. ms_first_response → seconds, capped at 600
    5. attempt_count capped at 10 (the quiz's engagement formula treats
       10 attempts as the worst case; raw data reaches 3,824)

Usage (from backend/):
    python ml/build_progression_dataset.py "<path to skill_builder_data.csv>"
The raw CSV is read in place and is never copied into the repository.
"""

import argparse
import os
import sys

import numpy as np
import pandas as pd

BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, BACKEND_DIR)

from services.placement_service import PlacementService, LEVEL_TO_DIFFICULTY  # noqa: E402

WINDOW        = 20
TIME_CAP_SEC  = 600.0
ATTEMPT_CAP   = 10
PROMOTE_MIN   = 0.80
DEMOTE_MAX    = 0.40
LABELS        = ['demote', 'maintain', 'promote']
DIFF_ENCODE   = {'beginner': 0, 'intermediate': 1, 'advanced': 2}
DEFAULT_OUT   = os.path.join(BACKEND_DIR, 'data', 'progression_dataset.csv')


def load_and_clean(path: str) -> pd.DataFrame:
    df = pd.read_csv(path, encoding='latin-1', low_memory=False,
                     usecols=['order_id', 'user_id', 'original', 'correct',
                              'attempt_count', 'ms_first_response'])
    print(f'raw rows:                         {len(df):>9,}')

    df = df.drop_duplicates(subset='order_id')
    print(f'after dedup on order_id:          {len(df):>9,}  ({df.user_id.nunique():,} users)')

    df = df[df['original'] == 1]
    print(f'after original == 1:              {len(df):>9,}')

    df = df[(df['ms_first_response'] > 0) & (df['attempt_count'] != 0)]
    print(f'after ms > 0 and attempts != 0:   {len(df):>9,}  ({df.user_id.nunique():,} users)')

    n_capped = int((df['attempt_count'] > ATTEMPT_CAP).sum())
    print(f'attempt_count > {ATTEMPT_CAP} (capped):      {n_capped:>9,}')

    df = df.assign(time_sec=np.minimum(df['ms_first_response'] / 1000.0, TIME_CAP_SEC),
                   attempt_count=np.minimum(df['attempt_count'], ATTEMPT_CAP))
    return df.sort_values(['user_id', 'order_id'], kind='stable')


def difficulty_lookup(window: int) -> dict:
    """k correct out of `window` b=0 items → difficulty code (0/1/2)."""
    table = {}
    for k in range(window + 1):
        responses = [{'level': 'intermediate', 'correct': i < k} for i in range(window)]
        theta, _ = PlacementService.estimate_theta(responses)
        level = PlacementService.classify(theta)
        table[k] = DIFF_ENCODE[LEVEL_TO_DIFFICULTY[level]]
    return table


def label_for(accuracy: float) -> str:
    if accuracy >= PROMOTE_MIN:
        return 'promote'
    if accuracy < DEMOTE_MAX:
        return 'demote'
    return 'maintain'


def build_rows(df: pd.DataFrame, diff_by_k: dict) -> pd.DataFrame:
    rows = []
    for user_id, g in df.groupby('user_id', sort=True):
        n_windows = len(g) // WINDOW            # trailing partial window dropped
        if n_windows < 2:
            continue
        correct  = g['correct'].to_numpy()[:n_windows * WINDOW].reshape(n_windows, WINDOW)
        attempts = g['attempt_count'].to_numpy()[:n_windows * WINDOW].reshape(n_windows, WINDOW)
        times    = g['time_sec'].to_numpy()[:n_windows * WINDOW].reshape(n_windows, WINDOW)

        for t in range(n_windows - 1):
            k = int(correct[t].sum())
            rows.append({
                'user_id':       user_id,
                'window_index':  t,
                'accuracy':      k / WINDOW,
                'avg_attempts':  float(attempts[t].mean()),
                'avg_time_sec':  float(times[t].mean()),
                'difficulty':    diff_by_k[k],
                'next_accuracy': float(correct[t + 1].mean()),
                'label':         label_for(float(correct[t + 1].mean())),
            })
    return pd.DataFrame(rows)


def main():
    parser = argparse.ArgumentParser(description=__doc__.split('\n')[1])
    parser.add_argument('csv_path', help='raw ASSISTments 2009-2010 skill_builder_data.csv')
    parser.add_argument('--out', default=DEFAULT_OUT, help=f'output CSV (default: {DEFAULT_OUT})')
    args = parser.parse_args()

    df = load_and_clean(args.csv_path)

    diff_by_k = difficulty_lookup(WINDOW)
    names = {0: 'beginner', 1: 'intermediate', 2: 'advanced'}
    print('\ndifficulty column, ablation only (Rasch EAP, b = 0, RP50 cut-offs as Model A):')
    for code in (0, 1, 2):
        ks = [k for k, c in diff_by_k.items() if c == code]
        if ks:
            print(f'  {names[code]:12s} accuracy {min(ks)/WINDOW:.2f} - {max(ks)/WINDOW:.2f}'
                  f'  ({min(ks)}-{max(ks)} of {WINDOW} correct)')

    data = build_rows(df, diff_by_k)
    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    data.to_csv(args.out, index=False)

    print(f'\nsaved -> {args.out}')
    print(f'rows:  {len(data):,}')
    print(f'users: {data.user_id.nunique():,}')

    print('\nlabel distribution (from window t+1):')
    counts = data['label'].value_counts().reindex(LABELS)
    for lbl, n in counts.items():
        print(f'  {lbl:9s} {n:>6,}  ({n / len(data):6.1%})')

    print('\ndifficulty distribution (window t):')
    for code, n in data['difficulty'].value_counts().sort_index().items():
        print(f'  {code} {names[code]:12s} {n:>6,}  ({n / len(data):6.1%})')

    print('\nfeature summary:')
    with pd.option_context('display.width', 120, 'display.float_format', '{:,.3f}'.format):
        print(data[['accuracy', 'avg_attempts', 'avg_time_sec', 'difficulty', 'next_accuracy']]
              .describe().T)

    print('\nlabel by current difficulty (row %):')
    with pd.option_context('display.float_format', '{:.1%}'.format):
        print(pd.crosstab(data['difficulty'].map(names), data['label'], normalize='index')
              .reindex(columns=LABELS))


if __name__ == '__main__':
    main()
