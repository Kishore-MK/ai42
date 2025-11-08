import { db } from './index.js';
import { payments } from './schema.js';
import { eq, desc } from 'drizzle-orm';
// export async function searchSimilar(userId: string, queryEmbedding: number[], limit = 5) {
//   return await db.execute(sql`
//     SELECT * FROM conversations
//     WHERE user_id = ${userId}
//     ORDER BY embedding <-> ${JSON.stringify(queryEmbedding)}::vector
//     LIMIT ${limit}
//   `)
// }
export async function getRecentPayments(wallet_address, limit = 10) {
    return await db
        .select()
        .from(payments)
        .where(eq(payments.walletAddress, wallet_address))
        .orderBy(desc(payments.timestamp))
        .limit(limit);
}
export async function savePayment(transactionHash, walletAddress, amount, status, modelUsed, tokensUsed, cacheHit) {
    await db.insert(payments).values({
        walletAddress,
        amount,
        status,
        modelUsed,
        tokensUsed,
        cacheHit,
    });
}
// export async function createUser() {
//   const [newUser] = await db.insert(users)
//     .values({})
//     .returning()
//   return newUser.id  
// }
