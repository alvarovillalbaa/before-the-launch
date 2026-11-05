import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e", testMatch: "**/execution-controls.spec.ts", forbidOnly: true,
  fullyParallel: false, workers: 1, retries: 0, timeout: 60_000, globalTimeout: 300_000,
  expect: { timeout: 15_000 },
  outputDir: process.env.EXECUTION_CONTROLS_BROWSER_OUTPUT,
  reporter: [["json", { outputFile: process.env.EXECUTION_CONTROLS_BROWSER_REPORT }]],
  // The spec rejects every origin except this owned, self-signed CI loopback endpoint.
  use: { baseURL: "https://127.0.0.1:3100", ignoreHTTPSErrors: true, trace: "off", video: "off", screenshot: "off", serviceWorkers: "block" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
