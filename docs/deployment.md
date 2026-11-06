# Deployment

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

The app includes `withWorkflow` and a workflow entrypoint, but no caller starts
that workflow and durable Workflow execution is unverified. Current run creation
returns a queued row and schedules protected HTTP execution with Next `after`.
The execute route is a fallback; a conditional queued claim permits execution
once across duplicate callers. Its hosting duration is 300 seconds, with a
240-second run deadline and 60-second model-call deadline. Expired claims are
reconciled without replaying uncertain paid work. Database availability is needed
to persist and reconcile controls; a worker can die before finalization. These
bounds do not establish durable background processing after process death.

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
