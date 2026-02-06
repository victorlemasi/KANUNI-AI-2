'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, Brain, FileText, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { analyzeDocumentAction } from '@/app/actions/analyze-document';

const AVAILABLE_MODELS = [
  { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', description: 'Fast and cost-effective (Recommended)' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast and affordable' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Best for complex analysis' },
  { id: 'openai/gpt-4o', name: 'GPT-4o', description: 'Balanced performance' },
  { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', description: 'Google\'s latest model' },
  { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', description: 'Open source powerhouse' },
];

export default function OpenRouterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [selectedModel, setSelectedModel] = useState('anthropic/claude-3-haiku');
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('provider', 'openrouter');
      formData.append('model', selectedModel);

      const result = await analyzeDocumentAction(formData);

      if (result.success) {
        setAnalysis(result.analysis);
      } else {
        setError(result.error || 'Analysis failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getModelInfo = (modelId: string) => {
    return AVAILABLE_MODELS.find(m => m.id === modelId) || AVAILABLE_MODELS[0];
  };

  const modelInfo = getModelInfo(selectedModel);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Brain className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">OpenRouter AI Analysis</h1>
        </div>
        <p className="text-muted-foreground">
          Advanced procurement document analysis using multiple AI models
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Document Upload
            </CardTitle>
            <CardDescription>
              Upload your procurement document for AI analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Model Selection */}
            <div className="space-y-2">
              <Label htmlFor="model">AI Model</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_MODELS.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div>
                        <div className="font-medium">{model.name}</div>
                        <div className="text-sm text-muted-foreground">{model.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {modelInfo && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Zap className="h-4 w-4" />
                  {modelInfo.description}
                </div>
              )}
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file">Document</Label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  id="file"
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                {file ? (
                  <div className="space-y-2">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('file')?.click()}
                    >
                      Change File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p>Drag and drop your document here, or</p>
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('file')?.click()}
                    >
                      Browse Files
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Supports PDF, DOCX, and TXT files
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Analyze Button */}
            <Button
              onClick={handleAnalyze}
              disabled={!file || loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing with {modelInfo.name}...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Analyze Document
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Analysis Results
            </CardTitle>
            <CardDescription>
              AI-powered procurement compliance analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Analyzing document...</span>
              </div>
            )}

            {analysis && !loading && (
              <div className="space-y-4">
                {/* Metadata */}
                <div className="space-y-2">
                  <h4 className="font-semibold">Document Information</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Title:</span>
                      <p className="text-muted-foreground">{analysis.extractedMetadata?.title || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Method:</span>
                      <p className="text-muted-foreground">{analysis.extractedMetadata?.method || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Value:</span>
                      <p className="text-muted-foreground">
                        {analysis.extractedMetadata?.value ? 
                          `${analysis.extractedMetadata.value} ${analysis.extractedMetadata.currency || 'USD'}` : 
                          'N/A'
                        }
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Compliance Score:</span>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${analysis.overall_compliance_score || 0}%` }}
                          />
                        </div>
                        <span className="text-sm">{analysis.overall_compliance_score || 0}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Compliance Status */}
                <div className="space-y-2">
                  <h4 className="font-semibold">Compliance Status</h4>
                  <Badge variant={analysis.isCompliant ? "default" : "destructive"}>
                    {analysis.isCompliant ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Compliant
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Non-Compliant
                      </>
                    )}
                  </Badge>
                </div>

                {/* Summary */}
                {analysis.summary && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Summary</h4>
                    <p className="text-sm text-muted-foreground">{analysis.summary}</p>
                  </div>
                )}

                {/* Checks */}
                {analysis.checks && analysis.checks.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Compliance Checks</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {analysis.checks.map((check: any, index: number) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant={
                              check.status === 'Pass' ? 'default' : 
                              check.status === 'Warning' ? 'secondary' : 'destructive'
                            }>
                              {check.status}
                            </Badge>
                            <Badge variant="outline">{check.category}</Badge>
                          </div>
                          <p className="text-sm font-medium">{check.rule}</p>
                          <p className="text-xs text-muted-foreground mt-1">{check.finding}</p>
                          {check.recommendation && (
                            <p className="text-xs text-blue-600 mt-1">
                              <strong>Recommendation:</strong> {check.recommendation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!analysis && !loading && !error && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Upload a document to see analysis results</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
