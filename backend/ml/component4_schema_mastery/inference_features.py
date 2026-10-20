"""Shared count scaling for training and live post-tests."""

import pandas as pd

MODEL_VERSION = "time_excluded_v1"
COUNT_COLUMNS = [f"post_test_{quality}_count" for quality in (
    "correct", "nearly_correct", "wrong", "clearly_wrong",
)]


def scale_answer_counts(data):
    frame = pd.DataFrame(data).copy()
    counts = frame[COUNT_COLUMNS].apply(pd.to_numeric, errors="coerce")
    totals = counts.sum(axis=1).replace(0, float("nan"))
    for column in COUNT_COLUMNS:
        frame[column] = counts[column].div(totals).mul(10).fillna(0)
    return frame
