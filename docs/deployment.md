# Deployment

## Vercel

Deploy as a Next.js App Router application.

Required production environment variables:

- `DATABASE_URL`

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

The app is wired with `withWorkflow` in `next.config.ts` and includes a simulation workflow entrypoint. Use Vercel Workflows for long-running production ingestion and simulation jobs. Local development uses direct service calls for simplicity.

## Storage

Local storage is the default fallback. In production, configure Vercel Blob and update the storage adapter in `source-ingestion.ts` to write uploaded bytes to Blob while keeping the same source metadata fields.

The upload-only intake also stages originals through local storage. Both ingestion paths need durable hosted storage before production file retention can be claimed. Current services use one shared workspace and have no account ownership boundary; choosing public access or isolated account storage is a separate deployment decision. No managed database, Auth policy, or storage configuration is provisioned by the intake source change. See [product intake](product-intake.md) for current import behavior and [acceptance evidence](results/2026/10-27/upload-workspace.md) for its proof limits.

## Security Checklist

- Set conservative upload and fetch limits.
- Put public instances behind rate limiting.
- Keep AI and database credentials server-side only.
- Review retention policies for uploaded source content.
