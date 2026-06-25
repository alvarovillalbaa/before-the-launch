# Architecture

`before-the-launch` is a local-first Next.js App Router application.

## Layers

- `app/`: routes, server components, server actions, and API endpoints.
- `components/`: app shell and shadcn/ui-owned components.
- `lib/shared/`: Zod schemas and shared TypeScript types.
- `lib/server/config/`: server-only environment parsing.
- `lib/server/db/`: Drizzle schema and database client.
- `lib/server/services/`: ingestion, project, persona, and simulation services.
- `workflows/`: Vercel Workflow entrypoints.
- `scripts/`: local setup and seed scripts.

## Runtime Flow

Product projects own a current product brief, sources, personas, and simulation runs. A run freezes the brief, source list, and persona records into JSON snapshots before any agent executes. Later edits create new source or brief state but do not mutate historical run inputs.

Simulations execute through a service that can use either deterministic fake agents or AI Gateway-backed structured output. The current local path persists run progress synchronously so refreshes can resume from the database.

## Storage

Postgres is the durable system of record. Uploaded files are written to `LOCAL_STORAGE_DIR` by default. Vercel Blob can be added later without changing the data model because sources already store a `storageKey`.

## Workflows

The Workflow DevKit integration is configured in `next.config.ts`, and `workflows/simulation-workflow.ts` exposes the durable simulation entrypoint. Local server actions call the simulation service directly so development works without a workflow worker or AI credentials.
