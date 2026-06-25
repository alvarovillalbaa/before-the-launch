import Link from "next/link";
import { ArrowRightIcon, PlusIcon } from "lucide-react";
import { AppShell } from "@/components/app-shell";
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
import { listProjectDashboard } from "@/lib/server/services/project-service";

export const dynamic = "force-dynamic";

export default async function Home() {
  const rows = await listProjectDashboard();

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
          <Button asChild>
            <Link href="/projects/new">
              <PlusIcon data-icon="inline-start" />
              New product
            </Link>
          </Button>
        </section>

        <div className="grid gap-4 md:grid-cols-4">
          <MetricCard label="Projects" value={rows.length.toString()} />
          <MetricCard
            label="Completed runs"
            value={rows.filter((row) => row.lastRun?.status === "completed").length.toString()}
          />
          <MetricCard
            label="Average readiness"
            value={
              rows.length
                ? Math.round(
                    rows.reduce(
                      (sum, row) => sum + Number(row.score?.globalScore ?? 0),
                      0,
                    ) / rows.length,
                  ).toString()
                : "0"
            }
          />
          <MetricCard
            label="Next action"
            value={rows[0]?.project.nextRecommendedAction ? "Ready" : "Add context"}
          />
        </div>

        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Product simulations</CardTitle>
            <CardDescription>
              Latest run status, launch readiness, and recommended next action.
            </CardDescription>
            <CardAction>
              <Badge variant="secondary">{rows.length} total</Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            {rows.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <PlusIcon />
                  </EmptyMedia>
                  <EmptyTitle>No product projects yet</EmptyTitle>
                  <EmptyDescription>
                    Create a product brief and add launch context to run the first
                    perception simulation.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button asChild>
                    <Link href="/projects/new">Create product project</Link>
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
                          <span className="font-medium">{row.project.name}</span>
                          <span className="text-muted-foreground">
                            {row.brief?.category ?? "Uncategorized"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{row.lastRun?.status ?? row.project.status}</Badge>
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {row.score?.globalScore ?? "n/a"}
                      </TableCell>
                      <TableCell>
                        {row.lastRun
                          ? new Intl.DateTimeFormat("en", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            }).format(row.lastRun.createdAt)
                          : "No run"}
                      </TableCell>
                      <TableCell className="max-w-xs whitespace-normal text-muted-foreground">
                        {row.project.nextRecommendedAction}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/projects/${row.project.id}`}>
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
      </div>
    </AppShell>
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
