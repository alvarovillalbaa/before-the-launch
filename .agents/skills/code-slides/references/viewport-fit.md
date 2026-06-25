# Viewport Fit

Treat viewport fit as mandatory for every slide deck.

## Golden Rule

Each slide must fit one viewport height. Never rely on scrolling inside a slide to reveal hidden content. If content does not fit, split it into additional slides or reduce density.

## Content Density Limits

Use these limits as defaults unless the user explicitly accepts a denser technical slide:

| Slide type | Default limit |
| --- | --- |
| Title slide | 1 heading, 1 subtitle, optional tagline |
| Content slide | 1 heading and 4-6 bullets, or 2 short paragraphs |
| Feature grid | 1 heading and up to 6 cards |
| Code slide | 1 heading and 8-10 lines of code |
| Quote slide | 1 quote up to 3 lines plus attribution |
| Image slide | 1 heading and 1 focal image up to roughly 60vh |

## Required CSS Rules

Apply these rules in HTML or React implementations:

```css
html, body {
  height: 100%;
  overflow-x: hidden;
}

html {
  scroll-snap-type: y mandatory;
  scroll-behavior: smooth;
}

.slide {
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  scroll-snap-align: start;
  display: flex;
  flex-direction: column;
  position: relative;
}

.slide-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-height: 100%;
  overflow: hidden;
  padding: var(--slide-padding);
}

:root {
  --title-size: clamp(1.5rem, 5vw, 4rem);
  --h2-size: clamp(1.25rem, 3.5vw, 2.5rem);
  --body-size: clamp(0.75rem, 1.5vw, 1.125rem);
  --small-size: clamp(0.65rem, 1vw, 0.875rem);
  --slide-padding: clamp(1rem, 4vw, 4rem);
  --content-gap: clamp(0.5rem, 2vw, 2rem);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
  gap: clamp(0.5rem, 1.5vw, 1rem);
}

img, .image-container {
  max-width: 100%;
  max-height: min(50vh, 400px);
  object-fit: contain;
}

@media (max-height: 700px) {
  :root {
    --slide-padding: clamp(0.75rem, 3vw, 2rem);
    --content-gap: clamp(0.4rem, 1.5vw, 1rem);
    --title-size: clamp(1.25rem, 4.5vw, 2.5rem);
  }
}

@media (max-height: 600px) {
  :root {
    --slide-padding: clamp(0.5rem, 2.5vw, 1.5rem);
    --title-size: clamp(1.1rem, 4vw, 2rem);
    --body-size: clamp(0.7rem, 1.2vw, 0.95rem);
  }
}

@media (max-height: 500px) {
  :root {
    --slide-padding: clamp(0.4rem, 2vw, 1rem);
    --title-size: clamp(1rem, 3.5vw, 1.5rem);
    --body-size: clamp(0.65rem, 1vw, 0.85rem);
  }
}

@media (max-width: 600px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
```

## Validation Checklist

Confirm all of the following before delivery:

- Every `.slide` uses `height: 100vh`, `height: 100dvh`, and `overflow: hidden`.
- Typography and spacing use `clamp()` or viewport-relative sizing.
- Content respects density limits instead of shrinking below readable sizes.
- Height breakpoints exist for 700px, 600px, and 500px.
- Images and cards have explicit max-height limits.
- No slide requires internal scrolling.

## Manual Test Sizes

Check representative viewports:

- Desktop: `1920x1080`, `1440x900`, `1280x720`
- Tablet: `1024x768`, `768x1024`
- Mobile: `414x896`, `375x667`
- Landscape phone: `896x414`, `667x375`
