const databaseUnavailableCodes = new Set([
  "ECONNREFUSED",
  "ECONNRESET",
  "ENOTFOUND",
  "ETIMEDOUT",
]);

export const DATABASE_UNAVAILABLE_STATUS = 503;
export const DATABASE_UNAVAILABLE_MESSAGE =
  "Database is unavailable. Start local Postgres or set DATABASE_URL to a running Postgres database.";

export function databaseUnavailableErrorBody() {
  return {
    ok: false,
    error: {
      code: "DATABASE_UNAVAILABLE",
      message: DATABASE_UNAVAILABLE_MESSAGE,
    },
  } as const;
}

function getErrorCode(error: object) {
  const code = (error as { code?: unknown }).code;
  return typeof code === "string" ? code : null;
}

function getErrorMessage(error: object) {
  const message = (error as { message?: unknown }).message;
  return typeof message === "string" ? message : "";
}

export function isDatabaseUnavailableError(error: unknown) {
  let current = error;
  const seen = new Set<unknown>();

  while (current && typeof current === "object" && !seen.has(current)) {
    seen.add(current);

    const code = getErrorCode(current);
    if (code && databaseUnavailableCodes.has(code)) {
      return true;
    }

    const message = getErrorMessage(current);
    if (
      /\b(connect )?ECONNREFUSED\b/i.test(message) ||
      /\bconnection terminated\b/i.test(message) ||
      /\btimeout (expired|exceeded)\b/i.test(message)
    ) {
      return true;
    }

    current = (current as { cause?: unknown }).cause;
  }

  return false;
}
