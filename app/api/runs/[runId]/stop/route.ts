import { operatorRequestOrResponse } from "@/lib/server/security/operator-request";
import { simulationErrorResponse } from "@/lib/server/services/simulation-http";
import { requestStopSimulationRun } from "@/lib/server/services/simulation-service";

export async function POST(request: Request, { params }: { params: Promise<{ runId: string }> }) {
  const actor = operatorRequestOrResponse(request);
  if (actor instanceof Response) return actor;
  const { runId } = await params;
  try {
    await requestStopSimulationRun(runId);
    return Response.json({ ok: true }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return simulationErrorResponse(error); }
}
