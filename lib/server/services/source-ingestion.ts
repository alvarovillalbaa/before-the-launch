import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import * as cheerio from "cheerio";
import { and, eq, isNull } from "drizzle-orm";
import { getServerEnv } from "@/lib/server/config/env";
import { getDb } from "@/lib/server/db/client";
import { sourceChunks, sources } from "@/lib/server/db/schema";
import type { SourceKind } from "@/lib/shared/schemas";
import { assertPublicDnsTarget, normalizePublicHttpUrl } from "./source-security";

export type CreateTextSourceInput = {
  projectId: string;
  kind: SourceKind;
  title: string;
  text: string;
};

export type CreateUrlSourceInput = {
  projectId: string;
  kind: SourceKind;
  url: string;
  title?: string;
};

export type CreateFileSourceInput = {
  projectId: string;
  kind: SourceKind;
  title: string;
  fileName: string;
  mimeType: string;
  bytes: Buffer;
};

export function sha256(input: string | Buffer) {
  return createHash("sha256").update(input).digest("hex");
}

function estimateTokens(text: string) {
  return Math.max(1, Math.ceil(text.length / 4));
}

export function chunkText(text: string, chunkSize = 2_400) {
  const normalized = text.replace(/\r/g, "").replace(/[ \t]+\n/g, "\n").trim();
  if (!normalized) return [];
  const chunks: string[] = [];
  for (let index = 0; index < normalized.length; index += chunkSize) {
    chunks.push(normalized.slice(index, index + chunkSize));
  }
  return chunks;
}

async function persistChunks(sourceId: string, text: string) {
  const db = getDb();
  await db.delete(sourceChunks).where(eq(sourceChunks.sourceId, sourceId));
  const chunks = chunkText(text);
  if (chunks.length === 0) return;
  await db.insert(sourceChunks).values(
    chunks.map((chunk, index) => ({
      sourceId,
      chunkIndex: index,
      text: chunk,
      tokenEstimate: estimateTokens(chunk),
      contentHash: sha256(chunk),
    })),
  );
}

function extractReadableHtml(html: string) {
  const $ = cheerio.load(html);
  $("script, style, noscript, svg, iframe, form, nav, footer").remove();
  const title = $("title").first().text().trim();
  const text = $("body").text().replace(/\s+/g, " ").trim();
  return { title, text };
}

async function fetchLimitedUrl(input: string) {
  const env = getServerEnv();
  let url = normalizePublicHttpUrl(input);
  await assertPublicDnsTarget(url);

  for (let redirect = 0; redirect <= 3; redirect += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), env.URL_FETCH_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        redirect: "manual",
        signal: controller.signal,
        headers: {
          "User-Agent": "before-the-launch local ingestion/0.1",
          Accept: "text/html,text/plain,application/json,text/markdown,*/*;q=0.1",
        },
      });

      if (
        response.status >= 300 &&
        response.status < 400 &&
        response.headers.has("location")
      ) {
        const next = new URL(response.headers.get("location")!, url);
        url = normalizePublicHttpUrl(next.toString());
        await assertPublicDnsTarget(url);
        continue;
      }

      if (!response.ok) {
        throw new Error(`The URL returned HTTP ${response.status}.`);
      }

      const contentType = response.headers.get("content-type") ?? "text/plain";
      const reader = response.body?.getReader();
      if (!reader) throw new Error("The URL did not return a readable body.");
      const chunks: Uint8Array[] = [];
      let received = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          received += value.byteLength;
          if (received > env.MAX_URL_BYTES) {
            throw new Error("The URL content is too large to ingest.");
          }
          chunks.push(value);
        }
      }
      const buffer = Buffer.concat(chunks);
      const raw = buffer.toString("utf8");
      const extracted = contentType.includes("html")
        ? extractReadableHtml(raw)
        : { title: "", text: raw.trim() };
      return {
        url: url.toString(),
        title: extracted.title,
        text: extracted.text.slice(0, 200_000),
        contentType,
        byteSize: buffer.byteLength,
        contentHash: sha256(buffer),
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new Error("The URL redirected too many times.");
}

export async function createTextSource(input: CreateTextSourceInput) {
  const db = getDb();
  const text = input.text.trim();
  const [source] = await db
    .insert(sources)
    .values({
      projectId: input.projectId,
      kind: input.kind,
      inputType: "text",
      status: text ? "ready" : "failed",
      title: input.title,
      contentHash: sha256(text),
      mimeType: "text/plain",
      byteSize: Buffer.byteLength(text),
      extractedText: text,
      errorMessage: text ? null : "No text was provided.",
    })
    .returning();
  if (text) await persistChunks(source.id, text);
  return source;
}

export async function createUrlSource(input: CreateUrlSourceInput) {
  const db = getDb();
  const [source] = await db
    .insert(sources)
    .values({
      projectId: input.projectId,
      kind: input.kind,
      inputType: "url",
      status: "processing",
      title: input.title || input.url,
      url: input.url,
    })
    .returning();

  try {
    const fetched = await fetchLimitedUrl(input.url);
    const title = input.title || fetched.title || fetched.url;
    const [updated] = await db
      .update(sources)
      .set({
        status: "ready",
        title,
        url: fetched.url,
        fetchedAt: new Date(),
        contentHash: fetched.contentHash,
        mimeType: fetched.contentType,
        byteSize: fetched.byteSize,
        extractedText: fetched.text,
        errorMessage: null,
        updatedAt: new Date(),
      })
      .where(eq(sources.id, source.id))
      .returning();
    await persistChunks(source.id, fetched.text);
    return updated;
  } catch (error) {
    const message = error instanceof Error ? error.message : "URL ingestion failed.";
    const [failed] = await db
      .update(sources)
      .set({ status: "failed", errorMessage: message, updatedAt: new Date() })
      .where(eq(sources.id, source.id))
      .returning();
    return failed;
  }
}

async function extractFileText(input: CreateFileSourceInput) {
  const lowerName = input.fileName.toLowerCase();
  if (
    input.mimeType.includes("text") ||
    lowerName.endsWith(".md") ||
    lowerName.endsWith(".txt") ||
    lowerName.endsWith(".csv") ||
    lowerName.endsWith(".json")
  ) {
    return input.bytes.toString("utf8");
  }
  if (input.mimeType.includes("pdf") || lowerName.endsWith(".pdf")) {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: input.bytes });
    try {
      const parsed = await parser.getText();
      return parsed.text;
    } finally {
      await parser.destroy();
    }
  }
  if (
    input.mimeType.includes("wordprocessingml") ||
    lowerName.endsWith(".docx")
  ) {
    const mammoth = await import("mammoth");
    const parsed = await mammoth.extractRawText({ buffer: input.bytes });
    return parsed.value;
  }
  throw new Error("This file format is not supported yet.");
}

export async function createFileSource(input: CreateFileSourceInput) {
  const env = getServerEnv();
  const db = getDb();
  if (input.bytes.byteLength > env.MAX_UPLOAD_BYTES) {
    throw new Error("The uploaded file exceeds the configured size limit.");
  }

  await mkdir(env.LOCAL_STORAGE_DIR, { recursive: true });
  const storageKey = `${input.projectId}/${Date.now()}-${input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const storagePath = path.join(env.LOCAL_STORAGE_DIR, storageKey);
  await mkdir(path.dirname(storagePath), { recursive: true });
  await writeFile(storagePath, input.bytes);

  let text = "";
  let status = "ready";
  let errorMessage: string | null = null;
  try {
    text = (await extractFileText(input)).trim().slice(0, 200_000);
  } catch (error) {
    status = "failed";
    errorMessage =
      error instanceof Error ? error.message : "The uploaded file could not be processed.";
  }

  const [source] = await db
    .insert(sources)
    .values({
      projectId: input.projectId,
      kind: input.kind,
      inputType: "file",
      status,
      title: input.title,
      contentHash: sha256(input.bytes),
      mimeType: input.mimeType,
      byteSize: input.bytes.byteLength,
      storageKey,
      extractedText: text,
      errorMessage,
    })
    .returning();
  if (text) await persistChunks(source.id, text);
  return source;
}

export async function deleteSource(sourceId: string) {
  const db = getDb();
  await db
    .update(sources)
    .set({ status: "deleted", deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(sources.id, sourceId));
}

export async function getReadySources(projectId: string) {
  return getDb()
    .select()
    .from(sources)
    .where(
      and(
        eq(sources.projectId, projectId),
        eq(sources.status, "ready"),
        isNull(sources.deletedAt),
      ),
    );
}

export async function readLocalStoredSource(storageKey: string) {
  const env = getServerEnv();
  return readFile(path.join(env.LOCAL_STORAGE_DIR, storageKey));
}
