import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { OPERATOR_COOKIE, isOperatorAccessConfigured, isSameOriginWrite, verifyOperatorCookie } from "./operator-auth";

export class OperatorAccessError extends Error {
  constructor(public readonly status: 401 | 403 | 503) {
    super(status === 503 ? "Operator access is not configured." : status === 403 ? "A same-origin request is required." : "Sign in to continue.");
  }
}

export function operatorErrorResponse(error: unknown) {
  if (!(error instanceof OperatorAccessError)) return null;
  return Response.json({ ok: false, error: { code: "OPERATOR_ACCESS_REQUIRED", message: error.message } },
    { status: error.status, headers: { "Cache-Control": "private, no-store" } });
}

export function requireOperatorRequest(request: Request) {
  if (!isOperatorAccessConfigured()) throw new OperatorAccessError(503);
  const cookie = request.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${OPERATOR_COOKIE}=`))?.slice(OPERATOR_COOKIE.length + 1);
  const actor = verifyOperatorCookie(cookie);
  if (!actor) throw new OperatorAccessError(401);
  if (!isSameOriginWrite(request)) throw new OperatorAccessError(403);
  return actor;
}

export function operatorRequestOrResponse(request: Request) {
  try { return requireOperatorRequest(request); }
  catch (error) {
    const response = operatorErrorResponse(error);
    if (response) return response;
    throw error;
  }
}

export async function requireOperatorPage() {
  const actor = verifyOperatorCookie((await cookies()).get(OPERATOR_COOKIE)?.value);
  if (!actor) redirect("/login");
  return actor;
}

export async function requireOperatorAction() {
  if (!isOperatorAccessConfigured()) throw new OperatorAccessError(503);
  const actor = verifyOperatorCookie((await cookies()).get(OPERATOR_COOKIE)?.value);
  if (!actor) throw new OperatorAccessError(401);
  const h = await headers();
  const origin = h.get("origin");
  const host = h.get("host");
  if (!origin || !host) throw new OperatorAccessError(403);
  try {
    const url = new URL(origin);
    if (url.host !== host || (process.env.NODE_ENV === "production" && url.protocol !== "https:")) throw new OperatorAccessError(403);
  } catch { throw new OperatorAccessError(403); }
  return actor;
}
