# Execute the prepared 48 provenance checks

5 November 2026. Preparation began at fresh clean local/connected main
`56c277a466e8aeb0c98a20f7890078e57cf88003`: all 148 original fingerprints
matched the [immutable source ledger](../results/2026/10-30/simulation-provenance-source.json).
[Attempt 1](../results/2026/11-05/provenance-checks-attempt-1.md), run
`41936506727`, executed every case against
`94b1efb981d0263f6a9401dffbfe1aad9af5922b`: **47 passed / one failed**.
The mixed success/fallback service case expected two mocked Gateway calls and
observed one. Four full source guards and owned cleanup passed. The original
failure and workflow retirement are published at
`5cbb96e494c7af24fe1809703ff05d4ab7c082a5`. Attempt 2 is unexecuted.

The fixture used a manual AI SDK mock around the producer's concurrent dynamic
imports. The [locked Vitest manual-mock loader](https://github.com/vitest-dev/vitest/blob/v4.1.9/packages/vitest/src/runtime/moduleRunner/moduleMocker.ts#L211)
explicitly identifies that pattern as unsupported. The exact original caught
exception was not recorded, so this is a source-supported harness repair rather
than an observed exception diagnosis. Attempt 2 uses supported spy mode and
binds `generateText` to the existing authored stub before every producer call;
the pure SDK `Output.object` wrapper remains real. A bounded failure message
retains authored identities/fallback text, while a fetch guard rejects/counts
unexpected requests and restores the global in cleanup. All original case
names and body assertions, production concurrency and numerical behavior remain
unchanged. No product or dependency repair is justified by this fixture failure.

The owner's standing approval of all necessary work and delegated choices
authorizes the same authored scope and bounded temporary CI. This supersedes
the historical approval/manual-dispatch wording in the
[original proposal](simulation-provenance-checks.md), without modifying it or
its inactive example. No repeated permission request is needed. The separate
[execution-controls proposal](simulation-execution-controls.md), including its
zero-budget decision, is not implemented or resolved by running these checks.

## Exact behavior and source

Run only the original five files: 27 provenance helper cases, nine mocked
producer/query service cases, six actual-component React SSR cases, two
simulation regressions and four captured-context service regressions. Match
all 48 full names in their expected files, independently of execution order.
Retain every original test and assertion. The evidence covers finding-bound
origins, conservative historical/contradictory reads, aggregate/report identity
binding, fake/Gateway/fallback/mixed labels, unchanged numeric results,
captured configuration and escaped notice content.

The services use authored in-memory DB and AI SDK doubles. The two existing
simulation cases call fake/scoring helpers, with database creation remaining
lazy. The six UI cases render the actual notices with React server rendering
and inspect their HTML; they do not exercise Next navigation, hydration, a
browser or accessibility interactions. Preserve Vitest's per-file isolation.

A new ledger at `docs/results/2026/11-05/provenance-checks-source-attempt-2.json` covers
151 current application inputs: the original 148 plus this proposal, the
controller and its inactive workflow example. Only AGENTS authority text and
the service fixture's mock/diagnostic boundary differ among the original 148.
The first source edition remains immutable. The old ledger's exact bytes and five-file
27/9/6/2/4 full-name set remain protected. Full HEAD/index/mode/working-byte
guards additionally cover every tracked leaf, including bundled `.agents/`
instructions, dated results and the new ledger. Check links as link-target
text without following them; the current tree has no symlinks.

## One bounded execution

The new inactive example invokes `tests/scripts/run-provenance-checks.mjs`.
Only creation of `qa/simulation-provenance-20261105-2` in this exact public
repository can activate the temporary workflow. Checkout uses an immutable
source-preparation SHA. Keep the active copy only on the owned QA activation
commit, never at main HEAD. Publish preparation/receipt commits with `[skip ci]`,
then retire the workflow and retain its own branch as a bookmark. Do not
activate or replace the older manual-dispatch example.

Use one standard public Ubuntu 24.04 job, Node 24.21.0/pnpm 10.24.0, capped at
15 minutes. Install the unchanged frozen lock with lifecycle scripts disabled.
Run the existing direct Node Vitest command for exactly those five files, one
worker, file parallelism off, zero retries, TAP and JSON reporters. No lint,
broad test suite, typecheck, Next build, dependency change or other scope is
included. Select the fake engine and empty DB/provider credentials through a
child-environment allowlist. Do not start a database, app server, browser,
ingestion, live simulation or real provider. Dependency-registry access during
setup does not establish a network sandbox.

Bound work to 780 seconds, cleanup to 60 seconds and final stdout to two seconds
inside the job limit. Supervise foreground command groups with bounded
512 KiB streams, deadlines, TERM/KILL/drain handling, direct exit/close and
original group-absence observations. Any timeout, signal, overflow, incomplete
capture or missing stage prevents acceptance. Preserve handlers through final
output. These userspace checks cannot interrupt blocked kernel calls or
inventory separately detached sessions or dynamic libraries.

Require a complete regular non-symlink JSON report within 2 MiB, retain it
losslessly with its digest inside the bounded receipt, and verify exact file/
full-name sets and all 48 passing once. Missing, extra, duplicate, skipped,
TODO, retried, failed or globally errored outcomes fail acceptance even when
a headline total looks green. The locked [Vitest JSON reporter](https://github.com/vitest-dev/vitest/blob/v4.1.9/packages/vitest/src/node/reporters/json.ts)
reports five files and seven suites including nested describes. It has no
global-error or attempt counter: require the actual CLI exit zero with its
default unhandled-error failure behavior, and retain the sealed retry-zero
configuration plus each unique final row without inventing absent fields.
Preserve bounded original diagnostics and all failures before an
evidence-supported repair; never weaken a check to pass.

Use one identity-marked owned scratch root for temporary/tool/compiler caches,
pnpm/Corepack stores and reports, leaving HOME unchanged. Prove generated
repository paths absent before setup; cleanup may claim only identity-captured
task-created outputs after commands settle. Unknown paths or uncertain process
ownership prevent deletion and remain an incomplete cleanup outcome. Run
always-on source checks on success, failure and interruption, with final
tracked/ignored-output and owned-root removal evidence. No artifacts or
downloadable application are uploaded.

Storage Guard now reports **21.8 GiB free / 34.0 GiB required**, exit two. No
local install, build, server, browser, database or product test will bypass that
reserve. The tagged [Next 16.2.9 server/client guide](https://github.com/vercel/next.js/blob/v16.2.9/docs/01-app/01-getting-started/05-server-and-client-components.mdx)
was read because local Next guides are absent; the existing render boundary is
unchanged. Passing these cases would not establish SQL durability/concurrency,
hosted access isolation, provider behavior/cost, real market reactions, depth/
budget enforcement, browser interaction or full product/portfolio completion.
