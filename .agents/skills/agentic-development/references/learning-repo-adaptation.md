# Repo Adaptation Guide

Adapt the `learning/` system to the repo instead of forcing every repo into the same buckets.

## Default approach

Start with these collections unless the repo already suggests a better split:

- `architecture.md`
- `debugging.md`
- `patterns.md`
- `tools.md`
- `testing.md`
- `deployment.md`
- `api.md`

Then add or remove collection files based on the repo shape.

## Repo shapes

### Backend or service repo

Prioritize:

- `architecture.md`
- `debugging.md`
- `api.md`
- `testing.md`
- `deployment.md`

Likely promotion targets:

- root `AGENTS.md`
- service `README.md`
- `ARCHITECTURE.md`
- `TESTS.md`
- `cookbook/`

### Frontend repo

Prioritize:

- `patterns.md`
- `debugging.md`
- `tools.md`
- `testing.md`
- `api.md`

Often add:

- `../frontend/references/design-system.md`
- `state-management.md`
- `performance.md`

Likely promotion targets:

- component or app `README.md`
- `ARCHITECTURE.md`
- `TESTS.md`
- design or frontend docs

### Library or SDK

Prioritize:

- `api.md`
- `patterns.md`
- `testing.md`
- `tools.md`

Often add:

- `compatibility.md`
- `versioning.md`
- `migration.md`

Likely promotion targets:

- package `README.md`
- migration guides
- changelog notes

### Infrastructure or platform repo

Prioritize:

- `deployment.md`
- `debugging.md`
- `architecture.md`
- `tools.md`

Often add:

- `runbooks.md`
- `incident-response.md`
- `observability.md`

Likely promotion targets:

- runbooks
- setup docs
- operational playbooks

### Monorepo

Keep shared facts in shared collections, but prefer domain-specific files once a topic becomes large:

- `frontend-patterns.md`
- `backend-architecture.md`
- `infra-runbooks.md`
- `shared-tooling.md`

Do not let one `patterns.md` turn into an unsearchable dump.

## Collection sizing rules

- If a collection crosses roughly 200 lines and already contains 3 or more distinct topics, split it.
- If a collection is mostly one subsystem, rename it around that subsystem.
- If a fact matters only to one service, store it in a service-scoped doc instead of a generic collection.

## Promotion targets

Use this rule of thumb after consolidation:

- Agent behavior change: `AGENTS.md`, `SOUL.md`, `PRINCIPLES.md`
- Human-facing repo knowledge: `README.md`, `ARCHITECTURE.md`, `TESTS.md`, `SETUP.md`
- Historical session knowledge: `learning/episodes/`, `learning/decision-traces/`
- Stable atomic facts: `learning/triples/facts.jsonl`

## Avoid

- Keeping repo-specific domains trapped in generic collection files forever
- Promoting every collection entry into permanent docs
- Treating `learning/` as a substitute for real documentation
