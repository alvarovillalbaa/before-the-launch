import { redirect } from "next/navigation";
import { requireOperatorPage } from "@/lib/server/security/operator-request";

export const dynamic = "force-dynamic";

export default async function RunsPage() {
  await requireOperatorPage();
  redirect("/?view=runs");
}
