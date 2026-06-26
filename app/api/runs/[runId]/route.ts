import { NextResponse } from "next/server";
import {
  DATABASE_UNAVAILABLE_STATUS,
  databaseUnavailableErrorBody,
  isDatabaseUnavailableError,
} from "@/lib/server/db/errors";
import { deleteRun } from "@/lib/server/services/simulation-service";
import { getRunResults } from "@/lib/server/services/project-service";

type RouteContext = {
  params: Promise<{ runId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
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

export async function DELETE(_request: Request, context: RouteContext) {
  const { runId } = await context.params;
  try {
    await deleteRun(runId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return NextResponse.json(databaseUnavailableErrorBody(), {
        status: DATABASE_UNAVAILABLE_STATUS,
      });
    }

    throw error;
  }
}
