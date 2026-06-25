# Model Training, Evaluation & Selection

## Cross-Validated Evaluation

```python
from sklearn.model_selection import StratifiedKFold, cross_validate
from sklearn.metrics import make_scorer, roc_auc_score, average_precision_score
from sklearn.dummy import DummyClassifier

SCORERS = {
    "roc_auc":  make_scorer(roc_auc_score, needs_proba=True),
    "avg_prec": make_scorer(average_precision_score, needs_proba=True),
}

def evaluate_model(model, X, y, cv=5):
    """
    Cross-validate and return mean ± std for each scorer.
    Uses StratifiedKFold for classification to preserve class balance.
    """
    cv_results = cross_validate(
        model, X, y,
        cv=StratifiedKFold(n_splits=cv, shuffle=True, random_state=42),
        scoring=SCORERS,
        return_train_score=True,
    )
    summary = {}
    for metric in SCORERS:
        test_scores = cv_results[f"test_{metric}"]
        train_mean = cv_results[f"train_{metric}"].mean()
        summary[metric] = {
            "mean": test_scores.mean(),
            "std": test_scores.std(),
            "overfit_gap": train_mean - test_scores.mean(),
        }
    return summary

def baseline_check(X, y, scorers=SCORERS, cv=5):
    """Always verify your model beats a naive baseline."""
    dummy = DummyClassifier(strategy="most_frequent")
    return cross_validate(
        dummy, X, y,
        cv=StratifiedKFold(n_splits=cv, shuffle=True, random_state=42),
        scoring=scorers,
    )
```

## MLflow Experiment Tracking

```python
import mlflow
from sklearn.metrics import roc_auc_score, average_precision_score

def train_and_log(model, X_train, y_train, X_test, y_test, run_name):
    """Train model and log all artefacts to MLflow."""
    with mlflow.start_run(run_name=run_name):
        model.fit(X_train, y_train)
        proba = model.predict_proba(X_test)[:, 1]
        metrics = {
            "roc_auc":  roc_auc_score(y_test, proba),
            "avg_prec": average_precision_score(y_test, proba),
        }
        mlflow.log_params(model.get_params())
        mlflow.log_metrics(metrics)
        mlflow.sklearn.log_model(model, "model")
        return metrics
```

## SHAP Interpretability

```python
import shap

def explain_model(model, X_sample, feature_names=None):
    """
    Generate SHAP explanations for tree-based models.
    Always validate that top features make business sense.
    """
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X_sample)
    # Summary plot — call in notebook context
    shap.summary_plot(shap_values, X_sample, feature_names=feature_names)
    mean_importance = {
        (feature_names[i] if feature_names else i): float(abs(shap_values[:, i]).mean())
        for i in range(shap_values.shape[1])
    }
    return dict(sorted(mean_importance.items(), key=lambda x: x[1], reverse=True))
```

## Model Evaluation Checklist

1. Always report **AUC-PR alongside AUC-ROC** for imbalanced datasets — AUC-ROC is optimistic when negatives dominate.
2. `overfit_gap > 0.05` is a warning sign of overfitting — regularise or reduce features.
3. **Calibrate probabilities** (Platt scaling / isotonic regression) before using predicted probabilities in production.
4. Compute SHAP values and **validate feature importance makes business sense** — if a leak-prone feature ranks #1, investigate.
5. Run a baseline (`DummyClassifier`) and verify the model meaningfully beats it.
6. **Log every run to MLflow** — never rely on notebook output for model comparison.
7. Use `StratifiedKFold` for classification; `KFold` for regression; `TimeSeriesSplit` for time-dependent data.

---

## Metric Selection Guide

| Task | Primary Metric | Secondary | Notes |
|------|---------------|-----------|-------|
| Binary classification (balanced) | AUC-ROC | F1 | Threshold-independent |
| Binary classification (imbalanced) | AUC-PR | F1 at threshold | PR curve more informative than ROC |
| Multi-class | Macro F1 | Per-class precision/recall | Macro weights all classes equally |
| Regression | RMSE | MAE, R² | RMSE penalises outliers heavily |
| Ranking | NDCG@K | MAP | Use when order matters |
| Forecasting | MAPE or sMAPE | RMSE | MAPE fails when actuals near 0 |

---

## Probability Calibration

```python
from sklearn.calibration import CalibratedClassifierCV, calibration_curve
import matplotlib.pyplot as plt

def calibrate_model(model, X_train, y_train, method="isotonic"):
    """method: 'sigmoid' (Platt) or 'isotonic' (non-parametric, needs more data)"""
    calibrated = CalibratedClassifierCV(model, method=method, cv=5)
    calibrated.fit(X_train, y_train)
    return calibrated

def plot_calibration(model, X_test, y_test, n_bins=10):
    proba = model.predict_proba(X_test)[:, 1]
    fraction_pos, mean_pred = calibration_curve(y_test, proba, n_bins=n_bins)
    plt.plot(mean_pred, fraction_pos, marker="o", label="Model")
    plt.plot([0, 1], [0, 1], linestyle="--", label="Perfect calibration")
    plt.xlabel("Mean predicted probability")
    plt.ylabel("Fraction of positives")
    plt.legend()
    plt.show()
```

---

## XGBoost Production Config

```python
import xgboost as xgb

XGBOOST_DEFAULTS = {
    "n_estimators": 500,
    "learning_rate": 0.05,
    "max_depth": 6,
    "min_child_weight": 3,
    "subsample": 0.8,
    "colsample_bytree": 0.8,
    "reg_alpha": 0.1,
    "reg_lambda": 1.0,
    "scale_pos_weight": 1,  # set to neg/pos ratio for imbalanced data
    "eval_metric": ["auc", "aucpr"],
    "early_stopping_rounds": 50,
    "random_state": 42,
    "n_jobs": -1,
}

model = xgb.XGBClassifier(**XGBOOST_DEFAULTS)
model.fit(
    X_train, y_train,
    eval_set=[(X_val, y_val)],
    verbose=100,
)
```
