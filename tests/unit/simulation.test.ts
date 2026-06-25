import { describe, expect, it } from "vitest";
import {
  buildFakeAgentResult,
  buildScoreBreakdown,
  type BriefSnapshot,
  type PersonaSnapshot,
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

describe("deterministic simulation", () => {
  it("runs fake agents concurrently and aggregates score components", async () => {
    const results = await Promise.all(
      personas.map((persona) => Promise.resolve(buildFakeAgentResult(brief, sources, persona))),
    );
    const scores = buildScoreBreakdown(results);

    expect(results).toHaveLength(2);
    expect(results[0]?.evidenceReferences[0]?.sourceId).toBe("src_1");
    expect(scores.launchReadiness).toBeGreaterThan(0);
    expect(scores.positioningClarity).toBeGreaterThan(0);
    expect(scores.pricingFit).toBeLessThanOrEqual(100);
    expect(scores.negativeFeedbackRisk).toBeGreaterThanOrEqual(0);
  });
});
