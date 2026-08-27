export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  conversationId: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface AISettings {
  apiKey: string;
  baseUrl: string;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  providerPreset?: string;
}

export interface ProviderPreset {
  id: string;
  name: string;
  baseUrl: string;
  defaultModel: string;
  requiresApiKey: boolean;
  popularModels: string[];
}

export const PROVIDER_PRESETS: ProviderPreset[] = [
  {
    id: 'omniroute_local',
    name: 'OmniRoute (Local Gateway)',
    baseUrl: 'http://localhost:20128/v1',
    defaultModel: 'omniroute/auto',
    requiresApiKey: false,
    popularModels: [
      'omniroute/auto',
      'omniroute/free',
      'claude-3-7-sonnet',
      'gpt-4o',
      'deepseek-r1',
      'qwen-2.5-coder-32b',
    ],
  },
  {
    id: 'omniroute_cloud',
    name: 'OmniRoute (Cloud Router)',
    baseUrl: 'https://api.omniroute.online/v1',
    defaultModel: 'omniroute/auto',
    requiresApiKey: true,
    popularModels: [
      'omniroute/auto',
      'omniroute/free',
      'claude-3-7-sonnet',
      'gpt-4o',
      'deepseek-r1',
    ],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    requiresApiKey: true,
    popularModels: ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'o3-mini'],
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'auto',
    requiresApiKey: true,
    popularModels: [
      'auto',
      'anthropic/claude-3.5-sonnet',
      'deepseek/deepseek-chat',
      'google/gemini-2.5-flash',
    ],
  },
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    baseUrl: 'http://localhost:11434/v1',
    defaultModel: 'qwen2.5-coder',
    requiresApiKey: false,
    popularModels: ['qwen2.5-coder', 'llama3.3', 'deepseek-r1', 'codellama'],
  },
];

export const DEFAULT_AI_SETTINGS: AISettings = {
  apiKey: '',
  baseUrl: 'http://localhost:20128/v1',
  model: 'omniroute/auto',
  temperature: 0.7,
  maxTokens: 4096,
  systemPrompt: 'You are a coding assistant. The user is working in a code editor. Provide helpful, concise, and accurate coding assistance.',
  providerPreset: 'omniroute_local',
};