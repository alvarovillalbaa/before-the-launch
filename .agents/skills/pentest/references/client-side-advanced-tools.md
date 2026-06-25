# Client-Side Advanced Tools

Use this reference when the pentest needs repeatable browser-side validation instead of ad hoc manual notes. The functions below are tool patterns and helper signatures, not guaranteed built-ins. Adapt them to the repo, harness, or browser stack in use.

## Environment Setup

- Modern browser with DevTools access, typically Chrome or Firefox
- Burp Suite for intercepting cross-origin and WebSocket traffic
- Local PoC hosting, for example `python -m http.server`, to serve attacker-origin HTML
- Playwright or Puppeteer for repeatable browser automation and screenshot-backed validation
- Optional Python clients for direct WebSocket replay and message injection

## Common Response Fields

When wrapping helpers or scripts, prefer returning:

- `success`: boolean
- `stdout`, `stderr`: command output
- `vulnerable`: boolean indicator tied to a validated condition
- `poc_html`: generated PoC HTML when the workflow produces a standalone exploit page

## CORS Testing

- `corscanner_scan(url, origin="", headers="", verbose=False, additional_args="")`
  Automated CORS misconfiguration scan for reflected origins, null origins, wildcards, and weak trust rules.
- `curl_cors_test(url, origin, method="GET", credentials=True)`
  Manual CORS validation through raw requests. Use to confirm ACAO, ACAC, and preflight behavior.
- `cors_poc_generate(target_url, attacker_origin, action="read", output_file="")`
  Generate a standalone HTML PoC for data read, state change, or preflight edge-case validation.

## WebSocket Testing

- `websocket_client_connect(url, origin="", headers="", protocols="", additional_args="")`
  Connect with a custom origin or auth shape to test upgrade-time trust decisions.
- `websocket_inject(url, payload, origin="", auth_token="")`
  Send representative message payloads through a WebSocket flow to validate message-level auth and input handling.
- `cswsh_poc_generate(ws_url, attacker_origin, output_file="")`
  Build a browser PoC for Cross-Site WebSocket Hijacking with a victim session.

## Clickjacking And Framing

- `clickjack_test(url, check_headers=True, check_csp=True)`
  Check whether the target can be framed and whether header protections are present.
- `clickjack_poc_generate(target_url, action_description="", output_file="")`
  Generate an iframe-based overlay PoC for sensitive actions.
- `playwright_frame_test(url, headless=True)`
  Automate iframe embedding and screenshot capture to confirm whether the page renders inside a hostile frame.

## Web Messaging

- `postmessage_scanner(url, headless=True, timeout=10)`
  Discover message handlers and note origin-validation behavior.
- `postmessage_poc_generate(target_url, handler_info, payload, output_file="")`
  Generate a page that opens or embeds the target and sends crafted `postMessage` payloads.

## CSS Injection And Storage

- `css_inject_test(url, param, payload="")`
  Validate whether untrusted input reaches a CSS context that permits exfiltration or UI manipulation.
- `storage_inspector(url, headless=True)`
  Enumerate `localStorage`, `sessionStorage`, and IndexedDB for tokens, secrets, or sensitive cached data.
- `service_worker_audit(url, headless=True)`
  Enumerate service workers, cache contents, and cache-poisoning or over-caching opportunities.

## Tool Selection Notes

- Use raw `curl` or proxy-driven testing for initial CORS validation before generating PoC HTML.
- Use browser PoCs when the exploit depends on cookies, cross-window messaging, framing, or victim interaction.
- Use Playwright when you need repeatable evidence, screenshots, or automation across multiple steps.
- Use direct WebSocket clients when you need fine-grained control over handshake headers, message timing, or replay.
