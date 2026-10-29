# Simulation provenance checks, pending approval

30 October 2026. **Authored and inactive; none of these checks has run.**
The supplied AGENTS.md section 7 requires explicit approval for this new
backend/SSR scope; section 14 requires approval for temporary CI. The older
import/browser approval and pending target-market/budget proposals do not
authorize this increment.

The [source manifest](../results/2026/10-30/simulation-provenance-source.json)
seals the complete reviewed source and all full case names. The
[inactive workflow](simulation-provenance-ci.yml.example) stays outside workflow
discovery until approval. No application workflow or dependency is changed by
preparing these files.

## Exactly 48 cases

| File | Cases | Boundary |
| --- | ---: | --- |
| `tests/unit/simulation-provenance.test.ts` | 27 | Finding-bound stamps, conservative historical origins, contradictions/duplicates, counts, complete output lineage and Markdown qualifications. |
| `tests/unit/simulation-provenance-service.test.ts` | 9 | Actual producer/query services with authored in-memory Drizzle and AI SDK boundaries; fake, Gateway success/fallback, mixed output, historical/repeated-attempt selection and captured engine configuration. |
| `tests/unit/simulation-provenance-ui.test.tsx` | 6 | Actual React server rendering of provenance notices with authored data; origin/lineage copy, counts, accessible names and escaping. |
| `tests/unit/simulation.test.ts` | 2 | Existing fake-agent aggregation and target-market regressions. |
| `tests/unit/simulation-context.test.ts` | 4 | Existing fake/mocked-Gateway/fallback/captured-context service regressions. |
| **Total** | **48** | **No browser or real provider execution.** |

These cases exercise actual helpers, producer/query source and server-rendered
notices while retaining the existing numeric findings, scoring formulas,
recommendations and historical report bytes. Authored test doubles replace the
database, AI SDK and environment boundaries. They do not establish SQL
durability, hosted access isolation, provider usage/cost, model quality, real
market reactions, budget enforcement or depth semantics. React SSR is not
browser, focus, touch or interaction proof.

## One disposable job

After approval, copy only this focused workflow to
`.github/workflows/simulation-provenance-checks.yml` on canonical public `main`.
Use `[skip actions]` for activation/removal commits so unrelated push workflows
remain unrun. Dispatch once with the full forty-character approved source SHA;
the checkout uses that immutable commit rather than the activation head.
Do not create a new branch or install continuing CI.

The scope is one standard public Ubuntu 24.04 job capped at fifteen minutes,
with read-only repository permission and no persisted checkout credentials.
Pinned official checkout/setup-node actions select Node 24.21.0. Corepack
prepares the repository's declared pnpm 10.24.0 in an owned runner directory;
installation uses the unchanged frozen lockfile with lifecycle scripts
disabled. No application dependency, lockfile, migration, provider setting,
account, paid runner or model call is proposed.

Before installation and after the checks, the job verifies the exact HEAD,
the manifest's own bytes against `git show HEAD`, the complete non-result source
path set and every recorded mode, size and SHA-256. Symlink entries are checked
as link-target text without following vendor directories. Only `docs/results/`
and bundled `.agents/` material are excluded. The five case paths and their
27/9/6/2/4 counts are fixed; missing, extra or duplicate paths/names fail.
Package-manager/framework versions and package/lockfile bytes are checked.

Vitest selects exactly those five files with one worker, file parallelism off,
and zero retries. Every full case name must occur once in its expected file
and pass. Runner failure, skipped/TODO, duplicate, missing, extra or unexpected
outcomes fail acceptance even if another count is green. JSON evidence must be
a regular non-symlink file of at most 2 MiB. Bounded TAP/runner text and exact
structured name/status totals appear in the public job log; no artifacts,
screenshots, traces, private files or downloadable app are uploaded.

Database/model/provider credentials are empty, the default engine is fake, and
the service cases mock their DB/SDK boundaries explicitly. No database, app
server, browser, source ingestion, real simulation, signing, account, model
inference or production-data operation is started. Package-registry access is
limited to tool/dependency setup; this is not a network sandbox claim.

An always-run cleanup checks the task root's canonical location, ownership
marker, device/inode and run/attempt identity before removing only its tools,
stores, caches and JSON report. Runner teardown owns checkout dependencies.
Unknown ownership blocks deletion. Hard termination can prevent cleanup or
complete evidence capture and must remain an incomplete outcome.

Preserve the exact source/toolchain, all discovered outcomes, exits, failures
and limits in owning dated results. Remove the active temporary workflow after
terminal inspection, including failures. Any expanded case count, browser,
database, live Gateway use, dependency change or wider CI needs new approval.
No local operation bypasses Storage Guard. This proposal does not resolve the
separate zero-budget semantics decision or complete the application/portfolio.
