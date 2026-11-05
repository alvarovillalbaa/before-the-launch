"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { PlayIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { parseUsdCents, type SimulationDepth, type SimulationExecutionEngine } from "@/lib/shared/simulation-controls";

type SetupPersona = { id: string; name: string; description: string; isDefault: boolean };
type Props = {
  projectId: string;
  initialRequestId: string;
  defaultTargetMarket: string;
  personas: SetupPersona[];
  hasBrief: boolean;
};
type CreationInput = {
  projectId: string; requestId: string; targetMarket: string;
  engine: SimulationExecutionEngine; depth: SimulationDepth;
  budgetLimitCents: number; agentCount: number; personaIds: string[];
};

export function SimulationSetupForm({ projectId, initialRequestId, defaultTargetMarket, personas, hasBrief }: Props) {
  const router = useRouter();
  const [requestId] = useState(initialRequestId);
  const [engine, setEngine] = useState<SimulationExecutionEngine>("fake");
  const [depth, setDepth] = useState<SimulationDepth>("standard");
  const [market, setMarket] = useState(defaultTargetMarket);
  const [budget, setBudget] = useState("0.00");
  const [selected, setSelected] = useState(() => personas.filter((persona) => persona.isDefault).map((persona) => persona.id));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uncertain, setUncertain] = useState(false);
  const submitted = useRef<CreationInput | null>(null);
  const submitting = useRef(false);
  const locked = pending || uncertain;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || !hasBrief) return;
    setError(null);
    let input = submitted.current;
    if (!input) {
      if (!market.trim() || selected.length < 1 || selected.length > 10) {
        setError("Enter a target market and select between 1 and 10 personas.");
        return;
      }
      let cents: number;
      try { cents = engine === "fake" ? 0 : parseUsdCents(budget); }
      catch { setError("Enter a USD amount with at most two decimal places."); return; }
      if (!Number.isSafeInteger(cents) || cents < 0 || cents > 100_000 || (engine === "gateway" && cents === 0)) {
        setError("Gateway requires an estimated spending target from $0.01 to $1,000.00. Choose Free demo for no model calls.");
        return;
      }
      input = { projectId, requestId, targetMarket: market.trim(), engine, depth, budgetLimitCents: cents, agentCount: selected.length, personaIds: [...selected] };
    }
    submitted.current = input;
    submitting.current = true;
    setPending(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    try {
      const response = await fetch("/api/runs", {
        method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input), signal: controller.signal,
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        const message = typeof body?.error?.message === "string" ? body.error.message.slice(0, 500) : "Run creation could not be confirmed.";
        // A definite input/access refusal may be edited; uncertain writes retain their exact identity.
        if ((response.status >= 400 && response.status < 500 && response.status !== 409)
          || (response.status === 503 && body?.error?.code === "gateway_pricing_unavailable")) {
          submitted.current = null;
          setUncertain(false);
        } else setUncertain(true);
        setError(message);
        return;
      }
      if (body?.ok !== true || typeof body?.run?.id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.run.id)) {
        throw new Error("Unconfirmed creation response");
      }
      setUncertain(true);
      router.push(`/runs/${body.run.id}`);
    } catch {
      setUncertain(true);
      setError("The creation response is unavailable. Retry this same setup to recover its saved run; a retry uses the same request ID.");
    } finally {
      clearTimeout(timeout);
      submitting.current = false;
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} aria-label="Simulation setup" aria-busy={pending}>
      <FieldGroup>
        <fieldset disabled={locked} className="grid min-w-0 gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="simulation-engine">Engine</FieldLabel>
            <NativeSelect id="simulation-engine" name="engine" value={engine} onChange={(event) => setEngine(event.target.value as SimulationExecutionEngine)} className="w-full">
              <NativeSelectOption value="fake">Free demo — no model calls</NativeSelectOption>
              <NativeSelectOption value="gateway">AI Gateway — estimated spending target</NativeSelectOption>
            </NativeSelect>
            <FieldDescription>Gateway requires operator admission and available model pricing. An unavailable Gateway run stays unavailable.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="simulation-depth">Depth</FieldLabel>
            <NativeSelect id="simulation-depth" name="depth" value={depth} onChange={(event) => setDepth(event.target.value as SimulationDepth)} className="w-full">
              <NativeSelectOption value="quick">Quick</NativeSelectOption>
              <NativeSelectOption value="standard">Standard</NativeSelectOption>
              <NativeSelectOption value="deep">Deep</NativeSelectOption>
            </NativeSelect>
            <FieldDescription>Gateway depth changes prompt treatment and output allowance. Demo output remains deterministic at every depth.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="simulation-market">Target market</FieldLabel>
            <Input id="simulation-market" name="targetMarket" value={market} onChange={(event) => setMarket(event.target.value)} maxLength={180} required aria-describedby="simulation-market-help" />
            <FieldDescription id="simulation-market-help">{defaultTargetMarket ? "Choose the audience or market for this simulation." : "Not supplied in uploads. Enter the audience or market for this simulation."}</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="simulation-budget">Estimated model spending target (USD)</FieldLabel>
            <Input id="simulation-budget" name="budgetUsd" inputMode="decimal" value={engine === "fake" ? "0.00" : budget} onChange={(event) => setBudget(event.target.value)} disabled={engine === "fake"} maxLength={12} aria-describedby="simulation-budget-help" />
            <FieldDescription id="simulation-budget-help">{engine === "fake" ? "Free demo costs $0 and makes no model requests." : "This is an estimated target, not a hard billing cap. In-flight requests, routing and final charges can exceed it. Amounts use USD, with at most two decimal places."}</FieldDescription>
          </Field>
        </fieldset>
        <fieldset disabled={locked} className="grid min-w-0 gap-3 md:grid-cols-2" aria-describedby="simulation-personas-help">
          <legend className="mb-2 text-sm font-medium">Personas</legend>
          {personas.map((persona) => (
            <label key={persona.id} className="flex min-h-11 gap-3 rounded-lg border p-3 text-sm">
              <input type="checkbox" name="personaIds" value={persona.id} checked={selected.includes(persona.id)} onChange={(event) => setSelected((ids) => event.target.checked ? [...ids, persona.id] : ids.filter((id) => id !== persona.id))} />
              <span className="flex min-w-0 flex-col gap-1"><span className="font-medium">{persona.name}</span><span className="text-muted-foreground">{persona.description}</span></span>
            </label>
          ))}
        </fieldset>
        <p id="simulation-personas-help" className="text-sm text-muted-foreground">{selected.length} persona{selected.length === 1 ? "" : "s"} selected. Select between 1 and 10; this full selection is the run cohort.</p>
        {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
        {uncertain ? <p role="note" className="text-sm text-muted-foreground">This setup is retained for the same creation request. Retrying does not request a second run.</p> : null}
        <Button type="submit" className="min-h-11 w-fit" disabled={!hasBrief || pending}>
          <PlayIcon data-icon="inline-start" />{pending ? "Creating run…" : uncertain ? "Retry same creation request" : "Create simulation run"}
        </Button>
        {!hasBrief ? <p role="note" className="text-sm text-muted-foreground">A current product brief is required before starting a simulation.</p> : null}
      </FieldGroup>
    </form>
  );
}
