# HTML Template

## Quick Start

1. Serve this folder from any static server.
2. Open `index.html?role=screen` for the presentation view.
3. Open `remote.html?deck=<deck-id>` on a phone/tablet for remote controls.

## Remote Transport

- Default: `BroadcastChannel` for same-browser communication.
- Optional: set `window.SLIDES_REMOTE_WS = "wss://your-relay"` before `deck.js` loads for cross-device control.

## Navigation Position

Use `?nav=right` or `?nav=bottom`, or set the default in `deck.js` config.
