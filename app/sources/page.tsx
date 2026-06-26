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
import { listAllSources } from "@/lib/server/services/project-service";

export const dynamic = "force-dynamic";

export default async function SourcesPage() {
  const { rows, databaseUnavailable } = await loadSources();

  return (
    <AppShell>
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Sources</CardTitle>
          <CardDescription>All source material across local product projects.</CardDescription>
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
                  <TableHead>Source</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Kind</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(({ source, project }) => (
                  <TableRow key={source.id}>
                    <TableCell className="max-w-md whitespace-normal">{source.title}</TableCell>
                    <TableCell>
                      <Button asChild variant="link" className="px-0">
                        <Link href={`/projects/${project.id}`}>{project.name}</Link>
                      </Button>
                    </TableCell>
                    <TableCell>{source.kind}</TableCell>
                    <TableCell><Badge variant="outline">{source.status}</Badge></TableCell>
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

async function loadSources() {
  try {
    return {
      rows: await listAllSources(),
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
