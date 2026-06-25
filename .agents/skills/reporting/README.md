# Reporting

Turn live operating data into decision-ready reports that answer one question:
what changed, why it matters, and what needs action now.

## Scope

Use this skill for:

- weekly, monthly, board, investor, and QBR reporting
- engineering delivery reporting: PR queue health, conflicts, CI flow, release
  readiness
- product analytics reporting: KPI hierarchy, cohort and retention reads,
  feature adoption, and funnel health
- monthly expense reports from receipts, invoices, or finance notifications
- savings goal check-ins against target amounts and current pace
- audience growth reporting by channel or segment
- engagement analysis by content type, format, or platform
- social mention monitoring with novelty and escalation filtering
- testimonial and social-proof collection with quote extraction and placement
  suggestions

## Reporting Loop

The workflow is now explicitly stateful and source-driven:

1. define the reporting frame and operating question
2. load prior state, thresholds, and already-seen items
3. fetch live data from source systems
4. compare current state against prior state or targets
5. isolate the few deltas that change decisions
6. publish actions, owners, and escalations
7. save only the state needed to make the next run comparative

This rewrite was shaped by automation patterns similar to engagement analysis,
audience growth comparison, expense summarization, savings-goal tracking,
product KPI narration, and social-proof collection. Reports should narrow to
one operational question instead of turning into generic metric dumps.

## New Stateful Patterns

The skill now treats recurring reports as tracked systems instead of one-off
prompts:

- first-run setup captures targets, categories, tracked entities, and thresholds
- recurring runs load prior snapshots before collecting new data
- novelty filters prevent re-reporting already-seen mentions or assets
- lane-specific memory supports prior totals, goal balances, subscriptions, and
  seen URLs

Added reporting lanes:

- expense reporting
- savings goals
- product analytics
- social proof and mentions

## External Access Requirement

Proper reporting requires connecting to source systems:

1. CLI first
2. MCP second
3. direct API only as a fallback

If live data cannot be collected, the report should say so instead of pretending
to be current.

## Install

```bash
npx -y skills add ./business-ops/skills/reporting
mkdir -p ~/.codex/skills
cp -R business-ops/skills/reporting ~/.codex/skills/
```

Codex `$skill-installer` path:

```text
https://github.com/alvarovillalbaa/plugins/tree/main/business-ops/skills/reporting
```

See [`SKILL.md`](./SKILL.md) for the full workflow, reporting rules, output
contract, recurring-state guidance, and lane-specific patterns for expense,
savings, audience, engagement, product analytics, social proof, mentions, and
delivery reporting.
