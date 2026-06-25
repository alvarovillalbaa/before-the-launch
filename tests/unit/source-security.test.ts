import { describe, expect, it } from "vitest";
import { normalizePublicHttpUrl } from "@/lib/server/services/source-security";

describe("URL ingestion safety", () => {
  it("accepts normal HTTP and HTTPS URLs", () => {
    expect(normalizePublicHttpUrl("https://example.com/product").hostname).toBe("example.com");
    expect(normalizePublicHttpUrl("http://example.com").protocol).toBe("http:");
  });

  it("blocks localhost and private network targets before fetch", () => {
    expect(() => normalizePublicHttpUrl("http://localhost:3000")).toThrow(/private|local/i);
    expect(() => normalizePublicHttpUrl("http://127.0.0.1:3000")).toThrow(/private|local/i);
    expect(() => normalizePublicHttpUrl("http://192.168.1.20")).toThrow(/private|local/i);
    expect(() => normalizePublicHttpUrl("http://10.0.0.5")).toThrow(/private|local/i);
  });

  it("blocks unsupported schemes and embedded credentials", () => {
    expect(() => normalizePublicHttpUrl("file:///etc/passwd")).toThrow(/HTTP and HTTPS/i);
    expect(() => normalizePublicHttpUrl("https://user:pass@example.com")).toThrow(/credentials/i);
  });
});
