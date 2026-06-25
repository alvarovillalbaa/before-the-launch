# Design Critique

Structured design feedback across the full review lifecycle — from early exploration to final polish.

## When to Use

Invoke this reference when:
- The user shares a Figma URL, screenshot, or design description and asks for feedback
- Reviewing a mockup at any fidelity level (wireframe → pixel-perfect)
- Conducting a design audit alongside a code review
- Responding to prompts like "what do you think of this screen?", "critique this design", or "review this UI"

If a Figma URL is provided, pull the design using the Figma MCP tool. If a file is referenced, read it. Otherwise, ask the user to describe or share the design.

## Context to Gather First

Before critiquing, establish:
- **The design**: Figma URL, screenshot, or description
- **What it is**: product type, user type, platform (web / mobile / desktop)
- **Stage**: exploration, refinement, or final polish — feedback tone and depth differ significantly
- **Focus** (optional): "Focus on mobile" or "Focus on the onboarding flow" narrows the output

## Critique Framework

### 1. First Impression (2 seconds)
- What draws the eye first? Is that the right element?
- What is the emotional reaction?
- Is the purpose immediately clear?

### 2. Usability
- Can the user accomplish their goal?
- Is the navigation intuitive?
- Are interactive elements obvious?
- Are there unnecessary steps or friction points?

### 3. Visual Hierarchy
- Is there a clear reading order?
- Are the right elements emphasized?
- Is whitespace used effectively?
- Is typography creating the right hierarchy?

### 4. Consistency
- Does it follow the design system?
- Are spacing, colors, and typography consistent?
- Do similar elements behave similarly?

### 5. Accessibility
- Color contrast ratios (WCAG AA minimum: 4.5:1 for body text, 3:1 for large text)
- Touch target sizes (minimum 44×44 pt on iOS / 48×48 dp on Android)
- Text readability (minimum 16px body, adequate line height)
- Alternative text for meaningful images

## How to Give Feedback

- **Be specific**: "The CTA competes with the navigation" not "the layout is confusing"
- **Explain why**: Connect feedback to design principles or user needs
- **Suggest alternatives**: Don't just identify problems, propose solutions
- **Acknowledge what works**: Good feedback includes positive observations
- **Match the stage**: Early exploration gets directional feedback; final polish gets precise, detailed notes

## Output Format

```markdown
## Design Critique: [Design Name]

### Overall Impression
[1–2 sentence first reaction — what works, what's the biggest opportunity]

### Usability
| Finding | Severity | Recommendation |
|---------|----------|----------------|
| [Issue] | 🔴 Critical / 🟡 Moderate / 🟢 Minor | [Fix] |

### Visual Hierarchy
- **What draws the eye first**: [Element] — [Is this correct?]
- **Reading flow**: [How does the eye move through the layout?]
- **Emphasis**: [Are the right things emphasized?]

### Consistency
| Element | Issue | Recommendation |
|---------|-------|----------------|
| [Typography/spacing/color] | [Inconsistency] | [Fix] |

### Accessibility
- **Color contrast**: [Pass/fail for key text]
- **Touch targets**: [Adequate size?]
- **Text readability**: [Font size, line height]

### What Works Well
- [Positive observation 1]
- [Positive observation 2]

### Priority Recommendations
1. **[Most impactful change]** — [Why and how]
2. **[Second priority]** — [Why and how]
3. **[Third priority]** — [Why and how]
```

## Integration with Other References

- For hard UI rules (Tailwind, motion, cn, z-index, no unsolicited gradients): see [ui-constraints.md](./ui-constraints.md)
- For animation decisions, interaction polish, before/after review format: see [design-engineering.md](./design-engineering.md)
- For comprehensive UX guidelines (accessibility, forms, navigation, charts, audio): see [ui-ux-guidelines.md](./ui-ux-guidelines.md)
- For final pre-shipping quality pass (all interaction states, copy, edge cases): see [pre-shipping-polish.md](./pre-shipping-polish.md)
- For Web Interface Guidelines compliance audit with file:line findings: see [web-design-guidelines.md](./web-design-guidelines.md)

## With Figma

When a Figma URL is available, use the Figma MCP tool to:
- Pull the design and inspect components, tokens, and layers
- Compare against the existing design system for consistency
- Check component-level spacing and variant usage before writing findings
