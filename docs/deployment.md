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
- `BLOB_READ_WRITE_TOKEN`
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

Local storage is the default fallback. In production, configure Vercel Blob and update the storage adapter in `source-ingestion.ts` to write uploaded bytes to Blob while keeping the same source metadata fields.

The upload-only intake also stages originals through local storage. Both ingestion paths need durable hosted storage before production file retention can be claimed. Current services use one shared workspace protected by a single-operator session; separate user accounts and isolated account storage remain outside this scope. The intake source change did not provision managed storage or a database. See [product intake](product-intake.md) and its [historical acceptance evidence](results/2026/10-27/upload-workspace.md) for those proof limits.

## Security Checklist

- Set conservative upload and fetch limits.
- Put public instances behind rate limiting.
- Keep AI and database credentials server-side only.
- Review retention policies for uploaded source content.
