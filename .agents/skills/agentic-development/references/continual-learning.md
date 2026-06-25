# Continual Learning — Maintaining CLAUDE.md / AGENTS.md Memory

Run this reference when: the user asks to "update memory", "mine prior sessions", "keep CLAUDE.md current", or "run continual learning"; the Stop cadence gate fires and triggers the learning loop; or you want to extract durable user preferences and stable workspace facts from conversation transcripts into the persistent instruction file the tool loads on every session.

> Design basis: the `continual-learning` Cursor plugin (github.com/cursor/plugins/tree/main/continual-learning). The key ideas are cadence-gated triggering, incremental transcript mining, and disciplined bullet-only writes to the two learned sections.

---

## What This Maintains

The target file is whichever persistent instruction file the tool reads on every session:

| Tool | File |
|------|------|
| Claude Code | `CLAUDE.md` (project root or `~/.claude/CLAUDE.md` for user-wide) |
| Cursor / Windsurf | `AGENTS.md` |
| Any repo | Whichever of `AGENTS.md`, `CLAUDE.md`, `SOUL.md`, `PRINCIPLES.md` the repo has chosen |

The update writes **only** two sections:

```markdown
## Learned User Preferences

- [plain bullet — recurring preferences or corrections observed across sessions]

## Learned Workspace Facts

- [plain bullet — stable facts about this project that the tool should always know]
```

**Max 12 bullets per section.** No evidence tags, no confidence scores, no metadata blocks, no process instructions.

---

## What Qualifies as a Durable Memory Item

**Include:**
- Recurring corrections the user has given 2+ times ("always use Tailwind classes, never inline styles")
- Stable workspace facts not obvious from the code ("Django API lives at `/api/v2/`, Next.js frontend at `/app/`")
- Persistent preferences about output style, commit format, test strategy, or PR workflow
- Tool or library choices the project has settled on ("we use Zod for all schema validation")

**Exclude:**
- One-off instructions specific to a single task
- Secrets, credentials, internal URLs
- Transient state ("the deploy is broken right now")
- Preferences already documented in README, CONTRIBUTING.md, or code comments
- Anything that changes frequently

---

## Cadence Gate — When to Trigger

Don't run on every session. Only trigger when all three conditions are met:

| Condition | Default | Trial mode (first 24h) |
|-----------|---------|------------------------|
| Turns since last run | ≥ 10 completed turns | ≥ 3 |
| Minutes since last run | ≥ 120 min | ≥ 15 min |
| Transcript has advanced | mtime newer than last indexed mtime | same |

State is persisted in `memory/continual-learning-state.json`:

```json
{
  "version": 1,
  "lastRunAtMs": 0,
  "turnsSinceLastRun": 0,
  "lastTranscriptMtimeMs": null,
  "trialStartedAtMs": null
}
```

Only count a turn when `status === "completed"` and `loop_count === 0` (i.e., not inside a tool loop, not an aborted session).

---

## Incremental Transcript Index

To avoid re-processing the entire transcript history on every run, maintain a JSON index:

```
memory/continual-learning-index.json
```

```json
{
  "transcripts": {
    "/path/to/transcript-1.json": { "mtimeMs": 1737000000000 },
    "/path/to/transcript-2.json": { "mtimeMs": 1737003600000 }
  }
}
```

**Processing rules:**
1. Only inspect transcripts that are **absent from the index** or have **newer mtime than indexed**.
2. After processing, update the index with the current mtime.
3. Remove index entries for transcript files that no longer exist.
4. If no transcripts are new or changed, skip the update entirely.

---

## Update Discipline

When writing to `CLAUDE.md` / `AGENTS.md`:

1. **Read first** — load the existing file before writing anything
2. **Update in place** — if a new bullet semantically matches an existing one, update the existing bullet rather than adding a new one
3. **Add only net-new bullets** — don't duplicate semantically similar items
4. **Deduplicate** — before adding, check if the same fact is already expressed
5. **Cap at 12 bullets per section** — if at the cap, replace the weakest/most generic item rather than appending
6. **Never rewrite the whole file** — only touch the two learned sections; preserve everything else unchanged
7. **If no changes** — leave `CLAUDE.md` unchanged; still refresh the index

---

## Subagent Delegation Pattern

The learning loop uses a clean separation:

```
continual-learning (parent — orchestration only)
  └── agents-memory-updater (subagent — mines transcripts + writes CLAUDE.md)
```

The parent skill does **nothing** except invoke the subagent and return its result. It does not read transcripts or touch files directly. This keeps the parent skill lightweight and prevents context bloat from pulling transcript content into the main flow.

See `references/agents/agents-memory-updater.md` for the subagent definition.

---

## Workflow

### Parent (continual-learning)

1. Check cadence state in `memory/continual-learning-state.json`
2. If cadence conditions are not met: increment `turnsSinceLastRun`, save state, stop
3. If cadence conditions are met: invoke `agents-memory-updater` with the index path
4. Return the subagent result
5. Update state: reset `turnsSinceLastRun = 0`, set `lastRunAtMs = now`, set `lastTranscriptMtimeMs`

### Subagent (agents-memory-updater)

1. Read existing `CLAUDE.md` / `AGENTS.md` (or create with empty learned sections if absent)
2. Load `memory/continual-learning-index.json` if present
3. Find transcript files newer than the index (or absent from it)
4. Extract only durable, reusable items from those transcripts
5. Apply update discipline (in-place updates, dedup, cap enforcement)
6. Write updated `CLAUDE.md` / `AGENTS.md` if changed
7. Refresh the index
8. If nothing changed: respond exactly `No high-signal memory updates.`

---

## Output Format

**When updates were made:**

```markdown
## Continual Learning Update

Updated `CLAUDE.md`:

### Learned User Preferences (3 bullets)
- Added: "Always use named exports, never default exports"
- Updated: "Prefer Zod schemas..." → "Always use Zod schemas for API boundaries, including internal service calls"

### Learned Workspace Facts (2 bullets)
- Added: "Supabase project ID is stored in .env.local, not .env"

Transcripts processed: 4 new, 1 updated
```

**When nothing changed:**

```
No high-signal memory updates.
```

---

## Relationship to Other Memory Systems

| System | Format | Lives in | Updated when |
|--------|--------|----------|-------------|
| Continual learning (this file) | Plain bullets in `CLAUDE.md` | Instruction file loaded every session | Cadence-gated, transcript mining |
| Self-improvement patterns | JSON + evolution markers in `references/` | Skill reference files | After errors or recurring patterns |
| Semantic memory | JSON in `memory/semantic-patterns.json` | Skill memory dir | Manual or self-improvement loop |

Continual learning targets the tool's **session context** (what the agent knows before it reads any code). Self-improvement targets the **skill guidance** (how the agent behaves on specific tasks). They are complementary — run both.

---

## Hook Registration (Claude Code)

Wire a Stop hook to track turns and emit the followup when cadence fires. A minimal bash equivalent of the full TypeScript hook:

```bash
# hooks/continual-learning-stop.sh
#!/usr/bin/env bash
# Reads JSON from stdin (StopHookInput), updates state, emits followup when cadence fires.
# Full TypeScript reference: github.com/cursor/plugins/tree/main/continual-learning/hooks/continual-learning-stop.ts
STATE_FILE="memory/continual-learning-state.json"
# ... cadence logic ...
# On trigger: emit {"followup_message": "Run continual-learning skill"}
```

For the full production implementation, use the TypeScript hook from the `cursor/plugins` repo (requires Bun). The bash version above is a conceptual stub — adapt to the project's hook runner.

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash /path/to/agentic-development/hooks/continual-learning-stop.sh"
          }
        ]
      }
    ]
  }
}
```

---

## Env Overrides

| Variable | Default | Purpose |
|----------|---------|---------|
| `CONTINUAL_LEARNING_MIN_TURNS` | 10 | Turns before triggering |
| `CONTINUAL_LEARNING_MIN_MINUTES` | 120 | Minutes before triggering |
| `CONTINUAL_LEARNING_TRIAL_MODE` | false | Enable lower cadence thresholds |
| `CONTINUAL_LEARNING_TRIAL_MIN_TURNS` | 3 | Trial mode turns threshold |
| `CONTINUAL_LEARNING_TRIAL_MIN_MINUTES` | 15 | Trial mode minutes threshold |
| `CONTINUAL_LEARNING_TRIAL_DURATION_MINUTES` | 1440 (24h) | How long trial mode lasts |
