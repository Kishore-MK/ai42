import { pgTable, text, timestamp, uuid, vector } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  createdAt: timestamp('created_at').defaultNow()
})

export const conversations = pgTable('conversations', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  userMessage: text('user_message').notNull(),
  agentMessage: text('agent_message').notNull(),
  embedding: vector('embedding', { dimensions: 768 }),
  createdAt: timestamp('created_at').defaultNow()
})

export const documents = pgTable('documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  content: text('content').notNull(),
  embedding: vector('embedding', { dimensions:  768 }),
  metadata: text('metadata'),
  createdAt: timestamp('created_at').defaultNow()
})