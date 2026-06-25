# PRD to Implementation Plan (Tracer Bullets)

Break a PRD into a phased implementation plan using vertical slices — tracer bullets that cut through every integration layer end-to-end. Output is a Markdown file in `./plans/`.

## Process

### 1. Confirm the PRD is in context

The PRD should already be in the conversation. If it is not, ask the user to paste it or point to the file.

### 2. Explore the codebase

If the codebase has not already been explored, do so now to understand the current architecture, existing patterns, and integration layers.

### 3. Identify durable architectural decisions

Before slicing, identify high-level decisions that are unlikely to change throughout implementation:

- Route structures / URL patterns
- Database schema shape
- Key data models
- Authentication / authorization approach
- Third-party service boundaries

These go in the plan header so every phase can reference them.

### 4. Draft vertical slices

Break the PRD into **tracer bullet** phases. Each phase is a thin vertical slice that cuts through ALL integration layers end-to-end — not a horizontal slice of one layer.

<vertical-slice-rules>
- Each slice delivers a narrow but COMPLETE path through every layer (schema, API, UI, tests)
- A completed slice is demoable or verifiable on its own
- Prefer many thin slices over few thick ones
- Do NOT include specific file names, function names, or implementation details that are likely to change as later phases are built
- DO include durable decisions: route paths, schema shapes, data model names
</vertical-slice-rules>

### 5. Quiz the user

Present the proposed breakdown as a numbered list. For each phase show:

- **Title**: short descriptive name
- **User stories covered**: which user stories from the PRD this addresses

Ask the user:

- Does the granularity feel right? (too coarse / too fine)
- Should any phases be merged or split further?

Iterate until the user approves the breakdown.

### 6. Write the plan file

Create `./plans/` if it does not exist. Write the plan as a Markdown file named after the feature (e.g. `./plans/user-onboarding.md`). Use the template below.

## Plan Template

```markdown
# Plan: <Feature Name>

> **For agentic workers:** To implement this plan, use the `subagents-and-parallelism` reference for task dispatch. Steps use checkbox (`- [ ]`) syntax for tracking. Execute all tasks without pausing for mid-plan check-ins — stop only on `BLOCKED` or genuine ambiguity.

> Source PRD: <brief identifier or link>

## Architectural decisions

Durable decisions that apply across all phases:

- **Routes**: ...
- **Schema**: ...
- **Key models**: ...
- (add/remove sections as appropriate)

---

## Phase 1: <Title>

**User stories**: <list from PRD>

### What to build

A concise description of this vertical slice. Describe the end-to-end behavior, not layer-by-layer implementation.

### Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

---

## Phase 2: <Title>

**User stories**: <list from PRD>

### What to build

...

### Acceptance criteria

- [ ] ...

<!-- Repeat for each phase -->
```

## Vertical Slice vs Horizontal Slice

| Approach | What gets built per phase | Risk |
|----------|--------------------------|------|
| **Horizontal** (avoid) | One full layer (e.g. all DB migrations, then all APIs, then all UI) | Long before anything is demoable; integration bugs surface late |
| **Vertical / tracer bullet** (preferred) | One narrow end-to-end path through every layer | Early validation, demoable sooner, integration bugs surface early |

A completed vertical slice answers: "Can a user do X?" — not "Is layer Y done?"

## Implementation Task Granularity

When a phase is handed to a subagent or executed inline, the tasks inside it must meet these standards. Vague tasks cause subagent drift and untestable increments.

**Per-task requirements:**
- **Scope**: 2–5 minutes of focused work. If a task would take longer, split it.
- **File paths**: name every file to create or modify — no "add a file for this" vagueness.
- **Code**: include the complete code block or diff. No `TBD`, `TODO`, `implement error handling`, or `similar to the above` placeholders. If you don't know the exact code yet, do not write the task yet.
- **Verification**: one concrete command (e.g. `npm test -- --testPathPattern=auth`) or manual step that proves this task is done.
- **TDD order**: if the phase uses TDD, the failing test must be its own task before the implementation task.

**Forbidden patterns:**
- "Implement the user service" (too broad, no file, no code)
- "Add error handling" (what errors? where? what behavior?)
- "Similar to the above" (copy the code, don't reference it)
- Bundling 3 separate logical changes into one task

A well-formed task is dispatching instructions, not a writing prompt. A subagent should be able to execute it without reading back the plan header.

## Integration with other references

- Use alongside [specs-plans-tests.md](./specs-plans-tests.md) for spec shape, TDD gates, and progress-file conventions once implementation begins.
- Use alongside [interviewer-pattern.md](./interviewer-pattern.md) to fill spec gaps before committing to the plan.
- After the plan is approved, use [subagents-and-parallelism.md](./subagents-and-parallelism.md) to dispatch phases as parallel or sequential workstreams.
