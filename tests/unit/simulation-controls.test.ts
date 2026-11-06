// T2: authored money, policy, pricing and coverage records; no service/provider execution.
import { expect, it } from "vitest";
import {
  CALL_TIMEOUT_MS, RUN_TIMEOUT_MS, DEPTH_PROFILES, canReserveBudget, canonicalSimulationInput,
  createExecutionPolicy, createGatewayPricingSnapshot, estimateGatewayReservation, formatUsdCents,
  nanoUsdToCents, parseUsdCents, readExecutionPolicy, readGatewayPricingSnapshot, sumNanoUsd,
  summarizeExecutionControls, usdToNanoUsd,
} from "@/lib/shared/simulation-controls";

const policy = () => createExecutionPolicy({ engine: "gateway", depth: "standard", modelId: "authored/model", budgetLimitCents: 100 });
const pricing = () => createGatewayPricingSnapshot({ modelId: "authored/model", observedAt: "2026-11-05T00:00:00.000Z",
  pricing: { input: "0.000001", output: "0.000002", cachedInputTokens: "0.0000005", cacheCreationInputTokens: "0.000003" } });
const intent = { projectId: "11111111-1111-4111-8111-111111111111", requestId: "22222222-2222-4222-8222-222222222222",
  engine: "gateway" as const, targetMarket: "Independent bookshops", personaIds: ["33333333-3333-4333-8333-333333333333"],
  agentCount: 1, depth: "standard" as const, budgetLimitCents: 100 };
const stats = { status: "partial", scheduled: 3, completed: 1, failed: 1, pending: 1, syntheticFallback: 1,
  reportedNanoUsd: 12_345, reservedNanoUsd: 40_000, unknownCostAttempts: 1, stopReason: "cost_unknown" };

it("execution money: operator USD amounts become exact integer cents without binary rounding", () => {
  for (const [usd, cents] of [["0", 0], ["0.01", 1], ["0.29", 29], ["1.1", 110], ["1000.00", 100_000]] as const) {
    expect(parseUsdCents(usd)).toBe(cents);
    expect(parseUsdCents(formatUsdCents(cents))).toBe(cents);
  }
});

it("execution money: invalid precision signs exponent coercion and excessive targets are refused", () => {
  for (const input of ["", " 1", "1 ", "+1", "-0.01", "1e2", ".01", "01", "1,00", "0.001", "1000.01", "NaN"]) {
    expect(() => parseUsdCents(input)).toThrow("invalid_usd_amount");
  }
  expect(() => parseUsdCents(1 as unknown as string)).toThrow();
});

it("execution money: reported decimal and scientific USD retain conservative nano precision", () => {
  expect(usdToNanoUsd("0.000000001")).toBe(1);
  expect(usdToNanoUsd("0.0000000001")).toBe(1);
  expect(usdToNanoUsd("0.0000000011")).toBe(2);
  expect(usdToNanoUsd("1.0000000001")).toBe(1_000_000_001);
  expect(usdToNanoUsd(1e-7)).toBe(100);
  expect(usdToNanoUsd("0")).toBe(0);
});

it("execution money: malformed or overflowing costs cannot become free observations", () => {
  for (const value of [-1, Infinity, NaN, "-1", "", "USD 1", "0x10", "1000000000000000000"] as const) {
    expect(() => usdToNanoUsd(value)).toThrow();
  }
  expect(() => sumNanoUsd(Number.MAX_SAFE_INTEGER, 1)).toThrow("cost_overflow");
  expect(nanoUsdToCents(1)).toBe(1);
  expect(nanoUsdToCents(10_000_000)).toBe(1);
  expect(nanoUsdToCents(10_000_001)).toBe(2);
});

it("execution admission: known cost outstanding reservations and next estimate all consume the target", () => {
  expect(canReserveBudget(1, 2_000_000, 3_000_000, 5_000_000)).toBe(true);
  expect(canReserveBudget(1, 2_000_000, 3_000_000, 5_000_001)).toBe(false);
  expect(canReserveBudget(0, 0, 0, 0)).toBe(false);
  expect(() => canReserveBudget(100_001, 0, 0, 0)).toThrow();
});

it("execution profiles: depth changes bounded requested work without changing the fixed time limits", () => {
  const profiles = (["quick", "standard", "deep"] as const).map(depth => createExecutionPolicy({ engine: "gateway", depth, modelId: "authored/model", budgetLimitCents: 1 }));
  expect(profiles.map(value => value.maxOutputTokens)).toEqual([2048, 4096, 8192]);
  expect(profiles.every(value => value.callTimeoutMs === CALL_TIMEOUT_MS && value.runTimeoutMs === RUN_TIMEOUT_MS)).toBe(true);
  expect(CALL_TIMEOUT_MS).toBe(60_000); expect(RUN_TIMEOUT_MS).toBe(240_000);
  expect(new Set(Object.values(DEPTH_PROFILES).map(value => value.instruction)).size).toBe(3);
});

it("execution policy: free and explicit Gateway requests never silently substitute engines", () => {
  const demo = createExecutionPolicy({ engine: "fake", depth: "deep", modelId: null, budgetLimitCents: 0 });
  expect(demo).toMatchObject({ engine: "fake", budgetMode: "free-demo", modelId: null, budgetLimitCents: 0 });
  expect(() => createExecutionPolicy({ engine: "gateway", depth: "standard", modelId: "authored/model", budgetLimitCents: 0 })).toThrow();
  expect(() => createExecutionPolicy({ engine: "fake", depth: "standard", modelId: null, budgetLimitCents: 1 })).toThrow();
  expect(() => createExecutionPolicy({ engine: "gateway", depth: "standard", modelId: null, budgetLimitCents: 1 })).toThrow();
});

it("execution policy: legacy contradictory or accessor-backed controls cannot gain paid permission", () => {
  const original = policy();
  for (const value of [null, {}, { ...original, version: 2 }, { ...original, maxOutputTokens: 999 },
    { ...original, runTimeoutMs: 999999 }, { ...original, budgetMode: "hard-cap" }, Object.create(original)]) {
    expect(readExecutionPolicy(value)).toBeNull();
  }
  let read = 0;
  const accessor = Object.defineProperty({ ...original }, "budgetLimitCents", { get: () => { read++; return 1; } });
  expect(readExecutionPolicy(accessor)).toBeNull(); expect(read).toBe(0);
});

it("execution policy: a private server extension is projected to policy fields without leaking its grant", () => {
  const value = { ...policy(), admissionGrant: "authored-private-grant", claim: { id: "authored-claim" } };
  expect(readExecutionPolicy(value)).toEqual(policy());
  expect(JSON.stringify(readExecutionPolicy(value))).not.toContain("private-grant");
});

it("execution intent: property order is canonical while changed or reordered cohorts stay distinct", () => {
  const second = "44444444-4444-4444-8444-444444444444";
  const selected = { ...intent, personaIds: [...intent.personaIds, second], agentCount: 2 };
  expect(canonicalSimulationInput(selected)).toBe(canonicalSimulationInput(Object.fromEntries(Object.entries(selected).reverse()) as typeof selected));
  expect(canonicalSimulationInput(selected)).not.toBe(canonicalSimulationInput({ ...selected, personaIds: [...selected.personaIds].reverse() }));
  expect(canonicalSimulationInput(selected)).not.toBe(canonicalSimulationInput({ ...selected, depth: "deep" }));
  expect(canonicalSimulationInput(selected)).not.toBe(canonicalSimulationInput({ ...selected, requestId: second }));
});

it("execution intent: an empty sparse duplicate or mismatched cohort is not silently repaired", () => {
  for (const selected of [{ ...intent, personaIds: [] }, { ...intent, personaIds: new Array(1) },
    { ...intent, personaIds: [...intent.personaIds, ...intent.personaIds], agentCount: 2 }, { ...intent, agentCount: 2 }]) {
    expect(() => canonicalSimulationInput(selected)).toThrow("invalid_simulation_intent");
  }
});

it("execution pricing: optional cache rates and exact decimal rounding remain in a detached snapshot", () => {
  const value = pricing();
  expect(value.inputNanoUsdPerToken).toBe(3000);
  expect(value.outputNanoUsdPerToken).toBe(2000);
  expect(value.inputUsdPerToken).toBe("0.000001");
  expect(value.cacheCreationInputUsdPerToken).toBe("0.000003");
  expect(Object.isFrozen(value)).toBe(true);
  expect(readGatewayPricingSnapshot(JSON.parse(JSON.stringify(value)))).toEqual(value);
  expect(readGatewayPricingSnapshot({ ...value, inputNanoUsdPerToken: 1 })).toBeNull();
});

it("execution pricing: missing malformed or unbound catalogue rates block estimation", () => {
  for (const raw of [null, {}, { input: "0.1" }, { input: 1, output: "0.1" }, { input: "-1", output: "0.1" }]) {
    expect(() => createGatewayPricingSnapshot({ modelId: "authored/model", observedAt: "2026-11-05T00:00:00.000Z", pricing: raw })).toThrow();
  }
  expect(() => estimateGatewayReservation(policy(), { ...pricing(), modelId: "other/model" }, "authored")).toThrow();
});

it("execution reservation: bounded UTF8 input and maximum output contribute without mutating source records", () => {
  const controls = policy(), rates = pricing(), before = JSON.stringify({ controls, rates });
  const reservation = estimateGatewayReservation(controls, rates, "é");
  expect(reservation).toEqual({ estimatedInputTokens: 2, maxOutputTokens: 4096, estimatedNanoUsd: 2 * 3000 + 4096 * 2000 });
  expect(JSON.stringify({ controls, rates })).toBe(before);
  expect(() => estimateGatewayReservation(controls, rates, "x".repeat(262_145))).toThrow("gateway_prompt_limit");
});

it("execution summary: partial coverage separates synthetic fallback known charges and unknown reservations", () => {
  const summary = summarizeExecutionControls({ ...policy(), admissionGrant: "authored-secret", attempts: ["private"] }, stats);
  expect(summary).toMatchObject({ recorded: true, budgetMode: "estimated-target", coverage: { scheduled: 3, completed: 1, failed: 1, pending: 1, syntheticFallback: 1 },
    reportedCostCents: 1, reservedCostCents: 1, unknownCostAttempts: 1, stopReason: "cost_unknown" });
  expect(summary.qualification).toContain("not a hard billing ceiling");
  expect(JSON.stringify(summary)).not.toMatch(/authored-secret|attempts/);
});

it("execution summary: historical records gain no controls and hostile reasons become finite public codes", () => {
  const summary = summarizeExecutionControls(null, { ...stats, stopReason: "secret path /private/authored" });
  expect(summary).toMatchObject({ recorded: false, engine: null, depth: null, budgetLimitCents: null, budgetMode: "unrecorded", stopReason: "execution_stopped" });
  expect(summary.qualification).toContain("Historical controls are unrecorded");
  expect(() => summarizeExecutionControls(policy(), { ...stats, completed: 3 })).toThrow("invalid_execution_summary");
});
