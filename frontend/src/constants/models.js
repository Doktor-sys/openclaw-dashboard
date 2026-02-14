export const AVAILABLE_MODELS = [
  { id: 'minimax-m2.1-free', name: 'Minimax M2.1 Free', provider: 'Minimax', icon: '🟣' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', icon: '🟢' },
  { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI', icon: '🟢' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI', icon: '🟢' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI', icon: '🟢' },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', icon: '🟠' },
  { id: 'claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic', icon: '🟠' },
  { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'Anthropic', icon: '🟠' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google', icon: '🔵' },
  { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google', icon: '🔵' },
  { id: 'llama-3.1-70b', name: 'Llama 3.1 70B', provider: 'Meta', icon: '🟡' },
  { id: 'llama-3.1-8b', name: 'Llama 3.1 8B', provider: 'Meta', icon: '🟡' },
  { id: 'mistral-large', name: 'Mistral Large', provider: 'Mistral AI', icon: '🔴' },
  { id: 'mistral-small', name: 'Mistral Small', provider: 'Mistral AI', icon: '🔴' }
];

export const DEFAULT_AGENTS = [
  { id: '0', name: 'OpenClaw Bot', type: 'general', model: 'minimax-m2.1-free', status: 'online', tasks_completed: 999, description: 'Haupt-Bot für OpenClaw' },
  { id: '1', name: 'Code Agent', type: 'coding', model: 'minimax-m2.1-free', status: 'online', tasks_completed: 42, description: 'Spezialisiert auf Code-Generierung und Refactoring' },
  { id: '2', name: 'Research Agent', type: 'research', model: 'gpt-4', status: 'idle', tasks_completed: 28, description: 'Recherchiert und analysiert Informationen' },
  { id: '3', name: 'Analysis Agent', type: 'analysis', model: 'claude-3-sonnet', status: 'online', tasks_completed: 15, description: 'Analysiert Daten und erstellt Berichte' },
  { id: '4', name: 'Writing Agent', type: 'general', model: 'gpt-3.5-turbo', status: 'offline', tasks_completed: 8, description: 'Erstellt Texte und Dokumentationen' },
  { id: '5', name: 'Data Agent', type: 'analysis', model: 'gemini-pro', status: 'idle', tasks_completed: 23, description: 'Verarbeitet und visualisiert Daten' },
  { id: '6', name: 'Code Reviewer', type: 'coding', model: 'claude-3-5-sonnet', status: 'online', tasks_completed: 67, description: 'Reviewt und optimiert Code' }
];
