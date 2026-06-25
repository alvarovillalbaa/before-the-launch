# Pre-Shipping Polish

Final quality pass before shipping. Fixes alignment, spacing, consistency, and detail issues that separate good from great.

## Mandatory Preparation

Use `frontend-development.md` for design principles and anti-patterns, and gather context before starting:
- Quality bar (MVP vs flagship feature)
- When does it ship? (How much time for polish?)
- Are there known issues to preserve? (mark with TODOs)

**CRITICAL**: Polish is the last step, not the first. Do not polish work that is not functionally complete.

## Pre-Polish Assessment

1. **Review completeness**: Is it functionally complete? Are there known issues to preserve?
2. **Identify polish areas**: Visual inconsistencies, spacing and alignment issues, interaction state gaps, copy inconsistencies, edge cases and error states, loading and transition smoothness.

## Polish Dimensions

Work through these dimensions methodically.

### Visual Alignment & Spacing

- Pixel-perfect alignment: everything lines up to grid.
- Consistent spacing: all gaps use the spacing scale (no arbitrary values like `13px`).
- Optical alignment: adjust for visual weight (icons may need offset for optical centering).
- Responsive consistency: spacing and alignment work at all breakpoints.
- Grid adherence: elements snap to baseline grid.

Checks: grid overlay, browser inspector, multiple viewport sizes, elements that "feel" off.

### Typography Refinement

- Hierarchy consistency: same elements use same sizes/weights throughout.
- Line length: 45–75 characters for body text.
- Line height: appropriate for font size and context.
- Widows & orphans: no single words on last line.
- Kerning: adjust letter spacing where needed (especially headlines).
- Font loading: no FOUT/FOIT flashes.

### Color & Contrast

- Contrast ratios: all text meets WCAG AA standards.
- Consistent token usage: no hard-coded colors — use design tokens.
- Theme consistency: works in all theme variants.
- Color meaning: same colors mean same things throughout.
- Accessible focus: focus indicators visible with sufficient contrast.
- Tinted neutrals: no pure gray or pure black — add subtle color tint (0.01 chroma).
- Gray on color: never put gray text on colored backgrounds — use a shade of that color or transparency.

### Interaction States

Every interactive element needs all states:

| State | Description |
|-------|-------------|
| Default | Resting state |
| Hover | Subtle feedback (color, scale, shadow) |
| Focus | Keyboard focus indicator (never remove without replacement) |
| Active | Click/tap feedback |
| Disabled | Clearly non-interactive |
| Loading | Async action feedback |
| Error | Validation or error state |
| Success | Successful completion |

Missing states create confusion and broken experiences.

### Micro-interactions & Transitions

- Smooth transitions: all state changes animated appropriately (150–300ms).
- Consistent easing: use `ease-out-quart`/`quint`/`expo` for natural deceleration. Never bounce or elastic — they feel dated.
- No jank: 60fps animations, only animate `transform` and `opacity`.
- Appropriate motion: motion serves purpose, not decoration.
- Reduced motion: respects `prefers-reduced-motion`.

### Content & Copy

- Consistent terminology: same things called same names throughout.
- Consistent capitalization: Title Case vs Sentence case applied consistently.
- Grammar & spelling: no typos.
- Appropriate length: not too wordy, not too terse.
- Punctuation consistency: periods on sentences, not on labels (unless all labels have them).

### Icons & Images

- Consistent style: all icons from same family or matching style.
- Appropriate sizing: icons sized consistently for context.
- Proper alignment: icons align with adjacent text optically.
- Alt text: all images have descriptive alt text.
- Loading states: images don't cause layout shift; proper aspect ratios.
- Retina support: 2x assets for high-DPI screens.

### Forms & Inputs

- Label consistency: all inputs properly labeled.
- Required indicators: clear and consistent.
- Error messages: helpful and consistent.
- Tab order: logical keyboard navigation.
- Auto-focus: appropriate (don't overuse).
- Validation timing: consistent (on blur vs on submit).

### Edge Cases & Error States

- Loading states: all async actions have loading feedback.
- Empty states: helpful empty states, not just blank space.
- Error states: clear error messages with recovery paths.
- Success states: confirmation of successful actions.
- Long content: handles very long names, descriptions, etc.
- No content: handles missing data gracefully.

### Responsiveness

- All breakpoints: test mobile, tablet, desktop.
- Touch targets: 44×44px minimum on touch devices.
- Readable text: no text smaller than 14px on mobile.
- No horizontal scroll: content fits viewport.
- Appropriate reflow: content adapts logically.

### Performance

- Fast initial load: optimize critical path.
- No layout shift: elements don't jump after load (CLS).
- Smooth interactions: no lag or jank.
- Optimized images: appropriate formats and sizes.
- Lazy loading: off-screen content loads lazily.

### Code Quality

- Remove console logs: no debug logging in production.
- Remove commented code: clean up dead code.
- Remove unused imports: clean up unused dependencies.
- Consistent naming: variables and functions follow conventions.
- Type safety: no TypeScript `any` or ignored errors.
- Accessibility: proper ARIA labels and semantic HTML.

## Polish Checklist

- [ ] Visual alignment perfect at all breakpoints
- [ ] Spacing uses design tokens consistently
- [ ] Typography hierarchy consistent
- [ ] All interactive states implemented
- [ ] All transitions smooth (60fps)
- [ ] Copy is consistent and polished
- [ ] Icons are consistent and properly sized
- [ ] All forms properly labeled and validated
- [ ] Error states are helpful
- [ ] Loading states are clear
- [ ] Empty states are welcoming
- [ ] Touch targets are 44×44px minimum
- [ ] Contrast ratios meet WCAG AA
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] No console errors or warnings
- [ ] No layout shift on load
- [ ] Works in all supported browsers
- [ ] Respects reduced motion preference
- [ ] Code is clean (no TODOs, console.logs, commented code)

## Final Verification

Before marking as done:

- **Use it yourself**: actually interact with the feature.
- **Test on real devices**: not just browser DevTools.
- **Ask someone else to review**: fresh eyes catch things.
- **Compare to design**: match intended design.
- **Check all states**: don't just test the happy path.

## NEVER

- Polish before it's functionally complete.
- Spend hours on polish if it ships in 30 minutes (triage).
- Introduce bugs while polishing (test thoroughly).
- Ignore systematic issues (if spacing is off everywhere, fix the system).
- Perfect one thing while leaving others rough (consistent quality level).
