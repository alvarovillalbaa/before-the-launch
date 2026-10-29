# Simulation provenance source

30 October 2026. Prepared against clean personal main
`387e163b17f6a28ede67fce3c14bd7126392151f`.

Published source:
[`0dbdc584310e1da9011ae1de40e5d0455bb67caa`](https://github.com/alvarovillalbaa/before-the-launch/commit/0dbdc584310e1da9011ae1de40e5d0455bb67caa).
Connected GitHub readback matched all 993 remote leaf paths, modes, types and
blob SHAs without truncation; local main fast-forwarded cleanly. The source
commit has zero Actions runs and no provenance workflow is active.

## Finding and repair

The service already falls back to deterministic fake output when Gateway fails.
Only the trace identified this fallback. The run header still showed `gateway`,
persona rows omitted their producer, and Markdown reports combined the scores
without a synthetic qualification. The stored engine flag therefore did not
establish how a result was generated. This was verified by reading the actual
producer, query, run view and report generator, without executing a simulation.

The [provenance contract](../../../simulation-provenance.md) now owns actual
finding-origin stamps, conservative historical reads, composition summaries,
aggregate/report identity binding and qualified Markdown. New stamps reference
the existing finding UUID. New score/report IDs and the full finding set are
bound in existing summary JSON; mismatches cannot borrow another attempt's
attribution. Source review caught and addressed that repeated executions can
leave multiple records while existing reads select their first row.

The run view shows the assessment before scores and per persona; the report
view prefixes its current assessment before the unchanged stored Markdown.
Overview headings and the run badge say **Configured engine**. Status responses
retain the existing engine and add provenance. Missing score cards show `n/a`;
a recorded zero keeps its display. Historical records, row selection, numeric
findings, score/recommendation formulas and the existing fallback policy remain
unchanged. This is producer lineage, not model or market validation.

## Static preparation

- TypeScript 5.9.3 syntax parsing/transpilation passed for thirteen source/test
  files; 63 local imports resolve. No broad local TypeScript compile ran.
- AST comparison confirms sixteen existing service functions are byte-identical,
  including fake/Gateway generation, scoring, recommendations, run creation and
  unrelated project operations.
- Independent source/fixture reviews covered finding/attempt binding,
  contradictory evidence, captured engine selection, historical reads, mixed
  output and immutable numerical data.
- The [source manifest](simulation-provenance-source.json) records exact input
  fingerprints and case names. `git diff --check` passed.

The complete source seal contains 148 inputs, excluding only result receipts and
bundled vendor instructions. All 974 baseline leaves outside the eight changed
existing paths retain their original Git blobs. Inactive CI preparation passed
YAML parsing, six shell syntax checks and three embedded Node syntax checks.
These checks activate no workflow and run no fixture or application function.

The repository requires reading its version-specific Next.js guidance before
coding. Local `node_modules/next/dist/docs` is absent, so the official
[Next.js 16.2.9 server/client guide](https://github.com/vercel/next.js/blob/v16.2.9/docs/01-app/01-getting-started/05-server-and-client-components.mdx)
was read in full instead. The existing server-rendered data boundary is retained;
the new notices add no browser API or client-side provider import.

Exactly 48 checks are authored and **unrun**: 27 provenance, nine mocked service,
six actual-component SSR and six existing simulation/context regressions. Their
names were extracted from syntax trees without importing registration modules
or executing product functions. They cover fake/Gateway/fallback/mixed results,
unknown and pending records, wrong/duplicate/malformed bindings, preserved scores,
captured engine mutation, old selected outputs and escaped notice content.
The [separate check proposal](../../../proposals/simulation-provenance-checks.md)
does not inherit the earlier import or target-market approvals.

Storage Guard reported 27.2 GiB free versus 34.0 GiB required, including the
30 GiB reserve. No local installation, build, server, database, browser, backend
test, SSR render, provider or model call ran. No environment, temporary data,
dependency, schema, Auth or provider configuration changed. The proposed CI is
inactive; it will require its own explicit approval.

## Separate controls and remaining proof

A fresh complete read of the short
[Notion child](https://app.notion.com/p/3b6a1ee8bd068081a408e5a8103912a6)
returned its 15 October QA snapshot; it does not define budget/depth semantics.
Current source separately exposes but ignores Depth and Budget limit. A required
question asks whether the default zero forbids paid calls or means no cap; it
remains unanswered. The [inactive execution contract](../../../proposals/simulation-execution-controls.md)
records that decision and the locked SDK's accounting limits. No depth profile,
spending cap, Gateway budget or billing action was activated by this repair.

Real provider execution, SQL durability/concurrency, browser layout/focus,
hosted account isolation, durable originals and spend enforcement remain
unverified. A later build/type/delivery result is separate from behavioral
acceptance. The complete application and portfolio goal remain open.

## Published build and delivery

Production `dpl_6b37RLX8HZBVmwPZ7oiHAXTh9zu2` reached **READY** at that exact
source and owns [the canonical URL](https://before-the-launch.vercel.app).
The bounded hundred-event build read includes source cloning, successful
compilation, the TypeScript stage, eight static pages and completed deployment.
The [hosted receipt](simulation-provenance-hosted.json) preserves selected
events and deployment/source identities; it does not claim complete log coverage.

Connected homepage GET and independent unauthenticated HEAD both returned 200.
The server-rendered run/provenance flow was not exercised. The homepage read
did not expose the conditional Configured engine heading; availability is not
proof of populated historical records, result notices or workflow-status JSON.
No fixture, API submission, live simulation or browser check was used to create
that evidence.

The immutable 48-case/fifteen-minute CI scope was requested once after source
publication and remains approval-pending, inactive and unrun. The separate
zero-budget question is also unanswered. Subsequent result-only publication
changes none of the 148 sealed inputs or sixteen protected functions.
