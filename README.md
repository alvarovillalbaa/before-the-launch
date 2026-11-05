# before-the-launch

`before-the-launch` is a local-first perception simulator for product launches.
It helps teams upload launch context, run configurable market-persona agents, inspect every trace, and turn the result into concrete product, pricing, messaging, and GTM changes.

It is not a market prediction oracle. It is a structured pre-launch review tool.

## Stack

- Next.js App Router and TypeScript
- Tailwind and shadcn/ui primitives
- Postgres with Drizzle
- Vercel AI SDK v6 structured output, with AI Gateway when credentials are present
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

`pnpm setup:local` creates `.env.local`, starts Postgres with Docker Compose, pushes the Drizzle schema, and seeds demo data.

If Docker is not available, point `DATABASE_URL` in `.env.local` at any local Postgres database and run:

```bash
pnpm db:push
pnpm db:seed
pnpm dev
```

## AI Credentials

The app works without AI credentials. In that mode, simulations use deterministic fake agents and still produce traces, evidence references, scores, recommendations, and exportable reports.

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
SIMULATION_ENGINE=gateway
AI_GATEWAY_MODEL=anthropic/claude-sonnet-4.5
```

## Core Flow

1. Upload product files, review the imported context, and create a project.
2. Add context as text, URLs, or files.
3. Run a simulation with selected personas.
4. Inspect live-style agent traces and structured findings.
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
