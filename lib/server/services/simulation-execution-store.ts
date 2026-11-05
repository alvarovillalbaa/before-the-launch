import { eq } from "drizzle-orm";
import { getDb } from "@/lib/server/db/client";
import { simulationRuns } from "@/lib/server/db/schema";
import type { PaidSimulationAdmission, PaidSimulationScope } from "@/lib/server/security/operator-auth";
import {
  canonicalSimulationInput, readExecutionPolicy, readGatewayPricingSnapshot, sumNanoUsd, summarizeExecutionControls,
  type ExecutionPolicy, type GatewayCostObservation, type GatewayPricingSnapshot,
} from "@/lib/shared/simulation-controls";
import { sha256 } from "./source-ingestion";

export type RunRow = typeof simulationRuns.$inferSelect;
export type Attempt = {
  id: string; agentRunId: string; personaId: string; reservedNanoUsd: number;
  observation: GatewayCostObservation | null; startedAt: string; finishedAt: string | null;
  origin: "gateway" | "gateway-fallback" | "fake" | null;
};
export type ExecutionRecord = ExecutionPolicy & {
  requestId: string; inputFingerprint: string; targetMarket: string; personaIds: string[];
  pricing: GatewayPricingSnapshot | null; admissionGrant: PaidSimulationAdmission | null;
  claim: { id: string; startedAt: string; deadlineAt: string } | null;
  attempts: Attempt[]; stopRequestedAt: string | null; stopReason: string | null;
};
export class SimulationControlError extends Error {
  readonly code: string;
  readonly status: number;
  constructor(code: string, status = 409) { super(code); this.name = "SimulationControlError"; this.code = code; this.status = status; }
}
const uuid = (v: unknown): v is string => typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
const time = (v: unknown): v is string => typeof v === "string" && Number.isFinite(Date.parse(v)) && new Date(v).toISOString() === v;
const integer = (v: unknown): v is number => typeof v === "number" && Number.isSafeInteger(v) && v >= 0;
export function readExecutionRecord(run: RunRow): ExecutionRecord | null {
  const raw = run.disagreementSummary?.executionControls;
  const policy = readExecutionPolicy(raw);
  if (!policy || !raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const r = raw as ExecutionRecord;
  try {
    if (!uuid(r.requestId) || !Array.isArray(r.personaIds) || r.personaIds.length !== run.agentCount
      || !r.personaIds.every(uuid) || new Set(r.personaIds).size !== r.personaIds.length
      || typeof r.targetMarket !== "string" || !Array.isArray(r.attempts) || r.attempts.length > r.personaIds.length
      || (r.stopRequestedAt !== null && !time(r.stopRequestedAt))
      || (r.stopReason !== null && (typeof r.stopReason !== "string" || !/^[a-z_]{1,80}$/.test(r.stopReason)))) return null;
    const fingerprint = sha256(canonicalSimulationInput({ projectId: run.projectId, requestId: r.requestId,
      engine: policy.engine, targetMarket: r.targetMarket, personaIds: r.personaIds, agentCount: run.agentCount,
      depth: policy.depth, budgetLimitCents: policy.budgetLimitCents }));
    if (fingerprint !== r.inputFingerprint) return null;
    if (r.claim !== null && (!uuid(r.claim.id) || !time(r.claim.startedAt) || !time(r.claim.deadlineAt)
      || Date.parse(r.claim.deadlineAt) - Date.parse(r.claim.startedAt) !== policy.runTimeoutMs)) return null;
    if (new Set(r.attempts.map(a => a.agentRunId)).size !== r.attempts.length) return null;
    for (const a of r.attempts) {
      if (!uuid(a.id) || !uuid(a.agentRunId) || !r.personaIds.includes(a.personaId) || !integer(a.reservedNanoUsd)
        || !time(a.startedAt) || (a.finishedAt !== null && !time(a.finishedAt))
        || ![null, "fake", "gateway", "gateway-fallback"].includes(a.origin)) return null;
      const o = a.observation;
      if (o !== null && (o.version !== 1 || !["reported", "unknown"].includes(o.status)
        || (o.status === "reported" ? !integer(o.costNanoUsd) : o.costNanoUsd !== null))) return null;
    }
    const pricing = r.pricing === null ? null : readGatewayPricingSnapshot(r.pricing);
    if (policy.engine === "gateway" && (!pricing || pricing.modelId !== policy.modelId)) return null;
    return structuredClone({ ...r, ...policy, pricing });
  } catch { return null; }
}
export function admissionScope(runId: string, record: ExecutionRecord): PaidSimulationScope {
  return { runId, requestId: record.requestId, inputFingerprint: record.inputFingerprint,
    modelId: record.modelId!, depth: record.depth, budgetLimitCents: record.budgetLimitCents, personaIds: [...record.personaIds] };
}
export function accounting(record: ExecutionRecord) {
  return {
    reportedNanoUsd: record.engine === "fake" ? 0 : sumNanoUsd(...record.attempts.map(a => a.observation?.costNanoUsd ?? 0)),
    reservedNanoUsd: sumNanoUsd(...record.attempts.filter(a => a.observation?.status !== "reported").map(a => a.reservedNanoUsd)),
    unknownCostAttempts: record.engine === "fake" ? 0 : record.attempts.filter(a => a.observation?.status !== "reported").length,
  };
}
export function executionSummary(run: RunRow, agents: readonly { status: string }[]) {
  const r = readExecutionRecord(run);
  const completed = agents.filter(a => a.status === "completed").length;
  const failed = agents.filter(a => a.status === "failed").length;
  const scheduled = Math.max(run.agentCount, agents.length);
  return summarizeExecutionControls(r, { status: run.status, scheduled, completed, failed,
    pending: scheduled - completed - failed, ...(r ? accounting(r) : { reportedNanoUsd: null, reservedNanoUsd: 0, unknownCostAttempts: 0 }),
    syntheticFallback: r?.attempts.filter(a => a.origin === "gateway-fallback").length ?? 0, stopReason: r?.stopReason ?? null });
}
export type Transaction = Parameters<Parameters<ReturnType<typeof getDb>["transaction"]>[0]>[0];
export async function lockedRun(tx: Transaction, id: string) {
  const [run] = await tx.select().from(simulationRuns).where(eq(simulationRuns.id, id)).limit(1).for("update");
  if (!run) throw new SimulationControlError("run_not_found", 404);
  return run;
}
export async function writeControls(tx: Transaction, run: RunRow, record: ExecutionRecord) {
  await tx.update(simulationRuns).set({ disagreementSummary: { ...run.disagreementSummary, executionControls: record }, updatedAt: new Date() })
    .where(eq(simulationRuns.id, run.id));
}
