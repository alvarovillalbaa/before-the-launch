---
name: code-slides
description: Create and evolve code-based slide decks and presentations (pitch decks, demos, product walkthroughs, technical talks) with HTML/CSS/JS or React/TypeScript, and generate AI-image slide packs from markdown or JSON content specs. Use when a user asks for slides implemented in code, a single-file HTML presentation, responsive behavior across mobile/tablet/desktop, PowerPoint/PPTX-to-web conversion, remote-control navigation, configurable right-side or bottom navigation, iframe-based deck rendering, visual style exploration, AI-generated full-slide images, Google-Slides-ready slide image exports, or image workflows that combine generated assets, external URLs, local repo images, and code-as-image product mockups. Trigger this skill for new deck creation, redesigns, refactors, framework migrations, image-deck generation, PPT conversions, and slide-quality QA.
---

# Code Slides

Build production-ready, code-first slide decks with deterministic structure, distinctive visual direction, and fast iteration. When the job is better served by fully AI-generated slide images, generate a consistent image deck from a structured content spec instead of forcing HTML or React.

Think in magazine-quality slides, not generic app screens repeated 12 times.

## Workflow

1. Detect the job type: new code deck, existing deck enhancement, AI-image deck generation, or PPT/PPTX conversion.
2. Confirm audience, delivery context, slide count, output artifact, and whether the user wants direct preset selection or visual style previews.
3. Read `references/mode-selection.md` before choosing implementation mode.
4. Lock a visual direction before building slides. Read `references/style-presets.md` whenever the aesthetic is not already defined.
5. If the job is an AI-image deck, use `references/image-deck-generator.md` and `references/image-deck-styles.md`, then run `scripts/generate_image_deck.py`.
6. If the job is a code deck, apply viewport-fit rules from `references/viewport-fit.md` before writing slides.
7. Scaffold a starting point with `scripts/scaffold_deck.py`, template assets, and `templates/` prompts when useful.
8. Build code slides using the image strategy workflow in `references/image-strategy.md`.
9. Vary slide composition deliberately so consecutive slides do not repeat the same layout logic.
10. Implement remote control + navigation placement rules from `references/remote-control.md` when the deck needs multi-device control.
11. For PowerPoint imports, follow `references/ppt-conversion.md`.
12. Run `scripts/validate_deck.py` for the selected mode and fix every failed check.

## Presentation Modes

Handle each request as one of these modes:

1. New code presentation: create the outline or full deck from a topic, brief, or finished content.
2. Existing presentation enhancement: read the current deck, preserve what works, and improve structure, visuals, and responsiveness.
3. AI-image presentation: generate a static slide pack where each slide is rendered as a style-consistent image from a markdown or JSON content spec.
4. PPT/PPTX conversion: extract slide content and assets, confirm the extracted structure, then rebuild the deck in HTML or React.

## Implementation Mode Rules

Apply these rules in order:

1. Choose `ai-image` mode when the user explicitly wants every slide rendered as an AI-generated image, wants a fast concept deck from a markdown/JSON content spec, or needs Google-Slides-ready slide images rather than authored browser slides.
2. Otherwise, use plain HTML by default.
3. Prefer a single self-contained HTML file with inline CSS/JS when the user wants a portable presentation, a zero-dependency deck, or a quick browser-openable artifact.
4. Render deck slides in iframes by default for multi-file plain HTML decks.
5. Switch to React/TypeScript only when the user explicitly requests React, TypeScript, or a component library implementation.
6. If the user already uses shadcn-ui/Radix/Headless but gives no explicit format request, still default to plain HTML.
7. If the user explicitly requests component libraries, implement controls/components with the requested library, not raw HTML controls.

Load details from `references/mode-selection.md` when selecting the mode.

## Style Discovery Rules

When the user does not have a clear aesthetic direction:

1. Offer preset-led exploration instead of abstract design questions.
2. For code decks, let the user pick a named preset from `references/style-presets.md` or generate three lightweight preview files that show distinct directions.
3. For AI-image decks, pick a style from `references/image-deck-styles.md` or map a custom visual direction onto one of those prompt baselines.
4. Keep previews intentionally different in typography, color, and motion.
5. Avoid generic "AI slop" patterns such as purple-on-white defaults, system-font stacks, and interchangeable hero layouts.
6. Preserve the established product or brand language when the repository already has one.

## Anti-Slop Rules

Do not ship a deck with any of these defaults unless the user explicitly asked for them:

1. Inter, Roboto, Arial, Helvetica, or system-ui as the only primary type choice.
2. Violet or indigo accents by reflex.
3. Gradient text headings.
4. Generic dark background plus glowing cards plus blue accent.
5. Repeating the same centered hero layout across multiple consecutive slides.
6. Motion that exists only to add "energy" without clarifying hierarchy or state.

Run a simple swap test before handoff: if the deck would look interchangeable with a default SaaS landing page after changing the logo, redesign it.

## Composition Variety

Consecutive slides should vary their spatial approach.

Rotate between patterns such as:

1. centered statement slide
2. left-heavy editorial slide
3. right-heavy product or image slide
4. split comparison slide
5. full-bleed background or diagram slide
6. grid or table-driven data slide

Three centered slides in a row is a failure unless the user explicitly wants a rigid template.

## Remote Navigation Requirements

Always ship navigation that supports local controls. Add the remote controller page whenever the delivery context requires multi-device presenting, speaker controls, or mirrored navigation across screens.

Required controls:

1. Local controls (keyboard + on-screen buttons).
2. Configurable navigation bar placement: `right` or `bottom`.

If remote control is included, also ship:

1. Remote controller page (phone/tablet friendly).
2. Clear presenter/screen role separation.

Implement remote transport with the following priority:

1. Existing project realtime channel (WebSocket/Supabase/Pusher/etc.) for cross-device control.
2. BroadcastChannel fallback for same-browser testing.

Load full protocol and validation requirements from `references/remote-control.md`.

## Image Strategy Requirements

Support all image pathways in every deck workflow. Choose deliberately instead of defaulting to one source type:

1. AI-generated images created during the task.
2. Existing external image URLs found in the repository.
3. Existing local images stored in the repository.
4. Code-as-image product visuals for product-first slides.
5. Mixed compositions such as a generated background plus a code-as-image foreground dashboard.

Use `scripts/index_image_sources.py` to inventory existing image assets.
Use the decision criteria in `references/image-strategy.md`.

For product-focused visuals, prefer code-as-image over asking an image model to invent a dashboard, UI, or terminal scene.
For local repository images, prefer promoting them to the project's stable asset host or public URL when portability matters instead of leaving them as ad hoc relative file references.
For AI-image decks, normalize content into slide prompts first, then render images with `scripts/generate_image_deck.py`. The generator accepts markdown sections separated by `---` or a JSON slides array.

## Responsiveness Requirements

Design for mobile, tablet, and desktop.

1. Use fluid typography and spacing (`clamp`, relative units).
2. Make every slide fit within the viewport without internal scrolling; split content across slides instead of cramming.
3. Avoid fixed-height slide shells without overflow handling.
4. Keep controls reachable by touch on small screens.
5. Validate at common viewport widths and heights using `references/viewport-fit.md`.

## Bundled Resources

### agents/

- `agents/openai.yaml`: UI metadata for skill browsers and default prompts.

### scripts/

- `scaffold_deck.py`: Create HTML or React/TS starter deck files.
- `generate_image_deck.py`: Normalize slide content specs and optionally render AI-generated slide images.
- `index_image_sources.py`: Discover local images and external image URLs.
- `validate_deck.py`: Validate required deck capabilities.
- `install_local.sh`: Optional helper for copying this skill into a local skill registry after clone.

### references/

- `mode-selection.md`: Deterministic mode decision tree.
- `image-deck-generator.md`: AI-image deck workflow, content spec rules, and output artifacts.
- `image-deck-styles.md`: Prompt-oriented style presets for AI-image decks.
- `remote-control.md`: Remote protocol, UI rules, and acceptance checks.
- `image-strategy.md`: Multi-source image workflow and composition patterns.
- `viewport-fit.md`: Required slide sizing, density limits, and responsive validation targets.
- `style-presets.md`: Distinct visual directions for pitch decks, talks, and demos.
- `ppt-conversion.md`: PowerPoint extraction and reconstruction workflow.
- `distribution.md`: `npx skills add`, `git clone`, and manual install guidance.

### templates/

- `templates/html/`: Default iframe-based HTML deck template with remote control page.
- `templates/react-ts/`: React/TypeScript deck template with library-ready control surface.
- `slides-deck-plan.md`: Lightweight planning prompt for outline and story flow.
- `slides-deck-code.md`: Lightweight implementation prompt for deck generation.
- `slides-image-deck-content.md`: Lightweight markdown template for AI-image slide specs.

### examples/

- `examples/image-deck/sample-slides.md`: Markdown example with `---` slide separators.
- `examples/image-deck/sample-slides.json`: JSON example for deterministic generation.

## Command Reference

```bash
# Scaffold default HTML deck
python3 scripts/scaffold_deck.py \
  --mode html \
  --output ./slides \
  --title "Quarterly Product Review" \
  --nav-position right

# Scaffold React/TS deck (when explicitly requested)
python3 scripts/scaffold_deck.py \
  --mode react-ts \
  --output ./slides-app \
  --title "Quarterly Product Review" \
  --nav-position bottom \
  --component-lib shadcn

# Generate AI-image slide prompts only
python3 scripts/generate_image_deck.py \
  --content ./examples/image-deck/sample-slides.md \
  --style whiteboard \
  --title "Quarterly Product Review" \
  --output-dir ./generated-slides \
  --dry-run

# Generate AI-image slides when GEMINI_API_KEY is set
python3 scripts/generate_image_deck.py \
  --content ./examples/image-deck/sample-slides.json \
  --style corporate \
  --title "Quarterly Product Review" \
  --output-dir ./generated-slides \
  --aspect 16:9

# Discover reusable images in repository
python3 scripts/index_image_sources.py \
  --repo-root . \
  --output ./slides/image-index.json

# Validate finished deck
python3 scripts/validate_deck.py \
  --project-root ./slides \
  --mode html

# Validate generated AI-image slide assets
python3 scripts/validate_deck.py \
  --project-root ./generated-slides \
  --mode ai-image
```

## Done Criteria

Mark a deck complete only when all checks pass:

1. Mode selection matches `references/mode-selection.md`.
2. Visual direction is either user-selected or explicitly justified.
3. For code decks, every slide fits the viewport without internal scrolling.
4. For code decks with navigation, the navigation bar supports `right` and `bottom` placement.
5. Remote control flow works when remote mode is included.
6. Image usage includes an explicit source strategy.
7. AI-image decks ship `normalized-content.json`, `prompt-plan.md`, and `summary.json`.
8. Deck output matches the requested artifact: browser deck for `html`/`react-ts`, slide image pack for `ai-image`.
9. `scripts/validate_deck.py` returns success when applicable.
10. Slide compositions vary enough that the deck does not read like one template duplicated N times.
