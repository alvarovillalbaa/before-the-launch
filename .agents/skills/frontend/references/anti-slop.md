# Anti-Slop: Avoiding Generic AI Output

Rules for producing premium, non-generic interfaces. LLMs have statistical biases toward recognizable design clichés. These rules actively counteract them.

Sources: [taste-skill](https://github.com/Leonxlnx/taste-skill), [impeccable.style](https://impeccable.style/)

---

## Design Register

Before writing any CSS or choosing any component, determine which register the work belongs to:

| Register | Description | Examples |
|---|---|---|
| **Brand mode** | Design IS the product — visual quality is a primary deliverable | Marketing sites, portfolios, editorial pages, landing pages |
| **Product mode** | Design SERVES the product — UI enables tasks | App dashboards, tools, settings, data views |

Brand mode tolerates (and often needs) more visual experimentation, longer animations, display fonts, and asymmetric layouts. Product mode requires restraint: shorter animations, sans-serif only, predictable navigation, dense information.

Adjust vocabulary and constraints based on register. Do not apply brand-mode experimentation to product-mode surfaces.

---

## Forbidden Patterns — Visual & CSS

| Never | Instead |
|---|---|
| Neon outer glows (`box-shadow: 0 0 20px #a855f7`) | Inner borders or subtle tinted shadows |
| Pure black (`#000000`) | Off-black: `zinc-950`, `slate-950`, `#0a0a0a` |
| Oversaturated accent colors | Desaturate accents (saturation < 80%) to blend elegantly with neutrals |
| Gradient text on large headings | Use weight, color, and size contrast instead |
| Purple/blue "AI aesthetic" — neon gradients, glowing elements | Neutral bases (zinc/slate) with a single high-contrast accent |
| Custom mouse cursors | They degrade performance and accessibility |
| `box-shadow` glow as primary affordance | Use border or background contrast |
| Multiple accent colors in one view | One accent color per view |

---

## Forbidden Patterns — Typography

| Never | Instead |
|---|---|
| Inter for "premium" or "creative" contexts | Geist, Outfit, Cabinet Grotesk, or Satoshi |
| Serif fonts on dashboards, software UIs, or tools | High-end sans-serif only (Geist + Geist Mono, Satoshi + JetBrains Mono) |
| Oversized H1 that "screams" | Control hierarchy with weight and color, not just massive scale |
| `text-4xl` and below for display headings | `text-4xl md:text-6xl tracking-tighter leading-none` baseline |
| `letter-spacing` on body text | Only add tracking to uppercase/all-caps labels (`0.05em`) |

---

## Forbidden Patterns — Layout

| Never | Instead |
|---|---|
| Centered Hero in brand mode (`DESIGN_VARIANCE > 4`) | Split-screen 50/50, left-aligned content / right-aligned asset, or asymmetric whitespace |
| 3 equal horizontal feature cards | 2-column zig-zag, asymmetric grid, or horizontal scroll approach |
| `h-screen` for full-height hero sections | `min-h-[100dvh]` — prevents catastrophic layout jump on iOS Safari |
| `width: calc(33% - 1rem)` flex math | CSS Grid: `grid-cols-1 md:grid-cols-3 gap-6` |
| Generic card containers in dense dashboards (`VISUAL_DENSITY > 7`) | Logic grouping via `border-t`, `divide-y`, or negative space |
| Arbitrary z-index values (`z-50`, `z-10` ad hoc) | Fixed z-index scale for systemic layers: navbars, modals, overlays |
| Emojis in UI, markup, or alt text | Radix icons, Phosphor icons, or clean SVG primitives |

---

## Forbidden Patterns — Content & Copy

These are the "Jane Doe Effect" — recognizable filler content that immediately reads as AI-generated.

| Never | Instead |
|---|---|
| Generic names: "John Doe", "Sarah Chan", "Jack Su" | Creative, realistic-sounding names with regional variety |
| Generic SVG "egg" or Lucide user icons for avatars | Realistic photo placeholders or distinctively styled avatars |
| Round fake numbers: `99.99%`, `50%`, `1,000` | Organic, messy data: `47.2%`, `+1 (312) 847-1928`, `1,247` |
| Startup slop names: "Acme", "Nexus", "SmartFlow" | Premium, contextual brand names specific to the product domain |
| AI copywriting clichés: "Elevate", "Seamless", "Unleash", "Next-Gen", "Cutting-edge" | Concrete verbs and specifics about what the product actually does |
| "Lorem ipsum" for any visible UI state | Real or realistic placeholder content |

---

## Forbidden Patterns — Components & Libraries

| Never | Instead |
|---|---|
| Import 3rd-party library without checking `package.json` first | Verify existence, output `npm install <pkg>` if missing |
| Use shadcn/ui in its default state | Customize radii, colors, and shadows to match project aesthetic |
| Broken Unsplash URLs or `picsum.photos` for production | For demos: `https://picsum.photos/seed/{random_string}/800/600` or SVG UI Avatars |
| Mix GSAP/ThreeJS with Framer Motion in the same component | GSAP/ThreeJS for isolated scrolltelling/canvas; Framer Motion for UI interactions |
| `useState` for magnetic hover or continuous animations | Framer Motion's `useMotionValue` and `useTransform` outside render cycle |

---

## Glassmorphism — Correct Implementation

Frosted glass done wrong is just `backdrop-blur`. Done right it simulates physical edge refraction:

```css
.glass-panel {
  backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.10);        /* outer edge */
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.10),          /* top highlight */
    0 4px 24px rgba(0, 0, 0, 0.12);
}
```

The 1px inner border and `inset` top highlight are what make it feel physical, not just blurred.

---

## Design Variance Thinking

When deciding how experimental a layout can be:

| Variance | Layout Language |
|---|---|
| **Low** (centered, symmetrical) | `justify-center`, strict 12-column grid, equal paddings |
| **Medium** (offset) | `-mt-8` overlaps, varied image aspect ratios, left-aligned headers |
| **High** (asymmetric, brand mode only) | Masonry, `grid-template-columns: 2fr 1fr 1fr`, massive whitespace zones |

**Mobile override always applies:** any asymmetric layout above `md:` must fall back to single-column (`w-full px-4`) below 768px.

---

## Pre-Ship Anti-Slop Checklist

- [ ] No Inter font for "premium" or "creative" contexts
- [ ] No purple/neon gradient anywhere
- [ ] No centered hero in brand-mode pages
- [ ] No 3-column equal feature card layout
- [ ] No generic placeholder names (John Doe, Sarah Chan)
- [ ] No round fake numbers (99.9%, 50%, 1000)
- [ ] No AI filler words (Elevate, Seamless, Unleash, Next-Gen)
- [ ] No `h-screen` — hero sections use `min-h-[100dvh]`
- [ ] No emoji in UI markup
- [ ] shadcn/ui components customized beyond defaults (radii, colors, shadows)
- [ ] One accent color per view maximum
- [ ] Loading, empty, and error states all implemented
- [ ] No circular spinner for skeleton loading (use layout-matching skeletons)
