// Authored SSR only: no browser interactions, timers, fetch, database or model calls.
import { load } from "cheerio";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import { ControlSummary, formatExecutionSummaryMarkdown } from "@/components/control-summary";
import { RunMonitor } from "@/components/run-monitor";
import { SimulationSetupForm } from "@/components/simulation-setup-form";
import { createExecutionPolicy, summarizeExecutionControls } from "@/lib/shared/simulation-controls";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));

const projectId = "11111111-1111-4111-8111-111111111111";
const requestId = "22222222-2222-4222-8222-222222222222";
const runId = "33333333-3333-4333-8333-333333333333";
const personas = [
  { id: "44444444-4444-4444-8444-444444444444", name: "Authored customer", description: "Authored context", isDefault: true },
  { id: "55555555-5555-4555-8555-555555555555", name: "Authored skeptic", description: "Other context", isDefault: false },
];
function form(hasBrief = true, selectedPersonas = personas) {
  return load(renderToStaticMarkup(<SimulationSetupForm projectId={projectId} initialRequestId={requestId} defaultTargetMarket="Authored market" personas={selectedPersonas} hasBrief={hasBrief} />));
}
function summary(engine: "fake" | "gateway" = "fake") {
  return summarizeExecutionControls(createExecutionPolicy({ engine, depth: "standard", modelId: engine === "gateway" ? "authored/model" : null, budgetLimitCents: engine === "gateway" ? 125 : 0 }), {
    status: "completed", scheduled: 2, completed: 2, failed: 0, pending: 0,
    reportedNanoUsd: engine === "fake" ? 0 : 10_000_000, reservedNanoUsd: 0, unknownCostAttempts: 0, stopReason: null,
  });
}

it("execution UI: setup defaults to free demo, Standard depth and explicit USD units", () => {
  const $ = form();
  expect($("select[name=engine] option[selected]").val()).toBe("fake");
  expect($("select[name=depth] option[selected]").val()).toBe("standard");
  expect($("input[name=budgetUsd]").val()).toBe("0.00");
  expect($("input[name=budgetUsd]").is(":disabled")).toBe(true);
  expect($("label[for=simulation-budget]").text()).toContain("USD");
  expect($("body").text()).toContain("makes no model requests");
});

it("execution UI: persona count derives from the exact default selection without an independent count control", () => {
  const $ = form();
  expect($("input[name=personaIds]").length).toBe(2);
  expect($("input[name=personaIds][checked]").map((_, element) => $(element).val()).get()).toEqual([personas[0].id]);
  expect($("input[name=agentCount]").length).toBe(0);
  expect($("#simulation-personas-help").text()).toContain("1 persona selected");
});

it("execution UI: an empty default cohort stays visibly empty rather than silently selecting personas", () => {
  const $ = form(true, personas.map((persona) => ({ ...persona, isDefault: false })));
  expect($("input[name=personaIds][checked]").length).toBe(0);
  expect($("#simulation-personas-help").text()).toContain("0 personas selected");
  expect($("#simulation-personas-help").text()).toContain("Select between 1 and 10");
});

it("execution UI: a missing brief prevents creation while Gateway remains an explicit available choice", () => {
  const $ = form(false);
  expect($("button[type=submit]").is(":disabled")).toBe(true);
  expect($("body").text()).toContain("A current product brief is required");
  expect($("option[value=gateway]").is(":disabled")).toBe(false);
  expect($("option[value=gateway]").text()).toContain("estimated spending target");
});

it("execution UI: authored persona and market markup remains escaped text", () => {
  const $ = load(renderToStaticMarkup(<SimulationSetupForm projectId={projectId} initialRequestId={requestId} defaultTargetMarket={'<img src=x onerror="authored()">'} personas={[{ ...personas[0], name: "<script>authored()</script>", description: "<iframe>authored</iframe>" }]} hasBrief />));
  expect($("script,img,iframe").length).toBe(0);
  expect($("input[name=targetMarket]").val()).toBe('<img src=x onerror="authored()">');
  expect($("body").text()).toContain("<script>authored()</script>");
});

it("execution UI: free demo summary names deterministic output and zero model spending", () => {
  const $ = load(renderToStaticMarkup(<ControlSummary summary={summary()} />));
  const notice = $('[role=note][aria-label="Execution controls and coverage"]');
  expect(notice.length).toBe(1);
  expect(notice.text()).toContain("Free synthetic demo");
  expect(notice.text()).toContain("$0.00 USD");
  expect(notice.text()).toContain("no model requests");
  expect(notice.text()).toContain("deterministic synthetic output");
});

it("execution UI: Gateway summary distinguishes estimated target, known cost and unknown charges", () => {
  const value = { ...summary("gateway"), reportedCostCents: 1, reservedCostCents: 25, unknownCostAttempts: 1 };
  const $ = load(renderToStaticMarkup(<ControlSummary summary={value} />));
  expect($("body").text()).toContain("$1.25 USD");
  expect($("body").text()).toContain("not a hard billing cap");
  expect($("body").text()).toContain("Known reported cost$0.01 USD");
  expect($("body").text()).toContain("Outstanding estimated reservations$0.25 USD");
  expect($("body").text()).toContain("1 attempt(s) have an unknown charge");
  expect($("body").text()).toContain("not the final total");
});

it("execution UI: partial synthetic fallback does not inflate completed model coverage", () => {
  const value = { ...summary("gateway"), status: "partial", coverage: { scheduled: 4, completed: 1, failed: 1, pending: 2, syntheticFallback: 1 }, stopReason: "cost_unknown" };
  const $ = load(renderToStaticMarkup(<ControlSummary summary={value} />));
  expect($("body").text()).toContain("1 of 4 personas");
  expect($("body").text()).toContain("1 synthetic fallback finding(s), included in failed coverage");
  expect($("body").text()).toContain("not successful model responses");
  expect($("body").text()).toContain("Stop reason:");
});

it("execution UI: historical controls stay unrecorded and missing cost stays unknown", () => {
  const value = summarizeExecutionControls(null, { status: "failed", scheduled: 2, completed: 0, failed: 1, pending: 1, reportedNanoUsd: null, reservedNanoUsd: 0, unknownCostAttempts: 0, stopReason: null });
  const $ = load(renderToStaticMarkup(<ControlSummary summary={value} />));
  expect($("body").text()).toContain("Historical run: execution controls were not recorded");
  expect($("body").text()).toContain("Known reported costUnknown");
  expect($("body").text()).not.toContain("Requested depth");
  expect($("body").text()).not.toContain("Free synthetic demo");
});

it("execution UI: active monitor exposes stop remaining without promising provider cancellation", () => {
  const $ = load(renderToStaticMarkup(<RunMonitor runId={runId} status="running" updatedAt="2026-11-05T10:00:00.000Z" recordedControls />));
  expect($("button").text()).toBe("Stop remaining personas");
  expect($("body").text()).toContain("does not promise to abort a provider request");
  expect($("body").text()).toContain("incur a charge");
});

it("execution UI: terminal and unrecorded monitors expose no new execution or stop action", () => {
  for (const [status, recordedControls] of [["partial", true], ["failed", true], ["completed", true], ["queued", false]] as const) {
    const $ = load(renderToStaticMarkup(<RunMonitor runId={runId} status={status} updatedAt="2026-11-05T10:00:00.000Z" recordedControls={recordedControls} />));
    expect($("button").length).toBe(0);
    if (!recordedControls) expect($("body").text()).toContain("not automatically started");
  }
});

it("execution UI: copied current controls retain incomplete coverage and unknown cost qualifications", () => {
  const value = { ...summary("gateway"), reportedCostCents: null, unknownCostAttempts: 1, coverage: { scheduled: 2, completed: 0, failed: 1, pending: 1, syntheticFallback: 1 }, stopReason: "cost_unknown" };
  const before = JSON.stringify(value);
  const markdown = formatExecutionSummaryMarkdown(value);
  expect(markdown).toContain("not a hard billing cap");
  expect(markdown).toContain("0 completed, 1 failed, 1 pending/unexecuted of 2 scheduled");
  expect(markdown).toContain("Known reported cost: unknown");
  expect(markdown).toContain("not successful model coverage");
  expect(JSON.stringify(value)).toBe(before);
});
