"use server";

import { revalidatePath } from "next/cache";
import {
  createProductFromUploads, previewProductIntake, ProductIntakeError,
} from "@/lib/server/services/product-intake-service";
import type { ProductIntakeCreateResult, ProductIntakePreviewResult } from "@/lib/shared/product-intake";

export async function previewProductIntakeAction(formData: FormData): Promise<ProductIntakePreviewResult> {
  try {
    return { ok: true, preview: await previewProductIntake(formData) };
  } catch (error) {
    return { ok: false, error: error instanceof ProductIntakeError ? error.message : "The files could not be previewed. Check the selected files and server configuration, then try again." };
  }
}

export async function createProductFromUploadsAction(formData: FormData): Promise<ProductIntakeCreateResult> {
  let projectId: string;
  try {
    projectId = await createProductFromUploads(formData);
  } catch (error) {
    return { ok: false, error: error instanceof ProductIntakeError ? error.message : "The product could not be saved. Check local storage and database availability, then try again." };
  }
  // Cache invalidation cannot turn an already committed project into a failed save.
  try { revalidatePath("/"); } catch { /* The next navigation can load the saved project directly. */ }
  return { ok: true, projectId };
}
