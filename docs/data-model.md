# Data Model

Last updated: 2026-10-28

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

## Uploaded Partial Briefs

Upload-only intake can create a current brief with omitted facts stored as empty strings. A filename-derived project label belongs to `ProductProject.name`; it does not populate a missing `ProductBrief.productName`. Run snapshots preserve those missing facts. The existing strict JSON project-creation API remains unchanged. See [product intake](product-intake.md) for the import contract.

## Immutable Run Snapshots

Every simulation run stores:

- `briefSnapshot`
- `sourceSnapshot`
- `personaSnapshot`

These snapshots are used for agent execution and results. Later edits to sources, personas, or briefs do not silently change historical outputs.

The existing `SimulationRun.targetMarket` column is the saved operator-selected evaluation audience. Execution copies it into a frozen context shared by both engines and fallback; it does not replace `briefSnapshot.market` or become a source fact. New context traces and reports record this audience explicitly. No schema or historical-row migration is needed. See [agent execution](ai-agents.md#engines).

## Scoring Components

Scores include launch readiness, market clarity, positioning clarity, differentiation, trust, urgency, adoption likelihood, pricing fit, negative feedback risk, support burden, sales friction, virality/shareability, and enterprise readiness.
