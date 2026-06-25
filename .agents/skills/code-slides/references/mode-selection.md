# Mode Selection

Use this decision tree before writing deck code.

## Decision Tree

1. Ask whether the user explicitly wants each slide rendered as a static AI-generated image, already has a markdown/JSON content spec, or needs Google-Slides-ready slide images instead of a browser-authored deck.
2. If yes, choose `ai-image` mode.
3. Otherwise ask whether the user explicitly requested `React`, `TypeScript`, or a component library implementation.
4. If yes, choose `react-ts` mode.
5. If no, choose `html` mode.
6. If the repository already contains shadcn-ui/Radix/Headless but no explicit request exists, keep `html` mode.
7. If the user explicitly requests a component library, implement UI controls using that library.

## Output Contracts

### `ai-image` mode

- Accept markdown or JSON slide specs.
- Normalize slide content into deterministic prompts.
- Emit prompt artifacts even in dry-run mode.
- Render slide images only when the image API key is available.

### `html` mode (default)

- Build plain HTML/CSS/JS.
- Render slides inside iframes.
- Keep each slide modular (one file per slide when practical).
- Include remote controller page and configurable nav placement.

### `react-ts` mode (explicitly requested)

- Build React + TypeScript components.
- Use requested component libraries for UI controls.
- Preserve the same remote + nav-position capabilities as HTML mode.
- Keep deck state serializable (for controller sync).

## Library Mapping Guidance

- `shadcn`: Prefer project-local shadcn primitives (`Button`, `Card`, `Tabs`, `Dialog`).
- `radix`: Use Radix primitives/themes for controls and accessibility.
- `headless`: Use Headless UI components plus project styling layer.
- `none`: Use native semantic controls only when no library is requested.

## Resolution Rules for Ambiguity

1. If the user explicitly asks for slide images, pick `ai-image`.
2. If user intent is otherwise ambiguous, choose default `html` mode.
3. If user later requests framework migration, convert deck architecture incrementally slide-by-slide.
4. Never silently switch from HTML to React without an explicit user request.
