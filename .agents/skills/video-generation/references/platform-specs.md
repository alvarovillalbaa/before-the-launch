# Platform Specs

Use this file when preparing social export variants. Render a separate composition per target platform — do not crop a single master render.

## Dimension and duration limits

| Platform | Aspect ratio | Recommended size | Max duration | Notes |
|----------|-------------|-----------------|--------------|-------|
| X (Twitter) | 16:9 | 1920×1080 | 2:20 (140s) | Videos autoplay muted; captions required |
| LinkedIn | 16:9 | 1920×1080 | 10 min (feed) | First 3s plays before click; hook matters |
| YouTube | 16:9 | 1920×1080 | No hard limit | Use `<60s` for Shorts feed distribution |
| YouTube Shorts | 9:16 | 1080×1920 | 60s | Vertical only; full-screen autoplay |
| Instagram feed | 1:1 or 4:5 | 1080×1080 or 1080×1350 | 60s | Square or portrait; square is safer |
| Instagram Reels | 9:16 | 1080×1920 | 90s | Cover frame visible before play |
| TikTok | 9:16 | 1080×1920 | 10 min | Hook within 1s; most viewers are muted |

## Muted-viewer baseline

85% or more of social views across all platforms are muted. Treat burned-in captions as required for every social export, not optional.

- Captions must be in the subtitle-safe zone (not within 10% of the frame edge).
- Caption text must be legible at 720p minimum.
- Do not rely on voiceover to carry the narrative — every key message must be readable without audio.

## Remotion implementation

Define one `<Composition>` per platform target in `Root.tsx`:

```tsx
// Root.tsx
export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="LaunchVideo_16x9"
      component={LaunchVideo}
      durationInFrames={900}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="LaunchVideo_9x16"
      component={LaunchVideoVertical}
      durationInFrames={900}
      fps={30}
      width={1080}
      height={1920}
    />
  </>
);
```

Reuse the same scene logic, shared timing constants, and caption data — only reframe the layout per composition.

## Render quality defaults

- Codec: h264
- CRF: 18 (high quality; increase to 23 for smaller file size)
- FPS: 30

```bash
npx remotion render LaunchVideo_16x9 out/launch-16x9.mp4 --codec=h264 --crf=18
npx remotion render LaunchVideo_9x16 out/launch-9x16.mp4 --codec=h264 --crf=18
```

## GIF export

For embed or Slack use, render a 720p GIF via FFmpeg after the MP4 render:

```bash
ffmpeg -i out/launch-16x9.mp4 -vf "fps=15,scale=1280:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" out/launch.gif
```

Keep GIFs under 15fps and 8MB for Slack compatibility.

## Social copy variants

Produce platform-specific captions alongside each render:

- **X**: under 280 chars; lead with the hook; include a link
- **LinkedIn**: 2–3 sentence intro; mention the use case; tag relevant people
- **YouTube description**: longer form; include timestamps for each scene beat

Generate these at the same time as the video plan so copy and video stay aligned.
