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
import { listAllSources } from "@/lib/server/services/project-service";

export const dynamic = "force-dynamic";

export default async function SourcesPage() {
  const rows = await listAllSources();
  return (
    <AppShell>
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Sources</CardTitle>
          <CardDescription>All source material across local product projects.</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </AppShell>
  );
}
