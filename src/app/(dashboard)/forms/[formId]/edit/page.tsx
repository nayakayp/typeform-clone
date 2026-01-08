import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { forms, questions, questionOptions } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { BuilderLayout } from "@/components/builder/builder-layout";
import type { BuilderQuestion } from "@/types/builder";

interface FormEditPageProps {
  params: Promise<{ formId: string }>;
}

export default async function FormEditPage({ params }: FormEditPageProps) {
  const { formId } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    notFound();
  }

  const form = await db.query.forms.findFirst({
    where: eq(forms.id, formId),
    with: {
      questions: {
        orderBy: [asc(questions.order)],
        with: {
          options: {
            orderBy: [asc(questionOptions.order)],
          },
        },
      },
    },
  });

  if (!form) {
    notFound();
  }

  // Transform questions to BuilderQuestion format
  const builderQuestions: BuilderQuestion[] = form.questions.map((q) => ({
    ...q,
    options: q.options,
    isNew: false,
    isDeleted: false,
  }));

  return <BuilderLayout form={form} questions={builderQuestions} />;
}
