import { Router } from 'express';
import { streamText, wrapLanguageModel, stepCountIs } from 'ai';
import { getModel, SUPPORTED_PROVIDERS, DEFAULT_PROVIDER } from './models.js';
import { chatTools } from './tools.js';
import { buildSystemPrompt } from './system-prompt.js';
import { loggingMiddleware } from './logging.js';

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

    // Wrap model with logging middleware
    const wrappedModel = wrapLanguageModel({
      model: llmModel,
      middleware: loggingMiddleware,
    });

    const systemPrompt = await buildSystemPrompt(recipe_id);

    const result = streamText({
      model: wrappedModel,
      system: systemPrompt,
      messages,
      tools: chatTools,
      stopWhen: stepCountIs(10),
      onStepFinish: ({ text, toolCalls, toolResults, finishReason, usage }) => {
        console.log('[chat:step]', JSON.stringify({
          finishReason,
          textLength: text?.length ?? 0,
          toolCalls: toolCalls?.map((tc) => tc.toolName),
          toolResults: toolResults?.map((tr) => ({
            toolName: tr.toolName,
            resultPreview: 'result' in tr ? JSON.stringify(tr.result).slice(0, 150) : '(no result)',
          })),
          usage: { input: usage.inputTokens, output: usage.outputTokens },
        }));
      },
      onFinish: ({ text, steps, usage, finishReason }) => {
        console.log('[chat:finish]', JSON.stringify({
          finishReason,
          totalSteps: steps.length,
          totalTextLength: text?.length ?? 0,
          usage: { input: usage.inputTokens, output: usage.outputTokens },
        }));
      },
    });

    result.pipeTextStreamToResponse(res);
  } catch (err) {
    console.error('[chat:error]', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});
