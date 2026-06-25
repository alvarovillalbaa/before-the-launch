---
name: memory-management
description: >-
  Design, audit, and improve agent memory systems across Claude Code's three
  memory layers (CLAUDE.md, auto-memory, rules/). Use for: reviewing what
  Claude has learned, promoting proven patterns to enforced rules, extracting
  recurring solutions into skills, checking memory health and capacity,
  capturing a pattern explicitly, or wiring up the error-capture hook.
---

# Memory Management

Claude Code has three memory systems that serve different purposes and have different guarantees. Most agents treat them as one blob. This skill treats them as a stack — capture at the bottom, curate in the middle, enforce at the top.

The job of this skill is to move knowledge up the stack deliberately, and prune what no longer belongs.

---

## The Memory Stack

```
┌────────────────────────────────────────────────────────┐
│                   CLAUDE.md + rules/                   │  ← Enforced rules
│  You write. Loaded in full every session. High priority│
├────────────────────────────────────────────────────────┤
│                     Auto-memory                        │  ← Captured patterns
│  Claude writes. MEMORY.md (first 200 lines) + topics   │
├────────────────────────────────────────────────────────┤
│                   Session memory                       │  ← Conversation context
│  Claude writes. Loaded contextually, not always.       │
└────────────────────────────────────────────────────────┘
        ↑ /si:promote          ↑ /si:review
        Self-Improving Agent (this skill)
        ↓ /si:extract      ↓ /si:remember
┌────────────────────────────────────────────────────────┐
│                  .claude/rules/                        │  ← Scoped rules
│  You write. Loads only when matching file types open.  │
└────────────────────────────────────────────────────────┘
```

For the complete technical reference for each layer, read [references/memory-architecture.md](./references/memory-architecture.md).

---

## Commands

| Command | What it does |
|---------|-------------|
| `/si:review` | Analyze MEMORY.md — find promotion candidates, stale entries, consolidation opportunities |
| `/si:promote` | Graduate a pattern from MEMORY.md → CLAUDE.md or `.claude/rules/` |
| `/si:extract` | Turn a proven pattern into a standalone skill |
| `/si:status` | Memory health dashboard — line counts, topic files, recommendations |
| `/si:remember` | Explicitly save important knowledge to auto-memory |

---

## When to use this skill

Trigger this skill when:

- A session ends and something important was learned that should survive future sessions
- MEMORY.md is getting long or the 200-line truncation is cutting off useful context
- The same mistake happens repeatedly even though Claude "knew" the fix from earlier
- A debugging solution was hard to find and will likely recur
- CLAUDE.md keeps growing and needs restructuring into `.claude/rules/`
- A recurring pattern has been confirmed enough times to become an enforced rule
- You want a pattern extracted into a standalone reusable skill

Do not trigger this skill for:
- Ephemeral task details (what you're working on right now)
- Things already in CLAUDE.md
- Single-occurrence events with no reason to recur

---

## Promotion lifecycle

Knowledge moves through a defined lifecycle:

```
1. Claude discovers pattern → auto-memory (MEMORY.md)
2. Pattern recurs 2-3× → /si:review flags it as promotion candidate
3. You approve → /si:promote graduates it to CLAUDE.md or .claude/rules/
4. Pattern becomes an enforced rule, not just background context
5. MEMORY.md entry removed → frees space for new learnings
```

Promotion criteria and scoring are in [references/promotion-rules.md](./references/promotion-rules.md).

---

## Memory review workflow (`/si:review`)

Spawn the `memory-analyst` agent, which:

1. Reads all memory files — `MEMORY.md` (main) and topic files in `~/.claude/projects/*/memory/`
2. Cross-references with `CLAUDE.md` and `.claude/rules/` to find duplicates, gaps, and contradictions
3. Scores each entry on durability × impact × scope
4. Produces a ranked report: promotion candidates, stale entries, consolidation groups, conflicts
5. Does not modify any file — analysis only

Read [references/promotion-rules.md](./references/promotion-rules.md) for the scoring guide and promotion decision rules.

---

## Promotion workflow (`/si:promote`)

When a pattern scores ≥ 6 (durability + impact + scope) and has appeared in 2+ sessions:

### Target selection

**Promote to `CLAUDE.md` when:**
- The rule applies to the entire project
- It is a build command, test convention, or architecture decision
- Any contributor needs to know it
- Adding it keeps CLAUDE.md under 200 lines

**Promote to `.claude/rules/` when:**
- The rule only applies to specific file types
- CLAUDE.md is already near 200 lines
- The rule needs detailed explanation
- You want it to load only when relevant files are open

**Promote to `~/.claude/CLAUDE.md` when:**
- The rule applies to all your projects
- It is a personal preference, not a project convention

### Distillation rule

Transform the learning from descriptive to prescriptive before writing it:

| Before (descriptive) | After (prescriptive) |
|---------------------|---------------------|
| "I noticed the project uses pnpm workspaces. npm install fails." | "Use `pnpm install`, not npm." |
| "Sometimes you need to restart after changing env vars." | "Restart dev server after any `.env` change." |

See the full distillation guide in [references/promotion-rules.md](./references/promotion-rules.md).

---

## Skill extraction workflow (`/si:extract`)

When a proven pattern or debugging solution should become a reusable standalone skill:

Spawn the `skill-extractor` agent with the pattern description. The agent:
1. Identifies: the problem, root cause, solution, edge cases, trigger conditions
2. Generates a valid skill name (lowercase, hyphens, 2–4 words, portable)
3. Creates `SKILL.md` with proper frontmatter including a "Use when:" trigger
4. Runs quality checks: no project-specific paths, runnable code examples, exact error messages for searchability

**Quality bar for extracted skills:**
- Solves one specific, recurring problem
- Works in any project (no hardcoded paths, credentials, or project-specific values)
- Is self-contained (readable without the original context)
- Under 200 lines for SKILL.md

---

## Memory health dashboard (`/si:status`)

Shows:
- MEMORY.md line count vs. 200-line limit
- Topic file count and sizes
- CLAUDE.md line count vs. 150-line soft limit
- `.claude/rules/` file count and last-modified dates
- Top 3 recommended actions

Run this before a big memory cleanup and after. Treat it as a capacity check.

---

## Explicit save (`/si:remember`)

When you want to force a specific pattern into auto-memory immediately:

```
/si:remember "always run pnpm run generate:api after editing openapi.yaml"
```

The command classifies the entry as instruction, lesson, or preference and writes it with proper frontmatter to the correct memory file, then updates `MEMORY.md`.

Use this for:
- Debugging solutions you just found and know will recur
- Confirmed preferences after a user correction
- Patterns that Claude might otherwise forget between sessions

---

## Rules directory patterns

Use `.claude/rules/` files to scope instructions to specific file types. This keeps CLAUDE.md lean and ensures heavy rules only load when they matter.

Format:
```yaml
---
paths:
  - "src/api/**/*.ts"
  - "tests/api/**/*"
---
# Rules that only load when API files are open
```

Full patterns, common rule files, and organization tips in [references/rules-directory-patterns.md](./references/rules-directory-patterns.md).

---

## Error capture hook

This skill ships with an `error-capture` hook (registered automatically when the plugin is installed):

- Fires on every Bash tool call (PostToolUse)
- Matches common error patterns (exit codes, exceptions, build failures, ENOENT, etc.)
- Excludes false positives (error handlers, log references, "no error" phrases)
- When a real error is detected: prints a one-line reminder to save the fix with `/si:remember`
- **Zero output on success** — no overhead unless something fails

The hook does not save anything automatically. It surfaces the signal; you decide whether to save.

---

## Auto-memory capacity rules

| File | Soft limit | Hard limit | Behavior at limit |
|------|-----------|------------|-------------------|
| `MEMORY.md` | 150 lines | 200 lines | Lines after 200 are not loaded at startup |
| `CLAUDE.md` | 150 lines | No hard limit | Adherence decreases with length |
| Topic files | No limit | No limit | Loaded on demand, not at startup |
| Rules files | No limit per file | No limit | Loaded only when paths match |

Strategy:
- When MEMORY.md approaches 150 lines → run `/si:review` and promote proven patterns
- When CLAUDE.md approaches 150 lines → move scoped rules to `.claude/rules/`
- When a rule belongs to all projects → move it to `~/.claude/CLAUDE.md`
- Promote first, then delete the source entry — do not duplicate

---

## Priority ordering

When entries conflict:

1. **CLAUDE.md** — explicit instructions, highest priority, always loaded
2. **`.claude/rules/`** — scoped instructions, high priority, conditional load
3. **Auto-memory MEMORY.md** — learned patterns, medium priority, truncated at 200 lines
4. **Session memory** — historical context, low priority, contextual load

An entry in CLAUDE.md always overrides the same entry in MEMORY.md. After promoting, remove the memory entry.

---

## Anti-patterns

- Treating MEMORY.md as a permanent archive (it is a scratchpad — curate it)
- Duplicating a CLAUDE.md rule in MEMORY.md (wastes space, causes confusion)
- Promoting one-time debugging notes that will never recur
- Promoting unstable patterns (API version numbers, temporary workarounds)
- Storing credentials or secrets in any memory file — never
- Letting MEMORY.md grow past 200 lines without pruning
- Letting CLAUDE.md grow past 200 lines without moving to rules/

---

## Related skills

- **auto-improve** — memory audit sub-flow inside auto-improve performs a structured four-dimension review of all memory files and rewrites stale, redundant, or contradictory entries
- **second-brain** — for knowledge that belongs in a maintained AFS wiki rather than project-scoped memory files
