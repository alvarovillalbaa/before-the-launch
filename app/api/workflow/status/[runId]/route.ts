import { NextResponse } from "next/server";
import {
  DATABASE_UNAVAILABLE_STATUS,
  databaseUnavailableErrorBody,
  isDatabaseUnavailableError,
} from "@/lib/server/db/errors";
import { getRunResults } from "@/lib/server/services/project-service";

type RouteContext = {
  params: Promise<{ runId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { runId } = await context.params;
  try {
    const detail = await getRunResults(runId);
    if (!detail) {
      return NextResponse.json({ error: "Run not found." }, { status: 404 });
    }

    return NextResponse.json({
      id: detail.run.id,
      status: detail.run.status,
      engine: detail.run.engine,
      provenance: detail.provenance,
      globalScore: detail.run.globalScore,
      startedAt: detail.run.startedAt,
      completedAt: detail.run.completedAt,
      agents: detail.agents.map(({ agent, events, provenance }) => ({
        id: agent.id,
        status: agent.status,
        currentStep: agent.currentStep,
        persona: agent.personaSnapshot,
        traceEvents: events.length,
        provenance,
      })),
    });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return NextResponse.json(databaseUnavailableErrorBody(), {
        status: DATABASE_UNAVAILABLE_STATUS,
      });
    }

    throw error;
  }
}
