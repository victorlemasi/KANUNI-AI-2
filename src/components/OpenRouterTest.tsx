'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, MessageSquare, FileText, Brain } from 'lucide-react';

const AVAILABLE_MODELS = [
  'anthropic/claude-3.5-sonnet',
  'anthropic/claude-3-haiku',
  'openai/gpt-4o',
  'openai/gpt-4o-mini',
  'google/gemini-pro-1.5',
  'meta-llama/llama-3.1-70b-instruct',
];

export default function OpenRouterTest() {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('anthropic/claude-3.5-sonnet');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'generate' | 'analyze'>('chat');

  const handleChat = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/openrouter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          model,
          messages: [
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResponse(data.data.choices[0].message.content);
      } else {
        setResponse(`Error: ${data.error}`);
      }
    } catch (error) {
      setResponse(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/openrouter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          prompt,
          model,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResponse(data.data.text);
      } else {
        setResponse(`Error: ${data.error}`);
      }
    } catch (error) {
      setResponse(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/openrouter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze',
          content: prompt,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResponse(data.data.analysis);
      } else {
        setResponse(`Error: ${data.error}`);
      }
    } catch (error) {
      setResponse(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    switch (activeTab) {
      case 'chat':
        handleChat();
        break;
      case 'generate':
        handleGenerate();
        break;
      case 'analyze':
        handleAnalyze();
        break;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            OpenRouter API Test
          </CardTitle>
          <CardDescription>
            Test your OpenRouter integration with different AI models
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tab Selection */}
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'chat' ? 'default' : 'outline'}
              onClick={() => setActiveTab('chat')}
              className="flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Chat
            </Button>
            <Button
              variant={activeTab === 'generate' ? 'default' : 'outline'}
              onClick={() => setActiveTab('generate')}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Generate
            </Button>
            <Button
              variant={activeTab === 'analyze' ? 'default' : 'outline'}
              onClick={() => setActiveTab('analyze')}
              className="flex items-center gap-2"
            >
              <Brain className="h-4 w-4" />
              Analyze
            </Button>
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger>
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_MODELS.map((modelOption) => (
                  <SelectItem key={modelOption} value={modelOption}>
                    {modelOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Input */}
          <div className="space-y-2">
            <Label htmlFor="prompt">
              {activeTab === 'analyze' ? 'Document Content' : 'Prompt'}
            </Label>
            <Textarea
              id="prompt"
              placeholder={
                activeTab === 'analyze'
                  ? 'Paste procurement document content here for analysis...'
                  : 'Enter your prompt here...'
              }
              value={prompt}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
              rows={6}
            />
          </div>

          {/* Submit Button */}
          <Button onClick={handleSubmit} disabled={loading || !prompt.trim()}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {activeTab === 'chat' && 'Send Chat'}
                {activeTab === 'generate' && 'Generate Text'}
                {activeTab === 'analyze' && 'Analyze Document'}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Response */}
      {response && (
        <Card>
          <CardHeader>
            <CardTitle>Response</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-md">
              {response}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
