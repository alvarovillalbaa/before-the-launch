import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { OPERATOR_SESSION_MS, assertOperatorIdentity, authenticateOperator, isOperatorAccessConfigured, isSameOriginWrite, safeReturnPath, signPaidSimulationAdmission, verifyOperatorCookie, verifyPaidSimulationAdmission, type PaidSimulationScope } from "@/lib/server/security/operator-auth";

const key = "authored-operator-key-for-disposable-tests-only";
const now = 1_793_836_800_000;
const scope: PaidSimulationScope = {
  runId: "00000000-0000-4000-8000-000000000001",
  requestId: "00000000-0000-4000-8000-000000000002",
  inputFingerprint: "a".repeat(64), modelId: "authored/model", depth: "standard", budgetLimitCents: 100,
  personaIds: ["00000000-0000-4000-8000-000000000003", "00000000-0000-4000-8000-000000000004"],
};

describe("private operator admission", () => {
  beforeEach(() => { vi.stubEnv("OPERATOR_ACCESS_KEY", key); });
  afterEach(() => { vi.unstubAllEnvs(); });

  it("fails closed without a strong configured key", () => {
    vi.stubEnv("OPERATOR_ACCESS_KEY", "");
    expect(isOperatorAccessConfigured()).toBe(false);
    expect(authenticateOperator(key, now)).toBeNull();
    vi.stubEnv("OPERATOR_ACCESS_KEY", "short");
    expect(isOperatorAccessConfigured()).toBe(false);
  });
  it("does not accept an incorrect or oversized key", () => {
    expect(authenticateOperator("wrong", now)).toBeNull();
    expect(authenticateOperator("x".repeat(4096), now)).toBeNull();
  });
  it("issues a signed expiring session without embedding the access key", () => {
    const session = authenticateOperator(key, now)!;
    expect(session.cookieValue).not.toContain(key);
    const actor = verifyOperatorCookie(session.cookieValue, now + 1)!;
    expect(actor.sessionId).toBe(session.identity.sessionId);
    expect(actor.expiresAt).toBe(now + OPERATOR_SESSION_MS);
    expect(() => assertOperatorIdentity(actor, now + 1)).not.toThrow();
  });
  it("rejects forged, malformed, future and expired sessions", () => {
    const session = authenticateOperator(key, now)!;
    expect(verifyOperatorCookie(`${session.cookieValue}x`, now)).toBeNull();
    expect(verifyOperatorCookie("not-a-session", now)).toBeNull();
    expect(verifyOperatorCookie(session.cookieValue, now - 1)).toBeNull();
    expect(verifyOperatorCookie(session.cookieValue, now + OPERATOR_SESSION_MS)).toBeNull();
  });
  it("key rotation invalidates an existing session and paid grant", () => {
    const session = authenticateOperator(key, now)!;
    const grant = signPaidSimulationAdmission(scope, session.identity, now);
    vi.stubEnv("OPERATOR_ACCESS_KEY", `${key}-rotated`);
    expect(verifyOperatorCookie(session.cookieValue, now)).toBeNull();
    expect(verifyPaidSimulationAdmission(scope, grant, now)).toBe(false);
    expect(() => signPaidSimulationAdmission(scope, session.identity, now)).toThrow("Operator access");
  });
  it("does not let an HTTP-shaped object sign paid admission", () => {
    expect(() => signPaidSimulationAdmission(scope, { sessionId: "visitor", expiresAt: now + OPERATOR_SESSION_MS }, now)).toThrow("Operator access");
  });
  it("binds admission to exactly one run/configuration/cohort and expires it", () => {
    const actor = authenticateOperator(key, now)!.identity;
    const grant = signPaidSimulationAdmission(scope, actor, now);
    expect(verifyPaidSimulationAdmission(scope, grant, now)).toBe(true);
    expect(verifyPaidSimulationAdmission({ ...scope, runId: scope.requestId }, grant, now)).toBe(false);
    expect(verifyPaidSimulationAdmission({ ...scope, requestId: scope.runId }, grant, now)).toBe(false);
    expect(verifyPaidSimulationAdmission({ ...scope, inputFingerprint: "b".repeat(64) }, grant, now)).toBe(false);
    expect(verifyPaidSimulationAdmission({ ...scope, modelId: "authored/other" }, grant, now)).toBe(false);
    expect(verifyPaidSimulationAdmission({ ...scope, depth: "deep" }, grant, now)).toBe(false);
    expect(verifyPaidSimulationAdmission({ ...scope, budgetLimitCents: 200 }, grant, now)).toBe(false);
    expect(verifyPaidSimulationAdmission({ ...scope, personaIds: [...scope.personaIds].reverse() }, grant, now)).toBe(false);
    expect(verifyPaidSimulationAdmission(scope, grant, grant.expiresAt)).toBe(false);
  });
  it("rejects zero, invalid or duplicated paid scopes", () => {
    const actor = authenticateOperator(key, now)!.identity;
    expect(() => signPaidSimulationAdmission({ ...scope, budgetLimitCents: 0 }, actor, now)).toThrow("Invalid paid");
    expect(() => signPaidSimulationAdmission({ ...scope, personaIds: [scope.personaIds[0], scope.personaIds[0]] }, actor, now)).toThrow("Invalid paid");
    expect(verifyPaidSimulationAdmission(scope, { version: 1, signature: "forged" }, now)).toBe(false);
  });
  it("requires an origin match for writes while permitting reads", () => {
    expect(isSameOriginWrite(new Request("https://before.test/api/runs"))).toBe(true);
    expect(isSameOriginWrite(new Request("https://before.test/api/runs", { method: "POST", headers: { origin: "https://before.test", host: "before.test" } }))).toBe(true);
    for (const origin of ["https://other.test", "http://before.test", "null", "https://before.test.evil"]) {
      expect(isSameOriginWrite(new Request("https://before.test/api/runs", { method: "POST", headers: { origin, host: "before.test" } }))).toBe(false);
    }
    expect(isSameOriginWrite(new Request("https://before.test/api/runs", { method: "POST" }))).toBe(false);
  });
  it("accepts a framework-normalized URL only when the actual Host and canonical Origin match", () => {
    const target = "http://localhost:3100/api/operator/login";
    const request = (origin: string, host?: string, forwarded?: string) => new Request(target, { method: "POST", headers: { origin,
      ...(host === undefined ? {} : { host }), ...(forwarded ? { "x-forwarded-host": forwarded } : {}) } });
    expect(isSameOriginWrite(request("http://127.0.0.1:3100", "127.0.0.1:3100"))).toBe(true);
    expect(isSameOriginWrite(request("http://localhost:3100", "127.0.0.1:3100"))).toBe(false);
    expect(isSameOriginWrite(request("https://127.0.0.1:3100", "127.0.0.1:3100"))).toBe(false);
    expect(isSameOriginWrite(request("http://127.0.0.1:3100"))).toBe(false);
    expect(isSameOriginWrite(request("http://other.test", "127.0.0.1:3100", "other.test"))).toBe(false);
    for (const host of ["127.0.0.1:3100,other.test", "user@127.0.0.1:3100", "127.0.0.1:99999", "127.0.0.1:3100/path", "127.0.0.1%2e:3100", "127.0.0.1:3100#fragment", "127.0.0.1:3100 other.test"]) {
      expect(isSameOriginWrite(request("http://127.0.0.1:3100", host))).toBe(false);
    }
    for (const origin of ["http://127.0.0.1:3100/path", "http://127.0.0.1:3100?x=1", "http://user@127.0.0.1:3100", "null"]) {
      expect(isSameOriginWrite(request(origin, "127.0.0.1:3100"))).toBe(false);
    }
  });
  it("keeps post-login navigation on an application page", () => {
    expect(safeReturnPath("/projects/owned?tab=setup")).toBe("/projects/owned?tab=setup");
    for (const path of [undefined, "https://other.test", "//other.test", "/\\other.test", "/\t/other.test", "/%5cother.test", "/%2fother.test", "/login?next=x", "/api/runs", "/\r\nother"]) expect(safeReturnPath(path)).toBe("/");
  });
});
