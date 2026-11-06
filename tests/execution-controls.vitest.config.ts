import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": new URL("..", import.meta.url).pathname } },
  test: {
    environment: "node", globals: true,
    include: ["tests/unit/**/*.test.ts", "tests/unit/**/*.test.tsx", "tests/integration/execution-controls.test.ts"],
    fileParallelism: false, maxWorkers: 1, retry: 0, allowOnly: false,
    testTimeout: 20_000, hookTimeout: 30_000,
  },
});
