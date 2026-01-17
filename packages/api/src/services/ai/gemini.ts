import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export const gemini = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
});

export async function generateWithGemini(prompt: string): Promise<string> {
  const result = await gemini.generateContent(prompt);
  const response = result.response;
  return response.text();
}
