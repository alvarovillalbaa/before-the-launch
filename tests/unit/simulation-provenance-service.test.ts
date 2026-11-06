import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";

const harness = vi.hoisted(() => ({ database: null as unknown, generateText: vi.fn(), outboundFetches: [] as string[] }));
vi.mock("@/lib/server/db/client", () => ({ getDb: () => harness.database }));
vi.mock("@/lib/server/config/env", () => ({
  getServerEnv: () => ({ AI_GATEWAY_MODEL: "authored-provenance-model" }),
  hasAiGatewayCredentials: () => false,
}));
vi.mock("@/lib/server/services/simulation-gateway", async importOriginal => {
  const actual = await importOriginal<typeof import("@/lib/server/services/simulation-gateway")>();
  return { ...actual, executeGatewayAttempt: async (input: Parameters<typeof actual.executeGatewayAttempt>[0]) => {
    let response;
    try { response = await harness.generateText({ model: input.policy.modelId, prompt: input.prompt }); }
    catch { throw new actual.SimulationGatewayError("gateway_call_failed"); }
    const observation = { version: 1 as const, status: "reported" as const, reportedUsd: "0.000001", costNanoUsd: 1000,
      generationId: "gen_authored_provenance", source: "gateway-metadata" as const, inputTokens: 10, outputTokens: 20, providerName: "authored" };
    await input.onObservation(observation);
    return { result: response.output, observation };
  } };
});
vi.mock("drizzle-orm", async (importOriginal) => ({
  ...await importOriginal<typeof import("drizzle-orm")>(),
  eq: (column: unknown, value: unknown) => ({ column, value }),
  and: (...all: unknown[]) => ({ all }),
  inArray: (column: unknown, values: unknown[]) => ({ column, values }),
}));

import { authenticateOperator, signPaidSimulationAdmission } from "@/lib/server/security/operator-auth";
import { admissionScope, type ExecutionRecord } from "@/lib/server/services/simulation-execution-store";
import { canonicalSimulationInput, createExecutionPolicy, createGatewayPricingSnapshot } from "@/lib/shared/simulation-controls";
import {
  agentFindings, agentRuns, agentTraceEvents, productProjects, recommendations,
  reports, scoreBreakdowns, simulationRuns,
} from "@/lib/server/db/schema";
import { getRunResults } from "@/lib/server/services/project-service";
import {
  buildFakeAgentResult, buildScoreBreakdown, executeSimulationRun,
  type BriefSnapshot, type PersonaSnapshot, type SourceSnapshot,
} from "@/lib/server/services/simulation-service";
import type { AgentResult } from "@/lib/shared/schemas";

type Row = Record<string, unknown> & { agentRunId?: unknown };
const runId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const projectId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const oldScoreId = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const oldReportId = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
const oldFindingId = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";
const targetMarket = "Independent bookshops";
const brief: BriefSnapshot = { productName: "Authored provenance launch", market: "", notes: "Clear source proof" };
const sources: SourceSnapshot[] = [{ id: "source_fixture", kind: "product", title: "Authored context",
  url: null, contentHash: "fixture_hash", extractedText: "A clear workflow with customer proof." }];
const personas: PersonaSnapshot[] = [
  { id: "10000000-0000-4000-8000-000000000001", name: "Authored Gateway buyer", role: "Economic evaluator",
    description: "Considers switching effort.", evaluationLens: "Is the evidence concrete?" },
  { id: "10000000-0000-4000-8000-000000000002", name: "Authored fallback buyer", role: "Risk evaluator",
    description: "Considers implementation uncertainty.", evaluationLens: "Which claims need proof?" },
];

function fixture(engine: "gateway" | "fake", count = 1, beforeFirstUpdate?: () => void) {
  const selectedPersonas = structuredClone(personas.slice(0, count));
  const policy = createExecutionPolicy({ engine, depth: "standard", modelId: engine === "gateway" ? "authored-provenance-model" : null, budgetLimitCents: engine === "gateway" ? 100 : 0 });
  const requestId = "99999999-9999-4999-8999-999999999999";
  const controls: ExecutionRecord = { ...policy, requestId, targetMarket, personaIds: selectedPersonas.map(p => p.id),
    inputFingerprint: createHash("sha256").update(canonicalSimulationInput({ projectId, requestId, engine, targetMarket,
      personaIds: selectedPersonas.map(p => p.id), agentCount: count, depth: "standard", budgetLimitCents: policy.budgetLimitCents })).digest("hex"),
    pricing: engine === "gateway" ? createGatewayPricingSnapshot({ modelId: policy.modelId!, observedAt: "2026-11-05T00:00:00.000Z",
      pricing: { input: "0.000001", output: "0.000001" } }) : null,
    admissionGrant: null, claim: null, attempts: [], stopRequestedAt: null, stopReason: null };
  if (engine === "gateway") controls.admissionGrant = signPaidSimulationAdmission(admissionScope(runId, controls), authenticateOperator("authored-provenance-operator-key-for-fixtures-only")!.identity);
  const run = { id: runId, projectId, engine, targetMarket, status: "queued",
    depth: policy.depth, budgetLimitCents: policy.budgetLimitCents, agentCount: count, personaSnapshot: selectedPersonas,
    briefSnapshot: structuredClone(brief), sourceSnapshot: structuredClone(sources),
    disagreementSummary: { executionControls: controls } as Record<string, unknown> | null };
  const tables = new Map<unknown, Row[]>([
    [simulationRuns, [run]], [productProjects, [{ id: projectId, name: "Authored project" }]],
    [agentRuns, personas.slice(0, count).map((persona, index) => ({
      id: `20000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
      simulationRunId: runId, personaId: persona.id, personaSnapshot: structuredClone(persona), status: "queued",
    }))],
  ]);
  const rows = (table: unknown) => tables.get(table) ?? [];
  let firstUpdate = true;
  function matches(table: unknown, row: Row, condition: unknown): boolean {
    const value = condition as { all?: unknown[]; column?: unknown; value?: unknown; values?: unknown[] };
    if (value.all) return value.all.every(part => matches(table, row, part));
    const field = Object.entries(table as Record<string, unknown>).find(([, column]) => column === value.column)?.[0];
    if (!field) throw new Error("Unexpected authored predicate");
    return value.values ? value.values.includes(row[field]) : row[field] === value.value;
  }
  type Query = Promise<Row[]> & { where: (condition: unknown) => Query; limit: (n: number) => Query; orderBy: (...args: unknown[]) => Query; for: (mode: string) => Query };
  function query(table: unknown, condition?: unknown, limit = Infinity): Query {
    return Object.assign(Promise.resolve().then(() => structuredClone(rows(table).filter(row => condition === undefined || matches(table, row, condition)).slice(0, limit))), {
      where: (next: unknown) => query(table, next, limit), limit: (n: number) => query(table, condition, n),
      orderBy: (..._args: unknown[]) => query(table, condition, limit), for: (_mode: string) => query(table, condition, limit),
    });
  }
  function operation(effect: () => Row[]) {
    let result: Row[] | null = null;
    const apply = () => result ??= effect();
    return Object.assign(Promise.resolve().then(apply), { returning: async () => structuredClone(apply()) });
  }
  let tail = Promise.resolve();
  const database = {
    select: () => ({ from: (table: unknown) => query(table) }),
    update: (table: unknown) => ({ set: (patch: Row) => ({ where: (condition: unknown) => operation(() => {
      if (firstUpdate) { firstUpdate = false; beforeFirstUpdate?.(); }
      const selected = rows(table).filter(row => matches(table, row, condition));
      for (const row of selected) Object.assign(row, structuredClone(patch));
      return selected;
    }) }) }),
    insert: (table: unknown) => ({ values: (value: Row | Row[]) => operation(() => {
      const added = structuredClone(Array.isArray(value) ? value : [value]); tables.set(table, [...rows(table), ...added]); return added;
    }) }),
    transaction: async (callback: (tx: unknown) => Promise<unknown>) => {
      const previous = tail; let release = () => {}; tail = new Promise<void>(resolve => { release = resolve; }); await previous;
      const backup = new Map([...tables].map(([table, value]) => [table, structuredClone(value)]));
      try { return await callback(database); } catch (error) { tables.clear(); for (const [table, value] of backup) tables.set(table, value); throw error; }
      finally { release(); }
    },
  };
  harness.database = database;
  return { run, rows, replace: (table: unknown, value: Row[]) => tables.set(table, value) };
}

function assertFindingStamp(selected: ReturnType<typeof fixture>, expectedOrigin: string) {
  const saved = selected.rows(agentFindings)[0]!;
  const judgment = selected.rows(agentTraceEvents).find((event) => event.eventType === "judgment")!;
  expect(saved.id).toEqual(expect.stringMatching(/^[0-9a-f-]{36}$/));
  expect(judgment.metadata).toMatchObject({ scores: saved.result, executionOrigin: {
    version: 1, findingId: saved.id, origin: expectedOrigin, configuredEngine: selected.run.engine,
  } });
  return saved;
}
function assertBoundOutputs(selected: ReturnType<typeof fixture>) {
  const record = selected.run.disagreementSummary?.executionProvenance as Row;
  expect(record).toMatchObject({ version: 1, configuredEngine: selected.run.engine,
    scoreId: selected.rows(scoreBreakdowns)[0]?.id, reportId: selected.rows(reports)[0]?.id });
  expect(record.findingIds).toEqual(expect.arrayContaining(selected.rows(agentFindings).map((row) => row.id)));
  expect(record.findingIds).toHaveLength(selected.rows(agentFindings).length);
  expect(selected.rows(scoreBreakdowns)[0]?.scores)
    .toEqual(buildScoreBreakdown(selected.rows(agentFindings).map((row) => row.result as AgentResult)));
  return record;
}

beforeEach(() => {
  harness.database = null;
  harness.generateText.mockReset();
  harness.outboundFetches = [];
  vi.stubEnv("OPERATOR_ACCESS_KEY", "authored-provenance-operator-key-for-fixtures-only");
  vi.stubGlobal("fetch", async () => {
    harness.outboundFetches.push("fetch");
    throw new Error("Authored provenance fixture blocked an unexpected fetch.");
  });
});
afterEach(() => {
  try {
    expect(harness.outboundFetches, "Service fixtures must not attempt outbound fetch.").toEqual([]);
  } finally {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  }
});

it("simulation provenance service: fake execution binds synthetic findings and report outputs without altering deterministic results", async () => {
  const selected = fixture("fake");
  await executeSimulationRun(runId);
  expect(harness.generateText).not.toHaveBeenCalled();
  const saved = assertFindingStamp(selected, "fake");
  expect(saved.result).toEqual(buildFakeAgentResult(brief, sources, personas[0]!, { targetMarket }));
  assertBoundOutputs(selected);
  const read = await getRunResults(runId);
  expect(read?.provenance).toMatchObject({ kind: "synthetic", outputLineage: "matched", counts: { fake: 1, gateway: 0, fallback: 0 } });
  expect(read?.agents[0]?.provenance.origin).toBe("fake");
  expect(selected.rows(reports)[0]?.body).toContain("Synthetic demo simulation results");
  expect(selected.rows(reports)[0]?.body).toContain(`Target market (operator-selected run configuration): ${JSON.stringify(targetMarket)}`);
  expect(selected.run.briefSnapshot).toEqual(brief);
  expect(selected.run.sourceSnapshot).toEqual(sources);
});

it("simulation provenance service: successful mocked Gateway output is bound to its saved finding and aggregate outputs", async () => {
  const selected = fixture("gateway");
  const output = { ...buildFakeAgentResult(brief, sources, personas[0]!, { targetMarket }), recommendation: "Authored Gateway judgment" };
  harness.generateText.mockResolvedValue({ output });
  await executeSimulationRun(runId);
  expect(harness.generateText).toHaveBeenCalledTimes(1);
  const saved = assertFindingStamp(selected, "gateway");
  expect(saved.result).toEqual(output);
  expect(selected.rows(agentTraceEvents).some((event) => event.eventType === "fallback")).toBe(false);
  assertBoundOutputs(selected);
  const read = await getRunResults(runId);
  expect(read?.provenance).toMatchObject({ kind: "gateway", outputLineage: "matched", counts: { gateway: 1, fake: 0, fallback: 0 } });
  expect(read?.agents[0]?.provenance.origin).toBe("gateway");
  expect(selected.rows(reports)[0]?.body).toContain("AI Gateway simulation results");
  expect(selected.rows(reports)[0]?.body).toContain("not observed customer responses");
});

it("simulation provenance service: Gateway failure keeps fallback behavior while qualifying the exact synthetic finding and report", async () => {
  const selected = fixture("gateway");
  harness.generateText.mockRejectedValue(new Error("Authored provider failure"));
  await executeSimulationRun(runId);
  expect(harness.generateText).toHaveBeenCalledTimes(1);
  const saved = assertFindingStamp(selected, "gateway-fallback");
  expect(saved.result).toEqual(buildFakeAgentResult(brief, sources, personas[0]!, { targetMarket }));
  expect(selected.rows(agentTraceEvents).find((event) => event.eventType === "fallback")).toMatchObject({ metadata: { fallback: true } });
  assertBoundOutputs(selected);
  const read = await getRunResults(runId);
  expect(read?.provenance).toMatchObject({ kind: "synthetic", outputLineage: "matched", counts: { gateway: 0, fallback: 1 } });
  expect(read?.agents[0]?.provenance.origin).toBe("gateway-fallback");
  expect(selected.rows(reports)[0]?.body).toContain("Synthetic fallback findings: 1");
});

it("simulation provenance service: mixed success and fallback persist separate origins with one correctly bound report composition", async () => {
  const selected = fixture("gateway", 2);
  const output = { ...buildFakeAgentResult(brief, sources, personas[0]!, { targetMarket }), recommendation: "Authored Gateway judgment" };
  harness.generateText.mockImplementation(({ prompt }: { prompt: string }) => prompt.includes(personas[0]!.name)
    ? Promise.resolve({ output }) : Promise.reject(new Error("Authored second-persona failure")));
  await executeSimulationRun(runId);
  const diagnostic = {
    agents: selected.rows(agentRuns).slice(0, 2).map((row) => {
      const persona = row.personaSnapshot as PersonaSnapshot;
      return { id: String(row.id).slice(0, 80), status: String(row.status).slice(0, 40),
        personaId: String(persona.id).slice(0, 80), personaName: String(persona.name).slice(0, 120) };
    }),
    fallbacks: selected.rows(agentTraceEvents).filter((row) => row.eventType === "fallback").slice(0, 2)
      .map((row) => ({ agentRunId: String(row.agentRunId).slice(0, 80), body: String(row.body).slice(0, 500) })),
    promptPersonas: harness.generateText.mock.calls.slice(0, 2).map(([request]) => {
      const prompt = (request as { prompt?: unknown } | undefined)?.prompt;
      return personas.filter((persona) => typeof prompt === "string" && prompt.includes(persona.name)).map((persona) => persona.id);
    }),
  };
  expect(harness.generateText, JSON.stringify(diagnostic)).toHaveBeenCalledTimes(2);
  expect(selected.rows(agentFindings)).toHaveLength(2);
  const boundIds = selected.rows(agentFindings).map((row) => row.id);
  expect(new Set(boundIds).size).toBe(2);
  for (const saved of selected.rows(agentFindings)) {
    const judgment = selected.rows(agentTraceEvents).find((event) => event.eventType === "judgment" && event.agentRunId === saved.agentRunId)!;
    expect(judgment.metadata).toMatchObject({ scores: saved.result, executionOrigin: { version: 1, findingId: saved.id } });
  }
  assertBoundOutputs(selected);
  const read = await getRunResults(runId);
  expect(read?.provenance).toMatchObject({ kind: "mixed", outputLineage: "matched", counts: { gateway: 1, fake: 0, fallback: 1, unknown: 0, pending: 0 } });
  expect(read?.agents.map((entry) => entry.provenance.origin).sort()).toEqual(["gateway", "gateway-fallback"]);
  const body = selected.rows(reports)[0]?.body;
  expect(body).toContain("Mixed Gateway and synthetic simulation results");
  expect(body).toContain("AI Gateway findings: 1");
  expect(body).toContain("Synthetic fallback findings: 1");
  expect(body).toContain("not observed customer reactions");
});

it("simulation provenance service: historical Gateway flags and unbound fallback traces remain unknown without rewriting saved numerical outputs", async () => {
  const selected = fixture("gateway");
  const agentId = selected.rows(agentRuns)[0]!.id;
  const output = buildFakeAgentResult(brief, sources, personas[0]!, { targetMarket });
  const score = { id: oldScoreId, simulationRunId: runId, scores: buildScoreBreakdown([output]), globalScore: "61.25" };
  const report = { id: oldReportId, simulationRunId: runId, body: "Authored historical report retained verbatim" };
  selected.replace(agentFindings, [{ id: oldFindingId, agentRunId: agentId, result: output }]);
  selected.replace(agentTraceEvents, [{ agentRunId: agentId, eventType: "fallback", metadata: { fallback: true } }]);
  selected.replace(scoreBreakdowns, [score]); selected.replace(reports, [report]);
  selected.replace(recommendations, [{ simulationRunId: runId, title: "Authored historical recommendation", payload: { priority: "high" } }]);
  const before = JSON.stringify({ score, report, output });
  const read = await getRunResults(runId);
  expect(harness.generateText).not.toHaveBeenCalled();
  expect(read?.provenance).toMatchObject({ kind: "unknown", outputLineage: "unverified", counts: { gateway: 0, unknown: 1 } });
  expect(read?.agents[0]?.provenance.origin).toBe("unknown");
  expect(read?.agents[0]?.provenance.qualification).toMatch(/fallback/i);
  expect(read?.score).toEqual(score); expect(read?.report).toEqual(report);
  expect(read?.agents[0]?.finding?.result).toEqual(output);
  expect(JSON.stringify({ score, report, output })).toBe(before);
});

it("simulation provenance service: an older selected score or report cannot borrow a newer attempt aggregate attribution", async () => {
  for (const mismatchedTable of [scoreBreakdowns, reports]) {
    const selected = fixture("gateway");
    harness.generateText.mockResolvedValue({ output: buildFakeAgentResult(brief, sources, personas[0]!, { targetMarket }) });
    await executeSimulationRun(runId);
    const row = selected.rows(mismatchedTable)[0]!;
    selected.replace(mismatchedTable, [{ ...row, id: mismatchedTable === scoreBreakdowns ? oldScoreId : oldReportId }]);
    const read = await getRunResults(runId);
    expect(read?.agents[0]?.provenance.origin).toBe("gateway");
    expect(read?.provenance).toMatchObject({ kind: "unknown", outputLineage: "unverified", counts: { gateway: 1 } });
  }
});

it("simulation provenance service: first selected historical findings cannot inherit current report lineage despite valid per-finding stamps", async () => {
  const selected = fixture("gateway");
  const output = buildFakeAgentResult(brief, sources, personas[0]!, { targetMarket });
  harness.generateText.mockResolvedValue({ output });
  await executeSimulationRun(runId);
  const latest = selected.rows(agentFindings)[0]!;
  const older = { ...latest, id: oldFindingId, result: { ...output, confidence: 31 } };
  selected.replace(agentFindings, [older, latest]);
  selected.replace(agentTraceEvents, [...selected.rows(agentTraceEvents), {
    agentRunId: older.agentRunId, eventType: "judgment", metadata: { executionOrigin: {
      version: 1, findingId: oldFindingId, configuredEngine: "gateway", origin: "gateway",
    } },
  }]);
  const read = await getRunResults(runId);
  expect(read?.agents[0]?.finding?.id).toBe(oldFindingId);
  expect(read?.agents[0]?.finding?.result.confidence).toBe(31);
  expect(read?.agents[0]?.provenance.origin).toBe("gateway");
  expect(read?.provenance).toMatchObject({ kind: "unknown", outputLineage: "unverified", counts: { gateway: 1 } });
});

it("simulation provenance service: unfinished agents stay pending and absent runs stay absent", async () => {
  const selected = fixture("gateway");
  const read = await getRunResults(runId);
  expect(read?.agents[0]?.finding).toBeNull();
  expect(read?.agents[0]?.provenance.origin).toBe("pending");
  expect(read?.provenance).toMatchObject({ kind: "pending", outputLineage: "unverified", counts: { pending: 1, gateway: 0 } });
  selected.replace(simulationRuns, []);
  expect(await getRunResults(runId)).toBeNull();
  expect(harness.generateText).not.toHaveBeenCalled();
});

it("simulation provenance service: asynchronous changes to the loaded engine cannot relabel an already captured execution attempt", async () => {
  const selected = fixture("gateway", 1, () => { selected.run.engine = "fake"; });
  const output = buildFakeAgentResult(brief, sources, personas[0]!, { targetMarket });
  harness.generateText.mockResolvedValue({ output });
  await executeSimulationRun(runId);
  expect(harness.generateText).toHaveBeenCalledTimes(1);
  const saved = selected.rows(agentFindings)[0]!;
  expect(selected.rows(agentTraceEvents).find((event) => event.eventType === "judgment")?.metadata)
    .toMatchObject({ executionOrigin: { version: 1, findingId: saved.id, origin: "gateway", configuredEngine: "gateway" } });
  expect(selected.run.disagreementSummary?.executionProvenance).toMatchObject({ configuredEngine: "gateway" });
  expect(selected.rows(reports)[0]?.body).toContain('Configured engine: "gateway"');
  expect(selected.run.engine).toBe("fake");
});
