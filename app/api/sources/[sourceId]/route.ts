import { NextResponse } from "next/server";
import { deleteSource } from "@/lib/server/services/source-ingestion";

type RouteContext = {
  params: Promise<{ sourceId: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const { sourceId } = await context.params;
  await deleteSource(sourceId);
  return NextResponse.json({ ok: true });
}
