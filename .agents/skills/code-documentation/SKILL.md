---
name: code-documentation
description: This skill should be used when the user asks to write, update, review, scaffold, move, remove, or continuously improve documentation for code, folders, services, repos, workflows, architectural decisions, or operational processes. Trigger for inline docs, `README.md`, `ARCHITECTURE.md`, `TESTS.md`, `SETUP.md`, `RUNBOOK.md`, `CHANGELOG.md`, `SECURITY.md`, `OVERVIEW.md`, `FAQ.md`, `DECISIONS.md`, `DEPENDENCIES.md`, `AGENTS.md`, `PLAN.md`, `SPEC.md`, `SOUL.md`, `PRINCIPLES.md`, `DESIGN.md`, `logs/`, `lessons/`, `items/`, `fixes/`, `audits/`, `raw/`, `plans/`, `specs/`, `sources/`, `lib/`, `references/`, `cookbook/`, `knowledge/`, `runbooks/`, `research/`, `official-documentation/`, `context/`, MDX docs, JSDoc/TSDoc, docstrings, ADRs, post-mortems, migration guides, documentation cleanups, and documentation-impact reviews.
version: 2.0.0
---

# Code Documentation

Last updated: 2026-05-13

Write documentation that stays close to the code, stays coherent over time, and gives humans and agents one clear place to look.

This skill owns the documentation contract, not only doc generation. Use it to:

- create or update docs
- continuously improve stale docs
- use docs as reference and historical record
- detect conflicting live-vs-historical documentation
- move, merge, or remove misplaced docs so the repo has one clear source of truth
- autonomously research a project and generate a complete documentation website

## Core model

Documentation in this repo falls into seven surfaces:

1. **Inline docs** — docstrings, JSDoc/TSDoc, comments, types
2. **In-folder docs** — `README.md`, `ARCHITECTURE.md`, `TESTS.md`, and related files that explain one folder
3. **Root instruction docs** — `AGENTS.md`, `PLAN.md`, `SPEC.md`, `SOUL.md`, `PRINCIPLES.md`, `DESIGN.md`
4. **Timestamped history** — logs, lessons, items, fixes, audits, raw material, implementation plans
5. **Living source-of-truth docs** — specs, references, cookbook, knowledge, runbooks, research, official docs, context, source registries, generated libraries
6. **Domain-specific AFS paths** — `<domain>/<folder>/` only when the repo genuinely needs domain-specific surfaces such as `health/` or `investing/`
7. **Documentation websites** — Nextra or equivalent sites for projects with external users; generated via the `/docs-site` command after a full project research phase

Default rule: put the doc in the narrowest place that future readers will naturally check first. Use surface 7 only when the project has external users or when in-repo Markdown is insufficient.

## Quick routing

| Need | Default location |
|---|---|
| Explain a public function, component, hook, API surface, or class | Inline docs |
| Explain what one folder is for and how to navigate it | `README.md` in that folder |
| Explain internal design or data flow for one folder | `ARCHITECTURE.md` in that folder |
| Explain how to test one folder or service | `TESTS.md` in that folder |
| Explain setup for one area | `SETUP.md` in that folder |
| Explain a folder-local workflow | `RUNBOOK.md` in that folder |
| Record repo-wide customization to the user's needs, codebase, and ways of working | `AGENTS.md` |
| Record how plans should be made and reviewed | `PLAN.md` |
| Record how specs should be written and maintained | `SPEC.md` |
| Record the agents' personality and collaboration stance | `SOUL.md` |
| Record invariants, constraints, and max/min rules | `PRINCIPLES.md` |
| Record the design system or frontend interaction language | `DESIGN.md` |
| Append a terse change note | `logs/YYYY/YYYY-MM-DD/*.md` |
| Record a verified reusable lesson | `lessons/YYYY/YYYY-MM-DD/*.md` |
| Record a durable fact about the user, company, or project | `items/YYYY/YYYY-MM-DD/*.md` |
| Record a reusable non-obvious fix | `fixes/YYYY/YYYY-MM-DD/*.md` |
| Record an analytical report, ADR, post-mortem, or audit | `audits/YYYY/YYYY-MM-DD/` |
| Store raw material pending ingest | `raw/YYYY/YYYY-MM-DD/` unless the repo already has a different ingest convention |
| Record an implementation plan or plan-driven-development artifact | `plans/YYYY/YYYY-MM-DD/` |
| Record a living desired-state behavior contract | `specs/` |
| Keep monitored URLs and source registries | `sources/` |
| Keep generated drafts, registries, or reusable library artifacts | `lib/` |
| Keep stable code, API, or URL references | `references/` |
| Keep "how we actually do this here" technical recipes | `cookbook/` |
| Keep timeless canonical knowledge | `knowledge/` |
| Keep operational procedures | `runbooks/` |
| Keep ongoing research | `research/` |
| Keep copied or vendor official documentation | `official-documentation/` |
| Keep contextual docs such as goals, roadmap, budget, or preferences | `context/` |

## Final AFS

The final Agentic File System is:

### Memory

- `logs/` — brief logs, 2 lines max, append to the latest date file, about every meaningful code or doc change
- `lessons/` — lessons learned from experience, related to code
- `items/` — facts about the user, company, customers, environments, or other durable context
- `fixes/` — reusable error solutions and debugging resolutions

### Operational

- `audits/` — comprehensive reports and analytical audits
- `raw/` — raw source material waiting to be ingested and then promoted into `knowledge/` or another canonical destination
- `<domain>/<folder>/` — additional domain-specific paths only when the domain genuinely needs them
- `plans/` — implementation plans and plan-driven-development artifacts
- `specs/` — living specs describing how something should behave
- `sources/` — URL-based source registries worth monitoring over time
- `lib/` — generated drafts, registries, support artifacts, or other reusable generated content

### Source of truth

- `references/` — code, URL, API, schema, and factual references
- `cookbook/` — technical guides for how something is actually done in this codebase
- `knowledge/` — timeless maintained knowledge about the codebase and how to do things
- `runbooks/` — operational procedures and exact workflows
- `research/` — continuous research on engineering topics
- `official-documentation/` — copied external official documentation; not continuously iterated
- `context/` — contextual docs such as `VALUES.md`, `USER.md`, `PREFERENCES.md`, `context/goals/`, `context/budget/`, `context/roadmap/`

## Timestamped vs living docs

Use one rule only for timestamped material:

- `*/YYYY/YYYY-MM-DD/*.md`

Default timestamped families:

- `logs/`
- `lessons/`
- `items/`
- `fixes/`
- `audits/`
- `raw/`
- `plans/`

Default living documentation families:

- `specs/`
- `sources/`
- `lib/`
- `references/`
- `cookbook/`
- `knowledge/`
- `runbooks/`
- `research/`
- `official-documentation/`
- `context/`
- root instruction docs
- in-folder docs

Important distinction:

- timestamped docs are historical evidence or work-in-time artifacts
- living docs are the current source of truth

Do not keep the same operational guidance as both a live doc and a timestamped doc unless the timestamped doc is clearly historical context and the living doc clearly owns the current rule.

## Last-updated rule

Every living documentation file must include:

```markdown
Last updated: YYYY-MM-DD
```

Place it directly under the H1 or immediately after frontmatter. Refresh it whenever the file is touched.

This applies to:

- `AGENTS.md`, `PLAN.md`, `SPEC.md`, `SOUL.md`, `PRINCIPLES.md`, `DESIGN.md`
- in-folder docs such as `README.md`, `ARCHITECTURE.md`, `TESTS.md`, `SETUP.md`, `RUNBOOK.md`, `SECURITY.md`, `OVERVIEW.md`, `FAQ.md`, `DECISIONS.md`, `DEPENDENCIES.md`
- living AFS docs in `specs/`, `sources/`, `lib/`, `references/`, `cookbook/`, `knowledge/`, `runbooks/`, `research/`, `official-documentation/`, and `context/`

## In-folder documentation contract

Outside the AFS folders, every meaningful code folder can carry its own documentation.

### Core

Always consider these first:

- `README.md`
- `ARCHITECTURE.md`
- `TESTS.md`

### Conditional

Add only when the folder actually needs them:

- `SETUP.md`
- `RUNBOOK.md`
- `CHANGELOG.md`
- `SECURITY.md`

### Rare

Use when the domain justifies them:

- `OVERVIEW.md`
- `FAQ.md`
- `DECISIONS.md`
- `DEPENDENCIES.md`

### File intent

- `README.md` — entry point, purpose, usage, links to neighboring docs
- `ARCHITECTURE.md` — internals, boundaries, flows, and design decisions
- `TESTS.md` — how to run tests, patterns, fixtures, expectations
- `SETUP.md` — non-obvious environment and initialization steps
- `RUNBOOK.md` — local operational workflow for this folder
- `CHANGELOG.md` — user-facing or package-facing release history
- `SECURITY.md` — security boundaries, secrets handling, abuse cases, review expectations
- `OVERVIEW.md` — concept-first orientation when README would become too dense
- `FAQ.md` — repeated questions and troubleshooting
- `DECISIONS.md` — folder-local decisions that do not justify standalone ADRs
- `DEPENDENCIES.md` — dependency map, contracts, and upgrade notes

Use the smallest set that makes the folder legible.

## Root instruction docs are documentation

Treat these as first-class documentation, not miscellaneous meta files:

- `AGENTS.md` — general customization to the user's needs, codebase, and ways of working
- `PLAN.md` — customize how planning should be done and what plans should look like
- `SPEC.md` — customize how specs should look and what they must define
- `SOUL.md` — provide personality to AI agents
- `PRINCIPLES.md` — customize principles, constraints, and max/min rules that should always hold
- `DESIGN.md` — define the design system and frontend interaction language

When the repo's operating model changes, update these the same way you would update a README or runbook.

## Conflict handling

Before creating or expanding docs:

1. Check whether the topic already exists in both a historical path and a living path.
2. Decide which file should own the current truth.
3. Move misplaced docs with plain `mv` and normalize missing structure with plain `mkdir`.
4. Remove redundant docs when they add no historical value and only create drift.
5. Keep timestamped docs as evidence, not as the current contract.

Examples:

- If a one-off implementation plan became the durable policy, keep the original under `plans/YYYY/YYYY-MM-DD/` and promote the lasting rule into `PLAN.md`, `SPEC.md`, `runbooks/`, `cookbook/`, or `knowledge/`.
- If an old `docs/memories/` or `docs/guides/` tree conflicts with the final AFS, move or remove it instead of preserving two competing systems.

## Relationship to other skills

- `auto-improve` should use this taxonomy as its documentation contract and treat root instruction docs as first-class mutation targets.
- `agentic-development` should consult this skill before writing plans, specs, runbooks, or promoted learning artifacts.
- `second-brain` owns the broader AFS and the `raw/ -> knowledge/` compilation model; this skill owns how documentation is routed inside that filesystem.
- `memory-management` can shape how memory systems persist and retrieve information, but durable human-readable documentation should still route through this skill's contract.

## Workflow

1. Check repo-local rules first: `AGENTS.md`, `CLAUDE.md`, project READMEs, `BRAIN.md`, or existing doc conventions.
2. Detect whether the repo already has a working AFS or whether legacy paths conflict with it.
3. Decide the surface: inline doc, folder doc, root instruction doc, timestamped historical doc, or living source-of-truth doc.
4. Update the closest existing document before creating a new one.
5. For timestamped destinations, use `*/YYYY/YYYY-MM-DD/*.md` and normalize directories with `mkdir` if needed.
6. For living docs, add or refresh `Last updated: YYYY-MM-DD`.
7. If durable guidance is buried in a historical note, promote it upstream into the proper living doc.
8. Move or delete docs that no longer fit the contract.
9. Link neighboring docs so readers can move from overview to procedure to deeper design.
10. If the task is a documentation impact review, inspect the diff and map changed code to the right doc surfaces.

## Quality bar

Good documentation lets the next engineer or agent answer all of these quickly:

- What is this?
- When should I use it?
- What do I do next?
- What can go wrong?
- Where does the current truth live?
- Where is the historical trail if I need it?

Prefer short, high-signal docs over exhaustive prose. If a doc becomes dense, split the durable parts into the right living doc and keep only the historical context in timestamped artifacts.

## Documentation website workflow

Use the `/docs-site` command to trigger this workflow. Work through all five phases in sequence.

### Phase 1 — Project research

Before writing anything, build a complete mental model of the project.

Use `references/project-research.md` for the full protocol. Summary:

1. Read all existing docs and the package manifest.
2. Map the full directory tree.
3. Read entry points to understand the public surface.
4. Read at least 10 representative source files.
5. Read tests and examples — they reveal intent better than source.
6. Build a **feature inventory**: every user-facing capability, one line each.
7. Identify the project philosophy and non-obvious design decisions.

Do not write documentation until the feature inventory is complete.

### Phase 2 — Structure design

Group by user intent, not by code structure:

- **Getting Started** — install, quick start, first result
- **Concepts** — mental models and philosophy (at least two concept articles)
- **Guides** — task-oriented how-tos
- **Reference** — exhaustive API/CLI/config reference
- **Examples** (optional)
- **Changelog** (optional)

Every item in the feature inventory must appear in at least one page.

### Phase 3 — Content writing

Quality bar:
- Every code example must be runnable.
- Concept articles explain *why*, not *how*.
- Getting started must produce a working result in under 5 minutes.
- Reference pages must be exhaustive.

### Phase 4 — Nextra scaffolding

Use `references/docs-site.md` for the full setup. Key files:

- `docs/package.json`
- `docs/next.config.js`
- `docs/theme.config.tsx`
- `docs/pages/_meta.json` per directory
- `docs/pages/index.mdx` (landing page)

Verify `npm run build` passes before deploying.

### Phase 5 — Vercel deployment

Use `vercel --prod` from within `docs/`. Configure root directory in Vercel dashboard if needed.

## Next.js / MDX

For Next.js or MDX-heavy repos, keep using the existing references and templates in this skill:

- `references/nextjs-doc-conventions.md`
- `references/nextjs-code-to-docs-mapping.md`
- `templates/nextjs-api-reference.mdx`
- `templates/nextjs-guide.mdx`

Use them only when the repo actually follows that style.

## References

Load only what the task needs:

- `references/documentation-types.md` — AFS taxonomy, root docs, in-folder docs, timestamp/live rules
- `references/continuous-docs.md` — logs, lessons, items, fixes, living-doc maintenance
- `references/frontend-documentation.md` — component, hook, route, and UX-contract docs
- `references/one-off-docs.md` — audits, ADRs, post-mortems, migration notes
- `references/writing-standards.md` — tone, structure, anti-patterns
- `references/nextjs-doc-conventions.md` — MDX conventions
- `references/nextjs-code-to-docs-mapping.md` — Next.js source-to-doc mapping
- `references/project-research.md` — systematic codebase research before writing project-level docs
- `references/docs-site.md` — Nextra scaffolding, page templates, Vercel deployment

## Templates

- `templates/service-readme.md`
- `templates/runbook.md`
- `templates/daily-log.md`
- `templates/lesson.md`
- `templates/item.md`
- `templates/fix.md`
- `templates/technical-report.md`
- `templates/adr.md`
- `templates/post-mortem.md`
- `templates/nextjs-api-reference.mdx`
- `templates/nextjs-guide.mdx`

## Script

- `scripts/find-docs.sh` — locate AFS paths, root instruction docs, in-folder docs, and legacy conflicts before creating or moving files
