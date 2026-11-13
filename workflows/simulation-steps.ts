import { FatalError, getWorkflowMetadata } from "workflow";
import { executeSimulationRun } from "@/lib/server/services/simulation-service";
import { bindSimulationWorkflowRun } from "@/lib/server/services/simulation-dispatch-store";

export async function executeSavedSimulation(runId: string) {
  "use step";
  const { workflowRunId } = getWorkflowMetadata();
  console.info("Simulation execution step", { runId, workflowRunId });
  try {
    // The worker also binds its owner, recovering a lost start acknowledgment.
    await bindSimulationWorkflowRun(runId, workflowRunId);
    const run = await executeSimulationRun(runId);
    return { runId, status: run?.status ?? "missing" };
  } catch {
    // The SQL claim and its existing expiry/reconciliation retain uncertain work.
    throw new FatalError("Saved simulation execution was not confirmed. Inspect its saved status.");
  }
}

// A crashed body may have made a model request. Recovery must not replay it.
executeSavedSimulation.maxRetries = 0;
