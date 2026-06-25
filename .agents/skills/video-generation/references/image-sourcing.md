# Image Sourcing

Use the image source that best balances fidelity, portability, and production speed.

## Supported Paths

1. Existing external image URLs already present in the repo
2. Existing local repo images
3. Images generated on the fly during the task
4. Code-as-image product visuals
5. Mixed compositions

## Decision Order

1. Product dashboards, terminal scenes, UI states, and feature callouts should prefer code-as-image or live compositions.
2. If the exact asset already exists as a stable external URL, reuse it.
3. If the asset exists only locally, move or copy it into the active `public/` pipeline or another deliberate hosted location before treating it as a production dependency.
4. Generate missing supporting imagery only after checking the existing asset pool.
5. Combine generated backgrounds with coded product foregrounds when the video needs both mood and product fidelity.
