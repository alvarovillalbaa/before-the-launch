# Product Management Frameworks

Load this file when the request involves prioritization frameworks (RICE, ICE, MoSCoW, Kano), discovery frameworks (JTBD, Opportunity Solution Tree, hypothesis templates, customer interview guides), or metrics frameworks (North Star, HEART, funnel analysis, go-to-market checklists).

For competitive analysis, use `competitive-strategy.md` instead. For OKRs and quarterly strategy, use `strategy-operating-model.md`.

---

## Prioritization Frameworks

### RICE Framework

**Formula:**
```
RICE Score = (Reach × Impact × Confidence) / Effort
```

| Component | Description | Values |
|-----------|-------------|--------|
| **Reach** | Users affected per quarter | Numeric count |
| **Impact** | Effect per user | massive=3x, high=2x, medium=1x, low=0.5x, minimal=0.25x |
| **Confidence** | Certainty in estimates | high=100%, medium=80%, low=50% |
| **Effort** | Person-months | xl=13, l=8, m=5, s=3, xs=1 |

**Interpretation:**
- 1000+: strong candidate for next quarter
- 500–999: consider for roadmap
- 100–499: keep in backlog
- <100: deprioritize unless new evidence arrives

**When to use:** quarterly roadmap planning, cross-team comparison, resolving prioritization debates with data.

**Limitations:** does not account for dependencies; may undervalue platform work; reach estimates can be gamed. Use `scripts/rice_prioritizer.py` to run calculations at scale.

---

### Value vs Effort Matrix

```
                  Low Effort          High Effort
                +--------------+------------------+
   High Value   |  QUICK WINS  |    BIG BETS      |
                |  [Do First]  |   [Strategic]    |
                +--------------+------------------+
   Low Value    |   FILL-INS   |   TIME SINKS     |
                |   [Maybe]    |    [Avoid]       |
                +--------------+------------------+
```

**Ideal portfolio mix:** 40% Quick Wins, 30% Big Bets, 20% Fill-Ins, 10% Buffer. Review quarterly.

---

### MoSCoW Method

| Category | Definition | Capacity |
|----------|------------|----------|
| **Must Have** | Product fails without it | 60% |
| **Should Have** | Important but workarounds exist | 20% |
| **Could Have** | Desirable enhancement | 10% |
| **Won't Have** | Explicitly out of scope this release | 0% — document explicitly |

**"Must Have" criteria:** regulatory requirement, core job cannot be done without it, explicitly promised to customers, security or data integrity requirement.

**Common mistakes:** everything becomes "Must Have" (scope creep); not documenting "Won't Have" items.

---

### ICE Scoring

**Formula:**
```
ICE Score = (Impact + Confidence + Ease) / 3
```

Each component on a 1–10 scale. Use ICE for early-stage exploration and quick estimates; use RICE for quarterly planning and cross-team prioritization.

---

### Kano Model

| Type | Absent | Present | Action |
|------|--------|---------|--------|
| **Basic (Must-Be)** | Dissatisfied | Neutral | Table stakes — ship it |
| **Performance (Linear)** | Neutral | Satisfied proportionally | Differentiation driver |
| **Excitement (Delighter)** | Neutral | Very satisfied | Strategic competitive edge |
| **Indifferent** | Neutral | Neutral | Skip unless cheap |
| **Reverse** | Satisfied | Dissatisfied | Remove if it exists |

**Classification questions:**
1. How would you feel if the product HAS this feature?
2. How would you feel if the product DOES NOT have this feature?

---

## Discovery Frameworks

### Customer Interview Guide

**Structure (35 minutes):**

```
1. Context (5 min)      — build rapport, understand role
2. Problem exploration (15 min) — dig into pain points
3. Solution validation (10 min) — test concepts if applicable
4. Wrap-up (5 min)      — referrals, follow-up
```

**Phase 2 — Problem exploration script:**
```
- What's the hardest part about [task]?
- Tell me about the last time you struggled with this.
- What did you do? What happened?
- How often does this happen?
- What does it cost you (time, money, frustration)?
- What have you tried? Why didn't it work?
```

**Phase 3 — Solution validation script:**
```
[Show rough prototype — keep it rough to invite honest feedback]
- What's your initial reaction?
- How does this compare to what you do today?
- What would prevent you from using this?
- How much would this be worth to you?
```

**Best practices:**
- Never ask "would you use this?" — ask about past behavior instead
- Ask "Tell me about the last time..." not "Do you ever..."
- Embrace silence — count to 7 before filling gaps
- Watch for emotional reactions: pain = opportunity
- Record with permission; take minimal notes during the session

Use `scripts/customer_interview_analyzer.py` to extract pain points, feature requests, JTBD patterns, sentiment, and quotes from raw transcripts.

---

### Hypothesis Template

**Format:**
```
We believe that [building this feature/making this change]
For [target user segment]
Will [achieve this measurable outcome]

We'll know we're right when [specific metric moves by X% within Y timeframe]
We'll know we're wrong when [falsification criteria]
```

**Quality checklist:**
- [ ] Specific user segment defined
- [ ] Measurable outcome (a number, not "better")
- [ ] Timeframe for measurement stated
- [ ] Clear falsification criteria
- [ ] Based on evidence (interviews or data), not opinion

---

### Opportunity Solution Tree

**Structure:**
```
[DESIRED OUTCOME]
        │
        ├── Opportunity 1: [User problem/need]
        │   ├── Solution A
        │   ├── Solution B
        │   └── Experiment: [Test to validate]
        │
        ├── Opportunity 2: [User problem/need]
        │   └── Solution C
        │
        └── Opportunity 3: [User problem/need]
            └── Solution D
```

**Process:**
1. Start with a measurable outcome — not a solution
2. Map opportunities from user research
3. Generate multiple solutions per opportunity
4. Design small experiments to validate before building
5. Prioritize by learning potential, not feature size

**OST quality checks:**
- At least 3 distinct opportunities before converging on a solution
- At least 2 experiments per top opportunity
- Tie every branch to an evidence source
- Keep the tree live — update after each interview or test
- Separate opportunity evidence from solution proposals
- Avoid single-branch trees that force one solution path

---

### Jobs to Be Done

**JTBD statement format:**
```
When [situation/trigger]
I want to [motivation/job]
So I can [expected outcome]
```

**Switch interview questions:**
- When did you first realize you needed something like this?
- What were you using before? Why did you switch?
- What almost prevented you from switching?
- What would make you go back to the old way?

**JTBD interview focus areas:**
- Trigger moments — what caused the switch event
- Current alternatives and workarounds in use
- Purchase or adoption anxieties
- Desired progress and criteria for success

**Force diagram:**
```
Push from current ──────> SWITCH DECISION <────── Pull toward new
                               ^   ^
                               |   |
              Anxiety of change ┘   └ Habit of status quo
```

---

### Assumption Mapping

Identify and prioritize assumptions before committing delivery resources.

**Assumption categories:**
| Category | Definition |
|----------|------------|
| **Desirability** | Users want this |
| **Viability** | Business value exists |
| **Feasibility** | Team can build and operate it |
| **Usability** | Users can successfully use it |

**Assumption Prioritization Matrix:**

Map assumptions on two axes — risk if wrong (low → high) and certainty (low → high):

| | Low Certainty | High Certainty |
|---|---|---|
| **High Risk** | Test first | Validate quickly |
| **Low Risk** | Defer | Document |

**Priority order:** High risk + low certainty → High risk + high certainty → Low risk + low certainty → Low risk + high certainty.

**Tooling:** Run `scripts/assumption_mapper.py` to score and rank assumptions from a CSV file or inline input. Outputs a prioritized test plan with suggested test types per category.

```bash
# CSV input
python3 scripts/assumption_mapper.py assumptions.csv

# Inline input
python3 scripts/assumption_mapper.py \
  --assumption "Users will pay for this|viability|0.9|0.2" \
  --assumption "Team can integrate the API|feasibility|0.6|0.7"
```

CSV columns required: `assumption`, `category`, `risk` (0–1), `certainty` (0–1).

---

### Problem and Solution Validation

**Problem validation techniques:**
- Problem interviews focused on current behavior (not hypothetical preferences)
- Journey friction mapping
- Support ticket and sales-call synthesis
- Behavioral analytics triangulation

**Evidence threshold examples:**
- Same pain repeated across multiple target users
- Observable workaround behavior
- Measurable cost of current pain (time, money, churn)

**Solution validation techniques:**
| Technique | What it tests |
|-----------|---------------|
| Concept test | Value proposition comprehension |
| Prototype usability test | Task success / time-to-complete |
| Fake door or concierge test | Demand signal before building |
| Limited beta cohort | Retention and activation signals |

**Validation rule:** measure behavior, not only stated preference.

---

### Design Sprint Methodology

Use when a high-ambiguity opportunity requires compressed cross-functional alignment.

**Typical phases:**
1. Understand — map the problem space and choose a target
2. Sketch — divergent solution ideation
3. Decide — converge on the most promising solution
4. Prototype — build a realistic but low-fidelity artefact
5. Test — validate with 5+ target users

**Suggested 10-day discovery sprint structure:**
| Days | Activity |
|------|----------|
| 1–2 | Outcome framing + opportunity mapping |
| 3–4 | Assumption mapping + test design |
| 5–7 | Problem and solution tests |
| 8–9 | Evidence synthesis + decision options |
| 10 | Stakeholder decision review |

**End-of-sprint decision:** proceed, pivot, or stop — defined before the sprint starts.

**Discovery evidence rules:**
- One source is not enough for major decisions
- Triangulate qualitative and quantitative signals
- Predefine decision criteria before test execution
- Archive evidence with date, segment, and method

---

## Metrics Frameworks

### North Star Metric Framework

**A good North Star metric:**
1. Measures value actually delivered to users
2. Is a leading indicator of business success
3. Is actionable — teams can influence it
4. Is measurable on a regular cadence

**Supporting metrics structure:**
```
[NORTH STAR METRIC]
        │
        ├── Breadth: How many users?
        ├── Depth: How engaged are they?
        └── Frequency: How often?
```

---

### HEART Framework

| Metric | Definition | Example signals |
|--------|------------|-----------------|
| **Happiness** | Subjective satisfaction | NPS, CSAT, survey scores |
| **Engagement** | Depth of involvement | Session length, actions/session |
| **Adoption** | New user behavior | Signups, feature activation |
| **Retention** | Continued usage | D7/D30 retention, churn rate |
| **Task Success** | Efficiency and effectiveness | Completion rate, time-on-task, error rate |

**Goals-Signals-Metrics process:**
1. **Goal**: what user behavior indicates success?
2. **Signal**: how would success manifest in data?
3. **Metric**: how do we measure the signal?

---

### Funnel Analysis Template

```
Acquisition → Activation → Retention → Revenue → Referral
```

| Stage | Key Metrics | Typical Benchmark |
|-------|-------------|-------------------|
| **Acquisition** | Visitors, CAC, channel mix | Varies |
| **Activation** | Signup rate, onboarding completion | 20–30% visitor→signup |
| **Retention** | D1/D7/D30, churn | D1: 40%, D7: 20%, D30: 10% |
| **Revenue** | Conversion rate, ARPU, LTV | 2–5% free→paid |
| **Referral** | NPS, viral coefficient | NPS >50 is excellent |

**Analysis process:** map current rates → find biggest drop-off → qualitative research on why → hypothesis → test.

---

### Feature Success Metrics

| Metric | Definition | Target range |
|--------|------------|--------------|
| **Adoption** | % users who try feature | 30–50% within 30 days |
| **Activation** | % who complete core action | 60–80% of adopters |
| **Frequency** | Uses per user per period | Weekly for engagement features |
| **Depth** | % of feature capability used | 50%+ of core functionality |
| **Retention** | Continued usage over time | 70%+ at 30 days |
| **Satisfaction** | Feature NPS or rating | NPS >30, Rating >4.0 |

**Measurement cadence:** Week 1 (adoption, initial activation) → Week 4 (retention, depth) → Week 8 (satisfaction, business impact).

---

## Go-to-Market Checklist

**Pre-launch (4 weeks before):**
- [ ] Success metrics defined and instrumented
- [ ] Launch/rollback criteria established
- [ ] Support documentation ready
- [ ] Sales enablement materials complete
- [ ] Marketing assets prepared
- [ ] Beta feedback incorporated

**Launch week:**
- [ ] Staged rollout plan (1% → 10% → 50% → 100%)
- [ ] Monitoring dashboards live
- [ ] On-call rotation scheduled
- [ ] Communications ready (in-app, email, blog)
- [ ] Support team briefed

**Post-launch (2 weeks after):**
- [ ] Metrics review vs. targets
- [ ] User feedback synthesized
- [ ] Bug and issue triage complete
- [ ] Iteration plan defined
- [ ] Stakeholder update sent

---

## Framework Selection Guide

| Situation | Recommended framework |
|-----------|----------------------|
| Quarterly roadmap planning | RICE + Portfolio Matrix |
| Sprint-level prioritization | MoSCoW |
| Quick feature comparison | ICE |
| Understanding user satisfaction | Kano |
| User research synthesis | JTBD + Opportunity Solution Tree |
| Assumption de-risking | Assumption Mapping + assumption_mapper.py |
| Problem validation | Problem interviews + journey mapping |
| Solution validation | Concept test / prototype / fake door |
| High-ambiguity opportunity | Design Sprint (10-day) |
| Feature experiment design | Hypothesis Template |
| Success measurement | HEART + Feature Metrics |
| Funnel optimization | Funnel Analysis |
| Launch readiness | Go-to-Market Checklist |
| Strategy communication | North Star + Vision (see strategy-operating-model.md) |
| Competitive analysis | competitive-strategy.md |
