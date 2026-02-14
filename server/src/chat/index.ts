import { Router } from 'express';
import { streamText, stepCountIs } from 'ai';
import { getModel, SUPPORTED_PROVIDERS, DEFAULT_PROVIDER } from './models.js';
import { chatTools } from './tools.js';
import { buildSystemPrompt } from './system-prompt.js';

export const chatRouter = Router();

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  provider?: string;
  model?: string;
  recipe_id?: string;
}

chatRouter.post('/', async (req, res) => {
  try {
    const { messages, provider, model: modelId, recipe_id } = req.body as ChatRequest;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'messages array is required and must not be empty' });
      return;
    }

    const resolvedProvider = provider || DEFAULT_PROVIDER;

    // Check for API key
    const keyEnvVars: Record<string, string> = {
      anthropic: 'ANTHROPIC_API_KEY',
      openai: 'OPENAI_API_KEY',
    };
    const requiredKey = keyEnvVars[resolvedProvider];
    if (requiredKey && !process.env[requiredKey]) {
      res.status(500).json({
        error: `${requiredKey} environment variable is not set. Set it to use the ${resolvedProvider} provider.`,
      });
      return;
    }

    let llmModel;
    try {
      llmModel = getModel(resolvedProvider, modelId);
    } catch (err) {
      res.status(400).json({
        error: (err as Error).message,
        supported_providers: SUPPORTED_PROVIDERS,
      });
      return;
    }

    const systemPrompt = await buildSystemPrompt(recipe_id);

    const result = streamText({
      model: llmModel,
      system: systemPrompt,
      messages,
      tools: chatTools,
      stopWhen: stepCountIs(5),
    });

    result.pipeTextStreamToResponse(res);
  } catch (err) {
    console.error('Chat error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});
