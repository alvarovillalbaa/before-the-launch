# UI/UX Guidelines

Comprehensive design and UX rules for web and mobile applications. Covers 10 priority categories: accessibility, touch interactions, performance, style selection, layout, typography and color, animation, forms and feedback, navigation, and charts. Rules are sourced from Apple HIG, Material Design 3, and WCAG 2.1.

Apply this alongside `ui-constraints.md` (Tailwind/React hard rules) and `design-engineering.md` (animation craft depth). Where they conflict, `ui-constraints.md` hard rules take precedence.

## When to Apply

**Must apply when:**
- Designing new pages (landing, dashboard, admin, SaaS, mobile app)
- Creating or refactoring UI components (buttons, modals, forms, tables, charts)
- Choosing color schemes, typography systems, spacing standards, or layout systems
- Reviewing UI code for UX, accessibility, or visual consistency
- Implementing navigation structures, animations, or responsive behavior
- Making product-level design decisions (style, information hierarchy, brand expression)
- Improving perceived quality, clarity, or usability of interfaces
- Adding sound or audio feedback to UI interactions
- Implementing prefetching strategies to reduce perceived navigation latency
- Ordering navigation items, grouping content, handling complexity budgets, or designing completion and success states (Laws of UX)

**Recommended when:**
- UI looks unprofessional but the reason is unclear
- Receiving usability or experience feedback
- Pre-launch UI quality pass
- Aligning cross-platform design (Web / iOS / Android)
- Building design systems or reusable component libraries

**Decision rule:** If the task changes how a feature looks, feels, moves, or is interacted with — apply these guidelines.

## Priority Overview

Use this table to prioritize which category to address first. Columns: key checks are the must-haves; anti-patterns are the most common violations.

| Priority | Category | Impact | Key Checks | Anti-Patterns |
|----------|----------|--------|------------|---------------|
| 1 | Accessibility | CRITICAL | Contrast 4.5:1, alt text, keyboard nav, aria-labels | Removing focus rings, icon-only buttons without labels |
| 2 | Touch & Interaction | CRITICAL | Min size 44×44px, 8px+ spacing, loading feedback | Hover-only interactions, instant 0ms state changes |
| 3 | Performance | HIGH | WebP/AVIF, lazy loading, reserve space (CLS < 0.1) | Layout thrashing, cumulative layout shift |
| 4 | Style Selection | HIGH | Match product type, consistency, SVG icons | Mixing flat + skeuomorphic randomly, emoji as icons |
| 5 | Layout & Responsive | HIGH | Mobile-first breakpoints, viewport meta, no horizontal scroll | Fixed px containers, disable zoom, horizontal scroll |
| 6 | Typography & Color | MEDIUM | Base 16px, line-height 1.5, semantic color tokens | Text < 12px body, gray-on-gray, raw hex in components |
| 7 | Animation | MEDIUM | Duration 150–300ms, motion conveys meaning, spatial continuity | Decorative-only animation, animating width/height, no reduced-motion |
| 8 | Forms & Feedback | MEDIUM | Visible labels, error near field, helper text, progressive disclosure | Placeholder-only labels, errors only at top, overwhelming upfront |
| 9 | Navigation Patterns | HIGH | Predictable back, bottom nav ≤ 5, deep linking | Overloaded nav, broken back behavior, no deep links |
| 10 | Charts & Data | LOW | Legends, tooltips, accessible colors | Relying on color alone, no keyboard access, blank error states |
| 11 | Audio Feedback | MEDIUM | Visual equivalent, user toggle, prefers-reduced-motion, subtle volume | Sound on typing/hover, no disable option, harsh error tones |
| 12 | Predictive Prefetching | MEDIUM | Trajectory > hover, intent-based, hitSlop, touch fallback | Prefetching all visible links, mouse-only strategy |
| 13 | Laws of UX | HIGH | Named psychological principles for ordering, grouping, complexity, and completion | Violating familiar patterns, exposing system complexity, no success states |

---

## 1. Accessibility (CRITICAL)

- **color-contrast** — Minimum 4.5:1 ratio for normal text; 3:1 for large text (WCAG AA).
- **focus-states** — Visible focus rings on all interactive elements (2–4px; Apple HIG, MD).
- **alt-text** — Descriptive alt text on meaningful images; empty `alt=""` on decorative ones.
- **aria-labels** — `aria-label` on icon-only buttons; `accessibilityLabel` in native apps (Apple HIG).
- **keyboard-nav** — Tab order matches visual order; full keyboard support for all interactions.
- **form-labels** — Every input has a visible `<label>` with a matching `for` attribute.
- **skip-links** — "Skip to main content" link for keyboard users at the top of the page.
- **heading-hierarchy** — Sequential h1→h6; never skip a heading level.
- **color-not-only** — Never convey meaning by color alone; always add an icon or text label.
- **dynamic-type** — Support system text scaling; avoid truncation as text grows (Apple Dynamic Type, MD).
- **reduced-motion** — Respect `prefers-reduced-motion`; reduce or disable animations when set.
- **voiceover-sr** — Meaningful `accessibilityLabel`/`accessibilityHint`; logical reading order for VoiceOver and screen readers.
- **escape-routes** — Provide cancel/back in modals and multi-step flows (Apple HIG).
- **keyboard-shortcuts** — Preserve system and accessibility shortcuts; offer keyboard alternatives for drag-and-drop.

---

## 2. Touch & Interaction (CRITICAL)

- **touch-target-size** — Minimum 44×44pt (Apple HIG) / 48×48dp (Material Design); extend hit area beyond visual bounds if needed.
- **touch-spacing** — Minimum 8px gap between touch targets.
- **hover-vs-tap** — Use click/tap for primary interactions; never rely on hover alone.
- **loading-buttons** — Disable button during async operations; show spinner or progress.
- **error-feedback** — Clear error messages placed near the problem element.
- **cursor-pointer** — Add `cursor-pointer` to all clickable elements on web.
- **gesture-conflicts** — Avoid horizontal swipe on main content to prevent scroll conflicts; prefer vertical scroll.
- **tap-delay** — Use `touch-action: manipulation` to eliminate the 300ms tap delay on web.
- **standard-gestures** — Use platform standard gestures consistently; never redefine swipe-back or pinch-zoom.
- **system-gestures** — Never block system gestures (Control Center, back swipe, Android gesture nav).
- **press-feedback** — Visual feedback on press: ripple (MD) or highlight (HIG); scale(0.95–0.97) on tappable cards.
- **haptic-feedback** — Use haptic for confirmations and important actions; avoid overuse (Apple HIG).
- **gesture-alternative** — Never rely on gesture-only interactions; always provide visible controls for critical actions.
- **safe-area-awareness** — Keep primary touch targets away from notch, Dynamic Island, gesture bar, and screen edges.
- **no-precision-required** — Avoid requiring pixel-perfect taps on small icons or thin edges.
- **swipe-clarity** — Swipe actions must show a clear affordance or hint (chevron, label, or tutorial).
- **drag-threshold** — Use a movement threshold before starting drag to avoid accidental drags.

---

## 3. Performance (HIGH)

- **image-optimization** — Use WebP/AVIF, responsive images (`srcset`/`sizes`), lazy-load non-critical assets.
- **image-dimension** — Declare `width`/`height` or use `aspect-ratio` to prevent layout shift (Core Web Vitals: CLS).
- **font-loading** — Use `font-display: swap` or `optional` to avoid FOIT; reserve space to reduce layout shift.
- **font-preload** — Preload only critical fonts; do not preload every font variant.
- **critical-css** — Prioritize above-the-fold CSS (inline critical CSS or load it early).
- **lazy-loading** — Lazy-load non-hero components via dynamic import or route-level splitting.
- **bundle-splitting** — Split code by route/feature (React Suspense / Next.js `dynamic`) to reduce initial load and TTI.
- **third-party-scripts** — Load third-party scripts `async`/`defer`; audit and remove unnecessary ones.
- **reduce-reflows** — Avoid frequent layout reads/writes; batch DOM reads then writes.
- **content-jumping** — Reserve space for async content to avoid layout jumps (CLS).
- **virtualize-lists** — Virtualize lists with 50+ items to improve memory efficiency and scroll performance.
- **main-thread-budget** — Keep per-frame work under ~16ms for 60fps; move heavy tasks off the main thread.
- **progressive-loading** — Use skeleton screens or shimmer for operations > 1 second; avoid long blocking spinners.
- **input-latency** — Keep input latency under ~100ms for taps and scrolls.
- **tap-feedback-speed** — Provide visual feedback within 100ms of tap (Apple HIG).
- **debounce-throttle** — Use debounce/throttle for high-frequency events (scroll, resize, input).
- **offline-support** — Provide offline state messaging and a basic fallback (PWA / mobile).
- **network-fallback** — Offer degraded modes for slow networks (lower-res images, fewer animations).

---

## 4. Style Selection (HIGH)

- **style-match** — Match the visual style to the product type and industry. Entertainment: vibrant, expressive. Fintech: clean, trustworthy. Healthcare: calm, structured.
- **consistency** — Use the same visual style across all pages; never mix flat and skeuomorphic randomly.
- **no-emoji-icons** — Use SVG icons (Heroicons, Lucide, Phosphor), never emojis as UI controls.
- **color-palette-from-product** — Choose the color palette from the product type and industry context, not arbitrarily.
- **effects-match-style** — Shadows, blur, border-radius, and visual effects must align with the chosen style (glass / flat / clay / minimal etc.).
- **platform-adaptive** — Respect platform idioms: iOS HIG navigation vs. Material navigation; native controls vs. custom controls.
- **state-clarity** — Hover, pressed, disabled, and selected states must be visually distinct while staying on-style (Material state layers).
- **elevation-consistent** — Use a consistent elevation/shadow scale for cards, sheets, and modals; never use arbitrary shadow values.
- **dark-mode-pairing** — Design light and dark variants together to maintain brand, contrast, and style consistency.
- **icon-style-consistent** — Use one icon set/visual language (consistent stroke width, corner radius) across the entire product.
- **system-controls** — Prefer native/system controls over fully custom ones; only customize when branding requires it.
- **blur-purpose** — Use blur to indicate background dismissal (modals, sheets), not as decoration.
- **primary-action** — Each screen should have only one primary CTA; secondary actions must be visually subordinate.

---

## 5. Layout & Responsive (HIGH)

- **viewport-meta** — Always use `width=device-width, initial-scale=1`; never disable zoom.
- **mobile-first** — Design mobile-first, then scale up to tablet and desktop.
- **breakpoint-consistency** — Use systematic breakpoints: 375 / 768 / 1024 / 1440.
- **readable-font-size** — Minimum 16px body text on mobile (avoids iOS auto-zoom).
- **line-length-control** — Mobile 35–60 characters per line; desktop 60–75 characters.
- **horizontal-scroll** — Never allow horizontal scroll on mobile; ensure content fits the viewport width.
- **spacing-scale** — Use a 4pt/8dp incremental spacing system (Material Design).
- **touch-density** — Keep component spacing comfortable for touch: not cramped, not causing mis-taps.
- **container-width** — Consistent max-width on desktop (`max-w-6xl` or `max-w-7xl`).
- **z-index-management** — Define a layered z-index scale (e.g. 0 / 10 / 20 / 40 / 100 / 1000); no arbitrary values.
- **fixed-element-offset** — Fixed navbar/bottom bar must reserve safe padding so underlying content is not obscured.
- **scroll-behavior** — Avoid nested scroll regions that interfere with the main scroll experience.
- **viewport-units** — Prefer `min-h-dvh` over `100vh` on mobile.
- **orientation-support** — Keep layout readable and operable in landscape mode.
- **content-priority** — Show core content first on mobile; fold or hide secondary content.
- **visual-hierarchy** — Establish hierarchy via size, spacing, and contrast — not color alone.

---

## 6. Typography & Color (MEDIUM)

- **line-height** — Use 1.5–1.75 for body text.
- **line-length** — Limit to 65–75 characters per line for readable prose.
- **font-pairing** — Match heading and body font personalities; avoid arbitrary pairing.
- **font-scale** — Use a consistent type scale (e.g. 12 / 14 / 16 / 18 / 24 / 32).
- **contrast-readability** — Darker text on light backgrounds (e.g. `slate-900` on white); always check contrast.
- **text-styles-system** — Use platform type roles: iOS Dynamic Type styles / Material 5 type roles (display, headline, title, body, label).
- **weight-hierarchy** — Bold headings (600–700), Regular body (400), Medium labels (500); use weight to reinforce visual hierarchy.
- **color-semantic** — Define semantic color tokens (primary, secondary, error, surface, on-surface) in the design system; never use raw hex in components.
- **color-dark-mode** — Dark mode uses desaturated/lighter tonal variants, not inverted colors; test contrast separately in dark mode.
- **color-accessible-pairs** — Foreground/background pairs must meet 4.5:1 (AA) or 7:1 (AAA); verify with a contrast tool.
- **color-not-decorative-only** — Functional color (error red, success green) must always include an icon or text label; never rely on color alone.
- **truncation-strategy** — Prefer wrapping over truncation; when truncating, use ellipsis and provide the full text via tooltip or expand.
- **letter-spacing** — Respect default letter-spacing per platform; avoid tight tracking on body text.
- **number-tabular** — Use tabular/monospaced figures for data columns, prices, and timers to prevent layout shift.
- **whitespace-balance** — Use whitespace intentionally to group related items and separate sections; avoid visual clutter.

---

## 7. Animation (MEDIUM)

For deep animation craft, easing curves, spring physics, and CSS transform mastery, read [design-engineering.md](./design-engineering.md). This section covers the priority rules and platform-specific requirements.

- **duration-timing** — 150–300ms for micro-interactions; complex transitions ≤ 400ms; never exceed 500ms for UI elements.
- **transform-performance** — Animate `transform` and `opacity` only; never animate `width`, `height`, `top`, or `left`.
- **loading-states** — Show skeleton or progress indicator when loading exceeds 300ms.
- **excessive-motion** — Animate 1–2 key elements per view at most; not everything needs to move.
- **easing** — `ease-out` for entering, `ease-in` for exiting; never use `linear` for UI transitions (except loaders).
- **motion-meaning** — Every animation must express a cause-effect relationship; never animate purely decoratively.
- **state-transition** — State changes (hover / active / expanded / collapsed / modal) must animate smoothly, not snap.
- **continuity** — Page/screen transitions must maintain spatial continuity (shared element, directional slide).
- **spring-physics** — Prefer spring/physics-based curves over linear or cubic-bezier for a natural feel.
- **exit-faster-than-enter** — Exit animations should be 60–70% of the enter duration to feel responsive.
- **stagger-sequence** — Stagger list/grid item entrance by 30–50ms per item; avoid all-at-once or too-slow reveals.
- **interruptible** — Animations must be interruptible; user tap or gesture cancels the in-progress animation immediately.
- **no-blocking-animation** — Never block user input during an animation; the UI must remain interactive.
- **reduced-motion** — Always respect `prefers-reduced-motion`; reduce or disable position/movement animations.
- **modal-motion** — Modals and sheets should animate from their trigger source (scale+fade or slide-in) for spatial context.
- **navigation-direction** — Forward navigation animates left/up; backward animates right/down; keep direction logically consistent.
- **layout-shift-avoid** — Animations must not cause layout reflow or CLS; use `transform` for position changes.
- **no-animation-on-keyboard** — Never animate keyboard-initiated actions; they are repeated hundreds of times daily.

---

## 8. Forms & Feedback (MEDIUM)

- **input-labels** — Visible label per input; never use placeholder as the only label.
- **error-placement** — Show errors immediately below the related field, not only at the top of the form.
- **submit-feedback** — Show loading → success/error state transition on submit.
- **required-indicators** — Mark required fields with a visible indicator (asterisk with explanation).
- **empty-states** — Show a helpful message and next action when no content exists.
- **toast-dismiss** — Auto-dismiss non-critical toasts in 3–5 seconds.
- **confirmation-dialogs** — Confirm before destructive or irreversible actions.
- **input-helper-text** — Provide persistent helper text below complex inputs, not just placeholder.
- **disabled-states** — Disabled elements use reduced opacity (0.38–0.5) + cursor change + `disabled` semantic attribute.
- **progressive-disclosure** — Reveal complex options progressively; do not overwhelm users upfront.
- **inline-validation** — Validate on blur, not on keystroke; show errors only after the user finishes input.
- **input-type-keyboard** — Use semantic input types (`email`, `tel`, `number`) to trigger the correct mobile keyboard.
- **password-toggle** — Provide a show/hide toggle for password fields.
- **autofill-support** — Use `autocomplete` / `textContentType` attributes so the system can autofill.
- **undo-support** — Allow undo for destructive or bulk actions (e.g. "Undo delete" toast) (Apple HIG).
- **success-feedback** — Confirm completed actions with brief visual feedback (checkmark, toast, or color flash).
- **error-recovery** — Error messages must include a clear recovery path (retry, edit, help link).
- **multi-step-progress** — Multi-step flows show a step indicator or progress bar; allow back navigation.
- **form-autosave** — Long forms should auto-save drafts to prevent data loss on accidental dismissal.
- **sheet-dismiss-confirm** — Confirm before dismissing a sheet or modal that contains unsaved changes.
- **error-clarity** — Error messages must state the cause and how to fix it; never just "Invalid input".
- **field-grouping** — Group related fields logically (fieldset/legend or visual grouping).
- **read-only-distinction** — Read-only state must be visually and semantically distinct from disabled.
- **focus-management** — After a submit error, auto-focus the first invalid field (WCAG).
- **error-summary** — For multiple errors, show a summary at the top with anchor links to each field (WCAG).
- **touch-friendly-input** — Mobile input height ≥ 44px to meet touch target requirements.
- **destructive-emphasis** — Destructive actions use semantic danger color and are visually separated from the primary action.
- **toast-accessibility** — Toasts must not steal focus; use `aria-live="polite"` for screen reader announcement.
- **aria-live-errors** — Form errors use `aria-live` region or `role="alert"` to notify screen readers.
- **contrast-feedback** — Error and success state colors must meet 4.5:1 contrast ratio (WCAG).
- **timeout-feedback** — Request timeouts must show clear feedback with a retry option.

---

## 9. Navigation Patterns (HIGH)

- **bottom-nav-limit** — Bottom navigation maximum 5 items; use labels alongside icons (Material Design).
- **drawer-usage** — Use drawer/sidebar for secondary navigation, not for primary actions.
- **back-behavior** — Back navigation must be predictable and consistent; preserve scroll and filter state.
- **deep-linking** — All key screens must be reachable via deep link / URL for sharing and push notifications.
- **tab-bar-ios** — iOS: use bottom Tab Bar for top-level navigation (Apple HIG).
- **top-app-bar-android** — Android: use Top App Bar with a navigation icon for primary structure (Material Design).
- **nav-label-icon** — Navigation items must have both icon and text label; icon-only navigation harms discoverability.
- **nav-state-active** — The current location must be visually highlighted (color, weight, or indicator) in the navigation.
- **nav-hierarchy** — Primary nav (tabs/bottom bar) vs. secondary nav (drawer/settings) must be clearly separated.
- **modal-escape** — Modals and sheets must offer a clear close/dismiss affordance; support swipe-down to dismiss on mobile.
- **search-accessible** — Search must be easily reachable (top bar or tab); provide recent and suggested queries.
- **breadcrumb-web** — Web: use breadcrumbs for 3+ level deep hierarchies to aid orientation.
- **state-preservation** — Navigating back must restore the previous scroll position, filter state, and input values.
- **gesture-nav-support** — Support system gesture navigation (iOS swipe-back, Android predictive back) without conflict.
- **tab-badge** — Use badges on nav items sparingly to indicate unread/pending; clear after the user visits.
- **overflow-menu** — When actions exceed available space, use an overflow/more menu instead of cramming.
- **bottom-nav-top-level** — Bottom nav is for top-level screens only; never nest sub-navigation inside it.
- **adaptive-navigation** — Large screens (≥ 1024px) prefer sidebar; small screens use bottom or top nav (Material Adaptive).
- **back-stack-integrity** — Never silently reset the navigation stack or unexpectedly jump to home.
- **navigation-consistency** — Navigation placement must stay the same across all pages; do not change by page type.
- **avoid-mixed-patterns** — Do not mix Tab + Sidebar + Bottom Nav at the same hierarchy level.
- **modal-vs-navigation** — Modals must not be used for primary navigation flows; they break the user's path.
- **focus-on-route-change** — After a page transition, move focus to the main content region for screen reader users (WCAG).
- **persistent-nav** — Core navigation must remain reachable from deep pages; do not hide it entirely in sub-flows.
- **destructive-nav-separation** — Dangerous actions (delete account, logout) must be visually and spatially separated from normal nav items.
- **empty-nav-state** — When a nav destination is unavailable, explain why instead of silently hiding it.

---

## 10. Charts & Data (LOW)

- **chart-type** — Match the chart type to the data: trend → line, comparison → bar, proportion → pie/donut (≤ 5 categories).
- **color-guidance** — Use accessible color palettes; avoid red/green-only pairs for colorblind users (WCAG).
- **data-table** — Provide a table alternative for accessibility; charts alone are not screen-reader friendly.
- **pattern-texture** — Supplement color with patterns, textures, or shapes so data is distinguishable without color.
- **legend-visible** — Always show legend; position it near the chart, not detached below a scroll fold.
- **tooltip-on-interact** — Provide tooltips/data labels on hover (web) or tap (mobile) showing exact values.
- **axis-labels** — Label axes with units and a readable scale; avoid truncated or rotated labels on mobile.
- **responsive-chart** — Charts must reflow or simplify on small screens (horizontal bar instead of vertical, fewer ticks).
- **empty-data-state** — Show a meaningful empty state when no data exists ("No data yet" + guidance), not a blank chart.
- **loading-chart** — Use skeleton or shimmer while chart data loads; never show an empty axis frame.
- **animation-optional** — Chart entrance animations must respect `prefers-reduced-motion`; data should be readable immediately.
- **large-dataset** — For 1000+ data points, aggregate or sample; provide drill-down for detail instead of rendering all points.
- **number-formatting** — Use locale-aware formatting for numbers, dates, and currencies on axes and labels.
- **touch-target-chart** — Interactive chart elements (points, segments) must have a ≥ 44pt tap area or expand on touch.
- **no-pie-overuse** — Avoid pie/donut for more than 5 categories; switch to a bar chart for clarity.
- **contrast-data** — Data lines/bars vs. background ≥ 3:1; data text labels ≥ 4.5:1 (WCAG).
- **legend-interactive** — Legends should be clickable to toggle series visibility.
- **direct-labeling** — For small datasets, label values directly on the chart to reduce eye travel.
- **tooltip-keyboard** — Tooltip content must be keyboard-reachable and must not rely on hover alone (WCAG).
- **sortable-table** — Data tables must support sorting with `aria-sort` indicating the current sort state.
- **axis-readability** — Axis ticks must not be cramped; maintain readable spacing and auto-skip on small screens.
- **data-density** — Limit information density per chart to avoid cognitive overload; split into multiple charts if needed.
- **trend-emphasis** — Emphasize data trends over decoration; avoid heavy gradients or shadows that obscure the data.
- **gridline-subtle** — Grid lines should be low-contrast (e.g. `gray-200`) so they do not compete with data.
- **focusable-elements** — Interactive chart elements (points, bars, slices) must be keyboard-navigable (WCAG).
- **screen-reader-summary** — Provide a text summary or `aria-label` describing the chart's key insight for screen readers.
- **error-state-chart** — Data load failure must show an error message with a retry action, not a broken or empty chart.
- **export-option** — For data-heavy products, offer CSV or image export of chart data.
- **drill-down-consistency** — Drill-down interactions must maintain a clear back-path and hierarchy breadcrumb.
- **time-scale-clarity** — Time series charts must clearly label time granularity (day/week/month) and allow switching.

---

## 11. Audio Feedback (MEDIUM)

When to use sound and how to implement it without harming accessibility or experience.

**Appropriateness rules:**

- **no-high-frequency** — Never add sound to typing, keyboard navigation, hover, or scroll — too frequent and noisy.
- **confirmations-only** — Sound is appropriate for payments, uploads, and form submissions — significant moments that deserve assurance.
- **errors-warnings** — Sound is appropriate for critical errors users must not miss.
- **no-decorative** — Never add sound to hover states, animations, or decorative moments with no informational value.
- **inform-not-punish** — Error tones must be gentle and informative. Harsh buzzers feel punishing, not helpful.
- **weight-matches-action** — Sound weight and duration should match action importance. A toggle is a soft click; a payment is a success chime.

**Accessibility rules:**

- **visual-equivalent** — Every audio cue must have a visual equivalent. Sound never replaces visual feedback.
- **user-toggle** — Always provide a setting to disable sounds in preferences.
- **prefers-reduced-motion** — Check `prefers-reduced-motion` before playing any sound — treat it as a proxy for sound sensitivity.
- **volume-control** — Allow volume control independent of system volume. Default volume should be subtle (`0.3`), not loud.

**Implementation rules:**

- **preload-audio** — Preload audio files at startup to avoid playback delay on first trigger.
- **reset-current-time** — Set `audio.currentTime = 0` before calling `audio.play()` to allow rapid re-triggering.

**Sound appropriateness matrix:**

| Interaction | Sound? | Reason |
|-------------|--------|--------|
| Payment / upload complete | Yes | Significant confirmation |
| Error state | Yes | Can't be overlooked |
| Notification (off-screen) | Yes | User may not be looking |
| Button click | Maybe | Only for significant actions |
| Typing | No | Too frequent |
| Hover | No | Decorative only |
| Scroll / navigation | No | Too frequent |

### Sound Synthesis (Web Audio API)

When building procedural audio rather than playing prerecorded files:

- **single-context** — Reuse one `AudioContext` singleton; never create a new one per sound (browser limits simultaneous contexts).
- **resume-suspended** — Check `ctx.state === "suspended"` and call `ctx.resume()` before playing. Browsers suspend the context after user inactivity.
- **cleanup-nodes** — Disconnect source and gain nodes in `source.onended` to prevent memory leaks.
- **exponential-decay** — Use `exponentialRampToValueAtTime(0.001, t)` not linear. Never ramp to exactly `0` — exponential ramps require a positive non-zero target.
- **set-initial-value** — Call `gain.gain.setValueAtTime(value, t)` before any ramp to avoid glitches from undefined starting values.
- **noise-for-clicks** — Use filtered noise burst for click/tap sounds; use oscillators with pitch sweep for tonal confirmations.
- **filter-range** — Bandpass filter for click sounds: 3000–6000 Hz frequency, Q value 2–5 (focused but not harsh).
- **gain-ceiling** — Keep gain under `1.0` to prevent clipping. `0.3` is a good default.
- **click-duration** — Click/tap sounds: 5–15ms buffer duration.

```ts
// Singleton AudioContext
let ctx: AudioContext | null = null;
function getCtx() { return (ctx ??= new AudioContext()); }

// Typical click sound setup
function playClick() {
  const c = getCtx();
  if (c.state === 'suspended') c.resume();

  const buffer = c.createBuffer(1, c.sampleRate * 0.008, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / 50);
  }

  const source = c.createBufferSource();
  source.buffer = buffer;

  const filter = c.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 4000;
  filter.Q.value = 3;

  const gain = c.createGain();
  const t = c.currentTime;
  gain.gain.setValueAtTime(0.3, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.008);

  source.connect(filter).connect(gain).connect(c.destination);
  source.start(t);
  source.onended = () => { source.disconnect(); gain.disconnect(); };
}
```

---

## 12. Predictive Prefetching (MEDIUM)

Load content before the user clicks by analyzing cursor trajectory. Reclaims 100–200ms of perceived latency on navigation-heavy apps.

- **trajectory-over-hover** — Hover prefetching starts too late. Trajectory prediction fires while the cursor is still in motion toward the element, reclaiming the full approach window.
- **intent-not-viewport** — Do not prefetch everything visible in the viewport. Prefetch based on user intent to avoid wasted bandwidth. Disable Next.js `prefetch={true}` on `<Link>` and trigger manually.
- **hit-slop** — Expand the invisible prediction zone around elements with `hitSlop: 20` so prefetching starts earlier in the cursor's path.
- **touch-fallback** — Touch devices have no cursor. Use a library like [ForesightJS](https://foresightjs.com) that automatically falls back to viewport or `touchstart` strategies on touch devices.
- **keyboard-prefetch** — Monitor `focus` events and prefetch when keyboard focus approaches a registered element (a few tab stops away).
- **selective-use** — Only useful where navigation latency is noticeable: data-heavy dashboards, multi-page apps with slow API responses, e-commerce product pages. Not warranted for static sites or fully pre-loaded SPAs.

```tsx
// ForesightJS-style trajectory prefetching
const { elementRef } = useForesight({
  callback: () => router.prefetch('/dashboard'),
  hitSlop: 20,
  name: 'dashboard-link',
});

<Link ref={elementRef} href="/dashboard">Dashboard</Link>
```

---

## 13. Laws of UX (HIGH)

Named psychological principles for interface design. Use when ordering elements, grouping content, handling complexity, or designing completion states. Source: [lawsofux.com](https://lawsofux.com).

- **fitts-target-size** — Interactive targets should be at minimum 32px; larger is better. Hit area can exceed visual size via invisible padding or pseudo-elements.
- **hicks-minimize-choices** — Minimize the number of choices to reduce decision time. Every extra option slows the user down logarithmically (Hick's Law).
- **millers-chunking** — Working memory holds ~7 items. Chunk large datasets into groups of 5–9 for scannability (e.g., `4532 0151 1283 0366` not `4532015112830366`).
- **doherty-under-400ms** — System must respond within 400ms to maintain user flow. Over 400ms feels like the system is thinking; over 1s requires a progress indicator.
- **doherty-perceived-speed** — Fake speed with skeletons, optimistic UI, and progress indicators when actual speed cannot be improved.
- **postels-accept-messy-input** — Accept messy human input (any date format, extra spaces, mixed case) and normalize it internally. Validate generously, output strictly.
- **progressive-disclosure** — Show what matters now; reveal complexity later. Do not front-load every option, setting, or edge case.
- **jakobs-familiar-patterns** — Users spend most time on other sites. Match familiar patterns (top nav, breadcrumbs, search in the header) so no learning cost is introduced.
- **aesthetic-usability** — Visual polish increases perceived usability and trust. Small details — consistent spacing, considered shadows, smooth type — compound into confidence.
- **von-restorff-emphasis** — When multiple similar elements exist, the one that differs is remembered. Use it intentionally: make destructive actions visually distinct from neutral ones.
- **serial-position** — Users best remember the first and last items in a sequence. Place the most important navigation items and actions at the edges, not buried in the middle.
- **peak-end-finish-strong** — People judge an experience by its peak moment and its end. Invest in success and completion states — they shape how the whole flow is remembered.
- **teslers-complexity** — Every system has irreducible complexity. Move it to the system, not the user: a date picker absorbs ISO format complexity so the user types naturally.
- **goal-gradient-progress** — People accelerate as they near a goal. Show progress visually (progress bar, step counter, completion %) to drive engagement toward completion.
- **zeigarnik-incomplete** — People remember incomplete tasks better than completed ones. Show incomplete profile progress, setup checklists, or onboarding steps to drive follow-through.
- **pragnanz-simplify** — Users interpret visuals as the simplest form possible. Reduce noise: remove redundant borders, mixed shadows, and competing colors so hierarchy reads clearly.
- **pareto-prioritize** — 80% of users use 20% of features. Design and polish the critical 20% first; do not spread quality evenly across rarely-used features.
- **cognitive-load-reduce** — Remove anything that does not help the user complete their task. Decoration, redundant labels, unnecessary confirmations, and extra options all add load.
- **uniform-connectedness** — Elements that are visually connected (line, shared color, enclosing frame) are perceived as related. Use connectors for step sequences, timelines, and grouped actions.
