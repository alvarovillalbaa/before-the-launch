import fs from "node:fs";
import path from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { gzipSync } from "node:zlib";
import { createRequire } from "node:module";

const SEAL = "docs/results/2026/11-05/provenance-checks-source.json";
const OLD = "docs/results/2026/10-30/simulation-provenance-source.json";
const OLD_HASH = "0899cf55fce9420f5e10749759bee7e596202322776c2961292f4179753d7185";
const ACTIVE = ".github/workflows/provenance-checks-v2.yml";
const CASE_FILES = [
  ["tests/unit/simulation-provenance.test.ts", 27],
  ["tests/unit/simulation-provenance-service.test.ts", 9],
  ["tests/unit/simulation-provenance-ui.test.tsx", 6],
  ["tests/unit/simulation.test.ts", 2],
  ["tests/unit/simulation-context.test.ts", 4],
];
const STREAM_LIMIT = 524288, REPORT_LIMIT = 524288;
const hash = (bytes, algorithm = "sha256") => createHash(algorithm).update(bytes).digest("hex");
const blob = bytes => hash(Buffer.concat([Buffer.from(`blob ${bytes.length}\0`), bytes]), "sha1");
const need = (value, message) => { if (!value) throw new Error(message); };
const errorCode = error => /^[a-z0-9_]+$/.test(error?.message ?? "") ? error.message : "controller_error";
const sourceCommit = process.argv[3];
need(process.argv.length === 4 && process.argv[2] === "--source-commit" && /^[a-f0-9]{40}$/.test(sourceCommit ?? ""), "source_pin_required");
need(process.version === "v24.21.0" && process.platform === "linux" && process.env.GITHUB_ACTIONS === "true"
  && process.env.GITHUB_REPOSITORY === "alvarovillalbaa/before-the-launch" && process.env.GITHUB_EVENT_NAME === "create"
  && process.env.GITHUB_REF === "refs/heads/qa/simulation-provenance-20261105" && process.env.PROVENANCE_PUBLIC_REPOSITORY === "true"
  && process.env.PROVENANCE_CREATED_REF_TYPE === "branch", "approved_public_ci_required");
const repo = fs.realpathSync(process.cwd()), parent = fs.realpathSync(process.env.RUNNER_TEMP ?? "");
need(path.isAbsolute(parent) && fs.statSync(parent).isDirectory(), "runner_temp_invalid");
const root = fs.mkdtempSync(path.join(parent, "btl-provenance-")), identity = fs.lstatSync(root), nonce = randomUUID();
fs.writeFileSync(path.join(root, "owner"), nonce, { flag: "wx", mode: 0o600 });
for (const name of ["tmp", "cache", "config", "pnpm", "corepack"]) fs.mkdirSync(path.join(root, name), { mode: 0o700 });
for (const name of ["npm-user", "npm-global"]) fs.writeFileSync(path.join(root, name), "", { flag: "wx", mode: 0o600 });
const resultFile = path.join(root, "vitest.json");
const env = { PATH: process.env.PATH, HOME: process.env.HOME, LANG: "C.UTF-8", TZ: "UTC", CI: "true", NO_COLOR: "1",
  TMPDIR: path.join(root, "tmp"), TMP: path.join(root, "tmp"), TEMP: path.join(root, "tmp"),
  XDG_CACHE_HOME: path.join(root, "cache"), XDG_CONFIG_HOME: path.join(root, "config"), NODE_COMPILE_CACHE: path.join(root, "cache", "node"),
  COREPACK_HOME: path.join(root, "corepack"), COREPACK_ENABLE_DOWNLOAD_PROMPT: "0", PNPM_HOME: path.join(root, "pnpm"),
  npm_config_userconfig: path.join(root, "npm-user"), npm_config_globalconfig: path.join(root, "npm-global"),
  npm_config_cache: path.join(root, "cache", "npm"), npm_config_registry: "https://registry.npmjs.org/",
  npm_config_audit: "false", npm_config_fund: "false", npm_config_update_notifier: "false",
  SIMULATION_ENGINE: "fake", NEXT_TELEMETRY_DISABLED: "1", DO_NOT_TRACK: "1", DATABASE_URL: "", VERCEL: "",
  AI_GATEWAY_API_KEY: "", VERCEL_OIDC_TOKEN: "", BLOB_READ_WRITE_TOKEN: "", OPENAI_API_KEY: "", ANTHROPIC_API_KEY: "",
  GOOGLE_GENERATIVE_AI_API_KEY: "", GOOGLE_API_KEY: "", FIRECRAWL_API_KEY: "", CONVEX_DEPLOY_KEY: "", SUPABASE_SERVICE_ROLE_KEY: "" };
const report = { schemaVersion: "before-launch.provenance-checks.v2", sourceCommit, status: "failed", startedAtUtc: new Date().toISOString(),
  runtime: { node: process.version, platform: process.platform, architecture: process.arch },
  scope: { files: CASE_FILES.map(([file, cases]) => ({ file, cases })), cases: 48, maxWorkers: 1, fileParallelism: false, retries: 0,
    fileIsolation: "Vitest default retained", browser: false, appServer: false, database: false, realProvider: false },
  limits: { workSeconds: 780, cleanupSeconds: 60, finalStdoutSeconds: 2, jobMinutes: 15, streamBytes: STREAM_LIMIT,
    reportBytes: REPORT_LIMIT, vitestJsonBytes: 2097152, jsonGzipBytes: 131072, tapGzipBytes: 98304, testStderrGzipBytes: 32768,
    termToKillSeconds: 3, drainAfterKillSeconds: 3 },
  commands: [], guards: [], generated: [], ignoredOutput: [], errors: [],
  proofLimits: ["The 48 authored cases use fake/mocked DB and AI boundaries, actual pure/service source and React server rendering; no database, app server, browser or real provider is run.",
    "Vitest JSON exposes final outcomes, not retry/global-error counters. One sealed command with retry zero and no repeats, exact unique final rows, and actual CLI exit zero are required; no attempt counters are fabricated.",
    "Direct child exit/close and original process-group absence are observed; separately detached descendant sessions are not independently inventoried.",
    "Dependency/tool registry access is part of setup, not a network sandbox. Userspace deadlines cannot interrupt blocked kernel filesystem calls; executable hashes do not inventory dynamic libraries."] };
const workEnd = Date.now() + 780000;
let cleanupEnd, interrupted = false, manifest, historical, dependencyPreAbsent = false, dependencyIdentity, testRow, parsedResults = false;
const handlers = new Map(["SIGINT", "SIGTERM", "SIGHUP"].map(signal => {
  const handler = () => { interrupted = true; }; process.on(signal, handler); return [signal, handler];
}));
const terminalTimer = setTimeout(() => { process.stderr.write("controller_global_deadline\n"); finish(1); }, Math.max(1, workEnd + 62000 - Date.now()));
function owner() {
  const item = fs.lstatSync(root), marker = path.join(root, "owner");
  need(path.dirname(root) === parent && item.isDirectory() && !item.isSymbolicLink() && item.dev === identity.dev && item.ino === identity.ino
    && !fs.lstatSync(marker).isSymbolicLink() && fs.readFileSync(marker, "utf8") === nonce, "scratch_identity_changed");
}
function read(file, maximum = 16777216) {
  const a = fs.lstatSync(file); need(a.isFile() && !a.isSymbolicLink() && a.size <= maximum, "file_type_or_bound");
  const bytes = fs.readFileSync(file), b = fs.lstatSync(file);
  need(a.dev === b.dev && a.ino === b.ino && a.size === b.size && a.mtimeMs === b.mtimeMs && a.ctimeMs === b.ctimeMs && bytes.length === a.size, "file_changed"); return bytes;
}
function trackedFile(name) {
  const file = path.join(repo, name);
  for (let current = path.dirname(file); current !== repo; current = path.dirname(current)) {
    const item = fs.lstatSync(current); need(item.isDirectory() && !item.isSymbolicLink(), "tracked_ancestor_changed");
  }
  const a = fs.lstatSync(file), mode = a.isSymbolicLink() ? "120000" : a.isFile() ? (a.mode & 0o111 ? "100755" : "100644") : null;
  need(mode, "tracked_type_invalid");
  const bytes = a.isSymbolicLink() ? fs.readlinkSync(file, { encoding: "buffer" }) : read(file), b = fs.lstatSync(file);
  need(a.dev === b.dev && a.ino === b.ino && a.size === b.size && a.mtimeMs === b.mtimeMs && a.ctimeMs === b.ctimeMs, "tracked_file_changed");
  return { bytes, mode };
}
function clean(value, maximum = 700) {
  let text = String(value ?? "").replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, "").replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, "");
  for (const [from, to] of [[root, "[scratch]"], [repo, "[repository]"], [process.env.HOME, "[runner-home]"]]) if (from) text = text.split(from).join(to);
  return Buffer.from(text).subarray(0, maximum).toString("utf8");
}
function absent(pid) { try { process.kill(-pid, 0); return false; } catch (error) { return error.code === "ESRCH" ? true : null; } }
async function run(label, executable, args, seconds, { cleanup = false, quiet = false, exits = [0] } = {}) {
  owner(); need(cleanup || !interrupted, "interrupted_before_command");
  const remaining = (cleanup ? cleanupEnd : workEnd) - Date.now() - 6000; need(remaining > 0, "command_budget_exhausted");
  const child = spawn(executable, args, { cwd: repo, env, detached: true, stdio: ["ignore", "pipe", "pipe"] });
  const parts = [[], []], counts = [0, 0], sizes = [0, 0], hashes = [createHash("sha256"), createHash("sha256")];
  let exitCode = null, signal = null, exited = false, closed = false, reason = null, stopAt = null, term = false, killed = false, captureFinished = false;
  let poll, killTimer, drainTimer, stop;
  await new Promise(resolve => {
    stop = why => {
      if (reason) return; reason = why; stopAt = Date.now(); term = true;
      try { process.kill(-child.pid, "SIGTERM"); } catch {}
      killTimer = setTimeout(() => { killed = true; try { process.kill(-child.pid, "SIGKILL"); } catch {} }, 3000);
      drainTimer = setTimeout(() => { child.stdout.destroy(); child.stderr.destroy(); resolve(); }, 6000);
    };
    [child.stdout, child.stderr].forEach((stream, index) => stream.on("data", chunk => {
      if (captureFinished) return;
      counts[index] += chunk.length; hashes[index].update(chunk);
      const bytes = chunk.subarray(0, Math.max(0, STREAM_LIMIT - sizes[index])); parts[index].push(bytes); sizes[index] += bytes.length;
      if (counts[index] > STREAM_LIMIT) stop("stream_limit");
    }));
    child.once("error", () => { if (child.pid) stop("spawn_failed"); else reason = "spawn_failed"; resolve(); });
    child.once("exit", (value, received) => { exitCode = value; signal = received; exited = true; });
    child.once("close", () => { closed = true; resolve(); });
    const started = Date.now();
    poll = setInterval(() => { if (interrupted && !cleanup) stop("interrupted"); else if (Date.now() - started >= Math.min(seconds * 1000, remaining)) stop("timeout"); }, 25);
  });
  if (child.pid && absent(child.pid) !== true) {
    if (!reason) stop("group_remaining");
    while (absent(child.pid) !== true && Date.now() < stopAt + 6000) await new Promise(resolve => setTimeout(resolve, 25));
  }
  clearInterval(poll); clearTimeout(killTimer); clearTimeout(drainTimer); captureFinished = true;
  const output = parts.map(chunks => Buffer.concat(chunks));
  const row = { label, args: [executable === process.execPath ? "[node]" : executable, ...args.map(value => clean(value, 250))],
    allowedExits: exits, exitCode, signal, stop: reason, spawned: !!child.pid, exitObserved: exited, closeObserved: closed,
    originalProcessGroupAbsent: child.pid ? absent(child.pid) : true, termSent: term, killSent: killed,
    streams: output.map((bytes, index) => ({ name: index ? "stderr" : "stdout", observedBytes: counts[index], capturedBytes: bytes.length,
      observedSha256: hashes[index].digest("hex"), capturedSha256: hash(bytes), complete: closed && counts[index] === bytes.length,
      ...(quiet ? {} : { head: clean(bytes.toString(), 500), tail: clean(bytes.subarray(Math.max(0, bytes.length - 700)).toString(), 700) }) })) };
  report.commands.push(row);
  if (label === "provenance_tests") {
    testRow = row; report.testStreams = output.map((bytes, index) => ({ name: index ? "stderr" : "stdout", ...compressed(bytes, index ? 32768 : 98304) }));
  }
  need(exits.includes(exitCode) && signal === null && reason === null && exited && closed && row.originalProcessGroupAbsent === true, label + "_failed");
  return output;
}
function parseGit(bytes, index) {
  const entries = new Map();
  for (const record of bytes.toString().split("\0").filter(Boolean)) {
    const tab = record.indexOf("\t"), header = record.slice(0, tab).split(" "), name = record.slice(tab + 1);
    need(tab > 0 && name && !path.isAbsolute(name) && !name.split("/").some(part => !part || part === "." || part === "..") && !entries.has(name), "git_entry_invalid");
    need(index ? header[2] === "0" : header[1] === "blob", "git_entry_type"); entries.set(name, { mode: header[0], sha: header[index ? 1 : 2] });
  }
  return entries;
}
async function guard(label, cleanup = false) {
  const row = { label, passed: false }; report.guards.push(row); const options = { cleanup, quiet: true };
  need((await run(label + "_head", "git", ["rev-parse", "HEAD"], 10, options))[0].toString().trim() === sourceCommit, "head_changed");
  need(!fs.existsSync(ACTIVE) && !fs.existsSync(".github/workflows/simulation-provenance-checks.yml"), "active_workflow_in_source");
  const raw = read(SEAL, 262144), pinned = (await run(label + "_seal", "git", ["show", "HEAD:" + SEAL], 10, options))[0];
  need(raw.equals(pinned) && (!report.sealSha256 || hash(raw) === report.sealSha256), "seal_changed"); manifest = JSON.parse(raw); report.sealSha256 = hash(raw);
  need(manifest.schemaVersion === 1 && manifest.kind === "before-launch-provenance-checks-source" && manifest.fileCount === manifest.files.length
    && JSON.stringify(manifest.historicalExceptions) === '["AGENTS.md"]', "seal_scope_invalid");
  const index = parseGit((await run(label + "_index", "git", ["ls-files", "--stage", "-z"], 10, options))[0], true);
  const tree = parseGit((await run(label + "_tree", "git", ["ls-tree", "-r", "-z", "HEAD"], 10, options))[0], false);
  need(tree.size === manifest.trackedFileCount && index.size === tree.size, "tracked_count_changed");
  const expected = new Map(manifest.files.map(entry => [entry.path, entry])); need(expected.size === manifest.fileCount && expected.size === 151 && !expected.has(SEAL), "application_input_set_invalid");
  let total = 0, applicationCount = 0;
  for (const [name, item] of tree) {
    const { bytes, mode } = trackedFile(name);
    need(item.mode === mode && item.sha === blob(bytes) && index.get(name)?.sha === item.sha && index.get(name)?.mode === mode, "full_tracked_bytes_or_index_changed");
    if (!name.startsWith(".agents/") && !name.startsWith("docs/results/")) {
      const wanted = expected.get(name); need(wanted && wanted.mode === mode && wanted.gitSha === item.sha && wanted.bytes === bytes.length && wanted.sha256 === hash(bytes), "application_fingerprint_changed"); total += bytes.length; applicationCount++;
    }
  }
  need(applicationCount === expected.size && total === manifest.sourceBytes, "application_input_bytes_changed");
  need((await run(label + "_status", "git", ["status", "--porcelain=v1", "-z", "--untracked-files=all"], 10, options))[0].length === 0, "worktree_not_clean");
  await run(label + "_working", "git", ["-c", "core.filemode=true", "diff", "--no-ext-diff", "--no-textconv", "--quiet", "--exit-code", "HEAD", "--"], 10, options);
  const oldRaw = read(OLD); need(hash(oldRaw) === OLD_HASH, "historical_inventory_changed"); historical = JSON.parse(oldRaw);
  need(historical.source_files.length === 148 && historical.total_cases === 48 && historical.case_files.length === 5
    && manifest.totalCases === 48 && JSON.stringify(manifest.testFiles) === JSON.stringify(historical.case_files), "historical_case_scope_changed");
  for (const [file, count] of CASE_FILES) {
    const item = historical.case_files.find(entry => entry.path === file);
    need(item && item.names.length === count && new Set(item.names).size === count && item.names.every(name => typeof name === "string" && name.length > 0 && name.length <= 1024), "historical_case_names_invalid");
  }
  const changed = historical.source_files.filter(entry => { const { bytes, mode } = trackedFile(entry.path); return entry.mode !== mode || entry.bytes !== bytes.length || entry.sha256 !== hash(bytes); }).map(entry => entry.path);
  need(changed.every(name => name === "AGENTS.md"), "historical_source_changed");
  Object.assign(row, { passed: true, inputFiles: expected.size, inputBytes: total, trackedFiles: tree.size, fullIndexMatchesHead: true,
    fullWorkingBytesMatchHead: true, historicalFiles: 148, historicalChanged: changed, historicalInventorySha256: OLD_HASH });
}
function captureDependencies() {
  need(dependencyPreAbsent, "generated_preabsence_unverified");
  let item; try { item = fs.lstatSync("node_modules"); } catch (error) { need(error.code === "ENOENT", "dependency_stat_failed"); return; }
  need(item.isDirectory() && !item.isSymbolicLink(), "generated_type_changed");
  if (dependencyIdentity) need(item.dev === dependencyIdentity.dev && item.ino === dependencyIdentity.ino, "generated_identity_changed");
  else { dependencyIdentity = { dev: item.dev, ino: item.ino }; report.generated.push({ path: "node_modules", ...dependencyIdentity, preAbsent: true }); }
}
function recordIgnored(label, output) {
  const records = output.toString().split("\0").filter(Boolean);
  const rows = records.slice(0, 16).map(record => {
    const name = record.slice(3); let prefix = "", size = 0;
    for (const character of name) { const bytes = Buffer.byteLength(character); if (size + bytes > 240) break; prefix += character; size += bytes; }
    return { status: record.slice(0, 2), path: prefix, pathBytes: Buffer.byteLength(name), truncated: size < Buffer.byteLength(name) };
  });
  report.ignoredOutput.push({ label, bytes: output.length, sha256: hash(output), recordCount: records.length, rows, truncated: records.length > 16 });
  need(records.length <= 16 && rows.every(row => !row.truncated), "ignored_diagnostic_limit"); return records;
}
async function generatedPaths(label, cleanup = false) {
  captureDependencies();
  const output = (await run(label + "_ignored", "git", ["status", "--porcelain=v1", "-z", "--ignored=matching", "--untracked-files=normal"], 10, { cleanup, quiet: true }))[0];
  for (const record of recordIgnored(label, output)) need(record === "!! node_modules/", "unexpected_generated_output");
}
function compressed(bytes, maximum) {
  const gzip = gzipSync(bytes), value = { encoding: "gzip-base64", bytes: bytes.length, sha256: hash(bytes), compressedBytes: gzip.length };
  need(gzip.length <= maximum, "raw_gzip_limit"); return { ...value, data: gzip.toString("base64") };
}
function results() {
  owner(); const bytes = read(resultFile, 2097152); report.results = { raw: compressed(bytes, 131072), accepted: false, files: [], cases: [] };
  const data = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  need(Array.isArray(data.testResults) && data.testResults.length <= 16, "vitest_report_shape");
  const expected = new Map(historical.case_files.map(entry => [entry.path, entry.names])), seen = new Set(), ids = new Set(); let valid = true;
  for (const file of data.testResults) {
    need(typeof file.name === "string" && Array.isArray(file.assertionResults) && file.assertionResults.length <= 100, "vitest_file_shape");
    const name = path.relative(repo, file.name).split(path.sep).join("/"), wanted = expected.get(name), names = file.assertionResults.map(item => item.fullName);
    valid &&= !seen.has(name) && !!wanted && new Set(names).size === names.length
      && JSON.stringify([...names].sort()) === JSON.stringify([...(wanted ?? [])].sort()); seen.add(name);
    report.results.files.push({ file: clean(name, 300), status: file.status, message: clean(file.message, 2000), cases: names.length });
    valid &&= file.status === "passed" && file.message === "";
    for (const item of file.assertionResults) {
      need(typeof item.fullName === "string" && item.fullName.length <= 1024 && Array.isArray(item.failureMessages), "vitest_assertion_shape");
      const id = name + "\0" + item.fullName; valid &&= !ids.has(id); ids.add(id);
      report.results.cases.push({ file: clean(name, 300), name: item.fullName, status: item.status,
        durationMs: item.duration, failureMessages: item.failureMessages.slice(0, 2).map(message => clean(message, 2000)) });
      valid &&= item.status === "passed" && item.failureMessages.length === 0;
    }
  }
  parsedResults = true;
  report.results.totals = Object.fromEntries(["numTotalTests", "numPassedTests", "numFailedTests", "numPendingTests", "numTodoTests",
    "numTotalTestSuites", "numPassedTestSuites", "numFailedTestSuites", "numPendingTestSuites"].map(name => [name, data[name]]));
  report.results.success = data.success; report.results.unorderedIdentitySet = true;
  need(data.success === true && data.numTotalTests === 48 && data.numPassedTests === 48 && data.numFailedTests === 0 && data.numPendingTests === 0
    && data.numTodoTests === 0 && data.numTotalTestSuites === 7 && data.numPassedTestSuites === 7 && data.numFailedTestSuites === 0
    && data.numPendingTestSuites === 0 && seen.size === 5 && ids.size === 48 && valid, "exact_48_results_failed");
  need(testRow?.exitCode === 0 && testRow.stop === null && testRow.signal === null && testRow.exitObserved && testRow.closeObserved
    && testRow.originalProcessGroupAbsent === true && testRow.streams.every(stream => stream.complete), "vitest_process_failed");
  report.results.accepted = true;
}
async function removeOwned(file, snapshot) {
  const item = fs.lstatSync(file); need(item.isDirectory() && !item.isSymbolicLink() && item.dev === snapshot.dev && item.ino === snapshot.ino, "cleanup_identity_changed");
  let timer;
  try { await Promise.race([fs.promises.rm(file, { recursive: true, force: false, maxRetries: 0 }),
    new Promise((_, reject) => { timer = setTimeout(() => reject(new Error("cleanup_timeout")), Math.max(1, cleanupEnd - Date.now())); })]); }
  finally { clearTimeout(timer); }
  need(!fs.existsSync(file), "cleanup_path_remaining");
}
try {
  try { fs.lstatSync("node_modules"); throw new Error("preexisting_generated_output"); }
  catch (error) { if (error.code !== "ENOENT") throw error; }
  dependencyPreAbsent = true;
  await guard("before"); await generatedPaths("before");
  const digest = createHash("sha256"); for await (const chunk of fs.createReadStream(process.execPath)) digest.update(chunk); report.runtime.executableSha256 = digest.digest("hex");
  const corepack = fs.realpathSync(path.join(path.dirname(process.execPath), "corepack")); report.runtime.corepackCliSha256 = hash(read(corepack));
  await run("prepare_pnpm", process.execPath, [corepack, "prepare", "pnpm@10.24.0", "--activate"], 60);
  report.runtime.pnpm = (await run("pnpm_version", process.execPath, [corepack, "pnpm", "--version"], 15))[0].toString().trim(); need(report.runtime.pnpm === "10.24.0", "pnpm_version_changed");
  await run("install", process.execPath, [corepack, "pnpm", "install", "--frozen-lockfile", "--ignore-scripts", "--store-dir", path.join(root, "pnpm", "store")], 240);
  await generatedPaths("after_install"); await guard("after_install");
  const cli = path.join(repo, "node_modules/vitest/vitest.mjs"); report.runtime.vitestCliSha256 = hash(read(cli));
  for (const name of ["vitest", "typescript"]) report.runtime[name] = JSON.parse(read(path.join(repo, "node_modules", name, "package.json"))).version;
  report.runtime.vite = JSON.parse(read(createRequire(fs.realpathSync(cli)).resolve("vite/package.json"))).version;
  await run("provenance_tests", process.execPath, [cli, "run", ...CASE_FILES.map(([file]) => file), "--maxWorkers=1", "--no-file-parallelism", "--retry=0",
    "--reporter=tap", "--reporter=json", "--outputFile.json=" + resultFile], 240, { exits: [0, 1] });
  results(); need(Date.now() <= workEnd, "work_deadline_exceeded");
} catch (error) { report.errors.push(errorCode(error)); }
finally {
  cleanupEnd = Math.min(Date.now() + 60000, workEnd + 60000);
  if (!parsedResults && historical && fs.existsSync(resultFile)) try { results(); } catch (error) { report.errors.push(errorCode(error)); }
  try { await generatedPaths("after", true); } catch (error) { report.errors.push(errorCode(error)); }
  try { await guard("after", true); } catch (error) { report.errors.push(errorCode(error)); }
  try {
    owner(); need(report.commands.every(item => !item.spawned || (item.exitObserved && item.closeObserved && item.originalProcessGroupAbsent === true)), "process_cleanup_unverified");
    need(dependencyPreAbsent, "generated_preabsence_unverified"); captureDependencies();
    if (dependencyIdentity) { await removeOwned(path.join(repo, "node_modules"), dependencyIdentity); report.generated[0].removed = true; }
    await guard("after_output_cleanup", true);
    const ignored = (await run("final_ignored", "git", ["status", "--porcelain=v1", "-z", "--ignored=matching", "--untracked-files=all"], 10, { cleanup: true, quiet: true }))[0];
    recordIgnored("final", ignored); need(ignored.length === 0, "generated_output_remaining");
    owner(); await removeOwned(root, identity); report.cleanup = "passed";
  } catch (error) { report.cleanup = "unverified"; report.scratchRetained = fs.existsSync(root); report.errors.push(errorCode(error)); }
}
if (Date.now() > cleanupEnd) report.errors.push("cleanup_deadline_exceeded");
report.interrupted = interrupted; if (interrupted) report.errors.push("interrupted"); report.completedAtUtc = new Date().toISOString();
report.status = !report.errors.length && report.results?.accepted === true && report.cleanup === "passed" ? "passed" : "failed";
let output = JSON.stringify(report);
if (Buffer.byteLength(output) > REPORT_LIMIT) {
  report.status = "failed"; report.errors.push("report_limit");
  for (const command of report.commands) for (const stream of command.streams) { delete stream.head; delete stream.tail; }
  for (const stream of report.testStreams ?? []) { delete stream.data; stream.payloadOmitted = true; }
  if (report.results?.raw) { delete report.results.raw.data; report.results.raw.payloadOmitted = true; }
  output = JSON.stringify(report);
}
need(Buffer.byteLength(output) <= REPORT_LIMIT, "report_limit");
function finish(exit) { clearTimeout(terminalTimer); for (const [signal, handler] of handlers) process.off(signal, handler); process.exit(exit); }
const timer = setTimeout(() => { process.stdout.destroy(); finish(1); }, Math.max(1, Math.min(2000, cleanupEnd + 2000 - Date.now(), workEnd + 62000 - Date.now())));
process.stdout.write(output + "\n", error => { clearTimeout(timer); finish(!error && !interrupted && report.status === "passed"
  && Date.now() <= Math.min(cleanupEnd + 2000, workEnd + 62000) ? 0 : 1); });
