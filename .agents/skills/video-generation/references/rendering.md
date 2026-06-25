# Rendering And Verification

Use this file when you need setup, preview, or render commands for a Remotion project.

## New project setup

If the workspace does not already contain a Remotion project, scaffold one with:

```bash
npx create-video@latest --yes --blank --no-tailwind my-video
```

Replace `my-video` with the target project name.

## Preview

Start Remotion Studio when visual verification matters:

```bash
npx remotion studio
```

Use Studio for:

- checking layout and safe areas
- validating timing and transitions
- confirming caption readability
- catching asset or font issues before a full render
- checking that overlays do not occlude captions or subtitle-safe areas

## One-frame sanity check

When a full preview is unnecessary or expensive, render one frame:

```bash
npx remotion still [composition-id] --scale=0.25 --frame=30
```

Notes:

- `--frame=30` is the one-second mark at 30 fps.
- Use this for quick layout, color, and timing checks.
- Prefer this when you changed the hero frame, text layout, or a risky transition boundary.
- Capture multiple frames when needed, not just one. A simple pattern is:

```bash
npx remotion still [composition-id] --scale=0.25 --frame=30
npx remotion still [composition-id] --scale=0.25 --frame=90
npx remotion still [composition-id] --scale=0.25 --frame=180
```

- Use multi-frame still checks for dense hero frames, opening and ending beats, and any transition boundary that might hide clipping or dead air.

## Final render

Use the project's normal render command when available. A common baseline is:

```bash
npx remotion render [composition-id]
```

Before calling a render complete, verify:

- the composition ID is correct
- props or input data match the intended scene set
- fonts and assets resolve in the render environment
- the expected width, height, fps, and duration are final

## Self-evaluation pass

Before presenting the output, inspect the highest-risk moments yourself:

- the first 1-2 seconds
- the last 1-2 seconds
- each major scene boundary or transition
- any dense caption section
- any layout-heavy animation or overlay moment

Check for:

- caption occlusion or unsafe margins
- text clipping or overflow
- timing drift between scene intent and actual render
- abrupt transitions, dead air, or accidental overlaps
- asset decode, font, or color inconsistencies

## When to skip render commands

You can skip explicit render guidance for:

- tiny refactors with no visual impact
- pure documentation updates
- tasks where the user only asked for planning artifacts

Otherwise, include the preview or render path in the handoff.
