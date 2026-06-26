import { NextResponse } from "next/server";
import { ProductBriefInputSchema } from "@/lib/shared/schemas";
import {
  DATABASE_UNAVAILABLE_STATUS,
  databaseUnavailableErrorBody,
  isDatabaseUnavailableError,
} from "@/lib/server/db/errors";
import { createProductProject, listProjectDashboard } from "@/lib/server/services/project-service";

export async function GET() {
  try {
    const projects = await listProjectDashboard();
    return NextResponse.json({ ok: true, data: projects });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return databaseUnavailableResponse();
    }

    throw error;
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const input = ProductBriefInputSchema.safeParse(body);
  if (!input.success) {
    return NextResponse.json(
      { ok: false, error: { code: "VALIDATION_ERROR", message: "Invalid project input." } },
      { status: 400 },
    );
  }
  try {
    const project = await createProductProject(input.data);
    return NextResponse.json({ ok: true, data: project }, { status: 201 });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return databaseUnavailableResponse();
    }

    throw error;
  }
}

function databaseUnavailableResponse() {
  return NextResponse.json(
    databaseUnavailableErrorBody(),
    { status: DATABASE_UNAVAILABLE_STATUS },
  );
}
