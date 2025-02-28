import { AIModel } from '../types';

export const AI_MODELS: AIModel[] = [
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai' },
  { id: 'o1-mini', name: 'o1 Mini', provider: 'openai' },
  { id: 'o3-mini', name: 'o3 Mini', provider: 'openai' },
  { id: 'gpt-4-turbo-preview', name: 'GPT-4 Turbo', provider: 'openai' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'gemini'},
  { id: 'gemini-pro', name: 'Gemini Pro', provider: 'gemini' },
  { id: 'xai-1.0', name: 'xAI 1.0', provider: 'xai' },
  { id: 'deepseek-coder', name: 'DeepSeek Coder', provider: 'deepseek' },
];