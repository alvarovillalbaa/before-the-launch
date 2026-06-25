# CSS Transitions Pattern Library

Production-ready CSS transitions for common UI patterns. Each transition uses semantic CSS custom properties so all timing lives in one place. Fully portable — no framework dependencies, every snippet ships a `prefers-reduced-motion` guard.

Source: [transitions.dev](https://transitions.dev/) / [jakubantalik/transitions-dev](https://github.com/jakubantalik/transitions-dev)

---

## Quick Decision — Which Transition?

Match by **element type first**, then by **verb**:

| UI element | Right transition |
|---|---|
| Trigger + small dot floating on top | Notification badge |
| Trigger + surface that grows from it | Dropdown (anchored, origin-aware) |
| Centered overlay with backdrop | Modal |
| Surface that slides into a page region | Panel reveal |
| Two screens, list ↔ detail or step 1 ↔ step 2 | Page side-by-side |
| Element changes width or height | Card resize |
| Text content swaps in place | Text states swap |
| Two icons in the same slot | Icon swap |
| A number updates | Number pop-in |

If two could fit, prefer the lower-overhead one: card resize over panel reveal, dropdown over modal.

---

## Universal Install

Drop this `:root` block into the project **once**. Every transition snippet reads from these semantic names.

```css
/* transitions-dev — paste once into global stylesheet */
:root {
  /* Card resize */
  --resize-dur: 300ms;
  --resize-ease: cubic-bezier(0.22, 1, 0.36, 1);

  /* Number pop-in */
  --digit-dur: 500ms;
  --digit-distance: 8px;
  --digit-stagger: 70ms;
  --digit-blur: 2px;
  --digit-ease: cubic-bezier(0.34, 1.45, 0.64, 1);
  --digit-dir-x: 0;
  --digit-dir-y: 1;

  /* Notification badge */
  --badge-slide-dur: 260ms;
  --badge-pop-dur: 500ms;
  --badge-pop-close-dur: 180ms;
  --badge-fade-dur: 400ms;
  --badge-fade-close-dur: 180ms;
  --badge-blur: 2px;
  --badge-offset-x: -8.2px;
  --badge-offset-y: 12.4px;
  --badge-slide-ease: cubic-bezier(0.22, 1, 0.36, 1);
  --badge-pop-ease: cubic-bezier(0.34, 1.36, 0.64, 1);
  --badge-close-ease: cubic-bezier(0.4, 0, 0.2, 1);

  /* Text states swap */
  --text-swap-dur: 200ms;
  --text-swap-translate-y: 8px;
  --text-swap-blur: 2px;
  --text-swap-ease: ease-out;

  /* Menu dropdown */
  --dropdown-open-dur: 250ms;
  --dropdown-close-dur: 150ms;
  --dropdown-pre-scale: 0.97;
  --dropdown-closing-scale: 0.99;
  --dropdown-ease: cubic-bezier(0.22, 1, 0.36, 1);

  /* Modal */
  --modal-open-dur: 250ms;
  --modal-close-dur: 150ms;
  --modal-scale: 0.96;
  --modal-scale-close: 0.96;
  --modal-ease: cubic-bezier(0.22, 1, 0.36, 1);

  /* Panel reveal */
  --panel-open-dur: 400ms;
  --panel-close-dur: 350ms;
  --panel-translate-y: 100px;
  --panel-blur: 2px;
  --panel-ease: cubic-bezier(0.22, 1, 0.36, 1);

  /* Page side-by-side */
  --page-slide-dur: 200ms;
  --page-fade-dur: 200ms;
  --page-slide-distance: 8px;
  --page-blur: 3px;
  --page-stagger: 0ms;
  --page-exit-enabled: 1;
  --page-slide-ease: cubic-bezier(0.22, 1, 0.36, 1);
  --page-fade-ease: cubic-bezier(0.22, 1, 0.36, 1);

  /* Icon swap */
  --icon-swap-dur: 200ms;
  --icon-swap-blur: 2px;
  --icon-swap-start-scale: 0.25;
  --icon-swap-ease: ease-in-out;
}
```

---

## The Nine Transitions

### 1. Card Resize

Tween a container's width or height when its layout state changes. Use `grid-template-rows` or `width` with the custom ease — never animate `height` directly.

**Trigger:** element changes its bounding box size.

---

### 2. Number Pop-In

Re-enter each digit with a blurred slide when a number updates. Digits enter from the bottom (or top if decreasing) with an elastic overshoot ease and staggered timing.

**Trigger:** numeric value updates (scores, counters, prices).

Key: force a DOM reflow (`void el.offsetHeight`) between removing the old class and adding the new one so the animation replays.

---

### 3. Notification Badge

Slide a small badge onto a trigger and pop the dot. Two-phase: (1) badge slides onto the trigger with `ease-out`, (2) the dot itself pops with an elastic overshoot.

**Trigger:** new notification, unread count > 0.

Animate the **dot**, not the trigger element.

---

### 4. Text States Swap

Swap text in place with a blurred up/down transition. Old text exits down with blur, new text enters from above.

**Trigger:** label or status text changes in place (e.g. "Save" → "Saved", "Online" → "Offline").

Force a DOM reflow between class removal and addition.

---

### 5. Menu Dropdown

Open an origin-aware dropdown that grows from its trigger. Scales from `0.97` at the trigger's origin, opacity fades in.

**Close:** faster (150ms), scales to `0.99`. Always clean up the `.is-closing` class via `setTimeout` — without it, the next open starts from the closing scale.

**Trigger:** any anchored surface: nav menus, comboboxes, context menus, command palette.

---

### 6. Modal

Scale-up modal dialog (`0.96` → `1.0`) with a softer scale-down on close. Transform origin stays centered — modals are viewport-anchored, not trigger-anchored.

**Trigger:** centered overlays with backdrop.

**Not for:** side panels (use panel reveal), inline drawers (use card resize).

---

### 7. Panel Reveal

Slide a panel into a page region with a cross-blur. Enters from the bottom or side, exits with blur dissolve. Longer than a modal because it commands a region of the page.

**Trigger:** detail panes, code editors, settings sidebars, AI chat side panels.

---

### 8. Page Side-by-Side

Slide between two conceptually parallel screens. Current page exits left (blur + translate), next page enters from the right.

**Trigger:** list ↔ detail, wizard step 1 ↔ step 2, onboarding flow pages.

Animate the **page sections**, not the outer container.

---

### 9. Icon Swap

Cross-fade two icons in the same slot with blur and scale. Outgoing icon fades/scales to `0.25`, incoming icon blurs in from same scale.

**Trigger:** same icon slot switches between two icons (play/pause, mic on/off, like/unlike, check/error).

---

## Output Format

When inserting a transition:

1. Add the universal `:root` block to the global stylesheet once — skip if already present.
2. Paste the transition's CSS verbatim. Do not collapse into shorthand, do not strip `will-change`.
3. Wire the HTML hooks: class names (`.t-dropdown`, `.t-modal`, …) and state attributes (`data-open`, `data-state`, `.is-open`, `.is-closing`, `.is-enter-start`, `.is-animating`).
4. Preserve the `@media (prefers-reduced-motion: reduce)` block — every snippet ships one.
5. For transitions requiring JS (dropdown, modal, text swap, number pop-in, page slide), copy the orchestration snippet and keep the `getComputedStyle(…).getPropertyValue("--…")` reads so durations stay in sync with `:root` values.

Keep the diff small: only edit files needed. Don't rename existing variables, don't reformat unrelated CSS.

---

## Common Mistakes

| Mistake | Fix |
|---|---|
| Stripping close-state class cleanup | Keep the `setTimeout` that removes `.is-closing` — without it, next open starts from closing scale |
| Forgetting the reflow | `void el.offsetHeight` between class removal and re-addition guarantees animation replay |
| Animating a single container | For badge: animate the dot. For page slide: animate sections, not the container |
| Replacing enumerated `transition:` with `transition: all` | Enumerate exact properties — `all` lets unrelated changes ride the transition |
| Same duration for open and close | Close should always be faster than open (~60% of open duration) |
