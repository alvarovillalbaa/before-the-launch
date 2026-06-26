import { NextResponse } from "next/server";
import {
  DATABASE_UNAVAILABLE_STATUS,
  databaseUnavailableErrorBody,
  isDatabaseUnavailableError,
} from "@/lib/server/db/errors";
import { deleteSource } from "@/lib/server/services/source-ingestion";

type RouteContext = {
  params: Promise<{ sourceId: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const { sourceId } = await context.params;
  try {
    await deleteSource(sourceId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return NextResponse.json(databaseUnavailableErrorBody(), {
        status: DATABASE_UNAVAILABLE_STATUS,
      });
    }

    throw error;
  }
}
