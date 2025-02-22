export type AIProvider = 'openai' | 'gemini' | 'xai' | 'deepseek';

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
}

export interface AnalysisResult {
  concentration?: string;
  error?: string;
}