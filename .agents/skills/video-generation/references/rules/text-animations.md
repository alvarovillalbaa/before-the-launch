---
name: text-animations
description: 20-pattern named text animation catalog for Remotion — exact pacing, easing curves, stagger specs, and Remotion translation rules. Choose by target type (whole, per-character, per-word, per-line) and mood. Original specs from pixel-point/animate-text.
metadata:
  tags: typography, text, animation, easing, stagger, catalog, kinetic
---

# Text Animation Catalog

Vague guidance produces generic animations. This file contains precise, production-tested specs for 20 named animations. Each entry gives exact `duration_ms`, `stagger_ms`, easing curve, and `from/to` keyframes — enough for a Remotion implementation with no guessing.

Original specs from [pixel-point/animate-text](https://github.com/pixel-point/animate-text).

---

## Remotion Translation Rules

### ms → frames

```tsx
const toFrames = (ms: number, fps: number) => Math.round(ms * fps / 1000);
// At 30fps: 900ms → 27f, 700ms → 21f, 360ms → 11f, 46ms → 1f
// At 60fps: 900ms → 54f, 700ms → 42f, 360ms → 22f, 46ms → 3f
```

Always use `Math.max(1, toFrames(stagger_ms, fps))` — stagger rounds to 0 on low-fps values.

### Easing curves

```tsx
import {Easing} from 'remotion';
// Direct: cubic-bezier(x1, y1, x2, y2) → Easing.bezier(x1, y1, x2, y2)
// Y control points CAN exceed [0,1] for overshoot (spring-scale-in uses 1.56)
const EASE_SMOOTH   = Easing.bezier(0.22, 1, 0.36, 1);    // Apple ease-out (enters)
const EASE_SNAPPY   = Easing.bezier(0.2, 0.8, 0.2, 1);    // crisp decelerate (enters)
const EASE_SHARP_IN = Easing.bezier(0.64, 0, 0.78, 0);    // accelerate (exits)
const EASE_SPRING   = Easing.bezier(0.34, 1.56, 0.64, 1); // overshoot (spring pop)
const EASE_MATERIAL = Easing.bezier(0.2, 0, 0, 1);        // Material standard
```

### Blur — works as inline style

```tsx
// OK: filter in inline style
style={{ filter: `blur(${blur}px)` }}
// FORBIDDEN: CSS transition/animation and Tailwind animate-* classes
```

### `display: inline-block` required for per-character/word transforms

```tsx
// transform and filter do not apply to inline (text) elements
<span style={{ display: 'inline-block', transform: `translateY(${y}px)` }}>
  {char}
</span>
```

### `steps(1, end)` → instant frame flip

```tsx
// Typewriter: each character appears instantly at its stagger frame
const opacity = frame >= i * STAGGER_FRAMES ? 1 : 0;
```

### Total duration of a staggered animation

```tsx
const totalFrames = ENTER_FRAMES + (units.length - 1) * STAGGER_FRAMES;
```

---

## Core Implementation Patterns

### Per-character / per-word stagger loop

```tsx
import {interpolate, Easing, useCurrentFrame, useVideoConfig} from 'remotion';

const frame = useCurrentFrame();
const {fps} = useVideoConfig();

const ENTER_MS = 900;
const STAGGER_MS = 25;
const ENTER_FRAMES = Math.round(ENTER_MS * fps / 1000);
const STAGGER_FRAMES = Math.max(1, Math.round(STAGGER_MS * fps / 1000));

const units = text.split(''); // or split(' ') for per-word

return (
  <span>
    {units.map((unit, i) => {
      const delay = i * STAGGER_FRAMES;
      const local = Math.max(0, frame - delay);
      const opts = {easing: Easing.bezier(0.22, 1, 0.36, 1), extrapolateRight: 'clamp' as const};
      const opacity = interpolate(local, [0, ENTER_FRAMES], [0, 1], opts);
      const y      = interpolate(local, [0, ENTER_FRAMES], [16, 0], opts);
      const blur   = interpolate(local, [0, ENTER_FRAMES], [12, 0], opts);
      return (
        <span key={i} style={{display: 'inline-block', opacity, transform: `translateY(${y}px)`, filter: `blur(${blur}px)`}}>
          {unit === ' ' ? ' ' : unit}
        </span>
      );
    })}
  </span>
);
```

### Word-split preserving trailing spaces

```tsx
const words = text.split(' ').map((w, i, a) => (i < a.length - 1 ? w + ' ' : w));
```

### Per-line split

Use `text.split('\n')` or measure wrapped lines via `measureText` — see `measuring-text.md`.

### Whole-element pattern

```tsx
const opts = {easing: Easing.bezier(0.22, 1, 0.36, 1), extrapolateRight: 'clamp' as const};
const opacity = interpolate(frame, [0, ENTER_FRAMES], [0, 1], opts);
const y       = interpolate(frame, [0, ENTER_FRAMES], [8, 0], opts);
return <div style={{opacity, transform: `translateY(${y}px)`}}>{text}</div>;
```

### Exit timing inside a Sequence

```tsx
// frame 0 = start of this Sequence; durationInFrames = total scene length
const {durationInFrames} = useVideoConfig();
const EXIT_FRAMES = toFrames(600, fps);
const exitStart = durationInFrames - EXIT_FRAMES - (units.length - 1) * EXIT_STAGGER;
const localExit = Math.max(0, frame - Math.max(0, exitStart - i * EXIT_STAGGER));
const opacity = interpolate(localExit, [0, EXIT_FRAMES], [1, 0], {extrapolateRight: 'clamp'});
```

---

## Pattern Picker

| Goal | Best pattern |
|---|---|
| Apple hero title reveal | `soft-blur-in` |
| Crisp kinetic headline, no blur | `per-character-rise` |
| Pronounced letter staircase from below | `bottom-up-letters` |
| Pronounced letter staircase from above | `top-down-letters` |
| Editorial typing feel | `typewriter` |
| Calm keynote word-by-word | `per-word-crossfade` |
| Playful word pop / spring | `spring-scale-in` |
| Airy exit with blur departure | `blur-out-up` |
| Hard word-cut staircase | `word-cut-staircase` |
| Kinetic centered phrase build | `kinetic-center-build` |
| Shared horizontal move + opacity reveal | `short-slide-right` |
| Multiline controlled mask reveal | `mask-reveal-up` |
| Flowing paragraph line-by-line | `line-by-line-slide` |
| Subtle premium polish for labels | `micro-scale-fade` |
| Safe product UI default | `scale-down-fade` |
| Horizontal premium hero sweep | `shimmer-sweep` |
| Material-style same-slot replace | `fade-through` |
| Cinematic focus pull | `focus-blur-resolve` |
| Material depth transition | `shared-axis-z` |
| Kinetic top-down word stack | `short-slide-down` |

---

## Per-Character Animations

### `soft-blur-in` — Soft Blur

> Per-character fade-in with gentle blur and upward drift. Apple's signature hero-title reveal (iPhone, Mac, Vision Pro).

**Target:** `per-character`  
**Signature easing:** `cubic-bezier(0.22, 1, 0.36, 1)`

| Phase | Duration | Stagger | Easing |
|---|---|---|---|
| Enter | 900ms (27f @30fps) | 25ms (1f) | `cubic-bezier(0.22, 1, 0.36, 1)` |
| Exit | 600ms (18f) | 15ms (1f) | `cubic-bezier(0.64, 0, 0.78, 0)` |

Enter from→to: `opacity 0→1`, `y_px 16→0`, `blur_px 12→0`  
Exit from→to: `opacity 1→0`, `y_px 0→-16`, `blur_px 0→12`  
Swap: crossfade, overlap 300ms

**Use when:** hero headline at 48px+, solid or near-solid background. Scale blur down to 6px and stagger to 15ms for body text.

---

### `per-character-rise` — Per-Character Rise

> Letters slide up from below — crisp, deliberate, kinetic. No blur.

**Target:** `per-character`  
**Signature easing:** `cubic-bezier(0.2, 0.8, 0.2, 1)`

| Phase | Duration | Stagger | Easing |
|---|---|---|---|
| Enter | 700ms (21f @30fps) | 24ms (1f) | `cubic-bezier(0.2, 0.8, 0.2, 1)` |
| Exit | 420ms (13f) | 14ms (1f) | `cubic-bezier(0.7, 0, 0.84, 0)` |

Enter from→to: `opacity 0→1`, `y_px 32→0`  
Exit from→to: `opacity 1→0`, `y_px 0→-24`  
Swap: crossfade, overlap 210ms

**Use when:** kinetic headline without blur softness. Keep stagger ≥ 16ms or the staircase flattens.

---

### `bottom-up-letters` — Bottom-Up Letters

> Letters rise in a pronounced staircase from far below — one at a time, zero blur. Very staged.

**Target:** `per-character`  
**Signature easing:** `cubic-bezier(0.18, 1, 0.32, 1)`

| Phase | Duration | Stagger | Easing |
|---|---|---|---|
| Enter | 400ms (12f @30fps) | 88ms (3f) | `cubic-bezier(0.18, 1, 0.32, 1)` |
| Exit | 280ms (8f) | 28ms (1f) | `cubic-bezier(0.7, 0, 0.84, 0)` |

Enter from→to: `opacity 0→1`, `y_px 46→0`  
Exit from→to: `opacity 1→0`, `y_px 0→-14`  
Swap: sequential (exit completes first, then 35ms gap, then enter)

**Use when:** short single words, labels, or compact headlines at 40px+. If motion reads too tall, reduce enter y_px to 36.

---

### `top-down-letters` — Top-Down Letters

> Mirror of `bottom-up-letters` — characters descend from above in a staircase.

**Target:** `per-character`  
**Signature easing:** `cubic-bezier(0.18, 1, 0.32, 1)`

| Phase | Duration | Stagger | Easing |
|---|---|---|---|
| Enter | 400ms (12f @30fps) | 88ms (3f) | `cubic-bezier(0.18, 1, 0.32, 1)` |
| Exit | 280ms (8f) | 28ms (1f) | `cubic-bezier(0.7, 0, 0.84, 0)` |

Enter from→to: `opacity 0→1`, `y_px -46→0`  
Exit from→to: `opacity 1→0`, `y_px 0→14`  
Swap: sequential

**Use when:** same context as `bottom-up-letters` when top-to-bottom directionality fits the composition.

---

### `typewriter` — Typewriter

> Per-character stepped reveal with minimal typing rhythm. Characters flip on instantly.

**Target:** `per-character`  
**Signature easing:** `steps(1, end)` → in Remotion: `frame >= delay ? 1 : 0`

| Phase | Duration | Stagger | Easing |
|---|---|---|---|
| Enter | 240ms (7f @30fps) | 46ms (1–2f) | `steps(1, end)` |
| Exit | 260ms (8f) | 10ms (1f) | `cubic-bezier(0.7, 0, 0.84, 0)` |

Enter from→to: `opacity 0→1` (instant flip per character)  
Exit from→to: `opacity 1→0`, `y_px 0→-4`  
Swap: crossfade, no overlap, 85ms micro-delay

```tsx
// Remotion typewriter enter — instant per-character reveal
const STAGGER_FRAMES = Math.max(1, Math.round(46 * fps / 1000));
const opacity = frame >= i * STAGGER_FRAMES ? 1 : 0;
```

**Use when:** short copy, system-like typing feel, editorial utility. Do not apply to long lines.

---

## Per-Word Animations

### `per-word-crossfade` — Per-Word Crossfade

> Words fade into place one after another with a short upward drift. Calm keynote rhythm.

**Target:** `per-word`  
**Signature easing:** `cubic-bezier(0.16, 1, 0.3, 1)`

| Phase | Duration | Stagger | Easing |
|---|---|---|---|
| Enter | 700ms (21f @30fps) | 70ms (2f) | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Exit | 500ms (15f) | 40ms (1f) | `cubic-bezier(0.7, 0, 0.84, 0)` |

Enter from→to: `opacity 0→1`, `y_px 8→0`  
Exit from→to: `opacity 1→0`, `y_px 0→-6`  
Swap: crossfade, overlap 170ms, micro-delay 70ms

**Use when:** medium phrases or headings where word readability matters more than kinetic character flair. Cap at 16–18 words to keep total stagger time manageable.

---

### `spring-scale-in` — Spring Scale In

> Words pop in with a soft overshoot scale. iOS app icon bounce feel.

**Target:** `per-word`  
**Signature easing:** `cubic-bezier(0.34, 1.56, 0.64, 1)` (y1 > 1 = overshoot)

| Phase | Duration | Stagger | Easing |
|---|---|---|---|
| Enter | 360ms (11f @30fps) | 95ms (3f) | `cubic-bezier(0.34, 1.56, 0.64, 1)` |
| Exit | 200ms (6f) | 80ms (2f) | `cubic-bezier(0.7, 0, 0.84, 0)` |

Enter from→to: `opacity 0→1`, `scale 0.7→1`  
Exit from→to: `opacity 1→0`, `scale 1→0.8`  
Swap: no overlap, 35ms micro-delay

```tsx
// Overshoot requires y1 > 1 in bezier — Remotion supports this
const scale = interpolate(local, [0, ENTER_FRAMES], [0.7, 1], {
  easing: Easing.bezier(0.34, 1.56, 0.64, 1),
  extrapolateRight: 'clamp',
});
```

**Use when:** playful or product-reveal contexts. Apply per-word (not per-character) to keep bounce manageable.

---

### `blur-out-up` — Blur Out Up

> Words arrive cleanly and depart upward with increasing blur. Exit is more expressive than entry.

**Target:** `per-word`  
**Signature easing:** `cubic-bezier(0.22, 1, 0.36, 1)` (enter), `cubic-bezier(0.64, 0, 0.78, 0)` (exit)

| Phase | Duration | Stagger | Easing |
|---|---|---|---|
| Enter | 560ms (17f @30fps) | 28ms (1f) | `cubic-bezier(0.22, 1, 0.36, 1)` |
| Exit | 480ms (14f) | 24ms (1f) | `cubic-bezier(0.64, 0, 0.78, 0)` |

Enter from→to: `opacity 0→1`, `y_px 10→0`, `blur_px 6→0`  
Exit from→to: `opacity 1→0`, `y_px 0→-14`, `blur_px 0→8`  
Swap: crossfade, overlap 170ms, micro-delay 35ms

**Use when:** light typography on dark or gradient backgrounds where the exit blur adds air. Avoid very long lines.

---

### `word-cut-staircase` (`shared-axis-y`) — Word Cut Staircase

> Per-word hard-cut transitions with staircase timing. Sharp editorial.

**Target:** `per-word`  
**Signature easing:** `steps(1, end)` → instant flip

| Phase | Duration | Stagger | Easing |
|---|---|---|---|
| Enter | 180ms (5f @30fps) | 78ms (2f) | `steps(1, end)` |
| Exit | 140ms (4f) | 78ms (2f) | `steps(1, end)` |

Enter from→to: `opacity 0→1` (instant)  
Exit from→to: `opacity 1→0` (instant)  
Swap: crossfade, no overlap, 28ms micro-delay

**Use when:** bold, journalistic word-by-word cuts. No spatial movement — pure opacity staircase.

---

### `kinetic-center-build` — Kinetic Center Build

> Words arrive right-to-left; each new word pushes existing words left until the phrase locks centered. Layout-aware.

**Target:** `per-word` | **Custom renderer:** `kinetic-center-build`  
**Signature easing:** `cubic-bezier(0.2, 0.8, 0.2, 1)`

| Phase | Duration | Stagger | Easing |
|---|---|---|---|
| Enter | 360ms (11f @30fps) | 0ms | `cubic-bezier(0.2, 0.8, 0.2, 1)` |
| Exit | 260ms (8f) | 0ms | `cubic-bezier(0.4, 0, 0.2, 1)` |

Enter from→to: `opacity 0→1`, `y_px 6→0`, `scale 0.992→1`, `blur_px 3.5→0`  
Exit from→to: `opacity 1→0`, `y_px 0→-6`, `blur_px 0→2.5`  
Swap: sequential, no overlap, 220ms between phrases

**Build params:** `entry_offset_px: 88`, `push_duration_ms: 430`, `word_gap_px: 10`, `line_alignment: center`

**Implementation note:** requires measuring word widths and animating all existing words to new x-positions as each word arrives. Use `measuring-dom-nodes.md` or `measuring-text.md` for width measurements. Best for short 2–3 word phrases.

---

### `short-slide-right` — Short Slide Right

> Whole phrase glides in as one shared horizontal move; words are revealed only via opacity stagger.

**Target:** `per-word` | **Custom renderer:** `shared-slide-opacity-stage`

| Phase | Duration | Stagger | Easing |
|---|---|---|---|
| Enter | 520ms (16f @30fps) | 92ms (3f) | `cubic-bezier(0.2, 0.8, 0.2, 1)` |
| Exit | 320ms (10f) | 0ms | `cubic-bezier(0.4, 0, 0.2, 1)` |

Enter from→to (entire phrase): `x_px -24→0`, `blur_px 1.2→0` (opacity stays 1 on container)  
Word opacity: each word fades in sequentially via `word_opacity_duration_ms: 210ms (6f)`  
Exit from→to: `opacity 1→0`, `x_px 0→12`, `blur_px 0→1`  
Swap: sequential, no overlap, 70ms micro-delay

**Implementation note:** animate one shared wrapper for the x/blur motion; independently animate each word's opacity with stagger. Keep x travel ≤ 24px or the phrase reads "swishy".

---

## Per-Line Animations

### `mask-reveal-up` — Mask Reveal Up

> Lines reveal upward with compact stagger. Controlled multiline reveal.

**Target:** `per-line`  
**Signature easing:** `cubic-bezier(0.22, 1, 0.36, 1)`

| Phase | Duration | Stagger | Easing |
|---|---|---|---|
| Enter | 760ms (23f @30fps) | 90ms (3f) | `cubic-bezier(0.22, 1, 0.36, 1)` |
| Exit | 520ms (16f) | 70ms (2f) | `cubic-bezier(0.64, 0, 0.78, 0)` |

Enter from→to: `opacity 0→1`, `y_px 30→0`, `blur_px 6→0`  
Exit from→to: `opacity 1→0`, `y_px 0→-22`, `blur_px 0→6`  
Swap: crossfade, overlap 210ms, micro-delay 35ms

**Use when:** 2–3 line headings where line order should stay legible. Apply `overflow: hidden` on each line wrapper to sell the mask effect.

---

### `line-by-line-slide` — Line-by-Line Slide

> Each line enters from the left, exits to the right. Flowing paragraph reveal.

**Target:** `per-line`  
**Signature easing:** `cubic-bezier(0.22, 1, 0.36, 1)`

| Phase | Duration | Stagger | Easing |
|---|---|---|---|
| Enter | 900ms (27f @30fps) | 120ms (4f) | `cubic-bezier(0.22, 1, 0.36, 1)` |
| Exit | 600ms (18f) | 80ms (2f) | `cubic-bezier(0.64, 0, 0.78, 0)` |

Enter from→to: `opacity 0→1`, `x_px -48→0`  
Exit from→to: `opacity 1→0`, `x_px 0→48`  
Swap: no overlap, 20ms micro-delay

**Use when:** 2–3 line headings or subheads. Reduce x_px to 32 for narrow layouts.

---

## Whole-Element Animations

These apply to the full text block — no splitting required. Lower implementation complexity; best when the text is short and the stage does not need kinetic character work.

### `micro-scale-fade` — Micro Scale Fade

> Tiny scale pop — subtle premium polish for labels and secondary copy.

**Target:** `whole`

| Phase | Duration | Easing |
|---|---|---|
| Enter | 600ms (18f @30fps) | `cubic-bezier(0.32, 0.72, 0, 1)` |
| Exit | 400ms (12f) | `cubic-bezier(0.7, 0, 0.84, 0)` |

Enter from→to: `opacity 0→1`, `scale 0.96→1`  
Exit from→to: `opacity 1→0`, `scale 1→0.96`  
Swap: no overlap, 20ms micro-delay

**Use when:** single words, status labels, onboarding micro-copy. Switch to `per-word` target for paragraphs to avoid perceptible lag.

---

### `scale-down-fade` — Scale Down Fade

> Subtle settle-in from a slight scale-up. Safe product UI default.

**Target:** `whole`

| Phase | Duration | Easing |
|---|---|---|
| Enter | 520ms (16f @30fps) | `cubic-bezier(0.22, 1, 0.36, 1)` |
| Exit | 380ms (11f) | `cubic-bezier(0.64, 0, 0.78, 0)` |

Enter from→to: `opacity 0→1`, `y_px 8→0`, `scale 1.04→1`  
Exit from→to: `opacity 1→0`, `y_px 0→-8`, `scale 1→0.94`  
Swap: crossfade, overlap 130ms, micro-delay 20ms

**Use when:** product UI copy that should feel polished but not animated. Reliable default when no other pattern is specified.

---

### `shimmer-sweep` — Shimmer Sweep

> Whole phrase glides in from slight left with blur — premium horizontal sweep.

**Target:** `whole`

| Phase | Duration | Easing |
|---|---|---|
| Enter | 850ms (26f @30fps) | `cubic-bezier(0.22, 1, 0.36, 1)` |
| Exit | 650ms (20f) | `cubic-bezier(0.7, 0, 0.84, 0)` |

Enter from→to: `opacity 0→1`, `x_px -22→0`, `blur_px 8→0`  
Exit from→to: `opacity 1→0`, `x_px 0→22`, `blur_px 0→8`  
Swap: no overlap, 36ms micro-delay

**Use when:** title swaps and copy refreshes where motion should feel premium and directional without staggering characters.

---

### `fade-through` — Fade Through

> Old fades out first, new fades in with slight upward lift and delay. Material-style swap.

**Target:** `whole`

| Phase | Duration | Easing |
|---|---|---|
| Enter | 420ms (13f @30fps) | `cubic-bezier(0.2, 0, 0, 1)` |
| Exit | 260ms (8f) | `cubic-bezier(0.4, 0, 1, 1)` |

Enter from→to: `opacity 0→1`, `y_px 6→0`, `scale 0.99→1`, `blur_px 2→0`  
Exit from→to: `opacity 1→0`, `y_px 0→-4`  
Swap: crossfade, overlap 20ms, micro-delay 60ms

**Use when:** replacing content in the same layout slot without directional meaning. The micro-delay gap creates a perceivable "between" state.

---

### `focus-blur-resolve` — Focus Blur Resolve

> Cinematic focus pull from heavy blur to crisp text. Premium hero transitions.

**Target:** `whole`

| Phase | Duration | Easing |
|---|---|---|
| Enter | 760ms (23f @30fps) | `cubic-bezier(0.22, 1, 0.36, 1)` |
| Exit | 520ms (16f) | `cubic-bezier(0.64, 0, 0.78, 0)` |

Enter from→to: `opacity 0→1`, `y_px 14→0`, `blur_px 14→0`, `scale 1.01→1`  
Exit from→to: `opacity 1→0`, `y_px 0→-10`, `blur_px 0→10`  
Swap: crossfade, overlap 160ms, micro-delay 35ms

**Use when:** large headlines (48px+) where heavy blur reads as intentional cinematic restraint. Do not use on body text — blur at small sizes is noise, not intent.

---

### `shared-axis-z` — Shared Axis Z

> Scale-based depth transition — new content enters from slightly smaller scale.

**Target:** `whole`

| Phase | Duration | Easing |
|---|---|---|
| Enter | 520ms (16f @30fps) | `cubic-bezier(0.2, 0, 0, 1)` |
| Exit | 360ms (11f) | `cubic-bezier(0.4, 0, 1, 1)` |

Enter from→to: `opacity 0→1`, `scale 0.9→1`, `blur_px 2→0`  
Exit from→to: `opacity 1→0`, `scale 1→1.06`, `blur_px 0→1`  
Swap: crossfade, overlap 100ms, micro-delay 20ms

**Use when:** focus shifts and context depth changes. The exit scales up (zooms forward) while the enter scales in — communicates Z-axis depth.

---

## Kinetic Stack Builds

### `short-slide-down` — Short Slide Down

> Each new word drops from above onto its own line and pushes the existing stack down until a centered 3-line composition locks.

**Target:** `per-word` | **Custom renderer:** `kinetic-top-build`

| Phase | Duration | Easing |
|---|---|---|
| Enter | 520ms (16f @30fps) | `cubic-bezier(0.2, 0.8, 0.2, 1)` |
| Exit | 320ms (10f) | `cubic-bezier(0.4, 0, 0.2, 1)` |

Enter from→to: `opacity 0→1`, `y_px -24→0`, `blur_px 2.4→0`, `scale 0.992→1`  
Exit from→to: `opacity 1→0`, `y_px 0→10`, `blur_px 0→1.2`  

**Build params:**  
`first_word_duration_ms: 360`, `push_duration_ms: 500`, `hold_ms: 1100`,  
`entry_offset_y_px: -28`, `line_gap_px: 12`, `reflow_blur_px: 0.7`

**Implementation note:** like `kinetic-center-build` but vertical — each new word arrives top-down and pushes prior words down into a centered stack. Requires layout-aware animation: measure line heights and animate existing words to new y-positions. Best for 3-word stacks (one word per line). If drop feels subtle, increase `entry_offset_y_px` to 36.

---

## Swap Modes

When text content changes in the same slot:

| Mode | Behavior | Best for |
|---|---|---|
| `crossfade` | old exits and new enters with overlap | most animations; smooth reading |
| `sequential` | old exit completes before new enter starts | animations with directional motion that would collide |
| `morph` | character-level morph (not covered here) | specialized use |

**Crossfade start formula (ms):**
```
new_enter_start_ms = exit_total_ms - overlap_ms + micro_delay_ms
exit_total_ms = exit.duration_ms + (count - 1) * exit.stagger_ms
```

**Sequential start formula (ms):**
```
new_enter_start_ms = exit_total_ms + micro_delay_ms
```

---

## Anti-Patterns

Do not:

- Apply per-character animation to long body paragraphs — total stagger span becomes many seconds.
- Use `steps(1,end)` via CSS animation — use frame comparison (`frame >= delay ? 1 : 0`) in Remotion.
- Forget `display: inline-block` on `<span>` wrappers — transforms will silently do nothing.
- Use `filter: blur()` via a CSS class or `style tag` — only inline styles work in Remotion.
- Mix two stagger animations on the same text in the same Sequence without stagger offset accounting.
- Invent timing numbers without referencing this catalog — precision is the point.
