# Claude Code Memory Architecture

Complete reference for how Claude Code's memory systems work together — what each layer stores, how it loads, and how they interact.

## Three Memory Systems

### 1. CLAUDE.md Files (You → Claude)

**Purpose:** Persistent instructions you write to guide Claude's behavior.

**Locations (in priority order):**

| Scope | Path | Shared |
|-------|------|--------|
| Managed policy | `/etc/claude-code/CLAUDE.md` (Linux) | All users |
| Project | `./CLAUDE.md` or `./.claude/CLAUDE.md` | Team (git) |
| User | `~/.claude/CLAUDE.md` | Just you |
| Local | `./CLAUDE.local.md` | Just you |

**Loading:** Full file, every session. Files higher in the directory tree load first. More specific locations take precedence over broader ones.

**Key facts:**
- Target under 200 lines per file
- Use `@path/to/file` syntax to import additional files (max 5 hops deep)
- Can import with `@README` or `@docs/guide.md`
- `CLAUDE.local.md` is auto-added to `.gitignore`

---

### 2. Auto-Memory (Claude → Claude)

**Purpose:** Notes Claude writes to itself about project patterns and learnings.

**Location:** `~/.claude/projects/<project-path>/memory/`

**Structure:**
```
~/.claude/projects/<project-path>/memory/
├── MEMORY.md           # Main file (first 200 lines loaded at startup)
├── debugging.md        # Topic file (loaded on demand)
├── patterns.md         # Topic file (loaded on demand)
└── ...                 # More topic files as needed
```

**Key facts:**
- Enabled by default since v2.1.32
- Only the **first 200 lines** of MEMORY.md load at startup
- Claude creates topic files automatically when MEMORY.md grows long
- Git repo root determines the project path
- Git worktrees get separate memory directories
- Local only — not shared via git
- Toggle with `/memory`, settings, or `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1`
- Subagents can have their own auto-memory

**What it captures:**
- Build commands and test conventions
- Debugging solutions and error patterns
- Code style preferences and architecture notes
- Communication preferences and workflow habits

---

### 3. Session Memory (Claude → Claude)

**Purpose:** Conversation summaries for cross-session continuity.

**Location:** `~/.claude/projects/<project-path>/<session>/session-memory/`

**Key facts:**
- Saves what was discussed and decided in specific sessions
- Provides "What did we do yesterday?" context
- Loaded contextually (relevant past sessions, not all at once)
- Use `/remember` to turn session memory into permanent project knowledge

---

### 4. Rules Directory (You → Claude, scoped)

**Purpose:** Modular instructions scoped to specific file types.

**Location:** `.claude/rules/*.md`

**Key facts:**
- Uses YAML frontmatter with `paths` field for scoping
- Only loads when Claude works with matching files
- Recursive — can be organized into subdirectories
- Same priority as `.claude/CLAUDE.md`
- Excellent for keeping CLAUDE.md under 200 lines

```yaml
---
paths:
  - "src/api/**/*.ts"
---
# API rules only load when working with API files
```

---

## Memory Priority

When entries conflict:

1. **CLAUDE.md** — highest: explicit instructions you wrote
2. **`.claude/rules/`** — high: scoped instructions you wrote
3. **Auto-memory MEMORY.md** — medium: learned patterns, truncated at 200 lines
4. **Session memory** — low: historical context from past sessions

---

## Capacity Planning

| File | Soft limit | Hard limit | What happens at limit |
|------|-----------|------------|----------------------|
| MEMORY.md | 150 lines | 200 lines | Lines after 200 not loaded at startup |
| CLAUDE.md | 150 lines | No hard limit | Adherence decreases with length |
| Topic files | No limit | No limit | Loaded on demand, not at startup |
| Rules files | No limit per file | No limit | Only loaded when paths match |

---

## The Curation Layer

Auto-memory is excellent at capturing. It has no judgment about:
- Which learnings are temporary vs. permanent
- Which patterns should become enforced rules
- When the 200-line limit is wasting space on stale entries
- Which solutions are good enough to become reusable skills

The memory-management skill adds this judgment layer:

```
Auto-memory captures → This skill curates → CLAUDE.md enforces

MEMORY.md (raw notes)  →  /si:review (analyze)  →  /si:promote (graduate)
                                                         ↓
                                                   CLAUDE.md or
                                                   .claude/rules/
                                                   (enforced rules)
```

**Why this matters:** MEMORY.md entries are background context truncated at 200 lines. CLAUDE.md entries are high-priority instructions loaded in full. Promoting a pattern from memory to rules fundamentally changes how Claude treats it.

---

## Best Practices

1. **Keep MEMORY.md lean** — promote proven patterns, delete stale ones
2. **Keep CLAUDE.md under 200 lines** — split into `rules/` if growing
3. **Don't duplicate** — if it's in CLAUDE.md, remove it from MEMORY.md
4. **Scope rules** — use `.claude/rules/` with paths for file-type-specific patterns
5. **Review regularly** — memory files go stale after refactors
6. **Use `/si:status`** — monitor capacity before it becomes a problem
