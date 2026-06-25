# Specs, Plans, Tests, and Progress

Do not collapse these ideas into one blob. Each solves a different problem.

## Definitions

- A `spec` defines what must be true when the work is done: user-visible behavior, constraints, acceptance criteria, invariants, and non-goals.
- A `plan` defines how to get there: ordered steps, files likely to change, risks, checkpoints, and verification commands.
- A `progress file` records loop state across iterations: what is done, what failed, and the next highest-priority slice.
- A `test` proves behavior. In TDD, the test fails first, then passes after the minimal fix.
- A `task contract` defines done-ness in operational terms for a single session or iteration: specific tests that must pass, specific behaviors to verify (including screenshots or output traces where relevant), and a stop hook that prevents the session from terminating until every item is satisfied. Contracts differ from specs in that they are per-session execution agreements rather than persistent product definitions. See the Task Contracts section below.

## Structured Spec Shape

The exact template can vary by repo, but a harness-friendly spec should make done-ness and proof explicit. A lightweight frontmatter shape works well:

```yaml
---
title:
scope:
acceptance_criteria:
test_requirements:
constraints:
non_goals:
risks:
---
```

Use the body for behavior details, examples, links, and open decisions.

## When to Use Each

Write or refine a spec when:

- the behavior is unclear
- multiple valid product interpretations exist
- success criteria are missing
- several engineers or agents need a shared contract

Write a plan when:

- the user explicitly asks for a plan
- the repo requires planning before implementation
- the change is large enough that execution order matters
- several agents or sessions must coordinate

Use TDD when:

- fixing a bug with a reproducible symptom
- changing business logic, parsing, data transformation, or policy code
- the repo already has a strong automated test culture
- tests are in scope for the task

Keep a progress file when:

- the work spans multiple sessions or repeated agent iterations
- several slices share one spec but should not share one huge transcript
- a human or reviewer needs to see what remains without rereading chat history

## Default Execution Modes

- Small and clear: implement directly, then verify.
- Fuzzy request: clarify the spec first.
- Explicit planning request: write a plan before code.
- Large multi-step change: define the spec, then write the plan, then execute in checkpoints.
- Bug fix: reproduce, add a failing regression test when tests are in scope, make the minimal fix, then re-run the proof.

## Planning Mode vs Building Mode

Keep planning and building as separate modes when the work is large enough to need iteration.

- Planning mode updates only the spec, plan, or progress artifact.
- Building mode executes one highest-priority task from that artifact, proves it, and writes back the result.

Do not let a single pass half-plan and half-build across a large surface. That is how scope drifts and context bloats.

## Harness-Friendly Task Slices

A good slice fits in one iteration:

- one primary goal
- one clear owner or change surface
- one proof path
- small enough to understand end-to-end without relying on chat memory

If a slice cannot be explained and verified compactly, it is probably too large.

## Do Not Confuse a Plan with a Spec

A list of steps is not a behavior contract. A user story is not an execution recipe. Keep both artifacts distinct so you can tell whether you have a product ambiguity or an implementation ambiguity.

## A Sufficiently Detailed Spec Is Code

A spec that is precise enough to reliably generate a working implementation is, by definition, code — or something so close to code (pseudocode, formal schemas, reference algorithms) that it carries the same cognitive cost.

**Key implications:**

- **Precision cannot be outsourced.** If a spec is vague, a coding agent will fill in the gaps by guessing. The output will be flaky — sometimes correct, sometimes silently wrong. Expanding the spec to fix flakiness only shifts the complexity from the code into the document.
- **"Spec-shaped" is not the same as "well-specified."** A document can look like a spec (sections, bullet points, headings) while still being a grab-bag of loosely related sentences. That kind of document produces incoherent code. Treat superficially formal prose as a warning sign, not a guarantee of quality.
- **Thinly-veiled code in a spec is still code.** Prose field listings, reference algorithm pseudocode, and explicit JSON shapes are implementation details, not specifications. If the "spec" reads like code, the work of writing the code has already been done — just write it in the target language instead.
- **Garbage in, garbage out.** A coding agent is not a mind reader. It cannot supply clarity the spec author never had. The output quality ceiling is set by the input quality — confused inputs produce confused implementations.
- **Generation from spec is inherently flaky.** Even widely-used, carefully-maintained specifications (e.g., YAML) have no fully-conforming implementations. The specification-to-implementation gap is a known and irreducible problem, not a temporary limitation of current models.

**What this means in practice:**

- Before writing a spec, ask: "Is the work I'm doing on this document equivalent to the work I'd do writing the code?" If yes, write the code.
- Use specs for what they are genuinely suited for: capturing *what* must be true (acceptance criteria, invariants, non-goals, constraints), not *how* the system achieves it.
- The interviewer/planner pattern (see [interviewer-pattern.md](./interviewer-pattern.md)) is the correct antidote: surface strategic decisions *before* committing to an approach, not by writing exhaustive pseudocode, but by clarifying intent, constraints, and success criteria.
- When you receive a spec that reads like pseudocode, treat it as a rough implementation draft, not a specification — and validate it against the actual desired behavior before building.

## Test-Driven Development

TDD is the default delivery mode for any behavioral change. Violating the letter of the rules violates the spirit.

### Philosophy

Tests verify behavior through public interfaces, not implementation details. Code can change entirely; tests shouldn't.

**Good tests** are integration-style: they exercise real code paths through public APIs and describe *what* the system does, not *how* it does it. A good test reads like a specification — "user can checkout with valid cart" tells you exactly what capability exists. These tests survive refactors because they don't care about internal structure.

**Bad tests** are coupled to implementation: they mock internal collaborators, test private methods, or verify through external means (e.g. querying a database directly instead of using the application interface). The warning sign: the test breaks when you refactor, but behavior hasn't changed.

Red flags for bad tests:
- Mocking internal collaborators or your own classes/modules
- Asserting on call counts or call order
- Test name describes HOW not WHAT
- Test breaks on rename of internal function with no behavior change
- Verifying through external means instead of the interface

```typescript
// BAD: bypasses interface to verify
test("createUser saves to database", async () => {
  await createUser({ name: "Alice" });
  const row = await db.query("SELECT * FROM users WHERE name = ?", ["Alice"]);
  expect(row).toBeDefined();
});

// GOOD: verifies through interface
test("createUser makes user retrievable", async () => {
  const user = await createUser({ name: "Alice" });
  const retrieved = await getUser(user.id);
  expect(retrieved.name).toBe("Alice");
});
```

### Iron Law

```
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
```

Code written before its test must be deleted and rewritten from tests. No exceptions: do not keep it as reference, do not adapt it while writing tests. Delete means delete.

### When TDD applies

**Always:** new features, bug fixes, refactoring, behavior changes.

**Ask the user:** throwaway prototypes, generated scaffolding, configuration files.

Thinking "skip TDD just this once"? That is rationalization.

### Red-Green-Refactor

**RED — Write one failing test**

Write one minimal test showing what should happen. Clear name, tests real behavior, one thing. Run it and confirm it fails because the feature is missing, not due to a typo.

```bash
npm test path/to/test.test.ts  # confirm fails for expected reason
```

If the test passes immediately, it is testing existing behavior — fix the test.

**GREEN — Write minimal code to pass**

Write the simplest code that makes the test pass. Do not add features, refactor other code, or generalize beyond what the test requires. YAGNI.

Verify: run the test suite and confirm the new test passes and no other tests broke.

**REFACTOR — Clean up under green**

After all tests are green: remove duplication, improve names, extract helpers. Keep tests green. Do not add behavior.

**Repeat** with the next failing test for the next behavior slice.

### Anti-Pattern: Horizontal Slices

**Do NOT write all tests first, then all implementation.** This is "horizontal slicing" — treating RED as "write all tests" and GREEN as "write all code."

Horizontal slicing produces low-quality tests:
- Tests written in bulk test *imagined* behavior, not *actual* behavior
- You end up testing the *shape* of things (data structures, function signatures) rather than user-facing behavior
- Tests become insensitive to real changes — they pass when behavior breaks, fail when behavior is fine
- You outrun your headlights, committing to test structure before understanding the implementation

```
WRONG (horizontal):
  RED:   test1, test2, test3, test4, test5
  GREEN: impl1, impl2, impl3, impl4, impl5

RIGHT (vertical — tracer bullet loop):
  RED→GREEN: test1→impl1
  RED→GREEN: test2→impl2
  RED→GREEN: test3→impl3
  ...
```

**Correct approach:** One test → one implementation → repeat. Each test responds to what you learned from the previous cycle. Because you just wrote the code, you know exactly what behavior matters and how to verify it.

### Bug Fix Pattern

1. Write a failing test that reproduces the bug.
2. Confirm it fails for the right reason.
3. Fix the root cause (not just the symptom).
4. Verify the regression test and full suite pass.

Never fix a bug without a test.

### Pre-Completion Checklist

Before marking work complete:

- [ ] Every new function or method has a test written before the implementation
- [ ] Watched each test fail before implementing
- [ ] Each test failed for the expected reason (feature missing, not a typo)
- [ ] Wrote minimal code to pass each test
- [ ] All tests pass
- [ ] Output is clean (no errors or unexpected warnings)
- [ ] Tests use real code (mocks only where unavoidable)
- [ ] Edge cases and error paths are covered

Cannot check all boxes? TDD was skipped. Start over.

### Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "Too simple to test" | Simple code breaks. Test takes 30 seconds. |
| "I'll write tests after to verify it works" | Tests written after code pass immediately; you never see them catch the bug. |
| "Tests after achieve the same goals" | Tests-after answer "what does this do?" Tests-first answer "what should this do?" |
| "Already manually tested all edge cases" | No record, can't re-run, easy to forget under pressure. |
| "Deleting X hours of work is wasteful" | Sunk cost. Keeping unverified code is technical debt. |
| "Need to explore first" | Fine. Throw away the exploration code, then start with TDD. |
| "TDD will slow me down" | TDD is faster than debugging production failures. |

### Testing Anti-Patterns

When writing mocks or test utilities, read `testing-anti-patterns.md` in the `quality-assurance` skill to avoid: testing mock behavior instead of real behavior, adding test-only methods to production classes, mocking without understanding dependency chains, and incomplete mocks that hide structural assumptions.

### Mocking Discipline

Mock **only at system boundaries**:
- External APIs (payment, email, SMS, etc.)
- Databases (prefer a test DB; mock only when that's not feasible)
- Time and randomness
- File system (when truly necessary)

**Never mock:**
- Your own classes or modules
- Internal collaborators
- Anything you control

Mocking internal collaborators makes tests fragile — they break on refactors that don't change behavior, and they give false confidence by only testing your mocks, not your code.

**Design for mockability at boundaries** — use dependency injection and SDK-style interfaces:

```typescript
// GOOD: dependency injected, independently mockable per endpoint
const api = {
  getUser: (id: string) => fetch(`/users/${id}`),
  createOrder: (data: OrderData) => fetch('/orders', { method: 'POST', body: JSON.stringify(data) }),
};
function processOrder(order: Order, paymentClient: PaymentClient) {
  return paymentClient.charge(order.total);
}

// BAD: creates dependency internally (hard to mock), generic fetcher (mocking requires conditional logic)
function processOrder(order: Order) {
  const client = new StripeClient(process.env.STRIPE_KEY);
  return client.charge(order.total);
}
```

Prefer functions that **accept dependencies** (don't create them) and **return results** (don't produce side effects) — these two interface properties make tests simple and deterministic.

## Test Strategy Notes

- If the repo has a strong test culture, use tests as the main proof.
- If tests are not in scope, say so and use the narrowest non-test proof available.
- For agentic, tool-using, or integration-heavy systems, prefer deterministic stubs, mocks, recordings, or transcript fixtures over relying only on live vendor traffic.

## Test Coverage Audit

When shipping or completing a behavioral change, audit coverage against every codepath introduced — not just what was planned, but what was actually coded.

### How to audit

**1. Trace every codepath changed.** Read each changed file completely (not just the diff hunk). For each entry point, follow data through every branch: where does input come from, what transforms it, where does it go, what can go wrong at each step. Build a mental map of every conditional, error path, and call into other functions.

**2. Map user flows and error states.** Code coverage is not enough — also check:
- Full user journeys touching the changed code
- Interaction edge cases: double-submit, navigate-away mid-operation, stale data, slow network
- Every error state the user can see: can they recover, or are they silently stuck?
- Empty/zero/boundary states: zero results, maximum-length input, single-character input

**3. Output an ASCII coverage diagram.** Include both code paths and user flows:

```
CODE PATH COVERAGE
===========================
[+] src/services/billing.ts
    │
    ├── processPayment()
    │   ├── [★★★ TESTED] Happy path + card declined — billing.test.ts:42
    │   ├── [GAP]         Network timeout — NO TEST
    │   └── [GAP]         Invalid currency — NO TEST
    │
    └── refundPayment()
        └── [★★  TESTED] Full refund — billing.test.ts:89

USER FLOW COVERAGE
===========================
[+] Payment checkout
    ├── [★★★ TESTED] Complete purchase — checkout.e2e.ts:15
    ├── [GAP] [→E2E] Double-click submit — needs E2E
    └── [GAP]         Navigate away during payment — unit test sufficient

─────────────────────────────────
COVERAGE: 3/6 paths tested (50%)
  Code paths: 2/3 (67%)
  User flows: 1/3 (33%)
GAPS: 3 paths need tests (1 needs E2E)
─────────────────────────────────
```

Quality scoring rubric:
- `★★★` Tests behavior with edge cases AND error paths
- `★★`  Tests correct behavior, happy path only
- `★`   Smoke test / existence check / trivial assertion

### E2E Test Decision Matrix

**Recommend E2E** (`[→E2E]` in the diagram):
- User flow spanning 3+ components/services
- Integration point where mocking hides real failures (API → queue → worker → DB)
- Auth, payment, or data-destruction flows

**Recommend eval** (`[→EVAL]` in the diagram):
- Critical LLM call where output quality must be verified
- Changes to prompt templates, system instructions, or tool definitions

**Stick with unit tests:**
- Pure function with clear inputs/outputs
- Internal helper with no side effects
- Edge case of a single function

### Regression Rule — mandatory

When the coverage audit identifies a regression — code that previously worked but the diff broke — write a regression test immediately. No skipping. Regressions are the highest-priority test because they prove something broke.

A regression is: the diff modifies existing behavior, the existing suite does not cover the changed path, and the change introduces a new failure mode for existing callers.

Format the commit as: `test: regression test for {what broke}`

### Coverage gate

Before shipping, apply this gate using the diagram's coverage percentage:

- **≥ target (default 80%):** PASS. Continue.
- **≥ minimum (default 60%), < target:** Offer to generate more tests. Maximum 2 generation passes. If still below target after 2 passes, user can accept the risk explicitly.
- **< minimum (default 60%):** Hard gate — require user override to proceed. Include the override decision in the PR body.

Check `CLAUDE.md` for a `## Test Coverage` section with project-specific `Minimum:` and `Target:` fields before applying defaults.

**Coverage targets by type** (apply when no project-specific override exists):

| Type | Target | Alert Threshold |
|------|--------|-----------------|
| Line | 80%+ | < 80% |
| Branch | 70%+ | < 70% |
| Function | 90%+ | < 90% |
| PR delta | — | < -2% drop per PR |

**Critical paths** (auth, payments, data validation, error handlers): 100% required — not negotiable.

**Advanced techniques:** For property-based testing (Hypothesis, fast-check), mutation testing (Stryker, mutmut, PIT), spec-first acceptance criteria traceability, language-specific test patterns (TypeScript/Jest, Python/Pytest, Go table-driven), and bounded autonomy rules for autonomous test generation, read `tdd-advanced.md`.

---

## Plan Completion Audit

When a plan file was written before implementation, cross-reference its actionable items against the diff before shipping. Do not let plan items slip silently.

### Finding the plan file

1. Check if the current conversation or session references an active plan file path.
2. Search common plan directories: `~/.claude/plans/`, `.gstack/plans/`, `plans/` — find the most recent file mentioning the current branch or repo.
3. Validate: if found via search, read the first 20 lines and confirm it is relevant to this branch.
4. If no plan file found, skip this audit.

### Extracting and classifying items

Extract every actionable item: checkbox items, numbered steps, imperative statements ("Add X to Y", "Create Z service"), file-level specifications, test requirements, and data model changes.

Ignore: context/background sections, questions marked TBD, explicitly deferred items (P2+, "Out of scope", "Future:"), and CEO/design decision records.

For each item, classify against the diff:

- **DONE** — clear evidence in the diff that this item was implemented (cite the specific files)
- **PARTIAL** — some work exists but is incomplete
- **NOT DONE** — no evidence in the diff
- **CHANGED** — implemented via a different approach but same goal achieved

Be conservative with DONE: a file being touched is not enough, the specific functionality must be present. Be generous with CHANGED: if the goal is met by different means, that counts as addressed.

### Output format

```
PLAN COMPLETION AUDIT
═══════════════════════════════
Plan: path/to/plan.md

## Implementation Items
  [DONE]      Create UserService — src/services/user_service.rb (+142 lines)
  [PARTIAL]   Add validation — model validates but missing controller checks
  [NOT DONE]  Add caching layer — no cache-related changes in diff
  [CHANGED]   "Redis queue" → implemented with Sidekiq instead

## Test Items
  [DONE]      Unit tests for UserService — test/services/user_service_test.rb
  [NOT DONE]  E2E test for signup flow

─────────────────────────────────
COMPLETION: 3/5 DONE, 1 PARTIAL, 1 NOT DONE, 1 CHANGED
─────────────────────────────────
```

### Gate logic

- **All DONE or CHANGED:** Pass. Continue.
- **Only PARTIAL (no NOT DONE):** Note in PR body, not blocking.
- **Any NOT DONE:** Stop and ask — implement the missing items, defer with explicit P1 TODOs, or mark as intentionally dropped. Never let NOT DONE items ship silently.

---

## Task Contracts

A task contract makes done-ness unambiguous for a single session or iteration. Write it before starting work; let the stop hook enforce it.

### Contract format

```markdown
# {Feature} Contract

## Must be true before this task is complete

### Tests
- [ ] `<test command>` passes with no failures
- [ ] No tests are skipped or pending

### Behavior
- [ ] <specific observable behavior 1>
- [ ] <specific observable behavior 2>
- [ ] Error case: <expected response to X input>

### Verification
- [ ] Screenshot of <key flow> taken and attached
- [ ] Screenshot shows <expected state>

## Out of scope (do not implement)
- <deferred item 1>
- <deferred item 2>
```

### Why contracts outperform open-ended task descriptions

Agents know how to start a task. They often don't know how to end it — and "done" is not obvious from a feature description. Without a contract, agents may stop after the first passing test, skip error states, or declare completion based on partial delivery.

A contract with a wired stop hook is binding, not advisory. The session cannot terminate until every checkbox is satisfied. This is the same principle as a CI gate — it converts a social expectation into a mechanical guarantee.

### Wiring the stop hook

Add to Claude Code settings (see the Hooks section of the main SKILL.md for the full hook configuration):

```bash
# hooks/check-completion.sh checks the active contract before allowing stop
# Set the CONTRACT_FILE env var to the path of the current contract
```

The `check-completion.sh` hook shipped with this skill already reads completion state; point it at a contract file to get contract-aware gate behavior.

### Contracts vs specs

| | Spec | Task Contract |
|---|---|---|
| Scope | Persistent product definition | Single session/iteration |
| Audience | Team, multiple sessions | This session's agent |
| Done-ness | Behavioral invariants | Mechanical checklist |
| Enforcement | Human review | Stop hook |
| Lifespan | Lives with the codebase | Discarded when fulfilled |

---

## Repo Policy Overrides

Always respect local policy for planning and tests. Some repos want plans only on explicit request. Some repos do not want tests run automatically. In those repos, state what you verified and what you intentionally did not run.
