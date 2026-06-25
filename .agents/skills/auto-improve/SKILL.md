---
name: auto-improve
description: >-
  Use to autonomously improve skills, memory files, agents, documentation, or
  conversation-derived workflows based on recent evidence. Runs eval-loop style
  review and mutation, keeps score and change logs, preserves reusable lessons,
  and chooses the highest-leverage improvement targets without waiting for
  explicit user instruction.
---

# Auto-Improve

Most skills, agents, and documentation work about 70% of the time. The other 30% produces inconsistent, shallow, or wrong output. The fix is not a full rewrite — it is letting an autonomous loop run the target repeatedly, score every output against binary criteria, tighten the prompt until that 30% disappears, and keep a complete research log of every mutation attempted.

Memories are different: they degrade silently. Facts go stale, gaps accumulate, entries duplicate. The fix is a structured audit followed by targeted rewrites.

This skill handles both patterns under one entry point.

It is **not request-routed**. The trigger is what the agents actually did: files changed, mistakes repeated, user directions clarified, workflows that felt awkward, docs that were missing, and gaps between expected behavior and actual behavior.

It should behave like a lightweight hyperagent, not a one-shot optimizer:
- the task-level target and the meta-level improvement procedure are treated as part of the same editable system
- successful intermediate variants are stepping stones, not disposable artifacts
- memory should store synthesized insights, causal diagnoses, and forward-looking plans, not just scores
- lessons from one run should be reusable in later runs and across nearby targets

---

## entry point

**STOP. Do not touch any file until you have completed this discovery pass:**

1. Inspect the latest evidence from the work that just happened:
   - files changed or attempted
   - user directions, corrections, and constraints
   - failures, retries, or moments where the agent needed extra steering
   - weak outputs from skills or agents
   - draft corrections about tone, voice, or "this doesn't sound like me/us"
   - missing, stale, or confusing documentation surfaced during execution
   - durable preferences or workflow patterns worth persisting

2. Build a candidate improvement list across these target types:
   - `skill` — a `SKILL.md` file whose instructions caused weak or awkward execution
   - `agent` — an agent definition under `agents/` whose routing, trigger text, or workflow was off
   - `documentation` — repo docs like `AGENTS.md`, `PLAN.md`, `SPEC.md`, `SOUL.md`, `PRINCIPLES.md`, `DESIGN.md`, `README.md`, `ARCHITECTURE.md`, `TESTS.md`, `SETUP.md`, `RUNBOOK.md`, `CHANGELOG.md`, `SECURITY.md`, `OVERVIEW.md`, `FAQ.md`, `DECISIONS.md`, `DEPENDENCIES.md`, `CONTRIBUTING.md`, `TESTING.md`, `writing-style-guide.md`, `logs/`, `lessons/`, `items/`, `fixes/`, `audits/`, `raw/`, `plans/`, `specs/`, `sources/`, `lib/`, `references/`, `cookbook/`, `knowledge/`, `runbooks/`, `research/`, `official-documentation/`, `context/`, or domain-specific AFS doc trees
   - `memory` — memory files under `~/.claude/projects/*/memory/` that are stale, contradictory, or missing key durable facts
   - `conversation` — harvest durable memory or reusable workflows from the current conversation

3. Rank candidates by:
   - severity: how much the issue blocked or degraded the task
   - frequency: whether the problem happened repeatedly
   - leverage: whether fixing it will improve many future tasks
   - durability: whether the fix belongs in a reusable skill/agent/doc rather than a one-off answer

4. Choose the smallest set of targets that fixes the real problem:
   - Sometimes this is one skill.
   - Sometimes it is multiple skills.
   - Sometimes it is a skill plus one or more agents or docs such as `AGENTS.md`, `PLAN.md`, `SPEC.md`, `DESIGN.md`, or a runbook.
   - If the failure is mostly "wrong voice" rather than "wrong workflow", prefer a style artifact such as `writing-style-guide.md` plus the consuming skill, not just more drafting rules.
   - Do not improve everything just because you can. Improve everything that the evidence says is necessary.

5. For each selected target that is a skill, agent, or documentation file, determine its **source origin**:
   - **Source-tracked** — the file lives under the `alvarovillalbaa/agent-suite` working directory (i.e. its absolute path starts with the agent-suite repo root, typically `/Users/alvipe/Desktop/agent-suite/skills/`). Improvements must be proposed as a GitHub PR to `alvarovillalbaa/agent-suite`, not saved directly. The local file is still mutated during the eval loop (the iteration speed benefit must be preserved), but the final write-back and commit/push/PR happen only after the loop ends.
   - **External** — the file lives anywhere else (e.g. `~/.claude/plugins/cache/` or another installed plugin path). Improve it locally, no PR needed.

   Mark each selected target with its origin before starting any sub-flow.

6. Route each selected target to the appropriate sub-flow below. Process multiple targets one at a time, highest leverage first.

If the evidence shows repeated voice mismatch, brand-tone drift, or user feedback like "too AI", "too salesy", or "this doesn't sound like me/us", route through **sub-flow: writing-style capture and refresh** before or alongside the eval loop.

If the evidence does not justify any durable improvement, stop and make no changes.

---

## sub-flow: memory audit

### step 1 — locate memory files

Find all memory files:
- Index: `~/.claude/projects/*/memory/MEMORY.md`
- Individual entries: `~/.claude/projects/*/memory/*.md` (exclude MEMORY.md itself)

Read every file in full before forming any judgment.

### step 2 — audit on four dimensions

For every memory file, check:

**Staleness** — Does the file contain relative dates ("last Thursday", "recently", "this quarter") that have no absolute anchor? Does it describe a state (a role, a project, a decision) that may no longer be true? Flag these for verification or removal.

**Gaps** — Is there a category of user knowledge (role, preferences, project context, key decisions) that the memory system clearly should have but doesn't? Note what is missing and why it matters.

**Redundancy** — Do two or more files encode the same fact? Is any file a strict subset of another? Mark duplicates for consolidation.

**Inconsistencies** — Do any two files contradict each other? Does a file's `type` field mismatch its content? Does the MEMORY.md index reference a file that no longer exists, or omit one that does? Flag every conflict.

### step 3 — write the audit report

Create `auto-improve-memory/audit-report.md` with this structure:

```markdown
# Memory Audit Report — YYYY-MM-DD

## Summary
- Files reviewed: N
- Issues found: N (staleness: N, gaps: N, redundancy: N, inconsistencies: N)

## Staleness
- [filename]: [what is stale and why]

## Gaps
- [what is missing]: [why it matters]

## Redundancy
- [filename A] duplicates [filename B]: [what overlaps]

## Inconsistencies
- [filename A] vs [filename B]: [what conflicts]

## Recommended actions
1. [action] — [file]
2. ...
```

### step 4 — rewrite memory files

For each issue found, take the recommended action:
- **Stale entry** → verify against current codebase/git state; update if still relevant, delete if not
- **Gap** → create a new memory file for the missing category using the standard frontmatter format
- **Redundancy** → merge duplicates into the more complete file; delete the subset; update MEMORY.md index
- **Inconsistency** → resolve by reading current codebase state as ground truth; update the wrong file

Rewrite one file at a time. After each rewrite, update the MEMORY.md index if needed.

### step 5 — write changelog

Create `auto-improve-memory/changelog.md`:

```markdown
## [filename] — [action taken]
**Issue:** [what was wrong]
**Change:** [what was rewritten or added]
**Reason:** [why this improves the memory system]
```

### step 6 — deliver results

Report:
1. Files audited and issues found per dimension
2. Files rewritten, created, or deleted
3. Remaining gaps that could not be resolved without user input (ask for that input now)
4. Location of audit report and changelog

---

## sub-flow: background conversation review (Hermes pattern)

This sub-flow implements the Hermes-style self-improving memory pattern inspired by the NousResearch agent. Instead of waiting for explicit memory commands, the system periodically intercepts a user turn, spawns a background job, reviews the conversation, and saves only the durable things worth keeping — so the agent grows with the user without distracting from the main task.

### when to trigger

Trigger this sub-flow automatically **every 10 conversation turns**. The trigger point is the user's message on turn 10, 20, 30, etc. That user message is intercepted and a new background job is spawned.

The main response continues normally. The review must happen asynchronously so it does not delay, distract, or derail the agent handling the active task.

Also trigger this sub-flow whenever the latest work reveals durable preferences, workflow expectations, or project facts that should persist beyond the current task, even if the 10-turn cadence has not been hit yet.

If the discovery pass above identifies conversation-derived memory as a target, run it immediately on the full conversation so far.

### step 1 — review the conversation

Read the full conversation above. Apply this exact review prompt:

> Review the conversation above and consider saving to memory if appropriate.
>
> Focus on:
>
> 1. Has the user revealed things about themselves — their persona, desires, preferences, or personal details worth remembering?
> 2. Has the user expressed expectations about how you should behave, their work style, or ways they want you to operate?
>
> If something stands out, save it using the memory tool. If nothing is worth saving, just say **"Nothing to save."** and stop.

Do not paraphrase or soften the prompt. Use it as written.

### step 2 — classify each finding

For each piece of information worth saving, decide which durable destination it belongs to:

| Finding type | Target |
|---|---|
| User persona, goals, background, personal preferences | Personal memory (`USER.md`-equivalent) |
| Work style expectations, behavior instructions, corrections | Personal/operating memory (`USER.md`-equivalent) |
| Project context, technical decisions, timelines, constraints, repo facts | Technical memory (`MEMORY.md`-equivalent) |
| Repeated workflow or technique the user keeps applying | New skill file |

In this repository's memory system, that means:
- Personal memory should be saved into the user-oriented memory area or files that play the role of `USER.md`.
- Technical/project memory should be saved into the technical memory area or files that play the role of `MEMORY.md`.
- Reusable operating procedures should become a skill, not a memory note.

**Do not save what is already in memory.** Before writing, check existing memory files for duplicates or superseded entries.

### step 3 — write or update files

**For memory targets** — preserve the Hermes destination model:
- personal facts and behavior preferences -> `USER.md`-equivalent destination
- technical/project facts -> `MEMORY.md`-equivalent destination
- reusable workflow -> skill

When this repo uses discrete memory files instead of literal `USER.md` / `MEMORY.md`, map the content into the equivalent structure without losing the distinction between personal memory and technical memory.

**For structured memory files** — write using the standard frontmatter format:

```markdown
---
name: [descriptive name]
description: [one-line description for MEMORY.md index]
type: user | feedback | project | reference
---

[content — for feedback/project types: rule/fact, then **Why:** and **How to apply:** lines]
```

Then add or update the pointer in `MEMORY.md`.

**For skill targets** — only create a new skill if the pattern is genuinely reusable across sessions (not just a one-off technique). Use the standard SKILL.md frontmatter with `name` and `description`.

### step 4 — report (async mode)

When running as a background job, do not interrupt the main conversation. Silently save the files. After the main response is delivered, append a one-line status:

> _(Background memory review: saved [N] items — [brief list of what was saved])_

If nothing was saved: no status line needed.

### the discipline

- **Do not over-save.** Ephemeral task details, in-progress state, and things derivable from code or git history are not memory. Only save what will be genuinely useful in future conversations.
- **Be specific.** "User likes clean code" is useless. "User prefers no trailing summaries — they find them redundant and distracting" is actionable.
- **One insight, one file.** Do not bundle unrelated facts into a single memory file. Granular files are easier to update and expire independently.
- **Background means non-blocking.** The review must never slow down the main response. If running in background mode, fire-and-forget.
- **Preserve the split.** Personal/user information belongs in `USER.md`-equivalent memory; technical/project facts belong in `MEMORY.md`-equivalent memory; reusable procedures belong in skills.

---

## sub-flow: writing-style capture and refresh

Use this sub-flow when the real failure is not missing task logic but missing first-party voice grounding.

Load `references/writing-style-learning.md` for the source-order and diagnosis heuristics before changing the guide or the consuming skill.

### when to trigger

Trigger when one or more of these are true:

- the user corrects drafts mainly on tone, phrasing, warmth, directness, or "sounds like me/us"
- a writing skill keeps producing generic or channel-inappropriate copy despite otherwise correct structure
- there is no durable `writing-style-guide.md` but the agent is repeatedly drafting on behalf of the same sender, founder, exec, team, or brand
- an existing style guide clearly drifted from the user's recent writing

### step 1 — identify the drafting owner and channels

Pin down:

- who the draft is supposed to sound like
- which channels matter: email, LinkedIn, social, docs, messages, or call scripts
- whether the voice is personal, team, executive, or brand-level

Do not merge multiple voices into one guide unless the evidence says they are intentionally shared.

### step 2 — discover available first-party sources

Look for the strongest available sources in this order:

1. existing `writing-style-guide.md` or brand voice docs
2. recent approved or sent messages from the same sender on the same channel
3. recent first-party public writing such as posts, newsletters, or blog entries
4. approved templates already known to match the sender

Do not learn voice from inbound messages, quoted reply text, signatures, disclaimers, or auto-generated boilerplate.

### step 3 — extract and analyze patterns

Bias recent content higher than old content. Separate the analysis by channel.

For each channel, capture:

- typical length and paragraph shape
- openings and closings
- level of warmth, directness, and formality
- punctuation habits
- repeated phrases, contractions, abbreviations, and intensifiers
- patterns the sender consistently avoids

Also write a `General` layer that captures patterns common across all channels.

### step 4 — write or refresh the guide

Create or update `writing-style-guide.md` using `templates/writing-style-guide.md`.

The guide must:

- have a `General` section plus one section per meaningful channel
- state concrete drafting rules, not just adjectives
- note confidence and source quality when the corpus is thin
- avoid storing unnecessary raw private text

### step 5 — wire the guide into consumers

Update the relevant drafting skill, agent, or root documentation so future writing reads the guide first and uses **General + closest channel section**.

Prefer changing the consumer instructions once over repeating style notes in every future task response.

### step 6 — fold corrections back in

When the user corrects a draft, decide whether the correction belongs in:

- the skill instructions because the workflow was wrong
- the style guide because the voice pattern was wrong
- both, when routing and voice both failed

Do not keep stuffing voice rules into the drafting skill if the durable fix is really a better style artifact.

---

## sub-flow: eval loop (skills · agents · documentation)

### before starting — gather context

**STOP. Do not run any experiments until all fields below are grounded in evidence from the latest work. Derive them; only ask the user if a critical ambiguity cannot be resolved from context.**

1. **Target file** — exact path to the SKILL.md, agent `.md`, or documentation `.md`
2. **Evidence package** — the concrete failures, user directions, weak outputs, changed files, or missing docs that justify improving this target
   - If the target writes on behalf of a user or brand, include the active style source or explicitly note that it is missing.
3. **Test inputs** — 3–5 scenarios derived from the evidence package; prefer real failures and near-failures over invented examples
4. **Eval criteria** — 3–6 binary yes/no checks defining good behavior for this target, derived from intended behavior plus the evidence package (see [eval criteria guide](#eval-criteria-guide) below)
5. **Runs per test input** — how many times to run each test input per experiment. Default: 3 for skills, agents, and documentation (probabilistic — multiple runs smooth out variance). Max score = evals × test inputs × runs per input.
6. **Budget cap** — optional maximum number of experiment cycles; if not set, use a pragmatic cap based on leverage and complexity. Default: 3–8 experiments per target.
7. **Prior self-improvement memory** — read the persistent archive and memory from related earlier runs before proposing the first mutation. Reuse successful patterns and avoid repeating failed ideas.

### metacognitive stance

The loop is not only trying to improve the current target. It is also trying to improve the improvement process itself.

That means:
- learn which mutation styles help for which target types
- record overcorrections and dead ends so future runs can avoid them
- identify reusable strategies that transfer across skills, agents, and documentation
- preserve good intermediate variants as stepping stones, even when they are not the final best version

Do not assume the evaluation task and the self-modification task are perfectly aligned. A good output on one task does not automatically imply a good mutation strategy. Explicitly reason about the meta-level process.

### step 1 — read the target

Before changing anything, read and understand the target completely:
- Read the full target file
- For skills: read any files in `references/` that the skill links to
- For writing-related skills, also read the active `writing-style-guide.md` or equivalent voice doc when one exists
- For agents: read the commands and skills the agent references
- For documentation: read the docs it points to or depends on, plus the repo files it claims to describe
- Identify the target's core job, process steps, and output format
- Note existing quality checks or anti-patterns already present

**Do NOT skip this.** You need to understand what the target does before you can improve it.

### step 2 — build the eval suite

Convert the intended behavior plus the evidence package into a structured test. Every check must be binary — pass or fail, no scales.

Format each eval as:

```
EVAL [N]: [Short name]
Question: [Yes/no question about the output]
Pass condition: [What "yes" looks like — be specific]
Fail condition: [What triggers a "no"]
```

Max score: `[number of evals] × [test inputs] × [runs per input]`

### step 3 — generate the live dashboard

Create `auto-improve-[name]/dashboard.html` — a self-contained HTML file with inline CSS and JS. Open it immediately: `open auto-improve-[name]/dashboard.html`.

The dashboard must:
- Auto-refresh every 10 seconds by fetching `results.json`
- Show a score progression line chart (experiment number on X axis, pass rate % on Y axis) using Chart.js from CDN
- Show a colored row per experiment: blue = baseline, green = keep, red = discard
- Show a table: experiment #, score, pass rate, status, description
- Show per-eval breakdown: which evals pass most/least across all runs
- Show memory highlights: the latest synthesized insights, best stepping stones, and current forward plan
- Show current status: "Running experiment [N]..." or "Complete"
- Use clean styling: white background, pastel accents, sans-serif font

Update `auto-improve-[name]/results.json` after every experiment. Format:

```json
{
  "target": "[name]",
  "status": "running",
  "current_experiment": 3,
  "baseline_score": 70.0,
  "best_score": 90.0,
  "memory_summary": [
    "Mutation ordering mattered more than instruction count",
    "Experiment 2 overcorrected and hurt routing precision"
  ],
  "experiments": [
    {
      "id": 0,
      "score": 14,
      "max_score": 20,
      "pass_rate": 70.0,
      "status": "baseline",
      "description": "original — no changes"
    }
  ],
  "eval_breakdown": [
    {"name": "Eval name", "pass_count": 8, "total": 10}
  ]
}
```

When the run ends, set `"status": "complete"`.

### step 4 — establish baseline

1. Create working directory: `auto-improve-[name]/`
2. Create `results.tsv` with header row
3. Back up original as `auto-improve-[name]/[filename].baseline`
4. Create `self_improvement_memory.md` and `archive/`
5. Seed `self_improvement_memory.md` with any relevant lessons from prior runs on similar targets
6. Save the untouched baseline as the first archive entry
7. Run the target on all test inputs
8. Score every output against every eval
9. Record experiment 0 in results.tsv and results.json
10. Open dashboard in browser

**results.tsv format (tab-separated):**
```
experiment	score	max_score	pass_rate	status	description
0	14	20	70.0%	baseline	original — no changes
```

**IMPORTANT:** After baseline, do not pause for approval. Continue automatically if the target still shows meaningful failures or if the issue is high leverage. If baseline is already 90%+ and the remaining gap is minor, skip this target and move to the next candidate instead of optimizing for noise.

### step 5 — run the loop

**LOOP AUTONOMOUSLY.** Do not pause between experiments unless you hit a real blocker or need unavailable information.

**Each iteration:**

1. **Analyze failures.** Which evals fail most? Read the actual outputs that failed. Identify the pattern: formatting issue, missing instruction, ambiguous directive?

2. **Consult memory.** Read `self_improvement_memory.md` and the best archive entries before proposing the next change. Check whether the current failure resembles a prior one, whether a previous mutation overcorrected, and whether two stepping stones should be combined.

3. **Form ONE hypothesis.** Pick one thing to change. Never change multiple things at once — you will not know what helped.

4. **Make the mutation.** Edit the target file with one targeted change. See [target-specific mutation guide](#target-specific-mutation-guide) below.

5. **Run all test inputs.** Score every output against every eval.

6. **Decide:**
   - Score improved → **KEEP.** This is the new baseline. For source-tracked targets, this means keeping the local file change — the PR is opened at step 8 after the loop ends, not mid-loop.
   - Same or worse → **DISCARD.** Revert the target to the previous version.

7. **Update persistent memory.** After every experiment, write down:
   - what changed
   - why it was expected to help
   - what actually happened
   - whether this was a genuine improvement, an overcorrection, or a dead end
   - what future experiments should try next

8. **Archive stepping stones.** Save every kept improvement and any especially informative near-miss into `archive/` with a short note explaining why it matters. A stepping stone is any variant that teaches something reusable, not just the current winner.

9. **Log the result** in results.tsv and results.json.

10. **Go back to step 1.**

**Stop only when:**
- The budget cap is reached
- 95%+ pass rate holds for 3 consecutive experiments (diminishing returns)
- The remaining failures are not worth the added complexity
- A higher-leverage target from the discovery list should be worked next

**If stuck:** Re-read failing outputs. Try combining two previous near-miss mutations. Try removing things instead of adding. Simplification that maintains the score is a win.

### step 6 — write the changelog

After every experiment (kept or discarded), append to `auto-improve-[name]/changelog.md`:

```markdown
## Experiment [N] — [keep/discard]

**Score:** [X]/[max] ([percent]%)
**Change:** [One sentence describing what was changed]
**Reasoning:** [Why this change was expected to help]
**Result:** [Which evals improved or declined]
**Remaining failures:** [What still fails, if anything]
```

Also update `auto-improve-[name]/self_improvement_memory.md` with synthesized memory entries, not raw logs. Each entry should capture:

```markdown
## Memory [N] — [short title]

**Context:** [target type + failure pattern]
**Hypothesis:** [causal belief about what would help]
**Outcome:** [what happened]
**Interpretation:** [why this likely happened]
**Transferability:** [where else this lesson should apply]
**Next move:** [forward-looking plan]
```

This file is the persistent memory of the improvement process itself. It must be actively consulted in later experiments and in later runs on related targets.

### step 7 — deliver results

When the loop ends, present:

1. Score summary: baseline → final (percent improvement)
2. Total experiments run and keep rate
3. Top 3 changes that helped most
4. Remaining failure patterns
5. Location of results.tsv, changelog.md, and dashboard.html

If more selected targets remain, continue to the next one instead of treating the first target as the whole job.

Before moving to the next target, review whether any lessons from the finished target should transfer. If yes, write them into the next target's seeded memory and cite the source archive entry.

### step 8 — source-tracked targets: open a PR (skip for external targets)

Only run this step if the target is **source-tracked** (i.e. it belongs to `alvarovillalbaa/agent-suite`).

**Do not run this step for external targets.** For external targets, the local file is already the authoritative copy — no PR is needed.

After the loop ends and the final improved version is in place on disk:

1. **Create a branch** in the local repo:
   ```
   git -C <repo-root> checkout -b auto-improve/<skill-name>-<YYYY-MM-DD>
   ```
   Use the skill or agent name (lowercased, hyphens) and today's date.

2. **Stage only the improved file** (never use `git add -A`):
   ```
   git -C <repo-root> add <relative-path-to-improved-file>
   ```

3. **Commit** with a descriptive message summarising the top mutation that improved the score:
   ```
   git -C <repo-root> commit -m "auto-improve(<skill-name>): <one-line description of top change>"
   ```

4. **Push** the branch:
   ```
   git -C <repo-root> push origin auto-improve/<skill-name>-<YYYY-MM-DD>
   ```

5. **Open a PR** against `main` using `gh`:
   ```
   gh pr create \
     --repo alvarovillalbaa/agent-suite \
     --base main \
     --head auto-improve/<skill-name>-<YYYY-MM-DD> \
     --title "auto-improve(<skill-name>): <one-line description>" \
     --body "$(cat <<'EOF'
   ## Summary
   - Baseline score: <X>%
   - Final score: <Y>%
   - Experiments run: <N> (<kept> kept, <discarded> discarded)

   ## Top changes
   - <change 1>
   - <change 2>
   - <change 3>

   ## Remaining failures
   <list or "none">

   ---
   _Generated by auto-improve eval loop. Changelog and results: `auto-improve-<name>/`_
   EOF
   )"
   ```

6. Report the PR URL to the user.

**Important constraints:**
- Never force-push or amend published commits.
- Never push directly to `main`.
- If the branch already exists (from a prior run today), append a short suffix (e.g. `-v2`) rather than overwriting.
- If `gh` is not authenticated or the push fails, report the error clearly and leave the improved file in place on the branch for the user to push manually.

---

## target-specific mutation guide

### skills (SKILL.md)

Good mutations:
- Add a specific instruction that addresses the most common failure
- Reword an ambiguous instruction to be more explicit
- Add an anti-pattern ("Do NOT do X") for a recurring mistake
- Move a buried instruction higher in the skill (priority = position)
- Add or improve an example showing correct behavior
- Remove an instruction causing over-optimization at the expense of other evals
- If the problem is voice mismatch, make the skill consume a style guide or voice brief rather than hard-coding more subjective style adjectives

Bad mutations:
- Rewriting the entire skill from scratch
- Adding 10 new rules at once
- Making the skill longer without a specific reason
- Adding vague instructions like "be more thorough" or "do better"
- Using the skill to impersonate a voice it has no first-party evidence for

Mutation scope: the body text of SKILL.md — instructions, anti-patterns, examples, ordering.

**Dynamic content injection:** If the skill depends on context that changes per repo or session, you can embed `!`command`` placeholders in SKILL.md to inject live shell output at invocation time — the model only ever sees the result, not the raw placeholder. This requires the skill's frontmatter to declare `allowed-tools` for every tool the command needs (e.g. `allowed-tools: Bash(git branch --show-current)`). Treat injected commands with the same scrutiny as postinstall scripts — they run with full shell permissions. Prefer read-only introspection (git, cat, jq) over commands with side effects.

### agents (agents/*.md)

Good mutations:
- Sharpen the `description` trigger phrases so the agent is invoked at the right moments
- Refine the `When to use` section to reduce false positives and false negatives
- Add or clarify a row in the commands or skills table
- Improve a workflow step that produces wrong routing decisions
- Add an explicit decision rule for an edge case that causes failures

Bad mutations:
- Expanding the agent's scope beyond its core job
- Duplicating instructions already in the referenced skills
- Adding commands or skills the agent does not actually use

Mutation scope: the frontmatter description, `When to use`, commands/skills tables, workflow steps.

### documentation (`AGENTS.md`, `PLAN.md`, `SPEC.md`, `SOUL.md`, `PRINCIPLES.md`, `DESIGN.md`, `README.md`, `ARCHITECTURE.md`, `TESTS.md`, `SETUP.md`, `RUNBOOK.md`, `CHANGELOG.md`, `SECURITY.md`, `OVERVIEW.md`, `FAQ.md`, `DECISIONS.md`, `DEPENDENCIES.md`, `CONTRIBUTING.md`, `TESTING.md`, `logs/`, `lessons/`, `items/`, `fixes/`, `audits/`, `raw/`, `plans/`, `specs/`, `sources/`, `lib/`, `references/`, `cookbook/`, `knowledge/`, `runbooks/`, `research/`, `official-documentation/`, `context/`, `runbooks/**/*.md`)

Good mutations:
- Use the `code-documentation` contract consistently: Core docs (`README.md`, `ARCHITECTURE.md`, `TESTS.md`), Conditional docs (`SETUP.md`, `RUNBOOK.md`, `CHANGELOG.md`, `SECURITY.md`), Rare docs (`OVERVIEW.md`, `FAQ.md`, `DECISIONS.md`, `DEPENDENCIES.md`), root instruction docs, timestamped AFS docs on `*/YYYY/YYYY-MM-DD/*.md`, and living AFS docs in `specs/`, `sources/`, `lib/`, `references/`, `cookbook/`, `knowledge/`, `runbooks/`, `research/`, `official-documentation/`, and `context/`
- Add missing sections that users repeatedly need to complete the workflow
- Tighten vague instructions so the next action is obvious and testable
- Reorder sections so the highest-priority operational guidance appears earlier
- Add examples, command snippets, or checklists that prevent recurring mistakes
- Remove stale or duplicative content that conflicts with the current repo state
- Clarify audience and scope so the doc stops mixing onboarding, policy, and implementation details
- Promote repo-wide rules into the correct root doc instead of burying them in unrelated READMEs
- Split workflow procedures into `runbooks/` or `RUNBOOK.md` when they are currently scattered across long docs
- Treat `AGENTS.md`, `PLAN.md`, `SPEC.md`, `SOUL.md`, `PRINCIPLES.md`, and `DESIGN.md` as first-class documentation targets that should improve automatically when the repo's operating model changes
- Create or refresh `writing-style-guide.md` when repeated draft corrections point to missing voice guidance rather than missing workflow guidance

Bad mutations:
- Turning operational docs into long narrative essays
- Adding guidance that conflicts with the actual codebase or scripts
- Copying the same instructions into multiple docs without a clear source of truth
- Expanding the doc beyond its core job instead of linking to the right neighboring doc
- Leaving `AGENTS.md`, `PLAN.md`, `SPEC.md`, `SOUL.md`, `PRINCIPLES.md`, or `DESIGN.md` stale after the repo's operating model changes

Mutation scope: headings, ordering, wording, examples, checklists, cross-links, and stale-content removal inside the target documentation file.

### multi-target discipline

- A single task may justify improving multiple skills, multiple agents, or a mix of skills, agents, and documentation.
- Do not mutate multiple targets at the same time. Finish one target's baseline and loop, then move to the next target.
- Prefer shared, upstream fixes. If three failures come from one bad skill, improve that skill instead of patching three downstream agents.
- Prefer `AGENTS.md`, `PLAN.md`, `SPEC.md`, `SOUL.md`, `PRINCIPLES.md`, or `DESIGN.md` when the missing rule is repo-wide rather than skill-specific.
- Prefer `runbooks/` or `RUNBOOK.md` when the missing content is an operational workflow rather than a policy or concept.
- Skip targets whose issues are incidental, one-off, or already addressed by a better upstream fix.
- Transfer memory across related targets. If a documentation fix taught a reusable lesson about instruction ordering or examples, seed that lesson into subsequent skill or agent runs.
- Treat the sequence of targets as an open-ended search process. The goal is not only local fixes, but a better archive of how this repo should improve itself.

---

## eval criteria guide

Every eval must be a yes/no question. Not a scale. Binary.

**Why:** Scales compound variability. Binary evals give a reliable signal across runs.

**Good evals:**
- "Does the output contain all required sections: [list them]?" (structural)
- "Does the skill avoid using any phrase from this list: [banned phrases]?" (specific, greppable)
- "Does the agent route to the correct skill for this scenario?" (binary, checkable)
- "Does the documentation tell the reader exactly what to do next for this scenario?" (binary, checkable)
- "Is the output under [N] words / [N] lines?" (measurable)

**Bad evals:**
- "Is the output good?" (too vague)
- "Rate the quality 1-10" (scale, unreliable)
- "Does it sound right?" (subjective, inconsistent)
- "Is it comprehensive?" (compared to what?)

**Sweet spot:** 3–6 evals. More than 6 and the target starts gaming the criteria instead of actually improving.

**Max evals per target type:**
- Skills: focus on output structure, tone, completeness, anti-pattern avoidance
- Agents: focus on routing accuracy, command selection, workflow coverage
- Documentation: focus on task completion, correctness against repo state, information scent, and anti-staleness

---

## output structure

All eval-loop targets produce files in `auto-improve-[name]/`:

```
auto-improve-[name]/
├── archive/               # stepping-stone variants and notes
├── dashboard.html          # live browser dashboard (auto-refreshes every 10s)
├── self_improvement_memory.md   # synthesized insights, causal hypotheses, transfer notes, next moves
├── results.json            # data file powering the dashboard
├── results.tsv             # score log (tab-separated)
├── changelog.md            # mutation-by-mutation research log
└── [original-filename].baseline   # original file before any changes
```

Memory audit produces:

```
auto-improve-memory/
├── audit-report.md         # findings across all four audit dimensions
└── changelog.md            # what was rewritten, created, or deleted
```

The improved target file is always saved back to its original location during the loop.

**For source-tracked targets** (files belonging to `alvarovillalbaa/agent-suite`), the final improved file is also committed to a new branch and submitted as a GitHub PR — the local file on `main` is never directly committed. **For external targets**, the local file is the final destination with no PR needed.

---

## sub-flow: autoresearch experiment (measurable file metric)

Use this sub-flow when the improvement target is **not a skill, agent, or documentation file** but a code file, asset, or content file where quality is measured by a concrete external metric (execution time, bundle size, test pass rate, CTR score).

This is distinct from the eval loop because:
- The evaluator is **immutable** — you never modify it
- Keep/discard uses **git commit/reset** — not a score comparison
- The target is optimized against a **fixed measurement** — not judged by the LLM
- Strategy **escalates** explicitly by run count

### When to use

- "Make this API endpoint faster" → target: the endpoint file; eval: `pytest bench.py`
- "Reduce bundle size" → target: `vite.config.ts`; eval: `npm run build && du -sb dist/`
- "Improve these headlines" → target: `content/titles.md`; eval: LLM judge script

### Setup

If `.autoresearch/{domain}/{name}/config.cfg` does not exist, run `/ar:setup` first.

Requirements:
- A target file (the one being optimized)
- An evaluation command that prints `metric_name: value` to stdout
- A git repo (for the keep/discard mechanism)
- A direction: is lower or higher better?

### Experiment structure

```
.autoresearch/{domain}/{name}/
├── config.cfg         # target, eval cmd, metric, direction, time_budget_minutes
├── program.md         # objectives, constraints, strategy notes
└── results.tsv        # commit | metric | status | description
```

### Each iteration

1. Read `results.tsv` for history — what worked, what failed, what has not been tried
2. Decide **one** change to the target file. One variable per experiment.
3. Commit: `git add {target} && git commit -m "experiment: {description}"`
4. Run: `python scripts/run_experiment.py --experiment {domain}/{name} --single`
5. Script outputs KEEP, DISCARD, or CRASH with the metric value
6. On DISCARD/CRASH: the script reverts automatically with `git reset --hard HEAD~1`
7. Go to step 1

### Strategy escalation

| Runs | Approach | Risk |
|------|----------|------|
| 1–5 | Low-hanging fruit (obvious improvements, simple cache/index/IO changes) | Low |
| 6–15 | Systematic exploration (vary one parameter at a time) | Medium |
| 16–30 | Structural changes (algorithm swaps, architecture shifts) | High |
| 30+ | Radical experiments (completely different approaches) | Very High |

If no improvement after 20 consecutive runs → update the Strategy section of `program.md`.

### Self-improvement every 10 runs

After every 10 experiments, review `results.tsv` for patterns and update `program.md`:
- Which change types consistently keep?
- Which change types consistently discard?
- What new hypotheses does the data suggest?

### Hard rules for this sub-flow

- **Never modify the evaluator** — it is the ground truth. Changing it invalidates all comparisons.
- **One change per experiment** — you won't know what helped otherwise
- **Simplicity criterion** — same metric with simpler code is a win; removing code is the best outcome
- **5 consecutive crashes → stop** — alert the user, do not burn cycles
- **No new dependencies** — only use what is already in the project

### Stopping conditions

- Pass rate ≥ goal stated in `program.md`
- No improvement after 20+ runs (suggest strategy change)
- Budget cap in `config.cfg` reached
- User interrupts (results.tsv and git log persist for `/ar:resume`)

### Output when done

```
Autoresearch complete — {domain}/{name}
Target: {file}
Metric: {name} ({direction})
Baseline: {start value}
Best: {best value} ({delta}% improvement, run N)
Experiments: {total} ({kept} kept, {discarded} discarded, {crashed} crashed)
Branch: autoresearch/{domain}/{name}
```

---

## the test

A good auto-improve run:

1. **Started with a baseline** — never changed anything before measuring the starting point
2. **Used binary evals only** — no scales, no vibes
3. **Changed one thing at a time** — so you know exactly what helped
4. **Kept a complete log** — every experiment recorded, kept or discarded
5. **Built persistent self-improvement memory** — synthesized insights, causal diagnoses, and next-step plans were stored and reused
6. **Preserved stepping stones** — useful intermediate variants were archived, not thrown away
7. **Improved the score** — measurable improvement from baseline to final
8. **Ran autonomously** — did not stop to ask permission between experiments
9. **Transferred lessons** — improvements in one run informed later runs when relevant
10. **For memory:** produced an audit report before touching any file, then rewrote with evidence
