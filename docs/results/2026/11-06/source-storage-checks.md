# Private originals and atomic source writes

Both ingestion paths now share local/private-Blob original storage. Hosted uploads
fail closed without private storage, with no ephemeral-disk fallback. Source and
chunk rows commit together. Definite failures compensate only their batch;
uncertain COMMIT replies retain originals. Failed cleanup remains retryable and
OIDC is resolved by the SDK rather than pinned in cached environment data.
See [the storage contract](../../../source-storage.md).

**23/23 new unit cases and 9/9 actual PostgreSQL cases passed** at
`e87d6e9433c8ff13577b74ca6b2af25226273fa0`,
[run 42150450478](https://github.com/alvarovillalbaa/before-the-launch/actions/runs/42150450478),
job `127672146065`, 6 November 2026, **02:28:02–02:28:42 UTC**.
The two CLIs exited zero with exact source-derived name sets, zero pending/failed
cases and retry-zero configurations. Vitest JSON reports final outcomes, not
independent attempt counters. The original seven intake SQL cases were rerun
because the staging path changed; two new SQL cases cover file-source exact
bytes/metadata/chunks and real rollback/owned cleanup after a chunk trigger fails.

The thirteen adapter cases exercise actual owned local files, legacy reads,
path/symlink/read bounds, unrelated-file preservation, private SDK options,
configuration, cancellation, uncertain upload receipts and cleanup retries.
Ten service cases use mocked transaction/Blob boundaries to cover partial upload
failure, rollback, lost COMMIT acknowledgement, exact metadata/chunks and failed
extraction with retained originals. Real provider calls are not made by these
mocks. The actual PostgreSQL 17.6 cases use the unchanged existing schema only
in a fresh, explicitly marked disposable database; no production migration ran.

Frozen install and eight-file scoped ESLint/TypeScript exited zero, without lint
warnings. Root independently verified all **127 exported source/test/config/lock
hashes**, twenty complete original command streams, and both original Vitest JSON
files against their recorded lengths/digests and parsed reports. Source, process
absence (no supplementary signals), marked-database drop, stream closure and
owned scratch deletion passed; provider container stop succeeded.

The [original current receipt](source-storage-checks.json) is **77,700 bytes**,
SHA-256 `185778317e072f746cfe22cd14983491b10c8a347fa3b77b4d4704c5bd9e8d83`.
The [first lint failure](source-storage-attempt-1.md) and all fourteen of its
streams remain preserved. Its exact generated lock was imported and reused,
not regenerated: 463,973 bytes, SHA-256
`ce06e4cc5d6148d77b96ab8cb370f4e382659e0a1f53b78b3301fd06a3c3e910`.
Only Blob changed direct resolution (1.1.1 to 2.8.2); the other 46 stayed exact.
The current controller verifies the preparation receipt, original streams and
artifact binding before frozen installation. Both temporary workflows are
disabled and their owned QA branches retired; normal source has no active copy.

## Publication boundary

This extends the existing **draft** execution-controls candidate. The documented
[production environment-write403](../11-05/execution-controls.md#production-gate-and-limits)
remains pending. No unchanged credential retry, merge, production deployment,
new store/account, plan change or real provider/model action was attempted.
The earlier 137 execution-controls and 48 provenance cases retain their original
checked sources; they were not rerun or relabelled as latest-candidate acceptance.

Private store provisioning/permissions, live Blob durability/OIDC refresh,
hosted access/persistence, browser interactions and full-product acceptance remain
open. A provider interruption may still leave orphan originals; there is no
background garbage collector. Old local files require a separate migration for
hosted reads. Local install/build/database work stayed stopped by Storage Guard.
The overall portfolio goal remains active and unfinished.
