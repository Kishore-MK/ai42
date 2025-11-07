import { Hono } from 'hono';
import { config } from '../config/env.js'; 
import { v4 as uuidv4 } from 'uuid';
import { ChatRequest, ChatResponse, ModelIdentifier, Priority } from '../types/index.js';
import { callGemini } from '../services/gemini.js';
import { selectModel } from '../services/router.js';
import { generateHash, getCached, setCache } from '../services/cache.js';
import { calculateCost, calculateCachedCost, lamportsToUSDC } from '../lib/pricing.js';
import { paymentMiddleware, Network, Resource } from "x402-hono";
import { db } from '../db/index.js';
import { payments } from '../db/schema.js';
import { X402PaymentHandler } from 'x402-solana/server';
import { SolanaNetwork } from 'x402-solana/types';
import { getSignerAddress } from '../lib/helper.js';
 

const chatRouter = new Hono();

const x402 = new X402PaymentHandler({
  network: config.network as SolanaNetwork,
  treasuryAddress: config.address,
  facilitatorUrl: config.facilitatorUrl,
});

 
chatRouter.use(
    paymentMiddleware(
      config.address as `0x${string}`,
      {
        "/chat": {
          price: "$0.025",
          network: config.network as Network,
        },
      },
      {
        url: config.facilitatorUrl as Resource,
      },
    ),
  );


   
chatRouter.post(
  '/',
  async (c) => {
    const requestId = uuidv4();
    const body = await c.req.json() as ChatRequest; 
    const paymentHeader = x402.extractPayment(c.req.header()) 
    const walletAddress = await getSignerAddress(paymentHeader || "");
    
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
      console.log('Saving payment:', { 
        walletAddress,
        amount: cost.toString(),
        status: 'completed',
        modelUsed: selectedModel,
        tokensUsed: llmResponse.tokens.total,
        cacheHit: false
      });
      await db.insert(payments).values({ 
        walletAddress ,
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