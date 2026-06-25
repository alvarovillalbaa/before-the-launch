import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createProjectAction } from "@/app/actions";

export const dynamic = "force-dynamic";

export default function NewProjectPage() {
  return (
    <AppShell>
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-balance text-3xl font-semibold">New product intake</h1>
          <p className="text-pretty text-sm text-muted-foreground">
            Start with the product context that future runs should freeze into
            immutable snapshots.
          </p>
        </div>
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Product brief</CardTitle>
            <CardDescription>
              Keep this concise. Sources can carry the deeper evidence.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createProjectAction}>
              <FieldGroup>
                <div className="grid gap-4 md:grid-cols-2">
                  <TextField name="productName" label="Product name" required />
                  <TextField name="category" label="Category" required />
                  <TextField name="market" label="Market" required />
                  <TextField name="expectedPrice" label="Expected price" required />
                  <TextField name="launchChannel" label="Launch channel" required />
                  <TextField name="competitors" label="Competitors" />
                </div>
                <Field>
                  <FieldLabel htmlFor="icp">ICP</FieldLabel>
                  <Textarea id="icp" name="icp" required rows={3} />
                  <FieldDescription>
                    The target buyer, user, company stage, or segment.
                  </FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="positioningStatement">
                    Positioning statement
                  </FieldLabel>
                  <Textarea id="positioningStatement" name="positioningStatement" required rows={4} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="notes">Optional notes</FieldLabel>
                  <Textarea id="notes" name="notes" rows={4} />
                </Field>
                <div className="flex items-center justify-end gap-3">
                  <Button asChild variant="outline">
                    <Link href="/">Cancel</Link>
                  </Button>
                  <Button type="submit">Create project</Button>
                </div>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function TextField({
  name,
  label,
  required,
}: {
  name: string;
  label: string;
  required?: boolean;
}) {
  return (
    <Field>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Input id={name} name={name} required={required} />
    </Field>
  );
}
