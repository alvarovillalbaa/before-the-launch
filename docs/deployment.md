# Deployment

Last updated: 2026-11-13

## Vercel

Deploy as a Next.js App Router application.

Required production environment variables:

- `DATABASE_URL`
- `OPERATOR_ACCESS_KEY`: a private random 32-byte access key in encrypted server configuration. The owner uses it at `/login`; keep it out of client variables, source, logs and build receipts. Missing configuration fails closed.

Optional:

- `AI_GATEWAY_API_KEY`
- `AI_GATEWAY_MODEL`
- `SIMULATION_ENGINE`
- `MAX_UPLOAD_BYTES`
- `MAX_URL_FETCH_BYTES`

## Database

Use a managed Postgres database. Run:

```bash
pnpm db:push
pnpm db:seed
```

For production, replace seed data with a migration-backed process before onboarding real users.

## Workflows

The durable-dispatch candidate uses the pinned Workflow5.4.0 API and actual
step boundary. Creation, actions and the protected execute route submit the
saved SQL run through one domain Hook token. Duplicate starts recover the same
owner, with one day of Hook retention and the longer-lived saved SQL binding.
Dispatch uncertainty keeps the saved run and offers a retry of that request;
it does not fall back to `after()` or create a new simulation ID.

The worker binds its own opaque Workflow ID before the existing SQL claim.
Execution step retries are zero: an interrupted body could have sent a model
request. Existing240-second run/60-second call bounds, stop/admission and
expired-claim partial-result reconciliation remain. A known failed/cancelled
dispatcher can close an unclaimed queued run, never overwrite an active claim.
Workflow completion is not proof of complete model coverage or known cost.
The [new runtime qualification](proposals/workflow-dispatch.md) is pending;
the dependency install pass does not prove durable product execution.

Local `dev` and `start` bind127.0.0.1. The SDK Local World is a single-instance
development backend with no authentication; do not expose its internal routes
through a public proxy or run multiple workers against the same data directory.
Its default `.workflow-data/` is private/ignored. Restart recovery follows the
SDK's recorded step/queue semantics; it cannot make uncertain external calls
safe to replay. For Vercel, use the default authenticated Vercel World. An
explicit non-Vercel World is rejected by the hosted config. No World setting,
operator key or environment write was applied to the hosted project here.

## Storage

Both upload paths use `lib/server/storage/source-storage.ts`. Outside Vercel,
`SOURCE_STORAGE_DRIVER=local` preserves local original files. Vercel rejects that
mode for new uploads instead of writing originals to ephemeral disk.

For hosting, provision a **private** Vercel Blob store, set
`SOURCE_STORAGE_DRIVER=blob`, and supply either `BLOB_READ_WRITE_TOKEN` or
`BLOB_STORE_ID` with the Vercel OIDC environment. Keep all credentials server-side.
Uploads always require private access; a public store is not supported. The app
stores a versioned Blob pathname in the existing source key field, without a
database migration. No store, plan or environment setting is provisioned by this
source change. The earlier environment-write403 production gate remains pending.

See the [original file contract](source-storage.md) for compensation, uncertain
commits and compatibility limits. Current services use one shared workspace
protected by a single-operator session; separate user accounts remain outside
this scope. [Historical intake evidence](results/2026/10-27/upload-workspace.md)
does not prove the new adapter or live hosted retention.

## Security Checklist

- Set conservative upload and fetch limits.
- Put public instances behind rate limiting.
- Keep AI and database credentials server-side only.
- Review retention policies for uploaded source content.
