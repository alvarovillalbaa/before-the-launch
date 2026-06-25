---
name: silence-detection
description: Adaptive silence detection for audio or video using FFmpeg loudness analysis.
metadata:
  tags: silence, loudnorm, silencedetect, ffmpeg, trim, audio
---

# Silence detection

Use silence detection when you need to remove dead air from narration, intros, outros, or imported clips.

Requires FFmpeg. See [`ffmpeg.md`](./ffmpeg.md).

## Recommended approach

Use an adaptive threshold instead of a fixed guess:

1. Measure the file loudness with `loudnorm`.
2. Reuse the measured threshold with `silencedetect`.
3. Convert detected seconds into frames.
4. Apply the result with `trimBefore` or `trimAfter` inside Remotion unless a standalone trimmed file is required.

## Step 1: Measure loudness

```bash
npx remotion ffmpeg \
  -i public/video.mov \
  -map 0:a \
  -af loudnorm=print_format=json \
  -f null /dev/null
```

Look for values such as:

- `input_i`: integrated loudness
- `input_thresh`: threshold that can be reused for silence detection

## Step 2: Detect silence

Use the measured threshold as the `noise` value:

```bash
npx remotion ffmpeg \
  -i public/video.mov \
  -map 0:a \
  -af "silencedetect=noise=${THRESH}dB:d=0.5" \
  -f null /dev/null
```

Guidance:

- `noise`: use the threshold from step 1
- `d`: minimum silence duration in seconds; `0.5` is a reasonable default for spoken audio

## Interpreting output

The filter logs pairs such as:

- `silence_start`
- `silence_end`
- `silence_duration`

Use them to identify:

- leading silence near the start of the file
- trailing silence near the end of the file
- long internal pauses that should be removed only if the brief calls for tighter pacing

Treat nearly contiguous silent ranges at the start or end as one block.

## Apply trim points in Remotion

Convert seconds into frames using the composition FPS.

```tsx
import { Video } from "@remotion/media";
import { staticFile, useVideoConfig } from "remotion";

export const Clip = () => {
  const { fps } = useVideoConfig();
  const trimBefore = Math.round(1.2 * fps);
  const trimAfter = Math.round(18.4 * fps);

  return (
    <Video
      src={staticFile("video.mov")}
      trimBefore={trimBefore}
      trimAfter={trimAfter}
    />
  );
};
```

## Use judgment

- Remove leading and trailing silence aggressively when the video should feel tight.
- Keep intentional pauses if they support pacing, emphasis, or readability.
- For narration plus captions, update caption timing if you remove internal pauses.

## Pair with

- [`audio.md`](./audio.md)
- [`videos.md`](./videos.md)
- [`trimming.md`](./trimming.md)
