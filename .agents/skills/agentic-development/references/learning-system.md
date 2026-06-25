# Repo-Local Learning System

Last updated: 2026-04-25

Run this reference when: the user says "save what we learned", "update learning", "extract lessons", "mine this session", "remember this repo pattern", or wants a `learning/` folder that stores engineering knowledge; or when a session ends and the learning loop should be run to consolidate discoveries into durable artifacts.

---

## Working Rules

- Keep `learning/` at the repo root.
- Prefer updating existing artifacts over creating near-duplicates.
- Capture raw signals first; synthesize later.
- Treat `items → episodes → triples → lessons` as the promotion ladder.
- Write to identity files and human docs only when the signal is durable enough to outlive the current task.
- Do not turn trivial work into memory noise.

---

## Operating Loop

### 1. Orient before work

- If `learning/` does not exist, initialize it first (see Commands below).
- Read `learning/README.md`, the most relevant collections, recent lessons, and matching triples before starting.
- Use `scan-learning.py` to avoid rediscovering known patterns.
- Use `references/learning-repo-adaptation.md` to choose or refine collection files for the repo type.

### 2. Capture during work

- Append `items` as soon as you discover a non-obvious observation, failed attempt, fix, decision, warning, or codebase fact.
- Capture facts while they are still precise. Do not wait until the end of the session.
- Prefer short summaries plus enough detail to make the item reusable later.

### 3. Consolidate after work

At session end, process signals in this order:

1. Write or update the session `episode`.
2. Write a `decision-trace` when the session involved trade-offs, uncertainty, bias checks, or follow-up risks.
3. Extract stable `triples`.
4. Promote only verified, reusable, non-trivial outcomes into `lessons`.
5. Update `collections`, `procedures`, and `beliefs` where the knowledge belongs.
6. Refresh `learning/README.md` and `learning/.state/index.json`.

### 4. Promote into source-of-truth docs

After the learning artifacts are written, check whether the knowledge should also change:

- `AGENTS.md` / `CLAUDE.md` for stable operating rules and repo facts.
- `SOUL.md` for persistent collaboration or tone corrections.
- `PRINCIPLES.md` for decision heuristics.
- Service docs such as `README.md`, `ARCHITECTURE.md`, `TESTS.md`, `SETUP.md` when teammates benefit.
- AFS documentation destinations for human-readable discoveries:
  - `lessons/YYYY/YYYY-MM-DD/` — verified insights that should change future behavior
  - `items/YYYY/YYYY-MM-DD/` — stable facts about team/company/project context
  - `fixes/YYYY/YYYY-MM-DD/` — solutions to non-obvious errors
  - `logs/YYYY/YYYY-MM-DD/` — terse historical change notes
  - `audits/`, `plans/`, `specs/`, `references/`, `cookbook/`, `knowledge/`, or `runbooks/` when that is the correct durable destination

**Documentation placement rules** are owned by the `code-documentation` skill. Read `skills/code-documentation/SKILL.md` before writing to AFS docs so the content lands in the right current-vs-historical surface.

Use `references/learning-promotion.md` for the promotion rules.

---

## Memory Model

| Artifact | Use it for | Write rule |
|---|---|---|
| `items/` | Raw observations during work | Append immediately |
| `episodes/` | Session summary and audit trail | Write for every meaningful session |
| `decision-traces/` | Reflection, trade-offs, assumptions, risks | Write when reasoning quality matters |
| `triples/` | Atomic facts for grep-based retrieval | Append stable facts only |
| `lessons/` | Verified outcome knowledge | Require all lesson gates |
| `collections/` | Topic-based repo knowledge | Update in place |
| `procedures/` | Repeatable workflows | Update in place with last-verified date |
| `beliefs/` | Current model of the repo | Regenerate when enough evidence accumulates |

### Items

Use items as the capture buffer. They are fast to append, low-friction, and intentionally unsynthesized.

Good uses: unexpected root causes, failed attempts, fixes, architectural discoveries, warnings worth revisiting later.

### Episodes

Per-session audit trail. Summarize what happened, what changed, what was learned, and what remains open. Write one after every meaningful debugging, implementation, review, or design session.

### Decision traces

Use when the session involved competing options, uncertain evidence, explicit trade-offs, residual risk, or a need to explain why one path won. Especially useful before updating `PRINCIPLES.md`, `SOUL.md`, or architecture docs.

### Triples

Smallest useful facts. Durable, concrete, and grep-friendly. Not summaries, narratives, or opinions. See `references/learning-knowledge-graph.md` for predicate vocabulary.

### Lessons

Highest-bar artifact. Represent things that should change future behavior because the outcome was clear and the insight is reusable. Do not turn every fix into a lesson.

### Collections

Most common long-lived artifact. Topic knowledge that is too broad for a triple and too lightweight for a lesson. Keep them curated — merge duplicates, split oversized files by domain.

### Procedures

Repeatable workflows that a future agent or teammate can follow without rediscovery. Examples: safe migration workflow, release checklist, debug flow for flaky tests.

### Beliefs

Current synthesized state of understanding. Regenerate or edit in place when enough evidence exists. Beliefs are a readable synthesis of episodes, decision traces, and triples — not evidence themselves.

---

## Folder Shape

```text
learning/
├── README.md
├── .state/index.json
├── items/
├── episodes/
├── decision-traces/
├── triples/facts.jsonl
├── lessons/
├── collections/
├── procedures/index.md
└── beliefs/current.md
```

See `references/learning-folder-structure.md` for schemas and naming rules.

---

## Commands

Initialize the system (run once per repo):

```bash
bash skills/agentic-development/scripts/init-learning.sh
```

Capture a signal while working:

```bash
python skills/agentic-development/scripts/capture-item.py \
  --type discovery \
  --summary "CandidateSerializer owns nested score normalization" \
  --file services/candidates/serializers.py \
  --tag serializer \
  --tag scores
```

Search memory before starting related work:

```bash
python skills/agentic-development/scripts/scan-learning.py "serializer normalization"
python skills/agentic-development/scripts/scan-learning.py --type triples "BooleanModel"
python skills/agentic-development/scripts/scan-learning.py --expired   # Show expired triples
```

Refresh the index and README after consolidation:

```bash
python skills/agentic-development/scripts/refresh-learning.py
```

---

## Promotion Bar

Promote only when the knowledge is:

- reusable across future sessions
- specific enough to change behavior
- verified by real work, not theory
- non-sensitive
- not already captured more authoritatively elsewhere

Most sessions should update `episodes/`, `triples/`, or `collections/`. Fewer should produce `lessons/`. Even fewer should change `SOUL.md` or `PRINCIPLES.md`.

---

## Anti-Patterns

- Dumping entire transcripts into `learning/`
- Creating a lesson for every bug fix
- Storing transient branches, commits, or one-off task instructions
- Copying the same fact into items, triples, lessons, AGENTS, and docs without a reason
- Updating identity docs from a single weak signal

---

## Reference Files

- `references/learning-folder-structure.md` — schemas, naming conventions, file templates
- `references/learning-extraction-patterns.md` — what to capture, promotion ladder, lesson and decision-trace gates, collection routing
- `references/learning-promotion.md` — which identity/doc files to update and when
- `references/learning-knowledge-graph.md` — triples schema and predicate vocabulary
- `references/learning-repo-adaptation.md` — collection layouts by repo type (backend, frontend, library, infra, monorepo)
