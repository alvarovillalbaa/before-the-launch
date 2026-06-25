## Overview

Use this skill to build or revise Remotion-based marketing videos in a consistent order:

1. Define the deliverable: launch video, feature walkthrough, social cut, explainer, promo, ad variant, or internal demo.
2. Lock visual direction early: palette, typography, UI treatment, and motion tone.
3. Lock composition metadata early: duration, fps, width, height, and aspect ratio.
4. Ask the targeted questions that the brief or codebase cannot answer yet.
5. Choose the operating mode: scene-first composition, manifest-driven walkthrough, or JSON timeline renderer.
6. Plan the scene list and frame budget before writing animation code.
7. Get strategy approval before major implementation.
8. Identify which assets are available versus which need placeholders or assumptions.
9. Choose the image source plan: reuse hosted URLs, promote local assets into `public/`, code the product surface, generate missing support imagery, or combine sources.
10. Lock the visual system and scene variety rules before code so the composition does not drift into one repeated layout.
11. Read only the rule files needed for the current implementation.
12. Keep captions, sequencing, and audio timing tied to frames instead of ad hoc delays.
13. Run Studio, still, or short render checks before treating the output as done.
14. Persist the approved plan in a durable artifact for the next revision.

This skill is strongest when the request involves React/Remotion code, not generic video editing advice.

## Default operating model

- Brief first: objective, audience, CTA, runtime, format.
- Style second: brand or visual assumptions must be explicit.
- Visual discipline includes anti-slop constraints and scene variety, not just palette selection.
- Architecture third: decide whether code should be driven by scenes, a manifest, or a JSON timeline spec.
- Approval fourth: state the strategy in plain English and wait for confirmation before large changes.
- Layout fifth: compose the hero frame of each scene before adding motion.
- Animation sixth: derive motion from stable frame ranges and reusable timing constants.
- QA seventh: verify readability, trims, transitions, sync, and media duration assumptions.
- Persistence last: keep the approved brief or timing model in a durable artifact.

## Visual identity gate

Resolve the visual system before building scenes:

1. Existing brand inputs:
   Prefer the user's real colors, fonts, screenshots, logo usage, and product UI.
2. Existing project styling:
   Match any repo-local tokens, style guides, or reusable visual patterns.
3. User direction:
   Translate named references or adjectives into a concrete palette, type system, and motion language.
4. Missing visual direction:
   Ask the minimum three questions before major implementation:
   mood,
   light, dark, or mixed canvas,
   and any brand colors, fonts, or references.

Do not silently fall back to generic blue palettes, default fonts, or placeholder motion.

## Scene Variety Gate

Before implementation, confirm how the runtime will vary spatially:

1. Which scenes are centered versus off-axis.
2. Which scenes are full-bleed versus framed.
3. Which scenes are UI-first versus typography-first.
4. Which scenes intentionally slow down or simplify after dense moments.

If every scene uses the same composition pattern, redesign the plan before coding.

## Layout before animation

Use this order inside each scene:

1. Choose the hero frame:
   the moment where the scene is most populated and must still read cleanly.
2. Compose the static layout first:
   use normal React layout and CSS so spacing is correct before motion starts.
3. Animate from that layout:
   use timing helpers and transitions to move from or toward the stable frame.
4. Verify the layout directly:
   check it in Studio or with a still render before trusting the final animation pass.

This catches overlap, clipping, and caption-safe failures before they become timeline bugs.

## Validation gates

Use these gates before moving to the next phase:

1. Spec gate:
   Audience, goal, CTA, duration, fps, dimensions, and aspect ratio are explicit.
2. Narrative gate:
   Every scene has a job, a frame range, and a reason to exist.
3. Asset gate:
   Logos, screenshots, video, audio, fonts, captions, generated imagery, and code-as-image scenes are either available or called out as placeholders.
4. Approval gate:
   The strategy is explicit enough for the user to approve or redirect before code starts.
5. Timing gate:
   Scene durations, transitions, narration, and captions all map to explicit frames.
6. Render gate:
   The composition can be previewed confidently, and any render command or one-frame sanity check is known.
7. Self-eval gate:
   Risky frames, dense caption moments, and scene boundaries have an inspection plan before handoff.

## Review surfaces

Inspect the work as a video, not just as code:

- opening 1-2 seconds
- closing 1-2 seconds
- every major scene boundary
- every dense hero frame
- any caption-heavy or overlay-heavy moment

If this review did not happen, say so explicitly in the handoff.

## Common architectures

- Scene-first:
  Best for launch trailers, explainer ads, and custom branded compositions.
- Manifest-driven:
  Best for feature walkthroughs and screen-by-screen demos where each segment can be represented as data.
- JSON-render:
  Best when the project uses `@json-render/remotion`, where the timeline spec is the source of truth and React components back individual clip types.
