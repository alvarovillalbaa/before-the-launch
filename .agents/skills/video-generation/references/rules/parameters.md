---
name: parameters
description: Make a Remotion composition parametrizable with a Zod schema.
metadata:
  tags: parameters, zod, props, schema, defaults
---

# Parameters in Remotion

Use composition schemas when the video should be driven by structured props instead of hard-coded values.

## When to use

- reusable marketing templates
- JSON-driven or CMS-driven videos
- videos with editable headlines, colors, CTA text, or scene arrays
- compositions that should expose controls in Studio or the Player

## Install Zod

Search the project for lockfiles and install `zod` using the matching package manager.

Examples:

```bash
npm i zod
pnpm i zod
yarn add zod
bun i zod
```

## Define a schema

Keep the schema next to the composition component.

```tsx
import { z } from "zod";

export const LaunchVideoSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  cta: z.string(),
  themeColor: z.string(),
});

type LaunchVideoProps = z.infer<typeof LaunchVideoSchema>;

export const LaunchVideo: React.FC<LaunchVideoProps> = (props) => {
  return <div>{props.title}</div>;
};
```

## Attach the schema to the composition

```tsx
import { Composition } from "remotion";
import { LaunchVideo, LaunchVideoSchema } from "./LaunchVideo";

export const RemotionRoot = () => {
  return (
    <Composition
      id="LaunchVideo"
      component={LaunchVideo}
      durationInFrames={180}
      fps={30}
      width={1920}
      height={1080}
      schema={LaunchVideoSchema}
      defaultProps={{
        title: "Ship faster",
        cta: "Book a demo",
        themeColor: "#0F172A",
      }}
    />
  );
};
```

## Guidance

- The top-level schema should be `z.object(...)` because composition props are an object.
- Use schemas for anything the user may want to vary between renders.
- Keep timing inputs explicit. If scene durations or copy affect total runtime, combine schemas with `calculateMetadata`.
- Prefer a small number of meaningful props over a large unstructured config blob.

## Color input

If the composition needs color pickers, install `@remotion/zod-types`:

```bash
npx remotion add @remotion/zod-types # If project uses npm
bunx remotion add @remotion/zod-types # If project uses bun
yarn remotion add @remotion/zod-types # If project uses yarn
pnpm exec remotion add @remotion/zod-types # If project uses pnpm
```

Then use `zColor()`:

```tsx
import { z } from "zod";
import { zColor } from "@remotion/zod-types";

export const ThemeSchema = z.object({
  accent: zColor(),
});
```

## Pair with

- [`calculate-metadata.md`](./calculate-metadata.md) for dynamic duration or dimensions
- [`compositions.md`](./compositions.md) for composition setup
