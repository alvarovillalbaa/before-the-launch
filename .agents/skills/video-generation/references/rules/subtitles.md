---
name: subtitles
description: Router for subtitle and caption workflows in Remotion.
metadata:
  tags: subtitles, captions, srt, transcript, router
---

# Subtitles and captions

All caption workflows in this skill should normalize to Remotion's `Caption` shape.

```ts
import type { Caption } from "@remotion/captions";
```

Use this rule as a router, not as the main implementation guide.

## Caption shape

```ts
type Caption = {
  text: string;
  startMs: number;
  endMs: number;
  timestampMs: number | null;
  confidence: number | null;
};
```

## Route to the right file

- If you need to generate captions from speech, use [`transcribe-captions.md`](./transcribe-captions.md).
- If you already have an `.srt` file, use [`import-srt-captions.md`](./import-srt-captions.md).
- If you need to render captions on screen, use [`display-captions.md`](./display-captions.md).

## Guidance

- Keep captions as JSON data before rendering them.
- Treat timing in milliseconds as the source of truth until you convert to frames.
- If narration timing changes, update captions from the same timing source rather than patching them by hand.

## Pair with

- [`audio.md`](./audio.md)
- [`voiceover.md`](./voiceover.md)
