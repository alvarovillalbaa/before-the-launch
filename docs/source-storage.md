# Original file storage

Product intake and file-source ingestion share one server-only adapter. Local
development defaults to `SOURCE_STORAGE_DRIVER=local` under `LOCAL_STORAGE_DIR`.
Hosted Vercel uploads require `SOURCE_STORAGE_DRIVER=blob` and a private store.
Missing credentials or local mode on Vercel fail before project/source inserts;
there is no public-store or ephemeral-file fallback.

Blob access uses a server read/write token, or an explicit store ID plus Vercel
OIDC environment. OIDC tokens are resolved/refreshed by the SDK for each operation;
they are not captured in the application's cached configuration. Each original gets an unpredictable versioned pathname under
`before-the-launch/source-originals/v1/`. Writes disallow overwrites and automatic
suffix changes. Source rows retain the existing `storage_key` field with a
`blob:` prefix; original names, MIME type, exact byte hash and extracted text
retain their existing metadata fields. No schema change is needed. No URL or
credential becomes a client-visible storage key. Reads use private access and
bypass cache; actual bytes and metadata are bounded by `MAX_UPLOAD_BYTES`.

Local writes use a fresh `intake-*` directory and exclusive UUID filenames. Reads
continue to accept old intake and project/timestamp keys under the configured
directory. Traversal, absolute keys and symlink escapes are rejected. Changing
the driver does not move existing files: old local originals need a separately
reviewed migration before they can be read on Vercel. Soft-deleting a source
retains its original, matching the existing retention behavior.

Both services finish uploads before opening their SQL transaction. Source rows
and chunks are atomic. A definite failure before the transaction body completes
attempts compensation only for this batch. Unknown files stop local cleanup;
provider cleanup failures are reported for reconciliation. If COMMIT's reply is
lost after the body completes, originals are retained because the rows may have
committed. Operators must check the dashboard before retrying. This conservative
policy can leave orphan originals; it does not delete potentially committed data.
An interrupted/uncertain provider write can also leave an orphan, even after a
cleanup attempt. There is no background garbage collector or retention migration.

`readLocalStoredSource` remains a compatibility wrapper over the keyed reader;
this change adds no download route or public access. Current workspace access
remains single-operator. Live store provisioning, hosted permission/configuration,
retention policy and provider durability acceptance remain separate gates.

The previous Blob SDK 1.1.1 lacked private storage. This source pins **2.8.2**,
the stable npm release observed 6 November 2026, while preserving other direct
resolutions during lock generation. Primary contracts:
[private storage](https://vercel.com/docs/vercel-blob/private-storage),
[pinned SDK get](https://github.com/vercel/storage/blob/%40vercel%2Fblob%402.8.2/packages/blob/src/get.ts),
[pinned put](https://github.com/vercel/storage/blob/%40vercel%2Fblob%402.8.2/packages/blob/src/put.ts).

Focused verification uses authored bytes, mocked Blob SDK leaves and disposable
PostgreSQL. It calls no real storage or model provider and makes no live hosted
retention claim. Local installation/build/database work remains stopped by
Storage Guard; the source stays on the existing draft candidate behind its
documented production environment permission gate.
