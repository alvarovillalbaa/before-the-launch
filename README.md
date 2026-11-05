# before-the-launch

`before-the-launch` is a local-first perception simulator for product launches.
It helps teams upload launch context, run configurable market-persona agents, inspect every trace, and turn the result into concrete product, pricing, messaging, and GTM changes.

It is not a market prediction oracle. It is a structured pre-launch review tool.

## Stack

- Next.js App Router and TypeScript
- Tailwind and shadcn/ui primitives
- Postgres with Drizzle
- Vercel AI SDK v6 structured output, with explicitly selected, operator-authorized AI Gateway runs
- Vercel Workflow integration points through the Workflow DevKit
- Local file storage fallback by default
- Deterministic fake agents for local demo runs without AI credentials

## Local Start

```bash
corepack enable
pnpm install
pnpm setup:local
pnpm dev
```

Open `http://localhost:3000`.

The workspace requires `OPERATOR_ACCESS_KEY` in the server environment. Use a
cryptographically random 32-byte key, keep it private, and enter it at `/login`.
An empty or too-short key leaves access closed. Rotating the key revokes existing
sessions and queued paid authorizations. This is a single-operator workspace;
it does not provide separate user accounts or membership permissions.

`pnpm setup:local` creates `.env.local`, starts Postgres with Docker Compose, pushes the Drizzle schema, and seeds demo data.

If Docker is not available, point `DATABASE_URL` in `.env.local` at any local Postgres database and run:

```bash
pnpm db:push
pnpm db:seed
pnpm dev
```

## AI Credentials

Free demo is the default: zero model spending, no model request, and deterministic
synthetic findings with traces, scores, recommendations and exportable reports.
Gateway is a separate explicit choice. A positive USD amount is an **estimated
spending target**, which final charges can exceed; it is not a hard billing cap.
Missing credentials or model pricing leave Gateway unavailable. The app never
silently converts an explicit Gateway request to a successful demo run.

Quick, Standard and Deep change Gateway prompt treatment and output allowance.
They retain the complete chosen cohort. Demo scores stay deterministic at every
depth. Run pages show completed/failed/unexecuted coverage, outstanding estimated
reservations, known charges, unknown charges and finite stop reasons. The
[execution contract](docs/proposals/execution-controls-v2.md) separates this
new scope from historical verification; its focused checks are pending.

[Result provenance](docs/simulation-provenance.md) distinguishes Gateway output,
synthetic demo output and Gateway fallbacks in results, persona rows and reports.
The configured engine alone does not establish how each judgment was produced.

The [48 provenance checks](docs/results/2026/11-05/provenance-checks.md) passed
against `ee12493e4399fd39da084d6bed587afca4dacfc8` in one invocation configured
with zero retries: five files, seven suites, actual CLI exit zero and verified
source guards/owned cleanup. These mocked-service, pure-helper and React SSR
checks establish no SQL durability, hosted access isolation, real provider
behavior/cost, browser interaction or budget enforcement. The
[scope and preserved first failure](docs/proposals/provenance-checks-v2.md)
retain the evidence and its limits.

To use AI Gateway, set one of:

```bash
AI_GATEWAY_API_KEY=...
# or a Vercel OIDC environment when deployed
VERCEL_OIDC_TOKEN=...
```

Optional:

```bash
AI_GATEWAY_MODEL=anthropic/claude-sonnet-4.5
```

## Core Flow

1. Upload product files, review the imported context, and create a project.
2. Add context as text, URLs, or files.
3. Select the complete persona cohort, engine, depth and USD spending target.
4. Follow saved progress, agent traces, coverage and structured findings.
5. Review score breakdown and recommendations.
6. Export the generated markdown report.

Projects contains product and run history, plus the New simulation chooser for new or existing products. See [product intake](docs/product-intake.md) for supported files and optional structured brief fields.

## Useful Commands

```bash
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
pnpm db:push
pnpm db:seed
```

## Documentation

- [Local development](docs/local-development.md)
- [Product intake](docs/product-intake.md)
- [Architecture](docs/architecture.md)
- [AI agents](docs/ai-agents.md)
- [Data model](docs/data-model.md)
- [Deployment](docs/deployment.md)
- [Security](SECURITY.md)

## License

MIT. See [LICENSE](LICENSE).
