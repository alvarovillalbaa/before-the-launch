import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const envPath = ".env.local";

if (!existsSync(envPath)) {
  writeFileSync(
    envPath,
    [
      "DATABASE_URL=postgres://before_launch:before_launch@127.0.0.1:54329/before_launch",
      "LOCAL_STORAGE_DIR=.data/storage",
      "SIMULATION_ENGINE=auto",
      "AI_GATEWAY_MODEL=anthropic/claude-sonnet-4.5",
      "MAX_UPLOAD_BYTES=10485760",
      "MAX_URL_FETCH_BYTES=2097152",
      "",
    ].join("\n"),
  );
}

mkdirSync(".data/storage", { recursive: true });

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: "inherit", ...options });
  if (result.error) {
    console.error(`Failed to run ${command}: ${result.error.message}`);
    process.exit(1);
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function commandExists(command) {
  const result = spawnSync(command, ["--version"], { stdio: "ignore" });
  return !result.error && result.status === 0;
}

if (process.env.SKIP_DOCKER !== "1") {
  if (!commandExists("docker")) {
    console.error(
      "Docker CLI was not found. Install Docker, or set SKIP_DOCKER=1 and provide DATABASE_URL for an existing Postgres database.",
    );
    process.exit(1);
  }
  run("docker", ["compose", "up", "-d", "postgres"]);
}

run("pnpm", ["db:push"]);
run("pnpm", ["db:seed"]);

console.log("Local setup complete. Run pnpm dev to start the app.");
