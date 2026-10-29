import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { DatabaseUnavailableEmpty } from "@/components/database-unavailable-empty";
import { AgentProvenanceNotice, SimulationProvenanceNotice } from "@/components/simulation-provenance";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isDatabaseUnavailableError } from "@/lib/server/db/errors";
import { getRunResults } from "@/lib/server/services/project-service";
import { formatSimulationProvenanceMarkdown } from "@/lib/shared/simulation-provenance";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ runId: string }>;
};

export default async function RunPage({ params }: PageProps) {
  const { runId } = await params;
  const { detail, databaseUnavailable } = await loadRunResults(runId);
  if (databaseUnavailable) {
    return (
      <AppShell>
        <DatabaseUnavailableEmpty />
      </AppShell>
    );
  }
  if (!detail) notFound();
  const scores = detail.score?.scores;
  const qualifiedReportMarkdown = detail.report
    ? [
        "# Current provenance assessment",
        formatSimulationProvenanceMarkdown(detail.provenance),
        "---",
        "## Recorded report (unchanged)",
        detail.report.body,
      ].join("\n\n")
    : null;

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-balance text-3xl font-semibold">
                Simulation run
              </h1>
              <Badge variant="outline">{detail.run.status}</Badge>
              <Badge variant="secondary">Configured engine: {detail.run.engine}</Badge>
            </div>
            <p className="max-w-3xl text-pretty text-sm text-muted-foreground">
              {detail.project?.name} in {detail.run.targetMarket}. Refresh-safe traces
              and score outputs are persisted with immutable snapshots.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href={`/projects/${detail.run.projectId}`}>Back to project</Link>
          </Button>
        </section>

        <SimulationProvenanceNotice provenance={detail.provenance} />

        <div className="grid gap-4 md:grid-cols-4">
          <ScoreCard label="Launch readiness" value={scores?.launchReadiness ?? (detail.run.globalScore != null ? Number(detail.run.globalScore) : null)} />
          <ScoreCard label="Trust" value={scores?.trust ?? null} />
          <ScoreCard label="Differentiation" value={scores?.differentiation ?? null} />
          <ScoreCard label="Pricing fit" value={scores?.pricingFit ?? null} />
        </div>

        <Tabs defaultValue="results" className="flex flex-col gap-4">
          <TabsList>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="personas">Personas</TabsTrigger>
            <TabsTrigger value="trace">Trace detail</TabsTrigger>
            <TabsTrigger value="report">Report</TabsTrigger>
          </TabsList>

          <TabsContent value="results" className="grid gap-4 lg:grid-cols-[1fr_360px]">
            <Card className="rounded-lg">
              <CardHeader>
                <CardTitle>Score breakdown</CardTitle>
                <CardDescription>
                  Global score plus underlying components. This is not an oracle.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {scores
                  ? Object.entries(scores).map(([key, value]) => (
                      <div key={key} className="flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-4 text-sm">
                          <span>{labelize(key)}</span>
                          <span className="font-mono tabular-nums">{value ?? "n/a"}</span>
                        </div>
                        <Progress value={typeof value === "number" ? value : 0} />
                      </div>
                    ))
                  : "Scores are not available yet."}
              </CardContent>
            </Card>
            <Card className="rounded-lg">
              <CardHeader>
                <CardTitle>Recommended changes</CardTitle>
                <CardDescription>Product, pricing, messaging, and GTM.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {detail.recommendations.map((recommendation) => (
                  <div key={recommendation.id} className="flex flex-col gap-2 border-b pb-4 last:border-b-0 last:pb-0">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{recommendation.area}</Badge>
                      <Badge variant={recommendation.priority === "high" ? "default" : "secondary"}>
                        {recommendation.priority}
                      </Badge>
                    </div>
                    <h3 className="font-medium">{recommendation.title}</h3>
                    <p className="text-sm text-muted-foreground">{recommendation.suggestedChange}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="personas">
            <Card className="rounded-lg">
              <CardHeader>
                <CardTitle>Persona-by-persona perception</CardTitle>
                <CardDescription>
                  Available findings retain their stored scores and evidence references. Origin labels distinguish Gateway, synthetic and unverified results.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Persona</TableHead>
                      <TableHead>Result origin</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Trust</TableHead>
                      <TableHead>Adoption</TableHead>
                      <TableHead>Strongest objection</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detail.agents.map(({ agent, finding, provenance }) => {
                      const result = finding?.result;
                      return (
                        <TableRow key={agent.id}>
                          <TableCell className="max-w-xs whitespace-normal">
                            <div className="flex flex-col">
                              <span className="font-medium">{String(agent.personaSnapshot.name)}</span>
                              <span className="text-muted-foreground">{agent.status}</span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-md whitespace-normal">
                            <AgentProvenanceNotice provenance={provenance} />
                          </TableCell>
                          <TableCell>{result?.perceivedValueScore ?? "n/a"}</TableCell>
                          <TableCell>{result?.trustScore ?? "n/a"}</TableCell>
                          <TableCell>{result?.adoptionLikelihood ?? "n/a"}</TableCell>
                          <TableCell className="max-w-lg whitespace-normal text-muted-foreground">
                            {result?.likelyObjections?.[0] ?? agent.errorMessage ?? "Pending"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trace" className="flex flex-col gap-4">
            {detail.agents.map(({ agent, events, finding, provenance }) => (
              <Card key={agent.id} className="rounded-lg">
                <CardHeader>
                  <CardTitle>{String(agent.personaSnapshot.name)}</CardTitle>
                  <CardDescription>{String(agent.personaSnapshot.description)}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <AgentProvenanceNotice provenance={provenance} />
                  {events.map((event) => (
                    <div key={event.id} className="grid gap-3 md:grid-cols-[140px_1fr]">
                      <Badge variant="outline">{event.eventType}</Badge>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">{event.title}</span>
                        <span className="text-sm text-muted-foreground">{event.body}</span>
                      </div>
                    </div>
                  ))}
                  {finding ? (
                    <>
                      <Separator />
                      <pre className="max-h-96 overflow-auto rounded-lg bg-muted p-4 text-xs">
                        {JSON.stringify(finding.result, null, 2)}
                      </pre>
                    </>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="report">
            <Card className="rounded-lg">
              <CardHeader>
                <CardTitle>{detail.report?.title ?? "Report"}</CardTitle>
                <CardDescription>Current provenance assessment followed by the unchanged recorded Markdown report.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Current assessment: {detail.provenance.label}.</strong>{" "}
                  {detail.provenance.qualification}
                </p>
                <p className="text-sm text-muted-foreground">
                  The assessment is included below for copying. The recorded report follows unchanged; any provenance inside it reflects what was recorded when it was generated.
                </p>
                <pre role="region" aria-label="Qualified Markdown report" tabIndex={0} className="max-h-[720px] overflow-auto whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  {qualifiedReportMarkdown ?? "Report is not available yet."}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}

async function loadRunResults(runId: string) {
  try {
    return {
      detail: await getRunResults(runId),
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

function ScoreCard({ label, value }: { label: string; value: number | null }) {
  return (
    <Card className="rounded-lg" size="sm">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value === null ? "n/a" : Math.round(value)}</CardTitle>
      </CardHeader>
      <CardContent>
        {value === null
          ? <p className="text-xs text-muted-foreground">Score unavailable</p>
          : <Progress value={value} />}
      </CardContent>
    </Card>
  );
}

function labelize(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
}
