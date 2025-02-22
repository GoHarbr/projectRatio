import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider, AnalysisResult } from '../types';
import { marked } from 'marked';

export async function analyzeReport(
  provider: AIProvider,
  modelId: string,
  apiKey: string,
  pdfText: string,
  questions: string[]
): Promise<AnalysisResult> {
  //const prompt = `Analyze this A/R or A/P Aging Report and answer the following questions. Provide ONLY the direct answers without any introductory text or explanations:
  const prompt = `Analyze this balance sheet and answer the following questions. Provide concise explanations:

${questions.join('\n')}

Report content:
${pdfText}`;

  try {
    switch (provider) {
      case 'openai':
        const openai = new OpenAI({
          apiKey,
          dangerouslyAllowBrowser: true
        });
        const response = await openai.chat.completions.create({
          model: modelId,
          messages: [
            /*{
              role: 'system',
              content: 'You are a precise analyzer of financial reports. Provide direct answers without any introductory text or explanations.'
            },*/
            {
              role: 'user',
              content: 'You are a precise analyzer of financial reports. ' + prompt
            }
          ],
        });
        return parseResponse(response.choices[0]?.message?.content || '');

      case 'gemini':
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelId });
        const result = await model.generateContent(prompt, { temperature: 0.2 });
        return parseResponse(result.response.text());

      // Note: xAI and DeepSeek implementations would go here
      // Currently returning mock responses as these APIs aren't publicly available
      case 'xai':
      case 'deepseek':
        throw new Error(`${provider} integration is not yet available`);

      default:
        throw new Error('Unsupported AI provider');
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}

function parseResponse(text: string): AnalysisResult {
  const cleanText = text
    .replace(/^(Here'?s? (?:is )?(?:an? )?(?:analysis|answer|response|summary).*?\n)/i, '')
    .replace(/^(Based on.*?\n)/i, '')
    .replace(/^(After analyzing.*?\n)/i, '')
    .trim();

  // Convert Markdown to HTML (if needed)
  const htmlContent = marked(cleanText);

  return {
    htmlContent
  };
}