---
name: reporting
description: >-
  Use for weekly updates, monthly operating reviews, board reports, investor
  updates, QBRs, KPI summaries, delivery-health reports, content performance
  reports, audience growth reviews, product KPI reviews, feature adoption and
  retention reports, expense reports, savings-goal check-ins, and social
  mention monitoring that must collect live data from source systems, compare
  against prior state or thresholds, and turn the result into decisions,
  owners, and escalation calls.
version: 1.2.0
license: MIT
compatibility: Instruction-only. Optional tools for email, web, files, sheets, and messaging.
---

# Reporting

Turn live operating data into compact reports that answer one practical
question:

- what changed
- why it matters
- what needs action now

Do not produce reporting theater. A report is only credible when it is grounded
in live or recently fetched data from the systems that actually run the
business.

## Core Reporting Loop

Use this loop for every report, regardless of domain:

1. define the reporting frame: period, audience, operating question
2. load prior state, baselines, or thresholds
3. fetch current data from source systems
4. compare current state against prior state, targets, or seen items
5. isolate the few deltas that actually matter
6. turn those deltas into decisions, owners, and escalations
7. save enough state for the next run when the report is recurring

If the task is recurring, the report should feel like a checkpoint, not a reset.

## First Run Vs Recurring Run

Treat recurring reporting as a tracked system.

On a first run:

- define the operating question and cadence
- collect the minimum baseline needed for next time
- ask for or infer targets, categories, thresholds, or tracked entities
- save only the state required to make the next run comparative

On later runs:

- load the last snapshot before fetching new data
- identify what is new, changed, completed, or still unresolved
- avoid repeating previously seen items unless their status worsened or they now
  require a decision
- update the saved state at the end of the run

Do not ask the user to restate stable tracking context every time if the task is
clearly part of a cadence.

## Reporting Memory Contract

When the report is recurring, preserve only the state that improves the next
run. Typical stored fields:

- `last_run_at`
- `reporting_window`
- `previous_totals` or prior KPI snapshot
- `targets`, thresholds, or pacing assumptions
- tracked entities such as channels, vendors, goals, or keywords
- `seen_ids`, `seen_urls`, or previously reported items
- unresolved risks, open asks, and named owners

Good recurring reports know what changed since the last run without redoing the
entire setup.

## External Data Requirement

For proper reporting, connect to the source systems instead of relying on stale
memory, copied summaries, or guessed numbers.

Preferred integration order:

1. **CLI first**: use the system's CLI when it is available and trustworthy.
2. **MCP second**: use MCP tools when they provide cleaner or richer access.
3. **API last**: call direct APIs only when CLI and MCP cannot provide the
   required coverage.

Rules:

- Do not claim a report is current unless you actually fetched current data.
- Do not invent values for unavailable systems.
- If a required system is unreachable, say which part of the report is degraded.
- If the source of truth is ambiguous, name the system you chose and why.
- For recurring reports, record what point in time the data reflects.

## Use This Skill For

- weekly team or functional updates
- monthly operating reviews
- board or investor updates
- QBRs and business performance summaries
- KPI dashboards that need narrative, not a metric dump
- executive escalation memos with a clear ask
- engineering delivery reporting: PR queue, review latency, merge conflicts, CI,
  and release readiness
- product analytics reporting: KPI hierarchy, cohort and retention reviews,
  funnel health, feature adoption, and release-impact analysis
- monthly expense reporting from receipts, invoices, or finance notifications
- savings-goal check-ins against targets and current pace
- audience growth reports by channel or segment
- engagement analysis by content type, format, or platform
- social mention monitoring, testimonial collection, and brand-signal reporting

## Typical Source Systems

Common external inputs include:

- `git`, GitHub CLI, CI CLIs, deployment tooling
- issue trackers such as Linear, Jira, or internal ticketing systems
- spreadsheets, BI exports, finance systems, and warehouse query outputs
- inboxes, receipt emails, invoices, bank notifications, and statement exports
- CRM, support, social, analytics, and community platforms
- team status notes only after the operating data has been collected

When multiple systems disagree, prefer the one closest to execution:

- merged PRs over status notes
- issue tracker state over a slide
- warehouse numbers over manually edited summaries
- platform analytics over hand-counted screenshots

## Inputs

- reporting window
- audience
- operating question
- source systems and access method, if known
- baselines, targets, thresholds, or previous-period report
- notable events: launches, incidents, staffing changes, campaign changes,
  customer signals, or external mentions

If the user omits audience or period, infer the most likely choice and state the
assumption in the report.

## Start With The Exact Question

Do not begin by dumping every available metric. Pin the narrow operating
question first.

Examples:

- weekly exec update: "What needs attention this week?"
- board update: "What changed materially since the last meeting?"
- delivery review: "Where is merge flow slowing down and what needs fixing?"
- expense review: "Where did money go this period and what looks unusual?"
- savings check-in: "Which goals are on pace, behind pace, or completed?"
- product review: "Which KPIs moved, which cohorts changed, and what product
  action follows?"
- engagement review: "Which content formats earned attention and what should we
  publish more often next?"
- audience growth review: "Which channels are growing, flat, or slipping?"
- mentions scan: "What new external signals require response, watch, or
  escalation?"
- social-proof scan: "What new quotable praise is worth saving and where should
  it be used?"

If the question is fuzzy, sharpen it before collecting data.

## Default Workflow

### 1. Define the frame

- state the reporting window
- identify the audience
- identify the decision the report must support

### 2. Load baseline and thresholds

Before fetching current data, establish:

- prior period or prior run
- target or service level
- escalation thresholds
- open risks or asks already in flight
- seen items or stored snapshots, when the report tracks new mentions or trend
  history

If the user does not provide thresholds, propose pragmatic defaults and label
them as proposed.

If this is the first run of a recurring report, capture the initial tracking
setup now:

- goals and target amounts
- KPI framework or KPI hierarchy when the report is product-facing
- category schema
- tracked brands, aliases, or keywords
- thresholds for alerts or escalation

### 3. Fetch live data from source systems

For every source, capture:

- system name
- access path used: CLI, MCP, or API
- time the data reflects, if relevant
- any obvious data-quality caveat

Avoid over-collecting vanity metrics. Pull only the fields required to answer
the operating question.

When the source is unstructured, extract stable fields before analysis. Common
examples:

- receipt or invoice emails: amount, vendor, date, category
- goal updates: current saved amount, target amount, recent contribution
- product analytics exports: cohort anchor, retained behavior, segment, and
  release or experiment window
- mentions: author, quote, URL, timestamp, engagement, polarity

### 4. Normalize into reporting signals

For each important signal, record:

- current value
- prior value, baseline, or prior-seen state
- delta
- threshold or target
- status: healthy, watch, action required

Do not interpret until the facts are stable.

For recurring reports, distinguish:

- brand-new items
- previously seen items with changed status
- unchanged items that do not need to be re-reported

### 5. Diagnose the changes that matter

For each material change:

- what changed
- strongest plausible driver
- whether it looks temporary, structural, or still unclear
- what happens if no one acts

### 6. Assign actions and escalations

Every material issue should end in one of these states:

- no action needed
- watch next period
- action required, with owner
- escalate now, with exact decision needed

Every material positive signal should also end in an explicit state:

- celebrate only
- reuse in operations or marketing
- monitor for repeatability
- convert into a stored asset, pattern, or playbook

### 7. Save recurring state

If the report is part of a cadence, preserve only what improves the next run:

- last reported values
- prior snapshots for trend comparison
- unresolved risks
- previously declared asks
- IDs or URLs of already-seen mentions so the next report focuses on what is
  new
- recurring vendors, categories, or subscriptions when expense tracking is part
  of the cadence
- current goal balances, contribution pace, and next milestone when tracking
  savings or other progress-to-target work

## Reporting Lanes

Pick the lane that best matches the user's actual question. Mix lanes only when
the audience genuinely needs them together.

### General operating report

Use for weekly, monthly, board, investor, and QBR reporting.

Focus on:

- performance versus plan
- material changes since the last checkpoint
- risks, blockers, asks, and decisions

### Expense reporting lane

Use when the report needs to turn receipts, invoices, or statement notifications
into a month-level spending summary.

Prefer these inputs:

- receipt or invoice emails in the reporting window
- vendor, amount, date, and currency
- category mapping
- prior period total and prior category mix
- known recurring charges or subscriptions
- default weekly categories when the user has no schema yet: groceries, dining
  out, transportation, subscriptions, shopping, entertainment, bills, and other

Interpret them as operating signals:

- total spend versus prior period
- category concentration
- unusual spikes or one-off charges
- new recurring charges worth review
- largest expense and most frequent vendor

Default thresholds:

- category spend materially above prior period without planned reason: inspect
  immediately
- if the user has no budget yet, start with provisional monthly targets such as
  groceries `$400`, dining out `$200`, subscriptions `$100`, and shopping
  `$150`, then replace them with the user's actual numbers once known
- new recurring charge: flag for review
- extraction confidence is low or receipts are incomplete: mark the report as
  partial

When this lane is recurring, remember:

- last report date
- prior total
- vendor/category history
- known subscriptions and newly detected recurring charges

Tone for this lane:

- keep it aware and non-judgmental
- suggest one or two practical corrections when pace is high instead of
  scolding the user

### Savings goals lane

Use when the report is about progress toward a target amount rather than raw
expense history.

Prefer these inputs:

- named goals such as emergency fund, vacation, big purchase, retirement
  contribution, or debt payoff
- target amount per goal
- current saved amount
- contributions detected in the reporting window
- expected pace or target completion date

Interpret them as operating signals:

- percent complete
- pace versus plan
- projected completion date at current pace
- milestone reached: 25%, 50%, 75%, or completed
- goals slipping behind required pace

Default thresholds:

- contribution pace below required pace for 2 periods: suggest a correction
- milestone crossed: call it out explicitly
- missing current balance: ask for the balance instead of inventing it

When this lane is recurring, remember:

- goal names and target amounts
- last known saved amount
- last period contribution
- prior milestone already celebrated

Tone for this lane:

- keep the report encouraging
- celebrate real milestone progress explicitly instead of only highlighting gaps

### Audience growth lane

Use when the report is about follower, subscriber, user, or segment growth
across channels.

Prefer these inputs:

- current audience count by channel
- prior-period count
- absolute and percentage change
- recent history across several periods
- milestone proximity when useful

Interpret them as operating signals:

- strongest-growing channel
- lagging or declining channel
- acceleration versus slowdown
- whether growth is broad-based or concentrated

Default thresholds:

- flat or negative growth for 2 periods: inspect acquisition mix or recent
  campaign change
- one channel materially outperforming peers: double down on what changed there
- growth concentrated in one spike: verify it is durable before forecasting

### Engagement analysis lane

Use when the question is which content types, formats, or platforms are earning
attention.

Prefer these inputs:

- post or asset counts by type
- impressions or reach
- likes, shares, comments, clicks, saves, or equivalent engagement events
- engagement rate by type and by platform
- minimum sample-size or minimum-impression filters
- top-performing and weak-performing items

Interpret them as operating signals:

- what to publish more often next
- what is underperforming enough to pause, rework, or test differently
- whether a format is winning because of the format itself, distribution, or a
  single outlier item

Default thresholds:

- insufficient sample or impressions: do not over-interpret
- engagement rate materially below peer formats: test headline, hook, or format
- top format sustained across periods: increase planned output there

### Product analytics lane

Use when the report is about product health, feature adoption, activation,
retention, or funnel movement rather than marketing content alone.

Start by choosing the reporting frame that fits the question:

- `AARRR` when the report needs funnel visibility across acquisition,
  activation, retention, referral, or revenue
- `North Star` when leadership needs one strategic metric with supporting
  drivers
- `HEART` when the report is about UX quality, user happiness, or task success

Prefer these inputs:

- product stage: pre-PMF, growth, or mature
- KPI hierarchy or dashboard layers: executive, product health, and feature
- cohort anchor event and retained behavior definition
- funnel stages with comparable period windows
- feature adoption by cohort, segment, or plan tier
- release, rollout, or experiment timeline that could explain the movement

Interpret them as operating signals:

- activation and time-to-first-value movement
- retention curve shape, not just a single-point retention number
- funnel drop-offs or conversion acceleration by stage
- whether feature adoption is broad and repeatable or driven by one cohort
- whether a KPI moved because of the product itself, a pricing or channel shift,
  or a temporary release artifact

Stage-appropriate KPI defaults:

- pre-PMF: activation rate, week-1 retention, time-to-first-value, qualitative
  problem-solution-fit signal
- growth: funnel conversion, monthly retained users, feature adoption among new
  cohorts, expansion or upsell proxy metrics
- mature: retention depth, power-user share, churn-risk indicators by segment,
  and reliability or support-deflection metrics

Default thresholds:

- vanity acquisition metrics without activation or retention context: not
  reportable
- single-point retention without cohort comparison: incomplete analysis
- blended averages hiding segment or plan differences: break the metric out by
  cohort, tier, channel, or geography
- KPI without target, threshold, owner, and decision rule: incomplete report
- insufficient sample or exposure for a feature cohort: mark the read as
  directional only

When this lane is recurring, remember:

- prior KPI snapshot and comparable time window
- cohort definitions and retained-behavior definition
- known drop points, thresholds, and already-investigated risks
- release or experiment timeline linked to prior reads

### Social proof and mentions lane

Use when the report is about new external mentions, reputation signals,
testimonial collection, or high-signal community discussion.

Prefer these inputs:

- keywords or entities tracked
- platforms searched
- newly found mentions versus already seen mentions
- author, link, timestamp, and engagement or reach
- mention polarity or severity when available
- quotable text when the mention is strongly positive
- suggested use or placement when the mention can be reused

Interpret them as operating signals:

- what is new
- what is high reach or high urgency
- what needs reply, monitoring, or escalation
- whether the mention pattern suggests a narrative shift, launch reaction, or
  emerging issue
- what praise is strong enough to save as social proof
- where saved proof is best used: homepage, pricing, feature page, comparison,
  or case-study material

Default thresholds:

- new negative mention from a high-reach source: escalate now
- repeated mentions around the same issue across platforms: open a tracked risk
- mentions with no business impact: batch into watch, not escalation
- strongly positive, quotable mention from a credible source: save it
- duplicate or already-saved positive mention: do not re-report unless context
  changed materially

### Engineering delivery lane

Use this lane when the report is about throughput, PR flow, or release health.

Prefer these metrics:

- open PR count
- aging PR count by bucket
- time to first review
- time to approval
- time to merge
- PR size
- review rework loops
- merge-conflict count or rate
- CI failure rate
- merge-blocked count
- hotfix or rollback count when relevant

Interpret them as operating signals:

- likely bottleneck
- threshold breached
- immediate action
- owner or system fix

Default thresholds:

- `time to first review > 24h`: rebalance reviewer routing
- `PR age > 3 business days without clear reason`: escalate or split work
- `PR size > 500 lines changed`: challenge reviewability
- `conflict rate rising for 2+ periods`: inspect ownership hot spots and branch
  hygiene
- `CI failures > 10% on changed code`: stabilize pipeline before optimizing
  throughput

## Standard Output Structure

Unless the user asks for a different artifact, produce:

### 1. Headline summary

- 3-5 bullets only
- biggest improvement
- biggest risk or deterioration
- one explicit decision, ask, or escalation

### 2. KPI and signal table

For each important metric or signal:

- current
- prior or baseline
- delta
- threshold or target
- one-line explanation

### 3. What changed

- launches, wins, losses, incidents, staffing shifts, channel moves, external
  signals, or delivery events that altered the picture

### 4. Diagnosis

- root causes or strongest plausible drivers
- structural versus temporary effects
- what remains uncertain

### 5. Risks and blockers

- severity
- owner if known
- expected impact
- mitigation or next step

### 6. Decisions and asks

- what needs approval, staffing, unblocking, policy change, reply, or leadership
  attention

### 7. Next-period focus

- the few priorities that should shape the next reporting cycle

For audience, engagement, or mentions reports, it is acceptable to compress
sections 2-7 into a shorter artifact as long as the output still shows:

- the comparison point
- the strongest positive signal
- the strongest negative or risky signal
- the action or follow-up required

For expense, savings, or social-proof reports, also preserve the lane-specific
minimums:

- expense report: total, transaction count, category summary, notable spend,
  and prior-period comparison
- savings check-in: goal, saved, target, percent complete, pace, and projected
  completion
- product analytics report: framework or KPI hierarchy used, comparable window,
  cohort or funnel view where relevant, and one clear product action
- social proof: quote, source, link, why it matters, and whether it was saved
  or escalated

## Reporting Rules

- Always define the time window clearly.
- Always identify the audience explicitly or by unmistakable tone.
- Always state which systems were queried for live data.
- Use exact deltas where possible, not vague trend language.
- Separate fact collection from interpretation.
- Call out data quality issues instead of pretending precision.
- Prefer a small number of decision-relevant metrics over a long vanity list.
- If a metric moves materially, explain the likely cause and required response.
- If you include a threshold, include the action attached to it.
- If something needs human judgment, say exactly what judgment is needed.
- If the report tracks novelty, differentiate new items from already seen items.
- If the report tracks trends, compare against saved history instead of a single
  isolated snapshot when possible.
- For product analytics, compare like-for-like windows and show trends or cohort
  curves instead of isolated point estimates.
- For product analytics, pair acquisition metrics with activation and retention
  before drawing conclusions.
- For extraction-heavy reports, separate extracted fields from later inference
  or categorization.
- For recurring personal finance reports, never request credentials or bank
  login details.
- For social proof collection, do not save low-confidence praise as a reusable
  testimonial.

## Failure Modes To Avoid

- report reads like a diary
- no live system access even though fresh data was required
- metrics without a comparison point
- metrics without interpretation
- metrics without action thresholds
- repeated mention dumps with no novelty filter
- expense report with totals but no categories, comparison point, or anomalies
- savings report with progress but no target, pace, or estimated completion
- growth report that says "up" without saying where, by how much, or versus what
- engagement report that mistakes a single outlier post for a durable pattern
- product analytics report that leads with pageviews or signups but omits
  activation, retention, or segment context
- product analytics report that compares one retention number instead of cohort
  curves or comparable windows
- dashboard overload with no KPI hierarchy, owner, or decision rule
- social-proof report that re-saves the same quote every run
- long wins section with hidden risks
- board report that is too tactical
- team report that is too abstract to act on
- delivery report that counts PRs and conflicts without diagnosing the queue
- escalation language that does not state the actual decision needed

## Quality Bar

- The period and audience are obvious.
- The operating question is obvious.
- The external source systems are obvious.
- The report can be skimmed in under two minutes.
- Metrics, drivers, risks, and asks are all present.
- Material issues have owners, thresholds, or escalation calls.
- Product-facing KPI reads have a framework, owner, and decision rule.
- New-versus-known state is clear when novelty matters.
- Positive signals that should be reused are explicitly saved, not just praised.
- A reader can tell what requires attention right now.
- The report helps run the system, not just observe it.
