import { after, NextResponse } from "next/server";
import { SimulationSetupInputSchema } from "@/lib/shared/schemas";
import { operatorRequestOrResponse } from "@/lib/server/security/operator-request";
import { simulationErrorResponse } from "@/lib/server/services/simulation-http";
import { createSimulationRun, executeSimulationRun } from "@/lib/server/services/simulation-service";
import { toPublicSimulationRun } from "@/lib/server/services/project-service";

export const maxDuration = 300;

export async function POST(request: Request) {
  const actor = operatorRequestOrResponse(request);
  if (actor instanceof Response) return actor;
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ ok: false, error: { code: "VALIDATION_ERROR", message: "Invalid simulation setup." } }, { status: 400 }); }
  const input = SimulationSetupInputSchema.safeParse(body);
  if (!input.success) {
    return NextResponse.json(
      { ok: false, error: { code: "VALIDATION_ERROR", message: input.error.issues[0]?.message ?? "Invalid simulation setup." } },
      { status: 400 },
    );
  }
  try {
    const run = await createSimulationRun(input.data, actor);
    if (run.status === "queued") after(() => executeSimulationRun(run.id));
    return NextResponse.json({ ok: true, run: toPublicSimulationRun(run) }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return simulationErrorResponse(error);
  }
}
