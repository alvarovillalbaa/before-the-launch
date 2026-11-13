import { executeSavedSimulation } from "./simulation-steps";

export async function simulationWorkflow(runId: string) {
  "use workflow";
  console.info("Saved simulation workflow", { runId });
  return await executeSavedSimulation(runId);
}
