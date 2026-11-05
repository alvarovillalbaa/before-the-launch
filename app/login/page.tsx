import { OperatorLoginForm } from "@/components/operator-login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isOperatorAccessConfigured, safeReturnPath } from "@/lib/server/security/operator-auth";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  const query = await searchParams;
  return <main className="grid min-h-dvh place-items-center p-6"><Card className="w-full max-w-md"><CardHeader><CardTitle>Before the Launch</CardTitle><CardDescription>Sign in to your private product workspace.</CardDescription></CardHeader><CardContent><OperatorLoginForm returnPath={safeReturnPath(typeof query.next === "string" ? query.next : undefined)} configured={isOperatorAccessConfigured()} /></CardContent></Card></main>;
}
