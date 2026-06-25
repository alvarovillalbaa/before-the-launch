# Image Strategy

Plan image usage before slide implementation.

## Supported Image Sources

1. AI-generated images created during deck work.
2. External image URLs already present in repository code/content.
3. Local image files inside the repository.
4. Code-as-image product visuals authored directly in HTML/CSS/JS or React.
5. Composite scenes that combine multiple source types.

All five are valid. The choice depends on the content:

1. Product UI, dashboards, terminal flows, and feature callouts should default to code-as-image.
2. Already-hosted repo images are usually the fastest path for real screenshots, brand assets, and photography.
3. Local repo images are acceptable, but when the deck needs portability or cloud delivery, prefer uploading or mirroring them to the active asset host and then use the resulting URL.
4. AI generation is best for missing backgrounds, atmospherics, supporting illustrations, and other gaps the repo does not already cover.
5. Mixed compositions are encouraged when they improve clarity.

## Asset Discovery Workflow

1. Run `scripts/index_image_sources.py` at repo root.
2. Review existing external URLs for quality, licensing, reliability, and visual fit.
3. Review local assets and decide whether they can stay local or should be promoted to a stable hosted URL.
4. Fill gaps with AI-generated assets.
5. Build product-focused hero visuals with code-as-image when screenshots are unavailable, low quality, or too limiting.

## Code-as-Image Patterns

Prefer code-as-image for product narratives:

- Dashboard mockups
- User journeys
- Data visualizations
- Feature callouts

Compose layered visuals when useful:

1. Generated/photographic background layer.
2. Code-rendered product foreground layer.
3. Annotation overlays for narrative emphasis.

Do not ask an image model to invent detailed UI when the product itself can be prototyped more faithfully in code.

## Quality Requirements

- Maintain aspect ratio consistency across slides.
- Avoid blurry or stretched assets.
- Keep text legible on top of image backgrounds.
- Record source origin in implementation notes when possible.
- Keep product visuals visually plausible relative to the actual product language.

## Performance Requirements

- Prefer modern formats (`webp`, `avif`) when supported.
- Lazy-load non-visible slide media if deck implementation permits it.
- Do not block initial render on large media fetches.
