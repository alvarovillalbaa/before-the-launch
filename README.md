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
