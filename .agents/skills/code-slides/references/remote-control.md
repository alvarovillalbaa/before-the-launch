# Remote Control

Implement remote navigation for every deck.

## Required Roles

- `screen`: Presentation display mode.
- `remote`: Controller mode for phone/tablet/laptop.

Implement role selection via query params when possible:

- `?role=screen&deck=<deckId>`
- `?role=remote&deck=<deckId>`

## Required Commands

Support these commands at minimum:

- `next`
- `prev`
- `goto` (payload: slide index)
- `first`
- `last`

Use a JSON envelope:

```json
{
  "deckId": "demo-deck",
  "command": "goto",
  "index": 3,
  "timestamp": 1740787200000,
  "sender": "remote"
}
```

## Transport Strategy

Apply this order:

1. Existing project realtime channel for cross-device control.
2. BroadcastChannel fallback for same-browser testability.

Keep transport adapters isolated from slide rendering logic.

## Navigation Bar Placement

Expose a setting with exactly two allowed values:

- `right`
- `bottom`

Apply placement through a single config source (for example, query param, environment variable, or deck config object). Avoid duplicated placement state.

## Accessibility and Input

- Keep keyboard navigation active: `ArrowRight`, `ArrowLeft`, `PageDown`, `PageUp`, `Home`, `End`.
- Ensure remote controls are touch-friendly (minimum 44px targets).
- Add clear active-slide feedback in remote mode.

## Acceptance Checks

A remote implementation is complete only when:

1. Two tabs can control one another through fallback transport.
2. Cross-device control works when realtime transport is configured.
3. Nav placement switches cleanly between `right` and `bottom`.
4. Screen state and remote state remain synchronized after rapid command bursts.
