# Compound Loop

The compound loop is a six-phase workflow where each session explicitly feeds structured learnings back into the knowledge base, making the next session faster. It is the lifecycle that connects brainstorming, planning, execution, and knowledge maintenance into one accelerating system.

Use it for sessions that involve real decision-making, planning, or research. Skip it for simple lookups, minor ingest passes, or single-source absorb tasks.

## The six phases

### 1. Brainstorm

Accept raw input: meeting transcripts, problem statements, notes, or a loose idea.

Before expanding:
- Auto-search the knowledge base for relevant prior context, past decisions, and related concepts.
- Surface any open threads or questions that bear on the current topic.
- Note what the system already knows so the brainstorm builds on it rather than restarting.

Output: a structured list of possibilities, constraints, and key questions — grounded in existing knowledge, not just the current input.

### 2. Plan

Structure the brainstorm into an actionable plan.

Format: Pyramid Principle — conclusion first, then supporting arguments and task breakdown.

Tiers:
- **Quick**: one-sentence recommendation plus the top 3 tasks.
- **Standard**: recommendation, rationale, 5–10 tasks with owners and dependencies, known risks.
- **Deep**: recommendation, full rationale, exhaustive task breakdown, dependency graph, assumptions, validation criteria, and links to relevant knowledge pages.

Before finalizing the plan, launch three parallel research checks:
- **Past-work researcher**: has something similar been attempted before? What happened?
- **Knowledge-base researcher**: which canonical pages are most relevant to this plan?
- **Stale-knowledge checker**: are any pages the plan depends on outdated or contradicted by newer evidence?

Integrate the findings into the plan before proceeding.

### 3. Confidence

Before executing, assess readiness.

Structure the assessment as:

```
Know (high confidence, sourced):
- [fact or pattern with citation]

Assume (plausible, unverified):
- [assumption with basis]

Missing (unknown, consequential):
- [gap] → [specific action to close it]

Overall readiness: high | medium | low
Recommendation: proceed | close gaps first | pause
```

Rules:
- Do not conflate confidence with optimism. List assumptions honestly.
- For each gap, name one specific action — a source, a question, a page to write — that would close it.
- Only proceed to Work if the readiness level is high, or if the user explicitly accepts medium-readiness risk.

### 4. Review

Run two parallel critics before final execution.

#### Strategic alignment reviewer

Evaluate:
- Is the goal clear and testable? Could you tell if you succeeded?
- Are the hypotheses falsifiable? Is the plan set up to be proven wrong?
- Does the plan serve the stated objective, or has it drifted toward easier subproblems?
- Is the scope appropriate — neither too large to finish nor too small to matter?

Report: strategic risks, unclear success criteria, scope mismatches.

#### Data accuracy reviewer

Evaluate:
- Are claims sourced? Are baselines current?
- Are any key numbers, dates, or facts stale, estimated, or from unreliable sources?
- Are there missing comparisons or benchmarks the plan assumes but does not provide?
- Does any assumption depend on data that should be verified before acting?

Report: sourcing gaps, stale data, and specific claims that need verification.

Address critical findings from both reviewers before starting Work.

### 5. Work

Execute the plan.

Default flow:
1. Read the plan file. Confirm the current state of each task (not started / in progress / done / blocked).
2. Execute tasks in dependency order. Run independent tasks in parallel when possible.
3. After each significant task, log a brief progress note back to the plan file.
4. When a task produces a decision, insight, or new fact, route it into the knowledge base immediately — do not defer.
5. When a task is blocked, record the blocker explicitly in the plan file rather than silently skipping.

Rules:
- The plan file is the source of truth for what was done, skipped, and changed.
- If a task reveals that the plan is wrong, update the plan before continuing.
- Do not end Work mode without triggering Compound mode.

### 6. Compound

Extract the durable learnings from the session and save them to the knowledge base.

Default flow:
1. Scan the session for 1–3 things that are true beyond this session — patterns, decisions, or insights that would change how future cycles approach similar problems.
2. For each learning, check whether an existing knowledge page should absorb it.
3. If a match exists: update the compiled-truth section and append a timeline entry.
4. If no match exists: create a new knowledge file with the YAML frontmatter schema below.
5. Check for contradictions: does this learning conflict with anything already in the knowledge base?
   - If yes, surface the contradiction explicitly — update the relevant page's open-threads section or create a conflict note.
   - Do not silently overwrite existing knowledge.
6. Update `LOG.md` and any index files touched.

YAML frontmatter schema for new knowledge files:

```yaml
---
type: insight  # insight | decision | procedure | fact | question
tags: [domain, subtopic]
confidence: high  # high | medium | low
created: YYYY-MM-DD
source: session | ingest | research | meeting | url
---
```

Field meanings:
- `type: insight` — a learned pattern or conclusion that generalizes beyond one event
- `type: decision` — a recorded choice with rationale, context, and trade-offs
- `type: procedure` — a repeatable how-to that should not need to be rediscovered
- `type: fact` — a stable empirical claim with provenance
- `type: question` — an open thread worth tracking until resolved
- `confidence` — `high` (verified), `medium` (partially sourced), `low` (hypothesis or early signal)

Rules:
- Extract learnings, not events. "We chose Postgres" is an event. "Managed databases reduce operational burden enough to justify the cost until you exceed 10TB" is a learning.
- 1–3 per session maximum. Compress ruthlessly. If everything feels important, nothing is.
- Never skip Compound mode after Work mode. Skipping it is the main way compound systems stop compounding.

## Lifecycle summary

```
Brainstorm → surface existing knowledge first
Plan       → conclusion-first structure, parallel research agents
Confidence → know / assume / missing, readiness gate
Review     → strategic alignment + data accuracy, in parallel
Work       → execute in dependency order, log back to plan
Compound   → extract 1-3 learnings, check contradictions, save with frontmatter
```

Each phase's output becomes the input to the next. The Compound output feeds the Brainstorm of future sessions — closing the loop.

## When to use the full loop versus a subset

| Session type | Phases to use |
|---|---|
| New project or plan | All 6 |
| Executing an existing plan | Work + Compound |
| Research deep-dive | Brainstorm + Plan + Confidence + Compound |
| Quick lookup or minor ingest | Skip the loop; use Ingest or Query mode |
| Knowledge base health check | Skip the loop; use Health/Audit mode |
| Idea exploration without execution | Brainstorm + Compound |
