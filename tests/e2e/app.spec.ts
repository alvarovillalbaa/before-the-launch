import { expect, test } from "@playwright/test";

test("seeded dashboard renders projects and local-first state", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible();
  await expect(page.getByText("SignalForge LaunchOS")).toBeVisible();
  await expect(page.getByText("Launch readiness")).toBeVisible();
});

test("settings explains missing AI credentials", async ({ page }) => {
  await page.goto("/settings");

  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  await expect(page.getByText("Deterministic local agents are available.")).toBeVisible();
});

test("completed result page exposes traces and recommendations", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Open" }).first().click();
  await page.getByRole("link", { name: "Inspect" }).first().click();

  await expect(page.getByRole("heading", { name: "Simulation run" })).toBeVisible();
  await expect(page.getByText("Score breakdown")).toBeVisible();
  await page.getByRole("tab", { name: "Trace detail" }).click();
  await expect(page.getByText("Input context frozen")).toBeVisible();
  await page.getByRole("tab", { name: "Report" }).click();
  await expect(page.getByText("Launch perception report")).toBeVisible();
});
