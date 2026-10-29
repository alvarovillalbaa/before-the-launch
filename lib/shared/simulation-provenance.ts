export type GeneratedResultOrigin = "gateway" | "fake" | "gateway-fallback";
export type AgentResultOrigin = GeneratedResultOrigin | "unknown" | "pending";

export type AgentProvenance = {
  origin: AgentResultOrigin;
  label: string;
  qualification: string;
};

export type SimulationProvenance = {
  version: 1;
  configuredEngine: string;
  counts: { gateway: number; fake: number; fallback: number; unknown: number; pending: number };
  kind: "gateway" | "synthetic" | "mixed" | "unknown" | "pending";
  outputLineage: "matched" | "unverified";
  label: string;
  qualification: string;
};

type Finding = { id: string; result: unknown };
type TraceEvent = { eventType: string; metadata: Record<string, unknown> | null };

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function unknownOrigin(reason: string): AgentProvenance {
  return {
    origin: "unknown",
    label: "Origin unverified",
    qualification: `${reason} Review the trace before using this finding; the configured engine does not prove how it was generated.`,
  };
}

function describeOrigin(origin: GeneratedResultOrigin): AgentProvenance {
  if (origin === "gateway") {
    return {
      origin,
      label: "AI Gateway",
      qualification: "AI-generated simulated persona output, not an observed customer response or validated market prediction.",
    };
  }
  if (origin === "gateway-fallback") {
    return {
      origin,
      label: "Synthetic fallback",
      qualification: "AI Gateway failed and this finding uses deterministic synthetic demo output. Its scores and recommendations are demo content, not observed customer reactions.",
    };
  }
  return {
    origin,
    label: "Synthetic demo",
    qualification: "Deterministic synthetic demo output. These scores do not establish market fit or observed customer reactions.",
  };
}

export function deriveAgentProvenance(
  configuredEngine: string,
  finding: Finding | null,
  events: readonly TraceEvent[],
): AgentProvenance {
  if (finding == null) {
    return { origin: "pending", label: "Pending", qualification: "No saved finding is available for this persona yet." };
  }
  if (!finding.id || !record(finding.result)) return unknownOrigin("The saved finding is incomplete.");
  if (configuredEngine !== "gateway" && configuredEngine !== "fake") {
    return unknownOrigin("The configured engine is not recognized.");
  }

  const matching: { eventType: string; stamp: Record<string, unknown> }[] = [];
  let malformedUnboundStamp = false;
  let legacyFallback = false;
  for (const event of events) {
    const metadata = event.metadata;
    if (event.eventType === "fallback" || metadata?.fallback === true) legacyFallback = true;
    if (!metadata || !Object.prototype.hasOwnProperty.call(metadata, "executionOrigin")) continue;
    const stamp = metadata.executionOrigin;
    if (!record(stamp) || typeof stamp.findingId !== "string" || !stamp.findingId) {
      malformedUnboundStamp = true;
      continue;
    }
    // A different attempt's stamp cannot identify the selected saved finding.
    if (stamp.findingId === finding.id) matching.push({ eventType: event.eventType, stamp });
  }
  if (malformedUnboundStamp) return unknownOrigin("An origin record is malformed and cannot be bound to the saved finding.");
  if (matching.length > 1) return unknownOrigin("Multiple origin records match this saved finding, so its origin is ambiguous.");
  if (matching.length === 1) {
    const { eventType, stamp } = matching[0];
    if (eventType !== "judgment" || stamp.version !== 1 || stamp.configuredEngine !== configuredEngine
      || (stamp.origin !== "gateway" && stamp.origin !== "fake" && stamp.origin !== "gateway-fallback")
      || (configuredEngine === "fake" && stamp.origin !== "fake")
      || (configuredEngine === "gateway" && stamp.origin === "fake")) {
      return unknownOrigin("The matching origin record is invalid or contradicts the configured engine.");
    }
    return describeOrigin(stamp.origin);
  }
  if (configuredEngine === "fake") return describeOrigin("fake");
  return unknownOrigin(legacyFallback
    ? "A fallback was recorded for this persona, but it is not bound to the selected saved finding."
    : "This saved finding has no matching execution-origin record.");
}

export function summarizeSimulationProvenance(
  configuredEngine: string,
  origins: readonly AgentProvenance[],
): SimulationProvenance {
  const counts = { gateway: 0, fake: 0, fallback: 0, unknown: 0, pending: 0 };
  for (const entry of origins) {
    if (entry.origin === "gateway-fallback") counts.fallback += 1;
    else if (entry.origin === "gateway" || entry.origin === "fake" || entry.origin === "pending") counts[entry.origin] += 1;
    else counts.unknown += 1;
  }
  const synthetic = counts.fake + counts.fallback;
  let kind: SimulationProvenance["kind"], label: string, qualification: string;
  if (counts.unknown) {
    kind = "unknown"; label = "Persona findings include unverified origins";
    qualification = "Some saved persona findings have no unambiguous origin record. Review their provenance and traces before using the scores.";
  } else if (counts.gateway && synthetic) {
    kind = "mixed"; label = "Mixed Gateway and synthetic persona findings";
    qualification = "These persona findings combine AI Gateway output with deterministic synthetic demo content. Synthetic scores and recommendations are not observed customer reactions.";
  } else if (synthetic) {
    kind = "synthetic"; label = "Synthetic demo persona findings";
    qualification = "These persona findings are deterministic synthetic demo output, including any Gateway fallbacks. They do not establish market fit or observed customer reactions.";
  } else if (counts.gateway) {
    kind = "gateway"; label = "AI Gateway persona findings";
    qualification = "These persona findings are AI-generated simulations, not observed customer responses or validated market predictions.";
  } else {
    kind = "pending"; label = "Awaiting saved persona findings";
    qualification = "No saved persona finding is available to attribute yet.";
  }
  if (counts.pending) qualification += ` ${counts.pending} persona(s) have no saved finding yet.`;
  return { version: 1, configuredEngine, counts, kind, outputLineage: "unverified", label, qualification };
}

type OutputBinding = {
  record: unknown;
  scoreId: string | null;
  reportId: string | null;
  findingIds: readonly string[];
};

export function bindSimulationProvenanceToOutputs(
  summary: SimulationProvenance,
  binding: OutputBinding,
): SimulationProvenance {
  const saved = binding.record;
  const resultCount = summary.counts.gateway + summary.counts.fake + summary.counts.fallback + summary.counts.unknown;
  const ids = binding.findingIds;
  let matches = false;
  if (binding.scoreId && binding.reportId && record(saved) && saved.version === 1
    && saved.configuredEngine === summary.configuredEngine
    && saved.scoreId === binding.scoreId && saved.reportId === binding.reportId
    && Array.isArray(saved.findingIds) && ids.length > 0 && ids.length === resultCount
    && summary.counts.pending === 0 && ids.every((id) => typeof id === "string" && id.length > 0)
    && new Set(ids).size === ids.length && saved.findingIds.every((id) => typeof id === "string" && id.length > 0)
    && new Set(saved.findingIds).size === saved.findingIds.length
    && JSON.stringify([...ids].sort()) === JSON.stringify([...saved.findingIds].sort())
    && record(saved.summary) && saved.summary.version === 1
    && saved.summary.configuredEngine === summary.configuredEngine && saved.summary.kind === summary.kind
    && record(saved.summary.counts)) {
    const counts = saved.summary.counts;
    matches = (Object.keys(summary.counts) as (keyof SimulationProvenance["counts"])[])
      .every((key) => counts[key] === summary.counts[key]);
  }
  if (!matches) {
    return {
      ...summary,
      kind: resultCount === 0 && !binding.scoreId && !binding.reportId ? "pending" : "unknown",
      outputLineage: "unverified",
      label: "Aggregate origin unverified",
      qualification: "These counts describe the displayed persona findings only. Their lineage to the saved aggregate scores and report is unverified; do not attribute those outputs to the configured engine. " + summary.qualification,
    };
  }
  return {
    ...summary,
    outputLineage: "matched",
    label: summary.kind === "gateway" ? "AI Gateway simulation results"
      : summary.kind === "synthetic" ? "Synthetic demo simulation results"
      : summary.kind === "mixed" ? "Mixed Gateway and synthetic simulation results"
      : summary.label,
    qualification: "The saved scores and report match this recorded finding composition. " + summary.qualification
      + " Matching provenance does not validate the model's judgments or the market.",
  };
}

export function formatSimulationProvenanceMarkdown(summary: SimulationProvenance): string {
  return [
    "## Simulation provenance",
    "",
    `Configured engine: ${JSON.stringify(summary.configuredEngine)}`,
    `Result composition: ${summary.label}`,
    `Aggregate/report lineage: ${summary.outputLineage === "matched" ? "Matched to the recorded finding set" : "Unverified"}`,
    "",
    `- AI Gateway findings: ${summary.counts.gateway}`,
    `- Synthetic demo findings: ${summary.counts.fake}`,
    `- Synthetic fallback findings: ${summary.counts.fallback}`,
    `- Unknown-origin findings: ${summary.counts.unknown}`,
    `- Personas without a saved finding: ${summary.counts.pending}`,
    "",
    summary.qualification,
  ].join("\n");
}
