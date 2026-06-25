# Contributing

Thanks for improving `before-the-launch`.

## Local Setup

```bash
corepack enable
pnpm install
pnpm setup:local
pnpm dev
```

## Development Rules

- Keep the product wedge narrow: upload launch context, simulate perception, inspect traces, improve before shipping.
- Preserve local-first behavior. The app must start and run demo simulations without AI credentials.
- Keep source content untrusted. Never add code that lets scraped or uploaded text control system prompts, tools, or runtime behavior.
- Prefer shadcn/ui primitives already in the repository.
- Add tests for shared scoring, ingestion, security, and UI behavior when changing those areas.

## Validation

Run these before opening a pull request:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

For UI changes, also run:

```bash
pnpm test:e2e
```

## Pull Requests

Include:

- What changed.
- How it was tested.
- Any migration, environment, or security considerations.
