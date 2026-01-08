import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { forms } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";
import { FormResponses } from "@/components/responses/FormResponses";

interface FormResponsesPageProps {
  params: Promise<{ formId: string }>;
}

export default async function FormResponsesPage({
  params,
}: FormResponsesPageProps) {
  const { formId } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    notFound();
  }

  const form = await db.query.forms.findFirst({
    where: eq(forms.id, formId),
  });

  if (!form) {
    notFound();
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" className="mb-4 -ml-2 gap-2" asChild>
          <Link href={`/forms/${form.id}/edit`}>
            <ArrowLeft className="h-4 w-4" />
            Back to Editor
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">{form.title}</h1>
        <p className="text-muted-foreground">View and manage responses</p>
      </div>
      <FormResponses formId={form.id} />
    </div>
  );
}
