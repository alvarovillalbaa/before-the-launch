# React/TypeScript Template

## Quick Integration

1. Copy `src/` files into your React + TypeScript app.
2. Render `App` (or wire `SlideDeck` / `RemoteControl` directly).
3. Open with `?role=screen` for presentation and `?role=remote` for controller.
4. Set `window.SLIDES_REMOTE_WS` or pass `wsUrl` to enable cross-device transport.

## Component Library Mode

This scaffold keeps `ControlButton` native by default for portability.
When user intent explicitly requests a component library, replace `ControlButton` in `SlideDeck.tsx` with project primitives:

- `shadcn`: `Button` from your local shadcn setup.
- `radix`: Radix primitives/themes components.
- `headless`: Headless UI controls styled via project classes.
