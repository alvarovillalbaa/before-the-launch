import { DatabaseIcon } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function DatabaseUnavailableEmpty() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <DatabaseIcon />
        </EmptyMedia>
        <EmptyTitle>Database unavailable</EmptyTitle>
        <EmptyDescription>
          Start local Postgres with <code>pnpm setup:local</code>, or set{" "}
          <code>DATABASE_URL</code> to a running Postgres database before starting
          the dev server.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="text-muted-foreground">
        Docker is required for the bundled local database.
      </EmptyContent>
    </Empty>
  );
}
