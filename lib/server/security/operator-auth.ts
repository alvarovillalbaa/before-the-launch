import { createHash, createHmac, randomUUID, timingSafeEqual } from "node:crypto";

export const OPERATOR_COOKIE = "btl_operator";
export const OPERATOR_SESSION_MS = 12 * 60 * 60 * 1000;
const ADMISSION_MS = 15 * 60 * 1000;
const identities = new WeakMap<object, string>();
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type OperatorIdentity = Readonly<{ sessionId: string; expiresAt: number }>;
export type PaidSimulationScope = {
  runId: string;
  requestId: string;
  inputFingerprint: string;
  modelId: string;
  depth: "quick" | "standard" | "deep";
  budgetLimitCents: number;
  personaIds: string[];
};
export type PaidSimulationAdmission = {
  version: 1;
  sessionId: string;
  expiresAt: number;
  signature: string;
};

function accessKey() {
  const value = process.env.OPERATOR_ACCESS_KEY;
  return value && /^[\x21-\x7e]{32,256}$/.test(value) ? value : null;
}

export function isOperatorAccessConfigured() {
  return accessKey() !== null;
}

function equal(a: string, b: string) {
  return timingSafeEqual(createHash("sha256").update(a).digest(), createHash("sha256").update(b).digest());
}

function signature(domain: string, value: string) {
  const key = accessKey();
  return key ? createHmac("sha256", key).update(`${domain}\n${value}`).digest("base64url") : null;
}

function identity(sessionId: string, expiresAt: number): OperatorIdentity {
  const actor = Object.freeze({ sessionId, expiresAt });
  identities.set(actor, createHash("sha256").update(accessKey()!).digest("hex"));
  return actor;
}

export function assertOperatorIdentity(actor: OperatorIdentity | undefined, now = Date.now()): asserts actor is OperatorIdentity {
  const key = accessKey();
  if (!actor || !key || identities.get(actor) !== createHash("sha256").update(key).digest("hex") || actor.expiresAt <= now) {
    throw new Error("Operator access is required.");
  }
}

export function authenticateOperator(candidate: string, now = Date.now()) {
  const key = accessKey();
  if (!key || candidate.length > 256 || !equal(candidate, key)) return null;
  const payload = { version: 1, sessionId: randomUUID(), issuedAt: now, expiresAt: now + OPERATOR_SESSION_MS };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return { cookieValue: `${encoded}.${signature("operator-session-v1", encoded)}`, identity: identity(payload.sessionId, payload.expiresAt) };
}

export function verifyOperatorCookie(value: string | undefined, now = Date.now()): OperatorIdentity | null {
  if (!value || value.length > 1024) return null;
  const match = /^([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]{43})$/.exec(value);
  if (!match) return null;
  const expected = signature("operator-session-v1", match[1]);
  if (!expected || !equal(expected, match[2])) return null;
  try {
    const parsed = JSON.parse(Buffer.from(match[1], "base64url").toString("utf8"));
    if (parsed.version !== 1 || !uuid.test(parsed.sessionId) || !Number.isSafeInteger(parsed.issuedAt) ||
        !Number.isSafeInteger(parsed.expiresAt) || parsed.issuedAt > now || parsed.expiresAt <= now ||
        parsed.expiresAt - parsed.issuedAt !== OPERATOR_SESSION_MS) return null;
    const canonical = { version: 1, sessionId: parsed.sessionId, issuedAt: parsed.issuedAt, expiresAt: parsed.expiresAt };
    if (Buffer.from(JSON.stringify(canonical)).toString("base64url") !== match[1]) return null;
    return identity(parsed.sessionId, parsed.expiresAt);
  } catch {
    return null;
  }
}

function canonicalScope(scope: PaidSimulationScope) {
  if (!uuid.test(scope.runId) || !uuid.test(scope.requestId) || !/^[a-f0-9]{64}$/.test(scope.inputFingerprint) ||
      !scope.modelId || scope.modelId.length > 200 || !["quick", "standard", "deep"].includes(scope.depth) ||
      !Number.isInteger(scope.budgetLimitCents) || scope.budgetLimitCents <= 0 || scope.budgetLimitCents > 100_000 ||
      !Array.isArray(scope.personaIds) || scope.personaIds.length < 1 || scope.personaIds.length > 10 ||
      scope.personaIds.some((id) => !uuid.test(id)) || new Set(scope.personaIds).size !== scope.personaIds.length) {
    throw new Error("Invalid paid simulation authorization scope.");
  }
  return { runId: scope.runId, requestId: scope.requestId, inputFingerprint: scope.inputFingerprint,
    modelId: scope.modelId, depth: scope.depth, budgetLimitCents: scope.budgetLimitCents, personaIds: [...scope.personaIds] };
}

export function signPaidSimulationAdmission(scope: PaidSimulationScope, actor: OperatorIdentity, now = Date.now()): PaidSimulationAdmission {
  assertOperatorIdentity(actor, now);
  const grant = { version: 1 as const, sessionId: actor.sessionId, expiresAt: Math.min(actor.expiresAt, now + ADMISSION_MS) };
  const value = JSON.stringify({ ...grant, scope: canonicalScope(scope) });
  return { ...grant, signature: signature("paid-simulation-v1", value)! };
}

export function verifyPaidSimulationAdmission(scope: PaidSimulationScope, grant: unknown, now = Date.now()): boolean {
  if (!grant || typeof grant !== "object") return false;
  const g = grant as Partial<PaidSimulationAdmission>;
  if (g.version !== 1 || typeof g.sessionId !== "string" || !uuid.test(g.sessionId) ||
      !Number.isSafeInteger(g.expiresAt) || g.expiresAt! <= now || g.expiresAt! > now + ADMISSION_MS ||
      typeof g.signature !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(g.signature)) return false;
  try {
    const value = JSON.stringify({ version: 1, sessionId: g.sessionId, expiresAt: g.expiresAt, scope: canonicalScope(scope) });
    const expected = signature("paid-simulation-v1", value);
    return expected !== null && equal(expected, g.signature);
  } catch {
    return false;
  }
}

export function isSameOriginWrite(request: Request) {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method.toUpperCase())) return true;
  const origin = request.headers.get("origin");
  if (!origin || origin === "null") return false;
  try { return origin === new URL(request.url).origin; } catch { return false; }
}

export function safeReturnPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\\\x00-\x20\x7f]|%(?:2f|5c|0[0-9a-f]|1[0-9a-f]|20|7f)/i.test(value)) return "/";
  return value.startsWith("/login") || value.startsWith("/api/") ? "/" : value;
}
