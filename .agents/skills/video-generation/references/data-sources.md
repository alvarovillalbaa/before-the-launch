# Required Inputs

Gather these inputs before generating or editing Remotion video code:

- Objective: what the video needs to achieve.
- Audience: who the video is for and what they should do after watching.
- Format: landscape, square, vertical, or a specific pixel size.
- Runtime target: total duration, or at least a scene count and pacing expectation.
- Script or copy: narration, captions, headline text, CTA, disclaimers.
- Assets:
  logos, product shots, screenshots, videos, audio, charts, brand colors, fonts,
  existing external image URLs from the repo, local repo images, generated imagery needs,
  and any product surfaces that should be treated as code-as-image instead of screenshots.
- Visual direction: brand guidelines, references, motion tone, or explicit assumptions.
- Technical constraints: deliverable codec, safe zones, subtitle requirements, or platform-specific limits.
- Delivery context: ad, social post, landing page embed, product demo, internal presentation.
- Operating mode: scene-first, manifest-driven walkthrough, or JSON timeline renderer.

## Structured inputs to request when useful

- `video_spec`:
  audience, goal, duration, aspect ratio, tone, voice or caption language.
- Scene manifest:
  scene id, title, purpose, asset path, duration, transition, captions or narration, and any callouts.
- Screen manifest:
  screen title, description, image path or URL, width, height, duration, overlay copy,
  and whether the screen is a static asset, hosted URL, generated image, or code-as-image scene.
- JSON timeline spec:
  composition metadata, tracks, clips, and audio tracks when using `@json-render/remotion`.
- Component catalog decisions:
  which standard components are enough versus which custom components or overlays need implementation.
- Render plan:
  preview command, single-frame check if needed, and final render target.

If key inputs are missing, ask the minimum targeted questions needed before plan approval.

If visual direction is missing entirely, the default question set should be:

- What mood should the video have?
- Should the canvas feel light, dark, or mixed?
- Are there any brand colors, fonts, or reference videos to anchor the look?

Proceed with explicit assumptions only when the missing detail is low-risk or when the user has already accepted the fallback in the plan.

## Minimum assumptions to state explicitly

- chosen aspect ratio and resolution
- target duration and fps
- operating mode and source of truth for timing
- scene count or pacing model
- fallback brand palette and fonts if none are provided
- which assets are real versus placeholder
- whether captions, narration, or both are required
- whether verification will rely on Studio, a still render, or only code inspection
