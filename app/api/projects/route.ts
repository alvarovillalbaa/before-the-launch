import { NextResponse } from "next/server";
import { ProductBriefInputSchema } from "@/lib/shared/schemas";
import { createProductProject, listProjectDashboard } from "@/lib/server/services/project-service";

export async function GET() {
  const projects = await listProjectDashboard();
  return NextResponse.json({ ok: true, data: projects });
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
  const project = await createProductProject(input.data);
  return NextResponse.json({ ok: true, data: project }, { status: 201 });
}
