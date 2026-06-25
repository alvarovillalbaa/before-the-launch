# One-Off Documentation Reference

Last updated: 2026-04-25

One-off docs capture a specific decision, investigation, or event. Their value is historical context, not live policy ownership.

## Technical reports

### When to write

Use a report for:

- architecture audits
- performance investigations
- security reviews
- dependency evaluations
- provider comparisons
- post-refactor analysis

### Location

```text
audits/YYYY/YYYY-MM-DD/report-name.md
```

### Quality bar

- lead with the summary
- support every finding with evidence
- make recommendations actionable
- link to code and artifacts rather than dumping unnecessary copies

## ADRs

### When to write

Write an ADR when:

- the decision is expensive to reverse
- the decision contradicts a common default
- a future engineer would question the choice without context
- the trade-offs are not obvious from code alone

### Locations

Choose the repo's existing convention:

- inline in a local `ARCHITECTURE.md` when the decision is local
- `audits/YYYY/YYYY-MM-DD/adr-[slug].md` when the decision is cross-cutting or report-like

If the lasting rule becomes operational, also promote it into the relevant living doc.

## Post-mortems

### When to write

Use for:

- production incidents with user impact
- data loss or corruption events
- security incidents
- major deploy failures
- major performance degradation

### Location

```text
audits/YYYY/YYYY-MM-DD/post-mortem-[incident].md
```

Post-mortems are historical and blameless. If they surface a durable workflow or rule, update `runbooks/`, `knowledge/`, `PRINCIPLES.md`, or other living docs too.

## Plans vs specs

- implementation plans belong in `plans/YYYY/YYYY-MM-DD/`
- durable desired-state behavior belongs in `specs/`

Do not use `specs/` as a graveyard of historical plan snapshots. Do not use `plans/` as the only home for a still-current behavior contract.
