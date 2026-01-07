import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { questions, questionOptions } from "@/lib/db/schema";
import { eq, and, asc, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { BuilderQuestion } from "@/types/builder";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const { formId } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { questions: builderQuestions } = body as {
      questions: BuilderQuestion[];
    };

    // Get existing questions for this form
    const existingQuestions = await db.query.questions.findMany({
      where: eq(questions.formId, formId),
    });

    const existingIds = new Set(existingQuestions.map((q) => q.id));
    const incomingIds = new Set(builderQuestions.map((q) => q.id));

    // Find questions to delete (exist in DB but not in incoming)
    const idsToDelete = [...existingIds].filter((id) => !incomingIds.has(id));

    // Perform deletions
    if (idsToDelete.length > 0) {
      await db
        .delete(questions)
        .where(
          and(eq(questions.formId, formId), inArray(questions.id, idsToDelete))
        );
    }

    // Upsert all incoming questions
    for (const question of builderQuestions) {
      await db
        .insert(questions)
        .values({
          id: question.id,
          formId,
          type: question.type,
          title: question.title,
          description: question.description,
          placeholder: question.placeholder,
          order: question.order,
          groupId: question.groupId,
          required: question.required,
          validations: question.validations,
          settings: question.settings,
          image: question.image,
          video: question.video,
          logicJump: question.logicJump,
        })
        .onConflictDoUpdate({
          target: questions.id,
          set: {
            type: question.type,
            title: question.title,
            description: question.description,
            placeholder: question.placeholder,
            order: question.order,
            groupId: question.groupId,
            required: question.required,
            validations: question.validations,
            settings: question.settings,
            image: question.image,
            video: question.video,
            logicJump: question.logicJump,
            updatedAt: new Date(),
          },
        });

      // Update options - delete existing and insert new
      if (question.options !== undefined) {
        await db
          .delete(questionOptions)
          .where(eq(questionOptions.questionId, question.id));

        if (question.options.length > 0) {
          await db.insert(questionOptions).values(
            question.options.map((opt, index) => ({
              id: opt.id || crypto.randomUUID(),
              questionId: question.id,
              label: opt.label,
              value: opt.value,
              image: opt.image,
              order: index,
            }))
          );
        }
      }
    }

    // Fetch and return updated questions
    const updatedQuestions = await db.query.questions.findMany({
      where: eq(questions.formId, formId),
      orderBy: [asc(questions.order)],
      with: {
        options: {
          orderBy: [asc(questionOptions.order)],
        },
      },
    });

    return NextResponse.json({ questions: updatedQuestions });
  } catch (error) {
    console.error("Error saving questions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
