# Client-Side Advanced Workflows

Use this reference when the authorized target includes browser-side attack surfaces that are not covered well by standard XSS-centric testing. These workflows focus on WSTG-CLNT cases where the exploit depends on browser security boundaries, attacker-controlled origins, framing, or client-side state.

## Prerequisites

- Obtain written authorization that explicitly includes browser-side or client-side testing scope.
- Provision attacker-controlled test origins for PoC pages when validating cross-origin or framing issues.
- Use a modern browser with DevTools access and an intercepting proxy such as Burp.
- Prepare test accounts that let you observe victim-side data access, privileged actions, or multi-role state changes.
- Confirm acceptable user-interaction simulation, automation, and local PoC hosting before testing.

## Coverage Map

| WSTG ID | Area | What to validate |
|---|---|---|
| WSTG-CLNT-05 | CSS injection | Data exfiltration, UI manipulation, style-context injection |
| WSTG-CLNT-06 | Client-side storage and resources | Sensitive data in storage, IndexedDB exposure, service worker cache abuse |
| WSTG-CLNT-07 | CORS | Arbitrary origin trust, credential leakage, null origin acceptance |
| WSTG-CLNT-09 | Clickjacking | Missing frame protections, UI redressing, multi-step action abuse |
| WSTG-CLNT-10 | WebSocket | Missing origin validation, CSWSH, weak auth on upgrade or per-message actions |
| WSTG-CLNT-11 | Web messaging | Missing `event.origin` validation, unsafe message handling, DOM or state abuse |

## Assessment Order

1. Enumerate browser-relevant entry points: pages, embedded apps, popups, iframes, storage usage, service workers, and WebSocket endpoints.
2. Identify which findings require an attacker-controlled origin, a framed page, a popup relationship, or a logged-in victim session.
3. Test passive misconfigurations first: frame headers, CSP `frame-ancestors`, CORS policy shape, message handlers, storage contents, and service worker registrations.
4. Move to active exploit validation with standalone PoC HTML or browser automation.
5. Record exact preconditions: attacker origin, victim auth state, required clicks, browser behavior, and sensitive data or action impact.

## CORS Misconfiguration (WSTG-CLNT-07)

Validate whether the application exposes sensitive responses to arbitrary origins.

Check for:

- reflected `Origin` values in `Access-Control-Allow-Origin`,
- `Origin: null` acceptance,
- wildcard or suffix-based trust that accepts attacker-controlled subdomains,
- `Access-Control-Allow-Credentials: true` combined with attacker-readable responses,
- sensitive endpoints that become readable cross-origin when the victim is authenticated.

Minimum validation flow:

1. Send manual requests with attacker origins and compare ACAO behavior.
2. Repeat with credentialed requests where allowed by scope.
3. Build a standalone HTML PoC that reads or mutates data from an attacker origin.
4. Capture what data becomes available and whether user interaction is required.

## WebSocket Security (WSTG-CLNT-10)

Treat browser-facing WebSocket endpoints as both API and client-side attack surfaces.

Check for:

- missing or weak origin validation during the upgrade,
- acceptance of cross-site connections that ride victim cookies,
- missing auth on connect,
- privileged actions enforced only at connect time and not per message,
- injection or state-manipulation payloads delivered through WebSocket messages.

Minimum validation flow:

1. Connect from an attacker origin or custom client.
2. Compare anonymous, low-privilege, and victim-session behavior.
3. Attempt CSWSH with a browser PoC page.
4. Verify whether sensitive events, subscriptions, or actions are available cross-site.

## Clickjacking (WSTG-CLNT-09)

Validate whether sensitive pages can be framed and manipulated into unintended user actions.

Check for:

- missing `X-Frame-Options`,
- missing or weak CSP `frame-ancestors`,
- pages that render normally inside an attacker iframe,
- transparent overlay or offset iframe positioning that lands clicks on sensitive controls,
- multi-step click flows or drag-and-drop sequences that can be abused.

Report both the technical gap and the business action enabled by framing.

## Web Messaging / `postMessage` Abuse (WSTG-CLNT-11)

Inspect message handlers for trust decisions based on `event.data` without strict `event.origin` checks.

Check for:

- missing allowlists on message origin,
- message handlers that update DOM or application state directly,
- unsafe deserialization or merging that enables prototype pollution,
- popup or iframe relationships that let an attacker window send trusted-looking messages.

Validate with a PoC page that opens or embeds the target and sends crafted messages.

## CSS Injection (WSTG-CLNT-05)

Use when untrusted input lands inside style attributes, stylesheet blocks, or other CSS contexts.

Check for:

- attribute-selector exfiltration patterns,
- CSS-only UI overlays or fake forms,
- user-controlled URLs inside `background-image`, `@import`, or related properties,
- character-by-character exfiltration patterns where browser requests leak secret values.

Keep validation non-destructive and prefer callback-only demonstrations over full data exfiltration.

## Client-Side Storage And Service Workers (WSTG-CLNT-06)

Check whether the application stores security-sensitive material where browser compromise or XSS would trivially expose it.

Inspect:

- `localStorage` and `sessionStorage` for tokens, secrets, or PII,
- IndexedDB for cached responses or credential-like data,
- service worker caches for authenticated responses or other sensitive artifacts,
- consistency between cookie protections and storage usage.

Document whether the exposure is direct, requires XSS, requires physical browser access, or is reachable through another confirmed issue.

## Reporting Guidance

For each confirmed client-side issue, capture:

- target page or endpoint,
- attacker origin or framing requirement,
- victim authentication state,
- required user interaction,
- data exposed or action achieved,
- exact PoC HTML or automation steps,
- remediation tied to the broken trust boundary.
