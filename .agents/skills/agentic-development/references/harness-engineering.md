# Harness Engineering

Use this reference when the user asks to improve agent autonomy, audit repo readiness for coding agents, reduce repeated agent mistakes, or turn documented conventions into enforceable feedback loops.

Core idea: humans steer, agents execute. When an agent fails, do not default to "try harder." Ask what capability, context, enforcement, or feedback loop is missing, then encode that improvement in the repository.

## Audit Dimensions

Score the repo against these dimensions before prescribing changes:

| Dimension | What good looks like |
|---|---|
| Context architecture | Root `AGENTS.md`/`CLAUDE.md` is a short map, roughly 100 lines, pointing to versioned docs instead of embedding a manual. |
| Execution harness | Timeouts, token budgets, stall/loop detection, HITL escalation, trace integrity, and signal telemetry are implemented and tested. |
| Subsystem guidance | High-risk areas have local `AGENTS.md`, `ARCHITECTURE.md`, or README files with protocols, invariants, anti-patterns, debug steps, and required skills. |
| Mechanical enforcement | Layer boundaries, file size, naming, logging, schema validation, doc links, and tool-spec completeness are checked by linters, structural tests, or CI. |
| CI feedback | Feature-branch CI runs the checks agents need: lint, typecheck, tests, build, cycles/import boundaries, i18n/schema checks, and machine-readable failure output. |
| Tests and evals | Unit/integration/e2e tests cover code behavior; evals cover agent behavior, tool-call quality, golden interactions, and harness correctness. |
| Observability | Logs, metrics, traces, DOM snapshots, screenshots, and runtime errors are queryable by agents with stable correlation ids. |
| Persistent knowledge | Research, lessons, regressions, friction, plans, and runbooks live in repo-local docs and are updated after non-obvious fixes or repeated mistakes. |
| Continuous quality | Background or scheduled tasks scan for drift, stale docs, oversized files, missing tests, architecture violations, and small refactoring opportunities. |
| Agent legibility | Tools, schemas, errors, command output, and docs are boring, structured, inspectable, and easy for agents to validate directly. |
| Docs reliability | Documented setup, run, and verify commands are verified to actually work against the current repo state. Instructions that rot silently are worse than no instructions. |
| Startup reliability | The repo can be bootstrapped by an agent from cold (no prior context, clean machine) without human intervention. Failure points are scripted away or documented with exact error messages and fixes. |
| Validation efficiency | Agents can verify their own changes using fast, local, binary gates — without needing CI roundtrips or excessive looping. Verification is self-contained and returns within a predictable time budget. |

## Fast Audit Procedure

1. Run `python <skill-dir>/scripts/repo_scan.py <repo-root>`.
2. Run `python <skill-dir>/scripts/harness_audit.py <repo-root>` for a first-pass readiness report.
3. Read the root instruction file and only the referenced docs that govern the target area.
4. Inspect CI workflows and local verify commands. Identify which important checks exist but are not wired into CI.
5. Inspect high-risk subsystem folders for local guidance and tests.
6. Produce findings as P0/P1/P2 items, with file paths and concrete enforcement proposals.

Use the script as evidence, not as authority. Confirm important claims by reading the relevant files.

## Agent-Native Architecture Audit (AI Products)

For repos that ship AI-powered features — MCP servers, agent loops, chat interfaces, or autonomous tools — run a complementary agent-native audit in addition to the standard harness audit above.

The agent-native audit scores the system against eight principles using 8 parallel sub-agents:

1. **Action Parity** — agent can do everything the user can do
2. **Tools as Primitives** — tools provide capability, not encoded behavior
3. **Context Injection** — system prompt carries dynamic app state
4. **Shared Workspace** — agent and user work in the same data space
5. **CRUD Completeness** — every entity has full create/read/update/delete
6. **UI Integration** — agent actions are immediately reflected in UI
7. **Capability Discovery** — users can discover what the agent can do
8. **Prompt-Native Features** — features are defined in prompts, not code

Use the `agent-native-auditor` bundled agent (see `references/agents/agent-native-auditor.md`) to run all 8 in parallel and produce a scored report.

For principle definitions, anti-patterns, and success criteria, read `references/agent-native-architecture.md`.

**When to run this audit:** Before shipping a new agent-facing API, before extending autonomous capabilities, or when agents repeatedly fail to accomplish tasks users can do through the UI.

## Improvement Patterns

### 1. AGENTS.md as Map

Keep always-loaded instruction files short and operational:

```markdown
# Project Agent Map

## Objective
[One paragraph: what the repo builds and how agents should work.]

## Required Reading
- Backend architecture: docs/references/backend-architecture.md
- Testing: docs/references/testing.md
- CI: docs/references/ci.md
- Product context: docs/references/product-context.md

## Commands
- Setup: ...
- Verify: ...

## Boundaries
- Always: ...
- Ask: ...
- Never: ...
```

Move detailed command lists, architecture guides, style rules, serializer patterns, logging policy, and workflow manuals into referenced files. Add a CI check that every referenced doc path exists.

### 2. Subsystem AGENTS.md

Add local guidance where inference is risky: auth/session, AI/streaming, realtime/websocket, conversation/chat, canvas/collaboration, API transport, worker queues, billing, security-sensitive services, and shared component systems.

Template:

```markdown
# [Subsystem] Agent Guide

## Interface / Protocol
[Inputs, outputs, state machine, callbacks, request format.]

## Critical Rules
- ...

## Anti-Patterns
- Bad: ...
- Good: ...

## Debugging
- Logs/traces/flags/tools to inspect.

## Required Skills
- ../path/to/relevant/skill

## Living Update Protocol
Update this file when repeated work exposes a missing invariant.
```

### 3. Execution Harness Integrity

Before adjusting prompts or agent instructions, verify the harness is working correctly. A mis-configured harness silently drops failures, produces bad trace IDs, or fires HITL at the wrong threshold.

Key checks:

- **Signal telemetry**: emit structured metrics when each harness signal fires (`ABORT`, `STALL`, `INJECT`, `VERIFY`, `PAUSE_HITL`). Track counts by agent type and time window. Without signal counts, harness tuning is guesswork.
- **Trace integrity**: use SDK utilities to generate trace IDs — never hand-roll UUIDs. Raw UUIDs (e.g. `550e8400-e29b-...`) are silently rejected by trace exporters because they expect the `trace_<32hex>` format. Use `gen_trace_id()` from the SDK. Pass `group_id=thread_id or None`, not empty string.
- **Long-run budgets**: document which agent types require extended run limits and set per-agent timeout overrides in harness config. The default timeout is designed for short tasks; document processing, multi-agent pipelines, and long research tasks require explicit overrides.
- **HITL escalation gates**: define confidence thresholds explicitly. Low-confidence gates should escalate to human review rather than silently degrade output quality.
- **Harness evals**: add unit tests verifying the harness fires correctly — stall detector triggers, semantic loop detection works, HITL escalates at the right threshold. These are harness correctness tests, not agent behavior evals.

### 4. Enforce Architecture

Promote repeated review comments into checks:

- Structural tests for import direction and forbidden dependencies.
- ESLint boundaries, import-linter, custom AST checks, or repo-specific scripts.
- File-size warnings near 200 lines and hard gates near 500 lines where the repo agrees.
- Logging and error-shape checks for service boundaries and `except`/`catch` blocks.
- Schema/type validation at external boundaries.
- Tool-spec completeness checks for agent-callable tools.

Documentation can describe the rule; CI should reject or report the violation.

**Layer model template** (adapt to repo's actual layer names):

```
Types → Config → Repo → Service → Runtime → UI
```

Enforce direction via structural tests:

```python
# tests/unit/structural/test_layer_boundaries.py
import ast, pathlib

FORBIDDEN = [
    ("services/ai", "api/views"),      # service layer must not import view layer
    ("services/ai", "users/views"),
]

def test_no_forbidden_imports():
    for source_prefix, forbidden_prefix in FORBIDDEN:
        for path in pathlib.Path(source_prefix).rglob("*.py"):
            tree = ast.parse(path.read_text())
            for node in ast.walk(tree):
                if isinstance(node, (ast.Import, ast.ImportFrom)):
                    name = getattr(node, "module", "") or ""
                    assert forbidden_prefix.replace("/", ".") not in name, \
                        f"{path} imports from forbidden layer {forbidden_prefix}"
```

Tighten lint suppressions incrementally: apply stricter rules to new files via `[tool.ruff.lint.per-file-ignores]` before enforcing globally.

### 5. Close CI Feedback Loops

Feature branches are where agents work, so they need fast signals there:

- lint, typecheck, focused tests, and build where cost allows
- circular dependency or import-boundary checks
- i18n/schema/generated-artifact checks
- migration drift checks for backend repos
- coverage thresholds scoped to high-risk agent/harness code before legacy global thresholds
- structured failure output with path, line, rule, and remediation hint

Prefer minimal blocking gates plus high-signal warnings over slow, noisy pipelines.

**PR size gate**: add a non-blocking CI step that warns when a PR exceeds 500 lines. Short-lived PRs are easier for agents and reviewers to validate.

### 6. Add Evals for Agent Behavior

Tests prove code; evals prove agent-facing behavior. Start with a small golden set:

- prompt → expected tool call sequence → expected response envelope
- harness behavior: timeout, stall detection, semantic loop detection, HITL escalation
- review behavior: known good PRs and expected P0/P1 findings
- frontend journeys: DOM/screenshot before and after key user paths

**Per-domain coverage thresholds**: set higher thresholds for agent/harness code (e.g. 70%) before tackling the global legacy threshold (e.g. 50%). Use `.coveragerc` section overrides or per-directory markers.

**Worktree isolation**: for repos where agents run against a live stack, script per-worktree app instances:

```bash
# scripts/agent-worktree-up.sh
BRANCH=$(git rev-parse --abbrev-ref HEAD)
DB_NAME="app_worktree_${BRANCH//\//_}"
REDIS_PREFIX="worktree:${BRANCH//\//_}"
git worktree add .worktrees/$BRANCH $BRANCH
export DATABASE_URL="postgres://localhost/$DB_NAME"
export CACHE_PREFIX="$REDIS_PREFIX"
createdb $DB_NAME && python manage.py migrate
```

Run expensive evals on schedules or when prompts/tool specs/harness config changes.

### 7. Make Observability Agent-Legible

Expose the signals agents need to debug without a human:

- query tools or runbooks for logs, metrics, traces, Sentry, and deployment events
- stable request/run/thread/trace ids across logs and spans
- frontend debug flags with consistent tags and request ids
- worktree-local app instances with isolated DB/cache namespaces when possible
- browser/DOM/screenshot workflows for UI reproduction and validation

**Agent-callable query tools**: add tools agents can invoke mid-run to investigate their own failures:

```python
# Example: query_system_logs(thread_id, error_type, since_minutes=60)
# Example: query_agent_metrics(agent_type, signal_type, since_hours=24)
# Example: get_trace_summary(trace_id)  — backed by trace API
```

Agents should be able to answer "what failed, where, and after which change?" from repo tools and documented commands.

### 8. Persist Learning on Disk

Use repo-local files, not chat history, as the system of record:

- `docs/solutions/` — structured per-solution files with YAML frontmatter; preferred for any learning that should be searchable by future agents (see `references/institutional-learnings.md`)
- `docs/research/YYYY-MM-DD-topic.md` for subsystem investigations
- `docs/lessons/YYYY-MM-DD-topic.md` for prose notes where speed matters more than structure
- `docs/runbooks/agent-debugging.md` for common diagnostic paths
- `docs/references/product-context.md` when product docs are external or symlinked outside the repo

At session end, ask whether a finding should become a `docs/solutions/` entry, a lesson, an instruction update, or a mechanical check.

**Prefer `docs/solutions/` over `docs/lessons/`**: YAML frontmatter in `docs/solutions/` enables grep-first search across hundreds of files without reading them into context. A plain prose lesson in `docs/lessons/` is invisible to an agent that hasn't read it. See `references/institutional-learnings.md` for the full capture workflow and schema.

### 8b. Scratch Space Discipline

When an agent or skill writes intermediate files, checkpoints, or delegation state during a harness run, it must follow the scratch space hierarchy to avoid polluting the repo and to make state discoverable by sibling agents:

- **Per-run throwaway**: `mktemp -d -t prefix-XXXXXX` — OS handles cleanup.
- **Cross-invocation reusable**: stable path `/tmp/agentic-dev/<skill>/<run-id>/` — so later invocations can discover prior run-ids.
- **Exception — `.context/`**: only when the artifact is repo+branch-inseparable AND user-curated or path-is-core-UX.
- **Durable outputs**: always `docs/` or another tracked location.

See `references/scratch-space.md` for the full decision tree and examples.

### 9a. Deslop Pass

AI-assisted development accumulates artifacts that make the repo harder for the next agent and the next human to work with. Run a deslop pass before PR submission, after a long dev-loop, or as part of the continuous quality step.

Items to remove or reduce:
- Multi-paragraph docstrings explaining what the code obviously does (one-line summaries are fine)
- Inline comments narrating logic step-by-step in non-surprising code
- Premature helpers: functions with a single call site that add no reusability
- Defensive no-op error handling at internal boundaries (`try { ... } catch { /* ignore */ }`)
- Scaffolding comments left over from generation ("Step 1: ...", "TODO: implement this")
- Inconsistent naming conventions introduced across a single PR (pick one and apply it)

Run deslop as a named step, not a vague "polish the code" instruction:
```bash
# Example deslop check — adapt to repo stack
rg 'TODO|FIXME|HACK|Step [0-9]' --type ts --type py -l  # flag leftover scaffolding
```

Wire into the loop with `--verify-cmd` to block premature completion when scaffolding remains.

### 9. Continuous Quality

Replace large cleanup pushes with recurring small maintenance:

- doc-gardening tasks that find stale links and docs mismatched to code
- architecture drift scans that open issues or PRs
- oversized-file reports
- missing-test or missing-eval reports for changed critical paths
- quality score documents by product domain or architectural layer

Prefer small, reviewable, automatable PRs over broad refactors.

**GarbageCollectionAgent** (run weekly via scheduler):

```
Scan services/ for files > 500 lines → open refactoring task
Scan except blocks without log_error in services/ → flag for standardization
Scan docs/daily/ for entries > 90 days old referencing files that no longer exist → flag stale links
Emit a quality-score diff vs. last week
```

**DocGardeningAgent** (run after each merged PR):

```
Check if changed files have corresponding service docs (README.md, ARCHITECTURE.md)
Check if today's daily log has an entry for the changed service
Check if AGENTS.md references that now have a broken path
Open a follow-up task or PR if gaps found
```

Wire existing auto-improve skills to scheduled tasks by invoking the skill from a cron or CI schedule step rather than only from chat.

### 10. Agent Legibility

Make everything agents work with boring, structured, and directly inspectable:

- **Tool spec completeness as CI gate**: enforce in CI that every agent-callable tool has a machine-readable spec (intent, parameters, returns, errors). Make legibility a hard gate, not a convention. Example: `python -c "from lib.registries.agent_tools import ALL_TOOLS; [t.validate() for t in ALL_TOOLS]"`.
- **Standard response envelope**: use a consistent `{"status": "success"|"error", "data": ..., "meta": ...}` wrapper across all agent tools. Agents should not need to handle wildly different response shapes.
- **Boring abstractions**: favor well-documented, stable APIs with strong training data representation over clever wrappers. Agents can validate and modify what they can read end-to-end.
- **Progressive disclosure in instruction files**: Level 1 (always loaded) = metadata only (~100 words). Level 2 (on trigger) = core procedure (<5k words). Level 3 (as needed) = detailed references. Do not collapse all three levels into the always-loaded file.

### 11. Docs Reliability

Documented instructions that silently rot are a leading cause of agent failure at session start.

Audit procedure:
1. Extract every command from `README.md`, `AGENTS.md`, `CLAUDE.md`, and subsystem docs.
2. Run each command in a clean shell (no prior env state). Record which fail, which succeed with wrong output, and which have undocumented prerequisites.
3. Fix broken commands or annotate with known prerequisite state.

Add a CI step that dry-runs the setup sequence (or asserts that referenced files exist):

```yaml
# .github/workflows/docs-check.yml
- name: Verify documented commands exist
  run: |
    # Assert referenced files in AGENTS.md exist
    grep -oP '\`[^`]+\`' AGENTS.md | while read cmd; do
      echo "Found: $cmd"
    done
    # Verify key setup commands are on PATH
    command -v npm && command -v python3
```

Run a `docs-reliability-review` pass after any significant change to setup or dev workflow:
- Simulate cold-start: open a new terminal, follow instructions literally
- Record every point where inference was needed (a gap in the docs)
- Fix or add a comment

### 12. Startup Reliability

An agent starting a new session should reach a working state without human guidance.

Script the cold-start sequence into a single command:

```bash
# scripts/bootstrap.sh — idempotent, works from a clean checkout
set -euo pipefail
command -v node || { echo "ERROR: node required. Install from nodejs.org"; exit 1; }
npm ci
cp -n .env.example .env 2>/dev/null || true
npm run db:migrate 2>/dev/null || true
echo "Bootstrap complete. Run: npm run dev"
```

In the root instruction file, reference this script as the canonical startup path. Log common cold-start failures in a `docs/runbooks/cold-start.md` file with exact error messages and fixes.

Audit checklist:
- [ ] One command bootstraps the project from a clean checkout
- [ ] Missing environment variables emit a clear error (not a cryptic crash)
- [ ] The instruction file names the bootstrap script
- [ ] Common startup failures are documented with error text and fix steps

### 13. Local-First Verification Harnesses

Agents that rely solely on CI for verification loop slowly. Local harnesses let agents check their own work within seconds.

**Control-CLI harness** — for verifying command-line tool behavior:

```bash
# scripts/control-cli-harness.sh
# Run the CLI against a fixture and assert on stdout/stderr/exit code
set -euo pipefail
ACTUAL=$(./bin/mycli process fixtures/input.json 2>&1)
EXPECTED="processed 42 items"
echo "$ACTUAL" | grep -q "$EXPECTED" || {
  echo "FAIL: expected '$EXPECTED' in output"
  echo "Got: $ACTUAL"
  exit 1
}
echo "PASS"
```

**Control-UI harness** — for verifying browser behavior (requires Playwright or CDP):

```bash
# scripts/control-ui-harness.sh
# Start the app, navigate to a path, assert on DOM snapshot or screenshot
npx playwright test --reporter=line tests/smoke.spec.ts
```

Wire these harnesses as `--verify-cmd` in the dev loop so agents can self-correct:

```
/dev-loop Fix the pagination bug --verify-cmd 'bash scripts/control-cli-harness.sh' --completion-promise 'DONE'
```

The key property: harnesses must be binary (pass/fail) and locally runnable without network access or CI infra.

### 14. Compatibility Scan (Orchestrated Pass)

Run a four-subagent compatibility pass to get a structured readiness score before extending agent autonomy on a repo. Each subagent has a focused scope and returns a pass/fail with findings.

| Subagent | Scope | Pass criterion |
|---|---|---|
| `compatibility-scan-review` | Score all 13 audit dimensions, identify P0/P1/P2 items | Outputs structured finding list |
| `docs-reliability-review` | Extract every setup/run command from docs; verify each in a clean shell | No undocumented prerequisites; all commands succeed |
| `startup-review` | Bootstrap the repo cold (no prior context); record every manual step required | Reaches working state with one documented command |
| `validation-review` | Identify if agents can verify their own changes locally without CI roundtrip | Binary local gate exists and runs in < 60s |

Invoke all four via the `check-agent-compat` agent or run them individually as needed. The `compatibility-scan-review` runs first; its findings prioritize which of the other three to run.

Wire the orchestration command:
```
/check-agent-compat [repo-root]
```

**Scoring formula:**

```
workflow_score     = average(startup_score, validation_score, docs_reliability_score)
agent_compat_score = round((deterministic_score × 0.7) + (workflow_score × 0.3))
```

Deterministic score: structural/mechanical signals from the harness audit (13 dimensions). Workflow score: behavioral checks from startup, validation, and docs reliability reviews. The 70/30 split reflects that structural signals are more reliably measured than behavioral ones.

**Output format:** Present one level-2 heading showing the final score, followed by a single "Top fixes" list ordered by workflow impact. Omit sub-scores and computational details unless requested. Treat mostly-functional repos as "good-with-friction" — do not penalize for log noise or rough error messages that do not block agent workflows.

### 15. CI Watcher

For branches with active CI, run a background watcher that monitors the PR checks and reports on completion. This prevents agents from polling CI unnecessarily or missing failures.

Watcher pattern:
```bash
# scripts/ci-watcher.sh — poll current branch CI status
BRANCH=$(git rev-parse --abbrev-ref HEAD)
PR=$(gh pr view --json statusCheckRollup --jq '.statusCheckRollup' 2>/dev/null)
if [ -z "$PR" ]; then echo "No open PR for branch $BRANCH"; exit 0; fi
gh pr checks --watch --fail-fast 2>&1
```

The `ci-watcher` agent (see `references/agents/ci-watcher.yaml`) runs this pattern and reports:
- Which checks failed, with direct log links
- Which checks are still running (ETA if available from CI)
- Whether a re-run is warranted (flaky vs. real failure)

Use the ci-watcher in the `/fix-ci` command flow: watch → identify → fix → re-watch.

### 16. Scratch Space Discipline

Agents produce intermediate artifacts — captured screenshots, delegation prompts, session results, optimization logs, per-run checkpoints. Where those artifacts live determines whether they survive, stay discoverable, and don't pollute the repo.

**Tier 1 — OS temp (per-run throwaway):**
```bash
SCRATCH=$(mktemp -d -t <prefix>-XXXXXX)
```
Use for files consumed once and discarded: screenshots, stitched GIFs, intermediate build outputs, single-run delegation results. The OS handles cleanup. Paths are opaque under `$TMPDIR`/`/var/folders/...` — that is appropriate for throwaway files users don't need to access.

**Tier 2 — Stable `/tmp` prefix (cross-invocation reusable):**
```
/tmp/<skill-name>/<run-id>/
```
Use `/tmp` directly rather than `$TMPDIR` — `/tmp` is user-accessible on macOS (symlink to `/private/tmp`) and Linux. Use when later invocations of the same skill need to discover sibling run-ids: caches keyed by session, checkpoints that survive context compaction, state where later runs must locate prior outputs.

**Exception — `.context/` (repo-bound, user-curated):**
Use only when the artifact is genuinely bound to the CWD repo AND meets at least one of:
- (a) **User-curated**: the user will inspect, manipulate, or curate the artifact outside the skill
- (b) **Repo+branch-inseparable**: the artifact's meaning is inseparable from this specific branch (e.g., branch-specific resume state)
- (c) **Path is core UX**: surfacing the path is part of the skill's output and easier to communicate as a repo-relative location

Namespace under `.context/<skill-name>/`, add a per-run subdirectory when concurrent runs are plausible, add `.context/` to `.gitignore`.

**Durable outputs** (plans, specs, learnings, docs, final deliverables) belong in `docs/` or another repo-tracked location — not in any scratch tier.

"Shared between skills" is not sufficient reason for `.context/` — the stable `/tmp` prefix handles cross-skill coordination equally well.

## Prioritization

Use this order unless the repo has a more urgent production risk:

1. P0: shrink monolithic always-loaded instructions into a map.
2. P1: wire existing checks into CI and add structural boundary tests for the most important layer rule.
3. P1: add subsystem `AGENTS.md` files for the riskiest undocumented areas.
4. P1: add initial evals for agent/harness behavior.
5. P1: verify execution harness signal telemetry and trace integrity.
6. P1: add tool spec completeness check as a CI gate.
7. P1: verify documented setup/run commands actually work (docs reliability audit) — broken setup docs silently prevent all agent work.
8. P1: script a single bootstrap command and document common cold-start failures (startup reliability).
9. P2: add local-first verification harnesses (control-cli, control-ui) so agents can verify changes without CI roundtrips.
10. P2: expose logs, metrics, traces, and runtime errors through agent-readable tools or runbooks.
11. P2: establish research, lessons, and session-end protocols.
12. P2: add background doc-gardening and architecture drift checks (GarbageCollectionAgent, DocGardeningAgent).
13. P3: script per-worktree app/DB/cache isolation for agent runs.
14. P3: raise per-domain coverage thresholds for agent/harness code before tackling legacy global threshold.

## Finish Criteria

A harness improvement is not done until:

- the repo can explain the new rule through a short map or local subsystem doc
- the rule is enforced by a command, lint, test, CI job, hook, or scheduled check when enforcement is practical
- the verification command has been run or the unrun command is named
- any follow-up that cannot be automated is captured in a plan, issue, or documented risk
