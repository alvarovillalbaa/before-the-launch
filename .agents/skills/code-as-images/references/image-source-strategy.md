# Image Source Strategy

Use the image source that gives the most control and the least visual drift.

## Available Paths

1. Existing external image URLs already present in the repo
2. Existing local repo images
3. Code-as-image visuals authored during the task
4. AI-generated images created during the task
5. Mixed compositions

## Decision Rules

1. Product UI, dashboards, terminal flows, and feature callouts should default to code-as-image.
2. Reuse stable external URLs when the exact real-world asset already exists.
3. Local repo images are valid inputs, but when the output needs portability or hosted delivery, prefer promoting them to the active asset host or public URL.
4. Use AI generation for missing backgrounds, supporting scenes, texture, or atmosphere.
5. Combine sources when that produces a clearer result than any single source alone.

## Mixed Composition Pattern

Recommended layer order:

1. Background: generated image, texture, or photography
2. Foreground: coded product or technical surface
3. Overlay: labels, callouts, gradient masks, or framing chrome
