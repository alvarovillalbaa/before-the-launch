# Experiment Playbook

Load this reference when the user needs to design an A/B test, compare variants, size a test, build an experiment backlog, or run experimentation as an ongoing operating system rather than a one-off analysis.

---

## When to Use

- the user wants to test two or more product, flow, or messaging variants
- the team needs a hypothesis, metric plan, stopping rule, or sample-size input
- CRO recommendations need to be turned into executable experiments
- the user wants to prioritize a queue of experiments with ICE
- the team wants a repeatable experimentation cadence or experiment playbook

---

## Initial Assessment

Before designing a test, clarify:

1. `Test context`
   what is changing, for whom, and in which part of the funnel
2. `Current state`
   current conversion rate or baseline behavior, traffic volume, and existing friction
3. `Constraints`
   implementation complexity, timeline, testing tool constraints, and any exposure risk

If baseline rate or traffic is unknown, say that runtime and confidence claims will stay approximate until those are known.

---

## Core Principles

### 1. Start with a real hypothesis

Do not run "let's see what happens" tests. Every test needs a causal claim grounded in evidence, user research, or prior behavior.

### 2. Test one meaningful variable

If too many things change at once, attribution gets weak. Prefer one bold, hypothesis-linked change over several tiny cosmetic changes.

### 3. Pre-commit to rigor

- define the sample-size logic before launch
- define the minimum run window before launch
- define pause criteria and guardrails before launch

### 4. Measure business-relevant outcomes

Use one primary metric to make the decision, then use guardrails and diagnostics to interpret the result safely.

---

## Hypothesis Framework

Use:

```text
Because [observation or evidence], we believe [change] will cause [expected outcome] for [audience].
We'll know this is true when [primary metric] changes by at least [threshold] without harming [guardrails].
```

Weak:
- "Changing the CTA might help."

Stronger:
- "Because first-time visitors miss the next step on the pricing page, we believe increasing CTA contrast and making the value of the click explicit will increase pricing-page-to-signup-start conversion by at least 12% for new visitors without increasing support contacts."

---

## Test Types

| Type | Best for | Traffic need |
|---|---|---|
| A/B | One control vs one variant | Moderate |
| A/B/n | A few distinct variants | Higher |
| Multivariate | Interaction effects between multiple factors | Very high |
| Holdout | Measuring incremental lift of a broader intervention | Moderate to high |
| Split URL | Testing materially different page or flow structures | Moderate |

Default to simple A/B tests unless there is a strong reason not to.

---

## Metric Design

### Primary metric

- single decision metric
- directly tied to user value and business impact
- chosen before launch

### Guardrail metrics

- protect against local optimization damage
- examples: churn proxy, error rate, refund rate, support contacts, latency

### Diagnostic metrics

- explain why the result happened
- examples: CTA click-through, step completion, time on task
- useful for interpretation, not for moving the goalposts

---

## Sample Size and Runtime

When the user needs sizing, use `scripts/sample_size_calculator.py`.

Inputs:
- baseline conversion rate
- MDE
- alpha
- power

### Practical rules

- smaller MDE means much larger sample requirements
- low-baseline funnels need especially large traffic to detect subtle lifts
- test duration should cover behavior variation across weekdays and weekends

### Quick directional table

| Baseline | 10% relative lift | 20% relative lift | 50% relative lift |
|---|---|---|---|
| 1% | very high traffic required | high traffic required | still non-trivial |
| 5% | high traffic required | manageable for many product surfaces | modest for large surfaces |
| 10% | moderate traffic required | often feasible | usually feasible |

Use the script for the actual estimate. The table is only a warning against underpowered tests.

---

## Variant Design

Good variant design is:
- tightly linked to the hypothesis
- bold enough to detect
- minimal enough to attribute
- realistic enough to ship if it wins

Common things to vary:
- headline or value framing
- CTA copy, placement, or hierarchy
- amount and order of content
- social proof placement
- form friction
- flow step sequencing

Bad candidates:
- tiny visual tweaks with no evidence-based rationale
- mixed changes that combine copy, layout, and targeting without a clear causal story

---

## Traffic Allocation

| Approach | Split | Best for |
|---|---|---|
| Standard | 50/50 | Default A/B tests |
| Conservative | 90/10 or 80/20 | Risky variants or revenue-sensitive flows |
| Ramped | Start small, then increase | Technical or operational risk mitigation |

Checks:
- users should stay in the same variant on return where appropriate
- exposure should be balanced across day and week patterns
- assignment should be verified before reading results

---

## Implementation Choice

### Client-side

- faster to ship
- can introduce flicker or measurement issues
- better for lower-risk messaging and layout tests

### Server-side

- cleaner render path
- more engineering effort
- better for higher-stakes or more structural tests

If implementation risk is high, recommend a ramped rollout or smaller exposure share first.

---

## Pre-Launch Checklist

- hypothesis written and reviewed
- target audience and exposure rules defined
- primary metric, guardrails, and diagnostics frozen
- sample size and minimum run window agreed
- tracking validated end to end
- variant QA completed on all device classes that matter
- rollback or pause plan documented

---

## Running Rules

### Do

- monitor for instrumentation failure or obvious technical issues
- watch guardrail metrics
- document external events that could distort results

### Do not

- stop early because the interim chart looks good
- change variants or targeting mid-test
- introduce new traffic sources without documenting the break

### Peeking warning

Fixed-horizon tests become unreliable when teams repeatedly look and stop at the first favorable swing. Pre-commit to the decision window and follow it.

---

## Result Analysis

Check results in this order:

1. Did the test reach the planned sample or window?
2. Is the effect directionally clear?
3. Is the interval precise enough to support a decision?
4. Is the effect large enough to matter in business terms?
5. Did any guardrail worsen materially?
6. Are segment differences pre-registered and interpretable?

Interpretation guidance:
- statistical significance is not enough if the effect is trivial
- lack of significance is not proof of no effect when the test is underpowered
- segment slicing after the fact is exploratory, not decision-grade
- novelty effects can overstate early lifts, especially in onboarding or prominent UI changes

---

## Documentation and Readout

Document every completed experiment with:

- hypothesis
- audience and surface
- control and variant description
- sample size and duration
- primary metric result
- guardrail outcomes
- decision: ship, iterate, stop, or re-test
- learning that should generalize elsewhere

### Readout template

1. Hypothesis and why now
2. Experiment setup and quality checks
3. Primary metric result and confidence
4. Guardrail status
5. Segment observations
6. Decision
7. Follow-up actions

---

## Experiment Backlog and Program

### Operating loop

1. generate hypotheses from analytics, research, support, or prior tests
2. score candidates with ICE
3. run the best experiment
4. analyze results with discipline
5. promote reusable wins into a playbook
6. feed learnings back into the backlog

### Hypothesis sources

- funnel drop-offs
- user research and usability findings
- support and sales objections
- session recordings or heatmaps
- competitor patterns
- inconclusive or losing experiments that reveal new angles

### ICE prioritization

Use 1-10 scores:
- `Impact` — how much the metric could move if true
- `Confidence` — how strong the evidence is
- `Ease` — how quickly and cheaply it can be tested

`ICE Score = (Impact + Confidence + Ease) / 3`

Use ICE for quick experiment backlog ranking. Use RICE when the decision shifts from experiments to larger roadmap tradeoffs.

### Program health metrics

Track:
- experiments launched per month
- average test duration
- backlog depth
- win rate
- cumulative lift from implemented winners

Healthy programs usually optimize for learning velocity and decision quality, not vanity win rate.

### Cadence

- `Weekly`: check running tests for quality or guardrail issues
- `Bi-weekly`: close completed tests, write readouts, queue next tests
- `Monthly`: re-score backlog, review velocity and coverage gaps
- `Quarterly`: review which proven patterns have been scaled and which funnel stages remain under-tested

---

## Failure Modes

- testing changes too small to detect
- running experiments without enough traffic to learn anything useful
- changing goals after seeing interim results
- peeking and stopping early
- optimizing a local metric while hurting the broader experience
- over-reading post-hoc segments
- treating every losing test as failure instead of evidence
