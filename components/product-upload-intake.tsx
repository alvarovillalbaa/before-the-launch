"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { FileTextIcon, UploadCloudIcon, XIcon } from "lucide-react";
import {
  createProductFromUploadsAction,
  previewProductIntakeAction,
} from "@/app/intake-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  INTAKE_EXTENSIONS,
  INTAKE_MAX_FILES,
  INTAKE_MAX_TOTAL_BYTES,
  type ProductIntakePreview,
} from "@/lib/shared/product-intake";
import type { ProductBriefInput } from "@/lib/shared/schemas";

const briefLabels: Record<keyof ProductBriefInput, string> = {
  productName: "Product name",
  category: "Category",
  icp: "Target buyer",
  market: "Market",
  expectedPrice: "Expected price",
  competitors: "Competitors",
  launchChannel: "Launch channel",
  positioningStatement: "Positioning",
  notes: "Notes",
};

function formatBytes(bytes: number) {
  return `${Math.ceil(bytes / 1024)} KB`;
}

export function ProductUploadIntake() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const busyRef = useRef(false);
  const [files, setFiles] = useState<File[]>([]);
  const [preview, setPreview] = useState<ProductIntakePreview | null>(null);
  const [pending, setPending] = useState<"preview" | "create" | null>(null);
  const [error, setError] = useState("");
  const [projectId, setProjectId] = useState<string | null>(null);
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  const disabled = pending !== null || projectId !== null;

  function uploadData() {
    const data = new FormData();
    for (const file of files) data.append("files", file);
    return data;
  }

  function changeFiles(nextFiles: File[]) {
    setFiles(nextFiles);
    setPreview(null);
    setError("");
  }

  async function previewFiles(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busyRef.current || projectId) return;
    if (files.length === 0 || files.length > INTAKE_MAX_FILES) {
      setError(`Choose between 1 and ${INTAKE_MAX_FILES} files.`);
      return;
    }
    if (totalBytes > INTAKE_MAX_TOTAL_BYTES) {
      setError(`Choose files totaling ${formatBytes(INTAKE_MAX_TOTAL_BYTES)} or less.`);
      return;
    }
    busyRef.current = true;
    setPending("preview");
    setError("");
    setPreview(null);
    try {
      const result = await previewProductIntakeAction(uploadData());
      if (result.ok) setPreview(result.preview);
      else setError(result.error);
    } catch {
      setError("The preview could not be loaded. Your selected files are still here; try again.");
    } finally {
      busyRef.current = false;
      setPending(null);
    }
  }

  async function createProject() {
    if (busyRef.current || !preview || projectId) return;
    busyRef.current = true;
    setPending("create");
    setError("");
    try {
      const data = uploadData();
      data.set("previewDigest", preview.digest);
      const result = await createProductFromUploadsAction(data);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setProjectId(result.projectId);
      router.push(`/projects/${result.projectId}?tab=setup`);
      router.refresh();
    } catch {
      setError("The server response could not be received. Check Projects before retrying to avoid a duplicate import. Your files and preview are still here.");
    } finally {
      busyRef.current = false;
      setPending(null);
    }
  }

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UploadCloudIcon className="size-5" aria-hidden="true" />
            Upload product context
          </CardTitle>
          <CardDescription>
            Product documents, launch plans, pricing, and research can all be sources.
            Previewing files does not create a project.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={previewFiles} className="flex flex-col gap-5" aria-busy={pending !== null}>
            <Field>
              <FieldLabel htmlFor="product-files">Product files</FieldLabel>
              <Input
                ref={inputRef}
                id="product-files"
                name="files"
                type="file"
                accept={INTAKE_EXTENSIONS.join(",")}
                multiple
                disabled={disabled}
                aria-describedby="product-files-help"
                className="h-auto min-h-11 rounded-lg py-2"
                onChange={(event) => changeFiles(Array.from(event.target.files ?? []))}
              />
              <FieldDescription id="product-files-help">
                TXT, Markdown, CSV, JSON, PDF, or DOCX. Up to {INTAKE_MAX_FILES} files,
                totaling {formatBytes(INTAKE_MAX_TOTAL_BYTES)}. Selecting again replaces this list.
              </FieldDescription>
              <a href="https://github.com/alvarovillalbaa/before-the-launch/blob/main/docs/product-intake.md" target="_blank" rel="noreferrer" className="w-fit text-sm underline underline-offset-4">
                Supported brief file format
              </a>
            </Field>
            {files.length > 0 ? (
              <ul aria-label="Selected files" className="divide-y rounded-lg border px-3">
                {files.map((file, index) => (
                  <li key={`${file.name}-${index}`} className="flex min-w-0 items-center gap-3 py-2">
                    <FileTextIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span className="min-w-0 flex-1 break-words text-sm">{file.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{formatBytes(file.size)}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-lg"
                      disabled={disabled}
                      aria-label={`Remove ${file.name}`}
                      onClick={() => {
                        changeFiles(files.filter((_, selectedIndex) => selectedIndex !== index));
                        if (inputRef.current) inputRef.current.value = "";
                      }}
                    >
                      <XIcon aria-hidden="true" />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button asChild variant="outline" className="min-h-11"><Link href="/">Back to Projects</Link></Button>
              <Button type="submit" className="min-h-11" disabled={disabled || files.length === 0}>
                {pending === "preview" ? "Reading files…" : "Preview imported context"}
              </Button>
            </div>
          </form>
          <div aria-live="polite" aria-atomic="true" className="mt-4 text-sm">
            {pending ? <p>{pending === "preview" ? "Extracting document text…" : "Creating the project and its sources…"}</p> : null}
            {!pending && preview && !projectId ? <p>Preview ready. Review the imported context below before creating the project.</p> : null}
            {projectId ? (
              <p>
                Project created. <Link href={`/projects/${projectId}?tab=setup`} className="underline underline-offset-4">Open the simulation workspace</Link>.
              </p>
            ) : null}
          </div>
          {error ? <p role="alert" className="mt-3 text-sm text-destructive">{error}</p> : null}
        </CardContent>
      </Card>

      {preview ? (
        <Card className="rounded-lg" aria-label="Imported context preview">
          <CardHeader>
            <CardTitle>Review imported context</CardTitle>
            <CardDescription>
              Review the text before creating this product. Brief fields are copied from
              explicitly named JSON fields; other documents remain available as source context.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex min-w-0 flex-col gap-6">
            {preview.nameFromFile ? (
              <p className="text-sm text-muted-foreground">
                The project title “{preview.projectName}” comes from the first filename. A product name was not supplied in the imported brief.
              </p>
            ) : null}
            <dl className="grid min-w-0 gap-x-6 gap-y-4 md:grid-cols-2">
              {(Object.keys(briefLabels) as Array<keyof ProductBriefInput>).map((key) => (
                <div key={key} className="min-w-0">
                  <dt className="text-sm font-medium">{briefLabels[key]}</dt>
                  <dd className="mt-1 whitespace-pre-wrap break-words text-sm text-muted-foreground">
                    {preview.brief[key] || "Not supplied in uploads"}
                  </dd>
                  {preview.fieldSources[key] ? <dd className="mt-1 break-words text-xs text-muted-foreground">From {preview.fieldSources[key]}</dd> : null}
                </div>
              ))}
            </dl>
            {preview.warnings.length > 0 ? (
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {preview.warnings.map((warning, index) => <li key={index}>{warning}</li>)}
              </ul>
            ) : null}
            <div className="flex min-w-0 flex-col gap-3">
              {preview.files.map((file, index) => (
                <details key={`${file.name}-${index}`} className="min-w-0 rounded-lg border p-3">
                  <summary className="cursor-pointer break-words text-sm font-medium">
                    {file.name} · {file.characterCount.toLocaleString()} extracted characters
                  </summary>
                  <p className="mt-3 max-h-64 overflow-y-auto whitespace-pre-wrap break-words text-sm text-muted-foreground">{file.excerpt}</p>
                  {file.characterCount > file.excerpt.length ? <p className="mt-2 text-xs text-muted-foreground">Preview excerpt. The extracted text is saved with this source when the project is created.</p> : null}
                </details>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
              <p className="max-w-lg text-sm text-muted-foreground">Missing details stay missing. Choose a simulation target in the project workspace after import.</p>
              <Button type="button" className="min-h-11" onClick={createProject} disabled={disabled}>
                {pending === "create" ? "Creating project…" : "Create project from uploads"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
      <noscript><p>JavaScript is required to preview uploaded files and create this project.</p></noscript>
    </div>
  );
}
