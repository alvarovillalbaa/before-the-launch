import { operatorRequestOrResponse } from "@/lib/server/security/operator-request";
import { simulationErrorResponse } from "@/lib/server/services/simulation-http";
import { dispatchSavedSimulationRun } from "@/lib/server/services/simulation-dispatch";
import { getRunResults } from "@/lib/server/services/project-service";

export const maxDuration = 300;

export async function POST(request: Request, { params }: { params: Promise<{ runId: string }> }) {
  const actor = operatorRequestOrResponse(request);
  if (actor instanceof Response) return actor;
  const { runId } = await params;
  try {
    const detail = await getRunResults(runId);
    if (!detail) return Response.json({ error: "Run not found." }, { status: 404 });
    const dispatch = await dispatchSavedSimulationRun(detail.run);
    return Response.json({ ok: dispatch.confirmed, status: dispatch.run.status, error: dispatch.error },
      { status: dispatch.confirmed ? 202 : dispatch.error?.code === "workflow_binding_conflict" ? 409 : 503,
        headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return simulationErrorResponse(error); }
}
