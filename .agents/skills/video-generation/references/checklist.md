# Video Checklist

Use this before handing off a Remotion implementation.

## Planning

- Confirm target format, duration, fps, and aspect ratio.
- Confirm the chosen operating mode: scenes, manifest, or JSON timeline.
- Confirm audience, message hierarchy, and call to action.
- Confirm the plain-English strategy was approved before large implementation work.
- Confirm the visual source of truth: brand inputs, project styling, or user direction.
- If visual direction is missing, confirm the plan captures the fallback questions and assumptions:
  mood,
  light, dark, or mixed canvas,
  and any brand colors, fonts, or references.
- Confirm the plan records explicit anti-slop constraints and scene-variety intent.
- Confirm all required assets exist or are clearly stubbed.
- Confirm each scene has an explicit frame range and purpose.
- Confirm the source of truth for sequencing: frame constants, manifest durations, or timeline clips.
- Confirm there is a durable artifact for the approved plan: markdown brief, manifest, or JSON timeline spec.

## Implementation

- Ensure compositions and sequences are frame-accurate.
- Keep animation timing derived from constants or metadata, not magic numbers scattered across files.
- Make captions and audio sync to explicit frame ranges.
- Build scene layout in its readable hero frame before layering animation on top.
- Avoid layout assumptions that break at the chosen width and height.
- Keep font loading and asset imports compatible with Remotion rendering.
- Ensure overlays, panels, and edge-aligned UI do not hide captions or subtitle-safe areas.
- Ensure consecutive scenes do not all use the same composition pattern unless the brief explicitly requires it.
- If using a manifest, ensure IDs, asset paths, durations, and ordering match the composition logic.
- If using `@json-render/remotion`, ensure composition metadata, clip timing, and catalog definitions stay in sync.

## QA

- Inspect the opening frames, ending frames, and every risky scene boundary.
- Inspect at least one hero frame per dense scene.
- Check for clipping, overflow, or text that becomes unreadable during animation.
- Check trims, transitions, and sequence offsets for gaps or overlaps.
- Check media duration assumptions against actual video or audio metadata.
- Check that brand colors, typography, and motion feel consistent across scenes.
- Check that the visual system avoids generic defaults such as Inter-only typography, indigo accents, gradient-text headings, and decorative glow effects.
- Check that the rendered or previewed output matches the approved strategy, not just the code intent.
- Check the final structure against the requested brief before closing.
- Run `npx remotion studio` or the project's preview path when practical.
- Use a single-frame or short render sanity check when layout, timing, or asset decode risk is high.

## Handoff

- Include the final composition metadata and total frame count.
- Include the visual source of truth or the fallback assumptions that were used.
- Include the assumptions that still affect output quality.
- Include the rules, references, and render commands used for validation.
- Include where the current approved plan or scene spec now lives.
