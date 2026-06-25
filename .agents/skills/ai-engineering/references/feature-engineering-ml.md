# Feature Engineering for ML

## Scikit-learn Feature Pipeline

```python
import pandas as pd
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.compose import ColumnTransformer

def build_feature_pipeline(numeric_cols, categorical_cols, date_cols=None):
    """
    Returns a fitted-ready ColumnTransformer for structured tabular data.
    """
    numeric_pipeline = Pipeline([
        ("impute", SimpleImputer(strategy="median")),
        ("scale",  StandardScaler()),
    ])
    categorical_pipeline = Pipeline([
        ("impute", SimpleImputer(strategy="most_frequent")),
        ("encode", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
    ])
    transformers = [
        ("num", numeric_pipeline, numeric_cols),
        ("cat", categorical_pipeline, categorical_cols),
    ]
    return ColumnTransformer(transformers, remainder="drop")
```

## Time-Based Feature Extraction

```python
def add_time_features(df, date_col):
    """Extract cyclical and lag features from a datetime column."""
    df = df.copy()
    df[date_col] = pd.to_datetime(df[date_col])
    # Cyclical encoding preserves periodicity (e.g. Mon→Sun→Mon)
    df["dow_sin"] = np.sin(2 * np.pi * df[date_col].dt.dayofweek / 7)
    df["dow_cos"] = np.cos(2 * np.pi * df[date_col].dt.dayofweek / 7)
    df["month_sin"] = np.sin(2 * np.pi * df[date_col].dt.month / 12)
    df["month_cos"] = np.cos(2 * np.pi * df[date_col].dt.month / 12)
    df["is_weekend"] = (df[date_col].dt.dayofweek >= 5).astype(int)
    return df
```

## Feature Engineering Checklist

1. **Never fit transformers on the full dataset** — fit on train, transform test.
2. Log-transform right-skewed numeric features before scaling.
3. For high-cardinality categoricals (>50 levels), use target encoding or embeddings instead of OHE.
4. Generate lag/rolling features **before** the train/test split to avoid leakage.
5. Document each feature's business meaning alongside its code.
6. Profile missing values before choosing imputation strategy — MCAR vs. MAR vs. MNAR require different approaches.
7. Check for near-zero variance and highly correlated features post-transform.

---

## Encoding Strategies by Cardinality

| Cardinality | Strategy | Notes |
|-------------|----------|-------|
| Binary (2) | Label encode (0/1) | Simple, no dummy trap |
| Low (3–20) | OneHotEncoder | `handle_unknown="ignore"` for safety |
| Medium (20–50) | OHE or target encoding | Measure cardinality after cleaning |
| High (>50) | Target encoding, embeddings, hashing | Risk of leakage with target encoding — use CV folds |
| Ordinal | OrdinalEncoder with explicit ordering | Don't use alphabetical order |

---

## Data Leakage Prevention

```python
from sklearn.model_selection import train_test_split

# CORRECT: split first, then fit pipeline
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
pipeline = build_feature_pipeline(num_cols, cat_cols)
X_train_transformed = pipeline.fit_transform(X_train)
X_test_transformed = pipeline.transform(X_test)   # transform only — no fit

# WRONG — leaks test distribution into scaler/encoder:
# X_all = pipeline.fit_transform(X)
# X_train, X_test = train_test_split(X_all, ...)
```

---

## Feature Selection

```python
from sklearn.feature_selection import SelectFromModel
from xgboost import XGBClassifier
import shap

def select_features_shap(model, X_train, threshold=0.01):
    """
    Use SHAP mean absolute values to rank and filter features.
    threshold: minimum mean |SHAP| to retain a feature.
    """
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X_train)
    mean_shap = np.abs(shap_values).mean(axis=0)
    selected = X_train.columns[mean_shap >= threshold].tolist()
    return selected, dict(zip(X_train.columns, mean_shap))
```

## Common Transformations

```python
# Log transform (right-skewed: revenue, counts)
df["log_revenue"] = np.log1p(df["revenue"])   # log1p handles 0 values

# Winsorizing outliers
from scipy.stats import mstats
df["capped"] = mstats.winsorize(df["value"], limits=[0.01, 0.01])

# Interaction terms
df["price_x_quantity"] = df["price"] * df["quantity"]

# Binning continuous → ordinal
df["age_band"] = pd.cut(df["age"], bins=[0, 18, 35, 55, 100],
                         labels=["<18", "18-35", "35-55", "55+"])
```
