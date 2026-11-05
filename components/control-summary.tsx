import { formatUsdCents, type SimulationExecutionSummary } from "@/lib/shared/simulation-controls";

function stopReasonText(reason: string) {
  const reasons: Record<string, string> = {
    operator_stop: "The operator requested stopping remaining personas after the current request.",
    run_deadline: "The run time limit was reached. Late findings are not accepted.",
    claim_expired: "Execution ownership expired. This run was not restarted.",
    admission_invalid: "The Gateway authorization could not be verified or is no longer valid.",
    cohort_invalid: "The saved persona selection could not be verified.",
    budget_target_reached: "The next estimated request would exceed the spending target.",
    gateway_cost_unknown: "A model attempt has an unknown charge. Later model calls were stopped.",
    gateway_failed: "A Gateway request failed. Review the saved findings and cost state.",
    execution_failed: "Execution did not finish. Available findings are retained.",
  };
  return Object.hasOwn(reasons, reason) ? reasons[reason] : "Execution stopped before the full cohort finished.";
}

export function formatExecutionSummaryMarkdown(summary: SimulationExecutionSummary) {
  return [
    "## Execution controls and coverage",
    summary.recorded
      ? `Configured engine: ${summary.engine}. Requested depth: ${summary.depth}. ${summary.budgetMode === "free-demo" ? "Free synthetic demo: no model calls." : `Estimated model spending target: $${formatUsdCents(summary.budgetLimitCents!)} USD; this is not a hard billing cap and final charges can exceed it.`}`
      : "Historical run: execution controls were not recorded. The original engine/budget fields do not establish a current spending policy.",
    `Coverage: ${summary.coverage.completed} completed, ${summary.coverage.failed} failed, ${summary.coverage.pending} pending/unexecuted of ${summary.coverage.scheduled} scheduled personas. Synthetic fallback findings: ${summary.coverage.syntheticFallback} (included in failed, not successful model coverage).`,
    `Known reported cost: ${summary.reportedCostCents === null ? "unknown" : `$${formatUsdCents(summary.reportedCostCents)} USD`}. Outstanding estimated reservations: $${formatUsdCents(summary.reservedCostCents)} USD. Unknown-cost attempts: ${summary.unknownCostAttempts}.`,
    summary.stopReason ? `Stop reason: ${stopReasonText(summary.stopReason)} Recorded reason: ${summary.stopReason}.` : "Stop reason: none recorded.",
    summary.qualification,
  ].join("\n\n");
}

export function ControlSummary({ summary }: { summary: SimulationExecutionSummary }) {
  return (
    <section role="note" aria-label="Execution controls and coverage" className="space-y-3 rounded-lg border p-4 text-sm">
      <h2 className="font-semibold">Execution controls and coverage</h2>
      {summary.recorded ? <dl className="grid gap-3 sm:grid-cols-3">
        <div><dt className="text-muted-foreground">Configured engine</dt><dd>{summary.engine === "fake" ? "Free synthetic demo" : "AI Gateway"}</dd></div>
        <div><dt className="text-muted-foreground">Requested depth</dt><dd className="capitalize">{summary.depth}</dd></div>
        <div><dt className="text-muted-foreground">{summary.budgetMode === "free-demo" ? "Model spending" : "Estimated spending target"}</dt><dd>${formatUsdCents(summary.budgetLimitCents!)} USD</dd></div>
      </dl> : <p>Historical run: execution controls were not recorded. Its original engine and budget fields do not establish the current spending policy.</p>}
      {summary.recorded ? <p className="text-muted-foreground">{summary.budgetMode === "free-demo" ? "Free demo makes no model requests. Requested depth does not change its deterministic synthetic output." : "The USD target is an estimate, not a hard billing cap. In-flight requests, routing and final charges can exceed it."}</p> : null}
      <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div><dt className="text-muted-foreground">Completed coverage</dt><dd>{summary.coverage.completed} of {summary.coverage.scheduled} personas</dd></div>
        <div><dt className="text-muted-foreground">Failed / pending or unexecuted</dt><dd>{summary.coverage.failed} / {summary.coverage.pending}</dd></div>
        <div><dt className="text-muted-foreground">Known reported cost</dt><dd>{summary.reportedCostCents === null ? "Unknown" : `$${formatUsdCents(summary.reportedCostCents)} USD`}</dd></div>
        <div><dt className="text-muted-foreground">Outstanding estimated reservations</dt><dd>${formatUsdCents(summary.reservedCostCents)} USD</dd></div>
      </dl>
      <p>{summary.coverage.syntheticFallback} synthetic fallback finding(s), included in failed coverage. Fallback findings are not successful model responses.</p>
      {summary.unknownCostAttempts > 0 ? <p className="font-medium">{summary.unknownCostAttempts} attempt(s) have an unknown charge. Known reported cost is not the final total.</p> : null}
      {summary.stopReason ? <p><strong>Stop reason:</strong> {stopReasonText(summary.stopReason)}</p> : null}
      <p className="text-muted-foreground">{summary.qualification}</p>
    </section>
  );
}
