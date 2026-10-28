# Focused target-market checks

Last updated: 2026-10-28

Status: authored, unexecuted; explicit approval pending. The earlier seven import checks and four browser scenarios do not authorize this scope. A separately approved temporary runner is proposed below because local locked dependencies are absent. No local installation, database, server, browser, model call or provider change is proposed.

The current [product flow](../product-intake.md) allows an operator to choose a simulation target market after uploading partial product facts. The [source receipt](../results/2026/10-28/target-market.md) records why the selected market must reach both engines without rewriting the original brief or creating evidence.

## Exact scope

Run only these two existing-toolchain Vitest files, six authored cases total:

| File | Cases | Boundary |
| --- | ---: | --- |
| [`simulation.test.ts`](../../tests/unit/simulation.test.ts) | 2 | Existing concurrent fake-agent aggregation updated for explicit context; repeatable market-specific fake output with unchanged partial brief/evidence and the allowed 180-character control-string boundary within the existing recommendation limit. |
| [`simulation-context.test.ts`](../../tests/unit/simulation-context.test.ts) | 4 | Actual service dispatch to fake, mocked Gateway success, mocked Gateway failure/fallback, and capture before an asynchronous mutation of the loaded run fixture. Assert findings, request text, context traces and generated report audience as applicable. |

The four service cases replace `getDb` with an in-memory query boundary, server environment lookup with a fixed model name, and AI SDK `generateText` with a stub. They perform no database, filesystem, HTTP, Gateway or model work. They do not prove SQL persistence or provider behavior. The fake engine's score seed is synthetic; the cases do not assert improved market accuracy or that two markets always produce distinct scores.

The proposed six-case scope is pinned to these SHA-256 source fingerprints, authored from baseline `22e5168acdeb83e6827d848635d035fabcf5bf05`. Reconfirm them before execution; a source change requires review rather than silently widening this scope.

| Source | SHA-256 |
| --- | --- |
| [`simulation-service.ts`](../../lib/server/services/simulation-service.ts) | `497e7510644c8ce8881bede6546e1cc257ce90faf4818850dd720e1d8c6f59aa` |
| [`simulation.test.ts`](../../tests/unit/simulation.test.ts) | `1990695e0483f0e0a8a8f58fe2d8b634f4239a3beba79aecf9f667aee32a2fdf` |
| [`simulation-context.test.ts`](../../tests/unit/simulation-context.test.ts) | `f0d79fefae0f7d0d336e8c3a67aa5b2d9abc09ea3de614c91d4a6638d417ccd6` |

After approval, in an environment with the repository's existing locked dependencies available:

```sh
node --version
node -p process.execPath
pnpm exec vitest run tests/unit/simulation.test.ts tests/unit/simulation-context.test.ts --reporter=verbose
git diff --check
```

Do not run the broader unit, integration or browser suites under this scope.

## Concrete disposable environment

The [inactive workflow](target-market-ci.yml.example) is review source only.
After explicit workspace §§7 and 14 approval, copy it to
`.github/workflows/target-market-checks.yml` on the task-specific
`qa/target-market-checks` branch and publish that branch for one run. It permits
one public Ubuntu 24.04 job, capped at 15 minutes, with read-only repository
permissions and the same pinned checkout/setup-node actions as the earlier
approved import workflow. It verifies all eleven frozen source/lockfile hashes
and Node 24.21.0, then installs the existing pnpm 10.24.0 lockfile with lifecycle
scripts disabled. No dependency version or lockfile change is proposed.

The job runs only the two files/six cases above, with one worker and file
parallelism disabled. It starts no database, server, browser or model provider;
it has no application credentials, persistent runner, cache or artifact upload.
Retain bounded textual logs and actual discovered/pass/fail/error/skip totals
in the owning results. Remove the active workflow after the single authorized
run, preserving this inactive review template and result evidence. No continuing
CI installation or broader test authority is requested.

## Proof limits

Passing these cases would establish deterministic fake and mocked-boundary service behavior for the captured target market. It would not establish database durability, hosted behavior, model quality, Auth, account isolation, budget enforcement, depth semantics, browser behavior or historical report migration. Any live Gateway call or broader backend/browser check needs its own approval.
