import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import type { AgentProvenance, SimulationProvenance } from "@/lib/shared/simulation-provenance";

export function SimulationProvenanceNotice({ provenance }: { provenance: SimulationProvenance }) {
  const counts = [
    ["Gateway findings", provenance.counts.gateway],
    ["Demo findings", provenance.counts.fake],
    ["Synthetic fallbacks", provenance.counts.fallback],
    ["Unverified origins", provenance.counts.unknown],
    ["Pending results", provenance.counts.pending],
  ] as const;

  return (
    <Alert role="note" aria-label="Simulation result provenance" className="min-w-0 rounded-lg border-2">
      <AlertTitle className="flex flex-wrap items-center gap-2">
        <h2 className="font-medium">How these results were produced</h2>
        <Badge variant="outline" className="h-auto max-w-full whitespace-normal text-left">{provenance.label}</Badge>
      </AlertTitle>
      <AlertDescription className="grid min-w-0 gap-3">
        <p className="break-words">{provenance.qualification}</p>
        <p>
          <span className="font-medium text-foreground">Scores and recorded report: </span>
          {provenance.outputLineage === "matched"
            ? "Linked to these persona findings."
            : "Their origin is unverified from the recorded data."}
        </p>
        <p className="text-xs">The counts below describe the current persona findings.</p>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-5">
          {counts.map(([label, count]) => (
            <div key={label} className="min-w-0">
              <dt className="break-words text-xs">{label}</dt>
              <dd className="font-medium tabular-nums text-foreground">{count}</dd>
            </div>
          ))}
        </dl>
      </AlertDescription>
    </Alert>
  );
}

export function AgentProvenanceNotice({ provenance }: { provenance: AgentProvenance }) {
  return (
    <div role="note" className="grid min-w-0 gap-1" aria-label="Persona result provenance">
      <Badge variant="outline" className="h-auto max-w-full whitespace-normal text-left">{provenance.label}</Badge>
      <p className="max-w-md whitespace-normal break-words text-sm text-muted-foreground">{provenance.qualification}</p>
    </div>
  );
}
