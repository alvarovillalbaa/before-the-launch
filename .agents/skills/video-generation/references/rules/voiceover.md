---
name: voiceover
description: Generate voiceover audio for Remotion scenes and size the composition from audio duration.
metadata:
  tags: voiceover, tts, audio, scenes, calculate-metadata
---

# Voiceover in Remotion

Use this pattern when scene timing should follow generated narration rather than a fixed guess.

## Workflow

1. Generate one audio file per scene.
2. Write the files into `public/` so Remotion can load them with `staticFile()`.
3. Measure the generated durations.
4. Use `calculateMetadata` to size the composition from the audio.
5. Feed the computed scene durations back into the composition props or timing model.

## Provider choice

Any TTS provider that can output audio files works. If the user has not chosen one, a pragmatic default is ElevenLabs.

Keep the provider choice explicit in the plan because it affects:

- environment variables
- voice consistency
- latency and cost
- language or multilingual support

## Generate files

A typical script reads scene text from config, calls the TTS API, and writes MP3 files into `public/voiceover/...`.

Example output layout:

```text
public/
  voiceover/
    launch-video/
      scene-01-hook.mp3
      scene-02-problem.mp3
      scene-03-cta.mp3
```

## Measure durations with `calculateMetadata`

```tsx
import { staticFile, type CalculateMetadataFunction } from "remotion";
import { getAudioDuration } from "./get-audio-duration";

const FPS = 30;
const AUDIO_FILES = [
  "voiceover/launch-video/scene-01-hook.mp3",
  "voiceover/launch-video/scene-02-problem.mp3",
  "voiceover/launch-video/scene-03-cta.mp3",
];

export const calculateMetadata: CalculateMetadataFunction = async () => {
  const durations = await Promise.all(
    AUDIO_FILES.map((file) => getAudioDuration(staticFile(file))),
  );

  const sceneDurations = durations.map((seconds) => Math.ceil(seconds * FPS));

  return {
    durationInFrames: sceneDurations.reduce((sum, d) => sum + d, 0),
    props: {
      sceneDurations,
    },
  };
};
```

If the composition uses overlapping transitions, subtract the overlap from the total.

## Render audio in the component

- Use `Audio` for scene narration files.
- Delay each file with `Sequence` boundaries if scenes do not start at frame `0`.
- Keep captions aligned to the same timing source as the narration.

## Guidance

- Generate per-scene files instead of one monolithic narration file when scene timing may change.
- Treat generated audio duration as the source of truth once files exist.
- Re-run duration measurement if the script, voice, or language changes.

## Pair with

- [`audio.md`](./audio.md)
- [`calculate-metadata.md`](./calculate-metadata.md)
- [`get-audio-duration.md`](./get-audio-duration.md)
- [`transitions.md`](./transitions.md)
