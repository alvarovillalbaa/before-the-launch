# Subagents and Parallelism

Use subagents to improve focus, not to outsource thinking. The controller remains responsible for scope, integration, and truthfulness.

## Input Triage: Before Any Execution

Before writing code or dispatching subagents, classify the task input and its complexity.

### Input Type Detection

| Input | Action |
|-------|--------|
| **Plan document** (file path to an existing plan or spec) | Read it completely; use its Implementation Units, Files, Test Scenarios as the primary execution source |
| **Bare prompt** (description of work, not a file path) | Scan the likely affected files; find existing test files; note local patterns; then route by complexity below |

### Complexity Routing

Classify the work before dispatching. Default down when uncertain; escalate when the task expands.

| Complexity | Signals | Execution model |
|-----------|---------|-----------------|
| **Trivial** | 1–2 files, no behavioral change (typo, config, rename) | Inline, no task list. Run Test Discovery if the change touches behavior-bearing code |
| **Small / Medium** | Clear scope, under ~10 files, self-contained | Build a task list; execute inline or with serial subagents |
| **Large** | Cross-cutting, architectural decisions, 10+ files, touches auth/payments/migrations | Consider a planning pass first to surface edge cases and scope boundaries. Build a task list and use team-of-agents |
| **Epic** | Multi-sprint rewrite, exhausts a single agent's context budget | Supervised harness loop + team of agents, with disk-backed state between iterations |

When the task expands mid-execution — more files than planned, unexpected coupling, spec gaps — pause, re-scope, and re-dispatch at the higher tier. Do not accumulate context in a single agent.

### Execution Strategy Selection

| Strategy | When to use |
|----------|-------------|
| **Inline** | 1–2 small tasks, or tasks needing user interaction mid-flight. Default for bare-prompt work |
| **Serial subagents** | 3+ tasks with dependencies. Each subagent gets a fresh context window focused on one unit |
| **Parallel subagents** | 3+ tasks that pass the Parallel Safety Check below. Dispatch independent units simultaneously |

## Before Parallel Dispatch: Parallel Safety Check

Run this check before choosing parallel dispatch.

1. Build a file-to-unit mapping from every candidate unit's `Files:` section (Create, Modify, Test paths).
2. Check for intersection — any file path appearing in 2+ units means overlap.
3. **If overlap found AND worktree isolation is unavailable:** downgrade to serial subagents. Log the reason (e.g., "Units 2 and 4 share `config/routes.rb` — using serial dispatch").
4. **If overlap found AND worktree isolation is available:** parallel dispatch is safe — subagents work in isolation; the overlap surfaces as a predictable merge conflict the orchestrator handles post-batch. Log the predicted overlap.

Even with no file overlap, parallel subagents sharing the same working directory face **git index contention** (concurrent staging corrupts `.git/index.lock`) and **test interference** (concurrent test runs see each other's in-progress changes). Worktree isolation eliminates both.

## Worktree Isolation

When dispatching parallel implementation sub-agents in Claude Code, use worktree isolation:

```
Agent({
  isolation: "worktree",    # each agent gets an isolated git worktree
  run_in_background: true,  # orchestrator continues immediately
  ...
})
```

The harness creates a per-agent worktree under `.claude/worktrees/agent-<id>` on its own branch. Verify `.claude/worktrees/` is gitignored before relying on this.

**Permission mode:** Omit the `mode` parameter when dispatching subagents so the user's configured permission settings apply. Do not pass `mode: "auto"` — it overrides user-level settings.

## Shared-Directory Fallback Constraints

When worktree isolation is unavailable (non-Claude Code harnesses, explicit opt-out):

- Instruct each sub-agent: **"Do not stage files (`git add`), create commits, or run the project test suite. The orchestrator handles testing, staging, and committing after all parallel units complete."**
- These constraints prevent git index contention and test interference.

## Post-Batch Merge Flow (Worktree-Isolated Mode)

After all parallel sub-agents in a batch complete:

1. Wait for every sub-agent in the current batch to finish.
2. For each completed sub-agent, in dependency order: review the worktree diff against the orchestrator's branch. If the sub-agent did not commit, stage and commit inside that worktree.
3. Merge each sub-agent's branch into the orchestrator's branch sequentially in dependency order.
   - **On merge conflict:** abort (`git merge --abort`) and re-dispatch the conflicting unit serially against the now-merged tree. Hand-resolving silently picks a side and discards one unit's intent.
4. After each merge, run the relevant test suite. If tests fail, diagnose and fix before merging the next branch.
5. Update the task list (progress is carried by merge commits, not plan edits).
6. After merging, clean up the sub-agent's worktree:
   ```bash
   git worktree unlock <absolute-path>
   git worktree remove <absolute-path>
   git branch -d <branch-name>   # -d refuses to delete unmerged; investigate if it fails
   ```
7. Dispatch the next independent batch, or the next dependent unit.

## Post-Batch Flow (Shared-Directory Fallback)

After all parallel sub-agents complete:

1. Wait for every sub-agent in the current batch to finish before acting on any results.
2. Cross-check for discovered file collisions: compare actual files modified (not just declared `Files:` lists). If 2+ sub-agents modified the same file, only the last writer's version survives — commit non-colliding files first, then re-run the affected units serially.
3. For each completed unit, in dependency order: review diff, run tests, stage only that unit's files, and commit.
4. Update the task list.

## Model Routing for Sub-Agents

Assign model tiers before dispatch. See `references/model-routing.md` for the full decision algorithm.

| Sub-agent role | Default tier | Model |
|---|---|---|
| Exploration / file reads | Tier 1 | `haiku` |
| Implementation | Tier 2 | `sonnet` |
| Reviewer / security / architecture | Tier 2–3 | `sonnet` or `opus` |
| Verifier | Tier 2 | `sonnet` |

Omit `model` to inherit the caller's tier. Specify it explicitly when the task has a clear complexity classification.

## Team-of-Agents Patterns

### Standard Feature Team

For a new feature spanning multiple domains:

```
Controller
├── Architect agent     → reads codebase, produces change plan and interface contracts
├── Backend agent       → implements server-side slice per contracts
├── Frontend agent      → implements UI slice per contracts
└── Reviewer agent      → independent spec + risk review of combined diff
```

Controller integrates outputs, resolves conflicts, and runs the final verification gate.

### Investigation Team

For debugging an unknown failure:

```
Controller
├── Log/trace agent     → inspects observability signals and CI output
├── Code-path agent     → traces the execution path through source
└── Hypothesis agent    → synthesizes findings, proposes root cause and fix
```

Controller evaluates hypotheses, picks one, dispatches a fix, and owns the verification.

### Review-Loop Team

For changes where quality matters more than speed:

```
Controller
├── Implementer agent   → writes code
├── Spec reviewer       → checks implementation against acceptance criteria
└── Risk reviewer       → flags security, performance, and regression risks
```

Neither reviewer "self-reviews" — they receive the diff cold, without implementation context.

### Harness Team (long-running work)

For backlog-style or multi-iteration tasks:

```
Controller (persists across iterations, writes state to disk)
└── Per-iteration: fresh agent with: spec slice + current state file + acceptance criteria
```

Each iteration produces either DONE, DONE_WITH_CONCERNS, BLOCKED, or NEEDS_CONTEXT. The controller reads that output and decides the next action.

## System-Wide Test Check

Before marking any task done, run this check to catch hidden side-effects. Skip only for leaf-node changes with no callbacks, no state persistence, no parallel interfaces.

| Question | What to do |
|----------|------------|
| **What fires when this runs?** Callbacks, middleware, observers, event handlers — trace two levels out from your change | Read the actual code (not docs) for callbacks on models you touch, middleware in the request chain, `after_*` hooks |
| **Do tests exercise the real chain?** If every dependency is mocked, the test proves logic works *in isolation* only | Write at least one integration test that uses real objects through the full callback/middleware chain |
| **Can failure leave orphaned state?** If code persists state before calling an external service, what happens when the service fails? Does retry create duplicates? | Trace the failure path with real objects. If state is created before the risky call, test that failure cleans up or that retry is idempotent |
| **What other interfaces expose this?** Mixins, DSLs, alternative entry points (CLI vs API vs agent) | Grep for the method/behavior in related classes. If parity is needed, add it now |
| **Do error strategies align across layers?** Retry middleware + application fallback + framework error handling — do they conflict or create double execution? | List specific error classes at each layer; verify rescue list matches what the lower layer actually raises |

**When this matters most:** any change touching models with callbacks, error handling with fallback/retry, or functionality exposed through multiple interfaces.

## Good Reasons to Split Work

- backend and frontend changes are largely independent
- several failures live in unrelated files or subsystems
- a role split helps quality: implementer, spec reviewer, code reviewer
- the repo is large enough that parallel exploration saves time

## Bad Reasons to Split Work

- the tasks edit the same files
- one fix changes the assumptions of the others
- you have not yet understood the architecture
- the prompt to the subagent would just be “figure it out”

## Human on the Loop

Do not let the worker decide the overall strategy.

- the controller chooses when to continue, stop, or rescope
- the controller decides whether a failure means “fix again” or “task definition was wrong”
- the controller owns the blast radius when permissions, secrets, or destructive actions are involved

## Continuous Execution in Single-Session Plans

When executing a plan inside a single session, do not pause between tasks to report progress or ask for permission to continue. Execute all tasks without stopping unless:

- A subagent returns `BLOCKED` and you cannot resolve it
- Genuine ambiguity prevents starting the next task
- All tasks are complete

Mid-plan check-ins waste the user's time — they delegated plan execution to you. Progress summaries (“I've completed Task 2, shall I continue?”) are noise. The only communication is at the end or when blocked.

## Controller Responsibilities

Before dispatching, provide each subagent:

- the exact scope
- the acceptance criteria or spec excerpt
- relevant files and commands
- constraints such as “do not touch unrelated files”
- the format of the expected result

After dispatching:

- review what came back
- check for overlapping edits
- verify claims independently
- integrate in a deterministic order

## Builder and Reviewer Split

When quality matters more than raw speed, split implementation from review.

- builder brief: task slice, existing patterns, relevant files, and verification commands
- reviewer brief: spec excerpt, rejection criteria, verification expectations, and expected findings format

The reviewer should return either explicit findings or an explicit pass. Do not blur those roles into one vague “take a look” prompt.

## Two-Stage Review for Subagent-Driven Work

For implementations dispatched to subagents, use a mandatory two-stage review before marking any task complete:

**Stage 1 — Spec compliance review** (always first):
- Did the implementer build everything that was requested?
- Did they build anything that was NOT requested?
- Do not trust the implementer's self-report — read the actual code.
- Until the spec review passes, do not proceed to stage 2.

**Stage 2 — Code quality review** (only after stage 1 passes):
- Correctness, naming, structure, test quality, debt introduced
- Use the P0–P3 severity scale from [reviews-and-comments.md](./reviews-and-comments.md)

Use the concrete prompt templates in [subagent-prompt-templates.md](./subagent-prompt-templates.md).

### Review Resubmit Loop

When a reviewer (stage 1 or stage 2) returns findings:

1. The **implementer fixes** the identified issues.
2. The implementer **resubmits** the fixed diff to the **same stage** reviewer (not skipping to the next stage or back to the controller).
3. The reviewer re-checks only the flagged items unless the diff is large enough to warrant a fresh full pass.
4. Only after a reviewer returns an explicit pass does the controller advance to the next stage or to integration.

Do not let unresolved review findings reach the controller by assuming they were addressed. The reviewer's confirmation is the gate.

### Implementer Status Handling

Implementer subagents should report one of four statuses. Handle each specifically:

| Status | Meaning | Action |
|--------|---------|--------|
| `DONE` | Work complete, no concerns | Proceed to spec compliance review |
| `DONE_WITH_CONCERNS` | Work complete but implementer flagged doubts | Read concerns first. If they touch correctness or scope, address before review. If observational, note and proceed. |
| `NEEDS_CONTEXT` | Information not provided was needed | Provide missing context and re-dispatch |
| `BLOCKED` | Cannot complete the task | Assess: context gap → provide more and re-dispatch; needs more reasoning → re-dispatch with stronger model; task too large → break smaller; plan is wrong → escalate to user |

Never ignore an escalation or force the same model to retry without changes. If the implementer said it is stuck, something must change.

## Parallel Investigation Pattern

Parallelize exploration when the domains are independent. Typical split:

- one agent maps architecture
- one agent inspects tests or failure modes
- one agent inspects observability or CI logs

Parallelize implementation only when the agents will not race on shared files or shared generated artifacts.

## Review Loops

For large tasks, a strong pattern is:

1. implementer agent
2. spec or behavior review
3. code quality or risk review
4. controller integrates and verifies

Do not let “self-review” replace independent review.

## Skill Routing

If local skills exist, use them as specialists. Typical combinations:

- `create-plan` for formal planning
- `architecture-advisor` for mapping dependencies
- `test-assistant` for tests
- `gh-address-comments` or `gh-fix-ci` for GitHub workflows
- frontend-specific design or refactor skills when the task is UI-heavy
