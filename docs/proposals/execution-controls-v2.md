# Execution controls and private operator access

5 November 2026. Baseline: clean local/connected main
`df76d41012399174c338a67626cb85a723e4737e`. The prior 48 provenance checks
passed against their immutable source; they do not prove this new behavior.
The owner's standing “You choose / I approve everything / Keep going / Do all
the work” delegation authorizes this implementation, focused checks and
necessary publication/configuration. Earlier seals/results and the
[inactive hard-ceiling draft](simulation-execution-controls.md) remain history.

## Product decisions

Zero means **free synthetic demo, with no model request**. Positive Gateway
runs use an explicitly labeled **estimated model spending target in USD**.
This is not a hard billing ceiling: one in-flight request, routing or final
reported charges can exceed the target. Catalogue rates are estimates, not
binding quotes. Preserve real Gateway capability behind trusted operator
admission; do not silently turn an explicit Gateway choice into demo output.

The current instance is a single shared workspace without a principal check.
A visitor's positive number cannot authorize spending the owner's key. Add
private single-operator access using a cryptographically random server access
key, an expiring signed HttpOnly/Secure/SameSite=Strict session, and same-origin
write checks. Protect application pages, APIs and server actions before data
access; public login/static assets reveal no workspace data. Missing key fails
closed. This is a personal operator boundary, not multi-user memberships/RLS.
No external Auth account, provider enrollment or database migration is needed.
Provision the production access key only after checks; never put its value in
Git, logs, receipts or client props. Keep the owner's key in an owner-readable
local private file and encrypted hosting configuration.

The setup form defaults to Standard and Free demo. It exposes an explicit
engine, USD amount and final persona selection. Convert decimal USD to integer
cents exactly. Reject an empty selection or count mismatch; do not replace or
truncate the selected cohort. Preserve form data and a stable request UUID on
validation/network failure, with a pending state. A repeated creation UUID
returns its existing run; changed input under that UUID is a conflict.

## Runtime invariants

1. Create the run, captured policy and complete cohort in one database
   transaction. Serialize a stable request UUID, compare its canonical input
   fingerprint and retain that identity in existing run JSON. Do not deduplicate
   intentional reruns merely because their content matches.
2. Atomically claim only `queued` runs using a conditional update/returning
   statement. Running/terminal rows cannot execute again. Capture engine,
   model, market, depth, target and cohort before asynchronous provider work.
   Invalid/legacy unrecorded controls must not gain a new paid permission.
3. A positive Gateway run needs a server-issued, run/config-bound operator
   authorization, verified again at execution. An HTTP payload cannot grant
   itself access. Secret rotation/expiration rejects stale admission; completed
   history is never reinterpreted or rewritten.
4. Execute personas sequentially. Persist an attempt UUID and estimated
   reservation before dispatch; uncertain acknowledgement stops before another
   request. SDK retries are zero, with one bounded structured-output request
   per persona and finite call/run deadlines. Provider-side routing is outside
   a client retry guarantee. Never automatically restart uncertain paid work.
5. Quick/Standard/Deep request different prompt treatment and maximum output
   tokens (2,048/4,096/8,192), preserving the selected cohort and result shape.
   Demo output stays deterministic; recording requested depth must not invent
   deeper reasoning or inflate synthetic quality scores.
6. Snapshot available model/rate metadata and keep token/cost estimates labeled
   as estimates. Before each model request, known reported cost plus outstanding
   reservations and the next estimate must fit the target. Missing pricing
   blocks dispatch. This operational admission does not promise a dollar cap.
7. Capture per-step usage, generation identity and validated Gateway-reported
   USD cost before structured-output validation can fail. Preserve the original
   reported amount/source; use conservative decimal arithmetic for admission
   and the existing rounded-up `costCents` column. Missing/uncertain charge is
   unknown, not zero; retain its reservation and stop further paid dispatch.
   A bounded generation-info read may reconcile a known generation identity.
8. Fence late findings after cancellation/deadline. Retain completed findings,
   explicitly mark unexecuted/failed personas, and preserve the full scheduled
   denominator. Persist finite partial/failed reasons and honest cost state.
   Process death can leave uncertainty; reconcile expired durable claims without
   redispatch rather than claiming that `finally` always runs.
9. Finalize score/report/recommendations and terminal run state transactionally,
   preserving execution controls alongside existing output-provenance bindings.
   Partial aggregates name their coverage; no absent persona receives a zero.
   Historical stored Markdown and numeric findings remain unchanged.

Creation returns a queued run promptly. A protected bounded execution endpoint
and run monitor start/poll it; duplicate tabs share the same claim. Bound the
HTTP runner below its hosting timeout, and show interrupted/partial state after
an expired claim. Existing Workflow entrypoints remain a separate integration;
this release must not claim durable Workflow execution from HTTP evidence.

## Interfaces and ownership

- `lib/shared/simulation-controls.ts`: versioned depth/policy types, exact USD
  parsing/formatting, estimate/charge helpers and sanitized control summaries.
- `lib/server/services/simulation-gateway.ts`: pinned SDK transport, catalogue
  snapshots, output/retry/abort/time bounds and whitelisted cost observations.
- `simulation-service.ts`: transactional creation/idempotency, conditional
  ownership, sequential journal, partial/terminal persistence and stale claims.
- Operator auth modules/proxy/login: server-only session and run-bound admission;
  transport handlers derive the actor, never accept it from request JSON.
- Setup/run/report UI: explicit choices, preserved pending/error state, live
  progress, coverage, stop reason and reported/estimated/unknown cost labels.

No dependency or database-schema change is planned. Keep existing transport
field names such as `budgetLimitCents`; the versioned control record names the
new estimated-target meaning. SDK APIs must match pinned `ai@6.0.209` and
`@ai-sdk/gateway@3.0.134`, not a remembered latest-major interface. The default
model remains operator-configured and must exist in the captured catalogue.

## Verification and publication

Author focused policy/auth/service tests, retain the 48 provenance assertions,
and add real disposable-PostgreSQL concurrency/transaction checks. Browser
checks use authored operator credentials and free/demo flows only. Verify
unauthorized/cross-origin requests cannot read data or fund runs; same request
UUID creates once, concurrent execution owns once, terminal replay dispatches
nothing, partial/cost-unknown/late results remain honest, and cohort/depth/default
units are preserved. Derive exact cases from the finished implementation.

Use bounded temporary public CI with the frozen lock, disposable task-owned
database/content and no real provider/model call, production data or paid
enrollment. Include type checking and the relevant existing regressions. Retain
every failure before repair and remove only verified task-created resources;
preserve all old evidence and every non-priority project. Local Storage Guard
reports **21.6 GiB free / 38.0 GiB required**, so no local install/build/database
or browser work bypasses the reserve. Publish the reviewed source, actual
results, cleanup limits and final hosting identities separately.

The finished authored scope is 116 unit/SSR cases (including all original 48
provenance identities), 15 disposable-PostgreSQL cases and six desktop/narrow
touch browser cases: **137 cases, accepted against source `9dc50d2c48bcd137eede279d661104e6be0542b1`**. The controller derives
their exact file/title identities from the sealed source AST and requires actual
CLI exit zero, no retries, all expected outcomes, matching source bytes and
verified owned cleanup. It also runs Next type generation, TypeScript checking,
a production build and a client-asset scan for the authored operator fixture.
These checks use no production key, provider/model request or production data.
The [accepted receipt](../results/2026/11-05/execution-controls.md) preserves the
five preceding failures and the separate production environment-permission gate.

The browser failure in attempt four exposed Next 16.2.9's loopback URL
normalization. Same-origin writes now compare a canonical HTTP(S) Origin with
the validated incoming Host authority and request scheme; missing/malformed
Host, protocol mismatches and forwarded-host substitutions remain denied.
The added regression covers the normalized URL case without broadening
localhost/127.0.0.1 origins. Earlier failed request headers were not captured;
the next browser result is required to verify this integration repair.

Attempt five verified that repair, including cross-origin denial, desktop run
persistence/replay and narrow touch persistence. It did not reach full browser
acceptance or verified cleanup. Subsequent checks serve the existing production
build with `next start`, through an owned loopback HTTPS proxy and a disposable,
scratch-only self-signed certificate. The browser accepts that authored fixture
certificate only in this exact local profile; no OS trust store, public TLS,
hosting key or production data is changed. Secure cookies remain enabled and
are checked as such. Certificate/key values are never committed or logged.

This removes a source-supported dev-shutdown path rather than relaxing cleanup:
Next 16.2.9's [detached telemetry worker](https://github.com/vercel/next.js/blob/v16.2.9/packages/next/src/telemetry/detached-flush.ts#L23)
loads development config; locked Workflow's [Next integration](https://github.com/vercel/workflow/blob/48a19d948a1d3c0da5248a5aa10c4caa3d49b46a/packages/next/src/index.ts#L310)
enables its watcher in development and skips initial building in production-server
phase. Attempt five did not capture the actual writer PID. Final source,
original process-group and generated-output guards remain mandatory; no
unobserved detached-session cleanup is inferred from them.
