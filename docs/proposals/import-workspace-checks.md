# Focused import and workspace acceptance

Status: proposed; execution and temporary CI installation require approval.

The [recorded product requirements](https://app.notion.com/p/3b6a1ee8bd068081a408e5a8103912a6) call for a sidebar, one Projects surface for projects and runs, an in-page simulation entry point, and file-only new-product intake. The implementation is reviewed as one vertical flow rather than navigation alone.

## Proposed scope

Use the public repository's standard Ubuntu runner with a 15-minute job timeout, read-only repository permissions, pinned checkout/setup-node actions, Node 24.21.0, and the existing frozen pnpm lockfile. Install only on a task-specific acceptance branch and remove the active workflow after acceptance. Keep the inactive template as the review record. No secrets, paid plan, persistent runner, cache, artifact upload, credentials, or production environment is needed.

Create one runner-owned PostgreSQL 17 service with an empty `before_launch_intake_ci` database and disposable credentials. Apply the **existing** Drizzle schema only to that database; no schema file or production database changes. Store originals under the runner's temporary directory. Use fake simulation mode explicitly, with AI/Gateway/Blob credentials unset. Destroy the service and temporary files with the runner on every outcome.

Run targeted import service checks for:

- Exact structured JSON mapping, provenance, missing facts, and ordinary JSON/prose as source context.
- Empty, unsupported, conflicting, malformed, oversized, or invalid-text uploads and stale preview digests, with zero persisted projects on rejection.
- Actual project/brief/source/chunk creation in PostgreSQL, including equality of saved originals and extracted content.
- Injected database-write failure: rollback all rows and remove only the failed operation's staged originals.

The seven authored cases live in [the integration source](../../tests/integration/product-intake.test.ts), outside the default unit-suite include. The test entry rejects connection URL query/hash overrides, requires the exact disposable loopback database, and establishes ownership of a fresh storage directory before it can clean that directory. Temporary trigger/function setup is guarded by tracked ownership. The default workspace/personas remain available to the later browser step; disposal of the entire runner service is the final fixture boundary.

Run four isolated Chromium scenarios against a loopback Next development server:

1. Desktop: upload, review, create, run a labeled fake simulation, reload, and find the persisted run under Projects.
2. Mobile with touch emulation: open/close the sidebar, import plain text with missing brief fields, inspect the workspace, and check horizontal fit.
3. Failed preview/create requests retain selected files and allow retry; no project is created by preview.
4. Legacy `/runs` and `/new-simulation` links lead into Projects; new and existing products both have an in-page simulation path.

Use authored documents and an empty browser context. Block requests to external hosts from the acceptance browser. Disable traces, screenshots, videos, automatic retries, and report uploads. Retain bounded textual results and exact source identity in the owning repository's results record.

The four authored scenarios are in [the focused browser source](../../tests/e2e/import-workspace.spec.ts). The [inactive workflow template](import-workspace-ci.yml.example) selects only these cases and the seven import cases; it does not invoke the broader existing browser configuration. YAML parsing and shell syntax checks are static review only.

## Proof boundaries

These checks would establish behavior in the disposable CI environment. They would not establish production Auth, user ownership, durable hosted file storage, provider/model behavior, Safari, or physical-device behavior. The current public host's availability is separate from import acceptance. No managed database or storage provisioning is included in this proposal.

Local execution is not proposed: Storage Guard reported 24.9 GiB free versus 34.0 GiB required. User `AGENTS.md` §§7 and 14 require explicit approval for backend/browser checks and temporary CI.
