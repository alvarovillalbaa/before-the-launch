# Refactor Planning — Interview and Issue Workflow

Use this workflow when the user wants to plan a refactor, create a refactoring RFC, or break a refactor into safe incremental steps.

Work through the steps below in order. Skip a step only if its outcome is already clearly established from context.

---

## Step 1 — Gather the Problem Description

Ask the user for a **long, detailed description** of the problem they want to solve and any ideas they already have for solutions. Push for specificity:

- What is the current behavior that is problematic?
- What is the desired end state?
- What prompted this refactor now?
- Are there performance, correctness, maintainability, or architectural motivations?

Do not proceed to Step 2 until the problem is concrete enough to explore in code.

---

## Step 2 — Verify Against the Codebase

Explore the repo to validate the user's assertions and understand the current state:

- Locate the code under discussion (files, modules, packages, services).
- Confirm the structural or behavioral issues the user described actually exist.
- Map dependencies: what calls into this code, what does it call out to, what shared types or contracts exist.
- Note: the authoritative source of truth is the codebase itself — do not assume; read implemented code.

Update your understanding of the problem based on what you find. If the codebase contradicts the user's description, surface that now.

---

## Step 3 — Surface Alternatives

Ask whether the user has considered other options, and present 2–3 realistic alternatives:

- What would a minimal change look like vs. the full refactor?
- Is there a configuration, adapter, or incremental extraction path that avoids touching core logic?
- Is the root cause in the code, or in how the code is used?

Present the trade-offs honestly. The goal is not to talk the user out of the refactor — it is to make sure the chosen path is deliberate.

---

## Step 4 — Deep Implementation Interview

Interview the user about the implementation in depth. Be **extremely detailed and thorough**. Cover:

- Which modules, classes, or services will be created, renamed, moved, or deleted?
- What interfaces or contracts will change? What are the new signatures?
- Will there be any shared-state, global-singleton, or dependency-injection changes?
- Are there runtime behaviors that must be preserved exactly (backward compatibility, external API contracts, event shapes)?
- Are there any schema changes — database tables, API request/response shapes, config file formats?
- What is the rollout strategy — big-bang, behind a flag, strangler-fig, parallel run?
- Who else is working in this area? Are there in-flight PRs that would conflict?

Ask follow-up questions until all major implementation decisions are resolved.

---

## Step 5 — Nail Down the Scope

Explicitly agree on what is **in scope** and what is **out of scope** before moving to planning:

- What is the minimum viable refactor? (The smallest change that meaningfully solves the problem.)
- What related improvements are explicitly deferred?
- What neighboring code looks similar but is NOT being touched?

Write out the scope boundary explicitly. Vague scope is the primary cause of refactor scope creep.

---

## Step 6 — Check Test Coverage

Look in the codebase for test coverage of the area being refactored:

- Are there unit tests? Integration tests? E2E tests?
- Do they test external behavior (what the code does) or implementation details (how it does it)?
- What is the coverage density — sparse, moderate, comprehensive?

If coverage is **insufficient**, raise this with the user:

- Will they add tests before refactoring (the safe path)?
- Will they add tests as part of the refactor (acceptable if incremental)?
- Will they defer testing (acceptable only if they explicitly accept the risk)?

A refactor without tests that verify existing behavior is a rewrite that cannot verify correctness. Flag this as a risk if deferred.

---

## Step 7 — Break Into Tiny Commits

Apply Martin Fowler's principle:

> **"Make each refactoring step as small as possible, so that you can always see the program working."**

Break the implementation into a plan of **tiny commits**, where each commit:

1. Leaves the codebase in a **working, deployable state** — tests pass, the app starts, no half-migrated state.
2. Has a single, clear purpose (rename, move, extract, simplify, add test, update caller, remove dead code).
3. Is independently reviewable — a reviewer can understand the commit without reading the others.
4. Does not bundle refactoring with behavior changes. If a behavior change is required to make the refactor safe, that is a separate commit.

**Good commit granularity examples:**
- `refactor: extract PaymentProcessor interface from PaymentService`
- `refactor: move billing logic to BillingService (no behavior change)`
- `test: add regression tests for existing checkout flow before refactor`
- `refactor: replace direct DB calls with repository pattern in OrderService`
- `fix: update all callers of renamed method processOrder → submitOrder`
- `chore: remove legacy adapter now that all callers use new interface`

**Anti-patterns to avoid in commit planning:**
- "Refactor everything in one commit"
- Combining rename + logic change + test update in a single commit
- Moving code before adding tests (unless coverage is already comprehensive)

---

## Step 8 — File the Refactor Plan as a GitHub Issue

Once the plan is agreed, create a GitHub issue using the template below. Use `gh issue create` with the body formatted according to the template.

```bash
gh issue create \
  --title "<short summary of the refactor>" \
  --body "$(cat <<'EOF'
<issue body — see template below>
EOF
)"
```

### Issue Template

```markdown
## Problem Statement

[The problem the developer is facing, described from the developer's perspective. Concrete, specific, no jargon. Include: what breaks, what is hard to change, what technical debt accumulates, or what architectural constraint is violated.]

## Solution

[The chosen solution, from the developer's perspective. What the codebase will look like after this refactor is complete. Include the key structural or behavioral changes at a high level.]

## Commits

[A LONG, detailed implementation plan written in plain English. Break the implementation into the tiniest commits possible. Each commit should leave the codebase in a working state.

Format each commit as:
- `<type>: <description>` — [one sentence explaining what changes and why it is safe]

Group commits into phases if helpful (e.g., Preparation → Core Refactor → Cleanup).]

## Decision Document

[A list of implementation decisions made during the planning interview. Include:

- The modules that will be built, renamed, or deleted
- The interfaces of those modules that will change
- Technical clarifications from the developer
- Architectural decisions and their rationale
- Schema changes (if any)
- API contracts and backward compatibility decisions
- Specific interactions or edge cases that must be preserved

Do NOT include specific file paths or code snippets — they may become outdated quickly. Write decisions at the conceptual level.]

## Testing Decisions

[A list of testing decisions made during planning. Include:

- A description of what makes a good test for this area (test external behavior, not implementation details)
- Which modules will be tested, and at what level (unit / integration / E2E)
- Prior art for the tests: similar test files or patterns already in the codebase to use as a model
- Whether tests will be added before, during, or after the refactor — and the rationale]

## Out of Scope

[A clear description of what this refactor does NOT include. Be explicit — this prevents scope creep during implementation and review.]

## Further Notes (optional)

[Any additional context: links to prior discussions, related issues or PRs, known risks, performance implications, monitoring considerations, or rollout strategy details.]
```

---

## Relationship to Other Workflows

| Workflow | When to use |
|----------|-------------|
| This reference (`refactor-planning.md`) | Planning a refactor — interview, scope, commit plan, GitHub issue |
| `interviewer-pattern.md` | Pre-build spec for any non-trivial artifact (feature, doc, system, API) |
| `prd-to-plan.md` | Breaking a PRD into phased implementation slices (tracer bullets) |
| `specs-plans-tests.md` | TDD discipline, spec/plan/test distinction, coverage gates |
| `architecture-analysis.md` | Impact analysis before a rename, move, extraction, or schema change |
| `collaboration-and-git.md` | Bisectable commit ordering and PR creation intent-first workflow |
