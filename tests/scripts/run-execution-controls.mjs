import fs from "node:fs";
import path from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { gzipSync } from "node:zlib";

const sourceCommit = process.argv[3];
const need = (value, code) => { if (!value) throw new Error(code); };
const hash = (bytes, algorithm = "sha256") => createHash(algorithm).update(bytes).digest("hex");
const blob = bytes => hash(Buffer.concat([Buffer.from(`blob ${bytes.length}\0`), bytes]), "sha1");
need(process.argv.length === 4 && process.argv[2] === "--source-commit" && /^[a-f0-9]{40}$/.test(sourceCommit ?? ""), "source_pin_required");
need(process.version === "v24.21.0" && process.platform === "linux" && process.env.GITHUB_ACTIONS === "true"
  && process.env.GITHUB_REPOSITORY === "alvarovillalbaa/before-the-launch" && process.env.GITHUB_EVENT_NAME === "create"
  && /^refs\/heads\/qa\/execution-controls-20261105(?:-\d+)?$/.test(process.env.GITHUB_REF ?? "")
  && process.env.EXECUTION_CONTROLS_PUBLIC_REPOSITORY === "true", "approved_public_runner_required");
const repo = fs.realpathSync(process.cwd()), parent = fs.realpathSync(process.env.RUNNER_TEMP);
const root = fs.mkdtempSync(path.join(parent, "btl-execution-")), identity = fs.lstatSync(root), nonce = randomUUID();
fs.writeFileSync(path.join(root, "owner"), nonce, { flag: "wx", mode: 0o600 });
for (const name of ["tmp", "cache", "config", "corepack", "pnpm", "browser-output", "storage"]) fs.mkdirSync(path.join(root, name), { mode: 0o700 });
const fixtureKey = "authored-execution-controls-operator-key-ci-only";
const database = "postgres://execution_ci:disposable_ci_only@127.0.0.1:54329/before_launch_execution_ci";
const env = { PATH: process.env.PATH, HOME: process.env.HOME, LANG: "C.UTF-8", TZ: "UTC", CI: "true", NO_COLOR: "1",
  TMPDIR: path.join(root, "tmp"), TMP: path.join(root, "tmp"), TEMP: path.join(root, "tmp"),
  XDG_CACHE_HOME: path.join(root, "cache"), XDG_CONFIG_HOME: path.join(root, "config"), COREPACK_HOME: path.join(root, "corepack"),
  COREPACK_ENABLE_DOWNLOAD_PROMPT: "0", PNPM_HOME: path.join(root, "pnpm"), PLAYWRIGHT_BROWSERS_PATH: path.join(root, "cache", "browsers"),
  npm_config_cache: path.join(root, "cache", "npm"), npm_config_audit: "false", npm_config_fund: "false", npm_config_update_notifier: "false",
  DATABASE_URL: database, EXECUTION_CONTROLS_TEST_DATABASE_URL: database, EXECUTION_CONTROLS_TEST_TARGET: "local-disposable",
  OPERATOR_ACCESS_KEY: fixtureKey, EXECUTION_CONTROLS_OPERATOR_KEY: fixtureKey,
  EXECUTION_CONTROLS_BROWSER_OUTPUT: path.join(root, "browser-output"), EXECUTION_CONTROLS_BROWSER_REPORT: path.join(root, "browser.json"),
  LOCAL_STORAGE_DIR: path.join(root, "storage"), SIMULATION_ENGINE: "fake", NEXT_TELEMETRY_DISABLED: "1", DO_NOT_TRACK: "1",
  AI_GATEWAY_API_KEY: "", VERCEL_OIDC_TOKEN: "", BLOB_READ_WRITE_TOKEN: "", OPENAI_API_KEY: "", ANTHROPIC_API_KEY: "", VERCEL: "" };
const report = { schemaVersion: "before-launch.execution-controls.v2", sourceCommit, status: "failed", startedAtUtc: new Date().toISOString(),
  runtime: { node: process.version, platform: process.platform, architecture: process.arch }, commands: [], guards: [], generated: [], errors: [],
  scope: { actualPostgreSQL: true, authoredOperator: true, actualBrowser: true, realModelCalls: false, productionData: false, retries: 0, workers: 1 },
  proofLimits: ["Provider execution/cost receipts are authored SDK fixtures. No real provider quality, routing, price or charge is verified.",
    "The browser uses the actual development HTTP server and disposable PostgreSQL. A separate production build and client-secret scan do not prove hosted operator configuration or persistence.",
    "Original command process groups and owned generated paths are checked. Unrelated/detached sessions and system packages installed on the disposable runner are not inventoried.",
    "GitHub owns the PostgreSQL service and runner teardown after the job. This controller closes app/test pools but does not claim independently observed platform teardown.",
    "The global watchdog stops original owned groups before attempting a failed receipt; userspace timers cannot interrupt a blocked kernel filesystem operation.",
    "Dependency/browser/font downloads are part of setup/build; the browser blocks external hosts. This is not a system-wide network sandbox."] };
const generated = ["node_modules", ".next", ".swc", "next-env.d.ts", "tsconfig.tsbuildinfo", "app/.well-known/workflow"];
const snapshots = new Map(), children = new Set();
const workEnd = Date.now() + 1_020_000;
let cleanupEnd = workEnd + 90_000, interrupted = false, server = null, sourceTree, generatedPreAbsent = false, expectedCases, unitCommand, browserCommand;
let globalExpired = false, emitted = false, emergencyTimer;
const clean = (value, max = 3000) => String(value ?? "").replaceAll(root, "[scratch]").replaceAll(repo, "[repository]").replaceAll(fixtureKey, "[authored operator key]").replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, "").slice(0, max);
const owner = () => { const item = fs.lstatSync(root); need(item.isDirectory() && !item.isSymbolicLink() && item.dev === identity.dev && item.ino === identity.ino && fs.readFileSync(path.join(root, "owner"), "utf8") === nonce, "scratch_identity_changed"); };
const absent = pid => { try { process.kill(-pid, 0); return false; } catch (error) { return error.code === "ESRCH"; } };
const handlers = new Map(["SIGINT", "SIGTERM", "SIGHUP"].map(signal => {
  const handler = () => { interrupted = true; for (const child of children) child.stop("interrupted"); };
  process.on(signal, handler); return [signal, handler];
}));
const terminal = setTimeout(() => {
  globalExpired = true; interrupted = true; report.errors.push("controller_global_deadline");
  for (const child of children) child.stop("global_deadline");
  // Allow original owned groups their TERM/KILL/drain window before a failed receipt.
  emergencyTimer = setTimeout(() => emitReport(), 6_500);
}, Math.max(1, workEnd + 90_000 - Date.now()));

function start(label, executable, args, seconds, { cleanup = false } = {}) {
  owner(); need(cleanup || !interrupted, "interrupted_before_command");
  const remaining = (cleanup ? cleanupEnd : workEnd) - Date.now() - 6_000;
  need(remaining > 0 && !globalExpired, "command_budget_exhausted");
  const child = spawn(executable, args, { cwd: repo, env, detached: true, stdio: ["ignore", "pipe", "pipe"] });
  const chunks = [[], []], counts = [0, 0];
  let reason = null, exit = null, signal = null, closed = false, exited = false, killTimer, drainTimer, stopAt = null, captureFinished = false, ownershipReleased = false, finished, settle = () => {};
  const kill = () => { if (child.pid && !absent(child.pid)) try { process.kill(-child.pid, "SIGKILL"); } catch {} };
  const stop = why => {
    if (ownershipReleased) return;
    reason ??= why;
    if (stopAt === null) {
      stopAt = Date.now();
      if (child.pid) try { process.kill(-child.pid, "SIGTERM"); } catch {}
      killTimer = setTimeout(kill, 3_000);
      drainTimer = setTimeout(() => { child.stdout.destroy(); child.stderr.destroy(); settle(); }, 6_000);
    } else if (Date.now() >= stopAt + 3_000) kill();
  };
  const timer = setTimeout(() => stop("timeout"), Math.max(1, Math.min(seconds * 1000, remaining)));
  [child.stdout, child.stderr].forEach((stream, index) => stream.on("data", bytes => {
    if (captureFinished) return;
    const room = Math.max(0, 1_048_576 - counts[index]); chunks[index].push(bytes.subarray(0, room)); counts[index] += bytes.length;
    if (counts[index] > 1_048_576) stop("stream_limit");
  }));
  const done = new Promise(resolve => {
    settle = resolve;
    child.once("error", () => { stop("spawn_error"); resolve(); });
    child.once("exit", (code, received) => { exit = code; signal = received; exited = true; });
    child.once("close", () => { closed = true; resolve(); });
  });
  async function finish(allowed = [0]) {
    if (!finished) finished = (async () => {
      await done; clearTimeout(timer);
      if (child.pid && !absent(child.pid)) {
        stop("process_group_remaining");
        while (!absent(child.pid) && Date.now() < stopAt + 6_000) await new Promise(resolve => setTimeout(resolve, 25));
      }
      // Never cancel the pending KILL merely because the leader closed its pipes.
      clearTimeout(killTimer); clearTimeout(drainTimer); captureFinished = true;
      const output = chunks.map(parts => Buffer.concat(parts));
      const processGroupAbsent = child.pid ? absent(child.pid) : true;
      ownershipReleased = exited && closed && processGroupAbsent;
      const row = { label, args: [executable === process.execPath ? "[node]" : executable, ...args.map(arg => clean(arg, 250))], exitCode: exit, signal, stop: reason, exitObserved: exited, closeObserved: closed, processGroupAbsent,
        streams: output.map((bytes, i) => ({ name: i ? "stderr" : "stdout", bytes: counts[i], capturedBytes: bytes.length, sha256: hash(bytes), complete: closed && counts[i] === bytes.length, head: clean(bytes.toString(), 1200), tail: clean(bytes.subarray(-3500).toString(), 3500) })) };
      report.commands.push(row);
      if (label === "unit_and_postgresql") unitCommand = row;
      if (label === "browser") browserCommand = row;
      return { row, output };
    })();
    const { row, output } = await finished;
    need(allowed.includes(exit) && !signal && !reason && exited && closed && row.processGroupAbsent && row.streams.every(s => s.complete), `${label}_failed`);
    return output;
  }
  const handle = { child, stop, finish, done, verified: () => !child.pid || ownershipReleased };
  children.add(handle); return handle;
}
const run = async (label, executable, args, seconds, allowed, options) => start(label, executable, args, seconds, options).finish(allowed);

async function guard(label, cleanup = false) {
  const row = { label, passed: false }; report.guards.push(row);
  const command = (suffix, args) => run(label + suffix, "git", args, 10, [0], { cleanup });
  need((await command("_head", ["rev-parse", "HEAD"]))[0].toString().trim() === sourceCommit, "head_changed");
  const raw = (await command("_tree", ["ls-tree", "-r", "-z", "HEAD"]))[0];
  if (!sourceTree) sourceTree = raw; need(raw.equals(sourceTree), "source_tree_changed");
  const index = new Map((await command("_index", ["ls-files", "--stage", "-z"]))[0].toString().split("\0").filter(Boolean).map(record => { const [header, name] = record.split("\t"), [mode, sha, stage] = header.split(" "); need(stage === "0", "unmerged_index"); return [name, { mode, sha }]; }));
  let count = 0, bytes = 0;
  for (const entry of raw.toString().split("\0").filter(Boolean)) {
    const [header, name] = entry.split("\t"), [mode, kind, sha] = header.split(" ");
    need(kind === "blob" && !name.startsWith(".github/workflows/"), "unexpected_tree_entry");
    const file = path.join(repo, name);
    for (let ancestor = path.dirname(file); ancestor !== repo; ancestor = path.dirname(ancestor)) {
      const item = fs.lstatSync(ancestor); need(item.isDirectory() && !item.isSymbolicLink(), "tracked_ancestor_changed");
    }
    const item = fs.lstatSync(file);
    const actualMode = item.isSymbolicLink() ? "120000" : item.isFile() ? item.mode & 0o111 ? "100755" : "100644" : "invalid";
    const value = item.isSymbolicLink() ? fs.readlinkSync(file, { encoding: "buffer" }) : fs.readFileSync(file);
    need(mode === actualMode && sha === blob(value) && index.get(name)?.sha === sha && index.get(name)?.mode === mode, "source_bytes_or_index_changed"); count++; bytes += value.length;
  }
  need(index.size === count, "index_file_count_changed");
  const status = (await command("_status", ["status", "--porcelain=v1", "-z", "--untracked-files=all"]))[0];
  need(status.length === 0, "untracked_or_tracked_source_changed");
  Object.assign(row, { passed: true, treeSha256: hash(raw), trackedFiles: count, trackedBytes: bytes, headAndIndexAndWorkingBytes: true });
}

function captureGenerated() {
  need(generatedPreAbsent, "generated_preabsence_unverified");
  for (const name of generated) {
    let item; try { item = fs.lstatSync(name); } catch (error) { if (error.code === "ENOENT") continue; throw error; }
    need(!item.isSymbolicLink() && (item.isDirectory() || item.isFile()), "generated_type_changed");
    const prior = snapshots.get(name);
    need(!prior || prior.dev === item.dev && prior.ino === item.ino, "generated_identity_changed");
    if (!prior) { const row = { path: name, dev: item.dev, ino: item.ino, directory: item.isDirectory(), preAbsent: true, removed: false }; snapshots.set(name, row); report.generated.push(row); }
  }
}
function rawReport(file, maximum) {
  const item = fs.lstatSync(file); need(item.isFile() && !item.isSymbolicLink() && item.size <= maximum, "result_file_bound");
  const bytes = fs.readFileSync(file), gzip = gzipSync(bytes); need(gzip.length <= 262144, "result_gzip_bound");
  return { bytes, retained: { encoding: "gzip-base64", bytes: bytes.length, sha256: hash(bytes), compressedBytes: gzip.length, data: gzip.toString("base64") } };
}
function expectedFromSource() {
  const ts = createRequire(path.join(repo, "package.json"))("typescript");
  const unitFiles = [];
  function list(directory) {
    for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
      need(!item.isSymbolicLink(), "test_source_symlink");
      const file = path.join(directory, item.name);
      if (item.isDirectory()) list(file);
      else if (item.isFile() && /\.test\.tsx?$/.test(item.name)) unitFiles.push(file.split(path.sep).join("/"));
    }
  }
  list("tests/unit"); unitFiles.push("tests/integration/execution-controls.test.ts"); unitFiles.sort();
  const parse = file => {
    const item = fs.lstatSync(file); need(item.isFile() && !item.isSymbolicLink() && item.size <= 262_144, "test_source_type_or_bound");
    const source = ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    need(source.parseDiagnostics.length === 0, "test_source_parse_failed");
    const cases = [], title = node => { need(node && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) && node.text.trim() === node.text && node.text.length > 0 && node.text.length <= 2048, "dynamic_test_title"); return node.text; };
    const parts = node => ts.isIdentifier(node) ? [node.text] : ts.isPropertyAccessExpression(node) ? [...(parts(node.expression) ?? []), node.name.text] : null;
    function visit(node, suites = []) {
      if (ts.isCallExpression(node)) {
        const call = parts(node.expression);
        if (call && ["it", "test", "describe"].includes(call[0])) {
          need(!call.some(part => ["only", "skip", "todo", "each", "skipIf", "runIf", "fails", "concurrent"].includes(part)), "unsupported_test_modifier");
          const suite = call[0] === "describe" || (call[0] === "test" && call[1] === "describe");
          const test = (call[0] === "it" || call[0] === "test") && call.length === 1;
          if (suite) {
            need((call[0] === "describe" && (call.length === 1 || call.length === 2 && call[1] === "sequential")) || (call[0] === "test" && (call.length === 2 || call.length === 3 && call[2] === "sequential")), "unsupported_suite_modifier");
            const name = title(node.arguments[0]), callback = node.arguments[1];
            need(callback && (ts.isArrowFunction(callback) || ts.isFunctionExpression(callback)), "dynamic_suite_callback");
            visit(callback.body, [...suites, name]); return;
          }
          if (test) { const name = title(node.arguments[0]); cases.push({ title: name, fullName: [...suites, name].join(" ") }); return; }
          need(["beforeAll", "afterAll", "beforeEach", "afterEach", "use", "setTimeout"].includes(call[1]), "unsupported_test_call");
        }
      }
      ts.forEachChild(node, child => visit(child, suites));
    }
    visit(source); need(cases.length > 0 && cases.length <= 512 && new Set(cases.map(row => row.fullName)).size === cases.length, "test_source_case_set_invalid");
    return { file, cases };
  };
  const unit = unitFiles.map(parse), browser = parse("tests/e2e/execution-controls.spec.ts");
  const ids = unit.flatMap(file => file.cases.map(row => file.file + "\0" + row.fullName));
  need(new Set(ids).size === ids.length && ids.length > 48 && ids.length <= 512
    && browser.cases.length === 6 && new Set(browser.cases.map(row => row.title)).size === 6, "expected_case_set_invalid");
  expectedCases = { unit, browser: browser.cases, unitTotal: ids.length, unitFileCount: unit.length,
    unitIdentitySha256: hash(Buffer.from(JSON.stringify([...ids].sort()))), browserTitleSha256: hash(Buffer.from(JSON.stringify(browser.cases.map(row => row.title).sort()))) };
  report.expectedCases = { ...expectedCases, source: "Installed TypeScript AST over sealed literal test declarations; test modules are not imported or listed by execution." };
}
function captureUnit() {
  const result = rawReport(path.join(root, "unit.json"), 2_097_152);
  report.unit = { raw: result.retained, accepted: false };
  const data = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(result.bytes));
  need(expectedCases && Array.isArray(data.testResults) && data.testResults.length === expectedCases.unitFileCount, "unit_file_set_invalid");
  const expected = new Map(expectedCases.unit.map(file => [file.file, file.cases.map(row => row.fullName)])), seenFiles = new Set();
  const rows = data.testResults.flatMap(file => {
    need(typeof file.name === "string" && Array.isArray(file.assertionResults) && file.assertionResults.length <= 512, "unit_file_shape_invalid");
    const name = path.relative(repo, file.name).split(path.sep).join("/"), wanted = expected.get(name);
    need(wanted && !seenFiles.has(name) && file.status === "passed" && file.assertionResults.length === wanted.length, "unit_file_set_invalid");
    seenFiles.add(name);
    return file.assertionResults.map(item => ({ file: name, name: item.fullName, status: item.status, failures: item.failureMessages ?? [] }));
  });
  const historical = JSON.parse(fs.readFileSync("docs/results/2026/10-30/simulation-provenance-source.json"));
  const retained48 = historical.case_files.flatMap(file => file.names.map(name => ({ file: file.path, name })));
  const identities = new Set(rows.map(row => row.file + "\0" + row.name));
  Object.assign(report.unit, { success: data.success, total: data.numTotalTests, passed: data.numPassedTests, failed: data.numFailedTests, pending: data.numPendingTests, todo: data.numTodoTests,
    files: data.testResults.map(file => ({ file: path.relative(repo, file.name), status: file.status, cases: file.assertionResults.length })),
    failures: rows.filter(row => row.status !== "passed").map(row => ({ ...row, failures: row.failures.map(value => clean(value, 6000)) })),
    cases: rows.map(({ file, name, status }) => ({ file, name, status })),
    original48IdentitiesRetained: retained48.length === 48 && retained48.every(row => identities.has(row.file + "\0" + row.name)) });
  const expectedIds = new Set(expectedCases.unit.flatMap(file => file.cases.map(row => file.file + "\0" + row.fullName)));
  need(unitCommand?.exitCode === 0 && data.success === true && rows.length === expectedCases.unitTotal && rows.length === data.numTotalTests
    && identities.size === rows.length && [...identities].every(id => expectedIds.has(id)) && data.numPassedTests === rows.length
    && data.numFailedTests === 0 && data.numPendingTests === 0 && data.numTodoTests === 0 && rows.every(row => row.status === "passed") && report.unit.original48IdentitiesRetained, "unit_acceptance_failed");
  report.unit.accepted = true;
}
function captureBrowser() {
  const result = rawReport(path.join(root, "browser.json"), 2_097_152);
  report.browser = { raw: result.retained, accepted: false };
  const data = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(result.bytes));
  need(expectedCases && Array.isArray(data.suites) && Array.isArray(data.errors), "browser_report_shape_invalid");
  const specs = []; const visit = suite => { for (const child of suite.suites ?? []) visit(child); for (const spec of suite.specs ?? []) specs.push(spec); }; data.suites.forEach(visit);
  Object.assign(report.browser, { stats: data.stats, cases: specs.map(spec => ({ name: spec.title, ok: spec.ok, tests: spec.tests.map(test => ({ status: test.status, outcomes: test.results.map(result => ({ status: result.status, retry: result.retry, error: clean(result.error?.message, 6000) })) })) })) });
  const titles = new Set(specs.map(spec => spec.title)), wanted = new Set(expectedCases.browser.map(row => row.title));
  need(browserCommand?.exitCode === 0 && data.errors.length === 0 && specs.length === 6 && titles.size === 6 && [...titles].every(title => wanted.has(title))
    && data.stats?.expected === 6 && data.stats?.unexpected === 0 && data.stats?.flaky === 0 && data.stats?.skipped === 0
    && specs.every(spec => spec.ok && spec.tests.length === 1 && spec.tests[0].projectName === "chromium" && spec.tests[0].status === "expected"
      && spec.tests[0].results.length === 1 && spec.tests[0].results[0].status === "passed" && spec.tests[0].results[0].retry === 0), "browser_acceptance_failed");
  report.browser.accepted = true;
}

try {
  for (const name of generated) { try { fs.lstatSync(name); throw new Error("preexisting_generated_path"); } catch (error) { if (error.code !== "ENOENT") throw error; } }
  generatedPreAbsent = true;
  await guard("before");
  const corepack = fs.realpathSync(path.join(path.dirname(process.execPath), "corepack"));
  await run("prepare_pnpm", process.execPath, [corepack, "prepare", "pnpm@10.24.0", "--activate"], 60);
  need((await run("pnpm_version", process.execPath, [corepack, "pnpm", "--version"], 15))[0].toString().trim() === "10.24.0", "pnpm_version_changed");
  await run("install", process.execPath, [corepack, "pnpm", "install", "--frozen-lockfile", "--ignore-scripts", "--store-dir", path.join(root, "pnpm", "store")], 180);
  captureGenerated(); await guard("after_install"); expectedFromSource();
  const cli = name => path.join(repo, "node_modules", name);
  await run("existing_schema", process.execPath, [cli("drizzle-kit/bin.cjs"), "push", "--force"], 60);
  await run("database_marker", process.execPath, ["--input-type=module", "-e", "import pg from 'pg';const p=new pg.Pool({connectionString:process.env.DATABASE_URL});try{await p.query(\"COMMENT ON DATABASE before_launch_execution_ci IS 'before-launch-execution-controls-v2'\");}finally{await p.end();}"], 15);
  await run("unit_and_postgresql", process.execPath, [cli("vitest/vitest.mjs"), "run", "--config", "tests/execution-controls.vitest.config.ts", "--reporter=tap", "--reporter=json", "--outputFile.json=" + path.join(root, "unit.json")], 180, [0, 1]);
  captureUnit(); captureGenerated(); await guard("after_tests");
  await run("next_typegen", process.execPath, [cli("next/dist/bin/next"), "typegen"], 60);
  await run("typecheck", process.execPath, [cli("typescript/bin/tsc"), "--noEmit", "--incremental", "false"], 90);
  await run("production_build", process.execPath, [cli("next/dist/bin/next"), "build"], 180);
  let staticFiles = 0; const scan = directory => { for (const item of fs.readdirSync(directory, { withFileTypes: true })) { const file = path.join(directory, item.name); if (item.isDirectory()) scan(file); else { need(!item.isSymbolicLink(), "client_asset_symlink"); need(!fs.readFileSync(file).includes(Buffer.from(fixtureKey)), "operator_key_in_client_assets"); staticFiles++; } } }; scan(".next/static");
  report.clientSecretScan = { passed: true, files: staticFiles, keyKind: "authored disposable fixture" };
  captureGenerated(); await guard("after_build");
  await run("install_chromium", process.execPath, [cli("@playwright/test/cli.js"), "install", "--with-deps", "chromium"], 180);
  env.NODE_ENV = "development";
  server = start("development_server", process.execPath, [cli("next/dist/bin/next"), "dev", "--hostname", "127.0.0.1", "--port", "3100"], 360);
  const readyEnd = Math.min(workEnd, Date.now() + 90_000); let ready = false;
  while (Date.now() < readyEnd) { try { const response = await fetch("http://127.0.0.1:3100/login", { signal: AbortSignal.timeout(3000) }); if (response.ok) { ready = true; break; } } catch {} await new Promise(resolve => setTimeout(resolve, 500)); }
  need(ready, "server_not_ready");
  await run("browser", process.execPath, [cli("@playwright/test/cli.js"), "test", "--config", "tests/execution-controls.playwright.config.ts"], 300, [0, 1]);
  captureBrowser();
} catch (error) { report.errors.push(/^[a-z0-9_]+$/.test(error.message) ? error.message : "controller_error"); }
finally {
  cleanupEnd = Math.min(Date.now() + 90_000, workEnd + 90_000);
  if (!report.unit && fs.existsSync(path.join(root, "unit.json"))) try { captureUnit(); } catch (error) { report.errors.push(error.message); }
  if (!report.browser && fs.existsSync(path.join(root, "browser.json"))) try { captureBrowser(); } catch (error) { report.errors.push(error.message); }
  if (server) {
    server.stop("owned_server_shutdown");
    try { await server.finish([0, 143, null]); }
    catch {
      const row = report.commands.find(row => row.label === "development_server");
      if (!(row?.exitObserved && row.closeObserved && row.processGroupAbsent && row.stop === "owned_server_shutdown"
        && (row.exitCode === 0 || row.exitCode === 143 || ["SIGTERM", "SIGKILL"].includes(row.signal))
        && row.streams.every(stream => stream.complete))) report.errors.push("server_cleanup_unverified");
    }
  }
  for (const child of children) {
    if (child.verified()) continue;
    child.stop("owned_cleanup");
    try { await child.finish([0, 1, 143, null]); } catch { /* Actual row and original reason remain in the receipt. */ }
  }
  report.processCleanup = { passed: [...children].every(child => child.verified()), started: [...children].filter(child => child.child.pid).length,
    scope: "Direct child exit/close and observed original process-group absence; no detached-session inventory." };
  // Filesystem cleanup never races an unverified original command group.
  try {
    need(report.processCleanup.passed, "owned_process_cleanup_unverified");
    captureGenerated(); owner(); need(Date.now() < cleanupEnd, "cleanup_deadline");
    for (const [name, prior] of [...snapshots].reverse()) { const item = fs.lstatSync(name); need(item.dev === prior.dev && item.ino === prior.ino && !item.isSymbolicLink(), "cleanup_identity_changed"); fs.rmSync(name, { recursive: prior.directory, force: false }); need(!fs.existsSync(name), "generated_path_remaining"); prior.removed = true; }
    report.generatedCleanup = "passed";
  } catch (error) { report.generatedCleanup = "unverified"; report.errors.push(/^[a-z0-9_]+$/.test(error.message) ? error.message : "generated_cleanup_error"); }
  // Always attempt the full source guard independently of generated-path failures.
  try { await guard("after_output_cleanup", true); }
  catch (error) { report.errors.push(/^[a-z0-9_]+$/.test(error.message) ? error.message : "post_source_guard_error"); }
  try {
    const ignored = (await run("final_ignored", "git", ["status", "--porcelain=v1", "-z", "--ignored=matching", "--untracked-files=all"], 10, [0], { cleanup: true }))[0];
    report.ignoredOutput = { bytes: ignored.length, sha256: hash(ignored), text: clean(ignored.toString()) }; need(ignored.length === 0, "unexpected_generated_output");
    need(report.generatedCleanup === "passed" && [...children].every(child => child.verified()) && Date.now() < cleanupEnd, "cleanup_budget_or_process_uncertain");
    owner(); fs.rmSync(root, { recursive: true, force: false }); need(!fs.existsSync(root), "scratch_remaining"); report.cleanup = "passed";
  } catch (error) { report.cleanup = "unverified"; report.errors.push(/^[a-z0-9_]+$/.test(error.message) ? error.message : "cleanup_error"); }
}
emitReport();

function emitReport() {
  if (emitted) return; emitted = true;
  clearTimeout(terminal); clearTimeout(emergencyTimer);
  report.completedAtUtc = new Date().toISOString(); report.interrupted = interrupted;
  if (interrupted && !report.errors.includes("interrupted")) report.errors.push("interrupted");
  report.processCleanup = { ...report.processCleanup, passed: [...children].every(child => child.verified()), started: [...children].filter(child => child.child.pid).length };
  report.status = report.errors.length === 0 && !globalExpired && report.unit?.accepted === true && report.browser?.accepted === true
    && report.processCleanup.passed && report.guards.length === 5 && report.guards.every(row => row.passed)
    && report.cleanup === "passed" ? "passed" : "failed";
  let output = JSON.stringify(report);
  if (Buffer.byteLength(output) >= 1_048_576) {
    output = JSON.stringify({ schemaVersion: report.schemaVersion, sourceCommit, status: "failed", errors: ["receipt_limit"],
      fullReportBytes: Buffer.byteLength(output), fullReportSha256: hash(Buffer.from(output)), processCleanup: report.processCleanup,
      cleanup: report.cleanup ?? "unverified", interrupted });
    report.status = "failed";
  }
  const stdoutDeadline = Math.min(cleanupEnd + 2_000, workEnd + 99_000);
  const stdoutTimer = setTimeout(() => process.exit(1), Math.max(1, stdoutDeadline - Date.now()));
  process.stdout.write(output + "\n", () => {
    clearTimeout(stdoutTimer);
    for (const [signal, handler] of handlers) process.removeListener(signal, handler);
    process.exit(report.status === "passed" && !interrupted && !globalExpired && Date.now() <= stdoutDeadline ? 0 : 1);
  });
}
