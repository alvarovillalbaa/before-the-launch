import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { getServerEnv, hasAiGatewayCredentials } from "@/lib/server/config/env";
import { getDb } from "@/lib/server/db/client";
import {
  agentFindings,
  agentRuns,
  agentTraceEvents,
  personas,
  productBriefs,
  productProjects,
  recommendations,
  reports,
  scoreBreakdowns,
  simulationRuns,
  sources,
} from "@/lib/server/db/schema";
import {
  AgentResultSchema,
  RecommendationSchema,
  ScoreBreakdownSchema,
  type AgentResult,
  type Recommendation,
  type ScoreBreakdown,
  type SimulationSetupInput,
} from "@/lib/shared/schemas";
import {
  bindSimulationProvenanceToOutputs,
  deriveAgentProvenance,
  formatSimulationProvenanceMarkdown,
  summarizeSimulationProvenance,
  type GeneratedResultOrigin,
  type SimulationProvenance,
} from "@/lib/shared/simulation-provenance";
import { sha256 } from "./source-ingestion";
import { assertOperatorIdentity, signPaidSimulationAdmission, verifyPaidSimulationAdmission, type OperatorIdentity } from "@/lib/server/security/operator-auth";
import { canReserveBudget, canonicalSimulationInput, createExecutionPolicy, estimateGatewayReservation, nanoUsdToCents, type GatewayCostObservation } from "@/lib/shared/simulation-controls";
import { buildGatewayPrompt, executeGatewayAttempt, loadGatewayPricing, SimulationGatewayError } from "./simulation-gateway";
import { accounting, admissionScope, lockedRun, readExecutionRecord, SimulationControlError, writeControls, type ExecutionRecord, type RunRow } from "./simulation-execution-store";
export { SimulationControlError } from "./simulation-execution-store";

const requestCondition = (requestId: string) => sql`${simulationRuns.disagreementSummary}->'executionControls'->>'requestId' = ${requestId}`;
const requestLock = (requestId: string) => sql`select pg_advisory_xact_lock(hashtextextended(${"simulation-request:" + requestId}, 0))`;

export type BriefSnapshot = Record<string, unknown>;
export type SourceSnapshot = {
  id: string;
  kind: string;
  title: string;
  url: string | null;
  contentHash: string | null;
  extractedText: string;
};
export type PersonaSnapshot = {
  id: string;
  name: string;
  role: string;
  description: string;
  evaluationLens: string;
};
export type SimulationContext = Readonly<{
  targetMarket: string;
}>;

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function signalScore(text: string, positive: string[], negative: string[], base: number) {
  const haystack = text.toLowerCase();
  const positiveHits = positive.filter((word) => haystack.includes(word)).length;
  const negativeHits = negative.filter((word) => haystack.includes(word)).length;
  return clampScore(base + positiveHits * 6 - negativeHits * 7);
}

function pickEvidence(sourcesSnapshot: SourceSnapshot[], personaName: string) {
  const usable = sourcesSnapshot.filter((source) => source.extractedText);
  return usable.slice(0, 3).map((source) => ({
    sourceId: source.id,
    sourceTitle: source.title,
    quote: source.extractedText.slice(0, 260),
    relevance: `${personaName} used this source as market context, not as an instruction.`,
  }));
}

export function buildFakeAgentResult(
  brief: BriefSnapshot,
  sourcesSnapshot: SourceSnapshot[],
  persona: PersonaSnapshot,
  simulationContext: SimulationContext,
): AgentResult {
  const context = [
    brief.productName,
    brief.category,
    brief.icp,
    brief.market,
    brief.expectedPrice,
    brief.positioningStatement,
    brief.notes,
    sourcesSnapshot.map((source) => source.extractedText).join(" "),
  ].join(" ");
  const hash = sha256(JSON.stringify({
    personaName: persona.name,
    targetMarket: simulationContext.targetMarket,
    productContext: context,
  }));
  const jitter = Number.parseInt(hash.slice(0, 2), 16) % 13;
  const clarity = signalScore(context, ["clear", "simple", "specific", "proof"], ["confusing", "complex", "unclear"], 63 + jitter);
  const trust = signalScore(context, ["security", "privacy", "customer", "case study", "compliance"], ["beta", "unknown", "unproven"], 58 + jitter);
  const differentiation = signalScore(context, ["different", "unique", "faster", "workflow", "automate"], ["similar", "generic", "platform"], 60 + jitter);
  const urgency = signalScore(context, ["urgent", "launch", "deadline", "risk", "revenue"], ["nice to have", "optional"], 55 + jitter);
  const priceSensitivity = clampScore(72 - Math.floor((clarity + trust) / 6) + (persona.name.includes("Budget") ? 15 : 0));
  const adoption = clampScore((clarity + urgency + trust) / 3 - priceSensitivity / 8);

  return AgentResultSchema.parse({
    perceivedValueScore: clampScore((clarity + differentiation + urgency) / 3),
    clarityScore: clarity,
    differentiationScore: differentiation,
    urgencyScore: urgency,
    trustScore: trust,
    adoptionLikelihood: adoption,
    priceSensitivity,
    likelyObjections: [
      "The proof is not yet concrete enough for a confident launch decision.",
      "The buyer may need clearer comparison against existing alternatives.",
      persona.name.includes("Security")
        ? "Security, privacy, and data-retention claims need stronger evidence."
        : "The implementation effort and switching path need more detail.",
    ],
    likelyPositiveComments: [
      "The product problem is understandable from the launch context.",
      "The positioning has a practical pre-launch decision-making angle.",
      "The persona can identify at least one plausible adoption trigger.",
    ],
    confusingClaims:
      clarity < 68
        ? ["The positioning statement needs a sharper before/after outcome."]
        : ["Most claims are understandable, but proof density can improve."],
    missingProof:
      trust < 70
        ? ["Customer evidence", "Security posture", "Implementation timeline"]
        : ["Pricing validation", "Competitive win/loss evidence"],
    bestQuote: `"I can see why this would help before a risky launch."`,
    worstQuote: `"I still need proof that this is more than another research dashboard."`,
    recommendation:
      `For the operator-selected market ${JSON.stringify(simulationContext.targetMarket)}, clarify one buyer pain, add proof, and make the next action clear.`,
    confidence: clampScore(62 + sourcesSnapshot.length * 4),
    evidenceReferences: pickEvidence(sourcesSnapshot, persona.name),
  });
}

export function buildScoreBreakdown(results: AgentResult[]): ScoreBreakdown {
  const average = (values: number[]) =>
    clampScore(values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1));
  const clarity = average(results.map((result) => result.clarityScore));
  const trust = average(results.map((result) => result.trustScore));
  const differentiation = average(results.map((result) => result.differentiationScore));
  const urgency = average(results.map((result) => result.urgencyScore));
  const adoption = average(results.map((result) => result.adoptionLikelihood));
  const priceSensitivity = average(results.map((result) => result.priceSensitivity));
  return ScoreBreakdownSchema.parse({
    launchReadiness: average([clarity, trust, differentiation, urgency, adoption, 100 - priceSensitivity]),
    marketClarity: clarity,
    positioningClarity: clarity,
    differentiation,
    trust,
    urgency,
    adoptionLikelihood: adoption,
    pricingFit: clampScore(100 - priceSensitivity),
    negativeFeedbackRisk: clampScore(100 - average([trust, clarity])),
    supportBurden: clampScore(100 - average([clarity, trust])),
    salesFriction: clampScore(100 - average([urgency, trust])),
    viralityShareability: average([differentiation, urgency]),
    enterpriseReadiness: trust,
  });
}

function buildRecommendations(results: AgentResult[], scores: ScoreBreakdown): Recommendation[] {
  const objections = results.flatMap((result) => result.likelyObjections);
  return [
    {
      area: "messaging",
      priority: scores.positioningClarity < 72 ? "high" : "medium",
      title: "Rewrite the launch narrative around one buyer moment",
      rationale: objections[0] ?? "Several personas asked for sharper clarity.",
      suggestedChange:
        "Open with the concrete launch decision the product improves, then show the before/after workflow in one paragraph.",
    },
    {
      area: "pricing",
      priority: scores.pricingFit < 65 ? "high" : "medium",
      title: "Add pricing justification before public launch",
      rationale: "Price sensitivity rises when proof and implementation effort are unclear.",
      suggestedChange:
        "Pair the expected price with payback logic, implementation assumptions, and the smallest useful package.",
    },
    {
      area: "product",
      priority: scores.trust < 70 ? "high" : "medium",
      title: "Add proof for the riskiest trust gap",
      rationale: "Trust gaps reduce adoption likelihood across skeptical and enterprise personas.",
      suggestedChange:
        "Add customer evidence, security posture, and an implementation checklist to the launch material.",
    },
    {
      area: "gtm",
      priority: "medium",
      title: "Test objections before broad distribution",
      rationale: "The strongest objections are predictable enough to test in sales calls and founder-led demos.",
      suggestedChange:
        "Run five objection-focused interviews and revise the landing page before scaling paid or social launch channels.",
    },
  ].map((recommendation) => RecommendationSchema.parse(recommendation));
}

function buildReport(runId: string, simulationContext: SimulationContext, scores: ScoreBreakdown, results: AgentResult[], recs: Recommendation[], provenance: SimulationProvenance) {
  const topObjections = results.flatMap((result) => result.likelyObjections).slice(0, 6);
  const positives = results.flatMap((result) => result.likelyPositiveComments).slice(0, 6);
  return [
    `# before-the-launch report`,
    ``,
    `Simulation run: ${runId}`,
    `Target market (operator-selected run configuration): ${JSON.stringify(simulationContext.targetMarket)}`,
    ``,
    formatSimulationProvenanceMarkdown(provenance),
    ``,
    `## Launch readiness`,
    ``,
    `Global score: ${scores.launchReadiness}/100`,
    ``,
    `## Score breakdown`,
    ``,
    ...Object.entries(scores).map(([key, value]) => `- ${key}: ${value ?? "n/a"}`),
    ``,
    `## Strongest objections`,
    ``,
    ...topObjections.map((item) => `- ${item}`),
    ``,
    `## Positive perception drivers`,
    ``,
    ...positives.map((item) => `- ${item}`),
    ``,
    `## Recommended changes`,
    ``,
    ...recs.map((item) => `- **${item.title}** (${item.area}, ${item.priority}): ${item.suggestedChange}`),
  ].join("\n");
}

export async function createSimulationRun(input: SimulationSetupInput, actor?: OperatorIdentity) {
  input = { ...input, requestId: input.requestId.toLowerCase(), projectId: input.projectId.toLowerCase(),
    personaIds: input.personaIds.map(id => id.toLowerCase()) };
  let inputFingerprint: string;
  try { inputFingerprint = sha256(canonicalSimulationInput(input)); }
  catch { throw new SimulationControlError("invalid_simulation_intent", 400); }
  if (input.engine === "gateway") {
    try { assertOperatorIdentity(actor); } catch { throw new SimulationControlError("operator_required", 403); }
  }
  let policy;
  try { policy = createExecutionPolicy({ engine: input.engine, depth: input.depth,
    modelId: input.engine === "gateway" ? getServerEnv().AI_GATEWAY_MODEL : null, budgetLimitCents: input.budgetLimitCents }); }
  catch { throw new SimulationControlError("invalid_execution_policy", 400); }
  const db = getDb();
  const [existing] = await db.select().from(simulationRuns).where(requestCondition(input.requestId)).limit(1);
  if (existing) {
    if (readExecutionRecord(existing)?.inputFingerprint !== inputFingerprint) throw new SimulationControlError("request_conflict");
    return existing;
  }
  let pricing: ExecutionRecord["pricing"] = null;
  if (policy.engine === "gateway") {
    if (!hasAiGatewayCredentials()) throw new SimulationControlError("gateway_pricing_unavailable", 503);
    try { pricing = await loadGatewayPricing(policy.modelId!, AbortSignal.timeout(5_000)); }
    catch { throw new SimulationControlError("gateway_pricing_unavailable", 503); }
  }
  return db.transaction(async tx => {
    await tx.execute(requestLock(input.requestId));
    const [prior] = await tx.select().from(simulationRuns).where(requestCondition(input.requestId)).limit(1);
    if (prior) {
      if (readExecutionRecord(prior)?.inputFingerprint !== inputFingerprint) throw new SimulationControlError("request_conflict");
      return prior;
    }
    const [project] = await tx.select().from(productProjects).where(eq(productProjects.id, input.projectId)).limit(1);
    if (!project) throw new SimulationControlError("project_not_found", 404);
    const [brief] = await tx.select().from(productBriefs)
      .where(and(eq(productBriefs.projectId, project.id), eq(productBriefs.isCurrent, true))).limit(1);
    if (!brief) throw new SimulationControlError("brief_required", 400);
    const cohort = await tx.select().from(personas).where(and(eq(personas.workspaceId, project.workspaceId), inArray(personas.id, input.personaIds)));
    const ordered = input.personaIds.map(id => cohort.find(p => p.id === id));
    if (cohort.length !== input.personaIds.length || ordered.some(p => !p)) throw new SimulationControlError("cohort_invalid", 400);
    const personaSnapshot = ordered.map(p => ({ id: p!.id, name: p!.name, role: p!.role,
      description: p!.description, evaluationLens: p!.evaluationLens }));
    const sourceRows = await tx.select().from(sources).where(and(eq(sources.projectId, project.id), eq(sources.status, "ready"), isNull(sources.deletedAt)));
    const id = randomUUID();
    const record: ExecutionRecord = { ...policy, requestId: input.requestId, inputFingerprint,
      targetMarket: input.targetMarket, personaIds: [...input.personaIds], pricing, admissionGrant: null,
      claim: null, attempts: [], stopRequestedAt: null, stopReason: null };
    if (policy.engine === "gateway") record.admissionGrant = signPaidSimulationAdmission(admissionScope(id, record), actor!);
    const [run] = await tx.insert(simulationRuns).values({ id, projectId: project.id, status: "queued",
      engine: policy.engine, depth: policy.depth, targetMarket: input.targetMarket, budgetLimitCents: policy.budgetLimitCents,
      agentCount: personaSnapshot.length, briefSnapshot: { ...brief },
      sourceSnapshot: sourceRows.map(source => ({ id: source.id, kind: source.kind, title: source.title, url: source.url,
        contentHash: source.contentHash, extractedText: source.extractedText ?? "" })),
      personaSnapshot, disagreementSummary: { executionControls: record } }).returning();
    await tx.insert(agentRuns).values(personaSnapshot.map(persona => ({ simulationRunId: id, personaId: persona.id, personaSnapshot: persona })));
    return run;
  });
}

const activeExecutions = new Map<string, AbortController>();
const unknownObservation = (): GatewayCostObservation => ({ version: 1, status: "unknown", reportedUsd: null,
  costNanoUsd: null, generationId: null, source: null, inputTokens: null, outputTokens: null, providerName: null });
function requireClaim(run: RunRow, claimId: string, allowStopped = false) {
  const record = readExecutionRecord(run);
  if (!record || record.claim?.id !== claimId) throw new SimulationControlError("execution_stopped");
  if (!allowStopped) {
    if (record.stopRequestedAt) throw new SimulationControlError(record.stopReason ?? "operator_stop");
    if (Date.now() >= Date.parse(record.claim.deadlineAt)) throw new SimulationControlError("run_deadline");
    if (run.status !== "running") throw new SimulationControlError("execution_stopped");
  }
  return record;
}
async function claimRun(runId: string) {
  return getDb().transaction(async tx => {
    const run = structuredClone(await lockedRun(tx, runId));
    if (run.status !== "queued") return null;
    const record = readExecutionRecord(run);
    const cohort = await tx.select().from(agentRuns).where(eq(agentRuns.simulationRunId, runId));
    const validCohort = record && cohort.length === record.personaIds.length
      && record.personaIds.every(id => cohort.filter(a => a.personaId === id && (a.personaSnapshot as PersonaSnapshot).id === id && a.status === "queued").length === 1)
      && run.personaSnapshot.length === record.personaIds.length
      && record.personaIds.every((id, index) => run.personaSnapshot[index]?.id === id
        && JSON.stringify(cohort.find(a => a.personaId === id)?.personaSnapshot) === JSON.stringify(run.personaSnapshot[index]));
    const admitted = record && run.engine === record.engine && run.depth === record.depth
      && run.targetMarket === record.targetMarket && run.budgetLimitCents === record.budgetLimitCents
      && (record.engine === "fake" || verifyPaidSimulationAdmission(admissionScope(runId, record), record.admissionGrant));
    if (!validCohort || !admitted || record!.claim || record!.attempts.length) {
      const reason = !validCohort ? "cohort_invalid" : "admission_invalid";
      if (record) record.stopReason = reason;
      await tx.update(simulationRuns).set({ status: "failed", errorMessage: reason,
        disagreementSummary: record ? { ...run.disagreementSummary, executionControls: record } : run.disagreementSummary,
        completedAt: new Date(), updatedAt: new Date() }).where(eq(simulationRuns.id, runId));
      await tx.update(agentRuns).set({ status: "unexecuted", currentStep: "Not executed", errorMessage: reason,
        completedAt: new Date(), updatedAt: new Date() }).where(eq(agentRuns.simulationRunId, runId));
      return null;
    }
    const started = new Date();
    record!.claim = { id: randomUUID(), startedAt: started.toISOString(), deadlineAt: new Date(started.getTime() + record!.runTimeoutMs).toISOString() };
    const changed = await tx.update(simulationRuns).set({ status: "running", startedAt: started, updatedAt: started,
      disagreementSummary: { ...run.disagreementSummary, executionControls: record } })
      .where(and(eq(simulationRuns.id, runId), eq(simulationRuns.status, "queued"))).returning();
    return changed.length === 1 ? { run, record: record!, agents: record!.personaIds.map(id => cohort.find(a => a.personaId === id)!) } : null;
  });
}
async function finalizeRun(runId: string, claimId: string | null, reason: string | null) {
  return getDb().transaction(async tx => {
    const run = await lockedRun(tx, runId);
    if (!["queued", "running"].includes(run.status)) return run;
    const record = readExecutionRecord(run);
    if (!record || (record.claim?.id ?? null) !== claimId) throw new SimulationControlError("execution_stopped");
    record.stopReason ??= reason;
    const agents = await tx.select().from(agentRuns).where(eq(agentRuns.simulationRunId, runId));
    const executions = [];
    for (const agent of agents) {
      const [finding] = await tx.select().from(agentFindings).where(eq(agentFindings.agentRunId, agent.id)).limit(1);
      const events = await tx.select().from(agentTraceEvents).where(eq(agentTraceEvents.agentRunId, agent.id));
      if (finding) executions.push({ finding, provenance: deriveAgentProvenance(record.engine, finding, events) });
      if (!["completed", "failed"].includes(agent.status)) await tx.update(agentRuns).set({ status: record.attempts.some(a => a.agentRunId === agent.id) ? "failed" : "unexecuted", currentStep: "Not executed",
        errorMessage: record.stopReason ?? "execution_failed", completedAt: new Date(), updatedAt: new Date() }).where(eq(agentRuns.id, agent.id));
    }
    const allResults = executions.map(e => e.finding.result), successful = agents.filter(a => a.status === "completed").length;
    const complete = successful === agents.length && !record.stopReason && accounting(record).unknownCostAttempts === 0;
    const status = complete ? "completed" : allResults.length ? "partial" : "failed";
    let summary: Record<string, unknown> = { ...run.disagreementSummary, executionControls: record };
    let globalScore: string | null = null;
    if (allResults.length) {
      const scores = buildScoreBreakdown(allResults), recs = buildRecommendations(allResults, scores);
      globalScore = scores.launchReadiness.toFixed(2);
      const scoreId = randomUUID(), reportId = randomUUID(), findingIds = executions.map(e => e.finding.id);
      const unexecuted = agents.length - executions.length;
      const origins = [...executions.map(e => e.provenance), ...Array.from({ length: unexecuted }, () => deriveAgentProvenance(record.engine, null, []))];
      const findingProvenance = summarizeSimulationProvenance(record.engine, origins);
      const executionProvenance = { version: 1, configuredEngine: record.engine, scoreId, reportId, findingIds, summary: findingProvenance };
      const provenance = bindSimulationProvenanceToOutputs(findingProvenance, { record: executionProvenance, scoreId, reportId, findingIds });
      await tx.insert(scoreBreakdowns).values({ id: scoreId, simulationRunId: runId, scores, globalScore });
      if (recs.length) await tx.insert(recommendations).values(recs.map(rec => ({ simulationRunId: runId, ...rec, payload: rec })));
      const coverage = status === "completed" ? "" : "\n\n## Partial execution\n\n" + successful
        + " successful persona judgments; " + record.attempts.filter(a => a.origin === "gateway-fallback").length
        + " explicitly synthetic fallback findings; " + unexecuted + " personas have no finding. Stop reason: " + (record.stopReason ?? "execution_failed") + ".";
      await tx.insert(reports).values({ id: reportId, simulationRunId: runId, title: "Launch perception report",
        body: buildReport(runId, { targetMarket: record.targetMarket }, scores, allResults, recs, provenance) + coverage });
      summary = { ...summary, executionProvenance, confidenceRange: [Math.min(...allResults.map(r => r.confidence)),
        Math.max(...allResults.map(r => r.confidence))], mostCommonObjection: allResults[0]?.likelyObjections[0] ?? null };
      await tx.update(productProjects).set({ lastRunId: runId, status: "simulated", nextRecommendedAction: recs[0]?.suggestedChange ?? "Review simulation results.",
        updatedAt: new Date() }).where(eq(productProjects.id, run.projectId));
    }
    const [finished] = await tx.update(simulationRuns).set({ status, globalScore, disagreementSummary: summary,
      errorMessage: complete ? null : record.stopReason ?? "execution_failed", completedAt: new Date(), updatedAt: new Date() })
      .where(eq(simulationRuns.id, runId)).returning();
    return finished;
  });
}

export async function executeSimulationRun(runId: string) {
  await reconcileExpiredSimulationRun(runId);
  const claimed = await claimRun(runId);
  if (!claimed) {
    const [existing] = await getDb().select().from(simulationRuns).where(eq(simulationRuns.id, runId)).limit(1);
    return existing;
  }
  const { run, record, agents } = claimed, claimId = record.claim!.id;
  const controller = new AbortController(); activeExecutions.set(runId, controller);
  const timer = setTimeout(() => controller.abort("run_deadline"), Math.max(1, Date.parse(record.claim!.deadlineAt) - Date.now()));
  let checking = false;
  const poll = setInterval(() => {
    if (checking || controller.signal.aborted) return;
    checking = true;
    getDb().select().from(simulationRuns).where(eq(simulationRuns.id, runId)).limit(1)
      .then(([row]) => { try { if (!row) throw new Error(); requireClaim(row, claimId); }
        catch (error) { controller.abort(error instanceof SimulationControlError ? error.code : "execution_failed"); } })
      .catch(() => controller.abort("execution_failed")).finally(() => { checking = false; });
  }, 1_000);
  let reason: string | null = null;
  try {
    const brief = run.briefSnapshot as BriefSnapshot, sourceSnapshot = run.sourceSnapshot as SourceSnapshot[];
    for (const agent of agents) {
      if (controller.signal.aborted) { reason = String(controller.signal.reason); break; }
      const persona = agent.personaSnapshot as PersonaSnapshot;
      const prompt = record.engine === "gateway" ? buildGatewayPrompt({ brief, sources: sourceSnapshot, persona, targetMarket: record.targetMarket, depth: record.depth }) : "";
      const reservation = record.engine === "gateway" ? estimateGatewayReservation(record, record.pricing!, prompt).estimatedNanoUsd : 0;
      const attemptId = randomUUID(), start = Date.now();
      const reserved = await getDb().transaction(async tx => {
        const current = await lockedRun(tx, runId), controls = requireClaim(current, claimId);
        if (controls.engine === "gateway") {
          if (!verifyPaidSimulationAdmission(admissionScope(runId, controls), controls.admissionGrant)) throw new SimulationControlError("admission_invalid");
          const money = accounting(controls);
          if (money.unknownCostAttempts || !canReserveBudget(controls.budgetLimitCents, money.reportedNanoUsd, money.reservedNanoUsd, reservation)) return false;
        }
        if (controls.attempts.some(a => a.agentRunId === agent.id)) throw new SimulationControlError("attempt_already_reserved");
        controls.attempts.push({ id: attemptId, agentRunId: agent.id, personaId: persona.id, reservedNanoUsd: reservation,
          observation: null, startedAt: new Date().toISOString(), finishedAt: null, origin: null });
        await writeControls(tx, current, controls);
        await tx.update(agentRuns).set({ status: "running", currentStep: "Evaluating frozen context", startedAt: new Date() }).where(eq(agentRuns.id, agent.id));
        await tx.insert(agentTraceEvents).values([
          { agentRunId: agent.id, sequence: 1, eventType: "context", title: "Input context frozen",
            body: persona.name + " received an immutable brief and " + sourceSnapshot.length + " source snapshots. Operator-selected target market: " + JSON.stringify(record.targetMarket) + ". This is run configuration, not a sourced product fact.",
            metadata: { sourceCount: sourceSnapshot.length, targetMarket: record.targetMarket } },
          { agentRunId: agent.id, sequence: 2, eventType: "evidence", title: "Evidence scan",
            body: "Source text was treated as untrusted evidence and never as instructions.", metadata: { sourceIds: sourceSnapshot.map(s => s.id) } },
          { agentRunId: agent.id, sequence: 5, eventType: "execution_settings", title: "Execution reservation recorded",
            body: record.engine === "fake" ? "Synthetic demo; actual model cost is zero." : "Estimated reservation; this is not a hard billing ceiling.",
            metadata: { attemptId, depth: record.depth, maxOutputTokens: record.maxOutputTokens, reservedNanoUsd: reservation } },
        ]);
        return true;
      });
      if (!reserved) { reason = "budget_target_reached"; break; }
      const receipt: { value: GatewayCostObservation | null } = { value: null };
      let origin: GeneratedResultOrigin = record.engine === "fake" ? "fake" : "gateway";
      const persistObservation = async (value: GatewayCostObservation) => {
        await getDb().transaction(async tx => {
          const current = await lockedRun(tx, runId), controls = requireClaim(current, claimId, true);
          const attempt = controls.attempts.find(a => a.id === attemptId);
          if (!attempt) throw new SimulationControlError("attempt_missing");
          if (attempt.observation?.status === "reported" && JSON.stringify(attempt.observation) !== JSON.stringify(value)) throw new SimulationControlError("cost_receipt_conflict");
          attempt.observation = value;
          await writeControls(tx, current, controls);
          await tx.update(agentRuns).set({ costCents: value.costNanoUsd === null ? null : nanoUsdToCents(value.costNanoUsd) }).where(eq(agentRuns.id, agent.id));
          await tx.insert(agentTraceEvents).values({ agentRunId: agent.id, sequence: 6, eventType: "cost", title: "Gateway cost observation",
            body: value.status === "reported" ? "Gateway-reported USD cost recorded." : "Cost remains unknown; reservation retained.", metadata: { attemptId, ...value } });
        });
        receipt.value = value;
      };
      let result: AgentResult;
      try {
        if (record.engine === "fake") result = buildFakeAgentResult(brief, sourceSnapshot, persona, { targetMarket: record.targetMarket });
        else {
          const output = await executeGatewayAttempt({ policy: record, prompt, signal: controller.signal, onObservation: persistObservation });
          result = output.result;
          if (!receipt.value) throw new SimulationControlError("cost_receipt_missing");
        }
      } catch (error) {
        if (controller.signal.aborted) { reason = String(controller.signal.reason); break; }
        if (error instanceof SimulationControlError) throw error;
        if (record.engine !== "gateway") throw error;
        if (error instanceof SimulationGatewayError && error.code === "gateway_observation_failed") {
          reason = "execution_failed";
          break;
        }
        if (!receipt.value) await persistObservation(error instanceof SimulationGatewayError ? error.observation : unknownObservation());
        result = buildFakeAgentResult(brief, sourceSnapshot, persona, { targetMarket: record.targetMarket });
        origin = "gateway-fallback"; reason = "gateway_failed";
      }
      await getDb().transaction(async tx => {
        const current = await lockedRun(tx, runId), controls = requireClaim(current, claimId);
        const attempt = controls.attempts.find(a => a.id === attemptId)!;
        const findingId = randomUUID(), executionOrigin = { version: 1, findingId, origin, configuredEngine: record.engine };
        if (origin === "gateway-fallback") await tx.insert(agentTraceEvents).values({ agentRunId: agent.id, sequence: 3,
          eventType: "fallback", title: "Gateway fallback", body: "Gateway attempt failed. This finding is synthetic; cost may remain unknown.", metadata: { fallback: true } });
        await tx.insert(agentTraceEvents).values({ agentRunId: agent.id, sequence: 4, eventType: "judgment", title: "Final structured judgment",
          body: result.recommendation, metadata: { scores: result, executionOrigin } });
        await tx.insert(agentFindings).values({ id: findingId, agentRunId: agent.id, result, evidenceSummary: result.evidenceReferences.map(ref => ref.sourceTitle).join(", ") });
        attempt.origin = origin; attempt.finishedAt = new Date().toISOString();
        await writeControls(tx, current, controls);
        await tx.update(agentRuns).set({ status: origin === "gateway-fallback" ? "failed" : "completed",
          currentStep: origin === "gateway-fallback" ? "Synthetic fallback — model attempt failed" : "Completed",
          errorMessage: origin === "gateway-fallback" ? "gateway_failed" : null, latencyMs: Date.now() - start,
          tokenCount: receipt.value?.inputTokens != null && receipt.value.outputTokens != null ? receipt.value.inputTokens + receipt.value.outputTokens : null,
          costCents: record.engine === "fake" ? 0 : receipt.value?.costNanoUsd != null ? nanoUsdToCents(receipt.value.costNanoUsd) : null,
          completedAt: new Date(), updatedAt: new Date() }).where(eq(agentRuns.id, agent.id));
      });
      if (origin === "gateway-fallback") break;
      if (record.engine === "gateway" && receipt.value?.status !== "reported") { reason = "gateway_cost_unknown"; break; }
    }
  } catch (error) {
    reason = error instanceof SimulationControlError && ["operator_stop", "run_deadline", "admission_invalid"].includes(error.code) ? error.code : "execution_failed";
  } finally { clearTimeout(timer); clearInterval(poll); controller.abort(); activeExecutions.delete(runId); }
  return finalizeRun(runId, claimId, reason);
}
export async function requestStopSimulationRun(runId: string) {
  const stopped = await getDb().transaction(async tx => {
    const run = await lockedRun(tx, runId);
    if (!["queued", "running"].includes(run.status)) return null;
    const record = readExecutionRecord(run);
    if (!record) throw new SimulationControlError("execution_controls_missing");
    record.stopRequestedAt ??= new Date().toISOString(); record.stopReason ??= "operator_stop";
    await writeControls(tx, run, record);
    return { claimId: record.claim?.id ?? null };
  });
  activeExecutions.get(runId)?.abort("operator_stop");
  if (stopped) return finalizeRun(runId, stopped.claimId, "operator_stop");
  const [run] = await getDb().select().from(simulationRuns).where(eq(simulationRuns.id, runId)).limit(1);
  return run;
}
export async function reconcileExpiredSimulationRun(runId: string) {
  const [run] = await getDb().select().from(simulationRuns).where(eq(simulationRuns.id, runId)).limit(1);
  if (!run) return null;
  const record = readExecutionRecord(run);
  if (run.status === "running" && record?.claim && Date.now() >= Date.parse(record.claim.deadlineAt)) {
    activeExecutions.get(runId)?.abort("claim_expired");
    return finalizeRun(runId, record.claim.id, "claim_expired");
  }
  return run;
}

export async function deleteRun(runId: string) {
  await getDb().transaction(async tx => {
    const run = await lockedRun(tx, runId);
    if (["queued", "running"].includes(run.status)) throw new SimulationControlError("active_run_cannot_be_deleted");
    await tx.delete(simulationRuns).where(eq(simulationRuns.id, runId));
  });
}
