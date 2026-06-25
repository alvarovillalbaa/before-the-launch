# AI Image Deck Styles

Use these presets when the user wants fully rendered slide images instead of authored HTML or React slides.

## Presets

| Style | Description |
| --- | --- |
| `whiteboard` | Hand-drawn whiteboard illustration. Black ink on white with orange accents, simple icons, no gradients, no photos. |
| `corporate` | Clean navy/white/gold presentation look with modern sans-serif typography and flat data-viz language. |
| `minimalist` | Pure white background, one electric accent color, large bold text, strong negative space. |
| `dark-tech` | Near-black background with neon green accents, terminal or developer-tool energy, subtle grids. |
| `playful` | Bright pastel palette, rounded shapes, soft edges, startup-friendly warmth. |
| `editorial` | Black/white with one red spot color, magazine hierarchy, serif headline plus clean sans body. |

## Custom Style Mapping

When the user asks for a custom visual direction:

1. Map it to the closest preset for baseline composition and contrast.
2. Add custom material, subject, or brand details after the preset prefix.
3. Keep the prompt style description stable across all slides in the same deck.

## Prompt Rules

1. Style text should describe composition, palette, typography mood, and rendering constraints.
2. Keep slide-specific content separate from the style prefix.
3. Ask for a consistent aspect ratio up front; default to `16:9`.
4. Avoid asking the model for dense body copy inside the image. Use concise slide text and strong visual composition.
