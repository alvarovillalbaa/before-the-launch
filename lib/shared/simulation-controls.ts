export type SimulationDepth = "quick" | "standard" | "deep";
export type SimulationExecutionEngine = "fake" | "gateway";

export const RUN_TIMEOUT_MS = 240_000;
export const CALL_TIMEOUT_MS = 60_000;
export const DEPTH_PROFILES = Object.freeze({
  quick: Object.freeze({ maxOutputTokens: 2_048, instruction: "Prioritize the main objection, adoption trigger, and missing proof. Be concise." }),
  standard: Object.freeze({ maxOutputTokens: 4_096, instruction: "Give a balanced review of all result dimensions, objections, and supporting evidence." }),
  deep: Object.freeze({ maxOutputTokens: 8_192, instruction: "Examine competing explanations, tradeoffs, and evidence limits without inventing facts." }),
});
const NANO_PER_CENT = 10_000_000;
const MAX_CENTS = 100_000;
const MAX_INTEGER = BigInt(Number.MAX_SAFE_INTEGER);
const reject = (code: string): never => { throw new Error(code); };
const integer = (value: unknown): value is number => typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
const record = (value: unknown): value is Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  if (![Object.prototype, null].includes(Object.getPrototypeOf(value))) return false;
  return Reflect.ownKeys(value).every(key => typeof key === "string" && !["__proto__", "constructor", "prototype"].includes(key)
    && Object.prototype.hasOwnProperty.call(Object.getOwnPropertyDescriptor(value, key), "value"));
};
const modelName = (value: unknown): value is string => typeof value === "string" && value.length > 0 && value.length <= 200
  && value.trim() === value && !/[\x00-\x20\x7f]/.test(value);
const utc = (value: unknown): value is string => typeof value === "string" && value.length === 24
  && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;

export type ExecutionPolicy = Readonly<{
  version: 1;
  budgetMode: "free-demo" | "estimated-target";
  engine: SimulationExecutionEngine;
  depth: SimulationDepth;
  modelId: string | null;
  budgetLimitCents: number;
  maxOutputTokens: number;
  runTimeoutMs: number;
  callTimeoutMs: number;
}>;

export function parseUsdCents(value: string): number {
  if (typeof value !== "string" || !/^(?:0|[1-9]\d{0,3})(?:\.\d{1,2})?$/.test(value)) return reject("invalid_usd_amount");
  const [whole, fraction = ""] = value.split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return cents <= MAX_CENTS ? cents : reject("invalid_usd_amount");
}

export function formatUsdCents(value: number): string {
  if (!integer(value)) return reject("invalid_cent_amount");
  return `${Math.floor(value / 100)}.${String(value % 100).padStart(2, "0")}`;
}

/** Round upward only below nano-USD precision; never use floating-point multiplication for money. */
export function usdToNanoUsd(value: string | number): number {
  if (typeof value !== "string" && (typeof value !== "number" || !Number.isFinite(value) || value < 0)) return reject("invalid_usd_cost");
  const text = String(value);
  const match = text.length <= 80 && /^(0|[1-9]\d{0,17})(?:\.(\d{1,30}))?(?:[eE]([+-]?\d{1,2}))?$/.exec(text);
  if (!match) return reject("invalid_usd_cost");
  const fraction = match[2] ?? "", shift = 9 + Number(match[3] ?? 0) - fraction.length;
  let amount = BigInt(match[1] + fraction);
  if (shift >= 0) amount *= BigInt(10) ** BigInt(shift);
  else { const divisor = BigInt(10) ** BigInt(-shift); amount = (amount + divisor - BigInt(1)) / divisor; }
  return amount <= MAX_INTEGER ? Number(amount) : reject("cost_overflow");
}

export function nanoUsdToCents(value: number): number {
  if (!integer(value)) return reject("invalid_nano_usd");
  return Number((BigInt(value) + BigInt(NANO_PER_CENT) - BigInt(1)) / BigInt(NANO_PER_CENT));
}

export function sumNanoUsd(...values: number[]): number {
  if (!values.every(integer)) return reject("invalid_nano_usd");
  const sum = values.reduce((total, value) => total + BigInt(value), BigInt(0));
  return sum <= MAX_INTEGER ? Number(sum) : reject("cost_overflow");
}

export function canReserveBudget(targetCents: number, reportedNanoUsd: number, reservedNanoUsd: number, nextNanoUsd: number): boolean {
  if (!integer(targetCents) || targetCents > MAX_CENTS) return reject("invalid_budget_target");
  const total = sumNanoUsd(reportedNanoUsd, reservedNanoUsd, nextNanoUsd);
  return targetCents > 0 && total <= targetCents * NANO_PER_CENT;
}

export function createExecutionPolicy(input: {
  engine: SimulationExecutionEngine; depth: SimulationDepth; modelId: string | null; budgetLimitCents: number;
}): ExecutionPolicy {
  if (!record(input) || !["fake", "gateway"].includes(input.engine) || !Object.hasOwn(DEPTH_PROFILES, input.depth)
    || !integer(input.budgetLimitCents) || input.budgetLimitCents > MAX_CENTS
    || (input.engine === "fake" ? input.budgetLimitCents !== 0 : input.budgetLimitCents === 0 || !modelName(input.modelId))) return reject("invalid_execution_policy");
  return Object.freeze({ version: 1, budgetMode: input.engine === "fake" ? "free-demo" : "estimated-target", engine: input.engine,
    depth: input.depth, modelId: input.engine === "fake" ? null : input.modelId, budgetLimitCents: input.budgetLimitCents,
    maxOutputTokens: DEPTH_PROFILES[input.depth].maxOutputTokens, runTimeoutMs: RUN_TIMEOUT_MS, callTimeoutMs: CALL_TIMEOUT_MS });
}

/** Server records may add private admission/claim fields. Only policy fields leave this projection. */
export function readExecutionPolicy(value: unknown): ExecutionPolicy | null {
  if (!record(value)) return null;
  try {
    const policy = createExecutionPolicy(value as Parameters<typeof createExecutionPolicy>[0]);
    return Object.entries(policy).every(([key, expected]) => value[key] === expected) ? policy : null;
  } catch { return null; }
}

export function canonicalSimulationInput(input: {
  projectId: string; requestId: string; engine: SimulationExecutionEngine; targetMarket: string;
  personaIds: readonly string[]; agentCount: number; depth: SimulationDepth; budgetLimitCents: number;
}): string {
  const id = (value: unknown) => typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  if (!record(input) || !id(input.projectId) || !id(input.requestId) || !["fake", "gateway"].includes(input.engine)
    || typeof input.targetMarket !== "string" || !input.targetMarket.trim() || input.targetMarket.length > 180
    || !Array.isArray(input.personaIds) || input.personaIds.length < 1 || input.personaIds.length > 10
    || Object.keys(input.personaIds).length !== input.personaIds.length || !input.personaIds.every(id)
    || new Set(input.personaIds).size !== input.personaIds.length || input.agentCount !== input.personaIds.length
    || !Object.hasOwn(DEPTH_PROFILES, input.depth) || !integer(input.budgetLimitCents) || input.budgetLimitCents > MAX_CENTS) return reject("invalid_simulation_intent");
  return JSON.stringify({ projectId: input.projectId, requestId: input.requestId, engine: input.engine,
    targetMarket: input.targetMarket, personaIds: [...input.personaIds], agentCount: input.agentCount,
    depth: input.depth, budgetLimitCents: input.budgetLimitCents });
}

export type GatewayPricingSnapshot = Readonly<{
  version: 1; modelId: string; observedAt: string; inputUsdPerToken: string; outputUsdPerToken: string;
  cachedInputUsdPerToken: string | null; cacheCreationInputUsdPerToken: string | null;
  inputNanoUsdPerToken: number; outputNanoUsdPerToken: number;
}>;

export function createGatewayPricingSnapshot(input: { modelId: string; observedAt: string; pricing: unknown }): GatewayPricingSnapshot {
  if (!record(input) || !modelName(input.modelId) || !utc(input.observedAt) || !record(input.pricing)) return reject("gateway_pricing_unavailable");
  const pricing = input.pricing;
  if (typeof pricing.input !== "string" || typeof pricing.output !== "string"
    || (pricing.cachedInputTokens != null && typeof pricing.cachedInputTokens !== "string")
    || (pricing.cacheCreationInputTokens != null && typeof pricing.cacheCreationInputTokens !== "string")) return reject("gateway_pricing_unavailable");
  const inputRates = [pricing.input, pricing.cachedInputTokens, pricing.cacheCreationInputTokens].filter((value): value is string => typeof value === "string");
  return Object.freeze({ version: 1, modelId: input.modelId, observedAt: input.observedAt,
    inputUsdPerToken: pricing.input, outputUsdPerToken: pricing.output,
    cachedInputUsdPerToken: typeof pricing.cachedInputTokens === "string" ? pricing.cachedInputTokens : null,
    cacheCreationInputUsdPerToken: typeof pricing.cacheCreationInputTokens === "string" ? pricing.cacheCreationInputTokens : null,
    inputNanoUsdPerToken: Math.max(...inputRates.map(usdToNanoUsd)), outputNanoUsdPerToken: usdToNanoUsd(pricing.output) });
}

export function readGatewayPricingSnapshot(value: unknown): GatewayPricingSnapshot | null {
  if (!record(value)) return null;
  try {
    const snapshot = createGatewayPricingSnapshot({ modelId: value.modelId as string, observedAt: value.observedAt as string,
      pricing: { input: value.inputUsdPerToken, output: value.outputUsdPerToken,
        cachedInputTokens: value.cachedInputUsdPerToken, cacheCreationInputTokens: value.cacheCreationInputUsdPerToken } });
    return Object.entries(snapshot).every(([key, expected]) => value[key] === expected) ? snapshot : null;
  } catch { return null; }
}

export function estimateGatewayReservation(policy: ExecutionPolicy, pricing: GatewayPricingSnapshot, prompt: string) {
  if (!readExecutionPolicy(policy) || policy.engine !== "gateway" || !readGatewayPricingSnapshot(pricing)
    || policy.modelId !== pricing.modelId || typeof prompt !== "string") return reject("invalid_gateway_reservation");
  const estimatedInputTokens = new TextEncoder().encode(prompt).length;
  if (estimatedInputTokens === 0 || estimatedInputTokens > 262_144) return reject("gateway_prompt_limit");
  const nano = BigInt(estimatedInputTokens) * BigInt(pricing.inputNanoUsdPerToken)
    + BigInt(policy.maxOutputTokens) * BigInt(pricing.outputNanoUsdPerToken);
  if (nano > MAX_INTEGER) return reject("cost_overflow");
  return Object.freeze({ estimatedInputTokens, maxOutputTokens: policy.maxOutputTokens, estimatedNanoUsd: Number(nano) });
}

export type GatewayCostObservation = Readonly<{
  version: 1; status: "reported" | "unknown"; reportedUsd: string | null; costNanoUsd: number | null;
  generationId: string | null; source: "gateway-metadata" | "gateway-generation-info" | null;
  inputTokens: number | null; outputTokens: number | null; providerName: string | null;
}>;

export type SimulationExecutionSummary = {
  version: 1; recorded: boolean; budgetMode: ExecutionPolicy["budgetMode"] | "unrecorded";
  engine: SimulationExecutionEngine | null; depth: SimulationDepth | null; modelId: string | null;
  budgetLimitCents: number | null; maxOutputTokens: number | null; runTimeoutMs: number | null; callTimeoutMs: number | null;
  coverage: { scheduled: number; completed: number; failed: number; pending: number; syntheticFallback: number };
  reportedCostCents: number | null; reservedCostCents: number; unknownCostAttempts: number;
  status: string; stopReason: string | null; qualification: string;
};

export function summarizeExecutionControls(value: unknown, stats: {
  status: string; scheduled: number; completed: number; failed: number; pending: number; syntheticFallback?: number;
  reportedNanoUsd: number | null; reservedNanoUsd: number; unknownCostAttempts: number; stopReason: string | null;
}): SimulationExecutionSummary {
  const { scheduled, completed, failed, pending } = stats, syntheticFallback = stats.syntheticFallback ?? 0;
  if (![scheduled, completed, failed, pending, syntheticFallback, stats.unknownCostAttempts].every(integer)
    || scheduled > 10 || completed + failed + pending !== scheduled || syntheticFallback > failed
    || !integer(stats.reservedNanoUsd) || (stats.reportedNanoUsd !== null && !integer(stats.reportedNanoUsd))) return reject("invalid_execution_summary");
  const policy = readExecutionPolicy(value);
  const status = ["queued", "running", "completed", "partial", "failed", "cancelled", "stopped"].includes(stats.status) ? stats.status : "unknown";
  const stopReason = stats.stopReason === null ? null
    : /^[a-z][a-z0-9_]{0,63}$/.test(stats.stopReason) ? stats.stopReason : "execution_stopped";
  return { version: 1, recorded: policy !== null, budgetMode: policy?.budgetMode ?? "unrecorded",
    engine: policy?.engine ?? null, depth: policy?.depth ?? null, modelId: policy?.modelId ?? null,
    budgetLimitCents: policy?.budgetLimitCents ?? null, maxOutputTokens: policy?.maxOutputTokens ?? null,
    runTimeoutMs: policy?.runTimeoutMs ?? null, callTimeoutMs: policy?.callTimeoutMs ?? null,
    coverage: { scheduled, completed, failed, pending, syntheticFallback },
    reportedCostCents: stats.reportedNanoUsd === null ? null : nanoUsdToCents(stats.reportedNanoUsd),
    reservedCostCents: nanoUsdToCents(stats.reservedNanoUsd), unknownCostAttempts: stats.unknownCostAttempts, status, stopReason,
    qualification: !policy ? "Historical controls are unrecorded; no budget or depth admission is inferred."
      : policy.engine === "fake" ? "Free synthetic demo with no model request. Requested depth does not establish deeper reasoning or improved quality."
      : "Estimated model spending target, not a hard billing ceiling. Known reported cost excludes unknown charges; reservations are estimates. An in-flight request or final charge may exceed the target." };
}
