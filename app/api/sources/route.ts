import { NextResponse } from "next/server";
import { SourceCreateInputSchema } from "@/lib/shared/schemas";
import {
  createTextSource,
  createUrlSource,
} from "@/lib/server/services/source-ingestion";

export async function POST(request: Request) {
  const body = await request.json();
  const input = SourceCreateInputSchema.safeParse(body);
  if (!input.success) {
    return NextResponse.json(
      { ok: false, error: { code: "VALIDATION_ERROR", message: "Invalid source input." } },
      { status: 400 },
    );
  }
  if (input.data.inputType === "url") {
    const source = await createUrlSource({
      projectId: input.data.projectId,
      kind: input.data.kind,
      title: input.data.title,
      url: input.data.url!,
    });
    return NextResponse.json({ ok: true, data: source }, { status: 201 });
  }
  const source = await createTextSource({
    projectId: input.data.projectId,
    kind: input.data.kind,
    title: input.data.title ?? "Manual note",
    text: input.data.text ?? "",
  });
  return NextResponse.json({ ok: true, data: source }, { status: 201 });
}
