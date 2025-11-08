import { generateText } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { config } from '../config/env.js';
const groq = createGroq({
    apiKey: config.groqApiKey
});
export async function callGroq(message, model) {
    try {
        const groqModel = getGroqModel(model);
        const { text, usage } = await generateText({
            model: groq(groqModel),
            prompt: message,
        });
        if (!usage) {
            throw new Error('No usage data from Groq');
        }
        return {
            content: text,
            tokens: {
                prompt: usage.inputTokens || 0,
                completion: usage.outputTokens || 0,
                total: usage.totalTokens || 0
            },
            model
        };
    }
    catch (error) {
        throw new Error(`Groq API Error: ${error.message}`);
    }
}
function getGroqModel(model) {
    switch (model) {
        case 'llama-3.3-70b-versatile':
            return 'llama-3.3-70b-versatile';
        case 'openai/gpt-oss-120b':
            return 'openai/gpt-oss-120b';
        default:
            throw new Error(`Unsupported Groq model: ${model}`);
    }
}
