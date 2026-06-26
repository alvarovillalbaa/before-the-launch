import Link from "next/link";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { isDatabaseUnavailableError } from "@/lib/server/db/errors";
import { listAllRuns } from "@/lib/server/services/project-service";

export const dynamic = "force-dynamic";

export default async function RunsPage() {
  const { rows, databaseUnavailable } = await loadRuns();

  return (
    <AppShell>
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Runs</CardTitle>
          <CardDescription>Persisted simulation runs and their current status.</CardDescription>
          <CardAction>
            <Badge variant={databaseUnavailable ? "destructive" : "secondary"}>
              {databaseUnavailable ? "offline" : `${rows.length} total`}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          {databaseUnavailable ? (
            <DatabaseUnavailableEmpty />
          ) : (
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
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}

async function loadRuns() {
  try {
    return {
      rows: await listAllRuns(),
      databaseUnavailable: false,
    };
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return {
        rows: [],
        databaseUnavailable: true,
      };
    }

    throw error;
  }
}
