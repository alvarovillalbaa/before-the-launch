# TDD Iron Laws

---

## The Fundamental Principle

> **NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST.**

This is non-negotiable. If you wrote production code before writing a failing test, delete it and start over. No exceptions.

**Violating the letter of the rules is violating the spirit of the rules.**

---

## When to Use TDD

**Always:**
- New features
- Bug fixes
- Refactoring
- Behavior changes

**Exceptions (ask your human partner first):**
- Throwaway prototypes
- Generated code
- Configuration files

Thinking "skip TDD just this once"? Stop. That's rationalization.

---

## The Three Iron Laws

### Iron Law 1: The Fundamental Rule

> "You shall not write any production code unless it is to make a failing test pass."

Every line of production code must have a corresponding test that:
1. Was written first
2. Was observed to fail
3. Now passes because of that code

### Iron Law 2: Proof Through Observation

> "If you didn't watch the test fail, you don't know if it tests the right thing."

Mandatory verification steps:
- Write the test
- Run it and **observe the failure**
- Verify the failure message is meaningful
- Only then implement the fix

A test you've never seen fail proves nothing.

### Iron Law 3: The Final Rule

> "Production code exists → A test exists that failed first. Otherwise → It's not TDD."

There is no middle ground. Code written without a prior failing test is not test-driven development, regardless of how many tests exist afterward.

---

## The RED-GREEN-REFACTOR Cycle

### RED: Write One Minimal Failing Test

```typescript
// Start with the smallest possible failing test
it('should return 0 for empty array', () => {
  expect(sum([])).toBe(0);
});
// Run: ✗ FAIL - sum is not defined
```

**Requirements:**
- One test at a time
- Minimal scope
- Clear failure message
- Observe the red

### GREEN: Implement Simplest Passing Code

```typescript
// Write only enough code to pass this specific test
function sum(numbers: number[]): number {
  return 0;
}
// Run: ✓ PASS
```

**Requirements:**
- Simplest possible implementation
- No extra features
- No optimization
- Just make it pass

### REFACTOR: Improve While Keeping Tests Green

```typescript
// Now improve the code while tests stay green
function sum(numbers: number[]): number {
  return numbers.reduce((acc, n) => acc + n, 0);
}
// Run: ✓ PASS (still)
```

**Requirements:**
- Tests must stay green
- Remove duplication
- Improve clarity
- No new functionality

---

## Common Rationalizations to Reject

These thoughts indicate you're about to violate TDD:

| Rationalization | Why It's Wrong |
|-----------------|----------------|
| "I can manually test this quickly" | Manual testing doesn't prevent regression |
| "I'll write tests after to save time" | You'll skip edge cases and test implementation |
| "This is too simple to need a test" | Simple code changes; tests document expectations |
| "I've already written the code, I can't delete it now" | Sunk cost fallacy; delete it |
| "I know this works, I've done it before" | Your memory isn't documentation |
| "We're in a hurry" | Technical debt costs more than TDD |
| "Keep as reference, write tests first" | You'll adapt it. That's testing after. Delete means delete. |
| "Need to explore first" | Fine. Throw away exploration, start with TDD. |
| "Test hard = design unclear" | Listen to the test. Hard to test = hard to use. |
| "TDD will slow me down" | TDD is faster than debugging. |
| "Tests after achieve the same goals" | No — see "Why Order Matters" below. |

---

## Why Order Matters

**"I'll write tests after to verify it works"**

Tests written after code pass immediately. Passing immediately proves nothing:
- Might test the wrong thing
- Might test implementation, not behavior
- Might miss edge cases you forgot
- You never saw it catch the bug

Test-first forces you to see the test fail, proving it actually tests something.

**"I already manually tested all the edge cases"**

Manual testing is ad-hoc. You think you tested everything, but:
- No record of what you tested
- Can't re-run when code changes
- Easy to forget cases under pressure

Automated tests are systematic. They run the same way every time.

**"Deleting X hours of work is wasteful"**

Sunk cost fallacy. The time is already gone. Your choice now:
- Delete and rewrite with TDD (X more hours, high confidence)
- Keep it and add tests after (30 min, low confidence, likely bugs)

The "waste" is keeping code you can't trust. Working code without real tests is technical debt.

**"Tests after achieve the same goals — it's spirit not ritual"**

No. Tests-after answer "What does this do?" Tests-first answer "What should this do?"

Tests-after are biased by your implementation. You test what you built, not what's required. You verify remembered edge cases, not discovered ones. Tests-first force edge case discovery before implementing.

---

## Red Flags — STOP and Start Over

- Code before test
- Test after implementation
- Test passes immediately without you watching it fail
- Can't explain why the test failed
- Tests added "later"
- Rationalizing "just this once"
- "I already manually tested it"
- "Tests after achieve the same purpose"
- "It's about spirit not ritual"
- "Keep as reference" or "adapt existing code"
- "Already spent X hours, deleting is wasteful"
- "TDD is dogmatic, I'm being pragmatic"
- "This is different because..."

**All of these mean: Delete code. Start over with TDD.**

---

## When Stuck

| Problem | Solution |
|---------|----------|
| Don't know how to test | Write the wished-for API. Write the assertion first. Ask your human partner. |
| Test too complicated | Design too complicated. Simplify the interface. |
| Must mock everything | Code too coupled. Use dependency injection. |
| Test setup huge | Extract helpers. Still complex? Simplify the design. |

---

## Debugging Integration

Bug found? Write a failing test that reproduces it. Follow the TDD cycle. The test proves the fix and prevents regression.

**Never fix bugs without a test.**

---

## Practical Application

### Starting a New Feature

```typescript
// 1. RED: Write failing test for simplest behavior
describe('UserValidator', () => {
  it('should reject empty email', () => {
    expect(validateEmail('')).toBe(false);
  });
});

// 2. GREEN: Implement minimal passing code
function validateEmail(email: string): boolean {
  return email.length > 0;
}

// 3. RED: Add next failing test
it('should reject email without @', () => {
  expect(validateEmail('invalid')).toBe(false);
});

// 4. GREEN: Extend to pass both tests
function validateEmail(email: string): boolean {
  return email.length > 0 && email.includes('@');
}

// Continue cycle...
```

### Fixing a Bug

```typescript
// 1. RED: Write test that exposes the bug
it('should handle negative numbers in sum', () => {
  expect(sum([-1, -2, -3])).toBe(-6);
});
// Run: ✗ FAIL - got 0 instead of -6

// 2. GREEN: Fix the bug
function sum(numbers: number[]): number {
  return numbers.reduce((acc, n) => acc + n, 0);
}
// Run: ✓ PASS

// Bug is now fixed AND protected against regression
```

---

## Verification Checklist

Before claiming any code is complete:

- [ ] Every production function has corresponding tests
- [ ] Each test was written before its implementation
- [ ] Each test was observed to fail first
- [ ] Tests verify behavior, not implementation
- [ ] Refactoring kept all tests green
- [ ] No production code exists without a test

---

*Content adapted from [obra/superpowers](https://github.com/obra/superpowers) by Jesse Vincent (@obra), MIT License.*
