import { Hono } from 'hono';
import { z } from 'zod';
import { validator } from 'hono/validator';
import { v4 as uuidv4 } from 'uuid';
import { ChatRequest, ChatResponse, ModelIdentifier, Priority } from '../types/index.js';
import { callGemini } from '../services/gemini.js';
import { selectModel } from '../services/router.js';
import { generateHash, getCached, setCache } from '../services/cache.js';
import { calculateCost, calculateCachedCost, lamportsToUSDC } from '../lib/pricing.js';
import { paymentMiddleware } from '../middleware/payment.js';
import { db } from '../db/index.js';
import { payments } from '../db/schema.js';

const chatRouter = new Hono();
 

chatRouter.post(
  '/',
  async (c) => {
    const requestId = uuidv4();
    const body = await c.req.json() as ChatRequest;
    
    const { message, model: modelOverride, priority, stream } = body;

    if (stream) {
      return c.json({ 
        error: 'Streaming not yet implemented' 
      }, 501);
    }

    const routingDecision = selectModel(message, priority, modelOverride);
    const selectedModel = routingDecision.model;

    const requestHash = generateHash(selectedModel, message);
    const cached = getCached(requestHash);

    if (cached) {
      const cachedCost = calculateCachedCost(
        calculateCost(selectedModel, cached.tokens.prompt, cached.tokens.completion)
      );

      const response: ChatResponse = {
        content: cached.content,
        model: selectedModel,
        tokens: cached.tokens,
        cost: cachedCost,
        cached: true,
        requestId,
        timestamp: Date.now()
      };

      return c.json(response);
    }

    let llmResponse;
    
    try {
      if (selectedModel.startsWith('gemini-')) {
        llmResponse = await callGemini(message, selectedModel);
      } else {
        return c.json({ 
          error: 'Groq not implemented yet' 
        }, 501);
      }
    } catch (error: any) {
      return c.json({ 
        error: 'LLM service error',
        details: error.message 
      }, 500);
    }

    const cost = calculateCost(
      selectedModel,
      llmResponse.tokens.prompt,
      llmResponse.tokens.completion
    );

    setCache(requestHash, llmResponse);

    try {
      const walletAddress ='anonymous';
      const transactionHash = 'no-payment';

      await db.insert(payments).values({
        transactionHash,
        walletAddress,
        amount: cost.toString(),
        status: 'completed',
        modelUsed: selectedModel,
        tokensUsed: llmResponse.tokens.total,
        cacheHit: false
      });
    } catch (dbError: any) {
      console.error('Failed to log payment:', dbError);
    }

    const response: ChatResponse = {
      content: llmResponse.content,
      model: selectedModel,
      tokens: llmResponse.tokens,
      cost,
      cached: false,
      requestId,
      timestamp: Date.now()
    };

    return c.json(response);
  }
);

export default chatRouter;