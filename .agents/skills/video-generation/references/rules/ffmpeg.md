---
name: ffmpeg
description: Using FFmpeg and FFprobe from Remotion projects.
metadata:
  tags: ffmpeg, ffprobe, trim, audio, media, inspection
---

# FFmpeg in Remotion

Use FFmpeg when the task needs media inspection or file-level transformations outside the Remotion timeline.

## Invocation

You do not need a separate FFmpeg install if the project uses the Remotion CLI.

```bash
npx remotion ffmpeg -i input.mp4 output.mp3
npx remotion ffprobe input.mp4
```

## When to use FFmpeg

- extracting or converting media files
- checking streams and metadata with `ffprobe`
- detecting silence before applying trims
- generating deliverable files that must exist outside the composition

## Prefer timeline trims for in-composition edits

If the goal is only to trim media inside a Remotion composition, prefer component props such as `trimBefore` and `trimAfter` on `Video` or `Audio`.

That approach is better because it:

- keeps the source asset unchanged
- avoids a re-encode step
- keeps timing editable in frames inside the composition

## Use FFmpeg when a standalone trimmed file is required

If the output must be a separate uploaded or shared asset, FFmpeg is appropriate. Re-encode to avoid broken or frozen leading frames.

```bash
npx remotion ffmpeg \
  -ss 00:00:05 \
  -i public/input.mp4 \
  -to 00:00:10 \
  -c:v libx264 \
  -c:a aac \
  public/output.mp4
```

## Use FFprobe for inspection

Run `ffprobe` when you need stream, codec, or container details before deciding how to render or transform an asset.

```bash
npx remotion ffprobe public/input.mp4
```

## Pair with

- [`trimming.md`](./trimming.md) for composition-level trims
- [`silence-detection.md`](./silence-detection.md) for adaptive silence detection
- [`get-video-duration.md`](./get-video-duration.md) and [`get-audio-duration.md`](./get-audio-duration.md) when only duration lookup is needed
