"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function OperatorLogout() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  async function logout() {
    setPending(true); setError(false);
    try {
      const response = await fetch("/api/operator/logout", { method: "POST" });
      if (!response.ok) throw new Error("Sign-out failed");
      router.replace("/login"); router.refresh();
    } catch { setError(true); }
    finally { setPending(false); }
  }
  return <div className="ml-auto flex items-center gap-2">{error ? <span role="alert" className="text-xs text-destructive">Could not sign out.</span> : null}<Button variant="ghost" size="sm" disabled={pending} onClick={logout} className="min-h-11">{pending ? "Signing out…" : "Sign out"}</Button></div>;
}
