# Skill Extraction — Growing the Skill Library

Run this reference when: a task produced non-obvious knowledge worth preserving as a reusable skill; the user says "save this as a skill", "extract a skill", or "what did we learn?"; `/claudeception` is invoked; debugging required >10 minutes of investigation and the root cause wasn't obvious from documentation; or the same workaround was reached through trial-and-error rather than direct lookup.

> Design basis: Voyager's ever-growing skill library, CASCADE's meta-skill codification, SEAgent's experiential learning, and Reflexion's verbal reinforcement. Source: `claudeception` (see `resources/research-references.md` in the original skill for full citations).

---

## When to Extract a Skill (Self-Reflection Prompts)

After completing any significant task, ask:

- "What did I just learn that wasn't obvious before starting?"
- "If I faced this exact problem again, what would I wish I knew?"
- "What error message or symptom led me here, and what was the actual cause?"
- "Is this pattern specific to this project, or would it help in similar projects?"
- "What would I tell a colleague who hits this same issue?"

Extract when the answer to any of these is concrete and specific.

**Extract** when you encounter:
1. **Non-obvious solutions** — debugging or workarounds that required meaningful investigation
2. **Project-specific patterns** — conventions or architecture decisions not documented elsewhere
3. **Misleading errors** — error messages whose actual root cause differs from what they suggest
4. **Tool integration gaps** — how to use a library or API in ways its docs don't cover well
5. **Workflow optimizations** — multi-step processes that can be reliably streamlined

**Don't extract** when:
- The solution is a direct documentation lookup
- The knowledge is ephemeral or session-specific
- It would duplicate what official docs already say (link instead)

---

## Step 1 — Check for Existing Skills

Before creating, search for related skills:

```sh
# List all SKILL.md files (project-first, then user-level)
rg --files -g 'SKILL.md' .claude/skills ~/.claude/skills 2>/dev/null

# Search by keyword or technology
rg -i "keyword1|keyword2" .claude/skills ~/.claude/skills 2>/dev/null

# Search by exact error message
rg -F "exact error text" .claude/skills ~/.claude/skills 2>/dev/null
```

**Decision matrix:**

| Found | Action |
|-------|--------|
| Nothing related | Create new |
| Same trigger, same fix | Update existing — bump version (e.g., `1.0.0 → 1.1.0`) |
| Same trigger, different root cause | Create new, add `See also:` links both ways |
| Same domain, different trigger | Update existing with a new "Variant" subsection |
| Same domain, unrelated problem | Create new, add `See also:` in Notes |
| Stale or wrong | Mark deprecated in Notes, add replacement link |

**Versioning conventions:** patch = typos/wording, minor = new scenario or variant, major = breaking change or deprecation.

---

## Step 2 — Research Before Writing

For technology-specific skills, search before finalizing content:

**Always search for:**
- Current documentation or API changes for the technology involved
- Known gotchas or pitfalls others have documented
- Alternative approaches or preferred patterns as of 2026
- Official recommendations that may have superseded older patterns

**Search template:**
```
"[technology] [problem/feature] best practices 2026"
"[technology] [exact error message] solution"
"[technology] [pattern] official docs"
```

**Skip searching when:**
- The knowledge is project-internal and not documented anywhere externally
- The solution is clearly context-specific to this codebase
- Generic stable programming concepts are involved

Always add a `## References` section with source URLs if web sources were consulted.

---

## Step 3 — Structure the Skill

```markdown
---
name: [descriptive-kebab-case-name]
description: |
  [Precise description enabling semantic matching. Include:
  (1) what problem this solves,
  (2) specific trigger conditions — exact error messages or symptoms,
  (3) key technologies/frameworks involved.
  Use phrases like "Use when:", "Helps with:", "Solves:"]
author: Claude Code
version: 1.0.0
date: YYYY-MM-DD
---

# [Skill Name]

## Problem
[Clear description of what this solves and why it's non-obvious]

## Context / Trigger Conditions
[When to activate this skill — exact error messages, symptoms, environmental conditions]

## Solution
[Step-by-step instructions with code examples]

## Verification
[How to confirm the solution worked — expected outputs, test steps]

## Example
[Concrete before/after showing the skill applied]

## Notes
[Caveats, edge cases, when NOT to use this, related skills]

## References
[Source URLs if web research was done — omit section if not applicable]
```

Use `templates/new-skill-template.md` as the working scaffold.

---

## Step 4 — Write an Effective Description

The `description` field drives semantic matching. Vague descriptions mean the skill never surfaces when needed.

**Bad:** `"Helps with React problems"`
**Good:**
```
description: |
  Fix for "ENOENT: no such file or directory" errors when running npm scripts
  in monorepos. Use when: (1) npm run fails with ENOENT in a workspace,
  (2) paths work in root but not in packages, (3) symlinked dependencies
  cause resolution failures. Covers node_modules resolution in Lerna,
  Turborepo, and npm workspaces.
```

Include: specific error text, framework names, symptom descriptions, and action phrases.

---

## Step 5 — Quality Gates

Before saving, verify:

- [ ] Name is descriptive and uses `kebab-case`
- [ ] Description includes specific trigger conditions (error messages or symptoms)
- [ ] Problem is clearly stated
- [ ] Solution is step-by-step and actionable
- [ ] Solution has actually been verified to work — not theoretical
- [ ] Verification steps are included
- [ ] Example is concrete and realistic (before/after)
- [ ] No sensitive information (credentials, internal URLs, secrets)
- [ ] Doesn't duplicate official docs — links to them instead
- [ ] Web research conducted and `## References` added if applicable
- [ ] Current best practices (2026) incorporated when relevant

---

## Step 6 — Save Location

- **Project-specific** (only relevant here): `.claude/skills/[skill-name]/SKILL.md`
- **User-wide** (reusable across projects): `~/.claude/skills/[skill-name]/SKILL.md`

Add supporting scripts in a `scripts/` subdirectory if the skill benefits from executable helpers.

---

## Retrospective Mode (`/claudeception`)

When invoked at session end to review learnings:

1. **Review the session** — analyze conversation history for extractable knowledge
2. **Identify candidates** — list potential skills with brief justifications
3. **Prioritize** — focus on highest-value, most reusable knowledge (typically 1–3 per session)
4. **Extract** — create skills for the top candidates using the process above
5. **Summarize** — report what skills were created and why

---

## Skill Lifecycle

Skills should evolve:

1. **Creation** — initial extraction with documented verification
2. **Refinement** — update with additional use cases or edge cases (`minor` version bump)
3. **Deprecation** — mark as deprecated when underlying tools change; add replacement link
4. **Archival** — remove or archive when no longer relevant

---

## Relationship to Self-Improvement and Autoimprove

| Mode | Output | Granularity |
|------|--------|------------|
| Skill extraction (this file) | New `SKILL.md` files | New skill added to library |
| Self-improvement | Updates to existing `references/*.md` | Pattern added to existing guidance |
| Autoimprove | Optimized reference file copy | Existing guidance refined via scoring loop |

- Use **skill extraction** when knowledge is novel enough to deserve its own skill file
- Use **self-improvement** when knowledge fits as an addition to an existing reference
- Use **autoimprove** when an existing reference has a measurable quality problem

---

## Anti-Patterns

- **Over-extraction**: mundane solutions don't need preservation
- **Vague descriptions**: won't surface during semantic matching
- **Unverified solutions**: only extract what actually worked
- **Documentation duplication**: link to official docs and add what's missing
- **Stale knowledge**: mark skills with versions and dates; update or deprecate as needed
