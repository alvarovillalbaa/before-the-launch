---
name: video-generation
description: Production workflow for Remotion video creation in React. Use when the user wants to create or edit Remotion-based video code, animations, captions, timing, sequencing, compositions, structured scene manifests, or JSON-render video pipelines. Ask targeted questions, confirm strategy before code, self-evaluate the output, and persist the approved plan. Core rules live in references/rules/ and reusable planning/code scaffolds live in templates/.
---

# Video Generation

Treat this skill as the entrypoint for Remotion work in this repo.

This skill is influenced by `browser-use/video-use` and `heygen-com/hyperframes`, but adapted for code-first Remotion builds in React instead of HTML-first compositions.

## When To Use

Use this skill for:

- branded product videos, launch videos, explainers, social cuts, and walkthroughs
- Remotion scene work that needs composition planning before code
- manifest-driven video pipelines where scenes or screens are described as data
- `@json-render/remotion` timelines that render from a JSON spec plus a component catalog
- revisions to existing Remotion projects where timing, captions, or asset handling must stay coherent

## Principles

1. The plan is the primary reasoning surface. Scene lists, manifests, and timeline specs are the durable artifacts; everything else should derive from them.
2. Layout before animation. Build the hero frame of a scene first, then animate from a stable layout.
3. Ask, confirm, implement, self-evaluate, persist. Do not jump from a vague brief straight into code.
4. Audio, captions, and timing are structural, not decorative. Treat them as part of the core composition model.
5. The examples in this skill are examples, not presets. Reuse the workflow and rules, not generic aesthetics.
6. Image sourcing is part of production design. Reuse real assets when they exist, prefer code-as-image for product visuals, and generate only the gaps.
7. Scene variety matters. Do not let the entire video collapse into the same centered card layout with minor copy changes.

## Hard Rules

These rules are about production correctness and reviewability, not taste:

1. Do not start large composition work until the user has approved a plain-English strategy.
2. Lock composition metadata early: `durationInFrames` or an equivalent duration plan, `fps`, `width`, `height`, and aspect ratio must be explicit before scene code branches.
3. Use one source of truth for timing. Do not scatter independent timing numbers across scene components, manifests, and helpers.
4. Build each scene's readable hero frame before animating it. If the static frame is unclear, animation will not fix it.
5. Captions and subtitle-safe layouts must be checked against the final layered scene state. Do not let overlays or edge-aligned UI hide them.
6. Brand choices must come from the project, the user, or an explicit fallback assumption. Never silently invent a generic visual system.
7. Verify the output before presenting it. Use Studio, still renders, or short renders to catch layout, timing, caption, and asset issues yourself first.
8. Persist the approved plan in a durable artifact near the implementation: a markdown brief, scene manifest, or JSON timeline spec. Do not force future revisions to reconstruct the intent from code alone.
9. Never invent product UI labels, feature names, or agent names. Screenshot the real product and mirror copy exactly. Invented UI is immediately visible to anyone who knows the product.
10. Default to burned-in captions for all social exports. 85% or more of social views are muted — captions are part of the composition model, not a post-production option.

## Anti-Slop Guardrails

Do not silently ship any of these defaults:

1. Inter, Roboto, Arial, Helvetica, or system-ui as the only type choice.
2. Indigo / violet accent defaults.
3. Gradient text headlines.
4. Generic dark-glass cards floating over a blurred background.
5. Continuous glowing or pulsing effects that do not communicate state.
6. Three or more consecutive scenes with the same centered composition pattern.
7. Invented timing numbers for text animations — use the named patterns in `references/rules/text-animations.md` with their exact pacing specs instead.

If the visual system would still look interchangeable after swapping the logo, it is under-designed.

## Production Workflow

Use this workflow unless the task is a trivial patch:

1. Frame the task with [references/overview.md](references/overview.md).
2. Gather required inputs with [references/data-sources.md](references/data-sources.md). Collect the brief, brand tokens, screen recordings, and optional voice calibration materials before writing any code.
3. Ask the minimum targeted questions needed to resolve format, duration, audience, CTA, assets, and visual direction.
4. Choose the implementation path with [references/composition-patterns.md](references/composition-patterns.md).
5. Choose the image source plan with [references/image-sourcing.md](references/image-sourcing.md).
6. Use [templates/video-plan.md](templates/video-plan.md) to lock the strategy, scenes, assets, timing, validation gates, and persistence artifact before code.
7. Write a storyboard table — beat, time range, visuals, and text overlay — for every scene before writing Remotion code. Include it in the plan artifact.
8. Wait for plan approval before starting major implementation.
9. Read only the relevant rule files from `references/rules/` and use [templates/video-code.md](templates/video-code.md) as the implementation scaffold.
10. Run preview, still, or render checks from [references/rendering.md](references/rendering.md). Test individual frames before full renders.
11. Self-evaluate the output before presenting it. Inspect the first 3 seconds, last 3 seconds, and every scene boundary.
12. For launch videos, run multi-agent review with [references/multi-agent-review.md](references/multi-agent-review.md) before handoff.
13. Cross-check the output against [references/checklist.md](references/checklist.md) before finishing.
14. Render platform variants when the output is intended for social distribution. See [references/platform-specs.md](references/platform-specs.md).

## Choose The Right Operating Mode

Do not jump straight into scene code before deciding which model fits the request.

1. Scene-first Remotion composition:
   Use for bespoke marketing videos, launch spots, explainers, and branded ads where layout and animation are custom.
2. Manifest-driven walkthrough:
   Use for product walkthroughs or screen-to-screen demos where each scene can be described as structured data with durations, titles, descriptions, and assets.
3. JSON timeline rendering:
   Use when the project already uses `@json-render/remotion` or when the user explicitly wants a timeline spec that acts as the source of truth. Keep the JSON spec, catalog definitions, and custom components aligned.

## Thinking Order

Before writing Remotion code, think through the work in this order:

1. What: what should the viewer understand, feel, or do by the end?
2. Structure: how many scenes or compositions are needed, and what each scene is responsible for.
3. Timing: which scenes set the pacing, where transitions happen, and how long each beat lasts in frames.
4. Layout: build the most visible frame of each scene first so spacing and readability are correct before animation.
5. Animate: add motion only after the layout, assets, and timing model are stable.

## Composition Variety

Consecutive scenes should vary the viewer's spatial experience.

Rotate between approaches such as:

1. centered statement scene
2. left-heavy editorial scene
3. right-heavy product or UI scene
4. split layout
5. full-bleed scene
6. grid or data-led scene

Do not repeat the same "headline centered over supporting cards" pattern throughout the runtime unless the brief explicitly demands a rigid template.

For minor edits, skip directly to the relevant rule files and preserve the existing timing model, but still state the change strategy before touching risky timing or layout code.

## Visual Identity Gate

Before writing any composition or scene code, make sure the visual system is explicit.

Check in this order:

1. Existing brand inputs: use the user's brand colors, fonts, logo rules, screenshots, or product UI as the source of truth.
2. Existing project styling: if the target repo already defines a design language, tokens, or reusable layout patterns, match them.
3. User direction: if the user names a style or reference, translate it into a concrete palette, type system, and motion language.
4. Missing visual direction: if nothing is defined, ask the minimum three questions before major implementation:
   mood,
   light, dark, or mixed canvas,
   and any brand colors, fonts, or references.
5. Only after that, state clear fallback assumptions in the plan before implementing.

Do not default to generic colors, default fonts, or placeholder motion without documenting the assumption.

## Image Asset Strategy

Use all of these image paths when appropriate:

1. Images generated on the fly during the task
2. Existing external image URLs already referenced in the repo
3. Existing local repo images
4. Code-as-image product visuals
5. Mixed compositions that combine multiple sources

Apply this decision logic:

1. If the visual is a product dashboard, UI state, terminal flow, or other interface-heavy surface, prefer code-as-image or a live Remotion composition over prompting an image model to invent the UI.
2. If the needed asset already exists as a stable external URL, reuse it.
3. If the needed asset only exists locally, copy or promote it into the active `public/` asset pipeline or hosted URL before treating it as a production dependency.
4. Generate missing backgrounds, mood frames, or supporting illustrations on the fly only when the repo does not already provide what is needed.
5. Combine generated backgrounds with coded product foregrounds when the video needs both visual richness and product fidelity.

## Data Before Code

When the video can be expressed as data, keep the data model explicit before writing the composition:

- For scene-first work, define the scene plan and frame ranges.
- For walkthroughs, define a screen or scene manifest with titles, assets, durations, and callouts.
- For `@json-render/remotion`, define the composition metadata, tracks, clips, and audio model first, then map them to standard or custom components.

Prefer a stable source-of-truth object over hard-coded timings distributed across multiple files.

## Layout Before Animation

Each scene should be correct at its hero frame before you animate it.

1. Identify the frame where the scene is most populated and most readable.
2. Build that frame with static layout first using normal React layout primitives and CSS.
3. Use animation to move from or toward that layout, rather than using animation to guess where elements should land.
4. Keep transitions and sequence boundaries explicit in frames so overlap and dead air are easy to reason about.
5. Verify the hero frame with Studio, a still render, or an equivalent preview before trusting the motion layer.

This avoids hidden layout bugs where text, captions, or charts only collide once the video renders.

## Quality Checks

Before handoff, inspect the work as a video, not just as code.

- Check the opening, closing, and every major scene boundary.
- Check the hero frame of every dense scene for clipping, crowding, and subtitle-safe coverage.
- Check that transitions, trims, and caption timing match the intended pacing.
- Check that the final visual system still matches the approved brand or fallback assumptions.
- If visual verification was skipped, say so explicitly instead of implying the output was reviewed.

## Review Loop

Use this loop for substantial video work:

1. Inventory:
   Read the brief, inspect existing compositions or manifests, and identify the real source material and constraints.
2. Converse:
   Ask only the questions the material does not answer: runtime, platform, aspect ratio, CTA, brand direction, narration, captions, missing assets, or revision target.
3. Propose strategy:
   Describe the scene structure, timing model, transition style, caption approach, and validation plan in plain English. Wait for confirmation.
4. Storyboard:
   Write a shot-list table with beat, time range, visuals, and text overlay before touching Remotion code.
5. Implement:
   Build the plan using the smallest architecture that fits: scene-first, manifest-driven, or JSON timeline.
6. Self-evaluate:
   Preview or render the output yourself and inspect the risky frames: opening, closing, scene boundaries, dense caption moments, and any layout-heavy animation. Verify the first 3 seconds specifically — hook must land before the viewer can swipe.
7. Multi-agent review:
   For launch videos, deploy four parallel critics — design/layout, text/readability, narrative/pacing, and brand alignment — before final handoff. See [references/multi-agent-review.md](references/multi-agent-review.md).
8. Persist:
   Keep the approved plan in a durable artifact so the next revision starts from intent instead of reverse-engineering the code.

## Output Contract

When using this skill, the output should usually include:

- a brief scene plan before large implementations
- a storyboard table (beat, time, visuals, text overlay) before Remotion code
- a plain-English strategy summary before code when the change is non-trivial
- explicit composition metadata and frame counts
- the chosen operating mode
- the visual source of truth that was used
- a short list of the rule files used
- preview or render commands when verification matters
- a short self-eval summary when visual verification was part of the task
- the artifact where the approved plan now lives
- clear assumptions for any missing assets, brand direction, or timing inputs
- whether scene composition variety was intentionally maintained or intentionally standardized
- platform render variants and social copy when the video targets social distribution

## Rule Index

Read individual rule files for detailed explanations and code examples:

- [references/rules/3d.md](references/rules/3d.md) - 3D content in Remotion using Three.js and React Three Fiber
- [references/rules/animations.md](references/rules/animations.md) - Fundamental animation patterns
- [references/rules/assets.md](references/rules/assets.md) - Images, videos, audio, and fonts
- [references/rules/audio.md](references/rules/audio.md) - Audio import, trim, volume, speed, and pitch
- [references/rules/calculate-metadata.md](references/rules/calculate-metadata.md) - Dynamic duration, dimensions, and props
- [references/rules/can-decode.md](references/rules/can-decode.md) - Browser decode checks with Mediabunny
- [references/rules/charts.md](references/rules/charts.md) - Data visualization patterns
- [references/rules/compositions.md](references/rules/compositions.md) - Compositions, folders, stills, and default props
- [references/rules/display-captions.md](references/rules/display-captions.md) - Caption display and word highlighting
- [references/rules/extract-frames.md](references/rules/extract-frames.md) - Frame extraction utilities
- [references/rules/fonts.md](references/rules/fonts.md) - Font loading patterns
- [references/rules/get-audio-duration.md](references/rules/get-audio-duration.md) - Audio duration lookup
- [references/rules/get-video-dimensions.md](references/rules/get-video-dimensions.md) - Video dimensions lookup
- [references/rules/get-video-duration.md](references/rules/get-video-duration.md) - Video duration lookup
- [references/rules/gifs.md](references/rules/gifs.md) - GIF playback patterns
- [references/rules/images.md](references/rules/images.md) - Image embedding patterns
- [references/rules/import-srt-captions.md](references/rules/import-srt-captions.md) - `.srt` caption import
- [references/rules/lottie.md](references/rules/lottie.md) - Lottie integration
- [references/rules/light-leaks.md](references/rules/light-leaks.md) - Light leak overlay effects
- [references/rules/maps.md](references/rules/maps.md) - Mapbox-based map and route animations
- [references/rules/measuring-dom-nodes.md](references/rules/measuring-dom-nodes.md) - DOM measurement patterns
- [references/rules/measuring-text.md](references/rules/measuring-text.md) - Text measurement and overflow checks
- [references/rules/parameters.md](references/rules/parameters.md) - Parametrize compositions with Zod schemas
- [references/rules/sequencing.md](references/rules/sequencing.md) - Sequence timing and offsets
- [references/rules/silence-detection.md](references/rules/silence-detection.md) - Adaptive silence detection for audio and video
- [references/rules/subtitles.md](references/rules/subtitles.md) - Router for caption and subtitle workflows
- [references/rules/tailwind.md](references/rules/tailwind.md) - Tailwind usage in Remotion
- [references/rules/text-animations.md](references/rules/text-animations.md) - 20-pattern named text animation catalog with exact pacing, easing curves, stagger specs, and Remotion translation rules. Always read this before writing any text reveal, headline animation, or word-level transition.
- [references/rules/timing.md](references/rules/timing.md) - Interpolation, easing, and spring timing
- [references/rules/transcribe-captions.md](references/rules/transcribe-captions.md) - Caption transcription
- [references/rules/transparent-videos.md](references/rules/transparent-videos.md) - Transparent video export settings
- [references/rules/transitions.md](references/rules/transitions.md) - Scene transition patterns
- [references/rules/trimming.md](references/rules/trimming.md) - Trim and cut patterns
- [references/rules/videos.md](references/rules/videos.md) - Video embedding, looping, trimming, and playback controls
- [references/rules/voiceover.md](references/rules/voiceover.md) - Scene voiceover generation and duration-driven timing
- [references/rules/ffmpeg.md](references/rules/ffmpeg.md) - FFmpeg and FFprobe usage from Remotion projects
- [references/multi-agent-review.md](references/multi-agent-review.md) - 4-critic parallel review pattern for launch videos
- [references/platform-specs.md](references/platform-specs.md) - Platform aspect ratios, duration limits, render defaults, and GIF export

## Local Extras

- Use `templates/` for reusable planning and implementation scaffolds.
- Use [references/composition-patterns.md](references/composition-patterns.md) to choose between scene-first, manifest-driven, and JSON-render architectures.
- Use [references/image-sourcing.md](references/image-sourcing.md) for when to reuse, host, generate, or code imagery.
- Use [references/rendering.md](references/rendering.md) for project setup, Studio preview, single-frame checks, and final render commands.
- Use [references/multi-agent-review.md](references/multi-agent-review.md) for the 4-critic parallel review pattern on launch videos.
- Use [references/platform-specs.md](references/platform-specs.md) for platform-specific aspect ratios, resolutions, and duration limits.
- Use `examples/` for marketing-oriented prompts and deliverables.
- Keep the rule files authoritative when there is a conflict between a template and a rule.
