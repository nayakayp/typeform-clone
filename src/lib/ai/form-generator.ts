import { getAICompletion } from "./openai";
import { FORM_GENERATOR_SYSTEM_PROMPT, QUESTION_SUGGESTIONS_SYSTEM_PROMPT } from "./prompts";

export interface GeneratedQuestion {
  type: string;
  title: string;
  description?: string;
  required: boolean;
  options?: Array<{ value: string }>;
}

export interface GeneratedForm {
  title: string;
  description: string;
  questions: GeneratedQuestion[];
}

export interface FormGeneratorInput {
  description: string;
  purpose?: "survey" | "feedback" | "registration" | "quiz" | "contact" | "other";
  targetAudience?: string;
  questionCount?: number;
  tone?: "professional" | "friendly" | "casual";
}

export async function generateForm(input: FormGeneratorInput): Promise<GeneratedForm> {
  const prompt = `Generate a form based on the following requirements:

Description: ${input.description}
${input.purpose ? `Purpose: ${input.purpose}` : ""}
${input.targetAudience ? `Target audience: ${input.targetAudience}` : ""}
${input.questionCount ? `Number of questions: approximately ${input.questionCount}` : "Number of questions: appropriate for the purpose"}
${input.tone ? `Tone: ${input.tone}` : "Tone: professional"}

Create a complete form with:
- A clear, engaging title
- A brief description
- Well-designed questions with appropriate types

Respond with JSON in this format:
{
  "title": "Form title",
  "description": "Form description",
  "questions": [
    {
      "type": "question_type",
      "title": "Question text",
      "description": "Optional help text",
      "required": true/false,
      "options": [{"value": "option1"}, {"value": "option2"}] // only for choice questions
    }
  ]
}`;

  const result = await getAICompletion<GeneratedForm>(
    prompt,
    FORM_GENERATOR_SYSTEM_PROMPT
  );

  if (!result.success || !result.data) {
    throw new Error(result.error || "Failed to generate form");
  }

  return result.data;
}

export interface SuggestedQuestion extends GeneratedQuestion {
  reason: string;
}

export interface QuestionSuggestionInput {
  formTitle: string;
  formDescription?: string;
  existingQuestions: Array<{ title: string; type: string }>;
  formPurpose?: string;
}

export async function suggestQuestions(
  input: QuestionSuggestionInput
): Promise<SuggestedQuestion[]> {
  const prompt = `Analyze this form and suggest additional questions:

Form Title: ${input.formTitle}
${input.formDescription ? `Form Description: ${input.formDescription}` : ""}
${input.formPurpose ? `Form Purpose: ${input.formPurpose}` : ""}

Existing Questions:
${input.existingQuestions.map((q, i) => `${i + 1}. ${q.title} (${q.type})`).join("\n")}

Suggest 3-5 additional questions that would:
- Complement the existing questions
- Fill gaps in information collection
- Add value to the form

Respond with JSON in this format:
{
  "suggestions": [
    {
      "type": "question_type",
      "title": "Question text",
      "description": "Optional help text",
      "required": true/false,
      "options": [{"value": "option1"}], // only for choice questions
      "reason": "Why this question is suggested"
    }
  ]
}`;

  const result = await getAICompletion<{ suggestions: SuggestedQuestion[] }>(
    prompt,
    QUESTION_SUGGESTIONS_SYSTEM_PROMPT
  );

  if (!result.success || !result.data) {
    throw new Error(result.error || "Failed to generate suggestions");
  }

  return result.data.suggestions;
}
