# Composition Patterns

Choose the simplest architecture that matches the request.

## 1. Scene-first Remotion composition

Use for:

- launch videos
- promos and ads
- explainers with custom layouts
- any video where layout and animation are mostly bespoke

Recommended structure:

- `RootComposition.tsx`
- one scene component per major beat
- shared timing constants
- explicit `Sequence` boundaries

Use this when the brief drives the video more than a pre-existing data source.

## 2. Manifest-driven walkthrough

Use for:

- product walkthroughs
- screen-by-screen demos
- feature highlight videos
- internal demos where scenes are mostly asset plus overlay plus transition

Recommended source of truth:

```json
{
  "projectName": "Example Product",
  "screens": [
    {
      "id": "home",
      "title": "Home Dashboard",
      "description": "Entry point with key metrics and shortcuts",
      "imagePath": "assets/screens/home.png",
      "width": 1440,
      "height": 900,
      "durationInSeconds": 4,
      "transition": "fade"
    }
  ]
}
```

Recommended structure:

- `ScreenSlide.tsx` for one screen or scene
- `WalkthroughComposition.tsx` to sequence slides
- manifest file that drives durations, overlay copy, and ordering

Use this when the video is mostly a deterministic presentation of screens or scenes described as data.

## 3. JSON timeline rendering with `@json-render/remotion`

Use for:

- timeline-first pipelines
- AI-generated or CMS-driven video specs
- systems that need a typed JSON contract between planning and rendering

Core ideas:

- The JSON spec is the source of truth.
- Composition metadata lives in `spec.composition`.
- Sequencing lives in tracks and clips.
- Audio lives in audio tracks rather than ad hoc component logic.
- Use standard catalog definitions first, then extend with custom components only where needed.

Minimal shape:

```json
{
  "composition": {
    "id": "video",
    "fps": 30,
    "width": 1920,
    "height": 1080,
    "durationInFrames": 300
  },
  "tracks": [
    {
      "id": "main",
      "name": "Main",
      "type": "video",
      "enabled": true
    }
  ],
  "clips": [
    {
      "id": "clip-1",
      "trackId": "main",
      "component": "TitleCard",
      "props": {
        "title": "Hello"
      },
      "from": 0,
      "durationInFrames": 90
    }
  ],
  "audio": {
    "tracks": []
  }
}
```

Implementation guidance:

- Keep catalog definitions and runtime React components aligned.
- Prefer standard components before introducing custom ones.
- If custom components are needed, define their props and default duration clearly.
- Do not hide timing logic inside the component when it belongs in the timeline spec.

## Selection rule

- If every scene is unique, choose scene-first.
- If the video is mostly ordered assets plus overlays, choose manifest-driven.
- If the request or codebase already centers on a typed timeline spec, choose JSON-render.
