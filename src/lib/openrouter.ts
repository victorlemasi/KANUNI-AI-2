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
  const systemPrompt = `You are a procurement analysis expert. Analyze the following procurement document and provide a JSON response with this structure:
{
  "extractedMetadata": {
    "title": "procurement title",
    "method": "procurement method",
    "value": 0,
    "currency": "KES"
  },
  "isCompliant": true,
  "overall_compliance_score": 85,
  "summary": "brief analysis summary",
  "checks": [
    {
      "category": "Regulatory",
      "rule": "specific rule",
      "status": "Pass",
      "finding": "what was found",
      "recommendation": "what to do"
    }
  ]
}

Focus on: key procurement items, supplier info, cost analysis, risk assessment, compliance checks, and recommendations. Keep response concise.`;

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: content.slice(0, 8000) } // Limit content to reduce tokens
  ];

  try {
    const response = await createChatCompletion({
      model: 'anthropic/claude-3-haiku', // Use cheaper model
      messages,
      temperature: 0.3,
      max_tokens: 1000, // Reduced from 3000
      stream: false,
    });

    // Handle both streaming and non-streaming responses
    if ('choices' in response) {
      return response.choices[0]?.message?.content || '';
    } else {
      // Handle streaming response (shouldn't happen with stream: false, but just in case)
      return '';
    }
  } catch (error: any) {
    // If quota exceeded, try with even more reduced settings
    if (error.message?.includes('credits') || error.message?.includes('tokens')) {
      console.log('OpenRouter quota exceeded, trying with reduced settings...');
      
      const fallbackResponse = await createChatCompletion({
        model: 'anthropic/claude-3-haiku',
        messages: [
          { role: 'system', content: 'Analyze this procurement document briefly. Provide title, method, value, compliance score (0-100), and 2-3 key findings in JSON format.' },
          { role: 'user', content: content.slice(0, 4000) } // Even smaller content
        ],
        temperature: 0.3,
        max_tokens: 500, // Very reduced
        stream: false,
      });

      if ('choices' in fallbackResponse) {
        return fallbackResponse.choices[0]?.message?.content || '';
      }
    }
    
    throw error;
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
