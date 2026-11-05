import { NextResponse } from "next/server";
import { OPERATOR_COOKIE, isSameOriginWrite } from "@/lib/server/security/operator-auth";

export async function POST(request: Request) {
  if (!isSameOriginWrite(request)) return NextResponse.json({ error: "A same-origin request is required." }, { status: 403 });
  const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "private, no-store" } });
  response.cookies.set(OPERATOR_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 });
  return response;
}
