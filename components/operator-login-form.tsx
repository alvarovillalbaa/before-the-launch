"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function OperatorLoginForm({ returnPath, configured }: { returnPath: string; configured: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const accessKey = new FormData(form).get("accessKey");
    setPending(true); setError("");
    try {
      const response = await fetch("/api/operator/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accessKey }) });
      if (!response.ok) {
        const body = await response.json();
        setError(typeof body.error === "string" ? body.error : "Could not sign in.");
        return;
      }
      form.reset();
      router.replace(returnPath);
      router.refresh();
    } catch { setError("Could not connect. Try signing in again."); }
    finally { setPending(false); }
  }
  return <form onSubmit={submit} className="space-y-4">
    <div className="space-y-2"><Label htmlFor="accessKey">Operator access key</Label><Input id="accessKey" name="accessKey" type="password" autoComplete="current-password" required disabled={!configured || pending} maxLength={256} /></div>
    {!configured ? <p role="status" className="text-sm text-muted-foreground">Private access is awaiting owner configuration.</p> : null}
    {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
    <Button type="submit" disabled={!configured || pending} className="min-h-11 w-full">{pending ? "Signing in…" : "Open workspace"}</Button>
  </form>;
}
