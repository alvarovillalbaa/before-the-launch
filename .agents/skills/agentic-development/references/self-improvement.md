# Self-Improvement and Pattern Learning

Run this reference when: the session ends and patterns should be consolidated; a skill produced an incorrect outcome and the guidance needs correction; the user asks to "self-improve", "learn from today", or "analyze this session"; or a pattern has recurred 3+ times and deserves promotion into the skill's permanent guidance.

---

## Overview

The self-improvement loop converts concrete session experiences into durable, reusable patterns stored in a multi-memory architecture. It runs alongside the standard development loop — not instead of it.

```
Any skill run or session event
        ↓
Extract Experience → Abstract Pattern → Update Skill Guidance → Consolidate Memory
        ↓                   ↓                   ↓                      ↓
  What happened?    What can be reused?  Which reference?     Track metrics
```

---

## Multi-Memory Architecture

### 1. Semantic Memory — `memory/semantic-patterns.json`

Stores **abstract patterns and rules** reusable across contexts. Each entry follows:

```json
{
  "patterns": {
    "pattern_id": {
      "id": "pat-YYYY-MM-DD-NNN",
      "name": "Human-readable name",
      "source": "user_feedback | implementation_review | retrospective | bug_analysis",
      "confidence": 0.95,
      "applications": 0,
      "created": "YYYY-MM-DD",
      "category": "react_patterns | async_patterns | architecture | debugging | ui_patterns | ...",
      "pattern": "One-line summary",
      "problem": "What problem does this solve?",
      "solution": { },
      "quality_rules": [ ],
      "target_skills": [ ]
    }
  },
  "meta": {
    "version": "1.0.0",
    "last_updated": "YYYY-MM-DD",
    "total_patterns": 0,
    "categories": []
  }
}
```

### 2. Episodic Memory — `memory/episodic/YYYY/YYYY-MM-DD-{skill}.json`

Stores **specific experiences** from individual sessions:

```json
{
  "id": "ep-YYYY-MM-DD-NNN",
  "timestamp": "YYYY-MM-DDTHH:MM:SSZ",
  "skill": "which reference or task type",
  "situation": "What the user was trying to do",
  "root_cause": "Underlying issue identified",
  "solution": "What actually fixed it",
  "lesson": "Reusable takeaway",
  "related_pattern": "pattern_id if abstracted",
  "user_feedback": {
    "rating": 8,
    "comments": "Free text from user"
  }
}
```

### 3. Working Memory — `memory/working/`

Transient files for the active session:

```
memory/working/
├── current_session.json   # Active session data (cleared on start)
├── last_error.json        # Error context captured by post-bash hook
└── session_end.json       # Written by session-end hook
```

---

## Self-Improvement Process

### Phase 1 — Experience Extraction

After any significant task completes, extract:

```yaml
What happened:
  task: {what was being done}
  outcome: success | partial | failure

Key Insights:
  what_went_well: [list]
  what_went_wrong: [list]
  root_cause: {underlying issue if applicable}

User Feedback:
  rating: {1–10 if provided}
  comments: {specific feedback}
```

### Phase 2 — Pattern Abstraction

Convert concrete experiences to reusable patterns using these rules:

```yaml
If experience_repeats 3+ times:
  level: critical
  action: Add to the relevant reference's "Critical Mistakes" or "Avoid" section

If solution_was_effective:
  level: best_practice
  action: Add to the relevant reference's "Best Practices" section

If user_rating >= 7:
  level: strength
  action: Reinforce — add confidence, broaden target references

If user_rating <= 4:
  level: weakness
  action: Decrease confidence; add to "What to Avoid"
```

**Abstraction examples:**

| Concrete Experience | Abstract Pattern | Target Reference |
|--------------------|------------------|-----------------|
| Callback was empty, didn't refresh | Always verify callbacks have implementations | `observability.md` |
| useMemo caused stale IDs at click time | Compute mutable state at action time, not render time | `../frontend/references/frontend-development.md` |
| Spacing component created phantom divider | Audit all spacing values when debugging visual gaps | `../frontend/references/ui-constraints.md` |
| Added duplicate Context polling | Always check for existing providers before new fetching | `../backend/references/backend-development.md` |

### Phase 3 — Skill Updates with Evolution Markers

Add new patterns to reference files with traceability markers:

```markdown
<!-- Evolution: YYYY-MM-DD | source: ep-YYYY-MM-DD-NNN | confidence: 0.90 -->

### Pattern: [Name]

**Problem**: [What problem this solves]

**Solution**: [Guidance]

**Quality rules**:
- [Rule 1]
- [Rule 2]
```

When correcting wrong guidance, use a correction marker:

```markdown
<!-- Correction: YYYY-MM-DD | was: "previous guidance" | reason: caused X -->

### Corrected: [Name]

[New guidance replacing the old]
```

### Phase 4 — Memory Consolidation

1. Update `memory/semantic-patterns.json` — add/update pattern entry, bump `total_patterns` and `last_updated`.
2. Write episodic record to `memory/episodic/YYYY/YYYY-MM-DD-{task}.json`.
3. Adjust `confidence` on existing patterns:
   - `+0.05` per additional confirming application, cap at 1.0
   - `−0.10` per negative feedback (rating ≤ 4), floor at 0.0
4. Prune patterns with `confidence < 0.50` and `applications < 2` — move to an `archived` key rather than deleting.

---

## Self-Correction (on error)

Triggered when a Bash command exits non-zero, tests fail after following guidance, or the user reports a wrong result.

```
1. Detect — capture error context in memory/working/last_error.json
2. Diagnose — was the guidance incorrect, misinterpreted, or incomplete?
3. Correct — update the reference file with a correction marker
4. Validate — rerun or ask user to confirm the corrected guidance
```

---

## Self-Validation

Periodically verify that guidance in reference files is still accurate. Use the template in `templates/validation-template.md`.

Checks:
- [ ] Code examples compile or run against the current repo
- [ ] Checklists match current repo conventions (package versions, file paths)
- [ ] External references are still reachable
- [ ] No duplicated or contradictory guidance across references

### Periodic Consolidation Pass

As rules and skills accumulate, they develop contradictions and redundancies. This is a normal consequence of iterative improvement — not a failure. But unresolved contradictions degrade agent performance in ways that are hard to diagnose: the agent sees two conflicting instructions and either picks one arbitrarily or stalls.

**Trigger conditions:**
- Agent behavior has noticeably degraded without a clear cause
- More than ~5 new rules or skills have been added since the last consolidation
- Validation checks surface the same guidance appearing in two or more files with different wording
- The same rule is found in both a rules file and a skill file (content conflict)

**How to run:**
Ask the agent: "Review all rules and skill files at [path]. Surface every contradiction and every instance where the same guidance appears in multiple places. For each contradiction, ask me for my current preference. For each duplicate, identify the canonical home and propose removing the copy."

After the user resolves each conflict:
1. Update the canonical file with the authoritative version.
2. Replace copies in non-canonical files with pointer sentences ("see X for the authoritative version of this rule").
3. Log each change using the evolution marker format (`<!-- Evolution: YYYY-MM-DD | source: consolidation | reason: removed contradiction between X and Y -->`).

Treat consolidation as routine maintenance — the same discipline as dependency updates. A skill library that never gets consolidated will eventually be slower than one that is kept lean.

---

## Evolution Priority Matrix

| Trigger | Target Reference | Priority |
|---------|-----------------|----------|
| New architecture tradeoff clarified | `architecture-analysis.md` | High |
| Debugging fix discovered | `observability.md` | High |
| React/state pattern confirmed | `../frontend/references/frontend-development.md` | High |
| UI spec ambiguity caused rework | `../frontend/references/ui-constraints.md` | High |
| Review checklist gap found | `reviews-and-comments.md` | High |
| Component boundary error | `../frontend/references/building-components.md` | Medium |
| Test strategy improvement | `specs-plans-tests.md` | Medium |
| Git/branch workflow issue | `collaboration-and-git.md` | Medium |
| Scaffolding convention drift | `code-scaffolding.md` | Medium |
| Performance pattern | `../frontend/references/react-performance-rules.md` | Medium |

---

## Hooks Integration

Three shell hooks provide automatic capture. Wire them in Claude Code settings:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash|Write|Edit",
        "hooks": [{ "type": "command", "command": "bash /path/to/agentic-development/hooks/pre-tool.sh \"$TOOL_NAME\" \"$TOOL_INPUT\"" }]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [{ "type": "command", "command": "bash /path/to/agentic-development/hooks/post-bash.sh \"$TOOL_OUTPUT\" \"$EXIT_CODE\"" }]
      }
    ],
    "Stop": [
      {
        "hooks": [{ "type": "command", "command": "bash /path/to/agentic-development/hooks/session-end.sh" }]
      }
    ]
  }
}
```

Replace `/path/to/agentic-development` with the absolute path to this skill's directory.

> The `Stop` hook for `check-completion.sh` blocks premature completion. The `session-end.sh` hook runs *after* that gate passes to signal that the session truly ended.

---

## Templates

| Template | Purpose |
|----------|---------|
| `templates/pattern-template.md` | Adding new patterns to semantic memory |
| `templates/correction-template.md` | Fixing incorrect guidance |
| `templates/validation-template.md` | Periodic accuracy checks |

---

## Best Practices

**DO**
- Extract patterns at the right abstraction level — not too narrow, not too broad
- Update multiple related references when a pattern is cross-cutting
- Track confidence and application counts honestly
- Ask for user feedback before promoting a pattern to "critical"
- Use evolution/correction markers so changes are traceable

**DON'T**
- Over-generalize from a single experience — wait for 3+ occurrences before "critical"
- Create contradictory patterns across references
- Update guidance without understanding the root cause
- Let `memory/working/` accumulate across sessions — clear it at session start

---

## Escalating to Autonomous Optimization

When the reactive self-improvement loop has seen the same failure pattern 3+ times and reactive patching hasn't fixed it, escalate to **autoimprove** — a fully autonomous batch loop that tests and refines one reference until it converges at 95%+ pass rate.

Read [autoimprove.md](./autoimprove.md) for the full procedure: checklist design, baseline scoring, the change→test→keep/revert loop, and output artifacts.

| Mode | Output | Trigger | Autonomy |
|------|--------|---------|----------|
| Self-improvement (this file) | Updates to existing `references/*.md` | After each session or on error | Low — reactive, one pattern at a time |
| Autoimprove | Optimized reference file copy | "run autoresearch on X" or 3+ recurring failures | High — batch, unattended |
| Skill extraction | New `SKILL.md` files in skill library | "save this as a skill", `/claudeception`, non-obvious debugging | Medium — guided, one skill at a time |
| Continual learning | Plain bullets in `CLAUDE.md` / `AGENTS.md` | Cadence gate: ≥10 turns + ≥120 min + transcript advanced | High — unattended, incremental |
| Repo learning system | `learning/` artifacts → promote into the correct AFS docs (`logs/`, `lessons/`, `items/`, `fixes/`, `audits/`, `plans/`, `specs/`, `knowledge/`, etc.) | "save what we learned", "mine this session", session end | Medium — agent-driven, 4-step loop |

- Read [skill-extraction.md](./skill-extraction.md) when knowledge is novel enough to deserve its own skill file rather than a pattern addition to an existing reference.
- Read [continual-learning.md](./continual-learning.md) when the goal is to keep `CLAUDE.md` / `AGENTS.md` current with durable user preferences and workspace facts mined from transcript history.

---

## Research Basis

- [SimpleMem: Efficient Lifelong Memory for LLM Agents](https://arxiv.org/html/2601.02553v1)
- [A Survey on the Memory Mechanism of Large Language Model Agents](https://dl.acm.org/doi/10.1145/3748302)
- [Lifelong Learning of LLM based Agents](https://arxiv.org/html/2501.07278v1)
- [Evo-Memory: DeepMind's Benchmark](https://shothota.medium.com/evo-memory-deepminds-new-benchmark)
