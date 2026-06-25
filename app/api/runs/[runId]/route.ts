import { NextResponse } from "next/server";
import { deleteRun } from "@/lib/server/services/simulation-service";
import { getRunResults } from "@/lib/server/services/project-service";

type RouteContext = {
  params: Promise<{ runId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { runId } = await context.params;
  const run = await getRunResults(runId);
  if (!run) {
    return NextResponse.json({ error: "Run not found." }, { status: 404 });
  }
  return NextResponse.json(run);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { runId } = await context.params;
  await deleteRun(runId);
  return NextResponse.json({ ok: true });
}
