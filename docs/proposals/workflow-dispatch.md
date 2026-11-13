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

Lifecycle support and exact restart semantics must follow the installed
SDK's actual local World, not an assumed API. A mocked `start()` is only unit
evidence and cannot replace the real runtime boundary. Preserve every original
failure and cleanup limit. Stop/reap only captured task-owned process groups;
remove only the owned test database/container/network, scratch, dependencies
and uploaded proof copies after their use ends. Retire each temporary workflow
and its SHA-checked QA ref. Keep main/production on the previous release until
the concrete candidate has its required proof and configuration.
