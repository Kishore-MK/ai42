import { db } from './index.js'
import { conversations, users } from './schema.js'
import { eq, desc } from 'drizzle-orm'
import { sql } from 'drizzle-orm'



export async function searchSimilar(userId: string, queryEmbedding: number[], limit = 5) {
  return await db.execute(sql`
    SELECT * FROM conversations
    WHERE user_id = ${userId}
    ORDER BY embedding <-> ${JSON.stringify(queryEmbedding)}::vector
    LIMIT ${limit}
  `)
}


export async function getRecentConversations(userId: string, limit = 10) {
  return await db
    .select()
    .from(conversations)
    .where(eq(conversations.userId, userId))
    .orderBy(desc(conversations.createdAt))
    .limit(limit)
}


export async function saveConversation(
  userId: string,
  userMsg: string,
  agentMsg: string,
  embedding: number[]
) {
  await db.insert(conversations).values({
    userId,
    userMessage: userMsg,
    agentMessage: agentMsg,
    embedding
  })
}



export async function createUser() {
  const [newUser] = await db.insert(users)
    .values({})
    .returning()
  
  return newUser.id  
}