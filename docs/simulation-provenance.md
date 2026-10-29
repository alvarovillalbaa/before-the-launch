# Simulation result provenance

The configured engine describes the requested execution path. The result source
describes the producer of a particular stored judgment. A Gateway run can contain
synthetic fallback judgments, so its engine badge cannot establish the origin of
its scores or report.

## Current results

The run view shows a provenance notice before scores, an origin for each persona
and a qualification alongside the report. The workflow-status response retains
its existing `engine` field and adds aggregate/per-persona `provenance` records.
The numeric findings, scores, recommendations, selected cohort and existing
Gateway-to-fake fallback behavior are preserved.
Missing score cards now show `n/a` instead of an invented zero; a genuinely
recorded zero retains its existing display and rounding.

| Origin | Meaning |
| --- | --- |
| Gateway | A matching judgment record states that validated output came through Gateway. |
| Synthetic demo | Output came from the deterministic fake engine. |
| Synthetic fallback | Gateway failed and the existing fake fallback produced the judgment. |
| Unknown | A finding exists but its origin evidence is missing, contradictory or unbound. |
| Pending | No finding is available; no producer or zero score is inferred from this state. |

Mixed and synthetic results are qualified before decision-making. Unknown records
do not become Gateway results merely because the configured engine says
`gateway`. This is producer lineage, not evidence of model quality, source
accuracy, observed customer behavior or a provider attestation.

## Finding and output bindings

For new results, the service assigns the existing finding UUID before writing
the judgment trace and finding. The trace's version-one `executionOrigin` record
names that exact finding, configured engine and actual origin. Reads ignore
origin records belonging to other findings. Missing, duplicate, contradictory or
incompatible origin records cannot establish a positive Gateway result.

A historical fake-engine finding can be identified as synthetic. A legacy
fallback trace without a finding binding is evidence that fallback occurred,
but cannot establish that an arbitrarily selected finding came from that same
attempt. It receives an explicit unknown qualification. No historical trace,
finding or report is rewritten to manufacture an origin.

New aggregate output also records its existing score/report IDs and complete
finding-ID set under the run's existing `disagreementSummary` JSON. Reads match
those identities and summary fields against the selected records before
attributing an aggregate/report to a composition. Missing or mismatched bindings
leave the aggregate/report origin unverified while retaining the actual
per-persona counts. The existing selection of historical records is preserved.
This avoids attributing one attempt's report to another attempt's findings.

New Markdown reports include the composition captured when they were generated.
The Report view separately prefixes its current assessment before the original
stored report, including historical bodies. That is a read-only projection;
copying the displayed Markdown retains the qualification without changing the
stored historical document. Recorded and current assessments can differ when
the available execution records do not match.

These additions use existing UUID columns and JSON trace/summary fields. They
introduce no migration, access policy, provider call, credential setting or
change to paid/fake engine selection. Depth/budget controls remain subject to
their [separate inactive contract](proposals/simulation-execution-controls.md).

## Verification boundary

Source and authored-fixture checks are recorded in owning dated results. New
backend/SSR checks require their own explicit approval. Fake outputs and mocked
Gateway responses cannot establish real model behavior, SQL durability, browser
rendering, hosted account isolation or spend enforcement. Existing approved
import checks and pending target-market checks retain their original scopes.
