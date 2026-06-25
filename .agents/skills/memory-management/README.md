# Memory Management

Design, audit, and improve agent memory systems across Claude Code's three memory layers.

## What this skill covers

- The full Claude Code memory stack: CLAUDE.md, auto-memory (MEMORY.md), session memory, and `.claude/rules/`
- The curation lifecycle: capture → review → promote → enforce
- Rules directory patterns for scoped, file-type-specific instructions
- Memory health monitoring and capacity planning
- Error-capture hook for surfacing debugging solutions automatically

## Commands

| Command | What it does |
|---------|-------------|
| `/si:review` | Analyze auto-memory for promotion candidates and stale entries |
| `/si:promote` | Graduate a proven pattern to CLAUDE.md or `.claude/rules/` |
| `/si:extract` | Turn a pattern into a standalone portable skill |
| `/si:status` | Memory health dashboard — line counts, capacity warnings |
| `/si:remember` | Explicitly save a pattern to auto-memory right now |

## Agents

- `agents/memory-analyst.md` — read-only memory analyzer, spawned by `/si:review`
- `agents/skill-extractor.md` — skill generator, spawned by `/si:extract`

## References

- `references/memory-architecture.md` — technical reference for all three memory systems
- `references/promotion-rules.md` — scoring guide and distillation rules for promotion
- `references/rules-directory-patterns.md` — path scoping patterns for `.claude/rules/`

## Install

```bash
npx -y skills add ./learning-system/skills/memory-management
mkdir -p ~/.codex/skills
cp -R learning-system/skills/memory-management ~/.codex/skills/
```

Codex `$skill-installer` path:

```text
https://github.com/alvarovillalbaa/plugins/tree/main/learning-system/skills/memory-management
```
