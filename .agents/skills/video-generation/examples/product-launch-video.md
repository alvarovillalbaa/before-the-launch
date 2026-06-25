# Product Launch Spot Example

Use this example for a short branded launch video targeting social distribution.

## Brief

- Objective: launch a new product or major release
- Audience: prospects and current customers
- Format: `1920x1080`, `30fps`, `30s`
- Operating mode: `scene-first`
- Tone: bold, fast, premium
- CTA: "Book a demo"

## Storyboard Table

| Beat | Time | Visuals | Text Overlay |
|------|------|---------|--------------|
| Hook | 0:00–0:03 | Motion-heavy background, fast cut | 1 strong headline, no subtext |
| Product reveal | 0:03–0:06 | Real product screenshot or UI clip | Short product name or tagline |
| Before/after | 0:06–0:15 | Staggered before → after sequence | Problem label, then solution label |
| Feature beats | 0:15–0:25 | 2–3 key capability close-ups | One phrase per beat, no sentences |
| End card | 0:25–0:30 | Logo centered, branded background | URL + CTA copy |

**Before/after rule:** stagger the before and after states — do not show them simultaneously. The before disappears, then the after arrives. The gap is the money shot.

**Hook rule:** the product identity must be clear within the first 3 seconds. If the viewer swipes at 2 seconds, they still saw who you are.

**UI fidelity rule:** never invent labels, feature names, or UI copy. Screenshot the real product and mirror the copy exactly. Invented UI is immediately visible to users who know the product.

## Suggested scenes

1. Hook:
   0:00–0:03. Strong headline over motion-heavy or branded background. No product UI yet — just the statement.
2. Product reveal:
   0:03–0:06. Real product screenshot or short screen recording clip enters. Name or tagline reinforces.
3. Before / after:
   0:06–0:15. Show the painful old state, then cut or wipe to the solution. Stagger the transition — not simultaneous.
4. Feature beats:
   0:15–0:25. 2–3 tight close-ups of the most differentiating capability. The differentiating feature deserves the most screen time.
5. End card:
   0:25–0:30. Branded background, logo, URL, and CTA. Burned-in caption of CTA for muted viewers.

## Multi-agent review

Before final handoff, run four parallel critics. See [references/multi-agent-review.md](../references/multi-agent-review.md).

1. Design / layout critic: spacing, clipping, safe areas, visual hierarchy.
2. Text / readability critic: copy reads at 720p, nothing clips, captions are in frame.
3. Narrative / pacing critic: does each beat earn its time? Does the before/after land?
4. Brand alignment critic: colors, fonts, logo usage match brand inputs. No silent generic defaults.

## Platform export

After the primary render, produce variants per [references/platform-specs.md](../references/platform-specs.md):

- `1920x1080` → X (video post), LinkedIn, YouTube
- `1080x1920` → Instagram Reels, TikTok
- Optional GIF export at 720p for embed or Slack use

Render each variant as a separate composition in `Root.tsx`. Keep the storyboard beats aligned — do not re-edit content per platform, only reframe.

## Recommended implementation

- One component per scene.
- Shared timing constants for all scene boundaries.
- Explicit `Sequence` windows, no scattered delays.
- Hero frame of each scene built statically first, then animated.
- Burned-in captions on all social exports (85%+ of views are muted).
- h264 codec, crf 18 for the primary render.

## Rules to load

- `references/rules/compositions.md`
- `references/rules/timing.md`
- `references/rules/transitions.md`
- `references/rules/text-animations.md`
- `references/rules/audio.md`
- `references/rules/fonts.md`
- `references/rules/display-captions.md`

## Notes

- Lock the hook, before/after, and end card hero frames before any animation polish.
- Use a still render check on frame 1, the before/after boundary, and the last frame before final handoff.
- If brand direction is missing, ask for mood, canvas direction, and brand references before defaulting to anything.
- Keep the headline count low — one message per scene.
