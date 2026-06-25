# Visual Directions

Pick one direction and stay consistent. The goal is not "pretty enough"; it is "visibly deliberate."

Prefer the constrained directions first. They create stronger defaults and reduce generic output.

## Constrained Directions

## Blueprint

- Deep slate or steel blue background
- Precise borders and diagram labels
- Monospace accents, restrained serif or sans headline
- Best for system architecture, implementation plans, infra views
- Good type pairings: `IBM Plex Sans + IBM Plex Mono`, `DM Sans + Fira Code`
- Good accents: teal, steel, sky, slate

## Editorial

- Serif headlines, generous whitespace
- Warm neutrals or navy with restrained accent color
- Strong section hierarchy and pull quotes
- Best for explainers, recaps, and thought pieces
- Good type pairings: `Instrument Serif + JetBrains Mono`, `Fraunces + Source Sans`
- Good accents: deep navy + gold, rose + cranberry

## Paper Ink

- Cream or off-white background
- Terracotta, olive, charcoal accents
- Slightly softer edges and tactile feel
- Best for retros, educational pages, and human-centered narratives
- Good type pairings: `Cormorant Garamond + IBM Plex Sans`, `Newsreader + Source Sans`
- Good accents: terracotta, sage, umber

## Monochrome Terminal

- Near-black background with green, amber, or phosphor accents
- Monospace-first interface
- Minimal visual vocabulary with high contrast
- Best for code reviews, operational recaps, and CLI-adjacent artifacts
- Good type pairings: `IBM Plex Mono + IBM Plex Sans`, `JetBrains Mono + Azeret Mono`
- Good accents: phosphor green, amber, muted cyan

## Craft Handmade

- Off-white or warm cream canvas with subtle paper texture via CSS noise or SVG filter
- Slightly imperfect borders (`border-radius` varies, transforms slightly rotated)
- Warm ink tones: umber, terracotta, deep olive, soft charcoal
- Handwriting or semi-serif type accents alongside body sans
- Best for educational explainers, cultural content, storytelling pages
- Good type pairings: `Caveat + Lato`, `Patrick Hand + Source Sans`
- Good accents: terracotta, warm umber, sage, worn gold

## Retro Swiss Grid

- Strong grid backbone with visible column lines or thick rule dividers
- Limited palette: 2–3 colors maximum, often one saturated + neutral + black
- Condensed or extended grotesque headline type
- Heavy use of large numerals, bold labels, rule-based section breaks
- Best for comparative analyses, rankings, capability maps, editorial reports
- Good type pairings: `Bebas Neue + IBM Plex Sans`, `Barlow Condensed + DM Sans`
- Good accents: signal red + black + off-white; yellow + black + grey

## IKEA Manual

- White or near-white background, minimal decoration
- Black line illustrations preferred; simple shape-based icons
- Numbered steps, consistent icon grid
- No color except for one directional accent (often a warm yellow or sky blue)
- Best for how-to guides, onboarding flows, process explainers
- Good type pairings: `Noto Sans + Fira Sans`, `Inter + Geist Mono`
- Good accents: muted yellow, sky blue

## Knolling / Flat-Lay

- White background with carefully spaced objects arranged on a strict grid
- Each element separated by equal spacing — almost clinical organization
- Minimal shadow (subtle drop shadow only), no decoration
- Best for feature catalogs, component inventories, periodic-table style layouts
- Good type pairings: `Outfit + IBM Plex Mono`, `Syne + DM Sans`
- Good accents: cool neutral greys + one signal accent (electric blue or lime)

## Morandi Journal

- Warm muted palette — dusty rose, greyish sage, faded lilac, warm beige
- Soft doodle or sketch accents as section dividers
- Generous whitespace, light rounded corners, low contrast hierarchy
- Best for qualitative recaps, retrospectives, culture pages, mood boards
- Good type pairings: `Cormorant Garamond + Nunito`, `Libre Baskerville + Quicksand`
- Good accents: dusty rose, sage, faded mauve — never saturated

## Chalkboard

- Deep charcoal or blackboard-green background
- White or chalk-yellow text with soft blur effect on borders
- Hand-drawn style icons and labels
- Best for educational content, math/logic explainers, brainstorm artifacts
- Good type pairings: `Chalk Duster + Source Code Pro`, `Kalam + Fira Code` (via Google Fonts CDN)
- Good accents: chalk white, warm yellow, soft cyan

## Flexible Directions

## Product Brief

- Crisp neutral surface with one product color family
- Dense but clean card layouts
- Strong headline metric treatment
- Best for dashboards, product strategy, and launch reviews
- Good type pairings: `Plus Jakarta Sans + Azeret Mono`, `Manrope + Berkeley Mono`
- Good accents: one disciplined brand family plus neutral greys

## Data Desk

- Tight spacing, small type, disciplined color use
- Emphasis on labels, rankings, and interpretation
- Best for scorecards, audits, and market snapshots
- Good type pairings: `IBM Plex Sans + IBM Plex Mono`, `Public Sans + Recursive Mono`
- Good accents: amber + emerald, teal + slate

## Explicitly avoid

- purple or indigo default accents such as `#8b5cf6`, `#7c3aed`, `#a78bfa`
- Inter, Roboto, Arial, Helvetica, or system-ui as the only primary type choice
- glassmorphism as the main idea
- neon dashboard aesthetics
- cyan-magenta-pink combinations
- gradient text headlines
- animated glowing box shadows
- decorative motion that obscures reading
- uncommitted palettes that feel like a theme picker, not a design choice

## Slop Test

If any answer is "yes", redesign before shipping:

1. Could this page be mistaken for a default SaaS landing page?
2. Are the headline font, accent color, and background pattern all generic?
3. Did the layout rely on one repeated card treatment with no hierarchy shifts?
4. Are the most important sections visually indistinguishable from the least important ones?
5. Did motion get added without making scan order or state clearer?
