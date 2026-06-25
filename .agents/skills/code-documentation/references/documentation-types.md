# Documentation Types Reference

Last updated: 2026-04-25

Canonical taxonomy for documentation types, where they live, and whether they are historical or living.

## Surfaces

Documentation falls into these surfaces:

1. Inline docs
2. In-folder docs
3. Root instruction docs
4. Timestamped historical AFS docs
5. Living AFS docs

Default rule: choose the narrowest authoritative surface first.

## Inline docs

Use inline docs for public functions, classes, methods, hooks, components, modules, and non-obvious code behavior that should be visible without leaving the editor.

Prefer type annotations over prose when types can carry the meaning cleanly.

## In-folder docs

These explain one directory or subsystem.

### Core

- `README.md`
- `ARCHITECTURE.md`
- `TESTS.md`

### Conditional

- `SETUP.md`
- `RUNBOOK.md`
- `CHANGELOG.md`
- `SECURITY.md`

### Rare

- `OVERVIEW.md`
- `FAQ.md`
- `DECISIONS.md`
- `DEPENDENCIES.md`

### What each one does

- `README.md` — purpose, entry point, usage, links
- `ARCHITECTURE.md` — internals, flows, boundaries, decisions
- `TESTS.md` — how to run tests, patterns, fixtures, expectations
- `SETUP.md` — non-obvious bootstrap or local environment steps
- `RUNBOOK.md` — folder-local operational workflow
- `CHANGELOG.md` — user-facing or package-facing release history
- `SECURITY.md` — security boundaries, secrets, abuse cases, review rules
- `OVERVIEW.md` — concept-first orientation when README would become too dense
- `FAQ.md` — repeated questions and troubleshooting
- `DECISIONS.md` — local decisions that do not justify a separate ADR
- `DEPENDENCIES.md` — dependency map, contracts, upgrade notes

These are living docs. Add `Last updated: YYYY-MM-DD` near the top.

## Root instruction docs

These are first-class documentation:

| File | Purpose |
|---|---|
| `AGENTS.md` | General customization to the user's needs, codebase, and ways of working |
| `PLAN.md` | How planning should be done and how plans should look |
| `SPEC.md` | How specs should be written and how they should be maintained |
| `SOUL.md` | Agent personality and collaboration stance |
| `PRINCIPLES.md` | Constraints, heuristics, and max/min rules |
| `DESIGN.md` | Design-system and frontend interaction guidance |

These are living docs. Add `Last updated: YYYY-MM-DD` near the top.

## Final AFS

### Memory

| Path | Purpose | Default mode |
|---|---|---|
| `logs/` | terse change log for meaningful code or doc changes | timestamped |
| `lessons/` | reusable lessons learned from experience | timestamped |
| `items/` | durable facts about user, company, project, customers, environments | timestamped |
| `fixes/` | reusable debugging solutions and error fixes | timestamped |

### Operational

| Path | Purpose | Default mode |
|---|---|---|
| `audits/` | reports, audits, ADRs, post-mortems, investigations | timestamped |
| `raw/` | raw source material waiting to be ingested | timestamped |
| `plans/` | implementation plans and plan-driven-development artifacts | timestamped |
| `specs/` | living desired-state behavior contracts | living |
| `sources/` | monitored URL/source registries | living |
| `lib/` | generated drafts, registries, support artifacts | living |
| `<domain>/<folder>/` | domain-specific surfaces only when truly needed | repo-defined |

### Source of truth

| Path | Purpose | Default mode |
|---|---|---|
| `references/` | factual code, API, schema, or URL references | living |
| `cookbook/` | "how we actually do this here" recipes | living |
| `knowledge/` | timeless maintained knowledge | living |
| `runbooks/` | operational procedures | living |
| `research/` | ongoing research work | living |
| `official-documentation/` | copied external official docs | living, but not iterated heavily |
| `context/` | contextual docs such as values, goals, roadmap, budget, preferences | living |

## Timestamp rule

Timestamped doc families use one layout only:

```text
*/YYYY/YYYY-MM-DD/*.md
```

Default timestamped families:

- `logs/`
- `lessons/`
- `items/`
- `fixes/`
- `audits/`
- `raw/`
- `plans/`

Examples:

```text
logs/2026/2026-04-25/dev.md
lessons/2026/2026-04-25/retry-budget.md
items/2026/2026-04-25/acme-contracting-rules.md
fixes/2026/2026-04-25/postgres-socket-timeout.md
audits/2026/2026-04-25/release-audit.md
plans/2026/2026-04-25/queue-backpressure.md
raw/2026/2026-04-25/vendor-export.md
```

## Living-doc rule

Living docs do not use timestamped folders as their primary organization.

Every living doc should include:

```markdown
Last updated: YYYY-MM-DD
```

Put it directly under the H1 or immediately after frontmatter.

Applies to:

- root instruction docs
- in-folder docs
- `specs/`
- `sources/`
- `lib/`
- `references/`
- `cookbook/`
- `knowledge/`
- `runbooks/`
- `research/`
- `official-documentation/`
- `context/`

## Time-based vs live conflicts

Use this rule whenever docs overlap:

- timestamped docs own history
- living docs own the current rule

Good split:

- `plans/2026/2026-04-25/payment-retry.md` explains one implementation effort
- `PLAN.md` explains the lasting repo-wide planning standard

Bad split:

- current operational instructions duplicated in both `audits/...` and `runbooks/...`
- current repo rules duplicated in both `lessons/...` and `AGENTS.md`

When conflicts exist:

1. Move the durable rule into the right living doc.
2. Keep the timestamped doc only as evidence or archive.
3. Delete redundant drift when it adds no value.

## Decision guide

Use this routing sequence:

1. If the reader needs the answer inside code, use inline docs.
2. If the doc explains one folder, use in-folder docs.
3. If the doc changes how the repo is operated, use a root instruction doc.
4. If the artifact is historical, investigative, or event-like, use a timestamped AFS path.
5. If the artifact is the current durable truth, use a living AFS path.

## Common placements

| Scenario | Destination |
|---|---|
| Daily change note | `logs/YYYY/YYYY-MM-DD/*.md` |
| Durable lesson from repeated debugging | `lessons/YYYY/YYYY-MM-DD/*.md` |
| Fact about user/company/project | `items/YYYY/YYYY-MM-DD/*.md` |
| Non-obvious recurring fix | `fixes/YYYY/YYYY-MM-DD/*.md` |
| Release audit or architecture report | `audits/YYYY/YYYY-MM-DD/` |
| New feature implementation plan | `plans/YYYY/YYYY-MM-DD/` |
| Repo-wide behavior contract | `specs/` |
| Stable API mapping | `references/` |
| Repo-specific technical recipe | `cookbook/` |
| Timeless engineering knowledge | `knowledge/` |
| Exact operational workflow | `runbooks/` |
| Context such as roadmap, budget, goals, preferences | `context/` |
