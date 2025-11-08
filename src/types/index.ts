// ============================================
// Message Types  
// ============================================

export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  role: MessageRole;
  content: string;
}

// ============================================
// Model Types
// ============================================

export type ModelIdentifier = 
  | 'llama-3.3-70b-versatile'
  | 'openai/gpt-oss-120b'
  | 'gemini-2.5-flash' 
  | 'gemini-2.5-pro';

export type ModelProvider = 'groq' | 'gemini';

// ============================================
// Priority Types
// ============================================

export type Priority = 'fast' | 'quality' | 'cheap';

// ============================================
// Request Types
// ============================================

export interface ChatRequest {
  message: string;
  model?: ModelIdentifier; 
  priority?: Priority; 
  stream?: boolean; 
}

// ============================================
// Response Types
// ============================================

export interface ChatResponse {
  content: string;
  model: ModelIdentifier;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  cost: number;  
  cached: boolean;
  requestId: string;
  timestamp: number;
}

export interface StreamChunk {
  content: string;
  done: boolean;
  requestId: string;
}

// ============================================
// Service Response (Internal)
// ============================================

export interface LLMServiceResponse {
  content: string;
  tokens: {
    prompt: number ;
    completion: number;
    total: number;
  };
  model: ModelIdentifier;
}

// ============================================
// Cache Types
// ============================================

export interface CacheEntry {
  requestHash: string;
  model: ModelIdentifier;
  response: string;
  tokens: number;
  createdAt: Date;
  expiresAt: Date;
}

// ============================================
// Payment Types
// ============================================

// ============================================
// Payment Types
// ============================================

export interface PaymentRecord {
  id: string;
  transactionHash: string;
  walletAddress: string;
  amount: string;  
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
  modelUsed: ModelIdentifier;
  tokensUsed: number;
  cacheHit: boolean;
}

export interface PaymentVerification {
  transactionHash: string;
  walletAddress: string;
  amount: number;
  verified: boolean;
}

export interface PaymentRequest {
  amount: number;
  recipient: string;
  memo?: string;
}

// ============================================
// Router Types
// ============================================

export interface RoutingDecision {
  model: ModelIdentifier;
  provider: ModelProvider;
  reason: string; // Why this model was selected
}

// ============================================
// Error Types
// ============================================

export interface APIError {
  code: string;
  message: string;
  details?: any;
}

export type ErrorCode = 
  | 'INVALID_REQUEST'
  | 'PAYMENT_REQUIRED'
  | 'PAYMENT_FAILED'
  | 'MODEL_ERROR'
  | 'RATE_LIMIT'
  | 'INTERNAL_ERROR';