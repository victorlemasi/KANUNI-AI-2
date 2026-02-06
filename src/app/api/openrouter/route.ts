import { NextRequest, NextResponse } from 'next/server';
import { createChatCompletion, generateText, analyzeProcurementDocument } from '@/lib/openrouter';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'chat':
        const chatResponse = await createChatCompletion(params);
        return NextResponse.json({ success: true, data: chatResponse });

      case 'generate':
        const textResponse = await generateText(params.prompt, params.model);
        return NextResponse.json({ success: true, data: { text: textResponse } });

      case 'analyze':
        const analysisResponse = await analyzeProcurementDocument(params.content);
        return NextResponse.json({ success: true, data: { analysis: analysisResponse } });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('OpenRouter API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'OpenRouter API is available',
    endpoints: {
      chat: 'POST - Create chat completion',
      generate: 'POST - Generate text from prompt',
      analyze: 'POST - Analyze procurement document'
    }
  });
}
