import Link from "next/link";
import { notFound } from "next/navigation";
import { FileTextIcon, LinkIcon, PlayIcon, Trash2Icon } from "lucide-react";
import {
  addFileSourceAction,
  addTextSourceAction,
  addUrlSourceAction,
  deleteSourceAction,
  startSimulationAction,
} from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { DatabaseUnavailableEmpty } from "@/components/database-unavailable-empty";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { isDatabaseUnavailableError } from "@/lib/server/db/errors";
import { getProjectDetail } from "@/lib/server/services/project-service";
import { sourceKinds } from "@/lib/shared/schemas";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ tab?: string | string[] }>;
};

const MISSING_FACT = "Not supplied in uploads";
const briefFields = [
  ["productName", "Product name"],
  ["category", "Category"],
  ["icp", "Target customer"],
  ["market", "Market"],
  ["expectedPrice", "Expected price"],
  ["competitors", "Competitors"],
  ["launchChannel", "Launch channel"],
  ["positioningStatement", "Positioning statement"],
  ["notes", "Notes"],
] as const;

export default async function ProjectPage({ params, searchParams }: PageProps) {
  const [{ projectId }, query] = await Promise.all([params, searchParams]);
  const selectedTab = typeof query.tab === "string" && ["sources", "setup", "runs", "brief"].includes(query.tab)
    ? query.tab
    : "sources";
  const { detail, databaseUnavailable } = await loadProjectDetail(projectId);
  if (databaseUnavailable) {
    return (
      <AppShell>
        <DatabaseUnavailableEmpty />
      </AppShell>
    );
  }
  if (!detail) notFound();

  const readySources = detail.sources.filter((source) => source.status === "ready");
  const latestRun = detail.runs[0];
  const missingFacts = briefFields.filter(([key]) => key !== "competitors" && key !== "notes" && !detail.brief?.[key]?.trim());

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-balance text-3xl font-semibold">
                {detail.project.name}
              </h1>
              <Badge variant="outline">{detail.project.status}</Badge>
            </div>
            <p className="max-w-3xl text-pretty text-sm text-muted-foreground">
              {detail.brief?.positioningStatement?.trim() || MISSING_FACT}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild className="min-h-11"><Link href={`/projects/${projectId}?tab=setup`}><PlayIcon data-icon="inline-start" />New simulation</Link></Button>
            {latestRun ? (
              <Button asChild variant="outline" className="min-h-11">
                <Link href={`/runs/${latestRun.id}`}>Open latest run</Link>
              </Button>
            ) : null}
          </div>
        </section>

        {missingFacts.length > 0 ? (
          <div role="note" aria-label="Missing uploaded product facts" className="space-y-1 rounded-lg border border-amber-500/40 bg-amber-500/5 p-4 text-sm">
            <p className="font-medium">Some product facts were not supplied in uploads.</p>
            <p className="text-muted-foreground">{missingFacts.map(([, label]) => label).join(", ")}. These values remain blank and may affect the simulation. You can configure its target market in Simulation setup and upload further context in Sources.</p>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-4">
          <MetricCard label="Ready sources" value={readySources.length.toString()} />
          <MetricCard label="Runs" value={detail.runs.length.toString()} />
          <MetricCard label="Personas" value={detail.personas.length.toString()} />
          <MetricCard label="Latest status" value={latestRun?.status ?? "No run"} />
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <nav aria-label="Project sections" className="flex max-w-full flex-wrap gap-2">
            {[["sources", "Sources"], ["setup", "Simulation setup"], ["runs", "Runs"], ["brief", "Brief"]].map(([tab, label]) => (
              <Button key={tab} asChild variant={selectedTab === tab ? "default" : "outline"} className="min-h-11">
                <Link href={`/projects/${projectId}?tab=${tab}`} aria-current={selectedTab === tab ? "page" : undefined}>{label}</Link>
              </Button>
            ))}
          </nav>

          {selectedTab === "sources" ? <div className="flex flex-col gap-4">
            <div className="grid gap-4 lg:grid-cols-3">
              <SourceCard
                title="Paste URL"
                description="Fetch a public page with SSRF protection and size limits."
                icon="url"
              >
                <form action={addUrlSourceAction}>
                  <input type="hidden" name="projectId" value={projectId} />
                  <SourceFields />
                  <Field className="mt-4">
                    <FieldLabel htmlFor="url">URL</FieldLabel>
                    <Input id="url" name="url" type="url" required placeholder="https://example.com" />
                  </Field>
                  <Button className="mt-4" type="submit">Add URL</Button>
                </form>
              </SourceCard>
              <SourceCard
                title="Add text"
                description="Paste launch notes, positioning, research, or previous launch context."
                icon="text"
              >
                <form action={addTextSourceAction}>
                  <input type="hidden" name="projectId" value={projectId} />
                  <SourceFields />
                  <Field className="mt-4">
                    <FieldLabel htmlFor="text">Text</FieldLabel>
                    <Textarea id="text" name="text" rows={6} required />
                  </Field>
                  <Button className="mt-4" type="submit">Add text</Button>
                </form>
              </SourceCard>
              <SourceCard
                title="Upload file"
                description="Supports TXT, Markdown, CSV, JSON, PDF, and DOCX when parsers are available."
                icon="file"
              >
                <form action={addFileSourceAction}>
                  <input type="hidden" name="projectId" value={projectId} />
                  <SourceFields />
                  <Field className="mt-4">
                    <FieldLabel htmlFor="file">File</FieldLabel>
                    <Input id="file" name="file" type="file" required />
                  </Field>
                  <Button className="mt-4" type="submit">Upload file</Button>
                </form>
              </SourceCard>
            </div>

            <Card className="rounded-lg">
              <CardHeader>
                <CardTitle>Sources</CardTitle>
                <CardDescription>
                  Source content is evidence, not executable instruction.
                </CardDescription>
                <CardAction>
                  <Badge variant="secondary">{detail.sources.length} total</Badge>
                </CardAction>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Kind</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Hash</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detail.sources.length === 0 ? <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">No sources yet. Add product context above before running a simulation.</TableCell></TableRow> : null}
                    {detail.sources.map((source) => (
                      <TableRow key={source.id}>
                        <TableCell className="max-w-sm whitespace-normal">
                          <div className="flex flex-col gap-1">
                            <span className="font-medium">{source.title}</span>
                            <span className="text-xs text-muted-foreground">{source.url}</span>
                            {source.errorMessage ? (
                              <span className="text-xs text-destructive">{source.errorMessage}</span>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell>{source.kind}</TableCell>
                        <TableCell><Badge variant="outline">{source.status}</Badge></TableCell>
                        <TableCell className="font-mono text-xs">
                          {source.contentHash?.slice(0, 10) ?? "pending"}
                        </TableCell>
                        <TableCell className="text-right">
                          <form action={deleteSourceAction}>
                            <input type="hidden" name="projectId" value={projectId} />
                            <input type="hidden" name="sourceId" value={source.id} />
                            <Button type="submit" variant="ghost" size="icon" aria-label={`Delete ${source.title}`}>
                              <Trash2Icon />
                            </Button>
                          </form>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div> : null}

          {selectedTab === "setup" ? <div>
            <Card className="rounded-lg">
              <CardHeader>
                <CardTitle>Run simulation</CardTitle>
                <CardDescription>
                  Fake agents run deterministically without credentials. Gateway runs activate when credentials exist.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form action={startSimulationAction}>
                  <input type="hidden" name="projectId" value={projectId} />
                  <FieldGroup>
                    <div className="grid gap-4 md:grid-cols-4">
                      <Field>
                        <FieldLabel htmlFor="targetMarket">Target market</FieldLabel>
                        <Input id="targetMarket" name="targetMarket" defaultValue={detail.brief?.market?.trim() || ""} maxLength={180} aria-describedby="target-market-help" required />
                        <FieldDescription id="target-market-help">
                          {detail.brief?.market?.trim()
                            ? "Choose the audience or market for this simulation."
                            : "Not supplied in uploads. Enter the audience or market to use for this simulation."}
                        </FieldDescription>
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="agentCount">Agents</FieldLabel>
                        <Input id="agentCount" name="agentCount" type="number" min={1} max={10} defaultValue={8} />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="depth">Depth</FieldLabel>
                        <NativeSelect id="depth" name="depth" className="w-full">
                          <NativeSelectOption value="quick">Quick</NativeSelectOption>
                          <NativeSelectOption value="standard">Standard</NativeSelectOption>
                          <NativeSelectOption value="deep">Deep</NativeSelectOption>
                        </NativeSelect>
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="budgetLimitCents">Budget limit</FieldLabel>
                        <Input id="budgetLimitCents" name="budgetLimitCents" type="number" min={0} defaultValue={0} />
                      </Field>
                    </div>
                    <Separator />
                    <div className="grid gap-3 md:grid-cols-2">
                      {detail.personas.map((persona) => (
                        <label key={persona.id} className="flex min-h-11 gap-3 rounded-lg border p-3 text-sm">
                          <input type="checkbox" name="personaIds" value={persona.id} defaultChecked={persona.isDefault} />
                          <span className="flex flex-col gap-1">
                            <span className="font-medium">{persona.name}</span>
                            <span className="text-muted-foreground">{persona.description}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                    <Button type="submit" className="min-h-11" disabled={!detail.brief}>
                      <PlayIcon data-icon="inline-start" />
                      Run simulation
                    </Button>
                  </FieldGroup>
                  {!detail.brief ? <p role="note" className="mt-3 text-sm text-muted-foreground">A current product brief is required before starting a simulation.</p> : null}
                </form>
              </CardContent>
            </Card>
          </div> : null}

          {selectedTab === "runs" ? <div>
            <Card className="rounded-lg">
              <CardHeader>
                <CardTitle>Runs</CardTitle>
                <CardDescription>Refresh-safe persisted simulation history.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Engine</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detail.runs.length === 0 ? <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">No simulation runs yet. Use Simulation setup to configure the first run.</TableCell></TableRow> : null}
                    {detail.runs.map((run) => (
                      <TableRow key={run.id}>
                        <TableCell><Badge variant="outline">{run.status}</Badge></TableCell>
                        <TableCell>{run.engine}</TableCell>
                        <TableCell className="tabular-nums">{run.globalScore ?? "No score yet"}</TableCell>
                        <TableCell>{new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(run.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant="ghost" size="sm" className="min-h-11">
                            <Link href={`/runs/${run.id}`} aria-label={`Inspect run from ${new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(run.createdAt)}`}>Inspect</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div> : null}

          {selectedTab === "brief" ? <div>
            <Card className="rounded-lg">
              <CardHeader>
                <CardTitle>Current brief</CardTitle>
                <CardDescription>
                  Runs freeze this brief at execution time. Missing values stay marked as not supplied in uploads.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 text-sm md:grid-cols-2">
                {briefFields.map(([key, label]) => (
                  <div key={key} className="flex flex-col gap-1">
                    <span className="font-medium">{label}</span>
                    <span className="whitespace-pre-wrap break-words text-muted-foreground">{detail.brief?.[key]?.trim() || MISSING_FACT}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div> : null}
        </div>
      </div>
    </AppShell>
  );
}

async function loadProjectDetail(projectId: string) {
  try {
    return {
      detail: await getProjectDetail(projectId),
      databaseUnavailable: false as const,
    };
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return {
        detail: null,
        databaseUnavailable: true as const,
      };
    }

    throw error;
  }
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="rounded-lg" size="sm">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

function SourceFields() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field>
        <FieldLabel htmlFor="kind">Classification</FieldLabel>
        <NativeSelect id="kind" name="kind" className="w-full">
          {sourceKinds.map((kind) => (
            <NativeSelectOption key={kind} value={kind}>
              {kind.replaceAll("_", " ")}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </Field>
      <Field>
        <FieldLabel htmlFor="title">Title</FieldLabel>
        <Input id="title" name="title" />
        <FieldDescription>Optional for URLs; required for files and notes.</FieldDescription>
      </Field>
    </div>
  );
}

function SourceCard({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: "url" | "text" | "file";
  children: React.ReactNode;
}) {
  const Icon = icon === "url" ? LinkIcon : FileTextIcon;
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
