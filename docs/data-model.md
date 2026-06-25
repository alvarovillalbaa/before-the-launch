# Data Model

The durable entities are implemented in `lib/server/db/schema.ts`.

## Entities

- `Workspace`: local workspace boundary.
- `ProductProject`: product launch project.
- `ProductBrief`: versioned launch brief; only one is current.
- `Source`: uploaded, pasted, or URL-fetched material.
- `SourceChunk`: chunked text for retrieval and evidence reference.
- `Persona`: configurable simulated market actor.
- `SimulationRun`: immutable run snapshot and status.
- `AgentRun`: per-persona execution record.
- `AgentTraceEvent`: trace timeline for each agent.
- `AgentFinding`: validated structured agent output.
- `ScoreBreakdown`: component scores for a run.
- `Recommendation`: product, pricing, messaging, and GTM changes.
- `Report`: exportable markdown report.

## Immutable Run Snapshots

Every simulation run stores:

- `briefSnapshot`
- `sourceSnapshot`
- `personaSnapshot`

These snapshots are used for agent execution and results. Later edits to sources, personas, or briefs do not silently change historical outputs.

## Scoring Components

Scores include launch readiness, market clarity, positioning clarity, differentiation, trust, urgency, adoption likelihood, pricing fit, negative feedback risk, support burden, sales friction, virality/shareability, and enterprise readiness.
