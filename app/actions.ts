"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  ProductBriefInputSchema,
  SimulationSetupInputSchema,
  SourceCreateInputSchema,
  type SourceKind,
} from "@/lib/shared/schemas";
import { createProductProject } from "@/lib/server/services/project-service";
import {
  createFileSource,
  createTextSource,
  createUrlSource,
  deleteSource,
} from "@/lib/server/services/source-ingestion";
import { createSimulationRun, deleteRun } from "@/lib/server/services/simulation-service";

function stringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function createProjectAction(formData: FormData) {
  const parsed = ProductBriefInputSchema.parse({
    productName: stringValue(formData, "productName"),
    category: stringValue(formData, "category"),
    icp: stringValue(formData, "icp"),
    market: stringValue(formData, "market"),
    expectedPrice: stringValue(formData, "expectedPrice"),
    competitors: stringValue(formData, "competitors"),
    launchChannel: stringValue(formData, "launchChannel"),
    positioningStatement: stringValue(formData, "positioningStatement"),
    notes: stringValue(formData, "notes"),
  });
  const project = await createProductProject(parsed);
  revalidatePath("/");
  redirect(`/projects/${project.id}`);
}

export async function addTextSourceAction(formData: FormData) {
  const parsed = SourceCreateInputSchema.parse({
    projectId: stringValue(formData, "projectId"),
    kind: stringValue(formData, "kind"),
    inputType: "text",
    title: stringValue(formData, "title") || "Manual note",
    text: stringValue(formData, "text"),
  });
  await createTextSource({
    projectId: parsed.projectId,
    kind: parsed.kind,
    title: parsed.title ?? "Manual note",
    text: parsed.text ?? "",
  });
  revalidatePath(`/projects/${parsed.projectId}`);
}

export async function addUrlSourceAction(formData: FormData) {
  const parsed = SourceCreateInputSchema.parse({
    projectId: stringValue(formData, "projectId"),
    kind: stringValue(formData, "kind"),
    inputType: "url",
    title: stringValue(formData, "title") || undefined,
    url: stringValue(formData, "url"),
  });
  await createUrlSource({
    projectId: parsed.projectId,
    kind: parsed.kind,
    title: parsed.title || undefined,
    url: parsed.url!,
  });
  revalidatePath(`/projects/${parsed.projectId}`);
}

export async function addFileSourceAction(formData: FormData) {
  const projectId = stringValue(formData, "projectId");
  const kind = stringValue(formData, "kind") as SourceKind;
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Choose a file to upload.");
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  await createFileSource({
    projectId,
    kind,
    title: stringValue(formData, "title") || file.name,
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    bytes,
  });
  revalidatePath(`/projects/${projectId}`);
}

export async function deleteSourceAction(formData: FormData) {
  const projectId = stringValue(formData, "projectId");
  await deleteSource(stringValue(formData, "sourceId"));
  revalidatePath(`/projects/${projectId}`);
}

export async function startSimulationAction(formData: FormData) {
  const personaIds = formData.getAll("personaIds").filter((value): value is string => typeof value === "string");
  const parsed = SimulationSetupInputSchema.parse({
    projectId: stringValue(formData, "projectId"),
    targetMarket: stringValue(formData, "targetMarket"),
    agentCount: Number(stringValue(formData, "agentCount") || "8"),
    depth: stringValue(formData, "depth") || "standard",
    budgetLimitCents: Number(stringValue(formData, "budgetLimitCents") || "0"),
    personaIds: personaIds.length ? personaIds : undefined,
  });
  const run = await createSimulationRun(parsed);
  revalidatePath(`/projects/${parsed.projectId}`);
  redirect(`/runs/${run.id}`);
}

export async function deleteRunAction(formData: FormData) {
  const projectId = stringValue(formData, "projectId");
  await deleteRun(stringValue(formData, "runId"));
  revalidatePath(`/projects/${projectId}`);
}
