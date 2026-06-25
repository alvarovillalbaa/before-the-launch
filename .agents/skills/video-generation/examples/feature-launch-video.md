# Feature Launch Walkthrough Example

Use this example for a product feature video that is mostly a structured walkthrough.

## Brief

- Objective: announce a new AI summary feature inside an existing product
- Audience: existing customers and trial users
- Format: `1920x1080`, `30fps`, about `45s`
- Operating mode: `manifest-driven`
- CTA: "Try AI summaries in your workspace today"

## Suggested structure

1. Hook:
   0:00-0:05. Product UI appears with a quick value statement.
2. Problem:
   0:05-0:12. Show a cluttered workflow and slow manual review.
3. Feature reveal:
   0:12-0:22. Zoom into the new AI summary entry point.
4. Guided walkthrough:
   0:22-0:36. Step through results, filters, and share action.
5. CTA:
   0:36-0:45. Return to branded end card with logo and CTA.

## Example manifest

```json
{
  "feature": "AI summaries",
  "screens": [
    {
      "id": "dashboard",
      "title": "Open your workspace",
      "description": "Start from the main dashboard with a subtle zoom-in.",
      "imagePath": "assets/screens/dashboard.png",
      "durationInSeconds": 5,
      "transition": "fade"
    },
    {
      "id": "summary-trigger",
      "title": "Generate a summary",
      "description": "Highlight the new summary action with a callout.",
      "imagePath": "assets/screens/summary-trigger.png",
      "durationInSeconds": 7,
      "transition": "slide-left"
    },
    {
      "id": "result",
      "title": "Review the output",
      "description": "Animate the result area and key bullets.",
      "imagePath": "assets/screens/result.png",
      "durationInSeconds": 8,
      "transition": "fade"
    }
  ]
}
```

## Rules to load

- `references/rules/sequencing.md`
- `references/rules/transitions.md`
- `references/rules/images.md`
- `references/rules/text-animations.md`
- `references/rules/measuring-text.md`

## Notes

- Keep the screen order in data, not buried in JSX.
- Use text overlays for context, not paragraphs of narration.
- Prefer a single motion language across all slides.
- If visual direction is missing, ask for mood, canvas direction, and reference products before choosing a fallback.
- Check at least one still frame from the feature reveal and one from the CTA before treating the walkthrough as done.
