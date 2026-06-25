# code-slides skill

`code-slides` is an agent skill for building responsive, code-based slide decks and single-file HTML presentations with visual preset exploration, PPT-to-web conversion guidance, configurable navigation placement, multi-source image workflows, and AI-image slide generation from structured content specs.

## Portable use

Clone the repository or copy `skills/code-slides` into your local skill registry, then load `SKILL.md` in your preferred assistant environment.

## Repo-specific integration

Environment-specific install examples live in [docs/agent-suite-integration.md](../../docs/agent-suite-integration.md).

## Repository layout

- `skills/code-slides/SKILL.md`: Skill instructions and workflow.
- `skills/code-slides/agents/`: UI metadata for skill pickers and default prompts.
- `skills/code-slides/references/`: Decision trees, style presets, viewport-fit, and implementation references.
- `skills/code-slides/scripts/`: Scaffolding, image generation, indexing, validation, and install automation.
- `skills/code-slides/templates/`: HTML and React/TS starter templates.
- `skills/code-slides/templates/`: Planning and implementation prompt templates.
