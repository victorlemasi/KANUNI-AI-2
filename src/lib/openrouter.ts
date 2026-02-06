import OpenAI from 'openai';

const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  dangerouslyAllowBrowser: false,
});

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export const DEFAULT_MODEL = 'anthropic/claude-3.5-sonnet';

export async function createChatCompletion(options: ChatCompletionOptions) {
  try {
    const response = await openrouter.chat.completions.create({
      model: options.model || DEFAULT_MODEL,
      messages: options.messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 1000,
      stream: options.stream || false,
    });

    return response;
  } catch (error) {
    console.error('OpenRouter API Error:', error);
    throw error;
  }
}

export async function generateText(prompt: string, model?: string) {
  const messages: ChatMessage[] = [
    { role: 'user', content: prompt }
  ];

  const response = await createChatCompletion({
    model,
    messages,
    temperature: 0.7,
    max_tokens: 2000,
    stream: false,
  });

  // Handle both streaming and non-streaming responses
  if ('choices' in response) {
    return response.choices[0]?.message?.content || '';
  } else {
    // Handle streaming response (shouldn't happen with stream: false, but just in case)
    return '';
  }
}

export async function analyzeProcurementDocument(content: string) {
  const systemPrompt = `You are a procurement analysis expert. Analyze the following procurement document content and provide:
1. Key procurement items and quantities
2. Supplier information
3. Cost analysis
4. Risk assessment
5. Compliance checks
6. Recommendations

Provide a structured analysis in JSON format.`;

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: content }
  ];

  const response = await createChatCompletion({
    model: 'anthropic/claude-3.5-sonnet',
    messages,
    temperature: 0.3,
    max_tokens: 3000,
    stream: false,
  });

  // Handle both streaming and non-streaming responses
  if ('choices' in response) {
    return response.choices[0]?.message?.content || '';
  } else {
    // Handle streaming response (shouldn't happen with stream: false, but just in case)
    return '';
  }
}

export const AVAILABLE_MODELS = [
  'anthropic/claude-3.5-sonnet',
  'anthropic/claude-3-haiku',
  'openai/gpt-4o',
  'openai/gpt-4o-mini',
  'google/gemini-pro-1.5',
  'meta-llama/llama-3.1-70b-instruct',
];
