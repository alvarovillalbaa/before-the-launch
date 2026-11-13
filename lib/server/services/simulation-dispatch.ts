import { getRun, start } from "workflow/api";
import { HookConflictError } from "workflow/errors";
import { simulationWorkflow } from "@/workflows/simulation-workflow";
import { bindSimulationWorkflowRun, readSimulationDispatchRun } from "./simulation-dispatch-store";
import { SimulationControlError, type RunRow } from "./simulation-execution-store";
import { finalizeFailedSimulationDispatch } from "./simulation-service";

export type SimulationDispatch = {
  confirmed: boolean;
  run: RunRow;
  error?: { code: string; message: string };
};

async function readBoundDispatch(run: RunRow): Promise<SimulationDispatch> {
  if (run.status !== "queued" || !run.workflowRunId) return { confirmed: true, run };
  const status = await getRun(run.workflowRunId).status;
  if (["failed", "cancelled"].includes(status)) {
    return { confirmed: true, run: await finalizeFailedSimulationDispatch(run.id, run.workflowRunId) };
  }
  return { confirmed: true, run };
}

/** The caller supplies a saved server row, never a client-selected execution record. */
export async function dispatchSavedSimulationRun(savedRun: RunRow): Promise<SimulationDispatch> {
  let current = savedRun;
  try {
    current = await readSimulationDispatchRun(savedRun.id);
    if (current.status !== "queued" || current.workflowRunId) return await readBoundDispatch(current);
    let workflowRunId: string;
    try {
      const workflow = await start(simulationWorkflow, [current.id], {
        experimental_hook: { token: `before-the-launch:simulation:${current.id}`, experimental_minRetention: "1 day" },
      });
      workflowRunId = workflow.runId;
    } catch (error) {
      if (!HookConflictError.is(error)) throw error;
      workflowRunId = error.conflictingRunId;
    }
    return await readBoundDispatch(await bindSimulationWorkflowRun(current.id, workflowRunId));
  } catch (error) {
    const conflict = error instanceof SimulationControlError && error.code === "workflow_binding_conflict";
    // Never serialize database/provider errors or silently overwrite another binding.
    console.warn("Simulation dispatch not confirmed", { runId: savedRun.id,
      code: conflict ? "workflow_binding_conflict" : "workflow_dispatch_unconfirmed" });
    return { confirmed: false, run: current, error: {
      code: conflict ? "workflow_binding_conflict" : "workflow_dispatch_unconfirmed",
      message: conflict ? "This saved run has conflicting execution records. Stop and review it before starting another simulation."
        : "The run is saved, but its execution request could not be confirmed. Check its status or retry this same saved run.",
    } };
  }
}
