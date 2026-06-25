---
name: code-as-images
description: >-
  Create polished image assets by authoring the visual itself in code. Use for
  product-focused images, dashboards, UI mockups, terminal cards, diagrams,
  browser frames, technical explainers, and mixed compositions where coded
  product visuals combine with generated or photographic backgrounds.
---

# Code As Images

Use this skill when the image should be designed as a code artifact instead of treated like a screenshot or handed entirely to an image model.

## When To Use

Use this skill for:

1. Product-focused hero images where the UI should look intentional and controllable.
2. Dashboard, app, terminal, IDE, chart, or browser-frame visuals.
3. Social cards, docs visuals, or landing-page illustrations built from HTML/CSS/JS or React.
4. Before-and-after UI comparisons, feature callouts, and flow diagrams that need sharp layout fidelity.
5. Mixed compositions such as a generated background plus a coded product foreground.

Do not use this skill for photography-first assets, natural scenes, or illustrations that are not improved by code-driven layout control.

## Core Rule

For product visuals, prefer code-as-image over asking an image model to invent the product.

Generated imagery is still useful, but mainly for:

1. Background atmosphere
2. Environmental context
3. Supporting illustration
4. Texture and composition layers around the coded product visual

## Image Source Model

All of these image pathways are valid. Choose the right one instead of defaulting blindly:

1. Existing external image URLs already referenced in the repo.
2. Existing local images inside the repo.
3. Code-as-image visuals authored during the task.
4. AI-generated images created on the fly during the task.
5. Mixed compositions that combine two or more of the above.

Use this decision order:

1. If the asset is fundamentally a product screen, dashboard, terminal, or UI walkthrough, use code-as-image first.
2. If the exact asset already exists as a stable external URL in the repo, reuse it.
3. If the asset only exists locally in the repo, use it when convenient, but prefer promoting it to the project's hosted asset layer or public URL when portability matters.
4. If the repo does not contain the needed asset, generate the missing supporting imagery on the fly.
5. If the clearest result comes from layering, combine a generated or photographic background with a coded foreground.

## Workflow

1. Identify whether the image is product-first, content-first, or atmosphere-first.
2. Inventory available assets: existing external URLs, local repo images, screenshots, product UI references, and design tokens.
3. Decide whether the foreground should be coded, reused, generated, or composited.
4. Lock the frame before styling details:
   canvas size, aspect ratio, focal area, typography scale, and safe margins.
5. Build the product or technical visual in code with realistic but simplified states.
6. Add any background, overlay, annotation, or framing layer after the main coded visual reads clearly.
7. Check the image at export size for edge artifacts, clipped shadows, blurry text, and fake-looking UI density.

## Recommended Output Types

Prefer code artifacts that can be iterated quickly:

1. Self-contained HTML/CSS/JS visual
2. React component that renders the image scene
3. SVG or HTML hybrid graphic
4. Browser/device frame composition
5. Terminal or code-card composition

## Quality Bar

Every code-as-image output should:

1. Read clearly at the intended export size.
2. Use believable product structure instead of random boxes and charts.
3. Match the repo or brand language when one exists.
4. Avoid generic placeholder UI that could belong to any startup.
5. Keep text short enough that the image still works as an image.

## Reusable Resources

### references/

- `references/image-source-strategy.md`: when to reuse, host, generate, or code an image.
- `references/composition-patterns.md`: practical code-as-image patterns for product visuals and mixed compositions.

### templates/

- `templates/image-brief.md`: capture the frame, content, and source plan before implementation.

### examples/

- `examples/product-dashboard-brief.md`: example brief for a product-focused marketing image.

## Related Skills

- Use `code-slides` when these visuals belong inside a presentation system.
- Use `html-visualization` when the output is a broader HTML explainer page rather than a single key image.
- Use `video-generation` when the coded visual should become part of a Remotion composition or animation system.
