import Link from "next/link";
import { ArrowRightIcon, PlayIcon, PlusIcon } from "lucide-react";
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
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { isDatabaseUnavailableError } from "@/lib/server/db/errors";
import { listAllRuns, listProjectDashboard } from "@/lib/server/services/project-service";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ view?: string | string[]; simulate?: string | string[] }>;
};

const MISSING_FACT = "Not supplied in uploads";

export default async function Home({ searchParams }: PageProps) {
  const query = await searchParams;
  const view = query.view === "runs" ? "runs" : "projects";
  const chooseSimulation = query.simulate === "1";
  const { rows, runs, databaseUnavailable } = await loadWorkspace();
  const scores = rows.flatMap((row) => row.score ? [Number(row.score.globalScore)] : []);
  const averageReadiness = scores.length
    ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length).toString()
    : "No scores yet";

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="max-w-3xl text-balance text-3xl font-semibold">
              Projects
            </h1>
            <p className="max-w-2xl text-pretty text-sm text-muted-foreground">
              Upload launch context, run simulated buyer perception, inspect traces,
              and decide what to improve before shipping.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {databaseUnavailable ? (
              <>
                <Button className="min-h-11" variant="outline" disabled><PlayIcon data-icon="inline-start" />New simulation</Button>
                <Button className="min-h-11" disabled><PlusIcon data-icon="inline-start" />New product</Button>
              </>
            ) : (
              <>
                <Button asChild variant="outline" className="min-h-11">
                  <Link href={view === "runs" ? "/?view=runs&simulate=1#simulation-chooser" : "/?simulate=1#simulation-chooser"}>
                    <PlayIcon data-icon="inline-start" />New simulation
                  </Link>
                </Button>
                <Button asChild className="min-h-11">
                  <Link href="/projects/new">
                    <PlusIcon data-icon="inline-start" />
                    New product
                  </Link>
                </Button>
              </>
            )}
          </div>
        </section>

        {chooseSimulation && !databaseUnavailable ? (
          <SimulationChooser rows={rows} closeHref={view === "runs" ? "/?view=runs" : "/"} />
        ) : null}

        <div className="grid gap-4 md:grid-cols-4">
          <MetricCard label="Projects" value={databaseUnavailable ? "—" : rows.length.toString()} />
          <MetricCard
            label="Completed runs"
            value={databaseUnavailable ? "—" : runs.filter(({ run }) => run.status === "completed").length.toString()}
          />
          <MetricCard
            label="Average readiness"
            value={databaseUnavailable ? "—" : averageReadiness}
          />
          <MetricCard
            label="Simulation runs"
            value={databaseUnavailable ? "—" : runs.length.toString()}
          />
        </div>

        <nav aria-label="Project views" className="flex flex-wrap gap-2">
          <Button asChild variant={view === "projects" ? "default" : "outline"} className="min-h-11">
            <Link href="/" aria-current={view === "projects" ? "page" : undefined}>Products</Link>
          </Button>
          <Button asChild variant={view === "runs" ? "default" : "outline"} className="min-h-11">
            <Link href="/?view=runs" aria-current={view === "runs" ? "page" : undefined}>All runs</Link>
          </Button>
        </nav>

        {view === "projects" ? (
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Product simulations</CardTitle>
            <CardDescription>
              Latest run status, launch readiness, and recommended next action.
            </CardDescription>
            <CardAction>
              <Badge variant={databaseUnavailable ? "destructive" : "secondary"}>
                {databaseUnavailable ? "offline" : `${rows.length} total`}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            {databaseUnavailable ? (
              <DatabaseUnavailableEmpty />
            ) : rows.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <PlusIcon />
                  </EmptyMedia>
                  <EmptyTitle>No product projects yet</EmptyTitle>
                  <EmptyDescription>
                    Upload product information to create a project, then configure
                    its first perception simulation.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button asChild className="min-h-11">
                    <Link href="/projects/new">Upload a new product</Link>
                  </Button>
                </EmptyContent>
              </Empty>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Readiness</TableHead>
                    <TableHead>Last run</TableHead>
                    <TableHead>Next action</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.project.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <Link href={`/projects/${row.project.id}`} className="font-medium underline-offset-4 hover:underline focus-visible:underline">
                            {row.project.name}
                          </Link>
                          <span className="text-muted-foreground">
                            {row.brief?.category?.trim() || MISSING_FACT}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{row.lastRun?.status ?? row.project.status}</Badge>
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {row.score?.globalScore ?? "No score yet"}
                      </TableCell>
                      <TableCell>
                        {row.lastRun
                          ? <Link href={`/runs/${row.lastRun.id}`} className="underline-offset-4 hover:underline focus-visible:underline">{new Intl.DateTimeFormat("en", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            }).format(row.lastRun.createdAt)}</Link>
                          : "No run"}
                      </TableCell>
                      <TableCell className="max-w-xs whitespace-normal text-muted-foreground">
                        {row.project.nextRecommendedAction}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="ghost" size="sm" className="min-h-11">
                          <Link href={`/projects/${row.project.id}`} aria-label={`Open ${row.project.name}`}>
                            Open
                            <ArrowRightIcon data-icon="inline-end" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        ) : (
          <RunHistory runs={runs} databaseUnavailable={databaseUnavailable} />
        )}
      </div>
    </AppShell>
  );
}

async function loadWorkspace() {
  try {
    const [rows, runs] = await Promise.all([listProjectDashboard(), listAllRuns()]);
    return {
      rows,
      runs,
      databaseUnavailable: false,
    };
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return {
        rows: [],
        runs: [],
        databaseUnavailable: true,
      };
    }

    throw error;
  }
}

function SimulationChooser({ rows, closeHref }: { rows: Awaited<ReturnType<typeof listProjectDashboard>>; closeHref: string }) {
  return (
    <Card id="simulation-chooser" className="scroll-mt-6 rounded-lg">
      <CardHeader>
        <CardTitle>New simulation</CardTitle>
        <CardDescription>Start with a new product upload or use an existing product and its sources.</CardDescription>
        <CardAction><Button asChild variant="ghost" className="min-h-11"><Link href={closeHref}>Close chooser</Link></Button></CardAction>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-2">
        <section className="flex flex-col items-start gap-3 rounded-lg border p-4" aria-labelledby="new-product-heading">
          <h2 id="new-product-heading" className="font-medium">New product</h2>
          <p className="text-sm text-muted-foreground">Upload the product information first, then choose the audience and simulation settings.</p>
          <Button asChild className="min-h-11"><Link href="/projects/new"><PlusIcon data-icon="inline-start" />Upload a new product</Link></Button>
        </section>
        <section aria-labelledby="existing-product-heading" className="space-y-3">
          <h2 id="existing-product-heading" className="font-medium">Existing product</h2>
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No existing products yet. Upload a new product to begin.</p>
          ) : (
            <ul className="divide-y rounded-lg border">
              {rows.map(({ project, brief }) => (
                <li key={project.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="break-words font-medium">{project.name}</p>
                    <p className="break-words text-sm text-muted-foreground">{brief?.market?.trim() || MISSING_FACT}</p>
                  </div>
                  <Button asChild variant="outline" className="min-h-11"><Link href={`/projects/${project.id}?tab=setup`} aria-label={`Set up a simulation for ${project.name}`}>Set up run</Link></Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </CardContent>
    </Card>
  );
}

function RunHistory({ runs, databaseUnavailable }: { runs: Awaited<ReturnType<typeof listAllRuns>>; databaseUnavailable: boolean }) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>All simulation runs</CardTitle>
        <CardDescription>Every product's persisted run history, linked to its project and results.</CardDescription>
        <CardAction><Badge variant={databaseUnavailable ? "destructive" : "secondary"}>{databaseUnavailable ? "offline" : `${runs.length} total`}</Badge></CardAction>
      </CardHeader>
      <CardContent>
        {databaseUnavailable ? <DatabaseUnavailableEmpty /> : runs.length === 0 ? (
          <Empty>
            <EmptyHeader><EmptyTitle>No simulation runs yet</EmptyTitle><EmptyDescription>Choose a new or existing product to configure the first run.</EmptyDescription></EmptyHeader>
            <EmptyContent><Button asChild className="min-h-11"><Link href="/?view=runs&simulate=1#simulation-chooser">New simulation</Link></Button></EmptyContent>
          </Empty>
        ) : (
          <Table>
            <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Status</TableHead><TableHead>Engine</TableHead><TableHead>Score</TableHead><TableHead>Created</TableHead><TableHead><span className="sr-only">Results</span></TableHead></TableRow></TableHeader>
            <TableBody>
              {runs.map(({ run, project }) => (
                <TableRow key={run.id}>
                  <TableCell><Link href={`/projects/${project.id}?tab=runs`} className="font-medium underline-offset-4 hover:underline focus-visible:underline">{project.name}</Link></TableCell>
                  <TableCell><Badge variant="outline">{run.status}</Badge></TableCell>
                  <TableCell>{run.engine}</TableCell>
                  <TableCell className="tabular-nums">{run.globalScore ?? "No score yet"}</TableCell>
                  <TableCell>{new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(run.createdAt)}</TableCell>
                  <TableCell className="text-right"><Button asChild variant="ghost" size="sm" className="min-h-11"><Link href={`/runs/${run.id}`} aria-label={`Inspect ${project.name} run from ${new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(run.createdAt)}`}>Inspect</Link></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
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
