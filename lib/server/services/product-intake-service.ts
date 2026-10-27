import { randomUUID } from "node:crypto";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { eq } from "drizzle-orm";
import { getServerEnv } from "@/lib/server/config/env";
import { getDb } from "@/lib/server/db/client";
import { personas, productBriefs, productProjects, sourceChunks, sources, workspaces } from "@/lib/server/db/schema";
import {
  INTAKE_EXTENSIONS, INTAKE_FIELDS, INTAKE_FIELD_LIMITS, INTAKE_MAX_EXTRACTED_CHARACTERS,
  INTAKE_MAX_FILES, INTAKE_MAX_TOTAL_BYTES, type ProductIntakePreview,
} from "@/lib/shared/product-intake";
import type { ProductBriefInput } from "@/lib/shared/schemas";
import { defaultPersonas } from "./personas";
import { chunkText, extractFileText, sha256 } from "./source-ingestion";

export class ProductIntakeError extends Error {}

const MIME_TYPES: Record<string, string> = {
  ".txt": "text/plain", ".md": "text/markdown", ".csv": "text/csv", ".json": "application/json",
  ".pdf": "application/pdf", ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};
const EXCERPT_CHARACTERS = 1200;
type PreparedFile = { name: string; extension: string; mimeType: string; bytes: Buffer; text: string; contentHash: string };

function validation(message: string): never {
  throw new ProductIntakeError(message);
}

function safeFileName(value: string): string {
  const name = value.replace(/\\/g, "/").split("/").pop()!.replace(/[\u0000-\u001f\u007f]/g, "").trim();
  if (!name || name.length > 220) validation("Choose files with names between 1 and 220 characters.");
  return name;
}

function hasUnpairedSurrogate(value: string): boolean {
  for (let index = 0; index < value.length; index++) {
    const code = value.charCodeAt(index);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(++index);
      if (!(next >= 0xdc00 && next <= 0xdfff)) return true;
    } else if (code >= 0xdc00 && code <= 0xdfff) return true;
  }
  return false;
}

function rejectDuplicateJsonKeys(text: string, name: string) {
  // JSON.parse has already checked syntax. Scan string tokens outside other strings
  // so duplicate keys cannot silently replace an explicitly supplied brief field.
  const stack: (Set<string> | null)[] = [];
  for (let index = 0; index < text.length; index++) {
    const character = text[index];
    if (character === "{") stack.push(new Set());
    else if (character === "[") stack.push(null);
    else if (character === "}" || character === "]") stack.pop();
    else if (character === '"') {
      const start = index;
      for (index++; index < text.length; index++) {
        if (text[index] === "\\") index++;
        else if (text[index] === '"') break;
      }
      let next = index + 1;
      while (/\s/.test(text[next] ?? "") && next < text.length) next++;
      const keys = stack[stack.length - 1];
      if (text[next] === ":" && keys) {
        const key = JSON.parse(text.slice(start, index + 1)) as string;
        if (keys.has(key)) validation(`${name} repeats a JSON field. Use each structured brief field once.`);
        keys.add(key);
      }
    }
  }
}

function structuredBrief(text: string, file: PreparedFile, warnings: string[]): Record<string, unknown> | null {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    if (file.extension === ".json") validation(`${file.name} is not valid JSON. Correct it or upload the content as a text file.`);
    return null;
  }
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const object = value as Record<string, unknown>;
  const keys = Object.keys(object);
  const wrapped = Object.hasOwn(object, "productBrief");
  const recognized = wrapped || keys.some(key => (INTAKE_FIELDS as readonly string[]).includes(key));
  if (!recognized) {
    if (file.extension === ".json") warnings.push(`${file.name} is JSON source context; it contains no top-level structured brief fields.`);
    return null;
  }
  rejectDuplicateJsonKeys(text, file.name);
  if (wrapped) {
    if (keys.length !== 1) validation(`${file.name}: put brief fields inside productBrief and move unrelated JSON into a separate context file.`);
    const brief = object.productBrief;
    if (typeof brief !== "object" || brief === null || Array.isArray(brief)) validation(`${file.name}: productBrief must be an object of brief fields with string values.`);
    value = brief;
  }
  const brief = value as Record<string, unknown>;
  if (Object.keys(brief).some(key => !(INTAKE_FIELDS as readonly string[]).includes(key))) {
    validation(`${file.name} has an unknown structured brief field. Use only the fields listed in the supported brief file format.`);
  }
  return brief;
}

async function prepareIntake(formData: FormData): Promise<{ preview: ProductIntakePreview; files: PreparedFile[] }> {
  if (!(formData instanceof FormData)) validation("Choose product files to preview.");
  const entries = formData.getAll("files");
  if (entries.length < 1 || entries.length > INTAKE_MAX_FILES) validation(`Choose between 1 and ${INTAKE_MAX_FILES} files.`);
  const env = getServerEnv();
  let totalBytes = 0;
  const uploads = entries.map(entry => {
    if (!(entry instanceof File) || entry.size === 0) validation("Every selected file must contain readable content. Remove empty files and try again.");
    const name = safeFileName(entry.name);
    const extension = path.extname(name).toLowerCase();
    if (!INTAKE_EXTENSIONS.includes(extension)) validation(`${name}: choose a TXT, Markdown, CSV, JSON, PDF, or DOCX file.`);
    if (entry.size > env.MAX_UPLOAD_BYTES) validation(`${name} exceeds the configured per-file upload limit. Use a smaller file.`);
    totalBytes += entry.size;
    if (totalBytes > INTAKE_MAX_TOTAL_BYTES) validation("The files exceed the 750 KiB combined upload limit. Choose fewer or smaller files.");
    return { file: entry, name, extension };
  });
  const files: PreparedFile[] = [];
  let characters = 0;
  for (const upload of uploads) {
    let bytes: Buffer;
    try { bytes = Buffer.from(await upload.file.arrayBuffer()); }
    catch { validation(`${upload.name} could not be read. Select the file again.`); }
    if (bytes.byteLength !== upload.file.size) validation(`${upload.name} changed while being read. Select it again.`);
    const mimeType = MIME_TYPES[upload.extension];
    let extracted: string;
    try {
      if ([".txt", ".md", ".csv", ".json"].includes(upload.extension)) new TextDecoder("utf-8", { fatal: true }).decode(bytes);
      extracted = await extractFileText({ projectId: "", kind: "product", title: upload.name, fileName: upload.name, mimeType, bytes });
    } catch { validation(`${upload.name} could not be extracted. Use an unencrypted, readable file or export it as UTF-8 text.`); }
    if (extracted.includes("\u0000") || hasUnpairedSurrogate(extracted)) validation(`${upload.name} contains unsupported text characters. Export valid Unicode text without NUL characters.`);
    characters += extracted.length;
    if (characters > INTAKE_MAX_EXTRACTED_CHARACTERS) validation("The files contain more than 400,000 extracted characters. Split the material into smaller uploads; content will not be truncated.");
    const text = extracted.trim();
    if (!text) validation(`${upload.name} contains no extractable text. Choose a text-based document; scanned images need OCR first.`);
    files.push({ name: upload.name, extension: upload.extension, mimeType, bytes, text, contentHash: sha256(bytes) });
  }
  const brief: ProductBriefInput = { productName: "", category: "", icp: "", market: "", expectedPrice: "", competitors: "", launchChannel: "", positioningStatement: "", notes: "" };
  const fieldSources: ProductIntakePreview["fieldSources"] = {};
  const warnings: string[] = ["Only explicitly supplied structured JSON fields become brief facts. Other text remains source context; no AI interpretation is used."];
  for (const file of files) {
    const fields = structuredBrief(file.text, file, warnings);
    if (!fields) continue;
    for (const field of INTAKE_FIELDS) {
      if (!Object.hasOwn(fields, field)) continue;
      const value = fields[field];
      if (typeof value !== "string") validation(`${file.name}: ${field} must be a string; use an empty string when it is unknown.`);
      if (value.includes("\u0000") || hasUnpairedSurrogate(value)) validation(`${file.name}: ${field} contains unsupported text characters. Use valid Unicode without NUL characters.`);
      if (value.length > INTAKE_FIELD_LIMITS[field]) validation(`${file.name}: ${field} exceeds its ${INTAKE_FIELD_LIMITS[field]} character limit. Shorten that field.`);
      const fact = value.trim();
      if (!fact) continue;
      if (brief[field] && brief[field] !== fact) validation(`${file.name}: ${field} conflicts with ${fieldSources[field]}. Keep one consistent value or upload the files separately.`);
      if (!brief[field]) { brief[field] = fact; fieldSources[field] = file.name; }
    }
  }
  const missingFields = INTAKE_FIELDS.filter(field => !brief[field]);
  const nameFromFile = !brief.productName;
  let projectName = brief.productName;
  if (nameFromFile) {
    const first = files[0];
    projectName = (first.name.slice(0, -first.extension.length).replace(/[_-]+/g, " ").trim() || first.name).slice(0, 160).replace(/[\uD800-\uDBFF]$/, "");
    warnings.push("No productName fact was supplied. The first filename is used only as the project label; the brief productName stays blank.");
  }
  if (missingFields.length) warnings.push("Missing brief facts stay blank. Simulations can explore the supplied context, but cannot establish facts that were not supplied.");
  if (files.some(file => file.text.length > EXCERPT_CHARACTERS)) warnings.push("Preview excerpts show the first 1,200 characters. The complete extracted text will be saved.");
  const digest = sha256(JSON.stringify({ version: 1, projectName, brief, nameFromFile, missingFields, fieldSources,
    files: files.map(file => ({ name: file.name, mimeType: file.mimeType, contentHash: file.contentHash, textHash: sha256(file.text) })) }));
  return { files, preview: { digest, projectName, brief, nameFromFile, missingFields, fieldSources, warnings,
    files: files.map(file => ({ name: file.name, byteSize: file.bytes.byteLength, characterCount: file.text.length, excerpt: file.text.slice(0, EXCERPT_CHARACTERS).replace(/[\uD800-\uDBFF]$/, "") })) } };
}

export async function previewProductIntake(formData: FormData): Promise<ProductIntakePreview> {
  return (await prepareIntake(formData)).preview;
}

export async function createProductFromUploads(formData: FormData): Promise<string> {
  if (!(formData instanceof FormData)) validation("Preview your product files before creating the project.");
  const digests = formData.getAll("previewDigest");
  if (digests.length !== 1 || typeof digests[0] !== "string" || !/^[a-f0-9]{64}$/.test(digests[0])) validation("Preview the selected files before creating the product.");
  const prepared = await prepareIntake(formData);
  if (prepared.preview.digest !== digests[0]) validation("The selected files or their extracted content changed. Preview them again before creating the product.");
  const env = getServerEnv();
  let directory: string | null = null;
  let transactionBodyCompleted = false;
  try {
    await mkdir(env.LOCAL_STORAGE_DIR, { recursive: true });
    directory = await mkdtemp(path.join(env.LOCAL_STORAGE_DIR, "intake-"));
    const storedFiles: (PreparedFile & { storageKey: string })[] = [];
    for (const file of prepared.files) {
      const basename = `${randomUUID()}${file.extension}`;
      await writeFile(path.join(directory, basename), file.bytes, { flag: "wx" });
      storedFiles.push({ ...file, storageKey: `${path.basename(directory)}/${basename}` });
    }
    const projectId = await getDb().transaction(async tx => {
      const [createdWorkspace] = await tx.insert(workspaces).values({ name: "Local workspace", slug: "local" }).onConflictDoNothing({ target: workspaces.slug }).returning();
      const workspace = createdWorkspace ?? (await tx.select().from(workspaces).where(eq(workspaces.slug, "local")).limit(1))[0];
      if (!workspace) throw new Error("Workspace unavailable");
      if (createdWorkspace) await tx.insert(personas).values(defaultPersonas.map(persona => ({ workspaceId: workspace.id, ...persona, isDefault: true })));
      const [project] = await tx.insert(productProjects).values({ workspaceId: workspace.id, name: prepared.preview.projectName,
        nextRecommendedAction: "Review uploaded context and choose the simulation target; some brief facts were not supplied." }).returning();
      await tx.insert(productBriefs).values({ projectId: project.id, ...prepared.preview.brief, isCurrent: true });
      for (const file of storedFiles) {
        const [source] = await tx.insert(sources).values({ projectId: project.id, kind: "product", inputType: "file", status: "ready",
          title: file.name, mimeType: file.mimeType, byteSize: file.bytes.byteLength, storageKey: file.storageKey,
          contentHash: file.contentHash, extractedText: file.text, errorMessage: null }).returning();
        const chunks = chunkText(file.text).filter(chunk => chunk.trim());
        await tx.insert(sourceChunks).values(chunks.map((text, index) => ({ sourceId: source.id, chunkIndex: index,
          text, tokenEstimate: Math.max(1, Math.ceil(text.length / 4)), contentHash: sha256(text) })));
      }
      transactionBodyCompleted = true;
      return project.id;
    });
    return projectId;
  } catch {
    if (directory && !transactionBodyCompleted) await rm(directory, { recursive: true, force: true }).catch(() => {});
    // A lost COMMIT acknowledgement is ambiguous. Keep originals so a committed
    // project's files are never removed by compensation; database rows are atomic.
    if (transactionBodyCompleted) validation("The save result could not be confirmed. Check the project dashboard before trying again.");
    validation("The product could not be saved. Check that local storage is writable and Postgres is running, then try again.");
  }
}
