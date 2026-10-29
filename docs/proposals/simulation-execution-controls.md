# Simulation execution controls — inactive proposal

30 October 2026. Baseline: clean `387e163b17f6a28ede67fce3c14bd7126392151f`.
This is a proposed implementation contract, not implemented behavior or approval
to execute tests, simulations, providers or CI. All parameters below are proposed.
**Zero-budget meaning is unresolved and blocks the implementation decision:**
does `0` forbid paid calls, or mean unlimited? Do not select either implicitly.

## Current gap and ownership

The [setup form](../../app/projects/[projectId]/page.tsx) exposes Quick/Standard/Deep
and a Budget limit without currency or unit text. The [input schema](../../lib/shared/schemas.ts)
accepts `depth` and integer `budgetLimitCents`; the
[service](../../lib/server/services/simulation-service.ts) stores them at creation.
Execution ignores both: the frozen context contains only target market, and
`Promise.all` launches the selected agents concurrently. Gateway calls have no
explicit output-token cap, retry policy or cancellation deadline here. The
service records a character-based token estimate and leaves the existing nullable
`AgentRun.costCents` unpopulated. See [current agent behavior](../ai-agents.md).

Preserve captured brief/source/persona inputs, selected target market, source
qualifications and historical runs. Profile selection must not add, remove or
replace selected personas. No schema, dependency, Auth, provider configuration,
Gateway key/project budget or Workflow deployment change belongs to this proposal.

## Proposed depth and engine behavior

Each selected persona receives one bounded structured-output pass. Proposed
profiles alter the explicit prompt task and maximum output tokens:

| Profile | Output tokens | Requested treatment |
| --- | ---: | --- |
| Quick | 2,048 | Prioritize the main objection, adoption trigger and proof gap. |
| Standard | 4,096 | Give a balanced review of the existing result dimensions. |
| Deep | 8,192 | Examine competing explanations, tradeoffs and evidence limits. |

Keep the existing validated result shape; output limits do not guarantee completion
or improved judgment. Fake/demo execution makes no model call and has actual cost
zero. It can identify the requested profile, but must not fabricate depth-dependent
quality scores, provider usage or accuracy. Label synthetic findings and reports.
A paid-engine error must not silently turn a fake fallback into a live judgment.
Retain any separately requested demo output with its explicit synthetic provenance.

## Proposed execution and charge contract

1. Atomically claim a queued run before work, with one successful execution owner.
   A refresh, duplicate action, workflow replay or concurrent invocation must not
   create a second paid execution. Existing running/terminal runs are not restarted.
2. Execute selected personas sequentially. Before each paid attempt, persist a
   unique attempt identity and its conservative reservation under the claimed run.
   An uncertain reservation acknowledgment prevents dispatch. No SDK retries,
   provider failover or automatic resubmission may create another charge attempt.
3. Require finite cancellation deadlines for each call and the whole run; proposed
   defaults are 120 seconds per call and 15 minutes per run. Propagate cancellation,
   fence late results and persist a finite terminal explanation. An abort/timeout
   does not prove the provider charged zero or stopped processing the request.
4. Before dispatch under a positive USD-cent cap, require a reviewed, enforceable
   worst-charge bound covering the exact model, routing, request/input bound,
   maximum output, reasoning/caching/tool charges and every billable attempt.
   Completed conservative charges plus this reservation must fit the remaining cap.
   If that contract is unavailable, reject **before any paid call**.
5. A token estimate, model catalogue price, after-the-fact usage report or Gateway
   soft budget cannot establish a hard USD ceiling. Do not advertise one on that
   basis. No Gateway key or project budget is created or mutated by these controls.
6. Reconcile only authoritative provider-reported USD charge metadata. Preserve
   its original amount, currency, provenance and attempt identity in existing trace
   JSON; store `ceil(USD × 100)` in existing `costCents` using conservative decimal
   arithmetic. Keep heuristic token estimates separately labeled; do not relabel
   them as measured usage. Per-attempt upward rounding may conservatively overcount.
7. Missing, malformed, non-USD or uncertain charge data stays unknown, not zero.
   Preserve the reservation, stop further paid dispatch, and show reconciliation
   required. A crash, lost response or unknown charge never permits automatic
   restart. Accepted zero provider charge and zero-cost demo remain distinguishable.
8. A budget/deadline stop retains completed findings and marks remaining personas
   unexecuted. Do not invent zero scores, silently reduce the cohort or present a
   partial aggregate as a complete run. Show depth, currency, cap meaning, known
   conservative spend, reservations and unknown amounts in traces/results/report.

The existing run/agent statuses, error fields, nullable cost field and trace JSON
appear sufficient; implementation must confirm this without silently adding a
migration. Reservations/accounting must be durable before dispatch and remain
auditable after errors. Existing shared-workspace/access and durable-file hosting
limits remain as documented in [deployment](../deployment.md).

## Pinned SDK evidence

The unchanged lock resolves `ai@6.0.209` and `@ai-sdk/gateway@3.0.134`.
The [matching source](https://github.com/vercel/ai/tree/617c7f9e163ed79b097ad999fb327c9f1df62edf)
supports output-token limits, cancellation and retry settings, with two SDK
retries by default. A zero output-token limit is invalid; zero-cost admission
must be decided before dispatch. These settings do not supply a per-request USD
ceiling. The optional model catalogue prices are per-token USD strings with a
five-minute metadata cache, rather than binding charge quotes.

The pinned SDK exposes per-step metadata and generation lookup. A successful
request can incur cost even when later structured-output parsing fails; its
last-step metadata alone cannot account for multiple billable steps. Preserve
validated reported charges and generation identities for reconciliation, without
treating passthrough metadata as an authenticated billing guarantee. See the
[pinned generation implementation](https://github.com/vercel/ai/blob/617c7f9e163ed79b097ad999fb327c9f1df62edf/packages/ai/src/generate-text/generate-text.ts)
and [Gateway generation-info type](https://github.com/vercel/ai/blob/617c7f9e163ed79b097ad999fb327c9f1df62edf/packages/gateway/src/gateway-generation-info.ts).
Vercel separately documents [Gateway budgets](https://vercel.com/docs/ai-gateway/observability-and-spend/budgets)
as soft caps checked before requests; the request crossing a limit can complete.
No billing API, model catalogue, generation lookup or provider call was executed
for this source review.

## Future focused verification

Derive cases from the concrete implementation, without assuming counts or CI:
profile propagation and unchanged cohort/snapshots; explicitly labeled free demo;
atomic competing claims/replay; sequential durable reservations; exact cap and
decimal-rounding boundaries; absent worst-charge contract refusal before dispatch;
zero-budget behavior after clarification; provider success/missing/invalid cost;
failure/cancellation/late result/lost acknowledgment/crash with no paid retry;
partial-result/report qualifications and preserved historical records.

Use authored fixtures and mocked provider boundaries first. SQL concurrency,
browser behavior and real provider accounting need their own appropriate proof.
Earlier import and target-market check scopes do not authorize these new checks.
This inactive document changes no runtime and supplies no acceptance claim.
