import { AppShell } from "@/components/app-shell";
import { ProductUploadIntake } from "@/components/product-upload-intake";

export const dynamic = "force-dynamic";

export default function NewProjectPage() {
  return (
    <AppShell>
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-balance text-3xl font-semibold">New product intake</h1>
          <p className="text-pretty text-sm text-muted-foreground">
            Upload your product documents, review the imported context, then set
            up a simulation. Your original files stay with the project as sources.
          </p>
        </div>
        <ProductUploadIntake />
      </div>
    </AppShell>
  );
}
