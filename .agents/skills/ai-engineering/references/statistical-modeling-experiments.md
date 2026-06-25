# Statistical Modeling & Experiment Design

## A/B Test Design

### Sample Size Calculation

```python
import numpy as np
from scipy import stats

def calculate_sample_size(baseline_rate, mde, alpha=0.05, power=0.8):
    """
    Calculate required sample size per variant.
    baseline_rate: current conversion rate (e.g. 0.10)
    mde: minimum detectable effect (relative, e.g. 0.05 = 5% lift)
    """
    p1 = baseline_rate
    p2 = baseline_rate * (1 + mde)
    effect_size = abs(p2 - p1) / np.sqrt((p1 * (1 - p1) + p2 * (1 - p2)) / 2)
    z_alpha = stats.norm.ppf(1 - alpha / 2)
    z_beta = stats.norm.ppf(power)
    n = ((z_alpha + z_beta) / effect_size) ** 2
    return int(np.ceil(n))
```

### Experiment Analysis

```python
def analyze_experiment(control, treatment, alpha=0.05):
    """
    Run two-proportion z-test and return structured results.
    control/treatment: dicts with 'conversions' and 'visitors'.
    """
    p_c = control["conversions"] / control["visitors"]
    p_t = treatment["conversions"] / treatment["visitors"]
    pooled = (
        (control["conversions"] + treatment["conversions"])
        / (control["visitors"] + treatment["visitors"])
    )
    se = np.sqrt(
        pooled * (1 - pooled) * (1 / control["visitors"] + 1 / treatment["visitors"])
    )
    z = (p_t - p_c) / se
    p_value = 2 * (1 - stats.norm.cdf(abs(z)))
    ci_low = (p_t - p_c) - stats.norm.ppf(1 - alpha / 2) * se
    ci_high = (p_t - p_c) + stats.norm.ppf(1 - alpha / 2) * se
    return {
        "lift": (p_t - p_c) / p_c,
        "p_value": p_value,
        "significant": p_value < alpha,
        "ci_95": (ci_low, ci_high),
    }
```

### Experiment Checklist

1. Define ONE primary metric and pre-register secondary metrics before launch.
2. Calculate sample size BEFORE starting: `calculate_sample_size(0.10, 0.05)`.
3. Randomise at the user (not session) level to avoid leakage.
4. Run for at least 1 full business cycle (typically 2 weeks minimum).
5. Check for sample ratio mismatch: `abs(n_control - n_treatment) / expected < 0.01`.
6. Analyze with `analyze_experiment()` — report lift + CI, not just p-value.
7. Apply Bonferroni correction for multiple metrics: `alpha / n_metrics`.
8. Never peek at results mid-experiment — pre-commit to run duration.

---

## Causal Inference: Difference-in-Differences

```python
import statsmodels.formula.api as smf

def diff_in_diff(df, outcome, treatment_col, post_col, controls=None):
    """
    Estimate ATT via OLS DiD with optional covariates.
    df must have: outcome, treatment_col (0/1), post_col (0/1).
    Returns the interaction coefficient (treatment × post) and its p-value.
    """
    covariates = " + ".join(controls) if controls else ""
    formula = (
        f"{outcome} ~ {treatment_col} * {post_col}"
        + (f" + {covariates}" if covariates else "")
    )
    result = smf.ols(formula, data=df).fit(cov_type="HC3")
    interaction = f"{treatment_col}:{post_col}"
    return {
        "att":     result.params[interaction],
        "p_value": result.pvalues[interaction],
        "ci_95":   result.conf_int().loc[interaction].tolist(),
        "summary": result.summary(),
    }
```

### Causal Inference Checklist

1. Validate parallel trends in pre-period before trusting DiD estimates.
2. Use HC3 robust standard errors to handle heteroskedasticity.
3. For panel data, cluster SEs at the unit level (`groups=` param in `.fit()`).
4. Consider propensity score matching if groups differ at baseline.
5. Report the ATT with confidence interval, not just statistical significance.
6. Sensitivity analysis: test with different pre-period windows.

---

## Statistical Pattern Reference

| Method | When to Use | Key Assumption |
|--------|-------------|----------------|
| **Two-proportion z-test** | A/B conversion rate comparison | Large sample (n > 30 per group) |
| **t-test (Welch)** | Continuous metric comparison | Approximate normality or large n |
| **Mann-Whitney U** | Non-normal continuous metrics | Only ordinal structure needed |
| **DiD (OLS)** | Observational causal estimation | Parallel trends in pre-period |
| **Propensity Score Matching** | Adjust for selection bias | No unmeasured confounders |
| **Bootstrap CI** | Complex/non-standard statistics | Sufficient sample size |
| **Bayesian A/B** | When you want P(B > A) directly | Prior specification required |
| **CUPED** | Reduce variance with pre-experiment covariate | Pre/post correlation exists |

---

## Multiple Testing Corrections

```python
from statsmodels.stats.multitest import multipletests

def apply_correction(p_values, method="bonferroni", alpha=0.05):
    """
    method options: 'bonferroni', 'holm', 'fdr_bh' (Benjamini-Hochberg)
    """
    reject, p_adjusted, _, _ = multipletests(p_values, alpha=alpha, method=method)
    return {"reject": reject.tolist(), "p_adjusted": p_adjusted.tolist()}
```

Use **Bonferroni** for strict family-wise error control (few tests).
Use **Benjamini-Hochberg** (FDR) when testing many metrics simultaneously.
