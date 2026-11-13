# Architecture

Last updated: 2026-11-13

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

The durable-dispatch candidate starts `simulationWorkflow` through the real
Workflow API from creation/actions/execution. A domain Hook deduplicates starts;
the existing `workflowRunId` is bound through compare-and-set by both dispatcher
and worker. Only the saved run ID is passed. Node/SQL/model execution lives in a
step with zero automatic body retries; SQL claims, admissions and partial-result
reconciliation remain authoritative. There is no request-lifetime execution
fallback. A shared process promise explicitly starts the World when a saved
request is reopened. [Eight runtime/UI identities](results/2026/11-13/workflow-dispatch.md)
are qualified across preserved originals under
[the release contract](proposals/workflow-dispatch.md). Earlier checks retain
their own sources; hosted access/persistence and real billing remain unverified.

Local commands bind127.0.0.1 because the SDK's Local World has no authentication.
Do not expose its generated routes through a public proxy. Vercel uses its
authenticated World; an explicit non-Vercel World is rejected in that hosting
configuration. This does not add multi-user or membership isolation.
