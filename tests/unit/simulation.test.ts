import { describe, expect, it } from "vitest";
import {
  buildFakeAgentResult,
  buildScoreBreakdown,
  type BriefSnapshot,
  type PersonaSnapshot,
  type SimulationContext,
  type SourceSnapshot,
} from "@/lib/server/services/simulation-service";

const brief: BriefSnapshot = {
  productName: "SignalForge LaunchOS",
  category: "Product marketing",
  icp: "B2B product teams preparing launches",
  market: "US SaaS",
  expectedPrice: "$299 per month",
  positioningStatement:
    "A clear workflow to simulate buyer perception before a launch using evidence, proof, and traceable feedback.",
  notes: "Includes security posture, customer proof, implementation checklist, and pricing validation.",
};

const sources: SourceSnapshot[] = [
  {
    id: "src_1",
    kind: "product",
    title: "Launch brief",
    url: null,
    contentHash: "hash",
    extractedText:
      "The launch must prove clear value, security readiness, privacy review, customer evidence, and faster workflow decisions.",
  },
];

const personas: PersonaSnapshot[] = [
  {
    id: "persona_1",
    name: "Budget-conscious buyer",
    role: "Economic evaluator",
    description: "Focuses on price, payback, and switching risk.",
    evaluationLens: "Will this justify spend now?",
  },
  {
    id: "persona_2",
    name: "Enterprise security/compliance reviewer",
    role: "Security reviewer",
    description: "Looks for controls, trust, and implementation risk.",
    evaluationLens: "Can this pass review?",
  },
];
const simulationContext: SimulationContext = Object.freeze({ targetMarket: "Independent bookshops" });

describe("deterministic simulation", () => {
  it("runs fake agents concurrently and aggregates score components", async () => {
    const results = await Promise.all(
      personas.map((persona) => Promise.resolve(buildFakeAgentResult(brief, sources, persona, simulationContext))),
    );
    const scores = buildScoreBreakdown(results);

    expect(results).toHaveLength(2);
    expect(results[0]?.evidenceReferences[0]?.sourceId).toBe("src_1");
    expect(scores.launchReadiness).toBeGreaterThan(0);
    expect(scores.positioningClarity).toBeGreaterThan(0);
    expect(scores.pricingFit).toBeLessThanOrEqual(100);
    expect(scores.negativeFeedbackRisk).toBeGreaterThanOrEqual(0);
  });

  it("retains the selected market in deterministic fake results without rewriting brief facts or evidence", () => {
    const partialBrief = { ...brief, market: "" };
    const originalBrief = structuredClone(partialBrief);
    const originalSources = structuredClone(sources);
    const persona = personas[0]!;
    const first = buildFakeAgentResult(partialBrief, sources, persona, simulationContext);
    const repeated = buildFakeAgentResult(partialBrief, sources, persona, simulationContext);
    const otherMarket = buildFakeAgentResult(partialBrief, sources, persona, { targetMarket: "Enterprise security buyers" });

    expect(first).toEqual(repeated);
    expect(first.recommendation).toContain('operator-selected market "Independent bookshops"');
    expect(otherMarket.recommendation).toContain('operator-selected market "Enterprise security buyers"');
    expect(otherMarket).not.toEqual(first);
    expect(first.evidenceReferences).toEqual(otherMarket.evidenceReferences);
    expect(first.evidenceReferences[0]?.quote).toBe(sources[0]?.extractedText.slice(0, 260));
    const escapedMarket = "\u0001".repeat(180);
    const boundaryResult = buildFakeAgentResult(partialBrief, sources, persona, { targetMarket: escapedMarket });
    expect(boundaryResult.recommendation).toContain(JSON.stringify(escapedMarket));
    expect(boundaryResult.recommendation.length).toBeLessThanOrEqual(1_200);
    expect(partialBrief).toEqual(originalBrief);
    expect(sources).toEqual(originalSources);
  });
});
