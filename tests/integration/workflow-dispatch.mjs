// Real compiled Workflow + PostgreSQL checks. The only fault injection is transport
// withholding/response loss and exact, task-owned authored SQL fixture state.
import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import https from "node:https";
import { X509Certificate, createHash, randomUUID } from "node:crypto";

const origin = "https://127.0.0.1:3120";
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export async function qualifyWorkflow({ root, env, report, startApp, stopApp }) {
  assert.equal(env.CI, "true");
  assert.equal(env.WORKFLOW_DISPATCH_TARGET, "local-disposable");
  assert.match(env.DATABASE_URL, /^postgres:\/\/workflow_ci:[a-f0-9]+@127\.0\.0\.1:54331\/btl_workflow_ci$/);
  assert.equal(env.WORKFLOW_TARGET_WORLD, "local");
  assert.equal(env.WORKFLOW_LOCAL_BASE_URL, origin);
  assert.ok(!Object.keys(env).some(key => /API_KEY|OIDC_TOKEN|BLOB_.*TOKEN/.test(key)));
  const { Pool } = await import("pg");
  const { chromium } = await import("@playwright/test");
  const pool = new Pool({ connectionString: env.DATABASE_URL });
  const cert = fs.readFileSync(`${root}/cert.pem`);
  const spki = createHash("sha256").update(new X509Certificate(cert).publicKey.export({ type: "spki", format: "der" })).digest("base64");
  let hold = false, drop = null, cookie = "", browser, browserServer, app;
  const held = new Set(), sockets = new Set(), upstreams = new Set();
  report.transport = { queueHeld: 0, queueDelivered: 0, actualResponsesDropped: 0, origin,
    certificateSha256: createHash("sha256").update(cert).digest("hex"), browserTrust: "exact authored certificate SPKI" };
  const hop = new Set(["connection", "proxy-connection", "keep-alive", "upgrade", "te", "trailer", "transfer-encoding"]);
  const cleanHeaders = headers => Object.fromEntries(Object.entries(headers).filter(([key]) => !hop.has(key)));
  const server = https.createServer({ key: fs.readFileSync(`${root}/key.pem`), cert, minVersion: "TLSv1.2" }, (request, response) => {
    assert.equal(request.headers.host, "127.0.0.1:3120");
    const deliver = () => {
      held.delete(deliver);
      if (request.destroyed || response.destroyed) return;
      const headers = cleanHeaders(request.headers);
      delete headers.forwarded; delete headers["x-forwarded-for"];
      Object.assign(headers, { host: "127.0.0.1:3120", "x-forwarded-host": "127.0.0.1:3120", "x-forwarded-port": "3120", "x-forwarded-proto": "https" });
      const lose = request.method === "POST" && request.url === drop;
      if (lose) drop = null;
      if (request.url.startsWith("/.well-known/workflow/")) report.transport.queueDelivered++;
      const upstream = http.request({ hostname: "127.0.0.1", port: 3121, method: request.method, path: request.url, headers, agent: false }, result => {
        if (lose) {
          result.resume();
          result.once("end", () => { report.transport.actualResponsesDropped++; response.destroy(); });
        } else { response.writeHead(result.statusCode, cleanHeaders(result.headers)); result.pipe(response); }
        result.on("error", () => response.destroy());
      });
      upstreams.add(upstream); upstream.once("close", () => upstreams.delete(upstream));
      upstream.once("error", () => response.destroy());
      request.once("aborted", () => upstream.destroy()); request.on("error", () => upstream.destroy());
      response.on("error", () => upstream.destroy());
      request.pipe(upstream);
    };
    if (hold && request.url.startsWith("/.well-known/workflow/")) {
      assert.ok(held.size < 32, "bounded held queue"); report.transport.queueHeld++; held.add(deliver);
      response.once("close", () => held.delete(deliver));
    } else deliver();
  });
  server.on("connection", socket => { sockets.add(socket); socket.once("close", () => sockets.delete(socket)); });
  server.on("upgrade", (_request, socket) => socket.destroy());
  server.on("connect", (_request, socket) => socket.destroy());
  const release = () => { hold = false; for (const deliver of [...held]) deliver(); };
  async function api(path, body, { authenticated = true, requestOrigin = origin } = {}) {
    return new Promise((resolve, reject) => {
      const bytes = body === undefined ? null : Buffer.from(JSON.stringify(body));
      const req = https.request(origin + path, { ca: cert, agent: false, method: bytes ? "POST" : "GET", timeout: 20_000,
        headers: { ...(authenticated && cookie ? { Cookie: cookie } : {}), ...(bytes ? { Origin: requestOrigin, "Content-Type": "application/json", "Content-Length": bytes.length } : {}) } }, response => {
        const chunks = []; let size = 0;
        response.on("data", chunk => { size += chunk.length; if (size > 2_097_152) response.destroy(); else chunks.push(chunk); });
        response.once("error", reject);
        response.once("end", () => { const text = Buffer.concat(chunks).toString(); resolve({ status: response.statusCode, headers: response.headers, body: text ? JSON.parse(text) : null }); });
      });
      req.once("timeout", () => req.destroy(new Error("fixture_request_timeout"))); req.once("error", reject); req.end(bytes);
    });
  }
  const query = async (sql, args = []) => (await pool.query(sql, args)).rows;
  const row = async id => (await query("select * from simulation_runs where id=$1", [id]))[0];
  async function until(fn, label, timeout = 45_000) {
    const end = Date.now() + timeout;
    while (Date.now() < end) { if (await fn()) return; await sleep(150); }
    throw new Error(label);
  }
  const ownRuns = new Set();
  let projectId, personaIds;
  async function create() {
    const intent = { requestId: randomUUID(), projectId, personaIds, agentCount: personaIds.length,
      targetMarket: "Authored independent bookshop market", engine: "fake", depth: "quick", budgetLimitCents: 0 };
    const response = await api("/api/runs", intent);
    assert.equal(response.status, 201); assert.equal(response.body.ok, true); assert.equal(response.body.dispatch.confirmed, true);
    assert.ok(!JSON.stringify(response.body).includes("admissionGrant"));
    ownRuns.add(response.body.run.id); return response.body.run.id;
  }
  async function complete(id) {
    try { await until(async () => (await row(id)).status === "completed", "saved_run_not_completed"); }
    catch (error) {
      const saved = await row(id);
      report.lastIncompleteRun = { id, status: saved.status, workflowRunId: saved.workflow_run_id, reason: saved.error_message,
        attempts: saved.disagreement_summary.executionControls.attempts.length };
      throw error;
    }
    const saved = await row(id), controls = saved.disagreement_summary.executionControls;
    assert.ok(saved.workflow_run_id); assert.ok(controls.claim);
    assert.equal(controls.attempts.length, personaIds.length);
    assert.ok(controls.attempts.every(attempt => attempt.origin === "fake" && attempt.reservedNanoUsd === 0));
    const counts = (await query("select count(*)::int n, sum(a.cost_cents)::int cost from agent_runs a join agent_findings f on f.agent_run_id=a.id where a.simulation_run_id=$1", [id]))[0];
    assert.equal(counts.n, personaIds.length); assert.equal(counts.cost, 0);
    assert.equal((await query("select count(*)::int n from reports where simulation_run_id=$1", [id]))[0].n, 1);
    return { id, workflowRunId: saved.workflow_run_id, status: saved.status, findings: counts.n, modelCostCents: counts.cost };
  }
  async function check(id, name, fn) {
    const entry = { id, name, status: "running" }; report.checks.push(entry);
    try { entry.evidence = await fn(); entry.status = "passed"; }
    catch (error) { entry.status = "failed"; entry.error = error instanceof assert.AssertionError ? { type: "AssertionError", message: error.message.slice(0, 1000) } : { type: error.name, message: String(error.message).slice(0, 1000) }; throw error; }
  }
  try {
    await new Promise((resolve, reject) => { server.once("error", reject); server.listen(3120, "127.0.0.1", resolve); });
    app = await startApp();
    await check("D01", "operator access and cross-origin refusal", async () => {
      assert.equal((await api("/api/projects", undefined, { authenticated: false })).status, 401);
      const login = await api("/api/operator/login", { accessKey: env.OPERATOR_ACCESS_KEY });
      assert.equal(login.status, 200); cookie = login.headers["set-cookie"][0].split(";", 1)[0];
      assert.match(login.headers["set-cookie"][0], /HttpOnly/i); assert.match(login.headers["set-cookie"][0], /Secure/i);
      assert.equal((await api("/api/runs", {}, { requestOrigin: "https://authored.invalid" })).status, 403);
      assert.equal((await api("/api/runs/11111111-1111-4111-8111-111111111111/execute", {}, { authenticated: false })).status, 401);
      return { unauthenticatedRead: 401, unauthenticatedExecute: 401, crossOriginWrite: 403 };
    });
    projectId = (await query("select id from product_projects where name='SignalForge LaunchOS'"))[0].id;
    personaIds = (await query("select id from personas order by id limit 2")).map(p => p.id);
    assert.equal(personaIds.length, 2);
    await check("D02", "real API create, Workflow step and PostgreSQL report", async () => complete(await create()));
    await check("D03", "concurrent dispatch keeps one native owner and one SQL execution", async () => {
      hold = true; const id = await create(), owner = (await row(id)).workflow_run_id;
      assert.equal((await row(id)).status, "queued");
      // Exact owned, still-unclaimed fixture: force the real atomic Hook path.
      await query("update simulation_runs set workflow_run_id=null where id=$1 and status='queued' and workflow_run_id=$2", [id, owner]);
      const replies = await Promise.all(Array.from({ length: 4 }, () => api(`/api/runs/${id}/execute`, {})));
      assert.ok(replies.every(response => response.status === 202)); assert.equal((await row(id)).workflow_run_id, owner);
      release(); const evidence = await complete(id); assert.equal(evidence.workflowRunId, owner); return { ...evidence, concurrentRequests: 4, controlledBindingLoss: true };
    });
    await check("D04", "lost real HTTP response retries the saved owner", async () => {
      hold = true; const id = await create(), owner = (await row(id)).workflow_run_id;
      drop = `/api/runs/${id}/execute`;
      await assert.rejects(api(drop, {})); assert.equal(report.transport.actualResponsesDropped, 1);
      assert.equal((await api(`/api/runs/${id}/execute`, {})).status, 202); assert.equal((await row(id)).workflow_run_id, owner);
      release(); return { ...await complete(id), realCompletedResponseLost: true };
    });
    await check("D05", "saved journal recovers a queued run after server process restart", async () => {
      hold = true; const id = await create(), owner = (await row(id)).workflow_run_id;
      await until(async () => held.size > 0, "queue_not_held");
      await stopApp(app, true); app = null; release();
      app = await startApp();
      // Reopening execution initializes the World and its documented active-run scan.
      assert.equal((await api(`/api/runs/${id}/execute`, {})).status, 202);
      const evidence = await complete(id); assert.equal(evidence.workflowRunId, owner);
      return { ...evidence, recoveryTrigger: "saved-run reopen initializes Local World", interruptedBody: false };
    });
    await check("D06", "queued stop and authored expired claim never execute personas", async () => {
      hold = true; const stopped = await create();
      assert.equal((await api(`/api/runs/${stopped}/stop`, {})).status, 200);
      const expired = await create(), state = await row(expired), controls = state.disagreement_summary.executionControls;
      const past = Date.now() - controls.runTimeoutMs - 2000;
      controls.claim = { id: randomUUID(), startedAt: new Date(past).toISOString(), deadlineAt: new Date(past + controls.runTimeoutMs).toISOString() };
      await query("update simulation_runs set status='running', disagreement_summary=$2 where id=$1 and status='queued'", [expired, { ...state.disagreement_summary, executionControls: controls }]);
      assert.equal((await api(`/api/workflow/status/${expired}`)).body.status, "failed");
      assert.equal((await row(expired)).error_message, "claim_expired");
      release(); await sleep(1500);
      for (const id of [stopped, expired]) { assert.equal((await row(id)).status, "failed"); assert.equal((await row(id)).disagreement_summary.executionControls.attempts.length, 0); }
      assert.equal((await row(stopped)).error_message, "operator_stop");
      return { stopped, expired, personaAttempts: 0, expiry: "authored expired SQL claim, not a paid crash" };
    });
    browserServer = await chromium.launchServer({ headless: true, args: [`--ignore-certificate-errors-spki-list=${spki}`] });
    browser = await chromium.connect(browserServer.wsEndpoint());
    for (const [id, width, touch] of [["D07", 1280, false], ["D08", 390, true]]) {
      await check(id, `${touch ? "narrow touch" : "desktop"} monitor retries an uncertain actual response`, async () => {
        hold = true; const runId = await create(), owner = (await row(runId)).workflow_run_id;
        const context = await browser.newContext({ viewport: { width, height: 844 }, isMobile: touch, hasTouch: touch, serviceWorkers: "block" });
        const errors = [], external = [];
        try {
          await context.addCookies([{ name: "btl_operator", value: cookie.slice(cookie.indexOf("=") + 1), url: origin, httpOnly: true, secure: true, sameSite: "Strict" }]);
          await context.route("**/*", async route => { const target = new URL(route.request().url()); if (target.origin === origin) await route.continue(); else { external.push(target.origin); await route.abort(); } });
          const page = await context.newPage(); page.on("pageerror", error => errors.push(error.message));
          drop = `/api/runs/${runId}/execute`; const lostBefore = report.transport.actualResponsesDropped;
          await page.goto(`${origin}/runs/${runId}`);
          const retry = page.getByRole("button", { name: "Retry this saved execution request", exact: true });
          await retry.waitFor({ state: "visible", timeout: 25_000 });
          assert.equal(report.transport.actualResponsesDropped, lostBefore + 1);
          assert.ok(await page.getByRole("region", { name: "Run progress and controls", exact: true }).textContent().then(text => text.includes("response is unavailable")));
          const request = page.waitForResponse(response => response.url() === origin + `/api/runs/${runId}/execute` && response.request().method() === "POST");
          if (touch) await retry.tap(); else await retry.click(); assert.equal((await request).status(), 202);
          assert.equal((await row(runId)).workflow_run_id, owner);
          release(); const evidence = await complete(runId);
          await until(async () => (await page.getByRole("region", { name: "Run progress and controls", exact: true }).textContent()).includes("Run finished"), "monitor_did_not_refresh");
          await page.reload(); assert.ok((await page.getByRole("region", { name: "Run progress and controls", exact: true }).textContent()).includes("Run finished"));
          assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)); assert.deepEqual(errors, []); assert.deepEqual(external, []);
          return { ...evidence, viewport: { width, height: 844 }, touchEmulated: touch, pageErrors: errors.length, externalRequests: external.length };
        } finally { await context.close(); }
      });
    }
    assert.equal(report.checks.length, 8); assert.ok(report.transport.queueDelivered > 0);
    const journalFiles = fs.readdirSync(env.WORKFLOW_LOCAL_DATA_DIR, { recursive: true }).filter(name => String(name).endsWith(".json"));
    assert.ok(journalFiles.length > 0); report.localJournal = { jsonFiles: journalFiles.length, privatePayloadsRetained: false };
    report.ownSimulationRuns = ownRuns.size;
  } finally {
    release();
    if (browser) await browser.close();
    if (browserServer) {
      const process = browserServer.process(); await browserServer.close();
      assert.ok(process.exitCode !== null || process.signalCode !== null, "owned Chromium did not exit");
      report.cleanup.ownedChromiumReaped = true;
    }
    for (const upstream of upstreams) upstream.destroy(); for (const socket of sockets) socket.destroy();
    await new Promise(resolve => server.close(resolve));
    if (app) await stopApp(app, false);
    await pool.end();
  }
}
