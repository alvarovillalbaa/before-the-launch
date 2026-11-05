"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Props = { runId: string; status: string; updatedAt: string; recordedControls: boolean };
const active = (status: string) => status === "queued" || status === "running";

export function RunMonitor({ runId, status, updatedAt, recordedControls }: Props) {
  const router = useRouter();
  const requested = useRef(false);
  const lastUpdate = useRef(updatedAt);
  const [message, setMessage] = useState<string | null>(null);
  const [stopPending, setStopPending] = useState(false);
  const [stopRequested, setStopRequested] = useState(false);

  useEffect(() => {
    if (!active(status)) return;
    let disposed = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const controller = new AbortController();
    async function poll() {
      const request = new AbortController();
      const abort = () => request.abort();
      controller.signal.addEventListener("abort", abort, { once: true });
      const timeout = setTimeout(abort, 15_000);
      try {
        const response = await fetch(`/api/workflow/status/${encodeURIComponent(runId)}`, { credentials: "same-origin", cache: "no-store", signal: request.signal });
        if (!response.ok) throw new Error("Status unavailable");
        const body = await response.json();
        if (body?.id !== runId || !["queued", "running", "partial", "completed", "failed"].includes(body.status)
          || typeof body.updatedAt !== "string" || !Number.isFinite(Date.parse(body.updatedAt))) throw new Error("Invalid status response");
        if (!disposed && body.updatedAt !== lastUpdate.current) {
          lastUpdate.current = body.updatedAt;
          router.refresh();
        }
        if (!disposed && active(body.status)) timer = setTimeout(poll, 2_000);
      } catch {
        if (!disposed) {
          setMessage("Live status is temporarily unavailable. Saved findings are retained; polling will continue.");
          timer = setTimeout(poll, 2_000);
        }
      } finally {
        clearTimeout(timeout);
        controller.signal.removeEventListener("abort", abort);
      }
    }
    async function execute() {
      try {
        // Refresh/unmount only cancels polling. The server owns the bounded execution claim.
        const response = await fetch(`/api/runs/${encodeURIComponent(runId)}/execute`, { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: "{}" });
        if (!response.ok && !disposed) {
          const body = await response.json().catch(() => null);
          setMessage(typeof body?.error?.message === "string" ? body.error.message.slice(0, 500) : "Execution could not be confirmed. Saved status will continue to be checked.");
        }
      } catch {
        if (!disposed) setMessage("The execution response is unavailable. This does not mean the current request stopped; saved status will continue to be checked.");
      }
    }
    if (status === "queued" && recordedControls && !requested.current) {
      requested.current = true;
      void execute();
    }
    timer = setTimeout(poll, 2_000);
    return () => { disposed = true; controller.abort(); if (timer) clearTimeout(timer); };
  }, [runId, status, updatedAt, recordedControls, router]);

  async function stop() {
    if (stopPending || stopRequested) return;
    setStopPending(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    try {
      const response = await fetch(`/api/runs/${encodeURIComponent(runId)}/stop`, { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: "{}", signal: controller.signal });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(typeof body?.error?.message === "string" ? body.error.message.slice(0, 500) : "Stop request could not be confirmed. You can retry.");
      setStopRequested(true);
      setMessage("Stop requested. No further personas will start. An in-flight request may still settle and incur a charge; completed findings remain available.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Stop request could not be confirmed. You can retry.");
    } finally { clearTimeout(timeout); setStopPending(false); }
  }

  return (
    <section aria-label="Run progress and controls" className="space-y-3 rounded-lg border p-4 text-sm">
      <p className="font-medium">{status === "queued" ? "Run queued" : status === "running" ? "Simulation in progress" : status === "partial" ? "Partial run — review coverage and stop reason" : status === "failed" ? "Run failed — saved findings remain available" : "Run finished"}</p>
      {active(status) ? <p className="text-muted-foreground">Saved progress is checked every two seconds. {recordedControls ? "A run can be claimed only once; reopening it does not start another run." : "This historical run has no recorded execution controls and is not automatically started."}</p> : null}
      {active(status) && recordedControls ? <>
        <Button type="button" variant="outline" className="min-h-11" onClick={stop} disabled={stopPending || stopRequested}>{stopPending ? "Requesting stop…" : stopRequested ? "Stop requested" : "Stop remaining personas"}</Button>
        <p className="text-muted-foreground">Stopping does not promise to abort a provider request already in flight. It can finish and incur a charge.</p>
      </> : null}
      {message ? <p role="status" aria-live="polite">{message}</p> : null}
      <p className="text-xs text-muted-foreground">If your operator session expires, <Link className="underline" href="/login">sign in again</Link> before using run controls.</p>
    </section>
  );
}
