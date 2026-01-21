export interface ClaudeConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
}

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ClaudeResponse {
  content: Array<{ type: string; text?: string }>;
}

const DEFAULT_MODEL = 'claude-opus-4-5-20251101';
const DEFAULT_MAX_TOKENS = 8192;
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

export function createClaudeClient(config: ClaudeConfig) {
  const { apiKey, model = DEFAULT_MODEL, maxTokens = DEFAULT_MAX_TOKENS } = config;

  return {
    async generate(prompt: string): Promise<string> {
      const response = await fetch(ANTHROPIC_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Claude API error: ${response.status} - ${error}`);
      }

      const data = (await response.json()) as ClaudeResponse;
      const textBlock = data.content.find((block) => block.type === 'text');
      return textBlock?.text || '';
    },
  };
}

// Default client using environment variables
export async function generateWithClaude(prompt: string): Promise<string> {
  const client = createClaudeClient({
    apiKey: process.env.ANTHROPIC_API_KEY || '',
  });
  return client.generate(prompt);
}
