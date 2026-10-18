"""Train E2 (code-aware SVM) and E3 (Model 3, no runner) on a dataset CSV and test on the approx pre-test set."""
import sys, numpy as np, pandas as pd
from sklearn.model_selection import StratifiedKFold, cross_val_predict
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.metrics import accuracy_score, f1_score
from train_eval import svm_pipe, new_vec, struct_features, GROUP2BROAD

tr = pd.read_csv(sys.argv[1]); te = pd.read_csv(sys.argv[2])
X, yb, yr = tr.code.values, tr.label.values, tr.reason_group.values
n1 = svm_pipe(new_vec()).fit(X, yb); n2 = svm_pipe(new_vec()).fit(X, yr)
skf = StratifiedKFold(5, shuffle=True, random_state=42)
o1 = cross_val_predict(svm_pipe(new_vec()), X, yb, cv=skf, method="decision_function")
o2 = cross_val_predict(svm_pipe(new_vec()), X, yr, cv=skf, method="decision_function")
S = np.array([struct_features(c) for c in X])
m3 = HistGradientBoostingClassifier(max_iter=300, learning_rate=0.08, random_state=42).fit(np.hstack([o1, o2, S]), yr)
Xt = te.code.values; ytr = te.reason_group.values; ytb = np.array([GROUP2BROAD(g) for g in ytr])
p2 = n2.predict(Xt); p1 = n1.predict(Xt)
p3 = m3.predict(np.hstack([n1.decision_function(Xt), n2.decision_function(Xt), np.array([struct_features(c) for c in Xt])]))
for name, pr, pb in [("E2 stage2", p2, p1), ("E3 model3", p3, np.array([GROUP2BROAD(g) for g in p3]))]:
    corr = ytr == "CORRECT_NO_ERROR"
    print(f"{name}: broad_acc={accuracy_score(ytb, pb):.3f} reason_acc={accuracy_score(ytr, pr):.3f} "
          f"reason_macroF1={f1_score(ytr, pr, average='macro'):.3f} correct_recall={np.mean(pr[corr] == 'CORRECT_NO_ERROR'):.2f} "
          f"error_recall={np.mean(pr[~corr] != 'CORRECT_NO_ERROR'):.2f}")
