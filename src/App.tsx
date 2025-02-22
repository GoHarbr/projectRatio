import React, { useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { pdfjs } from 'react-pdf';
import { AIProvider, AnalysisResult } from './types';
import { AI_MODELS } from './config/aiModels';
import { analyzeReport } from './services/aiService';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [provider, setProvider] = useState<AIProvider>('openai');
  const [modelId, setModelId] = useState('o1-mini');
  const [apiKey, setApiKey] = useState('');
  const [questions, setQuestions] = useState({
    concentration: true,
  });
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProviderChange = (newProvider: AIProvider) => {
    setProvider(newProvider);
    // Set the first available model for the new provider
    const availableModels = AI_MODELS.filter(model => model.provider === newProvider);
    if (availableModels.length > 0) {
      setModelId(availableModels[0].id);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setError(null);
    } else {
      setError('Please select a PDF file');
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !apiKey) {
      setError('Please select a file and provide an API key');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Convert PDF to text
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let pdfText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        pdfText += content.items.map((item: any) => item.str).join(' ');
      }

      // Prepare questions
      const promptQuestions = [];
      if (questions.concentration) {
        promptQuestions.push('Calculate all financial ratios that are possible from the provided data. Present the results as a table.');
      }

      const analysisResult = await analyzeReport(
        provider,
        modelId,
        apiKey,
        pdfText,
        promptQuestions
      );

      if (analysisResult.error) {
        setError(analysisResult.error);
      } else {
        setResult(analysisResult);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto">
        <img
          src="https://harbr.com/wp-content/uploads/2021/05/Harbr_black-on-light_small.png"
          width="100"
        />
        <br />
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-2 text-2xl font-bold text-gray-900">
              Balance Sheet Analysis
            </h2>
          </div>

          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Upload className="mr-2 h-5 w-5" />
              Upload PDF
            </label>
            {selectedFile && (
              <p className="mt-2 text-sm text-gray-600">{selectedFile.name}</p>
            )}
          </div>

          {/* AI Provider Selection */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                AI Provider
              </label>
              <select
                value={provider}
                onChange={(e) => handleProviderChange(e.target.value as AIProvider)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="openai">OpenAI</option>
                <option value="gemini">Google Gemini</option>
                <option value="xai">xAI</option>
                <option value="deepseek">DeepSeek</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Model
              </label>
              <select
                value={modelId}
                onChange={(e) => setModelId(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                {AI_MODELS
                  .filter((model) => model.provider === provider)
                  .map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Enter your API key"
              />
            </div>
          </div>

          {/* Analysis Options */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Analysis Options
            </label>
            <div className="space-y-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={questions.concentration}
                  onChange={(e) =>
                    setQuestions({ ...questions, concentration: e.target.checked })
                  }
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-600">Run All Ratios</span>
              </label>
            </div>
          </div>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={loading || !selectedFile || !apiKey}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
          >
            {loading ? 'Analyzing...' : 'Analyze Report'}
          </button>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {result && !error && (
            <div className="rounded-md bg-green-50 p-4">
              <h3 className="text-lg font-medium text-green-800 mb-2">Results</h3>
              {result.htmlContent && (
                <div className="mb-2">
                  <strong>Summary & Insights:</strong>
                  <p className="text-green-700" dangerouslySetInnerHTML={{ __html: result.htmlContent }} />
                  <br></br>
                </div>
              )}
              {result.concentration && (
                <div className="mb-2">
                  <strong>Concentration:</strong>
                  <p className="text-green-700">{result.concentration}</p>
                  <br></br>
                </div>
              )}
              {result.concentrationCategory && (
                <div>
                  <strong>Concentration Category:</strong>
                  <p className="text-green-700">{result.concentrationCategory}</p>
                  <br></br>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;