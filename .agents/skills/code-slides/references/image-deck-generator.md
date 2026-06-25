# AI Image Deck Generator

Use this flow when the right output is a pack of slide images rather than a browser-authored deck.

## Choose This Mode When

1. The user explicitly wants each slide rendered as an image.
2. The user already has a markdown or JSON slide spec and wants rapid visual generation.
3. The user wants static slide assets that can be dropped into Google Slides or another slide tool later.

## Accepted Inputs

`scripts/generate_image_deck.py` accepts:

1. Markdown files split by `---`.
2. JSON arrays of slides.
3. JSON objects with a top-level `slides` array.

Each slide should contain either:

1. A prewritten `prompt`, or
2. Enough structured fields to synthesize one: `title`, `body`, `visual_cues`, `notes`, or `layout`.

## Markdown Conventions

Use one section per slide:

```md
# Slide title

- Key point one
- Key point two

Visual cues: Dashboard overlaid on a hand-drawn funnel diagram.
---
# Next slide
```

The first heading becomes the slide title. Bullets and plain paragraphs become the body. A line beginning with `Visual cues:` is treated as the visual direction.

## Output Artifacts

The generator writes:

1. `normalized-content.json`: structured slides after markdown/JSON normalization.
2. `prompt-plan.md`: the exact prompts used for each slide.
3. `summary.json`: machine-readable run summary, output mode, and image paths.
4. `*.png` files when image rendering is enabled.

## Rendering Modes

1. `--dry-run`: normalize content and emit prompt artifacts only.
2. Default render mode: call Imagen through the Gemini API when `GEMINI_API_KEY` is set.

Use `--dry-run` first when refining prompts or validating content structure.

## Slide Selection

Use `--slides 3,7` to regenerate only specific slide indexes after reviewing earlier output.

## Validation

Run:

```bash
python3 scripts/validate_deck.py --project-root ./generated-slides --mode ai-image
```

The validator checks required artifacts and ensures image runs report generated images when not in dry-run mode.
