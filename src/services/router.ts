import { Message, ModelIdentifier, Priority, RoutingDecision } from '../types/index.js';

export function selectModel(
  message: string,
  priority?: Priority,
  modelOverride?: ModelIdentifier
): RoutingDecision {
  if (modelOverride) {
    return {
      model: modelOverride,
      provider: getProvider(modelOverride),
      reason: 'User specified model'
    };
  }
 
  const tokenCount = estimateTokens(message);
  const complexity = analyzeComplexity(message);

  if (priority === 'fast') {
    return {
      model: 'gemini-2.5-flash',
      provider: 'gemini',
      reason: 'Fast priority - using fastest model'
    };
  }

  if (priority === 'cheap') {
    return {
      model: 'gemini-2.5-flash',
      provider: 'gemini',
      reason: 'Cheap priority - using most cost-effective model'
    };
  }

  if (tokenCount < 100 && complexity === 'simple') {
    return {
      model: 'gemini-2.5-flash',
      provider: 'gemini',
      reason: 'Simple short query - using fast model'
    };
  }

  if (complexity === 'complex' || tokenCount > 500) {
    return {
      model: 'gemini-2.5-pro',
      provider: 'gemini',
      reason: 'Complex query requiring advanced model'
    };
  }

  return {
    model: 'gemini-2.5-flash',
    provider: 'gemini',
    reason: 'Default selection for balanced performance'
  };
}

function getProvider(model: ModelIdentifier): 'groq' | 'gemini' {
  if (model.startsWith('groq-')) return 'groq';
  if (model.startsWith('gemini-')) return 'gemini';
  throw new Error(`Unknown provider for model: ${model}`);
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function analyzeComplexity(text: string): 'simple' | 'medium' | 'complex' {
  const lowerText = text.toLowerCase();
  
  const complexKeywords = [
    'analyze', 'explain', 'compare', 'evaluate', 'detailed',
    'comprehensive', 'architecture', 'algorithm', 'implement'
  ];
  
  const hasComplexKeywords = complexKeywords.some(kw => lowerText.includes(kw));
  const wordCount = text.split(/\s+/).length;

  if (hasComplexKeywords || wordCount > 50) {
    return 'complex';
  }

  if (wordCount > 20) {
    return 'medium';
  }

  return 'simple';
}