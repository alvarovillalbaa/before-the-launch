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

1. Writes a private, mode-600 `.env.local` with a random operator access key when it does not exist. Existing environment files are preserved; configure `OPERATOR_ACCESS_KEY` there if missing.
2. Creates `.data/storage` for uploaded files.
3. Starts the Postgres container from `docker-compose.yml`.
4. Runs `drizzle-kit push`.
5. Seeds demo data.

## Environment

Important local variables:

- `DATABASE_URL`: Postgres connection string.
- `OPERATOR_ACCESS_KEY`: private random 32-byte key; enter it at `/login`. Missing or weak keys leave workspace access closed. Never commit this key.
- `LOCAL_STORAGE_DIR`: local file storage path.
- `SIMULATION_ENGINE`: legacy environment setting; the explicit per-run engine now controls execution.
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

The setup form defaults to Free demo, Standard depth and $0 model spending.
Gateway requires an explicit positive USD estimated target and operator admission;
it stays unavailable if credentials or model pricing are missing. The target is
not a guaranteed billing ceiling. See the [execution contract](proposals/execution-controls-v2.md).
