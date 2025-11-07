import crypto from 'crypto';
import { Message, ModelIdentifier, LLMServiceResponse } from '../types/index.js';

interface CacheEntry {
  response: LLMServiceResponse;
  cachedAt: number;
}

const cacheStore = new Map<string, CacheEntry>();

export function generateHash(model: ModelIdentifier, message: string): string {
  const normalized = {
    model,
    message: message.trim()
  };
  
  const str = JSON.stringify(normalized);
  return crypto.createHash('sha256').update(str).digest('hex');
}

export function getCached(hash: string): LLMServiceResponse | undefined {
  const entry = cacheStore.get(hash);
  if (!entry) return undefined;
  
  return entry.response;
}

export function setCache(hash: string, response: LLMServiceResponse): void {
  cacheStore.set(hash, {
    response,
    cachedAt: Date.now()
  });
}

export function getCacheStats() {
  return {
    size: cacheStore.size,
    keys: Array.from(cacheStore.keys())
  };
}