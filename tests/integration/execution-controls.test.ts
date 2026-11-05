import { afterAll, afterEach, beforeAll, beforeEach, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { eq } from "drizzle-orm";

const provider = vi.hoisted(() => ({ execute: vi.fn(), pricing: vi.fn(), fetches: 0 }));
vi.mock("@/lib/server/services/simulation-gateway", async importOriginal => ({
  ...await importOriginal<typeof import("@/lib/server/services/simulation-gateway")>(),
  loadGatewayPricing: (...args: unknown[]) => provider.pricing(...args),
  executeGatewayAttempt: (...args: unknown[]) => provider.execute(...args),
}));
import { closeDb, getDb } from "@/lib/server/db/client";
import { agentFindings, agentRuns, productBriefs, productProjects, personas, reports, scoreBreakdowns, simulationRuns, workspaces } from "@/lib/server/db/schema";
import { authenticateOperator } from "@/lib/server/security/operator-auth";
import { createSimulationRun, executeSimulationRun, requestStopSimulationRun, reconcileExpiredSimulationRun, buildFakeAgentResult, deleteRun } from "@/lib/server/services/simulation-service";
import { readExecutionRecord, type ExecutionRecord } from "@/lib/server/services/simulation-execution-store";
import { getRunResults, toPublicSimulationRun } from "@/lib/server/services/project-service";
import { SimulationGatewayError, type executeGatewayAttempt } from "@/lib/server/services/simulation-gateway";
import { createGatewayPricingSnapshot, type GatewayCostObservation } from "@/lib/shared/simulation-controls";
import type { SimulationSetupInput } from "@/lib/shared/schemas";

const marker = "before-launch-execution-controls-v2";
const operatorKey = "authored-execution-controls-operator-key-0001";
const owned: { id: string; name: string }[] = [];
const faults: string[] = [];
let guardPool: Pool;
type LeafInput = Parameters<typeof executeGatewayAttempt>[0];
const known = (usd = "0.0001", nano = 100_000): GatewayCostObservation => ({ version: 1, status: "reported",
  reportedUsd: usd, costNanoUsd: nano, generationId: "authored-generation", source: "gateway-metadata",
  inputTokens: 12, outputTokens: 8, providerName: "authored-port" });
const unknown: GatewayCostObservation = { version: 1, status: "unknown", reportedUsd: null, costNanoUsd: null,
  generationId: null, source: null, inputTokens: null, outputTokens: null, providerName: null };
function result(input: LeafInput) {
  return buildFakeAgentResult({ productName: "Authored execution launch" }, [], {
    id: "10000000-0000-4000-8000-000000000001", name: "Authored result", role: "Buyer", description: "Fixture", evaluationLens: "Proof",
  }, { targetMarket: input.prompt.includes("Bookshops") ? "Bookshops" : "Authored audience" });
}
function actor() { return authenticateOperator(operatorKey)!.identity; }
async function fixture(count = 2) {
  const db = getDb(), workspace = { id: randomUUID(), name: marker + ":" + randomUUID() };
  owned.push(workspace);
  await db.insert(workspaces).values({ ...workspace, slug: workspace.id });
  const [project] = await db.insert(productProjects).values({ workspaceId: workspace.id, name: "Authored execution fixture" }).returning();
  await db.insert(productBriefs).values({ projectId: project.id, productName: "Authored execution launch", category: "Tools",
    icp: "Bookshops", market: "Authored audience", expectedPrice: "$10", launchChannel: "Authored", positioningStatement: "Fixture proof" });
  const cohort = await db.insert(personas).values(Array.from({ length: count }, (_, index) => ({ workspaceId: workspace.id,
    name: "Authored persona " + index, role: "Buyer", description: "Disposable fixture", evaluationLens: "Evidence" }))).returning();
  const input: SimulationSetupInput = { projectId: project.id, requestId: randomUUID(), engine: "gateway", targetMarket: "Bookshops",
    personaIds: cohort.map(p => p.id), agentCount: count, depth: "standard", budgetLimitCents: 100 };
  return { workspace, project, cohort, input };
}
async function rawRun(id: string) { return (await getDb().select().from(simulationRuns).where(eq(simulationRuns.id, id)))[0]!; }
async function controls(id: string, change: (record: ExecutionRecord) => void) {
  const row = await rawRun(id), record = readExecutionRecord(row)!;
  change(record);
  await getDb().update(simulationRuns).set({ disagreementSummary: { ...row.disagreementSummary, executionControls: record } }).where(eq(simulationRuns.id, id));
}
async function faultOn(table: "agent_runs" | "reports" | "simulation_runs", projectId: string) {
  const name = "execution_fault_" + randomUUID().replaceAll("-", "");
  faults.push(name);
  const condition = table === "simulation_runs"
    ? `NEW.project_id = '${projectId}' AND EXISTS (SELECT 1 FROM jsonb_array_elements(NEW.disagreement_summary->'executionControls'->'attempts') AS attempt WHERE attempt->'observation' <> 'null'::jsonb)`
    : `EXISTS (SELECT 1 FROM simulation_runs WHERE id = NEW.simulation_run_id AND project_id = '${projectId}')`;
  await guardPool.query(`CREATE FUNCTION ${name}() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
    IF ${condition} THEN
      RAISE EXCEPTION 'authored execution fixture fault'; END IF; RETURN NEW; END $$`);
  await guardPool.query(`CREATE TRIGGER ${name} BEFORE ${table === "simulation_runs" ? "UPDATE" : "INSERT"} ON ${table} FOR EACH ROW EXECUTE FUNCTION ${name}()`);
}
async function clearFaults() {
  for (const name of faults.splice(0)) {
    await guardPool.query(`DROP TRIGGER IF EXISTS ${name} ON agent_runs`);
    await guardPool.query(`DROP TRIGGER IF EXISTS ${name} ON reports`);
    await guardPool.query(`DROP TRIGGER IF EXISTS ${name} ON simulation_runs`);
    await guardPool.query(`DROP FUNCTION IF EXISTS ${name}()`);
  }
}
beforeAll(async () => {
  const text = process.env.EXECUTION_CONTROLS_TEST_DATABASE_URL;
  if (!text || process.env.CI !== "true" || text !== "postgres://execution_ci:disposable_ci_only@127.0.0.1:54329/before_launch_execution_ci"
    || process.env.DATABASE_URL !== text || process.env.EXECUTION_CONTROLS_TEST_TARGET !== "local-disposable") throw new Error("execution_test_target_required");
  const url = new URL(text);
  if (!["postgres:", "postgresql:"].includes(url.protocol) || !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
    || url.pathname !== "/before_launch_execution_ci" || url.search || url.hash) throw new Error("execution_test_target_invalid");
  guardPool = new Pool({ connectionString: text, max: 2, connectionTimeoutMillis: 5_000, statement_timeout: 5_000 });
  const { rows } = await guardPool.query("SELECT datname AS name, shobj_description(oid,'pg_database') AS marker FROM pg_database WHERE datname=current_database()");
  if (rows.length !== 1 || rows[0].name !== "before_launch_execution_ci" || rows[0].marker !== marker) throw new Error("execution_test_marker_invalid");
  vi.stubEnv("OPERATOR_ACCESS_KEY", operatorKey); vi.stubEnv("AI_GATEWAY_API_KEY", "authored-not-a-provider-key");
  vi.stubEnv("AI_GATEWAY_MODEL", "authored/execution-model");
});
beforeEach(() => {
  provider.execute.mockReset(); provider.pricing.mockReset(); provider.fetches = 0;
  vi.stubGlobal("fetch", async () => { provider.fetches++; throw new Error("execution_fixture_fetch_denied"); });
  provider.pricing.mockImplementation(async (modelId: string) => createGatewayPricingSnapshot({ modelId,
    observedAt: new Date().toISOString(), pricing: { input: "0.000001", output: "0.000002" } }));
  provider.execute.mockImplementation(async (input: LeafInput) => { await input.onObservation(known()); return { result: result(input), observation: known() }; });
});
afterEach(async () => {
  try {
    await clearFaults();
    for (const workspace of owned.splice(0)) {
      const [current] = await getDb().select().from(workspaces).where(eq(workspaces.id, workspace.id));
      if (!current || current.name !== workspace.name || !current.name.startsWith(marker + ":")) throw new Error("execution_fixture_cleanup_owner_mismatch");
      await getDb().delete(workspaces).where(eq(workspaces.id, workspace.id));
    }
    expect(provider.fetches).toBe(0);
  } finally { vi.unstubAllGlobals(); }
});
afterAll(async () => { await closeDb(); await guardPool?.end(); vi.unstubAllEnvs(); });

it("execution controls PG: concurrent request UUID creation returns one queued full cohort and rejects changed intent", async () => {
  const f = await fixture();
  const [a, b] = await Promise.all([createSimulationRun(f.input, actor()), createSimulationRun(f.input, actor())]);
  expect(a.id).toBe(b.id); expect(a.status).toBe("queued"); expect(provider.execute).not.toHaveBeenCalled();
  expect(await getDb().select().from(agentRuns).where(eq(agentRuns.simulationRunId, a.id))).toHaveLength(2);
  await expect(createSimulationRun({ ...f.input, depth: "deep" }, actor())).rejects.toMatchObject({ code: "request_conflict", status: 409 });
});
it("execution controls PG: cohort insert failure rolls back the run and permits the same request UUID after repair", async () => {
  const f = await fixture(); await faultOn("agent_runs", f.project.id);
  await expect(createSimulationRun(f.input, actor())).rejects.toThrow();
  expect(await getDb().select().from(simulationRuns).where(eq(simulationRuns.projectId, f.project.id))).toHaveLength(0);
  await clearFaults(); expect((await createSimulationRun(f.input, actor())).status).toBe("queued");
});
it("execution controls PG: concurrent runners claim once and execute sequentially without terminal replay", async () => {
  const f = await fixture(), run = await createSimulationRun(f.input, actor());
  let active = 0, peak = 0;
  provider.execute.mockImplementation(async (input: LeafInput) => { active++; peak = Math.max(peak, active);
    await new Promise(resolve => setTimeout(resolve, 15)); await input.onObservation(known()); active--; return { result: result(input), observation: known() }; });
  await Promise.all([executeSimulationRun(run.id), executeSimulationRun(run.id)]);
  expect(provider.execute).toHaveBeenCalledTimes(2); expect(peak).toBe(1); expect((await rawRun(run.id)).status).toBe("completed");
  await executeSimulationRun(run.id); expect(provider.execute).toHaveBeenCalledTimes(2);
  expect(await getDb().select().from(reports).where(eq(reports.simulationRunId, run.id))).toHaveLength(1);
});
it("execution controls PG: unbranded creation and tampered or expired durable admission cannot dispatch", async () => {
  const f = await fixture(1);
  await expect(createSimulationRun(f.input, { sessionId: randomUUID(), expiresAt: Date.now() + 60_000 })).rejects.toMatchObject({ code: "operator_required" });
  const first = await createSimulationRun(f.input, actor());
  await controls(first.id, record => { record.admissionGrant!.signature = "A".repeat(43); });
  await executeSimulationRun(first.id); expect((await rawRun(first.id)).status).toBe("failed");
  const second = await createSimulationRun({ ...f.input, requestId: randomUUID() }, actor());
  await controls(second.id, record => { record.admissionGrant!.expiresAt = Date.now() - 1; });
  await executeSimulationRun(second.id); expect((await rawRun(second.id)).errorMessage).toBe("admission_invalid");
  expect(provider.execute).not.toHaveBeenCalled();
});
it("execution controls PG: free demo uses no pricing or provider and publishes no admission journal", async () => {
  const f = await fixture(), run = await createSimulationRun({ ...f.input, engine: "fake", budgetLimitCents: 0 });
  await executeSimulationRun(run.id);
  expect(provider.pricing).not.toHaveBeenCalled(); expect(provider.execute).not.toHaveBeenCalled();
  const detail = await getRunResults(run.id);
  expect(detail?.execution).toMatchObject({ budgetMode: "free-demo", reportedCostCents: 0, coverage: { scheduled: 2, completed: 2 } });
  expect(detail?.run.disagreementSummary).not.toHaveProperty("executionControls");
  expect(toPublicSimulationRun(await rawRun(run.id)).disagreementSummary).not.toHaveProperty("executionControls");
  expect(detail?.agents.every(a => a.agent.costCents === 0 && a.agent.tokenCount === null)).toBe(true);
});
it("execution controls PG: key rotation after one judgment prevents the next paid dispatch", async () => {
  const f = await fixture(), run = await createSimulationRun(f.input, actor());
  provider.execute.mockImplementation(async (input: LeafInput) => {
    await input.onObservation(known()); vi.stubEnv("OPERATOR_ACCESS_KEY", "authored-rotated-operator-key-0000000002");
    return { result: result(input), observation: known() };
  });
  try {
    await executeSimulationRun(run.id);
    expect(provider.execute).toHaveBeenCalledTimes(1);
    expect((await rawRun(run.id)).errorMessage).toBe("admission_invalid");
    expect((await rawRun(run.id)).status).toBe("partial");
  } finally { vi.stubEnv("OPERATOR_ACCESS_KEY", operatorKey); }
});
it("execution controls PG: active deletion is rejected until an explicit terminal stop preserves the ledger", async () => {
  const f = await fixture(1), run = await createSimulationRun(f.input, actor());
  await expect(deleteRun(run.id)).rejects.toMatchObject({ code: "active_run_cannot_be_deleted" });
  expect((await rawRun(run.id)).status).toBe("queued");
  await requestStopSimulationRun(run.id);
  expect(readExecutionRecord(await rawRun(run.id))?.stopReason).toBe("operator_stop");
  await deleteRun(run.id);
  expect(await getDb().select().from(simulationRuns).where(eq(simulationRuns.id, run.id))).toHaveLength(0);
  expect(provider.execute).not.toHaveBeenCalled();
});
it("execution controls PG: missing pricing and an unaffordable first reservation prevent paid dispatch", async () => {
  const f = await fixture(); provider.pricing.mockRejectedValueOnce(new Error("authored missing rates"));
  await expect(createSimulationRun(f.input, actor())).rejects.toMatchObject({ code: "gateway_pricing_unavailable", status: 503 });
  expect(await getDb().select().from(simulationRuns).where(eq(simulationRuns.projectId, f.project.id))).toHaveLength(0);
  const run = await createSimulationRun({ ...f.input, depth: "deep", budgetLimitCents: 1 }, actor());
  await executeSimulationRun(run.id); expect(provider.execute).not.toHaveBeenCalled();
  expect((await rawRun(run.id)).errorMessage).toBe("budget_target_reached");
});
it("execution controls PG: reported cost stops the next reservation and preserves full scheduled coverage", async () => {
  const f = await fixture(), run = await createSimulationRun(f.input, actor());
  provider.execute.mockImplementation(async (input: LeafInput) => { const observation = known("1", 1_000_000_000);
    await input.onObservation(observation); return { result: result(input), observation }; });
  await executeSimulationRun(run.id); expect(provider.execute).toHaveBeenCalledTimes(1);
  const detail = await getRunResults(run.id);
  expect(detail?.execution).toMatchObject({ reportedCostCents: 100, status: "partial", stopReason: "budget_target_reached",
    coverage: { scheduled: 2, completed: 1, failed: 0, pending: 1 } });
  expect(detail?.report?.body).toContain("1 personas have no finding");
});
it("execution controls PG: unknown charge retains its reservation and stops after the first valid judgment", async () => {
  const f = await fixture(), run = await createSimulationRun(f.input, actor());
  provider.execute.mockImplementation(async (input: LeafInput) => { await input.onObservation(unknown); return { result: result(input), observation: unknown }; });
  await executeSimulationRun(run.id); expect(provider.execute).toHaveBeenCalledTimes(1);
  const detail = await getRunResults(run.id);
  expect(detail?.execution).toMatchObject({ status: "partial", unknownCostAttempts: 1, reportedCostCents: 0, stopReason: "gateway_cost_unknown" });
  expect(detail!.execution.reservedCostCents).toBeGreaterThan(0); expect(detail?.agents[0]?.agent.costCents).toBeNull();
});
it("execution controls PG: a failed durable cost receipt stops without retrying it or inventing a fallback", async () => {
  const f = await fixture(), run = await createSimulationRun(f.input, actor());
  await faultOn("simulation_runs", f.project.id);
  let receipts = 0;
  provider.execute.mockImplementation(async (input: LeafInput) => {
    receipts++;
    try { await input.onObservation(known()); }
    catch { throw new SimulationGatewayError("gateway_observation_failed", known()); }
    throw new Error("Authored cost-write failure was not enforced");
  });
  await executeSimulationRun(run.id);
  expect(receipts).toBe(1); expect(provider.execute).toHaveBeenCalledTimes(1);
  const detail = await getRunResults(run.id);
  expect(detail?.execution).toMatchObject({ status: "failed", stopReason: "execution_failed", unknownCostAttempts: 1,
    coverage: { scheduled: 2, completed: 0, failed: 1, pending: 1, syntheticFallback: 0 } });
  expect(detail!.execution.reservedCostCents).toBeGreaterThan(0);
  expect(detail?.agents.every(a => !a.finding)).toBe(true);
});
it("execution controls PG: failed model output is explicitly synthetic fallback and never successful model coverage", async () => {
  const f = await fixture(), run = await createSimulationRun(f.input, actor());
  provider.execute.mockImplementation(async (input: LeafInput) => { await input.onObservation(unknown); throw new SimulationGatewayError("gateway_output_invalid", unknown); });
  await executeSimulationRun(run.id); expect(provider.execute).toHaveBeenCalledTimes(1);
  const detail = await getRunResults(run.id);
  expect(detail?.execution).toMatchObject({ status: "partial", coverage: { scheduled: 2, completed: 0, failed: 1, pending: 1, syntheticFallback: 1 } });
  expect(detail?.agents.find(a => a.finding)?.provenance.origin).toBe("gateway-fallback");
});
it("execution controls PG: an operator stop fences a late result while retaining the uncertain reservation", async () => {
  const f = await fixture(1), run = await createSimulationRun(f.input, actor());
  let release!: () => void, started!: () => void;
  const entered = new Promise<void>(resolve => { started = resolve; });
  const held = new Promise<void>(resolve => { release = resolve; });
  provider.execute.mockImplementation(async (input: LeafInput) => { started(); await held; await input.onObservation(unknown); return { result: result(input), observation: unknown }; });
  const running = executeSimulationRun(run.id); await entered;
  try { await requestStopSimulationRun(run.id); } finally { release(); }
  await running;
  const detail = await getRunResults(run.id);
  expect(detail?.execution).toMatchObject({ status: "failed", stopReason: "operator_stop", unknownCostAttempts: 1 });
  expect(detail?.agents[0]?.finding).toBeNull(); expect(detail!.execution.reservedCostCents).toBeGreaterThan(0);
});
it("execution controls PG: expired durable claims reconcile to a terminal result without redispatch", async () => {
  const f = await fixture(1), run = await createSimulationRun(f.input, actor());
  await controls(run.id, record => { const start = Date.now() - record.runTimeoutMs - 1_000;
    record.claim = { id: randomUUID(), startedAt: new Date(start).toISOString(), deadlineAt: new Date(start + record.runTimeoutMs).toISOString() }; });
  await getDb().update(simulationRuns).set({ status: "running" }).where(eq(simulationRuns.id, run.id));
  await reconcileExpiredSimulationRun(run.id); await executeSimulationRun(run.id);
  expect(provider.execute).not.toHaveBeenCalled(); expect((await rawRun(run.id)).errorMessage).toBe("claim_expired");
});
it("execution controls PG: aggregate write failure rolls back all aggregate rows and later reconciliation never reruns paid work", async () => {
  const f = await fixture(1), run = await createSimulationRun(f.input, actor()); await faultOn("reports", f.project.id);
  await expect(executeSimulationRun(run.id)).rejects.toThrow();
  expect(await getDb().select().from(scoreBreakdowns).where(eq(scoreBreakdowns.simulationRunId, run.id))).toHaveLength(0);
  expect(await getDb().select().from(reports).where(eq(reports.simulationRunId, run.id))).toHaveLength(0);
  expect((await rawRun(run.id)).status).toBe("running"); expect(provider.execute).toHaveBeenCalledTimes(1);
  await clearFaults(); await controls(run.id, record => { const start = Date.now() - record.runTimeoutMs - 1_000;
    record.claim!.startedAt = new Date(start).toISOString(); record.claim!.deadlineAt = new Date(start + record.runTimeoutMs).toISOString(); });
  await reconcileExpiredSimulationRun(run.id);
  expect(provider.execute).toHaveBeenCalledTimes(1); expect((await rawRun(run.id)).status).toBe("partial");
});
