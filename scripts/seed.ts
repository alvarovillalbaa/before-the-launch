import "dotenv/config";
import { eq } from "drizzle-orm";
import { closeDb, getDb } from "@/lib/server/db/client";
import {
  agentRuns,
  agentTraceEvents,
  productProjects,
  simulationRuns,
  sourceChunks,
  sources,
} from "@/lib/server/db/schema";
import { getOrCreateDefaultWorkspace } from "@/lib/server/services/project-service";
import { createProductProject } from "@/lib/server/services/project-service";
import { createSimulationRun } from "@/lib/server/services/simulation-service";
import { sha256 } from "@/lib/server/services/source-ingestion";

async function seedSource(input: {
  projectId: string;
  kind: string;
  inputType: string;
  title: string;
  url?: string;
  text: string;
}) {
  const db = getDb();
  const [source] = await db
    .insert(sources)
    .values({
      projectId: input.projectId,
      kind: input.kind,
      inputType: input.inputType,
      status: "ready",
      title: input.title,
      url: input.url,
      fetchedAt: input.url ? new Date() : null,
      contentHash: sha256(input.text),
      mimeType: input.inputType === "url" ? "text/html" : "text/plain",
      byteSize: Buffer.byteLength(input.text),
      extractedText: input.text,
    })
    .returning();
  const chunks = input.text.match(/[\s\S]{1,2200}/g) ?? [];
  await db.insert(sourceChunks).values(
    chunks.map((chunk, index) => ({
      sourceId: source.id,
      chunkIndex: index,
      text: chunk,
      tokenEstimate: Math.ceil(chunk.length / 4),
      contentHash: sha256(chunk),
    })),
  );
}

async function main() {
  const db = getDb();
  const workspace = await getOrCreateDefaultWorkspace();
  const existing = await db
    .select()
    .from(productProjects)
    .where(eq(productProjects.name, "SignalForge LaunchOS"))
    .limit(1);

  if (existing[0]) {
    console.log("Demo data already seeded.");
    await closeDb();
    return;
  }

  const project = await createProductProject({
    productName: "SignalForge LaunchOS",
    category: "Pre-launch product intelligence",
    icp: "B2B SaaS product marketing teams preparing high-stakes launches with founder, sales, security, and product stakeholders.",
    market: "North American mid-market and enterprise SaaS",
    expectedPrice: "$1,500 per workspace per month",
    competitors: "User research agencies, win/loss consultants, positioning workshops, generic AI research tools",
    launchChannel: "Founder-led demos, product marketing community launches, and sales-led enterprise pilots",
    positioningStatement:
      "SignalForge LaunchOS helps teams test how a product may be perceived before launch by simulating structured market personas against real launch context.",
    notes:
      "The product is intentionally a simulator, not a prediction oracle. The wedge is launch context ingestion, persona traces, and actionable pre-launch changes.",
  });

  await Promise.all([
    seedSource({
      projectId: project.id,
      kind: "product",
      inputType: "url",
      title: "Launch landing page draft",
      url: "https://example.com/signals/launchos",
      text:
        "SignalForge LaunchOS turns launch docs, pricing notes, and competitor context into a structured perception simulation. Teams can inspect persona traces, objections, trust gaps, and launch readiness before public release.",
    }),
    seedSource({
      projectId: project.id,
      kind: "pricing",
      inputType: "url",
      title: "Pricing page draft",
      url: "https://example.com/signals/pricing",
      text:
        "Pricing starts at $1,500 per workspace per month. The offer includes ten simulations, source ingestion, report export, and configurable personas. Enterprise security review is planned but not yet fully documented.",
    }),
    seedSource({
      projectId: project.id,
      kind: "competitor",
      inputType: "url",
      title: "Competitive alternatives brief",
      url: "https://example.com/signals/alternatives",
      text:
        "Alternatives include research agencies, message testing tools, survey platforms, and generic AI research workflows. SignalForge differentiates through visible agent traces and launch-specific recommendations.",
    }),
    seedSource({
      projectId: project.id,
      kind: "company",
      inputType: "file",
      title: "Company context memo.txt",
      text:
        "SignalForge is a fictional 28-person SaaS company. The team sells to product marketing leaders and wants a calm, credible launch narrative rather than AI magic positioning.",
    }),
    seedSource({
      projectId: project.id,
      kind: "customer_research",
      inputType: "file",
      title: "Customer interviews.md",
      text:
        "Interviewed teams said launches fail when security, pricing, and proof points are discovered too late. The strongest buyer language was: show me objections before the market does.",
    }),
    seedSource({
      projectId: project.id,
      kind: "previous_launch",
      inputType: "text",
      title: "Previous launch retrospective",
      text:
        "A previous analytics product launch had strong early interest but weak conversion because enterprise buyers asked for security proof, implementation details, and competitive comparison late in the sales cycle.",
    }),
  ]);

  const completed = await createSimulationRun({
    projectId: project.id,
    targetMarket: "North American B2B SaaS product marketing teams",
    agentCount: 8,
    depth: "standard",
    budgetLimitCents: 0,
  });

  const [partial] = await db
    .insert(simulationRuns)
    .values({
      projectId: project.id,
      status: "partial",
      engine: "fake",
      depth: "quick",
      targetMarket: "Enterprise SaaS security reviewers",
      budgetLimitCents: 0,
      agentCount: 2,
      globalScore: "58.00",
      briefSnapshot: { productName: "SignalForge LaunchOS" },
      sourceSnapshot: [],
      personaSnapshot: [
        {
          name: "Enterprise security/compliance reviewer",
          role: "Security reviewer",
          description: "Stopped early because security proof was thin.",
          evaluationLens: "Trust and risk.",
        },
      ],
      disagreementSummary: { reason: "Partial demo run" },
      errorMessage: "One persona stopped early after missing compliance evidence.",
      startedAt: new Date(),
      completedAt: new Date(),
    })
    .returning();
  const [agent] = await db
    .insert(agentRuns)
    .values({
      simulationRunId: partial.id,
      personaSnapshot: {
        name: "Enterprise security/compliance reviewer",
        role: "Security reviewer",
        description: "Reviews compliance posture.",
        evaluationLens: "Trust and risk.",
      },
      status: "failed",
      currentStep: "Stopped on missing proof",
      errorMessage: "Missing security documentation.",
    })
    .returning();
  await db.insert(agentTraceEvents).values({
    agentRunId: agent.id,
    sequence: 1,
    eventType: "failure",
    title: "Missing compliance proof",
    body: "The persona could not evaluate enterprise readiness from the available source snapshot.",
  });

  console.log(`Seeded demo project ${project.id} and completed run ${completed.id}.`);
  console.log(`Workspace: ${workspace.name}`);
  await closeDb();
}

main().catch(async (error) => {
  console.error(error);
  await closeDb();
  process.exit(1);
});
