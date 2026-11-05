import { after } from "next/server";
import { operatorRequestOrResponse } from "@/lib/server/security/operator-request";
import { simulationErrorResponse } from "@/lib/server/services/simulation-http";
import { executeSimulationRun } from "@/lib/server/services/simulation-service";
import { getRunResults } from "@/lib/server/services/project-service";

export const maxDuration = 300;

export async function POST(request: Request, { params }: { params: Promise<{ runId: string }> }) {
  const actor = operatorRequestOrResponse(request);
  if (actor instanceof Response) return actor;
  const { runId } = await params;
  try {
    const detail = await getRunResults(runId);
    if (!detail) return Response.json({ error: "Run not found." }, { status: 404 });
    if (detail.run.status === "queued") after(() => executeSimulationRun(runId));
    return Response.json({ ok: true, status: detail.run.status }, { status: 202, headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return simulationErrorResponse(error); }
}
