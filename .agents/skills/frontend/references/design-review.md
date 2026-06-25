# Design Review — Live Site Audit and Fix

An 11-phase workflow for auditing a running site with a designer's eye, fixing issues in source code with atomic commits, and verifying results with before/after screenshots.

Use when asked to "audit the design", "visual QA", "check if it looks good", or "design polish" on a live or locally-running site. Distinct from `design-critique.md` (Figma/mockup feedback) and `web-design-guidelines.md` (code-level guidelines check). This workflow operates on a running site, takes screenshots, fixes source, and commits each fix.

---

## Setup

Parse the user's request for these parameters:

| Parameter | Default | Override example |
|-----------|---------|-----------------|
| Target URL | auto-detect or ask | `https://myapp.com`, `http://localhost:3000` |
| Scope | Full site | `Focus on settings page`, `Just homepage` |
| Depth | Standard (5–8 pages) | `--quick` (homepage + 2), `--deep` (10–15 pages) |
| Auth | None | `Sign in as user@example.com` |

**If no URL given and on a feature branch:** Enter diff-aware mode — map changed files to their routes and audit only those pages.

**If no URL given and on main:** Ask the user for a URL before proceeding.

**Check for DESIGN.md:** Look for `DESIGN.md` or `design-system.md` in the repo root. If found, read it — all judgments must be calibrated against it. Deviations from the stated design system are higher severity. If not found, use universal design principles and offer to create one.

**Require a clean working tree:** Run `git status --porcelain`. If dirty, stop and ask the user to commit, stash, or abort before proceeding. Each design fix must get its own atomic commit.

**Create output directories:**
```bash
mkdir -p .gstack/design-reports/screenshots
```

---

## Modes

- **Full (default):** 5–8 pages, full checklist, responsive screenshots
- **Quick (`--quick`):** Homepage + 2 pages
- **Deep (`--deep`):** 10–15 pages
- **Diff-aware:** Auto on feature branches — maps changed files to routes and audits only those
- **Regression:** Compares final scores against `design-baseline.json` from a previous run

---

## Phase 1: First Impression

Take a full-viewport screenshot of the landing page. Write a structured critique:
- What does the site communicate in the first 5 seconds?
- What draws the eye first?
- What is the eye-flow?
- One-word verdict on visual quality.

---

## Phase 2: Design System Extraction

Via JavaScript in the browser, extract:
- Font families in use
- Color palette (distinct values)
- Heading hierarchy (h1–h6 sizes)
- Touch target audit (interactive elements < 44px flagged)
- Page weight and performance baseline

Offer to write a `DESIGN.md` based on the inferred system. Do not write it unless the user accepts.

---

## Phase 3: Page-by-Page Visual Audit

Ten-category checklist (~80 items total). For each page in scope:

### 1. Visual Hierarchy and Composition (8 items)
- Clear primary call-to-action
- Visual weight guides eye to the right element
- Sufficient whitespace between sections
- No competing focal points
- Content grouped logically
- Grid alignment consistent
- Consistent page margins
- No orphaned elements

### 2. Typography (15 items)
- Heading scale is clear and consistent
- Body text is legible (min 16px, sufficient contrast)
- Line height appropriate (1.4–1.6 for body)
- Line length in range (50–75 characters)
- No more than 2–3 typefaces
- Font weights used meaningfully
- Headings not in all-caps unless intentional
- No text over images without sufficient contrast
- Consistent text alignment (left-align body copy)
- No orphaned words at end of lines (use `text-balance`)
- Numeric values use tabular figures where appropriate
- Consistent capitalization style per text role
- No decorative fonts for body text
- Letter-spacing not applied to body text
- No justified text in flowing copy

### 3. Color and Contrast (10 items)
- WCAG AA contrast for all text (4.5:1 body, 3:1 large)
- One primary accent color, used consistently
- Semantic colors (error red, success green) used correctly
- No rainbow accents or color scatter
- Dark/light mode both handled if both exist
- Brand colors applied to the right elements
- No unsolicited gradients or glassmorphism effects
- Backgrounds are neutral, not competing with content
- Interactive elements are visually distinct
- Disabled states are clearly muted

### 4. Spacing and Layout (12 items)
- Consistent spacing scale (4/8/16/24/32/48px rhythm)
- Section padding is proportional
- Card padding is generous, not cramped
- No elements touching the viewport edge
- Form fields have sufficient internal padding
- Consistent gap between related items
- Content columns have max-width set
- Images are not stretched or distorted
- Tables have readable cell padding
- List items have correct vertical rhythm
- Modals/drawers have appropriate padding
- Mobile breakpoints have adequate padding

### 5. Interaction States (10 items)
- All interactive elements have hover states
- Focus states are visible (keyboard navigation)
- Active/pressed states exist for buttons
- Disabled states are distinct from enabled
- Loading states exist for async actions
- Error states are communicated clearly
- Success feedback is present for form submissions
- Destructive actions require confirmation
- Skeleton screens or placeholders on data load
- Empty states have content and a call to action

### 6. Responsive Design (8 items)
- Layout reflows correctly at 375px, 768px, 1280px
- No horizontal scroll on mobile
- Touch targets are at least 44×44px
- Navigation collapses gracefully on mobile
- Images scale correctly at all widths
- Tables have mobile alternatives (scroll, stack)
- Font sizes do not shrink below 14px on mobile
- Fixed elements do not overlap content on small screens

### 7. Motion and Animation (6 items)
- Transitions are < 300ms for micro-interactions
- Page transitions are smooth, not jarring
- Animations respect `prefers-reduced-motion`
- No looping animations that cannot be paused
- Hover effects are subtle, not distracting
- No layout shift caused by animations

### 8. Content and Microcopy (8 items)
- Error messages are specific and actionable
- Labels are consistent (not "Submit" on one button and "Save" on another)
- Placeholder text is not used as labels
- Empty states have helpful messages
- Loading states have contextual copy
- Tooltips are consistent in style
- Date/number formats are consistent
- No lorem ipsum or placeholder content in production

### 9. AI Slop Detection (10 anti-patterns)
Downgrade the AI Slop Score for each of these found:
- Generic gradient hero with large centered headline and two buttons
- Stock photo or AI image used as hero
- Icon grid with "Our Features" heading
- Testimonial carousel with star ratings and avatar circles
- "Trusted by 10,000+ customers" social proof line
- FAQ accordion with generic questions
- Pricing table with three plans and checkmarks
- Footer with four columns of generic links
- "Ready to get started? Sign up free" CTA section
- Animations triggered on every scroll event with no variance

### 10. Performance as Design (6 items)
- No layout shift (CLS visible during load)
- Images load progressively or with skeleton
- Fonts do not cause FOUT (flash of unstyled text)
- Interactions respond within 100ms
- No spinner visible for < 300ms operations (just show the result)
- Page feels fast on a mid-range device

---

## Phase 4: Interaction Flow Review

Walk 2–3 primary user flows end to end. Evaluate:
- Response feel: does the site feel fast or sluggish?
- Transition quality: are state changes smooth?
- Feedback clarity: does the user know what happened?
- Form polish: tab order, validation timing, error placement

---

## Phase 5: Cross-Page Consistency

- Navigation bar is identical across all pages
- Footer content is consistent
- Components reused across pages look the same
- Tone of copy is consistent
- Spacing rhythm is maintained across pages

---

## Phase 6: Compile Audit Report and Baseline

Compute dual headline scores:

- **Design Score (A–F):** Weighted average across the 10 categories. A = 90–100%, B = 80–89%, C = 70–79%, D = 60–69%, F < 60%.
- **AI Slop Score (A–F):** A = 0–1 anti-patterns, B = 2–3, C = 4–5, D = 6–7, F = 8–10.

Save baseline to `.gstack/design-reports/design-baseline.json`.

---

## Outside Voices (optional parallel)

When available, send source code to a second model or subagent independently and tag findings `[subagent]`. Synthesize a litmus scorecard comparing the two reviews. Cross-model agreement indicates high-confidence findings; disagreement warrants a closer look before fixing.

---

## Phase 7: Triage

Sort all findings by impact:
- **High:** Fix first. Affects first impression and user trust.
- **Medium:** Fix next. Reduce polish, felt subconsciously.
- **Polish:** Fix if time allows. Separate good from great.

Mark findings that cannot be fixed from source code (third-party widgets, copy needing team input) as **deferred**.

---

## Phase 8: Fix Loop

For each fixable finding, in impact order:

### 8a. Locate source
Search for CSS classes, component names, and style files responsible for the issue. Use Glob and Grep to identify the exact file.

### 8b. Fix
Make the **minimal fix** — smallest change that resolves the issue. Prefer CSS/styling changes over structural component changes. Do not refactor surrounding code or add unrelated improvements.

### 8c. Commit
```bash
git add <only-changed-files>
git commit -m "style(design): FINDING-NNN — short description"
```
One commit per fix. Never bundle multiple fixes.

### 8d. Re-test
Navigate to the affected page. Take a before/after screenshot pair. Check for console errors.

### 8e. Classify
- **verified:** Fix confirmed, no regressions
- **best-effort:** Fix applied but cannot fully verify (requires specific browser state)
- **reverted:** Regression detected → `git revert HEAD` → mark as deferred

### 8e.5. Regression tests
Design fixes are typically CSS-only — skip regression test generation. Only write a regression test when the fix involved JavaScript behavior (broken dropdowns, animation failures, conditional rendering). Commit format: `test(design): regression test for FINDING-NNN`.

### 8f. Self-regulation

Every 5 fixes (or after any revert), compute the design-fix risk level:

```
DESIGN-FIX RISK:
  Start at 0%
  Each revert:                         +15%
  Each CSS-only change:                +0%   (styling only — safe)
  Each JSX/TSX/component file change:  +5%   per file
  After fix 10:                        +1%   per additional fix
  Touching unrelated files:            +20%
```

**If risk > 20%:** Stop, show the user what was accomplished, and ask whether to continue.

**Hard cap: 30 fixes.** After 30 fixes, stop regardless of remaining findings.

---

## Phase 9: Final Audit

Re-run the audit on all affected pages. Compute final scores. If final scores are **worse** than baseline, warn prominently — something regressed.

---

## Phase 10: Report

Write the report to `.gstack/design-reports/design-audit-{domain}-{YYYY-MM-DD}.md`.

Include per-finding:
- Fix Status: verified / best-effort / reverted / deferred
- Commit SHA (if fixed)
- Files changed
- Before/after screenshots

Summary section:
- Total findings
- Fixes applied (verified: X, best-effort: Y, reverted: Z)
- Deferred findings
- Design score delta: baseline → final
- AI Slop score delta: baseline → final
- One-line PR summary: "Design review found N issues, fixed M. Design score X → Y, AI slop score X → Y."

---

## Phase 11: TODOS.md Update

If the repo has a `TODOS.md`:
- **New deferred findings:** Add as TODOs with impact level, category, and description
- **Fixed findings that were in TODOS.md:** Annotate with "Fixed by design review on {branch}, {date}"

---

## Hard Rules

1. Clean working tree required before starting. Commit, stash, or abort if dirty.
2. One commit per fix. Never bundle multiple design fixes.
3. Only write regression tests in Phase 8e.5 for JS behavior changes. Never modify existing tests.
4. Revert immediately on regression.
5. Self-regulate with the risk heuristic. Hard cap at 30 fixes.
6. Prefer CSS-first changes. Structural component changes only when CSS cannot solve it.
7. Do not write DESIGN.md unless the user accepts the offer in Phase 2.
