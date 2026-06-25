---
name: transparent-videos
description: Rendering video with alpha transparency in Remotion.
metadata:
  tags: transparency, alpha, prores, vp9, webm, export
---

# Transparent videos

Use transparent exports when the rendered video needs to sit on top of another background in editing software or the browser.

Remotion supports two practical export paths:

- ProRes 4444 for editing workflows
- WebM / VP9 for browser playback

## Transparent ProRes

Choose this when the file will be imported into video-editing tools.

CLI example:

```bash
npx remotion render \
  --image-format=png \
  --pixel-format=yuva444p10le \
  --codec=prores \
  --prores-profile=4444 \
  MyComp \
  out.mov
```

Studio defaults:

```ts
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("png");
Config.setPixelFormat("yuva444p10le");
Config.setCodec("prores");
Config.setProResProfile("4444");
```

## Transparent WebM

Choose this when the output will be played directly in the browser.

CLI example:

```bash
npx remotion render \
  --image-format=png \
  --pixel-format=yuva420p \
  --codec=vp9 \
  MyComp \
  out.webm
```

Studio defaults:

```ts
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("png");
Config.setPixelFormat("yuva420p");
Config.setCodec("vp9");
```

## Composition-level defaults

If the composition should default to a transparent export profile, return export defaults from `calculateMetadata`.

```tsx
import type { CalculateMetadataFunction } from "remotion";

export const calculateMetadata: CalculateMetadataFunction = async () => {
  return {
    defaultCodec: "prores",
    defaultVideoImageFormat: "png",
    defaultPixelFormat: "yuva444p10le",
    defaultProResProfile: "4444",
  };
};
```

## Guidance

- Use transparent exports only when the downstream workflow truly needs alpha.
- Double-check shadows, glows, and blurred edges against transparency.
- PNG image format is part of the export setup because the alpha channel must be preserved.

## Pair with

- [`calculate-metadata.md`](./calculate-metadata.md)
- [`compositions.md`](./compositions.md)
