import { DATABASE_UNAVAILABLE_STATUS, databaseUnavailableErrorBody, isDatabaseUnavailableError } from "@/lib/server/db/errors";
import { SimulationControlError } from "./simulation-service";

const messages: Record<string, string> = {
  request_conflict: "This creation request already belongs to different settings. Check the saved run before starting a new request.",
  gateway_pricing_unavailable: "Gateway is unavailable. The owner must configure credentials and available model pricing before starting a model run.",
  operator_required: "Sign in again before authorizing a model run.",
  project_not_found: "The project could not be found.",
  run_not_found: "The run could not be found.",
  brief_required: "Save a current product brief before starting a run.",
  cohort_invalid: "Choose the complete persona selection again. Some selected personas are unavailable.",
  invalid_simulation_intent: "Check the target market, persona selection, depth and spending amount.",
  invalid_execution_policy: "Free demo requires zero model spending; Gateway requires a positive estimated USD target.",
  run_active: "Stop the active run before deleting it.",
  active_run_cannot_be_deleted: "Stop the active run before deleting it.",
  execution_controls_missing: "This historical run has no recorded execution controls.",
};

export function simulationErrorResponse(error: unknown) {
  const headers = { "Cache-Control": "private, no-store" };
  if (isDatabaseUnavailableError(error)) return Response.json(databaseUnavailableErrorBody(), { status: DATABASE_UNAVAILABLE_STATUS, headers });
  if (error instanceof SimulationControlError) return Response.json({ ok: false, error: { code: error.code, message: messages[error.code] ?? "The run could not continue with its saved settings. Refresh its status before retrying." } }, { status: error.status, headers });
  return Response.json({ ok: false, error: { code: "SIMULATION_UNAVAILABLE", message: "The simulation could not be saved. Check the run history before retrying." } }, { status: 500, headers });
}
