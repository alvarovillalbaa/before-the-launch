# Scratch Space Discipline

Use this reference when an agent or skill needs to write intermediate files, checkpoints, delegation prompts, or any state that is not a final deliverable.

## Decision Tree

```
Is the artifact the final deliverable (plan, spec, doc, output)?
  → YES: write to docs/ or a tracked repo location, never scratch
  → NO: continue below

Is the artifact bound to this specific repo or branch, user-curated,
and expected to survive across sessions on the same checkout?
  → YES: use .context/ (see Exception below)
  → NO: continue below

Will later invocations of the same skill need to locate sibling run-ids?
  → YES: use stable OS-temp path /tmp/compound-engineering/<skill>/<run-id>/
  → NO: use mktemp -d (per-run throwaway)
```

## Tiers

### Tier 1: Per-run throwaway

```bash
scratch=$(mktemp -d -t <prefix>-XXXXXX)
```

Use for files consumed once and discarded: captured screenshots, stitched GIFs, intermediate build outputs, recordings, delegation prompts and results, single-run checkpoints. The OS handles cleanup. The path is opaque — that is appropriate for throwaway files users are not meant to inspect.

### Tier 2: Cross-invocation reusable

```bash
/tmp/agentic-dev/<skill-name>/<run-id>/
```

Use a **stable path** — not `mktemp -d` — so later invocations of the same skill can discover sibling run-ids by listing the parent directory. Use `/tmp` directly rather than `$TMPDIR` so paths stay accessible: on macOS, `$TMPDIR` resolves to `/var/folders/.../T/`, which is hostile for users who want to inspect or copy checkpoints. Per-user isolation is not valuable here. Use for: caches keyed by session, checkpoints that must survive context compaction within a loose session, or any state where a later run of the same skill needs to locate prior outputs.

### Exception: `.context/`

Use `.context/` only when the artifact meets **all** of:

- **Repo+branch-inseparable**: the artifact's meaning is tied to this specific repo or branch (e.g., branch-specific resume state the user expects to pick up again in the same checkout).
- **User-curated OR path-is-core-UX**: the user is expected to inspect or manipulate the artifact outside the skill, or surfacing the path back to the user is a core part of the skill's output and is easier to communicate as a repo-relative location.

Namespace under `.context/agentic-development/<workflow-name>/`. Add a per-run subdirectory when concurrent runs are plausible. Decide cleanup behavior per lifecycle: per-run scratch clears on success; user-curated state persists.

"Shared between skills" is not by itself sufficient reason to use `.context/` — Tier 2 OS-temp paths handle cross-skill coordination equally well.

## Durable Outputs

Plans, specs, learnings, docs, and final deliverables belong in `docs/` or another repo-tracked location. Never write durable outputs to scratch tiers.

## Cross-Platform Note

`/tmp` is writable on macOS (symlink to `/private/tmp`), Linux, and WSL. `mktemp -d -t <prefix>-XXXXXX` works on all three. These patterns assume Unix-like shells; native Windows is not a target.
