# Upload-only product intake and unified workspace

Status: source published; seven PostgreSQL checks and four desktop/mobile Chromium scenarios pass. The temporary CI workflow is removed. Production persistence/access and physical-device limits remain below.

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

Before runtime execution, the inactive CI template parsed as YAML, all 10 embedded shell blocks passed `bash -n`, and both generated runner-only test configurations passed TypeScript parsing. All 18 then-current local links across the six changed Markdown documents resolved. Independent source review closed the test ownership, connection-target, trigger-cleanup, runner-context, and chunk-assertion issues before approval was requested. These checks were recorded separately from the subsequent runtime acceptance below.

The acceptance database was a wholly disposable runner service, including its default workspace/personas. Successful PDF/DOCX extraction and ambiguous commit/crash recovery remain outside these fixtures. On a lost COMMIT acknowledgment, original files are conservatively retained; failed cleanup or a crash can leave owned staging orphans requiring later reconciliation.

Latest local Storage Guard preflight (`--need-gib 4`) exited 2: 24.9 GiB free versus 34.0 GiB required. No local dependency install, build, development server, or test database was created.

Read-only hosting inventory found Vercel project `prj_rSuzr7pJuiPUjPnyxqQ0ALiLk2AA` in team `team_JpdIsOJgYNpX0ywVZ54Zdb7m`. Existing production deployment `dpl_AJmdD8xd9ZFdCv42Pd1q3WofK53t` was READY at the baseline commit, and the [canonical URL](https://before-the-launch.vercel.app) returned HTTP 200 to HEAD. The unique deployment URL redirected to Vercel SSO; no bypass was attempted. These observations establish availability of the prior release only.

Managed database configuration remains unverified: the environment-name lookup returned 403, and was not retried or replaced with a secret lookup. No stored user rows were read. Source uses PostgreSQL and local filesystem originals; Blob is installed but not implemented. APIs/services share one workspace without an account ownership boundary. Durable public uploads therefore require an explicit hosting/access decision before claiming production readiness. No paid service or alternate capacity workaround is proposed.

Focused disposable acceptance follows [the reviewed scope](../../../proposals/import-workspace-checks.md) and [inactive workflow template](../../../proposals/import-workspace-ci.yml.example). The user approved that exact backend/browser/temporary-CI scope; execution and cleanup are recorded below.

## Publication and hosted build

Source commit [`d7d94f31eedbe363c476acb956c747f5db3e3d3a`](https://github.com/alvarovillalbaa/before-the-launch/commit/d7d94f31eedbe363c476acb956c747f5db3e3d3a), tree `0df9d85450da4cf7a16e1a96a986ec1027bdcc9a`, was pushed to personal-repository `main` and read back from the remote. Evidence-only follow-up `0a503894ab15bc01d051a82b6599ed840d220002` preserved its application/test/dependency/configuration bytes and also reached production READY (`dpl_EWbQs4KQkq1Y7kLyWvj8C8jxBPz4`). The later focused CI correction changes one run-history description and narrows two test selectors; it does not change persistence, simulation, dependencies, or configuration.

The connected Vercel deployment [`dpl_3jeBaJvbiwGb3JczFu5Ctcq1D5DS`](https://vercel.com/my-team-4f230354/before-the-launch/3jeBaJvbiwGb3JczFu5Ctcq1D5DS) is READY for that exact source SHA and targets production. Its aliases include `before-the-launch.vercel.app`. The hosted Next 16.2.9 build compiled in 6.7 seconds, finished TypeScript in 7.5 seconds, and completed successfully. It emitted a nonblocking NFT tracing warning referencing `next.config.ts`; tracing/configuration was not changed. This is hosted compile/build proof, not execution of the seven import or four browser cases.

A connected Vercel fetch of the [canonical intake page](https://before-the-launch.vercel.app/projects/new) returned HTTP 200. Delivered HTML references the exact deployment ID, contains the upload/preview UI, has one file input and no manual brief inputs, and lists only Projects/Sources/Settings in primary navigation. This is static delivered-HTML proof. The local plain `curl` request failed DNS resolution, and the general web-fetch tool could not access the page; those failures were not treated as application failures or anonymous browser acceptance.

No files were submitted to production, no model was called, and no managed data/storage/Auth configuration was changed. The wider all-project goal remains active.

## Approved runtime acceptance

The user explicitly approved seven import/persistence checks and four desktop/mobile Chromium scenarios in temporary GitHub CI, using authored files, a disposable PostgreSQL database, and fake simulations only. Execution stayed on `qa/import-workspace-acceptance`, in the public personal repository, with read-only repository permissions and a 15-minute job bound. No cache, artifact, screenshot, video, trace, automatic retry, production credentials, or paid resource was used.

| Run | Source | Outcome |
| --- | --- | --- |
| [40527523130](https://github.com/alvarovillalbaa/before-the-launch/actions/runs/40527523130) | `1ddfad031f0f722dd71e724324039790a61f01ec` | Lint stopped on an unescaped JSX apostrophe; backend/browser cases did not run. |
| [40527791884](https://github.com/alvarovillalbaa/before-the-launch/actions/runs/40527791884) | `fd2230f36c53c0203a96e5f53be8780ad5cc362a` | Focused lint and all seven PostgreSQL cases passed; three browser cases passed. Retry case stopped because an unscoped alert locator also matched the framework route announcer. |
| [40528253895](https://github.com/alvarovillalbaa/before-the-launch/actions/runs/40528253895) | `73ec76ba255fc64c118594ff2fb872e0c46fd268` | **Success:** focused lint, seven PostgreSQL cases, all four Chromium scenarios; zero test retries or skips. |

The first repair rewrites that JSX description. The second adds each app-error message prefix to the two alert locators; required retention/retry/persistence assertions are unchanged. Independent review confirmed only those two selectors changed and no assertion was weakened.

Final job `122273636457` ran on Node 24.21.0 with frozen pnpm 10.24.0 dependencies, native Vitest 4.1.9, PostgreSQL 17.11, and Chromium. The seven import cases passed in 201 ms; the four browser scenarios passed in 17.8 seconds. These durations identify the receipt, not a performance claim.

Verified behavior includes preview without writes; explicit fact provenance and blank missing fields; saved original-byte equality; complete source/chunk persistence with ordered indexes and SHA-256 hashes; stale-file/digest and invalid-input rejection; rollback of a new workspace/personas/project after an injected source-write failure; removal of only that operation's originals; desktop import/fake run/reload/history; mobile touch sidebar/import/missing-fact/reload; retained files and preview after injected request failure; and legacy new/existing simulation navigation.

The final job succeeded through container teardown. Its owned PostgreSQL container `f7f16fb7c74785fe7e20647be369f9a0e6d563d64d668530fd2a56a7f8292333` and network `github_network_94dd44a682904a6a8010874524376b55` were removed; runner-only files were disposable. The active workflow is deleted in this cleanup change. The inactive template remains review evidence and has no trigger while under `docs/`.

Final CI SHA-256 receipts:

```text
331243c4833dd9fe00211593af1a4c192fa48a78d81ef0739d70c8b1cc8e93a1  package.json
99c2910c000dc4188987b03efd4567966dcd1c8f7e3d15bd5423cfefeeb91c08  pnpm-lock.yaml
4c8918f7e5c0ede1b5b7e25c78ee776056fc723d566c464c8179f8e73cf17831  lib/server/services/product-intake-service.ts
6020ef4b02e3fc23a89c927b1196ffbf09fab6d82df80cb83e272f69401a3eeb  tests/integration/product-intake.test.ts
23cdc5ddb7711684be62e03900dc8f5d554f2fa6a07b7e52ec1f9ae1a519af2c  tests/e2e/import-workspace.spec.ts
```

CI proves this disposable PostgreSQL/Chromium environment. It does not prove public production database/storage configuration, account isolation, provider/model behavior, successful PDF/DOCX extraction, native OS file-picker interaction, Safari, or physical-device behavior. Existing shared-workspace/local-file hosting limits above remain open.
