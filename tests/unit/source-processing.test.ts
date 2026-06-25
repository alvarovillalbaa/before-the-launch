import { describe, expect, it } from "vitest";
import { chunkText, sha256 } from "@/lib/server/services/source-ingestion";

describe("source processing", () => {
  it("hashes content deterministically", () => {
    expect(sha256("launch context")).toBe(sha256("launch context"));
    expect(sha256("launch context")).not.toBe(sha256("other context"));
  });

  it("chunks text with stable indexes and token estimates", () => {
    const text = Array.from({ length: 150 }, (_, index) => `Sentence ${index}`).join(". ");
    const chunks = chunkText(text, 240);

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0]).toContain("Sentence 0");
    expect(chunks.every((chunk) => chunk.length <= 240)).toBe(true);
    expect(chunks.every((chunk) => chunk.trim().length > 0)).toBe(true);
    expect(new Set(chunks.map((chunk) => sha256(chunk))).size).toBe(chunks.length);
  });
});
