# Collaboration and Git

Choose the collaboration mode that fits the current branch, risk level, and expected integration path. Do not apply one git workflow mechanically to every repo.

---

## Branch Detection — First Action Every Session

Before touching any code, determine the current branch:

```bash
git branch --show-current
git status --short
```

The result gates everything that follows.

---

## Working on `main`

If the user is already on `main` and **no code changes have been made yet**, work directly on `main`. Do not force a branch or worktree just to satisfy ceremony.

**Before starting any work on `main`**, pull to sync with the remote:

```bash
git pull origin main
```

Only skip the pull if `git status` shows uncommitted local changes that a pull would conflict with.

Limits that still apply on `main`:

- Do not commit, push, merge, or rewrite history on `main` without explicit user intent.
- Recommend a branch or worktree when the change is large, risky, multi-day, or likely to become a PR.
- Avoid mixing the user's unrelated local edits with your task. Read `git status` first.

---

## Working on a Non-`main` Branch — Default: Use a Worktree

When the current branch is **not `main`**, treat the work as feature or fix work that must remain isolated from other active branches. **Use a git worktree** by default for any new change, so the current checkout is not disturbed and multiple efforts can move in parallel.

**Before creating a worktree**, pull `main` to make sure the new branch starts fresh:

```bash
git fetch origin
git pull origin main  # only if tree is clean and no local edits exist yet
```

### Creating the worktree

```bash
git worktree add .worktrees/<branch-name> -b <branch-name>
```

Preferred directory resolution order:

1. Existing `.worktrees/` directory in the repo root
2. Existing `worktrees/` directory
3. Repo-documented preferred location
4. Ask the user

If the worktree directory lives inside the repo, verify it is listed in `.gitignore` before creating a worktree there.

Use descriptive branch names matching the repo's naming convention:

- `feat/<short-description>` for new features
- `fix/<short-description>` for bug fixes
- `refactor/<short-description>` for refactors
- `chore/<short-description>` for non-behavioral changes

### When to skip the worktree

If the current (non-`main`) branch **is** the correct isolation boundary (e.g., the user already created the branch for this task), work directly in it without creating a nested worktree. Confirm by checking the branch name and asking the user if uncertain.

---

## Git Pulls — When to Pull

| Situation | Action |
|-----------|--------|
| On `main`, tree is clean, no changes made | `git pull origin main` before starting |
| On a feature branch, tree is clean, starting fresh work | `git fetch origin && git rebase origin/main` |
| Tree is dirty (uncommitted changes exist) | Do **not** pull. Work from the current state. |
| Worktree just created | Already branched from current HEAD; no pull needed unless HEAD is behind |

Never auto-rebase or pull when the tree has uncommitted edits — this risks merge conflicts that destroy in-progress work.

---

## Commits — Multiple, Semantic, and Descriptive

Every PR should contain **multiple commits**, each representing one logical unit of change. Do not squash all work into a single commit. Separation of concerns in commits:

- makes the PR easier to review
- makes `git bisect` and `git blame` useful
- makes rollback surgical

### Commit naming rules

Commit messages must be **descriptive and precise**. The subject line should complete the sentence "This commit will…":

**Format:**
```
<type>(<scope>): <imperative short description>

[optional body explaining WHY, not WHAT]
```

**Types:** `feat`, `fix`, `refactor`, `test`, `chore`, `docs`, `style`, `perf`, `ci`

**Good examples:**
```
feat(auth): add JWT refresh token rotation on expiry
fix(api): return 404 instead of 500 when resource not found
refactor(dashboard): extract useMetrics hook from DashboardPage
test(auth): add integration tests for refresh token flow
chore(deps): upgrade React to 19.1.0
```

**Bad examples (never use):**
```
fix: fix bug
update: changes
WIP
stuff
```

### Commit ordering — bisectable chunks

When a feature or fix produces multiple files, group them into **logically ordered commits** so each commit compiles and passes tests independently. Order matters for `git bisect` and for reviewers scanning history:

1. **Infrastructure first:** migrations, config changes, route additions, environment setup
2. **Models and services:** new models, services, concerns — together with their test files
3. **Controllers and views:** controllers, views, React components — together with their test files
4. **Supporting cleanup:** dead code removal, type updates, documentation updates
5. **Release metadata last:** VERSION, CHANGELOG, TODOS (always final commit)

Rules for splitting:
- A model and its test file go in the **same commit**
- A service and its test file go in the **same commit**
- A controller, its views, and its test go in the **same commit**
- Migrations are their own commit (or grouped with the model they support)
- If the total diff is small (< 50 lines across < 4 files), a single commit is fine
- Each commit must be independently valid — no broken imports, no references to code that doesn't exist yet

### Commit cadence

Commit after each discrete, passing unit of work — not at arbitrary time intervals, and not only at the end of the PR:

1. Initial scaffolding or skeleton
2. Core implementation of each logical piece
3. Tests for each implemented piece
4. Bug fixes discovered during testing
5. Documentation or type updates
6. Final cleanup (removing debug code, unused imports)

---

## Pull Requests — Before Opening

Gate PRs on CI/CD passing. Do not open a PR while tests are red or the build is broken on the branch:

1. Search session history for the problem being solved and the user's justification before writing anything.
2. If the intent behind the change is not clear from the session, **ask the user** — do not fabricate it.
3. Push the branch: `git push origin <branch-name>`
4. Confirm CI checks pass (GitHub Actions, CircleCI, etc.)
5. If CI fails: fix on the branch, push again, wait for green
6. Validate the diff against the discussed changes. If unexpected files appear in `git diff`, warn the user before opening the PR.
7. Open the PR only once CI is green.

If the repo has no CI, run the local test suite and build and confirm they pass before opening the PR.

---

## Pull Requests — Description Quality

PR descriptions are **intent-first collaboration artifacts**. The most important information is *why the change exists* — the problem being solved, not a narration of the diff.

### Core rules (non-negotiable)

1. **Never fabricate intent.** Most users omit explanations. If the reason for the change is not in the session context, ask rather than guess.
2. **Never list files.** GitHub already shows every changed file in the diff. Repeating the list adds noise without value.
3. **Never narrate code changes.** The diff demonstrates what changed. The description should explain the *problem* and *approach*, not walk through the implementation.
4. **Never speculate on risks.** Include only risks or caveats explicitly mentioned by the user or observed directly in the code. Do not invent warnings.
5. **Never include test plans.** Testing is implicit. Omit "Testing" or "How to Test" sections unless the user explicitly provides test steps.

### PR description format

```markdown
### Why?
[The problem this change solves — in the user's own words if available; otherwise obtained by asking]

### How?
[High-level approach in 1–2 sentences. No file listings, no implementation narration.]

<details>
<summary>Implementation Plan</summary>
[Include only if a written plan exists from the session. Omit this block otherwise.]
</details>

[Screenshots or recordings — required for any UI change, omit for all others]
```

### Anti-patterns to avoid

| Anti-pattern | Why it is harmful |
|---|---|
| Writing "The intent of this PR is to…" with fabricated reasoning | Misleads reviewers; signals the description was not sourced from the user |
| Listing every file touched ("Updated `auth.ts`, `tokens.ts`, `middleware.ts`") | GitHub shows this; repetition creates review fatigue |
| Narrating the implementation ("First we fetch the token, then we validate…") | The diff already shows this; prose narration adds no value |
| Adding "Risk: this may affect other areas" with no evidence | Speculative risk creates unnecessary alarm without actionable guidance |
| Generating a test plan section when none was discussed | Implies the author performed testing they didn't; wastes reviewer attention |
| Using `#NUMBER` in descriptions to reference unrelated issues | GitHub automatically links these, potentially closing issues unexpectedly |

### Inline PR comments

When leaving review comments on others' PRs:

- Be precise about file, line, and the specific concern.
- Distinguish blockers from suggestions: prefix with **[blocker]** or **[nit]**.
- Explain *why* something should change, not just *what* to change.
- Never leave vague comments ("This seems off", "I'd do this differently").

---

## Pull Requests — Merging

When a PR is approved and CI is green, merge it correctly:

### Merge strategy

| Repo convention | Strategy |
|-----------------|----------|
| Linear history enforced | Squash merge or rebase merge |
| History preserved | Merge commit |
| No stated convention | Prefer merge commit (preserves branch history) |

Check the repo's `CONTRIBUTING.md` or existing PR merge history to determine the convention before merging.

### Steps before merging

1. Confirm all CI checks are green.
2. Confirm required reviewers have approved.
3. Confirm no unresolved blocker comments remain.
4. If the branch is behind `main`, update it: `git fetch origin && git merge origin/main` (or rebase per convention).
5. Re-run CI if the branch was updated.
6. Merge.

### After merging

1. Delete the remote branch (unless the repo policy retains it).
2. If a worktree was used, remove it: `git worktree remove .worktrees/<branch-name>`.
3. Delete the local branch: `git branch -d <branch-name>`.
4. On `main`, pull to update: `git pull origin main`.

---

## When to Use a New Branch (Without Worktree)

Create a plain branch (no worktree) when:

- The current checkout is already `main` and you want a lightweight PR branch without parallel work
- The change is small enough that switching branches is not disruptive
- The repo's convention discourages worktrees

Prefer worktrees for anything involving parallel work, long-running tasks, or when the current checkout must stay functional.

---

## Review Comments and Thread Hygiene

- Resolve comments with code or technical reasoning, not performative agreement ("Good point, fixed!").
- Reply in-thread when the platform supports it.
- Distinguish blocker comments from optional cleanup so you can sequence work correctly.
- When all blockers are resolved, re-request review rather than merging silently.

---

## Cleanup and Completion

When implementation is complete on a branch or worktree:

1. Confirm CI is green.
2. Present the next integration choice to the user:
   - merge locally into `main`
   - push and create or update a PR
   - keep the branch or worktree open for more work
   - discard the work
3. If discard is chosen, require explicit confirmation before deleting a branch or worktree.

Do not silently stop work in an ambiguous state. Make the next step explicit.
