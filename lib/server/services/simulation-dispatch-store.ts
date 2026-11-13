import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@/lib/server/db/client";
import { simulationRuns } from "@/lib/server/db/schema";
import { SimulationControlError } from "./simulation-execution-store";

export async function readSimulationDispatchRun(runId: string) {
  const [run] = await getDb().select().from(simulationRuns).where(eq(simulationRuns.id, runId)).limit(1);
  if (!run) throw new SimulationControlError("run_not_found", 404);
  return run;
}

export async function bindSimulationWorkflowRun(runId: string, workflowRunId: string) {
  if (typeof workflowRunId !== "string" || !workflowRunId || workflowRunId.length > 160 || /[\u0000-\u0020\u007f]/.test(workflowRunId)) {
    throw new SimulationControlError("workflow_binding_invalid", 503);
  }
  const [bound] = await getDb().update(simulationRuns).set({ workflowRunId, updatedAt: new Date() })
    .where(and(eq(simulationRuns.id, runId), isNull(simulationRuns.workflowRunId))).returning();
  if (bound) return bound;
  const current = await readSimulationDispatchRun(runId);
  if (current.workflowRunId !== workflowRunId) throw new SimulationControlError("workflow_binding_conflict", 409);
  return current;
}
