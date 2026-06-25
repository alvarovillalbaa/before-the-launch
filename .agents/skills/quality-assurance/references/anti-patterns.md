# QA Anti-Patterns Reference

## Testing anti-patterns

- Import-only tests that prove only that the file loads
- Mocking internal logic instead of real boundaries
- Asserting only that a mock was called
- Snapshot tests used as a substitute for behavioral assertions
- `sleep()` in tests instead of explicit waits or deterministic execution
- Shared mutable state between tests
- Overloaded fixtures that hide the one condition the test actually depends on
- No regression test for a bug fix
- Running only the focused test, then claiming the broader area is safe

## Code review anti-patterns

- Reviewing style that the formatter or linter already enforces
- Commenting on taste while missing correctness or rollback risk
- Leaving vague feedback without impact or evidence
- Treating reviewer comments as orders instead of claims to evaluate
- Asking for speculative features with no demonstrated need
- Approving large diffs without tracing the runtime-critical path

## Debugging anti-patterns

- Fixing the first visible symptom instead of the root cause
- Reading only the last line of the stack trace
- Changing multiple variables at once and learning nothing
- Assuming CI is wrong because local passes
- Calling a failure flaky before trying to isolate order, time, or shared state
- Adding logs everywhere instead of starting with existing evidence

## CI/CD anti-patterns

- Different commands in CI than developers run locally
- Making flaky jobs required
- Hiding failures behind retries without surfacing the underlying issue
- Caching everything without invalidation discipline
- Overusing end-to-end tests as the only gate
- Missing artifacts, so red jobs are not diagnosable
- Path filters that silently skip required validation

## Replacement heuristics

When you spot an anti-pattern, replace it with one of these moves:
- assert an observable outcome
- reduce the test layer or raise it to the correct layer
- freeze time or seed randomness
- add a regression test before changing production code
- publish artifacts that explain failures
- narrow review comments to evidence, impact, and fix
  await userEvent.click(screen.getByRole('button', { name: /submit/i }))
  expect(screen.getByRole('alert')).toHaveTextContent('Required field')
})
```

---

## Code Review Anti-Patterns

### ❌ Rubber-stamp Approvals

Approving without reading the tests, checking security, or understanding the logic change. Creates a false gate.

### ❌ Bikeshedding

Spending review time on trivialities (variable names, formatting) when there are actual logic or security issues. Delegate style to linters.

### ❌ Scope Creep Comments

"While you're here, could you also refactor this unrelated thing?" Open a separate issue.

### ❌ Performative Agreement

"You're absolutely right!" before checking whether the feedback is correct. Verify first, then respond.

### ❌ Ignoring Tests

Approving a PR with no tests for new behavior. Tests are the spec in executable form.

### ❌ Partial Implementation of Review Feedback

Implementing items 1-3 and asking about 4-5 later. Understand all items first, implement after.

---

## CI Anti-Patterns

### ❌ Skipping Tests to Fix CI

```yaml
# ❌ Disabling failing tests to make CI green
pytest --ignore=tests/integration/test_payments.py
```

**Fix:** Fix the tests. CI is the feedback. Disabling it hides the problem.

### ❌ Hard-Coding Secrets in CI

```yaml
# ❌ Never do this
env:
  SECRET_KEY: "my-secret-key-1234"
  DATABASE_URL: "postgres://prod:prod@prod-db/prod"
```

**Fix:** Use CI secrets / encrypted variables.

### ❌ No Caching

Running `pip install` or `npm install` from scratch on every CI run. Adds minutes to every build.

**Fix:** Cache dependency directories keyed on lockfile hash.

### ❌ No Parallelization for Large Test Suites

Running 1000 tests sequentially when they could run in parallel.

**Fix:** Use `-n auto` (pytest-xdist) or `--shard` flags. Confirm tests are isolated first.

### ❌ Not Treating CI as a Gate

Merging despite red CI, planning to "fix it later." Once this becomes acceptable, the signal value of CI collapses.

**Fix:** Enforce branch protection. No merges with failing CI.

### ❌ Over-Permissive Coverage Threshold

Setting coverage threshold at 10% so it never fails. A threshold that never fails is not a gate.

**Fix:** Set threshold just above current coverage. Ratchet it up incrementally. Never lower it.

---

## General Code Quality Smells

| Smell | What It Usually Means |
|---|---|
| Function >50 lines | Does more than one thing; extract |
| Function >3 parameters | Missing abstraction; introduce data class / config object |
| Nested conditionals >3 levels | Invert conditions; early return; extract method |
| Comments explaining *what* the code does | Code should be self-documenting; refactor names |
| Comments explaining *why* | This is good — keep it |
| Duplicate logic in 3+ places | Extract to shared utility |
| Magic numbers / strings | Extract to named constant |
| `except Exception:` | Catch specific exception types; log with context |
| Boolean parameter `do_thing(flag=True)` | Split into two functions |
| Accessing `.objects.all()` in a view | Scope query; risk of data leak across tenants |
| `print()` in production code | Use structured logger |
| `# TODO` without an issue link | Will never be done; link to tracker or remove |
| `if True:` or `if False:` | Dead code or debugging artifact; remove |
