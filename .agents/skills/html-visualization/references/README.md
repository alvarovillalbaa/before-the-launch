# visualizer

`visualizer` is a portable skill for turning complex technical or business information into self-contained HTML explainers, reviews, dashboards, and slide-mode pages.

## Portable use

Copy `skills/visualizer` into your local skill registry, or install it from this repo using your runtime's preferred skill workflow.

## What it is for

Use `visualizer` when plain chat output would be structurally correct but visually weak:

- architecture walkthroughs
- plan reviews
- diff reviews
- comparison matrices
- dashboards
- recaps and timelines
- presentation-style HTML

## What it includes

- `SKILL.md`: workflow and decision rules
- `agents/`: UI metadata for skill browsers and default prompts
- `references/`: rendering strategy, visual systems, and QA checklist
- `templates/`: reusable HTML shells
- `scripts/scaffold_visualizer.py`: starter artifact generator
