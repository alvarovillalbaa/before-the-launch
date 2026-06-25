---
name: agentic-development
description: >-
  Use for end-to-end software execution in an unfamiliar or complex repo:
  orienting the codebase, choosing an execution model, planning and verifying
  changes, reviewing architecture or PRs, improving agent-first harnesses, and
  coordinating work across the specialized `frontend` and `backend`
  engineering skills.
argument-hint: "[task type or describe what you need: implement, review, debug, plan, harness, agent-native, orchestrate, release]"
---

# Agentic Development

This skill is the orchestration layer for software engineering work. It owns repo orientation, execution-mode selection, planning, review discipline, verification gates, release flow, cross-domain coordination, and agent-native architecture design.

<intake>
## What do you need?

0. **Brainstorm or design** — explore context, propose 2-3 approaches, get design approval before any code
1. **Implement a feature** — orient, plan, execute, and verify a code change
2. **Debug or investigate** — systematic root-cause investigation, bug reproduction, causal chain tracing
3. **Review** — multi-agent code review, PR feedback, adversarial pass
4. **Plan or architect** — decompose a feature, design a system, choose a tech
5. **Harness improvement** — audit repo agent-readiness, improve CI feedback loops
6. **Agent-native design** — build systems where agents are first-class citizens
7. **Orchestrate at scale** — large tasks across parallel cloud agents
8. **Release or land** — merge, tag, deploy, hotfix flow
9. **Learn or improve** — extract session learnings, update instruction files
10. **Tech debt** — cloud-agent cadences for migrations, dependency updates, flag cleanup, test coverage, error triage

Pick a number or describe what you want. The routing table below maps your answer to the right references.
</intake>

<routing>
| Answer | Read |
|--------|------|
| 0, "brainstorm", "design", "before building", "what should we" | [brainstorming-design-gate.md](./references/brainstorming-design-gate.md) — explore context, one-at-a-time questions, 2-3 approach proposals, design approval gate |
| 1, "implement", "execute", "feature" | Triage input → [subagents-and-parallelism.md](./references/subagents-and-parallelism.md); search learnings → [institutional-learnings.md](./references/institutional-learnings.md); orient → [repo-orientation.md](./references/repo-orientation.md) |
| 2, "debug", "bug", "root cause", "error", "trace" | [debug-investigation.md](./references/debug-investigation.md), then [observability.md](./references/observability.md) for signal sources |
| 3, "review", "PR", "code review" | [reviews-and-comments.md](./references/reviews-and-comments.md) — includes multi-agent persona selection and severity scale |
| 4, "plan", "architect", "design", "system" | Search learnings first → [institutional-learnings.md](./references/institutional-learnings.md); then [prd-to-plan.md](./references/prd-to-plan.md), [system-design-workflows.md](./references/system-design-workflows.md), [architecture-analysis.md](./references/architecture-analysis.md), [codebase-architecture-language.md](./references/codebase-architecture-language.md) |
| 5, "harness", "agent-readiness", "CI", "evals" | [harness-engineering.md](./references/harness-engineering.md) |
| 6, "agent-native", "MCP", "tools", "first-class agents" | [agent-native-architecture.md](./references/agent-native-architecture.md) |
| 7, "orchestrate", "cloud agents", "parallel agents" | [orchestrate-roles.md](./references/orchestrate-roles.md), then `/orchestrate` |
| 8, "release", "merge", "deploy", "hotfix" | [land-and-deploy.md](./references/land-and-deploy.md), [hotfix-procedures.md](./references/hotfix-procedures.md) |
| 9, "learn", "improve", "skill", "memory" | [institutional-learnings.md](./references/institutional-learnings.md) to capture findings; [self-improvement.md](./references/self-improvement.md), [skill-extraction.md](./references/skill-extraction.md) |
| 10, "tech debt", "debt", "migrations", "dependency", "feature flags", "test coverage", "triage", "lint", "anti-pattern" | [tech-debt-cloud-agents.md](./references/tech-debt-cloud-agents.md) — 10 cloud-agent cadences for schedulable debt elimination, including lint-enforced anti-pattern elimination |
</routing>

## Start Here

1. Check the intake above — pick the number that matches your task.
2. Read repo-local instructions before proposing architecture or touching code.
3. Decide the execution mode: direct, subagents, team-of-agents, or supervised loop.
4. Before spawning sub-agents, run the Parallel Safety Check. See [subagents-and-parallelism.md](./references/subagents-and-parallelism.md).
5. Decide the proof path before editing: tests, traces, screenshots, logs, or deploy evidence.
6. Route implementation detail to [`../frontend/SKILL.md`](../frontend/SKILL.md) or [`../backend/SKILL.md`](../backend/SKILL.md).

## Core Rules

- Prefer repo-local instructions over generic advice.
- Extend existing seams instead of creating parallel abstractions.
- Architecture claims need evidence from implemented code and docs.
- Keep research context separate from implementation context.
- One task per loop. If work stretches across iterations, persist state on disk and restart with fresh context.
- Verification gates claims. Do not say fixed, complete, or ready without fresh proof.
- Debugging iron law: no fix without a complete causal chain. "Quick fix for now" is symptom management, not debugging. See [debug-investigation.md](./references/debug-investigation.md).
- Continuous execution: when executing a plan in-session, do not pause for mid-plan check-ins. Stop only on `BLOCKED` or genuine ambiguity. See [subagents-and-parallelism.md](./references/subagents-and-parallelism.md).
- Treat agent failures as harness defects first: ask what capability, context, enforcement, or feedback loop is missing.
- Prefer machine-enforced constraints over prose-only rules when a pattern must hold across the repo.
- Keep always-loaded instruction files as maps and move detailed guidance into repo-local references.
- Report status explicitly: `DONE`, `DONE_WITH_CONCERNS`, `BLOCKED`, or `NEEDS_CONTEXT`.
- Classify autonomous decisions as mechanical (auto-decide silently), taste (auto-decide but surface at gate), or user-challenge (never auto-decide). See [decision-principles.md](./references/decision-principles.md).
- Search before building: check Layer 1 (standard patterns), Layer 2 (popular libraries), and Layer 3 (first principles) before reaching for a new abstraction. See [decision-principles.md](./references/decision-principles.md).
- Use this skill to coordinate frontend/backend work, not to duplicate their detailed guidance.
- When a task becomes domain-heavy, stop bloating this transcript and load [`../frontend/SKILL.md`](../frontend/SKILL.md) or [`../backend/SKILL.md`](../backend/SKILL.md).
- In multi-agent systems: planners own scope and never write code directly; workers execute in isolation and never cross-talk with siblings; information flows upward through structured handoffs, never laterally. See [orchestrate-roles.md](./references/orchestrate-roles.md).

### Decision and Interaction Rules

- **Clarification is the default for strategic decisions.** When an existing pattern exists, apply it with senior judgment. When diverging from the pattern or encountering genuine ambiguity, surface it as a [TASTE] or [USER CHALLENGE] decision rather than guessing silently. Hybrid decisions (apply a pattern + surface the tradeoff) are preferable to pure auto-decide or full pause. See [decision-principles.md](./references/decision-principles.md).
- **Helpers, utilities, hooks, and shared functionality belong in global services.** Before creating a new utility file or module, search for an existing service to extend. If nothing fits, create one global service — not a co-located one-off. This applies across all layers: frontend hooks, backend helpers, API clients, and data transformers.
- **Avoid over-modularity.** Do not create new code files or modules by default. Embed new behavior in the existing service or system that owns the concern. Create a new module only when the concern is genuinely distinct with no current owner — and even then, ask first. Three similar lines in an existing file are better than a new file with one function.
- **Apply staff/principal engineer judgment.** Treat architecture, tech debt, and design decisions as long-term investments. Prefer patterns a senior contributor would find unremarkable over clever abstractions. When you see a design that works but could be improved, surface the improvement as a taste decision rather than silently upgrading it.
- **Companion skills are first-class inputs.** Run companion skills proactively — not as an afterthought. For non-trivial changes: `quality-assurance` before declaring done, `code-documentation` after implementing any public API surface, `autoimprove` or `memory-management` at session end. If the companion skill isn't installed, install it. If it is installed but hasn't run, run it now.
- **Tech debt is parallelizable.** Large-scale migrations, dependency updates, flag cleanup, test-coverage gaps, and error triage are all schedulable cloud-agent work. Design debt-elimination tasks to be autonomous and batched. See [tech-debt-cloud-agents.md](./references/tech-debt-cloud-agents.md).

## Execution Modes

| Scope / Complexity | Default execution model |
|--------------------|-------------------------|
| Small, single proof path | Direct execution |
| Medium, separable concerns | Subagents-driven development |
| Large, cross-domain feature | Team of agents |
| Epic, multi-iteration work | Supervised harness loop |
| Agent-first repo audit or harness improvement | Harness engineering pass |
| Distributed, multi-scope or context-exhausting epic | Cloud orchestration (`/orchestrate`) |

Read [subagents-and-parallelism.md](./references/subagents-and-parallelism.md) for controller/worker patterns, Parallel Safety Check, worktree isolation, git index safety, post-batch merge flow, two-stage review (spec compliance → code quality), implementer status handling (DONE/DONE_WITH_CONCERNS/BLOCKED/NEEDS_CONTEXT), and model routing for sub-agents.

Read [subagent-prompt-templates.md](./references/subagent-prompt-templates.md) for concrete prompt templates: implementer, spec compliance reviewer, and code quality reviewer. Use when dispatching sub-agents to avoid vague prompts.

## General Workflow Router

### Repo orientation and session hygiene

Read [repo-orientation.md](./references/repo-orientation.md) for startup discovery, repo-shape detection, and initial command selection.

Read [instruction-file-design.md](./references/instruction-file-design.md) when structuring or auditing `AGENTS.md`, `CLAUDE.md`, or other instruction surfaces.

Read [harness-engineering.md](./references/harness-engineering.md) when improving agent-first repo readiness: context architecture, subsystem guidance, mechanical enforcement, CI feedback, evals, observability, persistent knowledge, deslop passes, CI watching, compatibility scans, or background quality agents.

Read [harness-loops.md](./references/harness-loops.md) for repeated agent iterations, disk-backed specs/plans, builder/reviewer loops, restore points, and sequential review pipelines with auto-decisions.

Read [institutional-learnings.md](./references/institutional-learnings.md) when capturing a solved problem, searching `docs/solutions/` before starting work in a documented area, or deciding whether a finding belongs in structured solutions vs prose lessons.

Read [scratch-space.md](./references/scratch-space.md) when a harness run or skill needs to write intermediate files, checkpoints, delegation prompts, or any state that is not a final deliverable. Use this to avoid polluting the repo and to make state discoverable by sibling agents.

### Architecture, planning, and execution design

Read [architecture-analysis.md](./references/architecture-analysis.md) when explaining how the system works, tracing dependencies, or evaluating change impact.

Read [codebase-architecture-language.md](./references/codebase-architecture-language.md) when producing an architecture audit, writing AGENTS.md guidance, or describing structural problems in a PR or report. This reference defines the shared vocabulary: god objects, shotgun surgery, blast radius, layer violations, cohesion, coupling, lint gates, and the 7-dimension scoring rubric. Use this language consistently so findings can be compared across sessions.

Read [architecture-patterns.md](./references/architecture-patterns.md) when choosing or comparing software architecture patterns.

Read [system-design-workflows.md](./references/system-design-workflows.md) when designing a system, migration, API surface, or scaling plan from scratch.

Read [interface-design.md](./references/interface-design.md) when the right module or API shape is unclear and should be explored before implementation.

Read [tech-decision-guide.md](./references/tech-decision-guide.md) when the user needs to choose a technology.

Read [interviewer-pattern.md](./references/interviewer-pattern.md) before any non-trivial creation task where key constraints are still ambiguous.

Read [prd-to-plan.md](./references/prd-to-plan.md) for phased implementation plans and tracer-bullet slicing.

Read [refactor-planning.md](./references/refactor-planning.md) for safe refactor decomposition, commit slicing, and RFC/issue planning.

### Debugging and root-cause investigation

Read [debug-investigation.md](./references/debug-investigation.md) for the full debug workflow: Triage → Investigate → Root Cause → Fix → Handoff. Includes assumption audits, causal chain gates, smart escalation, root cause tracing (trace backward through the call chain — never fix the symptom), defense-in-depth validation (validate at every layer), and condition-based waiting (replace arbitrary `sleep()` with real condition checks).

Read [observability.md](./references/observability.md) before adding logs or instrumentation, and whenever debugging should start from existing signals.

### Reviews and verification

Read [reviews-and-comments.md](./references/reviews-and-comments.md) for code review, PR feedback, multi-agent persona selection, P0–P3 severity scale, and adversarial review passes.

Read [code-simplification.md](./references/code-simplification.md) before opening a PR or after a long dev-loop: resolves scope from the branch diff, runs 3 parallel review agents (reuse/quality/efficiency), applies fixes, and verifies behavior is preserved.

Read [specs-plans-tests.md](./references/specs-plans-tests.md) when the workflow needs explicit separation between behavior spec, execution plan, and proof.

Read [verification-and-finish.md](./references/verification-and-finish.md) before declaring success, opening a PR, or cleaning up a branch/worktree.

### Testing and CI workflow

Read [tdd-advanced.md](./references/tdd-advanced.md) for spec-first TDD, property-based testing, mutation testing, and autonomy limits.

Read [tdd-framework-guide.md](./references/tdd-framework-guide.md) when setting up or changing a test framework.

Read [tdd-ci-integration.md](./references/tdd-ci-integration.md) when wiring coverage into CI.

Read [github-actions-templates.md](./references/github-actions-templates.md), [gitlab-ci-templates.md](./references/gitlab-ci-templates.md), and [deployment-gates.md](./references/deployment-gates.md) for baseline CI pipeline generation and deployment gates.

### Agent-native architecture

Read [agent-native-architecture.md](./references/agent-native-architecture.md) when building systems where agents are first-class citizens: the five principles (Parity, Granularity, Composability, Emergent Capability, Improvement Over Time), MCP tool design, action parity, architecture checklist, anti-patterns, and success criteria.

Read [agent-native-architecture.md](./references/agent-native-architecture.md) before any new agent-facing API, MCP server, or AI-powered product feature. Run the `agent-native-auditor` agent to score an existing system against the eight principles.

### Agentic systems and LLM workflows

Read [agentic-system-design.md](./references/agentic-system-design.md) when designing agent architectures from scratch.

Read [prompt-engineering-patterns.md](./references/prompt-engineering-patterns.md) when writing or improving prompts.

Read [llm-evaluation-frameworks.md](./references/llm-evaluation-frameworks.md) when evaluating LLM or RAG output quality.

Read [decision-principles.md](./references/decision-principles.md) when running autonomous loops that need to auto-decide intermediate choices, or when surfacing structured decision briefs to users. Use the decision classification (mechanical/taste/user-challenge) to determine whether to auto-decide silently, queue for a final gate, or pause and ask.

Read [model-routing.md](./references/model-routing.md) when spawning sub-agents to route tasks to the right model tier (Haiku for routine file ops, Sonnet for implementation, Opus for security/architecture). The 80/15/5 split achieves ~10× cost reduction vs defaulting everything to a premium model.

Read [orchestrate-roles.md](./references/orchestrate-roles.md) when distributing a large task across parallel cloud agents: planner/worker/verifier role separation, plan.json state management, Andon escalation, and when to use `/orchestrate` vs. `/dev-loop`.

### Git, release, and landing

Read [collaboration-and-git.md](./references/collaboration-and-git.md) for branch and PR workflow.

Read [conventional-commits.md](./references/conventional-commits.md) for commit message standards and release tooling.

Read [release-workflow-comparison.md](./references/release-workflow-comparison.md) when choosing a branching strategy.

Read [hotfix-procedures.md](./references/hotfix-procedures.md) for emergency release flow.

Read [land-and-deploy.md](./references/land-and-deploy.md) when the user asks to merge, land, or deploy.

### Tech debt and background quality work

Read [tech-debt-cloud-agents.md](./references/tech-debt-cloud-agents.md) when planning or executing debt elimination at scale: large-scale migrations, dependency updates, feature-flag retirement, test coverage fills, Sentry triage, design-system drift, monolith splits, docs sync, and automated bug reproduction. All nine patterns are designed to run as autonomous cloud-agent cadences — scheduled, parallelized, and reviewed as PRs rather than consuming sprint capacity.

### Learning and self-improvement

Read [self-improvement.md](./references/self-improvement.md) at session end or after recurring mistakes.

Read [autoimprove.md](./references/autoimprove.md) for autonomous reference optimization.

Read [skill-extraction.md](./references/skill-extraction.md) when session learnings should become a reusable skill.

Read [continual-learning.md](./references/continual-learning.md) to update durable repo/user memory in instruction files.

Read [learning-system.md](./references/learning-system.md) and its companion references when operating the repo-local `learning/` system.

<reference_index>
## Reference Index

**Orientation and planning**
- `references/repo-orientation.md` — startup discovery, repo-shape detection
- `references/instruction-file-design.md` — AGENTS.md/CLAUDE.md structure
- `references/brainstorming-design-gate.md` — design-first gate: explore, one-question-at-a-time, 2-3 proposals, approval before code ★ new
- `references/prd-to-plan.md` — phased implementation plans and tracer-bullet slicing
- `references/refactor-planning.md` — safe refactor decomposition
- `references/interviewer-pattern.md` — ambiguity resolution before non-trivial tasks

**Architecture and design**
- `references/architecture-analysis.md` — tracing dependencies, evaluating change impact
- `references/codebase-architecture-language.md` — shared vocabulary for architecture audits: anti-patterns, health properties, enforcement terms, 7-dimension scoring rubric ★ new
- `references/architecture-patterns.md` — comparing software architecture patterns
- `references/system-design-workflows.md` — designing systems from scratch
- `references/interface-design.md` — exploring module or API shape before implementation
- `references/tech-decision-guide.md` — technology selection

**Execution and parallelism**
- `references/subagents-and-parallelism.md` — Parallel Safety Check, worktree isolation, two-stage review, implementer status handling, model routing
- `references/subagent-prompt-templates.md` — concrete implementer, spec-reviewer, and code-quality-reviewer prompt templates ★ new
- `references/harness-loops.md` — disk-backed loops, builder/reviewer loops, restore points
- `references/orchestrate-roles.md` — planner/worker/verifier for cloud agents

**Agent-native and AI systems**
- `references/agent-native-architecture.md` — five principles, MCP tool design, checklist, anti-patterns ★ new
- `references/agentic-system-design.md` — agent architecture from scratch
- `references/prompt-engineering-patterns.md` — prompt writing and improvement
- `references/llm-evaluation-frameworks.md` — LLM/RAG eval quality
- `references/decision-principles.md` — mechanical/taste/user-challenge classification

**Tech debt and quality cadences**
- `references/tech-debt-cloud-agents.md` — 10 cloud-agent patterns for schedulable debt elimination (migrations, deps, flags, coverage, triage, design drift, monolith splits, docs, bug reproduction, lint-enforced anti-pattern elimination)

**Harness improvement**
- `references/harness-engineering.md` — audit dimensions, improvement patterns, scratch space discipline
- `references/observability.md` — logs, traces, agent-legible debugging signals
- `references/institutional-learnings.md` — `docs/solutions/` schema, capture workflow, grep-first search ★ new
- `references/scratch-space.md` — OS-temp vs `.context/` vs durable; decision tree for intermediate state ★ new

**Debugging**
- `references/debug-investigation.md` — phased debug workflow: Triage, Investigate, Root Cause, Fix, Handoff; assumption audits, causal chain gates; root cause tracing (backward call-chain tracing); defense-in-depth validation; condition-based waiting for flaky tests; find-polluter.sh bisection script

**Review, testing, and CI**
- `references/reviews-and-comments.md` — multi-agent code review, P0–P3 severity scale, persona selection, adversarial passes
- `references/code-simplification.md` — 3-agent simplification pass (reuse/quality/efficiency) before PR; scope resolution, verification
- `references/specs-plans-tests.md` — behavior spec, plan, proof separation
- `references/verification-and-finish.md` — success gates before declaring done
- `references/tdd-advanced.md` — spec-first TDD, property-based testing
- `references/tdd-framework-guide.md` — test framework setup
- `references/tdd-ci-integration.md` — coverage wired to CI
- `references/github-actions-templates.md`, `references/gitlab-ci-templates.md` — CI baselines
- `references/deployment-gates.md` — deployment gate patterns

**Git, release, and landing**
- `references/collaboration-and-git.md` — branch and PR workflow
- `references/conventional-commits.md` — commit standards
- `references/release-workflow-comparison.md` — branching strategy selection
- `references/hotfix-procedures.md` — emergency release flow
- `references/land-and-deploy.md` — merge and deploy

**Learning and self-improvement**
- `references/self-improvement.md` — session-end learning
- `references/autoimprove.md` — autonomous reference optimization
- `references/skill-extraction.md` — session learnings → reusable skill
- `references/continual-learning.md` — durable repo/user memory updates
- `references/learning-system.md` — learning/ folder system
</reference_index>

## Domain Routing

This skill should reference the specialized engineering skills repeatedly and intentionally:

- Before frontend implementation, load [`../frontend/SKILL.md`](../frontend/SKILL.md).
- Before backend implementation, load [`../backend/SKILL.md`](../backend/SKILL.md).
- For full-stack features, use this skill as the controller and split the execution across [`../frontend/SKILL.md`](../frontend/SKILL.md) and [`../backend/SKILL.md`](../backend/SKILL.md).
- For UI review or polish after backend work is done, hand off to [`../frontend/SKILL.md`](../frontend/SKILL.md).
- For schema/API/service changes discovered while doing UI work, hand off to [`../backend/SKILL.md`](../backend/SKILL.md).

## Bundled Agents

**Review agents** (dispatch in parallel for multi-agent code review):
- `references/agents/correctness-reviewer.md` — logic errors, off-by-one, null propagation, race conditions, broken error propagation; always-on for any code review.
- `references/agents/adversarial-reviewer.md` — chaos engineering perspective; constructs failure scenarios from assumption violations, composition failures, cascades, and abuse cases; conditional (diff ≥50 lines or high-risk domain).
- `references/agents/performance-oracle.md` — algorithmic complexity, N+1 queries, memory, caching, network, frontend bundle; conditional (DB-touching or data-scale code).
- `references/agents/architecture-strategist.md` — layer violations, coupling, SOLID, structural decisions; conditional (new services, refactors, cross-cutting concerns).

**Harness and CI agents:**
- `references/agents/ci-watcher.yaml` — watches CI for the current branch's PR; classifies failures as FLAKY, REAL, or INFRA; feeds `/fix-ci`.
- `references/agents/compatibility-scanner.yaml` — orchestrates the four-phase compatibility pass (harness scan, docs reliability, startup review, validation efficiency); feeds `/check-agent-compat`.

**Memory and improvement agents:**
- `references/agents/agents-memory-updater.md` — mines transcript deltas and updates `CLAUDE.md` / `AGENTS.md` with durable preferences and workspace facts.
- `references/agents/learnings-researcher.md` — grep-first search of `docs/solutions/` for applicable past learnings before planning or implementing in a documented area. ★ new

**Orchestration agents:**
- `references/agents/orchestrate.yaml` — acts as Dispatcher for `/orchestrate`; spawns a cloud Planner, monitors progress, handles Andon escalations, and reconciles the final handoff.
- `references/agents/agent-native-auditor.md` — runs 8 parallel sub-agents scoring an existing codebase against agent-native principles (Action Parity, Tool Primitives, Context Injection, Shared Workspace, CRUD Completeness, UI Integration, Capability Discovery, Prompt-Native Features); produces a scored report with prioritized recommendations.

## Bundled Scripts

- `scripts/repo_scan.py` for repo scanning and startup context.
- `scripts/harness_audit.py` for agent-first readiness audits across instructions, CI, evals, observability, enforcement, and persistent knowledge.
- `scripts/find-polluter.sh` for test isolation bisection — finds which test creates unwanted files or state by running tests one-by-one until the polluter is identified.
- `scripts/project_architect.py` for architecture detection and layer violations.
- `scripts/architecture_diagram_generator.py` for Mermaid, PlantUML, or ASCII diagrams.
- `scripts/stack_detector.py` and `scripts/pipeline_generator.py` for baseline CI generation.
- `scripts/coverage_analyzer.py`, `scripts/fixture_generator.py`, and `scripts/tdd_workflow.py` for verification workflows.
- `scripts/prompt_optimizer.py`, `scripts/rag_evaluator.py`, and `scripts/agent_orchestrator.py` for LLM/agent systems work.
- `scripts/init-learning.sh`, `scripts/init-learning.py`, `scripts/capture-item.py`, `scripts/scan-learning.py`, and `scripts/refresh-learning.py` for the learning system.
- Frontend-specific generators and analyzers now live in [`../frontend/scripts/`](../frontend/scripts/).
- Backend-specific API and database tooling now live in [`../backend/scripts/`](../backend/scripts/).

## Standard Loop

1. **Triage input**: is this a plan doc or a bare prompt? Classify complexity (Trivial / Small-Medium / Large / Epic). See [subagents-and-parallelism.md](./references/subagents-and-parallelism.md).
2. **Design gate + spec interview** (for non-trivial or creative work): orient first, then apply the brainstorming/design gate — scope check (decompose if multi-subsystem), explore context, ask questions one at a time, propose 2-3 approaches, spec self-review, present design, get approval before any code. See [brainstorming-design-gate.md](./references/brainstorming-design-gate.md). Skip for pure bug fixes with a known causal chain. Then run the interviewer pattern: expand the request into a full spec, surface every unresolved decision with a proposed answer, and resolve each one before writing any code. See [interviewer-pattern.md](./references/interviewer-pattern.md). Controlling the input is always cheaper than fixing the output — the ratio is 2 minutes of spec work vs 45 minutes of editing.
3. **Search learnings**: grep `docs/solutions/` for prior decisions and pitfalls in the affected area. See [institutional-learnings.md](./references/institutional-learnings.md) or dispatch the `learnings-researcher` agent.
4. **Orient**: inspect repo instructions, architecture, git state, and the current task context.
5. **Classify**: determine the work type and execution mode.
6. **Route**: load [`../frontend/SKILL.md`](../frontend/SKILL.md), [`../backend/SKILL.md`](../backend/SKILL.md), or both when domain-specific detail is needed.
7. **Anchor**: find the existing owner of the behavior and the minimal safe change surface.
8. **Implement**: make the smallest coherent change that solves the right problem.
9. **Verify**: run System-Wide Test Check, then focused proof, then broader regression evidence. Evidence before claims — do not say "done" without running the verification. See [subagents-and-parallelism.md](./references/subagents-and-parallelism.md) and [verification-and-finish.md](./references/verification-and-finish.md).
10. **Compound**: capture non-obvious findings in `docs/solutions/`. Surface follow-up risks, rollout notes, and cleanup for the next engineer.

## Commands

Three slash commands come with this skill. Wire them from `engineering/commands/`.

### `/dev-loop`

Starts an agentic development loop in the current session. The stop hook re-injects the original task prompt each iteration until a `<promise>` completion tag is output or `--max-iterations` is reached.

```
/dev-loop Fix the auth bug --completion-promise 'FIXED' --max-iterations 10
/dev-loop Add test coverage --verify-cmd 'npm test' --completion-promise 'DONE'
/dev-loop Improve API layer --spec-file TASK.md --max-iterations 20
```

Options: `--max-iterations N`, `--completion-promise TEXT`, `--verify-cmd CMD`, `--spec-file PATH`.

### `/cancel-dev-loop`

Cancels an active dev loop by removing `.claude/agentic-dev-loop.local.md`.

### `/check-agent-compat`

Runs the four-phase compatibility scan before extending agent autonomy: harness score, docs reliability, startup path, and validation efficiency. Produces a P0/P1/P2 finding list. Start here before running a long harness-loop on an unfamiliar repo.

```
/check-agent-compat [repo-root]
```

### `/fix-ci`

Watches CI for the current branch, classifies failures (FLAKY/REAL/INFRA), and applies targeted fixes in a watch → identify → fix → re-watch loop. Uses the `ci-watcher` agent internally.

```
/fix-ci [--max-iterations N] [--check <check-name>]
```

### `/harness-loop`

Starts a harness engineering improvement loop. Each iteration runs `harness_audit.py`, picks the highest-priority P0/P1 finding, enforces it as a CI gate or structural test, and commits. Stops when a fresh audit shows no P0 or P1 items.

```
/harness-loop --max-iterations 20
/harness-loop path/to/repo --max-iterations 15
```

### `/orchestrate`

Decomposes a large goal into parallel cloud-agent tasks using the planner/worker/verifier model. The local IDE session acts as the Dispatcher; a Planner cloud agent owns scope decomposition; Worker agents execute sub-tasks in isolation. Andon signals pause the pipeline and escalate to the user.

```
/orchestrate "Migrate the legacy auth module to the new SDK, add test coverage, and update AGENTS.md"
```

Use when a task would exhaust a single agent's context budget, benefits from parallelism, or spans independently verifiable sub-scopes. Read [orchestrate-roles.md](./references/orchestrate-roles.md) before invoking.

## Hooks

This skill ships four hooks. Wire them in Claude Code settings, replacing `/absolute/path/to/agentic-development` with the actual path.

### Completion gate (dual-mode)

`hooks/check-completion.sh` operates in two modes:

- **Loop mode** (activated by `/dev-loop` or `/harness-loop`): checks `.claude/agentic-dev-loop.local.md` for active loop state, parses the JSONL transcript for the last assistant message, detects `<promise>` completion tags, and re-injects the original task prompt via `reason` each iteration.
- **Gate mode** (no active loop): scans the transcript tail for incomplete signals, unchecked boxes, or recent tool errors and blocks premature exit.

### Tool logging and error capture

- `hooks/pre-tool.sh` logs every `Bash`, `Write`, and `Edit` invocation to stderr.
- `hooks/post-bash.sh` captures non-zero exit codes into `memory/working/last_error.json`.
- `hooks/session-end.sh` writes `memory/working/session_end.json` so the self-improvement phase can detect a finished session.
