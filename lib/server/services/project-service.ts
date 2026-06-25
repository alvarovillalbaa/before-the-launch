import { and, desc, eq, isNull } from "drizzle-orm";
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
  workspaces,
} from "@/lib/server/db/schema";
import type { ProductBriefInput } from "@/lib/shared/schemas";
import { defaultPersonas } from "./personas";

export async function getOrCreateDefaultWorkspace() {
  const db = getDb();
  const existing = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.slug, "local"))
    .limit(1);
  if (existing[0]) return existing[0];

  const [workspace] = await db
    .insert(workspaces)
    .values({ name: "Local workspace", slug: "local" })
    .returning();

  await db.insert(personas).values(
    defaultPersonas.map((persona) => ({
      workspaceId: workspace.id,
      ...persona,
      isDefault: true,
    })),
  );

  return workspace;
}

export async function getWorkspacePersonas() {
  const workspace = await getOrCreateDefaultWorkspace();
  return getDb()
    .select()
    .from(personas)
    .where(eq(personas.workspaceId, workspace.id))
    .orderBy(personas.name);
}

export async function createProductProject(input: ProductBriefInput) {
  const db = getDb();
  const workspace = await getOrCreateDefaultWorkspace();
  const [project] = await db
    .insert(productProjects)
    .values({
      workspaceId: workspace.id,
      name: input.productName,
      nextRecommendedAction: "Add launch context sources before running a simulation.",
    })
    .returning();

  await db.insert(productBriefs).values({
    projectId: project.id,
    productName: input.productName,
    category: input.category,
    icp: input.icp,
    market: input.market,
    expectedPrice: input.expectedPrice,
    competitors: input.competitors,
    launchChannel: input.launchChannel,
    positioningStatement: input.positioningStatement,
    notes: input.notes,
  });

  return project;
}

export async function listProjectDashboard() {
  const db = getDb();
  const projects = await db
    .select()
    .from(productProjects)
    .orderBy(desc(productProjects.updatedAt));

  return Promise.all(
    projects.map(async (project) => {
      const [brief] = await db
        .select()
        .from(productBriefs)
        .where(and(eq(productBriefs.projectId, project.id), eq(productBriefs.isCurrent, true)))
        .limit(1);
      const [run] = await db
        .select()
        .from(simulationRuns)
        .where(eq(simulationRuns.projectId, project.id))
        .orderBy(desc(simulationRuns.createdAt))
        .limit(1);
      const [score] = run
        ? await db
            .select()
            .from(scoreBreakdowns)
            .where(eq(scoreBreakdowns.simulationRunId, run.id))
            .limit(1)
        : [];
      return {
        project,
        brief,
        lastRun: run ?? null,
        score: score ?? null,
      };
    }),
  );
}

export async function getProjectDetail(projectId: string) {
  const db = getDb();
  const [project] = await db
    .select()
    .from(productProjects)
    .where(eq(productProjects.id, projectId))
    .limit(1);
  if (!project) return null;
  const [brief] = await db
    .select()
    .from(productBriefs)
    .where(and(eq(productBriefs.projectId, projectId), eq(productBriefs.isCurrent, true)))
    .limit(1);
  const projectSources = await db
    .select()
    .from(sources)
    .where(and(eq(sources.projectId, projectId), isNull(sources.deletedAt)))
    .orderBy(desc(sources.createdAt));
  const runs = await db
    .select()
    .from(simulationRuns)
    .where(eq(simulationRuns.projectId, projectId))
    .orderBy(desc(simulationRuns.createdAt));
  const workspacePersonas = await getWorkspacePersonas();
  return { project, brief, sources: projectSources, runs, personas: workspacePersonas };
}

export async function listAllSources() {
  const db = getDb();
  return db
    .select({
      source: sources,
      project: productProjects,
    })
    .from(sources)
    .innerJoin(productProjects, eq(sources.projectId, productProjects.id))
    .where(isNull(sources.deletedAt))
    .orderBy(desc(sources.createdAt));
}

export async function listAllRuns() {
  const db = getDb();
  return db
    .select({
      run: simulationRuns,
      project: productProjects,
    })
    .from(simulationRuns)
    .innerJoin(productProjects, eq(simulationRuns.projectId, productProjects.id))
    .orderBy(desc(simulationRuns.createdAt));
}

export async function getRunResults(runId: string) {
  const db = getDb();
  const [run] = await db.select().from(simulationRuns).where(eq(simulationRuns.id, runId)).limit(1);
  if (!run) return null;
  const [project] = await db
    .select()
    .from(productProjects)
    .where(eq(productProjects.id, run.projectId))
    .limit(1);
  const [score] = await db
    .select()
    .from(scoreBreakdowns)
    .where(eq(scoreBreakdowns.simulationRunId, runId))
    .limit(1);
  const recs = await db
    .select()
    .from(recommendations)
    .where(eq(recommendations.simulationRunId, runId));
  const [report] = await db
    .select()
    .from(reports)
    .where(eq(reports.simulationRunId, runId))
    .limit(1);
  const agents = await db
    .select()
    .from(agentRuns)
    .where(eq(agentRuns.simulationRunId, runId));
  const agentsWithDetails = await Promise.all(
    agents.map(async (agent) => {
      const events = await db
        .select()
        .from(agentTraceEvents)
        .where(eq(agentTraceEvents.agentRunId, agent.id))
        .orderBy(agentTraceEvents.sequence);
      const [finding] = await db
        .select()
        .from(agentFindings)
        .where(eq(agentFindings.agentRunId, agent.id))
        .limit(1);
      return { agent, events, finding: finding ?? null };
    }),
  );
  return {
    run,
    project: project ?? null,
    score: score ?? null,
    recommendations: recs,
    report: report ?? null,
    agents: agentsWithDetails,
  };
}
