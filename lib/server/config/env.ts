import { z } from "zod";

const EnvSchema = z.object({
  DATABASE_URL: z
    .string()
    .default("postgres://before_launch:before_launch@127.0.0.1:54329/before_launch"),
  LOCAL_STORAGE_DIR: z.string().default(".data/storage"),
  SIMULATION_ENGINE: z.enum(["auto", "fake", "gateway"]).default("auto"),
  AI_GATEWAY_MODEL: z.string().default("anthropic/claude-sonnet-4.5"),
  AI_GATEWAY_API_KEY: z.string().optional(),
  VERCEL_OIDC_TOKEN: z.string().optional(),
  MAX_UPLOAD_BYTES: z.coerce.number().int().positive().default(10 * 1024 * 1024),
  MAX_URL_BYTES: z.coerce.number().int().positive().default(2 * 1024 * 1024),
  URL_FETCH_TIMEOUT_MS: z.coerce.number().int().positive().default(8_000),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(120),
});

export type ServerEnv = z.infer<typeof EnvSchema>;

let cachedEnv: ServerEnv | null = null;

export function getServerEnv() {
  if (!cachedEnv) {
    cachedEnv = EnvSchema.parse(process.env);
  }
  return cachedEnv;
}

export function hasAiGatewayCredentials(env = getServerEnv()) {
  return Boolean(env.AI_GATEWAY_API_KEY || env.VERCEL_OIDC_TOKEN);
}
