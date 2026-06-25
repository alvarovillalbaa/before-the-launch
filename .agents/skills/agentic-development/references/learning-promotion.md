# Identity And Documentation Promotion

Last updated: 2026-04-25

Use learning artifacts to improve the right source of truth. Do not promote everything everywhere.

## Promotion order

Promote in this order:

1. `learning/` artifacts
2. Root instruction docs: `AGENTS.md`, `PLAN.md`, `SPEC.md`, `SOUL.md`, `PRINCIPLES.md`, `DESIGN.md`
3. Human-facing markdown docs that should persist for collaborators

If the knowledge is useful only as session memory, stop at `learning/`.

## File roles

| File | What belongs there | Update bar |
|---|---|---|
| `AGENTS.md` | Stable operating rules, repo facts, and general customization to the user's/codebase's ways of working | Repeated or explicitly stated, actionable, durable |
| `PLAN.md` | Repo-wide planning protocol and how plans should look | Durable planning guidance, not one feature's transient plan |
| `SPEC.md` | Repo-wide spec protocol and what specs must contain | Durable spec-writing rules, not one feature's transient content |
| `SOUL.md` | Persistent style, tone, or collaboration stance | Rare, identity-level signal |
| `PRINCIPLES.md` | Decision heuristics, constraints, and trade-off rules | Rare, heuristic clearly needed |
| `DESIGN.md` | Design-system and frontend interaction rules | Durable design language or interface-system guidance |
| `README.md` | Human-facing overview or usage facts | When a teammate would need it |
| `ARCHITECTURE.md` | Structural decisions, ownership, boundaries | When architecture changed or was clarified |
| `TESTS.md` / `TESTING.md` | Durable test workflows and pitfalls | When test strategy or gotchas changed |
| `SETUP.md` | Environment, setup, bootstrap behavior | When operational steps changed |
| `logs/` | Development log entries | After any meaningful code or doc change |
| `lessons/` | Verified reusable insights | When a discovery should change future behavior |
| `items/` | Stable project/team/user/company facts | When teammates would make wrong assumptions without it |
| `fixes/` | Error solutions | After solving a non-obvious or recurring problem |
| `audits/` | Reports, ADRs, post-mortems, analytical audits | When the artifact is historical and investigative |
| `plans/` | Historical implementation plans | When the artifact explains how one change should be executed |
| `specs/` | Living desired-state behavior contracts | When the rule should remain current, not historical |
| `sources/` | Monitored URL/source registries | When source monitoring itself is durable knowledge |
| `lib/` | Generated drafts or support artifacts | When a reusable generated artifact should persist |
| `references/` | Stable lookup/reference material | When teammates need a factual reference surface |
| `cookbook/` | Repo-specific technical guidance | When a pattern needs broader documentation in this codebase |
| `knowledge/` | Timeless maintained knowledge | When the content should compound and stay canonical |
| `runbooks/` | Exact operational workflows | When the content is a repeatable procedure |
| `research/` | Ongoing engineering research | When the work is exploratory but still source-of-truth |
| `official-documentation/` | Copied external official docs | When the repo keeps vendor/source docs locally |
| `context/` | Goals, roadmap, budget, preferences, values, other contextual docs | When the repo needs current shared context |

## `AGENTS.md`

Update only when the signal is:

- stable across future sessions
- actionable enough to change agent behavior
- repeated at least twice, or explicitly stated as a durable rule
- not already covered by a more authoritative instruction

Maintain or add these sections when needed:

```markdown
## Learned Preferences

- ...

## Learned Codebase Facts

- ...
```

Do not store:

- secrets
- one-off task requests
- temporary branch or PR context
- contradictory bullets without resolving them

## `SOUL.md`

Update only for persistent tension in how the agent collaborates.

Examples:

- The user repeatedly corrects the agent to be more direct.
- The agent consistently over-explains and the correction is enduring.
- The team prefers a sharper review posture across sessions.

Do not change `SOUL.md` for a single hurried session.

## `PRINCIPLES.md`

Update when a missing or broken heuristic caused avoidable time loss or poor decisions.

Examples:

- A sync versus async choice keeps being re-litigated with the same answer.
- A migration safety heuristic proved necessary and repeatable.

Write concise heuristics that help future decision making.

## `PLAN.md` / `SPEC.md` / `DESIGN.md`

Update these when the learning changes the repo-wide documentation contract:

- `PLAN.md` — how planning should be done and how plans should be shaped
- `SPEC.md` — how specs should be written and what they must define
- `DESIGN.md` — the design system and frontend interaction language for the repo

Do not use these files for one feature's local content when a timestamped doc in `plans/YYYY/YYYY-MM-DD/` or a living contract in `specs/` is the narrower source of truth.

## Other markdown docs

Promote there when the knowledge is for humans first, not just agents.

### Promote to `README.md` when

- the change affects how to use, run, or understand the repo
- a teammate would miss an important entry point without it

### Promote to `ARCHITECTURE.md` when

- module ownership changed
- a boundary or rationale was clarified
- a design constraint must remain visible

### Promote to `TESTS.md` or `TESTING.md` when

- a recurring test pattern or fixture rule emerged
- a known false assumption in tests was corrected

### Promote to `SETUP.md` when

- install, bootstrap, credentials flow, or local runtime setup changed

### Promote to AFS docs when

Use the `code-documentation` contract and choose the narrowest correct destination:

- `logs/` for terse historical change notes
- `lessons/` for verified reusable insights
- `items/` for durable facts about user/company/project context
- `fixes/` for reusable debugging resolutions
- `audits/` for reports, ADRs, post-mortems, and analytical history
- `plans/` for historical implementation plans
- `specs/` for living desired-state contracts
- `references/` for factual lookup docs
- `cookbook/` for repo-specific technical recipes
- `knowledge/` for timeless maintained knowledge
- `runbooks/` for exact repeatable procedures
- `research/`, `official-documentation/`, `sources/`, `context/`, or `lib/` when those surfaces are the right current home

All timestamped AFS paths follow `*/YYYY/YYYY-MM-DD/*.md`. All living docs should carry `Last updated: YYYY-MM-DD`.

## Conflict handling

If new knowledge conflicts with existing docs:

1. Check whether the old doc is stale.
2. If stale, update in place.
3. If the signal is still uncertain, keep it in `learning/` and record the open question in the episode or decision trace.
4. Do not publish contradictory guidance into `AGENTS.md`, `README.md`, or `ARCHITECTURE.md`.

## Promotion hygiene

- Update the smallest authoritative file that should own the knowledge.
- Prefer refining an existing section instead of appending another near-duplicate section.
- Mention source artifacts in the edit when useful, but do not clutter user-facing docs with internal bookkeeping.
