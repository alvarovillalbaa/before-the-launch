import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { authenticateOperator, OPERATOR_COOKIE } from "@/lib/server/security/operator-auth";

const harness = vi.hoisted(() => ({ cookies: new Map<string, string>(), headers: new Headers(), calls: vi.fn(), after: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: (key: string) => harness.cookies.has(key) ? { value: harness.cookies.get(key) } : undefined }), headers: async () => harness.headers }));
vi.mock("next/navigation", () => ({ redirect: (path: string) => { throw new Error(`REDIRECT:${path}`); } }));
vi.mock("next/server", async (original) => ({ ...(await original<typeof import("next/server")>()), after: harness.after }));
vi.mock("@/lib/server/services/project-service", () => ({ getRunResults: harness.calls, listProjectDashboard: harness.calls, createProductProject: harness.calls, toPublicSimulationRun: (row: unknown) => row }));
vi.mock("@/lib/server/services/simulation-service", () => ({ createSimulationRun: harness.calls, executeSimulationRun: harness.calls, deleteRun: harness.calls, reconcileExpiredSimulationRun: harness.calls, requestStopSimulationRun: harness.calls, SimulationControlError: class extends Error {} }));
vi.mock("@/lib/server/services/source-ingestion", () => ({ createTextSource: harness.calls, createUrlSource: harness.calls, deleteSource: harness.calls }));

import { POST as login } from "@/app/api/operator/login/route";
import { POST as logout } from "@/app/api/operator/logout/route";
import { GET as projectsGet, POST as projectsPost } from "@/app/api/projects/route";
import { POST as runsPost } from "@/app/api/runs/route";
import { GET as runGet, DELETE as runDelete } from "@/app/api/runs/[runId]/route";
import { POST as execute } from "@/app/api/runs/[runId]/execute/route";
import { POST as stop } from "@/app/api/runs/[runId]/stop/route";
import { GET as status } from "@/app/api/workflow/status/[runId]/route";
import { POST as sourcesPost } from "@/app/api/sources/route";
import { DELETE as sourceDelete } from "@/app/api/sources/[sourceId]/route";
import { requireOperatorAction, requireOperatorPage } from "@/lib/server/security/operator-request";

const key = "authored-private-http-check-operator-key-only";
const base = "https://before.test";
const id = "00000000-0000-4000-8000-000000000001";
const runContext = { params: Promise.resolve({ runId: id }) };
const sourceContext = { params: Promise.resolve({ sourceId: id }) };
function request(path: string, method: string, { cookie, origin = base, body }: { cookie?: string; origin?: string; body?: string } = {}) {
  return new Request(base + path, { method, headers: { host: new URL(base).host, ...(origin ? { origin } : {}), ...(cookie ? { cookie: `${OPERATOR_COOKIE}=${cookie}` } : {}) }, ...(body !== undefined ? { body } : {}) });
}

describe("operator HTTP and action boundaries", () => {
  beforeEach(() => { vi.stubEnv("OPERATOR_ACCESS_KEY", key); harness.cookies.clear(); harness.headers = new Headers({ origin: base, host: "before.test" }); harness.calls.mockReset(); harness.after.mockReset(); });
  afterEach(() => { vi.unstubAllEnvs(); });

  it("every workspace API denies an anonymous request before reading a body or database", async () => {
    const responses = await Promise.all([
      projectsGet(request("/api/projects", "GET")), projectsPost(request("/api/projects", "POST", { body: "not-json" })),
      runsPost(request("/api/runs", "POST", { body: "not-json" })), runGet(request(`/api/runs/${id}`, "GET"), runContext),
      runDelete(request(`/api/runs/${id}`, "DELETE"), runContext), execute(request(`/api/runs/${id}/execute`, "POST"), runContext),
      stop(request(`/api/runs/${id}/stop`, "POST"), runContext), status(request(`/api/workflow/status/${id}`, "GET"), runContext),
      sourcesPost(request("/api/sources", "POST", { body: "not-json" })), sourceDelete(request(`/api/sources/${id}`, "DELETE"), sourceContext),
    ]);
    expect(responses.map((response) => response.status)).toEqual(Array(10).fill(401));
    expect(harness.calls).not.toHaveBeenCalled(); expect(harness.after).not.toHaveBeenCalled();
  });
  it("missing configuration fails closed with 503 before workspace data access", async () => {
    vi.stubEnv("OPERATOR_ACCESS_KEY", "");
    expect((await projectsGet(request("/api/projects", "GET"))).status).toBe(503);
    expect(harness.calls).not.toHaveBeenCalled();
  });
  it("a signed session cannot submit a cross-origin creation", async () => {
    const cookie = authenticateOperator(key)!.cookieValue;
    expect((await runsPost(request("/api/runs", "POST", { cookie, origin: "https://other.test", body: "not-json" }))).status).toBe(403);
    expect(harness.calls).not.toHaveBeenCalled(); expect(harness.after).not.toHaveBeenCalled();
  });
  it("sign-in validates origin and credentials and issues a private session cookie", async () => {
    vi.stubEnv("NODE_ENV", "production");
    expect((await login(request("/api/operator/login", "POST", { origin: "https://other.test", body: JSON.stringify({ accessKey: key }) }))).status).toBe(403);
    expect((await login(request("/api/operator/login", "POST", { body: JSON.stringify({ accessKey: "wrong" }) }))).status).toBe(401);
    const response = await login(request("/api/operator/login", "POST", { body: JSON.stringify({ accessKey: key }) }));
    expect(response.status).toBe(200);
    const cookie = response.headers.get("set-cookie")!;
    expect(cookie).toContain("HttpOnly"); expect(cookie.toLowerCase()).toContain("samesite=strict");
    expect(cookie).toContain("Secure");
    expect(cookie).not.toContain(key); expect(response.headers.get("cache-control")).toContain("no-store");
  });
  it("rejects malformed and oversized sign-in bodies without issuing a cookie", async () => {
    for (const body of ["{", JSON.stringify({ accessKey: "x".repeat(5000) })]) {
      const response = await login(request("/api/operator/login", "POST", { body }));
      expect(response.status).toBe(400); expect(response.headers.has("set-cookie")).toBe(false);
    }
  });
  it("sign-out requires the same origin and expires the cookie", async () => {
    expect((await logout(request("/api/operator/logout", "POST", { origin: "https://other.test" }))).status).toBe(403);
    const response = await logout(request("/api/operator/logout", "POST"));
    expect(response.status).toBe(200); expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
  });
  it("pages and actions independently enforce session access", async () => {
    await expect(requireOperatorPage()).rejects.toThrow("REDIRECT:/login");
    await expect(requireOperatorAction()).rejects.toThrow("Sign in");
    harness.cookies.set(OPERATOR_COOKIE, authenticateOperator(key)!.cookieValue);
    expect((await requireOperatorPage()).sessionId).toBeTruthy();
    expect((await requireOperatorAction()).sessionId).toBeTruthy();
    harness.headers.set("origin", "https://other.test");
    await expect(requireOperatorAction()).rejects.toThrow("same-origin");
  });
});
