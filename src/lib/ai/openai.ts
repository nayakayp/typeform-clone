import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Generic AI completion function
export async function getAICompletion<T>(
  prompt: string,
  systemPrompt?: string
): Promise<AIResponse<T>> {
  try {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }

    messages.push({ role: "user", content: prompt });

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages,
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return { success: false, error: "No response from AI" };
    }

    const data = JSON.parse(content) as T;
    return { success: true, data };
  } catch (error) {
    console.error("AI completion error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "AI request failed",
    };
  }
}

// Get text completion without JSON parsing
export async function getTextCompletion(
  prompt: string,
  systemPrompt?: string
): Promise<AIResponse<string>> {
  try {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }

    messages.push({ role: "user", content: prompt });

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return { success: false, error: "No response from AI" };
    }

    return { success: true, data: content };
  } catch (error) {
    console.error("AI completion error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "AI request failed",
    };
  }
}

export { openai };
