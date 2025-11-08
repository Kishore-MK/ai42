import { boolean, integer, numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
// export const users = pgTable('users', {
//   id: uuid('id').defaultRandom().primaryKey(),
//   createdAt: timestamp('created_at').defaultNow()
// })
// export const conversations = pgTable('conversations', {
//   id: uuid('id').defaultRandom().primaryKey(),
//   userId: uuid('user_id').references(() => users.id),
//   userMessage: text('user_message').notNull(),
//   agentMessage: text('agent_message').notNull(),
//   embedding: vector('embedding', { dimensions: 768 }),
//   createdAt: timestamp('created_at').defaultNow()
// })
export const payments = pgTable('payments', {
    id: uuid('id').defaultRandom().primaryKey(),
    walletAddress: text('wallet_address').notNull(),
    amount: numeric('amount').notNull(),
    timestamp: timestamp('timestamp').defaultNow().notNull(),
    status: text('status').notNull(),
    modelUsed: text('model_used').notNull(),
    tokensUsed: integer('tokens_used').notNull(),
    cacheHit: boolean('cache_hit').notNull()
});
