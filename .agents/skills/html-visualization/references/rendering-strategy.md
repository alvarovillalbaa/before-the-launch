# Rendering Strategy

Choose the smallest rendering system that communicates the idea cleanly.

If you are about to render a terminal table with 4 or more rows or 3 or more columns, stop and generate HTML instead.

## Use Mermaid for

- flowcharts
- pipelines
- sequence diagrams
- state transitions
- entity relationships
- topology-first architecture

Use Mermaid when the relationships matter more than the prose.

Prefer Mermaid for topology-first diagrams. If each node needs real explanatory copy, metadata, or recommendations, switch to a hybrid page instead of cramming everything into nodes.

## Use CSS Grid or cards for

- architecture summaries with rich component annotations
- project recaps
- executive explainers
- dashboards with mixed metric cards and commentary

Use cards when each node needs meaningful text, metadata, or actions.

For pages with 4 or more sections, add a sticky or compact table of contents.

## Use HTML tables for

- comparisons
- audits
- requirement coverage
- scorecards
- capability matrices

Prefer semantic tables over fake table layouts.

For wide tables:

- wrap them in a horizontal scroll container
- keep headers visually strong
- use status badges instead of plain "yes/no" text when it improves scan speed

## Use timeline layouts for

- incident writeups
- delivery plans
- project history
- milestone recaps

Timelines should emphasize sequence, causal breaks, and decision points.

## Use hybrid pages when

- the diagram alone is too dense
- the page needs both topology and commentary
- the audience includes both technical and non-technical readers

Hybrid pattern:

1. high-level overview
2. diagram or matrix
3. annotated findings
4. recommendation or next steps

## Extended Layout Patterns

Use these for the named layouts in the Layout Library.

### Bento Grid

```css
.bento { display: grid; grid-template-columns: repeat(12, 1fr); gap: 1rem; }
.tile-wide  { grid-column: span 8; }
.tile-narrow { grid-column: span 4; }
.tile-full  { grid-column: span 12; }
.tile-half  { grid-column: span 6; }
```

Vary tile sizes so the most important content occupies a clearly larger cell. Do not make all tiles the same size — equal tiles kill visual hierarchy.

### Hub-Spoke

Render as SVG or CSS absolute-positioned radial layout. Central node: 2× the size of spoke nodes. Connect with `<line>` or CSS border lines. For 5+ spokes, use a circular arrangement with equal angular spacing. Label spokes with brief annotations, not full sentences.

### Iceberg

Two-zone vertical layout: top zone (20–30% height) = "visible" surface with lighter colors and larger type; bottom zone = submerged content with darker, denser presentation. A diagonal or wave divider between zones. Use this to show hidden complexity behind a simple interface.

### Bridge

Three-column layout: left column = problem/before state; middle column = transformation arrow, step, or agent; right column = solution/after state. Each side uses consistent card styling; the middle connector is visually distinct (icon, arrow, or step label). Effective for proposals and pitch artifacts.

### Jigsaw

Puzzle-piece shaped CSS clip-paths or SVG paths that interlock. Each piece = one system component. Color-code by domain or team. Show a "connected state" view (all pieces together) above an "exploded view" below. Use `clip-path: polygon(...)` for each piece.

### Periodic Table

CSS grid with fixed cell size. Each cell: 2–3 lines of text maximum. Use color to encode category (background or top border). Row/column headers are optional but help with large tables. Add a legend. Minimum cell padding: `0.75rem`. Cell size should be consistent.

### Circular Flow

SVG or CSS-based ring of labeled segments. Prefer explicit step numbers. Arrows between steps should curve along the ring, not cut across it. For 4–7 steps: a simple polygon with labeled vertices works. For 8+ steps: use a full circular arc approach.

### Winding Roadmap

Horizontal or diagonal snake path (alternating left-to-right, right-to-left rows). Each milestone is a labeled node on the path. Past milestones: muted. Current: highlighted with a visual indicator. Future: lighter opacity. Works well with a timeline header showing quarters or phases.

### Dense Modules

Two or three tight columns of information blocks. Each block has a label row and a content row. Generous use of horizontal rules and monospace type for data values. Ideal for reference artifacts, not for reading flow — they are scanned, not read.

## Architecture Heuristic

Use this split for architecture-style artifacts:

- Text-heavy architecture: CSS Grid cards plus directional arrows.
- Topology-heavy architecture: Mermaid.
- Complex architecture with both needs: Mermaid overview on top, detailed cards below.

Do not try to force 15+ detailed concepts into one diagram. Split overview from explanation.

## Chart guidance

Add charts only when the data benefits from shape, comparison, or trend detection.

Good cases:

- trend over time
- segmented composition
- rank-ordered comparison

Bad cases:

- one KPI with no context
- tiny datasets where a sentence is clearer
- decorative graphs without a decision attached
