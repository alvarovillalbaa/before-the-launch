import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { Pool } from "pg";
import { closeDb } from "@/lib/server/db/client";
import { createProductFromUploads, previewProductIntake } from "@/lib/server/services/product-intake-service";
import { INTAKE_MAX_TOTAL_BYTES } from "@/lib/shared/product-intake";
import { ProductBriefInputSchema } from "@/lib/shared/schemas";

// This file is intentionally outside the default unit suite. Run only in the
// approved disposable acceptance job, never against a configured app database.
const database = new URL(process.env.DATABASE_URL ?? "postgres://invalid/invalid");
const storageRoot = path.resolve(process.env.LOCAL_STORAGE_DIR ?? ".");
const runnerRoot = path.resolve(process.env.RUNNER_TEMP ?? "/invalid-runner");
if (
  process.env.INTAKE_ACCEPTANCE_FIXTURES !== "disposable" ||
  database.protocol !== "postgres:" || database.search !== "" || database.hash !== "" ||
  database.hostname !== "127.0.0.1" || database.port !== "54329" ||
  database.username !== "intake_ci" || database.pathname !== "/before_launch_intake_ci" ||
  !storageRoot.startsWith(`${runnerRoot}${path.sep}before-launch-intake-`)
) throw new Error("Import acceptance requires its dedicated disposable database and runner storage.");

const pool = new Pool({ connectionString: database.toString() });
const createdProjects: string[] = [];
let ownsStorage = false;

function documents(...files: { name: string; text: string }[]) {
  const data = new FormData();
  for (const file of files) data.append("files", new File([file.text], file.name));
  return data;
}

async function commit(data: FormData) {
  const preview = await previewProductIntake(data);
  data.set("previewDigest", preview.digest);
  const id = await createProductFromUploads(data);
  createdProjects.push(id);
  return { id, preview };
}

async function counts() {
  const result = await pool.query("SELECT (SELECT count(*)::int FROM workspaces) workspaces, (SELECT count(*)::int FROM personas) personas, (SELECT count(*)::int FROM product_projects) projects, (SELECT count(*)::int FROM product_briefs) briefs, (SELECT count(*)::int FROM sources) sources, (SELECT count(*)::int FROM source_chunks) chunks");
  return result.rows[0];
}

async function storedPaths() {
  try { return (await readdir(storageRoot, { recursive: true })).sort(); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

beforeAll(async () => {
  expect(await counts()).toEqual({ workspaces: 0, personas: 0, projects: 0, briefs: 0, sources: 0, chunks: 0 });
  // Non-recursive mkdir establishes fresh ownership. Existing directories fail
  // closed and are never recursively removed by this suite.
  await mkdir(storageRoot);
  ownsStorage = true;
});

afterAll(async () => {
  try {
    for (const id of createdProjects) await pool.query("DELETE FROM product_projects WHERE id = $1", [id]);
  } finally {
    await closeDb();
    await pool.end();
    if (ownsStorage) await rm(storageRoot, { recursive: true, force: true });
  }
});

describe.sequential("upload-only intake with disposable PostgreSQL", () => {
  it("previews exact uploaded facts with provenance and no writes; the old API stays strict", async () => {
    const before = await counts();
    const filesBefore = await storedPaths();
    const preview = await previewProductIntake(documents({ name: "facts.json", text: JSON.stringify({ productBrief: { productName: "Authored test product", market: "Independent bookshops" } }) }));
    expect(preview.brief.productName).toBe("Authored test product");
    expect(preview.brief.market).toBe("Independent bookshops");
    expect(preview.brief.expectedPrice).toBe("");
    expect(preview.fieldSources.market).toBe("facts.json");
    expect(preview.missingFields).toContain("expectedPrice");
    expect(preview.nameFromFile).toBe(false);
    expect(ProductBriefInputSchema.safeParse(preview.brief).success).toBe(false);
    expect(await counts()).toEqual(before);
    expect(await storedPaths()).toEqual(filesBefore);
  });

  it("rolls back a new workspace, personas, and project records after a source-write failure", async () => {
    const before = await counts();
    expect(before.workspaces).toBe(0);
    expect(before.personas).toBe(0);
    const pathsBefore = await storedPaths();
    let ownsFunction = false;
    let ownsTrigger = false;
    try {
      await pool.query("CREATE FUNCTION intake_acceptance_reject_source() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Authored disposable source-write failure'; END; $$");
      ownsFunction = true;
      await pool.query("CREATE TRIGGER intake_acceptance_reject_source BEFORE INSERT ON sources FOR EACH ROW EXECUTE FUNCTION intake_acceptance_reject_source()");
      ownsTrigger = true;
      const data = documents({ name: "rollback.txt", text: "Authored rollback fixture." });
      const preview = await previewProductIntake(data);
      data.set("previewDigest", preview.digest);
      await expect(createProductFromUploads(data)).rejects.toThrow(/could not be saved/i);
      expect(await counts()).toEqual(before);
      expect(await storedPaths()).toEqual(pathsBefore);
    } finally {
      try {
        if (ownsTrigger) await pool.query("DROP TRIGGER intake_acceptance_reject_source ON sources");
      } finally {
        if (ownsFunction) await pool.query("DROP FUNCTION intake_acceptance_reject_source()");
      }
    }
  });

  it("persists a filename project label separately from missing product facts and saves original bytes", async () => {
    const original = "# Authored launch context\nA paper planning tool for small bookshops.\n";
    const { id, preview } = await commit(documents({ name: "launch-notes.md", text: original }));
    expect(preview.projectName).toBe("launch notes");
    expect(preview.nameFromFile).toBe(true);
    expect(preview.brief.productName).toBe("");
    expect(preview.missingFields).toContain("productName");
    expect(preview.fieldSources.productName).toBeUndefined();
    const project = (await pool.query("SELECT p.name, b.product_name, b.market, b.positioning_statement FROM product_projects p JOIN product_briefs b ON b.project_id = p.id WHERE p.id = $1", [id])).rows[0];
    expect(project).toMatchObject({ name: "launch notes", product_name: "", market: "", positioning_statement: "" });
    const source = (await pool.query("SELECT * FROM sources WHERE project_id = $1", [id])).rows[0];
    expect(source).toMatchObject({ input_type: "file", status: "ready", extracted_text: original.trim(), title: "launch-notes.md" });
    expect(await readFile(path.join(storageRoot, source.storage_key), "utf8")).toBe(original);
    const chunks = (await pool.query("SELECT text FROM source_chunks WHERE source_id = $1 ORDER BY chunk_index", [source.id])).rows;
    expect(chunks.map(row => row.text).join("")).toBe(original.trim());
  });

  it("keeps ordinary JSON data and CSV as source context without inventing brief facts", async () => {
    const preview = await previewProductIntake(documents(
      { name: "research.json", text: '[{"respondents":3,"answer":"Prefer paper"}]' },
      { name: "pricing.csv", text: "tier,amount\nStarter,12\n" },
    ));
    expect(preview.brief.expectedPrice).toBe("");
    expect(preview.brief.icp).toBe("");
    expect(preview.files).toHaveLength(2);
    expect(preview.files[0].excerpt).toContain("Prefer paper");
    expect(preview.missingFields).toContain("productName");
  });

  it("rejects invalid uploads before persistence", async () => {
    const before = await counts();
    const pathsBefore = await storedPaths();
    const invalid = [
      new FormData(),
      documents({ name: "empty.txt", text: " " }),
      documents({ name: "image.png", text: "not a supported document" }),
      documents({ name: "broken.pdf", text: "not a PDF" }),
      documents({ name: "broken.json", text: "{" }),
      documents({ name: "wrong-type.json", text: '{"expectedPrice":12}' }),
      documents({ name: "duplicate.json", text: '{"market":"One","market":"Two"}' }),
      documents({ name: "escaped-nul.json", text: '{"productName":"invalid\\u0000name"}' }),
      documents({ name: "too-large.txt", text: "x".repeat(INTAKE_MAX_TOTAL_BYTES + 1) }),
      documents({ name: "too-much-text.txt", text: "x".repeat(400_001) }),
      documents({ name: "one.json", text: '{"market":"One"}' }, { name: "two.json", text: '{"market":"Two"}' }),
    ];
    for (const data of invalid) await expect(previewProductIntake(data)).rejects.toThrow();
    expect(await counts()).toEqual(before);
    expect(await storedPaths()).toEqual(pathsBefore);
  });

  it("revalidates originals and rejects changed or absent preview digests before writes", async () => {
    const before = await counts();
    const pathsBefore = await storedPaths();
    const data = documents({ name: "facts.json", text: '{"productName":"Before"}' });
    const preview = await previewProductIntake(data);
    data.delete("files");
    data.append("files", new File(['{"productName":"After"}'], "facts.json"));
    data.set("previewDigest", preview.digest);
    await expect(createProductFromUploads(data)).rejects.toThrow(/changed/i);
    data.delete("previewDigest");
    await expect(createProductFromUploads(data)).rejects.toThrow(/preview/i);
    expect(await counts()).toEqual(before);
    expect(await storedPaths()).toEqual(pathsBefore);
  });

  it("creates one brief and all ready source/chunk records from the reviewed files", async () => {
    const context = Array.from({ length: 150 }, (_, index) => `Authored context ${index}: a simple, specific plan with customer proof.`).join("\n");
    const { id } = await commit(documents(
      { name: "product.json", text: '{"productName":"Two-file fixture","market":"Bookshops","notes":"Authored disposable acceptance only"}' },
      { name: "context.txt", text: context },
    ));
    expect((await pool.query("SELECT count(*)::int count FROM product_briefs WHERE project_id = $1 AND is_current = true", [id])).rows[0].count).toBe(1);
    const sourceRows = (await pool.query("SELECT id, title, status, storage_key FROM sources WHERE project_id = $1", [id])).rows;
    expect(sourceRows).toHaveLength(2);
    expect(sourceRows.map(source => source.title).sort()).toEqual(["context.txt", "product.json"]);
    for (const source of sourceRows) {
      expect(source.status).toBe("ready");
      expect((await readFile(path.join(storageRoot, source.storage_key))).length).toBeGreaterThan(0);
      expect((await pool.query("SELECT count(*)::int count FROM source_chunks WHERE source_id = $1", [source.id])).rows[0].count).toBeGreaterThan(0);
      if (source.title === "context.txt") {
        const chunks = (await pool.query("SELECT chunk_index, text, content_hash FROM source_chunks WHERE source_id = $1 ORDER BY chunk_index", [source.id])).rows;
        expect(chunks.length).toBeGreaterThan(2);
        expect(chunks.map(chunk => chunk.text).join("")).toBe(context);
        chunks.forEach((chunk, index) => {
          expect(chunk.chunk_index).toBe(index);
          expect(chunk.text.length).toBeLessThanOrEqual(2400);
          expect(chunk.content_hash).toBe(createHash("sha256").update(chunk.text).digest("hex"));
        });
      }
    }
  });

});
