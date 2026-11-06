import { NextResponse } from "next/server";
import { OPERATOR_COOKIE, OPERATOR_SESSION_MS, authenticateOperator, isOperatorAccessConfigured, isSameOriginWrite } from "@/lib/server/security/operator-auth";

export async function POST(request: Request) {
  const options = { headers: { "Cache-Control": "private, no-store" } };
  if (!isSameOriginWrite(request)) return NextResponse.json({ error: "A same-origin request is required." }, { ...options, status: 403 });
  if (!isOperatorAccessConfigured()) return NextResponse.json({ error: "Operator access is not configured." }, { ...options, status: 503 });
  if (Number(request.headers.get("content-length") ?? 0) > 4096) return NextResponse.json({ error: "Invalid sign-in request." }, { ...options, status: 400 });
  let accessKey: unknown;
  try {
    const text = await request.text();
    if (text.length > 4096) throw new Error("oversized");
    accessKey = (JSON.parse(text) as { accessKey?: unknown }).accessKey;
  } catch { return NextResponse.json({ error: "Invalid sign-in request." }, { ...options, status: 400 }); }
  const session = typeof accessKey === "string" ? authenticateOperator(accessKey) : null;
  if (!session) return NextResponse.json({ error: "Access key was not accepted." }, { ...options, status: 401 });
  const response = NextResponse.json({ ok: true }, options);
  response.cookies.set(OPERATOR_COOKIE, session.cookieValue, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: OPERATOR_SESSION_MS / 1000 });
  return response;
}
