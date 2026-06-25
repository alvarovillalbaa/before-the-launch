---
name: maps
description: Map animations in Remotion using Mapbox and Turf.
metadata:
  tags: map, maps, mapbox, route, geo, animation
---

# Maps in Remotion

Use Mapbox when the video needs route animation, location context, or a camera move over a map.

## When to use

- travel or logistics videos
- route reveal animations
- product videos that need location context
- explainers with animated geography

## Install

Search the project for lockfiles and install the matching packages:

```bash
npm i mapbox-gl @turf/turf @types/mapbox-gl
pnpm i mapbox-gl @turf/turf @types/mapbox-gl
yarn add mapbox-gl @turf/turf @types/mapbox-gl
bun i mapbox-gl @turf/turf @types/mapbox-gl
```

## Credentials

Create a Mapbox access token and store it in `.env`:

```txt
REMOTION_MAPBOX_TOKEN=pk.your-mapbox-access-token
```

## Remotion-specific rules

- Disable interactive behavior and built-in fades.
- Delay rendering until the map is loaded.
- The map container must have explicit width, height, and `position: "absolute"`.
- Keep camera and route animation driven by `useCurrentFrame()`.
- Do not rely on Mapbox's own animation system.

## Basic setup

```tsx
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { AbsoluteFill, useDelayRender, useVideoConfig } from "remotion";

mapboxgl.accessToken = process.env.REMOTION_MAPBOX_TOKEN as string;

export const MapScene = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { width, height } = useVideoConfig();
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const [handle] = useState(() => delayRender("Loading map"));

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: ref.current!,
      style: "mapbox://styles/mapbox/standard",
      center: [-73.9857, 40.7484],
      zoom: 12,
      pitch: 45,
      bearing: 0,
      interactive: false,
      fadeDuration: 0,
    });

    map.on("load", () => continueRender(handle));
    map.on("error", (err) => cancelRender(err.error));
  }, [cancelRender, continueRender, handle]);

  return (
    <AbsoluteFill>
      <div
        ref={ref}
        style={{ width, height, position: "absolute" }}
      />
    </AbsoluteFill>
  );
};
```

## Styling guidance

- Default to `mapbox://styles/mapbox/standard`.
- Hide labels and extra features unless the brief requires them.
- Keep north up unless the user explicitly wants camera rotation.
- Make route lines, markers, and labels thicker than usual because the composition may be scaled down.

## Animation guidance

- Use `interpolate()` and `useCurrentFrame()` for line growth and camera progress.
- For route-following moves, Turf is useful for distance calculations and along-path sampling.
- For straight projected lines on a Mercator map, use linear interpolation between coordinates instead of geodesic slicing.
- For multi-step animations, set all animated properties at every stage to avoid jumps.

## Rendering guidance

If map rendering is unstable, a pragmatic render baseline is:

```bash
npx remotion render --gl=angle --concurrency=1
```

## Pair with

- [`timing.md`](./timing.md)
- [`sequencing.md`](./sequencing.md)
- [`animations.md`](./animations.md)
