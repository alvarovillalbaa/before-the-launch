import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getServerEnv, hasAiGatewayCredentials } from "@/lib/server/config/env";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const env = getServerEnv();
  const hasCredentials = hasAiGatewayCredentials(env);
  return (
    <AppShell>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Local runtime</CardTitle>
            <CardDescription>Configuration used by local-first runs.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <SettingRow label="Database" value={env.DATABASE_URL.replace(/:[^:@]+@/, ":***@")} />
            <SettingRow label="Storage" value={env.LOCAL_STORAGE_DIR} />
            <SettingRow label="Simulation engine" value={env.SIMULATION_ENGINE} />
            <SettingRow label="AI model" value={env.AI_GATEWAY_MODEL} />
          </CardContent>
        </Card>
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>AI credentials</CardTitle>
            <CardDescription>
              The app runs without credentials using deterministic fake agents.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-3 text-sm">
            <Badge variant={hasCredentials ? "default" : "secondary"}>
              {hasCredentials ? "Gateway available" : "Fake agents active"}
            </Badge>
            <span className="text-muted-foreground">
              Set `AI_GATEWAY_API_KEY` or `VERCEL_OIDC_TOKEN` for real Gateway runs.
            </span>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <span className="font-medium">{label}</span>
      <span className="break-all font-mono text-xs text-muted-foreground">{value}</span>
    </div>
  );
}
