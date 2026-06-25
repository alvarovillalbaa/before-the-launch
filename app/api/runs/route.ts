import { NextResponse } from "next/server";
import { SimulationSetupInputSchema } from "@/lib/shared/schemas";
import { createSimulationRun } from "@/lib/server/services/simulation-service";

export async function POST(request: Request) {
  const body = await request.json();
  const input = SimulationSetupInputSchema.safeParse(body);
  if (!input.success) {
    return NextResponse.json(
      { ok: false, error: { code: "VALIDATION_ERROR", message: "Invalid simulation setup." } },
      { status: 400 },
    );
  }
  const run = await createSimulationRun(input.data);
  return NextResponse.json({ ok: true, data: run }, { status: 201 });
}
