# Folder Structure

Last updated: 2026-04-25

Canonical file layout and schemas for the repo-local `learning/` system.

## Two-Layer Architecture

The learning system has two complementary layers:

**`learning/`** — agent-internal state (machine-readable, structured JSON/JSONL, operated on by scripts). Lives at the repo root. This is the working memory of the agent.

**AFS documentation output** — human-readable markdown for collaborators. Defined by the `code-documentation` skill and routed into `logs/`, `lessons/`, `items/`, `fixes/`, `audits/`, `plans/`, `specs/`, `references/`, `cookbook/`, `knowledge/`, `runbooks/`, and related AFS surfaces.

The promotion path: `learning/` artifacts → verified → the correct AFS destination for the content type.

See `skills/code-documentation/references/continuous-docs.md` for timestamped and living AFS format rules.

## Layout

```text
learning/
├── README.md
├── .state/
│   └── index.json
├── items/
│   └── YYYY-MM-DD-NNN.jsonl
├── episodes/
│   └── YYYY-MM-DD-NNN.md
├── decision-traces/
│   └── YYYY-MM-DD-NNN.md
├── triples/
│   └── facts.jsonl
├── lessons/
│   └── YYYY-MM-DD-slug.md
├── collections/
│   ├── architecture.md
│   ├── debugging.md
│   ├── patterns.md
│   ├── tools.md
│   ├── testing.md
│   ├── deployment.md
│   └── api.md
├── procedures/
│   └── index.md
└── beliefs/
    └── current.md
```

Core synthesis path:

```text
items -> episodes -> decision-traces -> triples -> lessons
                                                       ↓
                                             AFS human docs
```

Collections, procedures, beliefs, and doc promotion run alongside that path.

## Naming

- Session ids use `YYYY-MM-DD-NNN`.
- `NNN` is a zero-padded per-day sequence.
- A session's `items`, `episode`, and `decision-trace` should share the same session id when they belong together.
- Lesson files use `YYYY-MM-DD-slug.md`.

## `learning/.state/index.json`

Incremental state for re-runs and index generation.

```json
{
  "version": 2,
  "lastRunAt": "2026-03-08T12:00:00Z",
  "summary": {
    "items": 14,
    "episodes": 3,
    "decision_traces": 2,
    "triples": 17,
    "lessons": 2,
    "collections": 7,
    "procedures": 4,
    "beliefs": 1
  },
  "files": {
    "learning/episodes/2026-03-08-001.md": {
      "kind": "episodes",
      "mtimeMs": 1741430400000,
      "size": 1234
    }
  },
  "sessions": {
    "2026-03-08-001": {
      "items": "learning/items/2026-03-08-001.jsonl",
      "episode": "learning/episodes/2026-03-08-001.md",
      "decision_trace": "learning/decision-traces/2026-03-08-001.md"
    }
  }
}
```

## `learning/items/YYYY-MM-DD-NNN.jsonl`

Append-only raw event log for a session.

Each line is JSON:

```json
{
  "version": 1,
  "id": "2026-03-08-001-0001",
  "session": "2026-03-08-001",
  "type": "discovery",
  "summary": "CandidateSerializer owns nested score normalization",
  "detail": "Normalization happens before create/update dispatch, not in the service layer.",
  "tags": ["serializer", "scores"],
  "files": ["services/candidates/serializers.py"],
  "commands": ["rg -n \"score normalization\" services/candidates"],
  "ts": "2026-03-08T12:00:00Z"
}
```

Allowed `type` values:

- `observation`
- `failure`
- `fix`
- `decision`
- `discovery`
- `warning`

Rules:

- Append only.
- Capture non-obvious signals as they happen.
- Keep summaries short and concrete.
- Omit secrets, tokens, credentials, PII, and private URLs.

## `learning/episodes/YYYY-MM-DD-NNN.md`

Human-readable session summary.

```markdown
---
date: 2026-03-08
session: 001
title: Untangle score normalization flow
outcome: success
duration_estimate: medium
---

# Session Summary: Untangle score normalization flow

## What Was Done

- Read serializer and service paths for candidate scoring.
- Traced where normalization actually happens.
- Updated docs and extracted learning artifacts.

## What Was Learned

- Score normalization lives in the serializer boundary.
- The service assumes normalized input.

## Decisions Made

- Keep normalization at the serializer boundary because validation and write-shaping stay coupled.

## Open Questions

- Should score normalization be pushed into a shared helper?

## Promotions

- Collection updated: `learning/collections/architecture.md`
- Triples added: 2
- Lesson created: no
- Identity/docs updated: `AGENTS.md`
```

## `learning/decision-traces/YYYY-MM-DD-NNN.md`

Reflection artifact for reasoning-heavy sessions. Use when the session involved trade-offs, uncertainty, risk, or a difficult diagnosis.

```markdown
---
date: 2026-03-08
session: 001
title: Untangle score normalization flow
confidence: medium
should_create_lesson: false
should_update_beliefs: true
should_update_identity: false
---

# Decision Trace: Untangle score normalization flow

## Task Summary

[Short summary of the problem]

## Key Evidence

- [Observation or command output that mattered]

## Alternatives Considered

- Option A and why it lost
- Option B and why it won

## Assumptions

- [Assumptions that shaped the decision]

## Risks

- [What could still be wrong]

## Follow-ups

- [Next checks or work to do]
```

## `learning/triples/facts.jsonl`

Append-only atomic facts.

```json
{
  "s": "CandidateSerializer",
  "p": "owns",
  "o": "score normalization before service dispatch",
  "date": "2026-03-08",
  "source": "episode/2026-03-08-001",
  "confidence": "high",
  "valid_until": null
}
```

See `learning-knowledge-graph.md` for predicate guidance.

## `learning/lessons/YYYY-MM-DD-slug.md`

High-signal, threshold-gated outcome knowledge.

```markdown
---
date: 2026-03-08
slug: serializer-boundary-normalization
outcome: success
tags: [serializers, validation]
confidence: high
---

# Keep score normalization at the serializer boundary

## Problem

[What problem or ambiguity triggered the work]

## Context / Trigger Conditions

[When this lesson applies]

## Solution / Insight

[What actually worked]

## Why This Was Non-Obvious

[Why it took discovery]

## Verification

[How it was confirmed]

## Related

- Collection: `learning/collections/architecture.md`
- Triple source: `episode/2026-03-08-001`
```

## `learning/collections/*.md`

Topic-based living documents. Update in place.

Suggested initial files:

- `architecture.md`
- `debugging.md`
- `patterns.md`
- `tools.md`
- `testing.md`
- `deployment.md`
- `api.md`

File shape:

```markdown
# Architecture Knowledge

## Score normalization boundary

- Keep normalization in the serializer because validation and shape enforcement happen there.
- The service expects normalized input.

**When this applies**: When tracing candidate score writes or moving validation logic.
**Evidence**: `episode/2026-03-08-001`
```

## `learning/procedures/index.md`

Repeatable workflows.

```markdown
# Procedures

## Add a new serializer-bound normalization rule

**When to use**: When validation and data shaping must stay coupled.
**Last verified**: 2026-03-08

1. Confirm the data enters through a serializer boundary.
2. Normalize before create/update dispatch.
3. Keep the service layer consuming normalized input only.
4. Add or update learning artifacts if the pattern changed.
```

## `learning/beliefs/current.md`

Current synthesized model of the repo. This file is a snapshot and may be overwritten in place.

```markdown
# Current Repo Beliefs

Last updated: 2026-03-08

## Architecture

- Candidate serializers own validation-heavy input shaping.

## Key Modules

- `services/candidates/serializers.py` is the write boundary for score normalization.

## Known Constraints

- Services assume normalized candidate scores.

## Known Gotchas

- Moving normalization into services risks duplicating validation rules.

## Confidence Map

| Area | Confidence | Last Verified |
|---|---|---|
| Candidate scoring | high | 2026-03-08 |
```

## `learning/README.md`

Auto-generated index. Refresh after every consolidation pass.

Suggested sections:

- Summary counts
- Active beliefs
- Recent episodes
- Recent lessons
- Recent decision traces

## Source notation

Use stable source references:

- `episode/YYYY-MM-DD-NNN`
- `lesson/slug`
- `collection/<file>#heading`
- `procedure/<slug>`

Do not use branch names, commit SHAs, or transient shell output as primary sources.
- `confidence` — `high` | `medium` | `low`

**Searching triples** (grep pattern):

```bash
grep '"s": "AuthService"' learning/triples/facts.jsonl
grep '"p": "requires"' learning/triples/facts.jsonl
```

---

## learning/procedures/index.md

Step-by-step workflows extracted from recurring tasks. One section per procedure.

```markdown
# Procedures

## [Procedure Name]

**When to use**: [trigger condition]
**Estimated steps**: N

1. [Step one]
2. [Step two]
3. ...

**Notes**: [caveats, pre-conditions]

---

## [Next Procedure]
...
```

---

## learning/beliefs/current.md

The agent's current model of the codebase. Overwrite-in-place (unlike triples, this is a current snapshot, not history).

```markdown
# Current Codebase Beliefs

Last updated: YYYY-MM-DD

## Architecture

- [One-line belief about overall architecture]
- [e.g., "Services own business logic; views/serializers are thin transport"]

## Key Modules

- `services/ai/` — [what this does]
- `services/memory/` — [what this does]
- ...

## Known Constraints

- [e.g., "All async tasks use Celery; never call async functions from sync Django views directly"]

## Known Gotchas

- [e.g., "BooleanModel flags must be updated atomically — always use select_for_update()"]

## Confidence Map

| Area | Confidence | Last Verified |
|---|---|---|
| Auth flow | high | 2026-03-08 |
| Async tasks | medium | 2026-02-23 |
| Frontend | low | — |
```
