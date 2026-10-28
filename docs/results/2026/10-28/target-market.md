# Simulation target-market context

Status: source and six focused cases authored; runtime checks unexecuted. This receipt distinguishes static proof, source publication and remaining runtime acceptance.

## Requirement and source defect

Baseline: clean `22e5168acdeb83e6827d848635d035fabcf5bf05`. The [product intake contract](../../../product-intake.md) says users can configure the simulation target market after upload. Setup requires that audience even when uploads omit a market. The existing action saved it in `SimulationRun.targetMarket`, and run details displayed it, but both simulation engines received only the frozen brief, sources and persona. Two otherwise identical runs with different selected markets constructed identical Gateway prompts and fake inputs. The completed import/workspace repair is preserved.

## Change

[`simulation-service.ts`](../../../../lib/server/services/simulation-service.ts) captures a `Readonly` context, frozen at runtime, from the saved run's market immediately after loading the run. Fake, Gateway and the existing Gateway-to-fake fallback share that value. Gateway receives it explicitly as the operator-selected evaluation audience, separate from product facts and untrusted source evidence. Missing or conflicting brief markets remain unchanged. Fake output uses the market in its deterministic seed and labels it in its recommendation; this remains synthetic demo output rather than evidence of market fit.

The existing context trace records the audience and its configuration provenance. New Markdown reports include the same labeled audience. The existing heuristic token-count estimate now includes the context; it remains an estimate, not measured provider usage. No stored historical report is rewritten. Depth, budget, engine selection, fallback policy, source references and scoring formulas retain their existing behavior.

Independent source review caught a valid-input boundary: quoting a 180-character market of non-NUL control characters expands it to 1,082 characters. The fake recommendation's fixed prose was shortened to keep that exact quoted market within the existing 1,200-character result limit. The existing new fake-context case includes this boundary; the proposed scope remains six cases.

No schema, migration, Auth, dependency, configuration, CI or provider change is included. Existing hosted persistence/access limitations remain in the [upload-workspace receipt](../10-27/upload-workspace.md).

## Verification boundary

The task shell reported Node `v26.8.2`; its executable path was queried locally. That runtime was not used to import product modules or run checks. Local dependencies and Next documentation are absent. Per `AGENTS.md`, the matching upstream [Next 16.2.9 backend guide](https://raw.githubusercontent.com/vercel/next.js/v16.2.9/docs/01-app/02-guides/backend-for-frontend.mdx) was consulted for the existing service boundary; no framework API is changed.

The [focused proposal](../../../proposals/target-market-checks.md) lists exactly six cases: one updated aggregation case and five new context cases across two unit files. Database and AI SDK boundaries in the four service cases are in-memory stubs. None has been executed, and the earlier import/browser approval does not cover them. No backend test, product import, build, server, browser, model call, install or production mutation was performed for this source change. Static syntax/diff/link review is separate from runtime acceptance.

Independent source review found and corrected an escaped-input bound: an allowed
180-unit market can occupy 1,082 units when JSON quoted. The fixed recommendation
prose now adds 101, staying within the existing 1,200-unit output limit while
preserving the full market. The authored case includes that boundary. Final
readback found no further concrete blocker in this scope.

An independent syntax-only check used existing Node 24.21.0 and TypeScript 5.9.3:
the service and both unit files parsed with zero diagnostics. AST inspection
counted two plus four authored cases without importing or executing them.
Whitespace and local Markdown targets pass. The
[source fingerprint](target-market-source.json) records eleven exact source,
fixture, configuration and lockfile hashes; none of those configuration or
dependency files changed.

## Publication and remaining acceptance

Source publication is recorded after remote readback. The six-case proposal
requests only the existing-toolchain fake/mocked-boundary run; it does not
authorize installation, temporary CI, database, browser or real Gateway calls.
Hosted storage/access isolation and the complete application acceptance remain
separate requirements. Existing reports are preserved.

`git diff --check` passed after the edits. A bounded file-only check resolved local Markdown link targets in the four changed/new documents and counted the six authored case registrations. These checks do not import or execute product/test modules.
