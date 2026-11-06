import { NextResponse, type NextRequest } from "next/server";
import { OPERATOR_COOKIE, isOperatorAccessConfigured, isSameOriginWrite, verifyOperatorCookie } from "@/lib/server/security/operator-auth";

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const publicRoute = path === "/login" || path === "/api/operator/login" || path === "/api/operator/logout";
  if (!publicRoute) {
    const actor = verifyOperatorCookie(request.cookies.get(OPERATOR_COOKIE)?.value);
    if (!actor) {
      const status = isOperatorAccessConfigured() ? 401 : 503;
      if (path.startsWith("/api/") || request.method !== "GET") {
        return NextResponse.json({ ok: false, error: { code: "OPERATOR_ACCESS_REQUIRED", message: status === 503 ? "Operator access is not configured." : "Sign in to continue." } },
          { status, headers: { "Cache-Control": "private, no-store" } });
      }
      const destination = new URL("/login", request.url);
      destination.searchParams.set("next", `${path}${request.nextUrl.search}`);
      return NextResponse.redirect(destination, { headers: { "Cache-Control": "private, no-store" } });
    }
    if (!isSameOriginWrite(request)) return NextResponse.json({ ok: false, error: { code: "ORIGIN_REQUIRED", message: "A same-origin request is required." } }, { status: 403 });
  }
  const response = NextResponse.next();
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
