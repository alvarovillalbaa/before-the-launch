import { NextResponse } from "next/server";
import { operatorRequestOrResponse } from "@/lib/server/security/operator-request";
import {
  DATABASE_UNAVAILABLE_STATUS,
  databaseUnavailableErrorBody,
  isDatabaseUnavailableError,
} from "@/lib/server/db/errors";
import { deleteRun } from "@/lib/server/services/simulation-service";
import { simulationErrorResponse } from "@/lib/server/services/simulation-http";
import { getRunResults } from "@/lib/server/services/project-service";

type RouteContext = {
  params: Promise<{ runId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const actor = operatorRequestOrResponse(request);
  if (actor instanceof Response) return actor;
  const { runId } = await context.params;
  try {
    const run = await getRunResults(runId);
    if (!run) {
      return NextResponse.json({ error: "Run not found." }, { status: 404 });
    }
    return NextResponse.json(run);
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return NextResponse.json(databaseUnavailableErrorBody(), {
        status: DATABASE_UNAVAILABLE_STATUS,
      });
    }

    throw error;
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const actor = operatorRequestOrResponse(request);
  if (actor instanceof Response) return actor;
  const { runId } = await context.params;
  try {
    await deleteRun(runId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return simulationErrorResponse(error);
  }
}
