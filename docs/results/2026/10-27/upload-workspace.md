# Upload-only product intake and unified workspace

Status: source published and production deployment READY; focused import/backend/browser acceptance remains pending approval.

## Requirement and baseline

The [owning Notion page](https://app.notion.com/p/3b6a1ee8bd068081a408e5a8103912a6), fetched on 2026-10-27, records four requirements: sidebar navigation; unified Projects and Runs; New simulation inside a page; upload-only product intake supporting new and existing products.

The clean source baseline was [`a4709a1c6791fd5100f06b956730d55e372bafa2`](https://github.com/alvarovillalbaa/before-the-launch/commit/a4709a1c6791fd5100f06b956730d55e372bafa2). It had a header navbar, separate Projects/Runs navigation, a standalone simulation chooser, and manually required brief fields. Existing TXT/Markdown/CSV/JSON/PDF/DOCX parsing required a previously created project. Existing tables can represent imported partial briefs without a migration. The strict JSON project-creation API is preserved.

## Implementation contract

New-product creation accepts files only. Preview extracts their text without creating database records or stored originals. An explicit second action re-parses the original selected files, checks the preview digest, and creates the project, current partial brief, ready sources, and chunks in one database transaction. Failures retain the selected files and preview in the UI. No model call is needed to import documents.

Only explicitly named brief fields in structured JSON populate brief facts. Other document text remains available as source evidence. Missing facts are blank in storage and displayed as missing. A filename-derived project title is labeled as such; it is not evidence of a product name. Conflicting or invalid structured facts must be corrected in the uploaded documents, rather than silently overwritten. Uploaded content is rendered as plain text.

The intake allows up to five files totaling 750 KiB, also bounded by the existing server upload limit. This keeps the request below Next's default 1 MiB server-action body limit without changing production configuration. Original file parsing reuses the existing dependencies. No migration, dependency, Auth, provider, or production configuration change is part of this source repair.

Projects owns project and run browsing and the new/existing simulation chooser. Legacy `/runs` redirects to `/?view=runs`; `/new-simulation` redirects to `/?simulate=1`. Direct run details remain intact. Project sections use whitelisted query links (`sources`, `setup`, `runs`, `brief`) so navigation and displayed panels stay aligned. The sidebar reuses the existing responsive primitive, with only Projects, Sources, and Settings in primary navigation.

Independent source review found and closed two defects before publication: uncontrolled project tabs could drift from the setup URL, and a filename-derived title could have become a false brief fact. The final source uses URL-backed sections and a separate `preview.projectName`; omitted `brief.productName` remains blank in the persisted brief and later run snapshots.

## Verification and hosting limits

The checkout has no installed Next documentation. Per its `AGENTS.md`, the matching upstream [Next 16.2.9 forms guide](https://raw.githubusercontent.com/vercel/next.js/v16.2.9/docs/01-app/02-guides/forms.mdx) was read instead; no local dependency install was performed merely to read it. Node 24.21.0 with the existing TypeScript 5.9.3 parser accepted all 104 product/test TypeScript files and resolved all 203 local imports, with no syntax or local-path errors. This local check is a parser/import check, not a type compile. `git diff --check` passed. No local backend tests, browser sessions, app builds, broad type checking, or temporary CI were run for this change. The hosted production build is recorded below separately.

The existing manifest/lockfile, Next configuration, strict JSON schema/API, legacy actions, and database schema are byte-unchanged from the baseline. The existing ingestion module changes only by exporting its parser for reuse. No user-provided dirty changes were present when this checkout was created.

Seven PostgreSQL import cases and four Chromium desktop/mobile scenarios are authored but **not executed**. They include actual persistence/original-byte/chunk checks, injected source-write failure with rollback of a newly created workspace/personas/project, stale preview rejection, missing-fact provenance, UI request failures, navigation, fake runs, and reload. The inactive CI template parses as YAML, all 10 embedded shell blocks pass `bash -n`, and both generated runner-only test configurations pass TypeScript parsing; no workflow is installed. All 18 local links across the six changed Markdown documents resolve. Independent source review closed the test ownership, connection-target, trigger-cleanup, runner-context, and chunk-assertion issues before approval was requested. These are static checks, not runtime acceptance.

The acceptance database is a wholly disposable runner service, including its default workspace/personas; no zero-residue claim is made for a standalone suite before runner teardown. Successful PDF/DOCX extraction and ambiguous commit/crash recovery remain outside these fixtures. On a lost COMMIT acknowledgment, original files are conservatively retained; failed cleanup or a crash can leave owned staging orphans requiring later reconciliation.

Latest local Storage Guard preflight (`--need-gib 4`) exited 2: 24.9 GiB free versus 34.0 GiB required. No local dependency install, build, development server, or test database was created.

Read-only hosting inventory found Vercel project `prj_rSuzr7pJuiPUjPnyxqQ0ALiLk2AA` in team `team_JpdIsOJgYNpX0ywVZ54Zdb7m`. Existing production deployment `dpl_AJmdD8xd9ZFdCv42Pd1q3WofK53t` was READY at the baseline commit, and the [canonical URL](https://before-the-launch.vercel.app) returned HTTP 200 to HEAD. The unique deployment URL redirected to Vercel SSO; no bypass was attempted. These observations establish availability of the prior release only.

Managed database configuration remains unverified: the environment-name lookup returned 403, and was not retried or replaced with a secret lookup. No stored user rows were read. Source uses PostgreSQL and local filesystem originals; Blob is installed but not implemented. APIs/services share one workspace without an account ownership boundary. Durable public uploads therefore require an explicit hosting/access decision before claiming production readiness. No paid service or alternate capacity workaround is proposed.

Focused disposable acceptance is prepared in [the checks proposal](../../../proposals/import-workspace-checks.md) and [inactive workflow template](../../../proposals/import-workspace-ci.yml.example). Its execution remains subject to the user's backend/browser/CI approval gates.

## Publication and hosted build

Source commit [`d7d94f31eedbe363c476acb956c747f5db3e3d3a`](https://github.com/alvarovillalbaa/before-the-launch/commit/d7d94f31eedbe363c476acb956c747f5db3e3d3a), tree `0df9d85450da4cf7a16e1a96a986ec1027bdcc9a`, was pushed to personal-repository `main` and read back from the remote. No active workflow was added. This evidence-only follow-up leaves the application, tests, dependency files, and configuration identical to that source release.

The connected Vercel deployment [`dpl_3jeBaJvbiwGb3JczFu5Ctcq1D5DS`](https://vercel.com/my-team-4f230354/before-the-launch/3jeBaJvbiwGb3JczFu5Ctcq1D5DS) is READY for that exact source SHA and targets production. Its aliases include `before-the-launch.vercel.app`. The hosted Next 16.2.9 build compiled in 6.7 seconds, finished TypeScript in 7.5 seconds, and completed successfully. It emitted a nonblocking NFT tracing warning referencing `next.config.ts`; tracing/configuration was not changed. This is hosted compile/build proof, not execution of the seven import or four browser cases.

A connected Vercel fetch of the [canonical intake page](https://before-the-launch.vercel.app/projects/new) returned HTTP 200. Delivered HTML references the exact deployment ID, contains the upload/preview UI, has one file input and no manual brief inputs, and lists only Projects/Sources/Settings in primary navigation. This is static delivered-HTML proof. The local plain `curl` request failed DNS resolution, and the general web-fetch tool could not access the page; those failures were not treated as application failures or anonymous browser acceptance.

No files were submitted to production, no model was called, and no managed data/storage/Auth configuration was changed. The supplied-AGENTS approval request for the prepared disposable backend/browser/temporary-CI checks is pending. The wider all-project goal remains active.
