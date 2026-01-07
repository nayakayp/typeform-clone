import { getAICompletion } from "./openai";
import { RESPONSE_ANALYSIS_SYSTEM_PROMPT, CATEGORIZATION_SYSTEM_PROMPT } from "./prompts";

export interface ResponseAnalysis {
  summary: string;
  keyThemes: string[];
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  insights: string[];
  recommendations: string[];
}

export interface AnalysisInput {
  formTitle: string;
  questions: Array<{
    id: string;
    title: string;
    type: string;
  }>;
  responses: Array<{
    questionId: string;
    value: string | number | string[];
  }>[];
}

export async function analyzeResponses(input: AnalysisInput): Promise<ResponseAnalysis> {
  // Organize responses by question
  const responsesByQuestion: Record<string, Array<string | number | string[]>> = {};

  for (const response of input.responses) {
    for (const answer of response) {
      if (!responsesByQuestion[answer.questionId]) {
        responsesByQuestion[answer.questionId] = [];
      }
      responsesByQuestion[answer.questionId].push(answer.value);
    }
  }

  const formattedResponses = input.questions.map(q => ({
    question: q.title,
    type: q.type,
    responses: responsesByQuestion[q.id] || [],
    responseCount: (responsesByQuestion[q.id] || []).length,
  }));

  const prompt = `Analyze these form responses:

Form: ${input.formTitle}
Total Responses: ${input.responses.length}

Questions and Responses:
${JSON.stringify(formattedResponses, null, 2)}

Provide a comprehensive analysis including:
1. Overall summary of findings
2. Key themes or patterns (as an array of strings)
3. Sentiment breakdown (positive, neutral, negative percentages that sum to 100)
4. Key insights (as an array of strings)
5. Recommendations for action (as an array of strings)

Respond with JSON in this format:
{
  "summary": "Overall summary...",
  "keyThemes": ["theme1", "theme2", ...],
  "sentimentBreakdown": {
    "positive": 40,
    "neutral": 35,
    "negative": 25
  },
  "insights": ["insight1", "insight2", ...],
  "recommendations": ["recommendation1", "recommendation2", ...]
}`;

  const result = await getAICompletion<ResponseAnalysis>(
    prompt,
    RESPONSE_ANALYSIS_SYSTEM_PROMPT
  );

  if (!result.success || !result.data) {
    throw new Error(result.error || "Failed to analyze responses");
  }

  return result.data;
}

export interface CategoryResult {
  category: string;
  confidence: number;
}

export async function categorizeResponse(
  text: string,
  categories: string[]
): Promise<CategoryResult> {
  const prompt = `Categorize this response into one of these categories: ${categories.join(", ")}

Response: "${text}"

Respond with JSON in this format:
{
  "category": "selected_category",
  "confidence": 0.85
}

The confidence should be a number between 0 and 1 indicating how confident you are in the categorization.`;

  const result = await getAICompletion<CategoryResult>(
    prompt,
    CATEGORIZATION_SYSTEM_PROMPT
  );

  if (!result.success || !result.data) {
    throw new Error(result.error || "Failed to categorize response");
  }

  return result.data;
}

export interface SentimentResult {
  sentiment: "positive" | "neutral" | "negative";
  score: number;
  explanation: string;
}

export async function analyzeSentiment(text: string): Promise<SentimentResult> {
  const prompt = `Analyze the sentiment of this response:

"${text}"

Respond with JSON in this format:
{
  "sentiment": "positive" | "neutral" | "negative",
  "score": 0.0 to 1.0 (where 0 is very negative and 1 is very positive),
  "explanation": "Brief explanation of the sentiment"
}`;

  const result = await getAICompletion<SentimentResult>(prompt);

  if (!result.success || !result.data) {
    throw new Error(result.error || "Failed to analyze sentiment");
  }

  return result.data;
}
