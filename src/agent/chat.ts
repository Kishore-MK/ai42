import { google } from '@ai-sdk/google'
import { generateText, ModelMessage } from "ai"
import { storeConverstaion } from './lib.js'
import { getRecentConversations } from '../db/actions.js'

import OpenAI from "openai";

export async function getResponse(message: string, userId: string): Promise<string> {

    const conversations = new Map() // In-memory store
    // Get history
    const dbHistory = await getRecentConversations(userId)

    const history: ModelMessage[] = dbHistory.flatMap(conv => [
        { role: 'user', content: conv.userMessage },
        { role: 'assistant', content: conv.agentMessage }
    ])

    console.log("History", history);

    const client = new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: "https://api.groq.com/openai/v1",
    });

    const result = await client.responses.create({
        model: "openai/gpt-oss-20b",
        input: message,
    });
    console.log(result.output_text);


    // const result = await generateText({
    //     model: google('gemini-2.5-flash'),
    //     tools: {
    //         google_search: google.tools.googleSearch({}),
    //     },
    //     messages: [
    //         ...history,
    //         { role: 'user', content: message }
    //     ]
    // })


    await storeConverstaion(userId, message, result.output_text)


    return result.output_text;
}