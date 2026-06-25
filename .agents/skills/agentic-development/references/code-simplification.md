# Code Simplification

Run this after completing a feature branch or a significant code change — before opening a PR. The goal is to improve clarity, reuse, and efficiency without changing behavior.

## Step 1: Resolve scope

Determine what to simplify in this order:

1. **If the user named a scope** (a file, directory, "the function I just wrote") — use that. Treat it as authoritative; do not widen it.
2. **In a git repo** — default to the branch diff: `git diff origin/main...HEAD` (or against the configured upstream). Falls back to `git diff HEAD` when no upstream branch exists.
3. **Outside git or no diff** — review the most recently modified files mentioned in the conversation.

If none of the above produces a non-empty scope, stop and ask.

## Step 2: Launch 3 review agents in parallel

Dispatch all three simultaneously via the `Agent` tool with `model: "sonnet"`. Each receives the full diff or resolved file set.

### Agent 1 — Reuse Reviewer

For each change:
1. Search for existing utilities that could replace newly written code (check utility directories, shared modules, files adjacent to the changed ones)
2. Flag any new function that duplicates existing functionality — name the existing function to use instead
3. Flag inline logic that could use an existing utility: hand-rolled string manipulation, manual path handling, custom environment checks, ad-hoc type guards

### Agent 2 — Quality Reviewer

Review for structural issues:
1. **Redundant state** — state that duplicates existing state, cached values that could be derived, observers that could be direct calls
2. **Parameter sprawl** — new parameters added to a function instead of restructuring
3. **Copy-paste with variation** — near-duplicate blocks that should be unified with a shared abstraction
4. **Leaky abstractions** — internal details exposed, or existing abstraction boundaries broken
5. **Stringly-typed code** — raw strings where constants, enums, or branded types already exist
6. **Nested conditionals** — ternary chains 3+ levels deep, nested if/else — flatten with early returns, guard clauses, or lookup tables
7. **Unnecessary comments** — comments explaining WHAT the code does (well-named identifiers already do that), comments narrating the change, or referencing the task/issue. Keep only non-obvious WHY (hidden constraints, subtle invariants, specific bug workarounds)
8. **Dead code** — unreachable paths, unused imports, unused exports. Use the project's linter first (ESLint, ruff, tsc `--noUnusedLocals`). Treat re-exports, dynamic imports, and framework-specific exports as potentially alive — skip when uncertain

### Agent 3 — Efficiency Reviewer

Review for unnecessary work:
1. **Redundant computation** — repeated file reads, duplicate API calls, N+1 patterns
2. **Missed concurrency** — independent operations that run sequentially when they could be parallel
3. **Hot-path bloat** — new blocking work added to startup or per-request paths
4. **Unconditional updates** — state updates in polling loops or event handlers that fire even when nothing changed (add a change-detection guard)
5. **Unnecessary existence checks** — pre-checking file or resource existence before operating (TOCTOU anti-pattern). Operate directly and handle the error.
6. **Memory leaks** — unbounded data structures, missing cleanup, event listener leaks
7. **Overly broad reads** — reading entire files when only a portion is needed, loading all records when filtering for one

## Step 3: Fix issues

Wait for all three agents to complete. Aggregate findings and fix each one directly. Skip false positives with a brief note — do not ask the user about individual findings.

## Step 4: Verify behavior is preserved

1. **Run typecheck and lint** over the full project first — they are fast and catch the most common simplification regressions (broken imports, dropped type narrowings, dead code still referenced elsewhere)
2. **Run tests** scoped to changed paths. Broaden scope if the change touches a widely-imported module
3. If the test runner has no scoping mechanism, run the full suite

**Never:** relax assertions, weaken type signatures, or skip tests to make checks pass. If a simplification causes a regression, either fix the regression or revert that specific change.

If no test suite, lint, or typecheck is configured, state that explicitly — do not silently skip verification.

## Step 5: Summarize

One-paragraph summary: what improved, what was already clean, which checks ran and passed. If there were no findings, confirm the code needed no changes.

---

## When to run

- Before opening a PR on any feature branch
- After a long dev-loop that accumulated incremental patches
- After code generation that may have introduced duplication
- As a named step in the `/harness-loop`: `--verify-cmd 'bash scripts/simplify-check.sh'`

## What this does NOT do

- Change behavior (if a simplification changes behavior, it's a bug, not a simplification)
- Add new features
- Fix correctness issues (route those to `debug-investigation.md`)
- Improve architecture (route those to the `architecture-strategist` agent)
