const API_KEY = process.env.GOOGLE_AI_API_KEY || '';
const BASE_URL = 'https://aiplatform.googleapis.com/v1/publishers/google/models';
const MODEL = 'gemini-3-flash-preview';

interface GeminiResponse {
  candidates: {
    content: {
      role: string;
      parts: { text: string }[];
    };
    finishReason: string;
  }[];
}

export async function generateWithGemini(prompt: string): Promise<string> {
  const response = await fetch(
    `${BASE_URL}/${MODEL}:generateContent?key=${API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${error}`);
  }

  const data = (await response.json()) as GeminiResponse;
  return data.candidates[0]?.content?.parts[0]?.text || '';
}
