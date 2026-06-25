---
name: light-leaks
description: Light leak overlay effects for Remotion using @remotion/light-leaks.
metadata:
  tags: light-leaks, overlays, transitions, effects
---

# Light leaks

Use light leaks as a stylized overlay at a cut point or as a decorative branded accent.

This only works on newer Remotion versions. Check the installed version with:

```bash
npx remotion versions
```

## Install

```bash
npx remotion add @remotion/light-leaks # If project uses npm
bunx remotion add @remotion/light-leaks # If project uses bun
yarn remotion add @remotion/light-leaks # If project uses yarn
pnpm exec remotion add @remotion/light-leaks # If project uses pnpm
```

## Best use

- over a scene cut inside `TransitionSeries`
- as a short branded burst between beats
- as a subtle atmospheric overlay on promo videos

Do not use it by default on every scene. It works best as a short accent.

## Transition usage

```tsx
import { TransitionSeries } from "@remotion/transitions";
import { linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { LightLeak } from "@remotion/light-leaks";

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={90}>
    <SceneA />
  </TransitionSeries.Sequence>
  <TransitionSeries.Transition
    presentation={fade()}
    timing={linearTiming({ durationInFrames: 18 })}
  />
  <TransitionSeries.Sequence durationInFrames={18}>
    <LightLeak hueShift={220} seed={2} />
  </TransitionSeries.Sequence>
  <TransitionSeries.Sequence durationInFrames={90}>
    <SceneB />
  </TransitionSeries.Sequence>
</TransitionSeries>;
```

## Standalone overlay

```tsx
import { AbsoluteFill } from "remotion";
import { LightLeak } from "@remotion/light-leaks";

export const AccentOverlay = () => {
  return (
    <AbsoluteFill>
      <LightLeak durationInFrames={24} hueShift={220} seed={3} />
    </AbsoluteFill>
  );
};
```

## Key props

- `durationInFrames`
- `seed`
- `hueShift`

The effect reveals during the first half of its duration and retracts during the second half.

## Guidance

- Keep the duration short.
- Match `hueShift` to the brand palette instead of leaving the default every time.
- Use the same seed if you need repeatable renders.

## Pair with

- [`transitions.md`](./transitions.md)
- [`timing.md`](./timing.md)
