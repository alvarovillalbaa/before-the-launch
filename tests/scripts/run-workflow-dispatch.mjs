import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import net from "node:net";
import http from "node:http";
import { spawn, execFileSync } from "node:child_process";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { qualifyWorkflow } from "../integration/workflow-dispatch.mjs";

assert.equal(process.env.CI, "true");
assert.equal(process.env.WORKFLOW_DISPATCH_TARGET, "local-disposable");
assert.equal(process.env.GITHUB_REPOSITORY, "alvarovillalbaa/before-the-launch");
assert.match(process.env.EXPECTED_SOURCE ?? "", /^[a-f0-9]{40}$/);
const repo = fs.realpathSync(process.cwd());
assert.equal(execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(), process.env.EXPECTED_SOURCE);
assert.equal(execFileSync("git", ["status", "--porcelain"], { encoding: "utf8" }), "");
const root = fs.mkdtempSync(path.join(process.env.RUNNER_TEMP, "btl-workflow-runtime-")); fs.chmodSync(root, 0o700);
const rootIdentity = fs.statSync(root), owner = randomUUID(); fs.writeFileSync(path.join(root, "owner"), owner, { mode: 0o600 });
const proof = path.join(process.env.RUNNER_TEMP, `btl-workflow-runtime-${process.env.GITHUB_RUN_ID}`);
assert.ok(!fs.existsSync(proof)); fs.mkdirSync(proof, { mode: 0o700 });
for (const name of ["tmp", "raw", "tools"]) fs.mkdirSync(path.join(root, name), { mode: 0o700 });
const digest = bytes => createHash("sha256").update(bytes).digest("hex");
const generated = ["node_modules", ".next", ".swc", "next-env.d.ts", "tsconfig.tsbuildinfo", "app/.well-known/workflow"];
for (const name of generated) assert.ok(!fs.existsSync(path.join(repo, name)), `owned output must start absent: ${name}`);
const report = { kind: "before-launch.workflow-dispatch", source: process.env.EXPECTED_SOURCE, runId: process.env.GITHUB_RUN_ID,
  node: process.version, commands: [], checks: [], cleanup: {}, accepted: false };
const groups = [], privateValues = [owner];
const environment = Object.fromEntries(["PATH", "HOME", "USER", "LOGNAME", "LANG", "RUNNER_TEMP"].filter(key => process.env[key]).map(key => [key, process.env[key]]));
const operatorKey = randomBytes(32).toString("hex"), password = randomBytes(20).toString("hex"); privateValues.push(operatorKey, password);
const container = `btl-workflow-${process.env.GITHUB_RUN_ID}-${process.env.GITHUB_RUN_ATTEMPT}`;
const network = `${container}-network`;
fs.writeFileSync(path.join(root, "npm-user"), "registry=https://registry.npmjs.org/\n");
fs.writeFileSync(path.join(root, "npm-global"), "registry=https://registry.npmjs.org/\n");
Object.assign(environment, { CI: "true", NEXT_TELEMETRY_DISABLED: "1", TMPDIR: path.join(root, "tmp"),
  npm_config_cache: path.join(root, "npm-cache"), npm_config_userconfig: path.join(root, "npm-user"), npm_config_globalconfig: path.join(root, "npm-global"),
  PLAYWRIGHT_BROWSERS_PATH: path.join(root, "browsers"), DATABASE_URL: `postgres://workflow_ci:${password}@127.0.0.1:54331/btl_workflow_ci`,
  OPERATOR_ACCESS_KEY: operatorKey, SIMULATION_ENGINE: "fake", SOURCE_STORAGE_DRIVER: "local", LOCAL_STORAGE_DIR: path.join(root, "storage"),
  WORKFLOW_DISPATCH_TARGET: "local-disposable", WORKFLOW_TARGET_WORLD: "local", WORKFLOW_LOCAL_DATA_DIR: path.join(root, "journal"),
  WORKFLOW_LOCAL_BASE_URL: "https://127.0.0.1:3120", WORKFLOW_NODE_HTTP: "1", WORKFLOW_LOCAL_RECOVER_ACTIVE_RUNS: "true" });
const redact = text => privateValues.reduce((result, value) => result.replaceAll(value, "[private fixture]"), text).slice(-20_000);
function vector() {
  const rows = {};
  for (const entry of execFileSync("git", ["ls-tree", "-rz", "HEAD"]).toString().split("\0").filter(Boolean)) {
    const [meta, name] = entry.split("\t"), [mode, kind, blob] = meta.split(" "); assert.equal(kind, "blob");
    const file = path.join(repo, name); assert.ok(!fs.lstatSync(file).isSymbolicLink()); const bytes = fs.readFileSync(file);
    const actual = createHash("sha1").update(Buffer.concat([Buffer.from(`blob ${bytes.length}\0`), bytes])).digest("hex");
    assert.equal(actual, blob, `tracked source changed: ${name}`); rows[name] = { mode, blob, bytes: bytes.length, sha256: digest(bytes) };
  }
  return rows;
}
const seal = rows => ({ files: Object.keys(rows).length, bytes: Object.values(rows).reduce((sum, row) => sum + row.bytes, 0), sha256: digest(JSON.stringify(rows)) });
function start(label, command, args, extra = {}) {
  const index = report.commands.length + 1;
  const stdoutPath = path.join(root, "raw", `${index}.stdout`), stderrPath = path.join(root, "raw", `${index}.stderr`);
  const stdout = fs.openSync(stdoutPath, "wx", 0o600), stderr = fs.openSync(stderrPath, "wx", 0o600);
  const child = spawn(command, args, { cwd: repo, env: { ...environment, ...extra }, stdio: ["ignore", stdout, stderr], detached: true });
  fs.closeSync(stdout); fs.closeSync(stderr);
  const entry = { label, pid: child.pid, exitCode: null, reaped: false, groupAbsent: false };
  report.commands.push(entry);
  const handle = { child, entry, stdoutPath, stderrPath, done: new Promise(resolve => { child.once("error", error => resolve({ error })); child.once("close", code => resolve({ code })); }) };
  groups.push(handle); return handle;
}
function groupExists(pid) { try { process.kill(-pid, 0); return true; } catch (error) { if (error.code === "ESRCH") return false; throw error; } }
async function collect(handle, result) {
  handle.entry.exitCode = result.code ?? null; handle.entry.reaped = !result.error;
  handle.entry.groupAbsent = !groupExists(handle.child.pid);
  for (const [stream, file] of [["stdout", handle.stdoutPath], ["stderr", handle.stderrPath]]) {
    const bytes = fs.readFileSync(file); handle.entry[stream] = { bytes: bytes.length, sha256: digest(bytes) };
  }
}
async function stop(handle, crash = false) {
  if (handle.child.exitCode === null && handle.child.signalCode === null) process.kill(-handle.child.pid, crash ? "SIGKILL" : "SIGTERM");
  let result = await Promise.race([handle.done, new Promise(resolve => setTimeout(() => resolve(null), 8000))]);
  if (!result) { process.kill(-handle.child.pid, "SIGKILL"); handle.entry.forced = true; result = await handle.done; }
  if (crash) handle.entry.controlledCrash = true;
  await collect(handle, result); assert.ok(handle.entry.reaped && handle.entry.groupAbsent, "owned process group remains");
}
async function run(label, command, args, timeout = 120_000, extra = {}) {
  const handle = start(label, command, args, extra);
  const timer = setTimeout(() => { handle.entry.timedOut = true; try { process.kill(-handle.child.pid, "SIGKILL"); } catch {} }, timeout);
  const result = await handle.done; clearTimeout(timer); await collect(handle, result);
  if (result.code !== 0 || !handle.entry.groupAbsent || handle.entry.timedOut) {
    fs.writeFileSync(path.join(proof, `${report.commands.indexOf(handle.entry) + 1}-failure.txt`), redact(fs.readFileSync(handle.stdoutPath, "utf8") + fs.readFileSync(handle.stderrPath, "utf8")));
  }
  assert.equal(result.code, 0, `${label} failed`); assert.ok(handle.entry.groupAbsent && !handle.entry.timedOut, `${label} did not settle`);
  return fs.readFileSync(handle.stdoutPath, "utf8");
}
async function freePort(port) {
  const server = net.createServer(); await new Promise((resolve, reject) => { server.once("error", reject); server.listen(port, "127.0.0.1", resolve); });
  await new Promise(resolve => server.close(resolve));
}
const cli = file => path.join(repo, "node_modules", file);
async function startApp() {
  const handle = start("production-server", process.execPath, [cli("next/dist/bin/next"), "start", "--hostname", "127.0.0.1", "--port", "3121"], { NODE_ENV: "production" });
  const end = Date.now() + 60_000;
  while (Date.now() < end) {
    const ready = await new Promise(resolve => { const req = http.get("http://127.0.0.1:3121/login", response => { response.resume(); resolve(response.statusCode === 200); }); req.setTimeout(2000, () => req.destroy()); req.on("error", () => resolve(false)); });
    if (ready) return handle;
    assert.equal(handle.child.exitCode, null, "app exited before readiness"); await new Promise(resolve => setTimeout(resolve, 200));
  }
  throw new Error("app_readiness_timeout");
}
let networkCreated = false, containerCreated = false, before;
try {
  assert.ok(os.freemem() > 1024 ** 3); assert.ok(fs.statfsSync(root).bavail * fs.statfsSync(root).bsize > 12 * 1024 ** 3, "external storage admission");
  before = vector(); report.sourceBefore = seal(before); fs.writeFileSync(path.join(proof, "source-vector.json"), JSON.stringify(before));
  assert.ok(Number(process.versions.node.split(".")[0]) >= 22);
  await run("pinned-pnpm", "npm", ["install", "--prefix", path.join(root, "tools"), "--ignore-scripts", "--no-audit", "--no-fund", "pnpm@10.24.0"]);
  const pnpm = path.join(root, "tools/node_modules/pnpm/bin/pnpm.cjs");
  assert.equal((await run("pnpm-version", process.execPath, [pnpm, "--version"])).trim(), "10.24.0");
  await run("frozen-install", process.execPath, [pnpm, "install", "--frozen-lockfile", "--ignore-scripts", "--store-dir", path.join(root, "store")], 360_000);
  report.versions = Object.fromEntries(["workflow", "next", "@playwright/test"].map(name => [name, JSON.parse(fs.readFileSync(cli(`${name}/package.json`))).version]));
  assert.equal(report.versions.workflow, "5.4.0"); assert.equal(report.versions.next, "16.2.9");
  assert.deepEqual(vector(), before);
  for (const port of [54331, 3120, 3121]) await freePort(port);
  await run("owned-network", "docker", ["network", "create", "--label", `btl.workflow.owner=${owner}`, network]); networkCreated = true;
  await run("owned-postgresql", "docker", ["run", "--detach", "--name", container, "--label", `btl.workflow.owner=${owner}`, "--network", network, "--publish", "127.0.0.1:54331:5432", "--env", "POSTGRES_DB=btl_workflow_ci", "--env", "POSTGRES_USER=workflow_ci", "--env", `POSTGRES_PASSWORD=${password}`, "postgres:17-alpine"], 120_000); containerCreated = true;
  report.database = { container, network, identity: JSON.parse(await run("owned-database-identity", "docker", ["inspect", container]))[0].Id,
    image: JSON.parse(await run("database-image-identity", "docker", ["image", "inspect", "postgres:17-alpine"]))[0].RepoDigests };
  const { Pool } = await import("pg"); const readiness = new Pool({ connectionString: environment.DATABASE_URL });
  try {
    let ready = false, lastError;
    for (let attempt = 0; attempt < 60; attempt++) {
      try { await readiness.query("select 1"); ready = true; break; }
      catch (error) { lastError = { code: error.code, message: redact(String(error.message)) }; await new Promise(resolve => setTimeout(resolve, 500)); }
    }
    if (!ready) {
      report.database.readinessError = lastError;
      const diagnostic = await run("owned-database-readiness-diagnostic", "docker", ["logs", "--tail", "40", container]);
      fs.writeFileSync(path.join(proof, "database-readiness-failure.txt"), redact(diagnostic));
    }
    assert.ok(ready, "owned PG readiness");
  } finally { await readiness.end(); }
  await run("existing-schema-empty-disposable-database", process.execPath, [cli("drizzle-kit/bin.cjs"), "push", "--force"], 90_000);
  await run("authored-seed", process.execPath, [cli("tsx/dist/cli.mjs"), "scripts/seed.ts"], 60_000);
  await run("targeted-lint", process.execPath, [cli("eslint/bin/eslint.js"), "app/actions.ts", "app/api/runs/route.ts", "app/api/runs/[runId]/execute/route.ts", "components/run-monitor.tsx", "lib/server/services/simulation-dispatch.ts", "lib/server/services/simulation-dispatch-store.ts", "lib/server/services/simulation-service.ts", "workflows/simulation-steps.ts", "workflows/simulation-workflow.ts", "proxy.ts", "next.config.ts", "tests/integration/workflow-dispatch.mjs", "tests/scripts/run-workflow-dispatch.mjs"], 60_000);
  await run("compiled-production-workflow", process.execPath, [cli("next/dist/bin/next"), "build"], 240_000);
  assert.deepEqual(vector(), before);
  await run("chromium-install", process.execPath, [cli("@playwright/test/cli.js"), "install", "--with-deps", "chromium"], 180_000);
  await run("authored-tls", "openssl", ["req", "-x509", "-newkey", "rsa:2048", "-sha256", "-nodes", "-days", "1", "-subj", "/CN=127.0.0.1", "-addext", "subjectAltName=IP:127.0.0.1,DNS:localhost", "-keyout", path.join(root, "key.pem"), "-out", path.join(root, "cert.pem")], 30_000);
  for (const name of ["key.pem", "cert.pem"]) fs.chmodSync(path.join(root, name), 0o600);
  environment.NODE_EXTRA_CA_CERTS = path.join(root, "cert.pem");
  // Only this single Next process loads Local World. This controller never imports it.
  await qualifyWorkflow({ root, env: environment, report, startApp, stopApp: stop });
  report.accepted = true;
} catch (error) {
  report.failure = { type: error.name, message: redact(String(error.message)) };
} finally {
  try {
    for (const handle of groups) {
      if (handle.child.exitCode === null && handle.child.signalCode === null) await stop(handle);
      assert.ok(!groupExists(handle.child.pid), "captured child group remains");
    }
    report.cleanup.capturedProcessGroupsAbsent = true;
    if (containerCreated) {
      const saved = JSON.parse(await run("verify-owned-container", "docker", ["inspect", container]))[0]; assert.equal(saved.Config.Labels["btl.workflow.owner"], owner);
      assert.equal(saved.Id, report.database?.identity ?? saved.Id);
      await run("remove-owned-container-and-volumes", "docker", ["rm", "--force", "--volumes", container]);
      const remains = await run("readback-owned-container-absence", "docker", ["ps", "--all", "--quiet", "--filter", `name=^/${container}$`]); assert.equal(remains.trim(), "");
    }
    report.cleanup.ownedDatabaseAbsent = true;
    if (networkCreated) {
      const saved = JSON.parse(await run("verify-owned-network", "docker", ["network", "inspect", network]))[0]; assert.equal(saved.Labels["btl.workflow.owner"], owner); assert.deepEqual(saved.Containers, {});
      await run("remove-owned-network", "docker", ["network", "rm", network]);
      assert.equal((await run("readback-owned-network-absence", "docker", ["network", "ls", "--quiet", "--filter", `name=^${network}$`])).trim(), "");
    }
    report.cleanup.ownedNetworkAbsent = true;
    assert.deepEqual(vector(), before); report.sourceAfter = seal(before);
    for (const name of generated) { const item = path.join(repo, name); if (fs.existsSync(item)) { const stat = fs.lstatSync(item); assert.ok(!stat.isSymbolicLink() && stat.uid === process.getuid()); fs.rmSync(item, { recursive: stat.isDirectory() }); } }
    assert.equal(execFileSync("git", ["status", "--porcelain"], { encoding: "utf8" }), ""); report.cleanup.sourceClean = true;
    // Retain only bounded, redacted failure diagnostics, never TLS keys, auth,
    // database contents, the private journal, node_modules or raw app output.
    if (!report.accepted) for (const handle of groups.filter(value => value.entry.label === "production-server")) {
      fs.writeFileSync(path.join(proof, `server-${handle.child.pid}-failure.txt`), redact(fs.readFileSync(handle.stdoutPath, "utf8") + fs.readFileSync(handle.stderrPath, "utf8")));
    }
    const stat = fs.lstatSync(root); assert.ok(!stat.isSymbolicLink()); assert.equal(stat.ino, rootIdentity.ino); assert.equal(stat.dev, rootIdentity.dev); assert.equal(fs.readFileSync(path.join(root, "owner"), "utf8"), owner);
    fs.rmSync(root, { recursive: true }); assert.ok(!fs.existsSync(root)); report.cleanup.privateScratchAbsent = true;
  } catch (error) { report.accepted = false; report.cleanup.failure = { type: error.name, message: redact(String(error.message)) }; }
  fs.writeFileSync(path.join(proof, "receipt.json"), JSON.stringify(report, null, 2) + "\n");
  console.log(JSON.stringify({ accepted: report.accepted, checks: report.checks.map(({ id, status }) => ({ id, status })), failure: report.failure, cleanup: report.cleanup }));
}
process.exitCode = report.accepted ? 0 : 1;
