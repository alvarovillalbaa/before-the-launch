# Code Review Reference

## Review Workflow

### Step 1 — Determine review target

- **Remote PR**: user provides a PR number or URL (e.g. "review PR #123") → target that remote PR.
- **Local changes**: no PR mentioned, or user says "review my changes" → target staged and unstaged working tree state.

### Step 2 — Preparation

#### Remote PR
1. Checkout the PR:
   ```bash
   gh pr checkout <PR_NUMBER>
   ```
2. Run the project's standard verification suite:
   ```bash
   npm run preflight
   ```
3. Read the PR description and existing comments to understand the goal and prior discussion.

#### Local changes
1. Identify what changed:
   ```bash
   git status
   git diff            # working tree
   git diff --staged   # staged only
   ```
2. For substantial changes, offer to run `npm run preflight` before starting the review.

### Step 3 — In-depth analysis

Evaluate code changes across these pillars:

- **Correctness** — does the code achieve its stated purpose without bugs or logical errors?
- **Maintainability** — clean structure, modularity, adherence to established design patterns?
- **Readability** — well-commented where necessary, consistently formatted per project style?
- **Efficiency** — obvious performance bottlenecks or resource inefficiencies?
- **Security** — potential vulnerabilities or insecure coding practices?
- **Edge cases and error handling** — appropriate handling of edge cases and failures?
- **Testability** — adequate test coverage? Suggest missing cases that would improve robustness.

### Step 4 — Feedback structure

Deliver the review in this order:

1. **Summary** — high-level overview of the review.
2. **Findings**:
   - **Critical** — bugs, security issues, or breaking changes (blocks merge).
   - **Improvements** — better code quality or performance (should fix before merge).
   - **Nitpicks** — formatting or minor style issues (optional, non-blocking).
3. **Conclusion** — clear recommendation: `Approved` or `Request Changes`.

#### Tone
- Be constructive, professional, and friendly.
- Explain *why* a change is requested, not just what.
- For approvals, acknowledge the specific value of the contribution.

### Step 5 — Cleanup (remote PRs only)

After delivering the review, ask the user if they want to switch back to the default branch:
```bash
git checkout main   # or master
```

---

## Review output contract

When delivering a review, lead with findings, ordered by severity. Each finding should answer:
- what is wrong
- why it matters
- where it lives
- what evidence supports it
- what change would resolve it

Preferred severity levels:
- `critical`: blocks merge; security, crashes, data corruption, irreversible rollout risk
- `important`: fix before merge; correctness bugs, missing regression coverage, performance regressions
- `minor`: worthwhile but non-blocking; clarity, maintainability, refactor opportunities
- `question`: seeks missing context
- `nit`: cosmetic and optional

### Feedback priority icons (quick-scan format)

| Level | Icon | Meaning | Action |
|-------|------|---------|--------|
| Blocker | 🔴 | Bug / security / crash | Must fix before merge |
| Major | 🟡 | Logic issue / test gap | Should fix before merge |
| Minor | 🟢 | Style / naming | Nice to fix |
| Suggestion | 💡 | Alternative approach | Consider for future |

### Review scope limits

| Lines changed | Recommendation |
|---------------|----------------|
| < 200 | Single review session |
| 200–400 | Review in chunks |
| > 400 | Request PR split |

### Minimum findings standard

Every review should surface at least 3 actionable observations. If an initial pass yields fewer, re-examine shared state, async patterns, error paths, and test coverage before concluding. A clean-looking diff is not the same as a correct one.

## Feedback templates

Use these templates for inline comments to ensure each finding is actionable.

### 🔴 Blocker
```markdown
🔴 **BLOCKER: [Issue title]**

[Describe the problem and why it's a blocker.]

**Fix:** [Concrete fix with code if applicable.]

**Why:** [What risk or contract violation this prevents.]
```

### 🟡 Major
```markdown
🟡 **MAJOR: [Issue title]**

[Describe what's missing or wrong and the impact.]

**Suggestion:** [Code or approach that resolves it.]
```

### 🟢 Minor
```markdown
🟢 **minor:** [One-line description — keep it short and low-pressure.]
```

### 💡 Suggestion
```markdown
💡 **suggestion:** [Alternative approach or future improvement.]

Not blocking, but worth tracking for a follow-up PR.
```

---

## Review questions to ask

Use these probing questions during analysis before writing findings.

### Logic
- What happens when X is null / empty / negative / zero?
- Is there a race condition here?
- What if the API call fails mid-sequence?
- What breaks if this branch runs twice?
- If a retry happens, is the operation idempotent?

### Security
- Is user input validated and sanitized before use?
- Are auth and permission checks in place on every path?
- Any secrets, tokens, or PII that could leak?
- Does this change alter a public field, payload, URL, event, or SQL shape?

### Testability
- How would you test this in isolation?
- Are dependencies injectable or swappable?
- Is there a test for the happy path? For each edge case?
- If the reviewer removed every new test, what behavior would no longer be protected?

### Maintainability
- Will the next developer understand this without context?
- Is this doing too many things (violates SRP)?
- Is business logic duplicated or scattered?
- Is there any loop that hides I/O or queries?

---

## High-signal review checklist

Review in this order:

1. Correctness and acceptance criteria
2. Data integrity, auth, and safety
3. Backward compatibility and contracts
4. Test coverage and missing regression cases
5. Performance, concurrency, and scale
6. Observability and diagnosability
7. Rollout, migration, and CI implications
8. Documentation for risky or user-visible changes

Questions that routinely catch real bugs:
- What breaks if this branch runs twice?
- What happens on the unhappy path?
- Does this change alter a public field, payload, URL, event, or SQL shape?
- Is there any loop that hides IO or queries?
- If a retry happens, is the operation idempotent?
- If the reviewer removed every new test, what behavior would no longer be protected?

## Self-review before requesting review

Do not ask for review on an unreviewed diff.

1. Re-read the issue or spec.
2. Diff the branch against the intended base.
3. Review changed files in the order the runtime executes them.
4. Run the focused verification commands required by the repo or task.
5. Write the review request with scope, risk areas, and how to verify.

Useful prep commands:
```bash
git diff main...HEAD --stat
git diff main...HEAD
git log main...HEAD --oneline
```

Review request payload:
- what changed
- why it changed
- explicit non-goals
- risk areas
- local verification commands

## Receiving review feedback

Follow this sequence:

1. Read all feedback before reacting.
2. Restate each item in your own words or ask for clarification.
3. Verify against codebase reality.
4. Evaluate whether it is technically sound for this repo.
5. Respond with either a fix or reasoned pushback.
6. Implement one item at a time and verify each fix.

Do not use performative agreement. Replace vague praise with technical acknowledgment.

Bad:
- "You are absolutely right."
- "Great point."
- "Let me implement that now."

Better:
- "Fixed. The issue was X; changed Y to Z."
- "Verified. This would break Z because of X. I took the safe path instead."
- "Need clarification on item 3 before implementing the rest."

## Push back with evidence, not emotion

Push back when the comment:
- breaks existing behavior
- ignores established architecture or compatibility constraints
- asks for unused complexity
- mistakes a symptom for the root cause
- requests a pattern the repo intentionally avoids

Pushback template:
1. Restate the suggestion.
2. State what you verified.
3. Explain the conflict or cost.
4. Offer the smallest safe alternative or ask the decisive question.

Example:
`[important] I checked call sites and CI usage. This endpoint is unused today, so adding a cache layer would increase complexity without protecting a live path. Remove it instead, or point me to usage and I will optimize the hot path directly.`

If your pushback was wrong:
- "You were right. I verified against X and it does Y. Fixing now."

## Reviewing large diffs

For large PRs:
- identify the runtime-critical path first
- trace entrypoints before helpers
- ignore generated files until core logic is understood
- search for deletion of tests, logs, or permission checks
- look for duplicated conditionals or business rules appearing in new locations
- sample representative tests instead of reading all of them linearly

## Review heuristics by change type

### Data model or schema changes
- migration present, reversible, ordered correctly
- backfill or rollout plan defined
- indexes and nullability considered
- application reads tolerate mixed old and new data during rollout

### API or contract changes
- request and response shapes stable or versioned
- clients, docs, and tests updated together
- error semantics unchanged unless explicitly intended

### Frontend behavior changes
- loading, empty, error, and success states all covered
- optimistic updates or retries cannot duplicate actions
- accessibility and keyboard flows still work

### Async or job changes
- retries are safe
- duplicate execution is safe
- dead-letter or failure visibility exists
- timeouts and cancellation paths are deliberate

## PR Requirements

Before marking any PR ready for review, verify:

- [ ] CI is green (linters, type checker, unit tests at minimum)
- [ ] Coverage thresholds met
- [ ] Self-review using 10-category checklist completed
- [ ] Migration commands documented in PR description (if applicable)
- [ ] Breaking changes called out explicitly
- [ ] No secrets or credentials in the diff
- [ ] PR is one coherent unit of work (not multiple unrelated features)

---

## Review etiquette

| ✅ Do | ❌ Don't |
|-------|---------|
| "Have you considered…?" | "This is wrong" |
| Explain why it matters | Just say "fix this" |
| Acknowledge good code | Only point out negatives |
| Suggest, don't demand | Be condescending |
| Review < 400 lines at a time | Review 2000 lines at once |
| Always include a proposed alternative | Leave comments without suggested fixes |
| Review the code, not the person | Make it personal |

---

## Review anti-patterns

| Anti-Pattern | What To Do Instead |
|---|---|
| Reviewing only the diff, not the context | Check callers, downstream effects, related tests |
| Approving without reading tests | Tests reveal intent better than the code |
| Rubber-stamp approvals | At least verify CI passes and tests exist |
| Requesting unrelated changes | Open a separate issue or PR |
| Bikeshedding on style | Defer to linter or house style guide |
| Ignoring security concerns | Flag every input validation gap |
| "LGTM" on untested code | Require tests before approval |
| Approving with unresolved critical comments | Block merge until resolved |

---

## Gotchas

- **Reviewing > 400 lines at once misses issues** — chunk reviews to 200–400 lines maximum.
- **Nitpicking style while missing logic bugs is the #1 review failure** — prioritize correctness over formatting.
- **Code that compiles can still have race conditions** — always check shared state and async patterns.
- **Review comments without suggested fixes are unhelpful** — always include a proposed alternative.
- **Verify the PR actually solves the linked issue** — don't just review the code in isolation.
