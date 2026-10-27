import { expect, test, type Page } from "@playwright/test";

// Authored fixtures only. The dedicated CI database/context is discarded after
// acceptance; these checks never run against the deployed app or model providers.
test.beforeEach(async ({ context }) => {
  await context.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === "127.0.0.1" || url.hostname === "localhost") await route.continue();
    else await route.abort("blockedbyclient");
  });
});

function productFile(name: string) {
  return { name: "authored-product.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify({
    productName: name, market: "Independent bookshops", category: "Paper planning",
    icp: "Bookshop owners", expectedPrice: "12 EUR", competitors: "Paper diaries",
    launchChannel: "Shop newsletter", positioningStatement: "A clear, simple paper planning workflow with customer proof.",
    notes: "Disposable authored acceptance fixture.",
  })) };
}

async function previewProduct(page: Page, name: string) {
  await page.goto("/projects/new");
  await page.getByLabel("Product files", { exact: true }).setInputFiles(productFile(name));
  await page.getByRole("button", { name: "Preview imported context", exact: true }).click();
  const preview = page.locator('[aria-label="Imported context preview"]');
  await expect(preview).toBeVisible();
  await expect(preview.getByText(name, { exact: true })).toBeVisible();
}

async function createReviewedProject(page: Page) {
  await page.getByRole("button", { name: "Create project from uploads", exact: true }).click();
  await expect(page).toHaveURL(/\/projects\/[a-f0-9-]+\?tab=setup$/);
  await expect(page.getByLabel("Target market", { exact: true })).toBeVisible();
}

test("desktop imports reviewed files and persists a fake run within Projects", async ({ page }) => {
  const name = "Desktop authored product";
  await previewProduct(page, name);
  await createReviewedProject(page);
  await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
  const projectURL = page.url();
  await expect(page.getByLabel("Target market", { exact: true })).toHaveValue("Independent bookshops");
  await page.getByLabel("Agents", { exact: true }).fill("1");
  await page.getByRole("button", { name: "Run simulation", exact: true }).click();
  await expect(page).toHaveURL(/\/runs\/[a-f0-9-]+$/);
  await expect(page.getByRole("heading", { name: "Simulation run", exact: true })).toBeVisible();
  await expect(page.getByText("fake", { exact: true })).toBeVisible();
  await expect(page.getByText("completed", { exact: true })).toBeVisible();
  const runURL = page.url();
  await page.reload();
  await expect(page.getByText("Score breakdown", { exact: true })).toBeVisible();
  await page.goto("/?view=runs");
  const row = page.getByRole("row").filter({ has: page.getByRole("link", { name, exact: true }) });
  await expect(row).toContainText("completed");
  await expect(row.getByRole("link", { name: /^Inspect / })).toHaveAttribute("href", new URL(runURL).pathname);
  await page.goto(projectURL);
  await page.getByRole("navigation", { name: "Project sections", exact: true }).getByRole("link", { name: "Sources", exact: true }).click();
  await expect(page).toHaveURL(/\?tab=sources$/);
  await page.getByRole("link", { name: "New simulation", exact: true }).click();
  await expect(page.getByLabel("Target market", { exact: true })).toBeVisible();
});

test.describe("mobile touch workspace", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("sidebar works and filename labels never become missing product facts", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Toggle navigation", exact: true }).tap();
    const navigation = page.getByRole("navigation", { name: "Primary navigation", exact: true });
    await expect(navigation).toBeVisible();
    await expect(navigation.getByRole("link")).toHaveText(["Projects", "Sources", "Settings"]);
    await page.getByRole("button", { name: "Close navigation", exact: true }).tap();
    await expect(navigation).not.toBeVisible();
    await page.goto("/projects/new");
    await page.getByLabel("Product files", { exact: true }).setInputFiles({ name: "mobile-launch-notes.md", mimeType: "text/markdown", buffer: Buffer.from("# Authored context\nA paper planning tool for bookshops.\n") });
    await page.getByRole("button", { name: "Preview imported context", exact: true }).tap();
    const preview = page.locator('[aria-label="Imported context preview"]');
    await expect(preview).toContainText("mobile launch notes");
    await expect(preview).toContainText("A product name was not supplied");
    await expect(preview.getByText("Not supplied in uploads", { exact: true })).toHaveCount(9);
    await page.getByRole("button", { name: "Create project from uploads", exact: true }).tap();
    await expect(page).toHaveURL(/\?tab=setup$/);
    await expect(page.getByRole("heading", { name: "mobile launch notes", exact: true })).toBeVisible();
    await expect(page.getByLabel("Target market", { exact: true })).toHaveValue("");
    await expect(page.getByRole("note", { name: "Missing uploaded product facts", exact: true })).toContainText("Product name");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.getByRole("navigation", { name: "Project sections", exact: true }).getByRole("link", { name: "Brief", exact: true }).tap();
    await expect(page.getByText("Not supplied in uploads", { exact: true })).toHaveCount(10);
    await page.reload();
    await expect(page.getByRole("heading", { name: "mobile launch notes", exact: true })).toBeVisible();
  });
});

test("network failures retain selected files and preview for a safe retry", async ({ page }) => {
  let failNextAction = true;
  await page.route("**/projects/new", async route => {
    if (failNextAction && route.request().method() === "POST" && route.request().headers()["next-action"]) {
      failNextAction = false;
      await route.abort("failed");
    } else await route.continue();
  });
  await page.goto("/projects/new");
  await page.getByLabel("Product files", { exact: true }).setInputFiles(productFile("Retained authored product"));
  await page.getByRole("button", { name: "Preview imported context", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("selected files are still here");
  await expect(page.getByRole("list", { name: "Selected files", exact: true })).toContainText("authored-product.json");
  await page.getByRole("button", { name: "Preview imported context", exact: true }).click();
  await expect(page.locator('[aria-label="Imported context preview"]')).toBeVisible();
  failNextAction = true;
  await page.getByRole("button", { name: "Create project from uploads", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Check Projects before retrying");
  await expect(page.locator('[aria-label="Imported context preview"]')).toContainText("Retained authored product");
  await expect(page.getByRole("list", { name: "Selected files", exact: true })).toContainText("authored-product.json");
  await createReviewedProject(page);
});

test("legacy URLs lead to unified views with new and existing simulation paths", async ({ page }) => {
  const name = "Existing authored product";
  await previewProduct(page, name);
  await createReviewedProject(page);
  await page.goto("/runs");
  await expect(page).toHaveURL(/\/\?view=runs$/);
  await expect(page.getByRole("heading", { name: "Projects", exact: true })).toBeVisible();
  await expect(page.getByText("All simulation runs", { exact: true })).toBeVisible();
  await page.goto("/new-simulation");
  await expect(page).toHaveURL(/\/\?simulate=1(?:#simulation-chooser)?$/);
  const chooser = page.locator("#simulation-chooser");
  await expect(chooser.getByRole("heading", { name: "Existing product", exact: true })).toBeVisible();
  await expect(chooser.getByRole("link", { name: "Upload a new product", exact: true })).toHaveAttribute("href", "/projects/new");
  await chooser.getByRole("link", { name: `Set up a simulation for ${name}`, exact: true }).click();
  await expect(page.getByLabel("Target market", { exact: true })).toBeVisible();
  const navigation = page.getByRole("navigation", { name: "Primary navigation", exact: true });
  await expect(navigation.getByRole("link")).toHaveText(["Projects", "Sources", "Settings"]);
});
