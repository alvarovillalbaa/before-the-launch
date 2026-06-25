import { afterEach, describe, expect, it, vi } from "vitest";
import { getServerEnv, hasAiGatewayCredentials } from "@/lib/server/config/env";

describe("AI credential state", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("starts without AI Gateway credentials and exposes fake-agent fallback", () => {
    vi.stubEnv("AI_GATEWAY_API_KEY", "");
    vi.stubEnv("VERCEL_OIDC_TOKEN", "");
    vi.stubEnv("SIMULATION_ENGINE", "auto");

    expect(hasAiGatewayCredentials()).toBe(false);
    expect(getServerEnv().SIMULATION_ENGINE).toBe("auto");
  });
});
