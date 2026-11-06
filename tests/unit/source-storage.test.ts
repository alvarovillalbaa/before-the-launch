import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { lstat, mkdir, mkdtemp, readFile, readdir, realpath, rm, symlink, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const sdk = vi.hoisted(() => ({ put: vi.fn(), get: vi.fn(), del: vi.fn() }));
vi.mock("@vercel/blob", () => sdk);

const PRIVATE_TOKEN = "authored-source-storage-token";
const PRIVATE_KEY = "blob:before-the-launch/source-originals/v1/11111111-1111-4111-8111-111111111111/22222222-2222-4222-8222-222222222222.txt";
let root: string, local: string, identity: Awaited<ReturnType<typeof lstat>>;
let outbound: ReturnType<typeof vi.fn>;

async function adapter() { return import("@/lib/server/storage/source-storage"); }
function privateBody(bytes: Buffer, declared = bytes.length, close = true) {
  const cancelled = vi.fn();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) { controller.enqueue(bytes); if (close) controller.close(); },
    cancel() { cancelled(); },
  });
  return { result: { statusCode: 200, stream, blob: { size: declared } }, stream, cancelled };
}
function privateUploads() {
  sdk.put.mockImplementation(async (pathname: string) => ({ pathname, url: `https://authored.private.blob.vercel-storage.com/${pathname}` }));
}

beforeEach(async () => {
  vi.resetModules();
  sdk.put.mockReset(); sdk.get.mockReset(); sdk.del.mockReset(); sdk.del.mockResolvedValue(undefined);
  root = await mkdtemp(path.join(await realpath(tmpdir()), "before-launch-originals-unit-"));
  identity = await lstat(root); local = path.join(root, "originals");
  vi.stubEnv("LOCAL_STORAGE_DIR", local); vi.stubEnv("SOURCE_STORAGE_DRIVER", "local");
  vi.stubEnv("MAX_UPLOAD_BYTES", "1048576"); vi.stubEnv("VERCEL", "");
  vi.stubEnv("BLOB_READ_WRITE_TOKEN", ""); vi.stubEnv("BLOB_STORE_ID", ""); vi.stubEnv("VERCEL_OIDC_TOKEN", "");
  outbound = vi.fn(() => Promise.reject(new Error("No outbound HTTP in original-file unit checks")));
  vi.stubGlobal("fetch", outbound);
});
afterEach(async () => {
  try {
    expect(outbound).not.toHaveBeenCalled();
    const current = await lstat(root);
    if (!current.isDirectory() || current.isSymbolicLink() || current.dev !== identity.dev || current.ino !== identity.ino) {
      throw new Error("Authored temporary root identity changed; cleanup refused");
    }
    await rm(root, { recursive: true, force: true });
  } finally { vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); }
});

describe("source original storage", () => {
  it("round-trips exact local bytes with unique private files and no filename-derived path", async () => {
    const storage = await adapter(), batch = await storage.createSourceStorageBatch();
    const original = Buffer.from([0, 255, 13, 10, 226, 152, 131]);
    const first = await batch.write({ fileName: "../../Authored report.TXT", mimeType: "text/plain", bytes: original });
    const second = await batch.write({ fileName: "../../Authored report.TXT", mimeType: "text/plain", bytes: original });
    expect(first).toMatch(/^intake-[^/]+\/[0-9a-f-]{36}\.txt$/); expect(second).not.toBe(first);
    expect(await storage.readStoredSource(first)).toEqual(original);
    expect(await readFile(path.join(local, first))).toEqual(original);
    expect((await lstat(path.join(local, first))).mode & 0o777).toBe(0o600);
    expect(sdk.put).not.toHaveBeenCalled(); await batch.discard();
    await expect(readFile(path.join(local, first))).rejects.toMatchObject({ code: "ENOENT" });
  });

  it("refuses unknown entries and symlinks before discarding any owned batch file", async () => {
    const storage = await adapter(), first = await storage.createSourceStorageBatch(), other = await storage.createSourceStorageBatch();
    const key = await first.write({ fileName: "one.txt", mimeType: "text/plain", bytes: Buffer.from("first") });
    const otherKey = await other.write({ fileName: "two.txt", mimeType: "text/plain", bytes: Buffer.from("other") });
    const directory = path.dirname(path.join(local, key)), unknown = path.join(directory, "unowned.txt");
    const sentinel = path.join(root, "unrelated.txt"); await writeFile(sentinel, "keep unrelated");
    await writeFile(unknown, "keep unknown");
    await expect(first.discard()).rejects.toThrow(/unowned/);
    expect(await readFile(path.join(local, key), "utf8")).toBe("first");
    await unlink(unknown); await symlink(sentinel, unknown);
    await expect(first.discard()).rejects.toThrow(/unowned/);
    expect(await readFile(sentinel, "utf8")).toBe("keep unrelated");
    await unlink(unknown); await first.discard(); await first.discard();
    expect(await storage.readStoredSource(otherKey)).toEqual(Buffer.from("other"));
    expect(await readFile(sentinel, "utf8")).toBe("keep unrelated"); await other.discard();
  });

  it("reads safe legacy keys and rejects malformed or traversal keys", async () => {
    await mkdir(path.join(local, "legacy-project"), { recursive: true });
    await writeFile(path.join(local, "legacy-project", "1700000000-notes.txt"), "legacy original");
    const storage = await adapter();
    expect(await storage.readStoredSource("legacy-project/1700000000-notes.txt")).toEqual(Buffer.from("legacy original"));
    for (const key of ["", "../unrelated.txt", "/absolute.txt", "legacy-project/../notes.txt", "a//b", "a\\b", "a/\0bad", "a/."]) {
      await expect(storage.readStoredSource(key)).rejects.toThrow(/Invalid original-file key/);
    }
    expect(sdk.get).not.toHaveBeenCalled();
  });

  it("rejects symbolic-link escapes and nonregular local originals", async () => {
    await mkdir(local); const outside = path.join(root, "outside.txt"); await writeFile(outside, "not an original");
    await symlink(outside, path.join(local, "escape.txt")); await mkdir(path.join(local, "directory"));
    const storage = await adapter();
    await expect(storage.readStoredSource("escape.txt")).rejects.toThrow(/Invalid original-file key/);
    await expect(storage.readStoredSource("directory")).rejects.toThrow(/not a regular file/);
    expect(await readFile(outside, "utf8")).toBe("not an original");
  });

  it("enforces configured byte limits before writes and during local reads", async () => {
    vi.stubEnv("MAX_UPLOAD_BYTES", "8");
    const storage = await adapter(), batch = await storage.createSourceStorageBatch();
    await expect(batch.write({ fileName: "large.txt", mimeType: "text/plain", bytes: Buffer.alloc(9) })).rejects.toThrow(/size limit/);
    const key = await batch.write({ fileName: "boundary.txt", mimeType: "text/plain", bytes: Buffer.alloc(8, 7) });
    expect(await storage.readStoredSource(key)).toEqual(Buffer.alloc(8, 7));
    await writeFile(path.join(local, "oversized.txt"), Buffer.alloc(9));
    await expect(storage.readStoredSource("oversized.txt")).rejects.toThrow(/size limit/);
    await batch.discard(); expect(await readdir(local)).toEqual(["oversized.txt"]);
  });

  it("fails closed for local storage on hosted runtimes", async () => {
    vi.stubEnv("VERCEL", "1"); const storage = await adapter();
    await expect(storage.createSourceStorageBatch()).rejects.toThrow(/Hosted original uploads require/);
    await expect(storage.readStoredSource("legacy/file.txt")).rejects.toThrow(/Hosted original uploads require/);
    expect(sdk.put).not.toHaveBeenCalled(); expect(sdk.get).not.toHaveBeenCalled();
  });

  it("writes and reads private token-authorized Blob originals without returning a public URL", async () => {
    vi.stubEnv("SOURCE_STORAGE_DRIVER", "blob"); vi.stubEnv("BLOB_READ_WRITE_TOKEN", PRIVATE_TOKEN); privateUploads();
    const storage = await adapter(), batch = await storage.createSourceStorageBatch(), bytes = Buffer.from("private original\n");
    const key = await batch.write({ fileName: "source.md", mimeType: "text/markdown", bytes });
    expect(key).toMatch(/^blob:before-the-launch\/source-originals\/v1\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.md$/);
    const [pathname, sent, options] = sdk.put.mock.calls[0];
    expect(pathname).toBe(key.slice(5)); expect(sent).toEqual(bytes);
    expect(options).toMatchObject({ token: PRIVATE_TOKEN, access: "private", allowOverwrite: false, addRandomSuffix: false, contentType: "text/markdown" });
    expect(options.abortSignal).toBeInstanceOf(AbortSignal);
    const response = privateBody(bytes); sdk.get.mockResolvedValue(response.result);
    expect(await storage.readStoredSource(key)).toEqual(bytes); expect(response.stream.locked).toBe(false);
    expect(sdk.get).toHaveBeenCalledWith(pathname, expect.objectContaining({ token: PRIVATE_TOKEN, access: "private", useCache: false, abortSignal: expect.any(AbortSignal) }));
    await batch.discard(); expect(sdk.del).toHaveBeenCalledExactlyOnceWith(pathname, expect.objectContaining({ token: PRIVATE_TOKEN }));
  });

  it("uses an explicit store and SDK-managed OIDC without capturing an expiring token", async () => {
    vi.stubEnv("SOURCE_STORAGE_DRIVER", "blob"); vi.stubEnv("BLOB_STORE_ID", "store_authored"); vi.stubEnv("VERCEL_OIDC_TOKEN", "authored-oidc"); privateUploads();
    const batch = await (await adapter()).createSourceStorageBatch();
    await batch.write({ fileName: "context.json", mimeType: "application/json", bytes: Buffer.from("{}") });
    expect(sdk.put.mock.calls[0][2]).toMatchObject({ storeId: "store_authored", access: "private" });
    expect(sdk.put.mock.calls[0][2]).not.toHaveProperty("token");
    expect(sdk.put.mock.calls[0][2]).not.toHaveProperty("oidcToken"); await batch.discard();
    vi.stubEnv("VERCEL", "1"); vi.stubEnv("VERCEL_OIDC_TOKEN", ""); vi.resetModules();
    const hosted = await (await adapter()).createSourceStorageBatch();
    await hosted.write({ fileName: "hosted.txt", mimeType: "text/plain", bytes: Buffer.from("hosted request credential") });
    expect(sdk.put.mock.calls[1][2]).toMatchObject({ storeId: "store_authored", access: "private" });
    expect(sdk.put.mock.calls[1][2]).not.toHaveProperty("oidcToken"); await hosted.discard();
  });

  it("rejects incomplete private authorization instead of relying on SDK ambient credentials", async () => {
    vi.stubEnv("SOURCE_STORAGE_DRIVER", "blob");
    for (const credentials of [{ store: "", oidc: "" }, { store: "store_authored", oidc: "" }, { store: "", oidc: "authored-oidc" }]) {
      vi.resetModules(); vi.stubEnv("BLOB_STORE_ID", credentials.store); vi.stubEnv("VERCEL_OIDC_TOKEN", credentials.oidc);
      await expect((await adapter()).createSourceStorageBatch()).rejects.toThrow(/Configure a private Blob store/);
    }
    expect(sdk.put).not.toHaveBeenCalled(); expect(sdk.get).not.toHaveBeenCalled();
  });

  it("compensates uncertain private uploads using only its generated original-file keys", async () => {
    vi.stubEnv("SOURCE_STORAGE_DRIVER", "blob"); vi.stubEnv("BLOB_READ_WRITE_TOKEN", PRIVATE_TOKEN);
    sdk.put.mockRejectedValue(new Error("authored provider failure must not escape"));
    const batch = await (await adapter()).createSourceStorageBatch();
    await expect(batch.write({ fileName: "notes.txt", mimeType: "text/plain", bytes: Buffer.from("notes") })).rejects.toThrow(/^Original-file storage is unavailable\./);
    const attempted = sdk.put.mock.calls[0][0]; await batch.discard(); await batch.discard();
    expect(sdk.del.mock.calls.map((call) => call[0])).toEqual([attempted]);
    expect(attempted).toMatch(/^before-the-launch\/source-originals\/v1\//);
    expect(sdk.del).not.toHaveBeenCalledWith("an-unrelated-object", expect.anything());
  });

  it("rejects public or mismatched private upload receipts", async () => {
    vi.stubEnv("SOURCE_STORAGE_DRIVER", "blob"); vi.stubEnv("BLOB_READ_WRITE_TOKEN", PRIVATE_TOKEN);
    for (const mode of ["public", "wrong-path"]) {
      sdk.put.mockImplementation(async (pathname: string) => ({ pathname: mode === "wrong-path" ? "other.txt" : pathname,
        url: `https://authored.${mode === "public" ? "public" : "private"}.blob.vercel-storage.com/${pathname}` }));
      const batch = await (await adapter()).createSourceStorageBatch();
      await expect(batch.write({ fileName: "notes.txt", mimeType: "text/plain", bytes: Buffer.from("notes") })).rejects.toThrow(/^Original-file storage is unavailable\./);
      await batch.discard();
    }
  });

  it("bounds private response metadata and actual bodies with complete byte accounting", async () => {
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", PRIVATE_TOKEN); vi.stubEnv("MAX_UPLOAD_BYTES", "8");
    const storage = await adapter();
    const mismatch = privateBody(Buffer.from("short"), 6); sdk.get.mockResolvedValueOnce(mismatch.result);
    await expect(storage.readStoredSource(PRIVATE_KEY)).rejects.toThrow(/^Original-file storage is unavailable\./);
    expect(mismatch.stream.locked).toBe(false);
    const oversized = privateBody(Buffer.alloc(9), 8, false); sdk.get.mockResolvedValueOnce(oversized.result);
    await expect(storage.readStoredSource(PRIVATE_KEY)).rejects.toThrow(/^Original-file storage is unavailable\./);
    expect(oversized.cancelled).toHaveBeenCalledOnce(); expect(oversized.stream.locked).toBe(false);
    await expect(storage.readStoredSource("blob:before-the-launch/../private.txt")).rejects.toThrow(/Invalid original-file key/);
    expect(sdk.get).toHaveBeenCalledTimes(2);
  });

  it("forwards fifteen-second cancellation and reports unconfirmed provider cleanup", async () => {
    vi.stubEnv("SOURCE_STORAGE_DRIVER", "blob"); vi.stubEnv("BLOB_READ_WRITE_TOKEN", PRIVATE_TOKEN);
    const controllers: AbortController[] = [];
    const timeout = vi.spyOn(AbortSignal, "timeout").mockImplementation(() => {
      const controller = new AbortController(); controllers.push(controller); return controller.signal;
    });
    sdk.put.mockImplementation((_path, _bytes, options) => new Promise((_resolve, reject) => {
      options.abortSignal.addEventListener("abort", () => reject(new Error("authored cancellation")), { once: true });
    }));
    const storage = await adapter(), batch = await storage.createSourceStorageBatch();
    const pending = batch.write({ fileName: "notes.txt", mimeType: "text/plain", bytes: Buffer.from("notes") });
    const failed = expect(pending).rejects.toThrow(/^Original-file storage is unavailable\./); controllers[0].abort(); await failed;
    sdk.get.mockImplementation((_path, options) => new Promise((_resolve, reject) => {
      options.abortSignal.addEventListener("abort", () => reject(new Error("authored cancellation")), { once: true });
    }));
    const reading = storage.readStoredSource(PRIVATE_KEY), readFailed = expect(reading).rejects.toThrow(/^Original-file storage is unavailable\./);
    controllers[1].abort(); await readFailed;
    sdk.del.mockRejectedValue(new Error("authored cleanup uncertainty"));
    await expect(batch.discard()).rejects.toThrow(/cleanup could not be confirmed/);
    sdk.del.mockResolvedValue(undefined);
    await batch.discard(); await batch.discard();
    expect(sdk.del).toHaveBeenCalledTimes(2);
    expect(timeout.mock.calls.every(([milliseconds]) => milliseconds === 15_000)).toBe(true);
    expect(timeout).toHaveBeenCalledTimes(4);
  });
});
