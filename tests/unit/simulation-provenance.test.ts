import { expect, it } from "vitest";
import {
  bindSimulationProvenanceToOutputs,
  deriveAgentProvenance,
  formatSimulationProvenanceMarkdown,
  summarizeSimulationProvenance,
  type AgentProvenance,
} from "@/lib/shared/simulation-provenance";

const findingId = "11111111-1111-4111-8111-111111111111";
const otherFindingId = "22222222-2222-4222-8222-222222222222";
const scoreId = "33333333-3333-4333-8333-333333333333";
const reportId = "44444444-4444-4444-8444-444444444444";
const result = {
  perceivedValueScore: 67, clarityScore: 72, differentiationScore: 61,
  urgencyScore: 58, trustScore: 66, adoptionLikelihood: 64, priceSensitivity: 42,
  likelyObjections: ["Authored objection"], likelyPositiveComments: ["Authored positive"],
  confusingClaims: [], missingProof: ["Customer evidence"], bestQuote: "Authored best",
  worstQuote: "Authored worst", recommendation: "Authored recommendation", confidence: 73,
  evidenceReferences: [],
};
const finding = { id: findingId, result };
function stamp(origin: string, configuredEngine = "gateway", id = findingId) {
  return { eventType: "judgment", metadata: { executionOrigin: {
    version: 1, findingId: id, origin, configuredEngine,
  } } };
}
const legacyFallback = { eventType: "fallback", metadata: { fallback: true } };
const gateway = () => deriveAgentProvenance("gateway", finding, [stamp("gateway")]);
const fake = () => deriveAgentProvenance("fake", finding, [stamp("fake", "fake")]);
const fallback = () => deriveAgentProvenance("gateway", finding, [stamp("gateway-fallback")]);
const unknown = () => deriveAgentProvenance("gateway", finding, []);
const pending = () => deriveAgentProvenance("gateway", null, []);
function freeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    for (const item of Object.values(value)) freeze(item);
    Object.freeze(value);
  }
  return value;
}
function binding(summary: ReturnType<typeof summarizeSimulationProvenance>, ids = [findingId]) {
  return { version: 1, configuredEngine: summary.configuredEngine, scoreId, reportId,
    findingIds: ids, summary: structuredClone(summary) };
}

it("simulation provenance: a selected finding needs its own matching Gateway judgment stamp", () => {
  expect(gateway()).toMatchObject({ origin: "gateway" });
  expect(gateway().label.trim()).not.toBe("");
  expect(gateway().qualification.trim()).not.toBe("");
});

it("simulation provenance: explicitly bound fake findings stay synthetic", () => {
  expect(fake()).toMatchObject({ origin: "fake" });
  expect(fake().qualification.trim()).not.toBe("");
});

it("simulation provenance: a bound Gateway failure is distinguished from a Gateway judgment", () => {
  expect(fallback()).toMatchObject({ origin: "gateway-fallback" });
  expect(fallback()).not.toEqual(gateway());
});

it("simulation provenance: configured Gateway alone never establishes a completed result origin", () => {
  expect(unknown().origin).toBe("unknown");
  expect(deriveAgentProvenance("gateway", finding, [{ eventType: "context", metadata: { scores: result } }]).origin).toBe("unknown");
});

it("simulation provenance: historical fake-engine findings retain qualified synthetic provenance", () => {
  const provenance = deriveAgentProvenance("fake", finding, []);
  expect(provenance.origin).toBe("fake");
  expect(provenance.qualification.trim()).not.toBe("");
});

it("simulation provenance: an unbound historical fallback event does not identify the selected finding", () => {
  const provenance = deriveAgentProvenance("gateway", finding, [legacyFallback]);
  expect(provenance.origin).toBe("unknown");
  expect(provenance.qualification).toMatch(/fallback/i);
});

it("simulation provenance: judgments attached to another finding cannot promote this finding", () => {
  expect(deriveAgentProvenance("gateway", finding, [stamp("gateway", "gateway", otherFindingId)]).origin).toBe("unknown");
  expect(deriveAgentProvenance("gateway", finding, [stamp("gateway-fallback", "gateway", otherFindingId), stamp("gateway")]).origin).toBe("gateway");
});

it("simulation provenance: selected finding proof is not replaced by an unbound fallback from another attempt", () => {
  expect(deriveAgentProvenance("gateway", finding, [legacyFallback, stamp("gateway")]).origin).toBe("gateway");
});

it("simulation provenance: duplicate matching stamps are ambiguous even when their values agree", () => {
  expect(deriveAgentProvenance("gateway", finding, [stamp("gateway"), stamp("gateway")]).origin).toBe("unknown");
});

it("simulation provenance: conflicting selected-finding origins are never resolved by event order", () => {
  for (const events of [[stamp("gateway"), stamp("gateway-fallback")], [stamp("gateway-fallback"), stamp("gateway")]]) {
    expect(deriveAgentProvenance("gateway", finding, events).origin).toBe("unknown");
  }
});

it("simulation provenance: malformed versions origins and configured-engine contradictions reject positive attribution", () => {
  const executionOrigin = stamp("gateway").metadata.executionOrigin;
  for (const changed of [
    { ...executionOrigin, version: 2 }, { ...executionOrigin, version: "1" },
    { ...executionOrigin, origin: "pending" }, { ...executionOrigin, origin: "real" },
    { ...executionOrigin, configuredEngine: "fake" }, { ...executionOrigin, origin: "fake" },
  ]) {
    expect(deriveAgentProvenance("gateway", finding, [{ eventType: "judgment", metadata: { executionOrigin: changed } }]).origin).toBe("unknown");
  }
  expect(deriveAgentProvenance("fake", finding, [stamp("gateway", "fake")]).origin).toBe("unknown");
  expect(deriveAgentProvenance("gateway", finding, [{ ...stamp("gateway"), eventType: "context" }]).origin).toBe("unknown");
});

it("simulation provenance: malformed unbound origin records cannot piggyback on valid selected-finding proof", () => {
  for (const executionOrigin of [null, [], "gateway", { version: 1, origin: "gateway" }, { version: 1, findingId: "", origin: "gateway" }]) {
    expect(deriveAgentProvenance("gateway", finding, [stamp("gateway"), { eventType: "judgment", metadata: { executionOrigin } }]).origin).toBe("unknown");
  }
});

it("simulation provenance: absent findings remain pending regardless of stale judgment events", () => {
  expect(deriveAgentProvenance("gateway", null, [stamp("gateway")]).origin).toBe("pending");
  expect(deriveAgentProvenance("fake", null, []).origin).toBe("pending");
});

it("simulation provenance: malformed finding results cannot inherit a positive engine label", () => {
  expect(deriveAgentProvenance("gateway", { id: findingId, result: null }, [stamp("gateway")]).origin).toBe("unknown");
  expect(deriveAgentProvenance("fake", { id: findingId, result: null }, []).origin).toBe("unknown");
});

it("simulation provenance: unknown historical engine names do not become Gateway evidence", () => {
  expect(deriveAgentProvenance("legacy-hosted", finding, []).origin).toBe("unknown");
});

it("simulation provenance: classification leaves scores evidence and event metadata unchanged", () => {
  const selected = freeze(structuredClone(finding));
  const events = freeze([stamp("gateway"), stamp("gateway-fallback", "gateway", otherFindingId)]);
  const before = JSON.stringify({ selected, events });
  expect(deriveAgentProvenance("gateway", selected, events).origin).toBe("gateway");
  expect(JSON.stringify({ selected, events })).toBe(before);
});

it("simulation provenance: a complete Gateway cohort counts every independently derived judgment", () => {
  const summary = summarizeSimulationProvenance("gateway", [gateway(), gateway()]);
  expect(summary).toMatchObject({ version: 1, configuredEngine: "gateway", kind: "gateway",
    counts: { gateway: 2, fake: 0, fallback: 0, unknown: 0, pending: 0 } });
});

it("simulation provenance: explicit fake and Gateway fallback findings are both synthetic without collapsing their counts", () => {
  const summary = summarizeSimulationProvenance("gateway", [fake(), fallback()]);
  expect(summary).toMatchObject({ kind: "synthetic", counts: { gateway: 0, fake: 1, fallback: 1, unknown: 0, pending: 0 } });
});

it("simulation provenance: mixed Gateway and fallback output cannot be advertised as all Gateway", () => {
  const summary = summarizeSimulationProvenance("gateway", [gateway(), fallback(), gateway()]);
  expect(summary).toMatchObject({ kind: "mixed", counts: { gateway: 2, fake: 0, fallback: 1, unknown: 0, pending: 0 } });
});

it("simulation provenance: unknown and pending findings remain visible in aggregate accounting", () => {
  const summary = summarizeSimulationProvenance("gateway", [gateway(), unknown(), pending()]);
  expect(summary.counts).toEqual({ gateway: 1, fake: 0, fallback: 0, unknown: 1, pending: 1 });
  expect(summary.kind).not.toBe("gateway");
});

it("simulation provenance: an empty cohort is pending rather than evidence of successful Gateway execution", () => {
  const summary = summarizeSimulationProvenance("gateway", []);
  expect(summary).toMatchObject({ kind: "pending", counts: { gateway: 0, fake: 0, fallback: 0, unknown: 0, pending: 0 } });
});

it("simulation provenance: exported Markdown retains the derived origin label and its qualification", () => {
  for (const origins of [[gateway(), fallback()], [fake()], [unknown()], [pending()]] satisfies AgentProvenance[][]) {
    const summary = summarizeSimulationProvenance("gateway", origins);
    const markdown = formatSimulationProvenanceMarkdown(summary);
    expect(markdown).toContain(summary.label);
    expect(markdown).toContain(summary.qualification);
  }
});

it("simulation provenance: aggregate binding accepts only the exact output identities with order-independent finding membership", () => {
  const summary = summarizeSimulationProvenance("gateway", [gateway(), fallback()]);
  const record = binding(summary, [findingId, otherFindingId]);
  const verified = bindSimulationProvenanceToOutputs(summary, { record, scoreId, reportId, findingIds: [otherFindingId, findingId] });
  expect(verified).toMatchObject({ kind: "mixed", outputLineage: "matched", counts: summary.counts });
});

it("simulation provenance: missing duplicated or mismatched selected outputs cannot borrow another attempt origin", () => {
  const summary = summarizeSimulationProvenance("gateway", [gateway()]);
  const record = binding(summary);
  for (const selected of [
    { record, scoreId: otherFindingId, reportId, findingIds: [findingId] },
    { record, scoreId, reportId: otherFindingId, findingIds: [findingId] },
    { record, scoreId: null, reportId, findingIds: [findingId] },
    { record, scoreId, reportId: null, findingIds: [findingId] },
    { record, scoreId, reportId, findingIds: [otherFindingId] },
    { record, scoreId, reportId, findingIds: [findingId, findingId] },
    { record, scoreId, reportId, findingIds: [] },
  ]) {
    expect(bindSimulationProvenanceToOutputs(summary, selected)).toMatchObject({ kind: "unknown", outputLineage: "unverified", counts: summary.counts });
  }
});

it("simulation provenance: output identities alone do not validate a contradictory recorded summary", () => {
  const summary = summarizeSimulationProvenance("gateway", [gateway()]);
  const original = binding(summary);
  for (const record of [
    { ...original, version: 2 }, { ...original, configuredEngine: "fake" },
    { ...original, summary: { ...original.summary, kind: "synthetic" } },
    { ...original, summary: { ...original.summary, counts: { ...original.summary.counts, fallback: 1 } } },
    { ...original, findingIds: [findingId, findingId] },
  ]) {
    expect(bindSimulationProvenanceToOutputs(summary, { record, scoreId, reportId, findingIds: [findingId] })).toMatchObject({ kind: "unknown", outputLineage: "unverified" });
  }
});

it("simulation provenance: absent legacy output binding preserves persona counts but qualifies aggregate origin", () => {
  const summary = summarizeSimulationProvenance("fake", [fake()]);
  expect(bindSimulationProvenanceToOutputs(summary, { record: undefined, scoreId, reportId, findingIds: [findingId] }))
    .toMatchObject({ kind: "unknown", outputLineage: "unverified", counts: { gateway: 0, fake: 1, fallback: 0, unknown: 0, pending: 0 } });
  const empty = summarizeSimulationProvenance("gateway", []);
  expect(bindSimulationProvenanceToOutputs(empty, { record: null, scoreId: null, reportId: null, findingIds: [] }).kind).toBe("pending");
});

it("simulation provenance: output binding never mutates its summaries or immutable receipt", () => {
  const summary = freeze(summarizeSimulationProvenance("gateway", [gateway()]));
  const selected = freeze({ record: binding(summary), scoreId, reportId, findingIds: [findingId] });
  const before = JSON.stringify({ summary, selected });
  expect(bindSimulationProvenanceToOutputs(summary, selected).outputLineage).toBe("matched");
  expect(JSON.stringify({ summary, selected })).toBe(before);
});
