import { expect, test, type BrowserContext, type Page } from "@playwright/test";

// Actual app + disposable PostgreSQL, authored data and free runs only. No model mocking.
const ORIGIN = "http://127.0.0.1:3100";
const DATABASE = "postgres://execution_ci:disposable_ci_only@127.0.0.1:54329/before_launch_execution_ci";
const externalRequests = new WeakMap<BrowserContext, string[]>();

test.beforeEach(async ({ context, baseURL }) => {
  if (process.env.CI !== "true" || process.env.EXECUTION_CONTROLS_TEST_TARGET !== "local-disposable"
    || process.env.DATABASE_URL !== DATABASE || process.env.EXECUTION_CONTROLS_TEST_DATABASE_URL !== DATABASE || baseURL !== ORIGIN) {
    throw new Error("Execution controls browser checks require the exact disposable CI database and loopback app.");
  }
  if (["AI_GATEWAY_API_KEY", "VERCEL_OIDC_TOKEN", "OPENAI_API_KEY", "ANTHROPIC_API_KEY", "GOOGLE_GENERATIVE_AI_API_KEY"].some((name) => Boolean(process.env[name]))) {
    throw new Error("Provider credentials must be blank for execution controls browser checks.");
  }
  const key = process.env.EXECUTION_CONTROLS_OPERATOR_KEY;
  if (!key || !/^[\x21-\x7e]{32,256}$/.test(key)) throw new Error("The authored operator fixture key is required.");
  const blocked: string[] = [];
  externalRequests.set(context, blocked);
  await context.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.origin === ORIGIN) await route.continue();
    else { blocked.push(url.origin); await route.abort("blockedbyclient"); }
  });
});

test.afterEach(async ({ context }) => {
  expect(externalRequests.get(context) ?? [], "No external browser request is permitted").toEqual([]);
});

async function login(page: Page, touch = false) {
  await page.goto("/login");
  await page.getByLabel("Operator access key", { exact: true }).fill(process.env.EXECUTION_CONTROLS_OPERATOR_KEY!);
  const response = page.waitForResponse((value) => value.url() === `${ORIGIN}/api/operator/login` && value.request().method() === "POST");
  if (touch) await page.getByRole("button", { name: "Open workspace", exact: true }).tap();
  else await page.getByRole("button", { name: "Open workspace", exact: true }).click();
  const loginResponse = await response;
  let failureContext: string | undefined;
  if (loginResponse.status() !== 200) {
    const request = loginResponse.request();
    const [origin, host, site] = await Promise.all([request.headerValue("origin"), request.headerValue("host"), request.headerValue("sec-fetch-site")]);
    const bounded = (value: string | null, maximum: number) => value === null ? null
      : value.length <= maximum && /^[\x20-\x7e]*$/.test(value) ? value : "[invalid_or_oversized]";
    const body: unknown = await loginResponse.json().catch(() => null);
    const error = body && typeof body === "object" && "error" in body ? body.error : null;
    const fixedErrors = ["A same-origin request is required.", "Operator access is not configured.", "Invalid sign-in request.", "Access key was not accepted."];
    failureContext = JSON.stringify({ path: "/api/operator/login", status: loginResponse.status(),
      origin: bounded(origin, 160), host: bounded(host, 160), secFetchSite: bounded(site, 24),
      responseError: typeof error === "string" && fixedErrors.includes(error) ? error : "[unrecognized_response_error]" });
  }
  expect(loginResponse.status(), failureContext).toBe(200);
  await expect(page).toHaveURL(`${ORIGIN}/`);
}

async function project(page: Page, name: string) {
  const response = await page.request.post(`${ORIGIN}/api/projects`, {
    headers: { Origin: ORIGIN },
    data: {
      productName: name, category: "Authored paper planning", icp: "Independent bookshop owners",
      market: "Authored bookshop market", expectedPrice: "$12 USD", competitors: "Paper diaries",
      launchChannel: "Bookshop newsletter", positioningStatement: "A clear paper planning workflow with authored proof.",
      notes: "Disposable execution-controls acceptance fixture; no customer content.",
    },
  });
  expect(response.status()).toBe(201);
  const body = await response.json();
  expect(body.ok).toBe(true);
  expect(body.data.id).toMatch(/^[a-f0-9-]{36}$/);
  await page.goto(`/projects/${body.data.id}?tab=setup`);
  await expect(page.getByRole("form", { name: "Simulation setup", exact: true })).toBeVisible();
  return body.data.id as string;
}

async function selectCohort(page: Page, count: number, touch = false) {
  const choices = page.getByRole("form", { name: "Simulation setup", exact: true }).locator('input[name="personaIds"]');
  expect(await choices.count()).toBeGreaterThanOrEqual(count);
  for (let index = 0; index < await choices.count(); index++) {
    const selected = index < count;
    if (await choices.nth(index).isChecked() !== selected) {
      if (touch) await choices.nth(index).tap();
      else await choices.nth(index).setChecked(selected);
    }
  }
  await expect(page.locator("#simulation-personas-help")).toContainText(`${count} persona`);
}

async function completed(page: Page, count: number) {
  await expect(page).toHaveURL(/\/runs\/[a-f0-9-]{36}$/);
  await expect(page.getByRole("region", { name: "Run progress and controls", exact: true })).toContainText("Run finished", { timeout: 30_000 });
  const coverage = page.getByRole("note", { name: "Execution controls and coverage", exact: true });
  await expect(coverage).toContainText(`${count} of ${count} personas`);
  await expect(coverage).toContainText("Free synthetic demo");
  await expect(coverage).toContainText("$0.00 USD");
  await expect(coverage).toContainText("0 synthetic fallback");
}

test("desktop operator login protects workspace reads and rejects cross-origin writes", async ({ page }) => {
  await page.goto("/projects/11111111-1111-4111-8111-111111111111");
  await expect(page).toHaveURL(/\/login\?next=/);
  const unauthorized = await page.request.get(`${ORIGIN}/api/projects`);
  expect(unauthorized.status()).toBe(401);
  await login(page);
  const cookies = await page.context().cookies(ORIGIN);
  const session = cookies.find((cookie) => cookie.name === "btl_operator");
  expect(session?.httpOnly).toBe(true);
  expect(session?.sameSite).toBe("Strict");
  expect(session?.secure).toBe(false); // This owned CI server uses development HTTP.
  const forbidden = await page.request.post(`${ORIGIN}/api/runs`, { headers: { Origin: "https://authored.invalid" }, data: {} });
  expect(forbidden.status()).toBe(403);
});

test("desktop setup retains Standard free defaults and rejects an empty selected cohort", async ({ page }) => {
  await login(page);
  await project(page, "Authored defaults and cohort");
  await expect(page.getByLabel("Engine", { exact: true })).toHaveValue("fake");
  await expect(page.getByLabel("Depth", { exact: true })).toHaveValue("standard");
  await expect(page.getByLabel("Estimated model spending target (USD)", { exact: true })).toHaveValue("0.00");
  await expect(page.getByLabel("Estimated model spending target (USD)", { exact: true })).toBeDisabled();
  await page.getByLabel("Target market", { exact: true }).fill("Retained authored audience");
  await selectCohort(page, 0);
  let creations = 0;
  page.on("request", (request) => { if (request.url() === `${ORIGIN}/api/runs` && request.method() === "POST") creations++; });
  await page.getByRole("button", { name: "Create simulation run", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("select between 1 and 10 personas");
  await expect(page.getByLabel("Target market", { exact: true })).toHaveValue("Retained authored audience");
  expect(creations).toBe(0);
});

test("desktop Gateway requires exact positive USD and stays unavailable without provider credentials", async ({ page }) => {
  await login(page);
  await project(page, "Authored Gateway unavailable");
  await selectCohort(page, 1);
  await page.getByLabel("Engine", { exact: true }).selectOption("gateway");
  const budget = page.getByLabel("Estimated model spending target (USD)", { exact: true });
  await expect(page.locator("#simulation-budget-help")).toContainText("not a hard billing cap");
  await budget.fill("0.001");
  await page.getByRole("button", { name: "Create simulation run", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("at most two decimal places");
  await budget.fill("0");
  await page.getByRole("button", { name: "Create simulation run", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Gateway requires an estimated spending target");
  await budget.fill("1.25");
  const response = page.waitForResponse((value) => value.url() === `${ORIGIN}/api/runs` && value.request().method() === "POST");
  await page.getByRole("button", { name: "Create simulation run", exact: true }).click();
  const refused = await response;
  expect(refused.status()).toBe(503);
  expect(refused.request().postDataJSON()).toMatchObject({ engine: "gateway", budgetLimitCents: 125, agentCount: 1, depth: "standard" });
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page.getByLabel("Engine", { exact: true })).toHaveValue("gateway");
  await expect(budget).toHaveValue("1.25");
  await expect(page).toHaveURL(/\?tab=setup$/);
});

test("desktop free run persists traces and qualified report and exact creation retry returns the same run", async ({ page }) => {
  await login(page);
  await project(page, "Authored persisted free run");
  await selectCohort(page, 2);
  const created = page.waitForResponse((value) => value.url() === `${ORIGIN}/api/runs` && value.request().method() === "POST");
  await page.getByRole("button", { name: "Create simulation run", exact: true }).click();
  const response = await created;
  expect(response.status()).toBe(201);
  const intent = response.request().postDataJSON();
  expect(intent).toMatchObject({ engine: "fake", depth: "standard", budgetLimitCents: 0, agentCount: 2 });
  expect(intent.personaIds).toHaveLength(2);
  expect(intent.requestId).toMatch(/^[a-f0-9-]{36}$/);
  await completed(page, 2);
  const runURL = page.url();
  const id = new URL(runURL).pathname.split("/").at(-1);
  const retry = await page.request.post(`${ORIGIN}/api/runs`, { headers: { Origin: ORIGIN }, data: intent });
  expect(retry.ok()).toBe(true);
  expect((await retry.json()).run.id).toBe(id);
  const conflict = await page.request.post(`${ORIGIN}/api/runs`, { headers: { Origin: ORIGIN }, data: { ...intent, depth: "deep" } });
  expect(conflict.status()).toBe(409);
  await page.reload();
  await completed(page, 2);
  await page.getByRole("tab", { name: "Trace detail", exact: true }).click();
  await expect(page.getByRole("tabpanel")).toContainText("Synthetic demo");
  await page.getByRole("tab", { name: "Report", exact: true }).click();
  const report = page.getByRole("region", { name: "Qualified Markdown report", exact: true });
  await expect(report).toContainText("Execution controls and coverage");
  await expect(report).toContainText("2 completed");
  await expect(report).toContainText("## Recorded report (unchanged)");
  expect(page.url()).toBe(runURL);
});

test.describe("narrow touch execution controls", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("mobile touch selects the exact cohort and reloads a completed free run without overflow", async ({ page }) => {
    await login(page, true);
    await project(page, "Authored touch free run");
    await selectCohort(page, 1, true);
    await expect(page.getByLabel("Depth", { exact: true })).toHaveValue("standard");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: "Create simulation run", exact: true }).tap();
    await completed(page, 1);
    await page.reload();
    await completed(page, 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test("mobile ambiguous creation failure retains setup and retries the identical request once", async ({ page }) => {
    await login(page, true);
    await project(page, "Authored touch retained request");
    await selectCohort(page, 1, true);
    const intents: unknown[] = [];
    let abortFirst = true;
    await page.route(`${ORIGIN}/api/runs`, async (route) => {
      if (route.request().method() !== "POST") { await route.continue(); return; }
      intents.push(route.request().postDataJSON());
      if (abortFirst) { abortFirst = false; await route.abort("failed"); }
      else await route.continue();
    });
    await page.getByRole("button", { name: "Create simulation run", exact: true }).tap();
    await expect(page.getByRole("alert")).toContainText("same request ID");
    await expect(page.getByLabel("Target market", { exact: true })).toHaveValue("Authored bookshop market");
    await expect(page.getByLabel("Target market", { exact: true })).toBeDisabled();
    await page.getByRole("button", { name: "Retry same creation request", exact: true }).tap();
    await completed(page, 1);
    expect(intents).toHaveLength(2);
    expect(intents[1]).toEqual(intents[0]);
    expect((intents[0] as { requestId: string }).requestId).toMatch(/^[a-f0-9-]{36}$/);
  });
});
