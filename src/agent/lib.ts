import { google } from "@ai-sdk/google";
import { embed } from "ai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { saveConversation } from "../db/actions.js";

interface ChunkOptions {
    chunkSize?: number;
    chunkOverlap?: number;
    separators?: string[];
}

export async function storeConverstaion(userId: string, userMessage: string, agentMessage: string) {
    const textToEmbed = `User: ${userMessage}\nAgent: ${agentMessage}`
    let embeddings = await genereteEmbeddings(textToEmbed) 
    saveConversation(userId, userMessage, agentMessage, embeddings)

}

async function generateChunks(
    text: string,
    options: ChunkOptions = {}
): Promise<string[]> {
    const {
        chunkSize = 500,
        chunkOverlap = 50,
        separators = ["\n\n", "\n", " ", ""]
    } = options;

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize,
        chunkOverlap,
        separators
    });

    const chunks = await splitter.splitText(text);
    return chunks;
}


async function genereteEmbeddings(value: string): Promise<any> {
    const { embedding } = await embed({
        model: google.textEmbeddingModel('text-embedding-004'),
        value: value,
    });

    return embedding;

}