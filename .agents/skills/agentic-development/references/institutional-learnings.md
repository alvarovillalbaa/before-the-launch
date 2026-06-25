# Institutional Learnings

Use this reference when: capturing a solved problem while the context is fresh; searching for prior learnings before starting work in a documented area; or auditing whether a finding belongs in `docs/solutions/` vs. `docs/lessons/` vs. `AGENTS.md`.

## Why Structured Learnings Compound

The first time a problem is solved takes research. Document it with structured frontmatter and the next occurrence takes minutes. Knowledge compounds — but only if the documentation is discoverable by a grep-first search without reading file bodies.

## Directory Layout

```
docs/
  solutions/          ← structured per-solution files with YAML frontmatter
    workflow/         ← process improvements, developer-experience insights
    skill-design/     ← skill and agent design patterns
    architecture-patterns/   ← structural decisions
    design-patterns/         ← reusable non-architectural approaches
    tooling-decisions/       ← language, library, or tool choices with rationale
    conventions/             ← team-agreed ways of doing something
    runtime-errors/          ← diagnosed and fixed defects
    performance-issues/      ← performance bugs
    integration-issues/      ← cross-platform or cross-service bugs
    [other categories discovered at runtime]
  lessons/            ← prose notes, less structured; use when speed matters
  research/           ← subsystem investigations (YYYY-MM-DD-topic.md)
  runbooks/           ← common diagnostic paths for recurring operations
```

Probe `docs/solutions/` subdirectories dynamically at invocation time — do not assume a fixed list. The categories above are common; a repo may add or omit any.

## Frontmatter Schema

Every file in `docs/solutions/` starts with YAML frontmatter. This is what makes grep-first search possible.

```yaml
---
title: Short human-readable title
module: which-subsystem-or-skill   # narrowest applicable module or domain
problem_type: architecture_pattern  # see enum below
component: optional-technical-area  # e.g. middleware, migrations, auth
tags: [searchable, keyword, list]
severity: high                      # critical | high | medium | low
# Bug-track only (omit for knowledge-track):
symptoms: observable behavior that triggered investigation
root_cause: underlying cause
---
```

### `problem_type` Enum

**Knowledge-track:**
- `architecture_pattern` — structural decisions about agents, skills, pipelines, or system boundaries
- `design_pattern` — reusable non-architectural approaches (interaction patterns, prompt shapes)
- `tooling_decision` — language, library, or tool choices with durable rationale
- `convention` — team-agreed ways of doing something
- `workflow_issue` — process improvements, developer-experience insights
- `developer_experience` — local dev, tooling ergonomics
- `documentation_gap` — missing docs that caused friction
- `best_practice` — fallback when no other type fits

**Bug-track:**
- `runtime_error`, `performance_issue`, `database_issue`, `security_issue`
- `build_error`, `test_failure`, `ui_bug`, `integration_issue`, `logic_error`

## Capturing a New Learning (`/compound` or equivalent)

When to capture: immediately after solving a non-obvious problem, before the context is lost. A fix that took more than 15 minutes or required research is a candidate.

What to write:

1. **Frontmatter** — fill all required fields. The `title`, `module`, `tags`, and `problem_type` fields are what grep-first search uses; be specific.
2. **Problem framing** — what was broken, observed, or decided?
3. **Investigation** (bug-track) — what was tried? What failed? What was the causal chain?
4. **Solution / pattern** — what was done? Why does it work?
5. **Prevention / application notes** — how to avoid re-discovering this? When does this pattern apply?
6. **Code examples** (optional) — illustrative snippets, not full implementations.

Classify the `problem_type` by **what was learned**, not by the diff shape. A change that adds code to fix broken behavior is `runtime_error`, not `architecture_pattern`. A convention documented to survive turnover is `convention`, even if the PR was just one line.

## Searching Before Starting Work

Before implementing a feature, making an architectural decision, or starting work in a documented area, search `docs/solutions/` for applicable prior learnings.

### Grep-First Strategy

**Step 1 — extract keywords**: from the work context, pull module names, technical terms, concept names, and decision terms.

**Step 2 — probe discovered subdirectories**: use glob to find which subdirectories actually exist in `docs/solutions/`.

**Step 3 — content-search pre-filter** (run in parallel, case-insensitive, return filenames only):
```bash
grep -rli "pattern" docs/solutions/
# or with ripgrep:
rg -li "keyword1|keyword2" docs/solutions/
```

Search frontmatter fields specifically for higher precision:
```bash
rg -li "tags:.*(subagent|parallelism)" docs/solutions/
rg -li "module:.*auth" docs/solutions/
rg -li "problem_type:.*(architecture_pattern|design_pattern)" docs/solutions/
```

**Step 4 — read frontmatter only** of matched candidates (first ~30 lines per file). Assess relevance before reading the full document.

**Step 5 — full read** only of strongly or moderately relevant files.

### Relevance Scoring

**Strong** (prioritize): `module` or domain matches, `tags` contain keywords, `title` contains keywords, `symptoms` describe similar behavior.

**Moderate** (include): `problem_type` is relevant, `root_cause` suggests an applicable pattern.

**Weak** (skip): no overlapping tags, unrelated `problem_type`, different domain.

### Staleness Check

A learning that names a specific function, file, or flag is a claim about what existed when the learning was written. Before recommending it: verify the named file still exists and the described behavior is current. When surfacing older learnings, caveat them and let the implementer judge.

## Discoverability Check

When filing a new learning, scan for overlapping content:
```bash
rg -li "$(echo 'keyword1 keyword2' | tr ' ' '|')" docs/solutions/
```

If a closely related file exists, either update it or explicitly note the relationship in the new file. Duplicate learnings dilute search precision.

## Integration with Agents

The `learnings-researcher` agent (see `references/agents/learnings-researcher.md`) implements the full grep-first search pipeline above and returns distilled, actionable summaries. Invoke it:

- Before `/ce-plan` or equivalent planning — to surface prior decisions
- Before implementing in a documented area — to avoid re-discovering known pitfalls
- Before a major architectural decision — to check for existing rationale
