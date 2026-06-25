import { z } from "zod";

export const sourceKinds = [
  "product",
  "company",
  "previous_launch",
  "competitor",
  "pricing",
  "support",
  "customer_research",
  "brand",
  "other",
] as const;

export const runStatuses = [
  "queued",
  "running",
  "partial",
  "completed",
  "failed",
] as const;

export const sourceStatuses = [
  "pending",
  "processing",
  "ready",
  "failed",
  "deleted",
] as const;

export const depthOptions = ["quick", "standard", "deep"] as const;

export const ProductBriefInputSchema = z.object({
  productName: z.string().min(1).max(160),
  category: z.string().min(1).max(120),
  icp: z.string().min(1).max(500),
  market: z.string().min(1).max(160),
  expectedPrice: z.string().min(1).max(120),
  competitors: z.string().max(1000).optional().default(""),
  launchChannel: z.string().min(1).max(160),
  positioningStatement: z.string().min(1).max(1200),
  notes: z.string().max(4000).optional().default(""),
});

export const SourceCreateInputSchema = z.object({
  projectId: z.string().uuid(),
  kind: z.enum(sourceKinds),
  inputType: z.enum(["url", "text", "file"]),
  title: z.string().min(1).max(220).optional(),
  url: z.string().url().optional(),
  text: z.string().max(200_000).optional(),
});

export const SimulationSetupInputSchema = z.object({
  projectId: z.string().uuid(),
  targetMarket: z.string().min(1).max(180),
  personaIds: z.array(z.string().uuid()).min(1).max(10).optional(),
  agentCount: z.number().int().min(1).max(10).default(8),
  depth: z.enum(depthOptions).default("standard"),
  budgetLimitCents: z.number().int().min(0).max(100_000).default(0),
});

export const EvidenceReferenceSchema = z.object({
  sourceId: z.string(),
  sourceTitle: z.string(),
  quote: z.string().max(600),
  relevance: z.string().max(300),
});

export const AgentResultSchema = z.object({
  perceivedValueScore: z.number().min(0).max(100),
  clarityScore: z.number().min(0).max(100),
  differentiationScore: z.number().min(0).max(100),
  urgencyScore: z.number().min(0).max(100),
  trustScore: z.number().min(0).max(100),
  adoptionLikelihood: z.number().min(0).max(100),
  priceSensitivity: z.number().min(0).max(100),
  likelyObjections: z.array(z.string()).min(1).max(8),
  likelyPositiveComments: z.array(z.string()).min(1).max(8),
  confusingClaims: z.array(z.string()).max(8),
  missingProof: z.array(z.string()).max(8),
  bestQuote: z.string().min(1).max(500),
  worstQuote: z.string().min(1).max(500),
  recommendation: z.string().min(1).max(1200),
  confidence: z.number().min(0).max(100),
  evidenceReferences: z.array(EvidenceReferenceSchema).max(10),
});

export const ScoreBreakdownSchema = z.object({
  launchReadiness: z.number().min(0).max(100),
  marketClarity: z.number().min(0).max(100),
  positioningClarity: z.number().min(0).max(100),
  differentiation: z.number().min(0).max(100),
  trust: z.number().min(0).max(100),
  urgency: z.number().min(0).max(100),
  adoptionLikelihood: z.number().min(0).max(100),
  pricingFit: z.number().min(0).max(100),
  negativeFeedbackRisk: z.number().min(0).max(100),
  supportBurden: z.number().min(0).max(100),
  salesFriction: z.number().min(0).max(100),
  viralityShareability: z.number().min(0).max(100),
  enterpriseReadiness: z.number().min(0).max(100).nullable(),
});

export const RecommendationSchema = z.object({
  area: z.enum(["product", "pricing", "messaging", "gtm"]),
  priority: z.enum(["high", "medium", "low"]),
  title: z.string().min(1).max(160),
  rationale: z.string().min(1).max(1200),
  suggestedChange: z.string().min(1).max(1200),
});

export type ProductBriefInput = z.infer<typeof ProductBriefInputSchema>;
export type SourceCreateInput = z.infer<typeof SourceCreateInputSchema>;
export type SimulationSetupInput = z.infer<typeof SimulationSetupInputSchema>;
export type AgentResult = z.infer<typeof AgentResultSchema>;
export type ScoreBreakdown = z.infer<typeof ScoreBreakdownSchema>;
export type Recommendation = z.infer<typeof RecommendationSchema>;
export type SourceKind = (typeof sourceKinds)[number];
export type RunStatus = (typeof runStatuses)[number];
