# Harness Loops

A harness loop is not "let the agent run forever." It is supervised repeated execution with fresh context, disk-backed state, and hard backpressure.

## Loop Tooling

This skill ships two commands for in-session loops, both built on the Ralph Wiggum stop-hook pattern.

### `/dev-loop` — general agentic development loop

```
/dev-loop TASK [--max-iterations N] [--completion-promise TEXT] [--verify-cmd CMD] [--spec-file PATH]
```

How it works:
1. Creates `.claude/agentic-dev-loop.local.md` — a YAML-frontmatter state file storing iteration count, max limit, completion promise, and the full task prompt.
2. Each time you try to exit, the stop hook (`hooks/check-completion.sh`) reads the state file, parses the JSONL transcript to extract the last assistant message, and checks for `<promise>COMPLETION_PROMISE</promise>` in that message.
3. If the promise is found (and matches exactly), the loop exits cleanly. Otherwise, the hook re-injects the original task prompt via `decision: "block", reason: <prompt>` along with a `systemMessage` showing the current iteration counter.
4. Files and git history persist across iterations, so each iteration builds on the last.

Cancel at any time with `/cancel-dev-loop`.

### `/harness-loop` — focused harness engineering pass

```
/harness-loop [repo-root] [--max-iterations N]
```

A specialized variant that wires `harness_audit.py` as the `--verify-cmd`. Each iteration audits the repo, enforces the highest-priority P0/P1 finding, and commits. Stops when the audit reports no P0 or P1 items.

### State file schema

`.claude/agentic-dev-loop.local.md`:

```markdown
---
active: true
iteration: 1
max_iterations: 20
completion_promise: "DONE"
verify_cmd: "npm test"
spec_file: "TASK.md"
started_at: "2025-01-01T00:00:00Z"
---

[task prompt re-injected each iteration]
```

The stop hook updates only the `iteration:` line atomically on each pass.

### Completion promise pattern

Signal loop completion by outputting a `<promise>` XML tag in your response:

```
<promise>DONE</promise>
```

The stop hook uses `perl` for reliable multiline extraction and literal string matching (`=` not `==`) to avoid glob interpretation of special characters in the promise text.

### Safety

- Always set `--max-iterations` as a safety net. The loop runs indefinitely without it.
- Use `--verify-cmd` to make the loop self-correcting: the agent must pass the gate before it can declare completion.
- The `--spec-file` option re-reads the spec each iteration, preventing context drift after compaction.

Use it when iteration helps throughput. Do not use it as a substitute for missing specs, weak verification, or human judgment.

## Use Harness Mode When

- the work can be reduced to one independently provable task at a time
- a spec, checklist, or prioritized progress file already exists on disk
- the repo has reliable commands for lint, typecheck, tests, build, or equivalent checks
- the change can run in an isolated branch, worktree, sandbox, or ephemeral environment
- a human supervisor can inspect outcomes and stop, rescope, or tighten the guardrails

## Avoid Harness Mode When

- product behavior is still ambiguous
- the next step depends on new human judgment every iteration
- the gates are noisy, warn-only, flaky, or missing
- the task changes secrets, auth, infra, migrations, or destructive operations without explicit approval
- multiple loops would race on the same files, generated artifacts, or deployment target

## Persistent Artifacts

Keep state on disk, not in a huge running transcript.

Useful artifacts:

- a short spec with acceptance criteria and test requirements
- a plan when the repo or user wants one
- a progress file or implementation checklist that tracks the next highest-priority item
- structured review findings for the next iteration

Prefer a compact index that points to deeper docs over pasting full reference material into every loop.

## Restore Point Before Major Passes

Before starting any significant automated pass (long dev-loop, harness-loop, autoplan pipeline), snapshot the current state so it can be recovered if the pass goes wrong:

```bash
BRANCH=$(git rev-parse --abbrev-ref HEAD | tr '/' '-')
DT=$(date +%Y%m%d-%H%M%S)
RESTORE="$STATE_FILE_DIR/restore-${BRANCH}-${DT}.md"
# Write current plan/spec/progress to RESTORE
echo "# Restore point: $DT | branch: $BRANCH" > "$RESTORE"
echo "## Current plan state" >> "$RESTORE"
cat "${SPEC_FILE:-/dev/null}" >> "$RESTORE" 2>/dev/null || true
```

Reference the restore path in the state file (`restore_path: …`). If the loop produces bad output, recover by restoring the plan file and re-invoking.

## Sequential Review Pipeline (Autoplan Mode)

For plans or specs that need a full multi-perspective review without 15-30 interactive questions, run reviews sequentially with auto-decisions:

**Phase order (strict — never parallel):**
1. **CEO / Product** — scope, user value, completeness
2. **Design / UX** — flows, consistency, feasibility
3. **Engineering** — architecture, correctness, risk
4. **DX / Developer Experience** — APIs, docs, tooling, harness

Between each phase, emit a phase-transition summary before starting the next:
```
[PHASE COMPLETE: <name>]
Decisions made: <list mechanical decisions — silent>
Taste decisions: <list for gate review>
User challenges: <stop here if any — surface before proceeding>
Outputs written: <artifact paths>
```

Auto-decide mechanical and taste decisions using [decision-principles.md](./decision-principles.md). Collect taste decisions and present them at a final approval gate after all phases complete. Never auto-decide User Challenges — pause the pipeline and surface them before continuing.

## Loop Recipe

1. Orient once: map instructions, ownership, commands, and git state.
2. Choose one task: pick the single highest-priority item that can be finished and proven in one iteration.
3. Start fresh: begin the iteration with the minimum context needed, usually a short prompt plus pointers to the spec and progress file.
4. Implement narrowly: change only the files required for that one task.
5. Run the proof chain: focused check first, broader gates second if the touched surface justifies them.
6. Record state: update the progress file with what passed, what failed, and what remains next.
7. Review separately: run a reviewer pass or separate agent brief before treating the slice as done.
8. Let the human decide: the supervisor chooses whether to continue, merge, rescope, or stop.

## One Session Per Contract

Each harness iteration should correspond to one task contract. Do not drag unrelated contracts into a shared session.

Long multi-contract sessions produce silent context bleed: information from an earlier contract (its file paths, naming decisions, failure modes) leaks into the context of a later contract and biases or confuses execution. The session that seemed efficient upfront becomes harder to debug and harder to restart cleanly.

Preferred pattern: an orchestration layer spawns a fresh session per contract, passing only what that contract needs as its initial context. Each session terminates cleanly once its contract is fulfilled. This is categorically different from a 24-hour continuous session — even if the wall-clock time is the same, the context boundary is maintained.

**What to keep out of the next session:** previous contract's implementation details, alternative approaches that were considered and rejected, transient error messages, and any state that was only relevant to completing the prior task.

## Context Economy

- Keep always-loaded instruction files terse and operational.
- Use index files, spec summaries, or short task lists to pin context.
- Load detailed references only when a loop actually needs them.
- Prefer quiet commands and focused scopes.
- Shape test or log output so the loop sees failures and decision-useful lines, not pages of passing noise.

## Harness Readiness

Before increasing autonomy, make sure the environment can push back:

- local or CI gates are binary for the claims they protect
- failure output includes file paths, line numbers, rule names, and remediation hints where possible
- logs, metrics, traces, screenshots, or DOM snapshots are reachable by the agent for the workflows it owns
- the app can run in an isolated branch, worktree, sandbox, or ephemeral stack when stateful validation matters
- recurring drift has a scheduled check or background maintenance task instead of relying on memory

If one of these is missing, improve the harness before extending the loop.

## Checkpoint Mode

For long loops where compaction is likely, auto-commit completed logical units as WIP checkpoints. This preserves recoverable state on disk and gives the next context window a clean re-entry point.

Commit format:

```
WIP: <concise description of what changed>

[loop-context]
Decisions: <key choices made this step>
Remaining: <what's left in the current task>
Tried: <failed approaches worth recording>  (omit if none)
Spec: <path to spec/plan file>
[/loop-context]
```

Rules:
- Stage only intentional files — never `git add -A`
- Do not commit broken tests or mid-edit state
- Commit after: new intentional files, completed functions/modules, verified bug fixes, and before long-running commands
- Push only when the task requires it, not automatically
- Do not announce each WIP commit in the session output

After the loop completes, squash WIP commits into one clean commit before opening a PR.

## Context Health

During long-running loops, emit a brief `[PROGRESS]` summary at regular intervals (every 3–5 iterations, or when the direction changes):

```
[PROGRESS]
Done: <list of completed items>
Next: <the single highest-priority remaining item>
Surprises: <anything unexpected that affects the plan>
```

Context health rules:
- If you are looping on the same file, same diagnostic, or same failing fix variant without new information, **stop**. Name the repeated cycle explicitly, reassess, and either escalate to the user or adjust the approach.
- A `[PROGRESS]` summary must never mutate git state.
- Use the summary to confirm understanding before starting a new iteration — this prevents silent assumption-filling after compaction.

## Post-Compaction Recovery Protocol

After context compaction fires, agents lose the conversational thread. The critical failure mode is not forgetting — it is **confident assumption-filling**: the agent reconstructs what "must have been" from fragments and proceeds as if it remembered, producing subtly wrong results that are hard to detect because they look plausible.

**Recovery steps before resuming after any compaction event:**

1. Re-read the active task plan or contract file (the disk-backed artifact for the current iteration).
2. Re-read the primary implementation files touched so far in this iteration.
3. State the current understood goal and next step before writing any code.

Encode this as a rule in CLAUDE.md using the router pattern:

```
After compaction:
  1. Re-read TASK.md (or the active contract)
  2. Re-read the files modified in the current iteration
  3. State your current understanding before proceeding
```

The re-read step is cheap — a few thousand tokens. Skipping it risks hours of work on a subtly incorrect premise. Agents that fill gaps with assumptions produce confident-sounding wrong answers; agents that re-anchor to disk state produce correct ones.

## Hard Backpressure

Gates that decide progress must be pass or fail.

- Warn-only gates can inform humans, but they cannot produce a false green.
- If a repo has no single local verify command, chain the minimum relevant commands explicitly.
- If a gate is unreliable, either harden it before relying on harness mode or mark it non-gating and keep a human in charge.

Repeated flailing usually means one of three things: the task is too large, the spec is weak, or the verification output is too noisy.

## Builder and Reviewer Separation

Builder and reviewer should not share the same brief.

- Builder context: task slice, existing implementation patterns, likely files, and proof commands.
- Reviewer context: acceptance criteria, rejection criteria, verification expectations, and output format.

The reviewer should emit findings or an explicit pass, not silently rewrite the task definition.

For machine-consumable review output, use the structured format described in [reviews-and-comments.md](./reviews-and-comments.md).

## Security and Blast Radius

If harness mode needs broad permissions:

- prefer an isolated or ephemeral environment over a personal workstation
- provide the least privilege secrets needed for the task
- avoid access to private datasets unless the task truly requires them
- assume compromise is possible and shrink the blast radius accordingly

## When to Exit Harness Mode

Switch back to direct execution or a human-led planning pass when:

- the same failure repeats without new information
- the task keeps spilling across unrelated files
- the reviewer keeps finding spec-level ambiguity
- the environment or gates are not trustworthy enough to keep looping
