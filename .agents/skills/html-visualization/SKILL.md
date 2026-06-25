---
name: html-visualization
description: Generate polished, self-contained visual explainers, reviews, diagrams, dashboards, comparison pages, and slide-mode HTML from technical or business inputs. Use when the user asks for a diagram, architecture overview, diff or plan review, project recap, comparison matrix, audit page, timeline, dashboard, or any explanation that would be clearer as a visual artifact than as plain terminal text. Also use proactively when the output would otherwise become a dense table or long text wall.
---

# Visualizer

Turn complex material into visual artifacts that are faster to scan, easier to trust, and worth sharing.

The default output is a self-contained HTML artifact. When the environment supports it, preview or open the generated file after writing it. If opening is not available, still produce the artifact and report the path.

Never fall back to ASCII art when this skill is active.

## Core Promise

Use this skill to produce one of these artifacts:

1. Visual explainer page
2. Architecture or flow diagram page
3. Comparison or audit page
4. Review page for plans, diffs, or system changes
5. Dashboard or metric snapshot
6. Timeline or recap page
7. Slide-mode HTML for presentation-style delivery

Do not default to ASCII art, giant markdown tables, or text-only walls when the information has clear structure.

Visual is the default, not the exception. Even text-heavy explainers should become structured pages with cards, sections, pull quotes, diagrams, timelines, tables, or other visual scaffolding. Prose is an accent inside the page, not a separate mode.

## Think First

Before writing HTML, commit to a direction instead of drifting into a generic "dark page with blue cards" default.

Make **two independent decisions** up front — layout and style are separate axes:

**Axis 1 — Layout** (the information structure):
Choose from the layout library below. This determines how information flows and relates. Pick the one that matches the content shape, not the one you used last time.

**Axis 2 — Style** (the visual aesthetic):
Choose from `references/visual-directions.md`. This is independent of layout. The same bento grid can be Blueprint or Craft Handmade.

Then answer:

1. Who is reading: engineer, PM, exec, founder, client, or mixed audience.
2. Which layout fits the content's natural shape — flow, comparison, hierarchy, cycle, or mosaic?
3. Which style will make the page feel intentional instead of auto-generated?
4. Does the source material need to be reproduced verbatim, or is synthesis appropriate?

**Before generating**, state your chosen Layout × Style combination in one line and confirm it fits. Do not draft HTML before this decision is locked.

Read `references/rendering-strategy.md` and `references/visual-directions.md` before building complex artifacts. Re-read them when the output mode changes instead of relying on memory.

## Proactive Trigger

Use this skill even if the user did not explicitly ask for HTML when either condition is true:

- The output would include a table with 4 or more rows.
- The output would include 3 or more columns.
- The explanation depends on relationships, flow, hierarchy, chronology, or side-by-side comparison.
- A visual recap would reduce ambiguity or review time.

You can still include a concise chat summary, but the primary artifact should be the HTML output.

## Inputs To Collect

Gather only the inputs that materially change the artifact:

- Source material:
  - Notes, plans, code diffs, architecture context, metrics, audits, docs, or transcripts.
- Artifact goal:
  - Explain, review, compare, recap, pitch, audit, or present.
- Audience:
  - Engineer, executive, PM, founder, operator, client, or mixed audience.
- Constraints:
  - Timebox, tone, must-include sections, must-avoid claims, branding, or output path.
- Delivery mode:
  - Browser page, report, shareable handoff, or slide-mode.

If key context is missing, ask 2 to 4 targeted questions. Do not run a long survey.

## Layout Library

These are the available structural patterns. Match the layout to the shape of the content, not to a generic default.

### Core Layouts (output-mode level)

| Layout | Best for |
|---|---|
| `explainer` | concept walkthrough, architecture overview, mental model |
| `review` | diff, plan review, fact check, requirement coverage |
| `comparison` | tool evals, before/after, option tradeoffs |
| `dashboard` | KPI snapshot, funnel, health check |
| `timeline` | incident recap, release narrative, milestone plan |
| `slide-mode` | team readout, investor walk-through |

### Extended Layouts (use these to avoid the same flat card default)

| Layout | Shape | Best for |
|---|---|---|
| `bento-grid` | Asymmetric mosaic of varied-size tiles | Multi-topic overviews, feature summaries — **default for overviews** |
| `hub-spoke` | Central concept with radiating details | Single core idea with supporting context, product architecture |
| `iceberg` | Top surface vs. hidden depth | What users see vs. what's underneath, risk surface |
| `bridge` | Problem on left, solution on right | Pitch decks, proposal pages, before/after |
| `jigsaw` | Interconnected pieces that form a whole | Systems where every part depends on the others |
| `periodic-table` | Grid of named, categorized cells | Feature catalogs, API surface, team directory, taxonomy |
| `circular-flow` | Continuous cycle with labeled stages | Feedback loops, recurring processes, product lifecycle |
| `winding-roadmap` | Journey with milestone waypoints | Product roadmaps, growth stages, learning paths |
| `dense-modules` | High-density tightly packed information blocks | Reference guides, cheatsheets, full capability maps |

When in doubt, start with `bento-grid` for overviews and `bridge` for proposals. Use `dense-modules` only when the content is truly reference-grade.

## Output Modes

Choose the narrowest mode that fits the job.

### 1. Explainer

Use for:

- Concept walkthroughs
- Architecture overviews
- Mental model pages
- Project recaps

Default structure:

1. Title and framing
2. System or concept overview
3. Key components or phases
4. Risks, edge cases, or caveats
5. Recommended next steps

### 2. Review

Use for:

- Diff review
- Plan review
- Fact check against code or docs
- Requirement coverage

Default structure:

1. Executive summary
2. What changed or what was proposed
3. Strengths and confirmed matches
4. Risks, gaps, or regressions
5. Recommendation

### 3. Comparison

Use for:

- Tool evaluations
- Requirement matrices
- Before vs after views
- Option tradeoff pages

Default structure:

1. Decision frame
2. Comparison matrix
3. Critical deltas
4. Recommendation with rationale

### 4. Dashboard

Use for:

- KPI snapshots
- Funnel analysis
- Status rollups
- Health checks

Default structure:

1. Headline metrics
2. Trend or segmentation view
3. Interpretation
4. Risks and actions

### 5. Timeline

Use for:

- Incident recaps
- Release narratives
- Milestone plans
- Project history

Default structure:

1. Context
2. Timeline events
3. Inflection points
4. Lessons and next actions

### 6. Slide-Mode

Use for:

- Presentation-style delivery
- Team readouts
- Investor or client walkthroughs

Keep each slide focused on one idea. If the user needs a full presentation system with controls, speaker mode, or remote navigation, hand off to `code-slides`.

## Rendering Strategy

Choose the rendering method deliberately. Read `references/rendering-strategy.md` before generating complex artifacts.

General rules:

- Use Mermaid for topology, flow, state, and sequence relationships.
- Use HTML tables for comparisons, audits, and matrices.
- Use CSS timelines for chronological narratives.
- Use CSS Grid for dashboards, cards, and architecture summaries with rich annotations.
- Use charts only when the numbers materially benefit from visual encoding.
- Prefer hybrid pages over one giant diagram when there is a lot of explanatory text.
- For text-heavy architecture overviews or explainers, start from `templates/explainer.html`.
- For reviews, audits, and comparisons, start from `templates/review.html`.
- For slide-mode artifacts, start from `templates/slide-mode.html`.

## Visual Direction

Pick a strong direction and commit to it. Read `references/visual-directions.md`.

Preferred directions:

- Blueprint
- Editorial
- Paper Ink
- Monochrome Terminal
- Product Brief
- Data Desk

Avoid generic defaults:

- Purple-on-white startup gradients
- Neon cyberpunk dashboards
- Inter plus indigo plus glassmorphism by reflex
- Decorative motion without information value
- Gradient text headlines
- Generic "AI cards on a dark canvas" layouts with no real hierarchy
- Three consecutive sections or slides with the same centered composition

## Artifact Requirements

Every output should:

- Be self-contained HTML unless the user explicitly asks for another format.
- Have a clear title, framing sentence, and visible section structure.
- Use typography and spacing that improve scan speed.
- Make the recommendation or takeaway obvious.
- Handle mobile and desktop reasonably.
- Avoid internal scroll traps where possible.
- Use typography, palette, and spacing that feel chosen, not defaulted.
- Vary visual weight across sections so the key takeaway dominates the first viewport.

**Data fidelity:** Reproduce source material faithfully. Do not summarize, rephrase, or omit data unless the user explicitly asks for synthesis. Design aesthetics are secondary to accuracy. When in doubt, preserve the original wording and numbers.

## Image Asset Strategy

When the visual artifact needs imagery, use a deliberate source plan instead of dropping in arbitrary placeholders.

Supported paths:

1. Existing external image URLs already present in the repo
2. Existing local repo images
3. AI-generated images created during the task
4. Code-as-image product visuals
5. Mixed compositions that combine multiple source types

Decision rules:

1. Reuse stable external URLs when the repo already references the exact asset.
2. Local repo images are acceptable, but if the artifact should be portable or deployed, prefer promoting them to a stable hosted URL or project public path.
3. Prefer code-as-image for product dashboards, flows, terminal states, and UI-heavy scenes.
4. Use AI generation for missing backgrounds, supporting illustrations, or atmosphere.
5. Combine generated backgrounds with coded product foregrounds when that creates a clearer story.

Read `references/image-sourcing.md` before implementing image-heavy artifacts.

For pages with 4 or more sections:

- Add a sticky or compact table of contents.

For diagrams:

- Add zoom-friendly containment and enough label contrast.

For comparisons and audits:

- Do not dump raw markdown tables into chat if the HTML page is the main deliverable.

## Workflow

1. Analyze the source material — identify its natural shape (flow, comparison, hierarchy, cycle, mosaic).
2. Choose audience and information density.
3. **Propose Layout × Style** — state the chosen layout from the Layout Library and the chosen visual direction from `references/visual-directions.md` in one line before generating. Confirm this fits before proceeding.
4. Choose the rendering strategy from `references/rendering-strategy.md`.
5. Decide the image source plan when the artifact needs imagery.
6. Draft the information architecture before styling.
7. Start from the closest template and then customize aggressively.
8. Generate the self-contained HTML artifact.
9. Verify that the page is readable, scannable, and accurate — run the Slop Test.
10. Write the file to a predictable location and report the path.

## Reusable Resources

### scripts/

- `scaffold_visualizer.py`: Generate a strong starter HTML artifact for explainer, review, or slide-mode pages.

### references/

- `rendering-strategy.md`: Map content types to the right rendering approach.
- `visual-directions.md`: Visual systems, typography and palette guidance, and anti-patterns.
- `image-sourcing.md`: when to reuse, host, generate, or code imagery.
- `output-checklist.md`: Final QA checklist before delivery.

### templates/

- `templates/explainer.html`: Starter shell for explainers and architecture pages.
- `templates/review.html`: Starter shell for audits, plan reviews, and comparisons.
- `templates/slide-mode.html`: Starter shell for presentation-style output.

## Related Skills

- Use `code-slides` when the user needs a full presentation system rather than a single visual artifact.
- Use `quality-assurance` or `agentic-development` first when the hard part is the underlying technical review, then use `visualizer` to present the result.
- Use `code-documentation` when the primary output should be written documentation rather than a visual page.
