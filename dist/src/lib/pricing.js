const MODEL_PRICING = {
    'llama-3.3-70b-versatile': {
        promptCostPer1M: 0.59,
        completionCostPer1M: 0.79
    },
    'openai/gpt-oss-120b': {
        promptCostPer1M: 0.05,
        completionCostPer1M: 0.08
    },
    'gemini-2.5-flash': {
        promptCostPer1M: 0.075,
        completionCostPer1M: 0.30
    },
    'gemini-2.5-pro': {
        promptCostPer1M: 1.25,
        completionCostPer1M: 5.00
    }
};
const GATEWAY_FEE_MULTIPLIER = 1.15;
const LAMPORTS_PER_USDC = 1_000_000;
export function calculateCost(model, promptTokens, completionTokens) {
    const pricing = MODEL_PRICING[model];
    if (!pricing) {
        throw new Error(`No pricing defined for model: ${model}`);
    }
    const promptCost = (promptTokens / 1_000_000) * pricing.promptCostPer1M;
    const completionCost = (completionTokens / 1_000_000) * pricing.completionCostPer1M;
    const baseCost = promptCost + completionCost;
    const costWithFee = baseCost * GATEWAY_FEE_MULTIPLIER;
    const costInLamports = Math.ceil(costWithFee * LAMPORTS_PER_USDC);
    return costInLamports;
}
export function calculateCachedCost(originalCost) {
    return Math.ceil(originalCost * 0.2);
}
export function estimateCost(model, estimatedPromptTokens, estimatedCompletionTokens = 500) {
    return calculateCost(model, estimatedPromptTokens, estimatedCompletionTokens);
}
export function lamportsToUSDC(lamports) {
    return (lamports / LAMPORTS_PER_USDC).toFixed(6);
}
