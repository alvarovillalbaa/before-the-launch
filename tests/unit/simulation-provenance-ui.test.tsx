// Actual React server rendering and HTML parsing with authored records only.
// No browser, layout/focus proof, Next page, database, server process or model.
import { load } from "cheerio";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { AgentProvenanceNotice, SimulationProvenanceNotice } from "@/components/simulation-provenance";
import {
  bindSimulationProvenanceToOutputs,
  deriveAgentProvenance,
  summarizeSimulationProvenance,
  type AgentProvenance,
  type GeneratedResultOrigin,
  type SimulationProvenance,
} from "@/lib/shared/simulation-provenance";

const firstId = "11111111-1111-4111-8111-111111111111";
const secondId = "22222222-2222-4222-8222-222222222222";
const scoreId = "33333333-3333-4333-8333-333333333333";
const reportId = "44444444-4444-4444-8444-444444444444";
const result = { perceivedValueScore: 0, trustScore: 42, recommendation: "Authored finding, not a model response." };

function origin(value: GeneratedResultOrigin, id: string): AgentProvenance {
  const configuredEngine = value === "fake" ? "fake" : "gateway";
  return deriveAgentProvenance(configuredEngine, { id, result }, [{
    eventType: "judgment",
    metadata: { executionOrigin: { version: 1, configuredEngine, findingId: id, origin: value } },
  }]);
}

function matched(configuredEngine: string, origins: AgentProvenance[], findingIds: string[]): SimulationProvenance {
  const summary = summarizeSimulationProvenance(configuredEngine, origins);
  return bindSimulationProvenanceToOutputs(summary, {
    record: { version: 1, configuredEngine, scoreId, reportId, findingIds, summary },
    scoreId, reportId, findingIds,
  });
}

function rendered(summary: SimulationProvenance) {
  const html = renderToStaticMarkup(<SimulationProvenanceNotice provenance={summary} />);
  const $ = load(html);
  const notice = $('[role="note"][aria-label="Simulation result provenance"]');
  const counts = Object.fromEntries(notice.find("dl > div").toArray().map((element) => [
    $(element).find("dt").text(), Number($(element).find("dd").text()),
  ]));
  return { html, $, notice, counts };
}

it("provenance UI: mixed findings retain separate Gateway and synthetic counts in a labeled notice", () => {
  const summary = matched("gateway", [origin("gateway", firstId), origin("gateway-fallback", secondId)], [firstId, secondId]);
  const { notice, counts } = rendered(summary);

  expect(notice).toHaveLength(1);
  expect(notice.find("h2").text()).toBe("How these results were produced");
  expect(notice.text()).toContain("Mixed Gateway and synthetic simulation results");
  expect(notice.text()).toContain(summary.qualification);
  expect(notice.text()).toContain("Linked to these persona findings.");
  expect(notice.text()).toContain("The counts below describe the current persona findings.");
  expect(counts).toEqual({ "Gateway findings": 1, "Demo findings": 0, "Synthetic fallbacks": 1, "Unverified origins": 0, "Pending results": 0 });
});

it("provenance UI: fake and fallback cohorts remain explicitly synthetic after matched output linkage", () => {
  const cohorts = [
    matched("fake", [origin("fake", firstId)], [firstId]),
    matched("gateway", [origin("gateway-fallback", firstId)], [firstId]),
  ];
  for (const summary of cohorts) {
    const { notice, counts } = rendered(summary);
    expect(notice.text()).toContain("Synthetic demo simulation results");
    expect(notice.text()).toContain("deterministic synthetic demo output");
    expect(notice.text()).toContain("do not establish market fit or observed customer reactions");
    expect(counts["Gateway findings"]).toBe(0);
    expect(counts["Demo findings"] + counts["Synthetic fallbacks"]).toBe(1);
    expect(notice.text()).toContain(summary.qualification);
  }
});

it("provenance UI: a pending cohort names missing findings without claiming completed Gateway output", () => {
  const pending = deriveAgentProvenance("gateway", null, []);
  const summary = bindSimulationProvenanceToOutputs(summarizeSimulationProvenance("gateway", [pending, pending]), {
    record: null, scoreId: null, reportId: null, findingIds: [],
  });
  const { notice, counts } = rendered(summary);

  expect(notice.text()).toContain("No saved persona finding is available");
  expect(notice.text()).toContain("2 persona(s) have no saved finding yet");
  expect(notice.text()).toContain("Their origin is unverified from the recorded data.");
  expect(counts).toEqual({ "Gateway findings": 0, "Demo findings": 0, "Synthetic fallbacks": 0, "Unverified origins": 0, "Pending results": 2 });
  expect(notice.text()).not.toContain("AI Gateway simulation results");
});

it("provenance UI: positive Gateway counts do not promote an unbound aggregate or report", () => {
  const base = summarizeSimulationProvenance("gateway", [origin("gateway", firstId), origin("gateway", secondId)]);
  const summary = bindSimulationProvenanceToOutputs(base, { record: null, scoreId, reportId, findingIds: [firstId, secondId] });
  const { notice, counts } = rendered(summary);

  expect(counts["Gateway findings"]).toBe(2);
  expect(notice.text()).toContain("Aggregate origin unverified");
  expect(notice.text()).toContain("Their lineage to the saved aggregate scores and report is unverified");
  expect(notice.text()).toContain("Their origin is unverified from the recorded data.");
  expect(notice.text()).not.toContain("Linked to these persona findings.");
  expect(notice.text()).not.toContain("AI Gateway simulation results");
});

it("provenance UI: every persona origin exposes its visible label and full qualification", () => {
  const origins = [
    origin("gateway", firstId), origin("fake", firstId), origin("gateway-fallback", firstId),
    deriveAgentProvenance("gateway", { id: firstId, result }, []),
    deriveAgentProvenance("gateway", null, []),
  ];
  expect(origins.map((entry) => entry.origin)).toEqual(["gateway", "fake", "gateway-fallback", "unknown", "pending"]);
  for (const provenance of origins) {
    const $ = load(renderToStaticMarkup(<AgentProvenanceNotice provenance={provenance} />));
    const notice = $('[role="note"][aria-label="Persona result provenance"]');
    expect(notice).toHaveLength(1);
    expect(notice.find('[data-slot="badge"]').text()).toBe(provenance.label);
    expect(notice.find("p").text()).toBe(provenance.qualification);
    expect(notice.find('[hidden], [aria-hidden="true"]')).toHaveLength(0);
  }
});

it("provenance UI: authored markup stays escaped text without mutating provenance inputs", () => {
  const label = '<img src=x onerror="authored()"> & literal label';
  const qualification = '<script>authored()</script> and <svg onload="authored()"> remain text.';
  const summary = { ...matched("fake", [origin("fake", firstId)], [firstId]), label, qualification };
  const persona = { ...deriveAgentProvenance("gateway", { id: firstId, result }, []), label, qualification };
  const before = JSON.stringify({ summary, persona });
  const html = renderToStaticMarkup(<><SimulationProvenanceNotice provenance={summary} /><AgentProvenanceNotice provenance={persona} /></>);
  const $ = load(html);

  expect($("script, img, svg, iframe")).toHaveLength(0);
  expect($('[aria-label="Simulation result provenance"]').find('[data-slot="badge"]').text()).toBe(label);
  expect($('[aria-label="Persona result provenance"]').find('[data-slot="badge"]').text()).toBe(label);
  expect($('[aria-label="Simulation result provenance"]').find("p").first().text()).toBe(qualification);
  expect($('[aria-label="Persona result provenance"]').find("p").text()).toBe(qualification);
  expect(JSON.stringify({ summary, persona })).toBe(before);
});
