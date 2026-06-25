# Design Engineering

Craft sensibility for UI polish, animation decisions, component building, and the invisible details that make software feel right. Apply this alongside `ui-constraints.md` (hard rules) and `frontend-development.md` (delivery loop). The hard constraints in `ui-constraints.md` take precedence; this reference provides the depth behind them.

## Core Philosophy

### Taste is trained, not innate

Good taste is a trained instinct: the ability to see beyond the obvious and recognise what elevates. Develop it by studying great work, reverse-engineering animations, and inspecting interactions. When building UI, understand *why* the best interfaces feel the way they do.

### Unseen details compound

Most details users never consciously notice. That is the point. When a feature functions exactly as someone assumes it should, they proceed without a second thought.

> "All those unseen details combine to produce something that's just stunning, like a thousand barely audible voices all singing in tune." — Paul Graham

Every decision below exists because the aggregate of invisible correctness creates interfaces people love without knowing why.

### Beauty is leverage

People select tools based on the overall experience, not just functionality. Good defaults and good animations are real differentiators. Use beauty as leverage.

## Review Format

When reviewing UI code, output a markdown table with Before/After/Why columns. One row per issue.

| Before | After | Why |
| --- | --- | --- |
| `transition: all 300ms` | `transition: transform 200ms ease-out` | Specify exact properties; avoid `all` |
| `transform: scale(0)` | `transform: scale(0.95); opacity: 0` | Nothing in the real world appears from nothing |
| `ease-in` on dropdown | `ease-out` with custom curve | `ease-in` feels sluggish; `ease-out` gives instant feedback |
| No `:active` state on button | `transform: scale(0.97)` on `:active` | Buttons must feel responsive to press |
| `transform-origin: center` on popover | `transform-origin: var(--radix-popover-content-transform-origin)` | Popovers should scale from their trigger (modals stay centered) |

Never use a "Before:" / "After:" list format. Always use the table.

## Animation Decision Framework

**Quick Decision** — answer the first matching question and stop:

| Question | Rule |
|---|---|
| Is this element **entering or exiting**? | Use `ease-out` |
| Is an **on-screen element moving** (repositioning)? | Use `ease-in-out` |
| Is this a **hover or color transition**? | Use `ease` |
| Will users **see this 100+ times daily**? | Don't animate it |
| Is this a **drag or interruptible gesture**? | Use a spring |
| Is the element **large** (drawer, full panel)? | Bigger size = longer duration |
| Is this an **exit animation**? | Make it faster than the entrance |

Before writing any animation code, work through these questions in order.

### 1. Should this animate at all?

| Frequency | Decision |
| --- | --- |
| 100+ times/day (keyboard shortcuts, command palette) | No animation. Ever. |
| Tens of times/day (hover effects, list navigation) | Remove or drastically reduce |
| Occasional (modals, drawers, toasts) | Standard animation |
| Rare/first-time (onboarding, celebrations) | Can add delight |

**Never animate keyboard-initiated actions.** They are repeated hundreds of times daily. Animation makes them feel slow and disconnected.

### 2. What is the purpose?

Every animation must have a clear answer to "why does this animate?" Valid purposes:

- **Spatial consistency** — toast enters and exits from the same direction, making swipe-to-dismiss feel intuitive
- **State indication** — a morphing button shows the state change
- **Explanation** — a marketing animation that shows how a feature works
- **Feedback** — a button scales down on press, confirming the interface heard the user
- **Preventing jarring changes** — elements appearing without transition feel broken

If the purpose is "it looks cool" and the user will see it often, don't animate.

### 3. What easing should it use?

```
Is the element entering or exiting?
  Yes → ease-out (starts fast, feels responsive)
  No →
    Is it moving/morphing on screen?
      Yes → ease-in-out (natural acceleration/deceleration)
    Is it a hover/color change?
      Yes → ease
    Is it constant motion (marquee, progress bar)?
      Yes → linear
    Default → ease-out
```

**Use custom easing curves.** The built-in CSS easings are too weak. They lack the punch that makes animations feel intentional.

```css
/* Strong ease-out for UI interactions */
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);

/* Strong ease-in-out for on-screen movement */
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);

/* iOS-like drawer curve (from Ionic Framework) */
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
```

**Never use ease-in for UI animations.** It starts slow, making the interface feel sluggish. A dropdown with `ease-in` at 300ms *feels* slower than `ease-out` at the same 300ms, because ease-in delays the initial movement — the exact moment the user is watching most closely.

Resources: [easing.dev](https://easing.dev/) and [easings.co](https://easings.co/).

### 4. How fast should it be?

| Element | Duration |
| --- | --- |
| Button press feedback | 100–160ms |
| Tooltips, small popovers | 125–200ms |
| Dropdowns, selects | 150–250ms |
| Modals, drawers | 200–500ms |
| Full panels, large surfaces | 300–500ms |
| Marketing/explanatory | Can be longer |

**Element size scales duration.** A small dropdown at 200ms feels right. The same ease on a full-width panel feels rushed — bigger elements need proportionally longer durations because there's more visual distance to cover.

**UI animations must stay under 300ms.** A 180ms dropdown feels more responsive than a 400ms one. A faster-spinning spinner makes the app feel like it loads faster, even when load time is identical.

### Perceived performance

Speed in animation is not just about feeling snappy — it directly affects how users perceive the app's performance:

- A fast-spinning spinner makes loading feel faster (same load time, different perception)
- A 180ms select animation feels more responsive than a 400ms one
- Instant tooltips after the first is open (skip delay + skip animation) make the whole toolbar feel faster

Easing amplifies this: `ease-out` at 200ms *feels* faster than `ease-in` at 200ms.

## Spring Animations

Springs feel more natural than duration-based animations because they simulate real physics. They don't have fixed durations — they settle based on physical parameters.

### When to use springs

- Drag interactions with momentum
- Elements that should feel "alive" (like Apple's Dynamic Island)
- Gestures that can be interrupted mid-animation
- Decorative mouse-tracking interactions

### Spring-based mouse interactions

Tying visual changes directly to mouse position feels artificial. Use `useSpring` from Motion (formerly Framer Motion) to interpolate value changes with spring-like behaviour instead of updating immediately.

```jsx
import { useSpring } from 'framer-motion';

// Without spring: feels artificial, instant
const rotation = mouseX * 0.1;

// With spring: feels natural, has momentum
const springRotation = useSpring(mouseX * 0.1, {
  stiffness: 100,
  damping: 10,
});
```

### Spring configuration

```js
// Apple's approach (easier to reason about)
{ type: "spring", duration: 0.5, bounce: 0.2 }

// Traditional physics (more control)
{ type: "spring", mass: 1, stiffness: 100, damping: 10 }
```

Keep bounce subtle (0.1–0.3). Avoid bounce in most UI contexts. Use it for drag-to-dismiss and playful interactions.

### Interruptibility advantage

Springs maintain velocity when interrupted — CSS animations and keyframes restart from zero. This makes springs ideal for gestures users might change mid-motion.

## Component Building Principles

### Buttons must feel responsive

Add `transform: scale(0.97)` on `:active`. This gives instant feedback.

```css
.button {
  transition: transform 160ms ease-out;
}
.button:active {
  transform: scale(0.97);
}
```

Applies to any pressable element. Scale should be subtle (0.95–0.98).

### Never animate from scale(0)

Nothing in the real world disappears and reappears completely. Start from `scale(0.9)` or higher, combined with opacity.

```css
/* Bad */
.entering { transform: scale(0); }

/* Good */
.entering { transform: scale(0.95); opacity: 0; }
```

### Make popovers origin-aware

Popovers should scale in from their trigger, not from center. **Exception: modals.** Modals should keep `transform-origin: center` because they are centered in the viewport, not anchored to a trigger.

```css
/* Radix UI */
.popover { transform-origin: var(--radix-popover-content-transform-origin); }

/* Base UI */
.popover { transform-origin: var(--transform-origin); }
```

### Tooltips: skip delay on subsequent hovers

Tooltips should delay before appearing. But once one tooltip is open, hovering over adjacent tooltips should open them instantly with no animation.

```css
.tooltip {
  transition: transform 125ms ease-out, opacity 125ms ease-out;
  transform-origin: var(--transform-origin);
}
.tooltip[data-starting-style], .tooltip[data-ending-style] {
  opacity: 0;
  transform: scale(0.97);
}
/* Skip animation on subsequent tooltips */
.tooltip[data-instant] { transition-duration: 0ms; }
```

### Use CSS transitions over keyframes for interruptible UI

CSS transitions can be interrupted and retargeted mid-animation. Keyframes restart from zero. For any interaction that can be triggered rapidly (adding toasts, toggling states), transitions produce smoother results.

```css
/* Interruptible — good for UI */
.toast { transition: transform 400ms ease; }

/* Not interruptible — avoid for dynamic UI */
@keyframes slideIn {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}
```

### Use blur to mask imperfect transitions

When a crossfade feels off despite trying different easings, add subtle `filter: blur(2px)` during the transition. Without blur, two distinct objects overlap during a crossfade. Blur bridges the visual gap.

```css
.button-content {
  transition: filter 200ms ease, opacity 200ms ease;
}
.button-content.transitioning {
  filter: blur(2px);
  opacity: 0.7;
}
```

Keep blur under 20px. Heavy blur is expensive, especially in Safari.

### Animate enter states with @starting-style

The modern CSS way to animate element entry without JavaScript:

```css
.toast {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 400ms ease, transform 400ms ease;

  @starting-style {
    opacity: 0;
    transform: translateY(100%);
  }
}
```

This replaces the common React `useEffect` + `mounted` state pattern. Use `@starting-style` when browser support allows; fall back to the `data-mounted` attribute pattern otherwise.

## CSS Transform Mastery

### translateY with percentages

Percentage values in `translate()` are relative to the element's own size. Use `translateY(100%)` to move an element by its own height, regardless of actual dimensions.

```css
.drawer-hidden { transform: translateY(100%); }
.toast-enter   { transform: translateY(-100%); }
```

Prefer percentages over hardcoded pixel values.

### scale() scales children too

Unlike `width`/`height`, `scale()` also scales an element's children. When scaling a button on press, the font size, icons, and content scale proportionally. This is a feature.

### 3D transforms for depth

`rotateX()`, `rotateY()` with `transform-style: preserve-3d` create real 3D effects in CSS.

```css
.wrapper { transform-style: preserve-3d; }

@keyframes orbit {
  from { transform: translate(-50%, -50%) rotateY(0deg) translateZ(72px) rotateY(360deg); }
  to   { transform: translate(-50%, -50%) rotateY(360deg) translateZ(72px) rotateY(0deg); }
}
```

### transform-origin

Every element has an anchor point from which transforms execute. The default is center. Set it to match where the trigger lives for origin-aware interactions.

## clip-path for Animation

`clip-path` is one of the most powerful animation tools in CSS — not just for shapes.

### The inset shape

`clip-path: inset(top right bottom left)` defines a rectangular clipping region.

```css
/* Fully hidden from right */
.hidden  { clip-path: inset(0 100% 0 0); }
/* Fully visible */
.visible { clip-path: inset(0 0 0 0); }

/* Reveal from left to right */
.overlay {
  clip-path: inset(0 100% 0 0);
  transition: clip-path 200ms ease-out;
}
.button:active .overlay {
  clip-path: inset(0 0 0 0);
  transition: clip-path 2s linear;
}
```

### Tabs with perfect color transitions

Duplicate the tab list. Style the copy as "active". Clip the copy so only the active tab is visible. Animate the clip on tab change. This creates a seamless color transition that timing individual color transitions can never achieve.

### Hold-to-delete pattern

Use `clip-path: inset(0 100% 0 0)` on a colored overlay. On `:active`, transition to `inset(0 0 0 0)` over 2s with linear timing. On release, snap back with 200ms ease-out. Add `scale(0.97)` on the button for press feedback.

### Image reveals on scroll

Start with `clip-path: inset(0 0 100% 0)` (hidden from bottom). Animate to `inset(0 0 0 0)` when the element enters the viewport using `IntersectionObserver` or Framer Motion's `useInView` with `{ once: true, margin: "-100px" }`.

### Comparison sliders

Overlay two images. Clip the top one with `clip-path: inset(0 50% 0 0)`. Adjust the right inset based on drag position. No extra DOM elements, fully hardware-accelerated.

## Gesture and Drag Interactions

### Momentum-based dismissal

Don't require dragging past a threshold. Calculate velocity: `Math.abs(dragDistance) / elapsedTime`. If velocity exceeds ~0.11, dismiss regardless of distance.

```js
const timeTaken = new Date().getTime() - dragStartTime.current.getTime();
const velocity = Math.abs(swipeAmount) / timeTaken;

if (Math.abs(swipeAmount) >= SWIPE_THRESHOLD || velocity > 0.11) {
  dismiss();
}
```

### Damping at boundaries

When a user drags past the natural boundary, apply damping — the more they drag, the less the element moves. Things in real life don't suddenly stop; they slow down first.

### Pointer capture for drag

Once dragging starts, set the element to capture all pointer events. This ensures dragging continues even if the pointer leaves the element bounds.

### Multi-touch protection

Ignore additional touch points after the initial drag begins. Without this, switching fingers mid-drag causes the element to jump.

```js
function onPress() {
  if (isDragging) return;
  // start drag...
}
```

### Friction instead of hard stops

Instead of preventing upward drag entirely, allow it with increasing friction. It feels more natural than hitting an invisible wall.

## Performance Rules

### Only animate transform and opacity

These properties skip layout and paint, running on the GPU. Animating `padding`, `margin`, `height`, or `width` triggers all three rendering steps.

### CSS variables are inheritable

Changing a CSS variable on a parent recalculates styles for all children. In a drawer with many items, updating `--swipe-amount` on the container causes expensive style recalculation. Update `transform` directly on the element instead.

```js
// Bad: triggers recalc on all children
element.style.setProperty('--swipe-amount', `${distance}px`);

// Good: only affects this element
element.style.transform = `translateY(${distance}px)`;
```

### Framer Motion hardware acceleration caveat

Framer Motion's shorthand properties (`x`, `y`, `scale`) are NOT hardware-accelerated — they use `requestAnimationFrame` on the main thread. For hardware acceleration, use the full `transform` string:

```jsx
// NOT hardware accelerated — drops frames under load
<motion.div animate={{ x: 100 }} />

// Hardware accelerated — stays smooth even when main thread is busy
<motion.div animate={{ transform: "translateX(100px)" }} />
```

This matters when the browser is simultaneously loading content, running scripts, or painting.

### CSS animations beat JS under load

CSS animations run off the main thread. When the browser is busy loading a new page, Framer Motion animations (using `requestAnimationFrame`) drop frames. CSS animations remain smooth. Use CSS for predetermined animations; JS for dynamic, interruptible ones.

### Use WAAPI for programmatic CSS animations

The Web Animations API gives JavaScript control with CSS performance. Hardware-accelerated, interruptible, no library needed.

```js
element.animate(
  [{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0 0)' }],
  { duration: 1000, fill: 'forwards', easing: 'cubic-bezier(0.77, 0, 0.175, 1)' }
);
```

## Accessibility

### prefers-reduced-motion

Animations can cause motion sickness. Reduced motion means fewer and gentler animations, not zero. Keep opacity and color transitions that aid comprehension. Remove movement and position animations.

```css
@media (prefers-reduced-motion: reduce) {
  .element {
    animation: fade 0.2s ease;
    /* No transform-based motion */
  }
}
```

```jsx
const shouldReduceMotion = useReducedMotion();
const closedX = shouldReduceMotion ? 0 : '-100%';
```

### Touch device hover states

Touch devices trigger hover on tap, causing false positives. Gate hover animations behind this media query:

```css
@media (hover: hover) and (pointer: fine) {
  .element:hover {
    transform: scale(1.05);
  }
}
```

## Stagger Animations

When multiple elements enter together, stagger their appearance.

```css
.item {
  opacity: 0;
  transform: translateY(8px);
  animation: fadeIn 300ms ease-out forwards;
}
.item:nth-child(1) { animation-delay: 0ms; }
.item:nth-child(2) { animation-delay: 50ms; }
.item:nth-child(3) { animation-delay: 100ms; }
.item:nth-child(4) { animation-delay: 150ms; }

@keyframes fadeIn {
  to { opacity: 1; transform: translateY(0); }
}
```

Keep stagger delays short (30–80ms between items). Long delays make the interface feel slow. Stagger is decorative — never block interaction while stagger animations are playing.

## Exit Animations

Framer Motion's `AnimatePresence` enables exit animations for elements removed from the DOM. Without it, `exit` props are silently ignored.

### AnimatePresence requirements

```tsx
// Wrong — exit prop is silently ignored without a wrapper
{isVisible && <motion.div exit={{ opacity: 0 }} />}

// Correct — wrapper required for exit to fire
<AnimatePresence>
  {isVisible && <motion.div exit={{ opacity: 0 }} />}
</AnimatePresence>
```

Every element inside `AnimatePresence` must define an `exit` prop. Exit should mirror `initial` for spatial symmetry: if it entered from `y: 20`, exit to `y: 20`.

Dynamic lists need stable keys — never array index. Index keys cause the wrong element to animate when the list reorders.

```tsx
// Wrong: causes incorrect exit tracking
{items.map((item, i) => <motion.div key={i} exit={{ opacity: 0 }} />)}

// Correct: stable ID key
{items.map(item => <motion.div key={item.id} exit={{ opacity: 0 }} />)}
```

### AnimatePresence modes

| Mode | Behavior | Gotcha |
|------|----------|--------|
| `undefined` (default) | Enter and exit simultaneously | — |
| `"wait"` | Exit fully, then enter | Nearly doubles perceived duration — halve timing values |
| `"sync"` | Simultaneous but causes layout conflicts | Avoid; use `popLayout` instead |
| `"popLayout"` | Pops exiting item out of flow; remaining items reflow | Use for list reordering |

### Nested AnimatePresence

Nested `AnimatePresence` requires `propagate` on both parent and child. Without it, inner children vanish instantly when the parent exits.

```tsx
<AnimatePresence propagate>
  {isOpen && (
    <motion.div exit={{ opacity: 0 }}>
      <AnimatePresence propagate>
        {items.map(item => (
          <motion.div key={item.id} exit={{ scale: 0 }} />
        ))}
      </AnimatePresence>
    </motion.div>
  )}
</AnimatePresence>
```

### Cleanup with useIsPresent

When using `useIsPresent` for custom exit logic, always call `safeToRemove()` — or the element stays in the DOM forever.

```tsx
const [isPresent, safeToRemove] = useIsPresent();

useEffect(() => {
  if (!isPresent) {
    doCleanup().then(() => safeToRemove());
  }
}, [isPresent]);
```

Disable pointer events on exiting elements — they're still visually present but must not be interactive.

```tsx
<motion.div exit={{ opacity: 0 }} style={{ pointerEvents: isPresent ? 'auto' : 'none' }}>
```

## Asymmetric Enter/Exit Timing

Pressing should be slow where it needs to be deliberate (hold-to-delete: 2s linear), but release should always be snappy (200ms ease-out). Slow where the user is deciding; fast where the system is responding.

```css
/* Release: fast */
.overlay { transition: clip-path 200ms ease-out; }

/* Press: slow and deliberate */
.button:active .overlay { transition: clip-path 2s linear; }
```

## Container Animation

Animating a container to match its content's natural height. A `ResizeObserver` measures the content; `motion.div` animates the outer wrapper. **Never measure and animate the same element** — it creates a measurement feedback loop.

```tsx
function AnimatedContainer({ children }) {
  const [ref, bounds] = useMeasure(); // uses ResizeObserver internally

  return (
    <motion.div
      animate={{ height: bounds.height > 0 ? bounds.height : 'auto' }}
      transition={{ duration: 0.2, delay: 0.05 }}
      style={{ overflow: 'hidden' }}
    >
      <div ref={ref}>{children}</div>
    </motion.div>
  );
}
```

Key rules:
- **Guard initial zero** — `bounds.height` is `0` before the first ResizeObserver measurement. Fall back to `"auto"` to avoid animating from nothing on mount.
- **Callback ref** — Use `useCallback` ref (not `useRef`) so the observer attaches the moment the DOM node is ready.
- **overflow: hidden** — Clips content during the transition; remove it after if the content needs to overflow at rest.
- **Small delay** — `delay: 0.05s` makes the container feel like it's catching up to the content, which feels more natural.
- **Use sparingly** — Appropriate for loading-state buttons, accordions, FAQs, and expandable content. Avoid on every layout container.

## Morphing Icons

Every morph-able icon uses exactly three SVG lines. Icons that need fewer lines collapse the extras to an invisible center point. This constraint enables seamless morphing between any two icons.

```ts
const CENTER = 7; // center of a 14×14 viewBox
const collapsed: IconLine = { x1: CENTER, y1: CENTER, x2: CENTER, y2: CENTER, opacity: 0 };

// Check icon: 2 visual lines, third collapsed
const check = {
  lines: [
    { x1: 2,   y1: 7.5, x2: 5.5, y2: 11 },
    { x1: 5.5, y1: 11,  x2: 12,  y2: 3  },
    collapsed,
  ],
};
```

Key rules:
- All icons share the same `viewBox` (14×14 recommended). Mixed scales break morph transitions.
- Rotational variants (arrow-right/down/left/up) share identical base lines and differ only by `rotation`. Use `useSpring` for the rotation value.
- When transitioning between **unrelated** icons (different rotation group), jump the rotation instantly via `rotation.jump(value)` instead of animating — a rotation through 270° on an unrelated icon looks wrong.
- `strokeLinecap="round"` on all lines.
- Icon SVGs are decorative: always `aria-hidden="true"`.
- Respect `prefers-reduced-motion` by setting `transition={{ duration: 0 }}` when the preference is active.

```tsx
const reducedMotion = useReducedMotion() ?? false;
const activeTransition = reducedMotion ? { duration: 0 } : defaultTransition;
```

## Component Cohesion (The Sonner Principles)

From building Sonner (13M+ weekly npm downloads) — applies to any component:

1. **Developer experience is key.** No hooks, no context, no complex setup. Insert once, call from anywhere. Less friction = more adoption.
2. **Good defaults matter more than options.** Ship beautiful out of the box. Most users never customize.
3. **Naming creates identity.** "Sonner" (French for "to ring") feels more elegant than "react-toast". Sacrifice discoverability for memorability when appropriate.
4. **Handle edge cases invisibly.** Pause timers when the tab is hidden. Fill gaps between stacked items with pseudo-elements. Capture pointer events during drag. Users never notice — that is exactly right.
5. **Use transitions, not keyframes, for dynamic UI.** Items added rapidly: keyframes restart from zero; transitions retarget smoothly.
6. **Match the motion to the mood.** A playful component can be bouncier. A professional dashboard should be crisp and fast. Cohesion — the easing, duration, visual style, and name should all fit the same vibe.

### Review your work the next day

Review animations with fresh eyes. Play animations in slow motion to spot timing issues invisible at full speed.

## Debugging Animations

### Slow motion testing

Temporarily increase duration to 2–5x normal, or use browser DevTools animation inspector. Look for:

- Colors transitioning smoothly vs. two distinct states overlapping
- Easing feeling right vs. starting/stopping abruptly
- Correct `transform-origin`
- Multiple animated properties (opacity, transform, color) in sync

### Frame-by-frame inspection

Step through animations in Chrome DevTools Animations panel. Reveals timing issues between coordinated properties invisible at full speed.

### Test on real devices

For touch interactions (drawers, swipe gestures), test on physical devices. Connect via USB, visit local dev server by IP, use Safari's remote devtools. The Xcode Simulator is an alternative but real hardware is better for gesture testing.

## Review Checklist

| Issue | Fix |
| --- | --- |
| `transition: all` | Specify exact properties: `transition: transform 200ms ease-out` |
| `scale(0)` entry animation | Start from `scale(0.95)` with `opacity: 0` |
| `ease-in` on UI element | Switch to `ease-out` or custom curve |
| `transform-origin: center` on popover | Set to trigger location or use Radix/Base UI CSS variable (modals exempt) |
| Animation on keyboard action | Remove animation entirely |
| Duration > 300ms on UI element | Reduce to 150–250ms |
| Hover animation without media query | Add `@media (hover: hover) and (pointer: fine)` |
| Keyframes on rapidly-triggered element | Use CSS transitions for interruptibility |
| Framer Motion `x`/`y` props under load | Use `transform: "translateX()"` for hardware acceleration |
| Same enter/exit transition speed | Make exit faster than enter |
| Elements all appear at once | Add stagger delay (30–80ms between items) |
| Stagger delay > 50ms per item | Reduce to ≤ 50ms; excessive stagger reads as slow |
| `AnimatePresence` missing around conditional element | Add wrapper — without it, `exit` is silently ignored |
| `exit` prop missing inside `AnimatePresence` | Add `exit={{ ... }}` to each motion element |
| Dynamic list using index as key | Use stable ID key — index causes wrong element to animate |
| `mode="sync"` in `AnimatePresence` | Switch to `mode="popLayout"` for list reordering |
| `mode="wait"` with original timing | Halve timing values — wait mode effectively doubles duration |
| Nested `AnimatePresence` without `propagate` | Add `propagate` prop to both parent and child |
| `useIsPresent` without `safeToRemove` call | Call `safeToRemove()` after cleanup or element stays in DOM |
| Measure and animate same element | Two-div: outer `motion.div` animates, inner `div` measured |
| Container animating from 0 on mount | Guard: `bounds.height > 0 ? bounds.height : "auto"` |
| `getBoundingClientRect` on every render | Use `ResizeObserver` via callback ref |
| `box-shadow` transition on hover | Animate pseudo-element opacity instead — repaints are expensive |
| Same border-radius on nested elements | Inner radius = outer radius minus padding (concentric) |
