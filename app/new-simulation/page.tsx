import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { listProjectDashboard } from "@/lib/server/services/project-service";

export const dynamic = "force-dynamic";

export default async function NewSimulationPage() {
  const projects = await listProjectDashboard();
  return (
    <AppShell>
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-semibold">New Simulation</h1>
          <p className="text-sm text-muted-foreground">
            Choose a product project, then run the setup from its project workspace.
          </p>
        </div>
        {projects.map(({ project, brief }) => (
          <Card key={project.id} className="rounded-lg">
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
              <CardDescription>{brief?.market ?? "No market set"}</CardDescription>
              <CardAction>
                <Button asChild>
                  <Link href={`/projects/${project.id}`}>Set up run</Link>
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {project.nextRecommendedAction}
            </CardContent>
          </Card>
        ))}
        {projects.length === 0 ? (
          <Button asChild>
            <Link href="/projects/new">Create product project</Link>
          </Button>
        ) : null}
      </div>
    </AppShell>
  );
}
