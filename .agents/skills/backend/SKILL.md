---
name: backend
description: >-
  Use for backend engineering work such as APIs, services, data models,
  persistence, queues, caching, auth, background jobs, and server-side
  debugging or refactors.
---

# Backend

This skill owns server-side implementation depth. Use it together with [`../agentic-development/SKILL.md`](../agentic-development/SKILL.md): `agentic-development` handles repo orientation, planning, and execution model; this skill handles APIs, services, schemas, persistence, and operational backend detail.

## Start Here

1. Pair with [`../agentic-development/SKILL.md`](../agentic-development/SKILL.md) for repo orientation, proof planning, and execution-mode selection.
2. Map the authoritative backend path before editing: endpoint, serializer/validator, service, job, model, schema, queue consumer, or migration owner.
3. Confirm contracts first: request/response shape, auth, persistence, failure modes, and observability.
4. Prefer extending an existing service/model/workflow over introducing a parallel abstraction.
5. If the change affects browser state, design systems, client routes, or interaction quality, route that slice into [`../frontend/SKILL.md`](../frontend/SKILL.md).

## Core Rules

- Maximize reuse and minimize total LOC.
- Prefer one authoritative implementation path over duplicated variants.
- Data model, API contract, and service boundary decisions should be explicit before coding.
- Keep migrations, schema changes, and rollout strategy safe and auditable.
- Auth, input handling, caching, retries, and background execution are part of correctness.
- When debugging, start from existing signals and evidence before adding new logging.
- Keep server responsibilities on the server; do not push backend behavior into the frontend because it is expedient.

### Layer Ownership

Business logic lives in **services**, not in controllers, views, or models. Follow this routing:

| Layer | Owns |
|-------|------|
| **Controllers / Views** | Request parsing, auth check, delegating to a service, serializing the response. No business logic. |
| **Serializers / Validators** | Input shape validation and output shape mapping. Route the result to a service for processing — serializers do not compute. |
| **Services** | The business logic: computations, orchestration, side effects, third-party calls, conditional branching. Keep services small and single-purpose. |
| **Models** | Persistence shape, relationships, and simple data invariants. Keep models clean — no business logic, no external service calls. |

A smell that logic is in the wrong layer: a controller or serializer that branches on business state, or a model that calls an external API.

## Workflow Router

### Delivery workflow

Read [backend-development.md](./references/backend-development.md) for service-layer, data-model, API, async, and architecture heuristics.

### API design and review

Read [api-design-patterns.md](./references/api-design-patterns.md) when designing or refactoring REST or GraphQL APIs.

Read [rest-design-rules.md](./references/rest-design-rules.md) for detailed REST semantics, URL design, response conventions, caching headers, and rate-limit headers.

Read [api-antipatterns.md](./references/api-antipatterns.md) when auditing or reviewing an existing API surface.

### Database design and performance

Read [database-design-reference.md](./references/database-design-reference.md) when designing a schema from scratch or evaluating normalization/denormalization.

Read [normalization-guide.md](./references/normalization-guide.md) for deep normalization and denormalization trade-off work.

Read [database-optimization.md](./references/database-optimization.md) when queries are slow or database performance needs improvement.

Read [index-strategy-patterns.md](./references/index-strategy-patterns.md) for index selection, query-pattern matching, and over-indexing avoidance.

Read [database-selection-decision-tree.md](./references/database-selection-decision-tree.md) when choosing a database technology or migration path.

### Backend security

Read [backend-security-node.md](./references/backend-security-node.md) when touching authentication, authorization, input handling, or HTTP response security in Node/Express systems.

## Bundled Scripts

- `scripts/api_linter.py` for REST/OpenAPI linting.
- `scripts/api_scorecard.py` for API quality grading.
- `scripts/breaking_change_detector.py` for API diffing and breaking-change classification.
- `scripts/api_scaffolder.py` for route/type/middleware scaffolding from OpenAPI or schemas.
- `scripts/api_load_tester.py` for endpoint latency and throughput measurement.
- `scripts/database_migration_tool.py` for schema analysis and migration help.
- `scripts/schema_analyzer.py` for normalization, constraints, and ERD analysis.
- `scripts/index_optimizer.py` for index recommendations.
- `scripts/migration_generator.py` for schema diffs and zero-downtime migration planning.

## Standard Loop

1. Orient with [`../agentic-development/SKILL.md`](../agentic-development/SKILL.md).
2. Trace the existing owner of the API/service/model/job/schema behavior.
3. Lock the contract, data flow, and failure modes before coding.
4. Implement the smallest coherent backend change.
5. Verify with focused proof first: tests, schema diff, load test, or logs/traces.
6. Pull in [`../frontend/SKILL.md`](../frontend/SKILL.md) when the task also changes browser-facing behavior or UI integration.

## Skill Orchestration

- Use [`../frontend/SKILL.md`](../frontend/SKILL.md) for routes, components, interaction behavior, design systems, accessibility, and browser performance.
- Use [`../agentic-development/SKILL.md`](../agentic-development/SKILL.md) when the work needs repo-wide planning, architecture explanation, execution-mode selection, or coordinated frontend/backend delivery.
- Use `quality-assurance` for passive security audits, threat modeling, test strategy, and CI triage.
