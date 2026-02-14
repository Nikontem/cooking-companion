import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';

const providers: Record<string, (modelId: string) => ReturnType<typeof anthropic>> = {
  anthropic,
  openai,
};

const DEFAULT_MODELS: Record<string, string> = {
  anthropic: 'claude-sonnet-4-5-20250929',
  openai: 'gpt-4o',
};

export function getModel(provider = 'anthropic', modelId?: string) {
  const factory = providers[provider];
  if (!factory) {
    throw new Error(`Unknown provider: "${provider}". Supported: ${Object.keys(providers).join(', ')}`);
  }
  return factory(modelId || DEFAULT_MODELS[provider] || '');
}

export const SUPPORTED_PROVIDERS = Object.keys(providers);
export const DEFAULT_PROVIDER = 'anthropic';
