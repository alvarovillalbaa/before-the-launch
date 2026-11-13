# Durable simulation dispatch

Last updated: 2026-11-13

The owner's standing all-work/checks/publication delegation covers this bounded
release, the pinned dependency change and temporary public Ubuntu CI, capped at
20 minutes per changed candidate. No hosted configuration, production data,
real model call, new external account or paid service is part of qualification.
The existing environment-write403 is not a retry target. The original
137 execution-control and48 provenance packets retain their sources/results.

## Current gap

At `16b256e6`, create/action/execute entry points schedule `executeSimulationRun`
through Next `after()`. The Workflow entry exists but has no caller and invokes
Node/database logic directly from workflow scope. A queued run therefore has no
acknowledged durable dispatcher. The current local setup already generates a
private operator key; it needs no replacement.

Use real Workflow start/step execution. Preserve the database's single run
claim, frozen input/cohort, operator admission, stop/deadline, unknown-cost and
revision semantics. Keep private keys, admission grants and product/source
snapshots out of Workflow arguments and step results: pass the saved run ID.
Application SQL remains the authority for simulation completion; Workflow
completion alone cannot establish completed persona coverage or known charges.

## Dependency and prerequisite

The existing lock has Workflow4.5.0. Pin `workflow`5.4.0 for its documented
[atomic start Hook](https://vercel.com/changelog/atomic-start-hooks-in-the-workflow-sdk)
and [duplicate owner readback](https://workflow-sdk.dev/docs/foundations/idempotency).
Do not pretend the older SDK supports this API or build a lookup/start race.
Keep all other direct dependency versions fixed; inspect the actual new lock
and required transitive changes before implementation/build qualification.

First use a fresh external runner: verify source, install pnpm10.24.0 in owned
scratch, resolve only the changed frozen-lock requirement, then install the
result with lifecycle scripts disabled. Read the actual installed Workflow
and Next16.2.9 bundled guides before editing their integration. Preserve exact
package/lock fingerprints, direct-version comparison and the relevant guide
bytes/index; no tests, app server, browser, database or model is run by this
prerequisite. Mac Storage Guard failed at1.9GiB free versus34GiB required, so
no local dependency installation/build/database is permitted.

Prerequisite run43501105419 passed at82ad999f: Node22.23.4, pnpm10.24.0,
Workflow5.4.0 and Next16.2.9. Every other direct version stayed fixed. The
actual470322-byte lock is SHA-256
`017c182d5d8f6595dd461f5ac20f678f3f80f9576437d6b88cc6f6dfd1a0b3cb`;
frozen install and source/owned cleanup guards passed. Installed Next route/
after guides and Workflow start/idempotency/step/Local World guides were read.
The new lock replaces Workflow's required transitive family; it does not
upgrade the AI SDK, React or Next direct versions. The temporary workflow is
disabled and its SHA-checked ref deleted/absent. No product runtime test ran.

## Transport boundary

The SDK's generated internal routes must bypass the operator-cookie proxy so
its queue can deliver. Public application pages, status, execution and stop
APIs keep their existing operator and same-origin checks. The SDK's Local
World has **no authentication** and is for a single local instance, not public
production. Local dev/start commands therefore bind127.0.0.1. Do not expose
its internal routes through a public reverse proxy. Hosted Vercel configuration
rejects an explicit non-Vercel World; production relies on that authenticated
World's transport. Loopback CI is not evidence for hosted queue authentication.

Workflow arguments carry the saved run ID only. The worker reads its own
opaque Workflow ID and binds it through compare-and-set, recovering a lost
HTTP acknowledgment without overwriting a conflicting owner. Start Hook
retention is one day; the saved SQL binding and terminal status remain the
longer-lived authority. A known failed/cancelled dispatcher can close only an
unclaimed queued simulation. An active SQL claim is preserved and still uses
its original expiry/partial-result reconciliation. The execution step has zero
automatic retries; a crash may have sent a model request and must not replay
that body. Completion of the Workflow does not substitute for SQL coverage.

## Delivery contract

- Creation and explicit execution submit the saved run ID through real
  `start()`, using one domain token per simulation. Concurrent or lost-response
  retries obtain the original Workflow owner; they never mint a new domain ID.
- Persist/read back the existing `workflowRunId` without a schema migration.
  Conflicting bindings fail; a dispatch error preserves the saved queued run
  and reports uncertainty rather than claiming a model run completed or lost.
- Put Node/SQL/model execution in a real `use step` boundary. Preserve admission
  and claim checks on every actual execution; no provider work can be made
  repeatable merely by replaying a Workflow. Interrupted/uncertain work retains
  the existing conservative partial/stop behavior instead of automatic rebilling.
- Keep status/stop/read operations operator-protected. The visible monitor
  distinguishes unconfirmed dispatch from saved simulation progress. Do not
  substitute an in-process `after()` execution fallback for a failed Workflow.
- Qualify the compiled real local Workflow runtime with disposable PostgreSQL
  and deterministic free agents: authenticated creation/completion; concurrent
  duplicate dispatch; lost-acknowledgment owner recovery; server restart and
  saved progress; stop/expired-claim preservation; unauthenticated refusal.
  Use exact new authored fixtures and finite identities, with no real provider
  or production service request. Publish the executable scope before running.

## Executable qualification

`tests/scripts/run-workflow-dispatch.mjs` is the sole CI controller. It verifies
the complete checked-out source vector, installs the frozen lock without
lifecycle scripts, creates one labelled Docker bridge network and disposable
PostgreSQL17 container, applies the existing schema only to that empty database,
and seeds authored demonstration data. It runs targeted ESLint and a production
Next/Workflow compile, then `tests/integration/workflow-dispatch.mjs`. No existing
137/48-case suite is replayed. All eight identities need recorded original
passes, with unchanged application/runtime/lock bytes across their sources:

| ID | Boundary |
| --- | --- |
| D01 | Operator read/execute refusal and authenticated cross-origin write refusal |
| D02 | Actual API create, compiled Workflow step, two free findings and one SQL report |
| D03 | Four concurrent execute requests recover one actual Hook owner after controlled loss of an owned queued SQL binding; one execution/finding set |
| D04 | Drop a completed real execute HTTP response, retry the same saved run and owner |
| D05 | Kill/reap the owned server while queue delivery is held; restart with the same journal/PG and reopen the saved run to initialize recovery |
| D06 | Stop before delivery, plus an authored expired SQL claim; neither starts persona work |
| D07 | Desktop Chromium monitor shows actual response uncertainty, retries the saved owner and displays/reloads completed results |
| D08 | The same monitor flow at390×844 with emulated touch and no horizontal overflow |

The owned HTTPS fixture forwards actual application and SDK bytes. It only
holds queue delivery and drops selected actual responses; it never substitutes
an SDK/service response. Node trusts the authored certificate; Chromium trusts
its exact SPKI. Browser external requests are refused and reported; no traces,
videos, HAR, login screenshots, keys or journal payloads become artifacts.
D03's deliberate SQL fixture binding loss is not evidence of a real failed
COMMIT. D05 proves recovery when reopening initializes the Local World, not
autonomous idle boot or recovery of an interrupted model request. D06's expired
claim is authored free state, not a paid-provider crash experiment. Hosted
Vercel transport and provider billing remain outside this packet.

Original run43506370496 at00867b61 stopped before build/application checks:
PostgreSQL readiness failed through the internal-network port fixture. No
original connection error or database log was retained, so the specific cause
is unobserved. All source/process/container/network/scratch guards passed and
the original artifact is retained. The next candidate uses a dedicated bridge
with the database port still bound only to127.0.0.1, and captures finite redacted
readiness diagnostics. It also keeps a visible check-request action for any
queued run, allowing an operator to reconcile a subsequently failed dispatcher
without depending on an earlier transport error or a page reload.

Original runtime43506996062 at0b6157b2 reached the existing schema, authored
seed and targeted lint, then failed compilation: `HookConflictError` permits an
absent `conflictingRunId`. The source now treats that case as unconfirmed and
never binds an invented owner. No application identities ran. Its original
ZIP/diagnostic is preserved. Cleanup stopped on a remaining compiler process
group; database/network/scratch removal and final source guard were therefore
**not verified** in that original. The next CI wrapper is a Linux child
subreaper; the controller waits for and reads back owned group absence rather
than equating compiler leader exit with cleanup. This does not retroactively
qualify the failed original.

Runtime43507480438 atb3b2482f compiled and passed D01-D04 with actual
Workflow/PostgreSQL execution, concurrent Hook-owner recovery and a dropped
completed HTTP response. D05 then timed out after server restart; D06-D08 did
not run. All source/process/container/network/scratch guards and the child
subreaper passed. The original remains failed. Reading a World does not start
its queue: the exact pinned `@workflow/core`5.4.0 `getWorld()` implementation
returns its cached instance, and `@workflow/world-local`5.2.1 recovers only
inside `start()`. Following the
[SDK startup contract](https://github.com/vercel/workflow/blob/main/skills/migrating-to-workflow-sdk/references/runtime-targets.md),
the dispatcher now awaits `world.start?.()` once per process through a shared
Symbol promise. This also prevents separate Next route bundles from repeatedly
scanning/re-enqueueing one live journal. Reopening a saved request initializes
recovery; no autonomous idle-boot or interrupted-model recovery is claimed.

Runtime43508517484 atd5a868d0 passed D01-D06, compiled the real Workflow and
passed all source/owned cleanup guards. Browser launch then failed because the
parent controller did not use the scratch browser-install path. The original
remains failed; no browser identity ran. The next profile sets that exact
private path before importing Playwright and runs **D07/D08 only**, with fresh
owned app/PG/free-run fixtures. D01-D06 are closed on their original source and
are not replayed. Only fixture/profile code and this proposal change; all app,
Workflow, dependency and lock bytes remain exact. The completed release will
therefore have eight qualified identities across originals, not one green
eight-case invocation.

Browser profile43509180543 atcc0e37f0 launched Chromium but D07 timed out:
the HTTPS proxy recorded a completed actual response drop and the retry button
was not observed. The cause was not captured; D08 did not run. Source, browser,
process, database, network and scratch cleanup passed. The next browser profile
uses a deterministic browser interception: validate the original empty POST,
origin and operator cookie, forward it to the actual endpoint with the authored
CA, await its real202, then abort that one browser response. No fake success,
SDK or SQL reply is injected. A finite control-region/request diagnostic is
retained on failure; no keys, DOM snapshots, login screens or HAR are captured.
Application/runtime/lock bytes remain unchanged and D01-D06 stay closed.

## Qualified result

Runtime43510133974 atd54207ba passed D07/D08 alone, with actual saved runs,
owner-preserving retry and completed/reloaded UI at1280×844 and390×844 touch
emulation. Each had zero page errors/external requests/overflow. All source,
Chromium/process/database/network/scratch guards and uploaded-proof cleanup
passed. The complete [qualification packet](../results/2026/11-13/workflow-dispatch.md)
combines these two identities with D01-D06 from43508517484 atd5a868d0. Only
two fixture files and two docs changed between the sources; all app/Workflow/
dependency/lock bytes are identical. Seven temporary workflows are disabled and
all task QA refs are absent. The original failures and Runtime2's unverified
cleanup remain preserved. Main/production and the hosted environment-write gate
remain unchanged; real provider/billing and hosted transport are not qualified.

Lifecycle support and exact restart semantics must follow the installed
SDK's actual local World, not an assumed API. A mocked `start()` is only unit
evidence and cannot replace the real runtime boundary. Preserve every original
failure and cleanup limit. Stop/reap only captured task-owned process groups;
remove only the owned test database/container/network, scratch, dependencies
and uploaded proof copies after their use ends. Retire each temporary workflow
and its SHA-checked QA ref. Keep main/production on the previous release until
the concrete candidate has its required proof and configuration.
