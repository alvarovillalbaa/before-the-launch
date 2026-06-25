import { executeSimulationRun } from "@/lib/server/services/simulation-service";

export async function simulationWorkflow(runId: string) {
  "use workflow";
  await executeSimulationRun(runId);
  return { runId };
}
