import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";

const harness = vi.hoisted(() => ({
  database: null as unknown,
  createBatch: vi.fn(), write: vi.fn(), discard: vi.fn(), pdfText: vi.fn(), pdfDestroy: vi.fn(),
}));
vi.mock("@/lib/server/db/client", () => ({ getDb: () => harness.database }));
vi.mock("@/lib/server/config/env", () => ({ getServerEnv: () => ({ MAX_UPLOAD_BYTES: 1024 * 1024 }) }));
vi.mock("@/lib/server/storage/source-storage", () => ({
  createSourceStorageBatch: () => harness.createBatch(), readStoredSource: vi.fn(),
}));
vi.mock("pdf-parse", () => ({ PDFParse: class {
  getText() { return harness.pdfText(); }
  destroy() { return harness.pdfDestroy(); }
} }));

import { personas, productBriefs, productProjects, sourceChunks, sources, workspaces } from "@/lib/server/db/schema";
import { createProductFromUploads, previewProductIntake } from "@/lib/server/services/product-intake-service";
import { createFileSource } from "@/lib/server/services/source-ingestion";

type Row = Record<string, unknown>;
type StoredRow = { table: string; row: Row };
type StorageInput = { fileName: string; mimeType: string; bytes: Buffer };
type InsertQuery = Promise<Row[]> & { returning(): Promise<Row[]>; onConflictDoNothing(): InsertQuery };
const tableNames = new Map<unknown, string>([[workspaces, "workspaces"], [personas, "personas"],
  [productProjects, "projects"], [productBriefs, "briefs"], [sources, "sources"], [sourceChunks, "chunks"]]);
let events: string[], committed: StoredRow[], mode: "success" | "body-failure" | "commit-lost";
let originals: Map<string, Buffer>, nextOriginal: number, nextRow: number;
let transaction: ReturnType<typeof vi.fn>, outbound: ReturnType<typeof vi.fn>;

function hash(bytes: string | Buffer) { return createHash("sha256").update(bytes).digest("hex"); }
async function store(input: StorageInput): Promise<string> {
  events.push(`storage:${input.fileName}`);
  const key = `blob:before-the-launch/source-originals/v1/11111111-1111-4111-8111-111111111111/22222222-2222-4222-8222-${String(++nextOriginal).padStart(12, "0")}.txt`;
  originals.set(key, Buffer.from(input.bytes)); return key;
}
function txFor(pending: StoredRow[]) {
  return { insert(table: unknown) {
    return { values(value: Row | Row[]) {
      const name = tableNames.get(table);
      if (!name) throw new Error("Unexpected authored DB table");
      const promise = Promise.resolve().then(() => {
        events.push(`sql:${name}`);
        if (mode === "body-failure" && name === "chunks") throw new Error("Authored SQL body failure: do not expose database details");
        const rows = (Array.isArray(value) ? value : [value]).map((row) => ({
          id: name === "workspaces" ? "workspace-authored" : name === "projects" ? "project-authored" : `${name}-${++nextRow}`,
          ...row,
        }));
        pending.push(...rows.map((row) => ({ table: name, row }))); return rows;
      });
      let query: InsertQuery;
      query = Object.assign(promise, { returning: () => promise, onConflictDoNothing: () => query });
      return query;
    } };
  } };
}
function documents(...files: { name: string; text: string }[]) {
  const form = new FormData();
  for (const file of files) form.append("files", new File([file.text], file.name));
  return form;
}
async function prepared(form: FormData) {
  const preview = await previewProductIntake(form); form.set("previewDigest", preview.digest); return form;
}
function textSource(text = "Authored launch context.\nThe original remains available.") {
  return { projectId: "project-authored", kind: "product" as const, title: "Authored original",
    fileName: "original.txt", mimeType: "text/plain", bytes: Buffer.from(text) };
}

beforeEach(() => {
  vi.clearAllMocks(); events = []; committed = []; originals = new Map(); nextOriginal = 0; nextRow = 0; mode = "success";
  harness.write.mockReset().mockImplementation(store);
  harness.discard.mockReset().mockImplementation(async () => { events.push("discard"); originals.clear(); });
  harness.createBatch.mockReset().mockResolvedValue({ write: harness.write, discard: harness.discard });
  harness.pdfText.mockReset().mockRejectedValue(new Error("Authored extraction failure"));
  harness.pdfDestroy.mockReset().mockResolvedValue(undefined);
  transaction = vi.fn(async (callback: (tx: ReturnType<typeof txFor>) => Promise<unknown>) => {
    events.push("begin"); const pending: StoredRow[] = [];
    let result: unknown;
    try { result = await callback(txFor(pending)); }
    catch (error) { events.push("rollback"); throw error; }
    committed.push(...pending); events.push("commit");
    if (mode === "commit-lost") throw new Error("Authored COMMIT acknowledgement lost: private connection detail");
    return result;
  });
  harness.database = { transaction, insert: () => { throw new Error("Source writes must be transactional"); } };
  outbound = vi.fn(() => Promise.reject(new Error("No outbound HTTP in source-service unit checks")));
  vi.stubGlobal("fetch", outbound);
});
afterEach(() => { try { expect(outbound).not.toHaveBeenCalled(); } finally { vi.unstubAllGlobals(); } });

describe("durable originals in source services", () => {
  it("discards partial intake uploads before any SQL and preserves the caller's files", async () => {
    const form = await prepared(documents({ name: "first.txt", text: "First authored source." }, { name: "second.txt", text: "Second authored source." }));
    harness.write.mockImplementation(async (input: StorageInput) => {
      if (input.fileName === "second.txt") throw new Error("Private upload failure must not escape");
      return store(input);
    });
    await expect(createProductFromUploads(form)).rejects.toThrow(/^The product could not be saved\./);
    expect(transaction).not.toHaveBeenCalled(); expect(committed).toEqual([]); expect(originals.size).toBe(0);
    expect(harness.discard).toHaveBeenCalledOnce(); expect(harness.write).toHaveBeenCalledTimes(2);
    expect(await (form.getAll("files")[0] as File).text()).toBe("First authored source.");
    expect((form.getAll("files")[1] as File).name).toBe("second.txt");
  });

  it("does not start a source transaction after its original upload fails", async () => {
    harness.write.mockRejectedValue(new Error("Private upload error must not escape"));
    const input = textSource(), before = Buffer.from(input.bytes);
    await expect(createFileSource(input)).rejects.toThrow(/^The source could not be saved\./);
    expect(transaction).not.toHaveBeenCalled(); expect(harness.discard).toHaveBeenCalledOnce();
    expect(committed).toEqual([]); expect(input.bytes).toEqual(before);
  });

  it("rolls back intake records and discards originals on a transaction-body failure", async () => {
    mode = "body-failure";
    const form = await prepared(documents({ name: "rollback.txt", text: "Authored transaction rollback." }));
    await expect(createProductFromUploads(form)).rejects.toThrow(/^The product could not be saved\./);
    expect(events).toContain("sql:sources"); expect(events).toContain("sql:chunks"); expect(events).toContain("rollback");
    expect(events).not.toContain("commit"); expect(committed).toEqual([]); expect(originals.size).toBe(0);
    expect(harness.discard).toHaveBeenCalledOnce();
  });

  it("rolls back source and chunk writes together and discards that original", async () => {
    mode = "body-failure";
    await expect(createFileSource(textSource())).rejects.toThrow(/^The source could not be saved\./);
    expect(transaction).toHaveBeenCalledOnce(); expect(events).toEqual(["storage:original.txt", "begin", "sql:sources", "sql:chunks", "rollback", "discard"]);
    expect(committed).toEqual([]); expect(originals.size).toBe(0);
  });

  it("retains intake originals when the completed transaction loses its COMMIT acknowledgement", async () => {
    mode = "commit-lost";
    const form = await prepared(documents({ name: "uncertain.txt", text: "Authored possibly committed intake." }));
    await expect(createProductFromUploads(form)).rejects.toThrow(/originals were kept; check the project dashboard/);
    expect(harness.discard).not.toHaveBeenCalled(); expect(events).toContain("commit");
    const source = committed.find((entry) => entry.table === "sources")!.row;
    expect(originals.get(String(source.storageKey))).toEqual(Buffer.from("Authored possibly committed intake."));
    expect(committed.some((entry) => entry.table === "chunks")).toBe(true);
  });

  it("retains a source original when COMMIT succeeds but its acknowledgement is lost", async () => {
    mode = "commit-lost"; const input = textSource();
    await expect(createFileSource(input)).rejects.toThrow(/original was kept; check the project/);
    expect(harness.discard).not.toHaveBeenCalled(); expect(events).toContain("commit");
    const source = committed.find((entry) => entry.table === "sources")!.row;
    expect(originals.get(String(source.storageKey))).toEqual(input.bytes);
    expect(committed.filter((entry) => entry.table === "chunks")).toHaveLength(1);
  });

  it("retains the original and failed status when file text extraction fails", async () => {
    const input = { ...textSource(), fileName: "broken.pdf", mimeType: "application/pdf", bytes: Buffer.from("%PDF-authored-unreadable") };
    const source = await createFileSource(input);
    expect(source).toMatchObject({ status: "failed", extractedText: "", errorMessage: "Authored extraction failure",
      contentHash: hash(input.bytes), byteSize: input.bytes.length, mimeType: "application/pdf" });
    expect(originals.get(source.storageKey!)).toEqual(input.bytes);
    expect(committed.filter((entry) => entry.table === "chunks")).toEqual([]);
    expect(harness.pdfDestroy).toHaveBeenCalledOnce(); expect(harness.discard).not.toHaveBeenCalled();
  });

  it("stores all intake originals before committing exact source metadata and chunks", async () => {
    const text = "Authored product context with preserved UTF-8. 雪\n";
    const facts = '{"productName":"Authored durable intake","market":"Independent bookshops"}';
    const form = await prepared(documents({ name: "context.txt", text }, { name: "facts.json", text: facts }));
    expect(harness.createBatch).not.toHaveBeenCalled(); expect(transaction).not.toHaveBeenCalled();
    expect(await createProductFromUploads(form)).toBe("project-authored");
    expect(harness.createBatch).toHaveBeenCalledOnce(); expect(transaction).toHaveBeenCalledOnce();
    expect(events.slice(0, 3)).toEqual(["storage:context.txt", "storage:facts.json", "begin"]);
    const rows = committed.filter((entry) => entry.table === "sources").map((entry) => entry.row);
    expect(rows).toHaveLength(2);
    for (const [title, original] of [["context.txt", text], ["facts.json", facts]]) {
      const row = rows.find((entry) => entry.title === title)!;
      expect(row).toMatchObject({ projectId: "project-authored", inputType: "file", status: "ready", contentHash: hash(original), byteSize: Buffer.byteLength(original), extractedText: original.trim() });
      expect(originals.get(String(row.storageKey))).toEqual(Buffer.from(original));
      const chunks = committed.filter((entry) => entry.table === "chunks" && entry.row.sourceId === row.id);
      expect(chunks.map((entry) => entry.row.text).join("")).toBe(original.trim());
    }
    expect(committed.find((entry) => entry.table === "briefs")?.row).toMatchObject({ productName: "Authored durable intake", market: "Independent bookshops" });
    expect(harness.discard).not.toHaveBeenCalled();
  });

  it("commits a file source with its actual storage key metadata and chunks", async () => {
    const input = textSource("First authored line.\nSecond authored line.\n");
    const source = await createFileSource(input);
    expect(harness.write).toHaveBeenCalledExactlyOnceWith({ fileName: input.fileName, mimeType: input.mimeType, bytes: input.bytes });
    expect(transaction).toHaveBeenCalledOnce();
    expect(source).toMatchObject({ projectId: input.projectId, title: input.title, status: "ready", inputType: "file", contentHash: hash(input.bytes),
      byteSize: input.bytes.length, mimeType: input.mimeType, extractedText: input.bytes.toString().trim(), errorMessage: null });
    expect(originals.get(source.storageKey!)).toEqual(input.bytes);
    expect(committed.filter((entry) => entry.table === "chunks").map((entry) => entry.row.text).join("")).toBe(input.bytes.toString().trim());
    expect(harness.discard).not.toHaveBeenCalled();
  });

  it("reports unconfirmed staged cleanup without exposing the storage or SQL failure", async () => {
    harness.write.mockRejectedValue(new Error("Private upload detail"));
    harness.discard.mockRejectedValue(new Error("Private cleanup detail"));
    await expect(createFileSource(textSource())).rejects.toThrow(/^The source could not be saved and cleanup of its staged original could not be confirmed\./);
    expect(transaction).not.toHaveBeenCalled(); expect(harness.discard).toHaveBeenCalledOnce();
  });
});
