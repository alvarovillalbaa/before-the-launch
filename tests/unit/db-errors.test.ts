import { describe, expect, it } from "vitest";
import {
  DATABASE_UNAVAILABLE_STATUS,
  databaseUnavailableErrorBody,
  isDatabaseUnavailableError,
} from "@/lib/server/db/errors";

describe("isDatabaseUnavailableError", () => {
  it("detects nested Postgres connection failures", () => {
    const pgError = Object.assign(new Error("connect ECONNREFUSED 127.0.0.1:54329"), {
      code: "ECONNREFUSED",
    });
    const drizzleError = new Error("Failed query", { cause: pgError });

    expect(isDatabaseUnavailableError(drizzleError)).toBe(true);
  });

  it("does not hide unrelated query errors", () => {
    const queryError = Object.assign(new Error("relation does not exist"), {
      code: "42P01",
    });

    expect(isDatabaseUnavailableError(queryError)).toBe(false);
  });

  it("exposes the API response contract for database outages", () => {
    expect(DATABASE_UNAVAILABLE_STATUS).toBe(503);
    expect(databaseUnavailableErrorBody()).toMatchObject({
      ok: false,
      error: {
        code: "DATABASE_UNAVAILABLE",
      },
    });
  });
});
