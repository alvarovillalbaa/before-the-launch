# TDD — Advanced Patterns and Techniques

Extends the TDD foundations in `specs-plans-tests.md` with spec-first workflows, property-based and mutation testing, language-specific patterns, test quality principles, and rules for autonomous test generation.

## The Iron Law

```
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
```

Write code before the test? Delete it and start over. Do not keep it as "reference," do not "adapt" it while writing tests. Delete means delete. Implement fresh from tests.

### Red-Green-Refactor (non-negotiable)

1. **RED** — write one minimal failing test that describes the behavior. Run it. Confirm it fails for the expected reason (missing feature, not typo). If it passes immediately, you are testing existing behavior — fix the test.
2. **GREEN** — write the simplest code that makes the test pass. No extra features. No "nice to haves." Minimal.
3. **REFACTOR** — clean up only after green. Remove duplication, improve names. Keep tests green throughout.

**Verify both RED and GREEN by running the test suite.** Never skip the RED check — if you did not watch the test fail, you do not know whether it actually tests the right behavior.

### Common Rationalizations — All Invalid

| Excuse | Reality |
|--------|---------|
| "Too simple to test" | Simple code breaks. Test takes 30 seconds. |
| "I'll test after" | Tests passing immediately prove nothing |
| "Tests after achieve same goals" | Tests-after = "what does this do?" Tests-first = "what should this do?" |
| "Already manually tested" | Ad-hoc ≠ systematic. No record, can't re-run. |
| "Deleting X hours is wasteful" | Sunk cost. Keeping unverified code is technical debt. |
| "Keep as reference, write tests first" | You'll adapt it. That is testing after. Delete means delete. |
| "Need to explore first" | Fine. Throw away the exploration, then start TDD. |
| "TDD will slow me down" | TDD is faster than debugging production. |

### Red Flags — Stop and Start Over

- Code was written before the test
- Test passed immediately on first run (never saw it fail)
- You cannot explain what the failure message would have said
- Tests were added "later" or "after verifying it works"
- Any form of "I'll write tests after this one" rationalization

All of these mean: delete the code, start over with TDD.

---

## Spec-First Workflow

TDD is most effective when driven by a written spec. Specs live in `specs/` alongside tests:

```
project/
├── specs/
│   ├── user-auth.md          # Feature spec with acceptance criteria
│   ├── payment-processing.md
│   └── notification-system.md
├── tests/
│   ├── test_user_auth.py     # Tests derived from specs/user-auth.md
│   ├── test_payments.py
│   └── test_notifications.py
└── src/
```

**Flow:** Write or receive spec → Extract acceptance criteria → Write failing tests (one per criterion) → Implement minimal code (GREEN) → Refactor

### Acceptance Criteria → Test Mapping

| Spec Criterion | Test Case |
|----------------|-----------|
| "User can log in with valid credentials" | `test_login_valid_credentials_returns_token` |
| "Invalid password returns 401" | `test_login_invalid_password_returns_401` |
| "Account locks after 5 failed attempts" | `test_login_locks_after_five_failures` |

**Traceability tip:** Number acceptance criteria in the spec; reference the number in test docstrings for full traceability:
```python
def test_login_locks_after_five_failures():
    """AC-3: Account locks after 5 failed attempts."""
    ...
```

---

## Red-Green-Refactor Examples by Language

### TypeScript / Jest — Behavior-Scoped Tests

```typescript
// test/cart.test.ts
describe("Cart", () => {
  describe("addItem", () => {
    it("should add a new item to an empty cart", () => {
      const cart = new Cart();
      cart.addItem({ id: "sku-1", name: "Widget", price: 9.99, qty: 1 });
      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].id).toBe("sku-1");
    });

    it("should increment quantity when adding an existing item", () => {
      const cart = new Cart();
      cart.addItem({ id: "sku-1", name: "Widget", price: 9.99, qty: 1 });
      cart.addItem({ id: "sku-1", name: "Widget", price: 9.99, qty: 2 });
      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].qty).toBe(3);
    });

    it("should throw when quantity is zero or negative", () => {
      const cart = new Cart();
      expect(() =>
        cart.addItem({ id: "sku-1", name: "Widget", price: 9.99, qty: 0 })
      ).toThrow("Quantity must be positive");
    });
  });
});
```

### Python / Pytest — Fixtures and Parametrize

```python
# tests/conftest.py — shared fixtures
import pytest
from app.db import create_engine, Session

@pytest.fixture(scope="session")
def db_engine():
    engine = create_engine("sqlite:///:memory:")
    yield engine
    engine.dispose()

@pytest.fixture
def db_session(db_engine):
    session = Session(bind=db_engine)
    yield session
    session.rollback()
    session.close()

# tests/test_pricing.py
@pytest.mark.parametrize("subtotal, expected_discount", [
    (50.0, 0.0),    # Below threshold — no discount
    (100.0, 5.0),   # 5% tier
    (250.0, 25.0),  # 10% tier
    (500.0, 75.0),  # 15% tier
])
def test_calculate_discount(subtotal, expected_discount):
    assert calculate_discount(subtotal) == pytest.approx(expected_discount)
```

### Go — Table-Driven Tests

```go
func TestApplyDiscount(t *testing.T) {
    tests := []struct {
        name     string
        subtotal float64
        want     float64
    }{
        {"no discount below threshold", 50.0, 0.0},
        {"5 percent tier", 100.0, 5.0},
        {"10 percent tier", 250.0, 25.0},
        {"15 percent tier", 500.0, 75.0},
        {"zero subtotal", 0.0, 0.0},
    }
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got := ApplyDiscount(tt.subtotal)
            if got != tt.want {
                t.Errorf("ApplyDiscount(%v) = %v, want %v", tt.subtotal, got, tt.want)
            }
        })
    }
}
```

---

## Property-Based Testing

Property-based testing generates random inputs to verify invariants. Use it when the input space is large and behavior can be expressed as a property (roundtrip, commutativity, idempotency).

### Python — Hypothesis

```python
from hypothesis import given, strategies as st
from app.serializers import serialize, deserialize

@given(st.text())
def test_roundtrip_serialization(data):
    """Serialization followed by deserialization returns the original."""
    assert deserialize(serialize(data)) == data

@given(st.integers(), st.integers())
def test_addition_is_commutative(a, b):
    assert a + b == b + a
```

### TypeScript — fast-check

```typescript
import fc from "fast-check";
import { encode, decode } from "./codec";

test("encode/decode roundtrip", () => {
  fc.assert(
    fc.property(fc.string(), (input) => {
      expect(decode(encode(input))).toBe(input);
    })
  );
});
```

### When to Use Property-Based Over Example-Based

| Use Property-Based | Example |
|--------------------|---------|
| Data transformations | Serialize/deserialize roundtrips |
| Mathematical properties | Commutativity, associativity, idempotency |
| Encoding/decoding | Base64, URL encoding, compression |
| Sorting and filtering | Output is sorted, length preserved |
| Parser correctness | Valid input always parses without error |

---

## Mutation Testing

Mutation testing modifies production code ("mutants") and checks whether tests catch the changes. A surviving mutant means tests have a gap that line coverage alone cannot reveal.

### Tools by Language

| Language | Tool | Command |
|----------|------|---------|
| TypeScript/JavaScript | **Stryker** | `npx stryker run` |
| Python | **mutmut** | `mutmut run --paths-to-mutate=src/` |
| Java | **PIT** | `mvn org.pitest:pitest-maven:mutationCoverage` |

### Why Mutation Testing Matters

- **100% line coverage ≠ good tests** — coverage reports code was executed, not verified
- **Catches weak assertions** — tests that run code but assert nothing meaningful
- **Finds off-by-one gaps** — mutants changing `<` to `<=` expose missing boundary tests
- **Quantifiable quality metric** — mutation score (% mutants killed) is a stronger signal than coverage %

**Recommendation:** Run mutation testing on critical paths (auth, payments, data processing). Target **85%+ mutation score** on P0 modules even when overall coverage is high.

---

## Coverage Goals by Type

| Type | Target | Alert Threshold | Rationale |
|------|--------|-----------------|-----------|
| Line coverage | 80%+ | < 80% | Baseline for most projects |
| Branch coverage | 70%+ | < 70% | More meaningful than line |
| Function coverage | 90%+ | < 90% | Public APIs should be tested |
| Coverage delta | — | < -2% per PR | Regression detection |

**Critical path rules (non-negotiable):**
- Authentication: 100%
- Payment processing: 100%
- Data validation: 100%
- Error handlers: all paths covered

---

## Test Quality Principles

### Independence
- Each test runs in isolation with no shared mutable state
- Tests can run in any order and in parallel

### Speed
- Unit tests under 100ms each
- Avoid I/O in unit tests; use in-memory databases for integration

### Determinism
- Same inputs always produce same results
- No dependency on system time or random values without controlled seeding
- Flaky tests are bugs — quarantine and fix immediately

### Naming Conventions
- Use descriptive names that read as specifications
- Format: `should_<expected>_when_<condition>`
- Examples: `should_return_zero_when_cart_is_empty`, `should_reject_negative_amounts`
- Optimal length: 20–80 characters; include descriptive words

### Test Structure — Coverage Scope
Every behavior change should cover four dimensions:
1. **Happy path** — normal expected usage
2. **Error cases** — invalid inputs, system failures
3. **Edge cases** — boundaries, empty states, zero values
4. **Exceptional cases** — timeouts, nulls, concurrency

---

## Bounded Autonomy Rules for Autonomous Test Generation

### Stop and Ask When
- **Ambiguous requirements** — spec has conflicting or unclear acceptance criteria
- **Missing domain knowledge** — cannot determine boundary values without business context (e.g., max allowed transaction amount)
- **Test count exceeds 50** — present a summary and ask which areas to prioritize
- **External dependencies unclear** — feature relies on third-party APIs with undocumented behavior
- **Security-sensitive logic** — auth, authorization, encryption, or payment flows require human sign-off on test scenarios

### Continue Autonomously When
- **Clear spec with numbered acceptance criteria** — each criterion maps directly to tests
- **Straightforward CRUD operations** — create, read, update, delete with well-defined models
- **Well-defined API contracts** — OpenAPI spec or typed interfaces available
- **Pure functions** — deterministic input/output with no side effects
- **Existing test patterns** — the codebase already has similar tests to follow

---

## Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `scripts/coverage_analyzer.py` | Parse LCOV/JSON/XML reports; identify P0/P1/P2 gaps | `python scripts/coverage_analyzer.py --report lcov.info --threshold 80` |
| `scripts/tdd_workflow.py` | Guide RED/GREEN/REFACTOR cycle; validate phase completion | `python scripts/tdd_workflow.py --phase red --test test_auth.py` |
| `scripts/fixture_generator.py` | Generate boundary-value fixtures and mock data from schemas | `python scripts/fixture_generator.py --entity User --count 5` |

---

## Framework Configuration and CI Integration

- For framework selection, `jest.config.js`, `vitest.config.ts`, `pytest.ini`, and JUnit 5 Maven configuration: read `tdd-framework-guide.md`.
- For GitHub Actions workflows, `coverageThreshold` in `package.json`/`pyproject.toml`/`pom.xml`, PR coverage checks, and coverage services (Codecov, Coveralls, SonarCloud): read `tdd-ci-integration.md`.
