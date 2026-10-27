import type { ProductBriefInput } from "@/lib/shared/schemas";

export const INTAKE_MAX_FILES = 5;
export const INTAKE_MAX_TOTAL_BYTES = 750 * 1024;
export const INTAKE_MAX_EXTRACTED_CHARACTERS = 400_000;
export const INTAKE_EXTENSIONS: string[] = [".txt", ".md", ".csv", ".json", ".pdf", ".docx"];

export const INTAKE_FIELDS = [
  "productName", "category", "icp", "market", "expectedPrice", "competitors",
  "launchChannel", "positioningStatement", "notes",
] as const satisfies readonly (keyof ProductBriefInput)[];

// Existing ProductBriefInputSchema maxima; this upload path alone permits omissions.
export const INTAKE_FIELD_LIMITS: Record<keyof ProductBriefInput, number> = {
  productName: 160,
  category: 120,
  icp: 500,
  market: 160,
  expectedPrice: 120,
  competitors: 1000,
  launchChannel: 160,
  positioningStatement: 1200,
  notes: 4000,
};

export type ProductIntakePreview = {
  digest: string;
  projectName: string;
  brief: ProductBriefInput;
  nameFromFile: boolean;
  files: { name: string; byteSize: number; characterCount: number; excerpt: string }[];
  // A filename label does not count as a supplied productName fact.
  missingFields: (keyof ProductBriefInput)[];
  fieldSources: Partial<Record<keyof ProductBriefInput, string>>;
  warnings: string[];
};

export type ProductIntakePreviewResult =
  | { ok: true; preview: ProductIntakePreview }
  | { ok: false; error: string };

export type ProductIntakeCreateResult =
  | { ok: true; projectId: string }
  | { ok: false; error: string };
