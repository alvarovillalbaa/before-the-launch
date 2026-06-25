import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listAllRuns } from "@/lib/server/services/project-service";

export const dynamic = "force-dynamic";

export default async function RunsPage() {
  const rows = await listAllRuns();
  return (
    <AppShell>
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Runs</CardTitle>
          <CardDescription>Persisted simulation runs and their current status.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Engine</TableHead>
                <TableHead>Score</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(({ run, project }) => (
                <TableRow key={run.id}>
                  <TableCell>{project.name}</TableCell>
                  <TableCell><Badge variant="outline">{run.status}</Badge></TableCell>
                  <TableCell>{run.engine}</TableCell>
                  <TableCell className="tabular-nums">{run.globalScore ?? "n/a"}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/runs/${run.id}`}>Inspect</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppShell>
  );
}
