import { randomUUID } from "node:crypto";
import { constants } from "node:fs";
import { lstat, mkdir, mkdtemp, open, readdir, realpath, rmdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { del, get, put } from "@vercel/blob";
import { getServerEnv } from "@/lib/server/config/env";

const BLOB_PREFIX = "before-the-launch/source-originals/v1/";
const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}";
const BLOB_KEY = new RegExp(`^${BLOB_PREFIX}${UUID}/${UUID}\\.[a-z0-9]{1,10}$`);
const STORAGE_ERROR = "Original-file storage is unavailable. Check its private storage configuration and try again.";

export type SourceStorageBatch = {
  write(input: { fileName: string; mimeType: string; bytes: Buffer }): Promise<string>;
  discard(): Promise<void>;
};

function extension(fileName: string) {
  const value = path.extname(fileName).toLowerCase();
  return /^\.[a-z0-9]{1,10}$/.test(value) ? value : ".bin";
}

function assertLocalAllowed() {
  if (process.env.VERCEL) throw new Error("Hosted original uploads require SOURCE_STORAGE_DRIVER=blob and a private Blob store.");
}

function blobAuth() {
  const env = getServerEnv();
  if (env.BLOB_READ_WRITE_TOKEN?.trim()) return { token: env.BLOB_READ_WRITE_TOKEN };
  if (env.BLOB_STORE_ID?.trim() && (process.env.VERCEL || process.env.VERCEL_OIDC_TOKEN?.trim())) {
    // Let the SDK read/refresh the current request's OIDC credential. Passing
    // a token captured by the cached environment would pin an expiring token.
    return { storeId: env.BLOB_STORE_ID };
  }
  throw new Error("Configure a private Blob store with a server token or store ID and Vercel OIDC credentials.");
}

function assertSize(bytes: number) {
  if (!Number.isSafeInteger(bytes) || bytes < 0 || bytes > getServerEnv().MAX_UPLOAD_BYTES) {
    throw new Error("The original file exceeds the configured size limit.");
  }
}

export async function createSourceStorageBatch(): Promise<SourceStorageBatch> {
  const env = getServerEnv();
  let discarded = false;
  if (env.SOURCE_STORAGE_DRIVER === "blob") {
    const auth = blobAuth(), prefix = `${BLOB_PREFIX}${randomUUID()}/`;
    const attempted = new Set<string>();
    return {
      async write(input) {
        if (discarded) throw new Error("This upload batch is closed.");
        assertSize(input.bytes.byteLength);
        const pathname = `${prefix}${randomUUID()}${extension(input.fileName)}`;
        // Include uncertain acknowledgements in compensation. The key was
        // generated here and cannot overwrite an existing application object.
        attempted.add(pathname);
        try {
          const result = await put(pathname, input.bytes, {
            ...auth, access: "private", addRandomSuffix: false, allowOverwrite: false,
            contentType: input.mimeType || "application/octet-stream", abortSignal: AbortSignal.timeout(15_000),
          });
          if (result.pathname !== pathname || new URL(result.url).protocol !== "https:"
            || !new URL(result.url).hostname.endsWith(".private.blob.vercel-storage.com")) throw new Error(STORAGE_ERROR);
          return `blob:${pathname}`;
        } catch { throw new Error(STORAGE_ERROR); }
      },
      async discard() {
        if (discarded && attempted.size === 0) return;
        discarded = true;
        const paths = [...attempted];
        const outcomes = await Promise.allSettled(paths.map((pathname) =>
          del(pathname, { ...auth, abortSignal: AbortSignal.timeout(15_000) })));
        outcomes.forEach((result, index) => { if (result.status === "fulfilled") attempted.delete(paths[index]); });
        if (outcomes.some((result) => result.status === "rejected")) {
          throw new Error("Some original-file cleanup could not be confirmed. Storage reconciliation is required.");
        }
      },
    };
  }
  assertLocalAllowed();
  await mkdir(env.LOCAL_STORAGE_DIR, { recursive: true });
  const root = await realpath(env.LOCAL_STORAGE_DIR);
  const directory = await mkdtemp(path.join(root, "intake-"));
  const identity = await lstat(directory), attempted = new Set<string>();
  async function owned() {
    const current = await lstat(directory);
    if (!current.isDirectory() || current.isSymbolicLink() || current.dev !== identity.dev
      || current.ino !== identity.ino || current.uid !== identity.uid) throw new Error("Upload directory identity changed.");
  }
  return {
    async write(input) {
      if (discarded) throw new Error("This upload batch is closed.");
      assertSize(input.bytes.byteLength);
      await owned();
      const name = `${randomUUID()}${extension(input.fileName)}`;
      attempted.add(name);
      await writeFile(path.join(directory, name), input.bytes, { flag: "wx", mode: 0o600 });
      return `${path.basename(directory)}/${name}`;
    },
    async discard() {
      if (discarded) return;
      await owned();
      const entries = await readdir(directory);
      for (const name of entries) {
        const entry = await lstat(path.join(directory, name));
        if (!attempted.has(name) || !entry.isFile() || entry.isSymbolicLink()) throw new Error("Upload directory contains unowned files; cleanup stopped.");
      }
      for (const name of entries) await unlink(path.join(directory, name));
      await rmdir(directory);
      discarded = true;
    },
  };
}

export async function readStoredSource(storageKey: string): Promise<Buffer> {
  if (storageKey.startsWith("blob:")) {
    const pathname = storageKey.slice(5);
    if (!BLOB_KEY.test(pathname)) throw new Error("Invalid original-file key.");
    const auth = blobAuth();
    try {
      const result = await get(pathname, { ...auth, access: "private", useCache: false, abortSignal: AbortSignal.timeout(15_000) });
      if (!result || result.statusCode !== 200) throw new Error(STORAGE_ERROR);
      const reader = result.stream.getReader(), chunks: Buffer[] = [];
      let size = 0, complete = false;
      try {
        assertSize(result.blob.size);
        while (true) {
          const chunk = await reader.read();
          if (chunk.done) break;
          size += chunk.value.byteLength;
          assertSize(size);
          chunks.push(Buffer.from(chunk.value));
        }
        if (size !== result.blob.size) throw new Error(STORAGE_ERROR);
        complete = true;
        return Buffer.concat(chunks, size);
      } finally {
        if (!complete) await reader.cancel().catch(() => {});
        reader.releaseLock();
      }
    } catch { throw new Error(STORAGE_ERROR); }
  }
  assertLocalAllowed();
  const segments = storageKey.split("/");
  if (!storageKey || storageKey.length > 512 || segments.some((segment) => !/^[a-zA-Z0-9._-]+$/.test(segment)
    || segment === "." || segment === "..")) throw new Error("Invalid original-file key.");
  const root = await realpath(getServerEnv().LOCAL_STORAGE_DIR);
  const file = await realpath(path.join(root, ...segments));
  if (!file.startsWith(root + path.sep)) throw new Error("Invalid original-file key.");
  const handle = await open(file, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const stat = await handle.stat();
    if (!stat.isFile()) throw new Error("The original is not a regular file.");
    assertSize(stat.size);
    const chunks: Buffer[] = [];
    let size = 0;
    while (true) {
      const buffer = Buffer.alloc(Math.min(64 * 1024, getServerEnv().MAX_UPLOAD_BYTES - size + 1));
      const { bytesRead } = await handle.read(buffer, 0, buffer.length, null);
      if (!bytesRead) break;
      size += bytesRead; assertSize(size); chunks.push(buffer.subarray(0, bytesRead));
    }
    if (size !== stat.size) throw new Error("The original changed while it was read.");
    return Buffer.concat(chunks, size);
  } finally { await handle.close(); }
}
