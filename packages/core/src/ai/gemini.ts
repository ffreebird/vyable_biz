export interface GeminiConfig {
  apiKey: string;
  model?: string;
  baseUrl?: string;
}

export interface GeminiResponse {
  candidates: {
    content: {
      role: string;
      parts: { text: string }[];
    };
    finishReason: string;
  }[];
}

const DEFAULT_MODEL = 'gemini-3-flash-preview';
const DEFAULT_BASE_URL = 'https://aiplatform.googleapis.com/v1/publishers/google/models';

export function createGeminiClient(config: GeminiConfig) {
  const { apiKey, model = DEFAULT_MODEL, baseUrl = DEFAULT_BASE_URL } = config;

  return {
    async generate(prompt: string): Promise<string> {
      const response = await fetch(`${baseUrl}/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${error}`);
      }

      const data = (await response.json()) as GeminiResponse;
      return data.candidates[0]?.content?.parts[0]?.text || '';
    },
  };
}

// Default client using environment variables
export async function generateWithGemini(prompt: string): Promise<string> {
  const client = createGeminiClient({
    apiKey: process.env.GOOGLE_AI_API_KEY || '',
  });
  return client.generate(prompt);
}
