import { NextResponse } from "next/server";
import { SimulationSetupInputSchema } from "@/lib/shared/schemas";
import {
  DATABASE_UNAVAILABLE_STATUS,
  databaseUnavailableErrorBody,
  isDatabaseUnavailableError,
} from "@/lib/server/db/errors";
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
  try {
    const run = await createSimulationRun(input.data);
    return NextResponse.json({ ok: true, data: run }, { status: 201 });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return NextResponse.json(databaseUnavailableErrorBody(), {
        status: DATABASE_UNAVAILABLE_STATUS,
      });
    }

    throw error;
  }
}
