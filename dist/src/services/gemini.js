import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import 'dotenv/config';
import { config } from '../config/env.js'; // if you’re exporting your parsed env vars
// Create a Gemini client using your API key
const google = createGoogleGenerativeAI({
    apiKey: config.geminiApiKey,
});
export async function callGemini(message, model) {
    try {
        const geminiModel = getGeminiModel(model);
        // Use the provider explicitly
        const result = await generateText({
            model: google(geminiModel),
            prompt: message,
        });
        const text = result.text;
        const promptTokens = estimateTokenCount(message);
        const completionTokens = estimateTokenCount(text);
        return {
            content: text,
            tokens: {
                prompt: promptTokens,
                completion: completionTokens,
                total: promptTokens + completionTokens
            },
            model
        };
    }
    catch (error) {
        throw new Error(`Gemini API Error: ${error.message}`);
    }
}
function getGeminiModel(model) {
    switch (model) {
        case 'gemini-2.5-flash':
            return 'gemini-2.5-flash';
        case 'gemini-2.5-pro':
            return 'gemini-1.5-pro';
        default:
            throw new Error(`Unsupported Gemini model: ${model}`);
    }
}
function estimateTokenCount(text) {
    return Math.ceil(text.length / 4);
}
