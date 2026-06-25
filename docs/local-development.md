# Local Development

## Prerequisites

- Node.js compatible with Next.js 16
- Corepack
- Docker Desktop or another local Postgres instance

## Setup

```bash
corepack enable
pnpm install
pnpm setup:local
pnpm dev
```

The setup script:

1. Writes `.env.local` from safe local defaults when it does not exist.
2. Creates `.data/storage` for uploaded files.
3. Starts the Postgres container from `docker-compose.yml`.
4. Runs `drizzle-kit push`.
5. Seeds demo data.

## Environment

Important local variables:

- `DATABASE_URL`: Postgres connection string.
- `LOCAL_STORAGE_DIR`: local file storage path.
- `SIMULATION_ENGINE`: `auto`, `fake`, or `gateway`.
- `AI_GATEWAY_API_KEY`: optional AI Gateway key.
- `MAX_UPLOAD_BYTES`: upload size limit.
- `MAX_URL_FETCH_BYTES`: URL fetch size limit.

## Common Commands

```bash
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm db:push
pnpm db:seed
```

## Running Without AI

No AI credentials are required for local development. The seeded demo and all user-created simulations can run with deterministic fake agents.
