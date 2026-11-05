import { NextResponse } from "next/server";
import { operatorRequestOrResponse } from "@/lib/server/security/operator-request";
import {
  DATABASE_UNAVAILABLE_STATUS,
  databaseUnavailableErrorBody,
  isDatabaseUnavailableError,
} from "@/lib/server/db/errors";
import { getRunResults } from "@/lib/server/services/project-service";

type RouteContext = {
  params: Promise<{ runId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const actor = operatorRequestOrResponse(request);
  if (actor instanceof Response) return actor;
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
      updatedAt: detail.run.updatedAt,
      depth: detail.run.depth,
      budgetLimitCents: detail.run.budgetLimitCents,
      errorMessage: detail.run.errorMessage,
      execution: detail.execution,
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
