# Video Generation

Remotion-focused video skill for programmatic video creation and editing, including scene-first builds, walkthrough manifests, and `@json-render/remotion` timelines.

It is now explicitly modeled after the operating discipline of [`browser-use/video-use`](https://github.com/browser-use/video-use): ask targeted questions, confirm a plain-English strategy before major work, implement, self-evaluate, and persist the approved plan.
It also now borrows key skill patterns from [`heygen-com/hyperframes`](https://github.com/heygen-com/hyperframes): a stricter visual identity gate, a clearer layout-before-animation contract, and stronger review checkpoints.

## Use this for

- React-based video generation
- animations, captions, timing, and asset workflows
- videos that combine repo assets, generated imagery, and code-as-image product visuals
- rule-driven video builds that need a brief, a timing plan, reusable templates, and render QA
- structured video pipelines that describe scenes as manifests or JSON timeline specs

## Install

```bash
npx -y skills add ./marketing/skills/video-generation
mkdir -p ~/.codex/skills
cp -R marketing/skills/video-generation ~/.codex/skills/
```

Codex `$skill-installer` path:

```text
https://github.com/alvarovillalbaa/plugins/tree/main/marketing/skills/video-generation
```

## What is bundled

- `examples/`
- `references/`
- `templates/`

## Operating model

Start with the brief and visual direction, choose the right architecture, get strategy approval, then plan scenes and frame budgets, and only then implement Remotion code.

- `references/overview.md` defines the production workflow.
- `references/composition-patterns.md` chooses between scene, manifest, and JSON-render modes.
- `references/rendering.md` covers preview and render verification.
- `references/data-sources.md` lists the required inputs.
- `references/image-sourcing.md` defines how to reuse, host, generate, or code image assets.
- `templates/video-plan.md` is the pre-code planning scaffold.
- `templates/video-code.md` is the implementation scaffold.
- `references/checklist.md` is the final QA pass.

## What changed from the earlier version

- The skill now treats the plan as the primary artifact, not just a preparatory note.
- Large changes require plain-English strategy approval before code.
- Verification now includes a self-eval pass before presenting output.
- The workflow now asks the user to persist the approved plan in a durable artifact for future revisions.
- Visual direction now has an explicit source-of-truth order instead of silent generic defaults.
- Hero-frame-first layout is now part of the core contract, not just an implementation suggestion.
- The checklists and templates now call out risky frames, review gates, and visual fallback assumptions more directly.
