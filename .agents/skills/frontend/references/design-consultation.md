# Design Consultation

Use this workflow when the user asks for a design system, brand guidelines, "create DESIGN.md", or is starting a new project with no existing visual direction. This is a full design system creation flow — not a critique of an existing design (use `design-critique.md`) and not a design system audit (use `design-system.md`).

## Six-Phase Workflow

### Phase 0 — Pre-checks

- Check for an existing `DESIGN.md` in the repo root. If found, read it and ask whether to extend or replace it.
- Gather codebase context: README, `package.json`, directory structure, any existing `CLAUDE.md` design notes.
- Note whether visual research tools (browse/WebSearch) are available.

### Phase 1 — Product Context

Ask a single comprehensive question covering:
- What the product does and who uses it
- Industry / domain and project type (SaaS, consumer app, internal tool, landing page, etc.)
- Existing constraints (existing brand colors, logo, assets)
- Whether the user wants competitive research before the proposal

Never ask piecemeal. One question, all context.

### Phase 2 — Research (conditional)

Only if the user requested competitive research:

1. Use `WebSearch` to study 5–10 competing or comparable products.
2. Use the browse tool for screenshots/snapshots if available; degrade gracefully if not.
3. Synthesize into three layers:
   - **Tried-and-true** — category conventions users already expect
   - **Emerging trends** — directions the space is moving toward
   - **First-principles departures** — where the product can earn a distinct identity

Present synthesis as context before the proposal, not as a menu of options.

### Phase 3 — Complete Proposal

Present a full, opinionated design system with **SAFE / RISK breakdown**:

- **SAFE** choices match category conventions — lower friction, higher familiarity
- **RISK** choices create distinctive identity — higher reward, requires rationale

Cover all six system dimensions with explicit rationale for each:

| Dimension | What to specify |
|-----------|----------------|
| Aesthetic | Named direction (see catalog below), 2-sentence rationale |
| Typography | Primary display font, body font, mono font, size scale anchor |
| Color | Primary, surface/background, text/ink, accent/semantic, dark-mode variants |
| Spacing | Base unit, scale multiplier, component density (compact / default / spacious) |
| Layout | Max content width, sidebar widths, grid columns, gutters |
| Motion | Default duration, easing curve, reduced-motion fallback |

Every choice must explain how it reinforces the others. Coherence over individual optimization.

### Phase 4 — Drill-downs

Support deep exploration of any dimension when the user requests adjustments:
- Fonts: present 3–5 specific candidates with visual analogues and rationale
- Colors: generate full palette with hex values and contrast ratios
- Aesthetic: clarify the direction with reference products and "sounds like / not like" framing

Accept user adjustments without blocking. Nudge on coherence without veto.

### Phase 5 — Interactive HTML Preview

Generate a self-contained HTML preview page (browser-openable, single file) that shows:
- Font specimens in all proposed roles (display, body, mono)
- Color swatches with hex values and usage labels
- 2–3 realistic product mockups (not generic UI kit screenshots)
- Light / dark mode toggle
- Responsive layout

The preview must demonstrate taste. It is a design artifact, not a reference doc. Avoid placeholder text, generic card grids, and purple gradients.

### Phase 6 — DESIGN.md and CLAUDE.md

Write `DESIGN.md` to the repo root. Content:

```markdown
# Design System

## Context
[Product purpose, audience, key constraints]

## Aesthetic Direction
[Named direction + rationale]

## Typography
[Font names, roles, size scale, line-height]

## Color
[Palette with hex values, semantic names, dark-mode variants]

## Spacing
[Base unit, scale, density]

## Layout
[Max widths, grid, gutters]

## Motion
[Duration, easing, reduced-motion policy]

## Decisions Log
[SAFE/RISK rationale table from Phase 3]
```

Then update `CLAUDE.md` (or create it if absent) with a design adherence reminder:

```
Read DESIGN.md before making visual changes. Flag deviations in QA mode.
```

## Key Principles

- **Propose, don't present menus.** Make opinionated recommendations grounded in product context. Presenting five equal options signals you have no opinion and forces the user to do the design work.
- **Rationale for every choice.** Explain why each decision reinforces the others.
- **Coherence over individual optimization.** A mismatched system that hangs together beats individually perfect choices that clash.
- **Conversational posture.** Engage as a design partner. Accept user adjustments without re-running the full workflow.
- **No AI slop.** Purple gradients, centered-everything monotony, icon grids, bubbly borders, and overused fonts are disqualifying.

## Design Knowledge Reference

### Aesthetic Direction Catalog

| Direction | Character | Good for |
|-----------|-----------|----------|
| Brutally Minimal | Maximum whitespace, constrained palette, near-zero decoration | Productivity tools, developer tools |
| Maximalist Chaos | Rich texture, layered elements, high contrast | Creative platforms, entertainment |
| Retro-Futuristic | References to past predictions of the future | Crypto, gaming, speculative products |
| Luxury / Refined | Restrained palette, premium typography, micro-detail | Finance, fashion, high-end SaaS |
| Playful / Toy-like | Rounded corners, vibrant palette, expressive motion | Consumer apps, children's products |
| Editorial / Magazine | Strong typographic hierarchy, structured grid | Publishing, content-first products |
| Brutalist / Raw | Exposed structure, raw HTML aesthetics, high contrast | Art, experimental, cultural institutions |
| Art Deco | Geometric ornament, symmetry, gold/black palette | Events, hospitality, luxury fashion |
| Organic / Natural | Earthy palette, flowing shapes, texture | Wellness, food, sustainability |
| Industrial / Utilitarian | Monospaced fonts, grid-heavy, functional density | Data tools, hardware, B2B |

### Typography

**Recommended display fonts:**
Satoshi, General Sans, Instrument Serif, Fraunces, Clash Grotesk, DM Sans, Plus Jakarta Sans

**Recommended monospace fonts:**
JetBrains Mono, Geist Mono, Berkeley Mono, Fira Code

**Overused — avoid unless intentional:**
Inter, Roboto, Arial, Helvetica, Open Sans, Montserrat, Poppins

**Blacklisted (never use):**
Papyrus, Comic Sans, Impact, Jokerman, Brush Script, Trajan

### Deliverables Checklist

- [ ] Phase 3 proposal: all six dimensions covered with SAFE/RISK rationale
- [ ] Phase 5 preview: font specimens + color swatches + 2–3 mockups + light/dark toggle
- [ ] Phase 6 `DESIGN.md`: written to repo root with decisions log
- [ ] Phase 6 `CLAUDE.md`: updated with design adherence reminder
